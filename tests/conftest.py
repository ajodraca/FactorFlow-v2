"""Shared pytest fixtures.

The `postgres`-marked test suite runs against a real PostgreSQL 16 container
via `testcontainers`, per the approved tech stack (no ORM, `psycopg` 3 with
bound parameters, `testcontainers[postgres]` for database-backed tests).

One container is started for the whole test session (starting a fresh
container per test would be prohibitively slow), but each test gets its own
freshly created database inside that container so tests do not observe each
other's tables or rows.
"""

import uuid
from collections.abc import Iterator

import psycopg
import pytest
from psycopg import sql
from testcontainers.community.postgres import PostgresContainer

from factorflow.db.migrate_main import MIGRATIONS_DIR

MIGRATION_0001_PATH = MIGRATIONS_DIR / "0001_extensions_owner_state.sql"
MIGRATION_0002_PATH = MIGRATIONS_DIR / "0002_observations.sql"
MIGRATION_0003_PATH = MIGRATIONS_DIR / "0003_coverage.sql"
MIGRATION_0004_PATH = MIGRATIONS_DIR / "0004_runs.sql"


def count_backend_connections(conn: psycopg.Connection, dbname: str) -> int:
    """Return the number of backend connections for ``dbname`` visible from ``conn``.

    Queries ``pg_stat_activity`` over the admin connection so volume tests can
    sample connection count without opening a new connection themselves.  The
    admin connection is excluded from the count via ``pid <> pg_backend_pid()``.

    Used by T001 / T002 in CAP-001-E4-S7 (DAC-E4-S7-3).
    """
    with conn.cursor() as cur:
        cur.execute(
            "SELECT count(*) FROM pg_stat_activity WHERE datname = %s AND pid <> pg_backend_pid()",
            (dbname,),
        )
        row = cur.fetchone()
    return int(row[0]) if row else 0


@pytest.fixture(scope="session")
def postgres_container() -> Iterator[PostgresContainer]:
    """Start one PostgreSQL 16 container for the whole test session."""
    with PostgresContainer("postgres:16") as container:
        yield container


@pytest.fixture(scope="session")
def _postgres_admin_connection_string(postgres_container: PostgresContainer) -> str:
    """The connection string for the container's default (admin) database."""
    return postgres_container.get_connection_url(driver=None)


@pytest.fixture(scope="session")
def postgres_admin_connection(
    _postgres_admin_connection_string: str,
) -> Iterator[psycopg.Connection]:
    """A persistent admin connection to the container's default database.

    Used by volume tests to sample backend connection counts via
    ``pg_stat_activity`` without opening additional connections themselves.
    Scoped to the session so the admin connection is opened once and reused.

    Used by CAP-001-E4-S7 T001/T002 (DAC-E4-S7-3).
    """
    conn = psycopg.connect(_postgres_admin_connection_string)
    try:
        yield conn
    finally:
        conn.close()


@pytest.fixture
def postgres_connection_string(_postgres_admin_connection_string: str) -> Iterator[str]:
    """A connection string to a freshly created, empty database.

    Each test gets its own database inside the shared container, so tests
    that apply the same migration file do not collide on tables created by an
    earlier test in the same session.
    """
    db_name = f"test_{uuid.uuid4().hex}"

    admin_conn = psycopg.connect(_postgres_admin_connection_string, autocommit=True)
    try:
        with admin_conn.cursor() as cur:
            # CREATE DATABASE cannot take its name as a bound parameter — it is
            # an identifier, not a value — so psycopg.sql.Identifier is used to
            # quote and escape it safely rather than interpolating it raw.
            cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(db_name)))

        base_url = _postgres_admin_connection_string.rsplit("/", 1)[0]
        yield f"{base_url}/{db_name}"
    finally:
        # Teardown belongs in `finally`: a failing test throws in at the yield
        # above, and cleanup placed after it would be skipped, leaking the
        # database into the shared session container.
        try:
            with admin_conn.cursor() as cur:
                cur.execute(
                    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
                    "WHERE datname = %s AND pid <> pg_backend_pid()",
                    (db_name,),
                )
                cur.execute(sql.SQL("DROP DATABASE IF EXISTS {}").format(sql.Identifier(db_name)))
        finally:
            # Close the admin connection even if the drop itself raises.
            admin_conn.close()


