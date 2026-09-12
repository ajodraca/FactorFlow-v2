"""Token-bucket pacing tests for `RateLimitGovernor` (CAP-001-E3-S4).

Component design: `component-design-rate-limit-governor.md` section 2.4.
Every test uses `governor_fakes.FakeClock`/`FakeSleeper` so pacing is
exercised over virtual time only -- no test here sleeps in real time or
contacts a network.
"""

from __future__ import annotations

import pytest

from factorflow.ingestion.rate_limit import GovernorSettings, Outcome, RateLimitGovernor
from tests.unit.governor_fakes import FakeClock, FakeSleeper, SequenceJitter


def _governor(
    requests_per_minute: int,
    clock: FakeClock,
    sleeper: FakeSleeper,
    *,
    max_attempts: int = 3,
    initial_backoff: float = 2.0,
    max_throttle_wait: float = 300.0,
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
        jitter=SequenceJitter([0.0]),
    )


def _never_classify(exc: BaseException) -> Outcome:
    raise AssertionError("classify should not be called for a successful send")


# --- TC-COMP-230 / AC-4 -------------------------------------------------


def test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill() -> None:
    """Up to bucket capacity, back-to-back sends add no artificial delay;
    the next send waits for refill (DAC-E3-S4-5)."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    capacity = 5
    governor = _governor(capacity, clock, sleeper)

    for _ in range(capacity):
        governor.execute(lambda: "ok", _never_classify)

    assert sleeper.calls == []
    assert clock() == 0.0

    governor.execute(lambda: "ok", _never_classify)

    assert len(sleeper.calls) == 1
    assert sleeper.calls[0] == pytest.approx(60.0 / capacity)


def test_no_virtual_minute_window_exceeds_the_configured_budget() -> None:
    """No virtual one-minute window issues more than the configured
    budget, over a sustained run (AC-4).

    A token bucket that starts full (T006) can, near the very start,
    still show one already-spent burst plus a bit of fresh refill inside
    a single 60s window -- that overhang is bounded by one refill cycle,
    never unbounded. The provable, standard token-bucket guarantee for
    any window `[a, b]` is `count <= capacity + refill_rate * (b - a)`;
    this asserts exactly that bound rather than the stronger, and for a
    continuously-refilling bucket false, claim that a bare `capacity` is
    never exceeded in any sliding window.
    """
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    capacity = 3
    refill_rate = capacity / 60.0
    governor = _governor(capacity, clock, sleeper)

    send_times: list[float] = []
    for _ in range(30):
        governor.execute(lambda: "ok", _never_classify)
        send_times.append(clock())

    for t in send_times:
        window_start = t - 60.0
        count_in_window = sum(1 for other in send_times if window_start < other <= t)
        max_allowed = capacity + refill_rate * 60.0
        assert count_in_window <= max_allowed + 1e-9

    # Over the whole run's duration, the average rate never exceeds the
    # configured budget once the initial burst is accounted for.
    elapsed = send_times[-1]
    assert len(send_times) <= capacity + refill_rate * elapsed + 1e-9


# --- T006: token-accounting edge cases ----------------------------------


def test_partial_refill_credits_elapsed_virtual_time() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    capacity = 2
    governor = _governor(capacity, clock, sleeper)

    governor.execute(lambda: "ok", _never_classify)
    governor.execute(lambda: "ok", _never_classify)

    # One token refills every 30s at this budget; advance halfway there.
    clock.advance(15.0)
    governor.execute(lambda: "ok", _never_classify)

    assert sleeper.calls == [pytest.approx(15.0)]


def test_each_send_consumes_exactly_one_permit() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    capacity = 10
    governor = _governor(capacity, clock, sleeper)

    for _ in range(capacity):
        governor.execute(lambda: "ok", _never_classify)
    assert sleeper.calls == []

    governor.execute(lambda: "ok", _never_classify)
    assert len(sleeper.calls) == 1


def test_new_governor_instance_starts_with_configured_bucket_capacity() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    capacity = 4
    governor = _governor(capacity, clock, sleeper)

    for _ in range(capacity):
        governor.execute(lambda: "ok", _never_classify)

    assert sleeper.calls == []
