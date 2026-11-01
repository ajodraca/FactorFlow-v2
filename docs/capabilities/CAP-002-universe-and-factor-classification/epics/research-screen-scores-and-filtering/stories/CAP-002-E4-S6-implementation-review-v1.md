---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S6-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-29
updated: 2026-10-29
story_id: "CAP-002-E4-S6"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-30T04:24:05Z"
reviewed_head: "254b37401ee525b8348221d1414ea5685afd9e0c"
review_base: "7688c924c554920816b60fd6af60fc81f1164174"
reviewed_state_revision: "sha256:82fb83148da35571422ae2d2c4530cc932d868ae0b41d56c494405e93d048887"
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
  timestamp: 2026-10-30T04:24:05Z
  source_artifacts:
    - id: CAP-002-E4-S6
      version: "1 (sha256:1268acae5032a74abf0cd41c370011b221d69c849d1849f4630bd955499db903)"
    - id: CAP-002-E4-S6-tasks
      version: "1 (updated 2026-10-29)"
    - id: CAP-002-E4-S6-tdd-evidence
      version: "cycle-1 to cycle-4"
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
      version: "as recorded in projects/factorflow-v2/decisions"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S6 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 5 |
| Medium findings | 2 |
| Low findings | 3 |
| Acceptance criteria | 10/11 satisfied |
| Planned tasks | 10/17 verified |
| Required validation | 7/7 passed |

The table is a native `table` windowed over keyset pages. Sorting, filtering
and counting are requests, and no loaded page is ever re-sorted. The unranked
column renders as DAC-E4-S6-1 requires, including the guard against a
classified cell arriving in an unranked column. Selection and checking are
independent and controlled by symbol. Each of the five mandatory TC-IDs has a
traceable test. Validation is clean: lint, format, `tsc`, the full web suite
(978 tests in 49 files), the build, the built-CSS check of T015 and the
TDD-evidence lint all pass.

The gate fails on one production defect and on test strength:

1. **DAC-E4-S6-2 is not met for the case it names (IR-001).** A sort never
   changes the match count. The live region therefore receives the same text
   it already holds, React writes nothing to the DOM, and assistive technology
   announces nothing. A probe confirmed zero DOM mutations in the region across
   a sort, and across a refresh-once. TC-COMP-138's announcement test passes only
   because its fixture changes the count from 2846 to 1203, which a real sort
   cannot do.
2. **Surviving non-equivalent mutants (skill step E.9).** This reviewer ran 114
   mutants: 84 from the shared catalogue over every changed production file,
   and 30 hand-written. 78 were killed and 36 survived. Twenty-two of the
   survivors are equivalent (listed under *Test Quality Assessment*). The other
   fourteen change specified behaviour that no test pins. For eight of them, a
   reviewer probe passes on the reviewed code and fails under the mutant. The
   fourteen leave four of the five mandatory tests WEAK: TC-COMP-110 (IR-002),
   TC-COMP-139 (IR-004), and TC-COMP-093, TC-COMP-098 and TC-COMP-138 (IR-005).
   They also leave T006's request-lifecycle test WEAK (IR-003).

The two MEDIUM findings are both production behaviour. First, *Sort by symbol*
pressed while a factor sort is active jumps straight to descending (IR-006).
Second, a refresh-once drops keyboard focus from a row outside the reset
window (IR-007).

