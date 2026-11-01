"""Compare against a real store (CAP-002-E3-S3).

Proves ``component-design-classification-reader.md`` sections 2.5 and 7 for compare:
DAC-E3-S3-1, DAC-E3-S3-2 and the compare half of DAC-E3-S3-4 (TC-COMP-123, 124, 113), and,
through them, DAC-E3-7 and DAC-E3-12 (AC-15, AC-16, AC-23). Sets and rows are seeded directly,
so the reader is tested independently of the engine. Compare is ``list_classifications`` with
``symbols`` set: one statement, one cell model, one ``restated_possible`` rule (DAC-E3-2).
"""

from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import reader
from tests.integration.reader_seed import (
    insert_instrument,
    insert_run,
    insert_set,
    insert_universe,
    seed_scored_stock,
)

pytestmark = pytest.mark.postgres

T0 = datetime(2026, 10, 14, 22, 30, tzinfo=UTC)
D = Decimal
RETIRED = ("retired", None)
MISSING_VALUE = ("input_missing", "book_to_price")
UNRANKED = ("not_enough_stocks", None)


def _complete_set(conn: psycopg.Connection, *, started_at: datetime = T0) -> UUID:
    run_id = insert_run(conn, "succeeded", started_at=started_at - timedelta(hours=1))
    return insert_set(
        conn,
        run_id,
        "complete",
        started_at=started_at,
        ended_at=started_at + timedelta(minutes=5),
        latest_trading_day=date(2026, 10, 14),
        active_instruments=1,
        factors={"value": (35, True), "growth": (35, True), "momentum": (35, True)},
    )


def _symbols(page: reader.ClassificationPage) -> list[str]:
    return [row.symbol for row in page.stocks]


def _row(page: reader.ClassificationPage, symbol: str) -> reader.StockRow:
    return next(row for row in page.stocks if row.symbol == symbol)


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


def _seed_roster(conn: psycopg.Connection, set_id: UUID) -> None:
    seed_scored_stock(conn, set_id, "A")
    seed_scored_stock(conn, set_id, "B", value=MISSING_VALUE)
    seed_scored_stock(conn, set_id, "C", growth=UNRANKED)
    seed_scored_stock(
        conn, set_id, "R", value=RETIRED, growth=RETIRED, momentum=RETIRED, lifecycle="retired"
    )
    seed_scored_stock(conn, set_id, "D")
    seed_scored_stock(conn, set_id, "E")


