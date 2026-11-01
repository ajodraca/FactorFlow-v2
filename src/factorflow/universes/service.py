"""Universe service: create by hand, add members, the maintenance writes and the reads.

Implements ``component-design-universe-service.md`` sections 2.3, 2.4, 2.5 and
3. A universe is an append-only event log; every write runs in one transaction,
takes the universe write lock first (DEC-0065) so two concurrent creates cannot
both find a name free, checks by replay, appends events and returns the replayed
state. The caller commits. This module issues ``INSERT`` only (DEC-0057). The
replayed types and the paged reads live in ``replay.py`` and are re-exported or
delegated to here (DEC-0093); the name check and the coverage rule follow
DEC-0064 and DEC-0057.

``rename``, ``remove_member`` and ``retire`` (CAP-002-E1-S4, design 2.3 and
2.4, DAC-E1-7) each append exactly one event under the same lock, after the
target is found active.

Satisfies AC-1, AC-3, AC-5, AC-15, DAC-E1-1, DAC-E1-4, DAC-E1-5, DAC-E1-6,
DAC-E1-9 and DAC-E1-S3-1 through DAC-E1-S3-8 (CAP-002-E1-S3), and AC-4, AC-5,
AC-6, DAC-E1-4, DAC-E1-7, DAC-E1-10 and DAC-E1-S4-1 through DAC-E1-S4-7
(CAP-002-E1-S4).

``create_from_filter`` (CAP-002-E1-S5; design 2.3, 2.4) snapshots a reviewed filter
result: inside the write transaction it refuses a set that is no longer the current
complete one, calls the reader's ``evaluate_filter`` with the owner's ``Thresholds``
(the list's own predicate, DEC-0076, DEC-0085) and records ``filter_provenance`` on the
``created`` event, its bounds encoded per DEC-0248. Satisfies AC-2, AC-5, DAC-E1-2,
DAC-E1-3 and DAC-E1-S5-1 through DAC-E1-S5-6.
"""

import json
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any, Final
from uuid import UUID

import psycopg
from psycopg.types.json import Jsonb

from factorflow.api.bounds import MAX_PAGE_SIZE, MAX_SYMBOLS_PER_REQUEST
from factorflow.classification.reader import Thresholds, current_set, evaluate_filter
from factorflow.instruments.symbols import is_valid, normalise
from factorflow.universes import replay
from factorflow.universes.replay import Member, Origin, Universe, UniverseEvent

__all__ = [
    "COVERAGE_CHECK_SQL",
    "UNIVERSE_WRITE_LOCK_KEY",
    "ClassificationSetChanged",
    "EmptyUniverse",
    "InstrumentNotAcquired",
    "LastMember",
    "Member",
    "NotAMember",
    "Origin",
    "Universe",
    "UniverseEvent",
    "UniverseNameInUse",
    "UniverseNotFound",
    "UniverseRetired",
    "create_from_filter",
    "remove_member",
    "rename",
    "retire",
]

UNIVERSE_WRITE_LOCK_KEY: Final = 2002_0001  # one key for every universe write (DEC-0065)

_SQL_DIR = Path(__file__).parent / "sql"
COVERAGE_CHECK_SQL: Final = (_SQL_DIR / "coverage_check.sql").read_text()
_LOCK_SQL: Final = "SELECT pg_advisory_xact_lock(%s)"
_INSERT_UNIVERSE_SQL: Final = "INSERT INTO universe DEFAULT VALUES RETURNING universe_id"
_INSERT_EVENT_SQL: Final = (
    "INSERT INTO universe_event (universe_id, event_type, instrument_id, name, filter_provenance) "
    "VALUES (%(universe_id)s, %(event_type)s, %(instrument_id)s, %(name)s, %(filter_provenance)s)"
)
_INSERT_MEMBER_REMOVED_SQL: Final = (
    "INSERT INTO universe_event (universe_id, event_type, instrument_id) "
    "VALUES (%(universe_id)s, 'member_removed', %(instrument_id)s) RETURNING recorded_at"
)
_INSTRUMENTS_BY_SYMBOL_SQL: Final = (
    "SELECT instrument_id, symbol FROM instrument WHERE symbol = ANY(%(symbols)s)"
)
_INSTRUMENTS_BY_ID_SQL: Final = (
    "SELECT instrument_id, symbol FROM instrument "
    "WHERE instrument_id = ANY(%(instrument_ids)s) ORDER BY symbol"
)


class UniverseNotFound(LookupError):
    """No universe has this id."""


class UniverseRetired(ValueError):
    """The universe is retired and takes no further change."""


class UniverseNameInUse(ValueError):
    """Another active universe already holds this name."""


