---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S5-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E4-S5"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-10-30T02:37:22Z"
reviewed_head: "8f23b52ef3590afffdb2d56c91044fe15f408313"
review_base: "7688c924c554920816b60fd6af60fc81f1164174"
reviewed_state_revision: "sha256:d078ff2ac1b17b1e695bebc4b2d1e8171c51883681a1baf83eff5acc1e9d7d37"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-10-30T02:37:22Z
  source_artifacts:
    - id: CAP-002-E4-S5
      version: "1 (sha256:802d8702842d0485687f1df970dc28b9a2a19b66c9acc29e4aba07bf1eccbdde)"
    - id: CAP-002-E4-S5-tasks
      version: "1 (updated 2026-10-29, last_reworked_review v2)"
    - id: CAP-002-E4-S5-tdd-evidence
      version: "cycle-1 to cycle-5"
    - id: CAP-002-E4-S5-implementation-review
      version: "2 (baseline, reviewed_head 77c0801)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
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

# Implementation Review: CAP-002-E4-S5 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 6/6 satisfied |
| Planned tasks | 14/14 verified |
| Required validation | 8/8 passed |

This is the third review. Its baseline is v2 (CHANGES-REQUIRED, `reviewed_head`
`77c0801`) and `CAP-002-E4-S5-implementation-review-v2-mutation.json`.

Since the baseline the branch has two commits:

- `cbc09c9` merges `origin/main` (`7688c92`), which brings CAP-002-E4-S3,
  CAP-002-E2-S5 and CAP-002-E2-S9. The merge touches no line of this story:
  the story's diff of each `web/src` file against the new base is byte-identical
  to its diff against the old base `7b4b5f5`.
- `8f23b52` is the rework. It changes tests and evidence only. No production
  file of this story changed since `77c0801`.

The three v2 findings, checked against the repository:

- **v2/IR-001 (HIGH) is resolved.** `filters-pane.test.tsx:716` fails the
  second universes page after the first resolves with a cursor. It pins the
  alert, both requests, the absence of a partial *Look in* and the URL scope's
  failed-list label and accessible name. The v2 survivor
  `manual:review-v2:fp2-later-page-failure-swallowed` is now killed, and so are
  four new reviewer mutants of the same behaviour. This test kills each of the five, and is the only test that kills four of them.
- **v2/IR-002 (LOW) is resolved.** The negative `w-14` assertion is gone.
  `git grep w-14 -- web/src` finds nothing, and the rebuilt CSS has no `.w-14`
  rule.
- **v2/IR-003 (LOW) is still open**, as v2 allowed. It is carried as IR-001 of
  this report and does not block.

Every required validation command passes when rerun independently:

- the four focused suites (422 tests);
- the full web suite (995 tests in 50 files);
- lint, format and `tsc --noEmit`;
- the build, and T013's built-CSS token check;
- the TDD-evidence lint (0 errors).

**Mutation run.** 110 mutants ran: 102 killed, 8 survived, none stillborn.
All 8 survivors are the equivalent mutants v2 already dispositioned. None
blocks.

