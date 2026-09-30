"""Integration tests: retired instruments keep their coverage, marked (CAP-001-E6-S1).

- TC-COMP-021 (AC-21), TC-COMP-034 (DAC-E6-8), TC-COMP-044 (DAC-E6-S1-4),
  TC-COMP-104 (DAC-E2-6): a retired instrument appears with its retained coverage
  and a lifecycle marker rather than being omitted.
"""

import hashlib
from datetime import date

import psycopg
import pytest

from factorflow.coverage.service import read_coverage

pytestmark = pytest.mark.postgres


def _instrument_with_prices(
    conn: psycopg.Connection, symbol: str, lifecycle: str, start: date, end: date
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle, retired_at) "
            "VALUES (%s, %s, CASE WHEN %s = 'retired' THEN now() END) RETURNING instrument_id",
            (symbol, lifecycle, lifecycle),
        )
        row = cur.fetchone()
        assert row is not None
        instrument_id = row[0]
        cur.executemany(
            "INSERT INTO daily_bar (instrument_id, session_date, value_hash, open_price, "
            "high_price, low_price, close_price, volume) VALUES (%s, %s, %s, 1, 1, 1, 1, 1)",
            [
                (instrument_id, d, hashlib.sha256(f"{instrument_id}-{d}".encode()).digest())
                for d in (start, end)
            ],
        )
        cur.execute(
            "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
            "VALUES (%s, 'prices', %s, %s)",
            (instrument_id, start, end),
        )


# Implements TC-COMP-021
# Implements TC-COMP-034
# Implements TC-COMP-044
# Implements TC-COMP-104
def test_retired_instrument_keeps_coverage_and_is_marked(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _instrument_with_prices(conn, "AAPL", "active", date(2024, 1, 2), date(2024, 6, 28))
    _instrument_with_prices(conn, "TWTR", "retired", date(2020, 1, 2), date(2022, 10, 27))
    conn.commit()

    rows = {row.symbol: row for row in read_coverage(conn).instruments}

    assert set(rows) == {"AAPL", "TWTR"}
    assert rows["TWTR"].lifecycle == "retired"
    assert (rows["TWTR"].covered_from, rows["TWTR"].covered_to) == (
        date(2020, 1, 2),
        date(2022, 10, 27),
    )
    assert rows["AAPL"].lifecycle == "active"
