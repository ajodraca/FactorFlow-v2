"""Momentum inputs with split and dividend adjustment (CAP-002-E2-S4).

Satisfies AC-7, AC-13, DAC-E2-1, DAC-E2-6 and DAC-E2-S4-1 to DAC-E2-S4-5 (factor-engine
design 2.4; DEC-0055 (3), (4), (5), (7); DEC-0116; DEC-0117; DEC-0118). E is the stock's
latest bar on or before the classification date minus one month and S_k its latest bar on
or before E minus k months. Bars are stored unadjusted (DEC-0001): splits in (S_k, E] scale
earlier prices by split_from / split_to and each dividend in the window compounds the return
factor by 1 + cash_amount x split factor / prior adjusted close. The momentum price-currency
case (TC-COMP-102) lives here, as the story's Technical Details place it.

Expected returns are computed from the closes with ``Decimal`` and compared to 8 decimal
places; the stored column is ``numeric(30,10)``.
"""

from collections.abc import Iterator
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import constants, engine, line_items
from tests.integration.engine_inputs_support import add_quarters, install_test_line_items
from tests.integration.engine_momentum_support import (
    add_bar_observed,
    add_building_set,
    add_close_series,
    add_corporate_action,
    add_instrument,
    add_run,
    inputs_for,
    migrate_through_classification,
    momentum_fixture_dates,
    run_momentum_stages,
)

pytestmark = pytest.mark.postgres

D = date(2026, 10, 17)
L = date(2026, 10, 16)
TARGETS = momentum_fixture_dates()
E, S3, S6, S12 = TARGETS["E"], TARGETS["S_3"], TARGETS["S_6"], TARGETS["S_12"]
MOMENTUM = constants.INPUT_NAMES["momentum"]
WINDOW = {"return_3m": 3, "return_6m": 6, "return_12m": 12}
START = {"return_3m": S3, "return_6m": S6, "return_12m": S12}
STANDARD: dict[date, Decimal | int] = {S12: 50, S6: 80, S3: 100, E: 120, L: 130}
"""Bars on every boundary target and the latest trading day: returns 1.4, 0.5 and 0.2."""

SPLIT_2_FOR_1 = {"split_from": "1", "split_to": "2"}
TOLERANCE = Decimal("1e-8")


@dataclass(frozen=True)
class Env:
    conn: psycopg.Connection
    stock: int
    set_id: UUID
    latest_trading_day: date


@pytest.fixture
def classification_date() -> date:
    return D


@pytest.fixture
def env(postgres_connection_string: str, classification_date: date) -> Iterator[Env]:
    """The stock under test and an anchor stock whose one bar, the day before the
    classification date, makes that day the latest trading day held."""
    latest = classification_date - timedelta(days=1)
    conn = migrate_through_classification(postgres_connection_string)
    try:
        stock = add_instrument(conn, "AAA")
        anchor = add_instrument(conn, "ANCH")
        add_bar_observed(conn, anchor, latest, 10)
        set_id = add_building_set(conn, add_run(conn), classification_date)
        yield Env(conn, stock, set_id, latest)
    finally:
        conn.close()


def ret(end: Decimal | int, start: Decimal | int, *dividend_factors: Decimal) -> Decimal:
    """The total return over a window: end over start, times each dividend factor, less 1."""
    factor = Decimal(end) / Decimal(start)
    for dividend in dividend_factors:
        factor *= dividend
    return factor - 1


def assert_close(actual: Decimal | None, expected: Decimal) -> None:
    assert actual is not None
    assert abs(actual - expected) <= TOLERANCE, (actual, expected)


def momentum(conn: psycopg.Connection, set_id: UUID, instrument_id: int) -> dict[str, dict]:
    rows = inputs_for(conn, set_id, instrument_id)
    return {name: row for name, row in rows.items() if row["factor"] == "momentum"}


def build(env: Env, monkeypatch: pytest.MonkeyPatch) -> dict[str, dict]:
    result = run_momentum_stages(env.conn, env.set_id, monkeypatch)
    assert result.state == "complete", result.failure_reason
    return momentum(env.conn, env.set_id, env.stock)


def bar(session_date: date, close: Decimal | int, observed_on: date | None = None) -> dict:
    """A bar as ``detail`` records it."""
    return {
        "session_date": str(session_date),
        "close": close,
        "observed_on": str(session_date if observed_on is None else observed_on),
    }


def assert_momentum_invariants(conn: psycopg.Connection, set_id: UUID) -> None:
    """T018, DEC-0118 (4), DAC-E2-S6-2: no momentum input is ever not_computable or marked."""
    row = conn.execute(
        "SELECT count(*) FILTER (WHERE status = 'not_computable'), "
        "count(*) FILTER (WHERE restated_possible) "
        "FROM factor_input WHERE set_id = %s AND factor = 'momentum'",
        (set_id,),
    ).fetchone()
    conn.commit()
    assert row == (0, 0)


# --- T004: window boundaries (TC-COMP-063) ----------------------------------------------------


