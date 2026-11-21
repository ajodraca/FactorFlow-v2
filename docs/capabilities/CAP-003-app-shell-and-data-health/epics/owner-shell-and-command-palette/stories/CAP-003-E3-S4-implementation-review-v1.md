---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-21
updated: 2026-11-21
story_id: "CAP-003-E3-S4"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-21T03:54:01Z"
reviewed_head: "895735b38db650a1745f315906aaffd54f88a6e7"
review_base: "9d188dac96a44ce1045479e0cb8c2a6951750f64"
reviewed_state_revision: "sha256:eb1f5efbcc1eee2f0966e4e522826c7dd8c8beb6ec68ef0c85f36b122173638c"
verdict: CHANGES-REQUIRED
reviewed_paths:
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/cycle-1.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/cycle-2.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/cycle-3.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/cycle-4.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/green-cycle-1-legacy-redirects.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/green-cycle-2-destinations-titles.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/green-cycle-3-not-found.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/green-cycle-4-full-suite.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/mutants-cycle-1.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/mutants-cycle-2.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/mutants-cycle-3.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/mutants-cycle-4.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/mutation-cycle-1-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/mutation-cycle-2-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/mutation-cycle-3-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/mutation-cycle-4-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/red-cycle-1-legacy-redirects.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/red-cycle-2-destinations-titles.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/red-cycle-3-not-found.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-evidence/red-cycle-4-route-map.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-tasks.md
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-tdd-evidence.yaml
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4.md
  - web/src/app/destinations.ts
  - web/src/app/legacy-redirects.test.tsx
  - web/src/app/legacy-redirects.tsx
  - web/src/app/not-found.tsx
  - web/src/app/routes.test.tsx
  - web/src/app/routes.tsx
  - web/src/app/shell.tsx
  - web/src/app/shell.unreachable.test.tsx
  - web/src/app/status-region.integration.test.tsx
  - web/src/app/titles.test.tsx
  - web/src/app/titles.ts
  - web/src/screens/research/copy.test.ts
review_subjects:
  - artifact_id: CAP-003-E3-S4
    artifact_version: 1
    content_revision: sha256:716b7210a01d747301f7b108eb383132589b1adc71dbff522c84220d71614a28
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-21T03:54:01Z
  source_artifacts:
    - id: CAP-003-E3-S4
      version: "1 (sha256:716b7210a01d747301f7b108eb383132589b1adc71dbff522c84220d71614a28)"
    - id: CAP-003-E3-S4-tasks
      version: "1 (draft, updated 2026-11-07; T014 and T015 amended under DEC-0402)"
    - id: CAP-003-E3-S4-tdd-evidence
      version: "cycle-1 to cycle-4"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003-component-design-owner-shell
      version: "2"
    - id: CAP-003-ux-design
      version: "2"
    - id: CAP-003-owner-shell-tests
      version: "2 (TC-COMP-056, 057, 058, 077, 078, 079, 080)"
    - id: DEC-0202
      version: "agent, owner upheld"
    - id: DEC-0214
      version: "agent, owner upheld"
    - id: DEC-0223
      version: "owner decision (E3 registers the five delivered screens)"
    - id: DEC-0327
      version: "agent, provisional, open"
    - id: DEC-0328
      version: "agent, provisional, open"
    - id: DEC-0329
      version: "agent, provisional, open"
    - id: DEC-0402
      version: "agent, open"
    - id: testing-constitution
      version: "1.9 (TEST-TDD-005, TEST-TDD-006, TEST-TDD-008)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E3-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 15/17 verified |
| Required validation | 13/14 passed |

Findings: CRITICAL 0 · HIGH 2 · MEDIUM 0 · LOW 2 · **total 4**

| Finding | Severity | Scope | Status |
|---------|----------|-------|--------|
| IR-001 | HIGH | initial | OPEN |
| IR-002 | HIGH | initial | OPEN |
| IR-003 | LOW | initial | OPEN |
| IR-004 | LOW | initial | OPEN |

The route map is correct. `routes.tsx`, `destinations.ts`, `titles.ts`, `legacy-redirects.tsx` and `not-found.tsx` do what the story, owner-shell §2.5 to §2.8 and §5, the epic criteria and the task plan ask, including the three provisional plan decisions (DEC-0327, DEC-0328, DEC-0329). All thirteen acceptance criteria have production evidence and passing tests. Every required command passes on a clean tree: the full Vitest suite (110 files, 2 893 tests), lint, format, `tsc` and the build. The TDD lint reports 0 errors and 0 warnings. I also served the built bundle and drove it in headless Chromium. The four legacy paths land on their new paths with the query kept, and Back skips them. `/` lands on `/home` once health answers.

