"""Database-backed tests for adding and reactivating instruments."""

import psycopg
import pytest

from factorflow.instruments.service import Disposition, add_symbols

pytestmark = pytest.mark.postgres


def _insert_retired(conn: psycopg.Connection, symbol: str) -> int:
    with conn.cursor() as cur:
        cur.execute(
            """INSERT INTO instrument (symbol, lifecycle, retired_at)
            VALUES (%s, 'retired', now()) RETURNING instrument_id""",
            (symbol,),
        )
        instrument_id = cur.fetchone()[0]
    conn.commit()
    return instrument_id


def test_add_reports_duplicate_active_and_reactivates_retired(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """Existing active symbols reject while retired rows return to active."""
    add_symbols(migrated_instrument_connection, ["AAPL"])
    retired_id = _insert_retired(migrated_instrument_connection, "MSFT")

    outcomes = add_symbols(migrated_instrument_connection, ["AAPL", "MSFT"])

    assert [outcome.disposition for outcome in outcomes] == [
        Disposition.DUPLICATE_ACTIVE,
        Disposition.REACTIVATED,
    ]
    with migrated_instrument_connection.cursor() as cur:
        cur.execute(
            "SELECT instrument_id, lifecycle, retired_at FROM instrument WHERE symbol = 'MSFT'"
        )
        assert cur.fetchone() == (retired_id, "active", None)


def test_mixed_batch_commits_only_accepted_symbols(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """Malformed and duplicate input does not discard valid additions."""
    add_symbols(migrated_instrument_connection, ["AAPL"])

    outcomes = add_symbols(migrated_instrument_connection, ["MSFT", "AAPL", "1BAD"])

    assert [outcome.disposition for outcome in outcomes] == [
        Disposition.ADDED,
        Disposition.DUPLICATE_ACTIVE,
        Disposition.MALFORMED,
    ]
    with migrated_instrument_connection.cursor() as cur:
        cur.execute("SELECT symbol FROM instrument ORDER BY symbol")
        assert cur.fetchall() == [("AAPL",), ("MSFT",)]