**By severity:** CRITICAL 0 · HIGH 5 · MEDIUM 2 · LOW 3 · **total 10**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S6` |
| HEAD | `254b37401ee525b8348221d1414ea5685afd9e0c` (the one coding commit, `feat(research): CAP-002-E4-S6 story-coding`) |
| Review base | `origin/main` = `7688c924c554920816b60fd6af60fc81f1164174`, supplied by the driver and resolved with `pipeline-state.py review-base --base-ref origin/main`. The resolved base is an ancestor of HEAD. Without `--base-ref`, the command resolves `1d166f70` because the local `origin/HEAD` points at `origin/usr/alvaro-de-jodra/tech-stack-v7`; that base was not used. |
| Working tree | clean before and after validation (`git status --porcelain=v1 --untracked-files=all` empty) |
| Changed files reviewed | 26 |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/results-window.ts` | added | T010; DEC-0160 |
| `web/src/screens/research/results-window.test.ts` | added | T007 |
| `web/src/screens/research/results-table.tsx` | added | T011, T012, T013, T016; DEC-0159, DEC-0161, DEC-0162, DEC-0164, DEC-0240 |
| `web/src/screens/research/results-table.test.tsx` | added | T001-T006, T008 (TC-COMP-093, -098, -110, -138, -139) |
| `web/src/screens/research/copy.ts` | modified | T009 (`SORT.*`, DEC-0161); `RESULTS.columns` (DEC-0239, a recorded deviation from T009's "add no other string") |
| `web/src/screens/research/copy.test.ts` | modified | T009 anchors |
| `…/stories/CAP-002-E4-S6-tasks.md` | modified | T001-T017 checkboxes ticked, `updated:` date |
| `…/stories/CAP-002-E4-S6.md` | modified | `status: planning` to `in-review` (story lifecycle) |
| `…/stories/CAP-002-E4-S6-tdd-evidence.yaml` | added | T017 |
| `…/stories/CAP-002-E4-S6-evidence/cycle-1.patch` … `cycle-4.patch` (4 files) | added | T017 reviewed patches |
| `…/stories/CAP-002-E4-S6-evidence/red-cycle-1.log` … `red-cycle-4.log` (4 files) | added | T017 RED evidence |
| `…/stories/CAP-002-E4-S6-evidence/green-cycle-1.log` … `green-cycle-4.log` (4 files) | added | T017 GREEN evidence |
| `…/stories/CAP-002-E4-S6-evidence/full-suite.log` | added | T014/T015 evidence |
| `…/stories/CAP-002-E4-S6-evidence/mutation-cycle-1-results.json` … `mutation-cycle-4-results.json` (4 files) | added | T017 mutation evidence |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `results-table.tsx` `StockTableRow` renders S3's `FactorCell` per factor without `showScore` | `results-table.test.tsx` "renders each factor cell through FactorCell: the whole-number percentile, an aria-hidden bar, no score" | Display side only, as the story scopes it |
| AC-11 | SATISFIED | `results-window.ts` `visibleWindow`; `results-table.tsx` body renders `range.start..range.end` between two spacers | TC-COMP-093 block (3000 rows bounded at `VIEWPORT_ROWS + 2 * OVERSCAN_ROWS`; scroll to row 2999); `results-window.test.ts` | Component level only; the E2E volume spec is Phase 6b (Open Gap 6) |
| AC-12 | SATISFIED | `FactorCell` per cell; no row-level style | TC-COMP-098 "renders two percentiles and one Incomplete, never 0" | |
| AC-14 | SATISFIED | `FactorHeader` (no buttons, sentence from `CELL.qualified`); `cellFor` guard forces `not_enough_stocks` unless `retired` | TC-COMP-110 block, including "never shows a percentile on an unranked factor, even when a cell arrives classified" | Production also keeps `aria-sort` off an unranked header when the query sorts by it (probe P5). No test pins that case (IR-002) |
| AC-16 | SATISFIED | `sortBy` and `nextSort`, `onQueryChange`, `toListParams`; selection and checking by symbol | TC-COMP-138, TC-COMP-139 blocks | Symbol cycle from a factor sort: IR-006 (MEDIUM) |
| DAC-E4-1 | SATISFIED | as AC-9, AC-12, AC-14 | as above | |
| DAC-E4-S6-1 | SATISFIED | `FactorHeader` lines 225-276; `cellFor` lines 283-299 | TC-COMP-110 (`results-table.test.tsx:920-1018`) | Test strength: IR-002 |
| DAC-E4-S6-2 | PARTIAL | Request, `aria-sort` and focus are correct. The announcement uses `setAnnouncement(matchLabelRef.current(page.matchCount))` (line 422) into `<output aria-live="polite">` (line 634) | TC-COMP-138 (`:1102-1261`); "announces the server's match count after the sorted page arrives" (`:1238-1244`) uses a changed count | The new match count is not announced after a sort, because the count is unchanged and the region text is identical (IR-001) |
| DAC-E4-S6-3 | SATISFIED | response order rendered as-is; `aria-describedby` to `SORT.incompleteLast` | TC-COMP-098 block | Test strength (visually hidden description): IR-005 |
| DAC-E4-S6-4 | SATISFIED | `StockTableRow` `onClick`, `onKeyDown`, checkbox `stopPropagation`; `select`, `toggle`, `move` | TC-COMP-139 block | Test strength: IR-004 |
| DAC-E4-S6-5 | SATISFIED | as AC-11 | TC-COMP-093 block | Test strength (spacer `aria-hidden`): IR-005 |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | PARTIAL | `results-table.test.tsx:920-1018` | "no `aria-sort`" on the unranked header is asserted only while the query sorts by Value, so it holds trivially; mutant `unranked-header-keeps-aria-sort` survives (IR-002) |
| T002 | complete | PARTIAL | `:1020-1100` | The description element's visual hiding (T012) is unpinned; `description-visible` survives (IR-005) |
| T003 | complete | PARTIAL | `:1102-1261` | The announcement assertion uses a changed count (IR-001); the arrow direction is unpinned (IR-005) |
| T004 | complete | PARTIAL | `:1316-1622` | "Stay put at either end" is pinned for selection only; `move-guard-dropped` survives and steals focus on a later sort (IR-004) |
| T005 | complete | PARTIAL | `:267-331` | Spacer heights asserted, spacer `aria-hidden` not; two mutants survive (IR-005) |
| T006 | complete | PARTIAL | `:333-790` | Seven lifecycle mutants survive (IR-003); the `sr-only` live region is unpinned (IR-005); the refresh focus clause is covered only for focus outside the table (IR-007) |
| T007 | complete | VERIFIED | `results-window.test.ts` (17 tests) | Four surviving boundary flips are equivalent |
| T008 | complete | VERIFIED | `:792-907`, `:1263-1298`, `:1624-1708` | `extra-header-no-scope` survives and is equivalent: an unscoped `th` in the header row is still a column header (HTML auto scope; the computed `columnheader` role is unchanged) |
| T009 | complete | VERIFIED | `copy.ts` `SORT`, `RESULTS.columns`; `copy.test.ts` anchors | `CELL.selectRow` and `FACTOR_LABELS` reused (Open Gap 10). `RESULTS.columns` is an added string under DEC-0239 (provisional, open) |
| T010 | complete | VERIFIED | `results-window.ts` | Constants and functions match T007; `start` additionally clamps to `end`, as T007's beyond-the-end case requires |
| T011 | complete | PARTIAL | `results-table.tsx:330-707` | Loading, paging, epochs, empty states and errors are correct (probes L1-L7 pass on the reviewed code). The live region does not announce an unchanged count (IR-001) |
| T012 | complete | VERIFIED | `FactorHeader`, `SortButton`, `nextSort`, `ariaSortFor`, `cellFor` | Symbol from a factor sort goes to descending (IR-006, MEDIUM) |
| T013 | complete | VERIFIED | `StockTableRow`, `select`, `toggle`, `move`, pending-focus effect | Checked fill is inline per DEC-0240; the selection edge is `border-l-4` (IR-009) |
| T014 | complete | VERIFIED | full suite 978/978; diff confined to the planned files plus T017 evidence | No delivered file other than `copy.ts`/`copy.test.ts` changed; `render.test.tsx` scan passes |
| T015 | complete | VERIFIED | Reviewer's grep of `src/factorflow/api/static/assets/index-DHvcDLXQ.css` | Contains every literal class the table writes and `--factor-value:`, `--factor-growth:`, `--factor-momentum:`, `--muted:`, `--row-height:`; `bg-muted` is absent and unused (DEC-0240) |
| T016 | complete | VERIFIED | doc comments on every export of both modules; `ResultsTable` contract comment (lines 301-329) | States the DEC-0164 `onInspect` contract |
| T017 | complete | VERIFIED | `CAP-002-E4-S6-tdd-evidence.yaml`, four cycles, `commit_hash: stage` | Reviewer-run lint: 0 errors, 0 warnings |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-110 / T001 | WEAK | Header sentence once from response numbers (20/30 and 3/25); every Growth cell *Not enough to rank*, no digit, no title; Growth has no buttons; classified-in-unranked guard; retired kept | No case sorts by the unranked factor, so "no `aria-sort`" is never exercised (IR-002) |
| TC-COMP-098 / T002 | WEAK | Two percentiles and one *Incomplete*; response order either way; description via `aria-describedby`; `hideIncomplete` reaches the read | Visually hidden description unpinned (IR-005) |
| TC-COMP-138 / T003 | WEAK | Request params per cycle; `aria-sort` per cycle; focus kept; busy rows kept; DOM order is response order; Enter/Space once | Announcement asserted only with a changed count (IR-001); arrow direction unpinned (IR-005) |
| TC-COMP-139 / T004 | WEAK | Click/Enter select without checking; Space/click check without selecting; marks; arrows with focus; debounce 150 ms once; tab stop; 3000-row reveal; checked survive sort, refresh and scope | End-of-list guard and its deferred focus steal unpinned (IR-004) |
| TC-COMP-093 / T005 | WEAK | Row and cell bound for 50 and 3000 rows; `aria-rowcount`, `aria-rowindex`; scroll to the end; spacer heights; overflow and `w-full` | Spacer `aria-hidden` unpinned (IR-005) |
| T006 | WEAK | Page one parameters; paging once, append, de-duplication; late page-one response ignored; dim and busy; skeleton; refresh; stale cursor; errors; `onResult`; announcement; empty states | Seven lifecycle mutants survive (IR-003); `sr-only` region unpinned (IR-005) |
| T007 | ADEQUATE | Every formula, clamp and boundary of the three functions | Four equivalent boundary survivors |
| T008 | ADEQUATE | Structure, scopes, cell composition, swatch token, alignment, extraColumns placement and span | `extra-header-no-scope` is equivalent (see T008 row above) |
| `copy.test.ts` (T009) | ADEQUATE | Exact strings for every new key | none |

**Mutation run (reviewer).** The mutants were generated with
`mutation-run.py generate --range 7688c924..HEAD --cycle review` over
`results-table.tsx` and `results-window.ts` (84; `copy.ts` adds string data the
catalogue does not mutate). Thirty hand-written mutants were added, and all 114
ran against `results-table.test.tsx`, `results-window.test.ts` and
`copy.test.ts`. Results: 78 killed, 36 survived, 0 stillborn, 0 timeouts; the
six baselines exited 0. Results:
`CAP-002-E4-S6-implementation-review-v1-mutation.json` (sha256
`794e8c66d62129e936263f8a0a131504909e87e4e778debf16960a43900b719e`).

Equivalent survivors (22), each judged against the story, designs, task plan and decisions:

- Eleven `results-table.tsx` survivors are the same ones the coder disposed of
  in cycle 2: lines 356, 357, 361, 363, 364, 372, 400, 418, 466, 475 and 574.
  They change initial state values, identity-only counters (`generation`,
  `attempt`), a 1 px `scrollTop` that floors to row 0, and a `loadedCount`
  fallback that nothing consumes. The reviewer agrees each is equivalent.
- Four `results-window.ts` boundary flips (lines 37 ×2, 73 and 76) return the
  same number at the boundary.
- `restart-ignores-refresh`: T006 and T011 say a stale cursor "restarts from
  page one once" without scoping *once* to a query or a refresh.
- `skeleton-not-hidden`: T006 and T011 do not specify the skeleton's exposure
  to assistive technology.
- `extra-header-no-scope`: under HTML auto scope the header row's `th` stays a
  column header.
- `sticky-header-dropped`: no artifact specifies a sticky header.
- `error-cell-one-column`: T011 and the data-table §4 specify the colSpan for
  the no-match row only, not for the error body.
- `later-page-retry-wrong-cursor`: `nextCursor` equals `pageError.cursor`
  whenever the line is shown.
- `arrow-no-prevent-default`: T013 does not address the browser's native scroll
  on arrow keys.

Non-equivalent survivors (14): see IR-002, IR-003, IR-004 and IR-005.

**Reviewer probes.** The probes ran in a throwaway clone at HEAD under
scratchpad `ar-s6-v1-probe`; the component repository was not touched. They
used `zz-review-probe.test.tsx` (P1-P5) and `zz-lifecycle-probe.test.tsx`
(L1-L8). All eight L-probes pass on the reviewed code. Under the matching
mutant, each fails, one probe per mutant:

| Probe | Mutant |
|-------|--------|
| L1 | `later-page-then-unguarded` |
| L2 | `page-pending-kept-on-new-query` |
| L3 | `page-error-kept-on-new-query` |
| L4 | `epoch-ignores-refresh` |
| L5 | `first-page-catch-unguarded` |
| L6 | `later-page-catch-unguarded` |
| L7 | `unmount-generation-not-bumped` |
| L8 | `move-guard-dropped` |

**Determinism and isolation.** Fake timers are used only in the three 150 ms
tests, and the clock is faked after a real-timer render. Every read is a
`vi.fn` double, reset in `beforeEach`. Deferred promises control out-of-order
arrival. The suite passed in the focused run, in the full run and on six
mutation baselines.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/screens/research/results-table.test.tsx web/src/screens/research/results-window.test.ts web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files, 405 tests (69 + 17 + 319) |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome lint .`: 114 files, no diagnostics |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome format .`: 114 files, no fixes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | no output |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 49 files, 978 tests |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `index-DHvcDLXQ.css` 16.91 kB, `index-CjXBZuTH.js` 222.28 kB into the ignored `src/factorflow/api/static/` |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S6-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7688c924c554920816b60fd6af60fc81f1164174 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| T015 built-CSS check (grep of the built CSS for the table's literal classes and the `--factor-*`, `--muted`, `--row-height` definitions) | `repos/factorflow-v2/FactorFlow-v2` | N/A | PASS | All present; `bg-muted` absent and unused (DEC-0240) |
| `python3 scripts/mutation-run.py run … --jobs 6 --command '… vitest run <3 story suites>'` | harness root | 0 | 78 killed / 36 survived | See *Test Quality Assessment*; 14 non-equivalent survivors |
| `npm run test:e2e` | — | N/A | NOT RUN | The task plan excludes it: no screen hosts the table yet, and no volume E2E case exists (Validation Plan; Open Gap 6) |

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E4-S6` at `254b374`, clean; `code-revision` `sha256:82fb8314…8887`.
- After: same HEAD, clean; `code-revision` unchanged (`sha256:82fb8314…8887`). The build wrote only into the ignored `src/factorflow/api/static/`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | The match count is not announced after a sort (DAC-E4-S6-2), and the test passes only because its fixture changes the count |
| IR-002 | HIGH | initial | TC-COMP-110 never exercises "no `aria-sort`" on the unranked column |
| IR-003 | HIGH | initial | T006 leaves the superseded-epoch bookkeeping unpinned: seven lifecycle mutants survive |
| IR-004 | HIGH | initial | TC-COMP-139's "stay put at either end" is pinned for selection only; dropping the guard steals focus on a later sort |
| IR-005 | HIGH | initial | Spacer `aria-hidden`, the visually hidden live region and description, and the sort arrow's direction are unpinned |
| IR-006 | MEDIUM | initial | *Sort by symbol* pressed during a factor sort requests descending first |
| IR-007 | MEDIUM | initial | A refresh-once drops keyboard focus from a row outside the reset window |
| IR-008 | LOW | initial | The `query` prop's referential stability is load-bearing but undocumented |
| IR-009 | LOW | initial | The selection edge is 4 px, not the design's 3 px, and a selected and checked row loses the selection fill |
| IR-010 | LOW | initial | `Space` on a focused row is not prevented, so a browser scrolls the container |

### IR-001 — The match count is not announced after a sort (DAC-E4-S6-2), and the test passes only because its fixture changes the count

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S6-2, AC-16
- **Tasks**: T003, T011
- **Files**: `web/src/screens/research/results-table.tsx:422` (`setAnnouncement(matchLabelRef.current(page.matchCount))`), `:634-636` (`<output aria-live="polite" className="sr-only">{announcement}</output>`); `web/src/screens/research/results-table.test.tsx:1104-1110` (`renderSorted`, `matchCount: 2846`), `:1238-1244` (sorted response with `matchCount: 1203`)
- **Claim challenged**: DAC-E4-S6-2 and TC-COMP-138 require that, after a sort activation, "the new match count is announced". The UX design 1.1 says "the new match count is announced politely (`data-table` contract)". Data-table §5 says "After the rows update, announce the new row count via a polite live region". The task plan's Other Notes say the region "announces the server's `matchCount` after every first page, including the first load and each refresh-once".
- **Observed evidence**: Sorting never changes `matchCount`. The sorted first page therefore calls `setAnnouncement` with the string the region already holds. React bails out, and the text node is not written. Probe P1 rendered 2846 matches, sorted with an unchanged count, and observed the region with a `MutationObserver`. Result: `before="2846 stocks match" after="2846 stocks match" mutations=0`. Probe P1b did the same across a `refreshKey` reload and recorded `mutations=0`. A polite live region announces changes only, so nothing is announced. The only test of the announcement after a sort feeds a different count (2846, then 1203), which a sort cannot produce.
- **Expected evidence/behavior**: Each first page that follows a sort or a refresh-once announces the server's match count, including when the count is unchanged. A test asserts this with an unchanged `matchCount`.
- **Impact**: A screen-reader user who activates a sort hears nothing. Focus deliberately stays on the button, and the arrow is `aria-hidden`, so the user gets no confirmation that the request ran or how many stocks it covers. The same silence follows every background refresh-once whose count is unchanged. Every host inherits this: the Research screen (E4-S9) and the Members tab (E1-S8).
- **Required remediation**: Make each first page produce a change the polite region announces, even when the count text is unchanged, and keep the text the server's `matchCount` sentence. Add a TC-COMP-138 assertion that fails when a sort with an unchanged count produces no change in the region.

### IR-002 — TC-COMP-110 never exercises "no `aria-sort`" on the unranked column

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S6-1, AC-14 (satisfied in production)
- **Tasks**: T001 (behaviour specified by T012)
- **Files**: `web/src/screens/research/results-table.tsx:236-238` (`const ariaSort = ranked ? … : undefined`); `web/src/screens/research/results-table.test.tsx:972-995`
- **Claim challenged**: T001 says "the Growth header contains no `button` (the sort control is absent) and no `aria-sort`". T012 says "an unranked factor has … no buttons and no `aria-sort`".
- **Observed evidence**: The only assertion that Growth has no `aria-sort` runs while the query sorts by `value_percentile`, so it would hold even without the `ranked` guard. Mutant `manual:review:unranked-header-keeps-aria-sort` drops the guard, so the header computes `aria-sort` from the query whatever the factor's rank. It survives. Probe P5 (query `growth_percentile asc`, Growth unranked) shows the reviewed code is correct: `aria-sort` is null on every header.
- **Expected evidence/behavior**: A TC-COMP-110 case whose query sorts by the unranked factor's percentile or score asserts that the unranked header carries no `aria-sort`.
- **Impact**: The query lives in the URL (DAC-E4-3), so a saved or shared URL can sort by a factor that is now below 30 qualifying stocks. Without the guard, the header would announce a sort direction on a column that shows no numbers and has no control. The suite would stay green.
- **Required remediation**: Add the case, so the mutant is killed. Production needs no change.

### IR-003 — T006 leaves the superseded-epoch bookkeeping unpinned: seven lifecycle mutants survive

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-11, AC-16, DAC-E4-S6-2, DAC-E4-S6-5 (satisfied in production)
- **Tasks**: T006 (behaviour specified by T011)
- **Files**: `web/src/screens/research/results-table.tsx:370-378` (unmount bump), `:399-432` (page-one effect: `setPageError(null)`, `setPagePending(false)`, both generation guards), `:434-473` (`readPage`: both generation guards), `:483-487` (`currentEpoch`); `web/src/screens/research/results-table.test.tsx:428-504`
- **Claim challenged**: T006 says "a changed `query` … discards loaded rows and cursor, reads page one, and a response for the superseded query that arrives late is ignored". It also says "bumping `refreshKey` reloads page one once with the same query". T011 says to ignore "a response whose generation is stale, on the pattern of `coverage/index.tsx` (`cancelled` flag)". That pattern cancels on cleanup, unmount included.
- **Observed evidence**: Seven mutants survive. T006's late-response test covers only a page-one read that resolves; the other branches have no test. Each probe passes on the reviewed code and fails under its mutant:

  | Mutant | Probe | Failure under the mutant |
  |--------|-------|--------------------------|
  | `later-page-then-unguarded` | L1 | A later page of the superseded query, landing after the new page one, is appended to the new rows |
  | `page-pending-kept-on-new-query` | L2 | A query change while a later page is in flight leaves `aria-busy="true"` for good and stops paging |
  | `page-error-kept-on-new-query` | L3 | A later-page error and its **Try again** survive a query change |
  | `epoch-ignores-refresh` | L4 | A `refreshKey` bump in the same batch as a later page sends the old cursor `c2` before page one |
  | `first-page-catch-unguarded` | L5 | A superseded page one that fails late replaces the new rows with the error body |
  | `later-page-catch-unguarded` | L6 | A superseded later page that fails late shows a page error under the new rows |
  | `unmount-generation-not-bumped` | L7 | A page one that lands after unmount reaches the host's `onResult` |
- **Expected evidence/behavior**: T006 tests fail for each of the seven: a late later page (resolved or rejected) of a superseded query; a late page-one rejection; a query change while a later page is in flight or has failed; the `refreshKey` analogue of the existing query-and-page-in-one-render test; and a response after unmount.
- **Impact**: These guards keep the rows, the cursor and the error state of one query or score set out of the next. The query term of `currentEpoch` was added after a real defect the coder found in cycle 2. The other six guards could be lost the same way, by a refactor, with the suite staying green. A lost guard would mix the previous set's rows into a refreshed table (DEC-0062), leave the table permanently busy, or show an error the current query never raised.
- **Required remediation**: Add the tests above, so all seven mutants are killed. Production needs no change.

### IR-004 — TC-COMP-139's "stay put at either end" is pinned for selection only; dropping the guard steals focus on a later sort

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S6-4, DAC-E4-S6-2 (satisfied in production)
- **Tasks**: T004 (behaviour specified by T013)
- **Files**: `web/src/screens/research/results-table.tsx:538-555` (`move`, guard at `:543-545`), `:380-393` (pending-focus effect); `web/src/screens/research/results-table.test.tsx:1401-1427`
- **Claim challenged**: T004 says "`ArrowUp` on the first row and `ArrowDown` on the last loaded row stay put". T013 says a selected row is focused "once rendered (a pending-focus ref consumed in an effect)". DAC-E4-S6-2 says focus does not move on a sort.
- **Observed evidence**: Mutant `manual:review:move-guard-dropped` removes `if (target === fromIndex) return;` and survives. With the guard gone, `ArrowDown` on the selected last row calls `select` for the same symbol, which returns without a state change. It still sets `pendingFocus`. Nothing re-renders, so the ref stays set, and the next render pulls focus to that row. Probe L8 selects the last row, presses `ArrowDown`, then activates a sort button. On the reviewed code focus stays on the button; under the mutant it moves to the row. The existing test checks selection and focus right after the end-of-list presses, before any later render.
- **Expected evidence/behavior**: A TC-COMP-139 test presses past either end, causes a later render (a sort or a refresh), and asserts that focus stays where the user put it.
- **Impact**: Dropping the guard looks like a harmless simplification, because the selection appears unchanged. It would make the next sort or refresh move focus into the table, violating DAC-E4-S6-2's "focus does not move", and the suite would stay green.
- **Required remediation**: Add the assertion, so the mutant is killed. Production needs no change.

### IR-005 — Spacer `aria-hidden`, the visually hidden live region and description, and the sort arrow's direction are unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S6-5, DAC-E4-S6-3, DAC-E4-S6-2 (satisfied in production)
- **Tasks**: T005, T002, T003, T006 (behaviour specified by T011, T012)
- **Files**: `web/src/screens/research/results-table.tsx:604-627` (spacer rows), `:634` (live region `sr-only`), `:646-648` (description `sr-only`), `:199-207` (`SortButton` glyph); `web/src/screens/research/results-table.test.tsx:286-306`, `:684-699`, `:1060-1074`, `:1112-1155`, `:1265-1297`
- **Claim challenged**: T011 says "the body renders `visibleWindow` rows between two `aria-hidden` spacer `tr`s" and "A polite `role="status"` `sr-only` region". T012 says each ranked header has "`aria-describedby` to a visually hidden element", and "the sort arrow is an `aria-hidden` glyph inside it". Classification-ui 2.5 and UX design 1.1 give each sortable header "the arrow and `aria-sort`", so the arrow shows the direction `aria-sort` states.
- **Observed evidence**: Five mutants survive:

  | Mutant | What it does | What the test checks |
  |--------|--------------|----------------------|
  | `top-spacer-not-hidden`, `bottom-spacer-not-hidden` | expose two empty rows to assistive technology | TC-COMP-093 checks the spacers' heights only |
  | `live-region-visible` | prints *2846 stocks match* on screen above the table | T006 checks the region's text and `aria-live` only |
  | `description-visible` | prints the incomplete-last sentence on screen above the table | TC-COMP-098 checks the `aria-describedby` target's text only |
  | `sort-arrows-swapped` | draws ▼ for ascending and ▲ for descending | TC-COMP-138 checks `aria-sort` only; T008 checks that a glyph exists |
- **Expected evidence/behavior**: Assertions that the two spacer rows are `aria-hidden`, that the live region and the description carry the visually hidden class, and that the active sort button's glyph follows `aria-sort` (ascending, descending, none).
- **Impact**: Each is a one-token regression the suite would not notice. Unhidden spacers add two unlabeled rows to a table that declares `aria-rowcount` and `aria-rowindex`. An unhidden region or description repeats the host's h1 or prints a sentence the design does not place. A reversed arrow tells a sighted user the opposite of the sort the server applied.
- **Required remediation**: Add the assertions, so the five mutants are killed. Production needs no change.

### IR-006 — *Sort by symbol* pressed during a factor sort requests descending first

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-16 (factor sorts unaffected)
- **Tasks**: T012
- **Files**: `web/src/screens/research/results-table.tsx:185-190` (`nextSort`: `sort === null || sort.key !== key` returns `{ key: "symbol", order: "desc" }`)
- **Claim challenged**: DEC-0161 (owner-upheld) derives the Symbol cycle from data-table §4, "`Enter` / `Space` on a sort control: cycles ascending → descending → unsorted", with unsorted equal to symbol ascending. T012 says "Symbol: ascending-default, descending, ascending-default".
- **Observed evidence**: Probe P2 starts from `value_percentile desc` and activates *Sort by symbol*. The request is `{"sort":"symbol","order":"desc","limit":50}`, and the Symbol header reads `aria-sort="descending"`. A column that is not the active sort begins its cycle at ascending everywhere else in the table, and under data-table §4. No test covers Symbol activation from a factor sort; the Symbol cycle test starts from the unsorted default.
- **Expected evidence/behavior**: From a factor sort, the first activation of *Sort by symbol* returns to Symbol ascending, the unsorted default with no `sort` or `order`. Alternatively, the descending-first choice is recorded in DEC-0161 for the owner. Either way, a test pins the result.
- **Impact**: An owner sorted by a factor who presses *Sort by symbol* gets Z to A. Restoring A to Z takes two more presses, and the second of those passes through no visible change.
- **Required remediation**: Change `nextSort` for this case or record the choice, and add the test.

### IR-007 — A refresh-once drops keyboard focus from a row outside the reset window

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (DAC-E4-S6-4's independence holds)
- **Tasks**: T006, T011
- **Files**: `web/src/screens/research/results-table.tsx:417-421` (`setScrollTop(0)` and the DOM `scrollTop = 0` on every first page); `web/src/screens/research/results-table.test.tsx:520-544`
- **Claim challenged**: T006 says "bumping `refreshKey` reloads page one once with the same query, keeps the rows until the response, and does not move focus". Classification-ui 2.6 and UX design 1.1 say the selected row is kept by symbol across the refresh-once.
- **Observed evidence**: Probe P4 loads 50 rows, scrolls to row 30, clicks `SYM0040` (which takes focus) and bumps `refreshKey` with the same 50 rows. After the response, `scrollTop=0`, the `SYM0040` row is not rendered, and `document.activeElement` is `BODY`. The existing test focuses a button outside the table, so it cannot see this.
- **Expected evidence/behavior**: Either a refresh-once keeps focus on a focused row that is still among the loaded rows, or the plan records that a refresh may return focus to the document, and a test pins whichever is chosen.
- **Impact**: A keyboard or screen-reader user who has arrowed below the 25th row loses focus when a background score set completes (DEC-0062). Their place is lost without any action of theirs.
- **Required remediation**: Keep focus, for example by not resetting the window on a refresh whose focused row is in page one, or record the behaviour for the owner. Pin the outcome with a test.

### IR-008 — The `query` prop's referential stability is load-bearing but undocumented

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011, T016
- **Files**: `web/src/screens/research/results-table.tsx:399-432` (effect keyed on `[query, refreshKey, attempt]`), `:301-329` (contract comment); `web/src/api/research-query.ts:156` (`decodeResearchQuery` returns a new object per call)
- **Claim challenged**: T016 says the `ResultsTable` doc comment states "the contract E4-S7, E4-S9 and E1-S8 rely on". DEC-0159 says the host holds the query in the URL.
- **Observed evidence**: Page one is re-read whenever `query` changes identity. Take a host that decodes the URL on each render and updates its own state from `onResult`, as E4-S9 does for the h1. Each response then triggers a new read. A probe with such a host (`query={{ ...DEFAULT_RESEARCH_QUERY }}`, `onResult` setting state) did not settle, and the run was stopped. The contract comment does not say the host must keep `query` stable, for example memoised on the URL's search string.
- **Expected evidence/behavior**: The contract comment states the requirement, so E4-S9 and E1-S8 meet it.
- **Impact**: This creates no defect in this story. A host that misses the requirement would issue unbounded reads.
- **Required remediation**: Add one sentence to the `ResultsTable` doc comment. Optionally, compare queries by value.

### IR-009 — The selection edge is 4 px, not the design's 3 px, and a selected and checked row loses the selection fill

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T013
- **Files**: `web/src/screens/research/results-table.tsx:57` (`CHECKED_FILL`), `:738-740` (`ROW`, `ROW_SELECTED`), `:787-788`
- **Claim challenged**: Classification-ui 2.5 specifies "`aria-selected`, 3 px inset `--status-active` edge on `--status-active-muted`", and checking as "the table's `--muted` background".
- **Observed evidence**: The edge is `border-l-4`, a 4 px border. A row that is both selected and checked carries `bg-status-active-muted` and the inline `--muted` fill, and the inline style wins. DEC-0240's amendment records this precedence and hands it to the owner. The 4 px width is recorded in DEC-0240 without reference to the design's 3 px.
- **Expected evidence/behavior**: The design's width, or a recorded reason (STD-UI-29 offers no 3 px token), and the owner's answer on precedence.
- **Impact**: Cosmetic. Selection on a checked row is still shown by the edge and `aria-selected`.
- **Required remediation**: Note the width deviation in DEC-0240, or match the design.

### IR-010 — `Space` on a focused row is not prevented, so a browser scrolls the container

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T013
- **Files**: `web/src/screens/research/results-table.tsx:760-773` (`onKeyDown` prevents default for the arrows only)
- **Claim challenged**: T013 says "`Space` on the row does nothing", and the test asserts this in jsdom (`results-table.test.tsx:1424-1426`).
- **Observed evidence**: The handler does not call `preventDefault` for `Space`. jsdom has no native scrolling, so the test cannot observe the browser's default action. In a browser, that action scrolls the focused element's scroll container by about a page, which would move the window and can unmount the focused row. This was not reproduced in a browser.
- **Expected evidence/behavior**: `Space` on a row has no effect, in a browser as well as in jsdom.
- **Impact**: A keyboard user who presses `Space` on a row, perhaps expecting it to check, may see the list jump and lose focus.
- **Required remediation**: Prevent the default action of `Space` when the event target is the row itself.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations, recorded as decisions:** DEC-0239 adds `RESULTS.columns`
  (*Symbol*, *Name*) to `copy.ts` against T009's "add no other string". DEC-0240
  paints the checked fill as an inline `hsl(var(--muted))` instead of the
  plan's `bg-muted` class, because `tailwind.config.js` maps no `muted` colour.
  Both are provisional and open, and both are written to the harness's
  `projects/factorflow-v2/decisions/`, where they are currently untracked for the
  driver to commit. The checked-state assertion reads the inline background
  instead of the class, as DEC-0240 states.
- **Implementation choices consistent with the plan:** the scroll container's
  height is `(VIEWPORT_ROWS + HEADER_ROWS) * ROW_HEIGHT_PX` with a sticky header,
  where the plan says "plus the header". `visibleWindow`'s `start` is
  additionally clamped to `end`.
- **Bookkeeping:** every task is ticked. Seven are PARTIAL here (T001-T006,
  T011). The task file's `status` stays `draft`, as in earlier E4 plans.
- **Out-of-scope changes:** none. No delivered file outside `copy.ts` and
  `copy.test.ts` changed, and nothing imports the table yet.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework against `CAP-002-E4-S6-tasks.md` and this report.
  - Fix IR-001 in production and make TC-COMP-138 assert an announcement with
    an unchanged count.
  - Add the tests that kill the fourteen non-equivalent survivors (IR-002 to
    IR-005; the mutant ids are in `CAP-002-E4-S6-implementation-review-v1-mutation.json`).
  - Resolve or record IR-006 and IR-007.
  - Then rerun this review. The next review passes this report's mutation JSON
    as `scope --previous`.
- **Warnings accepted downstream**: N/A
