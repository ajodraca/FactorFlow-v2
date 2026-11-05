---
artifact_schema_version: 1
artifact_id: CAP-002-E5-S1-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-04
updated: 2026-11-04
story_id: "CAP-002-E5-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-11-05T01:10:38Z"
reviewed_head: "9a4ca1cb69efc09e47092b2c9f96b0412e87a12d"
review_base: "543198fb17b3dc5f9905e113eb76eeb9a0760ef1"
reviewed_state_revision: "sha256:4c39aa36233fbfe4f64e902116527f6db9eb0359303ad0ea904bbb1e9e45c987"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E5-S1
    artifact_version: 1
    content_revision: sha256:4c309eb55e8c43939e652cb99abba5395f9554141d1aa1374ade2efef97cd8e5
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-05T01:19:18Z
  source_artifacts:
    - id: CAP-002-E5-S1
      version: "1 (sha256:4c309eb55e8c43939e652cb99abba5395f9554141d1aa1374ade2efef97cd8e5)"
    - id: CAP-002-E5-S1-tasks
      version: "1 (updated 2026-11-04, last_reworked_review v2)"
    - id: CAP-002-E5-S1-tdd-evidence
      version: "cycle-1 to cycle-4"
    - id: CAP-002-E5-S1-implementation-review
      version: "2 (baseline; reviewed_head 990d8dc10f6ecb7e861713192763c2d20291f9d5)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "current at review base"
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
    - id: design-system form, input, button and theme specifications
      version: "current at review base"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E5-S1 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 4 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 6/6 passed |

The rework commit `9a4ca1c` resolves v2's only blocking finding and every MEDIUM finding:

- **v2 IR-001 (HIGH)**: TC-COMP-129, the v1 field-error test and the duplicate test now assert the error's `text-[hsl(var(--destructive))]` class (`compare.test.tsx:218, 790, 850`). `manual:v2-ix-error-not-destructive` is killed by all three.
- **v2 IR-002 (MEDIUM)**: a removal to one column with a synchronous `fireEvent.click`, asserted before any `await` (`:1059-1078`), kills `manual:ix-activelist-stale`.
- **v2 IR-003 (MEDIUM)**: a column whose cached evidence has `set: null` is re-read once the list has a set (`:1080-1104`), which kills `manual:v2-ix-set-null-cached-same`.
- **v2 IR-005 (MEDIUM)**: the entry field is drawn in `border-input`, with `aria-[invalid=true]:border-[hsl(var(--destructive))]` (`index.tsx:348`), and both classes are pinned (`:1032-1046`).

Two of the optional LOWs are also resolved: the `h1` is now `text-lg` (v2 IR-006), and TC-COMP-128 presses Enter in the field (v2 IR-011). Cycle 4's evidence fixes v2 IR-007's practices: its patch embeds no evidence file, and its RED log shows the two tests that could fail.

Every required command passed when I reran it, and the TDD evidence lint is clean. In my mutation run, 161 of 167 mutants were killed. All six survivors are equivalent:

- five carried from v2, whose reasons I rechecked against the current artifacts;
- one new `late` mutant, which the API contract makes unobservable.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 4 · **total 5**

Nothing blocks:

