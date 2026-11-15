---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E2-S3"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S3.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-14T21:02:06Z"
reviewed_head: "3e20f5a29238c0d88f703cf115518c8fada54308"
review_base: "c4e031f8cc1df324da43863c083ac10953056944"
reviewed_state_revision: "sha256:5fd77462132767008cc19e0e8350ce70b9ff3d5885b3ef6a5a5d50f7e0cf2275"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-003-E2-S3
    artifact_version: 1
    content_revision: sha256:3db8d9928b02bd3f3322f431a3a709d45f8bc6f47bbfa4bb85e0b023976c1f1a
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-14T21:02:06Z
  source_artifacts:
    - id: CAP-003-E2-S3
      version: "1 (sha256:3db8d9928b02bd3f3322f431a3a709d45f8bc6f47bbfa4bb85e0b023976c1f1a)"
    - id: CAP-003-E2-S3-tasks
      version: "1 (draft; last_reworked_review CAP-003-E2-S3-implementation-review-v1.md)"
    - id: CAP-003-E2-S3-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-003-E2-S3-implementation-review
      version: "1 (CHANGES-REQUIRED; baseline)"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003-component-design-data-health-reader
      version: "2"
    - id: CAP-003-data-health-reader-tests
      version: "2 (draft)"
    - id: CAP-003-coverage-matrix
      version: "2 (draft)"
    - id: tech-stack
      version: "7"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E2-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 0 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 11/11 passed |

This re-review checks `3e20f5a` against review base `c4e031f`. The base is the tip of the CAP-003
integration branch `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` for supervised run
`run-20261114T141555Z`. The baseline is v1 (`CHANGES-REQUIRED`, `reviewed_head` `5773f19`).

The rework changed tests only. `git diff 5773f19..HEAD -- src` is empty, so the production code is
the code v1 found correct. The rework resolves all four v1 findings:

- **v1 IR-001 (HIGH).** A new integration test records each stock's fundamentals row before another
  data type's row with a different outcome. It asserts the literal `CompanyFinancialsCheck`.
  `rv:state-any-datatype` is now killed. Two of the reviewer's mutants, which return the rows in
  reverse heap order and in data-type order, are also killed. So the kill does not depend on one
  row order.
- **v1 IR-002 (MEDIUM).** A new unit fold over pages "unavailable (r1), available, unavailable
  (r2)" kills `rv:availability-last-page-wins` and `rv:gap-reason-last-unavailable`.
- **v1 IR-003 (MEDIUM).** A new unit test pins the package export. It kills `rv:export-dropped`.
- **v1 IR-004 (LOW).** The rework is its own TDD cycle. Its RED shows each surviving mutant failing
  an assertion, or failing on the missing export.

The reviewer reran all 81 baseline mutants (scope `carried`) and added four of its own (scope
`late`). Of the 85, 82 were killed and 3 survived. The carried survivor is the `as_of` `>` → `>=`
mutant, which v1 and the coder both recorded as equivalent. The other two survivors are new, and
both are on production lines unchanged since the baseline:

- **IR-001 (MEDIUM, late).** No test folds an unavailable page followed by a final available page.
  So the availability flag alone could revert to "available", and every test would still pass.
- **IR-002 (MEDIUM, late).** No test has an active stock with another data type's acquisition state
  and no fundamentals state. So a statement that prefers the fundamentals row, but falls back to
  any other row, would still pass.

