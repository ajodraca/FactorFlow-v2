"""`POST/GET /api/acquisition-runs` and `POST /api/acquisition-runs/{id}/cancel`
against a real PostgreSQL instance.

Component design: `component-design-ingestion-api.md` sections 2.4, 11;
task plan T002, T003.
"""

from __future__ import annotations

import uuid
from collections.abc import Iterator
from datetime import UTC, datetime, timedelta

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.ingestion.massive.errors import ProviderUnavailable, compose_failure_reason

# ---------------------------------------------------------------------------
# Shared fixture
# ---------------------------------------------------------------------------


@pytest.fixture
def runs_client(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> Iterator[TestClient]:
    """TestClient against a fully-migrated database (all 4 migrations applied)."""

    migration_dir = MIGRATIONS_DIR
    conn = psycopg.connect(postgres_connection_string)
    for path in sorted(migration_dir.glob("*.sql")):
        conn.execute(path.read_text())
    conn.commit()
    conn.close()

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", postgres_connection_string)
    with TestClient(create_app()) as client:
        yield client


def _set_history_depth(client: TestClient, years: int) -> None:
    resp = client.put("/api/settings/history-depth", json={"years": years})
    assert resp.status_code == 200, resp.text


def _add_instrument(client: TestClient, symbol: str) -> None:
    resp = client.post("/api/instruments", json={"symbols": [symbol]})
    assert resp.status_code in (201, 409), resp.text


def _start_run(client: TestClient) -> dict:
    resp = client.post("/api/acquisition-runs")
    return resp


def _db_run_count(postgres_connection_string: str) -> int:
    conn = psycopg.connect(postgres_connection_string)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT count(*) FROM acquisition_run")
            return int(cur.fetchone()[0])
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# T002 — Start and cancel endpoint behaviour
# ---------------------------------------------------------------------------


@pytest.mark.postgres
def test_start_valid_returns_202_requested_null_queued_behind(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-019: a valid start returns 202 with state=requested and
    queued_behind=null when no other run is active."""
    _set_history_depth(runs_client, 5)
    _add_instrument(runs_client, "AAPL")

    before = _db_run_count(postgres_connection_string)
    resp = _start_run(runs_client)

    assert resp.status_code == 202, resp.text
    body = resp.json()
    assert body["state"] == "requested"
    assert body["run_id"]
    assert body["queued_behind"] is None
    assert _db_run_count(postgres_connection_string) == before + 1


@pytest.mark.postgres
# Implements TC-INT-009
def test_start_with_active_run_returns_202_queued_behind_set(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-023/AC-23: a second start while a run is active returns 202
    with queued_behind pointing to the active run; a new row is created."""
    _set_history_depth(runs_client, 5)
    _add_instrument(runs_client, "AAPL")

    first = _start_run(runs_client)
    assert first.status_code == 202
    first_id = first.json()["run_id"]

    # Make the first run 'running' so it is the active run.
    conn = psycopg.connect(postgres_connection_string)
    try:
        conn.execute(
            "UPDATE acquisition_run SET state='running', started_at=now(), "
            "claimed_by='test', heartbeat_at=now() WHERE run_id=%s",
            (uuid.UUID(first_id),),
        )
        conn.commit()
    finally:
        conn.close()

    before = _db_run_count(postgres_connection_string)
    resp = _start_run(runs_client)

    assert resp.status_code == 202, resp.text
    body = resp.json()
    assert body["state"] == "requested"
    assert body["queued_behind"] == first_id
    assert _db_run_count(postgres_connection_string) == before + 1

    running = runs_client.get("/api/acquisition-runs", params={"state": "running"})
    assert running.status_code == 200, running.text
    assert [r["run_id"] for r in running.json()["runs"]] == [first_id]


@pytest.mark.postgres
# Implements TC-INT-010
def test_start_no_depth_returns_409_history_depth_not_set(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-249/DAC-E5-14: no depth set → 409 history_depth_not_set,
    no run row written."""
    _add_instrument(runs_client, "AAPL")

    before = _db_run_count(postgres_connection_string)
    resp = _start_run(runs_client)

    assert resp.status_code == 409, resp.text
    body = resp.json()
    assert body["error"]["code"] == "history_depth_not_set"
    assert body["error"]["resource"] == "acquisition-run"
    assert _db_run_count(postgres_connection_string) == before


@pytest.mark.postgres
# Implements TC-INT-010
def test_start_no_active_instruments_returns_409_no_active_instruments(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-250/AC-24: depth set but roster empty → 409 no_active_instruments,
    no run row written."""
    _set_history_depth(runs_client, 5)

    before = _db_run_count(postgres_connection_string)
    resp = _start_run(runs_client)

    assert resp.status_code == 409, resp.text
    body = resp.json()
    assert body["error"]["code"] == "no_active_instruments"
    assert body["error"]["resource"] == "acquisition-run"
    assert _db_run_count(postgres_connection_string) == before


@pytest.mark.postgres
def test_start_retired_only_roster_returns_409_no_active_instruments(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """AC-24: a roster where every instrument is retired is treated as empty."""
    _set_history_depth(runs_client, 5)
    _add_instrument(runs_client, "AAPL")
    runs_client.delete("/api/instruments/AAPL")

    before = _db_run_count(postgres_connection_string)
    resp = _start_run(runs_client)

    assert resp.status_code == 409, resp.text
    assert resp.json()["error"]["code"] == "no_active_instruments"
    assert _db_run_count(postgres_connection_string) == before


@pytest.mark.postgres
def test_start_both_preconditions_unmet_returns_history_depth_not_set(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """DAC-E5-S5-1: when both preconditions are absent, the response is
    deterministically history_depth_not_set (depth-first precedence)."""
    # Neither depth set nor any active instrument.
    before = _db_run_count(postgres_connection_string)
    resp = _start_run(runs_client)

    assert resp.status_code == 409, resp.text
    assert resp.json()["error"]["code"] == "history_depth_not_set"
    assert _db_run_count(postgres_connection_string) == before


@pytest.mark.postgres
# Implements TC-INT-015
def test_cancel_queued_run_returns_202_cancelled(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-279/AC-26: cancelling a queued (requested) run returns 202
    with state=cancelled and does not change any active run."""
    _set_history_depth(runs_client, 5)
    _add_instrument(runs_client, "AAPL")

    run_resp = _start_run(runs_client)
    assert run_resp.status_code == 202
    run_id = run_resp.json()["run_id"]

    cancel_resp = runs_client.post(f"/api/acquisition-runs/{run_id}/cancel")

    assert cancel_resp.status_code == 202, cancel_resp.text
    body = cancel_resp.json()
    assert body["state"] == "cancelled"


@pytest.mark.postgres
# Implements TC-INT-015
def test_cancel_queued_run_leaves_active_run_unaffected(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """AC-26: cancelling a run queued behind an active run returns 202 with
    state=cancelled and leaves the active run running."""
    _set_history_depth(runs_client, 5)
    _add_instrument(runs_client, "AAPL")

    active_resp = _start_run(runs_client)
    assert active_resp.status_code == 202, active_resp.text
    active_id = active_resp.json()["run_id"]

    conn = psycopg.connect(postgres_connection_string)
    try:
        conn.execute(
            "UPDATE acquisition_run SET state='running', started_at=now(), "
            "claimed_by='test', heartbeat_at=now() WHERE run_id=%s",
            (uuid.UUID(active_id),),
        )
        conn.commit()
    finally:
        conn.close()

    queued_resp = _start_run(runs_client)
    assert queued_resp.status_code == 202, queued_resp.text
    assert queued_resp.json()["queued_behind"] == active_id
    queued_id = queued_resp.json()["run_id"]

    cancel_resp = runs_client.post(f"/api/acquisition-runs/{queued_id}/cancel")

    assert cancel_resp.status_code == 202, cancel_resp.text
    assert cancel_resp.json()["state"] == "cancelled"

    active_detail = runs_client.get(f"/api/acquisition-runs/{active_id}")
    assert active_detail.status_code == 200, active_detail.text
    assert active_detail.json()["run"]["state"] == "running"


@pytest.mark.postgres
# Implements TC-INT-014
def test_cancel_running_run_returns_202_cancelling(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-280/AC-19: cancelling a running run returns 202 with
    state=cancelling."""
    _set_history_depth(runs_client, 5)
    _add_instrument(runs_client, "AAPL")

    run_resp = _start_run(runs_client)
    run_id = run_resp.json()["run_id"]

    conn = psycopg.connect(postgres_connection_string)
    try:
        conn.execute(
            "UPDATE acquisition_run SET state='running', started_at=now(), "
            "claimed_by='test', heartbeat_at=now() WHERE run_id=%s",
            (uuid.UUID(run_id),),
        )
        conn.commit()
    finally:
        conn.close()

    cancel_resp = runs_client.post(f"/api/acquisition-runs/{run_id}/cancel")

    assert cancel_resp.status_code == 202, cancel_resp.text
    assert cancel_resp.json()["state"] == "cancelling"


@pytest.mark.postgres
# Implements TC-INT-016
def test_cancel_terminal_run_returns_409_run_already_terminal(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-281/DAC-E5-S5-2: cancelling a terminal run returns 409
    run_already_terminal carrying the actual persisted state."""
    _set_history_depth(runs_client, 5)
    _add_instrument(runs_client, "AAPL")

    run_resp = _start_run(runs_client)
    run_id = run_resp.json()["run_id"]

    # Put it into each terminal state and assert the 409.
    for terminal_state in ("succeeded", "partial", "failed", "cancelled", "abandoned"):
        conn = psycopg.connect(postgres_connection_string)
        try:
            conn.execute(
                "UPDATE acquisition_run SET state=%s, ended_at=now(), "
                "claimed_by=NULL, heartbeat_at=NULL WHERE run_id=%s",
                (terminal_state, uuid.UUID(run_id)),
            )
            conn.commit()
        finally:
            conn.close()

        resp = runs_client.post(f"/api/acquisition-runs/{run_id}/cancel")

        assert resp.status_code == 409, f"state={terminal_state}: {resp.text}"
        body = resp.json()
        assert body["error"]["code"] == "run_already_terminal"
        assert body["error"]["state"] == terminal_state
        assert body["error"]["resource"] == "acquisition-run"

        # Reset to 'requested' for next iteration (except last).
        if terminal_state != "abandoned":
            conn = psycopg.connect(postgres_connection_string)
            try:
                conn.execute(
                    "UPDATE acquisition_run SET state='requested', ended_at=NULL WHERE run_id=%s",
                    (uuid.UUID(run_id),),
                )
                conn.commit()
            finally:
                conn.close()


@pytest.mark.postgres
# Implements TC-INT-016
def test_cancel_unknown_run_returns_404(
    runs_client: TestClient,
) -> None:
    """TC-COMP-284/DAC-E5-S5-3: cancelling an unknown run id returns 404."""
    unknown_id = str(uuid.uuid4())
    resp = runs_client.post(f"/api/acquisition-runs/{unknown_id}/cancel")

    assert resp.status_code == 404, resp.text
    assert resp.json()["error"]["code"] == "not_found"


@pytest.mark.postgres
def test_start_refusal_uses_singular_resource_name_and_request_id(
    runs_client: TestClient,
) -> None:
    """TC-COMP-279 (error shape): every refusal uses singular resource
    'acquisition-run' and carries the same request id in body and header."""
    resp = _start_run(runs_client)  # No depth, no instruments.

    assert resp.status_code == 409
    body = resp.json()
    assert body["error"]["resource"] == "acquisition-run"
    assert body["error"]["request_id"]
    assert resp.headers.get("X-Request-Id") == body["error"]["request_id"]


# ---------------------------------------------------------------------------
# T003 — List and detail endpoint behaviour
# ---------------------------------------------------------------------------


def _seed_run(
    conn: psycopg.Connection,
    state: str,
    requested_at: datetime | None = None,
    history_depth_years: int = 5,
) -> uuid.UUID:
    """Insert a run directly, bypassing the API to control timing and state."""
    at = requested_at or datetime.now(UTC)
    terminal_states = frozenset({"succeeded", "partial", "failed", "cancelled", "abandoned"})
    active_states = frozenset({"running", "cancelling"})

    with conn.cursor() as cur:
        if state in terminal_states:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years, requested_at, "
                "ended_at) VALUES (%s, %s, %s, now()) RETURNING run_id",
                (state, history_depth_years, at),
            )
        elif state in active_states:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years, requested_at, "
                "started_at, claimed_by, heartbeat_at) "
                "VALUES (%s, %s, %s, now(), 'test', now()) RETURNING run_id",
                (state, history_depth_years, at),
            )
        else:
            cur.execute(
                "INSERT INTO acquisition_run (state, history_depth_years, requested_at) "
                "VALUES (%s, %s, %s) RETURNING run_id",
                (state, history_depth_years, at),
            )
        row = cur.fetchone()
    conn.commit()
    assert row is not None
    return row[0]


def _seed_instrument(conn: psycopg.Connection, symbol: str) -> int:
    """Insert an active instrument and return its id."""
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle) VALUES (%s, 'active') "
            "ON CONFLICT (symbol) DO UPDATE SET lifecycle='active' RETURNING instrument_id",
            (symbol,),
        )
        row = cur.fetchone()
    conn.commit()
    assert row is not None
    return int(row[0])


def _seed_result(
    conn: psycopg.Connection,
    run_id: uuid.UUID,
    instrument_id: int,
    data_type: str,
    outcome: str,
    reason: str | None = None,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO run_instrument_result "
            "(run_id, instrument_id, data_type, outcome, reason) "
            "VALUES (%s, %s, %s, %s, %s)",
            (run_id, instrument_id, data_type, outcome, reason),
        )
    conn.commit()


@pytest.mark.postgres
# Implements TC-INT-011
def test_list_runs_reverse_chronological_order(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-009/DAC-E5-S5-4: runs are returned newest-first by
    (requested_at, run_id) DESC."""
    base = datetime(2026, 1, 1, tzinfo=UTC)
    conn = psycopg.connect(postgres_connection_string)
    try:
        id1 = _seed_run(conn, "succeeded", requested_at=base)
        id2 = _seed_run(conn, "failed", requested_at=base + timedelta(minutes=1))
        id3 = _seed_run(conn, "requested", requested_at=base + timedelta(minutes=2))
    finally:
        conn.close()

    resp = runs_client.get("/api/acquisition-runs")

    assert resp.status_code == 200, resp.text
    body = resp.json()
    run_ids = [r["run_id"] for r in body["runs"]]
    assert run_ids.index(str(id3)) < run_ids.index(str(id2)) < run_ids.index(str(id1))


@pytest.mark.postgres
def test_list_runs_default_page_size_is_50(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-009: default limit is 50."""
    base = datetime(2026, 1, 1, tzinfo=UTC)
    conn = psycopg.connect(postgres_connection_string)
    try:
        for i in range(55):
            _seed_run(conn, "succeeded", requested_at=base + timedelta(seconds=i))
    finally:
        conn.close()

    resp = runs_client.get("/api/acquisition-runs")

    assert resp.status_code == 200
    body = resp.json()
    assert len(body["runs"]) == 50
    assert body["next_cursor"] is not None


@pytest.mark.postgres
def test_list_runs_accepts_limit_500(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-009: limit=500 is accepted."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        for _i in range(3):
            _seed_run(conn, "succeeded")
    finally:
        conn.close()

    resp = runs_client.get("/api/acquisition-runs?limit=500")

    assert resp.status_code == 200


@pytest.mark.postgres
def test_list_runs_rejects_limit_501(
    runs_client: TestClient,
) -> None:
    """TC-COMP-009/DAC-E5-S5-4: limit=501 returns 422."""
    resp = runs_client.get("/api/acquisition-runs?limit=501")

    assert resp.status_code == 422


@pytest.mark.postgres
# Implements TC-INT-011
def test_list_runs_state_filter(runs_client: TestClient, postgres_connection_string: str) -> None:
    """TC-COMP-009/DAC-E5-S5-4: state filter returns only matching runs."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        succeeded_id = _seed_run(conn, "succeeded")
        _seed_run(conn, "failed")
    finally:
        conn.close()

    resp = runs_client.get("/api/acquisition-runs?state=succeeded")

    assert resp.status_code == 200
    body = resp.json()
    assert all(r["state"] == "succeeded" for r in body["runs"])
    assert any(r["run_id"] == str(succeeded_id) for r in body["runs"])


@pytest.mark.postgres
# Implements TC-INT-011
def test_list_runs_cursor_continuation_no_gaps(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-282/DAC-E5-S5-4: cursor pagination produces no duplicates
    or omissions across pages."""
    base = datetime(2026, 2, 1, tzinfo=UTC)
    conn = psycopg.connect(postgres_connection_string)
    try:
        seeded_ids = {
            str(_seed_run(conn, "succeeded", requested_at=base + timedelta(seconds=i)))
            for i in range(7)
        }
    finally:
        conn.close()

    collected: list[str] = []
    cursor = None
    while True:
        url = "/api/acquisition-runs?limit=3"
        if cursor:
            url += f"&cursor={cursor}"
        resp = runs_client.get(url)
        assert resp.status_code == 200
        body = resp.json()
        page_ids = [r["run_id"] for r in body["runs"]]
        collected.extend(page_ids)
        cursor = body.get("next_cursor")
        if not cursor:
            break

    assert len(collected) == len(set(collected)), "duplicates found"
    assert seeded_ids == set(collected)


@pytest.mark.postgres
def test_list_runs_malformed_cursor_returns_422(
    runs_client: TestClient,
) -> None:
    """TC-COMP-282/DAC-E5-S5-4: a malformed cursor returns 422."""
    resp = runs_client.get("/api/acquisition-runs?cursor=not_a_valid_cursor_at_all")

    assert resp.status_code == 422


@pytest.mark.postgres
# Implements TC-INT-013
def test_get_run_detail_unknown_returns_404(
    runs_client: TestClient,
) -> None:
    """TC-COMP-010/DAC-E5-S5-5: unknown run id returns 404."""
    resp = runs_client.get(f"/api/acquisition-runs/{uuid.uuid4()}")

    assert resp.status_code == 404
    error = resp.json()["error"]
    assert error["code"] == "not_found"
    assert error["resource"] == "acquisition-run"
    assert error["message"]
    assert error["request_id"]


@pytest.mark.postgres
# Implements TC-INT-012
def test_get_run_detail_returns_run_counts_and_results(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-010/DAC-E5-S5-5: run detail includes run summary, persisted
    counts, and per-instrument per-data-type results."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        run_id = _seed_run(conn, "partial")
        instr_id = _seed_instrument(conn, "AAPL")
        _seed_result(conn, run_id, instr_id, "prices", "written")
        _seed_result(conn, run_id, instr_id, "reference", "failed", "timeout")
    finally:
        conn.close()

    resp = runs_client.get(f"/api/acquisition-runs/{run_id}")

    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "run" in body
    assert "counts" in body
    assert "results" in body
    run = body["run"]
    assert run["run_id"] == str(run_id)
    assert run["state"] == "partial"
    results = body["results"]
    assert any(r["data_type"] == "prices" and r["outcome"] == "written" for r in results)
    assert any(r["data_type"] == "reference" and r["outcome"] == "failed" for r in results)


@pytest.mark.postgres
def test_get_run_detail_failure_first_ordering(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-283/DAC-E5-S5-5: failed instruments appear before successful
    ones in run detail."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        run_id = _seed_run(conn, "partial")
        ok_id = _seed_instrument(conn, "MSFT")
        bad_id = _seed_instrument(conn, "GOOG")
        _seed_result(conn, run_id, ok_id, "prices", "written")
        _seed_result(conn, run_id, bad_id, "prices", "failed", "timeout")
    finally:
        conn.close()

    resp = runs_client.get(f"/api/acquisition-runs/{run_id}")

    assert resp.status_code == 200
    results = resp.json()["results"]
    instrument_order = [r["instrument_id"] for r in results]
    bad_pos = instrument_order.index(bad_id)
    ok_pos = instrument_order.index(ok_id)
    assert bad_pos < ok_pos


@pytest.mark.postgres
def test_get_run_detail_outcome_filter(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-283/DAC-E5-S5-5: outcome filter selects instruments by
    matching outcome."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        run_id = _seed_run(conn, "partial")
        ok_id = _seed_instrument(conn, "TSLA")
        bad_id = _seed_instrument(conn, "NVDA")
        _seed_result(conn, run_id, ok_id, "prices", "written")
        _seed_result(conn, run_id, bad_id, "prices", "failed")
    finally:
        conn.close()

    resp = runs_client.get(f"/api/acquisition-runs/{run_id}?outcome=failed")

    assert resp.status_code == 200
    results = resp.json()["results"]
    assert all(r["outcome"] == "failed" for r in results)
    assert any(r["instrument_id"] == bad_id for r in results)
    assert not any(r["instrument_id"] == ok_id for r in results)


@pytest.mark.postgres
def test_get_run_detail_cursor_continuation_no_gaps(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-283/DAC-E5-S5-5: instrument-level cursor pagination produces
    no duplicates or omissions."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        run_id = _seed_run(conn, "succeeded")
        instr_ids = set()
        for i in range(7):
            iid = _seed_instrument(conn, f"SYM{i:03d}")
            instr_ids.add(iid)
            _seed_result(conn, run_id, iid, "prices", "written")
    finally:
        conn.close()

    collected_instr: set[int] = set()
    cursor = None
    while True:
        url = f"/api/acquisition-runs/{run_id}?limit=3"
        if cursor:
            url += f"&cursor={cursor}"
        resp = runs_client.get(url)
        assert resp.status_code == 200
        body = resp.json()
        for r in body["results"]:
            collected_instr.add(r["instrument_id"])
        cursor = body.get("next_cursor")
        if not cursor:
            break

    assert collected_instr == instr_ids


@pytest.mark.postgres
def test_list_runs_response_shape(runs_client: TestClient, postgres_connection_string: str) -> None:
    """TC-COMP-009/DAC-E5-S5-4: list response has top-level keys 'runs'
    and 'next_cursor'; each run summary has the owner-confirmed fields."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        _seed_run(conn, "succeeded")
    finally:
        conn.close()

    resp = runs_client.get("/api/acquisition-runs")

    assert resp.status_code == 200
    body = resp.json()
    assert "runs" in body
    assert "next_cursor" in body
    run = body["runs"][0]
    for field in ("run_id", "state", "history_depth_years", "requested_at"):
        assert field in run, f"missing field: {field}"


@pytest.mark.postgres
def test_get_run_detail_response_shape(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """TC-COMP-010/DAC-E5-S5-5: detail response has top-level keys 'run',
    'counts', and 'results'."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        run_id = _seed_run(conn, "succeeded")
    finally:
        conn.close()

    resp = runs_client.get(f"/api/acquisition-runs/{run_id}")

    assert resp.status_code == 200
    body = resp.json()
    assert "run" in body
    assert "counts" in body
    assert "results" in body


@pytest.mark.postgres
# Implements TC-INT-012
def test_api_detail_includes_sql_outcome_counts_and_symbols(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """CAP-001-E7-S1: detail exposes additive row counts and row symbols."""
    conn = psycopg.connect(postgres_connection_string)
    try:
        run_id = _seed_run(conn, "partial")
        aapl_id = _seed_instrument(conn, "AAPL")
        zzzz_id = _seed_instrument(conn, "ZZZZ")
        _seed_result(conn, run_id, aapl_id, "prices", "written")
        _seed_result(conn, run_id, aapl_id, "reference", "failed", "timeout")
        for data_type in ("prices", "reference", "fundamentals", "corporate_actions"):
            _seed_result(conn, run_id, zzzz_id, data_type, "not_found")
        conn.execute(
            "UPDATE acquisition_run SET instruments_named = 2, instruments_written = 1, "
            "instruments_failed = 1 WHERE run_id = %s",
            (run_id,),
        )
        conn.commit()
    finally:
        conn.close()

    response = runs_client.get(f"/api/acquisition-runs/{run_id}?limit=1")

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["counts"] == {
        "instruments_named": 2,
        "instruments_written": 1,
        "instruments_failed": 1,
        "results_by_outcome": {
            "written": 1,
            "unchanged": 0,
            "not_found": 4,
            "failed": 1,
            "skipped": 0,
        },
    }
    assert {result["symbol"] for result in body["results"]} == {"AAPL"}


@pytest.mark.postgres
def test_api_detail_outcome_filter_preserves_counts_and_redacts_reason(
    runs_client: TestClient, postgres_connection_string: str
) -> None:
    """CAP-001-E7-S1: a filtered detail view retains whole-run safe counts."""
    secret = "synthetic-credential-like-value"
    conn = psycopg.connect(postgres_connection_string)
    try:
        run_id = _seed_run(conn, "partial")
        aapl_id = _seed_instrument(conn, "AAPL")
        zzzz_id = _seed_instrument(conn, "ZZZZ")
        reason = compose_failure_reason(
            ProviderUnavailable(
                f"provider unavailable key={secret}", provider_request_id="req-e7s1-001"
            ),
            symbol="AAPL",
            data_type="reference",
            redact=lambda text: text.replace(secret, "[redacted]"),
        )
        _seed_result(conn, run_id, aapl_id, "reference", "failed", reason)
        _seed_result(conn, run_id, zzzz_id, "fundamentals", "not_found")
        conn.commit()
    finally:
        conn.close()

    response = runs_client.get(f"/api/acquisition-runs/{run_id}?outcome=not_found")

    assert response.status_code == 200, response.text
    body = response.json()
    assert {result["outcome"] for result in body["results"]} == {"not_found"}
    assert body["counts"]["results_by_outcome"] == {
        "written": 0,
        "unchanged": 0,
        "not_found": 1,
        "failed": 1,
        "skipped": 0,
    }
    unfiltered_response = runs_client.get(f"/api/acquisition-runs/{run_id}")
    assert unfiltered_response.status_code == 200, unfiltered_response.text
    assert (
        unfiltered_response.json()["counts"]["results_by_outcome"]
        == body["counts"]["results_by_outcome"]
    )
    assert secret not in unfiltered_response.text


@pytest.mark.postgres
def test_api_run_filters_reject_unknown_enumerations(
    runs_client: TestClient,
) -> None:
    """CAP-001-E7-S1: invalid read filters use the shared 422 envelope."""
    for path in (
        "/api/acquisition-runs?state=bogus",
        f"/api/acquisition-runs/{uuid.uuid4()}?outcome=bogus",
    ):
        response = runs_client.get(path)

        assert response.status_code == 422, response.text
        error = response.json()["error"]
        assert set(error) == {"code", "message", "resource", "request_id"}
        assert error["code"] == "validation_error"
        assert error["resource"] == "acquisition-run"
        assert error["request_id"]
