"""Failure-reason composer tests for
``factorflow.ingestion.massive.errors`` (CAP-001-E3-S5).

Component design: ``component-design-massive-client.md`` sections 2.4
(the taxonomy), 4 (error disclosure). Story: ``CAP-001-E3-S5``.

These tests never import the Massive SDK and never make a provider
request -- they exercise only the reason composer against the typed
errors CAP-001-E3-S3 already delivers.
"""

from __future__ import annotations

import pytest

from factorflow.ingestion.massive.errors import (
    MAX_FAILURE_REASON_VARIABLE_TEXT,
    CredentialRejected,
    InstrumentNotFound,
    ProviderContractViolation,
    ProviderUnavailable,
    compose_failure_reason,
)

_CREDENTIAL_FIXTURE = "SECRET_TEST_TOKEN_ABC123"  # a known credential fixture, never real


def _redact_fixture(text: str) -> str:
    """A client-style redaction callable: strips the known credential
    fixture wherever it appears in `text`."""
    return text.replace(_CREDENTIAL_FIXTURE, "[redacted]")


def _identity_redact(text: str) -> str:
    """A no-op redaction callable, for tests where no credential is
    present and the boundary rules (truncation, field composition) are
    what's under test."""
    return text


# --- TC-COMP-207 / TC-COMP-232 / DAC-E3-13 / DAC-E3-S5-1 ----------------


def test_reason_includes_symbol_data_type_and_request_id_when_present() -> None:
    """TC-COMP-207: a reason composed from a typed error with a request ID
    names the symbol, the data type, and the provider request ID."""
    error = InstrumentNotFound(
        "The provider does not recognise this instrument.",
        provider_request_id="req_notfound_001",
    )

    reason = compose_failure_reason(
        error, symbol="AAPL", data_type="daily_bars", redact=_identity_redact
    )

    assert "AAPL" in reason
    assert "daily_bars" in reason
    assert "req_notfound_001" in reason


def test_reason_renders_absent_request_id_explicitly_not_fabricated() -> None:
    """TC-COMP-232 / DAC-E3-S5-1: a typed error with `provider_request_id=None`
    renders that absence explicitly -- never a fabricated ID, and never
    silently omitted from the reason. Uses `InstrumentNotFound` rather
    than `ProviderUnavailable` so the error-kind text itself
    (`[not_found]`) cannot be mistaken for the request-ID field's own
    explicit-absence marker."""
    error = InstrumentNotFound(
        "The provider does not recognise this instrument.",
        provider_request_id=None,
    )

    reason = compose_failure_reason(
        error, symbol="MSFT", data_type="ticker_reference", redact=_identity_redact
    )

    assert "MSFT" in reason
    assert "ticker_reference" in reason
    # The absence is stated explicitly with a pinned marker -- not
    # fabricated as a placeholder ID and not silently dropped from the
    # text.
    assert "req_" not in reason
    assert "request_id=unavailable" in reason


# --- TC-COMP-013 / TC-COMP-233 / AC-13 / DAC-E3-S5-2 --------------------


@pytest.mark.parametrize(
    "error",
    [
        InstrumentNotFound(f"Rejected: {_CREDENTIAL_FIXTURE}", provider_request_id="req_001"),
        CredentialRejected(
            f"The provider rejected the configured credential: {_CREDENTIAL_FIXTURE}",
            provider_request_id="req_002",
        ),
        ProviderUnavailable(
            f"Unavailable, saw {_CREDENTIAL_FIXTURE} in diagnostics",
            provider_request_id="req_003",
        ),
        ProviderContractViolation(
            f"Contract violated near {_CREDENTIAL_FIXTURE}", provider_request_id="req_004"
        ),
    ],
)
def test_no_typed_error_leaks_the_credential_fixture(error: object) -> None:
    """TC-COMP-013 / TC-COMP-233 / AC-13: composing a reason for any of the
    four typed errors, with a known credential-like fixture present in the
    diagnostic text, never leaks the fixture through the client-style
    redaction callable -- including `CredentialRejected`'s own reason
    kind."""
    reason = compose_failure_reason(
        error,  # type: ignore[arg-type]
        symbol="AAPL",
        data_type="daily_bars",
        redact=_redact_fixture,
    )

    assert _CREDENTIAL_FIXTURE not in reason


def test_credential_rejected_states_rejection_without_echoing_any_value() -> None:
    """DAC-E3-S5-2: `CredentialRejected`'s reason states the rejection using
    a fixed description -- never a supplied credential value, redacted or
    not."""
    error = CredentialRejected(
        f"The provider rejected the configured credential: {_CREDENTIAL_FIXTURE}",
        provider_request_id="req_005",
    )

    reason = compose_failure_reason(
        error, symbol="AAPL", data_type="daily_bars", redact=_redact_fixture
    )

    assert _CREDENTIAL_FIXTURE not in reason
    assert "rejected" in reason.lower()


# --- TC-COMP-234 / DAC-E3-S5-3 -------------------------------------------


