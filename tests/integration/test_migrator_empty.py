"""Implements TC-COMP-294.

Migrations applied in ascending numbered order, each recorded with
version/name/checksum; a correction is a new file, never an edit. Applied
against an empty database seeded with `0001` only.
"""

import hashlib
from pathlib import Path

import psycopg
import pytest

from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover

pytestmark = pytest.mark.postgres

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES_OK_DIR = REPO_ROOT / "tests" / "fixtures" / "migrations_ok"
MIGRATION_0001_PATH = MIGRATIONS_DIR / "0001_extensions_owner_state.sql"


def test_apply_pending_against_empty_database_records_checksum_version_name(
    postgres_connection_string: str,
) -> None:
    files = [f for f in discover(FIXTURES_OK_DIR) if f.version == 1]

    with psycopg.connect(postgres_connection_string) as conn:
        applied = apply_pending(conn, files)
        conn.commit()

        assert applied == [1]

        with conn.cursor() as cur:
            cur.execute("SELECT version, name, checksum FROM applied_migrations ORDER BY version")
            rows = cur.fetchall()

    expected_checksum = hashlib.sha256(MIGRATION_0001_PATH.read_bytes()).hexdigest()
    assert rows == [(1, "extensions_owner_state", expected_checksum)]


def test_apply_pending_applies_multiple_files_in_ascending_order(
    postgres_connection_string: str,
) -> None:
    files = discover(FIXTURES_OK_DIR)

    with psycopg.connect(postgres_connection_string) as conn:
        applied = apply_pending(conn, files)
        conn.commit()

    assert applied == [1, 2]
