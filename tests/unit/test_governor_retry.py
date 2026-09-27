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
    now: FakeClock | None = None,
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
        # A fresh, never-advanced `FakeClock` starting at 0.0 unless the
        # test supplies its own wall-clock phase (IR-001): this keeps
        # every pre-existing test's boundary computation deterministic
        # (remainder always 0, boundary always 60s) without each test
        # having to wire up a wall-clock fake it does not care about.
        now=now or FakeClock(),
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


def test_throttled_outcomes_do_not_share_the_retry_attempt_counter() -> None:
    """DAC-E3-6: throttling must never partially exhaust the retry
    budget. Three `THROTTLED` outcomes exceed `max_attempts=2`, but a
    single `RETRYABLE` failure afterwards must still be allowed to
    retry -- proving the throttle path never touches the attempt
    counter at all, not merely that it tolerates more throttles than
    the limit on its own."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper, max_attempts=2, max_throttle_wait=1000.0)
    send = FlakySender(fail_count=4)

    def classify(exc: BaseException) -> Outcome:
        return Outcome.THROTTLED if send.calls <= 3 else Outcome.RETRYABLE

    result = governor.execute(send, classify=classify)

    assert result == "ok"
    assert send.calls == 5


# --- TC-COMP-201 / DAC-E3-7 / DAC-E3-S4-2 ---------------------------------


def test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter() -> None:
    """No stated delay: the wait reaches the next minute boundary, plus
    jitter so queued retries do not resynchronise on it. The jitter here
    is additive over the boundary wait (range `[boundary, 2*boundary]`),
    a deliberate deviation from design section 2.5's literal "full
    jitter" wording -- see IR-005 and `_boundary_wait_with_jitter`."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    wall_clock = FakeClock()  # remainder 0.0 -> a full 60s to the boundary
    governor = _governor(
        60,
        clock,
        sleeper,
        max_throttle_wait=1000.0,
        jitter=SequenceJitter([0.5]),
        now=wall_clock,
    )
    send = FlakySender(fail_count=1)

    governor.execute(send, classify=_always_throttled)

    assert sleeper.calls == [pytest.approx(90.0)]  # 60s boundary + 0.5 * 60s jitter


def test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time() -> None:
    """IR-001: the boundary wait must track the provider's actual
    per-minute window via wall-clock time, not an arbitrary phase of the
    governor's own lifetime. Constructing the governor mid-minute must
    still land on the true wall-clock boundary. Replacing the whole
    computation with a constant (the reviewer's Probe A) fails this
    test, because the wait pinned here is not the degenerate `elapsed ==
    0` case every other test happens to exercise."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    # 125s of wall-clock time has elapsed: 5s past the top of a minute,
    # so only 55s remain until the next boundary -- not a full 60s.
    wall_clock = FakeClock(start=125.0)
    governor = _governor(
        60,
        clock,
        sleeper,
        max_throttle_wait=1000.0,
        jitter=SequenceJitter([0.5]),
        now=wall_clock,
    )
    send = FlakySender(fail_count=1)

    governor.execute(send, classify=_always_throttled)

    # 55s boundary + 0.5 * 55s additive jitter (IR-005) = 82.5s.
    assert sleeper.calls == [pytest.approx(82.5)]


# --- TC-COMP-227 / DAC-E3-S4-2 --------------------------------------------


def test_successive_boundary_throttle_waits_receive_independent_jitter() -> None:
    """TC-COMP-227 / DAC-E3-S4-2: queued retries throttled behind the same
    minute boundary must not resynchronise onto the same instant. Two
    boundary waits driven through a varying jitter source must produce
    different delays. A frozen jitter draw -- the literal
    resynchronisation defect this criterion exists to catch -- fails
    this test, because the second wait would equal the first instead of
    differing from it (previously this label sat on IR-004's
    budget-exhaustion tests, which pin jitter to a fixed `0.0` and so
    cannot observe any variation at all)."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(
        60,
        clock,
        sleeper,
        max_throttle_wait=1000.0,
        jitter=SequenceJitter([0.2, 0.8]),
    )
    send = FlakySender(fail_count=2)

    governor.execute(send, classify=_always_throttled)

    # Both waits are computed from the same 60s boundary (the wall clock
    # never advances between them), so only jitter distinguishes them:
    # 60 + 0.2*60 = 72.0, then 60 + 0.8*60 = 108.0.
    assert sleeper.calls == [pytest.approx(72.0), pytest.approx(108.0)]
    assert sleeper.calls[0] != pytest.approx(sleeper.calls[1])


# --- TC-COMP-226 / DAC-E3-S4-1 --------------------------------------------


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


# --- TC-COMP-203 / TC-COMP-231 / DAC-E3-9 / DAC-E3-S4-6 -------------------


def test_boundary_throttle_wait_exhausts_the_budget_and_raises() -> None:
    """Persistent throttling exhausts the throttle-wait budget rather than
    looping forever (DAC-E3-9, DAC-E3-S4-6)."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper, max_throttle_wait=90.0, jitter=SequenceJitter([0.0]))
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


def test_zero_stated_delay_throttle_wait_is_bounded() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(1, clock, sleeper, max_throttle_wait=1.0)
    send = FlakySender(fail_count=1_000_000)

    def classify(exc: BaseException) -> Outcome:
        if send.calls > 2:
            raise AssertionError("zero-delay throttling did not terminate")
        return Outcome.THROTTLED

    with pytest.raises(ProviderUnavailable):
        governor.execute(
            send,
            classify=classify,
            stated_delay_seconds=lambda exc: 0.0,
        )

    assert send.calls == 2


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
