---
artifact_schema_version: 1
artifact_id: CAP-003-E4-S6-tasks
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
  timestamp: 2026-11-07T07:10:21Z
  source_artifacts:
    - id: CAP-003-E4-S6
      version: "1"
    - id: CAP-003-E4
      version: "2"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-setup-ui-tests
      version: "1"
    - id: CAP-003-integration-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E4-S6 — Register Setup in the Shell: the /setup Route, Its Title and the SetupDraftProvider Mount

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/first-run-setup/stories/CAP-003-E4-S6.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/app/`; designs `owner-shell` and `setup-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

The owner-shell story that closes E4 (DEC-0223 answer A, carried by DEC-0227). It makes three one-line production changes to modules earlier stories create:

- **`web/src/app/routes.tsx`** (CAP-003-E3-S4) gains `const SetupScreen = lazy(() => import("../screens/setup"))` and `<Route path="/setup" element={<SetupScreen />} />`, binding CAP-003-E4-S4's default-exported `SetupScreen`. `RootRedirect`'s `/setup` target, the empty-install landing (AC-2), now reaches a registered screen.
- **`web/src/app/titles.ts`** (CAP-003-E3-S4, DEC-0329) gains the entry `{ pattern: "/setup", crumbs: [{ label: "Setup" }] }`, so the top bar reads *Setup* (AC-17; owner-shell §2.6).
- **`web/src/app/shell.tsx`** (CAP-003-E3-S6) mounts CAP-003-E4-S1's `SetupDraftProvider` (`web/src/screens/setup/draft.tsx`) inside `ShellProvider` and around the frame, so it sits outside the main region's route map. Neither a route change nor the unreachable state unmounts it (DAC-E3-14, DAC-E4-2; owner-shell §2.1 and §2.2).

