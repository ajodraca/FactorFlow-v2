---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-09
updated: 2026-11-09
story_id: "CAP-003-E8-S3"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S3.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-09T04:04:52Z"
reviewed_head: "d1f1aa23c970bcf730ee0abfbea635c13a34c0ba"
review_base: "52ecfbd0f4cc51cbfaac0899158811a11dce7d41"
reviewed_state_revision: "sha256:ec711f5890349512614b693b69b8678d439930e98e171be64be4f2050e915087"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-11-09T04:04:52Z
  source_artifacts:
    - id: CAP-003-E8-S3
      version: "1 (sha256:77ff998f861e69b39d5f51719666ca7f7b979ecf052a71d6bb1da6b8052e3c8b)"
    - id: CAP-003-E8-S3-tasks
      version: "1 (updated 2026-11-08; last_reworked_review v1)"
    - id: CAP-003-E8-S3-tdd-evidence
      version: "cycle-1, cycle-2, cycle-3, cycle-4"
    - id: CAP-003-E8-S3-implementation-review
      version: "1 (baseline)"
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

# Implementation Review: CAP-003-E8-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 15/15 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 12/12 passed |

Findings: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

| Finding | Severity | Scope | Status |
|---------|----------|-------|--------|
| IR-001 | LOW | carried (v1 IR-002) | OPEN, for doc sync |
| IR-002 | LOW | delta | OPEN, for doc sync |

The rework (`d1f1aa2`) changes tests only. `git diff --exit-code 99f6dfc HEAD -- src` exits 0, so
the production code is the code v1 found correct against massive-client CAP-003 §2.3 and §2.6.

v1's one blocking finding, IR-001 (HIGH), is resolved. Four new TC-COMP-248 rows expect
`RETRYABLE` for the 429 text with:
- a prefix
- a leading space
- a trailing newline
- upper case

Each row builds the text from urllib3's `ResponseError.SPECIFIC_ERROR.format(status_code=429)`,
never from the module's constant. This review reran v1's mutants file through `scope --previous`,
with the same two-stage command shape. All 38 mutants are killed: v1's 33 (`carried`) and 5 of
the reviewer's own (`late`). v1's three survivors are each killed by one of the new rows:

| Mutant | Killed by |
|--------|-----------|
| `review-rule1-endswith` | `the-429-text-with-a-prefix-is-retryable` |
| `review-rule1-strip` | `the-429-text-with-leading-whitespace-is-retryable` |
| `review-rule1-casefold` | `the-429-text-in-another-case-is-retryable` |

v1's IR-003 (LOW) is resolved as its remediation offered: clause (c) now sees `patch.object` and
`monkeypatch.setattr`, and clause (d) scans every file under `tests/`. The coder's one exemption,
`_SCHEMA_DEFAULT_READS`, is justified. It is exact and necessary, and it exempts schema metadata,
not a recorded value (see Scope and Plan Deviations).

Two LOW findings remain for doc sync:
- IR-001 carries v1's IR-002: the interface-test edit is still missing from the plan's and the
  design's file lists.
- IR-002 is new: the widened guard's docstring and exemption comment claim more reach than its
  AST checks have. No offender exists in the tree.

