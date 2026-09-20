---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S2-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-17
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-18T03:38:16Z
  source_artifacts:
    - id: CAP-001-E5-S2
      version: "1"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
    - id: CAP-001-component-design-runtime-config
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S2 — FIFO Claim and Request Queueing

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-tasks`
**Date**: 2026-09-17

## Summary

Implement the request and claim portion of `run-journal`: insert every valid request as a queued run, report the active run it follows, and atomically claim only the oldest requested run when none is active. Once CAP-001-E5-S1 lands, this story consumes its run schema, package, and fixture and returns the depth snapshotted on the claimed row so the ingestion runner never re-reads a changed setting.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-23 | Accept a second request as queued and start requested runs in request order after the active run terminates. | T002, T003, T006, T007 |
| DAC-E5-2 | Claim the oldest requested run in one statement only when no run is running or cancelling. | T003, T006, T007 |
| DAC-E5-3 | Concurrent claims cannot start two active runs; the schema race backstop is a unique violation. | T004, T006, T007 |
| DAC-E5-S2-1 | Claims are FIFO by `requested_at`. | T003, T006, T007 |
| DAC-E5-S2-2 | Given no claimable run, When the runner polls, Then it receives no row and waits at the configured interval rather than erroring. | T003, T005, T006, T007 |
| DAC-E5-S2-3 | A successful claim sets state, start time, claimant, and heartbeat together. | T003, T006, T007 |
| DAC-E5-S2-4 | A claim returns the run id and its snapshotted `history_depth_years`. | T003, T005, T006, T007 |
| DAC-E5-S2-5 | Contending runners use `FOR UPDATE SKIP LOCKED` and do not block one another on a candidate row. | T004, T006, T007 |
| DAC-E5-S2-6 | A queued request reports the active run it is queued behind. | T002, T006, T007 |

## Phase 1: Setup

**Purpose**: Verify rather than recreate the unresolved S1 prerequisite, following the repository's established blocking-check pattern for cross-story contracts.

- [x] T001 Confirm that `tests/conftest.py` exports CAP-001-E5-S1's planned `migrated_run_schema_connection`, that the pre-existing `postgres_connection_string` fixture remains available, that `src/factorflow/runs/__init__.py` makes `factorflow.runs` importable, and that `migrations/0003_coverage.sql` and `migrations/0004_runs.sql` are present and discoverable in order on the eventual coding branch; block S2 implementation if any S1-owned prerequisite is absent rather than creating, moving, or duplicating it.

**Checkpoint**: The eventual coding branch contains an importable S1 run package and its required schema/fixture contracts; this phase changes none of those contracts and stops if S1 has not landed consistently.

---

## Phase 2: Tests (TDD)

**Purpose**: After T001 passes, define queueing, FIFO, no-work, returned-depth, and concurrency behavior against the S1-provided PostgreSQL schema before adding the journal module.

### Mandatory Component Tests

- [x] T002 Create `tests/integration/test_run_queue.py` request tests for TC-COMP-023 and TC-COMP-265 using the S1-provided `migrated_run_schema_connection`: parameterize an existing `running` or `cancelling` row, call `request_run`, and assert the new UUID identifies a distinct row that remains `requested`, stores the supplied depth, reports the active UUID as `queued_behind`, and leaves every active-row field unchanged; also assert a request made with no active row returns `queued_behind=None`. Add `# Implements TC-COMP-023, TC-COMP-265` traceability comments (depends on T001).
- [x] T003 Add claim tests to `tests/integration/test_run_queue.py` for TC-COMP-237 and TC-COMP-260 through TC-COMP-263: seed requested rows with distinct ordered `requested_at` values; claim and terminalize each predecessor before the next claim; assert ascending FIFO order; assert an empty queue and either a `running` or `cancelling` active row make `claim_next` return `None`; and assert one successful call atomically writes `running`, `started_at`, `claimed_by`, and `heartbeat_at` while returning the row's UUID and stored depth. Add a traceability comment for every listed TC-ID (depends on T001, T002).
- [x] T004 Add separate-connection contention tests to `tests/integration/test_run_queue.py` for TC-COMP-238 and TC-COMP-264 using the pre-existing `postgres_connection_string` fixture from `tests/conftest.py`: (a) hold a row lock on the oldest of two requested rows and prove a claim on another connection completes by skipping that candidate while the lock remains held, and (b) synchronize two claims over distinct requested candidates so both can pass the no-active guard, then assert the partial unique index permits one active row and makes the racing second update raise `psycopg.errors.UniqueViolation`; separately retain coverage for the valid loser path that returns `None` after observing the winner. Add `# Implements TC-COMP-238, TC-COMP-264` traceability comments (depends on T001–T003).

