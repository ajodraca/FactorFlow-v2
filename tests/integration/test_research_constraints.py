"""PostgreSQL constraints on the universe tables (migration 0005)."""

from collections.abc import Iterator

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
