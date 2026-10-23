"""Universe replay: membership, current state and the event history.

Implements ``component-design-universe-service.md`` sections 2.1, 2.3 and 2.5.
A universe's state is never stored: it is replayed from the append-only
``universe_event`` log by ``event_id``, at the ``recorded_on`` (America/Chicago)
grain (DEC-0065). The types and the paged reads live here, and
``service.py`` (CAP-002-E1-S3) re-exports and delegates to them (DEC-0093); the
universe page and the creation date follow DEC-0094.

This module issues no ``INSERT``, ``UPDATE`` or ``DELETE``. Satisfies AC-6,
AC-15, DAC-E1-8, DAC-E1-9 and DAC-E1-S2-1 through DAC-E1-S2-5
(CAP-002-E1-S2).
"""

import base64
import json
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any, Final
from uuid import UUID

import psycopg
from psycopg.rows import dict_row

from factorflow.api.bounds import MAX_PAGE_SIZE
from factorflow.runs.queries import CursorError

_SQL_DIR = Path(__file__).parent / "sql"
MEMBERSHIP_AS_OF_SQL: Final = (_SQL_DIR / "membership_as_of.sql").read_text()
_CURRENT_STATE_SQL: Final = (_SQL_DIR / "current_state.sql").read_text()
_EVENTS_PAGE_SQL: Final = (_SQL_DIR / "events_page.sql").read_text()
_LIST_UNIVERSES_SQL: Final = (_SQL_DIR / "list_universes.sql").read_text()

_LIFECYCLES: Final = frozenset({"active", "retired", "all"})
_CURSOR_VERSION: Final = 1
_MEMBER_EVENTS: Final = frozenset({"member_added", "member_removed"})


@dataclass(frozen=True)
class Member:
    instrument_id: int
    symbol: str
    lifecycle: str
    member_since: datetime


@dataclass(frozen=True)
class Origin:
    kind: str
    set_id: UUID | None
    classification_date: date | None
    thresholds: dict[str, Decimal] | None
    hide_incomplete: bool | None
    symbol: str | None


@dataclass(frozen=True)
class Universe:
    universe_id: UUID
    name: str
    lifecycle: str
    created_at: datetime
    retired_at: datetime | None
    members: list[Member]
    origin: Origin
    as_of: date
    as_of_before_creation: bool
    created_on: date | None = None


@dataclass(frozen=True)
class UniverseEvent:
    event_id: int
    event_type: str
    name: str | None
    symbol: str | None
    recorded_at: datetime
    recorded_on: date
    filter_provenance: dict[str, Any] | None = None


@dataclass(frozen=True)
class ReplayEvent:
    """One ``universe_event`` row as ``fold_members`` reads it."""

    event_id: int
    event_type: str
    instrument_id: int | None
    recorded_at: datetime
    recorded_on: date


@dataclass(frozen=True)
class UniverseRow:
    universe_id: UUID
    name: str
    lifecycle: str
    created_at: datetime
    retired_at: datetime | None


def fold_members(events: Iterable[ReplayEvent], as_of: date) -> dict[int, datetime]:
    """Members as of ``as_of``: ``instrument_id`` to the selected add's ``recorded_at``.

    Per instrument the highest ``event_id`` among the member events recorded on
    or before ``as_of`` decides; the instrument is a member iff it is a
    ``member_added``. This is the pure statement of ``membership_as_of.sql``.
    """
    latest: dict[int, ReplayEvent] = {}
    for event in events:
        if event.event_type not in _MEMBER_EVENTS or event.recorded_on > as_of:
            continue
        if event.instrument_id is None:
            continue
        seen = latest.get(event.instrument_id)
        if seen is None or event.event_id > seen.event_id:
            latest[event.instrument_id] = event
    return {
        instrument_id: event.recorded_at
        for instrument_id, event in latest.items()
        if event.event_type == "member_added"
    }


def origin_from_provenance(provenance: dict[str, Any] | None) -> Origin:
    """The typed ``Origin`` of a ``created`` event's ``filter_provenance``."""
    if provenance is None:
        return Origin("by_hand", None, None, None, None, None)
    raw_thresholds = provenance.get("thresholds")
    return Origin(
        kind="from_filter",
        set_id=UUID(provenance["set_id"]),
        classification_date=date.fromisoformat(provenance["classification_date"]),
        thresholds=(
            None
            if raw_thresholds is None
            else {name: Decimal(str(value)) for name, value in raw_thresholds.items()}
        ),
        hide_incomplete=provenance.get("hide_incomplete"),
        symbol=provenance.get("symbol"),
    )


def _encode(payload: dict[str, Any]) -> str:
    raw = json.dumps({"v": _CURSOR_VERSION, **payload}, separators=(",", ":"))
    return base64.urlsafe_b64encode(raw.encode()).decode().rstrip("=")


