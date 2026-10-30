"""The summary: per-factor counts and the current-stock count (CAP-002-E3-S1).

Proves `component-design-classification-reader.md` section 2.4 and the section 7 rows
*Summary current count* and *Summary carries no rows and the set state* against a real
PostgreSQL store seeded directly (DAC-E3-S1-4 to DAC-E3-S1-6, DAC-E3-10, DAC-E3-11;
AC-13, AC-21, AC-22; STD-UI-15).
"""

import dataclasses
import re
from datetime import UTC, date, datetime, timedelta
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import reader
from tests.integration.reader_seed import (
    insert_instrument,
    insert_run,
    insert_set,
    insert_stock_inputs,
)

pytestmark = pytest.mark.postgres

T0 = datetime(2026, 10, 14, 22, 30, tzinfo=UTC)


def _complete_set(
    conn: psycopg.Connection,
    active_instruments: int,
    *,
    started_at: datetime = T0,
    factors: dict[str, tuple[int, bool]] | None = None,
) -> UUID:
    run_id = insert_run(conn, "succeeded", started_at=started_at - timedelta(hours=1))
    return insert_set(
        conn,
        run_id,
        "complete",
        started_at=started_at,
        ended_at=started_at + timedelta(minutes=5),
        latest_trading_day=date(2026, 10, 14),
        active_instruments=active_instruments,
        factors=factors or {"value": (35, True), "growth": (35, True), "momentum": (35, True)},
    )


def _stocks(
    conn: psycopg.Connection, set_id: UUID, statuses: list[dict[str, str]], prefix: str = "S"
) -> None:
    for n, given in enumerate(statuses):
        instrument_id = insert_instrument(conn, f"{prefix}{n}")
        insert_stock_inputs(conn, set_id, instrument_id, given)


