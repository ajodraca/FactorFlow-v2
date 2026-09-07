"""Implements TC-COMP-014 (default half), TC-COMP-326 (DAC-E1-S3-4),
and the timing defaults from component design section 2.2a.
"""

from factorflow.config.settings import ApiSettings, MassiveSettings, RunSettings


def test_default_bind_is_loopback(monkeypatch) -> None:  # type: ignore[no-untyped-def]
    monkeypatch.delenv("FACTORFLOW_API_HOST", raising=False)
    assert ApiSettings(_env_file=None).host == "127.0.0.1"  # type: ignore[call-arg]


def test_timing_defaults_match_the_canonical_set(monkeypatch) -> None:  # type: ignore[no-untyped-def]
    """Component design section 2.2a: the canonical timing set, verbatim."""
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "test-key")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    for var in (
        "FACTORFLOW_MASSIVE_TIMEOUT_SECONDS",
        "FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS",
        "FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS",
        "FACTORFLOW_MASSIVE_MAX_ATTEMPTS",
        "FACTORFLOW_RUN_HEARTBEAT_SECONDS",
        "FACTORFLOW_RUN_STALE_AFTER_SECONDS",
        "FACTORFLOW_RUN_POLL_INTERVAL_SECONDS",
    ):
        monkeypatch.delenv(var, raising=False)

    massive = MassiveSettings(_env_file=None)  # type: ignore[call-arg]
    run = RunSettings(_env_file=None)  # type: ignore[call-arg]

    assert massive.timeout_seconds == 30.0
    assert massive.backoff_initial_seconds == 2.0
    assert massive.max_throttle_wait_seconds == 300.0
    assert massive.max_attempts == 3
    assert run.heartbeat_seconds == 60.0
    assert run.stale_after_seconds == 900.0
    assert run.poll_interval_seconds == 5.0
