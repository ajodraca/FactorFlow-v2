"""The classifications router: the six read operations over `factorflow.classification.reader`.

Component design: `component-design-classification-api.md` sections 2.1, 2.4 to 2.7, 11;
story CAP-002-E3-S5 (AC-9, AC-13, AC-16 to AC-18, AC-20 to AC-22). Routes validate the request,
delegate to the reader (reached through its module, `reader.<fn>`, so one place decides what is
called), map the reader's typed refusals to the stable error envelope and shape the result. They
hold no classification rule and compute nothing: every value is a reader field copied across.

`/summary` is declared before the parameterised paths so a literal is never captured as a
parameter. Reads check one connection out of the pool for one call; nothing is committed.
Anything the table does not map propagates to the delivered `500`.
"""

import base64
import json
from typing import Annotated, Any, Final, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Path, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from factorflow.api.classification_models import (
    ClassificationListQuery,
    ClassificationListResponse,
    ClassificationSummaryResponse,
    SetListResponse,
    SetResponse,
    StockEvidenceResponse,
    StockHistoryResponse,
)
from factorflow.api.errors import error_response
from factorflow.classification import reader
from factorflow.instruments.symbols import is_valid, normalise
from factorflow.runs.queries import CursorError

router = APIRouter()

_RESOURCE: Final = "classification"

REFUSALS: Final[dict[type[Exception], tuple[int, str, str]]] = {
    reader.UniverseNotFound: (404, "universe_not_found", "universe"),
    reader.InstrumentNotFound: (404, "instrument_not_found", _RESOURCE),
    reader.SetNotFound: (404, "classification_set_not_found", "classification-set"),
    CursorError: (422, "cursor_invalid", _RESOURCE),
}
"""Design 2.5 (DEC-0139): every refusal the classification reads can meet, keyed by class
and giving the status, the code and the envelope's `resource`."""


def _reason(exc: Exception) -> str:
    """Built from the exception's own attributes only, never its text (SEC-ERR-001)."""
    if isinstance(exc, reader.UniverseNotFound):
        return f"no universe has the id {exc.universe_id}"
    if isinstance(exc, reader.InstrumentNotFound):
        return f"no instrument has the symbol {exc.symbol}"
    if isinstance(exc, reader.SetNotFound):
        return f"no classification set has the id {exc.set_id}"
    return "the cursor is not one this read issued"


def _cursor_code(cursor: str | None, kind: Literal["list", "other"]) -> str:
    """`cursor_stale` only for a list cursor the reader itself accepts for the set and ordering
    it names (DEC-0138); every other cursor, and every cursor of the other reads, is invalid.
    The cursor's values are used only to re-run the reader's decoder, never to choose a page."""
    if kind != "list" or not cursor:
        return "cursor_invalid"
    try:
        payload = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
        set_id, sort, order = UUID(payload["set"]), payload["sort"], payload["order"]
        if sort not in reader.SORT_ALLOWLIST or order not in ("asc", "desc"):
            return "cursor_invalid"
        reader.decode_cursor(cursor, set_id=set_id, sort=sort, order=order)
    except (ValueError, KeyError, TypeError, AttributeError, CursorError):
        return "cursor_invalid"
    return "cursor_stale"


def _refuse(
    request: Request,
    exc: Exception,
    operation: str,
    cursor: str | None,
    kind: Literal["list", "other"],
) -> JSONResponse | None:
    """The envelope for a typed refusal, or None so the delivered handler produces the 500."""
    for cls, (status, code, resource) in REFUSALS.items():
        if isinstance(exc, cls):
            if cls is CursorError:
                code = _cursor_code(cursor, kind)
            return error_response(
                status_code=status,
                code=code,
                message=f"Could not {operation}: {_reason(exc)}.",
                request_id=getattr(request.state, "request_id", "unknown"),
                resource=resource,
            )
    return None


def _json(model: BaseModel) -> JSONResponse:
    """Decimals stay decimal strings: the model's own JSON mode, not the encoder's."""
    return JSONResponse(content=model.model_dump(mode="json"))


