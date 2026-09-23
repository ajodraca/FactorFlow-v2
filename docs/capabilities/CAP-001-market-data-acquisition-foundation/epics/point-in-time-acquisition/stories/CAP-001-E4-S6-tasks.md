---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S6-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-23
docs_synced_review: CAP-001-E4-S6-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Devin
  tool_version: unknown
  timestamp: 2026-09-20T22:06:34Z
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
    - id: CAP-001-component-design-run-journal
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E4-S6 — Per-Instrument Outcome Classification

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E4-tasks`
**Date**: 2026-09-20

## Summary

Implement the typed per-data-type outcome classifier used by the acquisition runner. It distinguishes committed appended data, idempotent data, provider absence, and exhausted provider failures; it leaves throttling to the governor and persists only credential-safe failure reasons produced by the Massive-client boundary inside the observation-writer transaction.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-10 | Record the affected instrument and data type with a reason when a run is partial or failed. | T003, T005, T008, T010 |
| AC-11 | Record an unrecognised instrument as `not_found`, distinct from other failures. | T003, T008, T009 |
| DAC-E4-10 | Record `written`, `unchanged`, `not_found`, or `failed` per instrument and data type. | T002, T003, T006, T007, T008, T010 |
| DAC-E4-11 | Write no result row for an instrument not reached after cancellation. | T004, T009 |
| DAC-E4-15 | Store no provider credential in a failure reason. | T005, T008, T010 |
| DAC-E4-S6-1 | Classify appended returned data as `written`, contributing to success. | T002, T007 |
| DAC-E4-S6-2 | Classify all-already-held returned data as `unchanged`, contributing to success. | T002, T007 |
| DAC-E4-S6-3 | Classify a provider-unknown data type as `not_found` and continue. | T003, T008, T009 |
| DAC-E4-S6-4 | Classify exhausted transport/server errors as `failed` and continue. | T003, T008, T009 |
| DAC-E4-S6-5 | Never create an outcome for a `429` pacing event. | T004, T009 |
| DAC-E4-S6-6 | Allow one instrument to have distinct prices and fundamentals outcomes. | T003, T008, T010 |
| DAC-E4-S6-7 | Persist a provider request ID without persisting the credential. | T005, T008, T010 |

## Phase 1: Setup

**Purpose**: Establish test seams for the writer-result, typed-provider-error, safe-reason, runner, writer, and run-journal contracts without duplicating their behavior.

- [x] T001 Add shared outcome fixtures in `tests/unit/test_outcomes.py` and `tests/integration/test_runner_outcomes.py` for `WriteResult`, `InstrumentNotFound`, `ProviderUnavailable`, `ProviderContractViolation`, and the credential-safe reason composer exported by `src/factorflow/ingestion/massive/errors.py`; import the contracts delivered by CAP-001-E3-S3, CAP-001-E3-S5, CAP-001-E4-S3, CAP-001-E4-S5, and CAP-001-E5-S2 rather than defining local lookalikes.

**Checkpoint**: Unit tests can classify committed writer counts and typed provider failures, and integration tests can observe the exact rows and final run state those classifications produce.

---

## Phase 2: Tests (TDD)

**Purpose**: Write and observe focused RED tests for every required classifier result before implementing its production mapping.

### Mandatory Component Tests

- [x] T002 Implement TC-COMP-183 and TC-COMP-184 in `tests/unit/test_outcomes.py` and `tests/integration/test_runner_outcomes.py`; assert positive appended counts classify as `written`, positive unchanged counts with no append classify as `unchanged`, the corresponding rows are persisted per data type, and `run-journal.finalise` treats both outcomes as successful. Add `# Implements TC-COMP-183` and `# Implements TC-COMP-184` trace comments.
- [x] T003 Implement TC-COMP-185, TC-COMP-186, and TC-COMP-188 in `tests/unit/test_outcomes.py` and `tests/integration/test_runner_outcomes.py`; assert `InstrumentNotFound` maps only the reached failing data type to `not_found`, `ProviderUnavailable` maps it to `failed`, later roster entries still run, finalisation becomes `partial`, and one instrument can persist `written` prices alongside `not_found` fundamentals. Add a trace comment for every TC.
- [x] T004 [P] Implement TC-COMP-145 and TC-COMP-187 in `tests/integration/test_runner_outcomes.py`; exercise the typed governor/runner boundary to prove `429` is handled as pacing before classification, and seed cancellation before a later roster entry to prove no `run_instrument_result` row exists for the untouched instrument. Add `# Implements TC-COMP-145` and `# Implements TC-COMP-187` trace comments.
- [x] T005 Implement TC-COMP-189 in `tests/integration/test_runner_outcomes.py`; compose a safe reason from a typed provider error carrying a request ID and credential-bearing diagnostic text, persist it through the writer transaction, and assert the stored value retains the request ID while containing no credential substring. Add a `# Implements TC-COMP-189` trace comment.

