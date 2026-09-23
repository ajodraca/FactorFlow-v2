"""Unit tests: per-instrument outcome classification (CAP-001-E4-S6).

Tests the typed per-data-type outcome classifier in
``src/factorflow/ingestion/outcomes.py`` against ``WriteResult``,
typed provider errors, and the credential-safe reason composer.

Implements TC-COMP-183, TC-COMP-184, TC-COMP-185, TC-COMP-186, TC-COMP-188,
TC-COMP-189, and additional edge-case tests.
"""

from __future__ import annotations

from datetime import date

import pytest

from factorflow.ingestion.massive.errors import (
    CredentialRejected,
    InstrumentNotFound,
    ProviderContractViolation,
    ProviderUnavailable,
    compose_failure_reason,
)
from factorflow.ingestion.writer import WriteResult

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

_TODAY = date(2025, 9, 22)
_DEPTH_START = date(2020, 9, 22)
_COVERED_RANGE = (_DEPTH_START, _TODAY)


def _make_write_result(
    *,
    reference_appended: int = 1,
    reference_unchanged: int = 0,
    prices_appended: int = 10,
    prices_unchanged: int = 0,
    fundamentals_appended: int = 4,
    fundamentals_unchanged: int = 0,
    corporate_actions_appended: int = 0,
    corporate_actions_unchanged: int = 0,
) -> WriteResult:
    return WriteResult(
        reference_appended=reference_appended,
        reference_unchanged=reference_unchanged,
        reference_covered_range=_COVERED_RANGE,
        prices_appended=prices_appended,
        prices_unchanged=prices_unchanged,
        prices_covered_range=_COVERED_RANGE,
        fundamentals_appended=fundamentals_appended,
        fundamentals_unchanged=fundamentals_unchanged,
        fundamentals_covered_range=_COVERED_RANGE,
        corporate_actions_appended=corporate_actions_appended,
        corporate_actions_unchanged=corporate_actions_unchanged,
        corporate_actions_covered_range=_COVERED_RANGE,
    )


def _make_not_found(data_type: str = "reference") -> InstrumentNotFound:
    return InstrumentNotFound(
        "The provider does not recognise this instrument.",
        provider_request_id="req-abc-123",
    )


def _make_provider_unavailable(data_type: str = "prices") -> ProviderUnavailable:
    return ProviderUnavailable(
        "The provider returned an error this component does not recognise.",
        provider_request_id="req-xyz-456",
    )


def _make_provider_contract_violation(data_type: str = "fundamentals") -> ProviderContractViolation:
    return ProviderContractViolation(
        "The provider's response for FinancialStatement failed model validation (2 field(s)).",
        provider_request_id="req-pcv-789",
    )


def _make_safe_reason(error: InstrumentNotFound | ProviderUnavailable, data_type: str) -> str:
    return compose_failure_reason(
        error,
        symbol="AAPL",
        data_type=data_type,
        redact=lambda s: s,
    )


# ---------------------------------------------------------------------------
# Phase 2: Tests (TDD) — TC-COMP-183, TC-COMP-184
# ---------------------------------------------------------------------------


# Implements TC-COMP-183
def test_written_outcome_when_rows_appended() -> None:
    """Positive appended counts classify all data types as ``written``.

    TC-COMP-183: data returned and rows appended → outcome is ``written``,
    contributes to ``succeeded``.
    """
    from factorflow.ingestion.outcomes import classify_write_result

    result = _make_write_result(
        reference_appended=1,
        prices_appended=10,
        fundamentals_appended=4,
        corporate_actions_appended=0,
        corporate_actions_unchanged=2,
    )
    outcomes = classify_write_result(result)

    assert outcomes["reference"] == "written"
    assert outcomes["prices"] == "written"
    assert outcomes["fundamentals"] == "written"
    # corporate_actions had no appends but some unchanged — classify as unchanged
    assert outcomes["corporate_actions"] == "unchanged"


