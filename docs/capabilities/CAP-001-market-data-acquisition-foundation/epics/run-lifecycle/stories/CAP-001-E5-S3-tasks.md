---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-10-06
docs_synced_review: CAP-001-E5-S3-implementation-review-v2.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-18T03:45:54Z
  source_artifacts:
    - id: CAP-001-E5-S3
      version: "1"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
    - id: CAP-001-component-design-observation-writer
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S3 — Cancellation: Running and Queued

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-tasks`
**Date**: 2026-09-17

## Summary

Implement the cancellation and outcome-finalisation portion of `run-journal`. A requested run moves directly to terminal `cancelled`; a running run records cooperative intent as `cancelling` until the runner observes it between instruments and calls `finalise`; and every non-cancelled terminal outcome is derived from the persisted roster size and per-data-type result rows, with committed coverage left untouched.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-19 | Cancel an in-progress run before a later instrument starts and retain committed coverage. | T002, T007, T008 |
| AC-26 | Cancel a requested run directly without starting it or affecting an active run. | T003, T007, T008 |
| DAC-E5-4 | Derive the outcome from persisted results rather than a caller-selected or requested outcome. | T004, T005, T006, T007 |
| DAC-E5-5 | Succeed only when every roster instrument has successful results for all four required data types; otherwise record partial or failed. | T004, T005, T007 |
| DAC-E5-6 | Record running cancellation cooperatively and expose it for observation between instruments. | T002, T006, T007 |
| DAC-E5-7 | Keep `cancelled` terminal and distinct from `failed`, retaining committed coverage. | T002, T007 |
| DAC-E5-8 | Transition a requested run directly to `cancelled`. | T003, T007 |
| DAC-E5-9 | Reject terminal cancellation with the persisted actual state. | T003, T006, T007 |
| DAC-E5-S3-1 | Move `running` to `cancelling`, then reach `cancelled` only when finalisation acknowledges the observed request. | T002, T007, T008 |
| DAC-E5-S3-2 | Preserve committed coverage/results and leave unreached instruments absent after cancellation. | T002, T008 |
| DAC-E5-S3-3 | Leave an independent active run unchanged when a queued run is cancelled. | T003, T007 |
| DAC-E5-S3-4 | Report a raced terminal completion rather than claiming cancellation occurred. | T003, T006, T007 |
| DAC-E5-S3-5 | Finalise complete `written`/`unchanged` results as `succeeded`. | T004, T007 |
| DAC-E5-S3-6 | Finalise mixed successful and `not_found`/`failed` results as `partial`. | T005, T007 |
| DAC-E5-S3-7 | Finalise a run with no successful result as `failed`. | T005, T007 |

## Phase 1: Setup

**Purpose**: Verify the prerequisite run schema and existing journal boundary without taking ownership of either prerequisite.

- [x] T001 Confirm on the eventual coding branch that CAP-001-E5-S1 has supplied `migrations/0003_coverage.sql`, `migrations/0004_runs.sql`, `src/factorflow/runs/__init__.py`, `src/factorflow/runs/states.py`, and `tests/conftest.py::migrated_run_schema_connection`, and that CAP-001-E5-S2 has supplied `src/factorflow/runs/journal.py` with `request_run` and `claim_next`; block S3 implementation if any contract is absent or inconsistent rather than creating, moving, or duplicating S1/S2-owned work.

**Checkpoint**: The coding branch has one consistent S1 run schema/state package and the S2 journal module that S3 will extend; this phase changes no prerequisite artifact.

---

## Phase 2: Tests (TDD)

**Purpose**: After T001 passes, write and observe failing PostgreSQL and unit tests for every component test mapped to this story before adding cancellation or finalisation behavior.

### Mandatory Component Tests

- [x] T002 Create `tests/integration/test_run_cancel.py` cases for TC-COMP-019, TC-COMP-241, TC-COMP-242, TC-COMP-266, and TC-COMP-267 using `migrated_run_schema_connection`: seed a claimed `running` run plus committed observation/coverage/result rows for one instrument; assert `request_cancel` atomically sets that run to `cancelling` with `cancel_requested_at`, leaves it non-terminal until `cancellation_requested` is observed and `finalise` is called, then records terminal `cancelled` with `ended_at`; assert every committed row remains byte-for-byte readable and a later unreached instrument has no coverage or result row. Add a `# Implements TC-COMP-...` traceability comment for every listed case (depends on T001).
- [x] T003 Add `tests/integration/test_run_cancel.py` cases for TC-COMP-026, TC-COMP-243, TC-COMP-244, TC-COMP-268, and TC-COMP-269: cancel a `requested` row while a distinct run is active and assert direct `cancelled`, non-null `ended_at`, null `started_at`, exclusion from subsequent `claim_next`, and no field change on the active row; parameterize cancellation after each terminal state (`succeeded`, `partial`, `failed`, `cancelled`, `abandoned`) and assert `RunAlreadyTerminal` carries the persisted state while the row remains unchanged. Add a traceability comment for every listed case (depends on T001–T002).
- [x] T004 [P] Create `tests/integration/test_run_outcome.py` cases for TC-COMP-239, TC-COMP-240, and TC-COMP-270: seed `instruments_named` and exactly four persisted per-data-type results per named instrument, mix `written` and `unchanged`, invoke `finalise(run_id)` without an outcome argument, and assert `succeeded` plus `ended_at`; then omit one required result and assert the same requested roster cannot be promoted to `succeeded`. Add a traceability comment for every listed case (depends on T001).
- [x] T005 Add `tests/integration/test_run_outcome.py` cases for TC-COMP-240, TC-COMP-271, and TC-COMP-272: assert at least one successful `written`/`unchanged` result combined with a `not_found`, `failed`, `skipped`, or missing required result finalises `partial`; assert zero successful results finalises `failed`, both when no instrument was reached and when reached rows are all `not_found`/`failed`; and assert neither branch can become `succeeded`. Add a traceability comment for every listed case (depends on T001, T004).

