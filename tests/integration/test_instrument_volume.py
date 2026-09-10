"""Database-backed coverage of the approved bulk-request boundary."""

import psycopg
import pytest

from factorflow.instruments.service import Disposition, add_symbols

pytestmark = pytest.mark.postgres


def test_add_symbols_classifies_every_symbol_in_a_3000_symbol_batch(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """The CAP-001 component design requires a 3000-symbol request to complete."""
    symbols = [f"S{number:04}" for number in range(3000)]

    outcomes = add_symbols(migrated_instrument_connection, symbols)

    assert len(outcomes) == len(symbols)
    assert all(outcome.disposition is Disposition.ADDED for outcome in outcomes)
