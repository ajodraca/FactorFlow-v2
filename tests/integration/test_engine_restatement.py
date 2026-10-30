"""The possibly-restated mark on value and growth (CAP-002-E2-S6).

A statement filed before the instrument's first fundamentals ``observed_on`` is backfilled
(DEC-0056); the inputs that read it and the stock's value and growth classifications carry
``restated_possible``, appended with the row, and momentum never does (DEC-0122). Satisfies
AC-23, DAC-E2-11 and DAC-E2-S6-1 to DAC-E2-S6-3. The standard population is four active
stocks A to D: every one of A's statements is backfilled, and B, C and D were observed as
filed. Payload keys are the test keys of ``engine_inputs_support``.
"""

from collections.abc import Collection, Iterator, Mapping
from datetime import date, timedelta
from decimal import Decimal
from typing import NamedTuple
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import constants
from tests.integration.engine_classify_support import (
    classifications_for,
    run_classification_build,
)
from tests.integration.engine_inputs_support import (
    TEST_KEYS,
    add_statement,
    inputs_for,
    months_before,
)
from tests.integration.engine_restatement_support import (
    BACKFILL_LEAD,
    MIN_FLOOR,
    STATEMENT_TYPES,
    add_bar_for,
    add_fundamentals,
    add_marked_inputs,
    add_momentum_inputs,
    all_rows,
    classification_flags,
    input_flags,
    input_snapshot,
    run_two_stage_build,
    snapshot,
    statement_payload,
)
from tests.integration.engine_support import (
    add_building_set,
    add_instrument,
    add_run,
    migrate_through_classification,
)

pytestmark = pytest.mark.postgres

D = date(2026, 10, 17)  # classification date
L = date(2026, 10, 16)  # latest trading day held
P1 = date(2026, 9, 30)  # newest quarter, current against D
FIRST = date(2026, 10, 1)  # every stock's first fundamentals observed_on
PERIOD_ENDS = [months_before(P1, 3 * k) for k in range(8)]  # add_fundamentals' quarters

FACTORS = constants.FACTORS
VALUE = constants.INPUT_NAMES["value"]
GROWTH = constants.INPUT_NAMES["growth"]
FUNDAMENTAL_INPUTS = (*VALUE, *GROWTH)
SYMBOLS = "ABCD"
STANDARD = {"A": all_rows()}


class Store(NamedTuple):
    conn: psycopg.Connection
    set_id: UUID


@pytest.fixture
def store(postgres_connection_string: str) -> Iterator[Store]:
    """A store migrated through 0006 with a succeeded run and its ``building`` set."""
    conn = migrate_through_classification(postgres_connection_string)
    try:
        yield Store(conn, add_building_set(conn, add_run(conn), D))
    finally:
        conn.close()


def build_fixture(
    conn: psycopg.Connection,
    filed: Mapping[str, Collection[tuple[str, int]]] = STANDARD,
    *,
    extra_old: Collection[str] = (),
    statement_types: Mapping[str, tuple[str, ...]] | None = None,
) -> dict[str, int]:
    """Active stocks A to D, each with a bar on ``L`` and eight quarters ending ``P1``
    first observed on ``FIRST``; ``filed`` names each stock's backfilled rows."""
    stocks: dict[str, int] = {}
    for symbol in SYMBOLS:
        stock = add_instrument(conn, symbol)
        add_bar_for(conn, stock, L)
        add_fundamentals(
            conn,
            stock,
            latest_period_end=P1,
            first_observed_on=FIRST,
            filed_before_first=filed.get(symbol, frozenset()),
            extra_old_quarter_backfilled=symbol in extra_old,
            statement_types=(statement_types or {}).get(symbol, STATEMENT_TYPES),
        )
        stocks[symbol] = stock
    return stocks


