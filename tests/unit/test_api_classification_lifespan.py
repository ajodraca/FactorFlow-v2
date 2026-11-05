"""The classification scheduler task in the API lifespan (CAP-002-E3-S6).

Covers DAC-E3-S6-1 (the task is created beside the reclaim task and both are
cancelled on shutdown) and DAC-E3-S6-2 (the loop is called with the pool and
``ClassificationSettings()``). Doubles are injected by monkeypatching module
attributes of ``factorflow.api.app`` and the ``FACTORFLOW_CLASSIFICATION_*``
environment, never through a parameter of ``_lifespan`` (DEC-0142). The real
``_lifespan`` runs under ``asyncio.run``: the project installs no async test
plugin, as ``test_api_reclaim_lifespan.py`` records.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import pytest
from fastapi import FastAPI

import factorflow.api.app as app_module
from factorflow.classification.settings import ClassificationSettings
from factorflow.config.settings import ConfigurationError


class _RecordingPool:
    """Stands in for ``ConnectionPool``; records open and close in order."""

    events: list[str]

    def __init__(self, **_kwargs: Any) -> None:
        pass

    def open(self) -> None:
        self.events.append("pool:open")

    def close(self) -> None:
        self.events.append("pool:close")


def _sleeping_loop(name: str, events: list[str]) -> Any:
    async def _loop(**_kwargs: Any) -> None:
        events.append(f"{name}:start")
        try:
            await asyncio.Event().wait()
        except asyncio.CancelledError:
            events.append(f"{name}:cancelled")
            raise

    return _loop


@pytest.fixture(autouse=True)
def _database_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")


@pytest.fixture
def events(monkeypatch: pytest.MonkeyPatch) -> list[str]:
    recorded: list[str] = []
    pool_cls = type("_Pool", (_RecordingPool,), {"events": recorded})
    monkeypatch.setattr(app_module, "ConnectionPool", pool_cls)
    monkeypatch.setattr(app_module, "_run_reclaim_loop", _sleeping_loop("reclaim", recorded))
    monkeypatch.setattr(
        app_module,
        "run_classification_loop",
        _sleeping_loop("classification", recorded),
        raising=True,
    )
    return recorded


async def _enter_and_leave(extra_ticks: int = 2) -> FastAPI:
    app = FastAPI()
    async with app_module._lifespan(app):
        for _ in range(extra_ticks):
            await asyncio.sleep(0)
    return app


def test_classification_task_created_beside_reclaim_task(events: list[str]) -> None:
    """# Implements TC-COMP-086 (DAC-E3-S6-1): both tasks start after the pool opens."""
    seen: list[str] = []

    async def scenario() -> None:
        async with app_module._lifespan(FastAPI()):
            await asyncio.sleep(0)
            await asyncio.sleep(0)
            seen.extend(events)

    asyncio.run(scenario())

    assert "reclaim:start" in seen
    assert "classification:start" in seen
    assert seen.index("pool:open") < seen.index("reclaim:start")
    assert seen.index("pool:open") < seen.index("classification:start")
    # The classification task is created after the reclaim task (design 2.3, plan T007 (3)).
    assert seen.index("reclaim:start") < seen.index("classification:start")


def test_both_tasks_cancelled_before_pool_close(events: list[str]) -> None:
    """# Implements TC-COMP-086 (DAC-E3-S6-1): cancel and await precede ``pool.close()``."""
    asyncio.run(_enter_and_leave())

    assert "classification:cancelled" in events
    assert "reclaim:cancelled" in events
    assert events.index("classification:cancelled") < events.index("pool:close")
    assert events.index("reclaim:cancelled") < events.index("pool:close")
    # Cancellation order: classification, then reclaim, then the pool (design 2.3, plan T007 (4)).
    assert events.index("classification:cancelled") < events.index("reclaim:cancelled")


