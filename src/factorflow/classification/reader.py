"""The classification read side: the current set, the later attempt, the summary and the list.

Implements ``component-design-classification-reader.md`` sections 2.1 (placement), 2.3
(interface), 2.4 (current set, currency and the summary) and 7 (testing) for CAP-002-E3-S1, and
sections 2.3, 2.5 (the list query) and 2.7 (read sequence) for CAP-002-E3-S2.

- The current set is the latest set in state ``complete``; ``later`` is the most recent set
  started after it, or the most recent set while none is complete; ``not_current`` is true
  exactly when ``later`` is not None (AC-20, AC-21; DAC-E3-1; DAC-E3-S1-1, DAC-E3-S1-2).
- Before any set is complete the reads carry ``never_classified`` with ``set`` None, in the same
  shape as every other state (AC-22; DAC-E3-11; DAC-E3-S1-3).
- A stock is current when none of its ``factor_input`` rows in the current set is ``missing`` or
  ``outdated``; ``not_computable`` does not count against currency. The summary carries counts
  only, never a stock row (AC-13; DAC-E3-10; DAC-E3-S1-4, DAC-E3-S1-5).
- Every value returned is a stored row; nothing is recomputed here (STD-UI-15; DAC-E3-S1-6).

The list (CAP-002-E3-S2):

- ``evaluate_filter`` runs the list statement itself, so the list, compare and the universe
  snapshot apply one predicate: twelve bounds, ``hide_incomplete`` and the symbol prefix
  (DAC-E3-2; DAC-E3-S2-7).
- A bound applies only where the stock is classified on its factor; an incomplete or unranked
  stock stays listed and counted (DAC-E3-3; DAC-E3-S2-1; DEC-0081).
- ``hide_incomplete`` hides a stock only for an input reason, never ``not_enough_stocks`` or
  ``retired`` (DAC-E3-4; DAC-E3-S2-2; DEC-0079, DEC-0129).
- Unscoped is the active roster; a universe scope replays membership with
  ``MEMBERSHIP_AS_OF_SQL`` and keeps retired members (DAC-E3-5; DAC-E3-S2-3; SA-DUP-001).
- ``match_count`` counts the whole filtered scope once per request (DAC-E3-6; DAC-E3-S2-4).
- ``sort`` resolves through ``SORT_ALLOWLIST`` and the cursor is bound to its set, sort and order
  and carries a payload check, so no request text reaches SQL and an altered cursor is refused
  (DAC-E3-S2-5; SEC-INP-002; DEC-0246).
- Every cell carries the stored ``restated_possible`` (DAC-E3-12; DAC-E3-S2-6); a stock's name is
  its latest stored reference name, or None (DEC-0245, PROVISIONAL).

``read_set_blocks`` is the one definition of the ``set`` and ``later`` blocks that the summary,
the list read and the API reuse (task plan Open Gap 3; SA-DUP-001). Statements are ``.sql`` files
under ``sql/``, loaded at import and executed with bound parameters only. The reader takes the
caller's connection, writes nothing and never commits; database errors propagate (OPS-ERR-001).
"""

import base64
import hashlib
import json
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Final
from uuid import UUID
from zoneinfo import ZoneInfo

import psycopg

from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from factorflow.classification.constants import FACTORS, MIN_PEER_SET_SIZE
from factorflow.runs.queries import CursorError
from factorflow.universes.replay import MEMBERSHIP_AS_OF_SQL

__all__ = [
    "CURRENT_SET_SQL",
    "FACTORS",
    "INPUT_REASONS",
    "LIST_SQL",
    "MIN_PEER_SET_SIZE",
    "SORT_ALLOWLIST",
    "SUMMARY_SQL",
    "UNIVERSE_EXISTS_SQL",
    "ClassificationPage",
    "CurrentSet",
    "CursorError",
    "FactorCell",
    "FactorSummary",
    "LaterSet",
    "ListFilters",
    "StockRow",
    "StocksCurrent",
    "Summary",
    "Thresholds",
    "UniverseNotFound",
    "current_set",
    "decode_cursor",
    "encode_cursor",
    "escape_like",
    "evaluate_filter",
    "list_classifications",
    "read_set_blocks",
    "resolve_sort",
    "summary",
]

