---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-22
docs_synced_review: CAP-001-E4-S4-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-16T16:47:04Z
  source_artifacts:
    - id: CAP-001-E4-S4
      version: "1"
    - id: CAP-001-component-design-acquisition-runner
      version: "approved"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-run-journal
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E4-S4 — Range Planning: Fetch Only What Is Missing

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E4-tasks`
**Date**: 2026-09-16

## Summary

Create the pure ingestion range planner that computes each data type's uncovered intervals from a claimed run's snapshotted history depth. It backfills earlier gaps, deliberately re-fetches the trailing covered day, preserves disjoint gaps, and never produces an inverted range.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-3 | Plan reference, prices, fundamentals, and corporate actions independently. | T002, T003, T006 |
| AC-6 | Do not re-request held periods except the deliberate trailing range. | T002, T003, T006, T007 |
| AC-22 | Backfill the earlier range when history depth is raised. | T002, T003, T006 |
| DAC-E4-6 | Yield only requested-depth sub-ranges that are not covered. | T002, T003, T006 |
| DAC-E4-7 | Yield an earlier gap when coverage starts after `depth_start`. | T002, T003, T006 |
| DAC-E4-8 | Derive `depth_start` from the claimed run's snapshotted depth. | T002, T004, T006 |
| DAC-E4-9 | Re-fetch the trailing range from `covered_to`. | T002, T003, T006 |
| DAC-E4-S4-1 | No coverage yields the complete requested window. | T002, T003 |
| DAC-E4-S4-2 | Full coverage yields only the trailing range. | T002, T003 |
| DAC-E4-S4-3 | An interior gap yields separate missing ranges. | T002, T003, T006 |
| DAC-E4-S4-4 | A queued run uses its own snapshotted depth. | T002, T004, T006 |
| DAC-E4-S4-5 | Each of the four data types is planned independently. | T002, T003, T006 |
| DAC-E4-S4-6 | A depth start after today yields no range. | T002, T004, T006 |

## Phase 1: Setup

**Purpose**: Add the test-only dependency required to exercise the story's generated-coverage property.

- [x] T001 Add `hypothesis` to the Python development dependencies in `pyproject.toml` and resolve it into `uv.lock` so the generated-coverage property test runs under `pytest`.

**Checkpoint**: The database-free test environment can generate inclusive coverage intervals without PostgreSQL or an owner-setting dependency.

---

## Phase 2: Tests (TDD)

**Purpose**: Define the pure planning contract and its calendar, coverage, and per-data-type boundary cases before implementation.

### Mandatory Component Tests

- [x] T002 Create table-driven planner tests in `tests/unit/test_fetch_plan.py` for TC-COMP-003, TC-COMP-006, TC-COMP-022, TC-COMP-140, TC-COMP-141, TC-COMP-142, TC-COMP-143, and TC-COMP-169 through TC-COMP-174; add a `# Implements TC-COMP-...` trace comment for every mapped case.
- [x] T003 In `tests/unit/test_fetch_plan.py`, assert exact labelled `FetchRange` sequences for no coverage, an earlier backfill, full coverage with a trailing re-fetch beginning at `covered_to`, and multiple disjoint uncovered gaps; invoke the planner independently with `reference`, `prices`, `fundamentals`, and `corporate_actions` coverage.

### Additional Unit Tests

- [x] T004 Add depth-snapshot and boundary tests in `tests/unit/test_fetch_plan.py`: derive `depth_start` from a supplied `ClaimedRun.history_depth_years`, never read an owner setting, apply the recorded February-29 clamping rule, and return an empty plan when `depth_start > today`.
- [x] T005 Add a Hypothesis property test in `tests/unit/test_fetch_plan.py` which generates valid non-overlapping coverage intervals and proves every yielded range is ordered, remains within the requested window, and neither overlaps held coverage nor spans an interior covered interval, except for the deliberate trailing range beginning at the final `covered_to`.

**Checkpoint**: Focused tests make inclusive date boundaries, trailing-day re-fetch, independent data-type planning, and run-snapshot ownership explicit and fail because the planner does not exist.

---

## Phase 3: Core Implementation

**Purpose**: Implement the typed, database-free planner that turns one data type's coverage segments and a run snapshot into fetch ranges.

- [x] T006 Create `FetchRange`, `depth_start_for_run`, and the public `plan_fetches(data_type, covered, depth_start, today)` API in `src/factorflow/ingestion/plan.py`; derive `depth_start` only from a supplied `ClaimedRun.history_depth_years`, apply the recorded February-29 clamping rule, and return no ranges for an inverted requested window.
- [x] T007 In `src/factorflow/ingestion/plan.py`, normalize supplied inclusive coverage intervals, intersect them with `[depth_start, today]`, coalesce overlapping or adjacent intervals, emit each missing inclusive interval in order, and retain `covered_to` as the start of the deliberate trailing re-fetch when coverage reaches `today`.

