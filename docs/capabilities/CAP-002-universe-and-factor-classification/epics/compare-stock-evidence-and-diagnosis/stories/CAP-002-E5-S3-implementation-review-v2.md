---
artifact_schema_version: 1
artifact_id: CAP-002-E5-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-03
updated: 2026-11-03
story_id: "CAP-002-E5-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-03T10:02:33Z"
reviewed_head: "c0ca5cfc2c4bc01ab0cf6825a79fcf2247b20929"
review_base: "6e7b8b019cf98eef9ab96b4e289d7c18041fc2cc"
reviewed_state_revision: "sha256:04ccc1460940af3d6dda0fc0634a3542c42bf9cb20c97c1bfab4843ef8ccacac"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E5-S3
    artifact_version: 1
    content_revision: sha256:6457372fe6603ac52a00e02f12b9ba4c31435bb7e7249874c9cb1dcfdc718f97
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-11-03T10:02:33Z
  source_artifacts:
    - id: CAP-002-E5-S3
      version: "1 (sha256:6457372fe6603ac52a00e02f12b9ba4c31435bb7e7249874c9cb1dcfdc718f97)"
    - id: CAP-002-E5-S3-tasks
      version: "1 (updated 2026-11-03, last_reworked_review v1)"
    - id: CAP-002-E5-S3-tdd-evidence
      version: "cycle-1 to cycle-3"
    - id: CAP-002-E5-S3-implementation-review
      version: "1 (baseline, CHANGES-REQUIRED, reviewed_head 4c5945d)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0181
      version: "owner-upheld"
    - id: DEC-0182
      version: "owner-upheld"
    - id: DEC-0183
      version: "owner-upheld"
    - id: DEC-0184
      version: "owner-upheld"
    - id: DEC-0185
      version: "owner-upheld"
    - id: DEC-0186
      version: "owner-upheld"
    - id: DEC-0279
      version: "agent-decided, open"
    - id: DEC-0280
      version: "agent-decided, open"
    - id: STD-UI (ui-conventions)
      version: "current at review base"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E5-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 4 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 7/7 passed |

Rework commit `c0ca5cf` resolves both blocking findings of v1:

- **v1/IR-001.** The *Not enough to rank* card now prints the DEC-0186 sentence *Only 18 of 30 stocks qualified on value in this set, so no stock was ranked on it.* The string is in `copy.ts` and anchored in `copy.test.ts`, and the card test asserts the full sentence.
- **v1/IR-002.** A value card with three rows, where the reason input is the third, now kills the `inputs[0]` mutant. Two tests kill it.

The two v1 MEDIUM findings are also resolved. The lifecycle-retired mutants and the code and history-symbol mutants are all killed. The evidence read now discards a superseded response, and the screen already did so by remounting on a changed symbol.

Every required command passed when rerun. The TDD evidence lint is clean, and the three cycle patches replay onto the review base to reproduce HEAD's `web/` tree exactly. A scoped mutation run over the whole change set, including v1's ten manual mutants, killed 69 of 80. Every surviving mutant is shown to be equivalent except one.

That one is the only MEDIUM finding:

- **IR-001 (delta).** The factor named inside the new sentence is not pinned. Hard-coding *value* passes every test, because the only not-enough-to-rank card tested is a value card.