The gate fails on the mutation check. TEST-TDD-006 says a task is not complete while a changed-line mutant survives. Step E.9 of this skill says no non-equivalent mutant may survive anywhere in the change set. My run of 37 mutants (7 generated, 30 hand-written) over all six changed production files left 7 survivors. Three are equivalent, as recorded under Test Quality. The other four change behaviour that the design and the task plan specify, and no test notices them:

- **IR-001:** `NotFound`'s `h1` carries `tabIndex={-1}`. Owner-shell §2.7 and UX design §0.6 make it the target that focus moves to on a route change, and T012 specifies it. `manual:heading-tabindex-removed` deletes the attribute, and every test stays green. `manual:home-link-variant-outline` restyles the **Home** link from `button` `ghost` to `outline` (owner-shell §10, T012), and it also survives. So TC-COMP-080 (T008) is WEAK.
- **IR-002:** T014 (a) retargets the delivered rail's three legacy links so that `aria-current` stays on the current item (DEC-0327). Only the Coverage retarget is pinned. `manual:rail-followed-legacy` (`/data/followed` back to `/instruments`) and `manual:rail-downloads-legacy` (`/data/downloads` back to `/runs`) both survive the full `web/src/app/` suite.

Also reported:

- **IR-003 (LOW):** the plan's AC-27 diff check is meant to print nothing. It prints the five `/research` lines twice, because wrapping the routes in `Suspense` re-indented them. Ignoring whitespace, it prints nothing. The coder's evidence does not mention this.
- **IR-004 (LOW):** if a later change imports the run-detail screen statically, `routes.test.tsx` hangs instead of failing. The coder's RED run was killed at 60 s, and my mutant hit the 300 s timeout.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/app/`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E3-S4-run-20261121T023550Z` |
| HEAD | `895735b38db650a1745f315906aaffd54f88a6e7` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261121T023549Z` (tip `9d188dac`), which `pipeline-state.py review-base --base-ref` resolved to `9d188dac96a44ce1045479e0cb8c2a6951750f64`. It is an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation (`git status --porcelain` empty). No staged, unstaged or untracked files. The build and the suite write only ignored paths (`src/factorflow/api/static/`) |
| Changed files reviewed | 35 (5 commits: `51ccd4ca`, `e63a9bf3`, `283849ef`, `575edc71` for cycles 1 to 4, and `895735b3` for the status line). Every commit names CAP-003-E3-S4 and no other story |
| Baseline | none: initial review |

`DEC-0402.md`, which the cycle-4 and completion commits cite as a `Decision-Id:`, was untracked in the harness repository when this review ran (`projects/factorflow-v2/decisions/DEC-0402.md`). The TDD lint read it from disk. The driver commits it.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/app/routes.tsx` | modified (rewritten) | T013; AC-2, AC-17, AC-18, AC-27, DAC-E3-1, DAC-E3-4, DAC-E3-S4-3; DEC-0328 |
| `web/src/app/destinations.ts` | added | T011; DAC-E3-2; DEC-0204 |
| `web/src/app/titles.ts` | added | T011; DAC-E3-9, DAC-E3-S4-2; DEC-0214, DEC-0329 |
| `web/src/app/legacy-redirects.tsx` | added | T010; AC-18, DAC-E3-3, DAC-E3-S4-1 |
| `web/src/app/not-found.tsx` | added | T012; DAC-E3-4, DAC-E3-S4-4 |
| `web/src/app/shell.tsx` | modified (3 `to` values, 1 comment line) | T014 (a); DEC-0327 |
| `web/src/app/routes.test.tsx` | modified (rewritten) | T001, T002, T003, T008, T009; TC-COMP-056, 057, 058, 079, 080; keeps TC-COMP-193, 194, 195, 197 |
| `web/src/app/titles.test.tsx` | added | T004, T005; TC-COMP-078 |
| `web/src/app/legacy-redirects.test.tsx` | added | T006, T007; TC-COMP-077 |
| `web/src/app/status-region.integration.test.tsx` | modified (1 line, `getByText` to awaited `findByText`) | T014 (b) |
| `web/src/app/shell.unreachable.test.tsx` | modified (same substitution, plus a 1-line comment) | T014 (b) |
| `web/src/screens/research/copy.test.ts` | modified (case (f) collects paths from both files) | T014 (b) as amended by DEC-0402 |
| `docs/.../stories/CAP-003-E3-S4.md` | modified | Status line only (`planning` to `in-review`) |
| `docs/.../stories/CAP-003-E3-S4-tasks.md` | modified | Checkboxes T001 to T017, plus the DEC-0402 wording in T014 (b) and T015 (story-coding constraint 9) |
| `docs/.../stories/CAP-003-E3-S4-tdd-evidence.yaml` | added | T017; TEST-TDD-005, TEST-TDD-008 |
| `docs/.../stories/CAP-003-E3-S4-evidence/cycle-{1..4}.patch` | added | T017 `reviewed_patch` for each cycle |
| `docs/.../stories/CAP-003-E3-S4-evidence/red-cycle-{1..4}-*.log`, `green-cycle-{1..4}-*.log` | added | T017 RED and GREEN evidence, T016 |
| `docs/.../stories/CAP-003-E3-S4-evidence/mutants-cycle-{1..4}.json`, `mutation-cycle-{1..4}-results.json` | added | T017 `mutation:` blocks |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-2 | SATISFIED | `routes.tsx:50-56` `RootRedirect`: `Navigate replace` to `/setup` when `most_recent_run === null`, otherwise to `/home` | `routes.test.tsx` "redirects an empty install to /setup by replace", "redirects an install with a requested download to /home by replace" | Headless Chromium on the built bundle: `/` lands on `/home` when the stub health reports a run. `/setup` and `/home` render the not-found state until CAP-003-E4-S6 and E5-S5 register them. The plan accepts this (Other Notes, *Registered later*) |
| AC-17 | SATISFIED | `routes.tsx:74-78` registers the five delivered screens at `/data/coverage`, `/data/followed`, `/data/downloads`, `/data/downloads/:runId` and `/settings`, inside the delivered shell's main region. `titles.ts:35-58` gives each one its title | `routes.test.tsx` `it.each(delivered)` (stub plus `data-param` `abc`); `titles.test.tsx` row table | The top bar that renders the title belongs to CAP-003-E3-S6 (plan Resolved Conflict 3) |
| AC-18 | SATISFIED | `legacy-redirects.tsx:16-36` | `legacy-redirects.test.tsx` 7 rows (`REPLACE`, query kept, Back to `/start`) | Headless Chromium: `/runs/abc?x=1` lands on `/data/downloads/abc?x=1`, `/coverage?symbol=KO` on `/data/coverage?symbol=KO`, `/instruments` on `/data/followed` and `/runs` on `/data/downloads`. Back returns to the page before the legacy one |
| AC-27 | SATISFIED | `routes.tsx:79-83`, the five CAP-002 `Route` lines with their delivered text (`git diff -w` shows no change) | `routes.test.tsx` "leaves CAP-002's five Route lines as delivered", `it.each(research)`, TC-COMP-195 and TC-COMP-197 kept | Re-indented by the `Suspense` wrapper (IR-003) |
| DAC-E3-1 | SATISFIED | `routes.tsx:26-41` one `Card` skeleton at `LAYOUT.contentMaxWidth`; `:52` guards on `liveness === "answering" && health !== null` | `routes.test.tsx` "/ — RootRedirect" cases (a) to (g) | The not-a-lock case uses `/data/coverage` and `/settings` because `/data` is not registered yet (plan Resolved Conflict 2) |
| DAC-E3-2 | SATISFIED | `destinations.ts:16-26` | `routes.test.tsx` TC-COMP-057 describe (literal list, path presence, no runtime detection over more than 50 files, single exporter, `expectTypeOf`) | |
| DAC-E3-3 | SATISFIED | `legacy-redirects.tsx`, imported only by `routes.tsx:6` | `legacy-redirects.test.tsx` "one module" describe | |
| DAC-E3-4 | SATISFIED | `routes.tsx:85` `*` to `NotFound`; `titles.ts:57` `*` gives *Page not found* | `routes.test.tsx` TC-COMP-058 (delivered `Shell`, rail present, `h1` and link inside `main`, `resolveTitle`) | |
| DAC-E3-9 | SATISFIED | `titles.ts:35-98` (`TITLES`, `resolveTitle`, `useTitle` over `useTitleDetail`) | `titles.test.tsx` rows, the ancestor-link check, the detail-slot check, and `useTitle()` through `ShellProvider` (set, clear, navigate) | |
| DAC-E3-S4-1 | SATISFIED | `legacy-redirects.tsx:22-26` | `legacy-redirects.test.tsx` row `/runs/abc?x=1` | |
| DAC-E3-S4-2 | SATISFIED | `titles.ts:32-58` | `titles.test.tsx` row table and the route-set equality | |
| DAC-E3-S4-3 | SATISFIED | n/a (test scope) | `routes.test.tsx`. `grep -nE '"/(setup\|home\|data)"'` finds only location-probe URL assertions (lines 352, 360, 366, 572) and the `/home` link `href` (509, 539) | No line queries content at those paths |
| DAC-E3-S4-4 | SATISFIED | `not-found.tsx:21-38` | `routes.test.tsx` TC-COMP-080 (a) to (c) | The criterion holds. The plan bullets beyond it, the `h1` focus target and the ghost styling, are not pinned (IR-001) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `routes.test.tsx:336-413`, with `// Implements TC-COMP-056` | Cases (a) to (g) as planned, on the shared harness (stubs, `deferHealth`, probe, `renderAt`) |
| T002 | complete | VERIFIED | `routes.test.tsx:451-494`, with `// Implements TC-COMP-057` | All five bullets |
| T003 | complete | VERIFIED | `routes.test.tsx:496-512`, with `// Implements TC-COMP-058` | As planned |
| T004 | complete | VERIFIED | `titles.test.tsx:20-112`, with `// Implements TC-COMP-078` | Cases (a) to (d), with the literal table as planned |
| T005 | complete | VERIFIED | `titles.test.tsx:114-222` | Steps (a) to (d). `fetch` is stubbed as planned, and the probe is unmounted at the end |
| T006 | complete | VERIFIED | `legacy-redirects.test.tsx:56-80`, with `// Implements TC-COMP-077` | Seven rows, `REPLACE` and Back. The probe renders only inside `*`, which is enough because every target falls through to it |
| T007 | complete | VERIFIED | `legacy-redirects.test.tsx:82-120` | Length, paths, distinct keys, the registration walk and the importer check |
| T008 | complete | VERIFIED | `routes.test.tsx:514-574`, with `// Implements TC-COMP-080` | The planned cases (a) to (c) are present. Test quality is WEAK (IR-001) |
| T009 | complete | VERIFIED | `routes.test.tsx:214-334`, with `// Implements TC-COMP-079` and TC-COMP-194 and 197 | (a) to (e), plus a DEC-0328 fallback case the coder added for the cycle-4 survivor `fallback-null`. TC-COMP-195 and TC-COMP-193 are kept at `:415-449` |
| T010 | complete | VERIFIED | `legacy-redirects.tsx` | Owner-shell §2.6 code with the planned imports and doc comment |
| T011 | complete | VERIFIED | `destinations.ts`, `titles.ts` | Interfaces, the 16-entry table with `*` last, `resolveTitle` and `useTitle`, all as planned |
| T012 | complete | PARTIAL | `not-found.tsx` | The code matches every T012 bullet. But two of them, the `h1`'s `tabIndex={-1}` and the `ghost` styling of the **Home** link, have no test that kills a mutant of them. TEST-TDD-006 (IR-001) |
| T013 | complete | VERIFIED | `routes.tsx` | Imports, ten lazy bindings, `ShellSkeleton`, `RootRedirect`, `AppRoutes` with one `Suspense`, and the doc comment |
| T014 | complete | PARTIAL | `shell.tsx:14-16`; the `findBy` lines in two delivered tests; `copy.test.ts` (f) | `git diff` shows three `to` changes plus one comment line, as planned. Each delivered-test edit only widens a query or a scanned source and removes no assertion. But two of the three retargets have no test that kills their reversal. TEST-TDD-006 (IR-002) |
| T015 | complete | VERIFIED | `git diff --name-only 9d188dac..HEAD` (35 paths, all justified above). The delivered-file `git diff --exit-code` exits 0. The DAC-E3-S4-3 grep as above | |
| T016 | complete | VERIFIED | Lint, format, `tsc`, build and test all pass (Independent Validation). The build emits separate screen chunks | The AC-27 literal check is not clean as worded (IR-003) |
| T017 | complete | VERIFIED | `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings. Four cycles, each with `code_review_verdict: APPROVED`, `drift_detected: false`, `tests_executed: true`, a structured `mutation:` block and a `reviewed_patch` | Each cycle is committed as it ends, with `commit_hash: stage` (TEST-TDD-008 v1.9; the plan's "no per-cycle commit" wording predates it). Cycle 4's `spec_drift.notes` names DEC-0402, and its commit carries the trailer |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| "/ — RootRedirect" / TC-COMP-056 | ADEQUATE | One skeleton with `data-variant`, `aria-busy` and a literal `1180px`. `/setup` and `/home` by `REPLACE`. Back to `/start`. No redirect on unreachable, or on a stale answer under fake timers. Not a lock. Kills the generated `\|\|` mutant and my `root-static-to-coverage`, `skeleton-aria-busy-dropped`, `skeleton-cap-dropped` and `skeleton-variant-metric` | none |
| DESTINATIONS / TC-COMP-057 | ADEQUATE | Literal list, `RESEARCH_REGISTERED`, every destination's path present in `routes.tsx`, a non-vacuous runtime-detection walk, a single exporter, the type. Kills `research-registered-negated`, `settings-group-primary` and `settings-gains-count` | none |
| Unknown path inside the frame / TC-COMP-058 | ADEQUATE | Delivered `Shell`, rail present, `h1` and `/home` link inside `main`, and `resolveTitle` | The top bar is CAP-003-E3-S6's (plan Resolved Conflict 3) |
| Legacy redirects / TC-COMP-077 | ADEQUATE | Seven literal rows, `REPLACE`, and Back to `/start`. Kills `duplicate-key`, `run-detail-target-trailing-slash` and `runs-to-detail-pattern`. The coder's cycle-1 results record nine more killed | none |
| Titles / TC-COMP-078 | ADEQUATE | Route-set equality, 18 exact rows, ancestors linked with the last crumb as text, the detail slot only where one exists, and the empty detail falling back to the noun. Kills all four generated mutants and `param-name-not-value`, `star-fallback-lost`, `ancestor-to-dropped`, `legacy-run-detail-titled`, `root-titled` and `universes-link-dropped` | none |
| `useTitle()` (T005) | ADEQUATE | Real `ShellProvider`. Set, clear and navigate on a mounted probe | none |
| Route map / TC-COMP-079 (T009) | ADEQUATE | Five stubs with parameters, CAP-002's five routes, the text of the five lines, the `SHELL_ROUTES` landings, 16-pattern equality, code splitting, and the DEC-0328 fallback. Kills `coverage-static-import`, `downloads-renders-detail`, `settings-renders-coverage`, `stock-param-renamed` and `suspense-removed` | `run-detail-static-import` hangs the file rather than failing (timeout), IR-004 |
| NotFound / TC-COMP-080 (T008) | WEAK | Section role and tag, `Card` parent, `h1` text, link `href`, exact text, forbidden terms with a non-vacuity check, Home as the first tab stop, Enter navigates. Kills `heading-level-2` and `heading-copy-changed` | `heading-tabindex-removed` and `home-link-variant-outline` survive. `home-link-unstyled` also passes the suite and fails only `tsc`, on the unused `Button` import (IR-001) |
| Delivered `shell.a11y.test.tsx` "aria-current" (unchanged) | WEAK for T014 | Pins only the Coverage retarget (at `/coverage`, which now redirects) | `rail-followed-legacy` and `rail-downloads-legacy` survive (IR-002) |
| Delivered TC-COMP-193, 194, 195 and 197, kept in `routes.test.tsx` | ADEQUATE | Still assert Research reachability, the unreachable state on every CAP-002 route, and the `SHELL_ROUTES` landings | none |
| Edited delivered tests (`status-region.integration`, `shell.unreachable`, `copy.test` (f)) | ADEQUATE | Only `getBy` to awaited `findBy`, and the scanned source widened to `legacy-redirects.tsx`. Every assertion unchanged (`git diff`) | none |

**Equivalent survivors** (3 of 7):

- `not-found.tsx:24:off-by-one:1` changes a criterion number inside a `biome-ignore` comment. A comment has no behaviour. I agree with the coder's cycle-3 call.
- `not-found.tsx:26:off-by-one:1` changes `tabIndex={-1}` to `{-2}`. HTML gives every negative `tabindex` the same meaning: focusable by script, not a tab stop. Owner-shell §2.7 specifies exactly that behaviour. I agree with the coder's cycle-3 call.
- `titles.ts:manual:first-match-not-kept` removes `break`, so the last match wins instead of the first. No two non-`*` patterns in `TITLES` (T011's list, owner-shell §2.6's table) match the same pathname at `end: true`, because they differ in a static segment or in segment count. So `resolveTitle` returns the same crumbs for every input, and which match wins is never observable.

**Mutation summary:** 37 mutants. 28 killed, 1 timeout (detected), 1 stillborn, 7 survived (3 equivalent, 4 not). Determinism: six back-to-back runs of `web/src/app/` and `copy.test.ts` all passed (19 files, 661 tests each). The order dependence inside `routes.test.tsx` (load snapshot first, detail gate unreleased) is deliberate and documented at `:214-226`.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story docs/.../CAP-003-E3-S4.md --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261121T023549Z` | harness root | 0 | PASS | `READY`; story score 0.953 over 4 cycles (41 of 43 killed, 2 called equivalent). Without `--base-ref` it reports `BLOCKED` (upstream-incomplete), because it reads against the remote default branch |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261121T023549Z` | harness root | 0 | PASS | `9d188dac96a44ce1045479e0cb8c2a6951750f64`, an ancestor of HEAD |
| `npx vitest run web/src/app/routes.test.tsx web/src/app/titles.test.tsx web/src/app/legacy-redirects.test.tsx` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files, 69 tests (37 + 22 + 10) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 110 files, 2 893 tests |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome, 247 files, no diagnostics |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome, 247 files, nothing to fix |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Includes T002's `expectTypeOf` |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite emits about 20 JS chunks, one per lazily loaded screen plus shared ones (T016's more-than-one check) |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Not required. The story's *Validation* lists five commands without it, and the plan records that the delivered `/runs/{id}` URL assertions go red until CAP-003-E7-S7 |
| `python3 scripts/check-tdd-evidence.py --evidence .../CAP-003-E3-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 9d188dac… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-score.py score --evidence .../CAP-003-E3-S4-tdd-evidence.yaml --project-repo repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | 0.953. Informational, since the project declares no minimum |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 9d188dac…..HEAD --cycle review --out <scratch>/mutants.json`, plus 30 manual mutants | harness root | 0 | PASS | 7 generated (off-by-one 2, negate-boolean 4, drop-field-copy 1), 37 in all |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 4 --timeout 300 --stillborn-pattern 'error TS[0-9]+' --command "cd '{workdir}' && ln -sfn …/node_modules node_modules && npx vitest run web/src/app/ web/src/screens/research/copy.test.ts && npx tsc --noEmit" --out <scratch>/review-mutation.json` | harness root | 3 | FAIL | All four baselines exit 0. 28 killed, 1 timeout, 1 stillborn, 7 survived. 4 of the survivors are not equivalent (IR-001, IR-002). Copied beside this report as `-mutation.json` |
| `grep -nE "localStorage\|sessionStorage"` over the five new or rewritten sources | `repos/factorflow-v2/FactorFlow-v2` | 1 | PASS | No match |
| AC-26: `grep -nE '[0-9]+(px\|rem\|em\|vh\|vw)\b\|#[0-9a-fA-F]{3,8}\b'` over the five sources | `repos/factorflow-v2/FactorFlow-v2` | 1 | PASS | No match |
| AC-27: `git diff -U0 9d188dac..HEAD -- web/src/app/routes.tsx \| grep -E '^[-+].*path="/research'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | It prints the five lines as `-` and `+`. They differ only in indentation, and the same pipeline with `git diff -w` prints nothing (exit 1). The plan says it should print nothing (IR-003) |
| T015: `git diff --exit-code 9d188dac..HEAD -- web/src/main.tsx web/src/screens/ web/src/api/ web/src/components/ web/src/app/health.tsx web/src/app/layout.ts web/src/app/shell-context.tsx web/src/app/status-region.tsx tests/e2e/ ':!web/src/screens/research/copy.test.ts'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Delivered files unchanged |
| T015: `grep -nE '"/(setup\|home\|data)"' web/src/app/routes.test.tsx` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | URL and `href` assertions only |
| AC-18 by hand, in headless Chromium: the built `src/factorflow/api/static/` served by a scratch SPA-fallback server with a stub `/api/health`, then a Playwright script visiting each legacy path, `/`, `/settings` and `/nope` and pressing Back | scratch | 0 | PASS | All four legacy paths land on their new paths with the query kept. Back returns to the page before. `/` goes to `/home`. No page errors. The plan's version runs against the real API, which needs PostgreSQL. The redirect is client-side, so the stub server only stands in for the SPA fallback |

