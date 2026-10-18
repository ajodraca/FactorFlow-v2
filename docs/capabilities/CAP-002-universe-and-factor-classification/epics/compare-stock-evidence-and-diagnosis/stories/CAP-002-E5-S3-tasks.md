---
artifact_schema_version: 1
artifact_id: CAP-002-E5-S3-tasks
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
  timestamp: 2026-10-18T01:40:00Z
  source_artifacts:
    - id: CAP-002-E5-S3
      version: "1"
    - id: CAP-002-component-design-classification-ui
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E5-S3 — Stock Evidence Screen with Factor Cards and Three-Part Insufficient-Evidence Statements

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S3.md`
**Component**: `FactorFlow-v2` (web frontend, `web/src`)
**Branch**: `usr/alvaro-de-jodra/CAP-002-E5-tasks`
**Date**: 2026-10-18

## Summary

Builds the Stock evidence screen of the Research area: `web/src/screens/research/stocks/index.tsx` (`StockEvidenceScreen`, the page at `/research/stocks/:symbol`) and `web/src/screens/research/stocks/factor-card.tsx`. The screen reads one stock's evidence, shows the symbol, name, *Not followed* badge where it applies and memberships, and offers two tabs: **Now**, three factor cards, and **Earlier scores**, which mounts the `HistoryTab` that CAP-002-E5-S2 delivers. Each card shows the factor's result (percentile cell with standardised score beneath, or *Incomplete* with the three-part statement naming the missing or outdated input, the rule and the recovery, or no recovery where the provider holds no data), then every input with value, `as_of` and `known_on` and its per-input status (DEC-0077). A retired stock reads *Not followed* on every factor while its earlier classifications stay in the history tab; an unknown symbol shows a not-found state. The STD-UI-18 sentence appears once on the screen and the restatement meaning beside the first mark. The story consumes the fetch layer (E4-S1), formatting and copy (E4-S2) and the factor cell and restated mark (E4-S3), none of which has landed in `web/src`; they are upstream dependencies, not deliverables of this plan. Routing `/research/stocks/:symbol` to the screen belongs to the shell composition story (E4-S10).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-13 / DAC-E5-S3-1 | Outdated fundamental: card names the period end, the 6-month rule against the scores' date and the next-download recovery | T003, T005, T010, T012 |
| AC-17 / DAC-E5-2 | Every input shown with value (where present), `as_of`, `known_on`; missing or outdated input named | T003, T005, T006, T010, T012 |
| DAC-E5-S3-2 | Provider holds no data: no recovery offered | T003, T005, T010, T012 |
| AC-15 / DAC-E5-3 / DAC-E5-S3-4 | Retired stock: every factor reads *Not followed*; earlier classifications stay in the history tab | T004, T007, T011, T012, T013 |
| AC-23 / DAC-E5-5 / DAC-E5-S3-3 | Mark on every applicable percentile and backfilled input; STD-UI-18 sentence once; restatement meaning beside the first mark | T004, T006, T011, T012, T013 |
| DAC-E5-S3-5 / AC-17 | Unknown symbol: not-found state, not an empty card set | T004, T008, T013 |

Mandatory component test cases: TC-COMP-105 (DAC-E5-S3-1), TC-COMP-106 (DAC-E5-S3-2), TC-COMP-116 (DAC-E5-S3-4), TC-COMP-192 (DAC-E5-S3-3), TC-COMP-149 (DAC-E5-S3-5). Other TCs touching the same capability ACs belong to other stories by their `Traces to:` lines: TC-COMP-114 (E5-S1 Compare, retired), TC-COMP-115 and TC-COMP-191 (E5-S2 history tab), TC-COMP-190 (E5-S1, restated sentence on Compare). `tests/e2e/fix-insufficient-evidence.spec.ts` and `tests/e2e/compare-and-evidence.spec.ts` are test-design artifacts, not written by this story.

## Phase 1: Setup

**Purpose**: Confirm upstream modules exist, pin the names this story imports, and place the screen's strings where strings live.

- [ ] T001 Gate on upstream deliverables. List `web/src/api/classification-client.ts`, `web/src/api/classification-types.ts`, `web/src/screens/research/format.ts`, `web/src/screens/research/copy.ts`, `web/src/components/patterns/factor-cell.tsx`, `web/src/components/patterns/restated-mark.tsx` and `web/src/screens/research/stocks/history-tab.tsx` (E5-S2), and read their exports. If any is absent, STOP and report the missing hard dependency (CAP-002-E4-S1, E4-S2, E4-S3, E5-S2) instead of recreating it. Record in the Notes of this file the exact exported names used for: the per-stock evidence read (`GET /api/classifications/stocks/{symbol}`), `ApiError` (its `code`), `ApiUnreachableError`, the `StockEvidence`, `InputRow`, `FactorCell`, `Membership`, `CurrentSet` types, `formatScore`, `formatRatio`, `formatRate`, `formatPercentile`, the `FactorCell` and `RestatedMark` component props, `SHELL_ROUTES` (for the Data health and followed-stocks links), and the type of `InputRow.detail` and the key (if any) in it that carries the acquisition outcome. Do not invent names (DEC-0185). If `InputRow.detail` carries no acquisition outcome key, STOP and report it as an E4-S1 or factor-engine gap rather than guessing a key (DEC-0181).
- [ ] T002 Add each string absent from `web/src/screens/research/copy.ts` (check first, add only what is missing): the factor names *Value*, *Growth*, *Momentum*; the input labels by `inputName` (`book_to_price`, `earnings_yield`, `fcf_yield`, `revenue_growth`, `eps_growth`, `return_3m`, `return_6m`, `return_12m`) only where `InputRow.label` is not already product vocabulary; *Now*, *Earlier scores*, *As of*, *Known on*, *In no universe*, *In {universe names}*, *Incomplete*, *Not enough to rank*, *Not followed*, *Missing*, *Outdated*, *Couldn't be computed*; the statements *{Factor} for {SYMBOL} couldn't be scored: its latest statement covers a quarter that ended more than 6 months before {scores date}.*, *{Factor} for {SYMBOL} couldn't be scored: its latest price is from {as_of}, not the latest trading day.*, *{Factor} for {SYMBOL} couldn't be scored: the provider reports no {input label} for {SYMBOL}.*, *{Factor} for {SYMBOL} couldn't be scored: {input label} couldn't be computed ({reason detail}).*, the recovery *The next Complete or Partial download will try again.* (with a link *Data health*), *No action in FactorFlow changes this.*, *Not followed. Earlier scores stand.*, the not-enough-to-rank sentence built from the card's `reasonDetail` (DEC-0186), *{SYMBOL} has no score yet because no stocks have been scored.*, *FactorFlow doesn't follow a stock named {SYMBOL}.* (with a link to the followed-stocks page), the STD-UI-18 sentence *A score is shown only when every input is present and current. This checks presence and currency, not whether the provider's values are correct.*, and the STD-UI-17 sentence *Possibly restated: the financials behind this score were downloaded for a period that had already been reported before FactorFlow began following this stock, so they may reflect later restatements.* (use E4-S2's or E5-S1's/E5-S2's copy if it already holds any). The error sentence for the evidence read comes from the existing per-code map in `copy.ts`; add a code entry only if one is missing. Display labels only: no string may contain *instrument*, *acquisition run*, *not classified*, *retire* or a bare *score* where percentile or standardised score is meant (the delivered `copy.test.ts` scan must still pass).

**Checkpoint**: The seven upstream files exist and their names are recorded; `copy.ts` holds every string above; `copy.test.ts` still passes.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests from the acceptance criteria. Double the classification client with `vi.mock` of `../../../api/classification-client`, as the delivered screen tests mock `client`; render the screen in a `MemoryRouter` with `Routes` at `/research/stocks/:symbol`.

### Mandatory Component Tests

- [ ] T003 [P] Implement TC-COMP-105 (Outdated fundamental card names period end, rule and recovery) and TC-COMP-106 (No-provider-data factor offers no recovery) in `web/src/screens/research/stocks/factor-card.test.tsx`, each with `// Implements TC-COMP-nnn`. The spec steps are one-line boilerplate; the story's ACs are the source of truth. TC-105: a `FactorCard` for `growth` of stock KO with a `not_classified` cell (`reasonCode: "input_outdated"`, `reasonInput: "revenue_growth"`), the scores' date 2026-10-15 and an `InputRow` for `revenue_growth` with `status: "outdated"`, `asOf: "2026-03-28"` (more than 6 months before the scores' date); assert the `coverage-absent` badge *Incomplete*, the statement *Growth for KO couldn't be scored: its latest statement covers a quarter that ended more than 6 months before 2026-10-15.* with the period end 2026-03-28 shown in the input row, and the recovery *The next Complete or Partial download will try again.*. TC-106: a `value` card with `reasonCode: "input_missing"`, `reasonInput: "fcf_yield"`, and a `fcf_yield` `InputRow` with `status: "missing"` whose `detail` carries the acquisition outcome `not_found` in the shape recorded by T001; assert *Value for KO couldn't be scored: the provider reports no free-cash-flow yield for KO.*, the sentence *No action in FactorFlow changes this.*, and that neither the recovery sentence nor a Data health link appears. Contrast within the same file: a missing input whose outcome is anything other than `not_found` keeps the recovery (DEC-0181).
- [ ] T004 [P] Implement TC-COMP-116 (Retired stock evidence reads Not followed; history keeps scores), TC-COMP-149 (Unknown symbol shows not-found state) and TC-COMP-192 (STD-UI-18 sentence once; restatement meaning beside first mark) in `web/src/screens/research/stocks/stock-evidence.test.tsx`, each with `// Implements TC-COMP-nnn`. TC-116: the evidence double returns `lifecycle: "retired"` with three `not_classified` cells (`reasonCode: "retired"`) and no inputs, the history double returns two sets; assert the *Not followed* `status-neutral` badge after the symbol, each of the three cards reads *Not followed* with *Not followed. Earlier scores stand.* and no input list and no *Incomplete*, then activate **Earlier scores** and assert both earlier rows render with their percentiles (the real `HistoryTab`, client doubled; DEC-0182). TC-149: the evidence double rejects with `ApiError` code `instrument_not_found`; assert *FactorFlow doesn't follow a stock named XYZ.* with the followed-stocks link, no factor card and no tab list (not an empty card set). TC-192: a stock with `restatedPossible: true` on the value and growth cells and on two input rows, and one `not_classified` card; assert the STD-UI-18 sentence occurs exactly once on the screen, the STD-UI-17 sentence occurs exactly once, sits directly below the first card (reading order) that shows a mark, and the first mark in reading order has `aria-describedby` pointing at it; with no mark anywhere the STD-UI-17 sentence does not render at all (DEC-0185).

