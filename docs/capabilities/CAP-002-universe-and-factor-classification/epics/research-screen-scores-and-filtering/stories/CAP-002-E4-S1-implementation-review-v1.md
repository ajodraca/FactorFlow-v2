---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
story_id: "CAP-002-E4-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-28T02:36:01Z"
reviewed_head: "f5303415e896703aecfda2a050577d0cd7f69fa4"
review_base: "31359b27afccf009da6efa9a68fea92a498a7aba"
reviewed_state_revision: "sha256:c645ea8fba654d3666594a4eb1a7c29421dfeadbc5502797ee2653670c50a2c9"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E4-S1
    artifact_version: 1
    content_revision: sha256:24ff51d30acc49fd5275697ed7e5d368d9d558845fb0dcafd31c19368f56fe23
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-28T02:36:01Z
  source_artifacts:
    - id: CAP-002-E4-S1
      version: "1 (sha256:24ff51d30acc49fd5275697ed7e5d368d9d558845fb0dcafd31c19368f56fe23)"
    - id: CAP-002-E4-S1-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E4-S1-tdd-evidence
      version: "cycle-1 to cycle-3"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 0 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 14/14 verified |
| Required validation | 8/8 passed |

The change set does what the story and the task plan require. `client.ts` differs
from the base by the `export` keyword alone (`git diff --numstat` `1 1`), and every
delivered web test passes unedited (352 of 352 in 42 files). The two new modules map
every field of every classification-api section 2.7 response by hand, keep decimal
strings and dates as the wire's strings and nulls as null. Every non-2xx answer
reaches the caller as a `ClassificationApiError` carrying code, operation,
normalised resource, reason and `symbols`, all read from envelope fields, never from
`message`. The four mandatory component tests (TC-COMP-130, 131, 182, 183) and the
three additional suites assert observable outcomes with `toStrictEqual` on complete
fixtures. The independent mutation run killed 89 of 91 mutants, 46 of them written
by this reviewer. The 2 survivors change only what the contract leaves open
(`message` prose and the ingestion-only `state` field). One MEDIUM weakness remains:
the public `StockEvidence.factors` type claims all three cells, while the evidence
read can carry `{}` under owner-upheld DEC-0140, and a cast in `toFactorCells` hides
the gap from the compiler. Runtime behaviour is correct and tested, so the finding
blocks no criterion.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0 · **total 1**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S1.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/api/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S1` (ahead of `origin/main` by 1 commit) |
| HEAD | `f5303415e896703aecfda2a050577d0cd7f69fa4` |
| Review base | `origin/main`, merge base `31359b27afccf009da6efa9a68fea92a498a7aba` (from `pipeline-state.py review-base --base-ref origin/main`; ancestor of HEAD) |
| Working tree | clean: no staged, unstaged or untracked files; ignored build output only under `src/factorflow/api/static/` |
| Changed files reviewed | 17 |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/api/client.ts` | modified (1 line) | DAC-E4-S1-1; T008 (DEC-0064, DEC-0086) |
| `web/src/api/classification-types.ts` | added | DAC-E4-S1-3, DAC-E4-S1-4; T009 |
| `web/src/api/classification-client.ts` | added | AC-16, AC-20, AC-22, DAC-E4-3, DAC-E4-S1-2; T010, T011, T013 |
| `web/src/api/classification-client.test.ts` | added | TC-COMP-130, 131, 182, 183; T001 to T007 |
| `.../stories/CAP-002-E4-S1-tasks.md` | modified (14 checkboxes) | T001 to T014 completion state |
| `.../stories/CAP-002-E4-S1.md` | modified (`status: planning` to `in-review`) | story-coding status lifecycle; the content revision still equals the approval's `reviewed_revision` |
| `.../stories/CAP-002-E4-S1-tdd-evidence.yaml` | added | T014 |
| `.../stories/CAP-002-E4-S1-evidence/cycle-1.patch`, `cycle-2.patch`, `cycle-3.patch` | added | T014 (`reviewed_patch` per cycle) |
| `.../stories/CAP-002-E4-S1-evidence/red-cycle-1.log`, `red-cycle-2.log`, `red-cycle-3.log`, `full-suite.log` | added | T014 (RED and GREEN logs) |
| `.../stories/CAP-002-E4-S1-evidence/mutation-cycle-1-results.json`, `-2-`, `-3-` | added | T014 (per-cycle mutation results) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `classification-client.ts:listClassifications` (722-771) sends `universe_id`, `symbols` (one repeated key per entry), `symbol`, `sort`, `order`, the twelve bounds via `BOUND_PARAMS` (230-243), `hide_incomplete` only when true, `limit`, `cursor`; `createUniverse` (598-610) and the universe endpoints (547-703) | `classification-client.test.ts` "request encoding for reads" (934-1136), "request bodies for writes" (1139-1265) | This story's slice of AC-16 is the typed read and write calls. The sort, filter and compare controls belong to later E4 and E5 stories. Repeated-key `symbols` matches CAP-002-E3-S5's plan, which accepts both forms (E3-S5 tasks, Notes "Compare parsing"). |
| AC-20 | SATISFIED | `toLaterSet` (308-321) maps `state`, `failure_reason`, `started_at`, `ended_at`, `run_id`, `run_started_at`; `toCurrentSet` (289-306) maps `not_current`; both reused by the list, summary, evidence and universe reads | TC-COMP-183 "maps a never-classified list and summary with a failed first set and its reason" (869-889), "maps a not-current set beside a later set, and a quiet one" (891-908) | The failure and its reason reach the caller as data |
| AC-22 | SATISFIED | `neverClassified` on `SetState` (`classification-types.ts:78-82`), mapped from `never_classified` on list and summary; refusals become `ClassificationApiError` (`classification-client.ts:407-534`) | TC-COMP-183 (848-889), "keeps never-classified apart from a set that matched nothing" (910-916); TC-COMP-182 (1283-1443) | Never-classified is a distinct value, never an empty list |
| DAC-E4-3 | SATISFIED | `matchCount: body.match_count` (`classification-client.ts:766`); filter inputs sent as query parameters (722-760) | "maps ClassificationListResponse, with matchCount from match_count and not the rows" (548-579): `match_count` 1200 over 2 rows | URL persistence of the screen's state is CAP-002-E4-S2's `research-query.ts`, outside this story |
| DAC-E4-S1-1 | SATISFIED | `git diff origin/main...HEAD -- web/src/api/client.ts`: the one line `async function requestJson<T>(` became `export async function requestJson<T>(` | TC-COMP-130 (47-84); delivered `client.coverage.test.ts` (8), `client.runs.test.ts` (20), `render.test.tsx` (1), `routes.test.tsx` (7), `shell*.test.tsx` all pass unedited in `npm run test` | `--numstat` prints `1	1	web/src/api/client.ts` |
| DAC-E4-S1-2 | SATISFIED | `ClassificationApiError` (407-431), `toClassificationResource` (446-451), `readEnvelope` (454-465), `toSymbols` (467-471), `startCapturingErrorResponse` (485-505), `request` (512-534); `message` is never parsed | TC-COMP-182 (1283-1443) with a `message` that contradicts every asserted field; edge cases (1446-1591) | Operation is the client's own identifier and reason is the envelope `code` (DEC-0143, owner-upheld) |
| DAC-E4-S1-3 | SATISFIED | `SetState` (`classification-types.ts:78-82`), extended by `ClassificationList` (92-100) and `ClassificationSummary` (108-111) | TC-COMP-183 `expectTypeOf` (835-844), type-checked by `npx tsc --noEmit` (a reviewer type mutant giving the summary's `later` an `undefined` member failed `tsc` with TS2344 at lines 837 and 838); runtime cases (848-908) | |
| DAC-E4-S1-4 | SATISFIED | Every wire field of the section 2.7 responses has a camelCase counterpart in `classification-types.ts` and a hand mapping in `classification-client.ts`; scores, percentiles, input values and dates are `string`, never `Date` | TC-COMP-131 (377-830): one fixture per response compared with `toStrictEqual`, plus `typeof` string, trailing zeros and null-stays-null assertions | IR-001: the evidence read's `factors` type is wider than the wire it maps |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `classification-client.test.ts:47-84` | All four planned assertions present; RED log shows 4 of 4 failed before the export |
| T002 | complete | VERIFIED | `classification-client.test.ts:377-830` | All twelve response shapes; `by_hand` and `from_filter` origins (five nulls; `thresholds` keys kept, `not.toHaveProperty("valuePercentileMin")`); `factors: null` / `name: null` member; `missing` input row; nested snake_case `detail` and `filter_provenance` `toStrictEqual`; building `SetResponse` nulls; DEC-0140 empty evidence |
| T003 | complete | VERIFIED | `classification-client.test.ts:1283-1443` | Every planned case, including the `classifications` and `universes` path-segment resources normalised to `classification` and `universe` |
| T004 | complete | VERIFIED | `classification-client.test.ts:834-917` | `expectTypeOf` on `later`, `set` and `neverClassified`; building, failed, not-current and quiet shapes on both reads |
| T005 | complete | VERIFIED | `classification-client.test.ts:934-1136` | Twelve distinct bound values, present-only parameters, `hide_incomplete` only when true, repeated `symbols`, encoded path segments (`u%2F1`, `A%2FB`, `BRK.B`, `s%2F1`), `Accept` header |
| T006 | complete | VERIFIED | `classification-client.test.ts:1139-1265` | By hand, from a result with all twelve bounds, `symbol: null` and `hide_incomplete: false`; PATCH, DELETE (no body, no Content-Type), members POST and DELETE |
| T007 | complete | VERIFIED | `classification-client.test.ts:1446-1591` | Non-JSON, non-envelope, `null` and string `error` bodies; non-list `symbols`; failed fetch and non-JSON 200 stay `ApiUnreachableError`; the global is restored before the call settles; two concurrent failures with different `ClassificationResource` values keep their own envelopes |
| T008 | complete | VERIFIED | `web/src/api/client.ts:154` | One-keyword diff |
| T009 | complete | VERIFIED | `web/src/api/classification-types.ts` | Field-by-field nullability matches the plan's list. `ClassificationListParams` is all-optional and does not extend `Thresholds` (Open Gap 7). `ClassificationResource` is exactly the four values. No `Date`, no `ScreenState`. See IR-001 for `StockEvidence.factors` |
| T010 | complete | VERIFIED | `classification-client.ts:396-534` | `ClassificationApiError extends ApiError`. `request` keeps `ApiUnreachableError` untouched. The fetch swap is installed only for the synchronous start of `requestJson` and restored in `finally` before any `await`. `resource` is normalised. `symbols` is `[]` when absent |
| T011 | complete | VERIFIED | `classification-client.ts:536-875` | 14 endpoint functions with the planned operation and resource per function (asserted in "names each function's own operation and resource", 1416-1442); shared `SetBlock`, `LaterBlock`, `FactorCellResponse` and factor-summary mappers; `factors: null` member never reaches `toFactorCells` (348); pass-through `thresholds`, `detail`, `filter_provenance` |
| T012 | complete | VERIFIED | `npm run test` 352/352; `git diff --numstat` `1 1`; no importer of the new modules outside their own test | The change set also holds the story status line and the `-evidence/` directory, which the T012 list omits (see Scope and Plan Deviations) |
| T013 | complete | VERIFIED | `npm run format`, `npm run lint`, `npx tsc --noEmit`, `npm run build` all exit 0; doc comments name endpoint and AC on every exported function | |
| T014 | complete | VERIFIED | `CAP-002-E4-S1-tdd-evidence.yaml` (3 cycles, each `code_review_verdict: APPROVED`, `drift_detected: false`, `tests_executed: true`, `commit_hash: stage`); `check-tdd-evidence.py --require-logs` 0 errors, 0 warnings | `cycle-2.patch` holds no `ClassificationApiError` (0 occurrences), as the plan requires |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-130 "requestJson is exported unchanged" (47-84) | ADEQUATE | Calls the real exported `requestJson` against a stubbed `fetch`: 200 body returned `toEqual`, 404 envelope gives `ApiError` with `code` and `requestId`, a rejected fetch gives `ApiUnreachableError`. "Delivered tests still pass" is proven by the unedited suite run | none |
| TC-COMP-131 "every response field has a typed counterpart" (377-830) | ADEQUATE | Each of the twelve response shapes is mapped through its client function and compared with `toStrictEqual` against a complete expected object, so a dropped, renamed, defaulted or extra key fails. Fixture values are chosen distinct, e.g. `latest_trading_day` differs from `classification_date` and `started_at` from `run_started_at`, so field swaps fail too. All 27 reviewer mapping mutants (swaps, `?? false`, `?? {}`, `?? ""`, constant substitutions) were killed | none |
| TC-COMP-182 "surfaces code, operation, resource and reason" (1283-1443) | ADEQUATE | Real `request` path with misleading prose; asserts `code`, `reason`, `resource`, `operation`, `requestId`, `symbols`, class identity; both branches of resource normalisation; all 14 operation/resource pairs; the constructor's defaults | none |
| TC-COMP-183 "neverClassified, set and later are one shape" (834-917) | ADEQUATE | `expectTypeOf` assertions are type-checked by `tsc` (shown by the reviewer's type mutant); runtime cases on both reads for building, failed, not-current and quiet; never-classified kept apart from zero matches | none |
| Request encoding for reads (934-1136) | ADEQUATE | Exact URL strings or sorted entry lists; twelve distinct bound values kill any bound-name swap; repeated `symbols` asserted by exact URL | Parameter order is not pinned, and no artifact fixes it |
| Request bodies for writes (1139-1265) | ADEQUATE | Parsed JSON body `toStrictEqual`, method, `Content-Type` present or absent | none |
| Error-path edge cases (1446-1591) | ADEQUATE | Degraded bodies; ApiUnreachableError paths; restoration asserted while the call is still in flight; concurrency with a held first fetch. The reviewer mutants that share the capture through a global, restore on settle, never restore, or capture only 5xx were all killed | none |

Isolation and determinism: every test stubs `fetch` itself and `afterEach` calls
`vi.unstubAllGlobals()`. No timers, clock, network or environment dependence. The
concurrency test orders the two responses with an explicit promise, not with time.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/api/classification-client.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1 file, 55 passed |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 42 files, 352 tests passed, delivered client, render, routes and shell tests included |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Checked 100 files ... No fixes applied." The sandbox printed "failed to copy trust settings of system certificate" lines that are not Biome output |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Checked 100 files ... No fixes applied." |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No diagnostics; `tsconfig.json` includes `web/src`, so the `expectTypeOf` assertions are checked |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules, built into ignored `src/factorflow/api/static/` |
| `git diff --numstat origin/main...HEAD -- web/src/api/client.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `1	1	web/src/api/client.ts`; the diff changes only the `export` keyword |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 31359b27afccf009da6efa9a68fea92a498a7aba --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. In the sandbox the first run failed with `TDD-LINT-DIFF ... unable to create temporary file: Operation not permitted`. The same plain command run outside the sandbox passed |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 31359b27afccf009da6efa9a68fea92a498a7aba..HEAD --cycle review --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-factorflow-v2-cap-002-e4-49f4f9/c761c333-5a31-48fb-940a-231d21c5d8e8/scratchpad/mut/mutants.json` plus 46 reviewer mutants (`"operator": "manual"`); `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-factorflow-v2-cap-002-e4-49f4f9/c761c333-5a31-48fb-940a-231d21c5d8e8/scratchpad/mut/mutants.json --jobs 4 --command 'test -e node_modules \|\| ln -s /Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/pipeline-factorflow-v2-cap-002-e4-49f4f9/repos/factorflow-v2/FactorFlow-v2/node_modules node_modules; ./node_modules/.bin/vitest run src/api/classification-client.test.ts' --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-factorflow-v2-cap-002-e4-49f4f9/c761c333-5a31-48fb-940a-231d21c5d8e8/scratchpad/mut/results.json` | harness root | 0 | PASS | 91 mutants, 89 killed, 2 survived (both equivalent, below), 0 stillborn, 0 timeout; 4 baselines green. Results: `CAP-002-E4-S1-implementation-review-v1-mutation.json` |
| `npm run test:e2e` | — | N/A | NOT RUN | The task plan's Validation Plan excludes it ("no screen exists"), and the story's Technical Details list only the five commands above. The change adds no screen and alters no delivered behaviour, and no Playwright spec imports the new modules |
| `uv run pytest`, `uv run ruff ...`, `uv run mypy src`, `uv build` | — | N/A | NOT RUN | Not applicable: the change set touches no Python source, test or configuration |

**Mutation detail.** The catalogue generated 45 mutants: 39 `drop-field-copy`, 5
`negate-boolean` and 1 `swap-case`, all in `classification-client.ts`. Its
`drop-field-copy` operator substitutes `nil`, an undeclared identifier in TypeScript,
so those mutants die by `ReferenceError` whenever the line runs. The 46 reviewer
mutants make up for that with plausible wrong values:

- field swaps (`score` from `percentile`, `knownOn` from `as_of`, `latestTradingDay`
  from `classification_date`, membership `universeId` from `name`);
- null coalescing (`?? false`, `?? {}`, `?? ""`, `?? 0`, `retiredAt ?? created_at`);
- constant substitutions (`minPeerSetSize: 30`, `notCurrent: false`,
  `restatedPossible: false`, `matchCount: stocks.length`);
- request-encoding changes (`set` in place of `append`, `hide_incomplete` whenever
  defined, `symbol: null` omitted, `Content-Type` removed, `?` always appended,
  `lifecycle=all` dropped, `setId` and `asOf` camelCase on the wire);
- error-path changes (resource passthrough, envelope ignored, capture of 5xx only,
  `symbols` accepting any array, `reason` defaulted, capture shared through a global,
  restore on settle, no restore).

Survivors, both judged equivalent against the contract:

- `manual:review:message-generic` (line 526) replaces `caught.message` with a fixed
  string. Classification-ui section 2.4 says "`ApiError` is read by `code` only;
  `message` is never rendered". Classification-api section 2.5 says the interface
  "never shows `message` raw" and that "the code is the contract". The wording of
  `message` is left open.
- `manual:review:state-null` (line 528) replaces `caught.state` with `null`. The
  CAP-002 envelope of classification-api section 2.5 is
  `{code, message, resource, request_id}` plus `symbols`, and no CAP-002 code carries
  `state`. `ApiError.state` exists only for ingestion-api's `run_already_terminal`
  (`client.ts`, `ApiError` doc comment), so `state` is always null on every
  classification endpoint.

### Validation Side Effects

- Before: HEAD `f5303415e896703aecfda2a050577d0cd7f69fa4`, `git status --porcelain --untracked-files=all` empty; ignored `src/factorflow/api/static/` build output present; `code-revision` `sha256:c645ea8fba654d3666594a4eb1a7c29421dfeadbc5502797ee2653670c50a2c9`.
- After: HEAD unchanged, porcelain status empty, the same ignored static files (rebuilt), `code-revision` unchanged (`sha256:c645ea8f...a2c9`). Mutants ran in clones under the scratchpad, never in the component repository.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Title |
|----|----------|-------|
| IR-001 | MEDIUM | `StockEvidence.factors` declares three cells the evidence read may not carry |

### IR-001 — `StockEvidence.factors` declares three cells the evidence read may not carry

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S1-4 (precision of the typed counterpart; runtime mapping satisfies it)
- **Tasks**: T009, T011
- **Files**: `web/src/api/classification-types.ts:140-141` (`StockEvidence.factors: Record<FactorName, FactorCell>`); `web/src/api/classification-client.ts:262-271` (`toFactorCells` builds a `Partial<Record<FactorName, FactorCell>>` and returns it `as Record<FactorName, FactorCell>`)
- **Claim challenged**: T009 asks for public types that mirror the wire field for field. Resolved Conflict 1 of the task plan says the API contract outranks an illustrative design snippet.
- **Observed evidence**: DEC-0140 (owner-upheld 2026-10-18) fixes that the evidence read emits `factors` as `{}` for a stock with no stored rows. It says "the UI type's Record for evidence should accommodate it at its next revision". The implementation handles that case at runtime and tests it ("maps a StockEvidenceResponse with no set and no cells (DEC-0140)", test lines 676-697). The doc comment on the field also says "`{}` when the stock has none". Yet the declared type still promises `value`, `growth` and `momentum`, and the cast in `toFactorCells` stops `tsc` from reporting the difference.
- **Expected evidence/behavior**: The public type of `StockEvidence.factors` admits the absent cells the wire can carry, for example `Partial<Record<FactorName, FactorCell>>`. Alternatively a recorded decision keeps the full `Record` and says why. Either way the type and its own doc comment agree.
- **Impact**: A consumer that trusts the static type, such as `evidence.factors.value.status`, compiles cleanly and throws `TypeError` on a stock FactorFlow began following after the current set was built, or on any evidence read before the first set. The CAP-002-E5-S1 and E5-S3 plans already check this at runtime (E5-S3 Open Gap 8, "checked at runtime"), so no planned consumer is known to break. The compiler still offers no protection on the seam later stories build on.
- **Required remediation**: Make the `StockEvidence.factors` type admit absent factors without disturbing the list, history and universe-member types, which section 2.7 gives all three cells. Remove the cast's effect on the evidence path. Pin the type with a `tsc`-checked assertion. Or record the decision to keep the current type.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T012 file list (justified).** T012 expects `git diff --stat` to show only four
  source files, the `-tasks.md` and the `-tdd-evidence.yaml`. The change set also
  holds two further items:
  - the story's `status: planning` to `in-review`, the story-coding skill's lifecycle
    step. The story's content revision still equals its approval's
    `reviewed_revision`.
  - ten files under `CAP-002-E4-S1-evidence/`: the RED logs, patches, full-suite log
    and per-cycle mutation results that the TDD evidence cites, which
    `--require-logs` requires to exist.

  No unjustified file is in the change set.
- **Supporting types beyond T009's list (justified).** `SetState`, `ThresholdBounds`,
  `StocksCurrent`, `InputStatus`, `UniverseMember`, `UniverseEventType`, `Lifecycle`,
  `RunOutcome`, `ClassificationSort`, `CreateUniverseByHand`,
  `CreateUniverseFromFilter` and `CreateUniverseRequest` factor the planned types.
  `SetState` is how DAC-E4-S1-3's "written once and reused" is met.
  `UniverseListParams` is declared in `classification-client.ts` rather than the
  types module. Harmless; no importer exists yet.
- **Bookkeeping.** The task plan header names branch `usr/alvaro-de-jodra/CAP-002-E4-tasks` (the planning branch); the coding branch is `usr/alvaro-de-jodra/CAP-002-E4-S1`. Informational only.
- **No new decision** was recorded by the coder or by this review.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E4-S1 against HEAD `f5303415e896703aecfda2a050577d0cd7f69fa4`. IR-001 may be taken up by the Coding Agent in a later rework or by the next revision of classification-ui section 2.4, which DEC-0140 already names.
- **Warnings accepted downstream**: IR-001
