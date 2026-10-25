"""Helpers for the classification scheduler's database tests (CAP-002-E2-S8).

A plain module, not a conftest: it has no fixtures. Every helper that writes commits.
"""

from datetime import UTC, date, datetime
from typing import Any
from uuid import UUID

import psycopg
from psycopg_pool import ConnectionPool

from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover

TERMINAL_RUN_STATES = ("succeeded", "partial", "failed", "cancelled", "abandoned")
INTERRUPTED_REASON = "interrupted: the application restarted during the build"


def migrate_all(connection_string: str) -> None:
    """Apply every migration and assert the classification tables (version 6) are present."""
    with psycopg.connect(connection_string) as conn:
        apply_pending(conn, discover(MIGRATIONS_DIR))
        with conn.cursor() as cur:
            cur.execute("SELECT version FROM applied_migrations")
            versions = {row[0] for row in cur.fetchall()}
    assert 6 in versions


def open_pool(connection_string: str) -> "ConnectionPool[Any]":
    return ConnectionPool(connection_string, min_size=1, max_size=2, open=True)


def add_run(conn: psycopg.Connection, state: str, ended_at: datetime | None = None) -> UUID:
    """Insert an acquisition_run in `state` that satisfies the table's CHECK constraints."""
    with conn.cursor() as cur:
        if state in TERMINAL_RUN_STATES:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years, ended_at) "
                "VALUES (%s, 1, COALESCE(%s, now())) RETURNING run_id",
                (state, ended_at),
            )
        elif state == "running":
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years, started_at, "
                "claimed_by, heartbeat_at) VALUES ('running', 1, now(), 'runner', now()) "
                "RETURNING run_id"
            )
        else:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years) VALUES (%s, 1) "
                "RETURNING run_id",
                (state,),
            )
        row = cur.fetchone()
    conn.commit()
    assert row is not None
    return UUID(str(row[0]))


def add_set(
    conn: psycopg.Connection,
    run_id: UUID,
    state: str,
    classification_date: date = date(2026, 10, 1),
    failure_reason: str = "RuntimeError: boom",
) -> UUID:
    """Insert a classification_set in `state` that satisfies the terminal-shape CHECKs."""
    columns: dict[str, Any] = {
        "run_id": run_id,
        "state": state,
        "classification_date": classification_date,
    }
    if state in ("complete", "failed"):
        columns["ended_at"] = datetime(2026, 10, 1, 12, 0, tzinfo=UTC)
    if state == "complete":
        columns["latest_trading_day"] = date(2026, 9, 30)
        columns["active_instruments"] = 0
    if state == "failed":
        columns["failure_reason"] = failure_reason
    names = ", ".join(columns)
    marks = ", ".join(["%s"] * len(columns))
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO classification_set ({names}) VALUES ({marks}) RETURNING set_id",  # noqa: S608
            tuple(columns.values()),
        )
        row = cur.fetchone()
    conn.commit()
    assert row is not None
    return UUID(str(row[0]))


def set_rows(conn: psycopg.Connection) -> list[tuple[Any, ...]]:
    """Every set as (set_id, run_id, state, failure_reason), oldest first."""
    with conn.cursor() as cur:
        cur.execute(
            "SELECT set_id, run_id, state, failure_reason FROM classification_set "
            "ORDER BY started_at, set_id"
        )
        rows = cur.fetchall()
    conn.rollback()
    return rows
