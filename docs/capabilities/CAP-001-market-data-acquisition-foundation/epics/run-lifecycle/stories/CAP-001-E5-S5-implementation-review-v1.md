---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S5-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-25
updated: 2026-09-25
story_id: "CAP-001-E5-S5"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S5.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-25T18:45:00Z"
reviewed_head: "dac6f0dc9fc31b95961f9dd09832fdcc160ec797"
review_base: "3ef153d47b7a441e2bc5f0e759dd7a066c00d802"
reviewed_state_revision: "sha256:0f31e0f8378e7a7af13ad631042974289582cd2f70a6094b1870cb90f85c6438"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E5-S5
    artifact_version: 1
    content_revision: sha256:3ecb10e700a483c54859850f2a0c615f5c93e4f2019bf8244a80225aed3990f5
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-4-6
  tool: Claude Code
  tool_version: "unknown"
  timestamp: "2026-09-25T18:45:00Z"
  source_artifacts:
    - id: CAP-001-E5-S5
      version: "1"
    - id: CAP-001-E5-S5-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E5-S5 -- Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 12/12 verified |
| Required validation | 7/7 passed |

All acceptance criteria are satisfied. All planned tasks are verified. All required validation commands pass (619 tests, lint clean, format clean, mypy clean, 25 integration tests green against PostgreSQL 16). Two non-blocking findings relate to TC-COMP traceability comment format and a minor test helper type annotation.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S5.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S5-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E5-S5-run-20260924T211147Z` |
| HEAD | `dac6f0dc9fc31b95961f9dd09832fdcc160ec797` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E5-integration-20260924T202935Z` / `3ef153d47b7a441e2bc5f0e759dd7a066c00d802` |
| Working tree | clean |
| Changed files reviewed | 12 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../CAP-001-E5-S5-tasks.md` | modified | T001-T012 checkbox updates |
| `docs/.../CAP-001-E5-S5-tdd-evidence.yaml` | added | T011 TDD evidence |
| `docs/.../CAP-001-E5-S5.md` | modified | Status update to `in-review` |
| `src/factorflow/api/app.py` | modified | T010; router registration, validation resource mapping |
| `src/factorflow/api/errors.py` | modified | T007; optional `state` field for `run_already_terminal` |
| `src/factorflow/api/models.py` | modified | T006; run response models |
| `src/factorflow/api/routes/runs.py` | added | T009; four API routes |
| `src/factorflow/runs/queries.py` | added | T008; read-only query boundary |
| `tests/integration/test_api_runs.py` | added | T002, T003; 25 integration tests |
| `tests/unit/test_api_errors.py` | added | T004; error envelope unit tests |
| `tests/unit/test_api_runs_routes.py` | added | T004; route registration tests |
| `tests/unit/test_runs_queries.py` | added | T005; query boundary unit tests |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-23 | SATISFIED | `routes/runs.py:start_run` calls `request_run` and returns `queued_behind` from journal | `test_api_runs.py::test_start_with_active_run_returns_202_queued_behind_set` | Second start with running run returns 202 with queued_behind set to active run id |
| AC-24 | SATISFIED | `routes/runs.py:start_run` checks `active_instrument_ids` after depth, returns 409 `no_active_instruments` | `test_api_runs.py::test_start_no_active_instruments_returns_409_no_active_instruments`, `test_start_retired_only_roster_returns_409_no_active_instruments` | Both empty and retired-only rosters refuse with no row written |
| AC-19 | SATISFIED | `routes/runs.py:cancel_run` catches normal return from `request_cancel` and returns 202 | `test_api_runs.py::test_cancel_running_run_returns_202_cancelling` | Running cancellation returns 202 with state=cancelling |
| AC-26 | SATISFIED | `routes/runs.py:cancel_run` returns `cancelled` for requested runs | `test_api_runs.py::test_cancel_queued_run_returns_202_cancelled` | Queued (requested) cancellation returns 202 with state=cancelled |
| DAC-E5-14 | SATISFIED | `routes/runs.py:start_run` checks depth first, returns 409 `history_depth_not_set` | `test_api_runs.py::test_start_no_depth_returns_409_history_depth_not_set` | No depth returns 409, no run row written |
| DAC-E5-15 | SATISFIED | `routes/runs.py:start_run` returns 202 with RunStartResponse (run_id, state=requested, queued_behind) | `test_api_runs.py::test_start_valid_returns_202_requested_null_queued_behind` | Correct 202 body shape |
| DAC-E5-S5-1 | SATISFIED | `routes/runs.py:start_run` checks depth before roster deterministically | `test_api_runs.py::test_start_both_preconditions_unmet_returns_history_depth_not_set` | Both absent yields `history_depth_not_set` |
| DAC-E5-S5-2 | SATISFIED | `routes/runs.py:cancel_run` catches `RunAlreadyTerminal`, returns 409 with `state` | `test_api_runs.py::test_cancel_terminal_run_returns_409_run_already_terminal` | Tests all 5 terminal states; error.state carries actual state |
| DAC-E5-S5-3 | SATISFIED | `routes/runs.py:cancel_run` catches `KeyError`, returns 404 | `test_api_runs.py::test_cancel_unknown_run_returns_404` | Unknown UUID returns 404 |
| DAC-E5-S5-4 | SATISFIED | `routes/runs.py:list_runs_route` delegates to `queries.list_runs` with state filter, keyset cursor, limit bounds | `test_api_runs.py::test_list_runs_reverse_chronological_order`, `test_list_runs_default_page_size_is_50`, `test_list_runs_accepts_limit_500`, `test_list_runs_rejects_limit_501`, `test_list_runs_state_filter`, `test_list_runs_cursor_continuation_no_gaps`, `test_list_runs_malformed_cursor_returns_422`, `test_list_runs_response_shape` | Reverse chrono, filter, default 50, max 500, 501 rejected, cursor continuation gap-free, malformed 422 |
| DAC-E5-S5-5 | SATISFIED | `routes/runs.py:get_run` delegates to `queries.get_run_detail` with outcome filter, instrument pagination | `test_api_runs.py::test_get_run_detail_unknown_returns_404`, `test_get_run_detail_returns_run_counts_and_results`, `test_get_run_detail_failure_first_ordering`, `test_get_run_detail_outcome_filter`, `test_get_run_detail_cursor_continuation_no_gaps`, `test_get_run_detail_response_shape` | run/counts/results keys, failure-first, outcome filter, cursor continuation |
| DAC-E5-S5-6 | SATISFIED | `routes/runs.py:start_run` returns error before calling `request_run`; no row created | `test_api_runs.py::test_start_no_depth_returns_409_history_depth_not_set` (count assertion), `test_start_no_active_instruments_returns_409_no_active_instruments` (count assertion), `test_start_both_preconditions_unmet_returns_history_depth_not_set` (count assertion) | Before/after count assertions confirm no row on refusal |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Integration branch contains landed S1/S2/S3/E1-S6/E2-S1/E2-S2 artifacts; `request_run`, `request_cancel`, `RunAlreadyTerminal`, `active_instrument_ids`, `read_history_depth`, `app.state.db_pool` all imported and used | Prerequisites confirmed on the integration branch |
| T002 | complete | VERIFIED | `tests/integration/test_api_runs.py` contains 12 start/cancel tests with postgres marks | TC-IDs referenced in docstrings rather than `# Implements` comments; TC-COMP-024 and TC-COMP-026 absent (see IR-001) |
| T003 | complete | VERIFIED | `tests/integration/test_api_runs.py` contains 13 list/detail tests with postgres marks | TC-COMP-009, TC-COMP-010, TC-COMP-282, TC-COMP-283 present in docstrings |
| T004 | complete | VERIFIED | `tests/unit/test_api_errors.py` (8 tests), `tests/unit/test_api_runs_routes.py` (4 tests) | Singular resource, state field presence/absence, request id parity, 422 mapping, no driver detail |
| T005 | complete | VERIFIED | `tests/unit/test_runs_queries.py` (12 tests) | Cursor round-trip, URL-safety, malformed/version rejection, ListFilters bounds, RunNotFound typed result, CursorError |
| T006 | complete | VERIFIED | `src/factorflow/api/models.py` adds RunStartResponse, CancelRunResponse, RunSummary, RunCounts, ResultRow, RunListResponse, RunDetailResponse with Literal sets | Owner-confirmed keys and fields present |
| T007 | complete | VERIFIED | `src/factorflow/api/errors.py` adds optional `state` field to ErrorDetail, excluded from body when None | Correct selective exclusion without breaking `resource: null` |
| T008 | complete | VERIFIED | `src/factorflow/runs/queries.py` (444 lines) with ListFilters, DetailFilters, RunRow, ResultRow, RunNotFound, RunPage, RunDetail, cursor encode/decode, list_runs, get_run_detail | Parameterized SQL, keyset cursor, failure-first ordering, instrument pagination, no lifecycle transitions |
| T009 | complete | VERIFIED | `src/factorflow/api/routes/runs.py` (292 lines) with four routes | Depth-first preconditions, singular resource, no provider import, correct error mapping |
| T010 | complete | VERIFIED | `src/factorflow/api/app.py` includes runs.router, maps `/api/acquisition-runs` to `acquisition-run` in `_VALIDATION_ERROR_RESOURCES` | Router included before static mount |
| T011 | complete | VERIFIED | `CAP-001-E5-S5-tdd-evidence.yaml` with 9 cycle entries, all `red_observed: true`, `tests_executed: true`, commit hashes | Note: subagent dispatch was unavailable; TDD evidence recorded but independent review gate deferred to this adversarial review |
| T012 | complete | VERIFIED | `CAP-001-E5-S5-tdd-evidence.yaml` final_validation section: 619 passed, lint clean, format clean, mypy clean | Full validation plan executed |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_start_valid_returns_202_requested_null_queued_behind` / TC-COMP-019 | ADEQUATE | Asserts 202, state=requested, run_id present, queued_behind=null, count incremented | None |
| `test_start_with_active_run_returns_202_queued_behind_set` / TC-COMP-023 | ADEQUATE | Seeds running run via direct SQL, asserts 202, queued_behind=first_id, count incremented | None |
| `test_start_no_depth_returns_409_history_depth_not_set` / TC-COMP-249, DAC-E5-14 | ADEQUATE | Asserts 409, code, resource=acquisition-run, count unchanged | None |
| `test_start_no_active_instruments_returns_409_no_active_instruments` / TC-COMP-250, AC-24 | ADEQUATE | Depth set, no instruments, asserts 409, code, resource, count unchanged | None |
| `test_start_retired_only_roster_returns_409_no_active_instruments` / AC-24 | ADEQUATE | Adds then retires instrument, asserts same 409 | None |
| `test_start_both_preconditions_unmet_returns_history_depth_not_set` / DAC-E5-S5-1 | ADEQUATE | Neither precondition met, asserts deterministic depth-first code, count unchanged | None |
| `test_cancel_queued_run_returns_202_cancelled` / TC-COMP-279, AC-26 | ADEQUATE | Creates requested run, cancels, asserts 202, state=cancelled | None |
| `test_cancel_running_run_returns_202_cancelling` / TC-COMP-280, AC-19 | ADEQUATE | Seeds running via SQL, cancels, asserts 202, state=cancelling | None |
| `test_cancel_terminal_run_returns_409_run_already_terminal` / TC-COMP-281, DAC-E5-S5-2 | ADEQUATE | Iterates all 5 terminal states, asserts 409, code, state field, resource | None |
| `test_cancel_unknown_run_returns_404` / TC-COMP-284, DAC-E5-S5-3 | ADEQUATE | Random UUID, asserts 404, code=not_found | None |
| `test_start_refusal_uses_singular_resource_name_and_request_id` / TC-COMP-279 | ADEQUATE | Asserts resource=acquisition-run and request_id in body matches X-Request-Id header | None |
| `test_list_runs_reverse_chronological_order` / TC-COMP-009 | ADEQUATE | Seeds 3 runs with distinct timestamps, asserts ordering | None |
| `test_list_runs_default_page_size_is_50` / TC-COMP-009 | ADEQUATE | Seeds 55 runs, asserts 50 returned with next_cursor | None |
| `test_list_runs_accepts_limit_500` / TC-COMP-009 | ADEQUATE | Asserts 200 with limit=500 | None |
| `test_list_runs_rejects_limit_501` / TC-COMP-009 | ADEQUATE | Asserts 422 for limit=501 | None |
| `test_list_runs_state_filter` / TC-COMP-009 | ADEQUATE | Seeds succeeded and failed, filters on succeeded, asserts only matching | None |
| `test_list_runs_cursor_continuation_no_gaps` / TC-COMP-282 | ADEQUATE | Seeds 7 runs, paginates at limit=3, asserts no duplicates and complete set | None |
| `test_list_runs_malformed_cursor_returns_422` / TC-COMP-282 | ADEQUATE | Sends garbage cursor, asserts 422 | None |
| `test_get_run_detail_unknown_returns_404` / TC-COMP-010 | ADEQUATE | Random UUID, asserts 404 | None |
| `test_get_run_detail_returns_run_counts_and_results` / TC-COMP-010 | ADEQUATE | Seeds run with 2 results, asserts run/counts/results keys, correct values | None |
| `test_get_run_detail_failure_first_ordering` / TC-COMP-283 | ADEQUATE | Seeds ok and failed instruments, asserts failed appears first | None |
| `test_get_run_detail_outcome_filter` / TC-COMP-283 | ADEQUATE | Seeds 2 instruments with different outcomes, filters on failed, asserts only matching | None |
| `test_get_run_detail_cursor_continuation_no_gaps` / TC-COMP-283 | ADEQUATE | Seeds 7 instruments, paginates at limit=3, asserts all collected | None |
| `test_list_runs_response_shape` / TC-COMP-009 | ADEQUATE | Asserts runs, next_cursor keys and summary fields | None |
| `test_get_run_detail_response_shape` / TC-COMP-010 | ADEQUATE | Asserts run, counts, results keys | None |
| Unit: `test_409_uses_singular_resource_name_*` / TC-COMP-249, 250, 281 | ADEQUATE | Monkeypatched, asserts resource=acquisition-run on each 409 variant | None |
| Unit: `test_run_already_terminal_envelope_carries_state_field` / TC-COMP-281 | ADEQUATE | Monkeypatched, asserts error.state present with correct value | None |
| Unit: `test_non_terminal_409_envelope_does_not_carry_state_field` | ADEQUATE | Asserts state key absent from non-terminal 409 | None |
| Unit: `test_request_id_same_in_body_and_header_on_409` / TC-COMP-249 | ADEQUATE | Asserts body request_id matches X-Request-Id header | None |
| Unit: `test_cancel_malformed_uuid_returns_422_envelope` | ADEQUATE | Non-UUID path, asserts 422 with resource=acquisition-run | None |
| Unit: `test_500_does_not_expose_driver_detail` | ADEQUATE | Monkeypatched RuntimeError, asserts 500 without driver text | None |
| Unit: `test_runs_routes_are_registered` | ADEQUATE | Checks OpenAPI schema for all 3 path patterns | None |
| Unit: `test_list_runs_rejects_limit_0_with_422_envelope` | ADEQUATE | Asserts 422 envelope with code and resource | None |
| Unit: `test_cancel_malformed_run_id_returns_422_with_runs_resource` | ADEQUATE | Asserts 422 with resource=acquisition-run | None |
| Unit: `test_cancel_unknown_run_returns_404_with_envelope` | ADEQUATE | Monkeypatched KeyError, asserts 404 envelope | None |
| Unit: cursor round-trip, URL-safety, malformed, version, empty | ADEQUATE | 5 tests covering encode/decode symmetry, URL-safe chars, error cases | None |
| Unit: ListFilters default, max, over-max, zero | ADEQUATE | 4 tests covering bounds | None |
| Unit: RunNotFound, CursorError types | ADEQUATE | Not-exception, is-exception assertions | None |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m postgres tests/integration/test_api_runs.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 25 passed in 5.76s |
| `uv run pytest tests/unit/test_api_errors.py tests/unit/test_api_runs_routes.py tests/unit/test_api_models.py tests/unit/test_runs_queries.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 29 passed in 0.26s |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 437 passed, 182 deselected, 2 warnings in 13.25s |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 619 passed, 0 failed, 2 warnings in 54.56s |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 153 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 43 source files |

