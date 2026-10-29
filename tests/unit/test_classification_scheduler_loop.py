"""Unit tests: the classification scheduler loop and its build handoff (CAP-002-E2-S9).

Implements TC-COMP-083, TC-COMP-084, TC-COMP-085 and TC-COMP-169, and the design section 7
row "Unresolved line items are warned" (component-design-classification-scheduler.md).

The loop runs under ``asyncio.run`` with injected ``wait_fn``, ``dispatch_fn`` and
``stop_event``, as ``tests/unit/test_api_reclaim_lifespan.py`` tests the reclaim loop: the
project installs no async test plugin. The loop looks up ``claim_next_set``,
``build_claimed_set`` and ``reclaim_interrupted_sets`` as module globals at call time, so
the tests substitute them with ``monkeypatch.setattr(scheduler, name, fake)``.
"""

import ast
import asyncio
import logging
import subprocess
import sys
import threading
from collections.abc import Callable
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock
from uuid import UUID, uuid4

import pytest

import factorflow
from factorflow.classification import line_items, scheduler
from factorflow.classification.engine import BuildResult
from factorflow.classification.scheduler import ClaimedSet
from factorflow.classification.settings import ClassificationSettings

LOGGER = "factorflow.classification.scheduler"
CLASSIFICATION_PREFIX = "factorflow.classification"

# ---------------------------------------------------------------------------
# Doubles
# ---------------------------------------------------------------------------


class _Runaway(BaseException):
    """Raised by a double when the loop never stops; escapes ``except Exception``."""


class _RecordingWaiter:
    """Records requested delays and sets ``stop`` after ``stop_after`` waits."""

    def __init__(self, stop_after: int | None = 1) -> None:
        self.delays: list[float] = []
        self.stop = asyncio.Event()
        self._stop_after = stop_after

    async def wait(self, seconds: float) -> None:
        self.delays.append(seconds)
        if len(self.delays) > 20:
            raise _Runaway("the loop kept waiting")
        if self._stop_after is not None and len(self.delays) >= self._stop_after:
            self.stop.set()
        await asyncio.sleep(0)


class _RecordingDispatcher:
    """Records ``(fn, args)`` in order and runs ``fn(*args)`` synchronously."""

    def __init__(self) -> None:
        self.calls: list[tuple[Callable[..., Any], tuple[Any, ...]]] = []

    async def dispatch(self, fn: Callable[..., Any], /, *args: Any) -> Any:
        self.calls.append((fn, args))
        if len(self.calls) > 50:
            raise _Runaway("the loop kept dispatching")
        return fn(*args)

    @property
    def fns(self) -> list[Callable[..., Any]]:
        return [fn for fn, _ in self.calls]


def _settings(poll: float = 5.0, timeout: float = 300.0) -> ClassificationSettings:
    return ClassificationSettings(poll_interval_seconds=poll, build_timeout_seconds=timeout)


def _scripted(*outcomes: object, stop: asyncio.Event | None = None) -> Callable[[Any], Any]:
    """A claim fake returning, or raising, each outcome in order; None once exhausted.

    When ``stop`` is given it is set on the first exhausted call, so the loop ends at its
    stop check after that idle claim without needing a wait.
    """
    remaining = list(outcomes)

    def claim(pool: Any) -> Any:
        if not remaining:
            if stop is not None:
                stop.set()
            return None
        outcome = remaining.pop(0)
        if isinstance(outcome, BaseException):
            raise outcome
        return outcome

    return claim


def _result(state: str, set_id: UUID | None = None) -> BuildResult:
    return BuildResult(
        set_id=set_id or uuid4(),
        state=state,
        failure_reason=None if state == "complete" else "RuntimeError: boom",
        active_instruments=1 if state == "complete" else 0,
        qualified_counts={},
    )


def _claimed() -> ClaimedSet:
    return ClaimedSet(set_id=uuid4(), run_id=uuid4())


class _Fakes:
    """The three scheduler globals the loop dispatches, substituted for one test."""

    def __init__(
        self,
        monkeypatch: pytest.MonkeyPatch,
        claim: Callable[[Any], Any],
        build: Callable[..., Any] | None = None,
    ) -> None:
        self.reclaim_calls: list[Any] = []
        self.builds: list[tuple[Any, ...]] = []
        self.claim = claim
        self._build_impl = build

        def reclaim(pool: Any) -> list[Any]:
            self.reclaim_calls.append(pool)
            return []

        def build_claimed_set(pool: Any, set_id: UUID, timeout_seconds: float) -> Any:
            self.builds.append((pool, set_id, timeout_seconds))
            if self._build_impl is not None:
                return self._build_impl(pool, set_id, timeout_seconds)
            return _result("complete", set_id)

        self.reclaim = reclaim
        self.build = build_claimed_set
        monkeypatch.setattr(scheduler, "reclaim_interrupted_sets", reclaim)
        monkeypatch.setattr(scheduler, "claim_next_set", claim)
        monkeypatch.setattr(scheduler, "build_claimed_set", build_claimed_set)
        monkeypatch.setattr(line_items, "unresolved", lambda: [])


