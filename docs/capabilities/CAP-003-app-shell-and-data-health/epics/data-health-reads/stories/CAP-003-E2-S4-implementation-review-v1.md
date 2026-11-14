---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E2-S4"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-14T21:45:27Z"
reviewed_head: "dc2129c01caa57ba41d6459d22c56c214270bc2f"
review_base: "1c4c2e31f3243727e4c5b84a2feb0caae8f1363a"
reviewed_state_revision: "sha256:0e9a11a6fb426ee27917897263f95cf0510511d937c410430e62292b4b07da80"
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
  timestamp: 2026-11-14T21:55:47Z
  source_artifacts:
    - id: CAP-003-E2-S4
      version: "2 (sha256:8c21b0c32474b2b88fbca51a9dd7e15fd03ed2675acac684bfcae21175bd228f)"
    - id: CAP-003-E2-S4-tasks
      version: "1 (draft)"
    - id: CAP-003-E2-S4-tdd-evidence
      version: "cycle-1"
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
    - id: CAP-003-coverage-matrix
      version: "2"
    - id: tech-stack
      version: "7"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E2-S4 — Version 1

Supervised unattended run `run-20261114T141555Z`, unit u026, per `docs/unattended-mode.md`.
The review base is the merge base with the integration branch the driver supplied,
`usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z`. This review recorded no decision:
the skill's own rule settled the equivalence of every mutant (E.9), so no question was left
for the owner.

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 13/13 verified |
| Required validation | 9/9 passed |

The production code is correct. Both new modules match component design data-health-api
(AD) 2.3 and 2.4 and system design §4.2. Every delivered suite passes unchanged. The full
suite passes, `postgres` tests included: 2876 tests. Lint, format, type check, build and
the TDD-evidence lint are all clean. No delivered file is touched (AC-17, DEC-0211).

The gate fails on test strength. I regenerated the mutants over both changed production
files: 60 from the catalogue and 35 of my own, including the plan's eight hand-written
ones. 92 are killed and 3 survive, and none of the 3 is equivalent:

- **IR-001**: every problem-page fixture holds exactly one row. `from_reader` could reverse
  the reader's rows or keep only the first, and all 26 story tests still pass. AC-13 says
  every problem row must carry its facts. DAC-E2-S4-3 says the reader's value comes back
  unchanged.
- **IR-002**: the cursor refusal's `request_id` is unpinned. Hard-coding it to `"unknown"`
  passes, because the minimal test app has no request-id middleware. The plan records this
  mutant as equivalent and says CAP-003-E2-S6 observes the id through `create_app`.
  CAP-003-E2-S6's plan asserts the id on the `500`, the `400` and the `404`, but not on this
  `422`. AD 2.3 specifies the source of the id, so the mutant changes specified behaviour.

