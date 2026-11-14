"""`GET /api/attention`, `GET /api/data-health`, `GET /api/data-health/problems`.

Component design `component-design-data-health-api.md` 2.1 to 2.3, 3 and 4;
CAP-003-E2-S4. The router validates, delegates and shapes: it holds no SQL, no
derivation and no logging (DEC-0200, SEC-INP-001, SEC-INP-002, SEC-ERR-001).
Each handler takes one connection from the pool and calls its reader once. A
`psycopg.Error` propagates to the delivered `500` handler (DAC-E2-S4-3). The
router is registered in `create_app` by CAP-003-E2-S5 (DEC-0211); until then it
is mounted only by tests. Auth: none, loopback only (DEC-0208).
"""

from typing import Final

from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse

from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from factorflow.api.data_health_models import (
    AttentionResponse,
    DataHealthResponse,
    ProblemPageResponse,
)
from factorflow.api.errors import error_response
from factorflow.data_health import read_attention, read_data_health, read_problems
from factorflow.instruments.symbols import is_valid, normalise

router = APIRouter()

_RESOURCE: Final = "data-health"


@router.get("/api/attention", response_model=AttentionResponse)
def get_attention(request: Request) -> AttentionResponse:
    """The shell's attention facts (AC-4, AC-21)."""
    with request.app.state.db_pool.connection() as conn:
        return AttentionResponse.from_reader(read_attention(conn))


@router.get("/api/data-health", response_model=DataHealthResponse)
def get_data_health(request: Request) -> DataHealthResponse:
    """The verdict counts, the two checks and the first problems page (AC-11)."""
    with request.app.state.db_pool.connection() as conn:
        return DataHealthResponse.from_reader(read_data_health(conn))


@router.get("/api/data-health/problems", response_model=None)
def get_problems(
    request: Request,
    limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE),
    cursor: str | None = Query(default=None),
) -> JSONResponse | ProblemPageResponse:
    """One page of problem rows (AC-13, DAC-E2-3).

    `limit` outside 1 to `MAX_PAGE_SIZE` is refused by the `Query` bound through
    the delivered application-wide handler, never clamped. A cursor that is not a
    symbol is refused before any connection is taken, without echoing it.
    """
    cursor_symbol = normalise(cursor) if cursor is not None else None
    if cursor_symbol is not None and not is_valid(cursor_symbol):
        return error_response(
            status_code=422,
            code="validation_error",
            message="`cursor` must be a stock symbol.",
            request_id=getattr(request.state, "request_id", "unknown"),
            resource=_RESOURCE,
        )
    with request.app.state.db_pool.connection() as conn:
        return ProblemPageResponse.from_reader(
            read_problems(conn, cursor=cursor_symbol, limit=limit)
        )
