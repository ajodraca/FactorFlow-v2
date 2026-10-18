---
artifact_schema_version: 1
artifact_id: CAP-002-E5-S1-tasks
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
  timestamp: 2026-10-18T00:45:00Z
  source_artifacts:
    - id: CAP-002-E5-S1
      version: "1"
    - id: CAP-002-component-design-classification-ui
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E5-S1 — Comparison Table Pattern and Compare Screen

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1.md`
**Component**: `FactorFlow-v2` (web frontend, `web/src`)
**Branch**: `usr/alvaro-de-jodra/CAP-002-E5-tasks`
**Date**: 2026-10-18

## Summary

Builds the Compare view of the Research area: `web/src/components/patterns/comparison-table.tsx`, a native `<table>` with programmatic row and column headers in which 2 to 6 stocks sit side by side, and `web/src/screens/research/compare/index.tsx`, the `CompareScreen` that reads the chosen symbols from the URL, enforces the 2-to-6 bound, reports unknown symbols, and renders every stock as a column. A stock incomplete or unranked on a factor keeps its column with its reason, a retired stock reads *Not followed* on every factor, per-input status follows DEC-0077, the per-input dates disclosure follows DEC-0078, and the *Possibly restated* mark appears on each percentile it applies to with its meaning sentence once per screen. The story consumes the fetch layer (E4-S1), the formatting and copy modules (E4-S2) and the factor cell and restated mark (E4-S3), none of which has landed in `web/src` yet; they are upstream dependencies, not deliverables of this plan.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-15 / DAC-E5-3 / DAC-E5-S1-4 | Retired stock reads *Not followed* on every factor in Compare | T005, T006, T012, T014 |
| AC-16 / DAC-E5-1 | 2 to 6 stocks side by side; no stock dropped for being incomplete; unknown symbol reported | T005, T006, T007, T008, T009, T011, T012, T013, T014 |
| AC-23 / DAC-E5-5 / DAC-E5-S1-5 | *Possibly restated* mark on every applicable percentile; sentence once per screen | T006, T010, T012, T013, T014 |
| DAC-E5-S1-1 | Incomplete stock keeps its column with *Incomplete* and the input named; not enough to rank stated once per group | T005, T009, T011, T012 |
| DAC-E5-S1-2 | Add `blocked` at six with *A comparison holds up to 6 stocks.*; fewer than two shows *Choose 2 to 6 stocks to compare.* | T007, T008, T013 |
| DAC-E5-S1-3 | `instrument_not_found` is a field error, no column added; `unknown_symbols` reported | T007, T008, T013 |
| DAC-E5-S1-4 | Retired stock: every factor reads *Not followed* | T005, T012 |
| DAC-E5-S1-5 | Restated mark on value or growth percentile, sentence once per screen | T006, T010, T012, T013 |

Mandatory component test cases: TC-COMP-127 (DAC-E5-S1-1), TC-COMP-128 (DAC-E5-S1-2), TC-COMP-129 (DAC-E5-S1-3), TC-COMP-114 (DAC-E5-S1-4), TC-COMP-190 (DAC-E5-S1-5). The coverage matrix lists further TCs against AC-16 (TC-COMP-088, 089, 096, 112, 120 to 126, 130 to 145) and DAC-E5-3/5 (TC-COMP-115, 116, 191, 192); each of those traces to a different story (E3, E4, E5-S2, E5-S3), checked by their `Traces to:` lines, and none is implemented here. `tests/e2e/compare-and-evidence.spec.ts` (TC-E2E-005/007/008) is a test-design artifact, not written by this story.

## Phase 1: Setup

**Purpose**: Confirm the upstream modules exist, pin the names this story imports, and put the compare-only strings where the design says strings live.

- [ ] T001 Gate on upstream deliverables. List `web/src/api/classification-client.ts`, `web/src/api/classification-types.ts`, `web/src/screens/research/format.ts`, `web/src/screens/research/copy.ts`, `web/src/components/patterns/factor-cell.tsx` and `web/src/components/patterns/restated-mark.tsx`, and read their exports. If any is absent, STOP and report the missing hard dependency (CAP-002-E4-S1, E4-S2, E4-S3) instead of recreating it. Record in the Notes of this file the exact exported names used for: the compare list read (`GET /api/classifications?symbols=`), the per-stock evidence read (`GET /api/classifications/stocks/{symbol}`), the `StockEvidence`, `InputRow`, `FactorCell`, `ClassificationList` types, `formatPercentile`, `formatScore`, `formatRatio`, `formatRate`, and the `FactorCell` component props. Do not invent names (DEC-0177).
- [ ] T002 Add each compare-only string absent from `web/src/screens/research/copy.ts` (check first, add only what is missing): *Comparing {n} stocks*, *Comparison of {n} stocks*, *Add a stock*, *A comparison holds up to 6 stocks.*, *Choose 2 to 6 stocks to compare.* and its longer empty form *Choose 2 to 6 stocks to compare. Check rows on Research or in a universe, or add a stock here.*, *FactorFlow doesn't follow a stock named {SYMBOL}.*, the duplicate-symbol field error naming the symbol, the unknown-symbols report sentence, *Remove {SYMBOL} from comparison*, *Show dates for {input}*, *Not enough to rank · {n} qualified, {min} needed*, the input-status words *Missing*, *Outdated*, *Couldn't be computed*, and the STD-UI-17 sentence *Possibly restated: the financials behind this score were downloaded for a period that had already been reported before FactorFlow began following this stock, so they may reflect later restatements.* (ux-design 1.5, 1.6; component design 2.7). Display labels only: no string may contain *instrument*, *acquisition run*, *not classified*, *retire* or a bare *score* where percentile or standardised score is meant (the delivered `copy.test.ts` scan must still pass). Use the sentence from `copy.ts` if E4-S2 already holds it.

**Checkpoint**: The six upstream files exist and their names are recorded; `copy.ts` holds every compare string; `npm run test` for `copy.test.ts` still passes.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the behaviour from the acceptance criteria. Tests double `fetch` or the classification client with `vi.mock` of `../../api/classification-client`, as `add-field.test.tsx` does for `client`.

### Mandatory Component Tests

- [ ] T003 [P] Implement TC-COMP-127 (Compare keeps incomplete stock's column with the input named) and TC-COMP-114 (Retired stock reads Not followed on every factor in Compare) in `web/src/components/patterns/comparison-table.test.tsx` with `// Implements TC-COMP-127` and `// Implements TC-COMP-114`. TC-127: three stocks, one `not_classified` on growth with `reasonCode` `input_missing` and `reasonInput` `revenue_growth`; assert three column headers remain, its growth percentile cell reads *Incomplete* with the input named in product vocabulary (tooltip or text), its growth standardised-score cell is an em dash, and its growth input rows still show the values that exist; and with growth `ranked: false` (`qualifiedCount` 12, `minPeerSetSize` 30) assert *Not enough to rank · 12 qualified, 30 needed* occurs exactly once in the Growth group header, *Not enough to rank* in every Growth percentile cell, and em dashes in the score cells. TC-114: a stock with `lifecycle: "retired"`; assert *Not followed* in all three percentile cells with an em dash beneath each, and the *Not followed* badge in its column header (DAC-E5-S1-4, DEC-0073).
- [ ] T004 [P] Implement TC-COMP-128 (Compare blocks Add at six and prompts below two), TC-COMP-129 (Unknown symbol is a field error; no column added) and TC-COMP-190 (Possibly restated mark on Compare percentiles, sentence once) in `web/src/screens/research/compare/compare.test.tsx` with `// Implements TC-COMP-128` etc. TC-128: render at `/research/compare?symbols=` with six symbols inside `MemoryRouter`; the Add button has `aria-disabled="true"` (the `blocked` tier: focusable, not `disabled`) and `aria-describedby` pointing at *A comparison holds up to 6 stocks.*; pressing it and pressing Enter in the field issue no request and add no column; with one symbol and with none, *Choose 2 to 6 stocks to compare.* is shown and no list read is issued. TC-129: the evidence read for the typed symbol rejects with `ApiError` code `instrument_not_found`; assert the field error *FactorFlow doesn't follow a stock named XYZ.*, column count unchanged and the URL unchanged; and a list read returning `unknownSymbols: ["ZZZ"]` is reported by name with no column. TC-190: a value percentile and a growth percentile with `restatedPossible: true` in two columns; assert each shows the mark with accessible text *Possibly restated*, and the STD-UI-17 sentence appears exactly once on the screen.

