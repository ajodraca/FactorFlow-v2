"""Implements TC-COMP-315 / DAC-E1-S2-1.

Schema already current exits `0` logging `schema current at version N`,
applying nothing. Run `apply_pending` twice against the same store; the
second call returns an empty list of applied versions.
"""

from pathlib import Path

import psycopg
import pytest

from factorflow.db.migrate_main import _schema_current_message
from factorflow.db.migrator import apply_pending, discover

pytestmark = pytest.mark.postgres

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES_OK_DIR = REPO_ROOT / "tests" / "fixtures" / "migrations_ok"


def test_second_run_returns_empty_list(postgres_connection_string: str) -> None:
    files = discover(FIXTURES_OK_DIR)

    with psycopg.connect(postgres_connection_string) as conn:
        first_applied = apply_pending(conn, files)
        conn.commit()
        assert first_applied == [1, 2]

        second_applied = apply_pending(conn, files)
        conn.commit()
        assert second_applied == []


def test_schema_current_message_names_the_version() -> None:
    assert _schema_current_message(version=2) == "schema current at version 2"
