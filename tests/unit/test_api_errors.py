"""Unit tests for the error-envelope shapes produced by the runs routes.

Task plan T004: covers the approved singular `resource: "acquisition-run"` on
every S5 non-2xx branch, the precedence-resolved optional `error.state` only on
`run_already_terminal`, the same request id in body and `X-Request-Id` header,
FastAPI-generated 422 mapping, and exception-to-HTTP mapping without driver text.
"""

from __future__ import annotations

import logging
from contextlib import contextmanager

import pytest
from fastapi import APIRouter, FastAPI
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.runs.journal import RunAlreadyTerminal


class _FakePool:
    """A ConnectionPool stand-in that yields a dummy connection object."""

    @contextmanager
    def connection(self):
        yield object()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _app_with_pool(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    app = create_app()
    app.state.db_pool = _FakePool()
    return TestClient(app, raise_server_exceptions=False)


# ---------------------------------------------------------------------------
# Resource name — must be singular "acquisition-run"
# ---------------------------------------------------------------------------


def test_409_uses_singular_resource_name_history_depth_not_set(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Implements TC-COMP-249: 409 on missing depth uses resource='acquisition-run'."""
    monkeypatch.setattr(
        "factorflow.api.routes.runs.read_history_depth",
        lambda _conn: None,
    )
    monkeypatch.setattr(
        "factorflow.api.routes.runs.active_instrument_ids",
        lambda _conn: [1],
    )
    client = _app_with_pool(monkeypatch)

    resp = client.post("/api/acquisition-runs")

    assert resp.status_code == 409
    assert resp.json()["error"]["resource"] == "acquisition-run"


def test_409_uses_singular_resource_name_no_active_instruments(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Implements TC-COMP-250: 409 on empty roster uses resource='acquisition-run'."""
    from datetime import UTC, datetime

    from factorflow.instruments.settings import HistoryDepth

    monkeypatch.setattr(
        "factorflow.api.routes.runs.read_history_depth",
        lambda _conn: HistoryDepth(years=5, updated_at=datetime.now(UTC)),
    )
    monkeypatch.setattr(
        "factorflow.api.routes.runs.active_instrument_ids",
        lambda _conn: [],
    )
    client = _app_with_pool(monkeypatch)

    resp = client.post("/api/acquisition-runs")

    assert resp.status_code == 409
    assert resp.json()["error"]["resource"] == "acquisition-run"


def test_409_run_already_terminal_uses_singular_resource_name(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Implements TC-COMP-281: 409 run_already_terminal uses resource='acquisition-run'."""
    import uuid

    run_id = uuid.uuid4()
    monkeypatch.setattr(
        "factorflow.api.routes.runs.request_cancel",
        lambda _conn, _run_id: (_ for _ in ()).throw(
            RunAlreadyTerminal("already done", actual_state="succeeded")
        ),
    )
    client = _app_with_pool(monkeypatch)

    resp = client.post(f"/api/acquisition-runs/{run_id}/cancel")

    assert resp.status_code == 409
    assert resp.json()["error"]["resource"] == "acquisition-run"


# ---------------------------------------------------------------------------
# Optional error.state — present only for run_already_terminal
# ---------------------------------------------------------------------------


def test_run_already_terminal_envelope_carries_state_field(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Implements TC-COMP-281: run_already_terminal response includes
    error.state with the persisted terminal state."""
    import uuid

    run_id = uuid.uuid4()
    monkeypatch.setattr(
        "factorflow.api.routes.runs.request_cancel",
        lambda _conn, _run_id: (_ for _ in ()).throw(
            RunAlreadyTerminal("already done", actual_state="failed")
        ),
    )
    client = _app_with_pool(monkeypatch)

    resp = client.post(f"/api/acquisition-runs/{run_id}/cancel")

    assert resp.status_code == 409
    body = resp.json()
    assert body["error"]["code"] == "run_already_terminal"
    assert body["error"]["state"] == "failed"


def test_non_terminal_409_envelope_does_not_carry_state_field(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The optional error.state is absent (not null) on non-run_already_terminal errors."""
    monkeypatch.setattr(
        "factorflow.api.routes.runs.read_history_depth",
        lambda _conn: None,
    )
    monkeypatch.setattr(
        "factorflow.api.routes.runs.active_instrument_ids",
        lambda _conn: [1],
    )
    client = _app_with_pool(monkeypatch)

    resp = client.post("/api/acquisition-runs")

    assert resp.status_code == 409
    body = resp.json()
    assert "state" not in body["error"]


# ---------------------------------------------------------------------------
# Request id — same in body and X-Request-Id header
# ---------------------------------------------------------------------------


def test_request_id_same_in_body_and_header_on_409(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Implements TC-COMP-249: request id appears identically in the error
    envelope body and the X-Request-Id response header."""
    monkeypatch.setattr(
        "factorflow.api.routes.runs.read_history_depth",
        lambda _conn: None,
    )
    monkeypatch.setattr(
        "factorflow.api.routes.runs.active_instrument_ids",
        lambda _conn: [],
    )
    client = _app_with_pool(monkeypatch)

    resp = client.post("/api/acquisition-runs")

    assert resp.status_code == 409
    body_req_id = resp.json()["error"]["request_id"]
    header_req_id = resp.headers.get("X-Request-Id")
    assert body_req_id
    assert body_req_id == header_req_id


# ---------------------------------------------------------------------------
# 422 mapping — malformed UUID returns 422 through the shared envelope
# ---------------------------------------------------------------------------


def test_cancel_malformed_uuid_returns_422_envelope(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """FastAPI-generated 422 for a bad path parameter uses the shared error
    envelope with resource='acquisition-run'."""
    client = _app_with_pool(monkeypatch)

    resp = client.post("/api/acquisition-runs/not-a-uuid/cancel")

    assert resp.status_code == 422
    body = resp.json()
    assert "error" in body
    assert body["error"]["resource"] == "acquisition-run"


# ---------------------------------------------------------------------------
# No driver detail in error body
# ---------------------------------------------------------------------------


def test_500_does_not_expose_driver_detail(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """An unexpected exception is returned as 500 internal_error with no
    driver-level text in the body."""
    import uuid

    run_id = uuid.uuid4()
    monkeypatch.setattr(
        "factorflow.api.routes.runs.request_cancel",
        lambda _conn, _run_id: (_ for _ in ()).throw(
            RuntimeError("psycopg: connection refused: 127.0.0.1:5432")
        ),
    )
    client = _app_with_pool(monkeypatch)

    resp = client.post(f"/api/acquisition-runs/{run_id}/cancel")

    assert resp.status_code == 500
    text = resp.text
    assert "psycopg" not in text
    assert "connection refused" not in text


# ---------------------------------------------------------------------------
# CAP-001-E7-S2: one envelope on every handled error type
# ---------------------------------------------------------------------------


def _client_for_envelope_matrix(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    from factorflow.runs.queries import RunNotFound

    monkeypatch.setattr(
        "factorflow.api.routes.runs.get_run_detail",
        lambda _conn, run_id, _filters: RunNotFound(run_id=run_id),
    )
    monkeypatch.setattr(
        "factorflow.api.routes.runs.read_history_depth",
        lambda _conn: None,
    )
    monkeypatch.setattr(
        "factorflow.api.routes.runs.active_instrument_ids",
        lambda _conn: [1],
    )
    return _app_with_pool(monkeypatch)


_ENVELOPE_MATRIX = [
    pytest.param("GET", "/api/does-not-exist", None, 404, "not_found", id="unmatched-api-path"),
    pytest.param(
        "GET",
        "/api/acquisition-runs/0f2f1c2e-9a44-4f0f-9f1e-2b7b0d0f1a55",
        None,
        404,
        "not_found",
        id="run-not-found",
    ),
    pytest.param(
        "POST", "/api/acquisition-runs", None, 409, "history_depth_not_set", id="depth-not-set"
    ),
    pytest.param(
        "PUT",
        "/api/settings/history-depth",
        {"years": "x"},
        422,
        "validation_error",
        id="body-validation",
    ),
    pytest.param(
        "GET", "/api/instruments?limit=501", None, 422, "validation_error", id="query-validation"
    ),
    pytest.param("DELETE", "/api/health", None, 405, "method_not_allowed", id="method-not-allowed"),
]


@pytest.mark.parametrize(("method", "path", "body", "status", "code"), _ENVELOPE_MATRIX)
def test_every_handled_error_returns_the_full_envelope(
    monkeypatch: pytest.MonkeyPatch,
    method: str,
    path: str,
    body: dict[str, str] | None,
    status: int,
    code: str,
) -> None:
    # Implements TC-COMP-070
    # Implements TC-COMP-010
    """Every handled non-2xx response carries the one shared envelope with
    all four fields, and the body's request id is the header's."""
    client = _client_for_envelope_matrix(monkeypatch)

    resp = client.request(method, path, json=body)

    assert resp.status_code == status
    payload = resp.json()
    assert list(payload) == ["error"]
    assert "detail" not in payload
    error = payload["error"]
    assert error["code"] == code
    for field in ("code", "message", "resource", "request_id"):
        assert isinstance(error[field], str) and error[field], field
    assert "state" not in error
    assert error["request_id"] == resp.headers["X-Request-Id"]


# ---------------------------------------------------------------------------
# CAP-001-E7-S2: a 500 returns the internal-error code and request id only
# ---------------------------------------------------------------------------


def _app_with_probe(monkeypatch: pytest.MonkeyPatch, exc: Exception) -> FastAPI:
    """An application whose `GET /api/probe` raises `exc`.

    The probe's routes go at the front of the router: a route appended after
    `create_app()` sits behind the `StaticFiles` mount at `/` and is never
    reached.
    """
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    app = create_app()
    probe = APIRouter()

    @probe.get("/api/probe")
    def _raise() -> None:
        raise exc

    app.router.routes[0:0] = probe.routes
    return app


_DRIVER_TEXT = "psycopg.OperationalError: connection to 127.0.0.1:5432 failed"


def test_500_body_is_only_the_internal_error_code_and_request_id(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    # Implements TC-COMP-072
    # Implements TC-COMP-084
    """A `500` carries `code` and `request_id` only, matching the header, with
    no driver text in the body and the driver detail in the log."""
    app = _app_with_probe(monkeypatch, RuntimeError(_DRIVER_TEXT))

    with (
        TestClient(app, raise_server_exceptions=False) as client,
        caplog.at_level(logging.INFO),
    ):
        caplog.clear()
        resp = client.get("/api/probe")

    assert resp.status_code == 500
    request_id = resp.headers.get("X-Request-Id")
    assert request_id
    assert resp.json() == {"error": {"code": "internal_error", "request_id": request_id}}
    for forbidden in ("Traceback", "RuntimeError", "psycopg", "5432"):
        assert forbidden not in resp.text

    error_records = [
        r for r in caplog.records if r.name == "factorflow.api" and r.levelno == logging.ERROR
    ]
    assert error_records
    assert any(
        r.exc_info and _DRIVER_TEXT in logging.Formatter().formatException(r.exc_info)
        for r in error_records
    )
