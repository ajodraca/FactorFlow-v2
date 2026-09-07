"""Implements TC-COMP-298, TC-COMP-323 (DAC-E1-7, DAC-E1-S3-1).

A missing required configuration value fails process start naming the
variable it was missing, but never a value -- because there is no value to
leak, only its absence.
"""

import pytest
from pydantic import ValidationError

from factorflow.config.settings import DatabaseSettings, MassiveSettings


def test_missing_database_url_names_the_variable(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("FACTORFLOW_DATABASE_URL", raising=False)
    with pytest.raises(ValidationError) as exc_info:
        DatabaseSettings(_env_file=None)  # type: ignore[call-arg]
    message = str(exc_info.value)
    assert "url" in message.lower()


def test_missing_massive_api_key_names_the_variable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("FACTORFLOW_MASSIVE_API_KEY", raising=False)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    with pytest.raises(ValidationError) as exc_info:
        MassiveSettings(_env_file=None)  # type: ignore[call-arg]
    message = str(exc_info.value)
    assert "api_key" in message.lower()


def test_missing_requests_per_minute_names_the_variable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "test-secret-value")
    monkeypatch.delenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", raising=False)
    with pytest.raises(ValidationError) as exc_info:
        MassiveSettings(_env_file=None)  # type: ignore[call-arg]
    message = str(exc_info.value)
    assert "requests_per_minute" in message.lower()
