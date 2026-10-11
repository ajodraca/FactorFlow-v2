---
artifact_schema_version: 1
artifact_id: CAP-001-integration-tests-automation-tasks
artifact_type: automation-tasks
artifact_version: 2
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-09
updated: 2026-10-11
ai_provenance:
  agent_id: automation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-11T03:27:07Z
  source_artifacts:
    - id: CAP-001-integration-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Tasks: Integration Tests

**Test Specification:** `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests.md`
**Component(s)**: `FactorFlow-v2`
**External dependencies:** Massive
**Test Scope:** integration
**Branch:** `usr/alvaro-de-jodra/CAP-001-automation`
**Date:** 2026-10-07

## Summary

Version 2 replaces the 2026-09-09 plan. That plan created new files and a new
`tests/integration/conftest.py` for behaviour the repository already tests. With
traceability added, the existing pytest suite automates all 26 CAP-001
integration cases (TC-INT-001–026). Eight targeted additions cover what it
misses. Per **owner direction 2026-10-07**:

1. Where an existing test already asserts the same protocol-boundary behaviour
   as a TC-INT case, the task adds `TC-INT-NNN` traceability to that test
   alongside its TC-COMP ID. A new test or assertion is planned only where the
   existing tests miss part of the case's Expected Result.
2. TC-INT-021–026 (Massive HTTPS contract) are traced the same way to
   `tests/unit/test_massive_*.py`. Any new Massive test uses the mocking those
   tests already use: `patch("factorflow.ingestion.massive.client.RESTClient")`
   with a `_FakeResponse` or `massive.exceptions.BadResponse`.
3. There is no new `tests/integration/conftest.py`, because no planned test
   needs a fixture that does not exist.

Each mapping below was checked against the test's assertions, not its name. The
plan has 25 tasks in four phases:

- 1 baseline task
- 1 helper-module task
- 12 annotation tasks
- 8 tasks that add an assertion or a new test
- 3 validation tasks

## Test Case Traceability

"Annotate" means add a `# Implements TC-INT-NNN` line. "Add" means add the
missing assertion or test named in the row. Paths are relative to the
repository root.

