"""Implements TC-COMP-326 (rejection half, DAC-E1-S3-4), the four timing
invariants from component design section 2.2a (DAC-E1-S3-1's Settings-level
counterpart), and the ApiSettings.port / DatabaseSettings.pool_min/pool_max
bounds.
"""

import pytest

from factorflow.config.settings import (
    ApiSettings,
    ConfigurationError,
    DatabaseSettings,
    MassiveSettings,
    Settings,
)


def _base_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """The minimum environment for `Settings` to construct successfully."""
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://u:p@localhost/db")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "test-key")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")


class TestNonLoopbackHostRejected:
    @pytest.mark.parametrize("host", ["0.0.0.0", "10.0.0.5", "example.com"])
    def test_non_loopback_host_rejected(self, monkeypatch: pytest.MonkeyPatch, host: str) -> None:
        monkeypatch.setenv("FACTORFLOW_API_HOST", host)
        with pytest.raises(ConfigurationError):
            ApiSettings(_env_file=None)  # type: ignore[call-arg]

    @pytest.mark.parametrize("host", ["127.0.0.1", "localhost", "::1"])
    def test_loopback_hosts_accepted(self, monkeypatch: pytest.MonkeyPatch, host: str) -> None:
        monkeypatch.setenv("FACTORFLOW_API_HOST", host)
        assert ApiSettings(_env_file=None).host == host  # type: ignore[call-arg]


class TestTimingInvariants:
    """Component design section 2.2a, invariants 1-4."""

    def test_invariant_1_stale_after_must_exceed_heartbeat_times_three(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        _base_env(monkeypatch)
        monkeypatch.setenv("FACTORFLOW_RUN_HEARTBEAT_SECONDS", "60")
        monkeypatch.setenv("FACTORFLOW_RUN_STALE_AFTER_SECONDS", "180")  # exactly 3x, not >
        with pytest.raises(ConfigurationError, match="HEARTBEAT"):
            Settings(_env_file=None)  # type: ignore[call-arg]

    def test_invariant_2_stale_after_must_exceed_worst_case(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        _base_env(monkeypatch)
        # worst_case = max_attempts * timeout * 4 + max_throttle_wait
        #            = 3 * 30 * 4 + 300 = 660
        monkeypatch.setenv("FACTORFLOW_RUN_HEARTBEAT_SECONDS", "60")
        monkeypatch.setenv("FACTORFLOW_RUN_STALE_AFTER_SECONDS", "660")  # exactly worst case
        with pytest.raises(ConfigurationError) as exc_info:
            Settings(_env_file=None)  # type: ignore[call-arg]
        assert "660" in str(exc_info.value)

    def test_invariant_3_poll_interval_must_be_less_than_stale_after(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        _base_env(monkeypatch)
        monkeypatch.setenv("FACTORFLOW_RUN_STALE_AFTER_SECONDS", "900")
        monkeypatch.setenv("FACTORFLOW_RUN_POLL_INTERVAL_SECONDS", "900")
        with pytest.raises(ConfigurationError, match="POLL_INTERVAL"):
            Settings(_env_file=None)  # type: ignore[call-arg]

    @pytest.mark.parametrize(
        "var,value",
        [
            ("FACTORFLOW_MASSIVE_TIMEOUT_SECONDS", "0"),
            ("FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS", "-1"),
            ("FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS", "0"),
            ("FACTORFLOW_RUN_HEARTBEAT_SECONDS", "0"),
            ("FACTORFLOW_RUN_STALE_AFTER_SECONDS", "-5"),
            ("FACTORFLOW_RUN_POLL_INTERVAL_SECONDS", "0"),
        ],
    )
    def test_invariant_4_non_positive_timing_values_rejected(
        self, monkeypatch: pytest.MonkeyPatch, var: str, value: str
    ) -> None:
        _base_env(monkeypatch)
        monkeypatch.setenv(var, value)
        with pytest.raises(ConfigurationError):
            Settings(_env_file=None)  # type: ignore[call-arg]

    @pytest.mark.parametrize(
        "var",
        [
            "FACTORFLOW_MASSIVE_TIMEOUT_SECONDS",
            "FACTORFLOW_RUN_HEARTBEAT_SECONDS",
            "FACTORFLOW_RUN_POLL_INTERVAL_SECONDS",
        ],
    )
    def test_invariant_4_sub_one_second_values_rejected(
        self, monkeypatch: pytest.MonkeyPatch, var: str
    ) -> None:
        """Invariant 4 requires timeout, heartbeat and poll_interval each
        >= 1 second specifically -- positive but under a second must still
        be rejected."""
        _base_env(monkeypatch)
        monkeypatch.setenv(var, "0.5")
        with pytest.raises(ConfigurationError):
            Settings(_env_file=None)  # type: ignore[call-arg]


class TestFieldBounds:
    @pytest.mark.parametrize("port", [0, 65536, -1])
    def test_api_port_out_of_range_rejected(
        self, monkeypatch: pytest.MonkeyPatch, port: int
    ) -> None:
        monkeypatch.setenv("FACTORFLOW_API_PORT", str(port))
        with pytest.raises(ConfigurationError):
            ApiSettings(_env_file=None)  # type: ignore[call-arg]

    @pytest.mark.parametrize("port", [1, 8000, 65535])
    def test_api_port_in_range_accepted(self, monkeypatch: pytest.MonkeyPatch, port: int) -> None:
        monkeypatch.setenv("FACTORFLOW_API_PORT", str(port))
        assert ApiSettings(_env_file=None).port == port  # type: ignore[call-arg]

    @pytest.mark.parametrize(
        "var", ["FACTORFLOW_DATABASE_POOL_MIN", "FACTORFLOW_DATABASE_POOL_MAX"]
    )
    def test_database_pool_bounds_reject_below_one(
        self, monkeypatch: pytest.MonkeyPatch, var: str
    ) -> None:
        monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://u:p@localhost/db")
        monkeypatch.setenv(var, "0")
        with pytest.raises(ConfigurationError):
            DatabaseSettings(_env_file=None)  # type: ignore[call-arg]

    def test_requests_per_minute_zero_rejected(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Component design section 7: 'requests per minute 0 ... raises'."""
        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "test-key")
        monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "0")
        with pytest.raises(ConfigurationError):
            MassiveSettings(_env_file=None)  # type: ignore[call-arg]

    def test_max_attempts_zero_rejected(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Component design section 7: 'attempts 0 ... raises'."""
        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "test-key")
        monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
        monkeypatch.setenv("FACTORFLOW_MASSIVE_MAX_ATTEMPTS", "0")
        with pytest.raises(ConfigurationError):
            MassiveSettings(_env_file=None)  # type: ignore[call-arg]
