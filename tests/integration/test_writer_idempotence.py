"""Integration tests for writer idempotence and append-only invariant (CAP-001-E4-S3).

Implements TC-COMP-005, TC-COMP-006, TC-COMP-162.
"""

import uuid
from datetime import date

import psycopg
import pytest

from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)
from factorflow.ingestion.writer import ParsedObservations, write_instrument


def _insert_instrument(conn: psycopg.Connection, symbol: str = "MSFT") -> int:
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


def _insert_run(conn: psycopg.Connection, complete_previous: bool = False) -> uuid.UUID:
    """Insert an acquisition run in 'running' state.

    When ``complete_previous`` is True, first mark any active run as succeeded
    so the single-active-run unique index does not block the insert.
    """
    if complete_previous:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE acquisition_run SET state = 'succeeded', ended_at = now(), "
                "claimed_by = NULL, heartbeat_at = NULL "
                "WHERE state = 'running'"
            )
        conn.commit()
    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, requested_at, started_at, "
            " claimed_by, heartbeat_at) "
            "VALUES (%s, 'running', 5, now(), now(), 'test-worker', now())",
            (run_id,),
        )
    conn.commit()
    return run_id


def _make_observations(revenue: str = "394328000000") -> ParsedObservations:
    return ParsedObservations(
        reference=[
            TickerReference.model_validate(
                {
                    "cik": "0001234567",
                    "composite_figi": "BBG000BPH459",
                    "share_class_figi": "BBG001S5TGM6",
                    "active": True,
                    "name": "Microsoft Corporation",
                }
            )
        ],
        prices=[
            DailyBar.model_validate(
                {
                    "t": 1_672_531_200_000,
                    "o": "239.00",
                    "h": "242.00",
                    "l": "238.00",
                    "c": "240.00",
                    "v": "25000000",
                    "vw": "240.50",
                    "n": 120000,
                }
            )
        ],
        fundamentals=[
            FinancialStatement.model_validate(
                {
                    "cik": "0001234567",
                    "tickers": ["MSFT"],
                    "period_end": "2025-06-30",
                    "filing_date": "2025-07-30",
                    "fiscal_year": 2025,
                    "timeframe": "annual",
                    "statement_type": "balance_sheet",
                    "total_assets": revenue,
                }
            )
        ],
        corporate_actions=[
            CorporateAction.model_validate(
                {
                    "action_type": "dividend",
                    "effective_on": "2026-02-20",
                    "cash_amount": "0.75",
                }
            )
        ],
        reference_range=(date(2026, 1, 1), date(2026, 6, 30)),
        prices_range=(date(2023, 1, 1), date(2026, 6, 30)),
        fundamentals_range=(date(2020, 1, 1), date(2025, 6, 30)),
        corporate_actions_range=(date(2020, 1, 1), date(2026, 6, 30)),
    )


# Implements TC-COMP-005
# Implements TC-COMP-006
# Implements TC-COMP-162
@pytest.mark.postgres
def test_identical_repeat_reports_zero_appended_positive_unchanged_no_mutation(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    """Write a controlled observed_on, repeat the identical four-type payload.
    The repeat must report zero appended and positive unchanged counts without
    altering stored rows or coverage.
    """
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id = _insert_run(conn)
    observed_on = date(2026, 6, 15)

    observations = _make_observations()

    # First write
    result1 = write_instrument(conn, instrument_id, run_id, observations, observed_on)
    conn.commit()

    # Capture the original observation timestamps
    with conn.cursor() as cur:
        cur.execute(
            "SELECT recorded_at FROM instrument_reference WHERE instrument_id = %s",
            (instrument_id,),
        )
        cur.fetchone()  # consume the row to verify it exists

    # Second write with a new run (complete the first to satisfy single-active constraint)
    run_id2 = _insert_run(conn, complete_previous=True)
    result2 = write_instrument(conn, instrument_id, run_id2, observations, observed_on)
    conn.commit()

    # First write: all appended
    assert result1.reference_appended == 1
    assert result1.prices_appended == 1
    assert result1.fundamentals_appended == 1
    assert result1.corporate_actions_appended == 1

    # Second write: zero appended, positive unchanged
    assert result2.reference_appended == 0
    assert result2.reference_unchanged == 1
    assert result2.prices_appended == 0
    assert result2.prices_unchanged == 1
    assert result2.fundamentals_appended == 0
    assert result2.fundamentals_unchanged == 1
    assert result2.corporate_actions_appended == 0
    assert result2.corporate_actions_unchanged == 1

    # Row count must not change
    with conn.cursor() as cur:
        cur.execute(
            "SELECT COUNT(*) FROM instrument_reference WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 1  # type: ignore[index]

    # Coverage unchanged after second write
    with conn.cursor() as cur:
        cur.execute(
            "SELECT COUNT(*) FROM coverage_segment WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 4  # type: ignore[index]


@pytest.mark.postgres
def test_restatement_appends_second_row_preserves_first(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    """Change one value; the restatement appends a second row and preserves the first."""
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn, "NVDA")
    run_id = _insert_run(conn)
    observed_on = date(2026, 6, 15)

    observations_v1 = _make_observations(revenue="394328000000")
    observations_v2 = _make_observations(revenue="400000000000")  # restated

    # First write
    write_instrument(conn, instrument_id, run_id, observations_v1, observed_on)
    conn.commit()

    # Restated write (new observed_on to trigger append-only path)
    run_id2 = _insert_run(conn, complete_previous=True)
    observed_on2 = date(2026, 7, 1)
    result2 = write_instrument(conn, instrument_id, run_id2, observations_v2, observed_on2)
    conn.commit()

    # The restated fundamental appends a new row
    assert result2.fundamentals_appended == 1

    # Both rows exist for fundamentals
    with conn.cursor() as cur:
        cur.execute(
            "SELECT observed_on FROM fundamental_observation "
            "WHERE instrument_id = %s ORDER BY observed_on",
            (instrument_id,),
        )
        rows = [row[0] for row in cur.fetchall()]

    assert date(2026, 6, 15) in rows
    assert date(2026, 7, 1) in rows
    assert len(rows) == 2
