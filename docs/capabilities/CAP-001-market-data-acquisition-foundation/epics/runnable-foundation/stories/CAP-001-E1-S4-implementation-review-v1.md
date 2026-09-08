---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-08
updated: 2026-09-08
story_id: "CAP-001-E1-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-08T22:56:12Z"
reviewed_head: "d9a8da850fcf831c7561fa4992e693b0cb85d1b4"
review_base: "1f7d3d9b3a112cd8911782423d6f9e76b3532a53"
reviewed_state_revision: "sha256:ac7af701685f00b1475986901a47019078c4eb9569c43ad13f4eee35f9e6551a"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E1-S4
    artifact_version: 1
    content_revision: sha256:8e6cc9b76c3e50cc5fb6462a5a12c75b19440080b49af7e9938851fa68343368
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-08T22:56:12Z
  source_artifacts:
    - id: CAP-001-E1-S4
      version: "1"
    - id: CAP-001-E1-S4-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 3 |
| Low findings | 3 |
| Acceptance criteria | 7/8 satisfied |
| Planned tasks | 22/24 verified |
| Required validation | 6/6 passed |

The shell itself is well built. All six required validation commands pass from a
clean tree, all twelve unit tests are green, the four destinations render in the
required order with the exact product vocabulary, `aria-current="page"` is
correctly exposed, an unknown route renders inside the frame, and every spacing
and type utility in `shell.tsx` resolves to a `theme.css` custom property —
verified in the built CSS, not merely asserted in a test.

The gate fails on two HIGH findings, both concerning DAC-E1-S4-6 — the one
criterion that reaches outside the frontend.

First, `npm run build` is destructive to a tracked file belonging to another
story. `vite.config.ts` sets `emptyOutDir: true` on an `outDir` that lies outside
the Vite root, so the build wipes `src/factorflow/api/static/` including the
tracked `.gitkeep` that CAP-001-E1-S6 added. This was reproduced live during this
review: after `npm run build` the working tree showed
`D src/factorflow/api/static/.gitkeep`. Because `.gitignore` ignores
`src/factorflow/api/static/*` and re-includes only `.gitkeep`, that file is the
sole thing keeping the directory in version control. If the deletion is ever
committed, a fresh clone has no `static/` directory, `app.py`'s
`if _STATIC_DIR.exists():` guard is false, and the `StaticFiles` mount
CAP-001-E1-S6 delivered and defended across four review rounds silently never
registers. Per review constraint 10 the deletion was left in place rather than
restored, and no further mutation-producing validation was run after it.

Second, TC-COMP-334 — a P1 mandatory component test the coverage matrix maps to
DAC-E1-S4-6 — has no implementation. The task plan's Phase 4 checkpoint states
"All eight mandatory TC-IDs (TC-COMP-014, 303, 329–334) are green," but only
seven exist as tests. T021 is a one-off manual build observation, which is not a
test and re-verifies nothing on any later change. That absence is precisely why
the `emptyOutDir` defect reached review undetected.

