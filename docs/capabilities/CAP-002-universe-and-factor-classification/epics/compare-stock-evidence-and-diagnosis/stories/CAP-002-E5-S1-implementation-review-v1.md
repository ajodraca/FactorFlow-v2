---
artifact_schema_version: 1
artifact_id: CAP-002-E5-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-03
updated: 2026-11-03
story_id: "CAP-002-E5-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-03T06:18:08Z"
reviewed_head: "6ea0ecbd3f6694ad4d7975c3b0b116b203288405"
review_base: "543198fb17b3dc5f9905e113eb76eeb9a0760ef1"
reviewed_state_revision: "sha256:bb40bd09436195849c12bbed45f1b00368e0ec59b6a7d646bf1b12adec1f0580"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E5-S1
    artifact_version: 1
    content_revision: sha256:4c309eb55e8c43939e652cb99abba5395f9554141d1aa1374ade2efef97cd8e5
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-11-03T06:18:08Z
  source_artifacts:
    - id: CAP-002-E5-S1
      version: "1 (sha256:4c309eb55e8c43939e652cb99abba5395f9554141d1aa1374ade2efef97cd8e5)"
    - id: CAP-002-E5-S1-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E5-S1-tdd-evidence
      version: "cycle-1 to cycle-2"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0070
      version: "owner-upheld 2026-10-17"
    - id: DEC-0073
      version: "owner-upheld"
    - id: DEC-0077
      version: "owner-upheld"
    - id: DEC-0078
      version: "owner-upheld"
    - id: DEC-0131
      version: "owner-upheld 2026-10-18"
    - id: DEC-0140
      version: "owner-upheld 2026-10-18"
    - id: DEC-0163
      version: "owner-upheld"
    - id: DEC-0175
      version: "owner-upheld"
    - id: DEC-0176
      version: "owner-upheld 2026-10-18 (amended E5-F01, E5-F03)"
    - id: DEC-0177
      version: "owner-upheld"
    - id: STD-UI (ui-conventions)
      version: "current at review base"
    - id: design-system form, input, badge and button specifications
      version: "current at review base"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E5-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 4 |
| Medium findings | 5 |
| Low findings | 4 |
| Acceptance criteria | 10/11 satisfied |
| Planned tasks | 13/15 verified |
| Required validation | 6/6 passed |

The comparison table (`comparison-table.tsx`) and the Compare screen (`compare/index.tsx`) implement the core of the story. Two to six stocks sit side by side. An incomplete stock keeps its column. A retired stock reads *Not followed* on every factor. Input status follows DEC-0077, the dates disclosure follows DEC-0078, and the restated mark and its sentence follow DEC-0176. The URL is read and written in DEC-0163's form. Every required command passed when rerun independently, and the TDD evidence lint is clean.

The gate fails on four HIGH findings:

- **IR-001**: an unknown or duplicate symbol is rendered as a free-standing alert paragraph, not as the entry field's error. The input has no `aria-invalid` and no `aria-describedby`, the text has no error styling, and the error does not clear when the field is edited. The design-system form and input specifications, which UX design 1.5 cites for this field, require all of these, and every other CAP-002 field error has them. DAC-E5-S1-3 is therefore `PARTIAL`.
- **IR-002**: the column header's *Not followed* badge is drawn without a shape, which breaks STD-UI-8 and the badge specification and leaves T014 `PARTIAL`.
- **IR-003**: the mandatory TC-COMP-114 test never checks that an active column lacks the *Not followed* badge. A mutant that labels every compared stock *Not followed* passes, so the test is `WEAK`.
- **IR-004**: T012's full-width page card and the secondary **Add** button are not rendered.

**By severity:** CRITICAL 0 · HIGH 4 · MEDIUM 5 · LOW 4 · **total 13**

