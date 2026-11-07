---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S8-tasks
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
  timestamp: 2026-11-07T07:04:10Z
  source_artifacts:
    - id: CAP-003-E3-S8
      version: "1"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-command-palette
      version: "1"
    - id: CAP-003-integration-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E3-S8 — Shell Journeys End to End: Navigation by Keyboard, Old Bookmarks, Stop and Recover, and the Palette

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S8.md`
**Component**: `FactorFlow-v2` (Playwright suite, `tests/e2e/`; designs `owner-shell` §7 and `command-palette` §7)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Writes the four Playwright specs that owner-shell §2.1 and §7 and command-palette §2.1 and §7 list as new. They prove the shell that CAP-003-E3-S4, CAP-003-E3-S5 and CAP-003-E3-S6 build, against the real stack (`playwright.config.ts` → `scripts/run-e2e-server.sh`: real API, real PostgreSQL). Each spec asserts only what is registered at this story (backlog review v2 FINDING-2).

- **`tests/e2e/shell-navigation.spec.ts`** (TC-INT-001; DAC-E3-S8-2).
  - `/` lands on `/setup` or `/home` by `most_recent_run`, asserted by URL only.
  - Every registered rail item (Research, Settings) and every palette Pages entry (Research, Settings, Coverage, Followed stocks, Downloads) reaches its screen by keyboard alone, inside the frame, with its top-bar title.
  - One table, `LANDINGS`, and one helper, `landByKeyboard`, are the seam CAP-003-E5-S5 and CAP-003-E6-S7 extend with the Home and Data health rows.
- **`tests/e2e/legacy-redirects.spec.ts`** (AC-18; DAC-E3-3). The four CAP-001 paths arrive at their new paths with the query kept, by `replace`.
- **`tests/e2e/unreachable-recovery.spec.ts`** (TC-INT-046; DAC-E3-S8-1).
  - The application is stopped and restarted through a new support helper, `tests/e2e/support/application.ts` (Open Gap 1).
  - While stopped, the rail and top bar stay and the main region shows the unreachable state, whose *Last answered* line carries the last success.
  - On restart, the same URL and the same JavaScript context return, with no `load` event.
- **`tests/e2e/command-palette.spec.ts`** (TC-INT-041; DAC-E3-S8-3).
  - One followed stock `KO` is seeded. From two screens, `Ctrl+K`, *K* and `Enter` open the stock's target. The target follows registration (Resolved Conflict 1): `/research/stocks/KO` in this clone, where CAP-002 has merged.
  - The opener works by keyboard and gets focus back on `Esc`.
  - Inside a text field the shortcut types instead.

No production file changes. `tests/e2e/support/acquisition.ts` and `database.ts` are used as delivered. `scripts/run-e2e-server.sh` and `playwright.config.ts` are unchanged.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-1 | Every screen renders inside one shell; every rail item reaches its screen | T003, T007 |
| AC-18 | Each path CAP-001 shipped takes the owner to the same screen at its new path | T004, T007 |
| AC-22 | The palette opens from the keyboard and the top bar on every screen and finds followed stocks and pages | T003, T006, T007 |
| AC-23 | Stopping the application shows the unreachable state; restarting returns the screen without a reload | T002, T005, T007 |
| AC-25 | Every operation is completable by keyboard | T003, T006, T007 |
| DAC-E3-S8-1 | `unreachable-recovery.spec.ts` stops and restarts the application through `tests/e2e/support`. The rail and top bar remain throughout, *Last answered* carries the last success, and recovery keeps the URL and the JavaScript context (no `load` event) | T002, T005, T007, T008 |
| DAC-E3-S8-2 | `shell-navigation.spec.ts` asserts only registered landings (Settings, the `/data` sub-pages and, per Resolved Conflict 2, Research) and the `/` redirect target URL, and exposes one helper the E5 and E6 closing stories extend | T003, T007, T008 |
| DAC-E3-S8-3 | `command-palette.spec.ts` with one followed stock seeded: *K* lists it in Stocks from the server, and `Enter` opens its target | T006, T007, T008 |

Mapped test cases (`tests/integration/integration-tests.md`; `tests/coverage-matrix.md` lines 198-200 and the per-story count "3 of 3" at line 410):

- **TC-INT-001** covers DAC-E3-S8-2.
- **TC-INT-041** covers DAC-E3-S8-3.
- **TC-INT-046** covers DAC-E3-S8-1.

The test specification is `status: draft`. Its steps are used as written and sharpened below.

Other test cases on this story's capability ACs are not implemented here:

- **Component cases belong to the stories that own them.** TC-COMP-057 and TC-COMP-077 to TC-COMP-080 belong to CAP-003-E3-S4. TC-COMP-081 to TC-COMP-086 belong to CAP-003-E3-S5. TC-COMP-061, TC-COMP-087 to TC-COMP-089 belong to CAP-003-E3-S6.
- **These go to Phase 6b automation.** TC-INT-040 and TC-INT-042 to TC-INT-045 trace to no CAP-003-E3-S8 criterion in the coverage matrix, and TC-E2E-007 to TC-E2E-010 are user-flow journeys. All are automated in Phase 6b (`$automation-planning`) (Other Notes).
- `legacy-redirects.spec.ts` has no mapped case. AC-18 maps to TC-INT-040 (the eleven relabelled CAP-001 specs, CAP-003-E7-S7) and TC-E2E-008 (Phase 6b). So T004's assertions come from owner-shell §7's row *Old bookmarks* and epic DAC-E3-3.

## Phase 1: Setup

**Purpose**: Confirm the delivered shell is in the working tree, and add the one support helper the stop-and-recover spec needs.

- [ ] T001 Confirm the hard prerequisites before Phase 2. No file is created or edited by this task. Record the `grep -n` outputs in the first TDD cycle's evidence.
  - **CAP-003-E3-S4.**
    - `web/src/app/destinations.ts` has `DESTINATIONS` with Research then Settings, and `RESEARCH_REGISTERED`.
    - `web/src/app/legacy-redirects.tsx` has `legacyRoutes`.
    - `web/src/app/titles.ts` has *Data health › Coverage*, *Data health › Followed stocks*, *Data health › Downloads* and *Settings*.
    - `web/src/app/routes.tsx` has `RootRedirect`.
  - **CAP-003-E3-S5.**
    - `web/src/app/command-palette/targets.ts` has `stockTarget`.
    - `pages.ts` has `palettePages`.
    - `copy.ts` has the dialog label *Search FactorFlow* and the group names.
  - **CAP-003-E3-S6.**
    - `web/src/app/shell.tsx` renders `nav` *Main*, the opener *Open the command palette*, `data-testid="top-bar-title"`, `main[data-liveness]`, and the focus-to-`h1` hook (DEC-0337).
    - `web/src/app/unreachable-state.tsx` renders `data-testid="unreachable-state"`.
    - `web/src/app/status-region.tsx` is gone.
  - **CAP-003-E2-S5.** `src/factorflow/api/app.py` includes `data_health.router` (`grep -n "data_health" src/factorflow/api/app.py`), so `GET /api/attention` answers 200 on the main stack.
  - **Baseline.**
    - Run `npx tsc --noEmit -p tsconfig.e2e.json` and `npm run test`, and record both green.
    - Check `npx playwright --version` (1.47 or later, for `page.clock`) and that a container runtime answers `docker info`. The Bash sandbox blocks Docker, so this may need the sandbox disabled.
- [ ] T002 Create `tests/e2e/support/application.ts` (DEC-0339; Open Gap 1; DAC-E3-S8-1 "through `tests/e2e/support`"). It is a test fixture, not a product contract, documented as such in its header comment, like `acquisition.ts`.
  - **Constants.**
    - `export const RECOVERY_PORT = Number(process.env.FACTORFLOW_E2E_RECOVERY_PORT ?? "8127")`.
    - `export const RECOVERY_BASE_URL = \`http://127.0.0.1:${RECOVERY_PORT}\``.
    - `const RECOVERY_DATABASE = "factorflow_recovery"`.
    - `const DB_PORT = process.env.FACTORFLOW_E2E_DB_PORT ?? "55433"` (the default in `run-e2e-server.sh`).
  - **`function databaseUrl(): string`** returns `postgresql://postgres:postgres@127.0.0.1:${DB_PORT}/${RECOVERY_DATABASE}`. The credentials are the constants in `run-e2e-server.sh` and `database.ts`.
  - **`function ensureDatabase(): void`.**
    - If `sql("SELECT 1 FROM pg_database WHERE datname = 'factorflow_recovery'")` is `""`, run `sql("CREATE DATABASE factorflow_recovery")`, using `sql` from `./database`.
    - Then always run `execFileSync("uv", ["run", "python", "-m", "factorflow.db.migrate_main"], { env: applicationEnv(), stdio: "inherit" })`. The migrator is idempotent.
    - A separate database is used because a starting application records any classification set left building as failed (`reclaim_interrupted_sets`, run once at start). Pointed at `factorflow`, every start would interfere with the main stack.
  - **`function applicationEnv(): NodeJS.ProcessEnv`** returns `{ PATH: process.env.PATH, HOME: process.env.HOME, FACTORFLOW_DATABASE_URL: databaseUrl(), FACTORFLOW_API_PORT: String(RECOVERY_PORT) }`.
    - Nothing else is inherited. In particular no provider key is passed, as `run-e2e-server.sh` says: "nothing falls back to an inherited key" (DEC-0037).
  - **`function portState(): Promise<"open" | "refused">`** connects with `node:net` `connect({ host: "127.0.0.1", port: RECOVERY_PORT })`, as `startup-health.spec.ts`'s `connectionError` does. It resolves `"open"` on connect, `"refused"` on `ECONNREFUSED`, and rethrows any other error.
  - **`export async function startApplication(): Promise<void>`.**
    - If `portState()` is `"open"`, throw `Error("something already listens on 127.0.0.1:8127 …")`. This names a leftover process from an aborted run rather than testing against it.
    - Call `ensureDatabase()` on the first start only (a module-level flag).
    - Spawn `uv run python -m factorflow.app_main` with `{ env: applicationEnv(), detached: true, stdio: ["ignore", "ignore", "pipe"] }`. Keep the last 4 KB of stderr in a buffer. It inherits the working directory, the repository root that `npm run test:e2e` runs from, as `database.ts`'s `docker` calls and `ingestionProcessIsRunning` assume.
    - Then poll `fetch(\`${RECOVERY_BASE_URL}/api/health\`)` once a second for up to 60 tries, until it answers 200. This is the readiness loop `run-e2e-server.sh` uses for the acquisition API. On timeout, kill the process group and throw with the stderr tail.
  - **`export async function stopApplication(): Promise<void>`.**
    - A no-op when nothing was started.
    - Otherwise `process.kill(-child.pid, "SIGTERM")` on the process group, so `uv`'s Python child stops too. Wait for the child's `exit` event, escalating to `SIGKILL` after 10 s.
    - Then poll `portState()` every 200 ms for up to 30 s, until it reports `"refused"`. Only then return, so the next browser read is refused rather than raced.
  - **Comments.**
    - Cite AC-23, DAC-E3-S8-1, TC-INT-046 and owner-shell §7 *Stop and recover*.
    - Say that the e2e harness runs the application as a host process, not a container (`run-e2e-server.sh`). So stopping this process is the harness's equivalent of stopping the application container. The browser sees the same refused connection.
    - Say why the main API on 8123 is not stopped instead: `run-e2e-server.sh` `wait`s on it, and its exit trap would remove the PostgreSQL container under every later spec.