def test_pathological_diagnostic_text_is_visibly_truncated() -> None:
    """TC-COMP-234 / DAC-E3-S5-3: diagnostic text over 500 characters is
    bounded and the variable segment ends with the truncation marker,
    while the assembled reason still carries its complete symbol, data
    type, error kind, and provider request ID."""
    long_text = "x" * 600
    error = ProviderUnavailable(long_text, provider_request_id="req_long_001")

    reason = compose_failure_reason(
        error, symbol="AAPL", data_type="daily_bars", redact=_identity_redact
    )

    assert reason.rstrip().endswith("…[truncated]") or "…[truncated]" in reason
    assert "AAPL" in reason
    assert "daily_bars" in reason
    assert "req_long_001" in reason
    # The full 600-character run of 'x' must not survive uncut.
    assert "x" * 600 not in reason


# --- TC-COMP-235 / DAC-E3-S5-4 --------------------------------------------


def test_each_typed_error_yields_a_distinguishable_reason_kind() -> None:
    """TC-COMP-235 / DAC-E3-S5-4: each of the four typed errors produces a
    stable, distinguishable error-kind portion, so `not_found` remains
    separable from a failed outcome downstream."""
    errors = {
        "not_found": InstrumentNotFound("x", provider_request_id="r1"),
        "credential_rejected": CredentialRejected("x", provider_request_id="r2"),
        "unavailable": ProviderUnavailable("x", provider_request_id="r3"),
        "contract_violation": ProviderContractViolation("x", provider_request_id="r4"),
    }

    reasons = {
        kind: compose_failure_reason(
            error, symbol="AAPL", data_type="daily_bars", redact=_identity_redact
        )
        for kind, error in errors.items()
    }

    # Every reason is distinct...
    assert len(set(reasons.values())) == len(reasons)
    # ...and each contains a kind marker that does not collide with another.
    kind_markers = {kind: _kind_marker(kind) for kind in reasons}
    for kind, reason in reasons.items():
        assert kind_markers[kind] in reason
        for other_kind, other_marker in kind_markers.items():
            if other_kind != kind:
                assert other_marker not in reason or other_marker == kind_markers[kind]


def _kind_marker(kind: str) -> str:
    return kind


# --- T006: composition-boundary tests ------------------------------------


def test_diagnostic_text_is_redacted_before_truncation() -> None:
    """T006: redaction happens before truncation -- a credential fixture
    sitting past the truncation boundary in the raw text must not survive
    because truncation ran first and left it in an untouched tail, nor
    because it was cut before redaction could see it whole. The composer
    must redact the *whole* diagnostic text first, then bound the
    (already-safe) result."""
    # Straddle the composer's actual truncation cut (500 minus the
    # truncation marker's length) with the fixture itself, so a
    # "truncate-then-redact" implementation slices the fixture in half --
    # leaving a recognisable, partial fragment in the truncated text where
    # redact can no longer match the full fixture string.
    # "redact-then-truncate" removes the whole fixture before any cut is
    # made, regardless of where the boundary falls.
    padding = "a" * (MAX_FAILURE_REASON_VARIABLE_TEXT - len("…[truncated]") - 10)
    text = f"{padding}{_CREDENTIAL_FIXTURE}more overflow text to exceed the five hundred char bound"
    error = ProviderUnavailable(text, provider_request_id="req_boundary_001")

    reason = compose_failure_reason(
        error, symbol="AAPL", data_type="daily_bars", redact=_redact_fixture
    )

    assert _CREDENTIAL_FIXTURE not in reason
    # Also assert no fragment of the fixture (e.g. a truncate-then-redact
    # implementation's surviving prefix) leaks through.
    assert _CREDENTIAL_FIXTURE[:10] not in reason


def test_text_at_or_below_bound_is_not_marked_truncated() -> None:
    """T006: diagnostic text at or below the 500-character bound is
    retained without a truncation marker."""
    text = "y" * MAX_FAILURE_REASON_VARIABLE_TEXT
    error = ProviderUnavailable(text, provider_request_id="req_bound_001")

    reason = compose_failure_reason(
        error, symbol="AAPL", data_type="daily_bars", redact=_identity_redact
    )

    assert "…[truncated]" not in reason


def test_redact_callback_never_receives_assembled_stable_fields() -> None:
    """T006: the redaction callable is invoked only with the variable
    diagnostic text -- never with the assembled symbol, data-type, or
    request-ID fields mixed in."""
    seen: list[str] = []

    def _spy_redact(text: str) -> str:
        seen.append(text)
        return text

    error = ProviderUnavailable("some diagnostic detail", provider_request_id="req_spy_001")

    compose_failure_reason(
        error,
        symbol="UNIQUE_SYMBOL_MARKER",
        data_type="UNIQUE_DATA_TYPE_MARKER",
        redact=_spy_redact,
    )

    assert len(seen) >= 1
    for observed in seen:
        assert "UNIQUE_SYMBOL_MARKER" not in observed
        assert "UNIQUE_DATA_TYPE_MARKER" not in observed
        assert "req_spy_001" not in observed


def test_composer_rejects_a_raw_exception_not_in_the_taxonomy() -> None:
    """T006: the composer accepts only the typed `MassiveError` taxonomy --
    a raw SDK-style exception (or any untyped error) is rejected rather
    than silently emitting an untyped reason."""
    with pytest.raises((TypeError, ValueError)):
        compose_failure_reason(
            ValueError("not a MassiveError"),  # type: ignore[arg-type]
            symbol="AAPL",
            data_type="daily_bars",
            redact=_identity_redact,
        )
