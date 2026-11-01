---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S6-implementation-review
artifact_type: implementation-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-01
updated: 2026-11-01
story_id: "CAP-002-E4-S6"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 5
reviewed_at: "2026-11-01T00:45:39Z"
reviewed_head: "f26e1949aebe93390f6709e7bdfaed2cde311f3a"
review_base: "8ec2a736136dd3f743fb22ac1b7eac771e28d032"
reviewed_state_revision: "sha256:67484b299c174bb1f71518c302eed48e8240d0f9ff93760301f03bfc1b6aaa5d"
verdict: PASS
review_subjects:
  - artifact_id: CAP-002-E4-S6
    artifact_version: 1
    content_revision: sha256:1268acae5032a74abf0cd41c370011b221d69c849d1849f4630bd955499db903
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-11-01T00:45:39Z
  source_artifacts:
    - id: CAP-002-E4-S6
      version: "1 (sha256:1268acae5032a74abf0cd41c370011b221d69c849d1849f4630bd955499db903)"
    - id: CAP-002-E4-S6-tasks
      version: "1 (updated 2026-10-31, last_reworked_review v4)"
    - id: CAP-002-E4-S6-tdd-evidence
      version: "cycle-1 to cycle-4, rework-1 to rework-4"
    - id: CAP-002-E4-S6-implementation-review
      version: "4 (baseline, reviewed_head 475c234f09a2df5538dbb47d757cc8a722eab22c)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-tests
      version: "1"
    - id: DEC-0159, DEC-0160, DEC-0161, DEC-0162, DEC-0164, DEC-0239, DEC-0240, DEC-0244
      version: "as recorded in projects/factorflow-v2/decisions"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S6 — Version 5

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 7/7 passed |

Rework 4 resolves all three v4 findings, and this review found no new ones.

- **v4 IR-001 and IR-002 are resolved.** Rework 4 changed tests only. It
  added three TC-COMP-139 tests, and each kills the v4 survivor it targets:
  - `manual:review-v4:scroll-state-not-set` and
    `manual:review-v4:direct-branch-above-too` fail "twelve ArrowUps from the
    first visible row" (`results-table.test.tsx:2147-2165`). They also fail
    "scrolls the already-selected row in…" (`:2267-2302`).
  - `manual:review-v4:move-guard-dropped` fails "stays put on an arrow past
    either end…" (`:1968-1988`).

  This reviewer reran all three, and all three were killed.
- **v4 IR-003 is resolved.** The TDD-evidence header now states the
  `rework-3` exception. `rework-3`'s `spec_drift` now records an independent
  verdict, and `rework-4` records independent code-review and spec-drift
  verdicts.
- **Production is unchanged since the baseline.** `results-table.tsx`,
  `results-window.ts` and `results-window.test.ts` are byte-identical to
  `475c234`. The merge of `origin/main` (`81ab214`) was clean: its combined
  diff is empty. Relative to the new base `8ec2a73`, the story's `copy.ts` and
  `copy.test.ts` changes are line-for-line the ones v4 reviewed against its
  base.
- **Validation is clean.** It covers:
  - lint, format and `tsc`;
  - the full web suite (1371 tests in 60 files) and the build;
  - the T015 built-CSS check;
  - the TDD-evidence lint, with 0 errors and 0 warnings.