- **IR-001 (MEDIUM, late)** is new. **Add** shows no submitting state while its evidence read is in flight, contrary to the form and button specifications that UX 1.5 cites. The baseline could have found it on unchanged lines, so it may not block.
- **IR-002 to IR-005** are v2's still-open LOW findings, carried as they were.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E5-S1-run-20261103T034434Z` |
| HEAD | `9a4ca1cb69efc09e47092b2c9f96b0412e87a12d` (`feat(research): CAP-002-E5-S1 story-coding rework of review v2`). Five commits over the base: `6ea0ecb` coding, `5f1e46b` review v1, `990d8dc` rework 1, `1530ffb` review v2, `9a4ca1c` rework 2 |
| Review base | Supplied by the invoking driver as integration base `543198f`. `pipeline-state.py review-base --base-ref 543198f` resolves `543198fb17b3dc5f9905e113eb76eeb9a0760ef1`, and `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 37 from base to HEAD: 5 source files, `copy.test.ts`, 3 plan and story files, the v1 and v2 reports with their mutation files, and 24 TDD evidence files. 12 of them changed since the baseline |
| Baseline | v2, `CAP-002-E5-S1-implementation-review-v2.md`, CHANGES-REQUIRED, `reviewed_head` `990d8dc10f6ecb7e861713192763c2d20291f9d5`, with `-v2-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/comparison-table.tsx` | added (322; unchanged since v2) | T011, T014; AC-15, AC-16, AC-23, DAC-E5-1, DAC-E5-3, DAC-E5-5, DAC-E5-S1-1, DAC-E5-S1-4, DAC-E5-S1-5 |
| `web/src/components/patterns/comparison-table.test.tsx` | added (725; unchanged since v2) | T003, T005, T006, T007 |
| `web/src/screens/research/compare/index.tsx` | added (404; 2 lines changed since v2) | T012; AC-16, DAC-E5-1, DAC-E5-S1-2, DAC-E5-S1-3, DAC-E5-S1-5. Since v2: `:333` `h1` is `text-lg` (was `text-xl font-semibold`, v2 IR-006); `:348` the input's classes are `border-input` plus the `aria-[invalid=true]` destructive border (was `border-border`, v2 IR-005) |
| `web/src/screens/research/compare/compare.test.tsx` | added (1105; +81/-4 since v2) | T004, T008, T009, T010. Since v2: three class assertions for v2 IR-001 (`:218, 790, 850`), Enter in the field for v2 IR-011 (`:172-173`), and a new block at `:1030-1104` for v2 IR-005, IR-006, IR-002 and IR-003 |
| `web/src/screens/research/copy.ts` | modified (+22; unchanged since v2) | T002 |
| `web/src/screens/research/copy.test.ts` | modified (+21; unchanged since v2) | v1 IR-009 anchors. A sixth source file outside T013's five-file list, justified as in v2 |
| `.../stories/CAP-002-E5-S1-tasks.md` | modified | Checkbox flips and Notes bullets (v1). Since v2: frontmatter only (`updated`, `last_reworked_review: …-v2.md`) |
| `.../stories/CAP-002-E5-S1.md` | modified | `status: planning` → `in-review` only; unchanged since v2 |
| `.../stories/CAP-002-E5-S1-implementation-review-v1.md`, `-v1-mutation.json`, `-v2.md`, `-v2-mutation.json` | added | Earlier reviews, committed by the driver (`5f1e46b`, `1530ffb`) |
| `.../stories/CAP-002-E5-S1-tdd-evidence.yaml` | added | T015: cycles 1 to 3, plus cycle 4 (this rework) |
| `.../stories/CAP-002-E5-S1-evidence/` (24 files) | added | T015 evidence. The six new files are `cycle-4.patch`, `red-cycle-4.log`, `full-suite-rework-v2.log`, `build-rework-v2.log`, `mutants-cycle-4.json` and `mutation-cycle-4-results.json` |

`web/src/app/routes.tsx`, every shell file, and the E4-S1/S2/S3 modules `classification-client.ts`, `factor-cell.tsx` and `restated-mark.tsx` are unchanged (T013). So are `package.json` and `package-lock.json`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-15 (display side) | SATISFIED | `comparison-table.tsx:295` passes the list read's `retired` cell to `FactorCell` unchanged. `:218-226` draw the header badge with its `NeutralIcon` shape. `scoreText` (`:93-101`) gives the em dash | TC-COMP-114 (`comparison-table.test.tsx:225-261`, `:631-647`) | Unchanged since v2; its mutants are killed again |
| AC-16 (compare side) | SATISFIED | `index.tsx:133-190` makes one list read plus one evidence read per column, and re-reads a column only when its set differs. `:276-296` builds one column per listed symbol, in URL order | T008 (`compare.test.tsx:263-354`); TC-COMP-128; read budget `:873-916`, `:1080-1104` | |
| AC-23 (display side) | SATISFIED | E4-S3's `FactorCell` draws the mark on value and growth. `comparison-table.tsx:145` draws the input-row mark. `index.tsx:86-93, 396-398` render the sentence | TC-COMP-190 (`compare.test.tsx:239-253`, `:918-933`); `:935-949`; T006 | |
| DAC-E5-1 | SATISFIED | The 2-to-6 bound is enforced at `index.tsx:20-21, 108, 134`. A column is kept whatever its cells say. `unknownSymbols`, and symbols the server neither returns nor reports, reach the notice (`:147-152, 282-286`) | TC-COMP-127, TC-COMP-128, TC-COMP-129; `compare.test.tsx:703-721, 993-1001` | |
| DAC-E5-3 | SATISFIED | As AC-15 | TC-COMP-114 | Compare half only; the evidence half is E5-S3's |
| DAC-E5-5 | SATISFIED | As AC-23 | TC-COMP-190 | Compare half only |
| DAC-E5-S1-1 | SATISFIED | E4-S3's `FactorCell` shows *Incomplete* with a `reasonDetail` title. `comparison-table.tsx:114-122, 143` give the *Missing* badge and em dash. `:281-285` state the group statement once | TC-COMP-127 (`comparison-table.test.tsx:133-223`) | `reasonInput` is never read |
| DAC-E5-S1-2 | SATISFIED | `index.tsx:108, 224, 357-371` | TC-COMP-128 (`compare.test.tsx:159-199`), which now presses Enter in the field at six (`:172-173`); overflow `:1003-1028` | |
| DAC-E5-S1-3 | SATISFIED | `index.tsx:227-230, 241-253` set the field error. `:338-355`: `aria-invalid`, `aria-describedby={errorId}`, the error `<p>` in `--destructive`, and the field border in `--destructive` while invalid (`:348`). No column is added. `unknown_symbols` are reported (`:147, 373-375`) | TC-COMP-129 (`compare.test.tsx:201-237`, `:778-794`, `:840-853`) | The destructive token is now pinned (v2 IR-001 resolved) |
| DAC-E5-S1-4 | SATISFIED | As AC-15 | TC-COMP-114 | |
| DAC-E5-S1-5 | SATISFIED | `index.tsx:86-93, 396-398` | TC-COMP-190 | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Tasks file, *Other Notes*, "Upstream names recorded" | Unchanged since v1, which checked each name against the shipped files |
| T002 | complete | VERIFIED | `copy.ts` `COMPARE` strings; anchors `copy.test.ts:475-495` | Unchanged since v2; the `cp-*` mutants are killed |
| T003 | complete | VERIFIED | `comparison-table.test.tsx:133-262, 631-647` | Unchanged since v2 |
| T004 | complete | VERIFIED | `compare.test.tsx:159-261, 778-794, 840-853, 918-933` | TC-COMP-129 now pins the error token; TC-COMP-128 presses Enter in the field |
| T005 | complete | VERIFIED | `comparison-table.test.tsx:264-353, 649-664, 696-711` | Unchanged since v2 |
| T006 | complete | VERIFIED | `comparison-table.test.tsx:355-450, 687-694, 713-725` | Unchanged since v2 |
| T007 | complete | VERIFIED | `comparison-table.test.tsx:452-504, 666-685` | Unchanged since v2 |
| T008 | complete | VERIFIED | `compare.test.tsx:263-354, 840-853, 980-1028` | The duplicate's error token is now pinned |
| T009 | complete | VERIFIED | `compare.test.tsx:356-406, 961-978, 1059-1078` | The render right after a shrink to one column is now pinned |
| T010 | complete | VERIFIED | `compare.test.tsx:408-519, 873-916, 951-959, 1080-1104` | The `set: null` re-read is now pinned |
| T011 | complete | VERIFIED | `comparison-table.tsx` | Unchanged since v2. The row-token and landmark LOWs carry forward (IR-004, IR-005) |
| T012 | complete | VERIFIED | `compare/index.tsx` | Since v2, the field boundary uses the `--input` and `--destructive` tokens and the `h1` size is `--text-lg`. Residuals: the same-pass set race (IR-002, LOW) and **Add**'s missing submitting state (IR-001, MEDIUM, late) |
| T013 | complete | VERIFIED | `git diff --stat 543198f..HEAD -- web/src`: 6 files; `routes.tsx` unchanged; full suite 74 files, 1929 tests | `copy.test.ts` is a justified sixth file, as in v2 |
| T014 | complete | VERIFIED | `comparison-table.tsx:82-90, 218-226`; `index.tsx:348` | Every status carries its word and a shape. No `--gain`/`--loss`. The field boundary now meets the input token. No delivered `axe`-style assertion exists to mirror |
| T015 | complete | VERIFIED | `CAP-002-E5-S1-tdd-evidence.yaml`, four cycles; lint 0 errors, 0 warnings with `--require-logs` | `cycle-4.patch` hashes to the recorded `diff_sha256` `887e879a…4bdf`. It equals `git diff 990d8dc..HEAD -- web/src` once `index` lines are stripped, and embeds no evidence file. All five cited cycle-4 file hashes match |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `keeps an incomplete stock's column…`, `states not enough to rank once…` / TC-COMP-127 | ADEQUATE | Three headers kept; exactly *Incomplete* with a `reasonDetail` title; score em dash; *Revenue growth* em dash plus *Missing*; `eps_growth` kept; no `revenue_growth` text; group statement once | none |
| `reads Not followed on every factor…`, `gives only the retired column's header the Not followed badge, with a shape` / TC-COMP-114 | ADEQUATE | The retired column's three cells and header badge with its shape; the active header has neither | none |
| `blocks Add at six…`, `shows the prompt below two…`, `shows the long prompt…` / TC-COMP-128 | ADEQUATE | `aria-disabled`, not `disabled`; the accessible description; Enter in the field, a click and Enter on **Add** issue no request and add no column; prompts at one and at none | none. `ix-add-blocked-ignored` is killed |
| `reports instrument_not_found as a field error…`, `reports the server's unknown symbols…`, `attaches instrument_not_found to the entry field and clears it on editing` / TC-COMP-129 | ADEQUATE | Exact sentence; error in `text-[hsl(var(--destructive))]` and `text-sm`; two columns; URL unchanged; `aria-invalid`; accessible description; one `alert`; clears on typing; the notice from `unknownSymbols` adds no column | none. `v2-ix-error-not-destructive` is killed by three tests |
| `marks restated value and growth percentiles…`, `renders the sentence once for a mark on an input row alone` / TC-COMP-190 | ADEQUATE | Two marks and the sentence once; an input-row mark alone gives the sentence once; momentum gives none | none |
| T005 per-input status | ADEQUATE | As v2 | none |
| T006 structure and marks | ADEQUATE | As v2 | none |
| T007 dates disclosure | ADEQUATE | As v2 | none |
| T008 entry and bounds | ADEQUATE | As v2, plus the duplicate's error token | none |
| T009 removal and focus; `drops the list's group statement in the very render after shrinking to one column` | ADEQUATE | Precondition: the unranked growth statement is on screen. A synchronous removal of BBB is followed immediately by a check that the statement is gone, then the remaining header settles | none. `ix-activelist-stale` fails at the synchronous assertion |
| T010 states; `re-reads a column's evidence cached with no set once the list read has a set` | ADEQUATE | NEWCO's evidence is cached with `set: null`. After **Add** BBB under a list of set `s1`, NEWCO is read twice (its `0.42` input renders) and BBB once | none. `v2-ix-set-null-cached-same` fails at the `0.42` wait. `v2-ix-set-check-off`, `-equal` and `ix-evidence-no-cache` are killed |
| `draws the entry field's boundary in --input with a destructive error border` (v2 IR-005) | ADEQUATE | `rounded`, `border`, `border-input` and the `aria-[invalid=true]` destructive border are present, and `border-border` is absent | none. Both `v3-ix-field-*` mutants are killed |
| `sets the heading at --text-lg` (v2 IR-006) | ADEQUATE | The `h1` has `text-lg` and not `text-xl` | none. `v3-ix-h1-xl` is killed |
| `holds the heading and table in one card and styles Add as secondary`; field-error clearing | ADEQUATE | As v2 | none |
| `copy.test.ts` anchors / T002 | ADEQUATE | As v2 | none |

