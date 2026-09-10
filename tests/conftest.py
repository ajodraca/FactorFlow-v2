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
from pathlib import Path

import psycopg
import pytest
from psycopg import sql
from testcontainers.community.postgres import PostgresContainer

MIGRATION_0001_PATH = (
    Path(__file__).resolve().parents[1] / "migrations" / "0001_extensions_owner_state.sql"
)


@pytest.fixture(scope="session")
def postgres_container() -> Iterator[PostgresContainer]:
    """Start one PostgreSQL 16 container for the whole test session."""
    with PostgresContainer("postgres:16") as container:
        yield container


@pytest.fixture(scope="session")
def _postgres_admin_connection_string(postgres_container: PostgresContainer) -> str:
    """The connection string for the container's default (admin) database."""
    return postgres_container.get_connection_url(driver=None)


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