| TC ID | Test Case Title | Scope | Component(s) | Automation | Tasks |
|---|---|---|---|---|---|
| TC-INT-001 | GET /api/instruments contract | integration | owner-web-app, ingestion-api | Annotate `tests/integration/test_api_instruments.py::test_list_filters_and_counts` (filters, active/retired counts) and `::test_list_cursor_pagination` (limit, cursor, `next_cursor`) | T003 |
| TC-INT-002 | POST /api/instruments contract | integration | owner-web-app, ingestion-api | Annotate `test_api_instruments.py::test_add_mixed_batch_response_shape` (201; added, reactivated, rejected separated) | T003 |
| TC-INT-003 | POST /api/instruments duplicate or malformed input | integration | owner-web-app, ingestion-api | Annotate `test_api_instruments.py::test_add_status_codes` (409, 422). Add shared-envelope assertions on the POST 409 and 422, because no test checks the envelope on POST | T003, T015 |
| TC-INT-004 | DELETE /api/instruments/{symbol} contract | integration | owner-web-app, ingestion-api | Annotate `test_api_instruments.py::test_retire_status_codes` (200, `lifecycle == "retired"`, `retired_at`) | T003 |
| TC-INT-005 | DELETE /api/instruments/{symbol} errors | integration | owner-web-app, ingestion-api | Annotate `test_api_instruments.py::test_retire_status_codes` (404, 409) and `::test_error_envelope_shape` (envelope on both). Add an assertion that the two error codes are distinct owner-facing outcomes, because no test compares them | T003, T016 |
| TC-INT-006 | GET /api/settings/history-depth contract | integration | owner-web-app, ingestion-api | Annotate `tests/integration/test_api_settings.py::test_get_depth_when_unset` (200, `years is None`) | T004 |
| TC-INT-007 | PUT /api/settings/history-depth contract | integration | owner-web-app, ingestion-api | Annotate `test_api_settings.py::test_put_depth_accepts_bounded_value` (200, saved `years`, `updated_at`) | T004 |
| TC-INT-008 | PUT /api/settings/history-depth validation | integration | owner-web-app, ingestion-api | Annotate `test_api_settings.py::test_put_depth_rejects_invalid` (422 for 0, -5, "five", 3.5) and `::test_error_envelope_shape_on_settings` (envelope on 422) | T004 |
| TC-INT-009 | POST /api/acquisition-runs contract | integration | owner-web-app, ingestion-api | Annotate `tests/integration/test_api_runs.py::test_start_with_active_run_returns_202_queued_behind_set` (202, `requested`, `queued_behind`). Add an assertion that the active run is still the only `running` run, because "without concurrent execution" is not asserted | T005, T017 |
| TC-INT-010 | POST /api/acquisition-runs prerequisite refusals | integration | owner-web-app, ingestion-api | Annotate `test_api_runs.py::test_start_no_depth_returns_409_history_depth_not_set` and `::test_start_no_active_instruments_returns_409_no_active_instruments` (409, code, run count unchanged) | T005 |
| TC-INT-011 | GET /api/acquisition-runs contract | integration | owner-web-app, ingestion-api | Annotate `test_api_runs.py::test_list_runs_reverse_chronological_order`, `::test_list_runs_state_filter` and `::test_list_runs_cursor_continuation_no_gaps` (limit, cursor, `next_cursor`) | T005 |
| TC-INT-012 | GET /api/acquisition-runs/{id} contract | integration | owner-web-app, ingestion-api | Annotate `test_api_runs.py::test_get_run_detail_returns_run_counts_and_results` (per-instrument, per-data-type results) and `::test_api_detail_includes_sql_outcome_counts_and_symbols` (count values) | T005 |
| TC-INT-013 | GET /api/acquisition-runs/{id} unknown run | integration | owner-web-app, ingestion-api | Annotate `test_api_runs.py::test_get_run_detail_unknown_returns_404` (404). Add shared-envelope assertions, because the test checks only the status | T005, T018 |
| TC-INT-014 | POST …/cancel running contract | integration | owner-web-app, ingestion-api | Annotate `test_api_runs.py::test_cancel_running_run_returns_202_cancelling` (202, `cancelling`, not `cancelled`) | T005 |
| TC-INT-015 | POST …/cancel queued contract | integration | owner-web-app, ingestion-api | Annotate `test_api_runs.py::test_cancel_queued_run_returns_202_cancelled` (202, `cancelled`). Add the new test `test_cancel_queued_run_leaves_active_run_unaffected`, because the existing test has no active run and so never asserts that the active run is unaffected | T005, T019 |
| TC-INT-016 | POST …/cancel error paths | integration | owner-web-app, ingestion-api | Annotate `test_api_runs.py::test_cancel_terminal_run_returns_409_run_already_terminal` (409, actual `state`) and `::test_cancel_unknown_run_returns_404` | T005 |
| TC-INT-017 | GET /api/coverage contract | integration | owner-web-app, ingestion-api | Annotate `tests/integration/test_api_coverage.py::test_coverage_reports_presence_ranges_and_last_acquired`, `::test_coverage_reports_gap_counts_and_availability`, `::test_symbol_filter_is_a_prefix`, `::test_lifecycle_filter_and_default_includes_retired`, `::test_date_bounds_narrow_gaps` and `::test_cursor_pages_through_every_instrument_once` | T006 |
| TC-INT-018 | GET /api/coverage invalid bounds | integration | owner-web-app, ingestion-api | Annotate `test_api_coverage.py::test_inverted_range_is_rejected` (422, envelope) | T006 |
| TC-INT-019 | GET /api/coverage limit bound | integration | owner-web-app, ingestion-api | Annotate `tests/integration/test_api_pagination.py::test_coverage_page_size_defaults_and_caps` (`MAX_PAGE_SIZE + 1` → 422) | T007 |
| TC-INT-020 | GET /api/health contract | integration | owner-web-app, ingestion-api | Annotate `tests/integration/test_api_health.py::test_health_reports_the_most_recent_terminal_run` (status, database, `credential_present` bool, `schema_version`, `most_recent_run`) | T008 |
| TC-INT-021 | Massive reference-data HTTPS contract | integration | massive-client, Massive REST API | Annotate `tests/unit/test_massive_reference.py::test_fetch_reference_uses_the_single_ticker_endpoint_only` (documented request) and `::test_fetch_reference_returns_product_shaped_reference` (mapped result) | T009 |
| TC-INT-022 | Massive daily-prices HTTPS contract | integration | massive-client, Massive REST API | Annotate `tests/unit/test_massive_bars.py::test_fetch_daily_bars_requests_multiplier_1_day_timespan_and_inclusive_dates` and `::test_fetch_daily_bars_returns_all_rows_from_a_two_page_response_in_order` | T010 |
| TC-INT-023 | Massive fundamentals HTTPS contract | integration | massive-client, Massive REST API | Annotate `tests/unit/test_massive_financials.py::test_fetch_financials_queries_the_three_statement_endpoints_for_the_symbol` and `::test_fetch_financials_returns_a_complete_result_for_a_covered_symbol` | T011 |
| TC-INT-024 | Massive corporate-actions HTTPS contract | integration | massive-client, Massive REST API | Annotate `tests/unit/test_massive_actions.py::test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol` (mapping). Add request-argument assertions, because no test checks the documented corporate-actions requests | T012, T020 |
| TC-INT-025 | Massive not-found and rate-limit propagation | integration | massive-client, Massive REST API, acquisition-runner | Annotate `tests/unit/test_massive_reference.py::test_fetch_reference_raises_instrument_not_found_for_unknown_symbol`, `tests/unit/test_massive_client_governor_integration.py::test_a_first_page_provider_failure_surfaces_as_the_typed_error` and `tests/integration/test_runner_isolation.py::test_not_found_instrument_is_recorded_and_run_continues` (isolated). Add a new test that a 429 is paced without consuming attempts, because no test drives a 429 through `MassiveClient` | T009, T013, T014, T002, T021 |
| TC-INT-026 | Massive timeout and server-error propagation | integration | massive-client, Massive REST API, acquisition-runner | Annotate `tests/integration/test_runner_isolation.py::test_provider_unavailable_is_recorded_and_run_continues` (per-instrument failure). Add a new test that a timeout or 5xx is retried up to the attempt limit through `MassiveClient`, because no test drives either through the client | T014, T002, T022 |

