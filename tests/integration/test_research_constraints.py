"""PostgreSQL constraints on the universe tables (migration 0005) and the
classification tables (migration 0006)."""

import uuid
from collections.abc import Callable, Iterator
from datetime import UTC, date, datetime
from typing import Any

import psycopg
import pytest

from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import apply_pending, discover

pytestmark = pytest.mark.postgres


@pytest.fixture
def universe_connection(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    """A connection to a store migrated through 0005, with one instrument."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        files = [f for f in discover(MIGRATIONS_DIR) if f.version <= 5]
        assert apply_pending(conn, files) == [1, 2, 3, 4, 5]
        with conn.cursor() as cur:
            cur.execute("INSERT INTO instrument (symbol, lifecycle) VALUES ('ABC', 'active')")
        conn.commit()
        yield conn
    finally:
        conn.close()


def _instrument_id(conn: psycopg.Connection) -> int:
    with conn.cursor() as cur:
        cur.execute("SELECT instrument_id FROM instrument WHERE symbol = 'ABC'")
        row = cur.fetchone()
    assert row is not None
    return int(row[0])


def _new_universe(conn: psycopg.Connection) -> str:
    with conn.cursor() as cur:
        cur.execute("INSERT INTO universe DEFAULT VALUES RETURNING universe_id")
        row = cur.fetchone()
    assert row is not None
    return str(row[0])


def _insert_event(
    conn: psycopg.Connection,
    universe_id: str,
    event_type: str,
    instrument_id: int | None = None,
    name: str | None = None,
    filter_provenance: str | None = None,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO universe_event "
            "(universe_id, event_type, instrument_id, name, filter_provenance) "
            "VALUES (%s, %s, %s, %s, %s::jsonb)",
            (universe_id, event_type, instrument_id, name, filter_provenance),
        )


# Implements TC-COMP-046
@pytest.mark.parametrize(
    ("event_type", "with_instrument", "name", "provenance", "constraint"),
    (
        ("exploded", False, None, None, "universe_event_type_known"),
        ("member_added", False, None, None, "universe_event_member_has_instrument"),
        ("member_removed", False, None, None, "universe_event_member_has_instrument"),
        ("renamed", True, "Name", None, "universe_event_member_has_instrument"),
        ("created", False, None, None, "universe_event_name_agrees"),
        ("renamed", False, None, None, "universe_event_name_agrees"),
        ("retired", False, "Name", None, "universe_event_name_agrees"),
        ("renamed", False, "Name", '{"set_id": "x"}', "universe_event_provenance_only_on_created"),
        ("created", False, " x", None, "universe_event_name_trimmed"),
        ("created", False, "x ", None, "universe_event_name_trimmed"),
        ("created", False, "", None, "universe_event_name_trimmed"),
    ),
)
def test_malformed_event_is_refused_by_its_named_constraint(
    universe_connection: psycopg.Connection,
    event_type: str,
    with_instrument: bool,
    name: str | None,
    provenance: str | None,
    constraint: str,
) -> None:
    universe_id = _new_universe(universe_connection)
    instrument_id = _instrument_id(universe_connection) if with_instrument else None

    with pytest.raises(psycopg.errors.CheckViolation) as refused:
        _insert_event(universe_connection, universe_id, event_type, instrument_id, name, provenance)

    assert refused.value.diag.constraint_name == constraint


# Implements TC-COMP-034
@pytest.mark.parametrize(
    ("event_type", "name", "index"),
    (
        ("created", "Name", "idx_universe_event_single_created"),
        ("retired", None, "idx_universe_event_single_retired"),
    ),
)
def test_a_second_created_or_retired_event_is_refused(
    universe_connection: psycopg.Connection,
    event_type: str,
    name: str | None,
    index: str,
) -> None:
    universe_id = _new_universe(universe_connection)
    _insert_event(universe_connection, universe_id, event_type, name=name)

    with pytest.raises(psycopg.errors.UniqueViolation) as refused:
        _insert_event(universe_connection, universe_id, event_type, name=name)

    assert refused.value.diag.constraint_name == index


# Implements TC-COMP-046, TC-COMP-034
def test_a_valid_lifecycle_is_accepted_and_events_are_ordered(
    universe_connection: psycopg.Connection,
) -> None:
    instrument_id = _instrument_id(universe_connection)
    universe_id = _new_universe(universe_connection)

    _insert_event(
        universe_connection,
        universe_id,
        "created",
        name="Growth",
        filter_provenance='{"set_id": "s", "hide_incomplete": false}',
    )
    _insert_event(universe_connection, universe_id, "renamed", name="Growth 2")
    _insert_event(universe_connection, universe_id, "member_added", instrument_id)
    _insert_event(universe_connection, universe_id, "member_removed", instrument_id)
    _insert_event(universe_connection, universe_id, "retired")

    with universe_connection.cursor() as cur:
        cur.execute(
            "SELECT event_type, recorded_on IS NOT NULL, event_id FROM universe_event "
            "WHERE universe_id = %s ORDER BY event_id",
            (universe_id,),
        )
        rows = cur.fetchall()
    assert [row[0] for row in rows] == [
        "created",
        "renamed",
        "member_added",
        "member_removed",
        "retired",
    ]
    assert all(row[1] for row in rows)
    event_ids = [row[2] for row in rows]
    assert event_ids == sorted(set(event_ids))


# Implements AC-3
def test_one_instrument_may_belong_to_two_universes(
    universe_connection: psycopg.Connection,
) -> None:
    instrument_id = _instrument_id(universe_connection)
    first = _new_universe(universe_connection)
    second = _new_universe(universe_connection)

    _insert_event(universe_connection, first, "member_added", instrument_id)
    _insert_event(universe_connection, second, "member_added", instrument_id)

    with universe_connection.cursor() as cur:
        cur.execute(
            "SELECT count(DISTINCT universe_id) FROM universe_event WHERE instrument_id = %s",
            (instrument_id,),
        )
        row = cur.fetchone()
    assert row is not None
    assert row[0] == 2


# Implements AC-3
def test_two_universes_may_each_be_created(universe_connection: psycopg.Connection) -> None:
    first = _new_universe(universe_connection)
    second = _new_universe(universe_connection)

    _insert_event(universe_connection, first, "created", name="Growth")
    _insert_event(universe_connection, second, "created", name="Value")

    with universe_connection.cursor() as cur:
        cur.execute("SELECT count(*) FROM universe_event WHERE event_type = 'created'")
        row = cur.fetchone()
    assert row is not None
    assert row[0] == 2


# Implements TC-COMP-046
def test_a_member_event_for_an_unknown_instrument_is_refused(
    universe_connection: psycopg.Connection,
) -> None:
    universe_id = _new_universe(universe_connection)
    unknown = _instrument_id(universe_connection) + 1000

    with pytest.raises(psycopg.errors.ForeignKeyViolation) as refused:
        _insert_event(universe_connection, universe_id, "member_added", unknown)

    assert refused.value.diag.constraint_name == "universe_event_instrument_id_fkey"


# Implements TC-COMP-046
def test_an_event_without_a_universe_is_refused(universe_connection: psycopg.Connection) -> None:
    with pytest.raises(psycopg.errors.NotNullViolation) as refused:
        with universe_connection.cursor() as cur:
            cur.execute("INSERT INTO universe_event (event_type) VALUES ('retired')")

    assert refused.value.diag.column_name == "universe_id"


# Implements TC-COMP-046
def test_an_event_id_is_never_reused(universe_connection: psycopg.Connection) -> None:
    first = _new_universe(universe_connection)
    second = _new_universe(universe_connection)
    _insert_event(universe_connection, first, "retired")

    with pytest.raises(psycopg.errors.UniqueViolation) as refused:
        with universe_connection.cursor() as cur:
            cur.execute(
                "INSERT INTO universe_event (event_id, universe_id, event_type) "
                "OVERRIDING SYSTEM VALUE "
                "SELECT event_id, %s, 'retired' FROM universe_event WHERE universe_id = %s",
                (second, first),
            )

    assert refused.value.diag.constraint_name == "universe_event_pkey"


# --- Migration 0006: classification tables (CAP-002-E2-S1) -------------------


@pytest.fixture
def classification_connection(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    """A connection to a store migrated through 0006, with one instrument."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        assert apply_pending(conn, discover(MIGRATIONS_DIR)) == [1, 2, 3, 4, 5, 6]
        with conn.cursor() as cur:
            cur.execute("INSERT INTO instrument (symbol, lifecycle) VALUES ('ABC', 'active')")
        conn.commit()
        yield conn
    finally:
        conn.close()


def insert_terminal_run(conn: psycopg.Connection) -> str:
    """Insert a run that is not active, so any number can coexist, and commit it."""
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (state, history_depth_years, ended_at) "
            "VALUES ('succeeded', 1, now()) RETURNING run_id"
        )
        row = cur.fetchone()
    assert row is not None
    conn.commit()
    return str(row[0])


