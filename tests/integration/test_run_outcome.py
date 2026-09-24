"""Integration tests: outcome finalisation from persisted results (CAP-001-E5-S3).

Covers TC-COMP-239, TC-COMP-240, TC-COMP-270, TC-COMP-271, TC-COMP-272.
"""

from __future__ import annotations

import uuid

import psycopg
import pytest

from factorflow.runs.journal import finalise

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_DATA_TYPES = ("reference", "prices", "fundamentals", "corporate_actions")


def _insert_claimed_run(conn: psycopg.Connection) -> uuid.UUID:
    """Persist a claimed running run."""
    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, requested_at, started_at, "
            "claimed_by, heartbeat_at) "
            "VALUES (%s, 'running', 1, now(), now(), 'test-runner', now())",
            (run_id,),
        )
    conn.commit()
    return run_id


def _set_instruments_named(conn: psycopg.Connection, run_id: uuid.UUID, count: int) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE acquisition_run SET instruments_named = %s WHERE run_id = %s",
            (count, run_id),
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


def _insert_result_rows(
    conn: psycopg.Connection,
    run_id: uuid.UUID,
    instrument_id: int,
    outcomes: dict[str, str],
) -> None:
    """Insert result rows for a given instrument with specified per-data-type outcomes."""
    with conn.cursor() as cur:
        for data_type, outcome in outcomes.items():
            cur.execute(
                "INSERT INTO run_instrument_result (run_id, instrument_id, data_type, outcome) "
                "VALUES (%s, %s, %s, %s)",
                (run_id, instrument_id, data_type, outcome),
            )
    conn.commit()


def _fetch_run_state(conn: psycopg.Connection, run_id: uuid.UUID) -> str:
    with conn.cursor() as cur:
        cur.execute("SELECT state FROM acquisition_run WHERE run_id = %s", (run_id,))
        row = cur.fetchone()
    assert row is not None
    return str(row[0])


def _fetch_ended_at(conn: psycopg.Connection, run_id: uuid.UUID) -> object:
    with conn.cursor() as cur:
        cur.execute("SELECT ended_at FROM acquisition_run WHERE run_id = %s", (run_id,))
        row = cur.fetchone()
    assert row is not None
    return row[0]


