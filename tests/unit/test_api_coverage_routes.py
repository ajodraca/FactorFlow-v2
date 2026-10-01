"""Unit tests for `GET /api/coverage` without a database (CAP-001-E6-S3, task plan T013).

`read_coverage` and `read_gap_dates` are replaced with spies returning real
`coverage.service` dataclasses, so the route's registration, field mapping,
parameter pass-through and error mapping are pinned without a container.
"""

from __future__ import annotations

from contextlib import contextmanager
from datetime import UTC, date, datetime
from typing import Any

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.coverage.service import (
    CoverageView,
    GapDetection,
    InstrumentCoverage,
    Presence,
)
from factorflow.instruments.service import InstrumentNotFound

_ROUTES = "factorflow.api.routes.coverage"


class _FakePool:
    @contextmanager
    def connection(self):  # type: ignore[no-untyped-def]
        yield object()


def _client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    app = create_app()
    app.state.db_pool = _FakePool()
    return TestClient(app, raise_server_exceptions=False)


def _row(
    symbol: str = "AAPL",
    *,
    depth_shortfall_years: int | None = None,
    missing_days: int | None = 0,
    covered_from: date | None = date(2024, 1, 2),
    covered_to: date | None = date(2024, 1, 5),
) -> InstrumentCoverage:
    return InstrumentCoverage(
        symbol=symbol,
        lifecycle="active",
        presence={
            "reference": Presence.PRESENT,
            "prices": Presence.PRESENT,
            "fundamentals": Presence.ABSENT,
            "corporate_actions": Presence.UNKNOWN,
        },
        covered_from=covered_from,
        covered_to=covered_to,
        last_acquired_at=datetime(2024, 1, 5, 22, 14, 3, tzinfo=UTC),
        depth_shortfall_years=depth_shortfall_years,
        gaps=GapDetection(available=True, reason=None, missing_days=missing_days),
    )


def _view(*rows: InstrumentCoverage) -> CoverageView:
    return CoverageView(
        never_acquired=False,
        gap_detection=GapDetection(available=True, reason=None, missing_days=7),
        instruments=list(rows),
        next_cursor=None,
    )


class _Spy:
    def __init__(self, result: Any = None, raises: Exception | None = None) -> None:
        self.calls: list[tuple[tuple[Any, ...], dict[str, Any]]] = []
        self._result = result
        self._raises = raises

    def __call__(self, *args: Any, **kwargs: Any) -> Any:
        self.calls.append((args, kwargs))
        if self._raises is not None:
            raise self._raises
        return self._result


def _patch(monkeypatch: pytest.MonkeyPatch, coverage: _Spy, gap_dates: _Spy | None = None) -> _Spy:
    monkeypatch.setattr(f"{_ROUTES}.read_coverage", coverage)
    gap_spy = gap_dates if gap_dates is not None else _Spy(result=[])
    monkeypatch.setattr(f"{_ROUTES}.read_gap_dates", gap_spy)
    return gap_spy


def test_coverage_route_is_registered_with_its_parameters(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    paths = create_app().openapi()["paths"]

    assert "/api/coverage" in paths
    names = {param["name"] for param in paths["/api/coverage"]["get"]["parameters"]}
    assert names == {"symbol", "lifecycle", "from", "to", "limit", "cursor", "expand"}


def test_fields_map_onto_the_contract(monkeypatch: pytest.MonkeyPatch) -> None:
    view = _view(
        _row("AAPL", depth_shortfall_years=None, missing_days=None),
        _row("MSFT", depth_shortfall_years=3, missing_days=0, covered_from=None, covered_to=None),
    )
    _patch(monkeypatch, _Spy(result=view))

    body = _client(monkeypatch).get("/api/coverage").json()

    assert set(body) == {"instruments", "never_acquired", "gap_detection", "next_cursor"}
    aapl, msft = body["instruments"]
    assert aapl["data_types"] == {
        "reference": "present",
        "prices": "present",
        "fundamentals": "absent",
        "corporate_actions": "unknown",
    }
    assert aapl["depth_short_by_years"] is None
    assert msft["depth_short_by_years"] == 3
    assert aapl["gap_count"] is None
    assert msft["gap_count"] == 0
    assert aapl["covered_from"] == "2024-01-02"
    assert aapl["covered_to"] == "2024-01-05"
    assert msft["covered_from"] is None
    assert msft["covered_to"] is None
    assert body["gap_detection"] == {"available": True, "reason": None}


def test_query_passes_through_to_the_service(monkeypatch: pytest.MonkeyPatch) -> None:
    coverage = _Spy(result=_view())
    _patch(monkeypatch, coverage)
    client = _client(monkeypatch)

    resp = client.get(
        "/api/coverage?symbol=AA&lifecycle=retired&from=2024-01-02&to=2024-01-05&limit=7&cursor=X"
    )
    assert resp.status_code == 200, resp.text
    _, kwargs = coverage.calls[-1]
    assert kwargs == {
        "symbol": "AA",
        "lifecycle": "retired",
        "from_date": date(2024, 1, 2),
        "to_date": date(2024, 1, 5),
        "limit": 7,
        "cursor": "X",
    }

    client.get("/api/coverage")
    _, kwargs = coverage.calls[-1]
    assert kwargs["from_date"] is None
    assert kwargs["to_date"] is None


def test_inverted_range_is_rejected_before_the_service(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coverage = _Spy(result=_view())
    _patch(monkeypatch, coverage)

    resp = _client(monkeypatch).get("/api/coverage?from=2024-01-05&to=2024-01-02")

    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "validation_error"
    assert coverage.calls == []


def test_database_failure_is_an_internal_error(monkeypatch: pytest.MonkeyPatch) -> None:
    _patch(monkeypatch, _Spy(raises=psycopg.OperationalError("driver detail xyz")))

    resp = _client(monkeypatch).get("/api/coverage")

    assert resp.status_code == 500
    assert resp.json()["error"]["code"] == "internal_error"
    assert "driver detail xyz" not in resp.text


def test_unknown_expansion_is_404(monkeypatch: pytest.MonkeyPatch) -> None:
    _patch(monkeypatch, _Spy(result=_view()), _Spy(raises=InstrumentNotFound("ZZZZ")))

    resp = _client(monkeypatch).get("/api/coverage?expand=ZZZZ")

    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "instrument_not_found"


def test_expansion_is_opt_in(monkeypatch: pytest.MonkeyPatch) -> None:
    gap_dates = _patch(monkeypatch, _Spy(result=_view(_row())), _Spy(result=[date(2024, 1, 4)]))
    client = _client(monkeypatch)

    body = client.get("/api/coverage").json()
    assert "expanded" not in body
    assert gap_dates.calls == []

    body = client.get("/api/coverage?expand=aapl&from=2024-01-02&to=2024-01-05").json()
    assert body["expanded"] == {"symbol": "AAPL", "gap_dates": ["2024-01-04"]}
    assert len(gap_dates.calls) == 1
    args, kwargs = gap_dates.calls[0]
    assert args[1] == "AAPL"
    assert kwargs == {"from_date": date(2024, 1, 2), "to_date": date(2024, 1, 5)}
