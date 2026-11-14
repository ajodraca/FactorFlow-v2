"""Integration tests: read_attention, the cheap aggregate the shell polls (CAP-003-E2-S2).

- TC-COMP-043 (DAC-E2-S2-1, AC-8, AC-21): the empty store and ``checked_at`` from the statement.
- TC-COMP-036 (DAC-E2-6, AC-7): progress ``done`` counts instruments with all four results;
  ``total`` is ``instruments_named``, null while 0.
- TC-COMP-044 (DAC-E2-7, DAC-E2-8, DAC-E2-S2-2, AC-9, AC-12, AC-21): latest versus latest
  terminal download, and the abandoned item.
- TC-COMP-045 (DAC-E2-S2-3, DAC-E2-8, AC-4): the ``credential_missing`` item.
- TC-COMP-046 (DAC-E2-S2-4, AC-28): a fixed set of five aggregate statements at any roster size.
"""

from datetime import UTC, date, datetime, timedelta
from typing import Any, Literal
from uuid import UUID

import psycopg
import pytest

from factorflow.data_health import queries
from factorflow.data_health.models import (
    AttentionItem,
    LatestDownload,
    LatestTerminalDownload,
    Problems,
    Progress,
)
from factorflow.data_health.reader import read_attention
from factorflow.runs.queries import get_most_recent_run

pytestmark = pytest.mark.postgres

SENTINEL = "sk-attention-sentinel-0123456789"
KEY = "FACTORFLOW_MASSIVE_API_KEY"
T0 = datetime(2026, 10, 20, 21, 0, tzinfo=UTC)
DATA_TYPES = ("reference", "prices", "fundamentals", "corporate_actions")
TERMINAL = ("succeeded", "partial", "failed", "cancelled", "abandoned")

Outcome = Literal["written", "unchanged", "not_found", "failed", "skipped"]


def _t(n: int) -> datetime:
    """The n-th hour after T0: fixed aware instants, never ``now()``."""
    return T0 + timedelta(hours=n)


@pytest.fixture(autouse=True)
def _credential_set(monkeypatch: pytest.MonkeyPatch) -> None:
    """No result depends on the developer's environment; a test removes the key itself."""
    monkeypatch.setenv(KEY, SENTINEL)


def _instrument(conn: psycopg.Connection, symbol: str, *, lifecycle: str = "active") -> int:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle, retired_at) "
            "VALUES (%s, %s, CASE WHEN %s = 'retired' THEN now() END) RETURNING instrument_id",
            (symbol, lifecycle, lifecycle),
        )
        row = cur.fetchone()
        assert row is not None
        return int(row[0])


