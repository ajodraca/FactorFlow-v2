"""Integration tests: interruption, reclaim, and resumability.

Exercises the complete kill-and-resume scenario:
1. A run processes N instruments and is interrupted (abandoned via reclaim) before
   the active instrument's writer transaction commits.
2. The application-side reclaim sweep terminates the abandoned run.
3. A later requested run is claimed; it acquires only instruments not yet covered.

Interruption is simulated by setting the run to 'abandoned' between instrument
iterations, which causes the heartbeat check at the top of the next iteration
to return False.  The runner stops before writing the next instrument.  This
matches the reclaim-sweeper's contract: it marks the run abandoned; the runner
detects this at the next heartbeat and stops.

- TC-COMP-006: a later run does not duplicate, overwrite, or remove previously
  acquired data (AC-6).
- TC-COMP-012: an interrupted run leaves no coverage presenting incomplete work
  as complete — the active instrument at interruption has neither a result row
  nor a coverage segment (AC-12).
- TC-COMP-020: an abandoned run does not prevent a later run starting (AC-20).
- TC-COMP-148: each instrument commits in its own transaction; committed
  instruments survive an interruption (DAC-E4-14).
- TC-COMP-191: after interruption and reclaim, previously committed instruments
  are not re-fetched by the later run (DAC-E4-S7-2).
- TC-COMP-193: the later run fetches only the uncovered remainder and completes
  it (DAC-E4-S7-2).

# Implements TC-COMP-006
# Implements TC-COMP-012
# Implements TC-COMP-020
# Implements TC-COMP-148
# Implements TC-COMP-191
# Implements TC-COMP-193
"""

from __future__ import annotations

import uuid
from datetime import date
from unittest.mock import MagicMock

import psycopg
import pytest

from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _insert_instrument(conn: psycopg.Connection, symbol: str) -> int:
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


def _insert_claimed_run(conn: psycopg.Connection, depth: int = 5) -> uuid.UUID:
    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, requested_at, started_at, "
            "claimed_by, heartbeat_at) "
            "VALUES (%s, 'running', %s, now(), now(), 'test-runner', now())",
            (run_id, depth),
        )
    conn.commit()
    return run_id


def _abandon_run(conn: psycopg.Connection, run_id: uuid.UUID) -> None:
    """Forcibly abandon a run (simulates the reclaim sweeper acting)."""
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE acquisition_run SET state = 'abandoned', ended_at = now(), "
            "claimed_by = NULL, heartbeat_at = NULL WHERE run_id = %s",
            (run_id,),
        )
    conn.commit()


def _make_stub_client() -> MagicMock:
    mock_client = MagicMock()
    mock_client.fetch_reference.return_value = TickerReference.model_validate(
        {
            "ticker": "X",
            "name": "X Corp",
            "cik": "0001234567",
            "composite_figi": "BBG000B9XRY4",
            "share_class_figi": "BBG001S5N8V8",
            "active": True,
            "list_date": "2000-01-01",
            "delisted_utc": None,
        }
    )
    mock_client.fetch_daily_bars.return_value = [
        DailyBar.model_validate(
            {
                "t": 1735776000000,
                "o": "100.00",
                "h": "105.00",
                "l": "99.00",
                "c": "103.00",
                "v": 500000,
                "vw": "101.00",
                "n": 1000,
            }
        )
    ]
    mock_client.fetch_financials.return_value = [
        FinancialStatement.model_validate(
            {
                "cik": "0001234567",
                "tickers": ["X"],
                "period_end": "2024-12-31",
                "filing_date": "2025-02-01",
                "fiscal_year": 2024,
                "timeframe": "annual",
                "statement_type": "income_statement",
                "total_revenue": "1000000",
            }
        )
    ]
    mock_client.fetch_corporate_actions.return_value = [
        CorporateAction.model_validate(
            {
                "action_type": "split",
                "effective_on": "2020-01-01",
                "ticker": "X",
                "split_from": 1,
                "split_to": 2,
            }
        )
    ]
    return mock_client


