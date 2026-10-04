"""`factorflow.runs.queries.get_most_recent_run` against real PostgreSQL.

CAP-001-E7-S3 task plan T006. Kept separate from CAP-001-E7-S1's
`test_run_queries.py` so the two stories do not collide. Calls the read
boundary directly, with no HTTP.
"""

import json
from collections.abc import Iterator
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.runs import queries
from factorflow.runs.queries import ListFilters, get_most_recent_run, list_runs

_BASE_TIME = datetime(2026, 9, 5, 22, 0, 0, tzinfo=UTC)


def _seed(conn: psycopg.Connection, state: str, requested_at: datetime) -> UUID:
    """Insert a `requested` or terminal run that satisfies the DDL checks."""
    ended_at = None if state == "requested" else requested_at + timedelta(minutes=1)
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (state, history_depth_years, requested_at, ended_at) "
            "VALUES (%s, 5, %s, %s) RETURNING run_id",
            (state, requested_at, ended_at),
        )
        row = cur.fetchone()
    conn.commit()
    assert row is not None
    return UUID(str(row[0]))


def _plan_nodes(node: dict[str, Any]) -> Iterator[dict[str, Any]]:
    yield node
    for child in node.get("Plans", []):
        yield from _plan_nodes(child)


# Implements TC-COMP-091
# Implements TC-COMP-089
@pytest.mark.postgres
def test_most_recent_run_query_uses_the_recent_index(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E7-S3-4: on 1000 analysed runs, the shipped statement's plan uses
    `idx_acquisition_run_recent` and never sequentially scans the table, with
    no planner setting changed.
    """
    conn = migrated_run_schema_connection
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (state, history_depth_years, requested_at, ended_at) "
            "SELECT 'succeeded', 5, %s + make_interval(mins => g), "
            "%s + make_interval(mins => g) + interval '30 seconds' "
            "FROM generate_series(1, 1000) AS g",
            (_BASE_TIME, _BASE_TIME),
        )
    conn.commit()
    with conn.cursor() as cur:
        cur.execute("ANALYZE acquisition_run")
        cur.execute("EXPLAIN (FORMAT JSON) " + queries._MOST_RECENT_RUN_SQL)
        row = cur.fetchone()
    assert row is not None
    plan = row[0] if isinstance(row[0], list) else json.loads(row[0])
    nodes = list(_plan_nodes(plan[0]["Plan"]))

    assert any(
        n["Node Type"] in {"Index Scan", "Index Only Scan"}
        and n.get("Index Name") == "idx_acquisition_run_recent"
        for n in nodes
    ), nodes
    assert not any(
        n["Node Type"] == "Seq Scan" and n.get("Relation Name") == "acquisition_run" for n in nodes
    ), nodes


# Implements TC-COMP-089
@pytest.mark.postgres
def test_most_recent_run_breaks_ties_like_the_runs_list(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """Open Gap 1 (DEC-0012): two runs with the same `requested_at` resolve to
    the greater `run_id`, the same run the Runs list puts first.
    """
    conn = migrated_run_schema_connection
    first = _seed(conn, "succeeded", _BASE_TIME)
    second = _seed(conn, "failed", _BASE_TIME)

    latest = get_most_recent_run(conn)

    assert latest is not None
    assert latest.run_id == max(first, second)
    assert latest.run_id == list_runs(conn, ListFilters(limit=1)).rows[0].run_id


# Implements TC-COMP-089
@pytest.mark.postgres
def test_most_recent_run_reports_a_newer_requested_run(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E7-S3-2: a newer run that has not started is returned ahead of an
    older terminal one.
    """
    conn = migrated_run_schema_connection
    _seed(conn, "failed", _BASE_TIME)
    newer = _seed(conn, "requested", _BASE_TIME + timedelta(hours=1))

    latest = get_most_recent_run(conn)

    assert latest is not None
    assert latest.run_id == newer
    assert latest.state == "requested"
    assert latest.ended_at is None


@pytest.mark.postgres
def test_most_recent_run_is_none_on_an_empty_table(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    """DAC-E7-S3-1: no run recorded yields `None`."""
    assert get_most_recent_run(migrated_run_schema_connection) is None