The mutation run had 104 mutants: the 68 the catalogue generates over every changed production file, plus 36 written by hand for the contract. 77 were killed. Of the 27 survivors, 5 are equivalent and 22 are not. One of the 22 is in a mandatory test (IR-003). One is covered by IR-001 and one by IR-002. The other 19 sit in additional tests or in the unanchored copy, and IR-005 to IR-009 group them as MEDIUM, because the production code they mutate is correct. IR-005 also records a production weakness: the evidence cache is keyed by symbol only, so after a set completes mid-visit, one set's input rows can appear under another set's scores with nothing on screen saying so (STD-UI-16).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E5-S1-run-20261103T034434Z` |
| HEAD | `6ea0ecbd3f6694ad4d7975c3b0b116b203288405` (`feat(research): CAP-002-E5-S1 story-coding`, one commit over the base) |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` (supplied by the supervised driver as `--base-ref`, tip `543198f`), merge base `543198fb17b3dc5f9905e113eb76eeb9a0760ef1`, an ancestor of HEAD; resolved with `pipeline-state.py review-base --base-ref` |
| Working tree | Clean: no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 20 (4 source/test files, `copy.ts`, 3 plan and story files, and 12 TDD evidence files) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/comparison-table.tsx` | added (311) | T011; AC-15, AC-16, AC-23, DAC-E5-1, DAC-E5-3, DAC-E5-5, DAC-E5-S1-1, DAC-E5-S1-4, DAC-E5-S1-5 |
| `web/src/components/patterns/comparison-table.test.tsx` | added (628) | T003, T005, T006, T007 |
| `web/src/screens/research/compare/index.tsx` | added (387) | T012; AC-16, DAC-E5-1, DAC-E5-S1-2, DAC-E5-S1-3, DAC-E5-S1-5 |
| `web/src/screens/research/compare/compare.test.tsx` | added (757) | T004, T008, T009, T010 |
| `web/src/screens/research/copy.ts` | modified (+22) | T002: `COMPARE.duplicate`, `notCompared`, `inputLabels`, `breadcrumb`, `measure`, `removeGlyph`, `dates`, `asOf`, `knownOn`. The other T002 strings already existed (E4-S2) |
| `.../stories/CAP-002-E5-S1-tasks.md` | modified | Checkbox flips for T001 to T015, plus four T001/T014 bullets under *Other Notes* (word diff confirms no other change) |
| `.../stories/CAP-002-E5-S1.md` | modified | `status: planning` to `in-review` only |
| `.../stories/CAP-002-E5-S1-tdd-evidence.yaml` | added | T015 |
| `.../stories/CAP-002-E5-S1-evidence/` (12 files: `cycle-1..2.patch`, `red-cycle-1..2.log`, `green-cycle-1..2.log`, `mutants-cycle-1..2.json`, `mutation-cycle-1..2-results.json`, `full-suite.log`, `build.log`) | added | T015 evidence cited by the TDD evidence file |

`web/src/app/routes.tsx`, every shell file, and E4-S1/S2/S3's `classification-client.ts`, `factor-cell.tsx` and `restated-mark.tsx` are unchanged (T013). `routes.tsx` has no compare route yet; routing is CAP-002-E4-S10's.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-15 (display side) | SATISFIED | `comparison-table.tsx:284` passes the list read's `retired` cell to `FactorCell` unchanged; `:208-215` header badge; `scoreText` `:83-91` em dash | TC-COMP-114 (`comparison-table.test.tsx:226-261`) | Rendering is correct. The header badge lacks its shape (IR-002), and the test does not pin the header's lifecycle condition (IR-003) |
| AC-16 (compare side) | SATISFIED | `index.tsx:132-182` one list read plus one evidence read per column; `:268-288` one column per listed symbol in URL order | T008 `compare.test.tsx:259-348`; TC-COMP-128 | |
| AC-23 (display side) | SATISFIED | `FactorCell` draws the mark on value and growth (E4-S3); `comparison-table.tsx:135` mark on backfilled inputs; `index.tsx:380-382` sentence | TC-COMP-190 (`compare.test.tsx:235-248`); T006 (`comparison-table.test.tsx:420-449`) | Input-only marks and momentum flags are not pinned at screen level (IR-007) |
| DAC-E5-1 | SATISFIED | 2–6 bound `index.tsx:20-21, 108, 133`; columns kept whatever their cells say; `unknownSymbols` and symbols neither returned nor reported both reach the notice (`:146-151`, `:274-278`) | TC-COMP-127, TC-COMP-128, TC-COMP-129; "names them in the notice rather than dropping them silently" (`:699-706`) | |
| DAC-E5-3 | SATISFIED | As AC-15 | TC-COMP-114 | Compare half only; the evidence half is E5-S3's |
| DAC-E5-5 | SATISFIED | As AC-23 | TC-COMP-190 | Compare half only |
| DAC-E5-S1-1 | SATISFIED | `FactorCell` *Incomplete* with `reasonDetail` title; `comparison-table.tsx:104-112` *Missing* badge; `:270-274` group statement once | TC-COMP-127 (`comparison-table.test.tsx:135-223`) | `reasonInput` is never read (`grep`: only the doc comment at `:234`) |
| DAC-E5-S1-2 | SATISFIED | `index.tsx:108, 216, 336-344, 351-356, 308-309` | TC-COMP-128 (`compare.test.tsx:156-194`) | The test presses Enter on the button, not in the field (IR-013) |
| DAC-E5-S1-3 | **PARTIAL** | `index.tsx:233-245` maps `instrument_not_found` to the sentence and adds no column; `:346-350` renders it as a page-level alert | TC-COMP-129 (`compare.test.tsx:197-232`) | Not a field error under the referenced form and input specifications: no `aria-invalid`, no `aria-describedby`, no error styling, not cleared on change (IR-001). `unknown_symbols` reporting is correct |
| DAC-E5-S1-4 | SATISFIED | As AC-15 | TC-COMP-114 | Test WEAK (IR-003) |
| DAC-E5-S1-5 | SATISFIED | `index.tsx:87-93, 380-382` | TC-COMP-190 | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Tasks file *Other Notes*, "Upstream names recorded" | Every recorded name checked against the shipped files: `listClassifications`, `getStockEvidence`, `ClassificationApiError`, the six types, the four formatters, `FactorCell`'s and `RestatedMark`'s props. `toFactorCells` (`classification-client.ts:262-271`) carries `factors: {}` without synthesising a cell |
| T002 | complete | VERIFIED | `copy.ts:810-831`; pre-existing `COMPARE`, `CELL`, `INPUT_STATUS`, `ERROR_SENTENCES.instrument_not_found` | Every listed string is present. `CELL.restatedExplanation` equals T002's STD-UI-17 sentence verbatim. The TC-COMP-072 scan passes. The new strings are anchored nowhere (IR-009) |
| T003 | complete | VERIFIED | `comparison-table.test.tsx:133-262` | Written as specified, with `Implements` comments. TC-COMP-114 is WEAK (IR-003) |
| T004 | complete | VERIFIED | `compare.test.tsx:154-256` | Written as specified, with `Implements` comments. TC-COMP-129 is WEAK through IR-001; the Enter path is IR-013 |
| T005 | complete | VERIFIED | `comparison-table.test.tsx:264-353` | Present; WEAK on shapes and on a missing row's value (IR-002, IR-006) |
| T006 | complete | VERIFIED | `comparison-table.test.tsx:355-450, 506-628` | Present; WEAK on labels and on momentum input marks (IR-006, IR-009) |
| T007 | complete | VERIFIED | `comparison-table.test.tsx:452-504` | Present; WEAK on the date labels (IR-006) |
| T008 | complete | VERIFIED | `compare.test.tsx:258-349` | Present; WEAK on encoding, overflow and the duplicate error's naming (IR-008, IR-009) |
| T009 | complete | VERIFIED | `compare.test.tsx:351-401, 619-633` | Present; the "from evidence alone" test cannot tell evidence from a stale list (IR-008) |
| T010 | complete | VERIFIED | `compare.test.tsx:403-617` | Present. Justified deviation: `ApiUnreachableError` renders nothing, because the shell owns the unreachable state (UX 1.5 States; `universes/index.tsx:117-118` does the same). Recorded in the plan's Notes. WEAK on the partial-factors guard and the read budget (IR-005, IR-008) |
| T011 | complete | VERIFIED | `comparison-table.tsx` | Props, native table, pinned column, group statement, input rows keyed by `inputName`, absent row as em dash only, private status and disclosure components, DEC-0150 props unchanged. Row tokens: IR-011. Landmark naming: IR-012 |
| T012 | complete | **PARTIAL** | `compare/index.tsx` | URL read and write per DEC-0163, the 2–6 bound, duplicate and `instrument_not_found` handling, the single-column guard and the sentence placement are all implemented. Missing: the field-error contract (IR-001), the full-width card and the secondary **Add** tokens (IR-004). The evidence cache does not check its set (IR-005) |
| T013 | complete | VERIFIED | `git diff --stat 543198f..HEAD`; `routes.tsx` unchanged; full suite 74 files / 1905 tests | Only the five planned source files plus plan, story and evidence changed. `SHELL_ROUTES` holds no Research route, so the literal `/research` follows the universes screens |
| T014 | complete | **PARTIAL** | `comparison-table.tsx`, `compare/index.tsx` | "Every status carries its word plus a shape" fails for the header *Not followed* badge (IR-002). No `--gain`/`--loss` class. No delivered `axe`-style assertion exists to mirror. Notes updated |
| T015 | complete | VERIFIED | `CAP-002-E5-S1-tdd-evidence.yaml`, two cycles; lint 0 errors, 0 warnings with `--require-logs` | Each cycle names its patch, logs, review verdicts and mutation results; `commit_hash: stage` as allowed |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `keeps an incomplete stock's column and names the input` and `states not enough to rank once…` / TC-COMP-127 | ADEQUATE | Three headers kept; the growth cell's text is exactly *Incomplete* and its `title` contains `revenue missing`; score em dash; *Revenue growth* em dash plus *Missing*; `eps_growth` value kept; `revenue_growth` in no text or `title`; the group statement once; *Not enough to rank* in every growth cell; em dashes beneath | none |
| `reads Not followed on every factor of a retired stock` / TC-COMP-114 | **WEAK** | *Not followed* in OLD's three percentile cells, em dashes beneath, and in OLD's header | Never asserts that the active column's header lacks the badge. `manual:ct-header-notfollowed-always` survives: IR-003 |
| `blocks Add at six…`, `shows the prompt below two…`, `shows the long prompt…` / TC-COMP-128 | ADEQUATE | `aria-disabled="true"`, not `disabled`, accessible description *A comparison holds up to 6 stocks.*; no request and no column on activation; the prompt at one symbol and the long prompt at none, with the field focused and no read | Enter is pressed on the button, not in the field (IR-013) |
| `reports instrument_not_found as a field error…`, `reports the server's unknown symbols…` / TC-COMP-129 | **WEAK** | The exact sentence *FactorFlow doesn't follow a stock named XYZ.*; two columns; URL unchanged; envelope text absent; the notice from `unknownSymbols` with no column, no evidence read for ZZZ, and not containing *doesn't follow* | Asserts only that the sentence appears somewhere, not that it is the field's error. Under the referenced form specification it is not: IR-001 |
| `marks restated value and growth percentiles with the sentence once` / TC-COMP-190 | ADEQUATE | Two marks in the table; the sentence exactly once on the screen | Percentile marks only; the input-mark and momentum rules are IR-007, on additional tests |
| `per-input status` (DEC-0077) / T005 | WEAK | `present` value alone; `missing` em dash plus `coverage-absent`; `outdated` value plus `status-warning`; `not_computable` text, not a badge, with an `aria-hidden` triangle; an absent row only an em dash with no status | No badge shape asserted except the triangle (`ct-outdated-no-icon` survives, IR-002). A missing row with a value is never built (`ct-missing-shows-value` survives, IR-006) |
| `prints each row at its precision`, `prints a measured 0.00…` / T005 | ADEQUATE | Whole percentile, signed 2 dp score, 2 dp ratio, signed % rate, unsigned `0.00`, em dash for unscored | Uses `toHaveTextContent` (contains) on the percentile cell (IR-006) |
| `structure and accessibility` / T006 | WEAK | Native table, accessible name, `scope` on every header, link `href`, name, remove button and `onRemove`, row order, marks on value/growth percentiles and on a backfilled input, none on momentum percentile, no polarity class, colspan | Labels read from `COMPARE.inputLabels` on both sides (IR-009). No momentum input is flagged (`ct-input-mark-const-factor` survives, IR-006). The percentile cell's exact content is not checked (`ct-percentile-showscore` survives, IR-006) |
| `dates disclosure` / T007 | WEAK | Named control, `aria-expanded` toggled by click, Enter and Space; both unconverted dates; em dashes for a row-less column; no disclosure on percentile or score rows | Never checks which label each date sits under (`ct-dates-label-asof` survives, IR-006) |
| `row and corner headers`, `cells that hold a score…` | ADEQUATE | Factor named in each percentile and score row header; *Measure* corner; em dash for a non-classified, percentile-less, retired or incomplete cell carrying a score; `tabIndex` 0 on the container, −1 on headers; colspan | none |
| `entry and bounds` / T008 | WEAK | The comma-joined read; exact `symbols` argument; one list read plus two evidence reads; normalisation; the literal-comma write; duplicate refused with no read; sixth accepted then blocked; seven read nothing; `422` as the bound | Encoding (`ix-url-no-encode`) and the post-read bound (`ix-add-overflow-unguarded`) are unpinned (IR-008). The duplicate error's naming is unpinned (`cp-duplicate-drops-symbol`, IR-009) |
| `removal and focus` / T009 | WEAK | Column dropped; URL `?symbols=AAPL,MSFT`; focus to the next header, the previous when last, the entry field when none; prompt above one column; focus skips a symbol with no column | The "from evidence alone" test gives the list and the evidence identical cells and a ranked summary (`ix-activelist-stale` survives, IR-008) |
| `states` / T010 | WEAK | Skeleton per symbol; never-populated with no table; single symbol `set: null` and `factors: {}` cases; error by code with **Try again**; unreachable renders nothing; not-current populated | `factors: {}` cannot tell "every key" from "any key" (`ix-hasallfactors-some`, IR-008). The read budget is checked on first render only (`ix-evidence-no-cache`, IR-005) |
| `omits the sentence when no mark is on screen` / T012 | WEAK | No sentence when nothing is flagged | No input-only mark and no momentum flag (three survivors, IR-007) |
| `read outcomes`, `review fixes`, `symbols the server neither returns nor reports`, `while the list read … is pending` / T010, T012 | ADEQUATE | Failure operation by class; listed stock's evidence 404 fails the read; single-symbol 404 is the notice; stale read ignored; summary passed for two columns; focus past a column-less symbol; single-symbol `validation_error` not the bound; Add against the URL as it stands; unreachable Add leaves the field alone; unlisted symbols named once; skeleton while a grown list is pending; no false notice for a just-added symbol | Notice join and order unpinned (IR-008) |
| `copy.test.ts` anchors / T002 | MISSING | The TC-COMP-072 vocabulary scan passes over the new strings | None of the nine new strings is anchored; five copy mutants survive (IR-009) |

