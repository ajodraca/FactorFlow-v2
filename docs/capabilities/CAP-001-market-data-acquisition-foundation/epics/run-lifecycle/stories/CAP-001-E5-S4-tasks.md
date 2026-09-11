---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S4-tasks
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
  timestamp: 2026-09-11T23:18:50Z
  source_artifacts:
    - id: CAP-001-E5-S4
      version: "1"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
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
**Date**: 2026-09-11

## Summary

Implement the run-journal heartbeat and application-side reclaim sweep. A runner refreshes the claim only while it still owns it; an atomic, repeatable sweep marks stale `running` or `cancelling` claims `abandoned`, clears their claims, and frees the next queued run without removing coverage already committed per instrument.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-20 | An interrupted run reaches a terminal state without manual datastore edits and does not block a later run. | T002, T003, T006, T007, T008 |
| DAC-E5-10 | A claim holder refreshes its heartbeat at the runner's cancellation checkpoint. | T004, T006, T008 |
| DAC-E5-11 | A stale `running` or `cancelling` claim becomes terminal `abandoned` and releases its claim. | T002, T006, T007 |
| DAC-E5-12 | Reclaim is idempotent and frees a later request. | T003, T007 |
| DAC-E5-13 | A runner that lost its claim performs no further writes for that run. | T004, T006, T008 |
| DAC-E5-S4-1 | A fresh heartbeat is not reclaimed. | T002, T007 |
| DAC-E5-S4-2 | A stale `cancelling` run is reclaimed as `abandoned`. | T002, T007 |
| DAC-E5-S4-3 | Coverage committed before reclaim remains present. | T002, T007 |
| DAC-E5-S4-4 | Reclaim runs in the application lifespan even when ingestion is stopped. | T005, T008 |
| DAC-E5-S4-5 | Concurrent sweepers reclaim one stale claim once and the other is a no-op. | T003, T007 |
| DAC-E5-S4-6 | The original runner’s heartbeat and subsequent conditional write are rejected after reclaim. | T004, T006, T008 |

## Phase 1: Setup

**Purpose**: Extend the existing PostgreSQL test seam for the completed run schema and its coverage/result-producing prerequisite.

- [ ] T001 Update `tests/conftest.py` with the CAP-001-E5-S1 run-schema fixture and the CAP-001-E4-S6 coverage/result fixture required to seed claimed runs and independently committed coverage, without selecting either side of the unresolved `acquisition_state` migration-ownership contradiction (prerequisite infrastructure for AC-20 and DAC-E5-11 through DAC-E5-13).

**Checkpoint**: PostgreSQL-marked tests can create isolated requested, running, cancelling, and covered runs using the eventual completed migrations and writer seam.

---

## Phase 2: Tests (TDD)

**Purpose**: Define heartbeat, reclaim, race, coverage-retention, and application-lifespan behaviour before changing production code.

### Mandatory Component Tests

- [ ] T002 Add `# Implements TC-COMP-020`, `# Implements TC-COMP-246`, `# Implements TC-COMP-273`, `# Implements TC-COMP-274`, and `# Implements TC-COMP-275` PostgreSQL integration tests in `tests/integration/test_run_reclaim.py`: use database-relative timestamps to seed stale `running` and `cancelling` claims and a fresh heartbeat, run the sweeper, then assert stale rows are `abandoned` with `ended_at` set and both claim fields cleared, the fresh row remains claimed, and previously committed coverage/result rows are unchanged.
- [ ] T003 Add `# Implements TC-COMP-247` and `# Implements TC-COMP-277` independent-connection PostgreSQL tests in `tests/integration/test_run_reclaim.py`: run two sweep invocations against one stale claim, assert exactly one reports the reclaim and the other is a no-op, repeat after terminalisation, then assert `claim_next` can claim the next requested row (depends on the CAP-001-E5-S2 journal boundary).
- [ ] T004 Add `# Implements TC-COMP-245`, `# Implements TC-COMP-248`, and `# Implements TC-COMP-278` tests in `tests/integration/test_run_reclaim.py`: assert `heartbeat(run_id, runner_id)` updates only an owned claim and returns `False` after reclaim; exercise the CAP-001-E4-S6 result-write boundary with the same `run_id`/claim identity and assert it rejects a lost claim rather than appending a result.
- [ ] T005 Add `# Implements TC-COMP-276` lifespan tests in `tests/unit/test_api_reclaim_lifespan.py`: construct the FastAPI application with a mocked application pool and stopped ingestion runner, assert lifespan startup schedules the reclaim loop using the application pool and shutdown cancels/awaits it cleanly without starting an ingestion process.

