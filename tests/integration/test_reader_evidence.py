"""Stock evidence and memberships against a real store (CAP-002-E3-S3).

Proves ``component-design-classification-reader.md`` sections 2.6 and 7 for evidence:
DAC-E3-S3-3, DAC-E3-S3-4 (evidence half) and DAC-E3-S3-5 (TC-COMP-146, 113, 147), and, through
them, DAC-E3-8 and DAC-E3-12 (AC-12, AC-15, AC-17, AC-23). Sets and rows are seeded directly, so
the reader is tested independently of the engine.
"""

import dataclasses
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID
from zoneinfo import ZoneInfo

import psycopg
import pytest

from factorflow.classification import reader
from factorflow.classification.constants import FACTORS, INPUT_NAMES
from factorflow.universes.replay import MEMBERSHIP_AS_OF_SQL
from tests.integration.reader_seed import (
    add_member,
    insert_classification,
    insert_input,
    insert_instrument,
    insert_reference,
    insert_run,
    insert_set,
    insert_universe,
    remove_member,
    rename_universe,
    retire_universe,
    seed_inputs,
    seed_scored_stock,
)

pytestmark = pytest.mark.postgres

T0 = datetime(2026, 10, 14, 22, 30, tzinfo=UTC)
D = Decimal
RETIRED = ("retired", None)
DEFINITION_ORDER = [(f, n) for f in FACTORS for n in INPUT_NAMES[f]]


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


def _building_set(conn: psycopg.Connection, *, started_at: datetime) -> UUID:
    run_id = insert_run(conn, "succeeded", started_at=started_at - timedelta(hours=1))
    return insert_set(conn, run_id, "building", started_at=started_at)


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


