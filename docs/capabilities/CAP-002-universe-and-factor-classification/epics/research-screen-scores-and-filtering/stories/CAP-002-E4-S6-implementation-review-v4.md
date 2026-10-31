---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S6-implementation-review
artifact_type: implementation-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E4-S6"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 4
reviewed_at: "2026-10-31T02:01:06Z"
reviewed_head: "475c234f09a2df5538dbb47d757cc8a722eab22c"
review_base: "b6b583838dfa172827b1f6e2b4f965a0a9dcd492"
reviewed_state_revision: "sha256:26065bf9f97d0a9bda49a64466898aa2624b28a3b63e8f90c507afb9736fda66"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-10-31T02:01:06Z
  source_artifacts:
    - id: CAP-002-E4-S6
      version: "1 (sha256:1268acae5032a74abf0cd41c370011b221d69c849d1849f4630bd955499db903)"
    - id: CAP-002-E4-S6-tasks
      version: "1 (updated 2026-10-30, last_reworked_review v3)"
    - id: CAP-002-E4-S6-tdd-evidence
      version: "cycle-1 to cycle-4, rework-1 to rework-3"
    - id: CAP-002-E4-S6-implementation-review
      version: "3 (baseline, reviewed_head ecd9dd12799b1d3307c46bf6740cb332b7b97b0c)"
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

# Implementation Review: CAP-002-E4-S6 — Version 4

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 16/17 verified |
| Required validation | 7/7 passed |

Rework 3 fixes the v3 defect, and v3 IR-001 is resolved. `move` now handles
an arrow press in one of two branches:

- **Target already in the viewport.** It focuses the row at once and sets no
  focus request.
- **Target needs a scroll.** It sets a request, and the scroll's render
  consumes it.

All four tests the v3 remediation asked for are present. They fail on the v3
code, as the `rework-3` RED log and the reviewer's `direct-branch-never`
mutant both show. On HEAD, eight reviewer probes behave correctly; one of them
covers the refresh-once that the new tests leave out.

Validation is clean:

- lint, format and `tsc`;
- the full web suite (1196 tests in 55 files) and the build;
- the T015 built-CSS check;
- the TDD-evidence lint, with 0 errors.

The gate still fails, because the tests do not pin the new branch logic.
Three non-equivalent reviewer mutants of the reworked `move` survive the
story's suites. All three sit on lines rework 3 changed, so their scope is
`delta`, and they block (skill step H). Each one changes behaviour that T013
and T004 specify, and a reviewer probe that passes on HEAD fails under each.

- **IR-001 (HIGH).** The scroll branch is unpinned.
  - Dropping the branch's `setScrollTop(revealed)` brings v3's defect back for
    one case: an arrow onto the already-selected row when that row needs a
    scroll. A later query change then moves focus from a control outside the
    table into the table.
  - Sending upward reveals down the direct branch stops ArrowUp from scrolling
    past the top of the viewport.
- **IR-002 (HIGH).** The end-of-list guard is unpinned. Without it, `ArrowDown`
  on the last row's checkbox selects that row while another row is selected.
  v3 killed this same mutation, but only through the leftover focus request
  that rework 3 removed.
- **IR-003 (LOW).** The `rework-3` evidence records the spec-drift review as
  done by the coding agent, not by an independent subagent.