def insert_classification_set(
    conn: psycopg.Connection,
    state: str = "building",
    run_id: str | None = None,
    **columns: Any,
) -> str:
    """Insert a set that satisfies every constraint for `state`, minus `columns` overrides.

    An override of None writes NULL, which is how a test removes a required column.
    The caller owns the transaction.
    """
    values: dict[str, Any] = {
        "run_id": run_id or insert_terminal_run(conn),
        "state": state,
        "classification_date": date(2026, 10, 24),
    }
    if state in ("complete", "failed"):
        values["ended_at"] = datetime(2026, 10, 24, 12, 0, tzinfo=UTC)
    if state == "complete":
        values["latest_trading_day"] = date(2026, 10, 23)
        values["active_instruments"] = 3
    if state == "failed":
        values["failure_reason"] = "RuntimeError: boom"
    values.update(columns)
    names = ", ".join(values)
    marks = ", ".join(["%s"] * len(values))
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO classification_set ({names}) VALUES ({marks}) RETURNING set_id",  # noqa: S608
            tuple(values.values()),
        )
        row = cur.fetchone()
    assert row is not None
    return str(row[0])


def _insert_factor_input(
    conn: psycopg.Connection, set_id: str, instrument_id: int, **columns: Any
) -> None:
    values: dict[str, Any] = {
        "set_id": set_id,
        "instrument_id": instrument_id,
        "factor": "momentum",
        "input_name": "return_3m",
        "status": "missing",
        "detail": "{}",
    }
    values.update(columns)
    names = ", ".join(values)
    marks = ", ".join("%s::jsonb" if name == "detail" else "%s" for name in values)
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO factor_input ({names}) VALUES ({marks})",  # noqa: S608
            tuple(values.values()),
        )


