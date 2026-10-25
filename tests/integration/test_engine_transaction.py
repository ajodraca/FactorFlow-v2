"""The factor engine's build transaction (CAP-002-E2-S2).

Satisfies AC-10, AC-11, AC-19, AC-20, DAC-E2-9, DAC-E2-10 and DAC-E2-S2-1 through
DAC-E2-S2-4. Stages are injected by replacing ``engine._STAGES`` (DEC-0112).
"""

import logging
from collections.abc import Iterator
from datetime import date
from uuid import UUID

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


def set_row(conn: psycopg.Connection, set_id: UUID) -> dict[str, object]:
    row = conn.execute(
        "SELECT state, ended_at, failure_reason, latest_trading_day, active_instruments "
        "FROM classification_set WHERE set_id = %s",
        (set_id,),
    ).fetchone()
    assert row is not None
    keys = ("state", "ended_at", "failure_reason", "latest_trading_day", "active_instruments")
    return dict(zip(keys, row, strict=True))


def write_rows_then_raise(set_id: UUID, instrument_id: int, error: Exception) -> engine.Stage:
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
        raise error

    return stage


# Implements TC-COMP-166
def test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    set_id, instrument_id = building_set
    stage = write_rows_then_raise(set_id, instrument_id, RuntimeError("injected failure"))
    monkeypatch.setattr(engine, "_STAGES", [stage])

    with caplog.at_level(logging.ERROR):
        result = engine.build(conn, set_id, 30)

    assert result.state == "failed"
    assert count_classification_rows(conn, set_id) == {
        "classification_set_factor": 0,
        "factor_input": 0,
        "factor_classification": 0,
    }
    row = set_row(conn, set_id)
    assert row["state"] == "failed"
    assert row["ended_at"] is not None
    reason = str(row["failure_reason"])
    assert reason.startswith("RuntimeError")
    assert "injected failure" in reason
    assert "Traceback" not in reason  # SEC-ERR-001
    assert result.failure_reason == reason
    assert result.set_id == set_id
    assert any(
        r.levelno == logging.ERROR and getattr(r, "set_id", None) == str(set_id)
        for r in caplog.records
    )


# Implements TC-COMP-167
def test_completing_an_already_failed_set_updates_no_row_and_rolls_back(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
    postgres_connection_string: str,
) -> None:
    """DAC-E2-S2-2: the other writer's failure stands; the build writes nothing."""
    set_id, _ = building_set
    monkeypatch.setattr(engine, "_STAGES", [])
    with psycopg.connect(postgres_connection_string) as other:
        other.execute(
            "UPDATE classification_set SET state = 'failed', ended_at = now(), "
            "failure_reason = 'other writer' WHERE set_id = %s",
            (set_id,),
        )
    result = engine.build(conn, set_id, 30)

    assert result.state == "failed"
    assert result.active_instruments == 0
    assert result.qualified_counts == {}
    assert count_classification_rows(conn, set_id) == {
        "classification_set_factor": 0,
        "factor_input": 0,
        "factor_classification": 0,
    }
    row = set_row(conn, set_id)
    assert row["state"] == "failed"
    assert row["failure_reason"] == "other writer"


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
) -> None:
    set_id, _ = building_set

    def sleeper(stage_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        stage_conn.execute("SELECT pg_sleep(1)")

    monkeypatch.setattr(engine, "_STAGES", [sleeper])
    result = engine.build(conn, set_id, 0.001)

    assert result.state == "failed"
    row = set_row(conn, set_id)
    assert row["state"] == "failed"
    reason = str(row["failure_reason"])
    assert reason.startswith("QueryCanceled")
    assert "timeout" in reason
    assert sum(count_classification_rows(conn, set_id).values()) == 0


def test_success_with_no_stages_completes_the_set(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
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
    row = set_row(conn, set_id)
    assert row["state"] == "complete"
    assert row["ended_at"] is not None
    assert row["latest_trading_day"] == date(2026, 10, 2)
    assert row["active_instruments"] == 1


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
    set_id, _ = building_set
    with pytest.raises(ValueError, match="timeout"):
        engine.build(conn, set_id, timeout)
    assert set_row(conn, set_id)["state"] == "building"


def test_sub_millisecond_timeout_rounds_up_never_to_zero(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Zero would disable statement_timeout; 0.0004 s must still set one millisecond."""
    set_id, _ = building_set
    observed: list[str] = []

    def read_timeout(stage_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        row = stage_conn.execute("SHOW statement_timeout").fetchone()
        assert row is not None
        observed.append(row[0])

    monkeypatch.setattr(engine, "_STAGES", [read_timeout])
    engine.build(conn, set_id, 0.0004)

    assert observed == ["1ms"]


def test_timeout_is_converted_to_whole_milliseconds(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    set_id, _ = building_set
    observed: list[str] = []

    def read_timeout(stage_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        row = stage_conn.execute("SHOW statement_timeout").fetchone()
        assert row is not None
        observed.append(row[0])

    monkeypatch.setattr(engine, "_STAGES", [read_timeout])
    engine.build(conn, set_id, 30)

    assert observed == ["30s"]


def test_autocommit_or_open_transaction_connection_is_refused(
    conn: psycopg.Connection, building_set: tuple[UUID, int]
) -> None:
    set_id, _ = building_set
    conn.execute("SELECT 1")  # leaves the connection inside a transaction
    with pytest.raises(ValueError, match="transaction"):
        engine.build(conn, set_id, 30)
    conn.rollback()
    conn.autocommit = True
    with pytest.raises(ValueError, match="autocommit"):
        engine.build(conn, set_id, 30)


def test_failure_reason_is_one_line(
    conn: psycopg.Connection,
    building_set: tuple[UUID, int],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    set_id, _ = building_set

    def boom(_conn: psycopg.Connection, _context: engine.BuildContext) -> None:
        raise RuntimeError("first\nsecond")

    monkeypatch.setattr(engine, "_STAGES", [boom])
    engine.build(conn, set_id, 30)

    assert set_row(conn, set_id)["failure_reason"] == "RuntimeError: first"