_SQL_DIR = Path(__file__).parent / "sql"
CURRENT_SET_SQL: Final = (_SQL_DIR / "current_set.sql").read_text()
SUMMARY_SQL: Final = (_SQL_DIR / "summary.sql").read_text()
LIST_SQL: Final = (_SQL_DIR / "list_classifications.sql").read_text()
UNIVERSE_EXISTS_SQL: Final = (_SQL_DIR / "universe_exists.sql").read_text()

INPUT_REASONS: Final = ("input_missing", "input_outdated", "input_not_computable")  # DEC-0079

# Request value -> the `matched` output column it sorts by; repository constants, never request
# text (SEC-INP-002). The design's `c_{f}.score` names joined tables the outer query cannot see,
# so the values name the aliased columns (DEC-0129).
SORT_ALLOWLIST: Final[dict[str, str]] = {
    "symbol": "m.symbol",
    **{f"{f}_score": f"m.{f}_score" for f in FACTORS},
    **{f"{f}_percentile": f"m.{f}_percentile" for f in FACTORS},
}
_ORDERS: Final = {"asc": "ASC", "desc": "DESC"}
_BOUNDS: Final = tuple(
    f"{f}_{metric}_{end}"
    for f in FACTORS
    for metric in ("score", "percentile")
    for end in ("min", "max")
)
_SYMBOL_PREFIX: Final = re.compile(r"[A-Z][A-Z0-9.-]{0,15}")
_CHICAGO: Final = ZoneInfo("America/Chicago")
_CURSOR_VERSION: Final = 1
_CURSOR_FIELDS: Final = frozenset({"v", "set", "sort", "order", "key", "null", "sym", "chk"})

# The keyset fragments, chosen in code; `{sort_expr}` is the allowlisted expression and the last
# row's key and symbol are bound parameters. Rows not classified on the sort factor (a null key)
# come after every classified row in both directions, ties on symbol ascending.
_KEYSET_NONE: Final = "true"
_KEYSET_AFTER: Final = {
    ("asc", "numeric"): "({sort_expr} IS NULL OR {sort_expr} > %(k)s::numeric"
    " OR ({sort_expr} = %(k)s::numeric AND m.symbol > %(ksym)s::text))",
    ("desc", "numeric"): "({sort_expr} IS NULL OR {sort_expr} < %(k)s::numeric"
    " OR ({sort_expr} = %(k)s::numeric AND m.symbol > %(ksym)s::text))",
    ("asc", "text"): "({sort_expr} > %(k)s::text"
    " OR ({sort_expr} = %(k)s::text AND m.symbol > %(ksym)s::text))",
    ("desc", "text"): "({sort_expr} < %(k)s::text"
    " OR ({sort_expr} = %(k)s::text AND m.symbol > %(ksym)s::text))",
}
_KEYSET_AFTER_NULL: Final = "({sort_expr} IS NULL AND m.symbol > %(ksym)s::text)"


class UniverseNotFound(LookupError):
    """``universe_id`` names no universe (design 2.5); a retired one is still a scope (DEC-0128)."""

    def __init__(self, universe_id: UUID) -> None:
        super().__init__(f"universe not found: {universe_id}")
        self.universe_id = universe_id


@dataclass(frozen=True)
class LaterSet:
    """The most recent set newer than the current one, or the most recent while none is complete;
    one shape on the list and the summary (DEC-0082)."""

    set_id: UUID
    state: str  # building | failed
    run_id: UUID
    run_started_at: datetime  # acquisition_run.started_at (DEC-0083)
    started_at: datetime
    ended_at: datetime | None
    failure_reason: str | None


@dataclass(frozen=True)
class FactorSummary:
    qualified_count: int
    ranked: bool
    min_peer_set_size: int  # 30, AC-14


@dataclass(frozen=True)
class CurrentSet:
    set_id: UUID
    classification_date: date
    run_id: UUID
    run_started_at: datetime  # acquisition_run.started_at (DEC-0083)
    run_outcome: str  # succeeded | partial, from acquisition_run.state
    state: str  # complete
    started_at: datetime
    ended_at: datetime  # the as-of line's "Scores from {date} {time}"
    latest_trading_day: date
    active_instruments: int  # followed_count
    factors: dict[str, FactorSummary]
    not_current: bool  # true exactly when `later` is not None (DEC-0082)


