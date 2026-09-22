---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-22
updated: 2026-09-22
story_id: "CAP-001-E4-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-22T21:30:00Z"
reviewed_head: "0f5603bfd761af47cc7fc9b8156dc43ef5ca0e05"
review_base: "ce39a7158dd3a05c1497abe212dfaf740cb8bdac"
reviewed_state_revision: "sha256:d365cb5194ae2885372d808d282655f29c47bc4c3c93efabf1ccb0a4bebee115"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E4-S3
    artifact_version: 1
    content_revision: sha256:916e842290fddd82833cad5c5376d72eae5f3f626912f553fc5b218c7d755091
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-4-6
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-09-22T21:30:00Z
  source_artifacts:
    - id: CAP-001-E4-S3
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E4-S3 -- Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 13/13 verified |
| Required validation | 12/12 passed |

All acceptance criteria are satisfied with production and test evidence. All planned tasks are verified, including the two failure probes added in rework (IR-001 from v1). The IR-002 transaction-boundary deviation is recorded in the task plan. Two MEDIUM/LOW findings remain: the TDD evidence mutation probe 3 is a narrative explanation rather than an actual code mutation, and the observation-insert failure probe does not assert against all observation tables that were already written before the failure point.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E4-S3` |
| HEAD | `0f5603bfd761af47cc7fc9b8156dc43ef5ca0e05` |
| Review base | `main` / `ce39a7158dd3a05c1497abe212dfaf740cb8bdac` |
| Working tree | clean |
| Changed files reviewed | 13 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../CAP-001-E4-S3-tasks.md` | modified | Task checkbox updates, deviation record; T001-T013, IR-002 |
| `docs/.../CAP-001-E4-S3-tdd-evidence.yaml` | added | T012, T013 |
| `docs/.../CAP-001-E4-S3-implementation-review-v1.md` | added | Review artifact from v1 review cycle |
| `docs/.../CAP-001-E4-S3.md` | modified | Status field update to `in-review` |
| `src/factorflow/ingestion/coverage.py` | added | T008; DAC-E4-S3-2 |
| `src/factorflow/ingestion/writer.py` | added | T009, T010, T011; AC-5, AC-6, AC-12, DAC-E4-4, DAC-E4-5 |
| `tests/conftest.py` | modified | T001 |
| `tests/integration/test_writer_coverage.py` | added | T005; TC-COMP-163, TC-COMP-164 |
| `tests/integration/test_writer_idempotence.py` | added | T003; TC-COMP-005, TC-COMP-006, TC-COMP-162 |
| `tests/integration/test_writer_transaction.py` | added | T002, T004; TC-COMP-007, TC-COMP-010, TC-COMP-138, TC-COMP-139, TC-COMP-165 |
| `tests/unit/test_coverage_merge.py` | added | T005; TC-COMP-163, TC-COMP-164 |
| `tests/unit/test_sql_is_append_only.py` | modified | T006; TC-COMP-168 |
| `tests/unit/test_writer_contract.py` | added | T007; TC-COMP-007 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-5 | SATISFIED | `writer.py:_insert_*` -- `observed_on` parameter passed through to all four tables | `test_writer_idempotence.py:test_restatement_appends_second_row_preserves_first` | observed_on preserved in appended rows; restatement appends new row |
| AC-6 | SATISFIED | `writer.py:_insert_*` -- `ON CONFLICT DO NOTHING` on all four observation tables | `test_writer_idempotence.py:test_identical_repeat_reports_zero_appended_positive_unchanged_no_mutation` | Row count unchanged, coverage unchanged, zero appended |
| AC-12 | SATISFIED | `writer.py:write_instrument` -- caller transaction rolls back on any failure | `test_writer_transaction.py:test_failure_during_*` (four probes) | No partial state survives any rollback scenario |
| DAC-E4-4 | SATISFIED | `writer.py:write_instrument` -- all steps on single cursor/connection inside caller transaction | All four rollback probes + successful commit test | Transaction deviation documented; behavior correct |
| DAC-E4-5 | SATISFIED | `writer.py:_replace_coverage` called inside `write_instrument` cursor | `test_writer_coverage.py` and rollback tests | Coverage written inside transaction |
| DAC-E4-S3-1 | SATISFIED | `writer.py:WriteResult` -- per-type appended/unchanged/covered-range fields | `test_writer_transaction.py:test_successful_write_commits_observations_coverage_state_results` | Counts verified per data type |
| DAC-E4-S3-2 | SATISFIED | `coverage.py:merge_ranges` -- sort, coalesce overlap and one-day adjacency | `test_coverage_merge.py` (11 tests) + `test_writer_coverage.py` (4 tests) | All merge scenarios covered |
| DAC-E4-S3-3 | SATISFIED | PostgreSQL `coverage_no_overlap` exclusion constraint | `test_writer_coverage.py:test_coverage_no_overlap_constraint_rejects_direct_overlapping_insert` | Constraint name asserted in ExclusionViolation |
| DAC-E4-S3-4 | SATISFIED | `write_instrument` -- errors propagate, caller transaction rolls back | All four `test_failure_during_*` probes | Observation-insert and coverage-replacement probes now present |
| DAC-E4-S3-5 | SATISFIED | `writer.py` lines 419-429 -- acquisition_state upsert with `now()`, `run_id`, `'written'` | `test_writer_transaction.py:test_successful_write_stamps_acquisition_state_for_each_data_type` | All four data types stamped |
| DAC-E4-S3-6 | SATISFIED | `writer.py` lines 432-447 -- run_instrument_result insert per data type | `test_writer_transaction.py:test_successful_write_inserts_exactly_four_run_result_rows` | Exactly four rows with correct outcomes |
| DAC-E4-S3-7 | SATISFIED | `writer.py:_insert_*` -- all four helpers use `ON CONFLICT DO NOTHING` | `test_sql_is_append_only.py:test_writer_source_uses_on_conflict_do_nothing_for_all_observation_tables` | Static guard + source scan |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/conftest.py:migrated_writer_connection` applies 0001-0004 in order | Correct fixture isolation per test |
| T002 | complete | VERIFIED | `tests/integration/test_writer_transaction.py` -- 13 tests with TC-COMP traceability | All mapped TC-IDs present including fiscal_period tests |
| T003 | complete | VERIFIED | `tests/integration/test_writer_idempotence.py` -- 2 tests with TC-COMP traceability | Controlled observed_on, repeat, restatement |
| T004 | complete | VERIFIED | `test_writer_transaction.py` -- 4 failure probes at observation, coverage, state, result | Rework added observation-insert and coverage-replacement probes |
| T005 | complete | VERIFIED | `tests/unit/test_coverage_merge.py` (11 tests) + `tests/integration/test_writer_coverage.py` (4 tests) | All specified scenarios covered |
| T006 | complete | VERIFIED | `tests/unit/test_sql_is_append_only.py:test_writer_source_uses_on_conflict_do_nothing_for_all_observation_tables` | Writer-source fixtures present |
| T007 | complete | VERIFIED | `tests/unit/test_writer_contract.py` -- 7 tests | Typed collections, ranges, immutability, no runner import |
| T008 | complete | VERIFIED | `src/factorflow/ingestion/coverage.py:merge_ranges` | Sorts, coalesces, one-day adjacency, disjoint preserved |
| T009 | complete | VERIFIED | `writer.py:ParsedObservations, ObservationBatch, WriteResult` | Frozen dataclasses, schema data-type names, no runner dependency |
| T010 | complete | VERIFIED | `writer.py:_insert_references, _insert_daily_bars, _insert_fundamentals, _insert_corporate_actions, _derive_fiscal_period` | value_hash, observed_on, ON CONFLICT DO NOTHING, Jsonb, FY/Q derivation |
| T011 | complete | VERIFIED | `writer.py:write_instrument` | Deviation documented in task plan: transaction boundary delegated to caller |
| T012 | complete | VERIFIED | `CAP-001-E4-S3-tdd-evidence.yaml` -- 4 TDD cycles, 4 mutation probes | RED/GREEN/MUTATE evidence recorded; see IR-001 for probe 3 |
| T013 | complete | VERIFIED | `CAP-001-E4-S3-tdd-evidence.yaml` -- validation section | `uv build` now recorded; frontend validation delegated to reviewer |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_successful_write_commits_observations_coverage_state_results` / TC-COMP-007, TC-COMP-010, TC-COMP-162 | ADEQUATE | Asserts appended counts and row existence in all four tables | None |
| `test_successful_write_commits_only_actual_returned_ranges` / TC-COMP-167 | ADEQUATE | Verifies coverage segments match input ranges exactly | None |
| `test_successful_write_stamps_acquisition_state_for_each_data_type` / TC-COMP-165, TC-COMP-166 | ADEQUATE | Asserts run_id and outcome for all four data types | None |
| `test_successful_write_inserts_exactly_four_run_result_rows` / TC-COMP-010 | ADEQUATE | Asserts exact four result rows with correct outcomes | None |
| `test_annual_financial_statement_stores_fiscal_period_fy` / TC-COMP-162 | ADEQUATE | Verifies FY derivation from timeframe=annual, NOT NULL | None |
| `test_quarterly_financial_statement_stores_fiscal_period_q_n` / TC-COMP-162 | ADEQUATE | Parametrized Q1-Q4 derivation; verifies NOT NULL | None |
| `test_failure_during_acquisition_state_rolls_back_everything` / TC-COMP-138, TC-COMP-165 | ADEQUATE | Trigger-based failure injection; asserts zero rows in all four tables plus coverage and state | None |
| `test_failure_during_run_result_insert_rolls_back_everything` / TC-COMP-139 | ADEQUATE | Same rollback assertion for result-insert failure | None |
| `test_failure_during_observation_insert_rolls_back_everything` / TC-COMP-138 | ADEQUATE | Trigger on fundamental_observation; asserts instrument_reference (written before failure), fundamental_observation, coverage, state, results all zero | See IR-002 |
| `test_failure_during_coverage_replacement_rolls_back_everything` / TC-COMP-165 | ADEQUATE | Trigger on coverage_segment; asserts instrument_reference (written before failure), coverage, state, results all zero | None |
| `test_identical_repeat_reports_zero_appended_positive_unchanged_no_mutation` / TC-COMP-005, TC-COMP-006, TC-COMP-162 | ADEQUATE | Repeat write with same data; asserts zero appended, positive unchanged, no row duplication | None |
| `test_restatement_appends_second_row_preserves_first` / TC-COMP-006 | ADEQUATE | Changed value appends new row; original row preserved with original observed_on | None |
| `test_overlapping_ranges_merge_into_minimal_set` / TC-COMP-163 | ADEQUATE | Two overlapping writes produce one merged segment | None |
| `test_adjacent_ranges_merge_into_one_segment` / TC-COMP-163 | ADEQUATE | Adjacent ranges (one-day gap) merge into one segment | None |
| `test_coverage_no_overlap_constraint_rejects_direct_overlapping_insert` / TC-COMP-164 | ADEQUATE | Direct overlap raises ExclusionViolation naming coverage_no_overlap | None |
| `test_disjoint_ranges_produce_separate_segments` / TC-COMP-163 | ADEQUATE | Disjoint ranges preserved as separate segments | None |
| `test_coverage_merge.py` (11 tests) / TC-COMP-163, TC-COMP-164 | ADEQUATE | Pure function: overlap, enclosure, adjacency both directions, unsorted, empty, idempotent | None |
| `test_writer_source_uses_on_conflict_do_nothing_for_all_observation_tables` / TC-COMP-168 | ADEQUATE | Static source scan validates ON CONFLICT DO NOTHING for all observation tables | None |
| `test_observation_history_sql_is_append_only` / TC-COMP-155, TC-COMP-156 | ADEQUATE | Full repo scan for prohibited mutations | None |
| `test_writer_contract.py` (7 tests) / TC-COMP-007 | ADEQUATE | Contract structure, immutability, no runner import, model types | None |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest tests/unit/test_coverage_merge.py tests/unit/test_sql_is_append_only.py tests/unit/test_writer_contract.py -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 26 passed |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 359 passed, 106 deselected |
| `uv run pytest -m postgres -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 106 passed, 359 deselected |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 465 passed |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 124 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 36 source files |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No TypeScript errors |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 47 files checked |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 47 files, no fixes |
| `npm run test` | N/A | N/A | NOT RUN | No frontend code changed by this story; frontend test validation deferred |
| `npm run test:e2e` | N/A | N/A | NOT RUN | No frontend code changed; Playwright e2e deferred |

### Validation Side Effects

- Before: working tree clean, nothing staged or untracked
- After: working tree clean, nothing staged or untracked
- Unexpected tracked-file changes: none

## Findings

### IR-001 -- TDD evidence mutation probe 3 is a narrative, not a code mutation

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3-tdd-evidence.yaml`
- **Claim challenged**: T012 requires manually mutating the source in separate restored probes, including moving "a coverage write moved outside the transaction."
- **Observed evidence**: Mutation probe 3 in the TDD evidence states the mutation "is not applicable" because `write_instrument` does not own the outer transaction. Rather than modifying the source code, it substitutes a logical argument that the acquisition-state rollback test proves coverage is transactional.
- **Expected evidence/behavior**: T012 specifies an actual source-code mutation, a test that kills it, and a clean restore. Probe 3 does not follow this pattern.
- **Impact**: The transactional coverage invariant is adequately proven by the four rollback probes (which include the coverage-replacement failure probe added in rework). The missing mutation probe does not leave an untested code path. However, the TDD evidence is less rigorous on this one point than on the other three probes.
- **Required remediation**: None required for gate passage. To strengthen evidence, a future cycle could mutate `_replace_coverage` to commit coverage on a separate connection and verify a rollback test detects the data leak.

