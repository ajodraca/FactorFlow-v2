---
artifact_schema_version: 1
artifact_id: CAP-001-integration-tests-automation-review
artifact_type: automation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-11
updated: 2026-10-11
test_spec: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests.md
automation_tasks: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests-automation-tasks.md
reviewed_at: 2026-10-12T01:33:04Z
reviewed_state_revision: sha256:e7ac37e81ee50bedf62de3ad5ea1e8fe18922fc03446de02101c63d20f6647f3
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-integration-tests
    artifact_version: 2
    content_revision: sha256:f5a1a13558bcf37451fcc9f7d7022e31b01659dd8d5e5e2807d13d86b8dfe7f9
  - artifact_id: CAP-001-integration-tests-automation-tasks
    artifact_version: 3
    content_revision: sha256:ab1466c7a75965be7ea52b64ad51683a60f9da47aecb9c942e57186fa584a753
ai_provenance:
  agent_id: automation-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-12T01:33:04Z
  source_artifacts:
    - id: CAP-001-integration-tests
      version: "2"
    - id: CAP-001-integration-tests-automation-tasks
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Review: CAP-001-integration-tests — Version 2

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **PASS-WITH-WARNINGS** |
| Test cases | 27/27 verified |
| Automation tasks | 30/30 verified |
| Required commands | 18/18 passed |
| Findings | 3 |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 3 · **total 3**

Run as the independent review step of an attended `$automation-run`, under the
unattended-mode rules (`docs/unattended-mode.md`): no question was asked and no
decision was needed. The reviewer did not plan, code or rework anything in this
change set. Under `owner-allowed` the same owner may act on this review; no
second reviewer is required. This review records evidence only and approves
nothing.

## Review Subject