class EmptyUniverse(ValueError):
    """A universe must have at least one member."""


class LastMember(ValueError):
    """The member is the universe's last and cannot be removed."""


class NotAMember(LookupError):
    """The instrument is not a current member of the universe."""


class InstrumentNotAcquired(ValueError):
    """One or more requested symbols have no coverage; ``symbols`` names every one, sorted."""

    def __init__(self, symbols: list[str]) -> None:
        self.symbols = sorted(symbols)
        super().__init__("instruments not acquired: " + ", ".join(self.symbols))


class ClassificationSetChanged(ValueError):
    """The requested classification set is no longer the current complete one."""

    def __init__(self, requested_set_id: UUID, current_set_id: UUID | None) -> None:
        self.requested_set_id = requested_set_id
        self.current_set_id = current_set_id
        super().__init__(
            f"classification set {requested_set_id} is not the current set ({current_set_id})"
        )


def _normalise_name(name: str) -> str:
    """The trimmed name; empty after trimming is a shape failure. No length bound exists."""
    trimmed = name.strip()
    if not trimmed:
        raise ValueError("universe name must not be empty")
    return trimmed


def _normalise_symbols(symbols: list[str]) -> list[str]:
    """Distinct upper-case symbols in ascending order; refuses an oversize or malformed request.

    The cap is re-checked here, on the raw list, so a direct caller cannot bypass
    the API's check (design section 3).
    """
    if len(symbols) > MAX_SYMBOLS_PER_REQUEST:
        raise ValueError(
            f"at most {MAX_SYMBOLS_PER_REQUEST} symbols per request, got {len(symbols)}"
        )
    normalised = [normalise(raw) for raw in symbols]
    for symbol in normalised:
        if not is_valid(symbol):
            raise ValueError(f"invalid symbol {symbol!r}")
    return sorted(set(normalised))


def _take_lock(conn: psycopg.Connection) -> None:
    """Serialise universe writes: the first statement of every write (DEC-0065)."""
    conn.execute(_LOCK_SQL, (UNIVERSE_WRITE_LOCK_KEY,))


def _name_in_use(conn: psycopg.Connection, name: str, *, excluding: UUID | None = None) -> bool:
    """Whether an active universe other than ``excluding`` currently holds exactly ``name``.

    Decided by replay (DEC-0065): the prefix filter is ``list_universe_rows``'s,
    the equality is exact after trimming.
    """
    cursor: str | None = None
    while True:
        rows, cursor = replay.list_universe_rows(conn, "active", name, MAX_PAGE_SIZE, cursor)
        if any(row.name == name and row.universe_id != excluding for row in rows):
            return True
        if cursor is None:
            return False


def _uncovered(conn: psycopg.Connection, symbols: list[str]) -> list[str]:
    """Every symbol with no instrument or no coverage segment, sorted (DEC-0057)."""
    if not symbols:
        return []
    rows = conn.execute(COVERAGE_CHECK_SQL, {"symbols": symbols}).fetchall()
    return sorted(row[0] for row in rows)


def _event_row(
    universe_id: UUID, event_type: str, *, instrument_id: int | None = None, name: str | None = None
) -> dict[str, Any]:
    """One parameter dict for ``_INSERT_EVENT_SQL``; ``filter_provenance`` is S5's."""
    return {
        "universe_id": universe_id,
        "event_type": event_type,
        "instrument_id": instrument_id,
        "name": name,
        "filter_provenance": None,
    }


def _json_default(value: object) -> object:
    """``json.dumps`` hook for a bound: an integral ``Decimal`` as an int, any other as a float.

    The owner's decision DEC-0248; ``replay.origin_from_provenance`` reads each bound back
    as ``Decimal(str(value))``. Anything that is not a ``Decimal`` is refused.
    """
    if isinstance(value, Decimal):
        if value == value.to_integral_value():
            return int(value)
        return float(value)
    raise TypeError(f"{type(value).__name__} is not JSON serialisable")


def _dump_json(obj: Any) -> str:
    """The ``dumps`` the ``filter_provenance`` ``Jsonb`` parameter is written with."""
    return json.dumps(obj, default=_json_default)


def _filter_provenance(
    set_id: UUID, classification_date: date, thresholds: Thresholds
) -> dict[str, Any]:
    """The ``created`` event's ``filter_provenance``: the filter as evaluated (design 2.4).

    Only the bounds that were set, under the query-parameter names the reader keys them by;
    ``hide_incomplete`` always; ``symbol`` None without a search (DAC-E1-3).
    """
    return {
        "set_id": str(set_id),
        "classification_date": classification_date.isoformat(),
        "thresholds": dict(thresholds.bounds),
        "hide_incomplete": thresholds.hide_incomplete,
        "symbol": thresholds.symbol,
    }


