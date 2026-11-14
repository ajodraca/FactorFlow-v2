"""Integration tests: read_problems, the one problem set, keyset-paged (CAP-003-E2-S1).

- TC-COMP-040 (DAC-E2-S1-2, DAC-E2-3): keyset pages by symbol, ``limit + 1`` lookahead.
- TC-COMP-041 (DAC-E2-S1-3, DAC-E2-2, AC-9, AC-14): the retryable rule, and a problem
  leaves only on a later ``written`` for its data type or on retirement.
- TC-COMP-042 (DAC-E2-S1-4): ``cursor`` and ``limit`` are bound; the transaction is the caller's.
- AC-13 / DAC-E2-1 facts come from the matched result; AC-16 count and rows are one set.
"""

from datetime import UTC, datetime, timedelta
from typing import Literal
from uuid import UUID

import psycopg
import pytest
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from factorflow.data_health import queries
from factorflow.data_health.models import Failure, ProblemRow
from factorflow.data_health.reader import read_problems
from factorflow.instruments.service import retire_symbol

pytestmark = pytest.mark.postgres

T0 = datetime(2026, 10, 20, 21, 0, tzinfo=UTC)

Outcome = Literal["written", "not_found", "failed"]


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


def _run(
    conn: psycopg.Connection,
    *,
    state: str = "partial",
    requested_at: datetime = T0,
    ended_at: datetime | None = None,
) -> UUID:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (state, requested_at, ended_at, history_depth_years) "
            "VALUES (%s, %s, %s, 1) RETURNING run_id",
            (state, requested_at, ended_at if ended_at is not None else requested_at),
        )
        row = cur.fetchone()
        assert row is not None
        return UUID(str(row[0]))


