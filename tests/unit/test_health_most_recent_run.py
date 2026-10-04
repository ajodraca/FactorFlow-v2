"""`get_health` maps the run-journal read into `most_recent_run`.

CAP-001-E7-S3 task plan T008. Follows `test_health_route_unreachable.py`'s
fake-request pattern: the reachability probe is forced to `True` and both
database reads are stubbed, so these tests pin the route's mapping and its
fallback without a database (AC-18, DAC-E7-S3-1, DEC-0014).
"""

from datetime import UTC, datetime
from unittest.mock import Mock
from uuid import UUID

import psycopg
import pytest
from fastapi import FastAPI
from starlette.requests import Request

from factorflow.api.routes import health
from factorflow.runs.queries import RunRow

_RUN_ID = UUID("0b6c7f0e-3d5a-4c1e-9f7a-1d2e3f4a5b6c")
_REQUESTED_AT = datetime(2026, 9, 5, 22, 0, 0, tzinfo=UTC)
_STARTED_AT = datetime(2026, 9, 5, 22, 0, 5, tzinfo=UTC)
_ENDED_AT = datetime(2026, 9, 5, 22, 14, 3, tzinfo=UTC)


class _FakeConnection:
    def __enter__(self) -> "_FakeConnection":
        return self

    def __exit__(self, *exc_info: object) -> None:
        return None


class _FakePool:
    def connection(self, timeout: float | None = None) -> _FakeConnection:
        return _FakeConnection()


def _fake_request(pool: object) -> Request:
    app = FastAPI()
    app.state.db_pool = pool
    scope = {"type": "http", "app": app, "method": "GET", "path": "/api/health", "headers": []}
    return Request(scope)


@pytest.fixture
def reachable(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(health, "probe_database_reachable", Mock(return_value=True))
    monkeypatch.setattr(health, "probe_schema_version", Mock(return_value=4))


@pytest.mark.usefixtures("reachable")
def test_get_health_maps_the_most_recent_run(monkeypatch: pytest.MonkeyPatch) -> None:
    """Only `run_id`, `state` and `ended_at` are taken from the row, and
    `ended_at` is the row's end, not another timestamp.
    """
    row = RunRow(
        run_id=_RUN_ID,
        state="failed",
        history_depth_years=5,
        requested_at=_REQUESTED_AT,
        started_at=_STARTED_AT,
        ended_at=_ENDED_AT,
        instruments_named=3,
        instruments_written=1,
        instruments_failed=2,
        failure_reason="provider_error",
    )
    monkeypatch.setattr(health, "get_most_recent_run", Mock(return_value=row))

    response = health.get_health(_fake_request(_FakePool()))

    assert response.database == "reachable"
    assert response.most_recent_run is not None
    assert response.most_recent_run.model_dump() == {
        "run_id": _RUN_ID,
        "state": "failed",
        "ended_at": _ENDED_AT,
    }


@pytest.mark.usefixtures("reachable")
def test_get_health_reports_null_when_no_run_is_recorded(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(health, "get_most_recent_run", Mock(return_value=None))

    response = health.get_health(_fake_request(_FakePool()))

    assert response.database == "reachable"
    assert response.schema_version == 4
    assert response.most_recent_run is None


@pytest.mark.usefixtures("reachable")
def test_get_health_degrades_to_unreachable_when_the_run_read_fails(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DEC-0014: a failed run read reports every database-derived field
    null beside `unreachable`, and the route does not raise.
    """
    monkeypatch.setattr(
        health,
        "get_most_recent_run",
        Mock(side_effect=psycopg.OperationalError("connection dropped")),
    )

    response = health.get_health(_fake_request(_FakePool()))

    assert response.database == "unreachable"
    assert response.schema_version is None
    assert response.most_recent_run is None
