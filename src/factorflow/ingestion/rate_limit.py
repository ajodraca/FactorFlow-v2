"""The rate-limit governor: pacing, throttle waits and bounded backoff.

Component design: `component-design-rate-limit-governor.md` sections
2.2-2.5, and its CAP-003 changes, sections 2.2-2.3. Stories:
`CAP-001-E3-S4`, `CAP-003-E8-S2`.

The governor paces every request through a token bucket sized to the
owner's configured `requests_per_minute` (DAC-E3-S4-5), then classifies
the outcome of one send through a caller-supplied `classify` callable.
`Outcome.THROTTLED` and `Outcome.RETRYABLE` route through distinct
bounded paths -- a `429` is never an attempt (DAC-E3-6) -- and
`Outcome.FATAL` re-raises immediately, unretried (DAC-E3-S4-3).

This module never imports the Massive SDK, a provider response type, or
any wire shape: `send` and `classify` are opaque callables the caller
supplies, and the governor inspects neither a response nor an
exception's type or fields, only the `Outcome` `classify` returns. The
one exception is `ProviderUnavailable`, the typed failure
CAP-001-E3-S3 defines for a caller's governor classifier to treat as
retryable (`massive/errors.py` `is_fatal_for_governor`); this module
raises that same type on exhausted attempts, and its subclass
`ProviderRateLimited` when the per-stock throttle wait budget is spent,
so every caller, present and future, catches one exhaustion type
regardless of provider. `ProviderRateLimited` is imported only to be
raised.
"""

from __future__ import annotations

import random
import time
from collections.abc import Callable
from dataclasses import dataclass
from enum import StrEnum
from typing import TYPE_CHECKING, TypeVar

from factorflow.ingestion.massive.errors import ProviderRateLimited, ProviderUnavailable

if TYPE_CHECKING:
    from factorflow.config.settings import MassiveSettings

T = TypeVar("T")

_SECONDS_PER_MINUTE = 60.0

_THROTTLE_BUDGET_SPENT_MESSAGE = (
    "The provider kept rate-limiting requests until this stock's throttle wait budget was spent."
)


class Outcome(StrEnum):
    """How the caller classified one attempt. The governor never inspects
    a provider response or exception type itself."""

    OK = "ok"
    THROTTLED = "throttled"  # never an attempt (DAC-E3-6)
    RETRYABLE = "retryable"  # transport failure or 5xx; costs an attempt
    FATAL = "fatal"  # do not retry; return to the caller


@dataclass(frozen=True)
class GovernorSettings:
    """Constructed from the existing, positive `MassiveSettings` fields
    (`requests_per_minute`, `max_attempts`, `backoff_initial_seconds`,
    `max_throttle_wait_seconds`) -- this module defines no settings of
    its own and never edits `factorflow.config.settings`."""

    requests_per_minute: int  # required; the owner's plan (component design 2.4)
    max_attempts: int  # default 3 (owner decision 2026-09-04)
    initial_backoff_seconds: float
    max_throttle_wait_seconds: float

    @classmethod
    def from_massive_settings(cls, settings: MassiveSettings) -> GovernorSettings:
        """Construct from `factorflow.config.settings.MassiveSettings`
        (IR-003). Reconciles the one field-name mismatch between the two
        settings classes -- `MassiveSettings.backoff_initial_seconds` maps
        onto `GovernorSettings.initial_backoff_seconds` -- without
        renaming either class. Every other field is a direct mapping."""
        return cls(
            requests_per_minute=settings.requests_per_minute,
            max_attempts=settings.max_attempts,
            initial_backoff_seconds=settings.backoff_initial_seconds,
            max_throttle_wait_seconds=settings.max_throttle_wait_seconds,
        )


