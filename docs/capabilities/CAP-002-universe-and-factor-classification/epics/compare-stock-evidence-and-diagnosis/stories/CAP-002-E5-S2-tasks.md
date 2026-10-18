---
artifact_schema_version: 1
artifact_id: CAP-002-E5-S2-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-18
updated: 2026-10-18
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-18T01:10:00Z
  source_artifacts:
    - id: CAP-002-E5-S2
      version: "1"
    - id: CAP-002-component-design-classification-ui
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E5-S2 — Stock History Tab: Earlier Scores as Recorded

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S2.md`
**Component**: `FactorFlow-v2` (web frontend, `web/src`)
**Branch**: `usr/alvaro-de-jodra/CAP-002-E5-tasks`
**Date**: 2026-10-18

## Summary

Builds `web/src/screens/research/stocks/history-tab.tsx`, the Earlier scores panel of the Stock evidence screen: one stock's classifications in earlier sets, newest first, each row one set's result exactly as the history read returned it, with the *Possibly restated* mark on every percentile whose cell carries `restatedPossible` and the sentence *Each row is what was known when that set was produced. Later data does not change it.* stated once above the table. A stock with no earlier sets reads *No earlier scores for {SYMBOL}.*, which is visibly different from the never-scored statement; a retired stock keeps its rows. The component only fetches, orders as received and renders: nothing is recomputed or re-dated in the browser. It consumes the fetch layer (E4-S1), formatting and copy (E4-S2) and the factor cell and restated mark (E4-S3), none of which has landed in `web/src`; they are upstream dependencies, not deliverables of this plan. Mounting the tab inside the evidence screen belongs to CAP-002-E5-S3.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-15 / DAC-E5-3 / DAC-E5-S2-3 | Retired stock's earlier classifications stay visible | T003, T008, T009 |
| AC-18 / AC-19 / DAC-E5-4 / DAC-E5-S2-1 | Rows newest first, as recorded, none recomputed or re-dated | T003, T005, T006, T008, T009 |
| DAC-E5-S2-2 | Empty history reads *No earlier scores*, distinct from never scored | T003, T007, T008 |
| AC-23 / DAC-E5-5 / DAC-E5-S2-4 | Mark on the row where it applied, retained on older rows; sentence once | T003, T004, T008, T009 |

Mandatory component test cases: TC-COMP-154 (DAC-E5-S2-1), TC-COMP-155 (DAC-E5-S2-2), TC-COMP-115 (DAC-E5-S2-3), TC-COMP-191 (DAC-E5-S2-4). Other TCs touching the same capability ACs belong to other stories by their `Traces to:` lines: TC-COMP-150 to 153 (E3 history read), TC-COMP-116 (E5-S3 evidence screen, retired), TC-COMP-192 (E5-S3, once-per-screen sentences). `tests/e2e/fix-insufficient-evidence.spec.ts` (flow 5, the earlier result under Earlier scores) is a test-design artifact, not written here.

## Phase 1: Setup

**Purpose**: Confirm upstream modules exist, pin the names this story imports, and place the tab's strings where strings live.

- [ ] T001 Gate on upstream deliverables. List `web/src/api/classification-client.ts`, `web/src/api/classification-types.ts`, `web/src/screens/research/format.ts`, `web/src/screens/research/copy.ts`, `web/src/components/patterns/factor-cell.tsx` and `web/src/components/patterns/restated-mark.tsx` and read their exports. If any is absent, STOP and report the missing hard dependency (CAP-002-E4-S1, E4-S2, E4-S3) instead of recreating it. Record in the Notes of this file the exact exported names used for: the stock history read (`GET /api/classifications/stocks/{symbol}/history`, params `limit`, `cursor`) and its response and row types (wire: `symbol`, `sets[] {set_id, classification_date, run_id, run_outcome, ended_at, factors {value, growth, momentum}}`, `next_cursor`); the `FactorCell` type; `formatTimestamp`; the `FactorCell` component props. If the client omits the history read, STOP and report it as an E4-S1 gap; do not add it here (DEC-0178).
- [ ] T002 Add each string absent from `web/src/screens/research/copy.ts` (check first, add only what is missing): *Each row is what was known when that set was produced. Later data does not change it.*, *No earlier scores for {SYMBOL}.*, *Earlier scores for {SYMBOL}* (table label), column headings *Scores date*, *Produced*, *Value*, *Growth*, *Momentum*, the outcome words *Complete* and *Partial*, *Show more*, and the STD-UI-17 sentence *Possibly restated: the financials behind this score were downloaded for a period that had already been reported before FactorFlow began following this stock, so they may reflect later restatements.* (use E4-S2's copy if it already holds it). The error sentence for the history read comes from the existing per-code map in `copy.ts`; add a code entry only if one is missing. Display labels only: no string may contain *instrument*, *acquisition run*, *not classified*, *retire* or a bare *score* where percentile or standardised score is meant (the delivered `copy.test.ts` scan must still pass).

**Checkpoint**: The six upstream files exist and their names are recorded; `copy.ts` holds every string above; `copy.test.ts` still passes.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests from the acceptance criteria. Double the classification client with `vi.mock` of `../../../api/classification-client`, as the delivered screen tests mock `client`.

### Mandatory Component Tests

- [ ] T003 [P] Implement TC-COMP-154 (Earlier scores tab lists results newest first, not recomputed), TC-COMP-155 (No earlier scores shown distinct from never scored), TC-COMP-115 (Retired stock's earlier classifications remain visible) and TC-COMP-191 (Restatement mark on history rows retained for older rows) in `web/src/screens/research/stocks/history-tab.test.tsx`, each with `// Implements TC-COMP-nnn`. The spec steps are one-line boilerplate; the story's ACs are the source of truth. TC-154: the double returns three sets in the order received (dates 2026-10-15, 2026-10-01, 2026-09-15) with distinct percentiles and scores; assert the body rows read in that order, each Scores date is the wire string unchanged, each percentile and standardised score is the rendered form of the row's own stored value (not any other row's, not a recomputation), and the sentence *Each row is what was known when that set was produced. Later data does not change it.* occurs exactly once. Also feed rows whose order differs from their dates to assert the component does not re-sort (the server order is the contract). TC-155: the double returns `sets: []`; assert *No earlier scores for AAPL.*, no table body rows, and that neither *has no score yet* nor *no stocks have been scored* (the never-scored sentence) appears. TC-115: the history double returns two sets for a symbol whose evidence is `lifecycle: "retired"` (the tab is given only the symbol, so assert on the rows); assert both rows render with their percentiles, no *Not followed* badge replaces a recorded cell, and no empty state shows. TC-191: three rows, the middle and oldest cells carry `restatedPossible: true` on value or growth and the newest does not; assert the mark (accessible text *Possibly restated*) is on exactly those older rows' percentiles and absent from the newest row, and that a refetch or a render of the newest row never adds or removes it from an older row.