The verdict is PASS-WITH-WARNINGS: no CRITICAL, HIGH or MEDIUM finding, and
one carried LOW finding about evidence-file bloat.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · **total 1**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S5`, six commits ahead of `origin/main`: `8fb44bc` (story-coding), `a6a01e1` (review v1), `77c0801` (rework 1), `a00e2fe` (review v2), `cbc09c9` (merge of `origin/main`), `8f23b52` (rework 2) |
| HEAD | `8f23b52ef3590afffdb2d56c91044fe15f408313` ("fix(research): CAP-002-E4-S5 story-coding rework 2"; no `Decision-Id` trailer, and the cycle-5 entry says no new decision was needed) |
| Review base | `origin/main` (`7688c92`), resolved by `pipeline-state.py review-base --base-ref origin/main` to `7688c924c554920816b60fd6af60fc81f1164174`, an ancestor of HEAD (the merge parent of `cbc09c9`) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files. Validation wrote only to the ignored `src/factorflow/api/static/` and `node_modules/`. |
| Changed files reviewed | 43 against the base (29,672 insertions, 17 deletions). 12 of them changed in this story's diff since the baseline. Two more, `copy.ts` and `copy.test.ts`, changed since the baseline only through lines the merge brought from CAP-002-E4-S3, which are now in the base. |
| Baseline | v2, `reviewed_head` `77c0801a27f32aebd31891db71a329a478f23e1e`, with `CAP-002-E4-S5-implementation-review-v2-mutation.json` |

### Changed Files

In this table, `docs/.../` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/use-research-query.ts` | added (unchanged since baseline) | T008; DEC-0156 |
| `web/src/screens/research/use-research-query.test.tsx` | added (unchanged since baseline) | T007 |
| `web/src/screens/research/threshold-sentence.tsx` | added (unchanged since baseline) | T010; DAC-E4-S5-1, DAC-E4-S5-4 |
| `web/src/screens/research/threshold-sentence.test.tsx` | added (−1 since baseline: the negative `w-14` assertion) | T001, T002, T005; v2/IR-002 |
| `web/src/screens/research/filters-pane.tsx` | added (unchanged since baseline) | T011; AC-16, DAC-E4-3, DAC-E4-S5-2, DAC-E4-S5-3 |
| `web/src/screens/research/filters-pane.test.tsx` | added (+24 since baseline: the later-page failure test) | T003, T004, T006; v2/IR-001 |
| `web/src/screens/research/copy.ts` | modified (story diff unchanged since baseline) | T009 (Open Gap 4); DEC-0157, DEC-0158, DEC-0237 |
| `web/src/screens/research/copy.test.ts` | modified (story diff unchanged since baseline) | T009 anchor lines |
| `docs/.../stories/CAP-002-E4-S5-tdd-evidence.yaml` | added (+57 since baseline: cycle-5) | T014 |
| `docs/.../stories/CAP-002-E4-S5-evidence/cycle-5.patch`, `red-cycle-5.log`, `green-cycle-5.log`, `full-suite-cycle-5.log`, `mutants-cycle-5.json`, `mutation-cycle-5-results.json` | added (6, since baseline) | T014, cycle 5 |
| `docs/.../stories/CAP-002-E4-S5-evidence/` cycle 1 to 4 files (22) | added (unchanged since baseline) | T014, cycles 1 to 4 |
| `docs/.../stories/CAP-002-E4-S5-implementation-review-v1.md`, `-v1-mutation.json` | added by `a6a01e1` | Adversarial review v1 output (not coder work) |
| `docs/.../stories/CAP-002-E4-S5-implementation-review-v2.md`, `-v2-mutation.json` | added by `a00e2fe` | Adversarial review v2 output (not coder work) |
| `docs/.../stories/CAP-002-E4-S5-tasks.md` | modified (+8/−1 since baseline) | `last_reworked_review` → v2, and a *Rework notes (implementation review v2)* section |
| `docs/.../stories/CAP-002-E4-S5.md` | modified (unchanged since baseline) | `status: planning` → `in-review` only |

