"""Implements TC-COMP-299 (partial: log redaction), TC-COMP-325
(DAC-E1-8, DAC-E1-S3-3).

The redaction filter must remove any configured secret value from every log
record it sees, including one emitted through a third-party-style logger
name -- the filter is installed on every handler, so it must not special-case
FactorFlow's own loggers.
"""

import logging

import pytest

from factorflow.config.redaction import RedactingFilter
from factorflow.config.settings import configure_logging

SECRET = "sk-massive-leaked-credential-xyz789"


def _emit(logger_name: str, message: str, secret_filter: RedactingFilter) -> logging.LogRecord:
    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.DEBUG)
    logger.addFilter(secret_filter)
    records: list[logging.LogRecord] = []
    handler = logging.Handler()
    handler.emit = records.append  # type: ignore[method-assign]
    logger.addHandler(handler)
    try:
        logger.warning(message)
    finally:
        logger.removeHandler(handler)
        logger.removeFilter(secret_filter)
    assert records, "no record was captured"
    return records[0]


def test_secret_is_redacted_from_own_logger() -> None:
    secret_filter = RedactingFilter([SECRET])
    record = _emit("factorflow.config", f"connecting with key {SECRET}", secret_filter)
    assert record.getMessage() == "connecting with key [redacted]"
    assert SECRET not in record.getMessage()


def test_secret_is_redacted_from_third_party_style_logger() -> None:
    """The filter must not special-case FactorFlow's own logger names."""
    secret_filter = RedactingFilter([SECRET])
    record = _emit("urllib3.connectionpool", f"Authorization: Bearer {SECRET}", secret_filter)
    assert record.getMessage() == "Authorization: Bearer [redacted]"
    assert SECRET not in record.getMessage()


def test_record_with_no_secret_is_unchanged() -> None:
    secret_filter = RedactingFilter([SECRET])
    record = _emit("factorflow.config", "no secret here", secret_filter)
    assert record.getMessage() == "no secret here"


def test_empty_secret_values_are_ignored() -> None:
    """A blank or unset secret must not become a no-op-matching empty string."""
    secret_filter = RedactingFilter(["", SECRET])
    record = _emit("factorflow.config", "a message with no leaks", secret_filter)
    assert record.getMessage() == "a message with no leaks"


def test_filter_returns_true_so_the_record_still_emits() -> None:
    secret_filter = RedactingFilter([SECRET])
    record = logging.LogRecord(
        name="factorflow",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg=f"key is {SECRET}",
        args=(),
        exc_info=None,
    )
    assert secret_filter.filter(record) is True


def test_configure_logging_redacts_a_third_party_logger(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """configure_logging() must reach every handler, including one attached
    to a logger this package does not own -- the design's own requirement
    ("installed on every handler at process start, in both processes")."""
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://u:p@localhost/db")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", SECRET)

    root = logging.getLogger()
    records: list[logging.LogRecord] = []
    handler = logging.Handler()
    handler.emit = records.append  # type: ignore[method-assign]
    root.addHandler(handler)
    try:
        configure_logging()
        logger = logging.getLogger("urllib3.connectionpool")
        logger.setLevel(logging.DEBUG)
        logger.warning("Authorization: Bearer %s", SECRET)
    finally:
        root.removeHandler(handler)
        for existing_filter in list(root.filters):
            root.removeFilter(existing_filter)

    assert records, "no record was captured"
    assert SECRET not in records[0].getMessage()
