---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S4-tasks
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
  timestamp: 2026-09-11T22:08:00Z
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
**Date**: 2026-09-11

## Summary

Create the pure ingestion range planner that computes each data type's uncovered intervals from its run-snapshotted history depth. It must backfill earlier gaps, deliberately re-fetch the trailing covered day, preserve disjoint gaps, and never produce an inverted range.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-3 | Plan reference, prices, fundamentals, and corporate actions independently. | T001, T002, T003 |
| AC-6 | Do not re-request held periods except the deliberate trailing range. | T001, T002, T003, T004 |
| AC-22 | Backfill the earlier range when history depth is raised. | T001, T002, T003 |
| DAC-E4-6 | Yield only requested-depth sub-ranges that are not covered. | T001, T002, T003 |
| DAC-E4-7 | Yield an earlier gap when coverage starts after `depth_start`. | T001, T002 |
| DAC-E4-8 | Derive `depth_start` from the claimed run's snapshotted depth. | T001, T003 |
| DAC-E4-9 | Re-fetch the trailing range from `covered_to`. | T001, T002, T003 |
| DAC-E4-S4-1 | No coverage yields the complete requested window. | T001, T002 |
| DAC-E4-S4-2 | Full coverage yields only the trailing range. | T001, T002 |
| DAC-E4-S4-3 | An interior gap yields separate missing ranges. | T001, T002, T003 |
| DAC-E4-S4-4 | A queued run uses its own snapshotted depth. | T001, T003 |
| DAC-E4-S4-5 | Each of the four data types is planned independently. | T001, T002, T003 |
| DAC-E4-S4-6 | A depth start after today yields no range. | T001, T002, T003 |

## Phase 1: Setup

**Purpose**: Confirm the existing Python test layout is sufficient for a database-free ingestion planner.

**Checkpoint**: No dependency, migration, or configuration change is required; the planner can be introduced as a pure module.

---

## Phase 2: Tests (TDD)

**Purpose**: Define the pure planning contract and its calendar, coverage, and per-data-type boundary cases before implementation.

### Mandatory Component Tests

- [ ] T001 Create table-driven planner tests in `tests/unit/test_fetch_plan.py` for TC-COMP-140, TC-COMP-141, TC-COMP-142, TC-COMP-143, TC-COMP-169, TC-COMP-170, TC-COMP-171, TC-COMP-172, TC-COMP-173, and TC-COMP-174; add a `# Implements TC-COMP-...` trace comment for every mapped case.
- [ ] T002 In `tests/unit/test_fetch_plan.py`, assert exact `FetchRange` sequences for no coverage, coverage beginning after `depth_start`, full coverage with a trailing re-fetch beginning at `covered_to`, and multiple disjoint uncovered gaps; test each of `reference`, `prices`, `fundamentals`, and `corporate_actions` with independently supplied coverage.

### Additional Unit Tests

- [ ] T003 [P] Add normalization and boundary tests in `tests/unit/test_fetch_plan.py`: clip coverage to the requested window, coalesce overlapping or adjacent covered intervals before calculating gaps, make `depth_start > today` empty, and prove a claimed run's supplied `history_depth_years` is used instead of a changed owner-setting value.

**Checkpoint**: Focused tests make the intended inclusive date boundaries, trailing-day re-fetch, and run-snapshot ownership explicit and fail because the planner does not exist.

---

## Phase 3: Core Implementation

**Purpose**: Implement the typed, database-free planner that turns one data type's coverage segments and a run snapshot into fetch ranges.

- [ ] T004 Create `FetchRange`, the `plan_fetches` API, and a small date-depth helper in `src/factorflow/ingestion/plan.py`; accept the data type alongside one data type's `covered` intervals, calculate `depth_start` from the claimed run's `history_depth_years`, and return no ranges for an inverted requested window.
- [ ] T005 In `src/factorflow/ingestion/plan.py`, normalize the supplied inclusive coverage intervals, intersect them with `[depth_start, today]`, and emit each missing inclusive interval in order; retain `covered_to` as the start of the final deliberate trailing re-fetch when coverage reaches `today`.

