---
artifact_schema_version: 1
artifact_id: CAP-003-E7-S4-tasks
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
  timestamp: 2026-11-07T06:38:01Z
  source_artifacts:
    - id: CAP-003-E7-S4
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
    - id: CAP-003-E1-S1-tasks
      version: "1"
    - id: CAP-003-E7-S5-tasks
      version: "1"
    - id: CAP-003-E1-S4-tasks
      version: "1"
    - id: CAP-003-E1-S5-tasks
      version: "1"
    - id: CAP-003-E1-S6-tasks
      version: "1"
    - id: CAP-003-E1-S9-tasks
      version: "1"
    - id: CAP-003-E3-S4-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E7-S4 — Downloads Under the Shell: the Started Column, StatusBadge for the Eight States and the Retired outcome-badge

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/taking-over-the-delivered-screens/stories/CAP-003-E7-S4.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `owner-web-app`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Takes over CAP-001's Runs screen as *Downloads* at `/data/downloads` (owner-web-app 2.1, 2.3, 2.6, 5, 7; UX design 1.7; epic DAC-E7-1, DAC-E7-4, DAC-E7-5, DAC-E7-10, DAC-E7-11). The directory keeps its name `web/src/screens/runs/` (DAC-E7-13). `index.tsx`, `run-table.tsx`, `run-controls.tsx` and `cancel-run.tsx` are rebuilt from `ui-components`: the list becomes a `data-table` `history` on a `card`, with the outcome filter a `select` `inline`. The list's states render through `StateRegion`. **Download now** is `button` `default` or `blocked`. The cancel confirmation in `cancel-run.tsx` is rebuilt by CAP-003-E7-S5, which lands first (Resolved Conflict 12); this story verifies it and sweeps its dialog states. The list's first column is *Started*: the start time with its zone, as the link to `/data/downloads/{id}`, named *Download started {time}, open details*. No raw `run_id` appears. The columns *Instruments written* and *Instruments failed* become *Stocks downloaded* and *Stocks failed*. The eight download states render through `StatusBadge` over `tierOf` and `labelOf`: *Queued* neutral, *Downloading* active, *Stopping* warning, *Complete* good, *Partial* warning, *Failed* critical, *Cancelled by you* neutral and *Interrupted* serious. Every string takes the display vocabulary. The 10-second poll is unchanged, and its last-updated time is shown with `formatClock` and announced politely. The delivered `web/src/screens/runs/outcome-badge.tsx` is retired: its non-visual helpers move to a new `run-state.ts`, every remaining import is repointed, and it is deleted with `outcome-badge.test.tsx` once no caller remains (DAC-E7-5, DAC-E7-S4-3). The literal scan is widened to `web/src/screens/runs/` (DAC-E7-S4-4). No request, query parameter, confirmation step, refusal or cadence changes (AC-17; system design constraint 2). `web/src/api/types.ts` and `client.ts` are not edited.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-12 | The downloads list never presents a partial or interrupted download as complete | T002, T003, T014, T015 |
| AC-15 | **Download now** starts a full download and says when it starts after a running one | T009, T016 |
| AC-17 | Every action, confirmation and refusal CAP-001 accepted on the runs screen stays available at `/data/downloads` with the same outcome | T006, T009, T015, T016, T019 |
| AC-18 | Every internal link points at the new paths directly (story wording; capability AC-18 is the legacy redirects, see Resolved Conflict 10) | T005, T009, T014, T016, T020 |
| AC-19 | Every user-visible label uses the display label | T005, T007, T009, T010, T013, T014, T015, T016 |
| AC-20 | Every download outcome renders as its single tier with its label and shape | T002, T003, T014 |
| AC-24 | The screen keeps its eight-state table through `StateRegion` | T006, T015 |
| AC-25 | The polled list shows its last-updated time | T004, T015 |
| AC-26 | The screen is built from `ui-components` | T005, T009, T014, T015, T016, T017, T018, T020 |
| DAC-E7-5 | `outcome-badge.tsx` replaced by `StatusBadge` calls and deleted with its tests once no caller remains | T001, T002, T003, T008, T012, T014, T017, T019 |
| DAC-E7-10 | No raw `run_id` on any surface; the first column is *Started*, the link to the detail | T005, T014, T017 |
| DAC-E7-11 | The Downloads table is `data-table` `history` | T005, T014 |
| DAC-E7-S4-1 | A `partial` run's badge is `status-warning` *Partial* with the triangle; the *Started* link is named *Download started {time}, open details* | T002, T014 |
| DAC-E7-S4-2 | Over three polls the last-updated time advances at 10 s and is announced politely without moving focus | T004, T015 |
| DAC-E7-S4-3 | After this story no import of `outcome-badge` remains and the two files are gone | T008, T019 |
| DAC-E7-S4-4 | The literal scan covers `web/src/screens/runs/` and passes | T018 |
| DAC-E7-S4-5 | The populated, empty, error and dialog states show none of the eight terms; the DAC-E7-4 deltas apply exactly | T007, T009, T010, T013, T014, T015, T016 |
| DAC-E7-S4-6 | The eight states go through `StatusBadge` with label and `aria-hidden` shape, never colour alone | T003, T014 |
| DAC-E7-S4-7 | The relabelled delivered tests keep every request, parameter, confirmation, refusal and cadence; the eight-state table renders through `StateRegion` | T006, T009, T015, T019 |

Mapped test cases (from `tests/component/owner-web-app-tests.md`, confirmed in `tests/coverage-matrix.md` lines 315-351): **TC-COMP-186** (DAC-E7-10), **TC-COMP-204** (DAC-E7-S4-1, DAC-E7-5, AC-12, AC-20), **TC-COMP-205** (DAC-E7-S4-2, AC-25), **TC-COMP-206** (DAC-E7-S4-3, DAC-E7-5), **TC-COMP-207** (DAC-E7-S4-4, AC-26), **TC-COMP-208** (DAC-E7-S4-5, AC-19), **TC-COMP-209** (DAC-E7-S4-6, AC-20) and **TC-COMP-210** (DAC-E7-S4-7, AC-17, AC-24). This story also covers the Downloads share of the epic-level **TC-COMP-183** (DAC-E7-1: new paths, no `navigate()` to an old path) and **TC-COMP-184** (DAC-E7-4: *Downloads*, *Started*, *Stocks downloaded*, *Stocks failed*). The other screens' share of those two cases belongs to the sibling screen stories of this epic. The test specification is `status: draft`. Its generic steps are sharpened below into concrete assertions against the story's criteria.

## Phase 1: Setup

**Purpose**: Confirm every prerequisite this plan imports is delivered, and inventory the remaining importers of the retired module.

