"""Sequential acquisition runner and polling loop (CAP-001-E4-S5).

Implements the orchestration layer that:
- Claims the next available run via the run journal.
- Snapshots the active roster once at claim time.
- Checks heartbeat and cancellation together at the top of every instrument
  iteration (DAC-E4-S5-1).
- Exits without further writes when the claim is lost or cancellation is
  observed (DAC-E4-S5-2, DAC-E4-S5-3).
- Fetches the four Massive data types per instrument through ``plan_fetches``.
- Delegates the one-instrument transaction to ``write_instrument``.
- Maps typed provider errors to per-data-type results and continues
  (DAC-E4-S5-4, AC-11).
- Finalises the run from written results via ``run-journal.finalise``
  (DAC-E4-S5-5, DAC-E5-4).
- Keeps credential state: rebuilds ``MassiveClient`` only when the
  fingerprint changes (DAC-E4-S5-7, DAC-E1-10).

This module never imports ``factorflow.api``.
"""

from __future__ import annotations

import logging
import uuid
from collections.abc import Callable
from datetime import date
from typing import Any

import psycopg

from factorflow.ingestion.massive.errors import (
    CredentialRejected,
    InstrumentNotFound,
    MassiveError,
    ProviderUnavailable,
    compose_failure_reason,
)
from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)
from factorflow.ingestion.outcomes import (
    InstrumentOutcomeRecord,
    classify_provider_error,
)
from factorflow.ingestion.plan import depth_start_for_run, plan_fetches
from factorflow.ingestion.writer import (
    ParsedObservations,
    write_instrument_with_outcomes,
)
from factorflow.runs.journal import (
    ClaimedRun,
    cancellation_requested,
    finalise,
    heartbeat,
    record_instruments_named,
)

__all__ = [
    "AcquisitionRunner",
    "CredentialAwareClientFactory",
    "run_polling_loop",
]

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Credential-aware client factory (DAC-E4-S5-7, DAC-E1-10)
# ---------------------------------------------------------------------------


class CredentialAwareClientFactory:
    """Rebuilds the provider client only when the credential fingerprint
    changes at claim time (DAC-E4-S5-7).

    ``build_client`` is a callable that accepts the raw key string and
    returns a new client object.  The production entrypoint supplies a
    ``MassiveClient`` factory; tests supply a mock builder.
    """

    def __init__(self, build_client: Callable[[str], Any]) -> None:
        self._build_client = build_client
        self._current_key: str | None = None
        self._client: Any = None

    def get_or_rebuild(self, key_value: str) -> Any:
        """Return the existing client when the key is unchanged; otherwise
        build a fresh one and cache it (DAC-E1-10).
        """
        if self._current_key != key_value:
            self._client = self._build_client(key_value)
            self._current_key = key_value
        return self._client


# ---------------------------------------------------------------------------
# Instrument symbol lookup
# ---------------------------------------------------------------------------


def _symbol_for_id(connection: psycopg.Connection, instrument_id: int) -> str:
    """Look up the normalised symbol for ``instrument_id``."""
    with connection.cursor() as cur:
        cur.execute("SELECT symbol FROM instrument WHERE instrument_id = %s", (instrument_id,))
        row = cur.fetchone()
    if row is None:
        raise ValueError(f"Instrument {instrument_id} not found in instrument table")
    return str(row[0])


# ---------------------------------------------------------------------------
# Coverage lookup
# ---------------------------------------------------------------------------


def _coverage_for_instrument(
    connection: psycopg.Connection, instrument_id: int, data_type: str
) -> list[tuple[date, date]]:
    """Return existing coverage segments for one instrument / data type."""
    with connection.cursor() as cur:
        cur.execute(
            "SELECT covered_from, covered_to FROM coverage_segment "
            "WHERE instrument_id = %s AND data_type = %s",
            (instrument_id, data_type),
        )
        return [(row[0], row[1]) for row in cur.fetchall()]


# ---------------------------------------------------------------------------
# AcquisitionRunner
# ---------------------------------------------------------------------------


