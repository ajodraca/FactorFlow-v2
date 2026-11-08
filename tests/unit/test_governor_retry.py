"""Throttle, retry and fatal-outcome tests for `RateLimitGovernor`
(CAP-001-E3-S4).

Component design: `component-design-rate-limit-governor.md` sections 2.3,
2.5. Every test uses `governor_fakes.FakeClock`/`FakeSleeper`/
`SequenceJitter` so throttle waits and backoff are exercised over virtual
time only -- no test here sleeps in real time or contacts a network.
"""

from __future__ import annotations

import ast
import dataclasses
from collections.abc import Callable
from pathlib import Path

import pytest

import factorflow.ingestion.rate_limit as rate_limit_module
from factorflow.ingestion.massive.errors import ProviderRateLimited, ProviderUnavailable
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


# Implements CAP-003 TC-COMP-239
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


# Implements CAP-003 TC-COMP-235
# --- TC-COMP-203 / TC-COMP-231 / DAC-E3-9 / DAC-E3-S4-6 -------------------


def test_boundary_throttle_wait_exhausts_the_budget_and_raises() -> None:
    """Persistent throttling exhausts the throttle-wait budget rather than
    looping forever (DAC-E3-9, DAC-E3-S4-6)."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(
        60, clock, sleeper, max_throttle_wait=90.0, jitter=SequenceJitter([0.0]), now=clock
    )
    send = FlakySender(fail_count=1_000_000)

    with pytest.raises(ProviderRateLimited):
        governor.execute(send, classify=_always_throttled)

    # Each unjittered boundary wait is 60s and the budget (90s) is checked
    # before each wait (CAP-003): the second 60s wait would take the spent
    # total to 120s > 90s, so it is not taken.
    assert sleeper.calls == [pytest.approx(60.0)]


def test_stated_delay_throttle_wait_exhausts_the_budget_and_raises() -> None:
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper, max_throttle_wait=25.0, now=clock)
    send = FlakySender(fail_count=1_000_000)

    with pytest.raises(ProviderRateLimited):
        governor.execute(
            send,
            classify=_always_throttled,
            stated_delay_seconds=lambda exc: 10.0,
        )

    assert sleeper.calls == [pytest.approx(10.0), pytest.approx(10.0)]


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


# --- CAP-003 TC-COMP-236 / DAC-E8-S2-2: which exhaustion raises what -------

_THROTTLE_SEND_GUARD = 20


# Implements CAP-003 TC-COMP-236
def test_spent_budget_raises_provider_rate_limited_from_the_last_exception() -> None:
    """CAP-003 TC-COMP-236 / DAC-E8-S2-2: a spent throttle budget raises a
    `ProviderRateLimited` -- a `ProviderUnavailable` -- with the governor's
    fixed message, no provider request ID, and the last exception `send`
    raised as its `__cause__`."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(
        60, clock, sleeper, max_throttle_wait=90.0, jitter=SequenceJitter([0.0]), now=clock
    )
    raised: list[RuntimeError] = []

    def send() -> str:
        exc = RuntimeError(f"attempt {len(raised) + 1} failed")
        raised.append(exc)
        raise exc

    def classify(exc: BaseException) -> Outcome:
        if len(raised) > _THROTTLE_SEND_GUARD:
            raise AssertionError("throttling did not terminate")
        return Outcome.THROTTLED

    with pytest.raises(ProviderUnavailable) as excinfo:
        governor.execute(send, classify=classify)

    err = excinfo.value
    assert type(err) is ProviderRateLimited
    assert isinstance(err, ProviderUnavailable)
    assert err.provider_request_id is None
    assert str(err) == (
        "The provider kept rate-limiting requests until this stock's throttle wait "
        "budget was spent."
    )
    assert err.__cause__ is raised[-1]
    assert len(raised) == 2