**By severity:** CRITICAL 0 · HIGH 2 · MEDIUM 0 · LOW 1 · **total 3**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S6` |
| HEAD | `475c234f09a2df5538dbb47d757cc8a722eab22c`. The branch adds two commits since the baseline: `f8ac5ea` (the v3 review) and `475c234` (rework 3) |
| Review base | `origin/main` = `b6b583838dfa172827b1f6e2b4f965a0a9dcd492`. The driver supplied it, and `pipeline-state.py review-base --base-ref origin/main` resolved it. It is an ancestor of HEAD, and so is the baseline head `ecd9dd1` |
| Working tree | Clean before and after validation. `git status --porcelain=v1 --untracked-files=all` printed nothing once the temporary `node_modules` link was removed |
| Changed files reviewed | 47 since the base. 11 of them changed since the baseline: 5 evidence files, the v3 report and its mutation JSON, the tasks file, the TDD evidence, `results-table.test.tsx` and `results-table.tsx` |
| Baseline | v3 (`CHANGES-REQUIRED`), `reviewed_head` `ecd9dd12799b1d3307c46bf6740cb332b7b97b0c`, with `CAP-002-E4-S6-implementation-review-v3-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/results-window.ts` | added | T010; DEC-0160 (unchanged since the baseline) |
| `web/src/screens/research/results-window.test.ts` | added | T007 (unchanged since the baseline) |
| `web/src/screens/research/results-table.tsx` | added | T011, T012, T013 and T016; DEC-0159, DEC-0161, DEC-0162, DEC-0164 and DEC-0240. Rework 3 rewrote `move` (`:579-605`) against v3 IR-001 |
| `web/src/screens/research/results-table.test.tsx` | added | T001-T006 and T008. Rework 3 added one TC-COMP-138 test (`:1753-1775`) and, for TC-COMP-139, the `arrowOntoSelected` helper and three tests (`:2172-2223`), against v3 IR-001 |
| `web/src/screens/research/copy.ts` | modified | T009 (`SORT.*`, DEC-0161) and `RESULTS.columns` (DEC-0239). Unchanged since the baseline |
| `web/src/screens/research/copy.test.ts` | modified | T009 anchors. Unchanged since the baseline |
| `…/stories/CAP-002-E4-S6-tasks.md` | modified | Checkboxes, plus `last_reworked_review: …-v3.md` (rework bookkeeping) |
| `…/stories/CAP-002-E4-S6.md` | modified | `status: planning` to `in-review`, plus `updated` (story lifecycle). Unchanged since the baseline |
| `…/stories/CAP-002-E4-S6-tdd-evidence.yaml` | added | T017: cycles 1-4 and `rework-1` to `rework-3` |
| `…/stories/CAP-002-E4-S6-evidence/` (32 files) | added | T017: the cycle and rework patches, RED and GREEN logs, full-suite logs and mutation results. Rework 3 added five of them |
| `…/stories/CAP-002-E4-S6-implementation-review-v1.md` to `-v3.md` and their `-mutation.json` | added | The earlier gate reports, from the driver's review commits |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `StockTableRow` renders S3's `FactorCell` for each factor, without `showScore` (`results-table.tsx:860-864`) | T008, "renders each factor cell through FactorCell…" | Display side only, as the story scopes it |
| AC-11 | SATISFIED | `visibleWindow` (`results-window.ts:46-62`). The body renders `range.start..range.end` between two `aria-hidden` spacers (`results-table.tsx:652-679`) | The TC-COMP-093 block (`results-table.test.tsx:278-359`) | Component level only. The E2E volume spec is Phase 6b (Open Gap 6) |
| AC-12 | SATISFIED | `FactorCell` for each cell; no row-level style | The TC-COMP-098 block (`:1437-1517`) | Unchanged since the baseline |
| AC-14 | SATISFIED | `FactorHeader` (`:252-303`); the `cellFor` guard (`:310-326`) | The TC-COMP-110 block (`:1319-1434`) | Unchanged since the baseline |
| AC-16 | SATISFIED | `sortBy` and `nextSort` (`:196-205`, `:548-549`), and `toListParams`. Selection and checking are held by symbol | The TC-COMP-138 and TC-COMP-139 blocks | The controls work. IR-001 and IR-002 are test gaps, not defects |
| DAC-E4-1 | SATISFIED | As for AC-9, AC-12 and AC-14 | As above | |
| DAC-E4-S6-1 | SATISFIED | `FactorHeader`; `cellFor` | TC-COMP-110 | |
| DAC-E4-S6-2 | SATISFIED | A sort issues the request and sets `aria-sort`, and each first page re-announces the count (`:461-464`, `:684-686`). Since rework 3, no in-viewport arrow press leaves a focus request (`:591-598`), so a sort keeps focus | TC-COMP-138, including "keeps focus on a sort button activated after an arrow press onto the already-selected row" (`:1753-1775`) | v3 IR-001 is resolved. Reviewer probes Q1, Q2, Q5 and R1 pass on HEAD. IR-001 records that the scroll branch's part of this guarantee is not pinned |
| DAC-E4-S6-3 | SATISFIED | The response order is rendered as-is; `aria-describedby` points to an `sr-only` `SORT.incompleteLast` | The TC-COMP-098 block | Unchanged since the baseline |
| DAC-E4-S6-4 | SATISFIED | `StockTableRow`'s `onClick` and `onKeyDown`; the checkbox's `stopPropagation`; `select`, `toggle` and `move` (`:556-605`) | The TC-COMP-139 block (`:1832-2224`) | Selection and checking never interfere, and the arrows focus their target on every path the probes reach. IR-001 and IR-002 are surviving mutants on this behaviour |
| DAC-E4-S6-5 | SATISFIED | As for AC-11 | The TC-COMP-093 block | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `results-table.test.tsx:1319-1434` | Unchanged since the baseline |
| T002 | complete | VERIFIED | `:1437-1517` | Unchanged since the baseline |
| T003 | complete | VERIFIED | `:1520-1776` | Adds the arming-then-sort test (`:1753-1775`). That test fails under `direct-branch-never`, `direct-leaves-request` and `direct-no-return` |
| T004 | complete | PARTIAL | `:1832-2224` | Adds the three arming tests (`:2181-2223`). Its listed assertions are all present, but three non-equivalent mutants of the reworked `move` survive it: `scroll-state-not-set` and `direct-branch-above-too` (IR-001), and `move-guard-dropped` (IR-002) |
| T005 | complete | VERIFIED | `:278-359` | Unchanged since the baseline |
| T006 | complete | VERIFIED | `:362-1188` | Unchanged since the baseline |
| T007 | complete | VERIFIED | `results-window.test.ts` (17 tests) | Four equivalent boundary survivors, carried from v1 |
| T008 | complete | VERIFIED | `:1191-1305`, `:1779-1813`, `:2227-2310` | Unchanged since the baseline |
| T009 | complete | VERIFIED | `copy.ts` `SORT` and `RESULTS.columns`; `copy.test.ts` | Unchanged since the baseline |
| T010 | complete | VERIFIED | `results-window.ts` | Unchanged since the baseline |
| T011 | complete | VERIFIED | `results-table.tsx:360-757` | Unchanged since the baseline, apart from `move` |
| T012 | complete | VERIFIED | `FactorHeader`, `SortButton`, `nextSort`, `ariaSortFor` and `cellFor` | Unchanged since the baseline |
| T013 | complete | VERIFIED | `move` (`:579-605`), `select` (`:556-568`) and the pending-focus effect (`:410-423`) | The v3 defect is fixed. An in-viewport target is focused at once with no request. A scroll target gets a request, and the guaranteed render consumes it, since `setScrollTop` receives a new value. Probes Q1-Q5 and R1-R3 pass on HEAD |
| T014 | complete | VERIFIED | Full suite 1196/1196. The diff from the base touches only the planned files, the T017 evidence and the review artifacts | The `render.test.tsx` scan passes |
| T015 | complete | VERIFIED | Reviewer scan of `src/factorflow/api/static/assets/index-Bune3uMY.css` | Every literal class `results-table.tsx` writes is present, and so are `--factor-value:`, `--factor-growth:`, `--factor-momentum:`, `--muted:` and `--row-height`. `bg-muted` is absent and not needed: the checked fill is inline (DEC-0240) |
| T016 | complete | VERIFIED | Doc comments on every export; the `ResultsTable` contract comment (`:328-359`) | The new branch comments in `move` (`:592-594`, `:599`) match its behaviour |
| T017 | complete | VERIFIED | `CAP-002-E4-S6-tdd-evidence.yaml`: four cycles and `rework-1` to `rework-3`, each with `commit_hash: stage` | The reviewer-run lint gives 0 errors and 0 warnings. `rework-3.patch` matches the committed code and test diff hunk for hunk, and its SHA-256 equals `diff_sha256`. The RED log shows exactly the four new tests failing (4 failed, 90 passed). The spec-drift review was self-assessed (IR-003) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-110 / T001 | ADEQUATE | The header sentence appears once; every Growth cell reads *Not enough to rank*; no buttons and no `aria-sort` on the unranked column; the classified-in-unranked guard; retired cells kept | none |
| TC-COMP-098 / T002 | ADEQUATE | Two percentiles and one *Incomplete*; the response order; the `sr-only` description; `hideIncomplete` reaches the read | none |
| TC-COMP-138 / T003 | ADEQUATE | Request parameters for each step of the cycle; `aria-sort` and the glyph; the Symbol cycle; focus kept, including after an arrow press past either end and after an arrow press onto the already-selected row; busy rows kept; re-announcement when the count is unchanged | none |
| TC-COMP-139 / T004 | WEAK | Click and Enter select without checking; Space and click check without selecting; arrows move selection and focus, from the row and from its checkbox; both ends, pressed from the selected row; debounce; ten ArrowDowns with the scroll position; survival across sort, refresh and scope; the arming tests (the selected row focused; focus kept under Space and across a query change) | Three non-equivalent survivors. **IR-001**: no test presses an arrow onto the already-selected row when that row needs a scroll, and no test presses ArrowUp past the top of the viewport. **IR-002**: no test presses an arrow past either end from a row that is not selected, or from its checkbox |
| TC-COMP-093 / T005 | ADEQUATE | The row and cell bound for 50 and 3000 rows; `aria-rowcount` and `aria-rowindex`; spacers | none |
| T006 | ADEQUATE | As in v3: paging, the request lifecycle, focus across a refresh-once (DEC-0244), the polite region | none |
| T007 | ADEQUATE | Every formula, clamp and boundary | Four equivalent boundary survivors |
| T008 | ADEQUATE | Structure, scopes, composition, the swatch token, alignment, and `extraColumns` placement and span | `extra-header-no-scope` is equivalent (v1) |
| `copy.test.ts` (T009) | ADEQUATE | Exact strings for every new key | none |

### Mutation run (reviewer)

The run took four steps.

1. **Generate.** `mutation-run.py generate --range b6b58383..HEAD --cycle
   review` produced 93 catalogue mutants: 77 in `results-table.tsx` and 16 in
   `results-window.ts`. None falls on the reworked lines 588-605. The
   reviewer added 14 hand-written mutants of `move`, prefixed
   `manual:review-v4:`.
2. **Scope.** `mutation-run.py scope --since ecd9dd12… --previous
   …-v3-mutation.json` produced 224 entries: 152 carried, 14 delta and 58
   late. One previous mutant no longer applies:
   `manual:review:move-guard-dropped`, whose text included the line rework 3
   rewrote. Its v4 counterpart is `manual:review-v4:move-guard-dropped`.
3. **Remove duplicates.** The reviewer dropped 57 late catalogue mutants.
   Each produces a byte-identical mutated file to a carried one, by the
   SHA-256 of the mutated file. These are the same line-shift duplicates v3
   removed. Kept: 167 mutants (152 carried, 14 delta, 1 late).
4. **Run.** The 167 ran against `results-table.test.tsx`,
   `results-window.test.ts` and `copy.test.ts` with six workers. All six
   baselines exited 0, and the tree patch was empty (`e3b0c442…`).

Results: 139 killed, 28 survived, 0 stillborn, 0 timeouts. Nine kills took 80
to 89 seconds because the suite's own waits timed out; each exited 1. The
results file is `CAP-002-E4-S6-implementation-review-v4-mutation.json`
(sha256 `0f5773b64f1eeb396bbad812c42b350f5ad49d05baea0adb20bbb9715c76a217`).

| Scope | Killed | Survived | Survivors |
|-------|--------|----------|-----------|
| carried | 129 | 23 | The same 23 as v3: the 21 v1 equivalents and v2's two `serial` mutants. The reviewer re-checked them against the current code and they are still equivalent |
| delta | 10 | 4 | `direct-branch-above-too`, `scroll-state-not-set` and `move-guard-dropped`, all non-equivalent (IR-001, IR-002). `direct-clear-dropped` is equivalent (below) |
| late | 0 | 1 | `manual:review-v3:pending-focus-cleared-before-render`, equivalent as in v3. Since rework 3 no request outlives its render, so there is no path on which it differs |

**The ten delta kills:**

- `direct-branch-never`, which is the v3 code: the four new tests fail;
- `direct-branch-always` and `direct-branch-below-too`: the ten-ArrowDowns
  test fails;
- `direct-focus-dropped` and `direct-focus-from-row`;
- `direct-leaves-request` and `direct-no-return`: the three new
  arming-followed-by tests fail;
- `scroll-request-dropped` and `scroll-dom-not-set`: the ten-ArrowDowns test
  fails;
- `select-dropped`.

**The equivalent delta survivor.** `direct-clear-dropped` removes
`pendingFocus.current = null` from the direct branch (`:595`). That line could
only matter if a request were still set when `move` starts. Only the scroll
branch sets one, and it always hands `setScrollTop` a value different from the
rendered `scrollTop`, so a render follows. That render's window holds the
target, because `scrollTopToReveal` places it inside the viewport. React 18
flushes the passive effects of a discrete event's render before the next
event, so the effect consumes the request first. The line is defensive, and
T013 specifies only that the request is consumed in an effect. Probes R1-R3
pass under this mutant.

**The non-equivalent survivors.** These are probes R1-R3. Each passes on
HEAD and fails under its mutant (scratch clone; table below).

### Reviewer probes

The probes ran in a throwaway clone of HEAD under scratchpad
`ar-s6-v4/probe`. The component repository was not touched.

| Probe | Observed on HEAD | Under a surviving mutant |
|-------|------------------|--------------------------|
| Q1: click `SYM0005`; focus *Select SYM0006*; `ArrowUp`; focus an outside input; then a `refreshKey` bump with a deferred page | Focus goes to the `SYM0005` row after `ArrowUp`. The outside input keeps focus after the render and after the response | — |
| Q2: 100 rows, `SYM0005` selected, scrolled to row 6; *Select SYM0006*; `ArrowUp`; outside input; then a query change | `scrollTop` 192 becomes 160, and focus goes to the `SYM0005` row. The outside input keeps focus after the render and after the response | — |
| Q3: `SYM0000` selected; *Select SYM0002* (the last row); `ArrowDown` | The selection stays on `SYM0000`, and focus stays on *Select SYM0002* | — |
| Q4: 100 rows scrolled to row 40; click `SYM0040`; twelve `ArrowUp`s | `SYM0028` is selected and focused; `scrollTop` is 896 (`28 * ROW_HEIGHT_PX`) | — |
| Q5: `SYM0003` selected; a query change left pending; *Select SYM0004*; `ArrowUp`; outside input; then the reload lands | Focus goes to the `SYM0003` row; the outside input keeps focus across the reload | — |
| R1: Q2 as assertions | Passes | `scroll-state-not-set`: `ArrowUp` leaves focus on the checkbox and a request set. The query change's render then moves focus from the outside input to the `SYM0005` row ("expected `<tr data-symbol="SYM0005">` to be `<input>`"). `direct-branch-above-too`: no scroll ("expected 192 to be 160") |
| R2: Q3 as assertions | Passes | `move-guard-dropped`: `SYM0002` becomes selected ("expected [ 'SYM0002' ] to deeply equal [ 'SYM0000' ]") |
| R3: Q4 as assertions | Passes | `scroll-state-not-set` and `direct-branch-above-too`: the window never moves, so the selected `SYM0028` is not rendered ("expected [] to deeply equal [ 'SYM0028' ]") |

**Determinism and isolation.** The new tests control arrival with deferred
promises and use real timers, and the arming helper drives `user.tab()`. The
suite passed:

- in the focused run;
- in the full run;
- on the six mutation baselines.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run test -- src/screens/research/results-table.test.tsx src/screens/research/results-window.test.ts src/screens/research/copy.test.ts` | the repository (npm `--prefix`) | 0 | PASS | 3 files, 438 tests (94 + 17 + 327). Run outside the sandbox, which refuses vitest's cache write through the linked `node_modules` (`EPERM … node_modules/.vite`, recorded in v3 and in the driver's brief) |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run lint` | the repository | 0 | PASS | `biome lint .`: 127 files, no fixes |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run format` | the repository | 0 | PASS | `biome format .`: 127 files, no fixes |
| `npx --no-install tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output. The shared `tsc -p …/tsconfig.json` also exited 0 |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run test` | the repository | 0 | PASS | 55 files, 1196 tests (outside the sandbox, as above) |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run build` | the repository | 0 | PASS | `index-Bune3uMY.css` 17.83 kB and `index-Dtn2CTHl.js` 222.28 kB, written into the ignored `src/factorflow/api/static/` |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S6-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base b6b583838dfa172827b1f6e2b4f965a0a9dcd492 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| T015 built-CSS check: a scan of the built CSS for every literal class `results-table.tsx` writes, and for the `--factor-*`, `--muted` and `--row-height` definitions | `repos/factorflow-v2/FactorFlow-v2` | N/A | PASS | All present |
| `python3 scripts/mutation-run.py run --repo-dir …/FactorFlow-v2 --mutants <scratchpad>/ar-s6-v4/mutants.json --jobs 6 --command '… ./node_modules/.bin/vitest run <3 story suites>' --out <scratchpad>/ar-s6-v4/results.json …` | harness root | 3 | 139 killed / 28 survived | Exit 3 reports survivors. Three are non-equivalent (IR-001, IR-002). The first two attempts stopped before running anything: the temporary `node_modules` link was untracked, and the work root did not exist |
| `npm run test:e2e` | — | N/A | NOT RUN | The task plan excludes it: no screen hosts the table, and no volume E2E case exists (Validation Plan; Open Gap 6) |

The repository has no `node_modules`. The reviewer linked the shared one at
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/node_modules`
for the validation commands and removed the link before the mutation run.

