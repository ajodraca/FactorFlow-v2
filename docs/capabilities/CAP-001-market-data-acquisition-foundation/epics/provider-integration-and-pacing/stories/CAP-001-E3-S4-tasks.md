---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-11
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: unknown
  timestamp: 2026-09-11T20:27:10Z
  source_artifacts:
    - id: CAP-001-E3-S4
      version: "1"
    - id: CAP-001-component-design-rate-limit-governor
      version: "6"
    - id: CAP-001-component-design-runtime-config
      version: "6"
    - id: CAP-001-system-design
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E3-S4 — Rate Limit Governor: Pacing, Throttle Waits and Bounded Backoff

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E2-S4`
**Date**: 2026-09-11

## Summary

Implement the synchronous, provider-agnostic governor that paces each request through a configured positive requests-per-minute token bucket, keeps throttling outside the attempt budget, uses bounded waits, and applies bounded exponential backoff to retryable failures. The caller remains responsible for translating provider failures into `Outcome`; the governor never examines a provider response or exception type.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-4 | Requests remain within the configured budget without manual intervention. | T002, T005, T007 |
| DAC-E3-6 | A `429` does not consume an attempt. | T003, T008 |
| DAC-E3-7 | A throttle without a stated delay waits to the minute boundary with jitter. | T003, T008 |
| DAC-E3-8 | Timeout and server failures retry with bounded exponential backoff. | T004, T008 |
| DAC-E3-9 | Persistent throttling exhausts the throttle-wait budget rather than looping forever. | T003, T008 |
| DAC-E3-S4-1 | A provider-stated throttle delay is honoured. | T003, T008 |
| DAC-E3-S4-2 | Boundary waits receive full jitter. | T003, T008 |
| DAC-E3-S4-3 | `FATAL` re-raises immediately, without wait or retry. | T004, T008 |
| DAC-E3-S4-4 | Exhausted retry attempts produce a per-instrument failure for the later runner to record while it continues. | T004, T008 |
| DAC-E3-S4-5 | Up to bucket capacity, back-to-back requests add no artificial delay; the next request waits for refill. | T002, T007 |
| DAC-E3-S4-6 | Throttle waiting is bounded. | T003, T008 |

## Phase 1: Setup

**Purpose**: Establish the new ingestion package and deterministic governor-test support without provider or wall-clock dependencies.

- [x] T001 Create `src/factorflow/ingestion/__init__.py`, `src/factorflow/ingestion/rate_limit.py`, `tests/unit/governor_fakes.py`, `tests/unit/test_governor_pacing.py`, `tests/unit/test_governor_retry.py`, and `tests/unit/test_governor_backoff.py`; provide a test-only fake monotonic clock, sleeper, and deterministic jitter source in `tests/unit/governor_fakes.py`.

**Checkpoint**: Governor tests collect against package imports and can advance virtual time without a network call or real sleep.

---

## Phase 2: Tests (TDD)

**Purpose**: Define the complete pacing, throttle, fatal, and retry contract before the governor exists.

### Mandatory Component Tests

- [x] T002 [P] Implement TC-COMP-230 and the pacing portion of AC-4 in `tests/unit/test_governor_pacing.py`: with a virtual clock and capacity `N`, assert `N` consecutive sends advance virtual time by zero, the `N+1` send blocks until a token refills, and no virtual one-minute window issues more than the configured budget.
- [x] T003 [P] Implement TC-COMP-200, TC-COMP-201, TC-COMP-203, TC-COMP-226, TC-COMP-227, and TC-COMP-231 in `tests/unit/test_governor_retry.py`: assert repeated `THROTTLED` outcomes leave attempts at zero; a no-delay throttle waits to the next minute boundary with full jitter; a stub `stated_delay_seconds` callback delay is honoured exactly without jitter; and both throttle paths count their waits against and raise after `max_throttle_wait_seconds`.
- [x] T004 [P] Implement TC-COMP-202, TC-COMP-228, and TC-COMP-229 in `tests/unit/test_governor_retry.py` and `tests/unit/test_governor_backoff.py`: assert retryable timeout/5xx outcomes increment attempts and use jittered exponential delays, no fourth send occurs after the configured limit, and a caller-classified `FATAL` exception is re-raised with neither sleep nor retry.

### Additional Unit Tests

- [x] T005 [P] Add provider-agnostic boundary tests in `tests/unit/test_governor_retry.py`: use unrelated exception classes with a fixed classifier outcome to prove the governor does not inspect exception type or provider fields, and assert `OK` returns the sender value without a retry.
- [x] T006 [P] Add token-accounting edge tests in `tests/unit/test_governor_pacing.py`: assert partial refill credits elapsed virtual time correctly, each pager-like send consumes one permit, and a new governor instance starts with its configured bucket capacity.

**Checkpoint**: TC-COMP-200–203 and TC-COMP-226–231 are traceability-labelled, deterministic, RED tests; no test sleeps in real time or contacts Massive.

---

## Phase 3: Core Implementation

**Purpose**: Build the typed, synchronous governor and the token bucket behind the caller-provided `Outcome` boundary.

- [x] T007 Implement `Outcome`, frozen `GovernorSettings`, and `RateLimitGovernor` in `src/factorflow/ingestion/rate_limit.py`; construct `GovernorSettings` from the existing positive `MassiveSettings.requests_per_minute`, attempt limit, initial backoff, and throttle-wait fields without modifying `src/factorflow/config/settings.py`; expose controllable monotonic-time, sleep, and jitter collaborators only as needed for deterministic tests.
- [x] T008 Implement the permit acquisition and `RateLimitGovernor.execute()` loop in `src/factorflow/ingestion/rate_limit.py`: continuously refill a capacity-`requests_per_minute` bucket, consume exactly one permit per `send`, return `OK`, re-raise `FATAL`, and route `RETRYABLE` and `THROTTLED` through their distinct bounded paths. Preserve the declared `send` and `classify` signatures and add `stated_delay_seconds: Callable[[BaseException], float | None] | None = None`; document that parameter in code with component-design-rate-limit-governor.md §2.5 row 1, DAC-E3-S4-1, and TC-COMP-226. Use its stated delay without jitter, use full jitter only for no-delay throttle and retry backoff, and raise the typed unavailability failure supplied by CAP-001-E3-S3 on exhausted attempts or throttle budget.

**Checkpoint**: The governor is synchronous, generic over sender result, has no Massive import or response parsing, and distinguishes an unserved throttle from a retryable served failure.

---

## Phase 4: Integration

**Purpose**: Preserve the boundary that CAP-001-E3-S1 uses to submit every SDK request through this governor.

- [x] T009 Update `src/factorflow/ingestion/__init__.py` to expose `GovernorSettings`, `Outcome`, and `RateLimitGovernor` for `src/factorflow/ingestion/massive/client.py`; do not add a Massive-specific delay callback, because CAP-001-E3-S1 passes none and Massive has no `Retry-After`.

**Checkpoint**: CAP-001-E3-S1 can supply its provider-aware classifier to `execute` while this module retains no provider knowledge.

---

## Phase 5: Polish

**Purpose**: Verify bounded behavior and capture TDD/mutation evidence before the implementation handoff.

- [x] T010 Run `tests/unit/test_governor_pacing.py`, `tests/unit/test_governor_retry.py`, and `tests/unit/test_governor_backoff.py`; perform and record manual mutations for permit consumption, 429 attempt counting, no-delay boundary selection, stated-delay jitter exclusion, retry-limit termination, and throttle-budget termination in `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tdd-evidence.yaml`.

**Checkpoint**: Mandatory tests pass, each mutation is killed or the test is strengthened, and the component has no unbounded wait or retry path.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 precedes T002–T006 and T007–T009.
- T002–T006 can run in parallel after T001.
- T007 depends on the RED configuration and pacing tests in T002 and T006.
- T008 depends on T003–T005, T007, and CAP-001-E3-S3's typed `ProviderUnavailable` error.
- T009 depends on T007/T008 and is consumed by CAP-001-E3-S1's client wiring.
- T010 depends on T002–T009.

### Parallel Opportunities

- T002, T003, T004, T005, and T006 are isolated virtual-clock test work and may proceed in parallel after T001.
- T007's settings/type surface and the RED test work can proceed independently, then T008 combines the token bucket and retry loop.

### External Story Dependencies

- CAP-001-E1-S3 already supplies `MassiveSettings` with a required positive `requests_per_minute` and the retry timing settings.
- CAP-001-E3-S3 supplies the typed `ProviderUnavailable` raised when retry or throttle budgets are exhausted.
- CAP-001-E3-S1 owns SDK calls and supplies the provider-aware `classify` function; it passes no stated-delay callback for Massive.
- CAP-001-E5's acquisition runner records a raised, exhausted per-instrument failure and continues the run; S4 does not write run records.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest`
- No-container test subset: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Static analysis: `uv run mypy src`