Each survivor makes a mandatory test `WEAK`, and the skill makes that at least HIGH (step H).
One LOW evidence-quality finding (IR-003) is recorded alongside.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4.md` (v2, status `in-review`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4-tasks.md` (v1, draft) |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E2-S4-run-20261114T141555Z` |
| HEAD | `dc2129c01caa57ba41d6459d22c56c214270bc2f` (`feat(CAP-003-E2-S4): story-coding, data-health-api router and response models`) |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` → `1c4c2e31f3243727e4c5b84a2feb0caae8f1363a`, from `pipeline-state.py review-base --base-ref`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0); one commit in `base..HEAD` |
| Working tree | clean: no staged, unstaged or untracked non-ignored files, before and after validation |
| Changed files reviewed | 82 (4 code, 3 story artifacts, 75 TDD evidence files) |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review` without `--base-ref` answers `BLOCKED`.
With the default branch as its base, the TDD lint sees CAP-003-E2-S1 to E2-S3's commits as
unnamed. With the driver's `--base-ref` it answers `READY — story is ready for independent
review`, and that state is the one reviewed.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/data_health_models.py` | added | AC-11, AC-13, AC-19, DAC-E2-11, DAC-E2-12, DAC-E2-S4-1; T009 |
| `src/factorflow/api/routes/data_health.py` | added | AC-13, DAC-E2-3, DAC-E2-S4-2 to DAC-E2-S4-4; T010 |
| `tests/unit/test_api_data_health_models.py` | added | TC-COMP-037, TC-COMP-050; T002, T003, T004, T008 |
| `tests/unit/test_api_data_health_routes.py` | added | TC-COMP-051 to TC-COMP-053; T005 to T008 |
| `docs/.../stories/CAP-003-E2-S4.md` | modified | Status `planning` → `in-review` only; story-coding hand-off |
| `docs/.../stories/CAP-003-E2-S4-tasks.md` | modified | 13 checkboxes `[ ]` → `[x]` only (word diff: 13 `+[x]`, 13 `-[ ]`, nothing else) |
| `docs/.../stories/CAP-003-E2-S4-tdd-evidence.yaml` | added | T013 |
| `docs/.../stories/CAP-003-E2-S4-evidence/` (red log, cycle patch, mutants, results, 71 run logs) | added | T013 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `data_health_models.py:229-259` `DataHealthResponse` (`never_acquired`, `followed_count`, `affected_count`, `checks{daily_prices, company_financials}`, `problems`); `routes/data_health.py:39-43` | `test_api_data_health_models.py::test_data_health_serialises_every_field_with_nulls_present`; `test_api_data_health_routes.py::test_data_health_delegates_once_with_one_connection` | The literal pins every count and both checks. The `HEALTH_ZEROS` `0` is kept apart from the `HEALTH_FULL` `null` |
| AC-13 | SATISFIED | `data_health_models.py:125-168` (`FailureResponse`, `ProblemRowResponse`, `ProblemPageResponse`); `routes/data_health.py:46-70` | `test_problem_page_serialises_every_field`; `test_problems_delegates_once_with_one_connection` | The code maps every row and every failure. The test evidence pins only a one-row page: rows past the first are unpinned (**IR-001**) |
| AC-17 | SATISFIED | `git diff --name-status base..HEAD -- src tests` shows four `A` lines and no `M`. `app.py` does not reference `data_health` (`grep` empty), so the router is unregistered | The seven delivered API suites pass unchanged: 144 passed (T011). Full suite: 2876 passed | DEC-0211: the `include_router` line is CAP-003-E2-S5's |
| AC-19 | SATISFIED | Field names in `data_health_models.py` follow §4.2 and RD 2.2 | `test_responses_keep_the_domain_vocabulary_with_no_sentence_or_tier` | Literal field-name set equality, a forbidden-name set, and a tier-word scan of serialised strings |
| DAC-E2-3 | SATISFIED | `routes/data_health.py:49` `Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE)`; `:58-66` cursor normalised and refused before any checkout | `test_a_limit_outside_one_to_five_hundred_is_refused_and_never_echoed[0,501]`, `test_a_cursor_that_is_not_a_symbol_is_refused_and_never_echoed`, `test_only_validated_values_reach_the_reader` (1, 500, default 50) | Never clamped: the bounds are inclusive and a refusal reaches no reader. Exact-envelope equality proves nothing is echoed |
| DAC-E2-11 | SATISFIED | Every field is required with no default, no `exclude_none` and no `model_config` | TC-COMP-050 literals: `null` keys present for `prices_as_of`, `newest_completed_at`, `progress.total`, `gap_stock_count`, `latest_session`, `as_of`; `0` kept as `0` | `response_model_exclude_none=True` on the route is killed (manual mutant 17) |
| DAC-E2-12 | SATISFIED | No field is named `stock`, `stocks`, `download` or `downloads`; no tier or sentence field | `test_responses_keep_the_domain_vocabulary_with_no_sentence_or_tier` | Read as plan Resolved Conflict 1 reads it: compound names from §4.2 are kept |
| DAC-E2-S4-1 | SATISFIED | As AC-11 and DAC-E2-11; `prices_as_of` and `latest_session` are `date`; timestamps are `datetime` | `test_attention_serialises_every_field_with_nulls_present`, `test_every_timestamp_carries_an_offset`, `test_an_ended_download_carries_its_end_instant` | `Z` and `-05:00` offsets are both pinned. `failures[].cause` is excluded, as the story's v2 note says |
| DAC-E2-S4-2 | SATISFIED | `routes/data_health.py:60-66` `error_response(422, "validation_error", "`cursor` must be a stock symbol.", ..., resource=_RESOURCE)` | `test_a_cursor_that_is_not_a_symbol_is_refused_and_never_echoed`, `test_a_limit_outside_one_to_five_hundred_is_refused_and_never_echoed` | Code, message, resource and the absence of an echo are pinned. The refusal's `request_id` is not (**IR-002**) |
| DAC-E2-S4-3 | SATISFIED | `routes/data_health.py:35-36, 42-43, 67-70`: one `connection()` each, one reader call, no `try` | `test_*_delegates_once_with_one_connection` (args `(_CONN,)`, kwargs, `checkouts == 1`); `test_a_database_error_propagates_uncaught` (`excinfo.value is err`) | "Unchanged" is pinned for one-row pages only (**IR-001**) |
| DAC-E2-S4-4 | SATISFIED | No SQL and no logging in the router; `read_problems(conn, cursor=cursor_symbol, limit=limit)` after validation; `credential_present: bool` | `test_only_validated_values_reach_the_reader`, `test_the_router_holds_no_sql_and_no_logging`, `test_the_handlers_log_nothing`, `test_credential_present_is_a_json_boolean` | SEC-INP-002 binding happens in the reader (CAP-003-E2-S1). This router passes only validated values |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `data_health/models.py` holds the 13 RD 2.2 dataclasses. `data_health/__init__.py` exports the three readers. `read_problems(conn, *, cursor, limit)` (`reader.py:60`); `bounds.py` 50/500; `symbols.normalise`/`is_valid`; `error_response` signature; `_validation_error_handler` | No delivered file is edited (diff name-status) |
| T002 | complete | VERIFIED | `test_api_data_health_models.py:38-128`: the fixtures match the plan value for value | `PAGE_FULL` has one row, as the plan specifies. That is the root of IR-001 |
| T003 | complete | VERIFIED | `:284-385`: the 48-name literal set equals the plan's; forbidden names; tier scan | — |
| T004 | complete | VERIFIED | `:130-281` hand-written literals; `:389-445` | Pins `items`, `failures` and string-list order, but a multi-row page is never exercised (IR-001) |
| T005 | complete | VERIFIED | `test_api_data_health_routes.py:110-150` | Envelope equality, `checkouts == 0`, `ko` → `KO`. The `request_id` is constant on the minimal app (IR-002) |
| T006 | complete | VERIFIED | `:153-240` | Imports the fixtures and literals from the models test module rather than redeclaring them (see Deviations) |
| T007 | complete | VERIFIED | `:243-285` | (a), (b) and (c) are all present |
| T008 | complete | VERIFIED | `:288-305`; models file `:448-451` | — |
| T009 | complete | VERIFIED | `src/factorflow/api/data_health_models.py` | Fields in RD 2.2 order, all required, `from_reader` copies only, `checks` always an object. The module docstring names AC-19, DAC-E2-11, DAC-E2-12 and DAC-E2-S4-1 but not AC-11 or AC-13 (the routes module names those); cosmetic |
| T010 | complete | VERIFIED | `src/factorflow/api/routes/data_health.py` | Matches AD 2.3 line for line. No `try`, `commit` or logger. Ruff is clean without `noqa` |
| T011 | complete | VERIFIED | Rerun: 144 passed | — |
| T012 | complete | VERIFIED | Rerun: ruff, format, mypy, build and the full suite all pass; the diff lists only this story's files | — |
| T013 | complete | VERIFIED | `CAP-003-E2-S4-tdd-evidence.yaml` cycle-1; `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings | The mutation block omits one planned hand-written mutant and counts three syntax-error mutants as kills (IR-003) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_responses_keep_the_domain_vocabulary_with_no_sentence_or_tier` / TC-COMP-037 | ADEQUATE | Recursive field-name walk through `X \| None` and `list[X]`; exact literal set; forbidden names; no tier word in any string leaf of three populated dumps | none |
| `test_attention_serialises_every_field_with_nulls_present` / TC-COMP-050 | ADEQUATE | Three fixtures against hand-written literals: every key, `null` kept, offsets, UUID strings, item order | none |
| `test_data_health_serialises_every_field_with_nulls_present` / TC-COMP-050 | **WEAK** | Three fixtures against hand-written literals: `checks` object of nulls, `0` versus `null`, the `as_of` offset | The page has one row: reversal (`manual:5`) and truncation to the first row (`manual:35`) survive (IR-001) |
| `test_problem_page_serialises_every_field` / TC-COMP-050 | **WEAK** | `ProblemPageResponse.from_reader(PAGE_FULL)` equals the literal | Same single-row page; the same survivors (IR-001) |
| `test_zero_counts_stay_zero_and_absent_counts_are_null`, `test_never_acquired_serialises_checks_as_an_object_of_nulls`, `test_every_timestamp_carries_an_offset`, `test_an_ended_download_carries_its_end_instant` / TC-COMP-050 | ADEQUATE | Targeted restatements; the `ended_at` test closes the drop-field-copy that every other fixture's `None` would hide | none |
| `test_credential_present_is_a_json_boolean` (T008) | ADEQUATE | The annotation is `bool` and the dump is the JSON `true`; `bool` → `str` is killed (`manual:15`) | none |
| `test_a_limit_outside_one_to_five_hundred_is_refused_and_never_echoed` / TC-COMP-051 | ADEQUATE | Exact delivered envelope (`resource` `problems`, Resolved Conflict 3); no reader reached; no checkout | none |
| `test_a_cursor_that_is_not_a_symbol_is_refused_and_never_echoed` / TC-COMP-051 | **WEAK** | Exact envelope with `resource` `data-health` and the fixed message; no echo in either case; empty cursor refused; `checkouts == 0` | `request_id` is `"unknown"` on both sides, because the app has no request-id stamping: `manual:23` survives (IR-002) |
| `test_a_lower_case_cursor_is_normalised_before_the_reader` / TC-COMP-051 | ADEQUATE | `ko` reaches the reader as `KO` | none |
| `test_attention_delegates_once_with_one_connection`, `test_data_health_delegates_once_with_one_connection`, `test_problems_delegates_once_with_one_connection` / TC-COMP-052 | ADEQUATE for delegation | One call, `args[0] is _CONN`, exact kwargs, `limit` is an `int`, one checkout, exact body | The bodies use the single-row page, so "unchanged" adds nothing to IR-001 |
| `test_an_empty_store_answers_zero_counts_and_never_acquired` / TC-COMP-052 | ADEQUATE | `200`, zero counts, `latest_terminal_download` null, `checks` an object of nulls | none |
| `test_a_database_error_propagates_uncaught` / TC-COMP-052 | ADEQUATE | `excinfo.value is err` on all three paths. Wrapping the error is killed (`manual:31`) | none |
| `test_only_validated_values_reach_the_reader` / TC-COMP-053 | ADEQUATE | Default 50, inclusive bounds 1 and 500, trimmed and upper-cased cursor; `lt=`, `gt=1` and a default of 500 are all killed | none |
| `test_the_router_holds_no_sql_and_no_logging`, `test_the_handlers_log_nothing` / TC-COMP-053 | ADEQUATE | Static source scan plus a behavioural `caplog` check over three successes and one refusal | none |
| `test_the_route_table_is_three_reads`, `test_problems_is_served_by_the_problems_handler` (T008) | ADEQUATE | Exact path and method set; `@router.post` is killed (`manual:33`) | none |

