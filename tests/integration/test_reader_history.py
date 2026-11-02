"""Stock history, the set list and one set against a real store (CAP-002-E3-S4).

Proves ``component-design-classification-reader.md`` sections 2.3, 2.6 and 7 (rows "History is as
recorded" and "Sets list"): DAC-E3-S4-1, DAC-E3-S4-2 and DAC-E3-S4-3 (TC-COMP-150, 151, 152) and,
through them, DAC-E3-9 and the history half of DAC-E3-12 (AC-18, AC-19, AC-20, AC-21, AC-23).
The current set is not history (DEC-0137); paging and errors follow DEC-0136; a set with no
``classification_set_factor`` row carries empty ``factors`` (DEC-0265, PROVISIONAL). Sets and rows
are seeded directly, so the reader is tested independently of the engine.
"""

import dataclasses
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

import psycopg
import pytest

from factorflow.classification import reader
from factorflow.classification.constants import FACTORS
from tests.integration.reader_seed import (
    insert_classification,
    insert_instrument,
    insert_run,
    insert_set,
    seed_scored_stock,
)

pytestmark = pytest.mark.postgres

T0 = datetime(2026, 10, 1, 22, 30, tzinfo=UTC)
D = Decimal
COUNTS = {"value": (35, True), "growth": (12, False), "momentum": (40, True)}


@dataclasses.dataclass(frozen=True)
class Seeded:
    set_id: UUID
    run_id: UUID
    run_started_at: datetime
    started_at: datetime
    ended_at: datetime | None
    classification_date: date


def _set(
    conn: psycopg.Connection,
    state: str = "complete",
    *,
    started_at: datetime,
    ended_at: datetime | None = None,
    run_state: str = "succeeded",
    failure_reason: str | None = None,
    classification_date: date | None = None,
    active_instruments: int = 1,
    factors: dict[str, tuple[int, bool]] | None = None,
) -> Seeded:
    """A set and its run; a terminal set ends five minutes after it starts unless told."""
    run_started_at = started_at - timedelta(hours=1)
    run_id = insert_run(conn, run_state, started_at=run_started_at)
    if state != "building" and ended_at is None:
        ended_at = started_at + timedelta(minutes=5)
    day = classification_date or started_at.date()
    set_id = insert_set(
        conn,
        run_id,
        state,
        started_at=started_at,
        ended_at=ended_at,
        classification_date=day,
        latest_trading_day=day if state == "complete" else None,
        active_instruments=active_instruments if state == "complete" else None,
        failure_reason=failure_reason,
        factors=COUNTS if factors is None else factors,
    )
    return Seeded(set_id, run_id, run_started_at, started_at, ended_at, day)


def _drop_factor_rows(conn: psycopg.Connection, set_id: UUID) -> None:
    """Leave the set as the engine leaves a building or failed one: no factor rows (DEC-0265)."""
    conn.execute("DELETE FROM classification_set_factor WHERE set_id = %s", (set_id,))
    conn.commit()


def _cells(conn: psycopg.Connection, set_id: UUID, instrument_id: int) -> dict[str, Any]:
    """The stored cells, read back from the table, never from the statement under test."""
    rows = conn.execute(
        "SELECT factor, status, score, percentile, reason_code, reason_input, reason_detail, "
        "restated_possible FROM factor_classification WHERE set_id = %s AND instrument_id = %s",
        (set_id, instrument_id),
    ).fetchall()
    return {r[0]: reader.FactorCell(*r[1:]) for r in rows}


def _history_ids(rows: list[Any]) -> list[UUID]:
    return [row.set_id for row in rows]


def _all_history(conn: psycopg.Connection, symbol: str, limit: int) -> list[list[UUID]]:
    pages: list[list[UUID]] = []
    cursor = None
    while True:
        rows, cursor = reader.stock_history(conn, symbol, limit=limit, cursor=cursor)
        pages.append(_history_ids(rows))
        if cursor is None:
            return pages