### Validation Side Effects

- **Before.** Branch `usr/alvaro-de-jodra/CAP-002-E4-S6` at `475c234`,
  clean. `code-revision` was `sha256:26065bf9…6fda66`.
- **During.** The temporary `node_modules` link showed as one untracked entry.
  The build wrote only into the ignored `src/factorflow/api/static/`. The
  mutation run and the probes worked in clones under the scratchpad.
- **After.** The link is removed. HEAD and branch are the same, the tree is
  clean, and `code-revision` is unchanged (`sha256:26065bf9…6fda66`).
- **Unexpected tracked-file changes:** none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | delta | The reworked scroll branch of `move` is unpinned: dropping its state update, or sending upward reveals down the direct branch, survives |
| IR-002 | HIGH | delta | The end-of-list guard in `move` is no longer pinned: dropping it survives, and `ArrowDown` on an unselected last row then selects it |
| IR-003 | LOW | delta | The `rework-3` spec-drift review was self-assessed, not run by an independent subagent |

### IR-001 — The reworked scroll branch of `move` is unpinned: dropping its state update, or sending upward reveals down the direct branch, survives

- **Severity**: HIGH. Non-equivalent survivors make the mandatory
  TC-COMP-139 test `WEAK` (skill steps E.9 and H).
- **Scope**: delta. Both mutants change lines rework 3 wrote:
  - `:591`, `if (revealed === scrollTop) {`, is new;
  - `:604`, `setScrollTop(revealed);`, moved out of the old `if`.
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S6-4 (arrows move the selection; the T004
  scroll-before-focus rule) and DAC-E4-S6-2 (focus does not move on a sort or
  filter)