def reobserve(
    conn: psycopg.Connection,
    stock: int,
    statement_type: str,
    quarter_index: int,
    provider_filing_date: date | None,
) -> None:
    """A later observation of one of ``add_fundamentals``' rows, same payload, observed the
    day after ``FIRST`` so the stock's first ``observed_on`` stays ``FIRST``."""
    add_statement(
        conn,
        stock,
        PERIOD_ENDS[quarter_index],
        statement_type,
        statement_payload(stock, statement_type, quarter_index),
        observed_on=FIRST + timedelta(days=1),
        provider_filing_date=provider_filing_date,
    )


def expect(*marked: str) -> dict[str, bool]:
    """The five fundamentals inputs' flags with exactly ``marked`` true."""
    return {name: name in marked for name in FUNDAMENTAL_INPUTS}


def assert_column_agrees_with_detail(conn: psycopg.Connection, set_id: UUID, stock: int) -> None:
    """DEC-0122: each input's mark is the ``or`` of the ``backfilled`` flags of the periods
    its ``detail`` lists, and false when it lists none."""
    for name, row in inputs_for(conn, set_id, stock).items():
        periods = row["detail"].get("periods", [])
        assert row["restated_possible"] is any(p["backfilled"] for p in periods), name


# --- T004 ---------------------------------------------------------------------------------


