"""Implements TC-COMP-168: reclaiming an interrupted build (CAP-002-E2-S8; DAC-E2-12)."""

import logging
from collections.abc import Iterator
from datetime import UTC, datetime, timedelta
from typing import Any

import psycopg
import pytest
from psycopg_pool import ConnectionPool

from factorflow.classification.scheduler import (
    ReclaimedSet,
    claim_next_set,
    reclaim_interrupted_sets,
)
from tests.integration.scheduler_support import (
    INTERRUPTED_REASON,
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


def _full_rows(conn: psycopg.Connection, set_ids: list[Any]) -> list[tuple[Any, ...]]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT t::text FROM classification_set t WHERE set_id = ANY(%s) ORDER BY 1",
            (set_ids,),
        )
        rows = cur.fetchall()
    conn.rollback()
    return rows


# Implements TC-COMP-168
def test_reclaim_fails_stale_building_sets_only(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
) -> None:
    pool, conn = store
    run_a = add_run(conn, "succeeded", T0)
    stale = add_set(conn, run_a, "building")
    complete = add_set(conn, add_run(conn, "succeeded", T0 + timedelta(hours=1)), "complete")
    failed = add_set(
        conn,
        add_run(conn, "partial", T0 + timedelta(hours=2)),
        "failed",
        failure_reason="own reason",
    )
    run_d = add_run(conn, "succeeded", T0 + timedelta(hours=3))
    untouched_before = _full_rows(conn, [complete, failed])
    with conn.cursor() as cur:
        cur.execute("SELECT clock_timestamp()")
        row = cur.fetchone()
    conn.rollback()
    assert row is not None
    before_reclaim = row[0]

    reclaim_interrupted_sets(pool)

    assert _full_rows(conn, [complete, failed]) == untouched_before
    rows = {r[0]: r for r in set_rows(conn)}
    assert rows[stale][2] == "failed"
    assert rows[stale][3] == INTERRUPTED_REASON
    with conn.cursor() as cur:
        cur.execute("SELECT ended_at FROM classification_set WHERE set_id = %s", (stale,))
        ended = cur.fetchone()
    conn.rollback()
    assert ended is not None
    assert ended[0] >= before_reclaim

    claimed = claim_next_set(pool)
    assert claimed is not None
    assert claimed.run_id == run_d


def test_reclaim_with_nothing_building_returns_empty_and_changes_nothing(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
) -> None:
    """AC-20, DAC-E2-12, DAC-E2-S8-6: nothing building means nothing is touched."""
    pool, conn = store
    complete = add_set(conn, add_run(conn, "succeeded"), "complete")
    before = _full_rows(conn, [complete])

    assert reclaim_interrupted_sets(pool) == []
    assert _full_rows(conn, [complete]) == before


def test_reclaim_reports_and_logs_each_set_and_is_idempotent(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
    caplog: pytest.LogCaptureFixture,
) -> None:
    """AC-20, DAC-E2-12, DAC-E2-S8-6: each reclaimed set is returned and logged once."""
    pool, conn = store
    run_a = add_run(conn, "succeeded")
    stale = add_set(conn, run_a, "building")

    with caplog.at_level(logging.WARNING):
        reclaimed = reclaim_interrupted_sets(pool)

    assert reclaimed == [ReclaimedSet(set_id=stale, run_id=run_a)]
    warnings = [r for r in caplog.records if r.levelno == logging.WARNING]
    assert len(warnings) == 1
    assert str(stale) in warnings[0].getMessage()
    assert reclaim_interrupted_sets(pool) == []