Four LOW findings remain. One is new: the tests that pin the specific reason input carry no TC marker (IR-002). Three are carried from v1: the STD-UI-29 size literals (IR-003), DEC-0280's error placement on Earlier scores (IR-004), and TDD evidence quality (IR-005).

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 4 · **total 5**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web frontend `web/src`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E5-S3-run-20261103T034434Z` |
| HEAD | `c0ca5cfc2c4bc01ab0cf6825a79fcf2247b20929` (`fix(research): CAP-002-E5-S3 story-coding rework of review v1`), over `e361707` (review v1) and `4c5945d` (story coding) |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` = `6e7b8b019cf98eef9ab96b4e289d7c18041fc2cc`, resolved by `pipeline-state.py review-base --base-ref`, an ancestor of HEAD |
| Working tree | clean: nothing staged, unstaged or untracked (non-ignored) before validation, after validation and after the mutation run |
| Changed files reviewed | 28 since the review base, 13 of them changed since the baseline |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `4c5945d2fc4f0e1c8213bfff5c06306e9724ce70`, with `CAP-002-E5-S3-implementation-review-v1-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/stocks/factor-card.tsx` | added (rework: `:289-296`) | T010; AC-13, AC-15, AC-17, AC-23, DAC-E5-2, DAC-E5-S3-1, DAC-E5-S3-2, DAC-E5-S3-4. Rework: v1/IR-001 |
| `web/src/screens/research/stocks/index.tsx` | added (rework: `:194-212`) | T011; DAC-E5-3, DAC-E5-5, DAC-E5-S3-3, DAC-E5-S3-4, DAC-E5-S3-5. Rework: v1/IR-005 |
| `web/src/screens/research/stocks/factor-card.test.tsx` | added (rework: `:470-474`, `:676-754`) | T003, T005, T006, T007; TC-COMP-105, TC-COMP-106. Rework: v1/IR-001, IR-002, IR-003 |
| `web/src/screens/research/stocks/stock-evidence.test.tsx` | added (rework: `:1`, `:457-487`, `:632-656`) | T004, T008, T009, T013; TC-COMP-116, TC-COMP-149, TC-COMP-192. Rework: v1/IR-003, IR-004, IR-005 |
| `web/src/screens/research/copy.ts` | modified (rework: `:825-830`) | T002. Rework: v1/IR-001 (`EVIDENCE.notEnoughToRankSentence`) |
| `web/src/screens/research/copy.test.ts` | modified (rework: `:538-541`) | T002's anchor for the new strings, recorded in the task plan's Implementation Notes |
| `.../stories/CAP-002-E5-S3.md` | modified | Story lifecycle: `status: planning` to `in-review` (story coding; not changed by the rework) |
| `.../stories/CAP-002-E5-S3-tasks.md` | modified | Checkboxes and Implementation Notes. Rework: `updated`, `last_reworked_review`, and the review v1 rework note (`:224`) |
| `.../stories/CAP-002-E5-S3-tdd-evidence.yaml` | added (rework: cycle-3, `:117-168`) | T015 |
| `.../stories/CAP-002-E5-S3-evidence/` (17 files: `build.log`, `cycle-1.patch` to `cycle-3.patch`, `full-suite.log`, `full-suite-cycle-3.log`, `green-cycle-1.log` to `green-cycle-3.log`, `mutants-cycle-1.json`, `mutants-cycle-2.json`, `mutation-cycle-1-results.json` to `mutation-cycle-3-results.json`, `red-cycle-1.log` to `red-cycle-3.log`) | added (5 by the rework) | T015 evidence cited by the TDD evidence file |
| `.../stories/CAP-002-E5-S3-implementation-review-v1.md`, `...-v1-mutation.json` | added | The baseline review and its mutation results (commit `e361707`) |

