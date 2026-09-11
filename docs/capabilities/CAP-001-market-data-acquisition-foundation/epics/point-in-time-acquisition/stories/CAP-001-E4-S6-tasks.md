---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S6-tasks
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
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-11T22:35:00Z
  source_artifacts:
    - id: CAP-001-E4-S6
      version: "1"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
    - id: CAP-001-component-design-observation-writer
      version: "4"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-massive-client
      version: "7"
    - id: CAP-001-component-design-rate-limit-governor
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E4-S6 — Per-Instrument Outcome Classification

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E4-tasks`
**Date**: 2026-09-11

## Summary

Implement the typed per-data-type outcome classifier used by the acquisition runner. It distinguishes committed appended data, idempotent data, provider absence, and exhausted provider failures; it leaves throttling to the governor and supplies credential-safe failure reasons for the observation-writer transaction.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-10 | Record the affected instrument and data type with a reason when a run is partial or failed. | T002, T006, T008 |
| AC-11 | Record an unrecognised instrument as `not_found`, distinct from other failures. | T002, T006, T008 |
| DAC-E4-10 | Record `written`, `unchanged`, `not_found`, or `failed` per instrument and data type. | T002, T003, T006, T008 |
| DAC-E4-11 | Write no result row for an instrument not reached after cancellation. | T004, T007, T008 |
| DAC-E4-15 | Store no provider credential in a failure reason. | T005, T006, T008 |
| DAC-E4-S6-1 | Classify appended returned data as `written`, contributing to success. | T002, T006 |
| DAC-E4-S6-2 | Classify all-already-held returned data as `unchanged`, contributing to success. | T002, T006 |
| DAC-E4-S6-3 | Classify a provider-unknown data type as `not_found` and continue. | T003, T006, T008 |
| DAC-E4-S6-4 | Classify exhausted transport/server errors as `failed` and continue. | T003, T006, T008 |
| DAC-E4-S6-5 | Never create an outcome for a `429` pacing event. | T004, T007 |
| DAC-E4-S6-6 | Allow one instrument to have distinct prices and fundamentals outcomes. | T003, T006, T008 |
| DAC-E4-S6-7 | Include the provider request ID but exclude the credential from a stored reason. | T005, T006, T008 |

## Phase 1: Setup

**Purpose**: Establish the test seams for the existing writer-result and typed-provider-error contracts without duplicating database or provider behavior.

- [ ] T001 Add outcome-classification fixtures for `WriteResult`, `InstrumentNotFound`, `ProviderUnavailable`, and a credential-bearing provider message in `tests/unit/test_outcomes.py`; import the existing contracts from `src/factorflow/ingestion/writer.py`, `src/factorflow/ingestion/massive/errors.py`, and `src/factorflow/config/redaction.py` rather than replacing them with local lookalikes.

**Checkpoint**: Tests can supply committed writer counts and typed provider outcomes through the same boundaries the runner will use.

---

## Phase 2: Tests (TDD)

**Purpose**: Write and observe focused RED tests for every required classifier result before implementing its production mapping.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-183 and TC-COMP-184 in `tests/unit/test_outcomes.py`; assert per-data-type positive appended counts classify as `written`, while returned rows with zero appended and positive unchanged counts classify as `unchanged`, and assert both results are recognized by the run-journal success set. Add `# Implements TC-COMP-183` and `# Implements TC-COMP-184` trace comments.
- [ ] T003 [P] Implement TC-COMP-185, TC-COMP-186, and TC-COMP-188 in `tests/unit/test_outcomes.py`; assert `InstrumentNotFound` maps only the failing data type to `not_found`, `ProviderUnavailable` maps it to `failed`, and one instrument can retain `written` prices alongside `not_found` fundamentals. Add a trace comment for every TC.
- [ ] T004 [P] Implement TC-COMP-187 and the cancelled-before-reached no-row assertion in `tests/integration/test_runner_outcomes.py`; use the typed governor/runner boundary to assert `429` is handled as pacing before classification, and seed a cancellation before a later roster entry to assert no `run_instrument_result` row exists for that untouched instrument. Add `# Implements TC-COMP-187` trace comments.
- [ ] T005 [P] Implement TC-COMP-189 in `tests/unit/test_outcomes.py`; construct a typed provider error with a request ID and a message containing the active credential, then assert the recordable reason retains the request ID and does not retain the secret. Add a `# Implements TC-COMP-189` trace comment.

### Additional Unit Tests

- [ ] T006 [P] Add empty `WriteResult` and mixed per-data-type result tests in `tests/unit/test_outcomes.py`; distinguish an empty provider response from an all-unchanged response, preserve the supplied data type on every result, and reject an unrecognized classification input rather than silently producing a database outcome.

**Checkpoint**: The classifier tests fail because `outcomes.py` does not yet define the typed mapping, while the integration assertions identify the ownership boundaries for cancellation and throttling.

---

## Phase 3: Core Implementation

**Purpose**: Add a narrow, typed classification boundary that converts writer results and typed provider errors into writer-facing per-data-type results.

