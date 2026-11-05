---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S10-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-05
updated: 2026-11-05
story_id: "CAP-002-E4-S10"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S10.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S10-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-05T19:30:05Z"
reviewed_head: "b26cfe62cd178019f36be0330639c19b1a4b936d"
review_base: "ffec7a0182ace897b1732664abcf7ea8d9de4d19"
reviewed_state_revision: "sha256:d0c4acd75c66237de14509a6a63d7ff65c16978c1f7127d3d01a46daa0e4c7a9"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E4-S10
    artifact_version: 1
    content_revision: sha256:3a66d68e36dfcec7c3c06adcee1292f119488017557f51aa38dd8d0861c2f757
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-05T19:30:05Z
  source_artifacts:
    - id: CAP-002-E4-S10
      version: "1 (sha256:3a66d68e36dfcec7c3c06adcee1292f119488017557f51aa38dd8d0861c2f757)"
    - id: CAP-002-E4-S10-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E4-S10-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-system-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0068
      version: "owner-upheld 2026-10-17"
    - id: DEC-0069
      version: "owner-upheld 2026-10-17"
    - id: DEC-0084
      version: "owner-upheld 2026-10-17"
    - id: DEC-0086
      version: "owner-upheld 2026-10-17"
    - id: DEC-0173
      version: "as amended 2026-10-18, owner-upheld 2026-10-18"
    - id: DEC-0174
      version: "as amended 2026-10-18, owner-upheld 2026-10-18"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S10 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 5/6 satisfied |
| Planned tasks | 13/13 verified |
| Required validation | 5/5 passed |

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 1 · **total 3**

The production edit is correct and minimal. `shell.tsx` appends exactly one
destination, Research at `/research`, after Settings. `routes.tsx` registers the
five `/research` routes before the catch-all, on the paths and parameter names
the screens read. Every required command passes, and the TDD-evidence lint is
clean. The diff stays inside the six delivered files that DAC-E4-S10-4 names.

The gate fails on test strength. My mutation run regenerated 25 mutants by hand,
because the shared catalogue matches no TSX line. Two of them survive both the
focused suite and the whole Vitest suite (2100 tests):

- the Research rail link pointed at `/RESEARCH`;
- the Research rail link pointed at `/research?hide_incomplete=true`.

The only test that reads the Research link's target is T006's `aria-current`
check. React Router's `NavLink` lowercases both pathnames and ignores the query,
so that check cannot tell either mutant from `/research`. DEC-0069 and
classification-ui section 2.2 fix the destination as `/research`, so neither
mutant is equivalent. TC-COMP-194 is `WEAK` for the destination's target, and
DAC-E4-6's "exactly one Research destination" lacks killing test evidence
(IR-001, HIGH).

The other two findings do not block on their own:

- IR-002 (MEDIUM): an unrecorded deviation from the import boundary that
  DEC-0173 and DEC-0174 set.
