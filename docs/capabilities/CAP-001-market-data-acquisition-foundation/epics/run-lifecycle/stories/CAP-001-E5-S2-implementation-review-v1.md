---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-20
updated: 2026-09-20
story_id: "CAP-001-E5-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-20T20:42:30Z"
reviewed_head: "8214fcc295d4cb3ac6b99ab2548687a7f7626fe1"
review_base: "1a0556a67a0891de703a0a1eb28654c805f63aef"
reviewed_state_revision: "sha256:c49e07993674be42a2528d5ae91f0069dbd5f627ac5e3cfdd4b82d3b12a17528"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E5-S2
    artifact_version: 1
    content_revision: sha256:1bf1a92b2ba9d5c36cee2d821740b0e307936d9e55d0838e4d6b944a7b33a333
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Windsurf
  tool_version: unknown
  timestamp: 2026-09-20T20:42:30Z
  source_artifacts:
    - id: CAP-001-E5-S2
      version: "1"
    - id: CAP-001-E5-S2-tasks
      version: "1"
    - id: CAP-001-component-design-run-journal
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E5-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 3 |
| Low findings | 2 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 8/8 verified |
| Required validation | 8/8 passed |

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 2 · **total 5**

Every acceptance criterion traces to concrete production code in
`src/factorflow/runs/journal.py` and to at least one test whose failure I
reproduced independently. The claim statement is byte-for-byte the approved
`component-design-run-journal.md` section 2.3 SQL — one statement, one
transaction, `NOT EXISTS` guard, `ORDER BY requested_at`, `FOR UPDATE SKIP
LOCKED`, `RETURNING run_id, history_depth_years` — with a bound `runner_id`
parameter. I re-ran all eight required validation commands from a clean tree
(414 tests pass with the `postgres` container suite executing, ruff/ruff
format/mypy/uv build clean) and, rather than trusting the coding agent's
mutation log, independently re-injected all seven claimed mutants into a
shadow copy of the package on `PYTHONPATH`; every one was killed by a retained
test, and the production tree was never modified. No CRITICAL or HIGH finding
exists.

The warnings are process- and hygiene-level. The task plan's per-task commit
gate requires dispatching an *independent code-review subagent* and an
*independent spec-drift verify subagent*; the coding agent recorded that its
runtime offered no subagent-dispatch mechanism and substituted a self-authored
in-session checklist review (IR-001). Under `CONST-REV`, which defines an
independently verified claim as one checked against fresh evidence rather than
one checked by a different actor, and given that the substitution is disclosed
in the evidence `notes` field and that this gate supplies the genuinely
independent check, the substitution is a MEDIUM evidence weakness rather than a
blocking one — no defect that the missing subagents would plausibly have caught
survived into the change set. Two further MEDIUM items (an `SA-FMT-001` import
grouping violation in both new test files, and two malformed TDD-evidence
fields) and two LOW items are recorded below.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2-tasks.md` |
| Component | `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E5-S2` (ahead 8 of `origin/main`) |
| HEAD | `8214fcc295d4cb3ac6b99ab2548687a7f7626fe1` |
| Review base | `origin/main` merge base `1a0556a67a0891de703a0a1eb28654c805f63aef` |
| Working tree | clean — `git status --porcelain --untracked-files=all` empty before and after validation |
| Changed files reviewed | 6 |

Commits in review set (`git log --oneline 1a0556a..HEAD`): `37a6ac9`, `10504d0`,
`05643b3`, `61b9689`, `b53b1c6`, `f073242`, `9ba5ace`, `8214fcc`. No staged,
unstaged, or untracked files existed at any point; branch state was not altered
(no checkout, fetch, reset, or index change was performed).

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/runs/journal.py` | added | T006; AC-23, DAC-E5-2, DAC-E5-3, DAC-E5-S2-1..6 |
| `tests/integration/test_run_queue.py` | added | T002, T003, T004, T007, T008 |
| `tests/unit/test_run_journal.py` | added | T005, T007, T008 |
| `docs/.../CAP-001-E5-S2.md` | modified | story bookkeeping: `status: planning → in-review`, `updated` date |
| `docs/.../CAP-001-E5-S2-tasks.md` | modified | T001–T008 checkbox state only (verified line-by-line in `git diff`) |
| `docs/.../CAP-001-E5-S2-tdd-evidence.yaml` | added | T008 evidence requirement |

