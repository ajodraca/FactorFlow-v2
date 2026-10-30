"""Value and growth inputs from quarterly fundamentals (CAP-002-E2-S3).

Satisfies AC-7, AC-12, AC-19, DAC-E2-1, DAC-E2-9 and DAC-E2-S3-1 to DAC-E2-S3-4 and
DAC-E2-S3-7 against ``engine._fundamental_inputs_stage``. Payload keys are the test keys
of ``engine_inputs_support`` (factor-engine design section 7); no real Massive key is
used.
"""

from collections.abc import Iterator
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal, localcontext
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import engine, line_items
from factorflow.classification.engine import BuildContext, BuildResult
from factorflow.classification.line_items import UNRESOLVED_CAUSE, LineItem
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

D = date(2026, 10, 17)  # classification date
L = date(2026, 10, 16)  # latest trading day held
P1 = date(2026, 9, 30)  # newest quarter, current against D

VALUE = ("book_to_price", "earnings_yield", "fcf_yield")
GROWTH = ("revenue_growth", "eps_growth")


@dataclass(frozen=True)
class Env:
    conn: psycopg.Connection
    stock: int
    set_id: UUID


@pytest.fixture
def env(postgres_connection_string: str) -> Iterator[Env]:
    """The stock under test and one peer, both with a bar of close 10 on ``L``."""
    conn = migrate_through_classification(postgres_connection_string)
    try:
        stock = add_instrument(conn, "AAA")
        peer = add_instrument(conn, "PEER")
        add_bar(conn, peer, L)
        add_bar(conn, stock, L)
        set_id = add_building_set(conn, add_run(conn), D)
        yield Env(conn, stock, set_id)
    finally:
        conn.close()


def q10(value: Decimal) -> Decimal:
    """``value`` as ``numeric(30, 10)`` stores it."""
    return value.quantize(Decimal("1e-10"), rounding=ROUND_HALF_UP)


def ratio(numerator: Decimal, denominator: Decimal, minus: int = 0) -> Decimal:
    with localcontext() as ctx:
        ctx.prec = 50
        return q10(numerator / denominator - minus)


REVENUE = [130, 120, 115, 110, 100, 95, 90, 85]
EPS = ["1.3", "1.2", "1.1", "1.0", "0.9", "0.8", "0.7", "0.6"]


def standard(n: int = 8) -> list[dict[str, Any]]:
    """Distinct values per quarter (newest first), so a wrong window gives a wrong value.

    Market capitalisation is 10 x 100 = 1000; book_to_price 0.5, earnings_yield 0.046,
    fcf_yield (126 - 26) / 1000 = 0.1; revenue growth 475 / 370 - 1, EPS 4.6 / 3.0 - 1.
    """
    return [
        {
            "book_equity": Decimal(500 - 100 * k),
            "shares_outstanding": Decimal(100 + 100 * k),
            "net_income": Decimal(13 - k),
            "diluted_eps": Decimal(EPS[k]),
            "revenue": Decimal(REVENUE[k]),
            "operating_cash_flow": Decimal(30 + k),
            "capital_expenditure": Decimal(-5 - k),  # reported as an outflow
        }
        for k in range(n)
    ]


BOOK_TO_PRICE = ratio(Decimal(500), Decimal(1000))
EARNINGS_YIELD = ratio(Decimal(46), Decimal(1000))
FCF_YIELD = ratio(Decimal(100), Decimal(1000))
REVENUE_GROWTH = ratio(Decimal(475), Decimal(370), 1)
EPS_GROWTH = ratio(Decimal("4.6"), Decimal("3.0"), 1)


def build(env: Env, monkeypatch: pytest.MonkeyPatch) -> BuildResult:
    install_test_line_items(monkeypatch)
    result = run_fundamentals_stage(env.conn, env.set_id, monkeypatch)
    assert result.state == "complete", result.failure_reason
    return result


def resolve_only(monkeypatch: pytest.MonkeyPatch, *names: str) -> None:
    """Resolve the named line items to their test keys; the rest stay ``REQUIRES_INPUT``."""
    for name in names:
        item = line_items.LINE_ITEMS[name]
        monkeypatch.setitem(
            line_items.LINE_ITEMS,
            name,
            LineItem(item.label, item.statement_type, TEST_KEYS[name], item.sign),
        )


def period(statement_type: str, end: date, observed: date, filed: date | None, backfilled: bool):
    return {
        "statement_type": statement_type,
        "fiscal_period_end": str(end),
        "observed_on": str(observed),
        "provider_filing_date": None if filed is None else str(filed),
        "backfilled": backfilled,
    }


def ends_of(detail_periods: list[dict[str, Any]]) -> list[str]:
    return [p["fiscal_period_end"] for p in detail_periods]


def periods_found(*parts: tuple[str, list[date]]) -> list[dict[str, str]]:
    """``detail.periods_found`` for the given (statement type, period ends) parts, in order."""
    return [
        {"statement_type": statement_type, "fiscal_period_end": str(end)}
        for statement_type, ends in parts
        for end in ends
    ]


# --- T004: trailing twelve months over the prior twelve ----------------------------------


