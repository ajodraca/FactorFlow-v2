---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E3-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-31T00:01:27Z"
reviewed_head: "c5a20392fc110ba4165795946b4a19a1fd79b6d7"
review_base: "b6b583838dfa172827b1f6e2b4f965a0a9dcd492"
reviewed_state_revision: "sha256:3bde69f4079c2adcc583285c3520553483cfc1027375525de4fa66936a671bf1"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-10-31T00:01:27Z
  source_artifacts:
    - id: CAP-002-E3-S2
      version: "1 (sha256:09bd3091b4b75395cac38a8edb550d9d8d145099b6c12dd0d193ca63dae37c51)"
    - id: CAP-002-E3-S2-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E3-S2-tdd-evidence
      version: "cycle-1"
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

# Implementation Review: CAP-002-E3-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 13/16 satisfied |
| Planned tasks | 21/24 verified |
| Required validation | 9/9 passed |

**By severity:** CRITICAL 0 · HIGH 3 · MEDIUM 1 · LOW 2 · **total 6**

The production code is correct on every path traced, and every required
validation command passes when rerun independently. The tests do not pin
everything the contract specifies. The review regenerated the mutant catalogue
over the whole change set, re-ran the coder's 35 hand-written mutants and added
25 of its own: 179 in all. 152 were killed and 27 survived. 16 of the 27 are
equivalent: the coder's 15 and one of the review's own. The other 11 change
behaviour that the story, the plan or the owner-upheld decisions specify:

- **Restatement mark (IR-001, HIGH).** The value and growth `restated_possible`
  columns can be swapped without any test failing. This makes TC-COMP-189
  (DAC-E3-S2-6) WEAK.
- **Input-reason columns (IR-002, HIGH).** `reason_input` and `reason_detail`
  for value and growth are never asserted, so T014's cell-shape test is
  PARTIAL.
- **Universe "today" (IR-003, HIGH).** The America/Chicago date that the
  universe scope replays membership at (DEC-0128, DEC-0065) is pinned by no
  test. This makes TC-COMP-112 WEAK.
- **Missing factor row (IR-004, MEDIUM).** The plan's data-integrity rule for a
  missing factor row is untested.

