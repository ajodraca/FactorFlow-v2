"""Stale-claim reclaim sweep for the run journal (CAP-001-E5-S4).

Per `component-design-run-journal.md` section 2.6: the sweeper runs in the
application container, not the ingestion container, so it continues to operate
even when the ingestion process is crashed or stopped. It finds claimed runs
whose heartbeat has gone stale past the configured window, transitions them to
`abandoned`, clears the claim fields, and returns the reclaimed run identifiers.

The caller owns transaction commit control. This module does not claim queued
work, delete coverage or result rows, or modify any table other than
`acquisition_run`.
"""

from __future__ import annotations

import uuid
from typing import Any

import psycopg

__all__ = ["reclaim_stale_runs"]

# One parameterised UPDATE … RETURNING that atomically:
# - Selects only non-null claimed `running` or `cancelling` rows whose
#   heartbeat_at is strictly older than the staleness window (strict < so that
#   a heartbeat exactly equal to the boundary is not reclaimed).
# - Transitions them to `abandoned`, sets ended_at = now(), clears claimed_by
#   and heartbeat_at.
# - Returns the run_ids that were reclaimed (empty when nothing is stale).
#
# The FOR UPDATE inside the sub-SELECT is omitted here because the outer UPDATE
# uses a correlated sub-SELECT: only rows matched by the WHERE are touched, and
# PostgreSQL's per-row update lock prevents two concurrent transactions from
# terminalising the same row twice — the second one finds the row already
# `abandoned` (no longer `running`/`cancelling`) and therefore skips it.
_RECLAIM_SQL = """
UPDATE acquisition_run
   SET state        = 'abandoned',
       ended_at     = now(),
       claimed_by   = NULL,
       heartbeat_at = NULL
 WHERE state IN ('running', 'cancelling')
   AND claimed_by IS NOT NULL
   AND heartbeat_at < now() - make_interval(secs => %(stale_after_seconds)s)
RETURNING run_id
"""


def reclaim_stale_runs(
    connection: psycopg.Connection[Any],
    stale_after_seconds: float,
) -> list[uuid.UUID]:
    """Find and terminalise stale claimed runs as `abandoned`.

    Executes one parameterised UPDATE … RETURNING inside a single transaction.
    Only rows in `running` or `cancelling` with a non-null `claimed_by` and a
    `heartbeat_at` strictly older than ``stale_after_seconds`` are reclaimed.

    The caller owns commit control; this function does not commit.

    Returns the list of ``run_id`` values that were reclaimed (empty when
    nothing is stale, idempotent when called again after a previous reclaim).

    Per `component-design-run-journal.md` section 2.6 and
    `CAP-001-E5-S4.md` §Technical Details.
    """
    with connection.transaction():
        with connection.cursor() as cur:
            cur.execute(_RECLAIM_SQL, {"stale_after_seconds": stale_after_seconds})
            rows = cur.fetchall()
    return [uuid.UUID(str(row[0])) for row in rows]
