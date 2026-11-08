---
artifact_schema_version: 1
artifact_id: CAP-003-E4-S5-tasks
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
  timestamp: 2026-11-07T07:19:53Z
  source_artifacts:
    - id: CAP-003-E4-S5
      version: "1"
    - id: CAP-003-E4
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-integration-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E4-S5 — First-Run Journey End to End: Setup by Keyboard, Start Download, Add Later and Return

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/first-run-setup/stories/CAP-003-E4-S5.md`
**Component**: `FactorFlow-v2` (Playwright end-to-end spec, `tests/e2e/`; design `setup-ui` §7)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

A `type: chore` story that writes one new Playwright spec, `tests/e2e/setup-first-run.spec.ts` (setup-ui §2.1 and §7, rows *First run* and *Add later*). It proves the first run against the running product on the acquisition stack (`ACQUISITION_BASE_URL`, its ingestion runner and the Massive stub), which `resetAcquisitionStore()` empties before each test. It has three tests:

- **TC-INT-008** (DAC-E4-S5-1): an empty install opens setup, all four steps are walked by keyboard alone, **Start download** is answered `202`, the progress region shows *{done} of {total} stocks* and a *checked {time}* that advances on the next attention answer, and `/` then lands on `/home`.
- **TC-INT-004** (DAC-E4-S5-2): *Add later* and **Continue** reach step 4 blocked, **Go to Home** lands on `/home`, and after going back to `/setup` within the session the radio choice and the years text are as left; `/` still lands on `/setup`.
- **The story Description's last leg** (TC-INT-004's edge case): from the blocked step 4, **Manage followed stocks** opens `/data/followed`, a stock is followed there, and on return step 4 is ready; `/` keeps landing on `/setup` until **Start download** is answered, and lands on `/home` after it.

Home's content (its empty state, the first-download item) is not asserted: it belongs to CAP-003-E5-S4 (backlog review v2 FINDING-2). The spec asserts the `/home` URL only. No production file changes: the behaviour under test was built by CAP-003-E4-S1 to S4 and CAP-003-E4-S6. As in CAP-003-E3-S8, the spec's strength is shown by hand-written production mutants that each turn it red.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-2 | Starting the first download from setup makes `/` open on Home from then on; until then `/` keeps opening setup | T003, T004, T005, T007 |
| AC-3 | Going back keeps every value entered in later steps | T004, T007 |
| AC-7 | The owner can start the first download from setup | T003, T005, T007 |
| AC-21 | After *Add later*, setup lets the owner leave with no download started | T004, T005, T007 |
| AC-25 | Every setup operation is completable by keyboard | T002, T003, T004, T005, T007 |
| DAC-E4-S5-1 | Real stack with the Massive stub; four steps by keyboard alone; `POST /api/acquisition-runs` accepted; *checked {time}* advancing | T003, T006, T007 |
| DAC-E4-S5-2 | After *Add later*, **Go to Home**, return to `/setup`: years text and radio choice as left; `/` still lands on `/setup` | T004, T005, T006, T007 |

Mapped test cases (`tests/integration/integration-tests.md`; `tests/coverage-matrix.md` lines 234–235 and the per-story count "2 of 2" at line 416):

- **TC-INT-008** (DAC-E4-S5-1; AC-2, AC-7, AC-25): T003.
- **TC-INT-004** (DAC-E4-S5-2; AC-2, AC-3, AC-21): T004, with its *Error / Edge Cases* line in T005.

The coverage matrix places both in the integration tier (coverage note 2), and the story writes them into the Playwright spec. TC-E2E-001, TC-E2E-002, TC-INT-005 to TC-INT-007 and TC-INT-009 trace to no E4-S5 criterion; they belong to `$automation-planning` (Phase 6b).

## Phase 1: Setup

**Purpose**: Confirm the inputs. No package, configuration, fixture or directory is added.

- [ ] T001 Confirm the hard prerequisites are in the working tree before Phase 2. No file is created or edited by this task. Record the `grep -n` outputs in the first TDD cycle's evidence.
  - CAP-003-E4-S6: `web/src/app/routes.tsx` registers `<Route path="/setup" …>`, and `web/src/app/shell.tsx` mounts `SetupDraftProvider` inside `ShellProvider` around `<Frame />`.
  - CAP-003-E3-S4: `routes.tsx` registers `/data/followed` (the delivered `InstrumentsScreen`) and `RootRedirect` sends `/` to `/setup` when `most_recent_run` is `null` and to `/home` otherwise.
  - CAP-003-E2-S5: `src/factorflow/api/app.py` includes `data_health.router`, so the acquisition stack serves `GET /api/attention`.
  - Reached through CAP-003-E4-S6's graph line (nothing imported), the modules of CAP-003-E4-S1, CAP-003-E4-S2, CAP-003-E4-S3 and CAP-003-E4-S4: `web/src/screens/setup/index.tsx` (`SetupScreen`), `step-list.tsx`, `step-card.tsx`, `step-history-depth.tsx`, `step-stocks.tsx`, `step-download.tsx` and `copy.ts`. Confirm in `copy.ts` the strings the spec matches as independent literals: *Get set up*, *Connect market data*, *How far back should history go?*, *Which stocks do you want to follow?*, *Download data for {n} stocks*, *Paste a list*, *Add later*, *Start download*, *checked {time}*, *You can leave; this keeps running.*, *No stocks are followed. Follow stocks before downloading.*, *Go to Home*, *Manage followed stocks*, *Continue*, *← Back: How far back*. If one differs, stop and report it: the sibling's code and its plan disagree, and that is the sibling's rework, not this spec's.
  - Delivered, unchanged: `tests/e2e/support/acquisition.ts` exports `ACQUISITION_BASE_URL`, `resetAcquisitionStore`, `resetStub`, `holdSymbol`, `releaseSymbol` and `waitForRunState`; `web/src/screens/instruments/index.tsx` renders `AddField` (the single-symbol field, submitted by Enter) before `BulkAdd`.
  - Run `npm run test` and record the baseline as green.

**Checkpoint**: Every listed module exists with the named exports and strings, and the Vitest suite is green before this story's first edit.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the spec. This story adds no production code, so the spec is expected to pass against CAP-003-E4-S1 to S4 and CAP-003-E4-S6 on its first run. Its strength is shown by the hand-written production mutants in T007, each of which must turn it red.

**Shared conventions** (defined in the spec itself, as the delivered specs define their own helpers; no new support module):

- **Stack.** At file level `test.use({ baseURL: ACQUISITION_BASE_URL })`, `test.beforeEach(resetAcquisitionStore)` and `test.afterEach(resetStub)`, imported from `./support/acquisition`. This is the delivered empty-install reset `first-run.spec.ts` and `cancel-in-progress.spec.ts` use: `resetAcquisitionStore()` truncates the acquisition database through `database.ts`'s `sql()` and resets `massive_stub.py`. `resetStub()` in `afterEach` releases any held symbol, so a held symbol never outlives its test.
- **Precondition guard**, first in each test: `GET /api/health` through the `request` fixture answers `most_recent_run: null` and `credential_present: true` (the acquisition stack exports `FACTORFLOW_MASSIVE_API_KEY`, `scripts/run-e2e-server.sh`).
- **Locators.**
  - `stepCard(page, question: string | RegExp)` is `page.getByRole("region", { name: question })`, the step card's `section` labelled by its `h2` (CAP-003-E4-S2's `StepCard`).
  - `stepList(page)` is `page.getByRole("navigation", { name: "Setup steps" })`.
  - `pathname(page)` is `new URL(page.url()).pathname`, asserted exactly with `expect.poll`.
- **Keyboard only.** Each owner step is `page.keyboard.press` or `page.keyboard.type`. No owner step uses `click`, `fill`, `check`, `focus` or `selectOption`. `page.goto` stands for the owner typing a URL; `page.goBack` for the browser's Back.
  - `tabTo(page, locator, max = 40)` first checks whether `locator` is focused (`await locator.evaluate((el) => el === document.activeElement)`), and otherwise presses `Tab` and checks again, up to `max` presses. It fails naming the locator after `max`. It is the convention CAP-003-E3-S8's specs define for themselves.
  - `chooseRadio(page, group, name, max = 5)`: `tabTo` the group's first `radio`, the roving tab stop while none is checked, then press `ArrowDown` until `group.getByRole("radio", { name })` is focused, then `Space`. Expect that radio `toBeChecked()`. Arrow keys and Space are the WAI-ARIA radio-group keys CAP-003-E1-S2's `radio-group` provides.
- **Responses.** Each request the spec waits for is captured with `page.waitForResponse` registered before the key press that sends it, matched on `response.url()` ending with the path and `response.request().method()`.
- **Terminal states.** `const TERMINAL = ["succeeded", "partial", "failed", "cancelled", "abandoned"]`, the five outcomes of the delivered `RunState` (`web/src/api/types.ts`). A test that starts a download ends with `waitForRunState(request, runId, TERMINAL, 30_000)`, so no download is left non-terminal (the `acquisition.ts` convention).
- **Symbols.** `SFA`, `SFB` and `SLA`: shape-valid, not starting `NOF`, so the stub serves full data for them (`massive_stub.py`).
- **Header comment.** The spec's doc comment cites setup-ui §7, AC-2, AC-3, AC-7, AC-21, AC-25, DAC-E4-S5-1, DAC-E4-S5-2, DEC-0227 (*an e2e spec asserts only routes registered at its story*) and backlog review v2 FINDING-2 (Home's content is CAP-003-E5-S4's).

### Mandatory Component Tests

- [ ] T002 Create `tests/e2e/setup-first-run.spec.ts` with the file-level stack, the helpers and the header comment of the shared conventions above, and no test yet. `npx tsc --noEmit -p tsconfig.e2e.json` is green. Traces to AC-25 (the keyboard helpers). No mutant is targeted here; T003 to T005 carry the kills.
- [ ] T003 Implement TC-INT-008 (*First run by keyboard: download accepted and progress advances*) in `tests/e2e/setup-first-run.spec.ts` (depends on T002), as `test("TC-INT-008: an empty install walks the four steps by keyboard, starts the first download and sees its progress advance", …)` with a `// Implements TC-INT-008` comment. `test.setTimeout(90_000)`.
  - **Arrange.** The guard, then `await holdSymbol("SFB")`, so the download stays in progress after `SFA` is written (the runner works the roster in symbol order, as `cancel-in-progress.spec.ts` relies on).
  - **Entry (AC-2).** `page.goto("/")`; `pathname` becomes exactly `/setup`; `getByRole("heading", { level: 1, name: "Get set up" })` is visible. `stepCard(page, "How far back should history go?")` is visible: step 1 is done once health has answered (CAP-003-E4-S1's derivation of DAC-E4-1), so step 2 is current.
  - **Step 1 by keyboard.** `tabTo(stepList(page).getByRole("link", { name: "Market data, done" }))`, `Enter`. `stepCard(page, "Connect market data")` is visible and holds the exact text *Found*. `tabTo` its `button` *Continue*, `Enter`.
  - **Step 2 by keyboard.** `tabTo(getByRole("spinbutton", { name: "History depth years" }))`, `keyboard.type("1")`. Register the `PUT /api/settings/history-depth` wait, `tabTo` *Continue*, `Enter`. The response status is `200` and its request body is exactly `{ years: 1 }` (`postDataJSON()`).
  - **Step 3 by keyboard.** `stepCard(page, "Which stocks do you want to follow?")` is visible. `chooseRadio(page, getByRole("radiogroup", { name: "How do you want to name them?" }), "Paste a list")`. `tabTo(getByRole("textbox", { name: "Stock symbols" }))`, `keyboard.type("SFA, SFB")`, `Tab` (the blur parses). The text *2 symbols recognised, 0 duplicates, 0 not recognised* is visible. Register the `POST /api/instruments` wait, `tabTo` *Continue*, `Enter`. The status is `201` and the request body is exactly `{ symbols: ["SFA", "SFB"] }`.
  - **Step 4 by keyboard (AC-7).** `stepCard(page, "Download data for 2 stocks")` is visible. Register the `POST /api/acquisition-runs` wait and an attention counter (`page.on("response")` counting `GET /api/attention` answers with status `200` from this point on). `tabTo(getByRole("button", { name: "Start download" }))`, `Enter`. The status is `202`; keep `runId = (await response.json()).run_id`.
  - **Progress (DAC-E4-S5-1).**
    - `const checked = page.getByText(/^checked \d{2}:\d{2}:\d{2} C[DS]T$/)` is visible within `5_000` ms of the `202`. Keep its text as `first`.
    - `getByRole("progressbar", { name: /^\d+ of 2 stocks$/ })` is visible within `20_000` ms, and the text *You can leave; this keeps running.* is visible.
    - `await expect.poll(() => checked.textContent(), { timeout: 25_000 }).not.toBe(first)`: the time advanced on a later attention answer. The cadence is 10 s while the download is `requested`, `running` or `cancelling` (owner-shell §2.4); 25 s covers two ticks plus a response.
    - The attention counter is at least 2: the refresh setup asks for after the `202` and at least one cadence answer (TC-INT-008 step 3, *over two attention ticks*).
  - **Afterwards (AC-2).** `page.goto("/")`; `pathname` becomes exactly `/home`. Nothing is asserted about Home's content.
  - **Cleanup.** `await releaseSymbol("SFB")`, then `waitForRunState(request, runId, TERMINAL, 30_000)`.

  Kills:
  - remove-attribute of the `refresh("attention")` call after a `202` in `web/src/screens/setup/step-download.tsx`: the *checked* line does not appear within 5 s. Before the start `latest_download` was `null`, so the shell's cadence is 60 s, and step 4 shows only its pending *Queued* view until attention names the new download (CAP-003-E4-S4's DEC-0356).
  - swap-case of `RootRedirect`'s targets (`"/setup"` ↔ `"/home"`) in `web/src/app/routes.tsx`: the entry and the afterwards check. The expected paths are independent literals.
  - negate-boolean on the step 1 done flag (`lastAnsweredAt !== null` → `=== null`) in `web/src/screens/setup/use-setup-state.ts`: step 2 is not current on entry, and no *Market data, done* link exists.
  - a hand-written mutant that renders the progress region only when `attention.kind === "loading"`: no progressbar and no *checked* line.
