"""`GET /api/health` (component design section 11; task plan T016).

Probes database reachability and the highest applied migration version
through the request-scoped connection pool, and reads credential presence
from `factorflow.config.settings`. CAP-001-E7-S3 adds the fifth field,
`most_recent_run`, whose read the route delegates to the run-journal
boundary `factorflow.runs.queries` (ingestion-api section 1, run-journal
section 9) inside the same connection block. This route never raises on a database
failure -- it catches the connection error and reports `"unreachable"`
(DAC-E1-S6-2) so the interface can distinguish a dead database from a dead
API (AC-18).
"""

import logging
from typing import Protocol

import psycopg
from fastapi import APIRouter, Request
from psycopg_pool import ConnectionPool

from factorflow.api.models import HealthResponse, MostRecentRun
from factorflow.config.settings import credential_present
from factorflow.runs.queries import get_most_recent_run

_LOGGER = logging.getLogger("factorflow.api.routes.health")

router = APIRouter()


class _ConnectionLike(Protocol):
    def cursor(self) -> object: ...


def probe_schema_version(connection: _ConnectionLike) -> int | None:
    """The highest version recorded in `applied_migrations`, or `None`.

    `None` when the table exists but is empty (no migration recorded yet).
    When the table itself does not exist, the query raises
    `psycopg.errors.UndefinedTable` (a `psycopg.Error`) and this function
    lets it propagate; `get_health` catches it and reports the database as
    `"unreachable"` with `schema_version` `None`.
    """
    with connection.cursor() as cur:  # type: ignore[attr-defined]
        cur.execute("SELECT max(version) FROM applied_migrations")
        row = cur.fetchone()
    return row[0] if row else None


_HEALTH_PROBE_TIMEOUT_SECONDS = 2.0


def probe_database_reachable(pool: ConnectionPool) -> bool:
    """Whether a connection can be obtained from the pool right now.

    Catches `psycopg.Error` (connection refused, DNS failure, timeout, ...)
    and returns `False` rather than propagating it -- a health check that
    raises on a down database defeats the purpose of the endpoint
    (DAC-E1-S6-2). Bounded to a short, health-check-appropriate timeout
    rather than the pool's default (30s): a health caller polling every 30
    seconds (component design section 5) should never itself block for the
    length of a whole poll interval waiting to find out the database is
    down.
    """
    try:
        with pool.connection(timeout=_HEALTH_PROBE_TIMEOUT_SECONDS):
            return True
    except psycopg.Error:
        return False


@router.get("/api/health", response_model=HealthResponse)
def get_health(request: Request) -> HealthResponse:
    pool: ConnectionPool = request.app.state.db_pool

    schema_version: int | None = None
    most_recent_run: MostRecentRun | None = None
    reachable = probe_database_reachable(pool)
    if reachable:
        try:
            with pool.connection() as conn:
                schema_version = probe_schema_version(conn)
                row = get_most_recent_run(conn)
                if row is not None:
                    most_recent_run = MostRecentRun(
                        run_id=row.run_id,
                        state=row.state,  # type: ignore[arg-type]
                        ended_at=row.ended_at,
                    )
        except psycopg.Error:
            # The pool answered `reachable` a moment ago but the version
            # query itself failed (e.g. the connection dropped between the
            # two calls). Report the same "unreachable" state a caller
            # would see if the first probe had failed, rather than a
            # reachable database with no schema version -- a shape health
            # never otherwise produces.
            reachable = False
            schema_version = None
            most_recent_run = None

    # IR-009: no formatter in this component renders arbitrary `extra`
    # fields, so a field an operator needs to actually see in the log must
    # be in the message text itself, not only attached to the record.
    _LOGGER.info("health check completed: database=%s", "reachable" if reachable else "unreachable")

    return HealthResponse(
        status="ok",
        database="reachable" if reachable else "unreachable",
        credential_present=credential_present(),
        schema_version=schema_version,
        most_recent_run=most_recent_run,
    )
