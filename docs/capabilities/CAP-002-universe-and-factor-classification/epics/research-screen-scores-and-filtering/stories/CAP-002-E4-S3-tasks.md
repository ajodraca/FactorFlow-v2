---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T23:45:00Z
  source_artifacts:
    - id: CAP-002-E4-S3
      version: "1"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E4-S3 — Factor Cell and Possibly-Restated Mark Patterns

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S3.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`)
**Branch**: `usr/alvaro-de-jodra/CAP-002-E4-tasks`
**Date**: 2026-10-17

## Summary

Delivers the two shared presentation patterns every CAP-002 screen draws a factor result with, and creates the `web/src/components/patterns/` directory they live in: `factor-cell.tsx` (four renderings that are never confused: a whole-number percentile with an `aria-hidden` bar; `coverage-absent` *Incomplete* carrying the reason; `coverage-unknown` *Not enough to rank*; `status-neutral` *Not followed*) and `restated-mark.tsx` (the *Possibly restated* mark, words as the text and the glyph `aria-hidden`, DEC-0075). The cell takes one S1 `FactorCell` response value and renders it through S2's `formatPercentile`, `formatScore` and `copy.ts`, so a missing or undeterminable value is a word, a shape and a token and never `0` or a bare number, while a measured `0.00` always prints as `0.00`. No screen, table, header or request is built here; the results table (E4-S6), the inspector (E4-S7), Compare and Stock evidence import these two files.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-9 | Standardised score and percentile are displayed (display side): a scored cell shows a whole-number percentile and bar, and optionally the signed standardised score | T002, T006, T011 |
| AC-12 | No score or percentile unless every input is present and current; the cell shows *Incomplete* with the missing or outdated input named | T001, T004, T007, T011 |
| AC-14 | A factor below 30 qualifying stocks shows *Not enough to rank* in the cell, never a score | T001, T005, T008, T011 |
| DAC-E4-1 | Scored cell: whole-number percentile and bar; incomplete: *Incomplete* naming the input; under 30: *Not enough to rank* in every cell (the count in the column header belongs to the table, E4-S6) | T001, T005, T006, T007, T008, T011 |
| DAC-E4-S3-1 | An unscored factor never shows `0` or a bare number, only the word, shape and token of its state | T001, T007, T008, T009, T011 |
| DAC-E4-S3-2 | A measured `0.00` standardised score renders as `0.00` | T002, T006, T011 |
| DAC-E4-S3-3 | The mark's accessible name and text are *Possibly restated* on value and growth, never on momentum | T003, T004, T010, T011 |
| DAC-E4-S3-4 | Every status has a word plus a shape or pattern; no polarity colour carries a value | T005, T011 |

Mapped test cases (all from `tests/component/classification-ui-tests.md`, confirmed in `tests/coverage-matrix.md` lines 212-215): TC-COMP-073 (DAC-E4-S3-1), TC-COMP-074 (DAC-E4-S3-2), TC-COMP-097 (DAC-E4-S3-3), TC-COMP-109 (DAC-E4-S3-4). No other component TC traces to a DAC-E4-S3-* criterion; TC-COMP-098, TC-COMP-099 and TC-COMP-110 render the same cell but trace to E4-S6 (the table, its footnote and its header count). Each of the four spec bodies is the single generic line "Rendered" with no steps; the plan below sharpens each into concrete assertions from the AC and the design sections cited (Phase 2). The design's own test table (classification-ui section 7, rows *Four cell renderings never confused* and *The mark's accessible name*) names the two test files the story names.

## Phase 1: Setup

Skipped. No dependency, configuration or existing file changes. `web/src/components/` does not exist (the delivered screens keep their cells and badges beside them, for example `web/src/screens/coverage/badges.tsx`); `web/src/components/patterns/` is created by the first file written into it (T001). vitest (`root: web`, `jsdom`, `globals`, jest-dom through `web/src/test-setup.ts`), biome, `tsc` and Tailwind (`content` globs `web/src/**/*.{ts,tsx}`) already cover the new directory. Types (`FactorCell`, `FactorName`, `ReasonCode`) come from `web/src/api/classification-types.ts` (CAP-002-E4-S1, hard dependency) and the formatters and strings from `web/src/screens/research/format.ts` and `copy.ts` (CAP-002-E4-S2, hard dependency). Neither is on the branch yet; read the shipped files before T009 and use their exact export names. This plan names the S1 and S2 symbols the design fixes (`FactorCell`, `FactorName`, `formatPercentile`, `formatScore`) and leaves every `copy.ts` export name to the shipped file.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define each rendering from the acceptance criteria. Two test files, `web/src/components/patterns/factor-cell.test.tsx` and `web/src/components/patterns/restated-mark.test.tsx` (the paths the story names; neither exists). Follow `web/src/screens/coverage/badges.test.tsx`: the `data-variant` attribute names the badge variant, a `label()` helper reads the visible words by dropping `aria-hidden` descendants, and a `signature()` helper reads word plus shape. Each mandatory test carries a traceability comment (`// Implements TC-COMP-073`). Fixtures are plain `FactorCell` objects written from classification-api section 2.7 (`status`, `score`, `percentile`, `reasonCode`, `reasonInput`, `reasonDetail`, `restatedPossible`); a small local builder fills the unused fields with `null` and `false`. No network, no fake timers. The component under test is `FactorCell` (the pattern, `factor-cell.tsx`) and its props are `{ cell, factor, showScore?, notFollowedSince? }` (Open Gap 1, DEC-0150); to avoid the clash with S1's type of the same name, import the type as `FactorCell as FactorCellData` in the pattern and its tests.

