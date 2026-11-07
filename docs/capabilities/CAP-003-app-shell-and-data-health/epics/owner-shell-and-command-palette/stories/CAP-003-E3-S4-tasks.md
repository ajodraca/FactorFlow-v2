---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S4-tasks
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
  timestamp: 2026-11-07T06:20:12Z
  source_artifacts:
    - id: CAP-003-E3-S4
      version: "1"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-command-palette
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-owner-shell-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E3-S4 — Route Map, Destinations, Titles, Legacy Redirects and Not Found: the Five Delivered Screens at Their New Paths

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/app/`; design `owner-shell`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Rewrites `web/src/app/routes.tsx` as owner-shell §2.6's route map for what exists at this story. `/` is `RootRedirect`: one card-shaped skeleton at the `LAYOUT.contentMaxWidth` cap until `useHealth()` (CAP-003-E3-S2) first answers, then `Navigate replace` to `/setup` when `most_recent_run` is null and to `/home` otherwise (DEC-0202; DAC-E3-1). The five delivered screens are registered at `/data/coverage`, `/data/followed`, `/data/downloads`, `/data/downloads/:runId` and `/settings`, each through `React.lazy` (owner-shell §5). CAP-002's five `/research` `Route` elements are kept byte for byte (AC-27). The four legacy redirects come from one new module, `legacy-redirects.tsx`, with the query kept (AC-18; DAC-E3-3). `*` renders the new `not-found.tsx`: a `card` holding a `section role="status"` with the `h1` *There's no page at this address.* and a **Home** link to `/home` (DAC-E3-4). `destinations.ts` holds the static ordered `DESTINATIONS` (at this story Research, then Settings) with `RESEARCH_REGISTERED` beside it (DAC-E3-2). `titles.ts` holds the static route-to-title table with linked ancestor crumbs and the generic noun for a detail crumb until the screen sets it through CAP-003-E3-S3's `setTitleDetail` (DEC-0214; DAC-E3-9). `/setup`, `/home` and `/data` are not registered here (CAP-003-E4-S6, CAP-003-E5-S5 and CAP-003-E6-S7 do that). The top bar that renders the title and the rail that renders `DESTINATIONS` are CAP-003-E3-S6's. Until then the delivered shell keeps working at the new paths (Open Gap 1). `web/src/main.tsx` is unchanged.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-2 | Until the first download has been started the product opens on setup, afterwards on Home | T001, T013 |
| AC-17 | Coverage, followed stocks, downloads, download detail and settings open in the same shell, titled, at their new paths | T004, T005, T009, T011, T013, T014 |
| AC-18 | Each path CAP-001 shipped takes the owner to the same screen at its new path for one release | T006, T007, T010, T013 |
| AC-27 | CAP-002's routes stay unchanged and reachable | T002, T004, T009, T011, T013 |
| DAC-E3-1 | `/` renders one skeleton until the first health answer, then `Navigate replace` to `/setup` or `/home`; setup incomplete is not a lock | T001, T013 |
| DAC-E3-2 | `DESTINATIONS` is one static ordered list; a destination enters only with its screen; `RESEARCH_REGISTERED` true exactly when Research is present | T002, T011 |
| DAC-E3-3 | The four legacy paths land on their new paths by `Navigate replace`, search kept, from one module | T006, T007, T010 |
| DAC-E3-4 | An unregistered path renders the not-found state inside the frame, titled *Page not found*, with the copy and a **Home** link to `/home` | T003, T004, T008, T012, T013 |
| DAC-E3-9 | Titles come from a static route-to-title table; ancestor crumbs are links; a detail crumb reads the generic noun until set | T004, T005, T011 |
| DAC-E3-S4-1 | `/runs/abc?x=1` becomes `/data/downloads/abc?x=1` with `replace`; the other three likewise | T006, T007, T010 |
| DAC-E3-S4-2 | Every registered route has its title; *Data health* links to `/data`, *Downloads* to `/data/downloads` | T004, T005, T011 |
| DAC-E3-S4-3 | `routes.test.tsx` asserts only the routes this story registers; the `/` targets by URL; nothing about `/setup`, `/home` or `/data` content | T001, T009, T013, T015 |
| DAC-E3-S4-4 | `NotFound` is a `card` holding a `section role="status"` with the `h1` and the **Home** link, free of the DAC-E7-3 terms, the link reachable by keyboard | T008, T012 |

Mapped test cases (`tests/component/owner-shell-tests.md`; `tests/coverage-matrix.md` lines 146-149, 154, 177-180 and the per-story count "4 of 4" at line 406):

- **TC-COMP-077, TC-COMP-078, TC-COMP-079, TC-COMP-080** for the four story-level criteria.
- **TC-COMP-056** (DAC-E3-1), **TC-COMP-057** (DAC-E3-2) and **TC-COMP-058** (DAC-E3-4) for the three epic criteria this story carries that no story-level criterion refines (coverage-matrix note at line 447).

## Phase 1: Setup

**Purpose**: None required. No package, configuration or directory is added. `react-router-dom` 6 (`Navigate`, `useLocation`, `useParams`, `useNavigationType`, `matchPath`), React 18 (`lazy`, `Suspense`), Vitest 2, `@testing-library/react` 16, `@testing-library/user-event` 14 and jsdom are delivered.

**Checkpoint**: These hard graph edges are in the working tree before Phase 2 starts:

- CAP-003-E1-S1: `web/src/components/ui/card.tsx` (`Card`, `variant`, `data-variant`) and `web/src/components/ui/button.tsx` (`Button`, `variant="ghost"`, `asChild`).
- CAP-003-E3-S2: `web/src/app/health.tsx` (`HealthProvider`, `useHealth`) and `web/src/app/layout.ts` (`LAYOUT`).
- CAP-003-E3-S3: `web/src/app/shell-context.tsx` (`ShellProvider`, `useShell`, `useTitleDetail`).

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the route map, the redirects, the destinations, the titles and the not-found state.

**Shared harness for `web/src/app/routes.test.tsx` (rewritten whole; written with T001, reused by T002, T003 and T008).**

- **Screen stubs.** Each of the ten lazily loaded screen modules is replaced with `vi.mock`, keyed by the delivered module path: `../screens/coverage`, `../screens/instruments`, `../screens/runs`, `../screens/runs/detail`, `../screens/settings`, `../screens/research`, `../screens/research/stocks`, `../screens/research/compare`, `../screens/research/universes` and `../screens/research/universes/detail`.
  - Each factory adds its key to a module-level `loaded: Set<string>` when it runs, and returns a default export that renders `<p data-testid="stub-<key>">`.
  - The two detail stubs and the stock stub also render the route parameter they read with `useParams()`: `runId`, `universeId` and `symbol`, as `data-param`.
  - The `runs/detail` factory first awaits a module-level `detailGate` promise. `releaseDetail()` resolves it, and is idempotent.
  - Stubs keep the test about the route map, not about screens that CAP-003-E7-S1 to S5 relabel later (Other Notes).
- **Health.** `vi.mock("../api/client", …)` with `importActual`, replacing only `fetchHealth` with `vi.fn()`.
  - Fixtures are independent literals typed `HealthResponse`. `HEALTH_EMPTY` has `most_recent_run: null`. `HEALTH_STARTED` has `most_recent_run: { run_id: "run-1", state: "running", ended_at: null }`.
  - `deferHealth()` returns `{ resolve, reject }` for one pending answer.
- **Location probe.** `LocationProbe` renders `useLocation().pathname + search` as `data-testid="location"` and `useNavigationType()` as `data-testid="nav-type"`. It also exposes `useNavigate()` to the test through a module-level ref, so a test can call `navigate(-1)`.
- **Render.** `renderAt(path, entries?)` renders `<HealthProvider><MemoryRouter initialEntries={entries ?? [path]} initialIndex={(entries ?? [path]).length - 1}><AppRoutes /><LocationProbe /></MemoryRouter></HealthProvider>`, with `HealthProvider` from CAP-003-E3-S2's `./health`.
- **Snapshot at load.** `const loadedAtImport = new Set(loaded)` is taken at module top level, right after the static imports, before any render.

### Mandatory Component Tests

- [ ] T001 [P] Implement TC-COMP-056 (Root renders a skeleton then redirects by most_recent_run) in the rewritten `web/src/app/routes.test.tsx`, with a `// Implements TC-COMP-056` comment, in `describe("/ — RootRedirect (DAC-E3-1, AC-2)")`. Cases:
  - (a) **Before the first answer.** `fetchHealth` is a pending `deferHealth()`. `renderAt("/")`: `getAllByTestId("shell-skeleton")` has length exactly 1. That element carries `data-variant="default"` (CAP-003-E1-S1's `Card`), `aria-busy="true"`, and `style.maxWidth` equal to the literal `"1180px"`. `location` reads `/`.
  - (b) **Empty install.** Resolve with `HEALTH_EMPTY`. `location` becomes `/setup`, `nav-type` is `REPLACE`, and no `shell-skeleton` remains. Nothing is asserted about `/setup`'s content (DAC-E3-S4-3; Other Notes, *Registered later*).
  - (c) **A download was requested.** A fresh render resolving with `HEALTH_STARTED`: `location` becomes `/home`, `nav-type` is `REPLACE`.
  - (d) **`replace`, not push.** `renderAt("/", ["/start", "/"])` with `HEALTH_EMPTY`. After the redirect, `navigate(-1)` makes `location` read `/start`.
  - (e) **TC edge case: health unreachable.** `fetchHealth` rejects with `new ApiUnreachableError("connect ECONNREFUSED")`. After the flush, `location` stays `/`, `nav-type` is `POP` and the one skeleton remains. There is no redirect: the delivered shell swaps the main region for the unreachable state.
  - (f) **TC step 4: setup incomplete is not a lock.** With `HEALTH_EMPTY`, `renderAt("/data/coverage")` and `renderAt("/settings")` each render their stub, and `location` stays on the visited path. `/data` itself is not registered at this story (Resolved Conflict 2).
  - (g) **A stale answer never redirects.** With fake timers, `renderAt("/start")` answers `HEALTH_EMPTY`, the next poll rejects with `ApiUnreachableError`, and 30 000 ms pass, so `liveness` is `unreachable` while `health` keeps its last value. Then `navigate("/")`: `location` stays `/` and the one skeleton renders.

  Kills:
  - swap-case on the two targets (`"/setup"` ↔ `"/home"`): (b) and (c).
  - negate-boolean on `most_recent_run === null`: (b) and (c).
  - remove-attribute on `replace` in the root `Navigate`: (b)'s `nav-type`, and (d).
  - negate-boolean on the `liveness === "answering"` guard: (a) redirects at once, or (e) and (g) redirect on an absent or stale value.
  - a hand-written mutant that renders two skeleton cards: (a)'s length 1.
- [ ] T002 Implement TC-COMP-057 (DESTINATIONS is one static ordered list with RESEARCH_REGISTERED) in `web/src/app/routes.test.tsx`, with a `// Implements TC-COMP-057` comment, sequential with T001 (one file).
  - **Static list.** `import { DESTINATIONS, RESEARCH_REGISTERED } from "./destinations"`. Assert `DESTINATIONS` `toEqual` the independent literal `[{ group: "primary", label: "Research", to: "/research" }, { group: "data", label: "Settings", to: "/settings" }]`, and `RESEARCH_REGISTERED` `toBe(true)`. CAP-002 has merged in this clone (register D1).
  - **"Present exactly when registered".** Read `routes.tsx` as text with `node:fs` from `import.meta.url`, as the delivered test does. `RESEARCH_REGISTERED` equals `DESTINATIONS.some((d) => d.to === "/research")`, and both equal "`routes.tsx` contains `path="/research"`". Every `DESTINATIONS[i].to` occurs as a `path="…"` in `routes.tsx`, so no destination enters without its screen (TC edge case).
  - **No runtime route detection (TC step 2).** Walk every non-test `.ts`/`.tsx` under `web/src/` and collect files whose source matches `/\b(matchRoutes|useRoutes|createRoutesFromChildren|createRoutesFromElements)\b|import\.meta\.glob/`. Assert `toEqual([])`. The walk visits more than 50 files, so it is not vacuous. `matchPath`, which `titles.ts` uses to read the current URL against its own table, is deliberately not in the list (Other Notes, *Plan checks*).
  - **One exported list.** Only `web/src/app/destinations.ts` matches `/export\s+const\s+DESTINATIONS\b/`. The delivered `shell.tsx` holds a private, unexported `const DESTINATIONS` until CAP-003-E3-S6 replaces it.
  - **Type.** `expectTypeOf<(typeof DESTINATIONS)[number]>().toEqualTypeOf<Destination>()`, where `Destination` is the exported interface (T009).

  Kills:
  - swap-case on the entry order (Settings before Research): the literal `toEqual`.
  - negate-boolean on `RESEARCH_REGISTERED`'s derivation: `toBe(true)` and the equality with `routes.tsx`.
  - a hand-written mutant that adds `{ group: "primary", label: "Home", to: "/home" }` before its screen is registered: the literal `toEqual`, and the `path=` check, since `routes.tsx` has no `/home`.
- [ ] T003 Implement TC-COMP-058 (Unknown path renders the not-found state inside the frame) in `web/src/app/routes.test.tsx`, with a `// Implements TC-COMP-058` comment.
  - Render the delivered `<Shell />` in `<MemoryRouter initialEntries={["/this-route-does-not-exist"]}>`, with `fetchHealth` resolving `HEALTH_EMPTY`.
  - `getByRole("navigation")` is present (the rail remains).
  - `within(getByRole("main"))` `findByRole("heading", { level: 1, name: "There's no page at this address." })`.
  - In the same `main`, `getByRole("link", { name: "Home" })` has `href` `/home`.
  - `resolveTitle("/this-route-does-not-exist", null)` `toEqual([{ label: "Page not found" }])`: the title the top bar will show. CAP-003-E3-S6 builds the top bar that renders it (Resolved Conflict 3).
  - The test asserts nothing about the status region or the rail's items, so CAP-003-E3-S6's frame rewrite does not invalidate it.

  Kills:
  - swap-case on the catch-all element (an `AppRoutes` `*` that renders a bare `<p>`): the heading query.
  - swap-case on the link target (`"/home"` to `"/"`): the `href`.
- [ ] T004 [P] Implement TC-COMP-078 (titles.ts gives every registered route a title with linked crumbs) in a new `web/src/app/titles.test.tsx`, with a `// Implements TC-COMP-078` comment. It imports `TITLES`, `resolveTitle` and the `Crumb` type from `./titles`. Cases:
  - (a) **Every registered route has an entry.** Read `routes.tsx` and `legacy-redirects.tsx` as text and collect every `path="…"` with `/path=["']([^"']+)["']/g`. That set `toEqual` the set of `TITLES.map((t) => t.pattern)`. A route without a title, or a title without a route, fails (TC edge case: "An unregistered route: no title entry").
  - (b) **Exact titles.** `it.each` over this independent literal table of `[pathname, detail, expected]`:

    | Pathname | Detail | Expected crumbs |
    |---|---|---|
    | `/settings` | `null` | `[{ label: "Settings" }]` |
    | `/data/coverage` | `null` | `[{ label: "Data health", to: "/data" }, { label: "Coverage" }]` |
    | `/data/followed` | `null` | `[{ label: "Data health", to: "/data" }, { label: "Followed stocks" }]` |
    | `/data/downloads` | `null` | `[{ label: "Data health", to: "/data" }, { label: "Downloads" }]` |
    | `/data/downloads/abc` | `null` | `[{ label: "Data health", to: "/data" }, { label: "Downloads", to: "/data/downloads" }, { label: "Download" }]` |
    | `/data/downloads/abc` | `"Download 2026-10-15 17:31 CDT"` | the same, with the last crumb `{ label: "Download 2026-10-15 17:31 CDT" }` |
    | `/no/such/page` | `null` | `[{ label: "Page not found" }]` |
    | `/research` | `null` | `[{ label: "Research" }]` |
    | `/research/stocks/KO` | `null` | `[{ label: "Research", to: "/research" }, { label: "KO" }]` |
    | `/research/compare` | `null` | `[{ label: "Research", to: "/research" }, { label: "Compare" }]` |
    | `/research/universes` | `null` | `[{ label: "Research", to: "/research" }, { label: "Universes" }]` |
    | `/research/universes/u1` | `null` | `[{ label: "Research", to: "/research" }, { label: "Universes", to: "/research/universes" }, { label: "Universe" }]` |
    | `/research/universes/u1` | `"Large caps"` | the same, with the last crumb `{ label: "Large caps" }` |
    | `/` | `null` | `null` |
    | `/coverage`, `/instruments`, `/runs`, `/runs/abc` | `null` | `null` |

  - (c) **Linked ancestors, text last.** For every entry with crumbs, every crumb but the last has a `to`, and the last has none. This is checked over `TITLES` itself, then over every resolved row in (b).
  - (d) **Detail only where the route has a detail slot.** `resolveTitle("/settings", "X")` and `resolveTitle("/data/coverage", "X")` are unchanged from (b). `resolveTitle("/data/downloads/abc", "")` falls back to `Download`, so a crumb is never blank.

  Nothing is asserted about `/setup`, `/home` or `/data`: no title entry exists for them at this story. CAP-003-E4-S6, CAP-003-E5-S5 and CAP-003-E6-S7 add the entries and extend (a) and (b).

  Kills:
  - swap-case on the two ancestor links (`"/data"` ↔ `"/data/downloads"`): (b).
  - remove-attribute on an ancestor's `to`: (c).
  - drop-field-copy on `detail` in the detail slot (always the noun): (b)'s detail rows.
  - a hand-written mutant that applies the detail to the last crumb of every route: (d).
  - swap-case on the generic noun (`"Download"` ↔ `"Universe"`): (b).
- [ ] T005 Write the `useTitle()` integration cases in `web/src/app/titles.test.tsx` (DAC-E3-9, DEC-0214; owner-shell §7 *Titles* row), sequential with T004.
  - **Harness.** `vi.stubGlobal("fetch", …)` with a router: `/api/health` answers `HEALTH_EMPTY` JSON; every other path answers `404` `{"error":{"code":"not_found","message":"No resource exists at this path.","request_id":"req-404"}}`. Render `<HealthProvider><ShellProvider><MemoryRouter initialEntries={["/data/downloads/abc"]}><TitleProbe />{show && <DetailScreen />}</MemoryRouter></ShellProvider></HealthProvider>`.
    - `TitleProbe` renders `useTitle()` as `data-testid="title"`: the crumb labels joined with `" › "`, or `"none"`.
    - `DetailScreen` does what DEC-0214 and DAC-E7-S5-1 (CAP-003-E7-S5's download detail) have screens do: `useEffect(() => { setTitleDetail("Download 2026-10-15 17:31 CDT"); return () => setTitleDetail(null); }, [setTitleDetail])`, with `setTitleDetail` from `useShell()`.
  - **Steps.**
    - (a) Without `DetailScreen`, `title` reads exactly `Data health › Downloads › Download`.
    - (b) Rerender with `DetailScreen`: `Data health › Downloads › Download 2026-10-15 17:31 CDT`.
    - (c) Rerender without it (unmount): back to `Data health › Downloads › Download`.
    - (d) Navigating the same mounted probe (a `navigate` ref, as in the shared harness) to `/settings` reads `Settings`, to `/no/such/page` `Page not found`, and to `/coverage` `none`.
  - Unmount at the end, so no shell read outlives the test.

  Kills:
  - a hand-written mutant where `useTitle` passes `null` instead of `useTitleDetail()`: (b).
  - a hand-written mutant where `useTitle` reads a pathname fixed at first render (`useRef(useLocation().pathname)`): (d) when the probe is driven by a `navigate` call after mount.
- [ ] T006 [P] Implement TC-COMP-077 (Legacy paths redirect with replace and the query kept) in a new `web/src/app/legacy-redirects.test.tsx`, with a `// Implements TC-COMP-077` comment.
  - **Harness.** Render `<MemoryRouter initialEntries={["/start", path]} initialIndex={1}><Routes>{legacyRoutes}<Route path="*" element={<LocationProbe />} /></Routes><LocationProbe /></MemoryRouter>`, with a local `LocationProbe` as in the shared harness (pathname plus search, `useNavigationType()`, and a `navigate` ref). Only `legacy-redirects.tsx` is under test; the screens are not involved.
  - **Cases,** `it.each` over this independent literal table of `[from, to]`:

    | From | To |
    |---|---|
    | `/runs/abc?x=1` | `/data/downloads/abc?x=1` |
    | `/coverage` | `/data/coverage` |
    | `/coverage?symbol=KO` | `/data/coverage?symbol=KO` |
    | `/instruments` | `/data/followed` |
    | `/instruments?lifecycle=retired` | `/data/followed?lifecycle=retired` |
    | `/runs` | `/data/downloads` |
    | `/runs?cursor=c1` | `/data/downloads?cursor=c1` |

  - For each case, `location` reads exactly `to` and `nav-type` is `REPLACE`.
  - **TC edge case: history does not grow.** Then `navigate(-1)` makes `location` read `/start`. With a push, back would land on the legacy path, which redirects again, so `location` would read `to` instead.

  Kills:
  - swap-case on each target (for example `"/data/followed"` ↔ `"/data/coverage"`): the literal table.
  - drop-field-copy on `search` in `KeepSearch` or `LegacyRunDetail`: the query rows.
  - remove-attribute on `replace` in either component: `nav-type` and the back step.
  - drop-field-copy on `runId` (`/data/downloads/undefined`): the first row.
- [ ] T007 Write the one-module cases in `web/src/app/legacy-redirects.test.tsx` (DAC-E3-3: "from one module whose removal deletes one file and its tests"), sequential with T006.
  - `legacyRoutes` has length 4. Its `props.path` values `toEqual(["/coverage", "/instruments", "/runs", "/runs/:runId"])`, and every element has a distinct `key`.
  - A static walk over non-test `.ts`/`.tsx` under `web/src/` collects files matching `/path=["'](\/coverage|\/instruments|\/runs|\/runs\/:runId)["']/`. The only match is `web/src/app/legacy-redirects.tsx`.
  - `routes.tsx` imports `legacy-redirects` exactly once (`/from\s+["']\.\/legacy-redirects["']/g` has 1 match), and no other non-test source imports it.

  Kills:
  - a hand-written mutant that also registers `<Route path="/coverage" …>` in `routes.tsx`: the walk.
  - a dropped legacy route: the length and the `toEqual`.

- [ ] T008 Implement TC-COMP-080 (NotFound is a status card with a keyboard-reachable Home link) as a `describe("NotFound (DAC-E3-S4-4)")` in `web/src/app/routes.test.tsx`, with a `// Implements TC-COMP-080` comment. It is written before T012, in the same file as T001 and therefore sequential with it, and RED until T012. Render `<MemoryRouter><NotFound /></MemoryRouter>`, imported from `./not-found`.
  - (a) **Structure.** `getByRole("status")` is a `SECTION`, and its `parentElement` carries `data-variant="default"` (CAP-003-E1-S1's `Card`). Within the section:
    - `getByRole("heading", { level: 1 })` has exact text `There's no page at this address.`;
    - `getByRole("link", { name: "Home" })` has `href` `/home`;
    - the section's `textContent` is exactly `There's no page at this address.Check the address, or go to Home`.
  - (b) **DAC-E7-3 terms.** Use a pure helper `forbiddenTerms(text)` with `/\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/gi`.
    - It returns `[]` for the container's `textContent`, and for every accessible name (`aria-label`, and each link's name).
    - Non-vacuity: it returns `["run"]` for the planted literal `"No run at this address"`.
  - (c) **Keyboard.** `userEvent.setup().tab()` puts focus on the **Home** link (`toHaveFocus`), the first tab stop, because the `h1`'s `tabIndex={-1}` is not one. `{Enter}` on it navigates: a `LocationProbe` reads `/home`.

  Kills:
  - remove-attribute on `role="status"`: (a).
  - swap-case on `"/home"`: (a) and (c).
  - a hand-written mutant that sets the `h1`'s `tabIndex={0}`: (c), where focus lands on the heading first.
  - a hand-written mutant that writes *runs* into the lead: (b).

### Additional Unit Tests

- [ ] T009 Write the route-map cases in `web/src/app/routes.test.tsx` (AC-17, AC-27; owner-shell §2.6 and §5), sequential with T001–T003 and T008 (one file).
  - **Implements TC-COMP-079** (routes.test asserts only the routes this story registers). Put the `// Implements TC-COMP-079` comment on this `describe`.
  - (a) **The five delivered screens at their new paths.** `it.each` over the literal rows below: `findByTestId(stub)` renders, `location` stays on the path, and no not-found heading renders. The detail row first calls `releaseDetail()`.

    | Path | Stub | Parameter |
    |---|---|---|
    | `/data/coverage` | `stub-coverage` | |
    | `/data/followed` | `stub-instruments` | |
    | `/data/downloads` | `stub-runs` | |
    | `/data/downloads/abc` | `stub-runs/detail` | `data-param` is `abc`, read as `runId` |
    | `/settings` | `stub-settings` | |

  - (b) **CAP-002's five routes, unchanged and reachable (AC-27).** The delivered CAP-002 cases are kept with their `// Implements TC-COMP-194` comments, now rendered through `renderAt` rather than the delivered `Shell`.

    | Path | Stub | Parameter |
    |---|---|---|
    | `/research` | `stub-research` | |
    | `/research/stocks/AAPL` | `stub-research/stocks` | `symbol` is `AAPL` |
    | `/research/compare` | `stub-research/compare` | |
    | `/research/universes` | `stub-research/universes` | |
    | `/research/universes/u1` | `stub-research/universes/detail` | `universeId` is `u1` |

    The five `<Route path="/research…" element={<…Screen />} />` lines of `routes.tsx` are compared as text to the independent literal of the five delivered lines (`routes.tsx:35-39` before this story).
  - (c) **CAP-002's `SHELL_ROUTES` targets still route (AC-27).** The delivered TC-COMP-197 case is kept with its comment. Each `SHELL_ROUTES` target (`/runs/run-1`, `/runs` and `/instruments`, from `web/src/screens/research/copy.ts`) rendered through `renderAt` ends on a new path with no not-found heading, until CAP-003-E7-S8 migrates them.
  - (d) **Enumeration (owner-shell §2.10 "the route enumeration becomes the table in 2.6").** Every `path="…"` in `routes.tsx` plus `legacy-redirects.tsx` `toEqual` the independent sorted literal of these 16 patterns:
    - `"/"` and `"*"`;
    - `/data/coverage`, `/data/followed`, `/data/downloads`, `/data/downloads/:runId` and `/settings`;
    - the five `/research` patterns;
    - `/coverage`, `/instruments`, `/runs` and `/runs/:runId`.

    `/setup`, `/home` and `/data` are absent.
  - (e) **Code splitting.** `loadedAtImport` `toEqual(new Set())`: no screen module is loaded when `routes.tsx` is imported. After rendering only `/settings`, the `loaded` set has gained `"settings"` and no other key from this case.

  Kills:
  - swap-case on a screen binding (`/data/followed` rendering `CoverageScreen`): (a).
  - swap-case on the parameter name (`:id` instead of `:runId`, backlog review v4 FINDING-10): (a)'s `data-param` reads empty.
  - a hand-written mutant that statically imports a screen in `routes.tsx`: (e).
  - a hand-written mutant that edits a CAP-002 `Route` line (`:universeId` to `:id`): (b).

**Checkpoint**: T001–T009 exist and fail for the right reason. `destinations.ts`, `titles.ts`, `legacy-redirects.tsx` and `not-found.tsx` are missing, and the routes cases fail against the delivered `routes.tsx` (no `/data/*` paths, `/` goes to `/coverage`, `NotFound` is a bare `<p>`). Every delivered test outside `routes.test.tsx` still passes.

---

## Phase 3: Core Implementation

**Purpose**: The four new modules, each in its own TDD cycle.

- [ ] T010 Create `web/src/app/legacy-redirects.tsx` (depends on T006 and T007 being RED). Copy owner-shell §2.6's code: `KeepSearch({ to })` (`useLocation().search` appended, `Navigate … replace`), `LegacyRunDetail()` (`useParams().runId`, `useLocation().search`, `Navigate to={`/data/downloads/${runId}${search}`} replace`), and `export const legacyRoutes` with the four keyed `Route` elements.
  - Imports `type JSX` from `"react"`, and `Navigate`, `Route`, `useLocation` and `useParams` from `"react-router-dom"`.
  - The module doc comment cites AC-18, DAC-E3-3, DAC-E3-S4-1, owner-shell §2.6 and §6, and says the file, its import in `routes.tsx` and `legacy-redirects.test.tsx` are deleted one release after this ships (capability assumption 3).

  This makes T006 and T007 pass, except T007's `routes.tsx` import line, which T013 satisfies.
- [ ] T011 [P] Create `web/src/app/destinations.ts` and `web/src/app/titles.ts` (depend on T002, T004 and T005 being RED).
  - **`destinations.ts`** (DEC-0204; DAC-E3-2; owner-shell §2.6).
    - `export interface Destination { readonly group: "primary" | "data"; readonly label: string; readonly to: string; readonly count?: "needs-you" | "problems" }`.
    - `export const DESTINATIONS: readonly Destination[] = [{ group: "primary", label: "Research", to: "/research" }, { group: "data", label: "Settings", to: "/settings" }]`.
    - `export const RESEARCH_REGISTERED: boolean = DESTINATIONS.some((d) => d.to === "/research")`. It is derived from the static list at module load, never from the router (DEC-0204: no runtime detection).
    - Comments name where each later entry goes: Home first (CAP-003-E5-S5), and Data health before Settings (CAP-003-E6-S7), each in the change that registers its screen.
  - **`titles.ts`** (DEC-0214; DAC-E3-9; owner-shell §2.6; UX design §0.3), to the interface fixed by DEC-0329 (Open Gap 3):
    - `export type CrumbSpec = { readonly label: string; readonly to?: string } | { readonly param: "symbol" } | { readonly detail: string }`. The `detail` value is the generic noun.
    - `export interface TitleEntry { readonly pattern: string; readonly crumbs: readonly CrumbSpec[] | null }`.
    - `export interface Crumb { readonly label: string; readonly to?: string }`.
    - `export const TITLES: readonly TitleEntry[]` holds 16 entries, one per registered route pattern of T009 (d):
      - `"/"` and the four legacy patterns have `crumbs: null` (no title);
      - the five delivered and five research patterns have the crumbs of T004 (b), where `/research/stocks/:symbol`'s last spec is `{ param: "symbol" }` and the two detail patterns end in `{ detail: "Download" }` and `{ detail: "Universe" }`;
      - `"*"` has `[{ label: "Page not found" }]`, and is last.
    - `export function resolveTitle(pathname: string, detail: string | null): readonly Crumb[] | null` finds the first non-`*` entry where `matchPath({ path: entry.pattern, end: true }, pathname)` matches, else the `*` entry. It maps each spec to a `Crumb`:
      - a label spec is copied;
      - `param` becomes the matched `params.symbol`;
      - `detail` becomes `detail` when it is a non-empty string, else the noun.
    - `export function useTitle(): readonly Crumb[] | null` returns `resolveTitle(useLocation().pathname, useTitleDetail())`, with `useTitleDetail` from CAP-003-E3-S3's `./shell-context`.
    - The separator *›*, its spacing and its colour are the top bar's rendering (CAP-003-E3-S6). `titles.ts` holds no separator.
    - The module comment says a route enters this table in the change that registers it (CAP-003-E4-S6 `/setup` *Setup*, CAP-003-E5-S5 `/home` *Home*, CAP-003-E6-S7 `/data` *Data health*), as `DESTINATIONS` does.

  This makes T002, T004 and T005 pass, except T002's `routes.tsx` checks, which T013 satisfies.
- [ ] T012 [P] Create `web/src/app/not-found.tsx` (depends on T008 being RED; it can run in parallel with T010 and T011).
  - It exports `NotFound(): JSX.Element`, rendering `<Card variant="default">` around `<section role="status" className="p-5">`.
  - The section holds an `<h1 tabIndex={-1} className="text-xl font-semibold">` with the text `There's no page at this address.`. The `tabIndex` is the focus target owner-shell §2.7 names, which CAP-003-E3-S6 moves focus to.
  - It also holds `<p>Check the address, or go to <Button asChild variant="ghost"><Link to="/home">Home</Link></Button></p>`. The copy is exactly as UX design §0.5 and owner-shell §2.8 write it (Other Notes, *Copy*). The link is styled from `button` `ghost` tokens (owner-shell §10 component mapping).
  - The two strings are module constants, `NOT_FOUND_HEADING` and `NOT_FOUND_LEAD`.
  - The doc comment cites DAC-E3-4, DAC-E3-S4-4, AC-24, UX design §0.5 and owner-shell §2.8.
  - Imports: `Card` from `"../components/ui/card"`, `Button` from `"../components/ui/button"`, `Link` from `"react-router-dom"`. No literal length, no colour.

  This makes T008 pass, and T003's not-found assertions once T013 lands.
- [ ] T013 Rewrite `web/src/app/routes.tsx` (depends on T010, T011 and T012; T001, T002, T003 and T009 RED).
  - **Imports:** `lazy`, `Suspense` and `type JSX` from `"react"`; `Navigate`, `Route` and `Routes` from `"react-router-dom"`; `Card` from `"../components/ui/card"`; `useHealth` from `"./health"`; `LAYOUT` from `"./layout"`; `legacyRoutes` from `"./legacy-redirects"`; `NotFound` from `"./not-found"`.
  - **Lazy screens.** Ten module-level bindings, `const CoverageScreen = lazy(() => import("../screens/coverage"))` and so on. The CAP-002 bindings keep their delivered names (`ResearchScreen`, `StockEvidenceScreen`, `CompareScreen`, `UniversesScreen`, `UniverseDetailScreen`), so their five `Route` lines stay byte for byte (AC-27). Owner-shell §5 and the epic NFR *Performance* ask for code splitting per screen.
  - **`ShellSkeleton()`** (private). One `<Card variant="default" aria-busy="true" data-testid="shell-skeleton" className="w-full animate-pulse" style={{ maxWidth: LAYOUT.contentMaxWidth }}>` holding a `p-5 space-y-3` block of two `h-4 rounded bg-secondary` bars (Other Notes, *Skeleton*). It writes no length literal (DAC-E3-16; CAP-003-E1-S1's literal scan).
  - **`RootRedirect()`** (private).
    - `const { liveness, health } = useHealth()`.
    - When `liveness === "answering"` and `health !== null`, it returns `<Navigate to={health.most_recent_run === null ? "/setup" : "/home"} replace />`. Otherwise it returns `<ShellSkeleton />`: before the first answer, and also while unreachable, where the shell's main region shows the unreachable state instead (TC-COMP-056 edge case).
    - Comment: DEC-0202 as amended, DAC-E3-1, AC-2, AC-21. Setup incomplete is not a lock: only `/` reads it, and nothing is stored.
  - **`AppRoutes()`** (exported, same name, so `shell.tsx` and `main.tsx` are untouched) returns `<Suspense fallback={<ShellSkeleton />}>` (DEC-0328) around `<Routes>` holding, in order:
    - `/` with `<RootRedirect />`;
    - `/data/coverage`, `/data/followed`, `/data/downloads`, `/data/downloads/:runId` (Resolved Conflict 1) and `/settings`;
    - the five CAP-002 lines unchanged;
    - `{legacyRoutes}`;
    - `<Route path="*" element={<NotFound />} />`.
  - **Doc comment.** It replaces the delivered one: owner-shell §2.6, AC-17, AC-18, AC-27, DAC-E3-S4-3. It says `/setup`, `/home` and `/data` are registered by CAP-003-E4-S6, CAP-003-E5-S5 and CAP-003-E6-S7.

  This makes T001, T002, T003, T007 and T009 pass.

**Checkpoint**: `npx vitest run src/app/routes.test.tsx src/app/titles.test.tsx src/app/legacy-redirects.test.tsx` is green. `npx tsc --noEmit` is clean.

---

## Phase 4: Integration

**Purpose**: Keep the delivered shell and its tests green between this story and CAP-003-E3-S6's frame rewrite, and confirm the change set.

- [ ] T014 Interim compatibility with the delivered shell (DEC-0327; Open Gap 1; depends on T013).
  - **(a) Rail targets.** In `web/src/app/shell.tsx`'s private delivered `DESTINATIONS`, change only the three legacy `to` values: `"/coverage"` to `"/data/coverage"`, `"/instruments"` to `"/data/followed"`, and `"/runs"` to `"/data/downloads"`. Labels, order, `/settings`, `/research` and every other line stay as delivered. Add one comment line saying CAP-003-E3-S6 replaces this list with `destinations.ts`.
    - This keeps `aria-current="page"` on the current rail item. The delivered `shell.a11y.test.tsx` case *exposes the active destination via aria-current* at `/coverage` passes again, because the redirect lands on `/data/coverage`.
  - **(b) Lazily loaded screens in delivered tests.** Run `npm run test`. A delivered test outside this story's three test files that fails solely because a `React.lazy` screen had not resolved when a synchronous `getBy*` read the routed screen's content gets one change: that query becomes the awaited `findBy*` form, nothing else.
    - The expected instances are `web/src/app/status-region.integration.test.tsx:58` (`getByText("Coverage")`) and the restore case of `web/src/app/shell.unreachable.test.tsx` (`getByText("Coverage")` after recovery).
    - No assertion is removed, weakened or re-targeted. List each edited line in the cycle's TDD evidence.
    - Any other kind of failure is a defect in T010–T013 and is fixed there.
  - **Confirm.**
    - `npm run test` is fully green.
    - `git diff -- web/src/app/shell.tsx` shows exactly three changed `to` strings plus the one comment line.
    - `git diff --stat` on the two delivered test files shows only the `findBy` substitutions.
- [ ] T015 Confirm scope (depends on T014).
  - `git status --short` lists only:
    - the new `web/src/app/destinations.ts`, `titles.ts`, `legacy-redirects.tsx`, `not-found.tsx`, `titles.test.tsx` and `legacy-redirects.test.tsx`;
    - the rewritten `web/src/app/routes.tsx` and `routes.test.tsx`;
    - T014's `shell.tsx` and delivered-test edits;
    - this story's `-tasks.md`, `-tdd-evidence.yaml` and status line.
  - `git diff --exit-code -- web/src/main.tsx web/src/screens/ web/src/api/ web/src/components/ web/src/app/health.tsx web/src/app/layout.ts web/src/app/shell-context.tsx web/src/app/status-region.tsx tests/e2e/` exits 0.
  - DAC-E3-S4-3 inspection: `grep -nE '"/(setup|home|data)"' web/src/app/routes.test.tsx` shows only:
    - URL assertions on the `location` probe;
    - the T002 and T009 (d) absence checks;
    - the not-found link `href` `/home`.

    No line queries content rendered at those paths.

**Checkpoint**: The diff is exactly the story's files plus T014's interim edits, and delivered behaviour at every old and new path is unchanged except the move.

---

## Phase 5: Polish

**Purpose**: Validation, formatting and the TDD evidence.

- [ ] T016 Run `npm run format` (a check). Fix any report with `npx biome format --write` on this story's files only. Then run `npm run lint`, `npx tsc --noEmit`, `npm run build` and `npm run test`.
  - After `npm run build`, `ls src/factorflow/api/static/assets/*.js | wc -l` is greater than 1: `React.lazy` produced separate chunks. The delivered `build-output.test.tsx` stays green, unchanged.
  - No comment in a non-test source writes a layout value without a space (`1180 px` is fine, `1180px` is not), because CAP-003-E3-S2's layout rule reads comments too.
  - No behaviour change.
- [ ] T017 After each TDD cycle in T001–T016 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E3-S4-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence;
    - the structured `mutation:` block `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  - (1) T006 + T007 + T010: the legacy redirects.
  - (2) T002 + T004 + T005 + T011: destinations and titles.
  - (3) T008 + T012: not-found.
  - (4) T001 + T003 + T009 + T013 + T014: the route map and the interim compatibility.

  T015 and T016 add no behaviour and join cycle 4's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S5 | reverse | `command-palette/pages.ts` and `targets.ts` read `DESTINATIONS` and `RESEARCH_REGISTERED` (its story Dependencies). Graph: E3-S5 depends on E3-S4 |
| CAP-003-E3-S6 | reverse | `shell.tsx` renders the rail from `DESTINATIONS`, the top bar from `useTitle()` (DEC-0329), and `AppRoutes` in the main region, and replaces T014's interim rail. Graph: E3-S6 depends on E3-S4 |
| CAP-003-E4-S6 | reverse | Registers `/setup` in `routes.tsx` and adds *Setup* to `titles.ts`, extending `routes.test.tsx` and `titles.test.tsx`. Graph: E4-S6 depends on E3-S4 |
| CAP-003-E5-S5 | reverse | Registers `/home`, adds *Home* to `titles.ts` and the first `DESTINATIONS` entry. Graph: E5-S5 depends on E3-S4 |
| CAP-003-E6-S7 | reverse | Registers `/data`, adds *Data health* to `titles.ts` and its `DESTINATIONS` entry. Graph: E6-S7 depends on E3-S4 |
| CAP-003-E7-S1 | context | Relabels the delivered screens this story registers, without changing their modules. The route-map tests stub the modules, so a relabel needs no edit here. It reaches E3-S4 through the graph (E7-S1 to E7-S5 depend on E3-S4) |
| CAP-003-E7-S5 | context | The download detail calls `setTitleDetail(...)` that `useTitle()` reads (DAC-E7-S5-1). T005's `DetailScreen` imitates it. Graph: E7-S5 depends on E3-S4 |
| CAP-003-E7-S7 | context | Fixes the delivered e2e URL assertions that this story's `/runs/{id}` redirect invalidates (backlog review v4 FINDING-5; Other Notes). It reaches E3-S4 through the graph |
| CAP-003-E7-S8 | context | Migrates CAP-002's `SHELL_ROUTES` off the legacy paths (D4). T009 (c) keeps them routed until then. Graph: E7-S8 depends on E3-S4 |

No new hard edge was found. This story imports only CAP-003-E1-S1's `card.tsx` and `button.tsx`, CAP-003-E3-S2's `health.tsx` and `layout.ts`, CAP-003-E3-S3's `shell-context.tsx` (`useTitleDetail`, and in tests `ShellProvider` and `useShell`), and delivered modules. All three are graph edges already: `CAP-003-E3-S4: [CAP-003-E3-S2, CAP-003-E3-S3, CAP-003-E1-S1]`.

### Task Dependencies

- T001, T002, T003, T008 and T009 share `routes.test.tsx` and run in sequence. T001 writes the shared harness first.
- T004 and T005 share `titles.test.tsx` and run in sequence.
- T006 and T007 share `legacy-redirects.test.tsx` and run in sequence.
- The three test files can be written in parallel.
- T010 depends on T006 and T007 being RED.
- T011 depends on T002, T004 and T005 being RED.
- T012 depends on T008 being RED.
- T013 depends on T010, T011 and T012 (it imports all three), and on T001, T003 and T009 being RED.
- T014 depends on T013.
- T015 depends on T014.
- T016 depends on T015.
- T017 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- Phase 2: the three test files.
- Phase 3: T010, T011 and T012 touch different files and can run in parallel. T013 joins them.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not in this story's validation (story *Validation*). The delivered e2e specs that assert `/runs/{uuid}` URLs are known to go red from here until CAP-003-E7-S7 (Other Notes).

### Story-Specific Validation

- **AC-2, DAC-E3-1:** T001 is green. By inspection, `routes.tsx` reads `most_recent_run` in exactly one place, `RootRedirect`, and nothing writes browser storage (`grep -nE "localStorage|sessionStorage" web/src/app/routes.tsx web/src/app/titles.ts web/src/app/destinations.ts web/src/app/legacy-redirects.tsx web/src/app/not-found.tsx` prints nothing).
- **AC-17, DAC-E3-9, DAC-E3-S4-2:** T004, T005 and T009 are green.
- **AC-18, DAC-E3-3, DAC-E3-S4-1:** T006 and T007 are green. Then start the built app (`npm run build`, served by the API) and open `http://127.0.0.1:8000/runs/<a real run id>?x=1` by hand. The address bar shows `/data/downloads/<id>?x=1`, and Back does not return to `/runs/…`.
- **AC-27:** T009 (b) and (c) are green. `git diff -U0 web/src/app/routes.tsx | grep -E '^[-+].*path="/research'` prints nothing: the five lines are untouched.
- **DAC-E3-2:** T002 is green.
- **DAC-E3-4, DAC-E3-S4-4:** T003 and T008 are green.
- **DAC-E3-S4-3:** T015's grep inspection.
- **AC-26 / DAC-E3-16:** `grep -nE '[0-9]+(px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b' web/src/app/routes.tsx web/src/app/not-found.tsx web/src/app/titles.ts web/src/app/destinations.ts web/src/app/legacy-redirects.tsx` prints nothing. The skeleton's cap is read from `LAYOUT.contentMaxWidth`.
- **Mutation:** run `python3 scripts/mutation-run.py run --command "npx vitest run web/src/app/routes.test.tsx web/src/app/titles.test.tsx web/src/app/legacy-redirects.test.tsx && npx tsc --noEmit"` over `web/src/app/routes.tsx`, `titles.ts`, `destinations.ts`, `legacy-redirects.tsx` and `not-found.tsx`, plus the hand-written mutants in Other Notes. It leaves no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **The detail route's parameter name.**
   - **The conflict.** Capability AC-17, owner-shell §2.6 and this story write `/data/downloads/:id`. Epic DAC-E3-3 writes `/data/downloads/:runId`, and the delivered `RunDetailScreen` reads `useParams().runId` (`web/src/screens/runs/detail/index.tsx:21`; backlog review v4 FINDING-10).
   - **Governing: epic DAC-E3-3, over design prose and the story's description.** It is backed by the delivered screen, which this story must register without changing its module (story *Dependencies*).
   - **Outcome.** Register `path="/data/downloads/:runId"`. The URL is the same; only the internal parameter name differs. T009 (a) pins it through the stub's `data-param`. `titles.ts` keys the same pattern.
2. **TC-COMP-056 step 4 ("navigate to `/data` with setup incomplete") against DAC-E3-S4-3.**
   - **The conflict.** `/data` is registered by CAP-003-E6-S7, not here. DAC-E3-S4-3 forbids asserting `/data` content in this story's `routes.test.tsx`.
   - **Governing: the story criterion over the test specification.**
   - **Outcome.** T001 (f) proves "setup incomplete is not a lock" on the registered `/data/coverage` and `/settings` instead. CAP-003-E6-S7 extends the case to `/data`.
3. **TC-COMP-058's top-bar reading.**
   - **The conflict.** TC-COMP-058 reads "the top-bar title" and expects "rail and top bar remain". The top bar is created by CAP-003-E3-S6 (its Description), and this story's DAC-E3-4 is met by the route map, the not-found state and the title table.
   - **Governing: this story's criteria and file list over the test specification.**
   - **Outcome.** T003 asserts the frame that exists, the not-found state inside `main`, and the *Page not found* title through `resolveTitle`. CAP-003-E3-S6's shell tests render the top bar from `useTitle()`.
4. **CAP-002's universe-detail pattern.** Owner-shell §2.6 writes `/research/universes/:id`. **Governing: AC-27 (CAP-002's routes unchanged).** Keep the delivered `path="/research/universes/:universeId"` (`routes.tsx:39`). The delivered `UniverseDetailScreen` reads `universeId`. `titles.ts` keys that pattern.
5. **Research's place in `DESTINATIONS`.** The delivered rail appends Research last (`shell.tsx:17`). **Governing: owner-shell §2.6, DEC-0204 and this story's Description.** Research is a `primary` entry after the Home slot, so at this story the list is Research, then Settings (T002). The delivered rail's own order is CAP-003-E3-S6's to replace (T014 changes only its targets).

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0327.**
   - **What is undetermined.** This story rewrites the route map while the delivered `shell.tsx` and its tests stay until CAP-003-E3-S6 rewrites the frame. Two delivered behaviours break as a direct effect, and no artifact says how the delivered suite stays green in between:
     - The delivered rail links to `/coverage`, `/instruments` and `/runs`. Those now redirect, so `NavLink` loses `aria-current="page"` on the current item, and `shell.a11y.test.tsx`'s *exposes the active destination via aria-current* fails.
     - `React.lazy`, which this story's Implementation requires, makes a routed screen render after its chunk resolves. Two delivered tests read the screen's text synchronously (`status-region.integration.test.tsx:58`; `shell.unreachable.test.tsx`, restore case).
   - **What the plan adopts (T014).**
     - The three `to` values of the delivered rail move to the new paths, with labels and order untouched.
     - In delivered tests, only a synchronous query of lazily loaded content becomes `findBy*`.
   - **Derivation.**
     - The story's validation is `npm run test`.
     - Owner-shell §2.6 already has "this change" edit the delivered `shell.tsx` destination list, and DEC-0211 gives `web/src/app/` to owner-shell.
     - Retargeting the rail keeps the owner's `aria-current` correct, which AC-25 and STD-UI-24 need, rather than only silencing a test.
     - `findBy*` is the testing-library form for content that renders asynchronously. It removes no assertion.
     - CAP-003-E3-S6 replaces the rail and rewrites or deletes all three delivered test files, so nothing outlives the interim.
   - **Alternatives rejected.**
     - Leaving the suite red until CAP-003-E3-S6: this fails the story's validation.
     - Wiring `destinations.ts` into the delivered rail now: this is CAP-003-E3-S6's DAC-E3-S6-1, and it breaks the delivered five-item tests.
     - Editing the delivered `aria-current` assertion: this hides a real regression for the owner.
     - Dropping `React.lazy`: the story and owner-shell §5 require it.
   - **Scope.** Contained: CAP-003-E3-S6 overwrites both edits.
   - **Owning design to absorb it:** owner-shell §2.10 (delivered tests and the interim between the route map and the frame) at its next revision.
2. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0328.**
   - **What is undetermined.** `React.lazy` needs a `Suspense` boundary, and no artifact says where it sits or what it renders while a screen's code loads. Owner-shell §2.8 *Loading* names one shell-level loading rendering ("one card-shaped skeleton at the 1180 px cap" for `/`) and says every other route renders its own screen's skeleton "at once". The screen's skeleton cannot exist before its chunk does.
   - **What the plan adopts (T013).** One `Suspense` around `<Routes>` in `AppRoutes`, inside the main region, with `fallback={<ShellSkeleton />}`, the same single card `RootRedirect` renders. The rail and top bar never suspend.
   - **Derivation.**
     - It reuses the one shell loading state the design defines, rather than inventing a second.
     - UX design §0.5 says the main region is never blank, which rules out a `null` fallback.
     - One boundary in the main region keeps the frame mounted, which AC-23's "rail and top bar remain" pattern needs.
   - **Alternatives rejected.**
     - `fallback={null}`: a blank main region for the chunk's load.
     - A boundary per route: duplicated, with no behavioural difference.
     - A boundary above the frame: the rail would flash.
   - **Scope.** Contained in `routes.tsx`. Consumer note: CAP-003-E3-S6's focus-to-`h1` on route change must wait for the lazily loaded screen's `h1`, not the fallback's absence of one.
   - **Owning design to absorb it:** owner-shell §2.8 and §5 at their next revision.
3. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0329.**
   - **What is undetermined.** DEC-0214 and owner-shell §2.6 fix a static route-to-title table keyed by route pattern, the crumbs, the links, `:symbol` substituted directly, and the generic noun until `setTitleDetail`. No artifact names the module's exports, or how a route with no title (`/` and the legacy paths) and the `*` fallback are represented.
   - **What the plan adopts (T011).**
     - `CrumbSpec`, `TitleEntry`, `Crumb`.
     - `TITLES`, one entry per registered pattern, with `crumbs: null` for "no title" and `*` last.
     - `resolveTitle(pathname, detail)`, which matches with `react-router-dom`'s `matchPath` (`end: true`) and falls back to `*`.
     - `useTitle()`, which combines `useLocation()` with CAP-003-E3-S3's `useTitleDetail()` (DEC-0323).
     - Later stories add one `TITLES` entry when they register a route.
   - **Derivation.**
     - A table keyed by the same pattern strings as `routes.tsx` lets T004 (a) prove "every registered route has a title" by set equality, the TC-COMP-078 enumeration.
     - Explicit `null` entries keep "no title entry" meaning "unregistered", which is TC-COMP-078's edge case.
     - `matchPath` applies the router's own matching rules (case and trailing slash), so a title can never disagree with the route that renders.
     - A pure resolver plus a thin hook lets the top bar (CAP-003-E3-S6) and the palette's page hints (CAP-003-E3-S5, if it wants them) use the same mapping.
   - **Alternatives rejected.**
     - Titles carried as `Route` `handle`s: this needs a data router, and `main.tsx` stays `BrowserRouter`.
     - Titles set by each screen: DEC-0214 limits screens to the detail crumb.
     - A table keyed by pathname: it cannot hold `:symbol` or `:runId`.
   - **Scope.** Propagating. CAP-003-E3-S6 renders `useTitle()`. CAP-003-E4-S6, CAP-003-E5-S5 and CAP-003-E6-S7 add entries.
   - **Owning design to absorb it:** owner-shell §2.6 at its next revision.

### Other Notes

- **Registered later.** `/` redirects to `/setup` or `/home`, the not-found **Home** link targets `/home`, and the *Data health* crumb targets `/data`. None of these is registered until CAP-003-E4-S6, CAP-003-E5-S5 and CAP-003-E6-S7, so each renders the not-found state in the meantime. DAC-E3-S4-3 accepts this by asserting URLs only. It is not a defect; do not "fix" it.
- **The interim health read.** `RootRedirect` reads CAP-003-E3-S2's `useHealth()` from `health.tsx`. Until CAP-003-E3-S6 mounts that module's `HealthProvider`, the delivered shell still mounts `status-region.tsx`'s. So at `/`, `useHealth()` uses its delivered fallback poll for the moment before it redirects and unmounts. This is one extra `GET /api/health` per visit to `/`, only until CAP-003-E3-S6.
- **Stubbed screens in the route tests.** The delivered `routes.test.tsx` asserted real screen headings (*Runs*, *Instruments*, *Run run-123*) and rail state. Those headings are relabelled by CAP-003-E7-S1 to S5, and rail state is CAP-003-E3-S6's. The rewrite stubs each screen module and asserts the binding and the parameter, which is what this story owns ("developable against the delivered screens' default exports"). The delivered CAP-001 rail cases (TC-COMP-193 run detail under Runs, the Runs/Instruments/Settings rail cases) leave this file. CAP-003-E3-S6's rewritten shell tests cover the rail.
- **Copy.**
  - The not-found lead is rendered exactly as UX design §0.5 and owner-shell §2.8 write it, *Check the address, or go to* **Home**, with no trailing punctuation added.
  - The heading uses the straight apostrophe, as written (*There's*), matching the delivered copy style (`research/copy.ts:416`).
- **Skeleton.** "One card-shaped skeleton" fixes the count and the shape, and the 1180 px cap comes from `LAYOUT.contentMaxWidth`. The inner bars (`animate-pulse`, `bg-secondary`, `rounded`, token heights) follow the delivered skeleton precedent in `web/src/screens/research/set-history-dialog.tsx:162`. `h-4` and `p-5` resolve to `--space-*` through `tailwind.config.js`. The skeleton writes no copy.
- **The e2e red window.** The `/runs/{id}` legacy redirect replaces the URL that the delivered `cancel-run.spec.ts:43`, `runs-start-cancel.spec.ts:26` and `diagnose-failure.spec.ts:54,107` assert. Backlog review v4 FINDING-5 (MEDIUM) recommends this story update them. The approved story does not adopt that, the specs are `owner-web-app`'s (DEC-0211), and CAP-003-E7-S7 fixes them, so this plan leaves them. `npm run test:e2e` is outside this story's validation.
- **`Destination` type.** Owner-shell §2.6's `as const` snippet is illustrative. An explicit `readonly Destination[]` keeps the pinned field set (`group`, `label`, `to`, optional `count`) and lets CAP-003-E3-S6 read `d.count` on every entry. The field set and values are unchanged.
- **Plan checks.**
  - T002's runtime-detection scan excludes `matchPath`, which `titles.ts` legitimately uses, so the scan does not forbid what T011 requires.
  - T007's legacy-path scan matches only `path="…"` registrations, so `legacy-redirects.tsx`'s `Navigate` targets and `copy.ts`'s `SHELL_ROUTES` strings do not trip it.
  - The AC-26 grep in the Validation Plan reads only this story's five new or rewritten sources, which write no length.
- **Hand-written mutants** for the mutation run:
  - `web/src/app/routes.tsx`: `const SettingsScreen = lazy(() => import("../screens/settings"));` → `import SettingsScreen from "../screens/settings";`, killed by T009 (e).
  - `web/src/app/routes.tsx`: `<Route path="/data/downloads/:runId"` → `<Route path="/data/downloads/:id"`, killed by T009 (a).
  - `web/src/app/routes.tsx`: in `RootRedirect`, `liveness === "answering" && health !== null` → `health !== null`, killed by T001 (g).
  - `web/src/app/destinations.ts`: an added `{ group: "primary", label: "Home", to: "/home" }` first entry, killed by T002.
  - `web/src/app/titles.ts`: `detail || spec.detail` → `spec.detail`, killed by T004 (b) detail rows.
  - `web/src/app/titles.ts`: in `useTitle`, `useTitleDetail()` → `null`, killed by T005 (b).
  - `web/src/app/not-found.tsx`: `tabIndex={-1}` → `tabIndex={0}`, killed by T008 (c).
- **Equivalent-mutant risk.** Reordering the `Route` elements inside `<Routes>` is unobservable, because React Router ranks routes by specificity, not order. Record it as equivalent if the generator produces it.
