---
artifact_schema_version: 1
artifact_id: CAP-002-E5-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-03
updated: 2026-11-03
story_id: "CAP-002-E5-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-03T08:09:54Z"
reviewed_head: "ddb57bfa06948f0cbc613346b45b543c16815205"
review_base: "543198fb17b3dc5f9905e113eb76eeb9a0760ef1"
reviewed_state_revision: "sha256:a63a058bb54a32f8d47116b63fc23d587964af906feb2b2e0c9c4d09757683b2"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E5-S2
    artifact_version: 1
    content_revision: sha256:7742294be541a1dd5a4b368c82f7f41eae9840ce1b429c7fdd6c5e8ce2f737ff
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-11-03T08:24:22Z
  source_artifacts:
    - id: CAP-002-E5-S2
      version: "1 (sha256:7742294be541a1dd5a4b368c82f7f41eae9840ce1b429c7fdd6c5e8ce2f737ff)"
    - id: CAP-002-E5-S2-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E5-S2-tdd-evidence
      version: "cycle-1 and cycle-2"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0178
      version: "owner-upheld"
    - id: DEC-0179
      version: "owner-upheld"
    - id: DEC-0180
      version: "owner-upheld (amended by E5-F01)"
    - id: DEC-0278
      version: "agent-decided, open"
    - id: STD-UI (ui-conventions)
      version: "current at review base"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E5-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 4 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 11/11 verified |
| Required validation | 7/7 passed |

`web/src/screens/research/stocks/history-tab.tsx` implements the Earlier scores panel as the story, the task plan and the owner-upheld DEC-0178, DEC-0179 and DEC-0180 specify. It reads one page on mount and renders the rows in the order received, each through the delivered `FactorCell`. It never sorts, filters, re-dates or recomputes a row. The history sentence appears once above the table. The STD-UI-17 sentence appears once, and only when `FactorCell` actually draws a mark. An empty history reads *No earlier scores for {SYMBOL}.*, distinct from never scored. A retired stock's rows are not special-cased. Every required command passed when rerun independently. The TDD evidence lint is clean, and the two cycle patches replay onto the review base to reproduce HEAD byte for byte. The four mandatory TC tests (TC-COMP-154, 155, 115, 191) are adequate.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 4 · **total 6**

The mutation run had 130 mutants:

- 34 from the catalogue, over every changed production file.
- 29 written by this reviewer for the contract.
- 67 hand-written mutants from the coder, re-run independently rather than trusted.

115 were killed. Of the 15 survivors, 11 are equivalent. The other 4 are not, and each sits in an additional (non-TC) test:

- The two panel sentences' plan-specified `--muted-foreground` token (IR-001).
- The symbol in the skeleton's label, and in a later page's failure sentence (IR-002).