**Independent mutation run** (E.9). I generated over `1c4c2e3..HEAD` with
`--cycle review`: 60 catalogue mutants (46 `drop-field-copy`, 7 `negate-boolean`,
3 `remove-attribute`, 2 `drop-defaulted-argument`, 2 `off-by-one`). I added 35 hand-written
mutants. They include all eight the plan names, among them `checks=None if
value.never_acquired else ChecksResponse(` with the `ChecksResponse | None` annotation, which
the coder did not run (killed). The rest are:

- dropped list copies: `symbols`, `items`, `failures` and both `exception_symbols`;
- replaced nested `from_reader` calls;
- `date` → `datetime` on `latest_session`;
- `bool` → `str` on `credential_present`;
- `lt=MAX_PAGE_SIZE`;
- a dropped `resource=`;
- the error `code`;
- the raw cursor, `cursor=None` and `limit=DEFAULT_PAGE_SIZE` passed to the reader;
- `if cursor_symbol and ...`;
- a checkout before validation;
- an exception-wrapping `try`;
- `get_data_health` calling `read_attention`;
- `@router.post`;
- `_RESOURCE = "problems"`;
- the `request_id` hard-coded;
- the rows reversed;
- the rows truncated to the first.

Results: 95 mutants, 92 killed, 3 survived. The results are beside this report as
`CAP-003-E2-S4-implementation-review-v1-mutation.json`.

