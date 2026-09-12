"""Throttle, retry and fatal-outcome tests for `RateLimitGovernor`
(CAP-001-E3-S4).

Component design: `component-design-rate-limit-governor.md` sections 2.3,
2.5. Every test uses `governor_fakes.FakeClock`/`FakeSleeper`/
`SequenceJitter` so throttle waits and backoff are exercised over virtual
time only -- no test here sleeps in real time or contacts a network.
"""

from __future__ import annotations

import pytest

from factorflow.ingestion.massive.errors import ProviderUnavailable
from factorflow.ingestion.rate_limit import GovernorSettings, Outcome, RateLimitGovernor
from tests.unit.governor_fakes import FakeClock, FakeSleeper, FlakySender, SequenceJitter


class _UnrelatedException(Exception):
    """An exception type carrying no provider knowledge at all, used to
    prove the governor never inspects exception type or fields."""


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


def _never_classify(exc: BaseException) -> Outcome:
    raise AssertionError("classify should not be called for a successful send")


def _always_throttled(exc: BaseException) -> Outcome:
    return Outcome.THROTTLED


def _always_retryable(exc: BaseException) -> Outcome:
    return Outcome.RETRYABLE


# --- TC-COMP-200 / DAC-E3-6 ----------------------------------------------


def test_repeated_throttled_outcomes_do_not_consume_attempts() -> None:
    """A `429` never counts as an attempt: even more throttled retries
    than the attempt limit still succeed once the provider stops
    throttling."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper, max_attempts=2, max_throttle_wait=1000.0)
    send = FlakySender(fail_count=5)

    result = governor.execute(send, classify=_always_throttled)

    assert result == "ok"
    assert send.calls == 6


# --- TC-COMP-201 / DAC-E3-7 / DAC-E3-S4-2 ---------------------------------


def test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter() -> None:
    """No stated delay: the wait reaches the next minute boundary, plus
    full jitter so queued retries do not resynchronise on it."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(
        60, clock, sleeper, max_throttle_wait=1000.0, jitter=SequenceJitter([0.5])
    )
    send = FlakySender(fail_count=1)

    governor.execute(send, classify=_always_throttled)

    assert sleeper.calls == [pytest.approx(90.0)]  # 60s boundary + 0.5 * 60s jitter


# --- TC-COMP-203 / DAC-E3-S4-1 --------------------------------------------


def test_stated_delay_is_honoured_exactly_without_jitter() -> None:
    """A provider-stated throttle delay is honoured exactly; jitter never
    applies to it (DAC-E3-S4-1)."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    jitter = SequenceJitter([0.9])  # would visibly perturb the delay if misapplied
    governor = _governor(60, clock, sleeper, max_throttle_wait=1000.0, jitter=jitter)
    send = FlakySender(fail_count=1)

    governor.execute(
        send,
        classify=_always_throttled,
        stated_delay_seconds=lambda exc: 12.5,
    )

    assert sleeper.calls == [pytest.approx(12.5)]
    assert jitter.calls == 0


# --- TC-COMP-226 / TC-COMP-227 / TC-COMP-231 / DAC-E3-9 / DAC-E3-S4-6 -----


def test_boundary_throttle_wait_exhausts_the_budget_and_raises() -> None:
    """Persistent throttling exhausts the throttle-wait budget rather than
    looping forever (DAC-E3-9, DAC-E3-S4-6)."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(
        60, clock, sleeper, max_throttle_wait=90.0, jitter=SequenceJitter([0.0])
    )
    send = FlakySender(fail_count=1_000_000)

    with pytest.raises(ProviderUnavailable):
        governor.execute(send, classify=_always_throttled)

    # Each unjittered boundary wait is 60s; the budget (90s) is exceeded
    # after the second wait (120s > 90s).
    assert sleeper.calls == [pytest.approx(60.0), pytest.approx(60.0)]


def test_stated_delay_throttle_wait_exhausts_the_budget_and_raises() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper, max_throttle_wait=25.0)
    send = FlakySender(fail_count=1_000_000)

    with pytest.raises(ProviderUnavailable):
        governor.execute(
            send,
            classify=_always_throttled,
            stated_delay_seconds=lambda exc: 10.0,
        )

    assert sleeper.calls == [pytest.approx(10.0), pytest.approx(10.0), pytest.approx(10.0)]


# --- TC-COMP-202 / TC-COMP-228 / TC-COMP-229 / DAC-E3-8 -------------------


def test_retryable_outcome_increments_attempts_and_retries_with_backoff() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper, max_attempts=3, initial_backoff=2.0)
    send = FlakySender(fail_count=2)

    result = governor.execute(send, classify=_always_retryable)

    assert result == "ok"
    assert send.calls == 3
    assert len(sleeper.calls) == 2


def test_retry_limit_exhausted_raises_and_no_fourth_send() -> None:
    """Three failures exhaust the limit; the fourth attempt is never
    made (DAC-E3-S4-4)."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper, max_attempts=3)
    send = FlakySender(fail_count=1_000_000)

    with pytest.raises(ProviderUnavailable):
        governor.execute(send, classify=_always_retryable)

    assert send.calls == 3


def test_fatal_outcome_reraises_immediately_without_wait_or_retry() -> None:
    """DAC-E3-S4-3: `FATAL` re-raises immediately, without wait or
    retry."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper)
    boom = RuntimeError("not found")

    def send() -> str:
        raise boom

    with pytest.raises(RuntimeError) as excinfo:
        governor.execute(send, classify=lambda exc: Outcome.FATAL)

    assert excinfo.value is boom
    assert sleeper.calls == []


# --- T005: provider-agnostic boundary tests -------------------------------


def test_governor_does_not_inspect_exception_type_only_the_classifier() -> None:
    """Given an unrelated exception class and a fixed classifier outcome,
    behaviour is identical to any other exception type: no provider
    knowledge leaked in."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper, max_attempts=2)
    send = FlakySender(fail_count=1, exception_factory=_UnrelatedException)

    result = governor.execute(send, classify=_always_retryable)

    assert result == "ok"
    assert send.calls == 2


def test_ok_returns_the_sender_value_without_retry() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper)

    result = governor.execute(lambda: 42, _never_classify)

    assert result == 42
    assert sleeper.calls == []
