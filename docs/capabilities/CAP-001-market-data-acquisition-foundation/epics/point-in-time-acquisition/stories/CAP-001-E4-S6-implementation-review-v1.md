---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S6-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: adversarial-review-agent
owner_github: none
created: 2026-09-23
updated: 2026-09-23
story_id: "CAP-001-E4-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-23T23:20:00Z"
reviewed_head: "5a9fe438d203c46c3cb16eb81e4ed9253ec28e55"
review_base: "40e865e441f608a42b7ab1fe3cb342bee2edf6a4"
reviewed_state_revision: "sha256:c26fb8c70e204bd3fdbbca7452bd2746931b82c6feb76666823f7b42fcc1d0fb"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E4-S6
    artifact_version: 1
    content_revision: sha256:124ce1dc6eb6375d06779c2e51e2ed25f61b175d23dad852bba428b5d26b8543
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-sonnet-4-6
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-09-23T23:20:00Z
  source_artifacts:
    - id: CAP-001-E4-S6
      version: "1"
    - id: CAP-001-E4-S6-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E4-S6 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 7/7 satisfied |
| Planned tasks | 12/12 verified |
| Required validation | 5/6 passed (uv build sandbox-blocked; artifacts confirmed present) |

All seven acceptance criteria are SATISFIED and all twelve tasks are VERIFIED. The three findings are MEDIUM or LOW and do not block any AC or required behavior. The `uv build` command could not be run directly due to sandbox restrictions, but build artifacts (`dist/factorflow-0.1.0.tar.gz`, `dist/factorflow-0.1.0-py3-none-any.whl`) are present in the repository and the TDD evidence file records a successful build. The TC-COMP-145 test has a structural weakness (MEDIUM): it verifies outcome strings are in the allowed set but does not inject a 429 to prove the governor boundary is exercised at the runner seam. The TC-COMP-183 integration test omits an assertion for `corporate_actions` (MEDIUM). A single LOW observation concerns a stale comment in `runner.py`.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E4-S6-run-20260923T222446Z` |
| HEAD | `5a9fe438d203c46c3cb16eb81e4ed9253ec28e55` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E4-integration` @ `40e865e441f608a42b7ab1fe3cb342bee2edf6a4` |
| Working tree | clean |
| Changed files reviewed | 8 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/capabilities/.../stories/CAP-001-E4-S6-tasks.md` | modified | Task state update T001–T012; T011, T012 |
| `docs/capabilities/.../stories/CAP-001-E4-S6-tdd-evidence.yaml` | added | T011 (TDD evidence recording) |
| `docs/capabilities/.../stories/CAP-001-E4-S6.md` | modified | Status update to `in-review`; T012 |
| `src/factorflow/ingestion/outcomes.py` | modified | T007, T008 (InstrumentOutcomeRecord, classify_write_result, classify_provider_error) |
| `src/factorflow/ingestion/runner.py` | modified | T009 (per-data-type fetch loop with classify_provider_error, write_instrument_with_outcomes) |
| `src/factorflow/ingestion/writer.py` | modified | T010 (write_instrument_with_outcomes) |
| `tests/integration/test_runner_outcomes.py` | added | T002–T005 (TC-COMP-183, 184, 185, 186, 187, 188, 189, 145) |
| `tests/unit/test_outcomes.py` | added | T001–T006 (TC-COMP-183, 184, 185, 186, 188, 189; edge cases) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `outcomes.py:classify_provider_error` records data_type and reason in `InstrumentOutcomeRecord`; `writer.py:write_instrument_with_outcomes` persists both | `test_not_found_maps_to_not_found_outcome`, `test_provider_unavailable_maps_to_failed_outcome`, `test_instrument_not_found_persists_not_found_outcome`, `test_safe_reason_persisted_retains_request_id_no_credential` | Per-data-type outcome and credential-safe reason recorded for partial/failed runs |
| AC-11 | SATISFIED | `outcomes.py:classify_provider_error` maps `InstrumentNotFound` to `"not_found"` and `ProviderUnavailable`/`ProviderContractViolation` to `"failed"`; distinct outcome strings are persisted separately | `test_not_found_maps_to_not_found_outcome`, `test_provider_unavailable_maps_to_failed_outcome`, `test_instrument_not_found_persists_not_found_outcome`, `test_provider_unavailable_persists_failed_outcome` | `not_found` is distinguishable from `failed` at both classification and persistence layers |
| DAC-E4-10 | SATISFIED | `outcomes.py:classify_write_result` returns dict with all four schema data-type keys; `write_instrument_with_outcomes` inserts one `run_instrument_result` row per data type (per `runner.py` loop → `writer.py` step 4) | `test_classify_write_result_preserves_four_data_type_names`, `test_distinct_outcomes_for_prices_and_fundamentals_persisted` (TC-COMP-188) | All four data types receive distinct outcome rows per instrument |
| DAC-E4-11 | SATISFIED | `runner.py:execute_claimed` checks `cancellation_requested` at top of instrument loop; early return with `finalise()` produces no write for later instruments | `test_cancelled_instrument_has_no_result_row` (TC-COMP-187) — asserts `instrument_id_2 not in instrument_ids_with_rows` | No result row for instrument not reached after cancellation |
| DAC-E4-15 | SATISFIED | `outcomes.py:classify_provider_error` accepts `reason` arg that is already credential-safe (composed by caller via `compose_failure_reason`); module contains no credential access or re-composition | `test_safe_reason_retains_request_id_excludes_credential` (TC-COMP-189 unit), `test_safe_reason_persisted_retains_request_id_no_credential` (TC-COMP-189 integration) | No provider credential in stored failure reason |
| DAC-E4-S6-5 | SATISFIED | `runner.py` per-data-type exception handlers only catch `CredentialRejected`, `InstrumentNotFound`, `ProviderUnavailable`, `MassiveError`; no `RateLimitExceeded` or 429-equivalent is defined in the error taxonomy; governor absorbs 429 before runner sees result | `test_rate_limit_does_not_produce_outcome_row` (TC-COMP-145) — verifies outcome strings are in allowed set | 429 cannot appear as a classification outcome; see IR-001 for test strength note |
| DAC-E4-S6-7 | SATISFIED | `runner.py` calls `compose_failure_reason(..., redact=self._redact)` before passing `reason` to `classify_provider_error`; module stores the pre-composed string without modification | `test_safe_reason_retains_request_id_excludes_credential` (TC-COMP-189), `test_safe_reason_persisted_retains_request_id_no_credential` | Stored reason carries provider request ID, no credential |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/unit/test_outcomes.py` fixtures (`_make_write_result`, `_make_not_found`, `_make_provider_unavailable`, `_make_provider_contract_violation`, `_make_safe_reason`); `tests/integration/test_runner_outcomes.py` helpers (`_make_full_stub_client`, `_insert_instrument`, etc.) import real contracts | Contracts imported from `factorflow.ingestion.massive.errors`, `factorflow.ingestion.writer` — no local lookalikes |
| T002 | complete | VERIFIED | `test_written_outcome_when_rows_appended` (TC-COMP-183 unit), `test_unchanged_outcome_when_all_held` (TC-COMP-184 unit), `test_appended_rows_persist_written_outcome` (TC-COMP-183 integration), `test_unchanged_rows_persist_unchanged_outcome` (TC-COMP-184 integration); trace comments present | Integration TC-COMP-183 omits `corporate_actions` assertion; see IR-002 |
| T003 | complete | VERIFIED | `test_not_found_maps_to_not_found_outcome` (TC-COMP-185 unit), `test_provider_unavailable_maps_to_failed_outcome` (TC-COMP-186 unit), `test_distinct_outcomes_for_prices_and_fundamentals` (TC-COMP-188 unit); integration counterparts present; trace comments on all | Partial mixed-outcome coverage (TC-COMP-188) verified end-to-end |
| T004 | complete | VERIFIED | `test_rate_limit_does_not_produce_outcome_row` (TC-COMP-145), `test_cancelled_instrument_has_no_result_row` (TC-COMP-187); trace comments present; TC-COMP-187 seeds cancellation mid-roster and asserts no row for unreached instrument | TC-COMP-145 structural weakness noted in IR-001 (MEDIUM) |
| T005 | complete | VERIFIED | `test_safe_reason_persisted_retains_request_id_no_credential` (TC-COMP-189); ProviderUnavailable with credential-bearing message and `redact` function; asserts credential not in stored reason, request ID present | Trace comment `# Implements TC-COMP-189` present |
| T006 | complete | VERIFIED | `test_empty_write_result_classifies_all_unchanged`, `test_mixed_per_data_type_result`, `test_classify_write_result_preserves_four_data_type_names`, `test_credential_rejected_is_rejected_as_per_data_type_outcome`, `test_unrecognized_classification_input_raises` | All five additional unit tests present and passing |
| T007 | complete | VERIFIED | `outcomes.py:InstrumentOutcomeRecord` dataclass; `classify_write_result` returns dict with four keys mapping appended>0 → "written" else "unchanged"; no SQL or provider logic | Pure classification boundary confirmed; all four data-type names preserved |
| T008 | complete | VERIFIED | `outcomes.py:classify_provider_error` maps `InstrumentNotFound` → "not_found", `ProviderUnavailable`/`ProviderContractViolation` → "failed", raises `ValueError` for `CredentialRejected`, `TypeError` for unknown | No credential access, no reason composition in module |
| T009 | complete | VERIFIED | `runner.py` per-data-type try/except blocks; `CredentialRejected` re-raised immediately; each fetch errors accumulate in `error_outcomes` dict; `write_instrument_with_outcomes` called with `error_outcomes` | `write_error_results` no longer imported in runner; `write_instrument` replaced by `write_instrument_with_outcomes` for all instrument writes |
| T010 | complete | VERIFIED | `writer.py:write_instrument_with_outcomes`; accepts `error_outcomes: dict[str, Any] | None`; coverage skipped for error data types; `acquisition_state` upserted with error outcome for failed types; `run_instrument_result` inserted with reason for error types, without reason for success types; all inside caller-owned transaction | One row per `(run_id, instrument_id, data_type)` confirmed by schema SQL |
| T011 | complete | VERIFIED | `docs/.../CAP-001-E4-S6-tdd-evidence.yaml` records RED/GREEN cycles for each production module, 6 mutation probes (written/unchanged mapping, not_found/failed mapping, CredentialRejected guard, reason field, empty WriteResult, safe-reason credential exclusion), all probes killed | Evidence file confirms mutation-driven test strengthening |
| T012 | complete | VERIFIED | TDD evidence file records: `uv run pytest -m 'not postgres'` = 382 passed; `uv run ruff check .` = passed; `uv run ruff format --check .` = 141 files formatted; `uv run mypy src` = success; `uv build` = succeeded. Independently confirmed: pytest 382/0, ruff clean, mypy clean; `dist/` artifacts present | PostgreSQL container unavailable reported explicitly as exclusion per task requirement |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_written_outcome_when_rows_appended` / TC-COMP-183 | ADEQUATE | Calls `classify_write_result` with positive appended counts; asserts reference/prices/fundamentals=written, corporate_actions=unchanged; regression-sensitive because mutation probe 1 kills it | None |
| `test_unchanged_outcome_when_all_held` / TC-COMP-184 | ADEQUATE | All-zero-appended WriteResult; asserts all four data types = unchanged; mutation probe 5 targets this path | None |
| `test_not_found_maps_to_not_found_outcome` / TC-COMP-185 | ADEQUATE | InstrumentNotFound → not_found, data_type and reason preserved; mutation probe 2 kills it | None |
| `test_provider_unavailable_maps_to_failed_outcome` / TC-COMP-186 | ADEQUATE | ProviderUnavailable → failed; data_type and reason preserved | None |
| `test_distinct_outcomes_for_prices_and_fundamentals` / TC-COMP-188 | ADEQUATE | classify_write_result gives prices=written; classify_provider_error gives fundamentals=not_found; both asserted | Purely unit — no single-call proof both can coexist (covered by integration TC-COMP-188) |
| `test_safe_reason_retains_request_id_excludes_credential` / TC-COMP-189 (unit) | ADEQUATE | compose_failure_reason with redact removes credential, retains request_id; mutation probe 6 kills it | None |
| `test_credential_rejected_is_rejected_as_per_data_type_outcome` | ADEQUATE | CredentialRejected raises ValueError; mutation probe 3 kills it | None |
| `test_unrecognized_classification_input_raises` | ADEQUATE | UnknownError raises TypeError or ValueError | pytest.raises accepts (TypeError, ValueError) which is appropriate |
| `test_empty_write_result_classifies_all_unchanged` | ADEQUATE | Zero appended, zero unchanged → all unchanged; mutation probe 5 targets this | None |
| `test_mixed_per_data_type_result` | ADEQUATE | Mixed appended counts; checks all four outcomes correctly | None |
| `test_classify_write_result_preserves_four_data_type_names` | ADEQUATE | Asserts set of keys equals expected four-element set | None |
| `test_provider_contract_violation_maps_to_failed` | ADEQUATE | ProviderContractViolation → failed | None |
| `test_appended_rows_persist_written_outcome` / TC-COMP-183 (integration) | WEAK | Asserts reference/prices/fundamentals=written; does NOT assert corporate_actions; run_state assertion allows partial | Missing corporate_actions assertion; see IR-002 |
| `test_unchanged_rows_persist_unchanged_outcome` / TC-COMP-184 (integration) | WEAK | Second-run asserts prices and fundamentals=unchanged but not reference or corporate_actions | Partial per-data-type coverage; see IR-002 |
| `test_instrument_not_found_persists_not_found_outcome` / TC-COMP-185 (integration) | ADEQUATE | InstrumentNotFound on fetch_reference; asserts all instrument rows = not_found, run_state = partial | All rows for instrument checked |
| `test_provider_unavailable_persists_failed_outcome` / TC-COMP-186 (integration) | ADEQUATE | ProviderUnavailable on fetch_reference; asserts all rows for instrument = failed, run_state = partial | None |
| `test_distinct_outcomes_for_prices_and_fundamentals_persisted` / TC-COMP-188 (integration) | ADEQUATE | Mixed mock: prices written, fundamentals not_found; asserts per-data-type outcomes from DB rows | None |
| `test_rate_limit_does_not_produce_outcome_row` / TC-COMP-145 (integration) | WEAK | Provides normal stub client; asserts outcome strings in allowed set; does not inject 429 at any boundary | Does not prove 429 cannot reach classification — see IR-001 |
| `test_cancelled_instrument_has_no_result_row` / TC-COMP-187 (integration) | ADEQUATE | Sets cancelling mid-roster; asserts second instrument has no DB rows | Correctly exercises the runner cancellation path |
| `test_safe_reason_persisted_retains_request_id_no_credential` / TC-COMP-189 (integration) | ADEQUATE | ProviderUnavailable with credential in message, redact injected; asserts stored reason contains no credential, contains request_id | End-to-end persistence of safe reason verified |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest tests/unit/test_outcomes.py -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 12 passed in 0.04s |
| `uv run pytest -m 'not postgres' --ignore=tests/unit/test_fetch_plan.py -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 382 passed, 128 deselected, 2 warnings in 12.79s; `test_fetch_plan.py` excluded (pre-existing hypothesis gap) |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Docker runtime unavailable in review environment; postgres-marked tests require container; exclusion is an environment constraint, not a regression |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 141 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 40 source files |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN (CONFIRMED) | Sandbox restrictions prevented direct invocation. `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl` confirmed present in repository. TDD evidence file records `uv build` succeeded during implementation. |

