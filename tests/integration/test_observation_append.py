"""PostgreSQL contract tests for append-only point-in-time observations."""

from collections.abc import Iterator
from pathlib import Path

import psycopg
import pytest
from psycopg.errors import CheckViolation

REPO_ROOT = Path(__file__).resolve().parents[2]
MIGRATION_PATHS = (
    REPO_ROOT / "migrations" / "0001_extensions_owner_state.sql",
    REPO_ROOT / "migrations" / "0002_observations.sql",
)
OBSERVATION_TABLES = (
    "instrument_reference",
    "daily_bar",
    "fundamental_observation",
    "corporate_action",
)
VALID_HASH = b"a" * 32
RESTATED_HASH = b"b" * 32

INSERTS = {
    "instrument_reference": (
        "INSERT INTO instrument_reference (instrument_id, observed_on, value_hash, payload) "
        "VALUES (%s, %s, %s, '{}'::jsonb) ON CONFLICT DO NOTHING"
    ),
    "daily_bar": (
        "INSERT INTO daily_bar "
        "(instrument_id, session_date, observed_on, value_hash, open_price, high_price, "
        "low_price, close_price, volume) "
        "VALUES (%s, DATE '2026-01-02', %s, %s, 10.1, 10.2, 10.0, 10.15, 1000.25) "
        "ON CONFLICT DO NOTHING"
    ),
    "fundamental_observation": (
        "INSERT INTO fundamental_observation "
        "(instrument_id, fiscal_period_end, fiscal_period, statement_type, observed_on, "
        "value_hash, provider_filing_date, payload) "
        "VALUES (%s, DATE '2025-12-31', 'FY', 'income_statement', %s, %s, "
        "DATE '2026-02-15', '{}'::jsonb) ON CONFLICT DO NOTHING"
    ),
    "corporate_action": (
        "INSERT INTO corporate_action "
        "(instrument_id, action_type, effective_on, observed_on, value_hash, payload) "
        "VALUES (%s, 'split', DATE '2026-01-03', %s, %s, '{}'::jsonb) "
        "ON CONFLICT DO NOTHING"
    ),
}


