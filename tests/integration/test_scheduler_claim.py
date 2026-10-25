"""Implements TC-COMP-077 to TC-COMP-081: the scheduler's qualifying-run claim (CAP-002-E2-S8)."""

from collections.abc import Iterator
from datetime import UTC, date, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import psycopg
import psycopg.errors
import pytest
from psycopg_pool import ConnectionPool

from factorflow.classification import scheduler
from factorflow.classification.scheduler import ClaimedSet, claim_next_set
from tests.integration.scheduler_support import (
    add_run,
    add_set,
    migrate_all,
    open_pool,
    set_rows,
)

pytestmark = pytest.mark.postgres

T0 = datetime(2026, 10, 1, 12, 0, tzinfo=UTC)


@pytest.fixture
def store(
    postgres_connection_string: str,
) -> Iterator[tuple["ConnectionPool[Any]", psycopg.Connection]]:
    migrate_all(postgres_connection_string)
    pool = open_pool(postgres_connection_string)
    conn = psycopg.connect(postgres_connection_string)
    try:
        yield pool, conn
    finally:
        conn.close()
        pool.close()


def _complete(conn: psycopg.Connection, set_id: Any) -> None:
    """Finish a building set so the single-building index admits the next claim."""
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE classification_set SET state = 'complete', ended_at = now(), "
            "latest_trading_day = '2026-09-30', active_instruments = 0 "
            "WHERE set_id = %s AND state = 'building'",
            (set_id,),
        )
    conn.commit()


# Implements TC-COMP-077
@pytest.mark.parametrize("qualifying", ["succeeded", "partial"])
def test_only_succeeded_and_partial_runs_are_claimed(
    store: tuple["ConnectionPool[Any]", psycopg.Connection], qualifying: str
) -> None:
    pool, conn = store
    for state in ("failed", "cancelled", "abandoned", "requested", "running"):
        add_run(conn, state)

    assert claim_next_set(pool) is None
    assert set_rows(conn) == []

    run_id = add_run(conn, qualifying)
    claimed = claim_next_set(pool)

    assert isinstance(claimed, ClaimedSet)
    assert claimed.run_id == run_id
    rows = set_rows(conn)
    assert [(r[0], r[1], r[2]) for r in rows] == [(claimed.set_id, run_id, "building")]


# Implements TC-COMP-078
def test_qualifying_runs_are_claimed_oldest_first_once_each(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
) -> None:
    pool, conn = store
    second = add_run(conn, "succeeded", T0 + timedelta(hours=1))
    third = add_run(conn, "partial", T0 + timedelta(hours=2))
    first = add_run(conn, "succeeded", T0)

    order = []
    for _ in range(3):
        claimed = claim_next_set(pool)
        assert claimed is not None
        order.append(claimed.run_id)
        _complete(conn, claimed.set_id)

    assert order == [first, second, third]
    assert claim_next_set(pool) is None
    assert sorted(str(r[1]) for r in set_rows(conn)) == sorted(str(r) for r in order)


# Implements TC-COMP-079
def test_claim_beside_a_building_set_returns_none_and_inserts_nothing(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
) -> None:
    pool, conn = store
    run_a = add_run(conn, "succeeded", T0)
    building = add_set(conn, run_a, "building")
    run_b = add_run(conn, "succeeded", T0 + timedelta(hours=1))

    assert claim_next_set(pool) is None

    rows = set_rows(conn)
    assert [(r[0], r[1], r[2]) for r in rows] == [(building, run_a, "building")]
    assert all(r[1] != run_b for r in rows)


# Implements TC-COMP-080
@pytest.mark.parametrize(
    ("instant", "chicago_date"),
    [
        (datetime(2026, 10, 15, 23, 30, tzinfo=ZoneInfo("America/Chicago")), date(2026, 10, 15)),
        (datetime(2026, 12, 15, 23, 30, tzinfo=ZoneInfo("America/Chicago")), date(2026, 12, 15)),
    ],
)
def test_claim_stamps_the_chicago_date(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
    instant: datetime,
    chicago_date: date,
) -> None:
    pool, conn = store
    add_run(conn, "succeeded")

    claimed = claim_next_set(pool, at=instant)

    assert claimed is not None
    with conn.cursor() as cur:
        cur.execute(
            "SELECT classification_date FROM classification_set WHERE set_id = %s",
            (claimed.set_id,),
        )
        row = cur.fetchone()
    conn.rollback()
    assert row is not None
    assert row[0] == chicago_date


# Implements TC-COMP-080
def test_claim_without_at_stamps_the_database_clock_chicago_date(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
) -> None:
    pool, conn = store
    add_run(conn, "succeeded")

    claimed = claim_next_set(pool)

    assert claimed is not None
    with conn.cursor() as cur:
        cur.execute(
            "SELECT classification_date, (now() AT TIME ZONE 'America/Chicago')::date "
            "FROM classification_set WHERE set_id = %s",
            (claimed.set_id,),
        )
        row = cur.fetchone()
    conn.rollback()
    assert row is not None
    stamped, expected = row
    # The two reads straddle at most one Chicago midnight.
    assert stamped in (expected, expected - timedelta(days=1))


# Implements TC-COMP-081
def test_failed_set_for_run_a_does_not_block_later_run_b(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
) -> None:
    pool, conn = store
    run_a = add_run(conn, "succeeded", T0)
    failed = add_set(conn, run_a, "failed", failure_reason="own reason")
    run_b = add_run(conn, "partial", T0 + timedelta(hours=1))

    claimed = claim_next_set(pool)
    assert claimed is not None
    assert claimed.run_id == run_b
    assert claim_next_set(pool) is None

    rows = set_rows(conn)
    assert len(rows) == 2
    assert (failed, run_a, "failed", "own reason") in rows
    assert [(r[1], r[2]) for r in rows if r[1] == run_b] == [(run_b, "building")]


def test_claim_returns_none_when_the_run_acquired_a_set_between_statements(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E2-4, AC-10 (design 2.4): a run_id UniqueViolation yields None and rolls back."""
    pool, conn = store
    run_a = add_run(conn, "succeeded", T0)
    add_set(conn, run_a, "failed")
    monkeypatch.setattr(scheduler, "_QUALIFYING_RUN_SQL", f"SELECT '{run_a}'::uuid")

    assert claim_next_set(pool) is None

    assert len(set_rows(conn)) == 1
    monkeypatch.undo()
    run_b = add_run(conn, "succeeded", T0 + timedelta(hours=1))
    follow_up = claim_next_set(pool)
    assert follow_up is not None
    assert follow_up.run_id == run_b


def test_claim_does_not_swallow_other_database_errors(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Only a UniqueViolation means "not now" (design 2.4, OPS-ERR-001); anything else raises."""
    pool, conn = store
    add_run(conn, "succeeded")
    monkeypatch.setattr(scheduler, "_QUALIFYING_RUN_SQL", "SELECT gen_random_uuid()")

    with pytest.raises(psycopg.errors.ForeignKeyViolation):
        claim_next_set(pool)

    assert set_rows(conn) == []
