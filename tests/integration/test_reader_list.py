"""The classification list and the one filter predicate against a real store (CAP-002-E3-S2).

Proves ``component-design-classification-reader.md`` sections 2.5 and 2.7 and the section 7
list rows: DAC-E3-S2-1 to DAC-E3-S2-7 (TC-COMP-096, 108, 112, 120, 121, 122, 189) and, through
them, DAC-E3-2 to DAC-E3-6 and DAC-E3-12 (AC-9, AC-16, AC-23). Sets and rows are seeded
directly, so the reader is tested independently of the engine.
"""

import uuid
from collections.abc import Iterator
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.api.bounds import MAX_PAGE_SIZE
from factorflow.classification import reader
from tests.integration.reader_seed import (
    insert_instrument,
    insert_reference,
    insert_run,
    insert_set,
    insert_universe,
    remove_member,
    retire_universe,
    seed_scored_stock,
)

pytestmark = pytest.mark.postgres

T0 = datetime(2026, 10, 14, 22, 30, tzinfo=UTC)
D = Decimal
RETIRED = ("retired", None)
MISSING_VALUE = ("input_missing", "book_to_price")
OUTDATED_GROWTH = ("input_outdated", "revenue_growth")
NOT_COMPUTABLE_MOMENTUM = ("input_not_computable", "return_12m")
OUTDATED_MOMENTUM = ("input_outdated", "return_3m")
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


def _read(conn: psycopg.Connection, **filters: Any) -> reader.ClassificationPage:
    return reader.list_classifications(conn, reader.ListFilters(**filters))


def _symbols(page: reader.ClassificationPage) -> list[str]:
    return [row.symbol for row in page.stocks]


def _all_pages(conn: psycopg.Connection, **filters: Any) -> Iterator[reader.ClassificationPage]:
    cursor = None
    while True:
        page = _read(conn, cursor=cursor, **filters)
        yield page
        cursor = page.next_cursor
        if cursor is None:
            return


def _every_symbol(conn: psycopg.Connection, **filters: Any) -> list[str]:
    return [s for page in _all_pages(conn, **filters) for s in _symbols(page)]


def _row(page: reader.ClassificationPage, symbol: str) -> reader.StockRow:
    return next(row for row in page.stocks if row.symbol == symbol)


def _t(**kwargs: Any) -> reader.Thresholds:
    return reader.Thresholds(**kwargs)


# --- TC-COMP-096: a threshold excludes only stocks classified on that factor ----------------


@pytest.fixture
def threshold_stocks(migrated_run_schema_connection: psycopg.Connection) -> psycopg.Connection:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "A", value=(D("1.5"), D("90")), growth=(D("1"), D("90")))
    seed_scored_stock(conn, set_id, "B", value=(D("0.2"), D("60")))
    seed_scored_stock(conn, set_id, "C", value=MISSING_VALUE)
    seed_scored_stock(conn, set_id, "D", value=UNRANKED)
    seed_scored_stock(
        conn,
        set_id,
        "E",
        value=(D("1.4"), D("85")),
        growth=(D("0"), D("20")),
        momentum=OUTDATED_MOMENTUM,
    )
    return conn


# Implements TC-COMP-096
def test_threshold_excludes_only_classified_stocks_failing_it(
    threshold_stocks: psycopg.Connection,
) -> None:
    """DAC-E3-S2-1, DAC-E3-3: C (incomplete) and D (unranked) on value stay, counted; E stays
    although momentum is incomplete; B, classified at 60, leaves."""
    page = _read(threshold_stocks, thresholds=_t(bounds={"value_percentile_min": D("80")}))

    assert _symbols(page) == ["A", "C", "D", "E"]
    assert page.match_count == 4
    assert _row(page, "C").factors["value"].reason_code == "input_missing"
    assert _row(page, "D").factors["value"].reason_code == "not_enough_stocks"


