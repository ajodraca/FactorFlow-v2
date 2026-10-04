"""`GET /api/health` against a real PostgreSQL instance.

Component design section 11; task plan T007, T008, T010. CAP-001-E7-S3's
`most_recent_run` cases (task plan T002-T005, T009) use
`migrated_health_client`, which applies every migration through the real
migrator so both `applied_migrations` and `acquisition_run` exist.
"""

from collections.abc import Iterator
from pathlib import Path

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.db.migrator import apply_pending, discover

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"


def _highest_migration_version() -> int:
    return max(m.version for m in discover(MIGRATIONS_DIR))


@pytest.fixture
def migrated_health_client(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> Iterator[tuple[TestClient, str]]:
    """A client over `create_app()` whose database is fully migrated."""
    with psycopg.connect(postgres_connection_string) as conn:
        apply_pending(conn, discover(MIGRATIONS_DIR))

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", postgres_connection_string)
    with TestClient(create_app()) as client:
        yield client, postgres_connection_string


@pytest.mark.postgres
def test_health_reachable_database(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E1-16, DAC-E1-S6-1: a reachable database reports the highest
    applied migration version, and credential presence matches the
    environment.

    The database is migrated through the real migrator, as production is
    before the API binds (AC-16), so health's run read finds its table
    (CAP-001-E7-S3 T009).
    """
    with psycopg.connect(postgres_connection_string) as conn:
        apply_pending(conn, discover(MIGRATIONS_DIR))

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", postgres_connection_string)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "test-key-value")

    app = create_app()
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "reachable"
    assert body["schema_version"] == _highest_migration_version()
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


# Implements TC-COMP-088
@pytest.mark.postgres
def test_health_most_recent_run_null_when_no_run_recorded(
    migrated_health_client: tuple[TestClient, str],
) -> None:
    """DAC-E7-S3-1: a reachable store with no run reports `null`, never an
    unreachable or failed answer.
    """
    client, _ = migrated_health_client

    body = client.get("/api/health").json()

    assert body["database"] == "reachable"
    assert body["schema_version"] == _highest_migration_version()
    assert "most_recent_run" in body
    assert body["most_recent_run"] is None
