"""Database-backed tests for the instrument-list read model."""

import psycopg
import pytest

from factorflow.instruments.service import (
    InstrumentFilters,
    add_symbols,
    list_instruments,
    retire_symbol,
)

pytestmark = pytest.mark.postgres


def test_list_filters_and_keyset_pages_with_lifecycle_counts(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """The owner can narrow, page, and understand the full lifecycle totals."""
    add_symbols(migrated_instrument_connection, ["AAPL", "AMZN", "GOOG", "MSFT"])
    retire_symbol(migrated_instrument_connection, "GOOG")

    first_page = list_instruments(
        migrated_instrument_connection,
        InstrumentFilters(symbol_prefix="A", page_size=1),
    )
    second_page = list_instruments(
        migrated_instrument_connection,
        InstrumentFilters(symbol_prefix="A", cursor=first_page.next_cursor, page_size=1),
    )
    retired_page = list_instruments(
        migrated_instrument_connection,
        InstrumentFilters(lifecycle="retired", page_size=10),
    )

    assert [row.symbol for row in first_page.rows] == ["AAPL"]
    assert [row.symbol for row in second_page.rows] == ["AMZN"]
    assert first_page.next_cursor == "AAPL"
    assert first_page.active_count == 3
    assert first_page.retired_count == 1
    assert [row.symbol for row in retired_page.rows] == ["GOOG"]
