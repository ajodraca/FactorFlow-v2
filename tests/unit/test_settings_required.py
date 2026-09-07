"""Implements TC-COMP-298, TC-COMP-323 (DAC-E1-7, DAC-E1-S3-1).

A missing required configuration value fails process start naming the
*environment variable* it was missing, but never a value -- because there
is no value to leak, only its absence.
"""

import pytest

from factorflow.config.settings import ConfigurationError, DatabaseSettings, MassiveSettings


def test_missing_database_url_names_the_variable(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("FACTORFLOW_DATABASE_URL", raising=False)
    with pytest.raises(ConfigurationError) as exc_info:
        DatabaseSettings(_env_file=None)  # type: ignore[call-arg]
    assert "FACTORFLOW_DATABASE_URL" in str(exc_info.value)


def test_missing_massive_api_key_names_the_variable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("FACTORFLOW_MASSIVE_API_KEY", raising=False)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    with pytest.raises(ConfigurationError) as exc_info:
        MassiveSettings(_env_file=None)  # type: ignore[call-arg]
    assert "FACTORFLOW_MASSIVE_API_KEY" in str(exc_info.value)


def test_missing_requests_per_minute_names_the_variable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "test-secret-value")
    monkeypatch.delenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", raising=False)
    with pytest.raises(ConfigurationError) as exc_info:
        MassiveSettings(_env_file=None)  # type: ignore[call-arg]
    assert "FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE" in str(exc_info.value)


def test_malformed_present_credential_never_echoes_the_value(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E1-7's "never its value" half needs a *present* value to have
    anything to leak -- the missing-value cases above have no value at all.
    A malformed sibling field is enough to trigger a load failure while the
    credential itself is present and valid."""
    known_value = "PRESENT-BUT-A-SIBLING-FIELD-IS-MALFORMED"
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", known_value)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "not-a-number")
    with pytest.raises(ConfigurationError) as exc_info:
        MassiveSettings(_env_file=None)  # type: ignore[call-arg]
    assert known_value not in str(exc_info.value)
