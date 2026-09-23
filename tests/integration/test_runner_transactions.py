"""Integration tests: per-instrument transaction isolation (CAP-001-E4-S5).

- TC-COMP-004: run of multiple instruments completes without intervention
- TC-COMP-148: each instrument commits in its own transaction; a simulated
  mid-run interruption leaves committed instruments durable and a later run
  fetches only the remaining coverage (DAC-E4-14)

# Implements TC-COMP-004, TC-COMP-148
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
                "t": 1735776000000,  # 2025-01-02
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
                "total_revenue": "1000000000",
            }
        )
    ]
    mock_client.fetch_corporate_actions.return_value = [
        CorporateAction.model_validate(
            {
                "action_type": "split",
                "effective_on": "2020-06-10",
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
# Implements TC-COMP-004
def test_run_completes_multiple_instruments(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """run_once completes a run of multiple instruments without manual intervention (AC-4)."""
    conn = migrated_runner_connection
    ids = [_insert_instrument(conn, s) for s in ["AA", "BB", "CC"]]
    run_id = _insert_claimed_run(conn, depth=5)
    mock_client = _make_stub_client()

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id, depth_years=5, instrument_ids=ids)

    reached = _result_instrument_ids(conn, run_id)
    assert reached == set(ids)


@pytest.mark.postgres
# Implements TC-COMP-148
def test_committed_instrument_survives_simulated_interruption(
    migrated_runner_connection: psycopg.Connection,
    postgres_connection_string: str,
) -> None:
    """After a simulated mid-run interruption (first instrument committed,
    second not), committed coverage is durable and a second run only fetches
    the remaining instrument (DAC-E4-14).

    Simulated by running only the first instrument through the runner, then
    opening a new run for the second.
    """
    conn = migrated_runner_connection
    id_first = _insert_instrument(conn, "FIRST")
    id_second = _insert_instrument(conn, "SECOND")
    run_id_1 = _insert_claimed_run(conn, depth=5)
    mock_client = _make_stub_client()

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    # Run only the first instrument (simulate interruption before second)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id_1, depth_years=5, instrument_ids=[id_first])

    # First instrument is committed
    reached_run1 = _result_instrument_ids(conn, run_id_1)
    assert id_first in reached_run1
    assert id_second not in reached_run1

    # Open a second run for the remaining instrument
    run_id_2 = _insert_claimed_run(conn, depth=5)
    runner2 = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner2.execute_claimed(run_id=run_id_2, depth_years=5, instrument_ids=[id_second])

    reached_run2 = _result_instrument_ids(conn, run_id_2)
    assert id_second in reached_run2
    assert id_first not in reached_run2
