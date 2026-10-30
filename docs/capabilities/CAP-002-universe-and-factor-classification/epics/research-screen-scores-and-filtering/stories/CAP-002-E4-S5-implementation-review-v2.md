---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S5-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-29
updated: 2026-10-29
story_id: "CAP-002-E4-S5"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-29T06:53:28Z"
reviewed_head: "77c0801a27f32aebd31891db71a329a478f23e1e"
review_base: "7b4b5f5b4b1148cb810c3364e429348fab532d9e"
reviewed_state_revision: "sha256:a844237bc0919d9c169ce3bf7a0ef002b96efd4b03f1c271014b2c664cf7e597"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E4-S5
    artifact_version: 1
    content_revision: sha256:802d8702842d0485687f1df970dc28b9a2a19b66c9acc29e4aba07bf1eccbdde
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-29T06:53:28Z
  source_artifacts:
    - id: CAP-002-E4-S5
      version: "1 (sha256:802d8702842d0485687f1df970dc28b9a2a19b66c9acc29e4aba07bf1eccbdde)"
    - id: CAP-002-E4-S5-tasks
      version: "1 (updated 2026-10-29, last_reworked_review v1)"
    - id: CAP-002-E4-S5-tdd-evidence
      version: "cycle-1 to cycle-4"
    - id: CAP-002-E4-S5-implementation-review
      version: "1 (baseline, reviewed_head 8fb44bc)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: DEC-0156
      version: "upheld 2026-10-18"
    - id: DEC-0157
      version: "upheld 2026-10-18, amended E4-F14 and E4-F31"
    - id: DEC-0158
      version: "upheld 2026-10-18"
    - id: DEC-0235
      version: "open, decided_by agent 2026-10-29"
    - id: DEC-0236
      version: "open, PROVISIONAL 2026-10-29"
    - id: DEC-0237
      version: "open, PROVISIONAL 2026-10-29"
    - id: STD-UI (ui-conventions)
      version: "6"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S5 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 6/6 satisfied |
| Planned tasks | 13/14 verified |
| Required validation | 8/8 passed |

This is the second review. Its baseline is v1 (CHANGES-REQUIRED,
`reviewed_head` `8fb44bc`) and `CAP-002-E4-S5-implementation-review-v1-mutation.json`.
The rework is one commit, `77c0801`, on top of the v1 review commit `a6a01e1`.

All 11 v1 findings were checked against the current repository:

- 10 are **resolved**: IR-001 to IR-010.
- 1 is **still open**: IR-011, LOW, which v1 said was not required for the gate.

Every required validation command passes when rerun independently:

- the four focused suites (415 tests);
- the full web suite (890 tests in 48 files);
- lint, format and `tsc --noEmit`;
- the build, and T013's built-CSS token check;
- the TDD-evidence lint (0 errors).

The cycle-4 patch, applied to `8fb44bc`, reproduces HEAD's `web/src` exactly.

The verdict stays CHANGES-REQUIRED for one finding:

- **IR-001** (HIGH, `delta`). DEC-0235, recorded for this rework, says *Look
  in* "treats a failure on any page as the list's failure". No test fails a page
  after the first. A reviewer mutant survives the focused suites: it keeps the
  pages already read and hides a later page's failure. The production code is
  correct (probe P1), and the fix is one test.

Two LOW findings do not block. A negative `w-14` test assertion puts a size
literal back into the shipped CSS, and v1/IR-011 is still open.

**Mutation run.** 106 mutants ran: 97 killed, 9 survived, none stillborn.

- 59 are `carried`: v1's own mutants that still apply, including all 10 of v1's
  non-equivalent survivors, which are now killed.
- 26 are `delta`: 22 written by hand for this review, plus regenerated
  catalogue mutants on changed lines.
- 21 are `late`: catalogue mutants on unchanged lines whose ids changed with
  their line numbers.