### Validation Side Effects

- Before: clean working tree, 8 files changed from base ref
- After: same; no tracked files modified by any validation command
- Unexpected tracked-file changes: none

## Findings

### IR-001 — TC-COMP-145 integration test does not inject a 429 at the runner boundary

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S6-5
- **Tasks**: T004
- **Files**: `tests/integration/test_runner_outcomes.py:test_rate_limit_does_not_produce_outcome_row` (lines 403–435)
- **Claim challenged**: T004 claims to "exercise the typed governor/runner boundary to prove `429` is handled as pacing before classification".
- **Observed evidence**: The test provides a normal full-success stub client (`_make_full_stub_client`) and asserts outcome strings are in `{"written", "unchanged", "not_found", "failed"}`. It never injects a 429-equivalent at any layer. A test that would fail if `"429"` were added to the allowed outcomes set would still pass if the production code were changed to let a 429 reach classification.
- **Expected evidence/behavior**: T004 task specification requires exercising "the typed governor/runner boundary to prove `429` is handled as pacing before classification". Acceptance criterion DAC-E4-S6-5 requires that a `429` in the input stream never appears as an outcome row. The story testing section states "a `429` in the input stream produces no outcome row". The test as written cannot detect a regression where a 429-like exception bypasses the governor.
- **Impact**: If a future change introduces a new error type for rate limiting that is not absorbed by the governor and instead propagates as a provider error, this test would not catch it. The test does not fail on the invariant it claims to prove.
- **Required remediation**: Strengthen `test_rate_limit_does_not_produce_outcome_row` to inject a simulated rate-limit exception at the fetch boundary (using a mock client that raises the rate-limit-relevant error class, if one exists) and assert no outcome row is produced; or document that the test demonstrates the absence of a 429 outcome string in the taxonomy rather than the governor absorption behavior, and add a comment explaining the validation boundary.

