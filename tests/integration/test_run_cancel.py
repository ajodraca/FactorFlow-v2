"""Integration tests: cancellation paths for running and queued runs (CAP-001-E5-S3).

Covers TC-COMP-019, TC-COMP-026, TC-COMP-241, TC-COMP-242, TC-COMP-243,
TC-COMP-244, TC-COMP-266, TC-COMP-267, TC-COMP-268, TC-COMP-269.
"""

from __future__ import annotations

import uuid

import psycopg
import pytest

from factorflow.runs.journal import (
    RunAlreadyTerminal,
    cancellation_requested,
    claim_next,
    finalise,
    request_cancel,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_RUN_COLUMNS = (
    "run_id",
    "state",
    "started_at",
    "ended_at",
    "cancel_requested_at",
    "claimed_by",
    "heartbeat_at",
)


def _insert_claimed_run(conn: psycopg.Connection, state: str = "running") -> uuid.UUID:
    """Persist a claimed run directly in the given state."""
    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, requested_at, started_at, "
            "claimed_by, heartbeat_at) "
            "VALUES (%s, %s, 1, now(), now(), 'test-runner', now())",
            (run_id, state),
        )
    conn.commit()
    return run_id


def _insert_requested_run(conn: psycopg.Connection) -> uuid.UUID:
    """Persist a requested run."""
    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (run_id, state, history_depth_years) "
            "VALUES (%s, 'requested', 1)",
            (run_id,),
        )
    conn.commit()
    return run_id


def _insert_result_row(
    conn: psycopg.Connection,
    run_id: uuid.UUID,
    instrument_id: int,
    data_type: str,
    outcome: str,
) -> None:
    """Persist a run_instrument_result row."""
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO run_instrument_result (run_id, instrument_id, data_type, outcome) "
            "VALUES (%s, %s, %s, %s)",
            (run_id, instrument_id, data_type, outcome),
        )
    conn.commit()


def _insert_instrument(conn: psycopg.Connection, symbol: str) -> int:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle) VALUES (%s, 'active') "
            "RETURNING instrument_id",
            (symbol,),
        )
        row = cur.fetchone()
    assert row is not None
    conn.commit()
    return int(row[0])


def _fetch_run(conn: psycopg.Connection, run_id: uuid.UUID) -> dict[str, object]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT " + ", ".join(_RUN_COLUMNS) + " FROM acquisition_run WHERE run_id = %s",
            (run_id,),
        )
        row = cur.fetchone()
    assert row is not None
    return dict(zip(_RUN_COLUMNS, row, strict=True))


def _fetch_result_rows(conn: psycopg.Connection, run_id: uuid.UUID) -> list[dict[str, object]]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT instrument_id, data_type, outcome "
            "FROM run_instrument_result WHERE run_id = %s "
            "ORDER BY instrument_id, data_type",
            (run_id,),
        )
        return [
            {"instrument_id": row[0], "data_type": row[1], "outcome": row[2]}
            for row in cur.fetchall()
        ]


