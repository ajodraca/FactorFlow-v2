"""Integration tests: coverage reads at 3000 instruments (CAP-001-E6-S1).

- TC-COMP-036 (DAC-E6-10), TC-COMP-047 (DAC-E6-S1-7): symbol filter, lifecycle
  filter, date bounds and cursor paging stay correct at AC-4's 3000 instruments.

Correctness only. No elapsed-time bound is asserted: no latency target exists
(coverage-service OQ 3) and the suite configures no timeout (task plan Open Gaps 4).
"""

from datetime import date

import psycopg
import pytest

from factorflow.coverage.service import read_coverage

pytestmark = [pytest.mark.postgres, pytest.mark.slow]

SCALE = 3_000


def _seed(conn: psycopg.Connection) -> None:
    """Seed SCALE instruments, one year of weekday bars and a prices segment each.

    Every tenth instrument is retired. Symbols are S0001..S3000.
    """
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle, retired_at) "
            "SELECT 'S' || lpad(n::text, 4, '0'), "
            "       CASE WHEN n %% 10 = 0 THEN 'retired' ELSE 'active' END, "
            "       CASE WHEN n %% 10 = 0 THEN now() END "
            "  FROM generate_series(1, %s) AS n",
            (SCALE,),
        )
        cur.execute(
            "INSERT INTO daily_bar (instrument_id, session_date, value_hash, open_price, "
            "high_price, low_price, close_price, volume) "
            "SELECT i.instrument_id, d::date, "
            "       sha256(convert_to(i.instrument_id::text || d::date::text, 'UTF8')), "
            "       1, 1, 1, 1, 1 "
            "  FROM instrument i "
            " CROSS JOIN generate_series('2024-01-01'::date, '2024-12-31'::date, '1 day') AS d "
            " WHERE extract(isodow FROM d) < 6"
        )
        cur.execute(
            "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
            "SELECT instrument_id, 'prices', '2024-01-01', '2024-12-31' FROM instrument"
        )
    conn.commit()


def _all_pages(conn: psycopg.Connection, **filters: str) -> list[list[str]]:
    pages: list[list[str]] = []
    cursor: str | None = None
    while True:
        view = read_coverage(conn, cursor=cursor, **filters)  # type: ignore[arg-type]
        pages.append([row.symbol for row in view.instruments])
        cursor = view.next_cursor
        if cursor is None:
            return pages


def _all_ranges(
    conn: psycopg.Connection, **bounds: date
) -> dict[str, tuple[date | None, date | None]]:
    ranges: dict[str, tuple[date | None, date | None]] = {}
    cursor: str | None = None
    while True:
        view = read_coverage(conn, cursor=cursor, **bounds)  # type: ignore[arg-type]
        ranges.update({row.symbol: (row.covered_from, row.covered_to) for row in view.instruments})
        cursor = view.next_cursor
        if cursor is None:
            return ranges


# Implements TC-COMP-036
# Implements TC-COMP-047
def test_paging_and_filters_at_3000_instruments(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _seed(conn)
    expected = [f"S{n:04d}" for n in range(1, SCALE + 1)]

    pages = _all_pages(conn)
    symbols = [s for page in pages for s in page]
    assert len(pages) == 60
    assert symbols == expected

    prefixed = [s for page in _all_pages(conn, symbol="S1") for s in page]
    assert prefixed == [s for s in expected if s.startswith("S1")]

    retired = [s for page in _all_pages(conn, lifecycle="retired") for s in page]
    assert retired == [f"S{n:04d}" for n in range(10, SCALE + 1, 10)]

    inside = _all_ranges(conn, from_date=date(2024, 6, 1), to_date=date(2024, 6, 30))
    assert list(inside) == expected
    assert set(inside.values()) == {(date(2024, 1, 1), date(2024, 12, 31))}

    outside = _all_ranges(conn, from_date=date(2025, 1, 1))
    assert list(outside) == expected
    assert set(outside.values()) == {(None, None)}
