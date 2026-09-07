"""Implements TC-COMP-320, TC-COMP-321 / DAC-E1-S2-6, DAC-E1-S2-7.

Every migrator message goes through the structured logger at `error` level
carrying the migration version as a field, never through `print`. A
connection failure's message is built from known-safe fields (host, database)
rather than by formatting the raw driver exception, because a `psycopg`
connection error can include the full connection string — password included.
"""

import logging

import psycopg
import pytest

from factorflow.db.migrate_main import _connection_failure_message


def test_no_print_call_when_reporting_a_connection_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    def _fail_if_called(*args: object, **kwargs: object) -> None:
        raise AssertionError("print() must never be called by the migrator")

    monkeypatch.setattr("builtins.print", _fail_if_called)

    message = _connection_failure_message(
        host="db.example.internal",
        database="factorflow",
        error=psycopg.OperationalError(
            "connection to server failed: FATAL: password authentication failed "
            'for user "factorflow" (postgresql://factorflow:s3cr3t@db.example.internal/factorflow)'
        ),
    )

    assert "s3cr3t" not in message
    assert "postgresql://" not in message


def test_connection_failure_message_names_host_and_database() -> None:
    message = _connection_failure_message(
        host="db.example.internal",
        database="factorflow",
        error=psycopg.OperationalError("some raw driver text with a secret in it"),
    )

    assert "db.example.internal" in message
    assert "factorflow" in message
    assert "some raw driver text with a secret in it" not in message


def test_connection_failure_message_excludes_raw_driver_exception_text() -> None:
    """The message must be built from known-safe fields only, never the raw exception."""
    secret_bearing_text = "password=hunter2 unexpected token"
    message = _connection_failure_message(
        host="db.example.internal",
        database="factorflow",
        error=psycopg.OperationalError(secret_bearing_text),
    )

    assert secret_bearing_text not in message
    assert "hunter2" not in message


def test_migrator_logger_emits_error_records_with_version_field(
    caplog: pytest.LogCaptureFixture,
) -> None:
    from factorflow.db.migrate_main import _log_failure

    with caplog.at_level(logging.ERROR, logger="factorflow.db.migrator"):
        _log_failure("migration 2 failed: boom; no change was committed", version=2)

    assert len(caplog.records) == 1
    record = caplog.records[0]
    assert record.levelno == logging.ERROR
    assert record.version == 2  # type: ignore[attr-defined]
