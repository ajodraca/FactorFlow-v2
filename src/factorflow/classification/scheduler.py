"""Classification scheduler: claim a qualifying run, reclaim interrupted builds, run the loop.

The data side is CAP-002-E2-S8; the asyncio loop and the build handoff are CAP-002-E2-S9
(component-design-classification-scheduler.md section 2.4).
"""

import asyncio
import logging
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Final
from uuid import UUID

import psycopg.errors
from psycopg_pool import ConnectionPool

from factorflow.classification import engine, line_items
from factorflow.classification.settings import ClassificationSettings

_SQL_DIR = Path(__file__).parent / "sql"
_QUALIFYING_RUN_SQL: Final = (_SQL_DIR / "qualifying_run.sql").read_text()
_CLAIM_SET_SQL: Final = (_SQL_DIR / "claim_set.sql").read_text()
_RECLAIM_INTERRUPTED_SQL: Final = (_SQL_DIR / "reclaim_interrupted.sql").read_text()

_log = logging.getLogger(__name__)


@dataclass(frozen=True)
class ClaimedSet:
    set_id: UUID
    run_id: UUID


@dataclass(frozen=True)
class ReclaimedSet:
    set_id: UUID
    run_id: UUID


def claim_next_set(pool: "ConnectionPool[Any]", *, at: datetime | None = None) -> ClaimedSet | None:
    """Create a building set for the oldest qualifying run, or return None.

    `at` fixes the instant the classification date is taken from (DEC-0125); production
    passes nothing and the database clock is used. A UniqueViolation means a set is
    already building or the run acquired one between the two statements: both mean
    "not now", so the transaction is rolled back and None is returned.
    """
    try:
        with pool.connection() as conn, conn.cursor() as cur:
            cur.execute(_QUALIFYING_RUN_SQL)
            run = cur.fetchone()
            if run is None:
                return None
            run_id = run[0]
            cur.execute(_CLAIM_SET_SQL, {"run_id": run_id, "at": at})
            created = cur.fetchone()
            if created is None:
                raise RuntimeError("claim_set.sql returned no set_id")
            return ClaimedSet(set_id=created[0], run_id=run_id)
    except psycopg.errors.UniqueViolation:
        return None


def reclaim_interrupted_sets(pool: "ConnectionPool[Any]") -> list[ReclaimedSet]:
    """Record every set left building as failed; run once at start, before any claim."""
    with pool.connection() as conn, conn.cursor() as cur:
        cur.execute(_RECLAIM_INTERRUPTED_SQL)
        reclaimed = [ReclaimedSet(set_id=row[0], run_id=row[1]) for row in cur.fetchall()]
    for item in reclaimed:
        _log.warning(
            "classification set %s for run %s was interrupted; recorded failed",
            item.set_id,
            item.run_id,
        )
    return reclaimed


def build_claimed_set(
    pool: "ConnectionPool[Any]", set_id: UUID, timeout_seconds: float
) -> engine.BuildResult:
    """Check out one connection for the whole build and hand it to the engine (design 2.4).

    The engine records the set's terminal state itself, so the result is returned unchanged.
    """
    with pool.connection() as conn:
        return engine.build(conn, set_id, timeout_seconds)


async def run_classification_loop(
    pool: "ConnectionPool[Any]",
    settings: ClassificationSettings,
    wait_fn: Callable[[float], Awaitable[None]] | None = None,
    dispatch_fn: Callable[..., Awaitable[Any]] | None = None,
    stop_event: asyncio.Event | None = None,
) -> None:
    """Poll the run journal for a qualifying run, claim it, build it (DEC-0054)."""
    wait = wait_fn or asyncio.sleep
    dispatch = dispatch_fn or asyncio.to_thread
    log = logging.getLogger(__name__)

    await dispatch(reclaim_interrupted_sets, pool)  # DEC-0067, once
    for name in line_items.unresolved():
        log.warning("line item %s has no payload key; its inputs will be missing", name)

    while True:
        try:
            claimed = await dispatch(claim_next_set, pool)  # None, or (set_id, run_id)
            if claimed is not None:
                result = await dispatch(
                    build_claimed_set, pool, claimed.set_id, settings.build_timeout_seconds
                )
                log.info(
                    "classification set %s for run %s ended %s",
                    claimed.set_id,
                    claimed.run_id,
                    result.state,
                )
                continue  # look again at once: another run may be waiting
        except Exception:
            log.exception("classification scheduler iteration failed")
        if stop_event is not None and stop_event.is_set():
            break
        await wait(settings.poll_interval_seconds)
        if stop_event is not None and stop_event.is_set():
            break