They make those additional tests `WEAK` and are MEDIUM, because the production code is right and no criterion is left incomplete. CAP-002-E4-S9 v1 rated non-equivalent survivors in additional tests the same way. Four LOW findings cover focus after **Try again**, a dead-end **Show more** after a refused cursor, the unreachable state during paging, and RED evidence for the review-driven rework.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S2.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S2-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E5-S2-run-20261103T034434Z` |
| HEAD | `ddb57bfa06948f0cbc613346b45b543c16815205` (`feat(research): CAP-002-E5-S2 story-coding`, one commit over the base, `Decision-Id: DEC-0278`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` (supplied by the supervised driver as `--base-ref`). Merge base `543198fb17b3dc5f9905e113eb76eeb9a0760ef1`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0). Resolved with `pipeline-state.py review-base --base-ref` |
| Working tree | Clean: no staged, unstaged or untracked non-ignored files before or after validation. The stories folder holds an empty `.claude/.cc-writes/` directory, which git does not track and which is outside the review subject |
| Changed files reviewed | 19: 4 source and test files, 3 story documents, 12 TDD evidence files |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/stocks/history-tab.tsx` | added (325 lines) | T008; AC-15, AC-18, AC-19, AC-23, DAC-E5-3, DAC-E5-4, DAC-E5-5, DAC-E5-S2-1 to -4 |
| `web/src/screens/research/stocks/history-tab.test.tsx` | added (962 lines, 56 tests) | T003 to T007, T009, T010 |
| `web/src/screens/research/copy.ts` | modified (+4) | T002: `EVIDENCE.earlierScoresFor`, `EVIDENCE.producedColumn`, each with a doc comment citing T002 or DEC-0179 |
| `web/src/screens/research/copy.test.ts` | modified (+3) | T002 anchors for the two added strings. T009 lists only three files; the Notes record why this one also changed |
| `.../stories/CAP-002-E5-S2-tasks.md` | modified | Checkbox flips for T001 to T011, plus the Notes the plan asks for (T001 names, T002 strings, T010, deviations). The diff shows no other change |
| `.../stories/CAP-002-E5-S2.md` | modified | `status: planning` to `in-review` only; content revision unchanged |
| `.../stories/CAP-002-E5-S2-tdd-evidence.yaml` | added | T011 |
| `.../stories/CAP-002-E5-S2-evidence/` (12 files: `cycle-1.patch`, `cycle-2.patch`, `red-cycle-1.log`, `red-cycle-2.log`, `green-cycle-1.log`, `green-cycle-2.log`, `mutants-cycle-1.json`, `mutants-cycle-2.json`, `mutation-cycle-1-results.json`, `mutation-cycle-2-results.json`, `full-suite.log`, `build.log`) | added | T011 evidence cited by the TDD evidence file |

`web/src/screens/research/stocks/index.tsx` (E5-S3) does not exist and was not created. No shell file, route or delivered pattern changed. No module other than its test imports `history-tab.tsx` (a grep of `web/src` for `history-tab` finds only the universe detail tab's own files and this test).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-15 | SATISFIED | `history-tab.tsx` has no lifecycle input and no retired branch; rows render as the read returns them (`:283-285`) | TC-COMP-115 `history-tab.test.tsx:173-183` | Story's display slice only: the history keeps a retired stock's earlier classifications. *Not followed* on the evidence screen is E5-S3's |
| AC-18 | SATISFIED | `getStockHistory` on mount (`:158`), **Show more** appends later pages (`:176-213`) | TC-COMP-154 (`:117-158`); paging (`:475-529`) | Earlier classifications are visible with their scores date |
| AC-19 | SATISFIED | Server order kept (`:283`); Scores date is `formatDate(row.classificationDate)`, the wire string after a shape check (`:77`; `format.ts` `formatDate`); values only through `FactorCell` | TC-COMP-154 incl. the out-of-order rows (`:151-158`); "shows the scores date as recorded, not the day the set ended" (`:444-455`) | Manual mutants `rv-order-sort-date` and `rv-scores-date-ended` are killed |
| AC-23 | SATISFIED | `FactorCell` draws the mark from each row's own `restatedPossible` (`:85`); `drawsMark` mirrors `FactorCell`'s scored branch (`:57-66`) | TC-COMP-191 (`:188-202`, `:532-548`); T004 (`:204-292`) | The mark stays with each row's classification, older rows included |
| DAC-E5-3 | SATISFIED | As AC-15 | TC-COMP-115 | No *Not followed* replaces a recorded cell |
| DAC-E5-4 | SATISFIED | Rows in received order; empty page renders `EVIDENCE.noEarlierScores` in place of the table (`:263-265`) | TC-COMP-154, TC-COMP-155 (`:161-170`) | |
| DAC-E5-5 | SATISFIED | `CELL.restatedExplanation` once above the table when `body.rows.some(marksARow)` (`:271-273`); no `aria-describedby` | T004 "states the restatement sentence once, above the table" (`:204-215`), the marked and unmarked cases (`:217-292`) | The panel's share of the once-per-screen rule. E5-S3 owns the Now panel's occurrence (DEC-0180) |
| DAC-E5-S2-1 | SATISFIED | `:283-285`, `:77`, `:85` | TC-COMP-154: order, dates as wire strings, each row's own percentiles and signed scores, history sentence exactly once, no re-sort | |
| DAC-E5-S2-2 | SATISFIED | `:263-265` | TC-COMP-155: *No earlier scores for AAPL.*, no table, neither never-scored sentence | Manual mutant `rv-empty-never-scored` is killed |
| DAC-E5-S2-3 | SATISFIED | No special case for a retired stock | TC-COMP-115 | |
| DAC-E5-S2-4 | SATISFIED | `:85` with `showScore`; the cell draws the mark | TC-COMP-191: the middle and oldest rows are marked on the exact cell, the newest is not; a later page leaves earlier marks unchanged | Manual mutants `rv-factor-prop`, `rv-cell-cross-row`, `rv-mark-any-flag` and `rv-mark-momentum` are killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | All six upstream files exist. The Notes record `getStockHistory`, `ClassificationApiError`, `StockHistory`, `StockHistoryRow`, `FactorCell`, `formatTimestamp` and `formatDate`, the `FactorCell` props, and `ApiUnreachableError` | The names match `classification-client.ts:851-876` and `classification-types.ts:146-161` |
| T002 | complete | VERIFIED | `copy.ts` +4; `copy.test.ts` +3 | Every other listed string already existed (`EVIDENCE.historyNote`, `noEarlierScores`, `SCORE_SET.historyColumns.scoresDate`, `complete`, `partial`, `showMore`, `RESULTS.tryAgain`, `CELL.restatedExplanation`, `FACTOR_LABELS`). The TC-COMP-072 scan passes in the full suite |
| T003 | complete | VERIFIED | `history-tab.test.tsx:115-202`, `:531-548`, each with `// Implements TC-COMP-nnn` | All four TCs are sharpened as the plan directs |
| T004 | complete | VERIFIED | `:204-292` | Once, above the table, absent when unmarked; momentum never marked. The test is `WEAK` on the sentence's token: IR-001 |
| T005 | complete | VERIFIED | `:295-372`, `:443-462` | Native table, `scope="col"`/`scope="row"`, Produced via `formatTimestamp`, *Complete* `status-good` and *Partial* `status-warning`, no run id, link, checkbox or row action, *Incomplete* kept, no `gain`/`loss` class |
| T006 | complete | VERIFIED | `:365-441`, `:473-529`, `:658-962` | One read on mount with `{ limit: 50 }`, **Show more** with the cursor, append order, focusable `aria-disabled`, no read on the same symbol, reset and one read on a new symbol, stale responses ignored |
| T007 | complete | VERIFIED | `:550-570`, `:573-655`, `:667-835` | Skeleton with the final columns, failure sentences by code (never `message`), **Try again**, unreachable renders nothing (the delivered Universes pattern; Notes deviation), a failed page keeps the rows. The test is `WEAK` on symbol threading: IR-002 |
| T008 | complete | VERIFIED | `history-tab.tsx` | Justified deviations: a local state union (DEC-0278); the return type is `JSX.Element \| null` for the unreachable case; the outcome badge is E4-S4's `StatusBadge`, whose `TIER_CLASSES` are exactly the token classes `coverage/badges.tsx` uses |
| T009 | complete | VERIFIED | Tests mount in a bare `MemoryRouter` with only `symbol`. The component uses no router hook and has one default export. `git diff --stat` lists the four source and test files plus T011 evidence. The full suite passes | `copy.test.ts` beyond T009's list is justified in the Notes |
| T010 | complete | VERIFIED | Column and row headers; badges carry word and shape; **Show more** `min-h-6` (`--space-6`, 32 px) with no focus suppression; `font-numeric` on dates and the Produced time; no polarity class; Notes updated | No axe assertion exists in `shell.a11y.test.tsx`, so none was added. The sentence tokens are unpinned: IR-001 |
| T011 | complete | VERIFIED | `CAP-002-E5-S2-tdd-evidence.yaml`, two cycles. The lint (with `--require-logs`) reports 0 errors and 0 warnings. `cycle-1.patch` and `cycle-2.patch` applied in order to a `git archive` of the base reproduce all four files at HEAD | Each cycle names its patch, logs, review verdicts and mutation results. The rework after each first REJECTED review has no RED record: IR-006 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `lists the rows in the order received…`, `does not re-sort rows whose order differs from their dates` / TC-COMP-154 | ADEQUATE | Three rows in received order; row-header text equals the wire dates; per-row percentiles `91/72/33`, `64/55/21`, `12/48/80` and signed scores; the history sentence exactly once; an out-of-date-order response stays in that order | none. `rv-order-reverse`, `rv-order-sort-date`, `rv-cell-cross-row` and `rv-scores-date-ended` are killed |
| `states that there are no earlier scores, apart from never scored` / TC-COMP-155 | ADEQUATE | Exact sentence; no table; `EVIDENCE.noScoreYet`, *no stocks have been scored* and *has no score yet* all absent | none. `rv-empty-never-scored` and the `body.rows.length` mutants are killed |
| `keeps a retired stock's recorded rows…` / TC-COMP-115 | ADEQUATE | The read is issued for `OLD`; two rows; six percentiles; no *Not followed*; no empty statement | The tab is given only the symbol, so the rows are the observable (plan T003) |
| `marks the older rows that carry it…`, `leaves the marks of rows already shown…` / TC-COMP-191 | ADEQUATE | Newest row unmarked; middle marked on its value cell, oldest on its growth cell; after a later page, the earlier rows' marks are unchanged and the sentence appears once | none |
| Restatement sentence and momentum tests (`:204-292`) / T004 | WEAK | Sentence once, before the table in DOM order, after the history note; absent when unmarked, when the flag sits on a cell `FactorCell` does not score (Incomplete, retired, not enough to rank, no percentile) and on momentum; no `aria-describedby` | The sentence's `--muted-foreground` token is unpinned (`rv-explanation-token` survives): IR-001 |
| Table content tests (`:295-372`, `:443-462`) / T005 | ADEQUATE | Label, `data-variant`, header order and scopes, row header, Produced text and `font-numeric`, outcome badge variants, no link, run id, `#n`, checkbox or in-table button, *Incomplete* kept, no `gain`/`loss` class, one read with `{ limit: 50 }` | none |
| Fetch-per-symbol and paging tests / T006 | ADEQUATE | Same-symbol rerender issues no read; a new symbol shows the skeleton, then reads once; late first-read and late page responses and failures after a symbol change are ignored; **Show more** cursor, append order, focusable `aria-disabled`, one read for repeated activation; focus kept on **Show more** while pages remain, moved to the table on the last page | none |
| State tests (`:550-570`, `:573-655`, `:667-835`) / T007 | WEAK | Skeleton table with five headers, three `colspan=5` placeholders and `aria-busy`; the three error codes and an unexpected error rendered by code with **Try again**; retry reissues `{ limit: 50 }`; unreachable renders nothing on first read and on paging; a failed page keeps rows with the alert after the table; refused cursors restart, transient failures re-read the same cursor | The skeleton's label is asserted only for AAPL (`rv-skeleton-label` survives). The page-failure test uses only codes whose sentence names no stock (`rv-page-error-symbol` survives): IR-002 |
| Accessibility and token checks spread across the file / T010 | WEAK | `scope` attributes, outcome word plus shape (through `StatusBadge`), `font-numeric` on the row header and the Produced time, **Show more** `data-variant="secondary"`, table `tabindex="-1"` and focus | The history sentence's `--text-xs`/`--muted-foreground` (T008) is unpinned (`rv-note-token` survives): IR-001 |
| `copy.ts` anchors (`copy.test.ts:516-518`) / T002 | ADEQUATE | Exact strings for both additions; the TC-COMP-072 scan passes | none. `rv-copy-label` and `rv-copy-produced` are killed |