## Test Infrastructure

**Framework:** pytest (`[tool.pytest.ini_options]` in `pyproject.toml`; markers
`postgres` and `slow`) with FastAPI `TestClient`.
**Tools:** psycopg, testcontainers[postgres], `unittest.mock.patch`.
**Environment:**
- API tests (TC-INT-001–020) use the per-file `TestClient` fixtures that
  already exist:
  - `client` in `test_api_instruments.py` and `test_api_settings.py`
  - `runs_client` in `test_api_runs.py`
  - `coverage_env` in `test_api_coverage.py`
  - `pagination_client` in `test_api_pagination.py`
  - `migrated_health_client` in `test_api_health.py`

  These fixtures build on `migrated_connection_string` and
  `postgres_connection_string` from `tests/conftest.py`, which owns the
  session-wide PostgreSQL 16 container and the per-test database. The tests are
  marked `postgres` and need Docker.
- Massive tests (TC-INT-021–026) patch `factorflow.ingestion.massive.client.RESTClient`
  and load envelopes from `tests/fixtures/massive/`, including
  `error_not_found.json`, `error_rate_limited.json` and `error_unknown_shape.json`.
  They need no network, credential or Docker, and never call the live provider.
- The runner isolation tests in `test_runner_isolation.py` use
  `migrated_runner_connection` from `tests/conftest.py` and a `MagicMock`
  client. They are marked `postgres`.
- **Traceability convention.** Put a `# Implements TC-INT-NNN` comment line
  directly above the test's `def`, below any decorators. Where the test already
  has a `# Implements TC-COMP-NNN` line, put it next to that line. Use one
  comment line per TC-INT ID, and leave docstrings and their TC-COMP IDs
  unchanged. This matches the `# Implements` lines already in
  `test_api_coverage.py`, `test_api_health.py` and `test_runner_isolation.py`,
  and the automation-coding rule that each test names the cases it implements.

## Phase 1: Test Infrastructure Setup

**Purpose:** Confirm the existing infrastructure runs before anything changes,
so a later failure is attributable to this work. No new dependency, marker,
configuration or `conftest.py` is needed (owner direction 2026-10-07, item 3).

