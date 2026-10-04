"""`POST/GET /api/acquisition-runs` and `POST /api/acquisition-runs/{id}/cancel`.

Component design: `component-design-ingestion-api.md` sections 2.4, 11;
task plan T009.

The four routes:
- `POST /api/acquisition-runs` — check preconditions (depth-first), record a
  requested run, return 202 immediately; never waits for a provider.
- `GET /api/acquisition-runs` — list runs newest-first with state filter and
  keyset cursor (DAC-E5-S5-4).
- `GET /api/acquisition-runs/{run_id}` — run detail with persisted counts and
  paged per-instrument results (DAC-E5-S5-5).
- `POST /api/acquisition-runs/{run_id}/cancel` — cooperative cancellation;
  maps domain outcomes to 202/404/409.

Auth: none, loopback only (approved design). No credential field, no provider
import, no synchronous provider call.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse

from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from factorflow.api.errors import error_response
from factorflow.api.models import (
    CancelRunResponse,
    OutcomeCounts,
    ResultOutcome,
    ResultRow,
    RunCounts,
    RunDetailResponse,
    RunListResponse,
    RunStartResponse,
    RunState,
    RunSummary,
)
from factorflow.instruments.service import active_instrument_ids
from factorflow.instruments.settings import read_history_depth
from factorflow.runs.journal import RunAlreadyTerminal, request_cancel, request_run
from factorflow.runs.queries import (
    CursorError,
    DetailFilters,
    ListFilters,
    RunNotFound,
    get_run_detail,
    list_runs,
)

router = APIRouter()

_RESOURCE = "acquisition-run"
_STATE_QUERY = Query(default=None)
_OUTCOME_QUERY = Query(default=None)


def _request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "unknown")


# ---------------------------------------------------------------------------
# POST /api/acquisition-runs
# ---------------------------------------------------------------------------


@router.post("/api/acquisition-runs", response_model=None)
def start_run(request: Request) -> JSONResponse:
    """`POST /api/acquisition-runs` (DAC-E5-15, AC-23, AC-24, DAC-E5-14).

    Two preconditions are checked depth-first before any row is written:
    1. History depth must be set.
    2. At least one active instrument must exist.

    When both are absent, `history_depth_not_set` is returned
    deterministically (DAC-E5-S5-1, owner-confirmed 2026-09-11).
    """
    req_id = _request_id(request)
    pool = request.app.state.db_pool
    with pool.connection() as conn:
        depth = read_history_depth(conn)
        if depth is None:
            return error_response(
                status_code=409,
                code="history_depth_not_set",
                message="No history depth has been set. Configure it in Settings before running.",
                request_id=req_id,
                resource=_RESOURCE,
            )
        active_ids = active_instrument_ids(conn)
        if not active_ids:
            return error_response(
                status_code=409,
                code="no_active_instruments",
                message="No active instruments exist. Add at least one instrument before running.",
                request_id=req_id,
                resource=_RESOURCE,
            )
        run_id, queued_behind = request_run(conn, depth.years)

    body = RunStartResponse(run_id=run_id, state="requested", queued_behind=queued_behind)
    return JSONResponse(status_code=202, content=body.model_dump(mode="json"))


# ---------------------------------------------------------------------------
# GET /api/acquisition-runs
# ---------------------------------------------------------------------------


@router.get("/api/acquisition-runs", response_model=None)
def list_runs_route(
    request: Request,
    state: RunState | None = _STATE_QUERY,
    limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE),
    cursor: str | None = Query(default=None),
) -> JSONResponse:
    """`GET /api/acquisition-runs` (DAC-E5-S5-4).

    Runs are returned newest-first; `state` filters to a single state value.
    `cursor` from the previous page continues from the keyset position;
    a malformed or unsupported-version cursor returns 422.
    """
    req_id = _request_id(request)
    try:
        filters = ListFilters(limit=limit, state=state, cursor=cursor)
    except CursorError:
        return error_response(
            status_code=422,
            code="validation_error",
            message="The cursor is malformed or uses an unsupported version.",
            request_id=req_id,
            resource=_RESOURCE,
        )

    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            page = list_runs(conn, filters)
    except CursorError:
        return error_response(
            status_code=422,
            code="validation_error",
            message="The cursor is malformed or uses an unsupported version.",
            request_id=req_id,
            resource=_RESOURCE,
        )

    summaries = [
        RunSummary(
            run_id=r.run_id,
            state=r.state,  # type: ignore[arg-type]
            history_depth_years=r.history_depth_years,
            requested_at=r.requested_at,
            started_at=r.started_at,
            ended_at=r.ended_at,
            instruments_named=r.instruments_named,
            instruments_written=r.instruments_written,
            instruments_failed=r.instruments_failed,
            failure_reason=r.failure_reason,
        )
        for r in page.rows
    ]
    body = RunListResponse(runs=summaries, next_cursor=page.next_cursor)
    return JSONResponse(status_code=200, content=body.model_dump(mode="json"))


# ---------------------------------------------------------------------------
# GET /api/acquisition-runs/{run_id}
# ---------------------------------------------------------------------------


@router.get("/api/acquisition-runs/{run_id}", response_model=None)
def get_run(
    run_id: UUID,
    request: Request,
    outcome: ResultOutcome | None = _OUTCOME_QUERY,
    limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE),
    cursor: str | None = Query(default=None),
) -> JSONResponse:
    """`GET /api/acquisition-runs/{run_id}` (DAC-E5-S5-5).

    Returns the run's summary, persisted counts, and per-instrument paged
    results. Up to `4 * limit` result rows may be returned for `limit`
    instruments. A malformed cursor returns 422; an unknown run returns 404.
    """
    req_id = _request_id(request)
    try:
        filters = DetailFilters(limit=limit, outcome=outcome, cursor=cursor)
    except CursorError:
        return error_response(
            status_code=422,
            code="validation_error",
            message="The cursor is malformed or uses an unsupported version.",
            request_id=req_id,
            resource=_RESOURCE,
        )

    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            detail = get_run_detail(conn, run_id, filters)
    except CursorError:
        return error_response(
            status_code=422,
            code="validation_error",
            message="The cursor is malformed or uses an unsupported version.",
            request_id=req_id,
            resource=_RESOURCE,
        )

    if isinstance(detail, RunNotFound):
        return error_response(
            status_code=404,
            code="not_found",
            message=f"No acquisition run exists with id {run_id!s}.",
            request_id=req_id,
            resource=_RESOURCE,
        )

    run_summary = RunSummary(
        run_id=detail.run.run_id,
        state=detail.run.state,  # type: ignore[arg-type]
        history_depth_years=detail.run.history_depth_years,
        requested_at=detail.run.requested_at,
        started_at=detail.run.started_at,
        ended_at=detail.run.ended_at,
        instruments_named=detail.run.instruments_named,
        instruments_written=detail.run.instruments_written,
        instruments_failed=detail.run.instruments_failed,
        failure_reason=detail.run.failure_reason,
    )
    counts = RunCounts(
        instruments_named=detail.run.instruments_named,
        instruments_written=detail.run.instruments_written,
        instruments_failed=detail.run.instruments_failed,
        results_by_outcome=OutcomeCounts(
            written=detail.outcome_counts.written,
            unchanged=detail.outcome_counts.unchanged,
            not_found=detail.outcome_counts.not_found,
            failed=detail.outcome_counts.failed,
            skipped=detail.outcome_counts.skipped,
        ),
    )
    result_rows = [
        ResultRow(
            instrument_id=r.instrument_id,
            data_type=r.data_type,  # type: ignore[arg-type]
            outcome=r.outcome,  # type: ignore[arg-type]
            reason=r.reason,
            attempts=r.attempts,
            completed_at=r.completed_at,
            symbol=r.symbol,
        )
        for r in detail.results
    ]
    body = RunDetailResponse(
        run=run_summary,
        counts=counts,
        results=result_rows,
        next_cursor=detail.next_cursor,
    )
    return JSONResponse(status_code=200, content=body.model_dump(mode="json"))


# ---------------------------------------------------------------------------
# POST /api/acquisition-runs/{run_id}/cancel
# ---------------------------------------------------------------------------


@router.post("/api/acquisition-runs/{run_id}/cancel", response_model=None)
def cancel_run(run_id: UUID, request: Request) -> JSONResponse:
    """`POST /api/acquisition-runs/{run_id}/cancel` (AC-19, AC-26, DAC-E5-S5-2).

    - `running` → `cancelling`: 202 with state=cancelling.
    - `requested` → `cancelled`: 202 with state=cancelled.
    - terminal state: 409 run_already_terminal with the actual state.
    - unknown id: 404.
    """
    req_id = _request_id(request)
    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            new_state = request_cancel(conn, run_id)
    except RunAlreadyTerminal as exc:
        return error_response(
            status_code=409,
            code="run_already_terminal",
            message=f"The run is already in a terminal state: {exc.actual_state!r}.",
            request_id=req_id,
            resource=_RESOURCE,
            state=exc.actual_state,
        )
    except KeyError:
        return error_response(
            status_code=404,
            code="not_found",
            message=f"No acquisition run exists with id {run_id!s}.",
            request_id=req_id,
            resource=_RESOURCE,
        )

    body = CancelRunResponse(state=new_state)  # type: ignore[arg-type]
    return JSONResponse(status_code=202, content=body.model_dump(mode="json"))
