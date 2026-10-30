"""Seed classification sets directly for the reader's database tests (CAP-002-E3-S1).

A plain module rather than ``conftest.py``: ``tests/conftest.py`` is a delivered file.
The reader is tested independently of the engine (``component-design-classification-reader.md``
section 7), so these helpers write ``research-store`` rows straight into the tables, with
bound parameters only, and commit so the reader's statements see them. Later E3 reader
stories import and extend this module.
"""

from datetime import date, datetime
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
) -> None:
    """One ``factor_input`` row; a ``present`` one defaults its value and dates."""
    if status == "present":
        value = 1 if value is None else value
        as_of = date(2026, 9, 30) if as_of is None else as_of
        known_on = date(2026, 10, 1) if known_on is None else known_on
    conn.execute(
        "INSERT INTO factor_input (set_id, instrument_id, factor, input_name, status, value, "
        "as_of, known_on, detail) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (set_id, instrument_id, factor, input_name, status, value, as_of, known_on, Jsonb({})),
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
