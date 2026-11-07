---
artifact_schema_version: 1
artifact_id: CAP-003-E6-S6-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T07:21:49Z
  source_artifacts:
    - id: CAP-003-E6-S6
      version: "1"
    - id: CAP-003-E6
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-data-health-ui
      version: "1"
    - id: CAP-003-integration-tests
      version: "1"
    - id: CAP-003-E6-S7-tasks
      version: "1"
    - id: CAP-003-E2-S5-tasks
      version: "1"
    - id: CAP-003-E3-S4-tasks
      version: "1"
    - id: CAP-003-E7-S2-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E6-S6 — Data Health Journeys End to End: Trusting the Data and the Unrecognised Symbol

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S6.md`
**Component**: `FactorFlow-v2` (end-to-end specs in `tests/e2e/`; design `data-health-ui` §7)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

This story proves Data health against the running product (capability flow 2; data-health-ui §7 *Trust journey* and *Not found journey*). It adds two Playwright specs on the acquisition stack (`ACQUISITION_BASE_URL`, 127.0.0.1:8125). That stack has a real API, an ingestion runner, PostgreSQL and the Massive stub, so downloads really run and really fail.

- `tests/e2e/data-health-trust.spec.ts` (TC-INT-014). A download ends `partial` because the stub withholds three of five symbols' financials. Data health then shows:
  - the verdict *Mostly yes. 3 of 5 followed stocks need attention; …*;
  - *Needs fixing · 3*, listing the three stocks, with **Download now** in that card's header because the rows are retryable;
  - the partial download in Recent downloads as *Partial*, never *Complete*.

  **Download now** pressed by keyboard starts a full download (`202`, `queued_behind` null). That download heads Recent downloads with its progress *{done} of 5 stocks*. While it runs, the aggregate is not re-read. When it ends, the aggregate is re-read exactly once and the verdict turns to *Yes. None of the 5 followed stocks needs attention.* without a reload.
- `tests/e2e/data-health-not-found.spec.ts` (TC-INT-019). The stub does not recognise one symbol (`UNK` prefix), so its row is *Not found* and offers only **Stop following** and **Follow a different symbol**, never a download.
  - **Stop following**, confirmed by keyboard, sends `DELETE /api/instruments/UNKSF`. The row leaves, *Stopped following UNKSF* is announced, and the Data health chip goes from 2 to 1. `/data/coverage?symbol=UNKSF` still lists the stock, marked *Stopped following*.
  - **Follow a different symbol** lands on `/data/followed` with router state `{ focusAdd: true }`. The add-field focus is CAP-003-E7-S3's to assert (story Description; backlog review v2 FINDING-2).

No production code, schema, support module or configuration changes. The stub's per-symbol behaviour (`withhold`, `hold`, the `UNK` prefix) is delivered, and the specs drive it through `tests/e2e/support/acquisition.ts` as it stands (Resolved Conflict 4).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-11 | Data health opens with the verdict naming how many followed stocks need attention | T002, T005 |
| AC-13 | Each row names the stock, what was being downloaded, the reason and the fix | T002, T003 |
| AC-14 | An unrecognised symbol offers stopping following and following a different symbol, never a download | T003, T004, T005 |
| AC-15 | **Download now** starts a download over the whole followed list | T002, T005 |
| AC-28 (story text: the checks refresh once when the download ends, not on a timer; DAC-E6-15) | The aggregate is re-read exactly once at the download's end and not while it runs (Resolved Conflict 1) | T002, T005 |
| DAC-E6-S6-1 | Stub failing three symbols, download ends `partial`: *Mostly yes. 3 of {m} …*, *Needs fixing · 3* lists them, **Download now** in that header | T002 |
| DAC-E6-S6-2 | Stub not recognising one symbol, **Stop following** confirmed by keyboard: `DELETE` sent, row leaves, chip decrements, Coverage still lists it as stopped following with its history | T003 |

Mapped test cases (`tests/integration/integration-tests.md` lines 328-349 and 438-459; `tests/coverage-matrix.md` lines 311-312 and the per-story count "2 of 2" at line 430):

- **TC-INT-014** (DAC-E6-S6-1): T002.
- **TC-INT-019** (DAC-E6-S6-2): T003.

The test specification is `status: draft`. Its steps are used as written and sharpened below. TC-INT-021 (Download now heads Recent downloads) and TC-E2E-003 cover ground this story's Description also covers. They stay with Phase 6b automation (Other Notes, *Test cases this story does not own*).

## Phase 1: Setup

**Purpose**: Confirm the inputs. No package, configuration, directory or support module is added.

- [ ] T001 Confirm the hard prerequisites are in the working tree before Phase 2. Create or edit no file. Record the `grep -n` outputs in the first TDD cycle's evidence.
  - **CAP-003-E6-S7.** `web/src/app/routes.tsx` has `path="/data"` bound to the lazy `DataHealthScreen`. `web/src/app/destinations.ts` has `{ group: "data", label: "Data health", to: "/data", count: "problems" }`.
  - **CAP-003-E2-S5.** `src/factorflow/api/app.py` includes `data_health.router`, so `GET /api/attention`, `GET /api/data-health` and `GET /api/data-health/problems` are served by every stack `scripts/run-e2e-server.sh` starts, the acquisition stack included.
  - **CAP-003-E3-S4.** `routes.tsx` binds `/data/coverage` and `/data/followed`.
  - **CAP-003-E7-S2** (the edge this plan adds; Resolved Conflict 2). `web/src/screens/coverage/index.tsx` seeds its symbol filter from `?symbol=`, the field is named *Filter by symbol*, and the *Lifecycle* column renders *Stopped following* for a `retired` row through CAP-003-E7-S3's `LifecycleBadge`. The table is `DataTable` labelled *Coverage table*, with the symbol as row header.
  - **The screen's DOM contracts** (reached through CAP-003-E6-S7 → CAP-003-E6-S5; read, not imported):
    - CAP-003-E6-S1: the `h1` *Is the data good enough to trust?*, and `data-testid="verdict-sentence"` holding the badge and the sentence.
    - CAP-003-E6-S3: the *Needs fixing* `section` labelled by its `h2` *Needs fixing · {n}*; one `li` per row; the symbol link named *{SYMBOL}, show in the coverage table*; **Stop following** named *Stop following {SYMBOL}*; the link named *Follow a different symbol than {SYMBOL}*.
    - CAP-003-E6-S2: `DownloadNow` named *Download now*; the confirm dialog titled *Stop following {SYMBOL}*, **Cancel** first and focused; the polite live region *Stopped following {SYMBOL}*.
    - CAP-003-E6-S4: the *Recent downloads* table (`DataTable` label *Recent downloads*); the running row's `progressbar` named *{done} of {total} stocks*; the sub-line *Starts when you press Download now · checked {time}*.

    If one of these names differs in the delivered code, use the delivered name and record it in the cycle's evidence. Never change production code from this story.
  - Run `npx tsc --noEmit -p tsconfig.e2e.json` and `npm run test`, and record both as green.

**Checkpoint**: Every listed route, export and name exists. The baseline is green.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the two journey specs. This story adds no production code, so each spec is expected to pass against the delivered E6, E7-S2 and shell code on its first green run. Its strength is shown by the production mutants each one kills (T006). Under the driver, each spec is one TDD cycle (T008).

**Shared conventions** (each spec defines its own helpers, as the delivered specs and CAP-003-E3-S8's do; no new support module):

- **Stack.** `test.use({ baseURL: ACQUISITION_BASE_URL })`. `test.beforeEach(resetAcquisitionStore)` and `test.afterEach(resetStub)`, so no hold or withhold outlives a test and no run is left non-terminal. `test.setTimeout(240_000)`. Imports come from `./support/acquisition`: `ACQUISITION_BASE_URL`, `holdSymbol`, `releaseSymbol`, `resetAcquisitionStore`, `resetStub`, `restoreSymbol`, `waitForRunState` and `withholdSymbol`.
- **Seeding through the API, not the screens.** The `request` fixture sends:
  - `PUT /api/settings/history-depth` `{ years: 1 }` and expects `200`;
  - `POST /api/instruments` `{ symbols: [...] }` and expects `201`.

  This is the CAP-003-E5-S5 T005 and `acquisition-stack-stub.spec.ts` idiom. It keeps the specs independent of the delivered screens' labels, which CAP-003-E7 rewrites.
- **Spec-local `seedPartialDownload(request, follow: string[], withhold: string[]): Promise<string>`.** It:
  - states the depth and follows `follow`;
  - calls `withholdSymbol(s)` for each of `withhold`;
  - sends `POST /api/acquisition-runs`, expects `202`, and keeps `run_id`;
  - returns `await waitForRunState(request, runId, ["partial"], 90_000)`'s run id.

  A run ending in any other state fails the precondition with its state named.
- **Keyboard only** (AC-25). Each owner step is `page.keyboard.press` or `page.keyboard.type`. The spec-local `tabTo(page, locator, max = 60)` presses `Tab` until `await locator.evaluate((el) => el === document.activeElement)` is true. After `max` presses it fails with the locator's description (CAP-003-E3-S8's helper, copied). No owner step uses `click`, `fill` or `focus`.
- **Locators.**
  - `needsFixing(page)` is `page.getByRole("region", { name: /^Needs fixing · \d[\d,]*$/ })`.
  - `rowOf(page, s)` is `needsFixing(page).getByRole("listitem").filter({ has: page.getByRole("link", { name: \`${s}, show in the coverage table\`, exact: true }) })`.
  - `dataHealthRailLink(page)` is `page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: /^Data health(, .+)?$/ })`.
- **Expected strings** are independent literals written in the spec, never values read from `copy.ts`. A mutant in the copy module cannot then move both sides of an assertion.
- **Request counting.** `aggregateReads` is an array that a `page.on("request", …)` listener pushes to. It records only `GET` requests whose `new URL(r.url()).pathname` is exactly `/api/data-health`, so `/api/data-health/problems` is excluded.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-INT-014 (Partial download: verdict, Needs fixing rows and Download now) in the new `tests/e2e/data-health-trust.spec.ts`. Put `// Implements TC-INT-014` above the test, and title it `"TC-INT-014: a partial download is named, downloaded again, and the checks refresh once at its end"`.
  - The doc comment cites AC-11, AC-13, AC-15, AC-28, DAC-E6-S6-1, DAC-E6-15, data-health-ui §7 *Trust journey* and capability flow 2. It also says the stub's `withhold` stands in for "the Massive stub failing three symbols". Each withheld stock's financials are recorded `failed`, which is retryable.
  - **Precondition (TC: "a download ended `partial`").** `seedPartialDownload(request, ["DHA", "DHB", "DHC", "DHD", "DHE"], ["DHA", "DHB", "DHC"])`. Keep `firstRunId`.
  - **Step 1, open `/data`.** `page.goto("/data")`. `page.getByRole("main").getByRole("heading", { level: 1 })` has exact text *Is the data good enough to trust?*.
  - **Step 2, the verdict (AC-11).**
    - `page.getByTestId("verdict-sentence")` has text exactly *Mostly yes. 3 of 5 followed stocks need attention; their scores show as Incomplete until they're fixed.* This is the epic DAC-E6-1 sentence with *n* = 3 and *m* = 5. The story's *…* elides the rest (Resolved Conflict 3).
    - It contains one `[data-variant="status-warning"]` element whose text is *Mostly yes*.
  - **Step 2, *Needs fixing* (AC-13; DAC-E6-S6-1).**
    - `needsFixing(page)`'s `h2` has text exactly *Needs fixing · 3*.
    - It has exactly 3 `listitem`s. Their symbol links' accessible names are, in order, `["DHA, show in the coverage table", "DHB, show in the coverage table", "DHC, show in the coverage table"]` (served symbol order), and their `href`s are `/data/coverage?symbol=DHA` and so on.
    - Each row contains a `[data-variant="status-critical"]` badge with text *Failed*, and text matching `/Downloading company financials failed: .+, \d+ attempts?/`. The reason is the stored one, so only its presence is asserted.
    - Each row contains *Its scores show as Incomplete until this is fixed, and so does every universe holding it.* and *Download again to retry; data already stored is never duplicated or overwritten.*
    - Each row has no `button` named `/^Stop following/`: a failed row offers no per-row control.
    - `needsFixing(page).getByRole("button", { name: "Download now" })` has count 1: the header action, present because a row is retryable.
  - **AC-12 (TC-E2E-003 edge; data-health-ui §7 *Partial is never complete*).** In `page.getByRole("table", { name: "Recent downloads" })`, the row whose row-header link `href` is `/data/downloads/${firstRunId}` contains a status badge with text *Partial*, and no badge in it reads *Complete*.
  - **Step 3, Download now (AC-15).**
    - `restoreSymbol` each of DHA, DHB and DHC, so the retry can succeed. Then `holdSymbol("DHE")`, so the download stays running long enough to be observed.
    - Start `aggregateReads` here, at length 0.
    - Arm `page.waitForResponse` for `POST` on pathname `/api/acquisition-runs`.
    - `tabTo(page, needsFixing(page).getByRole("button", { name: "Download now" }))`, then `Enter`.
    - The response status is `202`. Its JSON `queued_behind` is `null`, and `run_id` is a UUID other than `firstRunId`. Keep it as `retryRunId`.
    - Within 30 s, the first body row of the Recent downloads table has a row-header link whose `href` is `/data/downloads/${retryRunId}`, and its *Outcome* badge reads *Downloading*.
    - In that row, `getByRole("progressbar", { name: /^\d+ of 5 stocks$/ })` is visible: the run named all five followed stocks, so the download covers the whole followed list (AC-15; DEC-0213 (f)).
    - The Recent downloads region's text matches `/Starts when you press Download now · checked \d{2}:\d{2}:\d{2} [A-Z]{3,4}/`.
  - **No aggregate read while running (DAC-E6-15 "never on a timer").**
    - Count the `GET /api/attention` responses after the press with a second listener, and wait until at least 2 have arrived. The 10 s cadence while the download is non-terminal gives them within 30 s.
    - Then `expect(aggregateReads).toHaveLength(0)`.
  - **Step 4, the end.**
    - `releaseSymbol("DHE")`.
    - `expect(await waitForRunState(request, retryRunId, ["succeeded", "partial", "failed", "cancelled", "abandoned"], 90_000)).toBe("succeeded")`.
    - Without any `page.goto` or `reload`, within 30 s, `page.getByTestId("verdict-sentence")` has text exactly *Yes. None of the 5 followed stocks needs attention.*
    - `needsFixing(page)`'s `h2` reads *Needs fixing · 0*, and the region contains *Nothing needs fixing.*
    - `expect(aggregateReads).toHaveLength(1)`: the checks refreshed once at the end (AC-28 as the story states it; DAC-E6-15).
  - **Kills**, each a production mutant that must turn this spec red (T006):
    - negate-boolean on `rows.some((r) => r.retryable)` in `web/src/screens/data-health/needs-fixing.tsx`: the header **Download now** is missing.
    - a hand-written mutant in `web/src/app/use-data-health.ts` that drops the terminal-transition read: the verdict never turns *Yes*.
    - a hand-written mutant in `use-data-health.ts` that re-reads every 10 s: `aggregateReads` is non-zero while running.
    - a hand-written mutant in `web/src/screens/data-health/download-now.tsx` that drops `refresh("attention")` on a `202`: the attention cadence stays at 60 s, so no progress row appears within 30 s.
    - swap-case on `partial` → `succeeded` in CAP-003-E1-S5's download label table: *Complete* instead of *Partial*.
- [ ] T003 [P] Implement TC-INT-019 (Stop following an unrecognised symbol by keyboard) in the new `tests/e2e/data-health-not-found.spec.ts`. Put `// Implements TC-INT-019` above the test, and title it `"TC-INT-019: an unrecognised symbol is stopped following by keyboard and its history is kept"`.
  - The doc comment cites AC-14, AC-17, DAC-E6-S6-2, data-health-ui §7 *Not found journey* and §2.7, and Resolved Conflict 2. It also says that a symbol starting `UNK` answers `404` on every provider path, so it is recorded `not_found`, which is not retryable.
  - **Precondition.** `seedPartialDownload(request, ["SFA", "SFB", "UNKSF"], ["SFB"])`. SFB is a retryable second problem, so the chip visibly decrements from 2 to 1 rather than vanishing from 1 (Other Notes).
  - **Step 0, the row and the chip (AC-14).** `page.goto("/data")`.
    - `needsFixing(page)`'s `h2` reads *Needs fixing · 2*.
    - `rowOf(page, "UNKSF")` contains a `[data-variant="status-warning"]` badge with text *Not found*, *The provider doesn't recognise this symbol.* and *Probably a typo or a delisted ticker. Downloading again won't help.*
    - It holds the `button` named *Stop following UNKSF* and the `link` named *Follow a different symbol than UNKSF*.
    - It holds no `button` named *Download now*, and no text *Download again to retry*. AC-14: never a download.
    - `dataHealthRailLink(page)` has the accessible name exactly *Data health, 2 stocks with problems*.
  - **Step 1, confirm by keyboard.**
    - `tabTo(page, rowOf(page, "UNKSF").getByRole("button", { name: "Stop following UNKSF" }))`, then `Enter`.
    - `const dialog = page.getByRole("dialog", { name: "Stop following UNKSF" })` is visible and has `data-variant="confirm"`.
    - It contains exactly *Stop following UNKSF? Its history is kept, and strategies holding it keep holding it. You can follow it again later.*
    - Its button named *Cancel* is focused.
    - Arm `page.waitForRequest` for method `DELETE` with pathname exactly `/api/instruments/UNKSF`, and its response.
    - Press `Tab`. The dialog's *Stop following* button is focused. Press `Enter`.
  - **Step 2, the row, the announcement and the chip.**
    - The `DELETE` was sent, and its response status is `200`.
    - The dialog is hidden, and `rowOf(page, "UNKSF")` has count 0.
    - `needsFixing(page)`'s `h2` reads *Needs fixing · 1*, and its only `listitem` is SFB's.
    - A `[aria-live="polite"]` element has text exactly *Stopped following UNKSF*.
    - Within 10 s, `dataHealthRailLink(page)`'s accessible name is exactly *Data health, 1 stock with problems*. The 10 s bound is shorter than the 60 s idle cadence, so the chip changes through the dialog's `refresh("attention")` (data-health-ui §2.7), not through a later tick.
  - **Step 3, history kept on Coverage (Resolved Conflict 2).**
    - Arm `page.waitForRequest` for `GET` on pathname `/api/coverage`.
    - `page.goto("/data/coverage?symbol=UNKSF")`.
    - The first coverage request's `searchParams.get("symbol")` is `UNKSF`.
    - `page.getByRole("textbox", { name: "Filter by symbol" })` has value `UNKSF`.
    - In `page.getByRole("table", { name: "Coverage table" })`, the row with row header `UNKSF` is visible and contains *Stopped following*. No row has row header `SFA`, which proves the query seeded the filter.
    - Through `request`: `GET /api/instruments?symbol=UNKSF&lifecycle=retired` answers `200` with an `instruments` row whose `symbol` is `UNKSF`. The record is kept, not deleted.
  - **Kills** (T006):
    - negate-boolean on the `not_found` test that gives a row **Stop following** in `web/src/screens/data-health/problem-row.tsx`: the button is missing.
    - a hand-written mutant in `stop-following-dialog.tsx` that skips `onStopped()`: the row stays.
    - a hand-written mutant that drops `refresh("attention")` after a `200`: the chip still reads 2 after 10 s.
    - drop-field-copy of `params.get("symbol")` in `web/src/screens/coverage/index.tsx` (CAP-003-E7-S2): the field is empty and SFA is listed.
    - a hand-written mutant that renders the `retired` lifecycle as *Retired* in CAP-003-E7-S3's `LifecycleBadge`.

### Additional Unit Tests

- [ ] T004 Implement the *Follow a different symbol* half of the not-found journey (story Description; data-health-ui §2.7; AC-14) as a second test in `tests/e2e/data-health-not-found.spec.ts`, after T003 in the same file. Title it `"Not found journey: Follow a different symbol opens Followed stocks with the add hint"`.
  - **Precondition.** The same `seedPartialDownload` as T003, in this test's own `beforeEach` reset.
  - **Steps.**
    - `page.goto("/data")`.
    - `tabTo(page, rowOf(page, "UNKSF").getByRole("link", { name: "Follow a different symbol than UNKSF" }))`, then `Enter`.
  - **Expected.**
    - `new URL(page.url()).pathname` is exactly `/data/followed`, and the search is `""`.
    - `await page.evaluate(() => window.history.state?.usr)` `toEqual({ focusAdd: true })`. This is React Router 6's `BrowserRouter` store for navigation state (`web/src/main.tsx`).
    - `page.getByRole("main")` holds no *There's no page at this address.* heading.
    - Nothing is asserted about the add field's focus. That is CAP-003-E7-S3's (story Description; Resolved Conflict 5).
  - **Kills** (T006):
    - remove-attribute on `state={{ focusAdd: true }}` in `problem-row.tsx`: `usr` is `undefined`.
    - swap-case `"/data/followed"` → `"/data/coverage"` on the link's `to`: the pathname is wrong.

**Checkpoint**: Both specs type-check with `npx tsc --noEmit -p tsconfig.e2e.json`. They are expected to pass on their first run, because the behaviour is delivered by the hard dependencies. A failure is either a test defect or a defect in a dependency: report it, and do not fix production code here.

---

## Phase 3: Core Implementation

**Purpose**: None. This chore story writes no production code. Its acceptance criteria are met by the two specs (Phase 2) passing on the real stack (Phase 4).

**Checkpoint**: Not applicable.

---

## Phase 4: Integration

**Purpose**: Run the journeys on the real stack and confirm the change set.

- [ ] T005 Run the specs on the real stack (story *Validation*; AC-11, AC-14, AC-15, AC-28; depends on T002, T003 and T004).
  - Run `npx playwright install chromium` if it is missing.
  - Run `npm run test:e2e -- tests/e2e/data-health-trust.spec.ts tests/e2e/data-health-not-found.spec.ts`. It needs a container runtime for PostgreSQL. The Bash sandbox blocks Docker, so this run may need the sandbox disabled.
  - Run it twice in a row. The second run proves `resetAcquisitionStore` isolates the specs.
  - If no container runtime or browser is available, report the exclusion. Never call a partial run green.
- [ ] T006 Prove each spec's strength with the production mutants in Other Notes, *Hand-written mutants* (depends on T005).
  - `scripts/mutation-run.py generate` has nothing to derive, because this story adds no production line. Write the hand-written mutants as `$TMPDIR/e6s6-mutants.json`, `{ "mutants": [{ "id", "cycle", "file", "old", "new" }, …] }`, each `old` copied exactly from the delivered file so it occurs once. Cycle 1 holds the trust-spec mutants and cycle 2 the not-found ones.
  - Stage the two spec files first, because `run` refuses untracked files. Then run, from the harness root:
    - `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants "$TMPDIR/e6s6-mutants.json" --only 1 --jobs 1 --command "npm run test:e2e -- tests/e2e/data-health-trust.spec.ts" --out "$TMPDIR/e6s6-results-1.json"`;
    - the same with `--only 2`, the not-found spec and `--out "$TMPDIR/e6s6-results-2.json"`.

    Use one job, because each clone starts the e2e stack on fixed ports. Then run `summary` on each result for the cycle's `mutation:` block.
  - Every mutant must be `killed`. A mutant that survives is a test defect in this story. Strengthen the assertion. Never weaken the mutant.
- [ ] T007 Confirm scope (depends on T006).
  - `git status --short` lists only:
    - `tests/e2e/data-health-trust.spec.ts` and `tests/e2e/data-health-not-found.spec.ts`;
    - this story's `-tasks.md`, `-tdd-evidence.yaml` and status line.
  - `git diff --exit-code -- web/src src tests/e2e/support scripts/run-e2e-server.sh playwright.config.ts package.json package-lock.json` exits 0. No production code, no support module and no stub change (Resolved Conflict 4).

**Checkpoint**: Both specs pass twice on the real stack, every listed mutant is killed, and the diff is the two spec files.

---

## Phase 5: Polish

**Purpose**: Validation and the TDD evidence.

- [ ] T008 Run `npm run format`, which is a check. Fix any report with `npx biome format --write` on the two spec files only. Then run `npm run lint`, `npx tsc --noEmit`, `npx tsc --noEmit -p tsconfig.e2e.json` and `npm run test`. All must be green, and none changes behaviour.
- [ ] T009 After each TDD cycle in T002–T008 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E6-S6-tdd-evidence.yaml` beside this story, with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence;
    - the structured `mutation:` block. It holds T006's hand-written production mutants run against the spec, since `scripts/mutation-run.py generate` has no production file of this story to mutate. When no container runtime is available, it is `mutation: {not_applicable: <reason>}`;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  - (1) T002: the trust spec.
  - (2) T003 and T004: the not-found spec.

  Neither changes production code. The RED of each cycle is the spec failing against T006's production mutants, because the delivered behaviour exists before the spec does. T005, T007 and T008 add no behaviour and join cycle 2's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every cycle has its evidence entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E6-S7 | hard | `/data` registered with `DataHealthScreen`, and the Data health destination and its chip, which T002–T004 open and read. In the graph |
| CAP-003-E2-S5 | hard | The three data-health routes served by `create_app` on the acquisition stack. In the graph |
| CAP-003-E3-S4 | hard | `/data/coverage` and `/data/followed`, which T003 and T004 land on. In the graph |
| CAP-003-E7-S2 | hard | **Added by this plan.** `?symbol=` seeding of Coverage's filter, and *Stopped following* in Coverage's *Lifecycle* column, both asserted by T003 step 3 for DAC-E6-S6-2 "Coverage still lists the symbol as stopped following". The delivered Coverage screen holds the filter in local state (`web/src/screens/coverage/index.tsx` l.37) and labels the state *Retired*. Resolved Conflict 2 |
| CAP-003-E7-S3 | context | Its `LifecycleBadge` renders *Stopped following*, and its Followed stocks screen reads `focusAdd`, which this story does not assert (story Description). It reaches this story through CAP-003-E7-S2 in the graph (E7-S2 depends on E7-S3) |
| CAP-003-E6-S1 | context | The `h1` and `data-testid="verdict-sentence"` the specs read. Reached through CAP-003-E6-S7 → CAP-003-E6-S5; nothing imported |
| CAP-003-E6-S2 | context | `DownloadNow`, the confirm dialog and the polite announcement the specs drive. Reached through E6-S7 → E6-S5; nothing imported |
| CAP-003-E6-S3 | context | The *Needs fixing* region, rows and row actions the specs read. Reached through E6-S7 → E6-S5; nothing imported |
| CAP-003-E6-S4 | context | The *Recent downloads* table, progressbar and sub-line T002 reads. Reached through E6-S7 → E6-S5; nothing imported |
| CAP-003-E6-S5 | context | Composes the screen. Reached through CAP-003-E6-S7 |
| CAP-003-E3-S3 | context | `useDataHealth`'s terminal-transition read and the attention cadence T002 counts against. Reached through E6-S7 → E6-S5 |
| CAP-003-E3-S6 | context | The rail chip T003 reads. Reached through CAP-003-E6-S7 |
| CAP-003-E3-S8 | context | Source of the `tabTo` convention, copied into each spec rather than imported |
| CAP-003-E5-S5 | context | Precedent for API seeding on the acquisition stack (its T005); no code shared |
| CAP-003-E1-S5 | context | Its download-label table is the target of a T002 mutant. Reached through the E6 chain |
| CAP-003-E7-S7 | context | Repairs the delivered e2e specs that assert `/runs/{uuid}` URLs, which is why the full e2e suite is not this story's gate. Nothing shared |

New hard edge added to `dependencies.yaml`: `CAP-003-E6-S6 → CAP-003-E7-S2`. The graph stays acyclic. CAP-003-E7-S2's chain (E7-S3, E7-S4, E7-S5, E3-*, E1-*) never reaches CAP-003-E6-S6.

### Task Dependencies

- T001: no dependencies.
- T002 and T003: depend on T001. They are different files and can run in parallel.
- T004: depends on T003 (same file).
- T005: depends on T002, T003 and T004.
- T006: depends on T005.
- T007: depends on T006.
- T008: depends on T007.
- T009: interleaved. It runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- Phase 2: T002 (`data-health-trust.spec.ts`) in parallel with T003 then T004 (`data-health-not-found.spec.ts`).
- The specs cannot run in parallel at execution time. `playwright.config.ts` has `workers: 1` and the acquisition stack is shared.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`, which runs inside `scripts/run-e2e-server.sh`.
- Test: `npm run test` (unchanged and green).
- Lint: `npm run lint`.
- Format: `npm run format` (a check, no modification).
- Type check: `npx tsc --noEmit`, and `npx tsc --noEmit -p tsconfig.e2e.json` for the specs.
- End to end: `npm run test:e2e -- tests/e2e/data-health-trust.spec.ts tests/e2e/data-health-not-found.spec.ts`.
  - It needs `npx playwright install` and a container runtime. Report any exclusion and never call a partial run green.
  - The delivered specs that assert `/runs/{uuid}` URLs are CAP-003-E7-S7's to repair, so the full e2e suite is not this story's gate.

### Story-Specific Validation

- **DAC-E6-S6-1, AC-11, AC-13, AC-15:** T002 is green. *Mostly yes. 3 of 5 …*, *Needs fixing · 3*, the three rows and the header **Download now** are asserted. The retry's run row shows *{done} of 5 stocks*.
- **AC-28 / DAC-E6-15:** T002's `aggregateReads` is 0 after two attention answers while running, and 1 once the verdict has refreshed.
- **DAC-E6-S6-2, AC-14:** T003 is green: the `DELETE` with `200`, the row gone, *Stopped following UNKSF*, the chip from 2 to 1, and the Coverage row *Stopped following* under `?symbol=UNKSF`. T004 is green: `/data/followed` with `{ focusAdd: true }`.
- **AC-25 (keyboard):** `grep -nE "\.(click|fill|focus)\(" tests/e2e/data-health-trust.spec.ts tests/e2e/data-health-not-found.spec.ts` prints nothing. `tabTo` uses `locator.evaluate`, which this grep allows.
- **Strength:** every T006 mutant fails its spec.

---

## Notes

### Resolved Conflicts

1. **What "AC-28" means in this story.**
   - **The conflict.** The story's *From Capability / EPIC* list reads "[AC-28] The checks MUST refresh once when the download ends, not on a timer." Capability AC-28 is *Data health answers in bounded time*: p95 ≤ 2 s at 3,000 followed stocks.
   - **Governing: the capability text**, for what AC-28 is. The story's line is the epic's DAC-E6-15 (the aggregate refresh rule), which traces to AC-28 (`CAP-003-E6.md` l.105, l.151).
   - **Outcome.** The latency is measured by TC-INT-047's volume test, not by this story. The refresh rule the story's line states is what T002 asserts: no aggregate read while the download runs, and exactly one at its end. No requirement is dropped and none is invented.
2. **The not-found journey's Coverage assertion needs CAP-003-E7-S2** (register G15).
   - **The conflict.** DAC-E6-S6-2 requires "Coverage still lists the symbol as stopped following with its history", and the Description says its history "still shows on `/data/coverage?symbol=`". The story's Dependencies list only CAP-003-E6-S7, CAP-003-E2-S5 and CAP-003-E3-S4. The delivered Coverage screen ignores `?symbol=` (`index.tsx` l.37: `useState("")`) and labels the state *Retired*, a word AC-19 forbids on taken-over screens.
   - **Governing: the story's acceptance criterion over its Dependencies list.** The criterion can only pass once CAP-003-E7-S2 has seeded the filter and relabelled the column (E7-S2 summary; DAC-E7-6, DAC-E7-S2-1, DAC-E7-S2-5).
   - **Outcome.** The hard edge `CAP-003-E6-S6 → CAP-003-E7-S2` is added to `dependencies.yaml`. Planning adds discovered hard edges and never weakens a criterion to avoid one. Backlog review v2 FINDING-2 removed only the focus assertion, which is CAP-003-E7-S3's. It did not remove the Coverage assertion.
   - **"With its history" for a symbol the provider never recognised.** No history data was ever stored for it. Its history is the record of it: its Coverage row and its instrument record, kept with lifecycle `retired`. T003 asserts both. CAP-001's retire keeps every record (data-health-ui §2.7 "Its history is kept").
3. **The verdict wording in DAC-E6-S6-1.** The DAC quotes *Mostly yes. 3 of {m} followed stocks need attention…*. The epic's DAC-E6-1 (and data-health-ui §2.3) gives the full sentence: *…; their scores show as Incomplete until they're fixed.* The epic governs, and the story's ellipsis elides the rest. T002 asserts the full sentence, as CAP-003-E6-S1's T006 renders it. TC-E2E-003's "strategies skip them until fixed" is not asserted (register C4; DEC-0210; UX design 0.8: no strategy clause in M1).
4. **"`tests/e2e/support/massive_stub.py` configured per symbol"** (story *Implementation*).
   - The stub already behaves per symbol: `withhold`/`restore` (financials `503`, recorded `failed`), `hold`/`release`, and the `UNK` prefix (`404` everywhere, recorded `not_found`). `acquisition.ts` already exposes each of these.
   - The phrase is read as *configured through its controls*, not *edited*. Editing the stub would duplicate a delivered control (constraint 6, simplicity). T007 confirms the stub is unchanged.
5. **"Follow a different symbol lands on Followed stocks with the add field focused"** (data-health-ui §7 *Not found journey*). **Governing: the story Description** (backlog review v2 FINDING-2; register C9). T004 asserts the path and the router state `{ focusAdd: true }` only, and the focus is CAP-003-E7-S3's.
6. **Which header carries Download now** (register C10). DAC-E6-S6-1's "in the header because a row is retryable" is the *Needs fixing* header (epic DAC-E6-9). The page header always carries **Download now** while the verdict renders (DAC-E6-11). T002 therefore locates the button inside `needsFixing(page)` and presses that one.

### Open Gaps

None that this plan resolves with a value. Every string, count and route asserted is fixed by an approved artifact or a sibling plan:

- the verdict sentence: epic DAC-E6-1;
- *Needs fixing · {n}*, the row texts and the action names: data-health-ui §2.5 and §10;
- the dialog wording: data-health-ui §2.7, blueprint §9 verbatim;
- the chip names: DAC-E3-7 and CAP-003-E3-S6's T002 (b) and the count-1 form;
- the progressbar name: data-health-ui §2.6 and CAP-003-E6-S4 T004;
- *Stopped following* on Coverage: CAP-003-E7-S2 T005 and T008.

The symbols, follow counts and time bounds are test-fixture choices, not product contracts.

One limitation is recorded, not resolved. After the retry download ends, Recent downloads keeps that download's last-read row (*Downloading*) until the screen is next loaded. This is CAP-003-E6-S4 Open Gap 3, under DAC-E6-14's "otherwise only on load". T002 therefore asserts nothing about Recent downloads after the end. **Owning design:** data-health-ui §2.6 and epic DAC-E6-14.

### Other Notes

- **Test cases this story does not own.**
  - The coverage matrix maps this story's DACs to TC-INT-014 and TC-INT-019 only.
  - TC-INT-021 (Download now heads Recent downloads, nothing duplicated) and TC-E2E-003 and TC-E2E-004 trace to the same capability ACs. Like every integration and end-to-end specification, they are automated in Phase 6b (`automation-planning`).
  - CAP-003-E6-S5's plan says TC-E2E-003 and TC-E2E-004 "belong to CAP-003-E6-S6". This plan does not claim them. T002 and T003 drive most of TC-E2E-003's steps, but its strategy wording conflicts with M1 (Resolved Conflict 3), and TC-E2E-004 (a download already running, gaps not determinable) is outside this story's criteria. Phase 6b may reuse these specs' seeding.
- **Why a second problem in the not-found journey.** With UNKSF as the only problem, stopping it takes the chip from 1 to absent (AC-16: absent at zero). That is a removal, which a chip that never rendered would also pass. With SFB withheld, the count goes from 2 to 1, which proves the chip re-read rather than vanished. UNKSF's own row still offers no download. The *Needs fixing* header's **Download now** is there for SFB, so T003 asserts that the UNKSF `li` holds no download, not that the page has none.
- **Why the retry run is held.** `holdSymbol("DHE")` keeps the download non-terminal, so attention moves to its 10 s cadence and Recent downloads shows the progress row (DEC-0213 (f): `total` is non-null once the runner names the stocks). The terminal transition is then observed by attention, which is the trigger `useDataHealth` requires (`wasActive && isTerminal`, CAP-003-E3-S3 T007). Without the hold, a fast run could end before attention sees it active, and the refresh would not be exercised.
- **Seeding through the API.** The delivered `addInstruments`, `stateHistoryDepth` and `startRun` helpers drive CAP-001 screens at the legacy paths, with labels CAP-003-E7 rewrites. Seeding through the API keeps this story's specs about Data health only.
- **Store isolation.** `resetAcquisitionStore()` truncates the acquisition database and resets the stub in `beforeEach`, and `resetStub()` in `afterEach` releases any hold left by a failed assertion. The specs never touch the main stack on 8123, so CAP-003-E3-S8's and CAP-003-E6-S7's specs there are unaffected.
- **Plan checks.**
  - The keyboard grep matches no task step. `tabTo` uses `locator.evaluate`, and `page.evaluate` reads `history.state` without moving focus.
  - T007's `git diff --exit-code` list excludes only the two new spec files.
  - No assertion compares two values produced by the code under test. Every expected string is a literal, the run ids come from the API, and the router state is compared to the literal `{ focusAdd: true }`.
- **Hand-written mutants** (production files of the dependency stories). T006 runs them through `scripts/mutation-run.py run` in clones, so the working tree is never mutated. The old text is taken from the dependency plans. If the delivered line differs, copy the delivered text into `old` and make the same semantic change.
  - `web/src/screens/data-health/needs-fixing.tsx`: `rows.some((r) => r.retryable)` → `rows.some((r) => !r.retryable)`. Killed by T002 (header **Download now**).
  - `web/src/app/use-data-health.ts`: `wasActive && isTerminal` → `false`. Killed by T002 (the verdict never refreshes).
  - `web/src/app/use-data-health.ts`: add `useEffect(() => { const id = setInterval(retry, 10_000); return () => clearInterval(id); }, [retry]);`. Killed by T002 (`aggregateReads` is non-zero while running).
  - `web/src/screens/data-health/download-now.tsx`: `refresh("attention")` → (line removed). Killed by T002 (no progress row within 30 s).
  - `web/src/components/patterns/tiers.ts`: the `partial` download label *Partial* → *Complete*. Killed by T002 (AC-12 check).
  - `web/src/screens/data-health/problem-row.tsx`: the `not_found` condition guarding **Stop following** → its negation. Killed by T003 and T004.
  - `web/src/screens/data-health/stop-following-dialog.tsx`: `props.onStopped()` → (line removed). Killed by T003 (the row stays).
  - `web/src/screens/data-health/stop-following-dialog.tsx`: `refresh("attention")` → (line removed). Killed by T003 (the chip still reads 2).
  - `web/src/screens/data-health/problem-row.tsx`: `state={{ focusAdd: true }}` → (attribute removed). Killed by T004.
  - `web/src/screens/coverage/index.tsx`: the `params.get("symbol")` seed → `""`. Killed by T003 step 3.
  - `web/src/screens/instruments/badges.tsx`: *Stopped following* → *Retired*. Killed by T003 step 3.
- **Equivalent-mutant risk.** None expected. Every mutant changes an observable that a T002–T004 assertion reads.
- **Timing.** The bounds are the 10 s non-terminal attention cadence plus margin (30 s), and 90 s for a download on the stub. The test timeout is 240 s, which covers two downloads and the waits.
