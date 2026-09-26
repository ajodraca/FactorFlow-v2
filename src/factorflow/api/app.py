"""The FastAPI application factory: lifespan, middleware, routing, static mount.

Component design: `component-design-ingestion-api.md` sections 2.1, 2.5;
task plan T017-T020. The factory itself does not bind a socket -- binding is
`app_main.py`'s job (T021) -- so it can be constructed directly by tests
(`TestClient`) without opening a port.
"""

import asyncio
import contextvars
import logging
import uuid
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from psycopg_pool import ConnectionPool
from starlette.responses import FileResponse

from factorflow.api.errors import error_response, internal_error_handler
from factorflow.api.routes import health, instruments, runs, settings
from factorflow.config.settings import DatabaseSettings, RunSettings, configure_logging
from factorflow.runs.reclaim import reclaim_stale_runs

# Owner-confirmed reclaim loop cadence (5 seconds).  Injectable via
# `_run_reclaim_loop`'s `interval_seconds` parameter in tests; this module-
# level constant is the production default per the open gap recorded in the
# task plan (no design artifact has adopted this value yet, so it is kept
# locally injectable rather than promoted to RunSettings).
_reclaim_interval_seconds: float = 5.0

_STATIC_DIR = Path(__file__).parent / "static"

# Bound by the request-id middleware for the duration of one request, and
# read by `_install_request_id_patch`'s `Handler.handle` wrapper so every
# log record emitted while handling it -- regardless of which logger or
# module emits it -- carries the same id, per DAC-E1-S6-5. A `ContextVar`
# rather than a module-level variable is what makes this safe under
# concurrent requests: each request's task gets its own view of the
# variable.
_request_id_var: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "request_id", default=None
)


def _install_request_id_patch() -> None:
    """Stamp every emitted log record with the current request id, if set.

    A `logging.Filter` attached to a `Logger` (root included) is *not*
    sufficient here: per `factorflow.config.settings.configure_logging`'s
    own docstring, a `Logger`'s filters apply only to records logged
    directly on that logger, never to ones a descendant passes up during
    propagation -- so a filter on root would silently miss every record
    from a module logger with its own handler, and would miss records on a
    module logger with no handler of its own too, since propagation runs
    the record through root's *handlers*, not root's filters. The same
    module solves this for credential redaction by patching
    `logging.Handler.handle` at the class level, once. This function
    follows the same strategy, but it must compose with that patch rather
    than collide with it.

    IR-001: an earlier version of this function shared `configure_logging`'s
    `_unfiltered_handle` sentinel to look up "the original" `Handler.handle`.
    Whichever of the two patches installs second reads that sentinel and
    finds the *pristine* original -- not the other patch's wrapper -- and
    reassigns `Handler.handle` to wrap the pristine original again. The
    first patch's wrapper is then unreachable: nothing calls it any more,
    silently disabling credential redaction (or request-id stamping,
    depending on install order). The two effects must compose regardless of
    order, so this function stores its own baseline under a distinct
    sentinel (`_request_id_unstamped_handle`) and always wraps whatever
    `Handler.handle` currently is -- `configure_logging`'s wrapper if that
    ran first, the class default otherwise -- rather than reaching past it.

    Idempotent: calling it more than once re-wraps from this function's own
    stored baseline rather than double-wrapping.
    """
    baseline = getattr(logging.Handler, "_request_id_unstamped_handle", None)
    if baseline is None:
        baseline = logging.Handler.handle
        logging.Handler._request_id_unstamped_handle = baseline  # type: ignore[attr-defined]

    def _stamped_handle(self: logging.Handler, record: logging.LogRecord) -> bool:
        request_id = _request_id_var.get()
        if request_id is not None and not hasattr(record, "request_id"):
            record.request_id = request_id
        return baseline(self, record)

    logging.Handler.handle = _stamped_handle  # type: ignore[method-assign]


async def _run_reclaim_loop(
    pool: "ConnectionPool[Any]",
    stale_after_seconds: float,
    interval_seconds: float = _reclaim_interval_seconds,
    wait_fn: Callable[[float], Any] | None = None,
    dispatch_fn: Callable[..., Any] | None = None,
    stop_event: asyncio.Event | None = None,
) -> None:
    """Run the periodic reclaim sweep in the application container.

    Dispatches the synchronous pool checkout and reclaim work off the event
    loop via ``asyncio.to_thread`` (or an injected dispatcher double in tests),
    then waits ``interval_seconds`` before the next sweep.

    Args:
        pool: The application connection pool (opened before this task starts).
        stale_after_seconds: Passed to ``reclaim_stale_runs``; comes from
            ``RunSettings.stale_after_seconds``.
        interval_seconds: Delay between sweeps (owner-confirmed 5 s).
            Injectable for tests.
        wait_fn: Async callable that sleeps for the given number of seconds.
            Defaults to ``asyncio.sleep``.
        dispatch_fn: Async callable used to run synchronous work off the event
            loop.  Signature: ``dispatch_fn(fn, *args) -> awaitable``.
            Defaults to ``asyncio.to_thread``.
        stop_event: When set, the loop exits after the current iteration.
            Used by tests to limit the number of iterations.
    """
    _wait = wait_fn if wait_fn is not None else asyncio.sleep
    _dispatch = dispatch_fn if dispatch_fn is not None else asyncio.to_thread

    def _do_sweep() -> list[Any]:
        with pool.connection() as conn:
            reclaimed = reclaim_stale_runs(conn, stale_after_seconds)
            conn.commit()
            return reclaimed

    while True:
        try:
            await _dispatch(_do_sweep)
        except Exception:
            # Log but do not crash the loop; a failed sweep is not fatal.
            logging.getLogger(__name__).exception("reclaim sweep failed")

        if stop_event is not None and stop_event.is_set():
            break

        await _wait(interval_seconds)

        if stop_event is not None and stop_event.is_set():
            break