**Mocks.** Mock validity is unchanged. The screen tests double only `listClassifications` and `getStockEvidence`, spreading `importActual`; the table tests mock nothing.

**Determinism.** The new tests use `waitFor`, `findBy*` and a synchronous `fireEvent`, never a timer. The IR-003 test's call-count checks run after its `waitFor` has seen the re-read's `0.42`, so they cannot run before the read settles. The overflow test's `setTimeout(resolve, 20)` is unchanged since v2. It can only pass vacuously, never fail spuriously.

**Class assertions.** jsdom does not compute Tailwind, so the token tests assert class names. Each class asserted is in the built CSS: `.border-input`, `.text-lg`, `.text-[hsl(var(--destructive))]`, and `aria-[invalid=true]:border-[hsl(var(--destructive))]` (Independent Validation, row 10).

### Mutation run

1. **Generate.** `mutation-run.py generate --range 543198f..HEAD --cycle review` gave 70 mutants over the two changed production files: 31 negate-boolean, 30 off-by-one, 7 drop-field-copy and 2 remove-attribute. They are the same ids and texts as v2's, because the rework edited lines 333 and 348 in place.
2. **Manual.** I appended four mutants by exact line match:
   - `v3-ix-field-border-token` (`border-input` → `border-border`, `:348`);
   - `v3-ix-field-no-error-border` (drops the `aria-[invalid=true]` destructive border, `:348`);
   - `v3-ix-h1-xl` (`text-lg` → `text-xl`, `:333`);
   - `v3-ix-set-guard-dropped` (`result?.set != null` → `result !== null`, `:158`), a probe of my own on an unchanged line.
