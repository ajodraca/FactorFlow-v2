"""Universe creation by hand and adding members, against PostgreSQL.

Satisfies AC-1, AC-3, AC-5, AC-15, DAC-E1-1, DAC-E1-4, DAC-E1-5, DAC-E1-6, DAC-E1-9 and
DAC-E1-S3-1 through DAC-E1-S3-7 (CAP-002-E1-S3).

The database is migrated through 0005 only (versions 1 to 5), so a later migration cannot
change these tests. Test setup writes ``universe_event`` rows (``retired``, ``renamed``,
``member_removed``) and one ``UPDATE instrument`` directly, because the operations that
normally do this belong to CAP-002-E1-S4 or CAP-001; that is setup against a throwaway
database and never production code. ``conn.commit()`` follows each seeding step: with an
idle connection ``conn.transaction()`` opens and commits its own transaction, with an open
one it becomes a savepoint and the caller commits (design 2.3).
"""

import threading
import time
from collections.abc import Callable, Iterator
from datetime import date, timedelta
from typing import Any
from uuid import UUID

import psycopg
import pytest
from psycopg.rows import dict_row

from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover
from factorflow.universes import service
from factorflow.universes.service import (
    InstrumentNotAcquired,
    UniverseNameInUse,
    UniverseNotFound,
    UniverseRetired,
)

pytestmark = pytest.mark.postgres


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


def seed_instrument(
    conn: psycopg.Connection,
    symbol: str,
    *,
    covered: bool = True,
    lifecycle: str = "active",
) -> int:
    """Insert an instrument (retired ones with ``retired_at``) and, when covered, a segment."""
    row = conn.execute(
        "INSERT INTO instrument (symbol, lifecycle, retired_at) "
        "VALUES (%s, %s, CASE WHEN %s = 'retired' THEN now() END) RETURNING instrument_id",
        (symbol, lifecycle, lifecycle),
    ).fetchone()
    assert row is not None
    instrument_id = int(row[0])
    if covered:
        conn.execute(
            "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
            "VALUES (%s, 'prices', '2024-01-01', '2024-12-31')",
            (instrument_id,),
        )
    return instrument_id


def seed(conn: psycopg.Connection, *symbols: str) -> None:
    """Seed covered active instruments and commit."""
    for symbol in symbols:
        seed_instrument(conn, symbol)
    conn.commit()


def event_rows(conn: psycopg.Connection, universe_id: UUID) -> list[dict[str, Any]]:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            "SELECT * FROM universe_event WHERE universe_id = %s ORDER BY event_id",
            (universe_id,),
        )
        return cur.fetchall()


def count_events(conn: psycopg.Connection) -> int:
    row = conn.execute("SELECT count(*) FROM universe_event").fetchone()
    assert row is not None
    return int(row[0])


def count_universes(conn: psycopg.Connection) -> int:
    row = conn.execute("SELECT count(*) FROM universe").fetchone()
    assert row is not None
    return int(row[0])


def insert_event(
    conn: psycopg.Connection,
    universe_id: UUID,
    event_type: str,
    *,
    symbol: str | None = None,
    name: str | None = None,
) -> None:
    """Test-setup append of an event the operations of CAP-002-E1-S4 would normally write."""
    conn.execute(
        "INSERT INTO universe_event (universe_id, event_type, instrument_id, name) "
        "VALUES (%s, %s, (SELECT instrument_id FROM instrument WHERE symbol = %s), %s)",
        (universe_id, event_type, symbol, name),
    )
    conn.commit()


class ExecutemanySpy:
    """Records every ``Cursor.executemany`` call and delegates to the original."""

    def __init__(self, monkeypatch: pytest.MonkeyPatch, after: Callable[[], None] | None = None):
        self.calls: list[list[dict[str, Any]]] = []
        original = psycopg.Cursor.executemany

        def spy(cursor: psycopg.Cursor, query: Any, params_seq: Any, **kwargs: Any) -> None:
            rows = list(params_seq)
            self.calls.append(rows)
            original(cursor, query, rows, **kwargs)
            if after is not None:
                after()

        monkeypatch.setattr(psycopg.Cursor, "executemany", spy)