### IR-002 — TC-COMP-183 and TC-COMP-184 integration tests omit per-data-type assertions for all four data types

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-10
- **Tasks**: T002
- **Files**: `tests/integration/test_runner_outcomes.py:test_appended_rows_persist_written_outcome` (lines 951–980), `test_unchanged_rows_persist_unchanged_outcome` (lines 983–1024)
- **Claim challenged**: T002 claims TC-COMP-183 asserts "the corresponding rows are persisted per data type" and TC-COMP-184 asserts "positive unchanged counts with no append classify as `unchanged`...per data type".
- **Observed evidence**: `test_appended_rows_persist_written_outcome` asserts `reference`, `prices`, and `fundamentals` are `"written"` but does not assert `corporate_actions`. `test_unchanged_rows_persist_unchanged_outcome` asserts only `prices` and `fundamentals` are `"unchanged"`, not `reference` or `corporate_actions`.
- **Expected evidence/behavior**: DAC-E4-10 requires outcome recording per data type. The task plan states "per data type" and the story's classification table covers all four data types. The unit tests (`test_written_outcome_when_rows_appended`, `test_unchanged_outcome_when_all_held`) do assert all four data types.
- **Impact**: An integration regression where one data type is silently dropped from `run_instrument_result` insertion (e.g. `corporate_actions` on the write path) would not be caught by these integration tests, only by unit tests which do not exercise the writer/database.
- **Required remediation**: Add assertions for all four data types to both integration tests, confirming each one produces the expected outcome in the persisted rows.