- IR-003 (LOW): wording made false by the five-destination rail, which DEC-0173
  forbids the coder to change.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S10.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S10-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/app/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S10-run-20261105T174303Z` |
| HEAD | `b26cfe62cd178019f36be0330639c19b1a4b936d` (single story-coding commit, supervised run run-20261105T174303Z; trailers `Decision-Id: DEC-0173`, `Decision-Id: DEC-0174`) |
| Review base | `origin/main` = `ffec7a0182ace897b1732664abcf7ea8d9de4d19`, resolved by `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` and confirmed an ancestor of HEAD (`git merge-base --is-ancestor`) |
| Working tree | clean: `git status --porcelain=v1 -uall` empty before and after validation; ignored `build/` and `.hypothesis/` exist and are not tracked |
| Changed files reviewed | 13 (`git diff --stat ffec7a0..HEAD`: 1937 insertions, 31 deletions) |
| Baseline | none: initial review |
| Pipeline state | `python3 scripts/pipeline-state.py check ... --stage adversarial-review` → `READY` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/app/shell.tsx` | modified | DAC-E4-S10-1, DAC-E4-6; T009 (one `DESTINATIONS` entry, two doc-comment lines) |
| `web/src/app/routes.tsx` | modified | DAC-E4-S10-2, DAC-E4-S10-3; T010 (five imports, five `Route`s, `AppRoutes` doc comment) |
| `web/src/app/shell.test.tsx` | modified | DAC-E4-S10-1; T001 (count, label list, `it()` title, `// Implements`) |
| `web/src/app/shell.a11y.test.tsx` | modified | DAC-E4-S10-1; T002 (count, `// Implements`) |
| `web/src/app/shell.unreachable.test.tsx` | modified | DAC-E4-S10-1, DAC-E4-S10-3; T004 (count, label list, `// Implements`) |
| `web/src/app/routes.test.tsx` | modified | DAC-E4-S10-1/-2/-3/-5; T003, T005-T008 (see IR-002 for the import lines) |
| `docs/.../stories/CAP-002-E4-S10.md` | modified | story-coding bookkeeping: `status: planning` → `in-review`, no other line |
| `docs/.../stories/CAP-002-E4-S10-tasks.md` | modified | bookkeeping: T001-T013 checkboxes only |
| `docs/.../stories/CAP-002-E4-S10-tdd-evidence.yaml` | added | T013 |
| `docs/.../stories/CAP-002-E4-S10-evidence/cycle-1.patch` | added | T013 (`diff_sha256` `bb5273a4…` matches; its six `web/` hunks equal the committed diff) |
| `docs/.../stories/CAP-002-E4-S10-evidence/red-cycle-1.log` | added | T013 (`red_log_sha256` `b2ac7090…` matches) |
| `docs/.../stories/CAP-002-E4-S10-evidence/mutants-cycle-1.json` | added | T013 |
| `docs/.../stories/CAP-002-E4-S10-evidence/mutation-cycle-1-results.json` | added | T013 (`results_sha256` `6463cfd1…` matches) |