### Story-Specific Validation

- Run `uv run pytest -m 'not postgres' tests/unit/test_governor_pacing.py tests/unit/test_governor_retry.py tests/unit/test_governor_backoff.py`.
- With virtual time, demonstrate that capacity `N` produces no inter-request delay and request `N+1` waits only until refill; never model an unlimited/sentinel configuration mode.
- Verify a no-delay `THROTTLED` case reaches the next minute boundary with full jitter, while a stubbed stated delay is honoured without jitter and both debit the throttle-wait budget.
- Verify timeout and 5xx classification consume attempts with exponential full jitter, `FATAL` re-raises untouched, and no exhausted path calls `send` again.
- Follow RED → GREEN → MUTATE → STRENGTHEN → REFACTOR; record test execution, commit hash, and manual mutation results in `CAP-001-E3-S4-tdd-evidence.yaml`.

## Notes

- Per owner resolution, `requests_per_minute` remains required and positive (`ge=1`); there is no unlimited, `None`, or sentinel governor mode. “Unlimited” in DAC-E3-S4-5 refers to the provider tier. The required behavior is zero artificial delay while bucket tokens remain, followed by refill waiting, consistent with component-design-rate-limit-governor.md §3 and §14 OQ2 and component-design-runtime-config.md §2.2.
- Component-design-rate-limit-governor.md §2.5 requires a provider-stated delay but its §2.3 `Outcome`-only interface provides no channel for it. Per owner resolution, this story adds the optional provider-agnostic `stated_delay_seconds` callback to `execute` while preserving the documented `send` and `classify` signatures and bare `Outcome`. Record this interface gap for the next design revision; do not edit the approved design in this story.
- The stated-delay path is dead for Massive: CAP-001-E3-S1 passes no callback because the provider has no `Retry-After`. It remains tested with a stub callback for TC-COMP-226.
