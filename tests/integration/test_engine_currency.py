"""Currency of the value and growth inputs (CAP-002-E2-S3).

Satisfies AC-13, DAC-E2-6, DAC-E2-S3-5 and DAC-E2-S3-6: a fundamental input is outdated
when its latest period end is earlier than the classification date minus 6 months
(``interval`` arithmetic, design 2.4), and a value input also when the stock's latest bar
precedes the latest trading day held across active instruments (DEC-0055 (5)).
"""

from collections.abc import Iterator
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import line_items
from tests.integration.engine_inputs_support import (
    TEST_KEYS,
    add_bar,
    add_building_set,
    add_instrument,
    add_quarters,
    add_run,
    add_statement,
    inputs_for,
    install_test_line_items,
    migrate_through_classification,
    months_before,
    run_fundamentals_stage,
)

pytestmark = pytest.mark.postgres

VALUE = ("book_to_price", "earnings_yield", "fcf_yield")
GROWTH = ("revenue_growth", "eps_growth")


@dataclass(frozen=True)
class Env:
    conn: psycopg.Connection
    stock: int
    set_id: UUID
    latest_trading_day: date


@pytest.fixture
def classification_date() -> date:
    return date(2026, 10, 17)


@pytest.fixture
def env(postgres_connection_string: str, classification_date: date) -> Iterator[Env]:
    """The stock under test and one peer, both with a bar on the latest trading day."""
    latest = classification_date - timedelta(days=1)
    conn = migrate_through_classification(postgres_connection_string)
    try:
        stock = add_instrument(conn, "AAA")
        peer = add_instrument(conn, "PEER")
        add_bar(conn, peer, latest)
        add_bar(conn, stock, latest)
        set_id = add_building_set(conn, add_run(conn), classification_date)
        yield Env(conn, stock, set_id, latest)
    finally:
        conn.close()


def quarters(n: int = 8) -> list[dict[str, Any]]:
    return [
        {
            "book_equity": Decimal(500),
            "shares_outstanding": Decimal(100),
            "net_income": Decimal(10 + k),
            "diluted_eps": Decimal(1 + k),
            "revenue": Decimal(100 + k),
            "operating_cash_flow": Decimal(30),
            "capital_expenditure": Decimal(-5),
        }
        for k in range(n)
    ]


def build(env: Env, monkeypatch: pytest.MonkeyPatch) -> dict[str, dict]:
    install_test_line_items(monkeypatch)
    result = run_fundamentals_stage(env.conn, env.set_id, monkeypatch)
    assert result.state == "complete", result.failure_reason
    return inputs_for(env.conn, env.set_id, env.stock)


# --- T009: the 6-month rule ----------------------------------------------------------------