Mock validity: the screen tests double only `listClassifications` and `getStockEvidence`, spreading `importActual`, so the real `ClassificationApiError`, `FactorCell`, `RestatedMark`, formatters and copy run. The table tests mock nothing. No assertion reads a mock's setup back as its result. Determinism: no real network, timer or storage; the one `setTimeout(0)` waits on a resolved promise. Regression sensitivity is measured below.

### Mutation run

Generated with `scripts/mutation-run.py generate --range 543198f..HEAD --cycle review` over every changed production file. That gave 68 mutants: 30 off-by-one, 29 negate-boolean, 7 drop-field-copy and 2 remove-attribute, none in `copy.ts`. I added 36 manual mutants for the contract: 14 in `comparison-table.tsx`, 17 in `compare/index.tsx` and 5 in `copy.ts`. All 104 ran against the three focused suites (`comparison-table.test.tsx`, `compare.test.tsx`, `copy.test.ts`), and baselines passed on 4/4 workers. Results: 77 killed, 27 survived. Every survivor's log shows 3 files and 452 tests passing. The results file sits beside this report as `CAP-002-E5-S1-implementation-review-v1-mutation.json` (sha256 `ffd12c65721acf8b2c32aeb067ad0bca4af714c2bc1dba3e770fddc861f694ae`).

