"""The factor engine's build transaction (CAP-002-E2-S2).

Satisfies AC-10, AC-11, AC-19, AC-20, DAC-E2-9, DAC-E2-10 and DAC-E2-S2-1 through
DAC-E2-S2-4. Stages are injected by replacing ``engine._STAGES`` (DEC-0112).
"""

import logging
import time
from collections.abc import Iterator
from datetime import date
from typing import Any
from uuid import UUID, uuid4

import psycopg
import pytest

from factorflow.classification import engine
from tests.integration.engine_support import (
    add_bar,
    add_building_set,
    add_instrument,
    add_run,
    count_classification_rows,
    migrate_through_classification,
)

pytestmark = pytest.mark.postgres

CLASSIFICATION_DATE = date(2026, 10, 3)


@pytest.fixture
def conn(postgres_connection_string: str) -> Iterator[psycopg.Connection]:
    connection = migrate_through_classification(postgres_connection_string)
    try:
        yield connection
    finally:
        connection.close()


@pytest.fixture
def building_set(conn: psycopg.Connection) -> tuple[UUID, int]:
    """A building set over one active instrument that holds one bar."""
    instrument_id = add_instrument(conn, "AAA")
    add_bar(conn, instrument_id, date(2026, 10, 2))
    return add_building_set(conn, add_run(conn), CLASSIFICATION_DATE), instrument_id


class RecordingConnection(psycopg.Connection[tuple[Any, ...]]):
    """Records the ``set_config`` parameters ``build`` sends, so the timeout is observed
    without a statement that the timeout itself could cancel (IR-006)."""

    timeouts: list[object]

    def execute(self, query: Any, params: Any = None, **kwargs: Any) -> Any:  # type: ignore[override]
        if not hasattr(self, "timeouts"):
            self.timeouts = []
        if "set_config" in str(query):
            self.timeouts.append(params)
        return super().execute(query, params, **kwargs)


def committed(dsn: str, set_id: UUID) -> tuple[dict[str, object], dict[str, int]]:
    """The set row and child-row counts as a second connection sees them: only what the
    build committed (IR-001)."""
    with psycopg.connect(dsn, autocommit=True) as other:
        return set_row(other, set_id), count_classification_rows(other, set_id)


def statement_timeout(conn: psycopg.Connection) -> str:
    """The connection's statement_timeout, leaving it outside a transaction."""
    row = conn.execute("SHOW statement_timeout").fetchone()
    conn.rollback()
    assert row is not None
    return str(row[0])


def set_row(conn: psycopg.Connection, set_id: UUID) -> dict[str, object]:
    row = conn.execute(
        "SELECT state, ended_at, failure_reason, latest_trading_day, active_instruments "
        "FROM classification_set WHERE set_id = %s",
        (set_id,),
    ).fetchone()
    assert row is not None
    keys = ("state", "ended_at", "failure_reason", "latest_trading_day", "active_instruments")
    return dict(zip(keys, row, strict=True))


def write_rows(set_id: UUID, instrument_id: int) -> engine.Stage:
    """A stage writing one row for the set into each child table, as later stages will."""

    def stage(conn: psycopg.Connection, context: engine.BuildContext) -> None:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked) "
                "VALUES (%s, 'value', 1, false)",
                (set_id,),
            )
            cur.execute(
                "INSERT INTO factor_input (set_id, instrument_id, factor, input_name, status, "
                "value, as_of, known_on, detail) VALUES (%s, %s, 'value', 'book_to_price', "
                "'present', 1, %s, %s, '{}')",
                (set_id, instrument_id, date(2026, 9, 30), date(2026, 10, 1)),
            )
            cur.execute(
                "INSERT INTO factor_classification (set_id, instrument_id, factor, status, "
                "score, percentile) VALUES (%s, %s, 'value', 'classified', 1, 50)",
                (set_id, instrument_id),
            )

    return stage


def write_rows_then_raise(set_id: UUID, instrument_id: int, error: Exception) -> engine.Stage:
    write = write_rows(set_id, instrument_id)

    def stage(conn: psycopg.Connection, context: engine.BuildContext) -> None:
        write(conn, context)
        raise error

    return stage