# ---------------------------------------------------------------------------
# T002: TC-COMP-019, TC-COMP-241, TC-COMP-242, TC-COMP-266, TC-COMP-267
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements TC-COMP-241
def test_request_cancel_running_moves_to_cancelling(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """request_cancel on a running run sets state to cancelling and records cancel_requested_at.

    TC-COMP-241: running -> cancelling; cancel_requested_at is set; ended_at is absent.
    """
    conn = migrated_run_schema_connection
    run_id = _insert_claimed_run(conn, "running")

    result_state = request_cancel(conn, run_id)

    assert result_state == "cancelling"
    row = _fetch_run(conn, run_id)
    assert row["state"] == "cancelling"
    assert row["cancel_requested_at"] is not None
    assert row["ended_at"] is None
    # Claim fields must still be set — run is non-terminal
    assert row["claimed_by"] is not None
    assert row["heartbeat_at"] is not None


@pytest.mark.postgres
# Implements TC-COMP-242
def test_request_cancel_running_non_terminal_until_finalised(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """A cancelling run is not terminal until finalise is called.

    TC-COMP-242: after request_cancel the run remains in 'cancelling'; only
    after finalise does it reach 'cancelled'.
    """
    conn = migrated_run_schema_connection
    run_id = _insert_claimed_run(conn, "running")
    request_cancel(conn, run_id)

    # Verify it is still non-terminal
    row = _fetch_run(conn, run_id)
    assert row["state"] == "cancelling"
    assert row["ended_at"] is None

    # Now finalise
    terminal = finalise(conn, run_id)

    assert terminal == "cancelled"
    row = _fetch_run(conn, run_id)
    assert row["state"] == "cancelled"
    assert row["ended_at"] is not None
    assert row["claimed_by"] is None
    assert row["heartbeat_at"] is None


@pytest.mark.postgres
# Implements TC-COMP-019
def test_cancellation_requested_true_after_request_cancel(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """cancellation_requested returns True once the run is in 'cancelling'.

    TC-COMP-019: runner observes the cancellation flag between instruments.
    """
    conn = migrated_run_schema_connection
    run_id = _insert_claimed_run(conn, "running")

    assert cancellation_requested(conn, run_id) is False
    request_cancel(conn, run_id)
    assert cancellation_requested(conn, run_id) is True


@pytest.mark.postgres
# Implements TC-COMP-266
def test_cancelled_run_retains_committed_coverage(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Committed result rows survive cancellation byte-for-byte.

    TC-COMP-266: instruments committed before cancellation retain their rows;
    instruments not yet reached have no row.
    """
    conn = migrated_run_schema_connection
    reached_id = _insert_instrument(conn, "REACH")
    unreached_id = _insert_instrument(conn, "UNREA")
    run_id = _insert_claimed_run(conn, "running")

    # Simulate work already written for the reached instrument
    for dt in ("reference", "prices", "fundamentals", "corporate_actions"):
        _insert_result_row(conn, run_id, reached_id, dt, "written")

    # Cancel and finalise
    request_cancel(conn, run_id)
    finalise(conn, run_id)

    rows = _fetch_result_rows(conn, run_id)
    reached_rows = [r for r in rows if r["instrument_id"] == reached_id]
    unreached_rows = [r for r in rows if r["instrument_id"] == unreached_id]

    assert len(reached_rows) == 4
    assert all(r["outcome"] == "written" for r in reached_rows)
    assert unreached_rows == []


@pytest.mark.postgres
# Implements TC-COMP-267
def test_cancelled_run_distinct_from_failed(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """After cancellation, the terminal state is 'cancelled', never 'failed'.

    TC-COMP-267: cancelled is a distinct terminal outcome from failed.
    """
    conn = migrated_run_schema_connection
    run_id = _insert_claimed_run(conn, "running")
    request_cancel(conn, run_id)
    state = finalise(conn, run_id)

    assert state == "cancelled"
    assert state != "failed"


# ---------------------------------------------------------------------------
# T003: TC-COMP-026, TC-COMP-243, TC-COMP-244, TC-COMP-268, TC-COMP-269
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements TC-COMP-243
def test_request_cancel_queued_moves_directly_to_cancelled(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """request_cancel on a requested run moves directly to cancelled with ended_at.

    TC-COMP-243: requested -> cancelled immediately; started_at is null;
    ended_at is set; run is never claimable.
    """
    conn = migrated_run_schema_connection
    run_id = _insert_requested_run(conn)

    result_state = request_cancel(conn, run_id)

    assert result_state == "cancelled"
    row = _fetch_run(conn, run_id)
    assert row["state"] == "cancelled"
    assert row["ended_at"] is not None
    assert row["started_at"] is None


@pytest.mark.postgres
# Implements TC-COMP-244
def test_cancelled_queued_run_excluded_from_claim_next(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """A cancelled-before-start run is not claimable.

    TC-COMP-244: claim_next returns None after a requested run is cancelled.
    """
    conn = migrated_run_schema_connection
    run_id = _insert_requested_run(conn)
    request_cancel(conn, run_id)

    claimed = claim_next(conn, "runner-test")
    assert claimed is None


@pytest.mark.postgres
# Implements TC-COMP-026
def test_cancel_queued_run_leaves_active_run_unchanged(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Cancelling a queued run does not affect a concurrently running run.

    TC-COMP-026: the active run's fields are byte-for-byte unchanged after
    the queued run is cancelled.
    """
    conn = migrated_run_schema_connection
    active_id = _insert_claimed_run(conn, "running")
    active_before = _fetch_run(conn, active_id)

    queued_id = _insert_requested_run(conn)
    request_cancel(conn, queued_id)

    active_after = _fetch_run(conn, active_id)
    assert active_after == active_before


@pytest.mark.postgres
# Implements TC-COMP-268
@pytest.mark.parametrize(
    "terminal_state",
    ["succeeded", "partial", "failed", "cancelled", "abandoned"],
)
def test_request_cancel_terminal_raises_already_terminal(
    migrated_run_schema_connection: psycopg.Connection,
    terminal_state: str,
) -> None:
    """request_cancel on a terminal run raises RunAlreadyTerminal with the actual state.

    TC-COMP-268: every terminal state raises RunAlreadyTerminal; the row
    is unchanged.
    """
    conn = migrated_run_schema_connection
    run_id = uuid.uuid4()
    # Insert terminal row directly — bypass claim constraint
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, ended_at) "
            "VALUES (%s, %s, 1, now())",
            (run_id, terminal_state),
        )
    conn.commit()
    row_before = _fetch_run(conn, run_id)

    with pytest.raises(RunAlreadyTerminal) as exc_info:
        request_cancel(conn, run_id)

    assert exc_info.value.actual_state == terminal_state
    assert _fetch_run(conn, run_id) == row_before


@pytest.mark.postgres
# Implements TC-COMP-269
def test_request_cancel_terminal_race_named_state(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """A run that completed between the decision and the request names its actual state.

    TC-COMP-269: the exception carries the exact persisted state when the
    run has already finished.
    """
    conn = migrated_run_schema_connection
    run_id = _insert_claimed_run(conn, "running")
    # Finalise the run to succeeded
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE acquisition_run "
            "SET state = 'succeeded', ended_at = now(), "
            "claimed_by = NULL, heartbeat_at = NULL "
            "WHERE run_id = %s",
            (run_id,),
        )
    conn.commit()

    with pytest.raises(RunAlreadyTerminal) as exc_info:
        request_cancel(conn, run_id)

    assert exc_info.value.actual_state == "succeeded"