- [ ] T001 From the repo root confirm the following, creating and editing nothing (traces to DAC-E7-5, AC-26).
  - **CAP-003-E1-S1.** `web/src/components/ui/button.tsx` (`Button`: variants `default`, `secondary`, `outline`, `blocked`; `blocked` sets `aria-disabled` and swallows clicks), `card.tsx` (`Card`) and `badge.tsx` exist. `web/src/components/token-literals.test.ts` exports `SCANNED_DIRECTORIES`, `isScannedSource` and `literalsIn` (DEC-0296).
  - **CAP-003-E1-S2.** `web/src/components/ui/select.tsx` exports `Select`, `SelectTrigger` (`variant="inline"`), `SelectValue`, `SelectContent` and `SelectItem` (DEC-0300).
  - **CAP-003-E1-S4.** `web/src/components/ui/data-table.tsx` exports `DataTable` with `variant="history"`, `label`, `columns`, `data`, `getRowId` and `meta.numeric`, and renders the first cell of each row as `th scope="row"` (DEC-0307).
  - **CAP-003-E1-S5.** `web/src/components/patterns/tiers.ts` exports `tierOf`, `labelOf` and `Status`. `status-badge.tsx` exports `StatusBadge({ tier, children })` and no longer imports from `web/src/screens/`.
  - **CAP-003-E1-S6.** `web/src/components/patterns/format.ts` exports `formatInstant`, `formatClock` and `formatCount` (DEC-0309). `presence.tsx` exports `Absent`.
  - **CAP-003-E1-S9.** `web/src/components/patterns/state-region.tsx` exports `StateRegion` and `StateRenderers` (DEC-0313).
  - **CAP-003-E3-S4.** `/data/downloads` and `/data/downloads/:runId` are registered (its Resolved Conflict 1).
  - **CAP-003-E3-S6.** `web/src/app/status-region.tsx` no longer exists.
  - **CAP-003-E7-S5.** `web/src/screens/runs/detail/result-outcome-badge.tsx` no longer exists, and `detail/run-summary.tsx` renders no `OutcomeBadge`. `web/src/screens/runs/cancel-run.tsx` is rebuilt on `ConfirmDialog` with the owner-web-app 2.3 wording, renders its settled state through `StatusBadge`, shows no run id, and imports nothing from the retired module (CAP-003-E7-S5 plan T010, T014).
  - **Baseline.** Run `npm ci` and `npm run test` and record the suite green.
  - **Inventory.** Run `grep -rnE "outcome-badge['\"]" web/src tests` and record every remaining importer with the names it imports. Expected: this story's `index.tsx`, `run-table.tsx` and `outcome-badge.test.tsx`; `web/src/screens/research/use-score-set-poll.ts` (`isNonTerminalRunState`); possibly `detail/index.tsx` (`isNonTerminalRunState`) and `run-detail*.test.tsx` (`RUN_STATE_LABEL`, `ABANDONED_EXPLANATION`).
  - **Stop condition.** Stop and report if any of these hold: a prerequisite is missing; any importer outside this story's files still imports `OutcomeBadge`, `TierIcon`, `TIER_CLASSES`, `RunTier` or `RUN_STATE_TIER` (a rendering use another story must remove first); or `web/src/app/status-region.tsx` still exists.

**Checkpoint**: Every prerequisite is present, the suite is green, and the importer inventory is recorded. Every remaining import is non-visual (`isNonTerminalRunState`, `isRunState`, `RUN_STATE_LABEL`, `ABANDONED_EXPLANATION`) or is in this story's own files.

---

## Phase 2: Tests (TDD)

**Purpose**: Pin the Downloads list's labels, tiers, links, polling, states and the retirement before any production change.

Shared fixture notes, used by T002-T008:
- Render `RunsScreen` in `<MemoryRouter initialEntries={["/data/downloads"]}>`.
- Mock `../../api/client` as the delivered tests do.
- Use UUID-shaped `runId`s, for example `9f1c2a4e-0000-4000-8000-00000000000${index}`, so a raw-id leak is detectable.
- Radix `select` needs jsdom stubs:
  - In `beforeAll`, define `Element.prototype.hasPointerCapture` (returning `false`), `releasePointerCapture` and `scrollIntoView` as no-ops.
  - In `beforeEach`, call `vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} })`. The shared `web/src/test-setup.ts` unstubs globals after each test (CAP-003-E1-S2 Other Notes). Do not edit `test-setup.ts`.
- Time literals are the America/Chicago rendering with the zone, computed by hand. They are not produced by the code under test (symmetric-comparison rule).

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-204 (Partial run badge and Started link name in the Downloads list) in `web/src/screens/runs/runs-screen.test.tsx`, with a `// Implements TC-COMP-204` comment (traces to DAC-E7-S4-1, DAC-E7-5, AC-12, AC-20).
  - **Fixture.** A `partial` run with `requestedAt: "2026-09-04T15:00:00Z"` and `startedAt: "2026-09-04T15:31:00Z"` (distinct minutes, so a mutant that falls back to the request time is visible).
  - **Badge.** Inside the run's row, the badge element `[data-variant="status-warning"]` has text exactly *Partial*.
  - **Shape.** The badge contains one `svg` with `aria-hidden="true"` and class `lucide-triangle`, the warning shape of CAP-003-E1-S5's fixture.
  - **Never complete.** No element in the row carries `[data-variant="status-good"]`, and the row's text does not contain *Complete*.
  - **Link.** `screen.getByRole("link", { name: "Download started 2026-09-04 10:31 CDT, open details" })` exists. Its visible text is `2026-09-04 10:31 CDT`, and its `href` is `/data/downloads/<runId>`.
  - **Queued download (Resolved Conflict 9).** A `requested` run with `startedAt: null` and `requestedAt: "2026-09-06T14:00:00Z"` has a link named `Download started 2026-09-06 09:00 CDT, open details`.
  - Kills:
    - swap-case `"partial"` → `"succeeded"` in the `tierOf` call site (the status-good guard);
    - swap of `startedAt ?? requestedAt` to `requestedAt ?? startedAt` (the 10:31 name);
    - remove-attribute `aria-label` on the link (the accessible name falls back to the bare time and the named query fails).
- [ ] T003 Implement TC-COMP-209 (Eight download states carry shape through StatusBadge) in `web/src/screens/runs/runs-screen.test.tsx` (after T002, same file), with a `// Implements TC-COMP-209` comment (traces to DAC-E7-S4-6, AC-20, AC-12).
  - **Fixture.** An independent literal table typed `Record<RunState, [label, tier, shape]>`, so a missing state fails type-check:
    - `requested`: *Queued*, neutral, `lucide-circle`
    - `running`: *Downloading*, active, `lucide-circle-dot`
    - `cancelling`: *Stopping*, warning, `lucide-triangle`
    - `succeeded`: *Complete*, good, filled circle
    - `partial`: *Partial*, warning, `lucide-triangle`
    - `failed`: *Failed*, critical, `lucide-square`
    - `cancelled`: *Cancelled by you*, neutral, `lucide-circle`
    - `abandoned`: *Interrupted*, serious, `lucide-diamond`
  - **Steps.** Render one run per state and look inside each run's row (found through its *Started* link's `closest("tr")`).
  - **Assertions per state.**
    - Exactly one `[data-variant^="status-"]` element exists, and its `data-variant` is `status-<tier>`.
    - Its `textContent` is exactly the label: the word is present, so the state is never conveyed by colour alone.
    - It holds one `svg` with `aria-hidden="true"` and `focusable="false"`.
    - The shape matches the fixture. For good, the svg's single child is a `circle` with `fill="currentColor"` (CAP-003-E1-S5 T004 (3)).
  - **Interrupted explanation.** The `abandoned` row also contains `INTERRUPTED_EXPLANATION`'s literal text, *FactorFlow stopped before this download finished, and the download was picked up as interrupted. Coverage written before it stopped is kept. Download again to continue.* (UX design 1.8 Interrupted explanation).
  - **Nothing is "not determinable".** No `[data-variant="coverage-unknown"]` element is rendered anywhere. Every download state is determinable, so `NotDeterminable` has no use on this screen (Other Notes).
  - Kills:
    - swap-case of any state in the call site (for example a hard-coded `tierOf({ of: "download", state: "succeeded" })`);
    - replacing `labelOf(status)` with the raw `state` (the label fixture);
    - remove-attribute of the `abandoned` explanation branch.
- [ ] T004 Implement TC-COMP-205 (Downloads last-updated advances at 10 s and announces politely) in `web/src/screens/runs/runs-screen.polling.test.tsx`, with a `// Implements TC-COMP-205` comment, using the file's pure fake timers (`vi.setSystemTime(new Date("2026-09-06T15:00:00Z"))`) (traces to DAC-E7-S4-2, AC-25).
  - **Setup.** `listAcquisitionRuns` always resolves one `running` run.
  - **Focus.** Before the polls, focus **Download now** (`getByRole("button", { name: "Download now" }).focus()`).
  - **After the first `advance(0)`.** `getByText("Last updated 10:00:00 CDT")` is present, and its element has `aria-live="polite"`.
  - **Three polls.** Advance `10_000` three times. After each advance the request count is 2, 3 and then 4, and the text reads *Last updated 10:00:10 CDT*, then *10:00:20 CDT*, then *10:00:30 CDT*, in the same `aria-live="polite"` element.
  - **Focus unmoved.** `document.activeElement` is still **Download now** after every poll.
  - **Cadence boundary.** Before each poll, `advance(9_999)` leaves the count unchanged.
  - Kills:
    - off-by-one on `RUNS_POLL_INTERVAL_MS` (`10_000` → `10_001`), caught by the exact-boundary count;
    - remove-attribute `aria-live`;
    - replacing `formatClock` with `formatInstant`: the minute-only text does not advance between the first two polls, so the *10:00:10* assertion fails.
