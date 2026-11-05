---
artifact_schema_version: 1
artifact_id: CAP-002-E5-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-03
updated: 2026-11-03
story_id: "CAP-002-E5-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-03T07:02:24Z"
reviewed_head: "990d8dc10f6ecb7e861713192763c2d20291f9d5"
review_base: "543198fb17b3dc5f9905e113eb76eeb9a0760ef1"
reviewed_state_revision: "sha256:511da338d4a53424a838cad8e5165804910dd742337600cce1c8af82e0373184"
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
  timestamp: 2026-11-03T07:02:24Z
  source_artifacts:
    - id: CAP-002-E5-S1
      version: "1 (sha256:4c309eb55e8c43939e652cb99abba5395f9554141d1aa1374ade2efef97cd8e5)"
    - id: CAP-002-E5-S1-tasks
      version: "1 (updated 2026-11-03, last_reworked_review v1)"
    - id: CAP-002-E5-S1-tdd-evidence
      version: "cycle-1 to cycle-3"
    - id: CAP-002-E5-S1-implementation-review
      version: "1 (baseline; reviewed_head 6ea0ecbd3f6694ad4d7975c3b0b116b203288405)"
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
    - id: DEC-0257
      version: "open (E4-S8 scope; cited for the CAP-002 token map)"
    - id: STD-UI (ui-conventions)
      version: "current at review base"
    - id: design-system form, input, badge, button and theme specifications
      version: "current at review base"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E5-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 3 |
| Low findings | 7 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 6/6 passed |

The rework commit `990d8dc` resolves v1's four HIGH findings in the code:

- The entry field's `instrument_not_found` and duplicate errors are now the field's own. The input carries `aria-invalid` and `aria-describedby`, the error text is in `--destructive`, and the error clears on editing or after a successful **Add**.
- The column header's *Not followed* badge draws its shape.
- TC-COMP-114 now tells an active column from a retired one.
- The page sits in its full-width card, and **Add** carries the secondary tokens.

Four of v1's five MEDIUM findings are resolved, along with five of the six mutants under the fifth (IR-008). Every required command passed when rerun independently, and the TDD evidence lint is clean.

The gate fails on one new HIGH finding, on a line the rework added:

- **IR-001**: no test pins the `--destructive` token on the field error. `manual:v2-ix-error-not-destructive` removes it and passes every focused suite. The form and input specifications, which UX design 1.5 cites for *Add a stock*, and UX 1.1's token map all specify that token. So, under adversarial-review E.9, the mandatory TC-COMP-129 test is `WEAK`, which is at least HIGH. This is the same judgement CAP-002-E4-S5 v1 made for `ts-error-not-destructive` (its IR-003, HIGH). The production code is correct, and the fix is one class assertion.

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 7 · **total 11**

The mutation run had 163 mutants in three groups:

- 70 from the catalogue over every changed production file.
- 16 written by hand, by me or re-authored from v1 where a re-indented line stopped v1's own mutant from locating.
- 77 of v1's own mutants that still apply.

`scope` against the v1 baseline tagged them 95 `carried`, 22 `delta` and 46 `late`. Results: 155 killed, 8 survived. Of the 8 survivors, 5 are equivalent and 3 are not:

- `manual:v2-ix-error-not-destructive` is IR-001.
- `manual:ix-activelist-stale` is carried from v1's IR-008, and is IR-002 here. Cycle 3 claims it is equivalent because "no test can observe [it] under act". A scratch test run in a disposable clone disproves that: right after a removal it observes the stale list's group statement.
- `manual:v2-ix-set-null-cached-same` is IR-003.

All 46 `late` mutants were killed.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/compare-stock-evidence-and-diagnosis/stories/CAP-002-E5-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E5-S1-run-20261103T034434Z` |
| HEAD | `990d8dc10f6ecb7e861713192763c2d20291f9d5` (`feat(research): CAP-002-E5-S1 story-coding rework of review v1`). Three commits over the base: `6ea0ecb` coding, `5f1e46b` review v1, `990d8dc` rework |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z`, supplied by the supervised driver as `--base-ref` (tip `543198f`). Merge base `543198fb17b3dc5f9905e113eb76eeb9a0760ef1`, an ancestor of HEAD, resolved with `pipeline-state.py review-base --base-ref` |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 29 from base to HEAD: 5 source files, `copy.test.ts`, 3 plan and story files, the v1 report and its mutation file, and 18 TDD evidence files. 15 of them changed since the baseline |
| Baseline | v1, `CAP-002-E5-S1-implementation-review-v1.md`, CHANGES-REQUIRED, `reviewed_head` `6ea0ecbd3f6694ad4d7975c3b0b116b203288405`, with `-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/comparison-table.tsx` | added (322; +11 since v1) | T011, T014; AC-15, AC-16, AC-23, DAC-E5-1, DAC-E5-3, DAC-E5-5, DAC-E5-S1-1, DAC-E5-S1-4, DAC-E5-S1-5. The rework adds `NeutralIcon` (`:82-90`) to the header badge (`:218-226`) for v1 IR-002 |
| `web/src/components/patterns/comparison-table.test.tsx` | added (725; +97 since v1) | T003, T005, T006, T007; the rework block at `:630-725` covers v1 IR-002, IR-003 and IR-006 |
| `web/src/screens/research/compare/index.tsx` | added (404; +76/-61 since v1) | T012; AC-16, DAC-E5-1, DAC-E5-S1-2, DAC-E5-S1-3, DAC-E5-S1-5. Since v1: the field error is bound to the field (`:130, 338-355`), the evidence cache checks its set (`:153-160`), and there is a card and a secondary **Add** (`:332, 357-365`). The rest of the JSX is only re-indented (`git diff -w` shows it unchanged) |
| `web/src/screens/research/compare/compare.test.tsx` | added (1025; +268 since v1) | T004, T008, T009, T010; the rework block at `:763-1025` covers v1 IR-001, IR-004, IR-005, IR-007 and IR-008 |
| `web/src/screens/research/copy.ts` | modified (+22, unchanged since v1) | T002 |
| `web/src/screens/research/copy.test.ts` | modified (+21, new since v1) | v1 IR-009: the anchors at `:475-495`. T013 lists only five source files. This sixth one is justified, because v1's remediation required it |
| `.../stories/CAP-002-E5-S1-tasks.md` | modified | Checkbox flips and the T001/T014 Notes bullets (v1). Since v1, the frontmatter only: `updated`, `last_reworked_review` |
| `.../stories/CAP-002-E5-S1.md` | modified | `status: planning` to `in-review` only |
| `.../stories/CAP-002-E5-S1-implementation-review-v1.md`, `-v1-mutation.json` | added | The baseline review, committed by the driver (`5f1e46b`) |
| `.../stories/CAP-002-E5-S1-tdd-evidence.yaml` | added | T015: cycles 1 and 2 (v1), cycle 3 (rework) |
| `.../stories/CAP-002-E5-S1-evidence/` (18 files) | added | T015 evidence. The 6 new files are `cycle-3.patch`, `red-cycle-3.log`, `full-suite-rework.log`, `build-rework.log`, `mutants-cycle-3.json` and `mutation-cycle-3-results.json` |

