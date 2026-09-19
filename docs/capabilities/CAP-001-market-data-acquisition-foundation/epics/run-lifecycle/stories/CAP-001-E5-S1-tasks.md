---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S1-tasks
artifact_type: story-tasks
artifact_version: 3
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-19
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-19T17:30:00Z
  source_artifacts:
    - id: CAP-001-E5-S1
      version: "2"
    - id: CAP-001-E5
      version: "2"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-schema-migrator
      version: "4"
    - id: CAP-001-component-design-observation-writer
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S1 — Coverage, Run Schema and State Machine

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-S1`
**Date**: 2026-09-19

## Summary

Create the consecutive coverage-state and run-journal migrations plus the pure run-state transition module. Migration `0003_coverage.sql` establishes non-overlapping coverage evidence and last-acquisition state; `0004_runs.sql` establishes run lifecycle and per-instrument results. PostgreSQL constraints enforce the persisted invariants, `states.py` rejects illegal transitions before a write, and the existing migrator proves both new files apply after the already-landed observation schema without rewriting history.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | Persist per-instrument, per-data-type coverage ranges and last-acquisition state. | T002, T008, T011, T014 |
| AC-9 | Preserve the run states and result evidence needed to prevent a named failure from being recorded as success. | T003, T009, T010, T011, T014 |
| AC-12 | Reject overlapping coverage evidence rather than permit false or double-counted coverage. | T002, T008, T011, T014 |
| AC-15 | Apply migrations 0003 and 0004 after an existing migration-0002 store without rewriting history. | T004, T006, T007, T008, T010, T011, T012, T014 |
| DAC-E5-1 | Define exactly eight run states and reject illegal transitions before writes. | T005, T009, T014 |
| DAC-E5-3 | Enforce at most one active run with a partial unique index. | T003, T010, T011, T014 |
| DAC-E5-S1-1 | Validate transitions through a pure mapping before database access. | T005, T009, T014 |
| DAC-E5-S1-2 | Backstop state, claim and terminal-end agreement in PostgreSQL. | T003, T010, T011, T014 |
| DAC-E5-S1-3 | Snapshot positive history depth on the run row. | T003, T010, T011, T014 |
| DAC-E5-S1-4 | Permit only one `running` or `cancelling` row. | T003, T010, T011, T014 |
| DAC-E5-S1-5 | Index requested runs for FIFO ordering. | T003, T010, T011, T014 |
| DAC-E5-S1-6 | Require an end timestamp exactly for terminal states. | T003, T010, T011, T014 |
| DAC-E5-S1-7 | Persist per-run, per-instrument, per-data-type outcome evidence. | T003, T010, T011, T014 |
| DAC-E5-S1-8 | Constrain coverage data types and inclusive range ordering. | T002, T008, T011, T014 |
| DAC-E5-S1-9 | Reject overlapping inclusive coverage while permitting disjoint ranges. | T002, T008, T011, T014 |
| DAC-E5-S1-10 | Persist last attempt state independently of coverage changes. | T002, T008, T011, T014 |
| DAC-E5-S1-11 | Keep 0003 and 0004 ordered, design-aligned and free of transaction control. | T004, T006, T007, T008, T010, T011, T012, T014 |

## Phase 1: Setup

**Purpose**: Verify the already-landed schema baseline before planning tests against migrations 0003 and 0004.

- [x] T001 Confirm `migrations/0001_extensions_owner_state.sql`, `migrations/0002_observations.sql`, `src/factorflow/db/migrator.py`, `tests/conftest.py::postgres_connection_string`, and PostgreSQL 16 testcontainers are present on the coding branch; block rather than recreate CAP-001-E1-S1, CAP-001-E1-S2 or CAP-001-E4-S1 artifacts if any prerequisite is absent (prerequisite infrastructure for all criteria).

**Checkpoint**: The coding branch contains a contiguous migration baseline through 0002 and the existing isolated-database fixture and migrator seams needed by every S1 test.

---

## Phase 2: Tests (TDD)

**Purpose**: Write and observe RED tests for the state machine, coverage schema, run schema, migration ordering and design fidelity before adding production artifacts.

### Mandatory Component Tests

- [x] T002 [P] Create `tests/integration/test_coverage_constraints.py` for TC-COMP-007 and TC-COMP-012: apply migrations through `0003_coverage.sql`; assert `coverage_segment` and `acquisition_state` expose the exact design fields; insert all four valid data types; assert unknown data types, reversed ranges and overlapping inclusive ranges are rejected by their named constraints; assert disjoint ranges remain valid; persist `written`, `not_found` and `failed` acquisition states without adding coverage for failed attempts; add `# Implements TC-COMP-007, TC-COMP-012` traceability comments and explicit assertions for DAC-E5-S1-8 through DAC-E5-S1-10 (depends on T001).
- [x] T003 [P] Create `tests/integration/test_run_constraints.py` for TC-COMP-009, TC-COMP-238 and TC-COMP-254 through TC-COMP-259: apply migrations through `0004_runs.sql`; assert all run/result columns, defaults, checks and indexes exist; prove positive depth is required; prove active rows require claim fields and inactive rows forbid them; prove terminal states require `ended_at` and non-terminal states forbid it; assert a second active row raises `UniqueViolation`; persist and read back a valid requested run and per-instrument result including reason and attempts. Treat TC-COMP-009 as S1's schema-evidence portion only, leaving result-derived finalisation to CAP-001-E5-S3; add one `# Implements TC-COMP-...` comment per mapped case (depends on T001).
- [x] T004 [P] Create `tests/integration/test_migrations_apply.py` for TC-COMP-015: use `factorflow.db.migrator.discover` and `apply_pending` against a database already migrated through 0002; assert the first application returns `[3, 4]`, records both checksums in order, preserves pre-existing instrument and observation rows byte-for-byte, and a second application returns no versions and changes no rows. Add `# Implements TC-COMP-015` (depends on T001).
- [x] T005 [P] Create `tests/unit/test_run_states.py` for TC-COMP-236 and TC-COMP-253: assert the exported state set is exactly `requested`, `running`, `cancelling`, `succeeded`, `partial`, `failed`, `cancelled` and `abandoned`; exercise every approved legal edge plus representative unknown, illegal and terminal-source edges; assert the pure validator raises a typed error without accepting a connection or invoking a write. Add both traceability comments.