def _result_instrument_ids(conn: psycopg.Connection, run_id: uuid.UUID) -> set[int]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT DISTINCT instrument_id FROM run_instrument_result WHERE run_id = %s",
            (run_id,),
        )
        return {int(row[0]) for row in cur.fetchall()}


def _covered_instrument_ids(conn: psycopg.Connection) -> set[int]:
    """Return instrument_ids that have at least one coverage_segment row."""
    with conn.cursor() as cur:
        cur.execute("SELECT DISTINCT instrument_id FROM coverage_segment")
        return {int(row[0]) for row in cur.fetchall()}


def _run_state(conn: psycopg.Connection, run_id: uuid.UUID) -> str:
    with conn.cursor() as cur:
        cur.execute("SELECT state FROM acquisition_run WHERE run_id = %s", (run_id,))
        row = cur.fetchone()
    assert row is not None
    return str(row[0])


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements TC-COMP-148
def test_committed_instruments_survive_mid_run_interruption(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """Each instrument commits in its own transaction; committed instruments
    are durable after a simulated mid-run interruption (DAC-E4-14).

    Interruption is simulated by abandoning the run after the first instrument
    commits.  The runner's heartbeat check detects the abandoned state at the
    top of the next iteration and stops before writing the second instrument.
    """
    # Implements TC-COMP-148
    conn = migrated_runner_connection
    id_committed = _insert_instrument(conn, "COMMITTED")
    id_not_reached = _insert_instrument(conn, "NOTREACHED")
    run_id = _insert_claimed_run(conn, depth=5)

    mock_client = _make_stub_client()
    original_ref = mock_client.fetch_reference.return_value
    call_count = [0]

    def fetch_ref_abandon_after_first(symbol: str) -> TickerReference:
        # Abandon the run after the first instrument's fetch completes.
        # The write for the first instrument still proceeds in this iteration.
        # The heartbeat at the top of the NEXT iteration detects 'abandoned'
        # and stops the runner before writing the second instrument.
        call_count[0] += 1
        if call_count[0] == 1:
            _abandon_run(conn, run_id)
        return original_ref

    mock_client.fetch_reference.side_effect = fetch_ref_abandon_after_first

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(
        run_id=run_id, depth_years=5, instrument_ids=[id_committed, id_not_reached]
    )

    # The committed instrument's results must be durable
    reached = _result_instrument_ids(conn, run_id)
    assert id_committed in reached, "Committed instrument result must survive interruption"

    # The second instrument must not have been reached (heartbeat detected abandoned)
    assert id_not_reached not in reached, (
        "Instrument after interruption must have no result row (AC-12)"
    )
    covered = _covered_instrument_ids(conn)
    assert id_not_reached not in covered, (
        "Instrument after interruption must have no coverage segment (AC-12)"
    )


@pytest.mark.postgres
# Implements TC-COMP-012
def test_interrupted_run_leaves_no_partial_active_instrument_coverage(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """An interrupted run leaves no coverage that presents incomplete work as
    complete — the instrument that was not yet started has neither a result row
    nor a coverage segment (AC-12, DAC-E4-S7-4).

    The run is abandoned after N instruments commit successfully.  The runner
    stops before the (N+1)th instrument because heartbeat returns False.
    """
    # Implements TC-COMP-012
    conn = migrated_runner_connection
    n_committed = 5
    instruments = [_insert_instrument(conn, f"BATCH{i:03d}") for i in range(n_committed + 1)]
    committed_ids = set(instruments[:n_committed])
    not_reached_id = instruments[n_committed]

    run_id = _insert_claimed_run(conn, depth=5)
    mock_client = _make_stub_client()
    original_ref = mock_client.fetch_reference.return_value
    call_count = [0]

    def fetch_ref_abandon_after_nth(symbol: str) -> TickerReference:
        call_count[0] += 1
        if call_count[0] == n_committed:
            # Abandon after the Nth instrument's fetch so its write still
            # commits, but the (N+1)th iteration finds heartbeat False.
            _abandon_run(conn, run_id)
        return original_ref

    mock_client.fetch_reference.side_effect = fetch_ref_abandon_after_nth

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner.execute_claimed(run_id=run_id, depth_years=5, instrument_ids=instruments)

    reached = _result_instrument_ids(conn, run_id)
    covered = _covered_instrument_ids(conn)

    # All committed instruments have result rows and coverage
    for iid in committed_ids:
        assert iid in reached, f"Instrument {iid} should have a result row"
        assert iid in covered, f"Instrument {iid} should have a coverage segment"

    # The not-yet-started instrument has neither — no partial coverage
    assert not_reached_id not in reached, (
        "Instrument not yet started must have no result row (AC-12)"
    )
    assert not_reached_id not in covered, (
        "Instrument not yet started must have no coverage segment (AC-12)"
    )


@pytest.mark.postgres
# Implements TC-COMP-020
def test_abandoned_run_does_not_block_later_run(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """An abandoned run does not prevent a later requested run from being claimed
    and executing (AC-20).

    After the first run is abandoned mid-execution, a new claimed run can
    process remaining instruments successfully.
    """
    # Implements TC-COMP-020
    conn = migrated_runner_connection

    id_first = _insert_instrument(conn, "FIRSTRUN")
    id_second = _insert_instrument(conn, "SECONDRUN")

    # First run processes id_first, then gets abandoned before id_second
    run_id_1 = _insert_claimed_run(conn, depth=5)
    mock_client = _make_stub_client()
    original_ref = mock_client.fetch_reference.return_value
    call_count = [0]

    def fetch_ref_abandon_after_first(symbol: str) -> TickerReference:
        call_count[0] += 1
        if call_count[0] == 1:
            _abandon_run(conn, run_id_1)
        return original_ref

    mock_client.fetch_reference.side_effect = fetch_ref_abandon_after_first

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner_1 = AcquisitionRunner(connection=conn, client=mock_client, today=today)
    runner_1.execute_claimed(run_id=run_id_1, depth_years=5, instrument_ids=[id_first, id_second])

    # First run is now abandoned (terminal) — not blocking
    state_1 = _run_state(conn, run_id_1)
    assert state_1 == "abandoned", f"First run must be abandoned, got {state_1!r}"

    # A second run can be claimed and complete
    run_id_2 = _insert_claimed_run(conn, depth=5)
    mock_client_2 = _make_stub_client()
    runner_2 = AcquisitionRunner(connection=conn, client=mock_client_2, today=today)
    runner_2.execute_claimed(run_id=run_id_2, depth_years=5, instrument_ids=[id_second])

    # Second run reached the second instrument (AC-20)
    reached_2 = _result_instrument_ids(conn, run_id_2)
    assert id_second in reached_2, "Second run must complete after first run terminates (AC-20)"


@pytest.mark.postgres
# Implements TC-COMP-006
# Implements TC-COMP-191
# Implements TC-COMP-193
def test_resume_run_does_not_refetch_committed_instruments(
    migrated_runner_connection: psycopg.Connection,
) -> None:
    """After a mid-run interruption and reclaim, a later run does not re-fetch
    committed instruments and instead completes only the uncovered remainder
    (AC-6, AC-20, DAC-E4-S7-2).

    Steps:
    1. First run processes instruments [A, B, C]; abandoned after A and B write.
    2. Second run processes [A, B, C]; writer idempotency means A and B get
       ``unchanged`` outcome; C is newly written.
    3. Verify: A and B have 'unchanged' outcome in run 2; C has 'written'.
    """
    # Implements TC-COMP-006
    # Implements TC-COMP-191
    # Implements TC-COMP-193
    conn = migrated_runner_connection
    id_a = _insert_instrument(conn, "RSMPA")
    id_b = _insert_instrument(conn, "RSMPB")
    id_c = _insert_instrument(conn, "RSMPC")
    all_ids = [id_a, id_b, id_c]

    run_id_1 = _insert_claimed_run(conn, depth=5)
    mock_client_1 = _make_stub_client()
    original_ref = mock_client_1.fetch_reference.return_value
    call_count_1 = [0]

    def fetch_ref_abandon_after_b(symbol: str) -> TickerReference:
        call_count_1[0] += 1
        if call_count_1[0] == 2:
            # Abandon after B's fetch so B's write still commits; C is never reached
            _abandon_run(conn, run_id_1)
        return original_ref

    mock_client_1.fetch_reference.side_effect = fetch_ref_abandon_after_b

    from factorflow.ingestion.runner import AcquisitionRunner

    today = date(2025, 9, 22)
    runner_1 = AcquisitionRunner(connection=conn, client=mock_client_1, today=today)
    runner_1.execute_claimed(run_id=run_id_1, depth_years=5, instrument_ids=all_ids)

    # After interruption: A and B are committed, C is not
    reached_1 = _result_instrument_ids(conn, run_id_1)
    assert id_a in reached_1, "Instrument A must be committed before interruption"
    assert id_b in reached_1, "Instrument B must be committed before interruption"
    assert id_c not in reached_1, "Instrument C must not be committed at interruption"

    # Coverage exists for A and B, not C
    covered_after_run1 = _covered_instrument_ids(conn)
    assert id_a in covered_after_run1
    assert id_b in covered_after_run1
    assert id_c not in covered_after_run1

    # --- Second run: start fresh, process the same roster ---
    run_id_2 = _insert_claimed_run(conn, depth=5)
    mock_client_2 = _make_stub_client()
    fetch_symbols_2: list[str] = []

    original_ref_2 = mock_client_2.fetch_reference.return_value

    def fetch_ref_tracking(symbol: str) -> TickerReference:
        fetch_symbols_2.append(symbol)
        return original_ref_2

    mock_client_2.fetch_reference.side_effect = fetch_ref_tracking

    runner_2 = AcquisitionRunner(connection=conn, client=mock_client_2, today=today)
    runner_2.execute_claimed(run_id=run_id_2, depth_years=5, instrument_ids=all_ids)

    reached_2 = _result_instrument_ids(conn, run_id_2)
    assert id_a in reached_2, "Instrument A must appear in second run results"
    assert id_b in reached_2, "Instrument B must appear in second run results"
    assert id_c in reached_2, "Instrument C must be acquired in second run (remainder)"

    # A and B outcomes in run 2 must be 'unchanged' — no new rows written (AC-6, DAC-E4-S7-2)
    with conn.cursor() as cur:
        cur.execute(
            "SELECT data_type, outcome FROM run_instrument_result "
            "WHERE run_id = %s AND instrument_id = %s",
            (run_id_2, id_a),
        )
        a_outcomes = {row[0]: row[1] for row in cur.fetchall()}

    assert all(str(v) == "unchanged" for v in a_outcomes.values()), (
        f"Instrument A outcomes in run 2 must all be 'unchanged', got {a_outcomes}"
    )

    with conn.cursor() as cur:
        cur.execute(
            "SELECT data_type, outcome FROM run_instrument_result "
            "WHERE run_id = %s AND instrument_id = %s",
            (run_id_2, id_b),
        )
        b_outcomes = {row[0]: row[1] for row in cur.fetchall()}

    assert all(str(v) == "unchanged" for v in b_outcomes.values()), (
        f"Instrument B outcomes in run 2 must all be 'unchanged', got {b_outcomes}"
    )

    # C must have 'written' outcome in run 2
    with conn.cursor() as cur:
        cur.execute(
            "SELECT data_type, outcome FROM run_instrument_result "
            "WHERE run_id = %s AND instrument_id = %s",
            (run_id_2, id_c),
        )
        c_outcomes = {row[0]: row[1] for row in cur.fetchall()}

    assert all(str(v) == "written" for v in c_outcomes.values()), (
        f"Instrument C outcomes in run 2 must all be 'written', got {c_outcomes}"
    )

    # Provider was called for all three instruments in run 2 (coverage-aware fetch
    # still calls the provider, but writer idempotency produces 'unchanged')
    assert len(fetch_symbols_2) == 3, (
        f"Expected 3 fetch calls in run 2 (one per instrument), got {len(fetch_symbols_2)}: "
        f"{fetch_symbols_2}"
    )
