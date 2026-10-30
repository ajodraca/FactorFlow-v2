"""Reclaiming an interrupted build and the loop over a real store.

Implements TC-COMP-168 (CAP-002-E2-S8; DAC-E2-12) and TC-COMP-092 (CAP-002-E2-S9; DAC-E2-S9-4),
with CAP-002-E2-S9's restart-then-build case (design acceptance criterion 10).
"""

import asyncio
import logging
import time
from collections.abc import Iterator
from datetime import UTC, date, datetime, timedelta
from typing import Any

import psycopg
import pytest
from psycopg_pool import ConnectionPool

from factorflow.classification import engine, scheduler
from factorflow.classification.scheduler import (
    ReclaimedSet,
    claim_next_set,
    reclaim_interrupted_sets,
)
from factorflow.classification.settings import ClassificationSettings
from tests.integration.engine_support import add_bar, add_instrument, count_classification_rows
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


def _run_loop_until_first_wait(
    pool: "ConnectionPool[Any]", settings: ClassificationSettings
) -> None:
    """Run the loop with the default dispatcher (a real thread) until its first idle wait."""
    stop = asyncio.Event()

    async def stop_after_first_wait(seconds: float) -> None:
        stop.set()
        await asyncio.sleep(0)

    asyncio.run(
        scheduler.run_classification_loop(
            pool, settings, wait_fn=stop_after_first_wait, stop_event=stop
        )
    )


def _one_active_instrument_with_a_bar(conn: psycopg.Connection) -> None:
    """Without a bar the engine fails with "no price data" before any stage runs."""
    add_bar(conn, add_instrument(conn, "AAA"), date(2026, 9, 30))


# Implements TC-COMP-092
def test_short_build_timeout_reaches_the_engine_and_fails_the_set(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """DAC-E2-S9-4, AC-11, AC-20: a 50 ms build_timeout_seconds crosses the loop, a real
    thread and a real pool to the engine, which cancels a five-second stage and records the
    set failed with a timeout reason and no classification rows."""
    pool, conn = store
    _one_active_instrument_with_a_bar(conn)
    run_id = add_run(conn, "succeeded", T0)

    def sleeping_stage(stage_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        stage_conn.execute("SELECT pg_sleep(5)")

    monkeypatch.setattr(engine, "_STAGES", [sleeping_stage])
    # model_construct skips the ge=1 bound and the poll-below-timeout validator on purpose:
    # a 50 ms timeout is the only way to make a unit-sized store "too short", and
    # CAP-002-E2-S8 already proves the validators. The poll interval is longer than the
    # stage's sleep, so a build handed the poll interval instead would also outlast it.
    settings = ClassificationSettings.model_construct(
        poll_interval_seconds=10.0, build_timeout_seconds=0.05
    )

    started = time.monotonic()
    with caplog.at_level(logging.INFO, logger="factorflow.classification.scheduler"):
        _run_loop_until_first_wait(pool, settings)
    elapsed = time.monotonic() - started

    rows = [row for row in set_rows(conn) if row[1] == run_id]
    assert len(rows) == 1
    set_id, _, state, reason = rows[0]
    assert state == "failed"
    assert reason.startswith("QueryCanceled")
    assert "timeout" in reason
    assert count_classification_rows(conn, set_id) == {
        "classification_set_factor": 0,
        "factor_input": 0,
        "factor_classification": 0,
    }
    conn.rollback()
    infos = [
        r.getMessage()
        for r in caplog.records
        if r.name == "factorflow.classification.scheduler" and r.levelno == logging.INFO
    ]
    assert infos == [f"classification set {set_id} for run {run_id} ended failed"]
    assert elapsed < 4  # the stage sleeps 5 s: the timeout, not the sleep, ended the build


def test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run(
    store: tuple["ConnectionPool[Any]", psycopg.Connection],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E2-12, AC-10, AC-20, DAC-E2-4 (design acceptance criterion 10): after a restart
    the stale building set is failed with the fixed reason before any claim, the next
    qualifying run gets one complete set, a failed run gets none, and a second start
    changes nothing."""
    pool, conn = store
    _one_active_instrument_with_a_bar(conn)
    run_a = add_run(conn, "succeeded", T0)
    stale = add_set(conn, run_a, "building")
    run_b = add_run(conn, "partial", T0 + timedelta(hours=1))
    run_c = add_run(conn, "failed", T0 + timedelta(hours=2))
    monkeypatch.setattr(engine, "_STAGES", [])
    settings = ClassificationSettings(poll_interval_seconds=1, build_timeout_seconds=60)

    _run_loop_until_first_wait(pool, settings)

    rows = set_rows(conn)
    by_run: dict[Any, list[tuple[Any, ...]]] = {}
    for set_id, run_id, state, reason in rows:
        by_run.setdefault(run_id, []).append((set_id, state, reason))
    assert by_run[run_a] == [(stale, "failed", INTERRUPTED_REASON)]
    assert [(state, reason) for _, state, reason in by_run[run_b]] == [("complete", None)]
    assert run_c not in by_run
    assert set(by_run) == {run_a, run_b}
    assert [row for row in rows if row[2] == "building"] == []

    before = _full_rows(conn, [row[0] for row in rows])
    _run_loop_until_first_wait(pool, settings)

    assert len(set_rows(conn)) == len(rows)
    assert _full_rows(conn, [row[0] for row in rows]) == before