| Survivor | Disposition | Reason |
|----------|-------------|--------|
| `index.tsx:111:off-by-one:1` (initial `attempt` 1) | equivalent | `attempt` is an opaque **Try again** trigger: the read effect (`:182`) compares it only for change, and it is never rendered or ordered on. The coder reached the same disposition |
| `index.tsx:369:off-by-one:1` (`previous + 2`) | equivalent | Same counter; every press still changes it once |
| `manual:ct-link-no-encode` | equivalent | The header link's symbol comes only from a list or evidence row, and instrument symbols match `^[A-Z][A-Z0-9.-]{0,15}$` (`src/factorflow/instruments/symbols.py:5`), on which `encodeURIComponent` is the identity |
| `manual:ct-score-ignore-unranked` | equivalent | The store's `factor_classification_shape` check (`component-design-research-store.md:349`) gives a `classified` cell no reason code, so a `not_enough_stocks` cell is `not_classified` with a null score, and `scoreText`'s first guard already returns the em dash |
| `manual:ix-add-no-clear-draft` | equivalent | No artifact fixes the field's value after a successful **Add**: UX 1.5 *Adding a stock* and form specification §4 ("never clear the form on failure") cover only the failure path |
| `manual:ct-header-notfollowed-always` | **not equivalent** | IR-003 |
| `manual:ix-add-keep-stale-error` | **not equivalent** | IR-001 |
| `manual:ct-outdated-no-icon` | **not equivalent** | IR-002 |
| `manual:ix-evidence-no-cache` | **not equivalent** | IR-005 |
| `manual:ct-dates-label-asof`, `manual:ct-percentile-showscore`, `manual:ct-missing-shows-value`, `manual:ct-input-mark-const-factor` | **not equivalent** | IR-006 |
| `manual:ix-hasmark-no-inputs`, `manual:ix-hasmark-momentum-cells`, `manual:ix-hasmark-momentum-inputs` | **not equivalent** | IR-007 |
| `manual:ix-hasallfactors-some`, `manual:ix-activelist-stale`, `manual:ix-url-no-encode`, `manual:ix-notcompared-join`, `manual:ix-reported-reversed`, `manual:ix-add-overflow-unguarded` | **not equivalent** | IR-008 |
| `manual:cp-notcompared-wording`, `manual:cp-duplicate-drops-symbol`, `manual:cp-label-eps`, `manual:cp-label-fcf`, `manual:cp-label-return-12m` | **not equivalent** | IR-009 |