3. **Scope.** `scope --since 990d8dc --previous …-v2-mutation.json` added the 93 v2 mutants that the generator did not recreate. All of them still locate; none was dropped. That made 167 mutants: 163 `carried`, 3 `delta` and 1 `late`.
4. **Run.** All 167 ran against the three focused suites. The baselines passed on 4 of 4 workers, with 476 tests each.

Results: 161 killed and 6 survived. Every survivor's log shows 476 tests passing. The results file sits beside this report as `CAP-002-E5-S1-implementation-review-v3-mutation.json` (sha256 `40feefec27ae4a3f047b24715bd3d46d02bf9336a5b050c87cc702c78378c28a`).

| Survivor | Scope | Disposition | Reason |
|----------|-------|-------------|--------|
| `index.tsx:111:off-by-one:1` (initial `attempt` 1) | carried | equivalent | `attempt` is an opaque **Try again** trigger, compared only for change (effect deps `:190`). No artifact fixes its value |
| `index.tsx:385:off-by-one:1` (`previous + 2`) | carried | equivalent | The same counter; every press still changes it |
| `manual:ct-link-no-encode` | carried | equivalent | A column exists only for a symbol the list or evidence read returned. Those match `^[A-Z][A-Z0-9.-]{0,15}$` (`src/factorflow/instruments/symbols.py:5`), on which `encodeURIComponent` is the identity |
| `manual:ct-score-ignore-unranked` | carried | equivalent | `factor_classification_shape` (`0006_classifications.sql:88-92`) gives a `classified` cell no reason code, and `scoreText` returns earlier for any other status |
| `manual:ix-add-no-clear-draft` | carried | equivalent | No artifact fixes the field's value after a successful **Add**. UX 1.5 *Adding a stock* is silent on it, and form specification §4 covers only failure ("never clear the form on failure") |
| `manual:v3-ix-set-guard-dropped` | late | equivalent | The guard is only reached for a symbol in `columns`, which `:148-152` restricts to rows of `result.stocks`. Classification-api §2.7 makes `set` null exactly when `never_classified` is true, which comes with `stocks: []` and `match_count` 0 (its test row "Never classified"; `classification-types.ts:75`). So no column, and therefore no `result.set.setId` read, exists when the list has no set |

