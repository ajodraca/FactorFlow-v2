---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
docs_synced_review: CAP-001-E5-S4-implementation-review-v1.md
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-24
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-18T15:29:00Z
  source_artifacts:
    - id: CAP-001-E5-S4
      version: "1"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
    - id: CAP-001-component-design-observation-writer
      version: "4"
    - id: CAP-001-component-design-runtime-config
      version: "approved"
    - id: CAP-001-system-design
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S4 — Heartbeat and Abandoned-Run Reclaim Sweep

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-tasks`
**Date**: 2026-09-18

## Summary

Implement the run-journal heartbeat and application-side reclaim sweep. S4 owns the concrete heartbeat journal operation and its integration at the runner’s existing between-instruments cancellation checkpoint. An atomic, repeatable sweep marks stale claimed `running` or `cancelling` runs `abandoned`, clears their claims, and frees the active slot without changing independently committed coverage or results. A run-state guard keyed by the existing `run_id` closes the race between a successful heartbeat and the following writer transaction without changing the approved writer interface.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-20 | An interrupted run reaches a terminal state without manual datastore edits and does not block a later run. | T002, T003, T005, T007, T010 |
| DAC-E5-10 | A claim holder refreshes its heartbeat at the runner’s between-instruments cancellation checkpoint. | T007, T008, T011 |
| DAC-E5-11 | A stale claimed `running` or `cancelling` run becomes terminal `abandoned` and releases its claim. | T002, T006, T007 |
| DAC-E5-12 | Reclaim is idempotent and frees a later request. | T003, T007 |
| DAC-E5-13 | A runner that lost its claim performs no further writes for that run. | T004, T008, T009, T011 |
| DAC-E5-S4-1 | A fresh heartbeat is not reclaimed. | T002, T006, T007 |
| DAC-E5-S4-2 | A stale `cancelling` run is reclaimed as `abandoned`. | T002, T006, T007 |
| DAC-E5-S4-3 | Coverage committed before reclaim remains present. | T002, T007 |
| DAC-E5-S4-4 | Reclaim runs in the application lifespan even when ingestion is stopped. | T005, T010 |
| DAC-E5-S4-5 | Concurrent sweepers reclaim one stale claim once and the other is a no-op. | T003, T007 |
| DAC-E5-S4-6 | The original runner’s heartbeat and subsequent conditional write are rejected after reclaim. | T004, T007, T009 |

## Phase 1: Setup

**Purpose**: Gate S4 on landed schema, claim, writer, and lifespan artifacts without requiring the heartbeat call site that S4 itself owns.

- [x] T001 Before changing S4 production files, verify that `migrations/0003_coverage.sql`, `migrations/0004_runs.sql`, `src/factorflow/runs/states.py`, and the migrated run-schema fixture in `tests/conftest.py` have landed from CAP-001-E5-S1; verify the CAP-001-E5-S2 request/claim boundary exists in `src/factorflow/runs/journal.py`, the CAP-001-E4-S3/E4-S6 one-instrument result transaction exists in `src/factorflow/ingestion/writer.py`, and the CAP-001-E1-S6 lifespan/pool exists in `src/factorflow/api/app.py`. Do not require or create a runner heartbeat call site in this prerequisite task (prerequisite infrastructure for all story ACs).

**Checkpoint**: S4 consumes landed schema and owning-story seams, but the heartbeat function and concrete runner call-site integration remain work owned by T007 and T008.

---

## Phase 2: Tests (TDD)

**Purpose**: Write and observe RED tests for the S4-owned journal, reclaim, guarded-write, and lifespan behavior while reusing E4-S5’s runner-loop tests rather than duplicating them.

### Mandatory Component Tests

- [x] T002 Implement `TC-COMP-020`, `TC-COMP-246`, `TC-COMP-273`, `TC-COMP-274`, and `TC-COMP-275` in `tests/integration/test_run_reclaim.py`; add one `# Implements TC-COMP-...` traceability comment for each S4-owned case, use PostgreSQL `now()`-relative timestamps just inside and just outside `RunSettings.stale_after_seconds`, and assert that only stale claimed `running` and `cancelling` rows become `abandoned` with `ended_at` set and both claim fields cleared, while a fresh row and snapshots of committed `coverage_segment`, `acquisition_state`, and `run_instrument_result` rows remain unchanged.
- [x] T003 Implement `TC-COMP-247` and `TC-COMP-277` in `tests/integration/test_run_reclaim.py`; add both traceability comments, open two psycopg connections with `IsolationLevel.READ_COMMITTED`, release two worker threads from a barrier immediately before each invokes reclaim, have each worker commit before returning its result, assert after both workers complete that exactly one returns the reclaimed run and the other returns no row, assert a repeated sweep remains a no-op, then use CAP-001-E5-S2 `claim_next` to claim the oldest queued request.
- [x] T004 Implement `TC-COMP-278` in `tests/integration/test_run_reclaim.py`; add only `# Implements TC-COMP-278`, assert heartbeat returns `False` after reclaim, then invoke `write_instrument` with the reclaimed run’s existing `run_id` and assert its locked active-state check rejects the write before any new observation, coverage, acquisition-state, or `run_instrument_result` row commits. Do not add `TC-COMP-245` or `TC-COMP-248` trace comments here: CAP-001-E4-S5 owns those runner-loop tests in `tests/integration/test_runner_reclaim.py`.
- [x] T005 [P] Implement `TC-COMP-276` in `tests/unit/test_api_reclaim_lifespan.py`; add `# Implements TC-COMP-276`, monkeypatch the `ConnectionPool` construction pattern used by `src/factorflow/api/app.py`, inject a wait callable that records requested delays without wall-clock sleeping, inject a synchronous-work dispatcher double, and assert the application retains a reclaim task, dispatches pool checkout/sweep work off the event loop, requests the owner-confirmed 5-second delay between sweeps, and cancels/awaits the task before pool close while no ingestion process exists.