- **Tasks**: T004 (the test); T013 (the behaviour pinned)
- **Files**:
  - `web/src/screens/research/results-table.tsx:579-605` (`move`): the branch
    test at `:591` and the scroll branch at `:599-604`;
  - `web/src/screens/research/results-table.test.tsx:1832-2224` (the
    TC-COMP-139 block).
- **Claim challenged**:
  - The `rework-3` evidence says: "Only when a scroll is needed is the request
    set, and then setScrollTop with a new value guarantees the render that
    brings the row into the window and consumes it."
  - T013 says an arrow press scrolls the row "into the window with
    `scrollTopToReveal`" and focuses it once rendered. That holds in both
    directions.
- **Observed evidence**:
  - **`manual:review-v4:scroll-state-not-set`** survives all 438 tests. It
    removes the scroll branch's `setScrollTop(revealed)` and keeps the DOM
    write. Probe R1 shows the effect:
    - `SYM0005` is selected, and the list is scrolled to row 6.
    - `ArrowUp` from *Select SYM0006* targets the selected row, so `select`
      returns early.
    - Nothing renders, so the request stays set and focus stays on the
      checkbox.
    - The next query change's render then moves focus from an outside input
      to the `SYM0005` row.

    This is v3 IR-001's defect, reached through the scroll branch. The render
    guarantee the rework depends on is not pinned by any test.
  - **`manual:review-v4:direct-branch-above-too`** survives all 438 tests. It
    changes `===` to `<=`, so a target above the viewport takes the direct
    branch.
    - Probe R3 presses twelve `ArrowUp`s from row 40. The window never moves,
      and the selected `SYM0028` is not rendered.
    - Probe R1 under this mutant shows no scroll: `scrollTop` stays 192.
  - Both probes pass on HEAD. The shipped behaviour is correct; the tests do
    not hold it.
  - **Why the tests miss it.** The only scroll test, "ten ArrowDowns from the
    last visible row" (`:2100-2123`), moves downward. Each of its presses
    changes the selection, and that change forces a render whether or not the
    scroll state updates. No test presses an arrow onto the already-selected
    row when that row needs a scroll, and no test presses ArrowUp past the top
    of the viewport.