def _decode(cursor: str) -> dict[str, Any]:
    if not cursor:
        raise CursorError("empty cursor")
    try:
        data = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
    except Exception as exc:
        raise CursorError(f"malformed cursor: {exc}") from exc
    if not isinstance(data, dict):
        raise CursorError("cursor payload is not a JSON object")
    if data.get("v") != _CURSOR_VERSION:
        raise CursorError(
            f"unsupported cursor version {data.get('v')!r}; expected {_CURSOR_VERSION}"
        )
    return data


def encode_event_cursor(event_id: int) -> str:
    """Encode the last ``event_id`` of a page as a versioned URL-safe cursor."""
    return _encode({"id": event_id})


def decode_event_cursor(cursor: str) -> int:
    data = _decode(cursor)
    event_id = data.get("id")
    if isinstance(event_id, bool) or not isinstance(event_id, int):
        raise CursorError("cursor field error: id must be an integer")
    return event_id


def encode_universe_cursor(created_at: datetime, universe_id: UUID) -> str:
    """Encode a ``(created_at, universe_id)`` keyset cursor."""
    return _encode({"ts": created_at.isoformat(), "id": str(universe_id)})


def decode_universe_cursor(cursor: str) -> tuple[datetime, UUID]:
    data = _decode(cursor)
    try:
        return datetime.fromisoformat(data["ts"]), UUID(data["id"])
    except (AttributeError, KeyError, TypeError, ValueError) as exc:
        raise CursorError(f"cursor field error: {exc}") from exc


def _check_limit(limit: int) -> None:
    if not 1 <= limit <= MAX_PAGE_SIZE:
        raise ValueError(f"limit must be between 1 and {MAX_PAGE_SIZE}, got {limit}")


def membership_as_of(conn: psycopg.Connection, universe_id: UUID, as_of: date) -> list[Member]:
    """Members at the end of ``as_of`` (America/Chicago), ordered by symbol (AC-6, AC-15).

    A retired instrument stays a member and replays with ``lifecycle: retired``.
    """
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(MEMBERSHIP_AS_OF_SQL, {"universe_id": universe_id, "as_of": as_of})
        return [Member(**row) for row in cur.fetchall()]


def current_state(
    conn: psycopg.Connection, universe_id: UUID, as_of: date | None = None
) -> Universe | None:
    """The universe replayed as of ``as_of`` (default today), or ``None`` if unknown.

    ``name`` and ``lifecycle`` are the current ones whatever ``as_of`` is; only
    the members vary with it. A date before the ``created`` event returns no
    members, ``as_of_before_creation`` and the creation date (DAC-E1-8).
    """
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(_CURRENT_STATE_SQL, {"universe_id": universe_id})
        row = cur.fetchone()
    if row is None:
        return None
    effective: date = as_of if as_of is not None else row["today"]
    created_on: date = row["created_on"]
    before_creation = effective < created_on
    return Universe(
        universe_id=universe_id,
        name=row["name"],
        lifecycle="retired" if row["retired_at"] is not None else "active",
        created_at=row["created_at"],
        retired_at=row["retired_at"],
        members=[] if before_creation else membership_as_of(conn, universe_id, effective),
        origin=origin_from_provenance(row["filter_provenance"]),
        as_of=effective,
        as_of_before_creation=before_creation,
        created_on=created_on,
    )


def list_events(
    conn: psycopg.Connection, universe_id: UUID, limit: int, cursor: str | None
) -> tuple[list[UniverseEvent], str | None]:
    """One page of events by ``event_id DESC`` and the cursor for the next, if any."""
    _check_limit(limit)
    before = None if cursor is None else decode_event_cursor(cursor)
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            _EVENTS_PAGE_SQL,
            {"universe_id": universe_id, "before_event_id": before, "limit": limit + 1},
        )
        rows = cur.fetchall()
    events = [UniverseEvent(**row) for row in rows[:limit]]
    next_cursor = encode_event_cursor(events[-1].event_id) if len(rows) > limit else None
    return events, next_cursor


def list_universe_rows(
    conn: psycopg.Connection,
    lifecycle: str,
    name_prefix: str | None,
    limit: int,
    cursor: str | None,
) -> tuple[list[UniverseRow], str | None]:
    """One page of universes, newest first, and the cursor for the next, if any."""
    if lifecycle not in _LIFECYCLES:
        raise ValueError(f"lifecycle must be one of {sorted(_LIFECYCLES)}, got {lifecycle!r}")
    _check_limit(limit)
    after_created_at, after_universe_id = (
        (None, None) if cursor is None else decode_universe_cursor(cursor)
    )
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            _LIST_UNIVERSES_SQL,
            {
                "lifecycle": lifecycle,
                "name_prefix": name_prefix,
                "after_created_at": after_created_at,
                "after_universe_id": after_universe_id,
                "limit": limit + 1,
            },
        )
        rows = cur.fetchall()
    page = [UniverseRow(**row) for row in rows[:limit]]
    last = page[-1] if page else None
    next_cursor = (
        encode_universe_cursor(last.created_at, last.universe_id)
        if last is not None and len(rows) > limit
        else None
    )
    return page, next_cursor
