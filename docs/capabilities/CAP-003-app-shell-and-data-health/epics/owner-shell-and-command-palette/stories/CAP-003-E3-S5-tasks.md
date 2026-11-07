---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S5-tasks
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
  timestamp: 2026-11-07T06:33:53Z
  source_artifacts:
    - id: CAP-003-E3-S5
      version: "1"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-command-palette
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-command-palette-tests
      version: "1"
    - id: CAP-003-E1-S1-tasks
      version: "1"
    - id: CAP-003-E1-S3-tasks
      version: "1"
    - id: CAP-003-E3-S4-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E3-S5 — Command Palette: Stocks, Universes and Pages, Every Item Navigating

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S5.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/app/command-palette/`; design `command-palette`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Creates the command palette as six new modules under `web/src/app/command-palette/` (command-palette §2.1), built on CAP-003-E1-S3's `command` `dialog`. `index.tsx` exports `<CommandPalette open onOpenChange />`. It renders `CommandDialog` with cmdk's own filtering turned off, and inside it a body component that exists only while the dialog is open, so the typed text and the universes read live and die with one opening (DAC-E3-S5-3). The body shows three groups in a fixed order: *Stocks*, *Universes* (only while `RESEARCH_REGISTERED`) and *Pages*, separated by `CommandSeparator`, with no Actions group (DAC-E3-11). `use-stock-search.ts` sends one `GET /api/instruments?symbol={prefix}&lifecycle=active&limit=8` through the delivered `requestJson` after 250 ms without typing, and aborts the request in flight the moment the text changes (DAC-E3-S5-1). `universes.ts` reads `GET /api/universes?lifecycle=active` once per open (DAC-E3-S5-2). `pages.ts` lists CAP-003-E3-S4's `DESTINATIONS` plus *Coverage*, *Followed stocks* and *Downloads*. `targets.ts` sends a stock to `/research/stocks/{symbol}` while research routes are registered, else to `/data/coverage?symbol={symbol}`, and a universe to `/research/universes/{id}` (DEC-0207). `copy.ts` holds every owner-facing string: the hint row, *Searching…*, the empty state, the first-8 row and the two per-group errors of command-palette §2.4 (DAC-E3-12). The AC-26 literal scan is widened to the new directory (DAC-E3-S5-4). The shell's `⌘K` listener and *Search* opener that mount the palette are CAP-003-E3-S6's. The end-to-end keyboard journey is CAP-003-E3-S8's.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-22 | Find followed stocks, universes and pages from the palette; no action that places or stops trading | T003, T004, T006, T009, T010, T011, T012, T013 |
| AC-24 | The palette's eight states render as designed or record why one does not apply | T002, T008, T013 |
| AC-27 | A stock opens the Research evidence page when its routes are registered | T004, T006, T011 |
| DAC-E3-11 | Stocks, Universes (only while registered) and Pages in that order, no Actions group, stock target per registration | T003, T004, T006, T009, T010, T011, T012, T013 |
| DAC-E3-12 | Hint row before typing; `CommandEmpty` *No stocks or pages match "{text}".*; the first-8 row on `next_cursor`; per-group errors leave the other groups usable; opens and Pages usable while health is unreachable | T002, T008, T012, T013 |
| DAC-E3-S5-1 | *K* then *KO* within 250 ms sends one request `symbol=KO&lifecycle=active&limit=8`; an earlier in-flight request is aborted and never overwrites a newer answer | T003, T009 |
| DAC-E3-S5-2 | Not registered: no universes request and no Universes group; registered: one request per open, filtered locally | T004, T010, T013 |
| DAC-E3-S5-3 | `Esc` or a chosen item closes, focus returns to the element focused before opening, nothing typed is kept (AC-25) | T005, T013 |
| DAC-E3-S5-4 | `web/src/app/command-palette/` added to the AC-26 literal scan, and the scan passes (AC-26) | T007, T014 |
| DAC-E3-S5-5 | No DAC-E7-3 term in any visible text or accessible name of any state; labels from `copy.ts` (AC-19) | T008, T012 |
| DAC-E3-S5-6 | No status rendered; the one-tier rule, stale and unavailable states recorded as not applicable; no state by colour alone (AC-20) | T008, T013 |

Mapped test cases (`tests/component/command-palette-tests.md`; `tests/coverage-matrix.md` rows DAC-E3-11, DAC-E3-12, DAC-E3-S5-1 to DAC-E3-S5-6, and the per-story count "6 of 6" at line 407):

- **TC-COMP-081** (DAC-E3-S5-1), **TC-COMP-082** (DAC-E3-S5-2), **TC-COMP-083** (DAC-E3-S5-3), **TC-COMP-084** (DAC-E3-S5-4), **TC-COMP-085** (DAC-E3-S5-5) and **TC-COMP-086** (DAC-E3-S5-6) for the six story-level criteria.
- **TC-COMP-062** (DAC-E3-12, AC-24) for the epic state criterion this story carries.

TC-COMP-088 (the listener and opener) is CAP-003-E3-S6's. TC-INT-041 to TC-INT-045 and TC-E2E-007 are CAP-003-E3-S8's. The test specification is `status: draft`; its steps are used as written and sharpened below.

## Phase 1: Setup

**Purpose**: Confirm the hard-dependency deliverables this story imports or extends, and record the green baseline. No package is added (E3 adds no dependency of its own: epic NFR *Security*; DEC-0211 gives `package.json` to `ui-components`).

- [ ] T001 From the repo root, confirm the four hard graph edges are delivered, then run `npm ci` and `npm run test` and record that the suite is green before any change. Stop if any item is missing (traces to DAC-E3-11, DAC-E3-S5-4; prerequisite infrastructure):
  - CAP-003-E1-S3: `web/src/components/ui/command.tsx` exports `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator` and `CommandLoading`. Its `CommandDialog` labels the dialog *Search FactorFlow*, sets `loop` on the inner cmdk `Command`, records the opener in `onOpenAutoFocus` and refocuses it in `onCloseAutoFocus`. `package.json` lists `cmdk` and `@radix-ui/react-dialog`.
  - CAP-003-E3-S4: `web/src/app/destinations.ts` exports `DESTINATIONS: readonly Destination[]` (at this point `[Research, Settings]`) and `RESEARCH_REGISTERED`.
  - CAP-003-E3-S1: `web/src/api/client.ts` exports `requestJson`, `ApiError` and `ApiUnreachableError`. The export predates CAP-003 (CAP-002-E4-S1), and S1 leaves the file untouched.
  - CAP-003-E1-S1: `web/src/components/token-literals.test.ts` exports `SCANNED_DIRECTORIES`, `isScannedSource` and `literalsIn` (DEC-0296).

**Checkpoint**: All four deliverables are present, the baseline suite is green, and nothing has changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the search mechanics, the groups and targets, the states, focus and text discard, the literal scan, the vocabulary and the absence of status.

**Shared harness for `web/src/app/command-palette/command-palette.test.tsx`** (new; written with T002 and reused by T004, T005, T006 and T008):

- **cmdk in jsdom.** In `beforeEach`, `vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} })` and `Element.prototype.scrollIntoView = vi.fn()` (restored in `afterEach`). These are re-stubbed per test because `web/src/test-setup.ts` calls `vi.unstubAllGlobals()` after each, as CAP-003-E1-S3's `command.test.tsx` does. `web/src/test-setup.ts` is not edited.
- **Registration flag.** `const flags = vi.hoisted(() => ({ registered: true }))`. Then `vi.mock("../destinations", () => ({ get DESTINATIONS() { … }, get RESEARCH_REGISTERED() { return flags.registered; } }))`.
  - `DESTINATIONS` returns the independent literal `[{ group: "primary", label: "Research", to: "/research" }, { group: "data", label: "Settings", to: "/settings" }]` while `flags.registered` is true, and `[{ group: "data", label: "Settings", to: "/settings" }]` otherwise.
  - `afterEach` resets `flags.registered = true`.
  - Fallback if the getters are not read live: `vi.resetModules()` plus a dynamic `import("./index")` per scenario.
- **Network.** `vi.stubGlobal("fetch", vi.fn(route))`, where `route(input, init)` dispatches on the URL:
  - `/api/instruments?…` goes to a per-test `stocks` handler that receives the parsed `URLSearchParams` and `init.signal`.
  - `/api/universes?lifecycle=active` goes to a per-test `universes` handler.
  - Helpers: `ok(body)` returns a `200` JSON `Response`; `fail500()` returns a `500` JSON `{"error":{"code":"internal_error","request_id":"req-1"}}`; `unreachable()` rejects with `new TypeError("Failed to fetch")`; `deferred()` returns `{ promise, resolve, reject }`.
  - Default fixtures are independent literals: `UNIVERSES = { universes: [{ universe_id: "u1", name: "Large caps", lifecycle: "active", member_count: 40, created_at: "2026-10-01T15:00:00Z", retired_at: null }, { universe_id: "u2", name: "Small value", lifecycle: "active", member_count: 35, created_at: "2026-10-02T15:00:00Z", retired_at: null }], active_count: 2, retired_count: 0, next_cursor: null }`. A stock page is built by `stockPage(symbols, nextCursor = null)`, which writes `instruments` as `[{ instrument_id: i + 1, symbol, lifecycle: "active" }]`, `active_count: symbols.length`, `retired_count: 0` and `next_cursor`.
  - Fixture symbols and names avoid every DAC-E7-3 term (so no `RUN`).
- **Render.** `renderPalette({ initialPath = "/start" } = {})` renders `<MemoryRouter initialEntries={[initialPath]}><Harness /><LocationProbe /></MemoryRouter>`.
  - `Harness` holds `const [open, setOpen] = useState(false)`. It renders `<button type="button" onClick={() => setOpen(true)}>Opener</button>` and `<CommandPalette open={open} onOpenChange={setOpen} />`, imported from `./index`.
  - `LocationProbe` renders `useLocation().pathname + search` as `data-testid="location"`.
  - Each test opens with `await user.click(getByRole("button", { name: "Opener" }))` and `await findByRole("dialog", { name: "Search FactorFlow" })`.
- **Readers.**
  - `headings()` returns the text of every `[cmdk-group-heading]` in document order.
  - `optionsIn(heading)` returns the `option` texts inside the `[cmdk-group]` whose heading has that text.
  - Real timers are used throughout. `findBy*` waits out the 250 ms debounce within Testing Library's default 1000 ms.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-062 (Palette hint, empty, first-8 and per-group error states) in the new `web/src/app/command-palette/command-palette.test.tsx`, with a `// Implements TC-COMP-062` comment, in `describe("states (DAC-E3-12, AC-24)")`. Cases:
  - (a) **Hint before typing.** On open, `optionsIn("Stocks")` equals `["Type a symbol to find a followed stock"]`, and that option has `aria-disabled="true"`. `optionsIn("Pages")` equals the literal `["Research", "Settings", "Coverage", "Followed stocks", "Downloads"]`. `queryByText(/No stocks or pages match/)` is null, and `stocks` was called 0 times.
  - (b) **Loading.** `stocks` returns a pending `deferred()`. Type `zz`. `findByText("Searching…")` appears inside the Stocks group, and `queryByText(/No stocks or pages match/)` is still null while the read is pending.
  - (c) **Empty, nothing found.** Resolve it with `stockPage([])`. The dialog shows exactly `No stocks or pages match "zz".`, and `queryAllByRole("option")` is empty. The universes fixture has no name containing `zz`.
  - (d) **Partial.** Type `k` against `stockPage(["KA", "KB", "KC", "KD", "KE", "KF", "KG", "KH"], "KH")`. `optionsIn("Stocks")` equals those eight symbols followed by `"Showing the first 8. Keep typing to narrow."`. The last row has `aria-disabled="true"`. Retyped against the same rows with `next_cursor: null`, the partial row is absent.
  - (e) **Stock search fails.** `stocks` answers `fail500()`. Type `co`. The Stocks group shows `Couldn't search followed stocks: FactorFlow hit an unexpected problem.`. `optionsIn("Pages")` still holds `Coverage`. `{ArrowDown}` until *Coverage* is selected, then `{Enter}`: `location` reads `/data/coverage`. Before the errors are asserted, `{ArrowDown}` from the first item never selects the error row (it is `aria-disabled`).
  - (f) **Universes read fails.** `universes` answers `fail500()`. On open, the Universes group holds exactly `Couldn't read universes: FactorFlow hit an unexpected problem.`. The Stocks hint row and the five pages are still listed.
  - (g) **Health unreachable** (TC step 5). Every route answers `unreachable()`. The dialog opens. The Universes group shows `Couldn't read universes: FactorFlow is not answering.`. All five pages are listed. Typing `set` shows `Couldn't search followed stocks: FactorFlow is not answering.` with *Settings* still listed, and `{Enter}` on *Settings* lands on `/settings`.

  Kills:
  - remove-attribute of `disabled` on the hint row: (a) `aria-disabled`.
  - negate-boolean on the `next_cursor !== null` test: (d) both halves.
  - swap-case of the two reasons in `failureReason`: (e) and (g).
  - a hand-written mutant that renders `CommandEmpty` while the search is loading: (b).