- [ ] T005 Implement TC-COMP-186 (No raw run_id on any surface; Downloads first column is Started), DAC-E7-11 and the Downloads share of TC-COMP-183 and TC-COMP-184 in `web/src/screens/runs/runs-screen.test.tsx` (after T003), with `// Implements TC-COMP-186`, `// Implements TC-COMP-183 (Downloads)` and `// Implements TC-COMP-184 (Downloads)` comments (traces to DAC-E7-10, DAC-E7-11, DAC-E7-1, DAC-E7-4, AC-18, AC-19, AC-26).
  - **Page and table.**
    - `getByRole("heading", { level: 1, name: "Downloads" })` is present.
    - The table has `data-variant="history"`.
    - Its column headers, read from `columnheader` `textContent`, equal exactly `["Started", "Outcome", "Requested", "Ended", "Stocks downloaded", "Stocks failed"]`. The delivered *Run* column and the separate *Started* timestamp column are gone (Resolved Conflict 3).
    - Every body row's first cell is a `rowheader` (`th scope="row"`) containing the *Started* link.
  - **Counts.** For a run with `instrumentsWritten: 1236, instrumentsFailed: 0`, the cells read `1,236` and `0` (`formatCount`; UX design 0.7).
  - **Absent end time.** A `running` run's *Ended* cell shows the em dash with the visually hidden *Not recorded* (`Absent`).
  - **No raw id (TC-COMP-186), the list's share.** Render four UUID-id runs, then a start failure. Then:
    - `document.body.textContent` contains no `runId`;
    - for every element, none of `aria-label`, `aria-description`, `title`, `alt`, `placeholder` or `value` contains a `runId`;
    - the only attributes that carry it are the *Started* link's `href` and the `data-table`'s internal `data-row-id` key (Resolved Conflict 2).
  - The detail's and the cancel dialog's share of TC-COMP-186 is CAP-003-E7-S5's (its T010: the cancel failure line carries no run id).
  - **New paths (TC-COMP-183).** Every `a[href]` on the screen starts with `/data/downloads/` or equals `/settings`. Navigation after **Download now** is covered by T009.
  - Kills:
    - leaving the delivered `{item.runId}` link text (text check);
    - a `/runs/` link prefix (href check);
    - swap-case of `variant="history"` to `"compact"` (`data-variant` check).
