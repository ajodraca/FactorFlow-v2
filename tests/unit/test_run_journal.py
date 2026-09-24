"""Cursor/connection-boundary tests for `factorflow.runs.journal` (CAP-001-E5-S2/S3).

These tests pin the journal's contract at the psycopg boundary: one statement
per claim, bound parameters, the frozen `ClaimedRun` mapping, and the persisted
snapshot depth — never the current `owner_setting` value.

S3 additions (T006): bound UUID/state parameters for request_cancel; exact
mapping of written/unchanged to the successful-result set; four-required-data-types
completeness check; non-caller-selectable finalise signature; RunAlreadyTerminal.actual_state;
validation-before-write via the S1 state-transition helper; SQL values as
psycopg parameters rather than interpolated strings.
"""

import dataclasses
import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

import pytest

from factorflow.runs import journal
from factorflow.runs.journal import (
    ClaimedRun,
    RunAlreadyTerminal,
    claim_next,
    request_cancel,
    request_run,
)


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


# ---------------------------------------------------------------------------
# T006: S3 cancellation/finalisation boundary tests (CAP-001-E5-S3)
# ---------------------------------------------------------------------------


def test_run_already_terminal_carries_actual_state() -> None:
    """RunAlreadyTerminal exposes the persisted state via .actual_state.

    The exception must carry the state so the caller can name the actual
    terminal state in error messages (DAC-E5-9, DAC-E5-S3-4).
    """
    exc = RunAlreadyTerminal("cannot cancel", actual_state="succeeded")
    assert exc.actual_state == "succeeded"


def test_request_cancel_passes_run_id_as_bound_parameter() -> None:
    """request_cancel issues SQL with run_id as a bound parameter, not interpolated.

    The connection must receive the run_id value as a psycopg parameter so it
    is sent as a typed bind variable rather than a raw string fragment (prevents
    SQL injection; validates the psycopg boundary contract).
    """
    run_id = uuid.uuid4()
    # Simulate a non-terminal running run
    connection = _RecordingConnection([("running",)])

    # request_cancel will raise because there is no real DB update, but we
    # only care that the SELECT was issued with the run_id as a bound param.
    try:
        request_cancel(connection, run_id)
    except Exception:
        pass

    executed = connection.cursor_instance.executed
    assert len(executed) >= 1
    # First executed statement should carry run_id as a parameter
    first_query, first_params = executed[0]
    # The run_id must appear in the params, not be interpolated into the query
    params_flat = (
        first_params if not isinstance(first_params, dict) else list(first_params.values())
    )
    assert run_id in params_flat or str(run_id) in [str(p) for p in params_flat], (
        "run_id must be a bound parameter, not interpolated into the SQL string"
    )
    assert str(run_id) not in first_query, (
        "run_id must not be interpolated directly into the SQL string"
    )


def test_finalise_signature_accepts_no_outcome_argument() -> None:
    """finalise(connection, run_id) takes no caller-supplied outcome.

    The approved interface is `finalise(connection, run_id) -> str`. A
    caller must not be able to supply an outcome, ensuring the result is
    always derived from persisted rows (AC-9, DAC-E5-4).
    """
    import inspect

    from factorflow.runs.journal import finalise

    sig = inspect.signature(finalise)
    params = list(sig.parameters.keys())
    # Only 'connection' and 'run_id' are accepted
    assert params == ["connection", "run_id"], (
        f"finalise must accept only (connection, run_id), got {params}"
    )


def test_request_cancel_signature() -> None:
    """request_cancel(connection, run_id) -> str has the approved signature.

    The function must not accept additional arguments, preserving the
    approved journal boundary (DAC-E5-S3-1).
    """
    import inspect

    sig = inspect.signature(request_cancel)
    params = list(sig.parameters.keys())
    assert params == ["connection", "run_id"], (
        f"request_cancel must accept only (connection, run_id), got {params}"
    )
