---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-20
updated: 2026-11-20
story_id: "CAP-003-E3-S1"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-20T02:03:55Z"
reviewed_head: "03be8b5493794ea7ca957d513274a0f99d6ac819"
review_base: "cb5a822a6cd087b091ecc236538133c0cc0bd4ef"
reviewed_state_revision: "sha256:2e2716a1228b0d24a7707e58197725c119f6c188fb03af29c8a2514fca55ce43"
verdict: PASS-WITH-WARNINGS
reviewed_paths:
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/cycle-4.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/baseline-w0.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/baseline-w1.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/baseline-w2.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/baseline-w3.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/manual_cycle-4_1.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/manual_cycle-4_2.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/manual_cycle-4_3.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/manual_cycle-4_4.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/manual_cycle-4_5.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/manual_cycle-4_6.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/manual_cycle-4_7.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results-logs/manual_cycle-4_8.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/mutation-cycle-4-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-evidence/red-cycle-4-rework.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-implementation-review-v1-mutation.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-implementation-review-v1.md
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-tasks.md
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-tdd-evidence.yaml
  - web/src/app/shell-client.test.ts
review_subjects:
  - artifact_id: CAP-003-E3-S1
    artifact_version: 2
    content_revision: sha256:b50f58ea5abf65ca1e4c8ffdacaf92f36ab3431589c6955dfae128ad8493434c
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-20T02:03:55Z
  source_artifacts:
    - id: CAP-003-E3-S1
      version: "2 (sha256:b50f58ea5abf65ca1e4c8ffdacaf92f36ab3431589c6955dfae128ad8493434c)"
    - id: CAP-003-E3-S1-tasks
      version: "1 (draft, updated 2026-11-20, last_reworked_review v1)"
    - id: CAP-003-E3-S1-tdd-evidence
      version: "cycle-1 to cycle-4, EXC-001"
    - id: CAP-003-E3-S1-implementation-review
      version: "1 (baseline, CHANGES-REQUIRED, reviewed_head cb5a822a)"
    - id: CAP-003-component-design-owner-shell
      version: "2"
    - id: CAP-003-component-design-data-health-api
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-owner-shell-tests
      version: "TC-COMP-065 to TC-COMP-068"
    - id: DEC-0400
      version: "owner, upheld"
    - id: DEC-0401
      version: "agent, open (v1's base; see Scope and Plan Deviations)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E3-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 2 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 14/14 verified |
| Required validation | 12/12 passed |

Findings: CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 2 · **total 4**

| Finding | Severity | Scope | Status |
|---------|----------|-------|--------|
| IR-001 | MEDIUM | late | OPEN |
| IR-002 | MEDIUM | late | OPEN |
| IR-003 | LOW | late | OPEN |
| IR-004 | LOW | carried | OPEN |

The rework resolves both blocking findings from v1. It changes only tests (`web/src/app/shell-client.test.ts`, +22 lines), and the production code is byte-identical to v1's `reviewed_head` `cb5a822a`.

- **v1 IR-001 (method and Accept):** the Accept/GET `it.each` now covers `fetchScoreSummary`. Mutants `manual:review:17` (POST) and `:18` (`Accept: */*`) are killed.
- **v1 IR-002 (result types):** a new `expectTypeOf(...).returns.resolves.toEqualTypeOf` block pins all four result types. `manual:review:4`, `:5`, `:6`, `:7` and `:8` are killed by `tsc`.
- **v1 IR-003 (empty cursor):** an empty-string cursor case now kills `manual:review:3`.

All 20 baseline mutants were re-run and all are killed. Every required command passes on a clean tree. The TDD lint shows 0 errors against both the review base and the coding base.

My own 14 mutants found 5 survivors. All 5 change production lines that have not changed since the baseline, and `scope` tags them `late`, so none can block (H, *Re-review scope*). They are reported as IR-001 to IR-003:

- client-side clamping or defaulting of `limit`;
- an optional or widened `limit` parameter type;
- a query string added to a parameterless read.

