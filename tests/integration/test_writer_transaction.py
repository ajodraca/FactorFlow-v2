"""Integration tests for the observation writer transaction (CAP-001-E4-S3).

Tests verify that a successful four-data-type call commits observations,
only the actual returned ranges, per-type acquisition state, exactly four
result rows, and per-type appended/unchanged counts -- and that failures at
any step roll everything back.

Implements TC-COMP-007, TC-COMP-010, TC-COMP-012, TC-COMP-138, TC-COMP-139,
TC-COMP-162, TC-COMP-165, TC-COMP-166, TC-COMP-167.
"""

import uuid
from datetime import date

import psycopg
import pytest

from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)
from factorflow.ingestion.writer import ParsedObservations, write_instrument

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _insert_instrument(conn: psycopg.Connection, symbol: str = "AAPL") -> int:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle) VALUES (%s, 'active') "
            "RETURNING instrument_id",
            (symbol,),
        )
        row = cur.fetchone()
    assert row is not None
    conn.commit()
    return int(row[0])


def _insert_run(conn: psycopg.Connection) -> uuid.UUID:
    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, requested_at, started_at, "
            " claimed_by, heartbeat_at) "
            "VALUES (%s, 'running', 5, now(), now(), 'test-worker', now())",
            (run_id,),
        )
    conn.commit()
    return run_id


def _make_observations(
    annual: bool = True,
    fiscal_quarter: int | None = None,
    session_ms: int = 1_672_531_200_000,  # 2023-01-01 UTC
) -> ParsedObservations:
    timeframe = "annual" if annual else "quarterly"
    stmt_data: dict = {
        "cik": "0001234567",
        "tickers": ["AAPL"],
        "period_end": "2025-12-31",
        "filing_date": "2026-02-15",
        "fiscal_year": 2025,
        "timeframe": timeframe,
        "statement_type": "income_statement",
        "total_revenue": "394328000000",
    }
    if not annual and fiscal_quarter is not None:
        stmt_data["fiscal_quarter"] = fiscal_quarter

    return ParsedObservations(
        reference=[
            TickerReference.model_validate(
                {
                    "cik": "0001234567",
                    "composite_figi": "BBG000B9XRY4",
                    "share_class_figi": "BBG001S5N8V8",
                    "active": True,
                    "name": "Apple Inc.",
                }
            )
        ],
        prices=[
            DailyBar.model_validate(
                {
                    "t": session_ms,
                    "o": "150.00",
                    "h": "155.00",
                    "l": "149.00",
                    "c": "153.00",
                    "v": "70000000",
                    "vw": "152.00",
                    "n": 350000,
                }
            )
        ],
        fundamentals=[FinancialStatement.model_validate(stmt_data)],
        corporate_actions=[
            CorporateAction.model_validate(
                {
                    "action_type": "split",
                    "effective_on": "2020-08-31",
                    "split_from": "1",
                    "split_to": "4",
                }
            )
        ],
        reference_range=(date(2026, 1, 1), date(2026, 6, 30)),
        prices_range=(date(2023, 1, 1), date(2026, 6, 30)),
        fundamentals_range=(date(2020, 1, 1), date(2025, 12, 31)),
        corporate_actions_range=(date(2015, 1, 1), date(2026, 6, 30)),
    )


# ---------------------------------------------------------------------------
# TC-COMP-007, TC-COMP-010, TC-COMP-162: Successful four-data-type commit
# ---------------------------------------------------------------------------