- [ ] T006 Implement TC-COMP-210 (Downloads behaviour preserved; eight states through StateRegion) by relabelling the delivered cases of `web/src/screens/runs/runs-screen.test.tsx` and `runs-screen.polling.test.tsx`, with a `// Implements TC-COMP-210` comment on each relabelled `describe` (traces to DAC-E7-S4-7, AC-17, AC-24). Every request and its arguments stay exactly as delivered.
  - **Filter (TC-COMP-291 relabelled).**
    - Open the `combobox` named *Outcome* with `user.click`, then choose the `option` named *Failed*.
    - `listAcquisitionRuns` was last called with `{ state: "failed" }`.
    - The nothing-found text is *No download matches this filter.*, and **Reset filter** brings back the call with `{}`.
    - The filter's options, in order, are *All*, *Queued*, *Downloading*, *Stopping*, *Complete*, *Partial*, *Failed*, *Cancelled by you*, *Interrupted*.
  - **Never populated.** *No download has been requested yet.*, with no `table`. Never-populated and nothing-found are never shown together: the delivered cross-assertions are kept, relabelled.
  - **Error.**
    - Reject once with `new ApiError("boom", "req-7")`.
    - `getByRole("status")` has text exactly *Couldn't read downloads: FactorFlow hit an unexpected problem.* (DEC-0393).
    - The page contains neither `boom` nor `req-7`.
    - The `h1` and the *Outcome* `combobox` stay.
    - **Try again** (`StateRegion`'s button) calls `listAcquisitionRuns` again and the table returns.
    - An `ApiUnreachableError` reads *Couldn't read downloads: FactorFlow is not answering.*
  - **Truncation.** *Showing the 50 most recent downloads.* appears only when `nextCursor` is non-null.
  - **Pinning.** A `running` run returned last is the first body row (`tr[data-row-id]` order). Its badge is *Downloading*. Resolved Conflict 4 covers the dropped `data-in-progress` attribute.
  - **Preconditions.** `getHistoryDepth` is called once, and `listInstruments` is called with `{ lifecycle: "active", limit: 1 }`.
  - **Busy marker (polling file).** While a poll is in flight, the element wrapping the table (`getByRole("table").closest("[aria-busy]")`) has `aria-busy="true"`. It returns to `"false"` when the poll answers, and the previous *Started* link is still present.
  - **Polling cases.** The delivered polling cases stay: the requested, running and cancelling `it.each`; no request after an all-terminal first response; timer cleared on unmount. Only their link queries change, from the raw id to the *Started* link name.
  - Kills:
    - swap of the `empty-never-populated` and `empty-no-match` kinds in `setScreenState`;
    - negate-boolean on `filter === ""`;
    - removal of `cancelling` from `isNonTerminalRunState` (the polling `it.each`).
- [ ] T007 Implement TC-COMP-208 (Downloads states use the display vocabulary with the exact deltas) for the list in `web/src/screens/runs/runs-screen.test.tsx` (after T006), with a `// Implements TC-COMP-208` comment. The dialog states are T010's (traces to DAC-E7-S4-5, AC-19).
  - **Helper `sweepText()`.** It returns `document.body.textContent` joined with every element's `aria-label`, `aria-description`, `title`, `alt` and `placeholder` values. Text referenced by `aria-labelledby` or `aria-describedby` is already in `textContent`.
  - **Assertion.** It does not match `/\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`.
  - **States swept.** Populated with all eight states; never populated; nothing found; error (both reasons); the depth-blocked and no-stocks-blocked **Download now**; the queued sentence after a `202` with `queuedBehind`; a start failure; the sr-only busy region during a poll.
  - **Delta labels present.** *Downloads*, *Started*, *Stocks downloaded*, *Stocks failed*, **Download now** and *Requested* / *Ended* (kept).
  - **Self-check.** A control case shows the pattern matches *Start acquisition run* and *Refreshing runs*, so the sweep is not vacuous.
  - Kills:
    - leaving `Refreshing runs` in the sr-only busy region;
    - leaving the delivered `Showing the 50 most recent runs.`;
    - leaving `Loading runs…`.
- [ ] T008 Implement TC-COMP-206 (outcome-badge removed from web/src/screens/runs/) as a `describe("the delivered outcome badge is retired (TC-COMP-206, DAC-E7-S4-3)")` block in `web/src/screens/runs/runs-screen.test.tsx`, with a `// Implements TC-COMP-206` comment (traces to DAC-E7-S4-3, DAC-E7-5).
  - **The module name is built at runtime.** Use `const RETIRED = ["outcome", "badge"].join("-")`, so neither this file nor the Validation Plan's grep matches itself (self-contradicting-check rule).
  - **Walk.** Resolve the `web/src/` root from `import.meta.url`, as `web/src/app/shell.tokens.test.tsx` does, and walk every `.ts` and `.tsx` file under it with `node:fs`. Scanning all of `web/src/` matters: the module cannot be deleted while anything imports it.
  - **Assertions.**
    - No file contains an import specifier ending in `/${RETIRED}`, matched with `new RegExp(\`from\\s+["'][^"']*/${RETIRED}["']\`)`.
    - The walk found more than zero files (not vacuous).
    - `existsSync` is `false` for `runs/${RETIRED}.tsx` and `runs/${RETIRED}.test.tsx`.
  - Kills:
    - leaving the file on disk;
    - leaving any one import, for example `use-score-set-poll.ts`'s.

### Additional Unit Tests

- [ ] T009 [P] Relabel `web/src/screens/runs/run-controls.test.tsx` for the taken-over `StartRunControl`. The control is mounted in `<MemoryRouter initialEntries={["/data/downloads"]}>` with the location probe (traces to AC-15, AC-17, AC-18, AC-19, AC-26, DAC-E7-S4-5).
  - **Navigation after a `202`.** With `queuedBehind: null`, `onStarted` is called once with the result and the location becomes `/data/downloads/r-9`. When queued, the location stays `/data/downloads` and `getByRole("status")` reads exactly `QUEUED_NOTICE` = *A download is running. This starts when it finishes.*
  - **Refusals.**
    - A `409` `history_depth_not_set` turns the button `data-variant="blocked"`, `aria-disabled="true"`, not `disabled` and still focusable.
    - Its description is exactly `DEPTH_NOT_SET_REASON` = *History depth is not set. Set it in Settings before downloading.*
    - Inside that sentence, `getByRole("link", { name: "Settings" })` has `href="/settings"`.
    - `no_active_instruments` gives `NO_INSTRUMENTS_REASON` = *No stocks are followed. Follow stocks before downloading.*
    - With both, the depth reason comes first.
    - The refusal clears when the precondition props change.
    - The two reasons stay non-interchangeable (DAC-E7-9).
  - **Other failures.**
    - `new ApiError("x", "req-5", { code: "internal" })` gives `getByRole("alert")` *Couldn't start the download: FactorFlow hit an unexpected problem.*
    - An `ApiUnreachableError` gives *Couldn't start the download: FactorFlow is not answering.*
    - Neither `x`, `req-5` nor `/api/` appears (DEC-0393; UX design 0.7).
  - **Unchanged behaviour.** No double submit (one request for two rapid clicks, `aria-busy`, never `disabled`). The default label is **Download now**. A custom `label` is the accessible name and keeps the blocked, queued and navigation behaviour.
  - **Coverage's copy of these cases.** Update `web/src/screens/coverage/start-run.test.tsx` the same way: the button name, the two reasons, the queued sentence and the `/data/coverage` starting path. Import the reason constants from `../runs/run-controls` instead of restating them. No assertion's outcome changes (Other Notes, CAP-003-E7-S2).
  - Kills:
    - swap of the navigate target back to `/runs/`;
    - negate-boolean on `result.queuedBehind === null`;
    - swap-case of the two refusal codes (each reason fixture);
    - remove-attribute of `variant="blocked"` (the `aria-disabled` check).
- [ ] T010 [P] Extend `web/src/screens/runs/cancel.test.tsx` with the dialog-state vocabulary sweep (TC-COMP-208's dialog state; Resolved Conflicts 8 and 12), with a `// Implements TC-COMP-208 (dialog state)` comment (traces to AC-19, DAC-E7-S4-5).
  - **What exists.** CAP-003-E7-S5 relabels this file and rebuilds `cancel-run.tsx` before this story starts (its T010, T014). Do not change its cases or its wording.
  - **What is added.** A local `sweepText()` helper, copied from T007 (not exported from a test file). One `describe` that renders `CancelRunControl` and asserts the sweep pattern matches nothing over four states: the running dialog open, the queued dialog open, the dialog with its failure line (reject with `new ApiError("Network down", "req-4")`, E7-S5's own fixture, so the case passes whichever `{reason}` rule the owner keeps), and the already-finished result after a `409` `run_already_terminal`.
  - **Self-check.** A control asserts the pattern matches *Stop this run?* and *Cancelling run*, so the sweep is not vacuous.
  - Kills:
    - a regression to any delivered dialog word (*Stop run*, *Cancel queued run*, *Instruments already acquired*);
    - the delivered failure line *Cancelling run {runId} failed* restored.
- [ ] T011 [P] Write unit tests for the two new modules in a new `web/src/screens/runs/run-state.test.ts` (traces to AC-12, AC-17, AC-19, DAC-E7-5).
  - **`RUN_STATES`.** It equals the literal `["requested", "running", "cancelling", "succeeded", "partial", "failed", "cancelled", "abandoned"]` (the delivered filter order).
  - **`isNonTerminalRunState`.** True exactly for `requested`, `running` and `cancelling`, checked over the eight literals.
  - **`isRunState`.** True for each of the eight literals. False for `"Succeeded"`, `"cancelling "`, `""`, `null`, `42` and `"toString"`: the `Object.hasOwn` guard against prototype keys is kept.
  - **`failureReason` (from `./copy`).** `new ApiUnreachableError("GET /api/acquisition-runs could not be reached")` gives *FactorFlow is not answering*. `new ApiError("Run already reached a terminal state.", "req-9", { code: "internal" })` gives *FactorFlow hit an unexpected problem*. A plain `new Error("x")` gives the same. No result contains `message` text or `requestId`.
  - **`INTERRUPTED_EXPLANATION`.** It equals the UX design 1.8 literal.
  - Kills:
    - negate-boolean on the `instanceof ApiUnreachableError` test;
    - removal of a state from `isNonTerminalRunState`;
    - `Object.hasOwn` replaced by an `in` check (the `"toString"` case).

**Checkpoint**: T002-T011 are written and fail. The screen still renders *Runs*, the run-id link and `OutcomeBadge`. `run-state.ts` and `copy.ts` do not exist. The controls carry CAP-001's words. The retired module is still on disk.

---

## Phase 3: Core Implementation

**Purpose**: Move the non-visual helpers out of the retired module, then rebuild the four delivered files from `ui-components` in the display vocabulary.

- [ ] T012 Create `web/src/screens/runs/run-state.ts`. It imports nothing from React or `ui-components`, and nothing from the retired module (makes T011's state cases pass; traces to DAC-E7-5, AC-17).
  - **Exports.**
    - `RUN_STATES: readonly RunState[]`, in the delivered order;
    - `isRunState(value: unknown): value is RunState`, the delivered body over an own-key lookup table;
    - `isNonTerminalRunState(state: RunState): boolean`, the delivered body.
  - **Doc comment.** It is the non-visual half of the retired badge module. The tier and label of each state come from `tierOf` and `labelOf` (component design `ui-components` 2.3), and this module never maps a state to a tier or a word.
- [ ] T013 Create `web/src/screens/runs/copy.ts` (makes T011's copy cases pass; traces to AC-19, DAC-E7-S4-5).
  - **`INTERRUPTED_EXPLANATION`.** The UX design 1.8 sentence, verbatim.
  - **`failureReason(cause: unknown): string`**, per DEC-0393: `cause instanceof ApiUnreachableError ? "FactorFlow is not answering" : "FactorFlow hit an unexpected problem"`, with `ApiUnreachableError` from `../../api/client`. It never reads `message` or `requestId`.
  - **`readFailed(reason)`.** Returns `` `Couldn't read downloads: ${reason}.` ``
  - **`startFailed(reason)`.** Returns `` `Couldn't start the download: ${reason}.` `` (owner-web-app 8 item 7).
  - **Doc comment.** It cites UX design 0.7 (three-part errors; `request_id` never shown), STD-UI-19, AC-19 and DEC-0393. It also says no string here carries a DAC-E7-3 term.
- [ ] T014 Rewrite `web/src/screens/runs/run-table.tsx` (depends on T012, T013; makes T002, T003 and T005's table cases pass).
  - **Signature.** `RunTable({ runs, busy })` keeps its signature.
  - **Ordering.** The delivered non-terminal-first stable ordering is kept, using `isNonTerminalRunState` from `./run-state`.
  - **Rendering.**
    - `<Card aria-busy={busy}>` (CAP-003-E1-S1; each table on a `card`, epic NFR Layout).
    - Inside it, `<DataTable variant="history" label="Downloads" data={ordered} getRowId={(run) => run.runId} columns={COLUMNS} />` (CAP-003-E1-S4). No `onSortingChange` is passed: the delivered list has no sort.
  - **`COLUMNS`, in order.**
    1. **Started** (the row header). `const name = formatInstant(run.startedAt ?? run.requestedAt)`. The cell renders `<Link to={\`/data/downloads/${encodeURIComponent(run.runId)}\`} aria-label={\`Download started ${name}, open details\`} className="font-numeric underline">{name}</Link>`.
    2. **Outcome.** `const status = { of: "download", state: run.state } as const`. The cell renders `<StatusBadge tier={tierOf(status)}>{labelOf(status)}</StatusBadge>`, followed by `<p className="text-sm">{INTERRUPTED_EXPLANATION}</p>` when `run.state === "abandoned"`.
    3. **Requested.** `formatInstant(run.requestedAt)` in `font-numeric text-xs`.
    4. **Ended.** `run.endedAt === null ? <Absent label="Not recorded" /> : formatInstant(run.endedAt)`.
    5. **Stocks downloaded.** `meta: { numeric: true }`, rendering `formatCount(run.instrumentsWritten)`.
    6. **Stocks failed.** `meta: { numeric: true }`, rendering `formatCount(run.instrumentsFailed)`.
  - **Removed.** The `formatTimestamp` import (from the shell's health module), the local `Timestamp` helper, the hand-built `<table>`, the `data-in-progress` attribute and the left-border class (Resolved Conflict 4).
  - **Doc comment.** It is rewritten: the history variant allows no row action, so the *Started* link is the only way into a download. It cites UX design 1.7, owner-web-app 2.3, DAC-E7-10, DAC-E7-11 and DAC-E7-5. It writes no unit literal (T018 scans this file).
- [ ] T015 Rewrite `web/src/screens/runs/index.tsx` (depends on T012-T014; makes T004, T006, T007 pass).
  - **Kept as delivered.** The two precondition reads, the polling effect, `reloadToken`, `busy`, `RUNS_POLL_INTERVAL_MS = 10_000` and every request with its arguments.
  - **Changes.**
    - The `formatTimestamp` import is removed, and so is the retired-module import (`isNonTerminalRunState` now comes from `./run-state`).
    - The error branch sets `{ kind: "error", message: failureReason(cause), requestId: cause instanceof ApiError ? cause.requestId : "unknown" }`. `message` now holds the owner-facing reason, and `requestId` is never rendered (`ScreenState` is unchanged, DAC-E7-13).
    - The `h1` is *Downloads*.
  - **Toolbar.**
    - The *Outcome* filter is `<Select value={filter === "" ? "all" : filter} onValueChange={(v) => setFilter(v === "all" ? "" : (v as RunState))}>` with `<SelectTrigger variant="inline" aria-label="Outcome">`, beside a visible *Outcome* text. Its `SelectItem`s are *All* (`"all"`, a sentinel, because Radix forbids an empty item value) and then `RUN_STATES.map((s) => labelOf({ of: "download", state: s }))`.
    - `<StartRunControl …>` with the unchanged props.
    - `<p aria-live="polite" className="font-numeric text-xs text-muted-foreground">` reading `Last updated ${formatClock(screenState.fetchedAt)}` when populated, else *Not yet loaded*.
    - The sr-only polite region reads *Refreshing downloads* while busy.
  - **Body.** `<StateRegion state={screenState} onRetry={reload} renderers={…} />` (CAP-003-E1-S9), with these renderers:
    - `loading`: `<p>Loading downloads…</p>`.
    - `"empty-never-populated"`: `<p>No download has been requested yet.</p>`.
    - `"empty-no-match"`: *No download matches this filter.*, with `<Button variant="outline" onClick={() => { setFilter(""); reload(); }}>Reset filter</Button>`.
    - `populated`: `<RunTable runs={s.data.runs} busy={busy} />`, plus *Showing the 50 most recent downloads.* when `s.data.nextCursor !== null`.
    - `partial`: `{ notApplicable: "A page of the downloads list is read whole or not at all" }`.
    - `unavailable`: `{ notApplicable: "No check runs on this screen (UX design 1.7 States)" }`.
    - `error`: `(s) => readFailed(s.message)`.
    - `unreachable`: `{ notApplicable: "The shell replaces the main region (AC-23)" }`.
  - **Doc comment.** It is rewritten with the same structure: which kinds are produced, which are not applicable and why, and the polling rule (DEC-0005). It cites UX design 1.7, AC-24, AC-25 and DAC-E7-S4-2.
- [ ] T016 Rewrite `web/src/screens/runs/run-controls.tsx` (depends on T013; makes T009 pass).
  - **Kept.** The `StartRunControlProps` interface, the `pending` ref, the refusal state machine, `onStarted` before navigation, and the reset of a refusal on precondition-prop change.
  - **Default label.** **Download now**.
  - **Constants.**
    - `DEPTH_NOT_SET_REASON`: *History depth is not set. Set it in Settings before downloading.*
    - `NO_INSTRUMENTS_REASON`: *No stocks are followed. Follow stocks before downloading.*
    - `QUEUED_NOTICE`: *A download is running. This starts when it finishes.*
    - All three are verbatim from UX design 1.5 (*As 1.5* in 1.7) and owner-web-app 2.3. Their doc comments say so, replacing the delivered "ux-design 1.1, verbatim" comments (Resolved Conflict 5).
  - **The depth reason.** It renders as `<p id={depthId}>History depth is not set. Set it in <Link to="/settings">Settings</Link> before downloading.</p>`, so its `textContent` equals `DEPTH_NOT_SET_REASON`.
  - **The button.** It is `<Button variant={blocked ? "blocked" : "default"} aria-describedby={…} aria-busy={busy || undefined} onClick={…}>` (CAP-003-E1-S1). The delivered `tabIndex={0}` and the manual `preventDefault` for blocked are removed, because `blocked` is inert and focusable by contract.
  - **After a `202`.** `navigate(\`/data/downloads/${encodeURIComponent(result.runId)}\`)`.
  - **Other failures.** `setFailure(failureReason(cause))`, rendered as `<p role="alert">{startFailed(failure)}</p>`. The `(request …)` suffix is gone.
  - **Doc comment.** It is updated: AC-15, DAC-E7-9 (two non-interchangeable reasons, `blocked` never `disabled`) and DAC-E7-1. It drops the stale *Re-run acquisition* example, which now lives in the consuming story's file.
- [ ] T017 Verify `web/src/screens/runs/cancel-run.tsx` as CAP-003-E7-S5 delivered it; no edit is planned (Resolved Conflict 12; traces to DAC-E7-5, AC-26).
  - **Checks.** It imports nothing from the retired module. It renders the settled state through `StatusBadge` over `tierOf` and `labelOf`. It uses `ConfirmDialog` and `Button`, with no native `<dialog>`.
  - **If a check fails.** Stop and report it as CAP-003-E7-S5's unmet criterion (DAC-E7-S5-6, DAC-E7-9). Do not re-plan the dialog here.
  - **Retired helpers.** If `cancel-run.tsx` still imports a non-visual helper from the retired module, T019 repoints it to `./run-state`.
**Checkpoint**: T002-T007 and T009-T011 pass. The three rewritten files and E7-S5's `cancel-run.tsx` render the display vocabulary from `ui-components`. None of this story's files imports the retired module.

---

## Phase 4: Integration

**Purpose**: Retire the module everywhere, widen the literal scan, and prove the whole suite still holds the behaviour CAP-001 accepted.

- [ ] T018 Widen the literal scan in `web/src/components/token-literals.test.ts` (CAP-003-E1-S1's file; DAC-E7-S4-4; TC-COMP-207) (traces to AC-26, DAC-E7-S4-4).
  - **The entry.** Append `"web/src/screens/runs/"` to `SCANNED_DIRECTORIES`. The walk is recursive, so `detail/` is covered too, as the story asks once CAP-003-E7-S5 has landed, which it has (T001; Resolved Conflict 11).
  - **New case**, `// Implements TC-COMP-207`:
    1. `SCANNED_DIRECTORIES` contains `"web/src/screens/runs/"`.
    2. Walking it finds more than zero scanned sources, and every one `isScannedSource`. The new `run-state.ts` and `copy.ts` are among them, and no `*.test.ts(x)` is.
    3. `literalsIn` over every scanned source returns `[]`.
    4. The planted literal: `literalsIn("web/src/screens/runs/index.tsx", 'style={{ width: "12px" }}')` returns exactly `["web/src/screens/runs/index.tsx: 12px"]`, naming the file.
  - **No other edits.** Do not touch S1's existing cases or exports.
  - Kills:
    - leaving the directory out (case 1);
    - an inline `px` value in any rewritten file (case 3).
- [ ] T019 Retire the module (depends on T014-T017; makes T008 pass; traces to DAC-E7-5, DAC-E7-S4-3, AC-17).
  - **Repoint each importer recorded in T001**, by this mapping:
    - `isNonTerminalRunState` and `isRunState` → `./run-state`. For `web/src/screens/runs/detail/index.tsx` the path is `../run-state`. For `web/src/screens/research/use-score-set-poll.ts`, change line 5 only, to `import { isNonTerminalRunState } from "../runs/run-state";` (Open Gap 2).
    - `RUN_STATE_LABEL[s]` → `labelOf({ of: "download", state: s })`.
    - `ABANDONED_EXPLANATION` → `INTERRUPTED_EXPLANATION` from `copy.ts`, with the assertion's expected literal updated to the UX design 1.8 sentence.
  - **Delete** `web/src/screens/runs/outcome-badge.tsx` and `outcome-badge.test.tsx`. The tier assertions they carried live in CAP-003-E1-S5's `tiers.test.ts` and `status-badge.test.tsx` (owner-web-app 2.1).
  - **Run `npm run test`.** For every failure in a test outside this story's file list that comes only from the retired badge or relabelled shared controls (for example `run-detail*.test.tsx` querying the retired test id or *Cancelling* / *Succeeded* in `CancelRunControl`'s output, or `coverage/start-run.test.tsx`), change only the query and the expected word or path. Query the badge by its `[data-variant^="status-"]` element within the same container, and expect `labelOf`'s word. Never change an assertion's outcome.
  - **Scope check.** Confirm with `git diff --stat` that the only files changed are:
    - this story's `runs/` files (`index.tsx`, `run-table.tsx`, `run-controls.tsx`, `runs-screen.test.tsx`, `runs-screen.polling.test.tsx`, `run-controls.test.tsx`, `cancel.test.tsx`), plus `run-state.ts`, `run-state.test.ts` and `copy.ts`;
    - the two deletions;
    - `token-literals.test.ts`;
    - `use-score-set-poll.ts`, with exactly one line changed;
    - the test-only query fixes listed above.
  - Confirm that `web/src/api/types.ts`, `web/src/api/client.ts` and `web/src/app/` are unchanged.

**Checkpoint**: The retired module is gone. `npm run test` is green across the suite. Nothing imports a badge module from a screen.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [ ] T020 From the repo root, run the validation commands and the Validation Plan's story checks, and fix findings in this story's files only (traces to AC-18, AC-26, DAC-E7-S4-3).
  - **Commands.** `npm run lint`, `npm run format` (fix with `npx biome format --write` on this story's files only), `npx tsc --noEmit` and `npm run build`. `tsc` enforces `StateRenderers`' eight required entries and T003's `Record<RunState, …>` fixture.
  - **Story checks.** Run the Validation Plan's greps and confirm each prints nothing.
- [ ] T021 After each TDD cycle in T002–T020 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E7-S4-tdd-evidence.yaml` beside this story. Each entry records `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256`. `diff_sha256` is the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`. Append the entry before the next cycle begins. `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned (INV-TDD-002, TEST-TDD-008; traces to no AC). Cycles:
  1. T011 + T012 + T013: the state helpers and copy.
  2. T009 + T016: `StartRunControl`.
  3. T010 + T017: the dialog-state sweep. This cycle is test-only, with `mutation: {not_applicable: "test-only cycle: cancel-run.tsx is CAP-003-E7-S5's delivery, verified here"}`.
  4. T002-T007 + T014 + T015: the Downloads list.
  5. T008 + T018 + T019: retirement and the scan. T018's scan change is test-only, but T019 deletes production code.

  T020 adds no behaviour and joins cycle 5's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S2 | hard | **New edge.** The *Outcome* filter is `select` `inline` (UX design 1.7 Component Mapping and Deltas *Components*; AC-26), imported from `web/src/components/ui/select.tsx`, which S2 creates. The story's Dependencies omit it |
| CAP-003-E3-S6 | hard | **New edge.** `web/src/app/status-region.tsx` (owner-shell's, DEC-0211) imports `OutcomeBadge` from the retired module. Only E3-S6 deletes it (its Description; owner-shell 2.1), and this story may not edit `web/src/app/`. Deleting the module first would break the build (DAC-E7-S4-3; epic DAC-E7-5 "once no caller remains") |
| CAP-003-E7-S5 | hard | **New edge.** `detail/result-outcome-badge.tsx` imports `TierIcon`, `TIER_CLASSES` and `RunTier`, and `detail/run-summary.tsx` renders `OutcomeBadge`. The story says the former is "E7-S5's", and E7-S5's DAC-E7-S5-3 and DAC-E7-S5-6 remove both. The retired module cannot be deleted until they are gone (DAC-E7-S4-3). E7-S5's plan also rebuilds `cancel-run.tsx` and relabels `cancel.test.tsx` (its T010, T014), which this plan verifies (T017) and extends (T010). E7-S5's plan names this edge as the acyclic order and adds no edge back |
| CAP-003-E7-S2 | reverse | Coverage composes `StartRunControl` (`coverage/index.tsx:5`; `coverage/start-run.test.tsx`), whose label, reasons and route this story changes; T019 adjusts that test's expectations only. Edge E7-S2 → E7-S4 present (added by E7-S2's planning) |
| CAP-003-E7-S7 | reverse | The e2e specs locate the outcome by the retired `data-testid` (`cancel-run.spec.ts:29,66`, `diagnose-failure.spec.ts:125`, `runs-start-cancel.spec.ts:33,39`, `support/acquisition.ts:158`); edge E7-S7 → E7-S4 present |
| CAP-003-E3-S2 | context | `formatTimestamp` was copied to `web/src/app/health.tsx` by E3-S2. After E3-S6 the list may import it from there; this story removes that import either way |
| CAP-003-E1-S8 | context | Its `needs-you.ts` keeps a module-local non-terminal predicate rather than importing the retired module (patterns import no screen, design 2.2), so it is not an importer this story must repoint |
| CAP-003-E6-S1 | context | Its DEC-0373 derived the same two-case `{reason}` for reads; DEC-0393 reuses the wording so the product has one. Nothing is imported from `web/src/screens/data-health/` |
| CAP-003-E6-S2 | context | Its DEC-0378 applies the same wording to *Couldn't start the download: {reason}.* on Data health's own **Download now** |

The existing hard edges (CAP-003-E3-S4, CAP-003-E1-S4, CAP-003-E1-S1, CAP-003-E1-S5, CAP-003-E1-S6, CAP-003-E1-S9) stand. The graph line becomes `CAP-003-E7-S4: [CAP-003-E3-S4, CAP-003-E1-S4, CAP-003-E1-S1, CAP-003-E1-S5, CAP-003-E1-S6, CAP-003-E1-S9, CAP-003-E1-S2, CAP-003-E3-S6, CAP-003-E7-S5]`.

**No cycle as the graph stands.** None of the three new targets reaches CAP-003-E7-S4, directly or transitively. E3-S6 reaches E3-S3, E3-S4, E3-S5, E1 and E2-S5. E7-S5 reaches E3-S3, E3-S4 and E1.

### Task Dependencies

- T001: No dependencies.
- T002 → T003 → T005 → T006 → T007 → T008: same file (`runs-screen.test.tsx`), sequential. T004 is in `runs-screen.polling.test.tsx`, after T006's relabel of that file.
- T009, T010, T011: parallel with each other and with T002-T008.
- T012, T013: depend on T011.
- T014: depends on T012, T013.
- T015: depends on T014.
- T016: depends on T013.
- T017: depends on T001 (verification only).
- T018: depends on T014-T017, so the rewritten files are what it scans.
- T019: depends on T014-T017.
- T020: depends on T018, T019.
- T021: interleaved; runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- Phase 2: three tracks run in parallel. The list tests (T002-T008) and the polling file (T004) form one; T009 and T010 are the other two. T011 joins either.
- Phase 3: T016 and T017 run in parallel with each other and with T014. T015 waits on T014.

---

## Validation Plan

### Constitution-Defined Commands

Tech stack v7 Validation Commands, working directory `.`:

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test` (Vitest; also drives a real Vite build)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`
- `npm run test:e2e` is not this story's command. The e2e locators are CAP-003-E7-S7's (Other Notes).

### Story-Specific Validation

- **DAC-E7-S4-1, DAC-E7-S4-6, AC-12, AC-20.** T002 and T003 pass. *Partial* is `status-warning` with the triangle, and *Interrupted* is `status-serious` with its explanation.
- **DAC-E7-S4-2, AC-25.** T004 passes under fake timers at exactly 10 000 ms.
- **DAC-E7-S4-3.** T008 passes. Each of these must print nothing:
  - `grep -rnE "from ['\"][^'\"]*/outcome-badge['\"]" web/src`
  - `ls web/src/screens/runs/outcome-badge.tsx web/src/screens/runs/outcome-badge.test.tsx 2>/dev/null`
  - The grep matches only an import specifier, so the module name in this plan and the runtime-built name in T008 do not trip it.
- **DAC-E7-S4-4.** T018 passes. A temporary `style={{ width: "12px" }}` in `index.tsx` fails it, naming the file; revert it afterwards.
- **DAC-E7-S4-5, AC-19.** T007 and T010 pass. They sweep the rendered DOM, which is the surface the criterion names. No source grep is planned: module paths (`./run-state`, `./run-controls`), identifiers (`RunTable`, `runId`, `RunState`) and comments may keep domain terms (DAC-E7-13), so a source scan for *run* would fail on code the plan requires.
- **DAC-E7-S4-7, AC-17, AC-24.** T006 and T009 pass, and E7-S5's `cancel.test.tsx` cases still pass, with every delivered request and argument unchanged. `npx tsc --noEmit` passes with `StateRegion`'s eight entries.
- **AC-18, DAC-E7-1.** T005 and T009 pass. `grep -rnE "[\"'\`]/runs" web/src/screens/runs --include=*.tsx --include=*.ts | grep -v "\.test\."` prints nothing.
- **AC-26, DAC-E7-11.**
  - T005 passes (`data-variant="history"`).
  - `grep -nE "<(select|dialog|table)\b" web/src/screens/runs/index.tsx web/src/screens/runs/run-table.tsx web/src/screens/runs/run-controls.tsx web/src/screens/runs/cancel-run.tsx` prints nothing.
  - T018 passes.
- **DAC-E7-13.** `git diff --exit-code -- web/src/api/types.ts web/src/api/client.ts web/src/app` exits 0.

---

## Notes

### Resolved Conflicts

1. **When the retired module can be deleted.** Story DAC-E7-S4-3 requires the two files gone "after this story". Epic DAC-E7-5 deletes them "once no caller remains". The story also says `detail/result-outcome-badge.tsx` "is E7-S5's", and `web/src/app/` is owner-shell's (DEC-0211). The three statements are consistent once the order is fixed: this story runs after the stories that remove the rendering callers it may not edit. That is the two new hard edges, to CAP-003-E7-S5 and CAP-003-E3-S6. It then repoints the remaining non-visual imports itself (T019). The story's "Replaces every caller" governs this scope. The graph omission is corrected, and no artifact is contradicted.
2. **TC-COMP-186 "search text and attributes" against DAC-E7-1.** Epic DAC-E7-1 and DAC-E7-10 require the *Started* link to open `/data/downloads/{run_id}`, so its `href` must carry the id. The test specification is the lowest rung, and its "attributes" cannot mean every attribute. **Governing: epic DAC-E7-1 and DAC-E7-10.** The test (T005) forbids the id in text, accessible names and descriptions, `title`, `alt`, `placeholder` and `value`. It accepts it in `href` and in `data-table`'s internal `data-row-id` key (CAP-003-E1-S4's `getRowId`), which no owner perceives.
3. **The delivered *Started* timestamp column.** The delivered table has a *Run* link column and a separate *Started* column. UX design 1.7 makes the first column *Started*, the link, and lists only *Requested* and *Ended* as unchanged. **Governing: UX design 1.7 and owner-web-app 2.3.** The separate column is folded into the first, giving the columns *Started*, *Outcome*, *Requested*, *Ended*, *Stocks downloaded*, *Stocks failed* (T005).
4. **The in-progress row marker.** CAP-001 v5 §1.4 marks a non-terminal row with a left border and `data-in-progress`. CAP-003-E1-S4's `data-table` exposes no per-row attribute or class. **Governing: AC-26 and DAC-E7-11** (the `history` variant). The variant's styling is the component's. The pinning (non-terminal first, stable) is kept, and the mark is the row's *Queued*, *Downloading* or *Stopping* badge. No action, confirmation, refusal or cadence changes (AC-17).
5. **Delivered comments claiming verbatim copy.** `run-controls.tsx:6-12` ("ux-design 1.1, verbatim") and the retired module's PROVISIONAL `RUN_STATE_LABEL` (*Requested*, *Running*, *Succeeded*, *Abandoned* and so on) disagree with UX design 1.5-1.8 and `labelOf`. **Governing: DAC-E7-4, owner-web-app 2.3 and UX design 1.5-1.8.** Comments carry no authority and are rewritten with the strings (register C5).
6. **`(request …)` and the API's message in delivered error copy.** The delivered list and start errors show the envelope's `message` and `request_id`. **Governing: UX design 0.7** ("the envelope's `code` selects the wording and `request_id` is never shown") and STD-UI-19. AC-17 preserves outcomes, not words. The reason clause is DEC-0393.
7. **How a refused start reads.** Owner-web-app 8 item 7 says a refused start "names the operation and the reason (*Couldn't start the download: ...*)". DAC-E7-9 and AC-17 keep "the same two non-interchangeable reasons CAP-001 defined". CAP-001 rendered those two `409`s as the `blocked` button with its reason. **Governing: epic DAC-E7-9 and AC-17.** The two refusals keep the `blocked` rendering with the UX design 1.5 sentences. Each sentence names the operation (*before downloading*). Every other failure reads *Couldn't start the download: {reason}.*, which is design 8.7's wording (T009, T016).
8. **The "dialog state" of the Downloads list.** DAC-E7-S4-5 and TC-COMP-208 sweep the list's dialog state, but the list renders no dialog (register G17). The only dialog in this story's file list is the cancel confirmation in `cancel-run.tsx`. **Governing: the story's file list.** T010 sweeps that dialog in all its states.
9. **The *Started* name of a download still queued.** A `requested` download has no `startedAt`. **Settled by precedent (constraint 9.5):** `formatDownloadName(startedAt ?? requestedAt)` (component design `ui-components` 2.5) names a download by its request time while it waits. UX design 1.3 renders *The first download, started {start time}, …* with "the time being `latest_download.started_at`, or `requested_at` while it waits to start". The cell and link name use `startedAt ?? requestedAt` with the same *Download started {time}, open details* pattern (T002).
10. **The story's "[AC-18]" text against capability AC-18.** Capability AC-18 is about old paths still arriving (legacy redirects, CAP-003-E3-S4's). The story restates it as "internal links point at the new paths", and epic DAC-E7-1 carries that obligation. No behaviour conflicts. This story's links and navigation target the new paths (T005, T009), and the redirects stay E3's (register C4).
11. **When the scan covers `detail/`.** The story's Implementation widens the scan to `web/src/screens/runs/`, with "the `detail/` subdirectory included once E7-S5 lands". S1's scan walks directories recursively, and the new edge to CAP-003-E7-S5 means E7-S5 has landed when this story runs, so the single entry covers `detail/` as intended. E7-S5's own `"web/src/screens/runs/detail/"` entry stays; the two entries overlap harmlessly.
12. **Who rebuilds `cancel-run.tsx`.** This story's Implementation lists `cancel-run.tsx` and `cancel.test.tsx`. Every criterion they deliver belongs to CAP-003-E7-S5: DAC-E7-8 (the two confirmations' wording and outcomes, *already finished*), DAC-E7-9 (`dialog` `confirm`) and DAC-E7-S5-6 (*Stopping* through `StatusBadge`). Their only production consumer is the detail (`detail/run-summary.tsx`). This story's own criteria need only two things from them: no import of the retired module, and the dialog-state sweep. **Governing: the acceptance criteria over the Implementation file list** (constraint 9.1). With the edge CAP-003-E7-S4 → CAP-003-E7-S5, E7-S5 lands first, and its plan rebuilds both files (CAP-003-E7-S5 plan T010, T014). This plan verifies the result (T017) and adds its sweep (T010).

### Open Gaps

1. **The `{reason}` clause of a failure on Downloads and its shared controls. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0393.**
   - **What is undetermined.** UX design 1.7 requires *Couldn't read downloads: {reason}.*, and owner-web-app 8 item 7 requires *Couldn't start the download: ...*. UX design 0.7 says the envelope's `code` selects the wording, and that `request_id` is never shown. No artifact gives the wording for any code. The delivered messages carry domain terms: an `ApiUnreachableError` message such as *POST /api/acquisition-runs could not be reached*, or the server's *Run already reached a terminal state.*
   - **What the plan adopts (T011, T013, T015, T016).** `failureReason(cause)` returns *FactorFlow is not answering* for an `ApiUnreachableError` and *FactorFlow hit an unexpected problem* for anything else. It never reads `message` or `requestId`. It is used by the list read and by **Download now**'s non-refusal failures.
   - **Derivation.** The delivered reads and writes here answer `200`/`202`, a handled `409` (the two refusals; `run_already_terminal`) or the `500` envelope, so only two cases reach a sentence. The wording is the one the sibling plans derived: DEC-0373 for reads and DEC-0378 for Data health's **Download now**. That derivation was UX design 0.5's unreachable heading as a clause, plus CAP-002's delivered `FALLBACK_ERROR`, so the product keeps one wording.
   - **Alternatives rejected.** Rendering `ApiError.message` (AC-19; DAC-E7-S4-5). A per-code table, because no other code reaches these sentences.
   - **Classification.** Propagating. `StartRunControl` renders on Coverage (CAP-003-E7-S2) and the download detail (CAP-003-E7-S5), whose tests read its sentences.
   - **Owning design.** `component-design-owner-web-app.md` 2.3 and 8, with UX design 1.7 States, at its next revision.
2. **Where the retired module's non-visual helpers go (register G1).** No artifact says where `isNonTerminalRunState` and `isRunState` move, or who edits CAP-002's importer `web/src/screens/research/use-score-set-poll.ts`. **Minimal resolution (T012, T019):** a new `web/src/screens/runs/run-state.ts` inside `owner-web-app`'s directory, plus a one-line import change in `use-score-set-poll.ts`. DEC-0211 gives every file under `web/src/screens/` to `owner-web-app`. Capability AC-27 constrains CAP-002's routes, not an import path, and the hook's behaviour is unchanged. CAP-003-E1-S8 deliberately keeps its own local predicate, because patterns import no screen (design 2.2). **Follow-up:** owner-web-app 2.1's file list should name `run-state.ts`, `copy.ts` and the `use-score-set-poll.ts` import at its next revision.
3. **The *Stocks downloaded* and *Stocks failed* counts may always read 0 (register G9; verified 2026-11-07).** In `src/`, `acquisition_run.instruments_written` and `instruments_failed` are only declared (`0004_runs.sql`, default 0), read (`runs/queries.py`) and serialised (`api/routes/runs.py`, `api/models.py`). No runtime code writes them. This story renders the delivered fields unchanged (AC-17; system design constraint 2), and T005 asserts the rendering from fixtures. **Genuine gap, outside E7's scope:** a CAP-001 defect for CAP-001's `component-design-run-journal.md` to absorb. It does not block this plan.

### Other Notes

- **Cycle risk with sibling plans, for the coordinator.** This plan adds `CAP-003-E7-S4 → CAP-003-E7-S5` and `→ CAP-003-E3-S6`.
  - **CAP-003-E7-S5.** Its plan agrees: it takes E7-S4 → E7-S5 as the acyclic order, adds no edge back, rebuilds `cancel-run.tsx` and `cancel.test.tsx`, and consumes `StartRunControl` as delivered with an explicit `label="Download now"`. Any later edge `E7-S5 → E7-S4` would make a cycle.
  - **Two provisional wordings for one failure reason.** E7-S5's cancel failure line is *Couldn't cancel this download: {reason}.*, with `{reason}` the error's `message` (DEC-0396; its T010 fixture *Network down*). This plan's DEC-0393, like CAP-003-E6-S1's and CAP-003-E6-S2's decisions, never shows `message`, because envelope messages carry domain terms (*Run already reached a terminal state.*). Under E7-S5's rule, a `409` or `500` whose message contains *run* would show that word in the detail's dialog. When the coordinator allocates the two decisions, it should put them to the owner together, so the product keeps one `{reason}` rule. T010 uses a neutral fixture, so it passes under either rule.
  - **CAP-003-E3-S6.** `runs/index.tsx` and `run-table.tsx` import `formatTimestamp` from `status-region.tsx`. If E3-S6's plan adds `E3-S6 → E7-S4` for them instead of repointing them to `web/src/app/health.tsx` (CAP-003-E3-S2), the graph cycles. This story removes that import either way (T014, T015).
- **e2e locators.** `StatusBadge` carries no `data-testid`, so the e2e locators by the retired test id stop matching once this story lands. Those are `tests/e2e/cancel-run.spec.ts:29,66`, `diagnose-failure.spec.ts:125`, `runs-start-cancel.spec.ts:33,39` and `support/acquisition.ts:158`. They are CAP-003-E7-S7's files, and E7-S7 depends on this story. Locate the badge by its label inside the row or summary, as T003 does.
- **Shared file.** `web/src/components/token-literals.test.ts` is widened by every screen story (CAP-003-E1-S1 DAC-E1-S1-2). Expect a one-line merge with siblings; append, never reorder.
- **Coverage's start test.** `web/src/screens/coverage/start-run.test.tsx` is CAP-003-E7-S2's file, but it exercises this story's `StartRunControl`. T009 and T019 change only its expected words and paths, through the imported constants. If E7-S2 has already relabelled it, nothing is left to do.
- **`NotDeterminable` on this screen.** DAC-E7-S4-6 says a state is "not determinable through `NotDeterminable`". Every value on Downloads is determinable: the state is a `RunState` the API always sends, the times are recorded instants or absent, and the counts are integers. So no element renders through `NotDeterminable`, and T003 asserts no `coverage-unknown` badge appears. An undetermined value would go through `NotDeterminable`, never a tier.
- **Last-updated format.** The story's Dependencies name `formatClock`, and DAC-E7-S4-2 needs a visible advance every 10 s, so the line reads *Last updated HH:MM:SS zone*. The date is not repeated.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `web/src/screens/runs/run-table.tsx`: `run.startedAt ?? run.requestedAt` → `run.requestedAt ?? run.startedAt`
  - `web/src/screens/runs/run-table.tsx`: `tierOf({ of: "download", state: run.state })` → `tierOf({ of: "download", state: "succeeded" })`
  - `web/src/screens/runs/run-state.ts`: `state === "requested" || state === "running" || state === "cancelling"` → `state === "requested" || state === "running"`
  - `web/src/screens/runs/index.tsx`: `RUNS_POLL_INTERVAL_MS = 10_000` → `RUNS_POLL_INTERVAL_MS = 10_001`
  - `web/src/screens/runs/copy.ts`: `cause instanceof ApiUnreachableError ?` → `!(cause instanceof ApiUnreachableError) ?`
  - `web/src/screens/runs/run-controls.tsx`: `` `/data/downloads/${encodeURIComponent(result.runId)}` `` → `` `/runs/${encodeURIComponent(result.runId)}` ``
