"""The build's set context, read in one snapshot (CAP-002-E2-S2).

Satisfies AC-15 (compute side), DAC-E2-9 and DAC-E2-S2-4.
"""

from collections.abc import Iterator
from datetime import date

import psycopg
import pytest

from factorflow.classification import engine
from tests.integration.engine_support import (
    add_bar,
    add_building_set,
    add_instrument,
    add_run,
    migrate_through_classification,
)

pytestmark = pytest.mark.postgres


@pytest.fixture
def conn(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    connection = migrate_through_classification(postgres_connection_string)
    try:
        yield connection
    finally:
        connection.close()


# Implements TC-COMP-159
def test_set_context_resolves_date_latest_trading_day_and_roster(
    conn: psycopg.Connection, postgres_connection_string: str
) -> None:
    a = add_instrument(conn, "AAA")
    b = add_instrument(conn, "BBB")
    c = add_instrument(conn, "CCC")
    retired = add_instrument(conn, "OLD", lifecycle="retired")
    add_bar(conn, a, date(2026, 10, 1))
    add_bar(conn, b, date(2026, 10, 2))
    add_bar(conn, c, date(2026, 9, 1))
    add_bar(conn, retired, date(2026, 10, 9))
    run_id = add_run(conn)
    set_id = add_building_set(conn, run_id, date(2026, 10, 3))

    with psycopg.connect(postgres_connection_string) as other:
        other.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ")
        with other.cursor() as cur:
            first = engine._read_context(cur, set_id)
            assert first.set_id == set_id
            assert first.run_id == run_id
            assert first.classification_date == date(2026, 10, 3)
            # The retired stock's later bar must not count (AC-15, compute side).
            assert first.latest_trading_day == date(2026, 10, 2)
            assert first.active_ids == (a, b, c)
            assert first.retired_ids == (retired,)

            # A newer active bar committed elsewhere stays invisible to the open transaction.
            add_bar(conn, a, date(2026, 10, 3))
            again = engine._read_context(cur, set_id)
            assert again.latest_trading_day == date(2026, 10, 2)
        other.commit()

        with other.cursor() as cur:
            fresh = engine._read_context(cur, set_id)
        assert fresh.latest_trading_day == date(2026, 10, 3)


def test_set_context_without_price_data_has_no_latest_trading_day(
    conn: psycopg.Connection,
) -> None:
    """DAC-E2-S2-4: an active roster with no bar at all reads a NULL latest trading day."""
    add_instrument(conn, "AAA")
    set_id = add_building_set(conn, add_run(conn), date(2026, 10, 3))
    with conn.cursor() as cur:
        context = engine._read_context(cur, set_id)
    assert context.latest_trading_day is None


def test_set_context_rosters_are_in_instrument_id_order(conn: psycopg.Connection) -> None:
    """DAC-E2-S2-4, T013 (IR-004): both rosters come back in instrument_id order even when
    the heap holds them in another order and no index supplies that order."""
    a = add_instrument(conn, "AAA")
    b = add_instrument(conn, "BBB")
    old = add_instrument(conn, "OLD", lifecycle="retired")
    older = add_instrument(conn, "OLDER", lifecycle="retired")
    # A new row version is written after the others, so a heap scan reads a and old last.
    conn.execute(
        "UPDATE instrument SET added_at = added_at WHERE instrument_id IN (%s, %s)", (a, old)
    )
    conn.commit()
    set_id = add_building_set(conn, add_run(conn), date(2026, 10, 3))

    with conn.cursor() as cur:
        # A sequential scan only: idx_instrument_active would otherwise return id order.
        cur.execute("SET LOCAL enable_indexscan = off")
        cur.execute("SET LOCAL enable_indexonlyscan = off")
        cur.execute("SET LOCAL enable_bitmapscan = off")
        cur.execute(
            "SELECT array_agg(instrument_id) FILTER (WHERE lifecycle = 'active'), "
            "array_agg(instrument_id) FILTER (WHERE lifecycle = 'retired') FROM instrument"
        )
        heap_order = cur.fetchone()
        context = engine._read_context(cur, set_id)
    conn.rollback()

    assert heap_order == ([b, a], [older, old])  # the precondition: heap order is not id order
    assert context.active_ids == (a, b)
    assert context.retired_ids == (old, older)