- **Expected evidence/behavior**:
  - T013 and T004 require that an arrow press scrolls its target into the
    window, by `scrollTopToReveal`, before focusing it, in both directions.
  - DAC-E4-S6-2 and the design require that a later sort, filter or refresh
    never moves focus.
  - A test must fail when either property is lost.
- **Impact**:
  - **The fix can regress unnoticed.** Removing or reordering one line of the
    scroll branch would bring back the CRITICAL v3 defect for every
    already-selected target that needs a scroll, and the suite would stay
    green.
  - **The upward scroll is unguarded too.** A change that skips the scroll
    for upward moves would leave keyboard users unable to arrow up past the
    top of the viewport.
- **Required remediation**: Add TC-COMP-139 tests, with TC-COMP-138 where a
  sort is the trigger, that kill both mutants. Probes R1 and R3 are one
  sufficient shape:
  - an arrow onto the already-selected row that needs a scroll, followed by a
    query change or sort that leaves focus where it was;
  - `ArrowUp` past the top of the viewport, asserting the selection, focus and
    `scrollTopToReveal`'s `scrollTop`.

  No production change is required.

### IR-002 — The end-of-list guard in `move` is no longer pinned: dropping it survives, and `ArrowDown` on an unselected last row then selects it

- **Severity**: HIGH. A non-equivalent survivor makes the mandatory
  TC-COMP-139 test `WEAK` (skill steps E.9 and H).
