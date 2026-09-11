---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S1-tasks
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
    - id: CAP-001-E5-S1
      version: "1"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "approved"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S1 — Run Schema and State Machine

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-tasks`
**Date**: 2026-09-11

## Summary

Create the forward-only coverage and run-journal migrations and the small, explicit run-state transition module. PostgreSQL constraints and indexes enforce the persisted lifecycle and one-active-run invariant, while `states.py` rejects illegal transitions before a write. The owner has confirmed that `acquisition_state` belongs with coverage in `0003_coverage.sql`; `0004_runs.sql` therefore contains only run-journal tables and indexes.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-9 | A recorded success cannot conceal a named instrument failure. | T002, T004, T006 |
| DAC-E5-1 | Define exactly eight states and reject illegal transitions before writing. | T001, T003, T005, T006 |
| DAC-E5-3 | A partial unique index makes a second active claim fail. | T002, T004, T006 |
| DAC-E5-S1-1 | `states.py` checks legal-transition mapping before a write. | T001, T005, T006 |
| DAC-E5-S1-2 | Run-row checks backstop known state, claim agreement, and terminal end time. | T002, T004, T006 |
| DAC-E5-S1-3 | A run row snapshots `history_depth_years` at request time. | T002, T004, T006 |
| DAC-E5-S1-4 | An index permits at most one `running` or `cancelling` run. | T002, T004, T006 |
| DAC-E5-S1-5 | An index serves FIFO requested-run ordering. | T002, T004, T006 |
| DAC-E5-S1-6 | Every terminal run has an end timestamp. | T002, T004, T006 |
| DAC-E5-S1-7 | Per-instrument results retain instrument, data type, outcome, and reason. | T002, T004, T006 |

## Phase 1: Setup

**Purpose**: Reuse the repository's PostgreSQL 16 testcontainer fixture and forward-only migration convention; this schema story requires no new dependency or runtime configuration.

**Checkpoint**: Tests can apply the ordered migrations to an isolated database without embedding transaction control in a migration file.

---

## Phase 2: Tests (TDD)

**Purpose**: Write and observe failing unit and PostgreSQL tests for the state machine, migration ownership, tables, checks, and indexes before creating either migration or production module.

### Mandatory Component Tests

- [ ] T001 [P] Create `tests/unit/test_run_states.py` for TC-COMP-236 and TC-COMP-253: assert the exported state set is exactly `requested`, `running`, `cancelling`, `succeeded`, `partial`, `failed`, `cancelled`, and `abandoned`; exercise every listed legal edge and representative terminal/unknown illegal edges; assert an illegal transition raises before any database interaction. Add `# Implements TC-COMP-236, TC-COMP-253` traceability comments.
- [ ] T002 [P] Create `tests/integration/test_run_schema.py` for TC-COMP-009, TC-COMP-238, and TC-COMP-254 through TC-COMP-259: apply migrations `0001` through `0004` to a fresh PostgreSQL database; assert `acquisition_state` is available after `0003` and before `0004`; assert the run tables, `acquisition_run_state_known`, `acquisition_run_claim_agrees`, `acquisition_run_terminal_has_end`, FIFO and failure indexes, and data-type/outcome checks exist; insert invalid rows to prove each constraint rejects them, including a second active run; and insert a valid queued run/result to prove its stored depth and result fields persist. Add a `# Implements TC-COMP-...` comment for every listed test case.

### Additional Unit Tests

- [ ] T003 [P] Create `tests/unit/test_run_migrations_match_design.py`: use the existing design-SQL helper pattern to compare `migrations/0003_coverage.sql` and `migrations/0004_runs.sql` to the corresponding SQL blocks in `component-design-market-data-store.md` section 2.3, with an explicit assertion that `acquisition_state` is in `0003_coverage.sql` and absent from `0004_runs.sql`; include a fixture/assertion that detects a moved table or changed check/index.

**Checkpoint**: The state tests are RED because `factorflow.runs.states` does not exist, and the database/design-drift tests are RED because migrations `0003` and `0004` do not exist. All PostgreSQL tests carry the `postgres` marker.

---

## Phase 3: Core Implementation

**Purpose**: Add the canonical coverage-state and run-journal SQL schemas plus a pure, typed state-transition boundary.

- [ ] T004 Create `migrations/0003_coverage.sql` with the component-design `coverage_segment` table, indexes, exclusion constraint, and `acquisition_state` table exactly as specified; retain its `last_run_id uuid` value without adding a foreign key to a later migration, and include no `BEGIN` or `COMMIT` (depends on T002, T003).
- [ ] T005 Create `src/factorflow/runs/__init__.py` and `src/factorflow/runs/states.py`: define the eight-state enum/value set, the legal-transition mapping, and a transition-validation function that raises a typed error for an illegal source/target pair without performing a write (depends on T001).
- [ ] T006 Create `migrations/0004_runs.sql` with `acquisition_run`, its specified state/positive-depth/claim-agreement/terminal-end checks, `idx_acquisition_run_single_active`, `idx_acquisition_run_requested`, and `idx_acquisition_run_recent`; then add `run_instrument_result` with its composite primary key, instrument/run foreign keys, data-type and outcome checks, and `idx_run_result_failures`. Do not create `acquisition_state` in this migration (depends on T002–T004).

