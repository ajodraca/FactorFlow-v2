---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S4-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E2-S4"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-11-14T23:08:17Z"
reviewed_head: "7fcc07bafb71217b78219c3646f168092e2169b7"
review_base: "1c4c2e31f3243727e4c5b84a2feb0caae8f1363a"
reviewed_state_revision: "sha256:ba441631cd15d33b8f196cc5d307d800f525a44aa52f340417a513ca0697a9ba"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-11-14T23:16:00Z
  source_artifacts:
    - id: CAP-003-E2-S4
      version: "2 (sha256:8c21b0c32474b2b88fbca51a9dd7e15fd03ed2675acac684bfcae21175bd228f)"
    - id: CAP-003-E2-S4-tasks
      version: "1 (draft, updated 2026-11-14, last_reworked_review v2)"
    - id: CAP-003-E2-S4-tdd-evidence
      version: "cycle-1, cycle-2, cycle-3"
    - id: CAP-003-E2-S4-implementation-review
      version: "2 (baseline)"
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

# Implementation Review: CAP-003-E2-S4 — Version 3

Supervised unattended run `run-20261114T141555Z`, unit u030, per `docs/unattended-mode.md`.
The review base is the merge base with the integration branch the driver supplied,
`usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z`. The baseline is review v2
(`CHANGES-REQUIRED`, `reviewed_head` `5a18dda`, with its `-mutation.json`). This review recorded
no decision: every scope below comes from `git diff 5a18dda..HEAD` and `mutation-run.py scope`,
and no question needed a judgement those two do not settle.

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 13/13 verified |
| Required validation | 9/9 passed |

The rework (`7fcc07b`, TDD cycle-3) changed tests and evidence only. Production code is
byte-identical to v1 and v2: `git diff dc2129c..HEAD -- src` and `git diff 5a18dda..HEAD -- src`
are both empty. It remains correct against every acceptance criterion.

v2's blocking finding is resolved. `_client` gained `stamp_request_id` (default `True`), and a
new test, `test_a_cursor_refusal_without_a_stamped_request_id_falls_back_to_unknown`, asserts the
cursor refusal's `"request_id": "unknown"` on an app without the stamping middleware. The
stamped-id assertions stay. In my run, `review2-request-id-fallback` (carried) is killed, and so are
`manual:23` and `review2-request-id-from-header`. v2's non-blocking IR-002 is resolved too: a final
page with rows and a `null` cursor is now pinned, and `review2-next-cursor-derived` is killed.

Every required validation command passes. That includes the full suite with the `postgres`
tests: 2880 passed, v2's 2878 plus the rework's 2 tests.

Three non-blocking findings remain:

- **IR-001** (MEDIUM, `late`): six hand-written cross-field mutants survive. The fixtures give
  fields that hold distinct facts the same value: `absent_count` equals `behind_count`,
  `absent_count` equals `problem_count`, each count equals the length of its capped symbol list,
  and `requested_at` equals `started_at`. Every mutated line is unchanged since the baseline, and
  the fixtures are too, so these are `late` and cannot block (step H).
- **IR-002** (LOW, `carried`): v2 IR-003. The plan's T005, its shared harness and its Resolved
  Conflict 3 still describe a bare `_client` and `"unknown"` envelopes. cycle-3 says so
  explicitly and leaves it.
- **IR-003** (LOW, `delta`): `cycle-3.patch` contains two earlier copies of itself, nested.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4.md` (v2, status `in-review`, content revision unchanged since v1) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4-tasks.md` (v1, draft, `last_reworked_review: CAP-003-E2-S4-implementation-review-v2.md`) |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E2-S4-run-20261114T141555Z` |
| HEAD | `7fcc07bafb71217b78219c3646f168092e2169b7` (`feat(CAP-003-E2-S4): story-coding cycle 3, review rework of implementation-review-v2`) |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` → `1c4c2e31f3243727e4c5b84a2feb0caae8f1363a`, from `pipeline-state.py review-base --base-ref`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0). Five commits in `base..HEAD`: `dc2129c` (coding), `711c8fb` (review v1), `5a18dda` (rework 1), `8ad371a` (review v2), `7fcc07b` (rework 2) |
| Working tree | clean: no staged, unstaged or untracked non-ignored files, before and after validation |
| Changed files reviewed | 106 in `base..HEAD` (104 added, 2 modified): 4 code, 3 story artifacts, 4 review artifacts (v1, v2), 95 TDD evidence files. Since the baseline, 14: 2 test files, the task plan, the TDD evidence file, 8 cycle-3 evidence files, and the 2 review-v2 artifacts. No production file |
| Baseline | v2 (`CHANGES-REQUIRED`), `reviewed_head` `5a18ddaecf469a666f30dda02f7325513528ea3b`, with `CAP-003-E2-S4-implementation-review-v2-mutation.json` |