# Implements TC-COMP-007
# Implements TC-COMP-010
# Implements TC-COMP-162
@pytest.mark.postgres
def test_successful_write_commits_observations_coverage_state_results(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id = _insert_run(conn)
    observed_on = date(2026, 9, 1)

    observations = _make_observations()
    result = write_instrument(conn, instrument_id, run_id, observations, observed_on)
    conn.commit()

    # Observations were appended
    assert result.reference_appended == 1
    assert result.prices_appended == 1
    assert result.fundamentals_appended == 1
    assert result.corporate_actions_appended == 1

    # Verify rows are present in the database
    with conn.cursor() as cur:
        cur.execute(
            "SELECT COUNT(*) FROM instrument_reference WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 1  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM daily_bar WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 1  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM fundamental_observation WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 1  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM corporate_action WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 1  # type: ignore[index]


# Implements TC-COMP-167
@pytest.mark.postgres
def test_successful_write_commits_only_actual_returned_ranges(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id = _insert_run(conn)
    observed_on = date(2026, 9, 1)
    observations = _make_observations()

    write_instrument(conn, instrument_id, run_id, observations, observed_on)
    conn.commit()

    with conn.cursor() as cur:
        cur.execute(
            "SELECT data_type, covered_from, covered_to FROM coverage_segment "
            "WHERE instrument_id = %s ORDER BY data_type",
            (instrument_id,),
        )
        rows = {row[0]: (row[1], row[2]) for row in cur.fetchall()}

    assert rows["reference"] == (date(2026, 1, 1), date(2026, 6, 30))
    assert rows["prices"] == (date(2023, 1, 1), date(2026, 6, 30))
    assert rows["fundamentals"] == (date(2020, 1, 1), date(2025, 12, 31))
    assert rows["corporate_actions"] == (date(2015, 1, 1), date(2026, 6, 30))


# Implements TC-COMP-165
# Implements TC-COMP-166
@pytest.mark.postgres
def test_successful_write_stamps_acquisition_state_for_each_data_type(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id = _insert_run(conn)
    observed_on = date(2026, 9, 1)
    observations = _make_observations()

    write_instrument(conn, instrument_id, run_id, observations, observed_on)
    conn.commit()

    with conn.cursor() as cur:
        cur.execute(
            "SELECT data_type, last_run_id, last_outcome FROM acquisition_state "
            "WHERE instrument_id = %s ORDER BY data_type",
            (instrument_id,),
        )
        rows = {row[0]: (row[1], row[2]) for row in cur.fetchall()}

    assert set(rows.keys()) == {"reference", "prices", "fundamentals", "corporate_actions"}
    for data_type in rows:
        assert rows[data_type][0] == run_id
        assert rows[data_type][1] == "written"


# Implements TC-COMP-010
@pytest.mark.postgres
def test_successful_write_inserts_exactly_four_run_result_rows(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id = _insert_run(conn)
    observed_on = date(2026, 9, 1)
    observations = _make_observations()

    write_instrument(conn, instrument_id, run_id, observations, observed_on)
    conn.commit()

    with conn.cursor() as cur:
        cur.execute(
            "SELECT data_type, outcome FROM run_instrument_result "
            "WHERE run_id = %s AND instrument_id = %s ORDER BY data_type",
            (run_id, instrument_id),
        )
        rows = {row[0]: row[1] for row in cur.fetchall()}

    assert set(rows.keys()) == {"reference", "prices", "fundamentals", "corporate_actions"}
    for data_type in rows:
        assert rows[data_type] == "written"


# ---------------------------------------------------------------------------
# TC-COMP-162: Annual and quarterly fiscal_period derivation
# ---------------------------------------------------------------------------


# Implements TC-COMP-162
@pytest.mark.postgres
def test_annual_financial_statement_stores_fiscal_period_fy(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id = _insert_run(conn)
    observed_on = date(2026, 9, 1)

    observations = _make_observations(annual=True)
    write_instrument(conn, instrument_id, run_id, observations, observed_on)
    conn.commit()

    with conn.cursor() as cur:
        cur.execute(
            "SELECT fiscal_period FROM fundamental_observation WHERE instrument_id = %s",
            (instrument_id,),
        )
        row = cur.fetchone()

    assert row is not None
    assert row[0] == "FY"


# Implements TC-COMP-162
@pytest.mark.postgres
@pytest.mark.parametrize("fiscal_quarter", [1, 2, 3, 4])
def test_quarterly_financial_statement_stores_fiscal_period_q_n(
    migrated_writer_connection: psycopg.Connection,
    fiscal_quarter: int,
) -> None:
    conn = migrated_writer_connection
    symbol = f"TST{fiscal_quarter}"
    instrument_id = _insert_instrument(conn, symbol)
    run_id = _insert_run(conn)
    observed_on = date(2026, 9, 1)

    observations = _make_observations(annual=False, fiscal_quarter=fiscal_quarter)
    write_instrument(conn, instrument_id, run_id, observations, observed_on)
    conn.commit()

    with conn.cursor() as cur:
        cur.execute(
            "SELECT fiscal_period FROM fundamental_observation WHERE instrument_id = %s",
            (instrument_id,),
        )
        row = cur.fetchone()

    assert row is not None
    assert row[0] == f"Q{fiscal_quarter}"


# ---------------------------------------------------------------------------
# TC-COMP-138, TC-COMP-139, TC-COMP-165: Rollback on failure
# Injected via a test-local PostgreSQL trigger
# ---------------------------------------------------------------------------


def _install_failure_trigger(conn: psycopg.Connection, table: str, after: str) -> None:
    """Install a trigger on `table` that raises an exception on insert."""
    trigger_fn = f"fail_on_{table}_insert"
    trigger_name = f"trigger_fail_{table}"
    with conn.cursor() as cur:
        cur.execute(
            f"""
            CREATE OR REPLACE FUNCTION {trigger_fn}()
            RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                RAISE EXCEPTION 'injected failure on {table}';
            END;
            $$
            """
        )
        cur.execute(
            f"""
            CREATE TRIGGER {trigger_name}
            {after} INSERT ON {table}
            FOR EACH ROW EXECUTE FUNCTION {trigger_fn}()
            """
        )
    conn.commit()


def _drop_failure_trigger(conn: psycopg.Connection, table: str) -> None:
    trigger_fn = f"fail_on_{table}_insert"
    trigger_name = f"trigger_fail_{table}"
    with conn.cursor() as cur:
        cur.execute(f"DROP TRIGGER IF EXISTS {trigger_name} ON {table}")
        cur.execute(f"DROP FUNCTION IF EXISTS {trigger_fn}()")
    conn.commit()


# Implements TC-COMP-138
# Implements TC-COMP-165
@pytest.mark.postgres
def test_failure_during_acquisition_state_rolls_back_everything(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    """Install a trigger that fires during acquisition_state upsert and assert
    observations, coverage, state, and results all roll back."""
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id = _insert_run(conn)
    observed_on = date(2026, 9, 1)
    observations = _make_observations()

    _install_failure_trigger(conn, "acquisition_state", "BEFORE")
    try:
        with pytest.raises(Exception, match="injected failure"):
            with conn.transaction():
                write_instrument(conn, instrument_id, run_id, observations, observed_on)
    finally:
        _drop_failure_trigger(conn, "acquisition_state")

    # Nothing should be visible after the rollback
    with conn.cursor() as cur:
        cur.execute(
            "SELECT COUNT(*) FROM instrument_reference WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM coverage_segment WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM acquisition_state WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM run_instrument_result WHERE run_id = %s AND instrument_id = %s",
            (run_id, instrument_id),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]


# Implements TC-COMP-139
@pytest.mark.postgres
def test_failure_during_run_result_insert_rolls_back_everything(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id = _insert_run(conn)
    observed_on = date(2026, 9, 1)
    observations = _make_observations()

    _install_failure_trigger(conn, "run_instrument_result", "BEFORE")
    try:
        with pytest.raises(Exception, match="injected failure"):
            with conn.transaction():
                write_instrument(conn, instrument_id, run_id, observations, observed_on)
    finally:
        _drop_failure_trigger(conn, "run_instrument_result")

    with conn.cursor() as cur:
        cur.execute(
            "SELECT COUNT(*) FROM instrument_reference WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM coverage_segment WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]


# Implements TC-COMP-138
@pytest.mark.postgres
def test_failure_during_observation_insert_rolls_back_everything(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    """Inject a failure at an observation table insert (fundamental_observation BEFORE INSERT).

    Asserts that no partial observation, intended coverage, state, or result
    survives and the original exception propagates.  This covers the observation-
    insert failure path required by T004 (IR-001).
    """
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id = _insert_run(conn)
    observed_on = date(2026, 9, 1)
    observations = _make_observations()

    _install_failure_trigger(conn, "fundamental_observation", "BEFORE")
    try:
        with pytest.raises(Exception, match="injected failure"):
            with conn.transaction():
                write_instrument(conn, instrument_id, run_id, observations, observed_on)
    finally:
        _drop_failure_trigger(conn, "fundamental_observation")

    # Nothing should be visible after the rollback
    with conn.cursor() as cur:
        cur.execute(
            "SELECT COUNT(*) FROM instrument_reference WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM fundamental_observation WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM coverage_segment WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM acquisition_state WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM run_instrument_result WHERE run_id = %s AND instrument_id = %s",
            (run_id, instrument_id),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]


# Implements TC-COMP-165
@pytest.mark.postgres
def test_failure_during_coverage_replacement_rolls_back_everything(
    migrated_writer_connection: psycopg.Connection,
) -> None:
    """Inject a failure at the coverage replacement step (coverage_segment BEFORE INSERT).

    Asserts that no partial observation, intended coverage, state, or result
    survives and the original exception propagates.  This covers the coverage-
    replacement failure path required by T004 (IR-001).
    """
    conn = migrated_writer_connection
    instrument_id = _insert_instrument(conn)
    run_id = _insert_run(conn)
    observed_on = date(2026, 9, 1)
    observations = _make_observations()

    _install_failure_trigger(conn, "coverage_segment", "BEFORE")
    try:
        with pytest.raises(Exception, match="injected failure"):
            with conn.transaction():
                write_instrument(conn, instrument_id, run_id, observations, observed_on)
    finally:
        _drop_failure_trigger(conn, "coverage_segment")

    # Nothing should be visible after the rollback
    with conn.cursor() as cur:
        cur.execute(
            "SELECT COUNT(*) FROM instrument_reference WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM coverage_segment WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM acquisition_state WHERE instrument_id = %s",
            (instrument_id,),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]

        cur.execute(
            "SELECT COUNT(*) FROM run_instrument_result WHERE run_id = %s AND instrument_id = %s",
            (run_id, instrument_id),
        )
        assert cur.fetchone()[0] == 0  # type: ignore[index]