# Implements TC-COMP-096
def test_upper_bound_and_score_bound_are_inclusive(threshold_stocks: psycopg.Connection) -> None:
    """DAC-E3-S2-1: `_max` keeps stocks at or below; `*_score_min` compares the stored score."""
    below = _read(threshold_stocks, thresholds=_t(bounds={"value_percentile_max": D("70")}))
    assert _symbols(below) == ["B", "C", "D"]

    at_score = _read(threshold_stocks, thresholds=_t(bounds={"value_score_min": D("1.5")}))
    assert _symbols(at_score) == ["A", "C", "D"]
    at_max = _read(threshold_stocks, thresholds=_t(bounds={"value_score_max": D("0.2")}))
    assert _symbols(at_max) == ["B", "C", "D"]
    at_pmin = _read(threshold_stocks, thresholds=_t(bounds={"value_percentile_min": D("90")}))
    assert _symbols(at_pmin) == ["A", "C", "D"]
    at_pmax = _read(threshold_stocks, thresholds=_t(bounds={"value_percentile_max": D("60")}))
    assert _symbols(at_pmax) == ["B", "C", "D"]


@pytest.mark.parametrize(
    ("bounds", "expected"),
    [
        ({"growth_score_min": D("0.5")}, ["A", "B", "C", "D"]),
        ({"growth_score_max": D("0.5")}, ["B", "C", "D", "E"]),
        ({"growth_percentile_min": D("50")}, ["A", "B", "C", "D"]),
        ({"growth_percentile_max": D("50")}, ["B", "C", "D", "E"]),
        ({"momentum_score_min": D("0.6")}, ["E"]),
        ({"momentum_score_max": D("0.4")}, ["E"]),
        ({"momentum_percentile_min": D("51")}, ["E"]),
        ({"momentum_percentile_max": D("49")}, ["E"]),
        ({"momentum_score_min": D("0.5")}, ["A", "B", "C", "D", "E"]),
        ({"momentum_score_max": D("0.5")}, ["A", "B", "C", "D", "E"]),
        ({"momentum_percentile_min": D("50")}, ["A", "B", "C", "D", "E"]),
        ({"momentum_percentile_max": D("50")}, ["A", "B", "C", "D", "E"]),
    ],
)
# Implements TC-COMP-096
def test_every_factor_bound_applies_to_its_own_factor(
    threshold_stocks: psycopg.Connection, bounds: dict[str, Decimal], expected: list[str]
) -> None:
    """DAC-E3-S2-1 for the growth and momentum bounds; E is incomplete on momentum, so a
    momentum bound never removes it."""
    page = _read(threshold_stocks, thresholds=_t(bounds=bounds))
    assert _symbols(page) == expected
    assert page.match_count == len(expected)


# Implements TC-COMP-096
def test_bounds_on_two_factors_intersect(threshold_stocks: psycopg.Connection) -> None:
    page = _read(
        threshold_stocks,
        thresholds=_t(bounds={"value_percentile_min": D("80"), "growth_percentile_min": D("50")}),
    )
    assert _symbols(page) == ["A", "C", "D"]
    assert page.match_count == 3


# Implements TC-COMP-096
def test_hide_incomplete_with_a_threshold(threshold_stocks: psycopg.Connection) -> None:
    """DAC-E3-S2-1 with DAC-E3-S2-2: C and E leave the list and the count; D stays."""
    page = _read(
        threshold_stocks,
        thresholds=_t(bounds={"value_percentile_min": D("80")}, hide_incomplete=True),
    )
    assert _symbols(page) == ["A", "D"]
    assert page.match_count == 2


# --- TC-COMP-108: hide_incomplete hides only the three input reasons ------------------------