- [x] T001 From the repository root, run `uv sync --all-extras`, then `uv run pytest -m 'not postgres'` and `uv run pytest tests/integration --collect-only -q`. Record the pass and collect counts in the automation hand-off as the baseline. Where Docker is available, also record a baseline `uv run pytest tests/integration -m postgres`. Change no file.

**Checkpoint:** The baseline counts are recorded, and the suite collects with the
existing `pyproject.toml` and `tests/conftest.py`.

---

## Phase 2: Test Utilities & Fixtures

**Purpose:** Create the one new test module this plan needs, with the per-file
helpers every `tests/unit/test_massive_*.py` file defines (DEC-0028).

- [x] T002 Create `tests/unit/test_massive_retry.py`. Its module docstring cites the test table in `component-design-massive-client.md` section 7: "429 is not an attempt", "Timeout retries to the limit" and "A 429 without Retry-After is still throttling". Define the helpers the same way `tests/unit/test_massive_client_governor_integration.py` does: `FIXTURES`, `_load`, `_settings()` (`max_attempts: 3`), `_governor()` (`max_attempts=3`, `max_throttle_wait_seconds=1.0`, no-op `sleep`), `_FakeResponse` and `_envelope`. Do not import helpers across test modules, because the existing files do not. Add no tests in this task (supports TC-INT-025 and TC-INT-026).

**Checkpoint:** `uv run pytest tests/unit/test_massive_retry.py --collect-only -q`
imports the module cleanly, and `uv run ruff check tests/unit/test_massive_retry.py`
passes.

---

## Phase 3: Test Implementation

**Purpose:** Trace every TC-INT case to the existing tests that assert it, and
add the assertions and tests for the Expected Result clauses that no existing
test asserts (owner direction 2026-10-07; DEC-0023, DEC-0024).

### Traceability annotations (no assertion changes)

- [x] T003 [P] Add `# Implements TC-INT-NNN` lines in `tests/integration/test_api_instruments.py`:
  - TC-INT-001 on `test_list_filters_and_counts` and `test_list_cursor_pagination`
  - TC-INT-002 on `test_add_mixed_batch_response_shape`
  - TC-INT-003 on `test_add_status_codes`
  - TC-INT-004 and TC-INT-005 on `test_retire_status_codes`
  - TC-INT-005 on `test_error_envelope_shape`
- [x] T004 [P] Add `# Implements TC-INT-NNN` lines in `tests/integration/test_api_settings.py`:
  - TC-INT-006 on `test_get_depth_when_unset`
  - TC-INT-007 on `test_put_depth_accepts_bounded_value`
  - TC-INT-008 on `test_put_depth_rejects_invalid` and `test_error_envelope_shape_on_settings`
- [x] T005 [P] Add `# Implements TC-INT-NNN` lines in `tests/integration/test_api_runs.py`:
  - TC-INT-009 on `test_start_with_active_run_returns_202_queued_behind_set`
  - TC-INT-010 on `test_start_no_depth_returns_409_history_depth_not_set` and `test_start_no_active_instruments_returns_409_no_active_instruments`
  - TC-INT-011 on `test_list_runs_reverse_chronological_order`, `test_list_runs_state_filter` and `test_list_runs_cursor_continuation_no_gaps`
  - TC-INT-012 on `test_get_run_detail_returns_run_counts_and_results` and `test_api_detail_includes_sql_outcome_counts_and_symbols`
  - TC-INT-013 on `test_get_run_detail_unknown_returns_404`
  - TC-INT-014 on `test_cancel_running_run_returns_202_cancelling`
  - TC-INT-015 on `test_cancel_queued_run_returns_202_cancelled`
  - TC-INT-016 on `test_cancel_terminal_run_returns_409_run_already_terminal` and `test_cancel_unknown_run_returns_404`
- [x] T006 [P] Add `# Implements TC-INT-NNN` lines in `tests/integration/test_api_coverage.py`:
  - TC-INT-017 on `test_coverage_reports_presence_ranges_and_last_acquired`, `test_coverage_reports_gap_counts_and_availability`, `test_symbol_filter_is_a_prefix`, `test_lifecycle_filter_and_default_includes_retired`, `test_date_bounds_narrow_gaps` and `test_cursor_pages_through_every_instrument_once`
  - TC-INT-018 on `test_inverted_range_is_rejected`