# Implements TC-COMP-060
def test_revenue_growth_is_four_quarter_sum_over_prior_four_minus_one(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    ends = [months_before(P1, 3 * k) for k in range(8)]
    observed = [end + timedelta(days=15) for end in ends]
    observed[5] = date(2026, 10, 16)  # a prior-window row re-acquired last sets known_on
    filed = [end + timedelta(days=20) for end in ends]  # after the first observation
    for k, end in enumerate(ends):
        add_statement(
            env.conn,
            env.stock,
            end,
            "income_statement",
            {TEST_KEYS["revenue"]: Decimal(REVENUE[k])},
            observed_on=observed[k],
            provider_filing_date=filed[k],
        )

    build(env, monkeypatch)

    row = inputs_for(env.conn, env.set_id, env.stock)["revenue_growth"]
    assert row["status"] == "present"
    assert row["value"] == REVENUE_GROWTH
    assert row["as_of"] == P1
    assert row["known_on"] == date(2026, 10, 16)
    assert row["restated_possible"] is False
    assert row["detail"] == {
        "periods": [
            period("income_statement", ends[k], observed[k], filed[k], False) for k in range(8)
        ]
    }


def test_eps_growth_is_four_quarter_sum_over_prior_four_minus_one(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E2-1: diluted EPS over the same two windows."""
    add_quarters(env.conn, env.stock, P1, 8, standard())

    build(env, monkeypatch)

    row = inputs_for(env.conn, env.set_id, env.stock)["eps_growth"]
    assert (row["status"], row["value"], row["as_of"]) == ("present", EPS_GROWTH, P1)


def test_growth_applies_the_line_item_sign(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """Design 2.4 LineItem.sign: a provider reporting revenue negative with sign -1 gives the
    same growth as positive revenue with sign +1."""
    values = standard()
    for period in values:
        period["revenue"] = -period["revenue"]
    add_quarters(env.conn, env.stock, P1, 8, values)
    install_test_line_items(monkeypatch, overrides={"revenue": (TEST_KEYS["revenue"], -1)})

    assert run_fundamentals_stage(env.conn, env.set_id, monkeypatch).state == "complete"

    row = inputs_for(env.conn, env.set_id, env.stock)["revenue_growth"]
    assert (row["status"], row["value"]) == ("present", REVENUE_GROWTH)


# --- T005: seven quarters ----------------------------------------------------------------


# Implements TC-COMP-094
def test_seven_quarters_leave_growth_missing_and_value_unaffected(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    ends = add_quarters(env.conn, env.stock, P1, 7, standard(7))

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in GROWTH:
        assert rows[name]["status"] == "missing", name
        assert rows[name]["value"] is None
        assert rows[name]["as_of"] is None and rows[name]["known_on"] is None
        assert rows[name]["detail"]["cause"] == "periods_missing"
        assert ends_of(rows[name]["detail"]["periods_found"]) == [str(e) for e in ends]
        assert {p["statement_type"] for p in rows[name]["detail"]["periods_found"]} == {
            "income_statement"
        }
    assert {name: (rows[name]["status"], rows[name]["value"]) for name in VALUE} == {
        "book_to_price": ("present", BOOK_TO_PRICE),
        "earnings_yield": ("present", EARNINGS_YIELD),
        "fcf_yield": ("present", FCF_YIELD),
    }


def _quarters_at(env: Env, ends: list[date], income_gap: int | None = None) -> list[date]:
    """Every statement type at ``ends`` (newest first), with the standard values of each
    rank, except the income statement of rank ``income_gap``; returns the income ends."""
    values = (standard() + standard())[: len(ends)]
    for k, end in enumerate(ends):
        for statement_type in ("balance_sheet", "income_statement", "cash_flow_statement"):
            if statement_type == "income_statement" and k == income_gap:
                continue
            payload = {
                TEST_KEYS[name]: value
                for name, value in values[k].items()
                if line_items.LINE_ITEMS[name].statement_type == statement_type
            }
            add_statement(env.conn, env.stock, end, statement_type, payload)
    return [end for k, end in enumerate(ends) if k != income_gap]


def _income_with_gap(env: Env, gap: int, n: int = 8) -> list[date]:
    """``n`` calendar quarters of every statement type except the income statement of
    ``gap``."""
    return _quarters_at(env, [months_before(P1, 3 * k) for k in range(n)], income_gap=gap)


# 13-week quarters of a 52-week fiscal year: each year-ago quarter ends 364 days earlier,
# later than P1 minus 12 months (DEC-0221).
FIFTY_TWO_WEEK = [date(2026, 9, 26) - timedelta(weeks=13 * k) for k in range(9)]


def test_quarter_absent_from_the_prior_window_leaves_growth_missing(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E2-S3-2: the sixth quarter is absent, so the prior window holds three."""
    found = _income_with_gap(env, gap=5)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in GROWTH:
        assert rows[name]["status"] == "missing", name
        assert rows[name]["detail"]["cause"] == "periods_missing"
        assert ends_of(rows[name]["detail"]["periods_found"]) == [str(e) for e in found]
    assert rows["earnings_yield"]["status"] == "present"


def test_quarter_absent_from_the_trailing_window_forms_no_window(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E2-S3-2, DEC-0221: with the third quarter absent the second and third periods
    held are six months apart, so the trailing window is not formed. A missing value input
    lists what exists of every type it reads (design 2.4, AC-12), in the stage's order:
    statement type, then newest first."""
    found = _income_with_gap(env, gap=2)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in (*GROWTH, "earnings_yield"):
        assert rows[name]["status"] == "missing", name
        assert rows[name]["detail"]["cause"] == "periods_missing"
    assert ends_of(rows["revenue_growth"]["detail"]["periods_found"]) == [str(e) for e in found]
    balance_sheets = [months_before(P1, 3 * k) for k in range(8)]
    assert rows["earnings_yield"]["detail"]["periods_found"] == periods_found(
        ("balance_sheet", balance_sheets), ("income_statement", found)
    )
    assert rows["book_to_price"]["status"] == "present"
    assert rows["fcf_yield"]["status"] == "present"


def test_gap_between_third_and_fourth_quarters_forms_no_trailing_window(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0221: the P3 to P4 pair must be consecutive too; with the fourth income
    statement absent, the third and fourth held are six months apart."""
    _income_with_gap(env, gap=3)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert rows["earnings_yield"]["status"] == "missing"
    assert rows["earnings_yield"]["detail"]["cause"] == "periods_missing"
    assert rows["fcf_yield"]["status"] == "present"


def test_three_quarters_form_no_trailing_window(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0221: a trailing-only input needs four periods, P1 to P4; the most recent
    balance sheet alone still serves book_to_price. Design 2.4, AC-12: each missing value
    input lists the balance sheets and its window type's periods that exist."""
    ends = _quarters_at(env, [months_before(P1, 3 * k) for k in range(3)])

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in ("earnings_yield", "fcf_yield", *GROWTH):
        assert rows[name]["status"] == "missing", name
        assert rows[name]["detail"]["cause"] == "periods_missing"
    for name, window_type in (
        ("earnings_yield", "income_statement"),
        ("fcf_yield", "cash_flow_statement"),
    ):
        assert rows[name]["detail"] == {
            "cause": "periods_missing",
            "periods_found": periods_found(("balance_sheet", ends), (window_type, ends)),
        }, name
    assert rows["book_to_price"]["status"] == "present"


def test_gap_inside_the_prior_window_leaves_growth_missing(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0221: with the eighth quarter absent and a ninth held, the seventh and eighth
    periods held are six months apart, so the eight quarters growth needs are not
    consecutive."""
    found = _income_with_gap(env, gap=7, n=9)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in GROWTH:
        assert rows[name]["status"] == "missing", name
        assert rows[name]["detail"]["cause"] == "periods_missing"
    assert ends_of(rows["eps_growth"]["detail"]["periods_found"]) == [str(e) for e in found]
    assert rows["earnings_yield"]["status"] == "present"


def test_absent_year_ago_quarter_leaves_growth_missing(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0221, DEC-0055 (1): the prior year is the four quarters right after the trailing
    four; with the fifth absent the window is not formed, never taken a quarter later.
    Trailing-only inputs need P1 to P4 alone and stay present."""
    found = _income_with_gap(env, gap=4, n=9)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in GROWTH:
        assert rows[name]["status"] == "missing", name
        assert rows[name]["detail"]["cause"] == "periods_missing"
    assert ends_of(rows["revenue_growth"]["detail"]["periods_found"]) == [str(e) for e in found]
    assert (rows["earnings_yield"]["status"], rows["earnings_yield"]["value"]) == (
        "present",
        EARNINGS_YIELD,
    )


def test_fifty_two_week_filer_compares_with_the_year_ago_quarters(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0221: a 52-week filer's year-ago quarter ends later than P1 minus 12 months and
    is still the first quarter of the prior window; P1 to P8 are the eight newest."""
    _quarters_at(env, FIFTY_TWO_WEEK)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert (rows["revenue_growth"]["status"], rows["revenue_growth"]["value"]) == (
        "present",
        REVENUE_GROWTH,
    )
    assert rows["eps_growth"]["value"] == EPS_GROWTH
    assert ends_of(rows["revenue_growth"]["detail"]["periods"]) == [
        str(end) for end in FIFTY_TWO_WEEK[:8]
    ]
    assert rows["earnings_yield"]["value"] == EARNINGS_YIELD


def test_fifty_two_week_filer_missing_a_quarter_forms_no_trailing_window(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0221: with its third income statement absent, a 52-week filer's four newest are
    still within 12 months of P1, but two adjacent ones are six months apart, so the
    trailing window is not formed."""
    _quarters_at(env, FIFTY_TWO_WEEK, income_gap=2)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in (*GROWTH, "earnings_yield"):
        assert rows[name]["status"] == "missing", name
        assert rows[name]["detail"]["cause"] == "periods_missing"
    assert rows["fcf_yield"]["status"] == "present"
    assert rows["book_to_price"]["status"] == "present"


@pytest.mark.parametrize(
    ("second", "status"), [(date(2026, 5, 30), "present"), (date(2026, 5, 29), "missing")]
)
def test_adjacent_quarters_at_most_four_months_apart_are_consecutive(
    env: Env, monkeypatch: pytest.MonkeyPatch, second: date, status: str
) -> None:
    """DEC-0221: period ends 4 months apart (2026-09-30, 2026-05-30) are consecutive; 4
    months and a day apart are not."""
    _quarters_at(env, [P1, second, months_before(second, 3), months_before(second, 6)])

    build(env, monkeypatch)

    row = inputs_for(env.conn, env.set_id, env.stock)["earnings_yield"]
    assert row["status"] == status
    assert row["value"] == (EARNINGS_YIELD if status == "present" else None)


# --- T006: annual statements --------------------------------------------------------------


# Implements TC-COMP-061
def test_annual_rows_enter_no_trailing_sum(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    ends = add_quarters(env.conn, env.stock, P1, 8, standard())
    big = {
        TEST_KEYS["revenue"]: Decimal(100000),
        TEST_KEYS["net_income"]: Decimal(100000),
        TEST_KEYS["diluted_eps"]: Decimal(1000),
    }
    # One shares the newest quarter's period end and is observed later; one has its own
    # date inside the trailing window and one inside the prior window.
    for end in (P1, date(2026, 8, 15), months_before(ends[5], 1)):
        add_statement(
            env.conn,
            env.stock,
            end,
            "income_statement",
            big,
            fiscal_period="FY",
            observed_on=D,
        )

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert (rows["revenue_growth"]["status"], rows["revenue_growth"]["value"]) == (
        "present",
        REVENUE_GROWTH,
    )
    assert rows["eps_growth"]["value"] == EPS_GROWTH
    assert rows["earnings_yield"]["value"] == EARNINGS_YIELD
    assert (
        str(P1 + timedelta(days=15))
        == rows["revenue_growth"]["detail"]["periods"][0]["observed_on"]
    )


def test_stock_with_only_annual_statements_has_value_and_growth_missing(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E2-S3-3: annual rows form no window and no most recent quarterly balance sheet."""
    values = standard(2)
    for k, end in enumerate((date(2025, 12, 31), date(2024, 12, 31))):
        for statement_type in ("balance_sheet", "income_statement", "cash_flow_statement"):
            payload = {
                TEST_KEYS[name]: value
                for name, value in values[k].items()
                if line_items.LINE_ITEMS[name].statement_type == statement_type
            }
            add_statement(env.conn, env.stock, end, statement_type, payload, fiscal_period="FY")

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in (*VALUE, *GROWTH):
        assert rows[name]["status"] == "missing", name
        assert rows[name]["detail"] == {"cause": "periods_missing", "periods_found": []}


# --- T007: the latest observation of a period ---------------------------------------------


def _seven_older_quarters(env: Env, latest: date) -> None:
    add_quarters(env.conn, env.stock, months_before(latest, 3), 7, standard()[1:])


# Implements TC-COMP-161
def test_later_observation_of_a_period_is_used_and_earlier_untouched(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    latest = date(2026, 5, 31)
    _seven_older_quarters(env, latest)
    newest = standard()[0]
    for statement_type, names in (
        ("balance_sheet", ("book_equity", "shares_outstanding")),
        ("cash_flow_statement", ("operating_cash_flow", "capital_expenditure")),
    ):
        payload = {TEST_KEYS[n]: newest[n] for n in names}
        add_statement(
            env.conn, env.stock, latest, statement_type, payload, observed_on=date(2026, 6, 1)
        )
    first = {TEST_KEYS["revenue"]: Decimal(130), TEST_KEYS["net_income"]: Decimal(13)}
    second = {TEST_KEYS["revenue"]: Decimal(140), TEST_KEYS["net_income"]: Decimal(23)}
    add_statement(
        env.conn, env.stock, latest, "income_statement", first, observed_on=date(2026, 6, 1)
    )
    add_statement(
        env.conn, env.stock, latest, "income_statement", second, observed_on=date(2026, 7, 15)
    )
    before = _period_rows(env, latest)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert rows["revenue_growth"]["value"] == ratio(Decimal(485), Decimal(370), 1)
    assert rows["revenue_growth"]["known_on"] == date(2026, 7, 15)
    assert rows["earnings_yield"]["value"] == ratio(Decimal(56), Decimal(1000))
    assert _period_rows(env, latest) == before
    assert len(before) == 2


def _period_rows(env: Env, end: date) -> list[tuple[Any, ...]]:
    rows = env.conn.execute(
        "SELECT fiscal_period, statement_type, observed_on, value_hash, provider_filing_date, "
        "payload::text, recorded_at FROM fundamental_observation "
        "WHERE instrument_id = %s AND fiscal_period_end = %s AND statement_type = "
        "'income_statement' ORDER BY observed_on, recorded_at",
        (env.stock, end),
    ).fetchall()
    env.conn.commit()
    return rows


def test_equal_observed_on_is_decided_by_the_later_recorded_at(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.3 step 3: observed_on DESC, then recorded_at DESC (DAC-E2-9). One stock has
    the later recording inserted last and one has it inserted first, so neither insertion
    nor heap order can stand in for recorded_at."""
    other = add_instrument(env.conn, "BBB")
    add_bar(env.conn, other, L)
    seen = date(2026, 10, 15)
    late = datetime(2026, 10, 15, 18, tzinfo=UTC)
    for stock, later_last in ((env.stock, True), (other, False)):
        add_quarters(env.conn, stock, months_before(P1, 3), 7, standard()[1:])
        recordings = [(Decimal(140), late - timedelta(hours=6)), (Decimal(150), late)]
        for revenue, recorded in recordings if later_last else recordings[::-1]:
            add_statement(
                env.conn,
                stock,
                P1,
                "income_statement",
                {TEST_KEYS["revenue"]: revenue},
                observed_on=seen,
                recorded_at=recorded,
            )

    build(env, monkeypatch)

    for stock in (env.stock, other):
        row = inputs_for(env.conn, env.set_id, stock)["revenue_growth"]
        assert row["value"] == ratio(Decimal(495), Decimal(370), 1), stock


# --- T008: non-positive bases --------------------------------------------------------------


# Implements TC-COMP-062
@pytest.mark.parametrize(
    ("item", "prior", "base"),
    [
        ("revenue", ["10", "-10", "5", "-5"], Decimal(0)),
        ("revenue", ["-10", "-20", "-30", "-40"], Decimal(-100)),
        ("diluted_eps", ["0.5", "-0.5", "0.25", "-0.25"], Decimal("0.00")),
        ("diluted_eps", ["-0.1", "-0.2", "-0.3", "-0.4"], Decimal("-1.0")),
    ],
)
def test_non_positive_prior_year_base_makes_growth_not_computable(
    env: Env, monkeypatch: pytest.MonkeyPatch, item: str, prior: list[str], base: Decimal
) -> None:
    values = standard()
    for k, amount in enumerate(prior, start=4):
        values[k][item] = Decimal(amount)
    add_quarters(env.conn, env.stock, P1, 8, values)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    name, other = ("revenue_growth", "eps_growth") if item == "revenue" else GROWTH[::-1]
    assert rows[name]["status"] == "not_computable"
    assert rows[name]["value"] is None
    assert rows[name]["as_of"] == P1
    # DEC-0116 (5): the rows used are determined, so both dates are set; the newest of the
    # eight income statements is observed last, 15 days after P1 (add_statement).
    assert rows[name]["known_on"] == P1 + timedelta(days=15)
    assert rows[name]["detail"]["cause"] == "prior_year_base_not_positive"
    assert rows[name]["detail"]["prior_year_base"] == base
    assert len(rows[name]["detail"]["periods"]) == 8
    assert rows[other]["status"] == "present"
    assert {rows[n]["status"] for n in VALUE} == {"present"}


# Implements TC-COMP-062
@pytest.mark.parametrize("shares", [Decimal(0), Decimal(-100)])
def test_non_positive_shares_make_every_value_input_not_computable(
    env: Env, monkeypatch: pytest.MonkeyPatch, shares: Decimal
) -> None:
    values = standard()
    values[0]["shares_outstanding"] = shares
    add_quarters(env.conn, env.stock, P1, 8, values)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in VALUE:
        assert rows[name]["status"] == "not_computable", name
        assert rows[name]["value"] is None
        # DEC-0116 (5): set on every row whose rows used are determined. Each input's
        # latest period is P1; its rows are observed by P1 + 15 days and the bar on L.
        assert rows[name]["as_of"] == P1, name
        assert rows[name]["known_on"] == max(P1 + timedelta(days=15), L), name
        assert rows[name]["detail"]["cause"] == "market_capitalisation_not_positive"
        assert rows[name]["detail"]["shares_outstanding"] == shares
        assert rows[name]["detail"]["market_capitalisation"] == shares * 10
    assert {rows[n]["status"] for n in GROWTH} == {"present"}


def test_market_capitalisation_of_one_is_computable(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.4: only a market capitalisation of zero or less is not computable."""
    values = standard()
    values[0]["shares_outstanding"] = Decimal("0.1")  # times the close of 10
    add_quarters(env.conn, env.stock, P1, 8, values)

    build(env, monkeypatch)

    row = inputs_for(env.conn, env.set_id, env.stock)["book_to_price"]
    assert (row["status"], row["value"]) == ("present", Decimal(500))


def test_small_positive_prior_year_base_is_computable(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (2): only a prior-year base of zero or less is not computable."""
    values = standard()
    for k in range(4, 8):
        values[k]["diluted_eps"] = Decimal("0.25")
    add_quarters(env.conn, env.stock, P1, 8, values)

    build(env, monkeypatch)

    row = inputs_for(env.conn, env.set_id, env.stock)["eps_growth"]
    assert (row["status"], row["value"]) == ("present", ratio(Decimal("4.6"), Decimal(1), 1))


# --- T012 (a): unresolved line items --------------------------------------------------------

NEEDS = {
    "book_to_price": ["book_equity", "shares_outstanding"],
    "earnings_yield": ["net_income", "shares_outstanding"],
    "fcf_yield": ["capital_expenditure", "operating_cash_flow", "shares_outstanding"],
    "revenue_growth": ["revenue"],
    "eps_growth": ["diluted_eps"],
}


def test_unresolved_line_items_leave_value_and_growth_missing(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Supporting case for TC-COMP-059 (AC-12): with every key REQUIRES_INPUT the five
    inputs are missing naming the line items each needs, and the set completes."""
    add_quarters(env.conn, env.stock, P1, 8, standard())

    result = run_fundamentals_stage(env.conn, env.set_id, monkeypatch)

    assert result.state == "complete"
    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name, needed in NEEDS.items():
        assert rows[name]["status"] == "missing", name
        assert rows[name]["detail"]["cause"] == UNRESOLVED_CAUSE
        assert sorted(rows[name]["detail"]["line_items"]) == sorted(needed), name


def test_only_unresolved_line_items_are_named(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """AC-12: with net income resolved, earnings_yield names only shares outstanding."""
    add_quarters(env.conn, env.stock, P1, 8, standard())
    resolve_only(monkeypatch, "net_income")

    run_fundamentals_stage(env.conn, env.set_id, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert rows["earnings_yield"]["detail"]["cause"] == UNRESOLVED_CAUSE
    assert rows["earnings_yield"]["detail"]["line_items"] == ["shares_outstanding"]
    assert sorted(rows["book_to_price"]["detail"]["line_items"]) == NEEDS["book_to_price"]


def test_resolved_items_classify_independently_of_unresolved_ones(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-12: with net income and shares outstanding resolved, earnings_yield is present
    while book_to_price and fcf_yield stay missing naming their own items."""
    add_quarters(env.conn, env.stock, P1, 8, standard())
    resolve_only(monkeypatch, "net_income", "shares_outstanding")

    run_fundamentals_stage(env.conn, env.set_id, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert (rows["earnings_yield"]["status"], rows["earnings_yield"]["value"]) == (
        "present",
        EARNINGS_YIELD,
    )
    assert rows["book_to_price"]["detail"] == {
        "cause": UNRESOLVED_CAUSE,
        "line_items": ["book_equity"],
    }
    assert sorted(rows["fcf_yield"]["detail"]["line_items"]) == [
        "capital_expenditure",
        "operating_cash_flow",
    ]


# --- T012 (b): the stored form of a line item ---------------------------------------------


def test_plain_decimal_strings_and_json_numbers_read_alike(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0116 (4): a JSON number and a JSON string holding a plain decimal are both read."""
    other = add_instrument(env.conn, "NUM")
    add_bar(env.conn, other, L)
    add_quarters(env.conn, env.stock, P1, 8, standard())
    add_quarters(env.conn, other, P1, 8, standard(), numbers=True)

    build(env, monkeypatch)

    strings = inputs_for(env.conn, env.set_id, env.stock)
    numbers = inputs_for(env.conn, env.set_id, other)
    expected = {
        "book_to_price": BOOK_TO_PRICE,
        "earnings_yield": EARNINGS_YIELD,
        "fcf_yield": FCF_YIELD,
    }
    assert {n: (strings[n]["status"], strings[n]["value"]) for n in VALUE} == {
        n: ("present", v) for n, v in expected.items()
    }
    assert {n: (numbers[n]["status"], numbers[n]["value"]) for n in VALUE} == {
        n: ("present", v) for n, v in expected.items()
    }


_OMIT = object()


@pytest.mark.parametrize("stored", [None, "n/a", "1,250.5", "", True, _OMIT])
def test_unusable_line_item_value_reads_as_absent(
    env: Env, monkeypatch: pytest.MonkeyPatch, stored: object
) -> None:
    """DEC-0116 (4): JSON null, a non-numeric string, a boolean or an absent key is absent,
    never a cast error; the input is missing and the set completes."""
    values = standard()
    if stored is _OMIT:
        del values[0]["net_income"]
    else:
        values[0]["net_income"] = stored
    add_quarters(env.conn, env.stock, P1, 8, values)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert rows["earnings_yield"]["status"] == "missing"
    assert rows["earnings_yield"]["detail"]["cause"] == "line_item_absent"
    assert rows["earnings_yield"]["detail"]["line_items"] == ["net_income"]
    assert rows["book_to_price"]["status"] == "present"


def test_plain_decimal_fractions_are_read_exactly(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0116 (4): a plain decimal's fraction is read, zero digits included."""
    values = standard()
    values[0]["book_equity"] = Decimal("500.05")
    for k in range(4):
        values[k]["net_income"] = Decimal(f"{13 - k}.10")
    add_quarters(env.conn, env.stock, P1, 8, values)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert rows["book_to_price"]["value"] == ratio(Decimal("500.05"), Decimal(1000))
    assert rows["earnings_yield"]["value"] == ratio(Decimal("46.40"), Decimal(1000))


# --- T012 (c), (d): the value formulas -----------------------------------------------------


def test_fcf_yield_subtracts_signed_capital_expenditure(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.4: (TTM operating cash flow - TTM capital expenditure) / MC, with the
    outflow-negative capital expenditure turned positive by its sign of -1."""
    add_quarters(env.conn, env.stock, P1, 8, standard())

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert (rows["fcf_yield"]["status"], rows["fcf_yield"]["value"]) == ("present", FCF_YIELD)
    # No row is backfilled, so CAP-002-E2-S6's mark leaves the column false as well.
    assert {rows[name]["restated_possible"] for name in VALUE} == {False}


def test_market_capitalisation_is_latest_close_times_newest_shares(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (6): the latest session's latest observation of the close, times shares
    outstanding from the most recent quarterly balance sheet; detail carries the parts."""
    add_quarters(env.conn, env.stock, P1, 8, standard())
    add_bar(env.conn, env.stock, L - timedelta(days=1), close=99)
    add_bar(env.conn, env.stock, L, close=12, observed_on=L + timedelta(days=1))

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert rows["book_to_price"]["value"] == ratio(Decimal(500), Decimal(1200))
    assert rows["earnings_yield"]["value"] == ratio(Decimal(46), Decimal(1200))
    detail = rows["book_to_price"]["detail"]
    assert detail["close"] == 12
    assert detail["bar_date"] == str(L)
    assert detail["bar_observed_on"] == str(L + timedelta(days=1))
    assert detail["shares_outstanding"] == 100
    assert detail["balance_sheet_period_end"] == str(P1)
    assert detail["market_capitalisation"] == 1200


def _bar_recorded(
    env: Env, instrument_id: int, session: date, observed: date, close: int, recorded: datetime
) -> None:
    """A bar with its recorded_at given, which engine_support.add_bar leaves to now()."""
    env.conn.execute(
        "INSERT INTO daily_bar (instrument_id, session_date, observed_on, value_hash, "
        "open_price, high_price, low_price, close_price, volume, recorded_at) "
        "VALUES (%s, %s, %s, sha256(%s::text::bytea), %s, %s, %s, %s, 1000, %s)",
        (
            instrument_id,
            session,
            observed,
            f"{instrument_id}{session}{close}{recorded}",
            close,
            close,
            close,
            close,
            recorded,
        ),
    )
    env.conn.commit()


def test_equal_bar_observation_is_decided_by_the_later_recorded_at(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0117 (1), design 2.4: a session observed twice on one day gives the close of the
    later recording (observed_on DESC, then recorded_at DESC). One stock has the later
    recording inserted last and one has it inserted first, so neither insertion nor heap
    order can stand in for recorded_at."""
    other = add_instrument(env.conn, "BBB")
    seen = L + timedelta(days=1)  # later than the fixture's bar, observed on L
    late = datetime(2026, 10, 17, 18, tzinfo=UTC)
    for stock, later_last in ((env.stock, True), (other, False)):
        add_quarters(env.conn, stock, P1, 8, standard())
        recordings = [(8, late - timedelta(hours=6)), (12, late)]
        for close, recorded in recordings if later_last else recordings[::-1]:
            _bar_recorded(env, stock, L, seen, close, recorded)

    build(env, monkeypatch)

    for stock in (env.stock, other):
        row = inputs_for(env.conn, env.set_id, stock)["book_to_price"]
        assert row["value"] == ratio(Decimal(500), Decimal(1200)), stock
        assert row["detail"]["close"] == 12, stock


def test_value_detail_lists_the_balance_sheet_and_trailing_rows(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.4 and DEC-0122: each period used, balance sheet first; book_to_price reads
    the balance sheet only."""
    ends = add_quarters(env.conn, env.stock, P1, 8, standard())

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)

    def used(detail: dict[str, Any]) -> list[tuple[str, str]]:
        return [(p["statement_type"], p["fiscal_period_end"]) for p in detail["periods"]]

    balance = [("balance_sheet", str(P1))]
    assert used(rows["book_to_price"]["detail"]) == balance
    assert used(rows["earnings_yield"]["detail"]) == balance + [
        ("income_statement", str(e)) for e in ends[:4]
    ]
    assert used(rows["fcf_yield"]["detail"]) == balance + [
        ("cash_flow_statement", str(e)) for e in ends[:4]
    ]


# --- T012 (e), (f): which statements are read -----------------------------------------------


def test_balance_sheet_dated_after_the_classification_date_is_never_used(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.3 step 3: only periods ending on or before the classification date."""
    add_quarters(env.conn, env.stock, P1, 8, standard())
    later = date(2026, 12, 31)
    add_statement(
        env.conn,
        env.stock,
        later,
        "balance_sheet",
        {TEST_KEYS["book_equity"]: Decimal(9000), TEST_KEYS["shares_outstanding"]: Decimal(1)},
    )
    add_statement(
        env.conn, env.stock, later, "income_statement", {TEST_KEYS["net_income"]: Decimal(9000)}
    )

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert rows["book_to_price"]["value"] == BOOK_TO_PRICE
    assert rows["earnings_yield"]["value"] == EARNINGS_YIELD
    assert rows["book_to_price"]["as_of"] == P1


def test_quarter_ending_on_the_classification_date_is_used(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.3 step 3: a period ending on the classification date is on or before it."""
    add_quarters(env.conn, env.stock, D, 8, standard())

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert {rows[name]["as_of"] for name in (*VALUE, *GROWTH)} == {D}
    assert rows["revenue_growth"]["value"] == REVENUE_GROWTH


def test_absent_item_in_newest_balance_sheet_does_not_fall_back(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (1): the single most recent quarterly balance sheet, never an older one.
    Design 2.4, AC-12: the missing input lists every balance sheet that exists."""
    values = standard()
    del values[0]["book_equity"]
    ends = add_quarters(env.conn, env.stock, P1, 8, values)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert rows["book_to_price"]["status"] == "missing"
    assert rows["book_to_price"]["detail"] == {
        "cause": "line_item_absent",
        "line_items": ["book_equity"],
        "periods_found": periods_found(("balance_sheet", ends)),
    }
    assert rows["earnings_yield"]["status"] == "present"


def _capture_stmt(captured: list[tuple[Any, ...]]):
    def stage(conn: psycopg.Connection, ctx: BuildContext) -> None:
        captured.extend(
            conn.execute(
                "SELECT instrument_id, statement_type, fiscal_period_end, period_rank, ttm_slot, "
                "prior_slot, backfilled FROM stmt "
                "ORDER BY instrument_id, statement_type, fiscal_period_end DESC"
            ).fetchall()
        )

    return stage


def test_ratios_statements_are_never_read(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """Design 2.3 step 3: the three statement types only; a ratios row is not selected."""
    ends = add_quarters(env.conn, env.stock, P1, 8, standard())
    for end in (P1, date(2026, 10, 1)):
        add_statement(env.conn, env.stock, end, "ratios", {TEST_KEYS["net_income"]: Decimal(9000)})
    captured: list[tuple[Any, ...]] = []
    install_test_line_items(monkeypatch)
    monkeypatch.setattr(
        engine, "_STAGES", [engine._fundamental_inputs_stage, _capture_stmt(captured)]
    )

    assert engine.build(env.conn, env.set_id, 60).state == "complete"

    assert {row[1] for row in captured} == {
        "balance_sheet",
        "income_statement",
        "cash_flow_statement",
    }
    assert len(captured) == 3 * len(ends)
    assert inputs_for(env.conn, env.set_id, env.stock)["earnings_yield"]["value"] == (
        EARNINGS_YIELD
    )


def test_statement_windows_assign_trailing_and_prior_slots(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (1), DEC-0221: ranks newest first, the four newest fill the trailing
    window and the next four, ranks 5 to 8, the prior one."""
    ends = add_quarters(env.conn, env.stock, P1, 9, standard() + standard(1))
    captured: list[tuple[Any, ...]] = []
    install_test_line_items(monkeypatch)
    monkeypatch.setattr(
        engine, "_STAGES", [engine._fundamental_inputs_stage, _capture_stmt(captured)]
    )

    assert engine.build(env.conn, env.set_id, 60).state == "complete"

    income = [row for row in captured if row[1] == "income_statement"]
    assert [(row[2], row[3], row[4], row[5]) for row in income] == [
        (end, k + 1, k + 1 if k < 4 else None, k - 3 if 4 <= k < 8 else None)
        for k, end in enumerate(ends)
    ]


# --- T012 (g): the roster ---------------------------------------------------------------------


def test_retired_instrument_gets_no_input_and_active_gets_five(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-15 compute side, design 2.3: inputs are written for the active roster only."""
    retired = add_instrument(env.conn, "OLD", lifecycle="retired")
    add_quarters(env.conn, retired, P1, 8, standard())
    add_bar(env.conn, retired, L)
    add_quarters(env.conn, env.stock, P1, 8, standard())

    build(env, monkeypatch)

    assert inputs_for(env.conn, env.set_id, retired) == {}
    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert {name: row["factor"] for name, row in rows.items()} == {
        "book_to_price": "value",
        "earnings_yield": "value",
        "fcf_yield": "value",
        "revenue_growth": "growth",
        "eps_growth": "growth",
    }


def test_stock_with_no_statements_gets_five_missing_inputs(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-12: the roster, not the statements, decides which rows are written."""
    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert {name: row["detail"]["cause"] for name, row in rows.items()} == {
        name: "periods_missing" for name in (*VALUE, *GROWTH)
    }


def test_insert_inputs_writes_only_the_named_factors(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0115: a later stage adds its rows to inputs and runs insert_inputs.sql for its own
    factor; only that factor's rows are written, so no value or growth row is written twice."""
    add_quarters(env.conn, env.stock, P1, 8, standard())

    def momentum_stub(conn: psycopg.Connection, ctx: BuildContext) -> None:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO inputs (instrument_id, factor, input_name, status, value, as_of, "
                "known_on, restated_possible, detail, missing_data_type) VALUES "
                "(%s, 'momentum', 'return_3m', 'present', 0.1, %s, %s, false, "
                "jsonb_build_object(), 'prices')",
                (env.stock, L, L),
            )
            cur.execute(engine._INSERT_INPUTS_SQL, {"set_id": ctx.set_id, "factors": ["momentum"]})

    install_test_line_items(monkeypatch)
    monkeypatch.setattr(engine, "_STAGES", [engine._fundamental_inputs_stage, momentum_stub])

    result = engine.build(env.conn, env.set_id, 60)

    assert result.state == "complete", result.failure_reason
    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert {name: row["factor"] for name, row in rows.items()} == {
        "book_to_price": "value",
        "earnings_yield": "value",
        "fcf_yield": "value",
        "revenue_growth": "growth",
        "eps_growth": "growth",
        "return_3m": "momentum",
    }


# --- T012 (h): reason precedence (DEC-0116 (1)) -----------------------------------------------

STALE = date(2026, 3, 31)  # earlier than D minus 6 months (2026-04-17)


def test_stale_and_non_positive_base_is_outdated(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0116 (1): outdated ranks before not_computable."""
    values = standard()
    for k in range(4, 8):
        values[k]["revenue"] = Decimal(-1)
    values[0]["shares_outstanding"] = Decimal(0)
    add_quarters(env.conn, env.stock, STALE, 8, values)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert rows["revenue_growth"]["status"] == "outdated"
    assert {rows[name]["status"] for name in VALUE} == {"outdated"}


def test_absent_line_item_and_stale_is_missing(env: Env, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0116 (1): missing ranks before outdated. Design 2.4, AC-12: a line item absent
    from a period's payload lists, in periods_found, every period that exists of the types
    the input reads."""
    values = standard()
    del values[0]["revenue"]
    del values[0]["net_income"]
    ends = add_quarters(env.conn, env.stock, STALE, 8, values)

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    assert rows["revenue_growth"]["status"] == "missing"
    growth = rows["revenue_growth"]["detail"]
    # Design 2.4 and T019 give a growth input missing a line item a cause and periods_found;
    # its one line item is the input's own, so detail.line_items is not pinned.
    assert growth["cause"] == "line_item_absent"
    assert growth["periods_found"] == periods_found(("income_statement", ends))
    assert rows["earnings_yield"]["status"] == "missing"
    assert rows["earnings_yield"]["detail"] == {
        "cause": "line_item_absent",
        "line_items": ["net_income"],
        "periods_found": periods_found(("balance_sheet", ends), ("income_statement", ends)),
    }
    assert rows["book_to_price"]["status"] == "outdated"


# --- T012 (i): known_on (DEC-0055 (7)) ---------------------------------------------------------


def test_value_known_on_is_the_latest_observation_of_statements_and_bar(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0055 (7): every statement row and the bar an input used decide its known_on."""
    values = standard()
    ends = [months_before(P1, 3 * k) for k in range(8)]
    # Later than the stock's bar (observed on L), so a statement row decides known_on.
    seen = {
        "balance_sheet": date(2026, 10, 20),
        "income_statement": date(2026, 10, 21),
        "cash_flow_statement": date(2026, 10, 22),
    }
    for k, end in enumerate(ends):
        for statement_type, observed in seen.items():
            payload = {
                TEST_KEYS[name]: value
                for name, value in values[k].items()
                if line_items.LINE_ITEMS[name].statement_type == statement_type
            }
            # Only the third quarter of each type carries its type's latest observation.
            on = observed if k == 2 else end + timedelta(days=1)
            add_statement(env.conn, env.stock, end, statement_type, payload, observed_on=on)
    other = add_instrument(env.conn, "LATEBAR")
    add_bar(env.conn, other, L, observed_on=date(2026, 10, 20))
    add_quarters(env.conn, other, P1, 8, standard())

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    # book_to_price reads the newest balance sheet only, not the third quarter's.
    assert rows["book_to_price"]["known_on"] == L
    assert rows["earnings_yield"]["known_on"] == date(2026, 10, 21)
    assert rows["fcf_yield"]["known_on"] == date(2026, 10, 22)
    late = inputs_for(env.conn, env.set_id, other)
    assert {late[name]["known_on"] for name in VALUE} == {date(2026, 10, 20)}


# --- T012 (j): the last acquisition of a missing input -----------------------------------------


def _acquisition(env: Env, instrument_id: int, data_type: str, outcome: str) -> None:
    env.conn.execute(
        "INSERT INTO acquisition_state (instrument_id, data_type, last_acquired_at, "
        "last_run_id, last_outcome) VALUES (%s, %s, %s, gen_random_uuid(), %s)",
        (instrument_id, data_type, datetime(2026, 10, 16, 21, tzinfo=UTC), outcome),
    )
    env.conn.commit()


def test_missing_input_carries_the_last_fundamentals_acquisition(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.3 step 5, AC-12: a missing value or growth input names the last fundamentals
    outcome, not the prices one (T019: growth's data type is fundamentals); a present one
    carries no acquisition."""
    values = standard()
    del values[0]["net_income"]
    del values[0]["revenue"]
    add_quarters(env.conn, env.stock, P1, 8, values)
    _acquisition(env, env.stock, "fundamentals", "not_found")
    _acquisition(env, env.stock, "prices", "written")

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    for name in ("earnings_yield", "revenue_growth"):
        assert rows[name]["status"] == "missing", name
        acquisition = rows[name]["detail"]["last_acquisition"]
        assert (acquisition["data_type"], acquisition["outcome"]) == ("fundamentals", "not_found")
        assert datetime.fromisoformat(acquisition["acquired_at"]) == datetime(
            2026, 10, 16, 21, tzinfo=UTC
        )
    assert "last_acquisition" not in rows["book_to_price"]["detail"]


def test_missing_price_carries_the_last_prices_acquisition(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.3 step 5, DEC-0116 (2): no bar at all is missing, sourced to prices."""
    barless = add_instrument(env.conn, "NOBAR")
    add_quarters(env.conn, barless, P1, 8, standard())
    _acquisition(env, barless, "prices", "failed")
    _acquisition(env, barless, "fundamentals", "written")

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, barless)
    for name in VALUE:
        assert rows[name]["status"] == "missing", name
        assert rows[name]["detail"]["cause"] == "price_missing"
        assert rows[name]["detail"]["last_acquisition"]["data_type"] == "prices"
        assert rows[name]["detail"]["last_acquisition"]["outcome"] == "failed"
    assert {rows[name]["status"] for name in GROWTH} == {"present"}


def test_missing_input_without_acquisition_state_has_no_acquisition_key(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.3 step 5: no acquisition_state row leaves detail unchanged."""
    add_quarters(env.conn, env.stock, P1, 7, standard(7))

    build(env, monkeypatch)

    detail = inputs_for(env.conn, env.set_id, env.stock)["revenue_growth"]["detail"]
    assert set(detail) == {"cause", "periods_found"}


# --- T012 (k): the backfill flag (DEC-0056) ------------------------------------------------------


def test_backfilled_flag_compares_filing_date_with_first_fundamentals_observation(
    env: Env, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0056: filed before the instrument's first fundamentals observed_on, over every
    row it has, is backfilled; filed on or after it, or with no filing date, is not."""
    first = date(2026, 1, 5)
    # The instrument's first observation is an annual ratios row, so the comparison date
    # spans every statement type and period kind.
    add_statement(
        env.conn, env.stock, date(2025, 12, 31), "ratios", {}, fiscal_period="FY", observed_on=first
    )
    values = standard()
    ends = [months_before(P1, 3 * k) for k in range(8)]
    filed = {
        3: first - timedelta(days=1),  # backfilled
        2: first,  # filed on the first observation: not backfilled
        1: None,  # no filing date: not backfilled
    }
    for k, end in enumerate(ends):
        for statement_type in ("balance_sheet", "income_statement", "cash_flow_statement"):
            payload = {
                TEST_KEYS[name]: value
                for name, value in values[k].items()
                if line_items.LINE_ITEMS[name].statement_type == statement_type
            }
            add_statement(
                env.conn,
                env.stock,
                end,
                statement_type,
                payload,
                observed_on=date(2026, 10, 1),
                provider_filing_date=filed.get(k, date(2026, 9, 1)),
            )

    build(env, monkeypatch)

    rows = inputs_for(env.conn, env.set_id, env.stock)
    flags = {
        p["fiscal_period_end"]: p["backfilled"] for p in rows["revenue_growth"]["detail"]["periods"]
    }
    assert flags == {str(end): k == 3 for k, end in enumerate(ends)}
    income = {
        p["fiscal_period_end"]: p["backfilled"]
        for p in rows["earnings_yield"]["detail"]["periods"]
        if p["statement_type"] == "income_statement"
    }
    assert income == {str(end): k == 3 for k, end in enumerate(ends[:4])}
    cash = {
        p["fiscal_period_end"]: p["backfilled"]
        for p in rows["fcf_yield"]["detail"]["periods"]
        if p["statement_type"] == "cash_flow_statement"
    }
    assert cash == {str(end): k == 3 for k, end in enumerate(ends[:4])}


# --- T014: one snapshot per build (DEC-0111) ---------------------------------------------------


def test_statement_committed_during_the_build_is_not_used(
    env: Env, monkeypatch: pytest.MonkeyPatch, postgres_connection_string: str
) -> None:
    """DAC-E2-9, AC-19: a newer observation committed after the build began is not seen;
    the next set uses it and the first set's rows are unchanged."""
    add_quarters(env.conn, env.stock, P1, 8, standard())

    def commit_newer_statement(conn: psycopg.Connection, ctx: BuildContext) -> None:
        with psycopg.connect(postgres_connection_string) as other:
            add_statement(
                other,
                env.stock,
                P1,
                "income_statement",
                {
                    TEST_KEYS["revenue"]: Decimal(230),
                    TEST_KEYS["net_income"]: Decimal(113),
                    TEST_KEYS["diluted_eps"]: Decimal("1.3"),
                },
                observed_on=date(2026, 10, 17),
            )

    install_test_line_items(monkeypatch)
    monkeypatch.setattr(
        engine, "_STAGES", [commit_newer_statement, engine._fundamental_inputs_stage]
    )
    assert engine.build(env.conn, env.set_id, 60).state == "complete"
    first = inputs_for(env.conn, env.set_id, env.stock)
    assert first["revenue_growth"]["value"] == REVENUE_GROWTH
    assert first["revenue_growth"]["known_on"] == P1 + timedelta(days=15)

    second_set = add_building_set(env.conn, add_run(env.conn), D)
    assert run_fundamentals_stage(env.conn, second_set, monkeypatch).state == "complete"

    second = inputs_for(env.conn, second_set, env.stock)
    assert second["revenue_growth"]["value"] == ratio(Decimal(575), Decimal(370), 1)
    assert second["revenue_growth"]["known_on"] == date(2026, 10, 17)
    assert inputs_for(env.conn, env.set_id, env.stock) == first
