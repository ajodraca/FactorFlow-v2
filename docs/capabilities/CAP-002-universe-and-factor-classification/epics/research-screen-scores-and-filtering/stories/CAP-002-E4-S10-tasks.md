---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S10-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-18
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-18T01:40:00Z
  source_artifacts:
    - id: CAP-002-E4-S10
      version: "1"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-system-design
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E4-S10 — Shell Composition: Research Destination, Five Routes and Updated Shell Tests

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S10.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`)
**Branch**: `usr/alvaro-de-jodra/CAP-002-E4-tasks`
**Date**: 2026-10-17

## Summary

Composes the CAP-002 screens into the delivered shell at its seam (DEC-0068, DEC-0069, DEC-0084) and writes no screen. `web/src/app/shell.tsx` gains one `DESTINATIONS` entry, Research at `/research`, after Settings; `web/src/app/routes.tsx` gains five `Route` elements under `/research` before the catch-all, importing `ResearchScreen` (E4-S9), `UniversesScreen` (E1-S7), `UniverseDetailScreen` (E1-S9), `CompareScreen` (E5-S1) and `StockEvidenceScreen` (E5-S3). Four delivered tests move their navigation-item count from four to five, `routes.test.tsx`'s route-source assertion gains the five `/research` paths, and new route-render, unreachable-state and `SHELL_ROUTES` assertions are appended to `routes.test.tsx` only. `requestJson`'s `export` is E4-S1's. The change is tiny in code and strict in scope: AGT-SCOPE-002 makes the diff itself a checked artifact (DAC-E4-S10-4).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| DAC-E4-6 | One Research destination, five `/research` routes at the seam; the five count/enumeration assertions move, no other assertion changes (AGT-SCOPE-002) | T001-T012 |
| DAC-E4-S10-1 | Rail reads Coverage, Instruments, Runs, Settings, Research in order; landing redirect unchanged | T001, T002, T003, T004, T009, T011 |
| DAC-E4-S10-2 | Each of the five `/research` paths renders its screen inside the shell | T005, T006, T010 |
| DAC-E4-S10-3 | The unreachable state applies to every CAP-002 route | T007, T010 |
| DAC-E4-S10-4 | Only `shell.tsx`, `routes.tsx` and the four tests change; no assertion other than the five counts and the route-source enumeration changes | T001-T005, T011 |
| DAC-E4-S10-5 | `SHELL_ROUTES` link targets point at delivered routes | T008 |

Mapped test cases (all from `tests/component/classification-ui-tests.md`, confirmed in `tests/coverage-matrix.md` lines 93 and 203-207): TC-COMP-193 (DAC-E4-S10-1), TC-COMP-194 (DAC-E4-S10-2), TC-COMP-195 (DAC-E4-S10-3), TC-COMP-196 (DAC-E4-S10-4), TC-COMP-197 (DAC-E4-S10-5); the matrix maps no other TC to DAC-E4-6 or a DAC-E4-S10-* criterion. Each spec body is one generic line with "no further cases are invented"; the AC is the source of truth and the plan sharpens each into concrete assertions below (Resolved Conflict 1).

## Phase 1: Setup

Skipped. No dependency, configuration or new file. vitest (`root: web`, `jsdom`, `globals`, jest-dom through `web/src/test-setup.ts`), `@testing-library/react`, `react-router-dom` v6 and biome already cover the edits.

---

## Phase 2: Tests (TDD)

**Purpose**: Make the four delivered tests and the route-source assertion describe the five-destination shell, and add the new route assertions, all before `shell.tsx` and `routes.tsx` change. Edits to existing `it()` blocks are limited to the lines, titles and comment named here (Open Gap 1, DEC-0173); every other existing assertion, title, comment, fixture, import and mock in the four files stays byte-identical. The only additions outside the appended describes are T006's five `vi.mock` calls and T008's `SHELL_ROUTES` import, both in `routes.test.tsx` (Open Gap 2, DEC-0174). Line numbers are those of the delivered files at this plan's date; re-read them at coding time and edit by content, not by number.

### Mandatory Component Tests

- [ ] T001 Implement TC-COMP-193 (Rail reads five destinations in order; landing redirect unchanged), rail half 1, in `web/src/app/shell.test.tsx` (DAC-E4-S10-1, DAC-E4-6): in the test "renders exactly four navigation items in order with exact labels" change `expect(items).toHaveLength(4)` (line 71) to `5` and add `"Research"` after `"Settings"` in the `toEqual` list that follows (lines 72-77). Reword the `it()` title from "renders exactly four navigation items in order with exact labels" to "renders exactly five navigation items in order with exact labels": "four" becomes "five" and no other word changes (a title is not an assertion; Open Gap 1, DEC-0173). Add a `// Implements TC-COMP-193` comment above the edited test. Touch nothing else in the file, including the landing-redirect and vocabulary tests. Expected RED: the rail has four links
- [ ] T002 [P] Implement TC-COMP-193 rail half 2 in `web/src/app/shell.a11y.test.tsx` (DAC-E4-S10-1): change `expect(items).toHaveLength(4)` (line 36) to `5` and nothing else. The `for (const item of items) { await user.tab(); expect(item).toHaveFocus(); }` loop that follows then walks five links with no further edit; confirm that by reading it. Add `// Implements TC-COMP-193`. Expected RED: four links
- [ ] T003 [P] Implement TC-COMP-193 rail half 3 in `web/src/app/routes.test.tsx` (DAC-E4-S10-1): in "keeps Runs active and adds no fifth rail item when a run detail route opens" change `expect(items).toHaveLength(4)` (line 75) to `5`; the following `Runs` `aria-current="page"` assertion stays. The `it()` title says "adds no fifth rail item", which is false after this change: replace that phrase with "adds no rail item beyond the five destinations", so the title reads "keeps Runs active and adds no rail item beyond the five destinations when a run detail route opens" (Open Gap 1, DEC-0173). Add `// Implements TC-COMP-193`. Expected RED: four links
- [ ] T004 [P] Implement TC-COMP-193 rail half 4 in `web/src/app/shell.unreachable.test.tsx` (DAC-E4-S10-1, DAC-E4-S10-3): in "keeps the navigation rail rendered so the owner is not stranded" change `expect(items).toHaveLength(4)` (line 58) to `5` and add `"Research"` after `"Settings"` in the `toEqual` list (lines 59-64). Do not add `/research` routes to the `for (const route of [...])` list at line 38: DAC-E4-S10-4 forbids new assertions in this file and T007 covers the CAP-002 routes in `routes.test.tsx`. Add `// Implements TC-COMP-193`. Expected RED: four links
- [ ] T005 Implement the route-source enumeration edit in `web/src/app/routes.test.tsx` (DAC-E4-6, DAC-E4-S10-2; supplies the "five counts" fifth edit): in "routes.tsx defines four destination routes plus one run-detail child route" (lines 105-118) change `toHaveLength(5)` to `10` and replace the sorted expected list with the delivered five plus `"/research"`, `"/research/compare"`, `"/research/stocks/:symbol"`, `"/research/universes"`, `"/research/universes/:universeId"` (the existing `.sort()` on both sides stays). In the `describe` title replace "exactly five routes" with "exactly ten routes"; reword the `it()` title and the comment above the route-source test so they state ten routes as four destination routes, one run-detail child route and five CAP-002 routes (Open Gap 1, DEC-0173). The regex `path=["']([^"']+)["']` is unchanged; `routes.tsx` must therefore write each `path` as a plain string literal attribute, which T010 does. Add `// Implements TC-COMP-194 (route-source enumeration)`. Expected RED: five paths
- [ ] T006 [P] Implement TC-COMP-194 (Five research routes render inside the shell) as a new `describe("Routes — CAP-002 routes render inside the shell (DAC-E4-S10-2)")` appended at the end of `web/src/app/routes.test.tsx`: add five file-level `vi.mock` calls beside the existing `vi.mock("../api/client", ...)`, one per screen module (`../screens/research`, `../screens/research/stocks`, `../screens/research/compare`, `../screens/research/universes`, `../screens/research/universes/detail`), each `() => ({ default: () => <p data-testid="stub-…">…</p> })` with a distinct id (`research`, `stock-evidence`, `compare`, `universes`, `universe-detail`). The `vi.mock` calls are hoisted and, with T008's `SHELL_ROUTES` import, are the only additions outside the appended describes; they change no existing assertion (Open Gap 2, DEC-0174). A table-driven `it` per path with a concrete symbol and id: `/research`, `/research/stocks/AAPL`, `/research/compare`, `/research/universes`, `/research/universes/u1`. Each renders `<MemoryRouter initialEntries={[path]}><Shell /></MemoryRouter>`, `await settleHealthPoll()`, then asserts the stub is inside `screen.getByRole("main")`, the `nav-rail` and `status-region` test ids are present, no `Not found` text is in `main`, and the rail link named *Research* has `aria-current="page"` (NavLink matches descendants, so it stays active on the four child paths; this is also the check that `/research/universes/u1` does not leave the rail with no active item). Add a final case that `/` still redirects to `/coverage` (the landing redirect is unchanged: the Coverage link is `aria-current="page"` and no stub rendered). Add `// Implements TC-COMP-194`. Expected RED: every path falls to the catch-all
- [ ] T007 [P] Implement TC-COMP-195 (Unreachable state applies to every CAP-002 route) as a new `describe` appended to `web/src/app/routes.test.tsx` (DAC-E4-S10-3): `beforeEach` `vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"))` (the real `fetchHealth` turns a transport failure into `ApiUnreachableError`, `web/src/api/client.ts` line 134, and `test-setup.ts` documents that tests stub `fetch` for health), `afterEach` `vi.restoreAllMocks()` so the default stub from `test-setup.ts` is back for every other describe in the file. For each of the five paths, render `Shell` in a `MemoryRouter`, `await within(main).findByTestId("unreachable-state")`, and assert the stub for that route is absent from `main` and the `nav-rail` is present with five links. The designed copy is asserted once by `shell.unreachable.test.tsx` and is not repeated here. Add `// Implements TC-COMP-195`. Expected RED: because the stub is not routed yet the unreachable state still shows, so this case passes before T010; it is a regression guard, and the plan says so (Open Gap 2)
- [ ] T008 [P] Implement TC-COMP-197 (SHELL_ROUTES link targets point at delivered routes) as a new `describe` appended to `web/src/app/routes.test.tsx` (DAC-E4-S10-5): `import { SHELL_ROUTES } from "../screens/research/copy"`; for every value of `SHELL_ROUTES` (a string is used as is, a function is called with `"run-1"`), render `AppRoutes` from `./routes` (not `Shell`) in a `MemoryRouter` at that target and assert `Not found` is absent. Assert there are at least three entries (download detail, Data health, followed stocks) so an emptied map fails. Do not edit `copy.ts` or `copy.test.ts` (S2 owns them; `copy.test.ts` T007 (f) already reads `routes.tsx` for the same targets, this one proves it by rendering). Add `// Implements TC-COMP-197`. Expected: passes before and after (the targets are delivered CAP-001 routes); a regression guard, not a RED test