v1 IR-004 (LOW) is still open. No finding shows a production defect.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1.md` (v2, approved 2026-11-08, revision `sha256:b50f58ea…434c`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E3-S1-run-20261120T010103Z` |
| HEAD | `03be8b5493794ea7ca957d513274a0f99d6ac819` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z` resolves to `cb5a822a6cd087b091ecc236538133c0cc0bd4ef` through `pipeline-state.py review-base --base-ref`. That commit is an ancestor of HEAD, and it is also v1's `reviewed_head`. See *Scope and Plan Deviations* for how this relates to v1's base, `4c93c6b4` (DEC-0401) |
| Working tree | Clean before and after validation (`git status --porcelain --untracked-files=all` empty) |
| Changed files reviewed | 20 in `cb5a822a..HEAD`: 1 test source, 2 plan and evidence documents, 15 cycle-4 evidence files, and 2 v1 review artifacts. The 3 story source files below the base were also re-read and re-mutated (table below) |
| Commits reviewed | `cf8e8749` "CAP-003-E3-S1 adversarial-review: rework" (the v1 report and its `-mutation.json`, trailer `Decision-Id: DEC-0401`), and `03be8b54` "CAP-003-E3-S1 cycle 4: …". Neither is a merge, and both name only CAP-003-E3-S1 |
| Baseline | v1 (`CAP-003-E3-S1-implementation-review-v1.md`, CHANGES-REQUIRED), `reviewed_head` `cb5a822a6cd087b091ecc236538133c0cc0bd4ef`, with `-v1-mutation.json` |
| Reviewed at | 2026-11-20T02:03:55Z |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/app/shell-client.test.ts` | modified (+22) | Rework of v1 IR-001 (T006), IR-002 (AC-8; T010/T011 signatures), IR-003 (T010 guard); cycle-4 |
| `.../stories/CAP-003-E3-S1-tdd-evidence.yaml` | modified (+29) | T014: the `cycle-4` entry |
| `.../stories/CAP-003-E3-S1-tasks.md` | modified | `updated` and `last_reworked_review: CAP-003-E3-S1-implementation-review-v1.md` only, which is rework bookkeeping. No checkbox or task text changed |
| `.../CAP-003-E3-S1-evidence/cycle-4.patch` | added | T014 (`reviewed_patch`). SHA-256 `f577f0f2…8148` matches `diff_sha256` |
| `.../CAP-003-E3-S1-evidence/red-cycle-4-rework.log` | added | T014 (`red_log`). SHA-256 `f6591bff…57f` matches |
| `.../CAP-003-E3-S1-evidence/mutation-cycle-4-results.json` and 12 `mutation-cycle-4-results-logs/*.log` | added | T014 (`mutation.results`). SHA-256 `e5b0b30c…995` matches |
| `.../stories/CAP-003-E3-S1-implementation-review-v1.md`, `...-v1-mutation.json` | added | The baseline review's own artifacts, committed by the driver |

Story files below the review base, unchanged since the baseline and re-read in full for AC and task verification (v1 lists them in its `reviewed_paths`):