# Implements TC-COMP-063
def test_a_missing_12_month_price_makes_only_return_12m_missing(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    add_close_series(env.conn, env.stock, {S6: 80, S3: 100, E: 120, L: 130})

    rows = build(env, monkeypatch)

    assert rows["return_12m"]["status"] == "missing"
    assert rows["return_12m"]["value"] is None
    assert rows["return_12m"]["as_of"] == E
    # DEC-0242: a missing input has no known_on, although its E bar was read.
    assert rows["return_12m"]["known_on"] is None
    assert rows["return_12m"]["detail"] == {
        "boundary": "S_12",
        "on_or_before": str(S12),
        "window_months": 12,
        "E": bar(E, 120),
    }
    for name, expected in (("return_3m", ret(120, 100)), ("return_6m", ret(120, 80))):
        assert rows[name]["status"] == "present", name
        assert_close(rows[name]["value"], expected)
        assert rows[name]["as_of"] == E
        # DEC-0118 (1): the E and S_k bars, not the latest bar held (observed on L).
        assert rows[name]["known_on"] == E


def test_every_window_is_present_with_bars_on_every_boundary(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-7, DEC-0055 (3), (4): three returns over (S_k, E], with E, S_k and both closes in
    detail and no adjustment when the window holds no corporate action."""
    add_close_series(env.conn, env.stock, STANDARD)

    rows = build(env, monkeypatch)

    expected = {"return_3m": ret(120, 100), "return_6m": ret(120, 80), "return_12m": ret(120, 50)}
    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name
        assert_close(rows[name]["value"], expected[name])
        start = START[name]
        assert rows[name]["detail"] == {
            "window_months": WINDOW[name],
            "E": bar(E, 120),
            "S": bar(start, STANDARD[start]),
            "adjusted_close": {"E": 120, "S": STANDARD[start]},
            "splits": [],
            "dividends": [],
        }, name


def test_boundaries_resolve_to_the_latest_bar_on_or_before_each_target(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (3), DAC-E2-1: E is the latest bar on or before D minus one month, S_k the
    latest on or before the resolved E (not E's target) minus k months; a bar after a target
    is never chosen."""
    e = date(2026, 9, 15)  # no bar on 09-16 or 09-17, so E is 09-15 and S_k targets the 15th
    add_close_series(
        env.conn,
        env.stock,
        {
            date(2025, 9, 12): 40,
            date(2025, 9, 16): 1,  # after S_12's target 2025-09-15, before E's target minus 12
            date(2026, 3, 13): 60,
            date(2026, 3, 16): 1,
            date(2026, 6, 12): 80,
            date(2026, 6, 17): 1,  # on E's target minus 3 months, after the resolved one
            e: 100,
            date(2026, 9, 18): 1,  # after E's target
            L: 110,
        },
    )

    rows = build(env, monkeypatch)

    resolved = {
        "return_3m": (date(2026, 6, 12), 80),
        "return_6m": (date(2026, 3, 13), 60),
        "return_12m": (date(2025, 9, 12), 40),
    }
    for name, (start, close) in resolved.items():
        assert rows[name]["status"] == "present", name
        assert_close(rows[name]["value"], ret(100, close))
        assert rows[name]["as_of"] == e
        assert rows[name]["detail"]["E"] == bar(e, 100), name
        assert rows[name]["detail"]["S"] == bar(start, close), name


def test_a_bar_on_the_target_date_is_chosen_over_an_earlier_one(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (3): "on or before" includes the target date itself."""
    day = timedelta(days=1)
    earlier: dict[date, Decimal | int] = {target - day: 1 for target in (S12, S6, S3, E)}
    add_close_series(env.conn, env.stock, earlier | STANDARD)

    rows = build(env, monkeypatch)

    assert_close(rows["return_3m"]["value"], ret(120, 100))
    assert_close(rows["return_6m"]["value"], ret(120, 80))
    assert_close(rows["return_12m"]["value"], ret(120, 50))
    for name in MOMENTUM:
        assert rows[name]["detail"]["S"]["session_date"] == str(START[name])
        assert rows[name]["detail"]["E"]["session_date"] == str(E)


@pytest.mark.parametrize("classification_date", [date(2026, 3, 31)])
def test_one_month_before_a_month_end_is_the_shorter_month_end(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.4 (PostgreSQL interval arithmetic), DEC-0055 (3): 2026-03-31 minus one month
    is 2026-02-28, and 2026-02-28 minus 3, 6 and 12 months the 28th of those months."""
    e = date(2026, 2, 28)
    add_close_series(
        env.conn,
        env.stock,
        {
            date(2025, 2, 28): 50,
            date(2025, 3, 1): 1,
            date(2025, 8, 28): 80,
            date(2025, 8, 31): 1,
            date(2025, 11, 28): 100,
            date(2025, 11, 30): 1,  # E minus 90 days
            date(2026, 2, 27): 1,
            e: 120,
            date(2026, 3, 1): 1,  # D minus 30 days
            env.latest_trading_day: 130,
        },
    )

    rows = build(env, monkeypatch)

    starts = {
        "return_3m": date(2025, 11, 28),
        "return_6m": date(2025, 8, 28),
        "return_12m": date(2025, 2, 28),
    }
    assert_close(rows["return_3m"]["value"], ret(120, 100))
    assert_close(rows["return_6m"]["value"], ret(120, 80))
    assert_close(rows["return_12m"]["value"], ret(120, 50))
    for name in MOMENTUM:
        assert rows[name]["as_of"] == e
        assert rows[name]["detail"]["S"]["session_date"] == str(starts[name])


def test_a_stock_with_no_bar_on_or_before_e_has_every_momentum_input_missing(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (3), DEC-0118 (4): no bar on or before E's target leaves every window
    without an end; nothing is dated."""
    add_close_series(env.conn, env.stock, {date(2026, 9, 20): 100, L: 110})

    rows = build(env, monkeypatch)

    assert set(rows) == set(MOMENTUM)
    for name in MOMENTUM:
        assert rows[name]["status"] == "missing", name
        assert rows[name]["value"] is None
        assert rows[name]["as_of"] is None
        assert rows[name]["known_on"] is None
        assert rows[name]["detail"] == {
            "boundary": "E",
            "on_or_before": str(E),
            "window_months": WINDOW[name],
        }


# --- T005: splits (TC-COMP-064) ---------------------------------------------------------------


# Implements TC-COMP-064
@pytest.mark.parametrize(
    "split",
    [SPLIT_2_FOR_1, {"split_from": 1, "split_to": 2}],
    ids=["json-strings", "json-numbers"],
)
def test_a_2_for_1_split_inside_the_window_leaves_the_return_unchanged(
    env: Env, monkeypatch: pytest.MonkeyPatch, split: dict[str, Any]
) -> None:
    twin = add_instrument(env.conn, "TWIN")
    split_on = date(2026, 7, 1)
    pre: dict[date, Decimal | int] = {S12: 80, S6: 90, S3: 100, date(2026, 6, 30): 100}
    post: dict[date, Decimal | int] = {split_on: 50, E: 55, L: 56}
    add_close_series(env.conn, env.stock, pre | post)
    add_close_series(env.conn, twin, {d: Decimal(c) / 2 for d, c in pre.items()} | post)
    add_corporate_action(env.conn, env.stock, "split", split_on, split)

    rows = build(env, monkeypatch)
    twin_rows = momentum(env.conn, env.set_id, twin)

    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name
        assert rows[name]["value"] == twin_rows[name]["value"], name
        assert twin_rows[name]["detail"]["splits"] == []
    assert_close(rows["return_3m"]["value"], ret(55, 50))
    detail = rows["return_3m"]["detail"]
    assert detail["splits"] == [
        {"effective_on": "2026-07-01", "split_from": 1, "split_to": 2, "observed_on": "2026-07-01"}
    ]
    assert detail["E"] == bar(E, 55)
    assert detail["S"] == bar(S3, 100)
    assert detail["adjusted_close"]["E"] == 55
    assert_close(detail["adjusted_close"]["S"], Decimal(50))


def test_a_split_outside_the_window_is_not_applied(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (4), DAC-E2-1: a split before S_k or after E adjusts nothing in that window."""
    add_close_series(
        env.conn,
        env.stock,
        {
            S12: 100,
            S6: 100,
            date(2026, 4, 30): 100,
            date(2026, 5, 1): 50,
            S3: 50,
            E: 60,
            date(2026, 9, 21): 30,
            L: 31,
        },
    )
    add_corporate_action(env.conn, env.stock, "split", date(2026, 5, 1), SPLIT_2_FOR_1)
    add_corporate_action(env.conn, env.stock, "split", date(2026, 9, 21), SPLIT_2_FOR_1)

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert_close(rows[name]["value"], ret(60, 50))
    assert rows["return_3m"]["detail"]["splits"] == []
    for name in ("return_6m", "return_12m"):
        assert [s["effective_on"] for s in rows[name]["detail"]["splits"]] == ["2026-05-01"]


def test_a_split_on_s_k_is_outside_the_window(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0055 (4): the window is (S_k, E], so a split effective on S_k's own session (whose
    close is already post-split) is not applied to it; the longer windows contain it."""
    add_close_series(env.conn, env.stock, {S12: 200, S6: 200, S3: 100, E: 120, L: 120})
    add_corporate_action(env.conn, env.stock, "split", S3, SPLIT_2_FOR_1)

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert_close(rows[name]["value"], ret(120, 100))
    assert rows["return_3m"]["detail"]["splits"] == []
    assert len(rows["return_6m"]["detail"]["splits"]) == 1


def test_a_split_on_e_is_inside_the_window(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0055 (4): the window is (S_k, E], so a split effective on E adjusts every earlier
    price."""
    add_close_series(env.conn, env.stock, {S12: 100, S6: 100, S3: 100, E: 60, L: 60})
    add_corporate_action(env.conn, env.stock, "split", E, SPLIT_2_FOR_1)

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert_close(rows[name]["value"], ret(60, 50))


def test_a_reverse_split_doubles_earlier_prices(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0055 (4): prices before the split are scaled by split_from / split_to = 2."""
    add_close_series(
        env.conn, env.stock, {S12: 10, S6: 10, S3: 10, date(2026, 7, 1): 20, E: 25, L: 25}
    )
    add_corporate_action(
        env.conn, env.stock, "split", date(2026, 7, 1), {"split_from": "2", "split_to": "1"}
    )

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert_close(rows[name]["value"], ret(25, 20))
        assert_close(rows[name]["detail"]["adjusted_close"]["S"], Decimal(20))


def test_two_splits_in_one_window_compound(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0055 (4), design 2.4: the factor is the product over every split after the bar."""
    add_close_series(
        env.conn,
        env.stock,
        {S12: 600, S6: 600, S3: 600, date(2026, 7, 1): 300, date(2026, 8, 3): 100, E: 110, L: 110},
    )
    add_corporate_action(env.conn, env.stock, "split", date(2026, 7, 1), SPLIT_2_FOR_1)
    add_corporate_action(
        env.conn, env.stock, "split", date(2026, 8, 3), {"split_from": "1", "split_to": "3"}
    )

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert_close(rows[name]["value"], ret(110, 100))
        assert [s["effective_on"] for s in rows[name]["detail"]["splits"]] == [
            "2026-07-01",
            "2026-08-03",
        ]


def test_plain_decimal_strings_with_zeros_are_read(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0117 (2): a JSON string holding a plain decimal is read whatever its digits, with a
    zero or a digit above 1 in the integer or the fractional part (10.250 for 20.50 is a
    2-for-1 split)."""
    add_close_series(
        env.conn,
        env.stock,
        {S12: 100, S6: 100, S3: 100, date(2026, 7, 1): 50, date(2026, 7, 31): 50, E: 55, L: 55},
    )
    add_corporate_action(
        env.conn,
        env.stock,
        "split",
        date(2026, 7, 1),
        {"split_from": "10.250", "split_to": "20.50"},
    )
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 3), {"cash_amount": "0.50"})

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name
        assert_close(rows[name]["value"], ret(55, 50, Decimal("1.01")))


# --- T006: dividends (TC-COMP-065) ------------------------------------------------------------


# Implements TC-COMP-065
@pytest.mark.parametrize(
    "dividend", [{"cash_amount": "1"}, {"cash_amount": 1}], ids=["json-string", "json-number"]
)
def test_a_dividend_of_1_on_a_prior_close_of_100_multiplies_the_factor_by_1_01(
    env: Env, monkeypatch: pytest.MonkeyPatch, dividend: dict[str, Any]
) -> None:
    ex_date = date(2026, 8, 3)
    add_close_series(
        env.conn,
        env.stock,
        {S12: 90, S6: 90, S3: 90, date(2026, 7, 31): 100, ex_date: 98, E: 99, L: 99},
    )
    add_corporate_action(env.conn, env.stock, "dividend", ex_date, dividend)

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name
        assert_close(rows[name]["value"], ret(99, 90, Decimal("1.01")))
    assert rows["return_3m"]["detail"]["dividends"] == [
        {
            "effective_on": "2026-08-03",
            "cash_amount": 1,
            "observed_on": "2026-08-03",
            "split_factor": 1,
            "prior_session": bar(date(2026, 7, 31), 100),
            "prior_adjusted_close": 100,
        }
    ]


def test_two_dividends_compound_against_their_own_prior_closes(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (4): each dividend compounds the factor against its own prior session."""
    add_close_series(
        env.conn,
        env.stock,
        {
            S12: 90,
            S6: 90,
            S3: 90,
            date(2026, 7, 14): 100,
            date(2026, 7, 15): 99,
            date(2026, 8, 13): 50,
            date(2026, 8, 14): 49,
            E: 99,
            L: 99,
        },
    )
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 7, 15), {"cash_amount": "1"})
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 14), {"cash_amount": "1"})

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert_close(rows[name]["value"], ret(99, 90, Decimal("1.01"), Decimal("1.02")))


def test_each_stock_is_adjusted_by_its_own_corporate_actions_and_prior_sessions(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (3), (4), DEC-0118 (3), design 2.4: two stocks over the same sessions are each
    adjusted by their own splits and dividends only, and each dividend's prior session is its
    own stock's latest bar before the ex-date, although the other stock holds a later bar
    before that date (review v1 IR-001)."""
    other = add_instrument(env.conn, "BBB")
    # AAA: a dividend of 1 on 08-03 over its prior session 07-30. BBB's 2-for-1 split and its
    # bar on 07-31 lie between them; AAA's bar on 08-13 lies between BBB's prior session and
    # BBB's ex-date.
    add_close_series(
        env.conn,
        env.stock,
        {
            S12: 90,
            S6: 90,
            S3: 90,
            date(2026, 7, 30): 100,
            date(2026, 8, 3): 98,
            date(2026, 8, 13): 50,
            E: 99,
            L: 99,
        },
    )
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 3), {"cash_amount": "1"})
    add_close_series(
        env.conn,
        other,
        {
            S12: 160,
            S6: 160,
            S3: 160,
            date(2026, 7, 30): 200,
            date(2026, 7, 31): 80,
            date(2026, 8, 12): 100,
            date(2026, 8, 14): 98,
            E: 110,
            L: 110,
        },
    )
    add_corporate_action(env.conn, other, "split", date(2026, 7, 31), SPLIT_2_FOR_1)
    add_corporate_action(env.conn, other, "dividend", date(2026, 8, 14), {"cash_amount": "2"})

    rows = build(env, monkeypatch)
    other_rows = momentum(env.conn, env.set_id, other)

    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name
        assert_close(rows[name]["value"], ret(99, 90, Decimal("1.01")))
        assert rows[name]["detail"]["splits"] == [], name
        assert rows[name]["detail"]["dividends"] == [
            {
                "effective_on": "2026-08-03",
                "cash_amount": 1,
                "observed_on": "2026-08-03",
                "split_factor": 1,
                "prior_session": bar(date(2026, 7, 30), 100),
                "prior_adjusted_close": 100,
            }
        ], name
        # BBB adjusted: S close 160 halved to 80, prior close 100, so the factor is 1 + 2 / 100.
        assert other_rows[name]["status"] == "present", name
        assert_close(other_rows[name]["value"], ret(110, 80, Decimal("1.02")))
        assert other_rows[name]["detail"]["splits"] == [
            {
                "effective_on": "2026-07-31",
                "split_from": 1,
                "split_to": 2,
                "observed_on": "2026-07-31",
            }
        ], name
        assert other_rows[name]["detail"]["dividends"] == [
            {
                "effective_on": "2026-08-14",
                "cash_amount": 2,
                "observed_on": "2026-08-14",
                "split_factor": 1,
                "prior_session": bar(date(2026, 8, 12), 100),
                "prior_adjusted_close": 100,
            }
        ], name


def test_a_dividend_outside_the_window_is_not_applied(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (4): the window is (S_k, E]: a dividend on S_3's session or after E is not
    applied to return_3m; the one on S_3 lies inside the longer windows."""
    add_close_series(
        env.conn,
        env.stock,
        {S12: 90, S6: 90, date(2026, 6, 16): 100, S3: 90, E: 99, date(2026, 9, 19): 99, L: 99},
    )
    add_corporate_action(env.conn, env.stock, "dividend", S3, {"cash_amount": "5"})
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 9, 20), {"cash_amount": "5"})

    rows = build(env, monkeypatch)

    assert_close(rows["return_3m"]["value"], ret(99, 90))
    assert rows["return_3m"]["detail"]["dividends"] == []
    for name in ("return_6m", "return_12m"):
        assert_close(rows[name]["value"], ret(99, 90, Decimal("1.05")))
        assert [d["effective_on"] for d in rows[name]["detail"]["dividends"]] == [str(S3)]


def test_a_zero_dividend_leaves_the_factor_at_1(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0117 (2): a cash_amount of 0 is usable and multiplies the factor by 1."""
    add_close_series(env.conn, env.stock, STANDARD | {date(2026, 7, 31): 110})
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 3), {"cash_amount": "0"})

    rows = build(env, monkeypatch)

    assert rows["return_3m"]["status"] == "present"
    assert_close(rows["return_3m"]["value"], ret(120, 100))
    assert len(rows["return_3m"]["detail"]["dividends"]) == 1


def test_a_dividend_before_a_later_split_is_scaled_by_that_split(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0118 (2), design 2.4: the cash amount is scaled by the splits strictly after the
    ex-date, as its prior close is."""
    add_close_series(
        env.conn,
        env.stock,
        {
            S12: 90,
            S6: 90,
            S3: 90,
            date(2026, 7, 14): 100,
            date(2026, 7, 15): 98,
            date(2026, 8, 3): 50,
            E: 55,
            L: 55,
        },
    )
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 7, 15), {"cash_amount": "2"})
    add_corporate_action(env.conn, env.stock, "split", date(2026, 8, 3), SPLIT_2_FOR_1)

    rows = build(env, monkeypatch)

    # Adjusted: S close 45, prior close 50, cash 1, so the factor is 1 + 1 / 50.
    for name in MOMENTUM:
        assert_close(rows[name]["value"], ret(55, 45, Decimal("1.02")))
    (dividend,) = rows["return_3m"]["detail"]["dividends"]
    assert_close(dividend["split_factor"], Decimal("0.5"))
    assert_close(dividend["prior_adjusted_close"], Decimal(50))