No production file outside `src/factorflow/runs/journal.py` was touched. S1-owned
assets (`migrations/0003_coverage.sql`, `migrations/0004_runs.sql`,
`src/factorflow/runs/states.py`, `src/factorflow/runs/__init__.py`,
`tests/conftest.py`) are byte-identical to the merge base — the plan's explicit
"verify, do not recreate" constraint holds. No scope leakage found.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-23 | SATISFIED | `journal.py:16-20` `_REQUEST_SQL` always inserts `'requested'` (never rejects); `journal.py:26-37` `_CLAIM_SQL` `NOT EXISTS` + `ORDER BY requested_at` | `test_run_queue.py::test_request_queues_behind_active_run[running|cancelling]`, `::test_claim_returns_none_while_run_active[running|cancelling]`, `::test_claims_follow_request_order` | Queue-not-reject, start-only-after-terminal, and request order are each proved separately; the FIFO test terminalizes each predecessor before the next claim, so "starts only after the active run reaches a terminal state" is exercised, not assumed. |
| DAC-E5-2 | SATISFIED | `journal.py:76-79` — exactly one `cursor.execute` of `_CLAIM_SQL` inside one `connection.transaction()` | `test_run_journal.py::test_claim_next_maps_returned_row_in_one_statement` asserts `len(executed) == 1` and `transactions == 1`; integration `::test_claim_returns_none_while_run_active` | The "single statement" property is pinned by counting executes at the psycopg boundary, not by reading the source. No read-then-write window exists. |
| DAC-E5-3 | SATISFIED | `journal.py:26-37`; backstop `idx_acquisition_run_single_active` in `migrations/0004_runs.sql:29-30` (S1) | `test_run_queue.py::test_concurrent_claims_fail_on_unique_index` | Two connections, distinct candidates, loser provably blocks on the winner's pending index entry (`loser_done.wait(1.0) is False`), then raises `psycopg.errors.UniqueViolation` after commit; `_count_active() == 1` and the loser's candidate remains `requested`. |
| DAC-E5-S2-1 | SATISFIED | `ORDER BY requested_at LIMIT 1` at `journal.py:35` | `::test_claims_follow_request_order` | Rows are seeded out of insertion order (3rd, 1st, 2nd), so insertion-order or PK-order selection cannot pass. Independently confirmed by mutating to `ORDER BY requested_at DESC` → 2 tests fail. |
| DAC-E5-S2-2 | SATISFIED | `journal.py:80-81` maps no row to `None`, raising nothing | `test_run_journal.py::test_claim_next_returns_none_when_no_row`; `test_run_queue.py::test_claim_returns_none_when_nothing_requested`, `::test_claim_returns_none_while_run_active[running|cancelling]` | The S2-owned half (stable `None`, never an error) is satisfied. The "waits at the configured interval" half is allocated by the task plan's Resolved Conflicts to approved story CAP-001-E4-S5 (DAC-E4-S5-6), which is unimplemented — see IR-005. |
| DAC-E5-S2-3 | SATISFIED | `journal.py:27-29` sets `state`, `started_at`, `claimed_by`, `heartbeat_at` in the one `UPDATE` | `::test_successful_claim_sets_fields_and_returns_snapshot` asserts all four columns after the call, including `started_at == heartbeat_at` | Equality of `started_at` and `heartbeat_at` is what proves "in the same statement" rather than sequential writes; both come from one `now()` transaction timestamp. |
| DAC-E5-S2-4 | SATISFIED | `journal.py:36` `RETURNING run_id, history_depth_years`; `journal.py:82` maps `row[1]` | `::test_successful_claim_sets_fields_and_returns_snapshot` (row depth 7 while `owner_setting` states 2); `test_run_journal.py::test_claim_uses_snapshot_never_stated_depth` | The differing stated depth is the discriminator: an implementation that read the current setting would return 2 and fail. `journal.py` imports only `dataclasses`, `uuid`, `psycopg` — no settings dependency exists to re-read. |
| DAC-E5-S2-5 | SATISFIED | `FOR UPDATE SKIP LOCKED` at `journal.py:35` | `::test_claim_skips_locked_candidate` | A second connection holds `FOR UPDATE` on the oldest candidate; the claimer (opened with `lock_timeout=5000`) returns the *newer* row while the lock is still held. Independently confirmed: removing `SKIP LOCKED` makes the test fail with `LockNotAvailable` rather than hang. |
| DAC-E5-S2-6 | SATISFIED | `journal.py:22-24` `_ACTIVE_RUN_SQL`; `journal.py:58-65` insert and lookup in one `connection.transaction()` | `::test_request_queues_behind_active_run[running|cancelling]`, `::test_request_with_no_active_run_reports_no_queue`; `test_run_journal.py::test_request_run_returns_new_id_and_queued_behind_in_one_transaction`, `::test_request_run_reports_none_when_no_active_run` | The active row is compared field-by-field across all 13 `acquisition_run` columns before and after the request, so any incidental mutation of the active run fails the test. Both `running` and `cancelling` are covered. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/conftest.py:113` `migrated_run_schema_connection`, `:44` `postgres_connection_string`; `src/factorflow/runs/__init__.py`; `migrations/0003_coverage.sql`, `migrations/0004_runs.sql` | I re-verified every named prerequisite exists on this branch and is unmodified from the merge base. The plan's unresolved-S1 blocker is discharged: `acquisition_state` landed in `0003_coverage.sql` per the market-data-store design, and S1 is merged into `origin/main` (`c9580e3`). Commit `37a6ac9` records the verification with no code change, as the plan required. |
| T002 | complete | VERIFIED | `tests/integration/test_run_queue.py:99-130` | Both active states parametrized; distinct-row, `requested` state, stored depth, `queued_behind`, full active-row invariance, and the `None` case are each asserted. `# Implements TC-COMP-023, TC-COMP-265` present on both tests. |
| T003 | complete | VERIFIED | `tests/integration/test_run_queue.py:133-201` | Ordered `requested_at` seeds, claim-then-terminalize chain, ascending FIFO list equality, empty-queue `None`, `running`/`cancelling` `None`, and the four-field atomic write with returned snapshot depth are all present. Traceability comments cover TC-COMP-237, 260, 261, 262, 263. |
| T004 | complete | VERIFIED | `tests/integration/test_run_queue.py:204-313` | Both required scenarios exist on independent connections from `postgres_connection_string`: (a) held row lock skipped, (b) forced two-candidate race producing exactly one `UniqueViolation` and one active row. The valid-loser `None` path is retained (line 309) — see IR-004 on its placement. `# Implements TC-COMP-238` / `TC-COMP-264` present. |
| T005 | complete | VERIFIED | `tests/unit/test_run_journal.py:56-111` | Frozen-`ClaimedRun`, one-statement/one-transaction, bound `runner_id`, bound `history_depth_years`, both `queued_behind` shapes, `None` mapping, SQL-contract pins, and the "never calls `read_history_depth`" proof are all implemented. |
| T006 | complete | VERIFIED | `src/factorflow/runs/journal.py:40-82` | Frozen dataclass, both signatures exactly as the design's section 2.4 interface, typed psycopg boundary, bound parameters throughout (no string interpolation — `SEC-INJ-001` satisfied), claim SQL identical to design section 2.3, `None` on no row, no settings read. Scope is correctly limited: `heartbeat`, `cancel`, `finalise` belong to later stories and are absent. |
| T007 | complete | VERIFIED | Commit `9ba5ace`; no file diff, as expected for a run-only task | I reproduced the claim independently: `uv run pytest tests/unit/test_run_journal.py tests/integration/test_run_queue.py` → 16 passed; `uv run pytest` → 414 passed. No corrections to the three S2-owned files were needed, and none were made. The `None` journal signal is a plain return value with no runner-side coupling. See IR-003 on the entry's `commit_hash` field. |
| T008 | complete | VERIFIED | `CAP-001-E5-S2-tdd-evidence.yaml:150-197`; commit `9ba5ace` | All seven recorded mutants re-injected independently and all seven killed (table under Independent Validation). The claim "no strengthening required" is corroborated: every mutant already had a killing test. `git status` confirms nothing was left mutated. See IR-003 on the missing `tests_executed` field. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_request_queues_behind_active_run` / TC-COMP-023, TC-COMP-265 | ADEQUATE | Real PostgreSQL row; asserts the new id differs from the active id, the new row is `requested` with the supplied depth, `queued_behind` equals the active id, and the entire 13-column active row is unchanged. The full-row snapshot comparison is what makes this regression-sensitive: an added `UPDATE` on the active row fails it (independently confirmed). | none |
| `test_request_with_no_active_run_reports_no_queue` / TC-COMP-023, TC-COMP-265 | ADEQUATE | Negative path: `queued_behind is None` with the row persisted as `requested` at depth 3. | none |
| `test_claims_follow_request_order` / TC-COMP-237, TC-COMP-260 | ADEQUATE | Seeds out of insertion order, so only `ORDER BY requested_at` passes; asserts exact list equality `[first, second, third]` and a terminal `None`. Confirmed to fail under a `DESC` mutation. | none |
| `test_claim_returns_none_when_nothing_requested` / TC-COMP-237, TC-COMP-261 | ADEQUATE | Empty-queue boundary; asserts `None` rather than an exception. Confirmed to fail under a no-row-mapping mutation. | none |
| `test_claim_returns_none_while_run_active` / TC-COMP-237, TC-COMP-261 | ADEQUATE | Both active states; additionally asserts the queued row stays `requested`, so a claim that fired and rolled back would not pass silently. Confirmed to fail when `'cancelling'` is dropped from the guard. | none |
| `test_successful_claim_sets_fields_and_returns_snapshot` / TC-COMP-262, TC-COMP-263 | ADEQUATE | Writes a conflicting `owner_setting` depth (2) against a stored depth (7), so the snapshot contract is discriminating, not tautological; asserts all four claim fields and `started_at == heartbeat_at`. | none |
| `test_claim_skips_locked_candidate` / TC-COMP-264 | ADEQUATE | Two independent connections; the claim must *complete* while the oldest candidate's lock is held, with `lock_timeout=5000` converting a blocking regression into a bounded failure instead of a hang. Deterministic: the lock is acquired before the claim is issued. | Bundles the post-release `None` assertion — see IR-004. |
| `test_concurrent_claims_fail_on_unique_index` / TC-COMP-238 | ADEQUATE | Genuine two-connection race with a deterministic schedule: the winner's claim is held uncommitted, the loser passes the `NOT EXISTS` guard against the committed snapshot, skips the locked candidate, and blocks on the pending unique-index entry. `wait(1.0) is False` proves it blocked (and errs toward passing under load, so it is not flaky); `UniqueViolation` count, one active row, and the loser's candidate still `requested` are all asserted. | Bundles the valid-loser `None` path — see IR-004. |
| `test_claimed_run_is_frozen` | ADEQUATE | Asserts `dataclasses.FrozenInstanceError` on mutation — the actual immutability contract, not the decorator's presence. | none |
| `test_claim_next_maps_returned_row_in_one_statement` | ADEQUATE | Recording fake counts exactly one execute and one transaction and checks the bound parameter dict. The SQL substring pins (`NOT EXISTS`, `ORDER BY requested_at`, `FOR UPDATE SKIP LOCKED`, `RETURNING run_id, history_depth_years`) are contract assertions the task plan explicitly requested; the real semantics are proved by the PostgreSQL tests, so this is not a substitute for behavior coverage. | none |
| `test_claim_next_returns_none_when_no_row` | ADEQUATE | Empty fake result maps to `None`. Confirmed to fail under a zero-UUID mutation. | none |
| `test_request_run_returns_new_id_and_queued_behind_in_one_transaction` | ADEQUATE | Asserts the returned tuple, one transaction, and the bound `(5,)` insert parameter. | none |
| `test_request_run_reports_none_when_no_active_run` | ADEQUATE | Fake returns no active row; result is `(new_id, None)`. | none |
| `test_claim_uses_snapshot_never_stated_depth` | ADEQUATE | The monkeypatch alone would not catch an indirect read, but the accompanying `"read_history_depth" not in vars(journal)` check makes the assertion real, and the integration test proves the behavior end-to-end. | Monkeypatch half is decorative; harmless. |

Fixtures and mocks do not bypass the unit under test: the unit-level fakes sit
strictly at the psycopg cursor/connection seam and the production functions run
unmodified; every behavioral claim also has a real-PostgreSQL test. Isolation is
sound — `postgres_connection_string` creates and drops a fresh database per test
inside one session container, and every connection opened by the contention
tests is closed in a `finally`. No test depends on wall-clock time for its
outcome, on network access beyond the local container, or on execution order.

## Independent Validation

All commands run in `repos/factorflow-v2/FactorFlow-v2` on HEAD `8214fcc` with a
clean tree. Docker was available, so no `-m 'not postgres'` fallback was needed
and no required command was substituted with a narrower one.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 44 packages; checked 41 packages. |
| `uv run pytest tests/unit/test_run_journal.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 6 passed in 0.01s. |
| `uv run pytest -m postgres tests/integration/test_run_queue.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 10 passed in 5.14s (PostgreSQL 16 testcontainer). |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 414 passed, 2 warnings in 22.62s; the two warnings are pre-existing third-party deprecations from `starlette`/`fastapi`, unrelated to this change. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 116 files already formatted. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 34 source files (strict mode). |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl` built into the git-ignored `dist/`. |

