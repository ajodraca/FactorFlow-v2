"""Universe replay against PostgreSQL: membership as of a date, state and history.

Events are inserted directly so each test controls ``recorded_on`` and
``recorded_at``; that is test setup against a throwaway database and never an
``UPDATE`` or ``DELETE``. Satisfies AC-6, AC-15, DAC-E1-8, DAC-E1-9 and
DAC-E1-S2-1 through DAC-E1-S2-4.
"""

from collections.abc import Iterator
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest
from psycopg.types.json import Jsonb

from factorflow.api.bounds import MAX_PAGE_SIZE
from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover
from factorflow.runs.queries import CursorError
from factorflow.universes import replay
from factorflow.universes.replay import ReplayEvent, fold_members

pytestmark = pytest.mark.postgres

D1 = date(2026, 10, 1)
D2 = D1 + timedelta(days=1)
D3 = D1 + timedelta(days=2)
D4 = D1 + timedelta(days=3)


@pytest.fixture
def conn(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    """A connection to a store migrated through 0005 (versions 1 to 5 only)."""
    connection = psycopg.connect(postgres_connection_string)
    try:
        files = [f for f in discover(MIGRATIONS_DIR) if f.version <= 5]
        assert apply_pending(connection, files) == [1, 2, 3, 4, 5]
        connection.commit()
        yield connection
    finally:
        connection.close()


def _at(day: date, hour: int = 12) -> datetime:
    return datetime(day.year, day.month, day.day, hour, tzinfo=UTC)


def _instrument(conn: psycopg.Connection, symbol: str, lifecycle: str = "active") -> int:
    retired_at = _at(D1 - timedelta(days=30)) if lifecycle == "retired" else None
    row = conn.execute(
        "INSERT INTO instrument (symbol, lifecycle, retired_at) VALUES (%s, %s, %s) "
        "RETURNING instrument_id",
        (symbol, lifecycle, retired_at),
    ).fetchone()
    assert row is not None
    return int(row[0])


def _universe(conn: psycopg.Connection) -> UUID:
    row = conn.execute("INSERT INTO universe DEFAULT VALUES RETURNING universe_id").fetchone()
    assert row is not None
    universe_id = row[0]
    assert isinstance(universe_id, UUID)
    return universe_id


def _event(
    conn: psycopg.Connection,
    universe_id: UUID,
    event_type: str,
    day: date,
    *,
    instrument_id: int | None = None,
    name: str | None = None,
    provenance: dict[str, Any] | None = None,
    at: datetime | None = None,
) -> int:
    row = conn.execute(
        "INSERT INTO universe_event (universe_id, event_type, instrument_id, name, "
        "filter_provenance, recorded_at, recorded_on) VALUES (%s, %s, %s, %s, %s, %s, %s) "
        "RETURNING event_id",
        (
            universe_id,
            event_type,
            instrument_id,
            name,
            None if provenance is None else Jsonb(provenance),
            at or _at(day),
            day,
        ),
    ).fetchone()
    assert row is not None
    return int(row[0])


def _created(conn: psycopg.Connection, day: date, name: str = "Tech", **kw: Any) -> UUID:
    universe_id = _universe(conn)
    _event(conn, universe_id, "created", day, name=name, **kw)
    return universe_id


def _replay_events(conn: psycopg.Connection, universe_id: UUID) -> list[ReplayEvent]:
    rows = conn.execute(
        "SELECT event_id, event_type, instrument_id, recorded_at, recorded_on "
        "FROM universe_event WHERE universe_id = %s",
        (universe_id,),
    ).fetchall()
    return [ReplayEvent(*row) for row in rows]


def _members(conn: psycopg.Connection, universe_id: UUID, as_of: date) -> dict[str, str]:
    return {m.symbol: m.lifecycle for m in replay.membership_as_of(conn, universe_id, as_of)}


# Implements TC-COMP-049
def test_sql_and_the_pure_fold_agree_on_every_date_of_a_scripted_history(
    conn: psycopg.Connection,
) -> None:
    aa, bb, cc = _instrument(conn, "AA"), _instrument(conn, "BB"), _instrument(conn, "CC")
    universe_id = _created(conn, D1)
    _event(conn, universe_id, "member_added", D1, instrument_id=aa)
    _event(conn, universe_id, "member_added", D1, instrument_id=bb)
    _event(conn, universe_id, "member_removed", D2, instrument_id=bb)
    _event(conn, universe_id, "member_added", D2, instrument_id=cc)
    _event(conn, universe_id, "member_removed", D3, instrument_id=cc)
    _event(conn, universe_id, "member_added", D3, instrument_id=cc)
    _event(conn, universe_id, "member_added", D4, instrument_id=bb)
    _event(conn, universe_id, "member_removed", D4, instrument_id=bb)
    events = _replay_events(conn, universe_id)

    for offset in range(-1, 6):
        as_of = D1 + timedelta(days=offset)
        sql = {
            m.instrument_id: m.member_since
            for m in replay.membership_as_of(conn, universe_id, as_of)
        }
        assert sql == fold_members(events, as_of), as_of
    assert _members(conn, universe_id, D2) == {"AA": "active", "CC": "active"}
    assert _members(conn, universe_id, D4) == {"AA": "active", "CC": "active"}


# Implements TC-COMP-049
def test_a_stock_added_and_removed_on_one_date_is_not_a_member_that_day(
    conn: psycopg.Connection,
) -> None:
    aa, bb = _instrument(conn, "AA"), _instrument(conn, "BB")
    universe_id = _created(conn, D1)
    _event(conn, universe_id, "member_added", D2, instrument_id=aa)
    _event(conn, universe_id, "member_removed", D2, instrument_id=aa)
    _event(conn, universe_id, "member_added", D2, instrument_id=bb)

    assert _members(conn, universe_id, D2) == {"BB": "active"}
    assert _members(conn, universe_id, D3) == {"BB": "active"}
    assert _members(conn, universe_id, D1) == {}


# Implements TC-COMP-050
def test_a_date_before_creation_has_no_members_and_names_the_creation_date(
    conn: psycopg.Connection,
) -> None:
    aa = _instrument(conn, "AA")
    universe_id = _created(conn, D1)
    _event(conn, universe_id, "member_added", D1, instrument_id=aa)

    before = replay.current_state(conn, universe_id, as_of=D1 - timedelta(days=1))
    on_creation = replay.current_state(conn, universe_id, as_of=D1)

    assert before is not None and on_creation is not None
    assert before.members == []
    assert before.as_of_before_creation is True
    assert before.created_on == D1
    assert before.as_of == D1 - timedelta(days=1)
    assert on_creation.as_of_before_creation is False
    assert [m.symbol for m in on_creation.members] == ["AA"]


# Implements TC-COMP-117
def test_a_retired_instrument_stays_a_member_and_replays_as_retired(
    conn: psycopg.Connection,
) -> None:
    live, retired = _instrument(conn, "AA"), _instrument(conn, "ZZ", "retired")
    universe_id = _created(conn, D1)
    _event(conn, universe_id, "member_added", D1, instrument_id=live)
    _event(conn, universe_id, "member_added", D2, instrument_id=retired)

    assert _members(conn, universe_id, D2) == {"AA": "active", "ZZ": "retired"}
    assert _members(conn, universe_id, D3) == {"AA": "active", "ZZ": "retired"}
    assert _members(conn, universe_id, D1) == {"AA": "active"}
    current = replay.current_state(conn, universe_id)
    assert current is not None
    assert {m.symbol: m.lifecycle for m in current.members} == {"AA": "active", "ZZ": "retired"}


# Implements TC-COMP-049
def test_a_retired_universe_keeps_its_members_and_reports_when_it_retired(
    conn: psycopg.Connection,
) -> None:
    aa = _instrument(conn, "AA")
    universe_id = _created(conn, D1)
    _event(conn, universe_id, "member_added", D1, instrument_id=aa)
    _event(conn, universe_id, "retired", D3, at=_at(D3, 8))

    past = replay.current_state(conn, universe_id, as_of=D2)
    current = replay.current_state(conn, universe_id)

    assert past is not None and current is not None
    assert [m.symbol for m in past.members] == ["AA"]
    assert [m.symbol for m in current.members] == ["AA"]
    assert past.lifecycle == "retired" and current.lifecycle == "retired"
    assert past.retired_at == _at(D3, 8)


def test_an_active_universe_has_no_retired_at(conn: psycopg.Connection) -> None:
    universe_id = _created(conn, D1)

    state = replay.current_state(conn, universe_id, as_of=D1)

    assert state is not None
    assert state.lifecycle == "active"
    assert state.retired_at is None


# Implements TC-COMP-049
def test_current_membership_uses_todays_america_chicago_date(conn: psycopg.Connection) -> None:
    aa, bb = _instrument(conn, "AA"), _instrument(conn, "BB")
    row = conn.execute("SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date").fetchone()
    assert row is not None
    today = row[0]
    universe_id = _created(conn, today - timedelta(days=3))
    _event(conn, universe_id, "member_added", today, instrument_id=aa)
    _event(conn, universe_id, "member_added", today + timedelta(days=1), instrument_id=bb)

    state = replay.current_state(conn, universe_id)

    assert state is not None
    assert state.as_of == today
    assert [m.symbol for m in state.members] == ["AA"]
    assert state.as_of_before_creation is False


def test_an_unknown_universe_has_no_state(conn: psycopg.Connection) -> None:
    assert replay.current_state(conn, UUID(int=7)) is None
    assert replay.current_state(conn, UUID(int=7), as_of=D1) is None


def test_the_name_is_the_latest_rename_whatever_the_as_of(conn: psycopg.Connection) -> None:
    universe_id = _created(conn, D1, name="Tech")
    _event(conn, universe_id, "renamed", D2, name="Technology")
    _event(conn, universe_id, "renamed", D3, name="Tech 100")

    for as_of in (D1, D2, D4):
        state = replay.current_state(conn, universe_id, as_of=as_of)
        assert state is not None
        assert state.name == "Tech 100"
    state = replay.current_state(conn, universe_id, as_of=D1)
    assert state is not None and state.created_at == _at(D1)


def test_a_filter_provenance_reads_back_as_a_typed_origin(conn: psycopg.Connection) -> None:
    provenance = {
        "set_id": "6f1c2a54-0000-4000-8000-00000000abcd",
        "classification_date": "2026-10-15",
        "thresholds": {"value_percentile_min": 80, "momentum_score_min": 0.5},
        "hide_incomplete": True,
        "symbol": None,
    }
    saved = _created(conn, D1, provenance=provenance)
    by_hand = _created(conn, D1, name="Hand")

    from_filter = replay.current_state(conn, saved, as_of=D1)
    hand = replay.current_state(conn, by_hand, as_of=D1)

    assert from_filter is not None and hand is not None
    assert from_filter.origin == replay.Origin(
        kind="from_filter",
        set_id=UUID("6f1c2a54-0000-4000-8000-00000000abcd"),
        classification_date=date(2026, 10, 15),
        thresholds={"value_percentile_min": Decimal("80"), "momentum_score_min": Decimal("0.5")},
        hide_incomplete=True,
        symbol=None,
    )
    assert hand.origin == replay.Origin("by_hand", None, None, None, None, None)
    with_prefix = _created(conn, D1, name="AA only", provenance={**provenance, "symbol": "AA"})
    state = replay.current_state(conn, with_prefix, as_of=D1)
    assert state is not None and state.origin.symbol == "AA"


# Implements TC-COMP-049
def test_member_since_is_the_selected_adds_recorded_at(conn: psycopg.Connection) -> None:
    aa = _instrument(conn, "AA")
    universe_id = _created(conn, D1)
    _event(conn, universe_id, "member_added", D1, instrument_id=aa, at=_at(D1, 9))
    _event(conn, universe_id, "member_removed", D2, instrument_id=aa)
    _event(conn, universe_id, "member_added", D3, instrument_id=aa, at=_at(D3, 17))

    (member,) = replay.membership_as_of(conn, universe_id, D4)

    assert member.member_since == _at(D3, 17)
    assert member.instrument_id == aa and member.symbol == "AA"


def test_members_are_ordered_by_symbol(conn: psycopg.Connection) -> None:
    ids = {s: _instrument(conn, s) for s in ("MM", "AA", "ZZ")}
    universe_id = _created(conn, D1)
    for symbol in ("MM", "ZZ", "AA"):
        _event(conn, universe_id, "member_added", D1, instrument_id=ids[symbol])

    assert [m.symbol for m in replay.membership_as_of(conn, universe_id, D1)] == ["AA", "MM", "ZZ"]


def test_universes_do_not_see_each_others_members(conn: psycopg.Connection) -> None:
    aa, bb = _instrument(conn, "AA"), _instrument(conn, "BB")
    one, two = _created(conn, D1, name="One"), _created(conn, D1, name="Two")
    _event(conn, one, "member_added", D1, instrument_id=aa)
    _event(conn, two, "member_added", D1, instrument_id=bb)

    assert _members(conn, one, D1) == {"AA": "active"}
    assert _members(conn, two, D1) == {"BB": "active"}


# Implements TC-COMP-051
def test_events_page_newest_first_with_a_stable_cursor(conn: psycopg.Connection) -> None:
    aa = _instrument(conn, "AA")
    provenance = {
        "set_id": "6f1c2a54-0000-4000-8000-00000000abcd",
        "classification_date": "2026-10-15",
        "thresholds": {"value_percentile_min": 80, "growth_score_max": 1.5},
        "hide_incomplete": True,
        "symbol": "AA",
    }
    universe_id = _created(conn, D1, provenance=provenance)
    other = _created(conn, D1, name="Other")
    _event(conn, other, "member_added", D1, instrument_id=aa)
    ids = [
        _event(conn, universe_id, "member_added", D1, instrument_id=aa),
        _event(conn, universe_id, "renamed", D2, name="Tech 2"),
        _event(conn, universe_id, "member_removed", D2, instrument_id=aa),
        _event(conn, universe_id, "member_added", D3, instrument_id=aa),
        _event(conn, universe_id, "retired", D4),
    ]
    all_ids = [*ids]
    created_id = conn.execute(
        "SELECT event_id FROM universe_event WHERE universe_id = %s AND event_type = 'created'",
        (universe_id,),
    ).fetchone()
    assert created_id is not None
    all_ids.append(int(created_id[0]))
    expected = sorted(all_ids, reverse=True)
    assert len(expected) == 6

    # One more so the page sizes are 3, 3, 1 over seven events.
    expected.insert(0, _event(conn, universe_id, "renamed", D4, name="Tech 3"))

    page1, cursor1 = replay.list_events(conn, universe_id, 3, None)
    assert [e.event_id for e in page1] == expected[:3]
    assert cursor1 is not None

    # Newer events appended after the first page do not disturb the second.
    _event(conn, universe_id, "renamed", D4, name="Tech 4")
    _event(conn, universe_id, "renamed", D4, name="Tech 5")
    page2, cursor2 = replay.list_events(conn, universe_id, 3, cursor1)
    assert [e.event_id for e in page2] == expected[3:6]
    assert cursor2 is not None
    page3, cursor3 = replay.list_events(conn, universe_id, 3, cursor2)
    assert [e.event_id for e in page3] == expected[6:]
    assert cursor3 is None

    first = page1[0]
    assert (first.event_type, first.name, first.symbol) == ("renamed", "Tech 3", None)
    assert first.recorded_on == D4
    assert first.filter_provenance is None
    member_event = next(e for e in [*page1, *page2, *page3] if e.event_type == "member_removed")
    assert member_event.symbol == "AA" and member_event.name is None


# Implements TC-COMP-051
def test_the_created_event_passes_the_stored_provenance_through_unconverted(
    conn: psycopg.Connection,
) -> None:
    provenance = {
        "set_id": "6f1c2a54-0000-4000-8000-00000000abcd",
        "classification_date": "2026-10-15",
        "thresholds": {"value_percentile_min": 80, "growth_score_max": 1.5},
        "hide_incomplete": True,
        "symbol": "AA",
    }
    universe_id = _created(conn, D1, provenance=provenance)
    _event(conn, universe_id, "renamed", D2, name="Tech 2")

    events, _ = replay.list_events(conn, universe_id, 10, None)

    by_type = {e.event_type: e for e in events}
    created = by_type["created"].filter_provenance
    assert created == provenance
    assert created is not None
    assert isinstance(created["thresholds"]["value_percentile_min"], int)
    assert isinstance(created["thresholds"]["growth_score_max"], float)
    assert by_type["renamed"].filter_provenance is None


# Implements TC-COMP-051
def test_events_of_a_universe_without_provenance_and_of_an_empty_one(
    conn: psycopg.Connection,
) -> None:
    universe_id = _created(conn, D1)

    (event,), cursor = replay.list_events(conn, universe_id, 5, None)

    assert event.event_type == "created" and event.filter_provenance is None
    assert cursor is None
    assert replay.list_events(conn, UUID(int=9), 5, None) == ([], None)


# Implements TC-COMP-051
def test_events_page_rejects_a_bad_limit_or_cursor(conn: psycopg.Connection) -> None:
    universe_id = _created(conn, D1)

    for limit in (0, -1, MAX_PAGE_SIZE + 1):
        with pytest.raises(ValueError):
            replay.list_events(conn, universe_id, limit, None)
    assert len(replay.list_events(conn, universe_id, MAX_PAGE_SIZE, None)[0]) == 1
    with pytest.raises(CursorError):
        replay.list_events(conn, universe_id, 5, "not-a-cursor")
    with pytest.raises(CursorError):
        replay.list_events(
            conn, universe_id, 5, replay.encode_universe_cursor(_at(D1), UUID(int=1))
        )


def _three_universes(conn: psycopg.Connection) -> tuple[UUID, UUID, UUID]:
    older = _created(conn, D1, name="Older")
    renamed = _created(conn, D2, name="Before")
    _event(conn, renamed, "renamed", D3, name="Renamed")
    retired = _created(conn, D3, name="Gone")
    _event(conn, retired, "retired", D4)
    return older, renamed, retired


def test_universe_rows_select_by_lifecycle_newest_first(conn: psycopg.Connection) -> None:
    older, renamed, retired = _three_universes(conn)

    everything, _ = replay.list_universe_rows(conn, "all", None, 10, None)
    active, _ = replay.list_universe_rows(conn, "active", None, 10, None)
    gone, _ = replay.list_universe_rows(conn, "retired", None, 10, None)

    assert [r.universe_id for r in everything] == [retired, renamed, older]
    assert [r.universe_id for r in active] == [renamed, older]
    assert [r.universe_id for r in gone] == [retired]
    row = everything[0]
    assert row == replay.UniverseRow(retired, "Gone", "retired", _at(D3), _at(D4))
    assert everything[1].name == "Renamed" and everything[1].retired_at is None


def test_universe_rows_filter_on_the_replayed_name_prefix_as_given(
    conn: psycopg.Connection,
) -> None:
    _, renamed, _ = _three_universes(conn)

    renamed_rows, _ = replay.list_universe_rows(conn, "all", "Ren", 10, None)
    stale, _ = replay.list_universe_rows(conn, "all", "Before", 10, None)
    wrong_case, _ = replay.list_universe_rows(conn, "all", "ren", 10, None)
    percent, _ = replay.list_universe_rows(conn, "all", "%", 10, None)

    assert [r.universe_id for r in renamed_rows] == [renamed]
    assert stale == [] and wrong_case == [] and percent == []


def test_universe_rows_page_with_a_stable_cursor(conn: psycopg.Connection) -> None:
    older, renamed, retired = _three_universes(conn)

    first, cursor = replay.list_universe_rows(conn, "all", None, 2, None)
    assert cursor is not None
    newest = _created(conn, D4, name="Newest")
    second, last = replay.list_universe_rows(conn, "all", None, 2, cursor)

    assert [r.universe_id for r in first] == [retired, renamed]
    assert [r.universe_id for r in second] == [older]
    assert last is None
    assert newest not in {r.universe_id for r in [*first, *second]}


def test_universe_rows_reject_a_bad_lifecycle_limit_or_cursor(conn: psycopg.Connection) -> None:
    with pytest.raises(ValueError):
        replay.list_universe_rows(conn, "bogus", None, 5, None)
    for limit in (0, MAX_PAGE_SIZE + 1):
        with pytest.raises(ValueError):
            replay.list_universe_rows(conn, "all", None, limit, None)
    with pytest.raises(CursorError):
        replay.list_universe_rows(conn, "all", None, 5, "not-a-cursor")


# Implements TC-COMP-051
def test_a_page_that_ends_exactly_at_the_last_event_has_no_next_cursor(
    conn: psycopg.Connection,
) -> None:
    universe_id = _created(conn, D1)
    _event(conn, universe_id, "renamed", D2, name="Two")
    _event(conn, universe_id, "renamed", D3, name="Three")

    exact, cursor = replay.list_events(conn, universe_id, 3, None)
    single, single_cursor = replay.list_events(conn, universe_id, 1, None)

    assert len(exact) == 3 and cursor is None
    assert len(single) == 1 and single_cursor is not None


def test_a_universe_page_that_ends_exactly_at_the_last_row_has_no_next_cursor(
    conn: psycopg.Connection,
) -> None:
    _three_universes(conn)

    exact, cursor = replay.list_universe_rows(conn, "all", None, 3, None)
    single, single_cursor = replay.list_universe_rows(conn, "all", None, 1, None)

    assert len(exact) == 3 and cursor is None
    assert len(single) == 1 and single_cursor is not None


def test_each_replayed_universe_is_one_row_however_often_it_was_renamed(
    conn: psycopg.Connection,
) -> None:
    universe_id = _created(conn, D1, name="One")
    _event(conn, universe_id, "renamed", D2, name="Two")
    _event(conn, universe_id, "renamed", D3, name="Three")
    _event(conn, universe_id, "retired", D4)

    rows, _ = replay.list_universe_rows(conn, "all", None, 10, None)
    state_rows = conn.execute(replay._CURRENT_STATE_SQL, {"universe_id": universe_id}).fetchall()

    assert [(r.universe_id, r.name, r.lifecycle) for r in rows] == [
        (universe_id, "Three", "retired")
    ]
    assert len(state_rows) == 1


def test_universes_created_at_the_same_instant_page_by_universe_id(
    conn: psycopg.Connection,
) -> None:
    universes = [_created(conn, D1, name=f"Same {n}") for n in range(3)]

    seen: list[UUID] = []
    cursor = None
    for _ in range(3):
        page, cursor = replay.list_universe_rows(conn, "all", None, 1, cursor)
        seen.extend(r.universe_id for r in page)

    assert cursor is None
    assert seen == sorted(universes, reverse=True)