The killed mutants include all three of v2's non-equivalent survivors: `v2-ix-error-not-destructive`, `ix-activelist-stale` and `v2-ix-set-null-cached-same`. They also include every other mutant behind v1's and v2's findings, and the three `delta` mutants on the rework's lines.

## Independent Validation

| # | Command | Working Directory | Exit Code | Result | Notes |
|---|---------|-------------------|-----------|--------|-------|
| 1 | `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed |
| 2 | `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` (no base ref) | harness root | 1 | N/A | `BLOCKED — story coding has not reached in-review`. Without a base ref, the TDD-lint precondition runs against the remote default branch and reaches unrelated E4-S9 commits (as in v1 and v2) |
| 3 | The same, with `--base-ref 543198f` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| 4 | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref 543198f` | harness root | 0 | PASS | `543198fb17b3dc5f9905e113eb76eeb9a0760ef1`; `git merge-base --is-ancestor 543198f HEAD` exits 0 |
| 5 | `npx vitest run web/src/components/patterns/comparison-table.test.tsx web/src/screens/research/compare/compare.test.tsx web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files, 476 tests (26 + 58 + 392) |
| 6 | `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 74 files, 1929 tests |
| 7 | `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome lint .`: 167 files, no fixes |
| 8 | `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome format .`: 167 files, no fixes |
| 9 | `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| 10 | `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite, 63 modules, `index-DxnEO1AO.css`. A regex over the built CSS finds `.border-input{…hsl(var(--input)…}`, `…[aria-invalid=true]{border-color:hsl(var(--destructive))}`, `.text-lg{font-size:var(--text-lg)}` and `.text-\[hsl\(var\(--destructive\)\)\]` |
| 11 | `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E5-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 543198fb17b3dc5f9905e113eb76eeb9a0760ef1 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. `shasum -a 256` of `cycle-4.patch`, `red-cycle-4.log`, `full-suite-rework-v2.log`, `build-rework-v2.log` and `mutation-cycle-4-results.json` each equal the recorded hash |
| 12 | `git diff 990d8dc..HEAD -- web/src`, compared with `cycle-4.patch` after stripping `index` lines | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS (evidence) | Identical; the patch holds only `compare.test.tsx` and `index.tsx` (154 lines) |
| 13 | `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 543198fb17b3dc5f9905e113eb76eeb9a0760ef1..HEAD --cycle review --out $TMPDIR/e5s1v3/mutants-gen.json` | harness root | 0 | PASS | 70 mutants; then 4 manual mutants appended by exact line match. `$TMPDIR` is outside the component repo |
| 14 | `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $TMPDIR/e5s1v3/mutants-all.json --since 990d8dc10f6ecb7e861713192763c2d20291f9d5 --previous …/CAP-002-E5-S1-implementation-review-v2-mutation.json --out $TMPDIR/e5s1v3/mutants.json` | harness root | 0 | PASS | 167 mutants: `carried` 163, `delta` 3, `late` 1; 0 previous mutants no longer apply |
| 15 | `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $TMPDIR/e5s1v3/mutants.json --jobs 4 --command 'ln -s <repo>/node_modules node_modules; npx vitest run web/src/components/patterns/comparison-table.test.tsx web/src/screens/research/compare/compare.test.tsx web/src/screens/research/copy.test.ts' --out $TMPDIR/e5s1v3/mutation-results.json --logs $TMPDIR/e5s1v3/mutation-logs` | harness root | 3 | PASS (evidence) | Exit 3 signals survivors: 161 killed, 6 survived, all equivalent as shown above. `<repo>` is the absolute component path; the full command is in the copied results file |
| 16 | `npm run test:e2e` | — | N/A | NOT RUN | The plan's Validation Plan says "this story writes no e2e", and the story's Validation list omits it. `routes.tsx` has no compare route yet (CAP-002-E4-S10). Same treatment as v1 and v2 |
| 17 | `uv sync --all-extras`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | — | N/A | NOT RUN | The change set holds no Python file, and neither the story nor the plan names a Python command. I reran the frontend build that the static-asset test depends on (row 10) |
| 18 | `npm ci` | — | N/A | NOT RUN | `package.json` and `package-lock.json` are unchanged; the installed `node_modules` ran every command above |
| 19 | `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact …/CAP-002-E5-S1.md` | harness root | 0 | PASS | `sha256:4c309eb5…e8d5`, equal to the story's approved `reviewed_revision` |
| 20 | `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before and after validation) | harness root | 0 | PASS | `sha256:4c39aa36233fbfe4f64e902116527f6db9eb0359303ad0ea904bbb1e9e45c987` both times |

