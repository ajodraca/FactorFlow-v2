"""Seed classification sets directly for the reader's database tests (CAP-002-E3-S1).

A plain module rather than ``conftest.py``: ``tests/conftest.py`` is a delivered file.
The reader is tested independently of the engine (``component-design-classification-reader.md``
section 7), so these helpers write ``research-store`` rows straight into the tables, with
bound parameters only, and commit so the reader's statements see them. Later E3 reader
stories import and extend this module; CAP-002-E3-S2 adds the classification, reference and
universe helpers below ``insert_stock_inputs``.
"""

import hashlib
from collections.abc import Iterable
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
from psycopg.types.json import Jsonb

from factorflow.classification.constants import FACTORS, INPUT_NAMES


def insert_instrument(conn: psycopg.Connection, symbol: str, lifecycle: str = "active") -> int:
    row = conn.execute(
        "INSERT INTO instrument (symbol, lifecycle, retired_at) "
        "VALUES (%s, %s, CASE WHEN %s = 'retired' THEN now() END) RETURNING instrument_id",
        (symbol, lifecycle, lifecycle),
    ).fetchone()
    conn.commit()
    assert row is not None
    return int(row[0])


def insert_run(conn: psycopg.Connection, state: str = "succeeded", *, started_at: datetime) -> UUID:
    """An acquisition run; a terminal state gets an ``ended_at`` (terminal_has_end)."""
    row = conn.execute(
        "INSERT INTO acquisition_run (state, history_depth_years, started_at, ended_at) "
        "VALUES (%s, 5, %s, CASE WHEN %s IN ('succeeded', 'partial', 'failed', 'cancelled', "
        "'abandoned') THEN %s::timestamptz END) RETURNING run_id",
        (state, started_at, state, started_at),
    ).fetchone()
    conn.commit()
    assert row is not None
    return row[0]  # type: ignore[no-any-return]


def insert_set(
    conn: psycopg.Connection,
    run_id: UUID,
    state: str,
    *,
    started_at: datetime,
    ended_at: datetime | None = None,
    classification_date: date = date(2026, 10, 15),
    latest_trading_day: date | None = None,
    active_instruments: int | None = None,
    failure_reason: str | None = None,
    factors: dict[str, tuple[int, bool]] | None = None,
) -> UUID:
    """A ``classification_set`` row and its three ``classification_set_factor`` rows.

    ``factors`` maps a factor to ``(qualified_count, ranked)``; a factor it omits gets
    ``(0, False)``. The caller supplies the values the set's CHECK constraints require.
    """
    row = conn.execute(
        "INSERT INTO classification_set (run_id, state, classification_date, latest_trading_day, "
        "active_instruments, started_at, ended_at, failure_reason) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING set_id",
        (
            run_id,
            state,
            classification_date,
            latest_trading_day,
            active_instruments,
            started_at,
            ended_at,
            failure_reason,
        ),
    ).fetchone()
    assert row is not None
    set_id: UUID = row[0]
    given = factors or {}
    for factor in FACTORS:
        qualified_count, ranked = given.get(factor, (0, False))
        conn.execute(
            "INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked) "
            "VALUES (%s, %s, %s, %s)",
            (set_id, factor, qualified_count, ranked),
        )
    conn.commit()
    return set_id


def insert_input(
    conn: psycopg.Connection,
    set_id: UUID,
    instrument_id: int,
    factor: str,
    input_name: str,
    status: str,
    *,
    value: Any = None,
    as_of: date | None = None,
    known_on: date | None = None,
    restated_possible: bool = False,
    detail: dict[str, Any] | None = None,
) -> None:
    """One ``factor_input`` row; a ``present`` one defaults its value and dates."""
    if status == "present":
        value = 1 if value is None else value
        as_of = date(2026, 9, 30) if as_of is None else as_of
        known_on = date(2026, 10, 1) if known_on is None else known_on
    conn.execute(
        "INSERT INTO factor_input (set_id, instrument_id, factor, input_name, status, value, "
        "as_of, known_on, restated_possible, detail) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (
            set_id,
            instrument_id,
            factor,
            input_name,
            status,
            value,
            as_of,
            known_on,
            restated_possible,
            Jsonb(detail or {}),
        ),
    )
    conn.commit()


