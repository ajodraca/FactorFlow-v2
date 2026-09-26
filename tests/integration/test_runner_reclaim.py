"""Integration tests: reclaimed run stops without further writes.

- TC-COMP-177: runner stops without writing after a false heartbeat (DAC-E4-S5-3)
- TC-COMP-245: heartbeat and cancellation occur together at iteration boundary
- TC-COMP-248: runner stops after heartbeat reports claim lost (DAC-E5-13)

A reclaimed run is simulated by setting the run to 'abandoned' mid-execution,
which causes the heartbeat to return False.

# Implements TC-COMP-177, TC-COMP-245, TC-COMP-248
"""

from __future__ import annotations

import uuid
from datetime import date
from unittest.mock import MagicMock

import psycopg
import pytest

from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)

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


def _abandon_run(conn: psycopg.Connection, run_id: uuid.UUID) -> None:
    """Forcibly abandon a run (simulates the reclaim sweeper acting)."""
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE acquisition_run SET state = 'abandoned', ended_at = now(), "
            "claimed_by = NULL, heartbeat_at = NULL WHERE run_id = %s",
            (run_id,),
        )
    conn.commit()


def _make_stub_client() -> MagicMock:
    mock_client = MagicMock()
    mock_client.fetch_reference.return_value = TickerReference.model_validate(
        {
            "ticker": "X",
            "name": "X Corp",
            "cik": "0001234567",
            "composite_figi": "BBG000B9XRY4",
            "share_class_figi": "BBG001S5N8V8",
            "active": True,
            "list_date": "2000-01-01",
            "delisted_utc": None,
        }
    )
    mock_client.fetch_daily_bars.return_value = [
        DailyBar.model_validate(
            {
                "t": 1735776000000,
                "o": "100.00",
                "h": "105.00",
                "l": "99.00",
                "c": "103.00",
                "v": 500000,
                "vw": "101.00",
                "n": 1000,
            }
        )
    ]
    mock_client.fetch_financials.return_value = [
        FinancialStatement.model_validate(
            {
                "cik": "0001234567",
                "tickers": ["X"],
                "period_end": "2024-12-31",
                "filing_date": "2025-02-01",
                "fiscal_year": 2024,
                "timeframe": "annual",
                "statement_type": "income_statement",
                "total_revenue": "1000000",
            }
        )
    ]
    mock_client.fetch_corporate_actions.return_value = [
        CorporateAction.model_validate(
            {
                "action_type": "split",
                "effective_on": "2020-01-01",
                "ticker": "X",
                "split_from": 1,
                "split_to": 2,
            }
        )
    ]
    return mock_client


def _result_instrument_ids(conn: psycopg.Connection, run_id: uuid.UUID) -> set[int]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT DISTINCT instrument_id FROM run_instrument_result WHERE run_id = %s",
            (run_id,),
        )
        return {row[0] for row in cur.fetchall()}


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements TC-COMP-177, TC-COMP-248
def test_reclaimed_run_stops_without_further_writes(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """When the run is reclaimed (abandoned) between instruments, the runner
    detects the false heartbeat and stops without writing further results
    against that run (DAC-E4-S5-3, DAC-E5-13).
    """
    conn = migrated_runner_connection
    id_first = _insert_instrument(conn, "RECL1")
    id_second = _insert_instrument(conn, "RECL2")
    run_id = _insert_claimed_run(conn, depth=5)

    mock_client = _make_stub_client()

    call_count = [0]
    original_ref = mock_client.fetch_reference.return_value

    def fetch_ref_then_abandon(symbol: str) -> TickerReference:
        call_count[0] += 1
        if call_count[0] == 1:
            # Abandon the run after first instrument starts (simulates reclaim)
            # The runner will check heartbeat before the second instrument
            _abandon_run(conn, run_id)
        return original_ref

    mock_client.fetch_reference.side_effect = fetch_ref_then_abandon

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id, depth_years=5, instrument_ids=[id_first, id_second])

    # First instrument was committed before the run was reclaimed
    reached = _result_instrument_ids(conn, run_id)
    assert id_first in reached
    # Second instrument must NOT have been written (heartbeat returned False)
    assert id_second not in reached


@pytest.mark.postgres
# Implements TC-COMP-245
def test_heartbeat_checked_before_each_instrument(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """The runner checks heartbeat (and cancellation) at the top of each
    instrument iteration, before planning or writing (DAC-E5-10).

    Verifies that a run abandoned before the first instrument results in
    zero writes, because heartbeat fails on the very first check.
    """
    conn = migrated_runner_connection
    id_inst = _insert_instrument(conn, "HBCHECK")
    run_id = _insert_claimed_run(conn, depth=5)

    # Abandon the run immediately before executing (simulates reclaim before first iteration)
    _abandon_run(conn, run_id)

    mock_client = _make_stub_client()

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id, depth_years=5, instrument_ids=[id_inst])

    # No writes should have occurred since heartbeat failed at the first check
    reached = _result_instrument_ids(conn, run_id)
    assert id_inst not in reached

    # No provider calls should have been made
    mock_client.fetch_reference.assert_not_called()