Eight survivors are equivalent and are dispositioned below. The ninth is IR-001.

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2 · **total 3**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S5`, three commits ahead of `origin/main`: `8fb44bc` (story-coding), `a6a01e1` (review v1), `77c0801` (rework) |
| HEAD | `77c0801a27f32aebd31891db71a329a478f23e1e` ("fix(research): CAP-002-E4-S5 story-coding rework"; trailers `Decision-Id: DEC-0235`, `DEC-0236`, `DEC-0237`) |
| Review base | `origin/main` (`7b4b5f5`), resolved by `pipeline-state.py review-base --base-ref origin/main` to `7b4b5f5b4b1148cb810c3364e429348fab532d9e`, an ancestor of HEAD |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files. Validation wrote only to the ignored `src/factorflow/api/static/` and `node_modules/.vite/`. |
| Changed files reviewed | 35 against the base (24,427 insertions, 17 deletions). 17 changed since the baseline, of which 2 are the v1 review's own files. |
| Baseline | v1, `reviewed_head` `8fb44bc9e31717240f00372eea486c9fcebde447`, with `CAP-002-E4-S5-implementation-review-v1-mutation.json` |

### Changed Files

In this table, `docs/.../` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/use-research-query.ts` | added (+5 since baseline, doc comment only) | T008; DEC-0156; v1/IR-009 |
| `web/src/screens/research/use-research-query.test.tsx` | added (unchanged since baseline) | T007 |
| `web/src/screens/research/threshold-sentence.tsx` | added (+27/−17 since baseline) | T010; DAC-E4-S5-1, DAC-E4-S5-4; v1/IR-002, IR-006, IR-010 |
| `web/src/screens/research/threshold-sentence.test.tsx` | added (+121/−7 since baseline) | T001, T002, T005; v1/IR-002, IR-003, IR-006, IR-010 |
| `web/src/screens/research/filters-pane.tsx` | added (+40/−11 since baseline) | T011; AC-16, DAC-E4-3, DAC-E4-S5-2, DAC-E4-S5-3; v1/IR-001, IR-005, IR-007, IR-008 |
| `web/src/screens/research/filters-pane.test.tsx` | added (+191/−1 since baseline) | T003, T004, T006; v1/IR-001, IR-002, IR-004, IR-005, IR-007, IR-008 |
| `web/src/screens/research/copy.ts` | modified (+6 since baseline) | T009 (Open Gap 4); `FILTERS.loadingUniverses` (DEC-0237) |
| `web/src/screens/research/copy.test.ts` | modified (+1 since baseline) | T009 anchor line for *Loading universes…* |
| `docs/.../stories/CAP-002-E4-S5-tdd-evidence.yaml` | added (+84 since baseline: cycle-4) | T014 |
| `docs/.../stories/CAP-002-E4-S5-evidence/cycle-4.patch`, `red-cycle-4.log`, `green-cycle-4.log`, `full-suite-cycle-4.log`, `mutants-cycle-4.json`, `mutation-cycle-4-results.json` | added (6, since baseline) | T014, cycle 4 |
| `docs/.../stories/CAP-002-E4-S5-evidence/` cycle 1 to 3 files (16) | added (unchanged since baseline) | T014, cycles 1 to 3 |
| `docs/.../stories/CAP-002-E4-S5-implementation-review-v1.md`, `-v1-mutation.json` | added by `a6a01e1` | Adversarial review v1 output (not coder work) |
| `docs/.../stories/CAP-002-E4-S5-tasks.md` | modified (+10/−1 since baseline) | `updated`, `last_reworked_review`, and a *Rework notes (implementation review v1)* section recording the deviations behind IR-001, IR-002 and IR-005 to IR-010 |
| `docs/.../stories/CAP-002-E4-S5.md` | modified (unchanged since baseline) | `status: planning` → `in-review` only |

