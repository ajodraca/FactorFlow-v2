---
artifact_schema_version: 1
artifact_id: CAP-003-E5-S5-tasks
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
  timestamp: 2026-11-07T07:14:19Z
  source_artifacts:
    - id: CAP-003-E5-S5
      version: "1"
    - id: CAP-003-E5
      version: "2"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-owner-shell-tests
      version: "1"
    - id: CAP-003-home-ui-tests
      version: "1"
    - id: CAP-003-integration-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E5-S5 — Register Home in the Shell: the /home Route, Its Title, the Home Destination and Its Chip

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/home/stories/CAP-003-E5-S5.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/app/`, and the Playwright suite, `tests/e2e/`; design `owner-shell`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

The owner wants Home in the rail with its *Needs you* count, reachable at `/home`, so the product opens on it once the first download has been requested. This is the owner-shell story that closes E5 (DEC-0227, which implements DEC-0223 answer A). It makes three small production edits, all in `web/src/app/`:

- **`routes.tsx`** registers `/home` with CAP-003-E5-S3's default-exported `HomeScreen`, through `React.lazy` like every other screen. `RootRedirect`'s `/home` target, already written by CAP-003-E3-S4, now lands on a screen.
- **`titles.ts`** gains the `/home` entry *Home* (owner-shell §2.6).
- **`destinations.ts`** gains `{ group: "primary", label: "Home", to: "/home", count: "needs-you" }` as the first entry of `DESTINATIONS`, in the change that registers its screen (DAC-E3-2).

The rail that CAP-003-E3-S6 renders from `DESTINATIONS` then shows Home first. Its `count-chip.tsx` gives Home the chip `deriveNeedsYou(attention, scores).length`, named *Home, {n} items need you* and absent at zero. The palette's Pages group, which CAP-003-E3-S5 reads from `DESTINATIONS` at call time, lists *Home* with no change of its own.

The tests extend the files the sibling plans create:

- `routes.test.tsx`, `titles.test.tsx` and `shell.test.tsx` cover TC-COMP-057, TC-COMP-147, the Home chip of TC-COMP-060, and the `/home` route and title.
- `startup-health.spec.ts` gains TC-INT-003, the landing on Home after a download is requested, with the data tile reflecting that download (DEC-0371).
- `shell-navigation.spec.ts` gains the Home row, by rail and by palette.

No screen, API, schema or package changes.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-1 | Home is the first destination of the primary group | T002, T004, T006, T007, T011 |
| AC-2 | After the first download has been started the product opens on Home; `/home` is a registered route for `RootRedirect` | T002, T005, T009, T011 |
| AC-16 | The Home destination carries the number of *Needs you* items, absent when zero | T004, T007, T010 |
| DAC-E3-2 | A destination enters `DESTINATIONS` only in the change that registers its screen | T002, T007, T009 |
| DAC-E3-7 | The Home chip equals `deriveNeedsYou(attention, scores).length`, renders no chip at zero, and names the count in words | T004, T006, T007 |
| DAC-E5-S5-1 | Home precedes Research in the rail, and the palette's Pages group lists *Home* | T002, T004, T006, T007 |
| DAC-E5-S5-2 | In `startup-health.spec.ts`, once a download has been requested, `/` lands on `/home` with Home's `h1` visible and the data tile or its first-download sentence reflecting the latest download | T005, T009, T011, T012 |

Mapped test cases (`tests/coverage-matrix.md` lines 147, 152, 267 and 268, and the per-story count "2 of 2" at line 423):

- **TC-COMP-147** (`tests/component/home-ui-tests.md`; DAC-E5-S5-1) is implemented in T004.
- **TC-INT-003** (`tests/integration/integration-tests.md`; DAC-E5-S5-2) is implemented in T005.
- **TC-COMP-057** (`tests/component/owner-shell-tests.md`; DAC-E3-2) and **TC-COMP-060** (DAC-E3-7) belong to CAP-003-E3-S4 and CAP-003-E3-S6. This story carries their two epic criteria for Home, so it extends both cases (T002 and T004) rather than re-implementing them.
- The test specifications are `status: draft`. Their steps are sharpened below against the story's criteria, which govern.

## Phase 1: Setup

**Purpose**: Confirm the inputs. No package, configuration or directory is added.

- [ ] T001 Confirm the hard prerequisites are in the working tree before Phase 2. No file is created or edited by this task. Record the `grep -n` outputs in the first TDD cycle's evidence.
  - **CAP-003-E5-S3:** `web/src/screens/home/index.tsx` has `export default function HomeScreen`.
  - **CAP-003-E3-S4:**
    - `web/src/app/destinations.ts` exports `Destination`, `DESTINATIONS` (Research then Settings) and `RESEARCH_REGISTERED`.
    - `web/src/app/titles.ts` exports `TITLES`, `resolveTitle` and `useTitle`.
    - `web/src/app/routes.tsx` exports `AppRoutes`, with the ten `lazy(...)` screen bindings, `RootRedirect` sending to `/home` when `most_recent_run` is non-null, and one `Suspense`.
    - `routes.test.tsx` holds the shared harness (`vi.mock` screen stubs adding to `loaded`, `renderAt`, `LocationProbe`, `HEALTH_STARTED`, `loadedAtImport`). `titles.test.tsx` holds the literal title table.
  - **CAP-003-E3-S6:**
    - `web/src/app/shell.tsx` exports `Shell`, `Rail` (with the defaulted `destinations` prop) and `RAIL_ICONS`, which already maps `"/home"` to `House`.
    - `web/src/app/count-chip.tsx` exports `CountChip`, `readChip` and `chipName`.
    - `shell.test.tsx` holds `routedFetch`, `settle()`, the cmdk jsdom stubs, the fixtures `ATTENTION_CLEAR` and `ATTENTION_3_2`, and `TEST_DESTINATIONS`. `shell.a11y.test.tsx` defines its own `TEST_DESTINATIONS`.
    - `tests/e2e/startup-health.spec.ts` is in its rewritten form: the `/` redirect asserted by URL, plus the frame.
  - **CAP-003-E3-S8:** `tests/e2e/shell-navigation.spec.ts` holds `Landing`, `LANDINGS`, `landByKeyboard`, `rail`, `topBarTitle`, `mainHeading`, `palette`, `openPaletteByShortcut`, `chooseOption` and `tabTo`.
  - **CAP-003-E2-S5:** `GET /api/attention` is served, so the shell polls it on every stack.
  - Also run `npm run test` and record the baseline as green. If CAP-003-E4-S6 or CAP-003-E6-S7 has landed first, record which `DESTINATIONS` and `TITLES` entries they added: the literals in T002 and T003 must include them (Other Notes, *Siblings editing the same files*).

**Checkpoint**: Every listed module and helper exists with the named exports, and the suite is green before this story's first edit.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the Home destination, its route, its title, its chip and the two real-stack landings.

### Mandatory Component Tests

- [ ] T002 [P] Extend `web/src/app/routes.test.tsx` (CAP-003-E3-S4's file) with the Home route and the TC-COMP-057 literal, using its shared harness unchanged. Add `// Implements TC-COMP-057 (Home, CAP-003-E5-S5)` beside the edited case. The edits:
  - **(a) Screen stub.** Add `../screens/home` to the `vi.mock` stubs with key `home`. Use the same factory pattern: add the key to `loaded`, and return a default export rendering `<p data-testid="stub-home">`.
  - **(b) TC-COMP-057, the static list (DAC-E3-2, AC-1, DAC-E5-S5-1).**
    - Replace the `DESTINATIONS` literal with the independent literal `[{ group: "primary", label: "Home", to: "/home", count: "needs-you" }, { group: "primary", label: "Research", to: "/research" }, { group: "data", label: "Settings", to: "/settings" }]`. Include any entry a sibling landed first (T001).
    - Add `expect(DESTINATIONS.findIndex((d) => d.to === "/home")).toBeLessThan(DESTINATIONS.findIndex((d) => d.to === "/research"))`.
    - Add `expect(DESTINATIONS.filter((d) => d.group === "primary")[0].to).toBe("/home")`.
    - The existing "every `to` occurs as a `path=` in `routes.tsx`" check now covers `/home`, unchanged.
  - **(c) `RootRedirect` lands on a screen (AC-2).** In TC-COMP-056 case (c), after `location` reads `/home` with `nav-type` `REPLACE`:
    - `await findByTestId("stub-home")`;
    - `queryByRole("heading", { name: "There's no page at this address." })` is null.
  - **(d) Route map row.** Add `| /home | stub-home | |` to the TC-COMP-079 `it.each` table (case (a)). `location` stays `/home`.
  - **(e) Enumeration.** Add `"/home"` to the sorted literal of registered patterns (case (d)), making 17. Keep the absence assertions for `/setup` and `/data` unless a sibling registered them first.
  - **(f) Code splitting.** `loadedAtImport` still `toEqual(new Set())`. A new case renders only `/home` and asserts `loaded` gained `"home"`.
  - **Kills:**
    - remove-attribute on the `<Route path="/home" …>` element: (c) and (d), where `NotFound` renders instead;
    - swap-case on the `/home` binding (`<HomeScreen />` → `<SettingsScreen />`): (d), where `stub-settings` renders;
    - swap-case on the entry order (Research before Home): (b), both the literal and `findIndex`;
    - swap-case on `group: "primary"` → `"data"` for Home: (b);
    - drop-field-copy on `count: "needs-you"`: (b)'s literal;
    - a hand-written static `import HomeScreen from "../screens/home"`: (f).
