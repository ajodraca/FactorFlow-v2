---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S3-tasks
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
  timestamp: 2026-09-11T23:05:00Z
  source_artifacts:
    - id: CAP-001-E5-S3
      version: "1"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S3 — Cancellation: Running and Queued

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-tasks`
**Date**: 2026-09-11

## Summary

Implement run-journal cancellation and outcome finalisation. A queued run is cancelled directly, a claimed run enters `cancelling` until the runner acknowledges it between instruments, and finalisation derives the terminal state from persisted per-instrument results so retained coverage is never mistaken for a failed cancellation.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-19 | Cancel an in-progress run without starting a later instrument and retain already committed coverage. | T002, T003, T006, T007 |
| AC-26 | Cancel a requested run directly without starting it or affecting an active run. | T003, T006 |
| DAC-E5-4 | Derive the outcome from what was actually written rather than the requested roster. | T004, T005, T006 |
| DAC-E5-5 | Succeed only when every required result wrote or was unchanged; otherwise record partial or failed. | T004, T005, T006 |
| DAC-E5-6 | Record running cancellation cooperatively and observe it between instruments. | T002, T006, T007 |
| DAC-E5-7 | Keep `cancelled` terminal, distinct from failed, while retaining committed coverage. | T002, T006 |
| DAC-E5-8 | Transition a requested run directly to `cancelled`. | T003, T006 |
| DAC-E5-9 | Reject terminal cancellation with the actual terminal state. | T003, T006 |
| DAC-E5-S3-1 | Move `running` to `cancelling`, then only acknowledge it as `cancelled`. | T002, T006, T007 |
| DAC-E5-S3-2 | Preserve committed coverage and omit unreached instruments after cancellation. | T002, T007 |
| DAC-E5-S3-3 | Leave an independent active run unchanged when a queued run is cancelled. | T003, T006 |
| DAC-E5-S3-4 | Report a raced terminal completion rather than claiming cancellation occurred. | T003, T006 |
| DAC-E5-S3-5 | Finalise all `written` or `unchanged` required results as `succeeded`. | T004, T006 |
| DAC-E5-S3-6 | Finalise mixed successful and `not_found`/`failed` results as `partial`. | T005, T006 |
| DAC-E5-S3-7 | Finalise no written result as `failed`. | T005, T006 |

## Phase 1: Setup

**Purpose**: Reuse the run-schema PostgreSQL fixture and journal package boundary established by the prerequisite lifecycle stories.

- [ ] T001 Update `tests/conftest.py` only as needed to expose the completed CAP-001-E5-S1 run-schema fixture and the CAP-001-E4-S6 `run_instrument_result` persistence seam to cancellation/finalisation tests, without selecting a migration owner for the unresolved `acquisition_state` conflict (prerequisite infrastructure for AC-19, AC-26, and DAC-E5-4 through DAC-E5-5).

**Checkpoint**: PostgreSQL-marked tests can create requested, running, and terminal runs plus persisted per-instrument results through the same schema and fixtures their producers use.

---

## Phase 2: Tests (TDD)

**Purpose**: Define cancellation transitions and terminal-outcome derivation against the real PostgreSQL run journal before changing production code.

### Mandatory Component Tests

- [ ] T002 Add `# Implements TC-COMP-266` and `# Implements TC-COMP-267` integration tests in `tests/integration/test_run_journal.py`: seed a claimed `running` run with already committed coverage/result rows, assert `request_cancel` changes only that run to `cancelling`, assert the runner-facing cancellation check is true and acknowledgement alone changes it to `cancelled`, then assert the existing coverage/result rows remain readable and no row exists for a later unreached instrument.
- [ ] T003 Add `# Implements TC-COMP-268` and `# Implements TC-COMP-269` integration tests in `tests/integration/test_run_journal.py`: cancel a `requested` run while another row is `running` and assert direct `cancelled` state, non-null terminal end time, and no change to the active claim; separately attempt cancellation after a run has reached each terminal state and assert the journal raises its terminal-state error carrying the persisted actual state without changing the row.
- [ ] T004 Add `# Implements TC-COMP-270` integration tests in `tests/integration/test_run_journal.py`: seed the run roster size and only persisted `written` and `unchanged` `run_instrument_result` records for every required reached data type, invoke `finalise`, and assert `succeeded` with a terminal end timestamp.
- [ ] T005 Add `# Implements TC-COMP-271` and `# Implements TC-COMP-272` integration tests in `tests/integration/test_run_journal.py`: assert a run with at least one persisted `written`/`unchanged` result and an otherwise `not_found` or `failed` result finalises `partial`, while a run with no successful written result finalises `failed`; assert neither case is recorded `succeeded`.

### Additional Unit Tests

- [ ] T006 Add focused state/outcome unit tests in `tests/unit/test_run_journal.py` for the legal `requested -> cancelled`, `running -> cancelling -> cancelled`, and `running -> succeeded|partial|failed` transitions; reject an illegal or terminal transition, classify `written` and `unchanged` as successful outcomes, and verify SQL values are passed as bound parameters rather than interpolated.

**Checkpoint**: The mandatory tests are marked `postgres`, carry their TC trace comments, and are observed RED until the cancellation/finalisation implementation and its prerequisite schema/result writers exist.

---

## Phase 3: Core Implementation

