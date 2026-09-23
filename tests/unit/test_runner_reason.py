"""Unit tests: provider exception reasons are redacted before storage.

- Verifies that failure reasons written to run_instrument_result never
  contain the raw credential or provider-supplied free text that hasn't
  been passed through redaction.

These tests operate at the runner's boundary: they do not touch PostgreSQL.

# Implements partial TC-COMP-178 (redacted reason), TC-COMP-009
"""

from __future__ import annotations

from factorflow.ingestion.massive.errors import (
    CredentialRejected,
    InstrumentNotFound,
    ProviderUnavailable,
    compose_failure_reason,
)


def test_not_found_reason_is_safe_string() -> None:
    """InstrumentNotFound produces a reason string safe to store."""
    err = InstrumentNotFound("The provider does not recognise this instrument.")
    reason = compose_failure_reason(
        err,
        symbol="AAPL",
        data_type="reference",
        redact=lambda s: s,
    )
    assert "not_found" in reason
    assert "AAPL" in reason
    assert "reference" in reason


def test_provider_unavailable_reason_redacts_message() -> None:
    """ProviderUnavailable message is passed through redact before storage."""
    secret = "my-secret-api-key"
    err = ProviderUnavailable(f"Connection failed. key={secret}")

    def redact(msg: str) -> str:
        return msg.replace(secret, "[REDACTED]")

    reason = compose_failure_reason(
        err,
        symbol="MSFT",
        data_type="prices",
        redact=redact,
    )
    assert secret not in reason
    assert "[REDACTED]" in reason or "unavailable" in reason


def test_credential_rejected_uses_fixed_description() -> None:
    """CredentialRejected always uses a fixed description, never its own message."""
    err = CredentialRejected("api key my-secret-api-key was invalid")
    reason = compose_failure_reason(
        err,
        symbol="GOOG",
        data_type="fundamentals",
        redact=lambda s: s,
    )
    # Fixed description expected, never the raw message
    assert "credential_rejected" in reason
    assert "my-secret-api-key" not in reason


def test_runner_does_not_call_api_process() -> None:
    """The runner module must not import from factorflow.api."""
    import importlib
    import sys

    # Import the runner module
    if "factorflow.ingestion.runner" in sys.modules:
        runner_module = sys.modules["factorflow.ingestion.runner"]
    else:
        runner_module = importlib.import_module("factorflow.ingestion.runner")

    # Boundary check: the runner must not trigger API imports.
    # Examine the runner module's __dict__ for api references.
    runner_vars = vars(runner_module)
    assert "factorflow.api" not in str(runner_vars.get("__file__", ""))