def test_a_split_on_the_ex_date_does_not_scale_the_cash_amount(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0118 (2): a split effective on the ex-date scales the prior session's close but
    not the cash amount, so the factor is 1 + 1 / 50, not 1 + 0.5 / 50."""
    ex_date = date(2026, 8, 3)
    add_close_series(
        env.conn,
        env.stock,
        {S12: 90, S6: 90, S3: 90, date(2026, 7, 31): 100, ex_date: 50, E: 55, L: 55},
    )
    add_corporate_action(env.conn, env.stock, "dividend", ex_date, {"cash_amount": "1"})
    add_corporate_action(env.conn, env.stock, "split", ex_date, SPLIT_2_FOR_1)

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert_close(rows[name]["value"], ret(55, 45, Decimal("1.02")))
    (dividend,) = rows["return_3m"]["detail"]["dividends"]
    assert dividend["split_factor"] == 1
    assert_close(dividend["prior_adjusted_close"], Decimal(50))


@pytest.mark.parametrize(
    ("split_on", "e_close", "expected", "factor"),
    [
        # On E: inside the window, so it scales the prior close (to 50) and the cash (to 0.5).
        (E, 55, ret(55, 45, Decimal("1.01")), Decimal("0.5")),
        # After E: outside every window, so it scales neither.
        (date(2026, 9, 21), 99, ret(99, 90, Decimal("1.01")), Decimal(1)),
    ],
    ids=["split-on-e", "split-after-e"],
)
def test_a_dividends_split_factors_stop_at_e(
    env: Env,
    monkeypatch: pytest.MonkeyPatch,
    split_on: date,
    e_close: int,
    expected: Decimal,
    factor: Decimal,
) -> None:
    """Design 2.4, DEC-0118 (2): a dividend's prior close and cash amount are scaled by the
    splits after them and on or before E, never by one after E."""
    add_close_series(
        env.conn,
        env.stock,
        {S12: 90, S6: 90, S3: 90, date(2026, 7, 31): 100, E: e_close, date(2026, 9, 22): 50, L: 50},
    )
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 3), {"cash_amount": "1"})
    add_corporate_action(env.conn, env.stock, "split", split_on, SPLIT_2_FOR_1)

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert_close(rows[name]["value"], expected)
        (dividend,) = rows[name]["detail"]["dividends"]
        assert_close(dividend["split_factor"], factor)
        assert_close(dividend["prior_adjusted_close"], 100 * factor)


def test_a_dividends_split_factors_are_the_product_of_every_later_split(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.4, DEC-0118 (2): a dividend followed by several splits has its prior close
    scaled by the product of every split after its prior session, and its cash amount by the
    product of every split strictly after its ex-date, each on or before E (review v1 IR-003)."""
    ex_date = date(2026, 8, 3)
    add_close_series(
        env.conn,
        env.stock,
        {
            S12: 1200,
            S6: 1200,
            S3: 1200,
            date(2026, 7, 31): 1200,
            ex_date: 600,
            date(2026, 8, 20): 200,
            date(2026, 9, 1): 100,
            E: 110,
            L: 110,
        },
    )
    add_corporate_action(env.conn, env.stock, "dividend", ex_date, {"cash_amount": "6"})
    add_corporate_action(env.conn, env.stock, "split", ex_date, SPLIT_2_FOR_1)
    add_corporate_action(
        env.conn, env.stock, "split", date(2026, 8, 20), {"split_from": "1", "split_to": "3"}
    )
    add_corporate_action(env.conn, env.stock, "split", date(2026, 9, 1), SPLIT_2_FOR_1)

    rows = build(env, monkeypatch)

    # Prior close 1200 x 1/2 x 1/3 x 1/2 = 100 and cash 6 x 1/3 x 1/2 = 1, so the factor is
    # 1 + 1 / 100; S close 1200 / 12 = 100.
    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name
        assert_close(rows[name]["value"], ret(110, 100, Decimal("1.01")))
        (dividend,) = rows[name]["detail"]["dividends"]
        assert_close(dividend["split_factor"], Decimal(1) / 6)
        assert_close(dividend["prior_adjusted_close"], Decimal(100))


def test_a_split_on_the_prior_session_does_not_scale_that_close(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.4, DEC-0055 (4), DEC-0118 (2): a split scales the prices before it, so a split
    effective on the dividend's prior session (whose close is already post-split) leaves that
    close unscaled."""
    prior = date(2026, 7, 31)
    add_close_series(env.conn, env.stock, {S12: 90, S6: 90, S3: 90, prior: 50, E: 55, L: 55})
    add_corporate_action(env.conn, env.stock, "split", prior, SPLIT_2_FOR_1)
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 3), {"cash_amount": "0.5"})

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert_close(rows[name]["value"], ret(55, 45, Decimal("1.01")))
    (dividend,) = rows["return_3m"]["detail"]["dividends"]
    assert dividend["prior_adjusted_close"] == 50


def test_ticker_changes_and_ipos_are_ignored(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0055 (4), DEC-0118 (1): only splits and dividends adjust a return or count towards
    known_on, whatever another action's payload carries; each is observed after E here."""
    later = date(2026, 10, 10)
    add_close_series(env.conn, env.stock, STANDARD)
    add_corporate_action(
        env.conn, env.stock, "ticker_change", date(2026, 7, 15), {"cash_amount": "5"}, later
    )
    add_corporate_action(env.conn, env.stock, "ipo", date(2026, 7, 20), SPLIT_2_FOR_1, later)
    add_corporate_action(
        env.conn, env.stock, "ticker_change", date(2026, 7, 25), {"ticker": "B"}, later
    )

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name
        assert rows[name]["known_on"] == E
        assert rows[name]["detail"]["splits"] == []
        assert rows[name]["detail"]["dividends"] == []
    assert_close(rows["return_3m"]["value"], ret(120, 100))


# --- T007: known_on (TC-COMP-066) -------------------------------------------------------------


# Implements TC-COMP-066
@pytest.mark.parametrize("latest", ["E bar", "S bar", "split", "dividend", "prior bar"])
def test_known_on_is_the_latest_observation_of_the_bars_and_actions_used(
    env: Env, monkeypatch: pytest.MonkeyPatch, latest: str
) -> None:
    observed = {
        "E bar": date(2026, 9, 18),
        "S bar": date(2026, 6, 18),
        "split": date(2026, 7, 2),
        "dividend": date(2026, 8, 4),
        "prior bar": date(2026, 8, 1),
    }
    observed[latest] = date(2026, 10, 5)
    split_on, prior, ex_date = date(2026, 7, 1), date(2026, 7, 31), date(2026, 8, 3)
    add_close_series(env.conn, env.stock, {S12: 90, S6: 90, L: 56})
    add_bar_observed(env.conn, env.stock, S3, 90, observed["S bar"])
    add_bar_observed(env.conn, env.stock, prior, 50, observed["prior bar"])
    add_bar_observed(env.conn, env.stock, E, 55, observed["E bar"])
    add_corporate_action(env.conn, env.stock, "split", split_on, SPLIT_2_FOR_1, observed["split"])
    add_corporate_action(
        env.conn, env.stock, "dividend", ex_date, {"cash_amount": "0.5"}, observed["dividend"]
    )
    # Rows that feed no 3-month figure, each observed later than every row used.
    add_bar_observed(env.conn, env.stock, date(2026, 8, 20), 52, date(2026, 10, 12))
    add_bar_observed(env.conn, env.stock, date(2026, 9, 25), 57, date(2026, 10, 13))
    add_corporate_action(
        env.conn, env.stock, "dividend", date(2026, 9, 21), {"cash_amount": "1"}, date(2026, 10, 14)
    )
    add_corporate_action(
        env.conn,
        env.stock,
        "split",
        date(2026, 5, 1),
        {"split_from": "1", "split_to": "1"},
        date(2026, 10, 15),
    )

    rows = build(env, monkeypatch)

    assert rows["return_3m"]["status"] == "present"
    assert rows["return_3m"]["known_on"] == date(2026, 10, 5)
    # DEC-0118 (1): the split before S_3 lies inside the longer windows, so it is used there.
    assert rows["return_6m"]["known_on"] == date(2026, 10, 15)
    assert rows["return_12m"]["known_on"] == date(2026, 10, 15)


@pytest.mark.parametrize("latest", ["earlier prior bar", "later prior bar"])
def test_known_on_covers_the_prior_session_of_every_dividend_in_the_window(
    env: Env, monkeypatch: pytest.MonkeyPatch, latest: str
) -> None:
    """DEC-0118 (1), DAC-E2-S4-4: with two dividends in the window, known_on covers each
    dividend's prior-session bar, so whichever of them was observed last dates the input
    (review v1 IR-002)."""
    earlier_prior, later_prior = date(2026, 7, 14), date(2026, 8, 13)
    observed = {"earlier prior bar": earlier_prior, "later prior bar": later_prior}
    observed[latest] = date(2026, 10, 5)
    add_close_series(
        env.conn,
        env.stock,
        {S12: 90, S6: 90, S3: 90, date(2026, 7, 15): 99, date(2026, 8, 14): 49, E: 99, L: 99},
    )
    add_bar_observed(env.conn, env.stock, earlier_prior, 100, observed["earlier prior bar"])
    add_bar_observed(env.conn, env.stock, later_prior, 50, observed["later prior bar"])
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 7, 15), {"cash_amount": "1"})
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 14), {"cash_amount": "1"})

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name
        assert_close(rows[name]["value"], ret(99, 90, Decimal("1.01"), Decimal("1.02")))
        assert rows[name]["known_on"] == date(2026, 10, 5), name