def _instrument_ids(conn: psycopg.Connection, symbols: list[str]) -> dict[str, int]:
    rows = conn.execute(_INSTRUMENTS_BY_SYMBOL_SQL, {"symbols": symbols}).fetchall()
    return {row[1]: int(row[0]) for row in rows}


def _require_active(conn: psycopg.Connection, universe_id: UUID) -> Universe:
    """The current state of an existing, active universe (else NotFound or Retired)."""
    universe = _replayed(conn, universe_id)
    if universe.lifecycle == "retired":
        raise UniverseRetired(f"universe {universe_id} is retired")
    return universe


def _replayed(conn: psycopg.Connection, universe_id: UUID) -> Universe:
    universe = replay.current_state(conn, universe_id)
    if universe is None:
        raise UniverseNotFound(str(universe_id))
    return universe


def create_by_hand(conn: psycopg.Connection, name: str, symbols: list[str]) -> Universe:
    """Create a universe from covered stocks: one ``created`` and one ``member_added`` each.

    Refuses the whole request on any uncovered symbol, naming all of them, and an
    empty one; nothing is written on a refusal because the transaction block exits
    by exception. The caller commits.
    """
    with conn.transaction():
        _take_lock(conn)
        clean_name = _normalise_name(name)
        clean_symbols = _normalise_symbols(symbols)
        uncovered = _uncovered(conn, clean_symbols)
        if uncovered:
            raise InstrumentNotAcquired(uncovered)
        if _name_in_use(conn, clean_name):
            raise UniverseNameInUse(f"an active universe is already named {clean_name!r}")
        if not clean_symbols:
            raise EmptyUniverse("a universe needs at least one member")
        row = conn.execute(_INSERT_UNIVERSE_SQL).fetchone()
        if row is None:
            raise RuntimeError("INSERT INTO universe returned no row")
        universe_id: UUID = row[0]
        instrument_ids = _instrument_ids(conn, clean_symbols)
        events = [_event_row(universe_id, "created", name=clean_name)]
        events += [
            _event_row(universe_id, "member_added", instrument_id=instrument_ids[symbol])
            for symbol in clean_symbols
        ]
        with conn.cursor() as cur:
            cur.executemany(_INSERT_EVENT_SQL, events)
        return _replayed(conn, universe_id)


def create_from_filter(
    conn: psycopg.Connection, name: str, set_id: UUID, thresholds: Thresholds
) -> Universe:
    """Save a reviewed filter result as a universe: ``created`` with provenance, then members.

    Design 2.4: the lock first; the name's shape; ``set_id`` must still be the current
    complete set (else ``ClassificationSetChanged``, a later building or failed set does not
    count); the members are exactly ``evaluate_filter``'s result for that set (else
    ``EmptyUniverse`` when it is empty, before the name check); an active universe holding
    the name refuses with ``UniverseNameInUse``. No coverage check: the members are the
    reviewed result (task plan, Resolved Conflicts). Members are written in symbol order.
    Nothing is written on a refusal; the caller commits.
    """
    with conn.transaction():
        _take_lock(conn)
        clean_name = _normalise_name(name)
        current = current_set(conn)
        if current is None or current.set_id != set_id:
            raise ClassificationSetChanged(set_id, None if current is None else current.set_id)
        instrument_ids = evaluate_filter(conn, set_id, thresholds)
        if not instrument_ids:
            raise EmptyUniverse("the filter matches no stock")
        if _name_in_use(conn, clean_name):
            raise UniverseNameInUse(f"an active universe is already named {clean_name!r}")
        members = conn.execute(
            _INSTRUMENTS_BY_ID_SQL, {"instrument_ids": sorted(set(instrument_ids))}
        ).fetchall()
        row = conn.execute(_INSERT_UNIVERSE_SQL).fetchone()
        if row is None:
            raise RuntimeError("INSERT INTO universe returned no row")
        universe_id: UUID = row[0]
        created = _event_row(universe_id, "created", name=clean_name)
        created["filter_provenance"] = Jsonb(
            _filter_provenance(set_id, current.classification_date, thresholds),
            dumps=_dump_json,
        )
        events = [created]
        events += [
            _event_row(universe_id, "member_added", instrument_id=int(member[0]))
            for member in members
        ]
        with conn.cursor() as cur:
            cur.executemany(_INSERT_EVENT_SQL, events)
        return _replayed(conn, universe_id)


