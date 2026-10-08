---
artifact_schema_version: 1
artifact_id: CAP-001-e2e-tests-automation-tasks
artifact_type: automation-tasks
artifact_version: 2
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-09
updated: 2026-10-07
ai_provenance:
  agent_id: automation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-07T00:00:00Z
  source_artifacts:
    - id: CAP-001-e2e-tests
      version: "1"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Tasks: CAP-001-e2e-tests — E2E Tests

**Test Specification:** `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md`
**Component(s)**: `FactorFlow-v2`
**Test Scope:** e2e
**Branch:** `usr/alvaro-de-jodra/CAP-001-automation`
**Date:** 2026-10-07

## Summary

Automate the 12 owner-visible CAP-001 journeys (TC-E2E-001–012) with
Playwright by **extending the existing root suite** (owner direction
2026-10-07, item 1): `playwright.config.ts` (testDir `./tests/e2e`, one worker,
webServer `bash scripts/run-e2e-server.sh`), the five specs already in
`tests/e2e/`, and the shared `tests/e2e/fixtures/` and `tests/e2e/support/`.
No `web/` Playwright configuration is created. This revision (v2) replaces the
stale v1 plan, which planned a new `web/playwright.config.ts` + `web/e2e`
suite with API fixtures and so contradicted
`component-design-owner-web-app.md` section 7: "the end-to-end suite runs
against the real API and a real PostgreSQL container with a stubbed provider".

Two TC-E2E cases are already fully asserted by existing tests and are only
annotated (owner direction 2026-10-07, item 3; DEC-0027). The remaining ten
need a real acquisition runner, a controlled provider or an unmigratable store,
which the current e2e server does not provide; `scripts/run-e2e-server.sh` is
extended — test infrastructure only, no production code (owner direction
2026-10-07, item 2; DEC-0025, DEC-0026).

## Test Case Traceability

| TC ID | Test Case Title | Scope | Component(s) | Tasks |
|-------|----------------|-------|---------------|-------|
| TC-E2E-001 | First acquisition succeeds | e2e | FactorFlow-v2 (owner-web-app → market-data-store, stubbed massive-client upstream) | T001, T002, T004, T008 — new `tests/e2e/first-run.spec.ts` |
| TC-E2E-002 | First acquisition reports provider failure | e2e | as above | T001, T002, T004, T009 — new `tests/e2e/diagnose-failure.spec.ts` |
| TC-E2E-003 | Coverage is fit to rely on | e2e | as above | T005 — annotate existing `tests/e2e/coverage-expansion.spec.ts` and add the missing data-type-presence and last-acquired assertions |
| TC-E2E-004 | Coverage reports no acquired data honestly | e2e | as above | T001, T002, T004, T007 — new `tests/e2e/coverage-empty.spec.ts` |
| TC-E2E-005 | Failed acquisition is diagnosed and recovered | e2e | as above | T001, T002, T004, T009 — new test in `tests/e2e/diagnose-failure.spec.ts` |
| TC-E2E-006 | Unknown instrument does not stop recovery | e2e | as above | T001, T002, T004, T010 — new `tests/e2e/unrecognised-instrument.spec.ts` |
| TC-E2E-007 | Run is cancelled while in progress | e2e | as above | T001, T002, T004, T011 — new `tests/e2e/cancel-in-progress.spec.ts` |
| TC-E2E-008 | Cancellation races completed run | e2e | as above | T006 — annotate existing race test in `tests/e2e/cancel-run.spec.ts` (no new assertions) |
| TC-E2E-009 | Instrument is added after initial acquisition | e2e | as above | T001, T002, T004, T012 — new `tests/e2e/instrument-changes.spec.ts` |
| TC-E2E-010 | Retired instrument remains visible | e2e | as above | T001, T002, T004, T012 — new test in `tests/e2e/instrument-changes.spec.ts` |
| TC-E2E-011 | Product starts and reports health | e2e | as above | T013 — new `tests/e2e/startup-health.spec.ts` |
| TC-E2E-012 | Inconsistent store prevents unsafe start | e2e | as above | T002, T014 — new `tests/e2e/startup-refusal.spec.ts` |

