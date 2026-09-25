"""Request, claim, heartbeat, cancellation, and finalisation for the run journal.

Per `component-design-run-journal.md` sections 2.2-2.5: a request is always
recorded as `requested` — queueing, never rejection (AC-23) — and reports the
active run it follows. The claim is one statement in one transaction, taking
the oldest requested run only while none is running or cancelling; the
`idx_acquisition_run_single_active` partial unique index is the backstop that
turns a race past the guard into a unique violation rather than a second run.

Section 2.5: `heartbeat` refreshes the claim; returns False when the claim was
lost to the reclaim sweeper (AC-20). `cancellation_requested` reads the
cancellation flag between instruments (AC-19). `finalise` derives the terminal
outcome from written results without accepting a caller-supplied outcome (AC-9).

CAP-001-E4-S5 adds heartbeat, cancellation_requested, and finalise to support
the acquisition runner's between-instruments contract.  CAP-001-E5-S3 owns
cooperative cancellation (`request_cancel`) and CAP-001-E5-S4 owns the
heartbeat/reclaim sweep.
"""

from dataclasses import dataclass
from uuid import UUID

import psycopg

from factorflow.runs.states import validate_transition


class RunAlreadyTerminal(Exception):
    """Raised when a cancellation is attempted against a run that has already ended.

    Carries the persisted terminal state so the caller can report the actual
    outcome rather than a generic error (DAC-E5-9, DAC-E5-S3-4).
    """

    def __init__(self, message: str, *, actual_state: str) -> None:
        super().__init__(message)
        self.actual_state = actual_state


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


_READ_STATE_FOR_CANCEL_SQL = """
SELECT state FROM acquisition_run WHERE run_id = %s FOR UPDATE
"""

_CANCEL_RUNNING_SQL = """
UPDATE acquisition_run
   SET state = 'cancelling',
       cancel_requested_at = now()
 WHERE run_id = %s
"""

_CANCEL_REQUESTED_SQL = """
UPDATE acquisition_run
   SET state = 'cancelled',
       cancel_requested_at = now(),
       ended_at = now()
 WHERE run_id = %s
"""

_TERMINAL_STATES = frozenset({"succeeded", "partial", "failed", "cancelled", "abandoned"})


def request_cancel(connection: psycopg.Connection, run_id: UUID) -> str:
    """Record a cancellation request against a run (section 2.2, CAP-001-E5-S3).

    Two paths, both transactional:
    - `running` → `cancelling`: records cooperative intent without ending the run.
      The runner observes this between instruments and calls `finalise`.
    - `requested` → `cancelled`: direct state transition; the run never starts.
    - terminal states: raises `RunAlreadyTerminal` carrying the actual state;
      the row is not modified (DAC-E5-9, DAC-E5-S3-4).

    Returns the new state string.
    """
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(_READ_STATE_FOR_CANCEL_SQL, (run_id,))
            row = cursor.fetchone()
            if row is None:
                raise KeyError(f"run {run_id!r} not found")
            current_state = str(row[0])

            if current_state in _TERMINAL_STATES:
                raise RunAlreadyTerminal(
                    f"run {run_id!r} is already terminal: {current_state!r}",
                    actual_state=current_state,
                )

            next_state = "cancelling" if current_state == "running" else "cancelled"
            validate_transition(current_state, next_state)

            if current_state == "running":
                cursor.execute(_CANCEL_RUNNING_SQL, (run_id,))
                return "cancelling"
            else:
                # requested → cancelled
                cursor.execute(_CANCEL_REQUESTED_SQL, (run_id,))
                return "cancelled"


_HEARTBEAT_SQL = """
UPDATE acquisition_run
   SET heartbeat_at = now()
 WHERE run_id = %(run_id)s
   AND claimed_by = %(runner_id)s
   AND state IN ('running', 'cancelling')
"""

_CANCELLATION_SQL = """
SELECT state FROM acquisition_run WHERE run_id = %s
"""

_FINALISE_SQL_COUNTS = """
SELECT
    count(*) FILTER (WHERE outcome IN ('written', 'unchanged')) AS wrote,
    count(*) FILTER (WHERE outcome IN ('failed', 'not_found'))  AS did_not,
    count(DISTINCT instrument_id)                                AS reached
  FROM run_instrument_result
 WHERE run_id = %(run_id)s
"""

