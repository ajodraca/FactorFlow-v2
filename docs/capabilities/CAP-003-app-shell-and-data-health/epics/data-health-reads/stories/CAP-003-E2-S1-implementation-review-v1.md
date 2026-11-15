---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E2-S1"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S1.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-14T17:16:52Z"
reviewed_head: "0e4f098b3955b48252ebb9346e11c4bfc86011c7"
review_base: "a77ee42c7ae2ed8eccb1cb0a14666b5fb4dcaafd"
reviewed_state_revision: "sha256:870cd1241d020414039a765b88b11adea8dff654fdd91cc59c05b10527ab53b1"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-14T17:16:52Z
  source_artifacts:
    - id: CAP-003-E2-S1
      version: "2 (sha256:3bd04aabd6155e539f4c4db9381f34cf7259f1d6ec605da9acfd985453303238)"
    - id: CAP-003-E2-S1-tasks
      version: "1 (draft, updated 2026-11-06)"
    - id: CAP-003-E2-S1-tdd-evidence
      version: "cycle-1, cycle-2"
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
      version: "recorded"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E2-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 2 |
| Low findings | 2 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 12/12 passed |

This is the initial review of `0e4f098` against review base `a77ee42`, the tip of the CAP-003
integration branch `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` for supervised run
`run-20261114T141555Z`. No baseline exists, so every finding has scope `initial`.

The production code is correct as far as the reviewer can find. `PROBLEM_ROWS_SQL` is the RD 2.4
statement verbatim, and `PROBLEM_COUNT_SQL` is T012's statement. `read_problems` groups, pages
and computes `retryable` as planned and issues no commit or rollback. The thirteen models match
RD 2.2 in the version 1 shape. No delivered file changed. All twelve required validation commands
pass, including the full suite (2774 tests against a real PostgreSQL 16 container), and the
TDD-evidence lint is clean.

The gate fails on test strength. The reviewer's mutation run (50 mutants) leaves 7 non-equivalent
survivors:

- **IR-001 (HIGH).** Two violations of DEC-0201's matched-result rule pass every test. The
  failure join can drop its instrument condition, and the completion time can be read from
  `acquisition_state` instead of the result row.
- **IR-002 (HIGH).** Two changes that break keyset paging by symbol pass every test, including
  the mandatory TC-COMP-040. One reorders the rows by data type, and the other drops the
  subquery's `ORDER BY`.
