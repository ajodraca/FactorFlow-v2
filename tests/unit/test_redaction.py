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

SECRET = "TEST-FIXTURE-CREDENTIAL-xyz789"


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


def test_configure_logging_redacts_a_handler_added_after_it_runs(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A handler attached after configure_logging() -- the ordinary shape of
    logging.basicConfig() called at process start -- must still be
    redacted. Attaching the filter only to the handlers that exist at call
    time is a one-time snapshot and misses this case."""
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://u:p@localhost/db")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", SECRET)

    configure_logging()

    root = logging.getLogger()
    records: list[logging.LogRecord] = []
    handler = logging.Handler()
    handler.emit = records.append  # type: ignore[method-assign]
    root.addHandler(handler)  # attached AFTER configure_logging()
    try:
        logging.getLogger("urllib3.connectionpool").warning("Authorization: Bearer %s", SECRET)
    finally:
        root.removeHandler(handler)

    assert records, "no record was captured"
    assert SECRET not in records[0].getMessage()


def test_secret_is_redacted_from_a_formatted_exception_traceback() -> None:
    """A provider client error can carry the credential in a formatted
    request or header (realistic once massive-client exists); the filter
    must scrub the exc_info traceback, not just record.msg."""
    secret_filter = RedactingFilter([SECRET])
    try:
        raise ValueError(f"request failed with key {SECRET}")
    except ValueError:
        import sys

        record = logging.LogRecord(
            name="massive_client",
            level=logging.ERROR,
            pathname=__file__,
            lineno=1,
            msg="request failed",
            args=(),
            exc_info=sys.exc_info(),
        )
    secret_filter.filter(record)
    formatted = logging.Formatter().format(record)
    assert SECRET not in formatted


def test_secret_is_redacted_from_an_extra_string_attribute() -> None:
    """A caller-supplied `extra={...}` attribute, which a structured
    formatter would serialise unfiltered, must also be scrubbed."""
    secret_filter = RedactingFilter([SECRET])
    record = logging.LogRecord(
        name="factorflow",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="request sent",
        args=(),
        exc_info=None,
    )
    record.api_key = SECRET  # type: ignore[attr-defined]
    secret_filter.filter(record)
    assert SECRET not in record.api_key  # type: ignore[attr-defined]


def test_configure_logging_redacts_a_handler_on_a_non_propagating_child_logger(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A handler attached directly to a child logger -- which never reaches
    root's filters or handlers, since Logger.filters only apply to records
    logged directly on that logger -- must still be redacted."""
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://u:p@localhost/db")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", SECRET)

    configure_logging()

    child = logging.getLogger("some.vendored.library")
    child.setLevel(logging.DEBUG)
    child.propagate = False
    records: list[logging.LogRecord] = []
    handler = logging.Handler()
    handler.emit = records.append  # type: ignore[method-assign]
    child.addHandler(handler)
    try:
        child.warning("Authorization: Bearer %s", SECRET)
    finally:
        child.removeHandler(handler)

    assert records, "no record was captured"
    assert SECRET not in records[0].getMessage()


def test_configure_logging_applies_the_configured_log_level(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """FACTORFLOW_LOG_LEVEL (component design section 2.2, SA-LOG-001):
    configure_logging() applies it to the root logger."""
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://u:p@localhost/db")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", SECRET)
    monkeypatch.setenv("FACTORFLOW_LOG_LEVEL", "WARNING")

    root = logging.getLogger()
    original_level = root.level
    try:
        configure_logging()
        assert root.level == logging.WARNING
    finally:
        root.setLevel(original_level)


def test_configure_logging_defaults_to_info_when_unset(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://u:p@localhost/db")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", SECRET)
    monkeypatch.delenv("FACTORFLOW_LOG_LEVEL", raising=False)

    root = logging.getLogger()
    original_level = root.level
    try:
        configure_logging()
        assert root.level == logging.INFO
    finally:
        root.setLevel(original_level)