- [ ] T004 Implement TC-INT-004 (*Add later, Go to Home, return: drafts kept and / still opens setup*) in `tests/e2e/setup-first-run.spec.ts` (depends on T003, same file), as `test("TC-INT-004: after Add later the owner leaves for Home, comes back with the drafts kept, and / still opens setup", …)` with a `// Implements TC-INT-004` comment. `test.setTimeout(60_000)`.
  - **Arrange.** The guard. Record every request the page sends (`page.on("request")`, method and pathname).
  - **To step 4 blocked (AC-21).**
    - `page.goto("/")`; `pathname` is `/setup`.
    - Step 2: `tabTo` the spinbutton *History depth years*, `keyboard.type("3")`, register the `PUT` wait, `tabTo` *Continue*, `Enter`; the status is `200`.
    - Step 3: `chooseRadio(…, "Add later")`; `tabTo` *Continue*, `Enter`.
    - `stepCard(page, /^Download data/)` is visible. `getByRole("button", { name: "Start download" })` has `aria-disabled="true"`, is not `toBeDisabled()` and `toHaveAccessibleDescription("No stocks are followed. Follow stocks before downloading.")` (DAC-E4-8). `stepList(page)` holds no link named *Stocks to follow, done*.
  - **Go to Home.** `tabTo(getByRole("link", { name: "Go to Home" }))`, `Enter`. `pathname` becomes exactly `/home`. Nothing is asserted about the content there: `/home` may not be registered at this story, since CAP-003-E5-S5 registers it (DEC-0227), and Home's content is CAP-003-E5-S4's.
  - **Return within the session (AC-3, DAC-E4-S5-2).** `page.goBack()`; `pathname` becomes exactly `/setup`.
    - `stepCard(page, "Which stocks do you want to follow?")` is visible: the steps are re-derived on return, and step 3 is the first not done (DAC-E4-1; Resolved Conflict 3).
    - The radio choice is as left: `getByRole("radio", { name: "Add later" })` is checked and *Paste a list* is not.
    - The years text is as left: `tabTo(getByRole("button", { name: "← Back: How far back" }))`, `Enter`; the spinbutton *History depth years* has value `"3"`.
  - **`/` still lands on `/setup` (AC-2).** `page.goto("/")`; `pathname` becomes exactly `/setup`.
    - **Non-vacuity.** The reload mounted a fresh `SetupDraftProvider` (setup-ui §3: *a reload … loses unsaved drafts*). `stepCard(page, "Which stocks do you want to follow?")` is visible and neither radio is checked. So the checked *Add later* above came from the provider kept across the route change, not from a default or a saved value.
  - **Nothing was requested (AC-21).** The recorded requests hold no `POST /api/instruments` and no `POST /api/acquisition-runs`, and `GET /api/health` answers `most_recent_run: null`.

  Kills:
  - a hand-written mutant that keys the provider on the pathname in `web/src/app/shell.tsx` (`<SetupDraftProvider key={useLocation().pathname}>`, CAP-003-E4-S6's mutant): *Add later* is not checked on return.
  - a hand-written mutant that keeps `goTo`'s override in `SetupDraftProvider` instead of the hook (CAP-003-E4-S1's mutant): step 4 stays current on return and the step 3 card is absent.
  - swap-case of **Go to Home**'s target (`to="/home"` → `to="/"`) in `step-download.tsx`: the pathname reads `/setup`, not `/home`.
  - negate-boolean on `blocked` (`state.step4 === "blocked"` → `!==`) in `step-download.tsx`: **Start download** has no `aria-disabled` and the exits do not render.
  - off-by-one on the step 3 done flag (`activeCount > 0` → `>= 0`) in `use-setup-state.ts`: step 3 is done with nothing followed, so the step 3 card is absent on return.