- [x] T007 [P] Add `# Implements TC-INT-019` on `test_coverage_page_size_defaults_and_caps` in `tests/integration/test_api_pagination.py`.
- [x] T008 [P] Add `# Implements TC-INT-020` on `test_health_reports_the_most_recent_terminal_run` in `tests/integration/test_api_health.py`.
- [x] T009 [P] Add `# Implements TC-INT-NNN` lines in `tests/unit/test_massive_reference.py`:
  - TC-INT-021 on `test_fetch_reference_uses_the_single_ticker_endpoint_only` and `test_fetch_reference_returns_product_shaped_reference`
  - TC-INT-025 on `test_fetch_reference_raises_instrument_not_found_for_unknown_symbol`
- [x] T010 [P] Add `# Implements TC-INT-022` on `test_fetch_daily_bars_requests_multiplier_1_day_timespan_and_inclusive_dates` and `test_fetch_daily_bars_returns_all_rows_from_a_two_page_response_in_order` in `tests/unit/test_massive_bars.py`.
- [x] T011 [P] Add `# Implements TC-INT-023` on `test_fetch_financials_queries_the_three_statement_endpoints_for_the_symbol` (renamed from `..._all_four_...` when CAP-001-E3-S1 stopped requesting ratios, massive-client v13) and `test_fetch_financials_returns_a_complete_result_for_a_covered_symbol` in `tests/unit/test_massive_financials.py`.
- [x] T012 [P] Add `# Implements TC-INT-024` on `test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol` in `tests/unit/test_massive_actions.py`.
- [x] T013 [P] Add `# Implements TC-INT-025` on `test_a_first_page_provider_failure_surfaces_as_the_typed_error` in `tests/unit/test_massive_client_governor_integration.py`.
- [x] T014 [P] Add the runner traceability lines in `tests/integration/test_runner_isolation.py` (DEC-0024):
  - `# Implements TC-INT-025` on `test_not_found_instrument_is_recorded_and_run_continues`
  - `# Implements TC-INT-026` on `test_provider_unavailable_is_recorded_and_run_continues`

### Missing assertions and new tests (DEC-0023)

- [x] T015 Extend `test_add_status_codes` in `tests/integration/test_api_instruments.py` for TC-INT-003 (depends on T003):
  - On the 409 response, assert `error.code == "all_duplicate"`.
  - On the 422 response, assert `error.code == "all_malformed"`.
  - On both, assert `error.resource == "instruments"` and that `error.message` and `error.request_id` are non-empty.
- [x] T016 Extend `test_retire_status_codes` in `tests/integration/test_api_instruments.py` for TC-INT-005. Assert that the 404 carries `error.code == "instrument_not_found"`, the 409 carries `error.code == "instrument_already_retired"`, and the two codes differ (depends on T015, same file).
- [x] T017 Extend `test_start_with_active_run_returns_202_queued_behind_set` in `tests/integration/test_api_runs.py` for TC-INT-009. After the second start, assert that `GET /api/acquisition-runs?state=running` returns 200 and that its `runs` hold exactly one run, `first_id`. This shows the queued run is not executing at the same time (depends on T005).
- [x] T018 Extend `test_get_run_detail_unknown_returns_404` in `tests/integration/test_api_runs.py` for TC-INT-013. Assert `error.code == "not_found"`, `error.resource == "acquisition-run"`, and that `error.message` and `error.request_id` are non-empty (depends on T017, same file).
- [x] T019 Add `test_cancel_queued_run_leaves_active_run_unaffected` to `tests/integration/test_api_runs.py`, with `# Implements TC-INT-015` and `@pytest.mark.postgres` (depends on T018, same file).
  - Reuse `runs_client`, `_set_history_depth`, `_add_instrument` and `_start_run`, and the `UPDATE acquisition_run SET state='running' …` setup from `test_cancel_running_run_returns_202_cancelling`.
  - Start run A and make it `running`.
  - Start run B and assert 202 with `queued_behind == A`.
  - Cancel B and assert 202 with `state == "cancelled"`.
  - Assert that `GET /api/acquisition-runs/{A}` returns 200 with `run.state == "running"`.
