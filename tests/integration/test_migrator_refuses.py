"""Implements TC-COMP-016/295/296/317/318/319 and DAC-E1-4, DAC-E1-S2-2..5.

The four refusal paths (unreachable database, store ahead of build, checksum
mismatch, failing migration) each produce the specific `migrate_main` exit
code and message shape from component design section 2.5 — never a generic
failure.
"""

from pathlib import Path

import psycopg
import pytest

from factorflow.db.migrate_main import run_migrations
from factorflow.db.migrator import apply_pending, discover

pytestmark = pytest.mark.postgres

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES_OK_DIR = REPO_ROOT / "tests" / "fixtures" / "migrations_ok"
FIXTURES_BROKEN_DIR = REPO_ROOT / "tests" / "fixtures" / "migrations_broken"


def test_unreachable_database() -> None:
    bad_url = "postgresql://factorflow:wrong-password@localhost:1/factorflow"

    exit_code, message = run_migrations(bad_url, FIXTURES_OK_DIR)

    assert exit_code == 1
    assert "localhost" in message
    assert "factorflow" in message
    assert "wrong-password" not in message


def test_store_ahead_of_build(postgres_connection_string: str) -> None:
    files = discover(FIXTURES_OK_DIR)

    with psycopg.connect(postgres_connection_string) as conn:
        apply_pending(conn, files)
        conn.commit()

        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO applied_migrations (version, name, checksum) "
                "VALUES (99, 'from_the_future', 'deadbeef')"
            )
        conn.commit()

    exit_code, message = run_migrations(postgres_connection_string, FIXTURES_OK_DIR)

    assert exit_code == 2
    assert "99" in message
    assert "2" in message  # highest version this build carries (fixtures_ok has 0001, 0002)


def test_checksum_mismatch(postgres_connection_string: str) -> None:
    files = [f for f in discover(FIXTURES_OK_DIR) if f.version == 1]

    with psycopg.connect(postgres_connection_string) as conn:
        apply_pending(conn, files)
        conn.commit()

        with conn.cursor() as cur:
            cur.execute("UPDATE applied_migrations SET checksum = 'tampered' WHERE version = 1")
        conn.commit()

    exit_code, message = run_migrations(postgres_connection_string, FIXTURES_OK_DIR)

    assert exit_code == 3
    assert "1" in message


def test_failing_migration_rolls_back(postgres_connection_string: str) -> None:
    ok_files = [f for f in discover(FIXTURES_OK_DIR) if f.version == 1]

    with psycopg.connect(postgres_connection_string) as conn:
        apply_pending(conn, ok_files)
        conn.commit()

    exit_code, message = run_migrations(postgres_connection_string, FIXTURES_BROKEN_DIR)

    assert exit_code == 4
    assert "2" in message

    with psycopg.connect(postgres_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT count(*) FROM applied_migrations WHERE version = 2")
            assert cur.fetchone()[0] == 0

            cur.execute(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_name = 'test_only_marker'"
            )
            assert cur.fetchone() is None
