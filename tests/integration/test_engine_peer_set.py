"""Peer sets and the classification rows of a build (CAP-002-E2-S5).

Each test builds through ``engine.build`` with only the classification stage registered, over
``factor_input`` rows it inserts directly (DEC-0119), so no input stage runs. Satisfies AC-8,
AC-9, AC-12, AC-14, AC-15, DAC-E2-2, DAC-E2-7, DAC-E2-8 and DAC-E2-S5-2 to DAC-E2-S5-6.
"""

from collections.abc import Iterator, Sequence
from decimal import Decimal
from typing import Any, NamedTuple
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import constants, engine
from tests.integration.engine_classify_support import (
    add_active_stock,
    add_factor_inputs,
    add_full_roster,
    add_roster_inputs,
    add_terminal_run_and_set,
    classifications_for,
    factor_counts_for,
    input_values,
    make_context,
    matches_reference,
    reference_scores,
    run_classification_build,
    scores_of,
)
from tests.integration.engine_support import add_instrument, migrate_through_classification

pytestmark = pytest.mark.postgres

FACTORS = constants.FACTORS
Rows = dict[tuple[int, str], dict[str, Any]]


class Store(NamedTuple):
    conn: psycopg.Connection
    run_id: UUID
    set_id: UUID


@pytest.fixture
def store(postgres_connection_string: str) -> Iterator[Store]:
    """A store migrated through 0006 with a succeeded run and its ``building`` set; each test
    adds the roster it needs."""
    conn = migrate_through_classification(postgres_connection_string)
    try:
        run_id, set_id = add_terminal_run_and_set(conn)
        yield Store(conn, run_id, set_id)
    finally:
        conn.close()


def reason(row: dict[str, Any]) -> tuple[Any, ...]:
    return (
        row["status"],
        row["reason_code"],
        row["reason_input"],
        row["reason_detail"],
        row["score"],
        row["percentile"],
    )


def assert_factor_matches_reference(
    conn: psycopg.Connection, set_id: UUID, rows: Rows, factor: str, peer: Sequence[int]
) -> None:
    """The factor's classified rows are exactly ``peer``, scored as the oracle scores it."""
    expected = reference_scores(input_values(conn, set_id, factor, peer))
    assert matches_reference(scores_of(rows, factor), expected), factor


def add_universe(conn: psycopg.Connection, name: str, members: Sequence[int]) -> None:
    row = conn.execute("INSERT INTO universe DEFAULT VALUES RETURNING universe_id").fetchone()
    assert row is not None
    conn.execute(
        "INSERT INTO universe_event (universe_id, event_type, name) VALUES (%s, 'created', %s)",
        (row[0], name),
    )
    for instrument_id in members:
        conn.execute(
            "INSERT INTO universe_event (universe_id, event_type, instrument_id) "
            "VALUES (%s, 'member_added', %s)",
            (row[0], instrument_id),
        )
    conn.commit()


def input_row_count(conn: psycopg.Connection, instrument_id: int) -> int:
    row = conn.execute(
        "SELECT count(*) FROM factor_input WHERE instrument_id = %s", (instrument_id,)
    ).fetchone()
    conn.commit()
    assert row is not None
    return int(row[0])