No test case is classified as not automatable.

### Existing tests reviewed against the specification (owner direction 2026-10-07, item 3)

| Existing test | Asserts | Decision |
|---|---|---|
| `coverage-expansion.spec.ts` | Complete vs gapped rows (CVA/CVB vs CVC), gap count, expansion to the missing date 2024-01-04, covered-from date | **TC-E2E-003** — annotate; add the data-type presence and last-acquired assertions the spec's steps name (T005) |
| `cancel-run.spec.ts` "a cancel that races completion…" | *This run had already completed.*, outcome Succeeded, no Cancelling/Cancelled shown | **TC-E2E-008** — annotate only (T006) |
| `cancel-run.spec.ts` "a running run shows cancelling…" | Cancelling state on a seeded run; no runner, so it never reaches Cancelled | Not tagged: cannot assert TC-E2E-007's cancelled state or retained/unreached coverage (DEC-0027) |
| `run-detail.spec.ts` | Failure detail and Not found on **seeded** result rows | Not tagged: TC-E2E-002/006 require provider-driven outcomes and coverage effects (DEC-0027) |
| `instruments-add-retire.spec.ts` | Retired row stays on Instruments | Not tagged: TC-E2E-010 requires Coverage retention and run-scope behaviour (DEC-0027) |
| `runs-start-cancel.spec.ts` | Requested → cancelled via API | Maps to no TC-E2E case |

Untagged tests are left unchanged; they keep their story-level traces.

## Test Infrastructure

**Framework:** Playwright `@playwright/test` ^1.47.2 (root `package.json`),
Chromium project, `npm run test:e2e` = `playwright test`, `posttest:e2e`
removes the `factorflow-e2e-postgres` container.
**Tools:** `tests/e2e/support/database.ts` (`sql()` through `docker exec psql`),
`tests/e2e/fixtures/coverage-seed.sql`, provider response bodies in
`tests/fixtures/massive/*.json`, Python 3.12 standard library for the stub
provider (run with `uv run python`).
**Environment:** Docker daemon (postgres:16 container), `uv`, Node, Playwright
browsers (`npx playwright install`). Stacks started by
`scripts/run-e2e-server.sh` after this plan:

| Stack | Port | Database | Runner | Provider | Used by |
|---|---|---|---|---|---|
| Main (unchanged) | 127.0.0.1:8123 | `factorflow` | none | none called | existing five specs, TC-E2E-003, 008, 011, 012 (bundle) |
| Acquisition (new) | 127.0.0.1:8125 | `factorflow_acquisition` | `python -m factorflow.ingestion_main` | stub on 127.0.0.1:8126 via `FACTORFLOW_MASSIVE_BASE_URL` | TC-E2E-001, 002, 004, 005, 006, 007, 009, 010 |
| Refused (new) | 127.0.0.1:8124, never bound | `factorflow_ahead` (store ahead of build) | none | none | TC-E2E-012 |

The acquisition stack is separate because the existing specs rely on the main
server starting no runner (a started run stays `requested`); adding a runner to
8123 would break `runs-start-cancel.spec.ts` and `cancel-run.spec.ts` (DEC-0025).
All stacks serve the same built bundle (`src/factorflow/api/static`).
`playwright.config.ts` is **not** changed: the script brings the acquisition
stack up and the refused start through before starting the 8123 API, so the
existing `webServer.url` health wait covers every stack.

## Phase 1: Test Infrastructure Setup

**Purpose:** Give the e2e server a controlled provider, a real runner and an
unmigratable store without changing production code or the existing stack.