`web/src/app/routes.tsx`, every shell file, and E4-S1/S2/S3's `classification-client.ts`, `factor-cell.tsx` and `restated-mark.tsx` are unchanged (T013). `package.json` and `package-lock.json` are unchanged.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-15 (display side) | SATISFIED | `comparison-table.tsx:295` passes the list read's `retired` cell to `FactorCell` unchanged. The header badge is at `:218-226` with its shape, and `scoreText` (`:93-101`) gives the em dash | TC-COMP-114 (`comparison-table.test.tsx:225-261`, `:631-647`) | The active column now asserts no badge and no shape; `ct-header-notfollowed-always` is killed |
| AC-16 (compare side) | SATISFIED | `index.tsx:133-190`: one list read plus one evidence read per column, re-read only on a set mismatch. `:278-296`: one column per listed symbol, in URL order | T008 (`compare.test.tsx:262-353`); TC-COMP-128; read budget `:870-885` | |
| AC-23 (display side) | SATISFIED | `FactorCell` draws the mark on value and growth (E4-S3). `comparison-table.tsx:145` draws the input-row mark. `index.tsx:86-93, 396-398` render the sentence | TC-COMP-190 (`compare.test.tsx:238-252`, `:915-930`); `:932-946`; T006 (`comparison-table.test.tsx:420-449`, `:713-725`) | Input-only marks and the momentum flags are now pinned |
| DAC-E5-1 | SATISFIED | The 2–6 bound is at `index.tsx:20-21, 108, 134`. Columns are kept whatever their cells say. `unknownSymbols` and symbols the server neither returns nor reports both reach the notice (`:147-152`, `:282-286`) | TC-COMP-127, TC-COMP-128, TC-COMP-129; `compare.test.tsx:703-720, 990-998` | |
| DAC-E5-3 | SATISFIED | As AC-15 | TC-COMP-114 | Compare half only; the evidence half is E5-S3's |
| DAC-E5-5 | SATISFIED | As AC-23 | TC-COMP-190 | Compare half only |
| DAC-E5-S1-1 | SATISFIED | `FactorCell` *Incomplete* with a `reasonDetail` title. `comparison-table.tsx:114-122, 143` *Missing* badge and em dash. `:281-285` group statement once | TC-COMP-127 (`comparison-table.test.tsx:133-223`); `:696-711` | `reasonInput` is never read |
| DAC-E5-S1-2 | SATISFIED | `index.tsx:108, 224, 357-371` | TC-COMP-128 (`compare.test.tsx:158-198`); overflow `:1000-1025` | Enter is still pressed on the button, not in the field (IR-011) |
| DAC-E5-S1-3 | SATISFIED | `index.tsx:227-230, 241-253` set the field error. `:338-355`: the input carries `aria-invalid` and `aria-describedby={errorId}`; the error `<p id={errorId}>` is in `--destructive` and clears on change (`:342-345`) or a successful **Add** (`:234`). No column is added. `unknown_symbols` are reported (`:147, 373-375`) | TC-COMP-129 (`compare.test.tsx:200-236`, `:777-792`); `:794-851` | Behaviour is correct. TC-COMP-129 does not pin the error's `--destructive` token (IR-001). The field boundary tokens are IR-005 |
| DAC-E5-S1-4 | SATISFIED | As AC-15 | TC-COMP-114 | |
| DAC-E5-S1-5 | SATISFIED | `index.tsx:86-93, 396-398` | TC-COMP-190 | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Tasks file, *Other Notes*, "Upstream names recorded" | Unchanged since v1; v1 checked every name against the shipped files |
| T002 | complete | VERIFIED | `copy.ts:810-831` (inside `COMPARE`, `:795`); anchors at `copy.test.ts:475-495` | All nine new strings are now anchored; the five `cp-*` mutants are killed |
| T003 | complete | VERIFIED | `comparison-table.test.tsx:133-262, 631-647` | TC-COMP-114 is now ADEQUATE |
| T004 | complete | VERIFIED | `compare.test.tsx:158-260, 777-792, 915-930` | Written with `Implements` comments. TC-COMP-129 is WEAK on the error token (IR-001) |
| T005 | complete | VERIFIED | `comparison-table.test.tsx:264-353, 649-664, 696-711` | The Outdated shape and a missing row's value are now pinned |
| T006 | complete | VERIFIED | `comparison-table.test.tsx:355-450, 687-694, 713-725` | Momentum input marks and the percentile cell's content are now pinned |
| T007 | complete | VERIFIED | `comparison-table.test.tsx:452-504, 666-685` | Each date is now pinned under its own label |
| T008 | complete | VERIFIED | `compare.test.tsx:262-353, 838-851, 977-1025` | Encoding, the overflow guard and the duplicate's naming are pinned |
| T009 | complete | VERIFIED | `compare.test.tsx:355-405, 958-975` | The one-column-from-evidence rule is pinned only after the read settles (IR-002) |
| T010 | complete | VERIFIED | `compare.test.tsx:407-518, 870-913, 948-956` | The partial-factors guard and the read budget after **Add** and **Remove** are pinned. The `set: null` re-read is not (IR-003) |
| T011 | complete | VERIFIED | `comparison-table.tsx` | Unchanged except the header badge's shape. Row tokens (IR-009) and landmark naming (IR-010) are still open LOWs |
| T012 | complete | VERIFIED | `compare/index.tsx` | v1's gaps are closed: the field-error contract, the full-width card and secondary **Add**, and a set-aware cache. Residuals: the field-boundary tokens (IR-005, late), the `h1` size (IR-006, late) and the same-pass set race (IR-004) |
| T013 | complete | VERIFIED | `git diff --stat 543198f..HEAD -- web/src`: 6 files; `routes.tsx` unchanged; full suite 74 files / 1925 tests | `copy.test.ts` is a sixth source file, outside T013's five-file list. It is justified, because v1 IR-009 required the anchors there |
| T014 | complete | VERIFIED | `comparison-table.tsx:82-90, 218-226` | Every status now carries its word and a shape. No `--gain`/`--loss` class. No delivered `axe`-style assertion exists to mirror |
| T015 | complete | VERIFIED | `CAP-002-E5-S1-tdd-evidence.yaml`, three cycles; lint 0 errors, 0 warnings with `--require-logs` | `cycle-3.patch` hashes to the recorded `diff_sha256` `8b6b9579…95bb`. Its code section equals `git diff 6ea0ecb..HEAD -- web/src` once `index` lines are stripped. Evidence quality: IR-007 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `keeps an incomplete stock's column…`, `states not enough to rank once…` / TC-COMP-127 | ADEQUATE | As v1: three headers kept; exactly *Incomplete* with a `reasonDetail` title; score em dash; *Revenue growth* em dash plus *Missing*; `eps_growth` kept; no `revenue_growth` text; group statement once | none |
| `reads Not followed on every factor…`, `gives only the retired column's header the Not followed badge, with a shape` / TC-COMP-114 | ADEQUATE | OLD's three cells and header; AAA's header has no *Not followed*, no `status-neutral` element and no `aria-hidden` shape; OLD's badge has an `svg[aria-hidden]` | none. `ct-header-notfollowed-always` and `v2-ct-header-no-shape` are killed |
| `blocks Add at six…`, `shows the prompt below two…`, `shows the long prompt…` / TC-COMP-128 | ADEQUATE | `aria-disabled`, not `disabled`; the accessible description; no request and no column; prompts at one and at none | Enter lands on the button (IR-011, LOW) |
| `reports instrument_not_found as a field error…`, `reports the server's unknown symbols…`, `attaches instrument_not_found to the entry field and clears it on editing` / TC-COMP-129 | **WEAK** | Exact sentence; two columns; URL unchanged; `aria-invalid="true"`; the input's accessible description equals the sentence; one `alert`; clears on typing. The notice from `unknownSymbols` names no column | The error's `--destructive` token is unpinned, and `manual:v2-ix-error-not-destructive` survives (IR-001). `v2-ix-no-aria-invalid`, `v2-ix-no-describedby`, `v2-ix-error-no-id` and `v2-ix-onchange-keeps-error` are killed |
| `marks restated value and growth percentiles…`, `renders the sentence once for a mark on an input row alone` / TC-COMP-190 | ADEQUATE | Two marks plus the sentence once; an input-row mark alone gives the sentence once | none |
| T005 per-input status | ADEQUATE | v1's checks, plus: the Outdated badge's `svg[aria-hidden]`; a `missing` row with a value renders exactly `—Missing` | none |
| T006 structure and marks | ADEQUATE | v1's checks, plus: the percentile cell holds no score; a momentum input flagged restated shows no mark | none |
| T007 dates disclosure | ADEQUATE | v1's checks, plus: *As of 2025-06-27* and *Known on 2026-10-14* each beside its own label | none |
| T008 entry and bounds | ADEQUATE | v1's checks, plus: the duplicate attaches to the field; **Remove** from `?symbols=A%26B,MSFT,AAPL` writes `?symbols=A%26B,AAPL`; an **Add** finishing after the URL reaches six writes nothing | none |
| T009 removal and focus, `shows the evidence, not a stale list…` | WEAK | After the read settles, the remaining column shows the evidence's percentile (11), not the list's (70) | Only the settled state is asserted. The render right after the removal shows the stale list (`ix-activelist-stale`, IR-002) |
| T010 states, `builds no column from a partial factors record` | ADEQUATE | v1's checks, plus: `factors: { value }` alone gives the notice and no table | none |
| `reads evidence only for a column it has none for`, `re-reads a column's evidence when the list read is of a different set` (v1 IR-005) | WEAK | After **Add** the evidence calls are exactly `["CCC"]`, and after **Remove** still `["CCC"]`. A list of set `s2` replaces the cached `s1` input value 0.85 with 0.33 | A cached evidence whose `set` is `null` under a list with a set is never exercised; `v2-ix-set-null-cached-same` survives (IR-003) |
| `holds the heading and table in one card and styles Add as secondary` (v1 IR-004) | ADEQUATE | The `h1`'s `section` has `bg-card` and `text-card-foreground` and contains the table and **Add**; **Add** has `bg-secondary` and `text-secondary-foreground` | none. `v2-ix-card-plain` and `v2-ix-add-outline` are killed |
| Field-error clearing (`:794-836`) | ADEQUATE | Cleared after a successful **Add**, including one still pending while a later error stood (kills `ix-add-keep-stale-error`) | none |
| `copy.test.ts` anchors / T002 | ADEQUATE | Every new string, including the templated ones with an example argument | none |