**Mock validity.** Only `getStockHistory` is doubled, by `vi.mock` over `vi.importActual`, so the real `ClassificationApiError`, `FactorCell`, `RestatedMark`, `StatusBadge`, `copy.ts` and `format.ts` run. No assertion reads a mock's setup back as its result.

**Determinism.** No timers. The global `fetch` is stubbed by `test-setup.ts`. `formatTimestamp` fixes America/Chicago, so the expected strings do not depend on the machine zone. Late-settling promises are controlled explicitly with `act`.

**Regression sensitivity.** Measured below.

### Mutation run

The catalogue generated 34 mutants with `scripts/mutation-run.py generate --range 543198f..HEAD --cycle review`, over every changed production file: 17 negate-boolean, 13 off-by-one and 4 drop-field-copy. None was generated in `copy.ts`. This reviewer wrote 29 manual mutants (`manual:rv-*`) covering the sources of truth:

- order and dates;
- the cell passed to each column;
- the mark predicate and the sentence condition;
- the sentence tokens;
- labels;
- the empty statement;
- failure sentences by code and by symbol;
- the page cursor and pending state;
- the unreachable rendering;
- both `copy.ts` additions.

The coder's 67 manual mutants that still apply at HEAD (`manual:coder-*`) were re-run rather than trusted. Three of the coder's cycle-1 mutants no longer match HEAD and were replaced by `rv-symbol-dep`, `rv-reset-loading` and `rv-loaded-variant`.

