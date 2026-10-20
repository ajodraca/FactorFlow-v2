"""Migration 0005 through the production migrator, and a second run after it."""

from typing import Any

import psycopg
import pytest

from factorflow.db.migrate_main import MIGRATIONS_DIR, run_migrations
from factorflow.db.migrator import apply_pending, discover

pytestmark = pytest.mark.postgres


def seed_cap_001_rows(conn: psycopg.Connection) -> None:
    """Insert one row into each CAP-001 table a later migration could disturb."""
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle) VALUES ('ABC', 'active') "
            "RETURNING instrument_id"
        )
        row = cur.fetchone()
        assert row is not None
        instrument_id = row[0]
        cur.execute(
            "INSERT INTO daily_bar (instrument_id, session_date, value_hash, open_price, "
            "high_price, low_price, close_price, volume) "
            "VALUES (%s, '2020-01-02', decode(repeat('ab', 32), 'hex'), 1, 2, 1, 2, 100)",
            (instrument_id,),
        )
        cur.execute(
            "INSERT INTO fundamental_observation (instrument_id, fiscal_period_end, "
            "fiscal_period, statement_type, value_hash, payload) "
            "VALUES (%s, '2019-12-31', 'FY', 'ratios', decode(repeat('cd', 32), 'hex'), '{}')",
            (instrument_id,),
        )
        cur.execute(
            "INSERT INTO acquisition_run (state, history_depth_years) VALUES ('requested', 1)"
        )
    conn.commit()


def cap_001_tables(conn: psycopg.Connection) -> list[str]:
    """Every table in the catalogue; call it once migrations 0001 to 0004 are applied."""
    with conn.cursor() as cur:
        cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1")
        return [row[0] for row in cur.fetchall()]


def snapshot_cap_001(
    conn: psycopg.Connection, tables: list[str]
) -> dict[str, list[tuple[Any, ...]]]:
    """Every row of the given tables, as text, in a stable order."""
    snapshot: dict[str, list[tuple[Any, ...]]] = {}
    with conn.cursor() as cur:
        for table in tables:
            cur.execute(f"SELECT t::text FROM {table} t ORDER BY 1")  # noqa: S608
            snapshot[table] = cur.fetchall()
    return snapshot


# Implements TC-COMP-045
def test_migration_0005_applies_without_touching_cap_001_rows(
    postgres_connection_string: str,
) -> None:
    conn = psycopg.connect(postgres_connection_string)
    try:
        files = discover(MIGRATIONS_DIR)
        assert apply_pending(conn, [f for f in files if f.version <= 4]) == [1, 2, 3, 4]
        seed_cap_001_rows(conn)
        tables = cap_001_tables(conn)
        assert len(tables) == 11
        before = snapshot_cap_001(conn, tables)

        assert apply_pending(conn, [f for f in files if f.version <= 5]) == [5]

        after = snapshot_cap_001(conn, tables)
        recorded_before = [
            row for row in after["applied_migrations"] if row not in before["applied_migrations"]
        ]
        assert len(recorded_before) == 1
        assert {table: rows for table, rows in after.items() if table != "applied_migrations"} == {
            table: rows for table, rows in before.items() if table != "applied_migrations"
        }
        assert set(before["applied_migrations"]) <= set(after["applied_migrations"])
        with conn.cursor() as cur:
            cur.execute("SELECT version, checksum FROM applied_migrations WHERE version = 5")
            assert cur.fetchall() == [(5, files[4].checksum)]
            cur.execute("SELECT count(*) FROM universe")
            assert cur.fetchone() == (0,)
            cur.execute("SELECT count(*) FROM universe_event")
            assert cur.fetchone() == (0,)
    finally:
        conn.close()


# Implements TC-COMP-048
def test_second_migrator_run_after_0005_applies_nothing(
    postgres_connection_string: str,
) -> None:
    highest = max(f.version for f in discover(MIGRATIONS_DIR))

    first_code, _ = run_migrations(postgres_connection_string, MIGRATIONS_DIR)
    assert first_code == 0
    with psycopg.connect(postgres_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT version, checksum FROM applied_migrations ORDER BY version")
            recorded = cur.fetchall()

    second = run_migrations(postgres_connection_string, MIGRATIONS_DIR)

    assert second == (0, f"schema current at version {highest}")
    with psycopg.connect(postgres_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT version, checksum FROM applied_migrations ORDER BY version")
            assert cur.fetchall() == recorded