- **Scope**: delta, as `mutation-run.py scope` tags it. The guard at
  `:585-587` is unchanged. Rework 3 rewrote the line after it (`:588`),
  however, so the baseline's own copy, `manual:review:move-guard-dropped`, no
  longer applies. The tool treats such a mutant as delta. The baseline ran
  and killed that same mutation, so a survivor now is a regression in test
  strength, which blocks as carried or as delta.
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S6-4
- **Tasks**: T004 (the test); T013 (the behaviour pinned)
- **Files**:
  - `web/src/screens/research/results-table.tsx:585-587` (the guard
    `if (target === fromIndex) return;`);
  - `web/src/screens/research/results-table.test.tsx:1916-1966` (the two
    end-of-list tests).
- **Claim challenged**: T004 says "`ArrowUp` on the first row and `ArrowDown`
  on the last loaded row stay put". T013 says an arrow selects "the
  neighbouring loaded row".
- **Observed evidence**:
  - **`manual:review-v4:move-guard-dropped`** removes the guard and survives
    all 438 tests.
  - **In v3 it was killed.** Without the guard, a press past either end left a
    focus request, and "leaves focus on a sort button activated after an arrow
    press past either end" caught it. Rework 3 removed that request path, so
    the guard's remaining effect is unobserved.
  - **Probe R2** shows that effect. `SYM0000` is selected, and focus is on
    *Select SYM0002*, the last row. `ArrowDown` then selects `SYM0002` under
    the mutant, where HEAD leaves the selection on `SYM0000` and focus on the
    checkbox.
  - **Why the tests miss it.** Both end-of-list tests press from the row that
    is already selected. Removing the guard changes nothing there.