- [ ] T001 [P] Create the stub Massive provider in `tests/e2e/support/massive_stub.py` (standard library `http.server.ThreadingHTTPServer`, port from argv, bound to 127.0.0.1). Serve every endpoint `src/factorflow/ingestion/massive/client.py` calls — `/v3/reference/tickers/{ticker}`, `/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}`, `/stocks/financials/v1/{balance-sheets,income-statements,cash-flow-statements,ratios}`, `/stocks/v1/splits`, `/stocks/v1/dividends`, `/vX/reference/ipos`, `/vX/reference/tickers/{id}/events` (paths per `component-design-massive-client.md` section 11) — with bodies shaped from `tests/fixtures/massive/*.json` (`reference_active.json`, `bar_regular.json`, `financial_annual.json`, `action_*.json`) and no `next_url`. Daily bars are generated for every weekday in the requested `{from}`–`{to}` range so coverage follows the stated depth. Controlled behaviour: any symbol starting `UNK` returns 404 with `error_not_found.json`; `POST /__stub/mode {"mode": "ok" | "reject-credential"}` (reject returns 401 with `error_credential_unknown_key.json` on every provider path); `POST /__stub/hold {"symbol": S}` makes S's requests block until `POST /__stub/release {"symbol": S}`; `POST /__stub/reset` restores mode `ok` and releases all holds. Not collected by pytest (no `test_` prefix) or Playwright (not `*.spec.ts`). Supports TC-E2E-001, 002, 004–007, 009, 010.
- [ ] T002 Modify `scripts/run-e2e-server.sh` (test infrastructure only; owner direction 2026-10-07, item 2) — keep every existing step and the 8123 environment unchanged, and add, before the existing `uv run python -m factorflow.app_main &`: (a) `CREATE DATABASE factorflow_acquisition` and `CREATE DATABASE factorflow_ahead` through `docker exec … psql` in the existing container; (b) migrate both with `FACTORFLOW_DATABASE_URL=…/<db> uv run python -m factorflow.db.migrate_main`, then make `factorflow_ahead` unmigratable with `INSERT INTO applied_migrations (version, name, checksum) VALUES (99, 'from_the_future', 'deadbeef')` (the store-ahead seed `tests/integration/test_migrator_refuses.py` uses); (c) run the production start chain `sh -c "python -m factorflow.db.migrate_main && exec python -m factorflow.app_main"` (Dockerfile `CMD`) via `uv run`, against `factorflow_ahead` with `FACTORFLOW_API_PORT=${FACTORFLOW_E2E_REFUSED_PORT:-8124}`, under `timeout 60`, and `exit 1` with a message unless its exit status is exactly 2 (`StoreAheadOfBuildError`); (d) start the stub (`uv run python tests/e2e/support/massive_stub.py ${FACTORFLOW_E2E_STUB_PORT:-8126} &`), then, with `FACTORFLOW_DATABASE_URL=…/factorflow_acquisition`, `FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:8126`, `FACTORFLOW_MASSIVE_API_KEY=e2e-test-key`, `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=6000` and `FACTORFLOW_RUN_POLL_INTERVAL_SECONDS=1` set **only for these child processes** (subshell or `env`), start a second API on `FACTORFLOW_API_PORT=${FACTORFLOW_E2E_ACQ_PORT:-8125}` and `uv run python -m factorflow.ingestion_main` in the background; (e) poll `http://127.0.0.1:8125/api/health` (60 s, as the database wait does) and `exit 1` if it never answers. Record every background PID and extend `cleanup()` to kill all of them before removing the container; the final `wait` stays on the 8123 API. Update the header comment to describe the three stacks. Depends on T001. Supports TC-E2E-001, 002, 004–007, 009, 010, 012.

**Checkpoint:** With Docker available, `bash scripts/run-e2e-server.sh` brings
up 8123 and 8125, the stub answers on 8126, nothing listens on 8124, and the
script aborts if the refused start does not exit 2. The five existing specs
pass unchanged.

---

## Phase 2: Test Utilities & Fixtures

**Purpose:** Shared helpers for addressing the acquisition stack, controlling
the stub and isolating tests that share one database.

