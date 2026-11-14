"""Integration tests: read_data_health over coverage-service pages (CAP-003-E2-S3).

- TC-COMP-038 (DAC-E2-15): ``read_coverage`` is paged unchanged to a null cursor.
- TC-COMP-048 (DAC-E2-S3-2, AC-21): ``never_acquired`` with and without an ended download.
- TC-COMP-049 (DAC-E2-S3-3): retired stocks are excluded; six pages at 3000 stocks.
- A real store with every group and a partial download (AC-11, AC-12, DAC-E2-5, DAC-E2-S3-1).
- Not determinable on a real store (DAC-E2-4, AC-24).
"""

import hashlib
from datetime import UTC, date, datetime, timedelta
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.coverage import service as coverage_service
from factorflow.data_health.models import (
    CompanyFinancialsCheck,
    DailyPricesCheck,
    GapDetectionState,
    ProblemPage,
)
from factorflow.data_health.reader import read_data_health

pytestmark = pytest.mark.postgres

D2, D3, D4, D5 = (date(2024, 1, day) for day in (2, 3, 4, 5))
T1 = datetime(2026, 10, 20, 21, 0, tzinfo=UTC)
T2 = T1 + timedelta(hours=1)
T3 = T1 + timedelta(hours=2)
SEGMENT_FUNDAMENTALS = (date(2023, 10, 1), date(2024, 3, 31))


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


def _roster(conn: psycopg.Connection, n: int, prefix: str = "S") -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle) "
            "SELECT %s || lpad(n::text, 4, '0'), 'active' FROM generate_series(1, %s) AS n",
            (prefix, n),
        )


def _id(conn: psycopg.Connection, symbol: str) -> int:
    with conn.cursor() as cur:
        cur.execute("SELECT instrument_id FROM instrument WHERE symbol = %s", (symbol,))
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


def _run(
    conn: psycopg.Connection, *, state: str, requested_at: datetime, ended_at: datetime
) -> UUID:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (state, requested_at, ended_at, history_depth_years) "
            "VALUES (%s, %s, %s, 1) RETURNING run_id",
            (state, requested_at, ended_at),
        )
        row = cur.fetchone()
    assert row is not None
    return UUID(str(row[0]))


def _record(
    conn: psycopg.Connection,
    run_id: UUID,
    instrument_id: int,
    data_type: str,
    outcome: str,
    *,
    reason: str | None = None,
    attempts: int = 1,
    completed_at: datetime,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO run_instrument_result "
            "(run_id, instrument_id, data_type, outcome, reason, attempts, completed_at) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (run_id, instrument_id, data_type, outcome, reason, attempts, completed_at),
        )
        cur.execute(
            "INSERT INTO acquisition_state "
            "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
            "VALUES (%s, %s, %s, %s, %s) "
            "ON CONFLICT (instrument_id, data_type) DO UPDATE SET "
            "last_acquired_at = EXCLUDED.last_acquired_at, "
            "last_run_id = EXCLUDED.last_run_id, last_outcome = EXCLUDED.last_outcome",
            (instrument_id, data_type, completed_at, run_id, outcome),
        )


Call = tuple[tuple[Any, ...], dict[str, Any]]


def _coverage_spy(monkeypatch: pytest.MonkeyPatch) -> list[Call]:
    calls: list[Call] = []
    delivered = coverage_service.read_coverage

    def spy(*args: Any, **kwargs: Any) -> Any:
        calls.append((args, kwargs))
        if len(calls) > 10:
            raise AssertionError("read_coverage called more than 10 times")
        return delivered(*args, **kwargs)

    monkeypatch.setattr("factorflow.data_health.reader.read_coverage", spy)
    return calls


def _seed_one_stock_with_prices(conn: psycopg.Connection, symbol: str = "S0001") -> None:
    instrument_id = _id(conn, symbol)
    _bars(conn, instrument_id, [D2, D3])
    _segment(conn, instrument_id, "prices", D2, D3)


