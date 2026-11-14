---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E2-S1"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S1.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-14T17:56:18Z"
reviewed_head: "540c3a432fa9875a11972004e6f160c384d71e0e"
review_base: "a77ee42c7ae2ed8eccb1cb0a14666b5fb4dcaafd"
reviewed_state_revision: "sha256:e8e50d5c655bd4111f9b0a657f61e580b9d8ddfc87319731fa180eb6fcabc4fc"
verdict: PASS
review_subjects:
  - artifact_id: CAP-003-E2-S1
    artifact_version: 2
    content_revision: sha256:3bd04aabd6155e539f4c4db9381f34cf7259f1d6ec605da9acfd985453303238
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-14T17:56:18Z
  source_artifacts:
    - id: CAP-003-E2-S1
      version: "2 (sha256:3bd04aabd6155e539f4c4db9381f34cf7259f1d6ec605da9acfd985453303238)"
    - id: CAP-003-E2-S1-tasks
      version: "1 (draft, updated 2026-11-14, last_reworked_review v1)"
    - id: CAP-003-E2-S1-tdd-evidence
      version: "cycle-1, cycle-2, cycle-3"
    - id: CAP-003-E2-S1-implementation-review
      version: "1 (baseline, CHANGES-REQUIRED, reviewed_head 0e4f098)"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003
      version: "2"
    - id: CAP-003-component-design-data-health-reader
      version: "2"
    - id: CAP-003-data-health-reader-tests
      version: "2 (draft)"
    - id: CAP-003-coverage-matrix
      version: "2 (draft)"
    - id: DEC-0201
      version: "provisional, open"
    - id: DEC-0211
      version: "applied, owner upheld"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E2-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 12/12 passed |

This re-review covers `540c3a4`, against review base `a77ee42`. That base is the tip of the
CAP-003 integration branch `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` for
supervised run `run-20261114T141555Z`. The baseline is v1 (`CHANGES-REQUIRED`, `reviewed_head`
`0e4f098`). The rework commit `540c3a4` changes tests and evidence only. `git diff
0e4f098..HEAD -- src pyproject.toml uv.lock` is empty, so the production code is byte for byte
what v1 reviewed and found correct.

All six v1 findings are resolved:

- **IR-001, IR-002, IR-003.** The reviewer's mutation run has 57 mutants: v1's 50 regenerated
  or carried, plus 7 new ones. All seven v1 non-equivalent survivors are now killed, each by
  the test written for it. The only survivors are the two mutants that v1 and the task plan's
  Other Notes judged equivalent. All seven new mutants die.
- **IR-004.** The deviation is recorded in the TDD-evidence header, which now attributes each
  commit correctly.
- **IR-005, IR-006.** The `failed` fixtures carry an `[unavailable] …` reason, and the repeat
  reads are asserted, with R4 isolated.