# Implements TC-COMP-123
def test_compare_returns_every_known_symbol_two_to_six_only(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S3-1: an incomplete, unranked or retired stock is returned; 1 and 7 are refused."""
    conn = migrated_run_schema_connection
    _seed_roster(conn, _complete_set(conn))

    two = reader.compare(conn, ["A", "B"])
    assert _symbols(two) == ["A", "B"]
    assert two.match_count == 2

    six = reader.compare(conn, ["A", "B", "C", "R", "D", "E"])
    assert _symbols(six) == ["A", "B", "C", "D", "E", "R"]
    assert six.match_count == len(six.stocks) == 6
    for row in six.stocks:
        assert set(row.factors) == set(reader.FACTORS)
    assert (
        _row(six, "B").factors["value"].status,
        _row(six, "B").factors["value"].reason_code,
    ) == (
        "not_classified",
        "input_missing",
    )
    assert _row(six, "B").factors["growth"].status == "classified"
    assert _row(six, "C").factors["growth"].reason_code == "not_enough_stocks"
    assert _row(six, "R").lifecycle == "retired"
    assert _row(six, "A").factors["value"].status == "classified"
    assert six.next_cursor is None

    counting = CountingConnection(conn)
    with pytest.raises(ValueError):
        reader.compare(counting, ["A"])  # type: ignore[arg-type]
    with pytest.raises(ValueError):
        reader.compare(counting, ["A", "B", "C", "D", "E", "R", "F"])  # type: ignore[arg-type]
    assert counting.statements == []


def test_compare_orders_by_symbol_whatever_the_request_order(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    _seed_roster(conn, _complete_set(conn))

    assert _symbols(reader.compare(conn, ["E", "A", "D"])) == ["A", "D", "E"]


# Implements TC-COMP-124
def test_compare_reports_an_unrecognised_symbol(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S3-2: reported in ``unknown_symbols`` in request order, never dropped."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA")
    seed_scored_stock(conn, set_id, "BBB")

    one = reader.compare(conn, ["AAA", "BBB", "NOPE"])
    assert _symbols(one) == ["AAA", "BBB"]
    assert one.unknown_symbols == ["NOPE"]

    two = reader.compare(conn, ["ZZZ", "AAA", "NOPE"])
    assert _symbols(two) == ["AAA"]
    assert two.unknown_symbols == ["ZZZ", "NOPE"]

    none = reader.compare(conn, ["NOPE", "NADA"])
    assert none.stocks == []
    assert none.unknown_symbols == ["NOPE", "NADA"]
    assert none.match_count == 0

    assert reader.compare(conn, ["AAA", "BBB"]).unknown_symbols == []


# Implements TC-COMP-113
def test_compare_keeps_a_retired_stock_while_the_list_still_omits_it(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S3-4, DAC-E3-S3-1 (compare half): the retired reason is kept (DEC-0133)."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "A")
    seed_scored_stock(
        conn, set_id, "R", value=RETIRED, growth=RETIRED, momentum=RETIRED, lifecycle="retired"
    )

    page = reader.compare(conn, ["R", "A"])
    retired = _row(page, "R")
    assert retired.lifecycle == "retired"
    assert [retired.factors[f].reason_code for f in reader.FACTORS] == ["retired"] * 3
    assert [retired.factors[f].status for f in reader.FACTORS] == ["not_classified"] * 3

    listed = reader.list_classifications(conn, reader.ListFilters())
    assert _symbols(listed) == ["A"]


def test_compare_shares_the_list_statement_and_cell_model(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-12, AC-23: compare returns the list's cells, ``restated_possible`` as stored."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "A", restated=("value", "growth"))
    seed_scored_stock(conn, set_id, "B", value=MISSING_VALUE, restated=("momentum",))
    seed_scored_stock(conn, set_id, "C")

    page = reader.compare(conn, ["A", "B", "C"])
    listed = reader.list_classifications(conn, reader.ListFilters())
    assert page.stocks == listed.stocks
    assert [page.stocks[0].factors[f].restated_possible for f in reader.FACTORS] == [
        True,
        True,
        False,
    ]
    assert [page.stocks[1].factors[f].restated_possible for f in reader.FACTORS] == [
        False,
        False,
        True,
    ]
    assert not any(page.stocks[2].factors[f].restated_possible for f in reader.FACTORS)

    counting = CountingConnection(conn)
    reader.compare(counting, ["A", "B"])  # type: ignore[arg-type]
    assert sum("WITH scope AS" in s for s in counting.statements) == 1


def test_compare_ignores_thresholds_and_hides_nothing(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """An input-incomplete stock is returned: compare uses a default ``Thresholds``."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA", value=MISSING_VALUE)
    seed_scored_stock(conn, set_id, "BBB")

    page = reader.compare(conn, ["AAA", "BBB"])
    assert _symbols(page) == ["AAA", "BBB"]
    assert page.unknown_symbols == []


def test_compare_carries_the_set_and_later_blocks(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA")
    seed_scored_stock(conn, set_id, "BBB")
    run_id = insert_run(conn, "succeeded", started_at=T0 + timedelta(hours=2))
    insert_set(conn, run_id, "building", started_at=T0 + timedelta(hours=3))

    page = reader.compare(conn, ["AAA", "BBB"])
    assert (page.set, page.later) == reader.read_set_blocks(conn)
    assert page.set is not None and page.set.not_current is True
    assert page.never_classified is False


def test_compare_with_no_complete_set_is_the_never_classified_page(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    insert_instrument(conn, "AAA")
    insert_instrument(conn, "BBB")

    counting = CountingConnection(conn)
    page = reader.compare(counting, ["AAA", "BBB"])  # type: ignore[arg-type]

    assert page.set is None
    assert page.never_classified is True
    assert page.stocks == []
    assert page.unknown_symbols == []
    assert page.match_count == 0
    assert page.later == reader.read_set_blocks(conn)[1]
    assert not any("WITH scope AS" in s for s in counting.statements)


def test_compare_normalises_case_and_deduplicates(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DEC-0132: symbols are upper-cased and a duplicate appears once."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "AAPL")
    seed_scored_stock(conn, set_id, "MSFT")

    assert _symbols(reader.compare(conn, ["aapl", "msft"])) == ["AAPL", "MSFT"]
    page = reader.compare(conn, ["AAPL", "aapl", "MSFT"])
    assert _symbols(page) == ["AAPL", "MSFT"]
    assert page.unknown_symbols == []


def test_compare_reports_a_known_instrument_with_no_row_in_the_set(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """PROVISIONAL (DEC-0131): awaiting owner confirmation (2026-10-17), Open Gap 2 of
    CAP-002-E3-S3-tasks. A stock added after the set was built is reported, not dropped."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA")
    insert_instrument(conn, "LATE")

    page = reader.compare(conn, ["AAA", "LATE"])
    assert _symbols(page) == ["AAA"]
    assert page.unknown_symbols == ["LATE"]


def test_compare_is_independent_of_universes(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    a = seed_scored_stock(conn, set_id, "AAA")
    seed_scored_stock(conn, set_id, "BBB")
    insert_universe(conn, "Only A", [a])

    assert _symbols(reader.compare(conn, ["AAA", "BBB"])) == ["AAA", "BBB"]
