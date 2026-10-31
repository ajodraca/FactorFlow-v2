---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S2-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E3-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-31T00:56:48Z"
reviewed_head: "44755a69c64761a51dfa0d32a846c2d02d3c9c6b"
review_base: "b6b583838dfa172827b1f6e2b4f965a0a9dcd492"
reviewed_state_revision: "sha256:5afca73ce3aeaf27c6002779c3798fd3e60b5689094f481b0def56922e199c57"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E3-S2
    artifact_version: 1
    content_revision: sha256:09bd3091b4b75395cac38a8edb550d9d8d145099b6c12dd0d193ca63dae37c51
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-31T01:10:43Z
  source_artifacts:
    - id: CAP-002-E3-S2
      version: "1 (sha256:09bd3091b4b75395cac38a8edb550d9d8d145099b6c12dd0d193ca63dae37c51)"
    - id: CAP-002-E3-S2-tasks
      version: "1 (updated 2026-10-30, last_reworked_review v1)"
    - id: CAP-002-E3-S2-tdd-evidence
      version: "cycle-1, rework-1"
    - id: CAP-002-E3-S2-implementation-review
      version: "1 (baseline)"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E3-S2 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 16/16 satisfied |
| Planned tasks | 24/24 verified |
| Required validation | 9/9 passed |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1 · **total 2**

This is a re-review against the v1 baseline (`reviewed_head` `c5a2039`). All
six v1 findings are resolved, and the resolutions are backed by repository
evidence. The 11 non-equivalent v1 survivors are each killed by a test the
rework added. The forged out-of-range cursor key (v1 IR-005) is now refused with
`CursorError`. The production change is small: a range and scale check in
`_parse_cursor`. The review traced its behaviour at both edges and pinned it.

Every required validation command passes when rerun independently: 1838
passed and 1 xfailed across the two halves of the suite. The review regenerated
the mutation catalogue over the whole change set, scoped it against the
baseline, and added the coder's 10 rework mutants and 7 of its own: 279 mutants
in all. 252 were killed and 27 survived.

- Of the 27 survivors, 22 are equivalent: the 16 that v1 judged equivalent,
  plus 6 copies of them at line numbers shifted by the rework.
- The other 5 are non-equivalent, and the scope tool tags all 5 `late`. Each
  changes a production line that is unchanged since the baseline and that the
  baseline could have mutated just as well.
- All 16 `delta` mutants (the new key check) were killed.

The two findings are warnings:

- **IR-001 (MEDIUM, late).** The TC-COMP-112 clock test pins the Chicago date
  only at two CDT instants, and its fake clock resolves a naive `now()` in the
  host's zone. On this host, which is in Chicago, a host-local `datetime.now()`
  survives, and so does a fixed UTC−5 zone with no daylight saving.
- **IR-002 (LOW, late).** The missing-factor-row rule is pinned for the value
  join and one value bound only.