def insert_stock_inputs(
    conn: psycopg.Connection,
    set_id: UUID,
    instrument_id: int,
    statuses: dict[str, str] | None = None,
) -> None:
    """The stock's eight ``factor_input`` rows, ``present`` unless ``statuses`` names the input."""
    given = statuses or {}
    for factor in FACTORS:
        for input_name in INPUT_NAMES[factor]:
            insert_input(
                conn, set_id, instrument_id, factor, input_name, given.get(input_name, "present")
            )


# --- CAP-002-E3-S2: classification rows, reference names and universes --------------------

Reason = tuple[str, str | None]  # (reason_code, reason_input or None)
Scored = tuple[Decimal, Decimal]  # (score, percentile)
INPUT_REASONS = ("input_missing", "input_outdated", "input_not_computable")


def insert_classification(
    conn: psycopg.Connection,
    set_id: UUID,
    instrument_id: int,
    factor: str,
    status: str = "classified",
    *,
    score: Decimal | None = None,
    percentile: Decimal | None = None,
    reason_code: str | None = None,
    reason_input: str | None = None,
    reason_detail: str | None = None,
    restated_possible: bool = False,
) -> None:
    """One ``factor_classification`` row; the caller supplies a shape the CHECKs accept
    (``factor_classification_shape``, ``factor_classification_reason_input_agrees``)."""
    conn.execute(
        "INSERT INTO factor_classification (set_id, instrument_id, factor, status, score, "
        "percentile, reason_code, reason_input, reason_detail, restated_possible) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (
            set_id,
            instrument_id,
            factor,
            status,
            score,
            percentile,
            reason_code,
            reason_input,
            reason_detail,
            restated_possible,
        ),
    )
    conn.commit()


def insert_reference(
    conn: psycopg.Connection,
    instrument_id: int,
    company_name: str,
    *,
    recorded_at: datetime | None = None,
) -> None:
    """One ``instrument_reference`` row carrying the company name the list reads (DEC-0245);
    ``recorded_at`` defaults to now()."""
    conn.execute(
        "INSERT INTO instrument_reference (instrument_id, value_hash, company_name, payload, "
        "recorded_at) VALUES (%s, %s, %s, %s, COALESCE(%s, now()))",
        (
            instrument_id,
            hashlib.sha256(f"{instrument_id}:{company_name}".encode()).digest(),
            company_name,
            Jsonb({"name": company_name}),
            recorded_at,
        ),
    )
    conn.commit()


def insert_universe(conn: psycopg.Connection, name: str, instrument_ids: Iterable[int]) -> UUID:
    """A ``universe`` with its ``created`` event and one ``member_added`` event per instrument."""
    row = conn.execute("INSERT INTO universe DEFAULT VALUES RETURNING universe_id").fetchone()
    assert row is not None
    universe_id: UUID = row[0]
    conn.execute(
        "INSERT INTO universe_event (universe_id, event_type, name) VALUES (%s, 'created', %s)",
        (universe_id, name),
    )
    for instrument_id in instrument_ids:
        add_member(conn, universe_id, instrument_id)
    conn.commit()
    return universe_id


def add_member(
    conn: psycopg.Connection,
    universe_id: UUID,
    instrument_id: int,
    *,
    recorded_on: date | None = None,
) -> None:
    """A ``member_added`` event; ``recorded_on`` defaults to the column's America/Chicago
    date of now (DEC-0065)."""
    conn.execute(
        "INSERT INTO universe_event (universe_id, event_type, instrument_id, recorded_on) "
        "VALUES (%s, 'member_added', %s, "
        "COALESCE(%s::date, (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date))",
        (universe_id, instrument_id, recorded_on),
    )
    conn.commit()


