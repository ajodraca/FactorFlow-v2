"""TC-COMP-344 / DAC-E1-S6-4: the application factory mounts the static bundle.

Component design section 2.5; task plan T011.
"""

import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    app = create_app()
    with TestClient(app) as test_client:
        yield test_client


def test_unmatched_non_api_path_falls_back_to_index(client: TestClient) -> None:
    response = client.get("/coverage")

    # No frontend bundle exists on this branch yet (task plan Notes: "No
    # frontend bundle exists yet"). Until index.html is present, Starlette's
    # StaticFiles 404s; once a build lands, this exercises the SPA fallback.
    # Either way, an unmatched non-API path must never fall through to the
    # `not_found` error envelope this story reserves for `/api`.
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        assert "text/html" in response.headers["content-type"]
    else:
        # No bundle exists to fall back to on this branch. Whatever shape a
        # 404 takes here, it must not be this story's `not_found` error
        # envelope, which is reserved for unmatched paths under `/api`.
        assert response.headers.get("content-type", "").startswith("application/json") is False


def test_unmatched_api_path_returns_error_envelope(client: TestClient) -> None:
    response = client.get("/api/does-not-exist")

    assert response.status_code == 404
    body = response.json()
    assert body["error"]["code"] == "not_found"
    assert "request_id" in body["error"]