Each finding is a test gap in code that is correct. Neither is a production defect. A late
finding is MEDIUM at most, and a late survivor does not make its test `WEAK`. Every required
validation command passes. That includes the full suite with the `postgres` tests: 2850 passed.
The TDD-evidence lint is clean. So the gate passes with warnings.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S3.md`. Status `in-review`. Content revision `sha256:3db8d992…c1f1a`, equal to the approval's `reviewed_revision` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S3-tasks.md` (v1, draft; T001 to T016 checked; `last_reworked_review: CAP-003-E2-S3-implementation-review-v1.md`) |
| Component | `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-003-E2-S3-run-20261114T141555Z` |
| HEAD | `3e20f5a29238c0d88f703cf115518c8fada54308` (`feat(CAP-003-E2-S3): story-coding cycle 2, review rework of implementation-review-v1`) |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` = `c4e031f8cc1df324da43863c083ac10953056944`, resolved by `pipeline-state.py review-base --base-ref …`. `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before review. No staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 76 across three commits (`5773f19`, `a83fec6`, `3e20f5a`): 5 modified and 71 added. 16 of them changed since the baseline |
| Baseline | v1, `reviewed_head` `5773f19fcdcb1f9edffc604a13477c747cde42f0`, with `CAP-003-E2-S3-implementation-review-v1-mutation.json`. `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Pipeline state | `pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` → `READY` ("review changes were reworked; a new review version is required"). Without `--base-ref`, the check reports `BLOCKED` ("story coding has not reached in-review"), because the default-branch base pulls sibling commits into the TDD lint. v1 recorded the same behaviour |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/data_health/reader.py` | modified (+173/-2); unchanged since baseline | T012; AC-11, AC-12, AC-21, AC-24, DAC-E2-4, DAC-E2-5, DAC-E2-15, DAC-E2-S3-1 to DAC-E2-S3-3 |
| `src/factorflow/data_health/queries.py` | modified (+26); unchanged since baseline | T011; DAC-E2-5, AC-11. The plan's Resolved Conflict 2 places these constants here, following RD 2.1 |
| `src/factorflow/data_health/__init__.py` | modified (+4/-4); unchanged since baseline | T013 (RD 2.1) |
| `tests/unit/test_data_health_checks.py` | added (+293); +34/-2 since baseline | T002, T003, T009, T010 (TC-COMP-035, TC-COMP-047). The rework for v1 IR-002 and IR-003: a `reason` keyword on `_view`, `test_gap_availability_keeps_the_first_unavailable_reason_across_pages` and `test_read_data_health_is_exported_from_the_package` |
| `tests/integration/test_data_health_checks.py` | added (+419); +29 since baseline | T004 to T008 (TC-COMP-038, -048, -049). The rework for v1 IR-001: `test_problem_count_and_as_of_come_from_the_fundamentals_row_only` |
| `docs/…/stories/CAP-003-E2-S3-tdd-evidence.yaml` | added; cycle-2 appended since baseline | T016 |
| `docs/…/stories/CAP-003-E2-S3-evidence/` (cycle-1: 56 files) | added; unchanged since baseline | T016 evidence for cycle-1 |
| `docs/…/stories/CAP-003-E2-S3-evidence/` (cycle-2: 10 files) | added since baseline | T016 evidence for cycle-2: `cycle-2.patch`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json`, 6 logs (2 baselines and 4 mutants) and `red-cycle-2-rework.log` |
| `docs/…/stories/CAP-003-E2-S3-implementation-review-v1.md`, `…-v1-mutation.json` | added (`a83fec6`) | The baseline review and its mutation results |
| `docs/…/stories/CAP-003-E2-S3-tasks.md` | modified | Bookkeeping. Cycle 1 checked T001 to T016. The rework set `updated: 2026-11-14` and added `last_reworked_review`. No other line changed |
| `docs/…/stories/CAP-003-E2-S3.md` | modified | Bookkeeping: `status: planning` → `in-review`. The content revision is unchanged |

Every changed file is justified by the story, the plan or the review cycle. `pyproject.toml`,
`uv.lock`, the migrations, `tests/conftest.py`, `coverage/service.py` and every other delivered
module are untouched (DEC-0211). The designs, test specifications and constitution are unchanged
since the baseline: `git diff --stat 5773f19..HEAD` over `tests/`, `design/` and
`docs/constitution` is empty.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `reader.py:296-336` `read_data_health` returns `DataHealth` with `affected_count`, both checks, `latest_session` and `as_of` | T007 `test_a_real_store_with_every_group_and_a_partial_download` (literal checks, `affected_count`, rows); the TC-COMP-035 and TC-COMP-047 unit literals | Each check carries the time it is current to: `latest_session` and `as_of`. Unchanged since v1 |
| AC-12 | SATISFIED | `reader.py:229-252` counts every exception group. The status is `exceptions` when any count is above zero (`:256`, `:274`) | T007 on a `partial` run store; the new `test_problem_count_and_as_of_come_from_the_fundamentals_row_only` | v1 IR-001 is resolved: a check can no longer read clean from another data type's `written` row without a test failing. IR-002 records the remaining fallback variant |
| AC-21 | SATISFIED | `reader.py:311-314`, `:333-334`: `never_acquired` comes from page 1, and both checks are `None` | `test_empty_store_is_never_acquired_with_null_checks`, `test_a_download_that_ended_with_every_request_failed_is_never_acquired_with_rows` | `rv:never-acquired-*-built` and `314:negate-boolean` are killed |
| AC-24 | SATISFIED | `reader.py:255` sets `gap_stock_count` to `None` when unavailable | TC-COMP-035 (d), (f); T008; T010 (b), (c); the new three-page fold | `rv:gap-count-zero-when-unavailable` is killed |
| DAC-E2-4 | SATISFIED | `reader.py:254-271`: the status order is `exceptions`, then `not_determinable`, then `ok`. The reason comes from the view (`:226-228`) | TC-COMP-035 (a)-(f), full literals; T008 on a real store; T010 (b) and `test_gap_availability_keeps_the_first_unavailable_reason_across_pages` | The code is correct. IR-001: availability that returns on a final page is not pinned |
| DAC-E2-5 | SATISFIED | `reader.py:230-252`. `queries.py:115-134` holds `latest_session` and the fundamentals state, with `s.data_type = 'fundamentals'` | TC-COMP-047 tests; T007; T010 (a); the new fundamentals-row test | v1 IR-001 is resolved: `rv:state-any-datatype` and its two row-order variants are killed. IR-002: the fallback variant survives |
| DAC-E2-15 | SATISFIED | `reader.py:311`, `:319`: `lifecycle="active"`, `limit=MAX_LIMIT` and the previous `next_cursor`. The module has no `try` and no `except` clause | `test_read_data_health_pages_read_coverage_unchanged_to_a_null_cursor`, `test_one_page_store_makes_one_call_with_a_null_cursor`, `test_value_error_from_read_coverage_propagates_unchanged` | `rv:value-error-wrapped`, `rv:limit-50`, `rv:cursor-none`, `rv:lifecycle-none` and `311:drop-defaulted-argument` are killed |
| DAC-E2-S3-1 | SATISFIED | As DAC-E2-5 | `test_unknown_presence_counts_as_absent_not_behind`, `test_absent_and_failed_is_in_both_counts_and_once_in_the_union`, `test_gaps_and_behind_is_one_stock_in_the_union` | `rv:unknown-not-absent`, `rv:prices-union-per-group` and `rv:financials-union-per-group` are killed |
| DAC-E2-S3-2 | SATISFIED | `reader.py:321-327`: `affected_count` and the first page are read whether or not anything was acquired | The two TC-COMP-048 tests | `rv:affected-from-rows` is killed |
| DAC-E2-S3-3 | SATISFIED | `reader.py:194-204` `_Union` keeps five at most. Pages are `lifecycle="active"`, and `FUNDAMENTALS_STATE_SQL` is keyed by page symbols | `test_retired_stocks_are_excluded_and_3000_stocks_take_six_pages`; `test_union_keeps_at_most_five_symbols` | `rv:head-*-any-lifecycle` and `203:off-by-one` are killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Unchanged since v1: S1's models, `PROBLEM_COUNT_SQL` and `read_problems` exist at base. `coverage/service.py` exports what the plan states. `migrated_writer_connection` exists | Nothing was edited |
| T002 | complete | VERIFIED | `tests/unit/test_data_health_checks.py:111-157`, six parametrised cases with full `DailyPricesCheck` literals | Every planned kill dies |
| T003 | complete | VERIFIED | `:160-216`, five tests for rules (a)-(e) | Every planned kill dies |
| T004 | complete | VERIFIED | `tests/integration/test_data_health_checks.py:158-206` | Literal `(args, kwargs)` for three pages and for one page. The `ValueError` identity is checked |
| T005 | complete | VERIFIED | `:209-257` | Both stores |
| T006 | complete | VERIFIED | `:260-303`, `@pytest.mark.slow`. It ran in the focused suites, the full suite and every mutant run | Six cursors, literal checks at 3000 stocks |
| T007 | complete | VERIFIED | `:306-364`, plus the rework's `:393-419` | v1 IR-001 resolved. IR-002 (late) is a remaining fallback variant |
| T008 | complete | VERIFIED | `:367-390` | Literal checks on a one-stock store |
| T009 | complete | VERIFIED | `tests/unit/test_data_health_checks.py:219-227` | Five at most after every `add`; count 3000 |
| T010 | complete | VERIFIED | `:230-255` and `:286-293`: cases (a), (b) and (c), plus the rework's three-page fold `:258-275` | v1 IR-002 resolved. IR-001 (late): no fold ends on an available page after an unavailable one |
| T011 | complete | VERIFIED | `queries.py:109-134`, unchanged since v1 | S1's read-only guard passes (20 tests) |
| T012 | complete | VERIFIED | `reader.py:186-336`, unchanged since v1 | v1's two justified deviations still apply (see Scope and Plan Deviations) |
| T013 | complete | VERIFIED | `__init__.py:7,9`; pinned by the rework's `test_read_data_health_is_exported_from_the_package` (`tests/unit/test_data_health_checks.py:278-283`) | v1 IR-003 resolved |
| T014 | complete | VERIFIED | The guard command passes, 38 tests | No router registered and no `factorflow.api` import |
| T015 | complete | VERIFIED | The full validation set passes (see Independent Validation). The five TC-ID comments are present: TC-COMP-035 ×1, -038 ×3, -047 ×5, -048 ×2, -049 ×1 | The rework's three tests carry no TC-ID, correctly, because none implements a TC |
| T016 | complete | VERIFIED | `CAP-003-E2-S3-tdd-evidence.yaml` cycle-1 and cycle-2. The lint reports 0 errors and 0 warnings. The `+`/`-` lines of `cycle-2.patch` (`sha256:20ca7ceb…0574`, equal to `diff_sha256`) equal those of `git diff 5773f19..HEAD -- src tests`. The `results_sha256` and `red_log_sha256` match their files | v1 IR-004 resolved for the rework (see Previous Review Disposition) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_daily_prices_status_and_null_gap_count` / TC-COMP-035 | ADEQUATE | Full `DailyPricesCheck` literals for six cases: the three statuses, a null gap count when unavailable, the reason carried, and "unavailable and absent" | none |
| Five rule tests / TC-COMP-047 | ADEQUATE | Unknown counts as absent and not behind. Absent-and-failed and gaps-and-behind each count once in their union. `not_found` is a problem and `written` is not. More than five symbols across a page boundary keep the first five | none |
| Three paging tests / TC-COMP-038 | ADEQUATE | Literal `(args, kwargs)` per call, including connection identity and an explicit `cursor: None`. The spy caps calls at ten. The `ValueError` identity is checked | none |
| Two never-acquired tests / TC-COMP-048 | ADEQUATE | Empty store. A store where everything failed: 60 affected, 50 rows, the cursor, four failures each, `retryable` | none |
| `test_retired_stocks_are_excluded_and_3000_stocks_take_six_pages` / TC-COMP-049 | ADEQUATE | Six cursors, `lifecycle` and `limit` on every call, literal checks, rows | none |
| `test_union_keeps_at_most_five_symbols` / T009 | ADEQUATE | Five at most after every `add`; count 3000; the first five kept | none |
| `test_financials_as_of_is_the_latest_written_across_pages` / T010 (a) | ADEQUATE | Maximum across pages; the `written` filter; `problem_count` | none |
| `test_gap_availability_is_the_conjunction_over_pages` / T010 (b) | ADEQUATE | Pages "available, then unavailable" give null, the reason and `not_determinable` | IR-001 is late, so the test is not made `WEAK` |
| `test_gap_availability_keeps_the_first_unavailable_reason_across_pages` / T010, rework | ADEQUATE | Three pages: unavailable (r1), available, unavailable (r2). Null gap count, `GapDetectionState(False, "r1")`, `not_determinable`. It kills both v1 IR-002 mutants. In the reviewer's run, `rv:availability-last-page-wins` died on the reason attribute only, because the last page is unavailable too | The final page is unavailable, so the fold cannot see the flag revert to available (IR-001, late) |
| `test_no_prices_anywhere_leaves_latest_session_null` / T010 (c) | ADEQUATE | Full literal; no `TypeError` with a null `latest_session` | none |
| `test_read_data_health_is_exported_from_the_package` / T013, rework | ADEQUATE | Identity of `factorflow.data_health.read_data_health` with `reader.read_data_health`, and membership in `__all__`. It kills `rv:export-dropped` | none |
| `test_a_real_store_with_every_group_and_a_partial_download` / T007 | ADEQUATE | Literal checks over every group; `affected_count`; rows; `checked_at == now()` in the open transaction; `INTRANS`. It kills `rv2:state-any-datatype-reverse-heap` and `rv2:state-any-datatype-by-type`: in those row orders BBB's `prices` `written` row comes last | none |
| `test_problem_count_and_as_of_come_from_the_fundamentals_row_only` / T007, rework | ADEQUATE | Three active stocks. Each has its fundamentals row (failed, failed, written at T1) recorded before a different outcome for `prices` or `corporate_actions`. It asserts the literal `CompanyFinancialsCheck("exceptions", 0, 2, T1, 2, ("WWW", "XXX"))`. Under `rv:state-any-datatype` the check reads `problem_count` 1, `as_of` T3 and symbols `("YYY",)`, so the mutant is killed | Every seeded stock has a fundamentals row, so a statement that falls back to another type only when the fundamentals row is missing goes unseen (IR-002, late) |
| `test_not_determinable_on_a_real_store` / T008 | ADEQUATE | Literal `not_determinable` with the reason; financials `ok` with `as_of` T1 | none |