def _insert_classification(
    conn: psycopg.Connection, set_id: str, instrument_id: int, **columns: Any
) -> None:
    values: dict[str, Any] = {
        "set_id": set_id,
        "instrument_id": instrument_id,
        "factor": "momentum",
        "status": "classified",
        "score": 1.5,
        "percentile": 50,
    }
    values.update(columns)
    names = ", ".join(values)
    marks = ", ".join(["%s"] * len(values))
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO factor_classification ({names}) VALUES ({marks})",  # noqa: S608
            tuple(values.values()),
        )


def _refusal(
    conn: psycopg.Connection, error: type[psycopg.Error], statement: Callable[[], None]
) -> str | None:
    """Run `statement`, expect `error`, roll back, and return the constraint it names."""
    with pytest.raises(error) as refused:
        statement()
    conn.rollback()
    return refused.value.diag.constraint_name


def _scalar(conn: psycopg.Connection, query: str) -> Any:
    with conn.cursor() as cur:
        cur.execute(query)  # type: ignore[call-overload]
        row = cur.fetchone()
    assert row is not None
    return row[0]


# Implements TC-COMP-075
def test_a_second_set_for_the_same_run_is_refused(
    classification_connection: psycopg.Connection,
) -> None:
    conn = classification_connection
    run_id = insert_terminal_run(conn)
    insert_classification_set(conn, "complete", run_id)
    conn.commit()

    name = _refusal(
        conn,
        psycopg.errors.UniqueViolation,
        lambda: insert_classification_set(conn, "failed", run_id),
    )

    assert name == "classification_set_run_id_key"
    assert _scalar(conn, "SELECT count(*) FROM classification_set") == 1


# Implements TC-COMP-075
def test_a_set_naming_no_run_is_refused(classification_connection: psycopg.Connection) -> None:
    conn = classification_connection

    name = _refusal(
        conn,
        psycopg.errors.ForeignKeyViolation,
        lambda: insert_classification_set(conn, "building", str(uuid.uuid4())),
    )

    assert name == "classification_set_run_id_fkey"


