"""Helpers for the factor engine's fundamentals-stage tests (CAP-002-E2-S3).

A plain module rather than ``conftest.py``. It builds on CAP-002-E2-S2's
``engine_support`` without editing it. The real Massive payload keys are the owner's
open question (factor-engine design section 14 question 1), so the tests install their
own keys (design section 7: "fixtures declare their own payload keys"). Every writing
helper commits, so the build's connection sees what a test wrote.
"""

import calendar
import hashlib
import json
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import engine, line_items
from factorflow.classification.engine import BuildResult
from factorflow.classification.line_items import LineItem
from tests.integration.engine_support import (
    add_bar,
    add_building_set,
    add_instrument,
    add_run,
    migrate_through_classification,
)

__all__ = [
    "TEST_KEYS",
    "add_bar",
    "add_building_set",
    "add_instrument",
    "add_quarters",
    "add_run",
    "add_statement",
    "install_test_line_items",
    "inputs_for",
    "migrate_through_classification",
    "months_before",
    "run_fundamentals_stage",
]

TEST_KEYS: dict[str, str] = {
    "book_equity": "t_book_equity",
    "shares_outstanding": "t_shares_outstanding",
    "net_income": "t_net_income",
    "diluted_eps": "t_diluted_eps",
    "revenue": "t_revenue",
    "operating_cash_flow": "t_operating_cash_flow",
    "capital_expenditure": "t_capital_expenditure",
}
"""A test payload key per line item; never a real Massive key."""

# Capital expenditure is reported as an outflow (negative) in the fixtures, so the
# sign path of design 2.4 ``LineItem.sign`` is exercised.
_TEST_SIGNS: dict[str, int] = {"capital_expenditure": -1}

STATEMENT_TYPES = ("balance_sheet", "income_statement", "cash_flow_statement")


def install_test_line_items(
    monkeypatch: pytest.MonkeyPatch, overrides: dict[str, tuple[str, int]] | None = None
) -> None:
    """Replace every ``LINE_ITEMS`` entry with its test key; ``overrides`` sets (key, sign)."""
    for name, item in line_items.LINE_ITEMS.items():
        key, sign = TEST_KEYS[name], _TEST_SIGNS.get(name, 1)
        if overrides and name in overrides:
            key, sign = overrides[name]
        monkeypatch.setitem(
            line_items.LINE_ITEMS, name, LineItem(item.label, item.statement_type, key, sign)
        )


def months_before(day: date, months: int) -> date:
    """``day`` minus whole calendar months, clamped to the month's last day."""
    index = day.year * 12 + day.month - 1 - months
    year, month = divmod(index, 12)
    last = calendar.monthrange(year, month + 1)[1]
    return date(year, month + 1, min(day.day, last))


def _json_value(value: Any, numbers: bool) -> str:
    if isinstance(value, Decimal):
        # model_dump(mode="json") writes a Decimal as a JSON string (DEC-0117).
        plain = format(value, "f")
        return plain if numbers else json.dumps(plain)
    return json.dumps(value)


def _payload_text(payload: dict[str, Any], numbers: bool) -> str:
    return (
        "{"
        + ", ".join(f"{json.dumps(k)}: {_json_value(v, numbers)}" for k, v in payload.items())
        + "}"
    )


def add_statement(
    conn: psycopg.Connection,
    instrument_id: int,
    period_end: date,
    statement_type: str,
    payload: dict[str, Any],
    fiscal_period: str = "Q1",
    observed_on: date | None = None,
    provider_filing_date: date | None = None,
    *,
    numbers: bool = False,
    recorded_at: datetime | None = None,
) -> None:
    """One ``fundamental_observation`` row; ``payload`` maps payload keys to values.

    ``observed_on`` defaults to 15 days after the period end. A ``Decimal`` value is
    written as a JSON string holding its plain decimal, or as a JSON number when
    ``numbers`` is true; any other value is written as the JSON value given.
    ``recorded_at`` defaults to the database's ``now()``.
    """
    observed = period_end + timedelta(days=15) if observed_on is None else observed_on
    text = _payload_text(payload, numbers)
    digest = hashlib.sha256(
        json.dumps(
            [
                instrument_id,
                str(period_end),
                fiscal_period,
                statement_type,
                str(observed),
                str(provider_filing_date),
                text,
                str(recorded_at),
            ]
        ).encode()
    ).digest()
    conn.execute(
        "INSERT INTO fundamental_observation (instrument_id, fiscal_period_end, fiscal_period, "
        "statement_type, observed_on, value_hash, provider_filing_date, payload, recorded_at) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, coalesce(%s, now()))",
        (
            instrument_id,
            period_end,
            fiscal_period,
            statement_type,
            observed,
            digest,
            provider_filing_date,
            text,
            recorded_at,
        ),
    )
    conn.commit()


def add_quarters(
    conn: psycopg.Connection,
    instrument_id: int,
    latest_period_end: date,
    n: int,
    values: list[dict[str, Any]],
    *,
    numbers: bool = False,
) -> list[date]:
    """``n`` quarterly period ends, 3 calendar months apart and newest first, each with a
    balance sheet, an income statement and a cash-flow statement.

    ``values[k]`` maps line-item names to the values of period ``k``; each item lands in
    its own statement type under its test key, and an item omitted from a period's dict
    is absent from that payload. Returns the period ends, newest first.
    """
    assert len(values) == n
    ends = [months_before(latest_period_end, 3 * k) for k in range(n)]
    for end, period in zip(ends, values, strict=True):
        for statement_type in STATEMENT_TYPES:
            payload = {
                TEST_KEYS[name]: value
                for name, value in period.items()
                if line_items.LINE_ITEMS[name].statement_type == statement_type
            }
            add_statement(conn, instrument_id, end, statement_type, payload, numbers=numbers)
    return ends


def run_fundamentals_stage(
    conn: psycopg.Connection, set_id: UUID, monkeypatch: pytest.MonkeyPatch
) -> BuildResult:
    """Build ``set_id`` with only this story's stage, so later stories' stages never run."""
    monkeypatch.setattr(engine, "_STAGES", [engine._fundamental_inputs_stage])
    return engine.build(conn, set_id, 60)


def inputs_for(conn: psycopg.Connection, set_id: UUID, instrument_id: int) -> dict[str, dict]:
    """The stock's ``factor_input`` rows of the set, by input name.

    ``detail`` is parsed with ``Decimal`` for JSON numbers with a fraction, so numeric
    components compare exactly.
    """
    rows = conn.execute(
        "SELECT input_name, factor, status, value, as_of, known_on, restated_possible, "
        "detail::text FROM factor_input WHERE set_id = %s AND instrument_id = %s",
        (set_id, instrument_id),
    ).fetchall()
    conn.commit()
    return {
        row[0]: {
            "factor": row[1],
            "status": row[2],
            "value": row[3],
            "as_of": row[4],
            "known_on": row[5],
            "restated_possible": row[6],
            "detail": json.loads(row[7], parse_float=Decimal),
        }
        for row in rows
    }