**Mutation run.** `mutation-run.py generate` over `c4e031f..HEAD` gives the same 39 mutants v1
generated (20 off-by-one, 14 negate-boolean, 3 drop-field-copy, 2 drop-defaulted-argument). The
reviewer added four manual mutants of its own, `rv2:`. `mutation-run.py scope --since 5773f19
--previous …-v1-mutation.json` merged in v1's 42 manual mutants. It tagged 81 mutants `carried`
and the 4 new ones `late`; no previous mutant failed to apply. Results, run with the focused
suites: 82 killed and 3 survived, with three passing baselines. Results sha256 `30bfa1f2…62bbe`,
copied beside this report.

| Survivor | Scope | Equivalent? | Disposition |
|----------|-------|-------------|-------------|
| `reader.py:251:off-by-one:1` (`>` → `>=` in the `as_of` maximum) | carried | Yes | When the two instants are equal, the assignment stores an equal value. DEC-0213 (e) and RD 2.5 define `as_of` as an instant, so no artifact can observe the difference. v1 and the coder's cycle-1 recorded the same disposition |
| `rv2:availability-flag-last-wins` | late | No | IR-001 |
| `rv2:state-fallback-other-type` | late | No | IR-002 |

The reviewer's other two mutants, `rv2:state-any-datatype-reverse-heap` (`ORDER BY s.ctid DESC`)
and `rv2:state-any-datatype-by-type` (`ORDER BY s.data_type`), drop the fundamentals predicate
and change the row order. Both are killed by T007. With `rv:state-any-datatype` killed by the
rework's test in heap order, the predicate's removal is now caught whichever order the planner
returns.

