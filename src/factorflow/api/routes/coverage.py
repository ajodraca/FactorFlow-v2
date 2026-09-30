"""`GET /api/coverage`: per-instrument coverage, gaps and their availability.

Component design: `component-design-ingestion-api.md` sections 2.4a, 3 and 11;
story CAP-001-E6-S3. A thin surface over `coverage-service`: this module
validates the query, calls `read_coverage` (and `read_gap_dates` for an
expansion), and shapes the response. Coverage is read, never computed here --
no coverage arithmetic, no SQL.

Auth: none, loopback only (approved design). No provider import.
"""

from datetime import date
from typing import Literal

from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse

from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from factorflow.api.errors import error_response
from factorflow.api.models import (
    CoverageDataTypes,
    CoverageExpansion,
    CoverageGapDetection,
    CoverageInstrument,
    CoverageResponse,
)
from factorflow.coverage.service import read_coverage, read_gap_dates
from factorflow.instruments.service import InstrumentNotFound
from factorflow.instruments.symbols import is_valid, normalise

router = APIRouter()

_RESOURCE = "coverage"


def _request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "unknown")


@router.get("/api/coverage", response_model=None)
def read_coverage_route(
    request: Request,
    symbol: str | None = Query(default=None),
    # Omitted by default, which includes retired instruments (DAC-E6-S3-4, AC-21).
    lifecycle: Literal["active", "retired"] | None = Query(default=None),
    from_date: date | None = Query(default=None, alias="from"),  # noqa: B008
    to_date: date | None = Query(default=None, alias="to"),  # noqa: B008
    limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE),
    cursor: str | None = Query(default=None),
    expand: str | None = Query(default=None),
) -> JSONResponse:
    """`GET /api/coverage` (AC-7, AC-8, AC-17, DAC-E6-10, DAC-E6-S3-1 to DAC-E6-S3-5).

    `limit` beyond `MAX_PAGE_SIZE` is rejected with `422` by the `Query` bound,
    never clamped (DAC-E6-S3-3). Omitted `from` / `to` reach the service as
    `None`, meaning everything acquired (design 2.4a).

    Owner-confirmed contract choices (2026-09-29, CAP-001-E6-S3-tasks Open Gaps 1-2):

    - `expand=<symbol>` adds a top-level `expanded` object with that
      instrument's gap dates for the request's bounds; without it the key is
      absent. An unknown symbol is `404 instrument_not_found`, a malformed one
      `422 validation_error`.
    - Absent gap counts are `gap_count: null`, never an omitted key and never `0`.
    """
    req_id = _request_id(request)
    # DAC-E6-S3-5: an inverted range is rejected before the service is called.
    if from_date is not None and to_date is not None and from_date > to_date:
        return error_response(
            status_code=422,
            code="validation_error",
            message="`from` must not be later than `to`.",
            request_id=req_id,
            resource=_RESOURCE,
        )
    expand_symbol = normalise(expand) if expand is not None else None
    if expand_symbol is not None and not is_valid(expand_symbol):
        return error_response(
            status_code=422,
            code="validation_error",
            message="`expand` is not a valid instrument symbol.",
            request_id=req_id,
            resource=_RESOURCE,
        )

    gap_dates: list[date] | None = None
    with request.app.state.db_pool.connection() as conn:
        view = read_coverage(
            conn,
            symbol=symbol,
            lifecycle=lifecycle,
            from_date=from_date,
            to_date=to_date,
            cursor=cursor,
            limit=limit,
        )
        if expand_symbol is not None:
            try:
                gap_dates = read_gap_dates(
                    conn, expand_symbol, from_date=from_date, to_date=to_date
                )
            except InstrumentNotFound:
                return error_response(
                    status_code=404,
                    code="instrument_not_found",
                    message=f"no instrument exists for symbol {expand_symbol!r}",
                    request_id=req_id,
                    resource=_RESOURCE,
                )

    body = CoverageResponse(
        instruments=[
            CoverageInstrument(
                symbol=row.symbol,
                lifecycle=row.lifecycle,  # type: ignore[arg-type]
                data_types=CoverageDataTypes.model_validate(
                    {data_type: state.value for data_type, state in row.presence.items()}
                ),
                covered_from=row.covered_from,
                covered_to=row.covered_to,
                last_acquired_at=row.last_acquired_at,
                gap_count=row.gaps.missing_days,
                depth_short_by_years=row.depth_shortfall_years,
            )
            for row in view.instruments
        ],
        never_acquired=view.never_acquired,
        gap_detection=CoverageGapDetection(
            available=view.gap_detection.available, reason=view.gap_detection.reason
        ),
        next_cursor=view.next_cursor,
        expanded=CoverageExpansion(symbol=expand_symbol, gap_dates=gap_dates)
        if expand_symbol is not None
        else None,
    )
    content = body.model_dump(mode="json", exclude={"expanded"} if expand_symbol is None else None)
    return JSONResponse(status_code=200, content=content)
