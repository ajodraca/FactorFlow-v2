---
artifact_schema_version: 1
artifact_id: CAP-001-integration-tests-automation-review
artifact_type: automation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-11
updated: 2026-10-11
test_spec: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests.md
automation_tasks: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests-automation-tasks.md
reviewed_at: 2026-10-11T22:41:51Z
reviewed_state_revision: sha256:e6b3c59ece4c710496c50a963db29d494eb7c9652771b02c7cbd3ba5da5b9715
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-integration-tests
    artifact_version: 2
    content_revision: sha256:f5a1a13558bcf37451fcc9f7d7022e31b01659dd8d5e5e2807d13d86b8dfe7f9
  - artifact_id: CAP-001-integration-tests-automation-tasks
    artifact_version: 2
    content_revision: sha256:fbec916e37fbeda3fa60c8a9495e7498567b8b592d872fb653e4ada43451f99a
ai_provenance:
  agent_id: automation-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-11T22:41:51Z
  source_artifacts:
    - id: CAP-001-integration-tests
      version: "2"
    - id: CAP-001-integration-tests-automation-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Review: CAP-001-integration-tests — Version 1

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **CHANGES-REQUIRED** |
| Test cases | 26/27 verified (TC-INT-027 MISSING: not planned, not automated, not traced) |
| Automation tasks | 25/25 verified |
| Required commands | 17/17 passed |
| Findings | 2 |

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 1 · **total 2**

Run unattended under `$automation-run` (`docs/unattended-mode.md`). Under
`owner-allowed` the same owner may act on this review; no second reviewer is
required. This review records evidence only and approves nothing.

## Review Subject