### Mandatory Component Tests

- [ ] T001 [P] Implement TC-COMP-073 (Unscored factor never shows 0 or bare number) in `web/src/components/patterns/factor-cell.test.tsx`, a `describe.each` over every unscored state: `not_classified` with `reasonCode` `input_missing`, `input_outdated` and `input_not_computable` (each with and without `reasonDetail`); `not_classified` with `not_enough_stocks`; `not_classified` with `retired`; and the defensive case `status: "classified"` with `percentile: null` (Open Gap 2). For each: the cell's whole text content (including hidden text) contains no digit and no `0`, `NaN`, `null`, `undefined` or `-`/`+` sign, the bar is absent, and the visible text is exactly the state's word (`Incomplete`, `Not enough to rank`, `Not followed`) with its `data-variant` (`coverage-absent`, `coverage-unknown`, `status-neutral`) and a shape element (`aria-hidden` icon or glyph). Expected: an `Incomplete` cell with `score: "0.0000000000"` and `percentile: "0.0000000000"` still shows only *Incomplete*: the numbers an unscored cell carries are never read
- [ ] T002 [P] Implement TC-COMP-074 (Measured 0.00 score renders as 0.00) in `web/src/components/patterns/factor-cell.test.tsx`: a `classified` cell with `score: "0.0000000000"` and `percentile: "50.0000000000"` rendered with `showScore` shows the text `0.00` (unsigned, exactly as `formatScore` prints it, never `+0.00`, `-0.00`, `0`, empty or *Incomplete*) beside the percentile `50`; the same score with `showScore` omitted renders the percentile only (the list rendering, classification-ui section 2.5: the standardised score never appears in the list); a measured percentile of `"0.0000000000"` renders `0` with an empty bar, as a scored cell and not as *Incomplete* (a rank of zero is a measurement: truthiness is never the test); `score: "1.2700000000"` renders `+1.27` and `"-0.4500000000"` renders `-0.45` through `formatScore`, so the cell never formats on its own
- [ ] T003 [P] Implement TC-COMP-097 (Possibly restated mark on value and growth only), mark half, in `web/src/components/patterns/restated-mark.test.tsx`: `<RestatedMark factor="value" />` and `factor="growth"` render an element whose visible-to-assistive-technology text is exactly `Possibly restated` (the text content with `aria-hidden` descendants dropped), whose `R` glyph is a separate `aria-hidden` element, whose text carries the `sr-only` class (visually hidden, DEC-0075), and whose classes carry the `status-neutral` tokens (`bg-status-neutral-muted`, `text-status-neutral`); `factor="momentum"` renders nothing (`container` is empty). It is not a `badge`, has no `role`, no `aria-label` and no `title` (an accessible-name override is the thing DEC-0075 avoids), and is not focusable
- [ ] T004 [P] Implement TC-COMP-097 (Possibly restated mark on value and growth only), cell half, in `web/src/components/patterns/factor-cell.test.tsx`: a `classified` cell with `restatedPossible: true` for `factor="value"` and `"growth"` shows the percentile and then the mark, in that DOM order (the mark follows the number, classification-ui section 2.5), exactly one mark; `factor="momentum"` with `restatedPossible: true` renders the percentile and no mark; `restatedPossible: false` renders none; an Incomplete, Not enough to rank or Not followed cell with `restatedPossible: true` renders no mark (the mark rides a percentile, UX design 1.1, and those cells have none); the explanation sentence is never in the cell (the inspector and evidence carry it)
- [ ] T005 [P] Implement TC-COMP-109 (Every status has a word plus shape; polarity colour carries no value) in `web/src/components/patterns/factor-cell.test.tsx`: render the four states (scored, Incomplete, Not enough to rank, Not followed) and assert for each that the visible words are non-empty and that a shape is present (the bar for scored, an `aria-hidden` icon or glyph for the three badges); that the four `signature()` strings (word plus shape) are pairwise distinct, so the states survive greyscale (STD-UI-8); that only Not enough to rank carries `bg-pattern-indeterminate` and Incomplete never does, so *Not enough to rank* cannot read as a milder *Incomplete* (STD-UI-14; the badge specification, section 2); and that no element in any rendering carries a class containing `gain`, `loss`, `factor-` or `neutral-value` (no polarity or factor-identity colour carries a value, DEC-0060, STD-UI-7). Each badge uses the tokens of the UX design Token Usage table: `value-missing` on `value-missing-muted` (Incomplete), `value-indeterminate` on `value-indeterminate-muted` (Not enough to rank), `status-neutral` on `status-neutral-muted` (Not followed)