# Implements TC-COMP-146
def test_evidence_returns_every_input_with_dates_and_universes_in_name_order(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S3-3: eight input rows in definition order, memberships in name order."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    # Other stocks' rows sit in the same current set, inserted after AAPL's, with
    # different cells and values: the read must carry only AAPL's, in definition order, though
    # AAPL's own rows are stored against that order.
    other_cell = (D("0.9"), D("90"))
    own_cell = (D("0.3"), D("30"))
    aapl = seed_scored_stock(
        conn,
        set_id,
        "AAPL",
        value=own_cell,
        growth=own_cell,
        momentum=own_cell,
        name="Apple Inc.",
        restated=("value",),
        reverse=True,
    )
    seed_inputs(
        conn,
        set_id,
        aapl,
        statuses={"return_12m": "missing"},
        values={"book_to_price": D("0.1234567890"), "return_3m": D("-0.25")},
        restated={"fcf_yield", "eps_growth"},
        reverse=True,
    )
    other_first = seed_scored_stock(
        conn, set_id, "AAAA", value=other_cell, growth=other_cell, momentum=other_cell
    )
    seed_inputs(conn, set_id, other_first, values={"book_to_price": D("9.9")})
    other_last = seed_scored_stock(
        conn, set_id, "ZZZZ", value=other_cell, growth=other_cell, momentum=other_cell
    )
    seed_inputs(conn, set_id, other_last, values={"return_3m": D("7.7")})
    zeta = insert_universe(conn, "Zeta", [aapl])
    alpha = insert_universe(conn, "Alpha", [aapl])

    evidence = reader.stock_evidence(conn, "AAPL")

    assert [(r.factor, r.input_name) for r in evidence.inputs] == DEFINITION_ORDER
    by_name = {r.input_name: r for r in evidence.inputs}
    assert [r.status for r in evidence.inputs].count("present") == 7
    book = by_name["book_to_price"]
    assert (book.status, book.value, book.label) == ("present", D("0.1234567890"), "book-to-price")
    assert (book.as_of, book.known_on) == (date(2026, 9, 30), date(2026, 10, 1))
    assert by_name["return_3m"].value == D("-0.25")
    missing = by_name["return_12m"]
    assert (missing.status, missing.value, missing.as_of, missing.known_on) == (
        "missing",
        None,
        None,
        None,
    )
    assert {n for n, r in by_name.items() if r.restated_possible} == {"fcf_yield", "eps_growth"}
    assert all(r.detail == {} for r in evidence.inputs)

    assert evidence.memberships == [
        reader.Membership(alpha, "Alpha"),
        reader.Membership(zeta, "Zeta"),
    ]
    assert evidence.set == reader.read_set_blocks(conn)[0]
    assert (evidence.symbol, evidence.name, evidence.lifecycle) == (
        "AAPL",
        "Apple Inc.",
        "active",
    )
    stored = conn.execute(
        "SELECT factor, status, score, percentile, reason_code, reason_input, reason_detail, "
        "restated_possible FROM factor_classification WHERE set_id = %s AND instrument_id = %s",
        (set_id, aapl),
    ).fetchall()
    assert len(stored) == len(FACTORS)
    assert list(evidence.factors) == list(FACTORS)
    for factor, status, score, percentile, code, rinput, detail, restated in stored:
        assert evidence.factors[factor] == reader.FactorCell(
            status, score, percentile, code, rinput, detail, restated
        )


def test_evidence_input_row_carries_the_dates_the_statement_stored(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """AC-17: each input row's value, ``as_of`` and ``known_on`` are the stored ones."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAPL")
    insert_input(
        conn,
        set_id,
        stock,
        "value",
        "book_to_price",
        "outdated",
        value=D("0.5"),
        as_of=date(2025, 12, 31),
        known_on=date(2026, 2, 3),
        detail={"statement": "10-K"},
    )

    row = reader.stock_evidence(conn, "AAPL").inputs[0]
    assert (row.status, row.value, row.as_of, row.known_on) == (
        "outdated",
        D("0.5"),
        date(2025, 12, 31),
        date(2026, 2, 3),
    )
    assert row.detail == {"statement": "10-K"}


# Implements TC-COMP-113
def test_evidence_keeps_a_retired_stock_with_the_retired_reason(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S3-4 (evidence half): three ``retired`` cells, no inputs, memberships kept."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    retired = seed_scored_stock(
        conn, set_id, "R", value=RETIRED, growth=RETIRED, momentum=RETIRED, lifecycle="retired"
    )
    universe = insert_universe(conn, "Held", [retired])

    evidence = reader.stock_evidence(conn, "R")

    assert evidence.lifecycle == "retired"
    assert [evidence.factors[f].reason_code for f in FACTORS] == ["retired"] * 3
    assert [evidence.factors[f].status for f in FACTORS] == ["not_classified"] * 3
    assert evidence.inputs == []
    assert evidence.memberships == [reader.Membership(universe, "Held")]


# Implements TC-COMP-147
@pytest.mark.parametrize("case", ["no_set", "building_only"])
def test_evidence_with_no_current_set_has_a_null_set_and_the_same_shape(
    migrated_run_schema_connection: psycopg.Connection, case: str
) -> None:
    """DAC-E3-S3-5: ``set`` None, ``factors`` and ``inputs`` empty, memberships populated.

    PROVISIONAL (DEC-0131): awaiting owner confirmation (2026-10-17), Open Gap 2 of
    CAP-002-E3-S3-tasks; memberships do not depend on a set.
    """
    conn = migrated_run_schema_connection
    stock = insert_instrument(conn, "AAPL")
    universe = insert_universe(conn, "Held", [stock])
    if case == "building_only":
        building = _building_set(conn, started_at=T0)
        seed_inputs(conn, building, stock)

    evidence = reader.stock_evidence(conn, "AAPL")

    assert isinstance(evidence, reader.StockEvidence)
    assert evidence.set is None
    assert evidence.factors == {}
    assert evidence.inputs == []
    assert (evidence.symbol, evidence.name, evidence.lifecycle) == ("AAPL", None, "active")
    assert evidence.memberships == [reader.Membership(universe, "Held")]
    populated = [f.name for f in dataclasses.fields(reader.StockEvidence)]
    assert [f.name for f in dataclasses.fields(evidence)] == populated
    assert populated == [
        "set",
        "symbol",
        "name",
        "lifecycle",
        "factors",
        "inputs",
        "memberships",
    ]
    with pytest.raises(reader.InstrumentNotFound):
        reader.stock_evidence(conn, "NOPE")


def test_evidence_reads_only_the_current_set(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """AC-12: an older complete set and a newer building one never replace the current set."""
    conn = migrated_run_schema_connection
    older = _complete_set(conn, started_at=T0 - timedelta(days=2))
    current = _complete_set(conn)
    building = _building_set(conn, started_at=T0 + timedelta(days=1))
    stock = insert_instrument(conn, "AAPL")
    for set_id, value, score in ((older, D("1"), D("0.1")), (current, D("2"), D("0.2"))):
        seed_inputs(conn, set_id, stock, values={"book_to_price": value})
        for factor in FACTORS:
            insert_classification(conn, set_id, stock, factor, score=score, percentile=D("50"))
    seed_inputs(conn, building, stock, values={"book_to_price": D("3")})

    evidence = reader.stock_evidence(conn, "AAPL")

    assert evidence.set is not None
    assert evidence.set.set_id == current
    assert evidence.set.not_current is True
    assert {r.value for r in evidence.inputs if r.input_name == "book_to_price"} == {D("2")}
    assert evidence.factors["value"].score == D("0.2")
    assert len(evidence.inputs) == 8


def test_evidence_cell_and_input_restatement_flags_are_independent(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-12, AC-23: each is the stored column; nothing is derived from the other."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAPL", restated=("growth",))
    seed_inputs(conn, set_id, stock, restated={"book_to_price"})

    evidence = reader.stock_evidence(conn, "AAPL")

    assert [evidence.factors[f].restated_possible for f in FACTORS] == [False, True, False]
    assert {r.input_name for r in evidence.inputs if r.restated_possible} == {"book_to_price"}


def test_evidence_shows_an_outdated_input_and_its_cell_reason_consistently(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAPL", growth=("input_outdated", "revenue_growth"))
    seed_inputs(conn, set_id, stock, statuses={"revenue_growth": "outdated"})

    evidence = reader.stock_evidence(conn, "AAPL")

    growth = evidence.factors["growth"]
    assert (growth.reason_code, growth.reason_input) == ("input_outdated", "revenue_growth")
    revenue = next(r for r in evidence.inputs if r.input_name == "revenue_growth")
    assert revenue.status == "outdated"
    assert revenue.label == reader.INPUT_LABELS["revenue_growth"] == "revenue growth"


def test_evidence_symbol_is_case_insensitive_and_unknown_symbol_is_refused(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DEC-0132."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "AAPL")

    assert reader.stock_evidence(conn, "aapl").symbol == "AAPL"
    with pytest.raises(reader.InstrumentNotFound):
        reader.stock_evidence(conn, "NOPE")


def test_evidence_of_a_stock_in_no_universe_has_no_memberships(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "AAPL")

    assert reader.stock_evidence(conn, "AAPL").memberships == []


def test_evidence_issues_two_statements_besides_the_set_block_read(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Never one statement per input or per universe."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAPL")
    seed_inputs(conn, set_id, stock)
    for name in ("One", "Two", "Three"):
        insert_universe(conn, name, [stock])

    blocks = CountingConnection(conn)
    reader.read_set_blocks(blocks)  # type: ignore[arg-type]
    counting = CountingConnection(conn)
    reader.stock_evidence(counting, "AAPL")  # type: ignore[arg-type]

    assert len(counting.statements) == len(blocks.statements) + 2
    assert counting.statements[-2:] == [reader.EVIDENCE_SQL, reader.MEMBERSHIPS_SQL]


# --- Memberships (DEC-0057, DEC-0134; AC-17) ---------------------------------------------


def _memberships(conn: psycopg.Connection, symbol: str = "AAPL") -> list[tuple[UUID, str]]:
    return [(m.universe_id, m.name) for m in reader.stock_evidence(conn, symbol).memberships]


def test_memberships_list_both_universes_in_name_order(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAPL")
    second = insert_universe(conn, "Bravo", [stock])
    first = insert_universe(conn, "Alpha", [stock])

    assert _memberships(conn) == [(first, "Alpha"), (second, "Bravo")]


def test_memberships_follow_a_rename_a_removal_and_a_readd(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAPL")
    renamed = insert_universe(conn, "Old name", [stock])
    removed = insert_universe(conn, "Removed", [stock])
    readded = insert_universe(conn, "Readded", [stock])
    rename_universe(conn, renamed, "New name")
    remove_member(conn, removed, stock)
    remove_member(conn, readded, stock)
    add_member(conn, readded, stock)

    assert _memberships(conn) == [(renamed, "New name"), (readded, "Readded")]


def test_memberships_omit_a_retired_universe_and_keep_a_late_addition(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """A membership is not a set property: a stock added after the set was built appears."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAPL")
    gone = insert_universe(conn, "Gone", [stock])
    retire_universe(conn, gone)
    late = insert_universe(conn, "Late", [])
    add_member(conn, late, stock)

    assert _memberships(conn) == [(late, "Late")]


def test_memberships_with_equal_names_order_by_universe_id(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Documents unreachable data: active universes have unique names (DEC-0057), so this holds
    but cannot fail without the tiebreaker; the statement's total order is its guarantee."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAPL")
    ids = [insert_universe(conn, "Same", [stock]) for _ in range(3)]

    assert [uid for uid, _ in _memberships(conn)] == sorted(ids)


def test_memberships_agree_with_the_membership_replay(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """SA-DUP-001: the reverse-direction statement cannot drift from E1-S2's replay."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    stocks = {s: seed_scored_stock(conn, set_id, s) for s in ("AAA", "BBB", "CCC")}
    one = insert_universe(conn, "One", [stocks["AAA"], stocks["BBB"]])
    two = insert_universe(conn, "Two", [stocks["BBB"]])
    three = insert_universe(conn, "Three", [stocks["CCC"]])
    remove_member(conn, one, stocks["AAA"])
    add_member(conn, two, stocks["AAA"])
    retire_universe(conn, three)
    today = datetime.now(ZoneInfo("America/Chicago")).date()

    for universe in (one, two):
        replay = {
            row[0]
            for row in conn.execute(
                MEMBERSHIP_AS_OF_SQL, {"universe_id": universe, "as_of": today}
            ).fetchall()
        }
        for symbol, instrument_id in stocks.items():
            held = universe in {uid for uid, _ in _memberships(conn, symbol)}
            assert held == (instrument_id in replay), (symbol, universe)


def test_evidence_name_is_the_latest_stored_reference_name(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DEC-0245: with two stored names the later one is the stock's name."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    stock = seed_scored_stock(conn, set_id, "AAPL")
    insert_reference(conn, stock, "Old Name", recorded_at=T0 - timedelta(days=2))
    insert_reference(conn, stock, "New Name", recorded_at=T0 - timedelta(days=1))

    assert reader.stock_evidence(conn, "AAPL").name == "New Name"


def test_evidence_never_reads_rows_of_another_set(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """A stock with rows only in an older set has empty factors and inputs in the current one."""
    conn = migrated_run_schema_connection
    older = _complete_set(conn, started_at=T0 - timedelta(days=2))
    _complete_set(conn)
    stock = insert_instrument(conn, "AAPL")
    seed_inputs(conn, older, stock)
    for factor in FACTORS:
        insert_classification(conn, older, stock, factor, score=D("0.2"), percentile=D("50"))

    evidence = reader.stock_evidence(conn, "AAPL")

    assert evidence.factors == {}
    assert evidence.inputs == []


def test_evidence_models_are_frozen_and_the_error_names_its_symbol() -> None:
    membership = reader.Membership(UUID(int=1), "Name")
    with pytest.raises(dataclasses.FrozenInstanceError):
        membership.name = "Other"  # type: ignore[misc]
    row = reader.InputRow(
        "value", "book_to_price", "book-to-price", "missing", None, None, None, False, {}
    )
    with pytest.raises(dataclasses.FrozenInstanceError):
        row.status = "present"  # type: ignore[misc]
    evidence = reader.StockEvidence(None, "AAPL", None, "active", {}, [], [])
    with pytest.raises(dataclasses.FrozenInstanceError):
        evidence.symbol = "MSFT"  # type: ignore[misc]
    assert reader.InstrumentNotFound("NOPE").symbol == "NOPE"
