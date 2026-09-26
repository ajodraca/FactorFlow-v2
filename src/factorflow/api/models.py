"""Pydantic response models for the ingestion API.

Component design: `component-design-ingestion-api.md` sections 2.1, 11.
`HealthResponse` is CAP-001-E1-S6's contribution; the instrument and
settings models below are CAP-001-E2-S3's. The run models below are
CAP-001-E5-S5's, covering `POST/GET /api/acquisition-runs` and the
cancel endpoint.
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, field_validator

from factorflow.api.bounds import (
    MAX_HISTORY_DEPTH_YEARS,
    MAX_SYMBOLS_PER_REQUEST,
    MIN_HISTORY_DEPTH_YEARS,
)


class HealthResponse(BaseModel):
    """`GET /api/health`'s response body (component design section 11).

    `credential_present` is a boolean only, never the credential value
    (AC-13, DAC-E1-9): no field here is capable of carrying the secret
    itself.

    `most_recent_run`'s real shape belongs to CAP-001-E7-S3 (component
    design section 11, story notes); this story hardcodes the field to
    `None`. IR-006: an earlier version typed it `RunSummary | None` with
    `RunSummary = Any`, which collapses to `Any` -- `mypy --strict` would
    not flag a future assignment of a wrong shape, defeating the point of
    naming it at all. Typing it `None` exactly expresses the current
    contract precisely and forces CAP-001-E7-S3 to widen the type as a
    deliberate, reviewable change rather than one silently already
    permitted.
    """

    status: Literal["ok"]
    database: Literal["reachable", "unreachable"]
    credential_present: bool
    schema_version: int | None
    most_recent_run: None = None


class AddInstrumentsRequest(BaseModel):
    """`POST /api/instruments`'s request body (component design section 11).

    Capped at `MAX_SYMBOLS_PER_REQUEST` here, at the model layer, so an
    over-sized batch is rejected with `422` before the route ever calls
    `add_symbols` (DAC-E2-S3-4's sibling rule for request size).
    """

    symbols: list[str]

    @field_validator("symbols")
    @classmethod
    def _bounded_batch(cls, symbols: list[str]) -> list[str]:
        if len(symbols) > MAX_SYMBOLS_PER_REQUEST:
            raise ValueError(
                f"a request may add at most {MAX_SYMBOLS_PER_REQUEST} symbols, got {len(symbols)}"
            )
        return symbols


class SymbolOutcomeResponse(BaseModel):
    """One symbol's classification in a `POST /api/instruments` response."""

    input_symbol: str
    normalised_symbol: str | None
    disposition: str
    reason: str | None = None


class AddInstrumentsResponse(BaseModel):
    """`POST /api/instruments`'s `201` response body.

    `added`, `reactivated` and `rejected` are reported separately
    (DAC-E2-S3-1) so a mixed batch's outcome is legible without the caller
    re-deriving it from a flat list.
    """

    added: list[SymbolOutcomeResponse]
    reactivated: list[SymbolOutcomeResponse]
    rejected: list[SymbolOutcomeResponse]


class RetireInstrumentResponse(BaseModel):
    """`DELETE /api/instruments/{symbol}`'s `200` response body."""

    lifecycle: Literal["retired"]
    retired_at: datetime


class InstrumentResponse(BaseModel):
    """One instrument row in a `GET /api/instruments` page."""

    instrument_id: int
    symbol: str
    lifecycle: str


class InstrumentListResponse(BaseModel):
    """`GET /api/instruments`'s `200` response body (DAC-E2-10)."""

    instruments: list[InstrumentResponse]
    active_count: int
    retired_count: int
    next_cursor: str | None


class HistoryDepthResponse(BaseModel):
    """`GET /api/settings/history-depth`'s `200` response body.

    `years` is `null`, not omitted, when the owner has never stated a depth
    (DAC-E2-S3-2) -- the field is always present so a caller need not treat
    a missing key and an explicit `null` as two different things.
    """

    years: int | None
    updated_at: datetime | None


class SetHistoryDepthRequest(BaseModel):
    """`PUT /api/settings/history-depth`'s request body.

    Bounded to `MIN_HISTORY_DEPTH_YEARS..MAX_HISTORY_DEPTH_YEARS` at the
    model layer (DAC-E2-8), before `write_history_depth` -- which enforces
    no upper bound of its own -- is ever called.
    """

    years: int

    @field_validator("years")
    @classmethod
    def _bounded_depth(cls, years: int) -> int:
        if isinstance(years, bool) or not (
            MIN_HISTORY_DEPTH_YEARS <= years <= MAX_HISTORY_DEPTH_YEARS
        ):
            raise ValueError(
                f"history depth must be an integer between {MIN_HISTORY_DEPTH_YEARS} "
                f"and {MAX_HISTORY_DEPTH_YEARS}, got {years!r}"
            )
        return years


# ---------------------------------------------------------------------------
# Run models — CAP-001-E5-S5
# Owner-confirmed top-level keys: run, runs, counts, results, next_cursor
# Owner-confirmed result fields: instrument_id, data_type, outcome, reason,
#   attempts, completed_at (design section 11, open-gap resolution 2026-09-17)
# ---------------------------------------------------------------------------

RunState = Literal[
    "requested",
    "running",
    "cancelling",
    "succeeded",
    "partial",
    "failed",
    "cancelled",
    "abandoned",
]

ResultOutcome = Literal[
    "written",
    "unchanged",
    "not_found",
    "failed",
    "skipped",
]


class RunStartResponse(BaseModel):
    """202 body for `POST /api/acquisition-runs` (DAC-E5-15).

    `queued_behind` is null when the run queued behind nothing; it carries
    the active run's id when a run is already in progress (AC-23).
    """

    run_id: UUID
    state: Literal["requested"]
    queued_behind: UUID | None


class CancelRunResponse(BaseModel):
    """202 body for `POST /api/acquisition-runs/{id}/cancel` (AC-19, AC-26)."""

    state: Literal["cancelling", "cancelled"]


class RunSummary(BaseModel):
    """One run in the list response (owner-confirmed fields 2026-09-17)."""

    run_id: UUID
    state: RunState
    history_depth_years: int
    requested_at: datetime
    started_at: datetime | None = None
    ended_at: datetime | None = None
    instruments_named: int
    instruments_written: int
    instruments_failed: int
    failure_reason: str | None = None


class RunCounts(BaseModel):
    """Persisted aggregate counts for a run detail response."""

    instruments_named: int
    instruments_written: int
    instruments_failed: int


class ResultRow(BaseModel):
    """One per-instrument per-data-type result (owner-confirmed 2026-09-17)."""

    instrument_id: int
    data_type: Literal["reference", "prices", "fundamentals", "corporate_actions"]
    outcome: ResultOutcome
    reason: str | None = None
    attempts: int
    completed_at: datetime


class RunListResponse(BaseModel):
    """`GET /api/acquisition-runs` response (DAC-E5-S5-4).

    `next_cursor` is null on the last page.
    """

    runs: list[RunSummary]
    next_cursor: str | None


class RunDetailResponse(BaseModel):
    """`GET /api/acquisition-runs/{id}` response (DAC-E5-S5-5).

    `next_cursor` is null on the last instrument page.
    """

    run: RunSummary
    counts: RunCounts
    results: list[ResultRow]
    next_cursor: str | None = None
