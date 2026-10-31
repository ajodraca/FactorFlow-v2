"""Helpers for the restatement-mark tests (CAP-002-E2-S6).

A plain module rather than ``conftest.py``. It imports the helper modules of CAP-002-E2-S2,
CAP-002-E2-S3 and CAP-002-E2-S5 and edits none of them (T002). Every statement row is
written through S3's ``add_statement`` with ``observed_on`` and ``provider_filing_date``
passed explicitly, so the instrument's first fundamentals ``observed_on``, which
``statements.sql`` compares the filing date with (DEC-0056), is the one a test intends.
Every writing helper commits, and every reading helper ends its transaction.
"""

from collections.abc import Collection
from datetime import date, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import constants, engine, line_items
from factorflow.classification.engine import BuildResult
from tests.integration.engine_inputs_support import (
    TEST_KEYS,
    add_statement,
    install_test_line_items,
    months_before,
)
from tests.integration.engine_support import add_bar

MIN_FLOOR = 3
"""The peer-set floor the tests build at, so four hand-built stocks rank; S5 tests the 30."""

STATEMENT_TYPES = ("balance_sheet", "income_statement", "cash_flow_statement")
BACKFILL_LEAD = timedelta(days=30)
"""How long before the first observation a backfilled row was filed."""

_INSERT_INPUT = (
    "INSERT INTO factor_input (set_id, instrument_id, factor, input_name, status, value, "
    "as_of, known_on, restated_possible, detail) "
    "VALUES (%s, %s, %s, %s, 'present', %s, %s, %s, %s, '{}'::jsonb)"
)
_INPUT_DATE = date(2026, 10, 2)


def all_rows(quarters: int = 8) -> frozenset[tuple[str, int]]:
    """Every ``(statement_type, quarter_index)`` ``add_fundamentals`` writes."""
    return frozenset((t, k) for t in STATEMENT_TYPES for k in range(quarters))


def run_two_stage_build(
    conn: psycopg.Connection,
    set_id: UUID,
    monkeypatch: pytest.MonkeyPatch,
    floor: int = MIN_FLOOR,
) -> BuildResult:
    """``engine.build`` with the fundamentals and classification stages only, at ``floor``.

    Neither CAP-002-E2-S4's momentum stage nor any later story's stage runs.
    """
    monkeypatch.setattr(constants, "MIN_PEER_SET_SIZE", floor)
    install_test_line_items(monkeypatch)
    monkeypatch.setattr(
        engine, "_STAGES", [engine._fundamental_inputs_stage, engine._classification_stage]
    )
    return engine.build(conn, set_id, 60)


def statement_payload(
    instrument_id: int, statement_type: str, quarter_index: int
) -> dict[str, Decimal]:
    """The statement's payload under the test keys, distinct per stock and quarter.

    The per-stock terms are not linear in one another, so no two inputs are perfectly
    correlated across a peer set, and every prior-year sum stays positive.
    """
    s, k = instrument_id, quarter_index
    items: dict[str, Decimal] = {
        "book_equity": Decimal(400 + 37 * s - 10 * k),
        "shares_outstanding": Decimal(100 + 10 * (s * s % 7) + s),
        "net_income": Decimal(12 + 5 * s % 9 - k),
        "diluted_eps": Decimal(18 + 3 * (s % 4) - k) / 10,
        "revenue": Decimal(100 + 3 * s * s - 2 * k * (1 + s % 3)),
        "operating_cash_flow": Decimal(30 + 2 * s + s * s % 5 + k),
        "capital_expenditure": Decimal(-(5 + 7 * s % 11)),  # reported as an outflow
    }
    return {
        TEST_KEYS[name]: value
        for name, value in items.items()
        if line_items.LINE_ITEMS[name].statement_type == statement_type
    }