No file under `web/src/app/` changed. No delivered file other than `copy.ts`
and `copy.test.ts` changed (T012).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `filters-pane.tsx:59-293` `FiltersPane`; *Look in* now lists every page of active universes (`:36-46` `listActiveUniverses`, `:80-99`); three `ThresholdSentence` rows (`:250-257`); `showLookIn=false` mode (`:81`, `:138`, `:162`) | `filters-pane.test.tsx:104` TC-COMP-135 (a)-(e), two factors at once in (c); `:380` two-page *Look in*; `:436` universe-detail mode | Filtering across all stocks and within a universe works. Production handles a later-page failure as DEC-0235 requires (probe P1), but no test pins that (IR-001). |
| DAC-E4-3 | SATISFIED | `use-research-query.ts:35-56`: the URL is the only state, writes are pushes; re-sync from the URL in `threshold-sentence.tsx:91-98` and `filters-pane.tsx:101-105` | `use-research-query.test.tsx:76`; `threshold-sentence.test.tsx:476, 493, 512` (single-part re-sync); `filters-pane.test.tsx:589, 608, 625` (back over *Look in*, the checkbox and a search, with and without a field error) | v1's gap is closed: all four v1 re-sync mutants are killed. The `match_count` heading belongs to the results host (CAP-002-E4-S9). |
| DAC-E4-S5-1 | SATISFIED | `threshold-sentence.tsx:24-40` `validateThresholdValue(factor, measure, raw)` delegates validity to `decodeResearchQuery`; `:100-120` `commit`; `:186-190` Enter runs the same commit as blur | `threshold-sentence.test.tsx:39-197` TC-COMP-134 (a)-(e), with the `--destructive` colour asserted in `expectFieldError` (`:34-35`); `:287` codec-agreement table | — |
| DAC-E4-S5-2 | SATISFIED | Every change is one `setQuery` (`filters-pane.tsx:110, 118, 128, 135, 217, 273`); equal writes navigate nowhere (`use-research-query.ts:42-44`) | `filters-pane.test.tsx:104`, `:167` (Enter commits once, the following blur nothing), `:182`, `:199` | Through DEC-0156's probe host |
| DAC-E4-S5-3 | SATISFIED | `filters-pane.tsx:131-141` `clearFilters`. It bumps `thresholdReset` (`:69`, `:134`), and the rows are keyed by it (`:252`), so every row remounts at its defaults. It keeps `sort`, keeps `scope` when `showLookIn` is false, and moves focus to *Find a stock*. | `filters-pane.test.tsx:213, 242, 258, 277, 299`; `:578` focus | v1/IR-001 is fixed. Probe P2 repeats the uncommitted-draft case under `v7_startTransition` (as `main.tsx` enables it): the rows reset and no alert remains. |
| DAC-E4-S5-4 | SATISFIED | `threshold-sentence.tsx:135-136, 148-192`: names from `copy.ts`; value row verbatim; growth and momentum *Value threshold for {factor}* (DEC-0157) | `threshold-sentence.test.tsx:199-265` TC-COMP-137, including each row's swatch token (`:254`); `filters-pane.test.tsx:309` | — |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `threshold-sentence.test.tsx:39-197` | (a)-(d), plus three Enter cases (e) at `:147, :167, :179` (DEC-0157), and the `--destructive` colour on every error (`:34-35`) |
| T002 | complete | VERIFIED | `threshold-sentence.test.tsx:199-265` | Pins `w-8` instead of the plan's `w-14` (DEC-0236, PROVISIONAL; recorded in the plan's Rework notes). Each row's swatch token is asserted (`:254`). The negative `w-14` assertion has a build side effect (IR-002). |
| T003 | complete | VERIFIED | `filters-pane.test.tsx:104-210` | Adds an Enter commit through the probe host (`:167`) |
| T004 | complete | VERIFIED | `filters-pane.test.tsx:213-306` | Now covers an uncommitted invalid draft with its error (`:258`) and a select-only change (`:277`) |
| T005 | complete | VERIFIED | `threshold-sentence.test.tsx:267-550` | (f) now changes one part at a time (`:476, 493, 512`). (a) calls the three-argument validator, with growth and momentum wording (`:304`). |
| T006 | complete | PARTIAL | `filters-pane.test.tsx:308-742` | v1's gaps are closed: the call argument (`:377`); paging (`:380`); Esc on an uncommitted draft (`:527`); back over a search (`:608, 625`); the loading and failed labels (`:659, 673`); a coded failure (`:716`). Still missing: a failure on a page after the first, which DEC-0235 specifies (IR-001). |
| T007 | complete | VERIFIED | `use-research-query.test.tsx:49-161` | Unchanged since the baseline; all 5 carried hook mutants are killed |
| T008 | complete | VERIFIED | `use-research-query.ts:1-56` | The one-tick limitation is now stated in the doc comment (`:25-28`) and in the plan's Rework notes (v1/IR-009) |
| T009 | complete | VERIFIED | `copy.ts:266-271` `FILTERS.loadingUniverses`; `copy.test.ts:441` | Additive. It has a doc comment naming DEC-0237 and an anchor line, so the forbidden-vocabulary scan covers it. `OPERATION_LABELS` is reused, not extended. |
| T010 | complete | VERIFIED | `threshold-sentence.tsx:1-206` | Enter commits (`:186-190`); the validator takes the factor (`:24-40`); the field is `w-8` (`:191`, DEC-0236). The re-sync effect is unchanged. A remount resets a row whose `value` was already `undefined`, as the doc comment says (`:74-76`). |
| T011 | complete | VERIFIED | `filters-pane.tsx:1-293` | Built as planned, with these deviations, each recorded in the plan's Rework notes: <ul><li>paging (DEC-0235);</li><li>a remount on Clear filters;</li><li>the checkbox's `h-4 w-4` and `--control-min-target` label;</li><li>the loading and failed scope labels (DEC-0237).</li></ul> Probe P1 confirms the paged load fails as a whole when a later page fails, as DEC-0235 requires. |
| T012 | complete | VERIFIED | `npm run test`: 48 files, 890 tests pass; `git diff --name-status 7b4b5f5 HEAD` | Nothing under `web/src/app/`; `render.test.tsx` passes |
| T013 | complete | VERIFIED | format, lint, `tsc`, test and build all exit 0. The built `index-DSpL3hZf.css` defines `--factor-value`, `--factor-growth` and `--factor-momentum` (light and dark), and maps `w-8`, `w-4` and `h-4` to `var(--space-8)` and `var(--space-4)`. | The same CSS also carries `.w-14{width:3.5rem}`, emitted from a test string (IR-002) |
| T014 | complete | VERIFIED | `CAP-002-E4-S5-tdd-evidence.yaml` cycle-4; `check-tdd-evidence.py --require-logs`: 0 errors | `diff_sha256` `ae5d8cb…` equals the `shasum -a 256` of `cycle-4.patch`, which no longer embeds itself. The `red_log`, `logs` and mutation results hashes match their files. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `threshold-sentence.test.tsx:39` describe block / TC-COMP-134 | ADEQUATE | Covers: <ul><li>a field error on blur and on Enter, with the exact wording, `aria-invalid`, `aria-describedby`, the `--destructive` colour and zero commits;</li><li>valid edges commit once;</li><li>Enter commits once, and a later blur adds nothing;</li><li>blank after a committed value commits `null`, on blur and on Enter.</li></ul> | none. `ts-error-not-destructive`, `ts2-enter-ignored`, `ts2-every-key-commits` and `ts2-commit-error-not-set` are killed. |
| `filters-pane.test.tsx:103` describe block / TC-COMP-135 | ADEQUATE | One probe request per change with exact `toListParams` objects; none while typing; Enter through the pane commits once | none |
| `filters-pane.test.tsx:212` describe block / TC-COMP-136 | ADEQUATE | Defaults plus sort; unowned key kept; committed and uncommitted threshold drafts and their error reset; select-only changes reset; *Find a stock* draft reset; absent for sort alone | none. `fp2-reset-key-ignored` and `fp2-clear-no-bump` are killed. |
| `threshold-sentence.test.tsx:199` describe block / TC-COMP-137 | ADEQUATE | Names on all three rows, option order, placeholder, one `<p>`, a hidden swatch carrying its own `--factor-*` token | none. `ts-swatch-one-colour` and `ts-swatch-no-colour` are killed. The `w-14` negative assertion is a LOW build-hygiene issue (IR-002), not a test-strength gap. |
| `threshold-sentence.test.tsx:267` describe block / T005 (additional) | ADEQUATE | Codec agreement; factor-specific validator wording; text input in decimal mode; select commits; error on blur only; error clearing; single-part re-sync; never disabled | none. `ts-effect-ignores-raw`, `ts-effect-ignores-measure` and `ts2-validate-ignores-factor` are killed. |
| `filters-pane.test.tsx:308` describe block / T006 (additional) | WEAK | Structure, checkbox sizing tokens, every *Look in* page, scope removal, universe-detail mode, Clear visibility, Enter, Esc, focus, back over a search, the loading, failed and unavailable labels, coded and uncoded list failures | No test fails a page after the first. `manual:review-v2:fp2-later-page-failure-swallowed` survives (IR-001). |
| `use-research-query.test.tsx:49` describe block / T007 (additional) | ADEQUATE | Decode, unknown keys kept, push, back, equal write, clear keeps sort, one-tick pushes, memoised identity | none |
| `copy.test.ts:441` / T009 anchor | ADEQUATE | *Loading universes…* is in the anchor table and the forbidden-vocabulary scan | none. `copy2-loading-wording` is killed. |

