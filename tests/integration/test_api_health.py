"""`GET /api/health` against a real PostgreSQL instance.

Component design section 11; task plan T007, T008, T010. CAP-001-E7-S3's
`most_recent_run` cases (task plan T002-T005, T009) use
`migrated_health_client`, which applies every migration through the real
migrator so both `applied_migrations` and `acquisition_run` exist.
"""

import uuid
from collections.abc import Iterator
from datetime import UTC, datetime, timedelta
from pathlib import Path

import httpx
import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.config.settings import credential_present
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


_TERMINAL_STATES = frozenset({"succeeded", "partial", "failed", "cancelled", "abandoned"})
_ACTIVE_STATES = frozenset({"running", "cancelling"})
_BASE_TIME = datetime(2026, 9, 5, 22, 0, 0, tzinfo=UTC)


def _seed_run(
    connection_string: str,
    state: str,
    requested_at: datetime,
    ended_at: datetime | None = None,
) -> uuid.UUID:
    """Insert a run that satisfies `acquisition_run`'s DDL checks.

    Terminal states get `ended_at` (default: a minute after `requested_at`);
    `running` and `cancelling` get `started_at`, `claimed_by` and
    `heartbeat_at`; `requested` gets none of them.
    """
    with psycopg.connect(connection_string) as conn, conn.cursor() as cur:
        if state in _TERMINAL_STATES:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years, requested_at, "
                "started_at, ended_at) VALUES (%s, 5, %s, %s, %s) RETURNING run_id",
                (
                    state,
                    requested_at,
                    requested_at,
                    ended_at or requested_at + timedelta(minutes=1),
                ),
            )
        elif state in _ACTIVE_STATES:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years, requested_at, "
                "started_at, claimed_by, heartbeat_at) "
                "VALUES (%s, 5, %s, %s, 'test', %s) RETURNING run_id",
                (state, requested_at, requested_at, requested_at),
            )
        else:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years, requested_at) "
                "VALUES (%s, 5, %s) RETURNING run_id",
                (state, requested_at),
            )
        row = cur.fetchone()
    assert row is not None
    return row[0]


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


# Implements TC-COMP-090
# Implements TC-COMP-073
# Implements TC-INT-020
@pytest.mark.postgres
def test_health_reports_the_most_recent_terminal_run(
    migrated_health_client: tuple[TestClient, str],
) -> None:
    """DAC-E7-S3-3, DAC-E7-8: a terminal run is reported as exactly
    `{run_id, state, ended_at}` with its stored values, and the four E1
    fields still hold.
    """
    client, connection_string = migrated_health_client
    ended_at = datetime(2026, 9, 5, 22, 14, 3, tzinfo=UTC)
    run_id = _seed_run(connection_string, "partial", _BASE_TIME, ended_at=ended_at)

    response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {
        "status",
        "database",
        "credential_present",
        "schema_version",
        "most_recent_run",
    }
    assert body["status"] == "ok"
    assert body["database"] == "reachable"
    assert isinstance(body["credential_present"], bool)
    assert body["credential_present"] is credential_present()
    assert body["schema_version"] == _highest_migration_version()
    run = body["most_recent_run"]
    assert set(run) == {"run_id", "state", "ended_at"}
    assert run["run_id"] == str(run_id)
    assert run["state"] == "partial"
    assert datetime.fromisoformat(run["ended_at"]) == ended_at


# Implements TC-COMP-089
@pytest.mark.postgres
@pytest.mark.parametrize("state", ["requested", "running", "cancelling"])
def test_health_reports_a_newer_non_terminal_run(
    migrated_health_client: tuple[TestClient, str], state: str
) -> None:
    """DAC-E7-S3-2: a newer run that has not ended is reported with its
    current state, never skipped in favour of an older terminal run.
    """
    client, connection_string = migrated_health_client
    _seed_run(connection_string, "failed", _BASE_TIME)
    newer = _seed_run(connection_string, state, _BASE_TIME + timedelta(hours=1))

    run = client.get("/api/health").json()["most_recent_run"]

    assert run is not None
    assert run["run_id"] == str(newer)
    assert run["state"] == state
    assert run["ended_at"] is None


# Implements TC-COMP-018
@pytest.mark.postgres
@pytest.mark.parametrize(
    ("older", "newer"),
    [("succeeded", "failed"), ("failed", "succeeded")],
    ids=["latest-failed", "failure-not-sticky"],
)
def test_health_alone_answers_whether_the_most_recent_run_failed(
    migrated_health_client: tuple[TestClient, str], older: str, newer: str
) -> None:
    """AC-18: one health request says whether the latest run failed, and a
    past failure is not reported once a later run succeeds.
    """
    client, connection_string = migrated_health_client
    _seed_run(connection_string, older, _BASE_TIME)
    _seed_run(connection_string, newer, _BASE_TIME + timedelta(hours=1))
    requested_paths: list[str] = []

    def _record(request: httpx.Request) -> None:
        requested_paths.append(request.url.path)

    client.event_hooks["request"].append(_record)

    run = client.get("/api/health").json()["most_recent_run"]

    assert run is not None
    assert run["state"] == newer
    assert requested_paths == ["/api/health"]