- **Expected evidence/behavior**: An arrow past either end, pressed from an
  end row or its checkbox, changes neither the selection nor focus, whichever
  row is selected. A test must fail when the guard is removed.
- **Impact**:
  - **The guard can go unnoticed.** Someone could delete it without a test
    failing.
  - **The cost lands on keyboard users.** `ArrowDown` on the last loaded
    row's checkbox would move the selection and fire `onInspect`. That moves
    the inspector to a stock the user did not choose.
- **Required remediation**: Add a TC-COMP-139 test, probe R2 or an equivalent,
  that presses an arrow past either end from an unselected end row or its
  checkbox. It should assert that the selection and focus stay. No production
  change is required.

### IR-003 — The `rework-3` spec-drift review was self-assessed, not run by an independent subagent

- **Severity**: LOW
- **Scope**: delta. The `rework-3` entry is new.
- **Status**: OPEN
- **Acceptance criteria**: N/A (process evidence)
- **Tasks**: T017
- **Files**: `…/stories/CAP-002-E4-S6-tdd-evidence.yaml`. Its header
  (`:10-11`) and the `rework-3` description (`:551-553`) disagree.
- **Claim challenged**:
  - T017 says to "dispatch an independent code-review subagent and an
    independent spec-drift subagent" after each cycle.
  - The evidence header says each cycle's patch "was judged by an independent
    code-review subagent and an independent spec-drift subagent".