Isolation and determinism are unchanged from v1:

- every suite resets its mocks in `beforeEach`;
- every suite renders inside `MemoryRouter`;
- the pending-list test uses a never-settling promise, not timers;
- no test touches the network.

**Mutation run.** `scripts/mutation-run.py` built the mutant set in three steps:

1. `generate` over `7b4b5f5..HEAD`: 25 catalogue mutants.
2. 22 manual mutants over the lines changed since `8fb44bc`.
3. `scope --since 8fb44bc --previous` the v1 results. This added v1's 59 mutants
   that still apply. 10 v1 mutants whose lines changed no longer apply, and the
   regenerated and manual delta mutants replace them.

The run: 106 mutants; 97 killed, 9 survived, 0 stillborn. The baseline passed on
all four workers, with the tree patch empty (`e3b0c442…`).

Results: `CAP-002-E4-S5-implementation-review-v2-mutation.json` (sha256
`b8ba3832ab09601d07cc0837edd233956bb3ee89fd8056ddeaf4afab2e5fd53f`).

| Survivor | Scope | Disposition | Reason (artifact that fixes or leaves it open) |
|----------|-------|-------------|-----------------------------------------------|
| `filters-pane.tsx:82:negate-boolean:1` (v1 id) and `filters-pane.tsx:97:negate-boolean:1` (same line, new id): cleanup `cancelled = false` | carried / late | equivalent | v1's disposition holds. DEC-0156 fixes `showLookIn` per host, so the effect runs once per mount. Its cleanup runs only on unmount, and React 18.3 drops the state update that follows it. |
| `threshold-sentence.tsx:87:negate-boolean:1`, `:2` (v1 ids) and `threshold-sentence.tsx:93:negate-boolean:1`, `:2` (same line, new ids) | carried / late | equivalent | v1's disposition holds. `ThresholdSentenceProps.value?: Sentence` (`:63`) has three required fields, so either all three are defined or none is. |
| `filters-pane.tsx:69:off-by-one:1` (`useState(1)` for the reset generation) | delta | equivalent | The generation is read only as a suffix of each row's `key` (`:252`). No artifact specifies the key: T011 and v1/IR-001 fix only the outcome, that every row returns to its defaults. The starting value is never rendered, compared or written. The coder's disposition is upheld. |
| `filters-pane.tsx:134:off-by-one:1` (`generation + 2`) | delta | equivalent | Same reason: any change of the key remounts the rows. The non-equivalent neighbours `fp2-clear-no-bump` and `fp2-reset-key-ignored` are killed. |
| `manual:review-v2:fp2-later-page-failure-swallowed` | delta | **not equivalent** | DEC-0235: *Look in* "treats a failure on any page as the list's failure" → IR-001 |

