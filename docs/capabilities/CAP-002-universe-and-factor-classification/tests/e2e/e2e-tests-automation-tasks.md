---
artifact_schema_version: 1
artifact_id: CAP-002-e2e-tests-automation-tasks
artifact_type: automation-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-05
updated: 2026-11-06
last_reworked_review: e2e-tests-automation-review-v2.md
ai_provenance:
  agent_id: automation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-11-06T14:46:36Z
  source_artifacts:
    - id: CAP-002-e2e-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Tasks: CAP-002-e2e-tests — E2E Tests

**Test Specification**: `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md`
**Component(s)**: `FactorFlow-v2`
**Test Scope**: e2e
**Branch**: `usr/alvaro-de-jodra/CAP-002-automation-rework`
**Date**: 2026-11-05

## Summary

Automate the 12 owner-visible CAP-002 journeys (TC-E2E-001 to TC-E2E-012) with
Playwright by **extending the existing root suite** that CAP-001 delivered:
`playwright.config.ts` (`testDir ./tests/e2e`, one worker), the acquisition
stack that `scripts/run-e2e-server.sh` starts (API on 127.0.0.1:8125,
database `factorflow_acquisition`, ingestion runner, stub provider on
127.0.0.1:8126), and the helpers in `tests/e2e/support/`. This is the approach
`component-design-classification-ui.md` section 7 names ("the stub provider the
delivered E2E stack already runs"). Six new spec files carry the 12 cases, using
the file names that section 7 gives. No new Playwright configuration, no
production code, and no write outside the project repo's `repos:` entry.

One constraint shapes the plan (DEC-0285, PROVISIONAL). The factor engine cannot
yet derive value or growth from acquired statements: every payload key in
`src/factorflow/classification/line_items.py` is `[REQUIRES INPUT]` (system
design section 8, question 1, still open). A stub-provider run therefore cannot
produce value or growth scores, and the plan neither invents the keys nor
weakens an assertion. Instead:

- Journeys that need a **scored set** but not a real build (TC-E2E-003, 004,
  006, 007, 008, 011, 012, and TC-E2E-005 up to the save) **seed** the
  classification tables by SQL into the acquisition database, in the shape
  `tests/integration/reader_seed.py` already uses.
- Cases whose expected result needs a **real build to produce value or growth**
  (TC-E2E-001, TC-E2E-002 after the run, TC-E2E-009, TC-E2E-010) are planned in
  full and **guarded** by a probe of `line_items.unresolved()`: while any key is
  unresolved they skip with the reason visible in the report, and they run
  unchanged once the owner resolves question 1.

The guarded cases still need the stub to answer the way the product reads a
provider (automation review v3, AR-011). A successful empty statement list is
"no data, unchanged" (DEC-0047), so it gives neither "the provider holds no
data" nor a partial run. The stub therefore says both with status codes alone:
a per-symbol 404 for a stock the provider holds no fundamentals for (recorded
`not_found`), and a per-symbol 503 for a stock whose fundamentals fail on one
run (recorded `failed`, so the run ends Partial). Neither invents a payload key.

## Test Case Traceability

| TC ID | Test Case Title | Scope | Component(s) | Tasks |
|-------|----------------|-------|---------------|-------|
| TC-E2E-001 | Flow 1 happy path: stocks are classified after an acquisition run | e2e | FactorFlow-v2 (classification-ui through research-store; stub provider upstream) | T001, T002, T003, T004, T005 — `tests/e2e/research-after-download.spec.ts` (guarded) |
| TC-E2E-002 | Flow 1 error path: nothing scored, then too few stocks to rank | e2e | as above | T001, T003, T004, T005 — same file; the "before the run" half is unguarded, the "after the run" half guarded |
| TC-E2E-003 | Flow 2 happy path: build a universe by hand | e2e | as above | T003, T004, T006 — `tests/e2e/universe-by-hand.spec.ts` |
| TC-E2E-004 | Flow 2 error path: adding a stock that is not followed | e2e | as above | T003, T004, T006 — same file |
| TC-E2E-005 | Flow 3 happy path: save a factor filter as a universe | e2e | as above | T001, T003, T004, T007 — `tests/e2e/universe-from-result.spec.ts` |
| TC-E2E-006 | Flow 3 error path: a filter that matches no stock | e2e | as above | T003, T004, T007 — same file |
| TC-E2E-007 | Flow 4 happy path: sort, narrow, compare and inspect evidence | e2e | as above | T003, T004, T008 — `tests/e2e/compare-and-evidence.spec.ts` |
| TC-E2E-008 | Flow 4 error path: compare a stock that is not classified on a factor | e2e | as above | T003, T004, T008 — same file |
| TC-E2E-009 | Flow 5 happy path: fix insufficient evidence and see it classified | e2e | as above | T001, T002, T003, T004, T009 — `tests/e2e/fix-insufficient-evidence.spec.ts` (guarded) |
| TC-E2E-010 | Flow 5 error path: the provider holds no data | e2e | as above | T001, T002, T003, T004, T009 — same file (guarded) |
| TC-E2E-011 | Flow 6 happy path: maintain a universe over time | e2e | as above | T003, T004, T010 — `tests/e2e/universe-maintenance.spec.ts` |
| TC-E2E-012 | Flow 6 error path: removing the last member is refused | e2e | as above | T003, T004, T010 — same file |

No test case is classified as not automatable. Four cases (TC-E2E-001, 002
second half, 009, 010) are blocked from asserting today by the open payload-key
question, not by test design; see Notes.

The other three Playwright specs that `component-design-classification-ui.md`
section 7 lists (`research-url-state.spec.ts`, `research-accessibility.spec.ts`,
`research-volume.spec.ts`) have no test case in this specification and are out
of scope.

## Test Infrastructure

**Framework**: Playwright `@playwright/test` ^1.47.2 (root `package.json`),
Chromium project, `npm run test:e2e` = `playwright test`; `posttest:e2e` removes
the `factorflow-e2e-postgres` container.
**Tools**: `tests/e2e/support/database.ts` (`sql(statement, database)` through
`docker exec psql`), `tests/e2e/support/acquisition.ts` (stub controls,
`resetAcquisitionStore()`, `startRun()`, `summaryOutcome()`, `waitForRunState()`),
`tests/e2e/support/massive_stub.py`, and the seeding shape of
`tests/integration/reader_seed.py` (read for column lists and constraints; it is
Python and is not imported).
**Environment**: Docker daemon (postgres:16), `uv`, Node 22, Playwright browsers.
The acquisition stack (8125 / 8126, database `factorflow_acquisition`) hosts every
CAP-002 case, because it is the only stack with a runner and a provider. The
main stack (8123) is not used. The API process runs the classification loop in
its lifespan (`src/factorflow/api/app.py`), so a build starts without any owner
action; T001 shortens its poll interval for the test stack.

## Phase 1: Test Infrastructure Setup

**Purpose**: Let the acquisition stack classify quickly and let the stub produce
the data situations the journeys need, without touching production code.

- [x] T001 [P] Modify `scripts/run-e2e-server.sh` (test infrastructure only): add `"FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS=1"` to the `ACQUISITION_ENV` array with a one-line comment (default is 5 s; `ClassificationSettings` requires it to stay below `build_timeout_seconds`, default 300), and extend the header comment's "Acquisition" bullet to list CAP-002's TC-E2E-001 to 012. Do not change the main or refused stacks or any existing variable. Supports TC-E2E-001, 002, 005, 009, 010.
- [ ] T002 [P] Extend `tests/e2e/support/massive_stub.py` and update its module docstring. The stub says what each case needs through **status codes and dates only**, the way the product reads a provider answer (automation review v3 AR-011; DEC-0047: a 200 with an empty `results` list is "no data, unchanged", recorded `unchanged`, never `not_found` or `failed`):
  - (a) deterministic per-symbol price drift in `_bars()` so that stocks differ in momentum (derive a small multiplier on the fixture bar's price fields from the symbol, for example from `sum(map(ord, symbol))`); the fixture `bar_regular.json` keys are the only keys used;
  - (b) a symbol starting `NOF` answers every financial-statement path (`_FINANCIAL_PATHS`) with **404** and `error_not_found.json`, like the `UNK` rule but for statements only. The client raises `InstrumentNotFound`, the run records fundamentals `not_found` (and so ends Partial), and the evidence reads "the provider reports no …" with no recovery (`factor-card.tsx` `providerHoldsNoData`, DEC-0181). TC-E2E-010's stock CCC is added to the acquisition list as `NOFCCC`; the spec's "CCC" is a label;
  - (c) `POST /__stub/withhold {"symbol": S}` makes S's financial-statement paths answer **503** with the `UNAVAILABLE` envelope until `POST /__stub/restore {"symbol": S}`; `POST /__stub/reset` clears every withheld symbol. The client raises `ProviderUnavailable` for S alone, the run records S's fundamentals `failed` and ends Partial, and the evidence offers the next-download recovery and the Data health link. TC-E2E-009 withholds BBB for its first run and restores it for the second;
  - (d) a symbol starting `NEW` is a recently listed stock: its price bars start about ten months (300 days) before today, whatever the requested start, so its 12-month total return has no starting price while its 3- and 6-month returns and every other data type are served as for any symbol. It lacks exactly one input of one factor (momentum), with no fundamentals change (TC-E2E-001, AR-012);
  - (e) remove the `no-fundamentals` mode: nothing uses it once TC-E2E-009 withholds one symbol (v2 AR-008), and an all-symbol empty list could not produce a partial run anyway.
  Do **not** vary fundamentals values or add any financial field beyond what `financial_annual.json` already contains: the statement payload keys the engine reads are unresolved (DEC-0285). Existing modes (`ok`, `reject-credential`, `unavailable`), holds and the `UNK` rule stay unchanged.
  Cover (b) to (e) with a unit test that loads the stub by path and calls `provider_response` without a socket or a container, as `tests/unit/test_ingestion_e2e_main.py` loads its entry point: create `tests/unit/test_massive_stub.py` asserting the 404 for `NOF*` statement paths (and 200 for their other paths), the 503 for a withheld symbol's statement paths only, 200 again after `restore` and after `reset`, the `NEW*` bars starting 300 days before today, and that `set_mode("no-fundamentals")` is refused. It is the check of this behaviour that does not wait on the DEC-0285 guard. Supports TC-E2E-001, 002, 009, 010.

**Checkpoint**: `bash scripts/run-e2e-server.sh` still brings up every stack and the
existing CAP-001 specs pass unchanged; the stub answers 404 on statement paths
for `NOF*`, 503 on a withheld symbol's statement paths until it is restored, and
bars from 300 days ago for `NEW*`, and `tests/unit/test_massive_stub.py` passes.

---

## Phase 2: Test Utilities & Fixtures

**Purpose**: Reset the CAP-002 tables, seed scored sets, and guard the cases that
need a real build.

- [ ] T003 [P] Modify `tests/e2e/support/acquisition.ts`: add the CAP-002 tables created by `src/factorflow/db/migrations/0005_universes.sql` and `0006_classifications.sql` to `DATA_TABLES` (`universe`, `universe_event`, `classification_set`, `classification_set_factor`, `factor_input`, `factor_classification`) so `resetAcquisitionStore()` empties them; update the "migrations 0001-0004" comment to 0001-0006; add `withholdSymbol(symbol)` and `restoreSymbol(symbol)` over `stubControl("withhold" | "restore", { symbol })` for T002 (c), next to `holdSymbol`, and leave `ProviderMode` as `"ok" | "reject-credential" | "unavailable"` (T002 (e) removes `no-fundamentals`). Keep every other existing export unchanged; `resetAcquisitionStore()` already resets the stub, which clears withheld symbols. Supports all twelve cases.
- [ ] T004 Create `tests/e2e/support/classification.ts` (depends on T003), a test fixture exporting, over `sql(…, "factorflow_acquisition")` and the acquisition API (`ACQUISITION_BASE_URL`):
  - `seedScoredStore({ stocks, ... })`: inserts instruments (lifecycle `active`, or `retired` with `retired_at`), one terminal `acquisition_run` (`succeeded`, with `started_at` and `ended_at`), one `complete` `classification_set` plus its `classification_set_factor` rows (`qualified_count`, ranked flag; at least 30 qualified per factor for the ranked cases), and for each stock three `factor_classification` rows (a score and whole-number percentile, or a `not_classified` reason code with `reason_input` and `reason_detail`) and the eight `factor_input` rows the evidence page lists, each with `as_of` and `known_on`. Mirror the column lists, check constraints and the `INPUT_NAMES` / `FACTORS` constants from `tests/integration/reader_seed.py` and `src/factorflow/classification/constants.py`; read the migration for NOT NULL and constraint rules before writing the INSERTs. A bulk path (a loop building one multi-row INSERT) seeds 30+ stocks quickly. A stock's scores are set by the caller so a test can name which stocks match a filter. It also inserts one `prices` `coverage_segment` per seeded stock, because coverage, not lifecycle, decides which stocks a universe accepts (AC-15), and an `instrument_reference` row for a stock given a company name. `spreadStocks(count, prefix)` and `fillerStocks()` build stock lists for it (a known filter subset; `Z00` to `Z29` so every factor ranks).
  - `followStocks(symbols)` and `followerSymbols(count)`: put symbols on the acquisition list as active followed stocks by SQL (`INSERT INTO instrument … 'active'`), acquiring nothing, for the guarded cases that need a real run. Adding thirty-one stocks one at a time through the Instruments screen is a precondition, not the behaviour under test; TC-E2E-002's unguarded half still adds its 20 through the screen (`addInstruments`).
  - `seedUniverseRecorded(name, symbols, daysAgo)`: inserts one active universe whose `created` and `member_added` events were recorded `daysAgo` days ago (America/Chicago), for TC-E2E-011's precondition. The universe API cannot backdate an event and `universe_event` is append-only, so the "members as of an earlier date" view needs events that only an insert can date in the past.
  - `currentSetId(request)`: the current complete set's id on the acquisition stack, or null before any set, the starting point for `waitForNewSet`.
  - `retireInstrument(symbol)`: retires a followed stock the way the owner does (`DELETE`/retire route in `docs/reference/web-api.md` for instruments, or the Instruments screen's retire dialog), so TC-E2E-008 and 012 do not write the lifecycle column directly.
  - `createUniverseViaApi(request, name, symbols)`, `addMembersViaApi`, `removeMemberViaApi`: call `POST /api/universes`, `POST /api/universes/{id}/members` and `DELETE /api/universes/{id}/members/{symbol}` (`docs/reference/web-api.md`) for **preconditions only**; the behaviour under test is always driven through the interface.
  - `waitForNewSet(request, previousSetId)`: polls `GET /api/classifications/summary` on the acquisition API until `set` differs from `previousSetId` and `later` is null.
  - `skipUnlessLineItemsResolved(test)`: runs `uv run python -c "from factorflow.classification import line_items; print(len(line_items.unresolved()))"` with `execFileSync` (as `ingestionProcessIsRunning` already shells out) and, when the count is not 0, calls `test.skip(true, "Blocked: Massive payload keys unresolved (system design section 8 question 1, DEC-0285)")`. Calls it once per guarded test, before any step, so the skip reason is visible in the report and the test runs unchanged once the keys are resolved.
  Supports all twelve cases.

**Checkpoint**: A spec can start from an empty acquisition store, seed a scored set
of 30+ stocks with chosen scores, create universes by API, wait for a new set,
and skip itself with a visible reason when a real build cannot yet score value or
growth.

---

## Phase 3: Test Implementation

**Purpose**: Implement every TC-E2E case through browser-visible actions and
assertions. Each spec file begins with `test.use({ baseURL: ACQUISITION_BASE_URL })`
and a `beforeEach` calling `resetAcquisitionStore()`; put `TC-E2E-NNN` in the
title of each test that implements a case. Take owner-facing wording from
`web/src/screens/research/copy.ts` and the screen components rather than retyping
it; assert behaviour with role and name locators as `tests/e2e/first-run.spec.ts`
does. Leave no run non-terminal at the end of a test.

- [ ] T005 Implement TC-E2E-001 and TC-E2E-002 in `tests/e2e/research-after-download.spec.ts` (depends on T001, T002, T003, T004; flow 1; AC-9, 10, 12, 13, 14, 15, 20, 21, 22). Test timeout raised with `test.setTimeout(120_000)`.
  - TC-E2E-002 (before the run), **unguarded**: with 20 followed stocks added through the Instruments screen and no run yet, open `/research` and expect "No stocks have been scored yet" (`copy.ts`) and no results table.
  - TC-E2E-002 (after the run), **guarded**: start a run with `startRun`, wait for `Succeeded` with `summaryOutcome`, reopen Research, expect every cell of each factor column to read "Not enough to rank", the header to state the qualified count and the need for 30 (20 and 30 in this setup), and no score or percentile cell.
  - TC-E2E-001, **guarded**: add 30 or more followed stocks (use the stub's per-symbol drift so percentiles differ), run, wait for `Succeeded`, open Research **without reloading or acting in between**, and expect each stock to show a score and a whole-number percentile (0 to 100) for value, growth and momentum; read the as-of line "Scores from {time}" in America/Chicago and follow its link to the run's detail page (`/runs/{id}`). The stock lacking one input is `NEWAAA` (T002 (d)), followed with the thirty others before the run, so the run still ends `Succeeded`: expect "Incomplete" on its momentum cell alone, the cell's reason naming the 12-month total return (`title` `Incomplete: 12-month total return …, so momentum …`), and a whole-number percentile on its value and growth cells (AR-012: exactly one factor affected, the other two scored). Do not use a `NOF` stock here: its 404 ends the run Partial and voids both fundamental factors.
- [x] T006 [P] Implement TC-E2E-003 and TC-E2E-004 in `tests/e2e/universe-by-hand.spec.ts` (depends on T003, T004; flow 2; AC-1, 3, 5, 15). Seed three or more scored followed stocks (T004). TC-E2E-003: on `/research/universes` choose New universe, name it "Core", enter three followed symbols, submit; expect the new universe's detail page with the three members and their value, growth and momentum scores, "Core" in the active list, and `/research` scoped to Core showing the same three stocks with the same scores as under All followed stocks. TC-E2E-004: seed AAA as followed and leave ZZZ unfollowed; enter both, submit; expect the dialog to stay open with the list kept and a message naming ZZZ with a link to the followed-stocks page (`/instruments`), and no "Core" in the Universes list afterwards.
- [x] T007 [P] Implement TC-E2E-005 and TC-E2E-006 in `tests/e2e/universe-from-result.spec.ts` (depends on T001, T003, T004; flow 3; AC-2, 5, 16). Seed 30 or more scored stocks where a known subset has a high value percentile and positive momentum. TC-E2E-005: set a value percentile lower bound and a momentum score lower bound on `/research`, read the heading count n, choose "Save these {n} as a universe", name it, confirm; expect the dialog and heading to show the same n, a toast linking to the new universe, n members and an origin line naming the filter and the score date; then start a run with `startRun`, wait for it to end and `waitForNewSet`, reopen the universe, and expect the same n members (membership fixed at save; it holds whether or not the new set matches different stocks). TC-E2E-006: set bounds that match nothing; expect "No stocks match these filters" with "Clear filters", "Save these 0 as a universe" blocked with its reason, and no universe in `/research/universes`. `test.setTimeout(120_000)` for TC-E2E-005.
- [x] T008 [P] Implement TC-E2E-007 and TC-E2E-008 in `tests/e2e/compare-and-evidence.spec.ts` (depends on T003, T004; flow 4; AC-9, 12, 14, 15, 16, 17). Seed a universe (via `createUniverseViaApi`) of at least 4 scored stocks. TC-E2E-007: open the universe in Research, sort by momentum percentile, set a growth threshold, expect the order and the heading count to match the filtered scope; check three rows and choose Compare, expect value, growth and momentum for all three stocks side by side; open the evidence page for one stock and expect every input with its value and the date each was known. TC-E2E-008: seed AAA scored, BBB with growth `not_classified` (a missing input named in `reason_input` / `reason_detail`), and RRR followed then retired with `retireInstrument` after it is added to a universe; select all three in the universe and choose Compare; expect all three columns, "Incomplete" on BBB's growth with the input named, "Not followed" on every RRR factor, and no value shown for either.
- [ ] T009 Implement TC-E2E-009 and TC-E2E-010 in `tests/e2e/fix-insufficient-evidence.spec.ts` (depends on T001, T002, T003, T004; flow 5; AC-12, 13, 17, 18, 20, 23), both **guarded**. Each follows its stock plus thirty `followerSymbols` (`followStocks`), so the peer-set floor of 30 is reached without the stock under test, and states a history depth of three years. Timeouts: 240 s for TC-E2E-009 (three runs), 180 s for TC-E2E-010 (two runs).
  - TC-E2E-009: `withholdSymbol("BBB")` (T002 (c): BBB's statement paths answer 503), run, and expect the run to end `partial` (BBB's fundamentals recorded `failed`) and a new set; open `/research/stocks/BBB` and expect the growth card to name the missing input ("revenue growth is missing"), the rule and how to recover ("The next Complete or Partial download will try again." and a Data health link). `restoreSymbol("BBB")`, run again, expect `succeeded` and a new set; reopen the evidence and expect growth to show a score and percentile; open the "Earlier scores" tab and expect exactly one earlier row, "Incomplete", with its original date. Then run a **third** time (expect `succeeded` and a new set) and expect two earlier rows, newest first: the classified result above the Incomplete one, by set date and the time each was produced. The third run is what makes "newest first" observable, since one row has no order (it adds no other precondition).
  - TC-E2E-010: follow `NOFCCC` (T002 (b): its statement paths answer 404), run, and expect the run to end `partial` (its fundamentals recorded `not_found`) and a new set; open its evidence and expect the growth card to say the provider reports no such data, "No action in FactorFlow changes this.", and no Data health link. Run again (`partial` again) and expect growth still "Incomplete" with the same provider-holds-no-data reason.
  Do not use a stub mode that answers 200 with an empty list for either case: the product records that as `unchanged` (DEC-0047), so the run would end `succeeded` and the card would offer recovery (AR-011).
- [ ] T010 [P] Implement TC-E2E-011 and TC-E2E-012 in `tests/e2e/universe-maintenance.spec.ts` (depends on T003, T004; flow 6; AC-3, 4, 5, 6, 15). TC-E2E-011: precondition an active universe Core with three members, seeded by SQL with `seedUniverseRecorded("Core", …, 5)` so its events are dated five days ago (T004: the API cannot backdate an event, and the as-of view needs an earlier date whose members differ from today's); rename it to "Core 2", add one stock and remove another, and expect each change at once; open the History tab and expect every event newest first (the rename shows both names); view members as of an earlier date and expect that date's members; retire the universe and expect the header to show Retired, the universe gone from the active list, and its members and history still readable. TC-E2E-012: precondition an active universe whose only member is a stock retired from acquisition; choose Remove on it and expect Remove blocked with an adjacent Retire action and the member still listed; choose Retire, expect the universe retired, the stock shown as "Not followed" throughout, and History still listing it as a member.

**Checkpoint**: All 12 test cases have automated tests (eight cases wholly unguarded, TC-E2E-002 in part, and
TC-E2E-001, 009 and 010 guarded as described), each titled with its TC-E2E id.

---

## Phase 4: Test Validation & Cleanup

**Purpose**: Prove the new specs pass, are isolated, and leave the existing suite green.

- [ ] T011 Run the full Playwright suite (`npm run test:e2e`) with Docker available and confirm the existing CAP-001 specs and the new CAP-002 specs pass, with the guarded tests reported as skipped with the DEC-0285 reason and nothing else skipped. If no container runtime is available, record that and do not report a green suite (tech stack note). Depends on T005 to T010.
- [ ] T012 Check isolation: run each new spec file alone (`npx playwright test tests/e2e/<file>`) and the six files in reverse order; confirm no test depends on file order or on another test's data, that `resetAcquisitionStore()` empties the CAP-002 tables, and that no run is left non-terminal. Remove any leftover helper, unused import or duplicate seed. Depends on T011.
- [ ] T013 Run the frontend gates on the changed TypeScript: `npx tsc --noEmit` (it covers `web/src` only, through `tsconfig.json` `include`), `npm run lint`, `npm run format`; and type-check the e2e specs and their support files with a new `tsconfig.e2e.json` that extends `tsconfig.json`, sets `types` to `["node"]` and includes `tests/e2e` and `playwright.config.ts`, run as `npx tsc --noEmit -p tsconfig.e2e.json` (AR-005). Biome must not read the gitignored `uv build` output: `biome.json` `files.ignore` lists `build/**` (added in `c15c923` for v2 AR-006), so `npm run lint` and `npm run format` stay clean with `build/` on disk. Python gates for the stub: `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `uv run pytest tests/unit/test_massive_stub.py` (T002's unit test), and `uv run pytest -m 'not postgres'` to confirm nothing under `tests/e2e/` is collected. Depends on T012.

**Checkpoint**: All new tests pass or skip for the stated reason, no flaky test,
isolation verified, lint and type checks clean.

---

## Dependencies & Execution Order

### Task Dependencies
- T001, T002, T003: no dependencies (parallel). T003's `withholdSymbol` and `restoreSymbol` call the stub controls T002 adds, but they touch different files.
- T004: depends on T003.
- T005: depends on T001, T002, T003, T004.
- T006, T008, T010: depend on T003, T004; parallel with each other.
- T007: depends on T001, T003, T004; parallel with T006, T008, T010.
- T009: depends on T001, T002, T003, T004.
- T011: depends on T005 to T010. T012 depends on T011. T013 depends on T012.

### Parallel Opportunities
- Phase 1: T001, T002 can run in parallel.
- Phase 2: T003 first, then T004.
- Phase 3: T006, T007, T008, T010 can run in parallel (different files); T005 and T009 once T001 and T002 are done.

### Phase Dependencies
Phase 1 and T003 before T004; Phase 2 before Phase 3; Phase 3 before Phase 4.

---

## Validation Plan

### Constitution-Defined Commands
(`docs/constitution/tech-stack.md`, Validation Commands, working directory `.`)
- Build: `uv build` and `npm run build`
- Test: `uv run pytest`, `uv run pytest -m 'not postgres'`, `npm run test`, `npm run test:e2e`
- Lint: `uv run ruff check .`, `npm run lint`, `uv run mypy src`, `npx tsc --noEmit`
- Format: `uv run ruff format --check .`, `npm run format`

### Test-Specific Validation
- Run the CAP-002 e2e specs: `npx playwright test tests/e2e/research-after-download.spec.ts tests/e2e/universe-by-hand.spec.ts tests/e2e/universe-from-result.spec.ts tests/e2e/compare-and-evidence.spec.ts tests/e2e/fix-insufficient-evidence.spec.ts tests/e2e/universe-maintenance.spec.ts`
- Expected result today: 13 tests in total (12 cases, TC-E2E-002 split in two); 9 passing (TC-E2E-002 before the run, 003, 004, 005, 006, 007, 008, 011, 012) and 4 skipped with the DEC-0285 reason (TC-E2E-001, TC-E2E-002 after the run, 009, 010). Once system design question 1 is resolved, `line_items.unresolved()` is empty and the stub serves statements carrying the resolved keys (see Notes), all 12 cases (13 tests) must pass with no skip.
- The stub's status codes, checked without the guard: `uv run pytest tests/unit/test_massive_stub.py` (T002). Expected: every test passes.
- Type-check the e2e TypeScript: `npx tsc --noEmit -p tsconfig.e2e.json` (T013). Expected: exit 0.
- `postgres` and Playwright runs need a container runtime and installed browsers (`npx playwright install`); report a missing runtime rather than a partial green.

---

## Notes

- **Open payload keys (DEC-0285, PROVISIONAL).** `line_items.py` keeps all seven
  statement payload keys at `REQUIRES_INPUT`, and system design section 8 question 1
  records the owner's input as outstanding. Until then no run can score value or
  growth, so TC-E2E-001, TC-E2E-002 (after the run), TC-E2E-009 and TC-E2E-010 are
  guarded. The owner resolving that question is what unblocks them; the stub
  must then serve the real keys (an additional stub task at that point, not
  guessed here). That task must also date the statements: today the `ok`-mode
  statement row is dated at the request's `period_end.gte`, the start of the
  history window, so it must serve recent and earlier quarters or value and
  growth read outdated or uncomputable (automation review v3, AR-011 note).
  Resolution also removes the `xfail` in
  `tests/unit/test_line_items_resolved.py`.
- **Provider answers and run outcomes (AR-011).** The product reads a provider
  answer by status: a 200 with an empty list is `unchanged` (DEC-0047), a 404
  is `not_found`, and a 503 is `failed`. A run ends `partial` only when a row is
  `failed`, `not_found` or `skipped` (`runs/journal.py`), and the evidence says
  "the provider reports no …" only for a `not_found` input (DEC-0181). So
  TC-E2E-010's `NOFCCC` answers 404 and TC-E2E-009's BBB answers 503 for one
  run; both changes are status codes, not payload keys, and stay within
  DEC-0285.
- **SQL-seeded preconditions.** Besides the scored sets, two preconditions are
  inserted by SQL rather than created through the API (T004): the followed
  stocks of the guarded real-run cases (`followStocks`; adding thirty-one stocks
  through the screen is not the behaviour under test), and TC-E2E-011's universe
  with events dated five days ago (`seedUniverseRecorded`; the API cannot
  backdate an event). Universes for TC-E2E-007, 008 and 012 are still created
  through the API.
- **Seeding versus UI.** Seeded sets exercise the interface and API against real
  rows, but not the build. The build, the scheduler loop and the keys are covered
  by the integration tests (TC-INT-027 to 058). The e2e specs assert only what the
  owner sees.
- **Spec labels.** The spec names stocks AAA, BBB, CCC, RRR and ZZZ. The CCC
  stock needs the `NOF` prefix so the stub answers 404 for its fundamentals; BBB
  is withheld for one run by the stub control rather than by its name; the other
  names are used as written. TC-E2E-001's unnamed "stock that lacks one input"
  is `NEWAAA`, whose prices start too recently for a 12-month return. The specification's "20 qualified, 30 needed" is an
  example value; the test asserts the count it set up.
- **TC-E2E-002 split.** The spec's error case has two observations that need
  different preconditions. It is automated as two tests with the same TC id so the
  first (never scored) is not held back by the guard.
- **TC-E2E-005 membership.** The spec's "even if the filter now matches different
  stocks" cannot be forced while real builds cannot score value or growth; the test
  asserts the n members are unchanged after a later set, and notes the stronger
  condition is exercised once the keys resolve.
- **Instrument retirement.** TC-E2E-008 and 012 need a followed stock that is later
  retired; `retireInstrument` must use the product's retire path so the stock leaves
  acquisition the way the spec means, and must not write the lifecycle column.
- **Suite constraints.** `playwright.config.ts` runs one worker with a shared
  database; guarded and long tests set their own timeouts. No change to
  `playwright.config.ts` is planned. No task writes into a third-party repo.
