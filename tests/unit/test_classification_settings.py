"""Implements TC-COMP-082 (Invalid poll interval settings fail naming the variable).

Traces to AC-10 and DAC-E2-S8-7: poll below 1 second, or poll not strictly below the
build timeout, fails at load naming the variable and never its value.
"""

import pytest

from factorflow.classification.settings import ClassificationSettings
from factorflow.config.settings import ConfigurationError, _EnvNamedSettings

POLL = "FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS"
TIMEOUT = "FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS"


@pytest.fixture(autouse=True)
def _clean_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv(POLL, raising=False)
    monkeypatch.delenv(TIMEOUT, raising=False)


def _load() -> ClassificationSettings:
    return ClassificationSettings(_env_file=None)  # type: ignore[call-arg]


def test_defaults_are_five_and_three_hundred_seconds() -> None:
    settings = _load()
    assert settings.poll_interval_seconds == 5.0
    assert settings.build_timeout_seconds == 300.0


def test_valid_pair_is_accepted(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(POLL, "2.5")
    monkeypatch.setenv(TIMEOUT, "10")
    settings = _load()
    assert settings.poll_interval_seconds == 2.5
    assert settings.build_timeout_seconds == 10.0


def test_one_second_lower_bounds_are_accepted(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(POLL, "1")
    monkeypatch.setenv(TIMEOUT, "1.5")
    settings = _load()
    assert settings.poll_interval_seconds == 1.0
    assert settings.build_timeout_seconds == 1.5


# Implements TC-COMP-082
def test_poll_below_one_second_names_variable_not_value(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(POLL, "0.5")
    with pytest.raises(ConfigurationError) as excinfo:
        _load()
    assert POLL in str(excinfo.value)
    assert "0.5" not in str(excinfo.value)


# Implements TC-COMP-082
def test_poll_above_timeout_names_both_variables_not_values(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv(POLL, "45")
    monkeypatch.setenv(TIMEOUT, "30")
    with pytest.raises(ConfigurationError) as excinfo:
        _load()
    message = str(excinfo.value)
    assert POLL in message
    assert TIMEOUT in message
    assert "45" not in message
    assert "30" not in message


# Implements TC-COMP-082
def test_poll_equal_to_timeout_is_refused(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(POLL, "60")
    monkeypatch.setenv(TIMEOUT, "60")
    with pytest.raises(ConfigurationError) as excinfo:
        _load()
    assert POLL in str(excinfo.value)
    assert TIMEOUT in str(excinfo.value)


def test_timeout_below_one_second_names_variable_not_value(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv(TIMEOUT, "0.5")
    with pytest.raises(ConfigurationError) as excinfo:
        _load()
    assert TIMEOUT in str(excinfo.value)
    assert POLL not in str(excinfo.value)
    assert "0.5" not in str(excinfo.value)


def test_non_numeric_poll_names_variable_not_value(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(POLL, "abc")
    with pytest.raises(ConfigurationError) as excinfo:
        _load()
    assert POLL in str(excinfo.value)
    assert "abc" not in str(excinfo.value)


def test_class_uses_the_shared_base_and_prefix() -> None:
    assert issubclass(ClassificationSettings, _EnvNamedSettings)
    assert ClassificationSettings.model_config["env_prefix"] == "FACTORFLOW_CLASSIFICATION_"
