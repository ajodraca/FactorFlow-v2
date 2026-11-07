"""A 3000-stock run is summarised within five minutes of its end (CAP-002 integration plan, T014).

``test_engine_volume.py`` times the build alone. This case times what a user waits for: the
run ends, the running application's loop notices it on a poll, builds the set, and the
summary read shows it. It needs several minutes and the memory the volume build needs, so it
runs only when ``-m slow`` is selected.
"""

import time
from datetime import UTC, datetime

import psycopg
import pytest
from fastapi.testclient import TestClient

from tests.integration.classification_cycle_support import end_run, running_product, seed_roster
from tests.integration.engine_support import migrate_through_classification

pytestmark = [pytest.mark.slow, pytest.mark.postgres]

INSTRUMENTS = 3000
LIMIT_SECONDS = 300  # AC-11: five minutes from the run's end


def _wait_for_summary(client: TestClient, run_id: str, started: float) -> float:
    """Poll the summary once a second until its set is the run's; return the elapsed seconds."""
    while True:
        response = client.get("/api/classifications/summary")
        assert response.status_code == 200, response.text
        current = response.json()["set"]
        elapsed = time.monotonic() - started
        if current is not None and current["run_id"] == run_id:
            return elapsed
        if elapsed > LIMIT_SECONDS + 30:  # well past the limit: stop polling and let it fail
            return elapsed
        time.sleep(1)


# Implements CAP-002 TC-INT-031
def test_a_3000_stock_run_is_summarised_within_five_minutes_of_its_end(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    conn: psycopg.Connection = migrate_through_classification(postgres_connection_string)
    try:
        ids, _ = seed_roster(conn, INSTRUMENTS)
        assert len(ids) == INSTRUMENTS
        with running_product(postgres_connection_string, monkeypatch) as client:
            started = time.monotonic()  # T: the run ends
            run_id = end_run(conn, "succeeded", datetime.now(UTC))

            elapsed = _wait_for_summary(client, str(run_id), started)

            summary = client.get("/api/classifications/summary").json()
        print(f"\n[TC-INT-031 diagnostic] run end to summarised: {elapsed:.3f}s")
        assert summary["set"] is not None, "no set reached the summary"
        assert summary["set"]["run_id"] == str(run_id)
        assert summary["set"]["state"] == "complete"
        assert summary["set"]["active_instruments"] == INSTRUMENTS
        assert elapsed <= LIMIT_SECONDS
    finally:
        conn.close()