### Additional Unit Tests

- [x] T006 [P] Update `tests/unit/design_sql.py` with a narrowly named helper that selects the SQL fence following a bold migration filename within section 2.3, then create `tests/unit/test_schema_migrations_match_design.py` to compare `migrations/0003_coverage.sql` and `migrations/0004_runs.sql` byte-for-byte with their respective approved design blocks; assert `acquisition_state` exists only in 0003, run tables exist only in 0004, and unknown labels or missing/unclosed fences fail loudly.
- [x] T007 Extend `tests/unit/test_migration_filenames.py` with an assertion that the real migration inventory is exactly contiguous through version 4 once S1 lands and that 0003/0004 contain no `BEGIN`, `COMMIT` or non-transactional DDL; retain the existing general filename/content tests rather than duplicating their implementation (depends on T001).

**Checkpoint**: State tests are RED because `factorflow.runs.states` does not exist; coverage, run, migration-application and design-drift tests are RED because migrations 0003 and 0004 do not exist. Every database test is marked `postgres`, and RED evidence is recorded before implementation begins.

---

## Phase 3: Core Implementation

**Purpose**: Add the two design-assigned SQL migrations and the pure typed transition boundary that make the focused tests pass.

- [x] T008 Create `migrations/0003_coverage.sql` byte-for-byte from the approved `component-design-market-data-store.md` section 2.3 block: define `coverage_segment`, `idx_coverage_instrument`, `coverage_data_type_known`, `coverage_range_ordered`, the GiST `coverage_no_overlap` exclusion constraint, and `acquisition_state` with its composite key and known data-type/outcome checks; retain `last_run_id uuid` without a foreign key to the later run migration and include no transaction-control statement (depends on T002, T004, T006, T007).
- [x] T009 Create `src/factorflow/runs/__init__.py` and `src/factorflow/runs/states.py`: expose exactly the eight approved state values, encode only `requested -> running|cancelled`, `running -> cancelling|succeeded|partial|failed|abandoned`, and `cancelling -> cancelled|abandoned` in an immutable mapping, and provide a fully typed pure validation function plus a typed illegal-transition error; terminal states remain absorbing and validation performs no database access (depends on T005).
- [x] T010 Create `migrations/0004_runs.sql` byte-for-byte from the approved market-data-store section 2.3 block: define `acquisition_run` with all four named checks and the single-active, requested-FIFO and recent-run indexes; define `run_instrument_result` with its composite key, both foreign keys, known data-type/outcome checks, defaults and failure index; include neither `acquisition_state` nor transaction-control statements (depends on T003, T004, T006 through T008).

