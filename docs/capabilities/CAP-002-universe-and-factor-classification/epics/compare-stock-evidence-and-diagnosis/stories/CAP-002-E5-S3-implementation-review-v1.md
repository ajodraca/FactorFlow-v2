---
artifact_schema_version: 1
artifact_id: CAP-002-E5-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-03
updated: 2026-11-03
story_id: "CAP-002-E5-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-03T09:10:50Z"
reviewed_head: "4c5945d2fc4f0e1c8213bfff5c06306e9724ce70"
review_base: "6e7b8b019cf98eef9ab96b4e289d7c18041fc2cc"
reviewed_state_revision: "sha256:1271fac41a65485fec846ee78279e213964fcd70911c1313f07330ce9b3edc7c"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-03T09:23:17Z
  source_artifacts:
    - id: CAP-002-E5-S3
      version: "1 (sha256:6457372fe6603ac52a00e02f12b9ba4c31435bb7e7249874c9cb1dcfdc718f97)"
    - id: CAP-002-E5-S3-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E5-S3-tdd-evidence
      version: "cycle-1 and cycle-2"
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

# Implementation Review: CAP-002-E5-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 2 |
| Low findings | 4 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 12/15 verified |
| Required validation | 7/7 passed |

`factor-card.tsx` and `index.tsx` deliver the Stock evidence screen the story describes. The three-part statements use the right rule against the scores' date, with the day clamped to the month's end. The price sentence takes its date from `latestTradingDay`. `providerHoldsNoData` narrows `detail: unknown` at runtime. Each input row shows its own status, value, *As of* and *Known on*. The retired, not-found, never-scored and began-following-later states render as the owner-upheld DEC-0181 to DEC-0185 specify. The two page sentences appear once and in the right place. Every required command passed when rerun independently. The TDD evidence lint is clean, and the two cycle patches replay onto the review base to reproduce HEAD's `web/` tree exactly. All twelve acceptance criteria are met by the production code.

Two HIGH findings block the gate:

- **IR-001.** The *Not enough to rank* card prints the engine's bare fragment *18 of 30 stocks qualified*. DEC-0186, upheld by the owner, requires that fragment inside a sentence saying no stock was ranked on the factor. T002 required that sentence in `copy.ts`, and it is absent, so T002, T007 and T010 are `PARTIAL`.
- **IR-002.** The mandatory tests TC-COMP-105 and TC-COMP-106 are the only coverage of DAC-E5-2, which requires naming the *specific* missing or outdated input. They never give a card more than one input row. A mutant that names the first row instead of the cell's `reasonInput` survives.

The two MEDIUM findings are non-equivalent survivors in additional tests:

- **IR-003.** A stock retired after its current set was built is not pinned.
- **IR-004.** The error sentence's code and the symbol `HistoryTab` receives are not pinned.

Four LOW findings cover a missing stale-response guard, two STD-UI-29 size literals, DEC-0280's error placement on the Earlier scores tab, and TDD evidence quality.

