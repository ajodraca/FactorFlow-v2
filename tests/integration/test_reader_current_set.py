"""The current set and the `later` attempt (CAP-002-E3-S1).

Proves `component-design-classification-reader.md` sections 2.3, 2.4 and the section 7
rows *Current is latest complete*, *Not current while building*, *Not current after
failure*, *Never classified* and *Run outcome, ended_at, run_started_at and counts*,
against a real PostgreSQL store seeded directly (DAC-E3-S1-1 to DAC-E3-S1-3, DAC-E3-1,
DAC-E3-11; AC-20, AC-21, AC-22).
"""

import dataclasses
from datetime import UTC, date, datetime, timedelta
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import reader
from tests.integration.reader_seed import insert_run, insert_set

pytestmark = pytest.mark.postgres

T0 = datetime(2026, 10, 14, 22, 30, tzinfo=UTC)


def _complete(
    conn: psycopg.Connection,
    started_at: datetime,
    *,
    run_state: str = "succeeded",
    active_instruments: int = 40,
) -> tuple[UUID, UUID]:
    run_id = insert_run(conn, run_state, started_at=started_at - timedelta(hours=1))
    set_id = insert_set(
        conn,
        run_id,
        "complete",
        started_at=started_at,
        ended_at=started_at + timedelta(minutes=5),
        latest_trading_day=date(2026, 10, 14),
        active_instruments=active_instruments,
        factors={"value": (35, True), "growth": (31, True), "momentum": (12, False)},
    )
    return run_id, set_id


