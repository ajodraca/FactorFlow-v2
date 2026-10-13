"""Implements TC-COMP-314 (DAC-E1-S1-6), and contributes to AC-15 and DAC-E1-1.

Applying migration 0001 twice, guarded by a check against `applied_migrations`,
records exactly one row and executes the migration's DDL only once. This is
this story's narrow slice of AC-15: full forward-evolution behavior (applying
several unapplied migrations in order) belongs to CAP-001-E1-S2's migrator —
this test proves only that a second application of 0001 does not lose or
rewrite rows already present, checked directly against the SQL file rather
than through a migrator component.

TC-COMP-292 (DAC-E1-1, single-database state) is satisfied structurally by
every table in this story living in the one PostgreSQL schema the fixture
provisions; no dedicated test exists for it, per the task plan's own note.
"""

import psycopg
import pytest

from factorflow.db.applied_migrations import APPLIED_MIGRATIONS_DDL
from factorflow.db.migrate_main import MIGRATIONS_DIR

pytestmark = pytest.mark.postgres

MIGRATION_0001_PATH = MIGRATIONS_DIR / "0001_extensions_owner_state.sql"
MIGRATION_0001_VERSION = 1
MIGRATION_0001_NAME = "extensions_owner_state"


def _apply_0001_if_not_recorded(conn: psycopg.Connection) -> bool:
    """Apply migration 0001 only if its version is not already recorded.

    Returns True if the migration's DDL was executed, False if it was skipped.
    This is the narrow guard this story tests directly; the full decision
    logic (checksum comparison, ordering across many files) belongs to
    CAP-001-E1-S2's migrator.
    """
    with conn.cursor() as cur:
        cur.execute(
            "SELECT 1 FROM applied_migrations WHERE version = %s",
            (MIGRATION_0001_VERSION,),
        )
        if cur.fetchone() is not None:
            return False

    sql = MIGRATION_0001_PATH.read_text()
    with conn.cursor() as cur:
        cur.execute(sql)
        cur.execute(
            "INSERT INTO applied_migrations (version, name, checksum) VALUES (%s, %s, %s)",
            (MIGRATION_0001_VERSION, MIGRATION_0001_NAME, "test-checksum"),
        )
    conn.commit()
    return True


def test_applying_0001_twice_records_exactly_one_row(postgres_connection_string: str) -> None:
    with psycopg.connect(postgres_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute(APPLIED_MIGRATIONS_DDL)
        conn.commit()

        first_applied = _apply_0001_if_not_recorded(conn)
        assert first_applied is True

        second_applied = _apply_0001_if_not_recorded(conn)
        assert second_applied is False

        with conn.cursor() as cur:
            cur.execute(
                "SELECT count(*) FROM applied_migrations WHERE version = %s",
                (MIGRATION_0001_VERSION,),
            )
            count = cur.fetchone()[0]
        assert count == 1


def test_second_application_loses_no_existing_rows(postgres_connection_string: str) -> None:
    """AC-15's narrow slice here: re-guarding 0001 must not touch rows already present."""
    with psycopg.connect(postgres_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute(APPLIED_MIGRATIONS_DDL)
        conn.commit()

        _apply_0001_if_not_recorded(conn)

        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO instrument (symbol, lifecycle) VALUES (%s, %s)",
                ("AAPL", "active"),
            )
        conn.commit()

        _apply_0001_if_not_recorded(conn)

        with conn.cursor() as cur:
            cur.execute("SELECT symbol, lifecycle FROM instrument WHERE symbol = 'AAPL'")
            row = cur.fetchone()
        assert row == ("AAPL", "active")