### Additional Unit Tests

- [ ] T004 [P] Restated mark and sentence in `web/src/screens/research/stocks/history-tab.test.tsx` (AC-23, DEC-0075, DEC-0180): the STD-UI-17 sentence occurs exactly once when any row carries a mark and not at all when none does, and it precedes the table in DOM order (above the table, beside the history sentence); the mark never renders on the momentum column even if the wire sets `restatedPossible` there (DAC-E4-S3-3 is E4-S3's rule, assert the tab passes the cell through to `factor-cell.tsx`).
- [ ] T005 [P] Row content in `web/src/screens/research/stocks/history-tab.test.tsx` (DEC-0063, DEC-0179): a native `<table>` labelled *Earlier scores for {SYMBOL}*; column headers `<th scope="col">` Scores date, Produced, Value, Growth, Momentum; each row's Scores date is `<th scope="row">`; Produced is `ended_at` through `formatTimestamp` (America/Chicago with zone); the run outcome renders as *Complete* (`status-good`) or *Partial* (`status-warning`) badge; no `run_id`, UUID or `#` number appears and there is no download link (DEC-0083, DEC-0179); each factor cell renders through `FactorCell` with the standardised score in `--muted-foreground` beneath the percentile and an em dash in `--value-missing` when the cell is `not_classified`; an *Incomplete* recorded cell stays *Incomplete* (a recorded result is not rewritten); no row has a checkbox or action (data-table `history` variant); no `--gain` or `--loss` class on a value (DEC-0060).
- [ ] T006 [P] Fetch and paging in `web/src/screens/research/stocks/history-tab.test.tsx` (DEC-0178): on mount exactly one history read for the symbol is issued with no cursor; `nextCursor` non-null shows a secondary **Show more** button which, when activated, issues one read with that cursor and appends the rows after the existing ones (existing rows untouched, order kept); the button is absent when `nextCursor` is null; a second read in flight disables it (`aria-disabled`, focusable); rerender with the same symbol issues no new read; a changed symbol resets the rows and reads once.
- [ ] T007 [P] States in `web/src/screens/research/stocks/history-tab.test.tsx`: loading renders a skeleton table matching the final columns; an `ApiError` (`instrument_not_found` and any other code) renders the error state in the panel (operation, resource, reason from `copy.ts` by `code`, never `message`) with **Try again** that reissues the read; `ApiUnreachableError` renders the shell's unreachable state; a failed **Show more** keeps the loaded rows and shows the error beneath them.

**Checkpoint**: All tests written and failing (no production code yet). Each mandatory test carries its `Implements TC-COMP-nnn` comment.

---

## Phase 3: Core Implementation

**Purpose**: The history panel, presentational over the delivered factor cell.

- [ ] T008 Create `web/src/screens/research/stocks/history-tab.tsx` with `export default function HistoryTab({ symbol }: { symbol: string }): JSX.Element` (default export, following the delivered screens; DEC-0178; satisfies T003 to T007). Read the first page of the history on mount (the tab is mounted on first activation by E5-S3 and stays mounted) through the client function recorded in T001, in the `ScreenState` union from `web/src/api/types.ts` (`loading`, `populated`, `empty-never-populated` is not used: an empty page is its own statement, `error`, `unreachable`). Render, above the table, the history sentence once (`--text-xs`, `--muted-foreground`) and, only when at least one row carries `restatedPossible` on a displayed percentile, the STD-UI-17 sentence once (DEC-0180); no mark references it by `aria-describedby`. Render a native `<table>` (the `data-table` `history` variant: read-only, no selection, no row actions) with the columns of T005 in the order received, never sorted, filtered or re-dated; Value, Growth and Momentum cells use the E4-S3 `factor-cell.tsx` with the standardised score beneath, passing only its DEC-0150 props; the tab renders no `RestatedMark` itself (the cell draws the mark) and gives no element an id for the sentence. Empty `sets` renders *No earlier scores for {SYMBOL}.* in place of the table. **Show more** per T006. Keep dates as wire strings (STD-UI-5); format numbers only through `format.ts` (STD-UI-3, DEC-0063). Use the Tailwind token classes `screens/coverage/badges.tsx` uses for the outcome badge; no polarity colour.

**Checkpoint**: T003 to T007 pass; `npx tsc --noEmit` is clean for the new files.

---

## Phase 4: Integration

**Purpose**: Confirm the tab is mountable by the evidence screen without touching it.

- [ ] T009 Verify, without editing the stock evidence screen (`web/src/screens/research/stocks/index.tsx`, E5-S3) or any shell file, that `HistoryTab` renders inside a bare `MemoryRouter` given only `symbol`, issues no request until mounted, and exports nothing the evidence screen must wrap. Confirm with `git diff --stat` that only `history-tab.tsx`, `history-tab.test.tsx` and (if strings were missing) `copy.ts` changed. Run the full `npm run test` to confirm no delivered test regressed.

**Checkpoint**: The full Vitest suite passes; only the listed files changed.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [ ] T010 Accessibility and token review of `history-tab.tsx` against ux-design 1.6 "Accessibility" and "Token Usage": the table has programmatic row and column headers; every status carries its word plus a shape (outcome badges, *Incomplete*, the mark); **Show more** has a 24 px target and visible focus; `--font-numeric` on dates and values; no `--gain`/`--loss`. Add an `axe`-style assertion only if the delivered `shell.a11y.test.tsx` already uses one, mirroring it. Update the Notes of this file with the final exported names recorded in T001.
- [ ] T011 After each TDD cycle in T003–T010 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E5-S2-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Hard edges in `dependencies.yaml` (E5-S2 -> E4-S1, E4-S2, E4-S3) already cover every module this plan imports; verified against the producer map below. No edge is added.

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E4-S1 | hard | `classification-client.ts` (history read) and `classification-types.ts`; already in the graph |
| CAP-002-E4-S2 | hard | `format.ts` (`formatTimestamp`, DEC-0063) and `copy.ts`; already in the graph |
| CAP-002-E4-S3 | hard | `factor-cell.tsx` imported by `history-tab.tsx`, which draws the mark through its own `RestatedMark` (`restated-mark.tsx` is not imported by the tab); already in the graph |
| CAP-002-E3-S5 | soft | Serves `GET /api/classifications/stocks/{symbol}/history` (`StockHistoryResponse`); this story codes against the approved contract with the client doubled, and the story's Dependencies names it as parallel development |
| CAP-002-E5-S3 | reverse | The evidence screen mounts `HistoryTab` in its Earlier scores tab; the graph already carries E5-S3 -> E5-S2 |
| CAP-002-E5-S1 | context | Same epic; shares only the E4-S3 mark; no import either way |

### Task Dependencies
- T001: gate, no dependencies (blocks everything)
- T002: Depends on T001
- T003 to T007: Depend on T001, T002; all in `history-tab.test.tsx`, so write sequentially in one file
- T008: Depends on T003 to T007
- T009: Depends on T008
- T010: Depends on T009
- T011: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: the test tasks share one file and are authored in order, though their cases are independent
- Phase 3: one production file; no parallelism

---

## Validation Plan

### Constitution-Defined Commands
(from `docs/constitution/tech-stack.md`, working directory `.` of `FactorFlow-v2`; as listed by the story)
- Build: `npm run build`
- Test: `npm run test` (Vitest)
- Lint: `npm run lint`
- Format: `npm run format` (check only, Biome)
- Type check: `npx tsc --noEmit`

### Story-Specific Validation
- DAC-E5-S2-1 / TC-COMP-154: rows in received order, values and dates unchanged, history sentence once
- DAC-E5-S2-2 / TC-COMP-155: *No earlier scores for {SYMBOL}.* shown, never-scored sentence absent
- DAC-E5-S2-3 / TC-COMP-115: retired stock's rows remain visible
- DAC-E5-S2-4 / TC-COMP-191: mark on the rows that carry it, older rows included; STD-UI-17 sentence once
- `git diff --stat` shows only the files named in T009

---

## Notes

### Resolved Conflicts

1. **UX 1.6 Download column (start time, linked) vs the history read's row shape.** UX prose and DEC-0083 want the download named by its start time; `HistoryRow` and `StockHistoryResponse` carry `run_id`, `run_outcome` and `ended_at` but no `run_started_at`. This is a genuine gap, not a precedence conflict; see Open Gaps 2.
2. **Resolution register vs the artifacts.** Checked `resolution-register-E5.md`: its code-state claim holds (`web/src` has `app/`, `api/`, `screens/{settings,instruments,runs,coverage}` only; no `components/`, no `screens/research/`), and its pinned strings for the history panel sentence and *No earlier scores for {SYMBOL}.* match ux-design 1.6. Two things it lacks: it does not mention that the history row carries no `run_started_at` (Open Gaps 2), and it says the history read arrives "via E3-S5 contract" without naming `StockHistoryResponse` (classification-api section 2.7).
3. **Story "retained for older rows" vs a stateful reading.** The phrase is satisfied by rendering each row's own `restatedPossible` as recorded (AC-23: the mark is retained with the classification in its history); no client-side retention logic exists or is needed. Source: the reader's `HistoryRow` carries three `FactorCell`s, each with `restated_possible`.

### Open Gaps

PROVISIONAL — awaiting owner confirmation (2026-10-18):

1. **Export names, component signature and paging control** (DEC-0178). Derivation: UX 1.6 says the tab loads on first activation and pages with keyset cursors; `DEFAULT_PAGE_SIZE` is 50; the `history` variant has no paging control, so a **Show more** button is the minimal cursor consumer; E4-S1 has not landed so T001 pins the client names and stops if the history read is missing. `HistoryTab({ symbol })` is a default export; E5-S3 must import it that way. Absorbing design: `component-design-classification-ui.md` sections 2.4 and 10.
2. **Download column cannot be built as UX 1.6 words it** (DEC-0179). Derivation: no S2 AC needs it; DEC-0083 forbids a number or UUID and `ended_at` is not the start time, so the table shows Scores date, Produced (`ended_at`) and the outcome badge and no link. Follow-up for the next revisions of `component-design-classification-reader.md` (`HistoryRow`), `component-design-classification-api.md` (`StockHistoryResponse`) and `ux-design.md` 1.6: add `run_started_at` to the history row, after which the column and link can be added.
3. **STD-UI-17 sentence placement in the Earlier scores panel** (DEC-0180). Derivation: tabs show one panel at a time, so the tab renders the sentence once, above the table, only when a mark is present, with no `aria-describedby` from any mark (E4-S3's `FactorCell` and `RestatedMark` props, DEC-0150, give no way to set one; see the E5-F01 owner-directed fix below); E5-S3 owns the Now panel's occurrence. Absorbing design: `ux-design.md` 1.6.

Owner-directed fixes (cross-plan review 2026-10-18):

- Owner-directed fix (cross-plan review 2026-10-18, E5-F01): the Earlier scores panel's STD-UI-17 sentence is tied to the marks by position only. It renders once above the table, no mark carries `aria-describedby` to it, cells go to `FactorCell` with its DEC-0150 props unchanged, and `history-tab.tsx` renders no mark directly — derivation: E4-S3's `FactorCell({ cell, factor, showScore, notFollowedSince })` draws the mark through `RestatedMark({ factor })` (CAP-002-E4-S3 T010/T011, DEC-0150) with no way to set an attribute on it, and T009 forbids editing those files. No approved artifact asks for `aria-describedby`: DAC-E5-5 requires the sentence once per screen, DAC-E5-S2-4 and TC-COMP-191 require only the mark on the row, and ux-design 1.6 says "beside the first occurrence". The mark is a non-focusable span with no role (E4-S3 T003), and E4-S7's inspector states the same sentence once with no link from the mark. DEC-0180 is amended. The same rule applies in CAP-002-E5-S1 (DEC-0176) and CAP-002-E5-S3 (DEC-0185).

### Other Notes

- Story references in this plan: CAP-002-E4-S1 (client and types), CAP-002-E4-S2 (format and copy) and CAP-002-E4-S3 (factor cell and restated mark) are consumed; CAP-002-E3-S5 serves the history endpoint; CAP-002-E5-S3 mounts this tab; CAP-002-E5-S1 is a sibling sharing only E4-S3's mark.
- ACs are display-side only. The history read (E3-S4/E3-S5), the mark and cell (E4-S3) and the screen that mounts the tab (E5-S3) are other stories.
- The tab receives only `symbol`. A retired stock's rows are not special-cased: the history read returns the same rows for it, and the tab renders what arrives. A recorded cell is never rewritten into *Not followed*.
- Only complete sets appear in the history (reader section 2.6), so no failed or building set row is rendered; the tab does not filter.
- The current set is excluded from the history read; the Now panel shows it. Do not add it here.
- TC-COMP-115, 154, 155 and 191 carry generic one-line steps ("no further cases are invented"); T003 sharpens them into the concrete assertions above.
- Tests are co-located with sources, as the delivered screens do (`web/src/screens/coverage/*.test.tsx`).