- [x] T020 [P] Extend `test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol` in `tests/unit/test_massive_actions.py` for TC-INT-024 (depends on T012). The argument names are the ones `MassiveClient.fetch_corporate_actions` passes in `src/factorflow/ingestion/massive/client.py`.
  - Assert that `list_stocks_splits` was called once with `ticker="AAPL"`, `execution_date_gte="2000-01-01"`, `execution_date_lte="2024-12-31"` and `raw=True`.
  - Assert the same for `list_stocks_dividends`, using `ex_dividend_date_gte` and `ex_dividend_date_lte`.
  - Assert the same for `vx.list_ipos`, using `listing_date_gte` and `listing_date_lte`.
  - Assert that `get_ticker_events` was called once for `"AAPL"`.
- [x] T021 Add `test_rate_limited_responses_are_paced_without_consuming_attempts` to `tests/unit/test_massive_retry.py`, with `# Implements TC-INT-025` (depends on T002).
  - Patch `RESTClient` as the other `test_massive_*.py` files do.
  - Set `get_ticker_details.side_effect` to four `BadResponse((FIXTURES / "error_rate_limited.json").read_text())` instances, followed by `_FakeResponse(_envelope(_load("reference_active.json")))`.
  - Assert that `MassiveClient(settings=_settings(), governor=_governor()).fetch_reference("AAPL")` returns the reference.
  - Assert `get_ticker_details.call_count == 5`. That is more sends than `max_attempts`, so no 429 was counted as an attempt.
- [x] T022 Add the parametrized test `test_timeouts_and_server_errors_retry_to_the_attempt_limit` to `tests/unit/test_massive_retry.py`, with `# Implements TC-INT-026` (depends on T021, same file).
  - Timeout case: set `get_ticker_details.side_effect` to `urllib3.exceptions.ReadTimeoutError(None, "https://api.massive.com", "Read timed out.")`. `urllib3` is already a dependency of `client.py`.
  - Server-error case: set it to `BadResponse((FIXTURES / "error_unknown_shape.json").read_text())`. This is the unrecognised error body that the later-page failure test in `test_massive_bars.py` already uses.
  - In both cases, assert that `fetch_reference("AAPL")` raises `ProviderUnavailable` and that `get_ticker_details.call_count == 3`: the configured `max_attempts`, with no fourth send.

**Checkpoint:** Every TC-INT-001–026 ID appears in at least one `# Implements`
line, and each Expected Result clause is asserted by at least one test. The only
new tests are T019, T021 and T022. No production file and no `conftest.py`
changed.

---

## Phase 4: Test Validation & Cleanup

**Purpose:** Prove that the annotated, extended and new tests pass and that all
26 IDs are traced.

- [x] T023 From the repository root, run the checks that need no Docker (depends on T002–T022):
  - `uv run ruff check .`
  - `uv run ruff format --check .`
  - `uv run mypy src`
  - `uv run pytest -m 'not postgres'`, which runs every `tests/unit/test_massive_*.py` test, including T020–T022
  - `uv run pytest tests/integration --collect-only -q`, which proves T003–T019 still import and collect

  Compare the results with the T001 baseline.
- [x] T024 On a host with Docker, run `uv run pytest tests/integration -m postgres` and then the full `uv run pytest`. Both must pass. This container has no Docker, so use a local machine or CI. Record where the run happened and the pass counts in the automation hand-off. Do not mark this task complete from a run without Docker (depends on T023).
- [x] T025 From the repository root, verify traceability: `for n in $(seq -w 1 26); do grep -rqE "# Implements TC-INT-0$n\b" tests || echo "missing TC-INT-0$n"; done` must print nothing (depends on T003–T022).

**Checkpoint:** Lint, format, type check and the non-postgres tests pass
locally. The postgres integration suite and the full suite pass on a Docker
host, and all 26 TC-INT IDs are traced.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 has no dependencies. T002 depends on T001.
- T003–T014 depend only on T001.
- T015 depends on T003, and T016 on T015.
- T017 depends on T005, T018 on T017, and T019 on T018.
- T020 depends on T012.
- T021 depends on T002, and T022 on T021.
- T023 and T025 depend on T002–T022. T024 depends on T023.

