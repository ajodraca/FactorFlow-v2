---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S7-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S7"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S7.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-09T00:55:09Z"
reviewed_head: "f99341962788d5d686f3e8dbbf93bd3309350c14"
review_base: "6e570b27d3a2593143ac50b1664a89d203db9591"
reviewed_state_revision: "sha256:32f78caea918127cfbb8765ad0dda8747e31929186497ee715809a6a51068caf"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-09T00:55:09Z
  source_artifacts:
    - id: CAP-003-E1-S7
      version: "1 (sha256:292b024fdb2b20a58407f8fa3a7f7fb9007a26af20df84eeaf1d5c13bac2bca1)"
    - id: CAP-003-E1-S7-tasks
      version: "1 (draft, updated 2026-11-07)"
    - id: CAP-003-E1-S7-tdd-evidence
      version: "cycle-1"
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

# Implementation Review: CAP-003-E1-S7 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 9/9 verified |
| Required validation | 10/10 passed |

This is the initial review of `f993419` against review base `6e570b2`, the tip of the CAP-003
integration branch. No baseline exists, so every finding is in scope.

The production code is correct, and it is what the plan specifies:

- `worst-data-tier.ts` exports exactly `TIER_ORDER`, `DataAnswer`, `worstDataTier` and
  `dataTileBadge`.
- `TIER_ORDER` is the frozen `Readonly<Record<Tier, number>>` that DEC-0311 records.
- `worstDataTier` returns `null` while `latestTerminalDownload` is null. Otherwise it takes the
  worse of the problem-set tier and the download tier. The word follows the winning tier, and the
  clause comes from the download alone.
- `dataTileBadge` lets the score state win only when it is strictly worse, and returns `null`
  whenever the verdict is `null`.
- Only the two planned source files changed. Every validation command passes, including the full
  suite: 100 files, 2560 tests passed and 1 skipped.

The gate fails on test strength. The reviewer ran 45 mutants: the 13 the catalogue generates, the
coder's 14 hand-written ones, and 18 of the reviewer's own. 39 are killed and 6 survive. Five
survivors are equivalent and one is not.