### Additional Unit Tests

- [ ] T005 [P] Three-part statements in `web/src/screens/research/stocks/factor-card.test.tsx` (AC-12, AC-13, DEC-0181, DEC-0182): an outdated `value` or `growth` input whose `asOf` is more than 6 months before the scores' date reads the fundamentals sentence; an outdated momentum input, or an outdated value input whose `asOf` is within 6 months of the scores' date, reads the price sentence naming its `asOf` and *not the latest trading day*; exactly 6 months before the scores' date is not older than the rule (the boundary is the engine's, `D - 6 months`); both carry the next-download recovery with a link to Data health; the dates are the wire strings unchanged (STD-UI-5); a `not_computable` factor names the input, states the cell's `reasonDetail` and renders no recovery line (DEC-0186); the missing-input statement names the input by its product-vocabulary `label`, never `reasonInput`'s key, never a payload key (STD-UI-1).
- [ ] T006 [P] Input list in `web/src/screens/research/stocks/factor-card.test.tsx` (AC-17, AC-23, DEC-0077, DEC-0063, DEC-0186): a `<dl>` with the input label as `<dt>`; `present`: the value only; `missing`: an em dash in `--value-missing` and a `coverage-absent` badge *Missing*; `outdated`: the value and a `status-warning` badge *Outdated*; `not_computable`: the value (or em dash) and plain text *Couldn't be computed* in `--status-warning` with an `aria-hidden` triangle; each row shows *As of* and *Known on* as unconverted wire dates in `--font-numeric` (an em dash where either is null); a value is rendered through `formatRatio` for `book_to_price`, `earnings_yield`, `fcf_yield` and through `formatRate` for `revenue_growth`, `eps_growth` and `return_3m`, `return_6m`, `return_12m`, never `toFixed`; the restated mark (accessible text *Possibly restated*) on each row with `restatedPossible` and never on a momentum row; a measured `0.00` renders as `0.00`, not blank; no `--gain`/`--loss` class on a value (DEC-0060).
- [ ] T007 [P] Card states in `web/src/screens/research/stocks/factor-card.test.tsx` (AC-14, AC-15, DEC-0073, DEC-0072): `classified` renders the E4-S3 factor cell with the standardised score through `formatScore` in `--muted-foreground` beneath it; `reasonCode: "not_enough_stocks"` renders the `coverage-unknown` badge *Not enough to rank* with the sentence built from `reasonDetail` (e.g. *18 of 30 stocks qualified*) and no input-status badges (DEC-0186); `retired` renders the `status-neutral` *Not followed* badge and *Not followed. Earlier scores stand.* with no date (DEC-0183); the card title is an `h2` with the factor swatch and name; the card is a `section` labelled by its heading.
- [ ] T008 [P] Screen states in `web/src/screens/research/stocks/stock-evidence.test.tsx`: loading renders a skeleton of three cards (no resize); `set: null` renders *{SYMBOL} has no score yet because no stocks have been scored.* under the title, no cards, and the Earlier scores tab still reachable (DEC-0184); an `ApiError` other than `instrument_not_found` renders the error state in the active panel (operation, resource, reason from `copy.ts` by `code`, never `message`) with **Try again** that reissues the read and keeps the title; `ApiUnreachableError` renders the shell's unreachable state; the title is an `h1` with the symbol in `--font-numeric` and the name, the breadcrumb reads *Research › {SYMBOL}* with *Research* a link, and the page is capped at 1180 px; memberships read *In Tech and Dividend growers* with each name a link to `/research/universes/{universeId}`, or *In no universe*; no as-of line, banner or poll is rendered (DEC-0184).
- [ ] T009 [P] Tabs in `web/src/screens/research/stocks/stock-evidence.test.tsx` (DEC-0185): a `tablist` with **Now** (selected by default) and **Earlier scores**; `?tab=earlier` opens Earlier scores; activating a tab by click and by arrow keys updates the `tab` query and `aria-selected`; `HistoryTab` is not mounted (no history read issued) until Earlier scores is first activated, then stays mounted across switches (a second activation issues no second read) with the Now panel kept mounted but `hidden`; each tabpanel is labelled by its tab; one evidence read on mount and none on a tab switch; a changed `:symbol` reads once and resets the tab state.