### Additional Unit Tests

None. The five mapped cases cover every story criterion, and the edit boundary is a diff check, not a unit test (T011). Resolved Conflict 1 explains why TC-COMP-196 has no test task.

**Checkpoint**: T001-T005 and T006 are failing; T007 and T008 pass as guards (T007 passes because the unreachable state replaces `main` on every route today). No production code changed.

---

## Phase 3: Core Implementation

**Purpose**: The two production edits, one line of data and five elements. Nothing else in either file changes.

- [ ] T009 Add the Research destination in `web/src/app/shell.tsx` (DAC-E4-S10-1; DEC-0069; depends on T001-T004 existing): append `{ label: "Research", to: "/research" },` after the Settings entry of `DESTINATIONS`, matching the existing object shape, trailing comma and `as const`. Update only the lines that would now be false: the doc comment on `DESTINATIONS` and the `Shell` comment that say "four destinations" read "five" (comments are not assertions, and the design's section 2.2 snippet carries the DEC-0069 line "the shell capability removes or replaces this line"; add that sentence to the `DESTINATIONS` comment). No change to `MainRegion`, `HealthProvider`, `StatusRegion`, class names, `NavLink` props or the landing redirect (which lives in `routes.tsx`). Makes T001-T004 pass
- [ ] T010 Register the five routes in `web/src/app/routes.tsx` (DAC-E4-S10-2, DAC-E4-S10-3; DEC-0068, DEC-0084; depends on T005, T006 existing and on E4-S9, E1-S7, E1-S9, E5-S1 and E5-S3 being on the branch): add five default imports in the file's existing import style and alphabetical-by-path order, `ResearchScreen` from `../screens/research`, `StockEvidenceScreen` from `../screens/research/stocks`, `CompareScreen` from `../screens/research/compare`, `UniversesScreen` from `../screens/research/universes`, `UniverseDetailScreen` from `../screens/research/universes/detail` (each screen's story delivers an `index.tsx` default export; read the shipped files at coding time and use their actual export names, Open Gap 3), and five elements immediately before the `path="*"` catch-all, in the design's order (classification-ui section 2.2): `<Route path="/research" …/>`, `/research/stocks/:symbol`, `/research/compare`, `/research/universes`, `/research/universes/:universeId`, each `path` a plain string literal so the T005 regex sees it. Update the `AppRoutes` doc comment's "four destinations" sentence to include the five CAP-002 routes. Do not touch `NotFound`, the `/` redirect or the CAP-001 routes. Makes T005, T006 pass; T007 and T008 stay green