**Checkpoint**: Applying migrations 0001 through 0004 yields the design's observation, coverage-state and run-journal schema in order, while the state module admits only the approved lifecycle edges.

---

## Phase 4: Integration

**Purpose**: Reuse the production migrator and shared PostgreSQL fixture so later E4/E5 stories consume one verified schema boundary.

- [x] T011 Update `tests/conftest.py` with `MIGRATION_0002_PATH`, `MIGRATION_0003_PATH`, `MIGRATION_0004_PATH` and a `migrated_run_schema_connection` fixture that calls `discover` and `apply_pending` over the real migrations directory against each test's isolated database; refactor the full-schema paths in `tests/integration/test_coverage_constraints.py` and `tests/integration/test_run_constraints.py` to consume it while retaining explicit stop-after-0003 coverage for the ownership boundary (depends on T002 through T004 and T008 through T010).
- [x] T012 Update `migrations/README.md` so its Files table attributes `0002_observations.sql` to CAP-001-E4-S1 and both `0003_coverage.sql` and `0004_runs.sql` to CAP-001-E5-S1, preserving the numbered, forward-only, one-file-one-transaction conventions (depends on T008, T010; traceability infrastructure for AC-15 and DAC-E5-S1-11).

**Checkpoint**: Later stories can request one isolated connection with all four migrations applied by the production migrator, and the migration inventory names the correct owning stories.

---

## Phase 5: Polish

**Purpose**: Preserve RED, GREEN, mutation, strengthening and refactor evidence, then run every repository quality gate relevant to this schema story.