### Additional Unit Tests

- [x] T006 [P] Extend `tests/unit/test_run_journal.py` with focused cursor/connection-boundary tests for bound UUID/state parameters, exact mapping of `written` and `unchanged` to the successful-result set, the four-required-data-types completeness check, a non-caller-selectable `finalise(connection, run_id)` signature, `RunAlreadyTerminal.actual_state`, and validation-before-write through the S1 state-transition helper; assert SQL values are passed as psycopg parameters rather than interpolated (depends on T001).

**Checkpoint**: All 15 mapped component tests are represented by trace comments, database tests carry the `postgres` marker, and the new tests are observed RED because the S2 journal lacks S3 cancellation/finalisation behavior.

---

## Phase 3: Core Implementation

**Purpose**: Extend the existing journal with the approved cooperative-cancellation and persisted-outcome operations only.

- [x] T007 Update `src/factorflow/runs/journal.py` to define `RunAlreadyTerminal` carrying `actual_state` and implement the approved `request_cancel(connection, run_id) -> str`, `cancellation_requested(connection, run_id) -> bool`, and `finalise(connection, run_id) -> str` interfaces with typed psycopg boundaries, bound parameters, row locking/transactional state checks, and the S1 transition validator. Make `requested -> cancelled` set `cancel_requested_at` and `ended_at` without touching another active row; make `running -> cancelling` record intent without an end time; make finalisation of an observed `cancelling` run perform `cancelling -> cancelled`; and make every terminal transition clear claim fields as required by the schema. For non-cancelled running runs, derive `failed`, `succeeded`, or `partial` only from `instruments_named` and persisted `run_instrument_result` rows: four successful (`written`/`unchanged`) data-type rows per named instrument and no non-success/missing row earns `succeeded`, zero successful rows is `failed`, and every other completed roster is `partial`. Never accept a caller-supplied outcome and never update or delete coverage/result rows (depends on T001–T006).