Required validation counted in the Gate Summary (14): the focused suites, `npm run test`, lint, format, `tsc`, build, the TDD lint, the mutation run, the storage grep, the AC-26 grep, the AC-27 diff check, T015's two checks, and the AC-18 browser check. Thirteen pass. The mutation run fails.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-003-E3-S4-run-20261121T023550Z`, HEAD `895735b3`, `git status --porcelain` empty.
- After: same HEAD, `git status --porcelain` empty. Ignored paths only: `node_modules/` and the build output under `src/factorflow/api/static/`.
- Unexpected tracked-file changes: none. The mutants ran in clones under the reviewer's scratch directory, outside the component repository.

## Findings

### IR-001 — NotFound: the `h1` focus target and the Home link's `ghost` styling are not pinned by any test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S4-4 (the criterion holds; the gap is in the task and the test)
- **Tasks**: T008, T012
- **Files**: `web/src/app/not-found.tsx:26` (`<h1 tabIndex={-1} …>`), `:31` (`<Button asChild variant="ghost">`); `web/src/app/routes.test.tsx:514-574`
- **Claim challenged**: T012 is complete, and TC-COMP-080 (T008) pins `NotFound`.
- **Observed evidence**: Two manual mutants pass all 19 files of `web/src/app/` plus `copy.test.ts` (661 tests) and `tsc`:
  - `not-found.tsx:manual:heading-tabindex-removed`, `<h1 tabIndex={-1} …>` to `<h1 …>`;
  - `not-found.tsx:manual:home-link-variant-outline`, `variant="ghost"` to `variant="outline"`.

  A third, `home-link-unstyled`, drops the `Button` wrapper. It also passes every test, and only `tsc` rejects it, for the now unused import. T008 (c) checks that the **Home** link is the first tab stop. That still holds when the `h1` has no `tabindex` at all, so it does not distinguish `-1` from no attribute. No test reads the link's styling variant, although `Button` exposes it as `data-variant` on the rendered anchor.