The story proceeds to Doc Sync.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S2.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S2-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S2` |
| HEAD | `44755a69c64761a51dfa0d32a846c2d02d3c9c6b` (three commits over the base: `c5a2039` story-coding, `a4608e7` review v1, `44755a6` story-coding rework) |
| Review base | `origin/main` = `b6b583838dfa172827b1f6e2b4f965a0a9dcd492`, resolved by `pipeline-state.py review-base --base-ref origin/main`; an ancestor of HEAD |
| Working tree | clean (no staged, unstaged or untracked files) before and after validation |
| Changed files reviewed | 29 since the base (24 added, 5 modified); 16 since the baseline `c5a2039` |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `c5a20392fc110ba4165795946b4a19a1fd79b6d7`, with `CAP-002-E3-S2-implementation-review-v1-mutation.json` |

### Changed Files

Files unchanged since the baseline keep v1's justification and were reread for
this review. The rows marked *(rework)* changed in `44755a6`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/reader.py` | modified *(rework: `_KEY_LIMITS`, `_KEY_QUANTUM`, `_parse_cursor` range and scale check)* | T017, T018, T020; DEC-0245, DEC-0246; v1 IR-005 |
| `src/factorflow/classification/sql/list_classifications.sql` | added | T019; DEC-0129, DEC-0245 |
| `src/factorflow/classification/sql/universe_exists.sql` | added | T019 |
| `tests/integration/reader_seed.py` | modified *(rework: `add_member` takes keyword-only `recorded_on`)* | T002 helpers; v1 IR-003. The default is the column's own default expression, and no existing call changes |
| `tests/integration/test_reader_list.py` | added *(rework: four tests added, one extended)* | T006 to T015; v1 IR-001, IR-002, IR-003, IR-004, IR-006 |
| `tests/unit/test_reader_cursor.py` | added *(rework: two parametrised tests)* | T004; v1 IR-005 |
| `tests/unit/test_reader_filters.py` | added | T005 |
| `tests/unit/test_reader_sort_allowlist.py` | added | T003, T016 |
| `tests/unit/test_reader_sql_read_only.py` | modified | T016 |
| `docs/.../stories/CAP-002-E3-S2-tasks.md` | modified *(rework: `updated`, `last_reworked_review`)* | task checkboxes (24 checked) and rework bookkeeping only |
| `docs/.../stories/CAP-002-E3-S2.md` | modified | frontmatter `status: planning` to `in-review` only; the content revision equals the approval's `reviewed_revision` |
| `docs/.../stories/CAP-002-E3-S2-tdd-evidence.yaml` | added *(rework: cycle `rework-1`)* | T024 |
| `docs/.../stories/CAP-002-E3-S2-evidence/` (15 files: 7 for `cycle-1`, 8 for `rework-1`) | added | T024 |
| `docs/.../stories/CAP-002-E3-S2-implementation-review-v1.md`, `-v1-mutation.json` | added | the baseline review (adversarial-review I.4, I.5) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `list_classifications.sql` `matched` selects the stored `score` and `percentile`; `reader.py:_row_to_cell` | `test_reader_list.py::test_cells_are_the_stored_rows` (75.5 not derivable) | Cross-wiring a factor's score, percentile or status is killed |
| AC-16 | SATISFIED | `reader.py:list_classifications`, `SORT_ALLOWLIST`, keyset fragments; `list_classifications.sql` | sort, keyset, threshold and universe tests in `test_reader_list.py` | The list half only; compare is CAP-002-E3-S3's, per the plan |
| AC-23 | SATISFIED | `matched` carries `{f}_restated_possible` per factor | `test_restated_value_and_growth_cells_carry_the_mark`, `test_value_and_growth_marks_are_each_their_own_cell` | v1 IR-001 resolved: both swap mutants are killed |
| DAC-E3-2 | SATISFIED | `evaluate_filter` calls `_run_list`, which runs the list statement itself | `test_evaluate_filter_equals_the_list` (5 cases), `test_symbol_prefix_narrows_the_scope` | One statement, one predicate |
| DAC-E3-3 | SATISFIED | twelve `IS DISTINCT FROM 'classified'` guards in `matched` | TC-COMP-096 tests; every factor's four bounds | Inclusive/exclusive, other-factor and other-metric mutants are all killed |
| DAC-E3-4 | SATISFIED | `COALESCE(c_f.reason_code = ANY(%(input_reasons)s), false)` x3 | `test_hide_incomplete_hides_only_input_reason_stocks` | A fully classified stock (NULL reasons) is kept, pinned per DEC-0129 |
| DAC-E3-5 | SATISFIED | `scope` CTE `scoped` / `lifecycle = 'active'` | `test_unscoped_list_is_active_only`, `test_universe_scope_keeps_retired_members` | The compare clause belongs to CAP-002-E3-S3 (DAC-E3-S3-4), as v1 recorded |
| DAC-E3-6 | SATISFIED | one-row `count(*)` over `matched` LEFT JOINed to the page | TC-COMP-120 tests | `count-over-page` is killed |
| DAC-E3-12 | SATISFIED | as AC-23 | as AC-23 | The list half of the mark |
| DAC-E3-S2-1 | SATISFIED | as DAC-E3-3 | `test_threshold_excludes_only_classified_stocks_failing_it` and 3 siblings | |
| DAC-E3-S2-2 | SATISFIED | as DAC-E3-4 | TC-COMP-108 test | |
| DAC-E3-S2-3 | SATISFIED | `scope` CTE; `_members_today` (`reader.py:497-506`) with the imported `MEMBERSHIP_AS_OF_SQL` at `datetime.now(_CHICAGO).date()` | TC-COMP-112 tests, including `test_universe_scope_replays_membership_at_today_in_chicago` (00:30 and 23:30 CDT) | v1 IR-003 resolved: zones behind and ahead of Chicago, and `date.today()`, are killed. IR-001 (MEDIUM, late) records the two remaining clock gaps |
| DAC-E3-S2-4 | SATISFIED | as DAC-E3-6 | `test_match_count_is_identical_on_every_page`, `test_filters_change_the_count_identically_on_every_page` | |
| DAC-E3-S2-5 | SATISFIED | `resolve_sort`; `encode_cursor` / `_parse_cursor` / `decode_cursor` with the DEC-0246 check; the range and scale check at `reader.py:416-422` | `test_reader_sort_allowlist.py`, `test_reader_cursor.py` (including `test_key_no_stored_value_can_equal_is_refused` and `test_key_at_the_edge_of_its_column_round_trips_at_its_scale`), integration cursor tests | v1 IR-005 resolved: a key at or beyond the column's magnitude, or finer than six places, raises `CursorError` |
| DAC-E3-S2-6 | SATISFIED | as AC-23 | as AC-23 | |
| DAC-E3-S2-7 | SATISFIED | no bound, `hide_incomplete` false and no prefix leave every guard true | `test_empty_thresholds_constrain_nothing`, `test_empty_thresholds_match_every_stock_in_scope` | v1 IR-006 resolved: the scope now includes the input-reason member `INC` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `universes/replay.py:32` `MEMBERSHIP_AS_OF_SQL`; migrations 0005/0006; `api/bounds.py`; `runs/queries.py:CursorError`; `test_engine_sql_safety.py` unedited and passing | Unchanged since v1 |
| T002 | complete | VERIFIED | `tests/integration/reader_seed.py` | `add_member` gains keyword-only `recorded_on` whose default, `(CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date`, is migration 0005's column default; no existing call changes |
| T003 | complete | VERIFIED | `tests/unit/test_reader_sort_allowlist.py` | Unchanged since v1 |
| T004 | complete | VERIFIED | `tests/unit/test_reader_cursor.py` | Plus 18 key-range cases (9 refused, 9 at the edge), with exponent −6 asserted |
| T005 | complete | VERIFIED | `tests/unit/test_reader_filters.py` | Unchanged since v1 |
| T006 | complete | VERIFIED | `test_reader_list.py:113-193` | |
| T007 | complete | VERIFIED | `test_reader_list.py:195` | |
| T008 | complete | VERIFIED | `test_reader_list.py:240`, `:261` | v1 IR-001 resolved by the value-only and growth-only stocks |
| T009 | complete | VERIFIED | `test_reader_list.py:311-417` | v1 IR-003 resolved. The remaining clock gaps are IR-001 (late) |
| T010 | complete | VERIFIED | `test_reader_list.py:447-509` | |
| T011 | complete | VERIFIED | `test_reader_list.py:511` | v1 IR-006 resolved; the counts went from 3 to 4 consistently, and `evaluate_filter` includes `INC` |
| T012 | complete | VERIFIED | `test_reader_list.py:546-628` | |
| T013 | complete | VERIFIED | `test_reader_list.py:631-724` | |
| T014 | complete | VERIFIED | `test_reader_list.py:726-803`, `:821` | v1 IR-002 resolved by `test_value_and_growth_input_reason_cells_carry_their_own_input_and_detail` (inputs `book_to_price` and `revenue_growth` differ) |
| T015 | complete | VERIFIED | `test_reader_list.py:873-920` | |
| T016 | complete | VERIFIED | `test_reader_sql_read_only.py`; `test_list_statement_placeholders_are_the_documented_ones` | |
| T017 | complete | VERIFIED | `reader.py:98-123, 240-334` | `StockRow.name` is `str | None` (DEC-0245, PROVISIONAL), as v1 recorded |
| T018 | complete | VERIFIED | `reader.py:336-422` | The `chk` field (DEC-0246). The new range and scale check implements T018's "validates every field's type and raises `CursorError` for any failure" for a key no column value can equal. The key is returned quantised to six places, so the bound parameter always has the column's scale |
| T019 | complete | VERIFIED | `sql/list_classifications.sql`, `sql/universe_exists.sql` | Unchanged since v1; `LEFT JOIN (...) ON true` plus an outer `ORDER BY`, equivalent (see `manual:outer-order-dropped`) |
| T020 | complete | VERIFIED | `reader.py:425-590` | Unchanged since v1. The Chicago `today` and Open Gap 7 rules are pinned; IR-001 and IR-002 record late gaps |
| T021 | complete | VERIFIED | `test_package_data_ships_sql.py` passes; the built wheel lists both SQL files | |
| T022 | complete | VERIFIED | the three greps rerun, results as stated | |
| T023 | complete | VERIFIED | the validation set rerun green; DAC and TC citations present | The four new integration tests and two new unit tests carry `# Implements` markers or docstrings naming their DAC or plan gap |
| T024 | complete | VERIFIED | `CAP-002-E3-S2-tdd-evidence.yaml` cycles `cycle-1` and `rework-1` (`commit_hash: stage`); the lint is clean with `--require-logs` | The rework cycle's mutation evidence is honest (75 killed, 2 survivors judged equivalent, both as in v1) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-096 (5 tests) | ADEQUATE | Every one of the twelve bounds at its boundary value, on its own factor and metric; incomplete and unranked stocks kept and counted; intersection; `hide_incomplete` | none |
| TC-COMP-108 | ADEQUATE | Each input reason on a different factor; NULL reasons; `not_enough_stocks`; `retired` through a universe; mixed reasons; counts | none |
| TC-COMP-112 (6 tests, one parametrised at 00:30 and 23:30 CDT) | ADEQUATE | Active only when unscoped; retired kept when scoped; removed and rowless members absent; unknown universe raises; retired universe is still a scope; the replay date is Chicago's at both edges of a Chicago day, with one member on that date and one on the next; `rv-today-zone-behind-chicago`, `rv-today-host-date`, the UTC and New York zones and an America/Denver zone are all killed | IR-001 (late): a host-local `datetime.now()` survives on a Chicago host, and a DST-unaware UTC−5 zone survives. A late survivor does not make the test WEAK |
| TC-COMP-120 (4 tests) | ADEQUATE | 50/50/20 pages at 120; a full last page; filters change the count on every page; no-match and past-the-end pages carry the count | none |
| TC-COMP-121 (`test_reader_sort_allowlist.py`, `test_reader_cursor.py`) | ADEQUATE | Allowlist; refusal before SQL; round trips; every field check; the exhaustive flip test; binding. Now also the key range at exactly 10^12 and 10^3 refused, 999999999999.999999 and 999.999999 accepted, a seventh decimal place refused, and `0E±200000` normalised to exponent −6 | none: all 16 delta mutants killed, including the review's `rv2-key-limit-inclusive` |
| TC-COMP-122 (unit and integration) | ADEQUATE | Empty model; unscoped and scoped counts with an input-reason (`INC`), unranked (`ACT`) and retired (`OLD`) member; `evaluate_filter` agrees | none |
| TC-COMP-189 (2 tests) | ADEQUATE | Value and growth both marked; momentum only; unmarked; value only; growth only | none |
| T012 `evaluate_filter` tests | ADEQUATE | Five threshold shapes, unpaginated equality, prefix, the named set | none |
| T013 sort and keyset tests | ADEQUATE | Nulls last both ways, symbol ties, page boundaries at every block edge, unpaged equals paged | none |
| T014 cell-shape tests | ADEQUATE | Classified and unranked cells as stored; momentum, value and growth input-reason cells each carry their own `reason_input` and `reason_detail`; latest reference name or None | none |
| T015 page-block tests | ADEQUATE | `set` and `later` equal `read_set_blocks`; never classified, with and without a building set; only `CURRENT_SET_SQL` runs | none |
| T016 guards | ADEQUATE | One read-only statement each; only the three documented slots | none |
| Open Gap 7 (`test_a_missing_factor_row_is_a_data_integrity_error`, with no bound and with a bound on value) | ADEQUATE | A stock with growth and momentum rows and no value row raises `ValueError` naming the instrument and factor; `rv-missing-row-accepted`, `rv-threshold-guard-not-equal` and `rv-value-join-inner` are killed | IR-002 (late, LOW): the growth and momentum joins, and the other value guards, are not exercised |