class CountingConnection:
    """Delegates to a real connection and records every statement executed through it."""

    def __init__(self, conn: psycopg.Connection) -> None:
        self._conn = conn
        self.statements: list[str] = []

    def cursor(self) -> "CountingCursor":
        return CountingCursor(self._conn.cursor(), self.statements)


class CountingCursor:
    def __init__(self, cursor: psycopg.Cursor[Any], statements: list[str]) -> None:
        self._cursor = cursor
        self._statements = statements

    def __enter__(self) -> "CountingCursor":
        return self

    def __exit__(self, *exc: object) -> None:
        self._cursor.close()

    def execute(self, query: str, params: Any = None) -> "CountingCursor":
        self._statements.append(query)
        self._cursor.execute(query, params)
        return self

    def __getattr__(self, name: str) -> Any:
        return getattr(self._cursor, name)


# --- History (TC-COMP-150, 151, 152; DAC-E3-S4-1 to DAC-E3-S4-3) -------------------------


# Implements TC-COMP-150
def test_history_returns_earlier_complete_sets_newest_first_with_marks(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S4-1, DAC-E3-9, DAC-E3-12: earlier complete sets only, newest first, each cell and
    its restatement mark exactly as stored; the current set is excluded (DEC-0137)."""
    conn = migrated_run_schema_connection
    oldest = _set(conn, started_at=T0, classification_date=date(2026, 10, 1))
    middle = _set(
        conn,
        started_at=T0 + timedelta(days=1),
        run_state="partial",
        classification_date=date(2026, 10, 2),
    )
    current = _set(conn, started_at=T0 + timedelta(days=2))
    aapl = insert_instrument(conn, "AAPL")
    insert_classification(conn, oldest.set_id, aapl, "value", score=D("0.1"), percentile=D("10"))
    insert_classification(
        conn,
        oldest.set_id,
        aapl,
        "growth",
        "not_classified",
        reason_code="input_outdated",
        reason_input="eps_growth",
        reason_detail="eps_growth is input_outdated",
    )
    insert_classification(
        conn, oldest.set_id, aapl, "momentum", score=D("-1.25"), percentile=D("2.5")
    )
    # The middle set's rows are stored against factor order, so the read's order is its own.
    insert_classification(
        conn, middle.set_id, aapl, "momentum", "not_classified", reason_code="not_enough_stocks"
    )
    insert_classification(
        conn,
        middle.set_id,
        aapl,
        "growth",
        score=D("0.25"),
        percentile=D("25"),
        restated_possible=True,
    )
    insert_classification(
        conn,
        middle.set_id,
        aapl,
        "value",
        score=D("0.2"),
        percentile=D("20.123456"),
        restated_possible=True,
    )
    for factor in FACTORS:
        insert_classification(conn, current.set_id, aapl, factor, score=D("9"), percentile=D("90"))
    # Another stock in every set with other values: only AAPL's rows are read.
    for seeded in (oldest, middle, current):
        seed_scored_stock(conn, seeded.set_id, f"Z{seeded.started_at.day:02d}")

    rows, next_cursor = reader.stock_history(conn, "AAPL", limit=50, cursor=None)

    assert next_cursor is None
    assert _history_ids(rows) == [middle.set_id, oldest.set_id]
    for row, seeded, outcome in ((rows[0], middle, "partial"), (rows[1], oldest, "succeeded")):
        assert isinstance(row, reader.HistoryRow)
        assert row.classification_date == seeded.classification_date
        assert row.run_id == seeded.run_id
        assert row.run_outcome == outcome
        assert row.ended_at == seeded.ended_at
        assert list(row.factors) == list(FACTORS)
        assert row.factors == _cells(conn, seeded.set_id, aapl)
    assert [rows[0].factors[f].restated_possible for f in FACTORS] == [True, True, False]
    assert [rows[1].factors[f].restated_possible for f in FACTORS] == [False, False, False]
    assert rows[0].factors["value"].percentile == D("20.123456")
    assert rows[1].factors["growth"] == reader.FactorCell(
        "not_classified",
        None,
        None,
        "input_outdated",
        "eps_growth",
        "eps_growth is input_outdated",
        False,
    )

    # A newer complete set for another stock: the former current set becomes history, and every
    # row already returned is returned again unchanged (nothing recomputed, AC-19).
    newer = _set(conn, started_at=T0 + timedelta(days=3))
    seed_scored_stock(conn, newer.set_id, "MSFT")
    again, again_cursor = reader.stock_history(conn, "AAPL", limit=50, cursor=None)

    assert again_cursor is None
    assert _history_ids(again) == [current.set_id, middle.set_id, oldest.set_id]
    assert again[1:] == rows
    assert again[0].factors == _cells(conn, current.set_id, aapl)


# Implements TC-COMP-151
def test_never_classified_stock_has_an_empty_history_not_an_unknown_symbol(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S4-2: a known stock with no earlier result returns ``([], None)``; a symbol that is
    no instrument raises ``InstrumentNotFound``; the two outcomes are distinct."""
    conn = migrated_run_schema_connection
    earlier = _set(conn, started_at=T0)
    current = _set(conn, started_at=T0 + timedelta(days=1))
    seed_scored_stock(conn, earlier.set_id, "AAPL")
    insert_instrument(conn, "NEVR")  # no row in any set
    only_current = insert_instrument(conn, "CURR")  # rows in the current set only
    for factor in FACTORS:
        insert_classification(
            conn, current.set_id, only_current, factor, score=D(1), percentile=D(1)
        )

    assert reader.stock_history(conn, "NEVR", limit=50, cursor=None) == ([], None)
    assert reader.stock_history(conn, "CURR", limit=50, cursor=None) == ([], None)
    with pytest.raises(reader.InstrumentNotFound) as raised:
        reader.stock_history(conn, "NOPE", limit=50, cursor=None)
    assert raised.value.symbol == "NOPE"


# Implements TC-COMP-151
def test_unknown_symbol_raises_with_no_set_at_all(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S4-2: in a store with no set, an unknown symbol still raises and a known one is
    empty."""
    conn = migrated_run_schema_connection
    insert_instrument(conn, "AAPL")

    with pytest.raises(reader.InstrumentNotFound):
        reader.stock_history(conn, "NOPE", limit=50, cursor=None)
    assert reader.stock_history(conn, "AAPL", limit=50, cursor=None) == ([], None)


# Implements TC-COMP-152
def test_history_excludes_failed_and_building_sets_that_the_set_list_includes(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S4-3, DAC-E3-9: a failed and a building set holding the stock's rows are not
    history, and the set list carries them with their state, ``ended_at`` and
    ``failure_reason``; exclusion is by state, not by the absence of rows."""
    conn = migrated_run_schema_connection
    older = _set(conn, started_at=T0, factors={"value": (31, True)})
    current = _set(conn, started_at=T0 + timedelta(days=1), active_instruments=3)
    failed = _set(
        conn,
        "failed",
        started_at=T0 + timedelta(days=2),
        failure_reason="boom",
    )
    building = _set(conn, "building", started_at=T0 + timedelta(days=3), run_state="partial")
    aapl = seed_scored_stock(conn, older.set_id, "AAPL")
    for seeded in (current, failed, building):
        for factor in FACTORS:
            insert_classification(conn, seeded.set_id, aapl, factor, score=D(2), percentile=D(2))

    history, history_cursor = reader.stock_history(conn, "AAPL", limit=50, cursor=None)
    sets, sets_cursor = reader.list_sets(conn, limit=50, cursor=None)

    assert (_history_ids(history), history_cursor) == ([older.set_id], None)
    assert sets_cursor is None
    assert [row.set_id for row in sets] == [
        building.set_id,
        failed.set_id,
        current.set_id,
        older.set_id,
    ]
    by_id = {row.set_id: row for row in sets}
    assert by_id[failed.set_id].state == "failed"
    assert by_id[failed.set_id].failure_reason == "boom"
    assert by_id[failed.set_id].ended_at == failed.ended_at is not None
    assert by_id[building.set_id].state == "building"
    assert by_id[building.set_id].ended_at is None
    assert by_id[building.set_id].failure_reason is None
    assert by_id[current.set_id].state == "complete"
    expected = {
        older.set_id: (older, "succeeded", 1, {"value": (31, True)}),
        current.set_id: (current, "succeeded", 3, COUNTS),
        failed.set_id: (failed, "succeeded", None, COUNTS),
        building.set_id: (building, "partial", None, COUNTS),
    }
    for set_id, (seeded, outcome, active, counts) in expected.items():
        row = by_id[set_id]
        assert row.run_id == seeded.run_id
        assert row.run_started_at == seeded.run_started_at
        assert row.run_outcome == outcome
        assert row.started_at == seeded.started_at
        assert row.classification_date == seeded.classification_date
        assert row.latest_trading_day == (
            seeded.classification_date if row.state == "complete" else None
        )
        assert row.active_instruments == active
        assert list(row.factors) == list(FACTORS)
        assert row.factors == {
            f: reader.FactorSummary(*counts.get(f, (0, False)), 30) for f in FACTORS
        }


# --- History details (design section 7 "History is as recorded"; AC-18, AC-19, AC-23) ------


def test_history_shows_a_retired_stock_as_recorded(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    earlier = _set(conn, started_at=T0)
    _set(conn, started_at=T0 + timedelta(days=1))
    old = insert_instrument(conn, "OLDC", "retired")
    for factor in FACTORS:
        insert_classification(
            conn, earlier.set_id, old, factor, "not_classified", reason_code="retired"
        )

    rows, _ = reader.stock_history(conn, "OLDC", limit=50, cursor=None)

    assert _history_ids(rows) == [earlier.set_id]
    assert rows[0].factors == {
        f: reader.FactorCell("not_classified", None, None, "retired", None, None, False)
        for f in FACTORS
    }


def test_history_lists_only_sets_holding_the_stock_and_only_its_rows(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """A set built before the stock was added is not its history; other stocks' rows in the
    same sets change nothing."""
    conn = migrated_run_schema_connection
    before = _set(conn, started_at=T0)
    after = _set(conn, started_at=T0 + timedelta(days=1))
    _set(conn, started_at=T0 + timedelta(days=2))
    seed_scored_stock(conn, before.set_id, "MSFT", value=(D("7"), D("70")))
    aapl = insert_instrument(conn, "AAPL")
    for factor in FACTORS:
        insert_classification(conn, after.set_id, aapl, factor, score=D("0.4"), percentile=D("40"))
    msft = conn.execute("SELECT instrument_id FROM instrument WHERE symbol = 'MSFT'").fetchone()
    assert msft is not None
    for factor in FACTORS:
        insert_classification(conn, after.set_id, msft[0], factor, score=D("8"), percentile=D("80"))

    rows, _ = reader.stock_history(conn, "AAPL", limit=50, cursor=None)
    msft_rows, _ = reader.stock_history(conn, "MSFT", limit=50, cursor=None)

    assert _history_ids(rows) == [after.set_id]
    assert rows[0].factors == _cells(conn, after.set_id, aapl)
    assert _history_ids(msft_rows) == [after.set_id, before.set_id]


def test_history_breaks_an_ended_at_tie_by_set_id_descending(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Three earlier sets ending at the same instant: a total order, so a page of one at a time
    neither repeats nor skips a set."""
    conn = migrated_run_schema_connection
    tie = T0 + timedelta(hours=6)
    tied = [_set(conn, started_at=T0 + timedelta(hours=h), ended_at=tie) for h in range(3)]
    _set(conn, started_at=T0 + timedelta(days=1))
    aapl = insert_instrument(conn, "AAPL")
    for seeded in tied:
        for factor in FACTORS:
            insert_classification(conn, seeded.set_id, aapl, factor, score=D(1), percentile=D(1))
    expected = sorted((s.set_id for s in tied), reverse=True)

    assert _history_ids(reader.stock_history(conn, "AAPL", limit=50, cursor=None)[0]) == expected
    assert _all_history(conn, "AAPL", limit=1) == [[set_id] for set_id in expected]
    assert _all_history(conn, "AAPL", limit=2) == [expected[:2], expected[2:]]


def test_a_page_holding_the_last_set_carries_no_cursor(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """``limit`` equal to the number left: the page is full and there is no next one."""
    conn = migrated_run_schema_connection
    earlier = [_set(conn, started_at=T0 + timedelta(days=i)) for i in range(3)]
    _set(conn, started_at=T0 + timedelta(days=3))
    aapl = insert_instrument(conn, "AAPL")
    for seeded in earlier:
        for factor in FACTORS:
            insert_classification(conn, seeded.set_id, aapl, factor, score=D(1), percentile=D(1))

    history, history_cursor = reader.stock_history(conn, "AAPL", limit=3, cursor=None)
    sets, sets_cursor = reader.list_sets(conn, limit=4, cursor=None)

    assert (len(history), history_cursor) == (3, None)
    assert (len(sets), sets_cursor) == (4, None)


def test_history_and_set_rows_are_frozen(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    earlier = _set(conn, started_at=T0)
    _set(conn, started_at=T0 + timedelta(days=1))
    seed_scored_stock(conn, earlier.set_id, "AAPL")
    history_row = reader.stock_history(conn, "AAPL", limit=50, cursor=None)[0][0]
    set_row = reader.get_set(conn, earlier.set_id)

    with pytest.raises(dataclasses.FrozenInstanceError):
        history_row.run_outcome = "failed"  # type: ignore[misc]
    with pytest.raises(dataclasses.FrozenInstanceError):
        set_row.state = "failed"  # type: ignore[misc]


def test_history_pages_by_keyset_and_a_newer_set_shifts_no_page(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Five earlier sets at ``limit=2``: pages of 2, 2 and 1, the cursor only before the last,
    and a set completed between requests neither repeats nor skips one (keyset, DEC-0136)."""
    conn = migrated_run_schema_connection
    earlier = [_set(conn, started_at=T0 + timedelta(days=i)) for i in range(5)]
    current = _set(conn, started_at=T0 + timedelta(days=5))
    aapl = seed_scored_stock(conn, earlier[0].set_id, "AAPL")
    for seeded in [*earlier[1:], current]:
        for factor in FACTORS:
            insert_classification(conn, seeded.set_id, aapl, factor, score=D(1), percentile=D(1))
    newest_first = [s.set_id for s in reversed(earlier)]

    first, cursor = reader.stock_history(conn, "AAPL", limit=2, cursor=None)
    assert cursor is not None
    newer = _set(conn, started_at=T0 + timedelta(days=6))  # current becomes history
    seed_scored_stock(conn, newer.set_id, "MSFT")
    second, cursor = reader.stock_history(conn, "AAPL", limit=2, cursor=cursor)
    assert cursor is not None
    third, last_cursor = reader.stock_history(conn, "AAPL", limit=2, cursor=cursor)

    assert [len(first), len(second), len(third)] == [2, 2, 1]
    assert last_cursor is None
    assert _history_ids(first + second + third) == newest_first
    assert _all_history(conn, "AAPL", limit=2) == [
        [current.set_id, newest_first[0]],
        newest_first[1:3],
        newest_first[3:5],
    ]


def test_history_symbol_is_case_insensitive(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DEC-0132: the symbol is upper-cased and nothing else."""
    conn = migrated_run_schema_connection
    earlier = _set(conn, started_at=T0)
    _set(conn, started_at=T0 + timedelta(days=1))
    seed_scored_stock(conn, earlier.set_id, "AAPL")

    assert reader.stock_history(conn, "aapl", limit=50, cursor=None) == reader.stock_history(
        conn, "AAPL", limit=50, cursor=None
    )
    assert _history_ids(reader.stock_history(conn, "aApL", limit=50, cursor=None)[0]) == [
        earlier.set_id
    ]
    with pytest.raises(reader.InstrumentNotFound) as raised:
        reader.stock_history(conn, "aapl ", limit=50, cursor=None)
    assert raised.value.symbol == "AAPL "


def test_history_is_empty_while_no_set_is_complete(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """A failed first set and a building one hold the stock's rows; neither is history."""
    conn = migrated_run_schema_connection
    failed = _set(conn, "failed", started_at=T0, failure_reason="boom")
    building = _set(conn, "building", started_at=T0 + timedelta(days=1))
    aapl = seed_scored_stock(conn, failed.set_id, "AAPL")
    for factor in FACTORS:
        insert_classification(conn, building.set_id, aapl, factor, score=D(1), percentile=D(1))

    assert reader.stock_history(conn, "AAPL", limit=50, cursor=None) == ([], None)


def test_history_issues_one_statement_besides_the_set_block_read(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Never one statement per set or per factor."""
    conn = migrated_run_schema_connection
    sets = [_set(conn, started_at=T0 + timedelta(days=i)) for i in range(4)]
    aapl = seed_scored_stock(conn, sets[0].set_id, "AAPL")
    for seeded in sets[1:]:
        for factor in FACTORS:
            insert_classification(conn, seeded.set_id, aapl, factor, score=D(1), percentile=D(1))

    blocks = CountingConnection(conn)
    reader.read_set_blocks(blocks)  # type: ignore[arg-type]
    counting = CountingConnection(conn)
    rows, _ = reader.stock_history(counting, "AAPL", limit=50, cursor=None)  # type: ignore[arg-type]

    assert len(rows) == 3
    assert counting.statements == [*blocks.statements, reader.HISTORY_SQL]


def test_history_row_carries_exactly_the_designed_fields() -> None:
    """Design section 2.3: ``set_id``, ``classification_date``, ``run_id``, ``run_outcome``,
    ``ended_at`` and three cells."""
    assert [f.name for f in dataclasses.fields(reader.HistoryRow)] == [
        "set_id",
        "classification_date",
        "run_id",
        "run_outcome",
        "ended_at",
        "factors",
    ]


# --- Sets list and one set (design section 7 "Sets list"; AC-20, AC-21, DEC-0083) ----------


def test_sets_order_by_started_at_then_set_id_descending(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    tie = T0 + timedelta(days=1)
    first = _set(conn, started_at=T0)
    tied = [_set(conn, started_at=tie, ended_at=tie + timedelta(minutes=m)) for m in (5, 6)]
    last = _set(conn, started_at=T0 + timedelta(days=2))

    rows, _ = reader.list_sets(conn, limit=50, cursor=None)

    assert [r.set_id for r in rows] == [
        last.set_id,
        *sorted((s.set_id for s in tied), reverse=True),
        first.set_id,
    ]
    pages = []
    cursor = None
    while True:
        page, cursor = reader.list_sets(conn, limit=1, cursor=cursor)
        pages.extend(page)
        if cursor is None:
            break
    assert pages == rows


def test_sets_page_by_keyset_and_a_newer_set_shifts_no_page(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    seeded = [_set(conn, started_at=T0 + timedelta(days=i)) for i in range(5)]
    newest_first = [s.set_id for s in reversed(seeded)]

    first, cursor = reader.list_sets(conn, limit=2, cursor=None)
    assert cursor is not None
    _set(conn, "failed", started_at=T0 + timedelta(days=9), failure_reason="later")
    second, cursor = reader.list_sets(conn, limit=2, cursor=cursor)
    assert cursor is not None
    third, last_cursor = reader.list_sets(conn, limit=2, cursor=cursor)

    assert [len(first), len(second), len(third)] == [2, 2, 1]
    assert last_cursor is None
    assert [r.set_id for r in first + second + third] == newest_first


def test_no_set_lists_nothing(migrated_run_schema_connection: psycopg.Connection) -> None:
    assert reader.list_sets(migrated_run_schema_connection, limit=50, cursor=None) == ([], None)


@pytest.mark.parametrize("state", ["building", "failed"])
def test_a_first_set_not_complete_is_listed(
    migrated_run_schema_connection: psycopg.Connection, state: str
) -> None:
    """DEC-0082 on the sets side: before any set completes, the attempt is still listed."""
    conn = migrated_run_schema_connection
    seeded = _set(
        conn,
        state,
        started_at=T0,
        run_state="partial" if state == "building" else "succeeded",
        failure_reason="boom" if state == "failed" else None,
    )

    rows, cursor = reader.list_sets(conn, limit=50, cursor=None)

    assert cursor is None
    assert [(r.set_id, r.state) for r in rows] == [(seeded.set_id, state)]


@pytest.mark.parametrize("state", ["building", "failed"])
def test_a_set_with_no_factor_rows_carries_empty_factors(
    migrated_run_schema_connection: psycopg.Connection, state: str
) -> None:
    """DEC-0265 (PROVISIONAL): the engine writes ``classification_set_factor`` in the build
    transaction, so a building or failed set has none; nothing is invented for it."""
    conn = migrated_run_schema_connection
    complete = _set(conn, started_at=T0)
    seeded = _set(
        conn,
        state,
        started_at=T0 + timedelta(days=1),
        run_state="partial" if state == "building" else "succeeded",
        failure_reason="boom" if state == "failed" else None,
    )
    _drop_factor_rows(conn, seeded.set_id)

    rows, _ = reader.list_sets(conn, limit=50, cursor=None)

    assert [r.set_id for r in rows] == [seeded.set_id, complete.set_id]
    assert rows[0].factors == {}
    assert reader.get_set(conn, seeded.set_id).factors == {}
    assert rows[1].factors == {f: reader.FactorSummary(*COUNTS[f], 30) for f in FACTORS}


def test_get_set_returns_the_set_list_row_for_every_state(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    complete = _set(conn, started_at=T0, run_state="partial")
    failed = _set(conn, "failed", started_at=T0 + timedelta(days=1), failure_reason="boom")
    building = _set(conn, "building", started_at=T0 + timedelta(days=2))
    listed = {row.set_id: row for row in reader.list_sets(conn, limit=50, cursor=None)[0]}

    for seeded in (complete, failed, building):
        assert reader.get_set(conn, seeded.set_id) == listed[seeded.set_id]
    assert listed[complete.set_id].run_outcome == "partial"


def test_get_set_of_an_unknown_id_raises(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    _set(conn, started_at=T0)
    unknown = uuid4()

    with pytest.raises(reader.SetNotFound):
        reader.get_set(conn, unknown)


def test_set_row_values_are_the_stored_columns(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Nothing recomputed: ``active_instruments`` is the stored column even when it differs from
    the set's row count, and ``ended_at`` is the set's own."""
    conn = migrated_run_schema_connection
    ended = T0 + timedelta(hours=3, microseconds=123456)
    seeded = _set(conn, started_at=T0, ended_at=ended, active_instruments=1234)
    seed_scored_stock(conn, seeded.set_id, "AAPL")

    row = reader.get_set(conn, seeded.set_id)

    assert row.active_instruments == 1234
    assert row.ended_at == ended
    assert row.factors == {f: reader.FactorSummary(*COUNTS[f], 30) for f in FACTORS}
    assert all(summary.min_peer_set_size == 30 for summary in row.factors.values())


def test_set_row_carries_exactly_the_designed_fields() -> None:
    """Design section 2.3 and the API design's ``SetResponse`` (DEC-0083)."""
    assert [f.name for f in dataclasses.fields(reader.SetRow)] == [
        "set_id",
        "state",
        "classification_date",
        "run_id",
        "run_started_at",
        "run_outcome",
        "started_at",
        "ended_at",
        "failure_reason",
        "latest_trading_day",
        "active_instruments",
        "factors",
    ]