## Independent Validation

All commands ran inside the sandbox, with no sandbox refusal. Unless stated,
they ran from the component root `repos/factorflow-v2/FactorFlow-v2`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | Context last run 2h ago; every row PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5.md --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | PASS | `7b4b5f5b4b1148cb810c3364e429348fab532d9e`, an ancestor of HEAD; `8fb44bc` is also an ancestor |
| `npx vitest run src/screens/research/use-research-query.test.tsx src/screens/research/threshold-sentence.test.tsx src/screens/research/filters-pane.test.tsx src/screens/research/copy.test.ts` | component | 0 | PASS | 4 files, 415 tests |
| `npm run test` | component | 0 | PASS | 48 files, 890 tests |
| `npm run lint` | component | 0 | PASS | `biome lint .`: 112 files, no diagnostics |
| `npm run format` | component | 0 | PASS | `biome format .`, check only: 112 files, nothing to fix |
| `npx tsc --noEmit` | component | 0 | PASS | no output |
| `npm run build` | component | 0 | PASS | `vite build`, 63 modules; writes the ignored `src/factorflow/api/static/` |
| `grep -o -E -- "--factor-(value\|growth\|momentum):[^;}]*" src/factorflow/api/static/assets/index-DSpL3hZf.css` | component | 0 | PASS | Each token is defined twice, light and dark, so T013's gate holds. A second grep finds `.w-8{width:var(--space-8)}`, `.w-4`/`.h-4{…var(--space-4)}` and `.w-14{width:3.5rem}` (IR-002). |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7b4b5f5b4b1148cb810c3364e429348fab532d9e --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7b4b5f5b4b1148cb810c3364e429348fab532d9e..HEAD --cycle review --out <scratchpad>/v2-generated.json`, plus 22 manual mutants | harness root | 0 | PASS | 25 generated: `negate-boolean` 16, `drop-field-copy` 5, `off-by-one` 4 |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratchpad>/v2-with-manual.json --since 8fb44bc9e31717240f00372eea486c9fcebde447 --previous docs/.../CAP-002-E4-S5-implementation-review-v1-mutation.json --out <scratchpad>/v2-mutants.json` | harness root | 0 | PASS | 106 mutants: `carried` 59, `delta` 26, `late` 21; 10 previous mutants no longer apply (their lines changed) |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratchpad>/v2-mutants.json --jobs 4 --timeout 600 --command 'test -e node_modules \|\| ln -s <component>/node_modules node_modules; ./node_modules/.bin/vitest run src/screens/research/use-research-query.test.tsx src/screens/research/threshold-sentence.test.tsx src/screens/research/filters-pane.test.tsx src/screens/research/copy.test.ts' --out <scratchpad>/v2-mutation-results.json --logs <scratchpad>/v2-mutation-logs` | harness root | 3 | FAIL (test-quality gate) | 97 killed, 9 survived: 8 equivalent, 1 not (IR-001). Exit 3 means survivors, not an environment fault. |
| `git apply --index cycle-4.patch` onto `8fb44bc` in a scratch `git clone --shared`, then `git diff --cached --stat 77c0801 -- web/src` | scratch clone | 0 | PASS | No `web/src` difference, so the diff the cycle-4 reviews judged is the shipped code |
| Reviewer probes P1 to P3 (`vitest run` of one probe file in a scratch `--shared` clone at `77c0801`; nothing written to the component repository) | scratch clone | 0 | PASS (observations) | P1: page 1 resolves with `nextCursor: "c1"` and page 2 rejects. The alert reads *Could not load your universes: FactorFlow hit an unexpected problem. Try again.* The options are *All followed stocks* and *Could not load your universes*, and the calls carry the cursor. The code is correct, and the gap is in the tests (IR-001). P2: Clear filters under `v7_startTransition` resets the rows and moves focus to *Find a stock*. P3: Enter on `101`, then Tab, writes nothing. |
| `vite build` in the scratch clone after deleting `threshold-sentence.test.tsx:237` | scratch clone | 0 | PASS (observation) | The built CSS then has no `w-14` rule, which proves the rule comes from the test string (IR-002) |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the task plan's Validation Plan and T013: no screen mounts the pane yet |
| `npm ci` | — | N/A | NOT RUN | `package.json` and `package-lock.json` are unchanged; it would rewrite `node_modules` (constraint 10) |
| `uv sync`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | — | N/A | NOT RUN | No Python file is in the change set, and the task plan scopes validation to the web commands |

