---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-25
updated: 2026-09-25
story_id: "CAP-001-E5-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-25T14:42:00Z"
reviewed_head: "cf3cb3ffd28bd22286742b2f8cee23cf65f80072"
review_base: "c1688f87fb72b20074c10efaa7253990fc31cf02"
reviewed_state_revision: "sha256:0ac0917658838d421dd895e23a9d85903111443bc5ae02f94312b17a624966a4"
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
  timestamp: "2026-09-25T14:42:00Z"
  source_artifacts:
    - id: CAP-001-E5-S3
      version: "1"
    - id: CAP-001-E5-S3-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E5-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 9/9 verified |
| Required validation | 6/6 passed |

Re-review after rework commit `cf3cb3f` ("fix(CAP-001-E5-S3): harden finalise transitions"). Both MEDIUM findings from v1 (IR-001: missing `validate_transition` in `finalise`; IR-002: missing `FOR UPDATE` lock in `finalise`) are resolved with production code changes and new tests. The LOW finding from v1 (IR-003: TDD evidence commit hash placeholders) remains open and is carried forward as IR-001 in this report. All 14 acceptance criteria are satisfied, all 9 tasks are verified, and all 6 required validation commands pass (621 tests, lint, format, type check).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E5-S3-finalise-hardening` |
| HEAD | `cf3cb3ffd28bd22286742b2f8cee23cf65f80072` |
| Review base | `origin/main` / `c1688f87fb72b20074c10efaa7253990fc31cf02` |
| Working tree | clean |
| Changed files reviewed | 3 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/runs/journal.py` | modified | T007: add `validate_transition` calls to all four `finalise` terminal-state paths; add `_READ_STATE_FOR_FINALISE_SQL` with `FOR UPDATE` and use it in `finalise`; remediates v1/IR-001 and v1/IR-002 |
| `tests/integration/test_run_outcome.py` | modified | T007, T009: add `_insert_requested_run` helper and `test_finalise_rejects_illegal_transition_from_requested` integration test verifying `validate_transition` guard rejects illegal transitions |
| `tests/unit/test_run_journal.py` | modified | T006, T009: add `test_finalise_locks_state_before_deriving_outcome` unit test verifying `FOR UPDATE` in `finalise` state read |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-19 | SATISFIED | `journal.py:request_cancel` sets `cancelling`; `cancellation_requested` reads state; `finalise` honours cancellation with `validate_transition` | `test_run_cancel.py::test_cancelled_run_retains_committed_coverage`, `test_cancellation_requested_true_after_request_cancel` | Committed rows retained; unreached absent |
| AC-26 | SATISFIED | `journal.py:request_cancel` transitions `requested -> cancelled` directly; `_CANCEL_REQUESTED_SQL` sets `ended_at`, never touches other rows | `test_run_cancel.py::test_request_cancel_queued_moves_directly_to_cancelled`, `test_cancel_queued_run_leaves_active_run_unchanged` | Active run byte-for-byte unchanged |
| DAC-E5-4 | SATISFIED | `journal.py:finalise` derives outcome from `run_instrument_result` rows, never from caller; `validate_transition` guards every terminal path | `test_run_journal.py::test_finalise_signature_accepts_no_outcome_argument`; all `test_run_outcome.py` tests; `test_finalise_rejects_illegal_transition_from_requested` | Signature enforced; illegal transitions rejected |
| DAC-E5-5 | SATISFIED | `finalise` checks `wrote == instruments_named * 4` with no non-success rows for `succeeded`; zero wrote yields `failed`; `validate_transition` validates each path | `test_run_outcome.py::test_finalise_all_written_succeeds`, `test_finalise_no_instruments_reached_is_failed` | Four data types per instrument |
| DAC-E5-6 | SATISFIED | `request_cancel` records `cancelling` with `cancel_requested_at`; `cancellation_requested` reads state | `test_run_cancel.py::test_request_cancel_running_moves_to_cancelling`, `test_cancellation_requested_true_after_request_cancel` | Cooperative, observable between instruments |
| DAC-E5-7 | SATISFIED | `finalise` transitions `cancelling -> cancelled` via `validate_transition` then `_FINALISE_UPDATE_SQL`; coverage rows untouched | `test_run_cancel.py::test_cancelled_run_distinct_from_failed`, `test_cancelled_run_retains_committed_coverage` | Distinct from failed |
| DAC-E5-8 | SATISFIED | `request_cancel` with `current_state == "requested"` executes `_CANCEL_REQUESTED_SQL` | `test_run_cancel.py::test_request_cancel_queued_moves_directly_to_cancelled` | Direct state transition |
| DAC-E5-9 | SATISFIED | `request_cancel` raises `RunAlreadyTerminal(actual_state=current_state)` for terminal states | `test_run_cancel.py::test_request_cancel_terminal_raises_already_terminal` (parametrized over 5 states) | Names actual state |
| DAC-E5-S3-1 | SATISFIED | `request_cancel` returns `"cancelling"` for running; `finalise` validates and transitions to `cancelled` | `test_run_cancel.py::test_request_cancel_running_non_terminal_until_finalised` | Non-terminal until finalise |
| DAC-E5-S3-2 | SATISFIED | Neither `request_cancel` nor `finalise` modifies `run_instrument_result` rows | `test_run_cancel.py::test_cancelled_run_retains_committed_coverage` | Unreached instruments absent |
| DAC-E5-S3-3 | SATISFIED | `_CANCEL_REQUESTED_SQL` WHERE clause targets only the cancelled run_id | `test_run_cancel.py::test_cancel_queued_run_leaves_active_run_unchanged` | Active run fields unchanged |
| DAC-E5-S3-4 | SATISFIED | `RunAlreadyTerminal.actual_state` carries the persisted state | `test_run_cancel.py::test_request_cancel_terminal_race_named_state` | Reports completed state |
| DAC-E5-S3-5 | SATISFIED | `finalise` checks `wrote == instruments_named * 4` and `non_success == 0`; `validate_transition(current_state, "succeeded")` guards the write | `test_run_outcome.py::test_finalise_all_written_succeeds`, `test_finalise_all_unchanged_succeeds`, `test_finalise_multiple_instruments_all_written_succeeds` | Both written and unchanged count |
| DAC-E5-S3-6 | SATISFIED | `finalise` falls through to `partial` with `validate_transition(current_state, "partial")` when success count is not zero but incomplete | `test_run_outcome.py::test_finalise_mixed_success_and_not_found_is_partial`, `test_finalise_mixed_success_and_failed_is_partial` | Mixed results = partial |
| DAC-E5-S3-7 | SATISFIED | `finalise` returns `"failed"` when `wrote == 0` with `validate_transition(current_state, "failed")` | `test_run_outcome.py::test_finalise_no_instruments_reached_is_failed`, `test_finalise_all_not_found_is_failed` | Zero successful = failed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S1 files (`migrations/0003_coverage.sql`, `migrations/0004_runs.sql`, `src/factorflow/runs/__init__.py`, `src/factorflow/runs/states.py`, `tests/conftest.py`) and S2 journal (`journal.py` with `request_run`, `claim_next`) present on branch | No prerequisite artifacts created or moved |
| T002 | complete | VERIFIED | `tests/integration/test_run_cancel.py` lines 120-225: 5 tests covering TC-COMP-019, TC-COMP-241, TC-COMP-242, TC-COMP-266, TC-COMP-267 with traceability comments | All carry `@pytest.mark.postgres` |
| T003 | complete | VERIFIED | `tests/integration/test_run_cancel.py` lines 247-372: 5 tests (including 5-state parametrized) covering TC-COMP-026, TC-COMP-243, TC-COMP-244, TC-COMP-268, TC-COMP-269 with traceability comments | Terminal-state parametrization covers all 5 states |
| T004 | complete | VERIFIED | `tests/integration/test_run_outcome.py` lines 127-214: 4 tests covering TC-COMP-239, TC-COMP-240, TC-COMP-270 with traceability comments; new `test_finalise_rejects_illegal_transition_from_requested` at lines 113-123 strengthens guard coverage | Succeeded, unchanged, missing-data-type, multi-instrument, and illegal-transition cases |
| T005 | complete | VERIFIED | `tests/integration/test_run_outcome.py` lines 222-351: 5 tests covering TC-COMP-240, TC-COMP-271, TC-COMP-272 with traceability comments | Partial (mixed), failed (no reach, all not_found), skipped |
| T006 | complete | VERIFIED | `tests/unit/test_run_journal.py` lines 132-205: 4 original unit tests plus new `test_finalise_locks_state_before_deriving_outcome` at lines 195-205 verifying `FOR UPDATE` in `finalise` state read | SQL injection boundary verified; FOR UPDATE lock verified |
| T007 | complete | VERIFIED | `src/factorflow/runs/journal.py` lines 29-167 and 250-311: `RunAlreadyTerminal`, `request_cancel`, `finalise` with `validate_transition` on all four terminal paths (`cancelled`, `failed`, `succeeded`, `partial`) and `_READ_STATE_FOR_FINALISE_SQL` with `FOR UPDATE` | No caller-supplied outcome; bound parameters throughout; S1 transition validator now guards every `finalise` state write |
| T008 | complete | VERIFIED | All 24 integration tests and 11 unit tests pass; `runner.py`, `writer.py`, `outcomes.py` are unchanged in the diff | S3 changes confined to journal and its tests |
| T009 | complete | VERIFIED | `CAP-001-E5-S3-tdd-evidence.yaml` records RED/GREEN/mutation evidence for T002-T009; full suite 621 passed | TDD evidence file present with mutation records |

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
| `test_finalise_rejects_illegal_transition_from_requested` / N/A | ADEQUATE | Seeds a `requested` run, asserts `IllegalRunTransition` is raised when `finalise` is called, confirms state remains `requested`. Validates `validate_transition` guard rejects illegal `requested -> failed` path | None |
| `test_finalise_all_written_succeeds` / TC-COMP-239 | ADEQUATE | 1 instrument, 4 written, asserts succeeded + ended_at | None |
| `test_finalise_all_unchanged_succeeds` / TC-COMP-239 | ADEQUATE | 1 instrument, 4 unchanged, asserts succeeded | None |
| `test_finalise_missing_one_data_type_cannot_succeed` / TC-COMP-240 | ADEQUATE | 3 of 4 data types, asserts != succeeded | None |
| `test_finalise_multiple_instruments_all_written_succeeds` / TC-COMP-270 | ADEQUATE | 2 instruments, mixed written/unchanged, asserts succeeded | None |
| `test_finalise_mixed_success_and_not_found_is_partial` / TC-COMP-271 | ADEQUATE | 3 written + 1 not_found, asserts partial | None |
| `test_finalise_mixed_success_and_failed_is_partial` / TC-COMP-271 | ADEQUATE | 3 written + 1 failed, asserts partial | None |
| `test_finalise_no_instruments_reached_is_failed` / TC-COMP-272 | ADEQUATE | instruments_named=1, no result rows, asserts failed | None |
| `test_finalise_all_not_found_is_failed` / TC-COMP-272 | ADEQUATE | 4 not_found, asserts failed | None |
| `test_finalise_skipped_result_is_not_successful` / TC-COMP-240 | ADEQUATE | 3 written + 1 skipped, asserts != succeeded | None |
| `test_run_already_terminal_carries_actual_state` / N/A | ADEQUATE | Constructs exception, asserts .actual_state | None |
| `test_request_cancel_passes_run_id_as_bound_parameter` / N/A | ADEQUATE | Verifies run_id in params, not interpolated in query string | None |
| `test_finalise_signature_accepts_no_outcome_argument` / N/A | ADEQUATE | Inspects signature, asserts only (connection, run_id) | None |
| `test_finalise_locks_state_before_deriving_outcome` / N/A | ADEQUATE | Uses `_RecordingConnection` with `("running",), (0,)` rows; asserts first SQL query contains `FOR UPDATE` and passes `run_id` as a bound parameter; confirms `finalise` returns `"failed"` via the correct code path | None |
| `test_request_cancel_signature` / N/A | ADEQUATE | Inspects signature, asserts only (connection, run_id) | None |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 153 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 43 source files |
| `uv run pytest tests/unit/test_run_journal.py -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 11 passed |
| `uv run pytest -m postgres tests/integration/test_run_cancel.py tests/integration/test_run_outcome.py -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 24 passed |
| `uv run pytest -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 621 passed, 2 warnings |

### Validation Side Effects

- Before: clean working tree
- After: clean working tree
- Unexpected tracked-file changes: none

## Findings

### IR-001 — TDD evidence `commit_hash` fields contain placeholders

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S3-tdd-evidence.yaml`
- **Claim challenged**: T009 requires recording commit hashes per task cycle.
- **Observed evidence**: All task entries use `commit_hash: "(committed at T009 completion)"` or `commit_hash: "pending"` rather than actual Git SHAs. The rework commit `cf3cb3f` did not update the TDD evidence file.
- **Expected evidence/behavior**: Per the task plan's "Per-Task Commit Gate" section, each task should have been committed separately with its hash recorded.
- **Impact**: The per-task commit provenance is absent, but all code and tests are present in the final commits and all tests pass. The single-commit approach is a process deviation that does not affect code correctness.
- **Required remediation**: None required for gate purposes. This is a documentation gap in TDD evidence fidelity.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 — `finalise` does not call `validate_transition` before writing terminal state | RESOLVED | `journal.py:finalise` now calls `validate_transition(current_state, derived_state)` on all four terminal paths: `cancelling -> cancelled` (line 271), `running -> failed` (line 282), `running -> succeeded` (line 304), and `running -> partial` (line 309). New integration test `test_finalise_rejects_illegal_transition_from_requested` confirms `IllegalRunTransition` is raised for illegal transitions (e.g., `requested -> failed`), and the row remains unchanged. |
| v1/IR-002 — `finalise` reads state without `FOR UPDATE` row lock | RESOLVED | New constant `_READ_STATE_FOR_FINALISE_SQL` (line 182) adds `FOR UPDATE` to the state SELECT. `finalise` (line 266) now uses this query instead of `_CANCELLATION_SQL`. The read-then-write window is eliminated within the same transaction. New unit test `test_finalise_locks_state_before_deriving_outcome` verifies `FOR UPDATE` is present in the first SQL statement and `run_id` is passed as a bound parameter. `_CANCELLATION_SQL` (without `FOR UPDATE`) is still used only by the read-only `cancellation_requested` function (line 243), which is correct. |
| v1/IR-003 — TDD evidence `commit_hash` fields contain placeholders | STILL OPEN | Carried forward as v2/IR-001. The TDD evidence file was not modified in the rework commit. All entries still use placeholder values. |

## Scope and Plan Deviations

- The rework commit is scoped exclusively to remediating v1/IR-001 and v1/IR-002. All 3 changed files trace directly to those findings. No unjustified scope changes or out-of-scope behavior was introduced.
- The `_CANCELLATION_SQL` constant remains defined and used by `cancellation_requested`; the rework correctly introduced a separate `_READ_STATE_FOR_FINALISE_SQL` constant for `finalise` rather than adding `FOR UPDATE` to the shared constant, preserving the read-only semantics of `cancellation_requested`.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Synchronize component documentation with the implemented cancellation and finalisation behavior.
- **Warnings accepted downstream**: IR-001
