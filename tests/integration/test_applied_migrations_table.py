"""Implements TC-COMP-293, TC-COMP-313.

`applied_migrations` must be creatable before any migration file runs, and its
row must carry exactly `version` (primary key), `name`, `checksum`, and
`applied_at`. Its definition belongs to `market-data-store`
(component-design-market-data-store.md section 2.2) and is exported as a
constant for the migrator (CAP-001-E1-S2) to create.
"""

import psycopg
import pytest

from factorflow.db.applied_migrations import APPLIED_MIGRATIONS_DDL

pytestmark = pytest.mark.postgres


def test_applied_migrations_creatable_before_any_migration_file(
    postgres_connection_string: str,
) -> None:
    """The table can be created against a completely empty database."""
    with psycopg.connect(postgres_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute(APPLIED_MIGRATIONS_DDL)
        conn.commit()

        with conn.cursor() as cur:
            cur.execute(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_name = 'applied_migrations'"
            )
            assert cur.fetchone() is not None


def test_applied_migrations_has_exactly_four_columns_with_version_as_pk(
    postgres_connection_string: str,
) -> None:
    """The row shape is version (PK), name, checksum, applied_at — nothing else."""
    with psycopg.connect(postgres_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute(APPLIED_MIGRATIONS_DDL)
        conn.commit()

        with conn.cursor() as cur:
            cur.execute(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'applied_migrations' ORDER BY ordinal_position"
            )
            columns = [row[0] for row in cur.fetchall()]
        assert columns == ["version", "name", "checksum", "applied_at"]

        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_name = 'applied_migrations'
                  AND tc.constraint_type = 'PRIMARY KEY'
                """
            )
            pk_columns = [row[0] for row in cur.fetchall()]
        assert pk_columns == ["version"]


def test_applied_migrations_record_round_trips(postgres_connection_string: str) -> None:
    """A recorded migration is readable back with the fields it was written with."""
    with psycopg.connect(postgres_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute(APPLIED_MIGRATIONS_DDL)
            cur.execute(
                "INSERT INTO applied_migrations (version, name, checksum) VALUES (%s, %s, %s)",
                (1, "extensions_owner_state", "deadbeef"),
            )
        conn.commit()

        with conn.cursor() as cur:
            cur.execute(
                "SELECT version, name, checksum, applied_at FROM applied_migrations "
                "WHERE version = 1"
            )
            row = cur.fetchone()
        assert row is not None
        version, name, checksum, applied_at = row
        assert version == 1
        assert name == "extensions_owner_state"
        assert checksum == "deadbeef"
        assert applied_at is not None