- [ ] T007 Create the outcome enum/data model and pure `WriteResult` classification in `src/factorflow/ingestion/outcomes.py`; map appended values to `written`, all-held returned values to `unchanged`, and preserve the four schema data-type names used by `run_instrument_result`.
- [ ] T008 In `src/factorflow/ingestion/outcomes.py`, map `InstrumentNotFound` to `not_found` and exhausted `ProviderUnavailable`/provider-contract failures to `failed`; format the supplied provider request ID with the instrument and data type, pass the message through the existing redaction boundary, and expose the resulting outcome records for `writer.py` to insert in its existing transaction.

**Checkpoint**: The outcome module has no SQL, no provider URL construction, no retry loop, and no credential ownership; it only produces the validated inputs that the writer persists transactionally.

---

## Phase 4: Integration

**Purpose**: Connect classification to the already-planned runner and writer without moving their transaction, cancellation, or rate-limit responsibilities.

- [ ] T009 Update `src/factorflow/ingestion/runner.py` to pass the actual data type, `WriteResult`, and typed provider errors through `outcomes.py`, then pass the resulting per-data-type records into `src/factorflow/ingestion/writer.py`; retain the runner's existing rule that a cancelled or lost claim performs no classification or write for later instruments.
- [ ] T010 Update `src/factorflow/ingestion/writer.py` to consume the typed outcome records when inserting `run_instrument_result`, including the redacted reason and only the reached data types, within its existing `connection.transaction()` boundary.

**Checkpoint**: A reached instrument commits distinct result rows per data type with observations and coverage, while untouched instruments and pacing events produce no classification row.

---

## Phase 5: Polish

**Purpose**: Verify the classifications are distinguishable in PostgreSQL and that sensitive error text cannot enter persisted results.

- [ ] T011 Run `tests/unit/test_outcomes.py` and `tests/integration/test_runner_outcomes.py` with `uv run pytest -m 'not postgres'` and `uv run pytest -m postgres` as applicable; manually mutate the `not_found`/`failed` mapping and disable reason redaction in a local uncommitted copy to confirm the relevant tests fail, then restore the implementation before continuing.
- [ ] T012 Run `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv build` from the repository root; report any unavailable PostgreSQL container as an excluded validation rather than a successful full suite.

**Checkpoint**: The mapped behavior, per-data-type persistence, and credential-redaction boundary are verified without treating flow-control retries as outcomes.

## Dependencies & Execution Order

### Task Dependencies

- T001 prepares fixtures required by T002, T003, T005, and T006.
- T002 through T006 must be written and observed RED before T007 and T008.
- T007 establishes success classification; T008 depends on T007 for the shared outcome model.
- T009 depends on T007 and T008 plus CAP-001-E4-S5's runner seam; T010 depends on T009 plus CAP-001-E4-S3's writer contract.
- T011 depends on T002 through T010; T012 depends on T011.

### Parallel Opportunities

- T002 through T006 cover independent classifications and can run in parallel after T001.
- T009 and T010 target different integration boundaries but T010 must retain the outcome model agreed by T009.

### Phase Dependencies

- Phase 2 must produce observed RED results before Phase 3 begins.
- Phase 3 must complete before the runner/writer integration in Phase 4.
- Phase 5 follows the integrated implementation.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest`, `uv run pytest -m 'not postgres'`, and `uv run pytest -m postgres`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Assert the seven mapped TC cases: `written`, `unchanged`, `not_found`, `failed`, no `429` outcome, mixed prices/fundamentals outcomes, and request-ID-bearing redacted reasons.
- Use a disposable PostgreSQL 16 database to verify reached data types are persisted in the writer transaction and a cancelled-before-reached instrument has no result row.
- Substitute the typed Massive client and rate-limit governor boundaries; never make a live provider request from these tests.
- Confirm run-journal finalisation sees `written` and `unchanged` as success, while `not_found` and `failed` make a reached run partial.

## Notes

### Resolved Conflicts

- `component-design-market-data-store.md` §2.4 labels `run_instrument_result` insertion as an acquisition-runner action, while `component-design-observation-writer.md` §2.2 puts it inside the writer transaction. CAP-001-E4-S3's approved task plan resolves the narrower transaction contract: `writer.py` inserts the typed records and `runner.py` supplies classification input; this plan preserves that atomicity.
- The story's `429` criterion could imply a classifier case, but `component-design-acquisition-runner.md` §2.4 and `component-design-rate-limit-governor.md` make it flow control before a provider result. The governor owns the wait/retry; the classifier emits no outcome for it.

### Open Gaps

- None. The confirmed CAP-001-E4-S3 writer-local `ParsedObservations` decision provides the typed payload/range boundary, and `component-design-massive-client.md` §2.4 provides the typed error and request-ID contract.

### Other Notes

- CAP-001-E4-S3 supplies the writer transaction and result-row insertion; CAP-001-E4-S5 supplies the runner's iteration and cancellation boundary. This story must not add direct SQL, provider retry logic, or an outcome row for an instrument the runner never reached.
- Store provider request IDs only as diagnostic correlation data. The credential remains owned by `massive-client`/runtime configuration and must be redacted before any reason reaches the writer.
