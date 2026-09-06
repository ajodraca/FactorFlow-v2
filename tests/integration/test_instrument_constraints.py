"""Implements TC-COMP-310, TC-COMP-311 (DAC-E1-S1-2, DAC-E1-S1-3).

`instrument.symbol` must be uppercase and match the shape regex, and
`instrument.lifecycle` must be `active` or `retired` with `retired_at`
non-null if and only if `lifecycle` is `retired` — all enforced by check
constraints rather than application code.
"""

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


def _insert_instrument(
    conn: psycopg.Connection,
    symbol: str,
    lifecycle: str,
    retired_at: str | None = None,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle, retired_at) VALUES (%s, %s, %s)",
            (symbol, lifecycle, retired_at),
        )
    conn.commit()


def test_lowercase_symbol_is_rejected(migrated_connection: psycopg.Connection) -> None:
    with pytest.raises(psycopg.errors.CheckViolation):
        _insert_instrument(migrated_connection, "aapl", "active")
    migrated_connection.rollback()


def test_symbol_over_sixteen_characters_is_rejected(
    migrated_connection: psycopg.Connection,
) -> None:
    with pytest.raises(psycopg.errors.CheckViolation):
        _insert_instrument(migrated_connection, "A" * 17, "active")
    migrated_connection.rollback()


def test_unknown_lifecycle_value_is_rejected(migrated_connection: psycopg.Connection) -> None:
    with pytest.raises(psycopg.errors.CheckViolation):
        _insert_instrument(migrated_connection, "AAPL", "delisted")
    migrated_connection.rollback()


def test_retired_without_retired_at_is_rejected(migrated_connection: psycopg.Connection) -> None:
    with pytest.raises(psycopg.errors.CheckViolation):
        _insert_instrument(migrated_connection, "AAPL", "retired", retired_at=None)
    migrated_connection.rollback()


def test_active_with_retired_at_is_rejected(migrated_connection: psycopg.Connection) -> None:
    with pytest.raises(psycopg.errors.CheckViolation):
        _insert_instrument(migrated_connection, "AAPL", "active", retired_at="2026-01-01")
    migrated_connection.rollback()


def test_valid_active_instrument_is_accepted(migrated_connection: psycopg.Connection) -> None:
    _insert_instrument(migrated_connection, "AAPL", "active")
    with migrated_connection.cursor() as cur:
        cur.execute("SELECT symbol, lifecycle FROM instrument WHERE symbol = 'AAPL'")
        row = cur.fetchone()
    assert row == ("AAPL", "active")


def test_valid_retired_instrument_is_accepted(migrated_connection: psycopg.Connection) -> None:
    _insert_instrument(migrated_connection, "MSFT", "retired", retired_at="2026-01-01")
    with migrated_connection.cursor() as cur:
        cur.execute("SELECT symbol, lifecycle FROM instrument WHERE symbol = 'MSFT'")
        row = cur.fetchone()
    assert row == ("MSFT", "retired")