# Implements TC-COMP-166
def test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
    postgres_connection_string: str,
) -> None:
    set_id, instrument_id = building_set
    dsn = postgres_connection_string
    injected = RuntimeError("injected failure")
    stage = write_rows_then_raise(set_id, instrument_id, injected)
    monkeypatch.setattr(engine, "_STAGES", [stage])

    with caplog.at_level(logging.ERROR):
        result = engine.build(conn, set_id, 30)

    assert result.state == "failed"
    assert count_classification_rows(conn, set_id) == {
        "classification_set_factor": 0,
        "factor_input": 0,
        "factor_classification": 0,
    }
    assert committed(dsn, set_id)[1] == {
        "classification_set_factor": 0,
        "factor_input": 0,
        "factor_classification": 0,
    }
    row, _ = committed(dsn, set_id)  # IR-001: the failed set is durable, not session-local
    assert row["state"] == "failed"
    assert row["ended_at"] is not None
    reason = str(row["failure_reason"])
    assert reason.startswith("RuntimeError")
    assert "injected failure" in reason
    assert "Traceback" not in reason  # SEC-ERR-001
    assert result.failure_reason == reason
    assert result.set_id == set_id
    records = [
        r
        for r in caplog.records
        if r.levelno == logging.ERROR and getattr(r, "set_id", None) == str(set_id)
    ]
    assert records
    # IR-008: the stack trace goes to the structured log only (SEC-ERR-001, OPS-ERR-001)
    # RedactingFilter, once installed by another test, moves exc_info into exc_text
    record = records[0]
    if record.exc_info is not None:
        assert record.exc_info[1] is injected
    else:
        assert record.exc_text is not None
        assert "Traceback" in record.exc_text
        assert "RuntimeError: injected failure" in record.exc_text


# Implements TC-COMP-167
@pytest.mark.parametrize("stage_writes_rows", [False, True], ids=["no-stage", "stage-wrote-rows"])
def test_completing_an_already_failed_set_updates_no_row_and_rolls_back(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    postgres_connection_string: str,
    stage_writes_rows: bool,
) -> None:
    """DAC-E2-S2-2: the other writer's failure stands; the build writes nothing.

    When a stage wrote rows before completion found the set no longer building, those rows
    roll back with it: they are committed only with the completion (DAC-E2-10, review v4
    IR-002). The counts are also read through a second connection, which sees only commits.
    """
    set_id, instrument_id = building_set
    stages = [write_rows(set_id, instrument_id)] if stage_writes_rows else []
    monkeypatch.setattr(engine, "_STAGES", stages)
    with psycopg.connect(postgres_connection_string) as other:
        other.execute(
            "UPDATE classification_set SET state = 'failed', ended_at = now(), "
            "failure_reason = 'other writer' WHERE set_id = %s",
            (set_id,),
        )
    other_ended_at = committed(postgres_connection_string, set_id)[0]["ended_at"]
    assert other_ended_at is not None
    result = engine.build(conn, set_id, 30)

    assert result.state == "failed"
    assert result.active_instruments == 0
    assert result.qualified_counts == {}
    assert count_classification_rows(conn, set_id) == {
        "classification_set_factor": 0,
        "factor_input": 0,
        "factor_classification": 0,
    }
    assert committed(postgres_connection_string, set_id)[1] == {
        "classification_set_factor": 0,
        "factor_input": 0,
        "factor_classification": 0,
    }
    row = set_row(conn, set_id)
    assert row["state"] == "failed"
    assert row["failure_reason"] == "other writer"
    assert row["ended_at"] == other_ended_at  # DAC-E2-S2-2: the other writer's end stands


def test_set_failed_by_another_writer_mid_build_is_left_untouched(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    postgres_connection_string: str,
) -> None:
    """TC-COMP-167 (b): under REPEATABLE READ the guarded update raises; the end state agrees."""
    set_id, _ = building_set
    dsn = postgres_connection_string

    def other_writer_fails_the_set(
        _conn: psycopg.Connection, _context: engine.BuildContext
    ) -> None:
        with psycopg.connect(dsn) as other:
            other.execute(
                "UPDATE classification_set SET state = 'failed', ended_at = now(), "
                "failure_reason = 'other writer' WHERE set_id = %s",
                (set_id,),
            )

    monkeypatch.setattr(engine, "_STAGES", [other_writer_fails_the_set])
    result = engine.build(conn, set_id, 30)

    assert result.state == "failed"
    row = set_row(conn, set_id)
    assert row["state"] == "failed"
    assert row["failure_reason"] == "other writer"
    assert sum(count_classification_rows(conn, set_id).values()) == 0