**Checkpoint**: The planner is deterministic, has no PostgreSQL or owner-setting dependency, and returns separate, data-type-labelled fetch intervals without re-requesting covered interior dates.

---

## Phase 4: Integration

**Purpose**: Define the CAP-001-E4-S5 consumption boundary without adding runner orchestration to this pure-planner story.

- [x] T008 Document and exercise in `tests/unit/test_fetch_plan.py` the CAP-001-E4-S5 boundary: its claimed run supplies `history_depth_years` to `depth_start_for_run`, then it calls `plan_fetches` once per data type with only that type's coverage; keep `src/factorflow/ingestion/plan.py` free of journal, database, roster, provider, and current-setting access.

**Checkpoint**: CAP-001-E4-S5 can consume one pure, data-type-labelled planner API without duplicating coverage arithmetic or redefining the claimed run's scope.

---

## Phase 5: Polish

**Purpose**: Prove the pure planner catches changed range behavior and satisfies the component's Python quality checks.

- [x] T009 Run `uv run pytest -m 'not postgres' tests/unit/test_fetch_plan.py`, `uv run ruff check .`, `uv run ruff format --check .`, and `uv run mypy src` from the repository root; manually mutate the interior-gap and trailing-range boundary conditions in `src/factorflow/ingestion/plan.py` to prove the tests fail, then restore the minimum passing implementation.

**Checkpoint**: The pure planner's mapped tests, generated-coverage property, mutation check, and repository Python static checks pass without a PostgreSQL container.

## Dependencies & Execution Order

### Task Dependencies

- T001 is required before T005; T002 through T005 establish RED behavior before T006 and T007.
- T003 through T005 depend on the test module created by T002 and remain coordinated in that file.
- T006 depends on T002 and T004; T007 depends on T003 through T006; T008 depends on T006 and T007; T009 depends on T001 through T008.

### Parallel Opportunities

- No implementation tasks are parallel: T006 establishes the public shape and T007 completes its interval algorithm. Test case design can be prepared independently, but T002 through T005 share `tests/unit/test_fetch_plan.py` and must land in order.

### Phase Dependencies

- Phase 1 must complete before the Hypothesis property test in Phase 2.
- Phase 2 must produce observed RED results before Phase 3 begins; Phase 4 follows Phase 3 and Phase 5 follows Phase 4.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest` and `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Use table-driven pure-function cases to verify all thirteen mapped TC IDs, including independent coverage for the four data types and inclusive `covered_to` trailing re-fetch.
- Verify that no coverage returns exactly `[depth_start, today]`, while a completely covered window returns only `[covered_to, today]`.
- Verify an earlier backfill and interior gap are returned as separate ordered ranges that do not span covered dates.
- Use generated valid-interval cases to prove no non-trailing output overlaps or spans held coverage, and manually mutate the gap/trailing boundaries to demonstrate the tests detect the changed behavior.
- Verify that `depth_start_for_run` depends on the claimed run's stored depth, not an owner setting read at execution time, and that an inverted window is empty.

## Notes

### Resolved Conflicts

- `CAP-001-E4-S4.md` requires independent planning for all four data types (DAC-E4-S4-5), but its illustrative `plan_fetches` signature has no data-type input even though `FetchRange` includes `data_type`. The acceptance criterion governs the illustrative signature: accept a label for one supplied data type at the planner boundary. CAP-001-E4-S5 will call it independently with each data type's coverage.

### Open Gaps

- **PROVISIONAL — recorded 2026-09-16:** No approved artifact specifies calendar-year subtraction at the February 29 boundary for `depth_start = today minus history_depth_years`. This plan adopts calendar-year subtraction that clamps February 29 to February 28 when the destination year is not leap. It is the minimal deterministic interpretation of “minus … years,” keeps the result a valid date, and should be recorded in the next revision of `component-design-acquisition-runner.md` §2.3.

### Other Notes

- `ClaimedRun.history_depth_years` is the binding run-snapshot source (`component-design-run-journal.md` §2.4); the planner must not read `owner_setting`.
- `coverage_segment` permits multiple non-overlapping inclusive ranges per instrument and data type (`component-design-market-data-store.md` §2.3), which is why interior gaps must be preserved rather than collapsed.
- The register is otherwise correct for this story; no correction is required. Its generic note that the Massive adjusted-bars choice remains open is not relevant to this range-only planner.