**Checkpoint**: All tests written and failing (no production code yet). Each mandatory test carries its `Implements TC-COMP-nnn` comment.

---

## Phase 3: Core Implementation

**Purpose**: The factor card, then the screen that feeds it. Presentational over the delivered factor cell and mark.

- [ ] T010 Create `web/src/screens/research/stocks/factor-card.tsx` with `export default function FactorCard(props): JSX.Element` (default export; DEC-0185; satisfies T003, T005 to T007). Props: the `factor`, the symbol, the factor's `FactorCell`, the factor's `InputRow`s (filtered by `factor`), `lifecycle`, and `scoresDate` (`set.classificationDate`), plus an optional `restatedSentenceId` that the screen passes to the first card showing a mark. A `section` with an `h2` (swatch in `--factor-*`, factor name; the swatch is identity only, STD-UI-7) on `card` `summary` tokens (`--card`, `--card-foreground`, `--border`). First block by cell status, per T007: `classified` (E4-S3 factor cell, standardised score beneath), `input_missing` / `input_outdated` / `input_not_computable` (`coverage-absent` badge *Incomplete* then the three-part statement: the missing or outdated input named by `label`, the rule, and the recovery), `not_enough_stocks`, `retired` (no input list). Pick the statement per DEC-0181/DEC-0182/DEC-0186: private helper `providerHoldsNoData(input)` (status `missing` and the acquisition outcome in `detail` equals `not_found`, key as pinned in T001) selects the no-recovery statement plus *No action in FactorFlow changes this.*; for `outdated`, a private helper compares `asOf` with `scoresDate` minus 6 months by ISO-string comparison (no `Date` parsing; clamp the day to the month's end) to choose the fundamentals or price sentence (momentum inputs are always price); `not_computable` states `reasonDetail` and no recovery; the recovery sentence links to Data health through `SHELL_ROUTES` as T001 records. Second block: the input `<dl>` per T006, ordered as received, with per-input status private components used once. The standardised score and every value go through `format.ts` only (STD-UI-3, DEC-0063). No `dangerouslySetInnerHTML`, no polarity colour, tokens through the Tailwind classes `screens/coverage/badges.tsx` uses.
- [ ] T011 Create `web/src/screens/research/stocks/index.tsx` with `export default function StockEvidenceScreen(): JSX.Element` (default export, following the delivered screens; DEC-0185; satisfies T004, T008, T009). Read `:symbol` from `useParams` (upper-cased for display only, sent as received) and the active tab from `useSearchParams` (`tab`, absent means Now). One evidence read per symbol through the client function recorded in T001, as a `ScreenState` from `web/src/api/types.ts` (`loading`, `populated`, `error`, `unreachable`; an `ApiError` `instrument_not_found` renders the not-found state of T004/T008, not `error`). Render the breadcrumb, the `h1` title (symbol and name, `status-neutral` *Not followed* badge for a retired stock) and the memberships line; then the WAI-ARIA tablist (private to this file: `role="tablist"`, `role="tab"` with `aria-selected`/`aria-controls`, `role="tabpanel"` labelled by its tab, roving `tabIndex`, Left/Right/Home/End keys). **Now** panel: three `FactorCard`s (value, growth, momentum) stacked at `--space-5`, then the STD-UI-18 sentence once in `--text-xs` `--muted-foreground`; compute the first card in reading order that shows a mark (cell or input) and render the STD-UI-17 sentence as a paragraph directly below that card with an id, passing that id so the first mark references it by `aria-describedby`; render the sentence only when a mark exists (DEC-0185). **Earlier scores** panel: `<HistoryTab symbol={symbol} />` (default import from `./history-tab`), mounted on first activation and then kept mounted (hidden when inactive). With `set: null`, render the DEC-0184 statement in place of the cards. Cap the page at 1180 px. Do not mount an as-of line, banner or poll (DEC-0184).

**Checkpoint**: T003 to T009 pass; `npx tsc --noEmit` is clean for the new files.

---

## Phase 4: Integration

**Purpose**: Confirm the screen is mountable by the shell composition story without touching it.

- [ ] T012 Verify, without editing `web/src/app/routes.tsx`, the shell or `history-tab.tsx`, that `StockEvidenceScreen` renders inside a bare `MemoryRouter` at `/research/stocks/AAPL` with only the classification client doubled, exports nothing the router must wrap, and leaves the delivered `routes.test.tsx` unchanged (routing is E4-S10). Confirm with `git diff --stat` that only `index.tsx`, `factor-card.tsx`, `factor-card.test.tsx`, `stock-evidence.test.tsx` and (if strings were missing) `copy.ts` changed. Run the full `npm run test` to confirm no delivered test regressed, including `render.test.tsx` (no raw HTML) and `copy.test.ts`.
- [ ] T013 Render both TC-COMP-116 and TC-COMP-192 once against the real `HistoryTab` (client doubled, not the component) to confirm the two panels' sentences never appear together: with Earlier scores active, STD-UI-18 and the Now-panel STD-UI-17 sentence are `hidden` and only the history panel's own occurrence (E5-S2, DEC-0180) is visible (DEC-0185). Add the assertion to `stock-evidence.test.tsx` if T004 did not already pin it.

**Checkpoint**: The full Vitest suite passes; only the listed files changed.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [ ] T014 Accessibility and token review of `factor-card.tsx` and `index.tsx` against ux-design 1.6 "Accessibility" and "Token Usage": page outline Symbol (`h1`), Value, Growth, Momentum (`h2`); input lists are `<dl>` with the label as `<dt>`; every status carries its word and a shape (badges, the triangle, the mark's glyph); a missing input is distinguishable from a measured zero and from a factor that could not be ranked in greyscale; tab keyboard behaviour per the WAI-ARIA tabs pattern; links have 24 px targets and visible focus; `--font-numeric` on every value and date. Add an `axe`-style assertion only if the delivered `shell.a11y.test.tsx` already uses one, mirroring it. Update the Notes of this file with the final exported names recorded in T001.
- [ ] T015 After each TDD cycle in T003–T014 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E5-S3-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Hard edges in `dependencies.yaml` (E5-S3 -> E5-S2, E4-S1, E4-S2, E4-S3) already cover every module this plan imports; verified against the producer map below. No edge is added.

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E5-S2 | hard | `history-tab.tsx` (`HistoryTab`) imported by `index.tsx`; already in the graph |
| CAP-002-E4-S1 | hard | `classification-client.ts` (stock evidence read) and `classification-types.ts`; already in the graph |
| CAP-002-E4-S2 | hard | `format.ts` (`formatScore`, `formatRatio`, `formatRate`) and `copy.ts`; already in the graph |
| CAP-002-E4-S3 | hard | `factor-cell.tsx` and `restated-mark.tsx` imported by `factor-card.tsx`; already in the graph |
| CAP-002-E3-S5 | soft | Serves `GET /api/classifications/stocks/{symbol}` (`StockEvidenceResponse`); this story codes against the approved contract with the client doubled, and the story's Dependencies names it as parallel development |
| CAP-002-E4-S4 | context | Owns `as-of-line.tsx`, `not-current-banner.tsx` and the poll; this story mounts none of them (DEC-0184), so no import exists |
| CAP-002-E4-S10 | reverse | Routes `/research/stocks/:symbol` to `StockEvidenceScreen`; the graph already carries E4-S10 -> E5-S3 |
| CAP-002-E5-S1 | context | Same epic; shares only E4-S3's mark and DEC-0176's sentence convention; no import either way |

### Task Dependencies
- T001: gate, no dependencies (blocks everything)
- T002: Depends on T001
- T003 to T009: Depend on T001, T002; T003, T005 to T007 share `factor-card.test.tsx` and T004, T008, T009 share `stock-evidence.test.tsx`, so write sequentially within each file
- T010: Depends on T003, T005, T006, T007
- T011: Depends on T004, T008, T009 and T010
- T012: Depends on T011
- T013: Depends on T012
- T014: Depends on T013
- T015: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: the `factor-card.test.tsx` group (T003, T005 to T007) and the `stock-evidence.test.tsx` group (T004, T008, T009) can be authored in parallel
- Phase 3: `factor-card.tsx` (T010) must precede `index.tsx` (T011), which imports it

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
- DAC-E5-S3-1 / TC-COMP-105: outdated fundamental card names the period end, the 6-month rule against the scores' date and the next-download recovery
- DAC-E5-S3-2 / TC-COMP-106: provider holds no data: no recovery sentence, no Data health link, *No action in FactorFlow changes this.*
- DAC-E5-S3-3 / TC-COMP-192: STD-UI-18 sentence once; STD-UI-17 sentence once, beside the first mark
- DAC-E5-S3-4 / TC-COMP-116: retired stock: *Not followed* on every factor; earlier scores in the history tab
- DAC-E5-S3-5 / TC-COMP-149: unknown symbol: not-found state with no cards
- `git diff --stat` shows only the files named in T012

---

## Notes

### Resolved Conflicts

1. **"download #{n}" wording.** Older text prints a download number; DEC-0083 (named by start time, linked to run detail) governs. This story renders no download reference (no as-of line, DEC-0184), so nothing is affected.
2. **Story "Not followed on every factor" vs UX 1.6 "Not followed since {date}. Earlier scores stand." per card.** The same rendering; the story requires the label, the UX statement adds a sentence whose date the wire does not carry (Open Gaps 3). No precedence conflict.
3. **UX 1.2/1.6 as-of line and banner on Stock evidence vs the approved story.** The story's description, ACs and Dependencies name neither and the graph carries no E5-S3 -> E4-S4 edge. Precedence ladder: approved story ACs outrank draft design prose, so the plan does not mount them (DEC-0184; same resolution as DEC-0175 for Compare).
4. **Component design 2.5 "the explanation sentence lives in the inspector and on the evidence page, never in the cell" vs "beside the first occurrence" (UX 1.6).** Consistent: the sentence is a page-level paragraph, not cell content; its slot is Open Gaps 4.
5. **Resolution register (`resolution-register-E5.md`) checked.** Its code-state claim holds: `web/src` has `app/`, `api/` and `screens/{settings,instruments,runs,coverage}` only; none of `components/patterns/*`, the CAP-002 fetch layer, the format/copy/query modules or `screens/research/*` exist, and routing is E4-S10's. Its pinned values match the designs read (evidence page 1180 px, `h1` symbol / `h2` per card, tabs **Now** / **Earlier scores** with the active tab in the URL, the three-part statement and recovery wording, DEC-0073/0075/0077/0063). Corrections and omissions: (a) it lists the evidence statement recovery as "The next Complete or Partial download will try again." with a no-recovery variant "No action in FactorFlow changes this." but does not say how the UI recognises "provider holds no data" (Open Gaps 1); (b) it says per-input status for `not_computable` is "value/em dash + plain text"; UX 1.6 and DEC-0077 match, but neither fixes a recovery for it (Open Gaps 6); (c) it does not mention that the evidence read carries no retirement date (Open Gaps 3) or no `later` block (Open Gaps 5); (d) it does not note that the history tab (E5-S2) renders its own STD-UI-17 sentence (DEC-0180), which this screen must not duplicate.

### Open Gaps

PROVISIONAL — awaiting owner confirmation (2026-10-17):

1. **Recognising "the provider holds no such data"** (DEC-0181). Derivation: factor-engine 2.4 and section 9 say such an input stays `missing` with the `not_found` acquisition outcome in `detail`; no artifact names the key or `InputRow.detail`'s type. The card tests one private helper for `missing` plus outcome `not_found` and gives every other missing or outdated input the next-download recovery; T001 pins the key from the landed types and stops if it is absent. Absorbing design: `component-design-classification-api.md` 2.7 (`InputRow.detail` shape) and `component-design-factor-engine.md` 2.4.
2. **Fundamentals versus price outdatedness** (DEC-0182). Derivation: the wire marks both as `outdated`; per factor-engine 2.4 all value and momentum inputs depend on price and growth on fundamentals, so the card uses `asOf` against the scores' date minus 6 months to choose the fundamentals sentence or the price sentence (momentum always price). A price stale by more than 6 months would read as the fundamentals sentence; accepted as a corner the design does not distinguish. Absorbing design: `component-design-classification-api.md` 2.7 (add an outdated cause) and `ux-design.md` 1.6 (the price-outdated statement's wording, which the UX text does not give).
3. **Retired stock's "since {date}"** (DEC-0183). Derivation: `StockEvidenceResponse` carries `lifecycle` but no date; the card reads *Not followed. Earlier scores stand.* without one. Absorbing design: `component-design-classification-api.md` 2.7 and `ux-design.md` 1.6 (add the stock's retirement date). The same gap is recorded for Compare in the E5-S1 plan (Open Gaps 4).
4. **Sentence placement, tabs and export names** (DEC-0185). Derivation: DEC-0176 and DEC-0180 (describedby plus one note); no tabs library exists in `web/package.json` and none is an AC, so a small WAI-ARIA tablist lives in `index.tsx`, with `?tab=earlier` in the URL; `StockEvidenceScreen` and `FactorCard` are default exports, as the delivered screens and E5-S2's `HistoryTab`. E4-S10 must import `StockEvidenceScreen` as a default. Absorbing design: `component-design-classification-ui.md` 2.1 and `ux-design.md` 1.6.
5. **As-of line, banner, poll and the never-populated reason** (DEC-0184). Derivation: no S3 AC requires them; the approved story lists dependencies E4-S1 to E4-S3 and E5-S2 only; the evidence read carries no `later` block. With `set: null` the screen states the no-score sentence only. The owner may add an E4-S4 hard edge and a follow-up task. Absorbing design: `ux-design.md` 1.6 and `component-design-classification-api.md` 2.7.
6. **Input formatting and the remaining card wording** (DEC-0186). Derivation: ratios through `formatRatio`, growth and returns through `formatRate` (DEC-0063) by `inputName`; `not_computable` states `reasonDetail` with no recovery line (no artifact says a download changes it); *Not enough to rank* uses the engine's `reasonDetail` verbatim because the evidence read has no factor summary. The disclosure of component periods and download outcome (UX 1.6) is not planned: `detail` is opaque and no S3 AC requires it. Absorbing design: `ux-design.md` 1.6 and `component-design-classification-api.md` 2.7.