`pipeline-state.py check --stage adversarial-review --base-ref …` answers `READY — review changes
were reworked; a new review version is required`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/data_health_models.py` | added (unchanged since v1) | AC-11, AC-13, AC-19, DAC-E2-11, DAC-E2-12, DAC-E2-S4-1; T009 |
| `src/factorflow/api/routes/data_health.py` | added (unchanged since v1) | AC-13, DAC-E2-3, DAC-E2-S4-2 to DAC-E2-S4-4; T010 |
| `tests/unit/test_api_data_health_models.py` | added; modified since baseline | TC-COMP-037, TC-COMP-050; T002 to T004, T008. Rework: `test_a_final_page_with_rows_keeps_its_null_cursor` (`:468-472`, v2 IR-002) |
| `tests/unit/test_api_data_health_routes.py` | added; modified since baseline | TC-COMP-051 to TC-COMP-053; T005 to T008. Rework: `_client(..., stamp_request_id=True)` (`:92-109`) and `test_a_cursor_refusal_without_a_stamped_request_id_falls_back_to_unknown` (`:154-170`, v2 IR-001) |
| `docs/.../stories/CAP-003-E2-S4.md` | modified | Status `planning` → `in-review` only (coding commit) |
| `docs/.../stories/CAP-003-E2-S4-tasks.md` | modified | 13 checkbox flips (coding); Other Notes line 242 (rework 1); `last_reworked_review` → v2 (rework 2). The T005, harness and Resolved Conflict 3 text is still stale (IR-002) |
| `docs/.../stories/CAP-003-E2-S4-tdd-evidence.yaml` | added; modified since baseline | T013: cycle-3 appended; cycle-1 and cycle-2 untouched |
| `docs/.../stories/CAP-003-E2-S4-evidence/` | added | T013: cycle-1 (75 files), cycle-2 (12 files), cycle-3 (`cycle-3.patch`, `mutants-cycle-3.json`, `mutation-cycle-3-results.json`, `red-cycle-3-rework.log`, 4 run logs) |
| `docs/.../stories/CAP-003-E2-S4-implementation-review-v1.md`, `-v1-mutation.json`, `-v2.md`, `-v2-mutation.json` | added | Review v1 and v2 output (not the coder's) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `data_health_models.py:229-259` `DataHealthResponse`; `routes/data_health.py:39-43` | `test_data_health_serialises_every_field_with_nulls_present`; `test_data_health_delegates_once_with_one_connection` | Unchanged since v1. The verdict counts and both checks are carried; the part counts' cross-field pinning is weak (IR-001, late) |
| AC-13 | SATISFIED | `data_health_models.py:125-168`; `routes/data_health.py:46-70` | `test_problem_page_serialises_every_field`; `test_a_multi_row_problem_page_keeps_every_row_in_the_readers_order`; `test_a_final_page_with_rows_keeps_its_null_cursor`; `test_problems_returns_a_multi_row_page_unchanged` | Rows, failures, `retryable` and now a `null` `next_cursor` on a page with rows are pinned |
| AC-17 | SATISFIED | `git diff --name-status base..HEAD -- src tests` shows four `A` lines and no `M`; `api/app.py` does not mention `data_health` (`grep` exit 1) | The seven delivered API suites: 144 passed (T011). Full suite passed | DEC-0211 |
| AC-19 | SATISFIED | Field names follow §4.2 and RD 2.2 | `test_responses_keep_the_domain_vocabulary_with_no_sentence_or_tier` | Unchanged since v1 |
| DAC-E2-3 | SATISFIED | `routes/data_health.py:49`, `:58-66` | `test_a_limit_outside_one_to_five_hundred_is_refused_and_never_echoed[limit=0,limit=501]`, `test_a_cursor_that_is_not_a_symbol_is_refused_and_never_echoed`, `test_only_validated_values_reach_the_reader` | Never clamped; nothing echoed; no checkout before a refusal |
| DAC-E2-11 | SATISFIED | Every field required; no `exclude_none` | TC-COMP-050 literals | `response_model_exclude_none=True` is killed on all three routes (`manual:17`, `review3-attention-exclude-none`, `review3-problems-exclude-none`) |
| DAC-E2-12 | SATISFIED | No forbidden field name; no tier or sentence | `test_responses_keep_the_domain_vocabulary_with_no_sentence_or_tier` | Plan Resolved Conflict 1 reading |
| DAC-E2-S4-1 | SATISFIED | As AC-11 and DAC-E2-11 | `test_attention_serialises_every_field_with_nulls_present`, `test_every_timestamp_carries_an_offset`, `test_an_ended_download_carries_its_end_instant`, `test_zero_counts_stay_zero_and_absent_counts_are_null` | `failures[].cause` excluded per story v2 |
| DAC-E2-S4-2 | SATISFIED | `routes/data_health.py:60-66` | `test_a_cursor_that_is_not_a_symbol_is_refused_and_never_echoed`, `test_a_cursor_refusal_without_a_stamped_request_id_falls_back_to_unknown`, `test_a_limit_outside_one_to_five_hundred_is_refused_and_never_echoed` | Code, message, resource and no echo are pinned. The request id is pinned both stamped (`req-test-1`) and unstamped (`"unknown"`) |
| DAC-E2-S4-3 | SATISFIED | `routes/data_health.py:35-36, 42-43, 67-70` | `test_*_delegates_once_with_one_connection`; `test_problems_returns_a_multi_row_page_unchanged`; `test_a_database_error_propagates_uncaught` | One call, one checkout, `excinfo.value is err` on all three paths |
| DAC-E2-S4-4 | SATISFIED | No SQL or logging in the router; validated values only | `test_only_validated_values_reach_the_reader`, `test_the_router_holds_no_sql_and_no_logging`, `test_the_handlers_log_nothing`, `test_credential_present_is_a_json_boolean` | Unchanged since v1 |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | As v1 | No delivered file edited |
| T002 | complete | VERIFIED | `test_api_data_health_models.py:38-143` | `PAGE_TWO_ROWS` (`:93-107`) beside the planned fixtures. Distinct facts share values in several fixtures (IR-001) |
| T003 | complete | VERIFIED | `:356-433` | Unchanged |
| T004 | complete | VERIFIED | `:145-329` literals; `:436-506` | Adds `test_a_final_page_with_rows_keeps_its_null_cursor` (`:468-472`). Every planned kill holds |
| T005 | complete | VERIFIED | `test_api_data_health_routes.py:123-170` | Both refusal envelopes, no echo, no checkout. The cursor refusal is asserted stamped and unstamped. Deviation: the `limit` envelope is asserted with the stamped id, where T005 wrote `"unknown"` on a bare client. That fallback belongs to the delivered `_validation_error_handler`, not this story's code, and the stamped assertion also pins that the handler reads `request.state`. Justified by v1 IR-002 and v2 IR-001; the plan text was not amended (IR-002) |
| T006 | complete | VERIFIED | `:185-280` | Unchanged since v2 |
| T007 | complete | VERIFIED | `:283-325` | Unchanged |
| T008 | complete | VERIFIED | `:328-345`; models `:509-512` | Unchanged |
| T009 | complete | VERIFIED | `src/factorflow/api/data_health_models.py` | Unchanged since v1 |
| T010 | complete | VERIFIED | `src/factorflow/api/routes/data_health.py` | Unchanged since v1 |
| T011 | complete | VERIFIED | Rerun: 144 passed | — |
| T012 | complete | VERIFIED | Rerun: ruff, format, mypy, build and the full suite all pass; the test comments name TC-COMP-037 and 050 to 053; `git diff --stat base..HEAD -- src tests` lists exactly the four planned files | — |
| T013 | complete | VERIFIED | cycle-3 in `CAP-003-E2-S4-tdd-evidence.yaml`; `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings | `cycle-3.patch` sha256 `c5f72e3e…49bd2` equals `diff_sha256`. Its hunks for both test files and the plan equal `git diff 5a18dda..HEAD` byte for byte. The red log sha256 matches `red_log_sha256`, and the results sha256 matches `results_sha256`. Both cycle mutants are killed in the cycle's logs and in my run. The patch nests two earlier copies of itself (IR-003) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_responses_keep_the_domain_vocabulary_with_no_sentence_or_tier` / TC-COMP-037 | ADEQUATE | Unchanged since v1 | none |
| `test_attention_serialises_every_field_with_nulls_present` / TC-COMP-050 | ADEQUATE | Three hand-written literals; item and symbol order pinned | `stock_count` equals `len(symbols)` and `requested_at` equals `started_at` or `started_at` is null in every fixture (IR-001, late) |
| `test_data_health_serialises_every_field_with_nulls_present` / TC-COMP-050 | ADEQUATE | Three literals; `checks` object of nulls; `gap_stock_count` `0` against `null` | `absent_count` equals `behind_count` (daily prices) and `problem_count` (financials), and `exception_count` equals `len(exception_symbols)`, in every fixture (IR-001, late) |
| `test_problem_page_serialises_every_field`, `test_a_multi_row_problem_page_keeps_every_row_in_the_readers_order` / TC-COMP-050 | ADEQUATE | One-row and two-row pages; failure order, row order, `retryable` both ways | none |
| `test_a_final_page_with_rows_keeps_its_null_cursor` / TC-COMP-050 (new) | ADEQUATE | Two rows with `next_cursor=None`, against the two-row literal with `"next_cursor": None`. Kills `review2-next-cursor-derived` (cycle-3 log and my run) | none |
| `test_zero_counts_stay_zero_and_absent_counts_are_null`, `test_never_acquired_serialises_checks_as_an_object_of_nulls`, `test_every_timestamp_carries_an_offset`, `test_an_ended_download_carries_its_end_instant` / TC-COMP-050 | ADEQUATE | Unchanged | none |
| `test_credential_present_is_a_json_boolean` (T008) | ADEQUATE | Unchanged | none |
| `test_a_limit_outside_one_to_five_hundred_is_refused_and_never_echoed` / TC-COMP-051 | ADEQUATE | Exact delivered envelope with the stamped id; no reader; no checkout | none |
| `test_a_cursor_that_is_not_a_symbol_is_refused_and_never_echoed` / TC-COMP-051 | ADEQUATE | Exact envelope with `resource` `data-health`, the fixed message and the stamped id, for `not a symbol` and the empty cursor; no echo in either case | none. WEAK in v2; the fallback is now pinned by the next test |
| `test_a_cursor_refusal_without_a_stamped_request_id_falls_back_to_unknown` / TC-COMP-051 (new) | ADEQUATE | `_client(pool, stamp_request_id=False)`, `?cursor=`, exact envelope with `"request_id": "unknown"`, no checkout. Kills `review2-request-id-fallback` (cycle-3 log, and my run as `carried`). With `manual:23` and `review2-request-id-from-header` also killed, both branches of the `getattr` are pinned | none |
| `test_a_lower_case_cursor_is_normalised_before_the_reader` / TC-COMP-051 | ADEQUATE | Unchanged | none |
| `test_problems_returns_a_multi_row_page_unchanged`, `test_*_delegates_once_with_one_connection`, `test_an_empty_store_answers_zero_counts_and_never_acquired`, `test_a_database_error_propagates_uncaught` / TC-COMP-052 | ADEQUATE | Unchanged since v2. All use the default stamping `_client`, so their behaviour is as in v2 | none |
| `test_only_validated_values_reach_the_reader`, `test_the_router_holds_no_sql_and_no_logging`, `test_the_handlers_log_nothing` / TC-COMP-053 | ADEQUATE | Unchanged | none |
| `test_the_route_table_is_three_reads`, `test_problems_is_served_by_the_problems_handler` (T008) | ADEQUATE | Unchanged | none |

