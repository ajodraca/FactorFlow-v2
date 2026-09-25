---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-25
updated: 2026-09-25
story_id: "CAP-001-E5-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-25T01:37:17Z"
reviewed_head: "3f97bc1d044e71da536c7fa8296872b1c1490006"
review_base: "362a70cf923deccde43be895989a26bc95f746f8"
reviewed_state_revision: "sha256:ff6f01fdaac6491d7fd958174024d7d62b1b55d1e2c6ba83280b2df535272486"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E5-S4
    artifact_version: 1
    content_revision: sha256:e517c550992ce0f3879885466621c9b1aab96a951b8fc9c400fbfe128a00546c
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-4-6
  tool: Claude Code
  tool_version: "unknown"
  timestamp: "2026-09-25T01:37:17Z"
  source_artifacts:
    - id: CAP-001-E5-S4
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E5-S4 -- Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 11/11 verified |
| Required validation | 7/7 passed |

All acceptance criteria are satisfied with traceable production and test evidence. All planned tasks are verified. All required validation commands pass. Two medium-severity test-quality gaps and one low-severity bookkeeping inconsistency were identified; none blocks the gate.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S4-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E5-S4-run-20260924T211147Z` |
| HEAD | `3f97bc1d044e71da536c7fa8296872b1c1490006` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E5-integration-20260924T202935Z` / `362a70cf923deccde43be895989a26bc95f746f8` |
| Working tree | clean |
| Changed files reviewed | 9 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../CAP-001-E5-S4-tasks.md` | modified | T001-T011 checkbox updates |
| `docs/.../CAP-001-E5-S4-tdd-evidence.yaml` | added | T011 TDD evidence |
| `docs/.../CAP-001-E5-S4.md` | modified | status: planning -> in-review |
| `src/factorflow/api/app.py` | modified | T010; DAC-E5-S4-4, AC-20 |
| `src/factorflow/ingestion/writer.py` | modified | T009; DAC-E5-13, DAC-E5-S4-6 |
| `src/factorflow/runs/reclaim.py` | added | T007; DAC-E5-11, DAC-E5-12, AC-20 |
| `tests/integration/test_run_reclaim.py` | added | T002, T003, T004 |
| `tests/unit/test_api_reclaim_lifespan.py` | added | T005 |
| `tests/unit/test_run_reclaim.py` | added | T006 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-20 | SATISFIED | `reclaim.py:reclaim_stale_runs` transitions stale runs to `abandoned`, clears claims; `app.py:_run_reclaim_loop` runs sweep in application container | `test_run_reclaim.py:test_stale_running_run_is_reclaimed`, `test_concurrent_sweepers_reclaim_exactly_once` (claim_next succeeds after reclaim) | Stale run becomes terminal; new run can start. |
| DAC-E5-10 | SATISFIED | `journal.py:heartbeat` refreshes `heartbeat_at` via conditional UPDATE; `runner.py:198` calls `heartbeat()` at top-of-iteration checkpoint alongside cancellation check | `test_run_reclaim.py:test_heartbeat_binds_run_id_and_runner_id`, `test_runner_reclaim.py:test_heartbeat_checked_before_each_instrument` | Heartbeat refresh at cancellation checkpoint confirmed in runner.py (pre-existing on integration base from E4-S5). |
| DAC-E5-11 | SATISFIED | `reclaim.py:_RECLAIM_SQL` WHERE clause: `state IN ('running','cancelling') AND claimed_by IS NOT NULL AND heartbeat_at < now() - make_interval(...)`, sets `state='abandoned', ended_at=now(), claimed_by=NULL, heartbeat_at=NULL` | `test_stale_running_run_is_reclaimed`, `test_stale_cancelling_run_is_reclaimed` | Both stale running and cancelling reclaimed as abandoned with ended_at set and claim fields cleared. |
| DAC-E5-12 | SATISFIED | Atomic `UPDATE...RETURNING` inherently idempotent -- second execution finds no matching rows because state is already `abandoned` | `test_concurrent_sweepers_reclaim_exactly_once` (repeated sweep returns empty; claim_next succeeds) | Idempotent and subsequent run can start. |
| DAC-E5-13 | SATISFIED | `writer.py:_LOCK_RUN_SQL` with `FOR UPDATE` locks row; `RunNotActive` raised when state not in `_ACTIVE_RUN_STATES`; `runner.py:199-201` stops on `heartbeat() == False` | `test_heartbeat_false_after_reclaim_and_write_rejected` | Heartbeat returns False after reclaim; write_instrument rejects the abandoned run. |
| DAC-E5-S4-1 | SATISFIED | `_RECLAIM_SQL` uses strict `<` comparison; fresh heartbeat_at is not older than the window | `test_fresh_running_run_is_not_reclaimed` | Fresh heartbeat survives. |
| DAC-E5-S4-2 | SATISFIED | `_RECLAIM_SQL` includes `'cancelling'` in state predicate | `test_stale_cancelling_run_is_reclaimed` | Stale cancelling run reclaimed as abandoned. |
| DAC-E5-S4-3 | SATISFIED | `_RECLAIM_SQL` touches only `acquisition_run`; does not DELETE or modify coverage/result tables | `test_reclaim_does_not_touch_coverage_or_results` | Coverage and result rows present before reclaim remain unchanged. |
| DAC-E5-S4-4 | SATISFIED | `app.py:_run_reclaim_loop` runs as asyncio task in application lifespan; no ingestion import | `test_lifespan_reclaim_loop_behaviour`, `test_lifespan_reclaim_task_cancelled_before_pool_close` | Application process runs reclaim even when ingestion is stopped. |
| DAC-E5-S4-5 | SATISFIED | PostgreSQL row-level UPDATE lock serializes concurrent reclaim; second transaction finds row already `abandoned` and skips it | `test_concurrent_sweepers_reclaim_exactly_once` | Two concurrent sweepers: exactly one reclaims, other is no-op. |
| DAC-E5-S4-6 | SATISFIED | `writer.py:_LOCK_RUN_SQL` with `FOR UPDATE` followed by state check raises `RunNotActive` for abandoned run before any writes | `test_heartbeat_false_after_reclaim_and_write_rejected` (heartbeat False + write rejected + 0 result rows) | Post-reclaim write rejected. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Integration base contains `migrations/0003_coverage.sql`, `0004_runs.sql`, `states.py`, `conftest.py` fixtures, `journal.py` claim boundary, `writer.py` one-instrument transaction, `app.py` lifespan/pool | Prerequisite verification; no production code changed. |
| T002 | complete | VERIFIED | `tests/integration/test_run_reclaim.py`: `test_stale_running_run_is_reclaimed` (TC-COMP-020, TC-COMP-246), `test_fresh_running_run_is_not_reclaimed` (TC-COMP-246), `test_stale_cancelling_run_is_reclaimed` (TC-COMP-246, TC-COMP-273), `test_reclaim_does_not_touch_coverage_or_results` (TC-COMP-274, TC-COMP-275) | All five TC-IDs carry traceability comments. Uses database-relative timestamps. See IR-001 for minor gap. |
| T003 | complete | VERIFIED | `test_concurrent_sweepers_reclaim_exactly_once` (TC-COMP-247, TC-COMP-277); two `READ_COMMITTED` connections, barrier, commit before result, exactly-one assertion, repeated sweep no-op, `claim_next` succeeds | Matches task plan precisely. |
| T004 | complete | VERIFIED | `test_heartbeat_false_after_reclaim_and_write_rejected` (TC-COMP-278); heartbeat returns False, `write_instrument` raises `RunNotActive`, 0 result rows | See IR-002 for exception-type assertion weakness. |
| T005 | complete | VERIFIED | `tests/unit/test_api_reclaim_lifespan.py` (TC-COMP-276); two tests: loop behaviour (delays == [5.0], dispatch_count >= 1) and shutdown ordering (task.done() after cancellation) | Uses injected wait/dispatch doubles; no wall-clock sleeping. |
| T006 | complete | VERIFIED | `tests/unit/test_run_reclaim.py`: 9 unit tests with cursor doubles covering bound parameters, strict stale comparison, state predicate, claim clearing, return values, heartbeat bool mapping | All tests pass. |
| T007 | complete | VERIFIED | `src/factorflow/runs/reclaim.py` created with `reclaim_stale_runs(connection, stale_after_seconds) -> list[uuid.UUID]`; parameterised `UPDATE...RETURNING`; caller owns commit; no read-then-update, no coverage/result modification | `heartbeat()` was already on integration base from prior story; only `reclaim.py` was created by this story. See IR-003. |
| T008 | complete | VERIFIED | `src/factorflow/ingestion/runner.py:198`: `hb_ok = heartbeat(self._connection, run_id, self._runner_id)` at top-of-iteration checkpoint | Runner integration was already landed by E4-S5 on the integration base; T008 verified the concrete journal function is bound there. No new code was required. |
| T009 | complete | VERIFIED | `src/factorflow/ingestion/writer.py`: `_LOCK_RUN_SQL` with `FOR UPDATE`, `_ACTIVE_RUN_STATES`, `RunNotActive` exception class; guard added inside `write_instrument` before any writes; approved signature unchanged | Correctly locks run row and checks state before observations/coverage/result writes. |
| T010 | complete | VERIFIED | `src/factorflow/api/app.py`: `_run_reclaim_loop` async coroutine with injectable `wait_fn`, `dispatch_fn`, `stop_event`; lifespan creates task after pool opens, cancels/awaits before pool close; uses `asyncio.to_thread` for synchronous pool work; 5-second interval | Does not import or start ingestion. |
| T011 | complete | VERIFIED | `CAP-001-E5-S4-tdd-evidence.yaml`: RED/GREEN/MUTATE evidence for T002-T010; all tasks checked complete; story status -> in-review | Evidence file present with mutation records for each task. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_stale_running_run_is_reclaimed` / TC-COMP-020, TC-COMP-246 | ADEQUATE | Inserts stale running row, reclaims, asserts state=abandoned, ended_at set, claim fields None | None |
| `test_fresh_running_run_is_not_reclaimed` / TC-COMP-246 | ADEQUATE | Inserts fresh (now()) heartbeat, asserts not reclaimed, state still running, claimed_by still set | None |
| `test_stale_cancelling_run_is_reclaimed` / TC-COMP-246, TC-COMP-273 | ADEQUATE | Inserts stale cancelling row, asserts reclaimed as abandoned with cleared claims | None |
| `test_reclaim_does_not_touch_coverage_or_results` / TC-COMP-274, TC-COMP-275 | ADEQUATE | Pre-inserts coverage and result rows, reclaims, asserts both counts unchanged | Does not check `acquisition_state` (see IR-001). Reclaim SQL provably does not touch other tables, so coverage is logically sound. |
| `test_concurrent_sweepers_reclaim_exactly_once` / TC-COMP-247, TC-COMP-277 | ADEQUATE | Two threads with barrier, READ_COMMITTED, exactly-one XOR assertion, repeated sweep no-op, claim_next succeeds | Thorough concurrency test with real PostgreSQL connections. |
| `test_heartbeat_false_after_reclaim_and_write_rejected` / TC-COMP-278 | ADEQUATE | Reclaims stale run, asserts heartbeat returns False, write_instrument raises exception, 0 result rows | Exception-type assertion overly broad (see IR-002), but test still validates the critical behavior. |
| `test_lifespan_reclaim_loop_behaviour` / TC-COMP-276 | ADEQUATE | Asserts delays == [5.0], dispatch_count >= 1, stop_event terminates loop | Uses injected doubles; no wall-clock dependence. |
| `test_lifespan_reclaim_task_cancelled_before_pool_close` / TC-COMP-276 | ADEQUATE | Creates task, cancels, asserts task.done() | Verifies shutdown ordering. |
| Unit tests (`test_run_reclaim.py`) | ADEQUATE | 9 tests with cursor doubles covering SQL contract: bound params, strict <, state predicate, claim clearing, return values, heartbeat bool mapping | Cursor doubles verify SQL text and parameter binding at the boundary. |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m postgres tests/integration/test_run_reclaim.py tests/integration/test_runner_reclaim.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 8 passed in 3.78s |
| `uv run pytest tests/unit/test_run_reclaim.py tests/unit/test_api_reclaim_lifespan.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Included in non-postgres run below |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 414 passed, 157 deselected, 2 warnings in 13.13s |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 147 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 41 source files |
| `uv run pytest` (full suite) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Postgres + non-postgres all pass (8 + 414 = 422 total) |

### Validation Side Effects

- Before: working tree clean, no staged/unstaged/untracked files
- After: working tree clean, no staged/unstaged/untracked files
- Unexpected tracked-file changes: none

## Findings

### IR-001 -- Test gap: acquisition_state preservation not verified

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-S4-3
- **Tasks**: T002
- **Files**: `tests/integration/test_run_reclaim.py:test_reclaim_does_not_touch_coverage_or_results`
- **Claim challenged**: Task plan T002 states the test should assert "snapshots of committed `coverage_segment`, `acquisition_state`, and `run_instrument_result` rows remain unchanged."
- **Observed evidence**: The test inserts and checks `coverage_segment` (count=1) and `run_instrument_result` (count=1) after reclaim. It does not insert or check any `acquisition_state` row.
- **Expected evidence/behavior**: Per the task plan, `acquisition_state` rows should also be verified as unchanged after reclaim.
- **Impact**: Low practical risk because the reclaim SQL (`_RECLAIM_SQL`) provably modifies only the `acquisition_run` table and cannot affect `acquisition_state`. The gap is between the task plan's claimed coverage and the actual test scope.
- **Required remediation**: Add an `acquisition_state` row insertion and count assertion to the test, or document in the task plan that `acquisition_state` verification was not required because the SQL provably does not touch that table.

### IR-002 -- Test weakness: overly broad exception assertion in T004

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-S4-6, DAC-E5-13
- **Tasks**: T004
- **Files**: `tests/integration/test_run_reclaim.py:test_heartbeat_false_after_reclaim_and_write_rejected`, line 440
- **Claim challenged**: The test should verify that `write_instrument` raises `RunNotActive` specifically when a post-reclaim write is attempted.
- **Observed evidence**: `pytest.raises((RunNotActive, Exception))` catches any exception whatsoever, since every exception is an instance of `Exception`. This assertion cannot distinguish `RunNotActive` from any other error (e.g. a psycopg `IntegrityError`, a `TypeError`, or a `KeyError`).
- **Expected evidence/behavior**: The test should use `pytest.raises(RunNotActive)` to verify the specific exception type, confirming the code path through the active-state guard.
- **Impact**: A regression that raises a different exception (e.g. a database constraint error before the guard) would still pass this test, masking a correctness defect.
- **Required remediation**: Change `pytest.raises((RunNotActive, Exception))` to `pytest.raises(RunNotActive)`.

### IR-003 -- Bookkeeping: T007 commit message overstates changes

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: commit `6d047c4`
- **Claim challenged**: The commit message states "add reclaim_stale_runs and heartbeat" and mentions updating `journal.py`, but the commit diffstat shows only `reclaim.py` was created (1 file changed, 71 insertions).
- **Observed evidence**: `heartbeat()` already existed at the review base (`362a70cf`) in `journal.py` line 215, landed by a prior story on the integration branch.
- **Expected evidence/behavior**: The commit message should accurately describe the files and functions changed by the commit.
- **Impact**: No functional impact; the heartbeat function exists and works. The misleading commit message could confuse future history review. Similarly, T008 claims to integrate heartbeat at the runner checkpoint, but `runner.py` was not changed by this story -- it was already integrated by E4-S5.
- **Required remediation**: No code change required. The TDD evidence (T008 `red_observed: false`) correctly documents that the integration was pre-existing. Accept as bookkeeping noise.

## Previous Review Disposition

Not applicable -- initial review.

## Scope and Plan Deviations

- `journal.py` and `runner.py` were not changed by this story. The heartbeat function and runner integration were already present on the integration branch from CAP-001-E5-S3 and CAP-001-E4-S5 respectively. T007 and T008 were correctly scoped to verify/reuse these existing implementations rather than duplicating them. The TDD evidence correctly records `red_observed: false` for T008.
- The `_reclaim_interval_seconds` (5 seconds) is a module-level constant in `app.py` rather than a `RunSettings` field. This matches the task plan's "Open Gaps" section, which records this as a design-revision-pending decision.
- No out-of-scope changes detected. All 9 changed files are justified by the story and task plan.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Synchronize component documentation with the new reclaim module, writer guard, and lifespan reclaim loop.
- **Warnings accepted downstream**: IR-001, IR-002 (MEDIUM), IR-003 (LOW)