### Additional Unit Tests

- [ ] T005 [P] Per-input status in `web/src/components/patterns/comparison-table.test.tsx` (DEC-0077, AC-12): `present` renders the value alone; `missing` renders an em dash plus the *Missing* badge (`coverage-absent`); `outdated` renders the value plus the *Outdated* badge (`status-warning`); `not_computable` renders the value or em dash plus the plain text *Couldn't be computed* with its triangle `aria-hidden` and not a badge. Also precision per row (DEC-0063): percentile whole, score signed 2 dp, book-to-price, earnings yield and free-cash-flow yield 2 dp, growth and returns signed % 2 dp, a measured `0.00` score unsigned, scores and percentiles never `0` when unscored.
- [ ] T006 [P] Structure and accessibility in `web/src/components/patterns/comparison-table.test.tsx`: a native `<table>` labelled *Comparison of {n} stocks*; the column headers are `<th scope="col">` and each input and quantity row header is `<th scope="row">`; group headers are `<th>` spanning the row with the factor name in text; each stock header holds a link to `/research/stocks/{symbol}`, the name and a *Remove {SYMBOL} from comparison* ghost button; rows follow the UX 1.5 order (Value: percentile, standardised score, book-to-price, earnings yield, free-cash-flow yield; Growth: percentile, standardised score, revenue growth, EPS growth; Momentum: percentile, standardised score, 3, 6, 12-month return); the restated mark appears on value and growth percentiles that carry it and on backfilled input rows (`restatedPossible`), never on momentum (DEC-0075); no `--gain` or `--loss` polarity class on a value (DEC-0060).
- [ ] T007 [P] Dates disclosure in `web/src/components/patterns/comparison-table.test.tsx` (DEC-0078): each input row header has a ghost button named *Show dates for book-to-price* (lowercase input name) with `aria-expanded="false"`; activating it by click, Enter and Space sets `aria-expanded="true"`, shows `asOf` and `knownOn` beneath every column's value as unconverted `YYYY-MM-DD`, and the same control collapses it; the percentile and score rows have no disclosure.
- [ ] T008 [P] Entry and bounds in `web/src/screens/research/compare/compare.test.tsx` (DEC-0070): a valid symbol typed and submitted by Enter or Add appends a column after the evidence read succeeds and appends it to the `symbols` query; a symbol already compared is a field error naming it; a five-symbol URL accepts a sixth and then the Add becomes `blocked`; a seven-symbol URL is not read and Add is `blocked`; the server's `422` is the backstop and renders as the same bound message (assert with a doubled `ApiError` code `validation_error`).
- [ ] T009 [P] Removal and focus in `web/src/screens/research/compare/compare.test.tsx`: the remove button drops the column, updates the URL, and moves focus to the next column's header (the previous if it was last); with one column left the prompt *Choose 2 to 6 stocks to compare.* reads above the remaining column (evidence cells only, per DEC-0176); removing the last column focuses the entry field.
- [ ] T010 [P] Screen states in `web/src/screens/research/compare/compare.test.tsx`: loading renders a skeleton with one column per chosen symbol; `neverClassified: true` renders the never-populated statement with the chosen symbols kept in the URL and no table; a read failure renders the error state (operation, resource, reason from `ApiError.code` via `copy.ts`, never `message`) with **Try again**, the symbols kept in the URL and the entry row still rendered; `ApiUnreachableError` renders the unreachable state; a `not_current` set still renders as populated (AC-20; no banner here, DEC-0175). Assert `h1` reads *Comparing {n} stocks* and that fetches are one list read plus one evidence read per column.