# Implements TC-COMP-163
def test_only_one_building_set_is_allowed_but_terminal_sets_may_sit_beside_it(
    classification_connection: psycopg.Connection,
) -> None:
    conn = classification_connection
    first_run, second_run, third_run = (insert_terminal_run(conn) for _ in range(3))
    insert_classification_set(conn, "building", first_run)
    conn.commit()

    name = _refusal(
        conn,
        psycopg.errors.UniqueViolation,
        lambda: insert_classification_set(conn, "building", second_run),
    )
    assert name == "idx_classification_set_single_building"

    insert_classification_set(conn, "complete", second_run)
    insert_classification_set(conn, "failed", third_run)
    conn.commit()
    assert _scalar(conn, "SELECT count(*) FROM classification_set") == 3


# Implements TC-COMP-164
@pytest.mark.parametrize(
    ("state", "overrides", "constraint"),
    (
        ("complete", {"ended_at": None}, "classification_set_terminal_has_end"),
        ("complete", {"latest_trading_day": None}, "classification_set_complete_is_sized"),
        ("complete", {"active_instruments": None}, "classification_set_complete_is_sized"),
        ("failed", {"failure_reason": None}, "classification_set_failed_has_reason"),
    ),
)
def test_a_terminal_set_missing_a_required_column_is_refused(
    classification_connection: psycopg.Connection,
    state: str,
    overrides: dict[str, None],
    constraint: str,
) -> None:
    conn = classification_connection
    run_id = insert_terminal_run(conn)

    name = _refusal(
        conn,
        psycopg.errors.CheckViolation,
        lambda: insert_classification_set(conn, state, run_id, **overrides),
    )

    assert name == constraint


@pytest.fixture
def building_set(classification_connection: psycopg.Connection) -> tuple[str, int]:
    """A committed `building` set and the id of the instrument ABC."""
    conn = classification_connection
    set_id = insert_classification_set(conn, "building")
    conn.commit()
    return set_id, _instrument_id(conn)


# Implements TC-COMP-165
@pytest.mark.parametrize(
    ("columns", "constraint"),
    (
        (
            {"status": "classified", "reason_code": "retired"},
            "factor_classification_shape",
        ),
        (
            {
                "status": "not_classified",
                "score": 1.5,
                "percentile": None,
                "reason_code": "retired",
            },
            "factor_classification_shape",
        ),
        (
            {
                "status": "not_classified",
                "score": None,
                "percentile": None,
                "reason_code": "input_missing",
            },
            "factor_classification_reason_input_agrees",
        ),
        (
            {
                "status": "not_classified",
                "score": None,
                "percentile": None,
                "reason_code": "retired",
                "reason_input": "return_3m",
            },
            "factor_classification_reason_input_agrees",
        ),
        ({"percentile": 100.5}, "factor_classification_percentile_range"),
        ({"percentile": -1}, "factor_classification_percentile_range"),
    ),
)
def test_a_malformed_classification_row_is_refused_by_its_named_constraint(
    classification_connection: psycopg.Connection,
    building_set: tuple[str, int],
    columns: dict[str, Any],
    constraint: str,
) -> None:
    set_id, instrument_id = building_set
    conn = classification_connection

    name = _refusal(
        conn,
        psycopg.errors.CheckViolation,
        lambda: _insert_classification(conn, set_id, instrument_id, **columns),
    )

    assert name == constraint


# Implements TC-COMP-165
@pytest.mark.parametrize(
    "columns",
    (
        {"percentile": 0},
        {"percentile": 100},
        {
            "status": "not_classified",
            "score": None,
            "percentile": None,
            "reason_code": "input_missing",
            "reason_input": "return_3m",
        },
        {
            "status": "not_classified",
            "score": None,
            "percentile": None,
            "reason_code": "not_enough_stocks",
            "reason_detail": "18 of 30 stocks qualified",
        },
        {"status": "not_classified", "score": None, "percentile": None, "reason_code": "retired"},
    ),
)
def test_a_well_formed_classification_row_is_accepted(
    classification_connection: psycopg.Connection,
    building_set: tuple[str, int],
    columns: dict[str, Any],
) -> None:
    set_id, instrument_id = building_set
    conn = classification_connection

    _insert_classification(conn, set_id, instrument_id, **columns)
    conn.commit()

    assert _scalar(conn, "SELECT count(*) FROM factor_classification") == 1