All 130 were run with the focused suites (`history-tab.test.tsx`, `copy.test.ts`). The baselines passed on 6/6 workers. Results: 115 killed, 15 survived. The results file sits beside this report as `CAP-002-E5-S2-implementation-review-v1-mutation.json` (sha256 `ca96306b115d9b830ed1972d4bc4ea62739fcdc9ce7313c37a76505e94a609ac`).

| Survivor | Disposition | Reason |
|----------|-------------|--------|
| `history-tab.tsx:131:negate-boolean:1` (`pagePending` starts `true`) | equivalent | `pagePending` is read only in the loaded body (`:312`, `:314`). The mount effect sets it `false` (`:155`) before any read can settle into that body |
| `history-tab.tsx:133:negate-boolean:1` (`unreachable` starts `true`) | equivalent | The mount effect resets it (`:157`) in the same commit that issues the first read, so every state the plan names (skeleton, rows, empty, error) renders as specified. E5-S3 mounts the tab on activation, a discrete event, for which React 18 flushes passive effects before paint |
| `history-tab.tsx:135:negate-boolean:1` (`focusTable` starts `true`) | equivalent | Consumed by its effect on mount while `tableRef` is null under the skeleton, so nothing is focused |
| `history-tab.tsx:139:off-by-one:1` (`attempt` starts `1`) | equivalent | An opaque effect trigger, compared only for change |
| `history-tab.tsx:141:off-by-one:1` (`generation` starts `1`) | equivalent | Compared only with later values of the same counter |
| `history-tab.tsx:145:off-by-one:1` (unmount bump `+2`) | equivalent | Still differs from every captured value |
| `history-tab.tsx:152:off-by-one:1` (per-read bump `+2`) | equivalent | Changes the step, not whether a stale value differs. Removing the bump is killed (`coder-gen-bump`) |
| `history-tab.tsx:236:off-by-one:3` (skeleton keys `[0, 1, 3]`) | equivalent | Keys only; the same three rows render |
| `history-tab.tsx:254:off-by-one:1`, `:296:off-by-one:1` (`attempt + 2`) | equivalent | The trigger changes either way; removing it is killed (`coder-retry`, `coder-retry-dep`) |
| `manual:coder-fallback-op` | equivalent | `copy.ts` `ERROR_SENTENCES.internal_error` is `` `${action}: ${FALLBACK_ERROR}` ``, the same sentence a null code yields in `failureSentence` |
| `manual:rv-note-token` | **not equivalent** | IR-001 |
| `manual:rv-explanation-token` | **not equivalent** | IR-001 |
| `manual:rv-skeleton-label` | **not equivalent** | IR-002 |
| `manual:rv-page-error-symbol` | **not equivalent** | IR-002 |