Isolation and determinism: every test builds its own app and pool. The new parameter only removes
the middleware, and its default keeps every earlier test's app as in v2. Fixtures are literals.
There is no clock, network or database dependence.

**Independent mutation run** (E.9). I generated over `1c4c2e3..HEAD` with `--cycle review`:
60 catalogue mutants, the same 60 ids as v1 and v2. I added 8 hand-written mutants of my own:

- `review3-daily-absent-behind-swapped`: daily prices `absent_count` and `behind_count` copied
  from each other;
- `review3-financials-absent-problem-swapped`: company financials `absent_count` and
  `problem_count` copied from each other;
- `review3-stock-count-from-symbols`: `stock_count=len(value.symbols)`;
- `review3-daily-exception-count-from-symbols` and
  `review3-financials-exception-count-from-symbols`: `exception_count=len(value.exception_symbols)`;
- `review3-requested-at-from-started`: `requested_at=value.started_at or value.requested_at`;
- `review3-attention-exclude-none`: `response_model_exclude_none=True` on `GET /api/attention`;
- `review3-problems-exclude-none`: the problems page returned as
  `JSONResponse(content=...model_dump(mode="json", exclude_none=True))`.

`scope --since 5a18dda --previous v2-mutation.json` added v2's 42 hand-written mutants. It tagged
101 `carried` and 9 `late`, and no previous mutant failed to apply. I ran the set with the focused
suites and the stillborn pattern `^E\s+SyntaxError`, as v2 did.