**Checkpoint**: Applying `0001`, `0002`, `0003`, and `0004` in order creates one coverage-state projection and one run journal, and the state module admits only lifecycle edges specified by the story.

---

## Phase 4: Integration

**Purpose**: Prove the production schema is discoverable by the existing migrator and that its application-level and PostgreSQL backstops agree.

- [ ] T007 Update `tests/conftest.py` with a `migrated_run_schema_connection` fixture that applies migrations `0001` through `0004` in numerical order, and update `tests/integration/test_run_schema.py` to consume it; keep each test database isolated and preserve the existing fixture conventions (depends on T002, T004, T006).

**Checkpoint**: A fresh PostgreSQL test database receives the full prerequisite schema in its numbered order, and invalid lifecycle rows fail at the database boundary even if an application caller bypasses `states.py`.

---

## Phase 5: Polish

**Purpose**: Complete the required RED→GREEN→MUTATE→STRENGTHEN evidence and run the repository quality gates.

- [ ] T008 Run `uv run pytest tests/unit/test_run_states.py tests/unit/test_run_migrations_match_design.py`, `uv run pytest -m postgres tests/integration/test_run_schema.py`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv build`; record RED before T004–T006, then manually mutate a legal transition, omit the active-run predicate from the unique index, omit the terminal-end check, and move `acquisition_state` to `0004` to verify named tests fail before restoring the implementation (depends on T007).

**Checkpoint**: Every mapped test passes against PostgreSQL and each changed behavior has recorded RED, GREEN, mutation, strengthening, and refactor evidence required by TEST-TDD-001 through TEST-TDD-008.

---

## Dependencies & Execution Order

### Task Dependencies

- T001, T002, and T003 have no production-code dependency and can be authored in parallel.
- T004 depends on the database and drift tests from T002–T003; T005 depends on T001.
- T006 depends on the coverage migration from T004 and the schema tests from T002–T003.
- T007 depends on T002, T004, and T006.
- T008 depends on T007.

### Parallel Opportunities

- T001, T002, and T003 edit different test files and can run in parallel.
- T004 and T005 can proceed in parallel after their respective RED tests; T006 remains sequential after T004.

### Phase Dependencies

- Phase 2 must produce observed RED results before Phase 3 begins.
- `0003_coverage.sql` must precede `0004_runs.sql` so its acquisition projection is established independently of the run journal.
- Phase 4 follows both migrations; Phase 5 follows the integrated fixture and passing targeted tests.

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Full Python tests: `uv run pytest`
- Targeted database tests: `uv run pytest -m postgres tests/integration/test_run_schema.py`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Apply migrations `0001` through `0004` to PostgreSQL 16 and verify `acquisition_state` exists immediately after `0003`, while `acquisition_run` and `run_instrument_result` first exist after `0004`.
- Directly insert unknown-state, missing-claim, missing-terminal-end, duplicate-active, invalid data-type, and invalid result-outcome rows, and assert PostgreSQL rejects every invalid row.
- Exercise all allowed transition edges plus illegal and terminal-state edges solely through `factorflow.runs.states`; assert no transition validation needs a database connection.
- Confirm the migrations contain no transaction-control statements and match the design SQL blocks, then retain the RED→GREEN→MUTATE→STRENGTHEN evidence required by the testing constitution.

## Notes

### Resolved Conflicts

- **Owner-confirmed decision (2026-09-11):** `acquisition_state` belongs in `migrations/0003_coverage.sql`. The storage design groups it with `coverage_segment` as an instrument/data-type acquisition projection, and `last_run_id` has no foreign-key dependency on `acquisition_run`; T004 implements that confirmed ownership and T006 explicitly excludes it.

### Open Gaps

- None. The owner has resolved the only planning blocker: migration ownership of `acquisition_state`.

### Other Notes

- The approved story's Data Changes section still says that `0004_runs.sql` creates `acquisition_state`, while `component-design-market-data-store.md` section 2.3 places it in `0003_coverage.sql`. This plan follows the owner-confirmed `0003` decision without editing either approved artifact. Flag the migration ownership correction for the next revisions of both the story and the storage design so their normative text and illustrative SQL agree.
- `migrations/0003_coverage.sql` is a prerequisite to `migrations/0004_runs.sql` even though `last_run_id` is not a foreign key; do not introduce a circular migration dependency merely to link the projection to the journal.
- All database assertions use real PostgreSQL via testcontainers; no ORM or in-memory database substitute belongs in this schema story.
