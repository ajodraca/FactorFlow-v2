---
artifact_schema_version: 1
artifact_id: CAP-003-E6-S7-tasks
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
  timestamp: 2026-11-07T07:13:19Z
  source_artifacts:
    - id: CAP-003-E6-S7
      version: "1"
    - id: CAP-003-E6
      version: "2"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-data-health-ui
      version: "1"
    - id: CAP-003-component-design-command-palette
      version: "1"
    - id: CAP-003-owner-shell-tests
      version: "1"
    - id: CAP-003-E3-S4-tasks
      version: "1"
    - id: CAP-003-E3-S5-tasks
      version: "1"
    - id: CAP-003-E3-S6-tasks
      version: "1"
    - id: CAP-003-E3-S8-tasks
      version: "1"
    - id: CAP-003-E6-S5-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E6-S7 — Register Data Health in the Shell: the /data Route, Its Title, the Data Health Destination and Its Chip

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S7.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/app/` and `tests/e2e/`; design `owner-shell`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

The owner-shell story that closes E6 (DEC-0223 answer A). In one change, as DEC-0204 and DAC-E3-2 require, it:

- registers `/data` in `web/src/app/routes.tsx` with CAP-003-E6-S5's default-exported `DataHealthScreen`, through `React.lazy(() => import("../screens/data-health"))`, following CAP-003-E3-S4's binding pattern;
- adds `{ pattern: "/data", crumbs: [{ label: "Data health" }] }` to CAP-003-E3-S4's `TITLES` in `web/src/app/titles.ts`, so the top bar reads *Data health* on the screen. The *Data health* ancestor crumb of the three `/data/*` screens already links to `/data`, and now lands on a screen instead of the not-found state;
- inserts `{ group: "data", label: "Data health", to: "/data", count: "problems" }` into `DESTINATIONS` in `web/src/app/destinations.ts`, directly before Settings (owner-shell §2.6).

Nothing else in production changes. CAP-003-E3-S6's rail already renders every `DESTINATIONS` entry, picks the `/data` icon from `RAIL_ICONS`, and gives an entry with `count: "problems"` its chip from `count-chip.tsx`: `attention.problems.stock_count`, named *Data health, {n} stocks with problems*, absent at zero, with *, as of {time}* while attention fails. CAP-003-E3-S5's `palettePages()` reads `DESTINATIONS` at call time, so the palette's Pages group gains *Data health* with no edit (command-palette l.133).

The tests:

- `routes.test.tsx`, `titles.test.tsx` and `shell.test.tsx` are extended.
- `tests/e2e/shell-navigation.spec.ts` gains the Data health row in CAP-003-E3-S8's `LANDINGS` table, reached by rail and by palette with its `h1` focused, plus a Pages check.
- One fixture in `shell.test.tsx` and in `shell.a11y.test.tsx` is rewritten as an independent literal. Otherwise it would list Data health twice once the real list holds it (Other Notes, *Test destinations*).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-1 | Data health sits in the data-and-system group before Settings | T002, T006, T009, T010 |
| AC-16 | The Data health destination carries the number of followed stocks with problems, absent when zero | T006, T009 |
| AC-17 | Data health opens in the same shell, titled in the top bar | T002, T003, T004, T008, T009, T010 |
| AC-25 | Every operation completable by keyboard (through DAC-E3-7 and DAC-E6-S7-2) | T004, T005, T010 |
| DAC-E3-2 | A destination enters `DESTINATIONS` only in the change that registers its screen | T002, T009, T011 |
| DAC-E3-7 | The Data health chip equals `attention.problems.stock_count`, no chip at zero, the count named in words, last value kept and marked stale while attention fails | T006, T009 |
| DAC-E6-S7-1 | At `/data/downloads` the *Data health* crumb links to `/data` and lands on the Data health screen | T003, T004, T008, T009 |
| DAC-E6-S7-2 | In `shell-navigation.spec.ts`, Data health chosen from the rail and from the palette's Pages group by keyboard renders `/data` with its `h1` focused | T005, T010 |

Mapped test cases (`tests/component/owner-shell-tests.md` lines 806-846; `tests/coverage-matrix.md` lines 313-314 and the per-story count "2 of 2" at line 431):

- **TC-COMP-181** (DAC-E6-S7-1): T003 and T004.
- **TC-COMP-182** (DAC-E6-S7-2): T005 at component level and T010 in the real-stack spec (Resolved Conflict 1).

The epic criteria DAC-E3-2 and DAC-E3-7 are carried here but tested by other stories: TC-COMP-057 (CAP-003-E3-S4) and TC-COMP-060 (CAP-003-E3-S6). T002 extends TC-COMP-057's literal with the new entry. T006 proves DAC-E3-7 through the real `DESTINATIONS` entry, which TC-COMP-060 could only reach through a test list.

## Phase 1: Setup

**Purpose**: Confirm the inputs. No package, configuration or directory is added.

- [ ] T001 Confirm the hard prerequisites are in the working tree before Phase 2. No file is created or edited by this task; record the `grep -n` outputs in the first TDD cycle's evidence.
  - CAP-003-E6-S5: `web/src/screens/data-health/index.tsx` has `export default function DataHealthScreen` (E6-S5 T013). Its `h1` is *Is the data good enough to trust?* with `tabIndex={-1}`, rendered by CAP-003-E6-S1's `Verdict` in every state (E6-S5 T003 (a) and Other Notes).
  - CAP-003-E3-S4:
    - `web/src/app/destinations.ts` (`Destination` with `count?: "needs-you" | "problems"`, `DESTINATIONS`, `RESEARCH_REGISTERED`);
    - `titles.ts` (`TITLES`, `resolveTitle`, `useTitle`, `Crumb`, `CrumbSpec`);
    - `routes.tsx` (`AppRoutes`, the ten `lazy` bindings, the `Suspense` fallback);
    - `routes.test.tsx` and its shared harness (`vi.mock` stubs keyed by module path, the `loaded` set, `loadedAtImport`, `renderAt`, `LocationProbe`, `HEALTH_EMPTY`);
    - `titles.test.tsx`.
  - CAP-003-E3-S6:
    - `web/src/app/shell.tsx` (`Shell`, `Rail`, `RAIL_ICONS` holding `"/data"`, `useFocusHeadingOnPathChange`, `top-bar-title`, `data-liveness` on `main`);
    - `count-chip.tsx` (`CountChip`, `chipName`, `readChip`);
    - `shell.test.tsx` (`routedFetch`, `settle()`, screen stubs with `mounts`, `ATTENTION_3_2`, `TEST_DESTINATIONS`, `forbiddenTerms`);
    - `shell.a11y.test.tsx` (`TEST_DESTINATIONS`).
  - CAP-003-E3-S8: `tests/e2e/shell-navigation.spec.ts` (`Landing`, `LANDINGS`, `landByKeyboard`, `tabTo`, `chooseOption`, `openPaletteByShortcut`, `rail`, `banner`, `topBarTitle`, `mainHeading`, `palette`) and its test (d) *Only what is registered*.
  - CAP-003-E2-S5: `GET /api/data-health` and `GET /api/attention` are served on the real stack, so the screen renders in T010.
  - Run `npm run test` and record the baseline as green.

**Checkpoint**: Every listed module exists with the named exports, and the suite is green before this story's first edit.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the `/data` route, its title, the destination and its chip, and the keyboard landings.

### Mandatory Component Tests

- [ ] T002 [P] Extend `web/src/app/routes.test.tsx` (CAP-003-E3-S4's harness; owner-shell §2.6; DAC-E3-2, AC-1, AC-17). Edit only what this list names, and put `// CAP-003-E6-S7` beside each added row.
  - **Stub.** Add `../screens/data-health` to the `vi.mock` stub list, keyed `data-health`. Its default export renders `<p data-testid="stub-data-health">`, and its factory adds `"data-health"` to `loaded`, like the other stubs.
  - **TC-COMP-057 literal (CAP-003-E3-S4 T002).** Insert `{ group: "data", label: "Data health", to: "/data", count: "problems" }` into the independent `DESTINATIONS` literal, directly before the Settings entry. If CAP-003-E5-S5 has landed, its Home entry stays first. The *every `to` occurs as a `path="…"`* check then requires `path="/data"` in `routes.tsx`.
  - **Route map (CAP-003-E3-S4 T009).**
    - (a) Add the row `/data` → `stub-data-health`: the stub renders, `location` stays `/data`, and no not-found heading renders.
    - (d) Add `"/data"` to the sorted pattern literal, and remove `/data` from the *absent* assertion. `/setup` and `/home` stay absent unless their own stories have landed.
    - (e) `loadedAtImport` still `toEqual(new Set())`. After rendering only `/data`, `loaded` has gained `"data-health"` and no other key from this case.
  - **TC-COMP-056 step 4 (CAP-003-E3-S4 T001 (f); its Resolved Conflict 2 hands this to this story).** With `HEALTH_EMPTY`, `renderAt("/data")` renders `stub-data-health` and `location` stays `/data`: setup incomplete does not lock Data health.

  Kills:
  - swap-case on the `/data` binding (`<CoverageScreen />` instead of `<DataHealthScreen />`): (a).
  - a hand-written mutant that imports `DataHealthScreen` statically: (e).
  - a hand-written mutant that adds the destination without the `Route`: the `path=` check and (a).
  - a hand-written mutant that places the Data health entry after Settings: the literal.
- [ ] T003 [P] Implement the title half of TC-COMP-181 (Data health crumb on /data/downloads links to /data) in `web/src/app/titles.test.tsx`, with a `// Implements TC-COMP-181` comment on the new rows (CAP-003-E3-S4 T004 and T005; DAC-E3-9, DAC-E6-S7-1).
  - (b) Add the row `/data`, `null` → `[{ label: "Data health" }]` to the independent literal table, and a second row `/data` with detail `"X"` → the same, since `/data` has no detail slot.
  - The existing `/data/downloads` row stays and is now the TC's first expectation: its first crumb is `{ label: "Data health", to: "/data" }`.
  - (a) The set-equality case needs no edit. It fails until `TITLES` has a `/data` entry, because `routes.tsx` will have `path="/data"`.
  - (c) The *linked ancestors, text last* case needs no edit. It now also covers the one-crumb `/data` entry: the last crumb has no `to`.
  - T005 (d) of CAP-003-E3-S4: the mounted probe navigated to `/data` reads exactly `Data health`.

  Kills:
  - remove-attribute on the `/data` title entry: (a) and (b).
  - a hand-written mutant that writes `{ label: "Data health", to: "/data" }` as `/data`'s only crumb: (c), where the last crumb has a `to`.
  - a hand-written mutant that writes `"Data Health"`: (b).
- [ ] T004 Implement the landing half of TC-COMP-181 in `web/src/app/shell.test.tsx`, with a `// Implements TC-COMP-181` comment, in a new `describe("Data health registration (CAP-003-E6-S7)")`. Use CAP-003-E3-S6's shared conventions (`routedFetch`, `settle()`, `mounts`, unmount at the end).
  - **Stub.** Add `vi.mock("../screens/data-health", …)` beside the existing stubs. Its default export renders `<h1>Data health stub</h1>` with no `tabIndex`, and counts mounts in `mounts["data-health"]`.
  - **Steps.**
    - Render `<MemoryRouter initialEntries={["/data/downloads"]}><Shell /></MemoryRouter>` with a `LocationProbe`, then `settle()`.
    - Read the crumb: `within(getByTestId("top-bar-title")).getByRole("link", { name: "Data health" })` has `href` `/data`.
    - Activate it by keyboard (AC-25): press `user.tab()` until that link has focus (at most 20 presses, failing with a message otherwise), then `user.keyboard("{Enter}")`.
  - **Expected.**
    - `location` reads exactly `/data`.
    - `within(getByRole("main")).findByRole("heading", { level: 1, name: "Data health stub" })` renders, and no *There's no page at this address.* heading does.
    - The top-bar title's text is exactly `Data health`, and it contains no link.
    - `getByRole("navigation", { name: "Main" })` and `getByRole("banner")` are still present (the same shell, AC-17).

  Kills:
  - remove-attribute on the `/data` `Route`: the not-found heading renders.
  - remove-attribute on the `/data` title entry: the title falls back to *Page not found*.
- [ ] T005 Implement TC-COMP-182 (Data health reached from the rail and palette Pages by keyboard, `h1` focused) in `web/src/app/shell.test.tsx`, with a `// Implements TC-COMP-182` comment, sequential with T004 (one file). Stub cmdk's jsdom gaps (`ResizeObserver`, `Element.prototype.scrollIntoView`) per test, as CAP-003-E3-S6 T006 does.
  - **(a) Rail (step 1).**
    - Render the shell at `/settings`, then `settle()`.
    - Press `user.tab()` until the rail link whose accessible name matches `/^Data health(, .+)?$/` has focus, then `{Enter}`.
    - `location` reads `/data`.
    - `await waitFor` until `document.activeElement` is the stub's `h1`, which now carries `tabindex="-1"` (CAP-003-E3-S6 T014 `useFocusHeadingOnPathChange`).
  - **(b) Palette (step 2).**
    - A fresh render at `/settings`, then `settle()`.
    - `user.keyboard("{Control>}k{/Control}")` opens `getByRole("dialog", { name: "Search FactorFlow" })`. Then `user.keyboard("Data")`.
    - Within the dialog's `group` named *Pages*, press `{ArrowDown}` until the option whose `data-value` is `page:/data` has `aria-selected="true"`, at most 15 presses. Then `{Enter}`.
    - The dialog is gone, `location` reads `/data`, and the stub's `h1` has focus, as in (a).
  - Neither path uses `click`.

  Kills:
  - a hand-written mutant that drops the Data health entry from `DESTINATIONS` but keeps the route: (a) and (b), since no rail link or page option exists.
  - a hand-written mutant that sets the entry's `to` to `"/data/coverage"`: (a) and (b), where `location` reads the wrong path.

### Additional Unit Tests

- [ ] T006 Write the destination and chip cases in `web/src/app/shell.test.tsx`, in the same `describe` as T004, sequential with T005 (AC-1, AC-16, DAC-E3-7). These render the real `DESTINATIONS` through `Shell`, not `TEST_DESTINATIONS`, so they prove that the entry this story adds carries its group, place and count.
  - **(a) The data group (AC-1: "… apart from Data health and Settings, in that order").**
    - In `nav` *Main*, the second `list`'s link names, read with any count clause removed (`name.replace(/, .*$/, "")`), `toEqual` the independent literal `["Data health", "Settings"]`.
    - Its hrefs `toEqual(["/data", "/settings"])`.
    - This holds whether or not CAP-003-E5-S5's Home has landed, because Home is `primary`.
  - **(b) Chip with problems.**
    - Set the system time to `2026-09-06T18:30:00.000Z` (`vi.useFakeTimers({ shouldAdvanceTime: true })`, as in CAP-003-E3-S6 T004).
    - `routedFetch` answers `/api/attention` with `ATTENTION_3_2` (`problems.stock_count: 3`, plus the `data_problems` and `credential_missing` items, so Home's count would be the different value `2`).
    - After `settle()`, the rail link with `href` `/data` has accessible name exactly `Data health, 3 stocks with problems`.
    - It contains one element with `data-variant="status-warning"` whose text is exactly `3`.
  - **(c) No chip at zero.** With CAP-003-E3-S6's `ATTENTION_CLEAR` (`stock_count: 0`), the `/data` link's accessible name is exactly `Data health`, and it contains no `[data-variant^="status-"]` element.
  - **(d) Stale while attention fails.**
    - Continue (b). Queue the next `/api/attention` answer as a `500` envelope, then `await vi.advanceTimersByTimeAsync(60_000)`, the idle attention cadence (owner-shell §2.4).
    - The `/data` link's name becomes exactly `Data health, 3 stocks with problems, as of 13:30:00 CDT`: the independent literal of `formatClock` for the last success (DEC-0335).
    - The chip text stays `3`.
  - **(e) `aria-current`.** The current-item behaviour follows CAP-003-E3-S6 T008 (b)'s `NavLink` ancestor match (Other Notes).
    - At `/data`, the `/data` link has `aria-current="page"` and the Settings link has none.
    - At `/data/coverage`, the `/data` link has `aria-current="page"`.
  - **(f) Pages lists every shipped destination (story Description).**
    - At `/settings`, open the palette with `{Control>}k{/Control}` and type nothing.
    - Read the `data-value` of every option in the *Pages* group.
    - The list `toEqual` `DESTINATIONS.map((d) => \`page:${d.to}\`)` followed by `["page:/data/coverage", "page:/data/followed", "page:/data/downloads"]`.
    - Its last six entries also `toEqual` the independent literal `["page:/research", "page:/data", "page:/settings", "page:/data/coverage", "page:/data/followed", "page:/data/downloads"]`. Home, if registered, is first, so this literal holds with or without CAP-003-E5-S5.

  Kills:
  - remove-attribute on the entry's `count: "problems"`: (b), where there is no chip and the name is plain.
  - swap-case `count: "problems"` → `count: "needs-you"`: (b), where the name reads *2 items need you*.
  - swap-case `group: "data"` → `group: "primary"`: (a).
  - a hand-written mutant that places the entry after Settings: (a) and (f)'s literal.
- [ ] T007 Rewrite the `TEST_DESTINATIONS` fixture as an independent literal in `web/src/app/shell.test.tsx` and in `web/src/app/shell.a11y.test.tsx` (CAP-003-E3-S6 T005 (f) and T008 (c); Other Notes, *Test destinations*). The literal is exactly:

  ```ts
  [{ group: "primary", label: "Home", to: "/home", count: "needs-you" },
   { group: "primary", label: "Research", to: "/research" },
   { group: "data", label: "Data health", to: "/data", count: "problems" },
   { group: "data", label: "Settings", to: "/settings" }]
  ```

  - Type it `readonly Destination[]`.
  - No assertion in either file changes. CAP-003-E3-S6 T008 (c) expects exactly the four names *Home, 2 items need you*, *Research*, *Data health, 3 stocks with problems* and *Settings*, which this literal yields.
  - If CAP-003-E5-S5 has already made this edit, leave it.
  - This task is written before T009. After T009, the delivered form `DESTINATIONS` plus Home and Data health would hold Data health twice, giving duplicate React keys and a fifth link.

**Checkpoint**: T002 to T006 exist and fail for the right reason. `/data` renders the not-found state, `TITLES` has no `/data` entry, `DESTINATIONS` has no Data health, and the rail has no `/data` link. T007 passes before and after T009. Every other test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The three edits, in one TDD cycle, because a destination enters the list only with its screen (DEC-0204; DAC-E3-2).

- [ ] T008 [P] Edit `web/src/app/titles.ts` (depends on T003 and T004 being RED). Insert `{ pattern: "/data", crumbs: [{ label: "Data health" }] }` into `TITLES`, directly before the `/data/coverage` entry, keeping `*` last. Owner-shell §2.6 gives the title *Data health*.
  - In the module comment, the sentence naming the routes later stories add drops `/data` for CAP-003-E6-S7 and keeps any route still unregistered.
  - No other entry changes.
- [ ] T009 Edit `web/src/app/destinations.ts` and `web/src/app/routes.tsx` together (depends on T008; T002, T004, T005 and T006 RED).
  - **`destinations.ts`.**
    - Insert `{ group: "data", label: "Data health", to: "/data", count: "problems" }` into `DESTINATIONS`, directly before the Settings entry. This is owner-shell §2.6's entry, field for field.
    - Replace the comment that reserves the slot for CAP-003-E6-S7 with one line: the entry is registered together with `/data` in `routes.tsx` (DEC-0204, DAC-E3-2).
    - `RESEARCH_REGISTERED` and the `Destination` type are unchanged.
  - **`routes.tsx`.**
    - Add `const DataHealthScreen = lazy(() => import("../screens/data-health"));` beside the other module-level `lazy` bindings.
    - Add `<Route path="/data" element={<DataHealthScreen />} />` directly before `path="/data/coverage"`.
    - In `AppRoutes`'s doc comment, drop `/data` from the routes still to be registered, and cite DAC-E6-S7-1 and owner-shell §2.6.
    - The five CAP-002 `Route` lines, `RootRedirect`, the `Suspense` fallback and `legacyRoutes` are unchanged.
  - Write no length or colour literal, comments included.

  This makes T002 to T006 pass.

**Checkpoint**: `npx vitest run src/app/routes.test.tsx src/app/titles.test.tsx src/app/shell.test.tsx src/app/shell.a11y.test.tsx src/app/shell.layout.test.tsx` is green, and `npx tsc --noEmit` is clean. The vitest root is `web`. `shell.layout.test.tsx`'s *every `DESTINATIONS` `to` is a key of `RAIL_ICONS`* passes unchanged, because `"/data"` → `Activity` is already there.

---

## Phase 4: Integration

**Purpose**: Prove the landing on the real stack and confirm the change set.

- [ ] T010 Extend `tests/e2e/shell-navigation.spec.ts` (DAC-E6-S7-2; TC-COMP-182; CAP-003-E3-S8's seam; depends on T009).
  - **(a) The row.** Add `{ label: "Data health", path: "/data", title: /^Data health$/, via: ["rail", "palette"], headingFocused: true }` to `LANDINGS`, directly before the Settings row. Add a `// Implements TC-COMP-182 (DAC-E6-S7-2)` comment on it. The loop then generates `TC-INT-001: Data health by rail, keyboard only` and `… by palette, keyboard only`.
  - **(b) The screen.** In `landByKeyboard`, after the existing checks, a landing with `path` `/data` also asserts that `mainHeading(page)` has exact text `Is the data good enough to trust?`. That is the screen's own `h1` (CAP-003-E6-S1's verdict header), so the test proves the real screen rendered, not only the URL.
  - **(c) Counted names.** A counted rail item's accessible name gains the count clause (*Data health, 3 stocks with problems*), and the real stack may hold problems left by earlier specs. So the rail locator in `landByKeyboard` changes:
    - from `{ name: landing.label, exact: true }`;
    - to `{ name: new RegExp(\`^${escapeRegExp(landing.label)}(, .+)?$\`) }`, with a local `escapeRegExp`.

    Test (d) *Only what is registered* compares the rail names with the count clause removed (`name.replace(/, .*$/, "")`). Its expected list is still the `via: "rail"` rows of `LANDINGS`, in order. If CAP-003-E5-S5 has already made either change, leave it.
  - **(d) Pages lists every shipped destination** (story Description). Add one test, `TC-INT-001: the Pages group lists every rail destination and the three data pages`:
    - `page.goto("/settings")` and wait for `rail(page)`.
    - `openPaletteByShortcut(page)`, typing nothing.
    - Collect the rail link names with the count clause removed. The *Pages* group has exactly that many options plus 3.
    - In order, option *i* has an accessible name starting with rail name *i*, and the last three start with `Coverage`, `Followed stocks` and `Downloads`.
    - One option starts with `Data health`.
    - Then `Escape`.
  - Keyboard only: no `click`, `fill` or `focus` (CAP-003-E3-S8 conventions).
  - Run `npx tsc --noEmit -p tsconfig.e2e.json`, then `npm run test:e2e -- tests/e2e/shell-navigation.spec.ts`. It needs `npx playwright install` and a container runtime, and the Bash sandbox blocks Docker, so it may need the sandbox disabled. If either is unavailable, report the exclusion and never call a partial run green.

  Kills, each a production mutant that must turn the spec red:
  - the `/data` `Route` removed: (a), where the not-found heading renders.
  - the Data health entry removed from `DESTINATIONS`: (a) by rail, (d).
  - `useFocusHeadingOnPathChange` removed (CAP-003-E3-S6): (a)'s `headingFocused`.
  - `/data`'s title entry removed: (a)'s title pattern.
- [ ] T011 Confirm scope (depends on T010).
  - `git status --short` lists only:
    - `web/src/app/titles.ts`, `destinations.ts` and `routes.tsx`;
    - `web/src/app/routes.test.tsx`, `titles.test.tsx`, `shell.test.tsx` and `shell.a11y.test.tsx`;
    - `tests/e2e/shell-navigation.spec.ts`;
    - this story's `-tasks.md`, `-tdd-evidence.yaml` and status line.
  - `git diff --exit-code -- web/src/app/shell.tsx web/src/app/count-chip.tsx web/src/app/command-palette/ web/src/app/shell-context.tsx web/src/app/health.tsx web/src/app/layout.ts web/src/screens/ web/src/components/ web/src/api/ web/src/main.tsx package.json package-lock.json` exits 0.
  - `git diff -U0 web/src/app/destinations.ts web/src/app/routes.tsx` shows the entry and the route added in the same diff (DAC-E3-2).
  - `git diff -U0 web/src/app/shell.a11y.test.tsx` shows only the `TEST_DESTINATIONS` fixture lines.

**Checkpoint**: The diff is exactly the story's files plus T007's fixture lines. `/data` is registered, titled and on the rail with its chip.

---

## Phase 5: Polish

**Purpose**: Validation, formatting and the TDD evidence.

- [ ] T012 Run `npm run format`, which is a check. Fix any report with `npx biome format --write` on this story's files only. Then run:
  - `npm run lint`, `npx tsc --noEmit`, `npx tsc --noEmit -p tsconfig.e2e.json`, `npm run build` and `npm run test`. `build-output.test.tsx` stays green, unchanged.
  - The mutation run in the Validation Plan, with the hand-written mutants in Other Notes.
  - `npm run test:e2e -- tests/e2e/shell-navigation.spec.ts` (T010).

  No behaviour change.
- [ ] T013 After each TDD cycle in T002–T012 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E6-S7-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence;
    - the structured `mutation:` block `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  - (1) T002–T009: the registration, its unit tests and the fixture.
  - (2) T010: the real-stack spec. It has no production change. Its mutation evidence is the hand-written production mutants of T010's *Kills*, each run against the spec, or `not_applicable` with the reason when no container runtime is available.

  T011 and T012 add no behaviour and join cycle 2's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E6-S5 | hard | `web/src/screens/data-health/index.tsx`'s default `DataHealthScreen`, bound in `routes.tsx`. In the graph |
| CAP-003-E3-S4 | hard | `routes.tsx`, `titles.ts`, `destinations.ts`, `routes.test.tsx` and `titles.test.tsx`, all extended here. In the graph |
| CAP-003-E3-S6 | hard | The rail, `RAIL_ICONS`, `count-chip.tsx`, the focus-to-`h1` hook, `top-bar-title`, `shell.test.tsx` and `shell.a11y.test.tsx`. In the graph |
| CAP-003-E3-S8 | hard | `shell-navigation.spec.ts`'s `LANDINGS`, `landByKeyboard` and test (d). In the graph |
| CAP-003-E2-S5 | hard | The data-health and attention routes the real-stack spec reads. In the graph |
| CAP-003-E3-S5 | context | `palettePages()` reads `DESTINATIONS` at call time, so Pages gains *Data health* with no edit. T005 (b), T006 (f) and T010 drive it. It reaches this story through CAP-003-E3-S6 in the graph (E3-S6 depends on E3-S5); no direct import |
| CAP-003-E6-S1 | context | The *Is the data good enough to trust?* `h1` with `tabIndex={-1}`, asserted in T010 (b), lives in its `Verdict`. It reaches this story through CAP-003-E6-S5 in the graph; no import |
| CAP-003-E3-S7 | context | The completion toast is suppressed on `/data` by path (its `SHOWS_OUTCOME`), before and after this registration. Nothing here changes it |
| CAP-003-E5-S5 | context | It registers Home and adds the Home rows to the same tables. The story Description's "with Home and Data health both registered" is met without it: every assertion here is written so it holds with or without Home (Resolved Conflict 2). Not in the graph, and not needed |
| CAP-003-E6-S6 | reverse | The data-health journey spec opens Data health at `/data`. Graph: E6-S6 depends on E6-S7 |
| CAP-003-E7-S8 | reverse | *Open Data health* in CAP-002's `SHELL_ROUTES` targets `/data`, registered here. Graph: E7-S8 depends on E6-S7 |
| CAP-003-E1-S1 | context | Owns the AC-26 literal scan whose scope the Validation Plan's grep follows. Nothing is imported; it reaches this story through CAP-003-E3-S4 in the graph |
| CAP-003-E7-S7 | context | Repairs the delivered e2e specs that assert `/runs/{uuid}` URLs, which is why the full e2e suite is not this story's gate |

No new hard edge was found. This story imports only modules created by CAP-003-E6-S5, CAP-003-E3-S4, CAP-003-E3-S6 and CAP-003-E3-S8, all graph edges already: `CAP-003-E6-S7: [CAP-003-E6-S5, CAP-003-E3-S4, CAP-003-E3-S6, CAP-003-E3-S8, CAP-003-E2-S5]`.

### Task Dependencies

- T001: no dependencies.
- T002 and T003: depend on T001. They touch different files and can run in parallel.
- T004 to T007: depend on T001. T004, T005, T006 and T007's `shell.test.tsx` edit share one file and run in sequence. T007's `shell.a11y.test.tsx` edit can run in parallel with them.
- T008: depends on T003 and T004 being RED.
- T009: depends on T008, and on T002, T005 and T006 being RED and T007 being done.
- T010: depends on T009.
- T011: depends on T010.
- T012: depends on T011.
- T013: interleaved. It runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- Phase 2: `routes.test.tsx` (T002), `titles.test.tsx` (T003), and the `shell.test.tsx` sequence T004–T007.
- Phase 3: T008 can be written while T009's tests are confirmed RED, but T009 runs after it.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`, and `npx tsc --noEmit -p tsconfig.e2e.json` for the spec
- End to end: `npm run test:e2e -- tests/e2e/shell-navigation.spec.ts`. It needs `npx playwright install` and a container runtime. Report any exclusion and never call a partial run green. The delivered e2e specs that assert `/runs/{uuid}` URLs stay CAP-003-E7-S7's (CAP-003-E3-S4 Other Notes), so the full suite is not this story's gate.

### Story-Specific Validation

- **AC-1, DAC-E3-2:** T002 and T006 (a) are green. `git diff -U0 web/src/app/destinations.ts web/src/app/routes.tsx` shows the entry and `path="/data"` added together.
- **AC-16, DAC-E3-7:** T006 (b), (c) and (d) are green.
- **AC-17, DAC-E6-S7-1:** T003 and T004 are green. By hand, with the built app served by the API, open `/data/downloads` and press the *Data health* crumb. The Data health screen renders inside the shell, titled *Data health*.
- **AC-25, DAC-E6-S7-2:** T005 and T010 are green. `grep -nE "\.(click|fill|focus)\(" tests/e2e/shell-navigation.spec.ts` prints nothing.
- **AC-26:** `grep -nE '[0-9]+(px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b' web/src/app/routes.tsx web/src/app/titles.ts web/src/app/destinations.ts` prints nothing. The test files are not scanned (CAP-003-E1-S1 scope).
- **Mutation:** run `python3 scripts/mutation-run.py generate --repo-dir . --against HEAD --cycle 1 --path web/src/app/routes.tsx --path web/src/app/titles.ts --path web/src/app/destinations.ts --out "$TMPDIR/e6s7-mutants.json"`. Append the hand-written mutants in Other Notes. Then run `python3 scripts/mutation-run.py run --repo-dir . --mutants "$TMPDIR/e6s7-mutants.json" --command "npx vitest run src/app/routes.test.tsx src/app/titles.test.tsx src/app/shell.test.tsx && npx tsc --noEmit" --out "$TMPDIR/e6s7-results.json"`, and `summary` for the evidence. It leaves no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **Where TC-COMP-182 runs.**
   - **The conflict.** TC-COMP-182 is written as a component test ("Scope: component"). DAC-E6-S7-2 says "Given `shell-navigation.spec.ts`", the real-stack Playwright spec.
   - **Governing: the story criterion over the test specification** (constraint 9 ladder).
   - **Outcome.** T010 implements DAC-E6-S7-2 in `shell-navigation.spec.ts`. The TC is mandatory and its steps can be run in the component harness, and the story lists `shell.test.tsx` among its files, so T005 also implements it there. Each carries the `// Implements TC-COMP-182` comment.
2. **"With Home and Data health both registered, the palette's Pages group lists every shipped destination" (story Description), with no edge to CAP-003-E5-S5** (register G16).
   - **The conflict.** The sentence reads as if Home is registered when this story lands. `dependencies.yaml` has no S7 → E5-S5 edge, so in dependency order Home may not be registered yet.
   - **Governing: the story's acceptance criteria and the graph over the Description's narrative.** No criterion of this story names Home. Planning never adds an edge that only the narrative suggests.
   - **Outcome.** "Every shipped destination" is asserted against what is shipped:
     - T006 (f) compares the Pages values to `DESTINATIONS` plus the three data pages, and pins the last six against an independent literal that holds with or without Home first.
     - T010 (d) compares Pages to the live rail.

     Both hold in either landing order, and both become the full Home-plus-Data-health statement once CAP-003-E5-S5 lands. No edge is added.
3. **This story's AC labels against the capability text.**
   - **The conflict.** The story's [AC-17] reads "Data health MUST open in the same shell, titled in the top bar". Capability AC-17 is *CAP-001's behaviour is preserved* at five paths that do not include `/data`. Likewise, the story's [AC-16] carries only the Data health half of capability AC-16.
   - **Governing: the capability text**, which is higher authority. The coverage matrix traces TC-COMP-181 to AC-17 (line 52) and DAC-E6-S7-1 traces to AC-17.
   - **Outcome.** The two readings ask for the same thing here: the `/data` screen in the same shell, titled. The plan satisfies both, and nothing to build differs.
4. **CAP-003-E3-S4's DAC-E3-S4-3** ("`routes.test.tsx` asserts … nothing about `/setup`, `/home` or `/data` content").
   - That criterion bounds CAP-003-E3-S4's own tests. CAP-003-E3-S4's plan (Resolved Conflict 2; T004's closing note) hands the `/data` rows to this story.
   - T002 asserts the binding through a stub, not the screen's content.

### Open Gaps

None. Every value this story writes is fixed by an artifact or by an upstream plan:

- the route, title and destination entry: owner-shell §2.6;
- the chip names and stale suffix: DAC-E3-7 and CAP-003-E3-S6's DEC-0335, consumed here, not decided;
- the `/data` icon: CAP-003-E3-S6's DEC-0334, already in `RAIL_ICONS`;
- the lazy binding: CAP-003-E3-S4 and CAP-003-E6-S5 T013.

### Other Notes

- **Test destinations.** CAP-003-E3-S6 builds `TEST_DESTINATIONS` as `DESTINATIONS` plus Home first and Data health before Settings, so the rail's counted items could be tested before any counted destination existed. Once T009 adds Data health to the real list, that construction holds Data health twice, and CAP-003-E3-S6 T008 (c)'s four-name literal fails. T007 replaces the construction with the independent literal of the same four entries.
  - This is the only edit to `shell.a11y.test.tsx`, a file outside the story's list. It is needed for the story's own `npm run test` validation, following the precedent of CAP-003-E3-S4 T014.
  - CAP-003-E5-S5 would meet the same duplication for Home. The literal removes it for both.
- **Rail names with a count.** A counted rail item's accessible name is *{label}, {n} {phrase}* (CAP-003-E3-S6 T012 `chipName`). CAP-003-E3-S8 wrote `exact: true` locators and an exact-name list, safe while no counted destination existed. On the real stack the problem count depends on what earlier specs left behind. T010 (c) anchors the locator on the label and strips the clause for test (d), so the spec does not depend on database state. The exact chip names are proven in the component harness (T006), against fixtures.
- **`aria-current` on Data health's sub-pages.** `NavLink` without `end` matches ancestors, so the Data health item is current on `/data/coverage`, `/data/followed` and `/data/downloads/*`. CAP-003-E3-S6 asserts the same for Research on `/research/stocks/KO` (its T008 (b)). Owner-shell §2.7 says "`aria-current="page"` on the current one", and the sub-pages have no rail item of their own, so the plan follows that local precedent (ladder step 5) and pins it in T006 (e).
- **Consumers of `/data`.** CAP-003-E6-S6 (the data-health journey spec) and CAP-003-E7-S8 (*Open Data health* in `SHELL_ROUTES`) depend on this registration. Neither is touched here.
- **No toast and no title detail.** `/data` raises no completion toast, because CAP-003-E3-S7 suppresses by path. It needs no `setTitleDetail` (DEC-0214), because the title is static.
- **Lazy loading and focus.** `/data` loads through CAP-003-E3-S4's `Suspense` fallback (DEC-0328). CAP-003-E3-S6's focus hook waits for the screen's `h1` with a `MutationObserver`. T005 and T010 therefore wait for focus rather than asserting it synchronously.
- **Plan checks.**
  - The AC-26 grep reads only the three production files, none of which writes a length.
  - T011's `git diff --exit-code` list excludes the files this story edits.
  - T010's keyboard-only grep matches no `click`, `fill` or `focus`. T010 (d) reads names through `evaluateAll` and locator queries, which that grep allows.
- **Hand-written mutants** for the mutation run:
  - `web/src/app/routes.tsx`: `const DataHealthScreen = lazy(() => import("../screens/data-health"));` → `import DataHealthScreen from "../screens/data-health";`, killed by T002 (e).
  - `web/src/app/routes.tsx`: `<Route path="/data" element={<DataHealthScreen />} />` → `<Route path="/data" element={<CoverageScreen />} />`, killed by T002 (a).
  - `web/src/app/routes.tsx`: `<Route path="/data" element={<DataHealthScreen />} />` → (line removed), killed by T002's `path=` check and T004.
  - `web/src/app/destinations.ts`: `{ group: "data", label: "Data health", to: "/data", count: "problems" }` → `{ group: "data", label: "Data health", to: "/data" }`, killed by T006 (b).
  - `web/src/app/destinations.ts`: `count: "problems"` → `count: "needs-you"`, killed by T006 (b).
  - `web/src/app/destinations.ts`: `group: "data", label: "Data health"` → `group: "primary", label: "Data health"`, killed by T006 (a).
  - `web/src/app/destinations.ts`: the Data health entry moved after Settings, killed by T002's literal and T006 (a) and (f).
  - `web/src/app/titles.ts`: `crumbs: [{ label: "Data health" }]` → `crumbs: [{ label: "Data health", to: "/data" }]`, killed by T003 (c).
  - `web/src/app/titles.ts`: the `/data` entry removed, killed by T003 (a) and T004.
- **Equivalent-mutant risk.** Moving the `/data` `Route` element elsewhere inside `<Routes>` is unobservable, because React Router ranks by specificity. Moving the `/data` `TITLES` entry is unobservable too, because `matchPath` with `end: true` matches it alone. Record either as equivalent if the generator produces it.
- **No new TDD exception.** Both cycles change behaviour or prove it. Cycle 2 changes no production code, and its strength is the production mutants in T010.