**Checkpoint**: Cancellation races return the stored terminal state, cooperative cancellation remains non-terminal until runner finalisation, and only complete persisted success earns `succeeded`.

---

## Phase 4: Integration

**Purpose**: Prove the S3 journal API satisfies the already-approved runner and writer contracts without duplicating their implementation ownership.

- [x] T008 Run `tests/integration/test_run_cancel.py`, `tests/integration/test_run_outcome.py`, and `tests/unit/test_run_journal.py` against the production journal; verify the interface remains compatible with CAP-001-E4-S5's runner contract (`cancellation_requested` at the between-instruments boundary followed by argument-free `finalise`) and CAP-001-E4-S6's per-data-type result contract (untouched instruments have no row). Correct mismatches only in `src/factorflow/runs/journal.py` and these S3-owned tests; do not modify `src/factorflow/ingestion/runner.py`, `src/factorflow/ingestion/writer.py`, or `src/factorflow/ingestion/outcomes.py` under this story (depends on T007).

**Checkpoint**: The public journal boundary can be consumed by the separately owned runner/writer work, while S3 changes remain confined to cancellation, finalisation, and their tests.

---

## Phase 5: Polish

**Purpose**: Kill the principal cancellation/outcome mutations and complete repository validation and per-task evidence.

- [x] T009 Strengthen `tests/integration/test_run_cancel.py`, `tests/integration/test_run_outcome.py`, and `tests/unit/test_run_journal.py` after manually mutating the direct queued-cancel path, terminal-state guard, delayed cancelling acknowledgement, active-row isolation, successful-outcome set, four-data-type completeness rule, and zero-success classification; retain tests that kill every mutation. Run the focused RED→GREEN→MUTATE→STRENGTHEN→REFACTOR cycle and record each task's executions, mutation result, commit hash, code-review verdict, and spec-drift verdict in `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3-tdd-evidence.yaml` before beginning the next committed cycle (depends on T008).

**Checkpoint**: Tests fail if cancellation becomes immediate for a running run, a queued cancellation changes the active run, a terminal request mutates state, missing/non-success results earn success, or a run with zero successful results is not failed; all required review and TDD evidence is present.

## Dependencies & Execution Order

### Task Dependencies

- T001 is a blocking prerequisite verification: it depends on CAP-001-E5-S1 and CAP-001-E5-S2 landing consistently and must not implement missing prerequisite contracts.
- T002 and T003 share `tests/integration/test_run_cancel.py` and proceed sequentially after T001.
- T004 and T006 may begin after T001 and run in parallel with T002 because they target different files; T005 follows T004 in `tests/integration/test_run_outcome.py`.
- T007 depends on T001–T006 and observed RED evidence; T008 depends on T007; T009 depends on T008.

### Per-Task Commit Gate

- Before every T001–T009 commit, stage only that task's diff, dispatch an independent code-review subagent and record its verdict, then dispatch an independent spec-drift verify subagent and record `drift_detected`.
- Append both verdicts to that task's entry in `CAP-001-E5-S3-tdd-evidence.yaml` before committing. Do not commit a `REJECTED` review or `drift_detected: true`; fix it or escalate to the parent agent first. After a permitted commit, record its hash before starting the next TDD cycle.

### Parallel Opportunities

- T004 and T006 can proceed in parallel with T002 after T001 because they edit separate files.
- T002–T003 and T004–T005 each share one integration-test file and must not be edited concurrently within their pair.

### Phase Dependencies

