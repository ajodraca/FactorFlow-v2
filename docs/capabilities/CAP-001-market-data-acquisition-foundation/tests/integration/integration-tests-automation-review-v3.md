---
artifact_schema_version: 1
artifact_id: CAP-001-integration-tests-automation-review
artifact_type: automation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-14
updated: 2026-10-14
test_spec: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests.md
automation_tasks: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests-automation-tasks.md
reviewed_at: 2026-10-15T03:02:57Z
reviewed_state_revision: sha256:74b5a227951ba0c9160a5c7fede18c6e05832bff4098ade4ca8ab4f098dc8ef7
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
  timestamp: 2026-10-15T03:02:57Z
  source_artifacts:
    - id: CAP-001-integration-tests
      version: "2"
    - id: CAP-001-integration-tests-automation-tasks
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Review: CAP-001-integration-tests — Version 3

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **PASS-WITH-WARNINGS** |
| Test cases | 27/27 verified |
| Automation tasks | 30/30 verified |
| Required commands | 19/19 passed |
| Findings | 4 |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 3 · **total 4**

This review ran as the independent review step of an attended `$automation-run`, under the
unattended-mode rules (`docs/unattended-mode.md`). No question was asked and no
decision was needed. The reviewer did not plan, code or rework anything in this
change set. Under `owner-allowed`, the same owner may act on this review and no
second reviewer is required. This review records evidence only and approves
nothing.

The required-commands count is against the committed review subject.
`npm run lint` and `npm run format` fail or hang in the working directory. The
cause is gitignored `uv build` output under `build/` that Biome does not
exclude. That output is not part of this review's subject. Both commands pass
against a `git archive HEAD` snapshot of the same commit. See Independent
Validation and AR-006.

## Review Subject

| Item | Value |
| --- | --- |
| Test specification | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests.md` (CAP-001-integration-tests v2, draft; TC-INT-001 to TC-INT-027). Unchanged since review v2, same content revision |
| Automation task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests-automation-tasks.md` (CAP-001-integration-tests-automation-tasks v3, draft; 30 tasks, all checked). Unchanged since review v2, same content revision |
| Component repository | `repos/factorflow-v2/FactorFlow-v2` (`FactorFlow-v2`). This is the plan's only `Component(s)` entry and also the project repo |
| Branch | `usr/alvaro-de-jodra/CAP-001-automation` at `194e3b2f93ec05a2b58659e0d4a073f0f6d86e51` |
| Working tree | Clean before and after validation (`git status --porcelain` empty). No staged, unstaged or untracked changes |
| Since review v2 | v2 commit `43ef0e1`; doc-sync merge `ef2dd7c`. Story commits that touch this subject: E1-S7 `2f985e4` (TestClient `base_url`), `ee7180d`, `7511706` (Host/Origin middleware). E1-S8 `6e45759` (loopback DB URL placeholders), `c8dd959` (migrations moved to `src/factorflow/db/migrations/`, `MIGRATIONS_DIR`). E1-S9 `528eb76` (package data now includes `api/static/**/*`) |
| Reviewed state revision | `sha256:74b5a227951ba0c9160a5c7fede18c6e05832bff4098ade4ca8ab4f098dc8ef7` (`pipeline-state.py automation-revision`, taken after validation on a clean tree) |

This review derived the change set from git. For each file in v2's subject,
`git diff 43ef0e1 HEAD` shows no change to these files:

- every `tests/unit/test_massive_*.py` file
- `tests/integration/test_runner_isolation.py`
- `tests/e2e/acquisition-stack-stub.spec.ts`
- `tests/e2e/support/massive_stub.py`

`tests/e2e/support/acquisition.ts` changed one doc comment, a path rename
(`migrations/` to `src/factorflow/db/migrations/`). The six traced
`tests/integration/test_api_*.py` files changed only in fixtures:

- They import `MIGRATIONS_DIR` from `factorflow.db.migrate_main` and no longer
  build a repo-relative `migrations/` path.
- They pass `base_url="http://127.0.0.1:8000"` to `TestClient`.

No `# Implements` line, test body or assertion changed. Eight other integration
modules and `tests/conftest.py` received the same mechanical edits. They
support this suite's fixtures, so they are recorded below. Only this
specification's traceability is reviewed in them. `tests/e2e/fixtures/coverage-seed.sql`
changed one comment and belongs to the E2E subject.

