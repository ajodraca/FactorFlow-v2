---
artifact_schema_version: 1
artifact_id: CAP-003-E7-S6-tasks
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
  timestamp: 2026-11-07T06:53:57Z
  source_artifacts:
    - id: CAP-003-E7-S6
      version: "1"
    - id: CAP-003-E7
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-web-app
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-owner-web-app-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E7-S6 — The Vocabulary Sweep over the Five Screens and the requestJson Export Check

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/taking-over-the-delivered-screens/stories/CAP-003-E7-S6.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/screens/`; design module `owner-web-app`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Writes one new test file, `web/src/screens/vocabulary.test.tsx` (owner-web-app 2.1, 7; epic DAC-E7-3). It renders each of the five taken-over screens (Coverage, Followed stocks, Downloads, Download detail and Settings) in its populated, empty, error and dialog states. In every state it asserts that none of *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired* and *Provider credential* appears as a whole word, in any case, in the page's `textContent` or in the accessible name of any element. Accessible names are read through Testing Library's `getByRole` name queries (DAC-E7-S6-2). Each case is named after its screen and state, and a failure message names the screen, the state and the term found (DAC-E7-S6-1). The matcher has its own fixture tests (TC-COMP-219). A planted *Retired* in a screen's `copy.ts` proves the sweep is live (TC-COMP-218). The same file imports `{ requestJson }` from `web/src/api/client.ts` and checks it type-checks and works, and it checks that the `instruments` and `runs` screen directories keep their names. A recorded `git diff` against the pre-CAP-003 baseline shows `web/src/api/types.ts`, `client.coverage.test.ts`, `client.runs.test.ts` and `render.test.tsx` unchanged by E7 (DAC-E7-12, DAC-E7-13, TC-COMP-220). `requestJson` is already exported, at `web/src/api/client.ts:154` (CAP-002-E4-S1), so this story confirms the export and edits no production file. The screens are rendered with test doubles of the delivered `web/src/api/client.ts` read functions, fed by the fixture builders in `web/src/screens/coverage/test-fixtures.ts` and by independent literals.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-19 | Every user-visible label on the five screens uses the STD-UI-1 display label, never the domain term | T003, T004, T005, T006, T007, T008, T009, T011, T012 |
| AC-17 | `client.ts` exports `requestJson`; the delivered client tests are unchanged | T010, T012 |
| DAC-E7-3 | The sweep renders each of the five screens in its populated, empty, error and dialog states and finds none of the eight terms as a whole word, in any case, in visible text or accessible names | T002, T004, T005, T006, T007, T008, T009, T012 |
| DAC-E7-12 | `client.ts` exports `requestJson` (CAP-002 already added it); this story confirms it | T001, T010, T012 |
| DAC-E7-13 | The screen directories keep their delivered names; `web/src/api/types.ts` is not edited | T010, T012 |
| DAC-E7-S6-1 | A *Retired* planted in a screen's `copy.ts` fails the sweep, naming the screen, the state and the term | T002, T003, T004, T012, T013 |
| DAC-E7-S6-2 | The matcher reads `textContent` and every element's computed accessible name (`getByRole` name queries), whole words, case-insensitive; *running* and *Coverage* pass | T002, T003 |
| DAC-E7-S6-3 | `import { requestJson }` type-checks; `types.ts` and the `instruments` and `runs` directory names are unchanged from before E7 | T010, T012 |

Mapped test cases, from `tests/component/owner-web-app-tests.md` and confirmed in `tests/coverage-matrix.md` lines 317, 326, 327 and 359-361:
- **TC-COMP-218** (AC-19, DAC-E7-S6-1, DAC-E7-3);
- **TC-COMP-219** (AC-19, DAC-E7-S6-2, DAC-E7-3);
- **TC-COMP-220** (AC-17, AC-19, DAC-E7-S6-3, DAC-E7-12, DAC-E7-13).

The test specification is `status: draft`. Its steps are used as written and sharpened below. Each screen's own vocabulary case (TC-COMP-189, 195, 201, 208 and 215) belongs to CAP-003-E7-S1 to CAP-003-E7-S5 and is not repeated here.

## Phase 1: Setup

**Purpose**: Confirm the screens and helpers this file imports are in the tree with the API this plan uses, and record the green baseline.

- [ ] T001 From the repo root run `npm ci` and `npm run test` and record the suite green before any change. Then confirm that each hard dependency has landed, with the exports and behaviour this plan relies on (traces to AC-17, AC-19, DAC-E7-12). If anything is missing, stop and report the missing story rather than stubbing it.
  - **The five screens' default exports**:
    - `web/src/screens/coverage/index.tsx` (`CoverageScreen`, CAP-003-E7-S2);
    - `web/src/screens/instruments/index.tsx` (`InstrumentsScreen`, CAP-003-E7-S3);
    - `web/src/screens/runs/index.tsx` (`RunsScreen`, CAP-003-E7-S4);
    - `web/src/screens/runs/detail/index.tsx` (`RunDetailScreen`, which reads `useParams().runId`, CAP-003-E7-S5);
    - `web/src/screens/settings/index.tsx` (`SettingsScreen`, CAP-003-E7-S1).
  - **Test fixtures**: `web/src/screens/coverage/test-fixtures.ts` exports `row`, `view`, `UNAVAILABLE_REASON` and `installRadixSelectShims` (CAP-003-E7-S2 T002).
  - **Shell context**: `web/src/app/shell-context.tsx` exports `useShell` and `type ShellContextValue` (CAP-003-E3-S3). Only `SettingsScreen` and `RunDetailScreen` call `useShell()`.
  - **The `requestJson` export**: `grep -n "^export async function requestJson" web/src/api/client.ts` prints line 154 (CAP-002-E4-S1; CAP-003-E3-S1 T001 left the file untouched).
  - **No sibling vocabulary failure is open**: each screen's own vocabulary test passes (CAP-003-E7-S1 T006, E7-S2 T007, E7-S3 T005, E7-S4 T007 and T010, E7-S5 T007).
  - **Baseline diff**: `git diff --exit-code 996f8a33ac8501c58791009fffe2f826d298d9bc -- web/src/api/types.ts web/src/api/client.coverage.test.ts web/src/api/client.runs.test.ts web/src/api/render.test.tsx` exits 0 (Other Notes, *The "before E7" baseline*). Record the result.

**Checkpoint**: All five screens and both helpers are present; the suite is green; nothing has changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the sweep, its matcher self-tests and the export check, all in one new file. Every task below edits `web/src/screens/vocabulary.test.tsx`, so they run in order.

**Fixture rule.** Every fixture value and every expected string is an independent literal, never read from a screen's `copy.ts` or a component constant. Reasons carried by rejected promises (`"service unavailable"`, `"Network down"`) contain none of the terms. The sweep then passes or fails on the screen's own copy, whichever `{reason}` rule the owner keeps (Other Notes, *Error reasons*).

**State markers.** Each case first waits for a marker that proves the state really rendered, then sweeps. Without the marker, a blank or still-loading screen would pass vacuously. Markers are strings pinned by UX design 1.5 to 1.9 or owner-web-app 2.3, as listed in each task, or a role the sibling plans pin.

### Mandatory Component Tests

- [ ] T002 Write the shared harness and the matcher at the top of `web/src/screens/vocabulary.test.tsx`. This is support for T003 to T010 (traces to DAC-E7-3, DAC-E7-S6-1, DAC-E7-S6-2).
  - **Client doubles.** `vi.mock("../api/client", async (importOriginal) => ({ ...(await importOriginal<typeof import("../api/client")>()), … }))`, with these replaced by `vi.fn()`:
    - `fetchCoverage`, `fetchCoverageGapDates`;
    - `listInstruments`, `addInstruments`, `retireInstrument`;
    - `getHistoryDepth`, `setHistoryDepth`;
    - `listAcquisitionRuns`, `getAcquisitionRun`, `startAcquisitionRun`, `cancelAcquisitionRun`;
    - `fetchHealth`.

    `ApiError`, `ApiUnreachableError` and `requestJson` stay real, which T010 relies on. These are the delivered functions the five screens call (`client.ts` lines 129-574). The doubles sit at the client because the delivered fixture builders (`coverage/test-fixtures.ts`) return the client's shapes (`CoverageView`, `CoverageRow`), not wire JSON (Other Notes, *"Doubled fetch fixtures"*).
  - **Shell double.** `vi.mock("../app/shell-context", async (importOriginal) => ({ ...(await importOriginal<typeof import("../app/shell-context")>()), useShell: vi.fn() }))`. A helper `shellWith(health: ShellContextValue["health"]): ShellContextValue` returns:
    - `health`;
    - `attention: { kind: "loading" }` and `scores: { kind: "loading" }` (owner-shell 2.3);
    - `refresh: vi.fn()` and `setTitleDetail: vi.fn()`.

    `beforeEach` sets `vi.mocked(useShell).mockReturnValue(shellWith(ANSWERING_PRESENT))`. This is CAP-003-E7-S1's harness, widened to the full value. Because `useShell` is doubled, no `ShellProvider` (mounted in the product by CAP-003-E3-S6) is needed.
  - **Health fixtures**, typed as `ShellContextValue["health"]` (CAP-003-E3-S2's `HealthState`, not imported directly), as independent literals:
    - `ANSWERING_PRESENT`: `{ liveness: "answering", health: { status: "ok", database: "reachable", credential_present: true, schema_version: 4, most_recent_run: null }, lastUpdated: new Date("2026-10-15T22:30:00Z"), lastAnsweredAt: new Date("2026-10-15T22:30:00Z") }`;
    - `ANSWERING_MISSING`: the same with `credential_present: false`;
    - `UNREACHABLE`: `{ liveness: "unreachable", health: ANSWERING_MISSING.health, lastUpdated: new Date("2026-10-15T22:31:00Z"), lastAnsweredAt: new Date("2026-10-15T22:30:00Z") }`.
  - **Per-test setup.** `beforeEach` calls `installRadixSelectShims()`, because the Downloads and detail cases open a Radix `select`. It also sets every client double's default:
    - `getHistoryDepth` resolves `{ years: 5, updatedAt: "2026-10-01T00:00:00Z" }`;
    - `listInstruments` resolves `FOLLOWED_PAGE` = `{ rows: [{ instrumentId: 1, symbol: "AAPL", lifecycle: "active" }, { instrumentId: 2, symbol: "MSFT", lifecycle: "retired" }], activeCount: 1, retiredCount: 1, nextCursor: null }`, which also feeds the preconditions read of Coverage and Downloads;
    - `fetchCoverage` resolves `view({ rows: [row(), row({ symbol: "MSFT", lifecycle: "retired", dataTypes: { reference: "present", prices: "absent", fundamentals: "unknown", corporate_actions: "present" } }), row({ symbol: "KO", depthShortByYears: 2 })] })`;
    - `fetchCoverageGapDates` resolves `{ symbol: "AAPL", gapDates: ["2024-01-03"] }`.
  - **`renderAt(path, routePath, element)`** renders `<MemoryRouter initialEntries={[path]}><Routes><Route path={routePath} element={element} /></Routes></MemoryRouter>` and returns `userEvent.setup()`. The routes are owner-shell 2.6's:
    - `/data/coverage`;
    - `/data/followed`;
    - `/data/downloads`;
    - `/data/downloads/:runId` (CAP-003-E3-S4 registers `:runId`);
    - `/settings`.
  - **Matcher.** `const TERMS = /\b(instruments?|acquisition|acquire|acquired|runs?|retire|retired|provider\s+credential)\b/i`, with a global copy for `matchAll`. It holds the eight terms of DAC-E7-3 plus the two inflections the delivered copy used, *Instruments* and *acquired* (Other Notes, *Two inflections added to the matcher*).
  - **`bannedTermsIn(root: HTMLElement): { term: string; where: string }[]`** builds its result in two passes:
    - (1) every match of `TERMS` in `root.textContent`, as `{ term, where: "text" }`;
    - (2) for every role key of `getRoles(root)` (from `@testing-library/react`, which re-exports `@testing-library/dom`; no new package), each element returned by `queryAllByRole(root, role, { name: (accessibleName) => TERMS.test(accessibleName) })`, as `{ term, where: \`${role} named "${accessibleName}"\` }`.

    The scan is always rooted at `document.body`, because Radix dialogs and select content portal there.
  - **`assertNoBannedTerms(screen: string, state: string): void`** throws `new Error(\`${screen} — ${state}: ${found.map((f) => \`"${f.term}" in ${f.where}\`).join("; ")}\`)` when anything is found. The message itself names the screen, the state and the term, so the name never depends on the diff renderer (DAC-E7-S6-1).
  - **Case table.** `type SweepCase = { screen: Screen; kind: "populated" | "empty" | "error" | "dialog"; state: string } & ({ run: (user) => Promise<void> } | { notApplicable: string })`. `Screen` is the literal union `"Coverage" | "Followed stocks" | "Downloads" | "Download detail" | "Settings"`. `CASES: SweepCase[]` is filled by T004 to T008. The cases run as `it.each(CASES.filter(hasRun))("$screen — $state", …)`: each awaits `run(user)`, which renders the case and waits for its marker, then calls `assertNoBannedTerms(screen, state)`.
- [ ] T003 Implement TC-COMP-219 (Sweep matcher reads text and accessible names as whole words, case-insensitive) as `describe("matcher (TC-COMP-219, DAC-E7-S6-2)")`, with a `// Implements TC-COMP-219` comment. Each case renders a plain fixture, with no screen involved (traces to DAC-E7-S6-2, AC-19).
  - (a) `<section><h2>Coverage</h2><p>A download is running. Running totals.</p><button aria-label="Coverage running">Go</button><a href="/x" aria-label="Rerun">x</a></section>`: `bannedTermsIn(document.body)` equals `[]`. *running*, *Running*, *Coverage* and *Rerun* are not whole-word matches.
  - (b) `<button aria-label="Run">Go</button>`: `textContent` is `"Go"`, and the result equals exactly `[{ term: "Run", where: 'button named "Run"' }]`. *Run* appears only in an accessible name and is caught through the `getByRole` name pass.
  - (c) `<p>PROVIDER\nCREDENTIAL and ACQUISITION</p>`: terms `["PROVIDER\nCREDENTIAL", "ACQUISITION"]`, both `where: "text"`. This proves any case and whitespace inside the phrase.
  - (d) `<p>Retired</p>`: `expect(() => assertNoBannedTerms("Coverage", "nothing found")).toThrow('Coverage — nothing found: "Retired" in text')`. The message names the screen, the state and the term.
  - (e) `<p>Instruments</p><p>Last acquired</p>` (the two added inflections): terms `["Instruments", "acquired"]`.
  - Kills:
    - remove-attribute of the `i` flag on `TERMS` (cases c and b fail);
    - a hand-written mutant dropping `\b` (case a: *running* matches);
    - a hand-written mutant deleting the role pass (case b returns `[]`);
    - drop-field-copy of `screen` or `state` from the thrown message (case d).
- [ ] T004 Implement TC-COMP-218 (Vocabulary sweep fails live when a term is introduced) for **Coverage**, with a `// Implements TC-COMP-218` comment. Append these rows to `CASES`; each renders `renderAt(entry, "/data/coverage", <CoverageScreen />)` (traces to DAC-E7-3, DAC-E7-S6-1, AC-19).
  - `populated` — *populated, row expanded*: wait for `findByRole("table")`. Press `{Enter}` on `getByRole("button", { name: /details for AAPL$/ })` (CAP-003-E1-S4's expander name). Wait until `fetchCoverageGapDates` was called with `"AAPL"`, then `findByText("2024-01-03")`.
  - `populated` — *populated, gap detection unavailable*: `fetchCoverage` resolves `view({ gapDetection: { available: false, reason: UNAVAILABLE_REASON } })`. Marker: `findByText("Gap detection needs at least two stocks holding data in this range.")` (CAP-003-E7-S2 T011).
  - `populated` — *start blocked*: `getHistoryDepth` resolves `{ years: null, updatedAt: null }` and `listInstruments` resolves `{ ...FOLLOWED_PAGE, activeCount: 0 }`. Marker: `findByRole("link", { name: "Settings" })`, which sits inside the depth reason (owner-web-app 2.3).
  - `populated` — *queued after a start*: `startAcquisitionRun` resolves `{ runId: "r-9", state: "requested", queuedBehind: "r-8" }`. Click `getByRole("button", { name: "Download now" })`. Marker: `findByText("A download is running. This starts when it finishes.")` (UX design 1.5).
  - `empty` — *never populated*: `view({ rows: [], neverAcquired: true })`. Marker: `findByText("No data has been downloaded yet.")`.
  - `empty` — *nothing found*: entry `/data/coverage?symbol=ZZZZ`, `view({ rows: [] })`. Marker: `findByText("No stock matches this filter.")`.
  - `error` — *error*: `fetchCoverage` rejects `new ApiError("service unavailable", "req-1")`. Marker: `findByRole("button", { name: "Try again" })` (`StateRegion`).
  - `dialog`: `{ notApplicable: "Coverage opens no dialog (owner-web-app 2.3; UX design 1.5)" }`. T009 backs this with a source check.
  - Kills:
    - hand-written mutant `web/src/screens/coverage/copy.ts`: `"No stock matches this filter."` → `"Retired: no stock matches this filter."`, caught by *Coverage — nothing found*. This is the TC's step 2 (Other Notes);
    - swap-case of the table header *Last downloaded* back to *Last acquired*, caught by *populated, row expanded* through the added inflection.
- [ ] T005 Implement TC-COMP-218 for **Followed stocks**. Append these rows to `CASES`; each renders `renderAt("/data/followed", "/data/followed", <InstrumentsScreen />)` (traces to DAC-E7-3, AC-19).
  - `populated` — *populated*: marker `findByRole("table")` and `findByText("MSFT")`. The marker deliberately avoids the row action's name, so the name-only mutant below is caught by the sweep, not by a failed marker.
  - `populated` — *follow refused*: `addInstruments` resolves `{ added: [], reactivated: [], rejected: [{ inputSymbol: "AAPL", normalisedSymbol: "AAPL", disposition: "duplicate_active", reason: null }] }`. Type `AAPL{Enter}` into `getByRole("textbox", { name: "Symbol of the stock to follow" })`. Marker: `waitFor` that textbox to have `aria-invalid="true"` (CAP-003-E7-S3 T008).
  - `populated` — *follow many preview*: type `AAPL, 1BAD` into `getByRole("textbox", { name: "Follow many" })` and `user.tab()`. Marker: `findByText(/1 recognised, 1 rejected/)` (CAP-003-E7-S3 T009).
  - `empty` — *never populated*: `listInstruments` resolves `{ rows: [], activeCount: 0, retiredCount: 0, nextCursor: null }`. Marker: `findByText("No stocks followed yet.")` (UX design 1.6).
  - `empty` — *nothing found*: `listInstruments.mockImplementation((filters) => filters?.symbol ? Promise.resolve({ ...FOLLOWED_PAGE, rows: [] }) : Promise.resolve(FOLLOWED_PAGE))`. Type `ZZZZ` into `getByRole("textbox", { name: "Filter by symbol" })`. Marker: `findByText("No stock matches this filter.")`, within the default `findBy` timeout, which exceeds the 250 ms debounce.
  - `error` — *error*: `listInstruments` rejects `new ApiError("service unavailable", "req-2")`. Marker: `findByRole("button", { name: "Try again" })`.
  - `dialog` — *stop-following dialog*: click **Stop following AAPL**. Marker: `findByRole("dialog")` (CAP-003-E1-S3's `ConfirmDialog` sets `role="dialog"`).
  - `dialog` — *stop-following failure*: `retireInstrument` rejects `new ApiError("Network down", "req-3")`. Open the dialog and click `within(dialog).getByRole("button", { name: "Stop following" })`. Then `waitFor(() => expect(retireInstrument).toHaveBeenCalledTimes(1))` and flush with `await act(async () => {})`.
  - Kills:
    - hand-written mutant `web/src/screens/instruments/retire-dialog.tsx`: the title template `` `Stop following ${symbol}?` `` → `` `Retire ${symbol}?` ``, caught by *stop-following dialog*;
    - hand-written mutant `web/src/screens/instruments/instrument-table.tsx`: the row action's `` aria-label={`Stop following ${row.symbol}`} `` → `` aria-label={`Retire ${row.symbol}`} ``. This name-only change is caught by the sweep's role pass in *populated*, as `button named "Retire AAPL"`. Record the failure message.
- [ ] T006 Implement TC-COMP-218 for **Downloads**. Append these rows to `CASES`; each renders `renderAt(entry, "/data/downloads", <RunsScreen />)` (traces to DAC-E7-3, AC-19).
  - **Fixture.** `RUNS` holds eight `AcquisitionRun` literals, one per `RunState`:
    - `runId` values `"00000000-0000-4000-8000-000000000001"` to `"…-000000000008"`, UUID-shaped as the API serves them;
    - `requestedAt: "2026-10-15T22:25:00Z"`, `startedAt: "2026-10-15T22:31:00Z"` (`null` for `requested`) and `endedAt` (`null` while non-terminal);
    - `historyDepthYears: 5`, `instrumentsNamed: 3`, `instrumentsWritten: 2`, `instrumentsFailed: 1`, `failureReason: null`.
  - `populated` — *populated, eight states*: `listAcquisitionRuns` resolves `{ runs: RUNS, nextCursor: "c2" }`, so the truncation note renders. Marker: `findAllByRole("link", { name: /^Download started .+, open details$/ })` has length 8 (UX design 1.7).
  - `populated` — *start blocked*: depth `null`. Marker: `findByRole("link", { name: "Settings" })`.
  - `empty` — *never populated*: `{ runs: [], nextCursor: null }`. Marker: `findByText("No download has been requested yet.")` (UX design 1.7).
  - `empty` — *nothing found*: the first call resolves `RUNS`, the next resolves `{ runs: [], nextCursor: null }`. Open `getByRole("combobox", { name: "Outcome" })` with `user.click` and choose `getByRole("option", { name: "Failed" })` (CAP-003-E7-S4 T006). Marker: `findByText("No download matches this filter.")`.
  - `error` — *error*: rejects `new ApiError("service unavailable", "req-4")`. Marker: `findByRole("button", { name: "Try again" })`.
  - `dialog`: `{ notApplicable: "The Downloads list opens no dialog; cancelling is on the download detail (owner-web-app 2.3; UX design 1.7)" }`. T009 backs this with a source check.
  - Kills:
    - hand-written mutant `web/src/screens/runs/run-table.tsx`: the header `"Stocks downloaded"` → `"Instruments downloaded"`, caught by *populated, eight states* through the plural inflection.
- [ ] T007 Implement TC-COMP-218 for **Download detail**. Append these rows to `CASES`; each renders `renderAt("/data/downloads/r-1", "/data/downloads/:runId", <RunDetailScreen />)` with `getAcquisitionRun` resolving a `RunDetail` literal (traces to DAC-E7-3, AC-19).
  - **Fixture.** `detail(state, results, counts?)` builds the `RunDetail` literal:
    - `run`: `runId: "r-1"`, the given `state`, and the times of T006's fixture;
    - `counts`: `instrumentsNamed: 3`, `instrumentsWritten: 2`, `instrumentsFailed: 1`, `resultsByOutcome: { written: 6, unchanged: 0, notFound: 1, failed: 1, skipped: 0 }`, unless given;
    - `results` and `nextCursor: null`.
  - **`RESULTS`** holds:
    - `AAPL` with `prices` `failed`, reason `"the provider timed out 3 times"`, and its other three data types `written`;
    - `ZZZZ` with `reference` `not_found`, reason `null`;
    - `MSFT` with all four data types `written`.
  - `populated` — *partial, two stocks expanded*: `detail("partial", RESULTS)`. Wait for `findByRole("region", { name: "Download summary" })`, then press `{Enter}` on the expanders `/details for AAPL$/` and `/details for ZZZZ$/`. Marker: `findByText(/^Downloading prices for AAPL failed:/)` (UX design 1.8).
  - `populated` — *interrupted*: `detail("abandoned", RESULTS)`. Marker: `findByText("FactorFlow stopped before this download finished, and the download was picked up as interrupted. Coverage written before it stopped is kept. Download again to continue.")` (owner-web-app 2.3).
  - `populated` — *running with progress*: `detail("running", [], { instrumentsNamed: 120, instrumentsWritten: 30, instrumentsFailed: 10, resultsByOutcome: { written: 0, unchanged: 0, notFound: 0, failed: 0, skipped: 0 } })`. Marker: `findByRole("progressbar")`.
  - `empty` — *no results yet*: `detail("succeeded", [])`. Marker: `findByText("No stock results have been recorded for this download yet.")` (CAP-003-E7-S5 T009).
  - `empty` — *nothing found*: the first call resolves `detail("partial", RESULTS)`, the next `detail("partial", [])`. Choose *Failed* in `getByRole("combobox", { name: "Outcome" })`. Marker: `findByText("No stock in this download matches this filter.")` (UX design 1.8).
  - `error` — *error*: `getAcquisitionRun` rejects `new ApiError("service unavailable", "req-5")`. Marker: `findByRole("button", { name: "Try again" })`.
  - `dialog` — *stop dialog*: `detail("running", RESULTS)`. Click `getByRole("button", { name: "Cancel download" })`. Marker: `findByRole("dialog")`.
  - `dialog` — *queued cancel dialog*: `detail("requested", [])`, then the same steps.
  - `dialog` — *cancel failure*: `cancelAcquisitionRun` rejects `new ApiError("Network down", "req-6")`. Confirm with `within(dialog).getByRole("button", { name: "Stop download" })`. Marker: `within(dialog).findByRole("alert")` (CAP-003-E7-S5 T010).
  - `dialog` — *already finished*: `cancelAcquisitionRun` rejects `new ApiError("Run already reached a terminal state.", "req-7", { code: "run_already_terminal", state: "succeeded" })`. Marker: `findByText("This download had already finished.")` (owner-web-app 2.3).

    The reason passed to that `ApiError` contains *Run*. The sweep must still pass, because the screen renders its own sentence for `run_already_terminal`, never the envelope message (owner-web-app 2.3; CAP-003-E7-S5 T010). Any leak of the message fails the case.
  - Kills:
    - hand-written mutant restoring a delivered dialog heading in `web/src/screens/runs/cancel-run.tsx`, `"Stop this download?"` → `"Stop this run?"`, caught by *stop dialog*;
    - a mutant that interpolates the error's `message` into the already-finished line, caught by *already finished*.
- [ ] T008 Implement TC-COMP-218 for **Settings**. Append these rows to `CASES`; each renders `renderAt("/settings", "/settings", <SettingsScreen />)` (traces to DAC-E7-3, AC-19).
  - `populated` — *populated, key found*: marker `findByText("Found")`. The marker deliberately avoids the region's name, so the mutant below is caught by the sweep.
  - `populated` — *key missing*: `useShell` returns `shellWith(ANSWERING_MISSING)`. Marker: `findByText("Missing")` (UX design 1.9).
  - `populated` — *key not determinable*: `shellWith(UNREACHABLE)`. Marker: `findByText("Not determinable")`.
  - `populated` — *depth field error*: wait for `findByDisplayValue("5")`, clear it, type `0`, `user.tab()`. Marker: `findByRole("alert")`.
  - `empty` — *depth never set*: `{ years: null, updatedAt: null }`. Marker: `findByText("Whole years, 1 to 50. Required before the first download.")` (UX design 1.9).
  - `error` — *depth read failed*: rejects `new ApiError("service unavailable", "req-8")`. Marker: `findByRole("button", { name: "Try again" })`.
  - `dialog`: `{ notApplicable: "Settings opens no dialog (owner-web-app 2.3; UX design 1.9)" }`.
  - Kills:
    - hand-written mutant `web/src/screens/settings/credential-status.tsx`: `"Market data key"` → `"Provider credential"`, caught by *populated, key found*, both in text and as the region's name.
- [ ] T009 Write the sweep's completeness checks as `describe("sweep covers every screen and state (DAC-E7-3)")` (traces to DAC-E7-3).
  - **(a) Every required state is covered.** For each of the five `Screen` literals and each of the four kinds `populated`, `empty`, `error` and `dialog`, `CASES` holds at least one row. That row has a `run`, or a `notApplicable` reason longer than zero characters. The four kinds are DAC-E7-3's.
  - **(b) Not-applicable dialogs are true.** Read sources with `node:fs` from `import.meta.url`, as `web/src/app/shell.tokens.test.tsx` does:
    - every non-test `.ts`/`.tsx` file under `./coverage/` and `./settings/`;
    - `./runs/index.tsx`, `./runs/run-table.tsx` and `./runs/run-controls.tsx`.

    None of them contains `components/ui/dialog`, `cancel-run`, `retire-dialog` or `<dialog`. If one of those screens gains a dialog, this case fails and the case table needs a dialog state for it.
  - **(c) The sweep is not vacuous.** At least two `dialog` rows have a `run`: Followed stocks and Download detail.
  - Kills:
    - a hand-written mutant deleting the *Followed stocks — error* row (case a);
    - a hand-written mutant adding `import { ConfirmDialog } from "../../components/ui/dialog";` to `web/src/screens/settings/index.tsx` (case b).
- [ ] T010 Implement TC-COMP-220 (requestJson import type-checks; types.ts and directory names unchanged) as `describe("requestJson export and directory names (TC-COMP-220, DAC-E7-S6-3)")`, with a `// Implements TC-COMP-220` comment (traces to AC-17, DAC-E7-12, DAC-E7-13, DAC-E7-S6-3).
  - **(a) The import type-checks.** `import { requestJson } from "../api/client"` sits at the top of the file. Type-level checks: `expectTypeOf(requestJson).toBeFunction()` and `expectTypeOf(requestJson).parameter(0).toEqualTypeOf<string>()`. `npx tsc --noEmit` judges them, together with the import itself (TC step 1).
  - **(b) It is the delivered function.** `typeof requestJson` is `"function"`. `await requestJson<{ status: string }>("/api/health")` resolves to an object with `status: "ok"`, served by `web/src/test-setup.ts`'s default `fetch` double. The double was called once, with first argument exactly `"/api/health"` and `headers` containing `Accept: "application/json"`.
  - **(c) The directory names are kept.** `statSync(new URL("./instruments/", import.meta.url)).isDirectory()`, `./runs/` and `./runs/detail/` are all true. Each directory holds an `index.tsx`. The names are kept, because code and paths may keep the domain terms (DAC-E7-13).
  - **(d)** TC step 2's diff of `types.ts` and the directory listing against the tree before E7 is a recorded command, not a Vitest case (T012).
  - Kills:
    - remove-attribute of the `export` modifier on `requestJson` in `web/src/api/client.ts`. Case b fails because `typeof` is `"undefined"`, and `tsc` fails on the import. Revert at once;
    - a hand-written mutant renaming `web/src/screens/runs/` to `downloads/` (case c).

### Additional Unit Tests

None beyond T003 and T009. The matcher and the case table are the only logic this story writes, and both are tested above.

**Checkpoint**:
- T003, T009 and T010 pass.
- T004 to T008 pass on the shipped screens; each case first proves its state rendered (its marker).
- The RED evidence for this test-only story is the liveness run in T012: a planted term turns the named case red.

---

## Phase 3: Core Implementation

**Purpose**: None planned. This story writes no production code. `client.ts` already exports `requestJson`, and every relabel belongs to CAP-003-E7-S1 to CAP-003-E7-S5.

- [ ] T011 Only if a T004–T008 case fails on the shipped screens, which means a domain term survived a sibling story's relabel (traces to AC-19, DAC-E7-4):
  - Read the failure message for the screen, state and term.
  - Replace only that user-visible string, and only when its replacement is given verbatim by UX design 1.5 to 1.9, by owner-web-app 2.3, or by the owning sibling's plan.
  - Record the file, the old string and the new one in the TDD evidence.
  - If no artifact gives the replacement, stop and report it to the owner. Never invent copy.
  - Change no identifier, path or directory name (DAC-E7-13), and never `web/src/api/types.ts`.

  If every case passes, this task is recorded as not needed.

**Checkpoint**: `npx vitest run web/src/screens/vocabulary.test.tsx` is green with no production file changed, or with only T011's recorded relabels.

---

## Phase 4: Integration

**Purpose**: Prove the sweep is live, and record the unchanged-file evidence.

- [ ] T012 From the repo root, record the following in the TDD evidence (traces to DAC-E7-S6-1, DAC-E7-S6-3, DAC-E7-12, DAC-E7-13, AC-17, AC-19).
  - **(a) Liveness (TC-COMP-218 step 2).** Edit `web/src/screens/coverage/copy.ts` so that the nothing-found sentence reads `Retired: no stock matches this filter.` and run `npx vitest run web/src/screens/vocabulary.test.tsx`. Confirm exactly one case fails, *Coverage — nothing found*, with the message `Coverage — nothing found: "Retired" in text`. Then undo the edit by hand (never with a `git` reset or checkout, which could discard other uncommitted work) and confirm the file matches its pre-edit content.
  - **(b) Unchanged files.** `git diff --exit-code 996f8a33ac8501c58791009fffe2f826d298d9bc -- web/src/api/types.ts web/src/api/client.coverage.test.ts web/src/api/client.runs.test.ts web/src/api/render.test.tsx` exits 0. If it does not, list `git log --format='%h %s' 996f8a33ac8501c58791009fffe2f826d298d9bc..HEAD -- <the same four files>`; no commit touching them may be a CAP-003-E7 commit (Other Notes). `git diff --exit-code 996f8a33ac8501c58791009fffe2f826d298d9bc -- web/src/api/client.ts` exits 0 too: the export was already present, so E7 changes nothing there.
  - **(c) Directory names.** `git ls-tree -d --name-only 996f8a33ac8501c58791009fffe2f826d298d9bc web/src/screens/` and `git ls-tree -d --name-only HEAD web/src/screens/` both list `web/src/screens/instruments` and `web/src/screens/runs`, plus the working tree listing.
  - **(d)** The whole suite, `npm run test`, is green with `vocabulary.test.tsx` included.

**Checkpoint**: The sweep fails live on a planted term, naming the screen, the state and the term; the delivered client tests and `types.ts` are unchanged.

---

## Phase 5: Polish

**Purpose**: Validation, mutation strength and TDD evidence.

- [ ] T013 Run the tech stack v7 validation commands from the repo root: `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit` and `npm run build`. Fix only this story's file until all pass (traces to AC-17, AC-19, DAC-E7-S6-3).
  - Then, from the harness root, run `python3 scripts/mutation-run.py run` with `--command "npx vitest run web/src/screens/vocabulary.test.tsx && npx tsc --noEmit"`.
  - Run it over the hand-written mutants listed in Other Notes only (`--only`). Generated operators over the five screens' sources are judged by the sibling stories' own suites, not by a vocabulary sweep.
  - Leave no surviving non-equivalent mutant.
- [ ] T014 After each TDD cycle in T002–T013 — not once at the end — record the cycle in `CAP-003-E7-S6-tdd-evidence.yaml` beside this story, before the next cycle begins (INV-TDD-002, TEST-TDD-008; traces to no AC).
  - Stage only that cycle's diff. Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Each cycle entry records:
    - `code_review_verdict` and `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence. For this test-only story, RED is T012 (a)'s planted-term failure and each T004–T008 hand-written mutant's kill;
    - the structured `mutation:` block `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no mutant;
    - `diff_sha256`: the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.
  - `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit.
  - This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every cycle is named by a TDD-evidence entry with `commit_hash: stage`.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E7-S1 | hard | Renders `SettingsScreen` (T008); existing edge |
| CAP-003-E7-S2 | hard | Renders `CoverageScreen`; imports `row`, `view`, `UNAVAILABLE_REASON` and `installRadixSelectShims` from `web/src/screens/coverage/test-fixtures.ts` (E7-S2 T002) (T002, T004); existing edge |
| CAP-003-E7-S3 | hard | Renders `InstrumentsScreen` with its stop-following dialog (T005); existing edge |
| CAP-003-E7-S4 | hard | Renders `RunsScreen` and its `select` filter (T006); existing edge |
| CAP-003-E7-S5 | hard | Renders `RunDetailScreen` with its cancel dialogs (T007); existing edge |
| CAP-003-E3-S1 | hard | Confirms the `requestJson` export DAC-E7-12 assigns there (T001, T010); existing edge |
| CAP-003-E3-S3 | hard | **New edge.** T002 imports `type ShellContextValue` from `web/src/app/shell-context.tsx` and mocks its `useShell` export through `importOriginal`, which needs the module to exist. It was reached only transitively, through CAP-003-E7-S1 and CAP-003-E7-S5 |
| CAP-003-E3-S2 | context | `HealthState`, typed here as `ShellContextValue["health"]`; no import from `web/src/app/health.tsx`. Reached through CAP-003-E3-S3 |
| CAP-003-E3-S4 | context | Registers the five routes (`/data/downloads/:runId`) whose paths T002's `renderAt` mirrors; the screens are rendered directly, not through `routes.tsx` |
| CAP-003-E3-S6 | context | Mounts `ShellProvider` in the product; this file doubles `useShell`, so it needs no provider |
| CAP-003-E1-S3 | context | `ConfirmDialog` renders `role="dialog"` (DEC-0301), the role T005 and T007 query; reached through CAP-003-E7-S3 and CAP-003-E7-S5 |
| CAP-003-E1-S4 | context | Names the row expander *Show details for {row}* (queried as `/details for X$/`), and falls back to the top window when jsdom reports no height, so rows render without a stub; reached through CAP-003-E7-S2 and CAP-003-E7-S5 |
| CAP-002-E4-S1 | context | Already exported `requestJson` (commit `f530341`), so no story edits `client.ts` (DAC-E7-12 "unless CAP-002 has already added the export") |
| CAP-003-E7-S7 | context | Owns the e2e side of DAC-E7-12 (the eleven specs and `acquisition.ts`); nothing crosses this file |

### Task Dependencies
- T001: first; everything else waits on it.
- T002: depends on T001.
- T003–T010: depend on T002. They share one file, so they run in order.
- T011: only after T004–T008 run, and only on a failure.
- T012: depends on T003–T011.
- T013: depends on T012.
- T014: interleaved — runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities
- None inside the story: every test task edits `web/src/screens/vocabulary.test.tsx`. T012 (b) and (c) can run alongside T012 (a).

---

## Validation Plan

### Constitution-Defined Commands
Tech stack v7, run from the repo root:
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format`
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not this story's command (the e2e specs are CAP-003-E7-S7's).

### Story-Specific Validation
- **DAC-E7-3, AC-19.** `npx vitest run web/src/screens/vocabulary.test.tsx` reports one passing case per row of `CASES` with a `run`, each named `{screen} — {state}`. T009 (a) passes.
- **DAC-E7-S6-1.** T012 (a)'s planted *Retired* fails *Coverage — nothing found* with `Coverage — nothing found: "Retired" in text`, and reverting it restores green.
- **DAC-E7-S6-2.** T003 passes all five cases.
- **DAC-E7-S6-3, DAC-E7-12.**
  - `npx tsc --noEmit` passes with T010's import and `expectTypeOf` lines.
  - T012 (b) exits 0 for `types.ts`, `client.ts` and the three delivered client tests.
  - T012 (c) lists `instruments` and `runs` before and after.
- **Plan self-consistency.**
  - No check forbids what a task requires. The matcher lives in a test file, which `web/src/components/token-literals.test.ts` does not scan.
  - The term list in the test source is never itself rendered: the sweep reads the DOM, not sources. T009 (b) searches sources only for dialog imports, never for vocabulary.
  - T012 (a)'s revert keeps `copy.ts` unchanged in the committed diff.

---

## Notes

### Resolved Conflicts

1. **Who adds the `requestJson` export.** The story Description says the export is "added by CAP-003-E3-S1 under DEC-0223, or by CAP-002-E4-S1". DEC-0223 was reverted and superseded by DEC-0227, and CAP-002-E4-S1 has already added it (`web/src/api/client.ts:154`, commit `f530341`). **Governing: epic DAC-E7-12** ("unless CAP-002 has already added the export"), with CAP-003-E3-S1's plan T001 leaving `client.ts` untouched. This story imports and confirms the export and edits nothing (T010, T012 (b)).

### Open Gaps

1. **The *dialog* state on three screens.** DAC-E7-3, owner-web-app 7 and TC-COMP-218 sweep "populated, empty, error and dialog states". Coverage, the Downloads list and Settings open no dialog, either delivered or in UX design 1.5, 1.7 or 1.9. No artifact says what their dialog state is.
   - The plan records each as `notApplicable` with its reason (T004, T006, T008). A source check (T009 (b)) fails if a dialog is later added to any of them.
   - The two screens that have dialogs, Followed stocks and Download detail, are swept with them open, including their failure lines.
   - No value is adopted, so no owner decision is pending. CAP-003-E7-S1, E7-S2 and E7-S4 recorded the same gap.
   - For owner-web-app 7 and the epic's DAC-E7-3 wording, at their next revision. (Resolution register gap G17.)

### Other Notes

- **"Doubled `fetch` fixtures".** The story's Implementation line says the screens render "with doubled `fetch` fixtures from each screen's delivered test fixtures, e.g. `web/src/screens/coverage/test-fixtures.ts`". Those builders return the client's shapes (`CoverageView`, `CoverageRow` in camelCase), not wire JSON. So the doubles sit at the delivered `client.ts` functions, as every sibling screen test does, with `requestJson` and the error classes left real. The global `fetch` double from `web/src/test-setup.ts` still serves T010's real `requestJson` call. No contract is changed or invented.
- **Two inflections added to the matcher.** DAC-E7-3 lists eight terms. As whole words, *instrument* does not catch the delivered plural *Instruments* (the Followed stocks `h1`), and *acquire* does not catch *acquired* (*Last acquired*). DAC-E7-4 replaces both, and capability AC-19 forbids the domain term in any form. The matcher adds `instruments` and `acquired`, as CAP-003-E7-S2 (T016) and CAP-003-E7-S3 (T005) do. The extension is test strength only. It still lets *running*, *Coverage* and every DAC-E7-4 kept term through (T003 (a)).
- **The "before E7" baseline.** TC-COMP-220 diffs against "HEAD before E7". The pin is `996f8a33ac8501c58791009fffe2f826d298d9bc`, `origin/main` when this plan was written. It holds no CAP-003 code, because register G18 records that every E1 and E3 prerequisite is unimplemented. It is also `git merge-base HEAD origin/main` for this branch. A pinned hash stays meaningful if earlier E7 stories merge to `main` before this one is coded, which `merge-base` would not. A non-E7 commit touching these files is not a DAC-E7-13 breach and is only listed (T012 (b)).
- **Error reasons.** CAP-003-E7-S4 (DEC-0393) never shows the envelope `message`. CAP-003-E7-S5 (DEC-0396) shows it in the cancel line. Every fixture message here is term-free, so the sweep passes under either rule the owner keeps. A real server message carrying a domain term would be the API's text, outside these screens' copy, as CAP-003-E7-S3's Other Notes also record. The one deliberate exception is T007's *already finished* case, where the envelope message contains *Run* and must never be shown.
  - **Risk to flag.** CAP-003-E7-S2's T007 rejects with `new ApiError("instrument not found", "req-1")`, expects *Couldn't read coverage: instrument not found.*, and sweeps the same render for `\binstruments?\b`. Those two assertions contradict each other in that sibling plan. This plan avoids the collision by using `"service unavailable"`. The E7-S2 coding agent should change its fixture reason; this note is for it.
- **Timers.** No fake timers are used. The Downloads and detail polls (10 s) never fire inside a case, and Testing Library's automatic cleanup unmounts each screen, which clears them. The Followed-stocks filter debounce (250 ms) is shorter than `findBy`'s default 1 s timeout.
- **No production change.** The story is a `chore` that adds one test file, so its TDD cycles are test cycles. RED is shown by the planted-term and hand-written-mutant runs, not by a failing test before production code. T011 is the only path to a production edit, and only with verbatim copy from an artifact.
- **Hand-written mutants** for T013's mutation run. Each is killed by the named case:
  - `web/src/screens/coverage/copy.ts`: `"No stock matches this filter."` → `"Retired: no stock matches this filter."` (T004, *Coverage — nothing found*)
  - `web/src/screens/coverage/coverage-table.tsx`: `"Last downloaded"` → `"Last acquired"` (T004, *Coverage — populated, row expanded*)
  - `web/src/screens/instruments/retire-dialog.tsx`: `` `Stop following ${symbol}?` `` → `` `Retire ${symbol}?` `` (T005, *Followed stocks — stop-following dialog*)
  - `web/src/screens/instruments/instrument-table.tsx`: `` aria-label={`Stop following ${row.symbol}`} `` → `` aria-label={`Retire ${row.symbol}`} `` (T005, *Followed stocks — populated*: the name pass)
  - `web/src/screens/runs/run-table.tsx`: `"Stocks downloaded"` → `"Instruments downloaded"` (T006, *Downloads — populated, eight states*)
  - `web/src/screens/runs/cancel-run.tsx`: `"Stop this download?"` → `"Stop this run?"` (T007, *Download detail — stop dialog*)
  - `web/src/screens/settings/credential-status.tsx`: `"Market data key"` → `"Provider credential"` (T008, *Settings — populated, key found*)
  - `web/src/screens/settings/index.tsx`: add `import { ConfirmDialog } from "../../components/ui/dialog";` (T009 (b))
  - `web/src/api/client.ts`: `export async function requestJson` → `async function requestJson` (T010 (b) and `tsc`)
  - `web/src/screens/vocabulary.test.tsx`: the `getRoles` loop's role list → `[] as string[]` (T003 (b))
  - `web/src/screens/vocabulary.test.tsx`: `/\b(…)\b/i` → `/(…)/i` (T003 (a))

  The exact source form of the E7-S3 and E7-S5 strings is whatever those stories write. Apply each mutant to the string as committed, and record it in the TDD evidence.
