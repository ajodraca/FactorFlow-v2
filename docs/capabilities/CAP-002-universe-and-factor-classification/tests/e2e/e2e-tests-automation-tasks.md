---
artifact_schema_version: 1
artifact_id: CAP-002-e2e-tests-automation-tasks
artifact_type: automation-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-05
updated: 2026-11-05
ai_provenance:
  agent_id: automation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-11-05T20:38:30Z
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
**Branch**: `usr/alvaro-de-jodra/CAP-002-automation`
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
- [x] T002 [P] Extend `tests/e2e/support/massive_stub.py` and update its module docstring: (a) deterministic per-symbol price drift in `_bars()` so that stocks differ in momentum (derive a small multiplier on the fixture bar's price fields from the symbol, for example from `sum(map(ord, symbol))`); the fixture `bar_regular.json` keys are the only keys used; (b) a symbol starting `NOF` answers every financial-statement path (`_FINANCIAL_PATHS`) with `200` and an empty `results` list, the provider holding no fundamentals for it (TC-E2E-010's stock CCC is added to the acquisition list as `NOFCCC`; the spec's "CCC" is a label); (c) a new `POST /__stub/mode` value `no-fundamentals` that does the same for every symbol, so TC-E2E-009 can create a partial outcome and then clear it with `{"mode": "ok"}` (extend `StubState.set_mode`'s accepted set and `ProviderMode` in T003). Do **not** vary fundamentals values or add any financial field beyond what `financial_annual.json` already contains: the statement payload keys the engine reads are unresolved (DEC-0285). Existing modes and the `UNK` rule stay unchanged. Supports TC-E2E-001, 002, 009, 010.

**Checkpoint**: `bash scripts/run-e2e-server.sh` still brings up every stack and the
existing CAP-001 specs pass unchanged; the stub answers an empty fundamentals
list for `NOF*` and in `no-fundamentals` mode.

---

## Phase 2: Test Utilities & Fixtures

**Purpose**: Reset the CAP-002 tables, seed scored sets, and guard the cases that
need a real build.

- [x] T003 [P] Modify `tests/e2e/support/acquisition.ts`: add the CAP-002 tables created by `src/factorflow/db/migrations/0005_universes.sql` and `0006_classifications.sql` to `DATA_TABLES` (`universe`, `universe_event`, `classification_set`, `classification_set_factor`, `factor_input`, `factor_classification`) so `resetAcquisitionStore()` empties them; update the "migrations 0001-0004" comment to 0001-0006; add `"no-fundamentals"` to the `ProviderMode` type (needed by T002). Keep every existing export unchanged. Supports all twelve cases.
- [x] T004 Create `tests/e2e/support/classification.ts` (depends on T003), a test fixture exporting, over `sql(…, "factorflow_acquisition")` and the acquisition API (`ACQUISITION_BASE_URL`):
  - `seedScoredStore({ stocks, ... })`: inserts instruments (lifecycle `active`, or `retired` with `retired_at`), one terminal `acquisition_run` (`succeeded`, with `started_at` and `ended_at`), one `complete` `classification_set` plus its `classification_set_factor` rows (`qualified_count`, ranked flag; at least 30 qualified per factor for the ranked cases), and for each stock three `factor_classification` rows (a score and whole-number percentile, or a `not_classified` reason code with `reason_input` and `reason_detail`) and the eight `factor_input` rows the evidence page lists, each with `as_of` and `known_on`. Mirror the column lists, check constraints and the `INPUT_NAMES` / `FACTORS` constants from `tests/integration/reader_seed.py` and `src/factorflow/classification/constants.py`; read the migration for NOT NULL and constraint rules before writing the INSERTs. A bulk path (a loop building one multi-row INSERT) seeds 30+ stocks quickly. A stock's scores are set by the caller so a test can name which stocks match a filter.
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

