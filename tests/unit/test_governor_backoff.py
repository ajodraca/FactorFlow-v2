"""Exponential backoff tests for `RateLimitGovernor` (CAP-001-E3-S4).

Component design: `component-design-rate-limit-governor.md` section 2.5.
Every test uses `governor_fakes.FakeClock`/`FakeSleeper`/`SequenceJitter`
so backoff growth is exercised over virtual time only -- no test here
sleeps in real time or contacts a network.
"""

from __future__ import annotations

import pytest

from factorflow.ingestion.massive.errors import ProviderUnavailable
from factorflow.ingestion.rate_limit import GovernorSettings, Outcome, RateLimitGovernor
from tests.unit.governor_fakes import FakeClock, FakeSleeper, FlakySender, SequenceJitter


def _governor(
    requests_per_minute: int,
    clock: FakeClock,
    sleeper: FakeSleeper,
    *,
    max_attempts: int = 3,
    initial_backoff: float = 2.0,
    max_throttle_wait: float = 300.0,
    jitter: SequenceJitter | None = None,
) -> RateLimitGovernor:
    settings = GovernorSettings(
        requests_per_minute=requests_per_minute,
        max_attempts=max_attempts,
        initial_backoff_seconds=initial_backoff,
        max_throttle_wait_seconds=max_throttle_wait,
    )
    return RateLimitGovernor(
        settings,
        monotonic=clock,
        sleep=sleeper,
        jitter=jitter or SequenceJitter([0.0]),
    )


def _always_retryable(exc: BaseException) -> Outcome:
    return Outcome.RETRYABLE


# --- TC-COMP-228 / DAC-E3-8 ------------------------------------------------


def test_backoff_delay_grows_exponentially_with_full_jitter() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(
        60,
        clock,
        sleeper,
        max_attempts=3,
        initial_backoff=2.0,
        jitter=SequenceJitter([0.5, 0.25]),
    )
    send = FlakySender(fail_count=2)

    governor.execute(send, classify=_always_retryable)

    # cap doubles each attempt: 2.0 * 2**0, then 2.0 * 2**1; full jitter
    # scales the cap by the fixed sequence values above.
    assert sleeper.calls == [pytest.approx(1.0), pytest.approx(2.0)]


def test_successive_backoff_delays_are_not_identical() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    jitter = SequenceJitter([0.9, 0.1, 0.9, 0.1])
    governor = _governor(60, clock, sleeper, max_attempts=5, initial_backoff=1.0, jitter=jitter)
    send = FlakySender(fail_count=4)

    governor.execute(send, classify=_always_retryable)

    assert len(set(sleeper.calls)) > 1


# --- TC-COMP-229 / DAC-E3-S4-4 ----------------------------------------------


def test_no_fourth_send_after_the_default_attempt_limit() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper, max_attempts=3, jitter=SequenceJitter([0.0]))
    send = FlakySender(fail_count=1_000_000)

    with pytest.raises(ProviderUnavailable):
        governor.execute(send, classify=_always_retryable)

    assert send.calls == 3
