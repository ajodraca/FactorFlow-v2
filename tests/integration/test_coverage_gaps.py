"""Integration tests: gap detection against the derived trading-day set (CAP-001-E6-S2).

component-design-coverage-service.md section 2.3: a trading day is any date on
which any instrument has a daily bar in the range, and a gap is such a date
inside an instrument's own ``prices`` covered range with no bar for it.

- TC-COMP-008 (AC-8): a session two instruments have and a third lacks is one gap.
- TC-COMP-028 (DAC-E6-2) / TC-COMP-048 (DAC-E6-S2-1): the set is the union across
  instruments, never an instrument's own dates.
- TC-COMP-029 (DAC-E6-3) / TC-COMP-049 (DAC-E6-S2-2): only dates inside the
  instrument's own covered range are gaps.
- TC-COMP-030 (DAC-E6-4) / TC-COMP-050 (DAC-E6-S2-3): below two instruments with
  data, detection is unavailable with a reason, and the statement returns no rows.
- TC-COMP-031 (DAC-E6-5) / TC-COMP-051 (DAC-E6-S2-4): prices only.
- TC-COMP-032 (DAC-E6-6) / TC-COMP-052 (DAC-E6-S2-5): a day missing for every
  instrument is reported for nobody.
- TC-COMP-053 (DAC-E6-S2-6): a count for the collapsed row, dates for expansion.

Also covers the default range, zero instruments with data, input validation and
error propagation (design sections 2.3 and 4; SEC-INP-001, OPS-ERR-001).
"""

import dataclasses
import hashlib
from datetime import date

import psycopg
import pytest

from factorflow.coverage import gaps
from factorflow.coverage.service import InstrumentCoverage, read_coverage, read_gap_dates
from factorflow.instruments.service import InstrumentNotFound

pytestmark = pytest.mark.postgres

D2 = date(2024, 1, 2)
D3 = date(2024, 1, 3)
D4 = date(2024, 1, 4)
D5 = date(2024, 1, 5)
WEEK = [D2, D3, D4, D5]


def _instrument(conn: psycopg.Connection, symbol: str, lifecycle: str = "active") -> int:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle, retired_at) "
            "VALUES (%s, %s, CASE WHEN %s = 'retired' THEN now() END) RETURNING instrument_id",
            (symbol, lifecycle, lifecycle),
        )
        row = cur.fetchone()
    assert row is not None
    return int(row[0])


def _bars(conn: psycopg.Connection, instrument_id: int, dates: list[date]) -> None:
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO daily_bar (instrument_id, session_date, value_hash, open_price, "
            "high_price, low_price, close_price, volume) VALUES (%s, %s, %s, 1, 1, 1, 1, 1)",
            [
                (instrument_id, d, hashlib.sha256(f"{instrument_id}{d}".encode()).digest())
                for d in dates
            ],
        )


def _segment(
    conn: psycopg.Connection,
    instrument_id: int,
    data_type: str,
    covered_from: date,
    covered_to: date,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
            "VALUES (%s, %s, %s, %s)",
            (instrument_id, data_type, covered_from, covered_to),
        )


def _priced(
    conn: psycopg.Connection,
    symbol: str,
    bars: list[date],
    covered_from: date = D2,
    covered_to: date = D5,
) -> int:
    instrument_id = _instrument(conn, symbol)
    _bars(conn, instrument_id, bars)
    _segment(conn, instrument_id, "prices", covered_from, covered_to)
    return instrument_id


def _rows(conn: psycopg.Connection, **bounds: date) -> dict[str, InstrumentCoverage]:
    return {row.symbol: row for row in read_coverage(conn, **bounds).instruments}  # type: ignore[arg-type]