- [x] T005 Implement TC-E2E-001 and TC-E2E-002 in `tests/e2e/research-after-download.spec.ts` (depends on T001, T002, T003, T004; flow 1; AC-9, 10, 12, 13, 14, 15, 20, 21, 22). Test timeout raised with `test.setTimeout(120_000)`.
  - TC-E2E-002 (before the run), **unguarded**: with 20 followed stocks added through the Instruments screen and no run yet, open `/research` and expect "No stocks have been scored yet" (`copy.ts`) and no results table.
  - TC-E2E-002 (after the run), **guarded**: start a run with `startRun`, wait for `Succeeded` with `summaryOutcome`, reopen Research, expect every cell of each factor column to read "Not enough to rank", the header to state the qualified count and the need for 30 (20 and 30 in this setup), and no score or percentile cell.
  - TC-E2E-001, **guarded**: add 30 or more followed stocks (use the stub's per-symbol drift so percentiles differ), run, wait for `Succeeded`, open Research **without reloading or acting in between**, and expect each stock to show a score and a whole-number percentile (0 to 100) for value, growth and momentum; read the as-of line "Scores from {time}" in America/Chicago and follow its link to the run's detail page (`/runs/{id}`); add a stock lacking one input (`NOF` prefix) and expect "Incomplete" on the affected factor naming the input while its other factors still score.
- [x] T006 [P] Implement TC-E2E-003 and TC-E2E-004 in `tests/e2e/universe-by-hand.spec.ts` (depends on T003, T004; flow 2; AC-1, 3, 5, 15). Seed three or more scored followed stocks (T004). TC-E2E-003: on `/research/universes` choose New universe, name it "Core", enter three followed symbols, submit; expect the new universe's detail page with the three members and their value, growth and momentum scores, "Core" in the active list, and `/research` scoped to Core showing the same three stocks with the same scores as under All followed stocks. TC-E2E-004: seed AAA as followed and leave ZZZ unfollowed; enter both, submit; expect the dialog to stay open with the list kept and a message naming ZZZ with a link to the followed-stocks page (`/instruments`), and no "Core" in the Universes list afterwards.
- [x] T007 [P] Implement TC-E2E-005 and TC-E2E-006 in `tests/e2e/universe-from-result.spec.ts` (depends on T001, T003, T004; flow 3; AC-2, 5, 16). Seed 30 or more scored stocks where a known subset has a high value percentile and positive momentum. TC-E2E-005: set a value percentile lower bound and a momentum score lower bound on `/research`, read the heading count n, choose "Save these {n} as a universe", name it, confirm; expect the dialog and heading to show the same n, a toast linking to the new universe, n members and an origin line naming the filter and the score date; then start a run with `startRun`, wait for it to end and `waitForNewSet`, reopen the universe, and expect the same n members (membership fixed at save; it holds whether or not the new set matches different stocks). TC-E2E-006: set bounds that match nothing; expect "No stocks match these filters" with "Clear filters", "Save these 0 as a universe" blocked with its reason, and no universe in `/research/universes`. `test.setTimeout(120_000)` for TC-E2E-005.
- [x] T008 [P] Implement TC-E2E-007 and TC-E2E-008 in `tests/e2e/compare-and-evidence.spec.ts` (depends on T003, T004; flow 4; AC-9, 12, 14, 15, 16, 17). Seed a universe (via `createUniverseViaApi`) of at least 4 scored stocks. TC-E2E-007: open the universe in Research, sort by momentum percentile, set a growth threshold, expect the order and the heading count to match the filtered scope; check three rows and choose Compare, expect value, growth and momentum for all three stocks side by side; open the evidence page for one stock and expect every input with its value and the date each was known. TC-E2E-008: seed AAA scored, BBB with growth `not_classified` (a missing input named in `reason_input` / `reason_detail`), and RRR followed then retired with `retireInstrument` after it is added to a universe; select all three in the universe and choose Compare; expect all three columns, "Incomplete" on BBB's growth with the input named, "Not followed" on every RRR factor, and no value shown for either.
- [x] T009 Implement TC-E2E-009 and TC-E2E-010 in `tests/e2e/fix-insufficient-evidence.spec.ts` (depends on T001, T002, T003, T004; flow 5; AC-12, 13, 17, 18, 20, 23), both **guarded**; `test.setTimeout(120_000)`. TC-E2E-009: set the stub to `no-fundamentals`, run to a partial outcome with BBB on the list, open `/research/stocks/BBB` and expect the growth card to name the missing input, the rule and how to recover; set the stub back to `ok`, run again, wait for `Succeeded` and `waitForNewSet`, reopen the evidence and expect growth to show a score and percentile; open the "Earlier scores" tab and expect the earlier "Incomplete" result with its original date, newest first. TC-E2E-010: add `NOFCCC`, run, open its evidence, expect the growth card to say the provider holds no such data and offer no recovery; run again and expect it to remain not classified on growth with the same reason.
- [x] T010 [P] Implement TC-E2E-011 and TC-E2E-012 in `tests/e2e/universe-maintenance.spec.ts` (depends on T003, T004; flow 6; AC-3, 4, 5, 6, 15). TC-E2E-011: precondition an active universe Core with three members (via API); rename it to "Core 2", add one stock and remove another, and expect each change at once; open the History tab and expect every event newest first (the rename shows both names); view members as of an earlier date and expect that date's members; retire the universe and expect the header to show Retired, the universe gone from the active list, and its members and history still readable. TC-E2E-012: precondition an active universe whose only member is a stock retired from acquisition; choose Remove on it and expect Remove blocked with an adjacent Retire action and the member still listed; choose Retire, expect the universe retired, the stock shown as "Not followed" throughout, and History still listing it as a member.

**Checkpoint**: All 12 test cases have automated tests (eight cases wholly unguarded, TC-E2E-002 in part, and
TC-E2E-001, 009 and 010 guarded as described), each titled with its TC-E2E id.

---

## Phase 4: Test Validation & Cleanup

**Purpose**: Prove the new specs pass, are isolated, and leave the existing suite green.

- [ ] T011 Run the full Playwright suite (`npm run test:e2e`) with Docker available and confirm the existing CAP-001 specs and the new CAP-002 specs pass, with the guarded tests reported as skipped with the DEC-0285 reason and nothing else skipped. If no container runtime is available, record that and do not report a green suite (tech stack note). Depends on T005 to T010.
- [ ] T012 Check isolation: run each new spec file alone (`npx playwright test tests/e2e/<file>`) and the six files in reverse order; confirm no test depends on file order or on another test's data, that `resetAcquisitionStore()` empties the CAP-002 tables, and that no run is left non-terminal. Remove any leftover helper, unused import or duplicate seed. Depends on T011.
- [ ] T013 Run the frontend gates on the changed TypeScript: `npx tsc --noEmit`, `npm run lint`, `npm run format`; and the Python gates for the stub: `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` (the stub is under `tests/`, so also run `uv run pytest -m 'not postgres'` to confirm nothing collects it). Depends on T012.

**Checkpoint**: All new tests pass or skip for the stated reason, no flaky test,
isolation verified, lint and type checks clean.

---

## Dependencies & Execution Order

### Task Dependencies
- T001, T002, T003: no dependencies (parallel). T002 uses the `no-fundamentals` mode type added by T003, but they touch different files.
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
- Expected result today: 13 tests in total (12 cases, TC-E2E-002 split in two); 9 passing (TC-E2E-002 before the run, 003, 004, 005, 006, 007, 008, 011, 012) and 4 skipped with the DEC-0285 reason (TC-E2E-001, TC-E2E-002 after the run, 009, 010). Once system design question 1 is resolved and `line_items.unresolved()` is empty, all 12 cases (13 tests) must pass with no skip.
- `postgres` and Playwright runs need a container runtime and installed browsers (`npx playwright install`); report a missing runtime rather than a partial green.

---

## Notes

- **Open payload keys (DEC-0285, PROVISIONAL).** `line_items.py` keeps all seven
  statement payload keys at `REQUIRES_INPUT`, and system design section 8 question 1
  records the owner's input as outstanding. Until then no run can score value or
  growth, so TC-E2E-001, TC-E2E-002 (after the run), TC-E2E-009 and TC-E2E-010 are
  guarded. The owner resolving that question is what unblocks them; the stub
  must then serve the real keys (an additional stub task at that point, not
  guessed here). Resolution also removes the `xfail` in
  `tests/unit/test_line_items_resolved.py`.
- **Seeding versus UI.** Seeded sets exercise the interface and API against real
  rows, but not the build. The build, the scheduler loop and the keys are covered
  by the integration tests (TC-INT-027 to 058). The e2e specs assert only what the
  owner sees.
- **Spec labels.** The spec names stocks AAA, BBB, CCC, RRR and ZZZ. The CCC
  stock needs the `NOF` prefix so the stub withholds its fundamentals; the other
  names are used as written. The specification's "20 qualified, 30 needed" is an
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
