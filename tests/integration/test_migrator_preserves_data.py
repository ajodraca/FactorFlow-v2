"""Implements TC-COMP-015 (AC-15).

An existing store's history is brought forward without loss: apply `0001`,
insert an `instrument` row directly, run `apply_pending` again, and the row
must be byte-identical with no second `applied_migrations` row written for
version 1.
"""

from pathlib import Path

import psycopg
import pytest

from factorflow.db.migrator import apply_pending, discover

pytestmark = pytest.mark.postgres

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES_OK_DIR = REPO_ROOT / "tests" / "fixtures" / "migrations_ok"


def test_second_apply_pending_preserves_existing_rows(postgres_connection_string: str) -> None:
    files = [f for f in discover(FIXTURES_OK_DIR) if f.version == 1]

    with psycopg.connect(postgres_connection_string) as conn:
        apply_pending(conn, files)
        conn.commit()

        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO instrument (symbol, lifecycle) VALUES (%s, %s)",
                ("AAPL", "active"),
            )
        conn.commit()

        second_applied = apply_pending(conn, files)
        conn.commit()

        assert second_applied == []

        with conn.cursor() as cur:
            cur.execute("SELECT symbol, lifecycle FROM instrument WHERE symbol = 'AAPL'")
            row = cur.fetchone()
        assert row == ("AAPL", "active")

        with conn.cursor() as cur:
            cur.execute("SELECT count(*) FROM applied_migrations WHERE version = 1")
            count = cur.fetchone()[0]
        assert count == 1
