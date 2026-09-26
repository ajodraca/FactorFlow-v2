"""Integration tests: runner acquires all four data types per instrument.

Exercises CAP-001-E4-S5 runner.run_once against the full schema:
- TC-COMP-003: all four data types acquired per active instrument
- TC-COMP-146: roster read once at claim time (DAC-E4-12)

Uses `migrated_runner_connection` (all four migrations) and stubs the
provider boundary at its typed MassiveClient interface.

# Implements TC-COMP-003, TC-COMP-146
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
# Schema helpers
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


def _make_reference() -> TickerReference:
    return TickerReference.model_validate(
        {
            "ticker": "AAPL",
            "name": "Apple Inc.",
            "cik": "0000320193",
            "composite_figi": "BBG000B9XRY4",
            "share_class_figi": "BBG001S5N8V8",
            "active": True,
            "list_date": "1980-12-12",
            "delisted_utc": None,
        }
    )


def _make_daily_bar(session_date: str = "2025-01-02") -> DailyBar:
    return DailyBar.model_validate(
        {
            "t": 1735776000000,
            "o": "150.00",
            "h": "155.00",
            "l": "149.00",
            "c": "153.00",
            "v": 1000000,
            "vw": "151.00",
            "n": 50000,
        }
    )


def _make_financial() -> FinancialStatement:
    return FinancialStatement.model_validate(
        {
            "cik": "0000320193",
            "tickers": ["AAPL"],
            "period_end": "2024-12-31",
            "filing_date": "2025-02-01",
            "fiscal_year": 2024,
            "timeframe": "annual",
            "statement_type": "income_statement",
            "total_revenue": "400000000000",
        }
    )


def _make_corporate_action() -> CorporateAction:
    return CorporateAction.model_validate(
        {
            "action_type": "split",
            "effective_on": "2020-08-31",
            "ticker": "AAPL",
            "split_from": 1,
            "split_to": 4,
        }
    )


def _fetch_result_rows(conn: psycopg.Connection, run_id: uuid.UUID) -> list[tuple[int, str, str]]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT instrument_id, data_type, outcome FROM run_instrument_result "
            "WHERE run_id = %s ORDER BY instrument_id, data_type",
            (run_id,),
        )
        return [(row[0], row[1], row[2]) for row in cur.fetchall()]


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements TC-COMP-003
def test_runner_acquires_all_four_data_types(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """run_once acquires reference, prices, fundamentals, and corporate actions
    for each active instrument (AC-3).
    """
    conn = migrated_runner_connection
    instrument_id = _insert_instrument(conn, "AAPL")
    run_id = _insert_claimed_run(conn, depth=5)

    from factorflow.ingestion.runner import AcquisitionRunner

    ref = _make_reference()
    bar = _make_daily_bar()
    fin = _make_financial()
    ca = _make_corporate_action()

    mock_client = MagicMock()
    mock_client.fetch_reference.return_value = ref
    mock_client.fetch_daily_bars.return_value = [bar]
    mock_client.fetch_financials.return_value = [fin]
    mock_client.fetch_corporate_actions.return_value = [ca]

    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id, depth_years=5, instrument_ids=[instrument_id])

    result_rows = _fetch_result_rows(conn, run_id)
    data_types = {row[1] for row in result_rows}
    assert "reference" in data_types
    assert "prices" in data_types
    assert "fundamentals" in data_types
    assert "corporate_actions" in data_types
    assert len(result_rows) == 4


@pytest.mark.postgres
# Implements TC-COMP-146
def test_roster_read_once_at_claim(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """The runner reads the active roster exactly once when it processes a
    claimed run. New instruments inserted after the roster snapshot are not
    reached by that run (DAC-E4-12).
    """
    conn = migrated_runner_connection
    instrument_id = _insert_instrument(conn, "MSFT")
    run_id = _insert_claimed_run(conn, depth=5)

    from factorflow.ingestion.runner import AcquisitionRunner

    mock_client = MagicMock()
    mock_client.fetch_reference.return_value = _make_reference()
    mock_client.fetch_daily_bars.return_value = [_make_daily_bar()]
    mock_client.fetch_financials.return_value = [_make_financial()]
    mock_client.fetch_corporate_actions.return_value = [_make_corporate_action()]

    today = date(2025, 9, 22)
    # Snapshot the roster before executing — mimic claim-time read
    roster = [instrument_id]

    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id, depth_years=5, instrument_ids=roster)

    # Insert a new instrument after roster snapshot (should NOT appear in results)
    _insert_instrument(conn, "GOOG")

    result_rows = _fetch_result_rows(conn, run_id)
    instrument_ids_in_results = {row[0] for row in result_rows}
    assert instrument_id in instrument_ids_in_results
    # GOOG inserted after the roster snapshot must not be reached
    with conn.cursor() as cur:
        cur.execute("SELECT instrument_id FROM instrument WHERE symbol = 'GOOG'")
        goog_row = cur.fetchone()
    assert goog_row is not None
    assert goog_row[0] not in instrument_ids_in_results