Mock validity is unchanged from v1. The screen tests double only `listClassifications` and `getStockEvidence`, spreading `importActual`. The table tests mock nothing.

Determinism: the new tests use promise gates (`release`) and `waitFor`, not timers. The one exception is the overflow test's `setTimeout(resolve, 20)`, which waits for a navigation that must not happen. A slow machine could make that test pass vacuously, but never fail spuriously.

### Mutation run

`mutation-run.py generate --range 543198f..HEAD --cycle review` gave 70 mutants over the two changed production files: 31 negate-boolean, 30 off-by-one, 7 drop-field-copy and 2 remove-attribute.

I then wrote 16 manual mutants:

- 11 new (`manual:v2-*`) for the lines the rework added: the header shape, three set-check variants, `aria-invalid`, `aria-describedby`, the error's id, its `--destructive` class, clearing on change, the card, and the secondary **Add**.
- 5 re-authored under their v1 ids at the current lines: `ix-evidence-no-cache`, `ix-notcompared-join`, `ix-sentence-twice`, `ct-outdated-no-icon` and `ct-notcomputable-no-icon`. Re-indentation, or a second identical line, had stopped v1's text from locating.

`scope --since 6ea0ecb --previous …-v1-mutation.json` added the 77 v1 mutants that still apply. 9 regenerated v1 mutants on re-indented JSX lines no longer apply; the generator re-created them at the current lines. That made 163 mutants: 95 `carried`, 22 `delta`, 46 `late`.