### Additional Unit Tests

- [x] T005 [P] Create `tests/unit/test_run_journal.py` with focused cursor/connection-boundary tests for frozen `ClaimedRun` mapping, UUID/depth return mapping, bound `runner_id` and `history_depth_years` parameters, and `None` mapping when the claim statement returns no row; assert claim mapping uses the returned row's stored depth and never calls `factorflow.instruments.settings.read_history_depth` (depends on T001).

**Checkpoint**: If T001 passes, the tests use S1-owned prerequisites, carry `TC-COMP-*` traceability comments, and are observed RED because `factorflow.runs.journal` does not yet exist. The locked-candidate and unique-index race are separate scenarios so `SKIP LOCKED` and the schema backstop are each proved directly.

---

## Phase 3: Core Implementation

**Purpose**: Add the typed run-journal boundary and the transactional request and single-statement claim operations consumed by the acquisition runner.

- [x] T006 Create `src/factorflow/runs/journal.py` in the `factorflow.runs` package verified by T001: define frozen `ClaimedRun`, `request_run(connection, history_depth_years) -> tuple[UUID, UUID | None]`, and `claim_next(connection, runner_id) -> ClaimedRun | None` with typed psycopg boundaries and bound parameters. In one transaction, `request_run` inserts a `requested` row with the supplied depth and returns its UUID plus the existing `running`/`cancelling` UUID, if any, without changing that active row. `claim_next` executes the design's one `UPDATE ... WHERE run_id = (SELECT ... NOT EXISTS ... ORDER BY requested_at ... FOR UPDATE SKIP LOCKED) RETURNING run_id, history_depth_years` statement, maps no row to `None`, and never reads current settings (depends on T001–T005).

**Checkpoint**: All S2-owned behavior is implemented without a read-then-write claim window; queueing leaves the existing active run untouched, and the returned claim depth is the persisted snapshot.

---

## Phase 4: Integration

**Purpose**: Run the public journal boundary against the verified S1 schema and independent PostgreSQL connections after production implementation exists.

- [ ] T007 Run `tests/integration/test_run_queue.py` and `tests/unit/test_run_journal.py` against `src/factorflow/runs/journal.py`; correct any mismatch within those three S2-owned files while preserving the exact SQL claim contract, and confirm the no-row journal signal consumed by CAP-001-E4-S5's configured-wait loop is stable (depends on T006).

**Checkpoint**: The S2 integration and unit suites exercise the production `factorflow.runs.journal` boundary through the same psycopg/PostgreSQL interface the acquisition runner will consume.

---

## Phase 5: Polish

**Purpose**: Prove the implementation resists the principal request/claim mutations and meets repository validation and evidence requirements.

- [ ] T008 Strengthen `tests/integration/test_run_queue.py` and `tests/unit/test_run_journal.py` after manually mutating FIFO order, the active-state predicate, `SKIP LOCKED`, active-row preservation, and returned-depth/no-row mapping; retain tests that kill each mutation. Run the focused RED→GREEN→MUTATE→STRENGTHEN→REFACTOR cycle and record each task's executions, mutations, commit hash, code-review verdict, and spec-drift verdict in `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2-tdd-evidence.yaml` before beginning the next cycle (depends on T007).

**Checkpoint**: Targeted PostgreSQL tests distinguish FIFO from reverse selection, reject a second active claim, prove candidate-row contention is non-blocking, fail if queueing alters the active row, and fail if current settings or incorrect no-row mapping replace the persisted claim contract; all required review and TDD evidence is present.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 is a blocking prerequisite verification: it depends on CAP-001-E5-S1 landing consistently and must not implement any missing S1 contract.
- T002 and T005 depend on T001 and must reach observed RED before T006; T005 may proceed in parallel with T002 because it targets a separate file.
- T003 depends on T001–T002; T004 depends on T001–T003. T002–T004 share `tests/integration/test_run_queue.py` and must be completed sequentially rather than by concurrent editors.
- T006 depends on T001–T005.
- T007 depends on T006; T008 depends on T007.

### Per-Task Commit Gate

- Before every T001–T008 commit, stage only that task's diff, dispatch an independent code-review subagent and record its verdict, then dispatch an independent spec-drift verify subagent and record `drift_detected`.
- Append both verdicts to that task's entry in `CAP-001-E5-S2-tdd-evidence.yaml` before committing. Do not commit a `REJECTED` review or `drift_detected: true`; fix it or escalate to the parent agent first. After a permitted commit, record its hash before starting the next TDD cycle.

