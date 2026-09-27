"""Per-instrument outcome classification (CAP-001-E4-S6).

Provides:
- ``InstrumentOutcomeRecord``: typed per-data-type result record for the writer.
- ``classify_write_result``: maps a ``WriteResult`` to per-data-type outcome strings.
- ``classify_provider_error``: maps a typed ``MassiveError`` to a single
  ``InstrumentOutcomeRecord`` for the failing data type.
- ``write_error_results``: the runner's error path, preserved from E4-S5 (IR-002, IR-004).

This module owns the classification boundary only. It contains no SQL, no
provider URL construction, no retry loops, no credential access, and no
reason-composition logic. It consumes the already-composed, credential-safe
reason from the Massive-client boundary (CAP-001-E3-S5) without reformatting
or re-redacting it.

``CredentialRejected`` is a run-level failure: it must not become a per-data-type
outcome. ``classify_provider_error`` raises ``ValueError`` for it so callers
cannot accidentally persist it as a data-type row.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

import psycopg

from factorflow.ingestion.massive.errors import (
    CredentialRejected,
    InstrumentNotFound,
    MassiveError,
    ProviderContractViolation,
    ProviderUnavailable,
)
from factorflow.ingestion.writer import WriteResult

__all__ = [
    "InstrumentOutcomeRecord",
    "classify_write_result",
    "classify_provider_error",
    "write_error_results",
]

# The four schema data-type names used by run_instrument_result
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


# ---------------------------------------------------------------------------
# Typed outcome record
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class InstrumentOutcomeRecord:
    """Typed per-data-type outcome record for the writer to persist.

    Carries the outcome string and the pre-composed, credential-safe reason
    (``None`` for success paths). The writer consumes this to insert into
    ``run_instrument_result``.
    """

    data_type: str
    outcome: str
    reason: str | None = None


# ---------------------------------------------------------------------------
# Success-path classifier (T007)
# ---------------------------------------------------------------------------


def classify_write_result(result: WriteResult) -> dict[str, str]:
    """Classify a ``WriteResult`` into per-data-type outcome strings.

    Maps each data type to ``"written"`` if any rows were appended, or
    ``"unchanged"`` if every returned row already existed (or none came back).

    Returns a dict with exactly four keys: the four schema data-type names.
    No ``InstrumentOutcomeRecord`` is created here; the runner passes the
    outcome strings to ``write_instrument`` as part of its integration
    (T009/T010), but the pure mapping is needed first for TDD.
    """
    return {
        "reference": "written" if result.reference_appended > 0 else "unchanged",
        "prices": "written" if result.prices_appended > 0 else "unchanged",
        "fundamentals": "written" if result.fundamentals_appended > 0 else "unchanged",
        "corporate_actions": "written" if result.corporate_actions_appended > 0 else "unchanged",
    }


# ---------------------------------------------------------------------------
# Failure-path classifier (T008)
# ---------------------------------------------------------------------------


def classify_provider_error(
    error: MassiveError,
    *,
    data_type: str,
    reason: str,
) -> InstrumentOutcomeRecord:
    """Map a typed ``MassiveError`` to a per-data-type ``InstrumentOutcomeRecord``.

    ``InstrumentNotFound`` maps to ``"not_found"``.
    ``ProviderUnavailable`` and ``ProviderContractViolation`` both map to
    ``"failed"`` — the provider is unavailable in both cases from the run's
    perspective.

    ``CredentialRejected`` is a run-level failure that must not become a
    per-data-type outcome. This function raises ``ValueError`` for it so
    callers cannot accidentally create a data-type row for it.

    Any other (unrecognised) type raises ``TypeError``.

    The ``reason`` argument is the already-composed, credential-safe reason
    string from the Massive-client boundary (``compose_failure_reason``).
    This module does not re-compose or re-redact it.
    """
    if isinstance(error, CredentialRejected):
        raise ValueError(
            "CredentialRejected is a run-level failure and must not become a "
            "per-data-type outcome. Fail the run instead."
        )

    if isinstance(error, InstrumentNotFound):
        return InstrumentOutcomeRecord(
            data_type=data_type,
            outcome="not_found",
            reason=reason,
        )

    if isinstance(error, (ProviderUnavailable, ProviderContractViolation)):
        return InstrumentOutcomeRecord(
            data_type=data_type,
            outcome="failed",
            reason=reason,
        )

    raise TypeError(
        f"classify_provider_error does not support {type(error).__name__}; "
        "only InstrumentNotFound, ProviderUnavailable, and ProviderContractViolation "
        "are accepted as per-data-type outcomes."
    )


# ---------------------------------------------------------------------------
# Error-path write helper (preserved from E4-S5, now extended by T008/T010)
# ---------------------------------------------------------------------------


def write_error_results(
    connection: psycopg.Connection,
    run_id: uuid.UUID,
    instrument_id: int,
    outcome: str,
    reason: str,
) -> None:
    """Insert ``run_instrument_result`` rows for all four data types when
    the provider failed for this instrument before any per-data-type result
    was classified.  Also upserts ``acquisition_state``.

    Called by the runner for ``InstrumentNotFound`` and ``ProviderUnavailable``
    (and other ``MassiveError``) raised during the all-at-once fetch phase,
    before the per-data-type fetch seam introduced by E4-S6 is reached.  Once
    the runner fetches data types individually, ``classify_provider_error`` +
    ``write_instrument_outcome`` replace this path for individual failures.

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