DAC-E1-S4-6 is therefore recorded PARTIAL: the build output does land in the
right directory, but the mechanism that puts it there damages the contract the
criterion exists to protect, and no test guards it.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S4-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S4` |
| HEAD | `d9a8da850fcf831c7561fa4992e693b0cb85d1b4` |
| Review base | `main` / `origin/main` merge-base `1f7d3d9b3a112cd8911782423d6f9e76b3532a53` (both resolve identically) |
| Working tree | Clean at review start: no staged, unstaged, or untracked non-ignored files. One tracked deletion appeared during validation — see Validation Side Effects |
| Changed files reviewed | 21 |

One commit separates the base from `HEAD`:
`d9a8da8 feat(CAP-001-E1-S4): application shell, navigation rail and routing`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `package.json` | added | T001 |
| `package-lock.json` | added | T001 (lockfile for `npm ci`; tech-stack v2 records versions captured from the first lockfile) |
| `vite.config.ts` | added | T002; DAC-E1-S4-6 |
| `vitest.config.ts` | added | T007 |
| `tsconfig.json` | added | T005 |
| `tailwind.config.js` | added | T006; DAC-E1-S4-3 |
| `postcss.config.js` | added | T006 (Tailwind requires a PostCSS entry point; unnamed by the plan but necessary for T006 to take effect — justified) |
| `biome.json` | added | T001 (`npm run lint` / `npm run format` are unrunnable without it — justified) |
| `web/index.html` | added | T003 |
| `web/src/main.tsx` | added | T004 |
| `web/src/index.css` | added | T006, T019 (imports `design-system/theme.css` and the Tailwind layers — the mechanism by which the shell's utilities resolve to tokens; justified) |
| `web/src/test-setup.ts` | added | T007 (`@testing-library/jest-dom` matchers used by every test — justified) |
| `web/src/app/shell.tsx` | added | T017, T019, T020; AC-14, DAC-E1-12, DAC-E1-S4-1/3/4 |
| `web/src/app/routes.tsx` | added | T018; DAC-E1-12, DAC-E1-S4-2, DAC-E1-S4-5 |
| `web/src/app/status-region.tsx` | added | T008 |
| `web/src/app/shell.test.tsx` | added | T009, T010 (TC-COMP-014 partial, 303, 329) |
| `web/src/app/routes.test.tsx` | added | T011, T014, T016 (TC-COMP-330, 333) |
| `web/src/app/shell.a11y.test.tsx` | added | T013 (TC-COMP-332) |
| `web/src/app/shell.layout.test.tsx` | added | T015 |
| `web/src/app/shell.tokens.test.tsx` | added | T012 (TC-COMP-331) |
| `CAP-001-E1-S4-tasks.md` | modified | Task checkbox bookkeeping (T001–T024) |
| `CAP-001-E1-S4.md` | modified | `status: planning` → `in-review`; `updated` date |

No unjustified file appears in the change set. `postcss.config.js`, `biome.json`,
`web/src/index.css` and `web/src/test-setup.ts` are not named by any task, but
each is load-bearing for a task that is named (T006, T001, T019, T007
respectively) and none introduces behavior beyond it.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-14 | SATISFIED | `web/src/app/shell.tsx:28-45` — the rendered tree contains only a `nav` of four `NavLink`s, a status-region slot and a `main`. No sign-in, user menu, or account element exists anywhere in the change set (confirmed by reading every rendered component: `shell.tsx`, `routes.tsx`, `status-region.tsx`) | `shell.test.tsx:10-28` "renders no element matching sign-in, account, or user-menu semantics" | Satisfied by inspection of the complete rendered tree, which is small enough to enumerate exhaustively. The test itself is narrower than the criterion — see IR-003 |
| DAC-E1-12 | SATISFIED | `shell.tsx:10-15` `DESTINATIONS` is a fixed four-element `as const` array in the required order; `routes.tsx:26-34` declares `/runs/:runId` as a URL child of `/runs`, and no fifth `NavLink` exists | `shell.test.tsx:34-51` asserts exactly four links and their exact text sequence; `routes.test.tsx:13-26` asserts the count stays four at `/runs/run-123` | The rail is generated from a single ordered constant, so order cannot drift between destinations and routes independently |
| DAC-E1-S4-1 | SATISFIED | `shell.tsx:11-14` labels are the literals `Coverage`, `Instruments`, `Runs`, `Settings` | `shell.test.tsx:45-50` exact-sequence assertion; `shell.test.tsx:53-65` asserts the rail text contains none of "Jobs", "Sync", "Import" | Both halves of STD-UI-1's requirement — the right words present, the forbidden synonyms absent — are covered |
| DAC-E1-S4-2 | SATISFIED | `routes.tsx:31` `<Route path="/runs/:runId" .../>`; `shell.tsx:34` `NavLink to="/runs"` without `end`, so React Router's partial match keeps `aria-current="page"` on Runs for any `/runs/*` path | `routes.test.tsx:13-26` navigates to `/runs/run-123`, asserts the Runs anchor carries `aria-current="page"` and that the rail still holds exactly four links | The route is a flat declaration rather than a nested `<Route>` with an `Outlet`. This is a justified deviation: ux-design §1.5 specifies run detail as a full-screen replacement (summary region plus full-height table), not content nested inside a Runs layout. The criterion's observable requirements — child URL, Runs stays active, no fifth destination — all hold |
| DAC-E1-S4-3 | SATISFIED | `shell.tsx:30-43` uses only `w-7`, `p-5`, `p-3`, `gap-2`, `text-base`; `tailwind.config.js:13-33` maps every one of those scales to a `theme.css` custom property. Verified in the compiled output rather than by inspection alone: the built CSS contains `.w-7{width:var(--space-7)}`, `.p-5{padding:var(--space-5)}`, `.p-3{padding:var(--space-3)}`, `.gap-2{gap:var(--space-2)}`, `.text-base{font-size:var(--text-base)}` — no literal length is emitted | `shell.tokens.test.tsx:18-26` static scan of `shell.tsx` for any `px`/`rem`/`em` literal | Independent confirmation via the build output is stronger than the test, which only proves the absence of a literal in one file. See IR-005 for the test's own limits |
| DAC-E1-S4-4 | SATISFIED | `shell.tsx:34` renders each destination as a `NavLink`, which emits an `<a href>` — natively focusable, in natural document order, keyboard-activatable, with `aria-current="page"` supplied by React Router on the active match. No `outline` suppression appears anywhere in the change set, so STD-UI-24's "visible focus MUST NOT be suppressed" holds | `shell.a11y.test.tsx:11-27` tabs four times and asserts focus lands on each link in DOM order; `shell.a11y.test.tsx:29-42` asserts `aria-current="page"` on the active destination and its absence on an inactive one | The negative half (an inactive item must *not* carry `aria-current`) is asserted, which is what makes this test regression-sensitive rather than trivially true |
| DAC-E1-S4-5 | SATISFIED | `routes.tsx:33` `<Route path="*" element={<NotFound />} />`, declared inside `AppRoutes`, which `shell.tsx:42` renders inside `<main>` — so the catch-all is structurally inside the frame and cannot escape it | `routes.test.tsx:33-45` navigates to `/this-route-does-not-exist` and asserts the nav, the status region, and a `/not found/i` match inside `role="main"` are all present | The test asserts frame *and* content, so it fails both if the shell disappears and if the not-found state does. The state itself is a bare `<p>Not found</p>` — see IR-007 |
| DAC-E1-S4-6 | PARTIAL | `vite.config.ts:10-13` sets `outDir: "../src/factorflow/api/static"`. `npm run build` was run independently and did place `index.html` and `assets/` there | None — TC-COMP-334 is not implemented (IR-002) | The output lands in the right place, but `emptyOutDir: true` deletes the tracked `.gitkeep` that keeps the directory under version control, breaking CAP-001-E1-S6's mount guard for any fresh clone (IR-001). No test guards either half of the criterion |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `package.json:6-12` defines `build`, `test`, `test:e2e`, `lint`, `format` exactly as the tech-stack validation table names them; `:13-33` carries every dependency the task lists | `npm ci` exits 0 against the committed lockfile. `test:e2e` is defined but not runnable — see IR-006 |
| T002 | complete | VERIFIED | `vite.config.ts:8-13` `root: "web"`, `outDir: "../src/factorflow/api/static"` | The path is correct. `emptyOutDir: true` is an addition beyond the task text and is the defect in IR-001 |
| T003 | complete | VERIFIED | `web/index.html:10` `<script type="module" src="/src/main.tsx">` | Resolves correctly under `root: "web"`; proven by the successful build |
| T004 | complete | VERIFIED | `web/src/main.tsx:12-18` mounts the React root and renders `<Shell />` inside `BrowserRouter` | Guards a missing `#root` explicitly (`:7-10`) rather than a non-null assertion — better than the task required |
| T005 | complete | VERIFIED | `tsconfig.json` targets ES2022 with `strict: true`, `include: ["web/src"]`, TypeScript `^5.6.2` per `package.json:31` | `npx tsc --noEmit` exits 0. `noUnusedLocals`/`noUnusedParameters` also enabled |
| T006 | complete | VERIFIED | `tailwind.config.js:13-33` maps `spacing`, `fontSize`, `height` and three colours to `var(--*)` properties with no literal; `web/src/index.css:4` imports `design-system/theme.css` | `postcss.config.js` is the unnamed but necessary wiring. Confirmed effective in the built CSS |
| T007 | complete | VERIFIED | `vitest.config.ts:6-11` `root: "web"`, `environment: "jsdom"`, `setupFiles: ["./src/test-setup.ts"]` | `npm run test` collects and runs all five files |
| T008 | complete | VERIFIED | `web/src/app/status-region.tsx:9-11` exports a no-op `StatusRegion` carrying `data-testid="status-region"` | Correctly scoped to a slot; carries a comment naming CAP-001-E1-S5 as the owner of the real implementation |
| T009 | complete | VERIFIED | `web/src/app/shell.test.tsx:9-29` | Implemented as specified. Its assertion strength is a separate MEDIUM concern (IR-003), not a completion failure |
| T010 | complete | VERIFIED | `web/src/app/shell.test.tsx:33-65` | Both the exact-order assertion and the forbidden-vocabulary assertion are present |
| T011 | complete | VERIFIED | `web/src/app/routes.test.tsx:12-27` | Asserts both required facts: Runs keeps `aria-current`, and no fifth rail item appears |
| T012 | complete | VERIFIED | `web/src/app/shell.tokens.test.tsx:17-26` | Implemented in the dedicated file the task permitted. Scan scope is narrower than the task's wording — IR-005 |
| T013 | complete | VERIFIED | `web/src/app/shell.a11y.test.tsx:10-42` | Covers both halves — traversal order and the announced active state, positive and negative |
| T014 | complete | VERIFIED | `web/src/app/routes.test.tsx:32-46` | Asserts the frame survives and the not-found content is inside `role="main"` |
| T015 | complete | VERIFIED | `web/src/app/shell.layout.test.tsx:9-51` | Three structural assertions: rail contains nav and status region, main is a sibling not a child, status region is the rail's last element child |
| T016 | complete | VERIFIED | `web/src/app/routes.test.tsx:50-65` | Reads `routes.tsx` and asserts the five story-owned paths exactly. A source-text scan rather than a route-tree inspection — IR-008 |
| T017 | complete | VERIFIED | `web/src/app/shell.tsx:28-45` | Rail at `w-7` (`--space-7`), main at `p-5` (`--space-5`), status-region slot as the rail's last child, four destinations, no fifth, no auth element |
| T018 | complete | VERIFIED | `web/src/app/routes.tsx:24-35` | Four destinations, the run-detail child path, a `/` redirect to `/coverage`, and a `*` catch-all rendering inside `main` |
| T019 | complete | VERIFIED | `shell.tsx:30-43` carries no literal length; every utility resolves through `tailwind.config.js` to a `theme.css` property, confirmed in the compiled CSS | Fully achieved |
| T020 | complete | VERIFIED | `shell.tsx:34` `NavLink` yields a focusable `<a>` in natural order with React Router's `aria-current="page"` on the active match | Achieved through the library's ARIA state, exactly as the task's parenthetical permitted |
| T021 | complete | PARTIAL | `npm run build` does place output under `src/factorflow/api/static/` — reproduced independently | The task's own words are "verify the output lands under `src/factorflow/api/static/` … confirming DAC-E1-S4-6 and **the assumption CAP-001-E1-S6's static-file mount depends on**". The second clause is unmet: the build breaks that assumption by deleting the `.gitkeep` the mount's `exists()` guard depends on. IR-001 |
| T022 | complete | VERIFIED | `npm run test` — 5 files, 12 tests, all passing, rerun independently at `HEAD` | The rendered structure matches ux-design §0's layout contract on every value it states |
| T023 | complete | PARTIAL | `shell.tsx` is clean of hardcoded values, verified in the built CSS | The task also requires reviewing "any Tailwind utility class that bypasses the configured token scale". `w-7` is 48px (`--space-7`), which is what ux-design §0 literally specifies, so the implementation is faithful — but that width cannot contain the visible text labels `Instruments` or `Settings` that DAC-E1-S4-1 requires. A review of the token application against the rendered result would have surfaced the conflict between two requirements the design states. IR-004 |
| T024 | complete | VERIFIED | All six commands in the Validation Plan were rerun independently and all six exit 0 | The claim is accurate as far as the six commands go. The Phase 4 checkpoint's separate claim that "all eight mandatory TC-IDs are green" is not — IR-002 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `shell.test.tsx` "renders no element matching sign-in, account, or user-menu semantics" / TC-COMP-014 (partial), TC-COMP-303 | WEAK | Renders the shell and scans every `button` and `link` role for text or `aria-label` matching `/sign.?in\|log.?in\|account\|user.?menu\|profile/i`, plus a test-id query. Deterministic, isolated, no network or timing dependence. | The scan is confined to two interactive roles. A plausible regression — an "Account" heading, a `<div>Signed in as owner</div>`, a `role="menu"` user menu, or an avatar `<img alt="Profile">` — passes unchallenged. AC-14's own wording is "contains **no** sign-in, no user menu and no account area", which is a whole-tree claim. Scanning `container.textContent` and the full accessibility tree would match the criterion. IR-003 |
| `shell.test.tsx` "renders exactly four navigation items in order with exact labels" / TC-COMP-303, TC-COMP-329 | ADEQUATE | Scopes to `role="navigation"`, asserts `toHaveLength(4)` and an exact ordered array of the four label strings. A fifth destination, a reorder, a rename, or a missing item each fail it. | None. |
| `shell.test.tsx` "uses no generic or forbidden vocabulary in place of product terms" / TC-COMP-329 | ADEQUATE | Asserts the rail's text contains none of "Jobs", "Sync", "Import" — the three synonyms DAC-E1-S4-1 names explicitly. | Case-sensitive, so a lowercase "jobs" would slip through. Minor; the criterion names the capitalised product-vocabulary forms. |
| `routes.test.tsx` "keeps Runs active and adds no fifth rail item when a run detail route opens" / TC-COMP-330 | ADEQUATE | Renders at `/runs/run-123` and asserts both halves of DAC-E1-S4-2 — the Runs anchor carries `aria-current="page"`, and the rail still holds exactly four links. Adding `end` to the Runs `NavLink` (the most plausible regression) removes `aria-current` at that path and fails this test. | None. |
| `routes.test.tsx` "renders a not-found state in the main region while keeping the shell frame" / TC-COMP-333 | ADEQUATE | Renders at an undefined path and asserts three things: the nav survives, the status region survives, and `/not found/i` appears **within** `role="main"`. The `within(main)` scoping is what makes it meaningful — a not-found state rendered outside the frame would fail. | None. |
| `routes.test.tsx` "routes.tsx defines four destination routes plus one run-detail child route" | WEAK | Reads `routes.tsx` as text, regex-extracts `path="…"` values, filters out `/` and `*`, and asserts the remaining five sorted paths. | It asserts against the source string, not the route tree. It cannot distinguish a `<Route>` that is actually mounted from one commented out or unreachable, and it would break on a legitimate refactor to an object-based route config while the behavior is unchanged. Rendering each path and asserting what appears would test the same claim through behavior. IR-008 |
| `shell.a11y.test.tsx` "tabs through all four rail destinations in order" / TC-COMP-332 | ADEQUATE | Uses real `userEvent.setup()` and four sequential `user.tab()` calls, asserting focus lands on each link in DOM order. Making any destination non-focusable (a `<div>` with a click handler, or `tabIndex={-1}`) breaks it. | Does not assert that focus starts outside the rail or that nothing focusable is interposed, so it proves relative order among the four rather than absolute tab position. Acceptable for the criterion as written. |
| `shell.a11y.test.tsx` "exposes the active destination via aria-current" / TC-COMP-332 | ADEQUATE | Asserts `aria-current="page"` on the active destination **and** its absence on an inactive one. The negative half is what prevents the test passing if `aria-current` were applied unconditionally to every link. | None. |
| `shell.layout.test.tsx` (3 tests) — T015 additional | ADEQUATE | Asserts the rail contains both the nav and the status region, that `main` is a sibling rather than nested in the rail, and that the status region is the rail's `lastElementChild` — the DOM-order encoding of ux-design §0's "pinned to the bottom of the rail". Structural rather than content-based, as the task required. | The "pinned to the bottom" claim is proven only as DOM order; the actual pinning depends on `flex-1` on the `nav`, which is not asserted. Minor — jsdom does not lay out, so this is close to the practical limit of the framework. |
| `shell.tokens.test.tsx` "introduces no literal spacing or type value" / TC-COMP-331 | WEAK | Static scan of `shell.tsx` for `\d+(px\|rem\|em)`, asserting no offending line. Deterministic and file-path-stable. | Two gaps. (a) It only catches suffixed literals: Tailwind's arbitrary-value syntax `p-[13px]` is caught, but `w-[37]`, `style={{ padding: 13 }}` or an off-scale numeric utility such as `p-9` (undefined in the config, so silently no-op) is not. (b) It scans `shell.tsx` only, while DAC-E1-S4-3 governs "any spacing or type value in the shell" — `tailwind.config.js` is where an off-scale value would most plausibly be introduced, and it is unscanned. IR-005 |
| TC-COMP-334 (DAC-E1-S4-6, build output lands in the API static directory) | MISSING | No test exists. T021 is a one-off manual build observation recorded as a checked box. | A P1 mandatory component test the coverage matrix maps to a story-owned AC. Nothing re-verifies the build contract on any later change to `vite.config.ts`, and the `emptyOutDir` defect in IR-001 is exactly the class of regression it would have caught. IR-002 |

Isolation and determinism across the suite are good: every test renders through
`MemoryRouter` with explicit `initialEntries`, none touches the network, the
clock, or shared module state, and the two file-reading tests resolve their paths
from `import.meta.url` rather than the process working directory. The suite
completed in 912ms with no ordering dependence.

`web/src/main.tsx` has no test. That is acceptable — it is untestable
composition-root wiring, and the story's Testing section does not ask for it.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved from the committed lockfile. npm 11.18.0 withheld postinstall scripts for `@biomejs/biome`, `esbuild` and `fsevents` (`npm warn allow-scripts`); every downstream command nonetheless ran correctly, so the warning is environmental and not a defect |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vitest 2.1.9 — 5 files, 12 tests, 12 passed, 0 skipped, 912ms. React Router v7 future-flag warnings appear on stderr from tests that construct `MemoryRouter` without the flags `main.tsx` sets; noise only |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome lint .` — 15 files checked, no diagnostics |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome format .` — 15 files checked, "No fixes applied", no file modified. Confirmed non-mutating by comparing `git status` before and after |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Clean under `strict`, `noUnusedLocals`, `noUnusedParameters` |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS (with side effect) | Vite 5.4.21, 36 modules, built in 703ms. Emitted `src/factorflow/api/static/index.html` (0.40 kB), `assets/index-*.css` (10.72 kB), `assets/index-*.js` (166.75 kB). **Deleted the tracked `src/factorflow/api/static/.gitkeep`** — see below |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Not in the task plan's Validation Plan. The script exists (T001) but no `playwright.config.*` and no `tests/e2e/` specs exist, so it cannot execute. Playwright browsers are also not installed, which `tech-stack.md` records as expected. E2E automation is Phase 6b scope. IR-006 |
| `npx biome check .` | `repos/factorflow-v2/FactorFlow-v2` | 1 | NOT REQUIRED | Run for information only. Reports two `organizeImports` suggestions in `vite.config.ts` and `vitest.config.ts`. `check` is neither in the task plan nor in the tech-stack validation table — `lint` and `format` are, and both pass. Not a finding |

Ordering: the narrowest story-relevant command (`npm run test`) was run first,
then lint, format and the type check, and `npm run build` last — deliberately, so
that any build side effect could not contaminate the other results.

### Validation Side Effects

- **Before**: `git status --porcelain` empty. `HEAD` = `d9a8da850fcf831c7561fa4992e693b0cb85d1b4`. `src/factorflow/api/static/` contained exactly one entry, the tracked empty file `.gitkeep`.
- **After**: `git status --porcelain` reports `D src/factorflow/api/static/.gitkeep`. `HEAD` unchanged. `src/factorflow/api/static/` now contains `index.html` and `assets/` (both gitignored) and no `.gitkeep`.
- **Unexpected tracked-file changes**: one — the deletion of `src/factorflow/api/static/.gitkeep` by `npm run build`.

Per review constraint 10 the deletion was **not** restored, and no further
mutation-producing command was run after the build. `npm ci`, `npm run test`,
`npm run lint`, `npm run format` and `npx tsc --noEmit` were each confirmed
non-mutating by comparing `git status --porcelain` before and after.

The working tree must be returned to a clean state before further work: this
review deliberately leaves `.gitkeep` deleted as evidence, and that deletion must
not be committed.

## Findings

### IR-001 — `npm run build` deletes a tracked file another story depends on

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-6
- **Tasks**: T002, T021, T023
- **Files**: `vite.config.ts:10-13`; `src/factorflow/api/static/.gitkeep`; `.gitignore:17-19`; `src/factorflow/api/app.py:175-176`
- **Claim challenged**: T002 and T021 claim the Vite configuration makes the build output land where CAP-001-E1-S6's static-file mount expects it, "confirming DAC-E1-S4-6 and the assumption CAP-001-E1-S6's static-file mount depends on."
- **Observed evidence**: `vite.config.ts` sets `emptyOutDir: true` on an `outDir` (`../src/factorflow/api/static`) that lies outside the Vite root. Running `npm run build` from a clean tree at `HEAD` produced `git status --porcelain` → `D src/factorflow/api/static/.gitkeep`. `.gitignore` ignores `src/factorflow/api/static/*` and re-includes only `!src/factorflow/api/static/.gitkeep`, so that file is the only thing keeping the directory in version control. `src/factorflow/api/app.py:175` guards the mount with `if _STATIC_DIR.exists():`, and CAP-001-E1-S6's own task plan (T001) records `.gitkeep` as deliberately created for this purpose.
- **Expected evidence/behavior**: A story-owned build command must not delete a tracked file belonging to another story. Component design §2.1 requires the build output to land in the API package's static directory; it does not authorise removing that directory's version-controlled marker. DAC-E1-S4-6's stated purpose — "so one image serves both" — is defeated if the directory ceases to exist in a fresh clone.
- **Impact**: If the deletion is committed (it is an ordinary working-tree change that `git add -A` would pick up), a fresh clone has no `src/factorflow/api/static/` directory. `_STATIC_DIR.exists()` is then false, `app.mount("/", StaticFiles(...))` never executes, and the API silently serves no frontend — with no test failure anywhere, because `test_api_static_mount.py` uses a `tmp_path` fixture rather than the real directory. This is a silent cross-story regression in the mount CAP-001-E1-S6 spent four review rounds hardening.
- **Required remediation**: Make `npm run build` non-destructive to the tracked marker. Either set `emptyOutDir: false`, or keep it true and ensure `.gitkeep` survives or is restored, or move to an output layout that does not require deleting a version-controlled path. Whichever route is taken, leave the working tree clean after a build. Restore the deleted `.gitkeep` before committing.

### IR-002 — Mandatory test TC-COMP-334 is not implemented

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-6
- **Tasks**: T021, T024 (Phase 4 checkpoint)
- **Files**: `web/src/app/` (no test covers the build contract); `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/coverage-matrix.md:366`
- **Claim challenged**: The task plan's Phase 4 checkpoint states "All eight mandatory TC-IDs (TC-COMP-014, 303, 329–334) are green."
- **Observed evidence**: Seven TC-IDs have test implementations (TC-COMP-014 partial, 303, 329, 330, 331, 332, 333). A repository-wide search for TC-COMP-334 finds it only in the coverage matrix, the component test specification and the task plan — never in a test file. `npm run test` collects 12 tests across 5 files; none exercises the build output path. T021, the only task mapped to DAC-E1-S4-6 besides T001, is a manual one-off build observation recorded as a checked box.
- **Expected evidence/behavior**: `coverage-matrix.md:366` maps DAC-E1-S4-6 to TC-COMP-334 and marks it "Covered"; the component test specification records it as scope `component`, priority P1. Review constraint: every mandatory TC-ID mapped to the story must be implemented and traceable.
- **Impact**: The one acceptance criterion that reaches outside the frontend has no automated guard. A change to `vite.config.ts`'s `outDir` — or to `emptyOutDir`, as IR-001 demonstrates — breaks the contract CAP-001-E1-S6 depends on with no failing test anywhere in either suite. The coverage matrix's "Covered" status is currently inaccurate.
- **Required remediation**: Implement TC-COMP-334 as an executing test that asserts the build contract: that the configured output directory resolves to `src/factorflow/api/static`, that a build places `index.html` there, and — given IR-001 — that the build leaves the directory's tracked marker intact. Assert against the resolved Vite configuration and real output rather than by re-reading the config file as text.

### IR-003 — The AC-14 test scans two roles where the criterion covers the whole tree

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-14
- **Tasks**: T009
- **Files**: `web/src/app/shell.test.tsx:10-28`
- **Claim challenged**: T009 claims to assert "no element matches sign-in, account, or user-menu semantics (by role, accessible name, or test id)".
- **Observed evidence**: The test iterates `screen.queryAllByRole("button")` and `screen.queryAllByRole("link")`, checking `textContent` and `aria-label` against a forbidden regex, then runs one `queryByTestId` check. Nothing else in the rendered tree is examined.
- **Expected evidence/behavior**: AC-14 states the shell "contains no sign-in, no user menu and no account area". An account *area* is not necessarily a button or a link. A `<div>Signed in as owner</div>`, an `<h2>Account</h2>`, a `role="menu"` user menu, or an `<img alt="Profile">` all satisfy the current assertions while violating the criterion.
- **Impact**: The test would not fail on the most natural way this criterion gets violated — someone adding an account panel or a signed-in-as label rather than a sign-in button. The criterion is currently satisfied by inspection of a small tree, not by a test that would hold as the shell grows, which is precisely when the guard matters.
- **Required remediation**: Broaden the assertion to the whole rendered tree — for example scan the rendered container's full text content and the accessibility tree (all roles, accessible names) against the forbidden vocabulary, rather than two interactive roles.

### IR-004 — A `--space-7` rail cannot contain the labels DAC-E1-S4-1 requires

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-1, DAC-E1-S4-3
- **Tasks**: T017, T023
- **Files**: `web/src/app/shell.tsx:31`; `design-system/theme.css:224`; ux-design §0
- **Claim challenged**: T023 claims a review of "any Tailwind utility class that bypasses the configured token scale" was performed, and the Phase 5 checkpoint claims all acceptance criteria are satisfied.
- **Observed evidence**: `shell.tsx:31` sets the rail to `w-7`, which `tailwind.config.js:20` maps to `var(--space-7)`, which `theme.css:224` defines as `3rem` (48px) — confirmed in the built CSS as `.w-7{width:var(--space-7)}`. The rail contains visible text labels including `Instruments` (11 characters at `--text-base`, 14px) with `p-3` (12px) horizontal padding on each item, leaving roughly 24px of content width. jsdom performs no layout, so no existing test detects this.
- **Expected evidence/behavior**: DAC-E1-S4-1 requires the destination labels to render as the words Coverage, Instruments, Runs, Settings. ux-design §0 specifies both "a fixed left navigation rail of `--space-7` width" and those four visible text labels. The two statements are in tension: 48px is an icon-rail width, and the design names no icons.
- **Impact**: As built the labels overflow or wrap unreadably in a real browser. The implementation is faithful to the design's literal token, so the defect originates upstream — but it ships a rail whose labels are not legible, which is what DAC-E1-S4-1 exists to guarantee. T023's stated review should have surfaced the conflict rather than confirming the token in isolation.
- **Required remediation**: Escalate the conflict between ux-design §0's `--space-7` rail width and its four text labels to the UX design owner, and record the resolution. Do not resolve it by introducing a width outside the scale — STD-UI-29 forbids that. Either the design selects a wider scale value, or it specifies icons with accessible names, or it states the labels wrap.

### IR-005 — The token-discipline scan misses the values most likely to breach the scale

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-3
- **Tasks**: T012
- **Files**: `web/src/app/shell.tokens.test.tsx:15-26`
- **Claim challenged**: T012 claims the test inspects the shell "for any CSS length/font-size value not resolving to one of `theme.css`'s `--space-*`/`--text-*` custom properties".
- **Observed evidence**: The regex is `/(?<!--[\w-]*)\b\d+(\.\d+)?(px|rem|em)\b/` applied line-by-line to `shell.tsx` alone. It matches only numbers carrying a `px`/`rem`/`em` suffix. A unitless off-scale value (`style={{ padding: 13 }}`, `w-[37]`) does not match. Neither does a Tailwind utility that is simply undefined in the config (`p-9`, `text-3xl`) and therefore silently emits nothing. `tailwind.config.js` — the file where a literal would actually be introduced into the scale — is not scanned at all.
- **Expected evidence/behavior**: DAC-E1-S4-3 governs "any spacing or type value in the shell", and STD-UI-29's verification is "No spacing, size or colour literal appears outside the theme". The theme's boundary is `tailwind.config.js`, not `shell.tsx`.
- **Impact**: The test passes today, and the implementation genuinely is clean — verified independently in the compiled CSS. But the guard is weaker than the claim: the most plausible future breach (someone adding `spacing: { 9: "2.25rem" }` to the Tailwind config, or an arbitrary-value utility) leaves it green.
- **Required remediation**: Extend the scan to `tailwind.config.js` and assert positively that every value in its `spacing`, `fontSize` and `height` scales is a `var(--*)` reference, rather than only asserting the absence of suffixed literals in one component file. Optionally assert against the resolved Tailwind theme rather than source text.

### IR-006 — `npm run test:e2e` is defined but cannot execute

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T001
- **Files**: `package.json:9`
- **Claim challenged**: T001 claims the npm scripts the tech stack's validation table names are defined, listing `test:e2e` among them.
- **Observed evidence**: `package.json:9` defines `"test:e2e": "playwright test"` and `@playwright/test` is installed. No `playwright.config.*` and no `tests/e2e/` directory exist anywhere in the repository, so the script would fail if invoked.
- **Expected evidence/behavior**: The task required the script to be *defined*, and it is. `tech-stack.md` lists `npm run test:e2e` in its validation table and separately records that Playwright browsers need installing. The task plan's own Validation Plan omits it.
- **Impact**: None for this story's gate — E2E automation is Phase 6b scope. Recorded so a later agent does not read the script's presence as evidence that an E2E suite exists.
- **Required remediation**: None required for this story. The Phase 6b automation work that first adds an E2E spec should add `playwright.config.ts` alongside it.

### IR-007 — The not-found state is undesigned placeholder copy

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-5
- **Tasks**: T018
- **Files**: `web/src/app/routes.tsx:13-15`
- **Claim challenged**: T018 claims an unmatched route "renders a not-found state inside the shell's main region".
- **Observed evidence**: `NotFound` renders `<p>Not found</p>` — two words, no heading, no explanation, no route back to a valid destination.
- **Expected evidence/behavior**: DAC-E1-S4-5 requires only "a not-found state inside the frame rather than an empty page or a crash", which this meets, and ux-design specifies no copy for this state. STD-UI-23's requirement that a failure be designed rather than surfaced raw is directed at the unreachable-backend case in ux-design §2, not this one.
- **Impact**: The criterion is satisfied. The state is thinner than the product's designed states elsewhere, and no design source specifies what it should say.
- **Required remediation**: None required. If a later story or the UX design specifies not-found copy, replace the placeholder then.

### IR-008 — The route-count test asserts against source text, not the route tree

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-12
- **Tasks**: T016
- **Files**: `web/src/app/routes.test.tsx:50-65`
- **Claim challenged**: T016 claims a test asserts "`routes.tsx` declares exactly the five routes this story owns … and no additional top-level route".
- **Observed evidence**: The test reads `routes.tsx` with `readFileSync` and regex-extracts `path="…"` attribute values from the source string.
- **Expected evidence/behavior**: Review constraint 8 — tests should exercise production behavior rather than reproduce implementation structure. The behavioral claim (these five paths render, others do not) is directly observable by rendering each path.
- **Impact**: The test cannot distinguish a mounted route from a commented-out or unreachable one, and it breaks on a behavior-preserving refactor to an object route config. It is a structural proxy for a claim that is testable behaviorally. It does hold today and traces correctly.
- **Required remediation**: Optional. Render each of the five paths and assert the expected screen appears, and that a sixth plausible path falls through to not-found.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified — unnamed but load-bearing files.** `postcss.config.js`, `biome.json`, `web/src/index.css` and `web/src/test-setup.ts` are not named by any task. Each is required for a task that *is* named to have effect: Tailwind does not process without a PostCSS entry point (T006), `npm run lint`/`format` do not run without a Biome config (T001), the token utilities do not resolve without the CSS entry that imports `theme.css` and the Tailwind layers (T019), and the jest-dom matchers every test uses require the setup file (T007). None introduces behavior beyond its task.
- **Justified — flat run-detail route.** T018 and DAC-E1-S4-2 describe run detail as "a child route … nested under Runs". `routes.tsx:31` declares `/runs/:runId` as a flat sibling `<Route>` rather than a nested `<Route>` with an `Outlet`. This is faithful to ux-design §1.5, which specifies run detail as a full-screen replacement rather than content nested inside a Runs layout, and every observable requirement of the criterion holds.
- **Deviation beyond the plan — `emptyOutDir: true`.** T002 specifies `root` and `outDir` only. The added `emptyOutDir: true` is the cause of IR-001.
- **Addition beyond the plan — the `/` redirect.** `routes.tsx:27` redirects `/` to `/coverage`. No task or AC calls for it and none forbids it; some root behavior is necessary. Note for a later story: ux-design §2 states that with no history depth set the shell routes to **Settings** rather than Coverage. That first-run branch depends on settings state no API client yet exposes and is outside this story's scope, but the current unconditional redirect will need revisiting when it lands.
- **Bookkeeping — accurate with two exceptions.** All 24 boxes are checked. T021 and T023 are recorded PARTIAL above; the Phase 4 checkpoint's claim that all eight mandatory TC-IDs are green is contradicted by IR-002. No unchecked-but-implemented task was found.
- **Story frontmatter.** `status: planning` → `in-review` and the `updated` date are the expected coding-agent transitions; no acceptance criterion or technical detail was altered.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Resolve IR-001 (make `npm run build` non-destructive to `src/factorflow/api/static/.gitkeep`, and restore that file — it is currently deleted in the working tree and must not be committed as a deletion) and IR-002 (implement TC-COMP-334 as an executing test of the build-output contract). Address the three MEDIUM findings — IR-003 (broaden the AC-14 scan to the whole rendered tree), IR-004 (escalate the `--space-7` rail width versus text-label conflict to the UX design owner and record the resolution), IR-005 (extend the token scan to `tailwind.config.js`) — or record an explicit justification for deferring each. Then rerun the Adversarial Review Agent against this task file and this report.
- **Warnings accepted downstream**: N/A — the verdict is CHANGES-REQUIRED.