- [ ] T005 Implement the story Description's *Manage followed stocks* leg, TC-INT-004's *Error / Edge Cases* line (*After following a stock on `/data/followed`, step 4 is ready on return*), in `tests/e2e/setup-first-run.spec.ts` (depends on T004, same file), as `test("TC-INT-004 (edge case): after following a stock from Manage followed stocks, step 4 is ready on return, and / opens Home only once a download is started", …)` with a `// Implements TC-INT-004 (Error / Edge Cases)` comment. `test.setTimeout(60_000)`.
  - **To step 4 blocked.** As T004: guard, `/` → `/setup`, years `2` saved (`200`), *Add later*, *Continue*, **Start download** `aria-disabled="true"`.
  - **Manage followed stocks.** `tabTo(getByRole("link", { name: "Manage followed stocks" }))`, `Enter`. `pathname` becomes exactly `/data/followed`.
  - **Follow a stock there, by keyboard.** `tabTo(page.getByRole("main").getByRole("textbox").first())`, the single-symbol add field, located by role and order because CAP-003-E7-S3 relabels this screen (Other Notes). `keyboard.type("SLA")`. Register the `POST /api/instruments` wait, press `Enter`. The status is `201` and the body is exactly `{ symbols: ["SLA"] }`.
  - **Return (story Description).** `page.goBack()`; `pathname` becomes exactly `/setup`.
    - `stepCard(page, "Download data for 1 stocks")` is visible: the steps were re-derived, so step 3 is done and step 4 current (setup-ui §2.3 *Add later*: *stocks followed in the meantime make step 3 done and step 4 ready*). `stepList(page)` holds the link *Stocks to follow, done*.
    - Step 4 is ready: **Start download** has no `aria-disabled` and no accessible description, and neither *Go to Home* nor *Manage followed stocks* renders (DAC-E4-8: *neither renders once `active_count` is above 0*).
  - **`/` opens Home only after a download is started (AC-2).**
    - `page.goto("/")`; `pathname` becomes exactly `/setup`. Following a stock does not complete setup; only a requested download does (DEC-0202 as the owner amended it).
    - `tabTo(getByRole("button", { name: "Start download" }))`, register the wait, `Enter`. The status is `202`; keep `runId`.
    - `page.goto("/")`; `pathname` becomes exactly `/home`.
  - **Cleanup.** `waitForRunState(request, runId, TERMINAL, 30_000)`.

  Kills:
  - swap-case of **Manage followed stocks**' target (`"/data/followed"` → `"/data/coverage"`) in `step-download.tsx`: the pathname check.
  - negate-boolean on the exits' condition in `step-download.tsx` (render them when not blocked): the exits render on the ready step 4.
  - a hand-written mutant that drops the step 3 re-derivation on return (`listInstruments` read once per provider instead of once per visit): step 4 stays blocked on return.