### Independent Mutation Re-verification

The coding agent's mutation log was not trusted. Each mutant was re-injected
into a copy of the package at `/tmp/mutcheck/factorflow` placed ahead of the
editable install on `PYTHONPATH`, so the reviewed repository was never modified
(verified: `git status --porcelain --untracked-files=all` empty afterwards, and
the temporary copy deleted).

| Mutant | Killed by | Result |
|--------|-----------|--------|
| `ORDER BY requested_at` → `ORDER BY requested_at DESC` | `test_claims_follow_request_order`, `test_concurrent_claims_fail_on_unique_index` | KILLED (2 failed) |
| `FOR UPDATE SKIP LOCKED` → `FOR UPDATE` | `test_claim_skips_locked_candidate` (`LockNotAvailable`) | KILLED (1 failed) |
| Claim guard `state IN ('running','cancelling')` → `('running')` | `test_claim_returns_none_while_run_active[cancelling]` (`UniqueViolation`) | KILLED (1 failed) |
| Returned depth `row[1]` → literal `1` | `test_successful_claim_sets_fields_and_returns_snapshot`, `test_claim_skips_locked_candidate`, `test_concurrent_claims_fail_on_unique_index` | KILLED (3 failed) |
| No-row mapping `None` → zero-UUID `ClaimedRun` | `test_claim_next_returns_none_when_no_row` plus 6 integration `None` paths | KILLED (7 failed) |
| `_ACTIVE_RUN_SQL` `('running','cancelling')` → `('running')` | `test_request_queues_behind_active_run[cancelling]` | KILLED (1 failed) |
| `request_run` additionally bumps `heartbeat_at` on the active row | `test_request_queues_behind_active_run[running]` and `[cancelling]` | KILLED (2 failed) |

