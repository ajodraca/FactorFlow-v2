"""Universe creation from a filter result (a snapshot with provenance), against PostgreSQL.

Satisfies AC-2, AC-5, DAC-E1-2, DAC-E1-3 and DAC-E1-S5-1 through DAC-E1-S5-6
(CAP-002-E1-S5): TC-COMP-012, TC-COMP-013, TC-COMP-014, TC-COMP-015, TC-COMP-016 and
TC-COMP-039, plus the design section 7 rows with no TC id (search then save, the list and
the snapshot share one predicate) and the write rules shared with CAP-002-E1-S3.

The database is migrated through 0006 only (versions 1 to 6) by this module's own
``migrated_db_through_0006`` fixture, so a later migration cannot change these tests and
CAP-002-E1-S3's 0005 fixture stays untouched. Classification rows are seeded with raw
``INSERT``s (never ``UPDATE`` or ``DELETE``) and committed before each service call. Each
expected member list is computed by hand from the seeded rows and also checked against
``reader.evaluate_filter``, so the tests neither restate the predicate nor compare the
function with itself. Bound encoding inside ``filter_provenance`` is DEC-0248.
"""

import threading
import time
from collections.abc import Iterator
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID
from zoneinfo import ZoneInfo

import psycopg
import pytest
from psycopg import errors
from psycopg.pq import TransactionStatus

from factorflow.api.bounds import MAX_PAGE_SIZE
from factorflow.classification import reader
from factorflow.classification.constants import FACTORS, INPUT_NAMES
from factorflow.classification.reader import ListFilters, Thresholds
from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover
from factorflow.universes import service
from tests.integration.test_universe_create import count_events, event_rows, seed_instrument

pytestmark = pytest.mark.postgres

SET_DATE = date(2026, 10, 15)
T0 = datetime(2026, 10, 15, 21, 0, tzinfo=UTC)


@pytest.fixture
def migrated_db_through_0006(postgres_connection_string: str) -> str:
    """The test database migrated through 0006 (versions 1 to 6 only); its connection string."""
    connection = psycopg.connect(postgres_connection_string)
    try:
        files = [f for f in discover(MIGRATIONS_DIR) if f.version <= 6]
        assert apply_pending(connection, files) == [1, 2, 3, 4, 5, 6]
        connection.commit()
    finally:
        connection.close()
    return postgres_connection_string


@pytest.fixture
def conn(migrated_db_through_0006: str) -> Iterator[psycopg.Connection]:
    """One connection to the 0006 database, closed in ``finally``."""
    connection = psycopg.connect(migrated_db_through_0006)
    try:
        yield connection
    finally:
        connection.close()


# --- seeding --------------------------------------------------------------------------


@dataclass(frozen=True)
class NC:
    """A ``not_classified`` cell; an input reason gets the factor's first input name."""

    reason: str


Scored = tuple[Decimal | str | int, Decimal | str | int]  # (score, percentile)


def seed_set(
    conn: psycopg.Connection,
    *,
    state: str = "complete",
    classification_date: date = SET_DATE,
    ended_at: datetime | None = T0,
    started_at: datetime | None = None,
) -> UUID:
    """A succeeded ``acquisition_run`` and its ``classification_set`` with three factor rows."""
    if started_at is None:
        started_at = (ended_at or T0) - timedelta(hours=1)
    run_end = ended_at or started_at
    run = conn.execute(
        "INSERT INTO acquisition_run (state, history_depth_years, started_at, ended_at) "
        "VALUES ('succeeded', 1, %s, %s) RETURNING run_id",
        (started_at - timedelta(hours=1), run_end),
    ).fetchone()
    assert run is not None
    complete = state == "complete"
    row = conn.execute(
        "INSERT INTO classification_set (run_id, state, classification_date, latest_trading_day, "
        "active_instruments, started_at, ended_at, failure_reason) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING set_id",
        (
            run[0],
            state,
            classification_date,
            classification_date if complete else None,
            100 if complete else None,
            started_at,
            ended_at if state != "building" else None,
            "engine failed" if state == "failed" else None,
        ),
    ).fetchone()
    assert row is not None
    set_id: UUID = row[0]
    for factor in FACTORS:
        conn.execute(
            "INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked) "
            "VALUES (%s, %s, 50, true)",
            (set_id, factor),
        )
    conn.commit()
    return set_id


def seed_classified(
    conn: psycopg.Connection,
    set_id: UUID,
    instrument_id: int,
    factor: str,
    score: Decimal | str | int,
    percentile: Decimal | str | int,
) -> None:
    conn.execute(
        "INSERT INTO factor_classification (set_id, instrument_id, factor, status, score, "
        "percentile) VALUES (%s, %s, %s, 'classified', %s, %s)",
        (set_id, instrument_id, factor, Decimal(str(score)), Decimal(str(percentile))),
    )


