"""`GET /api/health` against a real PostgreSQL instance.

Component design section 11; task plan T007, T008, T010.
"""

import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.db.applied_migrations import APPLIED_MIGRATIONS_DDL


@pytest.mark.postgres
def test_health_reachable_database(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E1-16, DAC-E1-S6-1: a reachable database reports the highest
    applied migration version, and credential presence matches the
    environment.
    """
    import psycopg

    with psycopg.connect(postgres_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute(APPLIED_MIGRATIONS_DDL)
            cur.execute(
                "INSERT INTO applied_migrations (version, name, checksum) "
                "VALUES (1, 'first', 'abc'), (2, 'second', 'def')"
            )
        conn.commit()

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", postgres_connection_string)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "test-key-value")

    app = create_app()
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "reachable"
    assert body["schema_version"] == 2
    assert body["credential_present"] is True
    assert body["most_recent_run"] is None


@pytest.mark.postgres
def test_health_unreachable_database(monkeypatch: pytest.MonkeyPatch) -> None:
    """DAC-E1-S6-2, AC-18: an unreachable database still responds `200`."""
    monkeypatch.setenv(
        "FACTORFLOW_DATABASE_URL",
        "postgresql://nobody:nothing@127.0.0.1:1/does_not_exist",
    )
    monkeypatch.delenv("FACTORFLOW_MASSIVE_API_KEY", raising=False)

    app = create_app()
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "unreachable"
    assert body["schema_version"] is None
    assert body["credential_present"] is False


@pytest.mark.postgres
def test_health_most_recent_run_is_null(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E1-S6-3: `most_recent_run` is present as `null`, not absent."""
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", postgres_connection_string)

    app = create_app()
    with TestClient(app) as client:
        response = client.get("/api/health")

    body = response.json()
    assert "most_recent_run" in body
    assert body["most_recent_run"] is None