- [ ] T003 [P] Extend `web/src/app/titles.test.tsx` (CAP-003-E3-S4's file) with the Home title (owner-shell §2.6: `/home` → *Home*).
  - **(a)** Add the row `| /home | null | [{ label: "Home" }] |` to the `it.each` table of exact titles.
  - **(b)** In the detail-slot case, `resolveTitle("/home", "X")` `toEqual([{ label: "Home" }])`, because Home has no detail crumb.
  - **(c)** In the `useTitle()` case, navigating the mounted probe to `/home` reads `Home`.
  - The set-equality case, where every registered `path=` has a `TITLES` entry, needs no edit. It fails until T008 and T009 land together, which is why they share one TDD cycle.
  - **Kills:**
    - swap-case on the Home label (`"Home"` → `"Page not found"`, the fallback): (a);
    - remove-attribute on the `/home` `TITLES` entry: the set-equality case and (a), where the fallback answers *Page not found*;
    - a hand-written `/home` entry carrying `{ detail: "Home" }`: (b), where it reads `X`.
- [ ] T004 [P] Extend `web/src/app/shell.test.tsx` (CAP-003-E3-S6's file) with a new `describe("Home destination (TC-COMP-147, TC-COMP-060; DAC-E5-S5-1, DAC-E3-7, AC-1, AC-16)")`. Put `// Implements TC-COMP-147` and `// Implements TC-COMP-060 (Home chip through the registered destination)` comments on it.
  - It renders the real `<Shell />` with the real `DESTINATIONS` in `MemoryRouter initialEntries={["/settings"]}`. It uses the file's `routedFetch`, `settle()` and cmdk stubs, and unmounts at the end.
  - **(a) TC-COMP-147 step 1, the rail.** With the default `ATTENTION_CLEAR`:
    - `within(nav).getAllByRole("list")[0]`'s first link has the accessible name exactly `Home` and `href` `/home`;
    - the link names in DOM order put `Home` before `Research`, by index.
  - **(b) TC-COMP-147 step 2, the palette.** Click `getByRole("button", { name: "Open the command palette" })`.
    - `within(getByRole("group", { name: "Pages" })).getAllByRole("option")` has names whose first two entries `toEqual(["Home", "Research"])`.
    - Press `{Escape}` and wait until the dialog is gone.
  - **(c) TC-COMP-060, the Home chip, counts in words (DAC-E3-7, AC-16).**
    - Override attention with `ATTENTION_3_2`: `problems.stock_count` 3, items `data_problems` and `credential_missing`, the summary not served. The Home link's name is exactly `Home, 2 items need you`, and `within(homeLink).getByText("2")` sits inside a `[data-variant="status-warning"]` element.
    - With a new fixture `ATTENTION_FIRST_RUNNING`, the count must follow the derivation and not `items.length`. The fixture is `ATTENTION_3_2` plus `latest_download: { run_id: "run-1", state: "running", requested_at: "2026-10-15T21:00:00Z", started_at: "2026-10-15T21:02:00Z", ended_at: null, progress: { done: 0, total: null } }` and `latest_terminal_download: null`. Serve the summary as `{ set: null, never_classified: true, later: null, factors: [], stocks_current: null }`. The name is exactly `Home, 3 items need you`. That is the literal 3, from two server items plus `first_download` under DEC-0216 (CAP-003-E1-S8's `deriveNeedsYou` causes); `deriveNeedsYou` is not called in the test. The fixture is typed `Attention` from CAP-003-E3-S1's `shell-types.ts`, as the file's other fixtures are.
  - **(d) Absent at zero.** With `ATTENTION_CLEAR`, the Home link's name is exactly `Home`, and it contains no `[data-variant^="status-"]` element.
  - **(e) `TEST_DESTINATIONS` keeps one Home.** `DESTINATIONS` now carries Home, so this file's `TEST_DESTINATIONS` (CAP-003-E3-S6 T005 (f)) changes only its construction: drop the added Home literal and keep the Data health insertion before Settings. Add `expect(TEST_DESTINATIONS.filter((d) => d.to === "/home")).toHaveLength(1)`. Other Notes, *Consequential test edits*, explains why.
  - **Kills:**
    - drop-field-copy on `count: "needs-you"` in `destinations.ts`: (c), where the name is `Home`;
    - swap-case on `count: "needs-you"` → `"problems"`: (c)'s first fixture, which gives 3 not 2;
    - a hand-written `count-chip.tsx` mutant computing `attention.items.length`: (c)'s second fixture, which gives 2 not 3;
    - swap-case on Home's `group` (`"primary"` → `"data"`): (a);
    - a hand-written `DESTINATIONS` with Home after Research: (a) and (b).

### Additional Tests (real stack)

- [ ] T005 [P] Implement TC-INT-003 (After a download has been requested, `/` lands on `/home`) in `tests/e2e/startup-health.spec.ts`, as a new `test.describe` beside the TC-E2E-011 test, with a `// Implements TC-INT-003` comment and `"TC-INT-003: …"` in the test title. It follows DEC-0371 (Open Gap 1). The doc comment cites AC-2, DAC-E5-S5-2, owner-shell §2.10 and home-ui 2.4.
  - **Harness, inside the `describe`:**
    - `test.use({ baseURL: ACQUISITION_BASE_URL })`;
    - `test.beforeEach(resetAcquisitionStore)` and `test.afterEach(resetStub)`. Nothing held outlives the test, and the store convention of every acquisition-stack spec holds;
    - `test.setTimeout(90_000)`;
    - imports from `./support/acquisition`: `ACQUISITION_BASE_URL`, `holdSymbol`, `releaseSymbol`, `resetAcquisitionStore`, `resetStub` and `waitForRunState`.
  - **Spec-local oracle `chicagoMinute(iso: string): string`.** It formats with `Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZoneName: "short" }).formatToParts`, and returns `` `${year}-${month}-${day} ${hour}:${minute} ${timeZoneName}` ``. It is independent of `formatInstant`, so the comparison is not symmetric.
  - **Steps:**
    1. **Precondition (TC step "a download requested through `POST /api/acquisition-runs`").**
       - `PUT /api/settings/history-depth` `{ years: 1 }` answers 200.
       - `POST /api/instruments` `{ symbols: ["HMA"] }` answers 201.
       - `holdSymbol("HMA")`.
       - `POST /api/acquisition-runs` answers 202. Keep `run_id`.
       - `waitForRunState(request, runId, ["running"], 20_000)`.
    2. **Read the contract.** `GET /api/attention`: `latest_download.run_id` is `runId`, `latest_download.started_at` is non-null, and `latest_terminal_download` is `null` (the store was reset).
    3. **Open `/` (TC step 1).** `page.goto("/")`. `expect.poll` on `new URL(page.url()).pathname` reaches exactly `/home`, and the search is `""`.
    4. **Home's `h1` (TC step 2).** `page.getByRole("main").getByRole("heading", { level: 1 })` is visible and matches `/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), \d{4}-\d{2}-\d{2}$/` (DEC-0209; CAP-003-E5-S1's header). No *There's no page at this address.* heading is in `main`.
    5. **The first-download sentence reflects the latest download (DAC-E5-S5-2).** `const tile = page.getByRole("region", { name: "Data" })`.
       - `tile.getByRole("link")` has the accessible name exactly `` `Data: your first download, started ${chicagoMinute(started_at)}, is running.` `` (CAP-003-E5-S2: the name and sentence take `started_at` once the download runs).
       - `tile.getByTestId("data-tile-badge")` has text `Downloading`.
    6. **The latest outcome (owner-shell §2.10).**
       - `releaseSymbol("HMA")`.
       - `const outcome = await waitForRunState(request, runId, ["succeeded", "partial", "failed", "cancelled", "abandoned"], 30_000)`.
       - Read `GET /api/attention` again. `latest_terminal_download.run_id` is `runId` and its `state` is `outcome`.
       - Within 30 s (Home's attention cadence is 10 s while the download is non-terminal), `tile.getByTestId("data-tile-badge")` has text `expectedWord(outcome, problems.stock_count, followed_count)`.
       - `tile.getByRole("link")` has `href` `/data` and a name starting with `Data: `.
  - **`expectedWord`** is a spec-local, independent literal of ui-components §2.4's table:
    - `failed` gives `No`;
    - `abandoned` gives `No` when `stockCount >= followedCount > 0`, else `Mostly yes`;
    - any other state gives `Yes` at 0, `Mostly yes` when `0 < stockCount < followedCount`, and `No` otherwise.

    A first download's score state is *No scores yet* (neutral), *Updating* (active) or *Current* (good). None of these is worse than the verdict on a tie, so the badge is the verdict word (ui-components §2.4 `dataTileBadge`). Comment this in the spec.
  - **Also extend the TC-E2E-011 test** in the same file (main stack). When `mostRecent !== null`, after the `/home` URL assertion, `page.getByRole("main").getByRole("heading", { level: 1 })` is visible and is not *There's no page at this address.* Nothing else in that test changes. CAP-003-E4-S6 owns the `/setup` branch.
  - **Kills** (hand-written production mutants, run in T012):
    - remove-attribute on the `/home` `Route` in `routes.tsx`: step 4, where not-found renders;
    - swap-case on `RootRedirect`'s targets: step 3;
    - a hand-written `data-tile.tsx` mutant reading `requested_at` where `started_at` is set: step 5, when the two minutes differ. Record it as equivalent when they share a minute (Other Notes).
- [ ] T006 [P] Extend `tests/e2e/shell-navigation.spec.ts` (CAP-003-E3-S8's file) with Home, by rail and by palette (AC-1, AC-22, AC-25, DAC-E5-S5-1; owner-shell §7 *Shell journey*). Add a `// Implements TC-INT-001 (Home row, CAP-003-E5-S5)` comment on the new row.
  - **(a) The row.** Add `{ label: "Home", path: "/home", title: /^Home$/, via: ["rail", "palette"], headingFocused: true }` as the first entry of `LANDINGS`, which is rail order. The existing `for` loop generates *Home by rail, keyboard only* and *Home by palette, keyboard only*.
  - **(b) Chip-tolerant rail names (DAC-E3-7).** The Home link's accessible name carries its count whenever *Needs you* is non-empty. On the main stack it usually is, because no provider credential is stored there. Make two changes:
    - In `landByKeyboard`, replace the rail locator's `{ name: landing.label, exact: true }` with `{ name: railName(landing.label) }`. The new spec-local `railName(label) = new RegExp(\`^${label}(, .+)?$\`)` matches the label alone, or the label followed by `, ` and a chip phrase.
    - In the *only what is registered* test (d), compare `names.map((n) => n.replace(/, .+$/, ""))` `toEqual(["Home", "Research", "Settings"])`. Also assert the raw Home name matches `/^Home(, [\d,]+ items? needs? you(, as of .+)?)?$/`.
  - **(c) Palette.** No helper edit. The option locator is already the prefix pattern `^Home` inside the Pages group.
  - The comment above `LANDINGS` now says Home was added by CAP-003-E5-S5, and Data health is added by CAP-003-E6-S7.
  - **Kills** (hand-written production mutants, run in T012):
    - remove-attribute on Home's `DESTINATIONS` entry: *Home by rail* and (d), and *Home by palette*, where the Pages option is missing;
    - swap-case on the `/home` title (`"Home"` → `"Page not found"`): the title check;
    - swap-case on the Home and Research order: (d).

**Checkpoint**: T002 to T006 exist and fail for the right reason. In the unit tests, `DESTINATIONS` lacks Home, `/home` renders `NotFound`, and `TITLES` has no `/home`. On the real stack, `/home` renders the not-found state and the rail has no Home link. Every other delivered test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The three production edits, in one TDD cycle, because the set-equality and `path=` checks bind them together.

- [ ] T007 [P] Edit `web/src/app/destinations.ts` (DAC-E3-2, DEC-0204, owner-shell §2.6; T002 and T004 RED).
  - Insert `{ group: "primary", label: "Home", to: "/home", count: "needs-you" }` as the first element of `DESTINATIONS`.
  - Replace the comment line that reserved the Home slot with one that cites CAP-003-E5-S5, AC-1, AC-16 and DAC-E3-7: the chip is `count-chip.tsx`'s.
  - `RESEARCH_REGISTERED`, the `Destination` type and every other entry are unchanged.
- [ ] T008 [P] Edit `web/src/app/titles.ts` (DEC-0214, owner-shell §2.6; T003 RED). Insert `{ pattern: "/home", crumbs: [{ label: "Home" }] }` into `TITLES` before the `"*"` entry. That entry must stay last. Update the module comment that names CAP-003-E5-S5's pending entry so it says the entry is in.
- [ ] T009 Edit `web/src/app/routes.tsx` (owner-shell §2.6 and §5; AC-2; depends on T007 and T008, since the three land together; T002 RED).
  - Add `const HomeScreen = lazy(() => import("../screens/home"));` beside the other bindings.
  - Add `<Route path="/home" element={<HomeScreen />} />` immediately after the `/` route.
  - `RootRedirect`, the `Suspense` boundary, the CAP-002 lines and `legacyRoutes` are untouched.
  - In the doc comment, `/home` moves from "registered later" to registered, citing CAP-003-E5-S5 and AC-2.
  - The comment writes no unit joined to a number.

  This makes T002, T003 and T004 pass.

**Checkpoint**: `npx vitest run src/app/routes.test.tsx src/app/titles.test.tsx src/app/shell.test.tsx` is green. `npx tsc --noEmit` is clean.

---

## Phase 4: Integration

**Purpose**: Keep the sibling suites green with Home registered, then prove the two real-stack landings.

- [ ] T010 Keep `web/src/app/shell.a11y.test.tsx` green (depends on T007).
  - Its own `TEST_DESTINATIONS` (CAP-003-E3-S6 T008 (c)) added a Home literal to `DESTINATIONS`. That Home now appears twice, and the four-name assertion sees five links.
  - Change only that construction, as in T004 (e): drop the added Home literal and keep the Data health insertion. No assertion changes.
  - If the coded construction already de-duplicates by `to`, make no edit and record that in the evidence.
  - Then run `npm run test`. It must be fully green, including `count-chip.test.tsx`, `shell.layout.test.tsx` and the CAP-003-E3-S5 palette tests.
  - **Expected unaffected:**
    - `shell.layout.test.tsx` (e) counts one `svg` per rail link. Its `ATTENTION_CLEAR` yields no chip, and `RAIL_ICONS["/home"]` already exists.
    - The palette tests mock `../destinations`.
  - Any other failure is a defect in T007 to T009, and is fixed there.
- [ ] T011 Run the two extended specs against the real stack: `npm run test:e2e -- tests/e2e/startup-health.spec.ts tests/e2e/shell-navigation.spec.ts` (depends on T005, T006 and T009).
  - It needs `npx playwright install` and a container runtime. The Bash sandbox blocks Docker, so it may need the sandbox disabled.
  - Both specs must pass. Run the command three times in a row, because the main database is shared and T005 holds and releases a provider symbol.
  - If a failure implicates code outside this story's three production files (the data tile, `HomeScreen`, the rail, the palette), do not edit it. Stop and report the failing assertion and the story that owns the file.
  - A missing container runtime is reported as an exclusion, never as a partial green.
- [ ] T012 Run the hand-written production mutants of T005 and T006, one at a time, with `python3 scripts/mutation-run.py run --jobs 1 --command "npm run test:e2e -- <the spec that kills it>"` (depends on T011).
  - The stack binds fixed ports and one container name, so mutants cannot run in parallel.
  - If a clone cannot start the stack, plant each mutant by hand in the working tree, run the named spec, record `killed` or `survived` with the failing assertion, and revert. After the last one, `git diff --exit-code -- web/src` shows only this story's three edits.
  - Every mutant except a recorded equivalent must be killed. A survivor means the spec is too weak: strengthen the spec and rerun.

**Checkpoint**: `npm run test` is green, both specs pass three times, and every listed mutant is killed or recorded equivalent.

---

## Phase 5: Polish

**Purpose**: Validation, scope and the TDD evidence.

- [ ] T013 Run the validation commands and confirm scope (depends on T010 to T012).
  - Run `npm run format`, which is a check. Fix any report with `npx biome format --write` on this story's files only. Then run `npm run lint`, `npx tsc --noEmit`, `npx tsc --noEmit -p tsconfig.e2e.json`, `npm run build` and `npm run test`.
  - `biome.json` does not reach `tests/e2e`, so match the delivered specs' style by hand. Report that exclusion rather than calling the specs linted.
  - `git status --short` lists only:
    - `web/src/app/destinations.ts`, `titles.ts`, `routes.tsx`, `routes.test.tsx`, `titles.test.tsx`, `shell.test.tsx`, and `shell.a11y.test.tsx` when T010 edited it;
    - `tests/e2e/startup-health.spec.ts` and `tests/e2e/shell-navigation.spec.ts`;
    - this story's `-tasks.md`, `-tdd-evidence.yaml` and status line.
  - `git diff --exit-code -- web/src/screens web/src/components web/src/api web/src/app/shell.tsx web/src/app/count-chip.tsx web/src/app/command-palette tests/e2e/support` exits 0.
  - No behaviour change.
- [ ] T014 After each TDD cycle in T002–T013 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Append the cycle to `CAP-003-E5-S5-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence;
    - the structured `mutation:` block `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`, and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  1. T002 + T003 + T004 + T007 + T008 + T009 + T010: Home registered, titled and counted.
  2. T005 + T006 + T011 + T012: the two real-stack landings. This cycle's RED evidence is the specs run before cycle 1, or the T012 mutant kills, and its `mutation:` block is the T012 kill table.

  T013 adds no behaviour and joins cycle 2's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E5-S3 | hard | `routes.tsx` lazily imports the default `HomeScreen` from `web/src/screens/home/index.tsx`. In the graph |
| CAP-003-E3-S4 | hard | `destinations.ts`, `titles.ts`, `routes.tsx` and their two test files are edited. In the graph |
| CAP-003-E3-S6 | hard | The rail and `count-chip.tsx` render the Home item and chip, `shell.test.tsx` and `shell.a11y.test.tsx` are extended, and `startup-health.spec.ts` is in E3-S6's rewritten form. In the graph |
| CAP-003-E3-S8 | hard | `shell-navigation.spec.ts`, `LANDINGS` and `landByKeyboard` are extended. In the graph |
| CAP-003-E2-S5 | hard | `GET /api/attention` is served on both e2e stacks that T005 and T006 drive. In the graph |
| CAP-003-E3-S5 | context | The palette's Pages group reads `DESTINATIONS` at call time (its `palettePages()`), so T004 (b) and T006 observe Home with no edit there. Reached through CAP-003-E3-S6 in the graph |
| CAP-003-E3-S1 | context | `Attention` types the fixtures in `shell.test.tsx`, which already imports it. Reached through CAP-003-E3-S6 |
| CAP-003-E1-S8 | context | `deriveNeedsYou`, called by `count-chip.tsx`, decides T004 (c)'s literal counts. The test does not import it. Reached through CAP-003-E3-S6 |
| CAP-003-E5-S1 | context | The weekday-date `h1` that T005 step 4 matches. Reached through CAP-003-E5-S3 (E5-S3 → E5-S1) |
| CAP-003-E5-S2 | context | The data tile's `section` *Data*, its link name, the first-download sentence and `data-tile-badge` that T005 reads. Reached through CAP-003-E5-S3 (E5-S3 → E5-S2) |
| CAP-003-E5-S4 | reverse | Its Home journey spec drives `/home` as this story registers it. Graph: E5-S4 → E5-S5 |
| CAP-003-E7-S7 | context | Fixes the delivered e2e specs that still assert legacy URLs, which is why the Validation Plan runs only this story's two specs. No file of it is imported or edited |
| CAP-003-E4-S6 | soft | It also edits `routes.tsx`, `titles.ts`, `routes.test.tsx`, `titles.test.tsx` and `startup-health.spec.ts`, for `/setup`. Neither imports the other, so both develop concurrently, and whichever lands second rebases the shared literals (Other Notes) |
| CAP-003-E6-S7 | soft | It also adds a `DESTINATIONS` entry, a `TITLES` entry and a `LANDINGS` row, for Data health. Concurrent, with the same rebase rule |

No new hard edge was found. Every module this plan imports or edits is produced by one of the five stories already in the graph: `CAP-003-E5-S5: [CAP-003-E5-S3, CAP-003-E3-S4, CAP-003-E3-S6, CAP-003-E3-S8, CAP-003-E2-S5]`.

### Task Dependencies

- T001 comes first.
- T002, T003, T004, T005 and T006 touch five different files and can be written in parallel.
- T007 and T008 can run in parallel. T007 depends on T002 and T004 being RED; T008 depends on T003 being RED.
- T009 depends on T007 and T008.
- T010 depends on T007, and runs after T009 so `npm run test` sees all three edits.
- T011 depends on T005, T006 and T009.
- T012 depends on T011.
- T013 depends on T010 to T012.
- T014 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- Phase 2: all five test tasks.
- Phase 3: T007 and T008.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`, and `npx tsc --noEmit -p tsconfig.e2e.json` for the two specs. The second is not in tech-stack, which covers `web/src` only.
- End to end: `npm run test:e2e -- tests/e2e/startup-health.spec.ts tests/e2e/shell-navigation.spec.ts`, the story's two extended specs. Do not gate on the whole suite. Delivered specs that assert legacy URLs are red until CAP-003-E7-S7, and that red is reported, not fixed here.

### Story-Specific Validation

- **AC-1, DAC-E5-S5-1:**
  - T002 (b) and T004 (a) and (b) are green, and T006's *Home by rail* and *Home by palette* pass.
  - By hand: open the built app, and Home is the rail's first item, above Research.
- **AC-2, DAC-E5-S5-2:** T002 (c) is green, and T005 passes three times.
- **AC-16, DAC-E3-7:**
  - T004 (c) and (d) are green.
  - `grep -n "count:" web/src/app/destinations.ts` shows `"needs-you"` on the Home entry only.
- **DAC-E3-2:** T002 (b) is green. `git diff web/src/app/destinations.ts web/src/app/routes.tsx` shows the Home entry and the `/home` route in the same change set.
- **AC-26:** `grep -nE '[0-9]+(px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b' web/src/app/routes.tsx web/src/app/titles.ts web/src/app/destinations.ts` prints nothing.
- **Mutation:** run `python3 scripts/mutation-run.py run --command "npx vitest run web/src/app/routes.test.tsx web/src/app/titles.test.tsx web/src/app/shell.test.tsx && npx tsc --noEmit"` over `web/src/app/destinations.ts`, `titles.ts` and `routes.tsx`, plus the unit-level hand-written mutants in Other Notes. It must leave no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **`DESTINATIONS` order and contents.**
   - **The conflict.** Owner-shell §2.6's snippet lists Home, Data health and Settings, with Research only as a comment. This story's Description and DAC-E5-S5-1 put Home first and then Research.
   - **Governing: epic DAC-E3-2 and this story's Description over the design's illustrative snippet.** A destination enters only in the change that registers its screen, and the snippet shows the end state.
   - **Outcome.** At this story the list is Home, Research, Settings. CAP-003-E6-S7 inserts Data health before Settings.
2. **What the startup spec asserts about Home.**
   - **The conflict.** Owner-shell §2.10 and this story's Description say the spec asserts that "Home's data tile … shows the latest outcome". DAC-E5-S5-2 says "the data tile or its first-download sentence reflecting the latest download".
   - **Governing: the story criterion DAC-E5-S5-2 over design prose.**
   - **Outcome.** T005 asserts the first-download sentence while the requested download runs. Once it ends, T005 asserts the tile's verdict word for that outcome, which also meets the design's wording. The concrete form is Open Gap 1, because neither text fixes it.
3. **TC-COMP-147's component.**
   - **The conflict.** The test specification files TC-COMP-147 under `home-ui`. This story's Implementation puts the rail and palette assertions in `web/src/app/shell.test.tsx`, an owner-shell file.
   - **Governing: the story over the test specification.** The test exercises the rail and palette, which owner-shell renders.
   - **Outcome.** T004 implements it there.
4. **CAP-003-E3-S4's DAC-E3-S4-3, "nothing about `/home` content", in `routes.test.tsx`.** That criterion scoped E3-S4, when `/home` was unregistered. This story registers `/home`, so T002 (c) and (d) asserting the Home stub is in scope. This is not a contradiction, and E3-S4's criterion stays true of its own change set.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0371.**
   - **What is undetermined.** DAC-E5-S5-2 and TC-INT-003 require that, once a download has been requested, the tile or its first-download sentence "reflect the latest download". Owner-shell §2.10 adds "shows the latest outcome". No artifact fixes:
     - which e2e stack the case runs on. The main stack's shared database holds whatever earlier specs left, so `latest_terminal_download` may or may not be null;
     - what concrete observation counts as "reflecting". The tile shows no download label: only the verdict tier, or the first-download sentence (register G7).
   - **What the plan adopts (T005).**
     - The case runs in `startup-health.spec.ts` inside its own `describe`, on the acquisition stack (`ACQUISITION_BASE_URL`, reset in `beforeEach`).
     - It requests one download through `POST /api/acquisition-runs` with its only symbol held. While the download runs, the tile's link is named exactly *Data: your first download, started {its `started_at`, America/Chicago minute}, is running.*, with the badge *Downloading*.
     - After release, once that download ends, the badge reads the verdict word that ui-components §2.4's table gives for its outcome and the served problem counts.
     - The TC-E2E-011 main-stack test additionally asserts Home's `h1` when it lands on `/home`.
   - **Derivation.**
     - TC-INT-003's precondition is literally a download requested through `POST /api/acquisition-runs`.
     - The acquisition stack is the delivered seam for a controlled store: every acquisition spec resets it, and its stub's `hold` and `release` fix the run's state.
     - The start time is the one field of the latest download the first-download sentence carries, so matching it to the minute proves the sentence is about that download.
     - The verdict word is the one tile field the latest terminal download's state feeds (`worstDataTier`'s `latestTerminalDownload`), which is the design's "latest outcome".
   - **Alternatives rejected.**
     - Branching on the main stack's existing state: the assertion would depend on which specs ran before.
     - Truncating the main database: it breaks the specs that share it.
     - Asserting only that the tile is visible: it would not tell this download from any other.
   - **Klass.** Contained: it lives in this spec only.
   - **Owning design to absorb it:** owner-shell §2.10 (the startup spec's Home assertion), with integration-tests TC-INT-003, at its next revision.

### Other Notes

- **Consequential test edits (T004 (e), T010).** CAP-003-E3-S6's plan builds its `TEST_DESTINATIONS` as `DESTINATIONS` plus a Home literal and a Data health literal. Once `DESTINATIONS` carries Home, that literal duplicates it. `shell.a11y.test.tsx` is not in this story's file list, but the story's validation (`npm run test`) requires the suite green, and owner-shell §2.10 assigns that file to this component. The edit changes only the fixture construction, never an assertion.
- **Chip-tolerant names in `shell-navigation.spec.ts` (T006 (b)).** CAP-003-E3-S8's plan says its seam needs "no other edit". That holds for Research and Settings. Home's accessible name carries its chip whenever *Needs you* is non-empty (DAC-E3-7), so the exact-name rail lookup and the name list in (d) are widened to the chip suffix. The suffix is still asserted for Home.
- **Siblings editing the same files.** CAP-003-E4-S6 (`/setup`) and CAP-003-E6-S7 (`/data`, Data health) edit the same literals: the `DESTINATIONS` literal, the 17-pattern enumeration, the title table and `LANDINGS`. Write each literal against the tree as T001 finds it. Whichever story lands second rebases the literal, never weakens it to a computed value.
- **CAP-003-E3-S4's hand-written mutant** "an added Home first entry, killed by T002" is this story's real code from here on, and leaves the mutation list.
- **Home's own journey is not here.** The *Needs you* items, their actions and the tile's states end to end are CAP-003-E5-S4's journey spec, which depends on this story. T005 asserts only the landing and the tile's reflection of the latest download.
- **Real-stack symbol.** `HMA` has none of the stub's special prefixes (`UNK`, `NOF`, `NEW`), so it is an ordinary stock with fundamentals.
- **Equivalent-mutant risk (T005).** The `requested_at` vs `started_at` mutant is unobservable when the two fall in the same minute. Record it as equivalent with that reason when it survives.
- **Hand-written mutants** for the mutation runs:
  - `web/src/app/destinations.ts`: `{ group: "primary", label: "Home", to: "/home", count: "needs-you" },` → `{ group: "primary", label: "Home", to: "/home" },`, killed by T004 (c) and T002 (b).
  - `web/src/app/destinations.ts`: Home moved after Research, killed by T002 (b) and T004 (a).
  - `web/src/app/routes.tsx`: `const HomeScreen = lazy(() => import("../screens/home"));` → `import HomeScreen from "../screens/home";`, killed by T002 (f).
  - `web/src/app/routes.tsx`: the `<Route path="/home" …>` line deleted, killed by T002 (c) and (d), and by T005 step 4 on the real stack.
  - `web/src/app/titles.ts`: `{ pattern: "/home", crumbs: [{ label: "Home" }] }` deleted, killed by T003 and by T006's title check.
  - `web/src/app/count-chip.tsx` (CAP-003-E3-S6's file, used as an observation only): `deriveNeedsYou(attention, scores).length` → `attention.items.length`, killed by T004 (c).