The coder's eleven cycle-2 survivor dispositions agree with this review.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story …/CAP-002-E5-S2.md --stage adversarial-review` (no base ref) | harness root | 1 | N/A | `BLOCKED — story coding has not reached in-review`. The `story-coding` stage reports a TDD lint failure against the remote default branch, which counts the earlier E4-S9 commit; the wrong range |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` | harness root | 0 | PASS | `READY — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` | harness root | 0 | PASS | `543198fb17b3dc5f9905e113eb76eeb9a0760ef1`, which is also the integration ref's tip; `merge-base --is-ancestor` exit 0 |
| `npx vitest run web/src/screens/research/stocks/history-tab.test.tsx web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 2 files, 434 tests (56 + 378) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 73 files, 1887 tests |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome lint .`: 165 files, no fixes |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome format .`: 165 files, no fixes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite build. The built CSS holds `.min-h-6{min-height:var(--space-6)}`, `bg-secondary`, `text-secondary-foreground`, `font-numeric` and `w-fit` |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/…/CAP-002-E5-S2-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 543198fb17b3dc5f9905e113eb76eeb9a0760ef1 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `git archive` of the base's `web/src/screens/research`, then `git apply cycle-1.patch`, `git apply cycle-2.patch`, and `cmp` against `git show HEAD:<file>` | reviewer scratchpad | 0 | PASS | All four files match HEAD; the patch sha256 values equal each cycle's `diff_sha256` |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 543198fb17b3dc5f9905e113eb76eeb9a0760ef1..HEAD --cycle review --out $SCRATCH/mutants.json` (`$SCRATCH` is the reviewer session's scratchpad, outside the component repo) | harness root | 0 | PASS | 34 mutants; 96 manual mutants appended |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/mutants.json --jobs 6 --command 'ln -s <abs>/repos/factorflow-v2/FactorFlow-v2/node_modules node_modules; npx vitest run web/src/screens/research/stocks/history-tab.test.tsx web/src/screens/research/copy.test.ts' --out $SCRATCH/mutation-results.json --logs $SCRATCH/mutation-logs` (the exact command is recorded in the copied results file) | harness root | 3 | PASS (evidence) | Exit 3 signals survivors. 115 killed and 15 survived, dispositioned above. Results were written outside the component repo, then copied beside this report |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the plan's Validation Plan and the story's Validation list. The Playwright spec that would cover flow 5 (`tests/e2e/fix-insufficient-evidence.spec.ts`) is Phase 6b automation, and no route or routed module imports `history-tab.tsx` (E5-S3 mounts it, E4-S10 routes the screen), so the E2E suite cannot reach this change. Same treatment as the CAP-002-E4-S9 v1 review |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact docs/capabilities/…/CAP-002-E5-S2.md` | harness root | 0 | PASS | `sha256:7742294b…f737ff`, equal to the story's approved `reviewed_revision` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before and after validation) | harness root | 0 | PASS | `sha256:a63a058bb54a32f8d47116b63fc23d587964af906feb2b2e0c9c4d09757683b2` both times |