def _symbol(symbol: Annotated[str, Path()]) -> str:
    """Upper-cased and shape-checked before the reader (design 2.4, "every symbol")."""
    normalised = normalise(symbol)
    if not is_valid(normalised):
        raise RequestValidationError(
            [
                {
                    "type": "value_error",
                    "loc": ("path", "symbol"),
                    "msg": "invalid symbol",
                    "input": "",
                }
            ]
        )
    return normalised


Symbol = Annotated[str, Depends(_symbol)]
PageLimit = Annotated[int, Query(gt=0, le=MAX_PAGE_SIZE)]
PageCursor = Annotated[str | None, Query()]


def _read(
    request: Request,
    operation: str,
    call: Any,
    *,
    cursor: str | None = None,
    kind: Literal["list", "other"] = "other",
) -> Any:
    """Run one reader call on a pooled connection; a typed refusal becomes its envelope."""
    try:
        with request.app.state.db_pool.connection() as conn:
            return call(conn)
    except Exception as exc:
        response = _refuse(request, exc, operation, cursor, kind)
        if response is None:
            raise
        return response


@router.get(
    "/api/classifications",
    description=(
        "The Research list, or a compare of 2 to 6 symbols. `hide_incomplete` excludes only "
        "stocks whose reason is an input reason, never `not_enough_stocks` and never `retired`. "
        "Unscoped, the list covers active instruments only; a universe scopes it and keeps its "
        "retired members. A threshold excludes only stocks classified on that factor that fail "
        "it. `symbols` takes no other filter but `limit`."
    ),
)
def list_classifications(
    request: Request, query: Annotated[ClassificationListQuery, Query()]
) -> Any:
    if query.symbols is not None:
        conflicts = query.compare_conflicts(request.query_params.keys())
        if conflicts:
            raise RequestValidationError(
                [
                    {
                        "type": "value_error",
                        "loc": ("query", name),
                        "msg": "not with symbols",
                        "input": "",
                    }
                    for name in conflicts
                ]
            )
        symbols = query.symbols
        result = _read(request, "compare the stocks", lambda conn: reader.compare(conn, symbols))
    else:
        filters = query.to_filters()
        result = _read(
            request,
            "list the classifications",
            lambda conn: reader.list_classifications(conn, filters),
            cursor=query.cursor,
            kind="list",
        )
    if isinstance(result, JSONResponse):
        return result
    return _json(ClassificationListResponse.from_reader(result))


@router.get("/api/classifications/summary")
def classification_summary(request: Request) -> Any:
    result = _read(request, "read the classification summary", reader.summary)
    if isinstance(result, JSONResponse):
        return result
    return _json(ClassificationSummaryResponse.from_reader(result))


@router.get("/api/classifications/sets")
def list_sets(
    request: Request, limit: PageLimit = DEFAULT_PAGE_SIZE, cursor: PageCursor = None
) -> Any:
    result = _read(
        request,
        "list the classification sets",
        lambda conn: reader.list_sets(conn, limit, cursor),
        cursor=cursor,
    )
    if isinstance(result, JSONResponse):
        return result
    rows, next_cursor = result
    return _json(SetListResponse.from_reader(rows, next_cursor))


@router.get("/api/classifications/sets/{set_id}")
def get_set(request: Request, set_id: UUID) -> Any:
    result = _read(
        request, "read the classification set", lambda conn: reader.get_set(conn, set_id)
    )
    if isinstance(result, JSONResponse):
        return result
    return _json(SetResponse.from_reader(result))


@router.get("/api/classifications/stocks/{symbol}")
def stock_evidence(request: Request, symbol: Symbol) -> Any:
    result = _read(
        request,
        "read the evidence for a stock",
        lambda conn: reader.stock_evidence(conn, symbol),
    )
    if isinstance(result, JSONResponse):
        return result
    return _json(StockEvidenceResponse.from_reader(result))


@router.get("/api/classifications/stocks/{symbol}/history")
def stock_history(
    request: Request,
    symbol: Symbol,
    limit: PageLimit = DEFAULT_PAGE_SIZE,
    cursor: PageCursor = None,
) -> Any:
    result = _read(
        request,
        "read the classification history of a stock",
        lambda conn: reader.stock_history(conn, symbol, limit, cursor),
        cursor=cursor,
    )
    if isinstance(result, JSONResponse):
        return result
    rows, next_cursor = result
    return _json(StockHistoryResponse.from_reader(symbol, rows, next_cursor))