@pytest.mark.parametrize("latest", ["E bar", "S bar", "split", "dividend", "prior bar"])
def test_an_outdated_inputs_known_on_is_the_latest_observation_of_the_rows_used(
    env: Env, monkeypatch: pytest.MonkeyPatch, latest: str
) -> None:
    """DEC-0242, DEC-0118 (1), DAC-E2-S4-4: an outdated input keeps a present one's known_on,
    the latest observed_on over the rows it uses. Each row is observed on its own date except
    one, observed after E, so known_on is that observation, not the E session date (review v2
    IR-001)."""
    split_on, prior, ex_date = date(2026, 7, 1), date(2026, 7, 31), date(2026, 8, 3)
    observed = {"E bar": E, "S bar": S3, "split": split_on, "dividend": ex_date, "prior bar": prior}
    observed[latest] = date(2026, 10, 5)
    # The latest bar precedes the latest trading day, so the stock is stale. It judges currency
    # and feeds no figure, so its later observation does not move known_on.
    add_close_series(env.conn, env.stock, {S12: 90, S6: 90, date(2026, 10, 15): 56})
    add_bar_observed(env.conn, env.stock, S3, 90, observed["S bar"])
    add_bar_observed(env.conn, env.stock, prior, 50, observed["prior bar"])
    add_bar_observed(env.conn, env.stock, E, 55, observed["E bar"])
    add_corporate_action(env.conn, env.stock, "split", split_on, SPLIT_2_FOR_1, observed["split"])
    add_corporate_action(
        env.conn, env.stock, "dividend", ex_date, {"cash_amount": "0.5"}, observed["dividend"]
    )

    rows = build(env, monkeypatch)

    row = rows["return_3m"]
    assert row["status"] == "outdated"
    assert row["value"] is None
    assert row["as_of"] == E
    assert row["known_on"] == date(2026, 10, 5)


