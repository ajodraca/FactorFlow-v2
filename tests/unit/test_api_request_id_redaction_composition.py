"""IR-001 regression: request-id stamping and credential redaction compose.

`configure_logging` (CAP-001-E1-S3) and `_install_request_id_patch`
(CAP-001-E1-S6) both patch `logging.Handler.handle` at the class level. An
earlier version of the request-id patch shared `configure_logging`'s
`_unfiltered_handle` sentinel to find "the original" handler method,
which meant whichever patch installed second discarded the other's
wrapper rather than composing with it -- silently disabling credential
redaction in the API process. The two tests below install both patches
directly, in both orders, and assert a record carrying a secret is
emitted both redacted and carrying the request id every time.

IR-201 (v2 review): those two tests call `configure_logging` and
`_install_request_id_patch` directly and never construct the app or enter
its lifespan, so they cannot observe whether the *application* actually
calls `configure_logging()` at startup -- which is the other half of
v1's actual field defect (no call site at all, not just a composition
bug). `test_lifespan_installs_redaction_end_to_end` below closes that gap
by driving a real request through `TestClient(create_app())`, with the
health route monkeypatched to log the secret genuinely from inside
request handling, and asserting the resulting record is both redacted
and carries the request id; deleting the `configure_logging()` call from
`_lifespan` must fail it.
"""

import logging

import pytest
from fastapi.testclient import TestClient

import factorflow.api.app as app_module
import factorflow.api.routes.health as health_module
import factorflow.config.settings as settings_module
from factorflow.api.app import create_app


@pytest.fixture(autouse=True)
def _reset_handler_patches() -> None:
    """`Handler.handle` patches are process-global and idempotent-by-sentinel.

    Each test needs a clean baseline so it observes only its own installs,
    not leftover wrapping from an earlier test in the same process.
    """
    original_handle = logging.Handler.handle
    for attr in ("_unfiltered_handle", "_request_id_unstamped_handle"):
        if hasattr(logging.Handler, attr):
            delattr(logging.Handler, attr)
    yield
    logging.Handler.handle = original_handle
    for attr in ("_unfiltered_handle", "_request_id_unstamped_handle"):
        if hasattr(logging.Handler, attr):
            delattr(logging.Handler, attr)


def _emit_and_capture(secret: str, request_id: str) -> logging.LogRecord:
    records: list[logging.LogRecord] = []

    class _Capture(logging.Handler):
        def emit(self, record: logging.LogRecord) -> None:
            records.append(record)

    logger = logging.getLogger("factorflow.api.test.redaction_composition")
    logger.setLevel(logging.INFO)
    handler = _Capture()
    logger.addHandler(handler)
    try:
        token = app_module._request_id_var.set(request_id)
        try:
            logger.info("leaking %s here", secret)
        finally:
            app_module._request_id_var.reset(token)
    finally:
        logger.removeHandler(handler)

    assert records, "expected exactly one record to have been emitted"
    return records[-1]


def test_redaction_then_request_id_compose(monkeypatch: pytest.MonkeyPatch) -> None:
    secret = "SECRETKEY123"
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", secret)

    settings_module.configure_logging()
    app_module._install_request_id_patch()

    record = _emit_and_capture(secret, "rid-order-a")

    assert secret not in record.getMessage()
    assert record.getMessage() == "leaking [redacted] here"
    assert record.request_id == "rid-order-a"  # type: ignore[attr-defined]


def test_request_id_then_redaction_compose(monkeypatch: pytest.MonkeyPatch) -> None:
    secret = "SECRETKEY456"
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", secret)

    app_module._install_request_id_patch()
    settings_module.configure_logging()

    record = _emit_and_capture(secret, "rid-order-b")

    assert secret not in record.getMessage()
    assert record.getMessage() == "leaking [redacted] here"
    assert record.request_id == "rid-order-b"  # type: ignore[attr-defined]


def test_lifespan_installs_redaction_end_to_end(monkeypatch: pytest.MonkeyPatch) -> None:
    """IR-201: the application's own startup, not a direct patch call, must
    install redaction.

    Constructs the app through `create_app()` and drives a real request
    through `TestClient`, which runs `_lifespan` exactly as the deployed
    process does. The health route (`routes.health.get_health`) is
    monkeypatched to log the secret as its first action, so the record is
    genuinely emitted from *inside* request handling -- standing in for a
    driver exception or a third-party library's debug output, the
    disclosure path v1 actually left open -- rather than after
    `client.get()` has already returned. This also exercises stamping and
    redaction together (IR-202): the record is checked for both the
    redacted message and a request id bound while the middleware's
    `ContextVar` scope is still open. Deleting `configure_logging()` from
    `app.py`'s `_lifespan` fails this test; the two tests above cannot.
    """
    secret = "SECRETKEY789"
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", secret)
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")

    records: list[logging.LogRecord] = []

    class _Capture(logging.Handler):
        def emit(self, record: logging.LogRecord) -> None:
            records.append(record)

    logger = logging.getLogger("factorflow.api.test.lifespan_redaction")
    logger.setLevel(logging.INFO)
    handler = _Capture()
    logger.addHandler(handler)

    original_credential_present = health_module.credential_present

    def _credential_present_that_leaks() -> bool:
        # `get_health` (routes/health.py) calls `credential_present()` as
        # part of handling the request, so logging here runs genuinely
        # inside the request-id middleware's `ContextVar` scope -- the way
        # a caught driver exception or a third-party library's own logger
        # would, rather than after `client.get()` has already returned.
        logger.info("leaking %s here", secret)
        return original_credential_present()

    monkeypatch.setattr(health_module, "credential_present", _credential_present_that_leaks)

    try:
        app = create_app()
        with TestClient(app, base_url="http://127.0.0.1:8000") as client:
            response = client.get("/api/health")
    finally:
        logger.removeHandler(handler)

    assert response.status_code == 200
    assert records, "expected the health route's logger call to emit a record"
    record = records[-1]
    assert secret not in record.getMessage()
    assert record.getMessage() == "leaking [redacted] here"
    assert getattr(record, "request_id", None) == response.headers["x-request-id"]
