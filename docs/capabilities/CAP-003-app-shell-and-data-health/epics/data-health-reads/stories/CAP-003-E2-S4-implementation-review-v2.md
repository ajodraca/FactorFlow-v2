---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S4-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E2-S4"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-14T22:21:11Z"
reviewed_head: "5a18ddaecf469a666f30dda02f7325513528ea3b"
review_base: "1c4c2e31f3243727e4c5b84a2feb0caae8f1363a"
reviewed_state_revision: "sha256:2feef6db1152620ba27e0d0310c7db7e3c4d3b333182251676e9db16e2ee3859"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-003-E2-S4
    artifact_version: 2
    content_revision: sha256:8c21b0c32474b2b88fbca51a9dd7e15fd03ed2675acac684bfcae21175bd228f
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-14T22:36:30Z
  source_artifacts:
    - id: CAP-003-E2-S4
      version: "2 (sha256:8c21b0c32474b2b88fbca51a9dd7e15fd03ed2675acac684bfcae21175bd228f)"
    - id: CAP-003-E2-S4-tasks
      version: "1 (draft, updated 2026-11-14, last_reworked_review v1)"
    - id: CAP-003-E2-S4-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-003-E2-S4-implementation-review
      version: "1 (baseline)"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003-component-design-data-health-api
      version: "2"
    - id: CAP-003-component-design-data-health-reader
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-data-health-api-tests
      version: "2"
    - id: tech-stack
      version: "7"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E2-S4 — Version 2

Supervised unattended run `run-20261114T141555Z`, unit u028, per `docs/unattended-mode.md`.
The review base is the merge base with the integration branch the driver supplied,
`usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z`. The baseline is review v1
(`CHANGES-REQUIRED`, `reviewed_head` `dc2129c`). This review recorded one decision,
**DEC-0399**: the scope of the request-id fallback survivor (IR-001). Commits that carry this
report carry the trailer `Decision-Id: DEC-0399`.

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 12/13 verified |
| Required validation | 9/9 passed |

The rework changed tests, the task plan and evidence only. Production code is byte-identical to
the baseline (`git diff dc2129c..HEAD -- src` is empty), and it remains correct. All three of
v1's findings are resolved: the three baseline survivors, `manual:5`, `manual:35` and
`manual:23`, are now killed. Every validation command passes, including the full suite with the
`postgres` tests (2878 passed).

The gate still fails on one test-strength regression that the rework introduced:

- **IR-001**: v1 IR-002 asked for the cursor refusal's `request_id` to be observable. The rework
  did this by giving the shared test app `_client` a middleware that stamps
  `request.state.request_id` on every request. It then replaced the expected
  `"request_id": "unknown"` with the stamped id. As a result no test now builds an app without
  stamping, and the `"unknown"` fallback is no longer observed. Plan T005 and T010 and AD 2.3
  all specify that fallback. My mutant `review2-request-id-fallback` changes the default to
  `"n/a"`. It survives the reworked suite. The baseline's own test files kill it: 2 failed in
  a scratch probe. `mutation-run.py scope` tags the mutant `late`, because line 64 did not
  change. DEC-0399 scopes it `delta` instead, because the killing assertion is what changed
  (step H). The cursor-refusal test is therefore `WEAK`, which is HIGH.

Also recorded: one non-blocking `late` survivor (IR-002, `next_cursor` derived from the last
row) and one LOW plan-bookkeeping finding (IR-003).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4.md` (v2, status `in-review`, revision unchanged since v1) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4-tasks.md` (v1, draft, `last_reworked_review: CAP-003-E2-S4-implementation-review-v1.md`) |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E2-S4-run-20261114T141555Z` |
| HEAD | `5a18ddaecf469a666f30dda02f7325513528ea3b` (`feat(CAP-003-E2-S4): story-coding cycle 2, review rework of implementation-review-v1`) |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` → `1c4c2e31f3243727e4c5b84a2feb0caae8f1363a`, from `pipeline-state.py review-base --base-ref`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0). Three commits in `base..HEAD`: `dc2129c` (coding), `711c8fb` (review v1), `5a18dda` (rework) |
| Working tree | clean: no staged, unstaged or untracked non-ignored files, before and after validation |
| Changed files reviewed | 96 in `base..HEAD`: 4 code, 3 story artifacts, 2 review-v1 artifacts, 87 TDD evidence files. Since the baseline: 2 test files, the task plan, the TDD evidence file, 12 evidence files, and the 2 review-v1 artifacts. No production file |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `dc2129c01caa57ba41d6459d22c56c214270bc2f`, with `CAP-003-E2-S4-implementation-review-v1-mutation.json` |