**Checkpoint**: All tests written and failing (no production code yet). Each mandatory test carries its `Implements TC-COMP-nnn` comment.

---

## Phase 3: Core Implementation

**Purpose**: The comparison table pattern, pure and presentational, then the screen that feeds it.

- [ ] T011 Create `web/src/components/patterns/comparison-table.tsx` (satisfies T003 to T007). Props are a typed `columns` array (one entry per stock: symbol, name, lifecycle, the three `FactorCell`s from the list read, the `InputRow`s from the evidence read), the `factors` summary (`qualifiedCount`, `ranked`, `minPeerSetSize`; optional, absent for a single column per DEC-0176), the `onRemove(symbol)` callback and an optional `restatedSentenceId`. Render a native `<table>` with `aria-label`/caption *Comparison of {n} stocks*, a pinned first column (boundary in `--border`, container focusable with `tabIndex={0}` for keyboard scroll where it occurs) and the three row groups of UX 1.5. The percentile row uses the E4-S3 `factor-cell.tsx` (number, bar, mark, *Incomplete*, *Not enough to rank*, *Not followed*) and the standardised-score row renders in `--muted-foreground` beneath it with an em dash in `--value-missing` wherever the cell is not `classified`. A group whose factor is `ranked: false` states *Not enough to rank · {n} qualified, {min} needed* once in its group header. Input rows are keyed by `inputName` (`book_to_price`, `earnings_yield`, `fcf_yield`, `revenue_growth`, `eps_growth`, `return_3m`, `return_6m`, `return_12m`; factor-engine design) and resolved per column, with an em dash and *Missing* when an input row is absent. Per-input status and the disclosure live in this file as private components (used once). `<th scope="row">` for rows, `<th scope="col">` for stock columns. Use the existing Tailwind token classes as `screens/coverage/badges.tsx` does, never a polarity colour.
- [ ] T012 Create `web/src/screens/research/compare/index.tsx` with `export default function CompareScreen(): JSX.Element` (the delivered screens default-export; satisfies T004, T008 to T010). Breadcrumb *Research › Compare*; one full-width card with `h1` *Comparing {n} stocks*; an entry row (`form` inline, `input` text labelled *Add a stock*, Add as `button` secondary that renders `blocked`: focusable, `aria-disabled`, `aria-describedby` its reason) ; the comparison table. State machine over the `ScreenState` union from `web/src/api/types.ts`. The symbols are the `symbols` query (`useSearchParams`), uppercase, de-duplicated, order kept. With 2 to 6 symbols: one list read with `symbols`, then one evidence read per symbol, in parallel; `unknownSymbols` from the list are listed by name in a notice and produce no column; a seventh symbol in the URL is not read and shows the bound message. With 0 or 1 symbols: no list read; render *Choose 2 to 6 stocks to compare.* (the long form with the entry field focused when 0), and for 1 symbol its evidence-only column (DEC-0176). Add: refuse client-side at six (DEC-0070), refuse a duplicate, read the new symbol's evidence, map `ApiError` code `instrument_not_found` to the field error and add nothing, otherwise append to the URL. Remove: drop the symbol, update the URL, move focus as in T009. Render the STD-UI-17 sentence once in a paragraph under the table only when at least one mark is on screen, and have the first mark in reading order reference it by `aria-describedby` (DEC-0176). Do not mount an as-of line, banner or poll (DEC-0175).

