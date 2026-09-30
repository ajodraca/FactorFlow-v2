"""Integration tests: coverage is reported only from rows that were written (CAP-001-E6-S1).

- TC-COMP-007 (AC-7): per-instrument presence, covered range and last acquired.
- TC-COMP-012 (AC-12): a rolled-back partial write leaves no coverage.
- TC-COMP-027 (DAC-E6-1): coverage is derived at read time from segments and rows.
- TC-COMP-045 (DAC-E6-S1-5): last acquired comes from ``acquisition_state``,
  including failed attempts, and never from a run's intent.

Also covers the functional half of DAC-E6-S1-7 (filters, date bounds and cursor
paging; date bounds narrow the covered range only, never presence or the depth
shortfall, per DEC-0003) and
the input-validation and error-propagation rules of component design sections 4
and 8 (SEC-INP-001, OPS-ERR-001).
"""

import hashlib
import uuid
from datetime import UTC, date, datetime

import psycopg
import pytest

from factorflow.coverage.service import Presence, read_coverage
from factorflow.instruments.settings import write_history_depth

pytestmark = pytest.mark.postgres


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


def _bars(conn: psycopg.Connection, instrument_id: int, sessions: list[date]) -> None:
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO daily_bar (instrument_id, session_date, value_hash, open_price, "
            "high_price, low_price, close_price, volume) VALUES (%s, %s, %s, 1, 1, 1, 1, 1)",
            [
                (instrument_id, d, hashlib.sha256(f"{instrument_id}-{d}".encode()).digest())
                for d in sessions
            ],
        )


def _segment(
    conn: psycopg.Connection, instrument_id: int, data_type: str, start: date, end: date
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
            "VALUES (%s, %s, %s, %s)",
            (instrument_id, data_type, start, end),
        )


def _state(
    conn: psycopg.Connection,
    instrument_id: int,
    data_type: str,
    outcome: str,
    at: datetime,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_state "
            "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
            "VALUES (%s, %s, %s, %s, %s)",
            (instrument_id, data_type, at, uuid.uuid4(), outcome),
        )


