---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-19
updated: 2026-09-19
story_id: "CAP-001-E5-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-19T20:12:12Z"
reviewed_head: "df0e061966930db5a266132efeaa09497191b6b3"
review_base: "4f19b88b0ea33e8d3510a90789dac09432c54bf5"
reviewed_state_revision: "sha256:91ea2bc1d0f258ce57202c94dd1e77225e9f00c2216feb60616d51f77bb03a12"
verdict: PASS
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
  timestamp: 2026-09-19T20:12:12Z
  source_artifacts:
    - id: CAP-001-E5-S1
      version: "2"
    - id: CAP-001-E5-S1-tasks
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E5-S1 — Version 2

**Verdict:** PASS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 0**

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 17/17 satisfied |
| Planned tasks | 14/14 verified |
| Required validation | 9/9 passed |

The complete merge-base change set implements the two design-identical forward
migrations and the pure typed run-transition boundary. The rework removes the
four unrelated sibling-story writes and independently proves preservation of
both the pre-existing `instrument` and observation sentinels. Task-plan v3
records the owner-approved, deliberately narrow T013 exception only for the two
unrecoverable historical cycles; the evidence identifies the missing material
without fabricating it. All required validation passed against the reviewed
state, including real PostgreSQL 16 testcontainers.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S1-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E5-S1` |
| HEAD | `df0e061966930db5a266132efeaa09497191b6b3` |
| Review base | `origin/main` merge base `4f19b88b0ea33e8d3510a90789dac09432c54bf5` |
| Working tree | Clean before validation and clean after validation; `uv build` refreshed ignored outputs only. This report is the sole subsequent untracked file. |
| Changed files reviewed | 17 committed; 0 staged; 0 pre-existing unstaged; 0 pre-existing untracked |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../CAP-001-E5-S1-implementation-review-v1.md` | added | Previous independent review evidence; required re-review input |
| `docs/.../CAP-001-E5-S1-tasks.md` | modified | T001–T014; v3 rework records the limited T013 exception |
| `docs/.../CAP-001-E5-S1-tdd-evidence.yaml` | added | T013 |
| `docs/.../CAP-001-E5-S1.md` | modified | Story lifecycle status |
| `migrations/0003_coverage.sql` | added | T008; AC-7, AC-12, AC-15, DAC-E5-S1-8 through -11 |
| `migrations/0004_runs.sql` | added | T010; AC-9, AC-15, DAC-E5-3, DAC-E5-S1-2 through -7, -11 |
| `migrations/README.md` | modified | T012 |
| `src/factorflow/runs/__init__.py` | added | T009 |
| `src/factorflow/runs/states.py` | added | T009; DAC-E5-1, DAC-E5-S1-1 |
| `tests/conftest.py` | modified | T011 |
| `tests/integration/test_coverage_constraints.py` | added | T002 |
| `tests/integration/test_migrations_apply.py` | added | T004; AC-15 sentinel-preservation proof |
| `tests/integration/test_run_constraints.py` | added | T003 |
| `tests/unit/design_sql.py` | modified | T006 |
| `tests/unit/test_migration_filenames.py` | modified | T007 |
| `tests/unit/test_run_states.py` | added | T005 |
| `tests/unit/test_schema_migrations_match_design.py` | added | T006 |