No file under `web/src/app/` changed. No delivered file other than `copy.ts`
and `copy.test.ts` changed (T012).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `filters-pane.tsx:59-293` `FiltersPane`. *Look in* lists every page of active universes (`:36-46` `listActiveUniverses`, `:80-99`). Three `ThresholdSentence` rows (`:250-257`). The `showLookIn=false` mode (`:81`, `:138`, `:162`). | `filters-pane.test.tsx:104` TC-COMP-135 (a)-(e), with two factors at once in (c); `:380` the two-page *Look in*; `:716` a later page's failure; `:436` the universe-detail mode | v2's gap is closed: DEC-0235's whole-list failure is now pinned. |
| DAC-E4-3 | SATISFIED | `use-research-query.ts:35-56`: the URL is the only state and writes are pushes. Re-sync from the URL at `threshold-sentence.tsx:91-98` and `filters-pane.tsx:101-105`. | `use-research-query.test.tsx:76`; `threshold-sentence.test.tsx:475, 492, 511` (single-part re-sync); `filters-pane.test.tsx:589, 608, 625` (back navigation) | The `match_count` heading belongs to the results host (CAP-002-E4-S9). |
| DAC-E4-S5-1 | SATISFIED | `threshold-sentence.tsx:24-40` `validateThresholdValue(factor, measure, raw)` delegates validity to `decodeResearchQuery`; `:100-120` `commit`; `:186-190` Enter runs the same commit as blur | `threshold-sentence.test.tsx:39-197` TC-COMP-134 (a)-(e), with the `--destructive` colour asserted in `expectFieldError` (`:34-35`); `:286` codec-agreement table | — |
| DAC-E4-S5-2 | SATISFIED | Every change is one `setQuery` (`filters-pane.tsx:110, 118, 128, 135, 217, 273`); equal writes navigate nowhere (`use-research-query.ts:42-44`) | `filters-pane.test.tsx:104`, `:167` (Enter commits once and the following blur nothing), `:182`, `:199` | Through DEC-0156's probe host |
| DAC-E4-S5-3 | SATISFIED | `filters-pane.tsx:131-141` `clearFilters`. It bumps `thresholdReset` (`:69`, `:134`), and the rows are keyed by it (`:252`), so every row remounts at its defaults. It keeps `sort`, keeps `scope` when `showLookIn` is false, and moves focus to *Find a stock*. | `filters-pane.test.tsx:213, 242, 258, 277, 299`; `:578` focus | — |
| DAC-E4-S5-4 | SATISFIED | `threshold-sentence.tsx:135-136, 148-192`: names from `copy.ts`; the value row verbatim; growth and momentum read *Value threshold for {factor}* (DEC-0157) | `threshold-sentence.test.tsx:199-264` TC-COMP-137, including each row's swatch token (`:253`); `filters-pane.test.tsx:309` | — |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `threshold-sentence.test.tsx:39-197` | (a)-(d), plus three Enter cases (e) at `:147, :167, :179` (DEC-0157), and the `--destructive` colour on every error (`:34-35`). Unchanged since the baseline. |
| T002 | complete | VERIFIED | `threshold-sentence.test.tsx:199-264` | Pins `w-8` instead of the plan's `w-14` (DEC-0236, PROVISIONAL; plan Rework notes v1). The negative `w-14` assertion is removed (v2/IR-002). The positive `w-8` assertion (`:236`) kills `ts2-field-width`. |
| T003 | complete | VERIFIED | `filters-pane.test.tsx:104-210` | Unchanged since the baseline |
| T004 | complete | VERIFIED | `filters-pane.test.tsx:213-306` | Unchanged since the baseline |
| T005 | complete | VERIFIED | `threshold-sentence.test.tsx:266-549` | Unchanged since the baseline apart from the one-line shift |
| T006 | complete | VERIFIED | `filters-pane.test.tsx:308-766` | v2's gap is closed by `:716`, which fails the second page after the first resolves with `nextCursor: "c1"`. It asserts: <ul><li>the list's failure sentence;</li><li>both calls, the second carrying the cursor;</li><li>*Look in* offers only *All followed stocks* and the failed-list label, so the page-1 universes are absent;</li><li>the URL scope keeps `u1` with the accessible name *Look in: Could not load your universes* (DEC-0235, DEC-0237).</li></ul> |
| T007 | complete | VERIFIED | `use-research-query.test.tsx:49-161` | Unchanged since the baseline; every hook mutant is killed |
| T008 | complete | VERIFIED | `use-research-query.ts:1-56` | Unchanged since the baseline |
| T009 | complete | VERIFIED | `copy.ts:248-271` `FILTERS.valueThresholdFor`, `unavailableUniverse`, `loadingUniverses`; `:274-287` `thresholdFieldError`; `copy.test.ts:56-59, 446-447, 457-464` | Additive. Each entry has a doc comment naming its source and an anchor line. The story's diff of both files is byte-identical before and after the merge. The merged CAP-002-E4-S3 `CELL` entries are in the base, outside this story's change set. `FACTOR_LABELS` (S2) is imported, not duplicated (Open Gap 4). |
| T010 | complete | VERIFIED | `threshold-sentence.tsx:1-206` | Unchanged since the baseline |
| T011 | complete | VERIFIED | `filters-pane.tsx:1-293` | Unchanged since the baseline. Its paged load fails as a whole when a later page fails (DEC-0235), and a test now pins this. |
| T012 | complete | VERIFIED | `npm run test`: 50 files, 995 tests pass; `git diff --name-status 7688c92 HEAD` | Nothing under `web/src/app/`; `render.test.tsx` passes. The suite grew from 890 tests only through the merged CAP-002-E4-S3 and CAP-002-E2-S9 suites. |
| T013 | complete | VERIFIED | format, lint, `tsc`, test and build all exit 0. The built `index-CdhCF5F1.css` defines `--factor-value`, `--factor-growth` and `--factor-momentum` (light and dark), and maps `w-8`, `w-4` and `h-4` to `var(--space-8)` and `var(--space-4)`. | No `w-14` rule remains in the built CSS (v2/IR-002) |
| T014 | complete | VERIFIED | `CAP-002-E4-S5-tdd-evidence.yaml` cycle-5; `check-tdd-evidence.py --require-logs`: 0 errors | `diff_sha256` `8d1ea4af…` equals the `shasum -a 256` of `cycle-5.patch`. Its two test hunks carry blob ids `0c6e003..bf6daa5` and `efc453e..2e50e6d`, the same as `8f23b52`. The `red_log`, `logs` and mutation-results hashes match their files. `cycle-5.patch` does not embed itself. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `threshold-sentence.test.tsx:39` describe block / TC-COMP-134 | ADEQUATE | Covers: <ul><li>a field error on blur and on Enter, with the exact wording, `aria-invalid`, `aria-describedby`, the `--destructive` colour and zero commits;</li><li>valid edges commit once;</li><li>Enter commits once, and a later blur adds nothing;</li><li>blank after a committed value commits `null`.</li></ul> | none |
| `filters-pane.test.tsx:103` describe block / TC-COMP-135 | ADEQUATE | One probe request per change with exact `toListParams` objects; none while typing; Enter through the pane commits once | none |
| `filters-pane.test.tsx:212` describe block / TC-COMP-136 | ADEQUATE | Defaults plus sort; the unowned key kept; committed and uncommitted threshold drafts and their error reset; select-only changes reset; the *Find a stock* draft reset; absent for sort alone | none |
| `threshold-sentence.test.tsx:199` describe block / TC-COMP-137 | ADEQUATE | Names on all three rows, option order, placeholder, one `<p>`, a hidden swatch carrying its own `--factor-*` token, the `w-8` width token | none. v2/IR-002 is resolved. |
| `threshold-sentence.test.tsx:266` describe block / T005 (additional) | ADEQUATE | Codec agreement; factor-specific validator wording; text input in decimal mode; select commits; error on blur only; error clearing; single-part re-sync; never disabled | none |
| `filters-pane.test.tsx:308` describe block / T006 (additional) | ADEQUATE | Structure, checkbox sizing tokens, every *Look in* page, a later page's failure, scope removal, universe-detail mode, Clear visibility, Enter, Esc, focus, back over a search, the loading, failed and unavailable labels, coded and uncoded list failures | none. The new `:716` kills `manual:review-v2:fp2-later-page-failure-swallowed` and the four `review-v3` paging mutants. It is the only killer of four of them; `fp3-later-page-drops-lifecycle` is also killed by `:380`. |
| `use-research-query.test.tsx:49` describe block / T007 (additional) | ADEQUATE | Decode, unknown keys kept, push, back, equal write, clear keeps sort, one-tick pushes, memoised identity | none |
| `copy.test.ts` anchor lines / T009 | ADEQUATE | The story's strings are in the anchor table, the templated renders and the forbidden-vocabulary scan | none |

