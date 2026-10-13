"""Host and Origin checks on every request (CAP-001-E1-S7).

Component design: `component-design-ingestion-api.md` section 2.5a; CONST-SEC
1.3 SEC-ENC-001 host-local loopback exception, condition H9. The API is plain
HTTP on loopback with no authentication (AC-14), so a request whose `Host` is
missing or not one of the API's loopback hosts is refused with `400
host_not_allowed`, and a state-changing request carrying a foreign `Origin`
with `403 origin_not_allowed`, before any route or the static mount runs.
"""

import asyncio
import logging
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api import app as app_module
from factorflow.api.app import create_app
from factorflow.api.routes import health as health_route
from factorflow.api.routes import instruments as instruments_route
from factorflow.instruments.service import Disposition, SymbolOutcome

_PORT = 8000
_LOOPBACK_HOSTS = (f"127.0.0.1:{_PORT}", f"localhost:{_PORT}", f"[::1]:{_PORT}")
_LOOPBACK_ORIGINS = tuple(f"http://{host}" for host in _LOOPBACK_HOSTS)
_RUN_ID = "00000000-0000-0000-0000-000000000001"

# The five state-changing routes (ingestion-api section 11), with a valid body.
_STATE_CHANGING = [
    ("POST", "/api/acquisition-runs", None),
    ("POST", f"/api/acquisition-runs/{_RUN_ID}/cancel", None),
    ("PUT", "/api/settings/history-depth", {"years": 5}),
    ("POST", "/api/instruments", {"symbols": ["AAPL"]}),
    ("DELETE", "/api/instruments/AAPL", None),
]


_STATIC_MARKER = "STATIC-BUNDLE-MARKER"


class _RecordingPool:
    """Stands in for `app.state.db_pool`. Every route handler that runs opens
    a connection (health with `timeout=`), so `calls` records whether a
    handler was reached. With no `connection` set it behaves as a database
    that is down, the way psycopg reports one, so health still answers
    normally (`database == "unreachable"`, DAC-E1-S6-2)."""

    def __init__(self) -> None:
        self.calls: list[dict[str, Any]] = []
        self.connection_object: object | None = None

    @contextmanager
    def connection(self, **kwargs: Any) -> Iterator[object]:
        self.calls.append(kwargs)
        if self.connection_object is None:
            raise psycopg.OperationalError("database is down (test double)")
        yield self.connection_object


@pytest.fixture
def pool(monkeypatch: pytest.MonkeyPatch, tmp_path: Any) -> _RecordingPool:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")
    monkeypatch.delenv("FACTORFLOW_API_PORT", raising=False)
    # A bundle this test controls, so a static response is recognisable.
    (tmp_path / "index.html").write_text(f"<html>{_STATIC_MARKER}</html>")
    monkeypatch.setattr(app_module, "_STATIC_DIR", tmp_path)
    return _RecordingPool()


@pytest.fixture
def health_calls(monkeypatch: pytest.MonkeyPatch) -> list[object]:
    """A spy on the health handler: it calls `probe_database_reachable`."""
    calls: list[object] = []
    original = health_route.probe_database_reachable

    def spy(pool: Any) -> bool:
        calls.append(pool)
        return original(pool)

    monkeypatch.setattr(health_route, "probe_database_reachable", spy)
    return calls


def _client(pool: _RecordingPool) -> TestClient:
    app = create_app()
    app.state.db_pool = pool
    return TestClient(app, base_url=f"http://127.0.0.1:{_PORT}", raise_server_exceptions=False)


def _error_code(response: Any) -> str | None:
    try:
        return response.json()["error"]["code"]
    except (ValueError, KeyError, TypeError):
        return None


# Implements TC-COMP-390
def test_loopback_host_and_own_origin_are_served_normally(
    pool: _RecordingPool, monkeypatch: pytest.MonkeyPatch
) -> None:
    pool.connection_object = object()
    monkeypatch.setattr(
        instruments_route,
        "add_symbols",
        lambda _connection, symbols: [SymbolOutcome(s, s, Disposition.ADDED) for s in symbols],
    )
    client = _client(pool)
    host = {"Host": f"127.0.0.1:{_PORT}"}

    root = client.get("/", headers=host)
    added = client.post(
        "/api/instruments",
        json={"symbols": ["AAPL"]},
        headers={**host, "Origin": f"http://127.0.0.1:{_PORT}"},
    )
    pool.connection_object = None
    health = client.get("/api/health", headers=host)

    assert health.status_code == 200
    assert health.json()["database"] == "unreachable"
    assert root.status_code == 200
    assert _STATIC_MARKER in root.text
    assert added.status_code == 201
    assert [row["normalised_symbol"] for row in added.json()["added"]] == ["AAPL"]


# Implements TC-COMP-401
@pytest.mark.parametrize("host", _LOOPBACK_HOSTS)
def test_the_three_loopback_hosts_pass(pool: _RecordingPool, host: str) -> None:
    response = _client(pool).get("/api/health", headers={"Host": host})
    assert response.status_code == 200
    assert "database" in response.json()