`docs/...` above is the story directory shown in Review Subject. No sibling
story, unrelated production, configuration, dependency, staged, unstaged, or
non-ignored untracked change is present in the complete review set.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `migrations/0003_coverage.sql:1-30` | `tests/integration/test_coverage_constraints.py:23-135` | Coverage and independent last-attempt state are persisted and constrained. |
| AC-9 | SATISFIED | `migrations/0004_runs.sql:1-51`; `src/factorflow/runs/states.py:6-39` | `tests/integration/test_run_constraints.py:54-152`; `tests/unit/test_run_states.py:9-41` | S1 supplies state/result evidence and transitions; result-derived finalisation remains assigned to E5-S3. |
| AC-12 | SATISFIED | `migrations/0003_coverage.sql:7-14` | `tests/integration/test_coverage_constraints.py:70-117` | Named type/order checks and inclusive exclusion reject invalid overlap; disjoint ranges succeed. |
| AC-15 | SATISFIED | `migrations/0003_coverage.sql`; `migrations/0004_runs.sql`; `src/factorflow/db/migrator.py:82-143` | `tests/integration/test_migrations_apply.py:17-79` | Production migrator applies `[3, 4]`, preserves exact instrument and daily-bar sentinels, and is idempotent. |
| DAC-E5-1 | SATISFIED | `src/factorflow/runs/states.py:6-39` | `tests/unit/test_run_states.py:9-41` | Exact set, approved edges, absorbing terminal states, and typed error are present. |
| DAC-E5-3 | SATISFIED | `migrations/0004_runs.sql:27-28` | `tests/integration/test_run_constraints.py:143-152` | Partial unique index raises `UniqueViolation` for another active run. |
| DAC-E5-S1-1 | SATISFIED | `src/factorflow/runs/states.py:18-39` | `tests/unit/test_run_states.py:20-41` | Immutable mapping and pure validator have no database dependency. |
| DAC-E5-S1-2 | SATISFIED | `migrations/0004_runs.sql:15-24` | `tests/integration/test_run_constraints.py:54-91` | Named state, claim, and terminal-end constraints are dynamically exercised. |
| DAC-E5-S1-3 | SATISFIED | `migrations/0004_runs.sql:4,18` | `tests/integration/test_run_constraints.py:98-112` | Positive stored history depth reads back unchanged. |
| DAC-E5-S1-4 | SATISFIED | `migrations/0004_runs.sql:27-28` | `tests/integration/test_run_constraints.py:143-152`; design-drift test | The index predicate covers `running` and `cancelling`. |
| DAC-E5-S1-5 | SATISFIED | `migrations/0004_runs.sql:30-31` | `tests/integration/test_run_constraints.py:30-35`; `tests/unit/test_schema_migrations_match_design.py:10-18` | Requested-FIFO index is design-identical. |
| DAC-E5-S1-6 | SATISFIED | `migrations/0004_runs.sql:22-24` | `tests/integration/test_run_constraints.py:80-91` | Terminal rows require `ended_at`; non-terminals reject it. |
| DAC-E5-S1-7 | SATISFIED | `migrations/0004_runs.sql:35-51` | `tests/integration/test_run_constraints.py:37-53,103-142` | Result rows enforce keys, references, type/outcome, defaults, reason, attempts, and failure index. |
| DAC-E5-S1-8 | SATISFIED | `migrations/0003_coverage.sql:1-17` | `tests/integration/test_coverage_constraints.py:49-88` | Every permitted type, unknown type, and reversed inclusive range are exercised. |
| DAC-E5-S1-9 | SATISFIED | `migrations/0003_coverage.sql:10-14` | `tests/integration/test_coverage_constraints.py:82-88` | Shared-boundary overlap is rejected by `coverage_no_overlap`; following disjoint range succeeds. |
| DAC-E5-S1-10 | SATISFIED | `migrations/0003_coverage.sql:19-30` | `tests/integration/test_coverage_constraints.py:90-135` | Written, not-found, and failed attempts persist without inventing failed-attempt coverage. |
| DAC-E5-S1-11 | SATISFIED | `migrations/0003_coverage.sql`; `migrations/0004_runs.sql` | `tests/unit/test_schema_migrations_match_design.py:10-40`; `tests/unit/test_migration_filenames.py:41-61`; `tests/integration/test_migrations_apply.py:17-79` | Exact design SQL, ordered application, ownership split, and no transaction control are verified. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Existing `0001`, `0002`, migrator, fixture, and PostgreSQL 16 tests | Required baseline is present. |
| T002 | complete | VERIFIED | `tests/integration/test_coverage_constraints.py:12-137`; `migrations/0003_coverage.sql:1-30` | Fields, types, range, overlap, disjoint, and independent state are asserted. |
| T003 | complete | VERIFIED | `tests/integration/test_run_constraints.py:7-152`; `migrations/0004_runs.sql:1-51` | Schema, named constraints, result persistence, and active uniqueness are materially exercised. |
| T004 | complete | VERIFIED | `tests/integration/test_migrations_apply.py:17-79` | Exact pre-0003 `instrument` and `daily_bar` sentinels are checked after application and no-op reapplication. |
| T005 | complete | VERIFIED | `tests/unit/test_run_states.py:5-41`; `src/factorflow/runs/states.py:6-39` | Exact states, every approved edge, representative illegal/terminal paths, typed exception. |
| T006 | complete | VERIFIED | `tests/unit/design_sql.py:67-92`; `tests/unit/test_schema_migrations_match_design.py:10-40` | Filename-selected SQL fence comparison and malformed-fence failures. |
| T007 | complete | VERIFIED | `tests/unit/test_migration_filenames.py:41-61` | Inventory is exactly 0001–0004; transaction and non-transactional DDL rules remain covered. |
| T008 | complete | VERIFIED | `migrations/0003_coverage.sql:1-30`; design-drift test | Byte-identical approved coverage migration; no forward foreign key. |
| T009 | complete | VERIFIED | `src/factorflow/runs/__init__.py:1`; `src/factorflow/runs/states.py:1-39` | Immutable transition mapping and typed pure boundary. |
| T010 | complete | VERIFIED | `migrations/0004_runs.sql:1-51`; design-drift test | Byte-identical run migration with assigned tables, checks, indexes, and no transaction control. |
| T011 | complete | VERIFIED | `tests/conftest.py:22-27,112-122`; integration tests | Shared production-migrator fixture and explicit 0003 stop boundary. |
| T012 | complete | VERIFIED | `migrations/README.md:28-35` | Ownership table identifies 0002, 0003, and 0004 correctly. |
| T013 | complete | VERIFIED | `CAP-001-E5-S1-tdd-evidence.yaml:1-84`; tasks v3:126 | All required mutations are recorded killed/restored. The evidence explicitly marks only the two named historical cycles as unreconstructable under the dated owner exception; it invents no substitute and leaves the normal rule intact for all recoverable/future work. |
| T014 | complete | VERIFIED | Independent validation recorded below | Every prescribed command passed; PostgreSQL was available and executed. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_coverage_schema_rejects_bad_ranges_and_keeps_attempt_state` / TC-COMP-007, TC-COMP-012 | ADEQUATE | Real PostgreSQL asserts accepted types, named type/range/exclusion failures, disjoint acceptance, and independent failed attempt state. | None. |
| `test_active_run_constraint` / TC-COMP-009, TC-COMP-238, TC-COMP-254–259 | ADEQUATE | Real production-migrator schema asserts columns/indexes/defaults, named state/claim/end/type/outcome failures, result persistence/key, and active uniqueness. | None. |
| `test_new_migrations_apply_after_0002_without_rewriting_rows` / TC-COMP-015 | ADEQUATE | Applies through 0002, snapshots full instrument and daily-bar sentinels, asserts ordered checksums and byte-identical rows after forward and no-op application. | None. |
| `test_state_set_and_approved_transitions`; `test_illegal_transition_raises_before_a_write` / TC-COMP-236, TC-COMP-253 | ADEQUATE | Exercises every allowed edge plus unknown, illegal, and terminal-source failures against the production pure validator. | None. |
| Design-drift and migration inventory tests | ADEQUATE | Directly compare shipped SQL to filename-selected approved fences and reject ownership movement, malformed fences, transaction controls, or non-contiguous inventory. | None. |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 44; checked 41 packages. |
| `uv run pytest tests/unit/test_run_states.py tests/unit/test_schema_migrations_match_design.py tests/unit/test_migration_filenames.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 14 passed. |
| `uv run pytest -m postgres tests/integration/test_coverage_constraints.py tests/integration/test_run_constraints.py tests/integration/test_migrations_apply.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 passed against PostgreSQL testcontainers. |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 397 passed; 2 third-party deprecation warnings. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 320 passed, 77 deselected; 2 third-party deprecation warnings. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 113 files already formatted. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 33 source files. |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Source distribution and wheel built successfully. |

### Validation Side Effects

- Before: clean tracked, staged, and non-ignored untracked state.
- After: the same clean state before this report; `uv build` refreshed ignored `dist/` outputs only.
- Unexpected tracked-file changes: none.
- Validation exclusions: none; Docker/PostgreSQL testcontainers were available and executed.

## Findings

No findings.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | The merge-base set `4f19b88..df0e061` contains only S1 artefacts and implementation; `CAP-001-E5-S2.md` through `S5.md` are absent from its name-status output. |
| v1/IR-002 | RESOLVED | `tests/integration/test_migrations_apply.py:33-72` snapshots then reasserts the exact `instrument` sentinel after `[3, 4]` and after the no-op reapplication; focused PostgreSQL validation passed. |
| v1/IR-003 | RESOLVED | Task-plan v3:126 and its dated owner-exception note limit unreconstructable evidence to `design-sql-fence-helper` and `schema-constraint-strengthening`; `CAP-001-E5-S1-tdd-evidence.yaml:29-48` names the exact missing evidence without fabrication. |

## Scope and Plan Deviations

- Task-plan v3 documents an owner-approved exception dated 2026-09-19. It is limited to absent RED/commit records for the two explicitly named completed historical cycles, does not waive future/recoverable cycle evidence, and is consistently recorded in the task plan and evidence file.
- No other deviation or scope leakage found.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Use this passed review and the task plan for Phase 6a documentation synchronization. Commit this report before the downstream artifact gate and push the branch.
- **Warnings accepted downstream**: N/A
