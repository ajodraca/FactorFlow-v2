"""Deterministic collaborators for `RateLimitGovernor` tests (CAP-001-E3-S4).

Every governor test uses these instead of the real wall clock, so pacing,
throttle-wait and backoff behaviour is exercised without any test ever
sleeping in real time or touching a network (component design
`component-design-rate-limit-governor.md` section 7).
"""

from __future__ import annotations

from collections.abc import Sequence


class FakeClock:
    """A virtual monotonic clock. Time advances only when `advance` is
    called directly, or indirectly through a `FakeSleeper` bound to the
    same clock -- never on its own."""

    def __init__(self, start: float = 0.0) -> None:
        self._now = start

    def __call__(self) -> float:
        return self._now

    def advance(self, seconds: float) -> None:
        if seconds < 0:
            raise ValueError("a virtual clock cannot move backwards")
        self._now += seconds


class FakeSleeper:
    """A sleep collaborator that advances a `FakeClock` by the requested
    duration instead of blocking. Every call is recorded so a test can
    assert on the exact sequence of computed delays."""

    def __init__(self, clock: FakeClock) -> None:
        self._clock = clock
        self.calls: list[float] = []

    def __call__(self, seconds: float) -> None:
        self.calls.append(seconds)
        self._clock.advance(seconds)


class FlakySender:
    """A `send` callable that raises a caller-supplied exception for the
    first `fail_count` calls, then returns `result`. Used to simulate a
    provider that throttles or fails transiently before succeeding (or
    never succeeds, when `fail_count` exceeds the test's attempt/throttle
    budget)."""

    def __init__(
        self,
        fail_count: int,
        *,
        exception_factory: type[BaseException] = RuntimeError,
        result: object = "ok",
    ) -> None:
        self.fail_count = fail_count
        self._exception_factory = exception_factory
        self._result = result
        self.calls = 0

    def __call__(self) -> object:
        self.calls += 1
        if self.calls <= self.fail_count:
            raise self._exception_factory(f"attempt {self.calls} failed")
        return self._result


class SequenceJitter:
    """A deterministic jitter source cycling through a fixed sequence of
    values, each expected in `[0, 1)`, so a test can assert an exact
    computed delay instead of only a random range. Cycles once exhausted,
    so a short sequence such as `[0.0]` is a valid "no jitter" stub."""

    def __init__(self, values: Sequence[float]) -> None:
        if not values:
            raise ValueError("SequenceJitter needs at least one value")
        self._values = list(values)
        self._index = 0
        self.calls = 0

    def __call__(self) -> float:
        value = self._values[self._index % len(self._values)]
        self._index += 1
        self.calls += 1
        return value