# ---------------------------------------------------------------------------
# T004: TC-COMP-239, TC-COMP-240, TC-COMP-270
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements TC-COMP-239
def test_finalise_all_written_succeeds(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """All four data-type rows with 'written' per named instrument → succeeded.

    TC-COMP-239: instruments_named == 1, all four data types written → succeeded.
    """
    conn = migrated_run_schema_connection
    instrument_id = _insert_instrument(conn, "SW001")
    run_id = _insert_claimed_run(conn)
    _set_instruments_named(conn, run_id, 1)
    _insert_result_rows(conn, run_id, instrument_id, {dt: "written" for dt in _DATA_TYPES})

    state = finalise(conn, run_id)

    assert state == "succeeded"
    assert _fetch_run_state(conn, run_id) == "succeeded"
    assert _fetch_ended_at(conn, run_id) is not None


@pytest.mark.postgres
# Implements TC-COMP-239
def test_finalise_all_unchanged_succeeds(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """All four data-type rows with 'unchanged' per named instrument → succeeded.

    TC-COMP-239: unchanged is a successful outcome and earns succeeded.
    """
    conn = migrated_run_schema_connection
    instrument_id = _insert_instrument(conn, "SU001")
    run_id = _insert_claimed_run(conn)
    _set_instruments_named(conn, run_id, 1)
    _insert_result_rows(conn, run_id, instrument_id, {dt: "unchanged" for dt in _DATA_TYPES})

    state = finalise(conn, run_id)

    assert state == "succeeded"


@pytest.mark.postgres
# Implements TC-COMP-240
def test_finalise_missing_one_data_type_cannot_succeed(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Fewer than four successful rows per named instrument cannot finalise as succeeded.

    TC-COMP-240: missing one required data-type row forces partial or failed,
    never succeeded.
    """
    conn = migrated_run_schema_connection
    instrument_id = _insert_instrument(conn, "SM001")
    run_id = _insert_claimed_run(conn)
    _set_instruments_named(conn, run_id, 1)
    # Omit 'corporate_actions'
    _insert_result_rows(
        conn,
        run_id,
        instrument_id,
        {"reference": "written", "prices": "written", "fundamentals": "written"},
    )

    state = finalise(conn, run_id)

    assert state != "succeeded"


@pytest.mark.postgres
# Implements TC-COMP-270
def test_finalise_multiple_instruments_all_written_succeeds(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """All named instruments with all four written data types → succeeded.

    TC-COMP-270: instruments_named == 2; both fully written → succeeded.
    """
    conn = migrated_run_schema_connection
    id_a = _insert_instrument(conn, "MA001")
    id_b = _insert_instrument(conn, "MB001")
    run_id = _insert_claimed_run(conn)
    _set_instruments_named(conn, run_id, 2)
    _insert_result_rows(conn, run_id, id_a, {dt: "written" for dt in _DATA_TYPES})
    _insert_result_rows(conn, run_id, id_b, {dt: "unchanged" for dt in _DATA_TYPES})

    state = finalise(conn, run_id)

    assert state == "succeeded"


# ---------------------------------------------------------------------------
# T005: TC-COMP-240, TC-COMP-271, TC-COMP-272
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements TC-COMP-271
def test_finalise_mixed_success_and_not_found_is_partial(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """At least one written/unchanged and one not_found → partial, never succeeded.

    TC-COMP-271: mixed success and not_found finalises as partial.
    """
    conn = migrated_run_schema_connection
    instrument_id = _insert_instrument(conn, "PM001")
    run_id = _insert_claimed_run(conn)
    _set_instruments_named(conn, run_id, 1)
    _insert_result_rows(
        conn,
        run_id,
        instrument_id,
        {
            "reference": "written",
            "prices": "written",
            "fundamentals": "not_found",
            "corporate_actions": "written",
        },
    )

    state = finalise(conn, run_id)

    assert state == "partial"
    assert state != "succeeded"


@pytest.mark.postgres
# Implements TC-COMP-271
def test_finalise_mixed_success_and_failed_is_partial(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """At least one written/unchanged and one failed → partial.

    TC-COMP-271: mixed success and failed is partial, not succeeded.
    """
    conn = migrated_run_schema_connection
    instrument_id = _insert_instrument(conn, "PF001")
    run_id = _insert_claimed_run(conn)
    _set_instruments_named(conn, run_id, 1)
    _insert_result_rows(
        conn,
        run_id,
        instrument_id,
        {
            "reference": "written",
            "prices": "failed",
            "fundamentals": "written",
            "corporate_actions": "written",
        },
    )

    state = finalise(conn, run_id)

    assert state == "partial"


@pytest.mark.postgres
# Implements TC-COMP-272
def test_finalise_no_instruments_reached_is_failed(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Zero instruments reached → failed.

    TC-COMP-272: when no run_instrument_result rows exist, the outcome is failed.
    """
    conn = migrated_run_schema_connection
    run_id = _insert_claimed_run(conn)
    _set_instruments_named(conn, run_id, 1)

    state = finalise(conn, run_id)

    assert state == "failed"


@pytest.mark.postgres
# Implements TC-COMP-272
def test_finalise_all_not_found_is_failed(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """All reached rows are not_found or failed → failed (zero successful rows).

    TC-COMP-272: all reached instruments have only not_found/failed results
    → failed.
    """
    conn = migrated_run_schema_connection
    instrument_id = _insert_instrument(conn, "FA001")
    run_id = _insert_claimed_run(conn)
    _set_instruments_named(conn, run_id, 1)
    _insert_result_rows(conn, run_id, instrument_id, {dt: "not_found" for dt in _DATA_TYPES})

    state = finalise(conn, run_id)

    assert state == "failed"


@pytest.mark.postgres
# Implements TC-COMP-240
def test_finalise_skipped_result_is_not_successful(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """A 'skipped' result is not in the successful set.

    TC-COMP-240: skipped does not count as written/unchanged; a mix of
    successful and skipped rows cannot earn succeeded.
    """
    conn = migrated_run_schema_connection
    instrument_id = _insert_instrument(conn, "SK001")
    run_id = _insert_claimed_run(conn)
    _set_instruments_named(conn, run_id, 1)
    _insert_result_rows(
        conn,
        run_id,
        instrument_id,
        {
            "reference": "written",
            "prices": "written",
            "fundamentals": "written",
            "corporate_actions": "skipped",
        },
    )

    state = finalise(conn, run_id)

    assert state != "succeeded"