The Gate Summary counts the same eight required commands as v1:

1. the focused suites;
2. `npm run test`;
3. `npm run lint`;
4. `npm run format`;
5. `npx tsc --noEmit`;
6. `npm run build`;
7. T013's CSS check;
8. the TDD-evidence lint.

The mutation run is the test-quality gate of step E.9, not one of the eight.

### Validation Side Effects

- **Before.** `usr/alvaro-de-jodra/CAP-002-E4-S5` at `77c0801`.
  `git status --porcelain --untracked-files=all` was empty. The code fingerprint
  was `sha256:a844237bc0919d9c169ce3bf7a0ef002b96efd4b03f1c271014b2c664cf7e597`.
- **After.** The same HEAD, the same empty status and the same fingerprint,
  rechecked after the build and again after the mutation run. Two ignored paths
  changed:
  - the build added `assets/index-DSpL3hZf.css` and `index-DqC2Z1S6.js` under
    the ignored `src/factorflow/api/static/`;
  - vitest updated the ignored `node_modules/.vite/` cache.
- **Unexpected tracked-file changes:** none.
- **Files this review wrote:** this report and
  `CAP-002-E4-S5-implementation-review-v2-mutation.json`. Both sit under
  `docs/`, which the code fingerprint excludes.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | delta | No test fails a page after the first, so DEC-0235's whole-list failure is unpinned |
| IR-002 | LOW | delta | The negative `w-14` assertion puts a size literal back into the shipped CSS |
| IR-003 | LOW | carried | `cycle-3.patch` still embeds an earlier copy of itself (v1/IR-011) |

### IR-001 — No test fails a page after the first, so DEC-0235's whole-list failure is unpinned

- **Severity**: HIGH
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: AC-16 (filter within a single universe); DAC-E4-3
- **Tasks**: T006 (b), (j); T011
- **Files**:
  - `web/src/screens/research/filters-pane.tsx:36-46` (`listActiveUniverses`, all lines new since `8fb44bc`) and `:91-95` (the `catch`);
  - `web/src/screens/research/filters-pane.test.tsx:380-411` (two pages, both resolving) and `:686-742` (failures on the first and only page).
- **Claim challenged**: The tdd-evidence cycle-4 records 26 of 28 mutants
  killed, with the 2 survivors equivalent. DEC-0235 decides that the pane "treats
  a failure on any page as the list's failure".
- **Observed evidence**:
  - **The mutant.** `manual:review-v2:fp2-later-page-failure-swallowed` wraps
    the paging loop in `try { … } catch (cause) { if (universes.length === 0) {
    throw cause; } }`. A failure on the first page still fails the list. A
    failure on a later page now returns the universes already read, with no
    error.
  - **Run against the focused suites.** All 415 tests pass with the mutant
    applied (log sha256 `f85477e3…`). Every failure test rejects the first
    call. The only paging test (`:380`) resolves both pages.
  - **Probe P1 on the real code.** Page 1 resolves with `nextCursor: "c1"`, and
    page 2 rejects. The pane shows the failure alert. The URL scope `u1` reads
    *Could not load your universes*, because the page-1 universe is not listed
    on its own. This is correct, but nothing pins it.
- **Expected evidence/behavior**:
  - DEC-0235, recorded for this rework and cited by the plan's Rework notes
    under T011, says "treats a failure on any page as the list's failure".
  - adversarial-review E.9 and TEST-TDD-006 require that no non-equivalent
    mutant survives. A behaviour a decision record specifies is part of the
    contract, so this mutant is not equivalent.
  - The lines are new since the baseline, so the gap is `delta` and may block.
- **Impact**: A plausible regression would pass the suite unseen. One example
  is a "best effort" catch that keeps the pages already read. It would list a
  partial set of universes without saying so. A URL scope on an unread page
  would then read *Unavailable universe*, while the request still filters by
  that universe. That misstates the filter in effect, which DEC-0158 and
  DEC-0237 exist to prevent. Nothing is wrong in production today; the gap is
  only in the tests.
- **Required remediation**: Add a test in which the first page resolves with a
  non-null `nextCursor` and a later page rejects. It must assert that:
  - the list's failure sentence is shown;
  - no partial list is offered: the page-1 universe is absent from *Look in*;
  - a URL scope reads the failed-list label (DEC-0237), not *Unavailable universe*.

  Rerun `mutation-run.py` with
  `manual:review-v2:fp2-later-page-failure-swallowed` (it is in
  `CAP-002-E4-S5-implementation-review-v2-mutation.json`) and confirm it is
  killed. No production change is required.

