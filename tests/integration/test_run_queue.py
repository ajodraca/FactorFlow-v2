"""FIFO claim and request queueing for the run journal (CAP-001-E5-S2).

Exercises `factorflow.runs.journal.request_run` and `claim_next` against the
S1-supplied run schema (`migrated_run_schema_connection`) and, for the
contention cases, independent connections to the same migrated database
(`postgres_connection_string`).
"""

from datetime import UTC, datetime, timedelta
from uuid import UUID

import psycopg
import pytest
from factorflow.runs.journal import ClaimedRun, claim_next, request_run
from psycopg.types.json import Json

from factorflow.instruments.settings import HISTORY_DEPTH_KEY

_RUN_COLUMN_NAMES = (
    "run_id",
    "state",
    "history_depth_years",
    "requested_at",
    "started_at",
    "ended_at",
    "cancel_requested_at",
    "claimed_by",
    "heartbeat_at",
    "instruments_named",
    "instruments_written",
    "instruments_failed",
    "failure_reason",
)


def _insert_active_run(connection: psycopg.Connection, state: str, depth: int = 1) -> UUID:
    """Persist a `running` or `cancelling` row satisfying claim_agrees."""
    with connection.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(state, history_depth_years, started_at, claimed_by, heartbeat_at) "
            "VALUES (%s, %s, now(), 'seed-runner', now()) RETURNING run_id",
            (state, depth),
        )
        row = cur.fetchone()
        assert row is not None
        return row[0]


def _insert_requested_run(
    connection: psycopg.Connection, depth: int, requested_at: datetime
) -> UUID:
    """Persist a `requested` row with an explicit request time."""
    with connection.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (state, history_depth_years, requested_at) "
            "VALUES ('requested', %s, %s) RETURNING run_id",
            (depth, requested_at),
        )
        row = cur.fetchone()
        assert row is not None
        return row[0]


def _terminalize_run(connection: psycopg.Connection, run_id: UUID) -> None:
    """Move a claimed run to `succeeded`, clearing the claim fields."""
    with connection.cursor() as cur:
        cur.execute(
            "UPDATE acquisition_run SET state = 'succeeded', ended_at = now(), "
            "claimed_by = NULL, heartbeat_at = NULL WHERE run_id = %s",
            (run_id,),
        )


def _set_stated_depth(connection: psycopg.Connection, years: int) -> None:
    """Record the owner's stated history depth setting."""
    with connection.cursor() as cur:
        cur.execute(
            "INSERT INTO owner_setting (setting_key, setting_value) VALUES (%s, %s)",
            (HISTORY_DEPTH_KEY, Json({"years": years})),
        )


def _fetch_run(connection: psycopg.Connection, run_id: UUID) -> dict[str, object]:
    """Return the full acquisition_run row for `run_id` keyed by column."""
    with connection.cursor() as cur:
        cur.execute(
            "SELECT " + ", ".join(_RUN_COLUMN_NAMES) + " FROM acquisition_run WHERE run_id = %s",
            (run_id,),
        )
        row = cur.fetchone()
        assert row is not None
        return dict(zip(_RUN_COLUMN_NAMES, row, strict=True))


@pytest.mark.postgres
# Implements TC-COMP-023, TC-COMP-265
@pytest.mark.parametrize("active_state", ["running", "cancelling"])
def test_request_queues_behind_active_run(
    migrated_run_schema_connection: psycopg.Connection, active_state: str
) -> None:
    connection = migrated_run_schema_connection
    active_id = _insert_active_run(connection, active_state)
    connection.commit()
    active_before = _fetch_run(connection, active_id)

    new_id, queued_behind = request_run(connection, 5)

    assert new_id != active_id
    assert queued_behind == active_id
    new_row = _fetch_run(connection, new_id)
    assert new_row["state"] == "requested"
    assert new_row["history_depth_years"] == 5
    assert _fetch_run(connection, active_id) == active_before


@pytest.mark.postgres
# Implements TC-COMP-023, TC-COMP-265
def test_request_with_no_active_run_reports_no_queue(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    new_id, queued_behind = request_run(migrated_run_schema_connection, 3)

    assert queued_behind is None
    new_row = _fetch_run(migrated_run_schema_connection, new_id)
    assert new_row["state"] == "requested"
    assert new_row["history_depth_years"] == 3


@pytest.mark.postgres
# Implements TC-COMP-237, TC-COMP-260
def test_claims_follow_request_order(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    connection = migrated_run_schema_connection
    base = datetime(2026, 9, 1, tzinfo=UTC)
    # Seeded out of request order so only ORDER BY requested_at can pass.
    third = _insert_requested_run(connection, 3, base + timedelta(minutes=2))
    first = _insert_requested_run(connection, 3, base)
    second = _insert_requested_run(connection, 3, base + timedelta(minutes=1))
    connection.commit()

    claimed_order: list[UUID] = []
    for _ in range(3):
        claimed = claim_next(connection, "runner-1")
        assert claimed is not None
        claimed_order.append(claimed.run_id)
        _terminalize_run(connection, claimed.run_id)
        connection.commit()

    assert claimed_order == [first, second, third]
    assert claim_next(connection, "runner-1") is None


@pytest.mark.postgres
# Implements TC-COMP-237, TC-COMP-261
def test_claim_returns_none_when_nothing_requested(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    assert claim_next(migrated_run_schema_connection, "runner-1") is None


@pytest.mark.postgres
# Implements TC-COMP-237, TC-COMP-261
@pytest.mark.parametrize("active_state", ["running", "cancelling"])
def test_claim_returns_none_while_run_active(
    migrated_run_schema_connection: psycopg.Connection, active_state: str
) -> None:
    connection = migrated_run_schema_connection
    _insert_active_run(connection, active_state)
    queued_id = _insert_requested_run(connection, 3, datetime(2026, 9, 1, tzinfo=UTC))
    connection.commit()

    assert claim_next(connection, "runner-1") is None
    assert _fetch_run(connection, queued_id)["state"] == "requested"


@pytest.mark.postgres
# Implements TC-COMP-262, TC-COMP-263
def test_successful_claim_sets_fields_and_returns_snapshot(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    connection = migrated_run_schema_connection
    requested_id = _insert_requested_run(connection, 7, datetime(2026, 9, 1, tzinfo=UTC))
    # A stated depth different from the stored snapshot proves the claim maps
    # the run's own record rather than the current setting.
    _set_stated_depth(connection, 2)
    connection.commit()

    claimed = claim_next(connection, "runner-9")

    assert claimed == ClaimedRun(run_id=requested_id, history_depth_years=7)
    row = _fetch_run(connection, requested_id)
    assert row["state"] == "running"
    assert row["claimed_by"] == "runner-9"
    assert row["started_at"] is not None
    assert row["heartbeat_at"] is not None
    assert row["started_at"] == row["heartbeat_at"]