**The new test.** `filters-pane.test.tsx:716` is deterministic:

- the two pages are `mockResolvedValueOnce` and `mockRejectedValueOnce` over the
  `beforeEach` default, and the rejection stops the loop before any third call;
- the assertions run after `findByRole("alert")`, which appears only after both
  calls have settled;
- the call-list assertion uses `toEqual`, so the first call's
  `cursor: undefined` matches `{ lifecycle: "active" }`.

It also asserts the accessible name of a failed-list scope. v2 noted that the
older (i) failed-list test leaves this name out.

Isolation and determinism are otherwise unchanged from v2:

- every suite resets its mocks in `beforeEach`;
- every suite renders inside `MemoryRouter`;
- the pending-list test uses a never-settling promise, not timers;
- no test touches the network.

**Mutation run.** `scripts/mutation-run.py` built the mutant set in three steps:

1. `generate` over `7688c92..HEAD`: the same 25 catalogue mutants as v2
   (`negate-boolean` 16, `drop-field-copy` 5, `off-by-one` 4). No production
   line moved.
2. 4 manual mutants for the behaviour the rework pins. Every one is on a
   production line unchanged since `77c0801`, so each is `late`:
   - `manual:review-v3:fp3-progressive-partial-on-failure`: the effect shows
     pages as they arrive and keeps them when a later page fails;
   - `manual:review-v3:fp3-later-page-failure-empties-list`: a later page's
     failure returns an empty list with no error;
   - `manual:review-v3:fp3-later-page-failure-error-not-shown`: a later page's
     failure never settles;
   - `manual:review-v3:fp3-later-page-drops-lifecycle`: pages after the first
     omit `lifecycle`.
