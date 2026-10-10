"""Integration test: the ingestion entrypoint commits a claimed run (EXP-20261010-2).

`ingestion_main.main()` drives one claim against a real database, and a
separate connection then reads the run. Runner tests that read back on the
runner's own connection see its uncommitted writes, so they cannot catch a
run whose writes never commit.
"""

from __future__ import annotations

import uuid

import psycopg
import pytest

from tests.integration.test_runner_transactions import _insert_instrument, _make_stub_client


@pytest.mark.postgres
def test_main_commits_a_claimed_run_visible_to_another_connection(
    migrated_runner_connection: psycopg.Connection,
    postgres_connection_string: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    import factorflow.ingestion_main as ingestion_main

    observer = migrated_runner_connection
    instrument_id = _insert_instrument(observer, "AA")
    with observer.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run (state, history_depth_years) "
            "VALUES ('requested', 5) RETURNING run_id"
        )
        row = cur.fetchone()
    assert row is not None
    run_id: uuid.UUID = row[0]
    observer.commit()

    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", postgres_connection_string)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "exp-20261010-2-test-key")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    monkeypatch.setattr(ingestion_main, "configure_logging", lambda: None)
    monkeypatch.setattr(ingestion_main, "_build_client_for_key", lambda *_a: _make_stub_client())

    opened: list[psycopg.Connection] = []
    real_connect = psycopg.connect

    def recording_connect(*args, **kwargs):
        connection = real_connect(*args, **kwargs)
        opened.append(connection)
        return connection

    monkeypatch.setattr(ingestion_main.psycopg, "connect", recording_connect)

    def one_claim(*, claim_fn, execute_fn, **_kwargs) -> None:
        token = claim_fn()
        assert token is not None
        execute_fn(token)

    monkeypatch.setattr(ingestion_main, "run_polling_loop", one_claim)

    try:
        assert ingestion_main.main() == 0
    finally:
        # Closing never commits, as when the process exits.
        for connection in opened:
            connection.close()

    with observer.cursor() as cur:
        cur.execute("SELECT state FROM acquisition_run WHERE run_id = %s", (run_id,))
        state_row = cur.fetchone()
        cur.execute(
            "SELECT DISTINCT instrument_id FROM run_instrument_result WHERE run_id = %s",
            (run_id,),
        )
        reached = {r[0] for r in cur.fetchall()}
    observer.commit()

    assert state_row is not None
    assert state_row[0] in ("succeeded", "partial")
    assert reached == {instrument_id}