def seed_not_classified(
    conn: psycopg.Connection,
    set_id: UUID,
    instrument_id: int,
    factor: str,
    reason_code: str,
    reason_input: str | None = None,
) -> None:
    """A ``not_classified`` row; the input reasons need ``reason_input`` (design 2.4 CHECKs)."""
    conn.execute(
        "INSERT INTO factor_classification (set_id, instrument_id, factor, status, reason_code, "
        "reason_input) VALUES (%s, %s, %s, 'not_classified', %s, %s)",
        (set_id, instrument_id, factor, reason_code, reason_input),
    )


def classify(
    conn: psycopg.Connection,
    set_id: UUID,
    instrument_id: int,
    cells: dict[str, Scored | NC],
) -> None:
    """All three factor rows of one instrument; an omitted factor is classified at (0, 50)."""
    for factor in FACTORS:
        cell = cells.get(factor, (0, 50))
        if isinstance(cell, NC):
            reason_input = INPUT_NAMES[factor][0] if cell.reason.startswith("input_") else None
            seed_not_classified(conn, set_id, instrument_id, factor, cell.reason, reason_input)
        else:
            seed_classified(conn, set_id, instrument_id, factor, cell[0], cell[1])
    conn.commit()


def seed_stock(
    conn: psycopg.Connection,
    set_id: UUID,
    symbol: str,
    cells: dict[str, Scored | NC],
    *,
    covered: bool = True,
) -> int:
    """A new active instrument (covered unless told otherwise) with its three factor rows."""
    instrument_id = seed_instrument(conn, symbol, covered=covered)
    classify(conn, set_id, instrument_id, cells)
    return instrument_id


# value, growth, momentum as (score, percentile); NC for not classified.
BASE: dict[str, dict[str, Scored | NC]] = {
    "AAA": {"value": ("1.5", 95), "growth": ("0.2", 60), "momentum": ("0.5", 70)},
    "AAB": {"value": ("1.2", 85), "growth": ("-0.3", 40), "momentum": ("-0.1", 30)},
    "AAC": {"value": ("1.3", 90), "growth": NC("input_missing"), "momentum": ("0.2", 60)},
    "BAA": {"value": ("1.9", 97), "growth": ("0.4", 70), "momentum": ("0.4", 62)},
    "BBB": {"value": ("1.0", 80), "growth": ("0.1", 55), "momentum": ("0", 50)},
    "CCC": {"value": ("0.8", 75), "growth": ("1.1", 90), "momentum": ("1.2", 95)},
    "DDD": {"value": ("2.0", 99), "growth": ("-1.0", 10), "momentum": ("0.3", 65)},
    "EEE": {"value": ("-0.5", 20), "growth": ("0.5", 75), "momentum": ("0.9", 90)},
    "FFF": {"value": ("0.9", "79.999999"), "growth": ("0.6", 80), "momentum": ("1.0", 92)},
    "GGG": {"value": ("1.1", 82), "growth": ("0", 50), "momentum": ("-0.000001", 45)},
}
HIGH_VALUE = Thresholds(
    bounds={"value_percentile_min": Decimal("80"), "momentum_score_min": Decimal("0")}
)


def seed_base(conn: psycopg.Connection, **set_kwargs: Any) -> tuple[UUID, dict[str, int]]:
    """One complete set over the ``BASE`` stocks; returns the set and symbol -> id."""
    set_id = seed_set(conn, **set_kwargs)
    ids = {symbol: seed_stock(conn, set_id, symbol, cells) for symbol, cells in BASE.items()}
    return set_id, ids


def symbols_of(conn: psycopg.Connection, instrument_ids: list[int]) -> list[str]:
    rows = conn.execute(
        "SELECT symbol FROM instrument WHERE instrument_id = ANY(%s) ORDER BY symbol",
        (instrument_ids,),
    ).fetchall()
    return [row[0] for row in rows]


def oracle(conn: psycopg.Connection, set_id: UUID, thresholds: Thresholds) -> list[str]:
    """The reader's own answer for the same set and ``Thresholds``, as sorted symbols."""
    return symbols_of(conn, reader.evaluate_filter(conn, set_id, thresholds))


def member_symbols(universe: service.Universe) -> list[str]:
    return [member.symbol for member in universe.members]


def added_symbols(conn: psycopg.Connection, universe_id: UUID) -> list[str]:
    """The ``member_added`` events' symbols in ``event_id`` order."""
    rows = conn.execute(
        "SELECT i.symbol FROM universe_event e JOIN instrument i USING (instrument_id) "
        "WHERE e.universe_id = %s AND e.event_type = 'member_added' ORDER BY e.event_id",
        (universe_id,),
    ).fetchall()
    return [row[0] for row in rows]


def created_provenance(conn: psycopg.Connection, universe_id: UUID) -> dict[str, Any]:
    events = event_rows(conn, universe_id)
    assert events[0]["event_type"] == "created"
    provenance = events[0]["filter_provenance"]
    assert isinstance(provenance, dict)
    return provenance


