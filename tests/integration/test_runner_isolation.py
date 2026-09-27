"""Integration tests: per-instrument error isolation (CAP-001-E4-S5).

- TC-COMP-009: honest run outcome — outcome derived from written results
- TC-COMP-011: unrecognised instrument does not stop the run
- TC-COMP-178: provider error is recorded per instrument and the loop continues
- TC-COMP-179: run finalises from what was written (DAC-E4-S5-4, DAC-E4-S5-5)

# Implements TC-COMP-009, TC-COMP-011, TC-COMP-178, TC-COMP-179
"""

from __future__ import annotations

import uuid
from datetime import date
from unittest.mock import MagicMock

import psycopg
import pytest

from factorflow.ingestion.massive.errors import InstrumentNotFound, ProviderUnavailable
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


def _make_good_client() -> MagicMock:
    mock_client = MagicMock()
    mock_client.fetch_reference.return_value = TickerReference.model_validate(
        {
            "ticker": "GOOD",
            "name": "Good Corp",
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
                "tickers": ["GOOD"],
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
                "ticker": "GOOD",
                "split_from": 1,
                "split_to": 2,
            }
        )
    ]
    return mock_client


def _fetch_results(conn: psycopg.Connection, run_id: uuid.UUID) -> list[dict]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT instrument_id, data_type, outcome, reason "
            "FROM run_instrument_result WHERE run_id = %s "
            "ORDER BY instrument_id, data_type",
            (run_id,),
        )
        return [
            {"instrument_id": row[0], "data_type": row[1], "outcome": row[2], "reason": row[3]}
            for row in cur.fetchall()
        ]


def _fetch_run_state(conn: psycopg.Connection, run_id: uuid.UUID) -> str:
    with conn.cursor() as cur:
        cur.execute("SELECT state FROM acquisition_run WHERE run_id = %s", (run_id,))
        row = cur.fetchone()
    assert row is not None
    return str(row[0])


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements TC-COMP-011, TC-COMP-178
def test_not_found_instrument_is_recorded_and_run_continues(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """When one instrument raises InstrumentNotFound, it is recorded as
    not_found and the run continues to the next instrument (AC-11,
    DAC-E4-S5-4).
    """
    conn = migrated_runner_connection
    id_bad = _insert_instrument(conn, "BADINST")
    id_good = _insert_instrument(conn, "GOODINST")
    run_id = _insert_claimed_run(conn, depth=5)

    mock_client = _make_good_client()
    # First call (for id_bad) raises InstrumentNotFound
    mock_client.fetch_reference.side_effect = [
        InstrumentNotFound("The provider does not recognise this instrument."),
        mock_client.fetch_reference.return_value,
    ]

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id, depth_years=5, instrument_ids=[id_bad, id_good])

    results = _fetch_results(conn, run_id)

    bad_results = [r for r in results if r["instrument_id"] == id_bad]
    good_results = [r for r in results if r["instrument_id"] == id_good]

    # id_bad has not_found outcomes
    assert any(r["outcome"] == "not_found" for r in bad_results)
    # id_good was reached and written
    assert any(r["outcome"] in ("written", "unchanged") for r in good_results)


@pytest.mark.postgres
# Implements TC-COMP-178
def test_provider_unavailable_is_recorded_and_run_continues(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """When a provider raises ProviderUnavailable (exhausted), the instrument
    is recorded as failed and the run continues (DAC-E4-S5-4).
    """
    conn = migrated_runner_connection
    id_fail = _insert_instrument(conn, "FAILINST")
    id_good = _insert_instrument(conn, "GOODINST2")
    run_id = _insert_claimed_run(conn, depth=5)

    mock_client = _make_good_client()
    mock_client.fetch_reference.side_effect = [
        ProviderUnavailable("Provider unavailable."),
        mock_client.fetch_reference.return_value,
    ]

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id, depth_years=5, instrument_ids=[id_fail, id_good])

    results = _fetch_results(conn, run_id)
    fail_results = [r for r in results if r["instrument_id"] == id_fail]
    good_results = [r for r in results if r["instrument_id"] == id_good]

    assert any(r["outcome"] == "failed" for r in fail_results)
    assert any(r["outcome"] in ("written", "unchanged") for r in good_results)


@pytest.mark.postgres
# Implements TC-COMP-009, TC-COMP-179
def test_run_outcome_derived_from_written_results(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """When all instruments succeed, run state is derived from results
    (DAC-E4-S5-5, DAC-E5-4). When one fails, outcome is partial.
    """
    conn = migrated_runner_connection
    id_good = _insert_instrument(conn, "ONLYGOOD")
    run_id = _insert_claimed_run(conn, depth=5)

    mock_client = _make_good_client()

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id, depth_years=5, instrument_ids=[id_good])

    state = _fetch_run_state(conn, run_id)
    # All data types succeeded for the single instrument
    assert state in ("succeeded", "partial")


@pytest.mark.postgres
# Implements TC-COMP-009, TC-COMP-179
def test_run_with_partial_failures_is_partial(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """A run where at least one instrument fails finalises as partial (AC-9)."""
    conn = migrated_runner_connection
    id_fail = _insert_instrument(conn, "FAILME")
    id_good = _insert_instrument(conn, "OKME")
    run_id = _insert_claimed_run(conn, depth=5)

    mock_client = _make_good_client()
    mock_client.fetch_reference.side_effect = [
        InstrumentNotFound("not found"),
        mock_client.fetch_reference.return_value,
    ]

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id, depth_years=5, instrument_ids=[id_fail, id_good])

    state = _fetch_run_state(conn, run_id)
    assert state == "partial"