# Implements TC-COMP-038
def test_read_data_health_pages_read_coverage_unchanged_to_a_null_cursor(
    migrated_writer_connection: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn = migrated_writer_connection
    _roster(conn, 1200)
    _seed_one_stock_with_prices(conn)
    conn.commit()
    calls = _coverage_spy(monkeypatch)

    read_data_health(conn)

    assert calls == [
        ((conn,), {"lifecycle": "active", "cursor": None, "limit": 500}),
        ((conn,), {"lifecycle": "active", "cursor": "S0500", "limit": 500}),
        ((conn,), {"lifecycle": "active", "cursor": "S1000", "limit": 500}),
    ]


# Implements TC-COMP-038
def test_one_page_store_makes_one_call_with_a_null_cursor(
    migrated_writer_connection: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn = migrated_writer_connection
    _roster(conn, 3)
    _seed_one_stock_with_prices(conn)
    conn.commit()
    calls = _coverage_spy(monkeypatch)

    read_data_health(conn)

    assert calls == [((conn,), {"lifecycle": "active", "cursor": None, "limit": 500})]


# Implements TC-COMP-038
def test_value_error_from_read_coverage_propagates_unchanged(
    migrated_writer_connection: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    err = ValueError("limit must be between 1 and 500, got 0")

    def raising(*args: Any, **kwargs: Any) -> Any:
        raise err

    monkeypatch.setattr("factorflow.data_health.reader.read_coverage", raising)

    with pytest.raises(ValueError) as excinfo:
        read_data_health(migrated_writer_connection)

    assert excinfo.value is err


# Implements TC-COMP-048
def test_empty_store_is_never_acquired_with_null_checks(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    result = read_data_health(migrated_writer_connection)

    assert result.never_acquired is True
    assert result.daily_prices is None
    assert result.company_financials is None
    assert result.followed_count == 0
    assert result.affected_count == 0
    assert result.problems == ProblemPage(rows=(), next_cursor=None)


# Implements TC-COMP-048
def test_a_download_that_ended_with_every_request_failed_is_never_acquired_with_rows(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _roster(conn, 60, prefix="P")
    run = _run(conn, state="failed", requested_at=T1, ended_at=T2)
    with conn.cursor() as cur:
        cur.execute("SELECT instrument_id FROM instrument ORDER BY symbol")
        ids = [int(r[0]) for r in cur.fetchall()]
    for instrument_id in ids:
        for data_type in ("reference", "prices", "fundamentals", "corporate_actions"):
            _record(
                conn,
                run,
                instrument_id,
                data_type,
                "failed",
                reason="provider timeout",
                completed_at=T2,
            )
    conn.commit()

    result = read_data_health(conn)

    assert result.never_acquired is True
    assert result.daily_prices is None
    assert result.company_financials is None
    assert result.followed_count == 60
    assert result.affected_count == 60
    assert len(result.problems.rows) == 50
    assert result.problems.rows[0].symbol == "P0001"
    assert result.problems.rows[-1].symbol == "P0050"
    assert result.problems.next_cursor == "P0050"
    assert all(len(row.failures) == 4 and row.retryable for row in result.problems.rows)


# Implements TC-COMP-049
@pytest.mark.slow
def test_retired_stocks_are_excluded_and_3000_stocks_take_six_pages(
    migrated_writer_connection: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn = migrated_writer_connection
    _roster(conn, 3000)
    s1, s2, s3 = _id(conn, "S0001"), _id(conn, "S0002"), _id(conn, "S0003")
    _bars(conn, s1, [D2, D3, D4, D5])
    _segment(conn, s1, "prices", D2, D5)
    _bars(conn, s2, [D2, D3, D4])
    _segment(conn, s2, "prices", D2, D4)
    run = _run(conn, state="partial", requested_at=T1, ended_at=T1)
    _record(conn, run, s3, "fundamentals", "failed", reason="provider timeout", completed_at=T1)
    retired = _instrument(conn, "R0001", "retired")
    _record(conn, run, retired, "prices", "failed", reason="provider timeout", completed_at=T1)
    _record(
        conn, run, retired, "fundamentals", "failed", reason="provider timeout", completed_at=T1
    )
    _segment(conn, retired, "prices", D2, date(2024, 1, 8))
    conn.commit()
    calls = _coverage_spy(monkeypatch)

    result = read_data_health(conn)

    assert [c[1]["cursor"] for c in calls] == [None, "S0500", "S1000", "S1500", "S2000", "S2500"]
    assert all(c[1]["lifecycle"] == "active" and c[1]["limit"] == 500 for c in calls)
    assert result.followed_count == 3000
    assert result.daily_prices == DailyPricesCheck(
        "exceptions",
        2998,
        0,
        1,
        D5,
        GapDetectionState(True, None),
        2999,
        ("S0002", "S0003", "S0004", "S0005", "S0006"),
    )
    assert result.company_financials == CompanyFinancialsCheck(
        "exceptions", 3000, 1, None, 3000, ("S0001", "S0002", "S0003", "S0004", "S0005")
    )
    assert result.affected_count == 1
    assert [r.symbol for r in result.problems.rows] == ["S0003"]
    assert result.problems.next_cursor is None


def test_a_real_store_with_every_group_and_a_partial_download(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    ids = {s: _instrument(conn, s) for s in ("AAA", "BBB", "CCC", "DDD", "EEE")}
    retired = _instrument(conn, "RET", "retired")
    run = _run(conn, state="partial", requested_at=T1, ended_at=T3)
    fundamentals_from, fundamentals_to = SEGMENT_FUNDAMENTALS

    _bars(conn, ids["AAA"], [D2, D3, D4, D5])
    _segment(conn, ids["AAA"], "prices", D2, D5)
    _segment(conn, ids["AAA"], "fundamentals", fundamentals_from, fundamentals_to)
    _record(conn, run, ids["AAA"], "prices", "written", completed_at=T1)
    _record(conn, run, ids["AAA"], "fundamentals", "written", completed_at=T1)

    _bars(conn, ids["BBB"], [D2, D3, D5])
    _segment(conn, ids["BBB"], "prices", D2, D5)
    _record(conn, run, ids["BBB"], "prices", "written", completed_at=T1)
    _record(
        conn, run, ids["BBB"], "fundamentals", "failed", reason="provider timeout", completed_at=T3
    )

    _bars(conn, ids["CCC"], [D2, D3])
    _segment(conn, ids["CCC"], "prices", D2, D3)
    _segment(conn, ids["CCC"], "fundamentals", fundamentals_from, fundamentals_to)
    _record(conn, run, ids["CCC"], "prices", "written", completed_at=T1)
    _record(conn, run, ids["CCC"], "fundamentals", "written", completed_at=T2)

    _bars(conn, ids["EEE"], [D2, D3, D4, D5])
    _segment(conn, ids["EEE"], "prices", D2, D5)
    _record(conn, run, ids["EEE"], "prices", "written", completed_at=T1)
    _record(conn, run, ids["EEE"], "fundamentals", "not_found", completed_at=T1)

    _segment(conn, retired, "prices", D2, date(2024, 1, 8))
    _record(
        conn, run, retired, "fundamentals", "failed", reason="provider timeout", completed_at=T3
    )
    conn.commit()

    result = read_data_health(conn)

    assert result.never_acquired is False
    assert result.followed_count == 5
    assert result.daily_prices == DailyPricesCheck(
        "exceptions", 1, 1, 1, D5, GapDetectionState(True, None), 3, ("BBB", "CCC", "DDD")
    )
    assert result.company_financials == CompanyFinancialsCheck(
        "exceptions", 3, 2, T2, 3, ("BBB", "DDD", "EEE")
    )
    assert result.affected_count == 2
    assert [r.symbol for r in result.problems.rows] == ["BBB", "EEE"]
    assert result.problems.next_cursor is None
    assert result.checked_at.tzinfo is not None
    with conn.cursor() as cur:
        cur.execute("SELECT now()")
        row = cur.fetchone()
    assert row is not None
    assert result.checked_at == row[0]
    assert conn.info.transaction_status == psycopg.pq.TransactionStatus.INTRANS


def test_not_determinable_on_a_real_store(migrated_writer_connection: psycopg.Connection) -> None:
    conn = migrated_writer_connection
    solo = _instrument(conn, "SOLO")
    _bars(conn, solo, [D2, D3, D4, D5])
    _segment(conn, solo, "prices", D2, D5)
    _segment(conn, solo, "fundamentals", *SEGMENT_FUNDAMENTALS)
    run = _run(conn, state="succeeded", requested_at=T1, ended_at=T1)
    _record(conn, run, solo, "prices", "written", completed_at=T1)
    _record(conn, run, solo, "fundamentals", "written", completed_at=T1)
    conn.commit()

    result = read_data_health(conn)

    assert result.daily_prices == DailyPricesCheck(
        "not_determinable",
        0,
        None,
        0,
        D5,
        GapDetectionState(False, "fewer_than_two_instruments_with_data"),
        0,
        (),
    )
    assert result.company_financials == CompanyFinancialsCheck("ok", 0, 0, T1, 0, ())
