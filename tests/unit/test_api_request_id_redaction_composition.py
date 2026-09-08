"""IR-001 regression: request-id stamping and credential redaction compose.

`configure_logging` (CAP-001-E1-S3) and `_install_request_id_patch`
(CAP-001-E1-S6) both patch `logging.Handler.handle` at the class level. An
earlier version of the request-id patch shared `configure_logging`'s
`_unfiltered_handle` sentinel to find "the original" handler method,
which meant whichever patch installed second discarded the other's
wrapper rather than composing with it -- silently disabling credential
redaction in the API process. This test installs both, in both orders,
and asserts a record carrying a secret is emitted both redacted and
carrying the request id every time.
"""

import logging

import pytest

import factorflow.api.app as app_module
import factorflow.config.settings as settings_module


@pytest.fixture(autouse=True)
def _reset_handler_patches() -> None:
    """`Handler.handle` patches are process-global and idempotent-by-sentinel.

    Each test needs a clean baseline so it observes only its own installs,
    not leftover wrapping from an earlier test in the same process.
    """
    original_handle = logging.Handler.handle
    for attr in ("_unfiltered_handle", "_request_id_unstamped_handle"):
        if hasattr(logging.Handler, attr):
            delattr(logging.Handler, attr)
    yield
    logging.Handler.handle = original_handle
    for attr in ("_unfiltered_handle", "_request_id_unstamped_handle"):
        if hasattr(logging.Handler, attr):
            delattr(logging.Handler, attr)


def _emit_and_capture(secret: str, request_id: str) -> logging.LogRecord:
    records: list[logging.LogRecord] = []

    class _Capture(logging.Handler):
        def emit(self, record: logging.LogRecord) -> None:
            records.append(record)

    logger = logging.getLogger("factorflow.api.test.redaction_composition")
    logger.setLevel(logging.INFO)
    handler = _Capture()
    logger.addHandler(handler)
    try:
        token = app_module._request_id_var.set(request_id)
        try:
            logger.info("leaking %s here", secret)
        finally:
            app_module._request_id_var.reset(token)
    finally:
        logger.removeHandler(handler)

    assert records, "expected exactly one record to have been emitted"
    return records[-1]


def test_redaction_then_request_id_compose(monkeypatch: pytest.MonkeyPatch) -> None:
    secret = "SECRETKEY123"
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", secret)

    settings_module.configure_logging()
    app_module._install_request_id_patch()

    record = _emit_and_capture(secret, "rid-order-a")

    assert secret not in record.getMessage()
    assert record.getMessage() == "leaking [redacted] here"
    assert record.request_id == "rid-order-a"  # type: ignore[attr-defined]


def test_request_id_then_redaction_compose(monkeypatch: pytest.MonkeyPatch) -> None:
    secret = "SECRETKEY456"
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", secret)

    app_module._install_request_id_patch()
    settings_module.configure_logging()

    record = _emit_and_capture(secret, "rid-order-b")

    assert secret not in record.getMessage()
    assert record.getMessage() == "leaking [redacted] here"
    assert record.request_id == "rid-order-b"  # type: ignore[attr-defined]