def add_fundamentals(
    conn: psycopg.Connection,
    instrument_id: int,
    *,
    latest_period_end: date,
    first_observed_on: date,
    filed_before_first: Collection[tuple[str, int]] = frozenset(),
    quarters: int = 8,
    extra_old_quarter_backfilled: bool = False,
    statement_types: tuple[str, ...] = STATEMENT_TYPES,
) -> list[date]:
    """``quarters`` quarterly periods of each of ``statement_types``, newest first.

    Quarter index 0 is ``latest_period_end`` and each older quarter is 3 calendar months
    earlier. Every row is observed on ``first_observed_on`` and filed on it too (equal, so
    not backfilled under DEC-0056's strict "earlier than"), except each
    ``(statement_type, quarter_index)`` in ``filed_before_first``, filed ``BACKFILL_LEAD``
    earlier (backfilled). ``extra_old_quarter_backfilled`` adds a ninth, backfilled
    income statement 24 months before ``latest_period_end``, outside both windows. Each
    period of each type is written once, so the stock's first ``observed_on`` is exactly
    ``first_observed_on``. Returns the period ends, newest first.
    """
    ends = [months_before(latest_period_end, 3 * k) for k in range(quarters)]
    backfilled_on = first_observed_on - BACKFILL_LEAD
    for k, end in enumerate(ends):
        for statement_type in statement_types:
            add_statement(
                conn,
                instrument_id,
                end,
                statement_type,
                statement_payload(instrument_id, statement_type, k),
                observed_on=first_observed_on,
                provider_filing_date=(
                    backfilled_on
                    if (statement_type, k) in filed_before_first
                    else first_observed_on
                ),
            )
    if extra_old_quarter_backfilled:
        add_statement(
            conn,
            instrument_id,
            months_before(latest_period_end, 24),
            "income_statement",
            statement_payload(instrument_id, "income_statement", 8),
            observed_on=first_observed_on,
            provider_filing_date=backfilled_on,
        )
    return ends


def add_bar_for(conn: psycopg.Connection, instrument_id: int, session_date: date) -> None:
    """A bar on ``session_date`` (close 10), so the stock's market capitalisation is defined."""
    add_bar(conn, instrument_id, session_date)


def _input_value(instrument_id: int, position: int) -> Decimal:
    return Decimal(position + 1) + Decimal(instrument_id * (position + 3) % 11) / 100


def add_marked_inputs(
    conn: psycopg.Connection,
    set_id: UUID,
    instrument_id: int,
    factor: str,
    restated: bool = False,
) -> None:
    """A ``present`` ``factor_input`` row per input of the factor, in the shape of S5's
    ``add_factor_inputs`` but with ``restated_possible`` set to ``restated``."""
    rows = [
        (
            set_id,
            instrument_id,
            factor,
            name,
            _input_value(instrument_id, position),
            _INPUT_DATE,
            _INPUT_DATE,
            restated,
        )
        for position, name in enumerate(constants.INPUT_NAMES[factor])
    ]
    with conn.cursor() as cur:
        cur.executemany(_INSERT_INPUT, rows)
    conn.commit()


def add_momentum_inputs(
    conn: psycopg.Connection, set_id: UUID, instrument_id: int, restated: bool = False
) -> None:
    """The three ``present`` momentum rows, with ``restated_possible`` set to ``restated``."""
    add_marked_inputs(conn, set_id, instrument_id, "momentum", restated)


def input_flags(conn: psycopg.Connection, set_id: UUID, instrument_id: int) -> dict[str, bool]:
    """``restated_possible`` of each of the stock's ``factor_input`` rows, by input name."""
    rows = conn.execute(
        "SELECT input_name, restated_possible FROM factor_input "
        "WHERE set_id = %s AND instrument_id = %s",
        (set_id, instrument_id),
    ).fetchall()
    conn.commit()
    return {name: flag for name, flag in rows}


def classification_flags(conn: psycopg.Connection, set_id: UUID) -> dict[tuple[int, str], bool]:
    """``restated_possible`` of every ``factor_classification`` row of the set."""
    rows = conn.execute(
        "SELECT instrument_id, factor, restated_possible FROM factor_classification "
        "WHERE set_id = %s",
        (set_id,),
    ).fetchall()
    conn.commit()
    return {(instrument_id, factor): flag for instrument_id, factor, flag in rows}


def snapshot(conn: psycopg.Connection, set_id: UUID) -> list[tuple[Any, ...]]:
    """Every ``factor_classification`` row of the set, all columns, in primary-key order."""
    rows = conn.execute(
        "SELECT * FROM factor_classification WHERE set_id = %s "
        "ORDER BY set_id, instrument_id, factor",
        (set_id,),
    ).fetchall()
    conn.commit()
    return rows


def input_snapshot(conn: psycopg.Connection, set_id: UUID) -> list[tuple[Any, ...]]:
    """Every ``factor_input`` row of the set, all columns, in primary-key order."""
    rows = conn.execute(
        "SELECT * FROM factor_input WHERE set_id = %s "
        "ORDER BY set_id, instrument_id, factor, input_name",
        (set_id,),
    ).fetchall()
    conn.commit()
    return rows