# Implements TC-COMP-184
def test_unchanged_outcome_when_all_held() -> None:
    """All-already-held returned data classifies as ``unchanged``.

    TC-COMP-184: data returned, every value already held → outcome is
    ``unchanged``, contributes to ``succeeded``.
    """
    from factorflow.ingestion.outcomes import classify_write_result

    result = _make_write_result(
        reference_appended=0,
        reference_unchanged=1,
        prices_appended=0,
        prices_unchanged=365,
        fundamentals_appended=0,
        fundamentals_unchanged=4,
        corporate_actions_appended=0,
        corporate_actions_unchanged=0,
    )
    outcomes = classify_write_result(result)

    assert outcomes["reference"] == "unchanged"
    assert outcomes["prices"] == "unchanged"
    assert outcomes["fundamentals"] == "unchanged"
    assert outcomes["corporate_actions"] == "unchanged"


# ---------------------------------------------------------------------------
# Phase 2: Tests (TDD) — TC-COMP-185, TC-COMP-186, TC-COMP-188
# ---------------------------------------------------------------------------


# Implements TC-COMP-185
def test_not_found_maps_to_not_found_outcome() -> None:
    """``InstrumentNotFound`` maps the failing data type to ``not_found``.

    TC-COMP-185: instrument unknown to provider → outcome is ``not_found``,
    run continues, outcome becomes ``partial``.
    """
    from factorflow.ingestion.outcomes import classify_provider_error

    err = _make_not_found("reference")
    reason = _make_safe_reason(err, "reference")
    record = classify_provider_error(err, data_type="reference", reason=reason)

    assert record.outcome == "not_found"
    assert record.data_type == "reference"
    assert record.reason == reason


# Implements TC-COMP-186
def test_provider_unavailable_maps_to_failed_outcome() -> None:
    """``ProviderUnavailable`` maps the failing data type to ``failed``.

    TC-COMP-186: transport or server error, attempts exhausted → outcome is
    ``failed``, run continues, outcome becomes ``partial``.
    """
    from factorflow.ingestion.outcomes import classify_provider_error

    err = _make_provider_unavailable("prices")
    reason = _make_safe_reason(err, "prices")
    record = classify_provider_error(err, data_type="prices", reason=reason)

    assert record.outcome == "failed"
    assert record.data_type == "prices"
    assert record.reason == reason


# Implements TC-COMP-188
def test_distinct_outcomes_for_prices_and_fundamentals() -> None:
    """One instrument can have distinct prices and fundamentals outcomes.

    TC-COMP-188: an instrument recognised for prices but not fundamentals
    records ``written`` for prices and ``not_found`` for fundamentals.
    """
    from factorflow.ingestion.outcomes import classify_provider_error, classify_write_result

    # Prices: data appended → written
    prices_result = WriteResult(
        reference_appended=1,
        reference_unchanged=0,
        reference_covered_range=_COVERED_RANGE,
        prices_appended=10,
        prices_unchanged=0,
        prices_covered_range=_COVERED_RANGE,
        fundamentals_appended=0,
        fundamentals_unchanged=0,
        fundamentals_covered_range=_COVERED_RANGE,
        corporate_actions_appended=0,
        corporate_actions_unchanged=0,
        corporate_actions_covered_range=_COVERED_RANGE,
    )
    price_outcomes = classify_write_result(prices_result)
    assert price_outcomes["prices"] == "written"

    # Fundamentals: not_found
    err = InstrumentNotFound(
        "The provider does not recognise this instrument.",
        provider_request_id="req-nf-001",
    )
    reason = compose_failure_reason(
        err,
        symbol="AAPL",
        data_type="fundamentals",
        redact=lambda s: s,
    )
    fund_record = classify_provider_error(err, data_type="fundamentals", reason=reason)
    assert fund_record.outcome == "not_found"
    assert fund_record.data_type == "fundamentals"


# ---------------------------------------------------------------------------
# Phase 2: Additional unit tests — T006
# ---------------------------------------------------------------------------