@asynccontextmanager
async def _lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Open the connection pool on startup, close it on shutdown (T018).

    No design document names the exact module constructing this pool
    (task plan Notes); this places it here, the idiomatic FastAPI location
    for a process-wide resource with a startup/shutdown hook, and stores it
    on `app.state` so `health.py` and every later route can reach it
    without importing `app.py` directly.
    """
    # IR-001: `configure_logging()` (CAP-001-E1-S3) was never called in this
    # process before this story. It must run here, in the API process's own
    # startup, for AC-13's redaction guarantee to hold at all -- and before
    # `_install_request_id_patch()` so the composition is exercised the same
    # way in every environment that constructs this app (tests included),
    # not left to depend on which happens to run first.
    configure_logging()
    _install_request_id_patch()

    db_settings = DatabaseSettings()  # type: ignore[call-arg]
    pool = ConnectionPool(
        conninfo=db_settings.url.get_secret_value(),
        min_size=db_settings.pool_min,
        max_size=db_settings.pool_max,
        open=False,
    )
    pool.open()
    app.state.db_pool = pool

    run_settings = RunSettings()
    reclaim_task = asyncio.create_task(
        _run_reclaim_loop(
            pool=pool,
            stale_after_seconds=run_settings.stale_after_seconds,
            interval_seconds=_reclaim_interval_seconds,
        )
    )
    try:
        yield
    finally:
        reclaim_task.cancel()
        try:
            await reclaim_task
        except asyncio.CancelledError:
            pass
        pool.close()


def _add_request_id_middleware(app: FastAPI) -> None:
    """T005, T020: generate a UUID per request, bind it for logging, echo it back.

    Bound into `_request_id_var` for the duration of the request so every
    log record emitted while handling it carries the id
    (`_install_request_id_patch`'s `Handler.handle` wrapper), included as
    the `X-Request-Id` response header on every response, and passed to the
    error envelope (`errors.py`) on any non-2xx response via
    `request.state.request_id`.
    """

    @app.middleware("http")
    async def request_id_middleware(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        token = _request_id_var.set(request_id)
        try:
            response = await call_next(request)
        finally:
            _request_id_var.reset(token)
        response.headers["X-Request-Id"] = request_id
        return response


def _add_static_mount(app: FastAPI) -> None:
    """T011, T019: mount the built frontend bundle with an SPA fallback.

    Component design section 2.5: `StaticFiles` at `/`, after the `/api`
    routes, with unmatched non-API paths falling back to `index.html` for
    client-side routing, and unmatched `/api` paths returning the
    `not_found` error envelope rather than falling through to the bundle.
    """

    @app.exception_handler(404)
    async def not_found_handler(request: Request, _exc: Exception) -> Response:
        if request.url.path.startswith("/api"):
            request_id = getattr(request.state, "request_id", "unknown")
            return error_response(
                status_code=404,
                code="not_found",
                message="No resource exists at this path.",
                request_id=request_id,
            )

        index_html = _STATIC_DIR / "index.html"
        if index_html.exists():
            return FileResponse(index_html)

        # No frontend bundle exists on this branch yet (task plan Notes:
        # "No frontend bundle exists yet"). Falling back to a 404 here,
        # rather than raising, keeps the SPA-fallback *behavior* testable
        # before a build is ever produced.
        return Response(status_code=404)

    if _STATIC_DIR.exists():
        app.mount("/", StaticFiles(directory=_STATIC_DIR, html=True), name="static")


_VALIDATION_ERROR_RESOURCES = {
    "/api/instruments": "instruments",
    "/api/settings/history-depth": "settings",
    "/api/acquisition-runs": "acquisition-run",
}


def _resource_for_path(path: str) -> str:
    """The envelope's `resource` for a request path this handler sees.

    This handler is registered application-wide (`create_app`), so it
    cannot hard-code one resource name (IR-001, adversarial review v1):
    a `422` from `/api/settings/history-depth` must not claim to be about
    `instruments`. `/api/instruments/{symbol}` is matched by prefix since
    a validation error on that path (e.g. a malformed path parameter)
    still concerns the instruments resource. Falls back to the path's own
    first segment for any route this story does not own, so a future
    route never silently reports someone else's resource name.
    """
    for known_path, resource in _VALIDATION_ERROR_RESOURCES.items():
        if path == known_path or path.startswith(known_path + "/"):
            return resource
    return path.strip("/").split("/")[-1] or "request"


async def _validation_error_handler(request: Request, exc: Exception) -> Response:
    """Map FastAPI's default `422` body to the shared error envelope.

    CAP-001-E2-S3: every non-2xx response from `instruments.py` and
    `settings.py` must carry the envelope (DAC-E2-S3-3), including request
    validation failures FastAPI raises before a route body ever runs.
    """
    request_id = getattr(request.state, "request_id", "unknown")
    return error_response(
        status_code=422,
        code="validation_error",
        message="The request did not match the expected shape.",
        request_id=request_id,
        resource=_resource_for_path(request.url.path),
    )


def create_app() -> FastAPI:
    """Construct the application: no default dependencies, so no route
    inherits an auth requirement (DAC-E1-S6-6).
    """
    app = FastAPI(lifespan=_lifespan)

    app.add_exception_handler(Exception, internal_error_handler)
    app.add_exception_handler(RequestValidationError, _validation_error_handler)

    app.include_router(health.router)
    app.include_router(instruments.router)
    app.include_router(settings.router)
    app.include_router(runs.router)

    _add_request_id_middleware(app)
    _add_static_mount(app)

    return app