- [ ] T003 [P] Implement TC-COMP-081 (Stock search debounces 250 ms and aborts the stale request) in the new `web/src/app/command-palette/use-stock-search.test.ts`, with a `// Implements TC-COMP-081` comment.
  - **Harness.** `vi.useFakeTimers()`. `renderHook(({ text }) => useStockSearch(text), { initialProps: { text: "" } })`. `fetch` is `vi.fn` returning per-call `deferred()` promises, and every call's `[url, init]` is recorded.
  - (a) **Debounce and query.** Rerender `K`. After `advanceTimersByTime(100)`, rerender `KO`. After `advanceTimersByTime(249)`, `fetch` has 0 calls and `result.current` `toEqual({ kind: "loading" })`. After `advanceTimersByTime(1)`, `fetch` has exactly 1 call, and its URL is exactly the literal `"/api/instruments?symbol=KO&lifecycle=active&limit=8"`.
  - (b) **Abort in flight.** Rerender `K` and `advanceTimersByTime(250)`: call 1 is in flight, and `calls[0][1].signal.aborted` is `false`. Rerender `KO` **without** advancing: `calls[0][1].signal.aborted` is `true` at once. `advanceTimersByTime(250)` makes call 2, with `symbol=KO`.
    - Resolve call 2 with the JSON for `["KO", "KOF"]` and `next_cursor: null`, then flush. `result.current` `toEqual({ kind: "ok", symbols: ["KO", "KOF"], more: false })`.
    - Resolve call 1 afterwards with `["KXX"]` and flush. `result.current` is unchanged: a stale answer never overwrites a newer one.
    - Repeat with call 1 rejecting with `new DOMException("aborted", "AbortError")`. The state never becomes `error`.
  - (c) **TC edge: clearing the text.** With call 1 in flight for `K`, rerender `""`. Call 1's signal is aborted, `result.current` `toEqual({ kind: "idle" })`, and `advanceTimersByTime(1000)` makes no further call. Rerendering `"   "` is also `idle` with no call.
  - (d) **Errors.** A `fetch` rejecting `TypeError` gives `{ kind: "error" }` with `error` an `ApiUnreachableError`. A `500` `internal_error` envelope gives `error` an `ApiError` with `code` `"internal_error"`.

  Kills:
  - off-by-one on `250` and on `8`: (a).
  - swap-case of `lifecycle` `"active"` to `"retired"`: (a)'s literal URL.
  - remove-attribute of `signal` in the `requestJson` call: (b)'s `aborted`.
  - negate-boolean on the `signal.aborted` guard: (b)'s late `KXX` and `AbortError`.
  - a hand-written mutant that drops `controller.abort()` from the effect cleanup: (b) and (c).
