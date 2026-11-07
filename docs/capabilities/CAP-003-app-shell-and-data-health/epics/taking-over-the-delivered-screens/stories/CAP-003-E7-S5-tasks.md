---
artifact_schema_version: 1
artifact_id: CAP-003-E7-S5-tasks
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
  timestamp: 2026-11-07T06:34:44Z
  source_artifacts:
    - id: CAP-003-E7-S5
      version: "1"
    - id: CAP-003-E7
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-web-app
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-owner-web-app-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "1"
    - id: CAP-003-E1-S1-tasks
      version: "1"
    - id: CAP-003-E1-S2-tasks
      version: "1"
    - id: CAP-003-E1-S3-tasks
      version: "1"
    - id: CAP-003-E1-S4-tasks
      version: "1"
    - id: CAP-003-E1-S5-tasks
      version: "1"
    - id: CAP-003-E1-S6-tasks
      version: "1"
    - id: CAP-003-E1-S9-tasks
      version: "1"
    - id: CAP-003-E3-S3-tasks
      version: "1"
    - id: CAP-003-E3-S4-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E7-S5 — Download Detail Under the Shell: the Crumb, Determinate Progress, the Two Cancel Confirmations and the Not Found Diagnosis

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/taking-over-the-delivered-screens/stories/CAP-003-E7-S5.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/screens/runs/`; design module `owner-web-app`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Takes over CAP-001's run detail, served by CAP-003-E3-S4 at `/data/downloads/:runId`, and rebuilds it in the product's words and from `ui-components` without changing a request, query parameter, confirmation step, refusal or cadence (owner-web-app 2.1, 2.3, 2.5, 2.6, 7, 10; UX design 1.8; epic DAC-E7-5, DAC-E7-8, DAC-E7-9, DAC-E7-11). The `h1` becomes *Download {start time}* from `formatDownloadName`, and the screen sets the top-bar crumb through `useShell().setTitleDetail(...)` once the run is read and clears it on unmount (DEC-0214). The summary becomes a `card` `summary` whose download state, *Stopping* and the interrupted explanation go through `StatusBadge` over `tierOf` / `labelOf`, with `progress` `determinate` *{done} of {total} stocks* while the download works (`indeterminate` while the total is 0), its last-updated time, and no estimate. The two cancel confirmations move onto `dialog` `confirm` with owner-web-app 2.3's verbatim wording and outcomes, behind **Cancel download** (`button` `secondary`). The roster becomes `data-table` `expandable` with `StatusBadge` per-data-type outcomes, *Downloading …* reason lines, a stock-level *Not found* diagnosis with **Open Data health** to `/data`, and a symbol link to `/data/coverage?symbol={SYMBOL}`. The outcome filter becomes `select` `inline`, and the roster's eight-state table renders through `StateRegion`. `detail/result-outcome-badge.tsx` and its test are deleted, and every import the detail and the cancel control take from `outcome-badge.tsx` is removed, which CAP-003-E7-S4's deletion of that file needs. The AC-26 literal scan is widened to `web/src/screens/runs/detail/`.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-12 | A partial or interrupted download is never presented as complete | T008, T009, T013, T018 |
| AC-14 | A *Not found* stock is diagnosed and points to Data health, never suggesting downloading again would help | T009, T012, T018 |
| AC-17 | Every action, confirmation and refusal CAP-001 accepted on run detail stays at `/data/downloads/:id` with the same outcome | T002, T009, T010, T011, T012, T013, T014, T015, T017, T018 |
| AC-19 | Every user-visible label uses the display label | T007, T009, T010, T012, T013, T014, T015 |
| AC-20 | Every result outcome renders as its single severity tier | T008, T012, T013, T014, T016 |
| AC-24 | The eight-state table renders through `StateRegion` | T009, T015 |
| AC-25 | The polled progress shows its last-updated time; cancelling is keyboard-completable | T004, T009, T010, T013, T014 |
| AC-26 | The screen is built from `ui-components` | T006, T012, T013, T014, T015, T018 |
| DAC-E7-5 | `result-outcome-badge.tsx` replaced by `StatusBadge` and deleted with its test | T005, T008, T012, T016 |
| DAC-E7-8 | Title, crumb set and cleared, progress, the two cancel confirmations, already-finished and interrupted sentences, *Not found* with **Open Data health** | T002, T003, T004, T009, T010, T012, T013, T014, T015 |
| DAC-E7-9 | Cancelling uses `dialog` `confirm`, never `destructive` | T010, T014 |
| DAC-E7-11 | The roster is `data-table` `expandable` | T009, T012 |
| DAC-E7-S5-1 | `setTitleDetail` once with *Download {start time}*, `null` on unmount; *Download* before the read | T002, T003, T015 |
| DAC-E7-S5-2 | Named 0 → `indeterminate`; 120 named, 40 done → `determinate` *40 of 120 stocks*, `aria-valuenow` 40, no estimate | T004, T013 |
| DAC-E7-S5-3 | No `result-outcome-badge` import in `detail/`; the two files gone | T005, T016 |
| DAC-E7-S5-4 | `detail/` added to the literal scan, which passes | T006, T012, T013, T015 |
| DAC-E7-S5-5 | Populated, empty, error and dialog states show none of the eight terms; DAC-E7-4 deltas exact | T007, T012, T013, T014, T015 |
| DAC-E7-S5-6 | Download state, *Failed*, *Not found* and *Stopping* through `StatusBadge` with label and `aria-hidden` shape | T008, T012, T013, T014 |
| DAC-E7-S5-7 | Requests, parameters, confirmations, refusals and cadence unchanged; eight states through `StateRegion`, unreachable left to the shell | T009, T010, T011, T015, T017 |

Mapped test cases (`tests/component/owner-web-app-tests.md`; `tests/coverage-matrix.md` lines 319-358 and the per-story count "7 of 7" at line 437): **TC-COMP-211** (DAC-E7-S5-1, DAC-E7-8), **TC-COMP-212** (DAC-E7-S5-2, DAC-E7-8), **TC-COMP-213** (DAC-E7-S5-3, DAC-E7-5), **TC-COMP-214** (DAC-E7-S5-4), **TC-COMP-215** (DAC-E7-S5-5), **TC-COMP-216** (DAC-E7-S5-6), **TC-COMP-217** (DAC-E7-S5-7). The epic-level cases that span E7-S1 to E7-S5 are implemented here for this screen only: **TC-COMP-183** (the detail opens at `/data/downloads/:id`; nothing on it targets an old path) and **TC-COMP-184** (the detail's deltas **Cancel download** and *downloading*). TC-COMP-204 and TC-COMP-206 (the other DAC-E7-5 cases) are CAP-003-E7-S4's. TC-COMP-199 (DAC-E7-9) is the stop-following dialog's. TC-COMP-218 to TC-COMP-220 are CAP-003-E7-S6's sweep. The test specification is `status: draft`; its generic steps are sharpened below.

## Phase 1: Setup

**Purpose**: Confirm the upstream modules this story imports are in the tree, and record the baseline.

- [ ] T001 From the repo root run `npm ci` and `npm run test`, and confirm these exist with these exports, each from a hard graph edge: `web/src/components/ui/button.tsx` (`Button`, variants incl. `secondary`, `outline`, `asChild`), `card.tsx` (`Card` with `variant="summary"`, `CardSummaryList`) and `badge.tsx` (CAP-003-E1-S1); `web/src/components/token-literals.test.ts` exporting `SCANNED_DIRECTORIES` and `literalsIn` (CAP-003-E1-S1); `web/src/components/ui/select.tsx` (`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`; CAP-003-E1-S2); `web/src/components/ui/dialog.tsx` (`ConfirmDialog`) and `progress.tsx` (`Progress`; CAP-003-E1-S3); `web/src/components/ui/data-table.tsx` (`DataTable` with `variant="expandable"`, `renderExpansion`, `getRowLabel`, `getRowId`, `rowHeader`; CAP-003-E1-S4, DEC-0307); `web/src/components/patterns/tiers.ts` (`tierOf`, `labelOf`, `Tier`) and `status-badge.tsx` (`StatusBadge` `{ tier, children }`; CAP-003-E1-S5); `web/src/components/patterns/format.ts` (`formatInstant`, `formatClock`, `formatCount`, `formatDownloadName(startedAt, requestedAt)`) and `presence.tsx` (`Absent`; CAP-003-E1-S6); `web/src/components/patterns/state-region.tsx` (`StateRegion`, `StateRenderers`; CAP-003-E1-S9); `web/src/app/health.tsx` (`HealthProvider`; CAP-003-E3-S2); `web/src/app/shell-context.tsx` (`ShellProvider`, `useShell`, `useTitleDetail`; CAP-003-E3-S3); `web/src/app/titles.ts` (`useTitle`) and `web/src/app/routes.tsx` registering `path="/data/downloads/:runId"` (CAP-003-E3-S4); `web/src/app/shell.tsx` mounting `ShellProvider` inside `HealthProvider` (CAP-003-E3-S6). Record the output of `grep -rn "outcome-badge" web/src/screens/runs/detail web/src/screens/runs/cancel-run.tsx web/src/screens/runs/run-detail*.test.tsx web/src/screens/runs/cancel.test.tsx` as the list this story empties. No package is added (traces to AC-26, AC-17)

**Checkpoint**: Baseline green; every upstream export present; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the detail's new words, components and states, and relabel the delivered tests so they keep proving CAP-001's outcomes.

**Shared harness changes**, made once in each detail test file and reused by every task below:

- Route: `<MemoryRouter initialEntries={["/data/downloads/r-1"]}><Routes><Route path="/data/downloads/:runId" element={<RunDetailScreen />} /></Routes><LocationProbe /></MemoryRouter>`. CAP-003-E3-S4 registers `:runId` (Resolved Conflict 1).
- Shell context: `useShell()` throws outside `ShellProvider` (CAP-003-E3-S3). Each of `run-detail.test.tsx`, `run-detail.polling.test.tsx`, `run-detail.reason.test.tsx` and `cancel.test.tsx` adds `const setTitleDetail = vi.fn(); vi.mock("../../app/shell-context", () => ({ useShell: () => ({ setTitleDetail }) }))`. Reset it in `beforeEach`. Only `run-detail.crumb.test.tsx` (T003) mounts the real providers.
- jsdom gaps for Radix Select (CAP-003-E1-S2 Other Notes): in each file that renders the screen, `beforeAll` defines `Element.prototype.hasPointerCapture` (returns `false`), `releasePointerCapture` and `scrollIntoView` as no-ops; `beforeEach` re-stubs `ResizeObserver` with `vi.stubGlobal`, since `web/src/test-setup.ts` unstubs after each test. `web/src/test-setup.ts` is not edited.
- Filter helper `chooseOutcome(label)`: open `getByRole("combobox", { name: "Outcome" })` with `{Enter}`, then select `getByRole("option", { name: label })`. Under fake timers in the polling file, use `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.
- `summary()` becomes `getByRole("region", { name: "Download summary" })`. `expander(symbol)` becomes `getByRole("button", { name: "Expand " + symbol })`; the name is CAP-003-E1-S4's (DEC-0307), fixed whether the row is open or closed, and `aria-expanded` carries the state.
- Badge helper `badgeIn(container, label)` finds the `[data-variant^="status-"]` element whose text is `label`. It replaces `getByTestId("outcome-badge" | "result-outcome-badge")`.

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-211 (Detail sets the crumb once the run is read and clears it on unmount), with the spy, in `web/src/screens/runs/run-detail.test.tsx` under a new `describe("Crumb and title (TC-COMP-211, DAC-E7-S5-1, DEC-0214)")`, with a `// Implements TC-COMP-211` comment. Fixture: a `running` run with `requestedAt: "2026-10-15T22:25:00Z"` and `startedAt: "2026-10-15T22:31:00Z"`. Under fake timers (`vi.useFakeTimers({ shouldAdvanceTime: true })`), hold the first `getAcquisitionRun` in a deferred promise. (1) Before it resolves: `setTitleDetail` has not been called, and `getByRole("heading", { level: 1 })` reads exactly `Download`. (2) Resolve it: the `h1` reads exactly `Download 2026-10-15 17:31 CDT`, and `setTitleDetail` has been called exactly once, with that string. (3) Advance 30 000 ms (three polls answering the same run): still exactly one call. (4) `unmount()`: the last call is `setTitleDetail(null)`, and the call count is 2. Kills: swap-case on the name's source (`requestedAt` before `startedAt` prints `17:25`); remove the unmount cleanup (no `null` call); a mutant whose effect also lists `latest` or `fetchedAt` as a dependency (count exceeds 1 in (3)); drop-field-copy of the `Download ` noun in the pre-read `h1`
- [ ] T003 [P] Implement TC-COMP-211 (Detail sets the crumb once the run is read and clears it on unmount), the real chain, in a new `web/src/screens/runs/run-detail.crumb.test.tsx`, with a `// Implements TC-COMP-211` comment. Mount the real providers, as CAP-003-E3-S4's `titles.test.tsx` harness does: `vi.stubGlobal("fetch", …)` answers `/api/health` with a `HealthResponse` literal, and `/api/acquisition-runs/r-1` with a snake_case `running` body, held behind a deferred promise; any other path answers `404`. Render `<HealthProvider><ShellProvider><MemoryRouter initialEntries={["/data/downloads/r-1"]}><TitleProbe /><Routes><Route path="/data/downloads/:runId" element={show ? <RunDetailScreen /> : null} /></Routes></MemoryRouter></ShellProvider></HealthProvider>`. `TitleProbe` renders `useTitle()`'s labels joined with `" › "`. Steps: (1) before the read, the probe reads exactly `Data health › Downloads › Download`; (2) after it, exactly `Data health › Downloads › Download 2026-10-15 17:31 CDT`; (3) after `show` turns false (the screen unmounts, the route stays), it reads `Data health › Downloads › Download` again. Kills: the same mutants as T002, observed through the real crumb rather than a spy, which removes the spy as the only witness
- [ ] T004 Implement TC-COMP-212 (Detail progress indeterminate at 0 named, determinate with valuenow) in `web/src/screens/runs/run-detail.test.tsx` under `describe("Progress while the download works (TC-COMP-212, DAC-E7-S5-2)")`, with a `// Implements TC-COMP-212` comment, against DEC-0394. (1) A `running` run with `counts.instrumentsNamed: 0`, `instrumentsWritten: 0`, `instrumentsFailed: 0`: `within(summary()).getByRole("progressbar", { name: "Starting the download" })` has no `aria-valuenow` attribute and `data-variant="indeterminate"`, and `summary()` contains no text `0 of 0`. (2) A `running` run with `counts.instrumentsNamed: 120`, `instrumentsWritten: 30`, `instrumentsFailed: 10`: `getByRole("progressbar", { name: "40 of 120 stocks" })` has `aria-valuenow="40"`, `aria-valuemax="120"` and `data-variant="determinate"`. The visible text `40 of 120 stocks` is inside an element with `aria-live="polite"`. `summary().textContent` does not match `/remaining|estimat|\bETA\b|left\b/i`. (3) The same counts in `cancelling`: the bar is present. In `requested`, `succeeded`, `partial` and `abandoned`: `queryByRole("progressbar")` is `null`. (4) The progress figures come from the detail's own `counts`, not `run`: give `run` `instrumentsWritten: 0` and `counts` 30, and the bar still reads 40. Kills: negate-boolean on the `total === 0` guard (case 1 shows `0 of 0`); drop-field-copy of `instrumentsFailed` from the sum (case 2 reads 30); swap-case of `value` and `max` (`aria-valuenow="120"`); swap-case of the state guard (`running` ↔ `requested`, case 3)
- [ ] T005 [P] Implement TC-COMP-213 (result-outcome-badge removed from the detail) in `web/src/screens/runs/run-detail.test.tsx` under `describe("No delivered badge module remains in the detail (TC-COMP-213, DAC-E7-S5-3)")`, with a `// Implements TC-COMP-213` comment. Resolve `web/src/screens/runs/detail/` from `import.meta.url`, as `web/src/app/shell.tokens.test.tsx` does, and read it with `node:fs`. (1) `existsSync` is false for `detail/result-outcome-badge.tsx` and `detail/result-outcome-badge.test.tsx`. (2) Walk every `.ts`/`.tsx` file under `detail/`; there are more than zero, so the check is not vacuous. None contains the substring `outcome-badge`, which also covers `../outcome-badge`. (3) Neither `web/src/screens/runs/cancel-run.tsx` nor this story's four test files contains `from "./outcome-badge"` or `from "../outcome-badge"`. Kills: a hand-written mutant restoring `detail/result-outcome-badge.tsx` (1); one restoring `import { isNonTerminalRunState } from "../outcome-badge"` in `detail/index.tsx` (2)
- [ ] T006 [P] Implement TC-COMP-214 (Literal scan widened to web/src/screens/runs/detail/) in `web/src/components/token-literals.test.ts`, with a `// Implements TC-COMP-214` comment. Append `"web/src/screens/runs/detail/"` to the exported `SCANNED_DIRECTORIES` (CAP-003-E1-S1's interface, DEC-0296); change no other entry. Add one `it("scans the download detail (DAC-E7-S5-4)")`. It asserts that `SCANNED_DIRECTORIES` contains that entry, and that `literalsIn("web/src/screens/runs/detail/planted.tsx", 'const x = "12px";')` returns exactly one offender beginning `web/src/screens/runs/detail/planted.tsx`. The existing walk case then covers the directory's real files. Before T012, T013 and T015 the walk passes, since the delivered `detail/` files hold no literal. The TC's real-file plant is T019 (a)'s manual step. Kills: removing the appended entry (the new `it` fails)
- [ ] T007 Implement TC-COMP-215 (Download detail states use the display vocabulary with the exact deltas), with the TC-COMP-184 detail slice, in `web/src/screens/runs/run-detail.test.tsx` under `describe("Display vocabulary (TC-COMP-215, TC-COMP-184, DAC-E7-S5-5)")`, with `// Implements TC-COMP-215` and `// Implements TC-COMP-184` comments. A helper `wordsOnScreen()` returns `document.body.textContent` joined with every element's `aria-label`, `title` and `placeholder` attribute, and the text of every `aria-labelledby` target. Radix portals render into `document.body`, so dialogs are included. `FORBIDDEN = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`. Render, and after each assert `wordsOnScreen()` does not match `FORBIDDEN`:
  - (a) populated `partial`, with `AAPL` failed and `ZZZZ` not found, both expanded;
  - (b) populated `abandoned`;
  - (c) populated `failed` with no results;
  - (d) `empty-no-match`, after choosing *Failed* on a page that answers `results: []`;
  - (e) `error`, after a rejected read;
  - (f) `running`, with the cancel dialog open;
  - (g) `requested`, with the cancel dialog open;
  - (h) after a `409 run_already_terminal`.

  Positive deltas against literals: **Cancel download** is a button in (f); (a)'s reason line begins `Downloading prices for AAPL failed:`; the column header reads `Stock`; the live count reads `2 stocks shown`; (d) reads `No stock in this download matches this filter.`; (e) reads `Couldn't read this download's stocks:`. Kept terms: `Reference`, `Prices`, `Fundamentals`, `Corporate actions` and `Outcome` remain. Kills: hand-written mutants restoring `Cancel run`, `Acquiring`, `instruments shown`, `Re-run acquisition` (the recovery button, DEC-0395) or `Cancelling run`, each matched by `FORBIDDEN` in its state
- [ ] T008 Implement TC-COMP-216 (Download state, per-stock outcomes and Stopping carry shape) in `web/src/screens/runs/run-detail.test.tsx` under `describe("Every status through StatusBadge (TC-COMP-216, DAC-E7-S5-6)")`, with a `// Implements TC-COMP-216` comment. The independent literal fixture `SHAPE` maps each tier to its icon: neutral, a hollow single `circle`; active, two `circle`s; good, a single `circle` with `fill="currentColor"`; warning, `svg.lucide-triangle`; serious, `svg.lucide-diamond`; critical, `svg.lucide-square`. These are CAP-003-E1-S5's shapes. Cases:
  - (1) Summary state, for each of the eight `RunState`s. The literal table is `requested` *Queued* neutral, `running` *Downloading* active, `cancelling` *Stopping* warning, `succeeded` *Complete* good, `partial` *Partial* warning, `failed` *Failed* critical, `cancelled` *Cancelled by you* neutral, `abandoned` *Interrupted* serious. `within(summary())` holds a badge with text exactly the label and `data-variant="status-<tier>"`. Its only `svg` has `aria-hidden="true"` and matches `SHAPE[tier]`.
  - (2) Per-data-type badges in an expanded stock, against the literal table *Failed* critical, *Not found* warning, *Written* good, *Unchanged* good, *Skipped* warning. The last three are DEC-0015's tiers (Open Gap 2).
  - (3) After a `202 cancelling` from **Stop download**, the summary badge reads *Stopping*, `status-warning`, triangle.
  - (4) `document.querySelector('[data-variant="coverage-unknown"]')` is `null`: no status on this screen is not determinable (Other Notes).
  - (5) No badge is colour alone: every `[data-variant^="status-"]` element has non-empty text.

  Kills: swap-case of `not_found`'s tier (`warning` → `critical`, (2)); swap-case of `partial` → `good` reaching the summary (it would read *Complete*, AC-12); remove-attribute of the badge's `aria-hidden` icon (CAP-003-E1-S5's mutant, observed here); swap-case `skipped` → `good`
- [ ] T009 Implement TC-COMP-217 (Download detail behaviour preserved; eight states through StateRegion), with the TC-COMP-183 detail slice, by relabelling the delivered `web/src/screens/runs/run-detail.test.tsx`, `run-detail.polling.test.tsx` and `run-detail.reason.test.tsx`. Add `// Implements TC-COMP-217` beside the existing `Implements` comments, and `// Implements TC-COMP-183` on the route harness. Change only labels, paths, component queries and the three-part copy; every request, parameter, step and cadence assertion stays:
  - Requests: the first call is `getAcquisitionRun("r-1", {})` with no `limit`; filter and page requests pass `{ outcome }` / `{ cursor }` exactly as today; the polling file's 10 000 ms cadence (`RUN_DETAIL_POLL_INTERVAL_MS`), the stop on terminal, the stop on a rejected poll, the cleared timer on unmount and the expansion kept across a poll are unchanged. Use the new expander name.
  - Last updated: the polling file's *Last updated* lines become `Last updated 09:00:00 CDT` and `Last updated 09:00:10 CDT`. The fixture's fetch instants are `2026-09-06T14:00:00Z` and `…:10Z`, formatted by `formatClock` (AC-25).
  - Reasons: `Acquiring prices for AAPL failed: …` becomes `Downloading prices for AAPL failed: …`; `Acquiring reference for ZZZZ: not found at the provider. …` becomes `Downloading reference for ZZZZ: not found at the provider. …`; `ZZZZ`'s group still does not match `/failed/i`.
  - Not found diagnosis (AC-14, DAC-E7-8): in `ZZZZ`'s expansion, `getByText("The provider doesn't recognise this symbol. Downloading again won't help; stop following it or follow a different symbol.")`. `getByRole("link", { name: "Open Data health" })` has `href` `/data`. The group's text does not match `/download again/i` and does not match `/try again/i`. `AAPL`'s expansion (failed, no `not_found`) has no such sentence and no such link.
  - Symbol links (UX design 1.8 *Internal links*; DAC-E7-1): the row header for `KO` holds `getByRole("link", { name: "KO" })` with `href` `/data/coverage?symbol=KO`. No `a[href^="/runs"]` and no `a[href^="/coverage"]` exists in any state (TC-COMP-183).
  - Interrupted (AC-12): `abandoned` shows a badge reading *Interrupted* (`status-serious`). It shows exactly `FactorFlow stopped before this download finished, and the download was picked up as interrupted. Coverage written before it stopped is kept. Download again to continue.` and a **Download now** button (DEC-0395). Neither *Complete* nor `status-good` appears in the summary. `partial` likewise never shows *Complete*.
  - Recovery (failed, partial): **Download now** with `Download again; data already stored is never duplicated or overwritten.` beside it. It is absent for `succeeded`, `cancelled`, `requested`, `running` and `cancelling`. Clicking it calls `startAcquisitionRun()` once, with no arguments.
  - Cancel from the detail: the running flow is **Cancel download**, then the dialog's **Stop download**. The summary then reads *Stopping* and **Cancel download** is gone. The queued flow is **Cancel download**, then the dialog's **Cancel download**, scoped `within(getByRole("dialog"))`. The summary then reads *Cancelled by you* at once, and *Started* holds `Absent`'s hidden text `Not recorded`. The race flow is `409`. It shows `This download had already finished.` and the actual outcome's badge.
  - Eight states: loading renders an `aria-busy="true"` skeleton and no table. `empty-no-match` shows the nothing-found sentence and a **Reset filter** button, which returns to the full page. Populated with zero results shows `No stock results have been recorded for this download yet.` Error keeps the last summary. `getByRole("status")` reads `Couldn't read this download's stocks: <message>.`, the text contains no `request`, and **Try again** (outline) re-reads and restores the table. The `partial`, `unavailable`, `empty-never-populated` and `unreachable` kinds are declared `notApplicable` in the call. Checking that call is T015's type-check, and no renderer can be reached for them at runtime.
  - Reason safety (`run-detail.reason.test.tsx`): the route, the expander name and the `Downloading …` line follow. The credential and markup assertions are unchanged.
  - Kills: swap-case on the poll guard (a terminal run polled); drop-field-copy of `outcome` into the request filters; swap-case `empty-no-match` ↔ `populated` when a filtered page is empty; a hand-written mutant showing `(request ${requestId})` in the error
- [ ] T010 [P] Relabel and extend `web/src/screens/runs/cancel.test.tsx` for the takeover of `web/src/screens/runs/cancel-run.tsx` (DAC-E7-8, DAC-E7-9, AC-17, AC-25; Resolved Conflict 5; Other Notes, *Who edits `cancel-run.tsx`*). Add `// Implements TC-COMP-217` and `// Implements TC-COMP-216` (*Stopping* via `StatusBadge`) comments; keep the delivered `Implements` comments.
  - Trigger: `getByRole("button", { name: "Cancel download" })` has `data-variant="secondary"`.
  - Running dialog: `getByRole("dialog")` has `data-variant="confirm"` and never `destructive`. Its heading reads exactly `Stop this download?`, and it holds exactly `Stocks already downloaded keep their coverage. Stocks not yet started will be skipped. The download stops after the stock it is working on now.` Its buttons, in DOM order, are `Cancel` then `Stop download`.
  - Queued dialog: heading `Cancel this queued download?`, text `It has not started, so nothing has been downloaded. The download in progress is not affected.`, buttons `Cancel` then `Cancel download`.
  - The two dialogs' text differs.
  - Keyboard completion (AC-25), for both states: Tab to the trigger and press `{Enter}`. **Cancel** has focus. `{Escape}` closes, and focus returns to the trigger. Reopen, `{Tab}` to the confirm action and press `{Enter}`. `cancelAcquisitionRun` is called once with `"r-1"`.
  - Outcomes: a `202 cancelling` shows a badge reading *Stopping* (`status-warning`) and withdraws the trigger. A `202 cancelled` shows *Cancelled by you* (`status-neutral`).
  - Pending: while the call is pending, the dialog has `aria-busy="true"` and stays open, and a second confirm click makes no second call.
  - `409 run_already_terminal` with `state: "succeeded"`: `This download had already finished.` and a *Complete* badge. The message is kept when the `state` prop turns terminal.
  - Any other failure keeps the dialog open with, inside it, a `role="alert"` reading exactly `Couldn't cancel this download: Network down.`. It contains no `request` and no `r-1` (DEC-0396).
  - Not offered for `cancelling`, `succeeded`, `partial`, `failed`, `cancelled` and `abandoned`.
  - The "renders nothing after a 202 once the state prop moves past running" case is unchanged in outcome.
  - Kills: swap-case of the two dialog copies (`queued` negated); swap-case of the confirm label (`Stop download` ↔ `Cancel download`); negate-boolean on `alreadyCompleted`; drop the `pending` guard (two calls); a mutant interpolating `runId` into the failure line

### Additional Unit Tests

- [ ] T011 [P] Add the outcome-filter and roster-structure cases in `web/src/screens/runs/run-detail.test.tsx` under `describe("Filter, roster and summary composition")` (AC-17, AC-26, DAC-E7-11):
  - (1) The filter is a Radix `select` `inline`: `getByRole("combobox", { name: "Outcome" })` has `data-variant="inline"`. Its options, in order, are `All`, `Failed`, `Not found`, `Skipped`, `Unchanged`, `Written`, which is DEC-0015's failure-first order. Choosing `Not found` requests `{ outcome: "not_found" }`, and choosing `All` requests `{}`. Focus stays on the combobox.
  - (2) The roster is `within(getByRole("region", { name: "Stocks in this download" })).getByRole("table")`, which has `data-variant="expandable"`. Each collapsed row's row header is the symbol. Expanding `MSFT` lists `Reference`, `Prices`, `Fundamentals`, `Corporate actions` in that order, which is the delivered `DATA_TYPE_ORDER`.
  - (3) The summary is a `region` whose element has `data-variant="summary"`.
  - (4) The summary's `dl` holds, against literals: `Requested` `2026-09-06 09:00 CDT`; `Started` `2026-09-06 09:00 CDT`; `Ended` `2026-09-06 09:30 CDT`; `Stocks downloaded` `2`; `Stocks failed` `1`.
  - (5) The per-outcome counts line reads `Failed 1 · Not found 0 · Skipped 0 · Unchanged 0 · Written 2` for `resultsByOutcome` `{ written: 2, unchanged: 0, notFound: 0, failed: 1, skipped: 0 }`.

  Kills: swap-case on the `"all"` sentinel mapping (choosing `All` sends `{ outcome: "all" }`); off-by-one on the option order; swap-case of `formatInstant` for `formatClock` in the `dl`; drop-field-copy of `notFound` from `COUNT_KEY`

**Checkpoint**: T002–T011 written and failing for the right reasons: the screen still reads *Run r-1*, sets no crumb, has no `progressbar`, imports `result-outcome-badge.tsx`, renders the native `<dialog>`, `<select>` and `<table>`, and says *instrument*. T006 passes, because the delivered `detail/` files hold no literal.

---

## Phase 3: Core Implementation

**Purpose**: Rebuild the roster, the summary, the cancel control and the screen from `ui-components`, in display labels, with no request or cadence change.

- [ ] T012 Rewrite `web/src/screens/runs/detail/instrument-roster.tsx` (the file name stays, DAC-E7-13). Keep `groupByInstrument`, `InstrumentGroup`, `DATA_TYPE_ORDER` and `DATA_TYPE_LABEL` as delivered.
  - Result outcomes (Open Gap 2): export `RESULT_OUTCOME_ORDER: readonly ResultOutcome[] = ["failed", "not_found", "skipped", "unchanged", "written"]`. Export `resultOutcomeStatus(outcome): { tier: Tier; label: string }`, a `switch` with a `never` default. `failed` and `not_found` return `tierOf` / `labelOf` of `{ of: "result", outcome }`. `written` returns `good` *Written*, `unchanged` returns `good` *Unchanged*, and `skipped` returns `warning` *Skipped* (DEC-0015).
  - `detailText(row, symbol)`: `Downloading ${what} for ${symbol} failed: ${row.reason ?? "No reason was recorded."}`, and for `not_found`, `Downloading ${what} for ${symbol}: not found at the provider.` plus the reason when present. `what` is the data type label lowercased.
  - Export `NOT_FOUND_SENTENCE = "The provider doesn't recognise this symbol. Downloading again won't help; stop following it or follow a different symbol."`, verbatim from owner-web-app 2.3.
  - `InstrumentRoster({ results })` renders `<section aria-label="Stocks in this download"><DataTable variant="expandable" rowHeader getRowId={(g) => String(g.instrumentId)} data={groupByInstrument(results)} columns={…} renderExpansion={render} getRowLabel={(g) => g.symbol} /></section>`. `DataTable` takes no label; the roster has no visible heading of its own, so the section names it with `aria-label` (DEC-0307).
  - Columns: *Stock* is the row header and holds `<Link to={`/data/coverage?symbol=${encodeURIComponent(g.symbol)}`}>{g.symbol}</Link>`. *Outcomes* holds one `<StatusBadge tier label>` per distinct outcome, in `RESULT_OUTCOME_ORDER`.
  - `render(g)`: when any row is `not_found`, a paragraph with `NOT_FOUND_SENTENCE` and `<Button asChild variant="outline"><Link to="/data">Open Data health</Link></Button>`. Then a `ul` with one `li` per data-type row, in `DATA_TYPE_ORDER`: the data type label, its `StatusBadge` and `detailText`. Every value is a React text child, never markup.
  - Remove `busy`, `expanded` and `onToggle`: expansion is the data table's own state, kept across polls by `getRowId`.
  - Doc comment cites owner-web-app 2.3 and 10, UX design 1.8, DAC-E7-5, DAC-E7-8, DAC-E7-11, AC-14 and DEC-0015. No unit or hex literal anywhere in the file, comments included (T006 scans it).
  - Depends on T005, T008, T009 (makes the roster cases of T007–T009 and T011 pass)
- [ ] T013 Rewrite `web/src/screens/runs/detail/run-summary.tsx`.
  - Export `INTERRUPTED_SENTENCE` (owner-web-app 2.3, verbatim) and `RECOVERY_SENTENCE = "Download again; data already stored is never duplicated or overwritten."` (UX design 1.8 *Interaction Flows*). These replace `RERUN_SENTENCE` and the import of `ABANDONED_EXPLANATION`.
  - Render `<Card variant="summary" role="region" aria-label="Download summary">` holding, in order:
    - `<StatusBadge tier={tierOf(s)}>{labelOf(s)}</StatusBadge>` for `s = { of: "download", state: run.state }`;
    - for `abandoned`, `INTERRUPTED_SENTENCE` then `<StartRunControl label="Download now" />` (DEC-0395);
    - a `CardSummaryList` with `Requested`, `Started` and `Ended`, each `formatInstant(iso)`, or `<Absent label="Not recorded" />` when null, then `Stocks downloaded` `formatCount(counts.instrumentsWritten)` and `Stocks failed` `formatCount(counts.instrumentsFailed)`;
    - while `run.state` is `running` or `cancelling`, an `aria-live="polite"` block with `<p id={labelId}>` reading `${formatCount(done)} of ${formatCount(total)} stocks`, or `Starting the download` when `total` is 0, then `<Progress value={total === 0 ? null : done} max={total === 0 ? null : total} aria-labelledby={labelId} />`. Here `done = counts.instrumentsWritten + counts.instrumentsFailed` and `total = counts.instrumentsNamed` (DEC-0394). No estimate;
    - the counts line `RESULT_OUTCOME_ORDER.map(o => `${resultOutcomeStatus(o).label} ${formatCount(counts.resultsByOutcome[COUNT_KEY[o]])}`).join(" · ")`;
    - `Last updated ${formatClock(fetchedAt)}` at `text-xs`;
    - `<CancelRunControl key={run.runId} …>`, unchanged in its props;
    - for `failed` or `partial`, `RECOVERY_SENTENCE` and `<StartRunControl label="Download now" />`.
  - Remove the imports from `../outcome-badge`, `./result-outcome-badge` and `../../../app/status-region`. That module's `formatTimestamp` goes, and CAP-003-E3-S6 deletes the module. The doc comment cites UX design 1.8, DAC-E7-8, DEC-0214 and the three provisional decision IDs (DEC-NNNN) from Open Gaps, with no literal.
  - Depends on T004, T008, T009, T012 (makes T004 and the summary cases of T007–T009 and T011 pass)
- [ ] T014 Rewrite `web/src/screens/runs/cancel-run.tsx` onto `ConfirmDialog`. Keep `CancelRunControl`'s props, its settle logic (`settled`, `alreadyCompleted`, null once the `state` prop moves past `requested` / `running`) and the `cancelAcquisitionRun` call exactly as delivered (AC-17).
  - The trigger is `<Button variant="secondary" onClick=…>Cancel download</Button>`.
  - The dialog is `<ConfirmDialog open={open} onOpenChange={setOpen} title={queued ? "Cancel this queued download?" : "Stop this download?"} description={…owner-web-app 2.3 verbatim…} confirmLabel={queued ? "Cancel download" : "Stop download"} onConfirm={() => void confirm()} pending={submitting}>`. Its `children` are the `role="alert"` failure line `Couldn't cancel this download: ${message}.` when `error` is set, with no request id and no run id (DEC-0396).
  - The settled output is `<output>` with `This download had already finished.` when `alreadyCompleted`, then `<StatusBadge>` over `tierOf` / `labelOf` `{ of: "download", state }`.
  - Replace `isRunState` and `OutcomeBadge` from `./outcome-badge` with a module-local `isRunState`, a type guard over a `Record<RunState, true>` literal so a new state fails the type-check. Delete the hand-built `CancelRunDialog`, its focus trap and its Escape handling, which Radix supplies (owner-web-app 4).
  - The doc comment cites owner-web-app 2.3 and 3, DAC-E7-8, DAC-E7-9 and dialog `confirm`, never `destructive`.
  - Depends on T010 (makes T010 pass)
- [ ] T015 Rewrite `web/src/screens/runs/detail/index.tsx`. Keep `RUN_DETAIL_POLL_INTERVAL_MS = 10_000`, the request-building effect, the cursor stack, the `reloadToken` retry, the chained `setTimeout` poll and its stop rules exactly as delivered (AC-17, DAC-E7-S5-7).
  - Keep `useParams().runId` and the `key={runId}` remount (Resolved Conflict 1).
  - Replace `isNonTerminalRunState` with a module-local `isNonTerminal(state)` over `requested`, `running` and `cancelling`.
  - Title: `const name = latest === null ? null : formatDownloadName(latest.detail.run.startedAt, latest.detail.run.requestedAt)`. `const { setTitleDetail } = useShell()`. One effect, `useEffect(() => { if (name !== null) setTitleDetail(name); }, [name, setTitleDetail])`, and a separate unmount effect, `useEffect(() => () => setTitleDetail(null), [setTitleDetail])`. The `h1` (`text-xl`) reads `name ?? "Download"`.
  - Before the first answer, a skeleton summary `Card` `summary` with `aria-busy="true"`.
  - Filter: `<Select value={outcome === "" ? "all" : outcome} onValueChange={(v) => changeFilter(v === "all" ? "" : (v as ResultOutcome))}>`. `SelectTrigger variant="inline"` is labelled by a visible `Outcome` span through `aria-labelledby`. Items are `all` *All*, then `RESULT_OUTCOME_ORDER` with `resultOutcomeStatus(o).label`.
  - The polite count reads `${shown} stocks shown`.
  - The roster region is `<StateRegion state={screenState} onRetry={reload} renderers={{…}} />` with:
    - `loading`: skeleton rows (`h-row` blocks);
    - `"empty-never-populated"`: `{ notApplicable: "A download exists once its detail opens; an unknown id is an error (UX design 1.8 States)" }`;
    - `"empty-no-match"`: *No stock in this download matches this filter.* with `<Button variant="outline">Reset filter</Button>`;
    - `populated`: the roster, or *No stock results have been recorded for this download yet.* when `results` is empty, then the delivered pager (*Previous page*, *Page n*, *Next page*), with `Button` `outline`;
    - `partial`: `{ notApplicable: "The download's own Partial outcome is its state badge; no check runs here" }`;
    - `unavailable`: `{ notApplicable: "No precondition gates reading a download" }`;
    - `error`: `` (s) => `Couldn't read this download's stocks: ${s.message}.` ``;
    - `unreachable`: `{ notApplicable: "The shell replaces the main region (AC-23)" }`.
  - The summary from `latest` stays rendered above in every state after the first answer. Remove the `../outcome-badge` and `./result-outcome-badge` imports.
  - Depends on T002, T003, T007, T009, T011, T012, T013 (makes them pass)
- [ ] T016 Delete `web/src/screens/runs/detail/result-outcome-badge.tsx` and `web/src/screens/runs/detail/result-outcome-badge.test.tsx`. CAP-003-E1-S5's `tiers.test.ts` and `status-badge.test.tsx` carry the tier assertions for `failed` / `not_found` (owner-web-app 2.1). T008 (2) carries `written`, `unchanged` and `skipped`. Depends on T012, T013, T015 (makes T005 pass)

**Checkpoint**: T002–T011 pass; `detail/` holds no literal and no `outcome-badge` reference; the detail renders only `ui-components` and patterns.

---

## Phase 4: Integration

**Purpose**: Prove the screen works under the registered route, and that nothing outside the story's files changed behaviour.

- [ ] T017 Run, unchanged, CAP-003-E3-S4's `web/src/app/routes.test.tsx` and `titles.test.tsx`. They stub the screen and must stay green. Then run the whole Vitest suite. Confirm with `git diff --stat` that the changed files are exactly these: `detail/index.tsx`, `instrument-roster.tsx`, `run-summary.tsx`, `cancel-run.tsx`, `run-detail.test.tsx`, `run-detail.polling.test.tsx`, `run-detail.reason.test.tsx`, `run-detail.crumb.test.tsx`, `cancel.test.tsx`, `web/src/components/token-literals.test.ts`, and the two deleted files. `web/src/api/types.ts`, `web/src/api/client.ts`, `run-controls.tsx`, `outcome-badge.tsx`, `package.json` and `web/src/test-setup.ts` are untouched. `grep -rn "getAcquisitionRun\|cancelAcquisitionRun\|startAcquisitionRun" web/src/screens/runs/detail web/src/screens/runs/cancel-run.tsx` shows the same call sites, with the same arguments, as T001's baseline (traces to AC-17, DAC-E7-S5-7)

**Checkpoint**: Whole suite green; the request set and cadence are those CAP-001 delivered.

---

## Phase 5: Polish

**Purpose**: Validation commands, the mutation run and the TDD evidence.

- [ ] T018 From the repo root run `npm run lint` and `npm run format`. Fix formatting with `npx biome format --write` on this story's files only. Then run `npx tsc --noEmit`, which checks the `StateRenderers` map in T015, the `never` defaults in T012 and the `Record<RunState, true>` in T014. Then run `npm run build`. Then run `python3 scripts/mutation-run.py run` from the harness over `detail/index.tsx`, `instrument-roster.tsx`, `run-summary.tsx` and `cancel-run.tsx`, with `--command "npx vitest run web/src/screens/runs"` and the hand-written mutants in Other Notes. No non-equivalent mutant may survive (traces to AC-12, AC-14, AC-17, AC-20, AC-26)
- [ ] T019 Manual checks:
  - (a) TC-COMP-214 step 3: write `export const planted = "12px";` into a temporary `web/src/screens/runs/detail/planted.tsx`. `npx vitest run web/src/components/token-literals.test.ts` fails naming that file. Delete the file.
  - (b) Against the built app (`npm run build`, served by the API), open `/data/downloads/<a real run id>`. The top bar reads *Data health › Downloads › Download {start time}* once CAP-003-E3-S6's top bar exists. Until then, read it through the React tree. Tab to **Cancel download** on a running download and complete the cancel with the keyboard only.

  (traces to DAC-E7-S5-4, DAC-E7-8, AC-25)
- [ ] T020 After each TDD cycle in T002–T019 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E7-S5-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned. Cycles:
  - (1) the roster: T005, T008 (2), T009's roster and Not found cases, T012, T016;
  - (2) the summary and the cancel control: T004, T008 (1) and (3), T010, T013, T014;
  - (3) the screen: T002, T003, T006, T007, T009's remaining cases, T011, T015.

  T017–T019 add no behaviour and join cycle 3's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S2 | hard | **Added to the graph.** The outcome filter imports `Select`, `SelectTrigger`, `SelectValue`, `SelectContent` and `SelectItem` from `web/src/components/ui/select.tsx`. CAP-003-E1-S2 vendors that file. Owner-web-app 10 and UX design 1.8 map the detail's outcome filter to `select` `inline`. The story's own Dependencies list omits it |
| CAP-003-E3-S2 | hard | **Added to the graph.** `run-detail.crumb.test.tsx` (T003) imports `HealthProvider` from `web/src/app/health.tsx`, which CAP-003-E3-S2 creates. `ShellProvider` must sit inside it. It is already reached through CAP-003-E3-S3, and is now recorded |
| CAP-003-E7-S4 | reverse | E7-S4 deletes `web/src/screens/runs/outcome-badge.tsx` "once no caller remains" and says `detail/result-outcome-badge.tsx` "is E7-S5's". That file and the detail's own files import from `outcome-badge.tsx`, so E7-S4's deletion needs this story first. This plan removes every detail and `cancel-run.tsx` import of it (T005, T013–T015). Since E7-S5 cannot depend on E7-S4 without a cycle, this plan also takes over `cancel-run.tsx` and `cancel.test.tsx`, which E7-S4's file list names, because their only consumer is this screen and they deliver this story's DAC-E7-8 and DAC-E7-9 (Other Notes). `StartRunControl` (`run-controls.tsx`, E7-S4's) is consumed as delivered, with an explicit `label`. The graph should carry `CAP-003-E7-S4 → CAP-003-E7-S5` on E7-S4's line, which this plan may not edit (reported to the coordinator) |
| CAP-003-E7-S6 | reverse | Its vocabulary sweep renders this screen in every state; graph edge E7-S6 → E7-S5 present |
| CAP-003-E7-S7 | reverse | The delivered e2e specs (`cancel-run.spec.ts`, `run-detail.spec.ts`, `diagnose-failure.spec.ts`, `unrecognised-instrument.spec.ts`) follow this screen's new labels; graph edge E7-S7 → E7-S5 present |
| CAP-003-E7-S2 | context | This screen's symbol links target `/data/coverage?symbol={SYMBOL}`, whose seeding E7-S2 builds. The link is asserted as a path, and nothing is imported |
| CAP-003-E6-S7 | context | Registers `/data`. **Open Data health** is asserted as a path here (story Description) |
| CAP-003-E3-S6 | hard | **Added to the graph.** `useShell()` throws outside `ShellProvider` (DEC-0326), and only E3-S6's `shell.tsx` rewrite mounts `ShellProvider` in the running app; after E3-S4 the routes still render inside the delivered `shell.tsx`. Without E3-S6, the rebuilt detail (T015) throws at `/data/downloads/:runId` in the product and in every e2e spec that opens it. E3-S6 also renders the crumb this screen sets (T019 (b)), and deletes `web/src/app/status-region.tsx`, whose `formatTimestamp` the delivered `run-summary.tsx` imports (removed by T013). Same finding as CAP-003-E7-S1's plan |
| CAP-003-E3-S7 | context | The download-finished toast is the shell's and is suppressed on this route (story Description). This screen raises no toast |

### Task Dependencies

- T001: No dependencies
- T002, T004, T005, T007, T008, T009, T011: same file (`run-detail.test.tsx`), sequential in that order after T001; T009 also edits the polling and reason files
- T003, T006, T010: different files, parallel with the `run-detail.test.tsx` chain
- T012: Depends on T005, T008, T009
- T013: Depends on T004, T008, T009, T012 (imports `RESULT_OUTCOME_ORDER`, `resultOutcomeStatus`)
- T014: Depends on T010; parallel with T012 and T013
- T015: Depends on T002, T003, T007, T009, T011, T012, T013
- T016: Depends on T012, T013, T015
- T017: Depends on T014, T016
- T018: Depends on T017
- T019: Depends on T018
- T020: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- Phase 2: `run-detail.crumb.test.tsx` (T003), `token-literals.test.ts` (T006) and `cancel.test.tsx` (T010) in parallel with the `run-detail.test.tsx` chain
- Phase 3: `cancel-run.tsx` (T014) in parallel with `instrument-roster.tsx` (T012) and `run-summary.tsx` (T013)

---

## Validation Plan

### Constitution-Defined Commands

(`docs/constitution/tech-stack.md` v7 Validation Commands, working directory `.`)

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test` (Vitest; also drives a real Vite build)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`
- Focused: `npx vitest run web/src/screens/runs web/src/components/token-literals.test.ts`

### Story-Specific Validation

- DAC-E7-S5-1 / DAC-E7-8: T002 and T003 pass. The real chain reads *Download* before the read, *Download 2026-10-15 17:31 CDT* after it, and *Download* after unmount.
- DAC-E7-S5-2: T004 passes for 0 named (indeterminate, no `aria-valuenow`) and for 120 named with 40 done (`aria-valuenow="40"`). No estimate text appears.
- DAC-E7-S5-3 / DAC-E7-5: `ls web/src/screens/runs/detail` lists `index.tsx`, `instrument-roster.tsx` and `run-summary.tsx` only. `grep -rn "outcome-badge" web/src/screens/runs/detail web/src/screens/runs/cancel-run.tsx` prints nothing.
- DAC-E7-S5-4: `token-literals.test.ts` passes with `web/src/screens/runs/detail/` in `SCANNED_DIRECTORIES`. The T019 (a) plant fails it naming the file.
- DAC-E7-S5-5: T007 passes in all eight renders. The sweep regex matches neither `running` nor `Downloading`, both of which the screen shows (whole words). The positive deltas are literal.
- DAC-E7-S5-6: T008 passes. Every status element is `[data-variant^="status-"]` with text and one `aria-hidden` shape. No `coverage-unknown` appears.
- DAC-E7-S5-7 / AC-17: T009 and T010 pass. T017's diff and grep show the same three client calls with the same arguments, and the 10 000 ms constant is unchanged.
- AC-25: T010's keyboard-only cancel passes for both dialogs, and T019 (b) repeats it by hand.
- Plan self-consistency: T007's `FORBIDDEN` regex does not match any string a task requires. *Download now*, *Downloading*, *downloaded*, *Download again*, *Stopping*, *stocks*, *Cancelled by you*, *Open Data health* and *Starting the download* all pass it. The literal scan matches no class a task writes: `h-row`, `text-xs`, `text-xl` and `gap-*` hold no length unit. Code identifiers that keep domain terms (`runId`, `RunDetailScreen`, `instrumentId`) are not user-visible, so the sweep, which reads text and accessible names only, does not see them (DAC-E7-13).

---

## Notes

### Resolved Conflicts

1. **Route parameter name: `:id` vs `:runId`.** Capability AC-17, owner-web-app 2.3 and this story write `/data/downloads/:id`. Epic DAC-E3-3 writes `:runId`, and the delivered screen reads `useParams().runId`. CAP-003-E3-S4's plan registers `path="/data/downloads/:runId"` (its Resolved Conflict 1). The URL is the same and only the internal parameter name differs. This plan keeps `useParams().runId` and tests under `/data/downloads/:runId`. Governing: epic DAC-E3-3 as CAP-003-E3-S4 implements it.
2. **Crumb text: static vs set by the screen.** System design §3.5 note 4 shows a static *Data health › Downloads › Download*. Epic DAC-E7-8, owner-web-app 2.3 and DEC-0214 have the screen call `setTitleDetail(formatDownloadName(...))` after the read and `null` on unmount, with *Download* only before the read. Governing: epic DAC-E7-8 (an epic AC outranks design prose).
3. **The download's name: interim vs permanent.** Owner-web-app 3 (bullet 3) and 14 (question 2) still call the start-time name interim. Capability OQ-1 was answered by the owner on 2026-10-25: the start time is the permanent name. Governing: capability OQ-1. The `h1` uses `formatDownloadName` with no fallback copy.
4. **Reason-line data type word.** UX design 1.8's example reads *Downloading daily prices for KO failed: …*. DAC-E7-4 keeps *Prices* as a display label, and the story's delta is only *acquiring* → *downloading*. Governing: the story's DAC-E7-4 and Description over the UX example. The line uses the data type label lowercased (*prices*), as delivered.
5. **Cancel dialog wording.** The delivered `cancel-run.tsx` reads *Stop this run?*, *Cancel queued run* and *Instruments already acquired …*. DAC-E7-8's "keep their wording" means CAP-001 v5's wording with the display labels substituted (UX design 1.8: "v5's wording with the display labels substituted (AC-19)"). Owner-web-app 2.3 states that wording verbatim. Governing: owner-web-app 2.3 and UX design 1.8 verbatim (T010, T014).
6. **Expander name.** Owner-web-app 10 says "the expander named for its row (*Expand AAPL*)". The delivered name is *Show data types for …*. CAP-003-E1-S4's `data-table` builds the expander and names it *Expand {getRowLabel(row)}*, with `aria-expanded` carrying open or closed (DEC-0307, owner decision 2026-11-07). The requirement is that the expander is named for its row, and the parenthetical is an example. This screen passes `getRowLabel={(g) => g.symbol}`, so the expander reads *Expand AAPL*, and does not override the component. Governing: owner-web-app 10's requirement, with the name from `ui-components`.
7. **Strings UX design 1.8 does not restate.** Strings such as *{n} stocks shown*, *No stock results have been recorded for this download yet.* and the *Stock* column are v5 strings relabelled by substituting the STD-UI-1 display labels. This is the rule UX design 1.8 states for the cancel wording and UX design 0.7 states for every string. Governing: UX design 0.7 and 1.8. No new wording is invented.

### Open Gaps

1. **What *{done}* and *{total}* are on the detail, and the bar's label while the total is unknown. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0394.**
   - *What is undetermined.* DAC-E7-8 and DAC-E7-S5-2 require *{done} of {total} stocks* polled at the detail's 10 s, with `indeterminate` while the total is unknown. System design assumption 3 and data-health-reader 2.6 define `done` as "instruments with a result for all four data types" only for attention's `latest_download`. The detail's endpoint, which this story may not change (story API Contract; constraint 2), carries `counts.instrumentsNamed`, `instrumentsWritten`, `instrumentsFailed` and per-result counts, and no artifact maps them to *done*. No artifact gives the visible text the indeterminate `progressbar` is labelled by. CAP-003-E1-S3 requires a visible label.
   - *Adopted (T004, T013).*
     - `done = counts.instrumentsWritten + counts.instrumentsFailed` and `total = counts.instrumentsNamed`.
     - A total of 0 renders `indeterminate`, labelled *Starting the download*.
     - The bar shows while the state is `running` or `cancelling`.
   - *Derivation.*
     - CAP-001 v5 §1.5 *Progress*: "instruments completed against instruments named".
     - The delivered summary line reads exactly those three counts from the same response.
     - Reading the detail's own response keeps the delivered single request and 10 s cadence (AC-17). Attention's `progress` covers only the most recently requested download, which need not be the one on screen.
     - *Starting the download* states what is true while no stock has been named yet (STD-UI-2): a runner claimed the download and has not counted its stocks. *Waiting* or *0 of 0* would describe something else (data-health-reader 2.6).
     - The bar is hidden for `requested`: a queued download is not working (v5 "while the run is active").
   - *Known consequence.* `acquisition_run.instruments_written` and `instruments_failed` have no runtime writer in the delivered back end (genuine gap 1), so until CAP-001 writes them the bar reads *0 of N* and advances only at the end.
   - *Alternatives rejected.*
     - Attention's `latest_download.progress` when its `run_id` matches. That is wrong for a running download behind a newer queued one, and it adds a second source for one figure.
     - `sum(resultsByOutcome) / 4`. That counts results, not stocks.
   - *Owning design:* `component-design-owner-web-app.md` 2.3 *Download detail*, at its next revision.
2. **Per-data-type outcomes outside the tier table.** Ui-components 2.3's `Status` has a `result` member only for `failed` and `not_found`. The roster also renders `written`, `unchanged` and `skipped` (UX design 1.8 Component Mapping: `status-good` / `status-warning` / `status-critical`). DAC-E7-5 requires them through `StatusBadge`.
   - *Not provisional.* Their tiers and labels are fixed by CAP-001's DEC-0015 (applied, owner upheld): *Written* good, *Unchanged* good, *Skipped* warning, with the failure-first order. The delivered `result-outcome-badge.tsx` held exactly that table.
   - *Adopted (T012).* `resultOutcomeStatus` delegates `failed` and `not_found` to `tierOf` / `labelOf`, and returns DEC-0015's rows for the other three, rendered through `StatusBadge`.
   - *Owning design:* `component-design-ui-components.md` 2.3 should add the three rows to `Status` at its next revision, and this function then becomes one `tierOf` call.
3. **The recovery button's label. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0395.**
   - *What is undetermined.* The delivered detail offers **Re-run acquisition** on a failed or partial download and the default **Start acquisition run** on an interrupted one. Both contain a forbidden term (DAC-E7-S5-5). No artifact gives the detail's replacement: UX design 1.8 gives only the sentences *Download again; data already stored is never duplicated or overwritten.* and *… Download again to continue.*
   - *Adopted (T009, T013).* **Download now** in both places, with the sentence beside it.
   - *Derivation.*
     - The action is exactly **Download now**'s: `StartRunControl`, `POST /api/acquisition-runs` with no body.
     - DAC-E7-4 maps **Start acquisition run** → **Download now**.
     - UX brief §2.5 (S09 Data health) *Needs fixing* pairs the same recovery sentence (*Download again to retry; …*) with a **Download now** button. That is the same recovery for the same failure on Data health.
   - *Alternative rejected.* **Download again**: it would be a second label for one action.
   - *Owning design:* `component-design-owner-web-app.md` 2.3 *Download detail*, or UX design 1.8, at its next revision.
4. **The cancel failure line. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0396.**
   - *What is undetermined.* The delivered line *Cancelling run {runId} failed: {error} (request {id})* shows a raw run id (DAC-E7-10) and a request id, which UX design 0.7 forbids ("`request_id` is never shown"). No artifact gives the replacement.
   - *Adopted (T010, T014).* *Couldn't cancel this download: {reason}.*, inside the open dialog as `role="alert"`.
   - *Derivation.* It has UX design 0.7's three parts: the operation, the download (named by context, since the dialog is about this download) and the reason. It takes the *Couldn't {verb} …: {reason}.* form every CAP-003 error uses: owner-web-app 8 item 7 *Couldn't start the download: …*, and UX design 1.8 *Couldn't read this download's stocks: {reason}.*
   - *Owning design:* `component-design-owner-web-app.md` 2.3, at its next revision.

### Genuine gaps flagged for other owners (no plan change)

1. **`instruments_written` / `instruments_failed` are never written at runtime.**
   - `grep` finds the two columns only in `src/factorflow/db/migrations/0004_runs.sql` (defaults 0), `runs/queries.py` (reads), `api/routes/runs.py` (copies) and test fixtures. `runs/journal.py` updates only `instruments_named` and `state`.
   - The detail's *Stocks downloaded*, *Stocks failed* and progress therefore read 0 in a real run, as do E7-S4's columns. This is a CAP-001 back-end defect outside E7's scope (constraint 2: endpoints unchanged).
   - Owner: CAP-001's run journal. CAP-003 system design assumption 3 should note it at its next revision.
2. **Story file ownership inside E7.**
   - E7-S4's Implementation list names `cancel-run.tsx` and `cancel.test.tsx`, yet their only consumer is this screen. Every acceptance criterion they deliver (DAC-E7-8 cancel wording and outcomes, DAC-E7-9 `dialog` `confirm`, *Stopping* through `StatusBadge`) is this story's.
   - E7-S4's deletion of `outcome-badge.tsx` needs this story's files cleaned first.
   - `dependencies.yaml` has no edge between E7-S4 and E7-S5. If the two are coded concurrently, they will conflict in those two files.
   - Owner: the E7 backlog (story split, DEC-0227). The coordinator should add `CAP-003-E7-S4 → CAP-003-E7-S5` on E7-S4's line.

### Other Notes

- **Who edits `cancel-run.tsx`.** This plan rebuilds it in place (T014) and relabels `cancel.test.tsx` (T010). It leaves `outcome-badge.tsx` for E7-S4 to delete and does not import from it. If E7-S4 lands first and already did this, T010 and T014 reduce to verifying the result.
- **`StartRunControl` stays E7-S4's.** It is consumed as delivered with an explicit `label="Download now"`. Its post-start `navigate("/runs/…")` reaches the detail through CAP-003-E3-S4's legacy redirect until E7-S4 retargets it. Its refusal, queued and failure sentences (*…before acquiring*, *Starting an acquisition run failed*) appear only after a click, and E7-S4 relabels them. T007's states do not click it.
- **Expansion state** moves from the screen into `DataTable` (keyed by `getRowId`, `autoResetExpanded: false`). It survives polls and pages because the populated renderer keeps the same `DataTable` mounted. A filter that empties the page unmounts it, so an expansion is not restored after *Reset filter*. The delivered screen kept it. No accepted CAP-001 test asserts that case. It is recorded here rather than worked around.
- **`setTitleDetail` call count.** The name is computed from `startedAt ?? requestedAt`. A queued download that starts while the screen is open legitimately renames itself once, which is a second call. DAC-E7-S5-1's "once" is tested on a running download (T002), where the name cannot change.
- **No `NotDeterminable` on this screen.** Every status here is known from the read. A total still unknown is an `indeterminate` bar, not a presence value. TC-COMP-216's "not determinable through `NotDeterminable`" clause therefore has no instance, and T008 (4) asserts that no `coverage-unknown` appears.
- **Symbol links and the Data health link are asserted as paths.** `/data/coverage?symbol=` is seeded by CAP-003-E7-S2 and `/data` is registered by CAP-003-E6-S7; neither module is imported.
- **No toast here.** The download-finished toast is CAP-003-E3-S7's shell watcher and is suppressed on this route; this screen raises none.
- **E2E follows.** CAP-003-E7-S7 relabels the delivered e2e specs that drive this screen (*Cancel download*, *Stop download*, *Downloading …*).
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `web/src/screens/runs/detail/run-summary.tsx`: `counts.instrumentsWritten + counts.instrumentsFailed` → `counts.instrumentsWritten`
  - `web/src/screens/runs/detail/run-summary.tsx`: `total === 0 ? null : done` → `done`
  - `web/src/screens/runs/detail/index.tsx`: `formatDownloadName(run.startedAt, run.requestedAt)` → `formatDownloadName(run.requestedAt, run.requestedAt)`
  - `web/src/screens/runs/detail/index.tsx`: `useEffect(() => () => setTitleDetail(null), [setTitleDetail])` → removed
  - `web/src/screens/runs/detail/instrument-roster.tsx`: `case "skipped": return { tier: "warning"` → `{ tier: "good"`
  - `web/src/screens/runs/cancel-run.tsx`: `confirmLabel={queued ? "Cancel download" : "Stop download"}` → `confirmLabel={queued ? "Stop download" : "Cancel download"}`
  - `web/src/screens/runs/cancel-run.tsx`: `` `Couldn't cancel this download: ${message}.` `` → `` `Couldn't cancel download ${runId}: ${message}.` ``