The new tests were reviewed as code:

- They assert observable results: exact symbol lists, counts, cell tuples and
  the error message.
- They seed through the shared helpers and bound parameters, and they patch
  only the reader's clock.
- The clock fake keeps the tz-aware path intact, because `fromtimestamp(ts, tz)`
  is used.
- The `recorded_on` values are explicit, so the result does not depend on the
  day the suite runs. The `date.today()` mutant is killed on any date after
  2026-10-16.

**Mutation run (E.9).** `mutation-run.py generate` over `b6b5838..44755a6`
produced 125 catalogue mutants. The review added 7 of its own (`manual:rv2-*`)
and the coder's 10 rework mutants (`manual:rework-1:*`). `scope --since c5a2039
--previous ...-v1-mutation.json` then added the baseline's mutants, for 279 in
all: 174 `carried`, 16 `delta` and 89 `late`. They were run in six parallel
clones with the story's five focused suites. The results were **252 killed, 27
survived, 0 stillborn, 0 timeout**. The results are in
`CAP-002-E3-S2-implementation-review-v2-mutation.json` (sha256
`61a549012afff837bcb5b474a3f708ae46b92623edf497f2642de02642314657`).

- `carried`: 158 killed, 16 survived. The 16 survivors are exactly the
  mutants that v1 judged equivalent, for the reasons it gave:
  - `reader.py:275:off-by-one:1`: `split` with a limit of 2 or 1 gives the
    same prefix.
  - `reader.py:524`, `reader.py:525`: with no cursor, `k` and `ksym` are not
    named.
  - `reader.py:543`: the count row always overwrites the initial
    `match_count`.
  - `reader.py:548` x2: `strict` cannot fire, because `names` and `row` come
    from one result.
  - SQL comment digits: `list_classifications.sql:1,4,5,8,9` and
    `universe_exists.sql:2`.
  - `EXISTS` ignores its select list: `list_classifications.sql:23` and
    `universe_exists.sql:3`.
  - `manual:outer-order-dropped`.
  - `manual:rv-name-tiebreak-asc`: DEC-0245 leaves open which of two
    simultaneous names wins.

  All 11 of v1's non-equivalent survivors are now killed.
- `delta`: 16 killed, 0 survived. These cover the key limits, the quantum, the
  `abs`, the inclusive limit, the range and scale checks, and the quantised
  return.
- `late`: 78 killed, 11 survived. Six of the 11 are the equivalents above,
  generated again at their new line numbers:
  - `reader.py:280:off-by-one:1`
  - `reader.py:535`, `reader.py:536`
  - `reader.py:554`
  - `reader.py:559` x2

  The other five are **not equivalent**:
  - IR-001: `manual:rv2-today-host-local-now` and
    `manual:rv2-today-zone-fixed-utc-minus-5`.
  - IR-002: `manual:rv2-growth-join-inner`, `manual:rv2-momentum-join-inner`
    and `manual:rv2-value-pmin-guard-not-equal`.

  Each changes a line unchanged since `c5a2039`, so each is a late warning.
  None makes its test WEAK.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/.../CAP-002-E3-S2.md --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | PASS | `b6b583838dfa172827b1f6e2b4f965a0a9dcd492`, the merge base and an ancestor of HEAD |
| `python3 scripts/check-tdd-evidence.py --evidence .../CAP-002-E3-S2-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base b6b5838... --decisions-dir projects/factorflow-v2/decisions --require-logs` (sandboxed) | harness root | 1 | NOT RUN (environment) | `reviewed_patch does not apply ...: error: unable to create temporary file: Operation not permitted`, a sandbox refusal, so the same plain call was rerun outside the sandbox |
| same command, absolute paths, outside the sandbox | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest tests/unit/test_reader_sort_allowlist.py tests/unit/test_reader_cursor.py tests/unit/test_reader_filters.py tests/unit/test_reader_sql_read_only.py tests/integration/test_reader_list.py tests/unit/test_engine_sql_safety.py tests/unit/test_package_data_ships_sql.py tests/unit/test_classification_sql_ships.py -q -p no:randomly` | component | 0 | PASS | `245 passed in 13.67s` (the story-specific checks and the package guard) |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest -m postgres -q` | component | 0 | PASS | `625 passed, 1214 deselected, 2 warnings in 233.03s` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest -m "not postgres" -q` (sandboxed) | component | 2 | NOT RUN (environment) | `Failed to initialize cache at ~/.cache/uv ... Operation not permitted`, a sandbox refusal (the same for the sandboxed `ruff check`, `ruff format --check` and `mypy` calls); each was rerun outside the sandbox as a plain call |
| same command, outside the sandbox | component | 0 | PASS | `1213 passed, 625 deselected, 1 xfailed, 2 warnings in 26.01s`. The two halves partition the full `uv run pytest` set: 1838 passed and 1 xfailed, equal to the coder's `full-suite-rework-1.log` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline ruff check .` | component | 0 | PASS | `All checks passed!` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline ruff format --check .` | component | 0 | PASS | `247 files already formatted` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline mypy src` | component | 0 | PASS | `Success: no issues found in 57 source files` |
| `uv build --directory repos/factorflow-v2/FactorFlow-v2 --offline --out-dir <scratchpad>/dist` | component | 0 | PASS | sdist and wheel built; the wheel lists `factorflow/classification/sql/list_classifications.sql` and `universe_exists.sql` (T021, DEC-0088) |
| T022 greps (`api.classification_bounds\|universes.service` in `reader.py`; `MEMBERSHIP_AS_OF_SQL\|membership_as_of` and `hide_incomplete` under `classification/`) | component | 1 / 0 / 0 | PASS | No forbidden import. `MEMBERSHIP_AS_OF_SQL` is imported at `reader.py:58` and executed at `:505`, with no restated replay. `hide_incomplete` appears in `list_classifications.sql` only |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range b6b5838...44755a6 --cycle review --out <scratchpad>/mut/generated.json` | harness root | 0 | PASS | 125 mutants. The review's 7 and the coder's 10 hand-written mutants were then appended |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratchpad>/mut/mutants-pre-scope.json --since c5a20392fc110ba4165795946b4a19a1fd79b6d7 --previous .../CAP-002-E3-S2-implementation-review-v1-mutation.json --out <scratchpad>/mut/mutants.json` | harness root | 0 | PASS | `279 mutant(s) {"carried": 174, "delta": 16, "late": 89}`. Five previous line-numbered mutants no longer apply at their old lines; their mutations are regenerated at the shifted lines |
| `python3 scripts/mutation-run.py run --repo-dir .../FactorFlow-v2 --mutants <scratchpad>/mut/mutants.json --jobs 6 --command 'uv run --offline --all-extras pytest -x -q -p no:cacheprovider -p no:randomly <the five story suites>' --out <scratchpad>/mut/results.json` (outside the sandbox) | harness root | 3 | evidence | Six green baselines; `{"killed": 252, "survived": 27}`. Exit 3 reports the survivors, which are judged above |
| Probe `<scratchpad>/tzprobe.py` (`python3 -I`): the test's fake clock under host `TZ` America/Chicago, UTC and America/Los_Angeles | scratchpad | 0 | evidence | Through the fake at 23:30 CDT, host-local `now().date()` is 2026-10-15 on a Chicago host and 2026-10-16 on a UTC host. At 23:30 CST on 15 January 2027, Chicago's date is 2027-01-15 and Bogota's is 2027-01-16 (IR-001) |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before and after) | harness root | 0 | PASS | `sha256:5afca73ce3aeaf27c6002779c3798fd3e60b5689094f481b0def56922e199c57` both times |

