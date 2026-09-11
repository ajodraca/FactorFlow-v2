"""`GET/POST /api/instruments`, `DELETE /api/instruments/{symbol}`.

Component design: `component-design-ingestion-api.md` sections 2.4, 11;
task plan T020. A thin HTTP surface over CAP-001-E2-S1's `service.py`: this
module validates the request, delegates to the domain function, and shapes
the response. No business rule is re-implemented here (task plan T025).
"""

from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse

from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from factorflow.api.errors import error_response
from factorflow.api.models import (
    AddInstrumentsRequest,
    AddInstrumentsResponse,
    InstrumentListResponse,
    InstrumentResponse,
    RetireInstrumentResponse,
    SymbolOutcomeResponse,
)
from factorflow.instruments.service import (
    AlreadyRetired,
    Disposition,
    InstrumentFilters,
    InstrumentNotFound,
    add_symbols,
    list_instruments,
    retire_symbol,
)

router = APIRouter()

_REJECTION_REASONS = {
    Disposition.DUPLICATE_ACTIVE: "an active instrument with this symbol already exists",
    Disposition.MALFORMED: "the symbol does not match the required shape",
}


@router.post("/api/instruments", response_model=None)
def add_instruments(body: AddInstrumentsRequest, request: Request) -> JSONResponse:
    """`POST /api/instruments` (DAC-E2-4, DAC-E2-S3-1).

    `201` when at least one symbol is added or reactivated; `409` when
    every symbol is a duplicate of an active instrument; `422` when every
    symbol is malformed.
    """
    pool = request.app.state.db_pool
    with pool.connection() as connection:
        outcomes = add_symbols(connection, body.symbols)

    added = []
    reactivated = []
    rejected = []
    for outcome in outcomes:
        response_row = SymbolOutcomeResponse(
            input_symbol=outcome.input_symbol,
            normalised_symbol=outcome.normalised_symbol,
            disposition=outcome.disposition.value,
            reason=_REJECTION_REASONS.get(outcome.disposition),
        )
        if outcome.disposition is Disposition.ADDED:
            added.append(response_row)
        elif outcome.disposition is Disposition.REACTIVATED:
            reactivated.append(response_row)
        else:
            rejected.append(response_row)

    body_model = AddInstrumentsResponse(added=added, reactivated=reactivated, rejected=rejected)

    if added or reactivated:
        status_code = 201
    elif all(o.disposition is Disposition.DUPLICATE_ACTIVE for o in outcomes):
        status_code = 409
    else:
        status_code = 422

    if status_code != 201:
        request_id = getattr(request.state, "request_id", "unknown")
        code = "all_duplicate" if status_code == 409 else "all_malformed"
        message = (
            "every symbol in the batch is already an active instrument"
            if status_code == 409
            else "every symbol in the batch is malformed"
        )
        return error_response(
            status_code=status_code,
            code=code,
            message=message,
            request_id=request_id,
            resource="instruments",
        )

    return JSONResponse(status_code=201, content=body_model.model_dump(mode="json"))


@router.delete("/api/instruments/{symbol}", response_model=None)
def retire_instrument(symbol: str, request: Request) -> RetireInstrumentResponse | JSONResponse:
    """`DELETE /api/instruments/{symbol}` (DAC-E2-5).

    `404` when the symbol is unknown, `409` when already retired, `200`
    with the retirement timestamp otherwise.
    """
    pool = request.app.state.db_pool
    request_id = getattr(request.state, "request_id", "unknown")
    try:
        with pool.connection() as connection:
            retire_symbol(connection, symbol)
    except InstrumentNotFound:
        return error_response(
            status_code=404,
            code="instrument_not_found",
            message=f"no instrument exists for symbol {symbol!r}",
            request_id=request_id,
            resource="instruments",
        )
    except AlreadyRetired:
        return error_response(
            status_code=409,
            code="instrument_already_retired",
            message=f"instrument {symbol!r} is already retired",
            request_id=request_id,
            resource="instruments",
        )

    # `retire_symbol` (CAP-001-E2-S1) returns nothing, so `retired_at` is
    # not the exact value the store wrote with its own `now()` -- it is
    # this process's clock, sampled here, immediately after the
    # transaction above has committed (adversarial review v1, IR-004: an
    # earlier version sampled *before* the call, which could diverge by
    # more than the transaction's own duration). A second query to read
    # the stored value back would duplicate a data-access concern that
    # belongs to the domain module, not this thin HTTP surface (task plan
    # T025); the field is informational only and never used for ordering,
    # so this approximation -- not the exact persisted value -- is
    # accepted as the response's `retired_at`.
    retired_at = datetime.now(UTC)
    return RetireInstrumentResponse(lifecycle="retired", retired_at=retired_at)


@router.get("/api/instruments", response_model=InstrumentListResponse)
def list_instruments_route(
    request: Request,
    symbol: str | None = Query(default=None),
    lifecycle: Literal["active", "retired"] | None = Query(default=None),
    limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE),
    cursor: str | None = Query(default=None),
) -> InstrumentListResponse:
    """`GET /api/instruments` (DAC-E2-10, DAC-E2-S3-4, DAC-E2-S3-5).

    `limit` beyond `MAX_PAGE_SIZE` is rejected with `422` by the `Query`
    bound above, rather than silently clamped. `lifecycle` is constrained
    to the store's two known values (adversarial review v1, IR-003): an
    unrecognised value previously matched nothing and returned an empty
    list indistinguishable from a genuinely empty result, the same silent-
    acceptance shape DAC-E2-S3-4 already rejects for `limit`.
    """
    pool = request.app.state.db_pool
    filters = InstrumentFilters(
        page_size=limit, symbol_prefix=symbol, lifecycle=lifecycle, cursor=cursor
    )
    with pool.connection() as connection:
        page = list_instruments(connection, filters)

    return InstrumentListResponse(
        instruments=[
            InstrumentResponse(
                instrument_id=row.instrument_id, symbol=row.symbol, lifecycle=row.lifecycle
            )
            for row in page.rows
        ],
        active_count=page.active_count,
        retired_count=page.retired_count,
        next_cursor=page.next_cursor,
    )