**Purpose**: Complete the journal’s narrow cancellation and outcome interface without moving runner iteration, coverage commits, or per-result persistence into the journal.

- [ ] T007 Create `src/factorflow/runs/states.py` and update `src/factorflow/runs/journal.py`: encode the approved legal state-transition mapping; implement `request_cancel(connection, run_id)`, `cancellation_requested(connection, run_id)`, an acknowledgement boundary callable by the runner, and `finalise(connection, run_id)` using psycopg bound parameters. Make requested cancellation a direct terminal transition, running cancellation cooperative, terminal cancellation raise an error carrying the actual state, and finalisation derive `cancelled`, `failed`, `succeeded`, or `partial` solely from the persisted `acquisition_run` state/roster and `run_instrument_result` outcomes (depends on T001–T006 and CAP-001-E5-S1, CAP-001-E5-S2, and CAP-001-E4-S6).

**Checkpoint**: The journal never accepts a caller-supplied outcome, never deletes coverage or result records, and cannot promote a run with missing, failed, or not-found required results to `succeeded`.

---

## Phase 4: Integration

**Purpose**: Connect the journal’s cooperative cancellation boundaries to the acquisition runner at its existing between-instruments checkpoint.

- [ ] T008 Update `src/factorflow/ingestion/runner.py` to call the journal cancellation check and acknowledgement between completed instrument transactions, stop before starting the next instrument when cancellation is requested, and invoke `finalise` with no caller-supplied outcome; retain the CAP-001-E4-S6 writer’s per-instrument transaction and its rule that untouched instruments create no result rows (depends on T007 and CAP-001-E4-S5/E4-S6).

**Checkpoint**: A cancellation cannot interrupt a committed instrument transaction, but it prevents a later instrument from being started and reaches `cancelled` only through the runner acknowledgement.

---

## Phase 5: Polish

**Purpose**: Prove outcome and cancellation semantics remain distinguishable under the repository’s database-backed and static checks.

- [ ] T009 Strengthen `tests/integration/test_run_journal.py` and `tests/unit/test_run_journal.py` after mutating the direct-queued-cancel path, acknowledgement transition, successful-outcome set, and terminal-state guard; retain tests that kill each mutation, then record the required RED→GREEN→MUTATE→STRENGTHEN evidence (depends on T008).

**Checkpoint**: Tests fail if queued cancellation changes an active run, running cancellation skips `cancelling`, `not_found`/`failed` is treated as success, or a terminal cancellation mutates the stored state.

## Dependencies & Execution Order

### Task Dependencies

- T001 depends on CAP-001-E5-S1 supplying the completed run schema and CAP-001-E4-S6 supplying persisted result records.
- T002–T006 depend on T001 and are written before production code.
- T007 depends on T001–T006 and on the journal boundary introduced by CAP-001-E5-S2.
- T008 depends on T007 and the runner/writer seams delivered by CAP-001-E4-S5 and CAP-001-E4-S6.
- T009 depends on T002–T008.

### Parallel Opportunities

- T002–T005 cover independent database scenarios but must be coordinated when editing `tests/integration/test_run_journal.py`.
- T006 can proceed in parallel with T002–T005 because it targets `tests/unit/test_run_journal.py`.

### Phase Dependencies

- Phase 1 precedes Phase 2 because every scenario requires the run schema and result-row seam.
- Phase 2 precedes Phase 3 under TDD.
- Phase 3 precedes the runner integration in Phase 4; Phase 5 follows its completion.

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Targeted database tests: `uv run pytest -m postgres tests/integration/test_run_journal.py`
- Full Python tests: `uv run pytest`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- On a disposable PostgreSQL 16 database with the CAP-001-E5-S1 run schema and CAP-001-E4-S6 result rows, execute TC-COMP-266 through TC-COMP-272 and verify every expected state, end timestamp, retained row, and absent unreached row.
- Assert `request_cancel` affects only its target run; a queued cancellation neither claims the run nor changes a distinct active row.
- Assert finalisation reads persisted `run_instrument_result` records and the persisted roster metadata, treats `unchanged` as successful acquisition, and cannot receive an outcome argument from the runner.
- Run focused RED, GREEN, mutation, strengthening, and refactor cycles before the full validation commands; if a container runtime is unavailable, report PostgreSQL tests as excluded rather than green.

## Notes

### Resolved Conflicts

- None. The component-design run-journal Open Questions resolve queued cancellation as `requested -> cancelled` and runtime-config resolves the related heartbeat values; this story neither chooses a new timing value nor changes the reclaim policy.

### Open Gaps

- None. The approved run-journal design, market-data-store schema, and CAP-001-E4-S6 result contract determine the cancellation transitions and outcome classifications without a new bound, limit, default, or threshold.

### Other Notes

- CAP-001-E5-S1 remains an implementation prerequisite. Its task planning stopped on the unresolved migration ownership contradiction for `acquisition_state`; this plan must consume the eventual completed run schema and must not select a migration file.
- CAP-001-E4-S6 owns creation of `run_instrument_result` rows. This story reads those persisted rows to finalise and does not duplicate writer transaction logic or create outcomes for an instrument the runner never reaches.
- The runner must acknowledge cancellation only at its between-instruments boundary. `request_cancel` records intent; it must not terminate the process or make a partial instrument transaction appear committed.
