---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S4-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-08
updated: 2026-09-08
story_id: "CAP-001-E1-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-08T23:37:00Z"
reviewed_head: "d9a8da850fcf831c7561fa4992e693b0cb85d1b4"
review_base: "1f7d3d9b3a112cd8911782423d6f9e76b3532a53"
reviewed_state_revision: "sha256:a0c744a1d9b5fc1b0810475fde75ece8765414426f995c3fb5509cb90b8d5dd7"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E1-S4
    artifact_version: 1
    content_revision: sha256:8e6cc9b76c3e50cc5fb6462a5a12c75b19440080b49af7e9938851fa68343368
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-sonnet-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-08T23:37:00Z
  source_artifacts:
    - id: CAP-001-E1-S4
      version: "1"
    - id: CAP-001-E1-S4-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S4 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 6 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 24/24 verified |
| Required validation | 6/6 passed |

Both HIGH findings from version 1 are resolved, and each was confirmed against a
live command rather than against the rework's own description.

IR-001 is fixed at the cause. `vite.config.ts:17` now sets `emptyOutDir: false`,
and the tracked `src/factorflow/api/static/.gitkeep` — the only thing keeping
that directory in version control, and therefore the only thing keeping
`app.py:175`'s `if _STATIC_DIR.exists():` mount guard true in a fresh clone —
survives. This was verified twice: once through the build that `npm run test` now
performs, and once through a standalone `npm run build`. `git status --porcelain`
is byte-identical before and after both, with no `D src/factorflow/api/static/.gitkeep`
line. The deleted marker left as evidence by version 1 has been restored and is
tracked again (`git ls-files` lists it).

IR-002 is fixed with a real test, not a re-reading of the config as text.
`web/src/app/build-output.test.tsx` implements TC-COMP-334 in two parts: it
resolves the actual Vite configuration through `resolveConfig` and asserts both
that `outDir` resolves to `src/factorflow/api/static` and that `emptyOutDir` is
`false`, then drives a genuine `viteBuild` and asserts `index.html` appears while
`.gitkeep` survives byte-for-byte. This is regression-sensitive against exactly
the defect version 1 found: reverting `emptyOutDir` to `true` fails the first
assertion directly, before the symptom is even reached. Eight of eight mandatory
TC-IDs now have implementations, and the Phase 4 checkpoint's claim is accurate.

Both MEDIUM test-strength findings are also resolved. The AC-14 scan
(`shell.test.tsx:35-38`) now covers the whole rendered container's text content
and every `[role]`/`[aria-label]` element, so the account-panel and
signed-in-as-label regressions version 1 named would now fail it. The token scan
(`shell.tokens.test.tsx:35-53`) now imports `tailwind.config.js` and asserts
positively that every value in its `spacing`, `fontSize` and `height` scales
matches `^var\(--[\w-]+\)$` — closing the gap where an off-scale value added at
the theme boundary would have passed a scan confined to `shell.tsx`.

IR-004 was correctly not "fixed". The remediation version 1 required was to
escalate the conflict and record the resolution, explicitly forbidding a width
outside the scale. The task plan's Notes section now carries that escalation with
the follow-up owed to the UX design owner. Verified as still genuinely open
upstream: `ux-design.md:70` continues to specify a `--space-7` rail, and
`theme.css:224` continues to define that token as `3rem`. The finding is carried
forward as LOW, reclassified because the implementation obligation is discharged
and what remains is an upstream design decision this story cannot make.