# Implements TC-COMP-103
def test_missing_or_outdated_input_makes_a_stock_not_current(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S1-4, DAC-E3-10: `missing`/`outdated` count against currency, `not_computable` not."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn, 4)
    _stocks(
        conn,
        set_id,
        [
            {},
            {"eps_growth": "missing"},
            {"return_6m": "outdated"},
            {"fcf_yield": "not_computable"},
        ],
    )

    stocks_current = reader.summary(conn).stocks_current

    assert stocks_current == reader.StocksCurrent(current_count=2, followed_count=4)


# Implements TC-COMP-103
def test_not_computable_does_not_rescue_a_missing_input(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S1-4: a stock with both `not_computable` and `missing` is not current."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn, 2)
    _stocks(conn, set_id, [{"fcf_yield": "not_computable", "eps_growth": "missing"}, {}])

    stocks_current = reader.summary(conn).stocks_current

    assert stocks_current is not None
    assert stocks_current.current_count == 1


# Implements TC-COMP-104
def test_summary_statement_returns_counts_only(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S1-5: one row of two integers, and no field that could carry a stock row."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn, 60)
    _stocks(conn, set_id, [{} for _ in range(59)] + [{"return_3m": "missing"}])

    with conn.cursor() as cur:
        cur.execute(reader.SUMMARY_SQL, {"set_id": set_id})
        assert cur.description is not None
        assert [c.name for c in cur.description] == ["current_count", "scored_roster"]
        rows = cur.fetchall()
    assert rows == [(59, 60)]
    assert all(type(v) is int for v in rows[0])

    assert [f.name for f in dataclasses.fields(reader.Summary)] == [
        "set",
        "never_classified",
        "later",
        "stocks_current",
    ]
    assert {f.name: f.type for f in dataclasses.fields(reader.StocksCurrent)} == {
        "current_count": int,
        "followed_count": int,
    }


def _plan(cur: psycopg.Cursor, statement: str, params: dict[str, UUID] | None = None) -> str:
    cur.execute(f"EXPLAIN {statement}", params)
    return "\n".join(str(row[0]) for row in cur.fetchall())


# Implements TC-COMP-104
def test_summary_and_current_set_are_served_from_indexes(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S1-5: with sequential scans disabled no plan scans a set or input table whole.

    Proves an index path exists (Open Gap 4 of the task plan); the planner's choice at 3000
    stocks is the volume test's (CAP-002-E3-S4, TC-COMP-153).
    """
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn, 60)
    _stocks(conn, set_id, [{} for _ in range(60)])

    with conn.transaction(), conn.cursor() as cur:
        cur.execute("SET LOCAL enable_seqscan = off")
        plans = [
            _plan(cur, reader.SUMMARY_SQL, {"set_id": set_id}),
            _plan(cur, reader.CURRENT_SET_SQL),
        ]

    for plan in plans:
        for table in ("factor_input", "classification_set", "classification_set_factor"):
            assert not re.search(rf"Seq Scan on {table}\b", plan), plan


# Implements TC-COMP-178
def test_reader_returns_stored_values_and_recomputes_nothing(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S1-6, AC-21, STD-UI-15: every value is the stored one, not derived from rows.

    The set's counts are deliberately inconsistent with the rows beneath it: 7 active
    instruments with inputs for 3 stocks, 41 qualified with no `factor_classification` row,
    33 qualified yet unranked. A reader that recounted would return 3 or 0, or rank momentum.
    """
    conn = migrated_run_schema_connection
    run_started = T0 - timedelta(hours=3)
    run_id = insert_run(conn, "partial", started_at=run_started)
    ended_at = T0 + timedelta(minutes=13, seconds=7)
    set_id = insert_set(
        conn,
        run_id,
        "complete",
        started_at=T0,
        ended_at=ended_at,
        classification_date=date(2026, 10, 9),
        latest_trading_day=date(2026, 10, 8),
        active_instruments=7,
        factors={"value": (41, True), "growth": (3, False), "momentum": (33, False)},
    )
    _stocks(conn, set_id, [{}, {}, {}])

    summary = reader.summary(conn)

    current = summary.set
    assert current is not None
    assert current.active_instruments == 7
    assert summary.stocks_current == reader.StocksCurrent(current_count=3, followed_count=7)
    assert current.factors["value"].qualified_count == 41
    assert current.factors["value"].ranked is True
    assert current.factors["growth"].qualified_count == 3
    assert current.factors["growth"].ranked is False
    assert current.factors["momentum"].qualified_count == 33
    assert current.factors["momentum"].ranked is False  # stored, not 33 >= 30
    assert current.ended_at == ended_at
    assert current.latest_trading_day == date(2026, 10, 8)
    assert current.classification_date == date(2026, 10, 9)
    assert current.run_outcome == "partial"
    assert current.run_started_at == run_started
    assert all(f.min_peer_set_size == 30 for f in current.factors.values())


def test_summary_with_no_set_at_all(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """AC-22, DAC-E3-11: never classified, no later, no stock counts."""
    assert reader.summary(migrated_run_schema_connection) == reader.Summary(
        set=None, never_classified=True, later=None, stocks_current=None
    )


def test_summary_with_only_a_building_first_set(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """AC-20, AC-22, DAC-E3-11: the building first set is `later`; nothing is counted."""
    conn = migrated_run_schema_connection
    run_id = insert_run(conn, "succeeded", started_at=T0)
    set_id = insert_set(conn, run_id, "building", started_at=T0 + timedelta(hours=1))

    summary = reader.summary(conn)

    assert summary.set is None
    assert summary.never_classified is True
    assert summary.stocks_current is None
    assert summary.later is not None
    assert summary.later.set_id == set_id


def test_summary_counts_the_complete_set_while_a_newer_set_builds(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """AC-13, AC-20, DAC-E3-11: `set` and `later` together; the count is the complete set's."""
    conn = migrated_run_schema_connection
    complete_id = _complete_set(conn, 3)
    _stocks(conn, complete_id, [{}, {}, {"book_to_price": "missing"}])
    run_id = insert_run(conn, "succeeded", started_at=T0 + timedelta(days=1))
    building_id = insert_set(conn, run_id, "building", started_at=T0 + timedelta(days=1, hours=1))
    # Rows written so far by the building set must not leak into the complete set's count.
    instrument_id = insert_instrument(conn, "NEW")
    insert_stock_inputs(conn, building_id, instrument_id)

    summary = reader.summary(conn)

    assert summary.set is not None
    assert summary.set.set_id == complete_id
    assert summary.never_classified is False
    assert summary.later is not None
    assert summary.later.set_id == building_id
    assert summary.stocks_current == reader.StocksCurrent(current_count=2, followed_count=3)


def test_followed_count_is_active_instruments_and_matches_scored_roster(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-10, design 2.4: in a consistent set the stored size equals the scored roster."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(conn, 5)
    _stocks(conn, set_id, [{}, {}, {}, {"eps_growth": "missing"}, {}])

    summary = reader.summary(conn)
    with conn.cursor() as cur:
        cur.execute(reader.SUMMARY_SQL, {"set_id": set_id})
        row = cur.fetchone()

    assert summary.set is not None
    assert summary.stocks_current is not None
    assert summary.stocks_current.followed_count == summary.set.active_instruments == 5
    assert row is not None
    assert row[1] == summary.stocks_current.followed_count


def test_an_unranked_factor_changes_no_stocks_currency(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """AC-14, DAC-E3-10: a factor below 30 qualified touches no input row, so no currency."""
    conn = migrated_run_schema_connection
    set_id = _complete_set(
        conn, 2, factors={"value": (2, False), "growth": (2, False), "momentum": (2, False)}
    )
    _stocks(conn, set_id, [{}, {}])

    assert reader.summary(conn).stocks_current == reader.StocksCurrent(2, 2)


def test_complete_set_with_no_inputs_counts_zero_current(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-10: a complete set with no `factor_input` rows gives 0 current and no error."""
    conn = migrated_run_schema_connection
    _complete_set(conn, 4)

    assert reader.summary(conn).stocks_current == reader.StocksCurrent(0, 4)