3. `scope --since 77c0801 --previous` the v2 results. This added v2's mutants
   that still apply. None of v2's mutants stopped applying.

The run: 110 mutants, 103 `carried` and 7 `late`, none `delta`. 102 were
killed, 8 survived and none was stillborn. The baseline passed on all four
workers, with the tree patch empty (`e3b0c442…`).

Results: `CAP-002-E4-S5-implementation-review-v3-mutation.json` (sha256
`5fe6bb92fe0c77aa7626163d6e496909ed5f1ded95bbab8bb1be0d2e2a2fcf79`).

| Survivor | Scope | Disposition | Reason (artifact that fixes or leaves it open) |
|----------|-------|-------------|-----------------------------------------------|
| `filters-pane.tsx:82:negate-boolean:1` (v1 id) and `filters-pane.tsx:97:negate-boolean:1` (same line): cleanup `cancelled = false` | carried / late | equivalent | v1 and v2's disposition holds. DEC-0156 fixes `showLookIn` per host, so the effect runs once per mount. Its cleanup runs only on unmount, and React 18.3 drops the state update that follows it. No artifact specifies an observable effect of the flag beyond that. |
| `threshold-sentence.tsx:87:negate-boolean:1`, `:2` (v1 ids) and `threshold-sentence.tsx:93:negate-boolean:1`, `:2` (same line) | carried / late | equivalent | v1 and v2's disposition holds. `ThresholdSentenceProps.value?: Sentence` (`:63`) has three required fields, so either all three are defined or none is. |
| `filters-pane.tsx:69:off-by-one:1` (`useState(1)` for the reset generation) | carried | equivalent | v2's disposition holds. The generation is read only as a suffix of each row's `key` (`:252`). T011 and v1/IR-001 fix only the outcome, that every row returns to its defaults. The starting value is never rendered, compared or written. |
| `filters-pane.tsx:134:off-by-one:1` (`generation + 2`) | carried | equivalent | Same reason: any change of the key remounts the rows. The non-equivalent neighbours `fp2-clear-no-bump` and `fp2-reset-key-ignored` are killed. |

The v2 non-equivalent survivor `manual:review-v2:fp2-later-page-failure-swallowed`
(`carried`) is killed by `filters-pane.test.tsx:716`. Its log shows exactly 1
failed test.

## Independent Validation