| File | State since baseline | Story/Task Justification |
|------|----------------------|--------------------------|
| `web/src/app/shell-types.ts` | unchanged (`git diff cb5a822a HEAD` empty) | DAC-E3-18, DAC-E3-S1-4, AC-8, AC-16; T009 |
| `web/src/app/shell-client.ts` | unchanged | DAC-E3-18, DAC-E3-S1-2, DAC-E3-S1-3, AC-8; T010, T011 |
| `web/src/api/client.ts` and its three delivered tests | unchanged since `4c93c6b4` | DAC-E3-S1-1 second clause, DAC-E7-12 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-8 | SATISFIED | `shell-client.ts:13` `fetchAttention(): Promise<Attention>`, `:18` `fetchDataHealth(): Promise<DataHealth>`, `:54-56` `fetchScoreSummary(): Promise<ScoreSummary \| Extract<ScoreState, {kind:"not_served"}>>`, `:33` `Promise<ProblemPage>` | `shell-client.test.ts:571-580` "pins every read's resolved type" (`toEqualTypeOf`, checked by `tsc`). Runtime `toEqual` at `:434-470`, `:542-567` | v1 PARTIAL is now resolved. `manual:review:4`, `:5`, `:6`, `:7` and `:8` are killed (exit 2, `tsc` TS2344). Parameter types are not pinned (IR-002, late) |
| AC-16 | SATISFIED | `shell-types.ts:38-42` `Problems.stock_count: number`; `Attention.problems` (`:85`) | `:180-182` `toEqualTypeOf<number>()`; `:167-169` `AttentionLiteral` | Type-level, observed by `tsc` |
| DAC-E3-18 | SATISFIED | `shell-types.ts` `Attention`, `DataHealth`, `ProblemPage`, `ScoreSummary` match the plan's wire shapes (data-health-api §2.4; `ClassificationSummaryResponse`). `shell-client.ts` is the only new module that reads the four routes | `:166-222` `toEqualTypeOf` against independent literals. The fetch-module grep prints exactly `classification-client.ts` and `shell-client.ts` | My type mutants `manual:review-v2:9` to `:14` are all killed by `tsc` |
| DAC-E7-12 | SATISFIED | `web/src/api/client.ts:154` `export async function requestJson` (CAP-002-E4-S1) | `manual:review:10` (export removed) killed | "Unless CAP-002 already exported" applies |
| DAC-E3-S1-1 | SATISFIED | `git diff --exit-code 4c93c6b4 -- <four files>` and `git diff --exit-code HEAD -- <four files>` both exit 0 | The three delivered suites pass: 29 tests | `client.ts` is not edited |
| DAC-E3-S1-2 | SATISFIED | `shell-client.ts:57-64`: `caught instanceof ApiError && caught.code === "not_found"`, then `{ kind: "not_served" }`, else `throw caught` | `:510-539` (404 `not_found`, 500, network) and `:542-567` (200, `universe_not_found`, plain-text 404) | `:60` negate-boolean, `manual:review:1` and `:9` killed |
| DAC-E3-S1-3 | SATISFIED | `shell-client.ts:30-40`: `limit` always appended, `cursor` when `!= null`, `URLSearchParams` | `:247-309`: undefined, null, `""`, "KO", "BRK/B"/7, `next_cursor` "KO" and null, plus the Accept/GET check for all four reads | `:36` negate-boolean, `manual:review:2` and `:3` killed. Limit clamping and defaulting are unpinned (IR-001, late) |
| DAC-E3-S1-4 | SATISFIED | `shell-types.ts:61-66` `LatestTerminalDownload` (five terminal states, `failure_reason: string \| null`) | `:171-178` and `:167-169` `toEqualTypeOf` | `manual:review:14` killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | I re-ran both `git diff --exit-code` checks (exit 0), the export `grep` (l.154) and the three delivered suites (29 passed) | The check output is still not recorded in the TDD evidence (IR-004, carried) |
| T002 | complete | VERIFIED | `shell-client.test.ts:510-539` | Unchanged since baseline |
| T003 | complete | VERIFIED | `:247-271` | Unchanged since baseline |
| T004 | complete | VERIFIED | `:58-87`, `:166-183` | `grep -c toMatchTypeOf` = 0 |
| T005 | complete | VERIFIED | `:89-162`, `:186-222` | Unchanged since baseline |
| T006 | complete | VERIFIED | `:274-309`: null cursor, empty-string cursor (new), "BRK/B"/7, Accept and GET for all four functions (`fetchScoreSummary` added at `:301`) | v1 PARTIAL is now resolved. "Never clamped or defaulted" is pinned only at 7 and 50 (IR-001, late) |
| T007 | complete | VERIFIED | `:542-567`; result type pinned at `:576-578` | — |
| T008 | complete | VERIFIED | `:434-470`; result types pinned at `:573-574` | The path assertion drops the query string (IR-003, late) |
| T009 | complete | VERIFIED | `web/src/app/shell-types.ts` (unchanged) | — |
| T010 | complete | VERIFIED | `web/src/app/shell-client.ts:12-40` (unchanged) | The signature is as planned. Its parameter types are unpinned (IR-002, late) |
| T011 | complete | VERIFIED | `web/src/app/shell-client.ts:42-65` (unchanged) | — |
| T012 | complete | VERIFIED | `npm run test` (102 files, 2645 passed, 1 skipped); both T001 diffs; the fetch-module grep prints exactly the two files; nothing outside `shell-client*` imports the new modules (grep exit 1) | — |
| T013 | complete | VERIFIED | `npm run format`, `npm run lint`, `npx tsc --noEmit` and `npm run build` all exit 0 | — |
| T014 | complete | VERIFIED | `cycle-4` carries a patch, a RED log, APPROVED, `drift_detected: false`, a mutation block (8/8 killed) and matching SHA-256s. `check-tdd-evidence.py --require-logs` gives 0 errors and 0 warnings against `cb5a822a` and against `4c93c6b4` | The RED was taken against the v1 survivors applied to production (`if (cursor)`, `Promise<unknown>`, POST): 2 vitest failures and TS2344. That is a meaningful RED for a tests-only rework |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-065 (recorded check, T001) | ADEQUATE | I re-ran both diffs, the grep and the three delivered suites. `manual:review:10` is killed | Recording only (IR-004) |
| TC-COMP-066 block (`:510-539`) | ADEQUATE | A 404 `not_found` resolves exactly `{kind:"not_served"}` with one call on the exact path. A 500 keeps its code and requestId. A thrown fetch gives `ApiUnreachableError` and not `ApiError` | None |
| TC-COMP-067 block (`:247-271`) | ADEQUATE | The URL is parsed. Exact `limit`, `cursor` presence and absence, body `toEqual`, null `next_cursor` | Clamp and default of `limit` (IR-001, late, which does not make the test WEAK) |
| TC-COMP-068, type mirror (`:58-222`) | ADEQUATE | `toEqualTypeOf` against hand-written literals for all four wire shapes and both unions. All 6 of v1's type mutants and 6 of mine are killed by `tsc` | None |
| TC-COMP-068, fetch block (`:434-470`, T008) | ADEQUATE | Runtime round-trip with every nullable populated and null, exact path, 500 and network. The result types are now pinned at `:573-574` | Query string unpinned (IR-003, late) |
| T006 request-encoding block (`:274-309`) | ADEQUATE | All four functions are checked for `init.method` undefined and `Accept: application/json`. Empty, null and slash cursors are covered | Was WEAK in v1. `manual:review:17` and `:18` are now killed |
| T007 block (`:542-567`) | ADEQUATE | The 200 summary is unchanged and has no `kind`. `universe_not_found` and plain-text 404s reject | Was WEAK in v1. `manual:review:7` is now killed |
| AC-8 type-pin block (`:571-580`, new) | ADEQUATE | `expectTypeOf(fn).returns.resolves.toEqualTypeOf<…>()` for all four reads, against the shell-types names, which `:166-222` pin to literals. Both widening orders of the summary result are killed (`manual:review:7`, `manual:cycle-4:8`) | Parameter types (IR-002, late) |
| Isolation and determinism | ADEQUATE | `vi.stubGlobal` per test, `afterEach(vi.unstubAllGlobals)`, `response.clone()`. No timers, network or environment dependence. The new `it.each` row stubs a 200 with an unrelated body, which is harmless because the row asserts only the request | — |
| TDD evidence lint (E.8) | ADEQUATE | 0 errors and 0 warnings with `--require-logs` against both bases. EXC-001 is still covered by DEC-0400 (owner, upheld) | — |