def test_reclaim_cancelled_when_classification_task_already_finished(
    monkeypatch: pytest.MonkeyPatch, events: list[str]
) -> None:
    """# Implements TC-COMP-086: a classification loop that returns at once leaves a clean exit."""

    async def _returns_at_once(**_kwargs: Any) -> None:
        return None

    monkeypatch.setattr(app_module, "run_classification_loop", _returns_at_once)

    asyncio.run(_enter_and_leave())

    assert "reclaim:cancelled" in events
    assert events.index("reclaim:cancelled") < events.index("pool:close")


def test_reclaim_cancelled_and_pool_closed_when_classification_task_raised(
    monkeypatch: pytest.MonkeyPatch, events: list[str], caplog: pytest.LogCaptureFixture
) -> None:
    """# Implements TC-COMP-086 (Open Gap 6): an error already ended in the task is logged once.

    The unchanged reclaim block and ``pool.close()`` still run, and the exit is clean.
    """
    boom = RuntimeError("start-up reclaim failed")

    async def _raising_loop(**_kwargs: Any) -> None:
        raise boom

    monkeypatch.setattr(app_module, "run_classification_loop", _raising_loop)
    caplog.set_level(logging.ERROR)

    asyncio.run(_enter_and_leave())

    assert "reclaim:cancelled" in events
    assert "pool:close" in events
    assert events.index("reclaim:cancelled") < events.index("pool:close")
    errors = [r for r in caplog.records if r.levelno >= logging.ERROR]
    assert len(errors) == 1
    assert errors[0].name == "factorflow.api.app"
    assert errors[0].getMessage() == "classification scheduler task ended with an error"
    # The redaction filter (AC-13) scrubs the traceback into `exc_text` and clears `exc_info`
    # on every record (DEC-0282), so the logged exception is read from `exc_text`.
    assert errors[0].exc_text is not None
    assert "RuntimeError: start-up reclaim failed" in errors[0].exc_text


def test_loop_called_with_pool_and_environment_settings(
    monkeypatch: pytest.MonkeyPatch, events: list[str]
) -> None:
    """# Implements TC-COMP-087 (DAC-E3-S6-2): keyword ``pool`` and ``settings``, nothing else."""
    monkeypatch.setenv("FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS", "7")
    monkeypatch.setenv("FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS", "120")
    calls: list[dict[str, Any]] = []
    sleeper = _sleeping_loop("classification", events)

    async def _recording_loop(**kwargs: Any) -> None:
        calls.append(dict(kwargs))
        await sleeper(**kwargs)

    monkeypatch.setattr(app_module, "run_classification_loop", _recording_loop)
    holder: dict[str, Any] = {}

    async def scenario() -> None:
        app = FastAPI()
        async with app_module._lifespan(app):
            await asyncio.sleep(0)
            await asyncio.sleep(0)
            holder["pool"] = app.state.db_pool

    asyncio.run(scenario())

    assert len(calls) == 1
    assert set(calls[0]) == {"pool", "settings"}
    assert calls[0]["pool"] is holder["pool"]
    settings = calls[0]["settings"]
    assert isinstance(settings, ClassificationSettings)
    assert settings == ClassificationSettings()
    assert settings.poll_interval_seconds == 7.0
    assert settings.build_timeout_seconds == 120.0


def test_invalid_classification_settings_fail_startup_before_any_task(
    monkeypatch: pytest.MonkeyPatch, events: list[str]
) -> None:
    """# Implements TC-COMP-087 (DAC-E3-S6-2): a bad value fails startup, naming the variable."""
    monkeypatch.setenv("FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS", "0")

    with pytest.raises(ConfigurationError) as excinfo:
        asyncio.run(_enter_and_leave())

    message = str(excinfo.value)
    assert "FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS" in message
    # The message names the variable and never the submitted value (DAC-E1-7, plan T006).
    assert "0" not in message.replace("FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS", "")
    assert "reclaim:start" not in events
    assert "classification:start" not in events
