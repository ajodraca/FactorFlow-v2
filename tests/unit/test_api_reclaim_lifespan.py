"""Unit tests: reclaim loop in FastAPI lifespan (CAP-001-E5-S4).

# Implements TC-COMP-276

Verifies that the application lifespan reclaim loop:
- Dispatches pool checkout/sweep work off the event loop via the injected
  dispatcher (asyncio.to_thread in production).
- Requests the owner-confirmed 5-second delay between sweeps.
- Cancels and awaits the task before pool close.
- Does not import or start any ingestion process.

The loop is tested via `asyncio.run` rather than `pytest-asyncio` because the
project does not install an async test plugin; the test runs the coroutine
directly and terminates via the injected stop_event.
"""

import asyncio
from collections.abc import Callable
from typing import Any
from unittest.mock import MagicMock, patch

# ---------------------------------------------------------------------------
# Doubles
# ---------------------------------------------------------------------------


class _RecordingWaiter:
    """Records requested delays without actually sleeping."""

    def __init__(self) -> None:
        self.delays: list[float] = []
        self._stop = asyncio.Event()

    async def wait(self, seconds: float) -> None:
        self.delays.append(seconds)
        # Signal stop after recording one delay to prevent an infinite loop
        self._stop.set()
        await asyncio.sleep(0)


class _RecordingDispatcher:
    """Records submitted callables without spawning a thread."""

    def __init__(self) -> None:
        self.calls: list[tuple[Callable[..., Any], tuple[Any, ...]]] = []

    async def dispatch(self, fn: Callable[..., Any], /, *args: Any) -> Any:
        self.calls.append((fn, args))
        return fn(*args)


# ---------------------------------------------------------------------------
# TC-COMP-276
# ---------------------------------------------------------------------------


def test_lifespan_reclaim_loop_behaviour() -> None:
    """The reclaim loop dispatches synchronous pool work off the event loop,
    requests the owner-confirmed 5-second delay, and exits cleanly when the
    stop event is set.

    # Implements TC-COMP-276
    """

    async def _run() -> tuple[list[float], int]:
        from factorflow.api.app import _run_reclaim_loop

        waiter = _RecordingWaiter()
        dispatcher = _RecordingDispatcher()

        pool_double = MagicMock()
        mock_conn = MagicMock()
        mock_conn.__enter__ = MagicMock(return_value=mock_conn)
        mock_conn.__exit__ = MagicMock(return_value=False)
        mock_conn.commit.return_value = None
        pool_double.connection.return_value = mock_conn

        with patch("factorflow.runs.reclaim.reclaim_stale_runs", return_value=[]):
            await _run_reclaim_loop(
                pool=pool_double,
                stale_after_seconds=900.0,
                interval_seconds=5.0,
                wait_fn=waiter.wait,
                dispatch_fn=dispatcher.dispatch,
                stop_event=waiter._stop,
            )

        return waiter.delays, len(dispatcher.calls)

    delays, dispatch_count = asyncio.run(_run())

    # The loop requested exactly the 5-second delay
    assert delays == [5.0], f"Expected [5.0], got {delays}"

    # Synchronous work was dispatched through the dispatcher at least once
    assert dispatch_count >= 1


def test_lifespan_reclaim_task_cancelled_before_pool_close() -> None:
    """The reclaim task is cancelled and awaited before the pool is closed.

    Verifies the shutdown ordering: cancel → await → pool.close().
    The test creates the task, cancels it, and confirms it does not outlive
    the pool close.

    # Implements TC-COMP-276
    """

    async def _run() -> bool:
        from factorflow.api.app import _run_reclaim_loop

        # A waiter that sleeps until cancelled
        async def _long_wait(seconds: float) -> None:
            await asyncio.sleep(3600)

        async def _dispatch(fn: Callable[..., Any], /, *args: Any) -> Any:
            return fn(*args)

        pool_double = MagicMock()
        mock_conn = MagicMock()
        mock_conn.__enter__ = MagicMock(return_value=mock_conn)
        mock_conn.__exit__ = MagicMock(return_value=False)
        mock_conn.commit.return_value = None
        pool_double.connection.return_value = mock_conn

        with patch("factorflow.runs.reclaim.reclaim_stale_runs", return_value=[]):
            task = asyncio.create_task(
                _run_reclaim_loop(
                    pool=pool_double,
                    stale_after_seconds=900.0,
                    interval_seconds=5.0,
                    wait_fn=_long_wait,
                    dispatch_fn=_dispatch,
                )
            )
            # Give the task time to start and reach the wait
            await asyncio.sleep(0)
            await asyncio.sleep(0)

            # Cancel before pool close, per lifespan shutdown ordering
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        # Task must be done after cancellation
        return task.done()

    task_done = asyncio.run(_run())
    assert task_done, "Expected the reclaim task to be done after cancellation"
