---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S10-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-05
updated: 2026-11-05
story_id: "CAP-002-E4-S10"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S10.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S10-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-05T19:45:28Z"
reviewed_head: "cc4506825e6309a522f0d7dce232de470648419f"
review_base: "ffec7a0182ace897b1732664abcf7ea8d9de4d19"
reviewed_state_revision: "sha256:9fc47154aa6bee22060f25a9daefbb19ad5776e39bcb5e3ad505b74648f26c6a"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-11-05T19:45:28Z
  source_artifacts:
    - id: CAP-002-E4-S10
      version: "1 (sha256:3a66d68e36dfcec7c3c06adcee1292f119488017557f51aa38dd8d0861c2f757)"
    - id: CAP-002-E4-S10-tasks
      version: "1 (updated 2026-11-05, last_reworked_review v1)"
    - id: CAP-002-E4-S10-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-002-E4-S10-implementation-review
      version: "1 (baseline; reviewed_head b26cfe62cd178019f36be0330639c19b1a4b936d)"
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
      version: "as amended 2026-11-05 (owner-widened, review v1 IR-003)"
    - id: DEC-0174
      version: "as amended 2026-10-18, owner-upheld 2026-10-18"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S10 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 6/6 satisfied |
| Planned tasks | 13/13 verified |
| Required validation | 5/5 passed |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

The rework resolves all three v1 findings, and the production code is unchanged
since v1 (`git diff b26cfe6..HEAD` touches no production line).

- **IR-001 (v1, HIGH) is resolved.** An appended `routes.test.tsx` describe
  (lines 355-375) asserts that the Research rail link's `href` is exactly
  `/research`. My rerun of v1's 25 mutants kills all 25, including the two
  former survivors, `shell.tsx:manual:5` (`/RESEARCH`) and `:manual:6`
  (`/research?hide_incomplete=true`).
- **IR-002 (v1, MEDIUM) is resolved.** The finding's remediation offered two
  ways to close it: record the changes or drop them. The coder recorded them.
  The TDD evidence header (lines 9-16) names each import change beyond
  DEC-0173 and DEC-0174, and the two test-shape deviations, each with its
  reason. It leaves the DEC-0174 (e) question to the owner, as v1 asked.
- **IR-003 (v1, LOW) is resolved.** The owner widened DEC-0173 on 2026-11-05.
  The four lines that amendment names were reworded, and no assertion changed.

Every required command passes in place. The TDD-evidence lint is clean. The
review mutation run (33 mutants) leaves one survivor, a late, equivalent
relative-path mutant. Two LOW findings remain, and neither blocks:

- IR-001: imprecise cycle-2 TDD evidence (delta).
- IR-002: two delivered shell tests outside the story's edit boundary still
  say "four destinations" (late; the owner decides).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S10.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S10-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/app/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S10-run-20261105T174303Z` |
| HEAD | `cc4506825e6309a522f0d7dce232de470648419f`. Commits since the base: `b26cfe6` (story coding), `07947d8` (review v1), `7c7856b` (rework; trailer `Decision-Id: DEC-0173`, parsed by `git interpret-trailers`), `cc45068` (cycle-2 evidence) |
| Review base | `origin/main` = `ffec7a0182ace897b1732664abcf7ea8d9de4d19`, resolved by `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` and confirmed an ancestor of HEAD (`git merge-base --is-ancestor`) |
| Working tree | Clean: `git status --porcelain=v1 -uall` was empty before and after validation. Ignored `.hypothesis/`, `node_modules/`, caches and the static bundle exist; the `build/` folder v1 reported is gone |
| Changed files reviewed | 51 (`git diff --stat ffec7a0..HEAD`: 8774 insertions, 37 deletions). That is 8 modified and 43 added, 29 of them cycle-2 mutation logs |
| Baseline | v1 (`CAP-002-E4-S10-implementation-review-v1.md`, CHANGES-REQUIRED), `reviewed_head` `b26cfe62cd178019f36be0330639c19b1a4b936d`, mutation file `CAP-002-E4-S10-implementation-review-v1-mutation.json` |
| Pipeline state | `python3 scripts/pipeline-state.py check ... --stage adversarial-review` → `READY — review changes were reworked; a new review version is required` |

### Changed Files

Since the baseline (`git diff b26cfe6..HEAD`), only tests and evidence
changed: the three web test files, the tasks file, the TDD evidence, and new
evidence and review files. The full set since the review base:

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/app/shell.tsx` | modified (unchanged since v1) | DAC-E4-S10-1, DAC-E4-6; T009 |
| `web/src/app/routes.tsx` | modified (unchanged since v1) | DAC-E4-S10-2, DAC-E4-S10-3; T010 |
| `web/src/app/shell.test.tsx` | modified | T001. Rework: line 57 comment "four" → "five" (DEC-0173 amendment item 2) |
| `web/src/app/shell.a11y.test.tsx` | modified | T002. Rework: line 26 title "four" → "five" (DEC-0173 amendment item 1) |
| `web/src/app/shell.unreachable.test.tsx` | modified (unchanged since v1) | T004 |
| `web/src/app/routes.test.tsx` | modified | T003, T005-T008. Rework: lines 80 and 131-132 comments (DEC-0173 amendment items 3, 4); appended describe at lines 355-375 (v1 IR-001, inside DEC-0174's "new describe blocks are appended to routes.test.tsx only") |
| `docs/.../stories/CAP-002-E4-S10.md` | modified | Bookkeeping, `status: in-review` (unchanged since v1) |
| `docs/.../stories/CAP-002-E4-S10-tasks.md` | modified | Bookkeeping: checkboxes (v1); rework adds `updated: 2026-11-05` and `last_reworked_review: CAP-002-E4-S10-implementation-review-v1.md` only |
| `docs/.../stories/CAP-002-E4-S10-tdd-evidence.yaml` | added | T013. Rework: header lines 9-18 (v1 IR-002) and cycle-2 |
| `docs/.../CAP-002-E4-S10-evidence/cycle-1.patch`, `red-cycle-1.log`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json` | added | T013, cycle-1 (verified in v1) |
| `docs/.../CAP-002-E4-S10-evidence/cycle-2.patch` | added | T013. `sha256` `8e5283f5…` equals `diff_sha256`. With `index` lines stripped, it equals `git diff b26cfe6 7c7856b -- web/` |
| `docs/.../CAP-002-E4-S10-evidence/red-cycle-2.log`, `green-cycle-2.log`, `code-review-cycle-2.txt`, `spec-drift-cycle-2.txt` | added | T013. Each hash recomputed and equal to the evidence file |
| `docs/.../CAP-002-E4-S10-evidence/mutants-cycle-2.json`, `mutation-cycle-2-results.json`, `mutation-cycle-2-results-logs/` (29 logs) | added | T013. `results_sha256` `707199b5…` matches, and all 29 log hashes equal the results' `log_sha256` values |
| `docs/.../stories/CAP-002-E4-S10-implementation-review-v1.md`, `-v1-mutation.json` | added | Review v1 (reviewer-authored, commit `07947d8`) |

`web/src/api/client.ts`, `web/src/screens/research/copy.ts` and `copy.test.ts`
are unchanged. No dependency, configuration or other delivered file changed.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| DAC-E4-6 | SATISFIED | `web/src/app/shell.tsx:17` `{ label: "Research", to: "/research" }` (DEC-0069; `component-design-classification-ui.md:263`); `web/src/app/routes.tsx:35-39` five `/research` routes before `path="*"` (line 40) | Count assertions: `shell.test.tsx:72`, `shell.a11y.test.tsx:37`, `routes.test.tsx:94`, `shell.unreachable.test.tsx:59`. Enumeration: `routes.test.tsx:136-150`. Route render: `routes.test.tsx:254-276`. Target: `routes.test.tsx:369-373`, `href` exactly `/research` | Now pinned: case, query, hash, trailing-slash, child-path, drop, duplicate, reorder and relabel mutants of the destination are all killed (`shell.tsx:manual:1-10`). The no-other-assertion clause holds (DAC-E4-S10-4 row) |
| DAC-E4-S10-1 | SATISFIED | `shell.tsx:12-18`; `routes.tsx:29` `<Navigate to="/coverage" replace />` unchanged | `shell.test.tsx:60-80` and `shell.unreachable.test.tsx` (exact five-label list); `shell.a11y.test.tsx:25-43`; `routes.test.tsx:82-99`; landing `routes.test.tsx:278-293`; destination target `routes.test.tsx:359-375` | Order, label, drop and target mutants killed |
| DAC-E4-S10-2 | SATISFIED | `routes.tsx:5-9` (default imports), `routes.tsx:35-39` | `routes.test.tsx:254-276` (five `it.each` cases); `routes.test.tsx:124-152` (exact ten path strings) | Element, import, parameter, misspelling and splat mutants all killed, including my new import-swap mutants for `ResearchScreen`, `CompareScreen` and `UniverseDetailScreen` and the `/research/stock/:symbol` and `:universeId/*` paths (`routes.tsx:manual:18-22`) |
| DAC-E4-S10-3 | SATISFIED | `shell.tsx:34-37` `MainRegion` (unchanged) | `routes.test.tsx:296-329` (five cases through a rejecting `fetch` spy) | A regression guard by design (DEC-0174 (b), T007) |
| DAC-E4-S10-4 | SATISFIED | n/a (diff property) | TC-COMP-196 is the review-time audit (DEC-0174 (d)), performed here | Delivered files changed: exactly `shell.tsx`, `routes.tsx` and the four tests. The rework changes no existing assertion. It rewords the four comment and title lines DEC-0173's 2026-11-05 amendment lists, and appends one describe. The three import edits outside DEC-0173/DEC-0174 are now recorded in the TDD evidence (v1 IR-002) |
| DAC-E4-S10-5 | SATISFIED | `web/src/screens/research/copy.ts` `SHELL_ROUTES` (unchanged) | `routes.test.tsx:331-353` | A guard by design |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `shell.test.tsx:57,60-80` | Count, label list, title and `// Implements` as planned. The describe comment now says "five" under the DEC-0173 amendment |
| T002 | complete | VERIFIED | `shell.a11y.test.tsx:25-26,37` | Count, `// Implements`, and the title now "five" (DEC-0173 amendment item 1) |
| T003 | complete | VERIFIED | `routes.test.tsx:79-99` | Count and title as planned. The TC-COMP-330 comment is reworded (DEC-0173 amendment item 3) |
| T004 | complete | VERIFIED | `shell.unreachable.test.tsx` count and label list | Unchanged since v1; the route list is untouched, as T004 requires |
| T005 | complete | VERIFIED | `routes.test.tsx:121-152` | Count, sorted list, describe and `it()` titles and the comment above as planned. The inline comment at lines 131-134 now states the ten-route split (DEC-0173 amendment item 4) |
| T006 | complete | VERIFIED | `routes.test.tsx:12-26,242-294`; IR-001 describe `routes.test.tsx:355-375` | The appended describe adds the target check the plan's assertion set lacked. It is a new describe, which DEC-0174 permits, and adds no import or mock |
| T007 | complete | VERIFIED | `routes.test.tsx:296-329` | The `mockRestore()` deviation is justified (v1) and now recorded in the TDD evidence header, lines 13-14 |
| T008 | complete | VERIFIED | `routes.test.tsx:331-353` | The `selector: "p"` deviation is justified and now recorded in the header, lines 15-16. The `act` import is used at line 347 |
| T009 | complete | VERIFIED | `shell.tsx:9-10,17,41` | Unchanged since v1 |
| T010 | complete | VERIFIED | `routes.tsx:5-9,19-21,35-39` | Unchanged since v1 |
| T011 | complete | VERIFIED | My audit: (a) six `web/src/app` files exactly; (b) the three shell test diffs hold only counts, `"Research"` labels, `// Implements` lines and the titles and comments DEC-0173 (as amended) lists; (c) the `routes.test.tsx` diff holds the DEC-0173 edits, the DEC-0174 additions, the appended describes and three import lines; (d) `client.ts` unchanged; (e) `npm run test` 77 files, 2101 tests | (c) now matches the T011 audit text in the evidence header, apart from the line count (IR-001) |
| T012 | complete | VERIFIED | Validation rows 3-7 | All five commands pass in place |
| T013 | complete | VERIFIED | `CAP-002-E4-S10-tdd-evidence.yaml` cycle-1 and cycle-2; lint row 9 | Cycle-2 names commit `7c7856b`. Its RED log shows each v1 survivor failing only the new test (1 failed, 77 passed) and 78 passing unmutated. Its review and drift files exist. The patch equals the commit. The cycle's task list omits T001 and T003 (IR-001) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `shell.test.tsx` "renders exactly five navigation items in order with exact labels" / TC-COMP-193 | ADEQUATE | Exact `textContent` list and count | none |
| `shell.a11y.test.tsx` "tabs through all five rail destinations in order" / TC-COMP-193 | ADEQUATE | Five links, each focused in DOM order | none; title now true |
| `routes.test.tsx` "keeps Runs active and adds no rail item beyond the five destinations…" / TC-COMP-193 | ADEQUATE | Five links at `/runs/run-123`; Runs `aria-current="page"` | none |
| `shell.unreachable.test.tsx` "keeps the navigation rail rendered so the owner is not stranded" / TC-COMP-193 | ADEQUATE | Exact five-label list while unreachable | none |
| `routes.test.tsx` "links the Research rail item to /research" / TC-COMP-193 (new) | ADEQUATE | Renders `Shell` at `/coverage`, where Research is not active. It settles the health poll, then reads the Research link's `href` with an exact `toHaveAttribute("href", "/research")`. The DOM `href` is the router's resolved path, including case, search and hash, so it observes what `aria-current` cannot | none. Kills `shell.tsx:manual:5`, `:6`, `:9` (`/Research`) and `:10` (`/research#top`). No `act(...)` warning in an isolated run of the file |
| `routes.test.tsx` "routes.tsx defines four destination routes, one run-detail child route and five CAP-002 routes" / TC-COMP-194 | ADEQUATE | Exact ten path strings from source | none |
| `routes.test.tsx` "renders the screen for %s inside the shell with Research active" ×5 / TC-COMP-194 | ADEQUATE | Each path binds its own stub inside `main` with rail and status region, Research active. With the new `href` test, the destination's target is pinned too (v1's WEAK rating is lifted) | none |
| `routes.test.tsx` "still redirects / to /coverage and renders no CAP-002 screen" / TC-COMP-194 | ADEQUATE | Coverage active from `/`; no `stub-*` | none |
| `routes.test.tsx` "replaces main with the unreachable state at %s" ×5 / TC-COMP-195 | ADEQUATE | Real `fetchHealth` through a rejecting spy, restored per test | A guard by design |
| `routes.test.tsx` "renders no not-found state at any SHELL_ROUTES target" / TC-COMP-197 | ADEQUATE | Renders `AppRoutes` at every `SHELL_ROUTES` value; `>= 3` guard | A guard by design |
| TC-COMP-196 (diff audit) | ADEQUATE | Performed from git (DAC-E4-S10-4 row) | none |

Isolation and determinism: the new describe uses `MemoryRouter`, the
file-level stubs and the `test-setup.ts` health stub, with no timers or
network. The suite passed identically in the four mutation baselines, in 32
mutant runs that failed only on their targeted assertions, and in the
focused and full runs.

Mutation (E.9):

- `generate --range ffec7a0..HEAD` produced 0 catalogue mutants: no operator
  matches these TSX lines.
- I added 8 manual mutants of my own:
  - `shell.tsx:manual:9-11`: mixed-case target, hash fragment, relative
    `"research"`;
  - `routes.tsx:manual:18-22`: three import swaps, a misspelt stock path, and
    a splat on universe detail.
- `scope --since b26cfe6 --previous …-v1-mutation.json` added v1's 25
  mutants: 33 in total, 25 `carried` and 8 `late`. Production lines are
  unchanged since v1, so no mutant is `delta`.

Results on `vitest run web/src/app`: 32 killed, 1 survived.

- All 25 carried mutants are killed, including v1's survivors `:manual:5` and
  `:manual:6`.
- The survivor is `shell.tsx:manual:11`, `to: "research"` (late). It is
  equivalent:
  - `Shell` is mounted outside any `Route`, directly under the router
    (`web/src/main.tsx:14-16`, and every test), so the relative path resolves
    against the root route to `/research` at every location.
  - The rendered `href` is identical: the exact-`href` test passes under the
    mutant (78/78).
  - DEC-0069 and classification-ui section 2.2 fix the destination URL
    `/research`. They do not fix how the literal is spelt.

Results are kept beside this report as
`CAP-002-E4-S10-implementation-review-v2-mutation.json`.

## Independent Validation

Working directory for the npm, npx and git rows:
`repos/factorflow-v2/FactorFlow-v2`, unless the row says otherwise.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| 1. `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| 2. `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story …/CAP-002-E4-S10.md --stage adversarial-review` | harness root | 0 | PASS | `READY` |
| 3. `npx vitest run web/src/app` | component root | 0 | PASS | 11 files, 78 tests |
| 4. `npm run test` | component root | 0 | PASS | 77 files, 2101 tests |
| 5. `npm run lint` | component root (in place) | 0 | PASS | "Checked 173 files … No fixes applied." No ignored `build/` folder is present now, so the v1 environment issue does not arise |
| 6. `npm run format` | component root (in place) | 0 | PASS | "Checked 173 files … No fixes applied." |
| 7. `npx tsc --noEmit` | component root | 0 | PASS | No output |
| 8. `npm run build` | component root | 0 | PASS | "built in 857ms"; static bundle written to the ignored `src/factorflow/api/static/` |
| 9. `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S10-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base ffec7a0182ace897b1732664abcf7ea8d9de4d19 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| 10. `shasum -a 256` over the cycle-2 patch, logs, review files and results, plus a log-hash check of the 29 committed mutation logs; `git diff b26cfe6 7c7856b -- web/` compared with `cycle-2.patch` (`index` lines stripped) | component root | 0 | PASS | Every hash equals the evidence file's value. The patch is identical to the rework commit's web diff |
| 11. `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range ffec7a0182ace897b1732664abcf7ea8d9de4d19..HEAD --cycle review --out <scratch>/mutants-gen.json` | harness root | 0 | PASS | 0 mutants; 8 manual mutants added |
| 12. `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants-manual.json --since b26cfe62cd178019f36be0330639c19b1a4b936d --previous …/CAP-002-E4-S10-implementation-review-v1-mutation.json --out <scratch>/mutants.json` | harness root | 0 | PASS | 33 mutants: carried 25, late 8; 0 previous mutants no longer apply |
| 13. `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 4 --command 'cd {workdir} && ln -sfn <component>/node_modules node_modules; node_modules/.bin/vitest run web/src/app' --timeout 300 --out <scratch>/results.json --logs <scratch>/mutlogs` | harness root | 3 | 32 killed / 1 survived | Four baselines exit 0. Survivor `shell.tsx:manual:11` (late, equivalent; see Test Quality). Exit 3 is the runner's survivor signal |
| 14. `npx vitest run web/src/app/routes.test.tsx` | component root | 0 | PASS | 20 tests. No `act(...)` warning; only React Router future-flag notices |
| 15. `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `sha256:9fc47154…` before validation and after the build (identical) |
| 16. `npm run test:e2e` | — | N/A | NOT RUN | Not required: the plan's Validation Plan and the story's Validation list exclude it. The rework changed no production line since v1, where it passed 18/18 against `b26cfe6` |
| 17. `uv run --offline --all-extras …` Python commands | — | N/A | NOT RUN | The change set holds no Python file, and neither the story nor the plan names a Python command |

### Validation Side Effects

- Before: `cc45068`, `git status --porcelain=v1 -uall` empty, fingerprint `sha256:9fc47154aa6bee22060f25a9daefbb19ad5776e39bcb5e3ad505b74648f26c6a`.
- After: `cc45068`, status empty, fingerprint unchanged.
- Unexpected tracked-file changes: none. `npm run test` and `npm run build`
  rewrote the ignored static bundle, as the tech stack documents. Mutation
  clones and logs live in the session scratchpad, outside the repository.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | LOW | delta | Cycle-2 TDD evidence misstates its task set and the number of import lines |
| IR-002 | LOW | late | Two delivered shell tests outside the edit boundary still describe four destinations |

### IR-001 — Cycle-2 TDD evidence misstates its task set and the number of import lines

- **Severity**: LOW
- **Scope**: delta (both lines changed since v1's `reviewed_head`)
- **Status**: OPEN
- **Acceptance criteria**: N/A (evidence quality)
- **Tasks**: T001, T003, T011, T013
- **Files**: `docs/.../stories/CAP-002-E4-S10-tdd-evidence.yaml:10` and `:55`
- **Claim challenged**:
  - Line 10 says `routes.test.tsx` "changes four import lines" beyond the
    DEC-0173/DEC-0174 set.
  - Line 55 lists cycle-2's tasks as `[T002, T005, T006, T013]`.
- **Observed evidence**:
  - `git diff ffec7a0..HEAD -- web/src/app/routes.test.tsx` shows three such
    import lines: 4 (`act`), 7 (`type MockInstance, afterEach, beforeEach`)
    and 9 (`AppRoutes`). The header itself lists three. The fourth item in
    v1's IR-002 list was the `mockRestore()` deviation, not an import.
  - Cycle-2 also rewords `shell.test.tsx:57`, which is T001's describe
    comment, and `routes.test.tsx:79-81`, which is T003's TC-COMP-330 comment
    (`cycle-2.patch`). Neither T001 nor T003 is in the task list.
- **Expected evidence/behavior**: T013 asks each cycle entry to describe the
  change its reviews judged. T011's audit result should state the diff
  exactly, as v1 IR-002 asked.
- **Impact**: None on behaviour. A reader tracing T001 or T003 to their TDD
  cycles misses cycle-2, and the import count overstates the deviation by one.
- **Required remediation**: Correct both values at the next touch of the
  evidence file, for example in doc sync bookkeeping. Non-blocking.

### IR-002 — Two delivered shell tests outside the edit boundary still describe four destinations

- **Severity**: LOW
- **Scope**: late (lines unchanged since v1; v1 could have found them)
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S10-4
- **Tasks**: T011
- **Files**:
  - `web/src/app/shell.status-region.test.tsx:52`: title "keeps the region
    rendered while the owner navigates all four destinations". Its loop
    visits Instruments, Runs, Settings and Coverage, but not Research.
  - `web/src/app/shell.layout.test.tsx:65-66`: comment "pinned to the bottom,
    after the four navigation destinations".
- **Claim challenged**: The DEC-0173 amendment of 2026-11-05 corrects the
  wording the five-destination rail made false. It covers only the four
  files DAC-E4-S10-4 lets this story edit.
- **Observed evidence**: `grep -n -i 'four' web/src/app/*.tsx` finds these two
  lines, besides the correct "four CAP-001 destinations" wording in
  `routes.tsx` and `routes.test.tsx`. With five rail links, "all four
  destinations" and "the four navigation destinations" are false. Both tests
  still pass, and their assertions are correct.
- **Expected evidence/behavior**: DEC-0173's derivation applies the same
  principle: a title or comment the edit makes false is reworded. But
  DAC-E4-S10-4 forbids this story from changing any delivered file other than
  `shell.tsx`, `routes.tsx` and the four tests. DEC-0084 and system design
  section 8 question 4 name only those four tests.
- **Impact**: Misleading test documentation only. A reader of
  `shell.status-region.test.tsx` may believe it navigates every destination,
  while Research is never visited.
- **Required remediation**: An owner decision, not coder work. Either accept
  the two lines as they are, or record a follow-up for the next revision of
  DEC-0084 or the shell capability that replaces this composition. The coder
  must not edit them under the current DAC-E4-S10-4.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) — Research rail link target not pinned | RESOLVED | `web/src/app/routes.test.tsx:355-375` asserts `href` exactly `/research` from `/coverage`. My mutation run kills carried `shell.tsx:manual:5` (`/RESEARCH`) and `:manual:6` (`/research?hide_incomplete=true`), each with exit 1 and only the new test failing, as in the coder's `red-cycle-2.log`. It also kills my added `:manual:9` (`/Research`) and `:manual:10` (`/research#top`). The new content is one appended describe in `routes.test.tsx`, with no new assertion in the three shell files and no import or mock, so it stays within DEC-0174 |
| v1/IR-002 (MEDIUM) — import edits and two deviations unrecorded | RESOLVED | The remediation was: record each import change and both deviations with their reason in the TDD evidence (T011 audit result), or drop them, and leave DEC-0174 (e) to the owner. `CAP-002-E4-S10-tdd-evidence.yaml:9-16`, headed "T011 audit (c), completed for review v1 IR-002", names `act` (used at `routes.test.tsx:347`), `afterEach`/`beforeEach`/`type MockInstance` (T007's spy) and `AppRoutes` (T008), each with its reason. It gives both deviations' reasons (`mockRestore()`; `selector: "p"`) and states that DEC-0174 (e) is the owner's call. That satisfies the remediation. Residual: the owner has not amended DEC-0174 (e), so (e) and plan T011 (c) still list a narrower set than the diff, and the TDD evidence alone reconciles them. v1 left that choice to the owner, so it is not reopened as a finding. The header miscounts the lines as four (IR-001) |
| v1/IR-003 (LOW) — titles and comments left false by the five-destination rail | RESOLVED | The DEC-0173 amendment of 2026-11-05 (owner decision "widened") lists four items. `shell.a11y.test.tsx:26` now reads "five" (item 1), and `shell.test.tsx:57` now reads "five" (item 2). `routes.test.tsx:80` now reads "no destination beyond the five" (item 3). `routes.test.tsx:131-132` now names the ten routes as four destinations, the run-detail child route and five CAP-002 routes (item 4). `git diff b26cfe6..HEAD` changes no assertion |

## Scope and Plan Deviations

- **Justified deviations** (carried from v1, now all recorded in the TDD
  evidence header):
  - one TDD cycle for story coding instead of two;
  - `fetchSpy.mockRestore()` instead of `vi.restoreAllMocks()` (T007);
  - the `selector: "p"` narrowing (T008);
  - the three import lines.
- **Rework scope.** Commit `7c7856b` touches only `routes.test.tsx`,
  `shell.a11y.test.tsx` and `shell.test.tsx`: one appended describe and four
  rewordings. `cc45068` adds evidence and two frontmatter fields in the tasks
  file. No production, dependency or configuration change. The tasks file's
  `last_reworked_review` and `updated` fields are bookkeeping.
- **Decision record state.** The DEC-0173 amendment that authorises the IR-003
  rewording exists in the harness working tree at
  `projects/factorflow-v2/decisions/DEC-0173.md` (`git status`: modified, not
  committed). The TDD-evidence lint read it from there. It has to be
  committed with the run's records, or the four rewordings lose their
  authority.
- **Line width.** The two reworded comments (`routes.test.tsx:80,132`) wrap
  unevenly. The cycle-2 code review noted this; `npm run format` passes.
  Style only, not a finding.
- **Out-of-scope changes.** None.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**:
  - Proceed to doc sync for CAP-002-E4-S10.
  - Commit the 2026-11-05 DEC-0173 amendment with the run's records.
  - Put IR-002 to the owner: accept the two "four destinations" lines, or
    record a follow-up.
  - Correct IR-001's two values when the evidence file is next touched.
  - Optional owner question carried from v1: whether DEC-0174 (e) should name
    the three import lines.
- **Warnings accepted downstream**: IR-001, IR-002
