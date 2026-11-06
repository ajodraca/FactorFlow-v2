"""The classification cycle through the running application (CAP-002 integration plan, T012).

Each test starts the real application over a store migrated through 0006, so the lifespan
runs the classification loop, ends acquisition runs in the store, and reads the outcome through
HTTP only. The line items carry their test keys (DEC-0286): these tests prove the cycle, not the
real provider payload keys. A set is dated the database's day, so every set of one test shares
a classification date and is told apart by its id.
"""

import time
from collections.abc import Iterator
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.classification import engine
from tests.integration.classification_cycle_support import (
    chicago_today,
    end_run,
    running_product,
    seed_roster,
    wait_for_sets,
)
from tests.integration.engine_proof_support import (
    backfill_statement,
    populate_backdating,
    snapshot_set,
)
from tests.integration.engine_support import (
    add_bar,
    add_instrument,
    count_classification_rows,
    migrate_through_classification,
)
from tests.integration.scheduler_support import INTERRUPTED_REASON, add_set

pytestmark = pytest.mark.postgres

Store = tuple[str, psycopg.Connection]


@pytest.fixture
def store(postgres_connection_string: str) -> Iterator[Store]:
    conn = migrate_through_classification(postgres_connection_string)
    try:
        yield postgres_connection_string, conn
    finally:
        conn.close()


def _hours_ago(hours: int) -> datetime:
    return datetime.now(UTC) - timedelta(hours=hours)


def _history(client: TestClient, symbol: str) -> list[dict[str, Any]]:
    response = client.get(f"/api/classifications/stocks/{symbol}/history")
    assert response.status_code == 200, response.text
    sets: list[dict[str, Any]] = response.json()["sets"]
    return sets