Ids are line-based, so four regenerated mutants carry a v1 id over different text and were tagged `carried`. All four are killed, so no survivor's scope is affected.

All 163 ran against the three focused suites, and the baselines passed on 4/4 workers with 472 tests each. Results: 155 killed, 8 survived; every survivor's log shows 3 files and 472 tests passing. The results file sits beside this report as `CAP-002-E5-S1-implementation-review-v2-mutation.json` (sha256 `cdc96041daa18a15ef8364a33194cb5e0f2703c0bae109a72309757c4c0e6772`).

| Survivor | Scope | Disposition | Reason |
|----------|-------|-------------|--------|
| `index.tsx:111:off-by-one:1` (initial `attempt` 1) | carried | equivalent | v1's disposition holds: `attempt` is an opaque **Try again** trigger, compared only for change |
| `index.tsx:385:off-by-one:1` (`previous + 2`) | delta (re-indented only) | equivalent | Same counter as v1's `:369` mutant; every press still changes it once |
| `manual:ct-link-no-encode` | carried | equivalent | v1's disposition holds: instrument symbols match `^[A-Z][A-Z0-9.-]{0,15}$` (`src/factorflow/instruments/symbols.py:5`), on which `encodeURIComponent` is the identity |
| `manual:ct-score-ignore-unranked` | carried | equivalent | v1's disposition holds: `factor_classification_shape` gives a `classified` cell no reason code |
| `manual:ix-add-no-clear-draft` | carried | equivalent | v1's disposition holds: no artifact fixes the field's value after a successful **Add** |
| `manual:ix-activelist-stale` | carried | **not equivalent** | IR-002. The cycle-3 evidence calls it equivalent; a scratch test disproves that (Independent Validation, row 15) |
| `manual:v2-ix-error-not-destructive` | delta | **not equivalent** | IR-001 |
| `manual:v2-ix-set-null-cached-same` | delta | **not equivalent** | IR-003 |

Among the killed mutants are every mutant behind v1's findings: `ct-header-notfollowed-always`, `ix-add-keep-stale-error`, `ct-outdated-no-icon`, `ix-evidence-no-cache`, the four IR-006 mutants, the three IR-007 mutants, five of the six IR-008 mutants and the five IR-009 copy mutants. So are the new field-error, set-check, card, **Add** and header-shape mutants, except the two above.

## Independent Validation