Setup is not a rail destination, so `DESTINATIONS` is unchanged. The tests extend `routes.test.tsx` and `titles.test.tsx` (the route is enumerated), `shell.test.tsx` (TC-COMP-125: the drafts survive a route change and the unreachable state; TC-COMP-126: the title and the focus on the `h1`), and `tests/e2e/startup-health.spec.ts` (TC-INT-002: an empty install opens `/`, lands on `/setup` and shows setup's `h1`). The empty install comes from the acquisition stack's `resetAcquisitionStore()`, as the delivered `first-run.spec.ts` does it.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-2 | Until the first download is started the product opens on setup: `/setup` is a registered route for `RootRedirect` | T002, T007, T009 |
| AC-3 | Going back to an earlier step keeps every later value; drafts outlive route changes because the provider is above the route | T004, T006, T008 |
| AC-17 | Setup opens in the same shell, titled in the top bar | T002, T003, T005, T007, T009, T010 |
| DAC-E3-14 | `shell.tsx` mounts `SetupDraftProvider` inside `ShellProvider` and outside the main region's route map | T004, T006, T008 |
| DAC-E4-2 | `SetupDraftProvider` is mounted by the shell above the `/setup` route | T004, T006, T008 |
| DAC-E4-S6-1 | With health unreachable, the main region shows the unreachable state and recovers; the drafts are unchanged | T004, T008 |
| DAC-E4-S6-2 | At `/setup` the top bar reads *Setup*, focus lands on the screen's `h1`, and `routes.test.tsx` and `titles.test.tsx` enumerate the route | T002, T003, T005, T007, T009, T010 |
| DAC-E4-S6-3 | `startup-health.spec.ts`: an empty install opens `/`, lands on `/setup`, and setup's `h1` is visible | T006, T007, T009 |

Mapped test cases (`tests/component/setup-ui-tests.md`; `tests/integration/integration-tests.md`; `tests/coverage-matrix.md` lines 159, 236-238 and the per-story count "3 of 3" at line 417):

- **TC-COMP-125** (DAC-E4-S6-1, DAC-E3-14, AC-3): T004.
- **TC-COMP-126** (DAC-E4-S6-2, AC-17): T002, T003 and T005, plus the real-browser check in T007.
- **TC-INT-002** (DAC-E4-S6-3, AC-2, AC-21): T007. The coverage matrix places it in the integration tier (coverage note 2), and the story writes it into the delivered Playwright spec.

DAC-E4-2 is carried here for its mount clause only. Its storage and fresh-provider clauses are CAP-003-E4-S1's (TC-COMP-105).

## Phase 1: Setup

**Purpose**: Confirm the inputs. No package, configuration or directory is added.

- [ ] T001 Confirm the hard prerequisites are in the working tree before Phase 2. No file is created or edited by this task. Record the `grep -n` outputs in the first TDD cycle's evidence.
  - CAP-003-E4-S1: `web/src/screens/setup/draft.tsx` exports `SetupDraftProvider` and `useSetupDrafts`, and `useSetupDrafts()` throws an error naming `SetupDraftProvider` when no provider is above it (its T008).
  - CAP-003-E4-S4: `web/src/screens/setup/index.tsx` has `export default function SetupScreen`, renders `<h1 tabIndex={-1}>` from `SCREEN.title` (*Get set up*), and mounts no `SetupDraftProvider` (its T018).
  - CAP-003-E3-S4: `web/src/app/routes.tsx` (`AppRoutes`, `RootRedirect`, the lazy bindings), `titles.ts` (`TITLES`, `resolveTitle`, `useTitle`), `destinations.ts`, and the test files `routes.test.tsx` (shared harness with the `loaded` set and screen stubs) and `titles.test.tsx`.
  - CAP-003-E3-S6: `web/src/app/shell.tsx` (`Shell` returning `<HealthProvider><ShellProvider><Frame /></ShellProvider></HealthProvider>`, `MainRegion` with `data-liveness`, `top-bar-title`, the focus-on-path-change hook), `shell.test.tsx` (`routedFetch`, `settle()`, the screen stubs with `mounts`, and the TC-COMP-089 case), and the rewritten `tests/e2e/startup-health.spec.ts`.
  - CAP-003-E3-S2: `web/src/app/health.tsx` exports `HEALTH_POLL_INTERVAL_MS`.
  - CAP-003-E2-S5: `src/factorflow/api/app.py` includes `data_health.router`. Only T007 needs it, so the real stack serves `GET /api/attention`, which setup's step derivation reads through the shell.
  - Run `npm run test` and record the baseline as green.

**Checkpoint**: Every listed module exists with the named exports, and the suite is green before this story's first edit.

---

## Phase 2: Tests (TDD)

**Purpose**: Extend the three shell test files and the startup spec so they fail until `/setup` is registered, titled and backed by the provider.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-126, route half (*`/setup` is enumerated*), in `web/src/app/routes.test.tsx`, extending CAP-003-E3-S4's harness. Add a `// Implements TC-COMP-126 (routes.test.tsx enumerates /setup)` comment on the changed `describe`s.
  - **Harness.** Add `../screens/setup` to the stubbed screen modules, with key `setup`. As for the other ten, its factory adds `setup` to `loaded` and returns a default export rendering `<p data-testid="stub-setup">`.
  - **(a) Root redirect lands on the screen (CAP-003-E3-S4 T001 (b), extended; AC-2).** After `HEALTH_EMPTY` resolves, `location` is `/setup` and `nav-type` is `REPLACE`, as before. Now also: `findByTestId("stub-setup")` renders, and no heading `There's no page at this address.` is present. Drop that case's sentence "Nothing is asserted about `/setup`'s content", since this story owns `/setup`.
  - **(b) The route (CAP-003-E3-S4 T009 (a) table).** Add the row `/setup` → `stub-setup`, no parameter.
  - **(c) Enumeration (CAP-003-E3-S4 T009 (d)).** The independent sorted literal grows from 16 to 17 patterns with `"/setup"`. The absence check becomes `/home` and `/data` only.
  - **(d) Code splitting (CAP-003-E3-S4 T009 (e)).** `loadedAtImport` is still `toEqual(new Set())`, now with `setup` among the stubbed keys. A render of only `/settings` adds no `setup` key.
  - **(e) Not a rail destination (story Description).** `DESTINATIONS.some((d) => d.to === "/setup")` is `false`. CAP-003-E3-S4's TC-COMP-057 literal `toEqual` on `DESTINATIONS` stays unchanged and green.

  Kills:
  - swap-case on the screen binding (`/setup` rendering `SettingsScreen`): (a) and (b), whose `stub-setup` is absent.
  - a hand-written mutant that drops the `/setup` `Route`: (a), where the not-found heading renders, and (c).
  - a hand-written mutant that imports the setup screen statically in `routes.tsx`: (d).
  - a hand-written mutant that adds `{ group: "primary", label: "Setup", to: "/setup" }` to `DESTINATIONS`: (e).
- [ ] T003 [P] Implement TC-COMP-126, title half (*`/setup` is titled Setup and enumerated*), in `web/src/app/titles.test.tsx`, extending CAP-003-E3-S4's T004 and T005. Add a `// Implements TC-COMP-126 (titles.test.tsx enumerates /setup)` comment.
  - **(a) Every registered route has an entry (T004 (a)).** Unchanged code. It now also requires a `/setup` entry, because T008 adds the route. Drop the sentence that nothing is asserted about `/setup`.
  - **(b) Exact title (T004 (b)).** Add the row `/setup`, `null` → `[{ label: "Setup" }]`, an independent literal.
  - **(c) Last crumb is text (T004 (c)).** Unchanged code. It now also covers the `/setup` entry, whose only crumb has no `to`.
  - **(d) No detail slot (T004 (d)).** `resolveTitle("/setup", "X")` equals the (b) row.
  - **(e) The hook (T005 (d)).** Navigating the mounted `TitleProbe` to `/setup` reads exactly `Setup`.

  Kills:
  - swap-case on the label (`"Setup"` to `"Set up"` or `"Get set up"`): (b) and (e).
  - a hand-written mutant that writes `{ label: "Setup", to: "/setup" }`: (b) and (c).
  - a hand-written mutant that omits the entry, so `/setup` falls to `*`: (a), and (b), which reads *Page not found*.
- [ ] T004 Implement TC-COMP-125 (*Drafts survive the unreachable state and recovery*) in `web/src/app/shell.test.tsx`, extending CAP-003-E3-S6's shared conventions, with a `// Implements TC-COMP-125` comment, in `describe("SetupDraftProvider mount (DAC-E3-14, DAC-E4-2, DAC-E4-S6-1)")`.
  - **Setup stub.** Add `vi.mock("../screens/setup", async () => { const { useSetupDrafts } = await import("../screens/setup/draft"); … })`. The real `draft.tsx` is used; only the screen is stubbed. The default export:
    - counts `mounts.setup++` in a mount effect;
    - renders `<h1>Setup stub</h1>` with **no** `tabIndex`;
    - renders a test-local `DraftForm`, as CAP-003-E4-S1's T001 harness does. It has an `input` labelled `years` bound to `drafts.yearsText`; two radios labelled `paste` and `later` bound to `drafts.source`; a `textarea` labelled `pasted` bound to `drafts.pasted`; a button `keep unposted` that calls `setDraft("unposted", ["MSFT", "NVDA"])`; and `data-testid="unposted"` rendering `JSON.stringify(drafts.unposted)`.
    - Test-local labels are not owner-facing.
  - **Entering drafts.** A helper `enterDrafts(user)` types `7` into `years`, checks `paste`, types `AAPL{Enter}MSFT` into `pasted`, and clicks `keep unposted`.
  - **Checking drafts.** A helper `expectDrafts()` asserts these independent literals:
    - `years` has value `"7"`;
    - `paste` is checked and `later` is not;
    - `pasted` has value `"AAPL\nMSFT"`;
    - `unposted` text is `["MSFT","NVDA"]`.
  - **(a) A route change keeps the drafts (AC-3, DAC-E4-2).**
    - Render `<MemoryRouter initialEntries={["/setup"]}><Shell /></MemoryRouter>`, then `settle()` and `enterDrafts`.
    - Click the Settings rail link. The `settings` stub's `h1` renders, and `years` is absent.
    - Navigate back to `/setup` through the `LocationProbe`'s `navigate` ref. `mounts.setup` has risen by exactly 1, so the screen really remounted, and `expectDrafts()` passes.
  - **(b) The unreachable state and recovery keep the drafts (TC step 1; DAC-E4-S6-1).**
    - Use `vi.useFakeTimers({ shouldAdvanceTime: true })`. The `/api/health` route answers a queue: `HEALTH_OK`, then a transport failure, then `HEALTH_OK`. A queued `Error` makes `fetch` reject, which the delivered `fetchHealth` turns into `ApiUnreachableError`. If CAP-003-E3-S6's `routedFetch` queue does not yet accept an `Error` entry, extend it in this file so that it does. That is a test-helper change only.
    - Render at `/setup`, `settle()`, then `enterDrafts`.
    - `await vi.advanceTimersByTimeAsync(HEALTH_POLL_INTERVAL_MS)`, the constant imported from `./health`. `within(main).findByTestId("unreachable-state")` renders and `years` is absent: the screen unmounted.
    - Advance again. The unreachable state is gone, `mounts.setup` has risen by exactly 1, a `LocationProbe` still reads `/setup`, and `expectDrafts()` passes.
  - **(c) Non-vacuity.** In a fresh render, with a fresh provider, `years` has value `""` and `unposted` text is `[]`. This proves the values in (a) and (b) come from the kept provider, not from fixtures.
  - Unmount at the end and restore real timers.

  Kills:
  - a hand-written mutant that moves the provider into `MainRegion` around `AppRoutes` (`liveness === "unreachable" ? <UnreachableState /> : <SetupDraftProvider><AppRoutes /></SetupDraftProvider>`): (b). (a) alone would not kill it, because the main region persists across route changes. This is why both cases exist.
  - a hand-written mutant that mounts the provider inside the `/setup` route element in `routes.tsx` and removes the shell mount: (a) and (b).
  - a hand-written mutant that keys the provider on the pathname (`<SetupDraftProvider key={useLocation().pathname}>`): (a).
  - a hand-written mutant that removes the mount: every case, where `useSetupDrafts()` throws.
- [ ] T005 Implement TC-COMP-126, shell half (*`/setup` is titled Setup and focuses its `h1`*), in `web/src/app/shell.test.tsx`, with a `// Implements TC-COMP-126 (top bar and focus)` comment. It runs in sequence with T004 (one file) and reuses T004's setup stub.
  - **(a) Reached through the `/` redirect (AC-2's entry).** Render the shell at `/` with `/api/health` answering `HEALTH_OK` (`most_recent_run: null`). Then:
    - `LocationProbe` reads `/setup`;
    - `getByTestId("top-bar-title")` has text exactly `Setup` and contains no link;
    - `await waitFor` until `document.activeElement` is the stub's `h1`, which now carries `tabindex="-1"` (CAP-003-E3-S6's focus rule; DEC-0337).
  - **(b) Reached by navigation from another screen.** Render at `/settings`, `settle()`, then `navigate("/setup")`. The title reads `Setup`, and focus lands on the stub's `h1`.
  - **(c) Direct first load** (DEC-0361; Open Gap 1). Render at `/setup` and `settle()`. The title reads `Setup`, and `document.activeElement` is `document.body`: the shell-wide first-load rule applies, and the `h1` is the first content of `main`. If the owner rules the other way at confirmation, this case's expectation flips. Only the shell's focus hook changes.
  - **(d) Vocabulary.** `forbiddenTerms` (CAP-003-E3-S6 T005 (f)) over the banner's `textContent` at `/setup` is `[]`.

  Kills:
  - swap-case on the title label: (a) and (b).
  - a hand-written mutant that writes `{ label: "Setup", to: "/setup" }`: (a), "contains no link".
  - a hand-written mutant that drops the `/setup` route: (a), where the title reads *Page not found* and no stub `h1` takes focus.

### Additional Unit Tests

- [ ] T006 Write the placement check and update the startup-spec text check in `web/src/app/shell.test.tsx` (DAC-E3-14, DAC-E3-S6-3 as extended by DAC-E4-S6-3). It runs in sequence with T005 (one file).
  - **(a) Inside `ShellProvider`, outside the route map.** Read `shell.tsx` as text with `node:fs` from `import.meta.url`, as T007 of CAP-003-E3-S6 does.
    - It matches `/<ShellProvider>\s*<SetupDraftProvider>\s*<Frame \/>\s*<\/SetupDraftProvider>\s*<\/ShellProvider>/`.
    - It imports `SetupDraftProvider` from `"../screens/setup/draft"` exactly once.
    - `routes.tsx`, read the same way, does not contain `SetupDraftProvider`.
    - This pins the "inside `ShellProvider`" clause. That clause is not observable at runtime: the provider reads no shell context, so swapping the two providers would be an equivalent mutant.
  - **(b) CAP-003-E3-S6's TC-COMP-089 case (c).** Its forbidden-token list for `tests/e2e/startup-health.spec.ts` drops `Get set up`, because DAC-E4-S6-3 now requires that spec to assert setup's `h1`.
    - It keeps `liveness-state`, `run-outcome`, `status-region`, `outcome-badge`, `Needs you` and `Recent downloads`. Home and Data health stay CAP-003-E5's to add.
    - It gains a positive check: the spec contains `resetAcquisitionStore` and `/setup`.
    - Case (d), for `startup-refusal.spec.ts`, keeps the full list, including `Get set up`. Split the shared constant so that (d) is not weakened.

  Kills:
  - a hand-written mutant that moves the provider inside `<Frame />`'s main region: (a)'s regex. T004 (b) also kills it.
  - a hand-written mutant that restores `liveness-state` in the startup spec: (b).
- [ ] T007 [P] Implement TC-INT-002 (*Empty install: / lands on /setup*) in `tests/e2e/startup-health.spec.ts`, extending CAP-003-E3-S6's rewrite with a new `test.describe("empty install (TC-INT-002; DAC-E4-S6-3, DAC-E4-S6-2)")`. Its title cites TC-INT-002.
  - **Stack.** Inside the `describe`, call `test.use({ baseURL: ACQUISITION_BASE_URL })` and `test.beforeEach(resetAcquisitionStore)`, both imported from `./support/acquisition`. This is the delivered empty-install reset that `first-run.spec.ts` uses. The main stack keeps the rows that earlier specs seed, so it is never empty during a full run (Other Notes, *Empty install*).
  - **Steps.**
    - **Precondition guard.** `(await (await request.get("/api/health")).json()).most_recent_run` is `null`.
    - `await page.goto("/")`.
    - `await expect(page).toHaveURL(/\/setup$/)`.
    - `await expect(page.getByRole("heading", { level: 1, name: "Get set up" })).toBeVisible()`. The copy is CAP-003-E4-S1's `SCREEN.title`.
    - **DAC-E4-S6-2 in a real browser.** `await expect(page.getByTestId("top-bar-title")).toHaveText("Setup")`, and the same heading `toBeFocused()`, reached through the `/` redirect.
    - `getByRole("navigation", { name: "Main" })` is visible: setup opens in the same shell (AC-17).
  - **Left unchanged.** The existing main-stack test from CAP-003-E3-S6 (the frame, the URL by `most_recent_run`, the loopback probe).
  - **Not repeated here.** TC-INT-002's edge case (*health unreachable: unreachable state instead*) is `startup-refusal.spec.ts`'s TC-E2E-012 (CAP-003-E3-S6 T019).
  - The run leaves no download non-terminal. It starts none.
  - The test is RED before T008 to T010, where `/setup` renders the not-found state.

  Kills: a hand-written mutant that drops the `/setup` route, which fails the heading. A mutant that removes the provider mount fails it too: the real `SetupScreen` throws on `useSetupDrafts()` with no provider above it.

**Checkpoint**: T002–T006 exist and fail for the right reason. `/setup` is unregistered and renders not-found, `TITLES` has no `/setup` entry, and `shell.tsx` mounts no `SetupDraftProvider`, so the T004 stub throws. T007 is written and fails against the current stack, if Docker is available to show it. Every other test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The three one-line registrations. Run them in this order so the app never routes to the real `SetupScreen` without its provider.

- [ ] T008 Mount the provider first: edit `web/src/app/shell.tsx` (CAP-003-E3-S6's file; depends on T004–T006 being RED).
  - Add `import { SetupDraftProvider } from "../screens/setup/draft";`.
  - Change `Shell()` to return `<HealthProvider><ShellProvider><SetupDraftProvider><Frame /></SetupDraftProvider></ShellProvider></HealthProvider>`.
  - Replace CAP-003-E3-S6's placeholder comment in `Frame` (*CAP-003-E4-S6 adds `SetupDraftProvider` …*) with one comment on `Shell`. The comment says the provider sits inside `ShellProvider` and outside the main region's route map, so neither a route change nor the unreachable state unmounts it. It cites DAC-E3-14, DAC-E4-2, AC-3, DEC-0227 and owner-shell §2.1 and §2.2.
  - Write no length unit in the comment, because `shell.tokens.test.tsx` reads comments.
  - No other line of `shell.tsx` changes.
- [ ] T009 Edit `web/src/app/routes.tsx` (CAP-003-E3-S4's file; depends on T008 and on T002 being RED).
  - Add `const SetupScreen = lazy(() => import("../screens/setup"));` beside the other lazy bindings (owner-shell §5: code split per screen).
  - Add `<Route path="/setup" element={<SetupScreen />} />` directly after the `/` route.
  - In `AppRoutes`' doc comment, change the sentence naming the stories that register `/setup`, `/home` and `/data` so it names only CAP-003-E5-S5 and CAP-003-E6-S7, and add AC-2, AC-17 and DAC-E4-S6-2 for `/setup`.
  - The five CAP-002 `Route` lines, `RootRedirect`, `legacyRoutes` and `*` are untouched.
- [ ] T010 Edit `web/src/app/titles.ts` (CAP-003-E3-S4's file; depends on T009, which T003 (a)'s route-to-title equality needs; T003 RED).
  - Add `{ pattern: "/setup", crumbs: [{ label: "Setup" }] }` after the `"/"` entry, keeping `"*"` last.
  - In the module comment, mark CAP-003-E4-S6's `/setup` *Setup* entry as added.

**Checkpoint**: `npx vitest run src/app/routes.test.tsx src/app/titles.test.tsx src/app/shell.test.tsx` is green, and `npx tsc --noEmit` is clean.

---

## Phase 4: Integration

**Purpose**: Keep the rest of the shell suite green now that `/` can reach the real setup screen, and confirm the change set.

- [ ] T011 Run `npm run test` (depends on T008–T010). With `/setup` registered, a delivered or sibling test that renders `<Shell />` at `/` and lets health answer `most_recent_run: null` now lazily loads the real `SetupScreen`. That screen issues `GET /api/settings/history-depth` and `GET /api/instruments` against the test's `fetch` stub.
  - The candidates are CAP-003-E3-S6's `shell.layout.test.tsx` (its `/` cases), `shell.a11y.test.tsx` and `shell.unreachable.test.tsx`.
  - A file that fails, or prints a React `act` warning, only because the real setup screen mounted gets one change: the same `vi.mock("../screens/setup", …)` stub convention T004 uses, in its plain form (the `h1` and `mounts.setup`, without the `DraftForm`). Nothing else changes.
  - No assertion is removed or weakened. List each edited file in the cycle's TDD evidence.
  - Any other failure is a defect in T008–T010 and is fixed there.
- [ ] T012 Confirm scope (depends on T011).
  - `git status --short` lists only:
    - `web/src/app/shell.tsx`, `routes.tsx`, `titles.ts`, `shell.test.tsx`, `routes.test.tsx` and `titles.test.tsx`;
    - any T011 stub additions;
    - `tests/e2e/startup-health.spec.ts`;
    - this story's `-tasks.md`, `-tdd-evidence.yaml` and status line.
  - `git diff --exit-code -- web/src/app/destinations.ts web/src/main.tsx web/src/screens/ web/src/api/ web/src/components/ web/src/app/health.tsx web/src/app/shell-context.tsx web/src/app/layout.ts web/src/app/legacy-redirects.tsx web/src/app/not-found.tsx package.json package-lock.json src/` exits 0. In particular, `DESTINATIONS` is unchanged (story Description) and no setup-ui file is edited (DEC-0211).
  - `git diff -U0 -- web/src/app/shell.tsx` shows only the import, the `Shell` return lines and the comment.
  - `git diff -U0 -- web/src/app/routes.tsx` shows only the binding, the `Route` and the doc-comment lines.

**Checkpoint**: The diff is exactly the story's files. `/` on an empty install reaches the real setup screen in the shell, with its drafts held above the route.

---

## Phase 5: Polish

**Purpose**: Validation, formatting and the TDD evidence.

- [ ] T013 Run `npm run format`, which is a check. Fix any report with `npx biome format --write` on this story's files only. Then run:
  - `npm run lint`;
  - `npx tsc --noEmit` and `npx tsc --noEmit -p tsconfig.e2e.json`, for the spec;
  - `npm run build`, after which `build-output.test.tsx` stays green and unchanged;
  - `npm run test`;
  - `npm run test:e2e -- tests/e2e/startup-health.spec.ts`. This needs Docker (`factorflow-e2e-postgres`) and `npx playwright install`. The Bash sandbox blocks Docker, so it may need the sandbox disabled. If either is unavailable, report the exclusion and never call a partial run green;
  - the mutation command in the Validation Plan, with the hand-written mutants in Other Notes.

  No behaviour change.
- [ ] T014 After each TDD cycle in T002–T013 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E4-S6-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence;
    - the structured `mutation:` block `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  - **(1) The registration.** T002–T006 RED, then T008–T010 GREEN, plus T011.
    - The three edits form one behaviour and are not split. The title-table equality ties `titles.ts` to `routes.tsx`, and a route to the real screen without the provider would crash the app between cycles.
  - **(2) The startup spec.** T007.
    - This cycle is test-only, with `mutation: {not_applicable: "test-only change"}`.
    - Its RED is the run against the stack before cycle 1, recorded only if Docker was available then. Otherwise record the GREEN run and that exclusion.

  T012 and T013 add no behaviour and join cycle 2's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E4-S5 | reverse | Its first-run journey (`tests/e2e/setup-first-run.spec.ts`) drives `/setup`, which this story registers. Graph: `CAP-003-E4-S5: [CAP-003-E4-S6, …]` (DEC-0227: "an e2e spec asserts only routes registered at its story") |
| CAP-003-E5-S5 | context | Registers `/home` and adds *Home* to `titles.ts` and `DESTINATIONS` in the same files, the same way. It also adds owner-shell §2.10's latest-outcome assertion to `startup-health.spec.ts`, which T006 (b) keeps forbidden until then. Nothing is imported either way |
| CAP-003-E6-S7 | context | Registers `/data` and its title in the same files. Nothing is imported either way |
| CAP-003-E4-S2 | context | Its step list, step card and steps 1 and 2 render inside the real `SetupScreen` that T007 opens. They are reached through CAP-003-E4-S4's graph edge (`CAP-003-E4-S4: [CAP-003-E4-S1, CAP-003-E4-S2, …]`), and this story imports none of them |
| CAP-003-E3-S2 | context | T004 imports `HEALTH_POLL_INTERVAL_MS` from `web/src/app/health.tsx` in a test. It is reached through the CAP-003-E3-S6 edge, whose graph line lists CAP-003-E3-S2 |

No new hard edge was found. Every module this plan imports or edits is created by a story already on this story's graph line `CAP-003-E4-S6: [CAP-003-E4-S4, CAP-003-E4-S1, CAP-003-E3-S4, CAP-003-E3-S6, CAP-003-E2-S5]`:

- `draft.tsx` comes from CAP-003-E4-S1.
- `screens/setup/index.tsx` comes from CAP-003-E4-S4.
- `routes.tsx`, `titles.ts`, `destinations.ts` and their tests come from CAP-003-E3-S4.
- `shell.tsx`, `shell.test.tsx` and the rewritten `startup-health.spec.ts` come from CAP-003-E3-S6.
- The data-health router on the real stack comes from CAP-003-E2-S5.

### Task Dependencies

- T001 comes first.
- T002 (`routes.test.tsx`), T003 (`titles.test.tsx`) and T007 (`startup-health.spec.ts`) touch different files and can be written in parallel with each other and with T004.
- T004, T005 and T006 share `shell.test.tsx` and run in sequence.
- T008 depends on T004–T006 being RED. T009 depends on T008 and on T002 being RED. T010 depends on T009 and on T003 being RED.
- T011 depends on T008–T010. T012 depends on T011. T013 depends on T012.
- T014 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- **Phase 2:** T002, T003, T007 and the T004–T006 chain.
- **Phase 3:** none. The three edits are ordered so that the app never routes to an unprovided screen.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`; for the spec also `npx tsc --noEmit -p tsconfig.e2e.json`
- End to end: `npm run test:e2e -- tests/e2e/startup-health.spec.ts`. This needs Docker and `npx playwright install`. Report any exclusion.

No Python file changes, so `uv run pytest`, `ruff` and `mypy` are not required.

### Story-Specific Validation

- **AC-2, DAC-E4-S6-3:** T002 (a) and T007 are green.
  - By hand on the built app against an empty store, `/` lands on `/setup`, and *Get set up* is the focused `h1` inside the shell.
- **AC-3, DAC-E3-14, DAC-E4-2, DAC-E4-S6-1:** T004 and T006 (a) are green.
  - `grep -nE "localStorage|sessionStorage" web/src/app/shell.tsx web/src/app/routes.tsx web/src/app/titles.ts` prints nothing.
- **AC-17, DAC-E4-S6-2:** T002, T003, T005 and T007's title and focus checks are green.
- **Setup not a rail destination:** `git diff --exit-code -- web/src/app/destinations.ts` exits 0, and T002 (e) is green.
- **AC-26:** `grep -nE '[0-9]+(px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b' web/src/app/shell.tsx web/src/app/routes.tsx web/src/app/titles.ts` prints nothing. CAP-003-E3-S6's widened `token-literals.test.ts` and the unchanged `shell.tokens.test.tsx` stay green.
- **Mutation:** run `python3 scripts/mutation-run.py run --command "npx vitest run web/src/app/routes.test.tsx web/src/app/titles.test.tsx web/src/app/shell.test.tsx && npx tsc --noEmit"`. It runs over this story's changed lines in `web/src/app/shell.tsx`, `routes.tsx` and `titles.ts`, plus the hand-written mutants in Other Notes, and must leave no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **Who mounts `SetupDraftProvider`.**
   - **The conflict.** Epic CAP-003-E3 AC-3 says *"This EPIC mounts `setup-ui`'s `SetupDraftProvider` above the `/setup` route"*. This story, an E4 story, delivers that clause together with DAC-E3-14.
   - **Governing: DEC-0227 (applied, owner upheld), which carries DEC-0223's owner decision, answer A.** The decision places the mount with the `/setup` registration in this story. The required behaviour is identical under both allocations: the provider sits inside `ShellProvider`, outside the main region's route map, above `/setup`. Only the epic that delivers it differs.
   - **Outcome.** The code follows owner-shell §2.1 and §2.2. The epic text is stale, and moves the clause to E4 at its next edit, as the story Description records (backlog review v3 FINDING-2).
2. **TC-COMP-126 places the title and focus checks in `routes.test.tsx` and `titles.test.tsx`, while CAP-003-E3-S4's harness stubs every screen and renders no top bar.**
   - **Governing: DAC-E4-S6-2 and the story's file list**, which name `shell.test.tsx` among the extended files, over the test specification's step layout.
   - **Outcome.** Enumeration lives in the two route files (T002, T003). The top bar and focus are read through `<Shell />` (T005) and on the real stack (T007).
3. **`startup-health.spec.ts`'s content per owner-shell §2.10** (*"… and that Home's data tile or Data health's Recent downloads shows the latest outcome"*) **against DAC-E4-S6-3** (setup's landing only).
   - **Governing: the story criterion**, as CAP-003-E3-S6's Resolved Conflict 5 also ruled.
   - **Outcome.** T007 adds only the empty-install landing. The latest-outcome assertion stays with CAP-003-E5, so T006 (b) keeps `Needs you` and `Recent downloads` forbidden.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0361.**
   - **What is undetermined.** DAC-E4-S6-2 says that when `/setup` is "visited", focus lands on the screen's `h1`. TC-COMP-126's precondition is "Shell at `/setup`". Owner-shell §2.7 moves focus "on route change". No artifact says whether a direct first load of `/setup` (a typed URL or a reload) counts as a visit that moves focus. CAP-003-E3-S6's shell-wide rule, DEC-0337 (itself provisional), does not move focus on first load.
   - **What the plan adopts (T005, T007).** "Visited" means reached by a route change:
     - the `/` redirect, which is how an empty install opens setup (AC-2);
     - in-app navigation: links, the palette, Back.

     Focus lands on the `h1` in both cases. On a direct first load, the shell-wide rule applies and focus stays at the document start, where the `h1` is the first content of `main`. Nothing setup-specific is added to the shell's focus hook. The screen does not focus itself: CAP-003-E4-S4 keeps `focus()` to CAP-003-E4-S2's step hook.
   - **Derivation.**
     - Owner-shell §2.7, the normative design, scopes the focus move to a route change.
     - The owner's real entry to setup is the `/` redirect. That is a path change after the first render, so the AC is met on the path AC-2 describes.
     - A setup-only exception would split one shell rule into two, and contradict the sibling plan's first-load rule. That rule follows UX design §0.6, which avoids skipping the page's natural start on load.
   - **Alternatives rejected.**
     - Focus on every first load: this changes CAP-003-E3-S6's shell-wide rule and its T008 (d) test, for every screen.
     - A `SetupScreen` self-focus on mount: CAP-003-E4-S4 T013 (b) forbids it, and it would fire on every remount after the unreachable state.
     - A `/setup`-only shell exception: a special case with no artifact behind it.
   - **Scope.** Contained in this plan's tests. It reads CAP-003-E3-S6's rule and changes no other story's code.
   - **Owning design to absorb it:** owner-shell §2.7 and UX design §0.6, at their next revision.

### Other Notes

- **Empty install on the real stack.** The main stack at 8123 has no reset. `cancel-run.spec.ts` and `run-detail.spec.ts` seed runs into it with `sql()`, and the suite runs on one worker in file order. So `most_recent_run` is not null by the time `startup-health.spec.ts` runs, and CAP-003-E3-S6's conditional URL assertion would only ever take the `/home` branch.
  - The delivered precedent for an empty install is the acquisition stack's `resetAcquisitionStore()` (`tests/e2e/support/acquisition.ts`; `first-run.spec.ts` calls it in `beforeEach`). That stack serves the same `create_app` and the built bundle. T007 follows it, with a precondition guard on `most_recent_run`.
  - This is local precedent (constraint 9, step 5), not a new contract. The register's §4 *E2E harness facts* names the same reset.
- **The stub keeps the test about the shell.** TC-COMP-125 proves where the shell mounts the provider, not how setup's steps bind their drafts, which is CAP-003-E4-S2 to CAP-003-E4-S4's. So T004 stubs the screen and keeps the real `draft.tsx`. The real screen under the real provider is exercised by T007 and, with drafts, by CAP-003-E4-S5's journey.
- **The real screen throws without the provider.** CAP-003-E4-S4 T013 (f) makes `SetupScreen` throw without a `SetupDraftProvider`. So the provider mount (T008) lands before the route (T009), and both are in one cycle (T014). Otherwise `/` on an empty install would hit a render error between edits.
- **Edits to sibling plans' files.**
  - `routes.tsx`, `titles.ts`, `routes.test.tsx` and `titles.test.tsx` are CAP-003-E3-S4's, which named this story as the one that adds the `/setup` route, title and test rows.
  - `shell.tsx`, `shell.test.tsx` and `startup-health.spec.ts` are CAP-003-E3-S6's, which named this story as the one that mounts the provider and extends the spec.
  - Each scope check those plans ran is a check at their own time and is not re-run here: CAP-003-E3-S6 T020 *"no setup imports"*, CAP-003-E3-S4 T015's absence greps, and CAP-003-E4-S1 T011's *"no importer outside `screens/setup`"*. After this story, `shell.tsx` imports `screens/setup/draft` and `routes.tsx` lazily imports `screens/setup`, as owner-shell §2.1 and §2.6 require.
- **Owner-facing copy.** The title *Setup* is owner-shell §2.6's. The landing `h1` *Get set up* is rendered from CAP-003-E4-S1's `copy.ts`. This story writes no new owner-facing string.
- **Plan checks.**
  - T006 (a)'s regex reads `shell.tsx` structure and allows Biome's line breaks (`\s*`).
  - The AC-26 grep reads only this story's three changed sources, which write no length.
  - T006 (b) keeps `Get set up` forbidden in `startup-refusal.spec.ts`, so no plan check forbids what T007 requires.
- **Hand-written mutants** for the mutation run:
  - `web/src/app/shell.tsx`: `<SetupDraftProvider><Frame /></SetupDraftProvider>` → `<Frame />`, with `MainRegion`'s `<AppRoutes />` → `<SetupDraftProvider><AppRoutes /></SetupDraftProvider>`. Killed by T004 (b).
  - `web/src/app/shell.tsx`: `<SetupDraftProvider>` → `<SetupDraftProvider key={useLocation().pathname}>`. Killed by T004 (a).
  - `web/src/app/routes.tsx`: `<Route path="/setup" element={<SetupScreen />} />` → `<Route path="/setup" element={<SettingsScreen />} />`. Killed by T002 (a) and (b).
  - `web/src/app/routes.tsx`: `const SetupScreen = lazy(() => import("../screens/setup"));` → `import SetupScreen from "../screens/setup";`. Killed by T002 (d).
  - `web/src/app/titles.ts`: `{ label: "Setup" }` → `{ label: "Setup", to: "/setup" }`. Killed by T003 (b) and (c), and T005 (a).
  - `web/src/app/destinations.ts` (scratch only, never committed): an added Setup entry. Killed by T002 (e).
- **Equivalent-mutant risk.** Swapping `ShellProvider` and `SetupDraftProvider` nesting cannot be observed at runtime, because the provider reads no shell context. T006 (a) pins it by source. Record the runtime mutant as equivalent if the generator produces it.