Not decided by this plan and not blocking:

7. **Unit of growth and return input values on the wire.** The designs say `formatRate` yields a signed percentage at two decimals but do not state whether `value` is a fraction or a percent. T006 asserts the rendered text through E4-S2's `formatRate` contract; use whatever scaling that function documents, and record a mismatch to the owner rather than rescaling here.

### Other Notes

- Story references in this plan: CAP-002-E4-S1 (client and types), CAP-002-E4-S2 (format and copy), CAP-002-E4-S3 (factor cell and restated mark) and CAP-002-E5-S2 (history tab) are consumed; CAP-002-E3-S5 serves the evidence endpoint; CAP-002-E4-S10 routes to this screen; CAP-002-E4-S4 (as-of line, banner, poll) and CAP-002-E5-S1 are not consumed.
- The ACs are display-side only. The evidence read (E3-S5), the cell and mark (E4-S3), the history tab (E5-S2) and routing (E4-S10) are other stories.
- The restated mark never renders on momentum (E4-S3 DAC-E4-S3-3); the card passes `restatedPossible` straight through and adds no mark itself on that factor.
- Dates are wire strings throughout (STD-UI-5); the only date arithmetic is the ISO-string comparison of T010, which does not parse a `Date`.
- TC-COMP-105, 106, 116, 149 and 192 carry generic one-line steps in the test spec ("no further cases are invented"); T003 and T004 sharpen them into the concrete assertions above from DAC-E5-S3-1 to 5, which are the source of truth.
- Test files are co-located with sources, as the delivered screens do (`web/src/screens/coverage/*.test.tsx`).