All seven mutants recorded in the TDD evidence are genuinely killed. Mutation
kill evidence is therefore corroborated rather than accepted (`TEST-TDD-005`,
`TEST-TDD-006`).

### Validation Side Effects

- Before: `usr/alvaro-de-jodra/CAP-001-E5-S2` @ `8214fcc`, `git status --porcelain --untracked-files=all` empty.
- After: `usr/alvaro-de-jodra/CAP-001-E5-S2` @ `8214fcc`, `git status --porcelain --untracked-files=all` empty.
- Unexpected tracked-file changes: none. `uv build` wrote `dist/` and `build/`, both git-ignored; `__pycache__` directories are likewise ignored. No validation command modified a review-relevant file, so the review set did not change after validation.

## Findings

| Finding | Severity | Title |
|---------|----------|-------|
| IR-001 | MEDIUM | Per-task independent review and spec-drift subagents were not dispatched; self-review was substituted |
| IR-002 | MEDIUM | Both new test files violate SA-FMT-001 import grouping |
| IR-003 | MEDIUM | Two TDD-evidence entries are malformed against TEST-TDD-008 |
| IR-004 | LOW | Two contention tests each bundle a second behavior |
| IR-005 | LOW | DAC-E5-S2-2's wait half is unprovable in this repository until CAP-001-E4-S5 lands |