| Mutant | Outcome | Equivalent? | Disposition |
|--------|---------|-------------|-------------|
| `data_health_models.py:manual:5`: `for row in value.rows` → `for row in reversed(value.rows)` | survived | No. System design §4.2 orders rows "by symbol (DEC-0201)", and DAC-E2-S4-3 returns the reader's value "unchanged" | IR-001 |
| `data_health_models.py:manual:35`: `for row in value.rows` → `for row in value.rows[:1]` | survived | No. AC-13 requires every problem row; DAC-E2-S4-3 requires the value unchanged | IR-001 |
| `routes/data_health.py:manual:23`: `request_id=getattr(request.state, "request_id", "unknown")` → `request_id="unknown"` | survived | No. AD 2.3 specifies the request's own id. The story's API contract makes the `422` "the delivered envelope", whose `request_id` comes from the request-id middleware (`api/errors.py` module docstring). Epic DAC-E2-10 says "every refusal carries a request id". The plan's equivalence note relies on CAP-003-E2-S6 observing the id, but that plan does not assert it on this refusal | IR-002 |
| `routes/data_health.py:32/39/46:remove-attribute:1` | scored killed; actually stillborn | n/a | Each log shows `E   SyntaxError: invalid syntax`. The runner's stillborn patterns match `^SyntaxError:` but not pytest's indented `E   SyntaxError` form, so these are compile failures scored as kills. The coder's run scored the same three the same way (IR-003) |

