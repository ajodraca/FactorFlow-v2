---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S6-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E4-S6"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-10-31T01:34:56Z"
reviewed_head: "ecd9dd12799b1d3307c46bf6740cb332b7b97b0c"
review_base: "b6b583838dfa172827b1f6e2b4f965a0a9dcd492"
reviewed_state_revision: "sha256:a4b6757dccc02bdd1866f3d2a65d3891ea070fe13844b6908922e141a5888e5d"
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
  timestamp: 2026-10-31T01:34:56Z
  source_artifacts:
    - id: CAP-002-E4-S6
      version: "1 (sha256:1268acae5032a74abf0cd41c370011b221d69c849d1849f4630bd955499db903)"
    - id: CAP-002-E4-S6-tasks
      version: "1 (updated 2026-10-30, last_reworked_review v2)"
    - id: CAP-002-E4-S6-tdd-evidence
      version: "cycle-1 to cycle-4, rework-1, rework-2"
    - id: CAP-002-E4-S6-implementation-review
      version: "2 (baseline, reviewed_head 42def12a5dbb51a5803d330b2200b14a97c55153)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-tests
      version: "1"
    - id: DEC-0159, DEC-0160, DEC-0161, DEC-0162, DEC-0164, DEC-0239, DEC-0240, DEC-0244
      version: "as recorded in projects/factorflow-v2/decisions (DEC-0244 owner-upheld 2026-10-31T01:19:31Z)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S6 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 1 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 10/11 satisfied |
| Planned tasks | 16/17 verified |
| Required validation | 7/7 passed |

Rework 2 changed tests only, and it resolves all four v2 findings.

- **v2 IR-001 (HIGH).** A new T006 test keeps focus on a row's checkbox
  across a refresh-once. Mutant `manual:review-v2:focus-row-only` is now
  killed.
- **v2 IR-002 (MEDIUM).** DEC-0244 records the behaviour, and the owner upheld
  it. A test now asserts that focus returns to `document.body` when the
  focused row leaves page one.
- **v2 IR-003 (MEDIUM).** A new test shows a later page leaves the polite
  region untouched. `manual:review-v2:announce-on-later-page` is killed.
- **v2 IR-004 (LOW).** The shim comment is corrected. Probe P1 confirms the
  new wording.

Validation is clean:

- lint, format and `tsc`;
- the full web suite (1192 tests in 55 files) and the build;
- the T015 built-CSS check;
- the TDD-evidence lint, with 0 errors.

In the mutation run, every v2 non-equivalent survivor is killed. The one new
survivor is equivalent.

The gate fails on one CRITICAL production defect. It sits in code unchanged
since v1, so its scope is `late`. A late finding blocks only when it shows a
production defect that violates an acceptance criterion, and this one does
(skill step H).

**IR-001 (CRITICAL, late).** An arrow key press can leave behind a focus
request that nothing consumes. This happens when the press lands on the row
that is already selected and needs no scroll. A keyboard user reaches it
easily. From the selected row, `Tab` twice reaches the next row's checkbox,
and `ArrowUp` then targets the selected row. `select` returns early, nothing
re-renders, and focus stays put. The leftover request then fires on the
table's next unrelated render. Three probes show the effect:

- **P5.** A sort activation moves focus from the sort button to that row. This
  violates DAC-E4-S6-2: "focus does not move".
- **P7.** A filter change moves focus from a control outside the table into
  the table.
- **P4.** Checking a box with `Space` moves focus off the checkbox.

v1 IR-004 described this mechanism for the end-of-list press. The guard added
then covers only that trigger.