# Implements TC-COMP-090
def test_build_timeout_fails_the_set_with_a_timeout_reason(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    postgres_connection_string: str,
) -> None:
    """DAC-E2-S2-3: a statement over the timeout fails the set, durably, without waiting it out."""
    set_id, _ = building_set

    def sleeper(stage_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        stage_conn.execute("SELECT pg_sleep(1)")

    monkeypatch.setattr(engine, "_STAGES", [sleeper])
    started = time.monotonic()
    result = engine.build(conn, set_id, 0.001)
    elapsed = time.monotonic() - started

    assert result.state == "failed"
    assert elapsed < 0.9  # T008: well under the one second sleep
    row, counts = committed(postgres_connection_string, set_id)  # IR-001
    assert row["state"] == "failed"
    reason = str(row["failure_reason"])
    assert reason.startswith("QueryCanceled")
    assert "timeout" in reason
    assert sum(counts.values()) == 0


def test_success_with_no_stages_completes_the_set(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    postgres_connection_string: str,
) -> None:
    """AC-20: a build that raises nothing leaves a complete, sized set."""
    set_id, _ = building_set
    monkeypatch.setattr(engine, "_STAGES", [])

    result = engine.build(conn, set_id, 30)

    assert result.set_id == set_id
    assert result.state == "complete"
    assert result.failure_reason is None
    assert result.active_instruments == 1
    assert result.qualified_counts == {}
    row, _ = committed(postgres_connection_string, set_id)  # IR-001: durable for other readers
    assert row["state"] == "complete"
    assert row["ended_at"] is not None
    assert row["latest_trading_day"] == date(2026, 10, 2)
    assert row["active_instruments"] == 1


def test_completed_set_is_sized_by_the_active_roster_only(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    postgres_connection_string: str,
) -> None:
    """DAC-E2-10, AC-15 (IR-001): two active instruments and one retired, all holding bars,
    size the set at two, on the committed row and in the result."""
    set_id, _ = building_set
    second = add_instrument(conn, "BBB")
    add_bar(conn, second, date(2026, 10, 1))
    retired = add_instrument(conn, "OLD", lifecycle="retired")
    add_bar(conn, retired, date(2026, 10, 2))
    monkeypatch.setattr(engine, "_STAGES", [])

    result = engine.build(conn, set_id, 30)

    assert result.state == "complete"
    assert result.active_instruments == 2
    row, _ = committed(postgres_connection_string, set_id)
    assert row["state"] == "complete"
    assert row["active_instruments"] == 2


def test_qualified_counts_are_this_sets_classification_set_factor_rows(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E2-10 (IR-003): the result carries the set's own counts and no other set's."""
    set_id, _ = building_set
    other_run = add_run(conn)
    other_set = conn.execute(
        "INSERT INTO classification_set (run_id, state, classification_date, latest_trading_day, "
        "active_instruments, ended_at) VALUES (%s, 'complete', %s, %s, 1, now()) RETURNING set_id",
        (other_run, date(2026, 10, 2), date(2026, 10, 1)),
    ).fetchone()
    assert other_set is not None
    conn.execute(
        "INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked) "
        "VALUES (%s, 'growth', 99, true)",
        (other_set[0],),
    )
    conn.commit()

    def write_counts(stage_conn: psycopg.Connection, context: engine.BuildContext) -> None:
        stage_conn.execute(
            "INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked) "
            "VALUES (%s, 'value', 3, true), (%s, 'momentum', 5, false)",
            (context.set_id, context.set_id),
        )

    monkeypatch.setattr(engine, "_STAGES", [write_counts])
    result = engine.build(conn, set_id, 30)

    assert result.state == "complete"
    assert result.qualified_counts == {"value": 3, "momentum": 5}


def test_stages_run_in_list_order(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E2-10, DEC-0121 (IR-004): inputs, then peer sets, then classification."""
    set_id, _ = building_set
    ran: list[str] = []

    def stage(name: str) -> engine.Stage:
        def run(_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
            ran.append(name)

        return run

    monkeypatch.setattr(engine, "_STAGES", [stage("inputs"), stage("peers"), stage("classify")])
    result = engine.build(conn, set_id, 30)

    assert result.state == "complete"
    assert ran == ["inputs", "peers", "classify"]


def test_unknown_set_is_reported_as_missing_not_as_a_type_error(
    conn: psycopg.Connection, building_set: tuple[UUID, int], monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E2-S2-4 (IR-005): a set id that does not exist fails with a stated cause."""
    missing = uuid4()
    monkeypatch.setattr(engine, "_STAGES", [])

    result = engine.build(conn, missing, 30)

    assert result.state == "failed"
    assert result.failure_reason == f"LookupError: classification set {missing} does not exist"
    assert set_row(conn, building_set[0])["state"] == "building"


def test_empty_active_roster_fails_with_the_no_price_data_reason(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E2-S2-4, DEC-0114, T013 (IR-005): no active instrument is an empty array, not NULL."""
    retired = add_instrument(conn, "OLD", lifecycle="retired")
    add_bar(conn, retired, date(2026, 10, 2))
    set_id = add_building_set(conn, add_run(conn), CLASSIFICATION_DATE)
    monkeypatch.setattr(engine, "_STAGES", [])

    result = engine.build(conn, set_id, 30)

    assert result.state == "failed"
    assert result.failure_reason == "ValueError: no price data held for any active instrument"


def test_inputs_are_read_from_one_snapshot(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    postgres_connection_string: str,
) -> None:
    """DAC-E2-9, AC-19, DEC-0111: a bar committed mid-build is invisible to later stages."""
    set_id, instrument_id = building_set
    dsn = postgres_connection_string
    seen: list[date] = []

    def read_latest(stage_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        row = stage_conn.execute("SELECT max(session_date) FROM daily_bar").fetchone()
        assert row is not None
        seen.append(row[0])

    def commit_newer_bar(_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        with psycopg.connect(dsn) as other:
            add_bar(other, instrument_id, date(2026, 10, 3), close=11)

    monkeypatch.setattr(engine, "_STAGES", [read_latest, commit_newer_bar, read_latest])
    result = engine.build(conn, set_id, 30)

    assert result.state == "complete"
    assert seen == [date(2026, 10, 2), date(2026, 10, 2)]
    assert set_row(conn, set_id)["latest_trading_day"] == date(2026, 10, 2)


def test_build_transaction_runs_at_repeatable_read(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DEC-0111, DAC-E2-9, T017 step 2 (review v3 IR-002): the build runs at REPEATABLE READ,
    the weakest level that fixes one snapshot; SERIALIZABLE also gives a snapshot, so the
    level itself is observed from inside a stage."""
    set_id, _ = building_set
    observed: list[str] = []

    def read_isolation(stage_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        row = stage_conn.execute("SHOW transaction_isolation").fetchone()
        assert row is not None
        observed.append(row[0])

    monkeypatch.setattr(engine, "_STAGES", [read_isolation])

    assert engine.build(conn, set_id, 30).state == "complete"
    assert observed == ["repeatable read"]


def test_no_price_data_held_fails_the_set_with_a_reason(
    conn: psycopg.Connection, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0114: the set is failed with a reason, not refused by a constraint."""
    add_instrument(conn, "AAA")
    set_id = add_building_set(conn, add_run(conn), CLASSIFICATION_DATE)
    monkeypatch.setattr(engine, "_STAGES", [])

    result = engine.build(conn, set_id, 30)

    assert result.state == "failed"
    assert (
        set_row(conn, set_id)["failure_reason"]
        == "ValueError: no price data held for any active instrument"
    )


@pytest.mark.parametrize("timeout", [0, -1, 0.0])
def test_non_positive_timeout_is_refused_before_touching_the_database(
    conn: psycopg.Connection, building_set: tuple[UUID, int], timeout: float
) -> None:
    """AC-11, DEC-0067: zero would disable statement_timeout, so the call is refused."""
    set_id, _ = building_set
    with pytest.raises(ValueError, match="timeout"):
        engine.build(conn, set_id, timeout)
    assert set_row(conn, set_id)["state"] == "building"


@pytest.mark.parametrize(
    ("seconds", "sent"),
    [(0.0004, "1"), (0.0015, "2"), (0.0012, "2"), (30, "30000"), (300.0004, "300001")],
)
def test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero(
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    postgres_connection_string: str,
    seconds: float,
    sent: str,
) -> None:
    """AC-11 (IR-006): zero would disable statement_timeout, so 0.0004 s must send one ms.

    A fractional millisecond rounds up, not to the nearest (T017 step 2, review v3 IR-001):
    0.0012 s sends 2 and 300.0004 s sends 300001, where rounding to nearest sends 1 and 300000.

    The parameter is recorded as sent: a 1 ms timeout can cancel any statement that observes
    it, so reading the setting back would depend on the host's speed.
    """
    set_id, _ = building_set
    monkeypatch.setattr(engine, "_STAGES", [])
    with RecordingConnection.connect(postgres_connection_string) as recording:
        engine.build(recording, set_id, seconds)
    assert recording.timeouts == [{"ms": sent}]


def test_timeout_is_converted_to_whole_milliseconds(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """AC-11, DEC-0067: seconds become whole milliseconds, rounded up."""
    set_id, _ = building_set
    observed: list[str] = []

    def read_timeout(stage_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        row = stage_conn.execute("SHOW statement_timeout").fetchone()
        assert row is not None
        observed.append(row[0])

    monkeypatch.setattr(engine, "_STAGES", [read_timeout])
    engine.build(conn, set_id, 30)

    assert observed == ["30s"]


def test_timeout_is_local_to_the_build_transaction(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DEC-0067, factor-engine 2.6 (IR-002): a pooled connection keeps its own timeout."""
    set_id, _ = building_set
    before = statement_timeout(conn)
    monkeypatch.setattr(engine, "_STAGES", [])
    assert engine.build(conn, set_id, 30).state == "complete"
    assert statement_timeout(conn) == before

    failed_set = add_building_set(conn, add_run(conn), CLASSIFICATION_DATE)
    monkeypatch.setattr(
        engine, "_STAGES", [lambda _c, _x: (_ for _ in ()).throw(RuntimeError("boom"))]
    )
    assert engine.build(conn, failed_set, 30).state == "failed"
    assert statement_timeout(conn) == before


def test_autocommit_or_open_transaction_connection_is_refused(
    conn: psycopg.Connection, building_set: tuple[UUID, int]
) -> None:
    """DAC-E2-S2-3, DEC-0111: the isolation level can only be set on a fresh transaction."""
    set_id, _ = building_set
    conn.execute("SELECT 1")  # leaves the connection inside a transaction
    with pytest.raises(ValueError, match="transaction"):
        engine.build(conn, set_id, 30)
    conn.rollback()
    conn.autocommit = True
    with pytest.raises(ValueError, match="autocommit"):
        engine.build(conn, set_id, 30)


def test_connection_with_an_aborted_transaction_is_refused(
    conn: psycopg.Connection, building_set: tuple[UUID, int]
) -> None:
    """DEC-0111, T009 (e), T017 step 1 (IR-003): a transaction already in error is refused
    before any statement, not recorded as a failed build."""
    set_id, _ = building_set
    with pytest.raises(psycopg.errors.DivisionByZero):
        conn.execute("SELECT 1/0")
    assert conn.info.transaction_status == psycopg.pq.TransactionStatus.INERROR
    with pytest.raises(ValueError, match="transaction"):
        engine.build(conn, set_id, 30)
    conn.rollback()
    assert set_row(conn, set_id)["state"] == "building"


def test_failure_reason_is_one_line(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """AC-20, SEC-ERR-001: the owner-facing reason is the class and the first message line."""
    set_id, _ = building_set

    def boom(_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        raise RuntimeError("first\nsecond")

    monkeypatch.setattr(engine, "_STAGES", [boom])
    engine.build(conn, set_id, 30)

    assert set_row(conn, set_id)["failure_reason"] == "RuntimeError: first"


def test_failure_with_an_empty_message_is_recorded_with_its_class(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    postgres_connection_string: str,
) -> None:
    """AC-20, DAC-E2-10 (IR-002): an exception with no message still fails the set durably,
    with its class as the reason, and build does not raise."""
    set_id, _ = building_set

    def bare(_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        raise RuntimeError

    monkeypatch.setattr(engine, "_STAGES", [bare])
    result = engine.build(conn, set_id, 30)

    assert result.state == "failed"
    assert result.failure_reason == "RuntimeError: "
    row, _ = committed(postgres_connection_string, set_id)
    assert row["state"] == "failed"
    assert row["ended_at"] is not None
    assert row["failure_reason"] == "RuntimeError: "
