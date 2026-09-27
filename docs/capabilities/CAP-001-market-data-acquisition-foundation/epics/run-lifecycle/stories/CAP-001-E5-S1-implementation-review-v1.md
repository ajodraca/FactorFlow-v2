---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-19
updated: 2026-09-19
story_id: "CAP-001-E5-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-19T17:08:23Z"
reviewed_head: "3c12386a7586c3d345b36a4b7b95f57beeb7c6ed"
review_base: "4f19b88b0ea33e8d3510a90789dac09432c54bf5"
reviewed_state_revision: "sha256:27b494d20dc22c80cf66547fee4b04604eb62b47908ae2ad71b48c38ceee69f0"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E5-S1
    artifact_version: 2
    content_revision: sha256:f0d92c5384e5497972ae3b2023856421abcdd57a27c26f45fb515292412a8d97
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-19T17:08:23Z
  source_artifacts:
    - id: CAP-001-E5-S1
      version: "2"
    - id: CAP-001-E5-S1-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E5-S1 — Version 1

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 3 · MEDIUM 0 · LOW 0 · **total 3**

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 17/17 satisfied |
| Planned tasks | 12/14 verified |
| Required validation | 9/9 passed |

The schema and state-machine implementation is design-identical and all independently rerun
validation passed, including the PostgreSQL container tests. The gate remains blocked because
T004 does not make the required byte-for-byte assertion for its pre-0003 `instrument` sentinel,
T013 lacks the required per-cycle RED evidence and non-empty commit hashes, and the complete
merge-base change set changes four sibling-story lifecycle records with no CAP-001-E5-S1 task
justification. Green tests cannot turn those checked but incomplete tasks into verified work.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E5-status` |
| HEAD | `3c12386a7586c3d345b36a4b7b95f57beeb7c6ed` |
| Review base | `origin/main` merge base `4f19b88b0ea33e8d3510a90789dac09432c54bf5` |
| Working tree | Clean before review and after every validation command; branch was ahead of `origin/usr/alvaro-de-jodra/CAP-001-E5-status` by one commit. This report is the only subsequent untracked file. |
| Changed files reviewed | 20 committed; 0 staged; 0 pre-existing unstaged; 0 pre-existing untracked |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1-tasks.md` | modified | Task completion records, T001–T014 |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1-tdd-evidence.yaml` | added | T013 |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1.md` | modified | Story lifecycle status |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2.md` | modified | **UNJUSTIFIED** — IR-001 |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3.md` | modified | **UNJUSTIFIED** — IR-001 |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S4.md` | modified | **UNJUSTIFIED** — IR-001 |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S5.md` | modified | **UNJUSTIFIED** — IR-001 |
| `migrations/0003_coverage.sql` | added | T008; AC-7, AC-12, AC-15, DAC-E5-S1-8 through -11 |
| `migrations/0004_runs.sql` | added | T010; AC-9, AC-15, DAC-E5-3, DAC-E5-S1-2 through -7, -11 |
| `migrations/README.md` | modified | T012 |
| `src/factorflow/runs/__init__.py` | added | T009 |
| `src/factorflow/runs/states.py` | added | T009; DAC-E5-1, DAC-E5-S1-1 |
| `tests/conftest.py` | modified | T011 |
| `tests/integration/test_coverage_constraints.py` | added | T002 |
| `tests/integration/test_migrations_apply.py` | added | T004; IR-002 |
| `tests/integration/test_run_constraints.py` | added | T003 |
| `tests/unit/design_sql.py` | modified | T006 |
| `tests/unit/test_migration_filenames.py` | modified | T007 |
| `tests/unit/test_run_states.py` | added | T005 |
| `tests/unit/test_schema_migrations_match_design.py` | added | T006 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `migrations/0003_coverage.sql:1-30` | `tests/integration/test_coverage_constraints.py:23-135` | Coverage and independently retained last-attempt state are present and constrained. |
| AC-9 | SATISFIED | `migrations/0004_runs.sql:1-51`; `src/factorflow/runs/states.py:6-39` | `tests/integration/test_run_constraints.py:54-152`; `tests/unit/test_run_states.py:9-41` | This S1 scope supplies persisted state/result evidence and legal transitions; result-derived finalisation remains explicitly assigned to E5-S3. |
| AC-12 | SATISFIED | `migrations/0003_coverage.sql:7-14` | `tests/integration/test_coverage_constraints.py:70-117` | Named type/order checks and inclusive GiST exclusion reject invalid overlap while a disjoint range succeeds. |
| AC-15 | SATISFIED | `migrations/0003_coverage.sql`; `migrations/0004_runs.sql`; `src/factorflow/db/migrator.py:82-143` | `tests/integration/test_migrations_apply.py:17-59`; `tests/unit/test_migration_filenames.py:41-61` | Production files apply forward in order with no transaction control. The required test assertion for the pre-existing instrument row is absent (IR-002). |
| DAC-E5-1 | SATISFIED | `src/factorflow/runs/states.py:6-39` | `tests/unit/test_run_states.py:9-41` | Exact state set, only approved edges, absorbing terminals, and typed illegal-transition error are present. |
| DAC-E5-3 | SATISFIED | `migrations/0004_runs.sql:27-28` | `tests/integration/test_run_constraints.py:143-152` | Partial unique constant-expression index raises `UniqueViolation` for the second active run. |
| DAC-E5-S1-1 | SATISFIED | `src/factorflow/runs/states.py:18-39` | `tests/unit/test_run_states.py:20-41` | Immutable mapping and pure validator require no connection or write seam. |
| DAC-E5-S1-2 | SATISFIED | `migrations/0004_runs.sql:15-24` | `tests/integration/test_run_constraints.py:54-91` | Known-state, claim agreement, and terminal-end constraints are named and dynamically exercised. |
| DAC-E5-S1-3 | SATISFIED | `migrations/0004_runs.sql:4,18` | `tests/integration/test_run_constraints.py:98-112` | Positive, stored `history_depth_years` reads back unchanged. |
| DAC-E5-S1-4 | SATISFIED | `migrations/0004_runs.sql:27-28` | `tests/integration/test_run_constraints.py:143-152` | Both `running` and `cancelling` are in the active predicate. |
| DAC-E5-S1-5 | SATISFIED | `migrations/0004_runs.sql:30-31` | `tests/integration/test_run_constraints.py:30-35`; `tests/unit/test_schema_migrations_match_design.py:10-18` | Requested-FIFO index is design-identical. |
| DAC-E5-S1-6 | SATISFIED | `migrations/0004_runs.sql:22-24` | `tests/integration/test_run_constraints.py:80-91` | Terminal rows require `ended_at`; non-terminals reject it. |
| DAC-E5-S1-7 | SATISFIED | `migrations/0004_runs.sql:35-51` | `tests/integration/test_run_constraints.py:37-53,103-142` | Per-run/instrument/type result, reason, attempts, checks, composite key and failure index are present. |
| DAC-E5-S1-8 | SATISFIED | `migrations/0003_coverage.sql:1-17` | `tests/integration/test_coverage_constraints.py:49-88` | All four accepted types, unknown type, and reversed inclusive range are exercised. |
| DAC-E5-S1-9 | SATISFIED | `migrations/0003_coverage.sql:10-14` | `tests/integration/test_coverage_constraints.py:82-88` | Shared-boundary overlap is rejected by `coverage_no_overlap`; the following disjoint range succeeds. |
| DAC-E5-S1-10 | SATISFIED | `migrations/0003_coverage.sql:19-30` | `tests/integration/test_coverage_constraints.py:90-135` | Written, not-found, and failed attempts persist independently; failed corporate-actions attempt has no coverage segment. |
| DAC-E5-S1-11 | SATISFIED | `migrations/0003_coverage.sql`; `migrations/0004_runs.sql` | `tests/unit/test_schema_migrations_match_design.py:10-40`; `tests/unit/test_migration_filenames.py:41-61`; `tests/integration/test_migrations_apply.py:17-53` | Exact filename-selected design SQL, ordered apply, ownership split, and absence of transaction control are all checked. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Existing `0001`, `0002`, migrator, fixture, and PostgreSQL 16 tests; focused PostgreSQL validation passed. | Required baseline is present. |
| T002 | complete | VERIFIED | `tests/integration/test_coverage_constraints.py:12-137`; `migrations/0003_coverage.sql:1-30` | Exact fields, types, range, overlap, disjoint, and independent attempt state are asserted. |
| T003 | complete | VERIFIED | `tests/integration/test_run_constraints.py:7-152`; `migrations/0004_runs.sql:1-51` | Columns, indexes, defaults, named constraint failures, result persistence, composite key, and active uniqueness are materially exercised. |
| T004 | complete | PARTIAL | `tests/integration/test_migrations_apply.py:17-59` | Applies from 0002, checks `[3, 4]`, checksums, daily-bar preservation, and idempotence; it never snapshots or asserts the required pre-existing `instrument` row byte-for-byte (IR-002). |
| T005 | complete | VERIFIED | `tests/unit/test_run_states.py:5-41`; `src/factorflow/runs/states.py:6-39` | Exact set, every allowed edge, unknown/illegal/terminal sources, and typed exception are tested. |
| T006 | complete | VERIFIED | `tests/unit/design_sql.py:67-92`; `tests/unit/test_schema_migrations_match_design.py:10-40` | Filename-selected SQL fences are byte-compared and malformed/missing labels/fences fail. |
| T007 | complete | VERIFIED | `tests/unit/test_migration_filenames.py:41-61` | Inventory is exactly 0001–0004 and checks transaction/non-transactional-DDL rules. |
| T008 | complete | VERIFIED | `migrations/0003_coverage.sql:1-30`; `tests/unit/test_schema_migrations_match_design.py:10-25` | Byte-identical to design; forward UUID reference has no foreign key. |
| T009 | complete | VERIFIED | `src/factorflow/runs/__init__.py:1`; `src/factorflow/runs/states.py:1-39` | Immutable mapping, eight states, pure typed validator, typed error, and absorbing terminals are present. |
| T010 | complete | VERIFIED | `migrations/0004_runs.sql:1-51`; `tests/unit/test_schema_migrations_match_design.py:10-25` | Byte-identical design migration; assigned tables, checks, indexes, foreign keys, defaults, and no transaction control. |
| T011 | complete | VERIFIED | `tests/conftest.py:22-27,112-122`; `tests/integration/test_run_constraints.py:9` | Shared production-migrator fixture applies real inventory; coverage test intentionally stops at 0003. |
| T012 | complete | VERIFIED | `migrations/README.md:28-35` | Ownership table accurately attributes 0002, 0003, and 0004. |
| T013 | complete | PARTIAL | `CAP-001-E5-S1-tdd-evidence.yaml:1-77` | Mutation cases are recorded, but both listed cycles lack pre-production RED evidence and non-empty commit hashes required by T013; an unversioned owner-exception narrative does not change the approved task's required evidence (IR-003). |
| T014 | complete | VERIFIED | Independent command results in this review. | All plan-required commands passed; PostgreSQL was available, so no exclusion was taken. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_coverage_schema_rejects_bad_ranges_and_keeps_attempt_state` / TC-COMP-007, TC-COMP-012 | ADEQUATE | Uses real PostgreSQL and named constraint diagnostics; checks all accepted data types, invalid/reversed/overlap input, disjoint acceptance, and independent failed attempt state. | None. |
| `test_active_run_constraint` / TC-COMP-009, 238, 254–259 | ADEQUATE | Uses the production migrator fixture and observes real checks, indexes, defaults, result persistence, result validation/key, and active uniqueness. | None. |
| `test_new_migrations_apply_after_0002_without_rewriting_rows` / TC-COMP-015 | WEAK | Correctly proves ordered application, 0003/0004 checksums, daily-bar preservation, and no-op reapplication. | Does not snapshot/assert the task-required pre-existing `instrument` row; IR-002. |
| `test_state_set_and_approved_transitions` and `test_illegal_transition_raises_before_a_write` / TC-COMP-236, TC-COMP-253 | ADEQUATE | Exercises every legal edge and representative unknown, illegal, and terminal-source failures against the production validator. | None. |
| `test_e5_migrations_match_filename_design_blocks` and ownership/fence tests | ADEQUATE | Directly compare shipped SQL to approved filename-selected design fences and prove missing/unclosed fence failures. | None. |
| `test_e5_real_migration_inventory_is_contiguous_through_four` and content checks | ADEQUATE | Locks the exact inventory and rejects transaction controls/non-transactional DDL. | None. |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 44; checked 41 packages. |
| `uv run pytest tests/unit/test_run_states.py tests/unit/test_schema_migrations_match_design.py tests/unit/test_migration_filenames.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 14 passed. |
| `uv run pytest -m postgres tests/integration/test_coverage_constraints.py tests/integration/test_run_constraints.py tests/integration/test_migrations_apply.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 passed against PostgreSQL testcontainers. |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 397 passed; two third-party deprecation warnings. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 320 passed, 77 deselected; two third-party deprecation warnings. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 113 files already formatted. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 33 source files. |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Source distribution and wheel built successfully. |

### Validation Side Effects

- Before: clean tracked, staged, and untracked state; branch ahead one commit.
- After: the same clean tracked, staged, and pre-existing-untracked state. `uv build` refreshed ignored `dist/` outputs only.
- Unexpected tracked-file changes: none.
- Validation exclusions: none; Docker/PostgreSQL testcontainers were available and executed.

## Findings

| ID | Severity | Status | Summary | Traceability |
|----|----------|--------|---------|--------------|
| IR-001 | HIGH | OPEN | The complete merge-base set changes four sibling-story lifecycles outside S1. | T014 |
| IR-002 | HIGH | OPEN | TC-COMP-015 omits the required pre-existing instrument preservation assertion. | AC-15; T004 |
| IR-003 | HIGH | OPEN | Checked T013 lacks the required durable per-cycle RED and commit evidence. | T013 |

### IR-001 — Complete review set changes four sibling story lifecycles outside S1

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T014
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2.md:14-15`; `CAP-001-E5-S3.md:14-15`; `CAP-001-E5-S4.md:14-15`; `CAP-001-E5-S5.md:14-15`
- **Claim challenged**: T014's final checkpoint says no unrelated artifact changed.
- **Observed evidence**: The required merge-base review set (`4f19b88..3c12386`) contains commit `d948eb4`, which advances each sibling from `todo` to `planning` and updates its date. No CAP-001-E5-S1 task names, depends on, or justifies those four story lifecycle writes.
- **Expected evidence/behavior**: The review must cover every committed change through the merge base, and T014 requires no unrelated artifact change.
- **Impact**: This S1 delivery carries unrelated lifecycle state for four independently governed stories; the review cannot attest that the story change set is surgically scoped.
- **Required remediation**: Remove the sibling-story lifecycle changes from the S1 delivery branch or supply a revised, approved S1 task plan that explicitly authorizes and traces them; then rerun adversarial review against the resulting complete change set.

