---
artifact_schema_version: 1
artifact_id: CAP-003-rate-limit-governor-tests
artifact_type: test-specification
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T19:19:17Z
  source_artifacts:
    - id: CAP-003
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-backlog
      version: "4"
    - id: CAP-003-component-design-rate-limit-governor
      version: "1"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# rate-limit-governor Component Test Specification

Component tests for `rate-limit-governor`'s CAP-003 changes (AC-30). Each case verifies one story-level derived acceptance criterion of CAP-003-E8 within a unit test harness for the FactorFlow-v2 repository; the governor's interfaces are `Python call` entries only (component design section 11). IDs continue after the first test design in AC-ID order, so this file holds 6 cases (TC-COMP-235 to TC-COMP-242, not necessarily contiguous).

Every case runs pytest without a container or network over `tests/unit/governor_fakes.py` (`FakeClock`, `FakeSleeper`, `FlakySender`, `SequenceJitter`), passing one `FakeClock` as both `monotonic` and `now` so a `FakeSleeper` sleep advances the pacing clock and the wall clock together, except the delivered rows that pin a fixed wall-clock phase. These cases drive the governor with a scripted `classify`; the real `429` path through the SDK and urllib3 is `massive-client`'s and `acquisition-runner`'s (DAC-E8-20).

### TC-COMP-235: The budget is checked before each wait in the two delivered exhaustion tests

**Scope:** component
**Component(s):** rate-limit-governor
**Traces to:** AC-30, DAC-E8-S2-1, DAC-E8-5, DAC-E8-6
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_governor_retry.py`; one `FakeClock` as `monotonic` and `now`

#### Steps
1. Run the delivered `test_boundary_throttle_wait_exhausts_the_budget_and_raises` with budget 90 s and unjittered 60 s boundary waits
2. Run the delivered `test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` with budget 25 s and stated delay 10 s
3. Run the delivered `test_zero_stated_delay_throttle_wait_is_bounded`

#### Expected Result
- Step 1: `sleeper.calls == [60.0]` (was `[60.0, 60.0]`), then `ProviderRateLimited`
- Step 2: `sleeper.calls == [10.0, 10.0]` (was three), then `ProviderRateLimited`
- Step 3 passes unchanged: the retry's 60 s permit wait is charged, so the second throttle raises and `send.calls == 2`

#### Error / Edge Cases
- Only the two exhaustion tests take new expectations; no other delivered expectation changes

### TC-COMP-236: Exhaustion raises ProviderRateLimited; a retry bound raises a plain ProviderUnavailable

**Scope:** component
**Component(s):** rate-limit-governor
**Traces to:** AC-30, DAC-E8-S2-2, DAC-E8-6
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_governor_retry.py`; a `FlakySender` raising a known exception on every send

#### Steps
1. Execute with a classifier always `THROTTLED` until the budget is spent
2. Execute with a classifier always `RETRYABLE`

#### Expected Result
- Step 1 raises a `ProviderRateLimited`, an instance of `ProviderUnavailable`, with `provider_request_id` `None`, the fixed message *The provider kept rate-limiting requests until this stock's throttle wait budget was spent.* and `__cause__` the last exception `send` raised
- Step 2 raises, after `max_attempts` sends, a `ProviderUnavailable` that is not a `ProviderRateLimited`

#### Error / Edge Cases
- A classifier returning `FATAL` re-raises the send's exception at once, after one send (DAC-E8-6)

### TC-COMP-237: One budget spans every execute between two starts

**Scope:** component
**Component(s):** rate-limit-governor
**Traces to:** AC-30, DAC-E8-S2-3, DAC-E8-5
**Priority:** P1
**Type:** functional

#### Preconditions
- Budget 300 s, unjittered boundary waits, one governor

#### Steps
1. Call `start_throttle_budget()`; run a first `execute` throttled three times then succeeding
2. Run a second `execute` on the same governor, always throttled
3. Call `start_throttle_budget()`; run a third `execute`, throttled once then succeeding

#### Expected Result
- Step 1 spends 180 s and returns
- Step 2 takes two more 60 s waits and raises `ProviderRateLimited` on the third, so the sleeps total 300 s
- Step 3 waits again (one 60 s wait) and returns

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-238: Jitter never takes the sleeps past the budget

**Scope:** component
**Component(s):** rate-limit-governor
**Traces to:** AC-30, DAC-E8-S2-4, DAC-E8-5
**Priority:** P1
**Type:** non-functional

#### Preconditions
- Budget 300 s, `SequenceJitter([0.999])`, a classifier always `THROTTLED`

#### Steps
1. Execute until the governor raises
2. Sum `sleeper.calls` and compute the next delay the governor would have taken

#### Expected Result
- The sum is at most 300 s
- The sum plus the next computed delay, which was not slept, exceeds 300 s (review v14 FINDING-55)

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-239: Throttling costs no attempt and the retry and backoff rows pass unchanged

**Scope:** component
**Component(s):** rate-limit-governor
**Traces to:** AC-30, DAC-E8-S2-5, DAC-E8-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The delivered `test_repeated_throttled_outcomes_do_not_consume_attempts`, `test_throttled_outcomes_do_not_share_the_retry_attempt_counter`, and the retry-bound and backoff rows in `test_governor_retry.py` and `tests/unit/test_governor_backoff.py`

#### Steps
1. Run each delivered test after the change

#### Expected Result
- Each passes unchanged: with the budget not reached, throttled sends beyond `max_attempts` succeed; pacing, backoff and the stated-delay path behave as delivered

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-242: The governor still inspects no exception, logs nothing new and keeps its settings

**Scope:** component
**Component(s):** rate-limit-governor
**Traces to:** AC-30, DAC-E8-S2-8, DAC-E8-6
**Priority:** P2
**Type:** security

#### Preconditions
- `src/factorflow/ingestion/rate_limit.py` after the change

#### Steps
1. Read the module's use of exceptions and its imports
2. Read its log calls and messages
3. Compare `GovernorSettings` and `from_massive_settings` with the base branch

#### Expected Result
- The governor never inspects an exception; it imports `ProviderRateLimited` only to raise it
- No new log call; no URL or credential in any message
- `GovernorSettings` and `from_massive_settings` are unchanged

#### Error / Edge Cases
- None beyond the scenario
