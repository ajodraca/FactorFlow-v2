"""Universe maintenance against PostgreSQL: rename, remove a member and retire.

Satisfies AC-4, AC-5, AC-6, DAC-E1-4, DAC-E1-7 and DAC-E1-S4-1 through DAC-E1-S4-6
(CAP-002-E1-S4). The migrated-database fixture and the seeding and event helpers are
CAP-002-E1-S3's, imported from ``test_universe_create`` so both modules share them.
``conn.commit()`` follows each seeding step and each service call: with an idle
connection ``conn.transaction()`` opens and commits its own transaction (design 2.3).
"""

import threading
import time
from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.universes import service
from factorflow.universes.service import (
    InstrumentNotAcquired,
    LastMember,
    NotAMember,
    UniverseNameInUse,
    UniverseNotFound,
    UniverseRetired,
)
from tests.integration.test_universe_create import conn as conn  # fixture
from tests.integration.test_universe_create import (
    count_events,
    count_universes,
    event_rows,
    seed,
    seed_instrument,
)

pytestmark = pytest.mark.postgres


def _universe_row(conn: psycopg.Connection, universe_id: UUID) -> tuple[object, ...] | None:
    return conn.execute("SELECT * FROM universe WHERE universe_id = %s", (universe_id,)).fetchone()


def _create(conn: psycopg.Connection, name: str, *symbols: str) -> UUID:
    universe = service.create_by_hand(conn, name, list(symbols))
    conn.commit()
    return universe.universe_id


# --- TC-COMP-025: rename keeps identity, history and memberships ------------------------


