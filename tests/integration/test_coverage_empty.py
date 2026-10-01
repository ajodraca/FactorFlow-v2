"""Integration tests: never-acquired is distinct from a filter that matched nothing.

- TC-COMP-017 (AC-17): nothing acquired yet reports never-acquired, not an empty
  successful state.
- TC-COMP-033 (DAC-E6-7): never-acquired means no observation row at all.
- TC-COMP-042 (DAC-E6-S1-2): never-acquired uses its own query, separate from
  the filtered coverage query.
"""

import hashlib
from datetime import date

import psycopg
import pytest

from factorflow.coverage.service import GapDetection, read_coverage

pytestmark = pytest.mark.postgres


def _instrument(conn: psycopg.Connection, symbol: str) -> int:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle) VALUES (%s, 'active') "
            "RETURNING instrument_id",
            (symbol,),
        )
        row = cur.fetchone()
    assert row is not None
    return int(row[0])


def _bar(conn: psycopg.Connection, instrument_id: int, session: date) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO daily_bar (instrument_id, session_date, value_hash, open_price, "
            "high_price, low_price, close_price, volume) VALUES (%s, %s, %s, 1, 1, 1, 1, 1)",
            (
                instrument_id,
                session,
                hashlib.sha256(f"{instrument_id}-{session}".encode()).digest(),
            ),
        )


# Implements TC-COMP-017
# Implements TC-COMP-042
def test_empty_store_reports_never_acquired(migrated_writer_connection: psycopg.Connection) -> None:
    view = read_coverage(migrated_writer_connection)

    assert view.never_acquired is True
    assert view.instruments == []
    assert view.next_cursor is None
    assert view.gap_detection == GapDetection(
        available=False, reason="fewer_than_two_instruments_with_data", missing_days=None
    )
    assert view.gap_detection.missing_days is None


# Implements TC-COMP-033
def test_registered_instruments_without_observations_are_never_acquired(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _instrument(conn, "AAPL")
    _instrument(conn, "MSFT")
    conn.commit()

    assert read_coverage(conn).never_acquired is True


# Implements TC-COMP-017
# Implements TC-COMP-042
def test_non_matching_filter_on_populated_store_is_not_never_acquired(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _bar(conn, _instrument(conn, "AAPL"), date(2024, 1, 2))
    conn.commit()

    view = read_coverage(conn, symbol="ZZZZ")

    assert view.never_acquired is False
    assert view.instruments == []


# Implements TC-COMP-033
def test_any_observation_type_counts_as_acquired(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    instrument_id = _instrument(conn, "AAPL")
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO fundamental_observation "
            "(instrument_id, fiscal_period_end, fiscal_period, statement_type, value_hash, "
            "payload) VALUES (%s, '2023-12-31', 'FY', 'balance_sheet', %s, '{}')",
            (instrument_id, hashlib.sha256(b"fundamental").digest()),
        )
    conn.commit()

    assert read_coverage(conn).never_acquired is False