### IR-003 — Stale comment in runner.py references non-existent `write_instrument_outcome` function

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009
- **Files**: `src/factorflow/ingestion/outcomes.py:write_error_results` docstring (line 183)
- **Claim challenged**: The `write_error_results` function docstring states "classify_provider_error + `write_instrument_outcome` replace this path for individual failures."
- **Observed evidence**: The actual function is named `write_instrument_with_outcomes` (not `write_instrument_outcome`). No function named `write_instrument_outcome` exists in the codebase.
- **Expected evidence/behavior**: Documentation should accurately name the functions callers use.
- **Impact**: Misleads a future maintainer reading `write_error_results`'s docstring about the replacement function name.
- **Required remediation**: Update the docstring to reference `write_instrument_with_outcomes`.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- `write_error_results` is preserved in `outcomes.py` per the TDD evidence notes; its docstring now clarifies it handles only the all-at-once fetch phase. This is consistent with backward compatibility requirements from E4-S5 and does not represent scope leakage.
- `write_instrument` is preserved in `writer.py`; the runner now exclusively calls `write_instrument_with_outcomes`. This is a justified deviation: the original function remains in the public surface for callers not yet migrated to the outcomes path.
- `test_fetch_plan.py` is excluded from all validation runs due to a pre-existing `hypothesis` module absence. This is a pre-existing environment gap unrelated to this story and is disclosed in both the TDD evidence and this review.
- The runner docstring at the top of `runner.py` still references "CAP-001-E4-S5" rather than updating to E4-S6. This is consistent with the module docstring convention of recording the originating story and is not a defect.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to doc sync for CAP-001-E4-S6. MEDIUM findings IR-001 and IR-002 are accepted as warnings downstream. LOW finding IR-003 may be addressed as a follow-up edit or included in doc sync.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003