**Checkpoint**: The planner is deterministic, has no PostgreSQL or current-setting dependency, and returns separate, data-type-labelled fetch intervals without re-requesting covered interior dates.

---

## Phase 4: Integration

**Purpose**: Make the completed pure planner callable by the later acquisition-runner story without reading current settings or database state.

- [ ] T006 In `src/factorflow/ingestion/plan.py`, expose the planner's typed public API for CAP-001-E4-S5 to call once per data type with coverage read from `coverage_segment` and the claimed run's `history_depth_years`; do not introduce database access or an owner-setting read.

**Checkpoint**: CAP-001-E4-S5 has a deterministic per-data-type planning boundary with all run-specific inputs supplied explicitly.

---

## Phase 5: Polish

**Purpose**: Verify the planner is suitable for CAP-001-E4-S5 to call once per data type using a claimed run's immutable depth.

- [ ] T007 Run `uv run pytest -m 'not postgres' tests/unit/test_fetch_plan.py`, `uv run ruff check .`, `uv run ruff format --check .`, and `uv run mypy src` from the repository root; retain the mapped TC trace comments and correct only failures in `src/factorflow/ingestion/plan.py` or `tests/unit/test_fetch_plan.py`.

**Checkpoint**: The pure planner's mapped tests and repository Python static checks pass without requiring a PostgreSQL container.

## Dependencies & Execution Order

### Task Dependencies

- T001 and T002 define the mandatory RED behavior before T004 and T005.
- T003 can be developed in parallel with T001 and T002; T004 depends on T001 and T003.
- T005 depends on T004 and the expected interval cases from T002.
- T006 depends on T004 and T005; T007 depends on T001 through T006.

### Parallel Opportunities

- T001, T002, and T003 all modify `tests/unit/test_fetch_plan.py`; keep their cases coordinated in one test module, but their case design is independent.

### Phase Dependencies

- Phase 2 must have observed RED tests before Phase 3 begins.
- Phase 3 must be complete before Phase 4 integration; Phase 5 follows Phase 4.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest` and `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Use table-driven pure-function cases to verify all ten mapped TC IDs, including the four data types and inclusive `covered_to` trailing re-fetch.
- Verify that no coverage returns exactly `[depth_start, today]`, while a completely covered window returns only `[covered_to, today]`.
- Verify an earlier backfill and interior gap are returned as separate ordered ranges that do not span covered dates.
- Verify that planning depends on the claimed run's stored depth, not an owner setting read at execution time, and that an inverted window is empty.

## Notes

### Resolved Conflicts

- `CAP-001-E4-S4.md` requires independent planning for all four data types (DAC-E4-S4-5), but its illustrative `plan_fetches` signature has no data-type input even though `FetchRange` includes `data_type`. The acceptance criterion governs the illustrative signature: plan one supplied data type at a time and require its label at the planner boundary. CAP-001-E4-S5 will call it independently with each data type's coverage.

### Open Gaps

- **PROVISIONAL — awaiting owner confirmation (2026-09-11):** No approved artifact specifies calendar-year subtraction at the February 29 boundary for `depth_start = today minus history_depth_years`. This plan adopts calendar-year subtraction that clamps February 29 to February 28 when the destination year is not leap. It is the minimal deterministic interpretation of “minus … years,” keeps the result a valid date, and should be recorded in the next revision of `component-design-acquisition-runner.md` §2.3.

### Other Notes

- `ClaimedRun.history_depth_years` is the binding run-snapshot source (`component-design-run-journal.md` §2.4); the planner must not read `owner_setting`.
- `coverage_segment` permits multiple non-overlapping inclusive ranges per instrument and data type (`component-design-market-data-store.md` §2.3), which is why interior gaps must be preserved rather than collapsed.
- The resolution register is otherwise correct for this story; no correction is required.