- [ ] T004 Implement TC-COMP-082 (Universes group only while research routes are registered) in `web/src/app/command-palette/command-palette.test.tsx`, with a `// Implements TC-COMP-082` comment, in `describe("universes and targets (DAC-E3-S5-2, DAC-E3-11, AC-27)")`. It runs after T002 (same file). Cases:
  - (a) **Not registered.** `flags.registered = false`. Open, then `await waitFor` on the hint row. `universes` was called 0 times, and `headings()` equals `["Stocks", "Pages"]`. Type `KO` against `stockPage(["KO"])`, then `{Enter}` on *KO*: `location` reads exactly `/data/coverage?symbol=KO`.
  - (b) **Registered, once per open.** `flags.registered = true`. Open: `universes` is called exactly once, and `optionsIn("Universes")` equals `["Large caps", "Small value"]`.
    - Type `l`, then `la`, then `large`, each answered `stockPage([])`. `universes` is still called once, and `optionsIn("Universes")` equals `["Large caps"]` (filtered locally).
    - `{Enter}` on *Large caps*: `location` reads `/research/universes/u1`.
    - Open again: `universes` has been called exactly twice.
  - (c) **Stock target when registered.** `{Enter}` on *KO* after typing `KO`: `location` reads `/research/stocks/KO`.

  Kills:
  - negate-boolean on the `RESEARCH_REGISTERED` guard of the universes read: (a)'s count and headings.
  - a hand-written mutant that makes the universes effect depend on `text`: (b)'s count of 1.
  - swap-case of the two stock targets: (a) and (c).
  - a hand-written mutant that drops the local filter: (b)'s `["Large caps"]`.
- [ ] T005 Implement TC-COMP-083 (Closing the palette restores focus and discards typed text) in `web/src/app/command-palette/command-palette.test.tsx`, with a `// Implements TC-COMP-083` comment, in `describe("close (DAC-E3-S5-3, AC-25)")`. It runs after T004 (same file).
  - (a) **Esc.** Focus *Opener*, click it, type `KO`, press `{Escape}`. `queryByRole("dialog")` is null, and the *Opener* button `toHaveFocus()`.
  - (b) **Nothing typed is kept.** Click *Opener* again. `getByRole("combobox")` has value `""`, and the Stocks hint row is back.
  - (c) **Choosing an item.** Type `set`, then `{Enter}` on *Settings*. `location` reads `/settings`, `queryByRole("dialog")` is null, and *Opener* `toHaveFocus()`.

  Kills:
  - a hand-written mutant that lifts `useState("")` for the text from the open-only body into `CommandPalette`: (b).
  - remove-attribute of the `onOpenChange(false)` call in the select handler: (c)'s dialog still present.
- [ ] T006 Write the groups, order and no-trading cases in `web/src/app/command-palette/command-palette.test.tsx` (command-palette §7 *Groups* and *Targets* rows; DAC-E3-11, AC-22), in `describe("groups (DAC-E3-11, AC-22)")`. It runs after T005 (same file).
  - (a) **Order before typing.** `headings()` equals `["Stocks", "Universes", "Pages"]`, and there are exactly two `[cmdk-separator]` elements.
  - (b) **Order is not re-ranked by the text.** Type `co`. `stocks` answers `stockPage(["COST"])`, and the universes fixture adds `{ universe_id: "u3", name: "Core holdings", … }`. `headings()` still equals `["Stocks", "Universes", "Pages"]`. `optionsIn("Stocks")` equals `["COST"]`, `optionsIn("Universes")` equals `["Core holdings"]`, and `optionsIn("Pages")` equals `["Coverage"]`.
  - (c) **No Actions group, nothing trades.** Across (a) and (b), no heading matches `/actions/i`. No option text matches `/\b(trade|trading|buy|sell|order|go live|resume|stop)\b/i`.
  - (d) **Stock rows are the symbol alone.** In (b), the *COST* option's `textContent` is exactly `COST`, with no hint (command-palette §3; Resolved Conflict 3).

  Kills: a hand-written mutant that removes `shouldFilter={false}` from the `CommandDialog` call. cmdk then ranks groups by score: `page:/data/coverage` outscores `stock:COST` for `co` and moves Pages first, and the disabled rows are filtered away. (b) fails.
- [ ] T007 [P] Implement TC-COMP-084 (Literal scan widened to `web/src/app/command-palette/`) in `web/src/components/token-literals.test.ts`, with a `// Implements TC-COMP-084` comment (DAC-E3-S5-4: "this story adds `web/src/app/command-palette/` to its scanned directories").
  - Append `"web/src/app/command-palette/"` to the exported `SCANNED_DIRECTORIES`, after the entries already there, without reordering or removing any.
  - Add `describe("command-palette sources (TC-COMP-084)")`:
    - (a) `SCANNED_DIRECTORIES` contains `"web/src/app/command-palette/"`. Walking it with the file's own walker finds at least the six sources `index.tsx`, `use-stock-search.ts`, `universes.ts`, `pages.ts`, `targets.ts` and `copy.ts`, and `isScannedSource` is false for the two test files.
    - (b) TC step 3, planted: `literalsIn("web/src/app/command-palette/planted.tsx", 'const x = "12px";')` equals `["web/src/app/command-palette/planted.tsx: 12px"]`.
    - (c) TC edge: `literalsIn("web/src/app/command-palette/index.tsx", "max-w-[560px]")` returns one offender, and `literalsIn("web/src/components/ui/command.tsx", "max-w-[560px]")` returns `[]`. The `command` width stays allowed only inside the vendored component.
  - The file's existing case (1) then scans the new directory with every other rule.

  Kills: a hand-written mutant that allows `560px` under any `command` path segment: (c). A missing directory entry: (a).