- [x] T013 Create `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1-tdd-evidence.yaml`; for each coherent TDD cycle with recoverable history, record the observed RED command before its production task, GREEN afterward, the staged-diff code-review verdict, the staged-diff spec-drift verdict, tests executed and non-empty commit hash before beginning the next cycle. For the completed historical `design-sql-fence-helper` and `schema-constraint-strengthening` cycles only, record the missing pre-production RED evidence and commit hashes as unreconstructable, retain the owner exception dated 2026-09-19, and do not fabricate evidence. Manually mutate and restore at least: one legal state edge, coverage range ordering, the overlap exclusion, acquisition-state outcome validation, the active-run predicate, terminal/end-time agreement, migration ownership of `acquisition_state`, and preservation of a pre-0003 observation row. Strengthen any surviving test before proceeding (depends throughout on T002 through T012; implements TEST-TDD-001 through TEST-TDD-008 and INV-TDD-004).
- [x] T014 Run `uv sync --all-extras`, `uv run pytest tests/unit/test_run_states.py tests/unit/test_schema_migrations_match_design.py tests/unit/test_migration_filenames.py`, `uv run pytest -m postgres tests/integration/test_coverage_constraints.py tests/integration/test_run_constraints.py tests/integration/test_migrations_apply.py`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv build`; record exact results in the TDD evidence and report PostgreSQL tests as excluded rather than green if the container runtime is unavailable (depends on T013).

**Checkpoint**: All 13 mapped component cases and the four new story-derived schema contracts are exercised, every material mutation is killed or strengthens a test, the full Python suite and quality gates pass, and no unrelated artifact changed.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 verifies the landed 0001/0002 and fixture/migrator prerequisites.
- T002 through T006 may be authored in parallel after T001 where marked; T007 extends existing migration tests after T001.
- T008 depends on the coverage, migration-application and design-drift RED tests; T009 depends on state RED tests; T010 depends on run, migration and design-drift RED tests plus T008's preceding migration.
- T011 depends on both migrations and their focused tests; T012 depends on both migration files.
- T013 is interleaved after each T002 through T012 cycle and gates its commit; T014 is the final restored-tree validation.

### Parallel Opportunities

- T002 through T006 affect separate test files or helpers and may proceed in parallel after T001, except that T006's helper edit must land before its new drift tests execute.
- T008 and T009 target separate production artifacts and may proceed in parallel after their respective RED evidence.
- T010 remains sequential after T008 because migration numbering and the 0004 design-drift test require 0003 to exist first.

### Phase Dependencies

- Phase 2 must produce observed RED evidence before Phase 3 begins.
- Migration 0003 must be implemented and green before migration 0004.
- Phase 4 follows both migrations and the state module; Phase 5 validates the restored integrated tree.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Full Python tests: `uv run pytest`
- Non-container Python tests: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Start with a database containing applied migrations 0001 and 0002 plus sentinel instrument and observation rows; apply 0003 and 0004 through `apply_pending`, verify `[3, 4]`, verify sentinel rows remain byte-identical, and verify a second application is a no-op.
- Stop after 0003 and prove only coverage/state tables exist; then apply 0004 and prove only then the run/result tables exist.
- Insert valid and invalid coverage/state rows to exercise every named 0003 check, disjoint-range acceptance and overlap rejection.
- Insert valid and invalid run/result rows to exercise positive depth, state, claim, terminal-end, data-type, outcome, key and single-active constraints independently.
- Compare both migration files to their filename-selected design SQL blocks and fail if a table, check, index or migration assignment moves.
- Exercise every allowed transition and representative unknown, illegal and terminal-source transition through `factorflow.runs.states` without a database dependency.
- Preserve all RED, GREEN, mutation, review, refactor and final validation evidence in `CAP-001-E5-S1-tdd-evidence.yaml`; never present the non-container fallback as a green full suite.

---

## Notes

### Resolved Conflicts

- None. CAP-001-E5-S1 v2 and `component-design-market-data-store.md` v6 now agree that `0003_coverage.sql` owns `coverage_segment` and `acquisition_state`, while `0004_runs.sql` owns `acquisition_run` and `run_instrument_result`.

### Open Gaps

- The current component test specification and coverage matrix predate story v2 and therefore have no dedicated TC-COMP IDs for DAC-E5-S1-8 through DAC-E5-S1-11. This plan sharpens existing TC-COMP-007, TC-COMP-012 and TC-COMP-015 into concrete schema assertions and adds explicit tests for all four derived criteria. The next test-design revision should add direct traceability rows without renumbering or reusing existing TC IDs.

### Other Notes

- **Owner-approved T013 exception (2026-09-19):** The owner approved the limited revision above for the two named historical cycles. Their RED records and non-empty commit hashes were never created and cannot be reconstructed from Git history or the inherited worktree. The evidence file must name that absence and must not manufacture a substitute. This approval is limited to those cycles; it does not relax the normal evidence requirement for any future cycle or rework.

- TC-COMP-009 is broader than S1: this story provides the persisted state and result evidence, while CAP-001-E5-S3 owns result-derived finalisation. S1 must not add a trigger, cross-table success constraint or finaliser to claim the whole behavior.
- `last_run_id` in `acquisition_state` deliberately has no foreign key to `acquisition_run`; adding one would create a forward dependency from migration 0003 to migration 0004.
- All database assertions use PostgreSQL 16 through testcontainers. SQLite, an ORM and in-memory substitutes are outside the approved stack and cannot prove the GiST exclusion or partial-index behavior.