**Checkpoint**: `npx vitest run web/src/app` is green; `git diff --name-only` lists exactly `web/src/app/shell.tsx`, `web/src/app/routes.tsx` and the four test files.

---

## Phase 4: Integration

**Purpose**: Prove nothing else in the delivered product moved (AGT-SCOPE-002, TC-COMP-196).

- [ ] T011 Audit the diff and run the whole web suite (TC-COMP-196, DAC-E4-S10-4; depends on T009, T010): (a) `git diff --name-only -- web/src/app` shows exactly the six files, and `git status --short` shows no other delivered file modified by this story (new files from earlier E4 stories are theirs); (b) `git diff -U0 -- web/src/app/shell.test.tsx web/src/app/shell.a11y.test.tsx web/src/app/shell.unreachable.test.tsx` shows only the count lines, the added `"Research"` label lines, the `shell.test.tsx` `it()` title rewording (T001, the only title edit in these three files), and the `// Implements` comments; (c) the `routes.test.tsx` diff shows only the line-75 count and its `it()` title (T003), the route-source test's count, sorted list, `describe` title, `it()` title and the comment above the route-source test (T005), the `// Implements` comments, the added `vi.mock` calls and `SHELL_ROUTES` import (DEC-0174), and the appended describes — the DEC-0173 edit set plus the DEC-0174 additions, and nothing else; (d) `git diff -- web/src/api/client.ts` is empty here (E4-S1's export is its own); (e) run `npm run test` unfiltered and confirm `shell.layout`, `shell.tokens`, `shell.status-region`, `status-region*`, `build-output` and every CAP-001 screen suite pass unmodified. If any other test breaks on the fifth rail item, STOP and record it in the TDD evidence: that is a DEC-0084 omission to report, not a test to quietly edit. Record the audit result in the TDD evidence file

