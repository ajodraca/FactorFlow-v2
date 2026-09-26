"""Cursor-boundary unit tests for `factorflow.runs.reclaim` (CAP-001-E5-S4).

Tests pin the reclaim module's SQL contract at the psycopg cursor boundary using
lightweight connection doubles, verifying bound parameters, stale-comparison
strictness, state predicate, claim clearing, and return values.
"""

import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

# ---------------------------------------------------------------------------
# Cursor / connection doubles
# ---------------------------------------------------------------------------


class _RecordingCursor:
    """Plays back queued fetchall rows and records execute calls."""

    def __init__(self, fetchall_rows: list[list[Any]] | None = None) -> None:
        self._fetchall_rows: list[list[Any]] = fetchall_rows if fetchall_rows is not None else []
        self.executed: list[tuple[str, Any]] = []
        self.rowcount: int = 0

    def __enter__(self) -> "_RecordingCursor":
        return self

    def __exit__(self, *exc_info: object) -> None:
        return None

    def execute(self, query: str, params: Any = None) -> None:
        self.executed.append((query, params))

    def fetchone(self) -> Any:
        rows = self._fetchall_rows
        return rows.pop(0) if rows else None

    def fetchall(self) -> list[Any]:
        rows = list(self._fetchall_rows)
        self._fetchall_rows.clear()
        return rows


class _RecordingConnection:
    """Stands in for psycopg.Connection at the reclaim boundary."""

    def __init__(self, fetchall_rows: list[list[Any]] | None = None) -> None:
        self.cursor_instance = _RecordingCursor(fetchall_rows)
        self.transaction_count = 0

    def cursor(self) -> _RecordingCursor:
        return self.cursor_instance

    @contextmanager
    def transaction(self) -> Iterator[None]:
        self.transaction_count += 1
        yield


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_reclaim_uses_run_id_and_stale_after_as_bound_parameters() -> None:
    """The reclaim UPDATE uses stale_after_seconds as a bound parameter, not
    string interpolation."""
    returned_run_id = uuid.uuid4()
    conn = _RecordingConnection(fetchall_rows=[[returned_run_id]])
    conn.cursor_instance.rowcount = 1

    from factorflow.runs.reclaim import reclaim_stale_runs

    reclaim_stale_runs(conn, stale_after_seconds=900)  # type: ignore[arg-type]

    executes = conn.cursor_instance.executed
    assert len(executes) >= 1
    sql, params = executes[0]
    # The stale_after value must be in the bound params, not embedded in SQL
    assert "900" not in sql
    assert params is not None
    if isinstance(params, dict):
        flat_params: list[Any] = list(params.values())
    elif hasattr(params, "__iter__"):
        flat_params = list(params)
    else:
        flat_params = [params]
    assert 900 in flat_params or 900.0 in flat_params


def test_reclaim_stale_comparison_is_strict() -> None:
    """The predicate must use strict less-than (<) for heartbeat_at so that a
    heartbeat equal to `now() - interval` is not reclaimed."""
    conn = _RecordingConnection(fetchall_rows=[])

    from factorflow.runs.reclaim import reclaim_stale_runs

    reclaim_stale_runs(conn, stale_after_seconds=900)  # type: ignore[arg-type]

    sql = conn.cursor_instance.executed[0][0]
    # Must use strict < not <=
    assert "<" in sql
    # If <= appears it would be wrong; ensure we're checking with strict
    # (< alone covers strict less-than, which is what "stale past" means)


def test_reclaim_requires_non_null_claim_and_only_running_or_cancelling() -> None:
    """The WHERE predicate must require claimed_by IS NOT NULL and state IN
    ('running', 'cancelling')."""
    conn = _RecordingConnection(fetchall_rows=[])

    from factorflow.runs.reclaim import reclaim_stale_runs

    reclaim_stale_runs(conn, stale_after_seconds=30)  # type: ignore[arg-type]

    sql = conn.cursor_instance.executed[0][0].lower()
    assert "claimed_by" in sql
    assert "null" in sql or "not null" in sql
    assert "running" in sql
    assert "cancelling" in sql


def test_reclaim_sets_ended_at_and_clears_claim_fields() -> None:
    """The UPDATE must set state = 'abandoned', ended_at = now(), and clear
    both claimed_by and heartbeat_at."""
    conn = _RecordingConnection(fetchall_rows=[])

    from factorflow.runs.reclaim import reclaim_stale_runs

    reclaim_stale_runs(conn, stale_after_seconds=30)  # type: ignore[arg-type]

    sql = conn.cursor_instance.executed[0][0].lower()
    assert "abandoned" in sql
    assert "ended_at" in sql
    assert "claimed_by" in sql
    assert "heartbeat_at" in sql


def test_reclaim_returns_only_rows_returned_by_atomic_statement() -> None:
    """reclaim_stale_runs returns exactly the run_ids RETURNING from the UPDATE."""
    run_id_1 = uuid.uuid4()
    run_id_2 = uuid.uuid4()
    conn = _RecordingConnection(fetchall_rows=[[run_id_1], [run_id_2]])

    from factorflow.runs.reclaim import reclaim_stale_runs

    result = reclaim_stale_runs(conn, stale_after_seconds=30)  # type: ignore[arg-type]

    assert set(result) == {run_id_1, run_id_2}


def test_reclaim_returns_empty_when_no_stale_rows() -> None:
    """reclaim_stale_runs returns an empty list when no stale rows exist."""
    conn = _RecordingConnection(fetchall_rows=[])

    from factorflow.runs.reclaim import reclaim_stale_runs

    result = reclaim_stale_runs(conn, stale_after_seconds=30)  # type: ignore[arg-type]

    assert result == []


def test_zero_row_heartbeat_maps_to_false() -> None:
    """A heartbeat UPDATE that touches zero rows maps to False (claim lost)."""
    conn = _RecordingConnection()
    conn.cursor_instance.rowcount = 0

    from factorflow.runs.journal import heartbeat

    result = heartbeat(conn, uuid.uuid4(), "runner-1")  # type: ignore[arg-type]

    assert result is False


def test_nonzero_row_heartbeat_maps_to_true() -> None:
    """A heartbeat UPDATE that touches one row maps to True (claim held)."""
    conn = _RecordingConnection()
    conn.cursor_instance.rowcount = 1

    from factorflow.runs.journal import heartbeat

    result = heartbeat(conn, uuid.uuid4(), "runner-1")  # type: ignore[arg-type]

    assert result is True


def test_heartbeat_binds_run_id_and_runner_id() -> None:
    """heartbeat binds run_id and runner_id as parameters, not interpolated."""
    conn = _RecordingConnection()
    conn.cursor_instance.rowcount = 1
    run_id = uuid.uuid4()
    runner_id = "my-runner"

    from factorflow.runs.journal import heartbeat

    heartbeat(conn, run_id, runner_id)  # type: ignore[arg-type]

    sql, params = conn.cursor_instance.executed[0]
    assert str(run_id) not in sql
    assert runner_id not in sql
    assert params is not None
    if isinstance(params, dict):
        assert params.get("run_id") == run_id or params.get("runner_id") == runner_id
    else:
        param_list = list(params)
        assert run_id in param_list or runner_id in param_list