**By severity:** CRITICAL 1 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 1**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S6` |
| HEAD | `ecd9dd12799b1d3307c46bf6740cb332b7b97b0c`. The branch adds three commits since the baseline: `fdac840` (the v2 review), `8cdd61f` (a merge of `origin/main`) and `ecd9dd1` (rework 2) |
| Review base | `origin/main` = `b6b583838dfa172827b1f6e2b4f965a0a9dcd492`, supplied by the driver and resolved with `pipeline-state.py review-base --base-ref origin/main`. It is an ancestor of HEAD, and so is the baseline head `42def12` |
| Working tree | Clean before and after validation; `git status --porcelain=v1 --untracked-files=all` printed nothing once the temporary `node_modules` link was removed |
| Changed files reviewed | 40 since the base. Since the baseline, 12 of them changed: 5 evidence files, the v2 report and its mutation JSON, the tasks file, the TDD evidence, `results-table.test.tsx`, and `copy.ts` and `copy.test.ts` through the merge only |
| Baseline | v2 (`CHANGES-REQUIRED`), `reviewed_head` `42def12a5dbb51a5803d330b2200b14a97c55153`, with `CAP-002-E4-S6-implementation-review-v2-mutation.json` |

The merge `8cdd61f` brought in CAP-002-E4-S4 and CAP-002-E4-S5 from
`origin/main`. Its combined diff touches none of this story's files. In
`copy.ts` the merge added S4 and S5 keys; this story's `SORT` and
`RESULTS.columns` hunks are unchanged. None of the modules the table imports
changed between the two bases, other than those `copy.ts` additions:
`classification-client.ts`, `classification-types.ts`, `research-query.ts`
and `factor-cell.tsx` are all untouched.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/results-window.ts` | added | T010; DEC-0160 (unchanged since the baseline) |
| `web/src/screens/research/results-window.test.ts` | added | T007 (unchanged since the baseline) |
| `web/src/screens/research/results-table.tsx` | added | T011, T012, T013, T016; DEC-0159, DEC-0161, DEC-0162, DEC-0164, DEC-0240 (unchanged since the baseline) |
| `web/src/screens/research/results-table.test.tsx` | added | T001-T006, T008. Rework 2 added two T006 tests (`:419-439`, `:786-808`), one assertion (`:930-931`) and a corrected comment (`:826-829`), against v2 IR-001 to IR-004 |
| `web/src/screens/research/copy.ts` | modified | T009 (`SORT.*`, DEC-0161); `RESULTS.columns` (DEC-0239). This story's hunks are unchanged since the baseline |
| `web/src/screens/research/copy.test.ts` | modified | T009 anchors. This story's hunks are unchanged since the baseline |
| `…/stories/CAP-002-E4-S6-tasks.md` | modified | Checkboxes; `last_reworked_review: …-v2.md` |
| `…/stories/CAP-002-E4-S6.md` | modified | `status: planning` to `in-review`, plus `updated` and `last_reworked_review` (story lifecycle) |
| `…/stories/CAP-002-E4-S6-tdd-evidence.yaml` | added | T017: cycles 1-4, `rework-1` (its description corrected for v2 IR-004) and `rework-2` |
| `…/stories/CAP-002-E4-S6-evidence/` (27 files) | added | T017: cycle and rework patches, RED and GREEN logs, full-suite logs and mutation results |
| `…/stories/CAP-002-E4-S6-implementation-review-v1.md`, `-v2.md` and their `-mutation.json` | added | The earlier gate reports (the driver's commits `95828f6` and `fdac840`) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `StockTableRow` renders S3's `FactorCell` per factor without `showScore` (`results-table.tsx:852-856`) | T008 "renders each factor cell through FactorCell…" | Display side only, as the story scopes it |
| AC-11 | SATISFIED | `visibleWindow` (`results-window.ts:46-62`); the body renders `range.start..range.end` between two `aria-hidden` spacers (`results-table.tsx:644-671`) | TC-COMP-093 block (`results-table.test.tsx:278-359`) | Component level only; the E2E volume spec is Phase 6b (Open Gap 6) |
| AC-12 | SATISFIED | `FactorCell` per cell; no row-level style | TC-COMP-098 block (`:1437-1517`) | |
| AC-14 | SATISFIED | `FactorHeader` (`:252-303`); `cellFor` guard (`:310-326`) | TC-COMP-110 block (`:1319-1434`) | Reviewer mutant `unranked-guard-overrides-retired` is killed |
| AC-16 | SATISFIED | `sortBy` and `nextSort` (`:196-205`, `:548-549`), `toListParams`; selection and checking by symbol | TC-COMP-138 and TC-COMP-139 blocks | The controls work. IR-001 affects focus, not the ability to sort, filter or select |
| DAC-E4-1 | SATISFIED | as AC-9, AC-12, AC-14 | as above | |
| DAC-E4-S6-1 | SATISFIED | `FactorHeader`; `cellFor` | TC-COMP-110 | |
| DAC-E4-S6-2 | PARTIAL | A sort issues the request and sets `aria-sort`. Each first page re-announces the count (`:461-464`, `:676-678`). Focus is kept in the general case | TC-COMP-138 (`:1520-1752`); "leaves focus on a sort button activated after an arrow press past either end" (`:1920`) | **IR-001.** Some earlier arrow presses leave a focus request behind: one that lands on the already-selected row and needs no scroll. After such a press, the next sort activation moves focus from the button to that row (probe P5) |
| DAC-E4-S6-3 | SATISFIED | Response order rendered as-is; `aria-describedby` points to an `sr-only` `SORT.incompleteLast` | TC-COMP-098 block | Reviewer mutant `description-on-unranked` is killed |
| DAC-E4-S6-4 | SATISFIED | `StockTableRow` `onClick` and `onKeyDown`; checkbox `stopPropagation`; `select`, `toggle` | TC-COMP-139 block (`:1808-2148`) | Selection and checking state never interfere. IR-001's leftover request can move focus when a box is checked (P4), but the selection and the checked list stay as the user set them |
| DAC-E4-S6-5 | SATISFIED | as AC-11 | TC-COMP-093 block | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `results-table.test.tsx:1319-1434` | Unchanged since the baseline |
| T002 | complete | VERIFIED | `:1437-1517` | Unchanged since the baseline |
| T003 | complete | VERIFIED | `:1520-1752` | Unchanged since the baseline. It does not reach IR-001's trigger (see Test Quality) |
| T004 | complete | VERIFIED | `:1808-2148` | Unchanged since the baseline. It covers arrows from the selected row and from the selected row's checkbox, but not an arrow onto the selected row (IR-001) |
| T005 | complete | VERIFIED | `:278-359` | Unchanged since the baseline |
| T006 | complete | VERIFIED | `:362-1188` | v2 IR-001: the checkbox test (`:786-808`) kills `focus-row-only`. v2 IR-002: the `document.body` assertion (`:930-931`) pins DEC-0244. v2 IR-003: the later-page region test (`:419-439`) kills `announce-on-later-page` |
| T007 | complete | VERIFIED | `results-window.test.ts` (17 tests) | Four equivalent boundary survivors, carried from v1 |
| T008 | complete | VERIFIED | `:1191-1316`, `:1755-1805`, `:2150-2233` | Reviewer mutants `column-count-ignores-extras` and `checked-fill-dropped` are killed |
| T009 | complete | VERIFIED | `copy.ts` `SORT`, `RESULTS.columns`; `copy.test.ts` | Unchanged since the baseline. `FACTOR_LABELS` is S2's single export (Open Gap 10) |
| T010 | complete | VERIFIED | `results-window.ts` | Unchanged since the baseline |
| T011 | complete | VERIFIED | `results-table.tsx:360-749` | Unchanged since the baseline. Reviewer mutants `match-label-ignored` and `never-populated-hides-error` are killed |
| T012 | complete | VERIFIED | `FactorHeader`, `SortButton`, `nextSort`, `ariaSortFor`, `cellFor` | Unchanged since the baseline |
| T013 | complete | PARTIAL | `StockTableRow`, `select` (`:556-568`), `move` (`:580-597`), pending-focus effect (`:410-423`) | T013 says arrows select the neighbouring row and focus it "once rendered". When that row is already selected and visible, focus does not move. The leftover request is consumed by the table's next unrelated render (IR-001) |
| T014 | complete | VERIFIED | Full suite 1192/1192 after the merge; the diff from the base touches only the planned files, the T017 evidence and the review artifacts | The `render.test.tsx` scan passes |
| T015 | complete | VERIFIED | Reviewer scan of `src/factorflow/api/static/assets/index-Bune3uMY.css` | Every literal class the table writes is present, and so are `--factor-value:`, `--factor-growth:`, `--factor-momentum:`, `--muted:` and `--row-height` |
| T016 | complete | VERIFIED | Doc comments on every export; `ResultsTable` contract comment (`:328-359`) | Unchanged since the baseline |
| T017 | complete | VERIFIED | `CAP-002-E4-S6-tdd-evidence.yaml`: four cycles, `rework-1`, `rework-2`; `commit_hash: stage` | Reviewer-run lint: 0 errors, 0 warnings. The `rework-2` RED applies the two v2 survivors and fails exactly the two new tests (`red-rework-2.log`: 2 failed, 88 passed). Its text calls DEC-0244 `owner_reviewed false`, which was true when written; the decision has since been upheld |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-110 / T001 | ADEQUATE | Header sentence once; every Growth cell *Not enough to rank*; no buttons; no `aria-sort` on the unranked column; classified-in-unranked guard; retired cells kept | none |
| TC-COMP-098 / T002 | ADEQUATE | Two percentiles and one *Incomplete*; response order; `sr-only` description; `hideIncomplete` reaches the read | none |
| TC-COMP-138 / T003 | ADEQUATE | Request parameters per cycle; `aria-sort` and glyph; Symbol cycle; focus kept, including after an arrow press past either end; busy rows kept; re-announcement with an unchanged count | The arrow-onto-selected trigger is not exercised. It is reported as the production defect IR-001; a late test gap does not make the test `WEAK` (skill step H) |
| TC-COMP-139 / T004 | ADEQUATE | Click and Enter select without checking; Space and click check without selecting; arrows with focus, from the row and from the selected row's checkbox; ends; debounce; survival across sort, refresh and scope | No test arrows from an unselected row's control onto the selected row (IR-001) |
| TC-COMP-093 / T005 | ADEQUATE | Row and cell bound for 50 and 3000 rows; `aria-rowcount`, `aria-rowindex`; spacers | none |
| T006 | ADEQUATE | The v2 cases, plus the following. Focus on a checkbox past the first window is kept across a refresh-once, as the same element, with `scrollTop` 960. When the focused row leaves page one, focus falls to `document.body` (DEC-0244). A later page produces no region mutation, with a `MutationObserver` attached before the read | none |
| T007 | ADEQUATE | Every formula, clamp and boundary | Four equivalent boundary survivors |
| T008 | ADEQUATE | Structure, scopes, composition, swatch token, alignment, extraColumns placement and span | `extra-header-no-scope` equivalent (v1) |
| `copy.test.ts` (T009) | ADEQUATE | Exact strings for every new key | none |

### Mutation run (reviewer)

The run took four steps.

1. **Generate.** `mutation-run.py generate --range b6b58383..HEAD --cycle
   review` produced 93 catalogue mutants: 77 in `results-table.tsx` and 16 in
   `results-window.ts`. The reviewer added 14 hand-written mutants, prefixed
   `manual:review-v3:`.
2. **Scope.** `mutation-run.py scope --since 42def12a… --previous
   …-v2-mutation.json` produced 210 entries: 139 carried and 71 late. Every
   previous mutant still applies.
3. **Remove duplicates.** No production line moved since the baseline, so the
   56 catalogue mutants that v2 dropped as line-shifted duplicates return
   under current-line IDs. Each produces a byte-identical mutated file to a
   carried mutant, by the SHA-256 of the mutated file, so the reviewer dropped
   those 56 and kept the carried copy.
4. **Run.** 154 mutants ran against `results-table.test.tsx`,
   `results-window.test.ts` and `copy.test.ts` with six workers. The six
   baselines exited 0, and the tree patch was empty (`e3b0c442…`).

Results: 130 killed, 24 survived, 0 stillborn, 0 timeouts. Nine kills took 75
to 84 seconds, because the suite's own waits timed out; each exited 1. The
results file is `CAP-002-E4-S6-implementation-review-v3-mutation.json`
(sha256 `3d5f62c0b684063d63dfd1d6f13583c6c26419f47d911ca11d3de5bc3ed0cfed`).

| Scope | Killed | Survived | Survivors |
|-------|--------|----------|-----------|
| carried | 116 | 23 | The 21 that v1 judged equivalent, plus v2's two equivalent `serial` mutants (`:390` starts at 1, `:463` bumps by 2). v2's non-equivalent `focus-row-only` is now killed |
| delta | 0 | 0 | No production line changed since the baseline |
| late | 14 | 1 | `manual:review-v3:pending-focus-cleared-before-render`, which is equivalent (below). v2's late `announce-on-later-page` is now killed |

**The carried equivalents.** The reviewer re-checked each of them against the
current code and agrees with the earlier reviews:

- ten mutants on initial state values, the identity-only counters
  `generation` and `attempt`, and the `loadedCount` fallback;
- four `results-window.ts` boundary flips;
- `restart-ignores-refresh`, `skeleton-not-hidden`, `extra-header-no-scope`,
  `sticky-header-dropped`, `error-cell-one-column`,
  `later-page-retry-wrong-cursor` and `arrow-no-prevent-default`;
- the two `serial` mutants.

**The late survivor.** `pending-focus-cleared-before-render` clears the focus
request on every effect run, before it looks for the row. On the specified
path, an arrow press commits its own render, and that render holds the target
row. The request is therefore consumed on the first run either way, and the
mutant changes nothing T013 specifies. It behaves differently only when the
request outlives that render, which is IR-001's defect path. There the mutant
drops the leftover request instead of acting on it later.

**The 13 other reviewer mutants** are all killed:

- `refresh-focus-to-first-row`: DEC-0244's rejected alternative. The new
  `document.body` assertion kills it.
- `checkbox-propagates`, `arrow-from-any-control`, `enter-from-any-target`,
  `inspect-on-unchanged-selection`, `check-order-prepended`,
  `unranked-guard-overrides-retired`, `checked-fill-dropped`,
  `match-label-ignored`, `column-count-ignores-extras`,
  `never-populated-hides-error`, `description-on-unranked` and
  `dim-while-paging`.

### Reviewer probes

The probes ran in a throwaway clone of HEAD under scratchpad `ar-s6-v3/probe`,
deleted afterwards. The component repository was not touched.

| Probe | Observed on the reviewed code |
|-------|-------------------------------|
| P1: jsdom, `insertBefore` of a focused button | `document.activeElement` becomes `BODY`, and 0 `blur` events fire. This confirms the corrected comment (v2 IR-004) |
| P2: 100 rows paged; focus on *Select SYM0065*; a refresh-once whose page one is `SYM0000`-`SYM0049` | Focus falls to `BODY`; `scrollTop` 0; `SYM0065` stays checked. This is DEC-0244's recorded case, "a focused row (or a control in it)" |
| P3: the v2 IR-001 shape, then `ArrowDown` from the kept checkbox | `SYM0041` is selected and focused |
| P4: `SYM0005` selected; focus on *Select SYM0006*; `ArrowUp`; then `Space` | After `ArrowUp`, focus stays on *Select SYM0006* and the selection stays `SYM0005`. After `Space`, `SYM0006` is checked and focus is on the `SYM0005` row (IR-001) |
| P5: the same arming, then a click on *Sort by value percentile* | The request carries `sort: value_percentile`, `order: asc`. Focus is on the `SYM0005` row right after the click and after the response, not on the button (IR-001; DAC-E4-S6-2) |
| P6: control. `SYM0005` selected; focus on its own checkbox; `ArrowUp` | `SYM0004` is selected and focused. The normal path works |
| P7: keyboard only. Click `SYM0005`, `Tab`, `Tab`, `ArrowUp`; focus a host input outside the table; then a query change (`hideIncomplete`) | The tab stops are the `SYM0005` row, then *Select SYM0005*, then *Select SYM0006*. After `ArrowUp`, focus is still on *Select SYM0006*. The query change's re-render moves focus from the outside input to the `SYM0005` row. The refresh that follows leaves the input alone, because the request has been consumed (IR-001) |

**Determinism and isolation.** The two new tests control arrival with deferred
promises and use real timers. The suite passed:

- in the focused run;
- in the full run;
- on the six mutation baselines.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/screens/research/results-table.test.tsx web/src/screens/research/results-window.test.ts web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 1 | NOT VALID (sandbox) | `EPERM … open '…/FactorFlow-v2/node_modules/.vite/vitest/results.json'`: vitest writes its cache through the linked `node_modules`, which the Bash sandbox does not allow. The plain call below was rerun outside the sandbox |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run test -- src/screens/research/results-table.test.tsx src/screens/research/results-window.test.ts src/screens/research/copy.test.ts` | the repository (npm `--prefix`) | 0 | PASS | 3 files, 434 tests (90 + 17 + 327) |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run lint` | the repository | 0 | PASS | `biome lint .`: 127 files, no fixes |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run format` | the repository | 0 | PASS | `biome format .`: 127 files, no fixes |
| `tsc --noEmit -p repos/factorflow-v2/FactorFlow-v2/tsconfig.json` (the shared `node_modules/.bin/tsc`) | harness root | 0 | PASS | No output. Equivalent to `npx tsc --noEmit` at the repository root (`include: ["web/src"]`) |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run test` | the repository | 0 | PASS | 55 files, 1192 tests |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run build` | the repository | 0 | PASS | `index-Bune3uMY.css` 17.83 kB and `index-Dtn2CTHl.js` 222.28 kB, written into the ignored `src/factorflow/api/static/` |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S6-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base b6b583838dfa172827b1f6e2b4f965a0a9dcd492 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| T015 built-CSS check: a scan of the built CSS for the table's literal classes and the `--factor-*`, `--muted` and `--row-height` definitions | `repos/factorflow-v2/FactorFlow-v2` | N/A | PASS | All present |
| `python3 scripts/mutation-run.py run --repo-dir …/FactorFlow-v2 --mutants <scratchpad>/ar-s6-v3/mutants.json --jobs 6 --command '… ./node_modules/.bin/vitest run <3 story suites>' --out <scratchpad>/ar-s6-v3/results.json` | harness root | 3 | 130 killed / 24 survived | Exit 3 reports survivors. All 24 are equivalent |
| `npm run test:e2e` | — | N/A | NOT RUN | The task plan excludes it: no screen hosts the table, and no volume E2E case exists (Validation Plan; Open Gap 6) |

The repository has no `node_modules`. The reviewer linked the shared one at
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/node_modules`
for the validation commands and removed the link afterwards.

### Validation Side Effects

- **Before.** Branch `usr/alvaro-de-jodra/CAP-002-E4-S6` at `ecd9dd1`, clean.
  `code-revision` was `sha256:a4b6757d…8e5d`.
- **During.** The temporary `node_modules` link showed as one untracked entry.
  The build wrote only into the ignored `src/factorflow/api/static/`. The
  mutation run and the probes worked in clones under the scratchpad.
- **After.** The link is removed. HEAD and branch are the same, the tree is
  clean, and `code-revision` is unchanged (`sha256:a4b6757d…8e5d`).
- **Unexpected tracked-file changes:** none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | CRITICAL | late | An arrow press onto the already-selected row leaves a focus request that a later sort, filter, check or refresh acts on |

### IR-001 — An arrow press onto the already-selected row leaves a focus request that a later sort, filter, check or refresh acts on

- **Severity**: CRITICAL. A late finding that shows a production defect
  violating an acceptance criterion blocks (skill step H, *Re-review scope*;
  template invariant 9).
- **Scope**: late. The lines are unchanged since the baseline's
  `reviewed_head` `42def12`, and since the initial coding.
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S6-2 (*focus does not move* on a sort
  activation), now PARTIAL. DAC-E4-S6-4 is touched but stays satisfied: the
  selection and the checked list are as the user set them.
- **Tasks**: T013 (production); T003 and T004 (no test reaches the trigger)
- **Files**:
  - `web/src/screens/research/results-table.tsx:556-568`: `select`, whose
    early return at `:557-559` runs when the target is already selected.
  - `:580-597`: `move`. It sets `pendingFocus` at `:589` even when `select`
    did nothing. It changes state only when `scrollTopToReveal` moves, at
    `:590-596`.
  - `:410-423`: the pending-focus effect. It has no dependency list, so the
    next commit of any cause consumes the request.
- **Claim challenged**:
  - T013 says `ArrowDown` and `ArrowUp`, "from the row or its checkbox",
    select the neighbouring row and focus it "once rendered (a pending-focus
    ref consumed in an effect)".
  - DAC-E4-S6-2 says a sort activation does not move focus.
  - Classification-ui's accessibility paragraph and UX design 1.1 say
    "sorting, filtering, scope change and the set refresh never move focus".