# Implements TC-COMP-108
def test_hide_incomplete_hides_only_input_reason_stocks(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S2-2, DAC-E3-4: FULL has a NULL reason on every row (DEC-0129); NES is unranked;
    RET is retired and reached through a universe; each input reason hides its stock."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    ids = [
        seed_scored_stock(conn, set_id, "FULL"),
        seed_scored_stock(conn, set_id, "IM", value=MISSING_VALUE),
        seed_scored_stock(conn, set_id, "IO", growth=OUTDATED_GROWTH),
        seed_scored_stock(conn, set_id, "INC", momentum=NOT_COMPUTABLE_MOMENTUM),
        seed_scored_stock(conn, set_id, "NES", growth=UNRANKED),
        seed_scored_stock(
            conn,
            set_id,
            "RET",
            value=RETIRED,
            growth=RETIRED,
            momentum=RETIRED,
            lifecycle="retired",
        ),
        seed_scored_stock(conn, set_id, "MIX", value=MISSING_VALUE, momentum=UNRANKED),
    ]
    universe_id = insert_universe(conn, "Everything", ids)

    unscoped = _read(conn)
    assert _symbols(unscoped) == ["FULL", "IM", "INC", "IO", "MIX", "NES"]
    assert unscoped.match_count == 6
    scoped = _read(conn, universe_id=universe_id)
    assert _symbols(scoped) == ["FULL", "IM", "INC", "IO", "MIX", "NES", "RET"]
    assert scoped.match_count == 7

    hidden = _read(conn, thresholds=_t(hide_incomplete=True))
    assert _symbols(hidden) == ["FULL", "NES"]
    assert hidden.match_count == 2
    hidden_scoped = _read(conn, universe_id=universe_id, thresholds=_t(hide_incomplete=True))
    assert _symbols(hidden_scoped) == ["FULL", "NES", "RET"]
    assert hidden_scoped.match_count == 3


# --- TC-COMP-189: the restatement mark is on the listed cell ------------------------------