def remove_member(conn: psycopg.Connection, universe_id: UUID, instrument_id: int) -> None:
    conn.execute(
        "INSERT INTO universe_event (universe_id, event_type, instrument_id) "
        "VALUES (%s, 'member_removed', %s)",
        (universe_id, instrument_id),
    )
    conn.commit()


def retire_universe(conn: psycopg.Connection, universe_id: UUID) -> None:
    conn.execute(
        "INSERT INTO universe_event (universe_id, event_type) VALUES (%s, 'retired')",
        (universe_id,),
    )
    conn.commit()


def seed_scored_stock(
    conn: psycopg.Connection,
    set_id: UUID,
    symbol: str,
    *,
    value: Scored | Reason = (Decimal("0.5"), Decimal("50")),
    growth: Scored | Reason = (Decimal("0.5"), Decimal("50")),
    momentum: Scored | Reason = (Decimal("0.5"), Decimal("50")),
    lifecycle: str = "active",
    restated: Iterable[str] = (),
    name: str | None = None,
) -> int:
    """An instrument and its three ``factor_classification`` rows in one call.

    Each factor takes ``(score, percentile)`` for a classified cell or ``(reason_code,
    reason_input_or_None)`` for a ``not_classified`` one; an input reason gets a
    ``reason_detail`` naming its input. ``restated`` names the factors whose row carries
    ``restated_possible``; ``name`` stores an ``instrument_reference`` company name.
    """
    instrument_id = insert_instrument(conn, symbol, lifecycle)
    if name is not None:
        insert_reference(conn, instrument_id, name)
    marked = set(restated)
    for factor, given in zip(FACTORS, (value, growth, momentum), strict=True):
        if isinstance(given[0], str):
            reason_code, reason_input = given[0], given[1]
            assert reason_input is None or isinstance(reason_input, str)
            insert_classification(
                conn,
                set_id,
                instrument_id,
                factor,
                "not_classified",
                reason_code=reason_code,
                reason_input=reason_input,
                reason_detail=(
                    f"{reason_input} is {reason_code}" if reason_code in INPUT_REASONS else None
                ),
                restated_possible=factor in marked,
            )
        else:
            score, percentile = given
            assert isinstance(score, Decimal) and isinstance(percentile, Decimal)
            insert_classification(
                conn,
                set_id,
                instrument_id,
                factor,
                score=score,
                percentile=percentile,
                restated_possible=factor in marked,
            )
    return instrument_id


# --- CAP-002-E3-S3: a stock's eight inputs and a universe rename ---------------------------


def seed_inputs(
    conn: psycopg.Connection,
    set_id: UUID,
    instrument_id: int,
    *,
    statuses: dict[str, str] | None = None,
    values: dict[str, Any] | None = None,
    restated: Iterable[str] = (),
) -> None:
    """The stock's eight ``factor_input`` rows through ``insert_input``.

    Every input is ``present`` unless ``statuses`` names it; ``values`` overrides a present
    input's value and ``restated`` names the inputs whose row carries ``restated_possible``.
    """
    given = statuses or {}
    valued = values or {}
    marked = set(restated)
    for factor in FACTORS:
        for input_name in INPUT_NAMES[factor]:
            insert_input(
                conn,
                set_id,
                instrument_id,
                factor,
                input_name,
                given.get(input_name, "present"),
                value=valued.get(input_name),
                restated_possible=input_name in marked,
            )


def rename_universe(conn: psycopg.Connection, universe_id: UUID, name: str) -> None:
    conn.execute(
        "INSERT INTO universe_event (universe_id, event_type, name) VALUES (%s, 'renamed', %s)",
        (universe_id, name),
    )
    conn.commit()