| Item | Value |
| --- | --- |
| Test specification | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests.md` (CAP-001-integration-tests v2, draft; TC-INT-001 to TC-INT-027) |
| Automation task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests-automation-tasks.md` (CAP-001-integration-tests-automation-tasks v2, draft; 25 tasks, all checked; `source_artifacts` cites CAP-001-integration-tests version "1") |
| Component repository | `repos/factorflow-v2/FactorFlow-v2` (`FactorFlow-v2`, the plan's only `Component(s)` entry; also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-automation` at `82db2945449ef1abd80ac467f635ff970b28b12f` |
| Working tree | Clean before and after validation (`git status --porcelain` empty); no staged, unstaged or untracked changes |
| Automation commits | `26cfe3c` "test(CAP-001): automate integration tasks (23/25; T011 held)" and `9d41d50` "test(CAP-001): trace TC-INT-023 and verify integration traceability" |
| Reviewed state revision | `sha256:e6b3c59ece4c710496c50a963db29d494eb7c9652771b02c7cbd3ba5da5b9715` (`pipeline-state.py automation-revision`) |

The change set was derived from git. `git log -G'Implements TC-INT' -- tests`
and `git log -- docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests-automation-tasks.md`
identify the two commits above as the automation commits for this
specification; `git show --name-status --format= 26cfe3c 9d41d50` gives the
inventory below. The task-plan document both commits also modify is excluded
as documentation. Two later commits touched some of the same files under
their own story lanes and are not part of this review subject: `75edce1`
(CAP-001-E3-S1, `tests/unit/test_massive_client_governor_integration.py` and
`tests/unit/test_massive_financials.py`), `0669dd4` (CAP-001-E3-S1,
`tests/unit/test_massive_actions.py`, `tests/unit/test_massive_bars.py`,
`tests/unit/test_massive_financials.py`). Their effect on the traced tests was
read, and every suite was run with them in place.

### Changed Files

| File | Change |
| --- | --- |
| `tests/integration/test_api_coverage.py` | modified: TC-INT-017 and TC-INT-018 traceability lines (T006) |
| `tests/integration/test_api_health.py` | modified: TC-INT-020 traceability line (T008) |
| `tests/integration/test_api_instruments.py` | modified: TC-INT-001 to TC-INT-005 traceability; POST 409/422 envelope assertions and distinct DELETE 404/409 codes (T003, T015, T016) |
| `tests/integration/test_api_pagination.py` | modified: TC-INT-019 traceability line (T007) |
| `tests/integration/test_api_runs.py` | modified: TC-INT-009 to TC-INT-016 traceability; single-running-run and 404 envelope assertions; new `test_cancel_queued_run_leaves_active_run_unaffected` (T005, T017, T018, T019) |
| `tests/integration/test_api_settings.py` | modified: TC-INT-006 to TC-INT-008 traceability lines (T004) |
| `tests/integration/test_runner_isolation.py` | modified: TC-INT-025 and TC-INT-026 traceability lines (T014) |
| `tests/unit/test_massive_actions.py` | modified: TC-INT-024 traceability and corporate-actions request-argument assertions (T012, T020) |
| `tests/unit/test_massive_bars.py` | modified: TC-INT-022 traceability lines (T010) |
| `tests/unit/test_massive_client_governor_integration.py` | modified: TC-INT-025 traceability line (T013) |
| `tests/unit/test_massive_reference.py` | modified: TC-INT-021 and TC-INT-025 traceability lines (T009) |
| `tests/unit/test_massive_retry.py` | added: helpers plus the 429-pacing test and the parametrized timeout/server-error retry test (T002, T021, T022) |
| `tests/unit/test_massive_financials.py` | modified: TC-INT-023 traceability lines (T011) |

## Test Case and Traceability Verification

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-INT-001 | VERIFIED | `tests/integration/test_api_instruments.py::test_list_filters_and_counts`, `::test_list_cursor_pagination` | Filters, active/retired counts, cursor continuation asserted |
| TC-INT-002 | VERIFIED | `tests/integration/test_api_instruments.py::test_add_mixed_batch_response_shape` | 201 with added/reactivated/rejected groups |
| TC-INT-003 | VERIFIED | `tests/integration/test_api_instruments.py::test_add_status_codes` | 409 `all_duplicate`, 422 `all_malformed`; `resource`, `message`, `request_id` on both |
| TC-INT-004 | VERIFIED | `tests/integration/test_api_instruments.py::test_retire_status_codes` | 200, `lifecycle == "retired"`, `retired_at` |
| TC-INT-005 | VERIFIED | `tests/integration/test_api_instruments.py::test_retire_status_codes`, `::test_error_envelope_shape` | 404 `instrument_not_found` vs 409 `instrument_already_retired`, asserted distinct |
| TC-INT-006 | VERIFIED | `tests/integration/test_api_settings.py::test_get_depth_when_unset` | 200, `years is None` |
| TC-INT-007 | VERIFIED | `tests/integration/test_api_settings.py::test_put_depth_accepts_bounded_value` | Saved value and `updated_at` |
| TC-INT-008 | VERIFIED | `tests/integration/test_api_settings.py::test_put_depth_rejects_invalid`, `::test_error_envelope_shape_on_settings` | 422 for 0, -5, "five", 3.5; envelope |
| TC-INT-009 | VERIFIED | `tests/integration/test_api_runs.py::test_start_with_active_run_returns_202_queued_behind_set` | 202 `requested`, `queued_behind`; `state=running` list holds only the first run |
| TC-INT-010 | VERIFIED | `tests/integration/test_api_runs.py::test_start_no_depth_returns_409_history_depth_not_set`, `::test_start_no_active_instruments_returns_409_no_active_instruments` | 409 code and unchanged run count |
| TC-INT-011 | VERIFIED | `tests/integration/test_api_runs.py::test_list_runs_reverse_chronological_order`, `::test_list_runs_state_filter`, `::test_list_runs_cursor_continuation_no_gaps` | Order, state filter, cursor |
| TC-INT-012 | VERIFIED | `tests/integration/test_api_runs.py::test_get_run_detail_returns_run_counts_and_results`, `::test_api_detail_includes_sql_outcome_counts_and_symbols` | Counts and per-instrument, per-data-type results |
| TC-INT-013 | VERIFIED | `tests/integration/test_api_runs.py::test_get_run_detail_unknown_returns_404` | 404 `not_found`, `resource == "acquisition-run"`, message, request id |
| TC-INT-014 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_running_run_returns_202_cancelling` | 202 `cancelling`, not `cancelled` |
| TC-INT-015 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_queued_run_returns_202_cancelled`, `::test_cancel_queued_run_leaves_active_run_unaffected` | Active run still `running` after cancelling the queued run |
| TC-INT-016 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_terminal_run_returns_409_run_already_terminal`, `::test_cancel_unknown_run_returns_404` | 409 with actual state; 404 |
| TC-INT-017 | VERIFIED | `tests/integration/test_api_coverage.py` (six tests named in T006) | Presence, ranges, last-acquired, gaps, filters, bounds, cursor |
| TC-INT-018 | VERIFIED | `tests/integration/test_api_coverage.py::test_inverted_range_is_rejected` | 422 with envelope |
| TC-INT-019 | VERIFIED | `tests/integration/test_api_pagination.py::test_coverage_page_size_defaults_and_caps` | `MAX_PAGE_SIZE + 1` → 422 |
| TC-INT-020 | VERIFIED | `tests/integration/test_api_health.py::test_health_reports_the_most_recent_terminal_run` | Status, database, credential boolean, schema version, most recent run |
| TC-INT-021 | VERIFIED | `tests/unit/test_massive_reference.py::test_fetch_reference_uses_the_single_ticker_endpoint_only`, `::test_fetch_reference_returns_product_shaped_reference` | Mocked at the SDK `RESTClient` per owner direction 2026-10-07, not on the HTTPS wire |
| TC-INT-022 | VERIFIED | `tests/unit/test_massive_bars.py::test_fetch_daily_bars_requests_multiplier_1_day_timespan_and_inclusive_dates`, `::test_fetch_daily_bars_returns_all_rows_from_a_two_page_response_in_order` | Same mocking boundary |
| TC-INT-023 | VERIFIED | `tests/unit/test_massive_financials.py::test_fetch_financials_queries_the_three_statement_endpoints_for_the_symbol`, `::test_fetch_financials_returns_a_complete_result_for_a_covered_symbol` | Three statement endpoints after the ratios exclusion |
| TC-INT-024 | VERIFIED | `tests/unit/test_massive_actions.py::test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol` | Splits, dividends, IPOs request arguments and ticker events asserted |
| TC-INT-025 | VERIFIED | `tests/unit/test_massive_reference.py::test_fetch_reference_raises_instrument_not_found_for_unknown_symbol`, `tests/unit/test_massive_client_governor_integration.py::test_a_first_page_provider_failure_surfaces_as_the_typed_error`, `tests/integration/test_runner_isolation.py::test_not_found_instrument_is_recorded_and_run_continues`, `tests/unit/test_massive_retry.py::test_rate_limited_responses_are_paced_without_consuming_attempts` | Four 429s then success with `max_attempts=3` and `call_count == 5`; a regression counting 429s as attempts fails it. Runner half per DEC-0024 |
| TC-INT-026 | VERIFIED | `tests/unit/test_massive_retry.py::test_timeouts_and_server_errors_retry_to_the_attempt_limit[timeout]`, `[server-error]`, `tests/integration/test_runner_isolation.py::test_provider_unavailable_is_recorded_and_run_continues` | `ProviderUnavailable` after exactly 3 sends; runner half per DEC-0024 |
| TC-INT-027 | MISSING | None | Added to spec v2 on 2026-10-10 (`1701a0e`); no planned task, no `# Implements TC-INT-027` line, no automated test asserting the ingestion process stays up or the stub request log. See AR-001 |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | Baseline commands rerun here (`uv sync --all-extras`, `uv run pytest -m 'not postgres'`, collect-only) | Baseline is non-file evidence; reproduced fresh |
| T002 | VERIFIED | `tests/unit/test_massive_retry.py` | Docstring cites section 7 rows; helpers local; collects (3 tests); ruff clean |
| T003 | VERIFIED | `tests/integration/test_api_instruments.py` | All seven lines present |
| T004 | VERIFIED | `tests/integration/test_api_settings.py` | Four lines present |
| T005 | VERIFIED | `tests/integration/test_api_runs.py` | All lines present |
| T006 | VERIFIED | `tests/integration/test_api_coverage.py` | Seven lines present |
| T007 | VERIFIED | `tests/integration/test_api_pagination.py` | Present |
| T008 | VERIFIED | `tests/integration/test_api_health.py` | Present |
| T009 | VERIFIED | `tests/unit/test_massive_reference.py` | Three lines present |
| T010 | VERIFIED | `tests/unit/test_massive_bars.py` | Two lines present |
| T011 | VERIFIED | `tests/unit/test_massive_financials.py` | Added in `9d41d50` after the ratios exclusion |
| T012 | VERIFIED | `tests/unit/test_massive_actions.py` | Present |
| T013 | VERIFIED | `tests/unit/test_massive_client_governor_integration.py` | Present (below the parametrize decorator) |
| T014 | VERIFIED | `tests/integration/test_runner_isolation.py` | Two lines present |
| T015 | VERIFIED | `tests/integration/test_api_instruments.py::test_add_status_codes` | Assertions match the plan exactly |
| T016 | VERIFIED | `tests/integration/test_api_instruments.py::test_retire_status_codes` | Codes asserted and compared |
| T017 | VERIFIED | `tests/integration/test_api_runs.py::test_start_with_active_run_returns_202_queued_behind_set` | Exactly one running run, `first_id` |
| T018 | VERIFIED | `tests/integration/test_api_runs.py::test_get_run_detail_unknown_returns_404` | Envelope fields asserted |
| T019 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_queued_run_leaves_active_run_unaffected` | Postgres-marked; steps as planned |
| T020 | VERIFIED | `tests/unit/test_massive_actions.py` | Arguments match `MassiveClient.fetch_corporate_actions` |
| T021 | VERIFIED | `tests/unit/test_massive_retry.py::test_rate_limited_responses_are_paced_without_consuming_attempts` | Passes; not flaky across the three runs here |
| T022 | VERIFIED | `tests/unit/test_massive_retry.py::test_timeouts_and_server_errors_retry_to_the_attempt_limit` | Two parametrized cases pass; comment placement see AR-002 |
| T023 | VERIFIED | Independent Validation rows 4–8 | All pass |
| T024 | VERIFIED | Independent Validation rows 3 and 9 | Run here with Docker 28.3.2 (desktop-linux) |
| T025 | VERIFIED | Independent Validation row 10 | Loop prints nothing for 001–026 (it does not cover TC-INT-027) |

## Independent Validation

All commands run from `repos/factorflow-v2/FactorFlow-v2` (repository root) on
2026-10-11 with Docker server 28.3.2 available.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 46 packages resolved, 43 checked |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel built into gitignored `dist/` and `build/` |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 932 passed / 932, 2 warnings (starlette/anyio deprecation) |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 658 passed / 658, 274 deselected |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 184 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 47 source files |
| `uv run pytest tests/integration --collect-only -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 283 tests collected |
| `uv run pytest tests/integration -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 274 passed / 274, 9 deselected (210 s) |
| `for n in $(seq -w 1 26); do grep -rqE "# Implements TC-INT-0$n\b" tests \|\| echo "missing TC-INT-0$n"; done` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output: 26/26 traced |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | allow-scripts warning for `fsevents` only |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite bundle into gitignored `src/factorflow/api/static/` |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 297 passed / 297 in 41 files |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 96 files, no fixes |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 96 files, no fixes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No errors |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 17 passed / 17; `posttest:e2e` removed `factorflow-e2e-postgres` |
| `uv run pytest tests/unit/test_massive_retry.py tests/unit/test_massive_actions.py tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_client_governor_integration.py -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supplementary: 98 passed / 98 |
| `uv run pytest tests/unit/test_massive_retry.py --collect-only -q -p no:cacheprovider` and `uv run ruff check tests/unit/test_massive_retry.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supplementary T002 checkpoint: 3 collected; ruff clean |
| `grep -rqE "# Implements TC-INT-027\b" tests \|\| echo "missing TC-INT-027"` | `repos/factorflow-v2/FactorFlow-v2` | 0 | FAIL | Supplementary: prints `missing TC-INT-027` (AR-001) |

Required commands are the first 17 rows (task plan Validation Plan plus the
tech-stack Validation Commands table): 17/17 passed. The working tree was
clean after validation; every artifact the commands produced is gitignored.

## Findings

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | HIGH | Spec v2 (`1701a0e`, 2026-10-10) added TC-INT-027 "E2E acquisition stack reaches the loopback Massive stub" (DAC-E3-S7-14). The task plan v2 still cites spec version "1" in `source_artifacts`, its traceability table and T025 loop stop at TC-INT-026, and `grep -rqE "# Implements TC-INT-027\b" tests` finds nothing. The case was only executed by hand in `CAP-001-E3-S7-implementation-review-v1.md`; `npm run test:e2e` drives runs against the stub incidentally but no test asserts the ingestion process survives health or reads the stub's request log | A P1 integration case has no planned task and no automated test, so bidirectional traceability fails and a regression of the S6/S7 landing rule would not fail any traced test | Revise the automation task plan (`$automation-planning`) to cover TC-INT-027 against the current spec version, then implement and trace it in `$automation-coding` and extend the T025 loop to 027 |
| AR-002 | LOW | `tests/unit/test_massive_retry.py`: `# Implements TC-INT-026` sits above `@pytest.mark.parametrize` instead of directly above the `def`, contrary to the plan's traceability convention ("directly above the test's `def`, below any decorators") | Cosmetic; grep-based traceability still finds it | Move the comment below the decorator in the next coding pass |

## Previous Review Disposition

Not applicable — initial review.

## Verdict

**Verdict:** CHANGES-REQUIRED

All 25 planned tasks are implemented and every required command passes, but
TC-INT-027 in the current specification has no planned task or automated test
(AR-001). Direct this back to `$automation-coding`, after the task plan is
revised to include TC-INT-027.
