"""Taxonomy, request-ID, and credential-safety tests for
``factorflow.ingestion.massive.errors`` (CAP-001-E3-S3).

Component design: ``component-design-massive-client.md`` sections 2.4,
2.6a (the response envelope) and 4 (error disclosure).
"""

import logging
from pathlib import Path

import pytest

from factorflow.ingestion.massive.errors import (
    CredentialRejected,
    InstrumentNotFound,
    ProviderUnavailable,
    classify_error_body,
)

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "massive"

_CREDENTIAL_FIXTURE = "SECRET_TEST_TOKEN_ABC123"  # a known credential fixture, never real


def _load_text(name: str) -> str:
    return (FIXTURES / name).read_text()


# --- TC-COMP-207 / DAC-E3-S3-2: API-key errors -------------------------


def test_unknown_api_key_classifies_as_credential_rejected() -> None:
    """TC-COMP-207 / DAC-E3-S3-2: an `error` naming an unknown API key
    becomes `CredentialRejected`."""
    body = _load_text("error_credential_unknown_key.json")

    result = classify_error_body(body)

    assert isinstance(result, CredentialRejected)


def test_malformed_authorization_header_classifies_as_credential_rejected() -> None:
    """TC-COMP-207 / DAC-E3-S3-2: a malformed `Authorization` header error
    also becomes `CredentialRejected`, not merely the "unknown key" case."""
    body = _load_text("error_credential_malformed_header.json")

    result = classify_error_body(body)

    assert isinstance(result, CredentialRejected)


def test_credential_rejected_never_contains_the_credential_value() -> None:
    """DAC-E3-S3-2: the credential value appears in neither the exception
    nor any log record."""
    body = _load_text("error_credential_unknown_key.json")

    result = classify_error_body(body)

    assert _CREDENTIAL_FIXTURE not in str(result)
    assert _CREDENTIAL_FIXTURE not in repr(result)


# --- TC-COMP-221 / DAC-E3-S3-5: request_id propagation -----------------


def test_request_id_is_populated_when_present() -> None:
    """TC-COMP-221 / DAC-E3-S3-5: `provider_request_id` is populated from
    the response when present."""
    body = _load_text("error_not_found.json")

    result = classify_error_body(body)

    assert result.provider_request_id == "req_notfound_001"


def test_request_id_is_none_when_absent_never_fabricated() -> None:
    """TC-COMP-221 / DAC-E3-S3-5: `provider_request_id` is `None` when the
    response carries none -- never fabricated as an empty string or
    placeholder."""
    body = _load_text("error_no_request_id.json")

    result = classify_error_body(body)

    assert result.provider_request_id is None


def test_every_taxonomy_type_carries_request_id_uniformly() -> None:
    """DAC-E3-S3-5 applies to every typed error, not only
    `InstrumentNotFound`."""
    not_found = classify_error_body(_load_text("error_not_found.json"))
    credential = classify_error_body(_load_text("error_credential_unknown_key.json"))
    unavailable = classify_error_body(_load_text("error_unknown_shape.json"))

    assert not_found.provider_request_id == "req_notfound_001"
    assert credential.provider_request_id == "req_cred_001"
    assert unavailable.provider_request_id is None  # this fixture carries none


# --- TC-COMP-224: no credential in message, repr, or log record --------


def test_no_credential_fixture_in_str_repr_or_captured_log(
    caplog: pytest.LogCaptureFixture,
) -> None:
    """TC-COMP-224: no exception message, representation, or captured log
    record contains a known credential fixture, across every taxonomy
    type this module can produce from an envelope."""
    logger = logging.getLogger("factorflow.ingestion.massive.errors.test")

    fixtures = [
        "error_not_found.json",
        "error_credential_unknown_key.json",
        "error_credential_malformed_header.json",
        "error_unknown_shape.json",
        "error_with_spurious_credential_field.json",
    ]

    with caplog.at_level(logging.INFO):
        for fixture in fixtures:
            body = _load_text(fixture)
            error = classify_error_body(body)
            logger.info("classified provider error: %s", error)

            assert _CREDENTIAL_FIXTURE not in str(error)
            assert _CREDENTIAL_FIXTURE not in repr(error)

    assert _CREDENTIAL_FIXTURE not in caplog.text


# --- TC-COMP-011: safe, request-ID-bearing not-found reason ------------


def test_not_found_failure_retains_safe_request_id_bearing_reason() -> None:
    """TC-COMP-011: a classified not-found failure retains a safe,
    provider-request-ID-bearing reason that an acquisition-runner can
    record per instrument, without exposing a raw SDK exception or
    credential."""
    body = _load_text("error_not_found.json")

    result = classify_error_body(body)

    assert isinstance(result, InstrumentNotFound)
    assert result.provider_request_id == "req_notfound_001"
    # The reason is a safe, constructed message -- not the raw envelope.
    assert body not in str(result)
    reason = str(result)
    assert isinstance(reason, str)
    assert len(reason) > 0


def test_not_found_reason_never_exposes_the_raw_sdk_response_body() -> None:
    """The reason recorded for the runner must be built from the taxonomy,
    not by forwarding the raw provider body verbatim (component design
    section 4, error disclosure)."""
    body = _load_text("error_not_found.json")

    result = classify_error_body(body)

    assert "{" not in str(result)
    assert "request_id" not in str(result)
