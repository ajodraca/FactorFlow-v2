---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-22
updated: 2026-09-22
story_id: "CAP-001-E4-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-22T15:44:00Z"
reviewed_head: "d402d54a57ca231f7df055a62fd8b6858026dd0b"
review_base: "ce39a7158dd3a05c1497abe212dfaf740cb8bdac"
reviewed_state_revision: "sha256:eea2b7d42fe7754d41ef97e50bcd74774aacf0cb8902b4ac42cfff49ee70d432"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-09-22T15:44:00Z
  source_artifacts:
    - id: CAP-001-E4-S3
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E4-S3 -- Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 12/13 verified |
| Required validation | 10/10 passed |

T004 is PARTIAL: two of its four required failure injection points are missing. All acceptance criteria are independently satisfied by the existing tests and code, but the required task coverage is incomplete.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E4-S3` |
| HEAD | `d402d54a57ca231f7df055a62fd8b6858026dd0b` |
| Review base | `main` / `ce39a7158dd3a05c1497abe212dfaf740cb8bdac` |
| Working tree | clean |
| Changed files reviewed | 12 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../CAP-001-E4-S3-tasks.md` | modified | Task checkbox updates; T001-T013 |
| `docs/.../CAP-001-E4-S3-tdd-evidence.yaml` | added | T012, T013 |
| `docs/.../CAP-001-E4-S3.md` | modified | Status field update to `in-review` |
| `src/factorflow/ingestion/coverage.py` | added | T008; DAC-E4-S3-2 |
| `src/factorflow/ingestion/writer.py` | added | T009, T010, T011; AC-5, AC-6, AC-12, DAC-E4-4, DAC-E4-5 |
| `tests/conftest.py` | modified | T001 |
| `tests/integration/test_writer_coverage.py` | added | T005; TC-COMP-163, TC-COMP-164 |
| `tests/integration/test_writer_idempotence.py` | added | T003; TC-COMP-005, TC-COMP-006, TC-COMP-162 |
| `tests/integration/test_writer_transaction.py` | added | T002, T004; TC-COMP-007, TC-COMP-010, TC-COMP-138, TC-COMP-139 |
| `tests/unit/test_coverage_merge.py` | added | T005; TC-COMP-163, TC-COMP-164 |
| `tests/unit/test_sql_is_append_only.py` | modified | T006; TC-COMP-168 |
| `tests/unit/test_writer_contract.py` | added | T007; TC-COMP-007 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-5 | SATISFIED | `writer.py:_insert_*` -- `observed_on` parameter passed through | `test_writer_idempotence.py:test_restatement_appends_second_row_preserves_first` | observed_on preserved in appended rows |
| AC-6 | SATISFIED | `writer.py:_insert_*` -- `ON CONFLICT DO NOTHING` | `test_writer_idempotence.py:test_identical_repeat_reports_zero_appended_positive_unchanged_no_mutation` | Row count unchanged, coverage unchanged |
| AC-12 | SATISFIED | `writer.py:write_instrument` -- caller transaction rolls back | `test_writer_transaction.py:test_failure_during_acquisition_state_rolls_back_everything` | No partial state survives rollback |
| DAC-E4-4 | SATISFIED | `writer.py:write_instrument` -- all steps in single cursor/transaction | `test_writer_transaction.py:test_failure_during_*` (two tests) | Both rollback probes confirm atomicity |
| DAC-E4-5 | SATISFIED | `writer.py:_replace_coverage` called inside `write_instrument` cursor | `test_writer_coverage.py:test_overlapping_ranges_merge_into_minimal_set` and rollback tests | Coverage written inside transaction |
| DAC-E4-S3-1 | SATISFIED | `writer.py:WriteResult` -- per-type appended/unchanged/covered-range | `test_writer_transaction.py:test_successful_write_commits_observations_coverage_state_results` | Counts verified |
| DAC-E4-S3-2 | SATISFIED | `coverage.py:merge_ranges` | `test_coverage_merge.py` (11 tests) and `test_writer_coverage.py` (4 tests) | All merge scenarios covered |
| DAC-E4-S3-3 | SATISFIED | PostgreSQL `coverage_no_overlap` exclusion constraint | `test_writer_coverage.py:test_coverage_no_overlap_constraint_rejects_direct_overlapping_insert` | Constraint name asserted |
| DAC-E4-S3-4 | SATISFIED | `write_instrument` -- errors propagate, caller transaction rolls back | `test_writer_transaction.py:test_failure_during_*` | No partial state after rollback |
| DAC-E4-S3-5 | SATISFIED | `writer.py` line 418-428 -- acquisition_state upsert with `now()`, `run_id`, `'written'` | `test_writer_transaction.py:test_successful_write_stamps_acquisition_state_for_each_data_type` | All four data types stamped |
| DAC-E4-S3-6 | SATISFIED | `writer.py` line 431-442 -- run_instrument_result insert per data type | `test_writer_transaction.py:test_successful_write_inserts_exactly_four_run_result_rows` | Exactly four rows |
| DAC-E4-S3-7 | SATISFIED | `writer.py:_insert_*` -- all use `ON CONFLICT DO NOTHING` | `test_sql_is_append_only.py:test_writer_source_uses_on_conflict_do_nothing_for_all_observation_tables` | Static guard + source scan |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/conftest.py:migrated_writer_connection` applies 0001-0004 | Correct |
| T002 | complete | VERIFIED | `tests/integration/test_writer_transaction.py` -- 11 tests with TC-COMP traceability comments | All mapped TC-IDs present |
| T003 | complete | VERIFIED | `tests/integration/test_writer_idempotence.py` -- 2 tests with TC-COMP traceability | Controlled observed_on, repeat, restatement |
| T004 | complete | PARTIAL | `test_writer_transaction.py` -- only 2 of 4 failure probes | Missing observation-insert and coverage-replacement probes; see IR-001 |
| T005 | complete | VERIFIED | `tests/unit/test_coverage_merge.py` (11 tests) + `tests/integration/test_writer_coverage.py` (4 tests) | All specified scenarios covered |
| T006 | complete | VERIFIED | `tests/unit/test_sql_is_append_only.py:test_writer_source_uses_on_conflict_do_nothing_for_all_observation_tables` | Writer-source fixtures present |
| T007 | complete | VERIFIED | `tests/unit/test_writer_contract.py` -- 7 tests | Typed collections, ranges, immutability, no runner import |
| T008 | complete | VERIFIED | `src/factorflow/ingestion/coverage.py:merge_ranges` | Sorts, coalesces, one-day adjacency, disjoint preserved |
| T009 | complete | VERIFIED | `writer.py:ParsedObservations, ObservationBatch, WriteResult` | Frozen dataclasses, schema data-type names, no runner dependency |
| T010 | complete | VERIFIED | `writer.py:_insert_references, _insert_daily_bars, _insert_fundamentals, _insert_corporate_actions, _derive_fiscal_period` | value_hash, observed_on, ON CONFLICT DO NOTHING, Jsonb, FY/Q derivation |
| T011 | complete | VERIFIED | `writer.py:write_instrument` | See IR-002 for transaction-boundary deviation; behavior is correct |
| T012 | complete | VERIFIED | `CAP-001-E4-S3-tdd-evidence.yaml` -- 4 TDD cycles, 4 mutation probes | RED/GREEN/MUTATE evidence recorded |
| T013 | complete | VERIFIED | `CAP-001-E4-S3-tdd-evidence.yaml` -- validation section | See IR-003 for uv build gap |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_successful_write_commits_observations_coverage_state_results` / TC-COMP-007, TC-COMP-010, TC-COMP-162 | ADEQUATE | Asserts appended counts and row existence in all four tables | None |
| `test_successful_write_commits_only_actual_returned_ranges` / TC-COMP-167 | ADEQUATE | Verifies coverage segments match input ranges exactly | None |
| `test_successful_write_stamps_acquisition_state_for_each_data_type` / TC-COMP-165, TC-COMP-166 | ADEQUATE | Asserts run_id and outcome for all four data types | None |
| `test_successful_write_inserts_exactly_four_run_result_rows` / TC-COMP-010 | ADEQUATE | Asserts exact four result rows with correct outcomes | None |
| `test_annual_financial_statement_stores_fiscal_period_fy` / TC-COMP-162 | ADEQUATE | Verifies FY derivation from timeframe=annual | None |
| `test_quarterly_financial_statement_stores_fiscal_period_q_n` / TC-COMP-162 | ADEQUATE | Parametrized Q1-Q4 derivation; verifies NOT NULL | None |
| `test_failure_during_acquisition_state_rolls_back_everything` / TC-COMP-138, TC-COMP-165 | ADEQUATE | Trigger-based failure injection; asserts zero rows in all four tables plus coverage and state | None |
| `test_failure_during_run_result_insert_rolls_back_everything` / TC-COMP-139 | ADEQUATE | Same rollback assertion for result-insert failure | None |
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
| Observation-insert failure probe / TC-COMP-138 | MISSING | T004 requires a failure probe at an observation insert | Probe not implemented |
| Coverage-replacement failure probe / TC-COMP-165 | MISSING | T004 requires a failure probe at coverage replacement | Probe not implemented |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest tests/unit/test_coverage_merge.py tests/unit/test_sql_is_append_only.py tests/unit/test_writer_contract.py -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 26 passed |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 359 passed, 104 deselected |
| `uv run pytest -m postgres -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 104 passed, 359 deselected |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 463 passed |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 124 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 36 source files |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No TypeScript errors |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 47 files checked |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 47 files, no fixes |

### Validation Side Effects

- Before: working tree clean, nothing staged or untracked
- After: working tree clean, nothing staged or untracked
- Unexpected tracked-file changes: none

## Findings

### IR-001 -- T004 missing observation-insert and coverage-replacement failure probes

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S3-4 (satisfied by existing probes, but task coverage is incomplete)
- **Tasks**: T004
- **Files**: `tests/integration/test_writer_transaction.py`
- **Claim challenged**: T004 is marked complete but only implements 2 of its 4 required failure injection points.
- **Observed evidence**: The file contains `test_failure_during_acquisition_state_rolls_back_everything` and `test_failure_during_run_result_insert_rolls_back_everything`. No test installs a failure trigger on an observation table (e.g., `instrument_reference`, `daily_bar`, `fundamental_observation`, or `corporate_action`) or on `coverage_segment`.
- **Expected evidence/behavior**: T004 specifies "explicit TC-COMP-138, TC-COMP-139, and TC-COMP-165 failure probes at an observation insert, coverage replacement, acquisition-state upsert, and result insert." All four injection points must have dedicated probes.
- **Impact**: Observation-insert and coverage-replacement failure paths are tested only indirectly through the later-step probes. A bug that corrupts rollback when the failure occurs during an observation insert or coverage replacement step would not be caught.
- **Required remediation**: Add failure-injection tests for (1) an observation table insert (e.g., trigger on `fundamental_observation` BEFORE INSERT) and (2) a coverage replacement step (e.g., trigger on `coverage_segment` BEFORE INSERT), each asserting no partial state survives and the original exception propagates, matching the pattern of the existing two probes.

### IR-002 -- Transaction boundary delegated to caller, deviating from T011 wording

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-4
- **Tasks**: T011
- **Files**: `src/factorflow/ingestion/writer.py:write_instrument`
- **Claim challenged**: T011 says "using one `connection.transaction()` context" but `write_instrument` does not call `connection.transaction()`. It operates on a bare connection and expects the caller to manage the transaction boundary.
- **Observed evidence**: `write_instrument` opens a cursor with `connection.cursor()` but never calls `connection.transaction()`. The test helpers wrap calls in `with conn.transaction():` for failure tests and call `conn.commit()` for happy-path tests. The docstring states: "the caller owns the transaction boundary."
- **Expected evidence/behavior**: T011 literal wording: "using one `connection.transaction()` context."
- **Impact**: The acceptance criterion DAC-E4-4 is satisfied because all operations happen on the same connection and callers always use a transaction. However, a future caller could call `write_instrument` with autocommit enabled and lose atomicity. The function's docstring documents this, so the deviation is intentional but undocumented in the task plan.
- **Required remediation**: Either (a) add `connection.transaction()` inside `write_instrument` to match the task plan literally, or (b) record a deviation in the task plan noting that transaction ownership is delegated to the caller by design, with the rationale documented in the function docstring. Either option resolves this finding.

### IR-003 -- TDD evidence omits uv build without recording the exclusion per T013

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T013
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3-tdd-evidence.yaml`
- **Claim challenged**: T013 lists `uv build` as a required validation command. The TDD evidence says "not run (not required for this story's scope)."
- **Observed evidence**: The TDD evidence file lists `uv build: not run` but T013's instruction to "report that exclusion rather than describing the partial suite as green" applies to PostgreSQL/Playwright unavailability, not to discretionary omission of listed commands.
- **Expected evidence/behavior**: All listed validation commands in T013 should be run or excluded with a specific reason matching the exclusion protocol.
- **Impact**: Minimal. `uv build` is a packaging step and this story touches no packaging configuration. The omission does not affect correctness.
- **Required remediation**: Run `uv build` and record its result in the TDD evidence, or add a note that it was excluded because no packaging files were modified.

## Previous Review Disposition

Not applicable -- initial review.

## Scope and Plan Deviations

- The story file's `status` field was changed from `planning` to `in-review`. This is an expected lifecycle transition.
- `write_instrument` delegates transaction ownership to the caller rather than calling `connection.transaction()` internally (see IR-002). The implementation is functionally correct and the deviation is documented in the function docstring.
- `uv build` was not executed by the coding agent (see IR-003). All other validation commands were run and passed.
- No unjustified scope leakage detected. All changed files trace to story tasks.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Address IR-001 (add the two missing failure-injection probes) and resolve IR-002 (either add internal transaction management or record a task-plan deviation). Then rerun adversarial review.
- **Warnings accepted downstream**: N/A