@pytest.fixture
def migrated_instrument_connection(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    """Yield a connection whose database has the instrument migration applied."""
    conn = psycopg.connect(postgres_connection_string)
    with conn.cursor() as cur:
        cur.execute(MIGRATION_0001_PATH.read_text())
    conn.commit()
    try:
        yield conn
    finally:
        conn.close()


@pytest.fixture
def migrated_connection_string(postgres_connection_string: str) -> str:
    """A connection string whose database already has migration 0001 applied.

    For tests that boot the application factory (`create_app`) against a real
    database rather than calling a service module directly -- the app opens
    its own pool from `FACTORFLOW_DATABASE_URL`, so the schema must exist
    before the app is constructed, not merely before the test's assertions.
    """
    conn = psycopg.connect(postgres_connection_string)
    try:
        with conn.cursor() as cur:
            cur.execute(MIGRATION_0001_PATH.read_text())
        conn.commit()
    finally:
        conn.close()
    return postgres_connection_string


@pytest.fixture
def migrated_run_schema_connection(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    """Yield an isolated database migrated through the run-journal schema."""
    from factorflow.db.migrator import apply_pending, discover

    conn = psycopg.connect(postgres_connection_string)
    apply_pending(conn, discover(MIGRATION_0001_PATH.parent))
    try:
        yield conn
    finally:
        conn.close()


@pytest.fixture
def migrated_writer_connection(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    """Yield a connection whose database has migrations 0001 through 0004 applied.

    Applies each migration in numerical order so that all four schema layers
    (extensions/state, observations, coverage, and runs) are available for
    writer transaction tests. Each test receives an isolated database inside
    the shared session container -- no database state is shared between tests.

    Requires CAP-001-E5-S1 to have landed src/factorflow/db/migrations/0003_coverage.sql and
    src/factorflow/db/migrations/0004_runs.sql before this fixture is used.
    """
    conn = psycopg.connect(postgres_connection_string)
    with conn.cursor() as cur:
        cur.execute(MIGRATION_0001_PATH.read_text())
        cur.execute(MIGRATION_0002_PATH.read_text())
        cur.execute(MIGRATION_0003_PATH.read_text())
        cur.execute(MIGRATION_0004_PATH.read_text())
    conn.commit()
    try:
        yield conn
    finally:
        conn.close()


@pytest.fixture
def migrated_runner_connection(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    """Yield a connection whose database has all CAP-001 migrations applied.

    Applies migrations 0001 through 0004 in numerical order, giving runner
    tests access to instruments, observations, coverage, and run tables.
    Each test receives an isolated database inside the shared session
    container -- no state is shared between runner tests.

    Used by CAP-001-E4-S5 postgres-marked runner integration tests:
    test_runner_acquires.py, test_runner_depth.py, test_runner_transactions.py,
    test_runner_isolation.py, test_runner_cancel.py, test_runner_reclaim.py,
    test_runner_credential.py, test_runner_volume.py.
    """
    conn = psycopg.connect(postgres_connection_string)
    with conn.cursor() as cur:
        cur.execute(MIGRATION_0001_PATH.read_text())
        cur.execute(MIGRATION_0002_PATH.read_text())
        cur.execute(MIGRATION_0003_PATH.read_text())
        cur.execute(MIGRATION_0004_PATH.read_text())
    conn.commit()
    try:
        yield conn
    finally:
        conn.close()


@pytest.fixture
def runner_volume_context(
    postgres_connection_string: str,
    postgres_admin_connection: psycopg.Connection,
) -> Iterator[tuple[psycopg.Connection, psycopg.Connection, str]]:
    """Yield (test_conn, admin_conn, dbname) for volume and resume tests.

    Provides an isolated database with all four migrations applied, an admin
    connection for sampling ``pg_stat_activity``, and the database name so
    tests can probe connection counts keyed to this specific database.

    Used by CAP-001-E4-S7 T002/T003 (DAC-E4-S7-1, DAC-E4-S7-3, DAC-E4-S7-2).
    """
    # Extract database name from the connection string (last path component)
    dbname = postgres_connection_string.rsplit("/", 1)[-1]

    conn = psycopg.connect(postgres_connection_string)
    with conn.cursor() as cur:
        cur.execute(MIGRATION_0001_PATH.read_text())
        cur.execute(MIGRATION_0002_PATH.read_text())
        cur.execute(MIGRATION_0003_PATH.read_text())
        cur.execute(MIGRATION_0004_PATH.read_text())
    conn.commit()
    try:
        yield conn, postgres_admin_connection, dbname
    finally:
        conn.close()