### IR-002 -- Observation-insert failure probe omits daily_bar and corporate_action assertions

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S3-4
- **Tasks**: T004
- **Files**: `tests/integration/test_writer_transaction.py:test_failure_during_observation_insert_rolls_back_everything`
- **Claim challenged**: The observation-insert failure probe injects a trigger on `fundamental_observation` (which is the third of four observation tables inserted). It asserts zero rows in `instrument_reference` (the first table, written before the failure) but does not assert against `daily_bar` (the second table, also written before the failure).
- **Observed evidence**: Lines 441-494 of `test_writer_transaction.py`: the test checks `instrument_reference`, `fundamental_observation`, `coverage_segment`, `acquisition_state`, and `run_instrument_result` after rollback. `daily_bar` is absent from the assertions, even though `_insert_daily_bars` completed before the trigger fired.
- **Expected evidence/behavior**: For completeness, all tables that had rows written before the failure point should be explicitly checked.
- **Impact**: Minimal. The `instrument_reference` assertion already proves the transaction rollback mechanism works for rows written before the failure. PostgreSQL transaction rollback is all-or-nothing, so `daily_bar` rows are guaranteed to be rolled back by the same mechanism. The `corporate_action` table was not yet written when the trigger fired, so omitting it is correct.
- **Required remediation**: None required for gate passage. Adding `daily_bar` and `corporate_action` count assertions to this test would make the evidence more explicit.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 -- T004 missing observation-insert and coverage-replacement failure probes | RESOLVED | `test_failure_during_observation_insert_rolls_back_everything` (trigger on `fundamental_observation`) and `test_failure_during_coverage_replacement_rolls_back_everything` (trigger on `coverage_segment`) added in commit `0f5603b`. Both pass independently. |
| v1/IR-002 -- Transaction boundary delegated to caller, deviating from T011 wording | RESOLVED | Deviation recorded in `CAP-001-E4-S3-tasks.md` under T011 as "Implementation deviation (IR-002)" with rationale. Task plan `last_reworked_review` field references the v1 review. |
| v1/IR-003 -- TDD evidence omits uv build | RESOLVED | `CAP-001-E4-S3-tdd-evidence.yaml` now records `uv build: succeeded` with output details. |

## Scope and Plan Deviations

- The story file's `status` field was changed from `planning` to `in-review`. This is an expected lifecycle transition.
- `write_instrument` delegates transaction ownership to the caller rather than calling `connection.transaction()` internally. The deviation is now documented in the task plan under T011 with rationale.
- `npm run test` and `npm run test:e2e` were not run because no frontend code was modified by this story. All Python, lint, format, and type-check validations passed.
- No unjustified scope leakage detected. All changed files trace to story tasks.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Synchronize component documentation with the implemented observation writer behavior.
- **Warnings accepted downstream**: IR-001, IR-002