The base URL change is required. The E1-S7 middleware (`src/factorflow/api/app.py`,
`allowed_hosts`) refuses any `Host` that is not a loopback host on
`ApiSettings.port`, so the `TestClient` default `testserver` would be refused.
No integration `TestClient(` call is left without the loopback `base_url`
(grep).

The `MIGRATIONS_DIR` change makes the fixtures apply the shipped migration
files. If that path regressed, the fixtures would apply nothing or fail to read
a file, so it fails loudly. No test still builds the old path. The only
mention, in `tests/unit/test_migrations_location.py`, is E1-S8's own check of
the move.

### Changed Files

| File | Change |
| --- | --- |
| `tests/e2e/acquisition-stack-stub.spec.ts` | Added in 9e410b2: the TC-INT-027 Playwright test (T028). Unchanged since v2 |
| `tests/e2e/support/acquisition.ts` | Modified in 9e410b2: stubRequests and ingestionProcessIsRunning helpers (T027). Since v2: one comment path updated by E1-S8 |
| `tests/e2e/support/massive_stub.py` | Modified in 9e410b2: request log and GET /__stub/requests (T026). Unchanged since v2 |
| `tests/unit/test_massive_retry.py` | Added in 26cfe3c (T002, T021, T022); modified in 65b95a4 (AR-002). Unchanged since v2 |
| `tests/integration/test_api_coverage.py` | TC-INT-017/018 traceability (T006). Since v2: `MIGRATIONS_DIR` import (E1-S8), TestClient loopback `base_url` (E1-S7) |
| `tests/integration/test_api_health.py` | TC-INT-020 traceability (T008). Since v2: `MIGRATIONS_DIR` import (E1-S8), loopback `base_url` in four TestClients (E1-S7) |
| `tests/integration/test_api_instruments.py` | TC-INT-001 to 005 (T003, T015, T016). Since v2: loopback `base_url` (E1-S7) |
| `tests/integration/test_api_pagination.py` | TC-INT-019 (T007). Since v2: `MIGRATIONS_DIR` import (E1-S8), loopback `base_url` (E1-S7) |
| `tests/integration/test_api_runs.py` | TC-INT-009 to 016 (T005, T017, T018, T019). Since v2: `MIGRATIONS_DIR` import (E1-S8), loopback `base_url` (E1-S7) |
| `tests/integration/test_api_settings.py` | TC-INT-006 to 008 (T004). Since v2: loopback `base_url` (E1-S7) |
| `tests/integration/test_runner_isolation.py` | TC-INT-025/026 (T014). Unchanged since v2 |
| `tests/unit/test_massive_actions.py` | TC-INT-024 (T012, T020). Unchanged since v2 |
| `tests/unit/test_massive_bars.py` | TC-INT-022 (T010). Unchanged since v2 |
| `tests/unit/test_massive_client_governor_integration.py` | TC-INT-025 (T013). Unchanged since v2 |
| `tests/unit/test_massive_reference.py` | TC-INT-021/025 (T009). Unchanged since v2 |
| `tests/unit/test_massive_financials.py` | TC-INT-023 (T011). Unchanged since v2 |
| `tests/conftest.py` | Modified since v2 (E1-S8): the shared `MIGRATION_000N_PATH` constants now derive from `MIGRATIONS_DIR`, and a docstring path was updated. The suite's migrated fixtures depend on it |
| `tests/integration/test_api_binding.py` | Modified since v2. E1-S7 sets `FACTORFLOW_API_PORT` to the free port and rebuilds `app_main.app`, so the Host middleware allows it. E1-S8 adds a loopback placeholder DB URL. Not traced to TC-INT |
| `tests/integration/test_api_static_mount.py` | Modified since v2: loopback placeholder DB URL (E1-S8) and `base_url` (E1-S7). Not traced to TC-INT |
| `tests/integration/test_instrument_constraints.py` | Modified since v2: `MIGRATIONS_DIR` import (E1-S8). Not traced to TC-INT |
| `tests/integration/test_migration_0001.py` | Modified since v2: `MIGRATIONS_DIR` import (E1-S8). Not traced to TC-INT |
| `tests/integration/test_migration_idempotence.py` | Modified since v2: `MIGRATIONS_DIR` import (E1-S8). Not traced to TC-INT |
| `tests/integration/test_migrator_empty.py` | Modified since v2: `MIGRATIONS_DIR` import (E1-S8). Not traced to TC-INT |
| `tests/integration/test_observation_append.py` | Modified since v2: `MIGRATIONS_DIR` import (E1-S8). Not traced to TC-INT |
| `tests/integration/test_owner_setting.py` | Modified since v2: `MIGRATIONS_DIR` import (E1-S8). Not traced to TC-INT |