### Additional Unit Tests

None. The story writes one end-to-end spec and no production code. Every implementation-level case of the screens it drives is already planned in CAP-003-E4-S1 to S4 and CAP-003-E4-S6.

**Checkpoint**: T002–T005 are written. `npx tsc --noEmit -p tsconfig.e2e.json` is green. The grep in the Validation Plan finds no `click`, `fill`, `check`, `focus` or `selectOption` call in the spec.

---

## Phase 3: Core Implementation

**Purpose**: Run the spec against the real stack. There is no production code to write.

- [ ] T006 Run `npm run test:e2e -- tests/e2e/setup-first-run.spec.ts` (depends on T003–T005).
  - It needs `npx playwright install` and Docker (`factorflow-e2e-postgres`). The Bash sandbox blocks Docker, so it may need the sandbox disabled. If either is unavailable, report the exclusion and never call a partial run green.
  - All three tests must pass. If one fails against the sibling stories' code, do not edit `web/src/`: that code belongs to CAP-003-E4-S1 to S4, CAP-003-E4-S6 and CAP-003-E3-S4, and a failure here is a defect for that story's rework. Stop and report the failing assertion and the file it implicates.
  - Run the same command three times in a row. All three runs must pass, to rule out timing flakiness in the attention cadence and the held symbol.