# Implements TC-COMP-186
def test_statement_filed_before_first_observation_marks_its_inputs_and_classifications(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn, set_id = store
    stocks = build_fixture(conn)

    result = run_two_stage_build(conn, set_id, monkeypatch)

    assert result.state == "complete", result.failure_reason
    rows = classifications_for(conn, set_id)
    a = stocks["A"]
    assert input_flags(conn, set_id, a) == expect(*FUNDAMENTAL_INPUTS)
    for factor in ("value", "growth"):
        assert rows[(a, factor)]["status"] == "classified"
        assert rows[(a, factor)]["restated_possible"] is True
    # No momentum input exists in this build, so momentum is not ranked.
    assert rows[(a, "momentum")]["status"] == "not_classified"
    assert rows[(a, "momentum")]["restated_possible"] is False
    for symbol in "BCD":
        stock = stocks[symbol]
        assert input_flags(conn, set_id, stock) == expect()
        for factor in ("value", "growth"):
            assert rows[(stock, factor)]["status"] == "classified"
        assert {rows[(stock, f)]["restated_possible"] for f in FACTORS} == {False}
    for stock in stocks.values():
        assert_column_agrees_with_detail(conn, set_id, stock)


# --- T005 ---------------------------------------------------------------------------------


# Implements TC-COMP-187
def test_momentum_classification_is_never_marked(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn, set_id = store
    stocks = {symbol: add_instrument(conn, symbol) for symbol in SYMBOLS}
    for symbol, stock in stocks.items():
        add_bar_for(conn, stock, L)
        marked = symbol == "A"
        add_marked_inputs(conn, set_id, stock, "value", restated=marked)
        add_marked_inputs(conn, set_id, stock, "growth", restated=marked)
        # A's momentum rows say true too, a state no momentum stage writes, so only the
        # factor guard in classify.sql can keep its classification unmarked.
        add_momentum_inputs(conn, set_id, stock, restated=marked)
    # E is marked on value and growth and has no momentum row, so its momentum row is the
    # not-classified one of a ranked factor.
    e = add_instrument(conn, "E")
    add_bar_for(conn, e, L)
    add_marked_inputs(conn, set_id, e, "value", restated=True)
    add_marked_inputs(conn, set_id, e, "growth", restated=True)
    monkeypatch.setattr(constants, "MIN_PEER_SET_SIZE", MIN_FLOOR)

    result = run_classification_build(conn, set_id, monkeypatch)

    assert result.state == "complete", result.failure_reason
    rows = classifications_for(conn, set_id)
    a = stocks["A"]
    for factor in ("value", "growth"):
        assert (rows[(a, factor)]["status"], rows[(a, factor)]["restated_possible"]) == (
            "classified",
            True,
        )
    momentum = rows[(a, "momentum")]
    assert momentum["status"] == "classified"
    assert momentum["score"] is not None
    assert momentum["percentile"] is not None
    assert momentum["restated_possible"] is False
    assert [rows[(e, f)]["restated_possible"] for f in ("value", "growth")] == [True, True]
    assert (rows[(e, "momentum")]["reason_code"], rows[(e, "momentum")]["restated_possible"]) == (
        "input_missing",
        False,
    )
    for symbol in "BCD":
        assert {rows[(stocks[symbol], f)]["restated_possible"] for f in FACTORS} == {False}


# --- T006 ---------------------------------------------------------------------------------

D2 = date(2027, 1, 17)  # the later set's classification date
L2 = date(2027, 1, 15)
P0 = date(2026, 12, 31)  # a fresh quarter, newer than P1
P0_OBSERVED = date(2027, 1, 10)
P0_FILED = date(2027, 1, 5)  # after FIRST, so not backfilled


# Implements TC-COMP-188
def test_a_later_set_leaves_the_earlier_sets_mark_unchanged(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn, set_1 = store
    stocks = build_fixture(conn)
    assert run_two_stage_build(conn, set_1, monkeypatch).state == "complete"
    a = stocks["A"]
    flags_1 = classification_flags(conn, set_1)
    assert (flags_1[(a, "value")], flags_1[(a, "growth")]) == (True, True)
    before, inputs_before = snapshot(conn, set_1), input_snapshot(conn, set_1)

    set_2 = add_building_set(conn, add_run(conn), D2)
    for stock in stocks.values():
        add_bar_for(conn, stock, L2)
        for statement_type in STATEMENT_TYPES:
            add_statement(
                conn,
                stock,
                P0,
                statement_type,
                statement_payload(stock, statement_type, -1),
                observed_on=P0_OBSERVED,
                provider_filing_date=P0_FILED,
            )
    result = run_two_stage_build(conn, set_2, monkeypatch)

    assert result.state == "complete", result.failure_reason
    assert snapshot(conn, set_1) == before
    assert input_snapshot(conn, set_1) == inputs_before
    flags_2 = classification_flags(conn, set_2)
    assert set(flags_2) == set(flags_1)  # set 2 holds its own rows for the same keys
    assert classification_flags(conn, set_1)[(a, "value")] is True
    # Set 2's mark is what set 2's own inputs give, not a copy of set 1's.
    for symbol, stock in stocks.items():
        marks = input_flags(conn, set_2, stock)
        assert flags_2[(stock, "value")] is any(marks[name] for name in VALUE), symbol
        assert flags_2[(stock, "growth")] is any(marks[name] for name in GROWTH), symbol
        assert flags_2[(stock, "momentum")] is False


# --- T007 ---------------------------------------------------------------------------------


def test_only_the_rows_an_input_reads_mark_it(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-23, DEC-0122: a backfilled ninth quarter outside both windows marks nothing; the
    same kind of row inside a window marks exactly the inputs that read it."""
    conn, set_id = store
    stocks = build_fixture(
        conn,
        {
            "B": {("income_statement", 7)},  # the oldest prior-year quarter
            "C": {("income_statement", 3)},  # the oldest trailing quarter
        },
        extra_old=("A",),
    )

    assert run_two_stage_build(conn, set_id, monkeypatch).state == "complete"

    flags = classification_flags(conn, set_id)
    a, b, c, d = (stocks[s] for s in SYMBOLS)
    assert input_flags(conn, set_id, a) == expect()
    assert input_flags(conn, set_id, b) == expect(*GROWTH)
    assert input_flags(conn, set_id, c) == expect("earnings_yield", *GROWTH)
    assert input_flags(conn, set_id, d) == expect()
    assert {s: tuple(flags[(s, f)] for f in FACTORS) for s in (a, b, c, d)} == {
        a: (False, False, False),
        b: (False, True, False),
        c: (True, True, False),
        d: (False, False, False),
    }
    old_end = str(date(2024, 9, 30))
    for row in inputs_for(conn, set_id, a).values():
        assert old_end not in [p["fiscal_period_end"] for p in row["detail"]["periods"]]
    for stock in stocks.values():
        assert_column_agrees_with_detail(conn, set_id, stock)


def test_one_backfilled_row_marks_only_the_inputs_that_read_it(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-23, DEC-0122: only A's newest cash-flow quarter is backfilled; fcf_yield reads it
    and the other inputs do not, and any marked input marks the factor."""
    conn, set_id = store
    stocks = build_fixture(conn, {"A": {("cash_flow_statement", 0)}})

    assert run_two_stage_build(conn, set_id, monkeypatch).state == "complete"

    a = stocks["A"]
    assert input_flags(conn, set_id, a) == expect("fcf_yield")
    flags = classification_flags(conn, set_id)
    assert (flags[(a, "value")], flags[(a, "growth")], flags[(a, "momentum")]) == (
        True,
        False,
        False,
    )
    assert_column_agrees_with_detail(conn, set_id, a)


def test_filing_date_boundary_and_null_filing_date(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0056: filed on the first observed_on is not backfilled, one day earlier is, and a
    null filing date is not."""
    conn, set_id = store
    # A's rows are all filed on FIRST itself.
    stocks = build_fixture(conn, {"C": {("balance_sheet", 0)}})
    a, b, c = stocks["A"], stocks["B"], stocks["C"]
    reobserve(conn, b, "balance_sheet", 0, FIRST - timedelta(days=1))
    reobserve(conn, c, "balance_sheet", 0, None)  # C's backfilled row, re-filed as null

    assert run_two_stage_build(conn, set_id, monkeypatch).state == "complete"

    assert input_flags(conn, set_id, a) == expect()
    assert input_flags(conn, set_id, b) == expect(*VALUE)  # every value input reads it
    assert input_flags(conn, set_id, c) == expect()
    flags = classification_flags(conn, set_id)
    assert [flags[(s, "value")] for s in (a, b, c)] == [False, True, False]
    balance_sheet = {
        stock: next(
            p
            for p in inputs_for(conn, set_id, stock)["book_to_price"]["detail"]["periods"]
            if p["statement_type"] == "balance_sheet"
        )
        for stock in (a, b, c)
    }
    assert (balance_sheet[a]["provider_filing_date"], balance_sheet[a]["backfilled"]) == (
        str(FIRST),
        False,
    )
    assert (balance_sheet[b]["provider_filing_date"], balance_sheet[b]["backfilled"]) == (
        str(FIRST - timedelta(days=1)),
        True,
    )
    assert (balance_sheet[c]["provider_filing_date"], balance_sheet[c]["backfilled"]) == (
        None,
        False,
    )


def test_a_not_classified_row_for_a_missing_input_carries_the_mark(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0122: A holds no cash-flow statement, so fcf_yield is missing and lists no period;
    A's value row is not classified for it and still carries its other inputs' mark."""
    conn, set_id = store
    stocks = build_fixture(conn, statement_types={"A": ("balance_sheet", "income_statement")})

    assert run_two_stage_build(conn, set_id, monkeypatch).state == "complete"

    a = stocks["A"]
    rows = classifications_for(conn, set_id)
    value = rows[(a, "value")]
    assert (value["status"], value["reason_code"], value["reason_input"]) == (
        "not_classified",
        "input_missing",
        "fcf_yield",
    )
    assert value["restated_possible"] is True
    assert (rows[(a, "growth")]["status"], rows[(a, "growth")]["restated_possible"]) == (
        "classified",
        True,
    )
    assert inputs_for(conn, set_id, a)["fcf_yield"]["status"] == "missing"
    assert input_flags(conn, set_id, a) == expect("book_to_price", "earnings_yield", *GROWTH)
    assert_column_agrees_with_detail(conn, set_id, a)
    for symbol in "BCD":
        stock = stocks[symbol]
        assert rows[(stock, "value")]["status"] == "classified"  # three stocks rank at 3
        assert {rows[(stock, f)]["restated_possible"] for f in FACTORS} == {False}


def test_a_factor_whose_inputs_are_all_missing_is_not_marked(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0122: A holds six quarters, all backfilled, so its prior-year window is not formed
    and both growth inputs are missing although they read A's trailing quarters; they list
    no period, so neither they nor A's growth row are marked, while A's value is."""
    conn, set_id = store
    stocks = {symbol: add_instrument(conn, symbol) for symbol in SYMBOLS}
    for symbol, stock in stocks.items():
        add_bar_for(conn, stock, L)
        add_fundamentals(
            conn,
            stock,
            latest_period_end=P1,
            first_observed_on=FIRST,
            filed_before_first=all_rows(6) if symbol == "A" else frozenset(),
            quarters=6 if symbol == "A" else 8,
        )

    assert run_two_stage_build(conn, set_id, monkeypatch).state == "complete"

    a = stocks["A"]
    rows = classifications_for(conn, set_id)
    growth = rows[(a, "growth")]
    assert (growth["status"], growth["reason_code"], growth["reason_input"]) == (
        "not_classified",
        "input_missing",
        "revenue_growth",
    )
    assert growth["restated_possible"] is False
    assert {inputs_for(conn, set_id, a)[name]["status"] for name in GROWTH} == {"missing"}
    assert input_flags(conn, set_id, a) == expect(*VALUE)
    assert (rows[(a, "value")]["status"], rows[(a, "value")]["restated_possible"]) == (
        "classified",
        True,
    )
    assert_column_agrees_with_detail(conn, set_id, a)


def test_outdated_inputs_and_their_not_classified_rows_carry_the_mark(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0122: A's newest quarter ended more than six months before the classification
    date, so its five inputs are outdated; they list their periods, every one backfilled,
    so they are marked, and so are A's input_outdated value and growth rows."""
    conn, set_id = store
    stocks = {symbol: add_instrument(conn, symbol) for symbol in SYMBOLS}
    for symbol, stock in stocks.items():
        add_bar_for(conn, stock, L)
        add_fundamentals(
            conn,
            stock,
            latest_period_end=date(2026, 3, 31) if symbol == "A" else P1,
            first_observed_on=FIRST,
            filed_before_first=all_rows() if symbol == "A" else frozenset(),
        )

    assert run_two_stage_build(conn, set_id, monkeypatch).state == "complete"

    a = stocks["A"]
    assert {row["status"] for row in inputs_for(conn, set_id, a).values()} == {"outdated"}
    assert input_flags(conn, set_id, a) == expect(*FUNDAMENTAL_INPUTS)
    assert_column_agrees_with_detail(conn, set_id, a)
    rows = classifications_for(conn, set_id)
    for factor in ("value", "growth"):
        row = rows[(a, factor)]
        assert (row["status"], row["reason_code"], row["restated_possible"]) == (
            "not_classified",
            "input_outdated",
            True,
        )
    for symbol in "BCD":
        assert rows[(stocks[symbol], "value")]["status"] == "classified"


def test_not_computable_inputs_and_their_not_classified_rows_carry_the_mark(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0122: A's shares outstanding are negative, so its market capitalisation is not
    positive and its three value inputs are not computable, and its prior-year revenue
    sums below zero, so revenue_growth is not computable too. Each lists its periods, and
    exactly those that list one of A's backfilled income statements are marked, as are
    A's input_not_computable value and growth rows."""
    conn, set_id = store
    stocks = build_fixture(conn, {}, statement_types={"A": ("cash_flow_statement",)})
    a = stocks["A"]
    for k, end in enumerate(PERIOD_ENDS):
        balance_sheet = statement_payload(a, "balance_sheet", k)
        balance_sheet[TEST_KEYS["shares_outstanding"]] = Decimal(-100)
        income = statement_payload(a, "income_statement", k)
        if k >= 4:  # the prior-year window
            income[TEST_KEYS["revenue"]] = Decimal(-100)
        for statement_type, payload, filed in (
            ("balance_sheet", balance_sheet, FIRST),  # not backfilled
            ("income_statement", income, FIRST - BACKFILL_LEAD),  # backfilled
        ):
            add_statement(
                conn,
                a,
                end,
                statement_type,
                payload,
                observed_on=FIRST,
                provider_filing_date=filed,
            )

    assert run_two_stage_build(conn, set_id, monkeypatch).state == "complete"

    statuses = {name: row["status"] for name, row in inputs_for(conn, set_id, a).items()}
    assert statuses == {
        "book_to_price": "not_computable",
        "earnings_yield": "not_computable",
        "fcf_yield": "not_computable",
        "revenue_growth": "not_computable",
        "eps_growth": "present",
    }
    assert input_flags(conn, set_id, a) == expect("earnings_yield", *GROWTH)
    assert_column_agrees_with_detail(conn, set_id, a)
    rows = classifications_for(conn, set_id)
    for factor, first_input in (("value", "book_to_price"), ("growth", "revenue_growth")):
        row = rows[(a, factor)]
        assert (row["status"], row["reason_code"], row["reason_input"]) == (
            "not_classified",
            "input_not_computable",
            first_input,
        )
        assert row["restated_possible"] is True


def test_unranked_rows_carry_the_mark_and_retired_rows_never_do(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0122: with the floor at 5 no factor ranks over four stocks, and each stock's
    not_enough_stocks rows carry its own inputs' mark; a retired stock's rows are false
    although its statements are backfilled."""
    conn, set_id = store
    stocks = build_fixture(conn)
    retired = add_instrument(conn, "OLD", "retired")
    add_fundamentals(
        conn, retired, latest_period_end=P1, first_observed_on=FIRST, filed_before_first=all_rows()
    )

    assert run_two_stage_build(conn, set_id, monkeypatch, floor=5).state == "complete"

    rows = classifications_for(conn, set_id)
    for symbol, stock in stocks.items():
        for factor in FACTORS:
            row = rows[(stock, factor)]
            assert (row["status"], row["reason_code"]) == ("not_classified", "not_enough_stocks")
            assert row["restated_possible"] is (symbol == "A" and factor != "momentum")
    for factor in FACTORS:
        row = rows[(retired, factor)]
        assert (row["reason_code"], row["restated_possible"]) == ("retired", False)


def test_the_mark_changes_no_score_or_reason(store: Store, monkeypatch: pytest.MonkeyPatch) -> None:
    """AC-23, DEC-0056: the same population built with A's rows backfilled and again with
    them re-observed with no filing date classifies identically; only the mark differs."""
    conn, set_1 = store
    stocks = build_fixture(conn)
    assert run_two_stage_build(conn, set_1, monkeypatch).state == "complete"
    a = stocks["A"]
    for statement_type, quarter_index in sorted(all_rows()):
        reobserve(conn, a, statement_type, quarter_index, None)
    set_2 = add_building_set(conn, add_run(conn), D)

    assert run_two_stage_build(conn, set_2, monkeypatch).state == "complete"

    def classified(set_id: UUID) -> dict[tuple[int, str], tuple[object, ...]]:
        return {
            key: (
                row["status"],
                row["score"],
                row["percentile"],
                row["reason_code"],
                row["reason_input"],
                row["reason_detail"],
            )
            for key, row in classifications_for(conn, set_id).items()
        }

    assert classified(set_2) == classified(set_1)
    assert {key for key, flag in classification_flags(conn, set_1).items() if flag} == {
        (a, "value"),
        (a, "growth"),
    }
    assert set(classification_flags(conn, set_2).values()) == {False}
    assert input_flags(conn, set_2, a) == expect()


def test_a_marked_momentum_input_alone_marks_nothing(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E2-11, DEC-0122: no value or growth row of A is marked; A's marked momentum rows
    neither mark its momentum classification nor reach its value or growth rows."""
    conn, set_id = store
    stocks = build_fixture(conn, {})
    for symbol, stock in stocks.items():
        add_momentum_inputs(conn, set_id, stock, restated=symbol == "A")

    assert run_two_stage_build(conn, set_id, monkeypatch).state == "complete"

    rows = classifications_for(conn, set_id)
    a = stocks["A"]
    assert input_flags(conn, set_id, a) == {
        **expect(),
        "return_3m": True,
        "return_6m": True,
        "return_12m": True,
    }
    for factor in FACTORS:
        assert (rows[(a, factor)]["status"], rows[(a, factor)]["restated_possible"]) == (
            "classified",
            False,
        )