# Implements TC-COMP-008
def test_one_session_missing_for_one_of_three_is_one_gap(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _priced(conn, "A", WEEK)
    _priced(conn, "B", WEEK)
    _priced(conn, "C", [D2, D3, D5])
    conn.commit()

    view = read_coverage(conn)
    rows = {row.symbol: row for row in view.instruments}

    assert view.gap_detection.available is True
    assert rows["C"].gaps.missing_days == 1
    assert rows["A"].gaps.missing_days == 0
    assert rows["B"].gaps.missing_days == 0
    assert read_gap_dates(conn, "C") == [D4]


# Implements TC-COMP-028
def test_trading_day_set_is_the_union_across_instruments(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    a = _priced(conn, "A", [D2, D3], covered_to=D4)
    b = _priced(conn, "B", [D3, D4], covered_to=D4)
    c = _priced(conn, "C", [D2, D3, D4], covered_to=D4)
    conn.commit()

    result = gaps.detect_gaps(conn)

    assert result.available is True
    assert result.missing == {a: [D4], b: [D2]}
    assert c not in result.missing


# Implements TC-COMP-048
def test_instrument_is_not_checked_against_its_own_dates(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _priced(conn, "A", [D2, D3, D4], covered_to=D4)
    _priced(conn, "B", [D2, D4], covered_to=D4)
    conn.commit()

    assert read_gap_dates(conn, "B") == [D3]
    missing_days = _rows(conn)["B"].gaps.missing_days
    assert missing_days == 1
    assert missing_days != 0


# Implements TC-COMP-029
def test_gap_only_inside_the_instruments_own_covered_range(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _priced(conn, "A", WEEK)
    b = _priced(conn, "B", [D3, D4], covered_from=D3, covered_to=D4)
    conn.commit()

    assert read_gap_dates(conn, "B") == []
    assert _rows(conn)["B"].gaps.missing_days == 0

    with conn.cursor() as cur:
        cur.execute("DELETE FROM daily_bar WHERE instrument_id = %s AND session_date = %s", (b, D4))
    conn.commit()

    assert read_gap_dates(conn, "B") == [D4]


# Implements TC-COMP-049
def test_date_before_first_acquisition_is_outside_coverage(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _priced(conn, "A", WEEK)
    _priced(conn, "B", [D4, D5], covered_from=D4)
    conn.commit()

    assert read_gap_dates(conn, "B") == []
    assert _rows(conn)["B"].gaps.missing_days == 0


# Implements TC-COMP-030
def test_one_instrument_reports_detection_unavailable_not_zero(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _priced(conn, "A", [D2, D4, D5])
    conn.commit()

    view = read_coverage(conn)

    assert view.gap_detection.available is False
    assert view.gap_detection.reason == "fewer_than_two_instruments_with_data"
    assert view.gap_detection.missing_days is None
    assert view.gap_detection.missing_days != 0
    (row,) = view.instruments
    assert row.gaps == view.gap_detection
    assert read_gap_dates(conn, "A") is None


# Implements TC-COMP-050
def test_availability_predicate_inside_the_statement_returns_no_rows(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    a = _priced(conn, "A", WEEK)
    b = _priced(
        conn,
        "B",
        [date(2024, 1, 22), date(2024, 1, 23), date(2024, 1, 24)],
        covered_to=date(2024, 1, 31),
    )
    conn.commit()

    with conn.cursor() as cur:
        cur.execute(gaps.GAPS_SQL, {"from_date": D2, "to_date": D5})
        assert cur.fetchall() == []

        cur.execute(gaps.GAPS_SQL, {"from_date": D2, "to_date": date(2024, 1, 24)})
        rows = cur.fetchall()

    assert rows == [(b, d) for d in WEEK]
    assert all(instrument_id != a for instrument_id, _ in rows)
    assert gaps.detect_gaps(conn, from_date=D2, to_date=D5).available is False


# Implements TC-COMP-031
def test_gap_detection_applies_to_prices_only(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    a = _priced(conn, "A", WEEK)
    _segment(conn, a, "fundamentals", date(2023, 1, 1), date(2024, 12, 31))
    extra = [date(2024, 1, 8), date(2024, 1, 9), date(2024, 1, 10)]
    _priced(conn, "B", WEEK + extra, covered_to=date(2024, 1, 10))
    conn.commit()

    assert read_gap_dates(conn, "A") == []
    assert _rows(conn)["A"].gaps.missing_days == 0


# Implements TC-COMP-051
def test_fundamentals_and_corporate_actions_have_no_gaps_computed(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _priced(conn, "A", WEEK)
    _priced(conn, "B", WEEK)
    f = _instrument(conn, "F")
    _segment(conn, f, "fundamentals", date(2023, 1, 1), date(2024, 12, 31))
    _segment(conn, f, "corporate_actions", date(2023, 1, 1), date(2024, 12, 31))
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO fundamental_observation (instrument_id, fiscal_period_end, "
            "fiscal_period, statement_type, value_hash, payload) "
            "VALUES (%s, %s, 'Q', 'income_statement', %s, '{}')",
            [
                (f, period_end, hashlib.sha256(f"{f}{period_end}".encode()).digest())
                for period_end in (date(2023, 3, 31), date(2023, 12, 31))
            ],
        )
    conn.commit()

    result = gaps.detect_gaps(conn)

    assert result.available is True
    assert f not in result.missing
    assert _rows(conn)["F"].gaps.missing_days is None
    assert read_gap_dates(conn, "F") is None


# Implements TC-COMP-032
def test_market_wide_outage_is_not_claimed(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _priced(conn, "A", [D2, D4, D5])
    _priced(conn, "B", [D2, D4, D5])
    conn.commit()

    view = read_coverage(conn)

    assert view.gap_detection.available is True
    assert [row.gaps.missing_days for row in view.instruments] == [0, 0]
    assert repr(D3) not in repr(view)


# Implements TC-COMP-052
def test_day_missing_for_every_instrument_is_no_ones_gap(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    # Documents the stated limit (design section 3, STD-UI-18), not a defect: a day
    # every instrument lacks never enters the trading-day set.
    conn = migrated_writer_connection
    _priced(conn, "A", [D2, D4, D5])
    _priced(conn, "B", [D2, D4, D5])
    conn.commit()

    assert read_gap_dates(conn, "A") == []
    assert read_gap_dates(conn, "B") == []
    assert all(D3 not in dates for dates in gaps.detect_gaps(conn).missing.values())


# Implements TC-COMP-053
# Implements TC-COMP-040 (backend half)
def test_count_for_collapsed_row_dates_for_expansion(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _priced(conn, "A", WEEK)
    _priced(conn, "B", [D2, D4])
    conn.commit()

    missing_days = _rows(conn)["B"].gaps.missing_days
    dates = read_gap_dates(conn, "B")

    assert missing_days == 2
    assert dates == [D3, D5]
    assert len(dates) == missing_days
    assert not any("list" in str(field.type) for field in dataclasses.fields(InstrumentCoverage))


def test_default_range_is_everything_acquired(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    old = [date(2022, 3, 14), date(2022, 3, 15), date(2022, 3, 16)]
    recent = [D2, D3, D4]
    _priced(conn, "A", old + recent, covered_from=date(2022, 3, 14), covered_to=D4)
    _priced(
        conn,
        "B",
        [date(2022, 3, 14), date(2022, 3, 16), *recent],
        covered_from=date(2022, 3, 14),
        covered_to=D4,
    )
    conn.commit()

    assert _rows(conn)["B"].gaps.missing_days == 1
    assert read_gap_dates(conn, "B") == [date(2022, 3, 15)]
    assert _rows(conn, from_date=date(2024, 1, 1))["B"].gaps.missing_days == 0


def test_zero_instruments_with_data_in_range_is_unavailable(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _priced(conn, "A", WEEK)
    _priced(conn, "B", WEEK)
    conn.commit()
    bounds = {"from_date": date(2025, 6, 2), "to_date": date(2025, 6, 6)}

    assert gaps.detect_gaps(conn, **bounds).available is False
    view = read_coverage(conn, **bounds)
    assert view.gap_detection.available is False
    assert view.gap_detection.reason == "fewer_than_two_instruments_with_data"
    assert view.gap_detection.missing_days is None


def test_empty_store_is_unavailable(migrated_writer_connection: psycopg.Connection) -> None:
    view = read_coverage(migrated_writer_connection)

    assert view.gap_detection.available is False
    assert view.gap_detection.missing_days is None


def test_inverted_range_raises_value_error(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    with pytest.raises(ValueError):
        gaps.detect_gaps(migrated_writer_connection, from_date=D5, to_date=D2)


def test_unknown_symbol_raises_instrument_not_found(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    with pytest.raises(InstrumentNotFound):
        read_gap_dates(migrated_writer_connection, "ZZZZ")


def test_database_failure_propagates(migrated_writer_connection: psycopg.Connection) -> None:
    migrated_writer_connection.close()

    with pytest.raises(psycopg.Error):
        gaps.detect_gaps(migrated_writer_connection)
