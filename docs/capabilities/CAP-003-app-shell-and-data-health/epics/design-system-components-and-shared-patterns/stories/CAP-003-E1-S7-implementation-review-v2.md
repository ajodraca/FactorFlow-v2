---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S7-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E1-S7"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S7.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-14T18:56:35Z"
reviewed_head: "4554ab51099c71f6b2cfe2d97ee0b3c13aa2a927"
review_base: "6e570b27d3a2593143ac50b1664a89d203db9591"
reviewed_state_revision: "sha256:e066e0aac405ec58e91bfd01fd604d78a3cfcac5f2ea397b16dd680491de98d8"
verdict: PASS
review_subjects:
  - artifact_id: CAP-003-E1-S7
    artifact_version: 1
    content_revision: sha256:292b024fdb2b20a58407f8fa3a7f7fb9007a26af20df84eeaf1d5c13bac2bca1
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-14T18:56:35Z
  source_artifacts:
    - id: CAP-003-E1-S7
      version: "1 (sha256:292b024fdb2b20a58407f8fa3a7f7fb9007a26af20df84eeaf1d5c13bac2bca1)"
    - id: CAP-003-E1-S7-tasks
      version: "1 (draft, updated 2026-11-09, last_reworked_review v1)"
    - id: CAP-003-E1-S7-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-003-E1-S7-implementation-review
      version: "1 (CHANGES-REQUIRED, reviewed_head f99341962788d5d686f3e8dbbf93bd3309350c14)"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-component-design-data-health-ui
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1 (draft)"
    - id: DEC-0210
      version: "owner upheld"
    - id: DEC-0217
      version: "owner upheld"
    - id: DEC-0311
      version: "owner upheld (blind, agreed)"
    - id: DEC-0312
      version: "open, provisional"
    - id: tech-stack
      version: "7"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S7 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 9/9 verified |
| Required validation | 10/10 passed |

This re-review covers `4554ab5` against review base `6e570b2`, the merge base with `origin/main`.
The baseline is v1 (`CHANGES-REQUIRED`, `reviewed_head` `f993419`) and its mutation file.

The rework changed one source file, the test file, and added three lines to it. The production
module `worst-data-tier.ts` is byte-identical to the one v1 found correct
(`git diff --exit-code f993419 4554ab5 -- web/src/components/patterns/worst-data-tier.ts` exits 0).

All three v1 findings are resolved:

- **IR-001 (HIGH).** Two `problemRows` rows now pin DEC-0312: `(1, 0)` and `(5, 0)` with a
  succeeded download give critical *No* (`worst-data-tier.test.ts:34-36`). The v1 survivor
  `reviewer-followed-gt-zero` is now killed, and both rows fail under it. Three more mutants on the
  same input are killed too.
- **IR-002 (MEDIUM).** `4554ab5` carries `Decision-Id: DEC-0311` and `Decision-Id: DEC-0312` in
  its final trailer paragraph, together with `Co-Authored-By`. Git parses both trailers.
- **IR-003 (LOW).** The evidence now records the measured baseline (99 files, 2509 tests) and
  records the one-cycle deviation against T009. The rework is a single cycle, and the
  planted-order check is kept as a log.