### Additional Unit Tests

- [x] T006 Add empty `WriteResult`, mixed per-data-type result, and unsupported-error tests in `tests/unit/test_outcomes.py`; distinguish an empty provider response from an all-unchanged response, preserve the supplied schema data type on every result, keep `CredentialRejected` on the run-level failure path, and reject an unrecognized classification input rather than silently producing a database outcome.

**Checkpoint**: The mapped tests have been executed and observed RED because `outcomes.py` does not yet define the mapping or the runner/writer integration does not yet persist it; the failure evidence is recorded before production changes begin.

---

## Phase 3: Core Implementation

**Purpose**: Add a narrow, typed classification boundary that converts writer results and typed provider errors into writer-facing per-data-type results.

- [x] T007 Create the outcome enum/data model and pure `WriteResult` classification in `src/factorflow/ingestion/outcomes.py`; map appended values to `written`, all-held returned values to `unchanged`, distinguish an empty provider response, and preserve the four schema data-type names used by `run_instrument_result`.
- [x] T008 In `src/factorflow/ingestion/outcomes.py`, map `InstrumentNotFound` to `not_found` and `ProviderUnavailable`/`ProviderContractViolation` to `failed`; accept the already composed credential-safe reason from the Massive-client boundary without reformatting or re-redacting it, reject `CredentialRejected` as a per-data-type outcome, and expose typed result records for `writer.py` to persist.

**Checkpoint**: The outcome module has no SQL, provider URL construction, retry loop, credential access, or reason-composition ownership; it only validates and classifies values passed across existing component contracts.

---

## Phase 4: Integration

**Purpose**: Connect classification to the planned runner and writer without moving their transaction, cancellation, rate-limit, or secret-ownership responsibilities.

- [x] T009 Update `src/factorflow/ingestion/runner.py` to pass each reached data type's `WriteResult` or typed provider failure through `outcomes.py`, provide only the credential-safe reason returned by the Massive-client boundary, and pass the resulting records into `src/factorflow/ingestion/writer.py`; retain the rules that `429` never reaches classification, `CredentialRejected` fails the run, and cancellation or a lost claim produces no result for later instruments.
- [x] T010 Update `src/factorflow/ingestion/writer.py` to consume the typed outcome records when inserting `run_instrument_result`, including the safe reason and only reached data types, inside its existing `connection.transaction()` boundary; preserve one row per `(run_id, instrument_id, data_type)` and the schema's `written`, `unchanged`, `not_found`, and `failed` values.

**Checkpoint**: Reached data types commit distinct result rows with observations and coverage, while untouched instruments and pacing events produce no classification row and run finalisation derives the correct terminal state from persisted outcomes.

---

## Phase 5: Polish

**Purpose**: Verify the mappings, transaction boundary, and credential-safety behavior, then run the repository validation suite.

- [x] T011 Run `tests/unit/test_outcomes.py` and `tests/integration/test_runner_outcomes.py`; perform manual mutations of the `written`/`unchanged`, `not_found`/`failed`, `429`, cancellation, and safe-reason paths, strengthen any test that does not catch its mutation, and record RED, GREEN, mutation, review-contract, and commit evidence in `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6-tdd-evidence.yaml`.
- [x] T012 Run `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv build` from the repository root; report an unavailable PostgreSQL container as an excluded validation rather than presenting `uv run pytest -m 'not postgres'` as the full suite.

