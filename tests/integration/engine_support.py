"""Shared helpers for the factor engine's database tests (CAP-002-E2-S2).

A plain module rather than ``conftest.py``: ``tests/conftest.py`` is a delivered file.
Every helper takes the connection and commits, so a second connection sees the result.
Test setup writes through the tables directly; that is setup against a throwaway
database and never production code.
"""

from datetime import date
from uuid import UUID

import psycopg

from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover

CLASSIFICATION_TABLES = (
    "classification_set",
    "classification_set_factor",
    "factor_input",
    "factor_classification",
)


def migrate_through_classification(connection_string: str) -> psycopg.Connection:
    """Open a connection to a store migrated through 0006 (the classification tables)."""
    connection = psycopg.connect(connection_string)
    applied = apply_pending(connection, discover(MIGRATIONS_DIR))
    connection.commit()
    assert applied[:6] == [1, 2, 3, 4, 5, 6], applied
    return connection


def add_instrument(conn: psycopg.Connection, symbol: str, lifecycle: str = "active") -> int:
    row = conn.execute(
        "INSERT INTO instrument (symbol, lifecycle, retired_at) "
        "VALUES (%s, %s, CASE WHEN %s = 'retired' THEN now() END) RETURNING instrument_id",
        (symbol, lifecycle, lifecycle),
    ).fetchone()
    conn.commit()
    assert row is not None
    return int(row[0])


def add_bar(
    conn: psycopg.Connection,
    instrument_id: int,
    session_date: date,
    close: int = 10,
    observed_on: date | None = None,
) -> None:
    """A bar observed on its own session date unless ``observed_on`` says otherwise."""
    conn.execute(
        "INSERT INTO daily_bar (instrument_id, session_date, observed_on, value_hash, "
        "open_price, high_price, low_price, close_price, volume) "
        "VALUES (%s, %s, %s, sha256(%s::text::bytea), %s, %s, %s, %s, 1000)",
        (
            instrument_id,
            session_date,
            session_date if observed_on is None else observed_on,
            f"{instrument_id}{session_date}{close}",
            close,
            close,
            close,
            close,
        ),
    )
    conn.commit()


def add_run(conn: psycopg.Connection, state: str = "succeeded") -> UUID:
    row = conn.execute(
        "INSERT INTO acquisition_run (state, history_depth_years, started_at, ended_at) "
        "VALUES (%s, 5, now(), now()) RETURNING run_id",
        (state,),
    ).fetchone()
    conn.commit()
    assert row is not None
    return row[0]  # type: ignore[no-any-return]


def add_building_set(conn: psycopg.Connection, run_id: UUID, classification_date: date) -> UUID:
    row = conn.execute(
        "INSERT INTO classification_set (run_id, state, classification_date) "
        "VALUES (%s, 'building', %s) RETURNING set_id",
        (run_id, classification_date),
    ).fetchone()
    conn.commit()
    assert row is not None
    return row[0]  # type: ignore[no-any-return]


def count_classification_rows(conn: psycopg.Connection, set_id: UUID) -> dict[str, int]:
    """Rows held for the set in the three child tables (the set row itself is not counted)."""
    counts: dict[str, int] = {}
    for table in CLASSIFICATION_TABLES[1:]:
        row = conn.execute(
            f"SELECT count(*) FROM {table} WHERE set_id = %s",  # noqa: S608 - fixed names
            (set_id,),
        ).fetchone()
        assert row is not None
        counts[table] = int(row[0])
    return counts