- [ ] T008 Implement TC-COMP-085 and TC-COMP-086 in `web/src/app/command-palette/command-palette.test.tsx`, with `// Implements TC-COMP-085` and `// Implements TC-COMP-086` comments, in `describe("vocabulary and status (DAC-E3-S5-5, DAC-E3-S5-6)")`. It runs after T006 (same file).
  - **State walk.** Render the palette through the seven states of T002 (a), (b), (c), (d), (e), (f) and (g), plus a registered open with universes listed. At each state, collect from the dialog:
    - its `textContent`;
    - every `aria-label`, `placeholder`, `title` and `aria-valuetext` attribute;
    - the dialog's accessible name.
  - **TC-COMP-085.** No collected string matches `/\b(instruments?|acquisition|acquire|runs?|retire|retired|provider credential)\b/i`. This is the eight DAC-E7-3 terms, with the plural *instruments* added so that a copy edit to *instruments* cannot pass.
    - Every leaf string reachable in the exported `PALETTE_COPY`, and `failureReason`'s two outputs, pass the same regex, with `empty("zz")` and the two error functions called on `"x"`. This is the `copy.ts` half: "every label is … this component's `copy.ts`".
    - The typed text of each state is `zz`, `k`, `co`, `set` or `large`. Fixture data is chosen free of the terms (Other Notes, *Owner-typed text*).
  - **TC-COMP-086.**
    - The selector covers the `data-variant` that CAP-003-E1-S5's `StatusBadge` and `NotDeterminable` render (`status-<tier>`, `coverage-unknown`).
    - At every state, `dialog.querySelectorAll('[data-variant^="status-"], [data-variant="coverage-unknown"]')` is empty, and no element's `className` matches `/\b(bg|text|border)-status-/`.
    - Every error row's `textContent` is non-empty, so nothing is conveyed by colour alone.
    - TC step 2: read `index.tsx` as text with `node:fs` from `import.meta.url`, as the delivered tests do. It contains the not-applicable record, `Stale: not applicable`, `Unavailable: not applicable` and `One-tier rule (AC-20): not applicable`, written by T013.

  Kills:
  - a hand-written copy mutant, `"Type a symbol to find a followed stock"` → `"Type a symbol to find a followed instrument"`: TC-COMP-085.
  - a hand-written mutant that wraps the error row in `<StatusBadge tier="critical">`: TC-COMP-086.
  - remove-attribute of the record comment: TC step 2.

### Additional Unit Tests

- [ ] T009 [P] Write the pure-module cases in `web/src/app/command-palette/command-palette.test.tsx`, in `describe("pages, targets and reasons")`. It runs after T008 (same file), and imports `palettePages` and `matchesText` from `./pages`, `stockTarget` and `universeTarget` from `./targets`, and `failureReason` and `PALETTE_COPY` from `./copy`.
  - (a) **Pages.** With `flags.registered = true`, `palettePages()` `toEqual` the independent literal:

    ```text
    [{ label: "Research", to: "/research", hint: null },
     { label: "Settings", to: "/settings", hint: null },
     { label: "Coverage", to: "/data/coverage", hint: "Data health › Coverage" },
     { label: "Followed stocks", to: "/data/followed", hint: "Data health › Followed stocks" },
     { label: "Downloads", to: "/data/downloads", hint: "Data health › Downloads" }]
    ```

    With `flags.registered = false`, the Research entry is absent. Pages is read from `DESTINATIONS` at call time.
  - (b) **Local match** (DEC-0331).
    - `matchesText("", "Settings")` is true.
    - `matchesText("SET", "Settings")` is true.
    - `matchesText("  set ", "Settings")` is true.
    - `matchesText("data", "Coverage", "Data health › Coverage")` is true.
    - `matchesText("xyz", "Coverage", "Data health › Coverage")` is false.
    - `matchesText("ings", "Settings")` is true: substring, not prefix.
  - (c) **Targets.**
    - With `flags.registered` true, `stockTarget("BRK.B")` is `/research/stocks/BRK.B`. With it false, the same call is `/data/coverage?symbol=BRK.B`.
    - `universeTarget("a/b c")` is `/research/universes/a%2Fb%20c`, using `encodeURIComponent` as CAP-002's `universe-table.tsx` does.
  - (d) **Reasons** (DEC-0332).
    - `failureReason(new ApiUnreachableError("x"))` is `"FactorFlow is not answering"`.
    - `failureReason(new ApiError("No resource exists at this path.", "r", { code: "not_found" }))` is `"FactorFlow hit an unexpected problem"`.
    - `failureReason(new Error("boom"))` is the same.
    - The result never contains the error's `message` or `requestId`.
    - `PALETTE_COPY.empty("zz")` is exactly `No stocks or pages match "zz".`.
    - `PALETTE_COPY.stocksError("r")` is exactly `Couldn't search followed stocks: r.`.

  Kills:
  - swap-case of the sub-page order: (a).
  - negate-boolean in `matchesText`'s empty-text rule: (b)'s first case.
  - a hand-written mutant that uses `startsWith` for `includes`: (b)'s `ings`.
  - remove-attribute of `encodeURIComponent`: (c).
  - a hand-written mutant that returns `error.message` for an `ApiError`: (d).

**Checkpoint**: T002–T009 exist and fail for the right reason: `web/src/app/command-palette/` does not exist, and `token-literals.test.ts` (a) fails on the missing directory. Every delivered test still passes.

---

## Phase 3: Core Implementation

**Purpose**: Write the five non-visual modules, each of which makes its unit cases pass.