def test_rename_keeps_identity_history_and_memberships(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-025."""
    seed(conn, "AAPL", "MSFT", "NVDA")
    uid = _create(conn, "Tech", "AAPL", "MSFT", "NVDA")
    before_events = event_rows(conn, uid)
    before = service.get_universe(conn, uid)
    universes_before = count_universes(conn)
    row_before = _universe_row(conn, uid)

    renamed = service.rename(conn, uid, "  Technology ")
    conn.commit()

    assert renamed.name == "Technology"
    assert renamed.universe_id == uid
    assert renamed.lifecycle == "active"
    assert renamed.members == before.members
    assert renamed.origin == before.origin
    assert renamed.created_at == before.created_at
    after_events = event_rows(conn, uid)
    assert after_events[: len(before_events)] == before_events
    assert len(after_events) == len(before_events) + 1
    new = after_events[-1]
    assert new["event_type"] == "renamed"
    assert new["name"] == "Technology"
    assert new["instrument_id"] is None
    assert new["filter_provenance"] is None
    assert count_universes(conn) == universes_before
    assert _universe_row(conn, uid) == row_before

    page, _ = service.list_events(conn, uid, 50, None)
    assert page[0].event_type == "renamed"
    assert page[0].name == "Technology"
    created = [e for e in page if e.event_type == "created"]
    assert len(created) == 1 and created[0].name == "Tech"

    again = service.rename(conn, uid, "Tech2")
    conn.commit()
    assert again.name == "Tech2"
    assert service.get_universe(conn, uid).name == "Tech2"
    assert [e["event_type"] for e in event_rows(conn, uid)].count("renamed") == 2


# --- TC-COMP-023 (rename half; create half is CAP-002-E1-S3) ----------------------------


def test_rename_to_an_active_name_is_refused_after_trimming(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-023 (rename half; create half is CAP-002-E1-S3)."""
    seed(conn, "AAA")
    _create(conn, "Growth", "AAA")
    u2 = _create(conn, "Value", "AAA")
    before = count_events(conn)

    with pytest.raises(UniverseNameInUse):
        service.rename(conn, u2, " Growth  ")
    conn.rollback()

    assert count_events(conn) == before
    assert service.get_universe(conn, u2).name == "Value"


def test_the_rename_comparison_is_exact_after_trimming(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-023 (rename half; create half is CAP-002-E1-S3)."""
    seed(conn, "AAA")
    _create(conn, "Growth", "AAA")
    u2 = _create(conn, "Value", "AAA")

    before = count_events(conn)

    assert service.rename(conn, u2, "growth").name == "growth"
    conn.commit()

    assert count_events(conn) == before + 1
    assert service.get_universe(conn, u2).name == "growth"


def test_a_retired_universes_name_is_reusable_by_rename(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-023 (rename half; create half is CAP-002-E1-S3)."""
    seed(conn, "AAA")
    u1 = _create(conn, "Growth", "AAA")
    u2 = _create(conn, "Value", "AAA")
    service.retire(conn, u1)
    conn.commit()

    renamed = service.rename(conn, u2, "Growth")
    conn.commit()

    assert renamed.name == "Growth"
    assert renamed.universe_id == u2 != u1


def test_a_universe_may_take_back_a_name_it_held_earlier(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-023 (rename half; create half is CAP-002-E1-S3)."""
    seed(conn, "AAA")
    u2 = _create(conn, "Growth", "AAA")

    service.rename(conn, u2, "Value")
    conn.commit()
    assert service.rename(conn, u2, "Growth").name == "Growth"
    conn.commit()

    assert service.get_universe(conn, u2).name == "Growth"
    assert [e["name"] for e in event_rows(conn, u2) if e["event_type"] == "renamed"] == [
        "Value",
        "Growth",
    ]


def test_renaming_to_its_own_name_appends_one_renamed_event(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-023 (rename half). PROVISIONAL behaviour pinned by DEC-0096."""
    seed(conn, "AAA")
    uid = _create(conn, "Value", "AAA")
    before = event_rows(conn, uid)

    assert service.rename(conn, uid, " Value").name == "Value"
    conn.commit()

    after = event_rows(conn, uid)
    assert after[: len(before)] == before
    assert len(after) == len(before) + 1
    assert after[-1]["event_type"] == "renamed" and after[-1]["name"] == "Value"


@pytest.mark.parametrize("name", ["", "   ", "\t\n"])
def test_rename_to_a_blank_name_is_a_shape_failure(conn: psycopg.Connection, name: str) -> None:
    """Implements TC-COMP-023 (rename half; create half is CAP-002-E1-S3)."""
    seed(conn, "AAA")
    uid = _create(conn, "Value", "AAA")
    before = count_events(conn)

    with pytest.raises(ValueError, match="must not be empty"):
        service.rename(conn, uid, name)
    conn.rollback()

    assert count_events(conn) == before


def _unknown_or_retired(conn: psycopg.Connection, target: str) -> UUID:
    if target == "unknown":
        return UUID(int=7)
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    service.retire(conn, uid)
    conn.commit()
    return uid


@pytest.mark.parametrize("target", ["unknown", "retired"])
def test_a_blank_rename_is_a_shape_failure_before_the_target_check(
    conn: psycopg.Connection, target: str
) -> None:
    """Design 2.4: the shape check (step 2) precedes the target check (step 5)."""
    uid = _unknown_or_retired(conn, target)
    before = count_events(conn)

    with pytest.raises(ValueError, match="must not be empty") as excinfo:
        service.rename(conn, uid, "   ")
    conn.rollback()

    assert type(excinfo.value) is ValueError
    assert count_events(conn) == before


def test_rename_accepts_a_very_long_name(conn: psycopg.Connection) -> None:
    """No length bound exists yet (system design question 2, abstained)."""
    seed(conn, "AAA")
    uid = _create(conn, "Value", "AAA")

    assert service.rename(conn, uid, "N" * 10_000).name == "N" * 10_000
    conn.commit()


def test_rename_of_an_unknown_universe_is_refused(conn: psycopg.Connection) -> None:
    with pytest.raises(UniverseNotFound):
        service.rename(conn, UUID(int=7), "Anything")


def test_retire_of_an_unknown_universe_is_refused(conn: psycopg.Connection) -> None:
    with pytest.raises(UniverseNotFound):
        service.retire(conn, UUID(int=7))


# --- TC-COMP-037: retire appends one retired event, data stays readable -----------------


def test_retire_appends_one_retired_event_and_data_stays_readable(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-037."""
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    service.remove_member(conn, uid, "BBB")
    conn.commit()
    before_events = event_rows(conn, uid)
    before = service.get_universe(conn, uid)
    row_before = _universe_row(conn, uid)

    result = service.retire(conn, uid)
    conn.commit()

    after_events = event_rows(conn, uid)
    assert after_events[: len(before_events)] == before_events
    assert len(after_events) == len(before_events) + 1
    new = after_events[-1]
    assert new["event_type"] == "retired"
    assert new["instrument_id"] is None
    assert new["name"] is None
    assert result.lifecycle == "retired"
    assert result.retired_at is not None
    assert result.retired_at == new["recorded_at"]
    assert result.members == before.members

    read = service.get_universe(conn, uid)
    assert read.lifecycle == "retired"
    assert read.members == before.members
    assert read.name == "U"
    page, _ = service.list_events(conn, uid, 50, None)
    assert page[0].event_type == "retired"
    assert len(page) == len(after_events)
    assert read.created_on is not None
    # Every event here shares one recorded_on, so the creation day's end-of-day membership is
    # today's (DEC-0065): this shows an as-of read still replays after retire, not a past
    # membership that differs. Past-date replay is CAP-002-E1-S2's test_universe_as_of.py.
    on_creation_day = service.get_universe(conn, uid, as_of=read.created_on)
    assert [m.symbol for m in on_creation_day.members] == ["AAA"]
    before_creation = service.get_universe(conn, uid, as_of=read.created_on - timedelta(days=1))
    assert before_creation.as_of_before_creation is True
    assert _universe_row(conn, uid) == row_before

    retired, _ = service.list_universes(conn, "retired", None, 10, None)
    active, _ = service.list_universes(conn, "active", None, 10, None)
    assert [u.universe_id for u in retired] == [uid]
    assert uid not in [u.universe_id for u in active]


# --- TC-COMP-038: every write to a retired universe raises UniverseRetired -------------


def test_every_write_to_a_retired_universe_raises_universe_retired(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-038."""
    seed(conn, "AAA", "BBB", "CCC")
    seed_instrument(conn, "DDD", covered=False)
    conn.commit()
    _create(conn, "Taken", "AAA")
    uid = _create(conn, "U", "AAA", "BBB")
    service.retire(conn, uid)
    conn.commit()
    before = count_events(conn)
    history = event_rows(conn, uid)

    writes = [
        lambda: service.retire(conn, uid),
        lambda: service.add_members(conn, uid, ["CCC"]),
        lambda: service.remove_member(conn, uid, "AAA"),
        lambda: service.rename(conn, uid, "Other"),
        # the target check precedes the member and name checks (design 2.4 step 5)
        lambda: service.remove_member(conn, uid, "ZZZ"),
        lambda: service.rename(conn, uid, "Taken"),
    ]
    for write in writes:
        with pytest.raises(UniverseRetired):
            write()
        conn.rollback()
        assert count_events(conn) == before
        read = service.get_universe(conn, uid)
        assert read.lifecycle == "retired"
        assert [m.symbol for m in read.members] == ["AAA", "BBB"]
        page, _ = service.list_events(conn, uid, 50, None)
        assert len(page) == len(history)

    # coverage still precedes the target check for add_members (S3), unchanged here
    with pytest.raises(InstrumentNotAcquired):
        service.add_members(conn, uid, ["DDD"])
    conn.rollback()
    assert count_events(conn) == before


# --- TC-COMP-026: removing a non-member raises a typed error ---------------------------


def test_removing_a_non_member_raises_not_a_member_and_writes_nothing(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-026."""
    seed(conn, "AAA", "BBB", "CCC")
    uid = _create(conn, "U", "AAA", "BBB")
    before = count_events(conn)

    with pytest.raises(NotAMember) as excinfo:
        service.remove_member(conn, uid, "CCC")
    conn.rollback()

    assert isinstance(excinfo.value, LookupError)
    assert "CCC" in str(excinfo.value)
    assert count_events(conn) == before


def test_a_symbol_with_no_instrument_is_not_a_member(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-026: removal does not consult coverage."""
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    before = count_events(conn)

    with pytest.raises(NotAMember, match="ZZZ"):
        service.remove_member(conn, uid, "ZZZ")
    conn.rollback()

    assert count_events(conn) == before


def test_a_lower_case_non_member_is_reported_normalised(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-026."""
    seed(conn, "AAA", "BBB", "CCC")
    uid = _create(conn, "U", "AAA", "BBB")

    with pytest.raises(NotAMember) as excinfo:
        service.remove_member(conn, uid, "ccc")
    conn.rollback()

    assert "CCC" in str(excinfo.value)
    assert "ccc" not in str(excinfo.value)


def test_a_removed_symbol_is_no_longer_a_member(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-026."""
    seed(conn, "AAA", "BBB", "CCC")
    uid = _create(conn, "U", "AAA", "BBB", "CCC")
    service.remove_member(conn, uid, "BBB")
    conn.commit()
    before = count_events(conn)

    with pytest.raises(NotAMember):
        service.remove_member(conn, uid, "BBB")
    conn.rollback()

    assert count_events(conn) == before


@pytest.mark.parametrize("symbol", ["1ABC", "", "  "])
def test_a_malformed_symbol_is_a_shape_failure_not_a_non_member(
    conn: psycopg.Connection, symbol: str
) -> None:
    """Implements TC-COMP-026."""
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    before = count_events(conn)

    with pytest.raises(ValueError, match="invalid symbol"):
        service.remove_member(conn, uid, symbol)
    conn.rollback()

    assert count_events(conn) == before


@pytest.mark.parametrize("target", ["unknown", "retired"])
def test_a_malformed_symbol_is_a_shape_failure_before_the_target_check(
    conn: psycopg.Connection, target: str
) -> None:
    """Design 2.4: the shape check (step 2) precedes the target check (step 5)."""
    uid = _unknown_or_retired(conn, target)
    before = count_events(conn)

    with pytest.raises(ValueError, match="invalid symbol") as excinfo:
        service.remove_member(conn, uid, "1ABC")
    conn.rollback()

    assert type(excinfo.value) is ValueError
    assert count_events(conn) == before


def test_a_non_member_of_a_one_member_universe_is_not_a_member_not_last_member(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-026: membership is checked before the last-member rule."""
    seed(conn, "AAA", "CCC")
    uid = _create(conn, "U", "AAA")

    with pytest.raises(NotAMember):
        service.remove_member(conn, uid, "CCC")
    conn.rollback()


def test_removing_from_an_unknown_universe_is_refused(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-026."""
    with pytest.raises(UniverseNotFound):
        service.remove_member(conn, UUID(int=7), "AAA")


# --- TC-COMP-036: removing the sole member raises LastMember ---------------------------


def test_removing_the_sole_member_raises_last_member_offering_retirement(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-036."""
    seed(conn, "AAA")
    uid = _create(conn, "U", "AAA")
    before = count_events(conn)

    with pytest.raises(LastMember) as excinfo:
        service.remove_member(conn, uid, "AAA")
    conn.rollback()

    assert isinstance(excinfo.value, ValueError)
    assert "retire" in str(excinfo.value)
    assert count_events(conn) == before
    assert [m.symbol for m in service.get_universe(conn, uid).members] == ["AAA"]

    retired = service.retire(conn, uid)
    conn.commit()
    assert retired.lifecycle == "retired"


def test_the_last_member_rule_applies_to_the_current_membership(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-036."""
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    service.remove_member(conn, uid, "BBB")
    conn.commit()

    with pytest.raises(LastMember):
        service.remove_member(conn, uid, "AAA")
    conn.rollback()


def test_a_re_added_member_counts_towards_the_current_membership(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-036."""
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    service.remove_member(conn, uid, "BBB")
    conn.commit()
    service.add_members(conn, uid, ["BBB"])
    conn.commit()

    service.remove_member(conn, uid, "AAA")
    conn.commit()
    assert [m.symbol for m in service.get_universe(conn, uid).members] == ["BBB"]
    with pytest.raises(LastMember):
        service.remove_member(conn, uid, "BBB")
    conn.rollback()


def test_the_sole_member_is_protected_whatever_its_instrument_lifecycle(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-036: the rule counts members, not lifecycle (AC-15)."""
    seed_instrument(conn, "OLD", lifecycle="retired")
    conn.commit()
    uid = _create(conn, "U", "OLD")
    before = count_events(conn)

    with pytest.raises(LastMember):
        service.remove_member(conn, uid, "OLD")
    conn.rollback()

    assert count_events(conn) == before
    assert [m.symbol for m in service.get_universe(conn, uid).members] == ["OLD"]


# --- TC-COMP-053: a removed member keeps both events in history ------------------------


def test_a_removed_member_keeps_both_events_in_history(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-053."""
    seed(conn, "AAA", "BBB", "CCC")
    uid = _create(conn, "U", "AAA", "BBB", "CCC")
    other = _create(conn, "Other", "BBB")
    before = event_rows(conn, uid)

    removed_at = service.remove_member(conn, uid, "bbb")
    conn.commit()

    after = event_rows(conn, uid)
    assert after[: len(before)] == before
    assert len(after) == len(before) + 1
    new = after[-1]
    assert new["event_type"] == "member_removed"
    assert new["name"] is None
    assert isinstance(removed_at, datetime)
    assert removed_at.tzinfo is not None
    assert removed_at == new["recorded_at"]
    added = [e for e in before if e["instrument_id"] == new["instrument_id"]]
    assert len(added) == 1 and added[0]["event_type"] == "member_added"
    assert new["event_id"] > added[0]["event_id"]
    assert [m.symbol for m in service.get_universe(conn, uid).members] == ["AAA", "CCC"]

    page, _ = service.list_events(conn, uid, 50, None)
    assert page[0].event_type == "member_removed" and page[0].symbol == "BBB"
    assert any(e.event_type == "member_added" and e.symbol == "BBB" for e in page[1:])
    assert [m.symbol for m in service.get_universe(conn, other).members] == ["BBB"]

    assert service.add_members(conn, uid, ["BBB"]) == (["BBB"], [])
    conn.commit()
    bbb = [
        e["event_type"] for e in event_rows(conn, uid) if e["instrument_id"] == new["instrument_id"]
    ]
    assert bbb == ["member_added", "member_removed", "member_added"]


# --- the write lock, atomicity and ordering (no mapped TC; design 2.3, 2.4) -------------


def _lock_waiters(watcher: psycopg.Connection) -> int:
    row = watcher.execute(
        "SELECT count(*) FROM pg_locks WHERE locktype = 'advisory' AND NOT granted"
    ).fetchone()
    assert row is not None
    return int(row[0])


def _wait_for_a_lock_waiter(watcher: psycopg.Connection) -> int:
    deadline = time.monotonic() + 5
    while _lock_waiters(watcher) == 0 and time.monotonic() < deadline:
        time.sleep(0.02)
    return _lock_waiters(watcher)


_OPERATIONS: dict[str, tuple[Callable[[psycopg.Connection, UUID], object], str]] = {
    "rename": (lambda c, uid: service.rename(c, uid, "Renamed"), "renamed"),
    "remove_member": (lambda c, uid: service.remove_member(c, uid, "BBB"), "member_removed"),
    "retire": (lambda c, uid: service.retire(c, uid), "retired"),
}


@pytest.mark.parametrize("operation", sorted(_OPERATIONS))
def test_each_maintenance_write_waits_on_the_write_lock(
    conn: psycopg.Connection, postgres_connection_string: str, operation: str
) -> None:
    """Each write waits on the write lock before it writes (design 2.3, DEC-0065).

    That the lock also precedes the replay checks is pinned by
    ``test_a_write_waiting_on_the_lock_checks_what_the_holder_committed``.
    """
    call, event_type = _OPERATIONS[operation]
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    conn_b = psycopg.connect(postgres_connection_string)
    watcher = psycopg.connect(postgres_connection_string, autocommit=True)
    outcome: list[object] = []

    def writer() -> None:
        try:
            call(conn_b, uid)
            conn_b.commit()
            outcome.append("done")
        except BaseException as exc:  # noqa: BLE001 - captured for the assertion below
            outcome.append(exc)

    thread = threading.Thread(target=writer, daemon=True)
    try:
        conn.execute("SELECT pg_advisory_xact_lock(%s)", (service.UNIVERSE_WRITE_LOCK_KEY,))
        thread.start()
        waiting = _wait_for_a_lock_waiter(watcher)
        waited_with_no_result = outcome == []
        conn.commit()
        thread.join(timeout=10)
        assert not thread.is_alive()
    finally:
        conn.rollback()
        thread.join(timeout=10)
        conn_b.close()
        watcher.close()

    assert waiting == 1, f"{operation} never reached the lock"
    assert waited_with_no_result, f"{operation} proceeded without the lock"
    assert outcome == ["done"]
    assert event_rows(conn, uid)[-1]["event_type"] == event_type


def test_a_rename_waiting_on_the_lock_sees_a_create_that_took_the_name(
    conn: psycopg.Connection, postgres_connection_string: str
) -> None:
    """A rename and a create of the same name serialise: never two active holders."""
    seed(conn, "AAA")
    u2 = _create(conn, "U2", "AAA")
    conn_b = psycopg.connect(postgres_connection_string)
    watcher = psycopg.connect(postgres_connection_string, autocommit=True)
    outcome: list[object] = []

    def renamer() -> None:
        try:
            service.rename(conn_b, u2, "Race")
            conn_b.commit()
            outcome.append("renamed")
        except BaseException as exc:  # noqa: BLE001 - captured for the assertion below
            outcome.append(exc)

    thread = threading.Thread(target=renamer, daemon=True)
    try:
        conn.execute("SELECT pg_advisory_xact_lock(%s)", (service.UNIVERSE_WRITE_LOCK_KEY,))
        thread.start()
        waiting = _wait_for_a_lock_waiter(watcher)
        waited_with_no_result = outcome == []
        # the same session holds the lock, so it is re-entrant here
        service.create_by_hand(conn, "Race", ["AAA"])
        conn.commit()
        thread.join(timeout=10)
        assert not thread.is_alive()
    finally:
        conn.rollback()
        thread.join(timeout=10)
        conn_b.close()
        watcher.close()

    assert waiting == 1, "the rename never reached the lock"
    assert waited_with_no_result, "the rename proceeded without the lock"
    assert len(outcome) == 1 and isinstance(outcome[0], UniverseNameInUse)
    assert service.get_universe(conn, u2).name == "U2"
    active, _ = service.list_universes(conn, "active", "Race", 10, None)
    assert [u.name for u in active] == ["Race"]


def _retire(c: psycopg.Connection, uid: UUID) -> object:
    return service.retire(c, uid)


# operation -> (the lock holder's change, the waiting write, its refusal, the holder's event)
_RACES: dict[
    str,
    tuple[
        Callable[[psycopg.Connection, UUID], object],
        Callable[[psycopg.Connection, UUID], object],
        type[Exception],
        str,
    ],
] = {
    "remove_member": (
        lambda c, uid: service.remove_member(c, uid, "AAA"),
        lambda c, uid: service.remove_member(c, uid, "BBB"),
        LastMember,
        "member_removed",
    ),
    "rename": (
        _retire,
        lambda c, uid: service.rename(c, uid, "Renamed"),
        UniverseRetired,
        "retired",
    ),
    "retire": (_retire, _retire, UniverseRetired, "retired"),
}


@pytest.mark.parametrize("operation", sorted(_RACES))
def test_a_write_waiting_on_the_lock_checks_what_the_holder_committed(
    conn: psycopg.Connection, postgres_connection_string: str, operation: str
) -> None:
    """The lock precedes the replay checks, so two writes cannot both pass them.

    Design 2.3 ("as its first statement, performs its checks by replay"), DEC-0065 (4),
    AC-5 and DAC-E1-S4-5: a write that waits on the lock must refuse on the state the
    holder committed meanwhile, not on the state it could have read before waiting.
    """
    holder_change, call, refusal, holder_event = _RACES[operation]
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    before = [e["event_type"] for e in event_rows(conn, uid)]
    conn_b = psycopg.connect(postgres_connection_string)
    watcher = psycopg.connect(postgres_connection_string, autocommit=True)
    outcome: list[object] = []

    def writer() -> None:
        try:
            call(conn_b, uid)
            conn_b.commit()
            outcome.append("done")
        except BaseException as exc:  # noqa: BLE001 - captured for the assertion below
            outcome.append(exc)

    thread = threading.Thread(target=writer, daemon=True)
    try:
        conn.execute("SELECT pg_advisory_xact_lock(%s)", (service.UNIVERSE_WRITE_LOCK_KEY,))
        thread.start()
        waiting = _wait_for_a_lock_waiter(watcher)
        # the same session holds the lock, so it is re-entrant here
        holder_change(conn, uid)
        conn.commit()
        thread.join(timeout=10)
        assert not thread.is_alive()
    finally:
        conn.rollback()
        thread.join(timeout=10)
        conn_b.close()
        watcher.close()

    assert waiting == 1, f"{operation} never reached the lock"
    assert len(outcome) == 1 and type(outcome[0]) is refusal, outcome
    assert [e["event_type"] for e in event_rows(conn, uid)] == [*before, holder_event]
    if operation == "remove_member":
        assert [m.symbol for m in service.get_universe(conn, uid).members] == ["BBB"]


@pytest.mark.parametrize("operation", sorted(_OPERATIONS))
def test_a_failed_event_insert_propagates_and_writes_nothing(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch, operation: str
) -> None:
    """The error is not swallowed (SEC-ERR-001) and the transaction rolls back whole."""
    call, _ = _OPERATIONS[operation]
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    before = count_events(conn)
    original = psycopg.Cursor.execute

    def failing(cursor: psycopg.Cursor[Any], query: Any, *args: Any, **kwargs: Any) -> Any:
        if isinstance(query, str) and query.startswith("INSERT INTO universe_event"):
            raise psycopg.errors.OperationalError("boom")
        return original(cursor, query, *args, **kwargs)

    monkeypatch.setattr(psycopg.Cursor, "execute", failing)
    with pytest.raises(psycopg.errors.OperationalError, match="boom"):
        call(conn, uid)
    conn.rollback()
    monkeypatch.undo()

    assert count_events(conn) == before
    assert service.get_universe(conn, uid).lifecycle == "active"


def test_each_operation_appends_only_its_own_event(conn: psycopg.Connection) -> None:
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    before = event_rows(conn, uid)

    service.rename(conn, uid, "V")
    conn.commit()
    service.remove_member(conn, uid, "BBB")
    conn.commit()
    service.retire(conn, uid)
    conn.commit()

    added = event_rows(conn, uid)[len(before) :]
    assert [e["event_type"] for e in added] == ["renamed", "member_removed", "retired"]
    assert [e["event_id"] for e in added] == sorted(e["event_id"] for e in added)


def test_remove_member_returns_the_recorded_at_of_its_own_event(
    conn: psycopg.Connection,
) -> None:
    seed(conn, "AAA", "BBB")
    uid = _create(conn, "U", "AAA", "BBB")
    earlier = event_rows(conn, uid)

    removed_at = service.remove_member(conn, uid, "AAA")
    conn.commit()

    assert all(removed_at >= e["recorded_at"] for e in earlier)
    page, _ = service.list_events(conn, uid, 50, None)
    assert page[0].event_type == "member_removed"
    assert removed_at == page[0].recorded_at


def test_remove_member_normalises_the_symbol(conn: psycopg.Connection) -> None:
    seed(conn, "AAPL", "MSFT")
    uid = _create(conn, "U", "AAPL", "MSFT")

    service.remove_member(conn, uid, " aapl ")
    conn.commit()

    assert [m.symbol for m in service.get_universe(conn, uid).members] == ["MSFT"]


def test_a_retired_instruments_membership_can_be_removed(conn: psycopg.Connection) -> None:
    """No instrument-lifecycle check exists on removal (AC-15)."""
    seed(conn, "AAA")
    seed_instrument(conn, "OLD", lifecycle="retired")
    conn.commit()
    uid = _create(conn, "U", "AAA", "OLD")

    service.remove_member(conn, uid, "OLD")
    conn.commit()

    assert [m.symbol for m in service.get_universe(conn, uid).members] == ["AAA"]