### Validation Side Effects

- Before: clean working tree at `9a4ca1c`; fingerprint `sha256:4c39aa36…c987`.
- After: clean working tree at `9a4ca1c`; same fingerprint. `npm run test` and `npm run build` write into the git-ignored `src/factorflow/api/static/`. Mutant clones and logs live under `$TMPDIR`, outside the component repo.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | late | **Add** shows no submitting state while its evidence read is in flight |
| IR-002 | LOW | carried | An evidence read in the same pass is not compared with the list's set (v2 IR-004) |
| IR-003 | LOW | carried | Never-populated with two or more symbols also names every symbol as not compared (v2 IR-008) |
| IR-004 | LOW | carried | The comparison table does not take the data-table row tokens (v2 IR-009) |
| IR-005 | LOW | carried | The scroll container repeats the table's name as a landmark (v2 IR-010) |

### IR-001 — Add shows no submitting state while its evidence read is in flight

- **Severity**: MEDIUM
- **Scope**: late. `add()` (`index.tsx:221-254`) and the **Add** button (`:357-365`) are unchanged since the baseline's `reviewed_head` `990d8dc`, so the baseline could have found this. It may not block.
- **Status**: OPEN
- **Acceptance criteria**: N/A. No criterion is made incomplete; DAC-E5-S1-2 and DAC-E5-S1-3 are satisfied.
- **Tasks**: T012
- **Files**: `web/src/screens/research/compare/index.tsx:221-254` (`add`), `:357-365` (the **Add** `button`)
- **Claim challenged**: T012 delivers the entry row as UX 1.5's `form` `inline` + `input` `text` with **Add** as `button` `secondary`.
- **Observed evidence**:
  - `add()` awaits `getStockEvidence(symbol)` (`:232`) and sets no pending state.
  - The button has no `disabled`, no `aria-busy` and no progress indicator while that read is in flight. Only `aria-disabled={blocked}` is set, at six columns.
  - A second press or Enter during the read starts another evidence read. `compare.test.tsx:811-838` relies on this, submitting a second **Add** while the first is pending.
  - The delivered sibling add controls do take a submitting state: `instruments/add-field.tsx:111` (`disabled={submitting}`) and `universes/detail/add-stocks-dialog.tsx:184, 248` (`busy={pending}`, `disabled={pending}`).