The Python validation commands in `tech-stack.md` (`uv …`) are not applicable: this change touches no Python file.

### Validation Side Effects

- Before: clean working tree at `ddb57bf`; fingerprint `sha256:a63a058b…83b2`.
- After: clean working tree at `ddb57bf`; same fingerprint. `npm run build` and the build-output test write into the git-ignored `src/factorflow/api/static/`. The mutation runner works in clones under the reviewer's temporary directory.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | initial | The two panel sentences' plan-specified `--muted-foreground` token is not pinned; two non-equivalent mutants survive |
| IR-002 | MEDIUM | initial | The symbol is not pinned in the skeleton's label or in a later page's failure sentence; two non-equivalent mutants survive |
| IR-003 | LOW | initial | Focus is lost to `<body>` after each **Try again** (STD-UI-24) |
| IR-004 | LOW | initial | After a refused cursor, **Show more** stays offered and resends the cursor the API refused |
| IR-005 | LOW | initial | An unreachable read blanks the panel with no recovery while the shell still answers, and discards the rows already shown when it happens on **Show more** |
| IR-006 | LOW | initial | The tests and behaviour added in each cycle's review-driven rework have no RED record |

### IR-001 — The two panel sentences' plan-specified `--muted-foreground` token is not pinned; two non-equivalent mutants survive

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. No criterion is made incomplete; the sentences serve AC-19, AC-23 and DAC-E5-5
- **Tasks**: T004, T010 (tests); T008 (the behaviour)
- **Files**: `web/src/screens/research/stocks/history-tab.tsx:270` (history sentence `<p className="text-xs text-muted-foreground">`), `:272` (STD-UI-17 sentence, same classes); `web/src/screens/research/stocks/history-tab.test.tsx:204-225`, `:147`
- **Claim challenged**: The TDD evidence reports cycle 1 at mutation score 1.0. The plan's Notes say T010's token checks are component tests.
- **Observed evidence**: Two mutants pass every focused test:
  - `manual:rv-note-token` removes `text-muted-foreground` from the history sentence.
  - `manual:rv-explanation-token` removes it from the STD-UI-17 sentence.

  The tests assert each sentence's text, its count and its DOM order relative to the table, never its classes. The same file already asserts `font-numeric` on the row header and the Produced time, so the pattern exists.
- **Expected evidence/behavior**:
  - T008: "Render, above the table, the history sentence once (`--text-xs`, `--muted-foreground`)".
  - ux-design 1.6 *Token Usage*, which T010 reviews against: "`--muted-foreground` for … the restatement explanation".
  - Adversarial-review E.9: a survivor that is not equivalent makes the test that should kill it `WEAK`.
- **Impact**: The production code is correct today. A regression that dropped the token would draw both sentences at full foreground strength, competing with the table they annotate, and the suite would pass. The visual effect is small. That belongs here and does not lower the severity.
- **Required remediation**: Make both mutants fail a test. For example, assert that each sentence's element carries `text-muted-foreground` (and `text-xs`), as the existing `font-numeric` assertions do.

### IR-002 — The symbol is not pinned in the skeleton's label or in a later page's failure sentence; two non-equivalent mutants survive

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. No criterion is made incomplete; the behaviour serves T005's labelled table and T007's states
- **Tasks**: T007 (tests); T005, T008 (the behaviour)
- **Files**: `web/src/screens/research/stocks/history-tab.tsx:229` (skeleton `aria-label={EVIDENCE.earlierScoresFor(symbol)}`), `:290` (`sentenceFor(pageError, symbol)`); `web/src/screens/research/stocks/history-tab.test.tsx:377-408`, `:550-570`, `:575-597`
- **Claim challenged**: T007's tests pin the loading and failed-page states.
- **Observed evidence**: Two mutants pass every focused test:
  - `manual:rv-skeleton-label` hard-codes the skeleton's label to `AAPL`. The skeleton test renders only AAPL. The symbol-change test (`:395-402`) shows the MSFT skeleton but asserts only `aria-busy` and the absence of AAPL's percentiles, not the label.
  - `manual:rv-page-error-symbol` passes an empty symbol to the later page's failure sentence. Every failed-page test uses `cursor_stale`, `cursor_invalid` or `internal_error`, none of whose sentences names the stock.
- **Expected evidence/behavior**:
  - T005: the table is "labelled *Earlier scores for {SYMBOL}*". The skeleton is that table while the read is pending (T007), and the component labels it by symbol.
  - ux-design 1.6 *States*: `instrument_not_found` reads *FactorFlow doesn't follow a stock named XYZ.* `copy.ts` `ERROR_SENTENCES.instrument_not_found` names `symbols[0]`. T007 requires a failed **Show more** to state its error, chosen by code, beneath the rows.
  - Adversarial-review E.9.