- **Observed evidence**:
  - **The trigger.** Every rendered checkbox is a tab stop. Suppose focus is
    on the checkbox of a row next to the selected row, and both rows are in
    the viewport. An arrow key that targets the selected row then runs
    `select(sameSymbol)`, which returns at once. `move` still sets
    `pendingFocus`, and needs no scroll. No state changes, so nothing
    renders, the effect does not run, and focus stays on the checkbox.
  - **The effect.** The request stays set. The table's next commit, whatever
    its cause, focuses that row.
  - **P7 (keyboard only).** Click `SYM0005`, then `Tab`, `Tab` (onto *Select
    SYM0006*), then `ArrowUp`. Focus stays on the checkbox. The user moves to
    a host input outside the table, and a query change then re-renders the
    table. Focus jumps from the input to the `SYM0005` row.
  - **P5 (a sort).** After the same arming, a click on *Sort by value
    percentile* issues `sort: value_percentile`, `order: asc`. Focus lands on
    the `SYM0005` row, not on the button, right after the click and after the
    response.
  - **P4 (a check).** After the arming, `Space` checks `SYM0006` and moves
    focus to the `SYM0005` row.
  - **P6 (the normal path).** `ArrowUp` from the selected row's own checkbox
    works.
  - **Why the earlier fix missed it.** v1 IR-004 described this mechanism for
    a press past either end: `select` for the same symbol "returns without a
    state change. It still sets `pendingFocus`. Nothing re-renders". The guard
    `if (target === fromIndex) return;` (`:585-587`) covers only that
    trigger.
  - **Why the tests miss it.** The tests at `:1892`, `:1920` and `:1997`
    always press arrows from the selected row or from its own checkbox, so
    the target is never already selected.
