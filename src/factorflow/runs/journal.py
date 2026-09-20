"""Request and claim operations on the acquisition-run journal.

Per `component-design-run-journal.md` sections 2.2-2.4: a request is always
recorded as `requested` — queueing, never rejection (AC-23) — and reports the
active run it follows. The claim is one statement in one transaction, taking
the oldest requested run only while none is running or cancelling; the
`idx_acquisition_run_single_active` partial unique index is the backstop that
turns a race past the guard into a unique violation rather than a second run.
"""

from dataclasses import dataclass
from uuid import UUID

import psycopg

_REQUEST_SQL = """
INSERT INTO acquisition_run (state, history_depth_years)
VALUES ('requested', %s)
RETURNING run_id
"""

_ACTIVE_RUN_SQL = """
SELECT run_id FROM acquisition_run WHERE state IN ('running', 'cancelling')
"""

_CLAIM_SQL = """
UPDATE acquisition_run
   SET state = 'running', started_at = now(),
       claimed_by = %(runner_id)s, heartbeat_at = now()
 WHERE run_id = (
       SELECT run_id FROM acquisition_run
        WHERE state = 'requested'
          AND NOT EXISTS (SELECT 1 FROM acquisition_run
                           WHERE state IN ('running', 'cancelling'))
        ORDER BY requested_at LIMIT 1 FOR UPDATE SKIP LOCKED)
RETURNING run_id, history_depth_years
"""


@dataclass(frozen=True)
class ClaimedRun:
    """A claimed run: its id and the history depth snapshotted at request."""

    run_id: UUID
    history_depth_years: int


def request_run(
    connection: psycopg.Connection, history_depth_years: int
) -> tuple[UUID, UUID | None]:
    """Insert a requested run. Returns its id and the active run's id, if any.

    Never rejects because a run is active: that is what queueing means
    (AC-23). The insert and the active-run lookup share one transaction, so
    the reported id is the run this request actually queued behind; the active
    row itself is not touched.
    """
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(_REQUEST_SQL, (history_depth_years,))
            inserted = cursor.fetchone()
            assert inserted is not None  # INSERT ... RETURNING always yields a row
            cursor.execute(_ACTIVE_RUN_SQL)
            active = cursor.fetchone()
    return inserted[0], active[0] if active is not None else None


def claim_next(connection: psycopg.Connection, runner_id: str) -> ClaimedRun | None:
    """Claim the oldest requested run when none is active (section 2.3).

    One statement, one transaction, no read-then-write window. A `None`
    return means nothing is claimable; the runner waits at the configured
    interval and polls again. The returned depth is the snapshot persisted on
    the run row, never the current setting.
    """
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(_CLAIM_SQL, {"runner_id": runner_id})
            row = cursor.fetchone()
    if row is None:
        return None
    return ClaimedRun(run_id=row[0], history_depth_years=row[1])