def _asgi_get_without_host(app: Any, path: str) -> tuple[int, bytes]:
    """`TestClient` always sends a `Host`; a hand-built scope can omit it."""
    messages: list[dict[str, Any]] = []

    async def receive() -> dict[str, Any]:
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message: dict[str, Any]) -> None:
        messages.append(message)

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "GET",
        "scheme": "http",
        "path": path,
        "raw_path": path.encode(),
        "query_string": b"",
        "root_path": "",
        "headers": [],
        "client": ("127.0.0.1", 50000),
        "server": ("127.0.0.1", _PORT),
    }
    asyncio.run(app(scope, receive, send))
    start = next(m for m in messages if m["type"] == "http.response.start")
    body = b"".join(m.get("body", b"") for m in messages if m["type"] == "http.response.body")
    return start["status"], body


# Implements TC-COMP-402
@pytest.mark.parametrize("path", ["/api/health", "/"])
@pytest.mark.parametrize("host", ["evil.example:8000", "127.0.0.1:9999"])
def test_a_foreign_or_wrong_port_host_is_refused(
    pool: _RecordingPool, health_calls: list[object], path: str, host: str
) -> None:
    response = _client(pool).get(path, headers={"Host": host})
    assert response.status_code == 400
    assert _error_code(response) == "host_not_allowed"
    assert health_calls == []
    assert pool.calls == []
    assert _STATIC_MARKER not in response.text


# Implements TC-COMP-402
@pytest.mark.parametrize("path", ["/api/health", "/"])
def test_a_missing_host_is_refused(
    pool: _RecordingPool, health_calls: list[object], path: str
) -> None:
    app = create_app()
    app.state.db_pool = pool
    status, body = _asgi_get_without_host(app, path)
    assert status == 400
    assert b"host_not_allowed" in body
    assert health_calls == []
    assert pool.calls == []
    assert _STATIC_MARKER.encode() not in body


# Implements TC-COMP-403
@pytest.mark.parametrize("origin", ["https://evil.example", "null"])
@pytest.mark.parametrize(("method", "path", "body"), _STATE_CHANGING)
def test_a_foreign_or_null_origin_is_refused_on_every_state_changing_route(
    pool: _RecordingPool, method: str, path: str, body: Any, origin: str
) -> None:
    response = _client(pool).request(method, path, json=body, headers={"Origin": origin})
    assert response.status_code == 403
    assert _error_code(response) == "origin_not_allowed"
    assert pool.calls == []


# Implements TC-COMP-404
@pytest.mark.parametrize("origin", [None, *_LOOPBACK_ORIGINS])
def test_no_origin_or_a_loopback_origin_is_not_refused(
    pool: _RecordingPool, origin: str | None
) -> None:
    headers = {} if origin is None else {"Origin": origin}
    response = _client(pool).post("/api/acquisition-runs", headers=headers)
    assert _error_code(response) != "origin_not_allowed"
    assert response.status_code != 403
    assert len(pool.calls) == 1, "the run handler was not reached"


# Implements TC-COMP-405
def test_a_get_with_a_foreign_origin_is_not_refused(
    pool: _RecordingPool, health_calls: list[object]
) -> None:
    response = _client(pool).get("/api/health", headers={"Origin": "https://evil.example"})
    assert response.status_code == 200
    assert response.json()["database"] == "unreachable"
    assert len(health_calls) == 1


# Implements TC-COMP-406
def test_a_refusal_is_logged_at_warning_with_the_request_id_and_the_header(
    pool: _RecordingPool, monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    api_key = "TEST-ONLY-" + "c0ffee" * 6
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", api_key)
    secret_body = {"symbols": ["DO-NOT-LOG-THIS-BODY"]}
    client = _client(pool)

    with caplog.at_level(logging.WARNING):
        host_refusal = client.get("/api/health", headers={"Host": "evil.example:8000"})
        origin_refusal = client.post(
            "/api/instruments", json=secret_body, headers={"Origin": "https://evil.example"}
        )

    warnings = [r for r in caplog.records if r.levelno == logging.WARNING]
    for response, rejected in (
        (host_refusal, "evil.example:8000"),
        (origin_refusal, "https://evil.example"),
    ):
        request_id = response.headers["X-Request-Id"]
        assert response.json()["error"]["request_id"] == request_id
        matching = [r for r in warnings if rejected in r.getMessage()]
        assert len(matching) == 1, rejected
        assert (
            request_id in matching[0].getMessage()
            or getattr(matching[0], "request_id", None) == request_id
        )
    for record in caplog.records:
        assert "DO-NOT-LOG-THIS-BODY" not in record.getMessage()
        assert api_key not in record.getMessage()


# Implements TC-COMP-407
def test_a_refused_run_start_creates_no_run(pool: _RecordingPool) -> None:
    response = _client(pool).post(
        "/api/acquisition-runs", headers={"Origin": "https://evil.example"}
    )
    assert response.status_code == 403
    assert _error_code(response) == "origin_not_allowed"
    assert pool.calls == []


def test_the_allowed_hosts_follow_the_configured_port(
    pool: _RecordingPool, monkeypatch: pytest.MonkeyPatch
) -> None:
    """ingestion-api section 2.5a: `<port>` is `ApiSettings.port`; the E2E
    stack's port 8123 relies on it (task plan T011)."""
    monkeypatch.setenv("FACTORFLOW_API_PORT", "8123")
    app = create_app()
    app.state.db_pool = pool
    client = TestClient(app, base_url="http://127.0.0.1:8123", raise_server_exceptions=False)

    assert client.get("/api/health", headers={"Host": "127.0.0.1:8123"}).status_code != 400
    refused = client.get("/api/health", headers={"Host": "127.0.0.1:8000"})
    assert refused.status_code == 400
    assert _error_code(refused) == "host_not_allowed"