### Additional Unit Tests

- [ ] T006 Add focused SQL-boundary tests in `tests/unit/test_run_reclaim.py` for `heartbeat` and the reclaim statement: assert `run_id`, `runner_id`, and stale-after duration are bound parameters; a zero-row heartbeat maps to `False`; the reclaim predicate contains both active states and claim ownership; and the returned reclaim count is the only success signal.

**Checkpoint**: Mandatory tests carry their TC traceability comments, run with the `postgres` marker where a database is needed, and are observed RED until the journal, reclaim, writer, and lifespan changes exist.

---

## Phase 3: Core Implementation

**Purpose**: Make claim liveness and stale-claim recovery atomic at the run-journal/PostgreSQL boundary.

- [ ] T007 Update `src/factorflow/runs/journal.py` to implement `heartbeat(connection, run_id, runner_id)` with the approved conditional `UPDATE acquisition_run SET heartbeat_at = now() WHERE run_id = %s AND claimed_by = %s` statement, returning `False` on zero rows; create `src/factorflow/runs/reclaim.py` with a reclaim function that atomically updates only stale, claimed `running` or `cancelling` rows to `abandoned`, sets `ended_at = now()`, clears `claimed_by` and `heartbeat_at`, and returns the rows/count it reclaimed. Use psycopg bound parameters and the `RunSettings.stale_after_seconds` value; do not delete coverage or result rows (depends on T001–T006 and CAP-001-E5-S1/E5-S2).

**Checkpoint**: Heartbeat detects a lost claim without a preliminary read, and concurrent or repeated reclaim calls cannot alter a terminal/fresh row or produce a second reclaim.

---

## Phase 4: Integration

**Purpose**: Join the journal operations to the runner checkpoint, guarded writer, and application process lifecycle.

- [ ] T008 Update `src/factorflow/ingestion/runner.py` to call `heartbeat` beside its existing cancellation check and stop before a later instrument/result write when it returns `False`; update `src/factorflow/ingestion/writer.py` to condition every `run_instrument_result` write on the current `run_id`/claim identity so a reclaimed runner’s write is rejected; update `src/factorflow/api/app.py` to create a periodic `asyncio` reclaim task in `_lifespan` using `app.state.db_pool` and `RunSettings.stale_after_seconds`, retain the task on app state, and cancel/await it before closing the pool on shutdown (depends on T007, CAP-001-E4-S5/E4-S6, and CAP-001-E1-S6).

**Checkpoint**: The application, rather than ingestion, keeps reclaiming after ingestion stops; a live runner refreshes at its existing checkpoint; and a runner that loses its claim cannot write another result.

---

## Phase 5: Polish

**Purpose**: Demonstrate that the stale predicate, atomic transition, claim guard, and lifespan shutdown cannot regress independently.

- [ ] T009 Strengthen `tests/integration/test_run_reclaim.py`, `tests/unit/test_run_reclaim.py`, and `tests/unit/test_api_reclaim_lifespan.py` after mutating the stale comparison, `cancelling` predicate, claim-clear fields, conditional heartbeat/write guards, and task cancellation path; retain tests that kill each mutation and record the required RED→GREEN→MUTATE→STRENGTHEN evidence (depends on T002–T008).