Every required command passes, the full suite included.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S3.md` (status `in-review`; `artifact-gate.py revision` = `sha256:77ff998f…3c8b`, the approved `reviewed_revision`, unchanged since v1) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S3-tasks.md` (T001–T017 checked; frontmatter `last_reworked_review: CAP-003-E8-S3-implementation-review-v1.md`) |
| Component | `FactorFlow-v2` (project repo == component repo) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E8-S3` |
| HEAD | `d1f1aa23c970bcf730ee0abfbea635c13a34c0ba` (story commit `99f6dfc`, v1 review commit `4d90723`, rework commit `d1f1aa2`) |
| Review base | `52ecfbd0f4cc51cbfaac0899158811a11dce7d41`, the CAP-003-E8-S2 tip. It is local only and was supplied by the invoker. `pipeline-state.py review-base --base-ref 52ecfbd` resolves it, and it is an ancestor of HEAD (`git merge-base --is-ancestor` exit 0). The merge-base with the remote default branch would sweep in the unpushed E8-S1/E8-S2 chain, so it is not used. |
| Working tree | clean before validation (`git status --porcelain --untracked-files=all` empty) |
| Changed files reviewed | 42 (`git diff --name-status 52ecfbd..HEAD`) |
| Baseline | v1 (`CAP-003-E8-S3-implementation-review-v1.md`, CHANGES-REQUIRED), `reviewed_head` `99f6dfca97097a556a811d3d4452fe683973b3fe`, with `CAP-003-E8-S3-implementation-review-v1-mutation.json` |

`pipeline-state.py check --stage adversarial-review --base-ref 52ecfbd` returned `READY — review
changes were reworked; a new review version is required`.

Delta since the baseline (`git diff --stat 99f6dfc..HEAD`) has three parts:
- `tests/unit/test_massive_retry.py` (+96/−33).
- The plan's frontmatter line `last_reworked_review`.
- The TDD-evidence cycle-4 entry and nine cycle-4 evidence files. The v1 report and its
  `-mutation.json` (`4d90723`) are the reviewer's own artifacts.

No production, lock or other test file changed.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/massive/client.py` | modified (unchanged since v1) | AC-30, AC-29, DAC-E8-2, DAC-E8-3, DAC-E8-7; T013, T014, T015, T016 |
| `tests/unit/test_massive_retry.py` | modified (rework: 4 TC-COMP-248 rows, TC-COMP-251 clauses (c) and (d), `TypeGuard` import) | DAC-E8-S3-1 to -7, -9, DAC-E8-20; T003–T012; v1 IR-001, IR-003 |
| `tests/unit/test_massive_client_governor_integration.py` | modified (unchanged since v1) | DAC-E8-S3-8; T002 |
| `tests/unit/test_massive_client_interface.py` | modified (unchanged since v1) | Not in the plan's file list. Design §2.6 and §11 force it, because they make `start_instrument` public. Recorded as cycle-3. Justified deviation, IR-001 (carried) |
| `docs/.../stories/CAP-003-E8-S3.md` | modified | status `planning` → `in-review` only |
| `docs/.../stories/CAP-003-E8-S3-tasks.md` | modified | 17 checkboxes `[ ]` → `[x]`; `last_reworked_review` frontmatter (rework bookkeeping) |
| `docs/.../stories/CAP-003-E8-S3-tdd-evidence.yaml` | added | T017; cycle-4 is the rework |
| `docs/.../stories/CAP-003-E8-S3-evidence/` (33 files: 4 cycle patches, RED/GREEN logs, 6 mutation results, code-review and spec-drift records, final-validation and full-suite logs) | added | T017 evidence |
| `docs/.../stories/CAP-003-E8-S3-implementation-review-v1.md` and `-v1-mutation.json` | added | The baseline review and its mutation results (skill I.4–I.5) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-30 | SATISFIED | `client.py:70-75` (rule 1 → `THROTTLED`), `:328` (`execute(send, classify_for_governor)`), `:100-105` (`start_instrument`); E8-S2's budget, `rate_limit.py` | `test_massive_retry.py:332` (TC-COMP-243), `:363` (TC-COMP-244), `:396` (TC-COMP-245), `:434` (TC-COMP-246) | Production code is unchanged since v1 (`git diff --exit-code 99f6dfc HEAD -- src` exit 0). v1's real-transport probes still apply. All four rows pass at HEAD. |
| AC-29 | SATISFIED | `client.py:80-81` (rule 4), `:329-330` (`except BadResponse` re-raise) | `:245` (`test_a_real_403_plan_refusal_…`), `:671` (`test_a_fatal_bad_response_…`) | Mutants `rule4-swapped`, `reraise-bare`, `reraise-from-none` and the reviewer's `review2-reraise-catches-everything` are killed |
| DAC-E8-2 | SATISFIED | `client.py:64`, `:70-77` | TC-COMP-243; TC-COMP-247 (`:473`); TC-COMP-248 (`:509-662`), 20 rows | Rule 1's `==` is now pinned against a prefix, a substring, leading and trailing whitespace and another case (`:596-635`). Every text-loosening mutant of `:73` is killed: `endswith`, `strip`, `casefold`, `lower`, `lstrip`, `rstrip`, `split` and `contains`. `test_massive_redirects.py` is unchanged and passes. |
| DAC-E8-3 | SATISFIED | `client.py:80-81` | `:299` (`test_an_unrecognised_403_…`), `:116` (`[server-error]`), TC-COMP-248 `unknown-shape-body-is-retryable` | Three requests, then `ProviderUnavailable` |
| DAC-E8-7 | SATISFIED | `client.py:100-105` | `test_massive_client_governor_integration.py:216`, TC-COMP-245 | Mutants `start-instrument-pass`, `-twice` and `-uncalled` are killed |
| DAC-E8-20 | SATISFIED | n/a (test harness) | Every 429/403 row uses `_production_settings`, `_real_transport_client`, `forbid_sockets` and `RecordingMakeRequest`. TC-COMP-251 clause (c) now scans `patch`, `patch.object` and `monkeypatch.setattr` in every test file. | The patched-`RESTClient` 429 test is deleted. The new rows are direct classifier calls of the kind DAC-E8-S3-6 allows, and patch nothing. |
| DAC-E8-S3-1 | SATISFIED | as AC-30 | `:332`, markers `TC-INT-025` and `CAP-003 TC-COMP-243` | `cik`, 6 requests, `[60.0]*5`, no exception |
| DAC-E8-S3-2 | SATISFIED | as AC-30 | `:363` | type, `provider_request_id is None`, `MaxRetryError` cause, 6 requests, `[60.0]*5`, sum 300.0, literal `[rate_limited] …` prefix |
| DAC-E8-S3-3 | SATISFIED | `client.py:100-105` | `:396` | one request on `/v2/aggs/ticker/AAPL`, no sleep; after `start_instrument()`, `[60.0]*5` again |
| DAC-E8-S3-4 | SATISFIED | as AC-30 | `:434` | both inequalities with an independently computed `next_delay`; requests = sleeps + 1 |
| DAC-E8-S3-5 | SATISFIED | `client.py:76-77` | `:473` (302/503); `tests/unit/test_massive_redirects.py` unchanged (`git diff --exit-code 52ecfbd HEAD` exit 0) and passing | `sdk-retries-default` is killed |
| DAC-E8-S3-6 | SATISFIED | `client.py:67-81` | `:509-662` (the five specified rows, plus implementation-level rows) | The specified rows are unchanged since v1. IR-001's rows are additive. The test is now `ADEQUATE` (Test Quality Assessment). |
| DAC-E8-S3-7 | SATISFIED | `client.py:326-330` | `:116`, `:245`, `:299` | `git diff -U0 52ecfbd HEAD` adds only one marker line inside each function (`+115`, `+244`, `+298`). The rework did not touch them. |
| DAC-E8-S3-8 | SATISFIED | `client.py:100-105` | `test_massive_client_governor_integration.py:216` | unchanged since v1 |
| DAC-E8-S3-9 | SATISFIED | `client.py:43` | `:759` (`ast` checks a–d) | `uv.lock` and `pyproject.toml` are unchanged. The widened guard covers every `tests/**/*.py`, with one exemption: the `information_schema` column-default read at `tests/integration/test_run_constraints.py:50`. The reviewer's grep finds two kinds of `attempts` read outside the story file. One is that schema-default read. The other is a CAP-001 SQL round-trip of a value the test itself inserts (`:104-118`). Neither reads a value the product records, which is TC-COMP-251's and FINDING-29's concern. The guard reaches less than its docstring claims (IR-002). |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At `52ecfbd`: `errors.py` `ProviderRateLimited`, `ProviderNotEntitled` and kinds; `rate_limit.py` `start_throttle_budget` | As v1 |
| T002 | complete | VERIFIED | `test_massive_client_governor_integration.py:215-240` | Unchanged since v1 |
| T003 | complete | VERIFIED | `test_massive_retry.py` docstring, `_real_transport_client(..., jitter=(0.0,))`, `_answer_429` | Unchanged since v1 |
| T004 | complete | VERIFIED | `:330-359` | Unchanged since v1 |
| T005 | complete | VERIFIED | `:362-392` | Unchanged since v1 |
| T006 | complete | VERIFIED | `:395-430` | Unchanged since v1 |
| T007 | complete | VERIFIED | `:433-456` | Unchanged since v1 |
| T008 | complete | VERIFIED | `:459-498` | Unchanged since v1 |
| T009 | complete | VERIFIED | `:509-662` | The planned rows, plus the four IR-001 rows (`:596-635`), which are labelled and cite DAC-E8-2, §2.3 rule 1 and v1 IR-001 |
| T010 | complete | VERIFIED | `:115`, `:244`, `:298` | Marker lines only |
| T011 | complete | VERIFIED | `:699-743`, `:759-825` | Widened past T011's wording, as v1 IR-003 proposed. The plan's T011 text still describes the narrower guard (IR-002) |
| T012 | complete | VERIFIED | TC-COMP-248 implementation-level rows | `drop-responseerror-conjunct` and `rule4-swapped` are killed |
| T013 | complete | VERIFIED | `client.py:100-105` | — |
| T014 | complete | VERIFIED | `client.py:43`, `:57`, `:61-81` | — |
| T015 | complete | VERIFIED | `client.py:326-330` | — |
| T016 | complete | VERIFIED | `client.py:23-29`; this review re-ran the final validation | — |
| T017 | complete | VERIFIED | `CAP-003-E8-S3-tdd-evidence.yaml`, 4 cycles (`commit_hash: stage`) | `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings. Cycle-4 records two code-review rounds, with round 2 APPROVED and no drift. It reports 35/35 killed, which this review's own run supports (38/38) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_rate_limited_responses_are_paced_without_consuming_attempts` / TC-COMP-243 (TC-INT-025) | ADEQUATE | Unchanged since v1: real transport, literal `[60.0]*5`, request paths | none |
| `test_a_persistent_real_429_spends_exactly_the_300_s_budget_and_raises_rate_limited` / TC-COMP-244 | ADEQUATE | Unchanged since v1. Also kills the reviewer's `review2-reraise-catches-everything`, which turns `ProviderRateLimited` into an untyped re-raise | none |
| `test_a_spent_budget_fails_the_stocks_next_read_after_one_request_until_the_next_stock` / TC-COMP-245 | ADEQUATE | Unchanged since v1 | none |
| `test_jitter_never_takes_the_real_transport_budget_past_300_s` / TC-COMP-246 | ADEQUATE | Unchanged since v1 | none |
| `test_a_refused_redirect_and_a_forcelisted_503_stay_retryable_and_reach_no_other_host` / TC-COMP-247 | ADEQUATE | Unchanged since v1 | none |
| `test_classify_for_governor_matches_only_urllib3s_429_constant_and_still_throttles_the_body` / TC-COMP-248 | **ADEQUATE** (was WEAK at v1) | 20 rows. The expected text is built from urllib3's constant, never from `client._THROTTLED_RETRY_REASON`, so the comparison is not symmetric. Each new row changes one property of the text, so a mutant that ignores that property fails exactly that row. The mutation logs confirm one row per mutant: `endswith` fails the prefix row, `strip`/`split` the leading-space row, `casefold`/`lower` the upper-case row. | none |
| TC-COMP-249 (re-marked S1 rows and TC-INT-026) | ADEQUATE | Bodies unchanged | none |
| `test_start_instrument_starts_the_governor_budget_once_and_sends_nothing` / TC-COMP-250 | ADEQUATE | Unchanged since v1 | none |
| `test_the_429_change_adds_no_package_and_no_test_fakes_a_429_or_reads_attempts` / TC-COMP-251 | ADEQUATE | `ast`-based and deterministic: sorted `rglob`, repo-relative POSIX paths. The reviewer's probe confirms (c) flags `patch("…RESTClient")`, `mocker.patch`, `patch.object` (positional or keyword) and `monkeypatch.setattr` (string, module or `name=`), and a function-level `@patch` decorator. (d) flags `.attempts` and `["attempts"]`. A planted `monkeypatch.setattr(…RESTClient)` + `429` in a `git archive HEAD` copy fails the test, naming `path::function`. Without the exemption, (d) flags exactly `test_run_constraints.py:50`. | Method-level `RESTClient` patches, `patch.multiple`, `getattr`/`.get` and SQL-text reads are out of reach, and the docstring does not say so (IR-002, LOW) |
| `test_classify_for_governor_is_part_of_the_client_modules_interface` (T014) | ADEQUATE | Kills `all-drops-classifier` | none |
| `test_a_fatal_bad_response_is_raised_typed_from_the_one_response` (T015) | ADEQUATE | Kills `reraise-bare` and `reraise-from-none` | none |
| `test_exposes_exactly_the_four_named_read_operations` (CAP-001 TC-COMP-195, edited) | ADEQUATE | Unchanged since v1; exact-set comparison kept | none |