# Implements CAP-002 TC-INT-028
def test_succeeded_and_partial_runs_each_get_a_set_in_ended_at_order(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    dsn, conn = store
    seed_roster(conn, 30)
    # Inserted against their ended_at order, so the order the sets are built in is the
    # runs' ended_at, not the insertion order.
    later = end_run(conn, "partial", _hours_ago(1))
    earlier = end_run(conn, "succeeded", _hours_ago(2))

    with running_product(dsn, monkeypatch) as client:
        sets = wait_for_sets(client, 2)

    assert [s["run_id"] for s in sets] == [str(later), str(earlier)]  # newest first
    by_run = {s["run_id"]: s for s in sets}
    assert by_run[str(earlier)]["run_outcome"] == "succeeded"
    assert by_run[str(later)]["run_outcome"] == "partial"
    assert by_run[str(earlier)]["started_at"] < by_run[str(later)]["started_at"]
    assert {s["state"] for s in sets} == {"complete"}
    assert len(sets) == 2  # one set per run


# Implements CAP-002 TC-INT-029
def test_failed_cancelled_and_abandoned_runs_get_no_set(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    dsn, conn = store
    instrument = add_instrument(conn, "AAA")
    add_bar(conn, instrument, chicago_today() - timedelta(days=1))  # one run left observations
    for state in ("failed", "cancelled", "abandoned"):
        end_run(conn, state, _hours_ago(1))

    with running_product(dsn, monkeypatch) as client:
        deadline = time.monotonic() + 5  # several one-second polls
        while time.monotonic() < deadline:
            response = client.get("/api/classifications/sets")
            assert response.status_code == 200
            assert response.json()["sets"] == []
            time.sleep(1)

    row = conn.execute("SELECT count(*) FROM classification_set").fetchone()
    conn.rollback()
    assert row == (0,)


# Implements CAP-002 TC-INT-047
def test_a_newer_run_leaves_the_earlier_sets_rows_identical(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    dsn, conn = store
    seed_roster(conn, 31)
    end_run(conn, "succeeded", _hours_ago(2))

    with running_product(dsn, monkeypatch) as client:
        first = UUID(wait_for_sets(client, 1)[0]["set_id"])
        before = snapshot_set(conn, first)
        assert all(before.values())  # every table holds rows, so equality is not vacuous
        end_run(conn, "succeeded", _hours_ago(1))
        sets = wait_for_sets(client, 2)

    second = UUID(next(s["set_id"] for s in sets if UUID(s["set_id"]) != first))
    assert snapshot_set(conn, first) == before
    rows = count_classification_rows(conn, second)
    assert all(count > 0 for count in rows.values()), rows
    assert snapshot_set(conn, second) != before


# Implements CAP-002 TC-INT-049
def test_a_backfill_after_a_set_changes_only_the_next_set(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    dsn, conn = store
    day = chicago_today()
    pop = populate_backdating(conn, classification_date=day)
    end_run(conn, "succeeded", _hours_ago(3))

    with running_product(dsn, monkeypatch) as client:
        wait_for_sets(client, 1)
        end_run(conn, "succeeded", _hours_ago(2))  # S2 makes S1 a history entry
        wait_for_sets(client, 2)
        before = _history(client, "A")
        assert len(before) == 1 and before[0]["classification_date"] == day.isoformat()
        assert before[0]["factors"]["growth"]["reason_code"] == "input_missing"

        backfill_statement(conn, pop)

        assert _history(client, "A") == before  # unchanged by the backfill, still dated D
        end_run(conn, "succeeded", _hours_ago(1))
        wait_for_sets(client, 3)
        evidence = client.get("/api/classifications/stocks/A").json()
        history = _history(client, "A")

    growth = evidence["factors"]["growth"]
    assert (growth["status"], growth["restated_possible"]) == ("classified", True)
    assert len(history) == 2
    assert history[1] == before[0]  # the first set, byte for byte
    assert history[0]["factors"]["growth"]["reason_code"] == "input_missing"  # S2 predates it
    assert {entry["classification_date"] for entry in history} == {day.isoformat()}


# Implements CAP-002 TC-INT-053
def test_an_application_start_fails_a_stale_building_set_and_classifies_the_next_run(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    dsn, conn = store
    seed_roster(conn, 30)
    stale = add_set(conn, end_run(conn, "succeeded", _hours_ago(3)), "building")
    waiting = end_run(conn, "succeeded", _hours_ago(1))

    with running_product(dsn, monkeypatch) as client:
        sets = wait_for_sets(client, 1)

    by_id = {s["set_id"]: s for s in sets}
    assert by_id[str(stale)]["state"] == "failed"
    assert by_id[str(stale)]["failure_reason"] == INTERRUPTED_REASON
    built = [s for s in sets if s["state"] == "complete"]
    assert [s["run_id"] for s in built] == [str(waiting)]
    assert len(sets) == 2


# Implements CAP-002 TC-INT-054 (part: the running product records the failure)
def test_a_failing_build_is_listed_as_failed_and_leaves_no_rows(
    store: Store, monkeypatch: pytest.MonkeyPatch
) -> None:
    dsn, conn = store
    seed_roster(conn, 30)
    run = end_run(conn, "succeeded", _hours_ago(1))

    def write_then_fail(connection: psycopg.Connection, context: engine.BuildContext) -> None:
        connection.execute(
            "INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked) "
            "VALUES (%s, 'value', 1, false)",
            (context.set_id,),
        )
        raise RuntimeError("injected failure")

    monkeypatch.setattr(engine, "_STAGES", [write_then_fail])

    with running_product(dsn, monkeypatch) as client:
        sets = wait_for_sets(client, 1, state="failed")

    assert [s["state"] for s in sets] == ["failed"]
    failed = sets[0]
    assert failed["run_id"] == str(run)
    assert failed["failure_reason"] == "RuntimeError: injected failure"
    assert failed["ended_at"] is not None
    assert count_classification_rows(conn, UUID(failed["set_id"])) == {
        "classification_set_factor": 0,
        "factor_input": 0,
        "factor_classification": 0,
    }