- **Impact**: The production code is correct today. Two regressions would pass the suite:
  - A skeleton labelled with a stale symbol (for example, from a ref holding the previous one) would announce the previous stock while the new one loads. That is the window the symbol-change test already sets up.
  - A later-page `instrument_not_found` would read *FactorFlow doesn't follow a stock named .*. That path is unlikely in practice, because followed stocks are retired rather than deleted. That belongs here and does not lower the severity.
- **Required remediation**: Make both mutants fail a test:
  - Assert the skeleton's accessible name in the symbol-change test (*Earlier scores for MSFT*).
  - Add a failed later page whose code names the stock (`instrument_not_found`) and assert the sentence names it.

### IR-003 — Focus is lost to `<body>` after each **Try again** (STD-UI-24)

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007, T010
- **Files**: `web/src/screens/research/stocks/history-tab.tsx:252-258` (first-read **Try again**: the effect returns the body to the skeleton, unmounting the button), `:291-304` (page-level **Try again**: `readMore` clears `pageError` at `:180`, unmounting the button; the refused-cursor branch `:296` returns to the skeleton)
- **Claim challenged**: T010's accessibility review is complete. The TDD evidence lists "focus after Try again (as the sibling tab)" as an accepted LOW advisory.
- **Observed evidence**: In all three paths the activated button unmounts, and no element receives focus. The last-page focus move (`:186-188`) applies only when **Show more** had focus.
- **Expected evidence/behavior**: STD-UI-24: "focus MUST be managed on dialogs and on content inserted into the page". The owner-upheld DEC-0256 applied it to **Try again** on the Universes list (`universes/index.tsx` `retry()` moves focus to the lifecycle select). CAP-002-E1-S7 v1 IR-007 rated the same gap LOW.
- **Impact**: A keyboard or screen-reader user who retries loses their place, and the next Tab starts from the top of the document.
- **Required remediation**: After each **Try again**, move focus to a stable target, such as the table once it is loaded, or keep the activated control mounted.

### IR-004 — After a refused cursor, **Show more** stays offered and resends the cursor the API refused

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006, T007
- **Files**: `web/src/screens/research/stocks/history-tab.tsx:45-50` (`isRefusedCursor`), `:288-322`; `web/src/screens/research/stocks/history-tab.test.tsx:686-698` ("clears the alert while the next page is read" activates **Show more** after `cursor_stale`)
- **Claim challenged**: A failed page offers the recovery that exists.
- **Observed evidence**: On `cursor_stale` or `cursor_invalid`, the alert and **Try again** appear, and **Try again** correctly restarts from the first page. **Show more** stays enabled with the same `nextCursor`, though. Activating it re-sends the cursor the API just refused.
- **Expected evidence/behavior**: `component-design-classification-api.md` `CursorError` returns `422 cursor_stale` "when the cursor names another set or ordering". That is deterministic, so the same cursor cannot succeed, and the alert itself says *Reload it, then try again*. STD-UI-19: "offer a recovery action where one exists". The coder's cycle-2 review noted it ("Show more stays beside the page-level Try again") and accepted it as LOW.
- **Impact**: A control that cannot succeed sits beside the one that can. Activating it reproduces the same failure.
- **Required remediation**: After a refused cursor, hide or block **Show more** (or make it restart as **Try again** does) until the first page is read again.

### IR-005 — An unreachable read blanks the panel with no recovery while the shell still answers, and discards the rows already shown when it happens on **Show more**

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `web/src/screens/research/stocks/history-tab.tsx:168-170`, `:205-207`, `:222-224`; `web/src/screens/research/stocks/history-tab.test.tsx:649-655`, `:700-709`; `web/src/app/status-region.tsx` `useHealthPolling`; `web/src/app/shell.tsx:33`
- **Claim challenged**: Unreachable is left to the shell, which owns that state.
- **Observed evidence**: Any `ApiUnreachableError` sets `unreachable`, which renders `null`. Only a symbol change or a remount clears it. The shell switches to its unreachable state only when its own 30-second health poll fails. Consider a single failed fetch followed by a health poll that succeeds:
  - The Earlier scores panel stays empty with no **Try again**, because E5-S3 keeps the tab mounted.
  - When the failed fetch was **Show more**, the rows already shown disappear.

  The test at `:700-709` asserts this as intended.
