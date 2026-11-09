---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-09
updated: 2026-11-09
story_id: "CAP-003-E8-S3"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S3.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-09T02:52:33Z"
reviewed_head: "99f6dfca97097a556a811d3d4452fe683973b3fe"
review_base: "52ecfbd0f4cc51cbfaac0899158811a11dce7d41"
reviewed_state_revision: "sha256:64efec1623e2ddf5d4d90b8c6931e9971d757408b319485fbc3a29d76bc4991f"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-003-E8-S3
    artifact_version: 1
    content_revision: sha256:77ff998f861e69b39d5f51719666ca7f7b979ecf052a71d6bb1da6b8052e3c8b
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-09T02:52:33Z
  source_artifacts:
    - id: CAP-003-E8-S3
      version: "1 (sha256:77ff998f861e69b39d5f51719666ca7f7b979ecf052a71d6bb1da6b8052e3c8b)"
    - id: CAP-003-E8-S3-tasks
      version: "1 (updated 2026-11-08)"
    - id: CAP-003-E8-S3-tdd-evidence
      version: "cycle-1, cycle-2, cycle-3"
    - id: CAP-003-E8
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-component-design-massive-client
      version: "1"
    - id: CAP-003-component-design-rate-limit-governor
      version: "1"
    - id: CAP-003-massive-client-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "2"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E8-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 15/15 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 11/12 passed (the E.9 mutation gate failed: 3 survivors) |

Findings: CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2 · **total 3**

| Finding | Severity | Scope | Status |
|---------|----------|-------|--------|
| IR-001 | HIGH | initial | OPEN |
| IR-002 | LOW | initial | OPEN |
| IR-003 | LOW | initial | OPEN |

The production change is correct and matches massive-client CAP-003 §2.3 and §2.6
line for line. `classify_for_governor` (`client.py:67-81`) is the design's four rules in
order. `_through_governor` passes it positionally and keeps the `except BadResponse`
re-raise. `start_instrument()` makes the one governor call. The SDK construction is
unchanged.

Independent probes ran through the unpatched SDK and urllib3 path:
- A real `429` is `THROTTLED`. This holds with a `Retry-After` header, on a followed page,
  and across the financial endpoints of one stock.
- `413`, `499`, `500`, `502`, `504`, `503` and the refused redirect stay `RETRYABLE`.
  Each takes three requests to `api.massive.com`.

The plan's commands and the TDD-evidence lint pass. `tests/unit/test_massive_redirects.py`,
`uv.lock` and `pyproject.toml` are unchanged.

The gate fails on E.9 of the skill. Three non-equivalent mutants survive on
`client.py:73`, the text comparison in rule 1. Each loosens the `==` that the story,
DAC-E8-2 and design §2.3 rule 1 specify:
- `str(exc.reason).endswith(...)`
- `str(exc.reason).strip() == ...`
- a case-folded comparison