Results: 110 mutants. 101 killed, 3 stillborn (the three `remove-attribute` decorator removals;
each log reads `E   SyntaxError: invalid syntax`), 6 survived. The results are beside this report
as `CAP-003-E2-S4-implementation-review-v3-mutation.json`, unmodified (no scope override).

| Mutant | Outcome | Scope | Equivalent? | Disposition |
|--------|---------|-------|-------------|-------------|
| `routes/data_health.py:manual:review2-request-id-fallback` | killed | carried | n/a | v2 IR-001 resolved |
| `data_health_models.py:manual:review2-next-cursor-derived` | killed | late | n/a | v2 IR-002 resolved |
| `routes/data_health.py:manual:23`, `:manual:review2-request-id-from-header` | killed | carried | n/a | The stamped branch stays pinned |
| `routes/data_health.py:{32,39,46}:remove-attribute:1` | stillborn | carried | n/a | As v2 |
| `routes/data_health.py:manual:review3-attention-exclude-none`, `:manual:review3-problems-exclude-none` | killed | late | n/a | — |
| `data_health_models.py:manual:review3-daily-absent-behind-swapped` | **survived** | late | No. RD 2.2 and its prose (`component-design-data-health-reader.md:218-220`, `:407-412`) define `absent_count` (no prices stored) and `behind_count` (`covered_to` before `latest_session`) as different counts | IR-001 |
| `data_health_models.py:manual:review3-financials-absent-problem-swapped` | **survived** | late | No. RD `:229-230`, `:421-424`: `absent_count` (no fundamentals stored) and `problem_count` (latest outcome `failed` or `not_found`) differ | IR-001 |
| `data_health_models.py:manual:review3-stock-count-from-symbols` | **survived** | late | No. RD `:162-164`: `symbols` is "first three by symbol", and AD 2.4 (`component-design-data-health-api.md:208`) gives `symbols[≤3]`, so `stock_count` exceeds `len(symbols)` whenever more than three stocks have problems | IR-001 |
| `data_health_models.py:manual:review3-daily-exception-count-from-symbols`, `:manual:review3-financials-exception-count-from-symbols` | **survived** | late | No. RD `:223-224`, `:232-233`, `:415-418` and DEC-0220: `exception_count` is the size of the union and `exception_symbols` its first five (AD 2.4 `:210-211`, `exception_symbols[≤5]`) | IR-001 |
| `data_health_models.py:manual:review3-requested-at-from-started` | **survived** | late | No. §4.2 and AD 2.4 (`:208`) carry `requested_at` and `started_at` as separate instants; a queued run that started later would report its start as its request | IR-001 |
| The other 92 mutants | killed | carried | n/a | — |