class RateLimitGovernor:
    """Paces provider requests through a token bucket and classifies
    retryable failures per component design section 2.2/2.5.

    `monotonic`, `sleep`, `jitter` and `now` are controllable
    collaborators used only so tests can advance virtual time
    deterministically; a caller in production never needs to pass them.
    """

    def __init__(
        self,
        settings: GovernorSettings,
        *,
        monotonic: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], None] = time.sleep,
        jitter: Callable[[], float] = random.random,
        now: Callable[[], float] = time.time,
    ) -> None:
        self._settings = settings
        self._monotonic = monotonic
        self._sleep = sleep
        self._jitter = jitter
        # Wall-clock source for the minute-boundary wait only (IR-001):
        # kept separate from `monotonic`, which paces the token bucket.
        # The boundary wait must track the provider's actual per-minute
        # window, which is anchored to wall-clock time, not to an
        # arbitrary phase of this governor instance's own lifetime.
        self._now = now

        self._capacity = float(settings.requests_per_minute)
        self._refill_rate = settings.requests_per_minute / _SECONDS_PER_MINUTE
        self._tokens = self._capacity
        self._last_refill = monotonic()

        self._throttle_spent = 0.0  # seconds of throttle wait charged to the current stock

    def start_throttle_budget(self) -> None:
        """Start a new stock's throttle wait budget (CAP-003 system design
        section 3.6 note 3). The budget is spent across every `execute`
        call until the next call, never per request."""
        self._throttle_spent = 0.0

    def execute(
        self,
        send: Callable[[], T],
        classify: Callable[[BaseException], Outcome],
        stated_delay_seconds: Callable[[BaseException], float | None] | None = None,
    ) -> T:
        """Run one request under the budget, retrying per section 2.2.

        `send` performs one attempt. `classify` maps an exception raised
        by it onto an `Outcome`; the governor decides what to do with
        that `Outcome` and never examines the exception itself, beyond
        passing it to `classify` and, optionally, `stated_delay_seconds`.

        `stated_delay_seconds`, given the raised exception, returns the
        provider's stated throttle delay in seconds, or `None` when the
        provider stated none. It is honoured without jitter
        (DAC-E3-S4-1, TC-COMP-226; component design section 2.5 row 1).
        Massive sends no `Retry-After` (component design section 2.5), so
        CAP-001-E3-S1 passes no callback and this path is dead code
        against the only provider this capability has; it is retained
        because the governor is provider-agnostic.

        Raises `ProviderUnavailable` when attempts are exhausted, and
        `ProviderRateLimited`, a `ProviderUnavailable`, when a throttle wait
        would take the stock's spent throttle wait past the budget. A
        throttle wait is charged from the start of its sleep to the moment
        the retried request holds its permit (CAP-003 rate-limit-governor
        section 2.3).
        """
        attempts = 0
        throttled_at: float | None = None

        while True:
            self._acquire_permit()
            if throttled_at is not None:
                self._throttle_spent += self._monotonic() - throttled_at
                throttled_at = None

            try:
                result = send()
            except BaseException as exc:  # noqa: BLE001 - classify decides, not this module
                outcome = classify(exc)

                if outcome is Outcome.FATAL:
                    raise

                if outcome is Outcome.THROTTLED:
                    delay = self._throttle_delay(exc, stated_delay_seconds)
                    if self._throttle_spent + delay > self._settings.max_throttle_wait_seconds:
                        raise ProviderRateLimited(_THROTTLE_BUDGET_SPENT_MESSAGE) from exc
                    throttled_at = self._monotonic()
                    self._sleep(delay)
                    continue

                # Outcome.RETRYABLE (or Outcome.OK, which classify should
                # never return for a raised exception -- treated the same
                # as RETRYABLE would be nonsensical, so it is not special
                # cased; only THROTTLED and FATAL are).
                attempts += 1
                if attempts >= self._settings.max_attempts:
                    raise ProviderUnavailable(
                        f"The provider failed {attempts} consecutive attempts."
                    ) from exc
                delay = self._backoff_delay(attempts)
                self._sleep(delay)
                continue
            else:
                return result

    def _acquire_permit(self) -> None:
        """Block until one token is available, refilling continuously at
        `requests_per_minute / 60` tokens per second (component design
        section 2.4). Up to capacity, consecutive sends add no delay
        (DAC-E3-S4-5); beyond it, this waits exactly for the next
        partial refill."""
        while True:
            now = self._monotonic()
            elapsed = now - self._last_refill
            self._last_refill = now
            self._tokens = min(self._capacity, self._tokens + elapsed * self._refill_rate)

            if self._tokens >= 1.0:
                self._tokens -= 1.0
                return

            deficit = 1.0 - self._tokens
            wait_seconds = deficit / self._refill_rate
            self._sleep(wait_seconds)

    def _throttle_delay(
        self,
        exc: BaseException,
        stated_delay_seconds: Callable[[BaseException], float | None] | None,
    ) -> float:
        if stated_delay_seconds is not None:
            stated = stated_delay_seconds(exc)
            if stated is not None:
                return stated
        return self._boundary_wait_with_jitter()

    def _boundary_wait_with_jitter(self) -> float:
        """The no-delay throttle path (the Massive case, component design
        section 2.5 row 2): wait to the next minute boundary, then add
        jitter on top so several retries queued behind the same boundary
        do not resynchronise onto it (DAC-E3-S4-2).

        Deviation from design section 2.5's literal "full jitter over
        the computed delay" (recorded as an owner-accepted deviation in
        the task plan's Notes, IR-005): this applies jitter additively
        on top of the boundary wait, giving a range of
        `[boundary, 2 * boundary]`, rather than full jitter over
        `[0, boundary)`. True full jitter here would often fire before
        the provider's per-minute quota actually refills, defeating the
        purpose of waiting for the boundary at all.
        """
        boundary_wait = self._seconds_to_next_boundary()
        return boundary_wait + self._jitter() * boundary_wait

    def _seconds_to_next_boundary(self) -> float:
        """Seconds until the wall clock reaches the next minute boundary
        (i.e. the next `:00` second of any minute). Anchored to the
        injected wall-clock `now` source rather than `monotonic()` or any
        instant fixed at construction (IR-001), so the wait tracks the
        provider's actual per-minute window regardless of how long this
        governor instance has been alive."""
        remainder = self._now() % _SECONDS_PER_MINUTE
        return _SECONDS_PER_MINUTE - remainder

    def _backoff_delay(self, attempts: int) -> float:
        """Exponential backoff with full jitter (component design section
        2.5 row 3): the computed cap doubles with each attempt, and the
        actual delay is drawn uniformly from `[0, cap)`."""
        cap = self._settings.initial_backoff_seconds * (2.0 ** (attempts - 1))
        return float(self._jitter() * cap)
