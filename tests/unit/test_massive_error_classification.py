"""Envelope-classification tests for
``factorflow.ingestion.massive.errors`` (CAP-001-E3-S3).

Component design: ``component-design-massive-client.md`` sections 2.4
(the taxonomy and classification order) and 2.6a (the response envelope).

The SDK raises one exception for every non-200, discarding the HTTP status
code and leaving only the response body (section 2.4). Every fixture here
is a body -- never a status code or a header -- because that is the only
signal this module is allowed to use.
"""

import json
from pathlib import Path
from typing import Any

import pytest
from pydantic import ValidationError

from factorflow.ingestion.massive.errors import (
    CredentialRejected,
    InstrumentNotFound,
    MassiveError,
    ProviderContractViolation,
    ProviderUnavailable,
    classify_error_body,
    is_fatal_for_governor,
    is_rate_limited_body,
    wrap_validation_error,
)
from factorflow.ingestion.massive.models import DailyBar

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "massive"


def _load_text(name: str) -> str:
    return (FIXTURES / name).read_text()


def _load_json(name: str) -> dict[str, Any]:
    return json.loads(_load_text(name))


# --- TC-COMP-196: all four taxonomy types exist -----------------------


def test_all_four_taxonomy_types_exist_and_derive_from_massive_error() -> None:
    """TC-COMP-196 / DAC-E3-2: exactly the four named types are provider
    failures, and every one of them is a `MassiveError`."""
    for error_type in (
        InstrumentNotFound,
        CredentialRejected,
        ProviderUnavailable,
        ProviderContractViolation,
    ):
        assert issubclass(error_type, MassiveError)
    assert issubclass(MassiveError, Exception)


# --- TC-COMP-220 / DAC-E3-S3-1: NOT_FOUND status -----------------------


def test_status_not_found_classifies_as_instrument_not_found() -> None:
    """TC-COMP-220 / DAC-E3-S3-1: a `status: "NOT_FOUND"` envelope becomes
    `InstrumentNotFound`."""
    body = _load_text("error_not_found.json")

    result = classify_error_body(body)

    assert isinstance(result, InstrumentNotFound)


def test_status_not_found_alone_classifies_even_with_an_unrelated_message() -> None:
    """TC-COMP-220 / DAC-E3-S3-1: `status: "NOT_FOUND"` classifies on its
    own, independent of the message text -- distinguishing this from
    `test_not_found_message_recognised_when_status_is_absent`, which
    proves the reverse path."""
    body = _load_text("error_not_found_status_only.json")
    assert "ticker not found" not in json.loads(body)["message"].lower()

    result = classify_error_body(body)

    assert isinstance(result, InstrumentNotFound)


# --- TC-COMP-197 / DAC-E3-3: message vs error field, neither required --


def test_message_field_is_accepted_for_not_found() -> None:
    """TC-COMP-197 / DAC-E3-3: a 404-shaped envelope carries `message`,
    not `error`, and still classifies correctly."""
    body = _load_text("error_not_found.json")
    assert "message" in json.loads(body)
    assert "error" not in json.loads(body)

    result = classify_error_body(body)

    assert isinstance(result, InstrumentNotFound)


def test_error_field_is_accepted_for_credential_rejection() -> None:
    """TC-COMP-197 / DAC-E3-3: a 401-shaped envelope carries `error`, not
    `message`, and still classifies correctly."""
    body = _load_text("error_credential_unknown_key.json")
    assert "error" in json.loads(body)
    assert "message" not in json.loads(body)

    result = classify_error_body(body)

    assert isinstance(result, CredentialRejected)


def test_neither_message_nor_error_is_required() -> None:
    """TC-COMP-197 / DAC-E3-3: an envelope with neither field still
    classifies (to the safe default), rather than raising a `KeyError`."""
    body = _load_text("error_missing_message_and_error.json")

    result = classify_error_body(body)

    assert isinstance(result, ProviderUnavailable)


# --- TC-COMP-198 / DAC-E3-4: malformed and unknown envelopes -----------


def test_malformed_json_classifies_as_provider_unavailable_never_not_found() -> None:
    """TC-COMP-198 / DAC-E3-4: a body that will not parse as JSON is
    `ProviderUnavailable`, explicitly asserted **not** `InstrumentNotFound`
    -- guessing not-found from an unparseable body would let an outage
    look like an empty instrument (AC-12)."""
    body = _load_text("error_malformed.txt")

    result = classify_error_body(body)

    assert isinstance(result, ProviderUnavailable)
    assert not isinstance(result, InstrumentNotFound)


def test_valid_json_of_unknown_shape_classifies_as_provider_unavailable() -> None:
    """TC-COMP-222 / DAC-E3-S3-3: an envelope that parses but matches no
    known case becomes `ProviderUnavailable`, the safe default."""
    body = _load_text("error_unknown_shape.json")

    result = classify_error_body(body)

    assert isinstance(result, ProviderUnavailable)


