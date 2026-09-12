"""The rate-limit governor: pacing, throttle waits and bounded backoff.

Component design: `component-design-rate-limit-governor.md` sections 2.2-2.5.
Story: `CAP-001-E3-S4`.

Placeholder for Phase 1 (T001): the RED tests in `tests/unit/test_governor_*`
must be able to import `Outcome`, `GovernorSettings` and `RateLimitGovernor`
from this module. `execute` is not yet implemented.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from enum import StrEnum
from typing import TypeVar

T = TypeVar("T")


class Outcome(StrEnum):
    """How the caller classified one attempt. The governor never inspects
    a provider response or exception type itself."""

    OK = "ok"
    THROTTLED = "throttled"
    RETRYABLE = "retryable"
    FATAL = "fatal"


@dataclass(frozen=True)
class GovernorSettings:
    requests_per_minute: int
    max_attempts: int
    initial_backoff_seconds: float
    max_throttle_wait_seconds: float


class RateLimitGovernor:
    """Paces provider requests and classifies retryable failures."""

    def __init__(self, settings: GovernorSettings) -> None:
        self._settings = settings

    def execute(
        self,
        send: Callable[[], T],
        classify: Callable[[BaseException], Outcome],
        stated_delay_seconds: Callable[[BaseException], float | None] | None = None,
    ) -> T:
        raise NotImplementedError