@pytest.fixture
def observation_connection(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    """Yield a connection with migrations 0001 and 0002 applied."""
    connection = psycopg.connect(postgres_connection_string)
    with connection.cursor() as cursor:
        for migration_path in MIGRATION_PATHS:
            cursor.execute(migration_path.read_text())
        cursor.execute("INSERT INTO instrument (symbol, lifecycle) VALUES ('AAPL', 'active')")
    connection.commit()
    try:
        yield connection
    finally:
        connection.close()


def _instrument_id(connection: psycopg.Connection) -> int:
    with connection.cursor() as cursor:
        cursor.execute("SELECT instrument_id FROM instrument WHERE symbol = 'AAPL'")
        row = cursor.fetchone()
    assert row is not None
    return int(row[0])


def _insert_values(
    instrument_id: int, observed_on: str, value_hash: bytes
) -> tuple[int, str, bytes]:
    return (instrument_id, observed_on, value_hash)


# Implements TC-COMP-005
@pytest.mark.postgres
def test_all_observation_tables_exist(observation_connection: psycopg.Connection) -> None:
    with observation_connection.cursor() as cursor:
        cursor.execute(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'public' AND table_name = ANY(%s) ORDER BY table_name",
            (list(OBSERVATION_TABLES),),
        )
        tables = [row[0] for row in cursor.fetchall()]

    assert tables == sorted(OBSERVATION_TABLES)


# Implements TC-COMP-135
# Implements TC-COMP-150
@pytest.mark.postgres
def test_database_defaults_observed_on_and_keeps_filing_date_descriptive(
    observation_connection: psycopg.Connection,
) -> None:
    instrument_id = _instrument_id(observation_connection)
    with observation_connection.cursor() as cursor:
        cursor.execute("SET LOCAL TIME ZONE 'Etc/UTC'")
        cursor.execute(
            "INSERT INTO fundamental_observation "
            "(instrument_id, fiscal_period_end, fiscal_period, statement_type, value_hash, "
            "provider_filing_date, payload) "
            "VALUES (%s, DATE '2025-12-31', 'FY', 'income_statement', %s, "
            "DATE '2001-02-03', '{}'::jsonb) "
            "RETURNING observed_on, provider_filing_date, "
            "observed_on = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date",
            (instrument_id, VALID_HASH),
        )
        row = cursor.fetchone()
        cursor.execute(
            "SELECT table_name, column_default FROM information_schema.columns "
            "WHERE table_schema = 'public' AND table_name = ANY(%s) "
            "AND column_name = 'observed_on' ORDER BY table_name",
            (list(OBSERVATION_TABLES),),
        )
        defaults = dict(cursor.fetchall())
        cursor.execute(
            "SELECT (TIMESTAMPTZ '2026-03-10 04:30:00+00' AT TIME ZONE 'America/Chicago')::date"
        )
        controlled_chicago_date = cursor.fetchone()
        cursor.execute(
            "SELECT col_description('fundamental_observation'::regclass, ordinal_position) "
            "FROM information_schema.columns "
            "WHERE table_name = 'fundamental_observation' "
            "AND column_name = 'provider_filing_date'"
        )
        comment = cursor.fetchone()

    assert row is not None
    assert row[0] != row[1]
    assert row[2] is True
    assert defaults == {
        table: "((CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago'::text))::date"
        for table in OBSERVATION_TABLES
    }
    assert controlled_chicago_date is not None
    assert str(controlled_chicago_date[0]) == "2026-03-09"
    assert comment is not None
    assert comment[0] == "Descriptive provider field; never the observation as-of date."


# Implements TC-COMP-153
@pytest.mark.postgres
@pytest.mark.parametrize("table", OBSERVATION_TABLES)
@pytest.mark.parametrize("hash_length", (31, 33))
def test_value_hash_rejects_non_sha256_lengths(
    observation_connection: psycopg.Connection,
    table: str,
    hash_length: int,
) -> None:
    instrument_id = _instrument_id(observation_connection)

    with pytest.raises(CheckViolation) as raised, observation_connection.transaction():
        with observation_connection.cursor() as cursor:
            cursor.execute(
                INSERTS[table],
                _insert_values(instrument_id, "2026-01-10", b"x" * hash_length),
            )

    expected_constraint = {
        "instrument_reference": "instrument_reference_hash_len",
        "daily_bar": "daily_bar_hash_len",
        "fundamental_observation": "fundamental_hash_len",
        "corporate_action": "corporate_action_hash_len",
    }
    assert raised.value.diag.constraint_name == expected_constraint[table]


# Implements TC-COMP-154
@pytest.mark.postgres
def test_daily_bar_uses_exact_numeric_columns(
    observation_connection: psycopg.Connection,
) -> None:
    with observation_connection.cursor() as cursor:
        cursor.execute(
            "SELECT column_name, data_type, numeric_precision, numeric_scale "
            "FROM information_schema.columns WHERE table_name = 'daily_bar' "
            "AND column_name = ANY(%s) ORDER BY column_name",
            (["open_price", "high_price", "low_price", "close_price", "volume"],),
        )
        definitions = {row[0]: row[1:] for row in cursor.fetchall()}

    assert definitions == {
        "close_price": ("numeric", 18, 6),
        "high_price": ("numeric", 18, 6),
        "low_price": ("numeric", 18, 6),
        "open_price": ("numeric", 18, 6),
        "volume": ("numeric", 20, 4),
    }


# Implements TC-COMP-006
# Implements TC-COMP-136
# Implements TC-COMP-151
# Implements TC-COMP-152
# Implements TC-COMP-297
@pytest.mark.postgres
@pytest.mark.parametrize("table", OBSERVATION_TABLES)
def test_identical_refetch_is_noop_and_restatement_coexists(
    observation_connection: psycopg.Connection,
    table: str,
) -> None:
    instrument_id = _instrument_id(observation_connection)
    with observation_connection.cursor() as cursor:
        cursor.execute(
            INSERTS[table],
            _insert_values(instrument_id, "2026-01-10", VALID_HASH),
        )
        first_row_count = cursor.rowcount
        cursor.execute(
            INSERTS[table],
            _insert_values(instrument_id, "2026-01-11", VALID_HASH),
        )
        identical_row_count = cursor.rowcount
        cursor.execute(
            INSERTS[table],
            _insert_values(instrument_id, "2026-01-11", RESTATED_HASH),
        )
        restated_row_count = cursor.rowcount
        cursor.execute(f"SELECT observed_on, value_hash FROM {table} ORDER BY observed_on")
        rows = cursor.fetchall()

    assert first_row_count == 1
    assert identical_row_count == 0
    assert restated_row_count == 1
    assert [(str(row[0]), bytes(row[1])) for row in rows] == [
        ("2026-01-10", VALID_HASH),
        ("2026-01-11", RESTATED_HASH),
    ]