### Additional Unit Tests

- [x] T006 [P] Create `tests/unit/test_run_reclaim.py` with focused cursor doubles for the journal heartbeat and reclaim statement: assert `run_id`, `runner_id`, and stale-after seconds are bound values; a zero-row heartbeat maps to `False`; the stale comparison is strict; reclaim requires a non-null claim in exactly `running` or `cancelling`; and terminalisation sets `ended_at`, clears both claim fields, and reports only rows returned by the atomic statement. During GREEN and final validation, also run the E4-S5-owned `TC-COMP-245` and `TC-COMP-248` tests in `tests/integration/test_runner_reclaim.py` without adding duplicate trace comments or replacement tests.

**Checkpoint**: Nine S4-owned mapped component tests carry traceability comments; the two runner-loop cases remain traced once in E4-S5; PostgreSQL cases use the `postgres` marker; RED is executed before T007–T010; and neither lifespan nor concurrency tests depend on scheduler luck or wall-clock sleeps.

---

## Phase 3: Core Implementation

**Purpose**: Land the concrete heartbeat operation and atomic stale terminalisation at the run-journal/PostgreSQL boundary.

- [x] T007 Update `src/factorflow/runs/journal.py` with the designed `heartbeat(connection, run_id, runner_id) -> bool` conditional update from `CAP-001-E5-S4.md` §Technical Details and `component-design-run-journal.md` §2.4, and create `src/factorflow/runs/reclaim.py` with a typed reclaim function accepting a connection and `stale_after_seconds`; use one parameterised `UPDATE ... RETURNING` to select only stale, non-null claimed `running` or `cancelling` rows, transition them to `abandoned`, set `ended_at = now()`, clear `claimed_by` and `heartbeat_at`, and return the reclaimed run identifiers. Leave transaction commit control with the caller, do not read then update, claim queued work, or delete coverage/results (depends on T001–T004 and T006).

**Checkpoint**: S4 supplies the concrete journal function consumed by the runner, and concurrent/repeated reclaim calls cannot terminalise a fresh/terminal row or report one reclaim twice.

---

## Phase 4: Integration

**Purpose**: Integrate the heartbeat at the E4 runner checkpoint, close the reclaim/write race, and schedule reclaim independently in the application process.