`pipeline-state.py check --stage adversarial-review --base-ref …` answers `READY — review changes
were reworked; a new review version is required`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/data_health_models.py` | added (unchanged since baseline) | AC-11, AC-13, AC-19, DAC-E2-11, DAC-E2-12, DAC-E2-S4-1; T009 |
| `src/factorflow/api/routes/data_health.py` | added (unchanged since baseline) | AC-13, DAC-E2-3, DAC-E2-S4-2 to DAC-E2-S4-4; T010 |
| `tests/unit/test_api_data_health_models.py` | added; modified since baseline | TC-COMP-037, TC-COMP-050; T002 to T004, T008. Rework: `PAGE_TWO_ROWS`, `EXPECTED_PAGE_TWO_ROWS` and a multi-row test (v1 IR-001) |
| `tests/unit/test_api_data_health_routes.py` | added; modified since baseline | TC-COMP-051 to TC-COMP-053; T005 to T008. Rework: a stamping middleware in `_client`, `_REQUEST_ID` in `_problems_refusal` (v1 IR-002), and a multi-row route test (v1 IR-001) |
| `docs/.../stories/CAP-003-E2-S4.md` | modified | Status `planning` → `in-review` only (coding commit) |
| `docs/.../stories/CAP-003-E2-S4-tasks.md` | modified | 13 checkbox flips (coding). Rework: `updated`, `last_reworked_review`, and the Other Notes "Equivalent mutants" line rewritten. Nothing else, so the T005, harness and Resolved Conflict 3 text is stale (IR-003) |
| `docs/.../stories/CAP-003-E2-S4-tdd-evidence.yaml` | added; modified since baseline | T013: cycle-2 appended; cycle-1 untouched |
| `docs/.../stories/CAP-003-E2-S4-evidence/` | added | T013: cycle-1 (75 files) and cycle-2 (`cycle-2.patch`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json`, `red-cycle-2-rework.log`, 8 run logs) |
| `docs/.../stories/CAP-003-E2-S4-implementation-review-v1.md`, `-v1-mutation.json` | added | Review v1 output (not the coder's) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `data_health_models.py:229-259` `DataHealthResponse`; `routes/data_health.py:39-43` | `test_data_health_serialises_every_field_with_nulls_present`; `test_data_health_delegates_once_with_one_connection` | Unchanged since v1 |
| AC-13 | SATISFIED | `data_health_models.py:125-168`; `routes/data_health.py:46-70` | `test_problem_page_serialises_every_field`; `test_a_multi_row_problem_page_keeps_every_row_in_the_readers_order`; `test_problems_returns_a_multi_row_page_unchanged` | Two rows, `AAA` then `BBB`, are pinned in order through both the model and the route. Reversal and truncation are killed (v1 IR-001 resolved) |
| AC-17 | SATISFIED | `git diff --name-status base..HEAD -- src tests` shows four `A` lines and no `M`; `app.py` does not reference `data_health` | The seven delivered API suites: 144 passed (T011). Full suite: 2878 passed | DEC-0211 |
| AC-19 | SATISFIED | Field names follow §4.2 and RD 2.2 | `test_responses_keep_the_domain_vocabulary_with_no_sentence_or_tier` | Unchanged since v1 |
| DAC-E2-3 | SATISFIED | `routes/data_health.py:49`, `:58-66` | `test_a_limit_outside_one_to_five_hundred_is_refused_and_never_echoed[0,501]`, `test_a_cursor_that_is_not_a_symbol_is_refused_and_never_echoed`, `test_only_validated_values_reach_the_reader` | Never clamped; nothing echoed; no checkout before a refusal |
| DAC-E2-11 | SATISFIED | Every field required; no `exclude_none` | TC-COMP-050 literals | `response_model_exclude_none=True` is killed (`manual:17`) |
| DAC-E2-12 | SATISFIED | No forbidden field name; no tier or sentence | `test_responses_keep_the_domain_vocabulary_with_no_sentence_or_tier` | Plan Resolved Conflict 1 reading |
| DAC-E2-S4-1 | SATISFIED | As AC-11 and DAC-E2-11 | `test_attention_serialises_every_field_with_nulls_present`, `test_every_timestamp_carries_an_offset`, `test_an_ended_download_carries_its_end_instant` | `failures[].cause` excluded per story v2 |
| DAC-E2-S4-2 | SATISFIED | `routes/data_health.py:60-66` | `test_a_cursor_that_is_not_a_symbol_is_refused_and_never_echoed`, `test_a_limit_outside_one_to_five_hundred_is_refused_and_never_echoed` | Code, message, resource, no echo, and the request's own id (`req-test-1`) are pinned. The `"unknown"` fallback no longer is (**IR-001**) |
| DAC-E2-S4-3 | SATISFIED | `routes/data_health.py:35-36, 42-43, 67-70` | `test_*_delegates_once_with_one_connection`; `test_problems_returns_a_multi_row_page_unchanged`; `test_a_database_error_propagates_uncaught` | `excinfo.value is err` still holds with the test middleware in the stack. `next_cursor` is pinned only where it equals the last row's symbol (**IR-002**, non-blocking) |
| DAC-E2-S4-4 | SATISFIED | No SQL or logging in the router; validated values only | `test_only_validated_values_reach_the_reader`, `test_the_router_holds_no_sql_and_no_logging`, `test_the_handlers_log_nothing`, `test_credential_present_is_a_json_boolean` | The test middleware logs nothing, so the `factorflow` caplog check keeps its meaning |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | As v1 | No delivered file edited |
| T002 | complete | VERIFIED | `test_api_data_health_models.py:38-143` | `PAGE_TWO_ROWS` (`:93-107`) added beside the planned fixtures |
| T003 | complete | VERIFIED | `:356-433` | Unchanged |
| T004 | complete | VERIFIED | `:145-329` literals; `:436-499` | Adds `EXPECTED_PAGE_TWO_ROWS` (`:232-264`) and its test (`:462-465`) |
| T005 | complete | **PARTIAL** | `test_api_data_health_routes.py:92-147` | T005 specifies both refusal envelopes with `"request_id": "unknown"` on the bare `_client`. The tests now assert `"req-test-1"` on a stamping app, and no bare-app case remains. The stamped-id assertion is what v1 IR-002 asked for. The planned fallback assertion was replaced rather than kept (**IR-001**), and the plan text was not amended (**IR-003**) |
| T006 | complete | VERIFIED | `:162-257` | `test_problems_returns_a_multi_row_page_unchanged` added; propagation still `excinfo.value is err` |
| T007 | complete | VERIFIED | `:260-302` | Unchanged |
| T008 | complete | VERIFIED | `:305-322`; models `:502-505` | Unchanged |
| T009 | complete | VERIFIED | `src/factorflow/api/data_health_models.py` | Unchanged since v1 |
| T010 | complete | VERIFIED | `src/factorflow/api/routes/data_health.py` | Unchanged since v1 |
| T011 | complete | VERIFIED | Rerun: 144 passed | — |
| T012 | complete | VERIFIED | Rerun: ruff, format, mypy, build and the full suite (2878 passed) all pass | — |
| T013 | complete | VERIFIED | cycle-2 in `CAP-003-E2-S4-tdd-evidence.yaml`; `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings | `cycle-2.patch` sha256 `4b1910f6…` equals `diff_sha256`, and its hunks for both test files and the plan equal `git diff 711c8fb..HEAD`. The 4 cycle mutants are killed. v1 IR-003 is resolved (see Disposition) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_responses_keep_the_domain_vocabulary_with_no_sentence_or_tier` / TC-COMP-037 | ADEQUATE | Unchanged since v1 | none |
| `test_attention_serialises_every_field_with_nulls_present` / TC-COMP-050 | ADEQUATE | Unchanged; items order kills `review2-items-reversed` and `review2-symbols-reversed` | none |
| `test_data_health_serialises_every_field_with_nulls_present` / TC-COMP-050 | ADEQUATE | Was WEAK in v1 for row reversal and truncation. Those are now killed by the multi-row tests in the same TC; `manual:4` (`checks` None) is killed here | none blocking (IR-002 is late) |
| `test_problem_page_serialises_every_field` / TC-COMP-050 | ADEQUATE | One row with two failures; kills `review2-failures-reversed` | none blocking (IR-002 is late) |
| `test_a_multi_row_problem_page_keeps_every_row_in_the_readers_order` / TC-COMP-050 (new) | ADEQUATE | Hand-written literal for two rows with distinct failures, offsets, run ids and `retryable` `True`/`False`. Kills `manual:5`, `manual:35` and `review2-retryable-constant` | `next_cursor` equals the last row's symbol, as in every fixture with rows (IR-002, late) |
| `test_zero_counts_stay_zero_and_absent_counts_are_null`, `test_never_acquired_serialises_checks_as_an_object_of_nulls`, `test_every_timestamp_carries_an_offset`, `test_an_ended_download_carries_its_end_instant` / TC-COMP-050 | ADEQUATE | Unchanged | none |
| `test_credential_present_is_a_json_boolean` (T008) | ADEQUATE | Unchanged | none |
| `test_a_limit_outside_one_to_five_hundred_is_refused_and_never_echoed` / TC-COMP-051 | ADEQUATE | Exact delivered envelope, now with the stamped id, which pins the delivered handler reading `request.state`; no reader; no checkout | none |
| `test_a_cursor_that_is_not_a_symbol_is_refused_and_never_echoed` / TC-COMP-051 | **WEAK** | Exact envelope with `resource` `data-health`, the fixed message and the stamped id. Kills `manual:23` and `review2-request-id-from-header` | The `"unknown"` fallback is unobserved, so `review2-request-id-fallback` survives. The baseline version of this test killed it (IR-001, delta per DEC-0399) |
| `test_a_lower_case_cursor_is_normalised_before_the_reader` / TC-COMP-051 | ADEQUATE | Unchanged | none |
| `test_problems_returns_a_multi_row_page_unchanged` / TC-COMP-052 (new) | ADEQUATE | Route-level body equals the two-row literal | Same `next_cursor` shape as above (IR-002) |
| `test_attention_delegates_once_with_one_connection`, `test_data_health_delegates_once_with_one_connection`, `test_problems_delegates_once_with_one_connection` / TC-COMP-052 | ADEQUATE | Unchanged | none |
| `test_an_empty_store_answers_zero_counts_and_never_acquired` / TC-COMP-052 | ADEQUATE | Unchanged | none |
| `test_a_database_error_propagates_uncaught` / TC-COMP-052 | ADEQUATE | `excinfo.value is err` on all three paths, now through the test's `BaseHTTPMiddleware`; `manual:31` killed | none |
| `test_only_validated_values_reach_the_reader` / TC-COMP-053 | ADEQUATE | Unchanged | none |
| `test_the_router_holds_no_sql_and_no_logging`, `test_the_handlers_log_nothing` / TC-COMP-053 | ADEQUATE | Unchanged; the test middleware emits no record | none |
| `test_the_route_table_is_three_reads`, `test_problems_is_served_by_the_problems_handler` (T008) | ADEQUATE | Unchanged | none |

Isolation and determinism: every test builds its own app and pool. Fixtures are literals. There
is no clock, network or database dependence, and the middleware stamps a constant.

**Independent mutation run** (E.9). I generated over `1c4c2e3..HEAD` with `--cycle review`:
60 catalogue mutants, the same 60 ids as v1. I added 7 hand-written mutants of my own:

- `review2-request-id-fallback`: the `getattr` default `"unknown"` → `"n/a"`;
- `review2-request-id-from-header`: the id read from the `X-Request-Id` request header;
- `review2-next-cursor-derived`: `next_cursor` taken from the last row's symbol;
- `review2-retryable-constant`: `retryable=True`;
- `review2-failures-reversed`, `review2-items-reversed`, `review2-symbols-reversed`.

`scope --since dc2129c --previous v1-mutation.json` added v1's 35 hand-written mutants and
tagged 95 `carried` and 7 `late`. No previous mutant failed to apply. I ran the set with the
focused suites and an extra stillborn pattern, `^E\s+SyntaxError`. That pattern matches
pytest's indented form, which the runner's default misses (v1 IR-003).

Results: 102 mutants. 97 killed, 3 stillborn (the three `remove-attribute` decorator removals,
whose logs read `E   SyntaxError: invalid syntax`), 2 survived. The results are beside this
report as `CAP-003-E2-S4-implementation-review-v2-mutation.json`. Per DEC-0399, that file carries
`scope: delta` and a `scope_basis` for `review2-request-id-fallback`.

| Mutant | Outcome | Scope | Equivalent? | Disposition |
|--------|---------|-------|-------------|-------------|
| `data_health_models.py:manual:5` (rows reversed), `:manual:35` (rows `[:1]`) | killed | carried | n/a | v1 IR-001 resolved |
| `routes/data_health.py:manual:23` (`request_id="unknown"`) | killed | carried | n/a | v1 IR-002 resolved |
| `routes/data_health.py:{32,39,46}:remove-attribute:1` | stillborn | carried | n/a | Scored correctly this time (v1 IR-003) |
| `routes/data_health.py:manual:review2-request-id-fallback` | **survived** | **delta** (tool: `late`; DEC-0399) | No. Plan T010 and AD 2.3 (`component-design-data-health-api.md:184`) specify `getattr(request.state, "request_id", "unknown")`. Plan T005 specifies the bare-app refusal body with `"request_id": "unknown"`. Every delivered refusal path in `api/app.py` (`:301`, `:341`, `:400`, `:459`) uses the same fallback | IR-001 |
| `data_health_models.py:manual:review2-next-cursor-derived` | **survived** | late | No. RD (`component-design-data-health-reader.md:319`) and `reader.py:86` set `next_cursor` only when a `limit + 1`th stock exists, so a final page with rows has `null`. The mutant emits the last row's symbol (probe: `"ZZZ"`). DAC-E2-S4-3 requires the reader's value unchanged | IR-002 (MEDIUM, non-blocking) |
| The other 5 `review2-*` mutants and all 92 remaining carried mutants | killed | carried/late | n/a | — |

Two probes back the scope calls. Both ran in a scratch clone at HEAD under the scratchpad and
wrote nothing to the component:

- With the baseline's test files (`git show dc2129c:tests/unit/…`) and
  `review2-request-id-fallback` applied, `pytest -k cursor_that_is_not` gives **2 failed**:
  `'request_id': 'n/a'` against `'unknown'`. The gap did not exist at the baseline.
- With the baseline's test files and `review2-next-cursor-derived` applied, the two story suites
  give **26 passed**. The gap existed at the baseline, so it is `late`.

## Independent Validation

`<repo>` is
`/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b/repos/factorflow-v2/FactorFlow-v2`.
`<scratch>` is this session's scratchpad. Every command ran inside the sandbox.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | 8 checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `uv run --directory <repo> pytest tests/unit/test_api_data_health_models.py tests/unit/test_api_data_health_routes.py -v -p no:cacheprovider` (plan: Focused) | `<repo>` | 0 | PASS | 28 passed in 0.63s: 10 models, 18 routes |
| `uv run --directory <repo> pytest tests/unit/test_api_no_secrets.py tests/unit/test_api_host_origin.py tests/unit/test_api_isolation.py tests/unit/test_api_errors.py tests/unit/test_api_models.py tests/unit/test_api_coverage_routes.py tests/unit/test_api_classifications_routes.py -q -p no:cacheprovider` (T011) | `<repo>` | 0 | PASS | 144 passed |
| `uv sync --all-extras --directory <repo>` | `<repo>` | 0 | PASS | Resolved 46 packages; checked 43; no change |
| `uv build --directory <repo> --out-dir <scratch>/dist` | `<repo>` | 0 | PASS | Built `factorflow-0.2.0.tar.gz` and `factorflow-0.2.0-py3-none-any.whl` into the scratchpad |
| `uv run --directory <repo> pytest -q -p no:cacheprovider` | `<repo>` | 0 | PASS | **2878 passed**, 2 warnings (starlette and anyio deprecations), 667.49s. The full suite with the `postgres` tests included, not an exclusion run: v1's 2876 plus the rework's 2 tests |
| `uv run ruff check .` | `<repo>` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `<repo>` | 0 | PASS | 301 files already formatted |
| `uv run mypy src` | `<repo>` | 0 | PASS | No issues in 67 source files |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/.../CAP-003-E2-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 1c4c2e31f3243727e4c5b84a2feb0caae8f1363a --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir <repo> --range 1c4c2e3…5a18dda --cycle review --out <scratch>/mut/generated.json`, plus 7 hand-written mutants | harness root | 0 | PASS | 60 generated, 67 in total |
| `python3 scripts/mutation-run.py scope --repo-dir <repo> --mutants <scratch>/mut/with-manual.json --since dc2129c01caa57ba41d6459d22c56c214270bc2f --previous <story dir>/CAP-003-E2-S4-implementation-review-v1-mutation.json --out <scratch>/mut/mutants.json` | harness root | 0 | PASS | 102 mutants: `carried` 95, `late` 7; 0 previous no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <scratch>/mut/mutants.json --jobs 4 --command 'cd {workdir} && uv run --all-extras pytest tests/unit/test_api_data_health_models.py tests/unit/test_api_data_health_routes.py -q -x -p no:cacheprovider' --stillborn-pattern '^E\s+SyntaxError' --out <scratch>/mut/results.json --logs <scratch>/mut/results-logs --work-root <scratch>/mut/work` | harness root | 3 | 2 SURVIVED | 97 killed, 3 stillborn, 2 survived. Raw results sha256 `19f9f8722f3a7b4a6d7d0fc90564858cda8c152941fbef15a269fd8d4a7f8224`; the persisted copy with the DEC-0399 scope override is `f16fd79e7fb129f078482ebc22f2bf116192457503296c2b9f825e67a4a838af`. This is the E.9 gate, recorded as findings, not as a required validation command |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e` | — | N/A | NOT RUN | Not required. The change set holds no frontend file, and neither the story's Validation nor the plan's Validation Plan names them |

The 9 required validation commands are the focused suite, T011, the six tech-stack v7
commands, and the TDD lint. All 9 passed.

### Validation Side Effects

- Before: HEAD `5a18ddaecf469a666f30dda02f7325513528ea3b`; `git status --porcelain --untracked-files=all` empty; `code-revision` `sha256:2feef6db1152620ba27e0d0310c7db7e3c4d3b333182251676e9db16e2ee3859`.
- After: HEAD unchanged; status empty; `code-revision` unchanged (`sha256:2feef6db…e2ee3859`).
- Unexpected tracked-file changes: none. The mutation run and both probes worked in clones under the scratchpad, and the build wrote to the scratchpad.

## Findings

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 1 · **total 3**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | delta | OPEN | The rework's request-id stamping replaced the only assertion on the cursor refusal's `"unknown"` fallback, so a changed fallback now survives |
| IR-002 | MEDIUM | late | OPEN | Every fixture with rows has `next_cursor` equal to its last row's symbol, so a derived cursor survives |
| IR-003 | LOW | delta | OPEN | The plan still describes the bare `_client` and the `"unknown"` envelopes in T005, the shared harness and Resolved Conflict 3 |

### IR-001 — The rework's request-id stamping replaced the only assertion on the cursor refusal's `"unknown"` fallback

- **Severity**: HIGH
- **Scope**: delta. The mutated line, `routes/data_health.py:64`, is unchanged, and
  `mutation-run.py scope` tags the survivor `late`. The killing assertion is what changed:
  `git diff dc2129c..HEAD` shows `test_api_data_health_routes.py:98-101` (the middleware) and
  `:114` (`"request_id": _REQUEST_ID`). The baseline's test files kill the mutant. This is
  therefore a defect the rework introduced, not a gap the baseline could have found (step H;
  TEST-TDD-006 Verification). Decision: **DEC-0399**.
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-2, with the story's API contract ("`422 validation_error`
  (delivered envelope)"). The code satisfies them; the test no longer sees this violation.
- **Tasks**: T005 (the test guarding T010's cursor refusal)
- **Files**:
  - `src/factorflow/api/routes/data_health.py:64`
    (`request_id=getattr(request.state, "request_id", "unknown")`)
  - `tests/unit/test_api_data_health_routes.py:92-105` (`_client`, now always stamping
    `req-test-1`), `:108-116` (`_problems_refusal`), `:135-147` (the cursor refusal test)
- **Claim challenged**: cycle-2's evidence says the route tests "assert the cursor and limit
  refusals carry it" and that the plan's equivalent-mutant note is corrected. The implied claim is
  that the refusal's `request_id` is now fully pinned.
- **Observed evidence**:
  - `review2-request-id-fallback` (`"unknown"` → `"n/a"` as the `getattr` default) survives all
    28 focused tests.
  - Every route test builds its app through `_client`, and `_client` always installs the
    stamping middleware. No test reaches the handler without `request.state.request_id`.
  - Scratch probe: with the baseline's test files, the same mutant gives `2 failed`
    (`'request_id': 'n/a'` against `'unknown'`). The baseline pinned the fallback and the
    rework removed that pin.
  - `manual:23` (hard-coded `"unknown"`) and `review2-request-id-from-header` are killed. The
    stamped path is pinned and the unstamped path is not.
- **Expected evidence/behavior**:
  - Plan T010: `request_id=getattr(request.state, "request_id", "unknown")`.
  - Plan T005: on `_client(_FakePool())`, the cursor refusal equals
    `{"error": {..., "resource": "data-health", "request_id": "unknown"}}`. The shared harness
    builds that client without request-id middleware.
  - AD 2.3 (`component-design-data-health-api.md:184`) gives the same expression. Every
    delivered refusal in `api/app.py` falls back to `"unknown"`.
  - Skill E.9: a mutant that changes behaviour the plan or design specifies is not equivalent,
    "even when nothing in the system as built can observe the difference yet".
- **Impact**: `create_app` installs the request-id middleware first, so today the fallback is
  reached only when the router is mounted without it. That is what every unit test of this
  router did until this rework. A regression in the fallback, such as `None` (which
  `ErrorDetail.request_id: str` would reject as a `500`), an empty string or another literal,
  would make the bare-app refusal disagree with the delivered `limit` refusal on the same
  route. No test in this or any planned story would fail. A small effect does not lower the
  severity (E.9).
- **Required remediation**: keep the stamped-id assertion, and restore an assertion that the
  cursor refusal carries `"request_id": "unknown"` when no request id is stamped, as plan T005
  specifies. One option is a `_client` variant or parameter without the middleware.
  `review2-request-id-fallback` must then be killed. Production code needs no change.

### IR-002 — Every fixture with rows has `next_cursor` equal to its last row's symbol, so a derived cursor survives

- **Severity**: MEDIUM
- **Scope**: late. The mutant is on `data_health_models.py:167`, which is unchanged since the
  baseline. v1 did not run it, and the scratch probe shows it survives the baseline's test files
  too. It does not make its test `WEAK` (step H).
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-3 ("returns the reader's value through `from_reader`
  unchanged"), AC-13
- **Tasks**: T004, T006 (tests); T009 (`from_reader` "copying every field by name ... and nothing
  else")
- **Files**: `src/factorflow/api/data_health_models.py:163-168`; fixtures
  `tests/unit/test_api_data_health_models.py:80-92` (`PAGE_FULL`, cursor `"AAA"`, last row
  `AAA`) and `:93-107` (`PAGE_TWO_ROWS`, cursor `"BBB"`, last row `BBB`)
- **Claim challenged**: TC-COMP-050 and TC-COMP-052 pin every `ProblemPage` field as the reader
  returns it.
- **Observed evidence**: `review2-next-cursor-derived`
  (`next_cursor=value.rows[-1].symbol if value.rows else None`) survives. In every fixture,
  either the page is empty with a `None` cursor, or its cursor equals its last row's symbol. A
  final page with rows and a `null` cursor, which the reader returns whenever no `limit + 1`th
  stock exists, is never served. The probe on such a page gives `"ZZZ"` under the mutant; the
  real code gives `null`.
- **Expected evidence/behavior**: RD (`component-design-data-health-reader.md:319`) and
  `reader.py:86`: `next_cursor` is the last kept symbol only when a further stock exists. AD 2.4
  (`:213`): "`next_cursor` (symbol or null)".
- **Impact**: a cursor derived in the API layer would offer a further page after the last
  one. Data health would show a "more" control that returns an empty page. No test in this
  story fails.
- **Required remediation**: not blocking. Add a problem-page fixture with rows and
  `next_cursor=None` (a final page) to the literal assertions, so the mutant is killed.

### IR-003 — The plan still describes the bare `_client` and the `"unknown"` envelopes

- **Severity**: LOW
- **Scope**: delta. The rework changed `_client`, `_problems_refusal` and the plan's Other Notes
  without updating the plan text that describes them.
- **Status**: OPEN
- **Acceptance criteria**: N/A (plan evidence)
- **Tasks**: T005; the Phase 2 shared harness; Notes, Resolved Conflict 3
- **Files**: `CAP-003-E2-S4-tasks.md` line 100 (the `_client` recipe, no middleware), line 107
  (T005: both envelopes `"request_id": "unknown"`), line 219 (Resolved Conflict 3:
  "`request_id` `"unknown"` (no request-id middleware on the minimal app)"), line 242 (the
  rewritten Other Notes line)
- **Claim challenged**: the plan describes the tests the rework delivered.
- **Observed evidence**: only the Other Notes "Equivalent mutants" line was rewritten. T005,
  the shared harness and Resolved Conflict 3 still describe a bare app and `"unknown"`, which
  disagree with `test_api_data_health_routes.py:98-101` and `:114`.
- **Expected evidence/behavior**: the plan is the source of truth for the tasks the review
  verifies (skill C). The rework's own note says the tests stamp the id.
- **Impact**: a later reader or re-review sees a plan that contradicts its tests. It is the
  same contradiction that hid IR-001.
- **Required remediation**: amend T005, the harness paragraph and Resolved Conflict 3 so they
  describe both the stamped and the unstamped refusal as delivered after IR-001's fix.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (single-row problem pages; `manual:5` and `manual:35` survive) | RESOLVED | `PAGE_TWO_ROWS` and `EXPECTED_PAGE_TWO_ROWS` (`test_api_data_health_models.py:93-107`, `:232-264`); `test_a_multi_row_problem_page_keeps_every_row_in_the_readers_order` (`:462-465`); `test_problems_returns_a_multi_row_page_unchanged` (`test_api_data_health_routes.py:162-167`). My run kills `manual:5`, `manual:35` and `review2-retryable-constant` |
| v1/IR-002 (cursor refusal `request_id` unpinned; `manual:23` survives; plan equivalence note wrong) | RESOLVED | `_client` stamps `req-test-1` (`:98-101`) and `_problems_refusal` expects it (`:114`); `manual:23` and `review2-request-id-from-header` are killed. The plan note at line 242 is corrected. The fix removed the fallback's only assertion, which is new finding IR-001 |
| v1/IR-003 (TDD mutation block omits a planned mutant and counts three stillborn mutants as kills) | RESOLVED | cycle-2 runs `rv:checks-none-when-never`, killed (log `src_factorflow_api_data_health_models.py_rv_checks-none-when-never.log`). Its description records the three `remove-attribute` mutants as stillborn and leaves them out, which v1's remediation allowed. cycle-1's block is left as history. The runner's stillborn pattern is unchanged (harness work); this review passed `--stillborn-pattern` instead |

## Scope and Plan Deviations

- **Justified, plan Resolved Conflicts 3 and 4**: as v1. The minimal app now also carries a
  test-only stamping middleware, a deviation from the harness recipe (IR-001, IR-003).
- **Benign, carried from v1**: `test_api_data_health_routes.py:25-35` imports fixtures and
  literals from the models test module instead of redeclaring them. They are still hand-written
  literals.
- **Benign, extra tests**: `test_a_multi_row_problem_page_keeps_every_row_in_the_readers_order`
  and `test_problems_returns_a_multi_row_page_unchanged` are not in the plan's task text. v1
  IR-001 required them, and they implement TC-COMP-050 and TC-COMP-052.
- **Bookkeeping**: the plan's frontmatter gained `updated: 2026-11-14` and
  `last_reworked_review`. The story is unchanged since v1 (same content revision).
- **Out-of-scope changes**: none. No production, delivered or configuration file changed in the
  rework.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: rework under `$story-coding` with the task file
  `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4-tasks.md`
  and this report.
  - Restore an assertion that the cursor refusal carries `"request_id": "unknown"` when no id is
    stamped, keeping the stamped-id assertion, so that `review2-request-id-fallback` is killed
    (IR-001).
  - Amend plan T005, the harness paragraph and Resolved Conflict 3 to match (IR-003).
  - Optionally, add a final-page fixture with rows and `next_cursor=None` (IR-002, non-blocking).
  - No production change is required.
  - Then rerun `$adversarial-review`. This report is its baseline (`reviewed_head` `5a18dda`,
    with `CAP-003-E2-S4-implementation-review-v2-mutation.json` for `scope --previous`). That file
    carries `review2-request-id-fallback` as `delta`, so it is carried and blocks, and
    `review2-next-cursor-derived` as `late`, so it stays non-blocking.
- **Warnings accepted downstream**: N/A
