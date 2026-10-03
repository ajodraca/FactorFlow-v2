"""Direct PostgreSQL tests for the acquisition-run read boundary.

CAP-001-E7-S1 adds run-detail outcome summaries without changing the existing
per-instrument paging contract.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

import psycopg
import pytest

from factorflow.runs.queries import DetailFilters, RunDetail, get_run_detail


def _seed_run(connection: psycopg.Connection) -> uuid.UUID:
    """Insert one terminal partial run and return its identifier."""
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO acquisition_run "
            "(state, history_depth_years, requested_at, ended_at, "
            "instruments_named, instruments_written, instruments_failed) "
            "VALUES ('partial', %s, %s, %s, %s, %s, %s) RETURNING run_id",
            (5, datetime.now(UTC), datetime.now(UTC), 4, 2, 1),
        )
        row = cursor.fetchone()
    connection.commit()
    assert row is not None
    return row[0]


def _seed_instrument(connection: psycopg.Connection, symbol: str) -> int:
    """Insert an active instrument and return its identity."""
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO instrument (symbol, lifecycle) VALUES (%s, 'active') "
            "RETURNING instrument_id",
            (symbol,),
        )
        row = cursor.fetchone()
    connection.commit()
    assert row is not None
    return int(row[0])


def _seed_result(
    connection: psycopg.Connection,
    run_id: uuid.UUID,
    instrument_id: int,
    data_type: str,
    outcome: str,
) -> None:
    """Persist one per-data-type outcome for the supplied run and instrument."""
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO run_instrument_result "
            "(run_id, instrument_id, data_type, outcome) VALUES (%s, %s, %s, %s)",
            (run_id, instrument_id, data_type, outcome),
        )
    connection.commit()


@pytest.mark.postgres
def test_run_detail_outcome_counts_cover_the_whole_run(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    # Implements TC-COMP-079
    """All row outcomes are summarized outside a one-instrument page."""
    connection = migrated_run_schema_connection
    run_id = _seed_run(connection)
    results = (
        ("AAPL", "prices", "written"),
        ("AAPL", "reference", "failed"),
        ("AAPL", "fundamentals", "not_found"),
        ("AAPL", "corporate_actions", "skipped"),
        ("MSFT", "prices", "written"),
        ("MSFT", "reference", "written"),
        ("MSFT", "fundamentals", "written"),
        ("MSFT", "corporate_actions", "written"),
        ("ZZZZ", "reference", "not_found"),
        ("ZZZZ", "fundamentals", "not_found"),
        ("TSLA", "reference", "failed"),
        ("TSLA", "prices", "failed"),
        ("TSLA", "fundamentals", "failed"),
        ("IBM", "reference", "unchanged"),
        ("IBM", "prices", "unchanged"),
    )
    instrument_ids = {
        symbol: _seed_instrument(connection, symbol) for symbol in {row[0] for row in results}
    }
    for symbol, data_type, outcome in results:
        _seed_result(connection, run_id, instrument_ids[symbol], data_type, outcome)

    detail = get_run_detail(connection, run_id, DetailFilters(limit=1))

    assert isinstance(detail, RunDetail)
    assert detail.outcome_counts.written == 5
    assert detail.outcome_counts.unchanged == 2
    assert detail.outcome_counts.not_found == 3
    assert detail.outcome_counts.failed == 4
    assert detail.outcome_counts.skipped == 1
    assert len({result.instrument_id for result in detail.results}) == 1
    assert detail.run.instruments_named == 4
    assert detail.run.instruments_written == 2
    assert detail.run.instruments_failed == 1

    zero_default_run_id = _seed_run(connection)
    zero_default_instrument_id = _seed_instrument(connection, "ZERO")
    _seed_result(connection, zero_default_run_id, zero_default_instrument_id, "prices", "written")

    zero_default_detail = get_run_detail(connection, zero_default_run_id, DetailFilters())

    assert isinstance(zero_default_detail, RunDetail)
    assert zero_default_detail.outcome_counts.written == 1
    assert zero_default_detail.outcome_counts.unchanged == 0
    assert zero_default_detail.outcome_counts.not_found == 0
    assert zero_default_detail.outcome_counts.failed == 0
    assert zero_default_detail.outcome_counts.skipped == 0