def _record(
    conn: psycopg.Connection,
    run_id: UUID,
    instrument_id: int,
    data_type: str,
    outcome: Outcome,
    *,
    reason: str | None = None,
    attempts: int = 1,
    completed_at: datetime = T0,
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


def _problem_stocks(conn: psycopg.Connection, symbols: list[str]) -> UUID:
    """One active stock per symbol, each with one ``failed`` prices result."""
    run = _run(conn)
    for symbol in symbols:
        _record(conn, run, _instrument(conn, symbol), "prices", "failed", reason="boom")
    return run


def _page_symbols(page_rows: tuple[ProblemRow, ...]) -> tuple[str, ...]:
    return tuple(row.symbol for row in page_rows)


def _snapshot(conn: psycopg.Connection) -> list[list[tuple[object, ...]]]:
    tables = (
        ("instrument", "instrument_id"),
        ("acquisition_run", "run_id"),
        ("acquisition_state", "instrument_id, data_type"),
        ("run_instrument_result", "run_id, instrument_id, data_type"),
    )
    out: list[list[tuple[object, ...]]] = []
    with conn.cursor() as cur:
        for table, order in tables:
            cur.execute(f"SELECT * FROM {table} ORDER BY {order}")  # noqa: S608
            out.append(cur.fetchall())
    conn.commit()
    return out


# Implements TC-COMP-040
def test_pages_of_two_over_five_problem_stocks(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _problem_stocks(conn, ["AAA", "BBB", "CCC", "DDD", "EEE"])
    conn.commit()

    first = read_problems(conn, cursor=None, limit=2)
    second = read_problems(conn, cursor=first.next_cursor, limit=2)
    third = read_problems(conn, cursor=second.next_cursor, limit=2)

    assert _page_symbols(first.rows) == ("AAA", "BBB")
    assert first.next_cursor == "BBB"
    assert _page_symbols(second.rows) == ("CCC", "DDD")
    assert second.next_cursor == "DDD"
    assert _page_symbols(third.rows) == ("EEE",)
    assert third.next_cursor is None


# Implements TC-COMP-040
def test_full_final_page_has_no_cursor_and_past_the_end_is_empty(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _problem_stocks(conn, ["AAA", "BBB", "CCC", "DDD", "EEE"])
    conn.commit()

    full = read_problems(conn, cursor="BBB", limit=3)
    beyond = read_problems(conn, cursor="ZZZ", limit=2)

    assert _page_symbols(full.rows) == ("CCC", "DDD", "EEE")
    assert full.next_cursor is None
    assert beyond.rows == ()
    assert beyond.next_cursor is None


# Implements TC-COMP-041
def test_retryable_rule_and_resolution_only_by_write_or_retirement(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    r1 = _run(conn, requested_at=T0)
    ids = {s: _instrument(conn, s) for s in ("NFX", "FLD", "MIX")}
    for dt in ("prices", "fundamentals"):
        _record(conn, r1, ids["NFX"], dt, "not_found")
    for dt in ("reference", "corporate_actions"):
        _record(conn, r1, ids["NFX"], dt, "written")
    _record(conn, r1, ids["FLD"], "prices", "failed", reason="boom")
    for dt in ("reference", "fundamentals", "corporate_actions"):
        _record(conn, r1, ids["FLD"], dt, "written")
    _record(conn, r1, ids["MIX"], "prices", "failed", reason="boom")
    _record(conn, r1, ids["MIX"], "fundamentals", "not_found")
    conn.commit()

    def read() -> dict[str, bool]:
        page = read_problems(conn, cursor=None, limit=500)
        conn.rollback()
        return {row.symbol: row.retryable for row in page.rows}

    assert read() == {"FLD": True, "MIX": True, "NFX": False}

    r2 = _run(conn, requested_at=T0 + timedelta(hours=1))
    _record(conn, r2, ids["NFX"], "reference", "written", completed_at=T0 + timedelta(hours=1))
    conn.commit()
    assert set(read()) == {"FLD", "MIX", "NFX"}

    _record(conn, r2, ids["FLD"], "prices", "written", completed_at=T0 + timedelta(hours=1))
    conn.commit()
    assert set(read()) == {"MIX", "NFX"}

    retire_symbol(conn, "NFX")
    conn.commit()
    assert read() == {"MIX": True}
    r3 = _run(conn, requested_at=T0 + timedelta(hours=2))
    _record(
        conn,
        r3,
        ids["MIX"],
        "prices",
        "failed",
        reason="second attempt",
        completed_at=T0 + timedelta(hours=2),
    )
    _run(conn, state="cancelled", requested_at=T0 + timedelta(hours=3))
    conn.commit()
    page = read_problems(conn, cursor=None, limit=500)
    conn.rollback()
    mix = page.rows[0]
    prices = next(f for f in mix.failures if f.data_type == "prices")
    assert [row.symbol for row in page.rows] == ["MIX"]
    assert prices.run_id == r3
    assert prices.reason == "second attempt"


# Implements TC-COMP-041
def test_reads_record_nothing(migrated_writer_connection: psycopg.Connection) -> None:
    conn = migrated_writer_connection
    _problem_stocks(conn, ["AAA", "BBB"])
    conn.commit()

    before = _snapshot(conn)
    read_problems(conn, cursor=None, limit=1)
    conn.rollback()
    read_problems(conn, cursor="AAA", limit=1)
    conn.rollback()

    assert _snapshot(conn) == before


# Implements TC-COMP-042
def test_cursor_is_a_bound_parameter(migrated_writer_connection: psycopg.Connection) -> None:
    conn = migrated_writer_connection
    _problem_stocks(conn, ["AAA", "BBB"])
    conn.commit()

    page = read_problems(conn, cursor="Z' OR '1'='1", limit=2)

    assert page.rows == ()
    assert page.next_cursor is None


# Implements TC-COMP-042
def test_the_transaction_belongs_to_the_caller(
    migrated_writer_connection: psycopg.Connection, postgres_connection_string: str
) -> None:
    conn = migrated_writer_connection
    _problem_stocks(conn, ["AAA", "BBB"])
    conn.commit()
    assert conn.info.transaction_status == psycopg.pq.TransactionStatus.IDLE

    read_problems(conn, cursor=None, limit=2)
    assert conn.info.transaction_status == psycopg.pq.TransactionStatus.INTRANS
    conn.rollback()
    assert conn.info.transaction_status == psycopg.pq.TransactionStatus.IDLE

    with ConnectionPool(postgres_connection_string, min_size=1, max_size=1) as pool:
        with pool.connection() as pooled:
            read_problems(pooled, cursor=None, limit=2)
            assert pooled.info.transaction_status == psycopg.pq.TransactionStatus.INTRANS
        with pool.connection() as again:
            assert again.info.transaction_status == psycopg.pq.TransactionStatus.IDLE


def test_failure_facts_come_from_the_matched_result(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    t1, t2, t3 = T0, T0 + timedelta(hours=1), T0 + timedelta(hours=2)
    aaa = _instrument(conn, "AAA")
    r1 = _run(conn, requested_at=t1)
    _record(conn, r1, aaa, "prices", "failed", reason="old reason", attempts=1, completed_at=t1)
    r2 = _run(conn, requested_at=t2)
    _record(
        conn, r2, aaa, "prices", "failed", reason="provider timeout", attempts=3, completed_at=t2
    )
    _record(conn, r2, aaa, "fundamentals", "not_found", reason=None, attempts=2, completed_at=t3)
    _record(conn, r2, aaa, "reference", "written", completed_at=t2)
    _record(conn, r2, aaa, "corporate_actions", "written", completed_at=t2)
    conn.commit()

    page = read_problems(conn, cursor=None, limit=10)

    assert len(page.rows) == 1
    assert page.rows[0].failures == (
        Failure("fundamentals", "not_found", None, 2, t3, r2),
        Failure("prices", "failed", "provider timeout", 3, t2, r2),
    )


def _t008_store(conn: psycopg.Connection) -> None:
    run = _problem_stocks(conn, ["AAA", "BBB", "CCC", "DDD", "EEE"])
    _record(conn, run, _instrument(conn, "ABR"), "prices", "failed", reason="boom")
    retire_symbol(conn, "ABR")
    abw = _instrument(conn, "ABW")
    for dt in ("reference", "prices", "fundamentals", "corporate_actions"):
        _record(conn, run, abw, dt, "written")
    conn.commit()


def test_retired_and_clean_stocks_take_no_page_slot(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _t008_store(conn)

    first = read_problems(conn, cursor=None, limit=2)
    second = read_problems(conn, cursor=first.next_cursor, limit=2)
    third = read_problems(conn, cursor=second.next_cursor, limit=2)

    assert [_page_symbols(p.rows) for p in (first, second, third)] == [
        ("AAA", "BBB"),
        ("CCC", "DDD"),
        ("EEE",),
    ]
    assert [p.next_cursor for p in (first, second, third)] == ["BBB", "DDD", None]


def test_the_count_and_the_rows_are_one_set(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _t008_store(conn)
    t_new = T0 + timedelta(days=1)
    bbb_run = _run(conn, requested_at=t_new)
    with conn.cursor() as cur:
        cur.execute("SELECT instrument_id FROM instrument WHERE symbol = 'BBB'")
        row = cur.fetchone()
        assert row is not None
    _record(conn, bbb_run, int(row[0]), "fundamentals", "not_found", completed_at=t_new)
    conn.commit()

    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(queries.PROBLEM_COUNT_SQL)
        counted = cur.fetchone()
    conn.rollback()
    assert counted is not None
    assert counted["stock_count"] == 5
    assert counted["symbols"] == ["AAA", "BBB", "CCC"]
    assert counted["newest_completed_at"] == t_new

    paged: set[str] = set()
    cursor: str | None = None
    while True:
        page = read_problems(conn, cursor=cursor, limit=2)
        conn.rollback()
        paged.update(row.symbol for row in page.rows)
        cursor = page.next_cursor
        if cursor is None:
            break
    assert len(paged) == counted["stock_count"]


def test_the_count_on_an_empty_store(migrated_writer_connection: psycopg.Connection) -> None:
    conn = migrated_writer_connection

    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(queries.PROBLEM_COUNT_SQL)
        counted = cur.fetchone()
    conn.rollback()

    assert counted == {"stock_count": 0, "symbols": [], "newest_completed_at": None}