# --- TC-COMP-002: create appends one created and n member_added events -----------------


def test_create_appends_one_created_then_one_member_added_per_distinct_symbol(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Implements TC-COMP-002."""
    seed(conn, "AAPL", "MSFT", "NVDA", "TSLA", "AMZN")
    spy = ExecutemanySpy(monkeypatch)

    universe = service.create_by_hand(conn, "  Tech  ", ["msft", "aapl", "AAPL", "nvda"])
    conn.commit()

    assert universe.name == "Tech"
    assert universe.lifecycle == "active"
    assert universe.retired_at is None
    assert universe.origin.kind == "by_hand"
    assert universe.origin.set_id is None
    assert universe.origin.thresholds is None
    assert universe.origin.hide_incomplete is None
    assert universe.origin.symbol is None
    assert [m.symbol for m in universe.members] == ["AAPL", "MSFT", "NVDA"]

    events = event_rows(conn, universe.universe_id)
    assert [e["event_type"] for e in events] == ["created"] + ["member_added"] * 3
    assert events[0]["name"] == "Tech"
    assert events[0]["filter_provenance"] is None
    assert events[0]["instrument_id"] is None
    assert all(e["name"] is None and e["instrument_id"] is not None for e in events[1:])
    assert [e["event_id"] for e in events] == sorted(e["event_id"] for e in events)
    by_instrument = {e["instrument_id"]: e["recorded_at"] for e in events[1:]}
    for member in universe.members:
        assert member.member_since == by_instrument[member.instrument_id]
    assert conn.execute(
        "SELECT count(*) FROM universe WHERE universe_id = %s", (universe.universe_id,)
    ).fetchone() == (1,)

    assert len(spy.calls) == 1
    assert len(spy.calls[0]) == 4

    assert service.get_universe(conn, universe.universe_id) == universe


def test_a_stock_may_belong_to_several_universes(conn: psycopg.Connection) -> None:
    """AC-3: more than one universe at a time; a stock may belong to several."""
    seed(conn, "AAPL", "MSFT", "NVDA")
    first = service.create_by_hand(conn, "First", ["AAPL", "MSFT"])
    conn.commit()
    second = service.create_by_hand(conn, "Second", ["MSFT", "NVDA"])
    conn.commit()

    assert first.universe_id != second.universe_id
    assert "MSFT" in [m.symbol for m in service.get_universe(conn, first.universe_id).members]
    assert "MSFT" in [m.symbol for m in service.get_universe(conn, second.universe_id).members]
    assert service.get_universe(conn, first.universe_id).members == first.members


def test_get_universe_of_an_unknown_id_and_before_creation(conn: psycopg.Connection) -> None:
    seed(conn, "AAA")
    with pytest.raises(UniverseNotFound):
        service.get_universe(conn, UUID(int=7))
    universe = service.create_by_hand(conn, "U", ["AAA"])
    conn.commit()
    assert universe.created_on is not None
    before = service.get_universe(
        conn, universe.universe_id, as_of=universe.created_on - timedelta(days=1)
    )
    assert before.as_of_before_creation is True
    assert before.members == []
    assert service.get_universe(
        conn, universe.universe_id, as_of=date.today() + timedelta(days=1)
    ).members


# --- TC-COMP-001: uncovered symbols refuse the whole create or add ---------------------


def _seed_coverage_mix(conn: psycopg.Connection) -> None:
    seed_instrument(conn, "AAA")
    seed_instrument(conn, "BBB", covered=False)
    conn.commit()


def test_create_refuses_the_whole_request_naming_every_uncovered_symbol(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-001 (create)."""
    _seed_coverage_mix(conn)
    events_before, universes_before = count_events(conn), count_universes(conn)

    with pytest.raises(InstrumentNotAcquired) as excinfo:
        service.create_by_hand(conn, "U", ["AAA", "CCC", "BBB"])

    assert excinfo.value.symbols == ["BBB", "CCC"]
    assert "BBB" in str(excinfo.value) and "CCC" in str(excinfo.value)
    conn.rollback()
    assert count_events(conn) == events_before
    assert count_universes(conn) == universes_before


def test_lower_case_input_is_normalised_before_the_coverage_check(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-001 (normalisation)."""
    _seed_coverage_mix(conn)
    with pytest.raises(InstrumentNotAcquired) as excinfo:
        service.create_by_hand(conn, "U", ["aaa", "ccc"])
    assert excinfo.value.symbols == ["CCC"]


# --- TC-COMP-035: no symbols raises EmptyUniverse ---------------------------------------


def test_create_with_no_symbols_raises_empty_universe_and_writes_nothing(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-035."""
    seed(conn, "AAA")
    with pytest.raises(service.EmptyUniverse):
        service.create_by_hand(conn, "U", [])
    conn.rollback()
    assert count_universes(conn) == 0
    assert count_events(conn) == 0

    created = service.create_by_hand(conn, "U", ["AAA"])
    conn.commit()
    assert created.name == "U"


def test_blank_symbols_are_a_shape_failure_not_an_empty_universe(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-035 (design 2.4 step 2 precedes step 7)."""
    with pytest.raises(ValueError) as excinfo:
        service.create_by_hand(conn, "U", ["  ", ""])
    assert not isinstance(excinfo.value, service.EmptyUniverse)
    conn.rollback()
    assert count_universes(conn) == 0


# --- TC-COMP-023: active names are unique, a retired name is reusable --------------------


def test_an_active_name_cannot_be_reused_after_trimming(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-023 (create half)."""
    seed(conn, "AAA")
    first = service.create_by_hand(conn, "Growth", ["AAA"])
    conn.commit()

    with pytest.raises(UniverseNameInUse):
        service.create_by_hand(conn, "  Growth ", ["AAA"])
    conn.rollback()
    assert count_universes(conn) == 1

    # compared exactly after trimming: other spellings are different names
    lower = service.create_by_hand(conn, "growth", ["AAA"])
    conn.commit()
    other = service.create_by_hand(conn, "Growth 2", ["AAA"])
    conn.commit()
    assert len({first.universe_id, lower.universe_id, other.universe_id}) == 3


def test_a_retired_universes_name_is_reusable(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-023 (retired name)."""
    seed(conn, "AAA")
    first = service.create_by_hand(conn, "Growth", ["AAA"])
    conn.commit()
    insert_event(conn, first.universe_id, "retired")

    second = service.create_by_hand(conn, "Growth", ["AAA"])
    conn.commit()

    assert second.universe_id != first.universe_id
    assert second.name == "Growth"


def test_the_replayed_current_name_decides_not_the_created_name(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-023 (DEC-0065: replay decides)."""
    seed(conn, "AAA")
    first = service.create_by_hand(conn, "Growth", ["AAA"])
    conn.commit()
    insert_event(conn, first.universe_id, "renamed", name="Value")

    with pytest.raises(UniverseNameInUse):
        service.create_by_hand(conn, "Value", ["AAA"])
    conn.rollback()

    reused = service.create_by_hand(conn, "Growth", ["AAA"])
    conn.commit()
    assert reused.universe_id != first.universe_id


def test_the_name_check_ignores_the_universe_excluded(conn: psycopg.Connection) -> None:
    """The helper CAP-002-E1-S4's rename reuses: a universe's own name is not a clash."""
    seed(conn, "AAA")
    own = service.create_by_hand(conn, "Own", ["AAA"])
    conn.commit()

    assert service._name_in_use(conn, "Own") is True
    assert service._name_in_use(conn, "Own", excluding=own.universe_id) is False
    assert service._name_in_use(conn, "Ow") is False


def test_the_name_check_pages_through_every_universe_sharing_the_prefix(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A clash on a later page is still found (the oldest universe is on the last page)."""
    seed(conn, "AAA")
    for name in ["A", "A1", "A2", "A3", "A4"]:
        service.create_by_hand(conn, name, ["AAA"])
        conn.commit()
    monkeypatch.setattr(service, "MAX_PAGE_SIZE", 2)

    assert service._name_in_use(conn, "A") is True
    assert service._name_in_use(conn, "A5") is False


# --- TC-COMP-024: adding a current member reports already_member ------------------------


def test_adding_a_current_member_is_reported_and_appends_no_event(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-024."""
    seed(conn, "AAA", "BBB", "CCC")
    universe = service.create_by_hand(conn, "U", ["AAA", "BBB"])
    conn.commit()
    before = count_events(conn)

    added, already = service.add_members(conn, universe.universe_id, ["BBB", "CCC", "ccc", "AAA"])
    conn.commit()

    assert (added, already) == (["CCC"], ["AAA", "BBB"])
    assert count_events(conn) == before + 1
    events = event_rows(conn, universe.universe_id)
    assert [e["event_type"] for e in events][-1] == "member_added"
    ccc = conn.execute("SELECT instrument_id FROM instrument WHERE symbol = 'CCC'").fetchone()
    assert ccc is not None
    assert events[-1]["instrument_id"] == ccc[0]
    assert [m.symbol for m in service.get_universe(conn, universe.universe_id).members] == [
        "AAA",
        "BBB",
        "CCC",
    ]


def test_adding_only_current_members_appends_nothing(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Implements TC-COMP-024 (no empty executemany)."""
    seed(conn, "AAA", "BBB")
    universe = service.create_by_hand(conn, "U", ["AAA", "BBB"])
    conn.commit()
    before = count_events(conn)
    spy = ExecutemanySpy(monkeypatch)

    result = service.add_members(conn, universe.universe_id, ["BBB", "AAA"])
    conn.commit()

    assert result == ([], ["AAA", "BBB"])
    assert count_events(conn) == before
    assert spy.calls == []


def test_a_removed_symbol_is_added_again_as_a_new_member(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-024 (a removed member is not a current member)."""
    seed(conn, "AAA", "BBB")
    universe = service.create_by_hand(conn, "U", ["AAA", "BBB"])
    conn.commit()
    insert_event(conn, universe.universe_id, "member_removed", symbol="BBB")
    before = count_events(conn)

    added, already = service.add_members(conn, universe.universe_id, ["BBB"])
    conn.commit()

    assert (added, already) == (["BBB"], [])
    assert count_events(conn) == before + 1


def test_adding_no_symbols_is_a_no_op(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0095 (provisional): an empty add returns two empty lists and writes nothing."""
    seed(conn, "AAA")
    universe = service.create_by_hand(conn, "U", ["AAA"])
    conn.commit()
    before = count_events(conn)
    spy = ExecutemanySpy(monkeypatch)

    assert service.add_members(conn, universe.universe_id, []) == ([], [])
    conn.commit()

    assert count_events(conn) == before
    assert spy.calls == []
    with pytest.raises(UniverseNotFound):
        service.add_members(conn, UUID(int=0), [])


# --- TC-COMP-019: concurrent same-name creates serialise on the write lock --------------


def _lock_waiters(watcher: psycopg.Connection) -> int:
    row = watcher.execute(
        "SELECT count(*) FROM pg_locks WHERE locktype = 'advisory' AND NOT granted"
    ).fetchone()
    assert row is not None
    return int(row[0])


def test_a_second_create_waits_on_the_advisory_lock_then_is_refused(
    conn: psycopg.Connection, postgres_connection_string: str
) -> None:
    """Implements TC-COMP-019 (deterministic form)."""
    seed(conn, "AAA")
    conn_b = psycopg.connect(postgres_connection_string)
    watcher = psycopg.connect(postgres_connection_string, autocommit=True)
    outcome: list[BaseException | str] = []

    def second() -> None:
        try:
            service.create_by_hand(conn_b, "Race", ["AAA"])
            conn_b.commit()
            outcome.append("created")
        except BaseException as exc:  # noqa: BLE001 - captured for the assertion below
            outcome.append(exc)

    thread = threading.Thread(target=second, daemon=True)
    try:
        conn.execute("SELECT pg_advisory_xact_lock(%s)", (service.UNIVERSE_WRITE_LOCK_KEY,))
        thread.start()
        deadline = time.monotonic() + 5
        while _lock_waiters(watcher) == 0 and time.monotonic() < deadline:
            time.sleep(0.02)
        assert _lock_waiters(watcher) == 1, "the second create never reached the lock"
        assert outcome == [], "the second create proceeded without the lock"

        # the same session holds the lock, so it is re-entrant here
        service.create_by_hand(conn, "Race", ["AAA"])
        conn.commit()
        thread.join(timeout=10)
        assert not thread.is_alive()
    finally:
        conn_b.close()
        watcher.close()

    assert len(outcome) == 1 and isinstance(outcome[0], UniverseNameInUse)
    created = conn.execute(
        "SELECT count(*) FROM universe_event WHERE event_type = 'created' AND name = 'Race'"
    ).fetchone()
    assert created == (1,)


def test_racing_creates_never_both_succeed(
    conn: psycopg.Connection, postgres_connection_string: str
) -> None:
    """Implements TC-COMP-019 (barrier form)."""
    seed(conn, "AAA")
    rounds = 20
    barrier = threading.Barrier(2)
    results: dict[tuple[int, int], BaseException | str] = {}

    def worker(who: int) -> None:
        worker_conn = psycopg.connect(postgres_connection_string)
        try:
            for round_no in range(rounds):
                barrier.wait(timeout=30)
                try:
                    service.create_by_hand(worker_conn, f"Round {round_no}", ["AAA"])
                    worker_conn.commit()
                    results[(who, round_no)] = "created"
                except BaseException as exc:  # noqa: BLE001 - captured for the assertion below
                    worker_conn.rollback()
                    results[(who, round_no)] = exc
        finally:
            worker_conn.close()

    threads = [threading.Thread(target=worker, args=(who,)) for who in (0, 1)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(timeout=120)
        assert not thread.is_alive()

    assert len(results) == 2 * rounds
    for round_no in range(rounds):
        pair = [results[(0, round_no)], results[(1, round_no)]]
        successes = [r for r in pair if r == "created"]
        refusals = [r for r in pair if isinstance(r, UniverseNameInUse)]
        assert len(successes) == 1 and len(refusals) == 1, pair
    assert count_universes(conn) == rounds


# --- TC-COMP-118: a covered retired-lifecycle symbol is accepted -------------------------


def test_a_covered_retired_symbol_is_accepted_and_replays_retired(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-118 (a, b)."""
    seed_instrument(conn, "RRR", lifecycle="retired")
    seed_instrument(conn, "SSS", lifecycle="retired")
    seed_instrument(conn, "AAA")
    conn.commit()

    universe = service.create_by_hand(conn, "U", ["RRR", "AAA"])
    conn.commit()
    lifecycles = {m.symbol: m.lifecycle for m in universe.members}
    assert lifecycles == {"AAA": "active", "RRR": "retired"}
    replayed = service.get_universe(conn, universe.universe_id)
    assert {m.symbol: m.lifecycle for m in replayed.members} == lifecycles

    added, already = service.add_members(conn, universe.universe_id, ["SSS"])
    conn.commit()
    assert (added, already) == (["SSS"], [])


def test_a_member_stays_a_member_when_its_instrument_retires(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-118 (c): DAC-E1-9."""
    seed(conn, "AAA", "BBB")
    universe = service.create_by_hand(conn, "U", ["AAA", "BBB"])
    conn.commit()
    conn.execute(
        "UPDATE instrument SET lifecycle = 'retired', retired_at = now() WHERE symbol='BBB'"
    )
    conn.commit()

    replayed = service.get_universe(conn, universe.universe_id)
    assert {m.symbol: m.lifecycle for m in replayed.members} == {"AAA": "active", "BBB": "retired"}
    assert service.add_members(conn, universe.universe_id, ["BBB"]) == ([], ["BBB"])


def test_a_retired_instrument_without_coverage_is_still_uncovered(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-118 (d): the rule is coverage, not lifecycle."""
    seed_instrument(conn, "NOCOV", covered=False, lifecycle="retired")
    conn.commit()
    with pytest.raises(InstrumentNotAcquired) as excinfo:
        service.create_by_hand(conn, "U", ["NOCOV"])
    assert excinfo.value.symbols == ["NOCOV"]


# --- the SQL half of TC-COMP-001 ---------------------------------------------------------


def _uncovered(conn: psycopg.Connection, symbols: list[str]) -> list[str]:
    rows = conn.execute(service.COVERAGE_CHECK_SQL, {"symbols": symbols}).fetchall()
    return sorted(row[0] for row in rows)


def test_the_coverage_statement_returns_exactly_the_uncovered_symbols(
    conn: psycopg.Connection,
) -> None:
    """The SQL half of TC-COMP-001."""
    _seed_coverage_mix(conn)
    both = seed_instrument(conn, "BOTH")
    conn.execute(
        "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
        "VALUES (%s, 'reference', '2024-01-01', '2024-12-31')",
        (both,),
    )
    conn.commit()

    assert _uncovered(conn, ["AAA", "BBB", "CCC", "BOTH"]) == ["BBB", "CCC"]
    assert _uncovered(conn, []) == []
    assert _uncovered(conn, ["BOTH"]) == []


# --- guards add_members and the reads need (no mapped TC) -------------------------------


def test_add_members_checks_coverage_before_the_target(conn: psycopg.Connection) -> None:
    """Design 2.4: steps 4 and 5."""
    with pytest.raises(UniverseNotFound):
        service.add_members(conn, UUID(int=1), [])
    seed(conn, "AAA")
    with pytest.raises(UniverseNotFound):
        service.add_members(conn, UUID(int=1), ["AAA"])
    conn.rollback()
    with pytest.raises(InstrumentNotAcquired):
        service.add_members(conn, UUID(int=1), ["MISSING"])


def test_add_members_to_a_retired_universe_is_refused(conn: psycopg.Connection) -> None:
    seed(conn, "AAA", "BBB")
    universe = service.create_by_hand(conn, "U", ["AAA"])
    conn.commit()
    insert_event(conn, universe.universe_id, "retired")
    before = count_events(conn)

    with pytest.raises(UniverseRetired):
        service.add_members(conn, universe.universe_id, ["BBB"])
    conn.rollback()
    assert count_events(conn) == before


def test_a_failure_mid_write_rolls_back_every_event(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    seed(conn, "AAA", "BBB")

    def boom() -> None:
        raise psycopg.errors.OperationalError("boom")

    ExecutemanySpy(monkeypatch, after=boom)
    with pytest.raises(psycopg.errors.OperationalError):
        service.create_by_hand(conn, "U", ["AAA", "BBB"])
    conn.rollback()
    assert count_universes(conn) == 0
    assert count_events(conn) == 0


def test_list_universes_pages_newest_first_with_replayed_members(
    conn: psycopg.Connection,
) -> None:
    seed(conn, "AAA", "BBB")
    first = service.create_by_hand(conn, "Alpha", ["AAA"])
    conn.commit()
    second = service.create_by_hand(conn, "Beta", ["AAA", "BBB"])
    conn.commit()
    third = service.create_by_hand(conn, "Gamma", ["BBB"])
    conn.commit()
    insert_event(conn, third.universe_id, "retired")

    universes, cursor = service.list_universes(conn, "active", None, 10, None)
    assert [u.name for u in universes] == ["Beta", "Alpha"]
    assert cursor is None
    assert [[m.symbol for m in u.members] for u in universes] == [["AAA", "BBB"], ["AAA"]]
    assert universes[0].universe_id == second.universe_id
    assert universes[1].universe_id == first.universe_id

    retired, _ = service.list_universes(conn, "retired", None, 10, None)
    assert [u.name for u in retired] == ["Gamma"]
    assert retired[0].lifecycle == "retired"

    prefixed, _ = service.list_universes(conn, "all", "Be", 10, None)
    assert [u.name for u in prefixed] == ["Beta"]

    insert_event(conn, first.universe_id, "renamed", name="Behind")
    renamed, _ = service.list_universes(conn, "all", "Be", 10, None)
    assert sorted(u.name for u in renamed) == ["Behind", "Beta"]
    stale, _ = service.list_universes(conn, "all", "Al", 10, None)
    assert stale == []

    page, next_cursor = service.list_universes(conn, "all", None, 1, None)
    assert [u.name for u in page] == ["Gamma"]
    assert next_cursor is not None
    page2, _ = service.list_universes(conn, "all", None, 1, next_cursor)
    assert [u.name for u in page2] == ["Beta"]


def test_list_events_newest_first_with_symbols(conn: psycopg.Connection) -> None:
    seed(conn, "AAA", "BBB")
    universe = service.create_by_hand(conn, "U", ["AAA", "BBB"])
    conn.commit()

    events, cursor = service.list_events(conn, universe.universe_id, 10, None)
    assert cursor is None
    assert [e.event_type for e in events] == ["member_added", "member_added", "created"]
    assert [e.symbol for e in events] == ["BBB", "AAA", None]
    assert events[-1].name == "U"

    with pytest.raises(UniverseNotFound):
        service.list_events(conn, UUID(int=9), 10, None)


def test_removing_a_shared_instrument_from_one_universe_leaves_the_other(
    conn: psycopg.Connection,
) -> None:
    """AC-3: the same instrument in two universes does not interfere."""
    seed(conn, "AAA", "BBB")
    first = service.create_by_hand(conn, "First", ["AAA", "BBB"])
    conn.commit()
    second = service.create_by_hand(conn, "Second", ["AAA"])
    conn.commit()

    insert_event(conn, first.universe_id, "member_removed", symbol="AAA")

    assert [m.symbol for m in service.get_universe(conn, first.universe_id).members] == ["BBB"]
    assert [m.symbol for m in service.get_universe(conn, second.universe_id).members] == ["AAA"]


def test_add_refuses_the_whole_request_and_changes_nothing(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-001 (add)."""
    _seed_coverage_mix(conn)
    seed(conn, "KEEP")
    universe = service.create_by_hand(conn, "U", ["KEEP"])
    conn.commit()
    events_before = event_rows(conn, universe.universe_id)

    with pytest.raises(InstrumentNotAcquired) as excinfo:
        service.add_members(conn, universe.universe_id, ["AAA", "ZZZ", "BBB"])

    assert excinfo.value.symbols == ["BBB", "ZZZ"]
    conn.rollback()
    assert event_rows(conn, universe.universe_id) == events_before
    assert [m.symbol for m in service.get_universe(conn, universe.universe_id).members] == ["KEEP"]


def test_add_members_waits_on_the_write_lock(
    conn: psycopg.Connection, postgres_connection_string: str
) -> None:
    """Every write takes the lock first, add_members included (design 2.3)."""
    seed(conn, "AAA", "BBB")
    universe = service.create_by_hand(conn, "U", ["AAA"])
    conn.commit()
    conn_b = psycopg.connect(postgres_connection_string)
    watcher = psycopg.connect(postgres_connection_string, autocommit=True)
    outcome: list[object] = []

    def adder() -> None:
        try:
            outcome.append(service.add_members(conn_b, universe.universe_id, ["BBB"]))
            conn_b.commit()
        except BaseException as exc:  # noqa: BLE001 - captured for the assertion below
            outcome.append(exc)

    thread = threading.Thread(target=adder, daemon=True)
    try:
        conn.execute("SELECT pg_advisory_xact_lock(%s)", (service.UNIVERSE_WRITE_LOCK_KEY,))
        thread.start()
        deadline = time.monotonic() + 5
        while _lock_waiters(watcher) == 0 and time.monotonic() < deadline:
            time.sleep(0.02)
        waiting = _lock_waiters(watcher)
        waited_with_no_result = outcome == []
        conn.rollback()
        thread.join(timeout=10)
        assert not thread.is_alive()
    finally:
        conn.rollback()
        thread.join(timeout=10)
        conn_b.close()
        watcher.close()

    assert waiting == 1, "add_members never reached the lock"
    assert waited_with_no_result, "add_members proceeded without the lock"
    assert outcome == [(["BBB"], [])]


def test_list_events_pages_with_a_cursor(conn: psycopg.Connection) -> None:
    seed(conn, "AAA", "BBB", "CCC")
    universe = service.create_by_hand(conn, "U", ["AAA", "BBB", "CCC"])
    conn.commit()

    first, cursor = service.list_events(conn, universe.universe_id, 3, None)
    assert [e.symbol for e in first] == ["CCC", "BBB", "AAA"]
    assert cursor is not None
    second, last = service.list_events(conn, universe.universe_id, 3, cursor)
    assert [e.event_type for e in second] == ["created"]
    assert last is None