Excluded, with reasons:

- `npm ci`, `npm run build|test|test:e2e|lint|format` and `npx tsc --noEmit`
  (tech stack) were not run. The change set touches no frontend file, and
  neither the story nor the plan names a frontend command.
- `uv sync --all-extras` was not run. `pyproject.toml` and `uv.lock` are
  unchanged by the story, and every `uv run` above resolved the locked
  environment.

### Validation Side Effects

- Before: HEAD `44755a69c64761a51dfa0d32a846c2d02d3c9c6b`, working tree clean, fingerprint `sha256:5afca73c…9c57`.
- After: HEAD unchanged, working tree clean, fingerprint unchanged. `uv build`
  refreshed the ignored `src/factorflow.egg-info/` and `build/`. Mutation
  clones, logs, the probe and the built distribution live in the scratchpad.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | MEDIUM | late | OPEN | The Chicago-date test checks two CDT instants only, through a fake clock whose naive `now()` is host-local; a host-local `datetime.now()` and a DST-unaware UTC−5 zone survive |
| IR-002 | LOW | late | OPEN | The missing-factor-row rule is pinned for the value join and one value bound only; three per-factor variants survive |

### IR-001 — The Chicago-date test leaves a host-local clock and a fixed UTC−5 zone unpinned

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-3, DAC-E3-5 (universe-scope membership as DEC-0128 and DEC-0065 define it)
- **Tasks**: T009 (TC-COMP-112), T020
- **Files**:
  - `src/factorflow/classification/reader.py:116` `_CHICAGO` and `:504` `today = datetime.now(_CHICAGO).date()`; both lines are unchanged since `c5a2039`.
  - `tests/integration/test_reader_list.py:376-418`: `_clock_fixed_at` and `test_universe_scope_replays_membership_at_today_in_chicago`.