| # | Command | Working Directory | Exit Code | Result | Notes |
|---|---------|-------------------|-----------|--------|-------|
| 1 | `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed |
| 2 | `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` (no base ref) | harness root | 1 | N/A | `BLOCKED — story coding has not reached in-review`. Without `--base-ref`, the state is derived against the remote default branch, as in v1 |
| 3 | The same, with `--base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z --json` | harness root | 0 | PASS | `ready — review changes were reworked; a new review version is required` |
| 4 | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` | harness root | 0 | PASS | `543198fb17b3dc5f9905e113eb76eeb9a0760ef1`, the integration tip and an ancestor of HEAD (`git merge-base --is-ancestor`) |
| 5 | `npx vitest run src/components/patterns/comparison-table.test.tsx src/screens/research/compare/compare.test.tsx src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files, 472 tests (26 + 54 + 392) |
| 6 | `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 74 files, 1925 tests |
| 7 | `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome lint .`: 167 files, no fixes |
| 8 | `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome format .`: 167 files, no fixes |
| 9 | `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| 10 | `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite, 63 modules, `index-DxnEO1AO.css`. Every class the rework added is present in it: `bg-card`, `text-card-foreground`, `bg-secondary`, `text-secondary-foreground`, `text-[hsl(var(--destructive))]`, `items-start`, `gap-4`, `gap-1`, `h-3`, `w-3`, `shrink-0` (regex over the built CSS) |
| 11 | `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E5-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 543198fb17b3dc5f9905e113eb76eeb9a0760ef1 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. `shasum -a 256 cycle-3.patch` equals the recorded `diff_sha256` |
| 12 | `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 543198fb17b3dc5f9905e113eb76eeb9a0760ef1..HEAD --cycle review --out $SCRATCH/mutants-gen.json` | harness root | 0 | PASS | 70 mutants; then 16 manual mutants appended by exact line match. `$SCRATCH` is the reviewer's temporary directory, outside the component repo |
| 13 | `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/mutants-all.json --since 6ea0ecbd3f6694ad4d7975c3b0b116b203288405 --previous …/CAP-002-E5-S1-implementation-review-v1-mutation.json --out $SCRATCH/mutants.json` | harness root | 0 | PASS | 163 mutants: `carried` 95, `delta` 22, `late` 46; 9 previous mutants no longer apply (their lines were re-indented) |
| 14 | `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/mutants.json --jobs 4 --command 'ln -s <repo>/node_modules node_modules; npx vitest run web/src/components/patterns/comparison-table.test.tsx web/src/screens/research/compare/compare.test.tsx web/src/screens/research/copy.test.ts' --out $SCRATCH/mutation-results.json --logs $SCRATCH/mutation-logs` | harness root | 3 | PASS (evidence) | Exit 3 signals survivors: 155 killed, 8 survived, dispositioned above. `<repo>` is the absolute component path; the full command is in the copied results file |
| 15 | Scratch experiment for `ix-activelist-stale`: `git clone --shared` of HEAD into the reviewer's scratchpad (not the component repo), then a scratch test `zz-scratch.test.tsx`. It builds a list whose growth summary is unranked (`12 qualified, 30 needed`), removes BBB with a synchronous `fireEvent.click`, and asserts with no `await` that the group statement is absent. Run with `npx vitest run src/screens/research/compare/zz-scratch.test.tsx` inside the clone | scratch clone | 0, then 1 | PASS (evidence) | On HEAD the test passes. With `const activeList = list;` applied in the clone it fails at the synchronous assertion (`zz-scratch.test.tsx:178`): the render right after the removal shows the stale list's group statement. The component repo was not touched |
| 16 | `git diff -w 6ea0ecb..HEAD -- web/src/screens/research/compare/index.tsx` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS (evidence) | The input's `className="rounded border border-border px-3 py-2"` and `<h1 className="text-xl font-semibold">` appear only as context, so they are unchanged ignoring whitespace. That makes IR-005 and IR-006 `late` |
| 17 | `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the plan's Validation Plan ("this story writes no e2e") and the story's Validation list. `routes.tsx` has no compare route (CAP-002-E4-S10), so no E2E spec can reach this change. Same treatment as v1 |
| 18 | `uv sync --all-extras`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | — | N/A | NOT RUN | The change set contains no Python file, and neither the story nor the plan names a Python command. The frontend build that the Python static-asset test depends on was rerun (row 10) |
| 19 | `npm ci` | — | N/A | NOT RUN | `package.json` and `package-lock.json` are unchanged; the installed `node_modules` ran every command above |
| 20 | `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact …/CAP-002-E5-S1.md` | harness root | 0 | PASS | `sha256:4c309eb5…e8d5`, equal to the story's approved `reviewed_revision` |
| 21 | `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before and after validation) | harness root | 0 | PASS | `sha256:511da338d4a53424a838cad8e5165804910dd742337600cce1c8af82e0373184` both times |

### Validation Side Effects

- Before: clean working tree at `990d8dc`; fingerprint `sha256:511da338…3184`.
- After: clean working tree at `990d8dc`; same fingerprint. `npm run test` and `npm run build` write into the git-ignored `src/factorflow/api/static/`. Mutant clones, logs and the scratch clone live outside the component repo.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | delta | TC-COMP-129 does not pin the field error's `--destructive` token |
| IR-002 | MEDIUM | carried | The render right after shrinking to one column still shows the stale list (v1 IR-008) |
| IR-003 | MEDIUM | delta | The set check is not pinned for cached evidence of no set |
| IR-004 | LOW | delta | An evidence read in the same pass is not compared with the list's set |
| IR-005 | MEDIUM | late | The entry field's boundary uses `--border`, not `--input`, and shows no error border |
| IR-006 | LOW | late | The `h1` is `--text-xl` semibold, not UX 1.5's `--text-lg` |
| IR-007 | LOW | delta | Cycle 3's RED for the header shape is unlogged, and `cycle-3.patch` embeds an earlier copy of itself |
| IR-008 | LOW | carried | Never-populated with two or more symbols also names every symbol as not compared (v1 IR-010) |
| IR-009 | LOW | carried | The comparison table does not take the data-table row tokens (v1 IR-011) |
| IR-010 | LOW | carried | The scroll container repeats the table's name as a landmark (v1 IR-012) |
| IR-011 | LOW | carried | TC-COMP-128 never presses Enter in the field (v1 IR-013) |

### IR-001 — TC-COMP-129 does not pin the field error's `--destructive` token

- **Severity**: HIGH
- **Scope**: delta (the rework added the line, `index.tsx:352`; the survivor is tagged `delta`)
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-S1-3 (traces to DAC-E5-1, AC-16). The criterion is satisfied in code; the mandatory test that should establish it is `WEAK`
- **Tasks**: T004 (TC-COMP-129); T008 (the duplicate field error)
- **Files**: `web/src/screens/research/compare/index.tsx:352` (`<p id={errorId} role="alert" className="text-[hsl(var(--destructive))] text-sm">`); `web/src/screens/research/compare/compare.test.tsx:777-792` (`// Implements TC-COMP-129 (IR-001)`), `:200-221`, `:838-851`
- **Claim challenged**: Cycle 3 reports v1 IR-001 resolved: "the entry field's instrument_not_found and duplicate errors are the field's own (id, aria-invalid, aria-describedby, destructive token)". It reports a mutation score of 1.0.
- **Observed evidence**: `manual:v2-ix-error-not-destructive` removes `text-[hsl(var(--destructive))]` from the error. It passes all three focused suites (472 tests). No test asserts the error's class or colour. The TC-COMP-129 tests assert the sentence, `aria-invalid`, the accessible description, one `alert` and the clearing. Each of those has its own killed mutant: `v2-ix-no-aria-invalid`, `v2-ix-no-describedby`, `v2-ix-error-no-id` and `v2-ix-onchange-keeps-error`.
- **Expected evidence/behavior**:
  - UX design 1.5's Component Mapping cites `design-system/components/form/design-spec.md` and `input/design-spec.md` for *Add a stock*.
  - Form specification §6 gives "Error text and border | `--destructive`". Input specification §6 gives "Error border and text | `--destructive`".
  - UX 1.1 Token Usage, the CAP-002 token map DEC-0257 names, gives "errors `--destructive`".
  - Under adversarial-review E.9, a non-equivalent survivor makes the test that should kill it `WEAK`. Step H makes a `WEAK` mandatory test at least HIGH.
  - CAP-002-E4-S5 v1 judged the same case the same way: `ts-error-not-destructive` survived TC-COMP-134, its IR-003 was HIGH, and its v2 recorded the mutant killed by a class assertion.