- [x] T008 [P] Update `src/factorflow/ingestion/runner.py` to call the T007 heartbeat operation at the existing top-of-iteration cancellation checkpoint specified by `component-design-acquisition-runner.md` §2.5, and stop before planning, provider access, or writer invocation when it returns `False`. Landing order is explicit: CAP-001-E4-S5 first supplies the runner loop and its `TC-COMP-245`/`TC-COMP-248` tests; S4 then lands the concrete journal integration. If E4-S5 left a heartbeat port/callback at that checkpoint, bind it to T007 rather than adding a second call; no E4-S5 implementation task should separately land the same concrete call site (depends on T007 and the E4-S5 runner loop, not on a pre-existing heartbeat call site).
- [x] T009 [P] Update `src/factorflow/ingestion/writer.py` without changing the approved `write_instrument(connection, instrument_id, run_id, observations, observed_on)` signature: inside the existing one-instrument transaction, lock the `acquisition_run` row selected by the supplied `run_id` and require its state to remain active (`running` or `cancelling`) before any observation, coverage, acquisition-state, or `run_instrument_result` write. Reject a missing or terminal run row before writes; reclaim changes that same row to terminal `abandoned`, so `run_id` alone is sufficient to reject a post-reclaim write while preserving E4’s transaction and committed data (depends on T004, T007, and CAP-001-E4-S3/E4-S6).
- [x] T010 [P] Update `src/factorflow/api/app.py` with a small asynchronous reclaim loop whose 5-second `interval_seconds` and awaitable wait function are injectable; dispatch a synchronous helper that checks out `app.state.db_pool` and executes/commits T007 through `asyncio.to_thread`, because the established pool and psycopg operations are synchronous. In `_lifespan`, create and retain the task after the pool opens, pass `RunSettings.stale_after_seconds`, and cancel/await it before pool close. Keep the loop in the application process and do not add APScheduler or import/start ingestion (depends on T005, T007, and CAP-001-E1-S6).

**Checkpoint**: The runner refreshes its concrete claim at the cancellation checkpoint, the old claimant cannot commit after reclaim, and the application repeats synchronous sweep work off the event loop even when ingestion is stopped.

---

## Phase 5: Polish

**Purpose**: Complete constitutional TDD evidence, mutation checks, independent per-task reviews, and repository validation.

- [x] T011 For each implementation commit, stage only that task’s diff, dispatch independent code-review and spec-drift verification subagents, and append both verdicts to `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S4-tdd-evidence.yaml` before committing; do not commit a `REJECTED` or `drift_detected: true` task. Record RED→GREEN→MUTATE→STRENGTHEN→REFACTOR evidence; manually mutate the strict stale comparison, `cancelling` predicate, claim clearing, heartbeat owner predicate/call site, writer `run_id` state guard, `asyncio.to_thread` dispatch, injected 5-second wait, and shutdown ordering; strengthen tests until every changed-line mutant is killed; then run every command in the Validation Plan (depends on T002–T010).

**Checkpoint**: All S4-owned behavior and both E4-S5 runner regressions are green, mutation-sensitive, independently reviewed, and recorded before each commit.

## Dependencies & Execution Order

### Task Dependencies

- T001 gates only on landed S1 schema/fixture artifacts, the S2 request/claim journal, the E4 writer transaction, and the E1 lifespan; it does not require the S4-owned heartbeat function or runner integration.
- T002–T006 depend on T001 and are written and observed RED before production changes.
- T007 depends on T002–T004 and T006.
- T008 depends on T007 and the E4-S5 runner loop/cancellation checkpoint; T009 depends on T004 and T007 plus the E4-S3/E4-S6 writer seam; T010 depends on T005 and T007 plus E1-S6.
- T011’s review/evidence gate applies before each implementation commit and its final validation follows T002–T010.

### Landing Order and Parallel Opportunities

- CAP-001-E4-S5 lands the runner loop, cancellation checkpoint, and its uniquely traced `TC-COMP-245`/`TC-COMP-248` tests without independently implementing S4’s concrete journal call; T007 then lands `heartbeat`, and T008 binds that function at the checkpoint.
- T002, T003, and T004 share `tests/integration/test_run_reclaim.py` and require coordination; none carries `[P]`.
- T005 and T006 affect separate test files and can proceed in parallel with the coordinated PostgreSQL test work after T001.
- T008, T009, and T010 affect separate files and can proceed in parallel after T007 and their own RED tests.

### Phase Dependencies