- **Claim challenged**: the rework's test pins "the membership as of today in
  America/Chicago" against a zone behind or ahead of Chicago and against "the
  host's later date" (its docstring).
- **Observed evidence**: two non-equivalent mutants survive on this host
  (`/etc/localtime` is America/Chicago):
  - `manual:rv2-today-host-local-now` (`datetime.now().date()`). The fake's
    `now(tz=None)` returns `fromtimestamp(ts, None)`, which is the host's local
    time, so on a Chicago host the mutant computes the Chicago date. The probe
    shows that on a UTC host the same mutant gives 2026-10-16 at 23:30 CDT,
    and the test would kill it there. CI (`ubuntu-latest`) is such a host, so
    whether the regression is caught depends on the machine running the suite.
  - `manual:rv2-today-zone-fixed-utc-minus-5` (`ZoneInfo("America/Bogota")`,
    UTC−5 with no daylight saving). It equals Chicago at both CDT instants. The
    probe shows it is a day ahead at 23:30 CST in January.

  `date.today()` is killed, but only because it bypasses the fake and reads the
  real calendar.
- **Expected evidence/behavior**: DEC-0128 (owner-upheld) and DEC-0065 set
  `as_of` to today in America/Chicago, on every host and in either half of the
  year. T020 specifies `datetime.now(ZoneInfo("America/Chicago")).date()`.
