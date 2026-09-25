"""Unit tests for the acquisition-run route registrations and app wiring.

Task plan T004: covers singular resource in validation errors, exception-to-HTTP
mapping, and route registration expectations for the runs router.
"""

from __future__ import annotations

import uuid
from contextlib import contextmanager

import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app


class _FakePool:
    @contextmanager
    def connection(self):
        yield object()


def _client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    app = create_app()
    app.state.db_pool = _FakePool()
    return TestClient(app, raise_server_exceptions=False)


# ---------------------------------------------------------------------------
# Route registration
# ---------------------------------------------------------------------------


def test_runs_routes_are_registered(monkeypatch: pytest.MonkeyPatch) -> None:
    """The four run routes are reachable after create_app()."""
    pytest.importorskip("factorflow.api.routes.runs")

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    app = create_app()
    # OpenAPI schema enumerates all registered paths.
    schema = app.openapi()
    paths = set(schema.get("paths", {}).keys())
    assert "/api/acquisition-runs" in paths
    assert "/api/acquisition-runs/{run_id}" in paths
    assert "/api/acquisition-runs/{run_id}/cancel" in paths


# ---------------------------------------------------------------------------
# 422 envelope shape for run routes
# ---------------------------------------------------------------------------


def test_list_runs_rejects_limit_0_with_422_envelope(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """limit=0 is rejected as out of bounds; response uses shared envelope."""
    client = _client(monkeypatch)

    resp = client.get("/api/acquisition-runs?limit=0")

    assert resp.status_code == 422
    body = resp.json()
    assert "error" in body
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["resource"] == "acquisition-run"


def test_cancel_malformed_run_id_returns_422_with_runs_resource(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A non-UUID path segment triggers FastAPI's 422, mapped to the envelope
    with resource='acquisition-run'."""
    client = _client(monkeypatch)

    resp = client.post("/api/acquisition-runs/badid/cancel")

    assert resp.status_code == 422
    body = resp.json()
    assert "error" in body
    assert body["error"]["resource"] == "acquisition-run"


# ---------------------------------------------------------------------------
# 404 from cancel unknown run
# ---------------------------------------------------------------------------


def test_cancel_unknown_run_returns_404_with_envelope(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """An unknown run id returns 404 using the shared envelope."""
    monkeypatch.setattr(
        "factorflow.api.routes.runs.request_cancel",
        lambda _conn, _run_id: (_ for _ in ()).throw(KeyError("not found")),
    )
    client = _client(monkeypatch)

    resp = client.post(f"/api/acquisition-runs/{uuid.uuid4()}/cancel")

    assert resp.status_code == 404
    body = resp.json()
    assert "error" in body
    assert body["error"]["code"] == "not_found"
    assert body["error"]["resource"] == "acquisition-run"