# Implements TC-COMP-067
def test_stock_with_two_of_three_value_inputs_is_outside_the_value_peer_set(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn, set_id = store.conn, store.set_id
    roster, _ = add_full_roster(conn, set_id, 30)
    a = add_active_stock(conn, "A")
    b = add_active_stock(conn, "B")
    add_factor_inputs(conn, set_id, a, "value", statuses={"fcf_yield": "missing"})
    add_factor_inputs(conn, set_id, b, "value", omit=("fcf_yield",))  # no third row at all
    for stock in (a, b):
        add_factor_inputs(conn, set_id, stock, "growth")
        add_factor_inputs(conn, set_id, stock, "momentum")

    result = run_classification_build(conn, set_id, monkeypatch)

    assert result.state == "complete"
    assert factor_counts_for(conn, set_id) == {
        "value": (30, True),
        "growth": (32, True),
        "momentum": (32, True),
    }
    rows = classifications_for(conn, set_id)
    for stock in (a, b):
        assert reason(rows[(stock, "value")]) == (
            "not_classified",
            "input_missing",
            "fcf_yield",
            "free-cash-flow yield missing",
            None,
            None,
        )
        for factor in ("growth", "momentum"):
            assert rows[(stock, factor)]["status"] == "classified"
            assert rows[(stock, factor)]["score"] is not None
            assert rows[(stock, factor)]["percentile"] is not None
    # A's two present values and B's two rows move no statistic of the value peer set.
    assert_factor_matches_reference(conn, set_id, rows, "value", roster)
    for factor in ("growth", "momentum"):
        assert_factor_matches_reference(conn, set_id, rows, factor, [*roster, a, b])


# Implements TC-COMP-068
def test_scores_are_identical_whatever_the_universe_membership(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn = store.conn
    roster, retired = add_full_roster(conn, store.set_id, 32, n_retired=1)
    assert conn.execute("SELECT count(*) FROM universe").fetchone() == (0,)
    conn.commit()
    assert run_classification_build(conn, store.set_id, monkeypatch).state == "complete"

    in_none, in_one, in_three = roster[0], roster[1], roster[2]
    add_universe(conn, "First", [in_one, in_three])
    add_universe(conn, "Second", [in_three])
    add_universe(conn, "Third", [in_three])
    add_universe(conn, "Retired holdings", retired)
    memberships: dict[int, int] = dict(
        conn.execute(
            "SELECT instrument_id, count(DISTINCT universe_id) FROM universe_event "
            "WHERE event_type = 'member_added' GROUP BY instrument_id"
        ).fetchall()
    )
    conn.commit()
    assert memberships == {in_one: 1, in_three: 3, retired[0]: 1}  # in_none is in none

    _, second_set = add_terminal_run_and_set(conn)
    add_roster_inputs(conn, second_set, roster)  # the same values as the first set
    assert run_classification_build(conn, second_set, monkeypatch).state == "complete"

    def outcome(set_id: UUID) -> dict[tuple[int, str], tuple[Any, ...]]:
        return {
            key: (r["status"], r["score"], r["percentile"], r["reason_code"], r["reason_input"])
            for key, r in classifications_for(conn, set_id).items()
        }

    before, after = outcome(store.set_id), outcome(second_set)
    assert len(before) == 3 * 33
    assert after == before
    for stock in (in_none, in_one, in_three):
        for factor in FACTORS:
            assert before[(stock, factor)][0] == "classified"
            assert after[(stock, factor)] == before[(stock, factor)]


# Implements TC-COMP-107
@pytest.mark.parametrize("qualifying", [29, 30])
def test_a_factor_ranks_only_from_thirty_qualifying_stocks(
    store: Store, monkeypatch: pytest.MonkeyPatch, qualifying: int
) -> None:
    conn, set_id = store.conn, store.set_id
    roster, _ = add_full_roster(conn, set_id, qualifying)
    outdated = []
    for i in range(35 - qualifying):
        stock = add_active_stock(conn, f"OUT{i}")
        add_factor_inputs(conn, set_id, stock, "value", statuses={"fcf_yield": "outdated"})
        add_factor_inputs(conn, set_id, stock, "growth")
        add_factor_inputs(conn, set_id, stock, "momentum")
        outdated.append(stock)

    result = run_classification_build(conn, set_id, monkeypatch)

    assert result.state == "complete"
    assert result.qualified_counts == {"value": qualifying, "growth": 35, "momentum": 35}
    counts = factor_counts_for(conn, set_id)
    assert counts["growth"] == (35, True)
    assert counts["momentum"] == (35, True)
    rows = classifications_for(conn, set_id)
    value_rows = {stock: row for (stock, factor), row in rows.items() if factor == "value"}
    assert len(value_rows) == 35
    if qualifying < constants.MIN_PEER_SET_SIZE:
        assert counts["value"] == (29, False)
        for row in value_rows.values():  # the six outdated stocks too: the unranked reason wins
            assert reason(row) == (
                "not_classified",
                "not_enough_stocks",
                None,
                "29 of 30 stocks qualified",
                None,
                None,
            )
    else:
        assert counts["value"] == (30, True)
        assert sorted(s for s, r in value_rows.items() if r["status"] == "classified") == roster
        for stock in outdated:
            assert reason(value_rows[stock]) == (
                "not_classified",
                "input_outdated",
                "fcf_yield",
                "free-cash-flow yield outdated",
                None,
                None,
            )
        assert_factor_matches_reference(conn, set_id, rows, "value", roster)
    for factor in ("growth", "momentum"):
        assert_factor_matches_reference(conn, set_id, rows, factor, [*roster, *outdated])


# Implements TC-COMP-111
def test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn, set_id = store.conn, store.set_id
    roster, (r1, r2) = add_full_roster(conn, set_id, 31, n_retired=2)
    for factor in FACTORS:  # R2's present rows prove the exclusion does not rest on absence
        add_factor_inputs(conn, set_id, r2, factor)
    assert (input_row_count(conn, r1), input_row_count(conn, r2)) == (0, 8)

    result = run_classification_build(conn, set_id, monkeypatch)

    assert result.state == "complete"
    assert factor_counts_for(conn, set_id) == {factor: (31, True) for factor in FACTORS}
    rows = classifications_for(conn, set_id)
    for factor in FACTORS:
        assert_factor_matches_reference(conn, set_id, rows, factor, roster)
    for stock in (r1, r2):
        assert {f: reason(r) for (i, f), r in rows.items() if i == stock} == {
            factor: ("not_classified", "retired", None, None, None, None) for factor in FACTORS
        }
    # The stage writes no factor_input row.
    assert (input_row_count(conn, r1), input_row_count(conn, r2)) == (0, 8)


# Implements TC-COMP-095
def test_a_not_computable_input_is_named_as_the_reason(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn, set_id = store.conn, store.set_id
    roster, _ = add_full_roster(conn, set_id, 30)
    p = add_active_stock(conn, "P")
    add_factor_inputs(conn, set_id, p, "value")
    add_factor_inputs(conn, set_id, p, "growth", statuses={"eps_growth": "not_computable"})
    add_factor_inputs(conn, set_id, p, "momentum")

    assert run_classification_build(conn, set_id, monkeypatch).state == "complete"

    assert factor_counts_for(conn, set_id) == {
        "value": (31, True),
        "growth": (30, True),
        "momentum": (31, True),
    }
    rows = classifications_for(conn, set_id)
    assert reason(rows[(p, "growth")]) == (
        "not_classified",
        "input_not_computable",
        "eps_growth",
        "earnings-per-share growth not computable",
        None,
        None,
    )
    assert rows[(p, "value")]["status"] == "classified"
    assert rows[(p, "momentum")]["status"] == "classified"
    assert_factor_matches_reference(conn, set_id, rows, "growth", roster)


def test_classified_rows_carry_the_reference_scores_over_the_full_percentile_range(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-9: every classified row has a score and a percentile in 0 to 100, the lowest 0 and
    the highest 100, equal to the oracle's to 6 decimals, and no reason."""
    conn, set_id = store.conn, store.set_id
    roster, _ = add_full_roster(conn, set_id, 31)

    assert run_classification_build(conn, set_id, monkeypatch).state == "complete"

    rows = classifications_for(conn, set_id)
    assert len(rows) == 3 * 31
    for factor in FACTORS:
        assert_factor_matches_reference(conn, set_id, rows, factor, roster)
        percentiles = [r["percentile"] for (_, f), r in rows.items() if f == factor]
        assert all(0 <= p <= 100 for p in percentiles)
        assert (min(percentiles), max(percentiles)) == (0, 100)
    for row in rows.values():
        assert row["status"] == "classified"
        assert (row["reason_code"], row["reason_input"], row["reason_detail"]) == (None,) * 3


def test_the_reason_is_the_first_input_not_present_in_factor_order(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-12, DEC-0120: an input with no row counts as missing and is named, and the reason
    is the first input that is not present in the factor's input order, not the most severe."""
    conn, set_id = store.conn, store.set_id
    add_full_roster(conn, set_id, 30)
    absent = add_active_stock(conn, "ABSENT")
    add_factor_inputs(conn, set_id, absent, "value", omit=("earnings_yield",))
    computable = add_active_stock(conn, "NOTCOMP")
    add_factor_inputs(
        conn,
        set_id,
        computable,
        "value",
        statuses={"earnings_yield": "not_computable", "fcf_yield": "missing"},
    )
    stale = add_active_stock(conn, "STALE")
    add_factor_inputs(
        conn, set_id, stale, "value", statuses={"book_to_price": "outdated", "fcf_yield": "missing"}
    )

    assert run_classification_build(conn, set_id, monkeypatch).state == "complete"

    rows = classifications_for(conn, set_id)
    assert factor_counts_for(conn, set_id)["value"] == (30, True)
    assert reason(rows[(absent, "value")]) == (
        "not_classified",
        "input_missing",
        "earnings_yield",
        "earnings yield missing",
        None,
        None,
    )
    assert reason(rows[(computable, "value")]) == (
        "not_classified",
        "input_not_computable",
        "earnings_yield",
        "earnings yield not computable",
        None,
        None,
    )
    assert reason(rows[(stale, "value")]) == (
        "not_classified",
        "input_outdated",
        "book_to_price",
        "book-to-price outdated",
        None,
        None,
    )


def test_an_earlier_sets_inputs_enter_no_statistic_of_a_later_set(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0119: both statements read only the build's own set of ``factor_input`` rows."""
    conn, first_set = store.conn, store.set_id
    roster = [add_active_stock(conn, f"S{i:03d}") for i in range(31)]
    for i, stock in enumerate(roster):  # very different values, reversed in order
        for factor in FACTORS:
            names = constants.INPUT_NAMES[factor]
            values = {name: Decimal(10_000 * (31 - i) + k) for k, name in enumerate(names)}
            statuses = {"fcf_yield": "outdated"} if factor == "value" and i == 0 else {}
            add_factor_inputs(conn, first_set, stock, factor, statuses=statuses, values=values)
    assert run_classification_build(conn, first_set, monkeypatch).state == "complete"

    _, second_set = add_terminal_run_and_set(conn)
    add_roster_inputs(conn, second_set, roster[:30])
    add_factor_inputs(conn, second_set, roster[30], "value", statuses={"fcf_yield": "missing"})
    add_factor_inputs(conn, second_set, roster[30], "growth")
    add_factor_inputs(conn, second_set, roster[30], "momentum")
    result = run_classification_build(conn, second_set, monkeypatch)

    assert result.state == "complete"
    assert factor_counts_for(conn, second_set) == {
        "value": (30, True),
        "growth": (31, True),
        "momentum": (31, True),
    }
    rows = classifications_for(conn, second_set)
    assert len(rows) == 3 * 31
    assert rows[(roster[0], "value")]["status"] == "classified"  # outdated only in the first set
    assert rows[(roster[30], "value")]["reason_code"] == "input_missing"
    assert_factor_matches_reference(conn, second_set, rows, "value", roster[:30])
    for factor in ("growth", "momentum"):
        assert_factor_matches_reference(conn, second_set, rows, factor, roster)


def test_a_stock_outside_the_active_roster_is_ignored(store: Store) -> None:
    """DEC-0119: the peer set is the roster passed in ``active_ids``, even for a stock whose
    lifecycle is active and whose inputs are all present."""
    conn, set_id = store.conn, store.set_id
    roster, _ = add_full_roster(conn, set_id, 31)
    inside, outsider = roster[:30], roster[30]

    engine._classification_stage(conn, make_context(set_id, store.run_id, inside, ()))
    rows = classifications_for(conn, set_id)

    assert factor_counts_for(conn, set_id) == {factor: (30, True) for factor in FACTORS}
    assert len(rows) == 3 * 30
    assert all(stock != outsider for stock, _ in rows)
    for factor in FACTORS:
        assert_factor_matches_reference(conn, set_id, rows, factor, inside)


def test_every_instrument_gets_one_unmarked_row_per_factor_and_every_factor_a_count(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-14, AC-15, DEC-0121: every active and retired instrument has exactly one row per
    factor and no other instrument has any; no row is marked restated (CAP-002-E2-S6's mark);
    a factor no stock qualifies on still has its count, unranked, with '0 of 30'."""
    conn, set_id = store.conn, store.set_id
    active = [add_active_stock(conn, f"M{i:03d}") for i in range(31)]
    for stock in active[:30]:
        add_factor_inputs(conn, set_id, stock, "value")
    add_factor_inputs(conn, set_id, active[30], "value", statuses={"fcf_yield": "missing"})
    for stock in active:
        add_factor_inputs(conn, set_id, stock, "growth")  # no momentum row for anyone
    retired = [add_instrument(conn, f"OLD{i}", "retired") for i in range(2)]

    result = run_classification_build(conn, set_id, monkeypatch)

    assert result.state == "complete"
    assert result.qualified_counts == {"value": 30, "growth": 31, "momentum": 0}
    assert factor_counts_for(conn, set_id) == {
        "value": (30, True),
        "growth": (31, True),
        "momentum": (0, False),
    }
    rows = classifications_for(conn, set_id)
    assert sorted(rows) == sorted((s, f) for s in [*active, *retired] for f in FACTORS)
    assert {(r["status"], r["reason_code"]) for r in rows.values()} == {
        ("classified", None),
        ("not_classified", "input_missing"),
        ("not_classified", "not_enough_stocks"),
        ("not_classified", "retired"),
    }
    assert all(row["restated_possible"] is False for row in rows.values())
    for stock in active:
        assert reason(rows[(stock, "momentum")]) == (
            "not_classified",
            "not_enough_stocks",
            None,
            "0 of 30 stocks qualified",
            None,
            None,
        )


def test_the_unranked_reason_states_the_floor_in_force(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0120: the floor in ``reason_detail`` is ``constants.MIN_PEER_SET_SIZE``, read when
    the stage runs, as is the floor ``ranked`` is judged against (AC-14)."""
    conn, set_id = store.conn, store.set_id
    add_full_roster(conn, set_id, 31)
    monkeypatch.setattr(constants, "MIN_PEER_SET_SIZE", 32)

    assert run_classification_build(conn, set_id, monkeypatch).state == "complete"

    assert factor_counts_for(conn, set_id) == {factor: (31, False) for factor in FACTORS}
    rows = classifications_for(conn, set_id)
    assert len(rows) == 3 * 31
    assert {row["reason_detail"] for row in rows.values()} == {"31 of 32 stocks qualified"}
