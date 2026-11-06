"""The running product over a seeded store (CAP-002 integration plan, T002).

A plain helper module, the pattern of ``reader_seed.py``: no fixture and no ``conftest``. The
cases built on it start the real application, so its lifespan runs the classification loop,
then end acquisition runs and read the sets the loop produces through ``GET
/api/classifications/sets`` only.

Two facts shape the helpers. The loop stamps a set's classification date from the database
clock (``claim_set.sql``), so ``seed_roster`` dates its population from that clock, not from a
fixed day. And the loop builds in a worker thread of the same process, so
``install_test_line_items`` (DEC-0286) reaches it.
"""

import time
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import date, datetime, timedelta
from typing import Any
from uuid import UUID
from zoneinfo import ZoneInfo

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from tests.integration.engine_inputs_support import install_test_line_items
from tests.integration.engine_proof_support import populate_volume
from tests.integration.reader_seed import insert_run

__all__ = [
    "chicago_today",
    "end_run",
    "last_weekday",
    "running_product",
    "seed_roster",
    "wait_for_sets",
]

_CHICAGO = ZoneInfo("America/Chicago")


def chicago_today() -> date:
    """The date the loop stamps on a set it claims now (``claim_set.sql``)."""
    return datetime.now(_CHICAGO).date()


def last_weekday(day: date) -> date:
    """``day``, or the weekday before it when ``day`` falls on a weekend."""
    while day.weekday() >= 5:
        day -= timedelta(days=1)
    return day


@contextmanager
def running_product(
    connection_string: str, monkeypatch: pytest.MonkeyPatch, poll_seconds: int = 1
) -> Iterator[TestClient]:
    """The application over ``connection_string``, whose lifespan starts the classification loop.

    The poll interval is ``poll_seconds`` (the setting's floor is 1). The line items carry
    their test keys for as long as the application runs (DEC-0286).
    """
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", connection_string)
    monkeypatch.setenv("FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS", str(poll_seconds))
    install_test_line_items(monkeypatch)
    with TestClient(create_app(), base_url="http://127.0.0.1:8000") as client:
        yield client


def end_run(conn: psycopg.Connection, state: str, ended_at: datetime) -> UUID:
    """An acquisition run in a terminal ``state`` that ended at ``ended_at``.

    The run also started then: ``scheduler_support.add_run`` leaves ``started_at`` empty for
    a terminal run, and the evidence read refuses a set whose run has no start (the runner
    always records one), so a run the API reads is inserted with it.
    """
    return insert_run(conn, state, started_at=ended_at)


def seed_roster(
    conn: psycopg.Connection, count: int, last_session: date | None = None
) -> tuple[list[int], date]:
    """``count`` active stocks with every input of the three factors present.

    ``last_session`` defaults to the last weekday on or before the database's date, so the
    set the loop dates today sees the population's latest session. Returns the instrument ids
    and the session date the population ends on.
    """
    session = last_weekday(chicago_today()) if last_session is None else last_session
    ids, _ = populate_volume(conn, count, last_session=session)
    return ids, session


def wait_for_sets(
    client: TestClient, count: int, timeout_seconds: float = 60, state: str = "complete"
) -> list[dict[str, Any]]:
    """Poll ``GET /api/classifications/sets`` once a second until ``count`` sets are in
    ``state``; return every listed set, newest first. Fails with the last body on timeout."""
    deadline = time.monotonic() + timeout_seconds
    body: dict[str, Any] = {}
    while True:
        response = client.get("/api/classifications/sets", params={"limit": 500})
        assert response.status_code == 200, response.text
        body = response.json()
        sets: list[dict[str, Any]] = body["sets"]
        if sum(1 for s in sets if s["state"] == state) >= count:
            return sets
        if time.monotonic() >= deadline:
            pytest.fail(f"fewer than {count} {state} sets after {timeout_seconds}s: {body}")
        time.sleep(1)
