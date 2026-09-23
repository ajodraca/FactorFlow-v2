"""Integration tests: no-depth run finalises failed without touching provider.

Exercises CAP-001-E4-S5 for the depth-absent path.
- TC-COMP-147: missing claimed depth makes no provider/writer call and finalises failed

The schema constraint acquisition_run_depth_positive (CHECK history_depth_years >= 1)
prevents inserting a run with depth=0. The story's acceptance criterion DAC-E4-13
is therefore exercised through the runner detecting a `None` depth (the caller
passes depth_years=None to simulate no-stated-depth), which matches the flow chart:
"Run carries a stated depth? -> no -> Finalise as failed".

# Implements TC-COMP-147
"""

from __future__ import annotations

import uuid
from datetime import date
from unittest.mock import MagicMock

import psycopg
import pytest


def _insert_claimed_run(conn: psycopg.Connection, depth: int = 5) -> uuid.UUID:
    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, requested_at, started_at, "
            "claimed_by, heartbeat_at) "
            "VALUES (%s, 'running', %s, now(), now(), 'test-runner', now())",
            (run_id, depth),
        )
    conn.commit()
    return run_id


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


def _fetch_run_state(conn: psycopg.Connection, run_id: uuid.UUID) -> str:
    with conn.cursor() as cur:
        cur.execute("SELECT state FROM acquisition_run WHERE run_id = %s", (run_id,))
        row = cur.fetchone()
    assert row is not None
    return str(row[0])


@pytest.mark.postgres
# Implements TC-COMP-147
def test_no_depth_finalises_failed_without_provider_calls(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """When the runner receives no depth (None), it finalises the run as failed
    without making any provider or writer calls (DAC-E4-13).
    """
    conn = migrated_runner_connection
    run_id = _insert_claimed_run(conn, depth=1)  # depth=1 is valid for schema
    _insert_instrument(conn, "AAPL")

    from factorflow.ingestion.runner import AcquisitionRunner

    mock_client = MagicMock()
    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)

    # depth_years=None means no stated depth — must finalise failed immediately
    runner.execute_claimed(run_id=run_id, depth_years=None, instrument_ids=[])

    # No provider calls made
    mock_client.fetch_reference.assert_not_called()
    mock_client.fetch_daily_bars.assert_not_called()
    mock_client.fetch_financials.assert_not_called()
    mock_client.fetch_corporate_actions.assert_not_called()

    # Run must be terminal 'failed'
    state = _fetch_run_state(conn, run_id)
    assert state == "failed"

    # No result rows written
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM run_instrument_result WHERE run_id = %s", (run_id,))
        count_row = cur.fetchone()
    assert count_row is not None
    assert count_row[0] == 0