**By severity:** CRITICAL 0 · HIGH 2 · MEDIUM 2 · LOW 4 · **total 8**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web frontend `web/src`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E5-S3-run-20261103T034434Z` |
| HEAD | `4c5945d2fc4f0e1c8213bfff5c06306e9724ce70` (`feat(research): CAP-002-E5-S3 story-coding`, the only commit since the base) |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` = `6e7b8b019cf98eef9ab96b4e289d7c18041fc2cc`, resolved by `pipeline-state.py review-base --base-ref`, an ancestor of HEAD |
| Working tree | clean: nothing staged, unstaged or untracked (non-ignored) before and after validation |
| Changed files reviewed | 21 |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/stocks/factor-card.tsx` | added | T010; AC-13, AC-15, AC-17, AC-23, DAC-E5-2, DAC-E5-S3-1, DAC-E5-S3-2, DAC-E5-S3-4 |
| `web/src/screens/research/stocks/index.tsx` | added | T011; DAC-E5-3, DAC-E5-5, DAC-E5-S3-3, DAC-E5-S3-4, DAC-E5-S3-5 |
| `web/src/screens/research/stocks/factor-card.test.tsx` | added | T003, T005, T006, T007; TC-COMP-105, TC-COMP-106 |
| `web/src/screens/research/stocks/stock-evidence.test.tsx` | added | T004, T008, T009, T013; TC-COMP-116, TC-COMP-149, TC-COMP-192 (test home per Resolved Conflicts 6 and E5-F06) |
| `web/src/screens/research/copy.ts` | modified | T002 (new strings at `:835-858`) |
| `web/src/screens/research/copy.test.ts` | modified | T002 anchor for the new strings (`:519-544`). Not in T012's file list; the deviation is recorded in the task plan's Implementation Notes |
| `.../stories/CAP-002-E5-S3.md` | modified | Story lifecycle: `status: planning` to `in-review` (story-coding) |
| `.../stories/CAP-002-E5-S3-tasks.md` | modified | Checkboxes; T001 and T014 Notes (Implementation Notes section) |
| `.../stories/CAP-002-E5-S3-tdd-evidence.yaml` | added | T015 |
| `.../stories/CAP-002-E5-S3-evidence/` (12 files: `build.log`, `cycle-1.patch`, `cycle-2.patch`, `full-suite.log`, `green-cycle-1.log`, `green-cycle-2.log`, `mutants-cycle-1.json`, `mutants-cycle-2.json`, `mutation-cycle-1-results.json`, `mutation-cycle-2-results.json`, `red-cycle-1.log`, `red-cycle-2.log`) | added | T015 evidence cited by the TDD evidence file |

`web/src/app/`, `web/src/components/` and `history-tab.tsx` are untouched (`git diff --stat 6e7b8b0 HEAD -- web/src/app web/src/components web/src/screens/research/stocks/history-tab.tsx` is empty), as T012 requires.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | SATISFIED | `factor-card.tsx:95-107` (`sixMonthsBefore`: D minus 6 months by field arithmetic, day clamped to the month's end, strict `<`; momentum always price), `:135-144`; `copy.ts` `fundamentalOutdatedReason`, `priceOutdatedReason` | TC-COMP-105 (`factor-card.test.tsx:64-101`); price sentence `:196-222`; boundary `:224-250`; seven clamping cases incl. leap year `:252-298`; momentum older than the rule `:564-568`; null as-of `:570-573` | Every mutant on `:96-106` except one equivalent slice widening is killed. Which row drives the sentence is not pinned: IR-002 |
| AC-15 (display side) | SATISFIED | `factor-card.tsx:34-36` (`isRetired` on lifecycle or reason), `:279-280`, `:298`; `index.tsx:113` (title badge) | TC-COMP-116 (`stock-evidence.test.tsx:145-187`); `factor-card.test.tsx:478-496`, `:509-524` | The lifecycle-retired-with-active-cells path is unpinned: IR-003 |
| AC-17 | SATISFIED | `factor-card.tsx:200-222` (label as `<dt>`, value, *As of*, *Known on*, per-input status) | `factor-card.test.tsx:344-436`; TC-COMP-105, TC-COMP-106 | Dates are wire strings in `font-numeric`, em dash where null |
| AC-23 (display side) | SATISFIED | Cell mark through `FactorCell` (`factor-cell.tsx:159`); row mark `factor-card.tsx:216` (`RestatedMark`'s own momentum guard); `index.tsx:147-165` | `factor-card.test.tsx:421-430`; TC-COMP-192 (`stock-evidence.test.tsx:206-252`) | Mark never on momentum, cell or row |
| DAC-E5-2 | SATISFIED | `factor-card.tsx:115-157` (statement per reason), `:258-261` (the `reasonInput` row) | TC-COMP-105, TC-COMP-106; `factor-card.test.tsx:141-173`, `:300-341` | Production names the reason input's label. No test discriminates it among several rows: IR-002 |
| DAC-E5-3 (evidence side) | SATISFIED | `factor-card.tsx:279-280`; `index.tsx:316-323` (Earlier scores panel) | TC-COMP-116 | Compare is CAP-002-E5-S1's |
| DAC-E5-5 (evidence side) | SATISFIED | `index.tsx:147-168` (sentence below the first card showing a mark, once) | TC-COMP-192; `stock-evidence.test.tsx:237-270` | No `aria-describedby` from any mark (DEC-0185 as amended by E5-F01) |
| DAC-E5-S3-1 | SATISFIED | `factor-card.tsx:135-144`, `:229-244` (recovery and Data health link via `SHELL_ROUTES.dataHealth`) | TC-COMP-105: exact rule sentence, the period end `2026-03-28` in the row, recovery and link `href` | The period end is shown in the input row's *As of*, as T003 specifies |
| DAC-E5-S3-2 | SATISFIED | `factor-card.tsx:75-88` (`providerHoldsNoData`: runtime guards, no assertion over the unchecked value), `:120-130`, `:229-231` | TC-COMP-106; six contrast shapes `:141-173`; outdated with `not_found` `:175-194` | Every guard mutant on `:76-87` is killed |
| DAC-E5-S3-3 | SATISFIED | `index.tsx:147-168` | TC-COMP-192 (`:206-235`), `:237-252`; T013 `:254-270` | STD-UI-18 once; STD-UI-17 once, directly after the first marked card, absent with no mark; hidden with the Now panel when Earlier scores is active |
| DAC-E5-S3-4 | SATISFIED | `factor-card.tsx:257`, `:279-280`, `:298`; `index.tsx:113`, `:316-323` | TC-COMP-116 (three cards *Not followed* with the sentence, no `<dl>`, no *Incomplete*; history rows with percentiles after activating Earlier scores) | IR-003 |
| DAC-E5-S3-5 | SATISFIED | `index.tsx:200-201`, `:212-230` | TC-COMP-149 (`:189-204`); `:467-477` | Sentence from `ERROR_SENTENCES.instrument_not_found`; no card, no tablist, no history read |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Implementation Notes, T001 | Independently confirmed: `getStockEvidence` (`classification-client.ts:818`), `ClassificationApiError extends ApiError` (`:407`), `CurrentSet.latestTradingDay: string` (`classification-types.ts:56`), `InputRow.detail: unknown` (`:126`), `SHELL_ROUTES` in `copy.ts:41-45`. `insert_inputs.sql:11-13` merges `last_acquisition.outcome`, so the DEC-0181 key holds |
| T002 | complete | PARTIAL | `copy.ts:835-858` | Every listed string is present except *the not-enough-to-rank sentence built from the card's `reasonDetail` (DEC-0186)*: IR-001. `missingInputReason` and `unnamedInput` are unlisted strings recorded in DEC-0279 |
| T003 | complete | VERIFIED | `factor-card.test.tsx:64-173` | Both TCs carry `// Implements TC-COMP-nnn`, with every assertion T003 names. The tests are `WEAK` on which row the statement uses: IR-002 |
| T004 | complete | VERIFIED | `stock-evidence.test.tsx:145-235` | TC-COMP-116, TC-COMP-149 and TC-COMP-192 implemented with their markers in the planned home |
| T005 | complete | VERIFIED | `factor-card.test.tsx:141-341`, `:551-639` | All named cases present. `WEAK` on the reason-input row: IR-002 |
| T006 | complete | VERIFIED | `factor-card.test.tsx:344-436` | `<dl>`/`<dt>`, each status's form and token, formatter by input name, measured `0.00`, no `gain`/`loss` class |
| T007 | complete | PARTIAL | `factor-card.test.tsx:438-549` | The not-enough-to-rank assertion is a regex that the bare fragment satisfies, so the DEC-0186 sentence is neither built nor asserted: IR-001. The lifecycle override test is `WEAK`: IR-003 |
| T008 | complete | VERIFIED | `stock-evidence.test.tsx:277-453` | All named states present. `WEAK` on the code-keyed sentence: IR-004 |
| T009 | complete | VERIFIED | `stock-evidence.test.tsx:490-599`, `:479-487` | Roles, roving `tabIndex`, Left/Right/Home/End, URL query, mount on first activation, one read per symbol. `HistoryTab`'s symbol is unpinned: IR-004 |
| T010 | complete | PARTIAL | `factor-card.tsx` | Everything T010 names is present and correct, except the `not_enough_stocks` state, which renders `reasonDetail` bare (`:289-291`) instead of the `reasonDetail` sentence: IR-001 |
| T011 | complete | VERIFIED | `index.tsx` | A local state union instead of `ScreenState` (DEC-0280, recorded). Runtime key check for `factors` (`:140`). No as-of line, banner or poll. IR-005, IR-006, IR-007 |
| T012 | complete | VERIFIED | `git diff --stat 6e7b8b0 HEAD` | `routes.tsx`, the shell and `history-tab.tsx` are untouched. `copy.test.ts` is the one file outside T012's list, recorded in the Notes. The full suite passes (1979 tests) |
| T013 | complete | VERIFIED | `stock-evidence.test.tsx:254-270` | Real `HistoryTab`, client doubled; the Now panel's STD-UI-18 and STD-UI-17 occurrences are inside a `hidden` panel while Earlier scores is active |
| T014 | complete | VERIFIED | `index.tsx:110-114`, `factor-card.tsx:269-277`, `:299-303`; Notes | `h1` symbol, `h2` per factor; word plus shape on every status; tab buttons `min-h-6`; no axe assertion, matching `shell.a11y.test.tsx`. IR-006 |
| T015 | complete | VERIFIED | `CAP-002-E5-S3-tdd-evidence.yaml` | Lint clean with `--require-logs`; the patches replay to HEAD; both cycles record APPROVED, no drift, `commit_hash: stage`. IR-008 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `names the period end, the 6-month rule ...` / TC-COMP-105 | WEAK | `coverage-absent` *Incomplete*; exact fundamentals sentence; `2026-03-28` in the row; recovery text and the Data health link's `href` | One input row only, so naming the `reasonInput` row is unpinned (`factor-card.tsx:261:manual:3` survives): IR-002 |
| `offers no recovery when the provider holds no data` / TC-COMP-106 | WEAK | Exact no-data sentence naming *free-cash-flow yield*; *No action in FactorFlow changes this.*; no recovery, no Data health link; the engine's `last_acquisition` shape | Same single-row fixture: IR-002 |
| `reads Not followed on every factor of a retired stock ...` / TC-COMP-116 | ADEQUATE | Title badge `status-neutral`; three regions each with *Not followed* and the sentence, no `<dl>`, no *Incomplete*; Earlier scores shows both rows' dates and percentiles from the real `HistoryTab` | The fixture is T004's (reason `retired` cells); the lifecycle-override path is IR-003 |
| `shows a not-found state, not an empty card set ...` / TC-COMP-149 | ADEQUATE | Exact sentence; followed-stocks link `href`; no region, no tablist, no history read | none |
| `states the coverage sentence once and the restatement meaning once ...` / TC-COMP-192 | ADEQUATE | STD-UI-18 count 1; STD-UI-17 count 1 and `nextElementSibling` of the first marked card (an Incomplete card marked by its row); not after the second; no `aria-describedby`; growth placement and no-mark absence in `:237-252` | none for active stocks; the retired case is IR-003 |
| Three-part statement tests (`factor-card.test.tsx:141-341`, `:551-639`) / T005 | WEAK | Six non-matching `detail` shapes; price sentence never contains the as-of or the scores' date; exact boundary; seven clamping cases; not-computable with and without detail; no payload key; generic noun for an unmatched row | Single-row fixtures: IR-002 |
| Input list tests (`:344-436`) / T006 | ADEQUATE | Each status's word, `data-variant` and token class; both formatters by input name; wire dates in `font-numeric`; measured zero; mark on value rows and never on momentum | none |
| Card state tests (`:438-549`) / T007 | WEAK | Score beneath in `text-muted-foreground`; *Not enough to rank* `coverage-unknown` keeps row statuses; retired badge, sentence and no `<dl>`; `h2` heading labelling the section; aria-hidden swatch with the factor token | The not-enough-to-rank sentence is asserted by a regex the bare fragment satisfies: IR-001. The retired override asserts only the sentence (`factor-card.tsx:279:manual:4`, `:281:manual:5` survive): IR-003 |
| `cardShowsMark` tests (`:641-670`) | ADEQUATE | True on a scored marked cell and on a marked row; false on momentum, unscored, unranked and retired | The two surviving guard removals are equivalent under the store's `factor_classification_shape` CHECK |
| Screen state tests (`stock-evidence.test.tsx:277-453`) / T008 | WEAK | Three-card skeleton; both no-score sentences with Earlier scores reachable; one missing factor key; error sentence, envelope message absent, title kept, **Try again** rereads; generic sentence for a non-API error; shell unreachable state; title, breadcrumb and 1180 px class; memberships with links, *and* and commas; per-factor inputs; no as-of line or poll | The only API-error fixture is `internal_error`, whose sentence equals the no-code fallback (`index.tsx:301:manual:9` survives): IR-004 |
| Symbol, header and tab tests (`:456-599`) / T009 | WEAK | Symbol sent as received and displayed in capitals; not-found header; unknown tab falls back; selection, `aria-controls`/`aria-labelledby`, roving `tabIndex`, query on click, keys with wrap and focus, one history read across switches, reset on a changed symbol | The symbol handed to `HistoryTab` is unpinned (`index.tsx:322:manual:10` survives): IR-004 |
| T013 panel isolation (`:254-270`) | ADEQUATE | Two STD-UI-17 occurrences in the DOM, one visible; STD-UI-18 hidden with the Now panel | none |
| `copy.test.ts` anchor (`:519-544`) | ADEQUATE | Exact text of every new string, including both `notComputableReason` forms | The DEC-0186 string does not exist to be anchored: IR-001 |

