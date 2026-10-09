"""`GET/PUT /api/settings/history-depth` against a real PostgreSQL instance.

Component design section 11; task plan T010-T012, T023.
"""

import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app


@pytest.fixture
def client(migrated_connection_string: str, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", migrated_connection_string)
    with TestClient(create_app()) as test_client:
        yield test_client


@pytest.mark.postgres
# Implements TC-INT-008
def test_put_depth_rejects_invalid(client: TestClient) -> None:
    """TC-COMP-106/DAC-E2-8: only a positive integer within the canonical
    bound is accepted."""
    assert client.put("/api/settings/history-depth", json={"years": 0}).status_code == 422
    assert client.put("/api/settings/history-depth", json={"years": -5}).status_code == 422
    assert client.put("/api/settings/history-depth", json={"years": "five"}).status_code == 422
    assert client.put("/api/settings/history-depth", json={"years": 3.5}).status_code == 422
    assert client.put("/api/settings/history-depth", json={"years": 51}).status_code == 422


@pytest.mark.postgres
# Implements TC-INT-007
def test_put_depth_accepts_bounded_value(client: TestClient) -> None:
    response = client.put("/api/settings/history-depth", json={"years": 10})

    assert response.status_code == 200
    body = response.json()
    assert body["years"] == 10
    assert body["updated_at"]


@pytest.mark.postgres
# Implements TC-INT-006
def test_get_depth_when_unset(client: TestClient) -> None:
    """TC-COMP-124/DAC-E2-S3-2: `years` is `null`, not omitted or zero,
    before any value is stated."""
    response = client.get("/api/settings/history-depth")

    assert response.status_code == 200
    body = response.json()
    assert "years" in body
    assert body["years"] is None


@pytest.mark.postgres
# Implements TC-INT-008
def test_error_envelope_shape_on_settings(client: TestClient) -> None:
    """TC-COMP-125/DAC-E2-S3-3: a non-2xx response from this route also
    carries the shared error envelope, with all four fields present and
    non-empty -- including `resource` (adversarial review v1, IR-001:
    a `422` on this route previously reported `resource: null`)."""
    response = client.put("/api/settings/history-depth", json={"years": 0})

    assert response.status_code == 422
    envelope = response.json()["error"]
    assert envelope["code"]
    assert envelope["message"]
    assert envelope["resource"]
    assert envelope["request_id"]