- [ ] T010 [P] Create `web/src/app/command-palette/copy.ts`, `targets.ts`, `pages.ts` and `universes.ts`. These depend on T002, T004 and T009 being RED. No file writes a length, hex or colour literal (DAC-E3-S5-4), and no comment writes a unit joined to a number.
  - **`copy.ts`** (command-palette §2.4, §10; UX design §1.1; DAC-E3-12; DEC-0332):
    - `export const PALETTE_COPY` holds:
      - `placeholder: "Jump to a stock or page"`;
      - `groups: { stocks: "Stocks", universes: "Universes", pages: "Pages" }`;
      - `stocksHint: "Type a symbol to find a followed stock"`;
      - `searching: "Searching…"`;
      - `partial: "Showing the first 8. Keep typing to narrow."`;
      - `empty: (text: string) => \`No stocks or pages match "${text}".\``;
      - `stocksError: (reason: string) => \`Couldn't search followed stocks: ${reason}.\``;
      - `universesError: (reason: string) => \`Couldn't read universes: ${reason}.\``;
      - `dataPages` (the three sub-page labels and hints of T009 (a)).
    - `export function failureReason(error: unknown): string` returns `"FactorFlow is not answering"` for `ApiUnreachableError` and `"FactorFlow hit an unexpected problem"` for everything else. It never reads `message` or `requestId` (UX design §0.7).
    - The dialog label *Search FactorFlow* is not here: CAP-003-E1-S3's `CommandDialog` owns it.
  - **`targets.ts`** (DEC-0207):
    - `export function stockTarget(symbol: string): string` returns `` RESEARCH_REGISTERED ? `/research/stocks/${encodeURIComponent(symbol)}` : `/data/coverage?symbol=${encodeURIComponent(symbol)}` ``, reading `RESEARCH_REGISTERED` from `"../destinations"` at call time.
    - `export function universeTarget(id: string): string` returns `` `/research/universes/${encodeURIComponent(id)}` ``.
  - **`pages.ts`** (command-palette §2.3; DEC-0331):
    - `export interface PalettePage { readonly label: string; readonly to: string; readonly hint: string | null }`.
    - `export function palettePages(): readonly PalettePage[]` returns `DESTINATIONS` in order (hint `null`), then *Coverage*, *Followed stocks* and *Downloads* at `/data/coverage`, `/data/followed` and `/data/downloads`, each with its `Data health › …` hint from `PALETTE_COPY.dataPages`. It reads `DESTINATIONS` at call time, so Home (CAP-003-E5-S5) and Data health (CAP-003-E6-S7) appear when those stories add them.
    - `export function matchesText(text: string, ...fields: readonly (string | null)[]): boolean` is true when `text.trim()` is empty, or when any non-null field, lower-cased, `includes` it lower-cased.
  - **`universes.ts`** (command-palette §2.3; DAC-E3-11):
    - `export interface PaletteUniverse { readonly id: string; readonly name: string }`.
    - `export async function fetchActiveUniverses(signal?: AbortSignal): Promise<readonly PaletteUniverse[]>` calls `requestJson<{ universes: { universe_id: string; name: string }[] }>("/api/universes?lifecycle=active", { signal })` from `"../../api/client"` and maps each row to `{ id: universe_id, name }`.
    - The optional `signal` is an additive argument to the story's `fetchActiveUniverses()`.
    - No `limit` is sent: the request is the one DAC-E3-11 names (Open Gap 4).

  These make T009 pass.
- [ ] T011 Create `web/src/app/command-palette/use-stock-search.ts`. It depends on T003 being RED. (DAC-E3-S5-1; command-palette §5; epic NFR *Performance*; Resolved Conflict 1.)
  - `export const STOCK_SEARCH_DEBOUNCE_MS = 250` and `export const STOCK_SEARCH_LIMIT = 8`.
  - `export type StockSearchState = { kind: "idle" } | { kind: "loading" } | { kind: "ok"; symbols: readonly string[]; more: boolean } | { kind: "error"; error: unknown }`.
  - `export function useStockSearch(text: string): StockSearchState` keeps the state in `useState`, with one `useEffect` keyed on `text`:
    - `const prefix = text.trim()`. When it is empty, set `idle` and return.
    - Otherwise set `loading`, create `const controller = new AbortController()`, and start a `setTimeout` of `STOCK_SEARCH_DEBOUNCE_MS`.
    - The timer calls `requestJson<{ instruments: { symbol: string }[]; next_cursor: string | null }>(\`/api/instruments?${new URLSearchParams({ symbol: prefix, lifecycle: "active", limit: String(STOCK_SEARCH_LIMIT) })}\`, { signal: controller.signal })`. The parameter order is the one the delivered `listInstruments` writes.
    - On success, unless `controller.signal.aborted`, set `{ kind: "ok", symbols: body.instruments.map((r) => r.symbol), more: body.next_cursor !== null }`. On failure, unless aborted, set `{ kind: "error", error }`. An aborted request reaches the catch as `ApiUnreachableError`, because `requestJson` wraps every transport rejection, so the guard is what keeps it off screen.
    - The cleanup is `clearTimeout(timer); controller.abort();`, so new text, cleared text and unmount all abort the request in flight.
  - The doc comment cites DAC-E3-S5-1, DAC-E3-11 and Resolved Conflict 1 (why this calls `requestJson` rather than `listInstruments`).

  This makes T003 pass.

**Checkpoint**: T003 and T009 are green, and the palette rendering cases (T002, T004–T008) still fail on the missing `index.tsx`.

---

## Phase 4: Integration

**Purpose**: Compose the dialog and its groups on `ui-components`' `command`, opening the one seam the composition needs.

- [ ] T012 Add the optional `shouldFilter` prop to `CommandDialog` in `web/src/components/ui/command.tsx` (DEC-0330; Resolved Conflict 2). It depends on T001 and on T006 being RED.
  - Widen the props to `{ open, onOpenChange, shouldFilter, children }`, with `shouldFilter?: boolean`, and pass it to the inner `<Command loop label="Search FactorFlow" …>` as `shouldFilter={shouldFilter}`. When it is omitted, cmdk's default filtering stays exactly as CAP-003-E1-S3 shipped it.
  - Nothing else in the file changes: no class, label, `loop`, focus handling or export.
  - CAP-003-E1-S3's `command.test.tsx` (TC-COMP-015), which renders without the prop and asserts that typing `zzz` leaves no option, must stay green unchanged. That is the default-preserving check.
  - Add one doc-comment line naming the prop's consumer, command-palette, and the reason: cmdk's `shouldFilter` exists only on the root `Command`, which `CommandDialog` renders.