- **The mutation run has no non-equivalent survivor.** It ran 177
  mutants: 151 killed, 26 survived. Every survivor is one that
  an earlier review (v1 to v4) already judged equivalent, or `paging-after-first-error`, a new
  reviewer mutant that is equivalent by construction (see below).

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 0**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S6` |
| HEAD | `f26e1949aebe93390f6709e7bdfaed2cde311f3a`. Since the baseline, the branch's first-parent history adds three commits: `4145cc5` (the v4 review), `81ab214` (the merge of `origin/main`) and `f26e194` (rework 4) |
| Review base | `origin/main` = `8ec2a736136dd3f743fb22ac1b7eac771e28d032`. The driver supplied it, and `pipeline-state.py review-base --base-ref 8ec2a73` resolved it. It is an ancestor of HEAD (`git merge-base --is-ancestor`), and so is the baseline head `475c234` |
| Working tree | Clean before and after validation. `git status --porcelain=v1 -uall` printed nothing once the temporary `node_modules` link was removed |
| Changed files reviewed | 54 since the base: 6 under `web/src/screens/research/` and 48 under the story's directory. Since the baseline, 12 of them changed. Rework 4 and the v4 review commit changed ten: five rework-4 evidence files, the v4 report and its mutation JSON, the tasks file, the TDD evidence and `results-table.test.tsx`. The other two are `copy.ts` and `copy.test.ts`, which changed only through the merge's `origin/main` content; the story's own diff in them is unchanged |
| Baseline | v4 (`CHANGES-REQUIRED`), `reviewed_head` `475c234f09a2df5538dbb47d757cc8a722eab22c`, with `CAP-002-E4-S6-implementation-review-v4-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/results-window.ts` | added | T010; DEC-0160 (unchanged since the baseline) |
| `web/src/screens/research/results-window.test.ts` | added | T007 (unchanged since the baseline) |
| `web/src/screens/research/results-table.tsx` | added | T011, T012, T013 and T016; DEC-0159, DEC-0161, DEC-0162, DEC-0164, DEC-0240 and DEC-0244 (unchanged since the baseline) |
| `web/src/screens/research/results-table.test.tsx` | added | T001-T006 and T008. Rework 4 added three TC-COMP-139 tests (`:1968-1988`, `:2147-2165` and `:2267-2302`) against v4 IR-001 and IR-002 |
| `web/src/screens/research/copy.ts` | modified | T009 (`SORT.*`, DEC-0161) and `RESULTS.columns` (DEC-0239). Its diff from the base matches v4's line for line |
| `web/src/screens/research/copy.test.ts` | modified | T009 anchors. Its diff from the base matches v4's line for line |
| `…/stories/CAP-002-E4-S6-tasks.md` | modified | Checkboxes, plus `updated` and `last_reworked_review: …-v4.md` (rework bookkeeping) |
| `…/stories/CAP-002-E4-S6.md` | modified | `status: planning` to `in-review` (story lifecycle). Unchanged since the baseline |
| `…/stories/CAP-002-E4-S6-tdd-evidence.yaml` | added | T017: cycles 1-4 and `rework-1` to `rework-4`. Rework 4 corrected the header and `rework-3`'s description (v4 IR-003) |
| `…/stories/CAP-002-E4-S6-evidence/` (37 files) | added | T017: patches, RED, GREEN and full-suite logs, and mutation results. Rework 4 added five of them |
| `…/stories/CAP-002-E4-S6-implementation-review-v1.md` to `-v4.md` and their `-mutation.json` | added | The earlier gate reports, from the driver's review commits |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `StockTableRow` renders S3's `FactorCell` for each factor, without `showScore` (`results-table.tsx:860-864`) | T008, "renders each factor cell through FactorCell…" (`:1191-1305`) | Display side only, as the story scopes it |
| AC-11 | SATISFIED | `visibleWindow` (`results-window.ts`). The body renders `range.start..range.end` between two `aria-hidden` spacers (`results-table.tsx:652-679`) | The TC-COMP-093 block (`:278-359`) | Component level only. The E2E volume spec is Phase 6b (Open Gap 6) |
| AC-12 | SATISFIED | `FactorCell` for each cell; no row-level style | The TC-COMP-098 block (`:1437-1517`) | Unchanged since the baseline |
| AC-14 | SATISFIED | `FactorHeader` (`:252-303`); the `cellFor` guard (`:310-326`) | The TC-COMP-110 block (`:1319-1434`) | Unchanged since the baseline |
| AC-16 | SATISFIED | `sortBy` and `nextSort` (`:196-205`, `:548-549`), and `toListParams`. Selection and checking are held by symbol | The TC-COMP-138 (`:1520-1776`) and TC-COMP-139 (`:1832-2303`) blocks | The controls work, and the v4 test gaps are closed |
| DAC-E4-1 | SATISFIED | As for AC-9, AC-12 and AC-14 | As above | |
| DAC-E4-S6-1 | SATISFIED | `FactorHeader`; `cellFor` | TC-COMP-110 | |
| DAC-E4-S6-2 | SATISFIED | A sort issues the request and sets `aria-sort`, and each first page re-announces the count (`:461-464`, `:684-686`). In `move`, an in-viewport target leaves no focus request (`:591-598`), and a scroll target's request is consumed by the scroll's own render (`:599-604`) | TC-COMP-138, plus the new TC-COMP-139 test "…a later query change leaves an outside control alone" (`:2267-2302`) | The scroll branch's part of the focus guarantee is now pinned (v4 IR-001) |
| DAC-E4-S6-3 | SATISFIED | The response order is rendered as-is; `aria-describedby` points to an `sr-only` `SORT.incompleteLast` | The TC-COMP-098 block | Unchanged since the baseline |
| DAC-E4-S6-4 | SATISFIED | `StockTableRow`'s `onClick` and `onKeyDown`; the checkbox's `stopPropagation`; `select`, `toggle` and `move` (`:556-605`) | The TC-COMP-139 block | The arrows move selection and focus in both directions, scroll before focusing, and stay put at both ends from any end row or its checkbox. Each property is now pinned |
| DAC-E4-S6-5 | SATISFIED | As for AC-11 | The TC-COMP-093 block | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `results-table.test.tsx:1319-1434` | Unchanged since the baseline |
| T002 | complete | VERIFIED | `:1437-1517` | Unchanged since the baseline |
| T003 | complete | VERIFIED | `:1520-1776` | Unchanged since the baseline |
| T004 | complete | VERIFIED | `:1832-2303` | Rework 4 added three tests. They kill `scroll-state-not-set`, `direct-branch-above-too` and `move-guard-dropped`, the survivors that made T004 PARTIAL in v4. No non-equivalent mutant of `move`, `select` or the pending-focus effect survives |
| T005 | complete | VERIFIED | `:278-359` | Unchanged since the baseline |
| T006 | complete | VERIFIED | `:362-1188` | Unchanged since the baseline. It kills the reviewer's new `append-no-dedupe`, `any-api-error-restarts`, `rowcount-on-no-match`, `symbol-sort-always-shown` and `focused-row-outside-window-not-kept` |
| T007 | complete | VERIFIED | `results-window.test.ts` (17 tests) | Four equivalent boundary survivors, carried from v1 |
| T008 | complete | VERIFIED | `:1191-1305`, `:1779-1813`, `:2306-2389` | Unchanged since the baseline |
| T009 | complete | VERIFIED | `copy.ts` `SORT` and `RESULTS.columns`; `copy.test.ts` | Unchanged relative to the base |
| T010 | complete | VERIFIED | `results-window.ts` | Unchanged since the baseline |
| T011 | complete | VERIFIED | `results-table.tsx:360-757` | Unchanged since the baseline |
| T012 | complete | VERIFIED | `FactorHeader`, `SortButton`, `nextSort`, `ariaSortFor` and `cellFor` | Unchanged since the baseline |
| T013 | complete | VERIFIED | `move` (`:579-605`), `select` (`:556-568`), the pending-focus effect (`:410-423`) and the unmount cleanup (`:400-408`) | Unchanged since the baseline. The reviewer's new `debounce-not-cleared`, `inspect-stale-symbol`, `unmount-timer-not-cleared` and `tab-stop-ignores-window` are each killed |
| T014 | complete | VERIFIED | Full suite 1371/1371 in 60 files after the merge. The diff from the base touches only the planned files, the T017 evidence and the review artifacts | No file outside S6 imports the table. The `render.test.tsx` scan passes, and neither new module uses `dangerouslySetInnerHTML` |
| T015 | complete | VERIFIED | Reviewer scan of the built `src/factorflow/api/static/assets/index-CcHWckuI.css` | Every literal class `results-table.tsx` writes is present (42 class names scanned, plus `border`). So are `--factor-value:`, `--factor-growth:`, `--factor-momentum:`, `--muted:` and `--row-height`. The checked fill is inline (DEC-0240) |
| T016 | complete | VERIFIED | Doc comments on every export; the `ResultsTable` contract comment (`:328-359`) | Unchanged since the baseline |
| T017 | complete | VERIFIED | `CAP-002-E4-S6-tdd-evidence.yaml`: four cycles and `rework-1` to `rework-4`, each with `commit_hash: stage` | The reviewer-run lint gives 0 errors and 0 warnings. `rework-4.patch` matches the committed test diff line for line. Its SHA-256 equals `diff_sha256` (`e9ae22de…`), and every cited log's SHA-256 matches its entry. The RED log shows each v4 survivor failing the new tests: 2, 2 and 1 failures out of 97 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-110 / T001 | ADEQUATE | The header sentence appears once; every Growth cell reads *Not enough to rank*; no buttons and no `aria-sort` on the unranked column; the classified-in-unranked guard; retired cells kept | none |
| TC-COMP-098 / T002 | ADEQUATE | Two percentiles and one *Incomplete*; the response order; the `sr-only` description; `hideIncomplete` reaches the read | none |
| TC-COMP-138 / T003 | ADEQUATE | Request parameters for each step of the cycle; `aria-sort` and the glyph; the Symbol cycle; focus kept after arrow presses past either end and onto the already-selected row; busy rows kept; re-announcement when the count is unchanged | none |
| TC-COMP-139 / T004 | ADEQUATE | Click and Enter select without checking; Space and click check without selecting; arrows move selection and focus from the row and its checkbox; debounce; ten ArrowDowns and, new, twelve ArrowUps across the window edge, with `scrollTop` pinned to `28 * ROW_HEIGHT_PX`; new, an arrow onto the already-selected row above the viewport, which reveals and focuses it, and a later controlled-query change that leaves an outside input focused before and after the deferred page; new, arrows past either end from an unselected end row and from its checkbox, which leave selection, focus and checks alone; survival across sort, refresh and scope | none. The three new tests use real timers and deferred promises, set `scrollTop` explicitly, and depend on no order. They passed in the focused run, the full run and all six mutation baselines |
| TC-COMP-093 / T005 | ADEQUATE | The row and cell bound for 50 and 3000 rows; `aria-rowcount` and `aria-rowindex`; spacers | none |
| T006 | ADEQUATE | Paging, the request lifecycle, focus across a refresh-once (DEC-0244), the polite region | none |
| T007 | ADEQUATE | Every formula, clamp and boundary | Four equivalent boundary survivors (v1) |
| T008 | ADEQUATE | Structure, scopes, composition, the swatch token, alignment, and `extraColumns` placement and span | `extra-header-no-scope` is equivalent (v1) |
| `copy.test.ts` (T009) | ADEQUATE | Exact strings for every new key | none |

### Mutation run (reviewer)

The run took four steps.

1. **Generate.** `mutation-run.py generate --range 8ec2a73..HEAD --cycle
   review` produced 93 catalogue mutants: 77 in `results-table.tsx` and 16 in
   `results-window.ts`. These are the same 93 as v4, because no production
   line changed. The reviewer added ten hand-written mutants, prefixed
   `manual:review-v5:`, on contract points no earlier review mutated:
   - de-duplicating appended pages;
   - which error code restarts;
   - the debounce clear, on a new selection and on unmount;
   - the symbol `onInspect` receives;
   - the tab stop when the selected row is outside the window;
   - `aria-sort` and `aria-rowcount` on the no-match body;
   - keeping a focused row that is not first (DEC-0244);
   - paging after a first-page error.
2. **Scope.** `mutation-run.py scope --since 475c234f… --previous
   …-v4-mutation.json` produced 234 entries: 166 carried and 68 late, with no
   delta. Every previous mutant still applies.
3. **Remove duplicates.** The reviewer dropped 57 late catalogue mutants.
   Each produces a byte-identical mutated file to a carried one, by the
   SHA-256 of the mutated file. These are the same line-shift duplicates v3
   and v4 removed. Kept: 177 mutants (166 carried, 11 late).
4. **Run.** The 177 ran against `results-table.test.tsx`,
   `results-window.test.ts` and `copy.test.ts` with six workers. All six baselines exited 0, and the tree patch was empty (`e3b0c442…`).

Results: 151 killed, 26 survived, 0 stillborn,
0 timeouts. Nine kills took 84 to 92 seconds because the suite's own waits timed out; each exited 1. The results file is
`CAP-002-E4-S6-implementation-review-v5-mutation.json` (sha256
`79e8cbb78f10faebb148106eba77a1abf25aa52883f5ba442f7cb2ecb6834328`).

| Scope | Killed | Survived | Survivors |
|-------|--------|----------|-----------|
| carried | 142 | 24 | v4's 23 carried equivalents (v1's 21 and v2's two `serial` mutants), plus `direct-clear-dropped`, which v4 judged equivalent. The three non-equivalent v4 survivors are among the 142 killed |
| delta | 0 | 0 | No production line changed since the baseline, so no mutant falls on a changed line |
| late | 9 | 2 | `manual:review-v3:pending-focus-cleared-before-render` (equivalent, as in v3 and v4) and `manual:review-v5:paging-after-first-error` (equivalent, below) |

**The v4 survivors.**

- Killed: the three non-equivalent ones.
  - `scroll-state-not-set` and `direct-branch-above-too` each fail both IR-001
    tests (2 failed, 456 passed).
  - `move-guard-dropped` fails the IR-002 test (1 failed, 457 passed).
- Still surviving, and still equivalent:
  - `direct-clear-dropped`, now carried. v4's reasoning still holds on the
    unchanged code: only the scroll branch sets a request, and the render
    it forces consumes it before the next event.
  - `pending-focus-cleared-before-render`, which stays late.
  - The 23 carried equivalents from v1 and v2. The reviewer re-checked them
    against the unchanged code.

**The reviewer's ten new mutants.** Nine are killed:

| Mutant | Killed by |
|--------|-----------|
| `append-no-dedupe` | T006 |
| `any-api-error-restarts` | T006 |
| `debounce-not-cleared` | TC-COMP-139 |
| `inspect-stale-symbol` | TC-COMP-139 |
| `unmount-timer-not-cleared` | "clears a pending onInspect on unmount" (`:2110`) |
| `tab-stop-ignores-window` | "keeps one tab stop when the selected row has scrolled out of the window" (`:2009`) |
| `symbol-sort-always-shown` | T006, the no-match body |
| `rowcount-on-no-match` | T006, the no-match body |
| `focused-row-outside-window-not-kept` | T006, DEC-0244 |

`paging-after-first-error` survives and is equivalent. It drops
`firstError !== null` from the paging effect's guard (`:531`), and that term
can only matter while `currentEpoch` is true.

- `loaded.epoch` is written only by a successful first page.
- Every first-page read starts on a change of `query`, `refreshKey` or
  `attempt`, so it starts in a new epoch.
- A first-page error therefore always coexists with rows from an older epoch,
  and `currentEpoch` is false.

The term is defensive. T011 specifies only that "a failed page waits for Try
again", and the remaining guards already ensure that.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | The first run exited 2: context was 25 h old against a 24 h window. The owner approved a refresh, and the coordinator ran the context feeder. The reviewer's rerun passed every check |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story …/CAP-002-E4-S6.md --stage adversarial-review` | harness root | 0 | READY | "review changes were reworked; a new review version is required" |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run test -- src/screens/research/results-table.test.tsx src/screens/research/results-window.test.ts src/screens/research/copy.test.ts` | the repository (npm `--prefix`) | 0 | PASS | 3 files, 458 tests (97 + 17 + 344). Run outside the sandbox, as the driver's brief directs for vitest |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run lint` | the repository | 0 | PASS | `biome lint .`: 139 files, no fixes |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run format` | the repository | 0 | PASS | `biome format .`: 139 files, no fixes |
| `npx --no-install tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run test` | the repository | 0 | PASS | 60 files, 1371 tests (outside the sandbox, as above) |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run build` | the repository | 0 | PASS | `index-CcHWckuI.css` 19.22 kB and `index-CmSb4bz6.js` 222.28 kB, written into the ignored `src/factorflow/api/static/` |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S6-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 8ec2a736136dd3f743fb22ac1b7eac771e28d032 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| T015 built-CSS check: a scan of the built CSS for every literal class `results-table.tsx` writes, and for the `--factor-*`, `--muted` and `--row-height` definitions | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All present |
| `python3 scripts/mutation-run.py run --repo-dir …/FactorFlow-v2 --mutants <scratchpad>/ar-s6-v5/mutants.json --jobs 6 --command 'test -e node_modules \|\| ln -s …/node_modules node_modules; ./node_modules/.bin/vitest run <3 story suites>' --out <scratchpad>/ar-s6-v5/results.json --logs … --work-root …` | harness root | 3 | 151 killed / 26 survived | Exit 3 reports survivors. All 26 are equivalent: 24 carried and 2 late. Run outside the sandbox as one plain call |
| `npm run test:e2e` | — | N/A | NOT RUN | The task plan excludes it: no screen hosts the table, and no volume E2E case exists (Validation Plan; Open Gap 6). The driver's brief defers it to Phase 6b |