## Test Case and Traceability Verification

For TC-INT-001 to TC-INT-027, the traced tests, their `# Implements` and
`// Implements` lines, and their assertions are byte-identical to review v2.
Only fixture setup changed, as described in Review Subject. Each test was re-run
fresh here in three runs:

- `uv run pytest tests/integration -q`: 283 passed
- full `uv run pytest -q`: 1060 passed
- `npm run test:e2e`: 18 passed

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-INT-001 | VERIFIED | `tests/integration/test_api_instruments.py::test_list_filters_and_counts`, `::test_list_cursor_pagination` | Fixture `base_url` only; passes |
| TC-INT-002 | VERIFIED | `tests/integration/test_api_instruments.py::test_add_mixed_batch_response_shape` | Passes |
| TC-INT-003 | VERIFIED | `tests/integration/test_api_instruments.py::test_add_status_codes` | Passes |
| TC-INT-004 | VERIFIED | `tests/integration/test_api_instruments.py::test_retire_status_codes` | Passes |
| TC-INT-005 | VERIFIED | `tests/integration/test_api_instruments.py::test_retire_status_codes`, `::test_error_envelope_shape` | Passes |
| TC-INT-006 | VERIFIED | `tests/integration/test_api_settings.py::test_get_depth_when_unset` | Fixture `base_url` only; passes |
| TC-INT-007 | VERIFIED | `tests/integration/test_api_settings.py::test_put_depth_accepts_bounded_value` | Passes |
| TC-INT-008 | VERIFIED | `tests/integration/test_api_settings.py::test_put_depth_rejects_invalid`, `::test_error_envelope_shape_on_settings` | Passes |
| TC-INT-009 | VERIFIED | `tests/integration/test_api_runs.py::test_start_with_active_run_returns_202_queued_behind_set` | Fixture now globs `MIGRATIONS_DIR`; passes |
| TC-INT-010 | VERIFIED | `tests/integration/test_api_runs.py::test_start_no_depth_returns_409_history_depth_not_set`, `::test_start_no_active_instruments_returns_409_no_active_instruments` | Passes |
| TC-INT-011 | VERIFIED | `tests/integration/test_api_runs.py::test_list_runs_reverse_chronological_order`, `::test_list_runs_state_filter`, `::test_list_runs_cursor_continuation_no_gaps` | Passes |
| TC-INT-012 | VERIFIED | `tests/integration/test_api_runs.py::test_get_run_detail_returns_run_counts_and_results`, `::test_api_detail_includes_sql_outcome_counts_and_symbols` | Passes |
| TC-INT-013 | VERIFIED | `tests/integration/test_api_runs.py::test_get_run_detail_unknown_returns_404` | Passes |
| TC-INT-014 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_running_run_returns_202_cancelling` | Passes |
| TC-INT-015 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_queued_run_returns_202_cancelled`, `::test_cancel_queued_run_leaves_active_run_unaffected` | Passes |
| TC-INT-016 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_terminal_run_returns_409_run_already_terminal`, `::test_cancel_unknown_run_returns_404` | Passes |
| TC-INT-017 | VERIFIED | `tests/integration/test_api_coverage.py` (six tests named in T006) | Fixture `MIGRATIONS_DIR` and `base_url`; passes |
| TC-INT-018 | VERIFIED | `tests/integration/test_api_coverage.py::test_inverted_range_is_rejected` | Passes |
| TC-INT-019 | VERIFIED | `tests/integration/test_api_pagination.py::test_coverage_page_size_defaults_and_caps` | Fixture `MIGRATIONS_DIR` and `base_url`; passes |
| TC-INT-020 | VERIFIED | `tests/integration/test_api_health.py::test_health_reports_the_most_recent_terminal_run` | `_highest_migration_version()` now reads the shipped `MIGRATIONS_DIR`, so the health assertion compares against the migrations that are actually shipped; passes |
| TC-INT-021 | VERIFIED | `tests/unit/test_massive_reference.py::test_fetch_reference_uses_the_single_ticker_endpoint_only`, `::test_fetch_reference_returns_product_shaped_reference` | Unchanged; SDK `RESTClient` boundary per owner direction 2026-10-07; passes |
| TC-INT-022 | VERIFIED | `tests/unit/test_massive_bars.py::test_fetch_daily_bars_requests_multiplier_1_day_timespan_and_inclusive_dates`, `::test_fetch_daily_bars_returns_all_rows_from_a_two_page_response_in_order` | Unchanged; passes |
| TC-INT-023 | VERIFIED | `tests/unit/test_massive_financials.py::test_fetch_financials_queries_the_three_statement_endpoints_for_the_symbol`, `::test_fetch_financials_returns_a_complete_result_for_a_covered_symbol` | Unchanged; passes |
| TC-INT-024 | VERIFIED | `tests/unit/test_massive_actions.py::test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol` | Unchanged; passes |
| TC-INT-025 | VERIFIED | `tests/unit/test_massive_reference.py::test_fetch_reference_raises_instrument_not_found_for_unknown_symbol`, `tests/unit/test_massive_client_governor_integration.py::test_a_first_page_provider_failure_surfaces_as_the_typed_error`, `tests/integration/test_runner_isolation.py::test_not_found_instrument_is_recorded_and_run_continues`, `tests/unit/test_massive_retry.py::test_rate_limited_responses_are_paced_without_consuming_attempts` | Unchanged; passes |
| TC-INT-026 | VERIFIED | `tests/unit/test_massive_retry.py::test_timeouts_and_server_errors_retry_to_the_attempt_limit[timeout]`, `[server-error]`, `tests/integration/test_runner_isolation.py::test_provider_unavailable_is_recorded_and_run_continues` | Unchanged; passes |
| TC-INT-027 | VERIFIED | `tests/e2e/acquisition-stack-stub.spec.ts` › "TC-INT-027: the E2E acquisition stack reaches the loopback Massive stub" | Unchanged since v2; passed in `npm run test:e2e` (18/18). AR-003 and AR-004 still apply |

Traceability holds in both directions. Every TC-INT ID maps to a plan task and
to at least one `# Implements` or `// Implements` line. The 27-ID loop prints
nothing. No new test was added since v2.

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | Independent Validation rows 1–7 | Baseline reproduced fresh |
| T002 | VERIFIED | `tests/unit/test_massive_retry.py` | Unchanged since v2 |
| T003 | VERIFIED | `tests/integration/test_api_instruments.py` | Traceability lines unchanged; fixture `base_url` only |
| T004 | VERIFIED | `tests/integration/test_api_settings.py` | Same |
| T005 | VERIFIED | `tests/integration/test_api_runs.py` | Same, plus `MIGRATIONS_DIR` |
| T006 | VERIFIED | `tests/integration/test_api_coverage.py` | Same, plus `MIGRATIONS_DIR` |
| T007 | VERIFIED | `tests/integration/test_api_pagination.py` | Same, plus `MIGRATIONS_DIR` |
| T008 | VERIFIED | `tests/integration/test_api_health.py` | Same, plus `MIGRATIONS_DIR` |
| T009 | VERIFIED | `tests/unit/test_massive_reference.py` | Unchanged since v2 |
| T010 | VERIFIED | `tests/unit/test_massive_bars.py` | Unchanged since v2 |
| T011 | VERIFIED | `tests/unit/test_massive_financials.py` | Unchanged since v2 |
| T012 | VERIFIED | `tests/unit/test_massive_actions.py` | Unchanged since v2 |
| T013 | VERIFIED | `tests/unit/test_massive_client_governor_integration.py` | Unchanged since v2 |
| T014 | VERIFIED | `tests/integration/test_runner_isolation.py` | Unchanged since v2 |
| T015 | VERIFIED | `tests/integration/test_api_instruments.py::test_add_status_codes` | Assertions unchanged |
| T016 | VERIFIED | `tests/integration/test_api_instruments.py::test_retire_status_codes` | Assertions unchanged |
| T017 | VERIFIED | `tests/integration/test_api_runs.py::test_start_with_active_run_returns_202_queued_behind_set` | Assertions unchanged |
| T018 | VERIFIED | `tests/integration/test_api_runs.py::test_get_run_detail_unknown_returns_404` | Assertions unchanged |
| T019 | VERIFIED | `tests/integration/test_api_runs.py::test_cancel_queued_run_leaves_active_run_unaffected` | Assertions unchanged |
| T020 | VERIFIED | `tests/unit/test_massive_actions.py` | Unchanged since v2 |
| T021 | VERIFIED | `tests/unit/test_massive_retry.py::test_rate_limited_responses_are_paced_without_consuming_attempts` | Passes |
| T022 | VERIFIED | `tests/unit/test_massive_retry.py::test_timeouts_and_server_errors_retry_to_the_attempt_limit` | Passes |
| T023 | VERIFIED | Independent Validation rows 3–6 | All pass |
| T024 | VERIFIED | Independent Validation rows 8–9 | Run here with Docker 28.3.2 |
| T025 | VERIFIED | Independent Validation row 19 | Prints nothing |
| T026 | VERIFIED | `tests/e2e/support/massive_stub.py` | Unchanged since v2 |
| T027 | VERIFIED | `tests/e2e/support/acquisition.ts` | Only a comment path changed since v2. AR-003 still applies |
| T028 | VERIFIED | `tests/e2e/acquisition-stack-stub.spec.ts` | Unchanged since v2; passes |
| T029 | VERIFIED | Independent Validation rows 16–17 | `npm run test:e2e` 18 passed; no `factorflow-e2e-postgres` container afterwards |
| T030 | VERIFIED | Independent Validation row 18 | Prints nothing: 27/27 traced |