@dataclass(frozen=True)
class StocksCurrent:
    current_count: int  # stocks with no factor_input row missing or outdated (AC-12, AC-13)
    followed_count: int  # the set's active_instruments


@dataclass(frozen=True)
class Summary:
    set: CurrentSet | None  # the latest complete set, or None
    never_classified: bool  # true exactly when set is None
    later: LaterSet | None  # the newer building or failed set, or the latest while none is complete
    stocks_current: StocksCurrent | None


def read_set_blocks(conn: psycopg.Connection) -> tuple[CurrentSet | None, LaterSet | None]:
    """The ``set`` and ``later`` blocks every classification read carries, from one statement."""
    with conn.cursor() as cur:
        cur.execute(CURRENT_SET_SQL)
        row = cur.fetchone()
        names = [column.name for column in cur.description] if cur.description else []
    if row is None:
        return None, None
    columns = dict(zip(names, row, strict=True))
    later = _row_to_later(columns) if columns["later_set_id"] is not None else None
    current = (
        _row_to_current(columns, not_current=later is not None)
        if columns["set_id"] is not None
        else None
    )
    return current, later


def current_set(conn: psycopg.Connection) -> CurrentSet | None:
    """The latest complete set, or None before any set is complete (AC-22)."""
    return read_set_blocks(conn)[0]


def summary(conn: psycopg.Connection) -> Summary:
    """The current set with its ``later``, plus the current-stock count; no stock rows."""
    current, later = read_set_blocks(conn)
    if current is None:
        return Summary(set=None, never_classified=True, later=later, stocks_current=None)
    with conn.cursor() as cur:
        cur.execute(SUMMARY_SQL, {"set_id": current.set_id})
        row = cur.fetchone()
    if row is None:  # an ungrouped aggregate always returns one row
        raise RuntimeError("summary.sql returned no row")
    stocks_current = StocksCurrent(
        current_count=int(row[0]), followed_count=current.active_instruments
    )
    return Summary(set=current, never_classified=False, later=later, stocks_current=stocks_current)


def resolve_sort(value: object) -> str:
    """The allowlisted expression for a sort; anything else is refused before SQL is built."""
    if not isinstance(value, str) or value not in SORT_ALLOWLIST:
        raise ValueError(f"sort must be one of {sorted(SORT_ALLOWLIST)}")
    return SORT_ALLOWLIST[value]


def escape_like(prefix: str) -> str:
    """Make ``%``, ``_`` and the escape character literal in a ``LIKE ... ESCAPE '\\'`` pattern."""
    return prefix.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


@dataclass(frozen=True)
class Thresholds:
    """The filter: twelve optional bounds, ``hide_incomplete`` and the symbol prefix; one object
    for the list, compare and the universe snapshot (DEC-0076, DEC-0085)."""

    bounds: dict[str, Decimal] = field(default_factory=dict)
    hide_incomplete: bool = False
    symbol: str | None = None  # upper-cased prefix, ^[A-Z][A-Z0-9.-]{0,15}$

    def __post_init__(self) -> None:
        for name, bound in self.bounds.items():
            if name not in _BOUNDS:
                raise ValueError(f"unknown threshold bound: {name!r}")
            if not isinstance(bound, Decimal) or not bound.is_finite():
                raise ValueError(f"{name} must be a finite Decimal")
            if "_percentile_" in name and not Decimal(0) <= bound <= Decimal(100):
                raise ValueError(f"{name} must be between 0 and 100")
        if not isinstance(self.hide_incomplete, bool):
            raise ValueError("hide_incomplete must be a boolean")
        if self.symbol is not None:
            if not isinstance(self.symbol, str):
                raise ValueError("symbol must be a string")
            upper = self.symbol.upper()
            if not _SYMBOL_PREFIX.fullmatch(upper):
                raise ValueError("symbol must match ^[A-Z][A-Z0-9.-]{0,15}$")
            object.__setattr__(self, "symbol", upper)

    def factors_constrained(self) -> set[str]:
        return {name.split("_", 1)[0] for name in self.bounds}