All commands ran inside the sandbox, with no sandbox refusal. Unless stated,
they ran from the component root `repos/factorflow-v2/FactorFlow-v2`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | Context last run 21h ago; every row PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5.md --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | PASS | `7688c924c554920816b60fd6af60fc81f1164174`, an ancestor of HEAD; the baseline `77c0801` is also an ancestor |
| `npx vitest run src/screens/research/use-research-query.test.tsx src/screens/research/threshold-sentence.test.tsx src/screens/research/filters-pane.test.tsx src/screens/research/copy.test.ts` | component | 0 | PASS | 4 files, 422 tests |
| `npm run test` | component | 0 | PASS | 50 files, 995 tests |
| `npm run lint` | component | 0 | PASS | `biome lint .`: 116 files, no diagnostics |
| `npm run format` | component | 0 | PASS | `biome format .`, check only: 116 files, nothing to fix |
| `npx tsc --noEmit` | component | 0 | PASS | no output |
| `npm run build` | component | 0 | PASS | `vite build`, 63 modules; writes the ignored `src/factorflow/api/static/` (`index-CdhCF5F1.css`, `index-taIpfgxE.js`) |
| `grep -o -E -- "--factor-(value\|growth\|momentum):[^;}]*" src/factorflow/api/static/assets/index-CdhCF5F1.css` | component | 0 | PASS | Each token is defined twice, light and dark, so T013's gate holds. A second grep finds `.w-8{width:var(--space-8)}` and `.w-4`/`.h-4{…var(--space-4)}`, and no `w-14` (count 0). `git grep w-14 -- web/src` finds nothing. |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7688c924c554920816b60fd6af60fc81f1164174 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `shasum -a 256` of the cycle-5 `cycle-5.patch`, `red-cycle-5.log`, `green-cycle-5.log`, `full-suite-cycle-5.log` and `mutation-cycle-5-results.json`; `git ls-tree` of the two test files at `cbc09c9` and HEAD | component | 0 | PASS | Every hash equals the evidence entry. The patch's blob ids equal the committed ones. `red-cycle-5.log` shows `1 failed \| 421 passed`; the failure is the new `(j)` later-page test. |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7688c924c554920816b60fd6af60fc81f1164174..HEAD --cycle review --out <scratchpad>/v3/v3-generated.json`, plus 4 manual mutants | harness root | 0 | PASS | 25 generated |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratchpad>/v3/v3-with-manual.json --since 77c0801a27f32aebd31891db71a329a478f23e1e --previous docs/.../CAP-002-E4-S5-implementation-review-v2-mutation.json --out <scratchpad>/v3/v3-mutants.json` | harness root | 0 | PASS | 110 mutants: `carried` 103, `late` 7; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratchpad>/v3/v3-mutants.json --jobs 4 --timeout 600 --command 'test -e node_modules \|\| ln -s <component>/node_modules node_modules; ./node_modules/.bin/vitest run src/screens/research/use-research-query.test.tsx src/screens/research/threshold-sentence.test.tsx src/screens/research/filters-pane.test.tsx src/screens/research/copy.test.ts' --out <scratchpad>/v3/v3-mutation-results.json --logs <scratchpad>/v3/v3-mutation-logs` | harness root | 3 | PASS (test-quality gate) | 102 killed, 8 survived, all equivalent (see above). Exit 3 means survivors, not an environment fault. |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the task plan's Validation Plan and T013: no screen mounts the pane yet |
| `npm ci` | — | N/A | NOT RUN | `package.json` and `package-lock.json` are unchanged; it would rewrite `node_modules` (constraint 10) |
| `uv sync`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | — | N/A | NOT RUN | No Python file is in this story's change set (the merged CAP-002-E2 Python changes are in the base), and the task plan scopes validation to the web commands |

The Gate Summary counts the same eight required commands as v1 and v2:

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

- **Before.** `usr/alvaro-de-jodra/CAP-002-E4-S5` at `8f23b52`.
  `git status --porcelain --untracked-files=all` was empty. The code fingerprint
  was `sha256:d078ff2ac1b17b1e695bebc4b2d1e8171c51883681a1baf83eff5acc1e9d7d37`.
- **After.** The same HEAD, the same empty status and the same fingerprint,
  rechecked after the build and the mutation run. Ignored paths changed:
  - the build added `assets/index-CdhCF5F1.css` and `index-taIpfgxE.js` under
    the ignored `src/factorflow/api/static/` (and `build-output.test.tsx`, in
    the full suite, builds into the same ignored directory);
  - vitest updated the ignored `node_modules/.vite/` cache.
- **Unexpected tracked-file changes:** none.
- **Files this review wrote:** this report and
  `CAP-002-E4-S5-implementation-review-v3-mutation.json`. Both sit under
  `docs/`, which the code fingerprint excludes.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | LOW | carried | `cycle-3.patch` still embeds an earlier copy of itself (v1/IR-011, v2/IR-003) |

### IR-001 — `cycle-3.patch` still embeds an earlier copy of itself (v1/IR-011, v2/IR-003)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T014
- **Files**: `docs/.../CAP-002-E4-S5-evidence/cycle-3.patch` (10,417 lines, unchanged since `8fb44bc`)
- **Claim challenged**: The plan's v2 Rework notes say IR-003 is "Not taken, as
  the review allows", because regenerating the patch would re-open that cycle's
  reviews.
- **Observed evidence**:
  - The file is byte-identical to the baseline's and still names itself four
    times.
  - `cycle-4.patch` and `cycle-5.patch` stage no copy of themselves
    (`grep -c cycle-5.patch cycle-5.patch` is 0). The cause is fixed for new
    cycles.
- **Expected evidence/behavior**: As in v1/IR-011: TEST-TDD-008 fingerprints "the cycle's staged diff that those reviews judged".
- **Impact**: About 7,000 lines of repository bloat in an evidence file. The
  `diff_sha256` still matches, and the code it carries is correct.
- **Required remediation**: None for the gate. The warning is accepted
  downstream. The coder may regenerate `cycle-3.patch` without the
  self-embedded file only if the cycle's `diff_sha256` and its reviews'
  verdicts are re-established with it.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 (HIGH) No test fails a page after the first | RESOLVED | `filters-pane.test.tsx:716-738`. It fails on `cbc09c9` with the v2 mutant applied (`red-cycle-5.log`: `1 failed \| 421 passed`) and passes now. In this review's run, `manual:review-v2:fp2-later-page-failure-swallowed` (`carried`) is killed. So are `fp3-progressive-partial-on-failure`, `fp3-later-page-failure-empties-list`, `fp3-later-page-failure-error-not-shown` and `fp3-later-page-drops-lifecycle`, each by this test. The test asserts all three points v2 required: the failure sentence, no page-1 universe in *Look in*, and the failed-list label rather than *Unavailable universe*, including in the accessible name. No production change, as v2 expected. |
| v2/IR-002 (LOW) Negative `w-14` assertion puts a literal in the shipped CSS | RESOLVED | The line is removed (`8f23b52`, `threshold-sentence.test.tsx`, −1). `git grep w-14 -- web/src` is empty, and the rebuilt `index-CdhCF5F1.css` has no `w-14` rule. The positive `w-8` assertion (`:236`) still kills `manual:review-v2:ts2-field-width`. |
| v2/IR-003 (LOW) `cycle-3.patch` self-embed (v1/IR-011) | STILL OPEN | Unchanged and declined in the plan's v2 Rework notes, as v2 allowed. Carried as IR-001 (LOW, non-blocking). |

## Scope and Plan Deviations

- **Justified deviations.** These are unchanged from v2. Each is recorded in the
  plan's *Rework notes* and, where a decision was needed, in a decision record:
  - *Look in* follows `next_cursor` (DEC-0235);
  - the threshold field is `w-8` (DEC-0236, PROVISIONAL);
  - the loading and failed scope labels (DEC-0237, PROVISIONAL);
  - Clear filters remounts the threshold rows;
  - Enter commits the threshold value (DEC-0157);
  - `validateThresholdValue` takes the factor.
- **The merge.** `cbc09c9` merges `origin/main` into the branch, and the plan's
  v2 Rework notes record it. This review checked that the story's diff of every
  `web/src` file against `7688c92` equals its diff against `7b4b5f5`, so the
  merge changed no line of this story. The merged CAP-002-E4-S3 `CELL` entries
  in `copy.ts` are in the base and outside this review's change set.
- **Decisions pending the owner.** DEC-0235 to DEC-0237 are still `status:
  open`, `owner_reviewed: false`. DEC-0236 and DEC-0237 are PROVISIONAL. This
  review neither confirms nor contests them, and their existence does not affect
  the gate. The untracked harness record DEC-0238 belongs to CAP-002-E4-S4, not
  to this story.
- **Bookkeeping.**
  - T001 to T014 are all checked, and all are evidenced.
  - `cycle-5.patch` includes a story hunk `status: in-review` → `in-progress`.
    The commit leaves the story at `in-review`. The same in-progress flip
    appears in `cycle-1.patch` and is absent from its commit, so this is the
    coding run's transient status, not shipped content. The two test hunks the
    cycle-5 reviews judged are the committed ones (equal blob ids).
  - Nothing is implemented but left unchecked.
- **Out-of-scope changes.** None. Every changed file traces to a task or to a
  review. No delivered file other than `copy.ts` and `copy.test.ts` changed.
- **Not raised.** v2's notes stand unchanged, since no production line moved:
  - the paging loop checks the cancel flag only after the last page;
  - the speculative Enter-then-blur duplicate entry under one pending
    transition;
  - SA-FUNC-003 against the React components.
- **Evidence method.** The mutation run used `git clone` workdirs under the
  sandbox `TMPDIR`, created and removed by `mutation-run.py`. Its inputs, results
  and logs sit in the session scratchpad under `v3/`. The reviewer wrote no test
  or code into the reviewed repository.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E4-S5 on
  `usr/alvaro-de-jodra/CAP-002-E4-S5` once this report and its mutation results
  are committed. The owner's confirmation of DEC-0235 to DEC-0237 remains
  outstanding and is tracked by those records, not by this gate.
- **Warnings accepted downstream**: IR-001 (LOW)
