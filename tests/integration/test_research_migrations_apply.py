"""Migrations 0005 and 0006 through the production migrator, and a second run after them."""

import uuid
from typing import Any

import psycopg
import pytest
from psycopg import sql
from testcontainers.community.postgres import PostgresContainer

from factorflow.db.migrate_main import MIGRATIONS_DIR, run_migrations
from factorflow.db.migrator import apply_pending, discover
from tests.integration.test_research_constraints import (
    insert_classification_set,
    insert_terminal_run,
)

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


def seed_universe(conn: psycopg.Connection, instrument_id: int) -> None:
    """One universe with a `created` and a `member_added` event."""
    with conn.cursor() as cur:
        cur.execute("INSERT INTO universe DEFAULT VALUES RETURNING universe_id")
        row = cur.fetchone()
        assert row is not None
        cur.execute(
            "INSERT INTO universe_event (universe_id, event_type, name) "
            "VALUES (%s, 'created', 'Growth')",
            (row[0],),
        )
        cur.execute(
            "INSERT INTO universe_event (universe_id, event_type, instrument_id) "
            "VALUES (%s, 'member_added', %s)",
            (row[0], instrument_id),
        )
    conn.commit()


CLASSIFICATION_TABLES = [
    "classification_set",
    "classification_set_factor",
    "factor_input",
    "factor_classification",
]


# Implements TC-COMP-156
def test_migration_0006_applies_without_touching_earlier_rows(
    postgres_connection_string: str,
) -> None:
    conn = psycopg.connect(postgres_connection_string)
    try:
        files = discover(MIGRATIONS_DIR)
        assert apply_pending(conn, [f for f in files if f.version <= 5]) == [1, 2, 3, 4, 5]
        seed_cap_001_rows(conn)
        with conn.cursor() as cur:
            cur.execute("SELECT instrument_id FROM instrument WHERE symbol = 'ABC'")
            row = cur.fetchone()
        assert row is not None
        seed_universe(conn, row[0])
        tables = cap_001_tables(conn)
        before = snapshot_cap_001(conn, tables)

        assert apply_pending(conn, files) == [6]

        after = snapshot_cap_001(conn, tables)
        assert {table: rows for table, rows in after.items() if table != "applied_migrations"} == {
            table: rows for table, rows in before.items() if table != "applied_migrations"
        }
        assert set(before["applied_migrations"]) <= set(after["applied_migrations"])
        with conn.cursor() as cur:
            cur.execute("SELECT version, checksum FROM applied_migrations WHERE version = 6")
            assert cur.fetchall() == [(6, files[5].checksum)]
            for table in CLASSIFICATION_TABLES:
                cur.execute(f"SELECT count(*) FROM {table}")  # noqa: S608
                assert cur.fetchone() == (0,), table
    finally:
        conn.close()


# Implements DAC-E2-S1-1
def test_a_second_apply_after_0006_changes_nothing(postgres_connection_string: str) -> None:
    conn = psycopg.connect(postgres_connection_string)
    try:
        files = discover(MIGRATIONS_DIR)
        assert apply_pending(conn, files) == [1, 2, 3, 4, 5, 6]
        insert_classification_set(conn, "complete")
        conn.commit()
        before = snapshot_cap_001(conn, CLASSIFICATION_TABLES)

        assert apply_pending(conn, files) == []

        with conn.cursor() as cur:
            cur.execute("SELECT count(*) FROM applied_migrations")
            assert cur.fetchone() == (6,)
        assert snapshot_cap_001(conn, CLASSIFICATION_TABLES) == before
        assert len(before["classification_set"]) == 1
    finally:
        conn.close()


# Implements TC-COMP-158
def test_pg_dump_restore_returns_the_current_set_and_membership_unchanged(
    postgres_connection_string: str, postgres_container: PostgresContainer
) -> None:
    source_db = postgres_connection_string.rsplit("/", 1)[1]
    restored_db = f"restore_{uuid.uuid4().hex}"
    admin_url = postgres_container.get_connection_url(driver=None)
    restored_url = f"{admin_url.rsplit('/', 1)[0]}/{restored_db}"
    container = postgres_container.get_wrapped_container()
    assert container is not None
    compared = [
        "classification_set",
        "classification_set_factor",
        "factor_classification",
        "universe",
        "universe_event",
    ]

    conn = psycopg.connect(postgres_connection_string)
    admin = psycopg.connect(admin_url, autocommit=True)
    try:
        assert apply_pending(conn, discover(MIGRATIONS_DIR)) == [1, 2, 3, 4, 5, 6]
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO instrument (symbol, lifecycle) VALUES ('ABC', 'active') "
                "RETURNING instrument_id"
            )
            row = cur.fetchone()
        assert row is not None
        instrument_id = row[0]
        conn.commit()
        seed_universe(conn, instrument_id)
        set_id = insert_classification_set(conn, "complete", insert_terminal_run(conn))
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked) "
                "VALUES (%s, 'momentum', 1, false)",
                (set_id,),
            )
            cur.execute(
                "INSERT INTO factor_classification "
                "(set_id, instrument_id, factor, status, score, percentile) "
                "VALUES (%s, %s, 'momentum', 'classified', 1.5, 50)",
                (set_id, instrument_id),
            )
        conn.commit()
        before = snapshot_cap_001(conn, compared)
        assert all(before[table] for table in compared)

        dump = container.exec_run(
            [
                "pg_dump",
                "-Fc",
                "-U",
                postgres_container.username,
                "-d",
                source_db,
                "-f",
                "/tmp/factorflow.dump",
            ]
        )
        assert dump.exit_code == 0, dump.output
        with admin.cursor() as cur:
            cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(restored_db)))
        restore = container.exec_run(
            [
                "pg_restore",
                "-U",
                postgres_container.username,
                "-d",
                restored_db,
                "/tmp/factorflow.dump",
            ]
        )
        assert restore.exit_code == 0, restore.output

        with psycopg.connect(restored_url) as restored:
            assert snapshot_cap_001(restored, compared) == before
    finally:
        conn.close()
        with admin.cursor() as cur:
            cur.execute(sql.SQL("DROP DATABASE IF EXISTS {}").format(sql.Identifier(restored_db)))
        admin.close()