All tests double the client with `vi.mock` and render real components (`FactorCell`, `RestatedMark`, `HistoryTab`, `UnreachableState`). They control no time, network or environment, and `vi.clearAllMocks` runs after each test. The mocks return wire-faithful fixtures, so no expected result is built into the double.

### Mutation run

The catalogue generated 53 mutants with `scripts/mutation-run.py generate --range 6e7b8b0..HEAD --cycle review` over every changed production file: 20 negate-boolean, 32 off-by-one and 1 remove-attribute. They cover `copy.ts` (1), `factor-card.tsx` (34) and `index.tsx` (18). This reviewer added 10 manual mutants (`operator: manual`) at points the catalogue cannot reach: multi-line guards, the retired-cell override, the reason-input lookup, the error code and the screen wiring. All 63 ran against `web/src/screens/research/stocks/` and `copy.test.ts`, on four workers whose baselines were green. 51 were killed. The 12 survivors are below.

| Survivor | Disposition | Reason |
|----------|-------------|--------|
| `factor-card.tsx:100:off-by-one:2` (`slice(8, 11)`) | equivalent | `classificationDate` is a 10-character `YYYY-MM-DD` wire string (classification-ui 2.4; STD-UI-5), so the widened slice returns the same day. Agrees with the coder |
| `index.tsx:182:off-by-one:1` (`useState(1)`) | equivalent | `attempt` is only an effect dependency (`:206`), and nothing reads its value or specifies it. Agrees with the coder |
| `index.tsx:307:off-by-one:1` (`count + 2`) | equivalent | Same: only a change matters. Agrees with the coder |
| `factor-card.tsx:46:manual:1` (drop `status === "classified"`) | equivalent | It differs only for a `not_classified` cell with a percentile. `component-design-research-store.md` `factor_classification_shape` forbids that cell |
| `factor-card.tsx:47:manual:2` (drop `percentile !== null`) | equivalent | It differs only for a `classified` cell without a percentile, which the same CHECK forbids |
| `index.tsx:184:manual:8` (`useState(false)`) | equivalent | The render-phase update at `:188-190` sets the flag before the first commit whenever `tab` is `earlier`, so the DOM and the reads are identical |
| `factor-card.tsx:261:manual:3` (`inputs[0]`) | **not equivalent** | The statement would name the first row instead of the cell's reason input (DAC-E5-2): IR-002 |
| `factor-card.tsx:279:manual:4` (`cell={cell}`) | **not equivalent** | A lifecycle-retired stock with active-time cells would show *Incomplete* or a percentile (DEC-0183, AC-15): IR-003 |
| `factor-card.tsx:281:manual:5` (`{true &&`) | **not equivalent** | Such a stock's card would print a standardised score under *Not followed*: IR-003 |
| `index.tsx:148:manual:7` (`"active"`) | **not equivalent** | Such a stock with a restated classified cell would get the STD-UI-17 sentence with no mark on the screen (T004): IR-003 |
| `index.tsx:301:manual:9` (`code: null`) | **not equivalent** | The error sentence would stop being chosen by code (T008; classification-ui 2.4): IR-004 |
| `index.tsx:322:manual:10` (`symbol={display}`) | **not equivalent** | The history read would stop sending the symbol as received (T011): IR-004 |