**Checkpoint**: Tests fail if a fresh claim is reclaimed, a stale cancelling claim survives, coverage is removed, a second sweeper reports a reclaim, a lost runner writes, or shutdown leaves the periodic task attached to a closed pool.

## Dependencies & Execution Order

### Task Dependencies

- T001 depends on CAP-001-E5-S1 providing the completed run schema and CAP-001-E4-S6 providing the result/coverage writer seam.
- T002–T006 depend on T001 and are written before production changes.
- T007 depends on T001–T006 plus the claim boundary from CAP-001-E5-S2.
- T008 depends on T007 and the runner/writer/lifespan seams from CAP-001-E4-S5, CAP-001-E4-S6, and CAP-001-E1-S6.
- T009 depends on T002–T008.

### Parallel Opportunities

- T002, T003, and T004 describe independent PostgreSQL scenarios but require coordination if they share `tests/integration/test_run_reclaim.py`.
- T005 and T006 can proceed in parallel with database-test authoring because they use separate unit-test files.

### Phase Dependencies

- Phase 1 precedes Phase 2 because the tests need the run schema and coverage seam.
- Phase 2 precedes Phase 3 under TDD.
- Phase 3 precedes runner/application wiring in Phase 4; Phase 5 follows the completed integration.

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Targeted database tests: `uv run pytest -m postgres tests/integration/test_run_reclaim.py`
- Targeted lifespan/unit tests: `uv run pytest tests/unit/test_run_reclaim.py tests/unit/test_api_reclaim_lifespan.py`
- Full Python tests: `uv run pytest`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- In a disposable PostgreSQL 16 testcontainer database, use database-relative timestamps around the configured 900-second stale window to prove fresh runs survive and stale `running`/`cancelling` rows are terminalised with claims cleared.
- Run two sweepers through separate psycopg connections and verify one atomic reclaim, one no-op, then successful claiming of the next queued run.
- Commit coverage/result data before reclaim and assert it remains unchanged afterward; verify both heartbeat and the CAP-001-E4-S6 conditional writer reject the old claimant after reclaim.
- Exercise FastAPI lifespan with no ingestion process, confirming the application pool schedules reclaim and cancellation/awaiting happens before pool close.
- Record per-cycle RED, GREEN, mutation, strengthening, and refactor evidence required by TEST-TDD-001 through TEST-TDD-008 before completing the story.

## Notes

### Resolved Conflicts

- None. The source design’s Open Questions and `component-design-runtime-config.md` section 2.2a bind the heartbeat/staleness values: 60 seconds and 900 seconds respectively. This plan consumes the existing `RunSettings` contract and does not redefine either value.

### Open Gaps

- **PROVISIONAL — awaiting owner confirmation (2026-09-11): application reclaim-loop cadence.** No approved artifact specifies how often the FastAPI lifespan repeats the sweep. This plan adopts 5 seconds, derived from the already owner-pinned five-second idle claim-poll cadence in `component-design-runtime-config.md` section 2.2a: both are low-cost periodic journal checks and the cadence bounds release-to-next-claim delay without changing the 900-second stale predicate. Implement this as a named local schedule argument at the lifespan/reclaim boundary, flag it for the next revision of `component-design-run-journal.md` and `component-design-runtime-config.md`, and do not present it as an existing configured value.

### Other Notes

- CAP-001-E5-S1 remains a hard implementation prerequisite. Its plan stopped because `component-design-run-journal.md` assigns `acquisition_state` to `0004_runs.sql` while `component-design-market-data-store.md` assigns it to `0003_coverage.sql`; this plan neither chooses nor works around that migration-ownership contradiction.
- CAP-001-E4-S6 owns the per-instrument transaction and result persistence. S4 adds the claim-match guard at that existing writer seam; it must not duplicate coverage writes or retroactively remove committed coverage.
- The application task must use the existing FastAPI lifespan and its connection pool rather than add APScheduler: `component-design-run-journal.md` Open Question 14.2 resolves the placement as an `asyncio` task in lifespan.
