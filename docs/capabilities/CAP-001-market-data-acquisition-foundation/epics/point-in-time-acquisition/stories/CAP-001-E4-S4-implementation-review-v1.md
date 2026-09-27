---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-22
updated: 2026-09-22
story_id: "CAP-001-E4-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-22T20:01:00Z"
reviewed_head: "129e972acb17cda546b5b2374dca0c6ac85fea73"
review_base: "ce39a7158dd3a05c1497abe212dfaf740cb8bdac"
reviewed_state_revision: "sha256:ddde7b169809ec2b33118557f03adf2048f94cf90d8d457390a64be0434fb450"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E4-S4
    artifact_version: 1
    content_revision: sha256:724606865ff840d1e18c71b2e7338932cc608863e685dcef91752ba9ae8ef2ef
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-4-6
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-09-22T20:01:00Z
  source_artifacts:
    - id: CAP-001-E4-S4
      version: "1"
    - id: CAP-001-E4-S4-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E4-S4 --- Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 9/9 verified |
| Required validation | 4/4 passed |

All acceptance criteria are satisfied, all planned tasks are verified, and all required validation commands pass. Two medium-severity findings relate to deterministic data-type test coverage completeness and an internal mutable-list code-quality pattern. One low finding notes a single-day coverage edge case.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S4-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E4-S4` |
| HEAD | `129e972acb17cda546b5b2374dca0c6ac85fea73` |
| Review base | `origin/main` / `ce39a7158dd3a05c1497abe212dfaf740cb8bdac` |
| Working tree | clean |
| Changed files reviewed | 6 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S4-tasks.md` | modified | All tasks: checkbox state updates |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S4.md` | modified | Status update to `in-review` |
| `pyproject.toml` | modified | T001: add `hypothesis` dev dependency |
| `src/factorflow/ingestion/plan.py` | added | T006, T007: core planner implementation |
| `tests/unit/test_fetch_plan.py` | added | T002, T003, T004, T005, T008: all test tasks |
| `uv.lock` | modified | T001: lockfile resolution for `hypothesis` |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-22 | SATISFIED | `plan.py:plan_fetches` yields earlier gap when coverage starts after `depth_start` | `test_deepening_backfill_fetches_earlier_range`, `test_earlier_gap_when_coverage_starts_after_depth_start` | Backfill range starts at new depth_start and ends at coverage_start |
| AC-6 | SATISFIED | `plan.py:plan_fetches` lines 108-113 skip covered interior, lines 121-124 emit trailing re-fetch | `test_no_re_request_of_held_interior_data`, `test_full_coverage_yields_trailing_range_only` | Interior coverage is not re-requested; only trailing range is emitted |
| DAC-E4-6 | SATISFIED | `plan.py:plan_fetches` gap-walking algorithm lines 104-128 | `test_no_coverage_yields_whole_range`, `test_interior_gap_yields_two_ranges`, `test_coverage_outside_window_is_clipped` | Only uncovered sub-ranges within the requested window are yielded |
| DAC-E4-7 | SATISFIED | `plan.py:plan_fetches` line 109-111 emits gap before coverage start | `test_earlier_gap_when_coverage_starts_after_depth_start` | Earlier gap yielded as a separate FetchRange |
| DAC-E4-8 | SATISFIED | `plan.py:depth_start_for_run` reads `run.history_depth_years` (line 48) | `test_depth_start_for_run_uses_snapshotted_depth`, `test_queued_run_uses_its_own_snapshotted_depth` | No owner setting access; depth derived from the claimed run snapshot |
| DAC-E4-9 | SATISFIED | `plan.py:plan_fetches` line 123-124 emits trailing from `cursor` (= `covered_to`) | `test_trailing_range_starts_at_covered_to_not_day_after` | Re-fetch starts at `covered_to`, not `covered_to + 1` |
| DAC-E4-S4-1 | SATISFIED | `plan.py:plan_fetches` lines 126-128 emit whole window when no coverage | `test_no_coverage_yields_whole_range` | Single FetchRange from depth_start to today |
| DAC-E4-S4-2 | SATISFIED | `plan.py:plan_fetches` lines 121-124 emit only trailing when fully covered | `test_full_coverage_yields_trailing_range_only` | Only trailing range from covered_to to today |
| DAC-E4-S4-3 | SATISFIED | `plan.py:plan_fetches` gap-walking loop emits separate ranges per gap | `test_interior_gap_yields_two_ranges` | Two separate FetchRange objects, not one spanning held data |
| DAC-E4-S4-4 | SATISFIED | `plan.py:depth_start_for_run` uses only `run.history_depth_years` | `test_queued_run_uses_its_own_snapshotted_depth` | Snapshotted depth determines scope |
| DAC-E4-S4-5 | SATISFIED | `plan.py:plan_fetches` accepts `data_type` parameter and labels output | `test_data_types_planned_independently`, `test_property_no_non_trailing_range_overlaps_coverage` | Each call plans one data type independently |
| DAC-E4-S4-6 | SATISFIED | `plan.py:plan_fetches` line 81-82 returns empty for inverted window | `test_inverted_window_yields_empty_plan`, `test_depth_start_equals_today_yields_empty_plan` | Guard handles both `>` and `==` cases |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `pyproject.toml` adds `hypothesis` to dev deps; `uv.lock` updated | Hypothesis 6.168.0 resolved and importable |
| T002 | complete | VERIFIED | `tests/unit/test_fetch_plan.py` lines 31-164: all 13 TC-IDs traced with `# Implements TC-COMP-...` comments | TC-COMP-003, 006, 022, 140, 141, 142, 143, 169-174 all present |
| T003 | complete | VERIFIED | `test_fetch_plan.py`: exact FetchRange assertions for no coverage, earlier backfill, full coverage trailing, interior gap; `prices` and `reference` exercised deterministically | See IR-001 for `fundamentals` and `corporate_actions` deterministic gap |
| T004 | complete | VERIFIED | `test_fetch_plan.py` lines 156-189: `depth_start_for_run` snapshot tests, Feb-29 clamping, inverted window | Snapshot isolation and boundary conditions verified |
| T005 | complete | VERIFIED | `test_fetch_plan.py` lines 197-266: Hypothesis property test with 200 examples, all four data types | Validates ordering, window bounds, non-overlap, and data-type labelling |
| T006 | complete | VERIFIED | `plan.py`: `FetchRange` (line 29), `depth_start_for_run` (line 40), `plan_fetches` (line 61) with `data_type` parameter | Signature deviation from design spec documented in task plan Resolved Conflicts |
| T007 | complete | VERIFIED | `plan.py` lines 84-128: clip, sort, coalesce, gap-walk, trailing re-fetch | Algorithm matches section 2.3 requirements |
| T008 | complete | VERIFIED | `test_fetch_plan.py` lines 274-298: boundary test exercises `depth_start_for_run` then per-type `plan_fetches`; `plan.py` imports only `ClaimedRun` type, no DB/journal/roster/provider/setting access | Module remains pure |
| T009 | complete | VERIFIED | All four commands pass: pytest (17/17), ruff check (clean), ruff format (clean), mypy (clean) | Mutation evidence not independently verifiable but tests are regression-sensitive |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_no_coverage_yields_whole_range` / TC-COMP-169 | ADEQUATE | Asserts exact single FetchRange with depth_start..today | None |
| `test_full_coverage_yields_trailing_range_only` / TC-COMP-170 | ADEQUATE | Asserts exact single trailing FetchRange starting at covered_to | None |
| `test_trailing_range_starts_at_covered_to_not_day_after` / TC-COMP-143 | ADEQUATE | Asserts start == covered_to (inclusive re-fetch, not next day) | None |
| `test_earlier_gap_when_coverage_starts_after_depth_start` / TC-COMP-141 | ADEQUATE | Asserts two-range sequence: gap then trailing | None |
| `test_interior_gap_yields_two_ranges` / TC-COMP-171 | ADEQUATE | Asserts exact two-range sequence with correct boundaries | None |
| `test_deepening_backfill_fetches_earlier_range` / TC-COMP-022 | ADEQUATE | Asserts first range spans new_depth_start..coverage_start | None |
| `test_no_re_request_of_held_interior_data` / TC-COMP-006 | ADEQUATE | Asserts single trailing range, no interior duplication | None |
| `test_data_types_planned_independently` / TC-COMP-003, TC-COMP-173 | ADEQUATE | Asserts different results for prices vs reference given different coverage | Only `prices` and `reference` tested deterministically; see IR-001 |
| `test_inverted_window_yields_empty_plan` / TC-COMP-174 | ADEQUATE | Asserts empty list for future depth_start | None |
| `test_depth_start_equals_today_yields_empty_plan` | ADEQUATE | Asserts empty list for depth_start == today | None |
| `test_coverage_outside_window_is_clipped` / TC-COMP-140 | ADEQUATE | Asserts all ranges start >= depth_start | None |
| `test_depth_start_for_run_uses_snapshotted_depth` / TC-COMP-142 | ADEQUATE | Asserts exact date from 3-year subtraction | None |
| `test_queued_run_uses_its_own_snapshotted_depth` / TC-COMP-172 | ADEQUATE | Asserts exact date from 2-year subtraction | None |
| `test_depth_start_feb29_clamps_to_feb28_in_non_leap_year` | ADEQUATE | Asserts Feb-29 in leap year minus 1 year clamps to Feb-28 | None |
| `test_plan_fetches_empty_when_depth_start_after_today` | ADEQUATE | Asserts empty plan for inverted window via depth_start_for_run | None |
| `test_property_no_non_trailing_range_overlaps_coverage` | ADEQUATE | 200 generated cases validate ordering, window bounds, non-overlap, labelling | None |
| `test_e4_s5_boundary_depth_start_for_run_then_plan_per_data_type` | ADEQUATE | Exercises the exact consumption pattern CAP-001-E4-S5 will use | None |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_fetch_plan.py -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 17 passed in 0.23s |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 119 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues found in 35 source files |

### Validation Side Effects

- Before: working tree clean, no staged/unstaged/untracked files
- After: working tree clean, no staged/unstaged/untracked files
- Unexpected tracked-file changes: none

## Findings

### IR-001 --- Deterministic tests exercise only two of four required data types

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S4-5
- **Tasks**: T003
- **Files**: `tests/unit/test_fetch_plan.py:test_data_types_planned_independently`
- **Claim challenged**: T003 requires invoking the planner independently with `reference`, `prices`, `fundamentals`, and `corporate_actions` coverage.
- **Observed evidence**: The deterministic table-driven tests use only `prices` and `reference`. The `fundamentals` and `corporate_actions` types appear only in the Hypothesis property test strategy (line 219), which randomly samples from all four.
- **Expected evidence/behavior**: T003 specifies all four data types should be exercised in the explicit assertion tests.
- **Impact**: Since `data_type` is a pass-through label, the planner behaves identically for all four types. The behavioral correctness is not in question. However, the deterministic traceability evidence for `fundamentals` and `corporate_actions` relies on the property test rather than explicit named assertions.
- **Required remediation**: Add two deterministic test cases (or extend the existing `test_data_types_planned_independently`) to invoke `plan_fetches` with `fundamentals` and `corporate_actions` data types and assert the labelled output.

### IR-002 --- Coalescing step uses mutable lists disguised as tuples

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/plan.py:99-102`
- **Claim challenged**: Code quality of the coalescing algorithm.
- **Observed evidence**: Line 99 appends `list(seg)` into a `list[tuple[date, date]]` with a `type: ignore` comment, then line 102 converts lists back to tuples with another `type: ignore`. The in-place mutation of merged segments via `merged[-1] = (merged[-1][0], max(...))` on line 97 already creates a new tuple, so the list conversion on line 99 is unnecessary -- the tuple on line 97 could be used directly with proper indexing.
- **Expected evidence/behavior**: Coalescing without `type: ignore` suppression, using a pattern consistent with the typed, frozen-dataclass discipline in the rest of the module.
- **Impact**: No runtime correctness issue. The code works correctly and mypy passes with the suppression. The concern is maintainability: `type: ignore` comments hide potential future type errors in this section.
- **Required remediation**: Refactor the coalescing loop to avoid the list-to-tuple round-trip and remove the two `type: ignore` comments.

