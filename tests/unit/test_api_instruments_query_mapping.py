"""`list_instruments`'s `InstrumentFilters` is built from query parameters.

Task plan T017: `DEFAULT_PAGE_SIZE` applies when `limit` is omitted.
"""

from contextlib import contextmanager

from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.api.bounds import DEFAULT_PAGE_SIZE
from factorflow.instruments.service import InstrumentFilters, InstrumentPage


class _FakePool:
    """A `ConnectionPool` stand-in that never opens a real connection.

    `list_instruments` is monkeypatched to return a canned page without
    using the connection object, so the object this yields is never
    touched -- but a real pool would still block trying to check one out,
    which is the unit boundary this fake exists to avoid.
    """

    @contextmanager
    def connection(self):
        yield object()


def test_list_route_applies_default_page_size_when_limit_omitted(monkeypatch) -> None:
    captured: dict[str, InstrumentFilters] = {}

    def _capture(_connection, filters: InstrumentFilters) -> InstrumentPage:
        captured["filters"] = filters
        return InstrumentPage(rows=[], next_cursor=None, active_count=0, retired_count=0)

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    monkeypatch.setattr("factorflow.api.routes.instruments.list_instruments", _capture)

    app = create_app()
    with TestClient(app) as client:
        app.state.db_pool = _FakePool()
        response = client.get("/api/instruments")

    assert response.status_code == 200
    assert captured["filters"].page_size == DEFAULT_PAGE_SIZE


def test_list_route_forwards_explicit_query_parameters(monkeypatch) -> None:
    captured: dict[str, InstrumentFilters] = {}

    def _capture(_connection, filters: InstrumentFilters) -> InstrumentPage:
        captured["filters"] = filters
        return InstrumentPage(rows=[], next_cursor=None, active_count=0, retired_count=0)

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    monkeypatch.setattr("factorflow.api.routes.instruments.list_instruments", _capture)

    app = create_app()
    with TestClient(app) as client:
        app.state.db_pool = _FakePool()
        response = client.get(
            "/api/instruments",
            params={"symbol": "A", "lifecycle": "active", "limit": 10, "cursor": "AAPL"},
        )

    assert response.status_code == 200
    filters = captured["filters"]
    assert filters.page_size == 10
    assert filters.symbol_prefix == "A"
    assert filters.lifecycle == "active"
    assert filters.cursor == "AAPL"