The reviewer ran 50 mutants: 45 carried from the baseline and 5 new. 44 are killed and 6 survive,
and all 6 survivors are equivalent. The required validation passed: `npm ci`, a full suite of
100 files (2562 passed, 1 skipped), lint, format, `tsc`, the build, the TDD lint, the
single-declaration grep, the unchanged-files diff, and the planted second order in a scratch clone.
No finding remains.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S7.md` (`status: in-review`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S7-tasks.md` (`last_reworked_review: CAP-003-E1-S7-implementation-review-v1.md`) |
| Component | `FactorFlow-v2` (web interface under `web/src/`; design module `ui-components`), reviewed in the dedicated clone `repos/factorflow-v2/FactorFlow-v2-e1s7-review` |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S7-run-20261108T150357Z` |
| HEAD | `4554ab51099c71f6b2cfe2d97ee0b3c13aa2a927` |
| Review base | `origin/main` passed as `--base-ref`. `pipeline-state.py review-base` resolves it to `6e570b27d3a2593143ac50b1664a89d203db9591`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) and the same base v1 used |
| Working tree | Clean before and after validation (`git status --porcelain --untracked-files=all` prints nothing). The only additions are this report and its mutation file under `docs/`, which the code fingerprint excludes |
| Changed files reviewed | 53 against the review base (51 added, 2 modified) in three commits: `f993419` (story coding), `fcdc56e` (review v1) and `4554ab5` (rework). 16 changed since the baseline's `reviewed_head` (13 added, 3 modified) |
| Baseline | v1, `reviewed_head` `f99341962788d5d686f3e8dbbf93bd3309350c14`, with `CAP-003-E1-S7-implementation-review-v1-mutation.json` |

The task directs the review to the dedicated clone. The TDD evidence cites its logs and patches
under the canonical path `repos/factorflow-v2/FactorFlow-v2/...`, and in this run that path holds a
different clone owned by a live supervised run. Run from the harness root, two tools resolve paths
into that clone:

- `check-tdd-evidence.py` reports 6 `TDD-LINT-LOG`/`TDD-LINT-DIFF` errors, "not present".
- `pipeline-state.py check` resolves the component repository as the story's `component` sibling.
  It reports `BLOCKED — story coding has not reached in-review`.

Both results reflect where this clone sits, not the evidence itself. Both tools only read and stat
files, and nothing was written to the live clone. The reviewer reran both in a scratch mirror of
the harness, where `repos/factorflow-v2/FactorFlow-v2` is a symlink to the review clone. There the
TDD lint reports 0 errors and 0 warnings. The state check reports `READY — review changes were
reworked; a new review version is required`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/worst-data-tier.ts` | added (82 lines; unchanged since v1) | AC-8, AC-11, AC-21, DAC-E1-3, DAC-E1-4, DAC-E1-5, DAC-E1-S7-2; T006; DEC-0311, DEC-0312 |
| `web/src/components/patterns/worst-data-tier.test.ts` | added (298 lines; +3 since v1, `:34-36`) | TC-COMP-026, TC-COMP-001, TC-COMP-027; DAC-E1-S7-1; T002-T005; v1 IR-001 |
| `.../stories/CAP-003-E1-S7.md` | modified (`status: planning` to `in-review`; unchanged since v1) | story-coding lifecycle |
| `.../stories/CAP-003-E1-S7-tasks.md` | modified (T001-T009 ticked in `f993419`; `updated` and `last_reworked_review` in `4554ab5`, nothing else) | bookkeeping |
| `.../stories/CAP-003-E1-S7-tdd-evidence.yaml` | added (cycle-1; cycle-2 and one header line in `4554ab5`) | T009; v1 IR-001, IR-003 |
| `.../CAP-003-E1-S7-evidence/cycle-1.patch`, `red-cycle-1-verdict-and-order.log`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`, `mutation-cycle-1-results-logs/*.log` (35 files) | added in `f993419` | T009 (cycle-1) |
| `.../CAP-003-E1-S7-evidence/cycle-2.patch`, `red-cycle-2-followed-zero.log`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json`, `mutation-cycle-2-results-logs/*.log` (6 files) | added in `4554ab5` | T009 (cycle-2); v1 IR-001 |
| `.../CAP-003-E1-S7-evidence/planted-order-check.log` | added in `4554ab5` | T008; v1 IR-003 |
| `.../stories/CAP-003-E1-S7-implementation-review-v1.md`, `-v1-mutation.json` | added in `fcdc56e` | adversarial review v1 (reviewer-authored) |

No other source file changed. `git diff --stat 6e570b2..HEAD -- . ':!docs'` lists exactly the two
planned files. `git diff --exit-code 6e570b2 HEAD -- web/src/components/patterns/tiers.ts
web/src/api/types.ts web/src/app web/src/screens package.json package-lock.json` exits 0 (T007).

`cycle-2.patch` hashes to `d49c6eca…`, matching `diff_sha256`. Its `web/` portion, from line 420,
is byte-identical to `git diff fcdc56e 4554ab5 -- web/`, so the reviewed test change is the
committed one. `red_log_sha256` (`dcbe772b…`) and `results_sha256` (`5e8ba0f5…`) match their files.
The results file's `mutants_sha256` (`77622a00…`) matches `mutants-cycle-2.json`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `worst-data-tier.ts:41-69` `worstDataTier` | `worst-data-tier.test.ts:12-84` (TC-COMP-026) | The one function that composes the verdict tier and word. Its only inputs are the problem set and the latest terminal download; the checks' tiers are not an input (DEC-0210 as amended; module comment `:4-11`) |
| AC-8 | SATISFIED | `worst-data-tier.ts:71-82` `dataTileBadge` | `worst-data-tier.test.ts:86-181` (TC-COMP-001) | The worse of the verdict tier and `tierOf(scores)`. The label is `labelOf(scores)` when the scores win and the answer word otherwise |
| AC-21 | SATISFIED | `:47-49`, `:75-77` | `:13-24` (null for `(0,10)`, `(3,10)`, `(10,10)`); `:172-180` (null verdict for a null and every score state) | No verdict, and never *Yes*, before a download has ended. `manual:null-guard` and `manual:verdict-null-guard` are killed |
| DAC-E1-3 | SATISFIED | `:47-49` returns `null` on `latestTerminalDownload === null` before any count is read. `:75-77` returns `null` on a `null` verdict before `scores` is read | `:13-24`; `:164-180`, an `it.each` over a `Record<state, true>` of all five score states, plus the `null` row | As v1 |
| DAC-E1-4 | SATISFIED | `:52-68`. The problem tier is `:53`. `failed` gives critical with `"failed"`, and `abandoned` gives serious with `"interrupted"` (`:57-63`). The worse rank wins (`:65`). The word is `WORD[tier]` (`:34-39`, `:68`). The clause comes from the download alone | `:26-83`: every table row; `(10,10)` and `(1,1)` at the `>=` boundary; `(11,10)`; `(0,0)`. DEC-0312's `(1,0)` and `(5,0)` are critical *No* (`:34-36`, new). `failed` and `abandoned` are each tested over three counts, and six states contribute no tier | `abandoned` under a critical problem set keeps `"interrupted"` (`manual:clause-only-if-wins` killed). The DEC-0312 input that v1 found unpinned is now pinned (see v1/IR-001) |
| DAC-E1-5 | SATISFIED | `:78-81`: a strict `<` on `TIER_ORDER`, so a tie goes to the verdict. A `null` score state skips the comparison | `:98-162`: TC steps 1-3; `GOOD` with `not_current`, `building`, `never_classified`, `null` and `current`; `SERIOUS` with `not_current` and `failed`; `CRITICAL` with `failed` | Active ties good, and the tie goes to the verdict. Neutral never wins. `manual:tie-to-scores`, `manual:active-rank` and `manual:label-verdict` are killed |
| DAC-E1-S7-1 | SATISFIED | n/a (a test-file criterion) | `worst-data-tier.test.ts` covers: every DAC-E1-4 row; `affectedCount >= followedCount > 0` at `(10,10)` and `(1,1)`; the `cancelled` and `partial` rows (`:65-83`); a null verdict for `failed` and `not_current`, both named in the `it` titles (`:175-180`) | Every element the criterion lists is present and passes |
| DAC-E1-S7-2 | SATISFIED | `:19-26` `export const TIER_ORDER … = Object.freeze({…})`, the only declaration in `web/src` | `:220-264` (TC-COMP-027 source scan); `:266-298` (semantics) | `grep -rnE "(const\|let\|var) TIER_ORDER\b" web/src --include='*.ts' --include='*.tsx' \| grep -v '\.test\.'` prints one line, `worst-data-tier.ts:19`. In a scratch clone, the planted second order fails the scan. With a planted `needs-you.ts`, the `runIf` test passes when the file imports `TIER_ORDER` and fails when it does not |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tiers.ts` exports `Tier`, `Status`, `tierOf` and `labelOf`, and `api/types.ts` exports `RunState`. All are unchanged since the base. `package.json` and `package-lock.json` are unchanged | The baseline is now recorded in the cycle-2 description: 99 files and 2509 tests. That matches v1's measurement and adds up with this story's 54 tests to the 2563 the reviewer ran |
| T002 | complete | VERIFIED | `worst-data-tier.test.ts:11-84` | Every planned row (a)-(d) is present, plus the two DEC-0312 rows `(1, 0)` and `(5, 0)` (`:34-36`). Those rows go beyond the plan's list, and v1 IR-001 and plan T006 ("this includes `followedCount` 0, DEC-0312") justify them |
| T003 | complete | VERIFIED | `:86-181` | Unchanged since v1. The fixtures are `DataAnswer` literals. TC steps 1-3, the eight sharpened rows and the null-verdict `Record<…["state"], true>` fixture are present |
| T004 | complete | VERIFIED | `:183-264` | Unchanged since v1. The reviewer re-planted `planted-order.ts` (`export const TIER_ORDER = ["critical"]`) in a scratch clone of `4554ab5`. Tests (a) and (b) fail, and the failure names the file |
| T005 | complete | VERIFIED | `:266-298` | Unchanged since v1. The key set, the pairwise chain, active equal to good, the ascending sort and `Object.isFrozen`. The rank mutants on critical, serious, warning, good and active, plus `drop-freeze`, `seal-not-freeze` and `neutral-equals-good`, are killed |
| T006 | complete | VERIFIED | `worst-data-tier.ts:1-82` | Byte-identical to v1, which matched the plan to the token. There is no unit literal and no `#` followed by hex: `grep -nE "[0-9]+(px\|rem\|em\|vh\|vw)\b\|#[0-9a-fA-F]"` exits 1, and `token-literals.test.ts` passes over the file |
| T007 | complete | VERIFIED | `npm run test`: 100 files, 2562 passed, 1 skipped | `tiers.test.ts`, `status-badge.test.tsx`, `token-literals.test.ts` and `render.test.tsx` pass unedited (5 files, 164 passed, 1 skipped). Only the two planned source files changed |
| T008 | complete | VERIFIED | Lint, format, `tsc --noEmit` and the build exit 0 | The planted-order check is now logged (`planted-order-check.log`: 2 failed, naming `planted-order.ts`). The reviewer reproduced it |
| T009 | complete | VERIFIED | `CAP-003-E1-S7-tdd-evidence.yaml`: cycle-1 and cycle-2 are both `APPROVED`, with `drift_detected: false`, `tests_executed: true` and `commit_hash: stage`. Every cited sha256 matches. `check-tdd-evidence.py … --require-logs` reports 0 errors and 0 warnings (run through the mirror; see Review Subject) | Cycle-1 merged the plan's three cycles; v1 accepted that, and it is now recorded against T009 (evidence header line 4). Cycle-2 is the rework, a single test-only cycle. Its RED re-applies v1's survivor to production code, which already behaves correctly; the three mutants each fail the new rows (`red-cycle-2-followed-zero.log`) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `worstDataTier (TC-COMP-026, DAC-E1-3, DAC-E1-4)` / TC-COMP-026 | ADEQUATE | Every DAC-E1-4 row, plus DEC-0312's `followedCount` 0 input, is asserted with `toEqual` on the whole `{ tier, word, downloadClause }` object against hand-written literals. The null cases use `toBeNull()` | None. Every non-equivalent mutant on `:47-68` is killed. That includes v1's `reviewer-followed-gt-zero`, the coder's `followed-zero-to-warning`, and the reviewer's `reviewer2-followed-zero-good`, `reviewer2-followed-zero-null` and `reviewer2-ge-to-eq` |
| `dataTileBadge (TC-COMP-001, DAC-E1-5, DAC-E1-3)` / TC-COMP-001 | ADEQUATE | The whole `{ tier, label, from }` object is asserted against literal `DataAnswer` fixtures. It covers ties at warning, good and critical, strict wins, active and neutral against good, and a null verdict over a null and every score state | None. Every non-equivalent mutant on `:75-81` is killed |
| `TIER_ORDER is the one tier order` / TC-COMP-027 | ADEQUATE | A source scan over every non-test `.ts`/`.tsx` under `web/src`, with comments stripped. The reviewer confirmed it is non-vacuous: a planted second declaration, a planted `needs-you.ts` with and without the import, and a `needs-you.ts` that names `TIER_ORDER` only in a comment | v1 noted that `stripComments` cuts a line at `//` inside a string. That is unchanged, the plan specifies it, and it is not raised |
| `TIER_ORDER semantics (DEC-0217, DEC-0311)` (T005, additional) | ADEQUATE | It tests relations, not numbers: the key set, the pairwise chain, active equal to good, the ascending sort, and that the constant is frozen | `neutral: 5` and `critical: -1` survive and are equivalent (see Mutation results) |
| Determinism and isolation | ADEQUATE | Pure functions, with no time, network or randomness. The source scan reads the working tree, resolved from `import.meta.url` | none |

### Mutation results

The reviewer regenerated the catalogue over `6e570b2..HEAD` (13 mutants) and added 5 hand-written
mutants. `scope --since f993419 --previous <v1 mutation file>` then added the baseline's 32
hand-written mutants and tagged each one: 45 `carried` and 5 `late`, with none dropped. `run
--jobs 4` ran them against `worst-data-tier.test.ts`, `tiers.test.ts`, `token-literals.test.ts`
and `tsc --noEmit`. All four baselines exit 0, with 124 passed and 1 skipped. Result: 44 killed,
6 survived, 0 stillborn, 0 timeouts. The full results are in
`CAP-003-E1-S7-implementation-review-v2-mutation.json` (sha256 `37a2f2a0…`).

| Survivor | Scope | Disposition | Reason |
|----------|-------|-------------|--------|
| `:25:off-by-one:1` (`neutral: 5`) | carried | equivalent | The order and the active/good tie are unchanged. DEC-0311 fixes how the constant is consumed: "lower rank = more severe", "x is worse than y" is `TIER_ORDER[x] < TIER_ORDER[y]`, and `sortAttention` sorts ascending by the difference. Plan T005 tests "against independent literal relations, not the constant's own numbers". Together they leave the magnitudes open. The reviewer agrees with v1 |
| `:manual:reviewer-critical-rank-negative` (`critical: -1`) | carried | equivalent | Same reason as `neutral: 5` |
| `:65:off-by-one:1` and `:manual:download-lt-to-le` (`<=` in the download comparison) | carried | equivalent | The ranks tie only when both tiers are critical. The mutant then replaces critical with critical, and the clause does not depend on which input wins, so the return value is identical |
| `:manual:zero-to-ge` (`affectedCount <= 0`) | carried | equivalent | It differs only for a negative count. Plan Other Notes, *Inputs outside the domain*, leaves negative counts out of the domain |
| `:manual:reviewer2-max-one` (`affectedCount >= Math.max(followedCount, 1)`) | late | equivalent | The line is reached only with `affectedCount !== 0`. For `followedCount` ≥ 1 the expression is unchanged, and for `followedCount` 0 both forms give critical for every count ≥ 1. It differs only for a fractional count between 0 and 1, and plan Other Notes, *Inputs outside the domain*, leaves fractional counts out of the domain |

Killed: all 13 generated mutants except the two above and all 32 of the baseline's hand-written
mutants except the three above. That includes `reviewer-followed-gt-zero`, v1's one non-equivalent
survivor; its log shows `affected 1 of 0` and `affected 5 of 0` failing. Four of this review's five
new mutants are killed: `followed-zero-to-warning` (the coder's cycle-2 mutant),
`reviewer2-followed-zero-good`, `reviewer2-followed-zero-null` and `reviewer2-ge-to-eq`. The
coder's third cycle-2 mutant, `critical-to-gt`, makes the same substitution as the carried
`manual:ge-to-gt`, which is killed.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED. Not counted |
| `python3 scripts/pipeline-state.py review-base --repo-dir <review clone> --base-ref origin/main` | harness root | 0 | N/A | `6e570b27d3a2593143ac50b1664a89d203db9591`. Not counted |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --repo-dir repos/factorflow-v2/FactorFlow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref origin/main` | scratch mirror of the harness | 0 | N/A | `READY — review changes were reworked; a new review version is required`. From the harness root it reports `BLOCKED` (see Review Subject). Not counted |
| `npx vitest run --root web src/components/patterns/worst-data-tier.test.ts` | component root | 0 | N/A | The narrowest story suite, run first: 53 passed, 1 skipped (the `needs-you.ts` check). Not counted; the full suite covers it |
| `npx vitest run --root web <worst-data-tier, tiers, status-badge, token-literals, render tests>` | component root | 0 | N/A | The story file plus T007's four delivered files, unedited: 5 files, 164 passed, 1 skipped. Not counted; the full suite covers it |
| `npm ci --prefix <review clone>` | component root | 0 | PASS | 308 packages added, 309 audited. `package.json` and `package-lock.json` are unchanged. The first, sandboxed attempt failed: `EPERM: operation not permitted, unlink '…/node_modules/iconv-lite/.idea/modules.xml'`. The plain call outside the sandbox completed. Run after the mutation run, because every mutation clone links this `node_modules` |
| `npm run test` | component root | 0 | PASS | 100 files: 2562 passed, 1 skipped. Run before and after `npm ci`, both times at default timeouts |
| `npm run lint` | component root | 0 | PASS | Biome: 223 files, no findings. Run before and after `npm ci` |
| `npm run format` | component root | 0 | PASS | Biome: 223 files, no changes. Run before and after `npm ci` |
| `npx tsc --noEmit` | component root | 0 | PASS | No output. Run before and after `npm ci`. It enforces the `Record<…>` fixtures of T002 (d) and T003 |
| `npm run build` | component root | 0 | PASS | Vite build, run before and after `npm ci`. It writes only ignored files under `src/factorflow/api/static/` |
| `python3 scripts/check-tdd-evidence.py check --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 6e570b27d3a2593143ac50b1664a89d203db9591 --decisions-dir projects/factorflow-v2/decisions --require-logs` | scratch mirror of the harness | 0 | PASS | 0 errors, 0 warnings. The reviewer's `shasum -a 256` of `cycle-2.patch`, `red-cycle-2-followed-zero.log`, `mutation-cycle-2-results.json` and `mutants-cycle-2.json` matches the recorded values |
| `grep -rnE "(const\|let\|var) TIER_ORDER\b" web/src --include='*.ts' --include='*.tsx' \| grep -v '\.test\.'` | component root | 0 | PASS | One line, `worst-data-tier.ts:19` (plan Story-Specific Validation, DAC-E1-S7-2) |
| `git diff --exit-code 6e570b2 HEAD -- web/src/components/patterns/tiers.ts web/src/api/types.ts web/src/app web/src/screens package.json package-lock.json` | component root | 0 | PASS | The delivered files are unchanged (T007) |
| Planted second order (T008, TC-COMP-027 edge) in a scratch `git clone` of `4554ab5`: `npx vitest run --root web src/components/patterns/worst-data-tier.test.ts` | scratch clone | 1 | PASS | It fails as intended: 2 failed, naming `planted-order.ts`. With a planted `needs-you.ts` that imports `TIER_ORDER`: 54 passed (exit 0). With one that names it only in a comment: the `runIf` test fails. The component repository was not touched |
| `python3 scripts/mutation-run.py generate --repo-dir <review clone> --range 6e570b2..HEAD --cycle review --out <scratch>/generated.json` | harness root | 0 | N/A | 13 mutants (10 off-by-one, 2 negate-boolean, 1 drop-field-copy), the same set v1 generated |
| `python3 scripts/mutation-run.py scope --repo-dir <review clone> --mutants <scratch>/with-manual.json --since f99341962788d5d686f3e8dbbf93bd3309350c14 --previous <v1 mutation file> --out <scratch>/mutants.json` | harness root | 0 | N/A | 50 mutants: 45 `carried`, 5 `late`. 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <review clone> --mutants <scratch>/mutants.json --jobs 4 --timeout 600 --work-root <scratch>/work --logs <scratch>/results-logs --command 'ln -sfn <review clone>/node_modules node_modules && npx vitest run --root web src/components/patterns/worst-data-tier.test.ts src/components/patterns/tiers.test.ts src/components/token-literals.test.ts && npx tsc --noEmit' --out <scratch>/results.json` | review clone (absolute paths) | 3 | N/A | Run outside the sandbox, because of `mktemp`. All four baselines exit 0. Exit 3 reports survivors; all six are equivalent (see Mutation results) |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |
| Python commands (`uv …`) | component root | N/A | NOT RUN | No Python file changed, and none is in the story's validation list |

### Validation Side Effects

- Before: a clean working tree at `4554ab5`. `pipeline-state.py code-revision --repo-dir <review
  clone>` gives `sha256:e066e0aac405ec58e91bfd01fd604d78a3cfcac5f2ea397b16dd680491de98d8`.
- After: a clean working tree at `4554ab5`, with the same fingerprint.
- The sandboxed `npm ci` attempt removed part of the ignored `node_modules/` before it failed.
  The unsandboxed `npm ci` restored it. Lint, format, `tsc`, the build and the full suite were
  then rerun, and all passed.
- The build, and the suite's own Vite build, rewrite only ignored files under
  `src/factorflow/api/static/`.
- The mutation clones, the planted-file clone and the harness mirror all lived in the reviewer's
  scratchpad. Nothing was written to the live `repos/factorflow-v2/FactorFlow-v2` clone. This
  report and its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 0**

No findings.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH): TC-COMP-026 never calls `worstDataTier` with `followedCount` 0 | RESOLVED | Two new rows, `[1, 0, critical No]` and `[5, 0, critical No]`, at `worst-data-tier.test.ts:34-36`. In this review's run, `manual:reviewer-followed-gt-zero` is killed (`affected 1 of 0` and `affected 5 of 0` fail). So are `followed-zero-to-warning`, `reviewer2-followed-zero-good`, `reviewer2-followed-zero-null` and `reviewer2-ge-to-eq`. Production code is unchanged, as v1 required |
| v1/IR-002 (MEDIUM): the story-coding commit carries no `Decision-Id` trailer | RESOLVED | `git log -1 --format='%(trailers:key=Decision-Id,valueonly)' 4554ab5` prints `DEC-0311` and `DEC-0312`. The trailers share the final paragraph with `Co-Authored-By`. As v1 specified, `f993419` is not amended. Reverting DEC-0312 by its trailer reaches the two rows that pin it. The production expression is the design 2.4 critical row's `>=`, so changing the decision needs a forward edit either way |
| v1/IR-003 (LOW): plan deviations and two planned checks are recorded only in evidence prose | RESOLVED | The cycle-2 description records the measured baseline (99 files, 2509 tests). The one-cycle deviation is recorded against T009 (evidence header line 4 and cycle-2). The rework stayed one cycle, one of the two options v1 offered. `planted-order-check.log` keeps the planted-file run (2 failed, naming `planted-order.ts`) |

## Scope and Plan Deviations

- **Justified deviations**:
  - One TDD cycle instead of the plan's three for the story coding (T009). v1 accepted this, and
    it is now recorded against T009 in the evidence.
  - T002 gains two DEC-0312 rows beyond the plan's list, as v1 IR-001 required. Plan Open Gap 2
    had waived them.
- **Bookkeeping**:
  - T001-T009 are ticked, and each is verified.
  - The tasks file's `last_reworked_review` names v1, and its `updated` is 2026-11-09. Story
    `status: in-review` is consistent.
  - `mutants-cycle-2.json` carries the same header as cycle-1's (`repo_head` `6e570b2`, `range`
    `HEAD..worktree`), but the cycle ran at `fcdc56e`. The results file records the real
    `repo_head` and binds the mutants file by sha256, so nothing depends on the header. Not raised.
  - The coder's GREEN ran the full suite with `--testTimeout=60000`. The reviewer's plain
    `npm run test` passed twice at default timeouts.
- **Out-of-scope changes**: none. Since v1, only the test file and the story's evidence changed.
- **Decisions**:
  - DEC-0311 (owner upheld) is implemented exactly as recorded.
  - DEC-0312 is still `status: open` with `owner_reviewed: false`. It is implemented and now
    pinned by `:35-36`. If the owner overturns it, the rows change with it.
  - Both records still list `commits: []`. Filling that list is the decision tooling's job, not
    the story's.
  - The `TIER_ORDER` and `followedCount` 0 wording in the design awaits the owner's next revision
    of `ui-components` 2.4 and 2.6, as both records say.
- **Reviewer decisions**: none recorded. The equivalence of the carried survivors `neutral: 5` and
  `critical: -1` follows v1, and both reviews name the same artifacts: plan T005 and DEC-0311's
  consumption contract. Every other judgment follows from the story, the plan, epic DAC-E1-3/4/5,
  design 2.4, DEC-0210, DEC-0217, DEC-0311, DEC-0312, `docs/unattended-mode.md` and v1.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-003-E1-S7 against this report. The verdict is
  `PASS`, so there is nothing to carry forward.
- **Warnings accepted downstream**: N/A