The two probes in the review scratchpad show that both behaviours can be observed in a unit
test. They write nothing to the component:

- A bare `FastAPI()` with a middleware that stamps `request.state.request_id = "req-probe-1"`
  answers the bad-cursor request with `request_id: "req-probe-1"`. Under `manual:23` it would
  answer `"unknown"`.
- A two-row `ProblemPage` (`AAA`, `BBB`) serialises as `["AAA", "BBB"]`. Under the survivors it
  would serialise as `["BBB", "AAA"]` or `["AAA"]`.

## Independent Validation

`<repo>` is
`/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b/repos/factorflow-v2/FactorFlow-v2`.
`<scratch>` is this session's scratchpad. Every command ran inside the sandbox.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | 8 checks passed |
| `python3 scripts/pipeline-state.py check ... --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | PASS | `READY`. Without `--base-ref` the answer is `BLOCKED` (see Review Subject) |
| `uv run --directory <repo> pytest tests/unit/test_api_data_health_models.py tests/unit/test_api_data_health_routes.py -v -p no:cacheprovider` (plan: Focused) | `<repo>` | 0 | PASS | 26 passed in 0.60s: 9 models, 17 routes |
| `uv run --directory <repo> pytest tests/unit/test_api_no_secrets.py tests/unit/test_api_host_origin.py tests/unit/test_api_isolation.py tests/unit/test_api_errors.py tests/unit/test_api_models.py tests/unit/test_api_coverage_routes.py tests/unit/test_api_classifications_routes.py -q -p no:cacheprovider` (T011) | `<repo>` | 0 | PASS | 144 passed |
| `uv sync --all-extras --directory <repo>` | `<repo>` | 0 | PASS | Resolved 46 packages; checked 43; no change |
| `uv build --directory <repo> --out-dir <scratch>/dist` | `<repo>` | 0 | PASS | Built `factorflow-0.2.0.tar.gz` and `factorflow-0.2.0-py3-none-any.whl`. `--out-dir` sends the artefacts to the scratchpad instead of the ignored `dist/`; the build itself is unchanged |
| `uv run --directory <repo> pytest -q -p no:cacheprovider` | `<repo>` | 0 | PASS | **2876 passed**, 2 warnings (starlette and anyio deprecations), 387.68s. This is the full suite with the `postgres` tests included, not an exclusion run: CAP-003-E2-S3 v2's 2850 plus this story's 26 |
| `uv run --directory <repo> ruff check .` | `<repo>` | 0 | PASS | All checks passed |
| `uv run --directory <repo> ruff format --check .` | `<repo>` | 0 | PASS | 301 files already formatted |
| `uv run --directory <repo> mypy src` | `<repo>` | 0 | PASS | No issues in 67 source files |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/.../CAP-003-E2-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 1c4c2e31f3243727e4c5b84a2feb0caae8f1363a --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir <repo> --range 1c4c2e3...HEAD --cycle review --out <scratch>/mutants.json`, plus 35 hand-written mutants | harness root | 0 | PASS | 60 generated, 95 in total |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <scratch>/mutants.json --jobs 4 --command 'cd {workdir} && uv run --all-extras pytest tests/unit/test_api_data_health_models.py tests/unit/test_api_data_health_routes.py -q -x -p no:cacheprovider' --out <scratch>/results.json --work-root <scratch>/mutwork` | harness root | 3 | 3 SURVIVED | 92 killed, 3 survived (IR-001, IR-002). Results sha256 `75d81ad691f07a534ba7f1daefb40517e947ba66206d57634867dc2f64b4dc5b`. This is the E.9 gate, recorded as findings, not as a required validation command |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e` | — | N/A | NOT RUN | Not required. The change set holds no frontend file, and neither the story's Validation nor the plan's Validation Plan names them |

