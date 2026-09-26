"""Integration tests for coverage merge via the writer (CAP-001-E4-S3).

Implements TC-COMP-163 (integration portion), TC-COMP-164.
"""

import uuid
from datetime import date

import psycopg
import pytest
from psycopg.errors import ExclusionViolation

from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)
from factorflow.ingestion.writer import ParsedObservations, write_instrument


def _insert_instrument(conn: psycopg.Connection, symbol: str = "GOOG") -> int:
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


def _minimal_observations(prices_range: tuple[date, date]) -> ParsedObservations:
    """Return a minimal ParsedObservations with only prices, for coverage tests."""
    return ParsedObservations(
        reference=[
            TickerReference.model_validate(
                {
                    "cik": "0009876543",
                    "composite_figi": "BBG000ABCXYZ",
                    "share_class_figi": "BBG001ABCXYZ",
                    "active": True,
                    "name": "Coverage Test Corp",
                }
            )
        ],
        prices=[
            DailyBar.model_validate(
                {
                    "t": 1_672_531_200_000,
                    "o": "100.00",
                    "h": "105.00",
                    "l": "99.00",
                    "c": "102.50",
                    "v": "1000000",
                    "vw": "101.75",
                    "n": 5000,
                }
            )
        ],
        fundamentals=[
            FinancialStatement.model_validate(
                {
                    "cik": "0009876543",
                    "tickers": ["CVGT"],
                    "period_end": "2025-12-31",
                    "filing_date": "2026-02-15",
                    "fiscal_year": 2025,
                    "timeframe": "annual",
                    "statement_type": "income_statement",
                    "total_revenue": "1000000000",
                }
            )
        ],
        corporate_actions=[
            CorporateAction.model_validate(
                {
                    "action_type": "dividend",
                    "effective_on": "2025-06-30",
                    "cash_amount": "1.00",
                }
            )
        ],
        reference_range=(date(2026, 1, 1), date(2026, 6, 30)),
        prices_range=prices_range,
        fundamentals_range=(date(2020, 1, 1), date(2025, 12, 31)),
        corporate_actions_range=(date(2020, 1, 1), date(2026, 6, 30)),
    )


# Implements TC-COMP-163
@pytest.mark.postgres
def test_overlapping_ranges_merge_into_minimal_set(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id1 = _insert_run(conn)

    # First write: 2025-01-01..2025-06-30
    obs1 = _minimal_observations((date(2025, 1, 1), date(2025, 6, 30)))
    write_instrument(conn, instrument_id, run_id1, obs1, date(2026, 9, 1))
    conn.commit()

    # Second write: 2025-04-01..2025-12-31 (overlaps)
    run_id2 = _insert_run(conn, complete_previous=True)
    obs2 = _minimal_observations((date(2025, 4, 1), date(2025, 12, 31)))
    write_instrument(conn, instrument_id, run_id2, obs2, date(2026, 9, 2))
    conn.commit()

    with conn.cursor() as cur:
        cur.execute(
            "SELECT covered_from, covered_to FROM coverage_segment "
            "WHERE instrument_id = %s AND data_type = 'prices'",
            (instrument_id,),
        )
        rows = cur.fetchall()

    assert len(rows) == 1
    assert rows[0][0] == date(2025, 1, 1)
    assert rows[0][1] == date(2025, 12, 31)


# Implements TC-COMP-163
@pytest.mark.postgres
def test_adjacent_ranges_merge_into_one_segment(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn, "AMZN")
    run_id1 = _insert_run(conn)

    # First: 2025-01-01..2025-06-30
    obs1 = _minimal_observations((date(2025, 1, 1), date(2025, 6, 30)))
    write_instrument(conn, instrument_id, run_id1, obs1, date(2026, 9, 1))
    conn.commit()

    # Second: 2025-07-01..2025-12-31 (adjacent -- starts the day after first ends)
    run_id2 = _insert_run(conn, complete_previous=True)
    obs2 = _minimal_observations((date(2025, 7, 1), date(2025, 12, 31)))
    write_instrument(conn, instrument_id, run_id2, obs2, date(2026, 9, 2))
    conn.commit()

    with conn.cursor() as cur:
        cur.execute(
            "SELECT covered_from, covered_to FROM coverage_segment "
            "WHERE instrument_id = %s AND data_type = 'prices'",
            (instrument_id,),
        )
        rows = cur.fetchall()

    assert len(rows) == 1
    assert rows[0][0] == date(2025, 1, 1)
    assert rows[0][1] == date(2025, 12, 31)


# Implements TC-COMP-164
@pytest.mark.postgres
def test_coverage_no_overlap_constraint_rejects_direct_overlapping_insert(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    """Directly attempt an overlapping coverage_segment insert and assert
    PostgreSQL names coverage_no_overlap."""
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn, "META")

    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
            "VALUES (%s, 'prices', '2025-01-01', '2025-06-30')",
            (instrument_id,),
        )
    conn.commit()

    with pytest.raises(ExclusionViolation) as raised:
        with conn.transaction():
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO coverage_segment "
                    "(instrument_id, data_type, covered_from, covered_to) "
                    "VALUES (%s, 'prices', '2025-04-01', '2025-12-31')",
                    (instrument_id,),
                )

    assert raised.value.diag.constraint_name == "coverage_no_overlap"


# Implements TC-COMP-163
@pytest.mark.postgres
def test_disjoint_ranges_produce_separate_segments(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn, "TSLA")
    run_id1 = _insert_run(conn)

    # First: 2024-01-01..2024-06-30
    obs1 = _minimal_observations((date(2024, 1, 1), date(2024, 6, 30)))
    write_instrument(conn, instrument_id, run_id1, obs1, date(2026, 9, 1))
    conn.commit()

    # Second: 2025-01-01..2025-12-31 (genuinely disjoint -- more than one day gap)
    run_id2 = _insert_run(conn, complete_previous=True)
    obs2 = _minimal_observations((date(2025, 1, 1), date(2025, 12, 31)))
    write_instrument(conn, instrument_id, run_id2, obs2, date(2026, 9, 2))
    conn.commit()

    with conn.cursor() as cur:
        cur.execute(
            "SELECT covered_from, covered_to FROM coverage_segment "
            "WHERE instrument_id = %s AND data_type = 'prices' ORDER BY covered_from",
            (instrument_id,),
        )
        rows = cur.fetchall()

    assert len(rows) == 2
    assert rows[0] == (date(2024, 1, 1), date(2024, 6, 30))
    assert rows[1] == (date(2025, 1, 1), date(2025, 12, 31))
