"""The 3000-instrument volume proof (CAP-002-E2-S7).

A build over 3000 active instruments, 273 bars and 8 quarters each, run through the real
registered stages with the real peer-set floor, completes inside the AC-11 budget less one
poll interval and writes 24,000 inputs and 9,000 classifications (AC-11, DAC-E2-5,
DAC-E2-S7-1). The population and the clock are DEC-0123's: every input present, 3,000
dividends and 300 splits, ANALYZE after the load, and the wall clock around the one build
call only, since ``statement_timeout`` bounds a statement and not a whole build.
"""

import time
from collections.abc import Iterator
from datetime import date
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import engine
from tests.integration.engine_inputs_support import install_test_line_items
from tests.integration.engine_proof_support import complete_and_open_next, populate_volume
from tests.integration.engine_support import (
    count_classification_rows,
    migrate_through_classification,
)

INSTRUMENTS = 3000
LAST_SESSION = date(2026, 11, 13)  # a Friday; the classification date
BUDGET_SECONDS = 295  # DAC-E2-5: AC-11's 300 s less one 5 s poll interval (DEC-0054)
TIMEOUT_SECONDS = 300.0  # scheduler default, DEC-0067


@pytest.fixture
def volume_set(postgres_connection_string: str) -> Iterator[tuple[psycopg.Connection, UUID]]:
    """The 3000-instrument population and a building set dated its last session."""
    conn = migrate_through_classification(postgres_connection_string)
    try:
        ids, classification_date = populate_volume(conn, INSTRUMENTS, last_session=LAST_SESSION)
        assert len(ids) == INSTRUMENTS
        yield conn, complete_and_open_next(conn, classification_date)
    finally:
        conn.close()


# Implements TC-COMP-091
@pytest.mark.slow
@pytest.mark.postgres
def test_3000_instruments_build_within_the_budget(
    volume_set: tuple[psycopg.Connection, UUID], monkeypatch: pytest.MonkeyPatch
) -> None:
    conn, set_id = volume_set
    install_test_line_items(monkeypatch)

    started = time.perf_counter()
    result = engine.build(conn, set_id, TIMEOUT_SECONDS)
    elapsed = time.perf_counter() - started
    print(f"\n[TC-COMP-091 diagnostic] 3000-instrument build elapsed: {elapsed:.3f}s")

    assert result.state == "complete", result.failure_reason
    assert result.failure_reason is None
    assert elapsed <= BUDGET_SECONDS
    assert count_classification_rows(conn, set_id) == {
        "classification_set_factor": 3,
        "factor_input": 24_000,
        "factor_classification": 9_000,
    }
    assert result.qualified_counts == {"value": 3000, "growth": 3000, "momentum": 3000}
    factors = conn.execute(
        "SELECT factor, qualified_count, ranked FROM classification_set_factor "
        "WHERE set_id = %s ORDER BY factor",
        (set_id,),
    ).fetchall()
    assert factors == [("growth", 3000, True), ("momentum", 3000, True), ("value", 3000, True)]
    # Every row scored: the heaviest path ran, not a fast path of missing inputs.
    statuses = conn.execute(
        "SELECT status, count(*) FROM factor_classification WHERE set_id = %s GROUP BY status",
        (set_id,),
    ).fetchall()
    assert statuses == [("classified", 9000)]
    row = conn.execute(
        "SELECT state, active_instruments FROM classification_set WHERE set_id = %s", (set_id,)
    ).fetchone()
    assert row == ("complete", 3000)
