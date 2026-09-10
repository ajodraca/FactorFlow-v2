"""`instruments.py` maps domain exceptions to status codes explicitly.

Task plan T016: `InstrumentNotFound` -> `404`, `AlreadyRetired` -> `409`, via
explicit exception handling in the route, not a bare re-raise.
"""

from contextlib import contextmanager

from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.instruments.service import AlreadyRetired, InstrumentNotFound


class _FakePool:
    """A `ConnectionPool` stand-in that never opens a real connection.

    `retire_symbol` is monkeypatched to raise before it would use the
    connection object, so the object this yields is never touched -- but a
    real pool would still block trying to check one out, which is the unit
    boundary this fake exists to avoid.
    """

    @contextmanager
    def connection(self):
        yield object()


def test_retire_route_maps_instrument_not_found_to_404(monkeypatch) -> None:
    def _raise_not_found(_connection, _symbol):
        raise InstrumentNotFound("NOPE")

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    monkeypatch.setattr("factorflow.api.routes.instruments.retire_symbol", _raise_not_found)

    app = create_app()
    with TestClient(app, raise_server_exceptions=False) as client:
        app.state.db_pool = _FakePool()
        response = client.delete("/api/instruments/NOPE")

    assert response.status_code == 404
    assert response.json()["error"]["code"]


def test_retire_route_maps_already_retired_to_409(monkeypatch) -> None:
    def _raise_already_retired(_connection, _symbol):
        raise AlreadyRetired("AAPL")

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    monkeypatch.setattr("factorflow.api.routes.instruments.retire_symbol", _raise_already_retired)

    app = create_app()
    with TestClient(app, raise_server_exceptions=False) as client:
        app.state.db_pool = _FakePool()
        response = client.delete("/api/instruments/AAPL")

    assert response.status_code == 409
    assert response.json()["error"]["code"]