### IR-002 — The negative `w-14` assertion puts a size literal back into the shipped CSS

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T002, T013
- **Files**: `web/src/screens/research/threshold-sentence.test.tsx:237` (`expect(field).not.toHaveClass("w-14")`); `tailwind.config.js` (`content` includes `./web/src/**/*.{ts,tsx}`, so test files are scanned)
- **Claim challenged**: DEC-0236 and the cycle-4 evidence say the rework removes
  the literal `w-14` in favour of the `--space-8` token (STD-UI-29).
- **Observed evidence**:
  - **The built CSS.** `npm run build` at HEAD emits `.w-14{width:3.5rem}` into
    `index-DSpL3hZf.css`.
  - **The only source.** `git grep w-14 -- web/src` finds one occurrence: the
    test's negative assertion. No production element uses the class.
  - **The proof.** In a scratch clone, deleting that one test line and
    rebuilding removes the rule.
- **Expected evidence/behavior**: STD-UI-29 (`docs/constitution/standards/ui-conventions.md:579-592`) says "No spacing, size or colour literal appears outside the theme."
- **Impact**: The production stylesheet keeps a dead `3.5rem` width rule outside
  the theme. It is about 20 bytes and does not change rendering. A later
  `grep` for size literals in the bundle would flag it.
- **Required remediation**: Assert the absence of the old width without writing
  the literal class token in a scanned file. Alternatively, rely on the positive
  `w-8` assertion alone, which `ts2-field-width` shows is sufficient. Confirm
  the built CSS has no `w-14` rule.

### IR-003 — `cycle-3.patch` still embeds an earlier copy of itself (v1/IR-011)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T014
- **Files**: `docs/.../CAP-002-E4-S5-evidence/cycle-3.patch` (10,417 lines, unchanged since `8fb44bc`)
- **Claim challenged**: The cycle-4 entry says IR-011 was "not taken (optional per the review)".
- **Observed evidence**: The file is byte-identical to the baseline's. `cycle-4.patch` stages no copy of itself, so the cause is fixed for new cycles.
- **Expected evidence/behavior**: As in v1/IR-011: TEST-TDD-008 fingerprints "the cycle's staged diff that those reviews judged".
- **Impact**: About 7,000 lines of repository bloat in an evidence file. The
  `diff_sha256` still matches, and the code it carries is correct.
- **Required remediation**: None for the gate. The coder may regenerate
  `cycle-3.patch` without the self-embedded file, but only if the cycle's
  `diff_sha256` and the reviews' verdicts are re-established with it.
  Otherwise, leave it and accept the warning.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) Clear filters leaves uncommitted drafts | RESOLVED | `filters-pane.tsx:69, 134, 252` remount the rows. `filters-pane.test.tsx:258, 277` fail on `8fb44bc` (`red-cycle-4.log`) and pass now. `fp2-clear-no-bump` and `fp2-reset-key-ignored` are killed. Probe P2 confirms under `v7_startTransition`. |
| v1/IR-002 (HIGH) No Enter commit on the threshold value | RESOLVED | `threshold-sentence.tsx:186-190`. Tests: `threshold-sentence.test.tsx:147, 167, 179` and `filters-pane.test.tsx:167`. `ts2-enter-ignored` and `ts2-every-key-commits` are killed. Probe P3 confirms. |
| v1/IR-003 (HIGH) Five threshold-sentence survivors | RESOLVED | `ts-effect-ignores-raw`, `ts-effect-ignores-measure`, `ts-swatch-one-colour`, `ts-swatch-no-colour` and `ts-error-not-destructive` are now `killed` (`carried`). Tests: `threshold-sentence.test.tsx:34-35, 254, 476, 493, 512`. |
| v1/IR-004 (HIGH) Five filters-pane survivors | RESOLVED | `fp-api-error-ignores-code`, `fp-escape-keeps-draft`, `fp-symbol-effect-no-draft-resync` and `fp-symbol-effect-keeps-error` are `killed` (`carried`). `fp-lists-all-lifecycles` no longer applies, because its line changed. Its replacement, `fp2-lists-all-lifecycles`, is `killed` by the call-argument assertion at `filters-pane.test.tsx:377`. |
| v1/IR-005 (MEDIUM) Only the first page of universes | RESOLVED | DEC-0235 (recorded, Decision-Id on `77c0801`); `filters-pane.tsx:36-46`; `filters-pane.test.tsx:380`; `fp2-first-page-only`, `fp2-cursor-not-sent` and `fp2-last-page-only` are killed. A test gap in the new code is IR-001 of this report. |
| v1/IR-006 (MEDIUM) `w-14` literal | RESOLVED | The field is `w-8` (`--space-8`, 64 px) at `threshold-sentence.tsx:191`. This is DEC-0236, recorded and PROVISIONAL pending the owner, with the same precedence reasoning as DEC-0230. The deviation from the design's 56 px is recorded in the plan's Rework notes. The test-side residue is IR-002. |
| v1/IR-007 (MEDIUM) Checkbox not sized | RESOLVED | `filters-pane.tsx:262-270`: `h-4 w-4` (`--space-4`, 16 px) inside a label with `min-height: var(--control-min-target)` (24 px), as the checkbox design-spec (lines 34, 60-61) asks. Test `filters-pane.test.tsx:346`. `fp2-checkbox-unsized` and `fp2-label-no-target` are killed. |
| v1/IR-008 (LOW) *Unavailable universe* while loading or failed | RESOLVED | DEC-0237 (PROVISIONAL); `filters-pane.tsx:146-157`; tests `filters-pane.test.tsx:659, 673`. `fp2-null-start-empty`, `fp2-loading-failed-swapped`, `fp2-failed-reads-loading` and `fp2-failed-reads-unavailable` are killed. |
| v1/IR-009 (LOW) One-tick composition claim | RESOLVED | `use-research-query.ts:25-28` doc comment; the plan's *Rework notes*, first bullet |
| v1/IR-010 (LOW) Validator wording ignores the factor | RESOLVED | `threshold-sentence.tsx:24-40` takes `factor`; test `threshold-sentence.test.tsx:304`; `ts2-validate-ignores-factor` is killed |
| v1/IR-011 (LOW) `cycle-3.patch` self-embed | STILL OPEN | Unchanged. Carried as IR-003 (LOW, non-blocking). `cycle-4.patch` does not repeat it. |