def get_universe(
    conn: psycopg.Connection, universe_id: UUID, as_of: date | None = None
) -> Universe:
    """The universe replayed as of ``as_of`` (default today); a read, so no lock."""
    universe = replay.current_state(conn, universe_id, as_of)
    if universe is None:
        raise UniverseNotFound(str(universe_id))
    return universe


def add_members(
    conn: psycopg.Connection, universe_id: UUID, symbols: list[str]
) -> tuple[list[str], list[str]]:
    """Add covered stocks to an active universe: ``(added, already_member)``, both ascending.

    Coverage is checked before the target (design 2.4 steps 4 and 5), so a request
    that is both uncovered and aimed at an unknown universe reports the coverage.
    A current member appends no event. An empty list is a no-op (DEC-0095).
    """
    with conn.transaction():
        _take_lock(conn)
        clean_symbols = _normalise_symbols(symbols)
        uncovered = _uncovered(conn, clean_symbols)
        if uncovered:
            raise InstrumentNotAcquired(uncovered)
        universe = _require_active(conn, universe_id)
        current = {member.symbol for member in universe.members}
        added = [symbol for symbol in clean_symbols if symbol not in current]
        already_member = [symbol for symbol in clean_symbols if symbol in current]
        if added:
            instrument_ids = _instrument_ids(conn, added)
            events = [
                _event_row(universe_id, "member_added", instrument_id=instrument_ids[symbol])
                for symbol in added
            ]
            with conn.cursor() as cur:
                cur.executemany(_INSERT_EVENT_SQL, events)
        return added, already_member


def rename(conn: psycopg.Connection, universe_id: UUID, name: str) -> Universe:
    """Rename an active universe: one ``renamed`` event; id, history and members unchanged.

    The name must be free among the other active universes after trimming. Its
    own current name is not refused and appends an event (DEC-0096).
    """
    with conn.transaction():
        _take_lock(conn)
        new_name = _normalise_name(name)
        _require_active(conn, universe_id)
        if _name_in_use(conn, new_name, excluding=universe_id):
            raise UniverseNameInUse(f"an active universe is already named {new_name!r}")
        conn.execute(_INSERT_EVENT_SQL, _event_row(universe_id, "renamed", name=new_name))
        return get_universe(conn, universe_id)


def remove_member(conn: psycopg.Connection, universe_id: UUID, symbol: str) -> datetime:
    """Remove a current member: one ``member_removed`` event; returns its ``recorded_at``.

    Removal does not consult coverage. A symbol that is not a current member is
    ``NotAMember``; the sole remaining member is ``LastMember``, which offers
    retirement instead. Membership is checked first, so ``LastMember`` is raised
    only when the removal would leave the universe empty.
    """
    with conn.transaction():
        _take_lock(conn)
        [clean_symbol] = _normalise_symbols([symbol])
        universe = _require_active(conn, universe_id)
        member = next((m for m in universe.members if m.symbol == clean_symbol), None)
        if member is None:
            raise NotAMember(f"{clean_symbol} is not a current member of universe {universe_id}")
        if len(universe.members) == 1:
            raise LastMember(
                f"cannot remove {clean_symbol}, the last member; retire the universe instead"
            )
        row = conn.execute(
            _INSERT_MEMBER_REMOVED_SQL,
            {"universe_id": universe_id, "instrument_id": member.instrument_id},
        ).fetchone()
        if row is None:
            raise RuntimeError("INSERT INTO universe_event returned no row")
        removed_at: datetime = row[0]
        return removed_at


def retire(conn: psycopg.Connection, universe_id: UUID) -> Universe:
    """Retire an active universe: one ``retired`` event; members and history stay readable."""
    with conn.transaction():
        _take_lock(conn)
        _require_active(conn, universe_id)
        conn.execute(_INSERT_EVENT_SQL, _event_row(universe_id, "retired"))
        return get_universe(conn, universe_id)


def list_universes(
    conn: psycopg.Connection,
    lifecycle: str,
    name_prefix: str | None,
    limit: int,
    cursor: str | None,
) -> tuple[list[Universe], str | None]:
    """One page of universes, newest first, each replayed; validation is ``replay``'s."""
    rows, next_cursor = replay.list_universe_rows(conn, lifecycle, name_prefix, limit, cursor)
    return [_replayed(conn, row.universe_id) for row in rows], next_cursor


def list_events(
    conn: psycopg.Connection, universe_id: UUID, limit: int, cursor: str | None
) -> tuple[list[UniverseEvent], str | None]:
    """One page of a universe's events, newest first; an unknown universe is refused."""
    _replayed(conn, universe_id)
    return replay.list_events(conn, universe_id, limit, cursor)