### IR-002 — Migration-forward test omits the required pre-existing instrument assertion

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-15
- **Tasks**: T004
- **Files**: `tests/integration/test_migrations_apply.py:20-59`
- **Claim challenged**: T004 is checked complete and says it asserts pre-existing instrument and observation rows remain byte-for-byte unchanged.
- **Observed evidence**: The test inserts an instrument at lines 20–24 but snapshots and compares only a `daily_bar` row at lines 33–39 and 47–59. It never selects the instrument before or after applying 0003/0004.
- **Expected evidence/behavior**: T004 requires a database already at 0002 to prove both its existing `instrument` and observation rows remain byte-for-byte preserved through the forward migration and idempotent reapplication.
- **Impact**: A regression that rewrites an existing instrument during a later migration would leave this mandatory test green, despite violating the task's specified forward-history proof.
- **Required remediation**: Extend the existing TC-COMP-015 test to snapshot the inserted instrument row before applying 0003/0004 and assert the identical row after first and no-op applications; retain the observation assertion.

### IR-003 — TDD evidence does not meet checked T013's required cycle history

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T013
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1-tdd-evidence.yaml:3-48`; `CAP-001-E5-S1-tasks.md:125-126`
- **Claim challenged**: T013 is checked complete.
- **Observed evidence**: The `design-sql-fence-helper` cycle records no RED result before production and `commit: "not created"`; the `schema-constraint-strengthening` cycle likewise records no RED command/result and `commit: "not created"`. The file describes a chat-scoped owner exception, but the reviewed v2 task still requires observed RED commands before production and non-empty commit hashes for every coherent cycle.
- **Expected evidence/behavior**: T013 requires complete, durable RED→GREEN/review/spec-drift/test/commit evidence per coherent TDD cycle before the next cycle begins.
- **Impact**: The checked task cannot be independently verified and the implementation's stated test-first history is not reconstructable from repository evidence.
- **Required remediation**: Rework T013 to comply with the approved plan: record recoverable per-cycle evidence where it exists, or obtain an approved task-plan revision that explicitly and durably changes the required evidence before marking T013 complete. Do not represent missing evidence as complete.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- The task header names `usr/alvaro-de-jodra/CAP-001-stories`; the reviewed component branch is `usr/alvaro-de-jodra/CAP-001-E5-status`. This is recorded as review context; no task gives a branch-transition rationale.
- The four sibling story lifecycle writes are unjustified scope leakage and are finding IR-001.
- T004 and T013 are checked complete despite the partial evidence recorded in IR-002 and IR-003.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework from `CAP-001-E5-S1-tasks.md` and this report: isolate the full branch change set, add the missing instrument preservation assertion, and reconcile T013 with an approved task-plan revision or complete durable evidence. Run a fresh adversarial review afterward.
- **Warnings accepted downstream**: N/A
