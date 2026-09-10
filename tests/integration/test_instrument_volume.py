"""Database-backed coverage of the approved bulk-request boundary."""

import psycopg
import pytest

from factorflow.instruments.service import Disposition, add_symbols

pytestmark = pytest.mark.postgres


def test_add_symbols_commits_valid_symbols_from_a_3000_item_malformed_batch(
    migrated_instrument_connection: psycopg.Connection,
) -> None:
    """One malformed line cannot discard the other 2999 additions at capacity."""
    symbols = [f"S{number:04}" for number in range(3000)]
    symbols[1500] = "1BAD"

    outcomes = add_symbols(migrated_instrument_connection, symbols)

    assert len(outcomes) == len(symbols)
    assert outcomes[1500].disposition is Disposition.MALFORMED
    assert sum(outcome.disposition is Disposition.ADDED for outcome in outcomes) == 2999
    with migrated_instrument_connection.cursor() as cur:
        cur.execute("SELECT count(*) FROM instrument")
        assert cur.fetchone() == (2999,)