- **Expected evidence/behavior**:
  - Owner-shell §2.7: "focus moves to the routed screen's `h1` (rendered with `tabIndex={-1}`)". UX design §0.6 (line 277): "After a route change, focus moves to the main region's `h1`".
  - T012: "The `tabIndex` is the focus target owner-shell §2.7 names, which CAP-003-E3-S6 moves focus to", and "The link is styled from `button` `ghost` tokens (owner-shell §10 component mapping)". Owner-shell §10 lists "the not-found **Home** link" under `button` `ghost`.
  - TEST-TDD-006: a task is not complete while a changed-line mutant survives.
- **Impact**: Without `tabIndex={-1}`, `h1.focus()` does nothing, so CAP-003-E3-S6's focus-on-route-change would leave focus on the page that was left whenever the owner reaches an unknown address. That is a keyboard and screen-reader regression (STD-UI-24). CAP-003-E3-S6's review mutates only its own lines, so nothing would catch this seam. The styling survivor lets the link drift from the component mapping without any test noticing.
- **Required remediation**: TC-COMP-080's tests must fail when the `NotFound` heading stops being programmatically focusable, or stops being the specified non-tab-stop focus target, and when the **Home** link is no longer rendered with the `button` `ghost` variant. Rerun the mutation run so that both manual mutants above are killed.