### IR-001 — Per-task independent review and spec-drift subagents were not dispatched; self-review was substituted

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (process evidence)
- **Tasks**: T001–T008 (the plan's "Per-Task Commit Gate")
- **Files**: `docs/.../CAP-001-E5-S2-tdd-evidence.yaml:2-9` (`notes`), and the `staged_diff_review` / `spec_drift_verification` field of every cycle entry
- **Claim challenged**: That each task's `staged_diff_review: PASS` and `spec_drift_verification: drift_detected: false` verdicts satisfy the task plan's requirement to "dispatch an independent code-review subagent" and "dispatch an independent spec-drift verify subagent" before each commit.
- **Observed evidence**: The evidence file discloses that no subagent was dispatched — "the runtime for this execution provides no subagent-dispatch mechanism, so the independent subagent the task plan names was substituted with a checklist review" performed by the coding agent itself. Every per-task verdict is therefore self-issued by the author of the diff. The disclosure is transparent and was not hidden behind a green claim.
- **Expected evidence/behavior**: `CAP-001-E5-S2-tasks.md` lines 128-129 require an independently dispatched review and spec-drift verification per task, with verdicts recorded before the commit.
- **Impact**: The intended two-actor check inside the coding loop degenerated to a one-actor check, removing the loop's early defect-detection layer and leaving this gate as the first independent inspection. Concretely bounded: I found no correctness, spec-fidelity, or scope defect that the missing subagents would plausibly have caught, and `CONST-REV` (Review Constitution, "an independently verified claim is one checked against fresh evidence rather than accepted from a prior assertion. It does not mean a different person must perform the check.") does not require a separate actor under `owner-allowed`. This is why the finding is MEDIUM and not HIGH: no required test, validation, or behavior is missing — only the redundancy of the in-loop check.
- **Required remediation**: No rework of this story's code is required. For subsequent stories, either run the coding agent in a runtime that provides subagent dispatch, or amend the task-plan template's per-task commit gate so the fallback (self-review against named constitutions, explicitly labeled) is the documented, permitted path rather than an ad-hoc substitution. Record the chosen option as a decision record so future evidence files do not have to re-justify it.

### IR-002 — Both new test files violate SA-FMT-001 import grouping

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T002, T005
- **Files**: `tests/integration/test_run_queue.py:13-20`, `tests/unit/test_run_journal.py:14-17`
- **Claim challenged**: That the new test files follow the repository's established import conventions (the coding agent's T002/T005 self-reviews recorded no import issue).
- **Observed evidence**: In `test_run_queue.py`, `from factorflow.runs.journal import ClaimedRun, claim_next, request_run` (line 15) sits inside the third-party block between `import pytest` and `from psycopg.types.json import Json`, while `from factorflow.db.migrator import ...` (line 18) and `from factorflow.instruments.settings import ...` (line 19) sit in a separate later block. `test_run_journal.py` has the same split (line 15 vs line 17). `ruff check .` does not flag it because the blank line makes each block internally sorted. Every other integration test in the repository (24 files inspected via `grep -n "^from factorflow"`) keeps all `factorflow` imports in a single first-party block — this change set is the only place the pattern is broken.
- **Expected evidence/behavior**: `CONST-SA` / `SA-FMT-001` (Medium): "Imports must be organized by category (standard library, third-party, internal), alphabetized within groups." The adversarial-review skill additionally requires consistency with nearby established patterns.
- **Impact**: Cosmetic but real: the same package appears in two categories within one file, which misleads future readers about dependency direction and diverges from the convention every other test file follows. No functional effect.
- **Required remediation**: Move `from factorflow.runs.journal import ...` into the existing first-party block in both files so all `factorflow.*` imports are grouped and alphabetized together. Re-run `uv run ruff check .` and `uv run ruff format --check .`.