No TC-COMP-248 row varies the 429 text with a prefix, padding or a different case. The
row that pins the exact text covers only a trailing suffix. That makes the mandatory test
TC-COMP-248 `WEAK`, which is HIGH (IR-001). The two LOW findings are evidence and guard
gaps that do not block.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S3.md` (status `in-review`; `artifact-gate.py revision` = `sha256:77ff998f…3c8b`, the approved `reviewed_revision`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S3-tasks.md` (T001–T017 all checked) |
| Component | `FactorFlow-v2` (project repo == component repo) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E8-S3` |
| HEAD | `99f6dfca97097a556a811d3d4452fe683973b3fe` (one story commit over the base) |
| Review base | `52ecfbd0f4cc51cbfaac0899158811a11dce7d41`, the CAP-003-E8-S2 tip. It is local only and was supplied by the invoker. `pipeline-state.py review-base --base-ref 52ecfbd` resolves it, and it is an ancestor of HEAD (`git merge-base --is-ancestor` exit 0). The merge-base with the remote default branch is not used, because it would sweep in the unpushed E8-S1/E8-S2 chain. |
| Working tree | clean before validation (`git status --porcelain --untracked-files=all` empty) |
| Changed files reviewed | 31 (`git diff --stat 52ecfbd..HEAD`) |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review --base-ref 52ecfbd` returned
`READY — story is ready for independent review`. Without `--base-ref` it returned
`BLOCKED`. Story-coding then resumes on a TDD-evidence lint taken against the remote
default branch, which names E8-S2's commit `57d2332`. That is a wrong base, not a defect
of this story.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/massive/client.py` | modified | AC-30, AC-29, DAC-E8-2, DAC-E8-3, DAC-E8-7; T013, T014, T015, T016 |
| `tests/unit/test_massive_retry.py` | modified | DAC-E8-S3-1 to -7, -9, DAC-E8-20; T003–T012 |
| `tests/unit/test_massive_client_governor_integration.py` | modified | DAC-E8-S3-8; T002 |
| `tests/unit/test_massive_client_interface.py` | modified | Not in the plan's file list. Forced by design §2.6 and §11, which make `start_instrument` public; recorded as cycle-3. Justified deviation, IR-002 |
| `docs/.../stories/CAP-003-E8-S3.md` | modified | status `planning` → `in-review` only (word diff) |
| `docs/.../stories/CAP-003-E8-S3-tasks.md` | modified | 17 checkboxes `[ ]` → `[x]` only (word diff) |
| `docs/.../stories/CAP-003-E8-S3-tdd-evidence.yaml` | added | T017 |
| `docs/.../stories/CAP-003-E8-S3-evidence/` (24 files: 3 cycle patches, RED/GREEN logs, 5 mutation results, code-review and spec-drift records, final-validation.log) | added | T017 evidence |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-30 | SATISFIED | `client.py:70-75` (rule 1 → `THROTTLED`), `:328` (`execute(send, classify_for_governor)`), `:100-105` (`start_instrument`); E8-S2's budget check, `rate_limit.py:176-182` | `test_rate_limited_responses_are_paced_without_consuming_attempts`, `test_a_persistent_real_429_spends_exactly_the_300_s_budget_and_raises_rate_limited`, `test_a_spent_budget_fails_…`, `test_jitter_never_takes_…` | Five real 429s and then a 200 return data after 6 requests. A persistent 429 raises `ProviderRateLimited` with a `[rate_limited]` reason. The reviewer's probes confirm the same for a 429 carrying `Retry-After`, a 429 on a followed page, and 429s across the `fetch_financials` endpoints (6 requests and 300 s, then the next data type fails after one request). |
| AC-29 | SATISFIED | `client.py:80-81` (rule 4), `:329-330` (kept `except BadResponse` re-raise) | `test_a_real_403_plan_refusal_is_sent_once_and_waits_nothing` (S1, re-marked TC-COMP-249), `test_a_fatal_bad_response_is_raised_typed_from_the_one_response` | A plan refusal is sent once through the lifted classifier. Mutants `rule4-swapped`, `reraise-bare` and `reraise-from-none` are killed. |
| DAC-E8-2 | SATISFIED | `client.py:64` (`_THROTTLED_RETRY_REASON` from urllib3's constant), `:70-77` | TC-COMP-243; TC-COMP-247 (302 and 503: three requests to `api.massive.com`, none to `198.51.100.7`); TC-COMP-248 rows | The production comparison is `==`, as specified. The test pinning that equality is WEAK (IR-001). `test_massive_redirects.py` is unchanged and passes. |
| DAC-E8-3 | SATISFIED | `client.py:80-81` | `test_an_unrecognised_403_is_still_retried_to_the_limit_as_unavailable`, `test_timeouts_and_server_errors_retry_to_the_attempt_limit[server-error]`, TC-COMP-248 `unknown-shape-body-is-retryable` | Three requests, then `ProviderUnavailable`. |
| DAC-E8-7 | SATISFIED | `client.py:100-105` | `test_start_instrument_starts_the_governor_budget_once_and_sends_nothing`, TC-COMP-245 | Mutants `pass`, a second call and an uncalled attribute are all killed. |
| DAC-E8-20 | SATISFIED | n/a (test harness) | Every 429/403 row uses `_production_settings`, `_real_transport_client` (`from_massive_settings`, one `FakeClock` as both `monotonic` and `now`), `forbid_sockets` and `RecordingMakeRequest`; TC-COMP-251 (c) | The patched-`RESTClient` 429 test is deleted (`git diff`). The one `BadResponse`-for-a-429 row is the direct classifier call DAC-E8-S3-6 allows. |
| DAC-E8-S3-1 | SATISFIED | as AC-30 | `test_massive_retry.py:331`, markers `TC-INT-025` and `CAP-003 TC-COMP-243` | Asserts `cik`, 6 requests, `sleeper.calls == [60.0]*5` and no exception. |
| DAC-E8-S3-2 | SATISFIED | as AC-30 | `:362` | Asserts `isinstance ProviderUnavailable`, `provider_request_id is None`, a `MaxRetryError` `__cause__`, 6 requests, `[60.0]*5`, a sum of 300.0 and the literal `[rate_limited] … request_id=unavailable: ` prefix. |
| DAC-E8-S3-3 | SATISFIED | `client.py:100-105` | `:395` | One extra request, on `/v2/aggs/ticker/AAPL`, and no sleep. After `start_instrument()`, `[60.0]*5` again and 13 requests in total. |
| DAC-E8-S3-4 | SATISFIED | as AC-30 | `:433` | Asserts `sum <= 300` and `sum + next_delay > 300`, with `next_delay` computed independently from the clock, and requests = sleeps + 1. |
| DAC-E8-S3-5 | SATISFIED | `client.py:76-77` (rule 2) | `:472` (parametrised 302/503); `tests/unit/test_massive_redirects.py` unchanged (`git diff --exit-code 52ecfbd HEAD` exit 0) and passing | Mutant `sdk-retries-default` (`retries=3`) is killed. |
| DAC-E8-S3-6 | SATISFIED | `client.py:67-81` | `:508-618` (all five specified rows present, plus implementation-level rows) | The specified rows pass at HEAD and fail on the base (RED reproduced). The test's coverage of rule 1's equality is WEAK (IR-001). |
| DAC-E8-S3-7 | SATISFIED | `client.py:326-330` | `:244`, `:298`, `:115` | `git diff` adds only `# Implements CAP-003 TC-COMP-249` lines to these three functions. They pass on the base and at HEAD. |
| DAC-E8-S3-8 | SATISFIED | `client.py:100-105` | `test_massive_client_governor_integration.py:216` | `assert_called_once_with()`, `execute.call_count == 0`, `method_calls == [call.start_throttle_budget()]`, no request, no socket. |
| DAC-E8-S3-9 | SATISFIED | `client.py:43` (`from urllib3.exceptions import MaxRetryError, ResponseError`) | `:695` (ast checks a–d) | `uv.lock` and `pyproject.toml` are unchanged (urllib3 2.7.0 and massive 2.8.0 locked). The reviewer's grep finds no patched-`RESTClient` 429 and no read of the governor's `attempts` in `tests/`. The only `["attempts"]` there is `tests/integration/test_run_constraints.py:50`, a DB column. The guard reaches less than its spec (IR-003). |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At `52ecfbd`: `errors.py:109` `ProviderRateLimited`, `:124` `ProviderNotEntitled`, `:292-293` kinds; `rate_limit.py:124` `start_throttle_budget` | Baseline recorded in the evidence header (56 passed) |
| T002 | complete | VERIFIED | `test_massive_client_governor_integration.py:215-240` | Marker prefixed `CAP-003` (justified); one extra assertion, `method_calls`. RED reproduced: `AttributeError` |
| T003 | complete | VERIFIED | Module docstring `:1-23`; `_real_transport_client(..., jitter=(0.0,))` `:157-175`; `_answer_429` `:192-213` | Reuses S1's harness; no second set |
| T004 | complete | VERIFIED | `:329-358` | Replaces the patched test, keeping its name and `TC-INT-025` marker; the now-dead `_FakeResponse` was removed with it |
| T005 | complete | VERIFIED | `:361-391` | — |
| T006 | complete | VERIFIED | `:394-429` | — |
| T007 | complete | VERIFIED | `:432-455` | — |
| T008 | complete | VERIFIED | `:458-497` | Passes on the base, as the planned regression guard |
| T009 | complete | VERIFIED | `:508-547`, `:607-618` | The planned rows are present. Mutation coverage of rule 1's equality is incomplete (IR-001) |
| T010 | complete | VERIFIED | `:114`, `:243`, `:297` | Marker lines only |
| T011 | complete | VERIFIED | `:658-762` | As the plan words it; reaches less than TC-COMP-251 (IR-003) |
| T012 | complete | VERIFIED | `:548-566` | The planned kills are confirmed (`drop-responseerror-conjunct`, `rule4-swapped`) |
| T013 | complete | VERIFIED | `client.py:100-105` | Docstring and body as the design gives them |
| T014 | complete | VERIFIED | `client.py:43`, `:57`, `:61-81` | Identical to the listing in design §2.3 |
| T015 | complete | VERIFIED | `client.py:326-330` | Positional argument; the re-raise is kept with the design's comment |
| T016 | complete | VERIFIED | `client.py:23-29`; this review re-ran the final validation | — |
| T017 | complete | VERIFIED | `CAP-003-E8-S3-tdd-evidence.yaml` (3 cycles, `commit_hash: stage`) | `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_rate_limited_responses_are_paced_without_consuming_attempts` / TC-COMP-243 (TC-INT-025) | ADEQUATE | Real transport. The literal `[60.0]*5` sleep list separates a boundary wait from a jitter-0 backoff, and the request paths are asserted. Kills `rule1-returns-retryable`, `execute-old-closure` and `sdk-retries-default`. | none |
| `test_a_persistent_real_429_spends_exactly_the_300_s_budget_and_raises_rate_limited` / TC-COMP-244 | ADEQUATE | Asserts the exact type, cause, request id, count, sleep list, sum and reason prefix | none |
| `test_a_spent_budget_fails_the_stocks_next_read_after_one_request_until_the_next_stock` / TC-COMP-245 | ADEQUATE | Repeats TC-COMP-244's arrange, so it does not depend on test order. Kills `start-instrument-pass` and `-uncalled`. | none |
| `test_jitter_never_takes_the_real_transport_budget_past_300_s` / TC-COMP-246 | ADEQUATE | Both inequalities hold, with the declined delay computed independently; requests = sleeps + 1 | none |
| `test_a_refused_redirect_and_a_forcelisted_503_stay_retryable_and_reach_no_other_host` / TC-COMP-247 | ADEQUATE | Asserts the host of every request and `[0.0, 0.0]` backoffs. Kills `rule2-returns-throttled`, `rule1-any-status-text` and `sdk-retries-default`. | none |
| `test_classify_for_governor_matches_only_urllib3s_429_constant_and_still_throttles_the_body` / TC-COMP-248 | **WEAK** | 17 rows, built from urllib3's constant and never from the module's, so the comparison is not symmetric. Kills the type-conjunct, ordering, substring, prefix and status-widening mutants. | Rule 1's `==` is pinned only against a suffix (`" via a proxy"`). The `endswith`, `.strip()` and `casefold()` mutants of `client.py:73` survive (IR-001) |
| TC-COMP-249 (re-marked `test_a_real_403_plan_refusal_…`, `test_an_unrecognised_403_…`, `test_timeouts_and_server_errors_…`) | ADEQUATE | Bodies unchanged; green through the lifted classifier. Kills `rule4-swapped` and `rule2-returns-fatal`. | none |
| `test_start_instrument_starts_the_governor_budget_once_and_sends_nothing` / TC-COMP-250 | ADEQUATE | A real client with production settings and a spec'd spy governor. Asserts the exact call list, no permit, no request and no socket. | none |
| `test_the_429_change_adds_no_package_and_no_test_fakes_a_429_or_reads_attempts` / TC-COMP-251 | ADEQUATE | `ast`-based, so it cannot match itself. Kills `hand-typed-reason`, the behaviourally equivalent mutant. | Reaches less than its spec (IR-003, LOW) |
| `test_classify_for_governor_is_part_of_the_client_modules_interface` (implementation-level, T014) | ADEQUATE | Kills `all-drops-classifier` | none |
| `test_a_fatal_bad_response_is_raised_typed_from_the_one_response` (implementation-level, T015) | ADEQUATE | Real-transport 404. Asserts the exact type, `request_id`, a `BadResponse` `__cause__`, one request and no sleep. Kills `reraise-bare` and `reraise-from-none`. | none |
| `test_exposes_exactly_the_four_named_read_operations` (CAP-001 TC-COMP-195, edited) | ADEQUATE | The exact-set comparison is kept, so any other new public member still fails the test | none |