- Phase 1 gates coding on landed prerequisites without asserting that the unresolved S1 ownership contradiction has a decision record.
- Phase 2 precedes Phases 3 and 4 under TDD; Phase 3 supplies the journal operations integrated by Phase 4.
- Phase 5’s review/evidence gate applies at every commit boundary and final validation follows integration.

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Full Python tests: `uv run pytest`
- Non-container tests: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Run `uv run pytest -m postgres tests/integration/test_run_reclaim.py tests/integration/test_runner_reclaim.py` against PostgreSQL 16 and `uv run pytest tests/unit/test_run_reclaim.py tests/unit/test_api_reclaim_lifespan.py`; the runner file supplies the E4-S5-owned `TC-COMP-245`/`TC-COMP-248` regressions, not duplicate S4 traces.
- Use database-relative timestamps around the configured 900-second staleness window from `component-design-runtime-config.md` §2.2a; prove a fresh heartbeat survives and stale claimed `running`/`cancelling` rows alone are terminalised with claims cleared.
- Use two explicit `READ COMMITTED` psycopg transactions released by a barrier, commit both, verify one returned run and one no-op, then claim the oldest queued request through `claim_next`.
- Snapshot one committed instrument’s coverage/result data before reclaim and compare it afterward; separately reclaim between heartbeat and writer entry and prove `write_instrument` rejects the now-terminal `run_id` without appending anything.
- Exercise FastAPI lifespan with injected wait/dispatch doubles: assert the loop requests exactly 5 seconds, synchronous pool work is submitted through the dispatcher, and task cancellation/await completes before pool close.
- If the container runtime is unavailable, run and report the non-PostgreSQL subset, but do not represent the partial run as a green full suite.

## Notes

### Resolved Conflicts

- **Runner/journal ownership:** `CAP-001-E4-S5.md` lines 73–75 and `CAP-001-E4-S5-tasks.md` lines 57–67, 87, and 103–105 own runner-loop behavior and the uniquely traced `TC-COMP-245`/`TC-COMP-248` tests; `CAP-001-E5-S4.md` lines 52–54 and 83–84 own the concrete heartbeat journal function and reclaim implementation. T008 integrates the S4 function at the E4 checkpoint without duplicating either test ownership or the call site.
- **Result transaction ownership:** `component-design-observation-writer.md` §2.2 and §2.6 place `run_instrument_result` inside `write_instrument`’s one-instrument transaction, while `DAC-E5-S4-6` requires a post-reclaim conditional write rejection. T009 preserves the writer-owned transaction and approved signature, adding only a locked active-state check by the existing `run_id`; it does not move result persistence into `run-journal`.
- **Timing authority:** `component-design-runtime-config.md` §2.2a binds heartbeat to 60 seconds and stale-after to 900 seconds; `component-design-acquisition-runner.md` §2.5 binds heartbeat execution to the between-instruments cancellation checkpoint rather than a separate timer.
- **Owner-confirmed attended decision (2026-09-17) — post-reclaim write guard:** Keep the approved `component-design-observation-writer.md` §2.6 `write_instrument` signature unchanged and use its existing `run_id` to lock/read the corresponding `acquisition_run` state before writes. Reclaim transitions that same run row to terminal `abandoned`, so `run_id` is sufficient to distinguish an active write from a post-reclaim write; no claimant identity parameter is required.

### Open Gaps

- **Owner-confirmed, design revision pending — reclaim cadence:** Owner-authored commit `1900ef71fd34f658c9079914cbbaa0259ea1d844` (`docs(CAP-001-E5): record owner plan decisions`, 2026-09-11) confirms a 5-second application reclaim-loop cadence. No approved run-journal or runtime-config design yet defines that separate cadence, so T010 uses an injectable local `interval_seconds` value and this decision must be absorbed by the next revisions of `component-design-run-journal.md` and `component-design-runtime-config.md`.

### Other Notes

- **Implementation prerequisite — unresolved ownership, schema-artifact gate only:** `CAP-001-E5-S1.md` assigns `acquisition_state` to `migrations/0004_runs.sql`, while `component-design-market-data-store.md` §2.3 places it in `migrations/0003_coverage.sql`; no record under `projects/factorflow-v2/decisions/` resolves the contradiction. T001 gates only on the required schema migrations and fixture having landed and does not claim the ownership conflict is resolved, select a migration, or work around it.
- Reclaim uses PostgreSQL `now()` for heartbeat and stale comparison, as required by `component-design-run-journal.md` §3’s clock assumption. The strict predicate implements “stale past” from `CAP-001-E5-S4.md` lines 66 and 84.
- All 11 mapped component cases remain covered exactly once: S4 owns nine (`TC-COMP-020`, `TC-COMP-246`, `TC-COMP-247`, and `TC-COMP-273`–`TC-COMP-278`); E4-S5 owns the runner-loop `TC-COMP-245` and `TC-COMP-248` traces that S4 reruns as regressions.