- **IR-003 (MEDIUM).** Three relaxations of `PROBLEM_COUNT_SQL`'s join pass T009.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S1.md` (v2, `in-review`, approved, content revision matches `approval.reviewed_revision`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S1-tasks.md` (v1, draft) |
| Component | `FactorFlow-v2` (also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E2-S1-run-20261114T141555Z` |
| HEAD | `0e4f098b3955b48252ebb9346e11c4bfc86011c7` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` = `a77ee42c7ae2ed8eccb1cb0a14666b5fb4dcaafd`, resolved by `pipeline-state.py review-base --base-ref …`; `git merge-base --is-ancestor` exit 0 |
| Working tree | clean (no staged, unstaged or untracked files), before and after validation |
| Changed files reviewed | 56 (two commits: `2626e8c` cycle 1, `0e4f098` cycle 2) |
| Baseline | none: initial review |

### Changed Files

All files are `added` unless marked `modified`. Paths under `docs/…/stories/` are relative to
`docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/data_health/__init__.py` | added | T014 (RD 2.1; exports `read_problems` only, plan Open Gap 1) |
| `src/factorflow/data_health/models.py` | added | T011 (RD 2.2, version 1 shape; AC-13) |
| `src/factorflow/data_health/queries.py` | added | T012 (RD 2.4, DEC-0201; AC-13, AC-16, DAC-E2-1, DAC-E2-3) |
| `src/factorflow/data_health/reader.py` | added | T013 (AC-13, AC-14, DAC-E2-3, DAC-E2-S1-4) |
| `tests/unit/test_data_health_sql_is_read_only.py` | added | T002, T003 (TC-COMP-039, TC-COMP-042) |
| `tests/unit/test_data_health_models.py` | added | T010 (plan Other Notes, "Extra test file") |
| `tests/integration/test_data_health_problems.py` | added | T004-T009 (TC-COMP-040, -041, -042; AC-13, AC-16, DAC-E2-1) |
| `docs/…/stories/CAP-003-E2-S1.md` | modified | Status `planning` to `in-review` only (story-coding handoff) |
| `docs/…/stories/CAP-003-E2-S1-tasks.md` | modified | 17 checkboxes `[ ]` to `[x]` only; no other word changed |
| `docs/…/stories/CAP-003-E2-S1-tdd-evidence.yaml` | added | T017 |
| `docs/…/stories/CAP-003-E2-S1-evidence/cycle-1.patch`, `cycle-2.patch` | added | T017 (`reviewed_patch`) |
| `docs/…/stories/CAP-003-E2-S1-evidence/red-cycle-1-models.log`, `red-cycle-2-read-problems.log` | added | T017 (`red_log`) |
| `docs/…/stories/CAP-003-E2-S1-evidence/mutants-cycle-1.json`, `mutants-cycle-2.json` | added | T017 (mutation inputs) |
| `docs/…/stories/CAP-003-E2-S1-evidence/mutation-cycle-1-results.json`, `mutation-cycle-2-results.json` | added | T017 (`mutation.results`) |
| `docs/…/stories/CAP-003-E2-S1-evidence/mutation-cycle-1-results-logs/*` (17 logs) | added | T017 (4 baselines, 13 mutants) |
| `docs/…/stories/CAP-003-E2-S1-evidence/mutation-cycle-2-results-logs/*` (21 logs) | added | T017 (4 baselines, 17 mutants) |

`git diff --stat a77ee42..HEAD -- src tests pyproject.toml uv.lock` lists only the seven new
code files. No delivered file is modified (DEC-0211). There is no unjustified change.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | SATISFIED | `queries.py:13-38` selects `data_type`, `last_outcome AS outcome`, `r.reason`, `r.attempts`, `r.completed_at`, `last_run_id AS run_id`; `reader.py:29-40` builds one `Failure` per row | `test_failure_facts_come_from_the_matched_result` (exact `Failure` tuple, two failures); TC-COMP-040 tests | Code correct. The test evidence cannot see a cross-instrument join or the completion time's source (IR-001) |
| AC-14 | SATISFIED | `reader.py:50` `retryable=any(f.outcome == "failed" …)` | `test_retryable_rule_and_resolution_only_by_write_or_retirement`: `NFX` False, `FLD` True, `MIX` True | `negate-boolean:50` and coder `retryable-all` killed |
| AC-9 | SATISFIED | The predicate reads current `acquisition_state` only; nothing is written | TC-COMP-041 tests: rows leave on `written` or retirement and on nothing else; table snapshot unchanged across reads | Step 4 is evidenced indirectly (IR-006) |
| AC-16 | SATISFIED | `PROBLEM_COUNT_SQL` (`queries.py:42-53`) has the same joins and predicate as the rows | `test_the_count_and_the_rows_are_one_set`: `stock_count == 5` equals the distinct paged symbols; `test_the_count_on_an_empty_store` | Set identity pinned (coder `count-not-distinct`, `count-any-lifecycle` killed). The full three-way equality is E2-S3/E2-S6/E2-S7's (plan Resolved Conflict 3). `newest_completed_at` source unpinned (IR-003) |
| DAC-E2-1 | SATISFIED | `queries.py:22-27`, `:29-33` (active, `failed`/`not_found`, join on `(last_run_id, instrument_id, data_type)`) | T007, T008 (`ABR` retired, `ABW` clean take no slot), T009 (`ABR` not counted) | IR-001: the instrument and completion-time halves of "facts from the matched row" are unpinned |
| DAC-E2-2 | SATISFIED | As AC-9 | `test_retryable_rule_…`: `written` for another type keeps `NFX`; `written` for `prices` removes `FLD`; `retire_symbol` removes `NFX`; a re-fail in R3 keeps `MIX` with `run_id == r3` | IR-005, IR-006 (LOW) |
| DAC-E2-3 | SATISFIED | `queries.py:34-36` keyset `> %(cursor)s`, `ORDER BY i2.symbol`, `LIMIT %(limit_plus_one)s`; `reader.py:26`, `:42-44` | TC-COMP-040 tests: pages `AAA BBB / CCC DDD / EEE`, cursors `BBB`, `DDD`, None; full final page has no cursor; past the end is empty | Code correct; TC-COMP-040 `WEAK` (IR-002) |
| DAC-E2-S1-1 | SATISFIED | Neither `queries.py` nor `reader.py` holds any of the six tokens (whole-text scan passes) | `test_sources_hold_no_write_or_ddl_token` and the guard self-tests | Coder `planted-comment` (`-- UPDATE`) killed with `queries.py holds write tokens: ['UPDATE']` |
| DAC-E2-S1-2 | SATISFIED | As DAC-E2-3 | As DAC-E2-3 | IR-002 |
| DAC-E2-S1-3 | SATISFIED | As AC-14 and DAC-E2-2 | `test_retryable_rule_…`, `test_reads_record_nothing` | IR-005, IR-006 (LOW) |
| DAC-E2-S1-4 | SATISFIED | `reader.py:25-27`: one dict of bound parameters; no `commit`, `rollback` or `transaction` call (`grep -rnE "\.(commit\|rollback\|transaction)\(" src/factorflow/data_health/` prints nothing) | `test_statements_are_bound_selects`, `test_problem_rows_binds_cursor_and_limit`, `test_cursor_is_a_bound_parameter`, `test_the_transaction_belongs_to_the_caller` | Coder `cursor-interpolated`, `limit-literal`, `commit-after-fetch` killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | The delivered migrations, both fixtures, and `retire_symbol` exist and behave as the plan assumes. Every integration test uses them, and the full suite passes. `tests/conftest.py` is unchanged | None |
| T002 | complete | VERIFIED | `test_data_health_sql_is_read_only.py:16-59`: `WRITE_TOKENS`, `write_tokens`, `\b…\b` with `re.IGNORECASE`, sources via `Path(module.__file__)`, whole-text scan, planted and word-boundary self-tests | None |
| T003 | complete | VERIFIED | `:33-84`: `_SQL` constants via `vars(queries)`, no `{`, no unbound `%`, first keyword `SELECT`/`WITH`, `%(cursor)s` and `LIMIT\s+%\(limit_plus_one\)s` | Justified deviation: `'{}'` is stripped before the `{` check, because T012's own `PROBLEM_COUNT_SQL` coalesces to `'{}'`. Recorded in the cycle-2 TDD description |
| T004 | complete | VERIFIED | `test_data_health_problems.py:118-152`: literal pages and cursors, full final page, cursor past the end | All planned kills die. Test `WEAK` against ordering mutants (IR-002) |
| T005 | complete | VERIFIED | `:155-225`: seeds and literals as planned, resolution steps 1-3, R3 re-fail with `run_id` and `reason`, snapshot of the four tables in `test_reads_record_nothing` | No consecutive unchanged reads are compared, and R4 is seeded together with R3 (IR-006). The `failed` fixture reason is `"boom"` (IR-005) |
| T006 | complete | VERIFIED | `:228-259`: injection-shaped cursor gives an empty page; `IDLE`, then `INTRANS`, then `IDLE` on the direct connection; `INTRANS` inside `pool.connection()` and `IDLE` on the next checkout | Coder `commit-after-fetch` killed (`IDLE` != `INTRANS` at `:250`) |
| T007 | complete | VERIFIED | `:262-285`: the exact two-`Failure` tuple in `data_type` order, R1's older row excluded | All planned kills die. Test `WEAK` against `rv-rows-join-no-instrument` and `rv-completed-at-from-state` (IR-001) |
| T008 | complete | VERIFIED | `:288-313`: `ABR` (retired) and `ABW` (clean) sort between `AAA` and `BBB` and take no slot | Coder `subquery-any-lifecycle` is first killed by this test. `subquery-outcome-failed-only` dies first in the TC-COMP-041 test under `-x` |
| T009 | complete | VERIFIED | `:316-359`: `stock_count == 5`, `symbols == ["AAA","BBB","CCC"]`, `newest_completed_at == t_new`, distinct paged symbols equal the count; empty-store row | All planned kills die. Test `WEAK` against three join relaxations (IR-003) |
| T010 | complete | VERIFIED | `test_data_health_models.py`: literal field lists for all 13 classes, frozen params, assignment raises on `Failure`, `ProblemRow`, `ProblemPage`, exact class set | Assignment uses `reason`, not `attempts`, because the delivered `test_massive_retry.py` forbids `.attempts` under `tests/`. The extra class-set test is justified. All 13 `frozen=False` mutants killed |
| T011 | complete | VERIFIED | `models.py:14-124`: 13 frozen dataclasses, fields, order and types identical to RD 2.2 without `cause` (story v2 "Not in this story"); docstring cites RD 2.2, system design 4.2, DEC-0200 | None |
| T012 | complete | VERIFIED | `queries.py`: `PROBLEM_ROWS_SQL` matches RD 2.4 line for line (file label and `;` dropped as allowed); `PROBLEM_COUNT_SQL` matches T012 text; both `Final[str]`; docstring has no write token | None |
| T013 | complete | VERIFIED | `reader.py:18-55`: signature, single cursor, `limit + 1`, insertion-ordered grouping, `cast` on outcome, `any(… == "failed")`, keep `limit`, cursor only when more; no commit/rollback/`transaction`; docstring states the precondition | None |
| T014 | complete | VERIFIED | `__init__.py`: docstring citing RD 2.1, `from factorflow.data_health.reader import read_problems`, `__all__ = ["read_problems"]` | Cycle 1 created a docstring-only file and cycle 2 added the export |
| T015 | complete | VERIFIED | `uv run pytest tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py`: 18 passed; `pyproject.toml` unchanged; no router or `factorflow.api` import | None |
| T016 | complete | VERIFIED | All six tech-stack commands pass in the reviewer's run; `# Implements TC-COMP-039/040/041/042` comments present; code diff is exactly the seven planned files | None |
| T017 | complete | VERIFIED | Two cycles, each `APPROVED`, `drift_detected: false`, `tests_executed: true`, `diff_sha256` equal to the `reviewed_patch` hash; RED-log, patch and results hashes match (`shasum -a 256`); `check-tdd-evidence.py … --require-logs` 0 errors, 0 warnings | Cycle 1 was committed separately, against T017's "no per-cycle commit". That commit fails a delivered guard, and the header comment misattributes it (IR-004) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_sources_hold_no_write_or_ddl_token` / TC-COMP-039 | ADEQUATE | Whole-text, case-insensitive scan of the shipped `queries.py` and `reader.py`; message names file and tokens. Kills `planted-comment` | none |
| `test_guard_finds_a_planted_token`, `test_guard_scans_comments_and_respects_word_boundaries` / TC-COMP-039 | ADEQUATE | All six tokens found when planted; a comment token is found; `drops`, `updated_at`, `alternatively` are not | none |
| `test_statement_constants_exist`, `test_statements_are_bound_selects`, `test_problem_rows_binds_cursor_and_limit` / TC-COMP-042 (static) | ADEQUATE | Every `_SQL` constant: no interpolation brace, no unbound `%`, a read keyword; rows bind `cursor` and `LIMIT %(limit_plus_one)s`. Kills `cursor-interpolated`, `limit-literal` | The `'{}'` strip would also hide a `'{}'` format placeholder. The behavioural cursor test still covers that case |
| `test_pages_of_two_over_five_problem_stocks`, `test_full_final_page_has_no_cursor_and_past_the_end_is_empty` / TC-COMP-040 | **WEAK** | Literal pages and cursors; full final page; past-the-end page. Kills `off-by-one:44` (both), `cursor-ge`, `rv-lookahead-limit`, `rv-reader-keep-lookahead`, `rv-reader-cursor-lookahead-symbol`, `rv-cursor-null-check-dropped` | Every store has one `prices` failure per stock, so `rv-rows-order-datatype-first` and `rv-subquery-no-order` survive (IR-002) |
| `test_retryable_rule_and_resolution_only_by_write_or_retirement` / TC-COMP-041 | ADEQUATE | Literal `retryable` per symbol, including the mixed row; written-other-type keeps; written-same-type removes; retirement removes; re-fail keeps with new `run_id`/`reason`. Kills `negate-boolean:50`, `retryable-all`, `subquery-outcome-failed-only`, `join-true`, `rv-reader-reason-dropped` | Step 4 indirect (IR-006); fixture reason (IR-005) |
| `test_reads_record_nothing` / TC-COMP-041 | ADEQUATE | Full ordered contents of the four tables equal before and after two reads | none |
| `test_cursor_is_a_bound_parameter` / TC-COMP-042 | ADEQUATE | Injection-shaped cursor gives an empty page and no cursor | none |
| `test_the_transaction_belongs_to_the_caller` / TC-COMP-042 | ADEQUATE | Transaction status around the call on a direct connection and a pooled one. Kills `commit-after-fetch` | none |
| `test_failure_facts_come_from_the_matched_result` / T007 | **WEAK** | Exact `Failure` tuple; R1's older row excluded. Kills `outer-outcome-dropped`, `rv-rows-join-no-datatype`, `rv-rows-order-symbol-only`, `rv-reader-attempts-constant` | One instrument only, and `_record` sets `last_acquired_at = completed_at`, so `rv-rows-join-no-instrument` and `rv-completed-at-from-state` survive (IR-001) |
| `test_retired_and_clean_stocks_take_no_page_slot` / T008 | ADEQUATE | Literal pages with a retired and a clean stock sorting inside page 1. Kills `subquery-any-lifecycle` | Ordering gap shared with TC-COMP-040 (IR-002) |
| `test_the_count_and_the_rows_are_one_set` / T009 | **WEAK** | Count, first three symbols, newest time, and agreement with the paged set. Kills `count-not-distinct`, `count-any-lifecycle`, `rv-count-newest-min`, `rv-count-symbols-four`, `rv-count-outcome-failed-only`, `rv-subquery-no-distinct` | The newest result is alone in its run, and every other result has the same time, so three join relaxations survive (IR-003) |
| `test_the_count_on_an_empty_store` / T009 | ADEQUATE | Exact empty row `{0, [], None}`. Kills `count-no-coalesce` | none |
| `test_data_health_models.py` (5 tests, 29 cases) / T010 | ADEQUATE | Literal field order per class, frozen params, assignment raises, exact class set. Kills all 13 `frozen=False` mutants | none |
| Delivered `test_sql_is_append_only.py`, `test_package_data_ships_sql.py` / T015 | ADEQUATE (unchanged) | Scan all of `src/factorflow`, including the new package | none |

Each "Kills" entry names the first failing test in the reviewer's mutation run. The run used
`-x`, so a later test in the file may kill the same mutant too.

The mandatory TC-IDs mapped to this story are TC-COMP-039 to TC-COMP-042. Each is implemented
with its `# Implements TC-COMP-0NN` comment and keeps its coverage-matrix rows (DAC-E2-S1-1 to
DAC-E2-S1-4, l.127-130). TC-COMP-040 is `WEAK`. The tests are isolated and deterministic:

- every test gets its own database through `postgres_connection_string`;
- times are fixed aware literals, and expected values are literals;
- symbols are plain capitals, so the expected order does not depend on collation;
- nothing reads the clock or the network.

Both RED logs are collection-time import failures of `factorflow.data_health` and
`factorflow.data_health.queries`. That matches the plan's Phase 2 checkpoint, so they are
accepted as planned.

### Mutation run (reviewer, `review` cycle)

`mutation-run.py generate --range a77ee42..HEAD --cycle review` writes 17 mutants: 14
`negate-boolean` and 3 `off-by-one`. The catalogue has no operator for SQL inside Python string
constants. The reviewer added:

- the coder's 13 hand-written mutants, re-tagged `review`;
- 20 of their own (`rv-…`). These cover:
  - every join condition of both statements;
  - both `ORDER BY` clauses, `DISTINCT` and the cursor's null branch;
  - the facts' source columns, and the count's aggregates and predicate;
  - the reader's slice, cursor and `Failure` fields;
  - T004's `limit + 1` to `limit` lookahead mutant, which the catalogue does not generate. It
    generates only `limit + 2`.

The run used `--jobs 4` and the story's three focused files
(`uv run --all-extras pytest tests/unit/test_data_health_sql_is_read_only.py
tests/unit/test_data_health_models.py tests/integration/test_data_health_problems.py -x -q -p
no:cacheprovider`). All four baselines pass 52 tests. The results are in
`CAP-003-E2-S1-implementation-review-v1-mutation.json` (sha256
`803d26a4cc2fc5acb4c602d5166a7544486f7f1fbc6ba0ddf9f76d7c7d3853dc`).

| Mutants | Result | Equivalence judgment |
|---------|--------|----------------------|
| 13 `models.py` `frozen=True` to `False` | 13 killed | n/a |
| `reader.py:44` (both), `:50`; coder's 13 manual; `rv-rows-join-no-datatype`, `rv-rows-order-symbol-only`, `rv-cursor-null-check-dropped`, `rv-subquery-no-distinct`, `rv-count-newest-min`, `rv-count-symbols-four`, `rv-count-outcome-failed-only`, `rv-reader-keep-lookahead`, `rv-reader-cursor-lookahead-symbol`, `rv-reader-reason-dropped`, `rv-reader-attempts-constant`, `rv-lookahead-limit` | 28 killed | n/a |
| `reader.py:26:off-by-one:1` (`limit + 1` to `limit + 2`) | survived | **Equivalent.** The task plan's Other Notes ("Equivalent mutants") name it. One more stock is fetched, but `read_problems` keeps `limit` and sets the cursor only when more than `limit` came back. Rows and cursor are identical for every input |
| `rv-outer-lifecycle-dropped` (outer `i.lifecycle = 'active'` to `true`) | survived | **Equivalent.** The task plan's Other Notes name it. `idx_instrument_symbol` is `UNIQUE (symbol)` (migration 0001 l.16), so the subquery's active-only symbol set already restricts the outer rows to active instruments |
| `rv-rows-join-no-instrument` (drop `AND r.instrument_id = s.instrument_id` from `PROBLEM_ROWS_SQL`) | **survived** | Not equivalent. DEC-0201 says the facts come "from run_instrument_result for that row's last_run_id, data type and instrument", and RD 2.4 says the same (IR-001) |
| `rv-completed-at-from-state` (`r.completed_at` to `s.last_acquired_at AS completed_at`) | **survived** | Not equivalent. RD 2.4 says the "completion time come[s] from the run_instrument_result row", and DAC-E2-1 says the same. The delivered writer stamps both with `now()` in one transaction, so nothing observes it yet (IR-001) |
| `rv-rows-order-datatype-first` (`ORDER BY i.symbol, s.data_type` to `ORDER BY s.data_type, i.symbol`) | **survived** | Not equivalent. RD 2.4's statement, DAC-E2-3's "page by symbol", and T013's "the SQL order is the page order" all fix the order. It reorders the page and loses stocks (IR-002) |
| `rv-subquery-no-order` (drop the subquery's `ORDER BY i2.symbol`) | **survived** | Not equivalent. Without it, `LIMIT` takes an arbitrary `limit + 1` symbols above the cursor. RD 2.4's statement includes the clause. The survival reflects this planner's choice at test sizes (IR-002) |
| `rv-count-join-no-instrument`, `rv-count-join-no-datatype`, `rv-count-join-no-run` | **survived** | Not equivalent. T012 says "the same joins and predicate", RD 2.4 says the same, and DEC-0201 fixes the match. `newest_completed_at` can then come from a result outside the matched set (IR-003) |

Totals: 50 mutants, 41 killed, 9 survived (2 equivalent, 7 non-equivalent), 0 stillborn, 0
timeout. The coder's cycle-2 run (17 mutants, 1 equivalent survivor) is reproduced exactly: the
same 16 kills and the same equivalent `:26` survivor.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED; not counted |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review` | harness root | 1 | N/A | `BLOCKED — story coding has not reached in-review`. Without `--base-ref`, the TDD lint inside the state check diffs against the remote default branch. Not counted |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | N/A | `READY — story is ready for independent review`, against the driver-supplied integration base (A.2). Not counted |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | N/A | `a77ee42…`, ancestor of HEAD; not counted |
| `uv run --directory <component> pytest tests/unit/test_data_health_sql_is_read_only.py tests/unit/test_data_health_models.py tests/integration/test_data_health_problems.py -p no:cacheprovider` | harness root | 0 | PASS | Focused, run first: 52 passed (13 + 29 + 10) against a `postgres:16` testcontainer |
| `uv sync --directory <component> --all-extras` | harness root | 0 | PASS | 46 resolved, 43 checked; `uv.lock` unchanged |
| `uv build --directory <component>` | harness root | 0 | PASS | sdist and wheel `factorflow-0.2.0` built. The sdist includes `src/factorflow/data_health`. Writes only ignored `dist/`, `build/` and `*.egg-info` |
| `uv run --directory <component> pytest -p no:cacheprovider -q` | harness root | 0 | PASS | Full suite with containers: 2774 passed, 2 third-party deprecation warnings, 455 s |
| `uv run ruff check .` | component root | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | component root | 0 | PASS | 293 files already formatted |
| `uv run mypy src` | component root | 0 | PASS | No issues in 65 source files |
| `uv run pytest -p no:cacheprovider -q tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py` | component root | 0 | PASS | T015: 18 passed |
| `grep -nE "conn\.(commit\|rollback\|transaction)\(" src/factorflow/data_health/reader.py` | component root | 1 | PASS | Prints nothing (plan DAC-E2-S1-4 check). A wider `grep -rnE "\.(commit\|rollback\|transaction)\(" src/factorflow/data_health/` also prints nothing |
| `git diff --stat a77ee42..HEAD -- src tests pyproject.toml uv.lock` | component root | 0 | PASS | Exactly the seven new files (DEC-0211) |
| DAC-E2-S1-1 planted `-- UPDATE` in `PROBLEM_ROWS_SQL` (coder mutant `planted-comment`, under `mutation-run.py run` in a clone) | scratch clone | 1 (test command) | PASS | `AssertionError: queries.py holds write tokens: ['UPDATE']`; the component repo was never modified |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base a77ee42c7ae2ed8eccb1cb0a14666b5fb4dcaafd --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. `shasum -a 256` of both patches, both RED logs and both results files matches the recorded values |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range a77ee42c7ae2ed8eccb1cb0a14666b5fb4dcaafd..HEAD --cycle review --out <scratch>/mutants.json` | harness root | 0 | N/A | 17 mutants, then 33 manual mutants appended (50) |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 4 --command '<focused command above>' --out <scratch>/results.json --logs <scratch>/results-logs --work-root <scratch>/work` | harness root | 1, 3, 1, 1, then 3 | N/A | (1) The work root did not exist (`FileNotFoundError`). (2) 49 mutants ran: 40 killed and the same 9 survived. (3) After `rv-lookahead-limit` was added, the clone check refused while this report's two untracked files existed. (4) `--resume` then refused because the mutants file had changed. (5) The run of record: all 50 mutants rerun, four baselines exit 0, the same 9 survivors and outcomes. Exit 3 reports survivors |
| `uv run --directory <scratch clone at 2626e8c> --all-extras pytest -p no:cacheprovider -q tests/unit/test_massive_retry.py -k reads_attempts` | harness root | 1 | N/A | Reviewer probe of the cycle-1 commit: `assert ['tests/unit/test_data_health_models.py:95'] == []` (IR-004). Passes at HEAD within the full suite |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | N/A | `sha256:870cd124…` before and after validation; not counted |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e` | component root | N/A | NOT RUN | No frontend file changed. These are not in the story's or the plan's validation list |
| `uv run pytest -m 'not postgres'` | component root | N/A | NOT RUN | The full suite ran with a container runtime, so the exclusion form was not needed |

Harness root is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b`.
Abbreviations used in the table:

- `<component>` is `repos/factorflow-v2/FactorFlow-v2` under the harness root.
- `<story>` is the story path in the review subject, without its `.md` extension where a suffix
  follows.
- `<scratch>` is the reviewer's session scratchpad, outside every repository.

No command needed to leave the sandbox.

### Validation Side Effects

- Before: clean working tree at `0e4f098` on the story branch. `code-revision` gives
  `sha256:870cd1241d020414039a765b88b11adea8dff654fdd91cc59c05b10527ab53b1`.
- After: clean working tree at `0e4f098`, with the same fingerprint.
  - `uv build`, `ruff` and `mypy` write only ignored paths (`dist/`, `build/`, `*.egg-info`,
    `.ruff_cache/`, `.mypy_cache/`).
  - The mutation clones and the cycle-1 probe clone ran in the reviewer's scratchpad.
  - For the run of record, the reviewer moved only its own two untracked report files to the
    scratchpad, then moved them back.
  - This report and its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 2 · MEDIUM 2 · LOW 2 · **total 6**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | HIGH | initial | Failure facts are pinned to the matched run only: the instrument condition and the completion time's source survive mutation |
| IR-002 | HIGH | initial | TC-COMP-040 pages only single-data-type stores: the row order and the subquery's symbol order are unpinned |
| IR-003 | MEDIUM | initial | `PROBLEM_COUNT_SQL`'s join conditions are unpinned: `newest_completed_at` can come from outside the matched set |
| IR-004 | MEDIUM | initial | Cycle 1 was committed separately against T017, and that commit fails a delivered guard |
| IR-005 | LOW | initial | TC-COMP-041's `failed` fixture reason is `"boom"`, not `[unavailable] …` or null as the test specification pins |
| IR-006 | LOW | initial | T005 step 4's "a further read with no change returns the identical page" is not asserted, and R4 is not isolated |

### IR-001 — Failure facts are pinned to the matched run only: the instrument condition and the completion time's source survive mutation

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-13, DAC-E2-1. The code satisfies both, but the tests that should guard them cannot see these two violations.
- **Tasks**: T007 (and T004, whose TC-COMP-040 traces to AC-13)
- **Files**:
  - `tests/integration/test_data_health_problems.py`: `test_failure_facts_come_from_the_matched_result` (l.262-285) and `_record` (l.61-87, which writes `last_acquired_at` from `completed_at`, l.86)
  - `src/factorflow/data_health/queries.py` l.19 (`r.completed_at`) and l.23-25 (the join)
- **Claim challenged**: T007 proves "Failure facts come from the matched result". The plan names
  its kills as dropped field copies and the removal of `r.run_id = s.last_run_id`.
- **Observed evidence**: Two non-equivalent mutants pass all 52 focused tests (logs `…rv-rows-join-no-instrument.log`, `…rv-completed-at-from-state.log`: `52 passed`):
  - `rv-rows-join-no-instrument` drops `AND r.instrument_id = s.instrument_id` from `PROBLEM_ROWS_SQL`.
  - `rv-completed-at-from-state` reads `s.last_acquired_at AS completed_at` instead of `r.completed_at`.

  T007 seeds a single instrument, so a join that also matches other instruments' results in the
  same run cannot show. TC-COMP-040 and T008 do seed five stocks in one run, but they assert only
  symbols and cursors. `_record` gives `acquisition_state.last_acquired_at` the same value as the
  result's `completed_at` in every seed, so the two sources of the completion time cannot be told
  apart.
- **Expected evidence/behavior**: DEC-0201 says "the row's what-failed, reason and attempts come
  from run_instrument_result for that row's last_run_id, data type and instrument". RD 2.4 says
  "Each failure's reason, attempts and completion time come from the `run_instrument_result` row
  … matched on `(last_run_id, instrument_id, data_type)`". DAC-E2-1 says "with each failure's
  facts from the matched `run_instrument_result` row". AC-13 requires that, per failure, the row
  carries "the reason reported, the attempts and the completion time". Skill step E.9 requires that
  no non-equivalent mutant survives.
- **Impact**: Without the instrument condition, a problem row on a real store carries one extra
  "failure" per stock that the same download recorded for that data type. One download records
  every followed stock, up to 3000. Each extra failure shows another stock's reason, attempts and
  time (`written` results included) under this stock's `failed` or `not_found` outcome. Every test
  still passes. The completion-time variant cannot be observed with the delivered writer, which
  stamps both columns with `now()` in one transaction (`ingestion/writer.py`, `outcomes.py`). Any
  writer that stamps them apart would expose it.
- **Required remediation**: Kill both mutants with the story's focused suites:
  - seed a second instrument whose result in the same run and data type differs from the first
    (for example a `written` result or a different reason), and assert the first stock's
    `failures` tuple exactly;
  - seed at least one failure whose `acquisition_state.last_acquired_at` differs from its
    result's `completed_at`, and assert the result's value.

### IR-002 — TC-COMP-040 pages only single-data-type stores: the row order and the subquery's symbol order are unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-3, DAC-E2-S1-2. The code satisfies both, but the mandatory test that guards them is `WEAK`.
- **Tasks**: T004 (TC-COMP-040), T008
- **Files**:
  - `tests/integration/test_data_health_problems.py`: `_problem_stocks` (l.90-95), the TC-COMP-040 tests (l.118-152) and `_t008_store` (l.288-295)
  - `src/factorflow/data_health/queries.py` l.35 and l.37
- **Claim challenged**: TC-COMP-040 and T008 prove keyset paging by symbol.
- **Observed evidence**: Two non-equivalent mutants pass all 52 focused tests:
  - `rv-rows-order-datatype-first` changes `ORDER BY i.symbol, s.data_type` to
    `ORDER BY s.data_type, i.symbol`.
  - `rv-subquery-no-order` drops the subquery's `ORDER BY i2.symbol`.

  Every paging store gives each problem stock exactly one `prices` failure, so grouping by first
  appearance gives symbol order whatever the outer `ORDER BY` says. At test sizes PostgreSQL
  happens to return the `DISTINCT` symbols sorted, so `LIMIT` takes the right ones without the
  subquery's clause.
- **Expected evidence/behavior**:
  - RD 2.4's statement carries both clauses.
  - DAC-E2-3 says `read_problems` "MUST page by symbol with the `limit + 1` lookahead, returning
    `next_cursor` as the last kept symbol".
  - T013 says "the SQL order is the page order".
  - Skill step E.9: a survivor makes the test that should kill it `WEAK`, and step H: a `WEAK`
    mandatory test is at least HIGH.
- **Impact**: Take `AAA` with `prices` `failed` and `BBB` with `fundamentals` `not_found`, at
  `limit` 1, under the first mutant:
  - The rows arrive as (`BBB`, fundamentals) then (`AAA`, prices), so page 1 is `[BBB]` with
    cursor `BBB`.
  - Page 2 starts after `BBB` and is empty.
  - `AAA` is never served, though `PROBLEM_COUNT_SQL` counts it. That also breaks AC-16's
    promise that every counted stock has a row.

  The second mutant lets a hashed `DISTINCT` hand `LIMIT` an arbitrary `limit + 1` symbols, which
  skips stocks between pages.
- **Required remediation**:
  - Add a paging case with literal pages and cursors, as in T004, where an earlier symbol's only
    failure sorts by data type after a later symbol's failure. It must kill
    `rv-rows-order-datatype-first`.
  - Add an assertion that fails when the subquery loses `ORDER BY i2.symbol`. A deterministic
    behavioural test is preferred. A static pin of the subquery's `ORDER BY i2.symbol` before
    `LIMIT %(limit_plus_one)s` is acceptable, as T003 already pins the `LIMIT`.

### IR-003 — `PROBLEM_COUNT_SQL`'s join conditions are unpinned: `newest_completed_at` can come from outside the matched set

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-16 and DAC-E2-1 are not made incomplete. The set identity (count and
  symbols) is pinned, and only the `newest_completed_at` column's source is not.
- **Tasks**: T009, T012
- **Files**:
  - `src/factorflow/data_health/queries.py` l.45 and l.47-50
  - `tests/integration/test_data_health_problems.py`: `test_the_count_and_the_rows_are_one_set` (l.316-348)
- **Claim challenged**: `PROBLEM_COUNT_SQL` is "the same joins and predicate" (T012), and T009
  observes it.
- **Observed evidence**: Three non-equivalent mutants pass all 52 focused tests:
  - `rv-count-join-no-instrument`
  - `rv-count-join-no-datatype`
  - `rv-count-join-no-run`

  In T009's store, the newest result (`BBB` `fundamentals` at `t_new`) is the only result in its
  run, and every other result is stamped `T0`. A `max` over a wider join therefore still returns
  `t_new`. `count(DISTINCT …)` and `array_agg(DISTINCT …)` do not move.
- **Expected evidence/behavior**: T012 ("the same joins and predicate"), RD 2.4 ("the same
  predicate with … `max(r.completed_at)`") and DEC-0201 fix the match on
  `(last_run_id, instrument_id, data_type)`. The `Problems.newest_completed_at` it feeds is E2-S2's
  Q3.
- **Impact**: `newest_completed_at` would report the time of a result outside the problem set.
  Two cases are reachable, both later in the same run: a `written` result of another stock, or of
  the same stock's other data type. The no-run variant shows only if an earlier run's result
  completed after the matched one, which serial runs stamped with `now()` do not produce. The
  severity is MEDIUM, not HIGH: T009 is an additional test, and the AC-16 set identity it exists
  for is pinned.
- **Required remediation**: Kill all three mutants with the focused suites. Seed results outside
  the matched set whose `completed_at` is later than `t_new`, and assert `newest_completed_at`
  still equals `t_new`:
  - a same-run result for another instrument;
  - a same-run result for the same instrument's other data type;
  - an earlier-run result for a problem pair.

### IR-004 — Cycle 1 was committed separately against T017, and that commit fails a delivered guard

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T017, T010
- **Files**:
  - `docs/…/stories/CAP-003-E2-S1-tdd-evidence.yaml` (l.2, l.22)
  - commit `2626e8cd85506d3e2f170e82748583c059be151a`
  - `tests/unit/test_data_health_models.py:95` as of that commit
- **Claim challenged**: T017 says every cycle records `commit_hash: stage`, with no per-cycle
  commit. The evidence header says "each cycle's reviewed patch is isolated".
- **Observed evidence**:
  - Cycle 1 was committed on its own as `2626e8c` and records that hash.
  - The header says "cycle 2 is the final stage commit (commit_hash: 2626e8cd…)", but `2626e8c`
    is cycle 1's commit and cycle 2 records `stage`.
  - At `2626e8c` the models test assigns `failure.attempts = 4`. The delivered
    `tests/unit/test_massive_retry.py::test_the_429_change_adds_no_package_and_no_test_fakes_a_429_or_reads_attempts`
    (l.759-825) rejects that. The reviewer's run at that commit fails with
    `assert ['tests/unit/test_data_health_models.py:95'] == []`.
  - Cycle 2 changed the line to `failure.reason`. Cycle 1's green evidence ran only the focused
    file.
- **Expected evidence/behavior**: T017's commit rule. Every commit the branch carries should pass
  the tech stack's `uv run pytest`.
- **Impact**: If the story branch is merged with its history, the history keeps a commit whose
  full suite is red, which misleads `git bisect` and per-commit CI. The header comment
  misattributes the evidence. HEAD itself is green, and the lint passes.
- **Required remediation**: Record the per-cycle commit as a plan deviation and correct the header
  comment. Before integration, either merge without the red intermediate commit or record why it
  is acceptable. The reviewer prescribes no history rewrite, which is the owner's call.

### IR-005 — TC-COMP-041's `failed` fixture reason is `"boom"`, not `[unavailable] …` or null as the test specification pins

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-14, DAC-E2-S1-3
- **Tasks**: T005
- **Files**: `tests/integration/test_data_health_problems.py` l.94, l.166 and l.169
- **Claim challenged**: The test implements TC-COMP-041 as specified.
- **Observed evidence**: The `FLD` and `MIX` `failed` fixtures, and `_problem_stocks`, use
  `reason="boom"`.
- **Expected evidence/behavior**: TC-COMP-041's edge case (`data-health-reader-tests.md` l.169)
  says "the `failed` fixture's reason begins `[unavailable] ` (or is null), a cause that stays
  retryable once CAP-003-E8-S6 excludes plan refusals". Coverage-matrix note 15 says the same.
- **Impact**: There is none today. After E8-S6, `cause_of("boom")` is `None`, and RD 2.4 v2's
  `_retryable` still treats `None` as retryable, so the test keeps passing. The fixture departs
  from the specification's pin, though, and does not use the reason format real rows carry.
- **Required remediation**: Use an `[unavailable] …` reason, or `None`, for the `failed` fixtures
  as TC-COMP-041 states. Alternatively, record the deviation.

### IR-006 — T005 step 4's "a further read with no change returns the identical page" is not asserted, and R4 is not isolated

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-9, DAC-E2-2, DAC-E2-S1-3
- **Tasks**: T005
- **Files**: `tests/integration/test_data_health_problems.py` l.189-210 and l.213-225
- **Claim challenged**: T005 step 4 and TC-COMP-041 step 4 ("Read again with no change").
- **Observed evidence**:
  - No test compares two consecutive reads of an unchanged store.
  - R4 (`cancelled`, no results) is seeded in the same commit as R3, so only their joint effect is
    read.
  - `test_reads_record_nothing` reads twice but asserts only the table snapshot, not the pages.
- **Expected evidence/behavior**: T005 says "a further read with no change returns the identical
  page … a run R4 … changes nothing", each step "followed by a re-read".
- **Impact**: The evidence for "nothing else removes a row" is indirect. The re-reads after steps
  1-3 expect unchanged symbols, and the snapshot shows nothing is written, so a read that dropped
  rows on repetition would still fail. Changes to failures or `retryable` on repetition are not
  observed.
- **Required remediation**: Assert that two consecutive reads with no change between them return
  equal `ProblemPage` values, and read once between R3 and R4. Alternatively, record the
  deviation.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T003 (justified).** `'{}'` is stripped before the "no `{`" assertion, because T012's
  `PROBLEM_COUNT_SQL` coalesces to the empty-array literal. The deviation is recorded in the
  cycle-2 TDD description, not in the plan. The behavioural cursor test still guards
  interpolation.
- **T010 (justified).** The assignment check uses `reason`, because the delivered
  `test_massive_retry.py` forbids `.attempts` under `tests/`. The added
  `test_models_module_declares_exactly_the_design_dataclasses` serves T010's purpose.
- **Extra test file (justified).** `tests/unit/test_data_health_models.py` is outside the story's
  file list. The plan's Other Notes justify it.
- **T005 (IR-006).** The table snapshot is a separate test function, which is justified. The
  unchanged-read comparison and R4's isolated read are missing.
- **T017 (IR-004).** Cycle 1 has its own commit, against T017. The header comment misattributes
  it.
- **Bookkeeping.** All 17 boxes are checked, and each has evidence. No unchecked task looks
  implemented. Story status `in-review` is consistent.
- **Out-of-scope changes.** None. There is no router registration, no `factorflow.api` import, no
  `pyproject.toml` change and no delivered file edit.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework).
- **Required action**: Rework with `CAP-003-E2-S1-tasks.md` and this report.
  - Kill the seven non-equivalent survivors named in IR-001, IR-002 and IR-003 with the story's
    focused suites. Record each new or changed test as a TDD-evidence cycle.
  - Address IR-004, and IR-005 and IR-006 where practical, or record them as deviations.
  - Then rerun `$adversarial-review`. This report's `reviewed_head` (`0e4f098`) and
    `-mutation.json` are the re-review's baseline.
- **Warnings accepted downstream**: N/A