The killed manual mutant is `index.tsx:140:manual:6` (`some` to `every`). The coder's three cycle survivor dispositions agree with this review. The results file is `CAP-002-E5-S3-implementation-review-v1-mutation.json`, beside this report (sha256 `f81624c480e6a32991deed0b8e6b432d543f02e9f18bebfe1e6ed0e91fe1cd79`).

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` | harness root | 0 | PASS | `READY`. Without `--base-ref` it reports `BLOCKED — story coding has not reached in-review` against the default branch, which the supervised run does not use |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` | harness root | 0 | PASS | `6e7b8b019cf98eef9ab96b4e289d7c18041fc2cc`, an ancestor of HEAD (`merge-base --is-ancestor`) |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 6e7b8b019cf98eef9ab96b4e289d7c18041fc2cc --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `git apply --index cycle-1.patch`, then `cycle-2.patch`, onto `6e7b8b0` in a scratch clone; `git diff --cached --stat 4c5945d -- web/` | reviewer scratchpad | 0 | PASS | Empty diff: the patches reproduce HEAD's `web/` tree |
| `npx vitest run web/src/screens/research/stocks/factor-card.test.tsx web/src/screens/research/stocks/stock-evidence.test.tsx web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files, 470 tests (55 + 27 + 388) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 75 files, 1979 tests, incl. `render.test.tsx`, `copy.test.ts`, `routes.test.tsx` |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 169 files, no diagnostics |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome check mode: 169 files, no changes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules; writes the ignored `src/factorflow/api/static/`; asset hashes equal the coder's `build.log` |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 6e7b8b019cf98eef9ab96b4e289d7c18041fc2cc..HEAD --cycle review --out $SCRATCH/mut/mutants.json` (`$SCRATCH` is the reviewer session's scratchpad, outside the component repo) | harness root | 0 | PASS | 53 mutants; 10 manual mutants appended |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/mut/mutants.json --jobs 4 --command 'ln -sfn <abs>/repos/factorflow-v2/FactorFlow-v2/node_modules node_modules; npx vitest run web/src/screens/research/stocks/ web/src/screens/research/copy.test.ts' --out $SCRATCH/mut/results.json --logs $SCRATCH/mut/logs` | harness root | 3 | PASS (evidence) | Exit 3 signals survivors. 51 killed, 12 survived, dispositioned above. Copied beside this report |
| `python3 scripts/check-artifacts.py --project factorflow-v2 --artifact <this report> --strict` | harness root | 0 | PASS | Run after writing this report |
| `npm ci` | — | N/A | NOT RUN | Dependencies are already installed from the lockfile. The story and plan do not list it, and it would rewrite `node_modules` under the review subject |
| `npm run test:e2e` | — | N/A | NOT RUN | Not in the story's or plan's validation list. The story's E2E specs (`fix-insufficient-evidence.spec.ts`, `compare-and-evidence.spec.ts`) are test-design artifacts this story does not write, and none is in the change set |
| `uv sync`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | — | N/A | NOT RUN | The change set has no Python file, and the story's validation list is the five frontend commands above |

### Validation Side Effects

- Before: HEAD `4c5945d`, clean working tree, `code-revision` `sha256:1271fac41a65485fec846ee78279e213964fcd70911c1313f07330ce9b3edc7c`.
- After: HEAD `4c5945d`, clean working tree, `code-revision` unchanged. The test and build commands rewrote the git-ignored `src/factorflow/api/static/` with the same asset hashes, as `tech-stack.md` notes they do.
- Unexpected tracked-file changes: none. The only files this review wrote are this report and its `-mutation.json`, both under `docs/`, which the fingerprint excludes.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | *Not enough to rank* prints the engine's bare count fragment, not the DEC-0186 sentence, and `copy.ts` lacks the string T002 requires |
| IR-002 | HIGH | initial | TC-COMP-105 and TC-COMP-106 never discriminate the reason input among several rows; `inputs[0]` survives |
| IR-003 | MEDIUM | initial | A stock retired after its current set was built is handled but not pinned; three non-equivalent mutants survive |
| IR-004 | MEDIUM | initial | The error sentence's code and the symbol `HistoryTab` receives are not pinned; two non-equivalent mutants survive |
| IR-005 | LOW | initial | The evidence read effect has no stale-response guard |
| IR-006 | LOW | initial | Two size literals outside the theme (STD-UI-29) |
| IR-007 | LOW | initial | On `?tab=earlier`, a failed evidence read is not shown in the active panel |
| IR-008 | LOW | initial | TDD evidence: import-only RED, no RED for review-driven rework tests, and a miscounted suite |

### IR-001 — *Not enough to rank* prints the engine's bare count fragment, not the DEC-0186 sentence, and `copy.ts` lacks the string T002 requires

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (AC-14 display, cited by T007; not a story AC)
- **Tasks**: T002, T007, T010
- **Files**: `web/src/screens/research/stocks/factor-card.tsx:289-291`; `web/src/screens/research/copy.ts` (`EVIDENCE`, `:813-858`); `web/src/screens/research/stocks/factor-card.test.tsx:447-476`
- **Claim challenged**: T002, T007 and T010 are checked complete, and cycle 1's spec-drift review reported no drift.
- **Observed evidence**: The card renders `<p className="text-sm">{cell.reasonDetail}</p>`. The engine writes `reason_detail` as `concat(qualified_count, ' of ', min_peer_set_size, ' stocks qualified')` (`src/factorflow/classification/sql/classify.sql:124`; factor-engine 2.3, *'18 of 30 stocks qualified'*). The owner therefore reads *18 of 30 stocks qualified*: no period, no factor, and no statement that nothing was ranked. No `copy.ts` string takes `reasonDetail`. `EVIDENCE.onlyQualified` (`:823-824`) needs counts, which the evidence read does not carry. The test asserts `getByText(/18 of 30 stocks qualified/)`, which the bare fragment satisfies, so the test cannot tell the two renderings apart.
- **Expected evidence/behavior**: DEC-0186, owner-upheld: *"A not_enough_stocks factor shows badge coverage-unknown Not enough to rank with reasonDetail ({n} of 30 stocks qualified) rendered verbatim in a sentence saying no stock was ranked on the factor."* T002 lists *the not-enough-to-rank sentence built from the card's `reasonDetail` (DEC-0186)* as a `copy.ts` string. T007 and T010 require *the sentence built from `reasonDetail`*. UX design 1.6 prints *Only {n} of 30 stocks qualified on value in this set, so no stock was ranked on it.*
- **Impact**: An unranked factor card states a count and not its consequence, and departs from the sentence register of the card's other three states. A decision the owner upheld is not implemented, and no decision was recorded for the departure.
- **Required remediation**: Add the T002 string to `copy.ts`, built from `reasonDetail` and the factor's display label with DEC-0186's meaning, and anchor it in `copy.test.ts`. Render it on the card, and assert the full sentence exactly in `factor-card.test.tsx`. Alternatively, if a different rendering is intended, record that under `docs/decision-records.md` for the owner.

### IR-002 — TC-COMP-105 and TC-COMP-106 never discriminate the reason input among several rows; `inputs[0]` survives

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-2, DAC-E5-S3-1, DAC-E5-S3-2, AC-13, AC-17
- **Tasks**: T003, T005
- **Files**: `web/src/screens/research/stocks/factor-card.tsx:258-261`; `factor-card.test.tsx:64-173`, `:196-341`, `:551-639`; `stock-evidence.test.tsx:423-445`
- **Claim challenged**: TC-COMP-105 and TC-COMP-106 prove that the card names *the specific* missing or outdated input.
- **Observed evidence**: Manual mutant `factor-card.tsx:261:manual:3` replaces `inputs.find((row) => row.inputName === cell.reasonInput)` with `inputs[0]`, and it passes every focused test. Every fixture that renders a statement gives the card exactly one row, or none. That covers TC-COMP-105, TC-COMP-106, the T005 cases, and the screen's *hands each card its factor's inputs*, where the value card's only row is the reason input.
- **Expected evidence/behavior**: DAC-E5-2: *"MUST name the specific missing or outdated input behind an incomplete factor."* The coverage matrix maps DAC-E5-2 only to TC-COMP-105 and TC-COMP-106. T005: *"the missing-input statement names the input by its product-vocabulary label."* A real value card has three rows, growth two and momentum three (factor-engine 2.4). The engine's reason is the factor's *first input that is not `present`, in the factor's input order* (factor-engine 2.3), so the reason input is often not the first row.
- **Impact**: A regression that names the wrong row would pass every test. The owner would then read *Value for KO couldn't be scored: book-to-price is missing.* when free-cash-flow yield is missing, which is the misleading explanation this story exists to prevent. The production code is correct today.
- **Required remediation**: Give TC-COMP-106, and TC-COMP-105 or a T005 case, a realistic multi-row card where the reason input is not first, for example value with book-to-price and earnings yield present and free-cash-flow yield missing. Assert that the statement names that input and none of the others, so that `factor-card.tsx:261:manual:3` fails.

### IR-003 — A stock retired after its current set was built is handled but not pinned; three non-equivalent mutants survive

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-S3-4, DAC-E5-3, AC-15; DAC-E5-S3-3
- **Tasks**: T007, T010, T011, T004
- **Files**: `web/src/screens/research/stocks/factor-card.tsx:279`, `:281-284`; `index.tsx:147-149`; `factor-card.test.tsx:478-496`, `:509-524`; `stock-evidence.test.tsx:145-187`
- **Claim challenged**: The test *reads a retired stock's incomplete cell as Not followed too* proves the lifecycle-keyed rendering.
- **Observed evidence**: Three manual mutants pass every focused test:
  - `factor-card.tsx:279:manual:4` hands `FactorCell` the raw cell instead of the `retired` override.
  - `factor-card.tsx:281:manual:5` prints the standardised score on a retired card.
  - `index.tsx:148:manual:7` places the STD-UI-17 sentence as if the stock were active.

  The override test asserts only the sentence, no statement and no `<dl>`. It never asserts the `status-neutral` *Not followed* badge or the absence of *Incomplete*. No test gives a retired stock a classified cell with a score or a restated flag. TC-COMP-116's T004 fixture, with reason `retired` on every cell, masks all three mutants.
- **Expected evidence/behavior**: DEC-0183, owner-upheld: *"Each factor card for a lifecycle retired stock renders badge status-neutral Not followed and the sentence Not followed. Earlier scores stand."* `stock_evidence.sql:7` reads `i.lifecycle` from the instrument, while the cells come from the current set. A stock retired since that set was built therefore arrives as `lifecycle: "retired"` with its last active cells until the next set. T004 (TC-COMP-192): *"with no mark anywhere the STD-UI-17 sentence does not render at all."*
- **Impact**: Under these mutants, a just-retired stock could show *Incomplete* or a percentile beside *Not followed. Earlier scores stand.*, a standardised score under *Not followed*, or the restatement sentence with no mark. Each contradicts AC-15's display side. The production code is correct today. The window lasts until the next set is produced.
- **Required remediation**: Add card tests with `lifecycle: "retired"`:
  - with an incomplete cell, asserting the `status-neutral` badge and no *Incomplete*;
  - with a classified cell that carries a score, asserting no `card-score`.

  Add a screen test with a retired stock whose cells are classified with `restatedPossible`, asserting that no STD-UI-17 sentence renders. All three mutants should then fail.

### IR-004 — The error sentence's code and the symbol `HistoryTab` receives are not pinned; two non-equivalent mutants survive

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T008, T009, T011
- **Files**: `web/src/screens/research/stocks/index.tsx:298-303`, `:322`; `stock-evidence.test.tsx:329-345`, `:457-465`; `copy.ts:201`, `:221-222`
- **Claim challenged**: The screen-state tests prove the error reason is selected *by code*, and the symbol is *sent as received*.
- **Observed evidence**:
  - `index.tsx:301:manual:9` (`code: null`) survives. The only API-error fixture is `internal_error`, whose sentence `${action}: ${FALLBACK_ERROR}` (`copy.ts:201`) is identical to the no-code fallback (`:221-222`).
  - `index.tsx:322:manual:10` (`<HistoryTab symbol={display} />`) survives, because *sends the symbol as received* checks only `getStockEvidence`.

  `HistoryTab` takes one `symbol` prop for both its read and its labels. Passing the raw route symbol, as the code does, also means that `/research/stocks/ko` labels the history table *Earlier scores for ko*. T011's two halves, upper-cased for display and sent as received, cannot both hold through that single prop.
- **Expected evidence/behavior**: T008: *"operation, resource, reason from `copy.ts` by `code`, never `message`"* (classification-ui 2.4). T011: *":symbol ... upper-cased for display only, sent as received."*
- **Impact**: A regression that dropped the code would show the generic sentence for `validation_error`, `cursor_invalid` and every other coded failure. A regression that upper-cased the history read's symbol would also pass. The production code follows the plan today.
- **Required remediation**: Add an error case whose sentence differs from the fallback, such as `validation_error`, and assert that exact sentence. Extend the lower-case test to activate Earlier scores and assert `getStockHistory` is called with `"ko"`. Record the display-versus-send choice for the history panel in the task plan's Notes, so the owner sees the trade-off.

### IR-005 — The evidence read effect has no stale-response guard

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/screens/research/stocks/index.tsx:192-206`
- **Claim challenged**: One evidence read per symbol, settling into the state it belongs to.
- **Observed evidence**: The effect has no cleanup and no generation check. The sibling `history-tab.tsx:151-174` discards superseded responses with a generation counter. The delivered `universes/index.tsx:68-107` and `runs/detail/index.tsx:53-101` use `cancelled` flags. `main.tsx` renders under `React.StrictMode`, so in development the effect runs twice and issues two evidence reads, and whichever settles last wins.
- **Expected evidence/behavior**: T011: *"One evidence read per symbol."* The established pattern in the nearby code is to discard a superseded read.
- **Impact**: In development, a doubled read. In production, a read from an earlier attempt that settles after a newer one could overwrite it. This is unlikely, because **Try again** unmounts on click.
- **Required remediation**: Discard results from a superseded effect run, as the sibling `HistoryTab` does.

### IR-006 — Two size literals outside the theme (STD-UI-29)

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011, T014
- **Files**: `web/src/screens/research/stocks/index.tsx:126` (`h-24`), `:214` and `:263` (`max-w-[1180px]`)
- **Claim challenged**: T014's token review.
- **Observed evidence**:
  - `max-w-[1180px]` is an arbitrary Tailwind value, and `design-system/theme.css` defines no token for the evidence page's 1180 px cap (only `--measure-prose`).
  - `h-24` comes from Tailwind's default height scale. `tailwind.config.js` describes that scale as literals rather than tokens (STD-UI-29), and the theme's height map covers 1 to 8.
- **Expected evidence/behavior**: STD-UI-29: *"No spacing, size or colour literal appears outside the theme."* Classification-ui 10 says the same. UX design 1.6 and T011 fix the 1180 px cap without naming a token.
- **Impact**: Low. Precedent exists in delivered code (`results-pane.tsx:263` `min-w-[40rem]`, `set-history-dialog.tsx:162` `h-20`).
- **Required remediation**: Express the cap and the skeleton height as theme tokens, or record the departure.

### IR-007 — On `?tab=earlier`, a failed evidence read is not shown in the active panel

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T008, T011
- **Files**: `web/src/screens/research/stocks/index.tsx:288-315`
- **Claim challenged**: An `ApiError` *"renders the error state in the active panel"* (T008).
- **Observed evidence**: The error body renders only in the Now panel. DEC-0280, agent-decided and open, settles this in a clause added to a different question, ScreenState versus a local union. To reproduce: open `/research/stocks/KO?tab=earlier`, let the evidence read reject with `internal_error` and the history read succeed. The visible panel then shows the history rows. The title shows the symbol with no name and no memberships line, and no failure sentence or **Try again** is visible until the owner switches to Now.
- **Expected evidence/behavior**: T008, and UX design 1.6 States, *Error*: *"the active panel replaced by the operation, resource, reason and **Try again**."*
- **Impact**: A failed read is not visible on the tab the URL opened. The choice is recorded, so it is not a silent assumption.
- **Required remediation**: Ask the owner to confirm DEC-0280's placement clause when reviewing it, or show the evidence-read failure where it is visible on either tab. No code change is needed if the owner upholds it.

### IR-008 — TDD evidence: import-only RED, no RED for review-driven rework tests, and a miscounted suite

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T015
- **Files**: `CAP-002-E5-S3-tdd-evidence.yaml`; `CAP-002-E5-S3-evidence/red-cycle-1.log`, `red-cycle-2.log`, `full-suite.log`
- **Claim challenged**: Each cycle's RED and GREEN evidence.
- **Observed evidence**:
  - Both cycles' RED is a module-resolution failure (`Failed to resolve import "./factor-card"`, `"./index"`) plus one `copy.test.ts` `TypeError`. No behavioural assertion was observed failing.
  - The tests added after each cycle's code review have no RED record. In cycle 1 these are the momentum guard, null as-of, unmatched reason input, empty parentheses, and retired and unranked edges. In cycle 2 they are casing, unknown tab, the not-found header and ArrowLeft.
  - Cycle 2's `green_evidence` reports *75 files, 1976 tests*, but `full-suite.log:504` and this review's rerun both show 1979.
- **Expected evidence/behavior**: T015 asks for a cycle's RED and GREEN evidence and accurate counts. The lint is clean, so this concerns evidence quality only.
- **Impact**: Evidence quality only. This review's mutation run establishes regression sensitivity independently (51 of 63 killed), apart from the gaps in IR-002 to IR-004.
- **Required remediation**: Correct the count, and record RED for tests added in a rework cycle.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **`copy.test.ts` outside T012's file list.** Justified: it is T002's anchor for the new strings, recorded in the task plan's Implementation Notes.
- **Local state union instead of `ScreenState` (DEC-0280).** Justified and recorded: `ScreenState`'s `error` variant cannot carry the code. This is the same choice as DEC-0278 (E5-S2). Its added placement clause is IR-007.
- **Unlisted wording `missingInputReason` and `unnamedInput` (DEC-0279).** Recorded as provisional and open for the owner. Both are display labels and never payload keys.
- **`cardShowsMark` exported from `factor-card.tsx`.** Justified by T011's placement rule and recorded in the Notes. It mirrors `FactorCell`'s mark condition (`factor-cell.tsx:189-199`).
- **`NotFollowedBadge` in `index.tsx:48-61`.** It restates the shape of `FactorCell`'s private badge for the title, because `FactorCell` does not export one. This is bookkeeping only.
- **Task plan header.** The `Branch` line names the planning branch `usr/alvaro-de-jodra/CAP-002-E5-tasks`, while the code is on the run branch. This has no effect.
- **Empty `.claude/.cc-writes/` directory.** It sits inside `CAP-002-E5-S3-evidence/`. Git cannot see it because it is empty, so it is outside the review set. It is a harness artifact.
- **State check.** Without `--base-ref`, `pipeline-state.py check` reports `BLOCKED` against the default branch. With the supervised run's integration ref it reports `READY`. This review used the driver's ref, as the skill directs.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework against this report and the task file. IR-001 and IR-002 must be resolved. IR-003 and IR-004 are expected to be resolved because they are cheap. The LOW findings are at the coder's discretion. Then run this review again as v2, passing `CAP-002-E5-S3-implementation-review-v1-mutation.json` to `mutation-run.py scope --previous`.
- **Warnings accepted downstream**: N/A