- **Impact**: a regression to a host-local clock passes the suite on the
  owner's Chicago machine and is caught only where the suite runs in another
  zone. A regression to a fixed UTC−5 offset passes everywhere. It would then
  list a member added after 23:00 CST a day early from November to March. The
  code as built is correct. Both mutants change lines the baseline could have
  mutated just as well, which is why this finding is late and MEDIUM.
- **Required remediation**: make the fake clock independent of the host zone.
  For example, `now(None)` could return the instant in a zone other than
  Chicago, or the test could fix the process zone. Then add a winter (CST)
  instant, so that both survivors are killed.

### IR-002 — The missing-factor-row rule is pinned for the value join and one value bound only

- **Severity**: LOW
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: N/A (a data-integrity rule; no story AC addresses a stock with fewer than three factor rows)
- **Tasks**: T019, T020 (task plan Open Gap 7; Resolved Conflicts, the threshold guard)
- **Files**: `src/factorflow/classification/sql/list_classifications.sql:45-50` (the growth and momentum `LEFT JOIN`s) and `:51-78` (the twelve guards); `tests/integration/test_reader_list.py:796-818`
- **Claim challenged**: a stock missing any of its three factor rows raises
  `ValueError` rather than being dropped, whichever row is missing and
  whichever bound is set.
