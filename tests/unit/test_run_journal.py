"""Cursor/connection-boundary tests for `factorflow.runs.journal` (CAP-001-E5-S2).

These tests pin the journal's contract at the psycopg boundary: one statement
per claim, bound parameters, the frozen `ClaimedRun` mapping, and the persisted
snapshot depth — never the current `owner_setting` value.
"""

import dataclasses
import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

import pytest
from factorflow.runs.journal import ClaimedRun, claim_next, request_run

from factorflow.runs import journal


class _RecordingCursor:
    """A cursor that plays back queued `fetchone` rows and records executes."""

    def __init__(self, fetchone_rows: list[Any]) -> None:
        self._rows = list(fetchone_rows)
        self.executed: list[tuple[str, Any]] = []

    def __enter__(self) -> "_RecordingCursor":
        return self

    def __exit__(self, *exc_info: object) -> None:
        return None

    def execute(self, query: str, params: Any = None) -> None:
        self.executed.append((query, params))

    def fetchone(self) -> Any:
        return self._rows.pop(0) if self._rows else None


class _RecordingConnection:
    """Stands in for `psycopg.Connection` at the journal boundary."""

    def __init__(self, fetchone_rows: list[Any]) -> None:
        self.cursor_instance = _RecordingCursor(fetchone_rows)
        self.transactions = 0

    def cursor(self) -> _RecordingCursor:
        return self.cursor_instance

    @contextmanager
    def transaction(self) -> Iterator[None]:
        self.transactions += 1
        yield


def test_claimed_run_is_frozen() -> None:
    claimed = ClaimedRun(run_id=uuid.uuid4(), history_depth_years=3)
    with pytest.raises(dataclasses.FrozenInstanceError):
        claimed.history_depth_years = 9


def test_claim_next_maps_returned_row_in_one_statement() -> None:
    run_id = uuid.uuid4()
    connection = _RecordingConnection([(run_id, 7)])

    claimed = claim_next(connection, "runner-1")

    assert claimed == ClaimedRun(run_id=run_id, history_depth_years=7)
    assert connection.transactions == 1
    assert len(connection.cursor_instance.executed) == 1
    query, params = connection.cursor_instance.executed[0]
    assert params == {"runner_id": "runner-1"}
    assert "NOT EXISTS" in query
    assert "ORDER BY requested_at" in query
    assert "FOR UPDATE SKIP LOCKED" in query
    assert "RETURNING run_id, history_depth_years" in query


def test_claim_next_returns_none_when_no_row() -> None:
    connection = _RecordingConnection([])
    assert claim_next(connection, "runner-1") is None


def test_request_run_returns_new_id_and_queued_behind_in_one_transaction() -> None:
    new_id, active_id = uuid.uuid4(), uuid.uuid4()
    connection = _RecordingConnection([(new_id,), (active_id,)])

    assert request_run(connection, 5) == (new_id, active_id)
    assert connection.transactions == 1
    insert_query, insert_params = connection.cursor_instance.executed[0]
    assert insert_params == (5,)
    assert "'requested'" in insert_query


def test_request_run_reports_none_when_no_active_run() -> None:
    new_id = uuid.uuid4()
    connection = _RecordingConnection([(new_id,), None])

    assert request_run(connection, 5) == (new_id, None)


def test_claim_uses_snapshot_never_stated_depth(monkeypatch: pytest.MonkeyPatch) -> None:
    def _unreachable(connection: object) -> None:
        raise AssertionError("read_history_depth must not be called by the claim")

    monkeypatch.setattr("factorflow.instruments.settings.read_history_depth", _unreachable)
    run_id = uuid.uuid4()
    connection = _RecordingConnection([(run_id, 7)])

    assert claim_next(connection, "runner-1") == ClaimedRun(run_id=run_id, history_depth_years=7)
    assert "read_history_depth" not in vars(journal)