### Parallel Opportunities

- T005 is the only safe file-level parallel opportunity while T002 is in progress; T002–T004 share `tests/integration/test_run_queue.py` and must not be edited concurrently.

### Phase Dependencies

- Phase 1 blocks implementation until the S1-owned prerequisites exist consistently; Phase 2 must reach observed RED before Phase 3 begins under TDD.
- Phase 4 follows Phase 3; Phase 5 follows the integrated public-boundary run.
- Planning may complete despite the unresolved sibling implementation dependency; the eventual coding run stops at T001 until the S1 contradiction is resolved and its contracts have landed.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Targeted database tests: `uv run pytest -m postgres tests/integration/test_run_queue.py`
- Targeted unit tests: `uv run pytest tests/unit/test_run_journal.py`
- Full Python tests: `uv run pytest`
- Non-container fallback (report as partial, never as a green full suite): `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- After T001 verifies the prerequisite, apply the S1-provided migration sequence to a fresh PostgreSQL 16 testcontainer database; verify two queued requests retain request order and an active run does not cause rejection or mutation of the active row.
- Claim three rows with distinct `requested_at` values, terminalizing each predecessor, and verify FIFO UUID order and the persisted depth returned for every claim.
- Hold the oldest candidate's row lock and verify another connection claims the next candidate before that lock is released; separately force the two-candidate active-index race and verify one `UniqueViolation` loser and one active row maximum.
- Inspect every successful claim to verify `state`, `started_at`, `claimed_by`, and `heartbeat_at` changed together; verify empty and active-run cases return `None` without reading current history-depth settings.
- Verify CAP-001-E4-S5's `tests/integration/test_runner_credential.py` and `tests/unit/test_ingestion_main.py` automation from its T004 exercises the stable `None` signal by waiting for `settings.run.poll_interval_seconds`, and that its T010 implements the repeated configured-wait loop; S2 does not duplicate that runner policy.
- Record per-cycle RED, GREEN, mutation, strengthening, refactor, code-review, and spec-drift evidence required by TEST-TDD-001 through TEST-TDD-008 and the per-task review contract.

---

## Notes

### Resolved Conflicts

- DAC-E5-3 and TC-COMP-238 require a concurrent second claim that has passed the guard to fail with `UniqueViolation`; the story's illustrative testing bullet also allows `None` when the loser observes the winner before passing the guard. The plan tests these as separate valid schedules rather than allowing either result in one ambiguous assertion: the forced race requires `UniqueViolation`, while the already-observed-active path requires `None`.
- DAC-E5-S2-2 and TC-COMP-261 retain the complete requirement: no claim produces no row, and the runner waits at the configured interval rather than erroring. S2 T003, T005, and T006 own the stable `None` journal result; the approved acquisition-runner story CAP-001-E4-S5 owns the wait-and-repoll behavior in DAC-E4-S5-6, with automation planned by `CAP-001-E4-S5-tasks.md` T004 and implementation by T010. This is a cross-story allocation, not a narrowing of TC-COMP-261.

### Open Gaps

- None. The wait-policy owner and configured value are determined by approved artifacts, and no required value in this plan is provisional.

### Other Notes

- **Implementation prerequisite — unresolved:** CAP-001-E5-S1's approved story assigns `acquisition_state` to `migrations/0004_runs.sql`, while the approved market-data-store design places it in `migrations/0003_coverage.sql`. No decision in `projects/factorflow-v2/decisions/` resolves that contradiction, and the existing S1 task plan's assertion of an owner-confirmed 2026-09-11 decision is therefore not independently supported. S2 planning may proceed because planning-run ignores sibling implementation dependencies, but T001 must block the eventual coding run until the owner resolves S1 and its schema/package/fixture contracts land consistently.
- CAP-001-E5-S1 owns creation of the run-schema fixture, run package, and migrations. S2 verifies and consumes those contracts and must not redefine migration ownership or duplicate S1 work.
- `postgres_connection_string` predates S1 in `tests/conftest.py`; S1's planned `migrated_run_schema_connection` builds on that existing fixture.
- `idx_acquisition_run_single_active` is the concurrency backstop; `claim_next` must not add an application lock or a preliminary read, per `component-design-run-journal.md` section 2.3.
- `history_depth_years` is snapshotted at request creation. Claim mapping uses that persisted value and must not call `read_history_depth`.