- **Observed evidence**: the rework's test removes the value row only and binds
  only `value_score_min`. Three mutants survive, and each would silently drop a
  stock that is missing a row instead of raising:
  - `manual:rv2-growth-join-inner` (`JOIN ... c_growth`)
  - `manual:rv2-momentum-join-inner` (`JOIN ... c_momentum`)
  - `manual:rv2-value-pmin-guard-not-equal` (`c_value.status <> 'classified'`
    on `value_percentile_min`)

  The mapper's own check is factor-generic and is pinned. The three v1 mutants
  are killed.
- **Expected evidence/behavior**: the plan's Open Gap 7 and its Resolved
  Conflicts on `IS DISTINCT FROM` (DEC-0129) apply to every factor and every
  bound.
- **Impact**: the engine writes three rows per stock, so this state arises only
  from a defect elsewhere. An asymmetric edit to one of the three joins, or to
  one of the twelve guards, would then hide that defect. v1 IR-004 was
  resolved as its remediation specified, and these variants are late.
- **Required remediation**: parametrise the missing-row test over the missing
  factor, with a bound on each of that factor's metrics, so that all three
  survivors are killed.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | `test_value_and_growth_marks_are_each_their_own_cell` (`test_reader_list.py:261`) seeds a value-only and a growth-only restatement and asserts `[True, False, False]` and `[False, True, False]`; `rv-growth-restated-from-value` and `rv-value-restated-from-growth` are killed (carried) |