# Implements TC-COMP-189
def test_restated_value_and_growth_cells_carry_the_mark(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S2-6, DAC-E3-12: the stored flag, per cell, derived from nothing."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "MARK", restated=("value", "growth"))
    seed_scored_stock(conn, set_id, "MOMO", restated=("momentum",))
    seed_scored_stock(conn, set_id, "PLAIN")

    page = _read(conn)

    marked = _row(page, "MARK").factors
    assert [marked[f].restated_possible for f in reader.FACTORS] == [True, True, False]
    momo = _row(page, "MOMO").factors
    assert [momo[f].restated_possible for f in reader.FACTORS] == [False, False, True]
    plain = _row(page, "PLAIN").factors
    assert [plain[f].restated_possible for f in reader.FACTORS] == [False, False, False]


# --- TC-COMP-112: unscoped is the active roster; a universe keeps retired members -----------


@pytest.fixture
def scoped_stocks(
    migrated_run_schema_connection: psycopg.Connection,
) -> tuple[psycopg.Connection, UUID, dict[str, int]]:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    ids = {
        "ACT": seed_scored_stock(
            conn, set_id, "ACT", value=(D("1.25"), D("75.5")), growth=UNRANKED, name="Active Co"
        ),
        "OLD": seed_scored_stock(
            conn,
            set_id,
            "OLD",
            value=RETIRED,
            growth=RETIRED,
            momentum=RETIRED,
            lifecycle="retired",
        ),
        "GONE": seed_scored_stock(conn, set_id, "GONE"),
        "NOROW": insert_instrument(conn, "NOROW"),
        "OUT": seed_scored_stock(conn, set_id, "OUT"),
    }
    universe_id = insert_universe(conn, "Mine", ids.values())
    remove_member(conn, universe_id, ids["GONE"])
    return conn, universe_id, ids


# Implements TC-COMP-112
def test_unscoped_list_is_active_only(
    scoped_stocks: tuple[psycopg.Connection, UUID, dict[str, int]],
) -> None:
    """DAC-E3-S2-3, DAC-E3-5: a retired instrument with rows is absent and uncounted."""
    conn, _, _ = scoped_stocks
    page = _read(conn)
    assert _symbols(page) == ["ACT", "GONE", "OUT"]
    assert page.match_count == 3


# Implements TC-COMP-112
def test_universe_scope_keeps_retired_members(
    scoped_stocks: tuple[psycopg.Connection, UUID, dict[str, int]],
) -> None:
    """DAC-E3-S2-3: OLD is listed with `retired` on every factor; GONE (removed) and NOROW (no
    row in the set) are absent; ACT's cells are identical in both scopes (AC-8)."""
    conn, universe_id, _ = scoped_stocks
    page = _read(conn, universe_id=universe_id)

    assert _symbols(page) == ["ACT", "OLD", "OUT"]
    assert page.match_count == 3
    old = _row(page, "OLD")
    assert old.lifecycle == "retired"
    assert [old.factors[f].reason_code for f in reader.FACTORS] == ["retired"] * 3
    assert [old.factors[f].status for f in reader.FACTORS] == ["not_classified"] * 3
    assert _row(page, "ACT") == _row(_read(conn), "ACT")


# Implements TC-COMP-112
def test_unknown_universe_raises(
    scoped_stocks: tuple[psycopg.Connection, UUID, dict[str, int]],
) -> None:
    conn, _, _ = scoped_stocks
    with pytest.raises(reader.UniverseNotFound):
        _read(conn, universe_id=uuid.uuid4())
    unknown = uuid.uuid4()
    with pytest.raises(reader.UniverseNotFound) as raised:
        _read(conn, universe_id=unknown)
    assert raised.value.universe_id == unknown


# Implements TC-COMP-112
def test_retired_universe_is_still_a_scope(
    scoped_stocks: tuple[psycopg.Connection, UUID, dict[str, int]],
) -> None:
    """PROVISIONAL, DEC-0128: awaiting owner confirmation (2026-10-17), Open Gap 3 of
    CAP-002-E3-S2-tasks. A retired universe lists its members as of today."""
    conn, universe_id, _ = scoped_stocks
    retire_universe(conn, universe_id)
    assert _symbols(_read(conn, universe_id=universe_id)) == ["ACT", "OLD", "OUT"]


# Implements TC-COMP-112
def test_universe_with_no_members_in_the_set_is_an_empty_page(
    scoped_stocks: tuple[psycopg.Connection, UUID, dict[str, int]],
) -> None:
    conn, _, ids = scoped_stocks
    empty = insert_universe(conn, "Empty", [])
    rowless = insert_universe(conn, "Rowless", [ids["NOROW"]])
    for universe_id in (empty, rowless):
        page = _read(conn, universe_id=universe_id)
        assert (page.stocks, page.match_count, page.next_cursor) == ([], 0, None)
        assert page.set is not None


# --- TC-COMP-120: match_count is the whole filtered scope on every page ----------------------


@pytest.fixture
def hundred_twenty(
    migrated_run_schema_connection: psycopg.Connection,
) -> tuple[psycopg.Connection, UUID]:
    """120 active stocks S000 to S119: every fourth below percentile 50, every tenth incomplete."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    for n in range(120):
        seed_scored_stock(
            conn,
            set_id,
            f"S{n:03d}",
            value=(D(n), D(10) if n % 4 == 0 else D(90)),
            growth=OUTDATED_GROWTH if n % 10 == 0 else (D("0.5"), D("50")),
        )
    return conn, set_id


def _paged(conn: psycopg.Connection, **filters: Any) -> list[reader.ClassificationPage]:
    return list(_all_pages(conn, limit=50, **filters))


# Implements TC-COMP-120
def test_match_count_is_identical_on_every_page(
    hundred_twenty: tuple[psycopg.Connection, UUID],
) -> None:
    """DAC-E3-S2-4, DAC-E3-6: three pages of 50, 50 and 20, each reporting 120."""
    conn, _ = hundred_twenty
    pages = _paged(conn)

    assert [len(p.stocks) for p in pages] == [50, 50, 20]
    assert [p.match_count for p in pages] == [120, 120, 120]
    assert [p.next_cursor is None for p in pages] == [False, False, True]
    every = [s for p in pages for s in _symbols(p)]
    assert every == [f"S{n:03d}" for n in range(120)]


# Implements TC-COMP-120
def test_a_full_last_page_has_no_next_cursor(
    hundred_twenty: tuple[psycopg.Connection, UUID],
) -> None:
    """120 rows at a limit of 40: the third page is full and is the last."""
    conn, _ = hundred_twenty
    pages = list(_all_pages(conn, limit=40))
    assert [len(p.stocks) for p in pages] == [40, 40, 40]
    assert [p.next_cursor is None for p in pages] == [False, False, True]


@pytest.mark.parametrize(
    ("thresholds", "count", "sizes"),
    [
        ({"bounds": {"value_percentile_min": D("50")}}, 90, [50, 40]),
        ({"hide_incomplete": True}, 108, [50, 50, 8]),
        ({"symbol": "S1"}, 20, [20]),
        ({"symbol": "S0", "hide_incomplete": True}, 90, [50, 40]),
    ],
)
# Implements TC-COMP-120
def test_filters_change_the_count_identically_on_every_page(
    hundred_twenty: tuple[psycopg.Connection, UUID],
    thresholds: dict[str, Any],
    count: int,
    sizes: list[int],
) -> None:
    conn, _ = hundred_twenty
    pages = _paged(conn, thresholds=_t(**thresholds))
    assert [len(p.stocks) for p in pages] == sizes
    assert {p.match_count for p in pages} == {count}


# Implements TC-COMP-120
def test_no_match_and_past_the_end_pages_still_carry_the_count(
    hundred_twenty: tuple[psycopg.Connection, UUID],
) -> None:
    conn, set_id = hundred_twenty
    nothing = _read(conn, thresholds=_t(symbol="ZZ"))
    assert (nothing.stocks, nothing.match_count, nothing.next_cursor) == ([], 0, None)

    after_last = reader.encode_cursor(set_id, "symbol", "asc", "S119", False, "S119")
    beyond = _read(conn, cursor=after_last)
    assert (beyond.stocks, beyond.match_count, beyond.next_cursor) == ([], 120, None)


# --- TC-COMP-122: all-null thresholds match every stock in scope ----------------------------


# Implements TC-COMP-122
def test_empty_thresholds_match_every_stock_in_scope(
    scoped_stocks: tuple[psycopg.Connection, UUID, dict[str, int]],
) -> None:
    """DAC-E3-S2-7, DAC-E3-2: unscoped, every active stock with a row; scoped, every member
    with a row, incomplete, unranked and retired included; evaluate_filter agrees."""
    conn, universe_id, ids = scoped_stocks
    set_id = reader.current_set(conn)
    assert set_id is not None

    unscoped = _read(conn, thresholds=reader.Thresholds())
    assert unscoped.match_count == len(unscoped.stocks) == 3
    scoped = _read(conn, universe_id=universe_id, thresholds=reader.Thresholds())
    assert scoped.match_count == len(scoped.stocks) == 3
    assert {r.symbol for r in scoped.stocks} == {"ACT", "OLD", "OUT"}

    evaluated = reader.evaluate_filter(conn, set_id.set_id, reader.Thresholds())
    assert evaluated == sorted(r.instrument_id for r in unscoped.stocks)
    assert evaluated == sorted([ids["ACT"], ids["GONE"], ids["OUT"]])


# --- evaluate_filter equals the list (design section 7) ------------------------------------


@pytest.mark.parametrize(
    "thresholds",
    [
        {"bounds": {"value_percentile_min": D("50")}},
        {"bounds": {"value_percentile_min": D("50")}, "hide_incomplete": True},
        {"bounds": {"value_score_max": D("60")}, "symbol": "S0"},
        {"symbol": "S1", "hide_incomplete": True},
        {"bounds": {"growth_percentile_min": D("60")}},
    ],
)
def test_evaluate_filter_equals_the_list(
    hundred_twenty: tuple[psycopg.Connection, UUID], thresholds: dict[str, Any]
) -> None:
    """DAC-E3-2, DAC-E3-S2-7: the same ids as every page of the list, unpaginated. The last
    case keeps the twelve stocks incomplete on growth, the thresholded factor (DEC-0081)."""
    conn, set_id = hundred_twenty
    t = _t(**thresholds)
    listed = [
        row.instrument_id
        for page in _all_pages(conn, limit=MAX_PAGE_SIZE, thresholds=t)
        for row in page.stocks
    ]
    evaluated = reader.evaluate_filter(conn, set_id, t)
    assert evaluated == sorted(listed)
    assert len(evaluated) == len(set(evaluated)) > 0


def test_growth_threshold_keeps_stocks_incomplete_on_growth(
    hundred_twenty: tuple[psycopg.Connection, UUID],
) -> None:
    conn, set_id = hundred_twenty
    assert (
        len(reader.evaluate_filter(conn, set_id, _t(bounds={"growth_percentile_min": D("60")})))
        == 12
    )


def test_symbols_narrow_the_scope(migrated_run_schema_connection: psycopg.Connection) -> None:
    """ListFilters.symbols reaches the scope predicate unchanged (compare, CAP-002-E3-S3)."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    for symbol in ("AA", "AAPL", "BAAP"):
        seed_scored_stock(conn, set_id, symbol)
    page = _read(conn, symbols=["BAAP", "AA", "NOPE"])
    assert _symbols(page) == ["AA", "BAAP"]
    assert page.match_count == 2
    assert page.unknown_symbols == []


def test_symbol_prefix_narrows_the_scope(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DEC-0074: "AA" matches AAPL and AA, not BAAP; the count and evaluate_filter follow."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    ids = {s: seed_scored_stock(conn, set_id, s) for s in ("AA", "AAPL", "BAAP", "A")}

    page = _read(conn, thresholds=_t(symbol="aa"))
    assert _symbols(page) == ["AA", "AAPL"]
    assert page.match_count == 2
    assert reader.evaluate_filter(conn, set_id, _t(symbol="AA")) == sorted([ids["AA"], ids["AAPL"]])
    assert reader.evaluate_filter(conn, set_id, reader.Thresholds()) == sorted(ids.values())


def test_evaluate_filter_reads_the_named_set(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Open Gap 5: the set is taken as given, current or not."""
    conn = migrated_run_schema_connection
    older = _complete_set(conn, started_at=T0 - timedelta(days=1))
    newer = _complete_set(conn)
    old_id = seed_scored_stock(conn, older, "OLDSET", value=(D("1"), D("10")))
    new_id = seed_scored_stock(conn, newer, "NEWSET", value=(D("1"), D("90")))

    assert reader.evaluate_filter(conn, older, reader.Thresholds()) == [old_id]
    assert reader.evaluate_filter(conn, newer, reader.Thresholds()) == [new_id]
    assert _symbols(_read(conn)) == ["NEWSET"]


# --- Sort and keyset (design section 7) ---------------------------------------------------


@pytest.fixture
def sortable(migrated_run_schema_connection: psycopg.Connection) -> psycopg.Connection:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "B", value=(D("2"), D("40")))
    seed_scored_stock(conn, set_id, "A", value=(D("1"), D("80")))
    seed_scored_stock(conn, set_id, "D", value=UNRANKED)
    seed_scored_stock(conn, set_id, "C", value=MISSING_VALUE)
    seed_scored_stock(conn, set_id, "E", value=(D("2"), D("40")))
    seed_scored_stock(conn, set_id, "F", value=(D("-3"), D("100")))
    return conn


def test_default_order_is_symbol_ascending(sortable: psycopg.Connection) -> None:
    assert _symbols(_read(sortable)) == ["A", "B", "C", "D", "E", "F"]
    assert _symbols(_read(sortable, order="desc")) == ["F", "E", "D", "C", "B", "A"]


@pytest.mark.parametrize(
    ("sort", "order", "expected"),
    [
        ("value_score", "asc", ["F", "A", "B", "E", "C", "D"]),
        ("value_score", "desc", ["B", "E", "A", "F", "C", "D"]),
        ("value_percentile", "asc", ["B", "E", "A", "F", "C", "D"]),
        ("value_percentile", "desc", ["F", "A", "B", "E", "C", "D"]),
    ],
)
def test_unclassified_rows_sort_last_in_both_directions(
    sortable: psycopg.Connection, sort: str, order: str, expected: list[str]
) -> None:
    """STD-UI-4: an absent score never sorts as zero; ties break on symbol ascending."""
    assert _symbols(_read(sortable, sort=sort, order=order)) == expected


@pytest.fixture
def momentum_ranked(
    migrated_run_schema_connection: psycopg.Connection,
) -> tuple[psycopg.Connection, UUID]:
    """100 classified on momentum with percentiles in runs of three equal values, 20 not."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    for n in range(120):
        momentum = UNRANKED if n >= 100 else (D(n // 3), D(n // 3))
        seed_scored_stock(conn, set_id, f"M{n:03d}", momentum=momentum)
    return conn, set_id


def _expected_momentum_desc() -> list[str]:
    classified = sorted(range(100), key=lambda n: (-(n // 3), n))
    return [f"M{n:03d}" for n in classified] + [f"M{n:03d}" for n in range(100, 120)]


@pytest.mark.parametrize(
    ("limit", "sizes"), [(50, [50, 50, 20]), (55, [55, 55, 10]), (34, [34, 34, 34, 18])]
)
def test_keyset_pages_cover_every_stock_once(
    momentum_ranked: tuple[psycopg.Connection, UUID], limit: int, sizes: list[int]
) -> None:
    """A boundary at 100 falls between classified and unclassified, one at 110 inside the
    unclassified block, and 34 and 68 split runs of equal percentiles."""
    conn, _ = momentum_ranked
    pages = list(_all_pages(conn, sort="momentum_percentile", order="desc", limit=limit))
    assert [len(p.stocks) for p in pages] == sizes
    assert [s for p in pages for s in _symbols(p)] == _expected_momentum_desc()
    assert {p.match_count for p in pages} == {120}


@pytest.mark.parametrize("sort", ["momentum_score", "momentum_percentile", "symbol"])
@pytest.mark.parametrize("order", ["asc", "desc"])
def test_keyset_pages_equal_the_unpaged_order(
    momentum_ranked: tuple[psycopg.Connection, UUID], sort: str, order: str
) -> None:
    conn, _ = momentum_ranked
    whole = _symbols(_read(conn, sort=sort, order=order, limit=MAX_PAGE_SIZE))
    assert len(whole) == 120
    assert _every_symbol(conn, sort=sort, order=order, limit=7) == whole


@pytest.mark.parametrize(
    "binding",
    [
        {"sort": "momentum_score"},
        {"order": "asc"},
        {"set_id": uuid.uuid4()},
    ],
)
def test_cursor_for_another_sort_order_or_set_is_refused(
    momentum_ranked: tuple[psycopg.Connection, UUID], binding: dict[str, Any]
) -> None:
    conn, set_id = momentum_ranked
    issued = {"set_id": set_id, "sort": "momentum_percentile", "order": "desc", **binding}
    cursor = reader.encode_cursor(
        issued["set_id"], issued["sort"], issued["order"], D("5"), False, "M015"
    )
    with pytest.raises(reader.CursorError):
        _read(conn, sort="momentum_percentile", order="desc", cursor=cursor)


def test_malformed_cursor_is_refused_before_the_set_is_read(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    with pytest.raises(reader.CursorError):
        _read(migrated_run_schema_connection, cursor="not-a-cursor")


# --- Cell shape (AC-9, AC-12, DAC-E3-12) -------------------------------------------------


def test_cells_are_the_stored_rows(
    scoped_stocks: tuple[psycopg.Connection, UUID, dict[str, int]],
) -> None:
    """Score and percentile as stored, Decimal; reasons as stored; nothing recomputed (75.5
    is not derivable from one stock's score)."""
    conn, _, ids = scoped_stocks
    row = _row(_read(conn), "ACT")

    assert row.instrument_id == ids["ACT"]
    assert (row.symbol, row.name, row.lifecycle) == ("ACT", "Active Co", "active")
    assert list(row.factors) == list(reader.FACTORS)
    assert row.factors["value"] == reader.FactorCell(
        status="classified",
        score=D("1.25"),
        percentile=D("75.5"),
        reason_code=None,
        reason_input=None,
        reason_detail=None,
        restated_possible=False,
    )
    assert isinstance(row.factors["value"].score, Decimal)
    assert row.factors["growth"] == reader.FactorCell(
        status="not_classified",
        score=None,
        percentile=None,
        reason_code="not_enough_stocks",
        reason_input=None,
        reason_detail=None,
        restated_possible=False,
    )


def test_input_reason_cell_carries_its_input_and_detail(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "INC", momentum=NOT_COMPUTABLE_MOMENTUM)
    cell = _row(_read(conn), "INC").factors["momentum"]
    assert (cell.status, cell.score, cell.percentile) == ("not_classified", None, None)
    assert (cell.reason_code, cell.reason_input, cell.reason_detail) == (
        "input_not_computable",
        "return_12m",
        "return_12m is input_not_computable",
    )


def test_name_is_the_latest_reference_name_or_none(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """PROVISIONAL, DEC-0245: the company name is the latest instrument_reference record's;
    a stock with no reference record has no name rather than an invented one."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    renamed = seed_scored_stock(conn, set_id, "REN")
    insert_reference(conn, renamed, "New Name Inc", recorded_at=T0)
    insert_reference(conn, renamed, "Old Name Inc", recorded_at=T0 - timedelta(days=1))
    seed_scored_stock(conn, set_id, "NONAME")

    page = _read(conn)
    assert _row(page, "REN").name == "New Name Inc"
    assert _row(page, "NONAME").name is None
    assert page.match_count == 2


# --- Page blocks and never classified (DAC-E3-11 list half; AC-20, AC-22) --------------------


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


def test_page_carries_the_set_and_later_blocks(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn)
    seed_scored_stock(conn, set_id, "AAA")

    alone = _read(conn)
    assert alone.set is not None and alone.set.set_id == set_id
    assert (alone.later, alone.set.not_current, alone.never_classified) == (None, False, False)
    assert alone.unknown_symbols == []

    run_id = insert_run(conn, "succeeded", started_at=T0 + timedelta(hours=2))
    insert_set(conn, run_id, "building", started_at=T0 + timedelta(hours=3))
    page = _read(conn)
    assert (page.set, page.later) == reader.read_set_blocks(conn)
    assert page.set is not None and page.set.not_current is True
    assert page.later is not None and page.later.state == "building"
    assert _symbols(page) == ["AAA"]


@pytest.mark.parametrize("first_set", [None, "building"])
def test_never_classified_page_runs_no_list_statement(
    migrated_run_schema_connection: psycopg.Connection, first_set: str | None
) -> None:
    """AC-22: no complete set yields the never-classified shape; an unknown universe does not
    raise here because the set is resolved first (Open Gap 6)."""
    conn = migrated_run_schema_connection
    if first_set is not None:
        run_id = insert_run(conn, "succeeded", started_at=T0)
        building_id = insert_set(conn, run_id, first_set, started_at=T0)
        seed_scored_stock(conn, building_id, "AAA")
    _, later = reader.read_set_blocks(conn)

    for filters in (reader.ListFilters(), reader.ListFilters(universe_id=uuid.uuid4())):
        counting = CountingConnection(conn)
        page = reader.list_classifications(counting, filters)  # type: ignore[arg-type]
        assert page == reader.ClassificationPage(
            set=None,
            never_classified=True,
            later=later,
            match_count=0,
            stocks=[],
            unknown_symbols=[],
            next_cursor=None,
        )
        assert counting.statements == [reader.CURRENT_SET_SQL]
    assert (later is None) == (first_set is None)