The repository has no `node_modules`. For the validation commands, the
reviewer linked the shared one at
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/node_modules`,
then removed the link before the mutation run. The run makes its own link
in each clone.

### Validation Side Effects

- **Before.** Branch `usr/alvaro-de-jodra/CAP-002-E4-S6` at `f26e194`,
  clean. `code-revision` was `sha256:67484b29…aaa5d`.
- **During.** The temporary `node_modules` link showed as one untracked
  entry. The full suite's `build-output.test.tsx` and `npm run build` wrote
  only into the ignored `src/factorflow/api/static/`. The mutation run worked
  in clones under the scratchpad.
- **After.** The link is removed. HEAD and branch are the same, the tree is
  clean, and `code-revision` is unchanged (`sha256:67484b29…aaa5d`).
- **Unexpected tracked-file changes:** none.

## Findings

No findings.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v4/IR-001 | RESOLVED | Two new TC-COMP-139 tests: "twelve ArrowUps from the first visible row" (`results-table.test.tsx:2147-2165`) and "scrolls the already-selected row in and focuses it when an arrow targets it above the viewport, and a later query change leaves an outside control alone" (`:2267-2302`). They are probes R3 and R1 as assertions. The reviewer's run kills `manual:review-v4:scroll-state-not-set` and `manual:review-v4:direct-branch-above-too`: each fails both tests (2 failed, 456 passed), matching `red-rework-4.log`. No production change, as v4 required |
| v4/IR-002 | RESOLVED | New TC-COMP-139 test "stays put on an arrow past either end pressed from an end row or its checkbox while another row is selected" (`:1968-1988`). It presses ArrowDown from NVDA's checkbox and row, and ArrowUp from AAPL's checkbox and row, with MSFT selected. The reviewer's run kills `manual:review-v4:move-guard-dropped`, and this test is the one that fails (1 failed, 457 passed) |
| v4/IR-003 | RESOLVED | The TDD-evidence header (`:10-13`) now states the exception: `rework-3`'s spec drift was first self-assessed, then independently reviewed in rework 4. `rework-3`'s description records that independent verdict (`drift_detected: false`), and `rework-4` records independent code-review (`APPROVED`) and spec-drift verdicts. v4 offered either remedy, and rework 4 did both. The dispatch of the subagents is the coder's statement, the same evidence every earlier cycle rests on. This gate re-derived spec fidelity independently and found no drift |

## Scope and Plan Deviations

- **Justified deviations, recorded as decisions.** None changed since the
  baseline.
  - DEC-0239 adds `RESULTS.columns`.
  - DEC-0240 paints the checked fill inline. Its amendments record two
    things for the owner: the 4 px selection edge, and the inline fill's
    precedence on a row that is both selected and checked.
  - DEC-0244 covers refresh focus when the focused row leaves page one. The
    owner upheld it.
- **Open decisions.** DEC-0239 and DEC-0240 are still `status: open`, with
  `owner_reviewed: false` and `blocks: [CAP-002-E4-S6]`. This review does not
  depend on how the owner rules on them; the code matches each as decided.
  They remain the owner's to review before the unit is released.
- **Rework scope.** Rework 4 changed:
  - `results-table.test.tsx`: three tests;
  - the TDD evidence: the header, `rework-3`'s description and the new
    `rework-4` cycle;
  - five evidence files;
  - the tasks file's `updated` and `last_reworked_review`.

  Each change traces to v4 IR-001, IR-002 or IR-003.
- **The merge.** `81ab214` merges `origin/main` with an empty combined diff.
  Relative to the new base, the story's change set is limited to the six
  planned web files and the story's own documentation.
- **Bookkeeping.** Every task is ticked and verified. The task file's
  `status` stays `draft`, as in earlier E4 plans.
- **Out-of-scope changes.** None.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E4-S6 against this
  report. The owner still has to review the open provisional decisions
  DEC-0239 and DEC-0240, which name this unit in `blocks`.
- **Warnings accepted downstream**: N/A
