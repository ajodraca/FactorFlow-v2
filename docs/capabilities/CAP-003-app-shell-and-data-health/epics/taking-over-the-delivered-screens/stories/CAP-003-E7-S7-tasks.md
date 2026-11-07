---
artifact_schema_version: 1
artifact_id: CAP-003-E7-S7-tasks
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
  timestamp: 2026-11-07T10:20:00Z
  source_artifacts:
    - id: CAP-003-E7-S7
      version: "1"
    - id: CAP-003-E7
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-web-app
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-owner-web-app-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "1"
    - id: CAP-003-E7-S1-tasks
      version: "1"
    - id: CAP-003-E7-S2-tasks
      version: "1"
    - id: CAP-003-E7-S3-tasks
      version: "1"
    - id: CAP-003-E7-S4-tasks
      version: "1"
    - id: CAP-003-E7-S5-tasks
      version: "1"
    - id: CAP-003-E3-S4-tasks
      version: "1"
    - id: CAP-003-E3-S6-tasks
      version: "1"
    - id: CAP-003-E2-S5-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E7-S7 — The Eleven Delivered End-to-End Specs and acquisition.ts Follow the New Paths and Labels

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/taking-over-the-delivered-screens/stories/CAP-003-E7-S7.md`
**Component**: `FactorFlow-v2` (Playwright suite `tests/e2e/`; design module `owner-web-app`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Re-points the eleven delivered CAP-001 end-to-end specs and their support module `tests/e2e/support/acquisition.ts` at the taken-over screens. The specs go to the new paths (`/data/coverage`, `/data/followed`, `/data/downloads`, `/data/downloads/{id}`; `/settings` is kept), and they find the screens by the new display labels. They keep proving the outcomes CAP-001 accepted (owner-web-app 2.1, 2.6, 7; epic NFR *Behaviour preserved*; DAC-E7-1, DAC-E7-12). The screens the specs drive were rebuilt from `ui-components` by CAP-003-E7-S1 to CAP-003-E7-S5, which also removed the DOM hooks the specs located them by: the `data-testid`s, the `coverage-present` variant, the hand-built roster rows and the native `<select>`. The data-table also adds a leading expander cell. So some locators change for a component reason as well as a label or a path. Every asserted outcome value is unchanged apart from its label: dispositions, refusals, cancellation states, coverage rows, the unrecognised-symbol diagnosis and the count of assertions. A new Vitest guard, `web/src/screens/e2e-journeys.test.ts`, holds the twelve files to it statically: no old path, no old label, no retired hook, and the same number of assertions per file. The guard is needed because the legacy redirects (CAP-003-E3-S4) would let a spec that still used `/runs` pass at run time (AC-18). `acquisition-stack-stub.spec.ts` is untouched. No production file changes.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-17 | Every action, confirmation and refusal CAP-001 accepted remains available through the shell with the same outcome | T003, T005, T006, T007, T008, T009, T010, T011, T013, T014, T015, T016, T017, T018, T020 |
| AC-18 | Every `page.goto` uses the new paths, so no spec depends on the legacy redirects | T002, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017 |
| AC-19 | Every locator uses the display labels | T002, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017 |
| DAC-E7-1 | The five screens open at their new paths; the specs reach them there | T005, T007, T010, T013, T016, T017, T018 |
| DAC-E7-12 | The eleven specs and `tests/e2e/support/acquisition.ts` follow the new paths and labels as owner-web-app 2.6 lists | T002–T017 |
| DAC-E7-S7-1 | `grep` for `goto("/coverage")`, `goto("/instruments")`, `goto("/runs")` and **Add instrument**, **Retire**, **Start acquisition run**, *Provider credential* matches nothing | T002, T012, T019 |
| DAC-E7-S7-2 | Outcome assertions (dispositions, refusals, cancellation states, coverage rows, the unrecognised-symbol diagnosis) are byte-for-byte the delivered ones apart from labels and paths | T003, T012, T018, T020 |

Mapped test cases (`tests/component/owner-web-app-tests.md`; `tests/coverage-matrix.md` lines 362–363 and the per-story count "2 of 2" at line 439): **TC-COMP-221** (DAC-E7-S7-1, AC-18, AC-19) and **TC-COMP-222** (DAC-E7-S7-2, AC-17). The test specification is `status: draft`, and its steps are greps and a diff. They are sharpened below into a durable Vitest guard (T002–T004, T012) plus a diff classification against the label map in Other Notes (T020). The other epic-level DAC-E7-12 cases belong elsewhere. TC-COMP-065 is `client.ts` and owner-shell's. TC-COMP-220 is the `requestJson` import, which belongs to CAP-003-E7-S6. TC-INT-040 ("the eleven delivered journeys pass at the new paths") is an integration specification whose automation is Phase 6b's; the full run in T018 is the evidence it will cite.

## Phase 1: Setup

**Purpose**: Confirm the screens, routes, shell and router this story depends on are in the tree, record the baseline, and capture the e2e RED.

- [ ] T001 From the repo root, confirm the hard dependencies have landed before editing anything (no file is changed by this task; traces to AC-17, DAC-E7-1):
  - **CAP-003-E3-S4.** `web/src/app/routes.tsx` registers `/data/coverage`, `/data/followed`, `/data/downloads`, `/data/downloads/:runId` and `/settings`, and `web/src/app/legacy-redirects.tsx` exists.
  - **CAP-003-E3-S6.** `web/src/app/shell.tsx` mounts `ShellProvider` and renders a `main` element, and `web/src/app/status-region.tsx` is gone.
  - **CAP-003-E2-S5.** `src/factorflow/api/app.py` includes `data_health.router`.
  - **CAP-003-E7-S1.** `web/src/screens/settings/` names the depth field *History depth* with the `years` suffix.
  - **CAP-003-E7-S2.** `web/src/screens/coverage/copy.ts` exports `NEVER_DOWNLOADED`, and `coverage-table.tsx` renders `DataTable` with `expansion`.
  - **CAP-003-E7-S3.** `web/src/screens/instruments/add-field.tsx` labels the field *Symbol of the stock to follow*.
  - **CAP-003-E7-S4.** `web/src/screens/runs/run-controls.tsx` defaults to *Download now*, and `web/src/screens/runs/outcome-badge.tsx` is gone.
  - **CAP-003-E7-S5.** `web/src/screens/runs/detail/run-summary.tsx` holds `aria-label="Download summary"`, and `detail/result-outcome-badge.tsx` is gone.
  - **Retired hooks.** `grep -rn 'data-testid="\(outcome-badge\|result-outcome-badge\|presence-badge\|lifecycle-badge\)"' web/src` prints nothing.
  - **Install and baseline.** Run `npm ci` and `npx playwright install chromium`. Confirm `npx playwright --version` is at least 1.44, for `toHaveAccessibleName` and `locator.or` (the lockfile pins 1.63.0). Record `BASE=$(git rev-parse HEAD)` for T020.
  - **RED.** Run `npm run test:e2e` and keep its failure list as the RED evidence for T021. Expect the eleven specs to fail at their old paths, labels or hooks. Expect `acquisition-stack-stub.spec.ts` to pass. If no container runtime is available, record the exclusion. Never report a partial run as green (tech stack v7 notes).
  - **If a check fails.** Stop and report the missing story; do not plan around it.

**Checkpoint**: Every upstream screen, route and router is present; the baseline commit is recorded; the e2e RED is captured; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the static guard that fails while any of cycle 1's files still holds an old path, old label, retired hook or a changed assertion count.

The guard is one new file, `web/src/screens/e2e-journeys.test.ts`. Vitest's root is `web`, and the file reads the specs with `node:fs` from a root resolved through `fileURLToPath(new URL("../../../", import.meta.url))`, as `web/src/app/shell.tokens.test.tsx` does. It is a test file, so the AC-26 literal scan skips it. It holds one exported-nothing constant `FILES`, in this cycle: `tests/e2e/support/acquisition.ts`, `first-run.spec.ts`, `diagnose-failure.spec.ts`, `cancel-in-progress.spec.ts`, `coverage-empty.spec.ts`, `instrument-changes.spec.ts`, `unrecognised-instrument.spec.ts`. T012 appends the other five. Each check runs as `it.each(FILES)`, so a failure names the file.

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-221 (The eleven e2e specs hold no old path or label) in a new `web/src/screens/e2e-journeys.test.ts`, with a `// Implements TC-COMP-221` comment, under `describe("Old paths and labels (TC-COMP-221, DAC-E7-S7-1)")`. For each file, these return no match:
  - (a) the TC's `goto` step, widened to template literals: `/goto\(\s*["'\x60]\/(coverage|instruments|runs)\b/`.
  - (b) any other old screen path, in URL regexes, `RegExp` strings and `href`s: `/["'\x60]\/(coverage|instruments)\b/` and `/\/runs\b/`. The API paths `/api/coverage`, `/api/instruments` and `/api/acquisition-runs/…` start `"/api` or hold `-runs`, so they never match. Checked against the delivered files, this pattern finds exactly the `goto`s plus `diagnose-failure.spec.ts:54,106,107`, `cancel-run.spec.ts:43`, `runs-start-cancel.spec.ts:26,31` and `acquisition.ts:152`.
  - (c) the TC's label step, as case-sensitive substrings: `Add instrument`, `Retire`, `Start acquisition run`, `Provider credential`. `Retire` also catches *Retired*, which is why the comment at `instruments-add-retire.spec.ts:31` is reworded in T015.

  On the delivered files (a) fails for all seven, (b) for four and (c) for one, which is the RED (traces to DAC-E7-S7-1, AC-18, AC-19).

  Kills: the hand-written mutants in Other Notes, each restoring one delivered line. For example, `support/acquisition.ts: goto("/data/downloads") → goto("/runs")` is a `swap-case` on the path, and (a) fails. That mutant passes the e2e run, because the legacy redirect lands it on `/data/downloads`, so this guard is its only witness.
- [ ] T003 Implement TC-COMP-222 (Spec outcome assertions are byte-for-byte the delivered ones) in `web/src/screens/e2e-journeys.test.ts` (same file as T002, sequential with it), with a `// Implements TC-COMP-222` comment, under `describe("Assertion count unchanged (TC-COMP-222, DAC-E7-S7-2)")`.
  - **The count.** For each file, count `/\.(?:not\.)?(toHave\w*|toBe\w*|toContain\w*|toEqual|toMatch)\(/g`. It must equal an independent literal table of the delivered counts, measured on `BASE` at planning: `support/acquisition.ts` 6, `first-run.spec.ts` 4, `diagnose-failure.spec.ts` 20, `cancel-in-progress.spec.ts` 7, `coverage-empty.spec.ts` 3, `instrument-changes.spec.ts` 16, `unrecognised-instrument.spec.ts` 6. The coding agent re-measures on `BASE` in T001 and corrects the literal before writing the edits, never after.
  - **Why the count must not move.** No planned edit adds or removes an assertion: T016 keeps run-detail's single `toHaveCount(5)` through `locator.or`, and T017 swaps one `href` assertion for one `toHaveAccessibleName`.
  - **What it misses.** The count cannot see a changed expected value; T020's line classification covers that.
  - Green at baseline by construction; it guards the edits (traces to DAC-E7-S7-2, AC-17).

  Kills: a hand-written mutant deleting `await expect(page.getByText("Stopping")).toHaveCount(0);` from `cancel-run.spec.ts` (counted once T012 adds that file). More generally, any `remove-attribute`-like deletion of an assertion line changes the count.

### Additional Unit Tests

- [ ] T004 Add the retired-hook and old-label sweep to `web/src/screens/e2e-journeys.test.ts` (same file, sequential), under `describe("No retired hook or delivered label (AC-19, DAC-E7-12)")`. For each file, none of these case-sensitive substrings appears: `Stop acquiring`, `"Cancel run"`, `"Stop run"`, `"Cancel queued run"`, `"Re-run acquisition"`, `"Succeeded"`, `"Running"`, `"Cancelling"`, `"Cancelled"`, `/Requested/`, `/Cancelled/`, `Acquiring `, `acquired yet`, `No instrument matches`, `instrument symbol`, `History depth, in years`, `already completed`, `outcome-badge`, `presence-badge`, `lifecycle-badge`, `coverage-present`, `data types for`, `section[data-variant`, `America/Chicago`, `selectOption` (traces to AC-19, DAC-E7-12).
  - **The quoted forms are deliberate.** The new labels `"Cancelled by you"` and `/Cancelled by you/` do not contain `"Cancelled"` or `/Cancelled/`. The lowercase test titles (`… shows cancelling …`, `… succeeds …`) do not match either. The check therefore never contradicts what T005–T017 require: every replacement in the label map (Other Notes) was checked against this list.
  - **Why it exists.** Negative assertions such as `getByText("Cancelling")).toHaveCount(0)` pass vacuously when the label they name no longer exists. This sweep forces them onto the new label.

  Kills: `swap-case` restoring `"Stopping"` → `"Cancelling"` in a `toHaveCount(0)` check, a mutant the e2e run cannot kill.

**Checkpoint**: The guard runs (`npx vitest run web/src/screens/e2e-journeys.test.ts`). T002 and T004 fail for the seven cycle-1 files, and T003 passes. Nothing under `tests/e2e/` has changed yet.

---

## Phase 3: Core Implementation

**Purpose**: TDD cycle 1, the support module and the acquisition-stack specs. Re-point `acquisition.ts` and the six specs that run against the acquisition stack (`ACQUISITION_BASE_URL`, port 8125), changing only paths, labels and the locators the component change forces.

- [ ] T005 Edit `tests/e2e/support/acquisition.ts` (traces to AC-17, AC-18, AC-19, DAC-E7-12). Delivered lines 121, 136 and 150 are the three `goto`s owner-web-app 2.6 names; line 122 is the locator CAP-003-E7-S1 changed. The edits:
  - **`stateHistoryDepth`.** Keep `page.goto("/settings")`. The field becomes `page.getByRole("spinbutton", { name: "History depth years" })`. CAP-003-E1-S2's `Input` `suffix` joins label and suffix through `aria-labelledby`, under the consumed DEC-0299, and CAP-003-E7-S1 keeps save-on-blur, so the rest of the helper is unchanged.
  - **`addInstruments`.** The doc says *Followed stocks screen's add field*. It goes to `page.goto("/data/followed")`, and the field becomes `page.getByRole("textbox", { name: "Symbol of the stock to follow" })` (CAP-003-E7-S3 T015). The function name stays: identifiers are not user-visible (system design constraint 3).
  - **`startRun`.** The doc says "Starts a download from the Downloads screen, which routes to the new download's detail (UX design 1.7: **Download now** lives on Coverage and Downloads), and returns its id". It goes to `page.goto("/data/downloads")`, clicks `page.getByRole("button", { name: "Download now" })` and then expects `toHaveURL(/\/data\/downloads\/[0-9a-f-]{36}$/)`.
  - **New `export const STATUS_BADGE = '[data-variant^="status-"]'`.** Its doc comment says that CAP-003-E1-S5's `StatusBadge` renders `data-variant="status-<tier>"` on CAP-003-E1-S1's `Badge` `span` and carries no test id, and that a status is located by it and asserted by its label.
  - **`summaryOutcome`.** It becomes `page.getByRole("region", { name: "Download summary" }).locator(STATUS_BADGE)`, which is CAP-003-E7-S5's `Card` `summary`. The doc says *the download-state badge in the download detail's summary card*.
  - **`rosterExpander`.** It becomes `page.getByRole("button", { name: new RegExp(\`details for ${symbol}$\`) })`. The doc names CAP-003-E1-S4's expander, *Show details for {SYMBOL}*.
  - **`expandInstrument`.** The logic is unchanged; the doc says *one stock*.
  - **New `dataTypeRow(group: Locator, name: string): Locator`.** It returns `group.getByRole("listitem").filter({ hasText: new RegExp(\`^${name}\`) })`. CAP-003-E7-S5 T012 renders an expanded stock's data types as one `li` each, beginning with the data type label. The doc says it replaces the delivered `tr` with a `rowheader`.
  - **New `presenceBadge(cell: Locator): Locator`.** It returns `cell.locator("[data-variant]")`. A Coverage presence cell holds exactly one variant-bearing element: `StatusBadge` for present or absent, or `NotDeterminable`'s `coverage-unknown` badge (CAP-003-E7-S2 T017; CAP-003-E1-S6 T007).
  - **`coverageRow`.** The logic is unchanged; the doc says *one stock's row*.
  - **`COVERAGE_COLUMN`.** Every index shifts by one: `lifecycle: 1`, `reference: 2`, `prices: 3`, `fundamentals: 4`, `corporateActions: 5`, `coveredFrom: 6`, `coveredTo: 7`, `gaps: 8`, `depth: 9`, `lastAcquired: 10`. The doc says: "`td` cells of a Coverage row in `coverage-table.tsx` column order. Cell 0 is the data table's expander (CAP-003-E1-S4 T010: a leading expander column, the Stock row header a `th` after it)". The key names stay.
  - **Unchanged.** `waitForRunState`, the stub controls and `resetAcquisitionStore`.
  - **The count.** It stays 6, matching T003.

  Kills: `swap-case` of `run-controls.tsx`'s default label (**Download now** → any other) fails every `startRun` caller. `swap-case` of `tierOf`'s `succeeded` label (*Complete*) fails every `summaryOutcome(...).toHaveText("Complete")`. An `off-by-one` in `COVERAGE_COLUMN` (left unshifted) fails `first-run`'s `coveredTo` check, because cell 6 would be *Covered from*.
- [ ] T006 [P] Edit `tests/e2e/first-run.spec.ts` (depends on T005) (traces to AC-17, AC-18, AC-19):
  - `toHaveText("Succeeded", …)` becomes `toHaveText("Complete", …)`.
  - `page.goto("/coverage")` becomes `page.goto("/data/coverage")`.
  - `coverageCell(...).getByTestId("presence-badge")` becomes `presenceBadge(coverageCell(...))`, imported from the support module, with `toHaveAttribute("data-variant", "status-good")`. That is *present*, rendered through `StatusBadge` `good` under CAP-003-E7-S2's DEC-0387 (Open Gaps 2).
  - The `coveredFrom` / `coveredTo` assertions are byte-identical.

  Kills: `swap-case` of Coverage's present tier `good` → `neutral` (the `status-good` assertion fails).
- [ ] T007 [P] Edit `tests/e2e/diagnose-failure.spec.ts` (depends on T005) (traces to AC-17, AC-18, AC-19, DAC-E7-1):
  - **TC-E2E-002, opening the download.**
    - Line 52 becomes `page.goto("/data/downloads")`.
    - Line 53 becomes `page.locator(\`a[href="/data/downloads/${runId}"]\`).click()`. No raw run id is on any surface (DAC-E7-10), so the *Started* link is found by its path.
    - Line 54 becomes `toHaveURL(new RegExp(\`/data/downloads/${runId}$\`))`.
  - **TC-E2E-002, the data types.**
    - Lines 60–63 become `const row = dataTypeRow(group, name)` and `expect(row.locator(STATUS_BADGE)).toHaveText("Failed")`.
    - Line 66's pattern becomes `^Downloading ${name.toLowerCase()} for ${symbol} failed: \\[unavailable\\] `.
  - **TC-E2E-002, the empty Coverage.**
    - Lines 72–73's comment cites `NEVER_DOWNLOADED`.
    - Line 74 becomes `/data/coverage`.
    - Line 75 becomes `"No data has been downloaded yet."`.
  - **TC-E2E-005.**
    - Line 89 and line 108 become `"Complete"`.
    - Lines 91 and 110 become `/data/coverage`.
    - Lines 100–101 go to `/data/downloads` and click the same `href` locator for `failedRun`.
    - Line 105 becomes `page.getByRole("button", { name: "Download now" })`. This is the detail's recovery action under CAP-003-E7-S5's DEC-0395.
    - Line 106 becomes `not.toHaveURL(new RegExp(\`/data/downloads/${failedRun}$\`))`.
    - Line 107 becomes `toHaveURL(/\/data\/downloads\/[0-9a-f-]{36}$/)`.
    - Line 115 becomes `presenceBadge(...)` with `status-good`.
    - Line 121 becomes `/data/downloads`.
    - `outcomeOf(runId)` becomes `page.locator("tr", { has: page.locator(\`a[href="/data/downloads/${runId}"]\`) }).locator(STATUS_BADGE)`, with `"Complete"` and `"Failed"`.
  - **Unchanged.** `/^(Failed|Partial)$/`, `"Failed"`, the `[unavailable]` reason, both row-count checks and `dxaFrom` stay byte-identical.

  Kills: `swap-case` of `instrument-roster.tsx`'s `detailText` verb back to *Acquiring* (line 66 fails); `negate-boolean` on the summary's recovery guard (`failed`/`partial` → no **Download now**, the click at line 105 times out).
- [ ] T008 [P] Edit `tests/e2e/cancel-in-progress.spec.ts` (depends on T005) (traces to AC-17, AC-18, AC-19):
  - **Labels.** `"Running"` becomes `"Downloading"`. `"Cancel run"` becomes `"Cancel download"`. `"Stop run"` becomes `"Stop download"`, the confirm in CAP-003-E7-S5's running dialog. `"Cancelling"` becomes `"Stopping"`. `"Cancelled"` becomes `"Cancelled by you"`.
  - **Path.** `page.goto("/coverage")` becomes `page.goto("/data/coverage")`.
  - **Presence.** The two presence checks use `presenceBadge(...)` with `"status-good"`. The negative stays a negative: `not.toHaveAttribute("data-variant", "status-good")`.
  - **Unchanged.** The `coveredFrom` checks stay byte-identical.

  Kills: `swap-case` of the confirm label `Stop download` ↔ `Cancel download` in `cancel-run.tsx` (the click finds no button); `swap-case` of `cancelling`'s label (*Stopping*).
- [ ] T009 [P] Edit `tests/e2e/coverage-empty.spec.ts` (traces to AC-17, AC-18, AC-19):
  - `page.goto("/coverage")` becomes `page.goto("/data/coverage")`.
  - The comment says `NEVER_DOWNLOADED and NO_MATCH, verbatim from web/src/screens/coverage/copy.ts`.
  - The two texts become `"No data has been downloaded yet."` and `"No stock matches this filter."`.
  - The `rowheader` count stays byte-identical.

  Kills: `swap-case` of `copy.ts`'s `NEVER_DOWNLOADED` text (the visible check fails). It also kills `swap-case` of the `empty-never-populated` ↔ `empty-no-match` renderer: the `NO_MATCH` `toHaveCount(0)` fails. That check is non-vacuous only because it names the new sentence (T004).
- [ ] T010 [P] Edit `tests/e2e/instrument-changes.spec.ts` (depends on T005) (traces to AC-17, AC-18, AC-19, DAC-E7-1):
  - **Labels and paths.** The five `"Succeeded"` become `"Complete"`. The five `goto("/coverage")` become `"/data/coverage"`.
  - **Presence.** Line 63 becomes `presenceBadge(...)` with `"status-good"`.
  - **Followed stocks (lines 88–92).**
    - Line 88 becomes `page.goto("/data/followed")`.
    - The row action becomes `iccRow.getByRole("button", { name: "Stop following ICC" })`.
    - The dialog confirm becomes `page.getByRole("dialog").getByRole("button", { name: "Stop following" })`. CAP-003-E1-S3's `ConfirmDialog` keeps `role="dialog"`.
    - The lifecycle check becomes `expect(iccRow.locator("td").first()).toHaveText(/stopped following/i)`. Followed stocks' `td`s are *Lifecycle* then *Actions*, with the *Symbol* row header a `th` and no expander column (CAP-003-E7-S3 T018). The cell renders `StatusBadge` `neutral` *Stopped following* (CAP-003-E7-S3 T013).
  - **The Coverage lifecycle (line 96).** It becomes `expect(coverageCell(page, "ICC", COVERAGE_COLUMN.lifecycle)).toHaveText(/stopped following/i)`.
  - **The detail (line 104).** It becomes `page.goto(\`/data/downloads/${secondRun}\`)`.
  - **Unchanged.** The `waitForRunState` states (`"running"`, `"succeeded"`) are API values, not labels, and stay. The `rosterExpander` counts and the `lastAcquired` comparisons also stay byte-identical.

  Kills: `negate-boolean` on `LifecycleBadge`'s `retired` branch (the cell would read *Followed*); `swap-case` on the row action's `aria-label` back to *Stop acquiring*.
- [ ] T011 [P] Edit `tests/e2e/unrecognised-instrument.spec.ts` (depends on T005) (traces to AC-17, AC-18, AC-19):
  - **The diagnosis.**
    - `reference` becomes `dataTypeRow(unknown, "Reference")`, and its badge is `reference.locator(STATUS_BADGE)` with `"Not found"`.
    - The pattern becomes `/^Downloading reference for UNKQ: not found at the provider\. /`.
    - `toContainText("req_notfound_001")` is unchanged.
  - **Coverage.** `page.goto("/coverage")` becomes `"/data/coverage"`. The presence check uses `presenceBadge(...)` with `"status-good"`.
  - **Unchanged.** `"Partial"` and `not.toHaveText("Failed")` stay byte-identical.

  Kills: `swap-case` of `not_found`'s label in `tierOf`/`labelOf` (*Not found*); `swap-case` of `partial` → `succeeded` reaching the summary (*Complete*, the `"Partial"` check fails, AC-12).

**Checkpoint**: The guard passes for the seven cycle-1 files. `npx playwright test tests/e2e/first-run.spec.ts tests/e2e/diagnose-failure.spec.ts tests/e2e/cancel-in-progress.spec.ts tests/e2e/coverage-empty.spec.ts tests/e2e/instrument-changes.spec.ts tests/e2e/unrecognised-instrument.spec.ts` passes against the real stack.

---

## Phase 4: Integration

**Purpose**: TDD cycle 2, the default-stack specs and the whole suite. Re-point the five specs that run against the default stack (port 8123, no runner), then prove the whole Playwright and Vitest suites.

- [ ] T012 Append to `FILES` in `web/src/screens/e2e-journeys.test.ts`, test first, the paths `tests/e2e/cancel-run.spec.ts`, `coverage-expansion.spec.ts`, `instruments-add-retire.spec.ts`, `run-detail.spec.ts` and `runs-start-cancel.spec.ts`. Add their delivered counts to T003's table: `cancel-run.spec.ts` 16, `coverage-expansion.spec.ts` 15, `instruments-add-retire.spec.ts` 6, `run-detail.spec.ts` 13, `runs-start-cancel.spec.ts` 8. Re-measure each on `BASE`. T002 and T004 now fail for these five, which is the RED of cycle 2 (traces to DAC-E7-S7-1, DAC-E7-S7-2, AC-18, AC-19). Kills: the same mutants as T002–T004, now over these files.
- [ ] T013 [P] Edit `tests/e2e/cancel-run.spec.ts` (depends on T012) (traces to AC-17, AC-18, AC-19, DAC-E7-1). The test titles and the `afterEach` SQL are unchanged.
  - **`summaryBadge`.** It becomes `page.getByRole("region", { name: "Download summary" }).locator('[data-variant^="status-"]')`. The file does not import the support module, and it keeps that independence.
  - **The queued run.**
    - `page.goto("/data/downloads")`, then `getByRole("button", { name: "Download now" })`, then `toHaveURL(/\/data\/downloads\/[0-9a-f-]{36}$/)`.
    - `getByRole("button", { name: "Cancel download" })` opens the dialog. The heading must read `"Cancel this queued download?"`.
    - The confirm is `page.getByRole("dialog").getByRole("button", { name: "Cancel download" })`. It is scoped to the dialog, because the trigger has the same name.
    - The summary must read `"Cancelled by you"`.
    - `started` becomes `page.getByRole("region", { name: "Download summary" }).locator("dt", { hasText: "Started" })`. Its `dd` still contains `"Not recorded"`, which is `Absent`'s visually hidden text.
    - `getByText("Stopping")` has count 0.
  - **The running run.**
    - `page.goto(\`/data/downloads/${runId}\`)`.
    - Click `"Cancel download"`, then `"Stop download"`. The summary must read `"Stopping"`.
    - The screen-scoped count becomes `page.getByRole("main").locator('[data-variant^="status-"]')` with `toHaveCount(1)`. Its comment says the rail renders `StatusBadge` chips of its own, outside `main` (CAP-003-E3-S6).
    - `"Cancel download"` has count 0. The poll wait on `/api/acquisition-runs/${runId}` is unchanged. Afterwards the summary must still read `"Stopping"`.
  - **TC-E2E-008.**
    - Same path and buttons as the running run.
    - `getByText("This download had already finished.")` must be visible.
    - `summaryBadge(page)` must read `["Complete", "Complete"]`: the summary's badge and the control's settled badge, both inside the summary card (CAP-003-E7-S5 T013, T014; DEC-0018).
    - `getByText("Stopping")` and `getByText("Cancelled by you")` each have count 0.

  Kills: `negate-boolean` on `cancel-run.tsx`'s `queued` (the dialog heading fails); `negate-boolean` on `alreadyCompleted` (the finished sentence fails); `remove-attribute` of the summary's `aria-label="Download summary"` (every summary check fails).
- [ ] T014 [P] Edit `tests/e2e/coverage-expansion.spec.ts` (depends on T012) (traces to AC-17, AC-18, AC-19):
  - **Paths, filter and requests.** `page.goto("/coverage")` becomes `"/data/coverage"`. The filter textbox *Filter by symbol*, the `/api/coverage?symbol=CV` wait and every request-count assertion are byte-identical.
  - **Presence.** `.getByTestId("presence-badge")` becomes `.locator("[data-variant]")`. Present becomes `"status-good"`; `"Present"`, `"coverage-unknown"` and `"Unknown"` are unchanged. `NotDeterminable` is called with `label="Unknown"` (CAP-003-E7-S2 T017).
  - **Literal `td` indexes, each one higher** (Coverage has the leading expander cell, CAP-003-E1-S4): presence columns `[1, 2]` become `[2, 3]` and `[3, 4]` become `[4, 5]`; the last-downloaded cell `nth(9)` becomes `nth(10)`; `gapsCell` `nth(7)` becomes `nth(8)`; the covered-from cell `nth(5)` becomes `nth(6)`. A comment states that cell 0 is the expander.
  - **The last-downloaded instant.** `"2024-01-05 16:14:03 America/Chicago"` becomes `"2024-01-05 16:14 CST"`. The seed holds `2024-01-05T22:14:03Z`, and the takeover renders it with `formatInstant` in UX design 0.7's `YYYY-MM-DD HH:MM zone` (CAP-003-E7-S2 T019; Resolved Conflict 2).
  - **Comment.** "last-acquired time" becomes "last-downloaded time".
  - **Unchanged.** The *Show details for CVC* expander, the `2024-01-04` list item, the `2024-01-02` value, the no-page-scroll check and the 15 s no-poll check are unchanged.

  Kills: `swap-case` of `NotDeterminable`'s `coverage-unknown` → `coverage-absent` in Coverage's unknown presence; `drop-field-copy` of the `expand=` request de-duplication (the `toHaveLength(1)` fails).
- [ ] T015 [P] Edit `tests/e2e/instruments-add-retire.spec.ts` (depends on T012) (traces to AC-17, AC-18, AC-19):
  - **Path and field.** `page.goto("/instruments")` becomes `"/data/followed"`. The add field becomes `page.getByRole("textbox", { name: "Symbol of the stock to follow" })`.
  - **Lifecycle, before.** `row.getByTestId("lifecycle-badge")` becomes `row.locator("td").first()`, with `/active/i` becoming `/followed/i`. An active row reads *Followed* as plain text (CAP-003-E7-S3 T013).
  - **Stopping following.** The row action becomes `"Stop following AAPL"`. The dialog text becomes `"Stop following AAPL?"`. The confirm becomes `"Stop following"`.
  - **Lifecycle, after.** The final check becomes `row.locator("td").first()` with `/stopped following/i`.
  - **Comment (line 31).** "Retired, never removed (AC-21)…" becomes "Stopped following, never removed (AC-21): the row stays visible in the same table, now marked *Stopped following*." (T002 (c)).

  Kills: `swap-case` of the dialog title back to *Stop acquiring {symbol}?*; `negate-boolean` on the `retired` branch of `LifecycleBadge`.
- [ ] T016 Edit `tests/e2e/run-detail.spec.ts` (depends on T005, T012). It now imports `STATUS_BADGE` and `dataTypeRow` from `./support/acquisition`, which has no import-time effect on this default-stack spec (traces to AC-17, AC-18, AC-19):
  - **Navigation and expanders.**
    - `page.goto(\`/runs/${runId}\`)` becomes `\`/data/downloads/${runId}\``.
    - The local `expander` regex becomes `details for ${symbol}$`, and the count check becomes `/^Show details for /` with 2.
  - **Before expansion.** For each data type, `dataTypeRow(page.getByRole("main"), name)` has count 0. This replaces `getByRole("rowheader", { name, exact: true })`, which can no longer match a data type and would pass vacuously.
  - **After expanding DIAGA.**
    - `dataTypeRow(diaga, name)` has count 1.
    - The reason becomes `\`Downloading prices for DIAGA failed: ${FAILED_REASON}\``.
    - `req-e2e-1` is unchanged.
    - `failedBadge` becomes `dataTypeRow(diaga, "Prices").locator(STATUS_BADGE)`, still `"Failed"` and `"status-critical"`.
  - **DIAGZ.** The delivered roster grouped a stock's own row and its data types in one `tbody`, so it counted 5 *Not found*: one on the stock and four on the data types. To keep `toHaveCount(5)` byte-identical:
    - `const diagzStock = page.locator("tr", { has: page.getByRole("rowheader", { name: "DIAGZ", exact: true }) }).or(diagz)` takes the stock's row plus its expansion row.
    - `notFound = diagzStock.locator(STATUS_BADGE).filter({ hasText: "Not found" })`.
    - Each badge in it is still `"status-warning"`.
  - **Recovery.** `"Re-run acquisition"` becomes `getByRole("button", { name: "Download now" })` (DEC-0395).
  - **The outcome filter.** `selectOption({ label: "Not found" })` becomes `await page.getByRole("combobox", { name: "Outcome" }).click()` followed by `await page.getByRole("option", { name: "Not found" }).click()`. The filter is now Radix `select` `inline` (CAP-003-E7-S5 T015). The two expander count checks after it use `/details for DIAGA$/` and `expander(page, "DIAGZ")`.

  Kills: `swap-case` of `not_found`'s tier `warning` → `critical` (the `status-warning` loop fails); `drop-field-copy` of `outcome` from the filter request (DIAGA stays, its count is 1).
- [ ] T017 [P] Edit `tests/e2e/runs-start-cancel.spec.ts` (depends on T012) (traces to AC-17, AC-18, AC-19, DAC-E7-1):
  - **Starting.** Both `page.goto("/runs")` become `"/data/downloads"`. The start button becomes `"Download now"`. The URL regex becomes `/\/data\/downloads\/[0-9a-f-]{36}$/`.
  - **The link.** `link` becomes `page.locator(\`a[href="/data/downloads/${runId}"]\`)`. The `href` assertion is replaced by `expect(link).toHaveAccessibleName(/^Download started \d{4}-\d{2}-\d{2} \d{2}:\d{2} C[DS]T, open details$/)`. Locating by the path is the path change. Re-asserting the same `href` would compare the selector with itself, so the one assertion now checks what only the *Started* link carries (CAP-003-E7-S4 T014; Other Notes, CAP-003-E7-S4 correction on G13).
  - **Badges.** The row badge becomes `row.locator('[data-variant^="status-"]')`, with `/Requested/` becoming `/Queued/` and `/Cancelled/` becoming `/Cancelled by you/`.
  - **Comment.** The doc comment's "Start a run from Runs" becomes "Start a download from Downloads". The `toEqual({ state: "cancelled" })` API check is unchanged.

  Kills: `swap-case` of `requested`'s label (*Queued*); `remove-attribute` of the *Started* link's `aria-label` (its accessible name becomes the bare time).
- [ ] T018 Run the whole suites from the repo root (traces to AC-17, DAC-E7-1, DAC-E7-S7-2):
  - **Playwright.** Run `npm run test:e2e`. The eleven specs and the untouched `acquisition-stack-stub.spec.ts` must pass.
  - **The other specs.** Report every other spec's result by name. The CAP-002 specs `fix-insufficient-evidence.spec.ts`, `universe-from-result.spec.ts` and `research-after-download.spec.ts` call this story's rewritten `startRun` / `stateHistoryDepth` / `addInstruments` and must still start their downloads. `research-after-download.spec.ts:60,87` still assert `"Succeeded"`, and `:116` asserts `/runs/${runId}`. Those lines are outside this story (Open Gaps 1); report them as the known failure they are, never as green.
  - **Vitest.** Run `npm run test`. The guard passes for all twelve files.
  - **Scope.** `git diff --stat $BASE` lists exactly the twelve files plus `web/src/screens/e2e-journeys.test.ts`. No file under `web/src/` other than the guard, nor any `src/` file, changed.

**Checkpoint**: Both suites green apart from the reported out-of-scope CAP-002 lines; the diff is the twelve files and the guard.

---

## Phase 5: Polish

**Purpose**: Validation commands, the diff classification TC-COMP-222 asks for, and the TDD evidence.

- [ ] T019 From the repo root, run the validation commands (traces to DAC-E7-S7-1, AC-17):
  - `npm run lint` and `npm run format`. Biome covers `tests/e2e` and `web/src`. Fix formatting only in this story's files, with `npx biome format --write <file>`.
  - `npx tsc --noEmit` checks `web/src`, the guard included.
  - `npx tsc --noEmit -p tsconfig.e2e.json` checks the specs and the support module (the repo's own e2e config).
  - `npm run build`.
  - Repeat TC-COMP-221's own steps by hand over the twelve files, each printing nothing:
    - T002 (a)'s `goto` pattern with `grep -nE`, the backtick written literally;
    - T002 (b)'s path patterns with `grep -nE`;
    - `grep -nF -e "Add instrument" -e "Retire" -e "Start acquisition run" -e "Provider credential" <files>`.
- [ ] T020 Implement TC-COMP-222's diff step: classify every changed line of `git diff -U0 $BASE -- <the twelve files>` (traces to DAC-E7-S7-2, AC-17).
  - **The classes.** Each `-`/`+` pair is exactly one of:
    - **P**, a path in the path map;
    - **L**, a label in the label map (Other Notes);
    - **C**, a component locator: a retired test id to a role or `data-variant` selector, a `td` index +1, `tr`/`rowheader` to `listitem`, `selectOption` to combobox and option clicks, a run-id link name to an `href` selector with an accessible name, the DIAGZ `or` union, or `coverage-present` to `status-good`;
    - **F**, the one instant re-rendered by the shared formatter;
    - **D**, a doc comment.
  - **Expected values outside the maps.** Every expected value is byte-identical to `BASE`: `Failed`, `Partial`, `Not found`, `Present`, `Unknown`, `Not recorded`, the reasons, the request ids, the dates, `status-critical`, `status-warning`, `coverage-unknown`, the counts, and the API states and bodies.
  - **Recording the result.** Record the per-class line counts in the last cycle's `red_green_evidence` as one line: `TC-COMP-222: P=<n> L=<n> C=<n> F=1 D=<n>, unclassified=0`. Any unclassified line is a defect to fix before hand-off.
  - **Hand-written mutants.** Apply each one in Other Notes by hand, run `npx vitest run web/src/screens/e2e-journeys.test.ts`, see it fail, and revert. Record each mutant as killed in the same evidence.
- [ ] T021 After each TDD cycle in T002–T020 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E7-S7-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned (INV-TDD-002, TEST-TDD-008; traces to no AC). The cycles:
  - **Cycle 1: the support module and the acquisition-stack specs** (T002–T011).
    - RED: the guard's T002/T004 failures for the seven files, plus T001's e2e failures for the six specs.
    - GREEN: the guard and the six specs pass.
  - **Cycle 2: the default-stack specs** (T012–T017).
    - RED: the guard failures for the five appended files, plus T001's e2e failures for them.
    - GREEN: the guard and the five specs pass.
    - T018–T020 add no behaviour and join cycle 2's evidence, including T020's classification line.
  - **Mutation.** Both cycles record `mutation: {not_applicable: "the cycle changes only test files (tests/e2e/*.spec.ts, tests/e2e/support/acquisition.ts, web/src/screens/e2e-journeys.test.ts); no production file is changed"}`. These paths match the evidence checker's default test globs (`tests/*`, `*.test.*`, `*.spec.*`). The guard's hand-written mutants are killed by hand in T020.

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E7-S1 | hard | Graph edge. `stateHistoryDepth` locates the depth field by E7-S1's name *History depth years* and relies on its save-on-blur |
| CAP-003-E7-S2 | hard | Graph edge. Coverage's path, the `NEVER_DOWNLOADED` / `NO_MATCH` copy, the presence rendering (`status-good`, `coverage-unknown` *Unknown*), the expander column and the `formatInstant` time |
| CAP-003-E7-S3 | hard | Graph edge. *Symbol of the stock to follow*, *Stop following {SYMBOL}*, the confirm dialog, and the *Followed* / *Stopped following* lifecycle cell |
| CAP-003-E7-S4 | hard | Graph edge. **Download now** on Downloads, the *Started* link by `href` and accessible name, and row badges through `StatusBadge` |
| CAP-003-E7-S5 | hard | Graph edge. The *Download summary* region, the expander name, data types as list items, the *Downloading* reasons, **Cancel download** / **Stop download**, the cancel wording, the recovery **Download now** and the Radix outcome filter |
| CAP-003-E3-S4 | hard | Graph edge. Registers the five paths. Its legacy redirects are why T002 is a static guard |
| CAP-003-E3-S6 | hard | Graph edge. The shell's `main` element (T013's screen-scoped count) and the status region's removal |
| CAP-003-E2-S5 | hard | Graph edge. The shell polls `GET /api/attention` on every route the specs open (backlog review v2 FINDING-1) |
| CAP-003-E1-S1 | context | `Badge` puts `data-variant` on the badge `span`, the hook `STATUS_BADGE` and `presenceBadge` select by. It is observed only through E7-S2–E7-S5's screens, which hard-depend on it; nothing is imported |
| CAP-003-E1-S2 | context | Its DEC-0299 fixes the depth field's accessible name, and its `Select` is the combobox T016 clicks. Both are observed through E7-S1 and E7-S5, which hard-depend on it |
| CAP-003-E1-S3 | context | `ConfirmDialog` keeps `role="dialog"` (its Resolved Conflict 2), so `getByRole("dialog")` still finds the confirmations. It is reached through E7-S3 and E7-S5 |
| CAP-003-E1-S4 | context | The leading expander cell and the *Show details for {label}* name. Reached through E7-S2 and E7-S5 |
| CAP-003-E1-S5 | context | `StatusBadge` renders `data-variant="status-<tier>"` and no test id. Reached through E7-S2–E7-S5 |
| CAP-003-E1-S6 | context | `NotDeterminable` keeps `coverage-unknown`, and `Absent` keeps the hidden text *Not recorded*. Reached through E7-S2 and E7-S5 |
| CAP-003-E7-S6 | context | Its sweep and `requestJson` check are the rest of DAC-E7-12, over the screens and `client.ts`. No file is shared with this story |
| CAP-003-E7-S8 | context | Owns the `SHELL_ROUTES` targets, including CAP-002's `research-after-download.spec.ts:116` (register G15). It edits no file of this story |

No hard edge is added: every DOM contract the specs observe is produced by a screen story already on this story's line, and nothing is imported from any other story's module.

### Task Dependencies
- T001: none; blocks everything.
- T002 → T003 → T004: the same new file, sequential.
- T005: depends on T004.
- T006, T007, T008, T010, T011: depend on T005; parallel with each other.
- T009: depends on T004 only (it imports nothing the support module changes).
- T012: depends on T006–T011 (cycle 1 closed).
- T013, T014, T015, T017: depend on T012; parallel.
- T016: depends on T005, T012.
- T018: depends on T013–T017.
- T019, T020: depend on T018.
- T021: interleaved — after cycle 1 (T011) and after cycle 2 (T020), each before the next begins.

### Parallel Opportunities
- Phase 3: T006–T011 touch different files once T005 lands.
- Phase 4: T013–T017 touch different files once T012 lands.

---

## Validation Plan

### Constitution-Defined Commands
- Build: `npm run build`
- Test: `npm run test` (Vitest, the guard included) and `npm run test:e2e` (Playwright against the real stack; needs `npx playwright install` and a container runtime; report any exclusion, never a partial run as green)
- Lint: `npm run lint`
- Format: `npm run format`
- Type check: `npx tsc --noEmit`, plus `npx tsc --noEmit -p tsconfig.e2e.json` for `tests/e2e` (the repo's e2e config; `tsconfig.json` includes only `web/src`)

### Story-Specific Validation
- DAC-E7-S7-1 / TC-COMP-221: `npx vitest run web/src/screens/e2e-journeys.test.ts`. The three greps in T019 print nothing.
- DAC-E7-S7-2 / TC-COMP-222: the guard's assertion counts match the delivered table. T020's classification records `unclassified=0`.
- AC-17 / DAC-E7-1 / TC-INT-040's evidence: `npm run test:e2e`. The eleven specs pass at `/data/*` and `/settings`, and `acquisition-stack-stub.spec.ts` passes untouched.
- AC-18: no spec reaches a screen through a legacy redirect. The guard proves it statically, because a redirected `goto` would still pass at run time.

---

## Notes

### Resolved Conflicts

1. **"Byte-for-byte apart from labels and paths" vs locators that a component change forces.**
   - **The conflict.** DAC-E7-S7-2 permits label and path changes only. The screens these specs drive were rebuilt from `ui-components`, and that removed the hooks the delivered specs used: the `data-testid`s, the `coverage-present` variant, the `tr`/`rowheader` data-type rows, the native `<select>` and the run-id link name. The data table also adds a leading expander cell.
   - **Governing.** The epic NFR *Behaviour preserved* (CAP-003-E7): "the delivered screen tests and the eleven e2e specs change only where a label, path or **component** changes and keep proving the same outcomes". Epic outranks story (constraint 9.1). Owner-web-app 2.6 says the same for the screen tests ("component assertions follow").
   - **What the plan does.** Locators change where a component did. Every asserted outcome value stays byte-identical apart from its label (T020's classes). The assertion count is pinned (T003).
2. **The Coverage last-downloaded instant.**
   - **The conflict.** The delivered `"2024-01-05 16:14:03 America/Chicago"` becomes `"2024-01-05 16:14 CST"`.
   - **Governing.** UX design 0.7 (conventions, l.270-272) fixes timestamps as `YYYY-MM-DD HH:MM zone`, and CAP-003-E7-S2 renders the cell through `formatInstant` (ui-components 2.5). The asserted value is the same instant from the same seed row (`2024-01-05T22:14:03Z`). Only its display text changes, a label in the epic's sense (*Behaviour preserved*: "the same outcomes").
3. **Capability AC-18 vs the story's "[AC-18]".**
   - **The conflict.** Capability AC-18 is "old paths still arrive" (the legacy redirects, CAP-003-E3-S4's). The story restates it as "every `page.goto` uses the new paths".
   - **Governing.** No behavioural conflict (register C4): this story carries the goto obligation under DAC-E7-S7-1 and DAC-E7-1, and the redirects stay E3-S4's.
   - **What the plan does.** The redirects are exactly why an unchanged `goto("/runs")` would pass at run time. The plan's AC-18 check is therefore static (T002), not the e2e run.

### Open Gaps

1. **CAP-002 specs that drive the taken-over screens through this story's helpers are in no story's file list.**
   - **The gap.** `tests/e2e/research-after-download.spec.ts` asserts `expect(summaryOutcome(page)).toHaveText("Succeeded")` at lines 60 and 87. After CAP-003-E7-S5 relabels the state and this story re-points `summaryOutcome`, the label is *Complete*, so those two lines fail. Line 116 asserts `href` `/runs/${runId}`; register G15 assigns it to CAP-003-E7-S8's `SHELL_ROUTES` change. Owner-web-app 2.6 lists only the eleven CAP-001 specs, and no artifact assigns the two label lines.
   - **What the plan does.** It does not edit the file: it is outside the story's Implementation list and the approved scope. T018 runs it and reports the two lines by name as a known, out-of-scope failure, never as green.
   - **Absorb at the next revision of** `component-design-owner-web-app.md` §2.6, which should list the CAP-002 specs that import `tests/e2e/support/acquisition.ts` (`research-after-download`, `fix-insufficient-evidence`, `universe-from-result`) and say who follows their labels.
   - This is a scope gap, not an undetermined value, so no DEC-PENDING is raised.
2. **Consumed provisional decisions of other plans.** This plan writes assertions against values other plans adopted provisionally; it adopts none of its own. If the owner changes one, the matching e2e assertion fails loudly, which is the intent.
   - DEC-0387: present presence is `StatusBadge` `good`, so `status-good`; the owner-web-app §10 mapping was `coverage-present`.
   - DEC-0299: the depth field's name is *History depth years*.
   - DEC-0395: the recovery action is **Download now**.
   - DEC-0307: the expander is named *Show details for {label}*, in a leading column.

### Other Notes

- **Path map.**

  | Delivered | New |
  |---|---|
  | `/coverage` | `/data/coverage` |
  | `/instruments` | `/data/followed` |
  | `/runs` | `/data/downloads` |
  | `/runs/{id}` (gotos, URL regexes, `href`) | `/data/downloads/{id}` |
  | `/settings` | unchanged |

  The API paths (`/api/...`) are unchanged.
- **Label map** (UX design 1.5–1.8; owner-web-app 2.3; ui-components 2.3; sibling plans named):

  | Delivered | New | Source |
  |---|---|---|
  | `Succeeded` | `Complete` | ui-components 2.3 tier table |
  | `Running` | `Downloading` | ui-components 2.3 |
  | `Cancelling` | `Stopping` | ui-components 2.3 |
  | `Cancelled` | `Cancelled by you` | ui-components 2.3 |
  | `Requested` (badge) | `Queued` | ui-components 2.3 |
  | **Start acquisition run** | **Download now** | owner-web-app 2.3; CAP-003-E7-S4 T016 |
  | **Re-run acquisition** | **Download now** | CAP-003-E7-S5 DEC-0395 |
  | **Cancel run** | **Cancel download** | owner-web-app 2.3 |
  | **Stop run** | **Stop download** | owner-web-app 2.3 |
  | **Cancel queued run** | **Cancel download** | owner-web-app 2.3 |
  | *Cancel this queued run?* | *Cancel this queued download?* | owner-web-app 2.3 |
  | *This run had already completed.* | *This download had already finished.* | owner-web-app 2.3 |
  | **Stop acquiring {SYM}** (row action) | **Stop following {SYM}** | owner-web-app 2.6 |
  | **Stop acquiring** (confirm) | **Stop following** | DAC-E7-9 |
  | *Stop acquiring AAPL?* | *Stop following AAPL?* | DAC-E7-9 |
  | lifecycle `/active/i` | `/followed/i` | CAP-003-E7-S3 T013 |
  | lifecycle `/retired/i` | `/stopped following/i` | CAP-003-E7-S3 T013 |
  | `/instrument symbol/i` | `Symbol of the stock to follow` | owner-web-app 2.3 |
  | `History depth, in years` | `History depth years` | CAP-003-E7-S1, DEC-0299 |
  | *No data has been acquired yet.* | *No data has been downloaded yet.* | UX design 1.5 |
  | *No instrument matches this filter.* | *No stock matches this filter.* | UX design 1.5 |
  | `Acquiring {type} for {SYM}` | `Downloading {type} for {SYM}` | owner-web-app 2.3 |
  | `Show data types for {SYM}` | `Show details for {SYM}` | CAP-003-E1-S4 DEC-0307 |
  | `… 16:14:03 America/Chicago` | `… 16:14 CST` | UX design 0.7 (Resolved Conflict 2) |

  Kept unchanged: `Failed`, `Partial`, `Not found`, `Present`, `Unknown`, `Not recorded`, `Reference`, `Prices`, `Fundamentals`, `Corporate actions`, `Outcome`, *Filter by symbol*, `Started` (the `dt`), `status-critical`, `status-warning`, `coverage-unknown`, every reason and request id.
- **Locators that depend on a sibling plan's DOM.** If the landed DOM differs from the sibling plan's prose, adapt the locator, never the asserted value, and record it under class **C** in T020. The prose assumptions are:
  - `dataTypeRow` assumes CAP-003-E7-S5 T012's `li` per data type, beginning with the data type label.
  - The `^Downloading …` `getByText` patterns assume the reason line is its own element. CAP-003-E7-S5's own `getByText` assertions (T007, T009) require that.
- **Run-id links.** No raw `run_id` is on any surface (DAC-E7-10; CAP-002's DEC-0083), so a specific download in the list is found by its `href`, `/data/downloads/{runId}`. A `getByRole("link", { name: runId })` would find nothing.
- **Coverage expander offset.** The delivered expander sat inside the Stock `th`. CAP-003-E1-S4 puts it in a leading `td`, which is why every `td` index moves by one, while `coverageRow`'s row header name drops the *Show details for* prefix and still ends in the symbol.
- **Risk: the no-page-scroll check** in `coverage-expansion.spec.ts`. The shell (CAP-003-E3-S6) and the `virtualised` scroller (CAP-003-E1-S4) change the page's layout. The assertion is an outcome and is kept. If it fails, report it against CAP-003-E3-S6 / CAP-003-E7-S2 rather than editing it.
- **Hand-written mutants** (T020; each must fail `npx vitest run web/src/screens/e2e-journeys.test.ts`):
  - `tests/e2e/support/acquisition.ts: page.goto("/data/downloads") → page.goto("/runs")`
  - `tests/e2e/support/acquisition.ts: /\/data\/downloads\/[0-9a-f-]{36}$/ → /\/runs\/[0-9a-f-]{36}$/`
  - `tests/e2e/instrument-changes.spec.ts: page.goto("/data/followed") → page.goto("/instruments")`
  - `tests/e2e/cancel-run.spec.ts: page.goto(\`/data/downloads/${runId}\`) → page.goto(\`/runs/${runId}\`)`
  - `tests/e2e/cancel-run.spec.ts: getByText("Stopping")).toHaveCount(0) → getByText("Cancelling")).toHaveCount(0)`
  - `tests/e2e/coverage-empty.spec.ts: "No stock matches this filter." → "No instrument matches this filter."`
  - `tests/e2e/runs-start-cancel.spec.ts: { name: "Download now" } → { name: "Start acquisition run" }`
  - `tests/e2e/instruments-add-retire.spec.ts: // Stopped following, never removed → // Retired, never removed`
  - `tests/e2e/run-detail.spec.ts: delete the line await expect(notFound).toHaveCount(5);`
- **No production file changes.** This story changes test files only, so each TDD cycle's mutation block is `not_applicable` (T021). The production mutants named in each task's *kills* are the ones the re-pointed e2e assertions observe in the sibling screens' code.