### IR-003 --- Single-day coverage segments silently dropped by strict less-than clip guard

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-6
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/plan.py:89`
- **Claim challenged**: Clipping and normalization of coverage segments.
- **Observed evidence**: Line 89 uses `if s < e:` to filter clipped segments. When a coverage segment covers exactly one day (e.g., `(date(2025, 6, 1), date(2025, 6, 1))`), the clipped result has `s == e` and the segment is dropped. This means single-day coverage is treated as non-existent.
- **Expected evidence/behavior**: The component design states `coverage_segment` permits inclusive ranges. A single inclusive day `(d, d)` is a valid segment.
- **Impact**: The only consequence is a harmless re-fetch of that single day, since the writer is idempotent. No data loss or duplication occurs. The trailing re-fetch behavior already re-fetches the last covered day, so this edge case aligns with the module's re-fetch-is-cheap philosophy.
- **Required remediation**: Consider documenting the `s < e` choice (i.e., single-day segments are intentionally treated as zero-width and re-fetched) or adjusting to `s <= e` with appropriate handling downstream. This is non-blocking.

## Previous Review Disposition

Not applicable --- initial review.

## Scope and Plan Deviations

- The `plan_fetches` signature adds a `data_type` parameter not present in the component design's illustrative signature. This is documented in the task plan's Resolved Conflicts section and is justified by DAC-E4-S4-5, which requires the planner to label output by data type.
- No unjustified scope leakage detected. All six changed files trace to planned tasks.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Synchronize component documentation with the implemented planner module.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003
