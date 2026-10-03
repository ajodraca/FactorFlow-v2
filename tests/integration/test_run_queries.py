"""Direct PostgreSQL tests for the acquisition-run read boundary.

CAP-001-E7-S1 adds run-detail outcome summaries without changing the existing
per-instrument paging contract.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from time import perf_counter

import psycopg
import pytest

from factorflow.ingestion.massive.errors import (
    InstrumentNotFound,
    ProviderUnavailable,
    compose_failure_reason,
)
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
    reason: str | None = None,
) -> None:
    """Persist one per-data-type outcome for the supplied run and instrument."""
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO run_instrument_result "
            "(run_id, instrument_id, data_type, outcome, reason) VALUES (%s, %s, %s, %s, %s)",
            (run_id, instrument_id, data_type, outcome, reason),
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


@pytest.mark.postgres
def test_detail_rows_name_instruments_and_keep_not_found_distinct(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    # Implements TC-COMP-010
    # Implements TC-COMP-011
    """Failed and not-found rows retain owner-readable instrument identity."""
    connection = migrated_run_schema_connection
    run_id = _seed_run(connection)
    aapl_id = _seed_instrument(connection, "AAPL")
    zzzz_id = _seed_instrument(connection, "ZZZZ")
    _seed_result(connection, run_id, aapl_id, "prices", "written")
    _seed_result(
        connection,
        run_id,
        aapl_id,
        "reference",
        "failed",
        "provider unavailable",
    )
    for data_type in ("prices", "reference", "fundamentals", "corporate_actions"):
        _seed_result(connection, run_id, zzzz_id, data_type, "not_found")

    detail = get_run_detail(connection, run_id, DetailFilters(limit=10))

    assert isinstance(detail, RunDetail)
    failed = next(result for result in detail.results if result.outcome == "failed")
    assert failed.symbol == "AAPL"
    assert failed.instrument_id == aapl_id
    assert failed.data_type == "reference"
    assert failed.reason == "provider unavailable"
    zzzz_results = [result for result in detail.results if result.instrument_id == zzzz_id]
    assert {result.outcome for result in zzzz_results} == {"not_found"}
    assert {result.data_type for result in zzzz_results} == {
        "prices",
        "reference",
        "fundamentals",
        "corporate_actions",
    }
    assert detail.outcome_counts.not_found == 4
    assert detail.outcome_counts.failed == 1

    not_found_detail = get_run_detail(
        connection,
        run_id,
        DetailFilters(limit=10, outcome="not_found"),
    )

    assert isinstance(not_found_detail, RunDetail)
    assert {result.symbol for result in not_found_detail.results} == {"ZZZZ"}
    assert {result.outcome for result in not_found_detail.results} == {"not_found"}
    assert len(not_found_detail.results) == 4

    failed_detail = get_run_detail(
        connection,
        run_id,
        DetailFilters(limit=10, outcome="failed"),
    )

    assert isinstance(failed_detail, RunDetail)
    assert [
        (result.symbol, result.data_type, result.outcome) for result in failed_detail.results
    ] == [("AAPL", "reference", "failed")]


@pytest.mark.postgres
def test_detail_keeps_all_data_types_for_an_instrument_on_one_page(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    # Implements TC-COMP-066
    # Implements TC-COMP-080
    """A paged unfiltered result keeps an instrument's outcomes together."""
    connection = migrated_run_schema_connection
    run_id = _seed_run(connection)
    aapl_id = _seed_instrument(connection, "AAPL")
    msft_id = _seed_instrument(connection, "MSFT")
    outcomes = {
        "prices": "written",
        "fundamentals": "not_found",
        "reference": "unchanged",
        "corporate_actions": "failed",
    }
    for data_type, outcome in outcomes.items():
        _seed_result(connection, run_id, aapl_id, data_type, outcome)
    _seed_result(connection, run_id, msft_id, "prices", "written")

    first_page = get_run_detail(connection, run_id, DetailFilters(limit=1))

    assert isinstance(first_page, RunDetail)
    pages = [first_page]
    while pages[-1].next_cursor is not None:
        pages.append(
            get_run_detail(
                connection,
                run_id,
                DetailFilters(limit=1, cursor=pages[-1].next_cursor),
            )
        )

    aapl_page = next(page for page in pages if any(r.instrument_id == aapl_id for r in page.results))
    assert [result.instrument_id for result in aapl_page.results] == [aapl_id] * 4
    assert {result.data_type: result.outcome for result in aapl_page.results} == outcomes
    assert ("prices", "written") in [
        (result.data_type, result.outcome) for result in aapl_page.results
    ]
    assert ("fundamentals", "not_found") in [
        (result.data_type, result.outcome) for result in aapl_page.results
    ]