- **Expected evidence/behavior**: T007 says both "`ApiUnreachableError` renders the shell's unreachable state" and "a failed **Show more** keeps the loaded rows and shows the error beneath them". STD-UI-19 requires a recovery action where one exists. The implementation follows the delivered Universes screen (`universes/index.tsx:91-93`, `:117-119`), a defensible reading of T007's first clause. The second clause is not honoured when the API is unreachable.
- **Impact**: Narrow, because it needs a transport failure while the shell's health poll still succeeds. When it happens, the panel stays blank until the owner navigates away.
- **Required remediation**: On an unreachable **Show more**, keep the loaded rows. While the shell still reports the API answering, offer **Try again** (for example, by reading `useHealth()` liveness). Alternatively, record a decision that the shell's poll is the only recovery.

### IR-006 — The tests and behaviour added in each cycle's review-driven rework have no RED record

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `.../stories/CAP-002-E5-S2-tdd-evidence.yaml` (cycle-2 `red_evidence`, `green_evidence`); `.../CAP-002-E5-S2-evidence/red-cycle-2.log` (38 tests, 11 failed); `.../green-cycle-2.log` (56 `history-tab` tests)
- **Claim challenged**: Each cycle carries its RED and GREEN evidence (T011; INV-TDD-001).
- **Observed evidence**: Cycle 2's RED ran 38 history-tab tests, and GREEN and HEAD have 56. The 18 tests added after the cycle's first REJECTED code review and its spec-drift findings come with production behaviour:
  - the page-level **Try again**;
  - the refused-cursor restart;
  - focus moving to the table on the last page;
  - the stock named in `instrument_not_found`;
  - the first-read failure race guard.

  Cycle 1 likewise grew after its RED, which failed at file load, when its first review was REJECTED. The evidence describes the rework in prose but records no failing run for these tests.
- **Expected evidence/behavior**: INV-TDD-001 applies RED and GREEN to every implementation task. T011 asks each cycle for "its RED/GREEN evidence".
- **Impact**: Evidence quality only. This review's mutation run shows that each rework test kills the mutant it targets: `coder-refused-*`, `coder-retry-page-reads`, `coder-focus-*`, `coder-symbols` and `coder-first-catch-guard` are all killed. Their regression sensitivity is therefore established independently.
- **Required remediation**: When a cycle is reworked after its review, append a RED run of the added tests against the pre-rework component, or record the rework as its own cycle.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified: `copy.test.ts` changed, though T009 lists only three files.** The T002 anchors belong there; the Notes record it.
- **Recorded decision: a local state union replaces `ScreenState` (DEC-0278, agent-decided, open, not yet owner-reviewed).** No rendered state differs from T007. The choice matches CAP-002-E1-S8's reviewed `HistoryTab` (DEC-0271). One observation for the owner's review of DEC-0278: its rejected alternatives omit the delivered Universes screen's pattern, which stores the `failureSentence` output, never the envelope text, in `ScreenState.message` (`universes/index.tsx:96-103`).
- **Justified: the return type is `JSX.Element | null`, where T008 has `JSX.Element`.** The unreachable case renders nothing (Notes; IR-005 covers its consequence).
- **Justified: the outcome badge uses E4-S4's `StatusBadge`, not the classes in `coverage/badges.tsx`.** Its `TIER_CLASSES` (`runs/outcome-badge.tsx:75-82`) are the same `bg-status-good-muted text-status-good` and `bg-status-warning-muted text-status-warning` pairs. It also draws the tier shapes UX design 1.2 asks for.
- **Owner-upheld decisions applied as written:**
  - DEC-0178: default export, **Show more** paging at 50.
  - DEC-0179: Produced from `ended_at`, no download link, run id or number.
  - DEC-0180, as amended by E5-F01: the sentence once above the table, no `aria-describedby`, no `RestatedMark` in the tab.
- **Additions beyond the plan's text, justified:**
  - Focus moves to the table when the last page removes a focused **Show more** (STD-UI-24, as the E1-S8 tab does).
  - A failed page offers **Try again**, which restarts from the first page after a refused cursor (STD-UI-19).
  - A generation counter discards responses from an earlier symbol or attempt.

  Each came from the cycle-2 code review or spec drift and is tested.
- **Bookkeeping:**
  - All 11 tasks are ticked, and all 11 are `VERIFIED`.
  - The story changed only `status: planning` to `in-review`, the `story-coding` lifecycle. Its content revision is unchanged.
  - The coder's cycle-2 survivor dispositions agree with this review.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E5-S2 against this report. The MEDIUM and LOW findings are carried as warnings. Any later rework of them needs a new review version.
- **Warnings accepted downstream**: IR-001, IR-002 (MEDIUM); IR-003, IR-004, IR-005, IR-006 (LOW)