### Validation Side Effects

- Before: clean working tree, no staged/unstaged/untracked files
- After: clean working tree, no staged/unstaged/untracked files
- Unexpected tracked-file changes: none

## Findings

### IR-001 -- TC-COMP trace comments use docstrings instead of established comment format; two TC-IDs absent

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (traceability format, not behavioral)
- **Tasks**: T002, T003
- **Files**: `tests/integration/test_api_runs.py`, `tests/unit/test_api_errors.py`
- **Claim challenged**: T002 requires "separately named, postgres-marked cases carrying `# Implements TC-COMP-019`" and the other 9 TC-IDs; T003 requires 4 more.
- **Observed evidence**: All 14 TC-IDs appear in docstrings (e.g. `"""TC-COMP-019: ...`) rather than as `# Implements TC-COMP-XXX` standalone comments. TC-COMP-024 and TC-COMP-026 are entirely absent from all S5 test files, though their behaviors (AC-24 no-active-instruments refusal, AC-26 queued cancellation) are tested.
- **Expected evidence/behavior**: The established repo convention uses `# Implements TC-COMP-XXX` standalone comments (158 occurrences across 28 other test files). The task plan's "carrying" phrasing combined with this convention requires the comment form.
- **Impact**: Automated traceability tooling that scans for `# Implements TC-COMP-` comments will not find these mappings. Two TC-IDs have no mapping at all. Behavioral coverage is not affected.
- **Required remediation**: Add `# Implements TC-COMP-XXX` comments to the 25 integration tests and 8 unit error tests following the established repo convention. Add TC-COMP-024 and TC-COMP-026 references to the tests that exercise their behaviors.

### IR-002 -- Test helper _start_run has incorrect return type annotation

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T002
- **Files**: `tests/integration/test_api_runs.py:54`
- **Claim challenged**: Test code quality
- **Observed evidence**: `def _start_run(client: TestClient) -> dict:` returns `resp` which is a `httpx.Response` (via FastAPI TestClient), not a `dict`.
- **Expected evidence/behavior**: Return type annotation should be `Response` or the specific type returned by `client.post()`.
- **Impact**: No runtime effect (Python does not enforce return type annotations), but misleading for readers and type checkers. mypy does not catch it because the function is in a test file not under `src/`.
- **Required remediation**: Change the return annotation to match the actual return type.

## Previous Review Disposition

Not applicable -- initial review.

## Scope and Plan Deviations

- T011 notes that no subagent dispatch facility was available during the story-coding session, so the per-cycle independent review gate was not separately dispatched. The TDD evidence records the RED/GREEN cycles and this adversarial review fulfills the independent gate requirement.
- No unjustified scope changes detected. All 12 changed files trace to story tasks or story status bookkeeping.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to doc-sync for CAP-001-E5-S5. The two findings are non-blocking (MEDIUM/LOW only).
- **Warnings accepted downstream**: IR-001, IR-002
