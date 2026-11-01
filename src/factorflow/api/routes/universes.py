"""The universes router: the nine local HTTP operations over `universe-service`.

Component design: `component-design-classification-api.md` sections 2.1, 2.5 (error
mapping), 2.6 (write request flow), 2.7 (response shapes) and 11; story CAP-002-E1-S6.
Routes validate (the bounds are the models' and the query parameters', checked before
the service is called), delegate to `factorflow.universes.service` and the reader, map
the service's typed refusals to the stable error envelope and shape the response. They
hold no universe rule. The service is reached through its module (`service.<fn>`), so
one place decides what is called.

Each handler opens one `with pool.connection()`: the pool commits on a normal exit and
rolls back on an exception, which is the "caller commits" the service expects. Typed
refusals are caught outside that block, so the transaction has rolled back before the
envelope is built. Anything the table does not map propagates to the delivered `500`.

Provisional (task plan Open Gaps; DEC-0097, DEC-0098): a member's `name` and `factors`
come from the reader's row for it and are null when the reader has none (no complete set,
no row in the current set, or, on an `as_of` read, a member removed since, because the
reader scopes a universe by today's membership); the list's
`active_count` and `retired_count` page `replay.list_universe_rows` to exhaustion; the
envelope's `resource` is `universe-member` for the member refusals and `universe`
otherwise; a malformed path symbol is `422 validation_error` before the service.
"""

import json
from datetime import date
from typing import Annotated, Final, Literal
from uuid import UUID

import psycopg
from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from factorflow.api.classification_models import (
    AddMembersRequest,
    AddMembersResponse,
    CreateUniverseRequest,
    FactorsResponse,
    MemberResponse,
    OriginResponse,
    RemoveMemberResponse,
    RenameUniverseRequest,
    RetireUniverseResponse,
    SetBlock,
    UniverseEventResponse,
    UniverseEventsResponse,
    UniverseListItem,
    UniverseListResponse,
    UniverseResponse,
)
from factorflow.api.errors import error_response
from factorflow.classification import reader
from factorflow.instruments.symbols import is_valid, normalise
from factorflow.runs.queries import CursorError
from factorflow.universes import replay, service

router = APIRouter()

REFUSALS: Final[dict[type[Exception], tuple[int, str]]] = {
    service.UniverseNotFound: (404, "universe_not_found"),
    service.UniverseRetired: (409, "universe_retired"),
    service.UniverseNameInUse: (409, "universe_name_in_use"),
    service.EmptyUniverse: (422, "empty_universe"),
    service.LastMember: (409, "last_member"),
    service.NotAMember: (404, "not_a_member"),
    service.InstrumentNotAcquired: (409, "instrument_not_acquired"),
    service.ClassificationSetChanged: (409, "classification_set_changed"),
    CursorError: (422, "cursor_invalid"),
}
"""Design 2.5: every refusal the universes routes can meet, keyed by exception class."""

_REFUSABLE: Final = tuple(REFUSALS)
_UNIVERSE: Final = "universe"
_MEMBER: Final = "universe-member"


def _reason(
    exc: Exception,
    *,
    universe_id: UUID | None,
    name: str | None,
    symbol: str | None,
    from_filter: bool,
) -> str:
    """The reason clause; built only from the request and the exception's own attributes."""
    if isinstance(exc, service.InstrumentNotAcquired):
        return "these stocks are not followed: " + ", ".join(exc.symbols)
    if isinstance(exc, service.EmptyUniverse):
        return "the filter matched no stock" if from_filter else "no symbol was given"
    if isinstance(exc, service.UniverseNameInUse):
        return f"an active universe is already named {name!r}"
    if isinstance(exc, service.ClassificationSetChanged):
        current = exc.current_set_id if exc.current_set_id is not None else "none is complete"
        return (
            f"classification set {exc.requested_set_id} is no longer the current set "
            f"(current: {current})"
        )
    if isinstance(exc, service.UniverseNotFound):
        return f"no universe has the id {universe_id}"
    if isinstance(exc, service.UniverseRetired):
        # By id: the exception carries no name and messages use no other source (DEC-0260).
        return f"universe {universe_id} is retired and takes no further change"
    if isinstance(exc, service.NotAMember):
        return f"{symbol} is not a current member of universe {universe_id}"
    if isinstance(exc, service.LastMember):
        return f"{symbol} is the last member of universe {universe_id}; retire the universe instead"
    return "the cursor is not one this list issued"  # CursorError