| v1/IR-002 (HIGH) | RESOLVED | `test_value_and_growth_input_reason_cells_carry_their_own_input_and_detail` (`:773`) asserts code, input and detail for `book_to_price` on value and `revenue_growth` on growth; all four `rv-*-reason-*` mutants are killed (carried) |
| v1/IR-003 (HIGH) | RESOLVED | `test_universe_scope_replays_membership_at_today_in_chicago` (`:400`, at 00:30 and 23:30 CDT) kills `rv-today-zone-behind-chicago`, `rv-today-host-date`, the UTC and New York zones and the review's America/Denver zone. The two clock gaps that remain are new late mutants (IR-001), not this finding's survivors |
| v1/IR-004 (MEDIUM) | RESOLVED | `test_a_missing_factor_row_is_a_data_integrity_error` (`:805`, with no bound and with a bound on value) kills `rv-missing-row-accepted`, `rv-threshold-guard-not-equal` and `rv-value-join-inner` (carried). Per-factor variants are IR-002 (late) |
| v1/IR-005 (LOW) | RESOLVED | `reader.py:416-422` refuses a key with `abs(key) >= 10^12` (score) or `>= 10^3` (percentile), or one finer than six places, with `CursorError`. It returns the key at exponent −6. `test_key_no_stored_value_can_equal_is_refused` covers 9 cases, including `1E+200000`, and `test_key_at_the_edge_of_its_column_round_trips_at_its_scale` covers 9. Since `list_classifications` calls `_parse_cursor` before reading the set, a forged key no longer reaches PostgreSQL |
| v1/IR-006 (LOW) | RESOLVED | `test_empty_thresholds_match_every_stock_in_scope` (`:511`) seeds the input-reason member `INC` in the universe; the scoped symbols are `{ACT, INC, OLD, OUT}` and `evaluate_filter` includes it |

## Scope and Plan Deviations

- **The rework's production change** is confined to `_parse_cursor` and two
  module constants. It is authorised by v1 IR-005 and T018. The scale check and
  the quantised return go one step beyond IR-005's wording. They refuse only
  keys no `numeric(·,6)` column can equal, and they change only the exponent of
  a key that a column can equal. Cursors the reader issues carry stored values
  and are unaffected (the T004 round trips pass).
- **The rework's reviewed patch differs from the commit in one lifecycle line.**
  `rework-1.patch` flips the story's `status` from `in-review` to
  `in-progress`, but the committed story still reads `in-review`. The story's
  content revision equals the approval's `reviewed_revision`, and the TDD lint
  is clean. This is not a finding.
- **DEC-0245 (PROVISIONAL)** and **DEC-0246** are unchanged since v1, and both
  remain `owner_reviewed: false`. The rework records no new decision, and its
  commit cites none.
- The deviations that v1 recorded are unchanged: T019's `LEFT JOIN ... ON true`,
  the `reader_seed.py` helpers, and the compare clause of DAC-E3-5 belonging to
  CAP-002-E3-S3.
- **Bookkeeping.** All 24 tasks are checked and verified. The plan records
  `last_reworked_review: CAP-002-E3-S2-implementation-review-v1.md`.
- No unjustified file, dependency or behaviour change was found.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync` for CAP-002-E3-S2).
- **Required action**: synchronise the component documentation with the
  implemented list read, the cursor and its key check, and `evaluate_filter`.
  IR-001 and IR-002 may be taken up in a later rework or a follow-up change. If
  the story is reviewed again, this report is its baseline: `reviewed_head`
  `44755a69c64761a51dfa0d32a846c2d02d3c9c6b` and
  `CAP-002-E3-S2-implementation-review-v2-mutation.json` for
  `scope --previous`.
- **Warnings accepted downstream**: IR-001, IR-002.
- **Owner attention (not gating this review)**: DEC-0245 (PROVISIONAL) and
  DEC-0246 are open, with `owner_reviewed: false`.