- [ ] T013 Create `web/src/app/command-palette/index.tsx`. It depends on T010, T011 and T012, and on T002 and T004–T008 being RED. (Command-palette §2.2–§2.4, §10; UX design §1.1; DAC-E3-11, DAC-E3-12, DAC-E3-S5-2, DAC-E3-S5-3.)
  - **Exports.** `export interface CommandPaletteProps { open: boolean; onOpenChange: (open: boolean) => void }` and `export function CommandPalette({ open, onOpenChange }: CommandPaletteProps): JSX.Element`. It returns `<CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}><PaletteBody onClose={() => onOpenChange(false)} /></CommandDialog>`.
  - **`PaletteBody`** (private) mounts only while the dialog is open, because Radix unmounts the content on close. So `const [text, setText] = useState("")` and the universes read are per opening, and nothing typed is kept (DAC-E3-S5-3; command-palette §4).
  - **Hooks.**
    - `const stocks = useStockSearch(text)`.
    - `const navigate = useNavigate()`.
    - The universes state is `{ kind: "off" } | { kind: "loading" } | { kind: "ok"; rows: readonly PaletteUniverse[] } | { kind: "error"; error: unknown }`. It starts as `RESEARCH_REGISTERED ? { kind: "loading" } : { kind: "off" }`.
    - A `useEffect(…, [])` returns early unless `RESEARCH_REGISTERED`. Otherwise it creates an `AbortController`, calls `fetchActiveUniverses(controller.signal)`, sets `ok` or `error` unless aborted, and aborts in its cleanup. That is one read per open, and none while unregistered (DAC-E3-S5-2). Under React `StrictMode` in development, the first of the two mounts is aborted.
  - **Choose.** `const choose = (to: string) => { navigate(to); onClose(); }`. Focus returns to the opener through CAP-003-E1-S3's `onCloseAutoFocus`.
  - **Render.** `<CommandInput placeholder={PALETTE_COPY.placeholder} value={text} onValueChange={setText} />`, then `<CommandList>` holding, in this order:
    - **Stocks**, rendered unless `stocks.kind === "ok"` with no symbols. `<CommandGroup heading={PALETTE_COPY.groups.stocks}>` holds one of:
      - `idle`: `<CommandItem disabled value="hint:stocks">` with the hint text;
      - `loading`: `<CommandLoading>{PALETTE_COPY.searching}</CommandLoading>`;
      - `ok`: one `<CommandItem value={\`stock:${symbol}\`} onSelect={() => choose(stockTarget(symbol))}>{symbol}</CommandItem>` per symbol, then, when `more`, `<CommandItem disabled value="partial:stocks">` with the partial text;
      - `error`: `<CommandItem disabled value="error:stocks">{PALETTE_COPY.stocksError(failureReason(stocks.error))}</CommandItem>`.
    - **Universes**, only when `RESEARCH_REGISTERED`, and only when the read errored or has at least one row passing `matchesText(text, u.name)`. Its heading appears when the read answers (command-palette §2.4 *Loading*). Each row is `value={\`universe:${u.id}\`}` and selects `universeTarget(u.id)`. The error row is a `disabled` item with `PALETTE_COPY.universesError(...)`.
    - **Pages**: `palettePages().filter((p) => matchesText(text, p.label, p.hint))`, rendered when non-empty. Each row is `value={\`page:${p.to}\`}` and selects `p.to`. It shows the label, plus the hint, when non-null, in `<span className="ml-auto text-xs text-muted-foreground">`.
    - A `<CommandSeparator alwaysRender />` between each pair of adjacent rendered groups.
    - `<CommandEmpty>{PALETTE_COPY.empty(text.trim())}</CommandEmpty>`, rendered only when `text.trim() !== ""`, `stocks.kind === "ok"` and the universes state is not `loading`. cmdk shows it only when no item is mounted, so it never appears beside an error row or during a search.
  - **Disabled rows.** Every hint, partial and error row uses cmdk's `disabled`. That gives `aria-disabled="true"` and `data-disabled`, and arrow navigation skips the row (command-palette §10). The text is the row itself, never a colour.
  - **Values.** Every item's explicit `value` is prefixed by its kind, so a universe named like a page or a symbol never collides in cmdk's selection.
  - **Not-applicable record.** The module doc comment records the eight command-palette §2.4 states and where each renders, written exactly as T008 reads them:
    - `Stale: not applicable` (stocks are re-read per settled keystroke, universes once per open);
    - `Unavailable: not applicable` (no check runs here);
    - `One-tier rule (AC-20): not applicable` (rows are symbols, universe names and page names, so no status renders and no value is undeterminable, and `NotDeterminable` and `StatusBadge` are not used).
  - Imports: `type JSX` and `useEffect`/`useState` from `"react"`; `useNavigate` from `"react-router-dom"`; the eight `command` parts from `"../../components/ui/command"`; `RESEARCH_REGISTERED` from `"../destinations"`; and the five sibling modules. There is no `dangerouslySetInnerHTML` and no browser storage (command-palette §4).

  This makes T002 and T004–T008 pass.

**Checkpoint**: Every new test, T002–T009, is green, and so is CAP-003-E1-S3's `command.test.tsx`.

---

## Phase 5: Polish

**Purpose**: Validation, the full scan and TDD evidence.

- [ ] T014 Run `web/src/components/token-literals.test.ts` unchanged apart from T007, together with the full suite. Then plant `export const x = "12px";` in a temporary `web/src/app/command-palette/planted.tsx`, confirm `npm run test -- token-literals` fails naming that file, and delete it (TC-COMP-084 step 3 on the real file system). Run `npm run lint`, `npm run format`, `npx tsc --noEmit` and `npm run build` from the repo root (traces to DAC-E3-S5-4, AC-26).
- [ ] T015 After each TDD cycle in T002–T014, not once at the end, do the following before the next cycle begins. This traces to no AC (INV-TDD-002, TEST-TDD-008).
  - Stage only that cycle's diff. Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Append the cycle to `CAP-003-E3-S5-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict` and `spec_drift.drift_detected`;
    - `tests_executed: true` and its RED/GREEN evidence;
    - the structured `mutation:` block that `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change;
    - `diff_sha256`: the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.
  - `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit.
  - This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made.

  The cycles are:
  - (1) T009 + T010: copy, targets, pages and universes.
  - (2) T003 + T011: the stock search.
  - (3) T002 + T004 + T005 + T006 + T007 + T008 + T012 + T013: the dialog, the `CommandDialog` prop and the scan widening. T007's directory case (a) needs all six sources, `index.tsx` included, so it turns green in this cycle.

  T014 adds no behaviour and joins cycle 3's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S6 | reverse | Mounts `<CommandPalette open onOpenChange />` from the shell's single `keydown` listener and the top bar's *Search* opener (DAC-E3-10; TC-COMP-088). Graph: E3-S6 depends on E3-S5 |
| CAP-003-E3-S8 | reverse | `tests/e2e/command-palette.spec.ts` drives this palette end to end (TC-INT-041 to TC-INT-045, TC-E2E-007). It should assert through `stockTarget`/`RESEARCH_REGISTERED` (register C1). Graph: E3-S8 depends on E3-S5 |
| CAP-003-E3-S2 | context | Owns `health.tsx`. The palette does not read health: its unreachable state comes from its own reads failing with `ApiUnreachableError` (Other Notes, *Unreachable*), so nothing is imported from it |
| CAP-003-E1-S5 | context | Owns `StatusBadge`, `labelOf` and `NotDeterminable`, which DAC-E3-S5-5 and DAC-E3-S5-6 name. The palette renders no status, so it imports none of them (T008 asserts the absence) |
| CAP-003-E5-S5 | context | Adds Home to `DESTINATIONS`. `palettePages()` reads the list at call time, so Home appears in Pages with no change here |
| CAP-002-E4-S1 | context | Added the `requestJson` export in `web/src/api/client.ts` that `universes.ts` and `use-stock-search.ts` call. Delivered; nothing to wait for |
| CAP-003-E6-S7 | context | Adds Data health to `DESTINATIONS`, which Pages likewise lists unchanged |

No new hard edge was found. This story imports or edits only these:

- CAP-003-E1-S3's `web/src/components/ui/command.tsx` (imported, and widened by T012);
- CAP-003-E3-S4's `web/src/app/destinations.ts`;
- the `requestJson`, `ApiError` and `ApiUnreachableError` exports CAP-003-E3-S1 confirms in `web/src/api/client.ts`;
- CAP-003-E1-S1's `web/src/components/token-literals.test.ts` (widened by T007).

All four are graph edges already: `CAP-003-E3-S5: [CAP-003-E3-S1, CAP-003-E3-S4, CAP-003-E1-S3, CAP-003-E1-S1]`.

### Task Dependencies

- T001 comes first.
- T002, T004, T005, T006, T008 and T009 share `command-palette.test.tsx` and run in sequence. T002 writes the shared harness.
- T003 (`use-stock-search.test.ts`) and T007 (`token-literals.test.ts`) can be written in parallel with that file.
- T010 depends on T002, T004 and T009 being RED.
- T011 depends on T003 being RED.
- T012 depends on T001 and on T006 being RED.
- T013 depends on T010, T011 and T012.
- T014 depends on T013 and T007.
- T015 is interleaved: it runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- Phase 2: three test files in parallel (T002 and its same-file followers; T003; T007).
- Phase 3: T010 and T011 touch different files and can run in parallel.
- Phase 4: T012 can run in parallel with Phase 3.

---

## Validation Plan

### Constitution-Defined Commands

From tech-stack v7, Validation Commands. Run each from the repo root.

- Install: `npm ci` (no lockfile change by this story)
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check only)
- Type check: `npx tsc --noEmit`
- `npm run test:e2e` is not run by this story. No spec is added or changed, and the keyboard journey is CAP-003-E3-S8's.

### Story-Specific Validation

- **DAC-E3-S5-1:** T003 is green.
- **DAC-E3-S5-2, AC-27:** T004 is green.
- **DAC-E3-S5-3, AC-25:** T005 is green.
- **DAC-E3-S5-4, AC-26:** T007 and the whole `token-literals.test.ts` are green, and T014's planted-file check fails, then passes once the file is removed.
- **DAC-E3-S5-5, AC-19 / DAC-E3-S5-6, AC-20:** T008 is green.
- **DAC-E3-11, AC-22:** T004 and T006 are green.
  - `grep -rnE "onSelect=" web/src/app/command-palette/index.tsx` shows every handler calling `choose(…)`, which only navigates and closes.
  - `grep -rnE "method:" web/src/app/command-palette/` prints nothing: every request is a `GET`.
- **DAC-E3-12, AC-24:** T002 is green.
- **Command component unchanged by default:** `web/src/components/ui/command.test.tsx` is green. `git diff -- web/src/components/ui/command.tsx` shows only the `shouldFilter` prop, its forwarding and the doc-comment line.
- **Scope:**
  - `git diff --stat` lists only the six new modules and two test files under `web/src/app/command-palette/`, `web/src/components/ui/command.tsx`, `web/src/components/token-literals.test.ts` and the TDD-evidence file.
  - `git diff --exit-code -- package.json package-lock.json web/src/api web/src/app/destinations.ts web/src/app/shell.tsx web/src/main.tsx` passes.
- **Security (command-palette §4):** `grep -rnE "dangerouslySetInnerHTML|localStorage|sessionStorage|indexedDB" web/src/app/command-palette/` prints nothing.
- **Mutation:** run `python3 scripts/mutation-run.py` (`generate`, then `run`) with `--command "npx vitest run web/src/app/command-palette web/src/components/token-literals.test.ts web/src/components/ui/command.test.tsx && npx tsc --noEmit"`. Target the added lines of the six modules and `command.tsx`, plus the hand-written mutants in Other Notes. No non-equivalent mutant may survive.

---

## Notes

### Resolved Conflicts

1. **"Through the delivered `listInstruments`" vs "aborted".**
   - The story Description, command-palette §1 and §2.3, and the story's API Contract say the stock search goes through `listInstruments(...)`.
   - Epic DAC-E3-11 ("aborted on new text"), DAC-E3-S5-1 ("the earlier one, if in flight, is aborted") and command-palette §5 require the in-flight request to be aborted.
   - The delivered `listInstruments(filters)` takes no `signal` and does not forward `init` (`web/src/api/client.ts:255-279`), so it cannot be aborted.
   - Governing: the epic and story acceptance criteria over Description and design prose (precedence ladder step 1). The request is aborted for real, through `requestJson` with `{ signal }`, the export DEC-0211 made for exactly this kind of shell-side read.
   - `client.ts` is not given a new parameter: DEC-0211 makes it `owner-web-app`'s, and the story's Implementation file list does not include it.
   - The request is byte-identical to the one `listInstruments` sends (`symbol=KO&lifecycle=active&limit=8`, the same parameter order), so the server contract is unchanged.
   - The register listed this as an undecided gap (G2). It is settled by precedence, and the register is corrected.
2. **"`shouldFilter={false}` on the Stocks group" vs the group order.**
   - The story's Implementation, command-palette §2.3, UX design §1.1 and the `command` spec §4 place `shouldFilter={false}` on the Stocks group.
   - cmdk's `shouldFilter` exists only on the root `Command`. With the root filtering, cmdk also hides non-matching rows (the hint, partial and error rows) and re-orders groups by their best score.
   - Governing: epic DAC-E3-11 ("Stocks, Universes …, and Pages …, in that order") and DAC-E3-12 (the hint and partial rows render). The group-level wording is illustrative.
   - The palette turns filtering off at the root and filters Universes and Pages itself, which is the "filtered locally" both designs ask for (UX design §1.1 *Interaction Flows*: "typing filters Pages and Universes locally").
   - The seam through `CommandDialog` that this needs is DEC-0330 (Open Gap 1).
3. **The stock row text.** UX design §1.1 shows *{SYMBOL} · {name}*. Governing: command-palette §3 together with the code fact that `Instrument` has no name (`web/src/api/types.ts:107`). The symbol renders alone, with no hint, as UX design itself qualifies ("where the followed list holds one") (register C6).
4. **The universes request.** UX design §1.1 writes `GET /api/universes` with no filter. Governing: epic DAC-E3-11, `GET /api/universes?lifecycle=active` (register C5). Command-palette §14.1's assumption is confirmed by code: the delivered route takes `lifecycle` with default `active` (`src/factorflow/api/routes/universes.py:216-220`), so no local lifecycle filter is added (ladder step 4).
5. **The template clause of DAC-E3-S5-6.** "When rendered, Then each goes through `StatusBadge` …" is the shared template clause. It is vacuous here, because the criterion's own first clause says no status renders. TC-COMP-086 asserts the absence, as coverage-matrix note 7 records (`tests/coverage-matrix.md` line 460).

### Open Gaps