# Implements TC-COMP-157
@pytest.mark.parametrize(
    ("columns", "constraint"),
    (
        ({"factor": "value", "input_name": "return_3m"}, "factor_input_name_matches_factor"),
        (
            {
                "status": "present",
                "value": None,
                "as_of": date(2026, 9, 30),
                "known_on": date(2026, 10, 1),
            },
            "factor_input_present_is_dated",
        ),
        (
            {"status": "present", "value": 1, "as_of": None, "known_on": date(2026, 10, 1)},
            "factor_input_present_is_dated",
        ),
        (
            {"status": "present", "value": 1, "as_of": date(2026, 9, 30), "known_on": None},
            "factor_input_present_is_dated",
        ),
    ),
)
def test_a_malformed_factor_input_is_refused_by_its_named_constraint(
    classification_connection: psycopg.Connection,
    building_set: tuple[str, int],
    columns: dict[str, Any],
    constraint: str,
) -> None:
    set_id, instrument_id = building_set
    conn = classification_connection

    name = _refusal(
        conn,
        psycopg.errors.CheckViolation,
        lambda: _insert_factor_input(conn, set_id, instrument_id, **columns),
    )

    assert name == constraint


# Implements TC-COMP-157
def test_a_present_dated_input_and_a_bare_missing_input_are_accepted(
    classification_connection: psycopg.Connection, building_set: tuple[str, int]
) -> None:
    set_id, instrument_id = building_set
    conn = classification_connection

    _insert_factor_input(
        conn,
        set_id,
        instrument_id,
        status="present",
        value=1,
        as_of=date(2026, 9, 30),
        known_on=date(2026, 10, 1),
    )
    _insert_factor_input(conn, set_id, instrument_id, input_name="return_6m", status="missing")
    conn.commit()

    assert _scalar(conn, "SELECT count(*) FROM factor_input") == 2


# Implements AC-20
@pytest.mark.parametrize(
    ("state", "overrides", "constraint"),
    (
        ("unknown", {}, "classification_set_state_known"),
        (
            "building",
            {"ended_at": datetime(2026, 10, 24, tzinfo=UTC)},
            "classification_set_terminal_has_end",
        ),
        ("building", {"failure_reason": "x"}, "classification_set_failed_has_reason"),
    ),
)
def test_set_level_edge_constraints_are_named(
    classification_connection: psycopg.Connection,
    state: str,
    overrides: dict[str, Any],
    constraint: str,
) -> None:
    conn = classification_connection
    run_id = insert_terminal_run(conn)

    name = _refusal(
        conn,
        psycopg.errors.CheckViolation,
        lambda: insert_classification_set(conn, state, run_id, **overrides),
    )

    assert name == constraint


# Implements AC-20
def test_set_factor_edge_constraints_are_named(
    classification_connection: psycopg.Connection, building_set: tuple[str, int]
) -> None:
    set_id, _ = building_set
    conn = classification_connection

    def insert(factor: str, count: int) -> None:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked) "
                "VALUES (%s, %s, %s, false)",
                (set_id, factor, count),
            )

    assert (
        _refusal(conn, psycopg.errors.CheckViolation, lambda: insert("quality", 0))
        == "classification_set_factor_known"
    )
    assert (
        _refusal(conn, psycopg.errors.CheckViolation, lambda: insert("value", -1))
        == "classification_set_factor_count_nonnegative"
    )
    insert("value", 0)
    conn.commit()
    assert (
        _refusal(conn, psycopg.errors.UniqueViolation, lambda: insert("value", 1))
        == "classification_set_factor_pkey"
    )


