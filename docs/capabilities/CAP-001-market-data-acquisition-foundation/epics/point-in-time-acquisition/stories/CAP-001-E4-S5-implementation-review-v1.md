---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S5-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-22
updated: 2026-09-22
story_id: "CAP-001-E4-S5"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S5.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-22T23:42:56Z"
reviewed_head: "a7479c19afb9d21915c711dc330b4a245798760c"
review_base: "7428122ea82d85644210c2f8112d11ce95ff3e54"
reviewed_state_revision: "sha256:e2acb0e2f68ab8be12ede7a4fe20172403fcd08d04970c45e70e1021381f8a46"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E4-S5
    artifact_version: 1
    content_revision: sha256:dbdaa4bf6d4849f88bd73b8381b387f40bf25a1f8ed32954e67e562adaf72cb3
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-4-6
  tool: Claude Code
  tool_version: unknown
  timestamp: "2026-09-22T23:42:56Z"
  source_artifacts:
    - id: CAP-001-E4-S5
      version: "1"
    - id: CAP-001-E4-S5-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E4-S5 --- Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 3 |
| Low findings | 1 |
| Acceptance criteria | 13/14 satisfied |
| Planned tasks | 11/12 verified |
| Required validation | 4/5 passed |

The implementation delivers a well-structured acquisition runner that correctly orchestrates claiming, roster-snapshotting, heartbeat/cancellation, per-instrument fetching, and finalisation, and all 120 postgres-marked tests pass. Two high-severity findings block the gate: the runner contains direct SQL INSERT statements into tables owned by the writer and journal modules, violating the component design's security constraint that "the runner builds no SQL" (SEC-INP-002), and the entrypoint does not wire the `CredentialAwareClientFactory` that the runner defines and tests exercise, so the credential-fingerprint comparison required by DAC-E4-S5-7 is not active in production.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S5.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S5-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E4-S5` |
| HEAD | `a7479c19afb9d21915c711dc330b4a245798760c` |
| Review base | `main / 7428122ea82d85644210c2f8112d11ce95ff3e54` |
| Working tree | clean |
| Changed files reviewed | 16 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../CAP-001-E4-S5-tasks.md` | modified | Task checkbox updates; T001-T012 |
| `docs/.../CAP-001-E4-S5.md` | modified | Status change to in-review |
| `src/factorflow/ingestion/runner.py` | added | T007, T008, T009; AC-3, AC-4, AC-11, DAC-E4-12 through DAC-E4-S5-8 |
| `src/factorflow/ingestion_main.py` | added | T010; DAC-E4-S5-6 |
| `src/factorflow/runs/journal.py` | modified | T007-T009 (heartbeat, cancellation_requested, finalise); DAC-E4-S5-1 through DAC-E5-4 |
| `tests/conftest.py` | modified | T001; migrated_runner_connection fixture |
| `tests/integration/test_runner_acquires.py` | added | T002; TC-COMP-003, TC-COMP-146 |
| `tests/integration/test_runner_cancel.py` | added | T003; TC-COMP-019, TC-COMP-175, TC-COMP-176 |
| `tests/integration/test_runner_credential.py` | added | T004; TC-COMP-023, TC-COMP-180, TC-COMP-181, TC-COMP-301 |
| `tests/integration/test_runner_depth.py` | added | T002; TC-COMP-147 |
| `tests/integration/test_runner_isolation.py` | added | T003; TC-COMP-009, TC-COMP-011, TC-COMP-178, TC-COMP-179 |
| `tests/integration/test_runner_reclaim.py` | added | T003; TC-COMP-177, TC-COMP-245, TC-COMP-248 |
| `tests/integration/test_runner_transactions.py` | added | T002; TC-COMP-004, TC-COMP-148 |
| `tests/integration/test_runner_volume.py` | added | T005; TC-COMP-182 |
| `tests/unit/test_ingestion_main.py` | added | T006; TC-COMP-301 |
| `tests/unit/test_runner_reason.py` | added | T006; TC-COMP-178, TC-COMP-009 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-3 | SATISFIED | `runner.py:260-306` fetches all four data types and writes via `write_instrument` | `test_runner_acquires.py::test_runner_acquires_all_four_data_types` | Confirmed four result rows per instrument |
| AC-4 | SATISFIED | `runner.py:234` sequential loop over `instrument_ids` | `test_runner_volume.py::test_3000_instrument_run_no_payload_accumulation` | 3000 instruments, 12000 result rows |
| AC-11 | SATISFIED | `runner.py:267-285` catches `InstrumentNotFound` and `ProviderUnavailable`, records, continues | `test_runner_isolation.py::test_not_found_instrument_is_recorded_and_run_continues` | Error recorded, next instrument reached |
| DAC-E4-12 | SATISFIED | `runner.py:195-210` receives pre-snapshotted `instrument_ids` | `test_runner_acquires.py::test_roster_read_once_at_claim` | Roster read at caller level, not inside runner |
| DAC-E4-13 | SATISFIED | `runner.py:212-224` returns immediately on `None` depth, sets state to `failed` | `test_runner_depth.py::test_no_depth_finalises_failed_without_provider_calls` | No provider calls made |
| DAC-E4-14 | SATISFIED | `runner.py:298-305` each instrument wrapped in `connection.transaction()` | `test_runner_transactions.py::test_committed_instrument_survives_simulated_interruption` | First instrument durable after simulated interruption |
| DAC-E4-S5-1 | SATISFIED | `runner.py:236-243` heartbeat and cancellation check at top of iteration | `test_runner_cancel.py::test_heartbeat_and_cancellation_occur_together` | Both checks at same point |
| DAC-E4-S5-2 | SATISFIED | `runner.py:242-246` cancellation finalises and returns | `test_runner_cancel.py::test_cancellation_stops_before_next_instrument` | Second instrument not reached |
| DAC-E4-S5-3 | SATISFIED | `runner.py:237-240` false heartbeat causes immediate return | `test_runner_reclaim.py::test_reclaimed_run_stops_without_further_writes` | No writes after lost claim |
| DAC-E4-S5-4 | SATISFIED | `runner.py:267-285` catches typed errors, records per-instrument result | `test_runner_isolation.py::test_not_found_instrument_is_recorded_and_run_continues`, `test_provider_unavailable_is_recorded_and_run_continues` | Both InstrumentNotFound and ProviderUnavailable |
| DAC-E4-S5-5 | SATISFIED | `runner.py:308` calls `finalise(connection, run_id)` with no outcome argument | `test_runner_isolation.py::test_run_outcome_derived_from_written_results` | Outcome derived by journal.finalise |
| DAC-E4-S5-6 | SATISFIED | `runner.py:356-381` `run_polling_loop` waits `poll_interval_seconds` on empty claim | `test_runner_credential.py::test_empty_claim_waits_poll_interval_then_polls_again` | Wait durations match interval |
| DAC-E4-S5-7 | PARTIAL | `runner.py:69-91` `CredentialAwareClientFactory` implemented correctly | `test_runner_credential.py::test_changed_credential_rebuilds_client` | See IR-001: factory is tested but not wired into the production entrypoint |
| DAC-E4-S5-8 | SATISFIED | `runner.py:234` sequential loop, one instrument at a time | `test_runner_volume.py::test_3000_instrument_run_no_payload_accumulation` | Progress observable at checkpoints |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/conftest.py:151-175` `migrated_runner_connection` fixture | `__init__.py` pre-existed from prior stories |
| T002 | complete | VERIFIED | `test_runner_acquires.py`, `test_runner_depth.py`, `test_runner_transactions.py` | TC-COMP-003, TC-COMP-004, TC-COMP-146, TC-COMP-147, TC-COMP-148 traced |
| T003 | complete | VERIFIED | `test_runner_isolation.py`, `test_runner_cancel.py`, `test_runner_reclaim.py` | TC-COMP-009, TC-COMP-011, TC-COMP-019, TC-COMP-175-179, TC-COMP-239, TC-COMP-245, TC-COMP-248 traced |
| T004 | complete | VERIFIED | `test_runner_credential.py`, `test_ingestion_main.py` | TC-COMP-023, TC-COMP-180, TC-COMP-181, TC-COMP-301 traced |
| T005 | complete | VERIFIED | `test_runner_volume.py` | TC-COMP-182 traced; 3000-instrument run completes |
| T006 | complete | VERIFIED | `test_runner_reason.py`, `test_ingestion_main.py` | Reason redaction and API isolation verified |
| T007 | complete | VERIFIED | `runner.py:169-228` AcquisitionRunner constructor and claim/depth/roster handling | Claim, credential, depth, roster all present |
| T008 | complete | VERIFIED | `runner.py:234-306` sequential instrument loop with heartbeat/cancellation/fetch/write | Matches task description |
| T009 | complete | VERIFIED | `runner.py:267-308` error mapping and finalise call | Error types mapped; finalise receives only run_id |
| T010 | complete | VERIFIED | `ingestion_main.py:40-94` main function, Settings loading, dependency construction | Non-zero exit on config failure verified by test |
| T011 | complete | PARTIAL | Tests all pass; mutation testing claimed as done | No mutation evidence in the repository; task requires manual mutation and restore, which is not observable in the committed state |
| T012 | complete | VERIFIED | `uv run pytest -m postgres` 120 passed; `ruff check` passed; `ruff format` passed; `mypy src` passed | `uv build` could not be confirmed due to sandbox restrictions |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_runner_acquires_all_four_data_types` / TC-COMP-003 | ADEQUATE | Asserts exactly 4 result rows covering all data types for one instrument | None |
| `test_roster_read_once_at_claim` / TC-COMP-146 | ADEQUATE | Inserts a second instrument after roster snapshot; asserts it is absent from results | None |
| `test_cancellation_stops_before_next_instrument` / TC-COMP-019, TC-COMP-176 | ADEQUATE | Sets cancelling mid-fetch; asserts first committed, second not reached, state cancelled | None |
| `test_heartbeat_and_cancellation_occur_together` / TC-COMP-175 | WEAK | Only asserts that the run reaches a terminal state; does not independently verify that heartbeat_at advanced or that cancellation was checked at the same point | Temporal assertion is indirect |
| `test_reclaimed_run_stops_without_further_writes` / TC-COMP-177, TC-COMP-248 | ADEQUATE | Abandons run after first fetch; asserts second instrument not reached | None |
| `test_heartbeat_checked_before_each_instrument` / TC-COMP-245 | ADEQUATE | Abandons before first iteration; asserts zero writes and zero provider calls | None |
| `test_not_found_instrument_is_recorded_and_run_continues` / TC-COMP-011, TC-COMP-178 | ADEQUATE | First instrument raises InstrumentNotFound; asserts not_found outcome and second instrument written | None |
| `test_provider_unavailable_is_recorded_and_run_continues` / TC-COMP-178 | ADEQUATE | First instrument raises ProviderUnavailable; asserts failed outcome and second continues | None |
| `test_run_outcome_derived_from_written_results` / TC-COMP-009, TC-COMP-179 | ADEQUATE | All-success case; asserts terminal state is succeeded or partial | None |
| `test_run_with_partial_failures_is_partial` / TC-COMP-009, TC-COMP-179 | ADEQUATE | One InstrumentNotFound; asserts state is partial | None |
| `test_no_depth_finalises_failed_without_provider_calls` / TC-COMP-147 | ADEQUATE | depth_years=None; asserts failed state, zero provider calls, zero result rows | None |
| `test_run_completes_multiple_instruments` / TC-COMP-004 | ADEQUATE | Three instruments; asserts all reached | None |
| `test_committed_instrument_survives_simulated_interruption` / TC-COMP-148 | ADEQUATE | First instrument committed in run 1; second handled by run 2 | Transaction isolation confirmed |
| `test_empty_claim_waits_poll_interval_then_polls_again` / TC-COMP-023, TC-COMP-180 | ADEQUATE | StopIteration after 2 empty polls; asserts wait durations equal poll_interval | None |
| `test_changed_credential_rebuilds_client` / TC-COMP-181, TC-COMP-301 | ADEQUATE | Verifies factory builds once on first key, skips on same key, rebuilds on changed key | Tests the factory in isolation -- see IR-001 for the wiring gap |
| `test_unchanged_credential_preserves_existing_client` / TC-COMP-181, TC-COMP-301 | ADEQUATE | Three calls with same key; asserts build_count is 1 and all return same object | None |
| `test_3000_instrument_run_no_payload_accumulation` / TC-COMP-182 | ADEQUATE | 3000 instruments; asserts 12000 result rows and strictly increasing checkpoint counts | None |
| `test_not_found_reason_is_safe_string` / TC-COMP-178 | ADEQUATE | Asserts reason contains not_found, symbol, and data_type | None |
| `test_provider_unavailable_reason_redacts_message` / TC-COMP-178 | ADEQUATE | Passes a secret through redact; asserts secret absent from reason | None |
| `test_credential_rejected_uses_fixed_description` / TC-COMP-178 | ADEQUATE | Asserts fixed description, raw credential not in output | None |
| `test_main_exits_nonzero_on_configuration_failure` / TC-COMP-301 | ADEQUATE | Removes env vars; asserts non-zero exit code | None |
| `test_ingestion_main_does_not_import_api` / TC-COMP-301 | ADEQUATE | Checks sys.modules for factorflow.api after importing ingestion_main | None |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 138 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues found in 39 source files |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 120 passed, 387 deselected in 39.82s |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Sandbox restrictions prevented execution; all other required commands passed |

### Validation Side Effects

- Before: working tree clean
- After: working tree clean
- Unexpected tracked-file changes: none

## Findings

### IR-001 --- Entrypoint does not wire CredentialAwareClientFactory; fingerprint comparison inactive in production

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S5-7
- **Tasks**: T007, T010
- **Files**: `src/factorflow/ingestion_main.py:72-86`, `src/factorflow/ingestion/runner.py:69-91`
- **Claim challenged**: DAC-E4-S5-7 requires "the provider client is rebuilt before the first fetch" only when the credential changes; the task plan's T007 requires "reload and fingerprint the credential at claim time, rebuild MassiveClient only when the fingerprint changes".
- **Observed evidence**: `ingestion_main.py` line 78 calls `_build_client(settings)` unconditionally on every `execute_fn` invocation, constructing a new `MassiveClient` and `RateLimitGovernor` on every run. The `CredentialAwareClientFactory` class is defined in `runner.py` (lines 69-91), exported in `__all__`, and tested in `test_runner_credential.py`, but it is never imported or used by `ingestion_main.py`.
- **Expected evidence/behavior**: The entrypoint should use `CredentialAwareClientFactory` to compare the credential fingerprint and rebuild the client only when it changes, preserving the connection pool across runs with unchanged credentials (component design section 2.5, test table row "An unchanged credential keeps one client").
- **Impact**: Every claimed run discards and rebuilds the SDK connection pool unnecessarily. The component design's test matrix at section 7 explicitly requires "Two consecutive runs with the same key reuse one SDK RESTClient rather than discarding the connection pool." The tested behavior (factory works correctly) never executes in the production path.
- **Required remediation**: Wire `CredentialAwareClientFactory` into `ingestion_main.py` so that the fingerprint comparison is active in the production polling loop.

### IR-002 --- Runner contains direct SQL INSERT statements violating SEC-INP-002

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-11, DAC-E4-S5-4
- **Tasks**: T009
- **Files**: `src/factorflow/ingestion/runner.py:131-162` (`_write_error_results`)
- **Claim challenged**: Component design section 4 (Security): "All writes go through observation-writer and run-journal, both parameterised. The runner builds no SQL." Task plan Resolved Conflicts: "the runner maps typed provider failures into writer-facing result input rather than inserting journal rows directly."
- **Observed evidence**: `_write_error_results` (runner.py lines 131-162) executes raw SQL `INSERT INTO run_instrument_result` and `INSERT INTO acquisition_state` directly from the runner module. These are the same tables written by `writer.py` (lines 432-447 for `run_instrument_result`, lines 419-430 for `acquisition_state`). The runner builds SQL strings and uses `connection.cursor().execute()` directly.
- **Expected evidence/behavior**: Per the component design's SEC-INP-002 constraint and the task plan's own resolved conflict, the runner should delegate error-result recording to a function in the writer or journal module rather than containing its own SQL. The writer currently disclaims error-path results ("they belong to CAP-001-E4-S6"), but the resolution should be to extend the writer or journal interface rather than to embed SQL in the runner.
- **Impact**: The security invariant that the runner builds no SQL is violated. While the SQL uses bound parameters (mitigating injection risk), the architectural boundary is breached: two modules now own the schema for the same tables, creating a maintenance risk where a schema change to `run_instrument_result` or `acquisition_state` must be synchronized across both `runner.py` and `writer.py`. Additionally, the duplicated `acquisition_state` upsert logic between runner and writer may diverge.
- **Required remediation**: Move error-result recording out of `runner.py` into the writer or journal module, or into the `outcomes.py` module the design specifies at section 2.1 but which does not exist in this implementation. The runner must not contain SQL statements.

### IR-003 --- Error reason redaction uses identity function instead of runtime-config redaction

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-11, DAC-E4-S5-4
- **Tasks**: T009
- **Files**: `src/factorflow/ingestion/runner.py:231`, `src/factorflow/ingestion/runner.py:269`, `src/factorflow/ingestion/runner.py:279`
- **Claim challenged**: Component design section 4: "the runner passes every reason through runtime-config's redaction before writing it (AC-13)."
- **Observed evidence**: `runner.py` line 231 defines `_no_redact` as `lambda s: s` and passes it to `compose_failure_reason` at lines 269 and 279. The comment says "runner owns no credential," but the design requires runtime-config redaction, not an identity function.
- **Expected evidence/behavior**: The runner should accept or construct a redaction callable from runtime-config and pass it to `compose_failure_reason`. `CredentialRejected` uses a fixed description (verified by test), but `ProviderUnavailable` messages pass through `_no_redact` unchanged, meaning a provider error containing credential material would be stored raw.
- **Impact**: If a provider error message ever contains credential material (e.g., in a URL or error detail), it would be stored in `run_instrument_result.reason` without redaction. The `compose_failure_reason` function's `redact` parameter exists specifically for this purpose.
- **Required remediation**: Replace `_no_redact` with the runtime-config redaction callable, or accept an injected redaction function from the entrypoint.

### IR-004 --- outcomes.py module absent from implementation

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009
- **Files**: Component design section 2.1
- **Claim challenged**: Component design section 2.1 specifies `src/factorflow/ingestion/outcomes.py` as "per-instrument outcome classification." The story references CAP-001-E4-S6 for outcome classification.
- **Observed evidence**: No `outcomes.py` file exists in the change set or the repository. The outcome classification logic is embedded directly in `runner.py` (`_write_error_results`) and `journal.py` (`finalise`). The story's dependency list references CAP-001-E4-S6 at Technical Details step 3.
- **Expected evidence/behavior**: CAP-001-E4-S6 is still in `planning` status and owns per-instrument outcome classification. The task plan's resolved conflict explicitly assigns result insertion to `writer.py`, not to the runner. The runner has pulled forward result-writing that architecturally belongs to S6.
- **Impact**: When S6 is implemented, the error-result writing in `runner.py` will need to be relocated, creating rework. The component design's placement table is not followed for this module.
- **Required remediation**: Either move error-result recording to a module that S6 can own (journal, writer, or outcomes.py), or document this as an explicit deviation from the design's placement table with a reference to S6's future scope.

### IR-005 --- No-depth path in runner bypasses journal.finalise

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-13
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/runner.py:212-224`
- **Claim challenged**: DAC-E4-S5-5 requires "the outcome is computed from what was written rather than from what was requested." DAC-E5-4 requires finalisation through `run-journal.finalise`.
- **Observed evidence**: When `depth_years is None`, `runner.py` lines 215-223 execute a direct SQL `UPDATE acquisition_run SET state = 'failed'` rather than calling `journal.finalise(connection, run_id)`. This is a second instance of the runner writing SQL directly (see IR-002), and it bypasses the journal's finalise logic.
- **Expected evidence/behavior**: The no-depth path should call `journal.finalise` (which would derive `failed` from the zero-results count) or a dedicated journal function for this error case. The journal module already handles the "no instrument reached" case in `finalise` (line 203), which would produce the same `failed` result.
- **Impact**: If the finalise logic is extended in S6 (e.g., to record a failure reason or update counters), the no-depth path will not benefit from the change. The runner's SQL for this path duplicates the journal's concern.
- **Required remediation**: Replace the direct SQL in the no-depth path with a call to `journal.finalise` or a dedicated journal function that handles the no-depth error case.

