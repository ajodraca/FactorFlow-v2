---
artifact_schema_version: 1
artifact_id: CAP-003-E5-S4-tasks
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
  timestamp: 2026-11-07T07:22:43Z
  source_artifacts:
    - id: CAP-003-E5-S4
      version: "1"
    - id: CAP-003-E5
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-integration-tests
      version: "1"
    - id: CAP-003-E5-S5-tasks
      version: "1"
    - id: CAP-003-E6-S7-tasks
      version: "1"
    - id: CAP-003-E4-S6-tasks
      version: "1"
    - id: CAP-003-E2-S5-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E5-S4 — Home Journey End to End: a Partial Download Puts a Data Item on Home and the Chip in the Rail

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/home/stories/CAP-003-E5-S4.md`
**Component**: `FactorFlow-v2` (the Playwright suite, `tests/e2e/`; design `home-ui` §7 *Journey*)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

The owner wants Home proven against the running product: a download that leaves stocks failed shows up on Home as an item and in the rail as a count, and both leave once the data is fixed. This chore story writes one new spec, `tests/e2e/home-needs-you.spec.ts` (home-ui §2.1 and §7, capability flow 3), on the acquisition stack (real API, real PostgreSQL, the stub Massive provider). It changes no production file, API, schema or package.

The spec holds two tests:

- **Partial download, then fixed (TC-INT-025, TC-INT-013).**
  - Three followed stocks have their financial statements withheld at the stub, so the download ends `partial`.
  - Home's data item names the three, the rail's Data health chip reads *3* with the name *Data health, 3 stocks with problems*, and the Home chip equals the number of rendered items.
  - **Fix data** navigates to `/data`, which is asserted by URL only.
  - After a clean download, the next attention read removes the item and the Data health chip with no page reload.
- **Before and at the first download (AC-21, AC-7).** These are the Home assertions CAP-003-E4-S5 deferred.
  - With no download, `/home` reads *No data has been downloaded yet.* and offers **Start setup**, which opens `/setup`.
  - Once the first download is started, `/` lands on Home with the first-download item showing its progress.

The classification summary is fixed in the browser to the server's own `404 not_found` answer, the precondition the story's Description names (DEC-0372). The rail's Data health destination and chip are registered by CAP-003-E6-S7, so this plan adds the graph edge CAP-003-E5-S4 → CAP-003-E6-S7.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | Home shows the first download's progress until scores exist | T003, T005, T006 |
| AC-9 | An item leaves the list only when its cause is resolved | T002, T005, T006 |
| AC-16 | The Home chip and the list are the same derivation; the Data health chip counts the problem stocks | T002, T003, T005, T006 |
| AC-21 | Before any download, Home states that no data has been downloaded yet and offers setup | T003, T005, T006 |
| DAC-E5-S4-1 | Stub failing three symbols, download ends `partial`: the data item names the three; the Data health chip reads *3*, named *Data health, 3 stocks with problems*; the Home chip equals the rendered item count | T002, T005, T006 |
| DAC-E5-S4-2 | A later clean download for those symbols: at the next attention read the data item and the Data health chip leave without a reload | T002, T005, T006 |

Mapped test cases (`tests/coverage-matrix.md` lines 265 and 266, and the per-story count "2 of 2" at line 422):

- **TC-INT-025** (`tests/integration/integration-tests.md`; DAC-E5-S4-1) is implemented in T002, part (a).
- **TC-INT-013** (DAC-E5-S4-2) is implemented in T002, part (b).
- The capability-AC rows for AC-7, AC-9, AC-16 and AC-21 list component cases (TC-COMP-127, 141, 142 and others). Those cases belong to CAP-003-E5-S2, E5-S3, E5-S5 and E3-S6, which already plan them, so they are not re-implemented here.
- **TC-E2E-005** (flow 3, the happy path) covers the same journey and is context only. Its precondition ("scores published") and its strategy/paper/live check belong to Phase 6b automation, not this story.
- The test specifications are `status: draft`. The steps below are sharpened against the story's criteria, which govern.

## Phase 1: Setup

**Purpose**: Confirm the inputs. No package, configuration or directory is added.

- [ ] T001 Confirm the hard prerequisites are in the working tree before Phase 2. No file is created or edited. Record the `grep -n` outputs in the TDD cycle's evidence.
  - **CAP-003-E5-S5:**
    - `web/src/app/routes.tsx` has `<Route path="/home"`;
    - `web/src/app/destinations.ts` has the Home entry with `count: "needs-you"`.
  - **CAP-003-E6-S7:**
    - `web/src/app/routes.tsx` has `<Route path="/data"`;
    - `web/src/app/destinations.ts` has `{ group: "data", label: "Data health", to: "/data", count: "problems" }`.
  - **CAP-003-E4-S6:** `web/src/app/routes.tsx` has `<Route path="/setup"`.
  - **CAP-003-E2-S5:** `src/factorflow/api/app.py` has `app.include_router(data_health.router)`.
  - **Reached through those stories:**
    - `web/src/screens/home/index.tsx`, `needs-you-card.tsx`, `data-tile.tsx` and `copy.ts` (CAP-003-E5-S1 to S3);
    - `web/src/app/count-chip.tsx` (CAP-003-E3-S6);
    - `web/src/components/patterns/needs-you.ts` (CAP-003-E1-S8).
  - **Delivered support, unchanged:** `tests/e2e/support/acquisition.ts` exports `ACQUISITION_BASE_URL`, `holdSymbol`, `releaseSymbol`, `withholdSymbol`, `restoreSymbol`, `resetStub`, `resetAcquisitionStore` and `waitForRunState`.
  - Run `npx playwright install` once if the browsers are absent.

**Checkpoint**: Every route, destination and helper named above exists. The acquisition stack starts under `npm run test:e2e`.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the journey spec. The production code it observes is already delivered by the hard dependencies, so its RED evidence comes from the planted production mutants in T005.

### Mandatory Component Tests

- [ ] T002 Create `tests/e2e/home-needs-you.spec.ts` with the file harness and the test `"TC-INT-025, TC-INT-013: a partial download puts a data item on Home and a chip in the rail, and a clean download removes both"`. Put `// Implements TC-INT-025` and `// Implements TC-INT-013` comments at the two halves.
  - **Module doc comment.** It cites:
    - home-ui §2.1 and §7 *Journey*, and capability flow 3;
    - AC-7, AC-9, AC-16, AC-21, DAC-E5-S4-1 and DAC-E5-S4-2;
    - DEC-0216 and DEC-0372;
    - that `/data` is asserted by URL only, because the Data health screen is proven by CAP-003-E6 (backlog review v2 FINDING-2).

    It says the file is a test, not a product contract, as the support modules do.
  - **Harness at file scope:**
    - `test.use({ baseURL: ACQUISITION_BASE_URL })`;
    - `test.beforeEach(resetAcquisitionStore)`;
    - `test.afterEach(resetStub)`, which releases every hold and restores every withheld symbol;
    - `const TERMINAL = ["succeeded", "partial", "failed", "cancelled", "abandoned"]`.
  - **Spec-local helpers.** They use the API for preconditions only (the `support/classification.ts` rule):
    - `followAndDepth(request, symbols)`:
      - `PUT ${ACQUISITION_BASE_URL}/api/settings/history-depth` `{ years: 1 }` answers 200;
      - `POST ${ACQUISITION_BASE_URL}/api/instruments` `{ symbols }` answers 201.
    - `startDownload(request): Promise<string>`: `POST ${ACQUISITION_BASE_URL}/api/acquisition-runs` answers 202, and it returns `run_id`. The API is used rather than `support/acquisition.ts`'s `startRun(page)`, which drives the legacy `/runs` screen that CAP-003-E7 moves.
    - `attention(request)`: `GET ${ACQUISITION_BASE_URL}/api/attention` answers 200, and it returns the JSON.
    - `summaryNotServed(page)`, per DEC-0372:
      - `await page.route("**/api/classifications/summary", async (route) => { const response = await route.fetch({ url: \`${ACQUISITION_BASE_URL}/api/classifications/not-deployed\` }); if (response.status() !== 404) throw new Error(...); await route.fulfill({ response }); })`.
      - The answer is the server's own unmatched-path `404 not_found` envelope (`src/factorflow/api/app.py` `not_found_handler`), so no body is invented.
      - It is called before the first `page.goto`. The delivered precedent for `page.route` in this suite is `tests/e2e/startup-refusal.spec.ts`.
    - Locators:
      - `rail(page)` is `page.getByRole("navigation", { name: "Main" })`;
      - `card(page)` is `page.getByRole("main").getByRole("region", { name: /^Needs you/ })`;
      - `homeLink(page)` is `rail(page).getByRole("link", { name: /^Home/ })`;
      - `dataHealthLink(page)` is `rail(page).getByRole("link", { name: /^Data health/ })`;
      - `chipOf(link)` is `link.locator('[data-variant^="status-"]')`.
    - `itemsNeedYou(n)` is an independent literal of the chip's name rule (owner-shell §2.6, DAC-E3-7): `n === 0 ? "Home" : \`Home, ${n} ${n === 1 ? "item needs" : "items need"} you\``.
  - **(a) TC-INT-025: partial download (DAC-E5-S4-1; AC-16, AC-9).** `test.setTimeout(240_000)`.
    1. **Precondition.**
       - `followAndDepth(request, ["FBXX", "KO", "TSLA", "MSFT"])`.
       - `withholdSymbol` for `FBXX`, `KO` and `TSLA`.
       - `const partialRun = await startDownload(request)`.
       - `expect(await waitForRunState(request, partialRun, TERMINAL, 90_000)).toBe("partial")`.
    2. **Read the contract** (a guard, so a stub fault is not reported as a Home fault). From `attention(request)`:
       - `problems.stock_count` is `3`;
       - `problems.symbols` `toEqual(["FBXX", "KO", "TSLA"])`;
       - `followed_count` is `4`;
       - `latest_terminal_download.state` is `"partial"`;
       - `items.map((i) => i.kind)` `toEqual(["data_problems"])`.
    3. **Open Home.**
       - `await summaryNotServed(page)`, then `await page.goto("/home")`.
       - Then `await page.evaluate(() => { (window as unknown as { homeJourney?: boolean }).homeJourney = true; })`. This marker survives every client-side navigation and is lost on any reload.
    4. **The data item (TC step 2; DAC-E5-S4-1).** Within `card(page)`:
       - `getByText("FBXX, KO and TSLA are missing data", { exact: true })` is visible. This is CAP-003-E5-S1's title rule for three symbols at `stock_count` 3;
       - `getByText("Their scores show as Incomplete until the data is complete.")` is visible;
       - `getByRole("link", { name: "Fix data for FBXX, KO and TSLA", exact: true })` has `href` `/data`;
       - `getByRole("link")` `toHaveCount(1)`. Every rendered item carries exactly one link (DAC-E5-8), so the link count is the rendered item count, and under DEC-0372 it is exactly 1.
    5. **The Data health chip (DAC-E5-S4-1; AC-16).**
       - `dataHealthLink(page)` `toHaveAccessibleName("Data health, 3 stocks with problems")`;
       - `chipOf(dataHealthLink(page))` `toHaveText("3")`.
    6. **The Home chip equals the rendered items (DAC-E5-S4-1; AC-16).**
       - `const rendered = await card(page).getByRole("link").count()`;
       - `homeLink(page)` `toHaveAccessibleName(itemsNeedYou(rendered))`. Read the count after step 4's `toHaveCount(1)` has settled.
       - Separately, the literal `homeLink(page)` `toHaveAccessibleName("Home, 1 item needs you")`, so a mutant shared by the card and the chip cannot cancel out.
    7. **The precondition reached the interface.** `page.getByRole("region", { name: "Data" })` `toContainText("not determinable")`. While the summary is not served the hero count is the `Absent` em dash with hidden *not determinable* (DAC-E5-4; the story's Description).
    8. **Fix data (home-ui §7; the story's Description).**
       - Focus the **Fix data** link and press `Enter`.
       - `expect.poll(() => new URL(page.url()).pathname)` is exactly `"/data"`. Nothing on the Data health screen is asserted.
    9. **Back to Home, the cause still held (AC-9).**
       - `homeLink(page).click()`, then the pathname is `"/home"`.
       - Step 4's link and step 5's name still hold. Navigating away resolves nothing.
  - **(b) TC-INT-013: a clean later download (DAC-E5-S4-2; AC-9, AC-16).**
    1. `restoreSymbol` for `FBXX`, `KO` and `TSLA`.
    2. Register the read before starting the download:

       ```ts
       const nextRead = page.waitForResponse(
         async (r) =>
           r.url().endsWith("/api/attention") &&
           r.request().method() === "GET" &&
           r.ok() &&
           (await r.json()).latest_download?.run_id === cleanRun &&
           TERMINAL.includes((await r.json()).latest_download.state),
         { timeout: 90_000 },
       );
       ```

       `cleanRun` is assigned from `startDownload(request)` immediately before this line. The wait covers the shell's 60 s idle cadence plus margin (owner-shell §2.4).
    3. `expect(await waitForRunState(request, cleanRun, TERMINAL, 90_000)).toBe("succeeded")`. From `attention(request)`, `problems.stock_count` is `0` (the guard).
    4. `const read = await nextRead`, and `(await read.json()).problems.stock_count` is `0`. This is the next attention read the browser received, not the spec's own request. Then, with the default expect timeout and no `goto` or `reload`:
       - `card(page).getByRole("link", { name: /^Fix data/ })` `toHaveCount(0)`;
       - `card(page)` `toContainText("Nothing needs you right now.")`;
       - `dataHealthLink(page)` `toHaveAccessibleName("Data health")`, and `chipOf(dataHealthLink(page))` `toHaveCount(0)`;
       - `homeLink(page)` `toHaveAccessibleName(itemsNeedYou(0))`, which is `"Home"`, with `chipOf(homeLink(page))` `toHaveCount(0)` (AC-16).
    5. **No reload.** `await page.evaluate(() => (window as unknown as { homeJourney?: boolean }).homeJourney)` is `true`.
  - **Kills** (hand-written production mutants, run in T005):
    - swap-case `count: "problems"` → `"needs-you"` on the Data health entry in `destinations.ts`: (a) step 5, where the name reads `Data health, 1 item…`;
    - remove-attribute on the Data health `DESTINATIONS` entry: (a) step 5, with no link;
    - a hand-written `count-chip.tsx` reading `attention.items.length` for `"problems"`: (a) step 5, which reads 1 and not 3;
    - swap-case on the `data_problems` target in `needs-you.ts` (`"/data"` → `"/settings"`): (a) steps 4 and 8;
    - a hand-written `copy.ts` title joining with `", "` only (`"FBXX, KO, TSLA are missing data"`): (a) step 4;
    - a hand-written `IDLE_INTERVAL_MS = 600_000` in `shell-context.tsx`: (b) step 2 times out. The read never arrives without a reload;
    - a hand-written `needs-you-card.tsx` that drops an item when its action is activated, rather than when its cause leaves: (a) step 9.
- [ ] T003 Add the test `"Home before and at the first download: the honest empty state, Start setup, and the first download's progress"` to `tests/e2e/home-needs-you.spec.ts` (AC-21, AC-7; the assertions CAP-003-E4-S5 deferred to this story). `test.setTimeout(90_000)`.
  1. **No download (AC-21; DAC-E5-1).**
     - `await summaryNotServed(page)`, then `page.goto("/home")`. The store is empty after `beforeEach`.
     - `const empty = page.getByRole("main").getByRole("region", { name: "No data has been downloaded yet." })` is visible.
     - It contains `"Set up FactorFlow to name the stocks to follow and start the first download."`.
     - Its `getByRole("link", { name: "Start setup", exact: true })` has `href` `/setup`.
     - `page.getByRole("region", { name: "Data" })` and `card(page)` each `toHaveCount(0)`.
  2. **Start setup (CAP-003-E4-S6's route).** Focus **Start setup** and press `Enter`. The pathname is exactly `"/setup"`, and `page.getByRole("main").getByRole("heading", { name: "There's no page at this address." })` `toHaveCount(0)`.
  3. **Start the first download, held (AC-7).**
     - `followAndDepth(request, ["HMA"])`, then `holdSymbol("HMA")`.
     - `const firstRun = await startDownload(request)`.
     - `waitForRunState(request, firstRun, ["running"], 20_000)`.
     - `expect.poll` on `attention(request)` until `latest_download.progress.total` is `1` and `latest_terminal_download` is `null`. The total is null until the run names its instruments (DEC-0213 f).
  4. **`/` lands on Home with the first-download item (DEC-0216; AC-7).**
     - `page.goto("/")`; the pathname reaches exactly `"/home"`.
     - Within `card(page)`:
       - `getByText("Your first download is running", { exact: true })` is visible;
       - `getByText("0 of 1 stock so far. Scores appear when it finishes.")` is visible. `HMA` is held, so `done` stays 0, and the singular follows the count (DAC-E5-7);
       - `getByRole("link", { name: "See your first download", exact: true })` has `href` `` `/data/downloads/${firstRun}` ``;
       - `getByRole("link")` `toHaveCount(1)`.
     - `homeLink(page)` `toHaveAccessibleName("Home, 1 item needs you")`. The server lists no item here, so the chip counts the derived `first_download` (AC-16).
  5. **Leave nothing running.** `releaseSymbol("HMA")`, then `waitForRunState(request, firstRun, TERMINAL, 30_000)`. This is the acquisition-spec convention in `support/acquisition.ts`.
  - **Kills** (hand-written production mutants, run in T005):
    - a hand-written `count-chip.tsx` computing `attention.items.length` for `"needs-you"`: step 4, where the name reads `Home` because there are 0 server items;
    - negate-boolean on `latest_terminal_download === null` in `deriveNeedsYou`'s `404` branch: step 4, with no item;
    - a hand-written `needs-you-card.tsx` listing `attention.items` instead of the derivation: step 4;
    - negate-boolean on `total === 1` in `ITEMS.first_download.body`: step 4 reads *0 of 1 stocks*;
    - swap-case on **Start setup**'s `to` (`"/setup"` → `"/home"`): step 2;
    - negate-boolean on `HomeScreen`'s `latest_download === null` empty-state test: step 1.

### Additional Unit Tests

None. The story adds no production code, so it has no internal function to unit-test. Every implementation-level case belongs to the producing stories' plans.

**Checkpoint**: Both tests are written and type-check. Against the delivered tree they pass. Against each planted mutant in T005, the named step fails.

---

## Phase 3: Core Implementation

**Purpose**: None. This story adds no production code (story Data Changes and API Contract: none), so it has no phase-3 task.

**Checkpoint**: `git diff --exit-code -- web/src src` exits 0.

---

## Phase 4: Integration

**Purpose**: Run the journey on the real stack and prove that it can fail.

- [ ] T004 Run the spec on the real stack: `npm run test:e2e -- tests/e2e/home-needs-you.spec.ts` (depends on T002, T003).
  - It needs a container runtime. The Bash sandbox blocks Docker, so it may need the sandbox disabled.
  - Both tests must pass. Run it three times in a row, because it holds and withholds stub symbols and shares the acquisition database with other specs.
  - A missing container runtime is reported as an exclusion, never as a partial green.
  - If a failure implicates production code (the card, the tile, the rail, the chip, the derivation or the reader), do not edit it. Stop and report the failing assertion and the story that owns the file.
- [ ] T005 Run the hand-written production mutants of T002 and T003, one at a time, with `python3 scripts/mutation-run.py run --jobs 1 --command "npm run test:e2e -- tests/e2e/home-needs-you.spec.ts"` (depends on T004).
  - The stack binds fixed ports and one container name, so mutants cannot run in parallel.
  - If the runner cannot start the stack, plant each mutant by hand in the working tree, run the spec, record `killed` or `survived` with the failing assertion, and revert.
  - After the last mutant, `git diff --exit-code -- web/src src` exits 0.
  - Every mutant must be killed. A survivor means the spec is too weak: strengthen it and rerun.

**Checkpoint**: The spec passes three times, and every listed mutant is killed.

---

## Phase 5: Polish

**Purpose**: Validation, scope and the TDD evidence.

- [ ] T006 Run the validation commands and confirm scope (depends on T005).
  - Run `npm run format`, which is a check. Fix only this spec with `npx biome format --write tests/e2e/home-needs-you.spec.ts`. Then run `npm run lint`, `npx tsc --noEmit` and `npx tsc --noEmit -p tsconfig.e2e.json`.
  - `biome.json`'s `files.include` does not reach `tests/e2e`. Match the delivered specs' style by hand (double quotes, semicolons, width 100), and report that exclusion rather than calling the spec linted.
  - `git status --short` lists only `tests/e2e/home-needs-you.spec.ts`, plus this story's `-tasks.md`, `-tdd-evidence.yaml` and status line.
  - `git diff --exit-code -- tests/e2e/support web/src src` exits 0.
- [ ] T007 After each TDD cycle in T002–T006 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Append the cycle to `CAP-003-E5-S4-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence;
    - the structured `mutation:` block `scripts/mutation-run.py summary` prints, which is the T005 kill table;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so the cycle records `commit_hash: stage`, and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  There is one cycle: T002 + T003 + T004 + T005, the journey spec. Its RED evidence is the T005 kill table, because the code it observes already exists. T006 adds no behaviour and joins this cycle's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and the one cycle is recorded in the TDD evidence.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E5-S5 | hard | `/home` registered and the Home destination with its chip. T002 and T003 open `/home` and read the Home link. In the graph |
| CAP-003-E2-S5 | hard | `GET /api/attention` served on the acquisition stack. T002 steps 2 and (b) 2 read it. In the graph |
| CAP-003-E4-S6 | hard | `/setup` registered. T003 step 2 lands on it. In the graph |
| CAP-003-E6-S7 | hard | **New graph edge.** DAC-E5-S4-1 and DAC-E5-S4-2 assert the rail's Data health link and its chip. That `DESTINATIONS` entry (`count: "problems"`) and the `/data` route are created only by CAP-003-E6-S7 (its plan's Summary), so T002 steps 5, 8 and (b) 4 cannot pass before it. This is backlog review v4 FINDING-1, the register's G8 |
| CAP-003-E5-S1 | context | `copy.ts` gives the literals T002 and T003 match. Reached through E5-S5 → E5-S3 → E5-S1 |
| CAP-003-E5-S2 | context | The tile, region *Data*, whose *not determinable* T002 (a) 7 reads. Reached through E5-S5 → E5-S3 → E5-S2 |
| CAP-003-E5-S3 | context | `HomeScreen`, the *Needs you* card and the empty-state card. Reached through E5-S5 |
| CAP-003-E3-S6 | context | The rail `navigation` *Main* and `count-chip.tsx`'s names. Reached through E5-S5 and E6-S7 |
| CAP-003-E1-S8 | context | `deriveNeedsYou`, the derivation both the card and the Home chip read (DEC-0216's `404` branch). The spec does not import it. Reached through E5-S5 → E5-S3 |
| CAP-003-E3-S1 | context | `fetchScoreSummary` maps the `404 not_found` envelope to `not_served`, which DEC-0372 relies on. Reached through E5-S5 → E5-S3 |
| CAP-003-E3-S3 | context | `shell-context.tsx`'s attention cadence (60 s idle, 10 s while a download runs) sets T002 (b)'s 90 s wait and hosts the `IDLE_INTERVAL_MS` mutant. Reached through E5-S5 → E5-S3 |
| CAP-003-E2-S6 | context | Its plan records that `PROBLEM_COUNT_SQL` counts `last_outcome IN ('failed', 'not_found')`, which explains why withheld statements make problem stocks and a clean run clears them. No file is imported or edited |
| CAP-003-E4-S5 | context | Its Description defers Home's empty-state and first-download assertions to this story, which T003 carries. No file is shared |
| CAP-003-E6-S6 | context | The Data health journey drives the same kind of partial download in its own spec file. No file is shared, and neither depends on the other |
| CAP-003-E7-S7 | context | It fixes the delivered specs that assert legacy URLs. This is why the Validation Plan runs only this spec, and why T002 starts downloads through the API rather than `/runs` |

Graph change: `CAP-003-E5-S4: [CAP-003-E5-S5, CAP-003-E2-S5, CAP-003-E4-S6, CAP-003-E6-S7]`. CAP-003-E6-S7's own edges (E6-S5, E3-S4, E3-S6, E3-S8, E2-S5) never reach E5-S4, so the graph stays acyclic.

### Task Dependencies

- T001 comes first.
- T002 creates the file and its harness. T003 adds the second test to the same file, so it depends on T002.
- T004 depends on T002 and T003.
- T005 depends on T004.
- T006 depends on T005.
- T007 is interleaved: it runs after the cycle, before hand-off.

### Parallel Opportunities

- None beyond writing T002 and T003's bodies. The real-stack runs are serial (`workers: 1`, fixed ports).

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build` (driven by the e2e server script; no production change).
- Test: `npm run test:e2e -- tests/e2e/home-needs-you.spec.ts`. Do not gate on the whole suite: delivered specs that assert legacy URLs are red until CAP-003-E7-S7, and that red is reported, not fixed here.
- Lint: `npm run lint`.
- Format: `npm run format` (a check, no modification).
- Type check: `npx tsc --noEmit`, plus `npx tsc --noEmit -p tsconfig.e2e.json` for the spec. The second is not in tech-stack, which covers `web/src` only.

### Story-Specific Validation

- **DAC-E5-S4-1, AC-16:** T002 (a) steps 4–6 pass three times, with the Data health name exactly *Data health, 3 stocks with problems* and the Home name equal to `itemsNeedYou(rendered)` and to the literal.
- **DAC-E5-S4-2, AC-9:** T002 (b) passes: the browser's next attention read after the clean download is followed by the item and both chips leaving, with the `homeJourney` marker still `true`. T002 (a) step 9 shows that navigating away removes nothing.
- **AC-21:** T003 steps 1–2 pass.
- **AC-7:** T003 step 4 passes with *0 of 1 stock so far.*
- **Mutation:** every T005 mutant is killed.
- **Scope:** `grep -n "page.reload\|waitForTimeout" tests/e2e/home-needs-you.spec.ts` prints nothing. The spec never reloads (DAC-E5-S4-2) and never sleeps blindly. Neither token appears in any comment the plan requires.

---

## Notes

### Resolved Conflicts

1. **The summary precondition.**
   - **The conflict.** The story's Description says `GET /api/classifications/summary` "answers `404` in this clone (CAP-002 not merged)". It does not. CAP-002 is merged: the route is at `src/factorflow/api/routes/classifications.py:192`, and system design OQ-2 is answered "CAP-002 lands first". On the acquisition stack the summary is served.
   - **Governing: the story's acceptance criteria and capability §6 assumption 2 over the Description's factual premise** (register C7; backlog review v4 FINDING-2). DAC-E5-S4-1 and DAC-E5-S4-2 do not depend on the summary's state. Only the Description fixes it, and its purpose is a deterministic precondition.
   - **Outcome.** The spec establishes the Description's precondition itself, rather than assuming a clone state. How it does so is Open Gap 1.
2. **"Fix data opens Data health" against "asserts the URL".**
   - **The conflict.** home-ui §7 says **Fix data** "opens Data health". The story's Description says the spec asserts the URL.
   - **Governing: the story over the design's test table** (backlog review v2 FINDING-2; register C10).
   - **Outcome.** T002 (a) step 8 asserts the pathname `/data` only. Data health's content is CAP-003-E6-S6's to prove, even though the CAP-003-E6-S7 edge now makes the screen present.
3. **The Data health chip's producer.**
   - **The conflict.** The story's Dependencies list CAP-003-E5-S5, E2-S5 and E4-S6. Its criteria assert the Data health chip, which only CAP-003-E6-S7 registers.
   - **Governing: the story's acceptance criteria.** The skill's dependency rule makes an omitted producer a hard edge.
   - **Outcome.** The edge is added to `dependencies.yaml`. The story is not edited.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0372.**
   - **What is undetermined.** The story's Description fixes the summary at `404`. On this clone the server serves it, and no artifact says how an e2e spec should hold the summary in a known state. Backlog review v4 FINDING-2 says only "stubbed or seeded".
   - **What the plan adopts (T002, T003).** The browser's `GET /api/classifications/summary` is answered with the acquisition server's own `404 not_found` envelope. The helper fetches an unmatched `/api/classifications/not-deployed` path from that server through `page.route`. It throws if that answer is ever not `404`.
     - The shell's `fetchScoreSummary` maps the envelope to `not_served` (CAP-003-E3-S1's plan, Resolved Conflict 2).
     - So the tile's hero count is not determinable, and the first-download item follows DEC-0216's `404` branch, exactly as the Description states.
     - Every other request, including `GET /api/attention`, reaches the real stack.
   - **Derivation.**
     - It reproduces the Description's precondition literally.
     - It makes the item set deterministic: `first_scores` and `score_failed` need a served summary (DEC-0216), so the classification build the scheduler starts after the partial download cannot add or remove an item between reads. That is what lets T002 assert the literal *Home, 1 item needs you*.
     - The answer is the server's own envelope, so no body is invented.
     - The delivered suite already intercepts API calls in `startup-refusal.spec.ts`.
   - **Alternatives rejected.**
     - Reading the served summary and waiting for the classification build: the build's outcome on a four-stock store is not fixed by any artifact (the delivered CAP-002 specs guard builds with `skipUnlessLineItemsResolved`), so the item set would vary.
     - Seeding a summary state by SQL: it couples the spec to CAP-002's tables.
     - A hand-written 404 body: it invents an envelope.
   - **Klass.** Contained: it lives in this spec only.
   - **Owning design to absorb it:** home-ui §7 (the *Journey* row's precondition), with integration-tests TC-INT-025 and TC-INT-013, at their next revision.

### Other Notes

- **Fixture symbols.** `FBXX`, `KO` and `TSLA` are the story's three, and `MSFT` is one healthy stock, so the run ends `partial` with `followed_count` 4. `HMA` is T003's single held stock. None has the stub's special prefixes (`UNK`, `NOF`, `NEW`).
- **Symbol order.** `problems.symbols` is served "first three by symbol" (reader 2.2), so the title and the action name read *FBXX, KO and TSLA*. DAC-E5-8's example *KO, TSLA and FBXX* is the same rule over a fixture in a different order (register, CAP-003-E5-S3 symbol-order note).
- **Why the problem stocks clear.** A withheld symbol's statements answer 503, so its fundamentals are recorded `failed`, and `PROBLEM_COUNT_SQL` counts `last_outcome IN ('failed', 'not_found')` (CAP-003-E2-S6's plan). After `restoreSymbol`, the clean run records them written, and the next attention read has `stock_count` 0.
- **The next read's timeout.** The shell polls attention every 60 s while no download runs, and every 10 s while one does (owner-shell §2.4; CAP-003-E3-S3). The clean download may finish before the shell sees it running, so the 90 s wait covers one idle interval plus the run. This is derived from pinned cadences, not a new value.
- **"Without a reload."** No step calls `goto` or `reload` between T002 (a) step 3 and the end. All navigation is by link, and the `homeJourney` window marker proves the document was never reloaded.
- **Hand-written mutants** for T005. Each is planted in a producing story's file only for the run, and reverted:
  - `web/src/app/destinations.ts`: `count: "problems"` → `count: "needs-you"` (Data health entry), killed by T002 (a) 5.
  - `web/src/app/destinations.ts`: the Data health entry deleted, killed by T002 (a) 5.
  - `web/src/app/count-chip.tsx`: the `"problems"` count `attention.problems.stock_count` → `attention.items.length`, killed by T002 (a) 5.
  - `web/src/app/count-chip.tsx`: `deriveNeedsYou(attention, scores).length` → `attention.items.length`, killed by T003 step 4. It is equivalent in T002 (a), where the server and derived lists are both one `data_problems`.
  - `web/src/components/patterns/needs-you.ts`: the `data_problems` target `"/data"` → `"/settings"`, killed by T002 (a) 4 and 8.
  - `web/src/components/patterns/needs-you.ts`: `latest_terminal_download === null` → `!== null` in the `404` branch, killed by T003 step 4.
  - `web/src/screens/home/copy.ts`: the two-or-three `listOf(symbols)` title → `symbols.join(", ")`, killed by T002 (a) 4.
  - `web/src/screens/home/copy.ts`: `total === 1 ? "stock" : "stocks"` → `total !== 1 ? "stock" : "stocks"`, killed by T003 step 4.
  - `web/src/screens/home/needs-you-card.tsx`: the derived list → `attention.data.items`, killed by T003 step 4.
  - `web/src/screens/home/index.tsx`: the empty-state test `latest_download === null` → `!== null`, killed by T003 step 1.
  - `web/src/app/shell-context.tsx`: `IDLE_INTERVAL_MS = 60_000` → `600_000`, killed by T002 (b) 2.
- **No production edit.** If any assertion here cannot be met by the delivered producers, the fix belongs to the producing story. Report it; never weaken the spec.