- **Expected evidence/behavior**:
  - An arrow press that targets the already-selected row moves focus to that
    row, as T013 requires of every arrow press.
  - No arrow press leaves a focus request that a later, unrelated render can
    act on.
  - A sort activation, a filter or scope change, a refresh-once, a later page
    and a check each leave focus where the user put it.
- **Impact**:
  - **A keyboard user loses their place.** A user who tabs through the
    checkboxes and arrows back onto the selected row sees focus not move.
    Their next action then moves focus somewhere they did not choose. That
    action may be checking a box, sorting, or changing a filter in another
    pane.
  - **The arrow sort controls break.** On a sort, the button loses focus, so
    the user cannot press `Enter` again to cycle the sort as the design
    intends.
  - **Hosts inherit it.** E4-S9's Research screen and E1-S8's Members tab both
    compose this table.
  - **Mouse users can arm it too.** A click on the checkbox of a row next to
    the selected one, followed by an arrow key, is enough.
- **Required remediation**:
  - Make an arrow press onto the already-selected row move focus to it.
  - Make sure no arrow press leaves a focus request that a later render acts
    on. Two ways would work: focus the target directly when it is already
    rendered, or drop the request when no render follows. The choice is the
    Coding Agent's.
  - Pin the fix with TC-COMP-139 and TC-COMP-138 tests. Starting from the
    checkbox of the row next to the selected one, `ArrowUp` focuses the
    selected row. After that arming, a sort activation keeps focus on the
    button, a query change keeps focus on a control outside the table, and
    `Space` on a checkbox keeps focus on it.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 | RESOLVED | "keeps focus on a row's checkbox past the first window across a refresh-once that keeps the row" (`results-table.test.tsx:786-808`). It asserts the same checkbox element and `scrollTop` 960. `manual:review-v2:focus-row-only` is killed in this run, and `red-rework-2.log` shows that test failing under it |
