"""Implements TC-COMP-309 (DAC-E1-S1-1).

Applying migration 0001 creates the `btree_gist` extension, which the
`coverage_segment` exclusion constraint in a later migration depends on.
"""

from pathlib import Path

import psycopg
import pytest

pytestmark = pytest.mark.postgres

MIGRATION_0001_PATH = (
    Path(__file__).resolve().parents[2] / "migrations" / "0001_extensions_owner_state.sql"
)


def _apply_migration_0001(conn: psycopg.Connection) -> None:
    sql = MIGRATION_0001_PATH.read_text()
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()


def test_applying_0001_creates_btree_gist_extension(postgres_connection_string: str) -> None:
    with psycopg.connect(postgres_connection_string) as conn:
        _apply_migration_0001(conn)

        with conn.cursor() as cur:
            cur.execute("SELECT extname FROM pg_extension WHERE extname = 'btree_gist'")
            assert cur.fetchone() is not None


def test_applying_0001_creates_instrument_and_owner_setting_tables(
    postgres_connection_string: str,
) -> None:
    with psycopg.connect(postgres_connection_string) as conn:
        _apply_migration_0001(conn)

        with conn.cursor() as cur:
            cur.execute(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_name IN ('instrument', 'owner_setting') "
                "ORDER BY table_name"
            )
            tables = [row[0] for row in cur.fetchall()]
        assert tables == ["instrument", "owner_setting"]