### IR-003 — Two TDD-evidence entries are malformed against TEST-TDD-008

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (process evidence)
- **Tasks**: T007, T008
- **Files**: `docs/.../CAP-001-E5-S2-tdd-evidence.yaml:149` and `:150-197`
- **Claim challenged**: That the per-cycle evidence entries satisfy the inter-cycle evidence gate the task plan invokes.
- **Observed evidence**: The `t007-integration-run` entry records `commit_hash: "none — run-only task produced no file diff"`, which is prose rather than a commit hash; the `t008-mutation-strengthening` entry omits `tests_executed` entirely even though it records seven executed mutation runs. Substantively the work is traceable — T007's integration run and T008's evidence were both committed as `9ba5ace` ("T007+T008 — integration run and mutation evidence"), and I independently reproduced both the 414-test run and all seven mutant kills — so this is a field-hygiene defect, not a missing-evidence defect.
- **Expected evidence/behavior**: `CONST-TEST` / `TEST-TDD-008`: "A new TDD cycle MUST NOT begin until the preceding cycle's tdd-evidence entry contains `tests_executed: true` and a non-empty `commit_hash`."
- **Impact**: An automated evidence audit reading these fields would either reject the file or silently accept a non-hash string as a commit reference. Because the underlying executions and commits do exist and were independently verified here, the risk is to machine auditability, not to the truth of the record.
- **Required remediation**: Set `commit_hash: 9ba5ace` on the `t007-integration-run` entry (the commit that carries its result), with the "no file diff" explanation moved into the existing `note` field, and add `tests_executed: true` to the `t008-mutation-strengthening` entry.