### IR-002 — T014's interim rail: the Instruments and Runs retargets are not pinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (T014 is interim compatibility; DEC-0327 cites AC-25 and STD-UI-24 for `aria-current`)
- **Tasks**: T014
- **Files**: `web/src/app/shell.tsx:15-16`; `web/src/app/shell.a11y.test.tsx:45-59` (delivered, unchanged)
- **Claim challenged**: T014 (a) is complete, and the rail keeps `aria-current="page"` correct after the move.
- **Observed evidence**: `shell.tsx:manual:rail-followed-legacy` (`to: "/data/followed"` to `"/instruments"`) and `shell.tsx:manual:rail-downloads-legacy` (`to: "/data/downloads"` to `"/runs"`) both survive the whole `web/src/app/` suite and `tsc`. The only test that reads `aria-current` is the delivered *exposes the active destination via aria-current*, and it visits `/coverage`, so it pins only the Coverage retarget. The coder's cycle-4 run mutated only that one (`rail-coverage-legacy`).
- **Expected evidence/behavior**: T014 (a) changes all three `to` values so that `aria-current="page"` stays on the current rail item. DEC-0327's derivation: "Retargeting the rail keeps the owner's `aria-current` correct, which AC-25 and STD-UI-24 need, rather than only silencing a test". TEST-TDD-006 forbids marking the task complete while changed-line mutants survive.
- **Impact**: If either retarget were reverted, the owner on *Followed stocks* or *Downloads* would see no current rail item, and a screen reader would announce none. The rail exists only until CAP-003-E3-S6 replaces it, but a short-lived effect does not lower the severity.
- **Required remediation**: Some test must fail when the Instruments or the Runs rail item does not target its new path, or does not carry `aria-current="page"` at that path. Rerun the mutation run so that both manual mutants above are killed.