1. **How the palette turns cmdk's filtering off. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0330.**
   - **What is undefined.** Resolved Conflict 2 requires `shouldFilter={false}` on the root cmdk `Command`, which CAP-003-E1-S3's `CommandDialog({ open, onOpenChange, children })` renders internally, with no way to pass it. `ui-components` §2.1 names the exports without signatures, so no artifact fixes this seam.
   - **Adopted (T012).** `CommandDialog` gains an optional, defaulted `shouldFilter?: boolean`, forwarded to the inner `Command`. When it is omitted, behaviour is exactly as delivered, and CAP-003-E1-S3's TC-COMP-015 stays green unchanged.
   - **Derivation.** It is the minimal additive change (constraint 9a). The alternatives fail:
     - a second `Command` nested inside the dialog duplicates cmdk's keyboard handling and its hidden label;
     - composing the palette on bare Radix Dialog bypasses `ui-components`' `command` (AC-26) and its focus contract.
   - **Class: propagating.** It widens `ui-components`' `command` contract, and later consumers may rely on it.
   - **Follow-up.** `ui-components` §2.1 (the `command` exports) and command-palette §2.3 (where the "on the Stocks group" wording should become "on the dialog, with Universes and Pages filtered locally"), at their next revision.
2. **Local filtering and Pages composition. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0331.**
   - **What is undefined.** "Filtered locally" (DAC-E3-11; command-palette §2.3; UX design §1.1) names no matching rule. "The shipped destinations plus Coverage, Followed stocks, Downloads" names no order. "Its route group" names no hint for a top-level page.
   - **Adopted (T009, T010):**
     - A universe matches when its name contains the trimmed text, ignoring case.
     - A page matches when its label or hint does.
     - Empty text matches everything, so Pages lists every shipped page before typing (DAC-E3-12; command-palette §2.4), and so do Universes.
     - Pages are `DESTINATIONS` in their own order, then *Coverage*, *Followed stocks* and *Downloads* with the hints *Data health › Coverage*, *Data health › Followed stocks* and *Data health › Downloads*.
     - A top-level destination carries no hint.
   - **Derivation.**
     - Substring matching is the simplest rule that finds *Coverage* from `cov` and the three data pages from `data`.
     - `DESTINATIONS`-first keeps the rail's order.
     - The hint text is the breadcrumb CAP-003-E3-S4's `titles.ts` gives those routes. It is written in `copy.ts` rather than imported, so the palette does not depend on `titles.ts`' provisional interface (DEC-0329).
   - **Class: contained.**
   - **Follow-up.** Command-palette §2.3, at its next revision.
3. **The `{reason}` in the two error rows. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0332.**
   - **What is undefined.** UX design §0.7 says the envelope `code` selects the wording and `request_id` is never shown, but no copy table maps a code, or a transport failure, to a reason (register G3). The delivered envelope messages cannot be used: they name *instrument*, which DAC-E3-S5-5 forbids.
   - **Adopted (T010).** `ApiUnreachableError` reads *FactorFlow is not answering*. Every other failure reads *FactorFlow hit an unexpected problem*. The two GETs can answer only `internal_error`, an unexpected `validation_error` or `not_found`, and none of those has a recovery the owner can act on in the palette.
   - **Derivation.**
     - The first is owner-shell §2.8's unreachable heading.
     - The second is CAP-002's delivered fallback sentence (`web/src/screens/research/copy.ts:166`, `FALLBACK_ERROR`), which also never reads `message` (ladder step 5, local precedent).
   - **Class: contained.**
   - **Follow-up.** Command-palette §2.4 *Error* row, at its next revision.
4. **The universes read is one page** (register G11). The specified request, `GET /api/universes?lifecycle=active`, returns the route's default page of 50, newest first. No artifact names a `limit` or paging for the palette, so active universes beyond the newest 50 are not offered.
   - The plan sends exactly the request DAC-E3-11 and the story name, and adopts no value.
   - A `limit` of up to 500, or paging, would be a new contract. This is a genuine gap for command-palette §2.3 to absorb at its next revision.
   - It does not affect M1's scale today: CAP-002's universes are owner-created and few.

### Other Notes

- **Unreachable.** DAC-E3-12 requires only that the palette opens and Pages stays usable while health is unreachable. The palette reads no health (its story lists no dependency on CAP-003-E3-S2). Universes says it cannot read as soon as its read fails on open. Stocks says it cannot search on the first search, and shows its hint row before any text is typed. This satisfies UX design §1.1's "Stocks and Universes state they cannot search" without a second source of liveness. T002 (g) pins it.
- **Owner-typed text.** `CommandEmpty` echoes the owner's own text, so typing `run` would show *No stocks or pages match "run".*. That is the owner's input, not a label, and is outside DAC-E3-S5-5. Symbols and universe names are data, not labels, so T008's fixtures avoid the terms rather than the scan exempting them.
- **cmdk counting.** With `shouldFilter={false}`, cmdk counts every mounted item, disabled rows included. That is why `CommandEmpty` is additionally gated on a settled search (T013), and why the hint, partial and error rows keep it hidden.
- **`RESEARCH_REGISTERED` is true in this clone** (CAP-002 has merged; register D1). The unregistered branch is exercised only through T002's `vi.hoisted` mock, which is why `targets.ts` and `pages.ts` read the constant at call time rather than caching it.
- **Plan checks.**
  - T007's widened scan also covers `index.tsx` and `copy.ts`, including their comments. The doc comments must therefore write no number joined to a length unit and no `#` followed by hex digits.
  - The hint uses `text-xs` and `text-muted-foreground`, and the layout uses `ml-auto`. All are token-backed classes.
  - Nothing in this plan's greps forbids what a task requires: the `method:` grep runs over the palette directory only, where no request sets a method.
- **Hand-written mutants** (add to the mutation run):
  - `web/src/app/command-palette/index.tsx`: `<CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>` → `<CommandDialog open={open} onOpenChange={onOpenChange}>`, killed by T006 (b).
  - `web/src/app/command-palette/index.tsx`: the text `useState("")` moved from `PaletteBody` into `CommandPalette` and passed down, killed by T005 (b).
  - `web/src/app/command-palette/index.tsx`: the universes `useEffect` deps `[]` → `[text]`, killed by T004 (b).
  - `web/src/app/command-palette/index.tsx`: `CommandEmpty` rendered whenever `text.trim() !== ""`, killed by T002 (b).
  - `web/src/app/command-palette/index.tsx`: `choose` without `onClose()`, killed by T005 (c).
  - `web/src/app/command-palette/use-stock-search.ts`: `return () => { clearTimeout(timer); controller.abort(); }` → `return () => { clearTimeout(timer); }`, killed by T003 (b) and (c).
  - `web/src/app/command-palette/copy.ts`: `"Type a symbol to find a followed stock"` → `"Type a symbol to find a followed instrument"`, killed by T008.
  - `web/src/app/command-palette/pages.ts`: `.includes(` → `.startsWith(`, killed by T009 (b).
  - `web/src/app/command-palette/copy.ts`: the `ApiError` branch returning `error.message`, killed by T009 (d).
  - `web/src/components/ui/command.tsx`: `shouldFilter={shouldFilter}` removed from the inner `Command`, killed by T006 (b).
- **No TDD exception is planned.** Every behaviour-changing task belongs to a cycle in T015.
