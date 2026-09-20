"""FIFO claim and request queueing for the run journal (CAP-001-E5-S2).

Exercises `factorflow.runs.journal.request_run` and `claim_next` against the
S1-supplied run schema (`migrated_run_schema_connection`) and, for the
contention cases, independent connections to the same migrated database
(`postgres_connection_string`).
"""

from uuid import UUID

import psycopg
import pytest
from factorflow.runs.journal import request_run

_RUN_COLUMNS = (
    "run_id, state, history_depth_years, requested_at, started_at, ended_at, "
    "cancel_requested_at, claimed_by, heartbeat_at, instruments_named, "
    "instruments_written, instruments_failed, failure_reason"
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


def _fetch_run(connection: psycopg.Connection, run_id: UUID) -> tuple:
    """Return the full acquisition_run row for `run_id`."""
    with connection.cursor() as cur:
        cur.execute(
            f"SELECT {_RUN_COLUMNS} FROM acquisition_run WHERE run_id = %s",
            (run_id,),
        )
        row = cur.fetchone()
        assert row is not None
        return row


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
    assert new_row[1] == "requested"
    assert new_row[2] == 5
    assert _fetch_run(connection, active_id) == active_before


@pytest.mark.postgres
# Implements TC-COMP-023, TC-COMP-265
def test_request_with_no_active_run_reports_no_queue(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    new_id, queued_behind = request_run(migrated_run_schema_connection, 3)

    assert queued_behind is None
    new_row = _fetch_run(migrated_run_schema_connection, new_id)
    assert new_row[1] == "requested"
    assert new_row[2] == 3