### Additional Unit Tests

- [ ] T006 [P] Scored-cell rendering in `web/src/components/patterns/factor-cell.test.tsx` (AC-9, DAC-E4-1; Open Gap 1): the percentile text is `formatPercentile`'s output (`"87.5000000000"` prints `88`, `"99.5000000000"` prints `100`, `"84.0000000000"` prints `84`, no sign and no `%`); the bar element is `aria-hidden="true"`, is absent from the accessible text (the cell's assistive-technology text is the number alone, STD-UI accessibility in UX design 1.1: "Factor bars are `aria-hidden`; the percentile is the text"), and its fill width equals the printed whole number (`88%` for `87.5`, `100%` for `99.5`, `0%` for `0`, never above 100 or below 0); the number carries `font-numeric` and the bar the `--seq-4` fill on `--seq-1` track as inline styles (Open Gap 4); with `showScore` the score follows the percentile in `text-muted-foreground`, and a `classified` cell with `score: null` and `showScore` prints no score text at all rather than `0.00`; `data-variant` of the scored cell is absent (it is not a badge); the cell root is an inline element valid inside a `<td>`
- [ ] T007 [P] Incomplete-cell reason in `web/src/components/patterns/factor-cell.test.tsx` (AC-12, DAC-E4-1, DAC-E4-S3-1; Open Gap 2): for each of the three reason codes the badge's `title` attribute is the sentence `copy.ts` builds from `reasonDetail` and the factor, for example `Incomplete: operating cash flow missing, so value can't be compared fairly. It isn't guessed.` for `reasonDetail: "operating cash flow missing"`, `factor="value"` and `Incomplete: fundamentals outdated: latest period ended 2026-03-31, so growth can't be compared fairly. It isn't guessed.` for an outdated growth input; with `reasonDetail: null` the `title` is the code-selected generic sentence (an input is missing, outdated, couldn't be computed) and still names the factor; `reasonInput` (use `"revenue_growth"`) never appears in the rendered text, any attribute or the `title` (STD-UI-1, no payload key); the visible text stays the single word `Incomplete`; the `title` sentence contains no digit other than a date taken from `reasonDetail`, and contains none of the words `instrument`, `error`, `null`; the sentence is not rendered as visible text (it is the badge's `title`, so it is not repeated across 3000 rows; the inspector carries it in full)
- [ ] T008 [P] State selection and the Not followed and Not enough to rank cells in `web/src/components/patterns/factor-cell.test.tsx` (AC-14, DAC-E4-1, DAC-E4-S3-1; Open Gap 3): the state is chosen by `reasonCode` first, then `status`: `retired` is *Not followed* even if `percentile` is present, `not_enough_stocks` is *Not enough to rank*, a `classified` cell with a percentile is scored, and every other `not_classified` cell, including an unknown or null `reasonCode`, is *Incomplete* (never a number); *Not followed* has `title` `Not followed. Earlier scores stand.` with no date when `notFollowedSince` is omitted, and `Not followed since 2026-09-30. Earlier scores stand.` when `notFollowedSince="2026-09-30"`, the date printed as given (`formatDate`, never through `Date`); *Not enough to rank* carries no count and no `title` (the *{n} qualified, 30 needed* line is the column header's, E4-S6, so a screen reader hears it once, not once per cell); every cell in a column of 3000 identical Not-enough-to-rank cells renders the same word (a `render` of 50 cells in one array is enough here)

**Checkpoint**: All tests written and failing (`./factor-cell` and `./restated-mark` do not exist). No production code yet.

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with two new components and no edit to any delivered file; `copy.ts` is touched only if S2 shipped without a string the cell needs (T009).

- [ ] T009 Reconcile the cell's strings with S2's shipped `web/src/screens/research/copy.ts` and `format.ts` (depends on CAP-002-E4-S1 and CAP-002-E4-S2 being on the branch). Read both files and use their exports for: the words *Incomplete*, *Not enough to rank*, *Not followed*, *Possibly restated*; the Incomplete reason sentence (S2's T012 harvests "*Incomplete* with the reason sentences of section 1.1"); the Not followed tooltip (S2's T012 harvests *Not followed since {date}. Earlier scores stand.*). Where a needed string is absent or takes arguments this plan does not fit (the Incomplete sentence taking `reasonDetail`, the factor name and `reasonCode`; its generic fallback by code; the dateless Not followed sentence of Open Gap 3), add it to `copy.ts` with a doc comment naming the design section it comes from and DEC-0151 or DEC-0152, exactly as S2's Open Gap 6 directs, and extend `copy.test.ts` anchors for it so TC-COMP-072's scan (no *instrument*, *acquisition run*, *not classified*, bare *score*) still passes over it. Add no other string. If S2's names differ from the ones the T001-T008 tests import, the shipped names govern and the tests follow them in the same cycle. Makes the string assertions of T007 and T008 satisfiable
- [ ] T010 Create `web/src/components/patterns/restated-mark.tsx` (DEC-0075, STD-UI-17; depends on T003 existing; no other import than React and `FactorName`): export `RestatedMark({ factor }: { factor: FactorName })`, returning `null` when `factor === "momentum"` and otherwise one inline `span` with the `status-neutral` tokens (`bg-status-neutral-muted text-status-neutral`, `rounded`, `text-xs`, the delivered badge size classes `px-2 py-1` or the compact equivalent) containing the words from `copy.ts` in a child with `className="sr-only"` and the glyph `R` in a child with `aria-hidden="true"`. No `role`, `aria-label` or `title`; no `badge` component exists or is used. Doc comment naming DEC-0075, DEC-0150 and why the momentum guard lives here. Makes T003 pass
- [ ] T011 Create `web/src/components/patterns/factor-cell.tsx` (depends on T010, T009 and S1/S2): export `FactorCell({ cell, factor, showScore = false, notFollowedSince = null })`, with `cell` typed by S1's `FactorCell` response type (imported under an alias). One pure function, no state, no effect, no fetch, no `dangerouslySetInnerHTML`. Selection order per Open Gap 3: `reasonCode === "retired"`, then `"not_enough_stocks"`, then `status === "classified"` with a non-null `percentile`, else Incomplete. Scored: a `span` holding the `formatPercentile(cell.percentile)` text in `font-numeric` weight 600 (a fixed box, `--font-numeric`, right-aligned), then the `aria-hidden` 52-unit bar whose fill is the whole-number percentile as inline `width` over an inline `--seq-1` track and `--seq-4` fill (Open Gap 4), then `RestatedMark` when `cell.restatedPossible` (it guards momentum itself), then, only when `showScore` and `cell.score !== null`, the `formatScore(cell.score)` text in `text-muted-foreground`. The three badges are inline `span`s with `data-variant`, the shared size classes of `coverage/badges.tsx` (`inline-flex items-center gap-1 rounded px-2 py-1 text-xs`) and a local `aria-hidden` icon each: Incomplete `coverage-absent` (`bg-value-missing-muted text-value-missing`, em dash glyph, `title` from the copy sentence; `reasonInput` never read), Not enough to rank `coverage-unknown` (`bg-value-indeterminate-muted bg-pattern-indeterminate text-value-indeterminate`, question icon, no `title`), Not followed `status-neutral` (`bg-status-neutral-muted text-status-neutral`, a dash-in-circle icon, `title` from the copy sentence with `notFollowedSince` when given). Copy the icon and size idiom of `web/src/screens/coverage/badges.tsx` rather than importing it (it is CAP-001's and unexported for this use); edit no delivered file. Doc comments on the export name the design section (classification-ui 2.5), DAC-E4-S3-1 to DAC-E4-S3-4 and DEC-0150 to DEC-0152. Makes T001, T002, T004 to T008 pass

**Checkpoint**: Every test in the two files passes; `npx tsc --noEmit` is clean; `git diff --name-status` shows only the new files (plus `copy.ts` and `copy.test.ts` if T009 added strings).

---

## Phase 4: Integration

**Purpose**: Show the two patterns sit beside the delivered code without changing it.

- [ ] T012 Confirm the delivered surface is unchanged (depends on T009 to T011): run the whole existing web suite (`client.*.test.ts`, `render.test.tsx`, the shell and routes tests, the screen tests, and S1 and S2's tests) without editing any of them; `git diff --stat` shows only `web/src/components/patterns/factor-cell.tsx`, `factor-cell.test.tsx`, `restated-mark.tsx`, `restated-mark.test.tsx`, `copy.ts` and `copy.test.ts` (only if T009 added strings), this story's `-tasks.md`, `-tdd-evidence.yaml` and the story's `status:` line; `dependencies.yaml` does not change. Nothing imports the two files yet (the first importers are CAP-002-E4-S6, the results table; CAP-002-E4-S7, the inspector; CAP-002-E1-S8; and CAP-002-E5-S1 and S3, Compare and Stock evidence). Confirm `web/src/api/render.test.tsx` still finds no `dangerouslySetInnerHTML`

**Checkpoint**: Only the new pattern files, any `copy` additions and the status line differ from `HEAD`; every delivered test is green.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T013 Run `npm run format` (a check; `biome format .` does not write), fix any report by running `npx biome format --write` on the touched files only, then `npm run lint`, `npx tsc --noEmit`, `npm run test` and `npm run build`. Confirm the built CSS contains the classes the two components use (`bg-pattern-indeterminate`, `bg-value-missing-muted`, `bg-value-indeterminate-muted`, `bg-status-neutral-muted`, `sr-only`) by building and searching `dist` for one of each, because Tailwind drops a class it cannot see as a literal; write each class as a full literal string, never assembled. No behaviour change
- [ ] T014 After each TDD cycle in T001-T013 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E4-S3-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC). The two cycles are listed in Other Notes

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E4-S1 | hard | `factor-cell.tsx` imports the `FactorCell` response type, `FactorName` and `ReasonCode` from `web/src/api/classification-types.ts`, which S1 creates; existing graph edge `CAP-002-E4-S3: [CAP-002-E4-S1, CAP-002-E4-S2]` |
| CAP-002-E4-S2 | hard | `factor-cell.tsx` imports `formatPercentile`, `formatScore` and `formatDate` from `web/src/screens/research/format.ts` and the cell strings from `copy.ts`, both created by S2; same graph edge |
| CAP-002-E4-S6 | reverse | The results table renders one `FactorCell` per factor per row; graph edge `CAP-002-E4-S6: [CAP-002-E4-S2, CAP-002-E4-S3]` |
| CAP-002-E4-S7 | reverse | The inspector renders the cell with `showScore` and the mark; graph edge `CAP-002-E4-S7: [CAP-002-E4-S2, CAP-002-E4-S3]` |
| CAP-002-E1-S8 | reverse | The universe detail Members tab composes the results table; graph edge lists S3 |
| CAP-002-E5-S1 | reverse | Compare reads the cell and the mark; graph edge lists S3 |

No new hard edge was found; `dependencies.yaml` already lists `CAP-002-E4-S3: [CAP-002-E4-S1, CAP-002-E4-S2]` and needs no change.

### Task Dependencies

- T001 to T008: no dependencies (two files, written as two TDD cycles)
- T009: depends on S1 and S2 existing on the branch; precedes T011
- T010: depends on T003 existing (RED first)
- T011: depends on T001, T002, T004 to T008 existing, on T010 and on T009
- T012: depends on T009-T011
- T013: depends on T012
- T014: interleaved, runs after every TDD cycle and before the next begins

### Parallel Opportunities

- Phase 2: T001 to T008 write two files; `restated-mark.test.tsx` (T003) and `factor-cell.test.tsx` (T001, T002, T004 to T008) can be assigned to two agents
- Phase 3: T010 is independent of T009; T011 follows both

---

## Validation Plan

### Constitution-Defined Commands
- Build: `npm run build`
- Test: `npm run test` (single file while iterating: `npx vitest run web/src/components/patterns/factor-cell.test.tsx`)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit` (named in the story's Technical Details; not in the tech-stack table)

Working directory is the repository root `repos/factorflow-v2/FactorFlow-v2`. The tech-stack file's Validation Commands table lists `npm run build`, `npm run test`, `npm run test:e2e`; lint and format come from `package.json` (`biome lint .`, `biome format .`) and the story. `npm run test:e2e` is not run (no screen exists).

### Story-Specific Validation
- DAC-E4-S3-1: the T001 table passes for every unscored state, including numbers carried by an Incomplete cell, and the cell text holds no digit
- DAC-E4-S3-2: the T002 assertions print `0.00` for a measured zero score and `0` for a measured zero percentile, neither as *Incomplete*
- DAC-E4-S3-3: the T003 and T004 assertions show the mark's words as its text with the glyph `aria-hidden`, on value and growth, and absent on momentum
- DAC-E4-S3-4: the T005 signatures are four distinct word-plus-shape pairs, the hatch is on *Not enough to rank* only, and no polarity class appears
- DAC-E4-1: the T001, T006, T007 and T008 assertions give the percentile and bar, *Incomplete* naming the input, and *Not enough to rank* without a count in the cell
- Delivered surface: `git diff --stat` shows no modified delivered file

---

## Notes

### Resolved Conflicts

1. **The AC prints a measured `0.00` score in the cell; the design says the score never appears in the list.** DAC-E4-S3-2 and TC-COMP-074 require a measured `0.00` standardised score to render as `0.00` when the cell is rendered, and the story is one shared cell for Research, universe members, Compare and Stock evidence. Classification-ui section 2.5 says the standardised score never appears in the list (inspector and evidence only) and, two paragraphs later, that "a measured `0.00` renders as such in the inspector and evidence". Governing rule: the story's acceptance criteria outrank design prose, and the design's own sentence shows the two statements describe different surfaces. Resolved by an additive, defaulted `showScore` prop (false for the list). The prop is a shape no artifact fixes and is recorded as Open Gap 1 (DEC-0150). No source edit is required.
2. **The column-header count is not the cell's.** DAC-E4-1 says the count is "stated once in the header" and the cell says only *Not enough to rank*; TC-COMP-110 (header count and no sort) traces to E4-S6. The cell therefore renders no count and no `title` for that state. Established by DAC-E4-1 and classification-ui section 2.5; no gap.
3. **The story names `ux-design.md` section 3 as a source.** That section is *Component-Spec Gaps* and holds only the composition note (the mark and the cell are compositions built once in `patterns/`, DEC-0075). The rendering rules are in classification-ui section 2.5 and UX design 1.1. Not a conflict; the story's source line should cite section 1.1 at its next revision.
4. **Minus sign.** `formatScore` is S2's, and S2's Resolved Conflict 2 settles `-0.45` with an ASCII hyphen-minus (story AC) against the design's U+2212. The cell prints whatever `formatScore` returns, so T002 asserts `-0.45` through the formatter and this story makes no second choice.
5. **The sibling S2 plan mislabels this story.** The S2 plan's dependency table describes S3 as "the threshold sentence and Filters pane" importing `ResearchQuery`. CAP-002-E4-S3 is the factor cell and the restated mark and imports no `ResearchQuery`. The edge S3 depends on S2 stands for the real reason (S2's formatters and copy). S2's plan is not edited here; correct the row at its next revision.

### Open Gaps

1. **Factor-cell props, the `showScore` rendering and the momentum guard. PROVISIONAL — awaiting owner confirmation (2026-10-17). Recorded as DEC-0150.** No artifact fixes the component's props or says how the list cell and the detail cell differ. Adopted: `FactorCell({ cell, factor, showScore = false, notFollowedSince = null })` and `RestatedMark({ factor })`, the mark returning nothing for momentum. Derivation in the record. Follow-up: classification-ui section 2.5 should state the props at its next revision.
2. **The Incomplete reason tooltip and its sentence. PROVISIONAL — awaiting owner confirmation (2026-10-17). Recorded as DEC-0151.** The design says *tooltip* but the design system has no tooltip component, and the cell carries only `reasonCode`, a payload-key `reasonInput` and the engine's owner-facing `reasonDetail`. Adopted: the badge's native `title`, the sentence `Incomplete: {reasonDetail}, so {factor} can't be compared fairly. It isn't guessed.`, a generic clause by `reasonCode` when `reasonDetail` is null, and a classified cell with a null percentile rendered as Incomplete. Follow-up: UX design 1.1 should name the tooltip mechanism, and the factor-engine design should say whether `reasonDetail` is always set on an incomplete cell.
3. **The date in *Not followed since {date}*. PROVISIONAL — awaiting owner confirmation (2026-10-17). Recorded as DEC-0152.** No read carries the date a stock stopped being followed. Adopted: an optional `notFollowedSince` prop, and the sentence *Not followed. Earlier scores stand.* when it is absent, which is every current read. Follow-up: classification-api section 2.7 needs the datum before the full sentence can render; until then the design sentence is not reachable.
4. **The bar's token mechanism (not a product decision).** `tailwind.config.js` maps `value-missing`, `value-indeterminate`, `status-neutral`, `pattern-indeterminate`, `font-numeric` and the rest, but no `--seq-*` colour, and the bar needs `--seq-4` on `--seq-1` (UX design Token Usage). The width of a bar is data and must be inline in any case, so the fill and track are set as inline `style` with `hsl(var(--seq-4))` and `hsl(var(--seq-1))`, which introduces no literal (STD-UI-29) and does not edit the delivered config. Follow-up: add the `seq` colours to `tailwind.config.js` in a shell or design-system change if more consumers appear.
5. **Names of S1 and S2 exports.** Both stories are planned but not coded. Names this plan relies on are those the designs fix (`FactorCell`, `FactorName`, `ReasonCode`, `formatPercentile`, `formatScore`, `formatDate`). Every `copy.ts` export name is read from the shipped file at T009; T009 adds a missing string under S2's Open Gap 6 rather than inventing a second catalogue.

### Other Notes

- **Cycle plan for T014.** Two TDD cycles, each RED then GREEN, each reviewed before the next: (1) T003 then T010 (`restated-mark.tsx`); (2) T001, T002, T004 to T008 then T009 and T011 (`factor-cell.tsx`, plus any `copy.ts` strings). Cycle 2 is the larger diff; split it at T009 (strings) if the review needs a smaller change set, since the T009 strings have their own `copy.test.ts` anchors.
- **Code order.** S3 is coded after S1 and S2 (hard dependencies). The tests import types only from S1, so vitest would run without it, but `npx tsc --noEmit` and the string assertions need both.
- **Story status.** The story's `status` moves from `todo` to `planning` in this change, as the S1 plan did (commit `c450470`); no other story line is touched.
- **No screen, header or request is built.** The table, its sort controls and the column header count are E4-S6; the inspector's explanation box and the sentence that explains the mark are E4-S7. This story ships the cell and the mark.
- **Risk.** The largest risk is the `copy.ts` surface: S2's catalogue may shape the Incomplete sentence differently from T007's expected string. T009 reconciles it in one place and the shipped catalogue governs wording, with T007 pinning the cell's use of it (`reasonDetail` verbatim, factor named, `reasonInput` never shown).