- **Impact**: The production code is correct. If the class were dropped, the Compare field error would read like the prompt and the notice beside it, which is exactly the defect v1 IR-001 described, and no test would fail.
- **Required remediation**: In the TC-COMP-129 test (and the duplicate test), assert that the field error carries the `--destructive` token. For example, use `expect(error).toHaveClass("text-[hsl(var(--destructive))]")`, as `add-to-universe-dialog.test.tsx:426` and `save-as-universe-dialog.test.tsx:581` do. Then `v2-ix-error-not-destructive` fails. If IR-005's error border is added, pin it the same way.

### IR-002 — The render right after shrinking to one column still shows the stale list (v1 IR-008)

- **Severity**: MEDIUM
- **Scope**: carried (v1 IR-008's `manual:ix-activelist-stale`, still surviving)
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete; the rule serves DAC-E5-1)
- **Tasks**: T012 (behaviour); T009 (tests)
- **Files**: `web/src/screens/research/compare/index.tsx:273` (`const activeList = count >= MIN_SYMBOLS ? list : null;`); `web/src/screens/research/compare/compare.test.tsx:958-975`; `CAP-002-E5-S1-tdd-evidence.yaml`, cycle 3, survivor `manual:ix-activelist-stale`
- **Claim challenged**: Cycle 3 dispositions the mutant as equivalent: "the stale list is shown for at most the render before that pass, which no test can observe under act". It adds that "the owner or reviewer may overturn this disposition".
- **Observed evidence**:
  - The mutant (`const activeList = list;`) passes all three focused suites.
  - The new test asserts only after `await user.click` and `waitFor`. By then the read effect's continuation has set `list` to `null`.
  - A scratch test in a disposable clone (Independent Validation, row 15) removes BBB with a synchronous `fireEvent.click` and asserts with no `await`. On HEAD it passes. Under the mutant it fails: the remaining column renders from the stale two-symbol list, with that list's *Not enough to rank · 12 qualified, 30 needed* group statement.
  - The render is committed. A test can observe it under `act`, and a browser can paint it before the scheduled update lands.