- [ ] T003 [P] Modify `tests/e2e/support/database.ts`: add an optional second parameter `database = "factorflow"` to `sql()`, passed as `--dbname`; existing callers are unchanged. Supports TC-E2E-004–007, 009, 010.
- [ ] T004 Create `tests/e2e/support/acquisition.ts` exporting: `ACQUISITION_BASE_URL` (`http://127.0.0.1:8125`) for `test.use({ baseURL })`; stub controls `setProviderMode(mode)`, `holdSymbol(symbol)`, `releaseSymbol(symbol)`, `resetStub()` (POSTs to `http://127.0.0.1:8126/__stub/*`); `resetAcquisitionStore()`, which calls `resetStub()` and runs `TRUNCATE` with `RESTART IDENTITY CASCADE` over every table created in `migrations/0001`–`0004` except `applied_migrations` (`instrument`, `owner_setting`, `instrument_reference`, `daily_bar`, `fundamental_observation`, `corporate_action`, `coverage_segment`, `acquisition_state`, `acquisition_run`, `run_instrument_result`) via `sql(…, "factorflow_acquisition")`; and `waitForRunState(request, runId, states, timeoutMs)` polling `GET /api/acquisition-runs/{id}`. Every acquisition-stack spec calls `resetAcquisitionStore()` in `beforeEach`, so the specs do not depend on file order, and leaves no run non-terminal at the end. Depends on T003. Supports TC-E2E-001, 002, 004–007, 009, 010.

**Checkpoint:** A spec can address 8125, put the stub into each controlled
behaviour, and start from an empty acquisition store.

---

## Phase 3: Test Implementation

**Purpose:** Implement every TC-E2E case through browser-visible actions and
assertions, adding `TC-E2E-NNN` to the test title of each test that implements
one.