**Mutation (E.9).** The story's own score is 1.000: 36 of 36 over 4 cycles, none called equivalent, none excepted, and the project declares no minimum.

How the mutants were built:

- `generate` over `cb5a822a..HEAD` yields 0, because no production line changed.
- I also generated over the story's full range `4c93c6b4..HEAD`: 2 negate-boolean mutants.
- I added 14 by hand (`manual:review-v2:1` to `:14`).
- `scope --since cb5a822a --previous -v1-mutation.json` added v1's 18 manual mutants and tagged the set: 20 `carried`, 14 `late`, 0 `delta`.

Run with the plan's focused command (`npx vitest run web/src/app/shell-client.test.ts && npx tsc --noEmit`, 4 jobs; all baselines exit 0): **29 killed, 5 survived**. Every carried mutant is killed, and all 5 survivors are `late`. Results are in `CAP-003-E3-S1-implementation-review-v2-mutation.json` beside this report.

| Mutant | Change | Scope | State | Judgement |
|--------|--------|-------|-------|-----------|
| `shell-client.ts:36:negate-boolean:1`, `:60:negate-boolean:1` | `== null`; `\|\|` | carried | killed | — |
| `manual:review:1`, `:2`, `:3`, `:9`, `:17`, `:18` | await dropped; `!== null`; `if (cursor)`; `code !== null`; POST; `Accept: */*` | carried | killed (vitest) | v1 IR-001 and IR-003 resolved |
| `manual:review:4` to `:8` | result types `unknown`, widened or `any` | carried | killed (`tsc`, exit 2) | v1 IR-002 resolved |
| `manual:review:10` to `:16` | `requestJson` unexported; shell-types readonly, optional, Partial, nullable and narrowed | carried | killed | — |
| `manual:review-v2:1` | `String(Math.min(limit, 500))` | late | **survived** | Not equivalent: T006 says "never clamped" (IR-001) |
| `manual:review-v2:2` | `String(limit \|\| 50)` | late | **survived** | Not equivalent: T006 says "never … defaulted" (IR-001) |
| `manual:review-v2:3` | attention read with `Accept: */*` | late | killed | — |
| `manual:review-v2:4` | data-health read as `POST` | late | killed | — |
| `manual:review-v2:5` | `"/api/attention?limit=50"` | late | **survived** | Not equivalent: data-health-api §11 gives the request as "none", and T008 asks for the exact path (IR-003) |
| `manual:review-v2:6` | `cursor: string \| null` (undefined refused) | late | killed (`tsc` TS2345) | — |
| `manual:review-v2:7` | `limit?: number` | late | **survived** | Not equivalent: T010 fixes `limit: number` (IR-002) |
| `manual:review-v2:8` | `limit: number \| string` | late | **survived** | Not equivalent: T010 (IR-002) |
| `manual:review-v2:9` to `:14` | `symbols` readonly; ScoreState `last` non-null; `DataHealth.problems` nullable; `set.state: string`; `Failure.outcome` widened; ReadState `checkedAt: string` | late | killed (`tsc`) | — |