Two new MEDIUM findings arise from the fix itself, both bounded and neither
touching an acceptance criterion. `emptyOutDir: false` leaves stale hashed assets
accumulating in the output directory across builds — observed live: five files
where two are current. And `npm run test` now performs a real production build,
making the test command mutate the working tree and taking 763ms of the 1.26s
suite. Neither breaks a required behavior, so neither blocks the gate.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S4-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S4` |
| HEAD | `d9a8da850fcf831c7561fa4992e693b0cb85d1b4` |
| Review base | `main` / `origin/main` merge-base `1f7d3d9b3a112cd8911782423d6f9e76b3532a53` (both resolve identically) |
| Working tree | Four tracked modifications and two untracked files, all reviewed — see below. The rework is uncommitted |
| Changed files reviewed | 22 (21 committed at `HEAD` plus one new untracked test) |

`HEAD` is unchanged from version 1: one commit separates the base from `HEAD`
(`d9a8da8 feat(CAP-001-E1-S4): application shell, navigation rail and routing`).
**The entire rework is in the working tree and is not yet committed.** The review
set therefore includes the uncommitted changes, per review constraint 6.

### Working-Tree Changes (the rework under review)

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `vite.config.ts` | modified | Rework of IR-001 — `emptyOutDir: true` → `false` plus an explanatory comment; T002, DAC-E1-S4-6 |
| `web/src/app/build-output.test.tsx` | untracked (new) | Rework of IR-002 — TC-COMP-334; T021, DAC-E1-S4-6 |
| `web/src/app/shell.test.tsx` | modified | Rework of IR-003 — whole-tree AC-14 scan; T009 |
| `web/src/app/shell.tokens.test.tsx` | modified | Rework of IR-005 — Tailwind config scan; T012 |
| `CAP-001-E1-S4-tasks.md` | modified | `updated` date, `last_reworked_review` pointer, and the IR-004 escalation note |
| `CAP-001-E1-S4-implementation-review-v1.md` | untracked | The version 1 report — this review's own predecessor |

Also verified restored: `src/factorflow/api/static/.gitkeep` no longer appears as
a deletion in `git status` and is tracked (`git ls-files src/factorflow/api/static/`
returns it). Version 1 deliberately left it deleted as evidence; that deletion is
gone.

### Changed Files at HEAD

Unchanged from version 1 and re-confirmed. All 21 files remain justified by a
named task, with `postcss.config.js`, `biome.json`, `web/src/index.css` and
`web/src/test-setup.ts` load-bearing for T006, T001, T019 and T007 respectively.
No unjustified file appears in the change set at `HEAD` or in the working tree.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-14 | SATISFIED | `web/src/app/shell.tsx:28-45` — the rendered tree contains only a `nav` of four `NavLink`s, a status-region slot and a `main`. No sign-in, user menu, or account element exists anywhere in the change set | `shell.test.tsx:10-39` — now scans the whole container's `textContent` and every `[role]`/`[aria-label]` accessible name, in addition to the button/link/test-id checks | The test now matches the criterion's whole-tree scope. IR-003 resolved |
| DAC-E1-12 | SATISFIED | `shell.tsx:10-15` `DESTINATIONS` is a fixed four-element `as const` array in the required order; `routes.tsx:31` declares `/runs/:runId` as a URL child of `/runs`, and no fifth `NavLink` exists | `shell.test.tsx:45-62` asserts exactly four links and their exact text sequence; `routes.test.tsx:20-22` asserts the count stays four at `/runs/run-123` | The rail is generated from one ordered constant, so order cannot drift between destinations and routes independently |
| DAC-E1-S4-1 | SATISFIED | `shell.tsx:11-14` labels are the literals `Coverage`, `Instruments`, `Runs`, `Settings` | `shell.test.tsx:56-61` exact-sequence assertion; `shell.test.tsx:64-76` asserts the rail text contains none of "Jobs", "Sync", "Import" | Both halves of STD-UI-1 — right words present, forbidden synonyms absent — are covered. The legibility concern is IR-004, an upstream design matter, not a labels-are-wrong defect |
| DAC-E1-S4-2 | SATISFIED | `routes.tsx:31` `<Route path="/runs/:runId" .../>`; `shell.tsx:34` `NavLink to="/runs"` without `end`, so React Router's partial match keeps `aria-current="page"` on Runs for any `/runs/*` path | `routes.test.tsx:13-26` navigates to `/runs/run-123`, asserts the Runs anchor carries `aria-current="page"` and the rail still holds exactly four links | Flat declaration rather than a nested `<Route>` with `Outlet` — a justified deviation faithful to ux-design §1.5's full-screen run detail. Every observable requirement holds |
| DAC-E1-S4-3 | SATISFIED | `shell.tsx:30-43` uses only `w-7`, `p-5`, `p-3`, `gap-2`, `text-base`; `tailwind.config.js:13-33` maps every one to a `theme.css` custom property with no literal. Re-confirmed in the compiled output: the built CSS emits `var(--space-*)` references, no literal length | `shell.tokens.test.tsx:25-33` scans `shell.tsx` for literals; `:35-53` now imports `tailwind.config.js` and asserts every `spacing`/`fontSize`/`height` value matches `^var\(--[\w-]+\)$` | The theme boundary is now guarded positively rather than only by absence-of-literal in one file. IR-005 resolved |
| DAC-E1-S4-4 | SATISFIED | `shell.tsx:34` renders each destination as a `NavLink`, emitting an `<a href>` — natively focusable, in natural document order, keyboard-activatable, with `aria-current="page"` on the active match. No `outline` suppression appears anywhere in the change set, so STD-UI-24 holds | `shell.a11y.test.tsx:11-27` tabs four times asserting focus lands on each link in DOM order; `:29-42` asserts `aria-current="page"` on the active destination and its absence on an inactive one | The negative half is what makes this regression-sensitive rather than trivially true |
| DAC-E1-S4-5 | SATISFIED | `routes.tsx:33` `<Route path="*" element={<NotFound />} />` declared inside `AppRoutes`, which `shell.tsx:42` renders inside `<main>` — the catch-all is structurally inside the frame and cannot escape it | `routes.test.tsx:33-45` navigates to `/this-route-does-not-exist` and asserts the nav, the status region, and a `/not found/i` match scoped `within(main)` are all present | Asserts frame *and* content, so it fails both if the shell disappears and if the not-found state does. The copy itself is IR-007, LOW |
| DAC-E1-S4-6 | SATISFIED | `vite.config.ts:14-17` sets `outDir: "../src/factorflow/api/static"` with `emptyOutDir: false`. `npm run build` run independently placed `index.html` and `assets/` there and left `.gitkeep` intact | `build-output.test.tsx:25-32` asserts the resolved `outDir` and `emptyOutDir: false`; `:34-46` drives a real build and asserts `index.html` appears and `.gitkeep` survives byte-identically | Was PARTIAL in version 1 on both halves — the mechanism damaged the contract, and no test guarded it. Both are now closed with executing evidence |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `package.json:6-12` defines `build`, `test`, `test:e2e`, `lint`, `format` exactly as the tech-stack validation table names them; `:13-33` carries every listed dependency | `npm ci` exits 0 against the committed lockfile. `test:e2e` is defined but not runnable — IR-006, LOW, Phase 6b scope |
| T002 | complete | VERIFIED | `vite.config.ts:14-17` `root: "web"`, `outDir: "../src/factorflow/api/static"`, `emptyOutDir: false` | Was VERIFIED with the `emptyOutDir: true` defect noted in version 1; the defect is now removed and the setting carries an explanatory comment naming CAP-001-E1-S6 |
| T003 | complete | VERIFIED | `web/index.html:10` `<script type="module" src="/src/main.tsx">` | Resolves correctly under `root: "web"`; proven by the successful build |
| T004 | complete | VERIFIED | `web/src/main.tsx:12-18` mounts the React root and renders `<Shell />` inside `BrowserRouter` | Guards a missing `#root` explicitly rather than a non-null assertion |
| T005 | complete | VERIFIED | `tsconfig.json` targets ES2022 with `strict: true`, `include: ["web/src"]`, TypeScript `^5.6.2` | `npx tsc --noEmit` exits 0 with `noUnusedLocals`/`noUnusedParameters` enabled |
| T006 | complete | VERIFIED | `tailwind.config.js:13-33` maps `spacing`, `fontSize`, `height` and three colours to `var(--*)` properties with no literal; `web/src/index.css:4` imports `design-system/theme.css` | Now additionally guarded by an executing assertion (`shell.tokens.test.tsx:35-53`) rather than inspection alone |
| T007 | complete | VERIFIED | `vitest.config.ts:6-11` `root: "web"`, `environment: "jsdom"`, `setupFiles: ["./src/test-setup.ts"]` | `npm run test` collects and runs all six files. The new build test opts out of jsdom per-file — see IR-010 |
| T008 | complete | VERIFIED | `web/src/app/status-region.tsx:9-11` exports a no-op `StatusRegion` carrying `data-testid="status-region"` | Correctly scoped to a slot; names CAP-001-E1-S5 as the owner of the real implementation |
| T009 | complete | VERIFIED | `web/src/app/shell.test.tsx:10-39` | Was VERIFIED with the assertion-strength concern IR-003; the scan now covers the whole rendered tree, closing it |
| T010 | complete | VERIFIED | `web/src/app/shell.test.tsx:44-77` | Both the exact-order assertion and the forbidden-vocabulary assertion are present |
| T011 | complete | VERIFIED | `web/src/app/routes.test.tsx:12-27` | Asserts both required facts: Runs keeps `aria-current`, and no fifth rail item appears |
| T012 | complete | VERIFIED | `web/src/app/shell.tokens.test.tsx:24-54` | Was VERIFIED with the narrow-scope concern IR-005; the scan now reaches `tailwind.config.js`, the actual theme boundary |
| T013 | complete | VERIFIED | `web/src/app/shell.a11y.test.tsx:10-43` | Covers both halves — traversal order and the announced active state, positive and negative |
| T014 | complete | VERIFIED | `web/src/app/routes.test.tsx:32-46` | Asserts the frame survives and the not-found content is inside `role="main"` |
| T015 | complete | VERIFIED | `web/src/app/shell.layout.test.tsx:9-52` | Three structural assertions: rail contains nav and status region, main is a sibling not a child, status region is the rail's last element child |
| T016 | complete | VERIFIED | `web/src/app/routes.test.tsx:50-66` | Source-text scan rather than route-tree inspection — IR-008, LOW, unchanged |
| T017 | complete | VERIFIED | `web/src/app/shell.tsx:28-45` | Rail at `w-7` (`--space-7`), main at `p-5` (`--space-5`), status-region slot as the rail's last child, four destinations, no fifth, no auth element |
| T018 | complete | VERIFIED | `web/src/app/routes.tsx:24-36` | Four destinations, the run-detail child path, a `/` redirect to `/coverage`, and a `*` catch-all rendering inside `main` |
| T019 | complete | VERIFIED | `shell.tsx:30-43` carries no literal length; every utility resolves through `tailwind.config.js` to a `theme.css` property, confirmed in the compiled CSS | Fully achieved |
| T020 | complete | VERIFIED | `shell.tsx:34` `NavLink` yields a focusable `<a>` in natural order with React Router's `aria-current="page"` on the active match | Achieved through the library's ARIA state, exactly as the task's parenthetical permitted |
| T021 | complete | VERIFIED | `npm run build` places output under `src/factorflow/api/static/` — reproduced independently, exit 0. The task's second clause ("the assumption CAP-001-E1-S6's static-file mount depends on") is now genuinely met: `.gitkeep` survives the build, so `_STATIC_DIR.exists()` stays true in a fresh clone | Was PARTIAL in version 1. The manual observation is now backed by `build-output.test.tsx`, so the task's claim re-verifies on every test run rather than once |
| T022 | complete | VERIFIED | `npm run test` — 6 files, 15 tests, all passing, rerun independently | The rendered structure matches ux-design §0's layout contract on every value it states |
| T023 | complete | VERIFIED | `shell.tsx` is clean of hardcoded values, verified in the built CSS; the token scale is now asserted at its boundary | Was PARTIAL in version 1 because the review of "any Tailwind utility class that bypasses the configured token scale" had not surfaced the `--space-7`-versus-labels conflict. That conflict is now explicitly surfaced and escalated in the task plan's Notes, which is what the task's review obligation required. The unresolved half is upstream design (IR-004), not this task |
| T024 | complete | VERIFIED | All six Validation Plan commands rerun independently, all six exit 0 | The Phase 4 checkpoint's claim that all eight mandatory TC-IDs are green is now accurate — TC-COMP-334 exists and passes |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `build-output.test.tsx` "resolves outDir to the API package's static directory with emptyOutDir disabled" / TC-COMP-334 | ADEQUATE | Calls Vite's own `resolveConfig` against the real `vite.config.ts` and asserts `path.resolve(config.root, config.build.outDir)` equals the absolute static directory, and that `config.build.emptyOutDir` is `false`. This is the resolved configuration, not the source text, so it holds through any refactor of how the config is expressed. Changing `outDir`, or reverting `emptyOutDir` to `true`, fails it directly | None. This asserts the cause of IR-001, not merely its symptom |
| `build-output.test.tsx` "a real build places index.html in the static directory and leaves its tracked marker intact" / TC-COMP-334 | ADEQUATE | Snapshots `.gitkeep`'s bytes, asserts it exists beforehand (with a message, so a missing precondition is diagnosable rather than confusing), drives a genuine `viteBuild`, then asserts `index.html` was emitted and `.gitkeep` survives with identical content. Exercises the real build pipeline end to end | The `existsSync` precondition makes the test environment-dependent: it fails rather than skips if `.gitkeep` is absent. This is the correct trade-off — the file is tracked, so its absence *is* the regression |
| `shell.test.tsx` "renders no element matching sign-in, account, or user-menu semantics" / TC-COMP-014 (partial), TC-COMP-303 | ADEQUATE | Now three layers: the original button/link role scan by text and `aria-label`, the test-id query, plus `container.textContent` against the forbidden regex and every `[role]`/`[aria-label]` element's accessible name. The regressions version 1 named — `<div>Signed in as owner</div>`, `<h2>Account</h2>`, a `role="menu"` user menu, an `<img alt="Profile">` — now fail it, the first three via `textContent` or the role sweep | An `<img alt="Profile">` with no `role` or `aria-label` is still missed, since `alt` is neither scanned attribute and contributes no `textContent`. Narrow residue of a formerly broad gap; recorded as IR-009, LOW |
| `shell.test.tsx` "renders exactly four navigation items in order with exact labels" / TC-COMP-303, TC-COMP-329 | ADEQUATE | Scopes to `role="navigation"`, asserts `toHaveLength(4)` and an exact ordered array of the four label strings. A fifth destination, a reorder, a rename, or a missing item each fail it | None |
| `shell.test.tsx` "uses no generic or forbidden vocabulary in place of product terms" / TC-COMP-329 | ADEQUATE | Asserts the rail's text contains none of "Jobs", "Sync", "Import" — the three synonyms DAC-E1-S4-1 names explicitly | Case-sensitive, so a lowercase "jobs" slips through. Minor; the criterion names the capitalised product-vocabulary forms |
| `shell.tokens.test.tsx` "shell.tsx introduces no literal spacing or type value" / TC-COMP-331 | ADEQUATE | Static scan of `shell.tsx` for suffixed `px`/`rem`/`em` literals | Still cannot catch a unitless off-scale value or an undefined utility (`p-9`) in `shell.tsx` itself. Materially narrowed by the companion test below, which guards where such a value would actually enter the scale |
| `shell.tokens.test.tsx` "tailwind.config.js's spacing, fontSize, and height scales resolve only to theme.css custom properties" / TC-COMP-331 | ADEQUATE | Dynamically imports the real Tailwind config and asserts *positively* that every value in `spacing`, `fontSize` and `height` matches `^var\(--[\w-]+\)$`, collecting violations into a named list so a failure identifies the offending key. Adding `spacing: { 9: "2.25rem" }` — the exact breach version 1 named — fails it | Reads `theme.extend` only, so a scale redefined at `theme.spacing` (replacing rather than extending) is unscanned. The config uses `extend`, and the `?? {}` fallbacks mean such a move would silently empty the scan rather than fail it. Recorded as IR-011, LOW. `colors` is also unscanned, though STD-UI-29 covers colour literals too |
| `routes.test.tsx` "keeps Runs active and adds no fifth rail item when a run detail route opens" / TC-COMP-330 | ADEQUATE | Renders at `/runs/run-123` and asserts both halves of DAC-E1-S4-2. Adding `end` to the Runs `NavLink` — the most plausible regression — removes `aria-current` at that path and fails it | None |
| `routes.test.tsx` "renders a not-found state in the main region while keeping the shell frame" / TC-COMP-333 | ADEQUATE | Asserts the nav survives, the status region survives, and `/not found/i` appears **within** `role="main"`. The `within(main)` scoping is what makes it meaningful | None |
| `routes.test.tsx` "routes.tsx defines four destination routes plus one run-detail child route" | WEAK | Reads `routes.tsx` as text and regex-extracts `path="…"` values | Unchanged from version 1. Asserts source structure, not the route tree; cannot distinguish a mounted route from a commented-out one. IR-008, LOW — the finding was optional-remediation and remains so |
| `shell.a11y.test.tsx` "tabs through all four rail destinations in order" / TC-COMP-332 | ADEQUATE | Real `userEvent.setup()` and four sequential `user.tab()` calls asserting focus lands on each link in DOM order. Making any destination non-focusable breaks it | Proves relative order among the four rather than absolute tab position. Acceptable for the criterion as written |
| `shell.a11y.test.tsx` "exposes the active destination via aria-current" / TC-COMP-332 | ADEQUATE | Asserts `aria-current="page"` on the active destination **and** its absence on an inactive one | None |
| `shell.layout.test.tsx` (3 tests) — T015 additional | ADEQUATE | Rail contains both nav and status region; `main` is a sibling not nested; status region is the rail's `lastElementChild` | "Pinned to the bottom" is proven only as DOM order; jsdom does not lay out, so this is near the framework's practical limit |

All eight mandatory TC-IDs mapped to this story (TC-COMP-014 partial, 303, 329,
330, 331, 332, 333, 334) now have implementations, and the coverage matrix's
"Covered" status at `coverage-matrix.md:361-366` is accurate for the first time.

Isolation and determinism remain good for the twelve jsdom tests: each renders
through `MemoryRouter` with explicit `initialEntries`, none touches the network,
the clock, or shared module state, and the file-reading tests resolve paths from
`import.meta.url` rather than the process working directory. The two new
build-output tests are the exception in kind rather than in quality — they
deliberately touch the real filesystem, which is what makes them meaningful, but
that has consequences recorded as IR-010.

`web/src/main.tsx` still has no test. Acceptable — untestable composition-root
wiring the story's Testing section does not ask for.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 250 packages from the committed lockfile in 2s. npm withheld postinstall scripts for `@biomejs/biome`, `esbuild` and `fsevents` (`npm warn allow-scripts`); every downstream command nonetheless ran correctly, so the warning is environmental. `git status` identical before and after |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vitest 2.1.9 — 6 files, 15 tests, 15 passed, 0 skipped, 1.26s. Up from 5 files / 12 tests at version 1: the three additions are TC-COMP-334's two tests and the Tailwind-config token assertion. React Router v7 future-flag warnings on stderr are noise. **Performs a real Vite build as a side effect** — see IR-010 |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome lint .` — 16 files checked (up from 15, the new test file), no diagnostics |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome format .` — no fixes applied, no file modified. Confirmed non-mutating by comparing `git status` before and after |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Clean under `strict`, `noUnusedLocals`, `noUnusedParameters`, including the new test file |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite 5.4.21, 36 modules, 614ms. Emitted `src/factorflow/api/static/index.html` (0.40 kB), `assets/index-*.css` (10.75 kB), `assets/index-*.js` (166.75 kB). **`.gitkeep` survived** — `git status --porcelain` identical before and after, no `D` line. The version 1 defect does not reproduce |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Not in the task plan's Validation Plan. The script exists but no `playwright.config.*` and no `tests/e2e/` specs exist, so it cannot execute. Playwright browsers are not installed, which `tech-stack.md` records as expected. E2E automation is Phase 6b scope. IR-006 |

Ordering: `npm ci` first, then the story-relevant test suite, then lint, format
and the type check, with `npm run build` last — deliberately, so any build side
effect could not contaminate the other results. `npm run build` was additionally
run a second time to observe repeat-build behavior, which is how IR-012 was
found.

### Validation Side Effects

- **Before**: `git status --porcelain` reported four tracked modifications
  (`CAP-001-E1-S4-tasks.md`, `vite.config.ts`, `shell.test.tsx`,
  `shell.tokens.test.tsx`) and two untracked files (`build-output.test.tsx`, the
  version 1 report). `HEAD` = `d9a8da850fcf831c7561fa4992e693b0cb85d1b4`.
  `src/factorflow/api/static/` contained the tracked `.gitkeep` plus gitignored
  build output from the prior session.
- **After**: `git status --porcelain` reports **exactly the same six entries**.
  `HEAD` unchanged. `src/factorflow/api/static/` contains `.gitkeep` (intact and
  tracked), a refreshed `index.html`, and `assets/`.
- **Unexpected tracked-file changes**: **none.** This is the material difference
  from version 1, where `npm run build` produced `D src/factorflow/api/static/.gitkeep`.

Every command was confirmed non-mutating to tracked files by comparing
`git status --porcelain` before and after. Constraint 10 required no
intervention this round: no validation command modified a tracked file, so
nothing was left deliberately unrestored and no mutation-producing validation had
to be stopped early.

The only observed filesystem change is inside the gitignored output directory,
where stale hashed assets accumulated across builds — recorded as IR-012.

No reviewer-authored change was made to any file in the component repository.

## Findings

### IR-009 — The AC-14 scan still misses an image-only account affordance

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-14
- **Tasks**: T009
- **Files**: `web/src/app/shell.test.tsx:17-38`
- **Claim challenged**: The rework comment at `shell.test.tsx:29-34` states the test scans "the whole rendered tree's text content and every accessible name in its accessibility tree."
- **Observed evidence**: The added assertions check `container.textContent` and, for elements matching `[role], [aria-label]`, the `aria-label` attribute only. An `<img alt="Profile">` carries no `role` attribute in the source (its role is implicit), contributes nothing to `textContent`, and has no `aria-label` — so its `alt` text, which *is* its accessible name, is never examined.
- **Expected evidence/behavior**: AC-14 requires the shell to contain "no user menu and no account area". An avatar image is a conventional account affordance, and version 1 named `<img alt="Profile">` explicitly among the regressions the test should catch.
- **Impact**: Small and narrowing. The rework closed the three most likely violations (a static "Account" heading, a signed-in-as label, a non-interactive menu region) — all now caught via `textContent` or the role sweep. This one residual shape survives. The criterion is satisfied today by inspection of a tree small enough to enumerate exhaustively; this concerns the guard's durability as the shell grows.
- **Required remediation**: Optional. Include `alt` alongside `aria-label` in the attribute sweep, or compute accessible names via a library rather than reading two attributes directly.

### IR-010 — `npm run test` now performs a real production build

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-6
- **Tasks**: T007, T021
- **Files**: `web/src/app/build-output.test.tsx:1-6,41`
- **Claim challenged**: T007 configures Vitest as a jsdom unit-test runner; the Validation Plan lists `npm run test` and `npm run build` as separate commands with separate purposes.
- **Observed evidence**: `build-output.test.tsx:41` calls `viteBuild(...)` inside the default test suite, and `:1` opts the file out of the suite's jsdom environment with `// @vitest-environment node` because, per its own comment, jsdom's globals break esbuild. Observed live: that single file took 763ms of the suite's 1.26s total, and running `npm run test` refreshed `src/factorflow/api/static/index.html` and `assets/` — the working tree is modified by what is nominally a read-only test command.
- **Expected evidence/behavior**: Review constraint 8 asks that tests be isolated and free from environment dependence unless explicitly controlled; the constitution's validation table treats `test` and `build` as distinct commands. A unit-test run that writes production build output into another package's directory couples the two.
- **Impact**: Bounded and partly deliberate — driving the real build is precisely what makes TC-COMP-334 meaningful, and version 1 faulted the previous approach for *not* doing so. The costs are real but contained: `npm run test` mutates gitignored files, cannot run safely in parallel with a build, and carries a 60x per-file time penalty that will grow as the suite does. Nothing tracked is modified, so no gate requirement is broken.
- **Required remediation**: None required for this story. Consider separating the build-contract test into its own Vitest project or npm script (for example `test:build`) invoked alongside `npm run build`, so the unit suite stays fast, hermetic and non-mutating, while TC-COMP-334 keeps driving a real build.

### IR-011 — The Tailwind scan reads `theme.extend` only, and skips colours

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-3
- **Tasks**: T012
- **Files**: `web/src/app/shell.tokens.test.tsx:36-41`
- **Claim challenged**: The rework comment at `:13-17` states the Tailwind config is "the actual boundary of the token scale" and that an off-scale value added there would otherwise pass unnoticed.
- **Observed evidence**: The test reads `config.theme?.extend?.spacing ?? {}` (and the same shape for `fontSize` and `height`). Two shapes escape it. First, a scale declared at `theme.spacing` rather than `theme.extend.spacing` — the Tailwind-supported way to *replace* a scale — is not read, and the `?? {}` fallback means the loop silently iterates nothing and passes rather than failing. Second, `theme.extend.colors` (`tailwind.config.js:8-12`) is never scanned, though STD-UI-29's verification covers colour literals as well as spacing and size.
- **Expected evidence/behavior**: STD-UI-29 requires that no spacing, size or colour literal appear outside the theme. A guard whose failure mode on an unexpected config shape is silent success is weaker than its comment claims.
- **Impact**: The config uses `extend` today and every value is a `var(--*)` reference, verified independently in the compiled CSS — so the implementation is genuinely clean and the test genuinely passes on merit. The concern is the guard's durability: the most plausible future refactor (moving to `theme.spacing`) would disable it without any signal.
- **Required remediation**: Optional. Read the merged scale rather than `extend` alone (Tailwind's `resolveConfig` exposes it), assert the scale is non-empty before looping so a shape change fails loudly, and extend the same assertion to `colors`.

### IR-012 — `emptyOutDir: false` accumulates stale hashed assets across builds

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-6
- **Tasks**: T002, T021
- **Files**: `vite.config.ts:7-17`; `Dockerfile:20`
- **Claim challenged**: The rework comment at `vite.config.ts:7-12` states that with `emptyOutDir: false`, "Vite still overwrites `index.html` and `assets/` on every build; it just no longer deletes files it didn't produce."
- **Observed evidence**: The comment is accurate about `index.html`, which has a stable name and is overwritten. It does not hold for `assets/`, whose filenames carry a content hash. After two builds in this review session, `src/factorflow/api/static/assets/` contained five files — `index-A4Tmf5_B.js`, `index-BYctlwuu.css`, `index-C3z4r4Cx.css`, `index-CX6ElUY1.js`, `index-Ckk9f9Dj.js` — of which only two are referenced by the current `index.html`. Each superseded build leaves its assets behind permanently; the directory grows without bound across builds.
- **Expected evidence/behavior**: DAC-E1-S4-6 requires build output to land in the API package's static directory "so one image serves both". `Dockerfile:20` runs `COPY src ./src`, so whatever is in a developer's working tree at image-build time is copied into the image, stale assets included.
- **Impact**: No functional defect and no correctness risk. `index.html` always references the current hashes, so `StaticFiles` serves the right bundle; the stale files are unreachable and gitignored, so they never reach version control. The cost is image size and developer-tree growth — roughly 370 kB per superseded JS build in the observed case, unbounded over time, and copied into any image built from an unclean tree. Fixing IR-001 by disabling `emptyOutDir` traded a correctness defect for a housekeeping one, which is the right trade; this records the remainder.
- **Required remediation**: None required for this story — DAC-E1-S4-6 is satisfied and no tracked file is at risk. Consider a targeted clean that removes `assets/` before each build while leaving `.gitkeep` alone (a `rimraf`-style prebuild step, or Vite's `emptyOutDir` re-enabled with the marker recreated afterwards), or a `.dockerignore` entry so image builds never copy a developer's stale output.

### IR-004 (carried forward) — A `--space-7` rail cannot contain the labels DAC-E1-S4-1 requires

- **Severity**: LOW (reclassified from MEDIUM in version 1)
- **Status**: OPEN — escalated upstream, awaiting the UX design owner
- **Acceptance criteria**: DAC-E1-S4-1, DAC-E1-S4-3
- **Tasks**: T017, T023
- **Files**: `web/src/app/shell.tsx:31`; `design-system/theme.css:224`; `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-design.md:70`
- **Claim challenged**: Whether version 1's required remediation — escalate the conflict and record the resolution — has been discharged.
- **Observed evidence**: The escalation is recorded in the task plan's Notes (`CAP-001-E1-S4-tasks.md:179`), naming the conflict, the reason it is not resolved in code, and the three options owed to the UX design owner. The underlying conflict is confirmed still live upstream: `ux-design.md:70` specifies "a fixed left navigation rail of `--space-7` width", `theme.css:224` defines `--space-7: 3rem` (48px), and `shell.tsx:31` renders `w-7` with four visible text labels including `Instruments` at `--text-base` with `p-3` padding each side. No revision to ux-design §0 has been made.
- **Expected evidence/behavior**: Version 1 required escalation and an explicit prohibition on resolving it by introducing a width outside the scale (STD-UI-29). Both conditions are met: the escalation exists, and `shell.tsx` still uses the specified token.
- **Impact**: The implementation obligation is discharged. What remains is an upstream design decision this story has no authority to make — resolving it in code would violate STD-UI-29, which is why the plan correctly declines to. The rendered rail is still visually wrong in a real browser, but that defect originates in ux-design §0, not in this implementation. Reclassified to LOW: it no longer indicates anything incomplete in this story's work.
- **Required remediation**: None within this story. The UX design owner must revise ux-design §0 — widen the rail to a wider scale value, specify icons with accessible names alongside or instead of visible text, or state that labels wrap. Track it against the UX design artifact, not this story.

### IR-006 (carried forward) — `npm run test:e2e` is defined but cannot execute

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T001
- **Files**: `package.json:9`
- **Claim challenged**: T001 claims the npm scripts the tech stack's validation table names are defined, listing `test:e2e` among them.
- **Observed evidence**: Re-confirmed unchanged. `package.json:9` defines `"test:e2e": "playwright test"` and `@playwright/test` is installed. No `playwright.config.*` and no `tests/e2e/` directory exist, so the script would fail if invoked.
- **Expected evidence/behavior**: The task required the script to be *defined*, and it is. The task plan's Validation Plan omits it.
- **Impact**: None for this story's gate — E2E automation is Phase 6b scope. Recorded so a later agent does not read the script's presence as evidence that an E2E suite exists.
- **Required remediation**: None required for this story. The Phase 6b automation work that first adds an E2E spec should add `playwright.config.ts` alongside it.

### IR-007 (carried forward) — The not-found state is undesigned placeholder copy

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-5
- **Tasks**: T018
- **Files**: `web/src/app/routes.tsx:13-15`
- **Claim challenged**: T018 claims an unmatched route "renders a not-found state inside the shell's main region".
- **Observed evidence**: Re-confirmed unchanged. `NotFound` renders `<p>Not found</p>` — two words, no heading, no explanation, no route back to a valid destination.
- **Expected evidence/behavior**: DAC-E1-S4-5 requires only "a not-found state inside the frame rather than an empty page or a crash", which this meets, and ux-design specifies no copy for this state.
- **Impact**: The criterion is satisfied. The state is thinner than the product's designed states elsewhere, and no design source specifies what it should say.
- **Required remediation**: None required. If a later story or the UX design specifies not-found copy, replace the placeholder then.

### IR-008 (carried forward) — The route-count test asserts against source text, not the route tree

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-12
- **Tasks**: T016
- **Files**: `web/src/app/routes.test.tsx:50-66`
- **Claim challenged**: T016 claims a test asserts "`routes.tsx` declares exactly the five routes this story owns … and no additional top-level route".
- **Observed evidence**: Re-confirmed unchanged. The test reads `routes.tsx` with `readFileSync` and regex-extracts `path="…"` attribute values from the source string.
- **Expected evidence/behavior**: Review constraint 8 — tests should exercise production behavior rather than reproduce implementation structure. The behavioral claim is directly observable by rendering each path.
- **Impact**: The test cannot distinguish a mounted route from a commented-out or unreachable one, and it breaks on a behavior-preserving refactor to an object route config. It holds today and traces correctly. Version 1 marked its remediation optional.
- **Required remediation**: Optional. Render each of the five paths and assert the expected screen appears, and that a sixth plausible path falls through to not-found.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 — `npm run build` deletes a tracked file another story depends on (HIGH) | RESOLVED | `vite.config.ts:17` now sets `emptyOutDir: false` with a comment naming the CAP-001-E1-S6 dependency. Verified live twice: `npm run build` (exit 0) and the build driven by `npm run test` both left `git status --porcelain` byte-identical, with no `D src/factorflow/api/static/.gitkeep`. `ls -la src/factorflow/api/static/` shows `.gitkeep` present; `git ls-files src/factorflow/api/static/` returns it, so the deletion version 1 left as evidence has been restored and the file is tracked again. `app.py:175`'s `if _STATIC_DIR.exists():` guard therefore stays true in a fresh clone. Now additionally guarded by `build-output.test.tsx:31,44-45`. Residual housekeeping consequence recorded as IR-012 |
| v1/IR-002 — Mandatory test TC-COMP-334 is not implemented (HIGH) | RESOLVED | `web/src/app/build-output.test.tsx` implements it as two executing tests. `:26-31` resolves the real Vite config via `resolveConfig` and asserts both the absolute `outDir` and `emptyOutDir === false`; `:34-46` drives a genuine `viteBuild` and asserts `index.html` is emitted and `.gitkeep` survives byte-for-byte. Asserted against resolved configuration and real output rather than config source text, exactly as the remediation required. `npm run test` — 6 files, 15 tests, all passing — collects and runs both. All eight mandatory TC-IDs now exist, so the Phase 4 checkpoint's claim is accurate for the first time |
| v1/IR-003 — The AC-14 test scans two roles where the criterion covers the whole tree (MEDIUM) | RESOLVED | `shell.test.tsx:11` now destructures `container` from `render`, and `:35-38` asserts `container.textContent` does not match the forbidden regex and sweeps every `[role], [aria-label]` element's accessible name. Three of the four regressions version 1 named — an "Account" heading, a `<div>Signed in as owner</div>`, a `role="menu"` user menu — now fail the test. Verified passing. A narrow residue (`<img alt="Profile">`) is recorded as the new IR-009 at LOW rather than treated as this finding still being open |
| v1/IR-004 — A `--space-7` rail cannot contain the labels DAC-E1-S4-1 requires (MEDIUM) | STILL OPEN — escalated as required, reclassified LOW | The remediation version 1 required was escalation plus a recorded resolution, explicitly forbidding a fix that introduces an off-scale width. The escalation is recorded at `CAP-001-E1-S4-tasks.md:179` with the three options owed to the UX design owner. The upstream conflict is verified still live: `ux-design.md:70` still specifies a `--space-7` rail, `theme.css:224` still defines it as `3rem`, and `shell.tsx:31` still renders `w-7`. Not called resolved, because the design has not been revised. Carried forward at LOW: this story's obligation is discharged and the remaining decision belongs to the UX design artifact |
| v1/IR-005 — The token-discipline scan misses the values most likely to breach the scale (MEDIUM) | RESOLVED | `shell.tokens.test.tsx:18` resolves `tailwind.config.js` and `:35-53` imports it, asserting positively that every value in `spacing`, `fontSize` and `height` matches `^var\(--[\w-]+\)$` rather than only asserting absence of literals in `shell.tsx`. The specific breach version 1 named — adding `spacing: { 9: "2.25rem" }` — now fails. Verified passing. Two narrower shapes (`theme.spacing` replacement, and `colors`) remain and are recorded as the new IR-011 at LOW |
| v1/IR-006 — `npm run test:e2e` is defined but cannot execute (LOW) | STILL OPEN | Re-confirmed unchanged: `package.json:9` defines the script, no `playwright.config.*` or `tests/e2e/` exists. Version 1 required no remediation for this story — Phase 6b scope. Carried forward unchanged |
| v1/IR-007 — The not-found state is undesigned placeholder copy (LOW) | STILL OPEN | Re-confirmed unchanged: `routes.tsx:13-15` still renders `<p>Not found</p>`. Version 1 required no remediation; no design source specifies the copy. Carried forward unchanged |
| v1/IR-008 — The route-count test asserts against source text, not the route tree (LOW) | STILL OPEN | Re-confirmed unchanged: `routes.test.tsx:52-54` still uses `readFileSync` and a `path="…"` regex. Version 1 marked remediation optional. Carried forward unchanged |

Both HIGH findings are resolved, both blocking MEDIUM findings are resolved, and
the one MEDIUM carried forward was resolved in the only way this story could
resolve it — by escalating an upstream design conflict rather than breaching
STD-UI-29 to paper over it. No finding is recorded as resolved on the strength of
the rework's own description: each disposition above rests on a file read at the
current working-tree state or a command run during this review.

## Scope and Plan Deviations

- **The rework is uncommitted.** All five rework changes live in the working tree
  at `HEAD` `d9a8da8`. They were reviewed as part of the change set per review
  constraint 6, and every validation command was run against the working tree, so
  the evidence in this report describes the reworked state. The gate verdict
  applies to that state; committing it is the precondition for Doc Sync, and the
  commit must not alter the reviewed content.
- **Branch mismatch in the task plan.** `CAP-001-E1-S4-tasks.md:36` records the
  branch as `usr/alvaro-de-jodra/CAP-001-epics`; the actual branch is
  `usr/alvaro-de-jodra/CAP-001-E1-S4`. Both follow the `usr/<name>/` convention
  and the actual branch is the more specific and correct one for a single story.
  Stale plan metadata, not a scope deviation; noted so a later agent does not act
  on the recorded value.
- **Justified — unnamed but load-bearing files.** `postcss.config.js`,
  `biome.json`, `web/src/index.css` and `web/src/test-setup.ts` are not named by
  any task, but each is required for a named task to have effect (T006, T001,
  T019, T007 respectively). Unchanged from version 1.
- **Justified — flat run-detail route.** `routes.tsx:31` declares `/runs/:runId`
  as a flat sibling `<Route>` rather than a nested `<Route>` with an `Outlet`,
  faithful to ux-design §1.5's full-screen run detail. Every observable
  requirement of DAC-E1-S4-2 holds. Unchanged from version 1.
- **Resolved — `emptyOutDir` deviation.** Version 1 recorded `emptyOutDir: true`
  as a deviation beyond T002's text and the cause of IR-001. The setting is now
  `false` and explicitly documented in the config, which is a deliberate, narrower
  deviation from T002's silence on the matter and the correct one.
- **Addition beyond the plan — the `/` redirect.** `routes.tsx:27` redirects `/`
  to `/coverage`. No task or AC calls for it and none forbids it; some root
  behavior is necessary. Note for a later story: ux-design §2 states that with no
  history depth set the shell routes to **Settings** rather than Coverage. That
  first-run branch depends on settings state no API client yet exposes and is
  outside this story's scope, but the unconditional redirect will need revisiting
  when it lands. Unchanged from version 1.
- **Addition beyond the plan — `build-output.test.tsx`.** Not named by any task,
  but it is the direct and required remediation of v1/IR-002 and implements a
  mandatory TC-ID the coverage matrix already mapped to this story. Justified.
- **Bookkeeping — now accurate.** All 24 boxes remain checked, and all 24 tasks
  verify at the reworked state. The two tasks version 1 recorded PARTIAL (T021,
  T023) are both VERIFIED here, and the Phase 4 checkpoint's claim that all eight
  mandatory TC-IDs are green is now true. No unchecked-but-implemented task was
  found. `last_reworked_review` correctly points at version 1.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Commit the working-tree rework before proceeding — the
  reviewed state is uncommitted, and Doc Sync must operate on the same content
  this gate evaluated. Confirm the commit includes
  `web/src/app/build-output.test.tsx` (currently untracked) and does **not**
  reintroduce the `src/factorflow/api/static/.gitkeep` deletion. Then run Doc Sync
  for `FactorFlow-v2` against this story. Separately, and outside this story's
  gate: the UX design owner must resolve the ux-design §0 rail-width conflict
  (IR-004) before a screen story renders inside this frame at production width.
- **Warnings accepted downstream**: IR-010 (MEDIUM — `npm run test` performs a
  real build, mutating gitignored output and slowing the suite), IR-012 (MEDIUM —
  stale hashed assets accumulate in the output directory across builds), IR-004
  (LOW — upstream ux-design §0 rail-width conflict, escalated), IR-006 (LOW —
  `test:e2e` defined but not runnable, Phase 6b scope), IR-007 (LOW — placeholder
  not-found copy), IR-008 (LOW — route-count test asserts source text), IR-009
  (LOW — AC-14 scan misses an image-only account affordance), IR-011 (LOW —
  Tailwind scan reads `theme.extend` only and skips colours).