@dataclass(frozen=True)
class FactorCell:
    status: str  # classified | not_classified
    score: Decimal | None
    percentile: Decimal | None
    reason_code: str | None
    reason_input: str | None
    reason_detail: str | None
    restated_possible: bool


@dataclass(frozen=True)
class StockRow:
    instrument_id: int
    symbol: str
    name: str | None  # latest instrument_reference.company_name; None when none (DEC-0245)
    lifecycle: str
    factors: dict[str, FactorCell]


@dataclass(frozen=True)
class ListFilters:
    universe_id: UUID | None = None
    symbols: list[str] | None = None  # compare; its size is checked by CAP-002-E3-S3 (DEC-0127)
    sort: str = "symbol"  # key of SORT_ALLOWLIST
    order: str = "asc"  # asc | desc
    thresholds: Thresholds = field(default_factory=Thresholds)
    limit: int = DEFAULT_PAGE_SIZE
    cursor: str | None = None

    def __post_init__(self) -> None:
        resolve_sort(self.sort)
        if not isinstance(self.order, str) or self.order not in _ORDERS:
            raise ValueError("order must be asc or desc")
        if (
            not isinstance(self.limit, int)
            or isinstance(self.limit, bool)
            or not 1 <= self.limit <= MAX_PAGE_SIZE
        ):
            raise ValueError(f"limit must be an integer from 1 to {MAX_PAGE_SIZE}")


@dataclass(frozen=True)
class ClassificationPage:
    set: CurrentSet | None  # None when never classified
    never_classified: bool  # true exactly when set is None
    later: LaterSet | None  # the block Summary carries (DEC-0082)
    match_count: int  # over the whole filtered scope, never the page; 0 when never classified
    stocks: list[StockRow]
    unknown_symbols: list[str]  # compare only; [] on a list
    next_cursor: str | None


