"""Observation writer: one atomic transaction per instrument (CAP-001-E4-S3).

Delivers:
- ``ParsedObservations``: writer-local typed grouping of the four provider-model
  collections and each data type's actual returned coverage range.
- ``WriteResult``: immutable per-type appended/unchanged counts and covered ranges.
- ``write_instrument``: commits observations, coverage, acquisition state, and
  run results atomically; rolls back on any failure.

No ORM, no float values, no runner dependency.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import date
from typing import Any

import psycopg
from psycopg.types.json import Jsonb

from factorflow.ingestion.coverage import merge_ranges
from factorflow.ingestion.hashing import value_hash
from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)

__all__ = [
    "ObservationBatch",
    "ParsedObservations",
    "WriteResult",
    "write_instrument",
    "write_instrument_with_outcomes",
]


# ---------------------------------------------------------------------------
# Typed input contract
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ParsedObservations:
    """Writer-local typed grouping of the four provider-model collections.

    Each data type carries the actual coverage range returned by the provider
    for this instrument.  ``ParsedObservations`` is a writer-local boundary:
    it must not depend on the runner module.

    Owner decision 2026-09-18: this is the smallest boundary that can prove
    coverage reflects returned data without depending on the not-yet-implemented
    runner.  The next revision of ``component-design-observation-writer.md``
    should define this ownership and per-data-type shape explicitly.
    """

    reference: list[TickerReference]
    prices: list[DailyBar]
    fundamentals: list[FinancialStatement]
    corporate_actions: list[CorporateAction]

    # Actual coverage ranges returned by the provider -- used for coverage_segment
    reference_range: tuple[date, date]
    prices_range: tuple[date, date]
    fundamentals_range: tuple[date, date]
    corporate_actions_range: tuple[date, date]


# Alias for the type-level name referenced in the task plan
ObservationBatch = ParsedObservations


# ---------------------------------------------------------------------------
# Immutable result contract
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class WriteResult:
    """Immutable per-data-type write outcome.

    Exposes appended and unchanged row counts alongside the actual covered
    range for each data type (DAC-E4-S3-1).
    """

    reference_appended: int
    reference_unchanged: int
    reference_covered_range: tuple[date, date]

    prices_appended: int
    prices_unchanged: int
    prices_covered_range: tuple[date, date]

    fundamentals_appended: int
    fundamentals_unchanged: int
    fundamentals_covered_range: tuple[date, date]

    corporate_actions_appended: int
    corporate_actions_unchanged: int
    corporate_actions_covered_range: tuple[date, date]


# ---------------------------------------------------------------------------
# Insert helpers (append-only, ON CONFLICT DO NOTHING)
# ---------------------------------------------------------------------------


def _insert_references(
    cur: psycopg.Cursor[Any],
    instrument_id: int,
    records: list[TickerReference],
    observed_on: date,
) -> tuple[int, int]:
    """Insert TickerReference rows into instrument_reference.

    Returns (appended, unchanged) counts.
    Uses INSERT ... ON CONFLICT DO NOTHING (DAC-E4-S3-7).
    """
    appended = 0
    unchanged = 0
    for record in records:
        payload = record.value_payload()
        h = value_hash(payload)
        cur.execute(
            "INSERT INTO instrument_reference "
            "(instrument_id, observed_on, value_hash, "
            "company_name, cik, composite_figi, share_class_figi, "
            "is_active, list_date, delisted_utc, payload) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
            "ON CONFLICT DO NOTHING",
            (
                instrument_id,
                observed_on,
                h,
                record.company_name,
                record.cik,
                record.composite_figi,
                record.share_class_figi,
                record.is_active,
                record.list_date,
                record.delisted_utc,
                Jsonb(payload),
            ),
        )
        if cur.rowcount == 1:
            appended += 1
        else:
            unchanged += 1
    return appended, unchanged


def _insert_daily_bars(
    cur: psycopg.Cursor[Any],
    instrument_id: int,
    records: list[DailyBar],
    observed_on: date,
) -> tuple[int, int]:
    """Insert DailyBar rows into daily_bar.

    Returns (appended, unchanged) counts.
    Uses INSERT ... ON CONFLICT DO NOTHING (DAC-E4-S3-7).
    daily_bar has no payload column; columns are stored individually.
    """
    appended = 0
    unchanged = 0
    for record in records:
        payload = record.value_payload()
        h = value_hash(payload)
        cur.execute(
            "INSERT INTO daily_bar "
            "(instrument_id, session_date, observed_on, value_hash, "
            "open_price, high_price, low_price, close_price, volume) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) "
            "ON CONFLICT DO NOTHING",
            (
                instrument_id,
                record.session_date,
                observed_on,
                h,
                record.open_price,
                record.high_price,
                record.low_price,
                record.close_price,
                record.volume,
            ),
        )
        if cur.rowcount == 1:
            appended += 1
        else:
            unchanged += 1
    return appended, unchanged


def _derive_fiscal_period(stmt: FinancialStatement) -> str:
    """Derive the NOT NULL fiscal_period value from FinancialStatement inputs.

    Owner decision 2026-09-20: E4-S3's writer owns this derivation from
    existing FinancialStatement.timeframe and fiscal_quarter inputs.
    E3-S2 must not add a fiscal_period model field.

    Returns 'FY' for annual, 'Q{fiscal_quarter}' for quarterly.
    """
    if stmt.timeframe == "annual":
        return "FY"
    # timeframe == "quarterly"
    assert stmt.fiscal_quarter is not None, (
        f"fiscal_quarter must be set for quarterly FinancialStatement, got None "
        f"(fiscal_period_end={stmt.fiscal_period_end})"
    )
    return f"Q{stmt.fiscal_quarter}"


def _insert_fundamentals(
    cur: psycopg.Cursor[Any],
    instrument_id: int,
    records: list[FinancialStatement],
    observed_on: date,
) -> tuple[int, int]:
    """Insert FinancialStatement rows into fundamental_observation.

    Returns (appended, unchanged) counts.
    Derives fiscal_period from timeframe and fiscal_quarter (never from a
    FinancialStatement.fiscal_period field, which does not exist).
    Uses INSERT ... ON CONFLICT DO NOTHING (DAC-E4-S3-7).
    """
    appended = 0
    unchanged = 0
    for record in records:
        payload = record.value_payload()
        h = value_hash(payload)
        fiscal_period = _derive_fiscal_period(record)
        cur.execute(
            "INSERT INTO fundamental_observation "
            "(instrument_id, fiscal_period_end, fiscal_period, statement_type, "
            "observed_on, value_hash, provider_filing_date, payload) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) "
            "ON CONFLICT DO NOTHING",
            (
                instrument_id,
                record.fiscal_period_end,
                fiscal_period,
                record.statement_type,
                observed_on,
                h,
                record.provider_filing_date,
                Jsonb(payload),
            ),
        )
        if cur.rowcount == 1:
            appended += 1
        else:
            unchanged += 1
    return appended, unchanged


def _insert_corporate_actions(
    cur: psycopg.Cursor[Any],
    instrument_id: int,
    records: list[CorporateAction],
    observed_on: date,
) -> tuple[int, int]:
    """Insert CorporateAction rows into corporate_action.

    Returns (appended, unchanged) counts.
    Uses INSERT ... ON CONFLICT DO NOTHING (DAC-E4-S3-7).
    """
    appended = 0
    unchanged = 0
    for record in records:
        payload = record.value_payload()
        h = value_hash(payload)
        cur.execute(
            "INSERT INTO corporate_action "
            "(instrument_id, action_type, effective_on, observed_on, value_hash, payload) "
            "VALUES (%s, %s, %s, %s, %s, %s) "
            "ON CONFLICT DO NOTHING",
            (
                instrument_id,
                record.action_type,
                record.effective_on,
                observed_on,
                h,
                Jsonb(payload),
            ),
        )
        if cur.rowcount == 1:
            appended += 1
        else:
            unchanged += 1
    return appended, unchanged


# ---------------------------------------------------------------------------
# Coverage helpers
# ---------------------------------------------------------------------------


def _replace_coverage(
    cur: psycopg.Cursor[Any],
    instrument_id: int,
    data_type: str,
    written_range: tuple[date, date],
) -> tuple[date, date]:
    """Read existing coverage, merge the written range, replace in DB.

    Deletes all existing coverage_segment rows for this instrument/data_type,
    then reinserts the merged minimal set.  Called inside the instrument
    transaction, so the delete and reinsert are atomic with the observations.

    Returns the merged coverage range for the given data type (from the
    merged set that covers the written range).
    """
    cur.execute(
        "SELECT covered_from, covered_to FROM coverage_segment "
        "WHERE instrument_id = %s AND data_type = %s",
        (instrument_id, data_type),
    )
    existing = [(row[0], row[1]) for row in cur.fetchall()]

    merged = merge_ranges(existing, written_range)

    # Delete and reinsert -- coverage_segment is not append-only (only the four
    # observation tables are prohibited from mutation)
    cur.execute(
        "DELETE FROM coverage_segment WHERE instrument_id = %s AND data_type = %s",
        (instrument_id, data_type),
    )
    for seg_from, seg_to in merged:
        cur.execute(
            "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
            "VALUES (%s, %s, %s, %s)",
            (instrument_id, data_type, seg_from, seg_to),
        )

    # Identify which merged segment now covers the written range
    for seg_from, seg_to in merged:
        if seg_from <= written_range[0] and written_range[1] <= seg_to:
            return (seg_from, seg_to)

    # Fallback: return the written range itself (should not happen with correct merge)
    return written_range


# ---------------------------------------------------------------------------
# Main transaction function
# ---------------------------------------------------------------------------


def write_instrument(
    connection: psycopg.Connection[Any],
    instrument_id: int,
    run_id: uuid.UUID,
    observations: ParsedObservations,
    observed_on: date,
) -> WriteResult:
    """Commit all four data types for one instrument atomically.

    Write sequence (DAC-E4-4, DAC-E4-5):
    1. Append all observations (INSERT ... ON CONFLICT DO NOTHING)
    2. Read and merge coverage per data type; delete old rows, reinsert merged
    3. Upsert acquisition_state (DAC-E4-S3-5)
    4. Insert run_instrument_result per data type (DAC-E4-S3-6)

    All steps execute inside the caller-provided connection; the caller owns the
    transaction boundary (``connection.transaction()``).  Any failure propagates
    and causes a rollback.

    The outcome recorded in ``acquisition_state`` is always ``written`` for a
    successful call (meaning "successfully acquired").  The outcome in
    ``run_instrument_result`` is ``written`` when rows were appended, or
    ``unchanged`` when every returned row already existed (DAC-E4-S3-1).

    Provider failures, not_found, cancellation, or acquisition-run counters
    are not managed here; they belong to CAP-001-E4-S6.

    Args:
        connection: An open psycopg connection.  The caller must commit.
        instrument_id: The instrument to write for.
        run_id: The acquisition run this write belongs to.
        observations: The four typed collections and their actual returned ranges.
        observed_on: FactorFlow's observation date (not a provider filing date).

    Returns:
        A ``WriteResult`` with per-type appended, unchanged, and covered-range
        values after the atomic commit.

    Raises:
        Any psycopg or hashing exception -- the caller's transaction rolls back.
    """
    with connection.cursor() as cur:
        # Step 1: Append observations
        ref_appended, ref_unchanged = _insert_references(
            cur, instrument_id, observations.reference, observed_on
        )
        prices_appended, prices_unchanged = _insert_daily_bars(
            cur, instrument_id, observations.prices, observed_on
        )
        fund_appended, fund_unchanged = _insert_fundamentals(
            cur, instrument_id, observations.fundamentals, observed_on
        )
        ca_appended, ca_unchanged = _insert_corporate_actions(
            cur, instrument_id, observations.corporate_actions, observed_on
        )

        # Step 2: Merge and replace coverage for each data type
        ref_covered = _replace_coverage(
            cur, instrument_id, "reference", observations.reference_range
        )
        prices_covered = _replace_coverage(cur, instrument_id, "prices", observations.prices_range)
        fund_covered = _replace_coverage(
            cur, instrument_id, "fundamentals", observations.fundamentals_range
        )
        ca_covered = _replace_coverage(
            cur, instrument_id, "corporate_actions", observations.corporate_actions_range
        )

        # Step 3: Upsert acquisition_state for each data type (DAC-E4-S3-5)
        for data_type in ("reference", "prices", "fundamentals", "corporate_actions"):
            cur.execute(
                "INSERT INTO acquisition_state "
                "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
                "VALUES (%s, %s, now(), %s, 'written') "
                "ON CONFLICT (instrument_id, data_type) DO UPDATE "
                "SET last_acquired_at = EXCLUDED.last_acquired_at, "
                "    last_run_id = EXCLUDED.last_run_id, "
                "    last_outcome = EXCLUDED.last_outcome",
                (instrument_id, data_type, run_id),
            )

        # Step 4: Insert run_instrument_result per data type (DAC-E4-S3-6)
        # outcome is 'written' if any rows were appended, 'unchanged' if all existed
        type_counts: list[tuple[str, int, int]] = [
            ("reference", ref_appended, ref_unchanged),
            ("prices", prices_appended, prices_unchanged),
            ("fundamentals", fund_appended, fund_unchanged),
            ("corporate_actions", ca_appended, ca_unchanged),
        ]
        for data_type, appended, _unchanged in type_counts:
            outcome = "written" if appended > 0 else "unchanged"
            cur.execute(
                "INSERT INTO run_instrument_result "
                "(run_id, instrument_id, data_type, outcome) "
                "VALUES (%s, %s, %s, %s)",
                (run_id, instrument_id, data_type, outcome),
            )

    return WriteResult(
        reference_appended=ref_appended,
        reference_unchanged=ref_unchanged,
        reference_covered_range=ref_covered,
        prices_appended=prices_appended,
        prices_unchanged=prices_unchanged,
        prices_covered_range=prices_covered,
        fundamentals_appended=fund_appended,
        fundamentals_unchanged=fund_unchanged,
        fundamentals_covered_range=fund_covered,
        corporate_actions_appended=ca_appended,
        corporate_actions_unchanged=ca_unchanged,
        corporate_actions_covered_range=ca_covered,
    )


def write_instrument_with_outcomes(
    connection: psycopg.Connection[Any],
    instrument_id: int,
    run_id: uuid.UUID,
    observations: ParsedObservations,
    observed_on: date,
    error_outcomes: dict[str, Any] | None = None,
) -> WriteResult:
    """Commit observations for one instrument and persist typed outcome records.

    Extends ``write_instrument`` to accept pre-classified error outcomes for
    data types that failed at the provider layer (``not_found`` or ``failed``).
    The ``error_outcomes`` dict maps data-type name to ``InstrumentOutcomeRecord``
    instances from ``outcomes.classify_provider_error``.

    For data types present in ``error_outcomes``:
    - No observation rows are inserted (observations must be empty lists for
      those types, which is enforced by the caller).
    - No coverage segment is written.
    - ``acquisition_state`` is upserted with the error outcome.
    - ``run_instrument_result`` is inserted with the error outcome and reason.

    For data types absent from ``error_outcomes``:
    - Normal write_instrument logic applies (written / unchanged).

    The caller owns the transaction boundary (``connection.transaction()``).
    All steps execute inside the caller-provided connection.

    Args:
        connection: An open psycopg connection.  The caller must commit.
        instrument_id: The instrument to write for.
        run_id: The acquisition run this write belongs to.
        observations: The typed collections and ranges; empty lists for data
            types with error outcomes.
        observed_on: FactorFlow's observation date.
        error_outcomes: Optional mapping of data-type → InstrumentOutcomeRecord
            for data types that could not be fetched.  ``None`` means no errors.

    Returns:
        A ``WriteResult`` with per-type appended, unchanged, and covered-range
        values for data types that were successfully written.

    Raises:
        Any psycopg or hashing exception -- the caller's transaction rolls back.
    """
    _error_outcomes = error_outcomes or {}

    with connection.cursor() as cur:
        # Step 1: Append observations for successfully fetched data types only
        ref_appended, ref_unchanged = _insert_references(
            cur, instrument_id, observations.reference, observed_on
        )
        prices_appended, prices_unchanged = _insert_daily_bars(
            cur, instrument_id, observations.prices, observed_on
        )
        fund_appended, fund_unchanged = _insert_fundamentals(
            cur, instrument_id, observations.fundamentals, observed_on
        )
        ca_appended, ca_unchanged = _insert_corporate_actions(
            cur, instrument_id, observations.corporate_actions, observed_on
        )

        # Step 2: Coverage — only for data types without errors
        ref_covered: tuple[date, date] = observations.reference_range
        prices_covered: tuple[date, date] = observations.prices_range
        fund_covered: tuple[date, date] = observations.fundamentals_range
        ca_covered: tuple[date, date] = observations.corporate_actions_range

        if "reference" not in _error_outcomes:
            ref_covered = _replace_coverage(
                cur, instrument_id, "reference", observations.reference_range
            )
        if "prices" not in _error_outcomes:
            prices_covered = _replace_coverage(
                cur, instrument_id, "prices", observations.prices_range
            )
        if "fundamentals" not in _error_outcomes:
            fund_covered = _replace_coverage(
                cur, instrument_id, "fundamentals", observations.fundamentals_range
            )
        if "corporate_actions" not in _error_outcomes:
            ca_covered = _replace_coverage(
                cur, instrument_id, "corporate_actions", observations.corporate_actions_range
            )

        # Step 3: Upsert acquisition_state for all reached data types
        counts: dict[str, tuple[int, int]] = {
            "reference": (ref_appended, ref_unchanged),
            "prices": (prices_appended, prices_unchanged),
            "fundamentals": (fund_appended, fund_unchanged),
            "corporate_actions": (ca_appended, ca_unchanged),
        }
        for data_type in ("reference", "prices", "fundamentals", "corporate_actions"):
            if data_type in _error_outcomes:
                error_outcome = _error_outcomes[data_type].outcome
                cur.execute(
                    "INSERT INTO acquisition_state "
                    "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
                    "VALUES (%s, %s, now(), %s, %s) "
                    "ON CONFLICT (instrument_id, data_type) DO UPDATE "
                    "SET last_acquired_at = EXCLUDED.last_acquired_at, "
                    "    last_run_id = EXCLUDED.last_run_id, "
                    "    last_outcome = EXCLUDED.last_outcome",
                    (instrument_id, data_type, run_id, error_outcome),
                )
            else:
                cur.execute(
                    "INSERT INTO acquisition_state "
                    "(instrument_id, data_type, last_acquired_at, last_run_id, last_outcome) "
                    "VALUES (%s, %s, now(), %s, 'written') "
                    "ON CONFLICT (instrument_id, data_type) DO UPDATE "
                    "SET last_acquired_at = EXCLUDED.last_acquired_at, "
                    "    last_run_id = EXCLUDED.last_run_id, "
                    "    last_outcome = EXCLUDED.last_outcome",
                    (instrument_id, data_type, run_id),
                )

        # Step 4: Insert run_instrument_result for all reached data types
        for data_type in ("reference", "prices", "fundamentals", "corporate_actions"):
            if data_type in _error_outcomes:
                rec = _error_outcomes[data_type]
                cur.execute(
                    "INSERT INTO run_instrument_result "
                    "(run_id, instrument_id, data_type, outcome, reason) "
                    "VALUES (%s, %s, %s, %s, %s)",
                    (run_id, instrument_id, data_type, rec.outcome, rec.reason),
                )
            else:
                appended, _ = counts[data_type]
                outcome = "written" if appended > 0 else "unchanged"
                cur.execute(
                    "INSERT INTO run_instrument_result "
                    "(run_id, instrument_id, data_type, outcome) "
                    "VALUES (%s, %s, %s, %s)",
                    (run_id, instrument_id, data_type, outcome),
                )

    return WriteResult(
        reference_appended=ref_appended,
        reference_unchanged=ref_unchanged,
        reference_covered_range=ref_covered,
        prices_appended=prices_appended,
        prices_unchanged=prices_unchanged,
        prices_covered_range=prices_covered,
        fundamentals_appended=fund_appended,
        fundamentals_unchanged=fund_unchanged,
        fundamentals_covered_range=fund_covered,
        corporate_actions_appended=ca_appended,
        corporate_actions_unchanged=ca_unchanged,
        corporate_actions_covered_range=ca_covered,
    )