The 9 required validation commands are the focused suite, T011, the six tech-stack v7
commands, and the TDD lint. All 9 passed.

### Validation Side Effects

- Before: HEAD `dc2129c01caa57ba41d6459d22c56c214270bc2f`; `git status --porcelain --untracked-files=all` empty; `code-revision` `sha256:0e9a11a6fb426ee27917897263f95cf0510511d937c410430e62292b4b07da80`.
- After: HEAD unchanged; status empty; `code-revision` unchanged (`sha256:0e9a11a6...b07da80`).
- Unexpected tracked-file changes: none. The mutation run worked in clones under the scratchpad, and the build wrote to the scratchpad.

## Findings

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 2 · MEDIUM 0 · LOW 1 · **total 3**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | initial | OPEN | Every problem-page fixture has one row, so `from_reader` may reverse the rows or drop all but the first unnoticed |
| IR-002 | HIGH | initial | OPEN | The cursor refusal's `request_id` is unpinned; the plan's "equivalent" note rests on a CAP-003-E2-S6 assertion that does not exist |
| IR-003 | LOW | initial | OPEN | The TDD mutation block omits one planned hand-written mutant and counts three syntax-error mutants as kills |

### IR-001 — Every problem-page fixture has one row, so `from_reader` may reverse or truncate the rows unnoticed

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-13, DAC-E2-S4-3, DAC-E2-S4-1. The code satisfies them, but the
  tests that should guard them cannot see this violation.