`web/src/app/`, `web/src/components/` and `history-tab.tsx` are untouched. `git diff --stat 6e7b8b0 HEAD -- web/src/app web/src/components web/src/screens/research/stocks/history-tab.tsx` is empty, as T012 requires. The rework changed nothing outside the files T012 lists, `copy.test.ts`, and the story's evidence.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | SATISFIED | `factor-card.tsx:95-107` (`sixMonthsBefore`: D minus 6 months, day clamped to the month's end, strict `<`; momentum always price), `:135-144`; `copy.ts` `fundamentalOutdatedReason`, `priceOutdatedReason` | TC-COMP-105 (`factor-card.test.tsx:64-101`); price sentence `:196-222`; boundary `:224-250`; clamping incl. leap year `:252-298`; momentum older than the rule `:568-572`; null as-of `:574-577` | Unchanged since v1. Every mutant on `:96-106` is killed except the equivalent `slice(8, 11)` |
| AC-15 (display side) | SATISFIED | `factor-card.tsx:34-36` (`isRetired` on lifecycle or reason), `:279-280`, `:303`; `index.tsx:113` (title badge) | TC-COMP-116 (`stock-evidence.test.tsx:145-187`); `factor-card.test.tsx:482-500`, `:513-528`, `:730-754`; `stock-evidence.test.tsx:475-487` | The lifecycle-retired-with-active-cells path is now pinned (v1/IR-003 resolved) |
| AC-17 | SATISFIED | `factor-card.tsx:200-222` (label as `<dt>`, value, *As of*, *Known on*, per-input status) | `factor-card.test.tsx:344-436`; TC-COMP-105, TC-COMP-106 | Dates are wire strings in `font-numeric`, em dash where null |
| AC-23 (display side) | SATISFIED | Cell mark through `FactorCell`; row mark `factor-card.tsx:216` (`RestatedMark`'s momentum guard); `index.tsx:147-168` | `factor-card.test.tsx:421-430`; TC-COMP-192 (`stock-evidence.test.tsx:206-235`) | Mark never on momentum, on the cell or a row |
| DAC-E5-2 | SATISFIED | `factor-card.tsx:115-157` (statement per reason), `:258-261` (the `reasonInput` row) | TC-COMP-105, TC-COMP-106; multi-row cards `factor-card.test.tsx:699-708`, `:710-728` | The statement names the cell's reason input among several rows. The pinning tests carry no TC marker: IR-002 |
| DAC-E5-3 (evidence side) | SATISFIED | `factor-card.tsx:279-280`; `index.tsx:323-330` (Earlier scores panel) | TC-COMP-116 | Compare belongs to CAP-002-E5-S1 |
| DAC-E5-5 (evidence side) | SATISFIED | `index.tsx:147-168` (sentence below the first card that shows a mark, once) | TC-COMP-192; `stock-evidence.test.tsx:237-252`, `:475-487` | No `aria-describedby` from any mark (DEC-0185 as amended by E5-F01). No sentence for a retired stock, whose marks are not drawn |
| DAC-E5-S3-1 | SATISFIED | `factor-card.tsx:135-144`, `:229-244` (recovery and Data health link via `SHELL_ROUTES.dataHealth`) | TC-COMP-105: exact rule sentence, period end `2026-03-28` in the row, recovery text and link `href` | The period end shows in the input row's *As of*, as T003 specifies |
| DAC-E5-S3-2 | SATISFIED | `factor-card.tsx:75-88` (`providerHoldsNoData`, runtime guards), `:120-130`, `:229-231` | TC-COMP-106 (`:103-173`); `:175-194`; multi-row `:699-708` | Every guard mutant on `:76-87` is killed |
| DAC-E5-S3-3 | SATISFIED | `index.tsx:147-168` | TC-COMP-192 (`:206-235`), `:237-252`; T013 `:254-270` | STD-UI-18 once. STD-UI-17 once, directly after the first marked card, absent with no mark, hidden with the Now panel on Earlier scores |
| DAC-E5-S3-4 | SATISFIED | `factor-card.tsx:257`, `:279-280`, `:303`; `index.tsx:113`, `:323-330` | TC-COMP-116 (three cards *Not followed* with the sentence, no `<dl>`, no *Incomplete*; history rows with percentiles after activating Earlier scores); `factor-card.test.tsx:730-754` | |
| DAC-E5-S3-5 | SATISFIED | `index.tsx:204-205`, `:219-237` | TC-COMP-149 (`:189-204`); `:499-509` | Sentence from `failureSentence` for `instrument_not_found`; no card, no tablist, no history read |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Implementation Notes, T001 | Unchanged since v1, which confirmed every upstream name independently (`getStockEvidence`, `ClassificationApiError extends ApiError`, `CurrentSet.latestTradingDay`, `InputRow.detail: unknown`, `SHELL_ROUTES`; `insert_inputs.sql` writes `last_acquisition.outcome`) |
| T002 | complete | VERIFIED | `copy.ts:813-865` | Every listed string is present. The DEC-0186 not-enough-to-rank sentence is `EVIDENCE.notEnoughToRankSentence` (`:829-830`), anchored at `copy.test.ts:538-541`. The 389-test `copy.test.ts` scan passes. `missingInputReason` and `unnamedInput` are recorded in DEC-0279 |
| T003 | complete | VERIFIED | `factor-card.test.tsx:64-173`, `:699-728` | Both TCs carry `// Implements TC-COMP-nnn` with every assertion T003 names. The multi-row cases pin the reason input: IR-002 |
| T004 | complete | VERIFIED | `stock-evidence.test.tsx:145-235` | TC-COMP-116, TC-COMP-149 and TC-COMP-192, with their markers, in the planned home |
| T005 | complete | VERIFIED | `factor-card.test.tsx:141-341`, `:555-643`, `:699-728` | All named cases present. The reason-input row is now pinned |
| T006 | complete | VERIFIED | `factor-card.test.tsx:344-436` | `<dl>`/`<dt>`, each status's form and token, formatter by input name, measured `0.00`, no `gain`/`loss` class |
| T007 | complete | VERIFIED | `factor-card.test.tsx:438-553`, `:730-754` | The full DEC-0186 sentence is asserted (`:470-474`). Retired overrides with `lifecycle: "retired"` are asserted. The factor inside the sentence is unpinned: IR-001 |
| T008 | complete | VERIFIED | `stock-evidence.test.tsx:277-453`, `:458-466` | The code-keyed sentence is now pinned with `validation_error`, whose sentence differs from the fallback |
| T009 | complete | VERIFIED | `stock-evidence.test.tsx:522-657`, `:468-473` | Roles, roving `tabIndex`, keys, URL query, mount on first activation, one read per symbol. `getStockHistory` receives the symbol as received |
| T010 | complete | VERIFIED | `factor-card.tsx` | `not_enough_stocks` renders `notEnoughToRankSentence(reasonDetail, factor label in lower case)` (`:289-296`). Everything else is as v1 verified |
| T011 | complete | VERIFIED | `index.tsx` | A local state union (DEC-0280). Runtime key check for `factors` (`:140`). No as-of line, banner or poll. The read effect discards a superseded response (`:194-212`). IR-003, IR-004 |
| T012 | complete | VERIFIED | `git diff --stat 6e7b8b0 HEAD` | `routes.tsx`, the shell and `history-tab.tsx` are untouched. `copy.test.ts` is the one file outside T012's list, recorded in the Notes. The full suite passes (1988 tests) |
| T013 | complete | VERIFIED | `stock-evidence.test.tsx:254-270` | Real `HistoryTab` with the client doubled. The Now panel's sentences are inside a `hidden` panel while Earlier scores is active |
| T014 | complete | VERIFIED | `index.tsx:110-114`, `factor-card.tsx:269-277`, `:303-309`; Notes | `h1` symbol, `h2` per factor, word plus shape on every status, tab buttons `min-h-6`, no axe assertion (none in `shell.a11y.test.tsx`). IR-003 |
| T015 | complete | VERIFIED | `CAP-002-E5-S3-tdd-evidence.yaml` | Lint clean with `--require-logs`. The three patches replay to HEAD's `web/` tree. Cycle 3 records APPROVED, no drift, `commit_hash: stage`, and a RED that failed three assertions. IR-005 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `names the period end, the 6-month rule ...` / TC-COMP-105 | ADEQUATE | `coverage-absent` *Incomplete*; exact fundamentals sentence; `2026-03-28` in the row; recovery text and the Data health link's `href` | Its own fixture still has one row. The reason-input lookup it relies on is pinned by `:699` and `:710` in the same file: IR-002 |
| `offers no recovery when the provider holds no data` / TC-COMP-106 | ADEQUATE | Exact no-data sentence naming *free-cash-flow yield*; *No action in FactorFlow changes this.*; no recovery, no Data health link; the engine's `last_acquisition` shape; six contrast shapes | Same as TC-COMP-105. `:699` is its multi-row form: IR-002 |
| `reads Not followed on every factor of a retired stock ...` / TC-COMP-116 | ADEQUATE | Title badge `status-neutral`; three regions each with *Not followed* and the sentence, no `<dl>`, no *Incomplete*; Earlier scores shows both rows' dates and percentiles from the real `HistoryTab` | none. The lifecycle override is now pinned by `factor-card.test.tsx:730-754` and `stock-evidence.test.tsx:475-487` |
| `shows a not-found state, not an empty card set ...` / TC-COMP-149 | ADEQUATE | Exact sentence; followed-stocks link `href`; no region, no tablist, no history read | none |
| `states the coverage sentence once and the restatement meaning once ...` / TC-COMP-192 | ADEQUATE | STD-UI-18 count 1; STD-UI-17 count 1 and `nextElementSibling` of the first marked card; not after the second; no `aria-describedby`; growth placement and no-mark absence in `:237-252` | none |
| Multi-row reason-input cards (`factor-card.test.tsx:699-728`) / T003, T005 | ADEQUATE | Value card with book-to-price, earnings yield and free-cash-flow yield, the third missing. The no-data sentence names free-cash-flow yield and neither other row. The plain missing sentence plus recovery uses the row's own `detail: {}` | Kills `factor-card.tsx:261:manual:3`. No TC marker: IR-002 |
| Three-part statement tests (`:141-341`, `:555-643`) / T005 | ADEQUATE | Six non-matching `detail` shapes; price sentence never contains the as-of or the scores' date; exact boundary; seven clamping cases; not-computable with and without detail; no payload key; generic noun for an unmatched row | none |
| Input list tests (`:344-436`) / T006 | ADEQUATE | Each status's word, `data-variant` and token class; both formatters by input name; wire dates in `font-numeric`; measured zero; mark on value rows, never on momentum | none |
| Card state tests (`:438-553`) / T007 | WEAK | Score beneath in `text-muted-foreground`; *Not enough to rank* `coverage-unknown` with the full DEC-0186 sentence and row statuses kept; retired badge, sentence and no `<dl>`; `h2` heading labelling the section; null reason detail prints no sentence | Only a value card reaches `not_enough_stocks`, so `factor-card.tsx:293:manual:4` (factor hard-coded to *value*) survives: IR-001 |
| Lifecycle-retired cards (`:730-754`) / T007 | ADEQUATE | `lifecycle: "retired"` with an incomplete cell: `status-neutral` *Not followed*, no *Incomplete*. With a scored classified cell: no `card-score`, no percentile, *Not followed* and its sentence | Kills `:279:manual:4` and `:281:manual:5` |
| `cardShowsMark` tests (`:645-674`) | ADEQUATE | True on a scored marked cell and on a marked row; false on momentum, unscored, unranked and retired | The two surviving guard removals are equivalent under the store's `factor_classification_shape` CHECK (as v1) |
| Screen state tests (`stock-evidence.test.tsx:277-453`) / T008 | ADEQUATE | Three-card skeleton; both no-score sentences with Earlier scores reachable; one missing factor key; error sentence with title kept and **Try again** rereading; generic sentence for a non-API error; shell unreachable state; title, breadcrumb, 1180 px; memberships; per-factor inputs; no as-of line or poll | none. The code-keyed sentence is pinned by `:458-466` |
| Symbol and header edges (`:456-520`) / T008, T009, T011 | ADEQUATE | `validation_error` sentence exactly; history read sent `"ko"` as received; retired stock with restated classified cells gets no STD-UI-17 sentence; symbol sent as received and shown in capitals; not-found header; unknown tab | Kills `index.tsx:301:manual:9`, `:322:manual:10` and `:148:manual:7` |
| Tab tests (`:522-657`) / T009 | ADEQUATE | Selection, `aria-controls`/`aria-labelledby`, roving `tabIndex`, query on click, keys with wrap and focus, one history read across switches, reset on a changed symbol; a late read for the previous symbol never overwrites the new one (`:633-656`) | `:633` pins the behaviour. Remounting on `key={symbol}` (`index.tsx:344`) supplies it, so it passes with or without the new guard (see the mutation table) |
| T013 panel isolation (`:254-270`) | ADEQUATE | Two STD-UI-17 occurrences in the DOM, one visible; STD-UI-18 hidden with the Now panel | none |
| `copy.test.ts` anchor (`:519-548`) | ADEQUATE | Exact text of every new string, including `notEnoughToRankSentence` | none |

All tests double the client with `vi.mock` and render real components (`FactorCell`, `RestatedMark`, `HistoryTab`, `UnreachableState`). They control no time, network or environment, and `vi.clearAllMocks` runs after each test. The rework's deferred promise in `:633` is settled inside `act`. The mocks return wire-faithful fixtures, so no expected result is built into the double.

### Mutation run

The catalogue generated 55 mutants over every changed production file with `scripts/mutation-run.py generate --range 6e7b8b0..HEAD --cycle review`: 23 negate-boolean and 32 off-by-one, in `copy.ts`, `factor-card.tsx` and `index.tsx`. This reviewer added 4 manual mutants on the rework's production lines:

- `index.tsx:198:manual:1` removes the `then` guard.
- `index.tsx:201:manual:2` removes the `catch` guard.
- `factor-card.tsx:293:manual:3` drops `.toLowerCase()`.
- `factor-card.tsx:293:manual:4` hard-codes the factor to *value*.

`scope --since 4c5945d --previous <v1-mutation.json>` added v1's mutants, including its 10 manual ones, and dropped one v1 mutant that no longer applies (`index.tsx:196:remove-attribute:1`). The scoped set is 80 mutants: 62 `carried`, 7 `delta` and 11 `late`. Some line-shifted catalogue mutants appear twice, once under v1's id and once under a new `late` id.

All 80 ran against `web/src/screens/research/stocks/` and `copy.test.ts` on four workers, all with green baselines. 69 were killed. Every v1 non-equivalent survivor is killed: `factor-card.tsx:261:manual:3`, `:279:manual:4`, `:281:manual:5`, `index.tsx:148:manual:7`, `:301:manual:9` and `:322:manual:10`. The 11 survivors are below.

| Survivor | Scope | Disposition | Reason |
|----------|-------|-------------|--------|
| `factor-card.tsx:100:off-by-one:2` (`slice(8, 11)`) | carried | equivalent | `classificationDate` is a 10-character `YYYY-MM-DD` wire string (classification-ui 2.4; STD-UI-5). As v1 |
| `index.tsx:182:off-by-one:1` (`useState(1)`) | carried | equivalent | `attempt` is only an effect dependency. As v1 |
| `index.tsx:307:off-by-one:1` (`count + 2`) | carried | equivalent | v1's **Try again** increment, located by its text at `:314`. Only a change matters. As v1 |
| `index.tsx:314:off-by-one:1` (`count + 2`) | late | equivalent | The same mutation under the line it now sits on |
| `factor-card.tsx:46:manual:1` (drop `status === "classified"`) | carried | equivalent | `component-design-research-store.md` `factor_classification_shape` forbids a `not_classified` cell with a percentile. As v1 |
| `factor-card.tsx:47:manual:2` (drop `percentile !== null`) | carried | equivalent | The same CHECK forbids a `classified` cell without one. As v1 |
| `index.tsx:184:manual:8` (`useState(false)`) | carried | equivalent | The render-phase update at `:188-190` sets the flag before the first commit. As v1 |
| `index.tsx:211:negate-boolean:1` (cleanup sets `superseded = false`) | delta | equivalent | See *Superseded guard* below. Agrees with the coder's cycle-3 disposition |
| `index.tsx:198:manual:1` (no `then` guard) | delta | equivalent | See *Superseded guard* below |
| `index.tsx:201:manual:2` (no `catch` guard) | delta | equivalent | See *Superseded guard* below |
| `factor-card.tsx:293:manual:4` (`FACTOR_LABELS.value`) | delta | **not equivalent** | A growth or momentum card would say *qualified on value*. DEC-0186 requires the sentence to say no stock was ranked on *the* factor: IR-001 |

**Superseded guard.** Within one mount of `EvidenceView`, the read effect depends on `symbol` and `attempt`. `symbol` cannot change inside a mount, because `StockEvidenceScreen` keys the view by symbol (`index.tsx:344`). A changed symbol unmounts the old view, and React drops that view's late state update. `attempt` changes only through **Try again**, which renders only in the error state, after the earlier read has settled. So in production no superseded read can settle into the view.

The one remaining case is React StrictMode's development-only double effect (`main.tsx`), where both reads ask for the same symbol. T011 specifies one read per symbol and the states it settles into. It leaves open which of two concurrent reads for the same symbol wins, and no referenced design or decision record specifies that. The guard is still worth keeping, as v1/IR-005 asked, but none of its mutants changes specified behaviour.

The results file is `CAP-002-E5-S3-implementation-review-v2-mutation.json`, beside this report (sha256 `1d47bafbc6097f83583bd91d485ebe7b614c414d5f70d8bc359222e83b8f98d1`).

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z --json` | harness root | 0 | PASS | `ready`: *review changes were reworked; a new review version is required*. Without `--base-ref`, the check reports `BLOCKED`, as in v1, because it compares against the default branch |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` | harness root | 0 | PASS | `6e7b8b019cf98eef9ab96b4e289d7c18041fc2cc`, an ancestor of HEAD (`merge-base --is-ancestor`) |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 6e7b8b019cf98eef9ab96b4e289d7c18041fc2cc --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `git apply --index cycle-1.patch`, `cycle-2.patch`, `cycle-3.patch` onto `6e7b8b0` in a scratch clone; `git diff --cached --stat c0ca5cf -- web/` | reviewer scratchpad | 0 | PASS | Empty diff: the patches reproduce HEAD's `web/` tree. `cycle-3.patch` sha256 equals the cycle's `diff_sha256` (`173e3e54…`) |
| `npx vitest run web/src/screens/research/stocks/factor-card.test.tsx web/src/screens/research/stocks/stock-evidence.test.tsx web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files, 479 tests (59 + 31 + 389) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 75 files, 1988 tests, incl. `render.test.tsx`, `copy.test.ts`, `routes.test.tsx`. Matches `full-suite-cycle-3.log` |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 169 files, no diagnostics |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome check mode: 169 files, no changes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules; writes the ignored `src/factorflow/api/static/` |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 6e7b8b019cf98eef9ab96b4e289d7c18041fc2cc..HEAD --cycle review --out $SCRATCH/mut/mutants.json` (`$SCRATCH` is the reviewer session's scratchpad, outside the component repo) | harness root | 0 | PASS | 55 mutants; 4 manual mutants appended |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/mut/mutants.json --since 4c5945d2fc4f0e1c8213bfff5c06306e9724ce70 --previous <v1-mutation.json> --out $SCRATCH/mut/mutants.json` | harness root | 0 | PASS | 80 mutants: 62 carried, 7 delta, 11 late; one v1 mutant no longer applies |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/mut/mutants.json --jobs 4 --command 'ln -sfn <abs>/repos/factorflow-v2/FactorFlow-v2/node_modules node_modules; npx vitest run web/src/screens/research/stocks/ web/src/screens/research/copy.test.ts' --out $SCRATCH/mut/results.json --logs $SCRATCH/mut/logs` | harness root | 3 | PASS (evidence) | Exit 3 signals survivors: 69 killed, 11 survived, dispositioned above. Copied beside this report |
| `python3 scripts/check-artifacts.py --project factorflow-v2 --artifact <this report> --strict` | harness root | 0 | PASS | Run after writing this report |
| `npm ci` | — | N/A | NOT RUN | Dependencies are already installed from the lockfile. Neither the story nor the plan lists it, and it would rewrite `node_modules` under the review subject |
| `npm run test:e2e` | — | N/A | NOT RUN | Not in the story's or plan's validation list. The story's E2E specs are test-design artifacts this story does not write, and none is in the change set |
| `uv sync`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | — | N/A | NOT RUN | The change set has no Python file, and the story's validation list is the five frontend commands above |

### Validation Side Effects

- Before: HEAD `c0ca5cf`, clean working tree, `code-revision` `sha256:04ccc1460940af3d6dda0fc0634a3542c42bf9cb20c97c1bfab4843ef8ccacac`.
- After: HEAD `c0ca5cf`, clean working tree, `code-revision` unchanged, after the validation commands and again after the mutation run. The test and build commands rewrote the git-ignored `src/factorflow/api/static/`, as `tech-stack.md` notes they do.
- Unexpected tracked-file changes: none. This review wrote only this report and its `-mutation.json`, both under `docs/`, which the fingerprint excludes.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | delta | The factor inside the DEC-0186 sentence is not pinned; hard-coding *value* survives |
| IR-002 | LOW | delta | The tests that pin the specific reason input carry no TC marker |
| IR-003 | LOW | carried | Two size literals outside the theme (STD-UI-29) |
| IR-004 | LOW | carried | On `?tab=earlier`, a failed evidence read is not shown in the active panel |
| IR-005 | LOW | carried | TDD evidence: cycle-2 count still wrong, and one rework test without RED |

### IR-001 — The factor inside the DEC-0186 sentence is not pinned; hard-coding *value* survives

- **Severity**: MEDIUM
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A (AC-14 display, cited by T007; not a story AC)
- **Tasks**: T007, T010
- **Files**: `web/src/screens/research/stocks/factor-card.tsx:289-296`; `web/src/screens/research/stocks/factor-card.test.tsx:447-480`
- **Claim challenged**: The rework's card test proves that the *Not enough to rank* card states DEC-0186's sentence for its own factor.
- **Observed evidence**: Manual mutant `factor-card.tsx:293:manual:4` replaces `FACTOR_LABELS[factor].toLowerCase()` with `FACTOR_LABELS.value.toLowerCase()`, and it passes every focused test. The only card test with `reasonCode: "not_enough_stocks"` and a `reasonDetail` that renders the sentence (`:447-480`) is a value card. `copy.test.ts:538-541` checks the template with `"value"` only. The sibling mutant that drops `.toLowerCase()` (`:293:manual:3`) is killed.
- **Expected evidence/behavior**: DEC-0186, owner-upheld: *reasonDetail ... rendered verbatim in a sentence saying no stock was ranked on the factor.* UX design 1.6 gives *Only {n} of 30 stocks qualified on value in this set, so no stock was ranked on it.* for the value card, so the factor is a slot in that sentence. T007 requires the sentence built from the card's `reasonDetail`.
- **Impact**: A regression that names the wrong factor would pass every test. A growth card would then read *Only 18 of 30 stocks qualified on value in this set*, telling the owner the wrong factor went unranked. The production code is correct today.
- **Required remediation**: Add a `not_enough_stocks` case on a growth or momentum card that asserts the exact sentence naming that factor (*... qualified on growth in this set ...*), so that `factor-card.tsx:293:manual:4` fails.

### IR-002 — The tests that pin the specific reason input carry no TC marker

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-2
- **Tasks**: T003, T005
- **Files**: `web/src/screens/research/stocks/factor-card.test.tsx:64-173`, `:676-728`; `docs/capabilities/CAP-002-universe-and-factor-classification/tests/coverage-matrix.md:84`
- **Claim challenged**: v1/IR-002's remediation, *give TC-COMP-106, and TC-COMP-105 or a T005 case, a realistic multi-row card*.
- **Observed evidence**: The multi-row cases sit in a new block, `FactorCard — review v1 rework`, with an `// IR-002` comment and no `// Implements TC-COMP-nnn` marker. In this run, `factor-card.tsx:261:manual:3` (`inputs[0]`) is killed only by `:699` and `:710`. Its log shows exactly those two failures. The TC-COMP-105 and TC-COMP-106 tests still use single-row fixtures.
- **Expected evidence/behavior**: The coverage matrix maps DAC-E5-2, *name the specific missing or outdated input*, to TC-COMP-105 and TC-COMP-106 only. The skill requires mandatory TCs to keep their traceability to the specification. The tests that discharge DAC-E5-2's *specific* clause should be traceable to those TCs.
- **Impact**: Evidence quality only. The behaviour is pinned today. A later clean-up that removes a block named after a review, rather than after a TC, would lose the pin while every TC-marked test stays green.
- **Required remediation**: Mark `:699` as TC-COMP-106 coverage and `:710` as T005, or fold the multi-row rows into the TC-COMP-106 test itself.

### IR-003 — Two size literals outside the theme (STD-UI-29)

- **Severity**: LOW
- **Scope**: carried (v1/IR-006)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011, T014
- **Files**: `web/src/screens/research/stocks/index.tsx:126` (`h-24`), `:221` and `:270` (`max-w-[1180px]`)
- **Claim challenged**: T014's token review.
- **Observed evidence**: Unchanged since v1. `max-w-[1180px]` is an arbitrary Tailwind value with no theme token behind it. `h-24` comes from Tailwind's default height scale, which `tailwind.config.js` describes as literals rather than tokens. The task plan's rework note (`:224`) leaves both for the owner, with no code change.
- **Expected evidence/behavior**: STD-UI-29: *No spacing, size or colour literal appears outside the theme.* UX design 1.6 and T011 fix the 1180 px cap without naming a token.
- **Impact**: Low. Delivered code has precedents (`results-pane.tsx` `min-w-[40rem]`, `set-history-dialog.tsx` `h-20`).
- **Required remediation**: Express the cap and the skeleton height as theme tokens, or have the owner accept the departure.

### IR-004 — On `?tab=earlier`, a failed evidence read is not shown in the active panel

- **Severity**: LOW
- **Scope**: carried (v1/IR-007)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T008, T011
- **Files**: `web/src/screens/research/stocks/index.tsx:295-322`
- **Claim challenged**: An `ApiError` *"renders the error state in the active panel"* (T008).
- **Observed evidence**: Unchanged since v1. The error body renders only in the Now panel. On `/research/stocks/KO?tab=earlier`, a rejected evidence read with a successful history read shows the history rows and a title without a name. No failure sentence or **Try again** is visible. DEC-0280 (agent-decided, open) records this placement. The task plan's rework note leaves it for the owner.
- **Expected evidence/behavior**: T008, and UX design 1.6 States, *Error*: *"the active panel replaced by the operation, resource, reason and **Try again**."*
- **Impact**: A failed read is not visible on the tab the URL opened. The choice is recorded, so it is not a silent assumption.
- **Required remediation**: The owner confirms DEC-0280's placement clause when reviewing it, or the evidence-read failure is shown where it is visible on either tab. No code change is needed if the owner upholds it.

### IR-005 — TDD evidence: cycle-2 count still wrong, and one rework test without RED

- **Severity**: LOW
- **Scope**: carried (v1/IR-008)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T015
- **Files**: `CAP-002-E5-S3-tdd-evidence.yaml:82`, `:131-137`; `CAP-002-E5-S3-evidence/red-cycle-3.log`, `green-cycle-3.log`
- **Claim challenged**: Cycle 3 says *"IR-008 is addressed by this entry (RED observed as a behavioural assertion failure, accurate counts)."*
- **Observed evidence**: Cycle 3 improves on cycles 1 and 2. Its RED fails three assertions, and its counts are accurate: 535 focused and 1988 full, both reproduced here. Three gaps remain:
  - Cycle 2's `green_evidence` still reports *75 files, 1976 tests* (`:82`). `full-suite.log` and v1's rerun show 1979.
  - `stock-evidence.test.tsx` has 30 tests in `red-cycle-3.log` and 31 in `green-cycle-3.log`. The superseded-read test (`:633`) was added after the RED run. `red_evidence` says the RED ran *with the rework tests written*, and it does not mention that test.
  - The `validation_error` RED failed on a mistyped expectation, not on behaviour. `red_evidence` discloses this.
- **Expected evidence/behavior**: T015 asks for each cycle's RED and GREEN evidence with accurate counts. v1/IR-008 asked to correct the count and record RED for tests added in a rework cycle. The lint is clean, so this concerns evidence quality only.
- **Impact**: Evidence quality only. This review's mutation run establishes regression sensitivity independently, apart from IR-001.
- **Required remediation**: Correct cycle 2's count, and state in the next cycle's RED evidence every test written after the RED run.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | `copy.ts:829-830` `EVIDENCE.notEnoughToRankSentence`, anchored at `copy.test.ts:538-541`. `factor-card.tsx:289-296` renders it with the card's factor label. `factor-card.test.tsx:470-474` asserts the full sentence, and `red-cycle-3.log` shows that assertion failing on the bare fragment before the change. Mutant `:293:manual:3` is killed. The factor slot is unpinned: v2/IR-001 |
| v1/IR-002 (HIGH) | RESOLVED | `factor-card.test.tsx:699-708` and `:710-728` give a value card three rows with the reason input third. `factor-card.tsx:261:manual:3` (`inputs[0]`) is killed by both. Traceability residue: v2/IR-002 |
| v1/IR-003 (MEDIUM) | RESOLVED | `factor-card.test.tsx:730-741` kills `:279:manual:4`. `:743-754` kills `:279:manual:4` and `:281:manual:5`. `stock-evidence.test.tsx:475-487` kills `index.tsx:148:manual:7` |
| v1/IR-004 (MEDIUM) | RESOLVED | `stock-evidence.test.tsx:458-466` (`validation_error`) kills `index.tsx:301:manual:9`. `:468-473` (`getStockHistory` called with `"ko"`) kills `:322:manual:10`. The display-versus-send trade-off is recorded in the task plan's Notes (`:224`), as v1 asked |
| v1/IR-005 (LOW) | RESOLVED | `index.tsx:194-212` discards a superseded response, like the sibling `history-tab.tsx`. `stock-evidence.test.tsx:633-656` asserts the behaviour. The guard's mutants are equivalent (Mutation run, *Superseded guard*) |
| v1/IR-006 (LOW) | STILL OPEN | `index.tsx:126`, `:221`, `:270` unchanged, and left for the owner in the task plan's Notes: v2/IR-003 |
| v1/IR-007 (LOW) | STILL OPEN | `index.tsx:295-322` unchanged, and left for the owner (DEC-0280): v2/IR-004 |
| v1/IR-008 (LOW) | STILL OPEN | Cycle 3 is better evidenced, but cycle 2's count is uncorrected and one rework test has no RED: v2/IR-005 |

## Scope and Plan Deviations

- **`copy.test.ts` outside T012's file list.** Justified: it is T002's anchor for the new strings, recorded in the task plan's Implementation Notes.
- **Local state union instead of `ScreenState` (DEC-0280).** Justified and recorded. The placement clause is IR-004.
- **Unlisted wording `missingInputReason` and `unnamedInput` (DEC-0279).** Recorded as provisional and open for the owner. Both are display labels.
- **`cardShowsMark` exported from `factor-card.tsx`; `NotFollowedBadge` in `index.tsx:48-61`.** Unchanged since v1 and justified there.
- **The Earlier scores panel receives the symbol as received.** T011 asks for the symbol upper-cased for display and sent as received, and `HistoryTab` has a single `symbol` prop. The plan's rework note (`:224`) records that `/research/stocks/ko` therefore labels the history table *Earlier scores for ko*, and leaves the trade-off for the owner. The production code follows the send-as-received half, which `:468-473` now pins.
- **Rework commit trailers.** `c0ca5cf` carries `Decision-Id: DEC-0279` and `Decision-Id: DEC-0280`, the two decisions the story's code already rests on. The rework itself introduced no new decision.
- **Task plan header.** The `Branch` line still names the planning branch. This has no effect.
- **Empty `.claude/.cc-writes/` directory.** It sits inside `CAP-002-E5-S3-evidence/` and git cannot see it, so it is outside the review set. It is a harness artifact.
- **State check.** As in v1, the check needs the supervised run's integration ref to report `READY`. This review used it, as the skill directs.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E5-S3 against this report. IR-001 and IR-002 are cheap test additions that the next change to `factor-card.test.tsx` can absorb. IR-003 and IR-004 are owner decisions: the STD-UI-29 departure, and DEC-0280's placement clause. IR-005 concerns evidence quality only.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004, IR-005
