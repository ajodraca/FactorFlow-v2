"""Database-backed tests for the history depth owner setting."""

import psycopg
import pytest

from factorflow.instruments.service import add_symbols
from factorflow.instruments.settings import (
    HISTORY_DEPTH_KEY,
    read_history_depth,
    write_history_depth,
)

pytestmark = pytest.mark.postgres


def test_read_before_any_write_returns_none_distinct_from_zero(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """TC-COMP-105: an empty owner_setting reads as None, never 0."""
    result = read_history_depth(migrated_instrument_connection)

    assert result is None


def test_write_rejects_zero_negative_and_non_integer_values(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """TC-COMP-118: only a positive integer number of years is accepted."""
    with pytest.raises(ValueError):
        write_history_depth(migrated_instrument_connection, 0)
    with pytest.raises(ValueError):
        write_history_depth(migrated_instrument_connection, -5)
    with pytest.raises(ValueError):
        write_history_depth(migrated_instrument_connection, 3.5)  # type: ignore[arg-type]
    with pytest.raises(ValueError):
        write_history_depth(migrated_instrument_connection, "5")  # type: ignore[arg-type]


def test_write_stores_years_as_jsonb_keyed_by_setting_key(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """TC-COMP-119: the row is keyed history_depth_years with jsonb {"years": n}."""
    write_history_depth(migrated_instrument_connection, 5)

    with migrated_instrument_connection.cursor() as cursor:
        cursor.execute(
            "SELECT setting_key, setting_value FROM owner_setting WHERE setting_key = %s",
            (HISTORY_DEPTH_KEY,),
        )
        row = cursor.fetchone()

    assert row is not None
    setting_key, setting_value = row
    assert setting_key == "history_depth_years"
    assert setting_value == {"years": 5}


def test_overwriting_replaces_value_and_advances_updated_at(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """TC-COMP-120: a second write replaces the row and updated_at strictly increases."""
    write_history_depth(migrated_instrument_connection, 5)
    with migrated_instrument_connection.cursor() as cursor:
        cursor.execute(
            "SELECT updated_at FROM owner_setting WHERE setting_key = %s",
            (HISTORY_DEPTH_KEY,),
        )
        first_updated_at = cursor.fetchone()[0]

    write_history_depth(migrated_instrument_connection, 10)

    with migrated_instrument_connection.cursor() as cursor:
        cursor.execute(
            "SELECT count(*) FROM owner_setting WHERE setting_key = %s",
            (HISTORY_DEPTH_KEY,),
        )
        row_count = cursor.fetchone()
        cursor.execute(
            "SELECT setting_value, updated_at FROM owner_setting WHERE setting_key = %s",
            (HISTORY_DEPTH_KEY,),
        )
        setting_value, second_updated_at = cursor.fetchone()

    assert row_count == (1,)
    assert setting_value == {"years": 10}
    assert second_updated_at > first_updated_at


def test_read_carries_updated_at_alongside_value(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """TC-COMP-121: the read result exposes updated_at alongside years."""
    write_history_depth(migrated_instrument_connection, 7)

    result = read_history_depth(migrated_instrument_connection)

    assert result is not None
    assert result.years == 7
    assert result.updated_at is not None


def test_fifty_years_is_recorded_unchanged_with_no_cap_enforced(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """TC-COMP-122 / DAC-E2-S2-5: 50 years is accepted and read back unchanged."""
    write_history_depth(migrated_instrument_connection, 50)

    result = read_history_depth(migrated_instrument_connection)

    assert result is not None
    assert result.years == 50


def test_history_depth_and_instrument_service_share_one_connection_scope(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """History depth and instrument writes operate correctly through one shared connection."""
    add_symbols(migrated_instrument_connection, ["AAPL"])
    write_history_depth(migrated_instrument_connection, 5)

    result = read_history_depth(migrated_instrument_connection)

    assert result is not None
    assert result.years == 5
    with migrated_instrument_connection.cursor() as cursor:
        cursor.execute("SELECT symbol FROM instrument")
        assert cursor.fetchall() == [("AAPL",)]