RED was reproduced independently in a `git archive HEAD` copy with `client.py` taken from
`52ecfbd`. The story's test files gave 24 failed, 22 passed:
- T004–T007 fail with `ProviderUnavailable: The provider failed 3 consecutive attempts.`,
  the production F1 symptom.
- TC-COMP-248's rows, T002 and TC-COMP-251 fail.
- TC-COMP-247 and the TC-COMP-249 rows pass, as the planned regression guards.

## Independent Validation

Harness root: `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/cool-blackburn-2ab918`.
Repo: `<harness>/repos/factorflow-v2/FactorFlow-v2`. `<venv-python>` is
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin/python`
(Python 3.13.7), because this clone has no venv. The `uv run --isolated --offline --all-extras --locked`
commands use Python 3.12.14, the tech stack's version.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness | 0 | PASS | 8/8 checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref 52ecfbd` | harness | 0 | PASS | `READY`. Without `--base-ref` it returns `BLOCKED`, a wrong default base (see Review Subject) |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 52ecfbd --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness | 0 | PASS | 0 errors, 0 warnings |
| `<venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q tests/unit/test_massive_retry.py tests/unit/test_massive_client_governor_integration.py tests/unit/test_massive_redirects.py tests/unit/test_massive_error_classification.py` (the plan's focused command) | repo | 0 | PASS | 81 passed |
| same, plus `tests/unit/test_massive_client_interface.py` | repo | 0 | PASS | 87 passed |
| `uv run --directory <repo> --isolated --offline --all-extras --locked pytest -q -p no:cacheprovider` (full suite, `postgres` included, outside the sandbox) | repo | 0 | PASS | 2686 passed, 2 warnings in 1385.63s. Both warnings were already present: the `StarletteDeprecationWarning` from `fastapi/testclient.py` and the anyio `BlockingPortal` alias. The `postgres` tests ran in a testcontainers `postgres:16` on a random port, which was removed afterwards. The production compose project `factorflow` was untouched |
| `uv run --directory <repo> --isolated --offline --all-extras --locked ruff check .` | repo | 0 | PASS | All checks passed |
| `uv run --directory <repo> --isolated --offline --all-extras --locked ruff format --check .` | repo | 0 | PASS | 285 files already formatted |
| `uv run --directory <repo> --isolated --offline --all-extras --locked mypy src` | repo | 0 | PASS | No issues in 61 source files |
| `uv build --directory <repo> --offline --out-dir <scratchpad>/dist` | repo | 0 | PASS | sdist and wheel `factorflow-0.2.0` built outside the repo |
| `git diff --exit-code 52ecfbd HEAD -- tests/unit/test_massive_redirects.py uv.lock pyproject.toml` | repo | 0 | PASS | DAC-E8-S3-5 and DAC-E8-S3-9: no edit, no package added |
| `grep -n "urllib3.exceptions" src/factorflow/ingestion/massive/client.py`, plus a read of the `RESTClient(...)` block in the diff | repo | 0 | PASS | One import, at `:43`. The construction block (`retries=0`, `pagination=False`, `trace=False`, `base=`) has no hunk |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 52ecfbd..HEAD --cycle review --out <scratchpad>/mut/mutants.json`, plus 30 reviewer `manual` mutants | harness | 0 | PASS | 3 generated (off-by-one `:64`; negate-boolean `:73` and `:76`) and 30 manual |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <mutants.json> --jobs 4 --timeout 900 --command "<venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q -x tests/unit/test_massive_retry.py tests/unit/test_massive_client_governor_integration.py tests/unit/test_massive_client_interface.py -k 'not test_timeouts_and_server_errors_retry_to_the_attempt_limit' && <venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q tests/unit/test_massive_retry.py tests/unit/test_massive_client_governor_integration.py tests/unit/test_massive_redirects.py tests/unit/test_massive_error_classification.py tests/unit/test_massive_client_interface.py" --out <scratchpad>/mut/results.json` | harness | 3 | **FAIL** | 33 mutants: 30 killed, **3 survived** (`review-rule1-endswith`, `review-rule1-strip`, `review-rule1-casefold`). All 4 baselines exited 0. Copied as `CAP-003-E8-S3-implementation-review-v1-mutation.json` |
| Reviewer probes (`<scratchpad>/probe/test_probe_e8s3.py`, outside the repo, `--rootdir=.`) | repo | 0 | PASS | 8 passed; details below the table |
| RED reproduction (`git archive HEAD` copy, `client.py` from `52ecfbd`) | scratchpad | 1 | PASS (expected RED) | 24 failed, 22 passed, as above |
| Frontend `npm`/`npx` commands (tech stack) | — | N/A | NOT RUN | The story touches no frontend file, and the plan lists none |
| `uv sync --all-extras` | — | N/A | NOT RUN | It would modify an environment. `uv run --isolated --locked` resolves the same lock without one |

The reviewer probes checked four things:
- A 429 with `Retry-After: 5` still gets the two boundary waits `[60.0, 60.0]`.
- 413, 499, 500, 502 and 504, through real transport, each give 3 requests, waits of
  `[0.0, 0.0]`, a reason `too many <status> error responses`, and no `ProviderRateLimited`.
- A 429 on a followed `next_url` page is throttled.
- The budget spans the endpoints of `fetch_financials`, and `fetch_corporate_actions`
  then fails after one request.

The mutation command runs in two stages. The delivered TC-INT-026 governor (`_governor()`,
`test_massive_retry.py:83-94`) and the redirect rows run on the real clock with a no-op
sleep. Under an "everything is `THROTTLED`" mutant they spin until 300 real seconds of
throttle are charged. Stage 1 fails fast on the story's `FakeClock` rows. Stage 2 runs
every focused file for any mutant that survives stage 1. A kill therefore needs the same
evidence as in a single-stage run.

### Validation Side Effects

- Before: clean (`git status --porcelain --untracked-files=all` empty); `code-revision`
  `sha256:64efec16…991f`.
- After: HEAD unchanged (`99f6dfc…`). `code-revision` unchanged (`sha256:64efec16…991f`). The only untracked files are this report and its `-mutation.json`.
- Unexpected tracked-file changes: none. `uv build` wrote its egg-info and build
  directories, which git ignores, and put its dist in the scratchpad. The probes, the RED
  copy and the mutation clones all lived outside the repo.

## Findings

### IR-001 — TC-COMP-248 leaves rule 1's exact-text comparison partly unpinned: three non-equivalent mutants survive

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E8-2, DAC-E8-S3-6 (and, through them, AC-30)
- **Tasks**: T009, T012
- **Files**: `src/factorflow/ingestion/massive/client.py:73` (`and str(exc.reason) == _THROTTLED_RETRY_REASON`); `tests/unit/test_massive_retry.py:508-618` (`test_classify_for_governor_matches_only_urllib3s_429_constant_and_still_throttles_the_body`)
- **Claim challenged**: The TDD evidence scores cycle-2 at 36/36 killed, and the test file labels its added rows as pinning "rule 1's exact-text … edges".
- **Observed evidence**: The reviewer's mutation run, using the story's focused suites, left three survivors that pass both stages (results file `CAP-003-E8-S3-implementation-review-v1-mutation.json`):
  - `review-rule1-endswith`: `str(exc.reason).endswith(_THROTTLED_RETRY_REASON)`
  - `review-rule1-strip`: `str(exc.reason).strip() == _THROTTLED_RETRY_REASON`
  - `review-rule1-casefold`: `str(exc.reason).casefold() == _THROTTLED_RETRY_REASON.casefold()`

  The only row that varies the text is `a-reason-only-containing-the-429-text-is-retryable` (`:584-594`). It appends `" via a proxy"`, so it kills `in` and `startswith` but none of these three.
- **Expected evidence/behavior**: Story rule 1 reads ``str(reason) == ResponseError.SPECIFIC_ERROR.format(status_code=429)``. DAC-E8-2 says "equal to", and design §2.3 rule 1 says the same. Every other `ResponseError` text is rule 2, `RETRYABLE`. Each mutant classifies as `THROTTLED` a reason the contract makes `RETRYABLE`: a prefixed, whitespace-padded or different-case 429 text. None is therefore equivalent (skill E.9), and the mandatory test TC-COMP-248 is `WEAK`.
- **Impact**: At the locked urllib3 2.7.0 nothing is misclassified. `Retry.increment` builds `ResponseError` only from `GENERIC_ERROR`, `SPECIFIC_ERROR.format(status)` or `"too many redirects"`. But a later loosening of the match would go undetected, and assumption 10 names a urllib3 or SDK change as the very case these rows exist for. Under such a change, a non-429 failure could be waited out as throttling for up to 300 s per stock, instead of being retried to `max_attempts` and recorded `[unavailable]`. That this cannot happen yet does not lower the severity (E.9).
- **Required remediation**: Assert `RETRYABLE` for a `MaxRetryError` whose `ResponseError` text is the 429 text with each of these changes, built from `ResponseError.SPECIFIC_ERROR.format(status_code=429)` and never from `client._THROTTLED_RETRY_REASON`:
  - a leading prefix
  - surrounding whitespace
  - a different letter case

  The next review reruns this report's mutants file through `scope --previous` and must show `review-rule1-endswith`, `review-rule1-strip` and `review-rule1-casefold` killed. No production change is needed.

### IR-002 — A delivered CAP-001 test was edited outside the plan's file list and Scope check

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E8-7 (indirectly)
- **Tasks**: T016, T017 (cycle-3)
- **Files**: `tests/unit/test_massive_client_interface.py:29-38`; the "Scope" line of the plan's Story-Specific Validation (`CAP-003-E8-S3-tasks.md:192`); the file list in massive-client CAP-003 §2.1
- **Claim challenged**: The plan's Scope check says the diff touches only `client.py`, `test_massive_retry.py`, `test_massive_client_governor_integration.py`, the TDD-evidence file and the plan.
- **Observed evidence**: The diff also adds `"start_instrument"`, with a comment, to the exact-set assertion of CAP-001 TC-COMP-195. Without it the full suite fails (`red-cycle-3.log`: 1 failed, 2685 passed). This edit is the only one consistent with design §2.6 and §11, which make `start_instrument()` a public in-process call, and with CAP-003-E8-S4's runner. The exact-set comparison is kept, so any other new public member still fails.
- **Expected evidence/behavior**: Every changed file is named by the plan or the design.
- **Impact**: Behaviour is unaffected. The plan's Scope check fails as written, and design §2.1 under-lists the files the change touches. A later reader could take the edit for scope leakage.
- **Required remediation**: At doc sync, add `tests/unit/test_massive_client_interface.py` to the file list in massive-client CAP-003 §2.1, and note `start_instrument` beside CAP-001 TC-COMP-195. No code change.

### IR-003 — TC-COMP-251's static guard reaches less than its specification

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E8-S3-9, DAC-E8-20
- **Tasks**: T011
- **Files**: `tests/unit/test_massive_retry.py:658-679` (`_calls_patch_on_rest_client`), `:750-762` (clause (d))
- **Claim challenged**: TC-COMP-251 steps 2 and 3 say "Search every test" for a `RESTClient` patched with a 429 and for a read of `attempts`.
- **Observed evidence**:
  - Clause (c) recognises only `patch("<...>.RESTClient")`. It misses `monkeypatch.setattr("factorflow.ingestion.massive.client.RESTClient", …)`, which `tests/unit/test_ingestion_main.py:119,256` and `tests/unit/test_ingestion_e2e_main.py:96,289` already use, and it misses `patch.object`.
  - Clause (d) scans only the story's two test files.

  Both follow the wording of plan T011. The reviewer's grep shows the requirement holds today: no test outside `test_massive_retry.py` names `429` or `error_rate_limited` together with a `RESTClient` fake, and no test reads the governor's `attempts`.
- **Expected evidence/behavior**: The guard covers the forms and files TC-COMP-251 names.
- **Impact**: None at present. A future 429 fake written with `monkeypatch.setattr`, or an `attempts` read in a third file, would pass the guard.
- **Required remediation**: Optional. Either widen (c) to `monkeypatch.setattr` and `patch.object` targets and (d) to every test file, excluding the DB-column check by context, or record the narrowing in the next revision of `massive-client-tests.md`, as the coder and the cycle-2 reviewers proposed.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

The coder reported five deviations. Each was checked against the repository.

1. **`# Implements CAP-003 TC-COMP-NNN` markers**: justified. CAP-001 already uses the bare IDs `TC-COMP-243` to `-250` in this repo: `tests/integration/test_run_cancel.py:252,274`, `tests/integration/test_runner_reclaim.py:185`, `tests/integration/test_run_reclaim.py:4-5`, `tests/unit/test_api_errors.py:55,75` and `tests/integration/test_api_runs.py:159`. E8-S1 set the prefix in this file at the base (`# Implements CAP-003 TC-COMP-230`). `TC-INT-025` and `TC-INT-026` stay bare, as coverage-matrix note 13 requires. No harness script parses the marker.
2. **The replaced TC-INT-025 test keeps its name**: justified. DAC-E8-S3-1 requires the marker to be kept and says nothing about the name. The name is still true (a 429 is paced without consuming attempts), and keeping it preserves CAP-001's traceability.
3. **Cycle-3 edit of `tests/unit/test_massive_client_interface.py`**: justified, and forced by the design. Recorded as IR-002 (LOW), for the plan and design file lists only.
4. **Extra rows to kill survivors**: justified. Each row is labelled implementation-level and traces to design §2.3 rules 1–3, to T014's `__all__` entry or to T015's re-raise. None asserts behaviour the contract leaves open. They do not close IR-001.
5. **Two-stage mutation command**: justified and sound (see Independent Validation). This review used the same shape, adding the interface test.

Bookkeeping is consistent:
- All 17 tasks are checked and verified.
- The story status `in-review` matches.
- T017 expected two cycles and three were recorded. Cycle-3 is the forced interface-test fix, and its patch fingerprints are chained from cycle-1's index tree.

No production change is out of scope.

One release constraint applies; it is not a finding. The owner decided on 2026-11-08 (story Description) that this story lands and releases with CAP-003-E8-S4. The branch is local and unpushed. No PR or release may hold this commit without E8-S4's per-stock `start_instrument()` call.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework of CAP-003-E8-S3)
- **Required action**:
  - Resolve IR-001 with the three TC-COMP-248 rows and a mutation run that kills the three survivors.
  - IR-002 and IR-003 are LOW: record them for doc sync, or address them in the same rework.
  - Then rerun `$adversarial-review` (v2), with this report as baseline and `CAP-003-E8-S3-implementation-review-v1-mutation.json` as `mutation-run.py scope --previous`.
- **Warnings accepted downstream**: N/A