`web/src/api/client.ts`, `web/src/screens/research/copy.ts` and `copy.test.ts`
are unchanged (`git diff ffec7a0..HEAD --name-only`). No dependency,
configuration or other delivered file changed.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| DAC-E4-6 | PARTIAL | `web/src/app/shell.tsx:17` `{ label: "Research", to: "/research" }`; `web/src/app/routes.tsx:35-39` five `/research` routes before `path="*"` (line 40) | count assertions `shell.test.tsx:72`, `shell.a11y.test.tsx:37`, `routes.test.tsx:94`, `shell.unreachable.test.tsx:59`; enumeration `routes.test.tsx:136-150`; route-render `routes.test.tsx:254-276` | The production code matches DEC-0069 and classification-ui section 2.2 exactly. Count, label, order, drop and duplicate mutants of the destination are killed. No test pins the destination's target `/research`: the `/RESEARCH` and `/research?hide_incomplete=true` mutants survive (IR-001). The no-other-assertion clause holds (see DAC-E4-S10-4) |
| DAC-E4-S10-1 | SATISFIED | `shell.tsx:12-18` (Coverage, Instruments, Runs, Settings, Research); `routes.tsx:29` `<Navigate to="/coverage" replace />` unchanged | `shell.test.tsx:61-80` and `shell.unreachable.test.tsx:47-67` (exact label list, `toEqual`); `shell.a11y.test.tsx:26-43` (five links, focus order); `routes.test.tsx:84-98`; landing `routes.test.tsx:278-293` | Order-swap, label and drop mutants killed (`shell.tsx:manual:1,3,4`). The landing case asserts the Coverage link is `aria-current="page"` and no CAP-002 stub rendered |
| DAC-E4-S10-2 | SATISFIED | `routes.tsx:5-9` imports bind the five default exports (`screens/research/index.tsx:24`, `stocks/index.tsx:342`, `compare/index.tsx:102`, `universes/index.tsx:50`, `universes/detail/index.tsx:107`); `routes.tsx:35-39` | `routes.test.tsx:254-276` five `it.each` cases (stub in `main`, no `Not found`, `nav-rail`, `status-region`, Research active); `routes.test.tsx:124-151` exact path strings | The route parameter names match what the screens read: `useParams().symbol` (`stocks/index.tsx:343`) and `useParams().universeId` (`universes/detail/index.tsx:108`). Every `/research…` link target in `screens/research` and `components/patterns` points at a registered route (grep). Element-swap, import-swap, parameter-rename, misspelling, splat and path-param mutants are all killed (`routes.tsx:manual:1-17`) |
| DAC-E4-S10-3 | SATISFIED | `shell.tsx:34-37` `MainRegion` (unchanged) replaces `AppRoutes` with `UnreachableState`, so the new routes inherit it | `routes.test.tsx:311-328` five cases: real `fetchHealth` through a rejecting `fetch` spy, `unreachable-state` in `main`, no stub, five rail links | A regression guard by design (DEC-0174 (b), T007): it passes before the routes exist, and the plan says so |
| DAC-E4-S10-4 | SATISFIED | n/a (diff property) | TC-COMP-196 is the review-time audit (DEC-0174 (d)), performed below | Delivered files changed: exactly `shell.tsx`, `routes.tsx` and the four tests. Changed existing assertions: the five counts, the two label lists (DEC-0173), and the route-source length and list. Titles and comments are reworded per DEC-0173's list. Everything else in `routes.test.tsx` is appended describes, the DEC-0174 `vi.mock`s and the `SHELL_ROUTES` import, plus import lines no decision lists (IR-002; imports, not assertions) |
| DAC-E4-S10-5 | SATISFIED | `web/src/screens/research/copy.ts:41-45` `SHELL_ROUTES` (unchanged): `/runs/:runId`, `/runs`, `/instruments` | `routes.test.tsx:335-352` renders `AppRoutes` at `/runs/run-1`, `/runs` and `/instruments`, asserts no router `<p>Not found</p>`, and guards `targets.length >= 3` | A guard by design: the targets are delivered CAP-001 routes |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `shell.test.tsx:60-80` | Count 4→5, `"Research"` appended, title "four"→"five", `// Implements TC-COMP-193`; nothing else changed in the file |
| T002 | complete | VERIFIED | `shell.a11y.test.tsx:25,37` | Count only plus the `// Implements` line, as planned. The loop walks five links (focus asserted per item). The title still says "four" (IR-003) |
| T003 | complete | VERIFIED | `routes.test.tsx:83-98` | Count 4→5; the title reworded exactly as DEC-0173 specifies; the `Runs` `aria-current` assertion kept |
| T004 | complete | VERIFIED | `shell.unreachable.test.tsx:46-67` | Count and label list changed; the route list at line 32 is untouched, as T004 requires |
| T005 | complete | VERIFIED | `routes.test.tsx:121-151` | `toHaveLength(10)`, the sorted ten-path list, the describe title, the `it()` title and the comment above it are as specified, and the regex is unchanged. The inline comment at lines 131-134 still says "Exactly the five routes" (IR-003) |
| T006 | complete | VERIFIED | `routes.test.tsx:12-26` (five `vi.mock` stubs, distinct ids), `routes.test.tsx:242-294` | Implemented as planned, with concrete `AAPL`/`u1` and the landing case. The planned assertion set does not pin the Research link's target (IR-001) |
| T007 | complete | VERIFIED | `routes.test.tsx:296-329` | Deviation: `fetchSpy.mockRestore()` instead of the planned `vi.restoreAllMocks()`. It is justified: on vitest 2.1.9 (`node_modules/vitest/package.json`), `restoreAllMocks` also restores the `vi.fn().mockResolvedValue` doubles in the file-level `../api/client` mock that later describes need. Only the code comment records it (IR-002) |
| T008 | complete | VERIFIED | `routes.test.tsx:331-353` | Renders `AppRoutes`, not `Shell`, as planned; at least three entries asserted. The `Not found` query is narrowed to `selector: "p"` (the router's `NotFound` is a `<p>`, `routes.tsx:15`), a justified deviation recorded in a code comment |
| T009 | complete | VERIFIED | `shell.tsx:9-10,17,41` | One entry with the existing shape, the DEC-0069 removal sentence and the Shell comment "four"→"five". `MainRegion`, `NavLink` props and class names are unchanged |
| T010 | complete | VERIFIED | `routes.tsx:5-9,19-21,35-39` | Five default imports in path order and five `Route`s in the design's order (classification-ui section 2.2) before `*`; each `path` is a plain literal. `NotFound`, `/` and the CAP-001 routes are unchanged |
| T011 | complete | VERIFIED | my rerun: (a) six `web/src/app` files exactly; (b) the three shell test diffs hold only counts, `"Research"` lines, the T001 title and `// Implements` lines; (d) `client.ts` diff empty; (e) `npm run test` 77 files / 2100 tests green with no other suite edited | For (c), the `routes.test.tsx` diff also extends two existing import statements and adds an `AppRoutes` import, beyond the DEC-0173/DEC-0174 list. The evidence file's T011 summary does not mention this (IR-002) |
| T012 | complete | VERIFIED | Validation table rows 3-8 | All five commands pass on the reviewed commit. In place, lint and format trip on an ignored `build/` artifact created after the commit (see Scope and Plan Deviations) |
| T013 | complete | VERIFIED | `CAP-002-E4-S10-tdd-evidence.yaml` cycle-1; lint row 9 | One cycle instead of the planned two, justified in the evidence header (rail mutants need the route tests). The RED log is meaningful: rail 4 failed/17 passed, then routes 6 failed/13 passed with "Not found" in `main`. `commit_hash: stage` matches a once-per-stage commit. The recorded mutation set (13/13 killed) missed the target-mutant class (IR-001) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `shell.test.tsx` "renders exactly five navigation items in order with exact labels" / TC-COMP-193 | ADEQUATE | Exact `textContent` list and count of the rail links; kills drop, reorder, relabel and duplicate mutants | none |
| `shell.a11y.test.tsx` "tabs through all four rail destinations in order" / TC-COMP-193 | ADEQUATE | Five links, `user.tab()` focuses each in DOM order | Stale title (IR-003) |
| `routes.test.tsx` "keeps Runs active and adds no rail item beyond the five destinations…" / TC-COMP-193 | ADEQUATE | Five links at `/runs/run-123`; Runs `aria-current="page"` | none |
| `shell.unreachable.test.tsx` "keeps the navigation rail rendered so the owner is not stranded" / TC-COMP-193 | ADEQUATE | Exact five-label list while unreachable | none |
| `routes.test.tsx` "routes.tsx defines four destination routes, one run-detail child route and five CAP-002 routes" / TC-COMP-194 (enumeration) | ADEQUATE | Reads `routes.tsx` and pins the exact ten path strings, parameter names included; kills drop, rename, misspell and splat mutants | none (a source-reading test, kept by DEC-0084) |
| `routes.test.tsx` "renders the screen for %s inside the shell with Research active" ×5 / TC-COMP-194 | WEAK | Proves each path binds its own screen module inside `main` with the rail and status region present, which kills every element and import swap. The Research link's target is checked only through `aria-current`, and `NavLink` computes that case-insensitively and without the query (`react-router-dom` 6.30.6 `dist/index.js:830-844`) | Survivors `web/src/app/shell.tsx:manual:5` (`to: "/RESEARCH"`) and `:manual:6` (`to: "/research?hide_incomplete=true"`); IR-001 |
| `routes.test.tsx` "still redirects / to /coverage and renders no CAP-002 screen" / TC-COMP-194 (DAC-E4-S10-1 landing) | ADEQUATE | Coverage `aria-current="page"` from `/`; no `stub-*` | none |
| `routes.test.tsx` "replaces main with the unreachable state at %s" ×5 / TC-COMP-195 | ADEQUATE | The real `fetchHealth` path (`client.ts:134`) through a rejecting `fetch` spy; `unreachable-state` inside `main`, no stub, five links; the spy is restored per test and `test-setup.ts` restubs `fetch` | A guard by design; no changed production line for it to kill |
| `routes.test.tsx` "renders no not-found state at any SHELL_ROUTES target" / TC-COMP-197 | ADEQUATE | Renders `AppRoutes` at all three `SHELL_ROUTES` values; would fail if any target fell to the catch-all; `>= 3` guards an emptied map | A guard by design |
| TC-COMP-196 (diff audit) | ADEQUATE | No test file by design (DEC-0174 (d)); I performed the audit from git (DAC-E4-S10-4 row) | Import-line deviation reported as IR-002 |

Isolation and determinism: the new describes use `MemoryRouter`, file-level
hoisted stubs and a per-test `fetch` spy, with no timers, network or order
dependence. The full suite shows no new `act(...)` warning from
`routes.test.tsx`; the warnings in the run come from other stories' suites.

Mutation (E.9): `python3 scripts/mutation-run.py generate --range ffec7a0..HEAD`
produced 0 catalogue mutants, because no catalogue operator matches these TSX
lines. I therefore wrote 25 manual mutants over both changed production files.
They include 11 of the coder's 12 changed-line mutants. The twelfth, a
`/search` target, is a pathname change of the same class as the
`/research/compare` mutant, which `aria-current` detects. Added to them are
target-case,
target-query, trailing-slash, duplicate, element-swap, parameter-rename,
misspelling, splat, import-swap and path-param variants. Results: 23 killed and
2 survived on `vitest run web/src/app`. Both survivors also survive the full
`vitest run` (77 files, 2100 tests). Results are kept beside this report as
`CAP-002-E4-S10-implementation-review-v1-mutation.json`.

## Independent Validation

Working directory for the npm, npx and git rows:
`repos/factorflow-v2/FactorFlow-v2`, unless the row says otherwise.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| 1. `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| 2. `npx vitest run web/src/app` | component root | 0 | PASS | 11 files, 77 tests |
| 3. `npm run test` | component root | 0 | PASS | 77 files, 2100 tests; the build-output test rebuilt the ignored static bundle, and no tracked file changed |
| 4. `npm run lint` | component root (in place) | 1 | FAIL (environment) | Every diagnostic is in `./build/lib/factorflow/api/static/assets/index-fjRZey5x.js`. That directory is ignored (`.gitignore:12 build/`), was created at 12:44 local, after the 12:20 commit (a `uv build` output), and is outside the review subject |
| 4a. `npm run lint` | clean clone of `b26cfe6` in the scratchpad, `node_modules` symlinked | 0 | PASS | "Checked 173 files … No fixes applied." This is the same full command on the exact reviewed commit, without the stray ignored artifact |
| 5. `npm run format` | component root (in place) | 1 | FAIL (environment) | Same `build/` artifact as row 4 |
| 5a. `npm run format` | clean clone of `b26cfe6` | 0 | PASS | "Checked 173 files … No fixes applied." |
| 6. `npx tsc --noEmit` | component root | 0 | PASS | No output |
| 7. `npm run build` | component root | 0 | PASS | 102 modules transformed; the five screen default exports resolve |
| 8. `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `sha256:d0c4acd7…` before validation and after mutation runs (identical) |
| 9. `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S10-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base ffec7a0 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings; the cited log, patch and results hashes recomputed and equal |
| 10. `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range ffec7a0..HEAD --cycle review --out <scratch>/mutants.json` | harness root | 0 | PASS | 0 mutants (no operator matches); 25 manual mutants added |
| 11. `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 4 --command 'cd {workdir} && ln -sfn <component>/node_modules node_modules; node_modules/.bin/vitest run web/src/app' --timeout 300 --out <scratch>/results.json` | harness root | 0 | 23 killed / 2 survived | Four baselines exit 0; survivors `shell.tsx:manual:5`, `shell.tsx:manual:6` (IR-001) |
| 12. Same `run` with `--only` the two survivors and command `… node_modules/.bin/vitest run` | harness root | 0 | 2 survived | Each mutant run: 77 files, 2100 tests passed |
| 13. `npm run test:e2e` | component root (unsandboxed: Docker, ports) | 0 | PASS | Not required: the plan's Validation Plan and the story's Validation list exclude it. I ran it because every CAP-001 Playwright spec renders the edited shell. Result: "18 passed (2.9m)", real API with a PostgreSQL 16 container and the stub provider; `posttest:e2e` removed the container. No spec targets a rail link (grep of `tests/e2e`), so this guards against regressions and is not evidence for any CAP-002 criterion |
| 14. `uv run …` Python commands (`pytest`, `ruff`, `mypy`, `uv build`) | — | N/A | NOT RUN | The change set holds no Python file, and neither the story nor the plan names a Python command |

### Validation Side Effects

- Before: `b26cfe6`, `git status --porcelain=v1 -uall` empty, fingerprint `sha256:d0c4acd75c66237de14509a6a63d7ff65c16978c1f7127d3d01a46daa0e4c7a9`.
- After: `b26cfe6`, status empty, fingerprint unchanged.
- Unexpected tracked-file changes: none. `npm run test` and `npm run build` rewrote the ignored `src/factorflow/api/static/` bundle, as the tech stack documents. Mutation clones and logs live in the session scratchpad, outside the repository.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | The Research rail link's target `/research` is not pinned; two non-equivalent mutants survive |
| IR-002 | MEDIUM | initial | Import edits outside the DEC-0173/DEC-0174 edit boundary, and two plan deviations, are unrecorded |
| IR-003 | LOW | initial | Titles and comments left false by the five-destination rail (DEC-0173's closed list) |

### IR-001 — The Research rail link's target `/research` is not pinned; two non-equivalent mutants survive

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-6 (and the destination half of DAC-E4-S10-1)
- **Tasks**: T006, T013
- **Files**: `web/src/app/shell.tsx:17`; `web/src/app/routes.test.tsx:254-276` (the `aria-current` assertion at 271-274)
- **Claim challenged**: The TDD evidence header says link-target mutants of the `DESTINATIONS` entry are killed by "the route tests (T006)". The recorded mutation run reports 13/13 killed and no survivor.
- **Observed evidence**:
  - Mutant `web/src/app/shell.tsx:manual:5` (`to: "/RESEARCH"`) survives `vitest run web/src/app` (77/77) and the full `vitest run` (2100/2100).
  - Mutant `web/src/app/shell.tsx:manual:6` (`to: "/research?hide_incomplete=true"`) survives both runs as well.
  - The only assertion that reads the Research link's target is `toHaveAttribute("aria-current", "page")`. `NavLink` sets it after lowercasing both pathnames (`caseSensitive = false`) and compares pathnames only, never the search (`react-router-dom` 6.30.6 `dist/index.js:805,830-844`). No test reads the link's `href` or follows it. The CAP-001 rail tests do not either: no `href` assertion exists in `web/src/app`.
- **Expected evidence/behavior**: DEC-0069 and classification-ui section 2.2 append Research **at `/research`** (`{ label: "Research", to: "/research" }`), and DAC-E4-6 requires that one Research destination. Under the skill's rule E.9, a mutant that changes behaviour the contract specifies is not equivalent. Here, the `/RESEARCH` mutant puts a different URL in the address bar and in bookmarks. The `hide_incomplete=true` mutant makes the rail open Research with incomplete stocks hidden, because `decodeResearchQuery` reads it (`web/src/api/research-query.ts:170`). That contradicts S03-1 and AC-12's "incomplete stocks listed unless hidden".
- **Impact**: A regression that changes where the rail sends the owner, by case or by a stray query, passes the whole suite. Today's code is correct, so the risk is the regression path. This story is the seam the future shell capability edits ("removes or replaces this line"), and nothing guards that line's target.
- **Required remediation**: Within the DEC-0174 boundary, meaning an appended describe in `web/src/app/routes.test.tsx` and no new assertion in the three shell test files, pin the Research rail link's target exactly as `/research`, so that both survivors are killed. Rerun the mutation set, including `shell.tsx:manual:5` and `:manual:6` from this report's mutation file, and record the result in the TDD evidence.

### IR-002 — Import edits outside the DEC-0173/DEC-0174 edit boundary, and two plan deviations, are unrecorded

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S10-4 (satisfied; no assertion involved)
- **Tasks**: T007, T008, T011, T013
- **Files**: `web/src/app/routes.test.tsx:4,7,9,299-308,347`
- **Claim challenged**: T011 (c) says the `routes.test.tsx` diff shows only the DEC-0173 edit set, the `vi.mock` calls, the `SHELL_ROUTES` import and the appended describes, "and nothing else". DEC-0173 says "No other existing … import or mock in the four files changes". DEC-0174 (e) says the only additions outside the appended describes are the five `vi.mock` calls and the `SHELL_ROUTES` import.
- **Observed evidence**: `git diff ffec7a0..HEAD -- web/src/app/routes.test.tsx` shows four import changes those records do not list:
  - line 4, existing import extended with `act`;
  - line 7, existing import extended with `type MockInstance, afterEach, beforeEach`;
  - line 9, new `import { AppRoutes } from "./routes"`;
  - T007's planned `vi.restoreAllMocks()` replaced by `fetchSpy.mockRestore()`, which needs `MockInstance`.

  `beforeEach`, `afterEach` and `AppRoutes` are what T007 and T008 themselves require. `act` and `MockInstance` are implementation choices. The `restoreAllMocks` deviation and the `selector: "p"` narrowing in T008 are justified, but only code comments record them. The TDD evidence's T011 summary reports the file list, the unchanged files and the green commands, and is silent on (c).
- **Expected evidence/behavior**: AGENTS.md and `docs/unattended-mode.md` forbid proceeding on an unrecorded assumption. DAC-E4-S10-4 makes the diff a checked artifact under AGT-SCOPE-002, and the owner upheld DEC-0173 and DEC-0174 as the edit boundary. A diff that exceeds the enumerated set, however necessary, should say so where the owner reads it.
- **Impact**: No behaviour or assertion is affected. The owner's AGT-SCOPE-002 confirmation covers a smaller edit list than the one committed, and the T011 audit result overstates conformance.
- **Required remediation**: Record each import change and the two test-shape deviations, with their reason, in the TDD evidence (T011 audit result), or drop the changes that are not required. Leave it to the owner whether DEC-0174 (e) should be amended to name the imports that T007 and T008 need.

### IR-003 — Titles and comments left false by the five-destination rail (DEC-0173's closed list)

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S10-4
- **Tasks**: T002, T005
- **Files**:
  - `web/src/app/shell.a11y.test.tsx:26`, title "tabs through all four rail destinations in order";
  - `web/src/app/shell.test.tsx:57-58`, comment "the rail presents exactly four destinations";
  - `web/src/app/routes.test.tsx:79-81`, comment "no fifth destination appears";
  - `web/src/app/routes.test.tsx:131-134`, comment "Exactly the five routes this story owns: the four destinations plus the run-detail child route", directly above `toHaveLength(10)`.
- **Claim challenged**: DEC-0173's derivation says a title or comment the edit would make false is reworded.
- **Observed evidence**: DEC-0173's closed list does not name these four lines, so the coder correctly left them. The TDD evidence flags only the first, as an owner follow-up.
- **Expected evidence/behavior**: The tests describe what they assert (DEC-0173's own rationale).
- **Impact**: Misleading test documentation, nothing more. A reader meets "four" over a five-link assertion and "five routes" over a ten-route assertion.
- **Required remediation**: Owner decision, not coder work. Either widen DEC-0173 to cover these four lines, and decide whether "the comment above the route-source test" was meant to include lines 131-134, or accept them as they are. The coder changes them only under that amended record.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations.**
  - One TDD cycle instead of the plan's two (Other Notes, cycle plan), with the reason recorded in the evidence header.
  - `fetchSpy.mockRestore()` instead of `vi.restoreAllMocks()` (T007); the reason is true for vitest 2.1.9.
  - The `Not found` query narrowed to the router's `<p>` (T008).
  - Imports ordered alphabetically by path, as T010 asks, rather than in the plan's listing order.

  The last three are recorded only in code comments (IR-002).
- **Bookkeeping.** Every task is checked and has evidence. The story's `status` moved to `in-review`, and the tasks file changed only in its checkboxes. The story commit's last paragraph holds the two `Decision-Id` trailers (`git interpret-trailers --parse` lists both), while `Co-Authored-By` sits in the paragraph before, so git does not parse it as a trailer. This is commit metadata only, with no effect on the review.
- **Out-of-scope changes.** None. No `client.ts`, `copy.ts` or `copy.test.ts` edit; no new dependency or configuration.
- **Environment note, not a finding against this story.** The repository's `biome.json` includes `*.js` and does not ignore `build/**`. After `uv build`, one of the tech stack's validation commands, writes `build/lib/factorflow/api/static/`, both `npm run lint` and `npm run format` fail in place on the bundled JS. This predates the story. The owner may want it tracked separately.

## Follow-Up

- **Next agent**: Coding Agent (story-coding rework), then Adversarial Review Agent (v2)
- **Required action**: Resolve IR-001: pin the Research rail link's target inside `routes.test.tsx`'s appended describes and kill `shell.tsx:manual:5` and `:manual:6`. Record IR-002's deviations in the TDD evidence. Put IR-003 to the owner as a DEC-0173 question. Pass `CAP-002-E4-S10-implementation-review-v1-mutation.json` as `scope --previous` in the next review.
- **Warnings accepted downstream**: N/A