### Parallel Opportunities

- Phase 3 annotations: T003–T014 touch different files and can run in parallel.
- Phase 3 additions: these four groups can run in parallel with each other:
  - the instruments chain (T015–T016)
  - the runs chain (T017–T019)
  - T020
  - the retry chain (T021–T022)
- Phase 4: T023 and T025 can run in parallel.

### Phase Dependencies

- Phase 1 comes first.
- The Phase 2 module (T002) gates only T021 and T022.
- Each Phase 3 addition waits only for the annotation task on the same file.
- Phase 4 starts when Phases 1–3 are complete.

## Validation Plan

### Constitution-Defined Commands

These come from the **Validation Commands** table in `docs/constitution/tech-stack.md`:

- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest` (needs Docker for the `postgres` tests)
- Test without a container runtime: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Test-Specific Validation

- **Required, needs Docker (a local machine or CI):** run
  `uv run pytest tests/integration -m postgres`, then `uv run pytest`. These
  runs validate TC-INT-001–020 and the runner-isolation half of
  TC-INT-025/026. A run without Docker does not satisfy this requirement.
- **Runs without Docker:**
  - `uv run ruff check .`
  - `uv run ruff format --check .`
  - `uv run mypy src`
  - `uv run pytest -m 'not postgres'` (all the TC-INT-021–026 Massive client tests)
  - `uv run pytest tests/integration --collect-only -q`
- **Traceability:** T025's loop finds all 26 `TC-INT-0NN` IDs.
- **Expected result:**
  - Every annotated test still passes, with unchanged behaviour.
  - The extended tests (T015–T018, T020) pass.
  - The three new tests pass: T019, T021 and T022 (T022 has two parametrized
    cases).
  - No test calls the live Massive service or needs a credential.

## Notes

- **Owner direction 2026-10-07** governs this plan:
  - Option (a): add traceability to existing tests.
  - TC-INT-021–026 are traced to `tests/unit/test_massive_*.py` and use the
    `RESTClient` patching those tests already use.
  - There is no new `tests/integration/conftest.py`.

  The v1 tasks that planned `test_api_history_depth.py`,
  `test_api_acquisition_runs.py`, `test_massive_client_contracts.py` and a new
  `tests/integration/conftest.py` are withdrawn. v1's Phase 2, which had no
  tasks, is replaced.
- **DEC-0023** records which Expected Result clauses were judged missing, and
  why each addition is the smallest one that asserts its clause.
- **DEC-0024** records how two clauses are traced to the existing runner
  isolation tests: "not-found is isolated" (TC-INT-025) and "per-instrument
  failure propagation" (TC-INT-026). Those tests use a `MagicMock` client. The
  client-side half is asserted at the patched `RESTClient`; the runner-side
  half is asserted from the typed error the client raises.
- **DEC-0028** records placing the two new client tests in
  `tests/unit/test_massive_retry.py`, the file named in the test table in
  `component-design-massive-client.md` section 7.
- The TC-INT-021–026 tests mock at the Massive SDK `RESTClient`, not on the
  HTTPS wire. That is the mocking these tests already use (owner direction
  2026-10-07, item 2). `RESTClient` is constructed with `retries=0`, so the
  governor alone owns retry, and the call counts in T021 and T022 equal the
  provider requests sent.
- T021 relies on `_governor()` using the real `time.monotonic` with a no-op
  sleep, so the throttle-wait budget (`max_throttle_wait_seconds=1.0`) is never
  reached. If the test proves flaky, pass a fixed `monotonic=lambda: 0.0` to
  that test's `RateLimitGovernor`.
- The test specification lists `owner-web-app, ingestion-api` for the API cases,
  but its steps assert only the HTTP boundary. This plan includes no browser
  automation; that belongs to the e2e plan.
- If a Phase 3 assertion fails against the current production code, report it
  as a finding for review. Do not weaken the assertion, and do not change
  production code as part of this automation work.
- The commit that carries this plan should include these decision trailers:
  `Decision-Id: DEC-0023`, `Decision-Id: DEC-0024` and `Decision-Id: DEC-0028`.