@pytest.mark.parametrize("body", ["[1, 2]", "null", '"text"', "42"])
def test_non_object_json_classifies_as_provider_unavailable_not_a_crash(
    body: str,
) -> None:
    """DAC-E3-4 / DAC-E3-S3-3: valid JSON that is not an object (an array,
    `null`, a bare string, or a number) does not present a usable envelope
    and must classify as `ProviderUnavailable`, never raise `AttributeError`
    while looking up an envelope field that a non-dict value cannot have."""
    result = classify_error_body(body)

    assert isinstance(result, ProviderUnavailable)


# --- TC-COMP-199 / DAC-E3-5: 200 failing model validation --------------


def test_validation_error_from_a_successful_response_wraps_to_contract_violation() -> None:
    """TC-COMP-199 / DAC-E3-5: a `ValidationError` produced by an S2 model
    (a 200 response missing a required field) becomes
    `ProviderContractViolation`, and no partially parsed value is
    returned."""
    incomplete_bar = {"t": 1704153600000, "o": 187.15, "h": 188.44}  # missing l/c/v/vw/n
    try:
        DailyBar.model_validate(incomplete_bar)
        pytest.fail("fixture must fail model validation for this test to be meaningful")
    except ValidationError as validation_error:
        result = wrap_validation_error(validation_error, provider_request_id="req_ok_001")

    assert isinstance(result, ProviderContractViolation)
    assert result.provider_request_id == "req_ok_001"
    # No partial parsed value leaks into the safe message.
    assert "187.15" not in str(result)
    assert "188.44" not in str(result)


def test_classify_error_body_never_returns_contract_violation() -> None:
    """Per this story's owner-resolved precedence (task plan Notes):
    `ProviderContractViolation` is reserved exclusively for a `200`
    response failing model validation. A raw error envelope, however
    unrecognisable, classifies as `ProviderUnavailable`, never
    `ProviderContractViolation`."""
    for fixture in ("error_unknown_shape.json", "error_malformed.txt"):
        result = classify_error_body(_load_text(fixture))
        assert not isinstance(result, ProviderContractViolation)


# --- TC-COMP-223 / DAC-E3-S3-4: contract violation is fatal ------------


def test_contract_violation_is_fatal_for_the_governor_classifier() -> None:
    """TC-COMP-223 / DAC-E3-S3-4: a `ProviderContractViolation` is fatal
    input for the caller's governor classifier -- retrying is not
    attempted, because it means the provider changed rather than that it
    is down. This exercises only this module's classification seam, not
    governor retry behaviour (owned by CAP-001-E3-S1/S4)."""
    violation = ProviderContractViolation("unused", provider_request_id=None)

    assert is_fatal_for_governor(violation) is True


def test_provider_unavailable_is_the_only_retryable_type() -> None:
    """Every other taxonomy type is fatal; only `ProviderUnavailable` --
    a transport failure or unrecognised envelope -- is worth retrying."""
    assert is_fatal_for_governor(ProviderUnavailable("unused")) is False
    assert is_fatal_for_governor(InstrumentNotFound("unused")) is True
    assert is_fatal_for_governor(CredentialRejected("unused")) is True


# --- TC-COMP-225 / DAC-E3-S3-6: 429 is flow control, not an error ------


def test_rate_limited_body_is_identified_without_constructing_any_massive_error() -> None:
    """TC-COMP-225 / DAC-E3-S3-6: a Massive 429 body is identified as
    flow control for the governor. `classify_error_body` is never called
    for it in practice, but this test exercises the client-facing
    classification seam in isolation, not governor retry behaviour."""
    body = _load_text("error_rate_limited.json")

    assert is_rate_limited_body(body) is True


def test_non_rate_limited_bodies_are_not_flagged_as_rate_limited() -> None:
    for fixture in (
        "error_not_found.json",
        "error_credential_unknown_key.json",
        "error_unknown_shape.json",
        "error_malformed.txt",
    ):
        assert is_rate_limited_body(_load_text(fixture)) is False


# --- Additional classifier boundary tests (T007) -----------------------


def test_not_found_message_recognised_when_status_is_absent() -> None:
    """A documented not-found message is recognised even when `status` is
    absent entirely, not only when it reads `"NOT_FOUND"`."""
    body = _load_text("error_not_found_message_only.json")
    assert "status" not in json.loads(body)

    result = classify_error_body(body)

    assert isinstance(result, InstrumentNotFound)


def test_absent_message_and_error_still_produces_provider_unavailable() -> None:
    """An envelope with `status` but neither failure field still produces
    `ProviderUnavailable` rather than raising while looking up a missing
    key."""
    body = _load_text("error_missing_message_and_error.json")

    result = classify_error_body(body)

    assert isinstance(result, ProviderUnavailable)


def test_classification_never_touches_a_provider_url_or_credential() -> None:
    """Response-body parsing never surfaces an unexpected field: a
    spurious field carrying a URL with an embedded credential must not
    reach the classified error's message or repr."""
    body = _load_text("error_with_spurious_credential_field.json")
    assert "SECRET_TEST_TOKEN_ABC123" in body  # sanity: the fixture does carry it

    result = classify_error_body(body)

    assert "SECRET_TEST_TOKEN_ABC123" not in str(result)
    assert "SECRET_TEST_TOKEN_ABC123" not in repr(result)
    assert "massive.com" not in str(result)
