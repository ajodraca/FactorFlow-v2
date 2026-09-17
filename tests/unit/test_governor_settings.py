"""`GovernorSettings.from_massive_settings` mapping tests (CAP-001-E3-S4).

IR-003: T007 names constructing `GovernorSettings` from the owner's
`MassiveSettings`, but no such construction existed. This covers the
factory that closes that gap, including the one field-name mismatch
between the two settings classes (`MassiveSettings.backoff_initial_seconds`
vs. `GovernorSettings.initial_backoff_seconds`).
"""

from __future__ import annotations

import pytest

from factorflow.config.settings import MassiveSettings
from factorflow.ingestion.rate_limit import GovernorSettings

KNOWN_API_KEY = "TEST-FIXTURE-CREDENTIAL-abc123"


@pytest.fixture
def massive_settings(monkeypatch: pytest.MonkeyPatch) -> MassiveSettings:
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KNOWN_API_KEY)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "45")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_MAX_ATTEMPTS", "5")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS", "3.5")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS", "120.0")
    return MassiveSettings(_env_file=None)  # type: ignore[call-arg]


def test_from_massive_settings_maps_every_field_correctly(
    massive_settings: MassiveSettings,
) -> None:
    """Each `MassiveSettings` field lands in the corresponding
    `GovernorSettings` field, including the `backoff_initial_seconds` ->
    `initial_backoff_seconds` rename."""
    governor_settings = GovernorSettings.from_massive_settings(massive_settings)

    assert governor_settings == GovernorSettings(
        requests_per_minute=45,
        max_attempts=5,
        initial_backoff_seconds=3.5,
        max_throttle_wait_seconds=120.0,
    )


def test_from_massive_settings_uses_massive_defaults(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """With only the required fields set, `MassiveSettings`'s own
    defaults (max_attempts=3, backoff_initial_seconds=2.0,
    max_throttle_wait_seconds=300.0) travel through the mapping
    unchanged."""
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KNOWN_API_KEY)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    monkeypatch.delenv("FACTORFLOW_MASSIVE_MAX_ATTEMPTS", raising=False)
    monkeypatch.delenv("FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS", raising=False)
    monkeypatch.delenv("FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS", raising=False)
    massive_settings = MassiveSettings(_env_file=None)  # type: ignore[call-arg]

    governor_settings = GovernorSettings.from_massive_settings(massive_settings)

    assert governor_settings == GovernorSettings(
        requests_per_minute=60,
        max_attempts=3,
        initial_backoff_seconds=2.0,
        max_throttle_wait_seconds=300.0,
    )