All twelve required validation commands pass. These include the full suite (2778 tests against
PostgreSQL testcontainers) and the TDD-evidence lint (0 errors, 0 warnings). The reviewer found
nothing new in the rework, so there are no findings.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S1.md` (v2, `in-review`, approved; content revision matches `approval.reviewed_revision`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S1-tasks.md` (v1, draft, `last_reworked_review: CAP-003-E2-S1-implementation-review-v1.md`) |
| Component | `FactorFlow-v2` (also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E2-S1-run-20261114T141555Z` |
| HEAD | `540c3a432fa9875a11972004e6f160c384d71e0e` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` = `a77ee42c7ae2ed8eccb1cb0a14666b5fb4dcaafd`, resolved by `pipeline-state.py review-base --base-ref …`; `git merge-base --is-ancestor` exit 0 |
| Working tree | clean (no staged, unstaged or untracked files), before and after validation |
| Changed files reviewed | 73: four commits (`2626e8c` cycle 1, `0e4f098` cycle 2, `a21df16` review v1, `540c3a4` cycle 3) |
| Baseline | v1 (`CAP-003-E2-S1-implementation-review-v1.md`), `reviewed_head` `0e4f098b3955b48252ebb9346e11c4bfc86011c7`, with `CAP-003-E2-S1-implementation-review-v1-mutation.json` |

### Changed Files

All files are `added` unless marked `modified`. Paths under `docs/…/stories/` are relative to
`docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/`. The
"Since v1" column marks what `540c3a4` changed after the baseline.

| File | State | Since v1 | Story/Task Justification |
|------|-------|----------|--------------------------|
| `src/factorflow/data_health/__init__.py` | added | unchanged | T014 (RD 2.1; exports `read_problems` only, plan Open Gap 1) |
| `src/factorflow/data_health/models.py` | added | unchanged | T011 (RD 2.2, version 1 shape; AC-13) |
| `src/factorflow/data_health/queries.py` | added | unchanged | T012 (RD 2.4, DEC-0201; AC-13, AC-16, DAC-E2-1, DAC-E2-3) |
| `src/factorflow/data_health/reader.py` | added | unchanged | T013 (AC-13, AC-14, DAC-E2-3, DAC-E2-S1-4) |
| `tests/unit/test_data_health_sql_is_read_only.py` | added | modified | T002, T003 (TC-COMP-039, TC-COMP-042); the subquery `ORDER BY` pin (l.20-22, l.90-92) is v1 IR-002's remediation |
| `tests/unit/test_data_health_models.py` | added | unchanged | T010 (plan Other Notes, "Extra test file") |
| `tests/integration/test_data_health_problems.py` | added | modified | T004-T009 (TC-COMP-040, -041, -042; AC-13, AC-16, DAC-E2-1). Cycle 3 brings v1's IR-001, IR-002, IR-003, IR-005 and IR-006 remediations |
| `docs/…/stories/CAP-003-E2-S1.md` | modified | unchanged | Status `planning` to `in-review` only (story-coding handoff) |
| `docs/…/stories/CAP-003-E2-S1-tasks.md` | modified | modified | 17 checkboxes `[ ]` to `[x]`. Cycle 3 adds only `updated: 2026-11-14` and `last_reworked_review` (story-coding G, rework handoff) |
| `docs/…/stories/CAP-003-E2-S1-tdd-evidence.yaml` | added | modified | T017. Cycle 3 corrects the header (IR-004), records cycle 2's commit `0e4f098`, and appends `cycle-3` |
| `docs/…/stories/CAP-003-E2-S1-implementation-review-v1.md`, `…-v1-mutation.json` | added | unchanged | The baseline review and its mutation results (commit `a21df16`) |
| `docs/…/stories/CAP-003-E2-S1-evidence/cycle-1.patch`, `cycle-2.patch`, `cycle-3.patch` | added | `cycle-3.patch` added | T017 (`reviewed_patch`) |
| `docs/…/stories/CAP-003-E2-S1-evidence/red-cycle-1-models.log`, `red-cycle-2-read-problems.log`, `red-cycle-3-rework.log` | added | `red-cycle-3-rework.log` added | T017 (`red_log`) |
| `docs/…/stories/CAP-003-E2-S1-evidence/mutants-cycle-{1,2,3}.json` | added | `mutants-cycle-3.json` added | T017 (mutation inputs) |
| `docs/…/stories/CAP-003-E2-S1-evidence/mutation-cycle-{1,2,3}-results.json` | added | `mutation-cycle-3-results.json` added | T017 (`mutation.results`) |
| `docs/…/stories/CAP-003-E2-S1-evidence/mutation-cycle-1-results-logs/*` (17), `mutation-cycle-2-results-logs/*` (21), `mutation-cycle-3-results-logs/*` (11) | added | the 11 cycle-3 logs added | T017 (4 baselines per cycle; 13, 17 and 7 mutant logs) |

`git diff --stat a77ee42..HEAD -- src tests pyproject.toml uv.lock` lists only the seven new
code files. No delivered file is modified (DEC-0211). There is no unjustified change.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | SATISFIED | `queries.py:13-38` selects `data_type`, `last_outcome AS outcome`, `r.reason`, `r.attempts`, `r.completed_at`, `last_run_id AS run_id`; `reader.py:29-40` builds one `Failure` per row | `test_failure_facts_come_from_the_matched_result` (l.270-293); `test_failure_facts_ignore_other_instruments_and_the_state_clock` (l.370-402); TC-COMP-040 tests | Another instrument's result in the same run and data type, and a state clock that differs from the result's time, are now observed (v1 IR-001 resolved) |
| AC-14 | SATISFIED | `reader.py:50` `retryable=any(f.outcome == "failed" …)` | `test_retryable_rule_and_resolution_only_by_write_or_retirement`: `NFX` False, `FLD` True, `MIX` True | `negate-boolean:50` and `retryable-all` killed |
| AC-9 | SATISFIED | The predicate reads the current `acquisition_state` only, and nothing is written | TC-COMP-041 tests: rows leave on `written` or retirement and on nothing else; a repeated read and R4 each return the identical page (l.206-213); the table snapshot is unchanged across reads | v1 IR-006 resolved |
| AC-16 | SATISFIED | `PROBLEM_COUNT_SQL` (`queries.py:42-53`) has the same joins and predicate as the rows | `test_the_count_and_the_rows_are_one_set`; `test_the_count_on_an_empty_store`; `test_the_newest_completion_time_comes_only_from_the_matched_results` (l.430-457) | Set identity and `newest_completed_at`'s source are both pinned (v1 IR-003 resolved). The full three-way equality belongs to E2-S3, E2-S6 and E2-S7 (plan Resolved Conflict 3) |
| DAC-E2-1 | SATISFIED | `queries.py:22-27`, `:29-33` (active, `failed`/`not_found`, join on `(last_run_id, instrument_id, data_type)`) | T007 and its IR-001 companion; T008 (`ABR` retired and `ABW` clean take no slot); T009 (`ABR` not counted) | Every join condition of both statements is now pinned (all `rv-*-join-*` mutants killed) |
| DAC-E2-2 | SATISFIED | As AC-9 | `test_retryable_rule_…`: `written` for another type keeps `NFX`; `written` for `prices` removes `FLD`; `retire_symbol` removes `NFX`; a re-fail in R3 keeps `MIX` with `run_id == r3`; an unchanged re-read and R4 change nothing | None |
| DAC-E2-3 | SATISFIED | `queries.py:34-36` keyset `> %(cursor)s`, `ORDER BY i2.symbol`, `LIMIT %(limit_plus_one)s`; `queries.py:37`; `reader.py:26`, `:42-44` | TC-COMP-040 tests; `test_paging_follows_symbol_order_not_data_type_order` (l.405-427); `test_problem_rows_subquery_orders_symbols_before_the_limit` (unit l.90-92) | Row order and the subquery's symbol order are now pinned (v1 IR-002 resolved) |
| DAC-E2-S1-1 | SATISFIED | Neither `queries.py` nor `reader.py` holds any of the six tokens (the whole-text scan passes) | `test_sources_hold_no_write_or_ddl_token` and the guard self-tests | `planted-comment` (`-- UPDATE`) killed: `AssertionError: queries.py holds write tokens: ['UPDATE']` |
| DAC-E2-S1-2 | SATISFIED | As DAC-E2-3 | As DAC-E2-3 | None |
| DAC-E2-S1-3 | SATISFIED | As AC-14 and DAC-E2-2 | `test_retryable_rule_…`, `test_reads_record_nothing` | None |
| DAC-E2-S1-4 | SATISFIED | `reader.py:25-27`: one dict of bound parameters; no `commit`, `rollback` or `transaction` call | `test_statements_are_bound_selects`, `test_problem_rows_binds_cursor_and_limit`, `test_cursor_is_a_bound_parameter`, `test_the_transaction_belongs_to_the_caller` | `cursor-interpolated`, `limit-literal`, `commit-after-fetch` killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | The delivered migrations, both fixtures and `retire_symbol` exist and behave as the plan assumes (`idx_instrument_symbol` is `UNIQUE (symbol)`, migration 0001 l.16, untouched by 0002-0006). Every integration test uses them, and the full suite passes. `tests/conftest.py` is unchanged | None |
| T002 | complete | VERIFIED | `test_data_health_sql_is_read_only.py:16-62`: `WRITE_TOKENS`, `write_tokens`, `\b…\b` with `re.IGNORECASE`, sources via `Path(module.__file__)`, whole-text scan, planted and word-boundary self-tests | None |
| T003 | complete | VERIFIED | `:36-87`: `_SQL` constants via `vars(queries)`, no `{`, no unbound `%`, first keyword `SELECT`/`WITH`, `%(cursor)s` and `LIMIT\s+%\(limit_plus_one\)s` | Justified deviation, unchanged from v1: `'{}'` is stripped before the `{` check (T012's own `PROBLEM_COUNT_SQL` coalesces to `'{}'`) |
| T004 | complete | VERIFIED | `test_data_health_problems.py:121-155`: literal pages and cursors, full final page, cursor past the end. Cycle 3 adds `test_paging_follows_symbol_order_not_data_type_order` (l.405-427) and the static subquery-order pin (unit l.90-92) | All planned kills die, and so do v1's two ordering survivors |
| T005 | complete | VERIFIED | `:158-233`: seeds and literals as planned, `failed` fixtures with `UNAVAILABLE` (l.30, l.169, l.172), resolution steps 1-3, R3 re-fail with `run_id` and `reason`, two consecutive equal reads, then R4 alone and an equal read (l.206-213), and the four-table snapshot in `test_reads_record_nothing` | v1 IR-005 and IR-006 resolved. In the plan, the unchanged re-read comes before R3; it now comes after R3 (Scope and Plan Deviations) |
| T006 | complete | VERIFIED | `:236-267`: an injection-shaped cursor gives an empty page; `IDLE`, then `INTRANS`, then `IDLE` on the direct connection; `INTRANS` inside `pool.connection()` and `IDLE` at the next checkout | `commit-after-fetch` killed at `test_the_transaction_belongs_to_the_caller` |
| T007 | complete | VERIFIED | `:270-293`: the exact two-`Failure` tuple, with R1's older row excluded. Cycle 3 adds `test_failure_facts_ignore_other_instruments_and_the_state_clock` (l.370-402), and `_record` gains `acquired_at` (l.73, l.89) | `rv-rows-join-no-instrument` and `rv-completed-at-from-state` killed (v1 IR-001) |
| T008 | complete | VERIFIED | `:296-321`: `ABR` (retired) and `ABW` (clean) sort between `AAA` and `BBB` and take no slot | `subquery-any-lifecycle` killed here |
| T009 | complete | VERIFIED | `:324-367`: `stock_count == 5`, `symbols == ["AAA","BBB","CCC"]`, `newest_completed_at == t_new`, distinct paged symbols equal to the count; the empty-store row. Cycle 3 adds `test_the_newest_completion_time_comes_only_from_the_matched_results` (l.430-457) | The three `rv-count-join-*` mutants are killed (v1 IR-003) |
| T010 | complete | VERIFIED | `test_data_health_models.py`: literal field lists for all 13 classes, frozen params, assignment raises on `Failure`, `ProblemRow` and `ProblemPage`, exact class set | Justified deviation, unchanged from v1: the assignment uses `reason`, because the delivered `test_massive_retry.py` forbids `.attempts` under `tests/`. All 13 `frozen=False` mutants killed |
| T011 | complete | VERIFIED | `models.py:14-124`, unchanged since v1: 13 frozen dataclasses matching RD 2.2 without `cause` (story v2 "Not in this story") | None |
| T012 | complete | VERIFIED | `queries.py`, unchanged since v1: `PROBLEM_ROWS_SQL` matches RD 2.4 line for line, and `PROBLEM_COUNT_SQL` matches the T012 text; both are `Final[str]` | None |
| T013 | complete | VERIFIED | `reader.py:18-55`, unchanged since v1: the signature, one cursor, `limit + 1`, insertion-ordered grouping, `any(… == "failed")`, keep `limit`, a cursor only when more exist; no commit, rollback or `transaction` | None |
| T014 | complete | VERIFIED | `__init__.py`: a docstring citing RD 2.1, `from factorflow.data_health.reader import read_problems`, `__all__ = ["read_problems"]` | None |
| T015 | complete | VERIFIED | `uv run pytest tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py`: 18 passed; `pyproject.toml` unchanged; no router or `factorflow.api` import | None |
| T016 | complete | VERIFIED | All six tech-stack commands pass in the reviewer's run; the `# Implements TC-COMP-039/040/041/042` comments are present; the code diff is exactly the seven planned files | None |
| T017 | complete | VERIFIED | Three cycles, each `APPROVED`, `drift_detected: false`, `tests_executed: true`. Cycle 3's `diff_sha256` equals the `cycle-3.patch` hash. Its RED log and results hashes match (`shasum -a 256`). The test hunks of `cycle-3.patch` equal `git diff 0e4f098 540c3a4 -- tests` line for line. `check-tdd-evidence.py … --require-logs` reports 0 errors and 0 warnings | Cycle 1's separate commit is a recorded deviation (evidence header l.2; v1 IR-004 resolved). Cycle 3's RED applies five of v1's survivors to `queries.py`, and the four new tests then fail (`4 failed, 23 passed`). That RED is meaningful for a tests-only rework |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_sources_hold_no_write_or_ddl_token` / TC-COMP-039 | ADEQUATE | Whole-text, case-insensitive scan of the shipped `queries.py` and `reader.py`; the message names the file and the tokens. Kills `planted-comment` | none |
| `test_guard_finds_a_planted_token`, `test_guard_scans_comments_and_respects_word_boundaries` / TC-COMP-039 | ADEQUATE | All six tokens are found when planted, and so is a token in a comment; `drops`, `updated_at` and `alternatively` are not | none |
| `test_statement_constants_exist`, `test_statements_are_bound_selects`, `test_problem_rows_binds_cursor_and_limit` / TC-COMP-042 (static) | ADEQUATE | Every `_SQL` constant: no interpolation brace, no unbound `%`, a read keyword. The rows statement binds `cursor` and `LIMIT %(limit_plus_one)s`. Kills `cursor-interpolated` and `limit-literal` | none (the `'{}'` strip is covered behaviourally by the cursor test) |
| `test_pages_of_two_over_five_problem_stocks`, `test_full_final_page_has_no_cursor_and_past_the_end_is_empty`, `test_problem_rows_subquery_orders_symbols_before_the_limit` / TC-COMP-040 | ADEQUATE | Literal pages and cursors; full final page; past-the-end page. The static pin requires `SELECT DISTINCT i2.symbol … ORDER BY i2.symbol LIMIT %(limit_plus_one)s`. Kills `reader.py:44` (both), `cursor-ge`, `rv-lookahead-limit`, `rv-reader-keep-lookahead`, `rv-reader-cursor-lookahead-symbol`, `rv-cursor-null-check-dropped`, `rv-subquery-no-order`, `rv-subquery-no-distinct`, `rv2-subquery-order-desc`, `rv2-cursor-null-negated`, `rv2-reader-cursor-first-kept` | none. The subquery order is pinned statically, which v1's IR-002 remediation accepted |
| `test_paging_follows_symbol_order_not_data_type_order` / T004, DAC-E2-3 (additional) | ADEQUATE | `AAA` `prices`, `BBB` `fundamentals` and `CCC` `corporate_actions`, so symbol order is the reverse of data-type order. Literal pages `AAA`, `BBB`, `CCC` at `limit` 1, with literal cursors. Kills `rv-rows-order-datatype-first` | none |
| `test_retryable_rule_and_resolution_only_by_write_or_retirement` / TC-COMP-041 | ADEQUATE | Literal `retryable` per symbol, including the mixed row. `written` for another type keeps the row, `written` for the same type removes it, and retirement removes it. A re-fail keeps the row with the new `run_id` and `reason`. An unchanged re-read and an isolated R4 equal the page. Kills `negate-boolean:50`, `retryable-all`, `subquery-outcome-failed-only`, `join-true`, `rv-reader-reason-dropped`, `rv2-outer-outcome-failed-only` | none. The R3 reason `"second attempt"` is T005's literal, and it is asserted only for its source, never for `retryable` |
| `test_reads_record_nothing` / TC-COMP-041 | ADEQUATE | The full ordered contents of the four tables are equal before and after two reads | none |
| `test_cursor_is_a_bound_parameter` / TC-COMP-042 | ADEQUATE | An injection-shaped cursor gives an empty page and no cursor | none |
| `test_the_transaction_belongs_to_the_caller` / TC-COMP-042 | ADEQUATE | Transaction status around the call, on a direct connection and on a pooled one. Kills `commit-after-fetch` | none |
| `test_failure_facts_come_from_the_matched_result` / T007 | ADEQUATE | The exact `Failure` tuple; R1's older row is excluded. Kills `outer-outcome-dropped`, `rv-rows-join-no-datatype`, `rv-rows-order-symbol-only`, `rv-reader-attempts-constant` | none |
| `test_failure_facts_ignore_other_instruments_and_the_state_clock` / T007 (additional) | ADEQUATE | `BBB`'s `written` result shares `AAA`'s run and data type. `AAA`'s `last_acquired_at` (`T0+1h`) differs from its result's `completed_at` (`T0`). The exact one-`Failure` tuple is asserted. Kills `rv-rows-join-no-instrument` and `rv-completed-at-from-state` | none |
| `test_retired_and_clean_stocks_take_no_page_slot` / T008 | ADEQUATE | Literal pages, with a retired and a clean stock sorting inside page 1. Kills `subquery-any-lifecycle` | none |
| `test_the_count_and_the_rows_are_one_set` / T009 | ADEQUATE | Count, first three symbols, newest time, and agreement with the paged set. Kills `count-not-distinct`, `count-any-lifecycle`, `rv-count-newest-min`, `rv-count-symbols-four`, `rv-count-outcome-failed-only`, `rv2-count-symbols-not-distinct`, `rv2-count-symbols-desc`, `rv2-count-outcome-dropped` | none |
| `test_the_newest_completion_time_comes_only_from_the_matched_results` / T009 (additional) | ADEQUATE | Results outside the matched set all finish at `t_late`, after the matched one at `t_new`: another instrument in the same run, the same instrument's other data type, and an earlier run's row for the problem pair. Exact row `{1, ["AAA"], t_new}`. Kills `rv-count-join-no-instrument`, `rv-count-join-no-datatype`, `rv-count-join-no-run` | none |
| `test_the_count_on_an_empty_store` / T009 | ADEQUATE | Exact empty row `{0, [], None}`. Kills `count-no-coalesce` | none |
| `test_data_health_models.py` (5 tests, 29 cases) / T010 | ADEQUATE | Literal field order per class, frozen params, assignment raises, exact class set. Kills all 13 `frozen=False` mutants | none |
| Delivered `test_sql_is_append_only.py`, `test_package_data_ships_sql.py` / T015 | ADEQUATE (unchanged) | Scan all of `src/factorflow`, including the new package | none |

Each "Kills" entry names the first failing test in the reviewer's mutation run. The run used
`-x`, so a later test may kill the same mutant too.

The mandatory TC-IDs mapped to this story are TC-COMP-039 to TC-COMP-042. Each is implemented
with its `# Implements TC-COMP-0NN` comment and keeps its coverage-matrix rows (DAC-E2-S1-1 to
DAC-E2-S1-4, l.127-130). All four are `ADEQUATE`. TC-COMP-041's edge pin holds: "the `failed`
fixture's reason begins `[unavailable] ` (or is null)" (`data-health-reader-tests.md` l.169).
`UNAVAILABLE = "[unavailable] provider timed out"` (l.30) seeds `FLD` and `MIX`.

The new tests are as isolated and deterministic as v1's:

- every test gets its own database;
- times are fixed aware literals, and expected values are literals;
- symbols are plain capitals;
- nothing reads the clock or the network.

The one raw `INSERT INTO run_instrument_result` (l.439-445) uses bound parameters. It writes an
earlier run's result with no state row. The final store equals what a paired write followed by a
later run's upsert leaves.

### Mutation run (reviewer, `review` cycle)

`mutation-run.py generate --range a77ee42..HEAD --cycle review` writes 17 mutants: 14
`negate-boolean` and 3 `off-by-one`. They are the same IDs as v1's generated set, because no
production line changed. The reviewer added seven of its own (`rv2-…`):

- `array_agg` without `DISTINCT`;
- `array_agg` in descending order;
- the count's outcome predicate dropped;
- the outer rows predicate narrowed to `failed`;
- the cursor's null branch negated;
- the subquery ordered descending;
- the cursor set to the first kept symbol.

`scope --since 0e4f098 --previous …-v1-mutation.json` then adds v1's 33 hand-written mutants.
It tags 50 mutants `carried` and 7 `late`, and drops none. The run used `--jobs 4` and the
story's three focused files (`uv run --all-extras pytest
tests/unit/test_data_health_sql_is_read_only.py tests/unit/test_data_health_models.py
tests/integration/test_data_health_problems.py -x -q -p no:cacheprovider`). All four baselines
pass 56 tests. The results are in `CAP-003-E2-S1-implementation-review-v2-mutation.json` (sha256
`1ccb61e41a3730a93ffc922a8f4cc8a89306b45467376e66699255ba0b0552c4`).

| Mutants | Scope | Result | Equivalence judgment |
|---------|-------|--------|----------------------|
| 13 `models.py` `frozen=True` to `False` | carried | 13 killed | n/a |
| `reader.py:44` (both), `:50` | carried | 3 killed | n/a |
| v1's seven non-equivalent survivors: `rv-rows-join-no-instrument`, `rv-completed-at-from-state`, `rv-rows-order-datatype-first`, `rv-subquery-no-order`, `rv-count-join-no-instrument`, `rv-count-join-no-datatype`, `rv-count-join-no-run` | carried | **7 killed** | n/a (v1 IR-001, IR-002, IR-003 resolved) |
| v1's other 25 hand-written mutants (the coder's 13 and v1's 12 other `rv-…`) | carried | 25 killed | n/a |
| The seven `rv2-…` mutants | late | 7 killed | n/a |
| `reader.py:26:off-by-one:1` (`limit + 1` to `limit + 2`) | carried | survived | **Equivalent**, unchanged from v1. The task plan's Other Notes ("Equivalent mutants") name it. One more stock is fetched, but `read_problems` keeps `limit` rows and sets the cursor only when more than `limit` came back, so rows and cursor are identical for every input |
| `rv-outer-lifecycle-dropped` (outer `i.lifecycle = 'active'` to `true`) | carried | survived | **Equivalent**, unchanged from v1. The task plan's Other Notes name it. `idx_instrument_symbol` is `UNIQUE (symbol)` (migration 0001 l.16, untouched since), so the subquery's active-only symbol set already restricts the outer rows to active instruments |

Totals: 57 mutants, 55 killed, 2 survived (both equivalent), 0 stillborn, 0 timeout. The
coder's cycle-3 run (`mutation-cycle-3-results.json`: 7 mutants, 7 killed) is reproduced: the
same 7 mutants die here, on the same first failing tests as its logs show.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED; not counted |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review` | harness root | 1 | N/A | `BLOCKED — story coding has not reached in-review`. Without `--base-ref`, the state check's TDD lint diffs against the remote default branch (as in v1). Not counted |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | N/A | `READY — review changes were reworked; a new review version is required`, against the driver-supplied integration base (A.2). `--stage story-coding` gives `COMPLETE`. Not counted |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | N/A | `a77ee42…`; `git merge-base --is-ancestor a77ee42 HEAD` exit 0. Not counted |
| `uv run --directory <component> pytest tests/unit/test_data_health_sql_is_read_only.py tests/unit/test_data_health_models.py tests/integration/test_data_health_problems.py -p no:cacheprovider -q` | harness root | 0 | PASS | Focused: 56 passed (14 + 29 + 13) against a `postgres:16` testcontainer |
| `uv sync --directory <component> --all-extras` | harness root | 0 | PASS | 46 resolved, 43 checked; `uv.lock` unchanged (`git diff --quiet HEAD -- uv.lock` exit 0) |
| `uv build --directory <component>` | harness root | 0 | PASS | `factorflow-0.2.0` sdist and wheel built; the sdist includes `src/factorflow/data_health`. Writes only ignored `dist/`, `build/`, `*.egg-info` |
| `uv run --directory <component> pytest -p no:cacheprovider -q` | harness root | 0 | PASS | Full suite with containers: 2778 passed (v1's 2774 plus the 4 new tests), 2 third-party deprecation warnings, 350 s |
| `uv run --directory <component> ruff check .` | harness root | 0 | PASS | All checks passed |
| `uv run --directory <component> ruff format --check .` | harness root | 0 | PASS | 293 files already formatted |
| `uv run --directory <component> mypy src` | harness root | 0 | PASS | No issues in 65 source files |
| `uv run --directory <component> pytest -p no:cacheprovider -q tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py` | harness root | 0 | PASS | T015: 18 passed |
| `grep -nE "conn\.(commit\|rollback\|transaction)\(" src/factorflow/data_health/reader.py` | component root | 1 | PASS | Prints nothing (the plan's DAC-E2-S1-4 check). A wider `grep -rnE "\.(commit\|rollback\|transaction)\(" src/factorflow/data_health/` also prints nothing |
| `git diff --stat a77ee42..HEAD -- src tests pyproject.toml uv.lock` | component root | 0 | PASS | Exactly the seven new files (DEC-0211). `git diff --stat 0e4f098..HEAD -- src pyproject.toml uv.lock` is empty: no production change since v1 |
| DAC-E2-S1-1 planted `-- UPDATE` in `PROBLEM_ROWS_SQL` (mutant `planted-comment`, under `mutation-run.py run` in a clone) | scratch clone | 1 (test command) | PASS | `AssertionError: queries.py holds write tokens: ['UPDATE']`. The component repo was never modified |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base a77ee42c7ae2ed8eccb1cb0a14666b5fb4dcaafd --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. `shasum -a 256` of `cycle-3.patch` (`43f4fb3a…`), `red-cycle-3-rework.log` (`537c3f6d…`) and `mutation-cycle-3-results.json` (`42d88b27…`) matches the recorded values, as do the cycle-1 and cycle-2 patch hashes |
| Compare the test hunks of `cycle-3.patch` with `git diff 0e4f098 540c3a4 -- tests` | scratchpad | 0 | N/A | Both test files are identical line for line (110 and 8 changed lines): the reviewed patch is what was committed |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range a77ee42c7ae2ed8eccb1cb0a14666b5fb4dcaafd..HEAD --cycle review --out <scratch>/mut/generated.json` | harness root | 0 | N/A | 17 mutants; 7 `rv2-…` manual mutants appended (24) |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mut/with-manual.json --since 0e4f098b3955b48252ebb9346e11c4bfc86011c7 --previous <stories>/CAP-003-E2-S1-implementation-review-v1-mutation.json --out <scratch>/mut/mutants.json` | harness root | 0 | N/A | 57 mutants: `carried` 50, `late` 7; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mut/mutants.json --jobs 4 --command '<focused command above, with --all-extras and -x>' --out <scratch>/mut/results.json --logs <scratch>/mut/results-logs --work-root <scratch>/mut/work` | harness root | 3 | N/A | Four baselines exit 0 (56 passed each); 55 killed, 2 survived (both equivalent). Exit 3 reports survivors |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | N/A | `sha256:e8e50d5c…` before and after validation; not counted |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e` | component root | N/A | NOT RUN | No frontend file changed. These are not in the story's or the plan's validation list |
| `uv run pytest -m 'not postgres'` | component root | N/A | NOT RUN | The full suite ran with a container runtime, so the exclusion form was not needed |

Harness root is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b`.
Abbreviations used in the table:

- `<component>` is `repos/factorflow-v2/FactorFlow-v2` under the harness root.
- `<story>` is the story path in the review subject, without its `.md` extension where a suffix
  follows.
- `<stories>` is that story's directory.
- `<scratch>` is the reviewer's session scratchpad, outside every repository.

No command needed to leave the sandbox.

### Validation Side Effects

- Before: clean working tree at `540c3a4` on the story branch. `code-revision` gives
  `sha256:e8e50d5c655bd4111f9b0a657f61e580b9d8ddfc87319731fa180eb6fcabc4fc`.
- After: clean working tree at `540c3a4`, with the same fingerprint.
  - `uv build`, `ruff` and `mypy` write only ignored paths (`dist/`, `build/`, `*.egg-info`,
    `.ruff_cache/`, `.mypy_cache/`).
  - The mutation clones ran in the reviewer's scratchpad.
  - This report and its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 0**

No findings.

The reviewer looked for, and did not find, a defect in the rework:

- The `acquired_at` parameter added to `_record` defaults to the result's `completed_at`. Every
  earlier seed therefore keeps its v1 behaviour.
- The static subquery pin is whitespace-tolerant, and it is anchored to the subquery's
  `SELECT DISTINCT i2.symbol`.
- The repeated reads compare whole `ProblemPage` values, failures and `retryable` included.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `test_failure_facts_ignore_other_instruments_and_the_state_clock` (l.370-402): a second instrument's `written` result in the same run and data type, and `acquired_at` ≠ `completed_at`. `rv-rows-join-no-instrument` and `rv-completed-at-from-state` are killed by it (logs: `1 failed, 53 passed`) |
| v1/IR-002 | RESOLVED | `test_paging_follows_symbol_order_not_data_type_order` (l.405-427) kills `rv-rows-order-datatype-first` (`1 failed, 54 passed`). `test_problem_rows_subquery_orders_symbols_before_the_limit` (unit l.90-92) kills `rv-subquery-no-order` and `rv2-subquery-order-desc` (`1 failed, 13 passed`). v1's remediation allowed a static pin for the subquery order |
| v1/IR-003 | RESOLVED | `test_the_newest_completion_time_comes_only_from_the_matched_results` (l.430-457) seeds, later than the matched `t_new`: a same-run result for another instrument, one for the same instrument's other data type, and an earlier run's result for the problem pair. It kills all three `rv-count-join-*` mutants (`1 failed, 55 passed`) |
| v1/IR-004 | RESOLVED | `CAP-003-E2-S1-tdd-evidence.yaml` l.2 now records three things: cycle 1's separate commit `2626e8c` as a deviation from T017; that commit's red full suite at `test_data_health_models.py:95`; and `0e4f098` as cycle 2's commit (l.51), with cycle 3 as the stage commit. Story-coding constraint 9 limits the coder to metadata edits in the project repo, so the evidence file, not the plan, is the right place for the record. The commit stays in history: promotion is fast-forward, and `docs/supervised-runs.md` (l.69-71) requires a merge commit for the final PR. Rewriting the branch before promotion remains the owner's call, as v1 said (Follow-Up) |
| v1/IR-005 | RESOLVED | `UNAVAILABLE = "[unavailable] provider timed out"` (l.30) replaces `"boom"` in `_problem_stocks` (l.97), in TC-COMP-041's `FLD` and `MIX` fixtures (l.169, l.172) and in `_t008_store` (l.298) |
| v1/IR-006 | RESOLVED | l.206-213: two consecutive reads with no change between them compare equal as whole `ProblemPage` values. R4 (`cancelled`, no results) is then committed alone, and the next read equals the same page |

## Scope and Plan Deviations

- **T003 (justified, unchanged).** `'{}'` is stripped before the "no `{`" assertion, because
  T012's `PROBLEM_COUNT_SQL` coalesces to the empty-array literal.
- **T010 (justified, unchanged).** The assignment check uses `reason`, because the delivered
  `test_massive_retry.py` forbids `.attempts` under `tests/`.
- **Extra test file (justified, unchanged).** `tests/unit/test_data_health_models.py`; the
  plan's Other Notes justify it.
- **Cycle-3 additional tests (justified).** Three integration tests, one static unit test and
  the `acquired_at` helper parameter go beyond the plan's literal text. They are the bounded
  remediations of v1's IR-001, IR-002 and IR-003 and change no production code (story-coding
  C, *Review rework*, item 4).
- **T005 step order (justified).** The plan places the unchanged re-read before R3; the test
  makes it after R3, then reads R4 in isolation. Both properties the plan names are asserted.
- **T017 (recorded).** Cycle 1 has its own commit, against T017; the evidence header records it
  (v1 IR-004).
- **Bookkeeping.** All 17 boxes are checked, and each has evidence. Story status `in-review` is
  consistent. `last_reworked_review` names v1, the report this rework answers.
- **Out-of-scope changes.** None. There is no router registration, no `factorflow.api` import,
  no `pyproject.toml` or `uv.lock` change and no delivered file edit.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`).
- **Required action**: Sync the component documentation against this report, at the reviewed
  state `sha256:e8e50d5c655bd4111f9b0a657f61e580b9d8ddfc87319731fa180eb6fcabc4fc`.
- **Owner note (not a finding)**: The branch keeps cycle 1's commit `2626e8c`, whose full suite
  is red at `tests/unit/test_data_health_models.py:95`. Under the merge-commit policy, it reaches
  `main`'s history. Rewriting the story branch before promotion is the owner's decision, and no
  agent may make it.
- **Warnings accepted downstream**: N/A