# Implements TC-COMP-170
def test_complete_set_with_newer_building_set_is_served_with_later(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S1-1, DAC-E3-1: the complete set is `set`, the building one `later`, not current."""
    conn = migrated_run_schema_connection
    _, complete_id = _complete(conn, T0)
    run_b_started = T0 + timedelta(days=1)
    run_b = insert_run(conn, "succeeded", started_at=run_b_started)
    building_started = run_b_started + timedelta(hours=1)
    # The building set has factor rows of its own, unlike the complete set's (IR-002).
    building_id = insert_set(
        conn,
        run_b,
        "building",
        started_at=building_started,
        factors={"value": (3, False), "growth": (4, False), "momentum": (50, True)},
    )

    current, later = reader.read_set_blocks(conn)
    summary = reader.summary(conn)

    for set_block, later_block, never in (
        (current, later, current is None),
        (summary.set, summary.later, summary.never_classified),
    ):
        assert set_block is not None
        assert set_block.set_id == complete_id
        assert set_block.not_current is True
        assert set_block.factors == {
            "value": reader.FactorSummary(35, True, 30),
            "growth": reader.FactorSummary(31, True, 30),
            "momentum": reader.FactorSummary(12, False, 30),
        }
        assert never is False
        assert later_block is not None
        assert later_block.set_id == building_id
        assert later_block.state == "building"
        assert later_block.run_id == run_b
        assert later_block.run_started_at == run_b_started
        # The set's own start: not the run's, nor the current set's (IR-001).
        assert later_block.started_at == building_started
        assert later_block.ended_at is None
        assert later_block.failure_reason is None
    assert summary.set == current
    assert summary.later == later

    served = reader.current_set(conn)
    assert served is not None
    assert served.set_id == complete_id
    assert served.not_current is True


# Implements TC-COMP-171
@pytest.mark.parametrize("state", ["building", "failed"])
def test_first_set_building_or_failed_is_never_classified_with_later(
    migrated_run_schema_connection: psycopg.Connection, state: str
) -> None:
    """DAC-E3-S1-2, DAC-E3-11: no complete set, so `set` is None and the first set is `later`."""
    conn = migrated_run_schema_connection
    run_started = T0
    run_id = insert_run(conn, "succeeded", started_at=run_started)
    failed = state == "failed"
    set_id = insert_set(
        conn,
        run_id,
        state,
        started_at=T0 + timedelta(hours=1),
        ended_at=T0 + timedelta(hours=2) if failed else None,
        failure_reason="boom" if failed else None,
    )

    assert reader.current_set(conn) is None
    current, later = reader.read_set_blocks(conn)
    summary = reader.summary(conn)

    assert current is None
    assert summary.set is None
    assert summary.never_classified is True
    for block in (later, summary.later):
        assert block is not None
        assert block.set_id == set_id
        assert block.state == state
        assert block.run_id == run_id
        assert block.run_started_at == run_started
        # The set's own start, distinct from the run's; there is no current set (IR-001).
        assert block.started_at == T0 + timedelta(hours=1)
        if failed:
            assert block.failure_reason == "boom"
            assert block.ended_at == T0 + timedelta(hours=2)
        else:
            assert block.failure_reason is None
            assert block.ended_at is None


# Implements TC-COMP-181
def test_no_set_at_all_is_never_classified_in_the_same_shape(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-S1-3, AC-22: with no set, `set` and `later` are None and the shape is unchanged."""
    conn = migrated_run_schema_connection

    assert reader.current_set(conn) is None
    assert reader.read_set_blocks(conn) == (None, None)
    summary = reader.summary(conn)
    assert summary.set is None
    assert summary.later is None
    assert summary.never_classified is True

    # The same type and field names in every state (TC-COMP-170, TC-COMP-171 above).
    assert type(summary) is reader.Summary
    assert [f.name for f in dataclasses.fields(summary)] == [
        "set",
        "never_classified",
        "later",
        "stocks_current",
    ]
    _complete(conn, T0)
    populated = reader.summary(conn)
    assert type(populated) is reader.Summary
    assert [f.name for f in dataclasses.fields(populated)] == [
        f.name for f in dataclasses.fields(summary)
    ]


def test_latest_complete_set_by_ended_at_is_current(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Constraint 11, DAC-E3-1: of two complete sets the later `ended_at` is current."""
    conn = migrated_run_schema_connection
    _complete(conn, T0)
    _, newer = _complete(conn, T0 + timedelta(days=1))

    current, later = reader.read_set_blocks(conn)

    assert current is not None
    assert current.set_id == newer
    assert later is None
    assert current.not_current is False


def test_newer_failed_set_is_later_and_previous_set_still_served(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """AC-20, DAC-E3-1: a newer failed set is `later` with its reason; the complete set stays."""
    conn = migrated_run_schema_connection
    _, complete_id = _complete(conn, T0)
    run_id = insert_run(conn, "succeeded", started_at=T0 + timedelta(days=1))
    failed_id = insert_set(
        conn,
        run_id,
        "failed",
        started_at=T0 + timedelta(days=1, hours=1),
        ended_at=T0 + timedelta(days=1, hours=2),
        failure_reason="peer set query failed",
    )

    current, later = reader.read_set_blocks(conn)

    assert current is not None
    assert current.set_id == complete_id
    assert current.not_current is True
    assert later is not None
    assert later.set_id == failed_id
    assert later.state == "failed"
    assert later.failure_reason == "peer set query failed"


def test_complete_set_alone_has_no_later(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """AC-20, DAC-E3-1: with no newer set, `later` is None and `not_current` is false."""
    conn = migrated_run_schema_connection
    _complete(conn, T0)

    current, later = reader.read_set_blocks(conn)

    assert current is not None
    assert later is None
    assert current.not_current is False


def test_building_set_older_than_current_is_not_later(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-1: `later` is only a set started after the current one."""
    conn = migrated_run_schema_connection
    run_id = insert_run(conn, "succeeded", started_at=T0 - timedelta(days=2))
    insert_set(conn, run_id, "building", started_at=T0 - timedelta(days=1))
    _, complete_id = _complete(conn, T0)

    current, later = reader.read_set_blocks(conn)

    assert current is not None
    assert current.set_id == complete_id
    assert later is None
    assert current.not_current is False


def test_current_is_chosen_by_ended_at_where_started_at_orders_otherwise(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Design 2.4, DAC-E3-1: the current set is the latest by `ended_at`, not by `started_at`.

    Set A starts first and ends last; set B starts and ends inside A's window. A is current,
    with its own factor rows although B has different ones (IR-003, IR-002). B is inserted
    first, the reverse of TC-COMP-170's order, so a `factors` subquery that merges every set's
    rows fails one of the two tests whichever duplicate key it keeps. A complete set started
    after the current one cannot exist by construction (design 2.4), so `later` and
    `not_current` are deliberately not asserted here.
    """
    conn = migrated_run_schema_connection
    run_b = insert_run(conn, "succeeded", started_at=T0)
    insert_set(
        conn,
        run_b,
        "complete",
        started_at=T0 + timedelta(hours=1),
        ended_at=T0 + timedelta(hours=2),
        latest_trading_day=date(2026, 10, 14),
        active_instruments=40,
        factors={"value": (20, False), "growth": (44, True), "momentum": (36, True)},
    )
    run_a = insert_run(conn, "succeeded", started_at=T0 - timedelta(hours=1))
    set_a = insert_set(
        conn,
        run_a,
        "complete",
        started_at=T0,
        ended_at=T0 + timedelta(hours=3),
        latest_trading_day=date(2026, 10, 14),
        active_instruments=40,
        factors={"value": (35, True), "growth": (31, True), "momentum": (12, False)},
    )

    current = reader.current_set(conn)
    summary = reader.summary(conn)

    for block in (current, summary.set):
        assert block is not None
        assert block.set_id == set_a
        assert block.run_id == run_a
        assert block.ended_at == T0 + timedelta(hours=3)
        assert block.factors == {
            "value": reader.FactorSummary(35, True, 30),
            "growth": reader.FactorSummary(31, True, 30),
            "momentum": reader.FactorSummary(12, False, 30),
        }


def test_set_started_while_current_was_building_is_later(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Design 2.4, DEC-0082, DAC-E3-1: `later` is a set started after the current set's
    `started_at`, even one started before the current set's `ended_at` (IR-003)."""
    conn = migrated_run_schema_connection
    run_c = insert_run(conn, "succeeded", started_at=T0 - timedelta(hours=1))
    complete_id = insert_set(
        conn,
        run_c,
        "complete",
        started_at=T0,
        ended_at=T0 + timedelta(hours=3),
        latest_trading_day=date(2026, 10, 14),
        active_instruments=40,
    )
    run_l = insert_run(conn, "succeeded", started_at=T0 + timedelta(minutes=30))
    later_started = T0 + timedelta(hours=1)
    building_id = insert_set(conn, run_l, "building", started_at=later_started)

    current, later = reader.read_set_blocks(conn)

    assert current is not None
    assert current.set_id == complete_id
    assert current.not_current is True
    assert later is not None
    assert later.set_id == building_id
    assert later.state == "building"
    assert later.started_at == later_started


@pytest.mark.parametrize("run_state", ["succeeded", "partial"])
def test_current_set_carries_run_and_set_fields(
    migrated_run_schema_connection: psycopg.Connection, run_state: str
) -> None:
    """AC-21, DAC-E3-1: the run's outcome and start, the set's dates, size and factor counts."""
    conn = migrated_run_schema_connection
    run_started = T0 - timedelta(hours=1)
    run_id = insert_run(conn, run_state, started_at=run_started)
    set_id = insert_set(
        conn,
        run_id,
        "complete",
        started_at=T0,
        ended_at=T0 + timedelta(minutes=7),
        classification_date=date(2026, 10, 14),
        latest_trading_day=date(2026, 10, 13),
        active_instruments=42,
        factors={"value": (35, True), "growth": (31, True), "momentum": (12, False)},
    )

    current = reader.current_set(conn)

    assert current is not None
    assert current.set_id == set_id
    assert current.classification_date == date(2026, 10, 14)
    assert current.run_id == run_id
    assert current.run_started_at == run_started
    assert current.run_outcome == run_state
    assert current.state == "complete"
    assert current.started_at == T0
    assert current.ended_at == T0 + timedelta(minutes=7)
    assert current.latest_trading_day == date(2026, 10, 13)
    assert current.active_instruments == 42
    assert list(current.factors) == list(reader.FACTORS) == ["value", "growth", "momentum"]
    assert current.factors["value"] == reader.FactorSummary(35, True, 30)
    assert current.factors["growth"] == reader.FactorSummary(31, True, 30)
    assert current.factors["momentum"] == reader.FactorSummary(12, False, 30)
    assert all(f.min_peer_set_size == 30 for f in current.factors.values())


def test_most_recent_non_complete_set_is_later_while_none_is_complete(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E3-1, AC-20: with no complete set and two attempts, `later` is the most recent.

    PROVISIONAL, awaiting owner confirmation (2026-10-17), Open Gap 1 of CAP-002-E3-S1-tasks:
    the design's statement orders `later` by `started_at DESC`; a change to "the earliest set"
    must be deliberate and fail this test.
    """
    conn = migrated_run_schema_connection
    first_run = insert_run(conn, "succeeded", started_at=T0)
    insert_set(
        conn,
        first_run,
        "failed",
        started_at=T0 + timedelta(hours=1),
        ended_at=T0 + timedelta(hours=2),
        failure_reason="boom",
    )
    second_run = insert_run(conn, "succeeded", started_at=T0 + timedelta(days=1))
    retry_id = insert_set(conn, second_run, "building", started_at=T0 + timedelta(days=1, hours=1))

    current, later = reader.read_set_blocks(conn)

    assert current is None
    assert later is not None
    assert later.set_id == retry_id
    assert later.state == "building"
    # One row however many sets there are: `later` is one set, not the first of several.
    with conn.cursor() as cur:
        cur.execute(reader.CURRENT_SET_SQL)
        assert len(cur.fetchall()) == 1


def test_returned_blocks_are_immutable(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Design 2.3: the blocks are frozen, so a consumer cannot alter a stored value."""
    conn = migrated_run_schema_connection
    _complete(conn, T0)
    run_id = insert_run(conn, "succeeded", started_at=T0 + timedelta(days=1))
    insert_set(conn, run_id, "building", started_at=T0 + timedelta(days=1, hours=1))

    summary = reader.summary(conn)
    assert summary.set is not None
    assert summary.later is not None
    assert summary.stocks_current is not None
    blocks: list[tuple[object, str]] = [
        (summary, "never_classified"),
        (summary.set, "not_current"),
        (summary.set.factors["value"], "ranked"),
        (summary.later, "state"),
        (summary.stocks_current, "current_count"),
    ]
    for block, name in blocks:
        with pytest.raises(dataclasses.FrozenInstanceError):
            setattr(block, name, None)