- **Expected evidence/behavior**: DEC-0176 (b) builds a single remaining column from its evidence read alone, with the not-enough-to-rank statement reduced to the cell badges. v1 IR-008 asked that shrinking to one column, with a list whose cells or summary differ from the evidence, show the evidence.
- **Impact**: The production code is correct. A regression to `activeList = list` would flash a group statement and list cells that DEC-0176 says a one-column comparison does not have, and no test would fail.
- **Required remediation**: Make `ix-activelist-stale` fail. For example, extend the shrink test, or add one, that removes a column with a synchronous event and asserts before awaiting that the one remaining column carries no list-only group statement (or shows the evidence's cell).

### IR-003 — The set check is not pinned for cached evidence of no set

- **Severity**: MEDIUM
- **Scope**: delta (`index.tsx:158`, added by the rework; the survivor is tagged `delta`)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012 (behaviour); T010 (tests)
- **Files**: `web/src/screens/research/compare/index.tsx:153-160`; `web/src/screens/research/compare/compare.test.tsx:887-913`
- **Claim challenged**: Cycle 3: "IR-005: a column's evidence is re-read when its set is not the list read's set".
- **Observed evidence**:
  - `manual:v2-ix-set-null-cached-same` changes `(cached.set?.setId ?? null)` to `(cached.set?.setId ?? result.set.setId)`, so cached evidence with `set: null` is treated as already current. It passes every focused suite.
  - The only mismatch test moves from set `s1` to set `s2`, never from `null` to a set.
  - The case is reachable. Open `?symbols=NEWCO` before the first set exists: the evidence read returns `set: null`, `factors: {}` and `inputs: []` (DEC-0140), and it is cached. After the first set completes, **Add** a stock. Under the mutant, NEWCO's column takes the new set's scores from the list read and keeps the cached `inputs: []`, so every input row reads as absent with no status.
- **Expected evidence/behavior**: v1 IR-005 required that a column's input rows are never rendered from an evidence read of a different set than the list read on screen (STD-UI-16; DEC-0175 "the set it reads"). Under adversarial-review E.9, `null` and `s1` are different sets.
- **Impact**: The production code is correct. A regression would show a scored stock with no inputs, but only across the very first set's completion while Compare is open.
- **Required remediation**: Add a case where the cached evidence has `set: null` and a later list read has a set, and expect that column's evidence to be re-read. Then `v2-ix-set-null-cached-same` fails.

### IR-004 — An evidence read in the same pass is not compared with the list's set

- **Severity**: LOW
- **Scope**: delta (`index.tsx:153-179`, rewritten by the rework)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012
- **Files**: `web/src/screens/research/compare/index.tsx:143, 161-179, 293`
- **Claim challenged**: v1 IR-005's remediation: "Never render a column's input rows from an evidence read of a different set than the list read on screen."
- **Observed evidence**: The rework re-reads cached evidence whose set differs from the list's. Evidence fetched in the same pass is used whatever its set says (`inputs: evidence[symbol]?.inputs ?? []`). Suppose a set completes between `listClassifications` (`:143`) and the evidence reads (`:161`). The new set's input rows then sit under the previous set's scores until the next URL change.
- **Expected evidence/behavior**: As IR-003 (STD-UI-16, DEC-0175). UX 1.5 *Arriving* prescribes the two separate reads, and no artifact says how to resolve the race between them.
- **Impact**: The window is the milliseconds between two reads, once a day. The scenario v1 IR-005 described (a set completing mid-visit, then **Add** or **Remove**) is fixed.
- **Required remediation**: Optional. When a fetched evidence's `set.setId` differs from the list's, re-read the list, or say on screen that the reads disagree.

### IR-005 — The entry field's boundary uses `--border`, not `--input`, and shows no error border

- **Severity**: MEDIUM
- **Scope**: late (`index.tsx:348` is unchanged since the baseline except for indentation, row 16; the baseline could have found it)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012, T014
- **Files**: `web/src/screens/research/compare/index.tsx:348` (`className="rounded border border-border px-3 py-2"`)
- **Claim challenged**: T012 delivers *Add a stock* as the `form` `inline` + `input` `text` of UX 1.5. T014's design-token review is checked complete.
- **Observed evidence**:
  - The input's boundary is `--border` (`hsl(214 32% 91%)` on the white card, `design-system/theme.css:47`). `--input` (`:48`) is the token that `design-system/theme-validation.md:55` validates at 3.20:1 against the background.
  - While the field is in error, its border does not change.
  - Most delivered fields use `border-input` (`members-tab.tsx`, `summary-header.tsx`, `create-dialog.tsx`, `add-field.tsx`). The two DEC-0257 dialogs also add `aria-[invalid=true]:border-[hsl(var(--destructive))]`.
- **Expected evidence/behavior**:
  - Input specification §5: "border meets 3:1 against the surface". §6: "Border | `--input`" and "Error border and text | `--destructive`".
  - Form specification §6: "Field border | `--input`".
  - UX 1.1 Token Usage: "Field boundaries and focus | `--input`, `--ring`; errors `--destructive`".
  - `theme-validation.md:346`: "The control boundary is `--input`".
- **Impact**: The field's outline is far lighter than the specified 3:1 boundary. It is the one text field in CAP-002 drawn that way. Its error state is carried by the text alone.
- **Required remediation**: Draw the input's boundary in `--input`, add the `--destructive` border while `aria-invalid` is set, as the DEC-0257 dialogs do, and pin both.

### IR-006 — The `h1` is `--text-xl` semibold, not UX 1.5's `--text-lg`

- **Severity**: LOW
- **Scope**: late (`index.tsx:333` is unchanged since the baseline except for indentation, row 16)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012
- **Files**: `web/src/screens/research/compare/index.tsx:333` (`<h1 className="text-xl font-semibold">`)
- **Claim challenged**: T012: "one full-width card with `h1` *Comparing {n} stocks*".
- **Observed evidence**: The heading is `text-xl font-semibold`. The other CAP-002 research screens use `text-lg` (`results-pane.tsx:268`, `universes/index.tsx:172`).
- **Expected evidence/behavior**: UX 1.5 Page Layout: "`h1` *Comparing {n} stocks* at `--text-lg`". UX 1.1 Token Usage: "Results `h1` | `--text-lg`".
- **Impact**: Compare's title is larger and heavier than the other research screens'.
- **Required remediation**: Optional. Use `text-lg`, as the sibling research screens do.

### IR-007 — Cycle 3's RED for the header shape is unlogged, and `cycle-3.patch` embeds an earlier copy of itself

- **Severity**: LOW
- **Scope**: delta (evidence added since the baseline)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T015
- **Files**: `.../CAP-002-E5-S1-evidence/red-cycle-3.log`, `.../CAP-002-E5-S1-evidence/cycle-3.patch`, `CAP-002-E5-S1-tdd-evidence.yaml` (cycle 3 `red_evidence`)
- **Claim challenged**: Cycle 3's `red_evidence` says "the header badge's shape failed in the table suite run before it".
- **Observed evidence**:
  - `red-cycle-3.log` shows `comparison-table.test.tsx (26 tests)` passing. 26 is the file's current count, including the six rework tests, so the shape test was green when that RED was captured. No cited log shows it failing.
  - `compare.test.tsx` had 53 tests at RED against 54 now.
  - `cycle-3.patch` is 25,897 lines. It opens with a 22,968-line diff that adds an earlier `cycle-3.patch`; only 623 lines are the code diff. The code section matches the committed diff exactly, and the recorded `diff_sha256` matches the file.
- **Expected evidence/behavior**: T015 requires each cycle's RED and GREEN evidence. CAP-002-E4-S5 v2 raised the same self-embedding as LOW (its IR-003).
- **Impact**: Evidence quality only. This review's mutation run shows that the shape test kills both shape mutants (`v2-ct-header-no-shape`, `ct-outdated-no-icon`).
- **Required remediation**: Optional. In the next cycle, capture RED for every new test that should fail, and generate the patch before writing it into the evidence directory.

### IR-008 — Never-populated with two or more symbols also names every symbol as not compared (v1 IR-010)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012, T010
- **Files**: `web/src/screens/research/compare/index.tsx:276-296, 392`; `web/src/screens/research/compare/compare.test.tsx:419-428`
- **Claim challenged**: T010: `neverClassified: true` renders "the never-populated statement".
- **Observed evidence**: Unchanged since v1. With `neverClassified` and no rows, every symbol reaches the not-compared notice beside *No stocks have been scored yet.*
- **Expected evidence/behavior**: UX 1.5 States, *Never scored*: "Section 1.1's statement, with the chosen symbols kept in the URL".
- **Impact**: The never-scored screen states the same fact twice.
- **Required remediation**: Optional, as in v1.

### IR-009 — The comparison table does not take the data-table row tokens (v1 IR-011)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/components/patterns/comparison-table.tsx:65-68`
- **Claim challenged**: The table is "a native `<table>` with the `data-table` token set".
- **Observed evidence**: Unchanged since v1: `px-3 py-2` cells, no `h-row`, no row rule.
- **Expected evidence/behavior**: Classification-ui §10 and UX 1.5, as in v1.
- **Impact**: Density and row rules differ from every other table in the product.
- **Required remediation**: Optional, as in v1.

### IR-010 — The scroll container repeats the table's name as a landmark (v1 IR-012)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/components/patterns/comparison-table.tsx:250-259`
- **Claim challenged**: The container and table meet UX design 1.5 Accessibility.
- **Observed evidence**: Unchanged since v1: a named `section` (a region landmark) wraps a table with the same `aria-label`.
- **Expected evidence/behavior**: UX 1.5 Accessibility; T011, as in v1.
- **Impact**: Redundant announcements.
- **Required remediation**: Optional, as in v1.

### IR-011 — TC-COMP-128 never presses Enter in the field (v1 IR-013)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A (DAC-E5-S1-2 is satisfied)
- **Tasks**: T004
- **Files**: `web/src/screens/research/compare/compare.test.tsx:172-174`
- **Claim challenged**: T004: "pressing it and pressing Enter in the field issue no request and add no column".
- **Observed evidence**: Unchanged since v1. The test clicks **Add**, then presses Enter, which lands on the button.
- **Expected evidence/behavior**: T004 as written.
- **Impact**: Evidence fidelity only.
- **Required remediation**: Optional, as in v1.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) The entry field's error is not a field error | RESOLVED | `index.tsx:338-355`: `aria-invalid`, `aria-describedby={errorId}`, the error inside the field's group in `--destructive`, cleared on change (`:342-345`) and on a successful **Add** (`:234`). Tests `compare.test.tsx:777-851`. `ix-add-keep-stale-error` (carried) is killed, as are the new field-error mutants. One new delta gap on the line this fix added: IR-001 |
| v1/IR-002 (HIGH) Header *Not followed* badge carries no shape | RESOLVED | `comparison-table.tsx:82-90, 223`, the same dash-in-circle E4-S3's `NotFollowedIcon` draws (`factor-cell.tsx:55-62`). `comparison-table.test.tsx:644-646, 649-664`. `ct-outdated-no-icon` and `v2-ct-header-no-shape` are killed |
| v1/IR-003 (HIGH) TC-COMP-114 cannot tell a retired column from an active one | RESOLVED | `comparison-table.test.tsx:631-647` asserts the active header has no badge and no shape. `ct-header-notfollowed-always` (carried) is killed |
| v1/IR-004 (HIGH) Page card and secondary **Add** not rendered | RESOLVED | `index.tsx:324-332`: breadcrumb above a `section` with `bg-card text-card-foreground`. `:362`: **Add** has `bg-secondary text-secondary-foreground`. Test `compare.test.tsx:853-868`; `v2-ix-card-plain` and `v2-ix-add-outline` are killed; classes present in the built CSS. The `h1` size is a separate late LOW (IR-006) |
| v1/IR-005 (MEDIUM) Evidence cache can mix sets | RESOLVED | `index.tsx:153-160` re-reads cached evidence whose set differs from the list's. Tests `compare.test.tsx:870-913`. `ix-evidence-no-cache` (re-authored, carried), `v2-ix-set-check-off` and `v2-ix-set-check-equal` are killed. Residual test gap: IR-003. Residual same-pass race: IR-004 |
| v1/IR-006 (MEDIUM) Four table contract mutants survive | RESOLVED | `ct-dates-label-asof`, `ct-percentile-showscore`, `ct-missing-shows-value` and `ct-input-mark-const-factor` (all carried) are killed by `comparison-table.test.tsx:666-725` |
| v1/IR-007 (MEDIUM) Restated sentence pinned only for percentile marks | RESOLVED | `ix-hasmark-no-inputs`, `ix-hasmark-momentum-cells` and `ix-hasmark-momentum-inputs` (carried) are killed by `compare.test.tsx:915-946` |
| v1/IR-008 (MEDIUM) Screen read, notice and URL rules unpinned | STILL OPEN (in part) | `ix-hasallfactors-some`, `ix-url-no-encode`, `ix-notcompared-join` (re-authored), `ix-reported-reversed` and `ix-add-overflow-unguarded` are killed (`compare.test.tsx:948-1025`). `ix-activelist-stale` survives and is shown not equivalent (row 15). Carried as IR-002 (MEDIUM) |
| v1/IR-009 (MEDIUM) T002's strings anchored nowhere | RESOLVED | `copy.test.ts:475-495`; `cp-notcompared-wording`, `cp-duplicate-drops-symbol`, `cp-label-eps`, `cp-label-fcf` and `cp-label-return-12m` (carried) are killed |
| v1/IR-010 (LOW) Never-populated double statement | STILL OPEN | Unchanged; the cycle-3 description leaves the LOWs as optional. Carried as IR-008 |
| v1/IR-011 (LOW) Data-table row tokens | STILL OPEN | Unchanged. Carried as IR-009 |
| v1/IR-012 (LOW) Landmark repeats the table's name | STILL OPEN | Unchanged. Carried as IR-010 |
| v1/IR-013 (LOW) TC-COMP-128 Enter in the field | STILL OPEN | Unchanged. Carried as IR-011 |