| Item | Value |
| --- | --- |
| Test specification | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests.md` (CAP-001-integration-tests v2, draft; TC-INT-001 to TC-INT-027; unchanged since review v1, same content revision) |
| Automation task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests-automation-tasks.md` (CAP-001-integration-tests-automation-tasks v3, draft; 30 tasks, all checked; `source_artifacts` cites CAP-001-integration-tests version "2"; `last_reworked_review: integration-tests-automation-review-v1.md`) |
| Component repository | `repos/factorflow-v2/FactorFlow-v2` (`FactorFlow-v2`, the plan's only `Component(s)` entry; also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-automation` at `192584db80b3adaa1ec5212aac263388e0632e57` |
| Working tree | Clean before and after validation (`git status --porcelain` empty); no staged, unstaged or untracked changes |
| Automation commits | v1 subject: `26cfe3c`, `9d41d50`. Since v1: `65b95a4` (AR-002 rework), `82607c5` (plan v3, T026–T030, owner direction 2026-10-11), `9e410b2` (AR-001 rework: T026–T030) |
| Reviewed state revision | `sha256:e7ac37e81ee50bedf62de3ad5ea1e8fe18922fc03446de02101c63d20f6647f3` (`pipeline-state.py automation-revision`; identical before and after validation) |

The change set was derived from git. `git diff --stat 82db294..HEAD` (v1
reviewed HEAD to now) shows only the three commits above touching code or the
plan, plus review reports (`6937e5a` this spec's v1; `e0dd4ae`, `192584d` the
E2E reviews), which are documentation. The table below is the full automation
change set for this specification: the 13 files v1 reviewed, which are
unchanged since v1 except `tests/unit/test_massive_retry.py`, plus the three
files `9e410b2` added or changed. `tests/e2e/support/massive_stub.py` and
`tests/e2e/support/acquisition.ts` are shared with the E2E automation; only
their TC-INT-027 additions are in this review's subject.

### Changed Files

| File | Change |
| --- | --- |
| `tests/e2e/acquisition-stack-stub.spec.ts` | added in 9e410b2: the TC-INT-027 Playwright test (T028) |
| `tests/e2e/support/acquisition.ts` | modified in 9e410b2: stubRequests and ingestionProcessIsRunning helpers, Supports line (T027) |
| `tests/e2e/support/massive_stub.py` | modified in 9e410b2: request log in StubState, GET /__stub/requests control, reset clears the log, docstring (T026) |
| `tests/unit/test_massive_retry.py` | added in 26cfe3c (T002, T021, T022); modified in 65b95a4: TC-INT-026 trace moved below the parametrize decorator (AR-002) |
| `tests/integration/test_api_coverage.py` | modified in v1 subject: TC-INT-017 and TC-INT-018 traceability (T006); unchanged since v1 |
| `tests/integration/test_api_health.py` | modified in v1 subject: TC-INT-020 traceability (T008); unchanged since v1 |
| `tests/integration/test_api_instruments.py` | modified in v1 subject: TC-INT-001 to 005 traceability and envelope/code assertions (T003, T015, T016); unchanged since v1 |
| `tests/integration/test_api_pagination.py` | modified in v1 subject: TC-INT-019 traceability (T007); unchanged since v1 |
| `tests/integration/test_api_runs.py` | modified in v1 subject: TC-INT-009 to 016 traceability, assertions and new queued-cancel test (T005, T017, T018, T019); unchanged since v1 |
| `tests/integration/test_api_settings.py` | modified in v1 subject: TC-INT-006 to 008 traceability (T004); unchanged since v1 |
| `tests/integration/test_runner_isolation.py` | modified in v1 subject: TC-INT-025 and 026 traceability (T014); unchanged since v1 |
| `tests/unit/test_massive_actions.py` | modified in v1 subject: TC-INT-024 traceability and request-argument assertions (T012, T020); unchanged since v1 |
| `tests/unit/test_massive_bars.py` | modified in v1 subject: TC-INT-022 traceability (T010); unchanged since v1 |
| `tests/unit/test_massive_client_governor_integration.py` | modified in v1 subject: TC-INT-025 traceability (T013); unchanged since v1 |
| `tests/unit/test_massive_reference.py` | modified in v1 subject: TC-INT-021 and 025 traceability (T009); unchanged since v1 |
| `tests/unit/test_massive_financials.py` | modified in v1 subject: TC-INT-023 traceability (T011); unchanged since v1 |

## Test Case and Traceability Verification

TC-INT-001 to TC-INT-026: the traced tests and the assertions v1 verified are
unchanged (no diff since `82db294` in any of their files except the comment
move in `tests/unit/test_massive_retry.py`). Each was re-run fresh here in the
full `uv run pytest` (932 passed) and the postgres integration suite (274
passed), and the 26-ID and 27-ID traceability loops find every ID.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-INT-001 | VERIFIED | `tests/integration/test_api_instruments.py::test_list_filters_and_counts`, `::test_list_cursor_pagination` | Unchanged since v1; passes |
| TC-INT-002 | VERIFIED | `tests/integration/test_api_instruments.py::test_add_mixed_batch_response_shape` | Unchanged since v1; passes |
| TC-INT-003 | VERIFIED | `tests/integration/test_api_instruments.py::test_add_status_codes` | Unchanged since v1; passes |
| TC-INT-004 | VERIFIED | `tests/integration/test_api_instruments.py::test_retire_status_codes` | Unchanged since v1; passes |
| TC-INT-005 | VERIFIED | `tests/integration/test_api_instruments.py::test_retire_status_codes`, `::test_error_envelope_shape` | Unchanged since v1; passes |
| TC-INT-006 | VERIFIED | `tests/integration/test_api_settings.py::test_get_depth_when_unset` | Unchanged since v1; passes |
| TC-INT-007 | VERIFIED | `tests/integration/test_api_settings.py::test_put_depth_accepts_bounded_value` | Unchanged since v1; passes |
| TC-INT-008 | VERIFIED | `tests/integration/test_api_settings.py::test_put_depth_rejects_invalid`, `::test_error_envelope_shape_on_settings` | Unchanged since v1; passes |
| TC-INT-009 | VERIFIED | `tests/integration/test_api_runs.py::test_start_with_active_run_returns_202_queued_behind_set` | Unchanged since v1; passes |
| TC-INT-010 | VERIFIED | `tests/integration/test_api_runs.py::test_start_no_depth_returns_409_history_depth_not_set`, `::test_start_no_active_instruments_returns_409_no_active_instruments` | Unchanged since v1; passes |
| TC-INT-011 | VERIFIED | `tests/integration/test_api_runs.py::test_list_runs_reverse_chronological_order`, `::test_list_runs_state_filter`, `::test_list_runs_cursor_continuation_no_gaps` | Unchanged since v1; passes |
| TC-INT-012 | VERIFIED | `tests/integration/test_api_runs.py::test_get_run_detail_returns_run_counts_and_results`, `::test_api_detail_includes_sql_outcome_counts_and_symbols` | Unchanged since v1; passes |
| TC-INT-013 | VERIFIED | `tests/integration/test_api_runs.py::test_get_run_detail_unknown_returns_404` | Unchanged since v1; passes |
| TC-INT-014 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_running_run_returns_202_cancelling` | Unchanged since v1; passes |
| TC-INT-015 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_queued_run_returns_202_cancelled`, `::test_cancel_queued_run_leaves_active_run_unaffected` | Unchanged since v1; passes |
| TC-INT-016 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_terminal_run_returns_409_run_already_terminal`, `::test_cancel_unknown_run_returns_404` | Unchanged since v1; passes |
| TC-INT-017 | VERIFIED | `tests/integration/test_api_coverage.py` (six tests named in T006) | Unchanged since v1; passes |
| TC-INT-018 | VERIFIED | `tests/integration/test_api_coverage.py::test_inverted_range_is_rejected` | Unchanged since v1; passes |
| TC-INT-019 | VERIFIED | `tests/integration/test_api_pagination.py::test_coverage_page_size_defaults_and_caps` | Unchanged since v1; passes |
| TC-INT-020 | VERIFIED | `tests/integration/test_api_health.py::test_health_reports_the_most_recent_terminal_run` | Unchanged since v1; passes |
| TC-INT-021 | VERIFIED | `tests/unit/test_massive_reference.py::test_fetch_reference_uses_the_single_ticker_endpoint_only`, `::test_fetch_reference_returns_product_shaped_reference` | Mocked at the SDK `RESTClient` per owner direction 2026-10-07; passes |
| TC-INT-022 | VERIFIED | `tests/unit/test_massive_bars.py::test_fetch_daily_bars_requests_multiplier_1_day_timespan_and_inclusive_dates`, `::test_fetch_daily_bars_returns_all_rows_from_a_two_page_response_in_order` | Same boundary; passes |
| TC-INT-023 | VERIFIED | `tests/unit/test_massive_financials.py::test_fetch_financials_queries_the_three_statement_endpoints_for_the_symbol`, `::test_fetch_financials_returns_a_complete_result_for_a_covered_symbol` | Passes |
| TC-INT-024 | VERIFIED | `tests/unit/test_massive_actions.py::test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol` | Passes |
| TC-INT-025 | VERIFIED | `tests/unit/test_massive_reference.py::test_fetch_reference_raises_instrument_not_found_for_unknown_symbol`, `tests/unit/test_massive_client_governor_integration.py::test_a_first_page_provider_failure_surfaces_as_the_typed_error`, `tests/integration/test_runner_isolation.py::test_not_found_instrument_is_recorded_and_run_continues`, `tests/unit/test_massive_retry.py::test_rate_limited_responses_are_paced_without_consuming_attempts` | Passes; runner half per DEC-0024 |
| TC-INT-026 | VERIFIED | `tests/unit/test_massive_retry.py::test_timeouts_and_server_errors_retry_to_the_attempt_limit[timeout]`, `[server-error]`, `tests/integration/test_runner_isolation.py::test_provider_unavailable_is_recorded_and_run_continues` | Trace now directly above the `def`, below the decorator (AR-002 resolved); passes |
| TC-INT-027 | VERIFIED | `tests/e2e/acquisition-stack-stub.spec.ts` › "TC-INT-027: the E2E acquisition stack reaches the loopback Massive stub" | `// Implements TC-INT-027` directly above `test(`; title starts with the TC ID. Steps 1–5 map to: health 200 on 8125; `ingestionProcessIsRunning()` true; `POST /api/acquisition-runs` 202 and `run_id`; `waitForRunState` to any of the five `_TERMINAL_STATES`; `stubRequests()` non-empty and containing `/v3/reference/tickers/STB`. Preconditions (depth, active `STB`) set at the HTTP boundary after a `resetAcquisitionStore()` that also clears the stub log, so the requests are this run's. Passed in `npm run test:e2e` (18/18) and 3/3 with `--repeat-each=3`. A regression where the ingestion process exits or refuses to start fails step 2 (or step 4); a regression that points the runner elsewhere fails step 5. See AR-003 and AR-004 for two weak spots |

Bidirectional traceability holds: every TC-INT ID maps to a task in the plan's
traceability table and to at least one `# Implements` or `// Implements` line,
and every new test or assertion cites a TC-INT ID.

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | Independent Validation rows 1, 6, 7 | Baseline reproduced fresh |
| T002 | VERIFIED | `tests/unit/test_massive_retry.py` | Unchanged except the AR-002 comment move |
| T003 | VERIFIED | `tests/integration/test_api_instruments.py` | Unchanged since v1 |
| T004 | VERIFIED | `tests/integration/test_api_settings.py` | Unchanged since v1 |
| T005 | VERIFIED | `tests/integration/test_api_runs.py` | Unchanged since v1 |
| T006 | VERIFIED | `tests/integration/test_api_coverage.py` | Unchanged since v1 |
| T007 | VERIFIED | `tests/integration/test_api_pagination.py` | Unchanged since v1 |
| T008 | VERIFIED | `tests/integration/test_api_health.py` | Unchanged since v1 |
| T009 | VERIFIED | `tests/unit/test_massive_reference.py` | Unchanged since v1 |
| T010 | VERIFIED | `tests/unit/test_massive_bars.py` | Unchanged since v1 |
| T011 | VERIFIED | `tests/unit/test_massive_financials.py` | Unchanged since v1 |
| T012 | VERIFIED | `tests/unit/test_massive_actions.py` | Unchanged since v1 |
| T013 | VERIFIED | `tests/unit/test_massive_client_governor_integration.py` | Unchanged since v1 |
| T014 | VERIFIED | `tests/integration/test_runner_isolation.py` | Unchanged since v1 |
| T015 | VERIFIED | `tests/integration/test_api_instruments.py::test_add_status_codes` | Unchanged since v1 |
| T016 | VERIFIED | `tests/integration/test_api_instruments.py::test_retire_status_codes` | Unchanged since v1 |
| T017 | VERIFIED | `tests/integration/test_api_runs.py::test_start_with_active_run_returns_202_queued_behind_set` | Unchanged since v1 |
| T018 | VERIFIED | `tests/integration/test_api_runs.py::test_get_run_detail_unknown_returns_404` | Unchanged since v1 |
| T019 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_queued_run_leaves_active_run_unaffected` | Unchanged since v1 |
| T020 | VERIFIED | `tests/unit/test_massive_actions.py` | Unchanged since v1 |
| T021 | VERIFIED | `tests/unit/test_massive_retry.py::test_rate_limited_responses_are_paced_without_consuming_attempts` | Passes |
| T022 | VERIFIED | `tests/unit/test_massive_retry.py::test_timeouts_and_server_errors_retry_to_the_attempt_limit` | Comment now below the decorator per the plan convention |
| T023 | VERIFIED | Independent Validation rows 3–7 | All pass |
| T024 | VERIFIED | Independent Validation rows 8–9 | Run here with Docker 28.3.2 |
| T025 | VERIFIED | Independent Validation row 19 | Prints nothing |
| T026 | VERIFIED | `tests/e2e/support/massive_stub.py` | `_requests` under `_lock`; `record`, `requests()` (copy), `reset()` clears; `GET /__stub/requests` answered first and not recorded; other GETs recorded as `parts.path` before `wait_if_held`, no query string; docstring and Supports updated; provider responses, modes and holds unchanged |
| T027 | VERIFIED | `tests/e2e/support/acquisition.ts` | `stubRequests()` throws on non-OK like `stubControl`; `ingestionProcessIsRunning()` uses `execFileSync("pgrep", ["-f", …])`, false only on status 1, rethrows otherwise; Supports line updated. Pattern scope see AR-003 |
| T028 | VERIFIED | `tests/e2e/acquisition-stack-stub.spec.ts` | Header, `beforeEach`, steps 1–5 and setup as planned. Reads `run_id`, which is what `RunStartResponse` returns (`src/factorflow/api/models.py`); the plan text says `run.id` (AR-005). Run reaches terminal, so no run is left non-terminal |
| T029 | VERIFIED | Independent Validation rows 3, 4, 6, 12–17 | `npm run test:e2e` 18 passed; no `factorflow-e2e-postgres` container afterwards |
| T030 | VERIFIED | Independent Validation row 18 | Prints nothing: 27/27 traced |

## Independent Validation

All commands run from `repos/factorflow-v2/FactorFlow-v2` (repository root) on
2026-10-11 (host-local) with Docker server 28.3.2 available, at
`192584db80b3adaa1ec5212aac263388e0632e57`.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 46 packages resolved, 43 checked |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel into gitignored `dist/` |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed (covers `tests/e2e/support/massive_stub.py`) |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 184 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 47 source files |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 658 passed, 274 deselected, 2 warnings (stub not collected) |
| `uv run pytest tests/integration --collect-only -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 283 tests collected |
| `uv run pytest tests/integration -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 274 passed, 9 deselected (248 s) |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 932 passed / 932, 2 warnings (215 s) |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | allow-scripts warnings only |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite bundle into gitignored `src/factorflow/api/static/` |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 297 passed / 297 in 41 files |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 97 files, no fixes |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 97 files, no fixes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No errors; `tsconfig.json` includes only `web/src`, so `tests/e2e` is not type-checked (acknowledged in the plan Notes; tracked as E2E review v3 AR-004) |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 18 passed / 18 (2.9 min), including TC-INT-027 as test 1/18; `posttest:e2e` ran |
| `docker ps -a --filter name=factorflow-e2e-postgres --format '{{.Names}}'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Empty: container removed |
| `for n in $(seq -w 1 27); do grep -rqE "(#\|//) Implements TC-INT-0$n\b" tests \|\| echo "missing TC-INT-0$n"; done` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output: 27/27 traced (T030) |
| `for n in $(seq -w 1 26); do grep -rqE "# Implements TC-INT-0$n\b" tests \|\| echo "missing TC-INT-0$n"; done` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supplementary (T025, superseded by T030): no output |
| `npx playwright test tests/e2e/acquisition-stack-stub.spec.ts --repeat-each=3` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supplementary determinism check: 3 passed / 3 on a fresh stack; stub log shows `GET /v3/reference/tickers/STB` in each repetition |
| `npm run posttest:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supplementary cleanup after the repeat run |

Required commands are the first 18 rows: the plan's Validation Plan (tech-stack
Validation Commands, the Docker-only suites, `npm run test:e2e`) and the T029
container check and T030 traceability loop. 18/18 passed. The working tree was
clean after validation and the state fingerprint was unchanged; every artifact
the commands produced is gitignored.

## Findings

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-003 | LOW | New. `tests/e2e/support/acquisition.ts` `ingestionProcessIsRunning()` runs `pgrep -f tests/e2e/support/ingestion_e2e_main.py`, which matches that command line from any checkout or worktree on the host, and any orphan left when Playwright's teardown escalates to SIGKILL (the `run-e2e-server.sh` header notes no trap catches it). Nothing ties the match to the process this run's `run-e2e-server.sh` started. The pattern follows plan T027 and owner direction 2026-10-11 exactly | Step 2 of TC-INT-027 could pass while this stack's ingestion process has refused to start, if another matching process exists on the host. Step 4 (a terminal run) is the backstop and usually still fails such a regression, so the gap is narrow | In a later plan revision, scope the liveness check to this stack, for example have `run-e2e-server.sh` write the ingestion PID to a known file and check it with `kill -0`, or match the full command line including this checkout's path. Owner may also accept as-is |
| AR-004 | LOW | New. `tests/e2e/support/massive_stub.py` records requests only in `do_GET`, always as method `"GET"`; `do_POST` records nothing. So the spec's assertion `for (const entry of received) expect(entry.method).toBe("GET")` in `tests/e2e/acquisition-stack-stub.spec.ts` cannot fail | The "provider `GET` requests" clause rests on the path assertion (`/v3/reference/tickers/STB`), not on the method check; a client regression that sent a non-GET provider request would not be caught by the method assertion | Record non-control requests in the other handlers too (with their real method), or drop the method loop and say in the spec comment that the stub logs GETs only. Not blocking |
| AR-005 | LOW | New. Plan v3 T028 step 3 says "Keep `run.id`", but `POST /api/acquisition-runs` returns `RunStartResponse` with `run_id` (`src/factorflow/api/models.py`), and the test correctly reads `(await started.json()).run_id` | Plan text no longer describes the implementation exactly; no behavioural impact | Correct the wording to `run_id` in the next plan revision |

## Previous Review Disposition

Both findings of `integration-tests-automation-review-v1.md` are resolved.
New findings in this version are numbered from AR-003 so that no ID is reused.

| Prior Finding | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| v1 AR-001 | HIGH | Resolved | Plan v3 (`82607c5`) cites spec version "2" and plans TC-INT-027 as T026–T030 under owner direction 2026-10-11; `9e410b2` implements them. `tests/e2e/acquisition-stack-stub.spec.ts` asserts ingestion liveness after health, a terminal run, and the stub's request log; it passes in `npm run test:e2e` (18/18) and 3/3 repeated; the 27-ID loop prints nothing |
| v1 AR-002 | LOW | Resolved | `65b95a4` moved `# Implements TC-INT-026` below `@pytest.mark.parametrize(...)`, directly above `def test_timeouts_and_server_errors_retry_to_the_attempt_limit`, per the plan's traceability convention |

## Verdict

**Verdict:** PASS-WITH-WARNINGS

All 27 test cases and 30 tasks are verified against code and assertions, and
all 18 required commands pass on a Docker host. Both v1 findings are resolved.
Three new LOW findings remain and none blocks: a host-wide `pgrep` pattern
(AR-003), a method assertion that cannot fail (AR-004), and a stale `run.id`
in the plan text (AR-005). Direct this to the final completion check.
