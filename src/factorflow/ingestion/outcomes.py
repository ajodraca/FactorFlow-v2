"""Per-instrument error outcome recording (CAP-001-E4-S5, IR-002, IR-004).

Provides ``write_error_results``: the runner's only path for recording a
provider failure against an instrument.  This module owns the SQL for error
outcome rows, keeping ``runner.py`` free of SQL statements per the component
design's SEC-INP-002 constraint ("the runner builds no SQL").

The writer (``writer.py``) owns success-path SQL; this module owns the
failure path.  CAP-001-E4-S6 will extend or replace this module when it
implements full per-instrument outcome classification.
"""

from __future__ import annotations

import uuid

import psycopg

_DATA_TYPES = ("reference", "prices", "fundamentals", "corporate_actions")

_INSERT_RESULT_SQL = (
    "INSERT INTO run_instrument_result "
    "(run_id, instrument_id, data_type, outcome, reason) "
    "VALUES (%s, %s, %s, %s, %s)"
)

_UPSERT_STATE_SQL = (
    "INSERT INTO acquisition_state "
    "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
    "VALUES (%s, %s, now(), %s, %s) "
    "ON CONFLICT (instrument_id, data_type) DO UPDATE "
    "SET last_acquired_at = EXCLUDED.last_acquired_at, "
    "    last_run_id = EXCLUDED.last_run_id, "
    "    last_outcome = EXCLUDED.last_outcome"
)


def write_error_results(
    connection: psycopg.Connection,
    run_id: uuid.UUID,
    instrument_id: int,
    outcome: str,
    reason: str,
) -> None:
    """Insert ``run_instrument_result`` rows for all four data types when
    the provider failed for this instrument.  Also upserts
    ``acquisition_state`` so the history of this instrument reflects the
    failure.

    Called by the runner for ``InstrumentNotFound`` and ``ProviderUnavailable``
    (and any other ``MassiveError``) so that ``runner.py`` contains no SQL
    statements (SEC-INP-002).

    Args:
        connection: An open psycopg connection.
        run_id: The acquisition run this failure belongs to.
        instrument_id: The failing instrument.
        outcome: ``"not_found"`` or ``"failed"`` per the error taxonomy.
        reason: A pre-composed, pre-redacted failure reason string.
    """
    with connection.transaction():
        with connection.cursor() as cur:
            for data_type in _DATA_TYPES:
                cur.execute(
                    _INSERT_RESULT_SQL,
                    (run_id, instrument_id, data_type, outcome, reason),
                )
                cur.execute(
                    _UPSERT_STATE_SQL,
                    (instrument_id, data_type, run_id, outcome),
                )