_FINALISE_UPDATE_SQL = """
UPDATE acquisition_run
   SET state = %(state)s,
       ended_at = now(),
       claimed_by = NULL,
       heartbeat_at = NULL
 WHERE run_id = %(run_id)s
"""

_FAILED_UPDATE_SQL = """
UPDATE acquisition_run
   SET state = 'failed',
       ended_at = now(),
       claimed_by = NULL,
       heartbeat_at = NULL,
       failure_reason = %(reason)s
 WHERE run_id = %(run_id)s
"""

_INSTRUMENTS_NAMED_SQL = """
SELECT instruments_named FROM acquisition_run WHERE run_id = %s
"""


def heartbeat(connection: psycopg.Connection, run_id: UUID, runner_id: str) -> bool:
    """Refresh the claim heartbeat. Returns False when the claim was lost.

    Issues one UPDATE that touches only this runner's claimed run in
    `running` or `cancelling` state.  A zero rowcount means the run was
    reclaimed (abandoned) or transitioned to a terminal state while this
    runner was working — the runner must stop immediately and write nothing
    further against this run_id (AC-20, DAC-E5-13).

    Per `component-design-run-journal.md` section 2.5.
    """
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(_HEARTBEAT_SQL, {"run_id": run_id, "runner_id": runner_id})
            return cursor.rowcount > 0


def cancellation_requested(connection: psycopg.Connection, run_id: UUID) -> bool:
    """Return True when the run has moved to `cancelling` state.

    Read between instruments by the runner (AC-19, DAC-E4-S5-1).
    The runner calls this at the same iteration point as `heartbeat`.
    """
    with connection.cursor() as cursor:
        cursor.execute(_CANCELLATION_SQL, (run_id,))
        row = cursor.fetchone()
    if row is None:
        return False
    return str(row[0]) == "cancelling"


def finalise(connection: psycopg.Connection, run_id: UUID) -> str:
    """Compute and record the terminal outcome from written results (section 2.5).

    Never accepts a caller-supplied outcome. Derives the state from
    `run_instrument_result` using the rule:
    1. State is `cancelling` → `cancelled`.
    2. Zero successful (`written`/`unchanged`) rows → `failed`.
    3. All named instruments wrote all four required data types → `succeeded`.
    4. Anything else → `partial`.

    Clears claim fields (claimed_by, heartbeat_at) and sets ended_at.
    Returns the recorded terminal state (AC-9, DAC-E5-4, DAC-E5-5).
    """
    with connection.transaction():
        with connection.cursor() as cursor:
            # Check for cancellation first (rule 1)
            cursor.execute(_CANCELLATION_SQL, (run_id,))
            state_row = cursor.fetchone()
            current_state = str(state_row[0]) if state_row else "running"

            if current_state == "cancelling":
                cursor.execute(_FINALISE_UPDATE_SQL, {"state": "cancelled", "run_id": run_id})
                return "cancelled"

            # Derive from written results
            cursor.execute(_FINALISE_SQL_COUNTS, {"run_id": run_id})
            counts_row = cursor.fetchone()
            wrote = int(counts_row[0]) if counts_row else 0

            if wrote == 0:
                # No successful result exists — failed (DAC-E5-S3-7)
                cursor.execute(_FINALISE_UPDATE_SQL, {"state": "failed", "run_id": run_id})
                return "failed"

            # At least one successful row exists; check for complete success
            cursor.execute(_INSTRUMENTS_NAMED_SQL, (run_id,))
            named_row = cursor.fetchone()
            instruments_named = int(named_row[0]) if named_row and named_row[0] else 0

            # succeeded requires exactly four successful rows per named instrument
            # and no non-successful rows at all (DAC-E5-S3-5)
            if instruments_named > 0 and wrote == instruments_named * 4:
                # Verify no non-successful rows exist (not_found, failed, skipped)
                cursor.execute(
                    "SELECT count(*) FROM run_instrument_result "
                    "WHERE run_id = %(run_id)s "
                    "AND outcome NOT IN ('written', 'unchanged')",
                    {"run_id": run_id},
                )
                non_success_row = cursor.fetchone()
                non_success = int(non_success_row[0]) if non_success_row else 0
                if non_success == 0:
                    cursor.execute(_FINALISE_UPDATE_SQL, {"state": "succeeded", "run_id": run_id})
                    return "succeeded"

            # Anything else is partial (DAC-E5-S3-6)
            cursor.execute(_FINALISE_UPDATE_SQL, {"state": "partial", "run_id": run_id})
            return "partial"