- **Observed evidence**:
  - The `rework-3` description says the code review was "by an independent
    subagent (APPROVED…); spec drift was assessed by the coding agent".
  - Its `spec_drift: drift_detected: false` is therefore self-issued.
  - The substitution is disclosed. Under CONST-REV, independence means
    checking against fresh evidence, not a different actor. Rework 3 touches
    no specification.
- **Expected evidence/behavior**: Either an independent spec-drift review for
  the cycle, or a header that does not claim one for every cycle.
- **Impact**: Small. This gate re-derived the spec fidelity of the change and
  found no drift. The header overstates what the evidence holds, though.
- **Required remediation**: In the next rework cycle, dispatch the spec-drift
  subagent as T017 requires. Also either record an independent spec-drift
  verdict for `rework-3`, or correct the header so it states the exception.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v3/IR-001 | RESOLVED | The fix is in `move` (`results-table.tsx:591-598`): an in-viewport target is focused directly, and the request is cleared. Four new tests pin the defect: `:1753-1775`, `:2181-2187`, `:2189-2197` and `:2199-2223`. They cover the selected row receiving focus, a sort, `Space` on a checkbox and a query change after the arming. `red-rework-3.log` shows those four failing on the v3 code (4 failed, 90 passed), and the reviewer's `direct-branch-never` mutant, which is the v3 code, fails the same four. Probes Q1 (refresh), Q2, Q5 and R1 confirm the fix on HEAD. The scroll branch's part of the guarantee is not pinned; that is new finding IR-001, not this one reopened |

## Scope and Plan Deviations

- **Justified deviations, recorded as decisions.** DEC-0239 adds
  `RESULTS.columns`. DEC-0240 paints the checked fill inline and records the
  4 px selection edge. DEC-0244 covers refresh focus when the focused row
  leaves page one; the owner upheld it. All three are unchanged.
- **Rework scope.** Rework 3 changed `move` in `results-table.tsx`, added
  four tests to `results-table.test.tsx`, and added the TDD evidence, its five
  evidence files and the tasks file's `last_reworked_review`. Each change
  traces to v3 IR-001.
- **Bookkeeping.**
  - Every task is ticked. T004 is PARTIAL here (IR-001 and IR-002).
  - The task file's `status` stays `draft`, as in earlier E4 plans.
  - The TDD evidence header overstates the independence of `rework-3`'s
    spec-drift review (IR-003).
- **Out-of-scope changes.** None.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework against `CAP-002-E4-S6-tasks.md` and this
  report.
  - Add the TC-COMP-139 tests that IR-001 and IR-002 describe; TC-COMP-138
    may hold the sort trigger. They must kill
    `manual:review-v4:scroll-state-not-set`,
    `manual:review-v4:direct-branch-above-too` and
    `manual:review-v4:move-guard-dropped`.
  - Neither finding needs a production change. On HEAD, probes R1-R3 already
    pass.
  - Address IR-003 in the evidence.
  - Then rerun this review. The next review passes this report's mutation
    JSON as `scope --previous`, so these three survivors are `carried`.
- **Warnings accepted downstream**: N/A