def _run_loop(
    pool: Any,
    settings: ClassificationSettings,
    waiter: _RecordingWaiter,
    dispatcher: _RecordingDispatcher,
) -> None:
    asyncio.run(
        scheduler.run_classification_loop(
            pool,
            settings,
            wait_fn=waiter.wait,
            dispatch_fn=dispatcher.dispatch,
            stop_event=waiter.stop,
        )
    )


def _scheduler_records(caplog: pytest.LogCaptureFixture, level: int) -> list[logging.LogRecord]:
    return [r for r in caplog.records if r.name == LOGGER and r.levelno == level]


def _traceback(record: logging.LogRecord) -> str:
    """The record's formatted traceback, ``""`` when it carries none.

    Once any test in the process has run ``configure_logging()``, its redacting filter
    formats the traceback into ``exc_text`` and clears ``exc_info``; both forms count.
    """
    if record.exc_info:
        return logging.Formatter().formatException(record.exc_info)
    return record.exc_text or ""


# ---------------------------------------------------------------------------
# TC-COMP-083
# ---------------------------------------------------------------------------


# Implements TC-COMP-083
def test_loop_claims_and_builds_through_the_dispatcher_and_waits_only_when_idle(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E2-S9-1, AC-10, AC-11: claim and build go through the dispatcher, the build
    carries ``build_timeout_seconds``, and the only wait is the poll interval after the
    idle claim: none between the claim, the build and the next claim."""
    claimed = _claimed()
    fakes = _Fakes(monkeypatch, claim=_scripted(claimed))
    pool = MagicMock(name="pool")
    waiter = _RecordingWaiter(stop_after=1)
    dispatcher = _RecordingDispatcher()

    _run_loop(pool, _settings(5.0, 300.0), waiter, dispatcher)

    assert dispatcher.fns == [fakes.reclaim, fakes.claim, fakes.build, fakes.claim]
    assert dispatcher.calls[2] == (fakes.build, (pool, claimed.set_id, 300.0))
    assert fakes.builds == [(pool, claimed.set_id, 300.0)]
    assert waiter.delays == [5.0]
    assert waiter.stop.is_set()


def test_loop_with_nothing_to_claim_waits_the_poll_interval_and_builds_nothing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E2-S9-1, AC-10: an idle first claim dispatches no build and waits the poll
    interval once before the stop event ends the loop."""
    fakes = _Fakes(monkeypatch, claim=_scripted())
    pool = MagicMock(name="pool")
    waiter = _RecordingWaiter(stop_after=1)
    dispatcher = _RecordingDispatcher()

    _run_loop(pool, _settings(5.0, 300.0), waiter, dispatcher)

    assert dispatcher.fns == [fakes.reclaim, fakes.claim]
    assert fakes.builds == []
    assert waiter.delays == [5.0]


# ---------------------------------------------------------------------------
# TC-COMP-084
# ---------------------------------------------------------------------------


# Implements TC-COMP-084
def test_raising_claim_is_logged_with_exception_and_the_loop_continues(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """DAC-E2-S9-2, AC-10, OPS-ERR-001: the failure is logged by ``log.exception``, the
    failed iteration still waits the poll interval, and the next claim is made."""
    boom = RuntimeError("boom")
    waiter = _RecordingWaiter(stop_after=None)
    fakes = _Fakes(monkeypatch, claim=_scripted(boom, stop=waiter.stop))
    dispatcher = _RecordingDispatcher()

    with caplog.at_level(logging.ERROR, logger=LOGGER):
        _run_loop(MagicMock(name="pool"), _settings(5.0, 300.0), waiter, dispatcher)

    errors = _scheduler_records(caplog, logging.ERROR)
    assert len(errors) == 1
    assert errors[0].getMessage() == "classification scheduler iteration failed"
    assert _traceback(errors[0]).startswith("Traceback (most recent call last):")
    assert _traceback(errors[0]).endswith("RuntimeError: boom")
    assert dispatcher.fns == [fakes.reclaim, fakes.claim, fakes.claim]
    assert waiter.delays == [5.0]


def test_raising_build_is_logged_with_exception_and_the_loop_continues(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """DAC-E2-S9-2, AC-10, OPS-ERR-001: a build that raises (the engine could not record
    the failure) is logged the same way, and the loop waits and claims again."""
    disk = OSError("disk")

    def raising_build(pool: Any, set_id: UUID, timeout_seconds: float) -> Any:
        raise disk

    claimed = _claimed()
    waiter = _RecordingWaiter(stop_after=None)
    fakes = _Fakes(monkeypatch, claim=_scripted(claimed, stop=waiter.stop), build=raising_build)
    dispatcher = _RecordingDispatcher()

    with caplog.at_level(logging.ERROR, logger=LOGGER):
        _run_loop(MagicMock(name="pool"), _settings(5.0, 300.0), waiter, dispatcher)

    errors = _scheduler_records(caplog, logging.ERROR)
    assert len(errors) == 1
    assert errors[0].getMessage() == "classification scheduler iteration failed"
    assert _traceback(errors[0]).startswith("Traceback (most recent call last):")
    assert _traceback(errors[0]).endswith("OSError: disk")
    assert dispatcher.fns == [fakes.reclaim, fakes.claim, fakes.build, fakes.claim]
    assert waiter.delays == [5.0]


def test_cancellation_raised_by_the_dispatcher_propagates_out_of_the_loop(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """AC-10: shutdown cancels the task, and ``CancelledError`` is a ``BaseException``,
    so the iteration handler neither swallows nor logs it."""
    fakes = _Fakes(monkeypatch, claim=_scripted())
    waiter = _RecordingWaiter(stop_after=1)

    async def cancelling_dispatch(fn: Callable[..., Any], /, *args: Any) -> Any:
        if fn is fakes.claim:
            raise asyncio.CancelledError
        return fn(*args)

    async def main() -> None:
        with pytest.raises(asyncio.CancelledError):
            await scheduler.run_classification_loop(
                MagicMock(name="pool"),
                _settings(),
                wait_fn=waiter.wait,
                dispatch_fn=cancelling_dispatch,
                stop_event=waiter.stop,
            )

    with caplog.at_level(logging.ERROR, logger=LOGGER):
        asyncio.run(main())

    assert _scheduler_records(caplog, logging.ERROR) == []
    assert waiter.delays == []


# ---------------------------------------------------------------------------
# TC-COMP-169
# ---------------------------------------------------------------------------


# Implements TC-COMP-169
def test_reclaim_is_dispatched_once_before_the_first_claim(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E2-S9-3, DAC-E2-12, AC-20: reclaim comes first, with the pool as its only
    argument, and is never dispatched again across three idle iterations."""
    fakes = _Fakes(monkeypatch, claim=_scripted())
    pool = MagicMock(name="pool")
    waiter = _RecordingWaiter(stop_after=3)
    dispatcher = _RecordingDispatcher()

    _run_loop(pool, _settings(5.0, 300.0), waiter, dispatcher)

    assert dispatcher.calls[0] == (fakes.reclaim, (pool,))
    assert dispatcher.fns.count(fakes.reclaim) == 1
    assert dispatcher.fns == [fakes.reclaim, fakes.claim, fakes.claim, fakes.claim]
    assert fakes.reclaim_calls == [pool]
    assert waiter.delays == [5.0, 5.0, 5.0]


def test_reclaim_runs_even_when_the_stop_event_is_already_set(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E2-S9-3, DAC-E2-12: reclaim at start is unconditional, and a stop event set
    before the loop starts allows one claim iteration and no wait."""
    fakes = _Fakes(monkeypatch, claim=_scripted())
    pool = MagicMock(name="pool")
    waiter = _RecordingWaiter(stop_after=1)
    waiter.stop.set()
    dispatcher = _RecordingDispatcher()

    _run_loop(pool, _settings(5.0, 300.0), waiter, dispatcher)

    assert dispatcher.calls == [(fakes.reclaim, (pool,)), (fakes.claim, (pool,))]
    assert waiter.delays == []


# ---------------------------------------------------------------------------
# Design section 7 rows with no mapped TC
# ---------------------------------------------------------------------------


def test_each_unresolved_line_item_is_warned_once_before_the_first_claim(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """AC-10 (design section 7, "Unresolved line items are warned"): one warning per
    unresolved line item, before the first claim, never repeated on later iterations."""
    warnings_at_first_claim: list[int] = []

    def claim(pool: Any) -> None:
        if not warnings_at_first_claim:
            warnings_at_first_claim.append(len(_scheduler_records(caplog, logging.WARNING)))
        return None

    _Fakes(monkeypatch, claim=claim)
    monkeypatch.setattr(line_items, "unresolved", lambda: ["net_income", "revenue"])
    waiter = _RecordingWaiter(stop_after=2)

    with caplog.at_level(logging.WARNING, logger=LOGGER):
        _run_loop(MagicMock(name="pool"), _settings(), waiter, _RecordingDispatcher())

    messages = [r.getMessage() for r in _scheduler_records(caplog, logging.WARNING)]
    assert messages == [
        "line item net_income has no payload key; its inputs will be missing",
        "line item revenue has no payload key; its inputs will be missing",
    ]
    assert warnings_at_first_claim == [2]
    assert waiter.delays == [5.0, 5.0]


def test_no_warning_when_every_line_item_is_resolved(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """AC-10 (design section 7, "Unresolved line items are warned"): nothing unresolved,
    nothing warned."""
    _Fakes(monkeypatch, claim=_scripted())

    with caplog.at_level(logging.WARNING, logger=LOGGER):
        _run_loop(MagicMock(name="pool"), _settings(), _RecordingWaiter(), _RecordingDispatcher())

    assert _scheduler_records(caplog, logging.WARNING) == []


def test_default_dispatcher_runs_the_database_work_off_the_event_loop_thread(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E2-S9-1, AC-10: with ``dispatch_fn`` omitted, reclaim and claim run on a worker
    thread (``asyncio.to_thread``), never on the thread running the event loop."""
    threads: dict[str, int] = {}

    def claim(pool: Any) -> None:
        threads["claim"] = threading.get_ident()
        return None

    fakes = _Fakes(monkeypatch, claim=claim)

    def reclaim(pool: Any) -> list[Any]:
        threads["reclaim"] = threading.get_ident()
        return []

    monkeypatch.setattr(scheduler, "reclaim_interrupted_sets", reclaim)
    waiter = _RecordingWaiter(stop_after=1)

    asyncio.run(
        scheduler.run_classification_loop(
            MagicMock(name="pool"), _settings(), wait_fn=waiter.wait, stop_event=waiter.stop
        )
    )

    loop_thread = threading.get_ident()  # asyncio.run drives the loop on the calling thread
    assert set(threads) == {"claim", "reclaim"}
    assert threads["claim"] != loop_thread
    assert threads["reclaim"] != loop_thread
    assert fakes.builds == []


def test_default_wait_is_asyncio_sleep_for_the_poll_interval(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E2-S9-1, AC-11: with ``wait_fn`` omitted, an idle iteration awaits
    ``asyncio.sleep(poll_interval_seconds)``; the patched sleep sets the stop event, so no
    real sleep is reached."""
    stop = asyncio.Event()
    slept: list[float] = []
    real_sleep = asyncio.sleep

    async def recording_sleep(seconds: float) -> None:
        slept.append(seconds)
        stop.set()
        await real_sleep(0)

    _Fakes(monkeypatch, claim=_scripted())
    monkeypatch.setattr(asyncio, "sleep", recording_sleep)
    dispatcher = _RecordingDispatcher()

    asyncio.run(
        scheduler.run_classification_loop(
            MagicMock(name="pool"),
            _settings(poll=1.0, timeout=300.0),
            dispatch_fn=dispatcher.dispatch,
            stop_event=stop,
        )
    )

    assert slept == [1.0]


def test_failed_build_is_logged_at_info_without_raising(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """AC-20, AC-10: the engine records the failure itself, so the loop logs the set, the
    run and the state at INFO, logs no error, and looks again at once."""
    claimed = _claimed()

    def failed_build(pool: Any, set_id: UUID, timeout_seconds: float) -> BuildResult:
        return _result("failed", set_id)

    fakes = _Fakes(monkeypatch, claim=_scripted(claimed), build=failed_build)
    dispatcher = _RecordingDispatcher()

    with caplog.at_level(logging.INFO, logger=LOGGER):
        _run_loop(MagicMock(name="pool"), _settings(), _RecordingWaiter(), dispatcher)

    infos = [r.getMessage() for r in _scheduler_records(caplog, logging.INFO)]
    assert infos == [f"classification set {claimed.set_id} for run {claimed.run_id} ended failed"]
    assert _scheduler_records(caplog, logging.ERROR) == []
    assert dispatcher.fns == [fakes.reclaim, fakes.claim, fakes.build, fakes.claim]


# ---------------------------------------------------------------------------
# TC-COMP-085
# ---------------------------------------------------------------------------


def _imported_modules(tree: ast.Module, package: str) -> list[str]:
    """Every module an ``import`` names, relative imports resolved against ``package``."""
    names: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            names.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            base = node.module or ""
            if node.level:
                parent = package.rsplit(".", node.level - 1)[0]
                base = f"{parent}.{base}" if base else parent
            names.append(base)
            names.extend(f"{base}.{alias.name}" for alias in node.names)
    return names


def _under_classification(name: str) -> bool:
    return name == CLASSIFICATION_PREFIX or name.startswith(CLASSIFICATION_PREFIX + ".")


def _loaded_classification_modules(statement: str) -> list[str]:
    code = (
        f"import sys, {statement}; "
        f"print(sorted(m for m in sys.modules if m == {CLASSIFICATION_PREFIX!r} "
        f"or m.startswith({CLASSIFICATION_PREFIX + '.'!r})))"
    )
    completed = subprocess.run(
        [sys.executable, "-I", "-c", code], capture_output=True, text=True, check=True
    )
    loaded: list[str] = ast.literal_eval(completed.stdout.strip())
    return loaded


# Implements TC-COMP-085
def test_ingestion_main_source_imports_nothing_from_classification() -> None:
    """DAC-E2-S9-5, AC-10 (system design constraint 1): no import statement in
    ``factorflow.ingestion_main`` names a module under ``factorflow.classification``."""
    source = Path(factorflow.__file__).parent / "ingestion_main.py"
    tree = ast.parse(source.read_text(), filename=str(source))

    imported = _imported_modules(tree, "factorflow")

    assert imported, "the parse found no imports, so the check would be vacuous"
    assert [name for name in imported if _under_classification(name)] == []


# Implements TC-COMP-085
def test_ingestion_main_loads_no_classification_module_at_runtime() -> None:
    """DAC-E2-S9-5, AC-10: importing ``factorflow.ingestion_main`` in a fresh interpreter
    loads nothing under ``factorflow.classification``, transitively; the same probe sees
    the scheduler when it is imported, so the prefix cannot make the check vacuous."""
    assert _loaded_classification_modules("factorflow.ingestion_main") == []
    assert "factorflow.classification.scheduler" in _loaded_classification_modules(
        "factorflow.classification.scheduler"
    )


# ---------------------------------------------------------------------------
# build_claimed_set
# ---------------------------------------------------------------------------


def _pool_with_one_connection() -> tuple[MagicMock, MagicMock, MagicMock]:
    pool = MagicMock(name="pool")
    checkout = MagicMock(name="checkout")
    conn = MagicMock(name="conn")
    checkout.__enter__.return_value = conn
    checkout.__exit__.return_value = False
    pool.connection.return_value = checkout
    return pool, checkout, conn


def test_build_claimed_set_builds_on_one_checked_out_connection(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """AC-11, AC-20, DAC-E2-S9-4: one connection is checked out for the whole build, the
    timeout reaches ``engine.build`` unchanged, and the engine's result is returned."""
    pool, checkout, conn = _pool_with_one_connection()
    set_id = uuid4()
    expected = _result("complete", set_id)
    calls: list[tuple[Any, ...]] = []

    def build(build_conn: Any, build_set_id: UUID, timeout_seconds: float) -> BuildResult:
        calls.append((build_conn, build_set_id, timeout_seconds, checkout.__exit__.call_count))
        return expected

    monkeypatch.setattr(scheduler.engine, "build", build)

    result = scheduler.build_claimed_set(pool, set_id, 12.5)

    assert result is expected
    pool.connection.assert_called_once_with()
    assert calls == [(conn, set_id, 12.5, 0)]  # built while the connection was held
    checkout.__exit__.assert_called_once_with(None, None, None)


def test_build_claimed_set_releases_the_connection_when_the_build_raises(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """AC-20, DAC-E2-S9-4: an exception from ``engine.build`` propagates to the loop and
    the connection is still returned to the pool."""
    pool, checkout, conn = _pool_with_one_connection()
    lost = OSError("connection lost")

    def build(build_conn: Any, build_set_id: UUID, timeout_seconds: float) -> BuildResult:
        raise lost

    monkeypatch.setattr(scheduler.engine, "build", build)

    with pytest.raises(OSError) as raised:
        scheduler.build_claimed_set(pool, uuid4(), 12.5)

    assert raised.value is lost
    pool.connection.assert_called_once_with()
    checkout.__exit__.assert_called_once()
    assert checkout.__exit__.call_args.args[1] is lost