### IR-003 — The plan's AC-27 diff check does not print nothing, and the evidence does not say so

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-27
- **Tasks**: T016
- **Files**: `web/src/app/routes.tsx:79-83`; the tasks file *Story-Specific Validation*, AC-27 line
- **Claim challenged**: The cycle-4 evidence says every validation step is clean. The plan says `git diff -U0 web/src/app/routes.tsx | grep -E '^[-+].*path="/research'` "prints nothing: the five lines are untouched".
- **Observed evidence**: The pipeline prints ten lines, the five `/research` routes removed and re-added. They differ only in indentation, because T013's prescribed `Suspense` wrapper nests them one level deeper. `git diff -w` prints nothing, and the unit test compares the trimmed lines.
- **Expected evidence/behavior**: A validation step whose literal outcome differs from the plan's is reported in the evidence with the reason, not passed over in silence.
- **Impact**: None on behaviour, because AC-27 holds. A later reader running the plan's command would see an unexplained failure.
- **Required remediation**: Record in the story's evidence that the AC-27 check holds only ignoring whitespace, and why.

### IR-004 — A static import of the run-detail screen hangs `routes.test.tsx` instead of failing it

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-17 (owner-shell §5 code splitting)
- **Tasks**: T001 (shared harness), T009 (e)
- **Files**: `web/src/app/routes.test.tsx:33-71` (`detailGate`, and the `../screens/runs/detail` mock awaiting it)
- **Claim challenged**: T009 (e) catches a screen that is statically imported.
- **Observed evidence**: `routes.tsx:manual:run-detail-static-import` timed out at 300 s, against about 10 s for every other mutant. In the coder's `red-cycle-4-route-map.log`, run 1 was "killed at 60 s" for the same reason: the module never finishes loading because nothing releases the gate.
- **Expected evidence/behavior**: Tests that are isolated and deterministic and that fail on the regression they guard (skill E.6). The harness follows the plan's T001 design, so this is an improvement, not a defect.
- **Impact**: The regression is still detected, but as a hung run that needs an outer timeout rather than a failing assertion with a message.
- **Required remediation**: Optional. Make a static import of the run-detail screen fail `routes.test.tsx` within bounded time.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **DEC-0402 (justified, recorded).** `web/src/screens/research/copy.test.ts` (f) now collects the declared paths from `legacy-redirects.tsx` as well as `routes.tsx`. Otherwise T007 and T010, which move `/runs`, `/runs/:runId` and `/instruments` out of `routes.tsx`, turn it red. Every assertion is unchanged. The coder amended T014 (b) and T015's wording to authorize the edit, as story-coding constraint 9 allows: the decision is named in cycle 4's `spec_drift.notes` and carried as a `Decision-Id:` trailer. The new T014 (b) bullet also restates the `shell.unreachable.test.tsx` `findBy` edit, which the plan already listed. DEC-0402 is open and not yet owner-reviewed.
- **Per-cycle commits.** The plan's T017 says no per-cycle commit is made. The coder committed each cycle with `commit_hash: stage`, as TEST-TDD-008 v1.9 now requires.
- **Added test.** `routes.test.tsx:227-234` tests the DEC-0328 `Suspense` fallback, which no task lists. It kills the cycle-4 `fallback-null` survivor. It is justified by T013 and DEC-0328.
- **Known interim states, per the plan.** `/`, the not-found **Home** link and the *Data health* crumb point at `/setup`, `/home` and `/data`, which render the not-found state until CAP-003-E4-S6, E5-S5 and E6-S7 register them (Other Notes, *Registered later*). The delivered e2e specs that assert `/runs/{id}` URLs are red until CAP-003-E7-S7. `RootRedirect` polls health through its own fallback until CAP-003-E3-S6 mounts `health.tsx`'s provider (Other Notes, *The interim health read*).
- **Not raised.** `LegacyRunDetail` neither encodes `runId` nor keeps the URL hash. This is owner-shell §2.6's code verbatim, DAC-E3-3 requires only the search string, and run IDs are UUIDs.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework CAP-003-E3-S4 from `CAP-003-E3-S4-tasks.md` and this report. Close IR-001 and IR-002 with tests that kill the four named manual mutants (`not-found.tsx:manual:heading-tabindex-removed`, `not-found.tsx:manual:home-link-variant-outline`, `shell.tsx:manual:rail-followed-legacy`, `shell.tsx:manual:rail-downloads-legacy`; definitions in `CAP-003-E3-S4-implementation-review-v1-mutation.json`), and record IR-003 in the evidence. IR-004 is optional. Then rerun `$adversarial-review`, which will scope against this report's `reviewed_head` and mutation results.
- **Warnings accepted downstream**: N/A
