"""Database-backed tests for retirement and the active acquisition roster."""

import psycopg
import pytest

from factorflow.instruments.service import (
    AlreadyRetired,
    InstrumentNotFound,
    active_instrument_ids,
    add_symbols,
    retire_symbol,
)

pytestmark = pytest.mark.postgres


def test_retire_distinguishes_unknown_and_already_retired(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """Unknown and repeated retirement have distinct, actionable outcomes."""
    with pytest.raises(InstrumentNotFound):
        retire_symbol(migrated_instrument_connection, "UNKNOWN")

    add_symbols(migrated_instrument_connection, ["AAPL"])
    retire_symbol(migrated_instrument_connection, "AAPL")

    with pytest.raises(AlreadyRetired):
        retire_symbol(migrated_instrument_connection, "AAPL")


def test_retirement_changes_only_the_target_instrument_lifecycle(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """Retirement never mutates another instrument or deletes data.

    TODO(CAP-001-E5, CAP-001-E4): extend this once run-result and coverage
    tables exist to prove they remain unchanged as well.
    """
    add_symbols(migrated_instrument_connection, ["AAPL", "MSFT"])
    with migrated_instrument_connection.cursor() as cur:
        cur.execute(
            "SELECT instrument_id, symbol, lifecycle, added_at, retired_at "
            "FROM instrument ORDER BY symbol"
        )
        before = cur.fetchall()

    retire_symbol(migrated_instrument_connection, "AAPL")

    with migrated_instrument_connection.cursor() as cur:
        cur.execute(
            "SELECT instrument_id, symbol, lifecycle, added_at, retired_at "
            "FROM instrument ORDER BY symbol"
        )
        after = cur.fetchall()
    assert after[0][:4] == (*before[0][:2], "retired", before[0][3])
    assert after[0][4] is not None
    assert after[1] == before[1]


def test_active_instrument_ids_excludes_retired_symbols_in_symbol_order(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """Future acquisition reads only the active, deterministically ordered roster."""
    add_symbols(migrated_instrument_connection, ["MSFT", "AAPL", "GOOG"])
    retire_symbol(migrated_instrument_connection, "GOOG")

    with migrated_instrument_connection.cursor() as cur:
        cur.execute("SELECT instrument_id FROM instrument WHERE symbol = 'AAPL'")
        aapl_id = cur.fetchone()[0]
        cur.execute("SELECT instrument_id FROM instrument WHERE symbol = 'MSFT'")
        msft_id = cur.fetchone()[0]
    assert active_instrument_ids(migrated_instrument_connection) == [aapl_id, msft_id]