**Checkpoint**: Only the six named files differ from `HEAD`, aside from the story status line and `dependencies.yaml` planning edits; every delivered test is green.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [ ] T012 Run `npm run format` (a check; `biome format .` does not write), fix any report with `npx biome format --write` on the six touched files only, then `npm run lint`, `npx tsc --noEmit`, `npm run test` and `npm run build`. The build must succeed with the five new imports (a missing default export fails here). No behaviour change
- [ ] T013 After each TDD cycle in T001-T012 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E4-S10-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC). The cycles are listed in Other Notes

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E4-S9 | hard | `routes.tsx` imports the default export `ResearchScreen` from `web/src/screens/research/index.tsx`; existing graph edge |
| CAP-002-E1-S7 | hard | `routes.tsx` imports `UniversesScreen` from `web/src/screens/research/universes/index.tsx`; existing graph edge |
| CAP-002-E1-S9 | hard | `routes.tsx` imports `UniverseDetailScreen` from `web/src/screens/research/universes/detail/index.tsx`; existing graph edge |
| CAP-002-E5-S1 | hard | `routes.tsx` imports `CompareScreen` from `web/src/screens/research/compare/index.tsx`; existing graph edge |
| CAP-002-E5-S3 | hard | `routes.tsx` imports `StockEvidenceScreen` from `web/src/screens/research/stocks/index.tsx`; existing graph edge |
| CAP-002-E4-S2 | hard | `routes.test.tsx` (T008) imports `SHELL_ROUTES` from `web/src/screens/research/copy.ts`, created by S2; direct edge added to `dependencies.yaml` (S10 already depends on S2 through S9, so no cycle) |
| CAP-002-E4-S1 | context | The story's Description says the `requestJson` export is S1's; this plan edits no `client.ts` line and T011 (d) checks the diff is empty |
| CAP-002-E1-S8 | context | The universe detail page mounts E1-S8's tabs; `routes.tsx` imports only E1-S9's `index.tsx`, and T006 stubs the whole module |
| CAP-002-E5-S2 | context | The stock evidence screen mounts E5-S2's history tab; reached only through E5-S3, and stubbed in T006 |