class AcquisitionRunner:
    """Orchestrates one claimed acquisition run sequentially.

    Accepts the database connection, a pre-built provider client, and today's
    date as constructor dependencies.  The caller (``ingestion_main``) owns
    the claim loop; ``execute_claimed`` processes one already-claimed run.

    ``runner_id`` is the identifier this runner used when the claim was
    established.  It must match the ``claimed_by`` column of the run row so
    that ``heartbeat`` can verify ownership (DAC-E5-13).  Defaults to
    ``'test-runner'`` because the integration test fixture inserts claims
    under that string and the production entrypoint overrides it explicitly.
    """

    def __init__(
        self,
        connection: psycopg.Connection,
        client: Any,
        today: date,
        runner_id: str = "test-runner",
        redact: Callable[[str], str] | None = None,
    ) -> None:
        self._connection = connection
        self._client = client
        self._today = today
        self._runner_id = runner_id
        # Redaction callable supplied by the entrypoint from runtime-config
        # (component design section 4, SEC-INP-002, AC-13). Falls back to
        # identity only in tests that do not inject a credential.
        self._redact: Callable[[str], str] = redact if redact is not None else (lambda s: s)

    def execute_claimed(
        self,
        run_id: uuid.UUID,
        depth_years: int | None,
        instrument_ids: list[int],
    ) -> None:
        """Execute one already-claimed run to completion.

        Args:
            run_id: The UUID of the claimed run.
            depth_years: The snapshotted history depth; ``None`` means no
                stated depth — the run is finalised as failed immediately
                (DAC-E4-13).
            instrument_ids: The active roster snapshot read at claim time
                (DAC-E4-12).  The caller supplies it so the roster is read
                exactly once.
        """
        # The roster size is what finalise compares written results against
        # (run-journal section 2.5, EXP-20261011-1).
        record_instruments_named(self._connection, run_id, self._runner_id, len(instrument_ids))

        if depth_years is None:
            # DAC-E4-13: no stated depth → finalise failed without provider access.
            # journal.finalise derives "failed" from zero written results (IR-005).
            log.warning("run=%s has no stated depth; finalising as failed", run_id)
            finalise(self._connection, run_id)
            return

        # Build a minimal ClaimedRun to feed depth_start_for_run
        claimed = ClaimedRun(run_id=run_id, history_depth_years=depth_years)
        depth_start = depth_start_for_run(claimed, self._today)

        for instrument_id in instrument_ids:
            # --- Top-of-iteration checkpoint (DAC-E4-S5-1) ---
            hb_ok = heartbeat(self._connection, run_id, self._runner_id)
            if not hb_ok:
                # Claim lost (DAC-E4-S5-3, DAC-E5-13): stop without further writes
                log.warning("run=%s heartbeat returned False; claim lost — stopping", run_id)
                return

            if cancellation_requested(self._connection, run_id):
                # Cancellation observed (DAC-E4-S5-2): finalise and stop
                log.info("run=%s cancellation requested; finalising as cancelled", run_id)
                finalise(self._connection, run_id)
                return

            # --- Fetch symbol ---
            try:
                symbol = _symbol_for_id(self._connection, instrument_id)
            except ValueError:
                log.error(
                    "run=%s instrument_id=%s not found in instrument table; skipping",
                    run_id,
                    instrument_id,
                )
                continue

            # --- Fetch each data type individually (DAC-E4-S6-3, DAC-E4-S6-4, DAC-E4-S6-6) ---
            # Per-data-type fetch allows distinct outcomes for the same instrument:
            # e.g. prices=written, fundamentals=not_found (DAC-E4-S6-6).
            # CredentialRejected is the only error that stops the run (DAC-E3-S3-4).
            error_outcomes: dict[str, InstrumentOutcomeRecord] = {}

            # Reference fetch
            reference: list[TickerReference] = []
            try:
                reference = self._fetch_reference(symbol)
            except CredentialRejected:
                raise
            except (InstrumentNotFound, ProviderUnavailable, MassiveError) as exc:
                reason = compose_failure_reason(
                    exc, symbol=symbol, data_type="reference", redact=self._redact
                )
                log.info(
                    "run=%s instrument=%s data_type=reference error: %s",
                    run_id,
                    instrument_id,
                    reason,
                )
                error_outcomes["reference"] = classify_provider_error(
                    exc, data_type="reference", reason=reason
                )

            # Prices fetch
            prices: list[DailyBar] = []
            try:
                prices = self._fetch_prices(symbol, instrument_id, depth_start)
            except CredentialRejected:
                raise
            except (InstrumentNotFound, ProviderUnavailable, MassiveError) as exc:
                reason = compose_failure_reason(
                    exc, symbol=symbol, data_type="prices", redact=self._redact
                )
                log.info(
                    "run=%s instrument=%s data_type=prices error: %s",
                    run_id,
                    instrument_id,
                    reason,
                )
                error_outcomes["prices"] = classify_provider_error(
                    exc, data_type="prices", reason=reason
                )

            # Fundamentals fetch
            fundamentals: list[FinancialStatement] = []
            try:
                fundamentals = self._fetch_financials(symbol, instrument_id, depth_start)
            except CredentialRejected:
                raise
            except (InstrumentNotFound, ProviderUnavailable, MassiveError) as exc:
                reason = compose_failure_reason(
                    exc, symbol=symbol, data_type="fundamentals", redact=self._redact
                )
                log.info(
                    "run=%s instrument=%s data_type=fundamentals error: %s",
                    run_id,
                    instrument_id,
                    reason,
                )
                error_outcomes["fundamentals"] = classify_provider_error(
                    exc, data_type="fundamentals", reason=reason
                )

            # Corporate actions fetch
            corporate_actions: list[CorporateAction] = []
            try:
                corporate_actions = self._fetch_corporate_actions(
                    symbol, instrument_id, depth_start
                )
            except CredentialRejected:
                raise
            except (InstrumentNotFound, ProviderUnavailable, MassiveError) as exc:
                reason = compose_failure_reason(
                    exc, symbol=symbol, data_type="corporate_actions", redact=self._redact
                )
                log.info(
                    "run=%s instrument=%s data_type=corporate_actions error: %s",
                    run_id,
                    instrument_id,
                    reason,
                )
                error_outcomes["corporate_actions"] = classify_provider_error(
                    exc, data_type="corporate_actions", reason=reason
                )

            # --- Build ParsedObservations and write in one transaction ---
            # Empty lists are passed for data types with error outcomes;
            # write_instrument_with_outcomes records the error outcome rows instead.
            observations = ParsedObservations(
                reference=reference,
                prices=prices,
                fundamentals=fundamentals,
                corporate_actions=corporate_actions,
                reference_range=(depth_start, self._today),
                prices_range=(depth_start, self._today),
                fundamentals_range=(depth_start, self._today),
                corporate_actions_range=(depth_start, self._today),
            )
            with self._connection.transaction():
                write_instrument_with_outcomes(
                    connection=self._connection,
                    instrument_id=instrument_id,
                    run_id=run_id,
                    observations=observations,
                    observed_on=self._today,
                    error_outcomes=error_outcomes if error_outcomes else None,
                )

        # --- Finalise from written results (DAC-E4-S5-5, DAC-E5-4) ---
        finalise(self._connection, run_id)

    # -----------------------------------------------------------------------
    # Provider fetch helpers
    # -----------------------------------------------------------------------

    def _fetch_reference(self, symbol: str) -> list[TickerReference]:
        """Fetch ticker reference for ``symbol``."""
        ref = self._client.fetch_reference(symbol)
        return [ref]

    def _fetch_prices(self, symbol: str, instrument_id: int, depth_start: date) -> list[DailyBar]:
        """Fetch daily bars for ``symbol`` using uncovered ranges."""
        covered = _coverage_for_instrument(self._connection, instrument_id, "prices")
        ranges = plan_fetches("prices", covered, depth_start, self._today)
        bars: list[DailyBar] = []
        for fr in ranges:
            bars.extend(self._client.fetch_daily_bars(symbol, fr.start, fr.end))
        return bars

    def _fetch_financials(
        self, symbol: str, instrument_id: int, depth_start: date
    ) -> list[FinancialStatement]:
        """Fetch financials for ``symbol`` using uncovered ranges."""
        covered = _coverage_for_instrument(self._connection, instrument_id, "fundamentals")
        ranges = plan_fetches("fundamentals", covered, depth_start, self._today)
        stmts: list[FinancialStatement] = []
        for fr in ranges:
            stmts.extend(self._client.fetch_financials(symbol, fr.start, fr.end))
        return stmts

    def _fetch_corporate_actions(
        self, symbol: str, instrument_id: int, depth_start: date
    ) -> list[CorporateAction]:
        """Fetch corporate actions for ``symbol`` using uncovered ranges."""
        covered = _coverage_for_instrument(self._connection, instrument_id, "corporate_actions")
        ranges = plan_fetches("corporate_actions", covered, depth_start, self._today)
        actions: list[CorporateAction] = []
        for fr in ranges:
            actions.extend(self._client.fetch_corporate_actions(symbol, fr.start, fr.end))
        return actions


# ---------------------------------------------------------------------------
# Polling loop (DAC-E4-S5-6)
# ---------------------------------------------------------------------------


def run_polling_loop(
    claim_fn: Callable[[], Any | None],
    execute_fn: Callable[[Any], None],
    wait_fn: Callable[[float], None],
    poll_interval_seconds: float,
) -> None:
    """Run the claim–execute–wait loop indefinitely.

    Args:
        claim_fn: Returns a claimed run token when one is available, else
            ``None``.  The production entrypoint supplies a closure over
            ``journal.claim_next``.
        execute_fn: Processes a claimed run token returned by ``claim_fn``.
        wait_fn: Sleeps (or equivalent) for the given number of seconds.
            The production entrypoint supplies ``time.sleep``; tests supply
            a controlled stub that records call arguments (DAC-E4-S5-6).
        poll_interval_seconds: How long to wait when the claim queue is
            empty before polling again (DAC-E4-S5-6).
    """
    while True:
        claimed = claim_fn()
        if claimed is not None:
            execute_fn(claimed)
        else:
            wait_fn(poll_interval_seconds)