The killed manual mutants confirm what the suites do pin. Among them: the header badge never rendering, the momentum percentile mark, the group statement on ranked groups, the `retired` score guard, the not-computable triangle, a second sentence, the column order, the Add bound, the empty-state focus, and the unreachable Add.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review` (no base ref) | harness root | 1 | N/A | `BLOCKED — story coding has not reached in-review`: without `--base-ref` the state is derived against the remote default branch |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z --json` | harness root | 0 | PASS | `ready — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` | harness root | 0 | PASS | `543198fb17b3dc5f9905e113eb76eeb9a0760ef1`, the integration tip, an ancestor of HEAD |
| `npx vitest run web/src/components/patterns/comparison-table.test.tsx web/src/screens/research/compare/compare.test.tsx web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files, 452 tests (20 + 40 + 392) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 74 files, 1905 tests |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome lint .`: 167 files, no fixes |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome format .`: 167 files, no fixes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite, 63 modules. The built CSS holds every class the two new files use (`bg-value-missing-muted`, `bg-status-warning-muted`, `bg-status-neutral-muted`, `font-numeric`, `sticky`, `left-0`, `border-r`, `border-border`, `bg-background`, `bg-secondary`, `sr-only`, `border-collapse` and others; checked by regex over `index-DxnEO1AO.css`) |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E5-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 543198fb17b3dc5f9905e113eb76eeb9a0760ef1 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. Both RED logs show the test file failing to resolve the module under test, a meaningful RED for a new file |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 543198fb17b3dc5f9905e113eb76eeb9a0760ef1..HEAD --cycle review --out $SCRATCH/mutants.json` (`$SCRATCH` is the reviewer session's scratchpad, outside the component repo) | harness root | 0 | PASS | 68 mutants; 36 manual mutants appended by exact line match |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/mutants.json --jobs 4 --command 'ln -s <repo>/node_modules node_modules; npx vitest run web/src/components/patterns/comparison-table.test.tsx web/src/screens/research/compare/compare.test.tsx web/src/screens/research/copy.test.ts' --out $SCRATCH/mutation-results.json --logs $SCRATCH/mutation-logs` (`<repo>` is the absolute component path; the full command is recorded in the copied results file) | harness root | 3 | PASS (evidence) | Exit 3 signals survivors. 77 killed, 27 survived, dispositioned above |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the plan's Validation Plan ("this story writes no e2e") and the story's Validation list. `tests/e2e/compare-and-evidence.spec.ts` is Phase 6b automation, and `routes.tsx` has no compare route (CAP-002-E4-S10), so no E2E spec can reach this change. Same treatment as the CAP-002-E4-S9 v1 review |
| `uv sync --all-extras`, `uv build`, `uv run pytest`, `uv run pytest -m 'not postgres'`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | — | N/A | NOT RUN | The change set contains no Python file (`git diff --stat 543198f..HEAD`), and neither the story's Validation list nor the plan's Validation Plan names a Python command. The frontend build the Python static-asset test depends on was rerun above |
| `npm ci` | — | N/A | NOT RUN | `package.json` and `package-lock.json` are unchanged; the installed `node_modules` ran every command above |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact …/CAP-002-E5-S1.md` | harness root | 0 | PASS | `sha256:4c309eb5…e8d5`, equal to the story's approved `reviewed_revision` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before and after validation) | harness root | 0 | PASS | `sha256:bb40bd09436195849c12bbed45f1b00368e0ec59b6a7d646bf1b12adec1f0580` both times |

### Validation Side Effects

- Before: clean working tree at `6ea0ecb`; fingerprint `sha256:bb40bd09…0580`.
- After: clean working tree at `6ea0ecb`; same fingerprint. `npm run test` and `npm run build` write into the git-ignored `src/factorflow/api/static/`. Mutant clones and logs live under the reviewer's scratchpad.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | The entry field's error is not a field error |
| IR-002 | HIGH | initial | The column header's *Not followed* badge carries no shape |
| IR-003 | HIGH | initial | TC-COMP-114 cannot tell a retired column from an active one |
| IR-004 | HIGH | initial | T012's page card and secondary **Add** are not rendered |
| IR-005 | MEDIUM | initial | The evidence cache can show one set's inputs under another set's scores |
| IR-006 | MEDIUM | initial | The table's additional tests let four contract mutants survive |
| IR-007 | MEDIUM | initial | The restated sentence's rule is pinned only for percentile marks |
| IR-008 | MEDIUM | initial | The screen's read, notice and URL rules are unpinned |
| IR-009 | MEDIUM | initial | The nine strings T002 added are anchored nowhere |
| IR-010 | LOW | initial | Never-populated with two or more symbols also names every symbol as not compared |
| IR-011 | LOW | initial | The comparison table does not take the data-table row tokens |
| IR-012 | LOW | initial | The scroll container repeats the table's name as a landmark |
| IR-013 | LOW | initial | TC-COMP-128 never presses Enter in the field |

### IR-001 — The entry field's error is not a field error

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-S1-3 (traces to DAC-E5-1, AC-16)
- **Tasks**: T012 (behaviour); T004 (TC-COMP-129 test)
- **Files**: `web/src/screens/research/compare/index.tsx:328-334` (the input: no `aria-invalid`, no `aria-describedby`), `:346-350` (`<p role="alert" className="text-sm">` after the form, no id, no error styling), `:226` (cleared only by a later successful **Add**); `web/src/screens/research/compare/compare.test.tsx:197-217`, `:293-305`
- **Claim challenged**: T012 maps `instrument_not_found` "to the field error", and the duplicate case is "a field error naming it". The TC-COMP-129 test is titled "reports instrument_not_found as a field error".
- **Observed evidence**: The sentence renders in a paragraph outside the `form`. It uses the same `text-sm` body styling as the prompt and the not-compared notice. The input is never marked invalid, and it does not reference the error. Editing the field leaves the error standing, because `onChange` only sets the draft. TC-COMP-129 asserts only that the text appears somewhere on the screen. The one clearing that exists, on a successful **Add**, is unpinned: `manual:ix-add-keep-stale-error` removes it and passes every focused suite.
- **Expected evidence/behavior**: UX design 1.5 Component Mapping cites `design-system/components/form/design-spec.md` and `input/design-spec.md` for *Add a stock*. The form specification §5 says: "Errors are referenced by `aria-describedby` and the control carries `aria-invalid`." Its §4 says: "Server-side errors attach to the field they belong to", and "once it has errored, re-validate on change so the error clears as soon as it is fixed". §6 gives the error text its own token. The input specification §5 repeats the ARIA rule. Every other CAP-002 field error follows this: `add-to-universe-dialog.tsx:258-259`, `save-as-universe-dialog.tsx:224-225`, `filters-pane.tsx:179-180`, `threshold-sentence.tsx:182-183`, `universes/create-dialog.tsx:263-264`, `universes/detail/summary-header.tsx:231-232`. So does CAP-001's `instruments/add-field.tsx:88-96`, the pattern T004 names. The CAP-001-E2-S4 v2 review accepted that component precisely because "duplicate-active is a field error with `aria-invalid`; duplicate-retired is a notice".
- **Impact**: A screen-reader user hears the alert once. Returning to the field announces nothing, and the field is never reported invalid. A sighted user sees an unstyled sentence below the row that reads like the prompt beside it. While they type a corrected symbol, the old error keeps saying FactorFlow doesn't follow the previous one.
- **Required remediation**: Render the `instrument_not_found` and duplicate errors as the entry field's error. That means an element with an id that the input references through `aria-describedby`, `aria-invalid` on the input while the error stands, error styling as the sibling fields use, and clearing when the field changes or an **Add** succeeds. Extend TC-COMP-129 and the duplicate test to assert `aria-invalid`, the input's accessible description, and the clearing, so that `ix-add-keep-stale-error` fails. **Add**'s own `aria-describedby` to the bound reason is unaffected.

### IR-002 — The column header's *Not followed* badge carries no shape

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. The texts of DAC-E5-S1-4, DAC-E5-3 and AC-15 are met; the defect is STD-UI-8's
- **Tasks**: T014 (and the badge T011 renders)
- **Files**: `web/src/components/patterns/comparison-table.tsx:208-215` (`<span data-variant="status-neutral" …>{CELL.notFollowed}</span>`, no icon); `:113-122` (the Outdated badge, whose icon exists but is unpinned); `web/src/components/patterns/comparison-table.test.tsx:259-260`, `:291-295`
- **Claim challenged**: T014 is checked complete with "every status carries its word plus a shape or pattern (STD-UI-4, STD-UI-14)".
- **Observed evidence**: The header badge is text alone. Every other state on the screen carries a shape: E4-S3's `NotFollowedBadge` draws a dash in a circle in the same column's percentile cells, Outdated and *Couldn't be computed* draw the warning triangle, and *Missing* follows the em dash. No test asserts any badge's shape except the not-computable triangle, and `manual:ct-outdated-no-icon` (Outdated without its triangle) survives.
- **Expected evidence/behavior**: STD-UI-8 (`ui-conventions.md:280-288`): "State … MUST … carry a non-colour encoding: a text label plus an icon or shape for state". The badge specification §2 says the `status-neutral` tier "Always carries a text label and an icon; never colour alone (STD-UI-8)". UX design 1.5 Accessibility: "Every status carries its word and a shape or pattern". T014 asks for exactly this check.
- **Impact**: The column's lifecycle is the one state on the screen drawn without its shape, unlike the same badge in its own percentile cells. This breaks a constitution MUST. The word still carries the meaning, so no information is lost to a colour-blind reader.
- **Required remediation**: Give the header badge the `status-neutral` shape. `factor-cell.tsx` is E4-S3's and may not be edited (T013), so draw a private icon in this file as `WarningIcon` already is. Assert an `aria-hidden` shape in the header badge and in the Outdated badge, so that `ct-outdated-no-icon` fails.

### IR-003 — TC-COMP-114 cannot tell a retired column from an active one

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-S1-4, DAC-E5-3, AC-15
- **Tasks**: T003
- **Files**: `web/src/components/patterns/comparison-table.test.tsx:225-261`; `web/src/components/patterns/comparison-table.tsx:208`
- **Claim challenged**: TC-COMP-114 is implemented, and cycle 1 reports a mutation score of 1.0.
- **Observed evidence**: `manual:ct-header-notfollowed-always` changes the condition to `column.lifecycle !== ""`, so every column header reads *Not followed*. It passes all three focused suites. The test renders AAA (active) beside OLD (retired) and asserts only that OLD's header contains *Not followed*; nothing asserts that AAA's header does not. The percentile assertions exercise E4-S3's `FactorCell` through a `retired` fixture. The header badge is the only lifecycle rendering this story owns, and its condition is unpinned.
- **Expected evidence/behavior**: DEC-0073 and UX design 1.5 *Columns* call for `badge` `status-neutral` *Not followed* "where the stock is no longer followed". Under adversarial-review E.9, a non-equivalent survivor makes the test that should kill it `WEAK`, and step H makes a WEAK mandatory test at least HIGH.
- **Impact**: A regression that labels every compared stock *Not followed* would pass the suite. The owner would be told that stocks FactorFlow still follows are no longer followed.
- **Required remediation**: Assert that the active column's header carries no *Not followed* badge (and, after IR-002, no status shape), so that `ct-header-notfollowed-always` fails.

### IR-004 — T012's page card and secondary **Add** are not rendered

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion names the layout)
- **Tasks**: T012
- **Files**: `web/src/screens/research/compare/index.tsx:316` (`<div className="flex flex-col gap-5 p-5">`), `:336-344` (**Add**: `className="rounded border border-border px-3 py-2 text-sm"`)
- **Claim challenged**: T012 is checked complete with "Breadcrumb *Research › Compare*; one full-width card with `h1` *Comparing {n} stocks*; an entry row (… Add as `button` secondary …)".
- **Observed evidence**: There is no card. A plain `div` with `p-5` sits inside the shell's `main`, which already has `p-5` (`app/shell.tsx:65`), with no `bg-card`, border or `text-card-foreground`, and the breadcrumb is inside the same `div`. **Add** has neither `bg-secondary` nor `text-secondary-foreground`; its `data-variant="secondary"` is a marker with no styling behind it. Both token sets are in the built CSS, because sibling screens use them.
- **Expected evidence/behavior**: UX design 1.5 Page Layout: "Breadcrumb *Research › Compare*. One `card` at full width (brief §2.5) holding `h1` …". Component Mapping: "Page region | `card` | `default`". Token Usage: "`--secondary` on `--secondary-foreground` for **Add**". The sibling screens show both: `universes/index.tsx:170` (`rounded border border-border bg-card p-4 text-card-foreground`) and `universes/detail/summary-header.tsx:245` (`bg-secondary text-secondary-foreground`).
- **Impact**: Compare is the only CAP-002 research screen without its card, and **Add** reads as an outline control rather than the secondary action. The effect is visual; no current test observes it.
- **Required remediation**: Put the `h1`, entry row, messages and table in the full-width card the sibling screens use, with the breadcrumb above it, and give **Add** the secondary tokens.

### IR-005 — The evidence cache can show one set's inputs under another set's scores

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion covers a set completing during the visit)
- **Tasks**: T012 (behaviour); T010 (the read-budget assertion)
- **Files**: `web/src/screens/research/compare/index.tsx:115, 152, 171, 225, 285` (`inputs: evidence[symbol]?.inputs ?? []`); `web/src/screens/research/compare/compare.test.tsx:259-270`
- **Claim challenged**: T010 asserts "one list read plus one evidence read per column", and the cycle-2 evidence calls the read path complete.
- **Observed evidence**: Evidence is cached by symbol for the life of the screen and never compared with the list read's set. Every URL change re-issues the list read, while columns already in the cache keep their old evidence. Suppose a set completes while the owner is on Compare, and they then add or remove a stock. The percentiles and standardised scores come from the new set, while the cached columns' input rows (values, statuses, dates and marks) come from the old one, and nothing on screen says so. Both reads carry `set.setId` (`classification-types.ts:139` for evidence; the list's `set`), so the mismatch is detectable. The cache itself is also unpinned: `manual:ix-evidence-no-cache`, which re-reads every column's evidence on every change, passes, because the budget assertion runs on first render only.
- **Expected evidence/behavior**: STD-UI-16: "MUST NOT carry a last-known value forward … unless it states at the point of display that it has done so". UX design 1.5 *Arriving* has one list read for the scores and one evidence read per column for the input rows. DEC-0175 has Compare render "the set it reads", which is one set. Classification-ui §5: "one evidence call per column".
- **Impact**: After a set refresh mid-visit, a column can read *Incomplete* in the new set above input rows that show every input present from the old set, or the reverse. This can happen only when a daily set completes during the visit, so it is rare, but when it happens nothing tells the owner.
- **Required remediation**: Never render a column's input rows from an evidence read of a different set than the list read on screen. Pin the per-column read budget after **Add** and **Remove** (so that `ix-evidence-no-cache` fails), and pin the re-read on a set mismatch.

### IR-006 — The table's additional tests let four contract mutants survive

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete; the behaviours serve AC-16, AC-23, DAC-E5-S1-1)
- **Tasks**: T005, T006, T007 (tests); T011 (behaviour)
- **Files**: `web/src/components/patterns/comparison-table.tsx:133, 135, 144, 284`; `web/src/components/patterns/comparison-table.test.tsx:57-74, 265-301, 319-328, 420-449, 455-490`
- **Claim challenged**: Cycle 1 reports a mutation score of 1.0 for `comparison-table.tsx`.
- **Observed evidence**: Four manual mutants pass every focused suite:
  - `ct-dates-label-asof` prints the *As of* date under the label *Known on*. T007 checks that both dates appear, not which label each one sits under.
  - `ct-percentile-showscore` passes `showScore` to `FactorCell`, so the standardised score also prints inside the percentile cell. The precision test uses a "contains" match on the percentile cell.
  - `ct-missing-shows-value` prints a `missing` input's value instead of the em dash. The `input()` fixture nulls the value of every missing row (`:67`).
  - `ct-input-mark-const-factor` passes the factor `"value"` to the input row's mark, so a momentum input flagged `restatedPossible` would show it. T006 flags only `book_to_price`.
- **Expected evidence/behavior**:
  - DEC-0078 and UX design 1.5: the input's `as_of` and `known_on` appear beneath each value, and STD-UI-13 asks for "the date it was known".
  - UX design 1.5 and T011: the percentile row draws "number, bar, mark", with the standardised score in its own row beneath.
  - DEC-0077: `missing` renders the em dash followed by *Missing*.
  - T006 and DEC-0075: the mark is "never on momentum".

  As built, the engine writes a value only for `present` inputs and never flags a momentum input (`value_inputs.sql:163`, `momentum_inputs.sql:243`), so the last two cannot be reached yet. Adversarial-review E.9 judges them against the contract.
- **Impact**: The production code is correct. If the disclosure's labels were swapped, the owner would read the date a value describes as the date it was known, and no test would fail. The other three would duplicate a score or misplace a marker.
- **Required remediation**: Make each mutant fail a test:
  - assert each date beside its own label;
  - assert the percentile cell's exact content, with no score in it;
  - assert that a `missing` row with a non-null value renders only the em dash and *Missing*;
  - assert that a momentum input with `restatedPossible: true` shows no mark.

### IR-007 — The restated sentence's rule is pinned only for percentile marks

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (DAC-E5-S1-5 and AC-23 are satisfied for percentile marks)
- **Tasks**: T012 (behaviour); T006 (marks on input rows)
- **Files**: `web/src/screens/research/compare/index.tsx:87-93` (`hasMark`); `web/src/screens/research/compare/compare.test.tsx:235-255`
- **Claim challenged**: The cycle-2 evidence claims "the STD-UI-17 sentence once under the table" at a mutation score of 1.0.
- **Observed evidence**: `manual:ix-hasmark-no-inputs` makes the sentence follow percentile marks only, and it survives: no screen test puts a mark on an input row alone. That case can happen. Take a value factor that is *Incomplete* because `fcf_yield` is missing, while `book_to_price` is present and backfilled. The mark appears on the input row (`comparison-table.tsx:135`) and not on the *Incomplete* percentile, so under the mutant a mark is on screen with no sentence explaining it. `manual:ix-hasmark-momentum-cells` and `manual:ix-hasmark-momentum-inputs`, which count a momentum flag, survive too: the "omits the sentence" test flags nothing at all.
- **Expected evidence/behavior**: T012: "Render the STD-UI-17 sentence once … only when at least one mark is on screen". DEC-0176 (a). T006 puts marks on backfilled input rows. STD-UI-17 requires the mark to propagate.
- **Impact**: The production code is correct. A regression would leave the mark unexplained exactly on *Incomplete* factors, where the owner most needs the explanation.
- **Required remediation**: Add screen tests. A lone input-row mark should render the sentence once. A momentum cell or momentum input flagged `restatedPossible`, with no other mark, should render no sentence. All three mutants should then fail.

### IR-008 — The screen's read, notice and URL rules are unpinned

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete; the rules serve DAC-E5-1, DAC-E5-S1-2)
- **Tasks**: T002, T012 (behaviour); T008, T009, T010 (tests)
- **Files**: `web/src/screens/research/compare/index.tsx:35, 43-45, 146, 230, 265, 358`; `web/src/screens/research/compare/compare.test.tsx:220-232, 280-291, 377-388, 440-449`
- **Claim challenged**: The cycle-2 evidence reports a mutation score of 1.0 for `compare/index.tsx`.
- **Observed evidence**: Six manual mutants pass every focused suite:
  - `ix-hasallfactors-some` builds the single column when any factor key is present. T010's fixture is `factors: {}`, where "every key" and "any key" agree.
  - `ix-activelist-stale` keeps a stale list, with its cells and factor summary, when a comparison shrinks to one column. The test "shows the prompt above the one remaining column from evidence alone" gives the list and the evidence identical cells and a ranked summary, so it cannot tell them apart.
  - `ix-url-no-encode` writes the URL without `encodeURIComponent`. Every fixture symbol is unchanged by encoding. The case can happen through a hand-edited URL: from `?symbols=A%26B,MSFT,AAPL`, removing MSFT writes `?symbols=A&B,AAPL`, which then parses as the single symbol `A`.
  - `ix-notcompared-join` (joined by `","`) and `ix-reported-reversed` (reversed order) survive because every notice test names one symbol.
  - `ix-add-overflow-unguarded` lets an **Add** whose read finishes after the URL has reached six write a seventh symbol.
- **Expected evidence/behavior**:
  - T012: check "`evidence.factors[f] === undefined` for any of the three".
  - DEC-0176 (b): a single column is built from its evidence read, with the not-enough-to-rank statement reduced to the cell badges.
  - T012 and DEC-0163: each symbol is passed through `encodeURIComponent`.
  - T002: `{SYMBOLS}` is "joined by ", " in the order received".
  - DEC-0070: a seventh symbol is refused before the request.
- **Impact**: The production code is correct, but each rule can regress silently. As designed, the API never sends a partial `factors` record (DEC-0140). If one arrived under the "any key" mutant, the table would read an undefined cell and the render would throw.
- **Required remediation**: Make each mutant fail a test:
  - a partial `factors` record (for example `value` only) produces no column and the notice;
  - shrinking to one column, with a list whose cells or summary differ from the evidence, shows the evidence;
  - **Remove** from a URL holding a reserved character leaves an encoded `search`;
  - a notice naming two symbols keeps the received order and the `", "` join;
  - an **Add** that completes after the URL reaches six writes nothing.

### IR-009 — The nine strings T002 added are anchored nowhere

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete)
- **Tasks**: T002 (strings); T004 (the TC-COMP-129 notice), T006 (row labels), T008 (the duplicate error names the symbol)
- **Files**: `web/src/screens/research/copy.ts:810-831`; `web/src/screens/research/copy.test.ts:426-461` ("(d) holds the design's %j verbatim"), unchanged by this change
- **Claim challenged**: T002 is checked complete, and the plan's checkpoint says "`copy.ts` holds every compare string".
- **Observed evidence**: The tests read every new string from `COMPARE`, so changing a string changes both sides of the assertion. Five manual copy mutants pass every focused suite:
  - `cp-notcompared-wording` rewrites the owner-adopted notice. Only TC-COMP-129's negative check on *doesn't follow* guards it.
  - `cp-duplicate-drops-symbol` stops the duplicate error from naming the symbol. T008's test still passes because it reads `COMPARE.duplicate("AAPL")`.
  - `cp-label-eps`, `cp-label-fcf` and `cp-label-return-12m` change three row labels.
- **Expected evidence/behavior**: T002 fixes the notice's wording, which the owner adopted through fix E5-F03 and which DEC-0176 records as amended. T008 asks for "a field error naming it", and T006 fixes the row labels. Every earlier CAP-002 story that added copy anchored it in `copy.test.ts`, and every manual copy mutant in the earlier reviews' mutation files was killed: E4-S5, E4-S7, E4-S8, E4-S9, E1-S7 and E1-S9.
- **Impact**: The owner-adopted notice, the row labels and the duplicate error's naming can all drift while every test stays green.
- **Required remediation**: Anchor the new strings in `copy.test.ts`, the templated ones with an example argument, as earlier stories did, so that the five mutants fail.

### IR-010 — Never-populated with two or more symbols also names every symbol as not compared

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012, T010
- **Files**: `web/src/screens/research/compare/index.tsx:268-278`; `web/src/screens/research/compare/compare.test.tsx:415-424`
- **Claim challenged**: T010 says `neverClassified: true` renders "the never-populated statement".
- **Observed evidence**: With `neverClassified` and no rows, the loop pushes every symbol into the notice. The screen then reads *No stocks have been scored yet.* together with *Not compared because there is no current score for AAA, BBB.* The single-symbol path renders only the statement (`:292-293`). The test does not look for the notice.
- **Expected evidence/behavior**: UX design 1.5 States, *Never scored*: "Section 1.1's statement, with the chosen symbols kept in the URL". DEC-0176 (b) gives the same treatment for one symbol. The extra notice is true, so this is a matter of consistency.
- **Impact**: The never-scored screen states the same fact twice.
- **Required remediation**: Optional. While the list read is never-classified, show the statement alone, whether the symbols arrive in `unknown_symbols` or through the not-returned rule, and assert it.

### IR-011 — The comparison table does not take the data-table row tokens

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/components/patterns/comparison-table.tsx:66-68` (`px-3 py-2`), rows `:160, 263, 277, 288`
- **Claim challenged**: The comparison table is "a native `<table>` with the `data-table` token set".
- **Observed evidence**: Cells use `px-3 py-2` (`--space-3`, `--space-2`), rows have no `h-row`, and there is no row rule. `--cell-padding-y` is `--space-1` (`design-system/theme.css:237`). Delivered tables use `h-row border-t border-border` (`results-table.tsx:788`, `members-tab.tsx:539`, `history-tab.tsx:246`).
- **Expected evidence/behavior**: Classification-ui §10: "Every table consumes `--row-height`, `--cell-padding-x` and `--cell-padding-y`". UX design 1.5: "the `data-table` token set".
- **Impact**: The comparison table's density and row rules differ from every other table in the product.
- **Required remediation**: Optional. Use the row and cell tokens wherever a row holds one line.

### IR-012 — The scroll container repeats the table's name as a landmark

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/components/patterns/comparison-table.tsx:239-248`
- **Claim challenged**: The container and table meet UX design 1.5 Accessibility.
- **Observed evidence**: A `<section aria-label="Comparison of {n} stocks" tabIndex={0}>` wraps a `<table aria-label="Comparison of {n} stocks">`. A named `section` is a region landmark, so assistive technology announces the same name twice and lists a landmark for the comparison. The container is a tab stop even when nothing scrolls.
- **Expected evidence/behavior**: UX design 1.5 Accessibility: "Horizontal scroll, where it occurs, is reachable by keyboard through the focusable table container". T011 asks for the label on the table.
- **Impact**: Redundant announcements, plus an extra tab stop at the design width.
- **Required remediation**: Optional. Keep the container focusable and named, but do not make it a landmark that repeats the table's label.

### IR-013 — TC-COMP-128 never presses Enter in the field

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (DAC-E5-S1-2 is satisfied)
- **Tasks**: T004
- **Files**: `web/src/screens/research/compare/compare.test.tsx:168-175`
- **Claim challenged**: T004 says "pressing it and pressing Enter in the field issue no request and add no column".
- **Observed evidence**: The test types `G`, clicks **Add** (which moves focus to the button) and then presses Enter, which lands on the button. Both paths reach the form's submit and the blocked guard (`index.tsx:216`), so no mutant separates them.
- **Expected evidence/behavior**: T004 as written.
- **Impact**: Evidence fidelity only.
- **Required remediation**: Focus the field before pressing Enter.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- T010: `ApiUnreachableError` renders nothing instead of "the unreachable state". This is justified: UX design 1.5 States gives *Unreachable* to the shell, `universes/index.tsx:117-118` does the same, and the plan's *Other Notes* record it.
- T012: the screen keeps a local `Read` union instead of `ScreenState`, because `ScreenState.error` carries a `message` the screen must never render. This is justified and recorded.
- Beyond the plan: a symbol that is neither a list row nor in `unknownSymbols` is named in the notice, and a single-symbol `instrument_not_found` joins the same notice. Both are justified by DAC-E5-1 ("never silently absent") and recorded.
- Row labels: *EPS growth* and *3/6/12-month return* follow the plan's T006 rather than UX design 1.5's *Earnings-per-share growth* and *total return*. The plan governs, and the deviation is recorded as an owner follow-up in the Notes.
- Bookkeeping: T012 and T014 are checked complete but are `PARTIAL` (IR-001, IR-002, IR-004). Otherwise the only plan and story edits are the checkbox flips, the Notes bullets and the status line. No out-of-scope file, dependency or configuration change.
- The state check without `--base-ref` reports `BLOCKED`; with the driver's integration branch it reports `ready`. This is an observation about invocation, not a defect in the change.
- No question in this review needed the owner, and no decision was recorded. Each judgment above names the artifact it rests on.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework CAP-002-E5-S1 with `$story-coding`, using the task file and this report. Resolve the HIGH findings IR-001 to IR-004 and the MEDIUM findings IR-005 to IR-009. The LOW findings IR-010 to IR-013 are optional. Then rerun `$adversarial-review`, which will take this report as its baseline and pass `CAP-002-E5-S1-implementation-review-v1-mutation.json` to `scope --previous`.
- **Warnings accepted downstream**: N/A