## Scope and Plan Deviations

- **`copy.test.ts`** is modified outside T013's five-file list. This is justified, because v1 IR-009 required the anchors there.
- **Plan bookkeeping**: since v1 the rework touched only the plan's frontmatter (`updated`, `last_reworked_review`). T012 and T014, which v1 found `PARTIAL`, are now `VERIFIED`, so the checked boxes are accurate.
- **v1 deviations that still hold**:
  - `ApiUnreachableError` renders nothing, because the shell owns that state.
  - The screen keeps a local `Read` union.
  - Unlisted symbols are named in the notice.
  - The row labels follow the plan's T006 rather than UX 1.5's longer names.
- **Cycle 3's equivalence claim** for `manual:ix-activelist-stale` is overturned on executable evidence (row 15). Its other four equivalent survivors agree with this review.
- **The JSX block of `index.tsx` was re-indented** inside the new card. Git therefore reports unchanged lines as changed. Lines unchanged under `git diff -w` were scoped `late`, because the baseline could have found anything on them (step H: scope comes from git, and the baseline's ability to find a gap decides `late`).
- **State check**: without `--base-ref` it reports `BLOCKED`; with the driver's integration branch it reports `ready`. This is an observation about invocation, as in v1.
- **No decision recorded**: no question in this review needed the owner. Each judgment names the artifact or precedent it rests on.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework CAP-002-E5-S1 with `$story-coding`, using the task file and this report.
  - Resolve IR-001 by pinning the field error's `--destructive` token in TC-COMP-129 and the duplicate test.
  - Resolving the MEDIUM findings IR-002, IR-003 and IR-005 is recommended; they do not block on their own.
  - The LOW findings IR-004 and IR-006 to IR-011 are optional.
  - Then rerun `$adversarial-review`. It will take this report as its baseline and pass `CAP-002-E5-S1-implementation-review-v2-mutation.json` to `scope --previous`.
- **Warnings accepted downstream**: N/A
