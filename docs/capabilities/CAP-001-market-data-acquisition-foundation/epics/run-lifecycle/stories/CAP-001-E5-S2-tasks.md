---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S2-tasks
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
  timestamp: 2026-09-11T22:47:30Z
  source_artifacts:
    - id: CAP-001-E5-S2
      version: "1"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "approved"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
    - id: CAP-001-component-design-runtime-config
      version: "approved"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S2 — FIFO Claim and Request Queueing

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-tasks`
**Date**: 2026-09-11

## Summary

Implement the request and claim portion of `run-journal`: insert every valid request as a queued run, report the active run it follows, and atomically claim only the oldest requested run when none is active. The implementation uses the run schema delivered by CAP-001-E5-S1 and returns the depth snapshotted on that row so the ingestion runner never re-reads a changed setting.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-23 | Accept a second request as queued and start requested runs in request order after the active run terminates. | T002, T003, T006 |
| DAC-E5-2 | Claim the oldest requested run in one statement only when no run is running or cancelling. | T003, T006 |
| DAC-E5-3 | Concurrent claims cannot start two active runs; the schema race backstop is a unique violation. | T004, T006 |
| DAC-E5-S2-1 | Claims are FIFO by `requested_at`. | T003, T006 |
| DAC-E5-S2-2 | No claimable row produces `None` for the polling runner rather than an error. | T003, T006 |
| DAC-E5-S2-3 | A successful claim sets state, start time, claimant, and heartbeat together. | T003, T006 |
| DAC-E5-S2-4 | A claim returns the run id and its snapshotted `history_depth_years`. | T003, T006 |
| DAC-E5-S2-5 | Contending runners use `FOR UPDATE SKIP LOCKED` and do not block one another. | T004, T006 |
| DAC-E5-S2-6 | A queued request reports the active run it is queued behind. | T002, T006 |

## Phase 1: Setup

**Purpose**: Extend the PostgreSQL test harness so run-journal tests apply the completed run schema without choosing the unresolved ownership of its migration file.

- [ ] T001 Update `tests/conftest.py` with a run-schema fixture that applies the completed migration sequence delivered by CAP-001-E5-S1 before yielding a fresh PostgreSQL connection (prerequisite infrastructure for AC-23 and DAC-E5-2 through DAC-E5-3).

**Checkpoint**: A PostgreSQL-marked test can obtain an isolated database containing the `acquisition_run` schema without hard-coding a migration ownership decision.

---

## Phase 2: Tests (TDD)

**Purpose**: Define the journal’s queueing, FIFO, no-work, returned-depth, and concurrency behaviour against a real PostgreSQL schema before adding the journal module.

### Mandatory Component Tests

- [ ] T002 Create request-queue integration tests in `tests/integration/test_run_journal.py` for TC-COMP-023 and TC-COMP-265: arrange an active run and a history depth, call `request_run`, and assert a second request remains `requested`, carries its own snapshotted depth, and returns the active run id as `queued_behind` without altering the active row.
- [ ] T003 Add claim integration tests in `tests/integration/test_run_journal.py` for TC-COMP-237 and TC-COMP-260 through TC-COMP-263: create requested rows with ordered `requested_at` values, assert consecutive claims are FIFO, assert a running or cancelling row makes `claim_next` return `None`, and assert the claimed row is updated in the single claim operation with `running`, non-null start/heartbeat timestamps, the supplied runner id, and its stored depth.
- [ ] T004 Add independent-connection contention tests in `tests/integration/test_run_journal.py` for TC-COMP-238 and TC-COMP-264: invoke `claim_next` from two PostgreSQL connections against one requested row, assert neither waits on a locked candidate, allow the documented no-row or `UniqueViolation` loser result, and assert exactly one active run exists afterward.

### Additional Unit Tests

- [ ] T005 Add focused mapping and parameter-binding tests in `tests/unit/test_run_journal.py` for `ClaimedRun` construction and for the `runner_id` / `history_depth_years` values passed through the journal boundary, including an assertion that a current setting change cannot replace the claimed row’s stored depth.

**Checkpoint**: The new tests carry `TC-COMP-*` traceability comments, execute with the `postgres` marker, and are observed RED because the `factorflow.runs.journal` package and functions do not yet exist. CAP-001-E5-S1’s migration must be available before executing the PostgreSQL tests.

---

## Phase 3: Core Implementation

**Purpose**: Add the small run-journal package and implement the explicit request and atomic claim interface consumed by the acquisition runner.

- [ ] T006 Create `src/factorflow/runs/__init__.py` and implement `src/factorflow/runs/journal.py`: define frozen `ClaimedRun`, `request_run(connection, history_depth_years)`, and `claim_next(connection, runner_id)` using psycopg bound parameters and the `acquisition_run` schema. `request_run` must insert a `requested` row and return its UUID plus the current running/cancelling run UUID when one exists; `claim_next` must execute the design’s one `UPDATE ... WHERE run_id = (SELECT ... NOT EXISTS ... ORDER BY requested_at ... FOR UPDATE SKIP LOCKED) RETURNING run_id, history_depth_years` statement and map no returned row to `None` (depends on T001–T005 and CAP-001-E5-S1).

**Checkpoint**: All required behavior is implemented without a read-then-write claim window; queueing leaves the existing active run untouched and the returned claim depth is the persisted snapshot.

---

## Phase 4: Integration

**Purpose**: Wire the journal tests and implementation through the shared PostgreSQL fixture and the persisted run schema.

- [ ] T007 Update `tests/integration/test_run_journal.py` to consume the run-schema fixture from `tests/conftest.py` and verify the public `factorflow.runs.journal` boundary against separate database connections (depends on T001–T006).

**Checkpoint**: Queueing and claim behavior run through the same psycopg/PostgreSQL boundary that the runner will consume.

---

## Phase 5: Polish

**Purpose**: Prove the implementation resists the principal claim mutations and meets the repository’s static and database-backed validation requirements.

- [ ] T008 Strengthen `tests/integration/test_run_journal.py` and `tests/unit/test_run_journal.py` as needed after manually mutating the FIFO order, active-state predicate, `SKIP LOCKED`, and returned depth mapping; retain tests that kill each mutation, then run the focused RED→GREEN→MUTATE→STRENGTHEN cycle with the task evidence required by the testing constitution (depends on T007).

**Checkpoint**: Targeted PostgreSQL tests distinguish FIFO from reverse selection, reject a second active claim, verify non-blocking contention, and fail if the stored depth is replaced by a current setting value.

---

## Dependencies & Execution Order

### Task Dependencies

- T001: Depends on CAP-001-E5-S1 providing the completed run schema migration sequence.
- T002–T005: Depend on T001 and may be authored before production code.
- T006: Depends on T001–T005 being written and their RED result being observed.
- T007: Depends on T006.
- T008: Depends on T007.

### Parallel Opportunities

- T002, T003, and T004 can be prepared independently only if split into non-overlapping test sections before editing; do not edit the same test file concurrently.
- T005 can proceed in parallel with the PostgreSQL test authoring because it targets `tests/unit/test_run_journal.py`.

### Phase Dependencies

- Phase 1 precedes Phase 2 because the tests require the run-schema fixture.
- Phase 2 precedes Phase 3 under TDD.
- Phase 3 must complete before Phase 4 and Phase 5’s mutation and full validation work.
- CAP-001-E5-S1 is an external prerequisite for every phase that imports or applies the run schema.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Targeted database tests: `uv run pytest -m postgres tests/integration/test_run_journal.py`
- Full Python tests: `uv run pytest`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Apply `0001_extensions_owner_state.sql` and the CAP-001-E5-S1 `0004_runs.sql` migration to a fresh testcontainer database; verify that two queued requests retain insertion order and that an active run does not cause a request rejection.
- Use two separate psycopg connections to claim the same candidate and verify one active run maximum, no blocking on the locked candidate, and the documented loser outcome.
- Inspect the claimed row after every successful claim to verify state, `started_at`, `claimed_by`, `heartbeat_at`, and returned `history_depth_years` originate from that row.
- Record per-cycle RED, GREEN, mutation, strengthening, and refactor evidence required by TEST-TDD-001 through TEST-TDD-008 before completing the story.

---

## Notes

### Resolved Conflicts

- None. The run-journal design’s resolved Open Question pins the idle poll interval at 5 seconds in `component-design-runtime-config.md` section 2.2a; this story returns `None` to its caller and does not define or duplicate the runner’s wait policy.

### Open Gaps

- None for this story. No numeric limit, default, or threshold is adopted by this plan.

### Other Notes

- CAP-001-E5-S1 is a hard implementation prerequisite. Its planning stopped because the shared register identifies an unresolved contradiction over whether `acquisition_state` belongs in `0003_coverage.sql` or `0004_runs.sql`. This plan neither resolves nor works around that schema-ownership decision; S2 implementation waits for the owner’s direction and the resulting S1 migration.
- The existing `idx_acquisition_run_single_active` partial unique index is the concurrency backstop; `claim_next` must not add a separate application lock or a preliminary read, per `component-design-run-journal.md` section 2.3.
- `history_depth_years` is snapshotted by the S1 schema at request creation. This plan uses that persisted value and must not call `read_history_depth` during claim.
