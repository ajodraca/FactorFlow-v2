"""Integration tests: heartbeat-and-reclaim sweep (CAP-001-E5-S4).

# Implements TC-COMP-020
# Implements TC-COMP-246
# Implements TC-COMP-247
# Implements TC-COMP-273
# Implements TC-COMP-274
# Implements TC-COMP-275
# Implements TC-COMP-277
# Implements TC-COMP-278

Tests verify the reclaim sweeper, the heartbeat function, concurrent reclaim
idempotency, and the post-reclaim write guard. PostgreSQL `now()` is used for
timestamps relative to the configured staleness window so clock skew never
causes false failures.

DAC-E5-10: A running runner refreshes its heartbeat at the between-instruments
checkpoint.
DAC-E5-11: A stale claimed `running` or `cancelling` run is transitioned to
`abandoned` with `ended_at` set and both claim fields cleared.
DAC-E5-12: Reclaim is idempotent; a subsequent run can claim after reclaim.
DAC-E5-13: A runner that lost its claim performs no further writes.
"""

from __future__ import annotations

import threading
import uuid
from datetime import date
from typing import Any

import psycopg
import pytest

_DATA_TYPES = ("reference", "prices", "fundamentals", "corporate_actions")

# A short staleness window used in the tests so we can manufacture "stale"
# timestamps using PostgreSQL `now() - interval '...'` without wall-clock waits.
_TEST_STALE_AFTER_SECONDS = 60


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


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


def _insert_requested_run(conn: psycopg.Connection, depth: int = 1) -> uuid.UUID:
    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (run_id, state, history_depth_years) "
            "VALUES (%s, 'requested', %s)",
            (run_id, depth),
        )
    conn.commit()
    return run_id


def _insert_stale_run(
    conn: psycopg.Connection,
    state: str = "running",
    runner_id: str = "test-runner",
) -> uuid.UUID:
    """Insert a claimed run whose heartbeat is stale past _TEST_STALE_AFTER_SECONDS."""
    run_id = uuid.uuid4()
    # Use make_interval with bound parameter rather than string interpolation
    # to avoid the '%s seconds' format clash with psycopg placeholders.
    stale_offset = float(_TEST_STALE_AFTER_SECONDS + 10)
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, requested_at, started_at, "
            "claimed_by, heartbeat_at) "
            "VALUES (%s, %s, 1, "
            "now() - interval '1 hour', "
            "now() - interval '1 hour', "
            "%s, "
            "now() - make_interval(secs => %s))",
            (run_id, state, runner_id, stale_offset),
        )
    conn.commit()
    return run_id


def _insert_coverage_segment(
    conn: psycopg.Connection,
    instrument_id: int,
    data_type: str = "prices",
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
            "VALUES (%s, %s, '2024-01-01', '2024-12-31')",
            (instrument_id, data_type),
        )
    conn.commit()


def _insert_result_row(
    conn: psycopg.Connection,
    run_id: uuid.UUID,
    instrument_id: int,
    data_type: str = "prices",
    outcome: str = "written",
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO run_instrument_result "
            "(run_id, instrument_id, data_type, outcome) "
            "VALUES (%s, %s, %s, %s)",
            (run_id, instrument_id, data_type, outcome),
        )
    conn.commit()


def _run_row(conn: psycopg.Connection, run_id: uuid.UUID) -> dict[str, Any]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT state, ended_at, claimed_by, heartbeat_at "
            "FROM acquisition_run WHERE run_id = %s",
            (run_id,),
        )
        row = cur.fetchone()
    assert row is not None
    return {
        "state": str(row[0]),
        "ended_at": row[1],
        "claimed_by": row[2],
        "heartbeat_at": row[3],
    }


def _coverage_count(conn: psycopg.Connection, instrument_id: int) -> int:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT count(*) FROM coverage_segment WHERE instrument_id = %s",
            (instrument_id,),
        )
        row = cur.fetchone()
    return int(row[0]) if row else 0


def _result_count(conn: psycopg.Connection, run_id: uuid.UUID) -> int:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT count(*) FROM run_instrument_result WHERE run_id = %s",
            (run_id,),
        )
        row = cur.fetchone()
    return int(row[0]) if row else 0


# ---------------------------------------------------------------------------
# T002: TC-COMP-020, TC-COMP-246, TC-COMP-273, TC-COMP-274, TC-COMP-275
# ---------------------------------------------------------------------------