**Checkpoint**: The prerequisite exports exist, `npx tsc --noEmit -p tsconfig.e2e.json` is green with `application.ts` added, and `npm run test` is green. No `web/src/` file has changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the four specs. This story adds no production code, so each spec is expected to pass against CAP-003-E3-S4 to S6 on its first run. Its strength is shown instead by the hand-written production mutants in T008, each of which must turn it red. Under a driver, each spec is one TDD cycle (T011).

**Shared conventions** (each spec defines its own helpers, as the delivered specs do; nothing is shared through a new module except T002's fixture).

- **Frame.**
  - `rail(page)` is `page.getByRole("navigation", { name: "Main" })`.
  - `banner(page)` is `page.getByRole("banner")`.
  - `topBarTitle(page)` is `page.getByTestId("top-bar-title")` (CAP-003-E3-S6 T014).
  - `mainHeading(page)` is `page.locator("main h1")`.
- **Title text.** The crumbs render as a link, a `›` span and a span, so their text has no spaces. Titles are asserted with independent literal patterns such as `/^Data health\s*›\s*Coverage$/`, never with a value read from `titles.ts`.
- **Keyboard only.** Each owner step is `page.keyboard.press` or `page.keyboard.type`. No owner step uses `click`, `fill` or `focus`.
  - `tabTo(page, locator, max = 40)` presses `Tab` until `locator` is focused (`await locator.evaluate((el) => el === document.activeElement)`). It fails with the locator's description after `max` presses.
  - `chooseOption(page, option, max = 15)` presses `ArrowDown` until `option` has `aria-selected="true"`, then `Enter`. cmdk marks its active item with `aria-selected`, and disabled rows are skipped (command-palette §10).
- **Palette.**
  - `palette(page)` is `page.getByRole("dialog", { name: "Search FactorFlow" })`.
  - `openPaletteByShortcut(page)` presses `Control+k` and expects `palette(page)` to be visible and `palette(page).getByRole("combobox")` to be focused.

### Mandatory Component Tests

- [ ] T003 [P] Implement TC-INT-001 (Shell navigation lands on Settings and the `/data` sub-pages; `/` redirects by URL) in the new `tests/e2e/shell-navigation.spec.ts`. Put the test ID in each test title, as the delivered specs do (`"TC-INT-001: …"`), and a `// Implements TC-INT-001` comment. The doc comment cites AC-1, AC-2, AC-22, AC-25, DAC-E3-S8-2, owner-shell §7 *Shell journey* and backlog review v2 FINDING-2.
  - **The extension seam (DAC-E3-S8-2 "one helper the E5 and E6 closing stories extend").**
    - `interface Landing { readonly label: string; readonly path: string; readonly title: RegExp; readonly via: readonly ("rail" | "palette")[]; readonly headingFocused: boolean }`.
    - `const LANDINGS: readonly Landing[]` holds, in this order:
      - `{ label: "Research", path: "/research", title: /^Research$/, via: ["rail", "palette"], headingFocused: false }`;
      - `{ label: "Settings", path: "/settings", title: /^Settings$/, via: ["rail", "palette"], headingFocused: true }`;
      - `{ label: "Coverage", path: "/data/coverage", title: /^Data health\s*›\s*Coverage$/, via: ["palette"], headingFocused: true }`;
      - `{ label: "Followed stocks", path: "/data/followed", title: /^Data health\s*›\s*Followed stocks$/, via: ["palette"], headingFocused: true }`;
      - `{ label: "Downloads", path: "/data/downloads", title: /^Data health\s*›\s*Downloads$/, via: ["palette"], headingFocused: true }`.
    - The comment above `LANDINGS` says that CAP-003-E5-S5 adds Home (`/home`, rail and palette) and CAP-003-E6-S7 adds Data health (`/data`, rail and palette) as rows here, in the change that registers each screen. No other edit is needed.
    - `async function landByKeyboard(page: Page, landing: Landing, via: "rail" | "palette"): Promise<void>` is the one helper.
      - **Starting point.** It starts from `/settings`, or from `/data/coverage` when the landing is Settings, so the path always changes. Wait for `rail(page)`.
      - **Rail.** `tabTo(page, rail(page).getByRole("link", { name: landing.label, exact: true }))`, then `Enter`.
      - **Palette.**
        - Call `openPaletteByShortcut(page)` and type `landing.label`.
        - Then `chooseOption(page, palette(page).getByRole("group", { name: "Pages" }).getByRole("option", { name: new RegExp(\`^${landing.label}\`) }))`.
        - Expect `palette(page)` to be hidden afterwards.
      - **Then, for both:**
        - `new URL(page.url()).pathname` is exactly `landing.path`, and the search is `""`.
        - `topBarTitle(page)` matches `landing.title`.
        - `rail(page)` and `banner(page)` are visible.
        - `page.getByRole("main")` holds no *There's no page at this address.* heading.
        - When `headingFocused`, `mainHeading(page)` is focused (owner-shell §2.7; DEC-0337).
    - For each landing and each of its `via` values, add one `test(\`TC-INT-001: ${landing.label} by ${via}, keyboard only\`, …)`.
  - **(a) `/` redirects by URL (TC-INT-001 step 1).**
    - Read `GET /api/health` through the `request` fixture, and keep `most_recent_run`.
    - `page.goto("/")`.
    - The pathname becomes exactly `/setup` when `most_recent_run` is `null`, else exactly `/home`. Use `expect.poll` on `new URL(page.url()).pathname`.
    - The frame is visible.
    - Nothing is asserted about the content at that path: CAP-003-E4-S6 and CAP-003-E5-S5 register those screens (register G17; DAC-E3-S8-2).
  - **(b) Rail (TC-INT-001 step 2).** The rows with `via` `rail`: Research and Settings.
  - **(c) Pages (TC-INT-001 step 3; story Description "the palette's Pages group … reach their screens by keyboard alone").** Every row with `via` `palette`.
  - **(d) Only what is registered.** A last test enumerates `rail(page).getByRole("link")`. Their accessible names are exactly `["Research", "Settings"]`, which are the rows with `via` `rail`. So the table and the rail cannot drift apart without this test failing. CAP-003-E5-S5 and CAP-003-E6-S7 extend this by adding their rows.
  - **Kills:**
    - swap-case on the `RootRedirect` targets (`"/setup"` ↔ `"/home"`): (a). The expectation is computed from the live `most_recent_run`, not from the product.
    - negate-boolean on `RootRedirect`'s `=== null`: (a).
    - remove-attribute of the focus-to-`h1` call in `shell.tsx`: the `headingFocused` check.
    - swap-case of the *Followed stocks* and *Downloads* title rows in `titles.ts`: (c), against independent literal patterns.
    - swap-case of the `group === "primary"` filter in `shell.tsx` that drops Research from the rail: (b) and (d).
    - a hand-written mutant that removes the palette's Pages group: (c).
- [ ] T004 [P] Write `tests/e2e/legacy-redirects.spec.ts` (AC-18; epic DAC-E3-3; owner-shell §7 *Old bookmarks*: "the four paths arrive with the query kept"). No TC is mapped (see the traceability note). Each test title names AC-18. The doc comment says the file is deleted, with `legacy-redirects.tsx`, one release later (owner-shell §6).
  - **Seeding.** `beforeAll` seeds one terminal run with `sql` from `./support/database`, with the column list of the delivered `run-detail.spec.ts` `seedPartialRun`: `INSERT INTO acquisition_run (state, history_depth_years, started_at, ended_at, instruments_named) VALUES ('partial', 1, now() - interval '5 minutes', now(), 2) RETURNING run_id`. It keeps the id. A terminal run takes no active-run slot from a later spec.
  - **(a) The four paths, `it.each` style** over the literal rows below, with the arrival title as an independent pattern:

    | Opened | Arrives at | Title |
    |---|---|---|
    | `/coverage?x=1` | `/data/coverage?x=1` | `/^Data health\s*›\s*Coverage$/` |
    | `/instruments?x=1` | `/data/followed?x=1` | `/^Data health\s*›\s*Followed stocks$/` |
    | `/runs?x=1` | `/data/downloads?x=1` | `/^Data health\s*›\s*Downloads$/` |
    | `/runs/{runId}?x=1` | `/data/downloads/{runId}?x=1` | `/^Data health\s*›\s*Downloads\s*›/` |

    - `page.goto(opened)`, then expect the pathname plus search to equal the arrival exactly, through `expect.poll`.
    - `topBarTitle(page)` matches the title, `mainHeading(page)` is visible, and no not-found heading renders.
  - **(b) `replace`, not push.**
    - `page.goto("/settings")`, then `page.goto("/runs?x=1")`, and wait for `/data/downloads?x=1`.
    - `page.goBack()` lands on `/settings`. If the redirect had pushed, `goBack` would return to `/runs?x=1` and redirect forward again.
  - **(c) The query is kept whole.** `/coverage?symbol=KO&x=1` arrives at `/data/coverage?symbol=KO&x=1`. This is the Coverage filter's own parameter, so a bookmark to a filtered view survives.
  - **Kills:**
    - a hand-written mutant `` `${to}${search}` `` → `` `${to}` `` in `KeepSearch`: (a) rows 1-3 and (c).
    - `` `/data/downloads/${runId}${search}` `` → `` `/data/downloads${search}` `` in `LegacyRunDetail`: (a) row 4.
    - remove-attribute of `replace` on `KeepSearch`'s `Navigate`: (b).
    - swap-case of the `/instruments` and `/runs` targets in `legacyRoutes`: (a), against the literal table.
- [ ] T005 [P] Implement TC-INT-046 (Stopping and restarting the application: unreachable state then recovery without reload) in the new `tests/e2e/unreachable-recovery.spec.ts`, with a `// Implements TC-INT-046` comment and `"TC-INT-046: …"` in the title. It depends on T002. The doc comment cites AC-23, DAC-E3-S8-1, epic DAC-E3-8, owner-shell §2.8 and §7, and DEC-0339 and -2.
  - **Lifecycle.** `test.setTimeout(120_000)` (the `webServer` start budget in `playwright.config.ts`). `beforeEach` calls `startApplication()`. `afterEach` calls `stopApplication()`, which is idempotent, so a failing test never leaves the process running.
  - **Steps:**
    1. **Watch health.** Before navigating, record the Node-side `Date.now()` of every `page.on("response")` whose URL pathname is `/api/health` and whose status is 200, keeping only the last as `lastOkAt`.
    2. **Clock.** `await page.clock.install()` with no time. The page clock then starts at real time and flows (Playwright 1.47; CAP-003-E3-S6 T019 uses the same API).
    3. **Open the screen.** `page.goto(\`${RECOVERY_BASE_URL}/data/followed\`)`. Wait for `page.getByRole("main")` to have `data-liveness="answering"` and `mainHeading(page)` to be visible.
    4. **Mark the context.**
       - Run `page.evaluate(() => { (window as unknown as { __recoveryMarker?: string }).__recoveryMarker = crypto.randomUUID(); return … })` and keep the value.
       - Then register `page.on("load", () => loads++)`, starting at `loads = 0`.
    5. **Stop (TC step 1).**
       - `await stopApplication()`.
       - `await page.clock.fastForward(30_000)`, the health cadence (`HEALTH_POLL_INTERVAL_MS`, owner-shell §2.4), so the next health read is due and is refused.
    6. **Read the main region (TC step 2).**
       - `page.getByTestId("unreachable-state")` is visible inside `page.getByRole("main")`.
       - It contains `FactorFlow is not answering.` and the delivered cause paragraph, both as literals.
       - `mainHeading(page)` has count 0, because the routed screen is gone from `main`.
       - `rail(page)` and `banner(page)` are visible ("throughout").
       - `topBarTitle(page)` still matches `/^Data health\s*›\s*Followed stocks$/`.
    7. ***Last answered* carries the last success (DEC-0340).**
       - Match the state's text with `/Last answered (\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}) (CDT|CST)/`.
       - Convert it to epoch milliseconds independently of the product: `Date.UTC(y, m - 1, d, h, mi, s) + (zone === "CDT" ? 5 : 6) * 3_600_000`.
       - Assert `Math.abs(parsed - lastOkAt) <= 3_000`.
       - The failed read happened 30 s of page time later, so the failure time is at least 27 s away from `lastOkAt`.
    8. **Restart (TC step 3).**
       - `await startApplication()`.
       - Arm `page.waitForRequest((r) => new URL(r.url()).pathname === "/api/instruments")`, then `await page.clock.fastForward(30_000)`.
    9. **Recovery.**
       - `page.getByTestId("unreachable-state")` has count 0.
       - `mainHeading(page)` is visible again, and the armed request resolves. This shows the routed screen mounted again and refetched (epic DAC-E3-8).
       - `page.url()` is exactly `${RECOVERY_BASE_URL}/data/followed`.
       - `window.__recoveryMarker` still equals the kept value.
       - `loads` is `0`.
       - `rail(page)` and `banner(page)` are visible.
  - **Kills:**
    - a hand-written mutant `lastAnsweredAt` → `lastUpdated` in `unreachable-state.tsx`: step 7. The failure time is 30 s off.
    - negate-boolean on `liveness === "unreachable"` in `shell.tsx` `MainRegion`: step 6.
    - a hand-written mutant that calls `window.location.reload()` in `health.tsx` on a transition from `unreachable` to `answering`: step 9 (`loads`, marker).
    - a hand-written mutant that renders `UnreachableState` in place of the whole frame (`Frame` returns it before the rail): step 6, rail and banner.
    - a hand-written mutant in `health.tsx` that keeps `liveness` `unreachable` after a success (the success branch writes `previous.liveness`): step 9.
- [ ] T006 [P] Implement TC-INT-041 (Palette finds a followed stock from the server and opens its coverage) in the new `tests/e2e/command-palette.spec.ts`, with a `// Implements TC-INT-041` comment and `"TC-INT-041: …"` in the first title. The doc comment cites AC-22, AC-25, DAC-E3-S8-3, epic DAC-E3-10 and DAC-E3-11, DEC-0207, command-palette §7 *Keyboard journey* and Resolved Conflict 1.
  - **Seeding (DAC-E3-S8-3 "one followed stock seeded").**
    - `beforeAll` sends `request.post("/api/instruments", { data: { symbols: ["KO"] } })` and expects `[201, 409]` to contain the status. This is the delivered `runs-start-cancel.spec.ts` idiom.
    - Then `GET /api/instruments?symbol=KO&lifecycle=active` lists `KO`, so a retired leftover cannot pass the precondition.
  - **Expected target, independent of the code under test.**
    - `const researchRegistered = (await rail(page).getByRole("link", { name: "Research", exact: true }).count()) === 1`.
    - `expected = researchRegistered ? "/research/stocks/KO" : "/data/coverage?symbol=KO"`. Both are literals, so a mutant in `stockTarget` cannot move both sides (Resolved Conflict 1).
    - In this clone `researchRegistered` is `true`. The test also asserts it equals `true`, so a rail that silently lost Research is not mistaken for the other branch. A clone without CAP-002 changes that one literal.
  - **(a) From two screens: `/settings`, then `/data/downloads` (TC-INT-041 steps 1-2; command-palette §7 "from two screens").** For each screen:
    - `page.goto(screen)` and wait for `rail(page)`. Focus is on the document body.
    - Arm `page.waitForResponse` for the stock search. It must match all of:
      - pathname `/api/instruments`;
      - `searchParams.get("symbol")` upper-cased equal to `"K"`;
      - `searchParams.get("lifecycle") === "active"`;
      - `searchParams.get("limit") === "8"`;
      - status 200.
    - Call `openPaletteByShortcut(page)`, then type `K`.
    - The response resolves, and its JSON `instruments` rows include `symbol: "KO"`: the list comes from the server.
    - `palette(page).getByRole("group", { name: "Stocks" }).getByRole("option", { name: "KO", exact: true })` is visible.
    - Call `chooseOption` on that option.
    - Expect the pathname plus search to equal `expected` exactly.
    - `palette(page)` is hidden. When `researchRegistered`, `topBarTitle(page)` matches `/^Research\s*›\s*KO$/`.
  - **(b) The top-bar opener by keyboard (AC-22 "from the top bar"; DAC-E3-10 focus restore).**
    - On `/data/downloads`, `tabTo` the button named *Open the command palette*, then `Enter`. `palette(page)` is visible.
    - `Escape` hides it, and the opener is focused again.
  - **(c) In a text field the shortcut types instead (command-palette §7; DAC-E3-10).**
    - On `/data/followed`, `tabTo(page, page.getByRole("main").getByRole("textbox").first())`. The first text field in the main region is the followed-stock symbol field. It is located by role, not by its CAP-001 label, which CAP-003-E7 relabels.
    - Type `AB`, press `Control+k`, then type `C`.
    - The field is still focused, its value ends with `ABC`, and `palette(page)` has count 0. Had the palette opened, it would have taken focus, and `C` would have gone into its combobox.
    - Then `page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())`. This is the harness, not an owner step. Then `openPaletteByShortcut(page)` succeeds, which proves the listener was live during the text-field press.
  - **Kills:**
    - negate-boolean on `RESEARCH_REGISTERED ?` in `targets.ts`: (a).
    - off-by-one on `STOCK_SEARCH_LIMIT = 8` in `use-stock-search.ts`: (a) `limit === "8"`.
    - swap-case `lifecycle: "active"` → `"all"`: (a).
    - a hand-written mutant `isTextField(event.target)` → `false` in `shell.tsx`: (c).
    - remove-attribute of the opener's `onClick`: (b).
    - a hand-written mutant that drops `onCloseAutoFocus`'s refocus in `command.tsx` (CAP-003-E1-S3): (b).

### Additional Unit Tests

None. This story adds no production code. The units the specs exercise are tested by CAP-003-E3-S4 to S6. `application.ts` is a fixture exercised by T005 itself: a start that does not answer, or a stop that leaves the port open, fails T005.

**Checkpoint**: The four specs and the fixture exist, and `npx tsc --noEmit -p tsconfig.e2e.json` is green. Nothing under `web/src/` has changed.

---

## Phase 3: Core Implementation

**Purpose**: Run the specs against the delivered shell. There is no production code to write.

- [ ] T007 Run the four specs against the real stack: `npm run test:e2e -- tests/e2e/shell-navigation.spec.ts tests/e2e/legacy-redirects.spec.ts tests/e2e/unreachable-recovery.spec.ts tests/e2e/command-palette.spec.ts` (depends on T002 to T006).
  - It needs `npx playwright install` and a container runtime, and the Bash sandbox blocks Docker, so it may need the sandbox disabled.
  - All four must pass. If one fails against the delivered code, do not edit `web/src/`. That code belongs to CAP-003-E3-S4 to S6 and CAP-003-E1, and a failure here is a defect for its story's rework. Stop and report the failing assertion and the file it implicates.
  - Run the same command three times in a row. All three must pass, to rule out ordering and timing flakiness: the specs share the main database, and T005 starts and stops a process.

**Checkpoint**: All four specs pass three times in a row against the real stack.

---

## Phase 4: Integration

**Purpose**: Show that each spec can fail: every hand-written production mutant in Other Notes turns at least one spec red.

- [ ] T008 Run the hand-written mutants in Other Notes, one at a time (depends on T007).
  - The e2e stack binds fixed ports and one fixed container name (`factorflow-e2e-postgres`), so mutants cannot run in parallel clones. Use `python3 scripts/mutation-run.py run --jobs 1` with `--command "npm run test:e2e -- tests/e2e/<the spec that kills it>"`.
  - If a clone cannot start the stack (no `uv sync` or `npm ci` in the clone), plant each mutant by hand in the working tree instead. Run the named spec, record `killed` or `survived` with the failing assertion, and revert. After the last one, `git diff --exit-code -- web/src` exits 0.
  - Every mutant must be killed. A survivor means the spec's assertion is too weak: strengthen the spec, not the mutant, and rerun.
  - Each kill is that cycle's RED evidence in T011.

**Checkpoint**: Every listed mutant is killed, and `web/src/` is unchanged.

---

## Phase 5: Polish

**Purpose**: Validation, scope and the TDD evidence.

- [ ] T009 Run the validation commands from the repository root: `npx tsc --noEmit -p tsconfig.e2e.json`, `npx tsc --noEmit`, `npm run lint`, `npm run format` and `npm run test`.
  - `biome.json`'s `files.include` covers only `web/src/**` and root files, so lint and format do not reach `tests/e2e`. Match the delivered specs' style by hand: two-space indent, double quotes, semicolons, 100 columns.
  - Report that exclusion rather than calling the specs linted.
  - Do not run the whole `npm run test:e2e` as this story's gate. The delivered specs that assert `/runs/{uuid}` URLs or old labels are red until CAP-003-E7-S7 (backlog review v4 FINDING-5; register G15). Running the full suite is informative only, and any red outside the four new specs and CAP-003-E3-S6's two startup specs is reported, not fixed here.
- [ ] T010 Confirm scope (depends on T009).
  - `git status --short` lists only:
    - the new `tests/e2e/shell-navigation.spec.ts`, `legacy-redirects.spec.ts`, `unreachable-recovery.spec.ts`, `command-palette.spec.ts` and `tests/e2e/support/application.ts`;
    - this story's `-tasks.md`, `-tdd-evidence.yaml` and status line.
  - `git diff --exit-code -- web/src src tests/e2e/support/acquisition.ts tests/e2e/support/database.ts scripts/run-e2e-server.sh playwright.config.ts package.json package-lock.json` exits 0.
  - `grep -rn "8127" tests/e2e scripts playwright.config.ts` prints only `tests/e2e/support/application.ts`.
- [ ] T011 After each TDD cycle in T003–T008 — not once at the end — do the following before the next cycle begins. The cycles are one per spec, each with its mutants from T008 as RED evidence.
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Append the cycle to `CAP-003-E3-S8-tdd-evidence.yaml` beside this story, with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence: each mutant's failing assertion, then the spec green on the delivered code;
    - `mutation: {not_applicable: "no production line changed; the spec's strength is the hand-written production mutants of T008, run with --jobs 1"}`, plus the T008 kill table;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This runs under a driver that commits once per stage, so each cycle records `commit_hash: stage`. No commit is made per cycle (INV-TDD-002, TEST-TDD-008; traces to no AC).

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every cycle is named by a TDD-evidence entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S6 | hard | The frame, `nav` *Main*, `top-bar-title`, the opener, the keydown listener, the focus-to-`h1` hook and `unreachable-state.tsx` that every spec drives. In the graph |
| CAP-003-E3-S5 | hard | The palette's groups, Stocks search and targets that T003 (c) and T006 drive. In the graph |
| CAP-003-E3-S4 | hard | The route map, `RootRedirect`, `legacy-redirects.tsx`, `titles.ts` and `DESTINATIONS` that T003 and T004 drive. In the graph |
| CAP-003-E2-S5 | hard | `GET /api/attention` is served, which the shell polls on every route (backlog review v2 FINDING-1). In the graph |
| CAP-003-E3-S2 | context | `lastAnsweredAt` and the 30 s health cadence that T005 relies on. Reached through CAP-003-E3-S6 in the graph (E3-S6 depends on E3-S2); no direct import |
| CAP-003-E1-S3 | context | `CommandDialog`'s focus restore, named only in T006's hand-written mutant. Reached through CAP-003-E3-S5 and CAP-003-E3-S6 in the graph |
| CAP-003-E5-S5 | reverse | Adds the Home row to `LANDINGS` in `shell-navigation.spec.ts`. Graph: E5-S5 depends on E3-S8 |
| CAP-003-E6-S7 | reverse | Adds the Data health row to `LANDINGS` (DAC-E6-S7-2). Graph: E6-S7 depends on E3-S8 |
| CAP-003-E4-S6 | context | Registers `/setup`, the `/` redirect target T003 (a) asserts by URL only |
| CAP-003-E7-S7 | context | Repairs the delivered e2e specs that go red from CAP-003-E3-S4 on. Why T009 does not gate on the full suite |

### Task Dependencies

- T001: no dependencies.
- T002: depends on T001.
- T003, T004 and T006: depend on T001 and can run in parallel (different files).
- T005: depends on T002.
- T007: depends on T002 to T006.
- T008: depends on T007.
- T009: depends on T008. T010 depends on T009.
- T011: interleaved. It runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- Phase 2: T003, T004, T005 (once T002 lands) and T006 touch different files.
- T007 and T008 run serially. The stack binds fixed ports, so specs and mutants cannot run concurrently.

---

## Validation Plan

### Constitution-Defined Commands

These are tech stack v7's Validation Commands, run from the repository root:

- **Build:** `npm run build`. The e2e server script runs it before the API starts, so the specs always run the current bundle.
- **Test:**
  - `npm run test` (unit suite; unchanged here, must stay green);
  - `npm run test:e2e -- tests/e2e/shell-navigation.spec.ts tests/e2e/legacy-redirects.spec.ts tests/e2e/unreachable-recovery.spec.ts tests/e2e/command-palette.spec.ts`, which needs `npx playwright install` and a container runtime. If either is unavailable, report the exclusion and never call a partial run green.
- **Lint:** `npm run lint`. It does not reach `tests/e2e` (T009).
- **Format:** `npm run format`. It does not reach `tests/e2e` (T009).
- **Type check:** `npx tsc --noEmit`, plus `npx tsc --noEmit -p tsconfig.e2e.json` for `tests/e2e`. The second command is not in the tech-stack table, but it is the only checker that reads these files.

### Story-Specific Validation

- **AC-1, DAC-E3-S8-2:** T003 (b), (c) and (d) pass. `grep -n "LANDINGS" tests/e2e/shell-navigation.spec.ts` shows one table and one `landByKeyboard`.
- **AC-18:** T004 passes. `replace` is proven by (b).
- **AC-22, DAC-E3-S8-3:** T006 (a) and (b) pass from both screens. The stock search request carries `limit=8` and `lifecycle=active`.
- **AC-23, DAC-E3-S8-1:**
  - T005 passes.
  - `loads` is `0` and the marker survives.
  - `lsof -nP -iTCP:8127 -sTCP:LISTEN` prints nothing after the suite, so no process is left behind.
- **AC-25:** no owner step in the four specs uses `click`, `fill` or `focus`. `grep -nE "\.(click|fill|focus)\(" tests/e2e/shell-navigation.spec.ts tests/e2e/legacy-redirects.spec.ts tests/e2e/unreachable-recovery.spec.ts tests/e2e/command-palette.spec.ts` prints nothing. This is consistent with T006 (c), which blurs through `page.evaluate`, and with every other task, which uses only `keyboard` and `goto`.
- **Strength:** T008's table has every mutant `killed`.

---

## Notes

### Resolved Conflicts

1. **The palette stock target in DAC-E3-S8-3, the Description and TC-INT-041.**
   - **The conflict.** These three say `Enter` lands on `/data/coverage?symbol=…`, "research routes unregistered in this clone". But CAP-002 has merged: `routes.tsx` registers the five `/research` routes, and CAP-003-E3-S4's `DESTINATIONS` carries Research, so `RESEARCH_REGISTERED` is `true` (register D1).
   - **Governing: epic DAC-E3-11 and DEC-0207.** Both say "a stock MUST open `/research/stocks/{symbol}` when research routes are registered and `/data/coverage?symbol={symbol}` otherwise". The epic criterion outranks the story's, whose parenthesis is a premise about the clone, not a requirement. TC-INT-041's own edge case says the same ("Research registered: `/research/stocks/KO`"), and backlog review v4 FINDING-2 recommends deriving the target from registration.
   - **Outcome.** T006 derives the expected target from the rendered rail and compares it with literals. In this clone that is `/research/stocks/KO`, asserted with `researchRegistered === true`.
2. **The registered landings in DAC-E3-S8-2.**
   - **The conflict.** DAC-E3-S8-2 says the spec "asserts only the Settings and `/data` sub-page landings". But Research is a rail item at this story: CAP-002 merged, and DAC-E3-2 adds Research to `DESTINATIONS`. The Description includes it too ("the rail's registered items (Settings, and Research when CAP-002 has merged)").
   - **Governing: capability AC-1, "every rail item MUST reach its screen".** It outranks a story criterion's narrower list. "Only" is read as excluding the unregistered Home and Data health landings, which is what backlog review v2 FINDING-2 asks of it.
   - **Outcome.** T003 carries a Research row. T003 (d) pins the rail to exactly the table's rail rows.
3. **The palette's Pages group in the Description.**
   - **The conflict.** The Description lists Coverage, Followed stocks, Downloads and Settings.
   - **Governing: epic DAC-E3-11 and command-palette §2.3**, which give the shipped destinations plus the three `/data` sub-pages, so Research is included while registered (register C2).
   - **Outcome.** T003 (c) lands all five by palette.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0339.**
   - **What is undetermined.** DAC-E3-S8-1, TC-INT-046 and owner-shell §7 stop and restart "the application container" "through `tests/e2e/support`". But in the e2e harness the application is a host process, which `scripts/run-e2e-server.sh` starts under Playwright's `webServer`. No helper stops or restarts it (`acquisition.ts` has only `ingestionProcessIsRunning`), and no artifact says how (register G5).
   - **What the plan adopts (T002, T005).**
     - A new fixture, `tests/e2e/support/application.ts`, runs a second instance of the same entry point (`uv run python -m factorflow.app_main`) on `127.0.0.1:8127`. The port can be overridden with `FACTORFLOW_E2E_RECOVERY_PORT`, following the script's port variables.
     - The instance uses its own migrated database, `factorflow_recovery`, in the e2e PostgreSQL container, with only `PATH`, `HOME`, the database URL and the port in its environment.
     - **Start** spawns it in its own process group and waits up to 60 one-second probes for `GET /api/health` 200.
     - **Stop** sends `SIGTERM` to the group (escalating to `SIGKILL` after 10 s) and waits up to 30 s until the port refuses connections.
     - The spec loads the page from that origin, so stopping the process is what the browser sees.
   - **Derivation.**
     - The port is the next free one after the harness's 8123 to 8126.
     - The 60 one-second probes are `run-e2e-server.sh`'s acquisition readiness loop.
     - The 120 s spec timeout is `playwright.config.ts`'s `webServer.timeout`.
     - The separate database follows `run-e2e-server.sh`'s own pattern of one database per stack. It is needed because each start runs `reclaim_interrupted_sets`, which would fail a classification set the main stack is building.
     - The minimal environment follows the script's rule that no provider key is inherited (DEC-0037).
   - **Alternatives rejected.**
     - Stopping the main API on 8123: `run-e2e-server.sh` `wait`s on it, so its exit runs the trap that removes the PostgreSQL container under every later spec.
     - Simulating with `page.route` aborts, as `startup-refusal.spec.ts` does: nothing is stopped, which falls short of "stopped and restarted".
     - Adding a fourth stack to `run-e2e-server.sh`: it edits a shared script outside the story's file list, and still needs a stop mechanism.
     - Using `factorflow` as the database: the start-time reclaim interferes with the main stack.
   - **Scope.** Contained in this plan. Phase 6b's TC-E2E-009 and TC-E2E-010 automation may reuse the fixture.
   - **Owning design to absorb it:** owner-shell §7 (the *Stop and recover* row), at its next revision.
2. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0340.**
   - **What is undetermined.** DAC-E3-S8-1 requires that "the *Last answered* line carries the last success". The instant the product records (`lastAnsweredAt = new Date()` at the answer, CAP-003-E3-S2 T011) cannot be read from outside the page, so an end-to-end check needs a tolerance. No artifact gives one.
   - **What the plan adopts (T005 step 7).**
     - The displayed time is parsed independently of the product (Chicago offset from the printed zone).
     - It must lie within ±3 000 ms of the Node-side arrival time of the last `GET /api/health` 200 before the stop.
     - The comparison is at the line's one-second precision.
   - **Derivation.**
     - One second covers the display's truncation to seconds.
     - Up to two more seconds cover the gap between the page's fake clock (`page.clock.install()` with no time starts at real time) and Node's clock around a response event.
     - The 30 s fast-forward puts a wrong instant, the failure time, at least 27 s outside the window, so the tolerance never hides the mutant it exists to kill.
   - **Alternatives rejected.**
     - A format-only regex, as CAP-003-E3-S6 T019 uses: it cannot tell the last success from the failure time.
     - Pausing the page clock from load: `usePolledRead`'s first-read timing under a paused clock is not pinned by any artifact.
   - **Scope.** Contained in `unreachable-recovery.spec.ts`.
   - **Owning design to absorb it:** owner-shell §7, at its next revision.

### Other Notes

- **No production code; no TDD RED in the usual sense.** The story is `type: chore` and writes only specs and one fixture. The behaviour under test was built by CAP-003-E3-S4 to S6. Each cycle's RED evidence is therefore the T008 mutants turning its spec red, and GREEN is the spec passing on the delivered code. The `mutation:` block is `not_applicable` for generated mutants, because no production line is added.
- **Test cases routed to Phase 6b.** The coverage matrix maps this story's three criteria to TC-INT-001, TC-INT-041 and TC-INT-046 only ("3 of 3").
  - CAP-003-E3-S5's plan attributes TC-INT-042 to TC-INT-045 and TC-E2E-007 to this story, and CAP-003-E3-S6's plan adds TC-E2E-008 to TC-E2E-010. Neither attribution is backed by the matrix or by this story's scope.
  - These cases, and TC-INT-040, belong to `$automation-planning` over `tests/integration/integration-tests.md` and `tests/e2e/e2e-tests.md`. The fixture of Open Gap 1 is available to TC-E2E-009 and TC-E2E-010.
- **Two screens for the palette.** Command-palette §7 says "from two screens" and names none. `/settings` and `/data/downloads` are used because both are registered, neither has a text field focused on load, and neither is the stock target. This is test design, not a product value.
- **The text field.** T006 (c) uses the first `textbox` in `main` on `/data/followed`, the followed-stock symbol field. It is located by role because CAP-003-E7 relabels CAP-001's *Instruments* screen.
- **`Control+k`, not `ControlOrMeta`.** The story names `Ctrl+K`, and the listener accepts both modifiers (DAC-E3-10). `⌘K` is covered by CAP-003-E3-S6's unit test TC-COMP-088.
- **Research's heading is not asserted focused.** CAP-002's `/research` renders its `h1` inside its results pane, and AC-27 keeps that screen unchanged. Whether every one of its states renders an `h1` is CAP-002's, so `headingFocused` is `false` for that row only. URL, title and frame are still asserted.
- **Registered later.** `/` lands on `/setup` or `/home`, which render the not-found state until CAP-003-E4-S6 and CAP-003-E5-S5 register them (register G17). T003 (a) asserts the URL only.
- **Shared main database.** `command-palette.spec.ts` seeds `KO` (idempotent, 201 or 409), and `legacy-redirects.spec.ts` seeds one terminal run. With one worker and alphabetical file order, neither affects another spec: a terminal run takes no active-run slot, and `KO` matches no delivered spec's assertions. T003 (a) reads `most_recent_run` live, so it holds whichever specs ran first.
- **Plan checks.**
  - The Validation Plan's `click|fill|focus` grep is run against the specs as the tasks describe them. T006 (c) blurs through `page.evaluate`, `tabTo` uses `locator.evaluate`, and no task calls `.focus(`, so the grep is consistent with every task.
  - The `8127` grep in T010 matches only the fixture, because the specs import `RECOVERY_BASE_URL`.
- **Hand-written mutants** for T008. Each names the spec that kills it:
  - `web/src/app/routes.tsx`: in `RootRedirect`, the `/setup` and `/home` targets swapped → T003 (a).
  - `web/src/app/shell.tsx`: the `useFocusHeadingOnPathChange(mainRef)` call removed → T003 (`headingFocused`).
  - `web/src/app/shell.tsx`: in `Rail`, the first list's `group === "primary"` → `group === "data"` → T003 (b), (d).
  - `web/src/app/titles.ts`: the `/data/followed` and `/data/downloads` title rows swapped → T003 (c), T004 (a).
  - `web/src/app/legacy-redirects.tsx`: `` `${to}${search}` `` → `` `${to}` `` → T004 (a), (c).
  - `web/src/app/legacy-redirects.tsx`: `` `/data/downloads/${runId}${search}` `` → `` `/data/downloads${search}` `` → T004 (a).
  - `web/src/app/legacy-redirects.tsx`: `replace` removed from `KeepSearch`'s `Navigate` → T004 (b).
  - `web/src/app/unreachable-state.tsx`: `lastAnsweredAt` → `lastUpdated` → T005 step 7.
  - `web/src/app/shell.tsx`: `liveness === "unreachable"` → `liveness === "unknown"` in `MainRegion` → T005 step 6.
  - `web/src/app/health.tsx`: `window.location.reload()` added on an `unreachable` → `answering` transition → T005 step 9.
  - `web/src/app/command-palette/targets.ts`: `RESEARCH_REGISTERED ?` → `!RESEARCH_REGISTERED ?` → T006 (a).
  - `web/src/app/command-palette/use-stock-search.ts`: `STOCK_SEARCH_LIMIT = 8` → `9` → T006 (a).
  - `web/src/app/shell.tsx`: `isTextField(event.target)` → `false` → T006 (c).
  - `web/src/app/shell.tsx`: the opener's `onClick={onOpenPalette}` removed → T006 (b).
- **Equivalent-mutant risk.** None of the listed mutants is equivalent at the browser: each changes a URL, a focused element, a rendered text or a request parameter the specs read. If T008 reports a survivor, the spec is strengthened. The mutant is not dropped.