- **Expected evidence/behavior**:
  - UX 1.5 Component Mapping cites `design-system/components/form/design-spec.md` and `button/design-spec.md` for *Add a stock* and **Add**.
  - Form specification §4: "While submitting, disable the submit action and show progress. Keep field values; never clear the form on failure."
  - Button specification: "Loading: disable and show a spinner while preserving the button's width", and "`aria-busy` while loading".
- **Impact**: For the length of the evidence read, the owner gets no sign that **Add** was taken. Repeated presses issue duplicate reads. The URL write de-duplicates (`:237`), so no duplicate column appears, but the same URL can be pushed twice onto history. On the local API the window is short.
- **Required remediation**: Give **Add** the specified submitting state while its evidence read is in flight: disabled, with progress shown and `aria-busy`, while keeping the `blocked` tier at six. Pin it with a test that holds the read open. Then revisit `compare.test.tsx:811-838`. Its second submission, by Enter during a pending **Add**, would no longer be possible: a disabled submit button also blocks implicit submission.

### IR-002 — An evidence read in the same pass is not compared with the list's set (v2 IR-004)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012
- **Files**: `web/src/screens/research/compare/index.tsx:143, 161-179, 293`
- **Claim challenged**: v1 IR-005's remediation: "Never render a column's input rows from an evidence read of a different set than the list read on screen."
- **Observed evidence**: Unchanged since v2. Cached evidence of another set is re-read, but evidence fetched in the same pass is used whatever its `set`. If a set completes between `listClassifications` (`:143`) and the evidence reads (`:161`), the new set's input rows sit under the previous set's scores until the next URL change.
- **Expected evidence/behavior**: STD-UI-16; DEC-0175. UX 1.5 *Arriving* prescribes the two separate reads, and no artifact settles the race between them.
- **Impact**: The window is the milliseconds between two reads, once a day.
- **Required remediation**: Optional, as in v2: when a fetched evidence's `set.setId` differs from the list's, re-read the list, or say on screen that the reads disagree.

### IR-003 — Never-populated with two or more symbols also names every symbol as not compared (v2 IR-008)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012, T010
- **Files**: `web/src/screens/research/compare/index.tsx:276-296, 373-375, 392`; `web/src/screens/research/compare/compare.test.tsx:420-429`
- **Claim challenged**: T010: `neverClassified: true` renders "the never-populated statement".
- **Observed evidence**: Unchanged since v1. With `neverClassified` and no rows, every symbol reaches the not-compared notice (`:282-286`) beside *No stocks have been scored yet.*
- **Expected evidence/behavior**: UX 1.5 States, *Never scored*: "Section 1.1's statement, with the chosen symbols kept in the URL".
- **Impact**: The never-scored screen states the same fact twice.
- **Required remediation**: Optional, as in v1 and v2.

### IR-004 — The comparison table does not take the data-table row tokens (v2 IR-009)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/components/patterns/comparison-table.tsx:65-68`
- **Claim challenged**: UX 1.5 Component Mapping: "composition on native `<table>` with the `data-table` token set".
- **Observed evidence**: Unchanged since v1: `px-3 py-2` cells, no `h-row`, no row rule.
- **Expected evidence/behavior**: Classification-ui §10 and UX 1.5, as in v1.
- **Impact**: Density and row rules differ from the product's other tables.
- **Required remediation**: Optional, as in v1 and v2.

