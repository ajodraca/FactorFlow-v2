"""Implements TC-COMP-312 (DAC-E1-S1-4).

`owner_setting.setting_value` is held as a `jsonb` value keyed by
`setting_key`, so a later setting needs no schema change.
"""

import json
from pathlib import Path

import psycopg
import pytest

pytestmark = pytest.mark.postgres

MIGRATION_0001_PATH = (
    Path(__file__).resolve().parents[2] / "migrations" / "0001_extensions_owner_state.sql"
)


@pytest.fixture
def migrated_connection(postgres_connection_string: str) -> psycopg.Connection:
    conn = psycopg.connect(postgres_connection_string)
    with conn.cursor() as cur:
        cur.execute(MIGRATION_0001_PATH.read_text())
    conn.commit()
    yield conn
    conn.close()


def test_setting_value_column_is_jsonb(migrated_connection: psycopg.Connection) -> None:
    with migrated_connection.cursor() as cur:
        cur.execute(
            "SELECT data_type FROM information_schema.columns "
            "WHERE table_name = 'owner_setting' AND column_name = 'setting_value'"
        )
        row = cur.fetchone()
    assert row is not None
    assert row[0] == "jsonb"


def test_setting_key_is_the_primary_key(migrated_connection: psycopg.Connection) -> None:
    with migrated_connection.cursor() as cur:
        cur.execute(
            """
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'owner_setting'
              AND tc.constraint_type = 'PRIMARY KEY'
            """
        )
        pk_columns = [row[0] for row in cur.fetchall()]
    assert pk_columns == ["setting_key"]


def test_arbitrary_json_shaped_value_round_trips(migrated_connection: psycopg.Connection) -> None:
    value = {"years": 5}
    with migrated_connection.cursor() as cur:
        cur.execute(
            "INSERT INTO owner_setting (setting_key, setting_value) VALUES (%s, %s)",
            ("history_depth_years", json.dumps(value)),
        )
    migrated_connection.commit()

    with migrated_connection.cursor() as cur:
        cur.execute(
            "SELECT setting_value FROM owner_setting WHERE setting_key = %s",
            ("history_depth_years",),
        )
        row = cur.fetchone()
    assert row is not None
    assert row[0] == value