**Checkpoint**: T003 to T010 pass; `npx tsc --noEmit` is clean for the new files.

---

## Phase 4: Integration

**Purpose**: Confirm the screen composes with the delivered shell and the upstream modules without touching them.

- [ ] T013 Verify, without editing `web/src/app/routes.tsx` or any shell file (routing belongs to CAP-002-E4-S10), that `CompareScreen` renders inside `MemoryRouter` with only the router around it (the screens' own tests render without the shell, per the E4-S10 ordering decision), that the stock-header link target `/research/stocks/:symbol` and the breadcrumb targets resolve through `SHELL_ROUTES` in `copy.ts` where the map holds them, and that no file outside the story's list (`comparison-table.tsx`, its test, `compare/index.tsx`, `compare.test.tsx`, `copy.ts`) is modified (`git diff --stat`). Run the full `npm run test` to confirm no delivered test regressed.

**Checkpoint**: The full Vitest suite passes; only the five listed files changed.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [ ] T014 Accessibility and design-token review of `comparison-table.tsx` and `compare/index.tsx` against ux-design 1.5 "Accessibility" and "Token Usage": every status carries its word plus a shape or pattern (STD-UI-4, STD-UI-14); remove and disclosure controls name their stock or input; focus rings and 24 px targets on the entry row; no `--gain`/`--loss`; add an `axe`-style assertion only if the delivered `shell.a11y.test.tsx` already uses one, mirroring it, otherwise rely on the role and name assertions in T006. Update the Notes of this file with the final exported names recorded in T001.
- [ ] T015 After each TDD cycle in T003–T014 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E5-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Hard edges in `dependencies.yaml` (E5-S1 -> E4-S1, E4-S2, E4-S3) already cover every module this plan imports; verified against the producer map below.

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E4-S1 | hard | `classification-client.ts` and `classification-types.ts` (list and evidence reads, `StockEvidence`, `FactorCell`); already in the graph |
| CAP-002-E4-S2 | hard | `format.ts` (DEC-0063 precision) and `copy.ts`; already in the graph |
| CAP-002-E4-S3 | hard | `factor-cell.tsx` and `restated-mark.tsx` imported by `comparison-table.tsx`; already in the graph |
| CAP-002-E3-S5 | soft | The compare read contract (`GET /api/classifications?symbols=`, `unknown_symbols`, 2 to 6 bound) in classification-api section 2.7; this story codes against the approved contract and doubles `fetch`; the story's own Dependencies section names it as parallel development |
| CAP-002-E4-S4 | context | Owns `as-of-line.tsx`, `not-current-banner.tsx` and the poll; this story mounts none of them (DEC-0175), so no import exists |
| CAP-002-E4-S7 | reverse | The selection tray routes to `/research/compare?symbols=`; it consumes the URL this screen reads, not a module of this story |
| CAP-002-E4-S10 | reverse | `routes.tsx` imports `CompareScreen` from this story (story text: "a later epic, deliberate") |
| CAP-002-E5-S2 | context | Same epic; the history tab shares only the restated mark from E4-S3 |
| CAP-002-E5-S3 | context | Evidence screen is the other consumer of the restated mark and factor cell; no import from this story |

### Task Dependencies
- T001: gate, no dependencies (blocks everything)
- T002: Depends on T001
- T003, T004: Depend on T001, T002; can run in parallel
- T005, T006, T007: Depend on T001, T002; same file as T003, so write sequentially within `comparison-table.test.tsx`
- T008, T009, T010: Depend on T001, T002; same file as T004, so write sequentially within `compare.test.tsx`
- T011: Depends on T003, T005, T006, T007
- T012: Depends on T011, T004, T008, T009, T010
- T013: Depends on T012
- T014: Depends on T013
- T015: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: the two test files (`comparison-table.test.tsx`, `compare.test.tsx`) are independent of each other
- Phase 3: T011 and the screen's skeleton can start together, but T012 needs the table's prop shape

---

## Validation Plan

### Constitution-Defined Commands
(from `docs/constitution/tech-stack.md`, working directory `.` of `FactorFlow-v2`)
- Build: `npm run build`
- Test: `npm run test` (Vitest); `npm run test:e2e` exists but this story writes no e2e
- Lint: `npm run lint`
- Format: `npm run format` (check only, no modification; Biome)
- Type check: `npx tsc --noEmit`

### Story-Specific Validation
- DAC-E5-S1-1 / TC-COMP-127: incomplete stock keeps its column; *Not enough to rank* group statement appears once
- DAC-E5-S1-2 / TC-COMP-128: Add `blocked` at six with the exact sentence; prompt below two
- DAC-E5-S1-3 / TC-COMP-129: `instrument_not_found` is a field error and no column; `unknownSymbols` reported
- DAC-E5-S1-4 / TC-COMP-114: retired stock reads *Not followed* on every factor
- DAC-E5-S1-5 / TC-COMP-190: mark on restated value and growth percentiles; sentence once
- `git diff --stat` shows only the five files named in T013

---

## Notes

### Resolved Conflicts

1. **"download #{n}" wording.** Older text prints a download number; DEC-0083 (named by start time, linked to run detail) governs. This story renders no download reference (no as-of line), so nothing is affected.
2. **Story "Not followed on every factor" vs UX 1.5 "Not followed in every percentile cell with the em dash beneath".** The same rendering; the UX statement is the more specific form. No conflict.
3. **UX design 1.5 (as-of line and banner on Compare) vs the approved story.** The story's description, ACs and Dependencies name neither and the graph carries no E5-S1 -> E4-S4 edge. Precedence ladder: approved story ACs outrank draft design prose, so the plan does not mount them; recorded as DEC-0175 (PROVISIONAL).
4. **Resolution register (`resolution-register-E5.md`) checked.** Its code-state claim holds: `web/src` has `app/`, `api/` and `screens/{settings,instruments,runs,coverage}` only; none of `components/patterns/*`, the CAP-002 fetch layer, the format/copy/query modules or `screens/research/*` exist. Its pinned values match the designs read. The register is silent on three things this plan had to settle: the as-of line/banner scope (DEC-0175), the single-column and sentence-placement shapes (DEC-0176), and the upstream export names (DEC-0177).

### Open Gaps

PROVISIONAL — awaiting owner confirmation (2026-10-18):

1. **As-of line, not-current banner and poll are not mounted on Compare** (DEC-0175). Derivation: no E5-S1 AC requires them and the approved story lists dependencies E4-S1 to E4-S3 only; mounting would add an undeclared hard edge on E4-S4. Absorbing design: `ux-design.md` 1.5 / the owner decides whether to add a follow-up task and an E4-S4 edge. No graph edge is added by this plan.
2. **STD-UI-17 sentence placement and the single-column state** (DEC-0176). Derivation: a table has no "beside the first occurrence" slot, so one paragraph under the table with `aria-describedby` from the first mark is used; the list read refuses fewer than two symbols, so a single remaining column is built from the evidence read alone and its not-enough-to-rank group statement is reduced to the cell badges (no factor summary). Absorbing design: `ux-design.md` 1.5 States and Interaction Flows.
3. **Upstream export names are not fixed by any artifact** (DEC-0177). T001 pins them at coding time and stops if the upstream modules are absent. Also `export default function CompareScreen`, following the delivered screens, since neither the design nor the story fixes the export form; E4-S10 must import it the same way.

Not decided by this plan and not blocking:

4. **"Not followed since {date}" tooltip date.** No stock-level retirement date is carried on the classification wire (only `lifecycle`, and `retired_at` exists on universes). The tooltip belongs to E4-S3's `factor-cell.tsx`; Compare passes the cell and column header through unchanged and asserts only *Not followed*. Absorbing design: classification-api section 2.7 / classification-ui section 2.5, at their next revision.
5. **Unit of growth and return input values on the wire.** The designs say `formatRate` yields a signed percentage at two decimals but do not state whether `value` is a fraction or a percent. T005 asserts the rendered text through E4-S2's `formatRate` contract; use whatever scaling that function documents, and record a mismatch to the owner rather than rescaling here.

### Other Notes

- Story references in this plan: CAP-002-E4-S1 (fetch layer and types), CAP-002-E4-S2 (format and copy), CAP-002-E4-S3 (factor cell and restated mark) are consumed; CAP-002-E3-S5 supplies the compare read contract; CAP-002-E4-S4 (as-of line, banner, poll) is not consumed; CAP-002-E4-S7 (tray) and CAP-002-E4-S10 (routes) consume this story; CAP-002-E5-S2 and CAP-002-E5-S3 are siblings sharing only E4-S3's mark.
- The ACs are on the display side only; the compare read endpoints are E3-S5, the tray that routes here is E4-S7, and routing is E4-S10.
- The restated mark never renders on momentum (E4-S3 DAC-E4-S3-3); the table passes `restatedPossible` straight through and does not add a mark itself on that group.
- `unknownSymbols` is read from the list response only; `instrument_not_found` on Add comes from the evidence read. Do not derive either from the other.
- TC-COMP-114, 127 to 129 and 190 carry generic one-line steps in the test spec ("no further cases are invented"); T003 and T004 sharpen them into the concrete assertions above from DAC-E5-S1-1 to 5, which are the source of truth.
- Test directories are co-located with sources, as the delivered screens do (`web/src/screens/coverage/*.test.tsx`).