## Scope and Plan Deviations

- **Justified deviations.** Each is recorded in the plan's *Rework notes* and,
  where a decision was needed, in a decision record with a `Decision-Id`
  trailer on `77c0801`.
  - *Look in* follows `next_cursor` (DEC-0235). "Fetched once on mount" is read
    as one load.
  - The threshold field is `w-8`, not the planned `w-14` (DEC-0236, PROVISIONAL).
  - The loading and failed scope labels (DEC-0237, PROVISIONAL).
  - Clear filters remounts the threshold rows. T010 planned a re-sync, which
    cannot reset a row whose `value` was already `undefined`.
  - Enter commits the threshold value (DEC-0157, which T010's wording had
    narrowed).
  - `validateThresholdValue` takes the factor (v1/IR-010).
- **Decisions pending the owner.** DEC-0235 to DEC-0237 are `status: open`,
  `owner_reviewed: false`. DEC-0236 and DEC-0237 are PROVISIONAL. This review
  neither confirms nor contests them, and their existence does not affect the
  gate.
- **Bookkeeping.** T001 to T014 are all checked. Only T006 is partly evidenced
  (IR-001). Nothing is implemented but left unchecked.
- **Out-of-scope changes.** None. Every changed file traces to a task or to the
  v1 review. No delivered file other than `copy.ts` and `copy.test.ts` changed.
- **Not raised.**
  - The paging loop checks the cancel flag only once all pages have loaded, so
    a pane unmounted mid-load still fetches its remaining pages, writing no
    state. The coder's cycle-4 code review records this as a LOW follow-up. No
    artifact specifies aborting in-flight reads. T011's cancel flag exists to
    stop state writes after unmount, and it does.
  - Enter followed by a blur inside one pending `startTransition` could push a
    duplicate history entry for an identical query. The hook's equality check
    compares against the render's search. This is speculative: no probe
    reproduced it. *Find a stock* has used the same Enter-then-blur pattern
    since the baseline.
  - The `(i)` failed-list test asserts the options and the value but not the
    accessible name. The name and the option share one variable
    (`unlistedScopeLabel`, `filters-pane.tsx:148-157`), so no realistic mutant
    separates them.
  - SA-FUNC-003 is not raised against the React components, for the reason v1
    gave.
- **Evidence method.** Two scratch `git clone --shared` copies were used, one
  for the cycle-4 replay at `8fb44bc` and one for the probes at `77c0801`, both
  outside the component repository. They held the reviewer probes and the
  test-line deletion behind IR-002. The reviewer wrote no test or code into the
  reviewed repository.

## Follow-Up

- **Next agent**: Coding Agent (story-coding rework)
- **Required action**: Resolve IR-001 with a failing-first test. Here the RED is
  the surviving mutant, as in v1, and no production change is expected. Record
  the cycle in the tdd-evidence file, with a mutation run that includes
  `manual:review-v2:fp2-later-page-failure-swallowed`. Then rerun this review.
  It will use this report and
  `CAP-002-E4-S5-implementation-review-v2-mutation.json` as its baseline.
  IR-002 is cheap to fix in the same cycle. IR-003 is optional.
- **Warnings accepted downstream**: N/A