def universe_count(conn: psycopg.Connection) -> int:
    row = conn.execute("SELECT count(*) FROM universe").fetchone()
    assert row is not None
    return int(row[0])


def written(conn: psycopg.Connection) -> tuple[int, int]:
    """``(universe rows, universe_event rows)``: unchanged across a refusal."""
    return universe_count(conn), count_events(conn)


def save(
    conn: psycopg.Connection, name: str, set_id: UUID, thresholds: Thresholds
) -> service.Universe:
    universe = service.create_from_filter(conn, name, set_id, thresholds)
    conn.commit()
    return universe


# --- TC-COMP-012: members equal evaluate_filter's result -------------------------------


def test_members_equal_the_hand_computed_list_and_evaluate_filter(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-012 (DAC-E1-S5-1)."""
    set_id, _ = seed_base(conn)
    universe = save(conn, "  High value  ", set_id, HIGH_VALUE)

    assert universe.name == "High value"
    assert universe.lifecycle == "active"
    assert universe.origin.kind == "from_filter"
    expected = ["AAA", "AAC", "BAA", "BBB", "DDD"]
    assert member_symbols(universe) == expected
    assert oracle(conn, set_id, HIGH_VALUE) == expected

    events = event_rows(conn, universe.universe_id)
    assert [e["event_type"] for e in events] == ["created"] + ["member_added"] * len(expected)
    created = events[0]
    assert created["name"] == "High value"
    assert created["filter_provenance"] is not None
    assert created["instrument_id"] is None
    members = events[1:]
    assert [e["event_id"] for e in members] == sorted(e["event_id"] for e in members)
    by_id: dict[int, str] = dict(
        conn.execute(
            "SELECT instrument_id, symbol FROM instrument WHERE instrument_id = ANY(%s)",
            ([e["instrument_id"] for e in members],),
        ).fetchall()
    )
    assert [by_id[e["instrument_id"]] for e in members] == expected  # symbol order
    assert all(e["filter_provenance"] is None and e["name"] is None for e in members)
    recorded = {by_id[e["instrument_id"]]: e["recorded_at"] for e in members}
    assert {m.symbol: m.member_since for m in universe.members} == recorded


def test_bounds_hide_incomplete_and_prefix_together(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-012 (all three parts of ``Thresholds`` at once)."""
    set_id, _ = seed_base(conn)
    thresholds = Thresholds(bounds=dict(HIGH_VALUE.bounds), hide_incomplete=True, symbol="AA")
    universe = save(conn, "AA high value", set_id, thresholds)
    # AAB fails the momentum bound, AAC is input-incomplete and hidden, BAA lacks the prefix.
    assert member_symbols(universe) == ["AAA"]
    assert oracle(conn, set_id, thresholds) == ["AAA"]


def test_no_bounds_saves_every_stock_in_scope(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-012 (DAC-E3-S2-7: an empty filter is the whole scope)."""
    set_id, _ = seed_base(conn)
    universe = save(conn, "Everything", set_id, Thresholds())
    assert member_symbols(universe) == sorted(BASE)
    assert oracle(conn, set_id, Thresholds()) == sorted(BASE)


def test_a_bound_keeps_a_stock_not_classified_on_its_factor(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-012 (DEC-0081: a bound applies only where the stock is classified)."""
    set_id, _ = seed_base(conn)
    seed_stock(conn, set_id, "HHH", {"value": NC("not_enough_stocks")})
    thresholds = Thresholds(bounds={"value_score_min": Decimal("1000")})
    universe = save(conn, "Unranked value", set_id, thresholds)
    assert member_symbols(universe) == ["HHH"]
    assert oracle(conn, set_id, thresholds) == ["HHH"]


def test_an_uncovered_stock_the_filter_matches_is_saved(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-012 (Resolved Conflicts: no coverage check on the filter path)."""
    set_id, _ = seed_base(conn)
    seed_stock(
        conn,
        set_id,
        "ABN",
        {"value": ("3.0", 100), "growth": NC("input_missing"), "momentum": ("2.0", 99)},
        covered=False,
    )
    universe = save(conn, "With uncovered", set_id, HIGH_VALUE)
    expected = ["AAA", "AAC", "ABN", "BAA", "BBB", "DDD"]
    assert member_symbols(universe) == expected
    assert oracle(conn, set_id, HIGH_VALUE) == expected
    # ABN was seeded last, so its id is the highest: the events still follow symbol order.
    assert added_symbols(conn, universe.universe_id) == expected


# --- TC-COMP-014: the saved Origin equals filter_provenance ----------------------------


def test_origin_equals_the_created_events_filter_provenance(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-014 (DAC-E1-S5-4, DAC-E1-3; bound encoding DEC-0248)."""
    set_id, _ = seed_base(conn)
    thresholds = Thresholds(
        bounds={"value_percentile_min": Decimal("80"), "growth_score_max": Decimal("1.5")},
        hide_incomplete=True,
        symbol="AA",
    )
    universe = save(conn, "Provenance", set_id, thresholds)
    assert member_symbols(universe) == ["AAA", "AAB"]

    provenance = created_provenance(conn, universe.universe_id)
    assert set(provenance) == {
        "set_id",
        "classification_date",
        "thresholds",
        "hide_incomplete",
        "symbol",
    }
    assert provenance["set_id"] == str(set_id)
    assert provenance["classification_date"] == "2026-10-15"
    assert provenance["thresholds"] == {"value_percentile_min": 80, "growth_score_max": 1.5}
    assert isinstance(provenance["thresholds"]["value_percentile_min"], int)  # DEC-0248
    assert provenance["hide_incomplete"] is True
    assert provenance["symbol"] == "AA"

    current = reader.current_set(conn)
    assert current is not None
    origin = service.get_universe(conn, universe.universe_id).origin
    assert origin.kind == "from_filter"
    assert origin.set_id == set_id
    assert origin.classification_date == SET_DATE == current.classification_date
    assert origin.thresholds == {
        "value_percentile_min": Decimal("80"),
        "growth_score_max": Decimal("1.5"),
    }
    assert origin.hide_incomplete is True
    assert origin.symbol == "AA"
    assert universe.origin == origin


def test_origin_without_a_search_hidden_stocks_or_bounds(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-014 (``symbol`` null, ``hide_incomplete`` false, empty thresholds)."""
    set_id, _ = seed_base(conn)
    plain = save(conn, "Plain", set_id, Thresholds(bounds={"value_percentile_min": Decimal("80")}))
    provenance = created_provenance(conn, plain.universe_id)
    assert provenance["symbol"] is None
    assert provenance["hide_incomplete"] is False
    assert plain.origin.symbol is None
    assert plain.origin.hide_incomplete is False

    unbounded = save(conn, "Unbounded", set_id, Thresholds())
    assert created_provenance(conn, unbounded.universe_id)["thresholds"] == {}
    assert unbounded.origin.thresholds == {}

    listed, _ = service.list_universes(conn, "active", None, 50, None)
    by_id = {u.universe_id: u.origin for u in listed}
    assert by_id[plain.universe_id] == plain.origin
    assert by_id[unbounded.universe_id] == unbounded.origin


def test_a_by_hand_universe_keeps_a_by_hand_origin(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-014 (CAP-002-E1-S3's create path is unaffected)."""
    seed_base(conn)
    universe = service.create_by_hand(conn, "Hand", ["AAA"])
    conn.commit()
    origin = service.get_universe(conn, universe.universe_id).origin
    assert origin == service.Origin("by_hand", None, None, None, None, None)


# --- TC-COMP-013: a newer complete set refuses the snapshot ----------------------------

NEWER = T0 + timedelta(days=1)


def seed_newer_complete(conn: psycopg.Connection, ids: dict[str, int]) -> UUID:
    """A second complete set, ended later, classifying the base stocks the same way."""
    newer = seed_set(conn, classification_date=SET_DATE + timedelta(days=1), ended_at=NEWER)
    for symbol, cells in BASE.items():
        classify(conn, newer, ids[symbol], cells)
    return newer


def test_a_newer_complete_set_raises_and_writes_nothing(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-013 (a, b; DAC-E1-S5-2)."""
    old, ids = seed_base(conn)
    new = seed_newer_complete(conn, ids)
    before = written(conn)

    with pytest.raises(service.ClassificationSetChanged) as refused:
        service.create_from_filter(conn, "Old", old, HIGH_VALUE)
    assert isinstance(refused.value, ValueError)
    assert refused.value.requested_set_id == old
    assert refused.value.current_set_id == new
    conn.rollback()
    assert written(conn) == before

    universe = save(conn, "Old", new, HIGH_VALUE)
    assert universe.origin.set_id == new
    assert universe.origin.classification_date == SET_DATE + timedelta(days=1)
    assert member_symbols(universe) == oracle(conn, new, HIGH_VALUE)


@pytest.mark.parametrize("building", [True, False])
def test_no_complete_set_raises_with_no_current_id(
    conn: psycopg.Connection, building: bool
) -> None:
    """Implements TC-COMP-013 (c): only a building set, or none at all."""
    requested = seed_set(conn, state="building", ended_at=None) if building else UUID(int=7)
    before = written(conn)
    with pytest.raises(service.ClassificationSetChanged) as refused:
        service.create_from_filter(conn, "None current", requested, Thresholds())
    assert refused.value.requested_set_id == requested
    assert refused.value.current_set_id is None
    conn.rollback()
    assert written(conn) == before


def test_an_unknown_set_id_is_refused_as_changed(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-013 (d): not a database error."""
    current, _ = seed_base(conn)
    unknown = UUID("00000000-0000-4000-8000-000000000001")
    before = written(conn)
    with pytest.raises(service.ClassificationSetChanged) as refused:
        service.create_from_filter(conn, "Unknown", unknown, HIGH_VALUE)
    assert refused.value.requested_set_id == unknown
    assert refused.value.current_set_id == current
    conn.rollback()
    assert written(conn) == before


@pytest.mark.parametrize("state", ["building", "failed"])
def test_a_later_unfinished_set_does_not_make_the_current_one_stale(
    conn: psycopg.Connection, state: str
) -> None:
    """Implements TC-COMP-013 (e): ``later`` is not a change (DAC-E1-2)."""
    current, _ = seed_base(conn)
    seed_set(
        conn,
        state=state,
        started_at=NEWER,
        ended_at=None if state == "building" else NEWER + timedelta(hours=1),
    )
    blocks = reader.read_set_blocks(conn)
    assert blocks[0] is not None and blocks[0].set_id == current
    assert blocks[1] is not None  # the later attempt exists
    universe = save(conn, "Still current", current, HIGH_VALUE)
    assert member_symbols(universe) == ["AAA", "AAC", "BAA", "BBB", "DDD"]


def test_a_stale_set_is_reported_before_the_name_and_the_empty_result(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-013 (f): design 2.4 step 3 precedes steps 3a and 6."""
    old, ids = seed_base(conn)
    new = seed_newer_complete(conn, ids)
    save(conn, "Taken", new, HIGH_VALUE)
    before = written(conn)
    with pytest.raises(service.ClassificationSetChanged):
        service.create_from_filter(conn, "Taken", old, HIGH_VALUE)
    conn.rollback()
    nothing = Thresholds(bounds={"value_score_min": Decimal("100")})
    with pytest.raises(service.ClassificationSetChanged):
        service.create_from_filter(conn, "Nothing", old, nothing)
    conn.rollback()
    assert written(conn) == before


# --- TC-COMP-039: a filter matching no stock is refused -------------------------------


NOTHING = Thresholds(bounds={"value_score_min": Decimal("100")})  # above every seeded score


def test_thresholds_matching_no_stock_raise_empty_universe(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-039 (a; DAC-E1-S5-3, AC-5)."""
    set_id, _ = seed_base(conn)
    assert oracle(conn, set_id, NOTHING) == []
    before = written(conn)
    with pytest.raises(service.EmptyUniverse) as refused:
        service.create_from_filter(conn, "Empty", set_id, NOTHING)
    assert isinstance(refused.value, ValueError)
    conn.rollback()
    assert written(conn) == before


def test_a_set_with_an_empty_scope_raises_empty_universe(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-039 (b): a complete set with no classification rows."""
    seed_instrument(conn, "AAA")
    conn.commit()
    set_id = seed_set(conn)
    before = written(conn)
    with pytest.raises(service.EmptyUniverse):
        service.create_from_filter(conn, "Empty scope", set_id, Thresholds())
    conn.rollback()
    assert written(conn) == before


def test_hiding_every_incomplete_stock_can_leave_nothing(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-039 (c): every stock input-incomplete, ``hide_incomplete`` on."""
    set_id = seed_set(conn)
    for symbol, reason in [("III", "input_missing"), ("JJJ", "input_outdated")]:
        seed_stock(conn, set_id, symbol, {"momentum": NC(reason)})
    hide = Thresholds(hide_incomplete=True)
    assert oracle(conn, set_id, hide) == []
    with pytest.raises(service.EmptyUniverse):
        service.create_from_filter(conn, "All hidden", set_id, hide)
    conn.rollback()
    assert member_symbols(save(conn, "All shown", set_id, Thresholds())) == ["III", "JJJ"]


def test_a_prefix_matching_nothing_raises_empty_universe(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-039 (d)."""
    set_id, _ = seed_base(conn)
    before = written(conn)
    with pytest.raises(service.EmptyUniverse):
        service.create_from_filter(conn, "ZZ", set_id, Thresholds(symbol="ZZ"))
    conn.rollback()
    assert written(conn) == before


def test_an_empty_result_is_reported_before_the_name(conn: psycopg.Connection) -> None:
    """Implements TC-COMP-039 (e, f): node 3a precedes step 6; a refusal leaves nothing."""
    set_id, _ = seed_base(conn)
    save(conn, "Taken", set_id, HIGH_VALUE)
    with pytest.raises(service.EmptyUniverse):
        service.create_from_filter(conn, "Taken", set_id, NOTHING)
    conn.rollback()

    before = written(conn)
    with pytest.raises(service.EmptyUniverse):
        service.create_from_filter(conn, "Fresh", set_id, NOTHING)
    conn.rollback()
    assert written(conn) == before
    universe = save(conn, "Fresh", set_id, HIGH_VALUE)
    assert member_symbols(universe) == ["AAA", "AAC", "BAA", "BBB", "DDD"]
    assert written(conn) == (before[0] + 1, before[1] + 6)


# --- TC-COMP-015: hide_incomplete decides membership of incomplete stocks ---------------


def seed_incompleteness(conn: psycopg.Connection, inc_reason: str) -> UUID:
    """OKK complete, INC input-incomplete on value, NER unranked on growth, RET retired.

    The momentum bound of ``MOMENTUM`` admits all four: INC, NER and OKK are classified on
    momentum above it, RET is not classified on momentum. Only the reader's unscoped scope
    (active instruments only, DEC-0073) keeps RET out.
    """
    set_id = seed_set(conn)
    seed_stock(conn, set_id, "OKK", {"momentum": ("0.5", 70)})
    seed_stock(conn, set_id, "INC", {"value": NC(inc_reason), "momentum": ("0.3", 60)})
    seed_stock(conn, set_id, "NER", {"growth": NC("not_enough_stocks"), "momentum": ("0.2", 55)})
    retired = seed_instrument(conn, "RET", lifecycle="retired")
    for factor in FACTORS:
        seed_not_classified(conn, set_id, retired, factor, "retired")
    conn.commit()
    return set_id


MOMENTUM = {"momentum_score_min": Decimal("0")}


@pytest.mark.parametrize("reason", ["input_missing", "input_outdated", "input_not_computable"])
def test_hide_incomplete_hides_exactly_the_input_reason_stocks(
    conn: psycopg.Connection, reason: str
) -> None:
    """Implements TC-COMP-015 (DAC-E1-S5-5; DEC-0079 (a), (b))."""
    set_id = seed_incompleteness(conn, reason)

    shown = Thresholds(bounds=MOMENTUM, hide_incomplete=False)
    kept = save(conn, "Shown", set_id, shown)
    assert member_symbols(kept) == ["INC", "NER", "OKK"]
    assert oracle(conn, set_id, shown) == ["INC", "NER", "OKK"]
    assert created_provenance(conn, kept.universe_id)["hide_incomplete"] is False
    assert kept.origin.hide_incomplete is False

    hidden = Thresholds(bounds=MOMENTUM, hide_incomplete=True)
    pruned = save(conn, "Hidden", set_id, hidden)
    assert member_symbols(pruned) == ["NER", "OKK"]  # not_enough_stocks never hides
    assert oracle(conn, set_id, hidden) == ["NER", "OKK"]
    assert created_provenance(conn, pruned.universe_id)["hide_incomplete"] is True
    assert pruned.origin.hide_incomplete is True

    every = save(conn, "Every", set_id, Thresholds())
    assert "RET" not in member_symbols(every)  # unscoped: active instruments only (DEC-0073)


# --- TC-COMP-016: later sets do not change a saved snapshot ---------------------------


def test_a_later_set_that_changes_the_matches_leaves_the_members_unchanged(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-016 (DAC-E1-S5-6, AC-2)."""
    old, ids = seed_base(conn)
    universe = save(conn, "Frozen", old, HIGH_VALUE)
    today = datetime.now(ZoneInfo("America/Chicago")).date()
    before = service.get_universe(conn, universe.universe_id)
    before_events = event_rows(conn, universe.universe_id)
    as_of_before = service.get_universe(conn, universe.universe_id, as_of=today)
    assert as_of_before.members == before.members  # today's read is not empty

    newer = seed_set(conn, classification_date=SET_DATE + timedelta(days=1), ended_at=NEWER)
    changed = dict(BASE)
    changed["AAA"] = {"value": ("0.1", 10), "momentum": ("0.5", 70)}  # an old member now fails
    changed["CCC"] = {"value": ("1.4", 92), "momentum": ("1.2", 95)}  # a non-member now passes
    for symbol, cells in changed.items():
        classify(conn, newer, ids[symbol], cells)
    current = reader.current_set(conn)
    assert current is not None and current.set_id == newer
    now_matching = oracle(conn, newer, HIGH_VALUE)
    assert now_matching == ["AAC", "BAA", "BBB", "CCC", "DDD"]
    assert now_matching != member_symbols(before)  # the test cannot pass vacuously

    after = service.get_universe(conn, universe.universe_id)
    assert after.members == before.members
    assert member_symbols(after) == ["AAA", "AAC", "BAA", "BBB", "DDD"]
    assert after.origin == before.origin
    assert after.origin.set_id == old and after.origin.classification_date == SET_DATE
    assert event_rows(conn, universe.universe_id) == before_events
    assert service.get_universe(conn, universe.universe_id, as_of=today) == as_of_before
    listed, _ = service.list_universes(conn, "active", None, 50, None)
    (same,) = [u for u in listed if u.universe_id == universe.universe_id]
    assert same.members == before.members


# --- additional: search then save, one predicate, unique members ----------------------


def test_search_then_save_keeps_only_the_prefix_matches(conn: psycopg.Connection) -> None:
    """Design section 7 'Search then save' (DAC-E1-2, S03-7)."""
    set_id, _ = seed_base(conn)
    searched = Thresholds(bounds=dict(HIGH_VALUE.bounds), symbol="AA")
    universe = save(conn, "Searched", set_id, searched)
    assert member_symbols(universe) == ["AAA", "AAC"]  # not BAA
    assert oracle(conn, set_id, searched) == ["AAA", "AAC"]
    assert created_provenance(conn, universe.universe_id)["symbol"] == "AA"

    unsearched = save(conn, "Unsearched", set_id, HIGH_VALUE)
    assert member_symbols(unsearched) == ["AAA", "AAC", "BAA", "BBB", "DDD"]
    assert created_provenance(conn, unsearched.universe_id)["symbol"] is None


def _listed_ids(conn: psycopg.Connection, thresholds: Thresholds) -> list[int]:
    ids: list[int] = []
    cursor: str | None = None
    while True:
        page = reader.list_classifications(
            conn, ListFilters(thresholds=thresholds, limit=MAX_PAGE_SIZE, cursor=cursor)
        )
        ids += [row.instrument_id for row in page.stocks]
        cursor = page.next_cursor
        if cursor is None:
            return sorted(ids)


@pytest.mark.parametrize(
    "thresholds",
    [
        HIGH_VALUE,
        Thresholds(bounds={"growth_score_max": Decimal("0.2")}, hide_incomplete=True),
        Thresholds(symbol="B"),
    ],
)
def test_the_threshold_the_list_shows_is_the_threshold_saved(
    conn: psycopg.Connection, thresholds: Thresholds
) -> None:
    """Design section 7 (DEC-0076: the list and the snapshot share one predicate)."""
    set_id, _ = seed_base(conn)
    universe = save(conn, "Listed", set_id, thresholds)
    assert sorted(m.instrument_id for m in universe.members) == _listed_ids(conn, thresholds)


def test_a_duplicate_id_from_the_filter_gives_one_member(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Members are unique even if ``evaluate_filter`` returned an id twice."""
    set_id, ids = seed_base(conn)
    monkeypatch.setattr(
        service, "evaluate_filter", lambda *_args: [ids["BBB"], ids["AAA"], ids["BBB"]]
    )
    before = count_events(conn)
    universe = save(conn, "Twice", set_id, HIGH_VALUE)
    assert member_symbols(universe) == ["AAA", "BBB"]
    assert count_events(conn) == before + 3  # created + two member_added


# --- write rules shared with CAP-002-E1-S3: names, lock, rollback ----------------------


def _refuse(*_args: object) -> None:
    raise AssertionError("the reader was reached")


@pytest.mark.parametrize("name", ["", "   ", "\t\n"])
def test_an_empty_name_is_refused_before_the_reader_is_called(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch, name: str
) -> None:
    """T009 (a): the name's shape is design 2.4 step 2, before the set check."""
    set_id, _ = seed_base(conn)
    before = written(conn)
    monkeypatch.setattr(service, "current_set", _refuse)
    monkeypatch.setattr(service, "evaluate_filter", _refuse)
    with pytest.raises(ValueError) as refused:
        service.create_from_filter(conn, name, set_id, HIGH_VALUE)
    assert type(refused.value) is ValueError
    conn.rollback()
    assert written(conn) == before


def test_a_long_name_is_accepted_and_trimmed(conn: psycopg.Connection) -> None:
    """T009 (a): no length bound exists (owner's open question)."""
    set_id, _ = seed_base(conn)
    long_name = "x" * 10_000
    assert save(conn, f"  {long_name}\t", set_id, HIGH_VALUE).name == long_name


@pytest.mark.parametrize("holder", ["by_hand", "from_filter"])
def test_an_active_universe_holding_the_name_refuses(conn: psycopg.Connection, holder: str) -> None:
    """T009 (b): ``UniverseNameInUse``; nothing written; a retired name is free again."""
    set_id, _ = seed_base(conn)
    if holder == "by_hand":
        held = service.create_by_hand(conn, "Taken", ["AAA"])
        conn.commit()
    else:
        held = save(conn, "Taken", set_id, HIGH_VALUE)
    before = written(conn)
    with pytest.raises(service.UniverseNameInUse):
        service.create_from_filter(conn, "  Taken ", set_id, HIGH_VALUE)
    conn.rollback()
    assert written(conn) == before

    conn.execute(
        "INSERT INTO universe_event (universe_id, event_type) VALUES (%s, 'retired')",
        (held.universe_id,),
    )
    conn.commit()
    assert save(conn, "Taken", set_id, HIGH_VALUE).name == "Taken"


def _lock_waiters(watcher: psycopg.Connection) -> int:
    row = watcher.execute(
        "SELECT count(*) FROM pg_locks WHERE locktype = 'advisory' AND NOT granted"
    ).fetchone()
    assert row is not None
    return int(row[0])


def _wait_for_waiter(watcher: psycopg.Connection) -> None:
    deadline = time.monotonic() + 5
    while _lock_waiters(watcher) == 0 and time.monotonic() < deadline:
        time.sleep(0.02)
    assert _lock_waiters(watcher) == 1, "the snapshot never reached the write lock"


def test_the_snapshot_waits_on_the_write_lock(
    conn: psycopg.Connection, migrated_db_through_0006: str
) -> None:
    """T009 (c): the lock is taken first (DEC-0065), as S3's TC-COMP-019."""
    set_id, _ = seed_base(conn)
    conn_b = psycopg.connect(migrated_db_through_0006)
    watcher = psycopg.connect(migrated_db_through_0006, autocommit=True)
    outcome: list[BaseException | service.Universe] = []

    def snapshot() -> None:
        try:
            outcome.append(service.create_from_filter(conn_b, "Waited", set_id, HIGH_VALUE))
            conn_b.commit()
        except BaseException as exc:  # noqa: BLE001 - captured for the assertion below
            outcome.append(exc)

    thread = threading.Thread(target=snapshot, daemon=True)
    try:
        conn.execute("SELECT pg_advisory_xact_lock(%s)", (service.UNIVERSE_WRITE_LOCK_KEY,))
        thread.start()
        _wait_for_waiter(watcher)
        assert outcome == [], "the snapshot proceeded without the lock"
        conn.commit()
        thread.join(timeout=10)
        assert not thread.is_alive()
    finally:
        conn_b.close()
        watcher.close()

    assert len(outcome) == 1 and isinstance(outcome[0], service.Universe)
    assert member_symbols(service.get_universe(conn, outcome[0].universe_id)) == [
        "AAA",
        "AAC",
        "BAA",
        "BBB",
        "DDD",
    ]


def test_a_same_name_create_under_the_lock_wins_the_race(
    conn: psycopg.Connection, migrated_db_through_0006: str
) -> None:
    """T009 (d): serialisation, never two active ``Race`` universes."""
    set_id, _ = seed_base(conn)
    conn_b = psycopg.connect(migrated_db_through_0006)
    watcher = psycopg.connect(migrated_db_through_0006, autocommit=True)
    outcome: list[BaseException | str] = []

    def snapshot() -> None:
        try:
            service.create_from_filter(conn_b, "Race", set_id, HIGH_VALUE)
            conn_b.commit()
            outcome.append("created")
        except BaseException as exc:  # noqa: BLE001 - captured for the assertion below
            outcome.append(exc)

    thread = threading.Thread(target=snapshot, daemon=True)
    try:
        conn.execute("SELECT pg_advisory_xact_lock(%s)", (service.UNIVERSE_WRITE_LOCK_KEY,))
        thread.start()
        _wait_for_waiter(watcher)
        service.create_by_hand(conn, "Race", ["AAA"])  # re-entrant in the same session
        conn.commit()
        thread.join(timeout=10)
        assert not thread.is_alive()
    finally:
        conn_b.close()
        watcher.close()

    assert len(outcome) == 1 and isinstance(outcome[0], service.UniverseNameInUse)
    row = conn.execute(
        "SELECT count(*) FROM universe_event WHERE event_type = 'created' AND name = 'Race'"
    ).fetchone()
    assert row == (1,)


def test_a_failed_member_insert_rolls_the_whole_snapshot_back(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    """T009 (e): the error propagates unchanged (SEC-ERR-001); nothing survives."""
    set_id, _ = seed_base(conn)
    before = written(conn)
    failure = errors.OperationalError("member insert failed")

    def broken(*_args: object, **_kwargs: object) -> None:
        raise failure

    monkeypatch.setattr(psycopg.Cursor, "executemany", broken)
    with pytest.raises(errors.OperationalError) as raised:
        service.create_from_filter(conn, "Broken", set_id, HIGH_VALUE)
    assert raised.value is failure
    conn.rollback()
    assert written(conn) == before


def test_a_reader_error_propagates_and_nothing_is_written(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    """T009 (f): the reader's own failure is not swallowed."""
    set_id, _ = seed_base(conn)
    before = written(conn)
    failure = RuntimeError("reader failed")

    def broken(*_args: object) -> None:
        raise failure

    monkeypatch.setattr(service, "current_set", broken)
    with pytest.raises(RuntimeError) as raised:
        service.create_from_filter(conn, "Reader", set_id, HIGH_VALUE)
    assert raised.value is failure
    conn.rollback()
    assert written(conn) == before


def test_the_caller_owns_the_transaction(conn: psycopg.Connection) -> None:
    """T009 (g): one connection, one transaction; the function never commits."""
    set_id, _ = seed_base(conn)
    before = written(conn)
    conn.execute("SELECT 1")  # the caller's own open transaction
    universe = service.create_from_filter(conn, "Outer", set_id, HIGH_VALUE)
    assert conn.info.transaction_status == TransactionStatus.INTRANS
    conn.rollback()  # the caller did not commit, so the universe is gone
    assert written(conn) == before
    with pytest.raises(service.UniverseNotFound):
        service.get_universe(conn, universe.universe_id)

    committed = save(conn, "Outer", set_id, HIGH_VALUE)
    assert conn.info.transaction_status == TransactionStatus.IDLE
    assert service.get_universe(conn, committed.universe_id).name == "Outer"