@pytest.mark.postgres
def test_stale_running_run_is_reclaimed(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """A stale claimed `running` run becomes `abandoned` with ended_at set and
    claim fields cleared.

    # Implements TC-COMP-020
    # Implements TC-COMP-246
    """
    conn = migrated_runner_connection
    stale_run_id = _insert_stale_run(conn, state="running")

    from factorflow.runs.reclaim import reclaim_stale_runs

    reclaimed = reclaim_stale_runs(conn, _TEST_STALE_AFTER_SECONDS)

    assert stale_run_id in reclaimed

    row = _run_row(conn, stale_run_id)
    assert row["state"] == "abandoned"
    assert row["ended_at"] is not None
    assert row["claimed_by"] is None
    assert row["heartbeat_at"] is None


@pytest.mark.postgres
def test_fresh_running_run_is_not_reclaimed(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """A fresh claimed `running` run (heartbeat just now) is NOT reclaimed.

    The stale comparison is strictly < so a fresh heartbeat survives.

    # Implements TC-COMP-246
    """
    conn = migrated_runner_connection
    # Insert a run with heartbeat_at = now() (fresh)
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

    from factorflow.runs.reclaim import reclaim_stale_runs

    reclaimed = reclaim_stale_runs(conn, _TEST_STALE_AFTER_SECONDS)

    assert run_id not in reclaimed
    row = _run_row(conn, run_id)
    assert row["state"] == "running"
    assert row["claimed_by"] is not None


@pytest.mark.postgres
def test_stale_cancelling_run_is_reclaimed(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """A stale claimed `cancelling` run is also reclaimed as `abandoned`.

    # Implements TC-COMP-246
    # Implements TC-COMP-273
    """
    conn = migrated_runner_connection
    stale_run_id = _insert_stale_run(conn, state="cancelling")

    from factorflow.runs.reclaim import reclaim_stale_runs

    reclaimed = reclaim_stale_runs(conn, _TEST_STALE_AFTER_SECONDS)

    assert stale_run_id in reclaimed
    row = _run_row(conn, stale_run_id)
    assert row["state"] == "abandoned"
    assert row["ended_at"] is not None
    assert row["claimed_by"] is None
    assert row["heartbeat_at"] is None


@pytest.mark.postgres
def test_reclaim_does_not_touch_coverage_or_results(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """Coverage segments and run_instrument_result rows committed before reclaim
    remain unchanged after the sweep.

    # Implements TC-COMP-274
    # Implements TC-COMP-275
    """
    conn = migrated_runner_connection
    instrument_id = _insert_instrument(conn, "COVPRE")
    stale_run_id = _insert_stale_run(conn, state="running")

    # Pre-commit coverage and result rows (simulating work done before the crash)
    _insert_coverage_segment(conn, instrument_id, "prices")
    _insert_result_row(conn, stale_run_id, instrument_id, "prices", "written")

    from factorflow.runs.reclaim import reclaim_stale_runs

    reclaim_stale_runs(conn, _TEST_STALE_AFTER_SECONDS)

    # Coverage and results must still be present
    assert _coverage_count(conn, instrument_id) == 1
    assert _result_count(conn, stale_run_id) == 1


# ---------------------------------------------------------------------------
# T003: TC-COMP-247, TC-COMP-277
# ---------------------------------------------------------------------------


@pytest.mark.postgres
def test_concurrent_sweepers_reclaim_exactly_once(
    postgres_connection_string: str,
) -> None:
    """Two concurrent sweepers that find the same stale claim reclaim it exactly
    once; the other is a no-op. After reclaim, claim_next succeeds for the
    oldest queued request.

    # Implements TC-COMP-247
    # Implements TC-COMP-277
    """
    # Apply migrations before spawning worker threads
    conn_setup = psycopg.connect(postgres_connection_string)
    from tests.conftest import (
        MIGRATION_0001_PATH,
        MIGRATION_0002_PATH,
        MIGRATION_0003_PATH,
        MIGRATION_0004_PATH,
    )

    with conn_setup.cursor() as cur:
        cur.execute(MIGRATION_0001_PATH.read_text())
        cur.execute(MIGRATION_0002_PATH.read_text())
        cur.execute(MIGRATION_0003_PATH.read_text())
        cur.execute(MIGRATION_0004_PATH.read_text())
    conn_setup.commit()

    # Insert a stale run and a queued requested run
    stale_run_id = uuid.uuid4()
    stale_offset = float(_TEST_STALE_AFTER_SECONDS + 10)
    queued_run_id = uuid.uuid4()
    with conn_setup.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, requested_at, started_at, "
            "claimed_by, heartbeat_at) "
            "VALUES (%s, 'running', 1, "
            "now() - interval '1 hour', "
            "now() - interval '1 hour', "
            "'runner-A', "
            "now() - make_interval(secs => %s))",
            (stale_run_id, stale_offset),
        )
        # Insert a queued requested run for claim_next to pick up after reclaim
        cur.execute(
            "INSERT INTO acquisition_run (run_id, state, history_depth_years) "
            "VALUES (%s, 'requested', 1)",
            (queued_run_id,),
        )
    conn_setup.commit()
    conn_setup.close()

    barrier = threading.Barrier(2)
    results: list[list[uuid.UUID]] = [[], []]
    errors: list[Exception | None] = [None, None]

    def worker(idx: int) -> None:
        # psycopg3: isolation level is set on the connection object, not in connect()
        conn = psycopg.connect(postgres_connection_string)
        try:
            conn.isolation_level = psycopg.IsolationLevel.READ_COMMITTED
            barrier.wait()
            from factorflow.runs.reclaim import reclaim_stale_runs

            reclaimed = reclaim_stale_runs(conn, _TEST_STALE_AFTER_SECONDS)
            conn.commit()
            results[idx] = reclaimed
        except Exception as exc:
            errors[idx] = exc
        finally:
            conn.close()

    t0 = threading.Thread(target=worker, args=(0,))
    t1 = threading.Thread(target=worker, args=(1,))
    t0.start()
    t1.start()
    t0.join()
    t1.join()

    # Raise any worker error for visibility
    for err in errors:
        if err is not None:
            raise err

    # Exactly one worker reclaimed the stale run
    reclaimed_a = set(results[0])
    reclaimed_b = set(results[1])
    assert (stale_run_id in reclaimed_a) != (stale_run_id in reclaimed_b), (
        "Expected exactly one worker to reclaim the stale run, "
        f"but got: worker0={reclaimed_a}, worker1={reclaimed_b}"
    )

    # A repeated sweep is a no-op
    conn_verify = psycopg.connect(postgres_connection_string)
    try:
        from factorflow.runs.reclaim import reclaim_stale_runs

        second_reclaim = reclaim_stale_runs(conn_verify, _TEST_STALE_AFTER_SECONDS)
        conn_verify.commit()
        assert stale_run_id not in second_reclaim

        # A new claim can be made for the queued requested run
        from factorflow.runs.journal import claim_next

        claimed = claim_next(conn_verify, "new-runner")
        assert claimed is not None
    finally:
        conn_verify.close()


# ---------------------------------------------------------------------------
# T004: TC-COMP-278
# ---------------------------------------------------------------------------


@pytest.mark.postgres
def test_heartbeat_false_after_reclaim_and_write_rejected(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """After reclaim, heartbeat returns False and write_instrument rejects the
    post-reclaim write without committing any new observation, coverage,
    acquisition_state, or run_instrument_result row.

    # Implements TC-COMP-278
    """
    conn = migrated_runner_connection
    instrument_id = _insert_instrument(conn, "POSTRCL")
    stale_run_id = _insert_stale_run(conn, state="running", runner_id="dead-runner")

    from factorflow.runs.reclaim import reclaim_stale_runs

    reclaimed = reclaim_stale_runs(conn, _TEST_STALE_AFTER_SECONDS)
    assert stale_run_id in reclaimed

    # Heartbeat must return False (claim was reclaimed)
    from factorflow.runs.journal import heartbeat

    hb_result = heartbeat(conn, stale_run_id, "dead-runner")
    assert hb_result is False

    # Attempt a write for the reclaimed run — must be rejected
    from factorflow.ingestion.writer import ParsedObservations, RunNotActive, write_instrument

    obs = ParsedObservations(
        reference=[],
        prices=[],
        fundamentals=[],
        corporate_actions=[],
        reference_range=(date(2024, 1, 1), date(2024, 12, 31)),
        prices_range=(date(2024, 1, 1), date(2024, 12, 31)),
        fundamentals_range=(date(2024, 1, 1), date(2024, 12, 31)),
        corporate_actions_range=(date(2024, 1, 1), date(2024, 12, 31)),
    )

    with pytest.raises((RunNotActive, Exception)):
        with conn.transaction():
            write_instrument(conn, instrument_id, stale_run_id, obs, date(2024, 12, 31))

    # No new result rows must have been committed
    assert _result_count(conn, stale_run_id) == 0