**Checkpoint**: The spec passes three times in a row against the acquisition stack.

---

## Phase 4: Integration

**Purpose**: Show the spec can fail: every hand-written production mutant in Other Notes turns at least one test red.

- [ ] T007 Run the hand-written mutants in Other Notes, one at a time (depends on T006).
  - The e2e stack binds fixed ports and one fixed container name, so mutants cannot run in parallel clones. Use `python3 scripts/mutation-run.py run --jobs 1` with `--command "npm run test:e2e -- tests/e2e/setup-first-run.spec.ts"`.
  - If a clone cannot start the stack (no `uv sync` or `npm ci` in the clone), plant each mutant by hand in the working tree instead: run the spec, record `killed` or `survived` with the failing assertion, and revert. After the last one, `git diff --exit-code -- web/src` exits 0.
  - Every listed mutant must be killed. A survivor means an assertion is too weak: strengthen the spec, not the mutant, and rerun.
  - The two mutants Other Notes records as not killed here (the step 2 initial value and the health refresh) are not run. Each is killed by its owning story's unit test.
  - Each kill is the cycle's RED evidence in T010.

**Checkpoint**: Every listed mutant is killed, and `web/src/` is unchanged.

---

## Phase 5: Polish

**Purpose**: Validation, scope and the TDD evidence.