def _cursor_check(payload: dict[str, Any]) -> str:
    """A digest of every other field, so an altered cursor is refused rather than read as a
    different position (DEC-0246). It detects alteration; it is not a signature."""
    body = {k: v for k, v in payload.items() if k != "chk"}
    canonical = json.dumps(body, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(canonical.encode()).hexdigest()[:16]


def encode_cursor(
    set_id: UUID,
    sort: str,
    order: str,
    key: str | Decimal | None,
    key_is_null: bool,
    symbol: str,
) -> str:
    """The versioned, URL-safe position after the row with ``key`` and ``symbol``, bound to the
    set, sort and order it was issued for (design 2.5; the ``runs/queries.py`` wire format)."""
    payload: dict[str, Any] = {
        "v": _CURSOR_VERSION,
        "set": str(set_id),
        "sort": sort,
        "order": order,
        "key": None if key_is_null else str(key),
        "null": key_is_null,
        "sym": symbol,
    }
    payload["chk"] = _cursor_check(payload)
    text = json.dumps(payload, separators=(",", ":"))
    return base64.urlsafe_b64encode(text.encode()).decode().rstrip("=")


def decode_cursor(
    cursor: str, *, set_id: UUID, sort: str, order: str
) -> tuple[str | Decimal | None, bool, str]:
    """``(key, key_is_null, symbol)``; ``CursorError`` for anything malformed or altered, and for
    a cursor issued for another set, sort or order."""
    data, position = _parse_cursor(cursor, sort)
    if (data["set"], data["sort"], data["order"]) != (str(set_id), sort, order):
        raise CursorError("cursor was issued for another set, sort or order")
    return position


def _parse_cursor(
    cursor: str, sort: str
) -> tuple[dict[str, Any], tuple[str | Decimal | None, bool, str]]:
    """Every check but the binding to a set, sort and order, so a malformed cursor is refused
    before the set is read (design 2.7)."""
    if not cursor:
        raise CursorError("empty cursor")
    try:
        data = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
    except (ValueError, UnicodeDecodeError) as exc:
        raise CursorError(f"malformed cursor: {exc}") from exc
    if not isinstance(data, dict):
        raise CursorError("cursor payload is not a JSON object")
    version = data.get("v")
    if type(version) is not int or version != _CURSOR_VERSION:
        raise CursorError(f"unsupported cursor version {version!r}; expected {_CURSOR_VERSION}")
    if set(data) != _CURSOR_FIELDS:
        raise CursorError("cursor fields are not the expected ones")
    if data["chk"] != _cursor_check(data):
        raise CursorError("cursor was altered")
    key, key_is_null, symbol = data["key"], data["null"], data["sym"]
    if not isinstance(key_is_null, bool) or not isinstance(symbol, str):
        raise CursorError("cursor field error")
    if key_is_null:
        if key is not None or sort == "symbol":
            raise CursorError("cursor null key is inconsistent")
        return data, (None, True, symbol)
    if not isinstance(key, str):
        raise CursorError("cursor key is not a string")
    if sort == "symbol":
        return data, (key, False, symbol)
    try:
        number = Decimal(key)
    except InvalidOperation as exc:
        raise CursorError("cursor key is not a decimal") from exc
    if not number.is_finite():
        raise CursorError("cursor key is not a finite decimal")
    return data, (number, False, symbol)


def list_classifications(conn: psycopg.Connection, filters: ListFilters) -> ClassificationPage:
    """One page of the scored stocks in scope, sorted, filtered and counted (design 2.5, 2.7)."""
    sort_expr = resolve_sort(filters.sort)
    if filters.cursor is not None:
        _parse_cursor(filters.cursor, filters.sort)
    current, later = read_set_blocks(conn)
    if current is None:
        return ClassificationPage(
            set=None,
            never_classified=True,
            later=later,
            match_count=0,
            stocks=[],
            unknown_symbols=[],
            next_cursor=None,
        )
    position = (
        decode_cursor(filters.cursor, set_id=current.set_id, sort=filters.sort, order=filters.order)
        if filters.cursor is not None
        else None
    )
    member_ids = (
        _members_today(conn, filters.universe_id) if filters.universe_id is not None else None
    )
    match_count, stocks, keys = _run_list(
        conn,
        current.set_id,
        filters.thresholds,
        sort=filters.sort,
        sort_expr=sort_expr,
        order=filters.order,
        position=position,
        limit_plus_one=filters.limit + 1,
        member_ids=member_ids,
        symbols=filters.symbols,
    )
    next_cursor = None
    if len(stocks) > filters.limit:
        stocks = stocks[: filters.limit]
        key = keys[filters.limit - 1]
        next_cursor = encode_cursor(
            current.set_id, filters.sort, filters.order, key, key is None, stocks[-1].symbol
        )
    return ClassificationPage(
        set=current,
        never_classified=False,
        later=later,
        match_count=match_count,
        stocks=stocks,
        unknown_symbols=[],
        next_cursor=next_cursor,
    )


def evaluate_filter(conn: psycopg.Connection, set_id: UUID, thresholds: Thresholds) -> list[int]:
    """The instrument ids the unscoped list matches in ``set_id``, unpaginated, ordered by id;
    the same statement as the list, so it is the same predicate (DAC-E3-2)."""
    _, stocks, _ = _run_list(
        conn,
        set_id,
        thresholds,
        sort="symbol",
        sort_expr=SORT_ALLOWLIST["symbol"],
        order="asc",
        position=None,
        limit_plus_one=None,
        member_ids=None,
        symbols=None,
    )
    return sorted(row.instrument_id for row in stocks)


def _members_today(conn: psycopg.Connection, universe_id: UUID) -> list[int]:
    """The universe's members at the end of today (America/Chicago; DEC-0065), retired kept."""
    with conn.cursor() as cur:
        cur.execute(UNIVERSE_EXISTS_SQL, {"universe_id": universe_id})
        row = cur.fetchone()
        if row is None or not row[0]:
            raise UniverseNotFound(universe_id)
        today = datetime.now(_CHICAGO).date()
        cur.execute(MEMBERSHIP_AS_OF_SQL, {"universe_id": universe_id, "as_of": today})
        return [int(member[0]) for member in cur.fetchall()]


def _run_list(
    conn: psycopg.Connection,
    set_id: UUID,
    thresholds: Thresholds,
    *,
    sort: str,
    sort_expr: str,
    order: str,
    position: tuple[str | Decimal | None, bool, str] | None,
    limit_plus_one: int | None,
    member_ids: list[int] | None,
    symbols: list[str] | None,
) -> tuple[int, list[StockRow], list[Any]]:
    """Run the list statement once: the match count, the rows and each row's sort key."""
    params: dict[str, Any] = {name: thresholds.bounds.get(name) for name in _BOUNDS}
    params.update(
        set_id=set_id,
        scoped=member_ids is not None,
        member_ids=member_ids or [],
        symbol_pattern=(
            escape_like(thresholds.symbol) + "%" if thresholds.symbol is not None else None
        ),
        symbols=symbols,
        hide_incomplete=thresholds.hide_incomplete,
        input_reasons=list(INPUT_REASONS),
        limit_plus_one=limit_plus_one,
        k=None,
        ksym=None,
    )
    if position is None:
        keyset = _KEYSET_NONE
    else:
        key, key_is_null, last_symbol = position
        params.update(k=key, ksym=last_symbol)
        kind = "text" if sort == "symbol" else "numeric"
        keyset = _KEYSET_AFTER_NULL if key_is_null else _KEYSET_AFTER[(order, kind)]
    statement = LIST_SQL.format(
        sort_expr=sort_expr,
        order=_ORDERS[order],
        keyset=keyset.format(sort_expr=sort_expr),
    )
    with conn.cursor() as cur:
        cur.execute(statement, params)
        rows = cur.fetchall()
        names = [column.name for column in cur.description] if cur.description else []
    match_count = 0
    stocks: list[StockRow] = []
    keys: list[Any] = []
    sort_column = sort_expr.removeprefix("m.")
    for row in rows:
        columns = dict(zip(names, row, strict=True))
        match_count = int(columns["match_count"])
        if columns["instrument_id"] is None:  # the empty page's count-only row
            continue
        stocks.append(_row_to_stock(columns))
        keys.append(columns[sort_column])
    return match_count, stocks, keys


def _row_to_stock(c: dict[str, Any]) -> StockRow:
    return StockRow(
        instrument_id=int(c["instrument_id"]),
        symbol=str(c["symbol"]),
        name=c["name"],
        lifecycle=str(c["lifecycle"]),
        factors={f: _row_to_cell(c, f) for f in FACTORS},
    )


def _row_to_cell(c: dict[str, Any], factor: str) -> FactorCell:
    status = c[f"{factor}_status"]
    if status is None:  # the engine writes three rows per stock (task plan Open Gap 7)
        raise ValueError(f"instrument {c['instrument_id']} has no {factor} row in the set")
    return FactorCell(
        status=str(status),
        score=c[f"{factor}_score"],
        percentile=c[f"{factor}_percentile"],
        reason_code=c[f"{factor}_reason_code"],
        reason_input=c[f"{factor}_reason_input"],
        reason_detail=c[f"{factor}_reason_detail"],
        restated_possible=bool(c[f"{factor}_restated_possible"]),
    )


def _row_to_later(c: dict[str, Any]) -> LaterSet:
    return LaterSet(
        set_id=c["later_set_id"],
        state=str(c["later_state"]),
        run_id=c["later_run_id"],
        run_started_at=c["later_run_started_at"],
        started_at=c["later_started_at"],
        ended_at=c["later_ended_at"],
        failure_reason=c["later_failure_reason"],
    )


def _row_to_current(c: dict[str, Any], *, not_current: bool) -> CurrentSet:
    stored = c["factors"]
    return CurrentSet(
        set_id=c["set_id"],
        classification_date=c["classification_date"],
        run_id=c["run_id"],
        run_started_at=c["run_started_at"],
        run_outcome=str(c["run_outcome"]),
        state=str(c["state"]),
        started_at=c["started_at"],
        ended_at=c["ended_at"],
        latest_trading_day=c["latest_trading_day"],
        active_instruments=int(c["active_instruments"]),
        factors={
            f: FactorSummary(
                qualified_count=int(stored[f]["qualified_count"]),
                ranked=bool(stored[f]["ranked"]),
                min_peer_set_size=MIN_PEER_SET_SIZE,
            )
            for f in FACTORS
        },
        not_current=not_current,
    )