## Independent Validation

All commands ran from `repos/factorflow-v2/FactorFlow-v2` unless noted. No command was refused by the sandbox.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | 8 of 8 checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z --json` | harness root | 0 | PASS | `ready`, `rework-done`. Mutation 1.000, 36/36. Without `--base-ref` it reports BLOCKED ("story coding has not reached in-review") because it then resolves the base against the remote default |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z` | harness root | 0 | PASS | `cb5a822a…`, which is an ancestor of HEAD (`merge-base --is-ancestor` exit 0) |
| `npx vitest run web/src/app/shell-client.test.ts` | component | 0 | PASS | 33 passed |
| `npx vitest run web/src/api/client.coverage.test.ts web/src/api/client.runs.test.ts web/src/api/render.test.tsx` | component | 0 | PASS | 3 files, 29 passed |
| `npx tsc --noEmit` | component | 0 | PASS | Clean, so every `toEqualTypeOf` holds |
| `npm run lint` | component | 0 | PASS | 228 files, no fixes |
| `npm run format` | component | 0 | PASS | 228 files, no fixes |
| `npm run test` | component | 0 | PASS | 102 files, 2645 passed, 1 skipped |
| `npm run build` | component | 0 | PASS | Built in 1.39s into the ignored `src/factorflow/api/static/` |
| `git diff --exit-code $(git merge-base HEAD origin/main) -- web/src/api/client.ts web/src/api/client.coverage.test.ts web/src/api/client.runs.test.ts web/src/api/render.test.tsx` and the same with `HEAD` | component | 0 / 0 | PASS | The merge base is `4c93c6b4`. DAC-E3-S1-1 |
| `grep -n "^export async function requestJson" web/src/api/client.ts` | component | 0 | PASS | `154:` |
| `grep -rlE "[\"'\`]/api/(attention\|data-health\|classifications/summary)" web/src --include='*.ts' --include='*.tsx' \| grep -v '\.test\.' \| sort` | component | 0 | PASS | `web/src/api/classification-client.ts`, `web/src/app/shell-client.ts` |
| `grep -c "toMatchTypeOf" web/src/app/shell-client.test.ts` | component | 1 | PASS | Prints `0` as the plan requires. Exit 1 is grep's no-match status |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence> --repo-dir repos/factorflow-v2/FactorFlow-v2 --base cb5a822a6cd087b091ecc236538133c0cc0bd4ef --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. Also 0/0 with `--base 4c93c6b4…` |
| `python3 scripts/mutation-score.py score --evidence <tdd-evidence> --project-repo repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | 1.000 over 4 cycles (36/36), no minimum declared |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range cb5a822a…..HEAD --cycle review --out <scratch>/gen-delta.json` | harness root | 0 | PASS | 0 mutants, because no production line changed |
| `python3 scripts/mutation-run.py generate … --range 4c93c6b4…..HEAD --cycle review --out <scratch>/gen-story.json`, plus 14 manual mutants | harness root | 0 | PASS | 2 generated |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants-raw.json --since cb5a822a… --previous <stories>/CAP-003-E3-S1-implementation-review-v1-mutation.json --out <scratch>/mutants.json` | harness root | 0 | PASS | 34 mutants: 20 carried, 14 late, 0 no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 4 --command 'cd {workdir} && ln -sfn <component>/node_modules node_modules && npx vitest run web/src/app/shell-client.test.ts && npx tsc --noEmit' --out <scratch>/results.json --logs <scratch>/results-logs --work-root <scratch>/work` | harness root | 3 | 29 killed, 5 survived | All survivors are late (IR-001 to IR-003). This is not a validation-command failure |
| `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `uv build` | — | N/A | NOT RUN | The change set has no Python file, and the plan's Validation Plan scopes the TypeScript commands |
| `npm ci` | — | N/A | NOT RUN | `node_modules` is present and no package was added (plan: "only if `node_modules` is absent") |
| `npm run test:e2e` | — | N/A | NOT RUN | The plan excludes it: no e2e spec and no rendered behaviour changed |

Required validation counted in the Gate Summary is the same 12 as v1, and 12 of 12 passed:

- the five tech-stack TypeScript commands: `npm run build`, `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit`;
- the focused suite and the delivered client suites;
- the T001 diff pair, counted once;
- the export grep, the fetch-module grep and the `toMatchTypeOf` count;
- the TDD lint.

### Validation Side Effects

- Before: `03be8b5493794ea7ca957d513274a0f99d6ac819`, clean (`git status --porcelain --untracked-files=all` empty), 2026-11-20T02:06:22Z.
- After: `03be8b5493794ea7ca957d513274a0f99d6ac819`, clean. `npm run test` and `npm run build` write into the ignored `src/factorflow/api/static/`. Mutation clones ran under the session scratchpad.
- Unexpected tracked-file changes: none. The only files this review adds are this report and `CAP-003-E3-S1-implementation-review-v2-mutation.json`, both under `docs/`, which the code fingerprint excludes.

## Findings

### IR-001 — `fetchProblems` sends `limit` "as given" is pinned only at 7 and 50: client-side clamping or defaulting survives

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S1-3
- **Tasks**: T006, T010
- **Files**: `web/src/app/shell-client.ts:35` (`params.append("limit", String(limit))`); `web/src/app/shell-client.test.ts:248-263`, `:289-295`
- **Claim challenged**: T006 is checked complete. It says `limit` is "sent as given, never clamped or defaulted client-side; the server refuses out-of-range values with `422`".
- **Observed evidence**: `manual:review-v2:1` (`String(Math.min(limit, 500))`) and `manual:review-v2:2` (`String(limit || 50)`) each pass all 33 tests and `tsc`. The tests use only `limit` values 50 and 7, which both mutants leave unchanged.
- **Expected evidence/behavior**: The plan's T006 and *Open Gaps* ("No bound, limit or default is set here … the server owns the 1-500 bound"). Data-health-api §11 gives `limit` a server default of 50 and a maximum of 500, and the route refuses values outside 1 to 500 with `422`. A client clamp or default changes which of those answers the caller gets, so the mutants are not equivalent.
- **Impact**: The production code is correct, and data-health-ui always passes 50. A later edit that clamped or defaulted `limit` would turn the server's `422` for 0 or 501 into a served page, and this story's suite would not notice. The production line is unchanged since v1 and v1 could have run these mutants, so this is a `late` warning that does not block.
- **Required remediation**: Add an out-of-range case (for example `fetchProblems(undefined, 0)` and `fetchProblems(undefined, 501)`) asserting that `limit` is sent verbatim. Then show `manual:review-v2:1` and `:2` killed.

### IR-002 — `fetchProblems`'s parameter types are not pinned: `limit` can become optional or widened

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-8 ("typed reads"), DAC-E3-S1-3
- **Tasks**: T010
- **Files**: `web/src/app/shell-client.ts:30-33`; `web/src/app/shell-client.test.ts:571-580`, which pins only `.returns.resolves`
- **Claim challenged**: The rework's AC-8 block says "each exported read's declared result type is pinned exactly". That holds for result types, but the plan fixes the whole signature.
- **Observed evidence**: `manual:review-v2:7` (`limit?: number`) and `manual:review-v2:8` (`limit: number | string`) each pass all 33 tests and `tsc`. Narrowing `cursor` to `string | null` (`manual:review-v2:6`) is killed, but only by accident: existing calls pass `undefined` (TS2345).
- **Expected evidence/behavior**: T010 fixes `fetchProblems(cursor: string | null | undefined, limit: number): Promise<ProblemPage>`, and the plan's *Concurrency* note names that signature for consumers. CAP-003-E6-S3 calls `fetchProblems(cursor, 50)`.
- **Impact**: The production code is correct. With `limit?: number`, a consumer that omits `limit` would compile and send `limit=undefined`, which the route refuses with `422`. The gap lies in production lines unchanged since v1 and is outside what v1 IR-002 asked for (result types), so it is `late` and does not block.
- **Required remediation**: Pin `fetchProblems`' parameter types as T010 fixes them, in the file's existing `expectTypeOf` style. Then show `manual:review-v2:7` and `:8` killed.

### IR-003 — The exact-path assertion drops the query string, so a parameterless read can gain one

- **Severity**: LOW
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-18
- **Tasks**: T008
- **Files**: `web/src/app/shell-client.test.ts:33` (`firstCall`'s `path: input.split("?")[0]`), `:435-453`; `web/src/app/shell-client.ts:14`, `:19`
- **Claim challenged**: T008 says each read's exact path is "asserted on the stub's first argument, not by substring".
- **Observed evidence**: `manual:review-v2:5` (`requestJson<Attention>("/api/attention?limit=50")`) passes every test. The helper compares the first argument only up to `?`.
- **Expected evidence/behavior**: Data-health-api §11 gives the request for `/api/attention` and `/api/data-health` as "none".
- **Impact**: Negligible. The production code sends no query, and nothing specified would add one. This is evidence-strength only.
- **Required remediation**: Optional. For the parameterless reads, assert the full first argument, or assert `url.search === ""`.

### IR-004 — T001's check output is still not recorded in the TDD evidence as the plan asks (v1 IR-004)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S1-1 (evidence only)
- **Tasks**: T001, T012
- **Files**: `CAP-003-E3-S1-tdd-evidence.yaml`; `CAP-003-E3-S1-evidence/t001-t012-checks.log`
- **Claim challenged**: T001 says to "Record in the TDD evidence … the output of" the two `git diff --exit-code` commands and the delivered suites.
- **Observed evidence**: The YAML now holds cycle-1 to cycle-4 and EXC-001, but still no T001 record (`grep -in t001` on the YAML finds nothing). The check log is still referenced by nothing. I re-ran every T001 check and all of them pass.
- **Expected evidence/behavior**: The plan's T001 wording.
- **Impact**: Evidence quality only. A reader of the YAML cannot see that DAC-E3-S1-1 was checked.
- **Required remediation**: Optional. Reference the check log from the evidence, or record T001 there with the full commands.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | `shell-client.test.ts:301` adds `["fetchScoreSummary", () => fetchScoreSummary()]` to the Accept/GET `it.each`. `manual:review:17` (POST) and `:18` (`Accept: */*`) are killed in this review's run (exit 1, vitest) |
| v1/IR-002 (HIGH) | RESOLVED | `shell-client.test.ts:571-580` pins every read's resolved type with `toEqualTypeOf`. `manual:review:4`, `:5`, `:6`, `:7` and `:8` are killed (exit 2, `tsc` TS2344) |
| v1/IR-003 (LOW) | RESOLVED | `shell-client.test.ts:281-287` asserts that an empty-string cursor is sent. `manual:review:3` is killed (exit 1) |
| v1/IR-004 (LOW) | STILL OPEN | Carried as IR-004 above |

## Scope and Plan Deviations

- **Review base, and how it relates to DEC-0401.** This review records `review_base` as `cb5a822a`. That is what A.2 prescribes: the supplied integration ref resolves to it, it is an ancestor of HEAD, and the range is not empty. `scripts/integration-branch.py` `report()` also requires `review_base` to equal the integration head for a story reviewed ahead of it.

  v1 used `4c93c6b4` under DEC-0401 (agent, open). DEC-0401 rests on the same ref resolving to HEAD at v1 time, which made v1's range empty. That premise does not hold for v2, and DEC-0401's decision is bounded to v1's range (`4c93c6b4..cb5a822a`). This review therefore applies the skill as written and opens no new decision.

  The story's earlier commits sit below this base and were covered as follows:
  - Their production files were re-read for every AC and task.
  - Their lines were re-mutated as `carried` mutants and through the full-range `generate`.
  - The state engine still sees those paths through v1's `reviewed_paths`, because `story_reviewed_paths` takes the union across versions.
- **Tests-only rework.** The production code is unchanged since the baseline (`git diff cb5a822a HEAD -- web/src/app/shell-client.ts web/src/app/shell-types.ts` is empty). Cycle-4 RED was taken against the v1 survivors applied to production. That is a sound RED for a tests-only rework, and the lint accepts it.
- **Rework commit `cf8e8749`.** The driver committed the v1 report and its mutation results with `Decision-Id: DEC-0401`. These are review artifacts and contain no implementation.
- **Per-cycle commits (T014).** As in v1, each cycle is committed as it ends, carrying its own evidence entry. The plan's "no per-cycle commit" predates that harness change, and the lint accepts it. Justified.
- No out-of-scope file, dependency or refactor. `client.ts` and CAP-002's files are untouched.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync` for CAP-003-E3-S1 against this report)
- **Required action**: Run doc sync. Take the change inventory from the task plan, plus both tables above: this review's `review_base..HEAD` range holds only the tests-only rework, and the story's modules `web/src/app/shell-types.ts` and `web/src/app/shell-client.ts` sit below it. IR-001 to IR-004 are non-blocking warnings, which a later story or an expedited change may pick up.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004
