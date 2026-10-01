"""Integration tests: depth shortfall against the stated history depth (CAP-001-E6-S1).

- TC-COMP-035 (DAC-E6-9), TC-COMP-043 (DAC-E6-S1-3): an instrument covered to a
  shallower depth than the stated one reports how far short it falls, in years;
  one that meets it reports no shortfall value.
- TC-COMP-038 (DAC-E6-12), TC-COMP-046 (DAC-E6-S1-6), covered-range half only: a
  uniform plan-cap shortfall is reported as a shorter covered range and a depth
  shortfall, not as a data gap. The gap-count half needs CAP-001-E6-S2's gap
  detection (task plan Open Gaps 6).

Placed here rather than in ``test_coverage_gaps.py``, which CAP-001-E6-S2 creates.
"""

import hashlib
from datetime import date, timedelta

import psycopg
import pytest

from factorflow.coverage.service import read_coverage
from factorflow.instruments.settings import write_history_depth

pytestmark = pytest.mark.postgres

_START = date(2020, 1, 2)


def _instrument_covered(conn: psycopg.Connection, symbol: str, days: int) -> None:
    end = _START + timedelta(days=days - 1)
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle) VALUES (%s, 'active') "
            "RETURNING instrument_id",
            (symbol,),
        )
        row = cur.fetchone()
        assert row is not None
        instrument_id = row[0]
        cur.executemany(
            "INSERT INTO daily_bar (instrument_id, session_date, value_hash, open_price, "
            "high_price, low_price, close_price, volume) VALUES (%s, %s, %s, 1, 1, 1, 1, 1)",
            [
                (instrument_id, d, hashlib.sha256(f"{instrument_id}-{d}".encode()).digest())
                for d in (_START, _START + timedelta(days=1), end)
            ],
        )
        cur.execute(
            "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
            "VALUES (%s, 'prices', %s, %s)",
            (instrument_id, _START, end),
        )


# Implements TC-COMP-035
# Implements TC-COMP-043
def test_shortfall_reported_against_stated_depth(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _instrument_covered(conn, "AAA", 3 * 365)
    _instrument_covered(conn, "BBB", 5 * 365)
    conn.commit()
    write_history_depth(conn, 5)

    rows = {row.symbol: row for row in read_coverage(conn).instruments}
    assert rows["AAA"].depth_shortfall_years == 2
    assert rows["BBB"].depth_shortfall_years is None

    write_history_depth(conn, 6)

    rows = {row.symbol: row for row in read_coverage(conn).instruments}
    assert rows["BBB"].depth_shortfall_years == 1


# Implements TC-COMP-043
def test_no_stated_depth_reports_no_shortfall(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _instrument_covered(conn, "AAA", 3 * 365)
    conn.commit()

    assert [row.depth_shortfall_years for row in read_coverage(conn).instruments] == [None]


# Implements TC-COMP-038 (covered-range half)
# Implements TC-COMP-046 (covered-range half)
def test_uniform_plan_cap_is_a_short_range_not_a_gap(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    for symbol in ("AAA", "BBB", "CCC"):
        _instrument_covered(conn, symbol, 5 * 365)
    conn.commit()
    write_history_depth(conn, 10)

    rows = read_coverage(conn).instruments

    assert len(rows) == 3
    assert all(row.covered_from == _START for row in rows)
    assert all(row.depth_shortfall_years == 5 for row in rows)
    assert all(row.gaps.missing_days in (None, 0) for row in rows)