Two LOW findings record a forged-cursor edge case and a docstring that
overstates its fixture. The story returns to coding.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S2.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S2-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S2` |
| HEAD | `c5a20392fc110ba4165795946b4a19a1fd79b6d7` (one commit over the base: `feat(classification): CAP-002-E3-S2 story-coding - classification list and evaluate_filter`) |
| Review base | `origin/main` = `b6b583838dfa172827b1f6e2b4f965a0a9dcd492`, resolved by `pipeline-state.py review-base --base-ref origin/main`; an ancestor of HEAD |
| Working tree | clean (no staged, unstaged or untracked files) before and after validation |
| Changed files reviewed | 19 |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/reader.py` | modified | T017, T018, T020; DEC-0245, DEC-0246 |
| `src/factorflow/classification/sql/list_classifications.sql` | added | T019; DEC-0129, DEC-0245 |
| `src/factorflow/classification/sql/universe_exists.sql` | added | T019 |
| `tests/integration/reader_seed.py` | modified | T002, plus `insert_reference`, `add_member` and `remove_member` and a `name` argument (DEC-0245; T009's removed member) |
| `tests/integration/test_reader_list.py` | added | T006 to T015 |
| `tests/unit/test_reader_cursor.py` | added | T004 |
| `tests/unit/test_reader_filters.py` | added | T005 |
| `tests/unit/test_reader_sort_allowlist.py` | added | T003, T016 |
| `tests/unit/test_reader_sql_read_only.py` | modified | T016 |
| `docs/.../stories/CAP-002-E3-S2-tasks.md` | modified | task checkboxes only (24 `[ ]` to `[x]`) |
| `docs/.../stories/CAP-002-E3-S2.md` | modified | frontmatter `status: planning` to `in-review` only; content revision unchanged (equals the approval's `reviewed_revision`) |
| `docs/.../stories/CAP-002-E3-S2-tdd-evidence.yaml` | added | T024 |
| `docs/.../stories/CAP-002-E3-S2-evidence/` (7 files: `cycle-1.patch`, `red-cycle-1.log`, `green-cycle-1.log`, `code-review-cycle-1.txt`, `spec-drift-cycle-1.txt`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`) | added | T024 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `list_classifications.sql` `matched` selects stored `score`, `percentile`; `reader.py:_row_to_cell` | `test_reader_list.py::test_cells_are_the_stored_rows` (75.5 not derivable) | Cross-wiring a factor's score, percentile or status is killed |
| AC-16 | SATISFIED | `reader.py:list_classifications`, `SORT_ALLOWLIST`, keyset fragments; `list_classifications.sql` | sort, keyset, threshold and universe tests in `test_reader_list.py` | The list half only; compare (side by side) is CAP-002-E3-S3's, per the plan |
| AC-23 | PARTIAL | `matched` carries `{f}_restated_possible` per factor | `test_restated_value_and_growth_cells_carry_the_mark` | IR-001: value and growth marks are interchangeable under every test |
| DAC-E3-2 | SATISFIED | `evaluate_filter` calls `_run_list`, the list statement itself | `test_evaluate_filter_equals_the_list` (5 cases), `test_symbol_prefix_narrows_the_scope` | One statement, one predicate |
| DAC-E3-3 | SATISFIED | twelve `IS DISTINCT FROM 'classified'` guards in `matched` | TC-COMP-096 tests, every factor's four bounds | The inclusive and exclusive mutants and the other-factor and other-metric mutants are all killed |
| DAC-E3-4 | SATISFIED | `COALESCE(c_f.reason_code = ANY(%(input_reasons)s), false)` x3 | `test_hide_incomplete_hides_only_input_reason_stocks` | Fully classified stock (NULL reasons) kept: DEC-0129 pinned |
| DAC-E3-5 | SATISFIED | `scope` CTE `scoped`/`lifecycle = 'active'` | `test_unscoped_list_is_active_only`, `test_universe_scope_keeps_retired_members` | The compare clause is CAP-002-E3-S3's (DAC-E3-S3-4, TC-COMP-113); see Scope and Plan Deviations |
| DAC-E3-6 | SATISFIED | one-row `count(*)` over `matched` LEFT JOINed to the page | TC-COMP-120 tests (pages, filters, empty and past-the-end pages) | `count-over-page` and `count-over-scope` are killed |
| DAC-E3-12 | PARTIAL | as AC-23 | as AC-23 | IR-001 (the list half of the mark) |
| DAC-E3-S2-1 | SATISFIED | as DAC-E3-3 | `test_threshold_excludes_only_classified_stocks_failing_it` and 3 siblings | |
| DAC-E3-S2-2 | SATISFIED | as DAC-E3-4 | TC-COMP-108 test | |
| DAC-E3-S2-3 | SATISFIED | `scope` CTE; `_members_today` with the imported `MEMBERSHIP_AS_OF_SQL` | TC-COMP-112 tests | Active versus retired is pinned. The America/Chicago `today` of the replay is not; see IR-003 |
| DAC-E3-S2-4 | SATISFIED | as DAC-E3-6 | `test_match_count_is_identical_on_every_page`, `test_filters_change_the_count_identically_on_every_page` | |
| DAC-E3-S2-5 | SATISFIED | `resolve_sort`; `encode_cursor`/`_parse_cursor`/`decode_cursor` with the DEC-0246 check | `test_reader_sort_allowlist.py`, `test_reader_cursor.py`, integration cursor tests | IR-005 (LOW): a forged out-of-range numeric key reaches the database |
| DAC-E3-S2-6 | PARTIAL | as AC-23 | as AC-23 | IR-001 |
| DAC-E3-S2-7 | SATISFIED | no bound, `hide_incomplete` false and no prefix leave every guard true | `test_empty_thresholds_constrain_nothing`, `test_empty_thresholds_match_every_stock_in_scope` | IR-006 (LOW) on the docstring |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `universes/replay.py:32` `MEMBERSHIP_AS_OF_SQL`; `universes/__init__.py` imports nothing; migrations 0005/0006; `api/bounds.py`; `runs/queries.py:CursorError`; `test_engine_sql_safety.py` unedited and passing | The expected constant name was used |
| T002 | complete | VERIFIED | `tests/integration/reader_seed.py` new helpers | Adds `insert_reference`, `add_member`, `remove_member` and a `name` argument beyond the plan's list. They are justified by DEC-0245 and T009's removed-member case. No existing signature changed |
| T003 | complete | VERIFIED | `tests/unit/test_reader_sort_allowlist.py` | Seven keys, refused values (plus `1`), no statement for a bypassed sort, and every sort and order checked against the template |
| T004 | complete | VERIFIED | `tests/unit/test_reader_cursor.py` | Round trips, URL safety, the version, 20 malformed or altered cases, an exhaustive single-character flip test and the set/sort/order binding |
| T005 | complete | VERIFIED | `tests/unit/test_reader_filters.py` | Every bound, prefix, limit and order rule in the plan, `escape_like`, and the subprocess import guard |
| T006 | complete | VERIFIED | `test_reader_list.py:111-186` | |
| T007 | complete | VERIFIED | `test_reader_list.py:193` | Includes the NULL-reason stock (DEC-0129) and the mixed input/unranked stock |
| T008 | complete | PARTIAL | `test_reader_list.py:238` | IR-001: the plan's seed (value and growth both marked) cannot tell the two marks apart; two mutants survive |
| T009 | complete | PARTIAL | `test_reader_list.py:261-352` | IR-003: the replay's America/Chicago `today` is unpinned; two mutants survive. Every other T009 clause is pinned |
| T010 | complete | VERIFIED | `test_reader_list.py:358-438` | |
| T011 | complete | VERIFIED | `test_reader_list.py:445` | IR-006 (LOW): its fixture has no incomplete stock. The behaviour is pinned by the TC-COMP-108 test's default scoped read |
| T012 | complete | VERIFIED | `test_reader_list.py:468-544` | |
| T013 | complete | VERIFIED | `test_reader_list.py:550-652` | Boundaries fall inside the unclassified block, between blocks and inside runs of ties; all eight keyset mutants are killed |
| T014 | complete | PARTIAL | `test_reader_list.py:658-720` | IR-002: input-reason `reason_input`/`reason_detail` are asserted for momentum only; four cross-wiring mutants survive |
| T015 | complete | VERIFIED | `test_reader_list.py:726-804` | A statement-counting wrapper proves no list statement runs when nothing is classified |
| T016 | complete | VERIFIED | `test_reader_sql_read_only.py` parametrisation; `test_list_statement_placeholders_are_the_documented_ones` | |
| T017 | complete | VERIFIED | `reader.py:98-143, 235-329` | `StockRow.name` is `str | None`, against design 2.3's `str` (DEC-0245, PROVISIONAL) |
| T018 | complete | VERIFIED | `reader.py:331-411` | Adds a `chk` field beyond the plan's field list (DEC-0246) |
| T019 | complete | VERIFIED | `sql/list_classifications.sql`, `sql/universe_exists.sql` | It uses a plain `LEFT JOIN (...) m ON true` plus an outer `ORDER BY` where the plan wrote `LEFT JOIN LATERAL` without one; the behaviour is identical (see the mutation results). The name join is DEC-0245's |
| T020 | complete | VERIFIED | `reader.py:414-579` | The code matches the plan. IR-003 and IR-004 are test gaps on its rules, not code defects |
| T021 | complete | VERIFIED | `test_package_data_ships_sql.py` passes; the built wheel lists both new SQL files | |
| T022 | complete | VERIFIED | the three greps rerun, results as stated | |
| T023 | complete | VERIFIED | the validation set rerun green; DAC and TC citations present in the docstrings and `# Implements` comments | |
| T024 | complete | VERIFIED | `CAP-002-E3-S2-tdd-evidence.yaml` (one cycle, `commit_hash: stage`); lint clean | The coder's mutation evidence is honest but incomplete; see Test Quality |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-096 (`test_threshold_excludes_only_classified_stocks_failing_it`, `test_upper_bound_and_score_bound_are_inclusive`, `test_every_factor_bound_applies_to_its_own_factor`, `test_bounds_on_two_factors_intersect`, `test_hide_incomplete_with_a_threshold`) | ADEQUATE | Every one of the twelve bounds at its boundary value, on its own factor and metric; incomplete and unranked stocks are kept and counted; intersection; `hide_incomplete` | none |
| TC-COMP-108 (`test_hide_incomplete_hides_only_input_reason_stocks`) | ADEQUATE | Each input reason on a different factor; NULL reasons; `not_enough_stocks`; `retired` through a universe; mixed reasons; counts | none |
| TC-COMP-112 (`test_unscoped_list_is_active_only`, `test_universe_scope_keeps_retired_members`, `test_unknown_universe_raises`, `test_retired_universe_is_still_a_scope`, `test_universe_with_no_members_in_the_set_is_an_empty_page`) | WEAK | Active only unscoped; retired kept scoped with `retired` on every factor; a removed member and a rowless member absent; an unknown universe raises with its id; a retired universe is a scope; AC-8 equality | IR-003: no test controls the reader's clock, so `ZoneInfo("America/Los_Angeles")` and `date.today()` both survive |
| TC-COMP-120 (`test_match_count_is_identical_on_every_page` and 3 siblings) | ADEQUATE | 50/50/20 pages at 120; a full last page; filters change the count on every page; no-match and past-the-end pages carry the count | none |
| TC-COMP-121 (`test_reader_sort_allowlist.py`, `test_reader_cursor.py`) | ADEQUATE | The allowlist, refusal before SQL, only allowlisted text in the statement, round trips, every field check, an exhaustive flip test, binding | IR-005 (LOW) is a code edge case, not a test gap |
| TC-COMP-122 (`test_empty_thresholds_constrain_nothing`, `test_empty_thresholds_match_every_stock_in_scope`) | ADEQUATE | Empty model; unscoped and scoped counts; `evaluate_filter` agrees | IR-006 (LOW): the docstring claims an incomplete stock its fixture lacks |
| TC-COMP-189 (`test_restated_value_and_growth_cells_carry_the_mark`) | WEAK | Value+growth marked, momentum-only marked, unmarked | IR-001: no stock is marked on exactly one of value and growth, so the two columns can be swapped |
| T012 `test_evaluate_filter_equals_the_list` and siblings | ADEQUATE | Five threshold shapes, unpaginated equality, prefix, the named set | none |
| T013 sort and keyset tests | ADEQUATE | Nulls last in both directions, symbol ties, page boundaries at every block edge, unpaged equals paged for three sorts in both orders, binding refusals | none |
| T014 `test_cells_are_the_stored_rows`, `test_input_reason_cell_carries_its_input_and_detail`, `test_name_is_the_latest_reference_name_or_none` | WEAK | Classified and unranked cells as stored; a momentum input-reason cell's input and detail; latest reference name or None | IR-002: no value or growth input-reason cell has its `reason_input` or `reason_detail` asserted |
| T015 page-block tests | ADEQUATE | `set` and `later` equal `read_set_blocks`; never classified with a building set and with none; only `CURRENT_SET_SQL` runs | none |
| T016 read-only and placeholder guards | ADEQUATE | One read-only statement each; the only `{}` slots are the documented three; no stray `%`; no `||` | none |
| Open Gap 7 (a stock missing a factor row) | MISSING (no mandatory or planned test) | none | IR-004 (MEDIUM): three mutants survive |

**Mutation run (E.9).** `mutation-run.py generate` over
`b6b5838..c5a2039` produced 119 catalogue mutants across all three changed
production files. The coder's 35 manual mutants and 25 of the review's own
(`manual:rv-*`) bring the total to 179. They were run in four parallel clones
with the story's focused suites: **152 killed, 27 survived, 0 stillborn,
0 timeout**. The results are in
`CAP-002-E3-S2-implementation-review-v1-mutation.json` (sha256
`0e2d8617bf7c992b293b899e790ba7c5db657758825bb065dab28efda8d4a79c`).

Survivors judged **equivalent** (16):

- `reader.py:275:off-by-one:1`: every bound name begins `{factor}_`, so `split("_", 2)[0]` equals `split("_", 1)[0]`.
- `reader.py:524`, `reader.py:525` `drop-defaulted-argument`: `k` and `ksym` are named only by a keyset fragment, and with no cursor the fragment is `true`.
- `reader.py:543:off-by-one:1`: the statement always returns at least the count row, which overwrites the initial `match_count`.
- `reader.py:548` `drop-defaulted-argument` and `negate-boolean`: `names` and `row` come from one result, so `strict` never fires.
- `list_classifications.sql:1,4,5,8,9` and `universe_exists.sql:2`: the digit sits in a `--` comment.
- `list_classifications.sql:23`, `universe_exists.sql:3`: `EXISTS` ignores its select list.
- `manual:outer-order-dropped`: the plan's own T019 statement has no outer `ORDER BY`. With no join clause, PostgreSQL 16 (tech stack) can run `LEFT JOIN ... ON true` only as a nested loop with the one-row count on the outer side, so the page arrives in the subquery's order.
- `manual:rv-name-tiebreak-asc`: DEC-0245 defines the name as that of the most recent `instrument_reference` row. `value_hash` only makes `LIMIT 1` deterministic among rows recorded at the same instant, where no row is more recent. DEC-0245's derivation ("the latest recorded row is the current name") leaves which of two simultaneous names wins open.

Survivors judged **not equivalent** (11), each assigned to a finding:

- IR-001: `rv-growth-restated-from-value`, `rv-value-restated-from-growth`
- IR-002: `rv-growth-reason-input-from-value`, `rv-growth-reason-detail-from-value`, `rv-value-reason-input-from-growth`, `rv-value-reason-detail-from-growth`
- IR-003: `rv-today-zone-behind-chicago`, `rv-today-host-date`
- IR-004: `rv-missing-row-accepted`, `rv-threshold-guard-not-equal`, `rv-value-join-inner`

The coder's evidence lists 15 survivors, all equivalent, and this review agrees
with each of those 15. The coder's run held no mutant for the 11 above: its
`universe-today-utc` replaced `today` with `date(2000, 1, 1)`, which any
membership test kills.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/.../CAP-002-E3-S2.md --stage adversarial-review` | harness root | 0 | PASS | `READY — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | PASS | `b6b583838dfa172827b1f6e2b4f965a0a9dcd492`, an ancestor of HEAD |
| `python3 scripts/check-tdd-evidence.py --evidence .../CAP-002-E3-S2-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base b6b5838... --decisions-dir projects/factorflow-v2/decisions --require-logs` (sandboxed) | harness root | 1 | NOT RUN (environment) | `TDD-LINT-DIFF ... error: unable to create temporary file: Operation not permitted`: a sandbox refusal, so the plain call was rerun outside the sandbox |
| same command, absolute paths, outside the sandbox | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest tests/unit/test_reader_sort_allowlist.py tests/unit/test_reader_cursor.py tests/unit/test_reader_filters.py tests/unit/test_reader_sql_read_only.py tests/integration/test_reader_list.py tests/unit/test_engine_sql_safety.py tests/unit/test_package_data_ships_sql.py tests/unit/test_classification_sql_ships.py -q -p no:randomly` | component | 0 | PASS | `221 passed in 14.03s` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest -m postgres -q` | component | 0 | PASS | `619 passed, 1196 deselected, 2 warnings in 238.90s` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest -m "not postgres" -q` | component | 0 | PASS | `1195 passed, 619 deselected, 1 xfailed, 2 warnings in 25.78s`. The two halves partition the full `uv run pytest` set (1815 collected) |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline ruff check .` | component | 0 | PASS | `All checks passed!` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline ruff format --check .` | component | 0 | PASS | `247 files already formatted` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline mypy src` | component | 0 | PASS | `Success: no issues found in 57 source files` |
| `uv build --directory repos/factorflow-v2/FactorFlow-v2 --offline --out-dir <scratchpad>/dist` | component | 0 | PASS | sdist and wheel built; the wheel lists `factorflow/classification/sql/list_classifications.sql` and `universe_exists.sql` (T021, DEC-0088) |
| T022 greps (`api.classification_bounds\|universes.service` in `reader.py`; `MEMBERSHIP_AS_OF_SQL\|membership_as_of` and `hide_incomplete` under `classification/`) | component | 1 / 0 / 0 | PASS | No match for the forbidden imports. `MEMBERSHIP_AS_OF_SQL` is imported (`reader.py:58`) and executed (`reader.py:494`) with no restated replay. `hide_incomplete` appears in `list_classifications.sql` only |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range b6b5838...c5a2039 --cycle review --out <scratchpad>/mut/mutants.json` | harness root | 0 | PASS | 119 mutants; 60 manual mutants were then appended (179) |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratchpad>/mut/mutants.json --jobs 4 --command 'uv run --offline --all-extras pytest -x -q -p no:cacheprovider -p no:randomly <the five story suites>' --out <scratchpad>/mut/results.json` (outside the sandbox) | harness root | 3 | evidence | Four green baselines; `{"killed": 152, "survived": 27}`. Exit 3 reports the survivors, which are judged above |
| Probe: `encode_cursor`/`decode_cursor` of key `Decimal("1E+200000")`, then `SELECT 1 WHERE 0 > %(k)s::numeric` against `postgres:16-alpine` (scratchpad script, outside the repo) | component venv | 0 | evidence | `decode_cursor accepted: True`; `psycopg error: NumericValueOutOfRange value overflows numeric format` (IR-005) |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before and after) | harness root | 0 | PASS | `sha256:3bde69f4079c2adcc583285c3520553483cfc1027375525de4fa66936a671bf1` both times |

Excluded, with reasons:

- `npm ci`, `npm run build|test|test:e2e|lint|format` and `npx tsc --noEmit`
  (tech stack) were not run. The change set touches no frontend file, and
  neither the story nor the plan names a frontend command.
- `uv sync --all-extras` was not run. `pyproject.toml` and `uv.lock` are
  unchanged by the story, and every `uv run` above resolves the locked
  environment.

### Validation Side Effects

- Before: HEAD `c5a20392fc110ba4165795946b4a19a1fd79b6d7`, working tree clean, fingerprint `sha256:3bde69f4…1bf1`.
- After: HEAD unchanged, working tree clean, fingerprint unchanged. `uv build` refreshed the ignored `src/factorflow.egg-info/` and `build/`. Mutation clones, logs and the built distribution live in the scratchpad.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | initial | OPEN | TC-COMP-189 is WEAK: no test tells the value and growth `restated_possible` marks apart; two mutants survive |
| IR-002 | HIGH | initial | OPEN | T014 is PARTIAL: input-reason `reason_input`/`reason_detail` are asserted for momentum only; four mutants survive |
| IR-003 | HIGH | initial | OPEN | TC-COMP-112 is WEAK: the universe scope's America/Chicago `today` (DEC-0128) is unpinned; two mutants survive |
| IR-004 | MEDIUM | initial | OPEN | Open Gap 7's missing-factor-row rule (ValueError, `IS DISTINCT FROM` guard) is untested; three mutants survive |
| IR-005 | LOW | initial | OPEN | A forged cursor key outside numeric range passes `decode_cursor` and fails in PostgreSQL instead of `CursorError` |
| IR-006 | LOW | initial | OPEN | TC-COMP-122's docstring claims an incomplete member its fixture does not seed |

### IR-001 — The value and growth restatement marks are interchangeable under every test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-6, DAC-E3-12, AC-23
- **Tasks**: T008 (TC-COMP-189), T019
- **Files**: `src/factorflow/classification/sql/list_classifications.sql:31,35` (`value_restated_possible`, `growth_restated_possible`); `tests/integration/test_reader_list.py:238` `test_restated_value_and_growth_cells_carry_the_mark`
- **Claim challenged**: TC-COMP-189 proves that a restated value or growth cell carries `restated_possible` on that cell.
- **Observed evidence**: the test seeds `MARK` (value and growth marked), `MOMO` (momentum only) and `PLAIN`. No stock is marked on exactly one of value and growth. The mutants `manual:rv-growth-restated-from-value` (`c_value.restated_possible AS growth_restated_possible`) and `manual:rv-value-restated-from-growth` survive. The momentum swap is killed.
- **Expected evidence/behavior**: DAC-E3-S2-6 and DAC-E3-12 put the mark on the cell whose fundamental was backfilled. AC-23 retains it "with that classification". A value-only restatement must show on value and not on growth, and the reverse.
- **Impact**: a regression that wires one factor's mark to the other passes the suite. A growth cell would then show *possibly restated* for a value-only restatement, and a restated growth cell would lose its mark. The current code is correct. This list read is the seam that compare (E3-S3), the API (E3-S5) and the snapshot inherit.
- **Required remediation**: make TC-COMP-189 assert each factor's mark independently, for example a stock marked on value only and one on growth only, so that both survivors are killed.

### IR-002 — Input-reason `reason_input` and `reason_detail` are asserted for momentum only

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-3 (an incomplete stock stays listed and rendered with its reason; AC-12 through DAC-E3-3), AC-9 (the served cell)
- **Tasks**: T014, T019
- **Files**: `src/factorflow/classification/sql/list_classifications.sql:30,34` (`value_reason_input`, `value_reason_detail`, `growth_reason_input`, `growth_reason_detail`); `tests/integration/test_reader_list.py:658-702`
- **Claim challenged**: T014 proves that "a `not_classified` cell returns ... for an input reason, `reason_input` and `reason_detail`".
- **Observed evidence**: only `test_input_reason_cell_carries_its_input_and_detail` asserts `reason_input` and `reason_detail` on an input-reason cell, and only for momentum (`INC`). Every value or growth input-reason cell in the suite is checked for `reason_code` at most. Four mutants survive: `manual:rv-growth-reason-input-from-value`, `manual:rv-growth-reason-detail-from-value`, `manual:rv-value-reason-input-from-growth` and `manual:rv-value-reason-detail-from-growth`. The momentum equivalent is killed.
- **Expected evidence/behavior**: T014; the cell carries the stored `reason_input` and `reason_detail` for its own factor (design 2.3 `FactorCell`; STD-UI-15, nothing recomputed).
- **Impact**: a column mix-up between value and growth passes the suite. The Research screen's *Incomplete* explanation would then name another factor's input, or none. The current code is correct.
- **Required remediation**: assert `reason_input` and `reason_detail` on a value and on a growth input-reason cell, in a stock whose other factor's row differs, so that all four survivors are killed.

### IR-003 — The universe scope's America/Chicago "today" is pinned by no test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-3, DAC-E3-5 (universe scope membership, as DEC-0128 and DEC-0065 define it)
- **Tasks**: T009 (TC-COMP-112), T020
- **Files**: `src/factorflow/classification/reader.py:116` `_CHICAGO`, `reader.py:486-495` `_members_today`; `tests/integration/test_reader_list.py:261-352`
- **Claim challenged**: TC-COMP-112 together with T009's "membership changes follow the replay" proves that the universe scope is the membership as of today in America/Chicago (T020; DEC-0128; DEC-0065).
- **Observed evidence**: no test controls the reader's clock. Every membership event takes its database default `recorded_on`, which is the Chicago date, and is read back moments later. Two mutants survive: `manual:rv-today-zone-behind-chicago` (`ZoneInfo("America/Los_Angeles")`) and `manual:rv-today-host-date` (`today = date.today()`). The coder's `universe-today-utc` mutant was `date(2000, 1, 1)`, which any membership test kills.
- **Expected evidence/behavior**: DEC-0128 (owner-upheld): "as_of = today in America/Chicago". DEC-0065 (owner-upheld): membership is the replay at the America/Chicago `recorded_on` grain. Plan T020: `datetime.now(ZoneInfo("America/Chicago")).date()`.
- **Impact**: with a zone behind Chicago, or a host-local date on a host west of Chicago, a member added after midnight Chicago is missing from the universe-scoped list until midnight in that zone. Removals would lag the same way. On a host in Chicago or UTC the code as built is unaffected, and the current code is correct. This does not lower the severity. The rule is the owner's, and a regression to `date.today()` would pass every test.
- **Required remediation**: a universe-scope test that fixes the reader's notion of now to an instant whose America/Chicago date differs from its date in a zone behind Chicago, with a membership event recorded on that Chicago date, so that both survivors are killed. The clock could be fixed by patching the clock the reader uses, or by an equivalent seam that stays inside this story's files.

### IR-004 — Open Gap 7's missing-factor-row rule is untested

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (data-integrity rule; no story AC addresses a stock with fewer than three factor rows)
- **Tasks**: T019, T020 (task plan Open Gap 7; Resolved Conflicts, the threshold guard)
- **Files**: `src/factorflow/classification/reader.py:567-570` `_row_to_cell`; `src/factorflow/classification/sql/list_classifications.sql:42-50` (LEFT JOINs) and `:51-78` (`IS DISTINCT FROM 'classified'` guards)
- **Claim challenged**: a missing factor row is a data-integrity error (`ValueError`), and the threshold guard keeps a missing joined row so it "cannot turn a keep into a drop".
- **Observed evidence**: no test seeds a stock with fewer than three `factor_classification` rows. Three mutants survive. `manual:rv-missing-row-accepted` returns a cell with status `"None"`. `manual:rv-threshold-guard-not-equal` and `manual:rv-value-join-inner` silently drop the stock instead of raising.
- **Expected evidence/behavior**: the plan's Open Gap 7 ("The mapper treats a null `*_status` as a data-integrity error rather than inventing a cell (ValueError)") and its Resolved Conflicts on `IS DISTINCT FROM` (DEC-0129).
- **Impact**: the engine writes three rows per stock, so this state arises only from a defect elsewhere. A regression would then hide that defect instead of surfacing it. No planned test or mandatory TC covers the state, which is why this finding is MEDIUM rather than HIGH.
- **Required remediation**: one test that seeds a stock missing a factor row and asserts `ValueError`, with and without a bound on that factor, kills all three.

### IR-005 — A forged cursor key outside PostgreSQL's numeric range reaches the database

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-5
- **Tasks**: T018
- **Files**: `src/factorflow/classification/reader.py:405-411` (`_parse_cursor`'s decimal branch)
- **Claim challenged**: "decoding validates every field's type and raises `CursorError` for any failure" (T018); "cursors are ... refused on any mismatch" (design 4).
- **Observed evidence**: the DEC-0246 check is an unkeyed digest, so a client can re-encode any payload. The probe encoded and decoded key `Decimal("1E+200000")` (`decode_cursor accepted: True`). Binding it as `%(k)s::numeric` on PostgreSQL 16 raised `NumericValueOutOfRange: value overflows numeric format`.
- **Expected evidence/behavior**: a key that no stored score (`numeric(18,6)`) or percentile (`numeric(9,6)`) can equal is a malformed cursor and raises `CursorError` (422), not a database error.
- **Impact**: a hand-built cursor turns a 422 into a 500 and aborts the caller's transaction. It needs a deliberately forged cursor on a loopback, single-owner API, and no acceptance criterion fails.
- **Required remediation**: refuse, with `CursorError`, a factor-sort key outside the range its column can hold.

### IR-006 — TC-COMP-122's docstring claims an incomplete stock its fixture lacks

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S2-7
- **Tasks**: T011
- **Files**: `tests/integration/test_reader_list.py:445-462`
- **Claim challenged**: "scoped, every member with a row, incomplete, unranked and retired included" (docstring; T011).
- **Observed evidence**: the `scoped_stocks` fixture has an unranked factor (`ACT`), a retired member (`OLD`) and a fully classified member (`OUT`), but no input-reason stock. The behaviour is pinned elsewhere: the TC-COMP-108 test's default universe-scoped read lists `IM`, `IO` and `INC`, and the mutant defaulting `hide_incomplete` to true is killed.
- **Expected evidence/behavior**: T011 lists incomplete stocks among those that empty thresholds keep in the universe scope.
- **Impact**: traceability only; no regression escapes.
- **Required remediation**: add an input-reason member to this test's scope, or narrow its docstring to what it seeds.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **DEC-0245 (PROVISIONAL, agent, not owner-reviewed).** `StockRow.name` is
  typed `str | None` and read from the latest `instrument_reference.company_name`,
  against design 2.3's `name: str` and 2.5's `i.name`. The review confirmed
  the decision's premise: migration 0001's `instrument` has no `name` column,
  and 0002's `instrument_reference.company_name` is nullable. The decision is
  derivable and contained in the reader, and `test_name_is_the_latest_reference_name_or_none`
  pins it. It awaits the owner. E3-S3 and E3-S5 inherit the nullable type.
- **DEC-0246 (contradiction, agent, not owner-reviewed).** The cursor adds `chk`
  beyond T018's field list. Under precedence, DAC-E3-S2-5 and T004 outrank the
  illustrative list. The exhaustive flip test pins it. IR-005 records the one
  edge case the unkeyed digest leaves open.
- **T019's final `SELECT`** uses `LEFT JOIN (...) m ON true` and an outer
  `ORDER BY` where the plan wrote `LEFT JOIN LATERAL` without one. The two are
  equivalent (see `manual:outer-order-dropped`).
- **`reader_seed.py`** gains `insert_reference`, `add_member`, `remove_member`
  and a `name` argument beyond T002's list. They are justified by DEC-0245 and
  T009; no existing signature changed.
- **The compare clause of DAC-E3-5.** The `scope` CTE restricts a non-universe
  read to active instruments even when `symbols` is set, exactly as T019
  specifies. Compare's retired-kept rule (design 2.5, "no lifecycle
  restriction"; DAC-E3-S3-4) has to be added by CAP-002-E3-S3, which reuses
  this statement. This is not a finding against this story.
- **Story status.** It changed from `planning` to `in-review`, a lifecycle
  field outside the content revision (the revision equals the approval's
  `reviewed_revision`).
- **Bookkeeping.** All 24 tasks are checked. T008, T009 and T014 are PARTIAL
  per IR-001 to IR-003.
- No unjustified file, dependency or behaviour change was found.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework of CAP-002-E3-S2 with this report and `CAP-002-E3-S2-tasks.md`), then a new Adversarial Review.
- **Required action**: resolve IR-001, IR-002 and IR-003. Each needs only test changes that kill the named survivors. IR-004 (MEDIUM), IR-005 (LOW) and IR-006 (LOW) should be addressed in the same rework. The next review uses this report as its baseline: `reviewed_head` `c5a20392fc110ba4165795946b4a19a1fd79b6d7` and `CAP-002-E3-S2-implementation-review-v1-mutation.json` for `scope --previous`.
- **Warnings accepted downstream**: N/A
- **Owner attention (not gating this review)**: DEC-0245 (PROVISIONAL) and DEC-0246 are open, `owner_reviewed: false`.