- **IR-001 (HIGH).** TC-COMP-026 is `WEAK`. DEC-0312 and plan T006 fix the answer for
  `affectedCount > 0` with `followedCount` 0 as critical *No*. No test calls `worstDataTier` with
  `followedCount` 0 and `affectedCount` above 0. So a literal transcription of design 2.4's row,
  `affectedCount >= followedCount && followedCount > 0`, survives every focused test and `tsc`.
  That mutant answers warning *Mostly yes* instead. The plan itself waived the test ("the coding
  agent need not add one"). The remediation is one test row.
- **IR-002 (MEDIUM).** Commit `f993419` carries no `Decision-Id` trailer. Its code rests on
  DEC-0311 (the shape of `TIER_ORDER`) and DEC-0312 (the `followedCount` 0 answer). DEC-0312 is
  still open for owner review, and unlabelled work cannot be found by `revert`.
- **IR-003 (LOW).** Two parts of the evidence are thin. The plan's three TDD cycles became one,
  and that is recorded only in a comment in the evidence file. T001's baseline and T008's
  planted-file check have no log.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S7.md` (`status: in-review`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S7-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S7-run-20261108T150357Z` |
| HEAD | `f99341962788d5d686f3e8dbbf93bd3309350c14` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z`, the driver's integration branch passed as `--base-ref`. `pipeline-state.py review-base` resolves it to `6e570b27d3a2593143ac50b1664a89d203db9591`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation (`git status --porcelain --untracked-files=all` prints nothing). The only additions are this report and its mutation file under `docs/`, which the code fingerprint excludes |
| Changed files reviewed | 40 against the review base (38 added, 2 modified) in one commit, `f993419` |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — story is ready for
independent review`. Without `--base-ref` it reports `BLOCKED — story coding has not reached
in-review`: measured against the remote default branch, the TDD lint names 64 earlier CAP-003
commits that no cycle of this story covers. Skill A.2 requires the driver's integration branch, so
the reviewer used it.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/worst-data-tier.ts` | added (82 lines) | AC-8, AC-11, AC-21, DAC-E1-3, DAC-E1-4, DAC-E1-5, DAC-E1-S7-2; T006; DEC-0311, DEC-0312 |
| `web/src/components/patterns/worst-data-tier.test.ts` | added (295 lines) | TC-COMP-026, TC-COMP-001, TC-COMP-027; DAC-E1-S7-1; T002-T005 |
| `.../stories/CAP-003-E1-S7.md` | modified (`status: planning` to `in-review`) | story-coding lifecycle |
| `.../stories/CAP-003-E1-S7-tasks.md` | modified (T001-T009 ticked; `git diff --word-diff=porcelain` shows exactly 9 `[ ]` to `[x]` changes and nothing else) | bookkeeping |
| `.../stories/CAP-003-E1-S7-tdd-evidence.yaml` | added (one cycle) | T009 |
| `.../stories/CAP-003-E1-S7-evidence/cycle-1.patch` | added | T009 (`reviewed_patch`) |
| `.../stories/CAP-003-E1-S7-evidence/red-cycle-1-verdict-and-order.log` | added | T009 (`red_log`) |
| `.../stories/CAP-003-E1-S7-evidence/mutants-cycle-1.json`, `mutation-cycle-1-results.json` and `mutation-cycle-1-results-logs/*.log` (33 files) | added | T009 (`mutation:`) |

No other source file changed: `git diff --stat 6e570b2..HEAD -- . ':!docs'` lists exactly the two
planned files. `git diff --exit-code 6e570b2 HEAD -- web/src/components/patterns/tiers.ts
web/src/api/types.ts web/src/app web/src/screens package.json package-lock.json` exits 0 (T007).

`cycle-1.patch` (sha256 `695306ac…`, matching `diff_sha256`) contains the evidence files and the two
source files. Its `web/` portion (from line 3298) is byte-identical to `git diff 6e570b2..HEAD --
web/`, so the code the reviews judged is the code committed.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `worst-data-tier.ts:41-69` `worstDataTier` | `worst-data-tier.test.ts:12-81` (TC-COMP-026) | The one function that composes the verdict tier and word. The problem set and the latest terminal download are its only inputs; the checks' tiers are not an input (DEC-0210 as amended; module comment `:4-11`) |
| AC-8 | SATISFIED | `worst-data-tier.ts:71-82` `dataTileBadge` | `worst-data-tier.test.ts:84-178` (TC-COMP-001) | The worse of the verdict tier and `tierOf(scores)`, with `labelOf(scores)` when the scores win and the answer word otherwise |
| AC-21 | SATISFIED | `worst-data-tier.ts:47-49`, `:75-77` | `:13-24` (null for `(0,10)`, `(3,10)`, `(10,10)`); `:169-177` (null verdict for a null and every score state) | No verdict, and never *Yes*, before a download has ended |
| DAC-E1-3 | SATISFIED | `:47-49` returns `null` on `latestTerminalDownload === null` before any count is read; `:75-77` returns `null` on a `null` verdict before `scores` is read | `:13-24`; `:162-177`, an `it.each` over a `Record<state, true>` of all five score states plus the `null` row | `manual:null-guard` and `manual:verdict-null-guard` are killed |
| DAC-E1-4 | SATISFIED | `:52-68`: problem tier `:53`; `failed` gives critical with `"failed"` and `abandoned` gives serious with `"interrupted"` (`:57-63`); the worse rank wins (`:65`); the word comes from `WORD[tier]` (`:34-39`, `:68`); the clause comes from the download alone | `:26-80`: every table row, `(10,10)` and `(1,1)` at the `>=` boundary, `(11,10)`, `(0,0)`, `failed` and `abandoned` over three counts, `abandoned` under a critical problem set keeping `"interrupted"`, and six states that contribute no tier | `(10,10)` with `abandoned` gives critical *No* with `"interrupted"`. That is "whichever input wins", and `manual:clause-only-if-wins` is killed. `cancelled` and `partial` contribute no tier (`:62-80`) |
| DAC-E1-5 | SATISFIED | `:78-81`: strict `<` on `TIER_ORDER`, so a tie goes to the verdict; a `null` score state skips the comparison | `:95-159`: TC steps 1-3; `GOOD` with `not_current`, `building`, `never_classified`, `null` and `current`; `SERIOUS` with `not_current` and `failed`; `CRITICAL` with `failed` | Active ties good and goes to the verdict (`GOOD` + `building`). Neutral never wins. `manual:tie-to-scores`, `manual:active-rank` and `manual:label-verdict` are killed |
| DAC-E1-S7-1 | SATISFIED | n/a (test-file criterion) | `worst-data-tier.test.ts`: every DAC-E1-4 row; `affectedCount >= followedCount > 0` at `(10,10)` and `(1,1)`; `cancelled` and `partial` rows; null verdict for `failed` and `not_current` (both named in the `it` titles) | Every element the criterion lists is present and passes |
| DAC-E1-S7-2 | SATISFIED | `:19-26` `export const TIER_ORDER … = Object.freeze({…})`, the only declaration in `web/src` | `:218-261` (TC-COMP-027 source scan); `:263-295` (semantics) | `grep -rnE "(const\|let\|var) TIER_ORDER\b" web/src --include='*.ts' --include='*.tsx' \| grep -v '\.test\.'` prints one line, `worst-data-tier.ts:19`. The `needs-you.ts` check is `it.runIf`, skipped until CAP-003-E1-S8 creates the file. The reviewer activated it in a scratch clone: it passes with the import and fails without it |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tiers.ts:16`, `:27-36`, `:42`, `:122` export `Tier`, `Status` (with the five-state `scores` member), `tierOf` and `labelOf`. `api/types.ts:207` exports `RunState`. `package.json` and `package-lock.json` are unchanged | The baseline count is not recorded anywhere (IR-003). The review base runs 99 files and 2509 tests (CAP-003-E1-S6 v2 at `f1cc0e7`; `6e570b2` changed only `docs/`). Adding this story's 52 gives the 100 files and 2561 tests the reviewer measured |
| T002 | complete | VERIFIED | `worst-data-tier.test.ts:11-81` | Every planned row (a)-(d) is present with the planned expected objects. (d) is a `Record<Exclude<RunState, "failed" \| "abandoned">, true>` with all six states. Each state has one `it` holding its `(0,10)` and `(3,10)` assertions, not two `it.each` rows; titles name the inputs. The rows the plan lists are complete. The DEC-0312 input, which the plan chose not to test, is IR-001 |
| T003 | complete | VERIFIED | `:83-178` | Fixtures are `DataAnswer` literals. TC steps 1-3, the eight sharpened rows and the null-verdict `Record<…["state"], true>` fixture are present. Every planned kill is confirmed by the mutation run |
| T004 | complete | VERIFIED | `:180-261` | (a)-(d) are as planned: comment stripping, the exact declaration regex, the import regex, `it.runIf` on `needs-you.ts`, and `tierOrderLiteralsIn` with its four planted strings. The reviewer planted `planted-order.ts` (`const TIER_ORDER = ["critical"]`), `screens/planted-consumer.ts` (mentions `TIER_ORDER` with no import) and `app/planted-literal.ts` (`["critical", "serious", "warning"]`) in a scratch clone. (a), (b) and (d) each failed, naming the planted file |
| T005 | complete | VERIFIED | `:263-295` | (a)-(e): the key set, the pairwise chain, active equal to good, the ascending sort and `Object.isFrozen`. The generated rank mutants on critical, serious, warning, good and active, `manual:drop-freeze`, `reviewer-seal-not-freeze` and `reviewer-neutral-equals-good` are killed |
| T006 | complete | VERIFIED | `worst-data-tier.ts:1-82` | Imports, exports, signatures, the `WORD` map, the guards and the strict comparisons match the plan to the token. The module comment cites design 2.4, DAC-E1-3/4/5, AC-8/11/21 and DEC-0210, and says Not determinable is not an answer. The file has no unit literal and no `#` followed by hex (`grep -nE "[0-9]+(px\|rem\|em\|vh\|vw)\b\|#[0-9a-fA-F]"` exits 1), and `token-literals.test.ts` passes over it |
| T007 | complete | VERIFIED | `npm run test`: 100 files, 2560 passed, 1 skipped | `tiers.test.ts`, `status-badge.test.tsx`, `token-literals.test.ts` and `render.test.tsx` pass unedited. Only the two planned source files changed |
| T008 | complete | VERIFIED | lint, format, `tsc --noEmit` and build exit 0 | The coder's planted-order check has no log (IR-003). The reviewer reproduced it, as described under T004 |
| T009 | complete | VERIFIED | `CAP-003-E1-S7-tdd-evidence.yaml`: cycle-1 `APPROVED`, `drift_detected: false`, `tests_executed: true`, `commit_hash: stage`. `diff_sha256` equals the `shasum -a 256` of `cycle-1.patch`, and `red_log_sha256` and `results_sha256` match. `check-tdd-evidence.py … --require-logs` reports 0 errors and 0 warnings | Deviation: one cycle, not the plan's three. It is recorded only in the evidence header (IR-003). The RED is the test file failing to import the missing module, so it proves nothing per behaviour. The reviewer's mutation run stands in for that. The coder's 27-mutant tally (23 killed; 4 survivors claimed equivalent) reproduces exactly |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `worstDataTier (TC-COMP-026, DAC-E1-3, DAC-E1-4)` / TC-COMP-026 | WEAK | Every DAC-E1-4 row is asserted with `toEqual` on the whole `{ tier, word, downloadClause }` object, against hand-written literals. The null cases use `toBeNull()`. Every planned kill is confirmed | `reviewer-followed-gt-zero` survives: `affectedCount > 0` with `followedCount` 0 is never exercised, yet DEC-0312 and T006 fix it as critical *No* (IR-001) |
| `dataTileBadge (TC-COMP-001, DAC-E1-5, DAC-E1-3)` / TC-COMP-001 | ADEQUATE | The whole `{ tier, label, from }` object is asserted against literal `DataAnswer` fixtures, not built by `worstDataTier`. It covers ties at warning, good and critical, strict wins at critical and warning, active and neutral against good, and a null verdict over a null and every score state | None. Every non-equivalent mutant on `:75-81` is killed (`78:negate-boolean`, `78:off-by-one`, `81:drop-field-copy`, tie-to-scores, label-verdict, from-swap, verdict-null-guard, scores-tier-from-verdict, verdict-label-tier, scores-gt) |
| `TIER_ORDER is the one tier order` / TC-COMP-027 | ADEQUATE | Source scan over every non-test `.ts`/`.tsx` under `web/src`, comments stripped. The reviewer confirmed it is non-vacuous with three planted files and with a planted `needs-you.ts`, with and without the import | `stripComments` also cuts a line at `//` inside a string (a URL). That could hide a declaration written after a URL on the same line. Not raised: it is far-fetched, and the plan specifies this stripping |
| `TIER_ORDER semantics (DEC-0217, DEC-0311)` (T005, additional) | ADEQUATE | Relations, not numbers: key set, pairwise chain, active equal to good, ascending sort, frozen | `neutral: 4 → 5` and `critical: 0 → -1` survive. They are equivalent (see Mutation results) |
| Determinism and isolation | ADEQUATE | Pure functions, no time, network or randomness. The source scan reads the working tree resolved from `import.meta.url` | none |

### Mutation results

`mutation-run.py run --jobs 4` over the 45 mutants, against `worst-data-tier.test.ts`,
`tiers.test.ts`, `token-literals.test.ts` and `tsc --noEmit`. All four baselines exit 0. Result:
39 killed, 6 survived, 0 stillborn, 0 timeouts. The full results are in
`CAP-003-E1-S7-implementation-review-v1-mutation.json` (sha256 `6f2df385…`).

| Survivor | Disposition | Reason |
|----------|-------------|--------|
| `:manual:reviewer-followed-gt-zero` (`affectedCount >= followedCount && followedCount > 0 ? "critical"`) | **non-equivalent** | `worstDataTier({ affectedCount: 1, followedCount: 0, latestTerminalDownload: "succeeded" })` returns warning *Mostly yes* instead of critical *No*. DEC-0312 and plan T006 ("this includes `followedCount` 0, DEC-0312") fix critical (IR-001) |
| `:25:off-by-one:1` (`neutral: 5`) | equivalent | The order is unchanged. DEC-0311 fixes how the constant is consumed, "lower rank = more severe … 'x is worse than y' is `TIER_ORDER[x] < TIER_ORDER[y]`", and plan T005 tests "against independent literal relations, not the constant's own numbers". Both leave the magnitudes open |
| `:manual:reviewer-critical-rank-negative` (`critical: -1`) | equivalent | Same reason as `neutral: 5` |
| `:65:off-by-one:1` and `:manual:download-lt-to-le` (`<=` in the download comparison) | equivalent | The download tier is critical or serious, and the problem tier is good, warning or critical. The ranks tie only when both are critical. The mutant then replaces critical with critical, the word follows the tier and the clause does not depend on the winner, so the return value is identical |
| `:manual:zero-to-ge` (`affectedCount <= 0`) | equivalent | It differs only for a negative count. Plan Other Notes, *Inputs outside the domain*, leaves negative counts out of the domain ("not produced by the wire … no guard is added") |

Killed: all 13 generated mutants except the two above, all 14 of the coder's hand-written mutants
except `zero-to-ge` and `download-lt-to-le`, and 16 of the reviewer's 18. The reviewer's killed
mutants are failed-tier-serious, abandoned-clause-failed, abandoned-to-cancelled,
partial-as-abandoned, scores-tier-from-verdict, the warning, good and critical words,
neutral-equals-good, download-always-wins, download-gt, problem-warning-serious,
good-requires-followed (`(0, 0)` would become critical), seal-not-freeze, verdict-label-tier and
scores-gt.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED; not counted |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | N/A | `READY`. Without `--base-ref` it reports `BLOCKED` (see Review Subject). Not counted |
| `npx vitest run --root web src/components/patterns/worst-data-tier.test.ts` | component root | 0 | N/A | The narrowest story suite, run first: 51 passed, 1 skipped (the `needs-you.ts` check). Not counted, because the full suite below covers it |
| `npx vitest run --root web --reporter=verbose <worst-data-tier, tiers, status-badge, token-literals, render tests>` | component root | 0 | N/A | The story file plus T007's four delivered files, unedited: 5 files, 162 passed, 1 skipped. Not counted, because the full suite below covers it |
| `npm ci` | component root | 0 | PASS | 308 packages added, 309 audited. `package.json` and `package-lock.json` are unchanged. Run after the mutation run, because every mutation clone links this `node_modules` |
| `npm run test` | component root | 0 | PASS | 100 files: 2560 passed, 1 skipped. Run after `npm ci`, at a load average above 600. No flake this time |
| `npm run lint` | component root | 0 | PASS | Biome: 223 files, no findings. Run before and after `npm ci` |
| `npm run format` | component root | 0 | PASS | Biome: 223 files, no changes. Run before and after `npm ci` |
| `npx tsc --noEmit` | component root | 0 | PASS | No output. Run before and after `npm ci`. It enforces T002 (d)'s and T003's `Record<…>` fixtures |
| `npm run build` | component root | 0 | PASS | Vite build, before and after `npm ci`. It writes only ignored files under `src/factorflow/api/static/` |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 6e570b27d3a2593143ac50b1664a89d203db9591 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. The reviewer's `shasum -a 256` of `cycle-1.patch`, `red-cycle-1-verdict-and-order.log` and `mutation-cycle-1-results.json` matches the recorded values |
| `grep -rnE "(const\|let\|var) TIER_ORDER\b" web/src --include='*.ts' --include='*.tsx' \| grep -v '\.test\.'` | component root | 0 | PASS | One line, `worst-data-tier.ts:19` (plan Story-Specific Validation, DAC-E1-S7-2) |
| `git diff --exit-code 6e570b2 HEAD -- web/src/components/patterns/tiers.ts web/src/api/types.ts web/src/app web/src/screens package.json package-lock.json` | component root | 0 | PASS | The delivered files are unchanged (T007) |
| Planted second order (T008, TC-COMP-027 edge), in a scratch `git clone` of HEAD: `npx vitest run --root web src/components/patterns/worst-data-tier.test.ts` | scratch clone | 1 | PASS | It fails as intended: 3 failed, naming `planted-order.ts`, `planted-consumer.ts` and `planted-literal.ts`. With a planted `needs-you.ts` that imports `TIER_ORDER`: 52 passed (exit 0). Without the import: the `runIf` test fails (exit 1). The component repository was not touched |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 6e570b2..HEAD --cycle review --out <scratch>/generated.json` | harness root | 0 | N/A | 13 mutants (10 off-by-one, 2 negate-boolean, 1 drop-field-copy) |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 600 --work-root <scratch>/work --logs <scratch>/results-logs --command 'ln -sfn <component>/node_modules node_modules && npx vitest run --root web src/components/patterns/worst-data-tier.test.ts src/components/patterns/tiers.test.ts src/components/token-literals.test.ts && npx tsc --noEmit' --out <scratch>/results.json` | harness root | 3 | N/A | 45 mutants; all four baselines exit 0. Exit 3 reports survivors (see Mutation results). `scope` was skipped because this is an initial review |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |
| Python commands (`uv …`) | component root | N/A | NOT RUN | No Python file changed, and none is in the story's validation list |

### Validation Side Effects

- Before: clean working tree at `f993419`. `pipeline-state.py code-revision` gives
  `sha256:32f78caea918127cfbb8765ad0dda8747e31929186497ee715809a6a51068caf`.
- After: clean working tree at `f993419`, with the same fingerprint. The build and the suite's own
  Vite build rewrite only ignored files under `src/factorflow/api/static/`, and `npm ci` rewrites
  only `node_modules/` (ignored). The mutation clones and the planted-file clone lived in the
  reviewer's scratchpad. This report and its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 1 · **total 3**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | HIGH | initial | TC-COMP-026 never calls `worstDataTier` with `followedCount` 0, so DEC-0312's critical answer is unpinned |
| IR-002 | MEDIUM | initial | The story-coding commit carries no `Decision-Id` trailer for DEC-0311 or DEC-0312 |
| IR-003 | LOW | initial | Plan deviations and two planned checks are recorded only in evidence prose |

### IR-001 — TC-COMP-026 never calls `worstDataTier` with `followedCount` 0, so DEC-0312's critical answer is unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. DAC-E1-4's table is fully pinned. The gap is the input DEC-0312
  adds beyond it, on the line that computes AC-11's tier
- **Tasks**: T002 (the test, TC-COMP-026) and T006 (the production behaviour it should pin)
- **Files**: `web/src/components/patterns/worst-data-tier.ts:52-53`;
  `web/src/components/patterns/worst-data-tier.test.ts:26-42`
- **Claim challenged**: T006 implements DEC-0312, "the problem tier is `affectedCount === 0 ?
  good : affectedCount >= followedCount ? critical : warning` … this includes `followedCount` 0".
  The code comment at `:51` repeats it. The claim is that the `(11, 10)` row pins this.
- **Observed evidence**:
  - The mutant `reviewer-followed-gt-zero` replaces `affectedCount >= followedCount ? "critical"`
    with `affectedCount >= followedCount && followedCount > 0 ? "critical"`. That is design 2.4's
    row "`affectedCount` ≥ `followedCount` > 0" transcribed literally.
  - It survives `worst-data-tier.test.ts`, `tiers.test.ts`, `token-literals.test.ts` and
    `tsc --noEmit` (log in the results file; 122 passed, 1 skipped).
  - Every `problemRows` and `downloadRows` entry has `followedCount` 10, 1 or 0. The only row with
    0 is `(0, 0)`, which takes the `affectedCount === 0` branch first. `(11, 10)` exercises the
    `>` side of `>=`, not `followedCount` 0.
  - The mutant is not equivalent. `worstDataTier({ affectedCount: 1, followedCount: 0,
    latestTerminalDownload: "succeeded" })` returns `{ tier: "warning", word: "Mostly yes" }`
    instead of `{ tier: "critical", word: "No" }`.
- **Expected evidence/behavior**:
  - DEC-0312 (provisional, `status: open`) decides "Critical 'No'". Its own second opinion agrees,
    and says "`worst-data-tier.test.ts` gets a case for it".
  - Plan T006 adopts it. Skill E.9 judges equivalence against the decision records and the task
    plan: "A mutant that changes behaviour any of them specifies is not equivalent, even when
    nothing in the system as built can observe the difference yet". A non-equivalent survivor
    makes the test that should kill it `WEAK`.
  - That test is TC-COMP-026's `worstDataTier` block, a mandatory TC-ID, so the finding is at
    least HIGH (skill H).
- **Impact**:
  - Today's code is correct. The input cannot arise from a consistent read: the problem set counts
    only active followed stocks (data-health-reader 2.4, DEC-0201).
  - The guard exists for an inconsistent read, so that the verdict "should never read better than
    the data" (DEC-0312). A later edit that matches the design's wording would silently turn that
    read into *Mostly yes* on both Data health (E6-S1) and Home's tile (E5-S2), and every test
    would stay green.
  - Plan Open Gap 2 told the coder "No test pins the unreachable input beyond the `(11, 10)` row;
    the coding agent need not add one". The gap therefore comes from the plan, not from coder
    negligence. The rule in skill E.9 still applies, and an input the system cannot reach yet does
    not lower the severity.
- **Required remediation**:
  - Add at least one row to `problemRows`, with `followedCount` 0 and `affectedCount` above 0 (for
    example `[1, 0, { tier: "critical", word: "No", downloadClause: null }]`), so that
    `reviewer-followed-gt-zero` fails.
  - Record the cycle in the TDD evidence, and include this mutant in its mutation block.
  - No production change is required. If the owner later overturns DEC-0312, the row changes with
    it.

### IR-002 — The story-coding commit carries no `Decision-Id` trailer for DEC-0311 or DEC-0312

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006 (the work done under the decisions); T009 (commit bookkeeping)
- **Files**: commit `f99341962788d5d686f3e8dbbf93bd3309350c14`;
  `web/src/components/patterns/worst-data-tier.ts:13-26`, `:51-53`
- **Claim challenged**: The stage commit identifies the decisions its work rests on.
- **Observed evidence**:
  - `git log -1 --format='%(trailers:key=Decision-Id,valueonly)' f993419` prints nothing. The raw
    message is the subject plus `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
  - The code implements DEC-0311 (`TIER_ORDER`'s shape; plan Open Gap 1) and DEC-0312 (the
    `followedCount` 0 answer; plan Open Gap 2). Both records list `commits: []`.
  - Every earlier CAP-003-E1 story-coding commit carries its plan's trailers: `330bc55` and
    `f1cc0e7` (DEC-0309, DEC-0310), `43b4278` (DEC-0203, DEC-0308) and `8e74983` (DEC-0306,
    DEC-0307).
- **Expected evidence/behavior**: `docs/unattended-mode.md`, *Commits made under a decision*:
  "Every commit containing such work carries the trailer … A driver that invoked a stage under a
  decision puts the trailer on that commit itself."
- **Impact**:
  - DEC-0312 is `owner_reviewed: false`, `status: open`. If the owner overturns it, the code it
    produced cannot be found by its trailer.
  - "A commit that omits the trailer has made its work unrevertable" (the same section).
  - DEC-0311 is upheld, so for it the loss is traceability only.
- **Required remediation**:
  - The rework commit for this story (IR-001) carries `Decision-Id: DEC-0311` and
    `Decision-Id: DEC-0312` in its final trailer paragraph, together with `Co-Authored-By`.
  - No history is rewritten. The reviewer does not ask for an amend.

### IR-003 — Plan deviations and two planned checks are recorded only in evidence prose

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T001, T008, T009
- **Files**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S7-tdd-evidence.yaml:3`, `:10`;
  `CAP-003-E1-S7-tasks.md` T009
- **Claim challenged**:
  - T009 is ticked as written: three cycles, "not once at the end".
  - T001 says "record the baseline green".
  - T008 says the planted `planted-order.ts` makes the suite fail.
- **Observed evidence**:
  - The evidence has one cycle covering T001-T009, and its header comment explains the merge. The
    plan text is unchanged.
  - The RED (`red-cycle-1-verdict-and-order.log`) is the test file failing to import
    `./worst-data-tier`, with 0 tests collected. It is observed, but it shows no per-behaviour
    failure.
  - No baseline count is recorded, and the planted-order result is one sentence of prose with no
    log.
- **Expected evidence/behavior**: Plan T001, T008 and T009 as written, or a deviation reconciled in
  the plan. The same issue was raised as CAP-003-E1-S4 v1 IR-007 and CAP-003-E1-S6 v1 IR-005, both
  LOW.
- **Impact**: None on the code. The reviewer reproduced both unlogged checks: the baseline is
  99 files and 2509 tests, and the planted files fail the scan. The reviewer's mutation run stands
  in for the per-behaviour RED. A reader of the plan alone would believe three reviewed cycles
  exist.
- **Required remediation**: In the rework cycle, record the measured baseline. Either note the
  one-cycle deviation against T009 in the task plan or keep later cycles one per plan cycle. Keep
  the output of any planted-file check as a log beside the evidence.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations**: one TDD cycle instead of three (T009). The tier order, the verdict and
  the tile badge share one module and one test file, and the stage commits once. This is accepted
  as in CAP-003-E1-S4 and CAP-003-E1-S6; the bookkeeping is IR-003. T002 (d) puts each state's two
  assertions in one `it` rather than two `it.each` rows. Every input is still asserted and named in
  the title.
- **Bookkeeping**: T001-T009 are ticked, and each is verified. Story `status: in-review` is
  consistent. The RED log shows a multi-line import (`:12:7`) that is single-line at HEAD (`:7`):
  Biome formatted the file after RED. That is expected under T008.
- **Out-of-scope changes**: none. Only the two planned source files and the story's evidence
  changed.
- **Decisions**: DEC-0311 (owner upheld) and DEC-0312 (open) are implemented exactly as recorded.
  The commit carries neither trailer (IR-002). The design's `TIER_ORDER` and `followedCount` 0
  wording await the owner's next revision of `ui-components` 2.4 and 2.6, as both records name.
- **Reviewer decisions**: this review recorded none. Every judgment follows from the story, the
  plan, epic DAC-E1-3, DAC-E1-4 and DAC-E1-5, design 2.4 and §7, data-health-ui 2.3, home-ui 2.4,
  DEC-0210, DEC-0217, DEC-0311, DEC-0312, `docs/unattended-mode.md` and this capability's earlier
  reviews.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**:
  - Rework per IR-001: add a `followedCount` 0, `affectedCount` > 0 row to TC-COMP-026 that kills
    `reviewer-followed-gt-zero`. Record the cycle with its mutation block, and address IR-003's
    bookkeeping.
  - The driver's rework commit carries `Decision-Id: DEC-0311` and `Decision-Id: DEC-0312`
    (IR-002).
  - Set `last_reworked_review` to this report and rerun the adversarial review. That review takes
    this report and `CAP-003-E1-S7-implementation-review-v1-mutation.json` as its baseline.
- **Warnings accepted downstream**: N/A