# Implements AC-20
def test_input_and_classification_edge_constraints_are_named(
    classification_connection: psycopg.Connection, building_set: tuple[str, int]
) -> None:
    set_id, instrument_id = building_set
    conn = classification_connection

    assert (
        _refusal(
            conn,
            psycopg.errors.CheckViolation,
            lambda: _insert_factor_input(conn, set_id, instrument_id, status="stale"),
        )
        == "factor_input_status_known"
    )
    assert (
        _refusal(
            conn,
            psycopg.errors.CheckViolation,
            lambda: _insert_classification(
                conn,
                set_id,
                instrument_id,
                status="not_classified",
                score=None,
                percentile=None,
                reason_code="unknown",
            ),
        )
        == "factor_classification_reason_known"
    )
    # PostgreSQL tests CHECK constraints in name order, and a status outside the
    # set also breaks the shape CHECK, which sorts first, so it is the one reported.
    assert (
        _refusal(
            conn,
            psycopg.errors.CheckViolation,
            lambda: _insert_classification(conn, set_id, instrument_id, status="maybe"),
        )
        == "factor_classification_shape"
    )
    assert (
        _refusal(
            conn,
            psycopg.errors.CheckViolation,
            lambda: _insert_classification(conn, set_id, instrument_id, factor="quality"),
        )
        == "factor_classification_factor_known"
    )


# Implements AC-20
def test_every_classification_table_refuses_a_set_that_does_not_exist(
    classification_connection: psycopg.Connection,
) -> None:
    conn = classification_connection
    instrument_id = _instrument_id(conn)
    missing = str(uuid.uuid4())

    def insert_set_factor() -> None:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked) "
                "VALUES (%s, 'value', 0, false)",
                (missing,),
            )

    assert (
        _refusal(conn, psycopg.errors.ForeignKeyViolation, insert_set_factor)
        == "classification_set_factor_set_id_fkey"
    )
    assert (
        _refusal(
            conn,
            psycopg.errors.ForeignKeyViolation,
            lambda: _insert_factor_input(conn, missing, instrument_id),
        )
        == "factor_input_set_id_fkey"
    )
    assert (
        _refusal(
            conn,
            psycopg.errors.ForeignKeyViolation,
            lambda: _insert_classification(conn, missing, instrument_id),
        )
        == "factor_classification_set_id_fkey"
    )


# Implements AC-20
def test_indexes_and_column_types_match_the_design(
    classification_connection: psycopg.Connection,
) -> None:
    conn = classification_connection
    with conn.cursor() as cur:
        cur.execute(
            "SELECT indexname, indexdef FROM pg_indexes "
            "WHERE schemaname = 'public' AND (indexname LIKE 'idx\\_classification%' "
            "OR indexname LIKE 'idx\\_factor%')"
        )
        indexes = dict(cur.fetchall())
        cur.execute(
            "SELECT table_name, column_name, data_type, numeric_precision, numeric_scale, "
            "is_nullable FROM information_schema.columns "
            "WHERE table_schema = 'public' AND (table_name, column_name) IN "
            "(('factor_input', 'value'), ('factor_input', 'detail'), "
            "('factor_classification', 'score'), ('factor_classification', 'percentile'))"
        )
        columns = {(row[0], row[1]): row[2:] for row in cur.fetchall()}

    assert set(indexes) == {
        "idx_classification_set_single_building",
        "idx_classification_set_complete_recent",
        "idx_classification_set_started",
        "idx_factor_input_instrument",
        "idx_factor_classification_instrument",
        "idx_factor_classification_set_factor_score",
        "idx_factor_classification_set_factor_percentile",
    }
    single = indexes["idx_classification_set_single_building"]
    assert "UNIQUE" in single
    assert "WHERE (state = 'building'::text)" in single
    assert columns[("factor_input", "value")] == ("numeric", 30, 10, "YES")
    assert columns[("factor_classification", "score")] == ("numeric", 18, 6, "YES")
    assert columns[("factor_classification", "percentile")] == ("numeric", 9, 6, "YES")
    assert columns[("factor_input", "detail")] == ("jsonb", None, None, "NO")


# Implements AC-19
def test_restated_possible_defaults_to_false_on_inputs_and_classifications(
    classification_connection: psycopg.Connection, building_set: tuple[str, int]
) -> None:
    set_id, instrument_id = building_set
    conn = classification_connection

    _insert_factor_input(conn, set_id, instrument_id)
    _insert_classification(conn, set_id, instrument_id)
    conn.commit()

    assert _scalar(conn, "SELECT restated_possible FROM factor_input") is False
    assert _scalar(conn, "SELECT restated_possible FROM factor_classification") is False