def _refuse(
    request: Request,
    exc: Exception,
    *,
    operation: str,
    member_route: bool = False,
    universe_id: UUID | None = None,
    name: str | None = None,
    symbol: str | None = None,
    from_filter: bool = False,
) -> JSONResponse:
    """The design 2.5 envelope for a typed refusal; `symbols` is added for coverage."""
    status, code = next(entry for cls, entry in REFUSALS.items() if isinstance(exc, cls))
    member_refusal = isinstance(exc, service.NotAMember | service.LastMember) or (
        member_route and isinstance(exc, service.InstrumentNotAcquired | service.UniverseRetired)
    )
    reason = _reason(
        exc, universe_id=universe_id, name=name, symbol=symbol, from_filter=from_filter
    )
    response = error_response(
        status_code=status,
        code=code,
        message=f"Could not {operation}: {reason}.",
        request_id=getattr(request.state, "request_id", "unknown"),
        resource=_MEMBER if member_refusal else _UNIVERSE,
    )
    if isinstance(exc, service.InstrumentNotAcquired):
        content = json.loads(bytes(response.body))
        content["error"]["symbols"] = exc.symbols
        response = JSONResponse(status_code=status, content=content)
    return response


def _json(model: BaseModel, status_code: int = 200) -> JSONResponse:
    """Decimals stay decimal strings: the model's own JSON mode, not the encoder's."""
    return JSONResponse(status_code=status_code, content=model.model_dump(mode="json"))


def _count(conn: psycopg.Connection, lifecycle: str) -> int:
    """Universes in one lifecycle, by paging the list read to its end (DEC-0098)."""
    total, cursor = 0, None
    while True:
        rows, cursor = replay.list_universe_rows(conn, lifecycle, None, MAX_PAGE_SIZE, cursor)
        total += len(rows)
        if cursor is None:
            return total


def _universe_response(conn: psycopg.Connection, universe: service.Universe) -> UniverseResponse:
    """The universe with each member's reader row: name and cells, or null (DEC-0097)."""
    rows: dict[str, reader.StockRow] = {}
    current: reader.CurrentSet | None = None
    cursor: str | None = None
    while True:
        page = reader.list_classifications(
            conn,
            reader.ListFilters(
                universe_id=universe.universe_id, limit=MAX_PAGE_SIZE, cursor=cursor
            ),
        )
        current = page.set  # one set for every page: the cursor is bound to it
        rows.update((stock.symbol, stock) for stock in page.stocks)
        cursor = page.next_cursor
        if cursor is None:
            break
    members = []
    for member in universe.members:
        row = rows.get(member.symbol)
        members.append(
            MemberResponse(
                symbol=member.symbol,
                name=None if row is None else row.name,
                lifecycle=member.lifecycle,
                member_since=member.member_since,
                factors=None if row is None else FactorsResponse.from_reader(row.factors),
            )
        )
    origin = universe.origin
    return UniverseResponse(
        universe_id=universe.universe_id,
        name=universe.name,
        lifecycle=universe.lifecycle,
        created_at=universe.created_at,
        retired_at=universe.retired_at,
        member_count=len(members),
        as_of=universe.as_of,
        as_of_before_creation=universe.as_of_before_creation,
        origin=OriginResponse(
            kind=origin.kind,
            set_id=origin.set_id,
            classification_date=origin.classification_date,
            thresholds=origin.thresholds,
            hide_incomplete=origin.hide_incomplete,
            symbol=origin.symbol,
        ),
        members=members,
        set=None if current is None else SetBlock.from_reader(current),
    )


# --- reads --------------------------------------------------------------------------------


@router.get("/api/universes")
def list_universes(
    request: Request,
    lifecycle: Literal["active", "retired", "all"] = Query(default="active"),
    name: str | None = Query(default=None),
    limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE),
    cursor: str | None = Query(default=None),
) -> JSONResponse:
    """`GET /api/universes`: one page, newest first, with the active and retired counts."""
    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            page, next_cursor = service.list_universes(conn, lifecycle, name, limit, cursor)
            active_count = _count(conn, "active")
            retired_count = _count(conn, "retired")
    except _REFUSABLE as exc:
        return _refuse(request, exc, operation="list universes")
    return _json(
        UniverseListResponse(
            universes=[
                UniverseListItem(
                    universe_id=universe.universe_id,
                    name=universe.name,
                    lifecycle=universe.lifecycle,
                    member_count=len(universe.members),
                    created_at=universe.created_at,
                    retired_at=universe.retired_at,
                )
                for universe in page
            ],
            active_count=active_count,
            retired_count=retired_count,
            next_cursor=next_cursor,
        )
    )