- **Tasks**: T002, T004, T006 (the tests that guard T009's `ProblemPageResponse.from_reader`)
- **Files**:
  - `src/factorflow/api/data_health_models.py:163-168` (`ProblemPageResponse.from_reader`,
    `rows=[ProblemRowResponse.from_reader(row) for row in value.rows]`)
  - `tests/unit/test_api_data_health_models.py:80-92` (`PAGE_FULL`, one `ProblemRow`),
    `:190-216` (`EXPECTED_PAGE_FULL`), `:399-411`
  - `tests/unit/test_api_data_health_routes.py:170-199` (bodies built from the same fixture)
- **Claim challenged**: TC-COMP-050 proves each model "through `from_reader`" field for
  field. TC-COMP-052 proves the handler returns the reader's value "through `from_reader`
  unchanged".
- **Observed evidence**:
  - `manual:5` reverses `value.rows`. `manual:35` keeps `value.rows[:1]`. Both survive with all
    26 story tests passing (`26 passed` in both logs).
  - Every `ProblemPage` in either test file has at most one row: `PAGE_FULL`, the empty pages,
    and `HEALTH_FULL.problems`, which is `PAGE_FULL`.
  - Each other list the models copy has at least two elements in some fixture: `items`,
    `failures`, `symbols` and `exception_symbols`. Their reversal or loss is killed.
  - The probe shows the real code keeps a two-row page as `["AAA", "BBB"]`, so the difference
    is observable at unit level.
- **Expected evidence/behavior**:
  - AC-13: "Every problem row MUST carry its failures' facts".
  - DAC-E2-S4-3: the reader's value is returned "through `from_reader` unchanged".
  - System design §4.2: "one row per stock ... ordered by symbol (DEC-0201)".
  - Plan T009: `from_reader` copies every field "and nothing else".
  - Skill E.9: a survivor that changes specified behaviour is not equivalent, and the test that
    should kill it is `WEAK`.
- **Impact**: suppose a regression drops every *Needs fixing* row after the first, or reorders
  them (building the list from a set or dict, a `[:1]` left over from debugging). It would
  pass this story's suite. Data health would then show one problem stock where the reader
  found many, while `affected_count` still reports the full number. That is a silent
  disagreement on the one screen that exists to show problems. CAP-003-E2-S6's integration
  test pages three stocks and would catch it later, but this review's catalogue covers only
  this story's lines, and a later story's review mutates only its own.
- **Required remediation**: add at least one problem-page fixture with two or more rows in an
  order that reversal would change, with distinct symbols and failures. Assert its serialised
  rows, in order, against a hand-written literal through `ProblemPageResponse.from_reader`.
  Asserting it through `DataHealthResponse.from_reader` or the problems route is optional.
  `manual:5` and `manual:35` must then be killed. Production code needs no change.

### IR-002 — The cursor refusal's `request_id` is unpinned; the plan's "equivalent" note rests on an assertion CAP-003-E2-S6 does not make

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-2, with the story's API contract ("`422
  validation_error` (delivered envelope)") and AC-17 (the delivered refusal's shape is
  preserved). The code satisfies them; the test cannot see the violation.
- **Tasks**: T005 (the test that guards T010's cursor refusal)
- **Files**:
  - `src/factorflow/api/routes/data_health.py:64`
    (`request_id=getattr(request.state, "request_id", "unknown")`)
  - `tests/unit/test_api_data_health_routes.py:89-107` (`_client`: a bare `FastAPI()` with no
    request-id stamping; `_problems_refusal` hard-codes `"request_id": "unknown"`) and
    `:126-138`
  - `CAP-003-E2-S4-tasks.md`, Other Notes, "Equivalent mutants"
- **Claim challenged**: the plan records `getattr(request.state, "request_id", "unknown")` →
  `"unknown"` as equivalent, because "the request id on these routes is observed through
  `create_app` in CAP-003-E2-S6".
- **Observed evidence**:
  - `manual:23` survives with `26 passed`.
  - CAP-003-E2-S6's plan asserts a request id on these routes only in three places:
    - T006: the `500 internal_error` body equals `X-Request-Id`;
    - T007: the `400 host_not_allowed` body;
    - T008: the `404 not_found` body for `/api/data-health/unknown`.
  - No E2-S6 task requests a bad cursor (`grep` for `422`, `validation_error` and `cursor` in
    `CAP-003-E2-S6-tasks.md` finds only paging cursors).
  - The deferral the plan relies on therefore does not exist, and no test in any planned story
    pins this refusal's id.
  - The probe gives the minimal app a one-line stamping middleware. The real handler then
    returns `"request_id": "req-probe-1"`; under the mutant it would return `"unknown"`.
- **Expected evidence/behavior**:
  - AD 2.3 specifies `request_id=getattr(request.state, "request_id", "unknown")`.
  - AD 2.2's sequence passes the request "with request_id" into the router before the `422`.
  - `src/factorflow/api/errors.py`'s module docstring: "`request_id` is filled from the
    request-id middleware ... so a reported failure is findable in the container log".
  - Epic DAC-E2-10: "every refusal carries a request id".
  - Skill E.9: "A mutant that changes behaviour any of them specifies is not equivalent, even
    when nothing in the system as built can observe the difference yet", and later stories'
    reviews "mutate only their own lines".
  - Plan Resolved Conflict 3 replaced TC-COMP-051's precondition (`create_app`, which stamps
    ids) with a bare app. That substitution is what made the id unobservable.
- **Impact**: once CAP-003-E2-S5 registers the router, a regression that drops the `getattr`
  makes every bad-cursor `422` carry `"unknown"`. The response's `X-Request-Id` header would
  hold the real id, and the body would disagree with it. The delivered `limit` refusal on the
  same route would carry the real id. The refusal could no longer be found in the container
  log by its body's id. No planned test would fail.
- **Required remediation**: make the cursor refusal's `request_id` observable in this
  story's tests and assert that the refusal carries the request's own id. Either stamp
  `request.state.request_id` in the test app with a minimal middleware or equivalent seam, or
  use another route to the same evidence. `manual:23` must then be killed. Remove or correct
  the plan note that calls this mutant equivalent. Production code needs no change.

### IR-003 — The TDD mutation block omits one planned hand-written mutant and counts three syntax-error mutants as kills

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T013
- **Files**: `CAP-003-E2-S4-tdd-evidence.yaml` (cycle-1 `mutation:`);
  `CAP-003-E2-S4-evidence/mutants-cycle-1.json`;
  `mutation-cycle-1-results-logs/src_factorflow_api_routes_data_health.py_{32,39,46}_remove-attribute_1.log`
- **Claim challenged**: "generated: 67, killed: 67, survived: 0, stillborn: 0, score: 1.0",
  with the plan's hand-written mutants "added to the mutation run beside the generated ones".
- **Observed evidence**:
  - `mutants-cycle-1.json` holds 7 manual mutants. The plan's fourth,
    `checks=ChecksResponse(` → `checks=None if health.never_acquired else ChecksResponse(` with
    `checks: ChecksResponse | None`, is absent. My run of it is killed (`manual:4`), so the
    test is adequate and only the evidence is incomplete.
  - The three `remove-attribute` mutants turn `@router.get(...)` into `.get(...)`. Each log
    shows `E   SyntaxError: invalid syntax`, so they are stillborn but scored as kills.
  - The cause is the runner's stillborn pattern `^(?:SyntaxError|IndentationError):`, which
    does not match pytest's indented `E   SyntaxError` form. That is a harness gap, not the
    coder's.
- **Expected evidence/behavior**: the plan's Other Notes list eight hand-written mutants to
  run. A compile failure is "not a kill: it tests the compiler, not the suite"
  (`scripts/mutation-run.py` module docstring).
- **Impact**: none on the verdict. The evidence claims a perfect score over a set that
  includes three non-tests and leaves out one planned mutant.
- **Required remediation**: in the rework cycle's evidence, run the plan's eighth mutant and
  record the three `remove-attribute` mutants as stillborn, or leave them out. Fixing the
  runner's pattern is harness work outside this story.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, plan Resolved Conflict 3**: the route tests use a minimal `FastAPI()` with the
  delivered `_validation_error_handler`, not TC-COMP-051's `create_app`. The router is
  registered only in CAP-003-E2-S5 (DEC-0211). This is sound, but it removed the request-id
  middleware, which is the root of IR-002.
- **Justified, plan Resolved Conflict 4**: AD 7's "Database down" row (the `500` envelope with
  `X-Request-Id` in the unit file) is deferred to CAP-003-E2-S6. That plan's T006 asserts it.
  This story pins propagation of the identical exception object.
- **Benign**: T006 says the attention fixture is "redeclared in this file", but
  `test_api_data_health_routes.py:25-33` imports the fixtures and literals from
  `tests.unit.test_api_data_health_models`. The literals are still hand-written, not produced
  by code under test, and cross-test-module imports have precedent
  (`tests/unit/test_universe_sql_safety.py`, `test_engine_sql_safety.py`). No finding.
- **Benign, an extra test**: `test_an_ended_download_carries_its_end_instant` is not in the
  plan. It closes the `ended_at` drop-field-copy that every other fixture's `None` would hide.
  Justified by TC-COMP-050.
- **Benign**: `FailureResponse.data_type` is `str`. AD v2's snippet shows a `Literal`, but that
  snippet arrived with v2's `cause` change, which CAP-003-E8-S7 owns. The story v2 note keeps
  the version 1 failure here.
- **Evidence oddity, no finding**: `cycle-1.patch` (sha256 `8125b8a1...`, equal to
  `diff_sha256`) contains a `new file` diff of an earlier 8967-line `cycle-1.patch`. The
  staged diff the reviews judged already held a previous copy of the patch. The lint accepts
  it, and it hides no code: the four code files in the patch match the commit.
- **Bookkeeping**: the task plan shows only the 13 checkbox flips, and the story only its
  status change. No other plan or story edit.
- **Out-of-scope changes**: none.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: rework under `$story-coding` with the task file
  `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4-tasks.md`
  and this report.
  - Kill `manual:5` and `manual:35` with a multi-row problem page (IR-001).
  - Kill `manual:23` by making the cursor refusal's request id observable (IR-002), and correct
    the plan's equivalent-mutant note.
  - Complete the cycle's mutation evidence (IR-003).
  - No production change is required.
  - Then rerun `$adversarial-review`. This report is its baseline (`reviewed_head` `dc2129c`,
    with `-mutation.json` for `scope --previous`).
- **Warnings accepted downstream**: N/A
