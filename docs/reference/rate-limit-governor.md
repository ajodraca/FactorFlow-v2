# Rate limit governor

`src/factorflow/ingestion/rate_limit.py` implements `RateLimitGovernor`, the
synchronous, provider-agnostic governor that `CAP-001-E3-S1`'s
`massive/client.py` submits every SDK request through, including followed
pages. It imports no Massive SDK, response type,
or wire shape — `send` and `classify` are opaque callables the caller
supplies, and the governor inspects only the `Outcome` `classify` returns,
never the raised exception's type or fields. The only Massive names it
imports are the two failure types it raises, `ProviderUnavailable` and
`ProviderRateLimited`, and it logs nothing.

`execute(send, classify, stated_delay_seconds=None)` calls `send()` under a
token bucket sized to `GovernorSettings.requests_per_minute`. The bucket starts
full, never refills above that capacity, refills continuously, and consumes one
permit per send. A one-minute window overlapping the initial full bucket may
issue up to capacity plus one window's refill; after drawdown, each subsequent
one-minute window is capped at the configured budget. The classified outcome
then follows a distinct, bounded path:

| Outcome | Attempt counter | Wait | Then |
|---|---|---|---|
| `THROTTLED`, provider stated a delay | unchanged | the stated delay, no jitter | retry while the throttle wait budget allows it |
| `THROTTLED`, no stated delay (the Massive case) | unchanged | to the next minute boundary, plus jitter | retry while the throttle wait budget allows it |
| `RETRYABLE` (timeout or 5xx) | plus one | `initial_backoff_seconds × 2^(attempts−1)`, full jitter | retry while attempts remain |
| `OK` | unchanged | none | return |
| `FATAL` (404, 401, not retryable) | unchanged | none | re-raise |

Two limits terminate the loop, both configured through
`GovernorSettings.from_massive_settings()` (built from `MassiveSettings`
without either settings class importing the other, `MassiveSettings`
imported only under `TYPE_CHECKING`). `max_attempts` (default 3) bounds the
`RETRYABLE` path; when it is reached, `execute` raises `ProviderUnavailable`.
`max_throttle_wait_seconds` (default 300) bounds the `THROTTLED` path. A `429`
never consumes an attempt.

## Throttle wait budget

The throttle wait budget belongs to a stock, not to one request
(CAP-003-E8-S2; `component-design-rate-limit-governor.md` CAP-003 sections
2.2 and 2.3). The governor keeps one running total of throttle wait spent.
It is zero at construction, and `start_throttle_budget()` sets it back to
zero. Every `execute` call charges the same total until the next
`start_throttle_budget()`: a successful call, a raising call and the raise
itself leave it as it is.

On a `THROTTLED` outcome the governor first computes the delay, then checks
it before waiting. When the total spent plus that delay would exceed
`max_throttle_wait_seconds`, the wait is not taken: `execute` raises
`ProviderRateLimited` from the last exception, with the fixed message "The
provider kept rate-limiting requests until this stock's throttle wait budget
was spent." and no provider `request_id`. Otherwise it sleeps and retries.
Because the check comes before the wait, the budget is hard: the throttle
sleeps charged to one budget never add up to more than
`max_throttle_wait_seconds`, jitter included.

A throttle wait is charged on the monotonic clock, from the start of its
sleep to the moment the retried request holds its permit, so the permit wait
that follows a throttle sleep counts. The sender's own time, a `RETRYABLE`
backoff and the permit wait that follows a backoff are not charged. A
provider-stated zero-second delay still spends the budget through those
permit waits once the bucket is drawn down, so it cannot retry forever.

`ProviderRateLimited` is a `ProviderUnavailable`, so every caller that catches
`ProviderUnavailable` also catches it. Exhausted attempts still raise a plain
`ProviderUnavailable`, never a `ProviderRateLimited`. The failure reason the
composer writes for it is described in
[Massive provider failure reasons](../../README.md#massive-provider-failure-reasons).

Nothing in this release calls `start_throttle_budget()` yet, so a governor's
budget starts at its construction and is spent across its whole life.

## Throttle wait timing

The no-delay throttle wait is anchored to a wall-clock `now` collaborator
(default `time.time`), not to `monotonic()` or any instant fixed at
governor construction, so the wait tracks the provider's actual per-minute
window regardless of how long the governor instance has been alive. Its
jitter is applied additively on top of the boundary wait
(`boundary + jitter() × boundary`, range `[boundary, 2 × boundary]`) rather
than the literal "full jitter over the computed delay" that
`component-design-rate-limit-governor.md` §2.5 states for every jittered
delay — a deliberate, recorded deviation: true full jitter here
(`[0, boundary)`) would often fire before the provider's per-minute quota
refills, defeating the reason the boundary wait exists. The backoff path
(retryable failures) does use full jitter as written. See
`_boundary_wait_with_jitter`'s docstring and the task plan's Notes.

## Known limitations

**Carried forward as accepted warnings from implementation review v5**
(`CAP-001-E3-S4-implementation-review-v5.md`) — none blocks a current
acceptance criterion:

- The `except BaseException` classification boundary (`execute`, per the
  design-mandated `Callable[[BaseException], Outcome]` signature) hands
  `KeyboardInterrupt` and `SystemExit` to the caller's `classify` along with
  every other exception. No test covers either type, and a classifier that
  defaults an unrecognised exception to `RETRYABLE` or `THROTTLED` would
  make the governor sleep through a cancellation signal — for the no-delay
  throttle path, now a genuine up-to-120-second wall-clock wait (v5 IR-003).
- `GovernorSettings` is a plain frozen dataclass with no construction-time
  validation, so a direct literal construction with `requests_per_minute=0`
  succeeds and only fails later, obscurely, with `ZeroDivisionError` inside
  permit acquisition. Every production caller goes through
  `from_massive_settings()`, where `MassiveSettings`'s `Field(ge=1)` already
  enforces positivity, so this affects only direct construction, which
  today only the tests do (v5 IR-007).
- The backoff cap on the first retry is `initial_backoff_seconds × 2**0`,
  i.e. `initial_backoff_seconds` itself — one doubling below component
  design section 2.5 row 3's literal wording ("initial delay times two to
  the power of attempts"). The implementation is the conventional reading
  and the bound holds; the wording gap is flagged for the next design
  revision (v5 IR-005).
- `ProviderUnavailable` is raised with only a message string on exhaustion;
  the attempt count is interpolated into prose rather than carried as a
  structured field, and the module emits no log records naming the attempt
  index, delay, or status code (component design section 4's expectation).
  Whether governor logging and a structured exhaustion failure belong to
  CAP-001-E5 or a later story is an open owner decision (v2 IR-009).

**Carried forward as an accepted warning from implementation review v2**
(`CAP-003-E8-S2-implementation-review-v2.md`, IR-001, medium). The tests pin
that the spent throttle total survives a successful `execute` and a
`ProviderRateLimited` raise. No test pins that it also survives a `FATAL`
re-raise, an exhausted-attempts raise or a `RETRYABLE` retry. The code resets
it on none of those paths, but a change that did would let one stock's
throttle sleeps exceed the budget without failing a test.