def _run(
    conn: psycopg.Connection,
    *,
    state: str,
    requested_at: datetime,
    started_at: datetime | None = None,
    ended_at: datetime | None = None,
    instruments_named: int = 0,
    failure_reason: str | None = None,
    run_id: UUID | None = None,
) -> UUID:
    active = state in ("running", "cancelling")
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (run_id, state, requested_at, started_at, ended_at, "
            "history_depth_years, instruments_named, failure_reason, claimed_by, heartbeat_at) "
            "VALUES (COALESCE(%s, gen_random_uuid()), %s, %s, %s, %s, 1, %s, %s, %s, %s) "
            "RETURNING run_id",
            (
                run_id,
                state,
                requested_at,
                started_at,
                ended_at,
                instruments_named,
                failure_reason,
                "test-runner" if active else None,
                requested_at if active else None,
            ),
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
    completed_at: datetime,
    reason: str | None = None,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO run_instrument_result "
            "(run_id, instrument_id, data_type, outcome, reason, completed_at) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (run_id, instrument_id, data_type, outcome, reason, completed_at),
        )
        if outcome == "skipped":
            return  # a skipped result leaves acquisition_state untouched
        stored = "written" if outcome == "unchanged" else outcome
        cur.execute(
            "INSERT INTO acquisition_state "
            "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
            "VALUES (%s, %s, %s, %s, %s) "
            "ON CONFLICT (instrument_id, data_type) DO UPDATE SET "
            "last_acquired_at = EXCLUDED.last_acquired_at, "
            "last_run_id = EXCLUDED.last_run_id, last_outcome = EXCLUDED.last_outcome",
            (instrument_id, data_type, completed_at, run_id, stored),
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


def _by_kind(items: tuple[AttentionItem, ...]) -> dict[str, AttentionItem]:
    """Items keyed by kind: the design fixes no order (RD 2.7)."""
    return {item.kind: item for item in items}


# Implements TC-COMP-043
def test_empty_store_reads_zero_and_nones(migrated_writer_connection: psycopg.Connection) -> None:
    conn = migrated_writer_connection

    attention = read_attention(conn)

    assert attention.followed_count == 0
    assert attention.prices_as_of is None
    assert attention.latest_download is None
    assert attention.latest_terminal_download is None
    assert attention.problems == Problems(0, (), None)
    assert attention.items == ()
    assert attention.credential_present is True
    # checked_at is the statement's now(): the transaction start, still open here.
    assert attention.checked_at.tzinfo is not None
    with conn.cursor() as cur:
        cur.execute("SELECT now()")
        row = cur.fetchone()
    assert row is not None
    assert row[0] == attention.checked_at
    conn.rollback()


# Implements TC-COMP-036
def test_progress_counts_complete_instruments_and_total_is_null_before_the_claim(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    ids = [_instrument(conn, f"P{n:03d}") for n in range(1, 51)]
    # An earlier run holds all four results for all 50 instruments, so a count that is
    # not restricted to the latest run would read 50.
    r0 = _run(conn, state="succeeded", requested_at=_t(0), ended_at=_t(1))
    for iid in ids:
        for data_type in DATA_TYPES:
            _record(conn, r0, iid, data_type, "written", completed_at=_t(1))
    r1 = _run(conn, state="requested", requested_at=_t(2))
    conn.commit()

    before = read_attention(conn)
    conn.rollback()

    assert before.latest_download is not None
    assert before.latest_download.run_id == r1
    assert before.latest_download.progress == Progress(0, None)

    with conn.cursor() as cur:
        cur.execute(
            "UPDATE acquisition_run SET state = 'running', started_at = %s, "
            "claimed_by = 'test-runner', heartbeat_at = %s, instruments_named = 120 "
            "WHERE run_id = %s",
            (_t(3), _t(3), r1),
        )
    for n, iid in enumerate(ids[:40], start=1):
        for data_type in DATA_TYPES:
            outcome: Outcome = "written"
            if n <= 10 and data_type == "prices":
                outcome = "failed"
            elif 11 <= n <= 15 and data_type == "fundamentals":
                outcome = "skipped"
            _record(conn, r1, iid, data_type, outcome, completed_at=_t(4))
    for iid in ids[40:43]:  # three data types only: not complete
        for data_type in DATA_TYPES[:3]:
            _record(conn, r1, iid, data_type, "written", completed_at=_t(4))
    conn.commit()

    after = read_attention(conn)
    conn.rollback()

    assert after.latest_download is not None
    assert after.latest_download.progress == Progress(40, 120)
    assert after.latest_download.progress.done <= (after.latest_download.progress.total or 0)


# Implements TC-COMP-036
def test_a_single_named_instrument_is_a_total_of_one(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    iid = _instrument(conn, "AAA")
    run = _run(conn, state="running", requested_at=_t(1), started_at=_t(1), instruments_named=1)
    for data_type in DATA_TYPES:
        _record(conn, run, iid, data_type, "written", completed_at=_t(2))
    conn.commit()

    attention = read_attention(conn)
    conn.rollback()

    assert attention.latest_download is not None
    assert attention.latest_download.progress == Progress(1, 1)


# Implements TC-COMP-044
def test_running_download_does_not_displace_the_latest_terminal_one(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    a = _run(
        conn,
        state="partial",
        requested_at=_t(1),
        ended_at=_t(2),
        failure_reason="provider rate limit",
    )
    b = _run(conn, state="running", requested_at=_t(3), started_at=_t(3), instruments_named=5)
    conn.commit()

    attention = read_attention(conn)
    conn.rollback()

    assert attention.latest_download == LatestDownload(
        b, "running", _t(3), _t(3), None, Progress(0, 5)
    )
    assert attention.latest_terminal_download == LatestTerminalDownload(
        a, "partial", _t(2), "provider rate limit"
    )
    assert attention.items == ()  # a partial latest terminal download gives no item


# Implements TC-COMP-044
def test_abandoned_latest_terminal_download_gives_the_item(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    c = _run(conn, state="abandoned", requested_at=_t(1), ended_at=_t(2))
    conn.commit()

    attention = read_attention(conn)
    conn.rollback()

    assert attention.latest_terminal_download == LatestTerminalDownload(c, "abandoned", _t(2), None)
    assert attention.items == (AttentionItem("download_not_complete", _t(2), c),)


# Implements TC-COMP-044
def test_latest_terminal_download_is_ordered_by_ended_at_not_requested_at(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    x = _run(
        conn,
        state="failed",
        requested_at=_t(1),
        started_at=_t(1),
        ended_at=_t(5),
        failure_reason="no credential",
    )
    # Cancelled while still requested: the two overlap without breaking the single-active index.
    y = _run(conn, state="cancelled", requested_at=_t(2), ended_at=_t(3))
    conn.commit()

    attention = read_attention(conn)
    conn.rollback()

    assert attention.latest_download is not None
    assert attention.latest_download.run_id == y  # greatest requested_at
    assert attention.latest_terminal_download == LatestTerminalDownload(
        x, "failed", _t(5), "no credential"
    )
    assert attention.items == (AttentionItem("download_not_complete", _t(5), x),)


# Implements TC-COMP-044
def test_a_store_whose_only_run_is_cancelled_has_no_item(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    _run(conn, state="cancelled", requested_at=_t(1), ended_at=_t(2))
    conn.commit()

    attention = read_attention(conn)
    conn.rollback()

    assert attention.latest_terminal_download is not None
    assert attention.latest_terminal_download.state == "cancelled"
    assert attention.items == ()


# Implements TC-COMP-045
def test_credential_missing_item_while_the_key_is_absent(
    migrated_writer_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    conn = migrated_writer_connection
    monkeypatch.delenv(KEY, raising=False)

    absent = read_attention(conn)
    conn.rollback()

    assert absent.credential_present is False
    assert absent.items == (AttentionItem("credential_missing", absent.checked_at, None),)

    monkeypatch.setenv(KEY, SENTINEL)
    present = read_attention(conn)
    conn.rollback()

    assert present.credential_present is True
    assert present.items == ()
    assert SENTINEL not in repr(present)


class _CountingCursor:
    def __init__(self, cursor: Any, statements: list[str]) -> None:
        self._cursor = cursor
        self._statements = statements

    def __enter__(self) -> "_CountingCursor":
        return self

    def __exit__(self, *exc: object) -> None:
        self._cursor.close()

    def execute(self, query: str, params: Any = None) -> "_CountingCursor":
        self._statements.append(query)
        self._cursor.execute(query, params)
        return self

    def __getattr__(self, name: str) -> Any:
        return getattr(self._cursor, name)


class _CountingConnection:
    """Delegates to a real connection and records every statement executed through it."""

    def __init__(self, conn: psycopg.Connection) -> None:
        self._conn = conn
        self.statements: list[str] = []

    def cursor(self) -> _CountingCursor:
        return _CountingCursor(self._conn.cursor(), self.statements)


FIVE = [
    queries.FOLLOWED_COUNT_SQL,
    queries.PRICES_AS_OF_SQL,
    queries.PROBLEM_COUNT_SQL,
    queries.LATEST_DOWNLOAD_SQL,
    queries.LATEST_TERMINAL_SQL,
]


def _assert_the_five_constants(counting: _CountingConnection) -> None:
    assert counting.statements == FIVE
    assert all(s is c for s, c in zip(counting.statements, FIVE, strict=True))


# Implements TC-COMP-046
def test_five_fixed_statements_on_a_small_store(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    a = _instrument(conn, "AAA")
    _instrument(conn, "BBB")
    _instrument(conn, "CCC")
    run = _run(conn, state="running", requested_at=_t(1), started_at=_t(1), instruments_named=3)
    _record(conn, run, a, "prices", "failed", completed_at=_t(2), reason="[unavailable] x")
    for data_type in DATA_TYPES:
        if data_type != "prices":
            _record(conn, run, a, data_type, "written", completed_at=_t(2))
    conn.commit()
    counting = _CountingConnection(conn)

    attention = read_attention(counting)  # type: ignore[arg-type]
    conn.rollback()

    _assert_the_five_constants(counting)
    assert attention.followed_count == 3
    assert attention.problems.stock_count == 1


# Implements TC-COMP-046
def test_the_same_five_statements_at_3000_instruments(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle) "
            "SELECT 'S' || lpad(n::text, 4, '0'), 'active' FROM generate_series(1, 3000) AS n"
        )
        cur.execute(
            "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
            "SELECT instrument_id, 'prices', '2026-01-02', '2026-10-23' FROM instrument"
        )
    run = _run(conn, state="running", requested_at=_t(1), started_at=_t(1), instruments_named=3000)
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO run_instrument_result "
            "(run_id, instrument_id, data_type, outcome, reason, completed_at) "
            "SELECT %s, i.instrument_id, d.data_type, "
            "       CASE WHEN d.data_type = 'prices' AND i.symbol <= 'S0300' "
            "            THEN 'failed' ELSE 'written' END, "
            "       CASE WHEN d.data_type = 'prices' AND i.symbol <= 'S0300' "
            "            THEN '[unavailable] x' END, "
            "       %s "
            "  FROM instrument i "
            " CROSS JOIN (VALUES ('reference'), ('prices'), ('fundamentals'), "
            "                    ('corporate_actions')) AS d (data_type) "
            " WHERE i.symbol <= 'S1500'",
            (run, _t(2)),
        )
        cur.execute(
            "INSERT INTO acquisition_state "
            "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
            "SELECT instrument_id, data_type, completed_at, run_id, outcome "
            "  FROM run_instrument_result WHERE run_id = %s",
            (run,),
        )
    conn.commit()
    counting = _CountingConnection(conn)

    attention = read_attention(counting)  # type: ignore[arg-type]
    conn.rollback()

    _assert_the_five_constants(counting)
    assert attention.followed_count == 3000
    assert attention.prices_as_of == date(2026, 10, 23)
    assert attention.problems.stock_count == 300
    assert attention.problems.symbols == ("S0001", "S0002", "S0003")
    assert attention.latest_download is not None
    assert attention.latest_download.progress == Progress(1500, 3000)


# Implements TC-COMP-043
def test_followed_count_and_prices_as_of_count_only_active_instruments(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    aaa = _instrument(conn, "AAA")
    bbb = _instrument(conn, "BBB")
    ccc = _instrument(conn, "CCC")
    rrr = _instrument(conn, "RRR", lifecycle="retired")
    _segment(conn, aaa, "prices", date(2026, 1, 2), date(2026, 10, 20))
    _segment(conn, aaa, "prices", date(2025, 1, 2), date(2025, 6, 30))
    _segment(conn, bbb, "prices", date(2026, 3, 2), date(2026, 10, 23))
    _segment(conn, ccc, "fundamentals", date(2026, 1, 2), date(2026, 11, 2))
    _segment(conn, rrr, "prices", date(2026, 1, 2), date(2026, 10, 30))
    conn.commit()

    attention = read_attention(conn)
    conn.rollback()

    assert attention.followed_count == 3
    assert attention.prices_as_of == date(2026, 10, 23)


def _state_run(state: str) -> dict[str, Any]:
    if state == "requested":
        return {"requested_at": _t(1)}
    if state in ("running", "cancelling"):
        return {"requested_at": _t(1), "started_at": _t(1)}
    return {"requested_at": _t(1), "started_at": _t(1), "ended_at": _t(2)}


# Implements TC-COMP-044
@pytest.mark.parametrize("state", [*("requested", "running", "cancelling"), *TERMINAL])
def test_run_states_are_returned_as_recorded(
    migrated_writer_connection: psycopg.Connection, state: str
) -> None:
    conn = migrated_writer_connection
    _run(conn, state=state, **_state_run(state))
    conn.commit()

    attention = read_attention(conn)
    conn.rollback()

    assert attention.latest_download is not None
    assert attention.latest_download.state == state
    if state in TERMINAL:
        assert attention.latest_terminal_download is not None
        assert attention.latest_terminal_download.state == state
    else:
        assert attention.latest_terminal_download is None


LOW = UUID(int=1)
HIGH = UUID(int=2)


# Implements TC-COMP-044
@pytest.mark.parametrize("high_first", [True, False])
def test_tie_on_requested_at_picks_the_run_health_picks(
    migrated_writer_connection: psycopg.Connection, high_first: bool
) -> None:
    conn = migrated_writer_connection
    for run_id, ended in (
        ((HIGH, _t(3)), (LOW, _t(2))) if high_first else ((LOW, _t(2)), (HIGH, _t(3)))
    ):
        _run(conn, state="failed", requested_at=_t(1), ended_at=ended, run_id=run_id)
    conn.commit()

    attention = read_attention(conn)
    recent = get_most_recent_run(conn)
    conn.rollback()

    assert attention.latest_download is not None
    assert attention.latest_download.run_id == HIGH
    assert recent is not None
    assert attention.latest_download.run_id == recent.run_id


# Implements TC-COMP-044
@pytest.mark.parametrize("high_first", [True, False])
def test_tie_on_ended_at_picks_the_greater_run_id(
    migrated_writer_connection: psycopg.Connection, high_first: bool
) -> None:
    conn = migrated_writer_connection
    pairs = ((HIGH, _t(1)), (LOW, _t(2))) if high_first else ((LOW, _t(2)), (HIGH, _t(1)))
    for run_id, requested in pairs:
        _run(conn, state="failed", requested_at=requested, ended_at=_t(5), run_id=run_id)
    conn.commit()

    attention = read_attention(conn)
    conn.rollback()

    assert attention.latest_terminal_download is not None
    assert attention.latest_terminal_download.run_id == HIGH


_TABLES = (
    ("instrument", "instrument_id"),
    ("acquisition_run", "run_id"),
    ("acquisition_state", "instrument_id, data_type"),
    ("run_instrument_result", "run_id, instrument_id, data_type"),
)


def _snapshot(conn: psycopg.Connection) -> list[list[tuple[object, ...]]]:
    out: list[list[tuple[object, ...]]] = []
    with conn.cursor() as cur:
        for table, order in _TABLES:
            cur.execute(f"SELECT * FROM {table} ORDER BY {order}")  # noqa: S608
            out.append(cur.fetchall())
    conn.commit()
    return out


# Implements TC-COMP-044
# Implements TC-COMP-045
def test_items_exist_exactly_while_their_cause_holds(
    migrated_writer_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    conn = migrated_writer_connection
    aaa = _instrument(conn, "AAA")
    f = _run(
        conn,
        state="failed",
        requested_at=_t(3),
        ended_at=_t(5),
        failure_reason="provider unavailable",
    )
    _record(conn, f, aaa, "prices", "failed", completed_at=_t(4), reason="[unavailable] x")
    conn.commit()

    # (1) both causes hold, and reading records nothing.
    before = _snapshot(conn)
    first = read_attention(conn)
    conn.rollback()
    read_attention(conn)
    conn.rollback()
    assert _snapshot(conn) == before
    items = _by_kind(first.items)
    assert len(first.items) == 2
    assert items["data_problems"] == AttentionItem("data_problems", _t(4), None)
    assert items["download_not_complete"] == AttentionItem("download_not_complete", _t(5), f)

    # (2) a running download is not a later ended one: both items stay.
    h = _run(conn, state="running", requested_at=_t(6), started_at=_t(6))
    conn.commit()
    second = read_attention(conn)
    conn.rollback()
    assert {i.kind for i in second.items} == {"data_problems", "download_not_complete"}

    # (3) the download ends succeeded after writing the stock's prices: the causes are gone.
    _record(conn, h, aaa, "prices", "written", completed_at=_t(7))
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE acquisition_run SET state = 'succeeded', ended_at = %s, "
            "claimed_by = NULL, heartbeat_at = NULL WHERE run_id = %s",
            (_t(8), h),
        )
    conn.commit()
    third = read_attention(conn)
    conn.rollback()
    assert third.items == ()
    assert third.problems.stock_count == 0

    # (4) the key goes: only the credential item.
    monkeypatch.delenv(KEY, raising=False)
    fourth = read_attention(conn)
    conn.rollback()
    assert fourth.items == (AttentionItem("credential_missing", fourth.checked_at, None),)


# Implements TC-COMP-043
def test_problem_block_is_mapped_field_for_field(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    run = _run(conn, state="partial", requested_at=_t(0), ended_at=_t(9))
    for n, (symbol, outcome) in enumerate(
        (("AAA", "failed"), ("BBB", "not_found"), ("CCC", "failed"), ("DDD", "not_found")), start=1
    ):
        _record(
            conn,
            run,
            _instrument(conn, symbol),
            "prices",
            outcome,  # type: ignore[arg-type]
            completed_at=_t(n),
            reason="[unavailable] x",
        )
    retired = _instrument(conn, "ABR", lifecycle="retired")
    _record(conn, run, retired, "prices", "failed", completed_at=_t(5), reason="[unavailable] x")
    conn.commit()

    attention = read_attention(conn)
    conn.rollback()

    assert attention.problems == Problems(4, ("AAA", "BBB", "CCC"), _t(4))
    assert type(attention.problems.symbols) is tuple