### IR-004 — Two contention tests each bundle a second behavior

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-3, DAC-E5-S2-5
- **Tasks**: T004
- **Files**: `tests/integration/test_run_queue.py:262-263`, `tests/integration/test_run_queue.py:307-309`
- **Claim challenged**: That T004's instruction to "separately retain coverage for the valid loser path that returns `None` after observing the winner" was implemented as separate coverage.
- **Observed evidence**: `test_claim_skips_locked_candidate` asserts the skip behavior and then, after `locker.rollback()`, also asserts the post-release `None` and the older row's state. `test_concurrent_claims_fail_on_unique_index` asserts the forced race and then also asserts the post-commit valid-loser `None` (line 309). Both trailing behaviors are covered — nothing is missing — but they live inside the race tests rather than in their own test functions. (`test_claims_follow_request_order` similarly ends with an extra terminal `None` assertion at line 155.)
- **Expected evidence/behavior**: `CONST-TEST` / `TEST-QUAL-001` (Medium): "Each test must validate one behavior or one failure mode; unrelated assertions must be split." T004's wording ("separately retain") points the same way. The plan's "Resolved Conflicts" note, however, uses "separately" to mean *separate schedules, not one ambiguous assertion*, which the implementation does honor — hence LOW rather than MEDIUM.
- **Impact**: A failure in the trailing assertion is attributed to the race test, making triage slightly slower; the two concerns cannot be run or skipped independently.
- **Required remediation**: Optional. If addressed, extract the post-release and post-commit `None` assertions into their own named tests (for example `test_claim_returns_none_after_winner_commits`) reusing the existing helpers, leaving each race test with a single behavior.

