---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S6-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E4-S6"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-30T05:19:09Z"
reviewed_head: "42def12a5dbb51a5803d330b2200b14a97c55153"
review_base: "7688c924c554920816b60fd6af60fc81f1164174"
reviewed_state_revision: "sha256:b10775101d71697fe0aab52f0bca6100607114f3223151b0da0c910ed30099de"
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
  timestamp: 2026-10-30T05:19:09Z
  source_artifacts:
    - id: CAP-002-E4-S6
      version: "1 (sha256:1268acae5032a74abf0cd41c370011b221d69c849d1849f4630bd955499db903)"
    - id: CAP-002-E4-S6-tasks
      version: "1 (updated 2026-10-30, last_reworked_review v1)"
    - id: CAP-002-E4-S6-tdd-evidence
      version: "cycle-1 to cycle-4, rework-1"
    - id: CAP-002-E4-S6-implementation-review
      version: "1 (baseline, reviewed_head 254b37401ee525b8348221d1414ea5685afd9e0c)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-tests
      version: "1"
    - id: design-system data-table design-spec
      version: "as at review base"
    - id: DEC-0159, DEC-0160, DEC-0161, DEC-0162, DEC-0164, DEC-0239, DEC-0240
      version: "as recorded in projects/factorflow-v2/decisions (DEC-0240 with its IR-009 amendment)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S6 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 16/17 verified |
| Required validation | 7/7 passed |

The rework resolves eight of the ten v1 findings in full and narrows a ninth.

- **IR-001 (v1), the missing announcement.** Each first page now re-inserts
  the polite region's sentence as a new node keyed by a serial. A sort or
  refresh-once that leaves the count unchanged is therefore announced.
  TC-COMP-138 and T006 watch the region with a `MutationObserver`.
- **IR-002 to IR-005 (v1), the fourteen surviving mutants.** All fourteen are
  now killed.
- **IR-006 (v1), the Symbol sort.** From a factor sort, *Sort by symbol* now
  returns to the A to Z default.
- **IR-007 (v1), refresh focus.** A refresh-once keeps focus on a focused row
  that is still in page one.
- **The rest.** IR-008 and IR-010 are fixed in code, and IR-009 is recorded
  for the owner in DEC-0240.

Validation is clean:

- lint, format and `tsc`;
- the full web suite (997 tests in 49 files) and the build;
- the T015 built-CSS check;
- the TDD-evidence lint, with 0 errors.

The gate fails on one HIGH finding in the rework's own code (scope `delta`).

**IR-001 (HIGH).** The new focus-keeping helper finds the focused row through
`closest("tr[data-symbol]")`. Focus therefore stays put when it is on a
control inside the row, such as the row's checkbox, as well as on the row
itself. No test reaches the control case. The reviewer mutant
`focus-row-only` accepts only the row element itself, and it survives. Probe
Q1 shows the gap. On the reviewed code, focus on *Select SYM0040* survives a
refresh-once. Under the mutant it falls to `BODY`, and all 88 story tests
still pass. T006 requires that a refresh "does not move focus", and the
design says the set refresh never moves focus. So T006 is `PARTIAL`.

The non-blocking findings:

- **IR-002 (MEDIUM, carried).** A row outside the refreshed page one still
  loses focus, and that behaviour is not recorded for the owner.
- **IR-003 (MEDIUM, late).** No test stops a later page from re-announcing
  the count.