- [ ] T005 [P] Annotate and extend TC-E2E-003 (coverage is fit to rely on) in `tests/e2e/coverage-expansion.spec.ts`: add `TC-E2E-003` to the header comment's trace list and the test title; keep every existing assertion; add the missing ones the spec's steps name — the Reference and Prices presence badges show present and Fundamentals and Corporate actions show absent for CVA, CVB and CVC, and the *Last acquired* cell shows the seeded `2024-01-05T22:14:03Z` time as the interface formats it. No other changes.
- [ ] T006 [P] Annotate TC-E2E-008 (cancellation races completed run) in `tests/e2e/cancel-run.spec.ts`: add `TC-E2E-008` to the title of "a cancel that races completion says the run had already completed" and to the header's trace list. No assertion changes; the other two tests are untouched.
- [ ] T007 [P] Implement TC-E2E-004 (coverage reports no acquired data honestly) in `tests/e2e/coverage-empty.spec.ts` on the acquisition stack: after `resetAcquisitionStore()`, open `/coverage` and expect the `NEVER_ACQUIRED` copy *No data has been acquired yet.* (`web/src/screens/coverage/copy.ts`), no instrument rows, and not the filter no-match copy. (depends on T002, T004)
- [ ] T008 [P] Implement TC-E2E-001 (first acquisition succeeds) in `tests/e2e/first-run.spec.ts` (file name from component design section 7) on the acquisition stack: through the interface only, set history depth to 1 year on Settings, add two symbols on Instruments, start acquisition, wait on Run detail for a succeeded outcome, then open Coverage and assert both instruments show all four data-type badges present and a covered date range ending at the latest weekday on or before today. (depends on T002, T004)
- [ ] T009 [P] Implement TC-E2E-002 and TC-E2E-005 in `tests/e2e/diagnose-failure.spec.ts` (file name from component design section 7) on the acquisition stack, `mode: "serial"`. TC-E2E-002: `setProviderMode("reject-credential")`, set depth and add two symbols through the interface, start, open Runs then the run, and assert a Failed (or Partial) outcome with each affected instrument, data type and reason visible; Coverage shows no complete coverage for them. TC-E2E-005: from a successful first run for symbol A (record A's covered range), add B, run with `reject-credential` (failed), open that run's failure detail, `setProviderMode("ok")`, start another run from the interface and assert it succeeds; Coverage shows A's covered-from date unchanged, B populated, exactly one row each; Runs still lists the earlier runs with their original outcomes. (depends on T002, T004)
- [ ] T010 [P] Implement TC-E2E-006 (unknown instrument does not stop recovery) in `tests/e2e/unrecognised-instrument.spec.ts` on the acquisition stack: instruments `UNKQ` and a recognised symbol; start, wait for a terminal outcome; Run detail shows UNKQ with *Not found* and its reason and the outcome is not *Failed*; Coverage shows the recognised instrument with acquired coverage. (depends on T002, T004)
- [ ] T011 [P] Implement TC-E2E-007 (run is cancelled while in progress) in `tests/e2e/cancel-in-progress.spec.ts` on the acquisition stack: instruments CXA, CXB, CXC (the runner works the roster in symbol order and checks cancellation at the top of each instrument, `runner.py`); `holdSymbol("CXB")`; start; once Run detail shows the run running, cancel through the dialog and assert *Cancelling*; `releaseSymbol("CXB")`; assert *Cancelled* after the run-detail poll; Coverage shows CXA's coverage retained and no coverage for CXC. (depends on T002, T004)
- [ ] T012 [P] Implement TC-E2E-009 and TC-E2E-010 in `tests/e2e/instrument-changes.spec.ts` on the acquisition stack, `mode: "serial"`. TC-E2E-009: run 1 covers ICA (record its covered range); add ICB through Instruments; run 2; Coverage shows ICB populated to the stated depth and ICA's covered-from date unchanged. TC-E2E-010: run 1 covers ICA, ICB, ICC; `holdSymbol("ICA")`; start run 2; while it runs, retire ICC through Instruments; Coverage shows ICC with its retained range and the retired badge; release ICA; run 2 completes and its Run detail roster includes ICC; start run 3; its roster excludes ICC and ICC's *Last acquired* is unchanged. (depends on T002, T004)
- [ ] T013 [P] Implement TC-E2E-011 (product starts and reports health) in `tests/e2e/startup-health.spec.ts` on the main stack: open `/` at `http://127.0.0.1:8123`; the status region shows *Answering* and the outcome of the most recent run that `GET /api/health`'s `most_recent_run` reports; a connection to port 8123 on the first non-internal IPv4 address from `os.networkInterfaces()` is refused (loopback-only binding). (depends on T002 only for the server)
- [ ] T014 [P] Implement TC-E2E-012 (inconsistent store prevents unsafe start) in `tests/e2e/startup-refusal.spec.ts`: load the bundle from 8123 (the already available bundle), then `page.route("**/api/**")` forwarding each request to the same path on `127.0.0.1:8124` with `route.fetch` and `route.abort("connectionrefused")` when that fails; reload and assert the designed unreachable state's `UNREACHABLE_MESSAGE` (`web/src/app/status-region.tsx`) and *Not answering*; assert `request.get("http://127.0.0.1:8124/api/health")` throws (no API surface). That the refused start exited 2 is guaranteed by T002, which aborts the suite otherwise. (depends on T002)

**Checkpoint:** All 12 TC-E2E cases have a test whose title carries the ID;
the five existing specs keep their behaviour.

---

## Phase 4: Test Validation & Cleanup

**Purpose:** Prove the suite passes and is isolated, and that the changed
files pass the project's checks.

- [ ] T015 Run `npm run test:e2e` from the repository root **on a machine or CI runner with a Docker daemon** (this planning container has none). Expect 17 tests passing: the 7 existing (`cancel-run` 3, `coverage-expansion` 1, `instruments-add-retire` 1, `run-detail` 1, `runs-start-cancel` 1) plus 10 new (`coverage-empty` 1, `first-run` 1, `diagnose-failure` 2, `unrecognised-instrument` 1, `cancel-in-progress` 1, `instrument-changes` 2, `startup-health` 1, `startup-refusal` 1). Confirm no request leaves 127.0.0.1 (no live provider call), and that `docker ps` shows no `factorflow-e2e-postgres` after the run. Repair only files from T001–T014. (depends on T005–T014)
- [ ] T016 Run the remaining validation commands from `docs/constitution/tech-stack.md` that cover changed files: `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run build`, `npm run test`, `uv run ruff check .`, `uv run ruff format --check .`, and `uv run pytest -m 'not postgres'` (confirms the stub is not collected). (depends on T015)

**Checkpoint:** All 17 e2e tests pass where Docker is available; lint, format,
type and unit checks are clean.

---

## Dependencies & Execution Order

### Task Dependencies
- T001, T003: no dependencies.
- T002: depends on T001.
- T004: depends on T003.
- T005, T006: no dependencies (existing main-stack specs).
- T007–T012: depend on T002 and T004.
- T013, T014: depend on T002.
- T015: depends on T005–T014. T016: depends on T015.

### Parallel Opportunities
- Phase 1/2: T001 and T003 in parallel; T005 and T006 can start at once.
- Phase 3: T007–T014 touch different files and can be written in parallel;
  they execute serially at run time (`workers: 1`).

---

## Validation Plan

### Constitution-Defined Commands
- Build: `npm run build`, `uv build`
- Test: `npm run test`, `uv run pytest -m 'not postgres'`
- Lint: `npm run lint`, `uv run ruff check .`
- Format: `npm run format`, `uv run ruff format --check .`
- Type check: `npx tsc --noEmit`

### Test-Specific Validation
- Run scoped test suite: `npm run test:e2e` (required). It needs a Docker daemon
  and must run where one is available — a local machine or CI. It cannot run in
  a container without Docker; a run reported without it is not a pass.
- Expected result: 17 tests passing, 12 of them carrying `TC-E2E-001`–`012` in
  their titles (TC-E2E-002/005 and 009/010 share files).
- Single case while developing: `npx playwright test tests/e2e/<file>.spec.ts`.

---

## Notes

- **Owner direction 2026-10-07** (binding): (1) extend the existing root
  Playwright setup in `tests/e2e/`, no `web/` config; (2) `scripts/run-e2e-server.sh`
  may change (test infrastructure only) to start a controlled Massive provider
  and a store that cannot be migrated; (3) annotate existing tests that already
  assert a case instead of duplicating them.
- **Decisions:** DEC-0025 (second acquisition stack with runner and stub on
  8125/8126), DEC-0026 (TC-E2E-012 via ahead-of-build store, production start
  chain on refused 8124, browser `/api` routed there), DEC-0027 (existing tests
  are tagged only where they assert the whole case). Commits carrying this
  plan's work should include their `Decision-Id:` trailers.
- **v1 superseded:** v1's `web/playwright.config.ts`, `web/e2e/` and API
  fixtures are dropped; they predated the root suite and contradicted design
  section 7.
- **Risks for the coding agent:** the stub must match what the `massive`
  `RESTClient` actually parses — check against `tests/fixtures/massive/` and
  `client.py` before writing tests. A held symbol (T011, T012) must always be
  released, including in `afterEach`, or the runner stays blocked and
  `resetAcquisitionStore()` races it. The acquisition-run timeouts must fit
  inside the 30 s Playwright test timeout; raise per-test with `test.setTimeout`
  only where a test runs several acquisitions (T009, T012).
- **Spec ambiguities (not edited):** TC-E2E-002 allows "failed or partial";
  T009 accepts either. TC-E2E-009's "previously covered instruments are not
  disturbed" is asserted as an unchanged covered-from date. TC-E2E-011's
  "reachable locally only" is asserted as a refused connection on a
  non-loopback address.
- **Not covered here:** design section 7 also lists `accessibility.spec.ts`
  and `volume.spec.ts`; neither is a TC-E2E case in `e2e-tests.md`, so neither
  is planned.