# Implements CAP-003 TC-COMP-236
def test_exhausted_attempts_raise_a_provider_unavailable_that_is_not_rate_limited() -> None:
    """CAP-003 TC-COMP-236 / DAC-E8-S2-2: attempt exhaustion keeps raising a
    plain `ProviderUnavailable` with the delivered message, never the
    throttle budget's subclass."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(60, clock, sleeper, max_attempts=3, now=clock)
    send = FlakySender(fail_count=1_000_000)

    with pytest.raises(ProviderUnavailable) as excinfo:
        governor.execute(send, classify=_always_retryable)

    err = excinfo.value
    assert send.calls == 3
    assert type(err) is ProviderUnavailable
    assert not isinstance(err, ProviderRateLimited)
    assert str(err) == "The provider failed 3 consecutive attempts."


# --- CAP-003 TC-COMP-237 / DAC-E8-S2-3: one budget per stock ---------------


def _guarded_throttle(send: FlakySender) -> Callable[[BaseException], Outcome]:
    """An always-`THROTTLED` classifier that fails the test once `send` was
    called more than `_THROTTLE_SEND_GUARD` times, so a governor that never
    spends its budget fails instead of looping forever."""

    def classify(exc: BaseException) -> Outcome:
        if send.calls > _THROTTLE_SEND_GUARD:
            raise AssertionError("throttling did not terminate")
        return Outcome.THROTTLED

    return classify


# Implements CAP-003 TC-COMP-237
def test_one_throttle_budget_spans_every_execute_until_the_next_start() -> None:
    """CAP-003 TC-COMP-237 / DAC-E8-S2-3: the budget is spent across every
    `execute` call between two `start_throttle_budget()` calls, never per
    request. 180s spent by a first request leaves two 60s waits for a
    second, which raises on its third (the 300s total is taken: the check
    is `>`, not `>=`); a new start lets a third request wait again."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(
        60, clock, sleeper, max_throttle_wait=300.0, jitter=SequenceJitter([0.0]), now=clock
    )

    governor.start_throttle_budget()
    assert governor.execute(FlakySender(fail_count=3), classify=_always_throttled) == "ok"
    assert sleeper.calls == [pytest.approx(60.0)] * 3

    always_failing = FlakySender(fail_count=1_000_000)
    with pytest.raises(ProviderRateLimited):
        governor.execute(always_failing, classify=_guarded_throttle(always_failing))
    assert sleeper.calls == [pytest.approx(60.0)] * 5
    assert sum(sleeper.calls) == pytest.approx(300.0)

    governor.start_throttle_budget()
    assert governor.execute(FlakySender(fail_count=1), classify=_always_throttled) == "ok"
    assert sleeper.calls[5:] == [pytest.approx(60.0)]


# --- CAP-003 TC-COMP-238 / DAC-E8-S2-4: jitter never overruns the budget ---