### IR-005 — DAC-E5-S2-2's wait half is unprovable in this repository until CAP-001-E4-S5 lands

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-S2-2
- **Tasks**: T003, T005, T006
- **Files**: `docs/.../CAP-001-E5-S2.md:71`; `docs/.../CAP-001-E5-S2-tasks.md:173`; `docs/.../CAP-001-E5-S2-tdd-evidence.yaml:198-207`
- **Claim challenged**: That DAC-E5-S2-2 ("...receives no row **and waits at the configured interval** rather than erroring") is fully demonstrated by this story.
- **Observed evidence**: S2 proves the "receives no row / does not error" half in five tests. The "waits at the configured interval" half is allocated by the task plan's Resolved Conflicts to approved story CAP-001-E4-S5 / DAC-E4-S5-6 (confirmed present at `.../point-in-time-acquisition/stories/CAP-001-E4-S5.md:78`), whose implementation does not yet exist — the evidence file states this plainly, and I confirmed `tests/integration/test_runner_credential.py` and `tests/unit/test_ingestion_main.py` are absent from the repository.
- **Expected evidence/behavior**: The cross-story allocation is legitimate and documented; TC-COMP-261 remains fully owned across the pair, not narrowed. I record it so the capability-level coverage claim is not read as complete on the strength of S2 alone.
- **Impact**: None on this story. Risk is that TC-COMP-261 is marked "Covered" in `tests/coverage-matrix.md` while only half the criterion is executable today.
- **Required remediation**: None for S2. Carry this forward: CAP-001-E4-S5's review must confirm the configured-wait loop consumes S2's `None` signal, and doc-sync should not record DAC-E5-S2-2 as end-to-end proven until that story lands.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviation**: The task plan's per-task commit gate names an independent subagent; an in-session self-review was substituted and disclosed. Recorded as IR-001 rather than treated as a silent deviation, because the evidence file states it explicitly and `CONST-REV` does not require a second actor under `owner-allowed`.
- **Justified deviation**: T007 produced no file diff and therefore no dedicated commit; its result rides in `9ba5ace` alongside T008. Legitimate for a run-only task, but the evidence field records it as prose instead of the hash (IR-003).
- **Bookkeeping**: All eight task checkboxes are checked and all eight are independently verified — no checked-but-unimplemented and no unchecked-but-implemented task. The story's `status` advanced `planning → in-progress → in-review` across the branch, consistent with the pipeline stage. The tasks file frontmatter remains `status: draft`, matching the established pattern in this epic (CAP-001-E5-S1-tasks.md is also `draft` after completion); not raised as a finding.
- **Scope leakage**: None. The only production file added is the one the plan names. No dependency, configuration, migration, or unrelated refactor accompanies the change; `pyproject.toml`, `tests/conftest.py`, and all S1-owned files are untouched.
- **Security review**: All SQL uses bound parameters (`%s` / `%(runner_id)s`) with no string interpolation of values (`SEC-INJ-001` satisfied). No secrets, logging, or externally reachable surface is introduced. The `assert inserted is not None` guard at `journal.py:62` follows existing repository precedent (`instruments/service.py:166`, `api/routes/settings.py:40`) and is a type-narrowing aid for an `INSERT ... RETURNING` that cannot yield no row; not raised as a finding.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to doc-sync for CAP-001-E5-S2 with IR-001 through IR-005 recorded as accepted warnings. IR-002 and IR-003 are cheap, low-risk corrections that may be folded into the doc-sync or a later cleanup commit; neither blocks the gate. IR-005 must be carried into the CAP-001-E4-S5 review.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (MEDIUM), IR-003 (MEDIUM), IR-004 (LOW), IR-005 (LOW)