## Independent Validation

All commands ran from `repos/factorflow-v2/FactorFlow-v2`, the repository root,
on 2026-10-14 (host-local), at `194e3b2f93ec05a2b58659e0d4a073f0f6d86e51`, with
Docker server 28.3.2. The exceptions are rows 12b and 13b, which ran in a
`git archive HEAD` snapshot.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 46 resolved, 43 checked |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel. Leaves gitignored `build/lib/...`, which since E1-S9 includes `api/static/**` bundles (see AR-006) |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 193 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 47 source files |
| `uv run pytest -m 'not postgres' -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 786 passed, 274 deselected, 2 warnings |
| `uv run pytest tests/integration --collect-only -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 283 tests collected |
| `uv run pytest tests/integration -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 283 passed, 2 warnings (266 s). Superset of the plan's `-m postgres` run |
| `uv run pytest -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1060 passed / 1060, 2 warnings (229 s) |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | allow-scripts warnings only |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite bundle into gitignored `src/factorflow/api/static/` |
| `npm run lint` (12a) | `repos/factorflow-v2/FactorFlow-v2` | 1 | FAIL (environment) | Every diagnostic is in gitignored `build/lib/factorflow/api/static/assets/*.js`, which is not tracked and not part of the subject (AR-006) |
| `npm run lint` (12b) | `/tmp/ff-ar3` (`git archive HEAD` snapshot, repo `node_modules` symlinked) | 0 | PASS | Biome: 97 files, no fixes (same count as v2) |
| `npm run format` (13a) | `repos/factorflow-v2/FactorFlow-v2` | n/a (killed) | FAIL (environment) | Biome ran for over 5 min of CPU on the minified bundles under `build/` and was killed (AR-006) |
| `npm run format` (13b) | `/tmp/ff-ar3` (`git archive HEAD` snapshot) | 0 | PASS | Biome: 97 files, no fixes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No errors. `tests/e2e` is not type-checked, which the plan acknowledges |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 297 passed / 297 in 41 files |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 18 passed / 18 (2.9 min), TC-INT-027 included; `posttest:e2e` ran |
| `docker ps -a --filter name=factorflow-e2e-postgres --format '{{.Names}}'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Empty: container removed |
| `for n in $(seq -w 1 27); do grep -rqE "(#\|//) Implements TC-INT-0$n\b" tests \|\| echo "missing TC-INT-0$n"; done` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output: 27/27 traced (T030) |
| `for n in $(seq -w 1 26); do grep -rqE "# Implements TC-INT-0$n\b" tests \|\| echo "missing TC-INT-0$n"; done` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supplementary (T025): no output |
| `git status --porcelain` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Empty after all validation |

There are 19 required commands, counted as follows:

- the plan's Validation Plan: tech-stack Validation Commands, the Docker
  integration and full suites, `npm run test:e2e`, and `--collect-only`
- the T029 container check
- the T030 traceability loop
- the clean-tree check

19/19 pass against the committed subject. Lint and format count through rows
12b and 13b. Rows 12a and 13a record honestly that the same commands fail in
this working directory. Their only input outside the subject is the gitignored
`build/` tree. CI is unaffected because `uv build` runs in the `python` job and
Biome in the separate `frontend` job (`.github/workflows/validate.yml`). The
reviewer did not delete `build/`, because the only permitted write is this
report. The fingerprint was taken on a clean tree after validation.

## Findings

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-003 | LOW | Carried from v2, unchanged. `tests/e2e/support/acquisition.ts:80` `ingestionProcessIsRunning()` still runs `pgrep -f tests/e2e/support/ingestion_e2e_main.py`. That pattern matches a process from any checkout on the host, or an orphan process | Step 2 of TC-INT-027 could pass while this stack's ingestion process has failed to start. Step 4 (terminal run) is the backstop | In a later plan revision, scope the check to this stack, for example with a PID file and `kill -0`, or the owner accepts it as-is |
| AR-004 | LOW | Carried from v2, unchanged. `tests/e2e/support/massive_stub.py` records requests only in `do_GET` (line 231), as `"GET"`, so the check `expect(entry.method).toBe("GET")` (`tests/e2e/acquisition-stack-stub.spec.ts:57`) cannot fail | The method clause is not actually tested. The path assertion carries the check | Record non-control requests in the other handlers with their real method, or drop the method loop and document that the stub logs GET requests only |
| AR-005 | LOW | Carried from v2, unchanged. Plan v3 T028 step 3 (line 285) still says "Keep `run.id`". The test reads `run_id` (`tests/e2e/acquisition-stack-stub.spec.ts:50`), which matches `RunStartResponse` | Plan text is stale; no behavioural impact | Correct the wording in the next plan revision |
| AR-006 | MEDIUM | New, found during validation and outside this spec's automation. `biome.json` `files.include` contains `*.js`, which Biome 1.9 matches at any depth. `files.ignore` lists `dist/**` but not `build/**`. Since E1-S9 (`528eb76`), `pyproject.toml` package data includes `api/static/**/*`, so `uv build` copies the minified Vite bundles into gitignored `build/lib/factorflow/api/static/assets/`. Afterwards `npm run lint` exits 1 on those files and `npm run format` runs for minutes (rows 12a, 13a). Both pass on a clean snapshot (rows 12b, 13b) | Running the tech-stack Validation Commands locally, in their documented order (`uv build` before Biome), makes two required frontend gates fail or hang. A local reviewer can then mistake that for a code regression, or fail to finish validation. CI is unaffected because the jobs are separate. The automation under review is not affected | Owned by the E1-S9 / tooling configuration, not this spec's automation. Add `build/**` to `biome.json` `files.ignore` (or enable Biome's VCS ignore-file support), through the owning story or the expedited lane. Not blocking for this specification |

## Previous Review Disposition

No v2 finding has been resolved. None of the files they cite changed in
substance since `43ef0e1`, and the plan's content revision is unchanged. All
three stay open as LOW and non-blocking. The new finding continues from AR-006
so that no ID is reused.

| Prior Finding | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| v2 AR-003 | LOW | Open — carried forward as AR-003 | `tests/e2e/support/acquisition.ts` changed only a doc comment since v2. The `pgrep -f tests/e2e/support/ingestion_e2e_main.py` call at line 80 is unchanged |
| v2 AR-004 | LOW | Open — carried forward as AR-004 | `tests/e2e/support/massive_stub.py` has no diff since `43ef0e1`. `do_POST` still records nothing, and the spec's method loop at line 57 is unchanged |
| v2 AR-005 | LOW | Open — carried forward as AR-005 | The plan content revision `sha256:ab1466c7…a753` is identical to v2's. Line 285 still says "Keep `run.id`" |

## Verdict

**Verdict:** PASS-WITH-WARNINGS

All 27 test cases and 30 tasks are verified against code and assertions. Since
v2, the only changes to this subject are mechanical fixture edits from E1-S7
(loopback `base_url`, `FACTORFLOW_API_PORT`) and E1-S8 (`MIGRATIONS_DIR`). No
traced assertion or traceability line changed.

All 19 required commands pass against the committed subject on a Docker host:

- integration suite: 283 passed
- full suite: 1060 passed
- E2E suite: 18 passed

The three LOW findings from v2 (AR-003 to AR-005) remain open. One new MEDIUM
finding (AR-006) records a local Biome/`build/` interaction from E1-S9 that is
outside this automation. None blocks. Direct this to the final completion check.