RED for the rework is the baseline's survivors. Under v1's command, at `99f6dfc`'s test file,
`review-rule1-endswith`, `-strip` and `-casefold` survived (v1 `-mutation.json`). Under the same
command shape at HEAD, each is killed by a new row. The rows pass on the unmutated production code
(91 passed), as rows that pin already-correct behaviour should.

## Independent Validation

Harness root: `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/cool-blackburn-2ab918`.
Repo: `<harness>/repos/factorflow-v2/FactorFlow-v2`. This clone has no venv, so `<venv-python>` is
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin/python`
(Python 3.13.7). The `uv run --isolated --offline --all-extras --locked` commands use the locked
environment.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness | 0 | PASS | 8/8 checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref 52ecfbd` | harness | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 52ecfbd --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness | 0 | PASS | 0 errors, 0 warnings (4 cycles) |
| `<venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q tests/unit/test_massive_retry.py tests/unit/test_massive_client_governor_integration.py tests/unit/test_massive_redirects.py tests/unit/test_massive_error_classification.py` (the plan's focused command) | repo | 0 | PASS | 85 passed (81 at v1 + 4 rows) |
| same, plus `tests/unit/test_massive_client_interface.py` | repo | 0 | PASS | 91 passed (supplementary; the mutation command's scope) |
| `uv run --directory <repo> --isolated --offline --all-extras --locked pytest -q -p no:cacheprovider` (full suite, `postgres` included, outside the sandbox) | repo | 0 | PASS | 2690 passed, 2 warnings in 1028.18s. That is v1's 2686 plus the 4 new rows. Both warnings were already present: the `StarletteDeprecationWarning` from `fastapi/testclient.py` and the anyio `BlockingPortal` alias. The `postgres` tests ran in a testcontainers `postgres:16`, which was gone afterwards (`docker ps -a`). The production compose project `factorflow` was untouched: its three containers were still up, at their original uptimes |
| `uv run --directory <repo> --isolated --offline --all-extras --locked ruff check .` | repo | 0 | PASS | All checks passed |
| `uv run --directory <repo> --isolated --offline --all-extras --locked ruff format --check .` | repo | 0 | PASS | 285 files already formatted |
| `uv run --directory <repo> --isolated --offline --all-extras --locked mypy src` | repo | 0 | PASS | No issues in 61 source files |
| `uv build --directory <repo> --offline --out-dir <scratchpad>/dist2` | repo | 0 | PASS | sdist and wheel `factorflow-0.2.0` built outside the repo |
| `git diff --exit-code 52ecfbd HEAD -- tests/unit/test_massive_redirects.py uv.lock pyproject.toml` | repo | 0 | PASS | DAC-E8-S3-5 and DAC-E8-S3-9: no edit, no package added |
| `grep -n "urllib3.exceptions" src/factorflow/ingestion/massive/client.py`, plus `git diff 52ecfbd HEAD -- client.py`, checked for the construction keywords | repo | 0 | PASS | One import, at `:43`. The `retries=`/`pagination=`/`trace=`/`base=` lines of the `RESTClient(...)` block have no `+`/`-` hunk. The one `retries=0` match is the new docstring paragraph. |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 52ecfbd..HEAD --cycle review --out <scratchpad>/mut2/generated.json`, plus 5 reviewer `manual` mutants | harness | 0 | PASS | 3 generated (off-by-one `:64`; negate-boolean `:73`, `:76`). Manual: `review2-rule1-lower`, `-split`, `-lstrip`, `-rstrip` and `review2-reraise-catches-everything` |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratchpad>/mut2/with-manual.json --since 99f6dfca97097a556a811d3d4452fe683973b3fe --previous <stories>/CAP-003-E8-S3-implementation-review-v1-mutation.json --out <scratchpad>/mut2/mutants.json` | harness | 0 | PASS | 38 mutants: 33 `carried` (v1's 3 generated + 30 manual), 5 `late`; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratchpad>/mut2/mutants.json --jobs 4 --timeout 900 --command "<venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q -x tests/unit/test_massive_retry.py tests/unit/test_massive_client_governor_integration.py tests/unit/test_massive_client_interface.py -k 'not test_timeouts_and_server_errors_retry_to_the_attempt_limit' && <venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q tests/unit/test_massive_retry.py tests/unit/test_massive_client_governor_integration.py tests/unit/test_massive_redirects.py tests/unit/test_massive_error_classification.py tests/unit/test_massive_client_interface.py" --out <scratchpad>/mut2/results.json --logs <scratchpad>/mut2/results-logs` | harness | 0 | PASS | **38/38 killed, 0 survived**, 0 stillborn, 0 timeout. All 4 baselines exited 0. `repo_head` `d1f1aa2`, empty tree patch. Copied as `CAP-003-E8-S3-implementation-review-v2-mutation.json` |
| Reviewer guard probe (`<scratchpad>/probe2/probe_guard.py`, outside the repo, imports the test module's helpers) | repo | 0 | PASS | Results in the TC-COMP-251 row above |
| Planted-offender run (`git archive HEAD` copy + `tests/unit/test_planted_offender.py`, `-k 429_change`) | scratchpad | 1 | PASS (expected failure) | `assert offenders == []` fails on `tests/unit/test_planted_offender.py::test_planted` |
| Frontend `npm`/`npx` commands (tech stack) | — | N/A | NOT RUN | The story touches no frontend file, and the plan lists none |
| `uv sync --all-extras` | — | N/A | NOT RUN | It would modify an environment. `uv run --isolated --locked` resolves the same lock without one |

The mutation command keeps v1's two stages, because the delivered TC-INT-026 governor and the
redirect rows loop on the real clock under an "everything is `THROTTLED`" mutant (v1, Independent
Validation). Stage 1 fails fast on the story's `FakeClock` rows. Stage 2 runs every focused file
for any mutant that survives stage 1. A kill therefore needs the same evidence as in a
single-stage run.

### Validation Side Effects

- Before: clean (`git status --porcelain --untracked-files=all` empty); `code-revision`
  `sha256:ec711f58…5087`.
- After: HEAD unchanged (`d1f1aa2…`). `code-revision` unchanged (`sha256:ec711f58…5087`). The only
  untracked files are this report and its `-mutation.json`.
- Unexpected tracked-file changes: none. `uv build` writes its egg-info and build directories,
  which git ignores, and put its dist in the scratchpad. The probe, the planted copy and the
  mutation clones all lived outside the repo.

## Findings

### IR-001 — A delivered CAP-001 test was edited outside the plan's file list and Scope check (carried from v1 IR-002)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: DAC-E8-7 (indirectly)
- **Tasks**: T016, T017 (cycle-3)
- **Files**: `tests/unit/test_massive_client_interface.py:29-38`; the Scope line of the plan's Story-Specific Validation (`CAP-003-E8-S3-tasks.md:193`); the file list in massive-client CAP-003 §2.1
- **Claim challenged**: The plan's Scope check says the diff touches only `client.py`,
  `test_massive_retry.py`, `test_massive_client_governor_integration.py`, the TDD-evidence file
  and the plan.
- **Observed evidence**: The repository is unchanged since v1 on this point:
  - `git diff 99f6dfc..HEAD` touches neither the plan's Scope line nor the design.
  - The interface test still adds `"start_instrument"` to CAP-001 TC-COMP-195's exact set.
  - The rework commit message and the cycle-4 evidence both defer IR-002 to doc sync, which v1
    allowed.
- **Expected evidence/behavior**: Every changed file is named by the plan or the design.
- **Impact**: Behaviour is unaffected. A later reader could take the edit for scope leakage.
- **Required remediation**: At doc sync:
  - Add `tests/unit/test_massive_client_interface.py` to the file list in massive-client CAP-003
    §2.1.
  - Note `start_instrument` beside CAP-001 TC-COMP-195.

  No code change.

### IR-002 — TC-COMP-251's widened guard claims more reach than its `ast` checks have

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: DAC-E8-S3-9, DAC-E8-20
- **Tasks**: T011
- **Files**: `tests/unit/test_massive_retry.py:699-727` (`_patches_rest_client`), `:730-735` (`_reads_attempts`), `:738-742` (`_SCHEMA_DEFAULT_READS` and its comment), `:759-772` (the test's docstring); the T011 text in the plan; TC-COMP-251 in `tests/component/massive-client-tests.md`
- **Claim challenged**: The docstring says clause (d) checks that "no test file reads a recorded
  `attempts` value". The comment on `_SCHEMA_DEFAULT_READS` calls its pair "The one `attempts`
  read under tests/ that is not a recorded value".
- **Observed evidence**: The reviewer's probe found these limits. All of them lie outside the
  forms v1 IR-003 named:
  - Clause (c) returns `False` for a patch of a `RESTClient` method:
    `patch.object(RESTClient, "_get", side_effect=BadResponse("429"))` and
    `patch("massive.RESTClient._get", …)`. It does the same for `patch.multiple(client,
    RESTClient=…)`.
  - Clause (d) does not flag `getattr(x, "attempts")`, `row.get("attempts")` or a SQL-text read.
  - `tests/integration/test_run_constraints.py:104-118` inserts `attempts = 2` and reads it back
    with `SELECT … attempts FROM run_instrument_result`. The guard cannot see that read, so the
    comment's "the one … read" is true only of AST-visible reads.
  - The exemption is keyed on the expression text `result_columns['attempts']`, so a second such
    read in that file would also pass.

  The coder's own cycle-4 code review records the same residuals as non-blocking
  (`code-review-cycle-4.txt`). The reviewer's grep finds none of these forms in the tree, and no
  test reads an `attempts` value the product records.
- **Expected evidence/behavior**: TC-COMP-251 step 2 says "Search every test for `RESTClient`
  patched to raise `BadResponse` with a `429`", and step 3 says "for a read of `attempts`". Where
  the guard deliberately reaches less, the specification or the guard's own wording should say so.
- **Impact**: None at present. A future 429 fake written as a `RESTClient` method patch, or an
  `attempts` read through `getattr` or SQL, would pass the guard. A reader of the docstring would
  assume it is covered.
- **Required remediation**: At doc sync, beside IR-001, take one of two routes:
  - Record the guard's AST-only reach in T011's wording and in the next revision of TC-COMP-251
    (`massive-client-tests.md`): string targets of `patch`, `patch.object` and
    `monkeypatch.setattr`, one function at a time; `.attempts` and `["attempts"]` reads; one exact
    schema-default exemption.
  - Or extend clause (c) to method targets of `RESTClient`.

  Either way, make the `_SCHEMA_DEFAULT_READS` comment say "AST-visible". Non-blocking.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | `test_massive_retry.py:596-635`: four `RETRYABLE` rows (prefix `"proxy: "`, leading `" "`, trailing `"\n"`, `.upper()`), each built from `ResponseError.SPECIFIC_ERROR.format(status_code=429)`. This review's `scope --previous` run kills `review-rule1-endswith` (prefix row), `review-rule1-strip` (leading-whitespace row) and `review-rule1-casefold` (case row), and kills all 38 mutants (`CAP-003-E8-S3-implementation-review-v2-mutation.json`). No production change was needed, and none was made. |
| v1/IR-002 (LOW) | STILL OPEN | Deferred to doc sync by the coder (commit `d1f1aa2` message; cycle-4 `deviations`), as v1 allowed. The plan's Scope line and design §2.1 are unchanged. Carried as v2 IR-001. |
| v1/IR-003 (LOW) | RESOLVED | Clause (c) recognises `patch`, `patch.object` and `monkeypatch.setattr`, positionally or by keyword (`:699-727`). Clause (d) scans every `tests/**/*.py` (`:805-823`). The DB-column check is excluded by an exact `(file, expression)` pair (`:740-742`), the "by context" exclusion v1's remediation offered. Verified by probe, by a planted offender and by the guard passing on the current tree. The residual reach limits are a new LOW, IR-002 (delta). |

## Scope and Plan Deviations

**Coder-reported choice: the `_SCHEMA_DEFAULT_READS` exemption.** Justified, for four reasons:

1. **It exempts schema metadata, not a recorded value.** The exempted read is
   `result_columns['attempts']` at `tests/integration/test_run_constraints.py:50`. It asserts the
   `column_default` of `run_instrument_result.attempts`, taken from `information_schema.columns`
   (CAP-001 migration `0004_runs.sql`). TC-COMP-251 and the test specification's harness note
   (`massive-client-tests.md:35`: "Request counts always come from `RecordingMakeRequest`; no case
   reads a recorded `attempts` value") forbid something else. So does acquisition-runner-tests
   `:263` ("which the delivered writer never records", spec review v5 FINDING-29). Their concern
   is a test that takes the attempt count as evidence.
2. **It is necessary.** Without it, the probe shows clause (d) flags exactly that one read, and
   nothing else in the tree.
3. **It is narrow.** It replaced round 1's function-wide `information_schema` exemption, which the
   coder's own code review rejected.
4. **It is stable.** `ast.unparse` gives the same key under 3.12 and 3.13, per the coder's review.

Its residual weaknesses are recorded in IR-002 (LOW): it is keyed on expression text, and nothing
checks that it is still needed.

Other deviations, each checked against the repository:

1. **Two whitespace rows instead of one "surrounding whitespace" row.** Justified. The
   leading-only and trailing-only rows kill `lstrip` and `rstrip` separately, which the reviewer's
   `review2-rule1-lstrip` and `-rstrip` confirm. A both-ends row would leave either one alive.
2. **Cycle-4 staged twice.** Justified. Round 1's exemption was too broad, and round 2 narrowed
   it. Only round 2's patch is recorded as `diff_sha256`, and the lint passes.
3. **`typing.TypeGuard` on `_reads_attempts`.** A test-only typing aid; `mypy src` is unaffected.
4. **v1's justified deviations** (`CAP-003` marker prefix, the kept TC-INT-025 name, the cycle-3
   interface edit, the extra rows, the two-stage mutation command) are unchanged and still hold.

Bookkeeping:
- All 17 tasks are checked and verified. The story status `in-review` matches.
- The plan's new `last_reworked_review` frontmatter is the rework marker that `pipeline-state.py`
  reads.
- The commit message's "story back to in-review" changes no committed bytes. The story was
  `in-review` at `99f6dfc` and is `in-review` at HEAD. `code-review-cycle-4.txt` saw an unstaged
  `in-review` → `in-progress` edit during rework, and no commit carries it.

No production change is out of scope, and none was made in the rework.

One release constraint applies; it is not a finding. The owner decided on 2026-11-08 (story
Description) that this story lands and releases with CAP-003-E8-S4. The branch is local and
unpushed. No PR or release may hold these commits without E8-S4's per-stock `start_instrument()`
call.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync` for CAP-003-E8-S3)
- **Required action**:
  - Resolve IR-001: add `tests/unit/test_massive_client_interface.py` to massive-client CAP-003
    §2.1's file list, and note `start_instrument` beside CAP-001 TC-COMP-195.
  - Resolve IR-002: record TC-COMP-251's AST-only reach, as shipped, in the next revision of
    `massive-client-tests.md` (and T011), and correct the `_SCHEMA_DEFAULT_READS` comment.
  - Keep the joint landing with CAP-003-E8-S4: no PR or release without it.
- **Warnings accepted downstream**: IR-001, IR-002