# Implements CAP-003 TC-COMP-238
def test_jittered_boundary_waits_never_take_the_sleeps_past_the_budget() -> None:
    """CAP-003 TC-COMP-238 / DAC-E8-S2-4: with jitter `[0.999]` each
    boundary wait is nearly doubled, yet the sleeps total at most the 300s
    budget, and the next delay, which the governor declined to sleep, would
    have crossed it (review v14 FINDING-55)."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(
        60, clock, sleeper, max_throttle_wait=300.0, jitter=SequenceJitter([0.999]), now=clock
    )
    send = FlakySender(fail_count=1_000_000)

    with pytest.raises(ProviderRateLimited):
        governor.execute(send, classify=_guarded_throttle(send))

    # The declined delay, computed from the literal formula, never through
    # the governor (which would also consume the jitter sequence).
    boundary = 60.0 - clock() % 60.0
    next_delay = boundary + 0.999 * boundary
    assert sum(sleeper.calls) <= 300.0
    assert sum(sleeper.calls) + next_delay > 300.0


# --- CAP-003 TC-COMP-242 / DAC-E8-S2-8: still provider-agnostic ------------


# Implements CAP-003 TC-COMP-242
def test_governor_inspects_no_exception_and_logs_nothing() -> None:
    """CAP-003 TC-COMP-242 / DAC-E8-S2-8: the governor still never inspects
    an exception -- it imports `ProviderRateLimited` only to raise it --
    logs nothing, carries no URL or credential in any string, and keeps its
    settings."""
    tree = ast.parse(Path(rate_limit_module.__file__).read_text())
    nodes = list(ast.walk(tree))

    handlers = [node for node in nodes if isinstance(node, ast.ExceptHandler)]
    assert len(handlers) == 1
    assert isinstance(handlers[0].type, ast.Name)
    assert handlers[0].type.id == "BaseException"

    called = {
        node.func.id
        for node in nodes
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
    }
    assert called.isdisjoint({"isinstance", "issubclass", "type"})

    error_imports = [
        node
        for node in nodes
        if isinstance(node, ast.ImportFrom) and node.module == "factorflow.ingestion.massive.errors"
    ]
    assert len(error_imports) == 1
    assert {alias.name for alias in error_imports[0].names} == {
        "ProviderRateLimited",
        "ProviderUnavailable",
    }

    in_a_raise = {
        id(inner)
        for node in nodes
        if isinstance(node, ast.Raise) and node.exc is not None
        for inner in ast.walk(node.exc)
    }
    rate_limited_names = [
        node for node in nodes if isinstance(node, ast.Name) and node.id == "ProviderRateLimited"
    ]
    assert rate_limited_names
    assert all(id(node) in in_a_raise for node in rate_limited_names)

    imported = {
        alias.name for node in nodes if isinstance(node, ast.Import) for alias in node.names
    }
    imported |= {node.module or "" for node in nodes if isinstance(node, ast.ImportFrom)}
    assert "logging" not in imported
    attributes = {node.attr for node in nodes if isinstance(node, ast.Attribute)}
    assert "getLogger" not in called | attributes

    strings = [
        node.value
        for node in nodes
        if isinstance(node, ast.Constant) and isinstance(node.value, str)
    ]
    for text in strings:
        assert "://" not in text
        assert "api_key" not in text
        assert "Bearer" not in text

    assert [field.name for field in dataclasses.fields(GovernorSettings)] == [
        "requests_per_minute",
        "max_attempts",
        "initial_backoff_seconds",
        "max_throttle_wait_seconds",
    ]


# --- CAP-003 rate-limit-governor section 2.3: what is charged --------------


def test_retryable_backoff_and_its_permit_wait_are_not_charged_to_the_throttle_budget() -> None:
    """CAP-003 DAC-E8-5 (rate-limit-governor section 2.3): only a throttle
    wait -- from the start of the throttle sleep to the moment the retried
    request holds its permit -- is charged. A 60s throttle wait is charged;
    the 1.0s backoff after a `RETRYABLE` outcome is not, so at 61s the next
    59s boundary wait still fits the 119.5s budget (60 + 59 = 119) and only
    the following 90s wait is declined. The half second of slack is less
    than the backoff, so charging the backoff (60 + 1 + 59 = 120) would
    decline the 59s wait."""
    clock = FakeClock()
    sleeper = FakeSleeper(clock)
    governor = _governor(
        60,
        clock,
        sleeper,
        max_throttle_wait=119.5,
        initial_backoff=2.0,
        jitter=SequenceJitter([0.0, 0.5]),
        now=clock,
    )
    first = FlakySender(fail_count=2)

    def throttled_then_retryable(exc: BaseException) -> Outcome:
        return Outcome.THROTTLED if first.calls == 1 else Outcome.RETRYABLE

    assert governor.execute(first, classify=throttled_then_retryable) == "ok"

    always_failing = FlakySender(fail_count=1_000_000)
    with pytest.raises(ProviderRateLimited):
        governor.execute(always_failing, classify=_guarded_throttle(always_failing))

    assert sleeper.calls == [pytest.approx(60.0), pytest.approx(1.0), pytest.approx(59.0)]