# --- T008: price currency (TC-COMP-102) -------------------------------------------------------


# Implements TC-COMP-102
def test_a_stale_latest_bar_makes_all_three_momentum_inputs_outdated(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    stale = add_instrument(env.conn, "STALE")
    stale_day = date(2026, 10, 15)
    add_close_series(env.conn, env.stock, STANDARD)
    add_close_series(env.conn, stale, {S12: 50, S6: 80, S3: 100, E: 120, stale_day: 130})

    rows = build(env, monkeypatch)
    stale_rows = momentum(env.conn, env.set_id, stale)

    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name
        row = stale_rows[name]
        assert row["status"] == "outdated", name
        assert row["value"] is None
        assert row["as_of"] == E
        assert row["known_on"] == E
        start = START[name]
        assert row["detail"] == {
            "cause": "outdated",
            "outdated": {"prices": {"bar_date": str(stale_day), "latest_trading_day": str(L)}},
            "window_months": WINDOW[name],
            "E": bar(E, 120),
            "S": bar(start, STANDARD[start]),
            "adjusted_close": {"E": 120, "S": STANDARD[start]},
            "splits": [],
            "dividends": [],
        }, name


def test_a_latest_bar_after_e_but_before_the_latest_trading_day_is_outdated(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (5), DAC-E2-6: currency is judged on the latest bar, not on E."""
    add_close_series(
        env.conn, env.stock, {S12: 50, S6: 80, S3: 100, E: 120, date(2026, 9, 30): 125}
    )

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert rows[name]["status"] == "outdated", name
        assert rows[name]["detail"]["outdated"]["prices"]["bar_date"] == "2026-09-30"


def test_a_retired_stocks_later_bar_does_not_move_the_latest_trading_day(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (5), AC-15: the latest trading day is held across active instruments only."""
    retired = add_instrument(env.conn, "GONE", "retired")
    add_bar_observed(env.conn, retired, D, 10)
    add_close_series(env.conn, env.stock, STANDARD)

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name


def test_momentum_currency_does_not_depend_on_fundamentals(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.4, AC-13: two stale stocks with the same bars have the same momentum inputs
    whether or not they hold statements, and the statements' own inputs are computed."""
    with_statements = add_instrument(env.conn, "FUND")
    bars: dict[date, Decimal | int] = {S12: 50, S6: 80, S3: 100, E: 120, date(2026, 10, 15): 130}
    add_close_series(env.conn, env.stock, bars)
    add_close_series(env.conn, with_statements, bars)
    quarter = {
        "book_equity": Decimal(500),
        "shares_outstanding": Decimal(100),
        "net_income": Decimal(10),
        "diluted_eps": Decimal(1),
        "revenue": Decimal(100),
        "operating_cash_flow": Decimal(30),
        "capital_expenditure": Decimal(-5),
    }
    add_quarters(env.conn, with_statements, date(2026, 9, 30), 8, [dict(quarter)] * 8)
    install_test_line_items(monkeypatch)

    rows = build(env, monkeypatch)
    fund = inputs_for(env.conn, env.set_id, with_statements)

    assert fund["revenue_growth"]["status"] == "present"
    for name in MOMENTUM:
        assert rows[name]["status"] == "outdated", name
        for key in ("status", "value", "as_of", "known_on", "detail"):
            assert fund[name][key] == rows[name][key], (name, key)


# --- T009: cases no mapped test case names ----------------------------------------------------


def test_a_missing_boundary_ranks_before_outdated(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0116 (1), DEC-0118 (4): a stale stock lacking the S_12 bar has return_12m missing
    and the other two outdated; a stock with no bar at all is missing on all three."""
    no_bars = add_instrument(env.conn, "NONE")
    add_close_series(env.conn, env.stock, {S6: 80, S3: 100, E: 120, date(2026, 10, 15): 130})

    rows = build(env, monkeypatch)
    none_rows = momentum(env.conn, env.set_id, no_bars)

    assert rows["return_12m"]["status"] == "missing"
    assert rows["return_12m"]["detail"]["boundary"] == "S_12"
    assert rows["return_3m"]["status"] == "outdated"
    assert rows["return_6m"]["status"] == "outdated"
    for name in MOMENTUM:
        assert none_rows[name]["status"] == "missing", name
        assert none_rows[name]["detail"]["boundary"] == "E"
    assert_momentum_invariants(env.conn, env.set_id)


def test_unresolved_line_items_leave_the_momentum_inputs_present(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Supporting case for TC-COMP-059 (AC-12, design 2.4): with the real LINE_ITEMS, every
    key REQUIRES_INPUT, value and growth are missing naming the cause, the three momentum
    inputs are present and the set completes. "Momentum still classifies" is CAP-002-E2-S7's."""
    add_close_series(env.conn, env.stock, STANDARD)

    result = run_momentum_stages(env.conn, env.set_id, monkeypatch)

    assert result.state == "complete", result.failure_reason
    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in (*constants.INPUT_NAMES["value"], *constants.INPUT_NAMES["growth"]):
        assert rows[name]["status"] == "missing", name
        assert rows[name]["detail"]["cause"] == line_items.UNRESOLVED_CAUSE
    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name


def test_every_active_stock_has_exactly_three_momentum_rows_and_a_retired_one_none(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-7, AC-15, DEC-0118 (4), DAC-E2-S6-2: three rows per active stock named for the
    momentum factor, never marked; a retired instrument gets no row."""
    retired = add_instrument(env.conn, "GONE", "retired")
    add_close_series(env.conn, retired, STANDARD)
    add_close_series(env.conn, env.stock, STANDARD)

    rows = build(env, monkeypatch)

    assert tuple(sorted(rows)) == tuple(sorted(MOMENTUM))
    for row in rows.values():
        assert row["factor"] == "momentum"
        assert row["restated_possible"] is False
    assert inputs_for(env.conn, env.set_id, retired) == {}
    count = env.conn.execute(
        "SELECT count(*) FROM factor_input WHERE set_id = %s AND factor = 'momentum'",
        (env.set_id,),
    ).fetchone()
    env.conn.commit()
    assert count == (2 * len(MOMENTUM),)  # the stock and the anchor
    assert_momentum_invariants(env.conn, env.set_id)


def test_a_missing_momentum_input_carries_the_last_prices_acquisition(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.3 step 5, AC-12, DEC-0115: a missing momentum input names the last prices
    outcome, not another data type's; a present one carries no acquisition."""
    acquired_at = datetime(2026, 10, 16, 21, tzinfo=UTC)
    for data_type, outcome in (("prices", "not_found"), ("corporate_actions", "written")):
        env.conn.execute(
            "INSERT INTO acquisition_state (instrument_id, data_type, last_acquired_at, "
            "last_run_id, last_outcome) VALUES (%s, %s, %s, gen_random_uuid(), %s)",
            (env.stock, data_type, acquired_at, outcome),
        )
    env.conn.commit()
    add_close_series(env.conn, env.stock, {S6: 80, S3: 100, E: 120, L: 130})

    rows = build(env, monkeypatch)

    last = rows["return_12m"]["detail"]["last_acquisition"]
    assert last["data_type"] == "prices"
    assert last["outcome"] == "not_found"
    assert datetime.fromisoformat(last["acquired_at"]) == acquired_at
    assert "last_acquisition" not in rows["return_3m"]["detail"]
    assert "last_acquisition" not in rows["return_6m"]["detail"]


ACQUIRED_AT = datetime(2026, 10, 16, 21, tzinfo=UTC)


def record_acquisitions(env: Env) -> None:
    """The stock under test's last prices and corporate_actions outcomes, each distinct."""
    for data_type, outcome in (("prices", "not_found"), ("corporate_actions", "failed")):
        env.conn.execute(
            "INSERT INTO acquisition_state (instrument_id, data_type, last_acquired_at, "
            "last_run_id, last_outcome) VALUES (%s, %s, %s, gen_random_uuid(), %s)",
            (env.stock, data_type, ACQUIRED_AT, outcome),
        )
    env.conn.commit()


def test_an_unusable_payload_names_the_corporate_actions_acquisition(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0243, design 2.3 step 5, AC-12: an input missing because a split or dividend in its
    window is unusable names the last corporate_actions outcome, not the prices one; the
    input whose window does not hold the action is present and names none."""
    record_acquisitions(env)
    add_close_series(env.conn, env.stock, STANDARD | {date(2026, 4, 30): 90})
    add_corporate_action(
        env.conn, env.stock, "split", date(2026, 5, 1), {"split_from": "1", "split_to": "0"}
    )

    rows = build(env, monkeypatch)

    assert rows["return_3m"]["status"] == "present"
    assert "last_acquisition" not in rows["return_3m"]["detail"]
    for name in ("return_6m", "return_12m"):
        detail = rows[name]["detail"]
        assert detail["cause"] == "corporate_action_payload_unusable", name
        assert detail["last_acquisition"]["data_type"] == "corporate_actions", name
        assert detail["last_acquisition"]["outcome"] == "failed", name
        assert datetime.fromisoformat(detail["last_acquisition"]["acquired_at"]) == ACQUIRED_AT


def test_a_re_acquired_bar_is_used_and_the_earlier_observation_is_untouched(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0117 (1), design 2.4, C5: the later observation of a session is used, and the
    earlier row stays in the store."""
    add_close_series(env.conn, env.stock, STANDARD)
    add_bar_observed(env.conn, env.stock, E, 150, date(2026, 9, 20))

    rows = build(env, monkeypatch)

    assert_close(rows["return_3m"]["value"], ret(150, 100))
    assert rows["return_3m"]["known_on"] == date(2026, 9, 20)
    held = env.conn.execute(
        "SELECT close_price, observed_on FROM daily_bar WHERE instrument_id = %s "
        "AND session_date = %s ORDER BY observed_on",
        (env.stock, E),
    ).fetchall()
    env.conn.commit()
    assert held == [(Decimal("120.000000"), E), (Decimal("150.000000"), date(2026, 9, 20))]


@pytest.mark.parametrize(
    ("revised", "close", "expected"),
    [
        (S3, 120, ret(120, 120, Decimal("1.01"))),
        (date(2026, 7, 31), 50, ret(120, 100, Decimal("1.02"))),
    ],
    ids=["S bar", "prior bar"],
)
def test_a_re_acquired_start_or_prior_bar_is_used(
    env: Env, monkeypatch: pytest.MonkeyPatch, revised: date, close: int, expected: Decimal
) -> None:
    """DEC-0117 (1), design 2.4: S_k's bar and a dividend's prior-session bar are each read
    at the session's latest observation."""
    add_close_series(env.conn, env.stock, STANDARD | {date(2026, 7, 31): 100})
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 3), {"cash_amount": "1"})
    add_bar_observed(env.conn, env.stock, revised, close, revised + timedelta(days=3))

    rows = build(env, monkeypatch)

    assert_close(rows["return_3m"]["value"], expected)


def test_on_equal_observed_on_the_later_recording_wins(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0117 (1): ties on observed_on are broken by recorded_at, for bars and for
    corporate actions; the later recording is inserted first, so insertion order cannot pass."""
    early = datetime(2026, 9, 17, 22, tzinfo=UTC)
    late = early + timedelta(hours=1)
    add_close_series(
        env.conn, env.stock, {S12: 50, S6: 80, S3: 100, date(2026, 7, 31): 100, L: 130}
    )
    add_bar_observed(env.conn, env.stock, E, 160, E, late)
    add_bar_observed(env.conn, env.stock, E, 150, E, early)
    ex_date = date(2026, 8, 3)
    add_corporate_action(
        env.conn, env.stock, "dividend", ex_date, {"cash_amount": "2"}, ex_date, late
    )
    add_corporate_action(
        env.conn, env.stock, "dividend", ex_date, {"cash_amount": "1"}, ex_date, early
    )

    rows = build(env, monkeypatch)

    assert_close(rows["return_3m"]["value"], ret(160, 100, Decimal("1.02")))


def test_a_revised_dividend_is_applied_once_with_the_later_amount(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0117 (1): a revised dividend (same ex-date, later observation) is counted once,
    with the revised amount."""
    ex_date = date(2026, 8, 3)
    add_close_series(env.conn, env.stock, STANDARD | {date(2026, 7, 31): 100})
    add_corporate_action(env.conn, env.stock, "dividend", ex_date, {"cash_amount": "1"})
    add_corporate_action(
        env.conn, env.stock, "dividend", ex_date, {"cash_amount": "2"}, date(2026, 8, 10)
    )

    rows = build(env, monkeypatch)

    assert_close(rows["return_3m"]["value"], ret(120, 100, Decimal("1.02")))
    (dividend,) = rows["return_3m"]["detail"]["dividends"]
    assert dividend["cash_amount"] == 2
    assert dividend["observed_on"] == "2026-08-10"


@pytest.mark.parametrize(
    ("action_type", "payload"),
    [
        ("split", {"split_from": "1", "split_to": "0"}),
        ("split", {"split_from": "0", "split_to": "2"}),
        ("split", {"split_from": "-1", "split_to": "2"}),
        ("split", {"split_from": "abc", "split_to": "2"}),
        ("split", {"split_from": "1", "split_to": "2e0"}),
        ("split", {"split_from": "1"}),
        ("split", {"split_from": "1", "split_to": None}),
        ("dividend", {"cash_amount": "-100"}),
        ("dividend", {"cash_amount": "abc"}),
        ("dividend", {"cash_amount": "1e0"}),
        ("dividend", {"cash_amount": "+1"}),
        ("dividend", {"cash_amount": True}),
        ("dividend", {"cash_amount": {"value": "1"}}),
        ("dividend", {}),
    ],
    ids=[
        "split-to-zero",
        "split-from-zero",
        "split-from-negative",
        "split-from-not-numeric",
        "split-to-exponent",
        "split-to-absent",
        "split-to-null",
        "cash-negative",
        "cash-not-numeric",
        "cash-exponent",
        "cash-plus-sign",
        "cash-boolean",
        "cash-object",
        "cash-absent",
    ],
)
def test_an_unusable_payload_makes_only_the_windows_containing_it_missing(
    env: Env, monkeypatch: pytest.MonkeyPatch, action_type: str, payload: dict[str, Any]
) -> None:
    """DEC-0117 (2), (3): an unusable split or dividend makes the inputs whose window
    contains it missing, naming it and not the usable dividend beside it, and never fails the
    set; a sign-prefixed string is not a plain decimal. DEC-0242: a missing input has no
    known_on. The 3-month window holds only the usable dividend and is unaffected."""
    effective_on, observed_on = date(2026, 5, 1), date(2026, 9, 30)
    add_close_series(
        env.conn, env.stock, STANDARD | {date(2026, 4, 30): 90, date(2026, 7, 31): 100}
    )
    add_corporate_action(env.conn, env.stock, action_type, effective_on, payload, observed_on)
    # A usable dividend in every window (review v1 IR-004).
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 3), {"cash_amount": "1"})

    rows = build(env, monkeypatch)

    assert rows["return_3m"]["status"] == "present"
    assert_close(rows["return_3m"]["value"], ret(120, 100, Decimal("1.01")))
    for name in ("return_6m", "return_12m"):
        row = rows[name]
        assert row["status"] == "missing", name
        assert row["value"] is None
        assert row["as_of"] == E
        assert row["known_on"] is None
        start = START[name]
        assert row["detail"] == {
            "cause": "corporate_action_payload_unusable",
            "actions": [
                {
                    "action_type": action_type,
                    "effective_on": str(effective_on),
                    "observed_on": str(observed_on),
                    "payload": {
                        "action_type": action_type,
                        "effective_on": str(effective_on),
                        **payload,
                    },
                }
            ],
            "window_months": WINDOW[name],
            "E": bar(E, 120),
            "S": bar(start, STANDARD[start]),
        }, name
    assert_momentum_invariants(env.conn, env.set_id)


@pytest.mark.parametrize(
    ("bars", "missing"),
    [
        ({E: 0}, ("return_3m", "return_6m", "return_12m")),
        ({S3: 0}, ("return_3m",)),
        ({S6: -1}, ("return_6m",)),
        ({date(2026, 7, 31): 0}, ("return_3m", "return_6m", "return_12m")),
        ({date(2026, 7, 31): -100}, ("return_3m", "return_6m", "return_12m")),
        ({date(2025, 1, 2): 0, date(2026, 8, 20): 0}, ()),
    ],
    ids=["e-zero", "s3-zero", "s6-negative", "prior-zero", "prior-negative", "unused-bars"],
)
def test_a_non_positive_close_on_a_bar_used_makes_only_its_windows_missing(
    env: Env,
    monkeypatch: pytest.MonkeyPatch,
    bars: dict[date, Decimal | int],
    missing: tuple[str, ...],
) -> None:
    """DEC-0241, DEC-0117 (3), design 2.4 and section 3: a zero or negative close on the E bar,
    the S_k bar or an in-window dividend's prior session makes the inputs that use it missing,
    naming it, with no known_on (DEC-0242), and never fails the set; a bar no window uses,
    such as the prior session of a dividend before S_12 or a bar between the boundaries,
    changes nothing."""
    prior = date(2026, 7, 31)
    add_close_series(
        env.conn,
        env.stock,
        STANDARD | {date(2025, 1, 2): 40, date(2026, 8, 20): 110, prior: 100} | bars,
    )
    add_corporate_action(env.conn, env.stock, "dividend", date(2025, 1, 3), {"cash_amount": "1"})
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 3), {"cash_amount": "1"})

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        row = rows[name]
        if name not in missing:
            assert row["status"] == "present", name
            start = START[name]
            assert_close(row["value"], ret(120, STANDARD[start], Decimal("1.01")))
            continue
        assert row["status"] == "missing", name
        assert row["value"] is None
        assert row["as_of"] == E
        assert row["known_on"] is None
        start = START[name]
        e_close, s_close = bars.get(E, 120), bars.get(start, STANDARD[start])
        prior_close = bars.get(prior, 100)
        assert row["detail"] == {
            "cause": "price_not_positive",
            "window_months": WINDOW[name],
            "E": bar(E, e_close),
            "S": bar(start, s_close),
            "dividends": (
                [{"effective_on": "2026-08-03", "prior_session": bar(prior, prior_close)}]
                if prior_close <= 0
                else []
            ),
        }, name
    assert_momentum_invariants(env.conn, env.set_id)


def test_a_positive_close_below_one_is_read(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0241 (1): only a close of zero or less is unusable; a positive close below 1 on the
    E bar, the S_k bar or a dividend's prior session is read as any other."""
    prior = date(2026, 7, 31)
    half = Decimal("0.5")
    add_close_series(
        env.conn,
        env.stock,
        {S12: half, S6: half, S3: half, prior: half, E: Decimal("0.6"), L: Decimal("0.6")},
    )
    add_corporate_action(
        env.conn, env.stock, "dividend", date(2026, 8, 3), {"cash_amount": "0.005"}
    )

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert rows[name]["status"] == "present", name
        assert_close(rows[name]["value"], ret(Decimal("0.6"), half, Decimal("1.01")))


def test_an_unusable_dividend_over_a_non_positive_prior_close_is_missing_for_the_close(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0241 (1), (2), DEC-0243: the prior session of any dividend in the window counts,
    usable or not, and a non-positive close ranks before an unusable payload, so the inputs
    name the close and the prices acquisition (review v1 IR-004)."""
    record_acquisitions(env)
    prior = date(2026, 7, 31)
    add_close_series(env.conn, env.stock, STANDARD | {prior: 0})
    add_corporate_action(env.conn, env.stock, "dividend", date(2026, 8, 3), {"cash_amount": "abc"})

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        row = rows[name]
        assert row["status"] == "missing", name
        assert row["value"] is None
        assert row["as_of"] == E
        assert row["known_on"] is None
        detail = dict(row["detail"])
        last = detail.pop("last_acquisition")
        assert (last["data_type"], last["outcome"]) == ("prices", "not_found"), name
        start = START[name]
        assert detail == {
            "cause": "price_not_positive",
            "window_months": WINDOW[name],
            "E": bar(E, 120),
            "S": bar(start, STANDARD[start]),
            "dividends": [{"effective_on": "2026-08-03", "prior_session": bar(prior, 0)}],
        }, name


def test_missing_ranks_before_outdated_whatever_the_cause(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0116 (1), DEC-0118 (4), DEC-0241 (2): on a stale stock every window that lacks a
    boundary, uses a non-positive close or holds an unusable payload is missing, and the
    missing causes rank a missing boundary, then a non-positive close, then the payload."""
    stale_day = date(2026, 10, 15)
    add_close_series(
        env.conn,
        env.stock,
        {S12: 50, S6: 0, date(2026, 4, 30): 90, S3: 0, E: 120, stale_day: 130},
    )
    # In (S_6, E] and (S_12, E], not in (S_3, E].
    add_corporate_action(
        env.conn, env.stock, "split", date(2026, 5, 1), {"split_from": "1", "split_to": "0"}
    )
    shorter = add_instrument(env.conn, "SHORT")
    add_close_series(env.conn, shorter, {S3: 100, E: 0, stale_day: 130})

    rows = build(env, monkeypatch)
    shorter_rows = momentum(env.conn, env.set_id, shorter)

    assert rows["return_3m"]["detail"]["cause"] == "price_not_positive"
    assert rows["return_6m"]["detail"]["cause"] == "price_not_positive"
    assert rows["return_12m"]["detail"]["cause"] == "corporate_action_payload_unusable"
    assert shorter_rows["return_3m"]["detail"]["cause"] == "price_not_positive"
    assert shorter_rows["return_6m"]["detail"]["boundary"] == "S_6"
    assert shorter_rows["return_12m"]["detail"]["boundary"] == "S_12"
    for row in (*rows.values(), *shorter_rows.values()):
        assert row["status"] == "missing"


def test_a_bar_committed_during_the_build_is_seen_by_the_next_set_only(
    env: Env, monkeypatch: pytest.MonkeyPatch, postgres_connection_string: str
) -> None:
    """DAC-E2-9, AC-19, DEC-0111: the momentum stage reads the build's snapshot, so a newer
    observation committed while it builds is not used until the next set."""
    add_close_series(env.conn, env.stock, STANDARD)

    def commit_newer_bar(_conn: psycopg.Connection, _ctx: engine.BuildContext) -> None:
        with psycopg.connect(postgres_connection_string) as other:
            add_bar_observed(other, env.stock, E, 150, date(2026, 10, 1))

    monkeypatch.setattr(
        engine,
        "_STAGES",
        [engine._fundamental_inputs_stage, commit_newer_bar, engine._momentum_inputs_stage],
    )
    first = engine.build(env.conn, env.set_id, 60)
    assert first.state == "complete", first.failure_reason
    second_set = add_building_set(env.conn, add_run(env.conn), D)
    second = run_momentum_stages(env.conn, second_set, monkeypatch)
    assert second.state == "complete", second.failure_reason

    assert_close(momentum(env.conn, env.set_id, env.stock)["return_3m"]["value"], ret(120, 100))
    assert_close(momentum(env.conn, second_set, env.stock)["return_3m"]["value"], ret(150, 100))


def test_a_stock_with_one_bar_has_every_momentum_input_missing(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-7, AC-13, DEC-0118 (4): with one bar, on E, no S_k resolves, so the inputs are
    missing (not a zero return), although the stock is also stale."""
    add_bar_observed(env.conn, env.stock, E, 100)

    rows = build(env, monkeypatch)

    for name in MOMENTUM:
        assert rows[name]["status"] == "missing", name
        assert rows[name]["value"] is None
        assert rows[name]["detail"]["boundary"] == f"S_{WINDOW[name]}"


def test_the_momentum_stage_is_registered_once_between_fundamentals_and_classification() -> None:
    """DEC-0121, DEC-0115: build runs the momentum stage, after the fundamentals stage whose
    inputs table it inserts into and before the classification stage."""
    stages = engine._STAGES
    assert stages.count(engine._momentum_inputs_stage) == 1
    momentum_at = stages.index(engine._momentum_inputs_stage)
    assert stages.index(engine._fundamental_inputs_stage) < momentum_at
    assert momentum_at < stages.index(engine._classification_stage)