# Implements TC-COMP-027
# Implements TC-COMP-007
def test_coverage_reflects_written_rows_only(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    a = _instrument(conn, "AAA")
    b = _instrument(conn, "BBB")
    sessions = [date(2024, 1, 2), date(2024, 1, 3), date(2024, 1, 4), date(2024, 1, 5)]
    _bars(conn, a, sessions)
    _bars(conn, b, sessions)
    _segment(conn, b, "prices", date(2024, 1, 2), date(2024, 1, 5))
    _state(conn, b, "prices", "written", datetime(2024, 1, 6, tzinfo=UTC))
    _state(conn, b, "fundamentals", "not_found", datetime(2024, 1, 6, tzinfo=UTC))
    conn.commit()

    rows = {row.symbol: row for row in read_coverage(conn).instruments}

    assert rows["AAA"].covered_from is None
    assert rows["AAA"].covered_to is None
    assert rows["AAA"].presence["prices"] is not Presence.PRESENT
    assert rows["BBB"].covered_from == date(2024, 1, 2)
    assert rows["BBB"].covered_to == date(2024, 1, 5)
    assert rows["BBB"].presence["prices"] is Presence.PRESENT


# Implements TC-COMP-007
def test_presence_reports_each_data_type(migrated_writer_connection: psycopg.Connection) -> None:
    conn = migrated_writer_connection
    b = _instrument(conn, "BBB")
    _bars(conn, b, [date(2024, 1, 2)])
    _segment(conn, b, "prices", date(2024, 1, 2), date(2024, 1, 2))
    _state(conn, b, "fundamentals", "not_found", datetime(2024, 1, 6, tzinfo=UTC))
    conn.commit()

    (row,) = read_coverage(conn).instruments

    assert row.presence == {
        "reference": Presence.UNKNOWN,
        "prices": Presence.PRESENT,
        "fundamentals": Presence.ABSENT,
        "corporate_actions": Presence.UNKNOWN,
    }


# Implements TC-COMP-045
def test_last_acquired_includes_failed_attempts_and_ignores_run_intent(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    b = _instrument(conn, "BBB")
    d = _instrument(conn, "DDD")
    _bars(conn, b, [date(2024, 1, 2)])
    _bars(conn, d, [date(2024, 1, 2)])
    _segment(conn, b, "prices", date(2024, 1, 2), date(2024, 1, 2))
    written_at = datetime(2024, 1, 3, 12, tzinfo=UTC)
    failed_at = datetime(2024, 2, 1, 12, tzinfo=UTC)
    _state(conn, b, "prices", "written", written_at)
    _state(conn, b, "corporate_actions", "failed", failed_at)
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (state, history_depth_years) "
            "VALUES ('requested', 5) RETURNING run_id"
        )
        run = cur.fetchone()
        assert run is not None
        cur.execute(
            "INSERT INTO run_instrument_result (run_id, instrument_id, data_type, outcome, "
            "completed_at) VALUES (%s, %s, 'prices', 'written', %s)",
            (run[0], d, datetime(2024, 3, 1, 12, tzinfo=UTC)),
        )
    conn.commit()

    rows = {row.symbol: row for row in read_coverage(conn).instruments}

    assert rows["BBB"].last_acquired_at == failed_at
    assert rows["DDD"].last_acquired_at is None


# Implements TC-COMP-012
def test_rolled_back_partial_write_leaves_no_coverage(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    other = _instrument(conn, "AAA")
    _bars(conn, other, [date(2024, 1, 2)])
    c = _instrument(conn, "CCC")
    conn.commit()

    _bars(conn, c, [date(2024, 1, 2), date(2024, 1, 3)])
    _segment(conn, c, "prices", date(2024, 1, 2), date(2024, 1, 3))
    _state(conn, c, "prices", "written", datetime(2024, 1, 4, tzinfo=UTC))
    conn.rollback()

    rows = {row.symbol: row for row in read_coverage(conn).instruments}

    assert rows["CCC"].covered_from is None
    assert rows["CCC"].last_acquired_at is None
    assert set(rows["CCC"].presence.values()) == {Presence.UNKNOWN}


def test_symbol_and_lifecycle_filters(migrated_writer_connection: psycopg.Connection) -> None:
    conn = migrated_writer_connection
    aal = _instrument(conn, "AAL")
    _instrument(conn, "AAPL")
    _instrument(conn, "MSFT", lifecycle="retired")
    _bars(conn, aal, [date(2024, 1, 2)])
    conn.commit()

    assert [r.symbol for r in read_coverage(conn, symbol="AA").instruments] == ["AAL", "AAPL"]
    retired = read_coverage(conn, lifecycle="retired").instruments
    assert [(r.symbol, r.lifecycle) for r in retired] == [("MSFT", "retired")]


def test_cursor_paging_returns_every_instrument_once(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    ids = [_instrument(conn, s) for s in ("AAA", "BBB", "CCC", "DDD", "EEE")]
    _bars(conn, ids[0], [date(2024, 1, 2)])
    conn.commit()

    pages: list[list[str]] = []
    cursor: str | None = None
    while True:
        view = read_coverage(conn, cursor=cursor, limit=2)
        pages.append([r.symbol for r in view.instruments])
        cursor = view.next_cursor
        if cursor is None:
            break

    assert [len(page) for page in pages] == [2, 2, 1]
    assert [s for page in pages for s in page] == ["AAA", "BBB", "CCC", "DDD", "EEE"]


def test_cursor_is_normalised_like_the_symbol_filter(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    ids = [_instrument(conn, s) for s in ("AAA", "BBB", "CCC")]
    _bars(conn, ids[0], [date(2024, 1, 2)])
    conn.commit()

    view = read_coverage(conn, cursor=" aaa ", limit=5)

    assert [r.symbol for r in view.instruments] == ["BBB", "CCC"]


def test_date_bounds_select_overlapping_segments(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    a = _instrument(conn, "AAA")
    b = _instrument(conn, "BBB")
    c = _instrument(conn, "CCC")
    for instrument_id in (a, b, c):
        _bars(conn, instrument_id, [date(2024, 1, 2)])
    _segment(conn, a, "prices", date(2020, 1, 2), date(2020, 12, 31))
    _segment(conn, a, "prices", date(2024, 1, 2), date(2024, 6, 28))
    _segment(conn, b, "prices", date(2024, 1, 2), date(2024, 6, 28))
    _segment(conn, c, "prices", date(2020, 1, 2), date(2020, 12, 31))
    conn.commit()

    def ranges(**bounds: date) -> dict[str, tuple[date | None, date | None]]:
        view = read_coverage(conn, **bounds)  # type: ignore[arg-type]
        return {r.symbol: (r.covered_from, r.covered_to) for r in view.instruments}

    assert ranges() == {
        "AAA": (date(2020, 1, 2), date(2024, 6, 28)),
        "BBB": (date(2024, 1, 2), date(2024, 6, 28)),
        "CCC": (date(2020, 1, 2), date(2020, 12, 31)),
    }
    assert ranges(from_date=date(2024, 1, 1), to_date=date(2024, 12, 31)) == {
        "AAA": (date(2024, 1, 2), date(2024, 6, 28)),
        "BBB": (date(2024, 1, 2), date(2024, 6, 28)),
        "CCC": (None, None),
    }
    assert ranges(to_date=date(2020, 12, 31)) == {
        "AAA": (date(2020, 1, 2), date(2020, 12, 31)),
        "BBB": (None, None),
        "CCC": (date(2020, 1, 2), date(2020, 12, 31)),
    }
    assert ranges(from_date=date(2020, 12, 31)) == {
        "AAA": (date(2020, 1, 2), date(2024, 6, 28)),
        "BBB": (date(2024, 1, 2), date(2024, 6, 28)),
        "CCC": (date(2020, 1, 2), date(2020, 12, 31)),
    }
    assert ranges(from_date=date(2024, 6, 29)) == {
        "AAA": (None, None),
        "BBB": (None, None),
        "CCC": (None, None),
    }


def test_date_bounds_do_not_change_presence_or_depth_shortfall(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    a = _instrument(conn, "AAA")
    _bars(conn, a, [date(2024, 1, 2)])
    _segment(conn, a, "prices", date(2015, 1, 2), date(2019, 12, 31))
    _segment(conn, a, "prices", date(2024, 1, 2), date(2024, 1, 31))
    _segment(conn, a, "fundamentals", date(2016, 3, 31), date(2016, 3, 31))
    _state(conn, a, "fundamentals", "written", datetime(2024, 2, 1, tzinfo=UTC))
    conn.commit()
    write_history_depth(conn, 5)

    (unbounded,) = read_coverage(conn).instruments
    (bounded,) = read_coverage(
        conn, from_date=date(2024, 1, 1), to_date=date(2024, 12, 31)
    ).instruments

    assert unbounded.depth_shortfall_years is None
    assert (bounded.covered_from, bounded.covered_to) == (date(2024, 1, 2), date(2024, 1, 31))
    assert bounded.depth_shortfall_years is None
    assert bounded.presence == unbounded.presence
    assert bounded.presence["prices"] is Presence.PRESENT
    assert bounded.presence["fundamentals"] is Presence.PRESENT


@pytest.mark.parametrize(
    "kwargs",
    [
        {"from_date": date(2024, 2, 1), "to_date": date(2024, 1, 1)},
        {"lifecycle": "deleted"},
        {"limit": 0},
        {"limit": 501},
    ],
)
def test_invalid_input_raises_value_error(
    migrated_writer_connection: psycopg.Connection, kwargs: dict[str, object]
) -> None:
    with pytest.raises(ValueError):
        read_coverage(migrated_writer_connection, **kwargs)  # type: ignore[arg-type]


def test_database_error_propagates(migrated_writer_connection: psycopg.Connection) -> None:
    migrated_writer_connection.close()

    with pytest.raises(psycopg.Error):
        read_coverage(migrated_writer_connection)