def test_empty_write_result_classifies_all_unchanged() -> None:
    """Empty WriteResult (zero appended, zero unchanged) classifies as ``unchanged``.

    An empty provider response (no rows) is distinct from explicit idempotence.
    Both classify as ``unchanged`` since no append occurred.
    """
    from factorflow.ingestion.outcomes import classify_write_result

    result = _make_write_result(
        reference_appended=0,
        reference_unchanged=0,
        prices_appended=0,
        prices_unchanged=0,
        fundamentals_appended=0,
        fundamentals_unchanged=0,
        corporate_actions_appended=0,
        corporate_actions_unchanged=0,
    )
    outcomes = classify_write_result(result)

    # Zero appended means no rows written → unchanged (idempotent path)
    assert outcomes["reference"] == "unchanged"
    assert outcomes["prices"] == "unchanged"
    assert outcomes["fundamentals"] == "unchanged"
    assert outcomes["corporate_actions"] == "unchanged"


def test_mixed_per_data_type_result() -> None:
    """Mixed result: prices written, fundamentals unchanged, both preserved."""
    from factorflow.ingestion.outcomes import classify_write_result

    result = _make_write_result(
        reference_appended=1,
        reference_unchanged=0,
        prices_appended=5,
        prices_unchanged=100,
        fundamentals_appended=0,
        fundamentals_unchanged=4,
        corporate_actions_appended=2,
        corporate_actions_unchanged=0,
    )
    outcomes = classify_write_result(result)

    assert outcomes["reference"] == "written"
    assert outcomes["prices"] == "written"
    assert outcomes["fundamentals"] == "unchanged"
    assert outcomes["corporate_actions"] == "written"


def test_classify_write_result_preserves_four_data_type_names() -> None:
    """classify_write_result returns exactly the four schema data-type keys."""
    from factorflow.ingestion.outcomes import classify_write_result

    result = _make_write_result()
    outcomes = classify_write_result(result)

    assert set(outcomes.keys()) == {"reference", "prices", "fundamentals", "corporate_actions"}


def test_credential_rejected_is_rejected_as_per_data_type_outcome() -> None:
    """``CredentialRejected`` must not become a per-data-type outcome.

    It is a run-level failure: the run stops, not just one data type.
    classify_provider_error must raise ValueError for CredentialRejected.
    """
    from factorflow.ingestion.outcomes import classify_provider_error

    err = CredentialRejected(
        "The provider rejected the configured credential.",
        provider_request_id="req-cr-001",
    )
    reason = compose_failure_reason(
        err,
        symbol="AAPL",
        data_type="reference",
        redact=lambda s: s,
    )
    with pytest.raises(ValueError, match="CredentialRejected"):
        classify_provider_error(err, data_type="reference", reason=reason)


def test_unrecognized_classification_input_raises() -> None:
    """An unrecognised error type passed to classify_provider_error raises."""
    from factorflow.ingestion.outcomes import classify_provider_error

    class UnknownError(Exception):
        pass

    with pytest.raises((TypeError, ValueError)):
        classify_provider_error(UnknownError("oops"), data_type="prices", reason="some reason")  # type: ignore[arg-type]


# ---------------------------------------------------------------------------
# TC-COMP-189 — credential-safe reason
# ---------------------------------------------------------------------------


# Implements TC-COMP-189
def test_safe_reason_retains_request_id_excludes_credential() -> None:
    """Composed reason retains the provider request ID and excludes the credential.

    TC-COMP-189: a safe reason from a typed provider error carrying a request ID
    and credential-bearing diagnostic text retains the request ID while
    containing no credential substring.
    """
    credential = "super-secret-api-key-9999"
    request_id = "req-safe-001"
    err = ProviderUnavailable(
        f"Connection failed. credential={credential} endpoint=https://api.massive.com",
        provider_request_id=request_id,
    )

    def redact(msg: str) -> str:
        return msg.replace(credential, "[REDACTED]")

    reason = compose_failure_reason(
        err,
        symbol="MSFT",
        data_type="prices",
        redact=redact,
    )

    assert request_id in reason
    assert credential not in reason


def test_provider_contract_violation_maps_to_failed() -> None:
    """``ProviderContractViolation`` maps to ``failed`` outcome."""
    from factorflow.ingestion.outcomes import classify_provider_error

    err = _make_provider_contract_violation("fundamentals")
    reason = compose_failure_reason(
        err,
        symbol="GOOG",
        data_type="fundamentals",
        redact=lambda s: s,
    )
    record = classify_provider_error(err, data_type="fundamentals", reason=reason)
    assert record.outcome == "failed"
    assert record.data_type == "fundamentals"
