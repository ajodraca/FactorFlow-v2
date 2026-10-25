"""Classification scheduler, data side: claim a qualifying run and reclaim interrupted builds.

The asyncio loop and the build handoff are CAP-002-E2-S9.
"""

import logging
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Final
from uuid import UUID

import psycopg.errors
from psycopg_pool import ConnectionPool

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
