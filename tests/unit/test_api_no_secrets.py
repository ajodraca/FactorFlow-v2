"""TC-COMP-300 / DAC-E1-9: credential presence is a boolean, never the value.

Task plan T009.
"""

import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app


def test_health_never_echoes_credential(monkeypatch: pytest.MonkeyPatch) -> None:
    secret_value = "sk-super-secret-massive-key-0123456789"
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", secret_value)
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")

    app = create_app()
    with TestClient(app, base_url="http://127.0.0.1:8000") as client:
        response = client.get("/api/health")

    assert secret_value not in response.text
    body = response.json()
    assert body["credential_present"] is True