- Phase 1 blocks coding until S1/S2 prerequisites exist consistently; Phase 2 must reach observed RED before Phase 3 begins under TDD.
- Phase 4 follows the journal implementation; Phase 5 follows the integrated public-boundary run.
- Planning may complete despite the unresolved S1 implementation dependency; the eventual coding run stops at T001 until S1's migration contradiction is resolved and its contracts have landed consistently.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Targeted database tests: `uv run pytest -m postgres tests/integration/test_run_cancel.py tests/integration/test_run_outcome.py`
- Targeted unit tests: `uv run pytest tests/unit/test_run_journal.py`
- Full Python tests: `uv run pytest`
- Non-container fallback (report as partial, never as a green full suite): `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- On a disposable PostgreSQL 16 database, execute TC-COMP-019, TC-COMP-026, TC-COMP-239 through TC-COMP-244, and TC-COMP-266 through TC-COMP-272; verify all 15 mapped test cases carry trace comments.
- Assert a running cancellation persists `cancelling` without `ended_at`, is visible between instruments, and reaches `cancelled` only through argument-free finalisation; assert retained rows are unchanged and later-instrument rows are absent.
- Assert a requested cancellation remains unstarted and unclaimable, sets a terminal end time, and leaves a distinct active row unchanged; assert every terminal-state race returns that exact stored state.
- Assert finalisation uses the persisted `instruments_named` value and four per-data-type rows per named instrument, treats `written` and `unchanged` as success, defaults incomplete/mixed completion to `partial`, and records `failed` when no successful result exists.
- Inspect the callable signature and SQL-boundary unit tests to verify the runner cannot supply an outcome and UUID/state values are bound parameters.
- Record per-cycle RED, GREEN, mutation, strengthening, refactor, code-review, and spec-drift evidence required by TEST-TDD-001 through TEST-TDD-008 and the per-task review contract.

---

## Notes

### Resolved Conflicts

- `component-design-run-journal.md` section 2.5 says a reached run with all `failed`/`not_found` rows falls through to `partial`, while DAC-E5-5 and DAC-E5-S3-7 require `failed` when none wrote. Story acceptance criteria govern design prose, and `unchanged` is explicitly successful, so this plan defines `failed` as zero persisted `written`/`unchanged` results; mixed success/non-success remains `partial`.
- The stale plan introduced a separate runner acknowledgement function, but the approved run-journal interface defines only `request_cancel`, `cancellation_requested`, and `finalise`, and the approved acquisition-runner flow calls argument-free `finalise` after observing cancellation. T007 therefore uses `finalise` as the acknowledgement transition and adds no unapproved API.
- The stale plan assigned a `runner.py` modification to S3, but CAP-001-E4-S5 owns the between-instruments loop and already specifies the cancellation check plus argument-free finalisation. S3 owns the journal implementation and compatibility verification only; T008 forbids duplicate runner/writer edits.

### Open Gaps

- None. The four required data types are fixed by AC-3 and the schema data-type check, persisted roster size is `acquisition_run.instruments_named`, outcome classes are fixed by DAC-E5-5 and the S3 derived criteria, and no value in this plan is provisional.

### Other Notes

- **Implementation prerequisite — unresolved:** CAP-001-E5-S1's approved story assigns `acquisition_state` to `migrations/0004_runs.sql`, while the approved market-data-store design places it in `migrations/0003_coverage.sql`. No traceable decision record resolves that contradiction. This does not alter S3 behavior or block this planning artifact, but T001 must block the eventual coding run until the owner resolves S1 and its schema/state/fixture contracts land consistently; S3 must not select or move a migration.
- CAP-001-E5-S1 owns the run schema, state-transition module, and migrated fixture; CAP-001-E5-S2 owns request/claim operations in the journal. S3 verifies and consumes those contracts instead of recreating them.
- CAP-001-E4-S6 owns classification and persistence of reached per-data-type result rows, and CAP-001-E4-S5 owns the runner loop. S3 may seed their approved persisted shapes in tests but must not duplicate their production logic.
- The schema permits `skipped`, but the approved success set contains only `written` and `unchanged`; a reached `skipped` row therefore cannot earn `succeeded` and falls into `partial` when any successful result exists.