- [ ] T008 Run the validation commands from the repository root (depends on T007): `npx tsc --noEmit -p tsconfig.e2e.json`, `npx tsc --noEmit`, `npm run lint`, `npm run format` and `npm run test`.
  - `biome.json`'s `files.include` covers only `web/src/**` and root files, so lint and format do not reach `tests/e2e`. Match the delivered specs' style by hand (two-space indent, double quotes, semicolons, 100 columns) and report that exclusion rather than calling the spec linted.
  - Do not run the whole `npm run test:e2e` as this story's gate. Delivered specs that assert old paths or labels are red until CAP-003-E7-S7. A full run is informative only; any red outside this spec is reported, not fixed here.
- [ ] T009 Confirm scope (depends on T008).
  - `git status --short` lists only the new `tests/e2e/setup-first-run.spec.ts` and this story's `-tasks.md`, `-tdd-evidence.yaml` and status line.
  - `git diff --exit-code -- web/src src tests/e2e/support scripts/run-e2e-server.sh playwright.config.ts package.json package-lock.json` exits 0.
- [ ] T010 After each TDD cycle in T002–T007 — not once at the end — do the following before the next cycle begins.
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Append the cycle to `CAP-003-E4-S5-tdd-evidence.yaml` beside this story, with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence: each T007 mutant's failing assertion, then the spec green on the sibling stories' code (T006's three runs);
    - `mutation: {not_applicable: "no production line changed; the spec's strength is the hand-written production mutants of T007, run with --jobs 1"}`, plus the T007 kill table;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles:
  - **(1) The first-run journey.** T002 and T003, with T007's T003 mutants as RED.
  - **(2) Add later and return.** T004 and T005, with T007's T004 and T005 mutants as RED.
  - T008 and T009 add no behaviour and join cycle 2's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every cycle is named by a TDD-evidence entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E4-S1 | context | `use-setup-state.ts` and `draft.tsx` derive the steps and hold the drafts the spec observes, and T004's mutants target them. Nothing is imported. The graph reaches it through `CAP-003-E4-S6: [CAP-003-E4-S4, CAP-003-E4-S1, …]` |
| CAP-003-E4-S2 | context | The step list's done links, the step card's region and footer, and step 2's spinbutton *History depth years* the spec drives. Nothing is imported; reached through CAP-003-E4-S4's graph line |
| CAP-003-E4-S3 | context | Step 3's radio group and textarea *Stock symbols* the spec drives. Nothing is imported; reached through CAP-003-E4-S4's graph line |
| CAP-003-E4-S4 | context | `SetupScreen` and step 4 (**Start download**, the progress region, the blocked state and the two exits) the spec drives. Nothing is imported; reached through `CAP-003-E4-S6: [CAP-003-E4-S4, …]`. Its DEC-0360 (refresh health after a `202`) is not relied on: the spec checks `/` by `page.goto`, which reads health afresh (Other Notes) |
| CAP-003-E3-S8 | context | Its specs define the `tabTo` keyboard convention this spec redefines locally (Phase 2 conventions). Nothing is imported, so no edge |
| CAP-003-E5-S4 | context | Owns the assertions on Home's content (empty state, first-download item) that TC-INT-004 and TC-INT-008 list; this spec asserts the `/home` URL only (story Description; backlog review v2 FINDING-2) |
| CAP-003-E5-S5 | context | Registers `/home`. Until it lands, `/home` renders the not-found state; the spec asserts the URL only, so it does not depend on it (DEC-0227) |
| CAP-003-E1-S2 | context | Its `radio-group` provides the arrow-key and Space behaviour `chooseRadio` relies on. Nothing is imported; reached through CAP-003-E4-S3's graph line |
| CAP-003-E7-S7 | context | Re-points the delivered specs, whose old paths and labels stay red until it lands; the reason T008 runs only this spec as the gate. This spec imports no helper it rewrites |
| CAP-003-E7-S3 | context | Relabels the followed-stocks screen at `/data/followed` (*Symbol of the stock to follow*). T005 locates the add field by role and order, so the spec holds before and after it |

No new hard edge was found. The spec imports only the delivered `tests/e2e/support/acquisition.ts` (CAP-001). Every route and screen it drives is created by a story already on its graph line `CAP-003-E4-S5: [CAP-003-E4-S6, CAP-003-E2-S5, CAP-003-E3-S4]`:

- `/setup`, the provider mount, and through its own line the setup screen of CAP-003-E4-S1 to S4, come from CAP-003-E4-S6.
- `GET /api/attention` on the real stack comes from CAP-003-E2-S5.
- `/data/followed` and `RootRedirect` come from CAP-003-E3-S4.

### Task Dependencies

- T001 comes first. T002 depends on T001.
- T003, T004 and T005 share one file and run in that order, each after the previous.
- T006 depends on T003–T005. T007 depends on T006. T008 depends on T007. T009 depends on T008.
- T010 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- None within the story: every task writes or runs the one spec file, and the e2e stack runs one worker on fixed ports.

---

## Validation Plan

### Constitution-Defined Commands

From tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build` (not required: no `web/src` change; the e2e server builds the bundle itself)
- Test: `npm run test`
- Lint: `npm run lint` (does not reach `tests/e2e`; see T008)
- Format: `npm run format` (a check; does not reach `tests/e2e`)
- Type check: `npx tsc --noEmit` and `npx tsc --noEmit -p tsconfig.e2e.json`
- End to end: `npm run test:e2e -- tests/e2e/setup-first-run.spec.ts`. This needs Docker and `npx playwright install`. Report any exclusion.

No Python file changes, so `uv run pytest`, `ruff` and `mypy` are not required.

### Story-Specific Validation

- **DAC-E4-S5-1, AC-7, AC-25:** T003 is green three times in a row (T006).
- **DAC-E4-S5-2, AC-3, AC-21:** T004 is green, including its non-vacuity check after the reload.
- **AC-2:** every `/` check in T003, T004 and T005 asserts an exact pathname: `/setup` before a download is requested, `/home` after.
- **Keyboard only:** `grep -nE "\.(click|fill|check|focus|selectOption|tap|dblclick)\(" tests/e2e/setup-first-run.spec.ts` prints nothing. `tabTo` uses `locator.evaluate`, and no task calls any of these.
- **Home's content not asserted:** `grep -nE "Needs you|first download|Nothing needs" tests/e2e/setup-first-run.spec.ts` prints nothing.
- **No run left behind:** each test that starts a download ends on `waitForRunState(…, TERMINAL, …)`, and `afterEach` calls `resetStub()`.
- **Mutation:** T007's kill table has every listed mutant killed.

---

## Notes

### Resolved Conflicts

1. **What the journey asserts about Home.**
   - **The conflict.** setup-ui §7 (*First run*: "`/` opens Home with the first-download item"; *Add later*: "lands on Home's empty state"), TC-INT-008 (*"`/` now opens Home with the first-download item"*) and TC-INT-004 (*"Home shows its empty state"*) assert Home's content. The story Description says this spec asserts the `/home` URL, and Home's content belongs to CAP-003-E5-S4.
   - **Governing: story CAP-003-E4-S5** (its Description, from backlog review v2 FINDING-2) with DEC-0227 (*an e2e spec asserts only routes registered at its story*), over the design's test table and the draft test specification.
   - **Outcome.** Every Home check is `pathname === "/home"`. At this story `/home` may render the not-found state.
2. **How the owner "returns to `/setup`".**
   - **The conflict.** TC-INT-004 step 3 says "Open `/setup` again" and expects the radio choice as left. Opening a URL reloads the page, and setup-ui §3 says *"a reload re-derives saved steps and loses unsaved drafts"*. The *Add later* choice is never saved (DEC-0202 as amended), so after a reload it cannot be as left.
   - **Governing: DAC-E4-S5-2** (*"the owner returns to `/setup`"*, means unstated) **read with setup-ui §3** (design normative prose), over the test step's wording.
   - **Outcome.** The return is the browser's Back within the session (`page.goBack()`), which keeps the shell and its `SetupDraftProvider` mounted. The reload is used once, deliberately, as T004's non-vacuity check.
3. **Which step is current on return after *Add later*.**
   - **The conflict.** Epic DAC-E4-8 makes step 4 current after *Add later* and **Continue**. Epic DAC-E4-1 makes the current step the first not done, re-derived on every visit.
   - **Governing: epic DAC-E4-1**, as CAP-003-E4-S1's plan applies it (the `goTo` override is hook-local and ends with the visit). DAC-E4-8 describes the moment after **Continue** within the visit.
   - **Outcome.** On return with nothing followed, T004 expects the step 3 card with *Add later* checked. With a stock followed meanwhile, T005 expects step 4 current and ready.
4. **The story's file list names `tests/e2e/support/database.ts` for the empty-install reset.** The reset that empties a stack is `resetAcquisitionStore()` in `tests/e2e/support/acquisition.ts`, which calls `database.ts`'s `sql()`. Not a conflict of facts: the story names the module that runs the SQL, and the acquisition stack (runner plus `massive_stub.py`) is the only stack where a started download progresses. The main stack on 8123 starts no runner and no stub, so a download there stays `requested` and *{done} of {total} stocks* never appears.

### Open Gaps

None. No bound, limit, default or threshold this plan needs is left undetermined. The attention cadence is owner-shell §2.4's. The test timeouts (5 s, 20 s, 25 s, 30 s) are test-harness margins derived from that cadence and from the delivered specs' run timeouts, not product contracts.

### Other Notes

- **No production code; no TDD RED in the usual sense.** The story is `type: chore` and writes one spec. Each cycle's RED evidence is the T007 mutants turning the spec red, and GREEN is the spec passing on the sibling stories' code. The `mutation:` block is `not_applicable` for generated mutants, because no production line is added (CAP-003-E3-S8's precedent).
- **Step 1 "completed by keyboard".** On an empty install with health answering, step 1 is already done (*once health has answered*) and step 2 is current on entry. To walk all four steps by keyboard, T003 opens step 1 through its done link in the step list and leaves it with **Continue**. This exercises the step list's keyboard path, which AC-25 also covers.
- **`/` is checked by `page.goto`.** A typed URL loads the app afresh, so `RootRedirect` waits for a new health answer. The spec therefore does not rely on CAP-003-E4-S4's in-session `refresh("health")` (DEC-0360), and that mutant is not killed here. CAP-003-E4-S4's T009 (j) kills it.
- **The years text cannot tell a draft from the saved value.** Step 2's initial value is the draft when it is not empty, else the saved depth (CAP-003-E4-S2). After **Continue** both are `3`, so a mutant that ignores the draft is equivalent at the browser. It is killed by CAP-003-E4-S2's T012 (b). The radio choice is never saved, so it is T004's discriminating evidence that the provider kept the drafts, and the reload's unchecked radios show the check is not vacuous.
- **The followed-stocks add field is located by role and order.** On the delivered screen `AddField` (*Instrument symbol*, submitted by Enter) renders before `BulkAdd`; CAP-003-E7-S3 relabels it *Symbol of the stock to follow* and keeps the order. `getByRole("main").getByRole("textbox").first()` finds it either way, as CAP-003-E3-S8's T006 (c) does. The shared `addInstruments` helper is not used: it navigates with `page.goto`, which would reload and drop the session the return relies on.
- **Holding a symbol.** T003 holds `SFB` so the download stays non-terminal across two attention ticks; a two-symbol download against the stub otherwise ends in a few seconds, after which the cadence drops to 60 s. `afterEach` resets the stub so a failed test cannot leave the runner blocked.
- **Shared stack state.** Each test starts from `resetAcquisitionStore()`; the main stack on 8123 is not touched. The suite runs one worker, so no other spec writes the acquisition database during these tests.
- **Copy matched as literals.** The spec matches the owner-facing strings of `copy.ts` as independent literals (T001 confirms them), never imported from `copy.ts`, so a copy mutant fails the spec rather than moving with it. *Download data for 1 stocks* and *Download data for 2 stocks* are what `STEP4.downloadFor` produces for those counts.
- **Hand-written mutants** for T007, each naming the test that kills it:
  - `web/src/screens/setup/step-download.tsx`: the `refresh("attention")` call after a `202` deleted → T003 (*checked* within 5 s).
  - `web/src/app/routes.tsx`: in `RootRedirect`, the `/setup` and `/home` targets swapped → T003, T004, T005.
  - `web/src/screens/setup/use-setup-state.ts`: `health.lastAnsweredAt !== null` → `health.lastAnsweredAt === null` → T003 (entry).
  - `web/src/screens/setup/step-download.tsx`: the progress region's guard → `attention.kind === "loading"` → T003 (progress).
  - `web/src/app/shell.tsx`: `<SetupDraftProvider>` → `<SetupDraftProvider key={useLocation().pathname}>` → T004 (return).
  - `web/src/screens/setup/use-setup-state.ts`: the `goTo` override moved from the hook into `SetupDraftProvider` → T004 (return).
  - `web/src/screens/setup/step-download.tsx`: `<Link to="/home">` → `<Link to="/">` → T004 (Go to Home).
  - `web/src/screens/setup/step-download.tsx`: `state.step4 === "blocked"` → `state.step4 !== "blocked"` → T004, T005.
  - `web/src/screens/setup/use-setup-state.ts`: the step 3 done flag `> 0` → `>= 0` → T004 (return).
  - `web/src/screens/setup/step-download.tsx`: `<Link to="/data/followed">` → `<Link to="/data/coverage">` → T005.
  - `web/src/screens/setup/use-setup-state.ts`: the active-count read cached in `SetupDraftProvider` across visits instead of re-read on every mount → T005 (return).
- **Not killed here, by design:** `step-download.tsx`'s `refresh("health")` deleted (CAP-003-E4-S4 T009 (j)); `step-history-depth.tsx`'s draft-first initial value replaced by the saved depth (CAP-003-E4-S2 T012 (b)).