### IR-006 --- Test TC-COMP-175 assertion is indirect

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S5-1
- **Tasks**: T003
- **Files**: `tests/integration/test_runner_cancel.py:196-228`
- **Claim challenged**: TC-COMP-175 requires verifying that heartbeat and cancellation occur at the same iteration point.
- **Observed evidence**: `test_heartbeat_and_cancellation_occur_together` only asserts that the run reaches a terminal state after processing one instrument. It does not independently verify that `heartbeat_at` was refreshed or that `cancellation_requested` was called at the same point as `heartbeat`. The test proves the run completes, not that the two operations are co-located.
- **Expected evidence/behavior**: A stronger test would verify that `heartbeat_at` advanced from its initial value after the instrument was processed, or use a mock to verify call ordering. The `test_heartbeat_checked_before_each_instrument` test in `test_runner_reclaim.py` is stronger evidence for the heartbeat check; TC-COMP-175's specific concern (co-location) is weakly covered.
- **Impact**: A refactoring that separates heartbeat and cancellation to different iteration points would not be caught by this test.
- **Required remediation**: Strengthen the assertion to verify that heartbeat_at advanced during the instrument iteration, or verify call ordering through instrumentation.

## Previous Review Disposition

Not applicable --- initial review.

## Scope and Plan Deviations

- `src/factorflow/ingestion/__init__.py` was not created by this story (T001 says "Create"); it pre-existed from prior stories. No impact: the file already existed and no modification was needed.
- `src/factorflow/ingestion/outcomes.py` is specified in the component design's placement table (section 2.1) but is absent. Outcome classification logic is embedded in runner.py and journal.py instead. Recorded as IR-004.
- The task plan's branch field says `usr/alvaro-de-jodra/CAP-001-E4-tasks` but the actual branch is `usr/alvaro-de-jodra/CAP-001-E4-S5`. This is a bookkeeping inconsistency in the task plan metadata, not a code issue.
- `_FAILED_UPDATE_SQL` (journal.py line 128-134) is defined but never called. Dead code introduced in this story's journal additions.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Address IR-001 (wire CredentialAwareClientFactory into entrypoint) and IR-002 (move direct SQL out of runner.py) to clear the gate. IR-003, IR-004, and IR-005 are related and may be resolved together by extracting error-result recording into a journal or outcomes module.
- **Warnings accepted downstream**: N/A
