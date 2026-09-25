---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-24
updated: 2026-09-24
story_id: "CAP-001-E5-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-24T21:28:43Z"
reviewed_head: "5077de65c40a2c0c9fd019932f4423414bea7017"
review_base: "6b39c181417df4c334bb1223e0799b407ff17aa8"
reviewed_state_revision: "sha256:4ef5ff6262280c5ef7f599ab81c176049d642bb748d05f55ef3f6ff550e75258"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E5-S3
    artifact_version: 1
    content_revision: sha256:0c15a06198c72f6e30046176ae8bae4b508e0ce403ce1615bfbbac481e7c2bc8
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-4-6
  tool: Claude Code
  tool_version: "unknown"
  timestamp: "2026-09-24T21:28:43Z"
  source_artifacts:
    - id: CAP-001-E5-S3
      version: "1"
    - id: CAP-001-E5-S3-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E5-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 9/9 verified |
| Required validation | 6/6 passed |

All acceptance criteria are satisfied by production code and exercised by integration tests against a real PostgreSQL database. All planned tasks are verified. All required validation commands pass. Two MEDIUM findings note missing `validate_transition` calls and a missing `FOR UPDATE` lock in `finalise`; one LOW finding notes TDD evidence `commit_hash` placeholders. None of these compromise acceptance criteria, required behavior, or test quality.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E5-S3-run-20260924T211147Z` |
| HEAD | `5077de65c40a2c0c9fd019932f4423414bea7017` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E5-integration-20260924T202935Z` / `6b39c181417df4c334bb1223e0799b407ff17aa8` |
| Working tree | clean |
| Changed files reviewed | 7 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../CAP-001-E5-S3-tasks.md` | modified | T001-T009 checkbox updates |
| `docs/.../CAP-001-E5-S3-tdd-evidence.yaml` | added | T009 TDD evidence |
| `docs/.../CAP-001-E5-S3.md` | modified | Status update to `in-review` |
| `src/factorflow/runs/journal.py` | modified | T007: `RunAlreadyTerminal`, `request_cancel`, `finalise` update; AC-19, AC-26, DAC-E5-4 through DAC-E5-9, DAC-E5-S3-1 through DAC-E5-S3-7 |
| `tests/integration/test_run_cancel.py` | added | T002, T003: cancellation integration tests |
| `tests/integration/test_run_outcome.py` | added | T004, T005: outcome finalisation integration tests |
| `tests/unit/test_run_journal.py` | modified | T006: boundary/signature unit tests |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-19 | SATISFIED | `journal.py:request_cancel` sets `cancelling`; `cancellation_requested` reads state; `finalise` honours cancellation | `test_run_cancel.py::test_cancelled_run_retains_committed_coverage`, `test_cancellation_requested_true_after_request_cancel` | Committed rows retained; unreached absent |
| AC-26 | SATISFIED | `journal.py:request_cancel` transitions `requested -> cancelled` directly; `_CANCEL_REQUESTED_SQL` sets `ended_at`, never touches other rows | `test_run_cancel.py::test_request_cancel_queued_moves_directly_to_cancelled`, `test_cancel_queued_run_leaves_active_run_unchanged` | Active run byte-for-byte unchanged |
| DAC-E5-4 | SATISFIED | `journal.py:finalise` derives outcome from `run_instrument_result` rows, never from caller | `test_run_journal.py::test_finalise_signature_accepts_no_outcome_argument`; all `test_run_outcome.py` tests | Signature enforced; no outcome parameter |
| DAC-E5-5 | SATISFIED | `finalise` checks `wrote == instruments_named * 4` with no non-success rows for `succeeded`; zero wrote yields `failed` | `test_run_outcome.py::test_finalise_all_written_succeeds`, `test_finalise_no_instruments_reached_is_failed` | Four data types per instrument |
| DAC-E5-6 | SATISFIED | `request_cancel` records `cancelling` with `cancel_requested_at`; `cancellation_requested` reads state | `test_run_cancel.py::test_request_cancel_running_moves_to_cancelling`, `test_cancellation_requested_true_after_request_cancel` | Cooperative, observable between instruments |
| DAC-E5-7 | SATISFIED | `finalise` transitions `cancelling -> cancelled` via `_FINALISE_UPDATE_SQL`; coverage rows untouched | `test_run_cancel.py::test_cancelled_run_distinct_from_failed`, `test_cancelled_run_retains_committed_coverage` | Distinct from failed |
| DAC-E5-8 | SATISFIED | `request_cancel` with `current_state == "requested"` executes `_CANCEL_REQUESTED_SQL` | `test_run_cancel.py::test_request_cancel_queued_moves_directly_to_cancelled` | Direct state transition |
| DAC-E5-9 | SATISFIED | `request_cancel` raises `RunAlreadyTerminal(actual_state=current_state)` for terminal states | `test_run_cancel.py::test_request_cancel_terminal_raises_already_terminal` (parametrized over 5 states) | Names actual state |
| DAC-E5-S3-1 | SATISFIED | `request_cancel` returns `"cancelling"` for running; `finalise` transitions to `cancelled` | `test_run_cancel.py::test_request_cancel_running_non_terminal_until_finalised` | Non-terminal until finalise |
| DAC-E5-S3-2 | SATISFIED | Neither `request_cancel` nor `finalise` modifies `run_instrument_result` rows | `test_run_cancel.py::test_cancelled_run_retains_committed_coverage` | Unreached instruments absent |
| DAC-E5-S3-3 | SATISFIED | `_CANCEL_REQUESTED_SQL` WHERE clause targets only the cancelled run_id | `test_run_cancel.py::test_cancel_queued_run_leaves_active_run_unchanged` | Active run fields unchanged |
| DAC-E5-S3-4 | SATISFIED | `RunAlreadyTerminal.actual_state` carries the persisted state | `test_run_cancel.py::test_request_cancel_terminal_race_named_state` | Reports completed state |
| DAC-E5-S3-5 | SATISFIED | `finalise` checks `wrote == instruments_named * 4` and `non_success == 0` | `test_run_outcome.py::test_finalise_all_written_succeeds`, `test_finalise_all_unchanged_succeeds`, `test_finalise_multiple_instruments_all_written_succeeds` | Both written and unchanged count |
| DAC-E5-S3-6 | SATISFIED | `finalise` falls through to `partial` when success count is not zero but incomplete | `test_run_outcome.py::test_finalise_mixed_success_and_not_found_is_partial`, `test_finalise_mixed_success_and_failed_is_partial` | Mixed results = partial |
| DAC-E5-S3-7 | SATISFIED | `finalise` returns `"failed"` when `wrote == 0` | `test_run_outcome.py::test_finalise_no_instruments_reached_is_failed`, `test_finalise_all_not_found_is_failed` | Zero successful = failed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S1 files (`migrations/0003_coverage.sql`, `migrations/0004_runs.sql`, `src/factorflow/runs/__init__.py`, `src/factorflow/runs/states.py`, `tests/conftest.py`) and S2 journal (`journal.py` with `request_run`, `claim_next`) present on branch | No prerequisite artifacts created or moved |
| T002 | complete | VERIFIED | `tests/integration/test_run_cancel.py` lines 120-225: 5 tests covering TC-COMP-019, TC-COMP-241, TC-COMP-242, TC-COMP-266, TC-COMP-267 with traceability comments | All carry `@pytest.mark.postgres` |
| T003 | complete | VERIFIED | `tests/integration/test_run_cancel.py` lines 247-372: 5 tests (including 5-state parametrized) covering TC-COMP-026, TC-COMP-243, TC-COMP-244, TC-COMP-268, TC-COMP-269 with traceability comments | Terminal-state parametrization covers all 5 states |
| T004 | complete | VERIFIED | `tests/integration/test_run_outcome.py` lines 92-185: 4 tests covering TC-COMP-239, TC-COMP-240, TC-COMP-270 with traceability comments | Succeeded, unchanged, missing-data-type, and multi-instrument cases |
| T005 | complete | VERIFIED | `tests/integration/test_run_outcome.py` lines 189-321: 5 tests covering TC-COMP-240, TC-COMP-271, TC-COMP-272 with traceability comments | Partial (mixed), failed (no reach, all not_found), skipped |
| T006 | complete | VERIFIED | `tests/unit/test_run_journal.py` lines 127-207: 4 unit tests for `RunAlreadyTerminal.actual_state`, bound parameters, `finalise` signature, `request_cancel` signature | SQL injection boundary verified |
| T007 | complete | VERIFIED | `src/factorflow/runs/journal.py` lines 29-167 and 246-303: `RunAlreadyTerminal`, `request_cancel`, updated `finalise` with zero-success rule, `validate_transition` call in `request_cancel` | No caller-supplied outcome; bound parameters throughout |
| T008 | complete | VERIFIED | All 23 integration tests and 10 unit tests pass; `runner.py`, `writer.py`, `outcomes.py` are unchanged in the diff | S3 changes confined to journal and its tests |
| T009 | complete | VERIFIED | `CAP-001-E5-S3-tdd-evidence.yaml` records RED/GREEN/mutation evidence for T002-T009; full suite 554 passed | TDD evidence file present with mutation records |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_request_cancel_running_moves_to_cancelling` / TC-COMP-241 | ADEQUATE | Asserts state, cancel_requested_at, ended_at=None, claim fields retained | None |
| `test_request_cancel_running_non_terminal_until_finalised` / TC-COMP-242 | ADEQUATE | Verifies cancelling is non-terminal, then finalise yields cancelled with ended_at and cleared claims | None |
| `test_cancellation_requested_true_after_request_cancel` / TC-COMP-019 | ADEQUATE | Tests False before and True after request_cancel | None |
| `test_cancelled_run_retains_committed_coverage` / TC-COMP-266 | ADEQUATE | Seeds 4 result rows for reached instrument, verifies all 4 present and unreached has 0 rows after cancel+finalise | None |
| `test_cancelled_run_distinct_from_failed` / TC-COMP-267 | ADEQUATE | Asserts state == "cancelled" and state != "failed" | None |
| `test_request_cancel_queued_moves_directly_to_cancelled` / TC-COMP-243 | ADEQUATE | Asserts direct cancelled, ended_at set, started_at null | None |
| `test_cancelled_queued_run_excluded_from_claim_next` / TC-COMP-244 | ADEQUATE | Claims after cancel returns None | None |
| `test_cancel_queued_run_leaves_active_run_unchanged` / TC-COMP-026 | ADEQUATE | Snapshot-compares full active run row before and after queued cancel | None |
| `test_request_cancel_terminal_raises_already_terminal` / TC-COMP-268 | ADEQUATE | Parametrized over 5 terminal states; asserts exception, actual_state, and row unchanged | None |
| `test_request_cancel_terminal_race_named_state` / TC-COMP-269 | ADEQUATE | Simulates succeeded race, asserts actual_state == "succeeded" | None |
| `test_finalise_all_written_succeeds` / TC-COMP-239 | ADEQUATE | 1 instrument, 4 written, asserts succeeded + ended_at | None |
| `test_finalise_all_unchanged_succeeds` / TC-COMP-239 | ADEQUATE | 1 instrument, 4 unchanged, asserts succeeded | None |
| `test_finalise_missing_one_data_type_cannot_succeed` / TC-COMP-240 | ADEQUATE | 3 of 4 data types, asserts != succeeded | None |
| `test_finalise_multiple_instruments_all_written_succeeds` / TC-COMP-270 | ADEQUATE | 2 instruments, mixed written/unchanged, asserts succeeded | None |
| `test_finalise_mixed_success_and_not_found_is_partial` / TC-COMP-271 | ADEQUATE | 3 written + 1 not_found, asserts partial | None |
| `test_finalise_mixed_success_and_failed_is_partial` / TC-COMP-271 | ADEQUATE | 3 written + 1 failed, asserts partial | None |
| `test_finalise_no_instruments_reached_is_failed` / TC-COMP-272 | ADEQUATE | instruments_named=1, no result rows, asserts failed | None |
| `test_finalise_all_not_found_is_failed` / TC-COMP-272 | ADEQUATE | 4 not_found, asserts failed | None |
| `test_finalise_skipped_result_is_not_successful` / TC-COMP-240 | ADEQUATE | 3 written + 1 skipped, asserts != succeeded | None |
| `test_run_already_terminal_carries_actual_state` | ADEQUATE | Constructs exception, asserts .actual_state | None |
| `test_request_cancel_passes_run_id_as_bound_parameter` | ADEQUATE | Verifies run_id in params, not interpolated in query string | None |
| `test_finalise_signature_accepts_no_outcome_argument` | ADEQUATE | Inspects signature, asserts only (connection, run_id) | None |
| `test_request_cancel_signature` | ADEQUATE | Inspects signature, asserts only (connection, run_id) | None |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 143 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 40 source files |
| `uv run pytest tests/unit/test_run_journal.py -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 10 passed |
| `uv run pytest -m postgres tests/integration/test_run_cancel.py tests/integration/test_run_outcome.py -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 23 passed |
| `uv run pytest -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 554 passed, 2 warnings |

### Validation Side Effects

- Before: clean working tree
- After: clean working tree
- Unexpected tracked-file changes: none

## Findings

### IR-001 — `finalise` does not call `validate_transition` before writing terminal state

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-4, DAC-E5-5
- **Tasks**: T007
- **Files**: `src/factorflow/runs/journal.py:finalise` (lines 259-303)
- **Claim challenged**: T007 specifies "the S1 transition validator" should be used in all state transitions.
- **Observed evidence**: `request_cancel` calls `validate_transition(current_state, next_state)` before writing, but `finalise` does not. It transitions directly from the current state to the derived outcome without validating the transition through the S1 state machine.
- **Expected evidence/behavior**: Per T007: "implement... with typed psycopg boundaries, bound parameters, row locking/transactional state checks, and the S1 transition validator." The transition validator should guard every state write.
- **Impact**: If `finalise` were called on a `requested` run (bypassing the normal runner flow), it would write a terminal state (e.g., `requested -> failed`) that the S1 state machine does not permit. In practice, the runner contract prevents this because only claimed (running/cancelling) runs call `finalise`. The risk is bounded to future callers that bypass the runner.
- **Required remediation**: Add `validate_transition(current_state, derived_state)` in `finalise` before executing `_FINALISE_UPDATE_SQL`, matching the pattern used in `request_cancel`.

### IR-002 — `finalise` reads state without `FOR UPDATE` row lock

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `src/factorflow/runs/journal.py:finalise` line 262 uses `_CANCELLATION_SQL` which is `SELECT state FROM acquisition_run WHERE run_id = %s` (no `FOR UPDATE`)
- **Claim challenged**: T007 specifies "row locking/transactional state checks."
- **Observed evidence**: `request_cancel` uses `_READ_STATE_FOR_CANCEL_SQL` with `FOR UPDATE`, but `finalise` reads state with `_CANCELLATION_SQL` which lacks `FOR UPDATE`. The UPDATE in `_FINALISE_UPDATE_SQL` acquires a row lock implicitly, but the read-then-write window permits a TOCTOU race if two transactions call `finalise` concurrently on the same run.
- **Expected evidence/behavior**: Per T007, row locking should guard the read that determines the state before writing a terminal transition. `request_cancel` demonstrates the expected pattern with `FOR UPDATE`.
- **Impact**: In the single-runner architecture, only one runner calls `finalise` per run, so concurrent finalise calls are not expected. The risk is bounded to future multi-runner or retry scenarios.
- **Required remediation**: Use a `FOR UPDATE`-qualified SELECT (or reuse `_READ_STATE_FOR_CANCEL_SQL`) when reading state in `finalise`, matching the locking pattern in `request_cancel`.

### IR-003 — TDD evidence `commit_hash` fields contain placeholders

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009
- **Files**: `docs/.../CAP-001-E5-S3-tdd-evidence.yaml`
- **Claim challenged**: T009 requires recording commit hashes per task cycle.
- **Observed evidence**: All task entries use `commit_hash: "(committed at T009 completion)"` or `commit_hash: "pending"` rather than actual Git SHAs. The entire story was committed as a single commit (`5077de65`).
- **Expected evidence/behavior**: Per the task plan's "Per-Task Commit Gate" section, each task should have been committed separately with its hash recorded.
- **Impact**: The per-task commit provenance is absent, but the final commit contains all work and all tests pass. The single-commit approach is a process deviation that does not affect code correctness.
- **Required remediation**: None required for gate purposes. This is a documentation gap in TDD evidence fidelity.

## Previous Review Disposition

Not applicable -- initial review.

## Scope and Plan Deviations

- The task plan's "Per-Task Commit Gate" prescribed separate commits per task (T001-T009) with independent code-review and spec-drift subagent verdicts recorded before each commit. The implementation was delivered as a single commit. This is a process deviation but does not affect the correctness or completeness of the delivered code.
- No unjustified scope changes were found. All 7 changed files trace to story acceptance criteria or task plan requirements. No files outside S3 ownership (runner.py, writer.py, outcomes.py) were modified, as required by T008.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Synchronize component documentation with the implemented cancellation and finalisation behavior.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003