**Checkpoint**: Every mapped behavior is green, the required mutations are killed, evidence is current, and all available constitution-defined validation passes without misreporting exclusions.

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E5-S2 | context | E5-S2 created the base run-journal module, but E4-S5 now delivers the runner seam and argument-free `finalise`; E4-S6 reaches that journal contract transitively through its hard E4-S5 edge. |

### Task Dependencies

- T001 prepares fixtures required by T002 through T006.
- T002 through T006 must be written, executed, and observed RED before T007 or T008 begins.
- T007 establishes success classification; T008 depends on T007 for the shared outcome model.
- T009 depends on T007 and T008 plus CAP-001-E3-S5's safe-reason contract and CAP-001-E4-S5's runner seam.
- T010 depends on T009 plus CAP-001-E4-S3's writer transaction contract.
- T011 depends on T002 through T010; T012 depends on T011.

### Parallel Opportunities

- T004 targets the integration boundary and can be prepared in parallel with the unit-test portions of T002, T003, and T006 after T001; edits to the shared integration test file must still be coordinated.
- No tasks editing `tests/unit/test_outcomes.py` are marked parallel because they share one file.
- T009 and T010 target different production files, but T010 follows the result model agreed by T009.

### Phase Dependencies

- Phase 2 must produce observed RED evidence before Phase 3 begins.
- Phase 3 must complete before runner/writer integration in Phase 4.
- Phase 5 follows the integrated implementation.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest`, `uv run pytest -m 'not postgres'`, and `uv run pytest -m postgres`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Assert TC-COMP-183 through TC-COMP-189 and TC-COMP-145 at the unit or persisted integration boundary required by each expected result.
- Use a disposable PostgreSQL 16 database to verify reached data types are persisted in the writer transaction, finalisation treats `written` and `unchanged` as successful, `not_found` and `failed` make a reached run partial, and a cancelled-before-reached instrument has no result row.
- Substitute the typed Massive client and rate-limit governor boundaries; never make a live provider request.
- Verify the reason stored in PostgreSQL is the already composed safe reason from CAP-001-E3-S5, retains the provider request ID, and contains no credential substring.
- Verify `CredentialRejected` follows the run-level failure path and never becomes a per-data-type `failed` row.

## Notes

### Resolved Conflicts

- `component-design-market-data-store.md` §2.4 labels `run_instrument_result` insertion as an acquisition-runner action, while `component-design-observation-writer.md` §2.2 and CAP-001-E4-S3 place it inside the writer transaction. The story-level CAP-001-E4-S3 transaction contract is more specific: `writer.py` inserts typed records and `runner.py` supplies classification input, preserving atomicity.
- The story's `429` criterion could imply a classifier case, but `component-design-acquisition-runner.md` §2.4 and `component-design-rate-limit-governor.md` §2.5 define it as flow control before a provider result. The governor owns wait/retry behavior; the classifier emits no outcome for it.
- The acquisition-runner and run-journal designs describe persistence-time redaction, while CAP-001-E3-S5's later task plan defines a credential-aware composer at the Massive-client boundary and states that CAP-001-E4-S6 consumes only its returned safe string. The narrower dependency contract governs this plan: S6 does not duplicate reason formatting or gain credential ownership, and its persisted-value test supplies defense-in-depth evidence.

### Open Gaps

- None. CAP-001-E4-S3's writer-local `ParsedObservations` decision supplies the payload/range boundary; CAP-001-E3-S5 supplies the safe failure-reason boundary; the Massive-client design supplies typed errors and provider request IDs; and the run-journal design pins terminal-state derivation from persisted outcomes.

### Other Notes

- CAP-001-E4-S3 supplies the writer transaction and result-row insertion; CAP-001-E4-S5 supplies iteration, cancellation, and argument-free run finalisation on top of E5-S2's base journal module. This story must not add direct SQL outside the writer, provider retry logic, reason composition, or a row for an instrument the runner never reached.
- Store provider request IDs only as diagnostic correlation data. The usable credential remains owned by Massive-client/runtime configuration and never enters `outcomes.py` or `writer.py`.