@pytest.mark.postgres
def test_detail_returns_pre_redacted_composed_failure_reasons(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    # Implements TC-COMP-068
    # Implements TC-COMP-082
    """Stored, composed reasons preserve safe diagnosis fields without a secret."""
    secret = "synthetic-credential-like-value"
    connection = migrated_run_schema_connection
    run_id = _seed_run(connection)
    unavailable_run_id = _seed_run(connection)
    msft_id = _seed_instrument(connection, "MSFT")
    not_found_reason = compose_failure_reason(
        InstrumentNotFound(
            f"not found key={secret}", provider_request_id="req-e7s1-001"
        ),
        symbol="MSFT",
        data_type="fundamentals",
        redact=lambda text: text.replace(secret, "[redacted]"),
    )
    unavailable_reason = compose_failure_reason(
        ProviderUnavailable(
            f"provider unavailable key={secret}", provider_request_id="req-e7s1-001"
        ),
        symbol="MSFT",
        data_type="fundamentals",
        redact=lambda text: text.replace(secret, "[redacted]"),
    )
    _seed_result(
        connection, run_id, msft_id, "fundamentals", "not_found", not_found_reason
    )
    _seed_result(
        connection,
        unavailable_run_id,
        msft_id,
        "fundamentals",
        "failed",
        unavailable_reason,
    )

    detail = get_run_detail(connection, run_id, DetailFilters(limit=10))
    unavailable_detail = get_run_detail(connection, unavailable_run_id, DetailFilters(limit=10))

    assert isinstance(detail, RunDetail)
    assert isinstance(unavailable_detail, RunDetail)
    assert detail.results[0].reason == not_found_reason
    assert unavailable_detail.results[0].reason == unavailable_reason
    for result in (*detail.results, *unavailable_detail.results):
        assert result.reason is not None
        assert "symbol=MSFT" in result.reason
        assert "data_type=fundamentals" in result.reason
        assert "request_id=req-e7s1-001" in result.reason
        assert secret not in repr(result)
    assert secret not in repr(detail)
    assert secret not in repr(unavailable_detail)


@pytest.mark.postgres
def test_detail_pages_a_three_thousand_instrument_run(
    migrated_run_schema_connection: psycopg.Connection,
) -> None:
    # Implements TC-COMP-075
    # Implements TC-COMP-078
    """A large run pages whole instruments and preserves run-wide counts."""
    connection = migrated_run_schema_connection
    run_id = _seed_run(connection)
    with connection.cursor() as cursor:
        cursor.execute(
            "UPDATE acquisition_run SET instruments_named = %s, instruments_written = %s, "
            "instruments_failed = %s WHERE run_id = %s",
            (3000, 2400, 600, run_id),
        )
        cursor.execute(
            "INSERT INTO instrument (symbol, lifecycle) "
            "SELECT 'S' || lpad(n::text, 4, '0'), 'active' "
            "FROM generate_series(1, 3000) AS n"
        )
        cursor.execute(
            "INSERT INTO run_instrument_result (run_id, instrument_id, data_type, outcome) "
            "SELECT %s, i.instrument_id, types.data_type, "
            "CASE "
            "WHEN types.data_type = 'reference' AND substring(i.symbol, 2)::int %% 10 = 0 "
            "THEN 'failed' "
            "WHEN types.data_type = 'fundamentals' AND substring(i.symbol, 2)::int %% 10 = 1 "
            "THEN 'not_found' "
            "ELSE 'written' END "
            "FROM instrument i CROSS JOIN "
            "(VALUES ('reference'), ('prices'), ('fundamentals'), ('corporate_actions')) "
            "AS types(data_type) "
            "WHERE i.symbol LIKE 'S%%'",
            (run_id,),
        )
        cursor.execute(
            "SELECT instrument_id FROM instrument "
            "WHERE symbol LIKE 'S%' AND substring(symbol, 2)::int % 10 = 0 "
            "ORDER BY instrument_id"
        )
        failed_instrument_ids = {int(row[0]) for row in cursor.fetchall()}
        cursor.execute(
            "SELECT instrument_id FROM instrument "
            "WHERE symbol LIKE 'S%' AND substring(symbol, 2)::int % 10 IN (0, 1) "
            "ORDER BY instrument_id"
        )
        failure_first_ids = {int(row[0]) for row in cursor.fetchall()}
        cursor.execute(
            "SELECT instrument_id FROM instrument "
            "WHERE symbol LIKE 'S%' AND substring(symbol, 2)::int % 10 = 1 "
            "ORDER BY instrument_id"
        )
        not_found_instrument_ids = {int(row[0]) for row in cursor.fetchall()}
    connection.commit()

    started = perf_counter()
    first_page = get_run_detail(connection, run_id, DetailFilters())
    assert isinstance(first_page, RunDetail)
    assert len({result.instrument_id for result in first_page.results}) == 50
    assert len(first_page.results) <= 200
    assert first_page.next_cursor is not None

    # Full traversal uses a fresh cursor chain at the task-plan maximum of
    # 500 instruments; the default-size page above proves the default contract.
    full_pages: list[RunDetail] = []
    cursor: str | None = None
    while True:
        page = get_run_detail(connection, run_id, DetailFilters(limit=500, cursor=cursor))
        assert isinstance(page, RunDetail)
        full_pages.append(page)
        if page.next_cursor is None:
            break
        cursor = page.next_cursor

    raw_instrument_ids = [
        result.instrument_id for page in full_pages for result in page.results
    ]
    returned_ids = list(dict.fromkeys(raw_instrument_ids))
    assert len(full_pages) == 6
    assert len(raw_instrument_ids) == 12000
    assert len(returned_ids) == 3000
    assert len(set(returned_ids)) == 3000
    for page in full_pages:
        page_ids = [result.instrument_id for result in page.results]
        assert all(page_ids.count(instrument_id) == 4 for instrument_id in set(page_ids))

    has_failure = [instrument_id in failure_first_ids for instrument_id in returned_ids]
    assert has_failure == sorted(has_failure, reverse=True)

    def filtered_pages(outcome: str) -> list[RunDetail]:
        pages: list[RunDetail] = []
        next_cursor: str | None = None
        while True:
            page = get_run_detail(
                connection,
                run_id,
                DetailFilters(limit=500, outcome=outcome, cursor=next_cursor),
            )
            assert isinstance(page, RunDetail)
            pages.append(page)
            if page.next_cursor is None:
                return pages
            next_cursor = page.next_cursor

    pages_by_outcome = {
        outcome: filtered_pages(outcome)
        for outcome in ("failed", "not_found", "written", "unchanged", "skipped")
    }
    for outcome, pages in pages_by_outcome.items():
        assert all(result.outcome == outcome for page in pages for result in page.results)

    failed_results = [
        result for page in pages_by_outcome["failed"] for result in page.results
    ]
    assert {result.outcome for result in failed_results} == {"failed"}
    assert {result.instrument_id for result in failed_results} == failed_instrument_ids
    assert all(result.data_type == "reference" for result in failed_results)
    assert len(failed_results) == len(failed_instrument_ids)

    not_found_results = [
        result for page in pages_by_outcome["not_found"] for result in page.results
    ]
    assert {result.instrument_id for result in not_found_results} == not_found_instrument_ids
    assert all(result.data_type == "fundamentals" for result in not_found_results)
    assert len(not_found_results) == len(not_found_instrument_ids)

    written_results = [
        result for page in pages_by_outcome["written"] for result in page.results
    ]
    assert {result.instrument_id for result in written_results} == set(returned_ids)
    assert len(written_results) == 11400
    assert not [result for page in pages_by_outcome["unchanged"] for result in page.results]
    assert not [result for page in pages_by_outcome["skipped"] for result in page.results]

    all_counts = [first_page.outcome_counts, *[page.outcome_counts for page in full_pages]]
    filtered_counts = [
        page.outcome_counts for pages in pages_by_outcome.values() for page in pages
    ]
    assert all(counts == all_counts[0] for counts in all_counts + filtered_counts)
    assert sum(vars(all_counts[0]).values()) == 12000
    print(f"T006 traversal diagnostic: {perf_counter() - started:.3f}s")