@router.get("/api/universes/{universe_id}")
def get_universe(
    request: Request, universe_id: UUID, as_of: Annotated[date | None, Query()] = None
) -> JSONResponse:
    """`GET /api/universes/{id}`: the universe as of `as_of` (default today), with cells."""
    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            universe = service.get_universe(conn, universe_id, as_of)
            body = _universe_response(conn, universe)
    except _REFUSABLE as exc:
        return _refuse(request, exc, operation="read the universe", universe_id=universe_id)
    return _json(body)


@router.get("/api/universes/{universe_id}/events")
def list_events(
    request: Request,
    universe_id: UUID,
    limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE),
    cursor: str | None = Query(default=None),
) -> JSONResponse:
    """`GET /api/universes/{id}/events`: one page of the history, newest first."""
    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            events, next_cursor = service.list_events(conn, universe_id, limit, cursor)
    except _REFUSABLE as exc:
        return _refuse(
            request, exc, operation="list the universe's events", universe_id=universe_id
        )
    return _json(
        UniverseEventsResponse(
            events=[
                UniverseEventResponse(
                    event_id=event.event_id,
                    event_type=event.event_type,
                    name=event.name,
                    symbol=event.symbol,
                    recorded_at=event.recorded_at,
                    recorded_on=event.recorded_on,
                    filter_provenance=event.filter_provenance,
                )
                for event in events
            ],
            next_cursor=next_cursor,
        )
    )


# --- writes -------------------------------------------------------------------------------


@router.post("/api/universes")
def create_universe(request: Request, body: CreateUniverseRequest) -> JSONResponse:
    """`POST /api/universes`: by hand from `symbols`, or from a reviewed filter result."""
    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            if body.filter is not None and body.set_id is not None:
                universe = service.create_from_filter(
                    conn, body.name, body.set_id, body.filter.to_reader()
                )
            else:
                universe = service.create_by_hand(conn, body.name, body.symbols or [])
            created = _universe_response(conn, universe)
    except _REFUSABLE as exc:
        return _refuse(
            request,
            exc,
            operation="create a universe",
            name=body.name,
            from_filter=body.filter is not None,
        )
    return _json(created, status_code=201)


@router.patch("/api/universes/{universe_id}")
def rename_universe(
    request: Request, universe_id: UUID, body: RenameUniverseRequest
) -> JSONResponse:
    """`PATCH /api/universes/{id}`: a new name; the id and the history are unchanged."""
    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            universe = service.rename(conn, universe_id, body.name)
            renamed = _universe_response(conn, universe)
    except _REFUSABLE as exc:
        return _refuse(
            request, exc, operation="rename the universe", universe_id=universe_id, name=body.name
        )
    return _json(renamed)


@router.delete("/api/universes/{universe_id}")
def retire_universe(request: Request, universe_id: UUID) -> JSONResponse:
    """`DELETE /api/universes/{id}`: retires, never deletes; members and events stay."""
    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            universe = service.retire(conn, universe_id)
    except _REFUSABLE as exc:
        return _refuse(request, exc, operation="retire the universe", universe_id=universe_id)
    if universe.retired_at is None:
        raise RuntimeError("retire returned a universe with no retired_at")
    return _json(RetireUniverseResponse(lifecycle="retired", retired_at=universe.retired_at))


@router.post("/api/universes/{universe_id}/members")
def add_members(request: Request, universe_id: UUID, body: AddMembersRequest) -> JSONResponse:
    """`POST /api/universes/{id}/members`: `already_member` is a 200 field (DAC-E1-6)."""
    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            added, already_member = service.add_members(conn, universe_id, body.symbols)
    except _REFUSABLE as exc:
        return _refuse(
            request,
            exc,
            operation="add members to the universe",
            member_route=True,
            universe_id=universe_id,
        )
    return _json(AddMembersResponse(added=added, already_member=already_member))


@router.delete("/api/universes/{universe_id}/members/{symbol}")
def remove_member(request: Request, universe_id: UUID, symbol: str) -> JSONResponse:
    """`DELETE /api/universes/{id}/members/{symbol}`: the dated record is kept."""
    clean = normalise(symbol)
    if not is_valid(clean):
        return error_response(
            status_code=422,
            code="validation_error",
            message="The request did not match the expected shape: `symbol`.",
            request_id=getattr(request.state, "request_id", "unknown"),
            resource=_MEMBER,
        )
    pool = request.app.state.db_pool
    try:
        with pool.connection() as conn:
            removed_at = service.remove_member(conn, universe_id, clean)
    except _REFUSABLE as exc:
        return _refuse(
            request,
            exc,
            operation="remove a member from the universe",
            member_route=True,
            universe_id=universe_id,
            symbol=clean,
        )
    return _json(RemoveMemberResponse(removed_at=removed_at))