- **IR-004 (LOW).** A test comment misstates jsdom's focus behaviour.

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 2 · LOW 1 · **total 4**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S6` |
| HEAD | `42def12a5dbb51a5803d330b2200b14a97c55153`. The branch holds three commits: `254b374` (the initial coding), `95828f6` (the v1 review) and `42def12` (the rework against v1). |
| Review base | `origin/main` = `7688c924c554920816b60fd6af60fc81f1164174`, supplied by the driver and resolved with `pipeline-state.py review-base --base-ref origin/main`. It is an ancestor of HEAD. |
| Working tree | Clean before and after validation; `git status --porcelain=v1 --untracked-files=all` printed nothing |
| Changed files reviewed | 33 since the base; 11 since the baseline (`git diff --name-status 254b374..HEAD`) |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `254b37401ee525b8348221d1414ea5685afd9e0c`, with `CAP-002-E4-S6-implementation-review-v1-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/results-window.ts` | added | T010; DEC-0160 (unchanged since the baseline) |
| `web/src/screens/research/results-window.test.ts` | added | T007 (unchanged since the baseline) |
| `web/src/screens/research/results-table.tsx` | added | T011, T012, T013, T016; DEC-0159, DEC-0161, DEC-0162, DEC-0164, DEC-0240. The rework changed `focusedSymbolIn`, `nextSort`, `Announcement`, the page-one `.then`, the region's span, the Space branch and the contract comment (v1 IR-001, IR-006, IR-007, IR-008, IR-010) |
| `web/src/screens/research/results-table.test.tsx` | added | T001-T006, T008 (TC-COMP-093, -098, -110, -138, -139). The rework added 19 tests and 11 assertions to existing tests (v1 IR-001 to IR-007, IR-010) |
| `web/src/screens/research/copy.ts` | modified | T009 (`SORT.*`, DEC-0161); `RESULTS.columns` (DEC-0239) (unchanged since the baseline) |
| `web/src/screens/research/copy.test.ts` | modified | T009 anchors (unchanged since the baseline) |
| `…/stories/CAP-002-E4-S6-tasks.md` | modified | Checkboxes; `updated: 2026-10-30`; `last_reworked_review: …-v1.md` |
| `…/stories/CAP-002-E4-S6.md` | modified | `status: planning` to `in-review` (story lifecycle) |
| `…/stories/CAP-002-E4-S6-tdd-evidence.yaml` | added | T017: cycles 1-4 and the `rework-1` cycle |
| `…/stories/CAP-002-E4-S6-evidence/` (22 files) | added | T017: `cycle-1..4.patch` and `rework-1.patch`; `red-*` and `green-*` logs; `full-suite.log` and `full-suite-rework-1.log`; `mutation-cycle-1..4-results.json` and `mutation-rework-1-results.json` |
| `…/stories/CAP-002-E4-S6-implementation-review-v1.md`, `…-v1-mutation.json` | added | The v1 gate report and its mutation results (the driver's commit `95828f6`) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `results-table.tsx` `StockTableRow` renders S3's `FactorCell` per factor without `showScore` | T008 "renders each factor cell through FactorCell: the whole-number percentile, an aria-hidden bar, no score" | Display side only, as the story scopes it |
| AC-11 | SATISFIED | `results-window.ts` `visibleWindow`; the body renders `range.start..range.end` between two `aria-hidden` spacers (`results-table.tsx:646-669`) | TC-COMP-093 block, including "hides both spacer rows from assistive technology" (`results-table.test.tsx:332`) | Component level only; the E2E volume spec is Phase 6b (Open Gap 6) |
| AC-12 | SATISFIED | `FactorCell` per cell; no row-level style | TC-COMP-098 block | |
| AC-14 | SATISFIED | `FactorHeader` (`:252-303`), `cellFor` guard (`:310-326`) | TC-COMP-110 block, including "carries no aria-sort on the unranked column even when the query sorts by it" (`:1346`) | |
| AC-16 | SATISFIED | `sortBy`, `nextSort` (`:196-205`), `toListParams`; selection and checking by symbol | TC-COMP-138 and TC-COMP-139 blocks; the Symbol entry tests (`:1592`, `:1622`) | |
| DAC-E4-1 | SATISFIED | as AC-9, AC-12, AC-14 | as above | |
| DAC-E4-S6-1 | SATISFIED | `FactorHeader`; `cellFor` | TC-COMP-110 (`:1270-1385`) | |
| DAC-E4-S6-2 | SATISFIED | Request, `aria-sort` and focus as in v1. The region renders `<span key={announcement.serial}>` (`:676-678`), and each first page bumps the serial (`:461-464`) | "announces the match count again after a sort that leaves it unchanged" (`:1667`): no mutation before the response, at least one after it, the same sentence and the same region element | v1 IR-001 resolved. Mutants `span-unkeyed`, `serial-not-bumped` and `announce-before-page` are killed |
| DAC-E4-S6-3 | SATISFIED | response order rendered as-is; `aria-describedby` to an `sr-only` `SORT.incompleteLast` | TC-COMP-098 block, now asserting `sr-only` (`:1437`) | |
| DAC-E4-S6-4 | SATISFIED | `StockTableRow` `onClick` and `onKeyDown` (Space on the row is prevented, `:808-810`); checkbox `stopPropagation`; `select`, `toggle`, `move` | TC-COMP-139 block, including `:1871` and `:1895` | |
| DAC-E4-S6-5 | SATISFIED | as AC-11 | TC-COMP-093 block | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `results-table.test.tsx:1270-1385` | The new case sorts by `growth_percentile` and `growth_score` while Growth is unranked. Mutant `unranked-header-keeps-aria-sort` is killed |
| T002 | complete | VERIFIED | `:1388-1468` | The description is asserted `sr-only`. Mutant `description-visible` is killed |
| T003 | complete | VERIFIED | `:1471-1703` | Announcement with an unchanged count; glyph per state. Mutants `sort-arrows-swapped`, `span-unkeyed` and `serial-not-bumped` are killed |
| T004 | complete | VERIFIED | `:1759-2098` | An arrow press past either end, then a sort, keeps focus on the button. Mutant `move-guard-dropped` is killed |
| T005 | complete | VERIFIED | `:278-359` | Spacers `aria-hidden`; the tbody exposes only stock rows. Both spacer mutants are killed |
| T006 | complete | PARTIAL | `:362-1139` | All seven v1 lifecycle mutants are killed, and the region is asserted `sr-only`. The refresh "does not move focus" clause is pinned for focus on the row element only. Focus on a control inside the row (the checkbox) is unpinned, and mutant `focus-row-only` survives (IR-001). No test pins that a later page leaves the region untouched (IR-003, late) |
| T007 | complete | VERIFIED | `results-window.test.ts` (17 tests) | Four equivalent boundary survivors, carried from v1 |
| T008 | complete | VERIFIED | `:1142-1256`, `:1706-1740`, `:2101-2184` | As v1 |
| T009 | complete | VERIFIED | `copy.ts` `SORT`, `RESULTS.columns`; `copy.test.ts` | Unchanged since the baseline |
| T010 | complete | VERIFIED | `results-window.ts` | Unchanged since the baseline |
| T011 | complete | VERIFIED | `results-table.tsx:360-749` | Loading, paging, epochs, empty states and errors as in v1. The region now announces an unchanged count (v1 IR-001). A refresh-once keeps the window on a focused row still in page one (`:445-460`). The residual case of a row outside page one is IR-002 (MEDIUM) |
| T012 | complete | VERIFIED | `FactorHeader`, `SortButton`, `nextSort`, `ariaSortFor`, `cellFor` | From a factor sort, Symbol returns to its A to Z default (v1 IR-006) |
| T013 | complete | VERIFIED | `StockTableRow`, `select`, `toggle`, `move`, pending-focus effect | Space on the row is prevented (v1 IR-010). The 4 px edge is recorded in DEC-0240 (v1 IR-009) |
| T014 | complete | VERIFIED | full suite 997/997; diff confined to the planned files, T017 evidence and the v1 review artifacts | No delivered file other than `copy.ts` and `copy.test.ts` changed; the `render.test.tsx` scan passes |
| T015 | complete | VERIFIED | Reviewer's scan of `src/factorflow/api/static/assets/index-DHvcDLXQ.css` | The scan found every literal class the table writes, which T015 requires, and `--factor-value:`, `--factor-growth:`, `--factor-momentum:`, `--muted:` and `--row-height`. `bg-muted` is absent and unused (DEC-0240) |
| T016 | complete | VERIFIED | doc comments on every export; `ResultsTable` contract comment (`:328-359`) | Now states that `query` is compared by identity (v1 IR-008) |
| T017 | complete | VERIFIED | `CAP-002-E4-S6-tdd-evidence.yaml`: four cycles plus `rework-1`, `commit_hash: stage` | Reviewer-run lint: 0 errors, 0 warnings. The `rework-1` description repeats the jsdom claim that IR-004 corrects |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-110 / T001 | ADEQUATE | Header sentence once from response numbers; every Growth cell *Not enough to rank*; no buttons; no `aria-sort` on any header when the query sorts by the unranked factor's percentile or score; classified-in-unranked guard | none |
| TC-COMP-098 / T002 | ADEQUATE | Two percentiles and one *Incomplete*; response order; `sr-only` description via `aria-describedby`; `hideIncomplete` reaches the read | none |
| TC-COMP-138 / T003 | ADEQUATE | Request params per cycle; `aria-sort` and glyph per state on factor and Symbol buttons; Symbol from a factor sort and from an explicit `symbol asc`; focus kept; busy rows kept; announcement after a sort that keeps the count (no change before the response, a change after it) | none |
| TC-COMP-139 / T004 | ADEQUATE | Click and Enter select without checking; Space and click check without selecting; arrows with focus; past either end then a sort keeps focus on the button; Space on the row prevented, Space on the checkbox and Enter on the row not | none |
| TC-COMP-093 / T005 | ADEQUATE | Row and cell bound for 50 and 3000 rows; `aria-rowcount`, `aria-rowindex`; spacers `aria-hidden` and non-zero; only stock rows exposed as rows | none |
| T006 | WEAK | The seven v1 lifecycle cases; refresh keeps focus on a row still in page one (also when reordered, and when moved to the top); focus outside the table resets the window; region `sr-only`; announcement after a refresh-once that keeps the count | Focus on a control inside the row across a refresh-once is unpinned: `focus-row-only` survives (IR-001, `delta`). A later page leaving the region untouched is unpinned: `announce-on-later-page` survives (IR-003, `late`; does not make the test WEAK) |
| T007 | ADEQUATE | Every formula, clamp and boundary of the three functions | Four equivalent boundary survivors |
| T008 | ADEQUATE | Structure, scopes, cell composition, swatch token, alignment, extraColumns placement and span | `extra-header-no-scope` equivalent (v1) |
| `copy.test.ts` (T009) | ADEQUATE | Exact strings for every new key | none |

### Mutation run (reviewer)

The run took four steps.

1. **Generate.** `mutation-run.py generate --range 7688c924..HEAD --cycle review`
   produced 93 catalogue mutants: 77 in `results-table.tsx` and 16 in
   `results-window.ts`. The reviewer added 20 hand-written mutants, prefixed
   `manual:review-v2:`, over the rework's code and its neighbours.
2. **Scope.** `mutation-run.py scope --since 254b3740… --previous
   …-v1-mutation.json` produced 196 entries: 105 carried, 29 delta and 62
   late. Nine v1 mutants no longer apply because their lines changed. Their
   rework counterparts are among the delta mutants, such as
   `manual:review-v2:first-page-then-unguarded`.
3. **Remove duplicates.** The 62 late entries included 56 catalogue mutants
   that the rework's inserted lines had shifted to new line numbers. Each is
   byte-identical to a carried v1 mutant at the same current line, so the
   reviewer dropped those 56 and kept the carried copy.
4. **Run.** 140 mutants ran against `results-table.test.tsx`,
   `results-window.test.ts` and `copy.test.ts` with six workers. The six
   baselines exited 0.

Results: 115 killed, 25 survived, 0 stillborn, 0 timeouts. The results file
is `CAP-002-E4-S6-implementation-review-v2-mutation.json` (sha256
`8e0b1622494da60a7427d20cfe87133a66ec861a98379bb0025851aec7c74443`).

| Scope | Killed | Survived | Survivors |
|-------|--------|----------|-----------|
| carried | 84 | 21 | The 21 that v1 judged equivalent and that still apply. v1's 22nd, the `setScrollTop(0)` 1 px flip, no longer applies. All 14 non-equivalent v1 survivors are now killed |
| delta | 26 | 3 | Two equivalent (`:390` serial starts at 1, `:463` serial bumps by 2). The serial is only a React key, and any change remounts the span. One non-equivalent, `manual:review-v2:focus-row-only` (IR-001) |
| late | 5 | 1 | `manual:review-v2:announce-on-later-page` (IR-003) |

The carried equivalent survivors are as v1 disposed of them:

- ten `results-table.tsx` catalogue mutants on initial state values, the
  identity-only counters `generation` and `attempt`, and the `loadedCount`
  fallback (now at lines 386, 387, 391, 393, 394, 402, 430, 508, 517 and 616);
- four `results-window.ts` boundary flips (lines 37 ×2, 73 and 76);
- seven hand-written mutants: `restart-ignores-refresh`,
  `skeleton-not-hidden`, `extra-header-no-scope`, `sticky-header-dropped`,
  `error-cell-one-column`, `later-page-retry-wrong-cursor` and
  `arrow-no-prevent-default`.

The reviewer agrees with each, for the reasons v1 gives.

### Reviewer probes

The probes ran in a throwaway clone at HEAD, under scratchpad `ar-s6-v2/probe`.
The component repository was not touched.

| Probe | On the reviewed code | Under the mutant |
|-------|----------------------|------------------|
| Q1: focus on `Select SYM0040` (50 rows, scrolled to row 30), then a refresh-once with the same rows | Focus stays on the checkbox; `scrollTop` 960 | `focus-row-only`: focus falls to `BODY`; `scrollTop` 0 |
| Q2: 100 rows paged, `SYM0065` focused, then a refresh-once whose page one is `SYM0000`-`SYM0049` | Focus falls to `BODY`; selection `SYM0065` kept by the host; row not rendered; `scrollTop` 0 (IR-002) | — |
| Q3: three sorts with an unchanged count | The region holds one `span` | — |
| Q4, Q7: jsdom and a moved focused node | `insertBefore` of a focused node drops `document.activeElement` without a `blur` event. In the reorder scenario without the shim, the row fires 0 blur and 1 focus events and ends focused (IR-004) | — |
| Q5: never-populated first page | The region reads *0 stocks match*, as the plan's "after every first page" places it | — |
| Q6: the user scrolls to row 33 while the refresh is pending | Focus kept; `scrollTop` 1056 (the live position) | — |
| Q8: a later page lands | 0 mutations in the region | `announce-on-later-page`: 2 mutations |

**Determinism and isolation.** The new tests control arrival with deferred
promises and use real timers. The reorder test restores its
`Node.prototype` spies in `finally`, and the host-row test removes its table
the same way. The suite passed in the focused run, in the full run and on six
mutation baselines.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/screens/research/results-table.test.tsx web/src/screens/research/results-window.test.ts web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files, 424 tests (88 + 17 + 319) |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome lint .`: 114 files, no diagnostics |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome format .`: 114 files, no fixes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | no output |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 49 files, 997 tests |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `index-DHvcDLXQ.css` 16.91 kB, `index-CjXBZuTH.js` 222.28 kB, written into the ignored `src/factorflow/api/static/`. The table is not imported yet, so the bundle matches v1 |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S6-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7688c924c554920816b60fd6af60fc81f1164174 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| T015 built-CSS check: a scan of the built CSS for the table's 41 literal classes and the `--factor-*`, `--muted` and `--row-height` definitions | `repos/factorflow-v2/FactorFlow-v2` | N/A | PASS | All present; `bg-muted` is absent and unused (DEC-0240) |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratchpad>/ar-s6-v2/mutants.json --jobs 6 --command '… vitest run <3 story suites>' --out <scratchpad>/ar-s6-v2/results.json` | harness root | 3 | 115 killed / 25 survived | Exit 3 reports survivors. One is non-equivalent and `delta` (IR-001), and one is `late` (IR-003) |
| `npm run test:e2e` | — | N/A | NOT RUN | The task plan excludes it: no screen hosts the table, and no volume E2E case exists (Validation Plan; Open Gap 6) |

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E4-S6` at `42def12`, clean; `code-revision` `sha256:b1077510…99de`.
- After: same HEAD and branch, clean; `code-revision` unchanged (`sha256:b1077510…99de`). The build wrote only into the ignored `src/factorflow/api/static/`, and the mutation run worked in clones under the scratchpad.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | delta | Refresh focus on a control inside a row is kept but unpinned: `focus-row-only` survives |
| IR-002 | MEDIUM | carried | A refresh-once still drops focus from a row outside the refreshed page one, unrecorded for the owner |
| IR-003 | MEDIUM | late | No test pins that a later page leaves the live region untouched |
| IR-004 | LOW | delta | The reorder test's comment misstates jsdom's handling of a moved focused node |

### IR-001 — Refresh focus on a control inside a row is kept but unpinned: `focus-row-only` survives

- **Severity**: HIGH
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A. The behaviour is specified by T006 and the classification-ui accessibility contract. It is the focus position DAC-E4-S6-4's checking leaves.
- **Tasks**: T006 (test); T011 (production, correct)
- **Files**: `web/src/screens/research/results-table.tsx:156-163` (`focusedSymbolIn`, `document.activeElement?.closest<HTMLTableRowElement>("tr[data-symbol]")`), `:445-460`; `web/src/screens/research/results-table.test.tsx:740-883`
- **Claim challenged**: T006 says that bumping `refreshKey` reloads page one "and does not move focus". Classification-ui's accessibility paragraph says "sorting, filtering, scope change and the set refresh never move focus". The rework's `focusedSymbolIn` doc comment says it finds the focused row "through the row or a control in it". The `rework-1` evidence says it "reads the symbol of the row holding focus".
- **Observed evidence**: Every T006 focus test focuses the row element itself, either by clicking its row header or by calling `rowOf(…).focus()`. None focuses the row's checkbox or another control inside it. Mutant `manual:review-v2:focus-row-only` replaces `closest(...)` with a check that only the row element itself counts. The line was added by the rework, and the mutant survives with all 88 story tests passing. Probe Q1 loads 50 rows, scrolls to row 30, focuses *Select SYM0040* and bumps `refreshKey` with the same rows. On the reviewed code, focus stays on the checkbox and `scrollTop` is 960. Under the mutant, focus falls to `BODY` and `scrollTop` is 0.
- **Expected evidence/behavior**: A T006 test focuses a control inside a row past the first window across a refresh-once, and asserts that focus stays on it.
- **Impact**: The checkbox is where a keyboard user stands after checking with `Space` (DAC-E4-S6-4), and arrows work from it (T013). Losing the `closest` lookup in a refactor would drop that user's focus on every background score-set refresh. This is the defect v1 IR-007 reported, and the suite would stay green. The reviewed code keeps focus correctly; only the test is missing.
- **Required remediation**: Add the test so that `focus-row-only` is killed. Production needs no change.

### IR-002 — A refresh-once still drops focus from a row outside the refreshed page one, unrecorded for the owner

- **Severity**: MEDIUM
- **Scope**: carried (the residual of v1 IR-007)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006, T011
- **Files**: `web/src/screens/research/results-table.tsx:445-460` (`kept === -1` resets the window to 0); `web/src/screens/research/results-table.test.tsx:859-883` ("… and resets when it is gone")
- **Claim challenged**: v1 IR-007 required one of two outcomes. Either a refresh-once keeps focus on a focused row still among the loaded rows, or the plan records that a refresh may return focus to the document. A test pins whichever is chosen. Classification-ui says the set refresh never moves focus.
- **Observed evidence**: The rework keeps focus when the focused row is in the refreshed page one, and that resolves the probe v1 used. When the focused row is not in page one, the window resets and the row unmounts. This covers any row past index 49 once a second page has loaded, and a row the new score set dropped. Probe Q2 loads 100 rows, focuses `SYM0065` and refreshes with `SYM0000`-`SYM0049`. Afterwards `document.activeElement` is `BODY`, the host still holds `SYM0065` as selected, and the row is not rendered. The "resets when it is gone" test asserts `scrollTop` 0 and the row's absence, but not where focus goes. The behaviour is described only in the `rework-1` TDD-evidence text. It is not in the task plan or in a decision record that E4-S9, E1-S8 or the owner reads.
- **Expected evidence/behavior**: Either focus lands somewhere the plan defines, such as the table's tab-stop row, or the plan or a decision records that a refresh returns focus to the document when the focused row is not in page one. A test asserts where focus goes.
- **Impact**: A keyboard or screen-reader user who has scrolled past the first 50 stocks loses their place whenever a background score set completes (DEC-0062). This is the most common case in a 3000-row result.
- **Required remediation**: Record the behaviour for the owner, or move focus to a defined target in the table, and pin the outcome with a test.

### IR-003 — No test pins that a later page leaves the live region untouched

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S6-2 (satisfied)
- **Tasks**: T006 (test), T011
- **Files**: `web/src/screens/research/results-table.tsx:476-515` (`readPage`), `:461-464`, `:676-678`
- **Claim challenged**: T011 says the polite region "is set to `matchLabel(matchCount)` after each first page". The plan's Other Notes say it announces "after every first page, including the first load and each refresh-once".
- **Observed evidence**: Before the rework, setting the same text again on a later page changed nothing in the DOM. Now any serial bump re-inserts the sentence, and that is announced. Mutant `manual:review-v2:announce-on-later-page` adds the first page's serial bump to `readPage`'s success path, and it survives. Probe Q8 records 0 region mutations when a later page lands on the reviewed code, and 2 under the mutant. The mutant edits lines unchanged since the baseline, so `scope` tags it `late`.
- **Expected evidence/behavior**: T006's paging test asserts that appending a later page leaves the region unchanged.
- **Impact**: A refactor that moved the serial bump into a shared "apply a page" step would make a screen reader repeat *2846 stocks match* every 50 rows the user scrolls. The suite would stay green.
- **Required remediation**: Add the assertion. Production needs no change.

### IR-004 — The reorder test's comment misstates jsdom's handling of a moved focused node

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006, T017
- **Files**: `web/src/screens/research/results-table.test.tsx:780-782` (the comment before the `Node.prototype.insertBefore` and `appendChild` spies at `:788-803`); the `rework-1` description in `CAP-002-E4-S6-tdd-evidence.yaml`
- **Claim challenged**: The comment says "jsdom does not [blur] when React moves it, so the move is shimmed to blur as a browser would". The evidence says the same thing.
- **Observed evidence**: Probe Q4 shows that jsdom's `insertBefore` of a focused node drops `document.activeElement` without firing `blur`. Probe Q7 runs the same reorder without the shim. The moved `SYM0040` row fires 0 blur and 1 focus events, so React's commit-time restoration refocused it, and the test's assertions hold.
- **Expected evidence/behavior**: The comment states what the shim adds, which is a `blur` event and nothing more. Alternatively the shim is dropped.
- **Impact**: None on behaviour. A maintainer may trust a `Node.prototype` patch for a reason that is not true, or keep it when changing the test.
- **Required remediation**: Correct the comment and the evidence sentence, or remove the shim.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `results-table.tsx:207-217`, `:461-464`, `:676-678`. Tests "announces the match count again after a sort that leaves it unchanged" (`:1667`) and "… after a refresh-once that leaves it unchanged" (`:723`). Mutants `span-unkeyed`, `serial-not-bumped`, `announce-before-page` and `announce-row-count-v2` are killed. Probe Q3 shows one node in the region after three sorts |
| v1/IR-002 | RESOLVED | "carries no aria-sort on the unranked column even when the query sorts by it" (`:1346`). `manual:review:unranked-header-keeps-aria-sort` is killed |
| v1/IR-003 | RESOLVED | Seven T006 tests (`:885-1041`). All seven lifecycle mutants are killed, and the rework's `first-page-then-unguarded` counterpart is killed too |
| v1/IR-004 | RESOLVED | "leaves focus on a sort button activated after an arrow press past either end" (`:1871`). `manual:review:move-guard-dropped` is killed |
| v1/IR-005 | RESOLVED | Spacer `aria-hidden` (`:332`), region `sr-only` (`:718`), description `sr-only` (`:1437`), glyph per state (`:1488-1530`, `:1589`). All five mutants are killed |
| v1/IR-006 | RESOLVED | `nextSort` (`:196-205`). Tests `:1592` and `:1622`. Mutants `symbol-from-factor-explicit-asc`, `symbol-desc-sticky` and `symbol-cycle-reverted` are killed |
| v1/IR-007 | STILL OPEN (narrowed) | A focused row in page one keeps focus and its window (`:445-460`; tests `:740`, `:764`, `:859`; mutants `kept-ignored`, `reveal-to-row-top`, `reveal-from-zero`, `dom-scroll-not-set`, `state-scroll-not-set` and `keep-reads-old-rows` are killed). A row outside page one still loses focus, with nothing recorded: carried as IR-002. The new branch for a control inside the row is unpinned: IR-001 |
| v1/IR-008 | RESOLVED | `ResultsTable` contract comment `:356-358` states that `query` is compared by identity and that a host keeps one object per URL state |
| v1/IR-009 | RESOLVED | DEC-0240 amendment "CAP-002-E4-S6 review v1 rework, IR-009" records the 4 px width, the missing 3 px step in the border scale and the owner's fix. The decision is open for the owner (`owner_reviewed: false`) |
| v1/IR-010 | RESOLVED | `results-table.tsx:808-810`. The test at `:1895` asserts `fireEvent.keyDown` returns `false` on the row and `true` on the checkbox and for Enter. Mutants `space-not-prevented`, `space-prevented-from-checkbox` and `space-selects` are killed |

## Scope and Plan Deviations

- **Justified deviations, recorded as decisions:** These are as in v1. DEC-0239
  adds `RESULTS.columns`, and DEC-0240 paints the checked fill inline. DEC-0240
  now also records the 4 px selection edge. Both decisions are provisional and
  open, and both sit untracked in the harness's
  `projects/factorflow-v2/decisions/`, for the driver to commit.
- **Rework scope:** Every production change since the baseline traces to a v1
  finding: IR-001, IR-006, IR-007, IR-008 and IR-010. Every test change traces
  to IR-001 through IR-007 and IR-010. No delivered file outside the story's
  files changed.
- **Bookkeeping:** Every task is ticked. T006 is PARTIAL here (IR-001). The task
  file's `status` stays `draft`, as in earlier E4 plans. It now carries
  `last_reworked_review: CAP-002-E4-S6-implementation-review-v1.md`.
- **Out-of-scope changes:** none.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework against `CAP-002-E4-S6-tasks.md` and this report.
  - Add a T006 test that kills `manual:review-v2:focus-row-only` (IR-001). The test focuses a row's checkbox past the first window across a refresh-once and asserts that focus stays.
  - Optionally, in the same cycle: record or fix the residual refresh-focus case (IR-002); add the later-page region assertion (IR-003); correct the shim comment (IR-004).
  - Then rerun this review. The next review passes this report's mutation JSON as `scope --previous`.
- **Warnings accepted downstream**: N/A