The tests are isolated and deterministic. Each integration test has its own migrated database.
Every seed uses fixed literal times and commits before the read. The unit tests use no database.
The rework adds no mock: the unit fold receives hand-built `coverage-service` values, and the new
integration test reads through the delivered `read_coverage`.

## Independent Validation

All commands ran from the reviewer's shell against `repos/factorflow-v2/FactorFlow-v2`, abbreviated
`<repo>`. `uv … --directory <repo>` runs with `<repo>` as its working directory. Every command ran
inside the sandbox, and none was refused.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` (prerequisite, not counted) | harness root | 0 | PASS | All eight checks passed |
| `uv run --directory <repo> pytest tests/unit/test_data_health_checks.py tests/integration/test_data_health_checks.py tests/unit/test_data_health_sql_is_read_only.py` (plan: Focused) | `<repo>` | 0 | PASS | 46 passed in 2.83s: 17 unit, 9 postgres including the slow 3000-stock test, and 20 read-only |
| `uv run --directory <repo> pytest tests/unit/test_data_health_sql_is_read_only.py tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py -q` (T014) | `<repo>` | 0 | PASS | 38 passed |
| `uv sync --directory <repo> --all-extras --offline` | `<repo>` | 0 | PASS | Resolved 46 packages, checked 43 |
| `uv build --directory <repo> --offline` | `<repo>` | 0 | PASS | Built `dist/factorflow-0.2.0.tar.gz` and `dist/factorflow-0.2.0-py3-none-any.whl` |
| `uv run --directory <repo> pytest` | `<repo>` | 0 | PASS | 2850 passed with 2 warnings (starlette and anyio deprecations) in 556.12s. This is the full suite with the `postgres` tests included, not an exclusion run. It is v1's 2847 plus the rework's three tests |
| `uv run --directory <repo> ruff check .` | `<repo>` | 0 | PASS | All checks passed |
| `uv run --directory <repo> ruff format --check .` | `<repo>` | 0 | PASS | 297 files already formatted |
| `uv run --directory <repo> mypy src` | `<repo>` | 0 | PASS | No issues in 65 source files |
| `grep -n "except" src/factorflow/data_health/reader.py` (plan: DAC-E2-15) | `<repo>` | 0 | PASS (intent) | As in v1, it prints four lines, all of them the words "exception symbols" (l.20) or the status literal `"exceptions"` (l.257, 274, 276). `grep -nw "except"` and `grep -n "try:"` both exit 1 with no match. See Scope and Plan Deviations |
| `grep -nE "conn\.(commit\|rollback\|transaction)\(" src/factorflow/data_health/reader.py` | `<repo>` | 1 | PASS | No match, the required result |
| `python3 scripts/check-tdd-evidence.py --evidence <repo>/docs/…/CAP-003-E2-S3-tdd-evidence.yaml --repo-dir <repo> --base c4e031f8cc1df324da43863c083ac10953056944 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir <repo> --range c4e031f…..HEAD --cycle review --out <scratch>/generated.json`, plus 4 manual mutants appended | harness root | 0 | — | 39 generated |
| `python3 scripts/mutation-run.py scope --repo-dir <repo> --mutants <scratch>/with-manual.json --since 5773f19fcdcb1f9edffc604a13477c747cde42f0 --previous <repo>/docs/…/CAP-003-E2-S3-implementation-review-v1-mutation.json --out <scratch>/mutants.json` | harness root | 0 | — | 85 mutants: 81 `carried` and 4 `late`. No previous mutant failed to apply |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <scratch>/mutants.json --jobs 3 --command 'uv run --offline --all-extras pytest tests/unit/test_data_health_checks.py tests/integration/test_data_health_checks.py tests/unit/test_data_health_sql_is_read_only.py -x -q -p no:cacheprovider' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 3 | FAIL | 85 mutants: 82 killed and 3 survived. One survivor is equivalent and two are late. Three baselines passed |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | — | N/A | NOT RUN | Not required. The story's Validation and the plan's Validation Plan name only the Python commands, and the change set holds no frontend file |

The mutation run is TDD evidence (skill step E.9), not a required validation command. Its
non-equivalent survivors are reported as findings IR-001 and IR-002.

### Validation Side Effects

- Before: `git status --porcelain --untracked-files=all` was empty at `3e20f5a`, and
  `pipeline-state.py code-revision` gave `sha256:5fd77462…2275`.
- After: HEAD was still `3e20f5a` and `git status --porcelain --untracked-files=all` was empty.
  `code-revision` gave the same `sha256:5fd77462…2275`. `uv build` refreshed the ignored `dist/`,
  `build/` and `src/factorflow.egg-info/`. The mutation run worked in clones under the reviewer's
  scratch directory, outside the repository. The only files the reviewer adds are this report and
  its `-mutation.json`.
- Unexpected tracked-file changes: none.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0 · **total 2**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | MEDIUM | late | OPEN | No fold ends on an available page after an unavailable one, so availability reverting to "available" goes unseen |
| IR-002 | MEDIUM | late | OPEN | No test has an active stock with another data type's state and no fundamentals state, so a fallback to that row goes unseen |

### IR-001 — Availability that reverts on a final available page is unpinned

- **Severity**: MEDIUM
- **Scope**: late. `mutation-run.py scope` tagged the survivor `late`: it is a new mutant of
  `reader.py:226-228`, which is unchanged since the baseline. The baseline could have found it just
  as well, because the fold v1 prescribed also ends on an unavailable page.
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-4 and AC-24 are not made incomplete. TC-COMP-035 and T008 pin
  the null count, the reason and `not_determinable` for an unavailable view. Only the merge across
  pages is affected.
- **Tasks**: T010, which guards T012's `add_page` availability rule
- **Files**:
  - `src/factorflow/data_health/reader.py:226-228`
  - `tests/unit/test_data_health_checks.py:244-255` (`test_gap_availability_is_the_conjunction_over_pages`)
  - `tests/unit/test_data_health_checks.py:258-275` (`test_gap_availability_keeps_the_first_unavailable_reason_across_pages`)
- **Claim challenged**: T010 and the rework prove that "availability is the conjunction over
  pages" (T012; plan Open Gap 4).
- **Observed evidence**:
  - `rv2:availability-flag-last-wins` keeps the first unavailable reason but takes the flag from
    the last page:

    ```python
    if not view.gap_detection.available and self.gaps_reason is None:
        self.gaps_reason = view.gap_detection.reason
    self.gaps_available = view.gap_detection.available
    ```

    All 46 focused tests pass (log `rv2_availability-flag-last-wins.log`: `46 passed in 4.09s`).
  - The two multi-page folds end on an unavailable page: "available, unavailable" and
    "unavailable (r1), available, unavailable (r2)". The final flag is false under both the
    conjunction and the last-page rule, so no test can tell them apart.
  - In the reviewer's run, v1's `rv:availability-last-page-wins` was killed only on the reason
    attribute (`reason='r2'` against `'r1'`), not on availability.
- **Expected evidence/behavior**:
  - T012: "when `view.gap_detection.available` is false, set `gaps_available = False`". Nothing
    sets it back.
  - Plan Open Gap 4: detection is "available only when every page reported it available".
  - RD 2.5: the status is "`ok` only when every part could run and found nothing, and
    `not_determinable`, never `ok`, when the gap part could not run".
  - DEC-0213 (c) and STD-UI-4, as the plan cites them: a count that could not be computed for part
    of the roster is null, never a partial number.
- **Impact**: Under the mutant, pages "unavailable, then available" return a gap count from the
  later pages only, with `GapDetectionState(True, "r1")`. The status can be `ok`: a partial number
  shown as complete, which RD 2.5 forbids. As plan Open Gap 4 notes, availability can change
  between pages only while a download writes during the read. This is the scenario v1 IR-002's
  Impact described. The fold v1 prescribed did not reach it, because that fold ends on an
  unavailable page.
- **Required remediation**: Kill `rv2:availability-flag-last-wins` with the focused suites. Add a
  unit fold whose last page is available after an unavailable one, for example "unavailable (r1),
  then available". Assert `gap_stock_count is None`,
  `gap_detection == GapDetectionState(False, "r1")` and status `not_determinable`.

### IR-002 — A fundamentals-state fallback to another data type's row is unpinned

- **Severity**: MEDIUM
- **Scope**: late. `mutation-run.py scope` tagged the survivor `late`: it is a new mutant of
  `queries.py:132-133`, which is unchanged since the baseline. The baseline could have found it
  just as well.
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-5, DAC-E2-S3-1 and AC-12 are not made incomplete. The code
  satisfies them, and the rework now catches the plain removal of the predicate in every row order
  tried.
- **Tasks**: T007, which guards T011's `FUNDAMENTALS_STATE_SQL`
- **Files**:
  - `src/factorflow/data_health/queries.py:128-134`
  - `src/factorflow/data_health/reader.py:285-293` (`_fundamentals_state`, which keeps the last
    row per symbol)
  - `tests/integration/test_data_health_checks.py:306-364` (T007) and `:393-419` (the rework's test)
- **Claim challenged**: T007 and the rework's test prove that `problem_count` and `as_of` come
  from the fundamentals `acquisition_state` row only.
- **Observed evidence**:
  - `rv2:state-fallback-other-type` replaces the predicate with
    `WHERE i.symbol = ANY(%(symbols)s) ORDER BY s.data_type = 'fundamentals'`. The statement
    then returns every data type's row, with the fundamentals row last whenever one exists. All 46
    focused tests pass (log `rv2_state-fallback-other-type.log`: `46 passed in 3.75s`).
  - Every active stock that a test gives any `acquisition_state` row also has a fundamentals row:
    T007's `AAA`, `BBB`, `CCC` and `EEE`, T008's `SOLO`, TC-COMP-049's `S0003`, and the rework's
    `WWW`, `XXX` and `YYY`. Those stocks map exactly as under the correct statement.
  - The only stocks with non-fundamentals state and no fundamentals row are retired (`R0001`) or
    never acquired (TC-COMP-048, where both checks are `None`).
- **Expected evidence/behavior**:
  - DAC-E2-5 and DEC-0213 (e): "`problem_count` counts active stocks whose fundamentals
    `acquisition_state.last_outcome` is `failed` or `not_found`".
  - RD 2.5: "`as_of` is the latest fundamentals `last_acquired_at` whose `last_outcome` is
    `written`".
  - Skill step E.9: a mutant that changes behaviour the contract specifies is not equivalent.
- **Impact**: This is the reviewer's derivation from the code. Under the mutant, take an active
  stock whose `prices` request failed before its fundamentals were ever requested, as in an
  interrupted download. That stock would count in `problem_count` and join the financials union.
  A stock with only a `written` `prices` row would set `as_of` to its prices time. Every test
  stays green. The production statement is correct today.
- **Required remediation**: Kill `rv2:state-fallback-other-type` with the focused suites. Seed an
  active stock that has a non-fundamentals `acquisition_state` row and no fundamentals row. For
  example, `prices` `failed`, or `prices` `written` at a time later than any fundamentals `written`
  time. Assert the literal `CompanyFinancialsCheck`, so the stock is in neither `problem_count` nor
  the union and does not set `as_of`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) — the fundamentals-only predicate of `FUNDAMENTALS_STATE_SQL` is unpinned | RESOLVED | `tests/integration/test_data_health_checks.py:393-419`, `test_problem_count_and_as_of_come_from_the_fundamentals_row_only`. In the reviewer's run, `rv:state-any-datatype` (`carried`) is killed: `CompanyFinancialsCheck(... exception_symbols=('YYY',))` against `('WWW', 'XXX')`. The reviewer's `rv2:state-any-datatype-reverse-heap` and `rv2:state-any-datatype-by-type` are killed by T007, so the kill holds across row orders. A narrower fallback variant is new finding IR-002 (late) |
| v1/IR-002 (MEDIUM) — the cross-page merge of gap availability is pinned in one direction only | RESOLVED | `tests/unit/test_data_health_checks.py:258-275`, the three-page fold the remediation prescribed. `rv:availability-last-page-wins` and `rv:gap-reason-last-unavailable` (both `carried`) are killed. A flag-only variant that the prescribed fold cannot observe is new finding IR-001 (late) |
| v1/IR-003 (MEDIUM) — no test pins the package export of `read_data_health` | RESOLVED | `tests/unit/test_data_health_checks.py:278-283`. `rv:export-dropped` (`carried`) is killed: `AttributeError: module 'factorflow.data_health' has no attribute 'read_data_health'` |
| v1/IR-004 (LOW) — the TDD evidence is coarser than the plan, and one recorded kill was a `NameError` | RESOLVED | The rework is its own cycle, cycle-2 (`tasks: [T007, T010, T013, T015]`). Its RED log, `red-cycle-2-rework.log` (sha256 matches `red_log_sha256`), shows each of the four v1 survivors failing on an assertion, or on the missing export for `rv:export-dropped`. Its four manual mutants all execute and are killed. Cycle-1 stays as recorded; the remediation was optional and asked only that the rework do this |

## Scope and Plan Deviations

- **Unchanged from v1, still justified, T012.**
  - The plan asks that `fetchone()` rows be typed with `cast`. The code unpacks them as tuples,
    and `mypy src` passes.
  - `_fundamentals_state` is called for an empty page but returns `{}` before any statement runs.
    The observable result is the same: no statement is issued.
- **Plan defect carried from v1, not the coder's.** The DAC-E2-15 check `grep -n "except"
  reader.py` "prints nothing" cannot hold while RD 2.2's status literal `"exceptions"` exists. The
  intent holds: there is no `except` clause and no `try`. A future plan revision could use
  `grep -nw "except"`.
- **Bookkeeping.**
  - Cycle-2's `tasks` list names T007, T010, T013 and T015, the tasks whose guards the rework
    extends. T016 is the evidence process itself, as in cycle-1's convention.
  - The task file's `updated` and `last_reworked_review` changed. No checkbox or task text changed.
- **Out-of-scope changes.** No out-of-scope file, dependency or refactor was found.
- **Recorded open gaps, not findings.** The plan's Open Gaps 1 to 6 are mechanisms the plan
  flags for the next revision of RD §2.2, §2.5 and §5. They are unchanged since v1.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run doc sync for CAP-003-E2-S3 against this report and the task plan
  `CAP-003-E2-S3-tasks.md`.
- **Warnings accepted downstream**: IR-001 and IR-002 (MEDIUM, late). Each is one test away from
  closed. A later rework of this story, or the next story that touches the fold or
  `FUNDAMENTALS_STATE_SQL`, can kill `rv2:availability-flag-last-wins` and
  `rv2:state-fallback-other-type` with the seeds named under each finding.