# Implements TC-COMP-100
def test_fundamentals_outdated_at_six_months_and_a_day(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    latest = date(2026, 4, 16)
    add_quarters(env.conn, env.stock, latest, 8, quarters())

    rows = build(env, monkeypatch)

    for name in (*VALUE, *GROWTH):
        assert rows[name]["status"] == "outdated", name
        assert rows[name]["value"] is None
        assert rows[name]["as_of"] == latest
        assert rows[name]["detail"]["cause"] == "outdated"
        assert rows[name]["detail"]["outdated"] == {
            "fundamentals": {"latest_period_end": str(latest), "stale_before": "2026-04-17"}
        }, name


# Implements TC-COMP-100
def test_fundamentals_present_at_exactly_six_months(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    latest = date(2026, 4, 17)
    add_quarters(env.conn, env.stock, latest, 8, quarters())

    rows = build(env, monkeypatch)

    for name in (*VALUE, *GROWTH):
        assert rows[name]["status"] == "present", name
        assert rows[name]["as_of"] == latest
        assert "cause" not in rows[name]["detail"]


@pytest.mark.parametrize("classification_date", [date(2026, 8, 31)])
@pytest.mark.parametrize(
    ("latest", "status"), [(date(2026, 2, 28), "present"), (date(2026, 2, 27), "outdated")]
)
def test_six_months_before_a_month_end_is_the_shorter_month_end(
    env: Env, monkeypatch: pytest.MonkeyPatch, latest: date, status: str
) -> None:
    """DAC-E2-S3-5, design 2.4: 2026-08-31 minus interval '6 months' is 2026-02-28."""
    add_quarters(env.conn, env.stock, latest, 8, quarters())

    rows = build(env, monkeypatch)

    assert {rows[name]["status"] for name in (*VALUE, *GROWTH)} == {status}


def test_growth_currency_uses_the_newest_period(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DAC-E2-6: the newest period P1 decides, though older quarters are years old."""
    latest = date(2026, 4, 17)
    add_quarters(env.conn, env.stock, latest, 8, quarters())

    rows = build(env, monkeypatch)

    assert {rows[name]["status"] for name in GROWTH} == {"present"}
    assert {rows[name]["as_of"] for name in GROWTH} == {latest}
    assert rows["revenue_growth"]["detail"]["periods"][-1]["fiscal_period_end"] == str(
        months_before(latest, 21)
    )


# --- T010: the latest trading day ----------------------------------------------------------


# Implements TC-COMP-101
def test_stale_latest_bar_makes_value_inputs_outdated_and_leaves_growth(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    stale = add_instrument(env.conn, "STALE")
    day_before = env.latest_trading_day - timedelta(days=1)
    add_bar(env.conn, stale, day_before)
    add_quarters(env.conn, stale, date(2026, 9, 30), 8, quarters())
    add_quarters(env.conn, env.stock, date(2026, 9, 30), 8, quarters())

    current = build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, stale)
    for name in VALUE:
        assert rows[name]["status"] == "outdated", name
        assert rows[name]["detail"]["outdated"] == {
            "prices": {
                "bar_date": str(day_before),
                "latest_trading_day": str(env.latest_trading_day),
            }
        }
    assert {rows[name]["status"] for name in GROWTH} == {"present"}
    assert {current[name]["status"] for name in (*VALUE, *GROWTH)} == {"present"}


def test_stock_without_any_bar_has_value_inputs_missing(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0116 (2): no bar at all is missing, not outdated; growth is unaffected."""
    barless = add_instrument(env.conn, "NOBAR")
    add_quarters(env.conn, barless, date(2026, 9, 30), 8, quarters())

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, barless)
    assert {rows[name]["status"] for name in VALUE} == {"missing"}
    assert {rows[name]["detail"]["cause"] for name in VALUE} == {"price_missing"}
    assert {rows[name]["status"] for name in GROWTH} == {"present"}


def test_retired_stock_bar_does_not_move_the_latest_trading_day(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (5): the latest trading day is held across active instruments only."""
    retired = add_instrument(env.conn, "OLD", lifecycle="retired")
    add_bar(env.conn, retired, env.latest_trading_day + timedelta(days=1))
    add_quarters(env.conn, env.stock, date(2026, 9, 30), 8, quarters())

    rows = build(env, monkeypatch)

    assert {rows[name]["status"] for name in VALUE} == {"present"}


# --- T013: combined and mixed cases --------------------------------------------------------


def test_stale_period_and_stale_bar_are_both_named(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-13: every applicable cause is named."""
    both = add_instrument(env.conn, "BOTH")
    day_before = env.latest_trading_day - timedelta(days=1)
    add_bar(env.conn, both, day_before)
    add_quarters(env.conn, both, date(2026, 3, 31), 8, quarters())

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, both)
    for name in VALUE:
        assert rows[name]["status"] == "outdated", name
        assert rows[name]["detail"]["outdated"] == {
            "fundamentals": {"latest_period_end": "2026-03-31", "stale_before": "2026-04-17"},
            "prices": {
                "bar_date": str(day_before),
                "latest_trading_day": str(env.latest_trading_day),
            },
        }
    assert rows["revenue_growth"]["detail"]["outdated"] == {
        "fundamentals": {"latest_period_end": "2026-03-31", "stale_before": "2026-04-17"}
    }


def _statements(env: Env, statement_type: str, latest: date, n: int = 8) -> None:
    for k, period in enumerate(quarters(n)):
        payload = {
            TEST_KEYS[name]: value
            for name, value in period.items()
            if line_items.LINE_ITEMS[name].statement_type == statement_type
        }
        add_statement(env.conn, env.stock, months_before(latest, 3 * k), statement_type, payload)


def test_mixed_statement_input_is_dated_by_its_earliest_latest_period(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0116 (3): as_of and the staleness test use the earliest of the latest period
    ends an input reads."""
    _statements(env, "balance_sheet", date(2026, 9, 30))
    _statements(env, "income_statement", date(2026, 3, 31))
    _statements(env, "cash_flow_statement", date(2026, 6, 30))

    rows = build(env, monkeypatch)

    assert (rows["book_to_price"]["status"], rows["book_to_price"]["as_of"]) == (
        "present",
        date(2026, 9, 30),
    )
    assert (rows["fcf_yield"]["status"], rows["fcf_yield"]["as_of"]) == (
        "present",
        date(2026, 6, 30),
    )
    assert (rows["earnings_yield"]["status"], rows["earnings_yield"]["as_of"]) == (
        "outdated",
        date(2026, 3, 31),
    )
    assert rows["earnings_yield"]["detail"]["outdated"] == {
        "fundamentals": {"latest_period_end": "2026-03-31", "stale_before": "2026-04-17"}
    }


def test_growth_ignores_bar_currency(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """AC-13, design 2.4: growth depends on no price, so a year-old bar leaves it present."""
    old = add_instrument(env.conn, "OLDBAR")
    add_bar(env.conn, old, env.latest_trading_day - timedelta(days=365))
    add_quarters(env.conn, old, date(2026, 9, 30), 8, quarters())

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, old)
    assert {rows[name]["status"] for name in GROWTH} == {"present"}
    assert {rows[name]["status"] for name in VALUE} == {"outdated"}