Every survivor is `late` by git, not only by the tool. Each mutated line is unchanged since the
baseline: `git diff 5a18dda..HEAD -- src` is empty, and so is `git diff dc2129c..HEAD -- src`.
The fixtures that let the mutants through are unchanged too: the models test file's diff since
the baseline removes no line and adds only the new final-page test. So the baseline's suite lets
them through as well, and no rework removed a killing assertion. That is unlike v2's IR-001,
where DEC-0399 was needed. Under step H, none of the six makes its test `WEAK`.

## Independent Validation

`<repo>` is
`/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b/repos/factorflow-v2/FactorFlow-v2`.
`<scratch>` is this session's scratchpad. Every command ran inside the sandbox; none needed to
leave it.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | 8 checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | PASS | `1c4c2e31f3243727e4c5b84a2feb0caae8f1363a` |
| `uv run --directory <repo> pytest tests/unit/test_api_data_health_models.py tests/unit/test_api_data_health_routes.py -v -p no:cacheprovider` (plan: Focused) | `<repo>` | 0 | PASS | 30 passed in 0.61s: 11 models, 19 routes |
| `uv run --directory <repo> pytest tests/unit/test_api_no_secrets.py tests/unit/test_api_host_origin.py tests/unit/test_api_isolation.py tests/unit/test_api_errors.py tests/unit/test_api_models.py tests/unit/test_api_coverage_routes.py tests/unit/test_api_classifications_routes.py -q -p no:cacheprovider` (T011) | `<repo>` | 0 | PASS | 144 passed in 4.02s |
| `uv sync --all-extras --directory <repo>` | `<repo>` | 0 | PASS | Resolved 46 packages; checked 43; no change |
| `uv build --directory <repo> --out-dir <scratch>/dist` | `<repo>` | 0 | PASS | Built `factorflow-0.2.0.tar.gz` and `factorflow-0.2.0-py3-none-any.whl` into the scratchpad |
| `uv run --directory <repo> pytest -q -p no:cacheprovider` | `<repo>` | 0 | PASS | **2880 passed**, 2 warnings (starlette and anyio deprecations), 339.23s. The full suite with the `postgres` tests included (nothing skipped or deselected), not an exclusion run: v2's 2878 plus the rework's 2 tests |
| `uv run ruff check .` | `<repo>` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `<repo>` | 0 | PASS | 301 files already formatted |
| `uv run mypy src` | `<repo>` | 0 | PASS | No issues in 67 source files |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/.../CAP-003-E2-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 1c4c2e31f3243727e4c5b84a2feb0caae8f1363a --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir <repo> --range 1c4c2e3…7fcc07b --cycle review --out <scratch>/v3mut/generated.json`, plus 8 hand-written mutants | harness root | 0 | PASS | 60 generated, 68 in total |
| `python3 scripts/mutation-run.py scope --repo-dir <repo> --mutants <scratch>/v3mut/with-manual.json --since 5a18ddaecf469a666f30dda02f7325513528ea3b --previous <story dir>/CAP-003-E2-S4-implementation-review-v2-mutation.json --out <scratch>/v3mut/mutants.json` | harness root | 0 | PASS | 110 mutants: `carried` 101, `late` 9; 0 previous no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <scratch>/v3mut/mutants.json --jobs 4 --command 'cd {workdir} && uv run --all-extras pytest tests/unit/test_api_data_health_models.py tests/unit/test_api_data_health_routes.py -q -x -p no:cacheprovider' --stillborn-pattern '^E\s+SyntaxError' --out <scratch>/v3mut/results.json --logs <scratch>/v3mut/results-logs --work-root <scratch>/v3mut/work` | harness root | 3 | 6 SURVIVED (all `late`) | 101 killed, 3 stillborn, 6 survived. Results sha256 `f82782f3b25aeb6afb3173413f9c003b21f2ea4f4faffa1035724ee5b87c84f1`, persisted unchanged. A first attempt exited 1 before running anything, because the `--work-root` directory did not exist yet (`FileNotFoundError` in `tempfile.mkdtemp`). The rerun is the one recorded. This is the E.9 gate, recorded as findings, not as a required validation command |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e` | — | N/A | NOT RUN | Not required. The change set holds no frontend file, and neither the story's Validation nor the plan's Validation Plan names them |

The 9 required validation commands are the focused suite, T011, the six tech-stack v7
commands, and the TDD lint. All 9 passed.

### Validation Side Effects

- Before: HEAD `7fcc07bafb71217b78219c3646f168092e2169b7`; `git status --porcelain --untracked-files=all` empty; `code-revision` `sha256:ba441631cd15d33b8f196cc5d307d800f525a44aa52f340417a513ca0697a9ba`.
- After: HEAD unchanged (`7fcc07b`); status empty; `code-revision` unchanged (`sha256:ba441631…0697a9ba`).
- Unexpected tracked-file changes: none. The mutation run worked in clones under the
  scratchpad, and the build wrote to the scratchpad.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 2 · **total 3**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | MEDIUM | late | OPEN | Fixtures give distinct facts the same value, so six cross-field copy mutants survive |
| IR-002 | LOW | carried | OPEN | The plan still describes the bare `_client` and the `"unknown"` envelopes (v2 IR-003) |
| IR-003 | LOW | delta | OPEN | `cycle-3.patch` nests two earlier copies of itself |

### IR-001 — Fixtures give distinct facts the same value, so six cross-field copy mutants survive

- **Severity**: MEDIUM
- **Scope**: late. Every mutated line is in `data_health_models.py`, which is unchanged since
  v1. `mutation-run.py scope` tags all six `late`. The fixtures are unchanged since the baseline,
  so the gap existed there too. It does not make its tests `WEAK` and does not block (step H).
- **Status**: OPEN
- **Acceptance criteria**: AC-11 (the verdict counts), DAC-E2-S4-1 ("every §4.2 field"),
  DAC-E2-S4-3 ("the reader's value through `from_reader` unchanged")
- **Tasks**: T002 (fixtures), T004 (literals); T009 (`from_reader` "copying every field by name ...
  and nothing else")
- **Files**:
  - `src/factorflow/api/data_health_models.py:46` (`requested_at`), `:77` (`stock_count`),
    `:194-196` (daily `absent_count`, `behind_count`), `:199` (daily `exception_count`),
    `:216-217` (financials `absent_count`, `problem_count`), `:219` (financials
    `exception_count`)
  - Fixtures in `tests/unit/test_api_data_health_models.py`:
    - `ATTENTION_FULL` and `ATTENTION_UNNAMED` (`:44-79`): `Problems(2, ("AAA", "BBB"), …)`.
      `requested_at` is `T0` and `started_at` is `T0` or `None`.
    - `ATTENTION_EMPTY` (`:57-66`): `Problems(0, (), None)`.
    - `HEALTH_FULL` (`:108-125`): `DailyPricesCheck("exceptions", 1, None, 1, …, 2, ("AAA", "BBB"))`
      and `CompanyFinancialsCheck("exceptions", 1, 1, …, 2, ("AAA", "CCC"))`.
    - `HEALTH_ZEROS` (`:126-134`): every count `0`.
    - The ended download (`:516-535`): `requested_at` and `started_at` are both `T0`.
- **Claim challenged**: T004's literals "pin, field for field" every §4.2 field, so a wrong copy
  changes a literal.
- **Observed evidence**: in my run all six mutants survive the 30 focused tests (`30 passed` in
  each log): `review3-daily-absent-behind-swapped`, `review3-financials-absent-problem-swapped`,
  `review3-stock-count-from-symbols`, `review3-daily-exception-count-from-symbols`,
  `review3-financials-exception-count-from-symbols` and `review3-requested-at-from-started`. In
  every fixture, the fields each mutant confuses hold equal values. Two absent counts are `1`
  beside a behind count and a problem count of `1`. Each `exception_count` is `2` beside two
  symbols. `stock_count` is `2` beside two symbols, or `0` beside none. Every `requested_at` is
  `T0`, and its `started_at` is `T0` or `None`. Field presence and nulls are pinned. Which
  value lands in which of these fields is not.
- **Expected evidence/behavior**:
  - RD 2.2 (`component-design-data-health-reader.md:162-164`, `:218-233`) and its prose
    (`:407-425`) define each pair as different facts: `symbols` is the first three by symbol
    and `exception_symbols` the first five, while `stock_count` and `exception_count` are full
    counts (DEC-0220).
  - AD 2.4 (`component-design-data-health-api.md:208-211`) gives `symbols[≤3]` and
    `exception_symbols[≤5]`.
  - None of the six mutants is equivalent (E.9).
- **Impact**: a copy slip of this kind in a later edit of `data_health_models.py`, such as
  CAP-003-E8-S7 adding `cause`, would pass every test in this story. Two examples:
  - Data health would show a stock count of 3 beside 40 stocks needing fixing.
  - Absent and behind counts would swap on the Daily prices card.

  CAP-003-E2-S6's integration tests serve real reader output, but only some of their data would
  separate these pairs.
- **Required remediation**: not blocking. Give each confused pair different values in at least
  one fixture's literal, for example:
  - `absent_count` 1, `behind_count` 2, `problem_count` 3;
  - more than three problem symbols' worth of `stock_count`;
  - an `exception_count` above `len(exception_symbols)`;
  - a `started_at` later than `requested_at`.

  Then the six mutants are killed.

### IR-002 — The plan still describes the bare `_client` and the `"unknown"` envelopes

- **Severity**: LOW
- **Scope**: carried (v2 IR-003)
- **Status**: OPEN
- **Acceptance criteria**: N/A (plan evidence)
- **Tasks**: T005; the Phase 2 shared harness; Notes, Resolved Conflict 3
- **Files**: `CAP-003-E2-S4-tasks.md`:
  - line 100: the harness `_client(pool, *, raise_server_exceptions=True)`, with no middleware;
  - line 107: T005, both envelopes with `"request_id": "unknown"` on `_client(_FakePool())`;
  - line 219: Resolved Conflict 3, "`request_id` `"unknown"` (no request-id middleware on the
    minimal app)".
- **Claim challenged**: the plan describes the tests delivered.
- **Observed evidence**: since v2, the only change to the plan is `last_reworked_review`
  (`git diff 5a18dda..HEAD`). cycle-3's description says: "IR-003 (plan text) is a LOW
  plan-bookkeeping finding and is not addressed here." The tests now default to a stamping
  `_client` (`test_api_data_health_routes.py:92-109`). They assert the `limit` refusal with
  `req-test-1` (`:112-136`) and the cursor refusal both stamped and unstamped (`:139-170`).
- **Expected evidence/behavior**: the plan is the source of truth for the tasks the review
  verifies (skill C).
- **Impact**: a later reader sees a plan that contradicts its tests on how the minimal app is
  built and on which request id each refusal carries.
- **Required remediation**: not blocking. Amend T005, the harness paragraph and Resolved
  Conflict 3 to describe the default stamping `_client`, the `stamp_request_id=False` variant,
  and which refusal asserts which id.

### IR-003 — `cycle-3.patch` nests two earlier copies of itself

- **Severity**: LOW
- **Scope**: delta (cycle-3 evidence, added since the baseline)
- **Status**: OPEN
- **Acceptance criteria**: N/A (TDD evidence)
- **Tasks**: T013
- **Files**: `docs/.../CAP-003-E2-S4-evidence/cycle-3.patch` (997 lines)
- **Claim challenged**: the patch is the cycle's staged diff that the per-cycle reviews judged
  (plan T013; `story-coding` step C, "saving the exact bytes hashed as the patch the reviewers
  read").
- **Observed evidence**:
  - The patch's first file is `cycle-3.patch` itself, as a new 654-line file. That copy in turn
    opens with a 324-line copy of the same file. The fingerprint was therefore taken at least
    three times, each time with the previous patch staged.
  - The final bytes do hash to `diff_sha256` (`c5f72e3e…49bd2`), and the lint passes.
  - The code, test and plan hunks (patch lines 911-997) equal `git diff 5a18dda..HEAD` for those
    files byte for byte.
  - cycle-2's patch has no such nesting.
- **Expected evidence/behavior**: one fingerprint of the cycle's staged diff, without earlier
  patch copies, so a reader can see what the per-cycle reviews read.
- **Impact**: 654 of the patch's 997 lines are nested copies. The evidence does not show which
  of the three staged states the code-review and spec-drift subagents judged. The substantive
  hunks are identical in all three, so no unreviewed change is hidden.
- **Required remediation**: not blocking. In later cycles, keep the patch path out of the
  staged diff when fingerprinting, or fingerprint once after staging.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 (request-id stamping replaced the only assertion on the cursor refusal's `"unknown"` fallback; `review2-request-id-fallback` survived) | RESOLVED | `_client(..., stamp_request_id: bool = True)` (`test_api_data_health_routes.py:92-109`). `test_a_cursor_refusal_without_a_stamped_request_id_falls_back_to_unknown` (`:154-170`) asserts the exact envelope with `"request_id": "unknown"` and no checkout. The stamped assertions are kept (`:112-151`). In my run, `review2-request-id-fallback` is killed (scope `carried`), and so are `manual:23` and `review2-request-id-from-header`. The cycle-3 log shows the same kill |
| v2/IR-002 (`next_cursor` derived from the last row survived) | RESOLVED | `test_a_final_page_with_rows_keeps_its_null_cursor` (`test_api_data_health_models.py:468-472`) serialises two rows with `next_cursor=None` against the literal with `"next_cursor": None`. `review2-next-cursor-derived` is killed in my run and in the cycle-3 log (`{'next_cursor': 'BBB'} != {'next_cursor': None}`) |
| v2/IR-003 (plan text still describes the bare `_client` and `"unknown"` envelopes) | STILL OPEN | Plan lines 100, 107 and 219 are unchanged (`git diff 5a18dda..HEAD` touches only `last_reworked_review`). cycle-3 declines it explicitly. Carried as IR-002 (LOW) |

## Scope and Plan Deviations

- **Justified, plan Resolved Conflicts 3 and 4**: as v1. The minimal app carries a test-only
  stamping middleware by default, and the new parameter removes it (IR-002 covers the plan text).
- **Justified, T005 `limit` envelope**: asserted with the stamped id instead of `"unknown"`. That
  fallback is the delivered handler's, outside this story's code (see Task T005).
- **Benign, carried from v1**: `test_api_data_health_routes.py:25-35` imports fixtures and
  literals from the models test module instead of redeclaring them. They are still hand-written
  literals.
- **Benign, extra tests**: `test_a_final_page_with_rows_keeps_its_null_cursor` and
  `test_a_cursor_refusal_without_a_stamped_request_id_falls_back_to_unknown` are not in the plan's
  task text. v2's IR-002 and IR-001 asked for them, and they implement TC-COMP-050 and
  TC-COMP-051.
- **Bookkeeping**: the plan's `last_reworked_review` now names v2. The story is unchanged since v1
  (same content revision) and still reads `in-review`. `projects/factorflow-v2/decisions/DEC-0399.md`,
  v2's decision record, is untracked in the harness checkout. That is the driver's to commit, and
  outside the component change set.
- **Out-of-scope changes**: none. No production, delivered or configuration file changed in the
  rework.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: run `$doc-sync` for CAP-003-E2-S4 with the task file
  `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4-tasks.md`
  and this report.
- **Warnings accepted downstream**: IR-001 (MEDIUM, late), IR-002 (LOW), IR-003 (LOW). IR-001's
  fixture separation can go into any later rework of `test_api_data_health_models.py`, at the
  latest CAP-003-E8-S7, which extends TC-COMP-050's field check to `cause`.