| v2/IR-002 | RESOLVED | DEC-0244 records that focus returns to the document when the focused row, or a control in it, leaves the refreshed page one. The owner upheld it on 2026-10-31T01:19:31Z ("leave it on the page"). The assertion `document.activeElement` is `document.body` (`:930-931`) pins it. Reviewer mutant `refresh-focus-to-first-row`, the rejected alternative, is killed. Probe P2 shows the same outcome for a checkbox. DEC-0244 is untracked in the harness's `projects/factorflow-v2/decisions/`, for the driver to commit |
| v2/IR-003 | RESOLVED | "leaves the polite region untouched when a later page lands" (`:419-439`). A `MutationObserver` records 0 mutations, and the sentence is unchanged. `manual:review-v2:announce-on-later-page` is killed |
| v2/IR-004 | RESOLVED | The comment at `:826-829` now says jsdom drops `document.activeElement` on the move without a `blur` event, and the shim adds only that event. The `rework-1` evidence sentence is corrected to match. Probe P1 confirms it: activeElement becomes `BODY` with 0 blur events |

## Scope and Plan Deviations

- **Justified deviations, recorded as decisions.** DEC-0239 adds
  `RESULTS.columns`, and DEC-0240 paints the checked fill inline and records
  the 4 px selection edge; both are as in v1 and v2. DEC-0244 is new and
  owner-upheld: refresh focus when the focused row leaves page one.
- **Rework scope.** Rework 2 changed only `results-table.test.tsx`, the TDD
  evidence, its evidence files and the tasks file's `last_reworked_review`.
  Each test change traces to a v2 finding. No production line changed.
- **The merge.** `8cdd61f` merged `origin/main`. Its combined diff contains no
  conflict resolution in this story's files.
- **Bookkeeping.** Every task is ticked, and T013 is PARTIAL here (IR-001).
  The task file's `status` stays `draft`, as in earlier E4 plans. The
  `rework-2` evidence calls DEC-0244 unreviewed. That was accurate when
  written, and the decision record is the authority.
- **Out-of-scope changes.** None.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework against `CAP-002-E4-S6-tasks.md` and this report.
  - Fix IR-001 in `results-table.tsx`. An arrow press onto the already-selected
    row must focus it, and no arrow press may leave a focus request for a
    later render.
  - Add the TC-COMP-139 and TC-COMP-138 tests described in IR-001's
    remediation.
  - Then rerun this review. The next review passes this report's mutation
    JSON as `scope --previous`. Because the fix changes production lines,
    those lines are `delta` next time.
- **Warnings accepted downstream**: N/A