### IR-005 — The scroll container repeats the table's name as a landmark (v2 IR-010)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/components/patterns/comparison-table.tsx:250-259`
- **Claim challenged**: The container and table meet UX 1.5 Accessibility.
- **Observed evidence**: Unchanged since v1: a named `section`, which is a region landmark, wraps a table with the same `aria-label`.
- **Expected evidence/behavior**: UX 1.5 Accessibility; T011, as in v1.
- **Impact**: Redundant announcements.
- **Required remediation**: Optional, as in v1 and v2.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 (HIGH) TC-COMP-129 does not pin the field error's `--destructive` token | RESOLVED | `compare.test.tsx:218, 790, 850` assert `text-[hsl(var(--destructive))]`. `manual:v2-ix-error-not-destructive` (carried) is killed by those three tests (mutation log) |
| v2/IR-002 (MEDIUM) The render right after shrinking to one column still shows the stale list | RESOLVED | `compare.test.tsx:1059-1078`: `fireEvent.click` on *Remove BBB*, then an immediate `queryByText(statement)` null. `manual:ix-activelist-stale` (carried) fails there |
| v2/IR-003 (MEDIUM) The set check is not pinned for cached evidence of no set | RESOLVED | `compare.test.tsx:1080-1104`: a NEWCO evidence cached with `set: null` is re-read under a list of set `s1`, and BBB is not. `manual:v2-ix-set-null-cached-same` (carried) fails at the `0.42` wait |
| v2/IR-004 (LOW) Same-pass set race | STILL OPEN | Code unchanged (`index.tsx:143-179`); cycle 4 leaves it as optional. Carried as IR-002 |
| v2/IR-005 (MEDIUM) The entry field's boundary uses `--border` and shows no error border | RESOLVED | `index.tsx:348`: `border-input` plus `aria-[invalid=true]:border-[hsl(var(--destructive))]`, both in the built CSS. Pinned at `compare.test.tsx:1032-1046`; `v3-ix-field-border-token` and `v3-ix-field-no-error-border` (delta) are killed |
| v2/IR-006 (LOW) The `h1` is `--text-xl` semibold | RESOLVED | `index.tsx:333` `className="text-lg"`, as `results-pane.tsx:268` and `universes/index.tsx:172` draw theirs. UX 1.5 sets only the size. Pinned at `compare.test.tsx:1048-1057`; `v3-ix-h1-xl` (delta) is killed |
| v2/IR-007 (LOW) Cycle 3's RED unlogged; `cycle-3.patch` embeds an earlier copy of itself | RESOLVED | The remediation was forward-looking, and cycle 4 meets it. `cycle-4.patch` is 154 lines, holds only the two source files, and equals the committed delta. `red-cycle-4.log` shows the two new tests that could fail (IR-005, IR-006 classes) failing at `1530ffb`. The others pin existing behaviour and are proven by mutation. Cycle 3's own files are unchanged history |
| v2/IR-008 (LOW) Never-populated double statement | STILL OPEN | Unchanged. Carried as IR-003 |
| v2/IR-009 (LOW) Data-table row tokens | STILL OPEN | Unchanged. Carried as IR-004 |
| v2/IR-010 (LOW) Landmark repeats the table's name | STILL OPEN | Unchanged. Carried as IR-005 |
| v2/IR-011 (LOW) TC-COMP-128 never presses Enter in the field | RESOLVED | `compare.test.tsx:172-173` types `G{Enter}` in the field at six, before the click and Enter on **Add**. The call count and the six headers are unchanged. `ix-add-blocked-ignored` is killed |

## Scope and Plan Deviations

- **`copy.test.ts`** is a sixth source file outside T013's five-file list. It is justified, as in v2, because v1 IR-009 required the anchors there.
- **Plan bookkeeping**: since v2, the rework touched only the plan's frontmatter (`updated`, `last_reworked_review`). Every checked task is verified.
- **The `h1` weight**: the rework drops `font-semibold` with `text-xl`. UX 1.5 and 1.1 specify only the size (`--text-lg`), and the sibling research screens use `text-lg` alone. So this is no deviation.
- **v1 deviations that still hold**:
  - `ApiUnreachableError` renders nothing, because the shell owns that state.
  - The screen keeps a local `Read` union.
  - Unlisted symbols are named in the notice.
  - The row labels follow the plan's T006 rather than UX 1.5's longer names.
- **Cycle 4's red evidence** says the IR-001, IR-002, IR-003 and IR-011 assertions pin behaviour the code already had, and proves each by mutation. My run reproduces those kills independently.
- **State check**: without a base ref it reports `BLOCKED`; with the integration base it reports `READY`. This is an observation about invocation, as in v1 and v2.
- **No decision recorded**: no question in this review needed the owner. Each judgment names the artifact it rests on.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E5-S1 with the task file and this report. IR-001 and the four LOW findings stay recorded; any later rework of them is optional and does not reopen this gate.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004, IR-005