One hard edge was added to `dependencies.yaml`: `CAP-002-E4-S10` now reads `[CAP-002-E4-S2, CAP-002-E4-S9, CAP-002-E1-S7, CAP-002-E1-S9, CAP-002-E5-S1, CAP-002-E5-S3]`. No cycle (S2 depends on S1 only); no unknown ID. Every other story ID cited in this plan is classified above.

### Task Dependencies

- T001-T008: no dependencies on production code (T001-T005 are edits to four existing files; T003, T005, T006, T007 and T008 all edit `routes.test.tsx`, so write them in one sitting even though they are listed [P] by file: parallel agents must not edit that file at once)
- T009: depends on T001-T004 existing
- T010: depends on T005, T006 existing and on S9, E1-S7, E1-S9, E5-S1, E5-S3 on the branch
- T011: depends on T009, T010
- T012: depends on T011
- T013: interleaved, runs after every TDD cycle and before the next begins

### Parallel Opportunities

- Phase 2: T001, T002, T004 are independent files; T003 and T005-T008 share `routes.test.tsx` and must be sequenced
- Phase 3: T009 and T010 touch different files and can run concurrently once their tests exist

---

## Validation Plan

### Constitution-Defined Commands
- Build: `npm run build`
- Test: `npm run test` (while iterating: `npx vitest run web/src/app`)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit` (named in the story's Technical Details; not in the tech-stack table)

Working directory is the repository root `repos/factorflow-v2/FactorFlow-v2`. The tech-stack file's Validation Commands table lists `npm run build`, `npm run test`, `npm run test:e2e`; lint and format come from `package.json` and the story. `npm run test:e2e` is not run: this story names no Playwright spec.

### Story-Specific Validation
- DAC-E4-S10-1: T001-T004 assertions show five links in the order Coverage, Instruments, Runs, Settings, Research and `/` still redirecting to `/coverage` (T006 last case)
- DAC-E4-S10-2: T006 shows all five paths rendering their screen inside `main` with the rail and status region present and Research active; T005 shows `routes.tsx` declares exactly the ten named paths
- DAC-E4-S10-3: T007 shows the unreachable state replacing `main` on all five paths with the rail still present
- DAC-E4-S10-4: T011 diff audit (TC-COMP-196)
- DAC-E4-S10-5: T008 renders every `SHELL_ROUTES` target and finds none unrouted
- Delivered surface: `npm run test` unfiltered green with no CAP-001 test edited beyond the Open Gap 1 list

---

## Notes

### Resolved Conflicts

1. **Generic test bodies and a diff-only case.** TC-COMP-193 to 197 each read as one generic line with "no further cases are invented". The AC is the source of truth, so the plan sharpens each into concrete assertions (Phase 2). TC-COMP-196's precondition and step are `git diff`, which no vitest test reads; the plan treats it as the review-time audit in T011, not as a test file. Not a conflict.
2. **"No assertion other than the five counts and the route-source enumeration changes" versus the label lists.** `shell.test.tsx` lines 72-77 and `shell.unreachable.test.tsx` lines 59-64 assert the rail's labels in the same `it()` as the count, so a count of five with four labels cannot pass, and DAC-E4-S10-1 requires the rail to read Research last. Governing rule: story acceptance criteria outrank the story's own Description prose, and the Description says "navigation-item count". The label lists gain `"Research"`, and the titles and comment Open Gap 1 names are reworded; nothing else in the existing `it()` blocks changes. DEC-0084 lists the same edits by their count lines only. Recorded as DEC-0173 (Open Gap 1).
3. **The register's "render without the router".** The story says the screens' own component tests render without the router; the register (u010) says this refers to `AppRoutes`, and E4-S9's plan found its tests need a `MemoryRouter`. Confirmed: nothing in this plan renders a real CAP-002 screen. T006 and T007 stub the five screen modules; the `Shell` renders `AppRoutes` inside a `MemoryRouter`.
4. **Register check.** The resolution register (shell edit list, `requestJson` is S1's, four count edits plus the route-source assertion) matches the story, DEC-0084 and the delivered files, with one addition: the register is silent on the label lists and on test titles that would become false (Resolved Conflict 2 and Open Gap 1). No register correction beyond that.

### Open Gaps

1. **Edit boundary inside the existing `it()` blocks. PROVISIONAL — awaiting owner confirmation (2026-10-17). Recorded as DEC-0173.** No artifact says whether the label-order `toEqual` lists and the titles/comments saying "four" or "five routes" are inside the allowed edit. Adopted: the count and the label list in the same `it()` are one assertion about the rail's contents and change together; four titles and one comment that would otherwise be false are reworded, and no others: the `shell.test.tsx` `it()` title "four" → "five" (T001), the `routes.test.tsx` line-75 `it()` title "adds no fifth rail item" → "adds no rail item beyond the five destinations" (T003), and in the route-source test the `describe` title "exactly five routes" → "exactly ten routes" and the `it()` title and the comment above the route-source test restated as four destination routes, one run-detail child route and five CAP-002 routes (T005); each edited test gains one `// Implements` comment; no other existing assertion, title, comment, fixture, import or mock in the four files changes. The five `vi.mock` calls and the `SHELL_ROUTES` import that T006 and T008 add to `routes.test.tsx` are new content decided by DEC-0174 (Open Gap 2). Follow-up: system design section 8 question 4 and classification-ui section 7 (the shell composition row) should list the label lists and the reworded titles beside the four count lines at their next revision, so the owner's AGT-SCOPE-002 confirmation covers them.
2. **Shape of the new assertions. PROVISIONAL — awaiting owner confirmation (2026-10-17). Recorded as DEC-0174.** The test specification is generic and the story says only that new route-render assertions stay in `routes.test.tsx`. Adopted: the five screen modules are `vi.mock`ed to stubs (hoisted file-level mocks which, with T008's `SHELL_ROUTES` import, are the only additions outside the appended describes), the unreachable case spies on `fetch` inside its own describe and restores it, `SHELL_ROUTES` is checked by rendering `AppRoutes` at each target, and TC-COMP-196 is the T011 diff audit. T007 and T008 are regression guards that pass before the production edit; the plan says so rather than pretending they are RED. Follow-up: test design may restate TC-COMP-194 to 197 as concrete cases at its next revision.
3. **Screen export names and paths. Not a product decision.** The designs fix the five element names (`ResearchScreen`, `StockEvidenceScreen`, `CompareScreen`, `UniversesScreen`, `UniverseDetailScreen`) and the stories fix each `index.tsx` path, but none of the five stories is coded. T010 imports them as default exports on the `export default function CoverageScreen()` convention the delivered screens follow; if a shipped file exports differently, use its actual export and tell the owner. The designs' snippet (section 2.2) is illustrative.
4. **Active rail state on child routes. Not a gap.** `NavLink` in `shell.tsx` has no `end` prop, so Research stays `aria-current="page"` on every `/research/...` path and on no other; CAP-001's `/runs/:runId` behaves the same way and its test (T003) already relies on it. T006 asserts it for the five new paths.
5. Owner-directed fix (cross-plan review 2026-10-18, E4-F09): DEC-0173 now lists the title and comment rewording of T001, T003 and T005 edit by edit (shell.test.tsx `it()` title "four" → "five"; routes.test.tsx line-75 `it()` title "adds no fifth rail item" → "adds no rail item beyond the five destinations"; route-source `describe` title "exactly five routes" → "exactly ten routes", with its `it()` title and the comment above the route-source test stating four destination routes, one run-detail child route and five CAP-002 routes), limits its closing sentence to existing content, and assigns T006's `vi.mock` calls and T008's `SHELL_ROUTES` import to DEC-0174 — DEC-0173 listed only the route-source `it()` title and comment, called line 75 "count only" and forbade any new import or mock, so this plan cited it for edits it did not authorise; no approved artifact fixes the title wording (the story limits assertions, and a title is not an assertion), and dropping the rewording instead would leave titles DEC-0173's own derivation calls false ("adds no fifth rail item" over a five-item assertion, "declares exactly five routes" over ten paths).

### Other Notes

- **Cycle plan for T013.** Two TDD cycles, each RED then GREEN, each reviewed before the next: (1) T001-T004 then T009 (the rail: count edits, label lists and the `DESTINATIONS` entry); (2) T005, T006 (and the guards T007, T008) then T010 (the routes). T011 and T012 change no behaviour; T011's audit result goes into the evidence file's final entry. If the second cycle's review wants a smaller change set, split the enumeration edit (T005) from the new describes.
- **Code order.** S10 is coded after S9, E1-S7, E1-S9, E5-S1 and E5-S3 (E5 is a later epic, deliberately: the graph orders it, DEC-0086). `routes.tsx` cannot compile before all five exist; if one is missing, STOP and report rather than writing a placeholder screen.
- **Stories this plan builds on.** `routes.tsx` imports one screen from each of CAP-002-E4-S9 (Research), CAP-002-E1-S7 (Universes list), CAP-002-E1-S9 (Universe detail), CAP-002-E5-S1 (Compare) and CAP-002-E5-S3 (Stock evidence); `routes.test.tsx` imports `SHELL_ROUTES` from CAP-002-E4-S2. CAP-002-E4-S1 owns the `requestJson` export, CAP-002-E1-S8 the detail tabs and CAP-002-E5-S2 the history tab; none of the three is touched or imported here.
- **Story status.** The story's `status` moves from `todo` to `planning` in this change; no other story line is touched.
- **Risk.** The largest risk is a test elsewhere in `web/src/app` or a screen suite that counts rail items and was missed by DEC-0084. A grep of the delivered tests at planning time found `toHaveLength(4)` only at the four named lines, and `shell.status-region.test.tsx` iterates labels by name; T011 (e) re-checks by running the full suite. The second risk is the hoisted `vi.mock` of five modules affecting the CAP-001 tests in `routes.test.tsx`: they mock only research modules those tests never render, and T011 (c) confirms the existing describes change only by the DEC-0173 edit set (T003, T005).
