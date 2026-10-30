---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E3-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-30T03:22:39Z"
reviewed_head: "a6466fefc2ede350b108a7e1cd639932e42a58d5"
review_base: "7688c924c554920816b60fd6af60fc81f1164174"
reviewed_state_revision: "sha256:bbb78ccb7f438ba94197fb8dba88d0495527627310ac9ae1bb59caebd1631740"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E3-S1
    artifact_version: 1
    content_revision: sha256:aed58807f7a7be9b964d1579526c9b067cb9689e6277c4141b3400ac8ab9c616
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-30T03:22:39Z
  source_artifacts:
    - id: CAP-002-E3-S1
      version: "1 (sha256:aed58807f7a7be9b964d1579526c9b067cb9689e6277c4141b3400ac8ab9c616)"
    - id: CAP-002-E3-S1-tasks
      version: "1 (updated 2026-10-30, last_reworked_review v1)"
    - id: CAP-002-E3-S1-tdd-evidence
      version: "cycle-2"
    - id: CAP-002-E3-S1-implementation-review
      version: "1 (baseline, reviewed_head 4364fd56b68e640c662b9bc50984fd17b665946a)"
    - id: CAP-002-E3
      version: "4"
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

# Implementation Review: CAP-002-E3-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 0 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 19/19 verified |
| Required validation | 19/19 passed |

This is a re-review. Its baseline is v1 (`CHANGES-REQUIRED`, reviewed_head `4364fd5`). The rework commit `a6466fe` changed tests only: `git diff 4364fd5 a6466fe -- src/` is empty. It added 100 lines to `tests/integration/test_reader_current_set.py` and a TDD-evidence cycle. All three v1 findings are resolved. Each of the five non-equivalent v1 survivors is now killed in my own run:

- **v1/IR-001.** TC-COMP-170 and both TC-COMP-171 cases now assert `later.started_at` against the set's own start.
- **v1/IR-002.** TC-COMP-170 now asserts the complete set's `factors` while the building set holds different rows.
- **v1/IR-003.** Two new T009 cases seed data where `ended_at` and `started_at` disagree.

Every required command passes on `a6466fe`. Biome's lint and format checks fail in the component working copy, on one git-ignored file left by an earlier `uv build`. The same commands pass on a clean clone of the same HEAD (see Independent Validation).

I ran 76 mutants: v1's 64, carried by `scope`, and 12 new ones of my own. 67 were killed and 9 survived. Five survivors are the five equivalent ones v1 already recorded. Of my four new survivors, one is equivalent. The other three change behaviour the contract specifies. Each sits on a production line unchanged since the baseline, which v1 could have mutated just as well. So `scope` tags them `late`. They are recorded as two MEDIUM warnings and do not block:

- **IR-001 (MEDIUM, late).** The set block's `factors` survive a subquery that merges every *complete* set's rows. The one test with two complete sets inserts the current set last, so the last value per factor is the right one.
- **IR-002 (MEDIUM, late).** Only T011's one pair of candidates pins how `later` chooses among several sets. Ordering by the set's `ended_at`, or by the run's `started_at`, passes every test.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0 · **total 2**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S1.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S1` |
| HEAD | `a6466fefc2ede350b108a7e1cd639932e42a58d5`. Three commits over the base: `4364fd5` (story coding), `1cc28d8` (review v1), `a6466fe` (rework) |
| Review base | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` → `7688c924c554920816b60fd6af60fc81f1164174` (`origin/main`), an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation (`git status --porcelain=v1 -uall` empty); only git-ignored build products present |
| Changed files reviewed | 22, all added or modified in `7688c92..a6466fe`; no staged, unstaged or untracked files |
| Baseline | v1 (`CHANGES-REQUIRED`), reviewed_head `4364fd56b68e640c662b9bc50984fd17b665946a`, with `CAP-002-E3-S1-implementation-review-v1-mutation.json` |

`pipeline-state.py check --stage adversarial-review` reported `READY — review changes were reworked; a new review version is required`. The prerequisite check exited 0. `artifact-gate.py require` passes for the story and for the reader design. The story's revision equals its approval's `reviewed_revision`. The design, test specifications, coverage matrix and epic are unchanged in `7688c92..a6466fe`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/reader.py` | added; unchanged since baseline | T015, T016; AC-13, AC-20–AC-22, DAC-E3-1, DAC-E3-10, DAC-E3-11 |
| `src/factorflow/classification/sql/current_set.sql` | added; unchanged since baseline | T013; DAC-E3-1, AC-20, AC-21 |
| `src/factorflow/classification/sql/summary.sql` | added; unchanged since baseline | T014; DAC-E3-10, DAC-E3-S1-4, DAC-E3-S1-5 |
| `tests/integration/reader_seed.py` | added; unchanged since baseline | T002 |
| `tests/integration/test_reader_current_set.py` | added; **modified since baseline** (+100 −1) | T003, T004, T005, T009, T011; the rework of v1/IR-001 to IR-003 |
| `tests/integration/test_reader_summary.py` | added; unchanged since baseline | T006, T007, T008, T010 |
| `tests/unit/test_reader_sql_read_only.py` | added; unchanged since baseline | T012 |
| `docs/.../stories/CAP-002-E3-S1.md` | modified (`status` only) | Story-coding bookkeeping; outside the approval revision |
| `docs/.../stories/CAP-002-E3-S1-tasks.md` | modified (19 checkboxes; since baseline `updated` and `last_reworked_review` only) | Bookkeeping |
| `docs/.../stories/CAP-002-E3-S1-tdd-evidence.yaml` | added; cycle-2 appended since baseline | T019 |
| `docs/.../stories/CAP-002-E3-S1-evidence/`: `cycle-1.patch`, `red-cycle-1.log`, `green-cycle-1.log`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json` | added | T019, cycle-1 |
| `docs/.../stories/CAP-002-E3-S1-evidence/`: `cycle-2.patch`, `red-cycle-2-rework.log`, `full-suite-cycle-2.log`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json` | added since baseline | T019, cycle-2 |
| `docs/.../stories/CAP-002-E3-S1-implementation-review-v1.md`, `…-v1-mutation.json` | added by `1cc28d8` | The baseline review and its mutation results |

No file outside the plan was changed. The rework touched one test file and its evidence, and nothing in `src/`, `tests/conftest.py`, `pyproject.toml` or a migration. `cycle-2.patch` matches `git diff 4364fd5 a6466fe -- tests/integration/test_reader_current_set.py` exactly, ignoring `index` lines (`cmp` exit 0). Its sha256, `36dbf56a…`, equals cycle-2's `diff_sha256`. The red log, full-suite log and results file hashes match the evidence too.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | SATISFIED | `summary.sql`: `bool_or(fi.status IN ('missing', 'outdated'))` per instrument of one set | `test_missing_or_outdated_input_makes_a_stock_not_current`, `test_not_computable_does_not_rescue_a_missing_input` (TC-COMP-103) | Unchanged since v1. The engine applies the outdated rule when it writes the status; the summary counts the statuses |
| AC-20 | SATISFIED | `current_set.sql` `current` and `later` CTEs, `FULL JOIN … ON true`; `reader.read_set_blocks` sets `not_current = later is not None` | TC-COMP-170, TC-COMP-171, `test_newer_failed_set_is_later_and_previous_set_still_served`, `test_set_started_while_current_was_building_is_later` | The complete set is still served beside a building or failed `later`, and `failure_reason` reaches the block |
| AC-21 | SATISFIED | `CurrentSet` carries `classification_date`, `run_id`, `run_started_at` (`acquisition_run.started_at`), `run_outcome`, `ended_at`; `LaterSet.started_at` is `l.started_at` | `test_current_set_carries_run_and_set_fields[succeeded/partial]`, TC-COMP-178, TC-COMP-170, TC-COMP-171 | `later.started_at` is now asserted apart from the run's start and the current set's start (v1/IR-001 resolved) |
| AC-22 | SATISFIED | `summary` returns `Summary(set=None, never_classified=True, …)` with no complete set; `read_set_blocks` returns `(None, None)` with no row | TC-COMP-181, `test_summary_with_no_set_at_all` | — |
| DAC-E3-1 | SATISFIED | `current_set.sql:5-19` as design 2.4: `ORDER BY s.ended_at DESC LIMIT 1` over `complete`; `later` by `started_at > current.started_at`, `ORDER BY started_at DESC LIMIT 1` | TC-COMP-170, T009 cases including `test_current_is_chosen_by_ended_at_where_started_at_orders_otherwise` and `test_set_started_while_current_was_building_is_later`, T011 pin | The `ended_at` key of `current` and the `started_at` lower bound of `later` are now pinned (v1/IR-003 resolved). The ordering among several `later` candidates is pinned only partly (IR-002, late) |
| DAC-E3-10 | SATISFIED | As AC-13; `followed_count = current.active_instruments` | TC-COMP-103; `test_an_unranked_factor_changes_no_stocks_currency`; `test_complete_set_with_no_inputs_counts_zero_current` | `not_computable` alone leaves a stock current |
| DAC-E3-11 | SATISFIED | `summary` takes `set` and `later` from `read_set_blocks`, the function E3-S2 must reuse | TC-COMP-171 (summary half); TC-COMP-181 | The list half is E3-S2's and the API half E3-S5's (TC-COMP-173), as the plan records |
| DAC-E3-S1-1 | SATISFIED | As DAC-E3-1 | TC-COMP-170 through `read_set_blocks`, `summary` and `current_set` | TC-COMP-170 now asserts `later.started_at` and the set's `factors` |
| DAC-E3-S1-2 | SATISFIED | `current` columns null, `later` columns set → `(None, LaterSet)` | TC-COMP-171 `[building]`, `[failed]` | `started_at`, `failure_reason` "boom" and `ended_at` asserted |
| DAC-E3-S1-3 | SATISFIED | Zero rows → `(None, None)`; `Summary` has one field list in every state | TC-COMP-181 | Field names compared across the empty and populated states |
| DAC-E3-S1-4 | SATISFIED | As AC-13 | TC-COMP-103 (both tests) | Every status-list mutant is killed |
| DAC-E3-S1-5 | SATISFIED | `summary.sql` returns `current_count`, `scored_roster`; `Summary`/`StocksCurrent` hold no stock rows | `test_summary_statement_returns_counts_only`; `test_summary_and_current_set_are_served_from_indexes` (`enable_seqscan = off`, no `Seq Scan` on the three tables) | Index evidence as the plan's Open Gap 4 states; volume is E3-S4's |
| DAC-E3-S1-6 | SATISFIED | Every field is read from a column; `ranked` and `qualified_count` from `classification_set_factor` correlated on `f.set_id = c.set_id`; `min_peer_set_size` from `MIN_PEER_SET_SIZE` | TC-COMP-178; TC-COMP-170 (factors beside a building set's rows); `tests/unit/test_reader_sql_read_only.py` | One correlation variant still survives (IR-001, late) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `classification/__init__.py`, `constants.py` (`MIN_PEER_SET_SIZE`, `FACTORS`, `INPUT_NAMES`), `0006_classifications.sql`, `classification/sql/*.sql` in `[tool.setuptools.package-data]` all exist at `7688c92` | — |
| T002 | complete | VERIFIED | `tests/integration/reader_seed.py`: `insert_instrument`, `insert_run`, `insert_set`, `insert_input`, `insert_stock_inputs`; bound parameters only | Unchanged since v1. `insert_stock_inputs` is an unplanned convenience inside T002's purpose |
| T003 | complete | VERIFIED | `test_complete_set_with_newer_building_set_is_served_with_later` | Now asserts `later.started_at` (`building_started`, an hour after run B's start) and the complete set's `factors` while the building set carries `3/False, 4/False, 50/True` |
| T004 | complete | VERIFIED | `test_first_set_building_or_failed_is_never_classified_with_later[building/failed]` | Now asserts `started_at == T0 + 1h`, apart from the run's `T0` |
| T005 | complete | VERIFIED | `test_no_set_at_all_is_never_classified_in_the_same_shape` | — |
| T006 | complete | VERIFIED | `test_missing_or_outdated_input_makes_a_stock_not_current`, `test_not_computable_does_not_rescue_a_missing_input` | — |
| T007 | complete | VERIFIED | `test_summary_statement_returns_counts_only`, `test_summary_and_current_set_are_served_from_indexes` | — |
| T008 | complete | VERIFIED | `test_reader_returns_stored_values_and_recomputes_nothing` | — |
| T009 | complete | VERIFIED | `test_latest_complete_set_by_ended_at_is_current`, `test_newer_failed_set_is_later_and_previous_set_still_served`, `test_complete_set_alone_has_no_later`, `test_building_set_older_than_current_is_not_later`, `test_current_is_chosen_by_ended_at_where_started_at_orders_otherwise`, `test_set_started_while_current_was_building_is_later`, `test_current_set_carries_run_and_set_fields` | v1 found this PARTIAL. Both cases now have data on which the wrong key fails: A starts first and ends last and is current; a set started inside the current set's `[started_at, ended_at]` window is `later` |
| T010 | complete | VERIFIED | Six summary-shape tests in `test_reader_summary.py` | — |
| T011 | complete | VERIFIED | `test_most_recent_non_complete_set_is_later_while_none_is_complete`, with the PROVISIONAL comment | DEC-0126 (owner `upheld`) settled Open Gap 1 as implemented. Its one pair of candidates is ordered the same by every key tried (IR-002, late) |
| T012 | complete | VERIFIED | `tests/unit/test_reader_sql_read_only.py`, with a self-test of the comment stripper | — |
| T013 | complete | VERIFIED | `current_set.sql` | The select list matches T013; no state filter on `later` |
| T014 | complete | VERIFIED | `summary.sql` | Verbatim from design 2.4 apart from the header comment |
| T015 | complete | VERIFIED | `reader.py` dataclasses, `read_set_blocks`, `current_set`; `FACTORS`/`MIN_PEER_SET_SIZE` imported and re-exported | No `api.bounds` or `classification_bounds` import (grep exit 1); no E3-S2 types |
| T016 | complete | VERIFIED | `reader.summary` | `followed_count` is `active_instruments`, not `scored_roster` (`manual:followed-is-scored-roster` killed) |
| T017 | complete | VERIFIED | `tests/unit/test_package_data_ships_sql.py` passes; the wheel built by `uv build` contains `factorflow/classification/sql/current_set.sql` and `summary.sql` | — |
| T018 | complete | VERIFIED | Every required validation command passes (Independent Validation); docstring and tests cite DAC-E3-S1-1 to -6 and the six TC-IDs | — |
| T019 | complete | VERIFIED | `check-tdd-evidence.py … --require-logs`: 0 errors, 0 warnings; two cycles, each `commit_hash: stage`, `APPROVED`, `drift_detected: false` | Cycle-2's RED is mutant-based: the five v1 survivors pass the cycle-1 tests and fail the cycle-2 tests. That suits a tests-only rework |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_complete_set_with_newer_building_set_is_served_with_later` / TC-COMP-170 | ADEQUATE | `set_id`, `not_current`, `never_classified`, the set's three `FactorSummary` values while the building set has different ones, and `later`'s `set_id`, `state`, `run_id`, `run_started_at`, `started_at`, `ended_at`, `failure_reason`. Checked through `read_set_blocks`, `summary` and `current_set`, which agree | none blocking. Kills `review:factors-any-set`, `review:later-started-is-run-started`, `review:later-started-sql-is-current`, `review-v2:factors-later-set` |
| `test_first_set_building_or_failed_is_never_classified_with_later` / TC-COMP-171 | ADEQUATE | `set` None, `never_classified`, `later` identity, `run_started_at`, `started_at` apart from the run's start; `failure_reason` and `ended_at` on both cases | none |
| `test_no_set_at_all_is_never_classified_in_the_same_shape` / TC-COMP-181 | ADEQUATE | `(None, None)`, `never_classified`, one `Summary` field list across states | none |
| `test_missing_or_outdated_input_makes_a_stock_not_current`, `test_not_computable_does_not_rescue_a_missing_input` / TC-COMP-103 | ADEQUATE | Exact `StocksCurrent(2, 4)` over all four status kinds; the converse case | none |
| `test_summary_statement_returns_counts_only`, `test_summary_and_current_set_are_served_from_indexes` / TC-COMP-104 | ADEQUATE | Column names, one row `(59, 60)`, integer types, the dataclass field lists; `EXPLAIN` under `enable_seqscan = off` | Index path only, as the plan's Open Gap 4 states |
| `test_reader_returns_stored_values_and_recomputes_nothing` / TC-COMP-178 | ADEQUATE | Stored values that no recount could produce: 7 vs 3 stocks, 41 qualified with no classification rows, 33 unranked, `partial` | none |
| `test_current_is_chosen_by_ended_at_where_started_at_orders_otherwise` (T009, new) | ADEQUATE | A (started `T0`, ended `T0+3h`) is current over B (`T0+1h`, `T0+2h`): `set_id`, `run_id`, `ended_at` and A's own `factors`, through `current_set` and `summary` | Kills `review:current-by-started-at` and `review-v2:current-by-run-start`. It inserts the current set last, so a merge of every complete set's rows passes (IR-001, late). It seeds a state the design says cannot arise, a complete set started after the current one, and says so in its docstring. That is the only state in which the two keys disagree |
| `test_set_started_while_current_was_building_is_later` (T009, new) | ADEQUATE | A building set started an hour into the current set's three-hour window is `later`, with `not_current` true and its own `started_at` | Kills `review:later-after-current-end` and `review-v2:later-after-current-run-start` |
| T009 tests (`test_latest_complete_set_by_ended_at_is_current`, `test_newer_failed_set_is_later_and_previous_set_still_served`, `test_complete_set_alone_has_no_later`, `test_building_set_older_than_current_is_not_later`, `test_current_set_carries_run_and_set_fields`) | ADEQUATE | As in v1. With the two new cases, the keys v1 found unpinned are pinned | none |
| T010 tests (six) | ADEQUATE | Shape before any set, building-only, the complete set's count while a newer set builds, `followed_count == scored_roster`, unranked factor, zero inputs | none |
| `test_most_recent_non_complete_set_is_later_while_none_is_complete` (T011) | ADEQUATE | Most recent of two non-complete sets; one row returned | Its failed-then-building pair orders the same by set start, set end (nulls first) and run start (IR-002, late) |
| `test_returned_blocks_are_immutable` | ADEQUATE | Five frozen dataclasses | none |
| `test_reader_statement_is_one_read_only_query`, `test_comment_stripping_does_not_hide_a_write` (T012) | ADEQUATE | One statement, `WITH`/`SELECT`, no write keyword, located beside the module | none |

**Isolation and determinism.** Each integration test gets its own migrated database (`migrated_run_schema_connection`). Timestamps are fixed constants. The new tests follow the same pattern. TC-COMP-170 kills `review:factors-any-set` only because of two things: a fresh table is scanned in insertion order, and `jsonb_object_agg` keeps the last value for a duplicate key. The coder records this in cycle-2's `red_evidence`. The new `ended_at` case inserts its sets in the opposite order, so a merge of every set fails one of the two tests whichever value is kept. That reasoning holds for every set, not for complete sets alone (IR-001).

**RED evidence.** The cycle-2 RED log reproduces all five v1 survivors against the cycle-1 tests: 36 passed under each mutant. It then shows each one failing the cycle-2 tests. My run agrees: each is killed by a cycle-2 assertion.

**Mutation (E.9).** I regenerated mutants with `mutation-run.py generate` over `7688c92..HEAD`. That gave the same 24 catalogue mutants as v1, since production is unchanged. I added 12 of my own (`review-v2:*`). `mutation-run.py scope --since 4364fd5 --previous …-v1-mutation.json` added v1's 40 manual mutants and tagged all 64 of v1's ids `carried` and my 12 `late`. No line of production code changed since the baseline, so nothing is `delta`. Of the 76, 67 were killed and 9 survived. Four baselines passed with 38 tests each.

| Survivor(s) | Scope | Disposition | Contract reasoning |
|-------------|-------|-------------|--------------------|
| `reader.py:111:drop-defaulted-argument:1`, `reader.py:111:negate-boolean:1` (`zip(..., strict=True)` → default / `False`) | carried | equivalent | As v1: `names` and `row` come from one cursor result, so their lengths always match. No artifact specifies the check |
| `current_set.sql:2:off-by-one:1`, `:3:off-by-one:1`, `:3:off-by-one:2` | carried | equivalent | As v1: digits inside the `--` header comment. No artifact specifies comment text |
| `review-v2:later-state-filter` (`WHERE s.state <> 'complete' AND s.started_at > …`) | late | equivalent | The two differ only when a complete set started after the current one. Design 2.4 says that state "cannot exist by construction", so the behaviour there is open. `LaterSet.state` is declared `building \| failed` either way. The new `ended_at` case seeds that state and leaves `later` unasserted on purpose |
| `review-v2:factors-complete-sets` (`WHERE f.set_id IN (SELECT set_id FROM classification_set WHERE state = 'complete')`) | late | **not equivalent** | IR-001 |
| `review-v2:later-by-ended-at` (`later` `ORDER BY s.ended_at DESC`), `review-v2:later-by-run-start` (`later` `ORDER BY r.started_at DESC`) | late | **not equivalent** | IR-002 |

Every carried mutant other than the five equivalent ones is killed, including all five v1 non-equivalent survivors. My killed `review-v2` mutants:

- `factors-later-set`: the factors of `COALESCE(l.set_id, c.set_id)`.
- `later-after-current-run-start`: `later` bounded by the current run's start.
- `current-by-run-start`: `current` ordered by its run's start.
- `later-run-started-is-current-run`, `later-ended-is-current-ended`, `later-reason-is-current`, `later-state-is-current`: `later` columns read from the current set.
- `not-current-when-failed-only`.

## Independent Validation

`<component>` is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-design-cap-003-f106a0/repos/factorflow-v2/FactorFlow-v2`, at `a6466fe` throughout. `<scratch>` is this session's scratchpad folder `v2/`, outside the repository. The sandbox blocked two things:

- The `uv` cache: `Failed to initialize cache at /Users/alvarodejodra/.cache/uv … Operation not permitted (os error 1)`.
- The TDD lint's temporary file: `unable to create temporary file: Operation not permitted`.

So `uv`, `npm`, every Docker-backed command and the lint ran outside the sandbox, each as one plain call.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | evidence | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | evidence | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | evidence | `7688c924c554920816b60fd6af60fc81f1164174`, equal to `origin/main` |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>`, then `require` on the story and on the reader design | harness root | 0 | evidence | `sha256:aed58807…`, equal to the approved `reviewed_revision`; both gates passed |
| `uv run --directory <component> --offline pytest tests/integration/test_reader_current_set.py tests/integration/test_reader_summary.py tests/unit/test_reader_sql_read_only.py tests/unit/test_package_data_ships_sql.py -p no:cacheprovider -q` | component | 0 | PASS (story-specific) | 38 passed, 4.46 s |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/…/CAP-002-E3-S1-tdd-evidence.yaml --repo-dir <component> --base 7688c924c554920816b60fd6af60fc81f1164174 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings. The sandboxed attempt reported two `TDD-LINT-DIFF` errors, both `unable to create temporary file: Operation not permitted` |
| `uv sync --directory <component> --all-extras --offline` | component | 0 | PASS (required) | Resolved 46, checked 43 |
| `uv run --directory <component> --offline pytest -q -p no:cacheprovider` | component | 0 | PASS (required) | 1640 passed, 1 xfailed, 327.51 s; two third-party deprecation warnings. v1 had 1638: the two new T009 cases |
| `uv run --directory <component> --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS (required) | 555 passed, 1086 deselected, 337.88 s |
| `uv run --directory <component> --offline pytest -m "not postgres" -q -p no:cacheprovider` | component | 0 | PASS (required) | 1085 passed, 555 deselected, 1 xfailed, 31.32 s |
| `uv run --directory <component> --offline ruff check .` | component | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --offline ruff format --check .` | component | 0 | PASS (required) | 243 files already formatted |
| `uv run --directory <component> --offline mypy src` | component | 0 | PASS (required) | No issues in 57 source files |
| `npm --prefix <component> ci --offline --no-audit --no-fund` | component | 0 | PASS (required) | 250 packages from the local cache |
| `npm --prefix <component> run lint` | component | 1 | environment, not the subject | Checked 112 files; 40 errors, all in `build/lib/factorflow/api/static/assets/index-CsjgWT4O.js`. That is a git-ignored copy of the Vite bundle, left in `build/` by an earlier `uv build` (directory dated 2026-10-30 02:14Z, before this review). `biome.json` ignores `dist/**` and `src/factorflow/api/static/**` but not `build/**`. No tracked file is reported |
| `npm --prefix <component> run format` | component | 1 | environment, not the subject | The same ignored file only |
| `git clone --quiet --no-hardlinks <component> <scratch>/clean` (HEAD `a6466fe`), then `npm --prefix <scratch>/clean ci --offline --no-audit --no-fund` | scratch | 0 | evidence | A clean checkout of the reviewed HEAD, without ignored build output |
| `npm --prefix <scratch>/clean run lint` | scratch clone | 0 | PASS (required) | Checked 110 files, no fixes, as in v1 |
| `npm --prefix <scratch>/clean run format` | scratch clone | 0 | PASS (required) | Checked 110 files, no fixes |
| `npm --prefix <component> exec -- tsc --noEmit -p <component>` | component | 0 | PASS (required) | No output |
| `npm --prefix <component> run test` | component | 0 | PASS (required) | 47 files, 876 tests |
| `npm --prefix <component> run build` | component | 0 | PASS (required) | Vite bundle into the ignored `src/factorflow/api/static/` |
| `npm --prefix <component> run test:e2e` | component | 0 | PASS (required) | 18 passed (3.1 m); `posttest:e2e` removed the container |
| `uv build --directory <component> --offline` | component | 0 | PASS (required) | sdist and wheel built; the wheel contains `factorflow/classification/sql/current_set.sql` and `summary.sql` |
| `grep -rn "api.bounds\|classification_bounds" src/factorflow/classification/reader.py` | component | 1 | PASS (story-specific) | No match, as the plan requires |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7688c924c554920816b60fd6af60fc81f1164174..HEAD --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | evidence | 24 catalogue mutants (12 `negate-boolean`, 8 `off-by-one`, 4 `drop-defaulted-argument`); 12 reviewer manual mutants then added into `<scratch>/mutants-with-manual.json` |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants-with-manual.json --since 4364fd56b68e640c662b9bc50984fd17b665946a --previous <component>/…/CAP-002-E3-S1-implementation-review-v1-mutation.json --out <scratch>/mutants-scoped.json` | harness root | 0 | evidence | 76 mutants: 64 `carried`, 12 `late`; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants-scoped.json --jobs 4 --timeout 900 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider tests/integration/test_reader_current_set.py tests/integration/test_reader_summary.py tests/unit/test_reader_sql_read_only.py tests/unit/test_package_data_ships_sql.py' --out <scratch>/mutation-review-results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 3 | PASS (required, E.9 scoped) | 76 mutants: 67 killed, 9 survived. No carried or delta mutant survives unless it is equivalent; the three non-equivalent survivors are `late` and do not block (step H). Of the survivors, 5 are carried and equivalent, 1 is late and equivalent, and 3 are late and non-equivalent (IR-001, IR-002). Four baselines passed with 38 each. Ran 03:02:55Z to 03:04:52Z. Results sha256 `a5119967…`, copied beside this report as `CAP-002-E3-S1-implementation-review-v2-mutation.json`. Exit 3 means survivors |

Nothing required was excluded. Every command in `docs/constitution/tech-stack.md` and the story's validation list ran in full. Biome's two checks count as passed on the clean clone. The component working copy differs from it only by git-ignored build output, and only that output fails.

The 19 required commands counted in the Gate Summary are:

- the TDD lint;
- the 15 tech-stack and story commands: `uv sync`, `uv build`, three `pytest` runs, `ruff check`, `ruff format --check`, `mypy`, `npm ci`, `npm run lint`, `npm run format`, `tsc`, `npm run test`, `npm run build`, and `npm run test:e2e`;
- the focused story suites;
- the story's `grep`;
- the mutation run.

Every one passed.

### Validation Side Effects

- Before (02:58:47Z): branch `usr/alvaro-de-jodra/CAP-002-E3-S1` at `a6466fe`, clean, `code-revision` `sha256:bbb78ccb…`.
- After (03:22:39Z): same branch, HEAD and `code-revision` (`sha256:bbb78ccb…`). `git status --porcelain=v1 -uall` lists only this report and its `-v2-mutation.json`. Only ignored paths were written: `.venv/`, `build/`, `dist/`, `src/factorflow.egg-info/`, `node_modules/`, `src/factorflow/api/static/{index.html,assets/}`, `test-results/`. Mutation clones, logs and results, and the clean clone, stayed under `<scratch>`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | MEDIUM | late | OPEN | The set block's `factors` survive a subquery merging every complete set's rows; the one two-complete-set test inserts the current set last |
| IR-002 | MEDIUM | late | OPEN | The order of `later` among several candidates is pinned by one pair that every tried key orders alike; ordering by `ended_at` or by the run's start survives |

### IR-001 — A merge of every complete set's `factors` passes the tests

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-21, DAC-E3-1, DAC-E3-S1-6
- **Tasks**: T009, T013
- **Files**: `src/factorflow/classification/sql/current_set.sql:30-33` (the `factors` subquery, `WHERE f.set_id = c.set_id`); `tests/integration/test_reader_current_set.py:245-293` (`test_current_is_chosen_by_ended_at_where_started_at_orders_otherwise`), `:47-96` (TC-COMP-170)
- **Claim challenged**: the rework pins the current set's own `factors` against any other set's rows (cycle-2 `description`, and the new test's docstring).
- **Observed evidence**: `review-v2:factors-complete-sets` survives: 38 passed, log `review-v2_factors-complete-sets.log`. It replaces the correlation with `WHERE f.set_id IN (SELECT set_id FROM classification_set WHERE state = 'complete')`, so `jsonb_object_agg` folds every complete set's three rows into one object.
  - TC-COMP-170 has one complete set beside a building set, so the merge changes nothing there.
  - The new `ended_at` case is the only test that asserts `factors` with two complete sets. It inserts B first and the current set A last. So the duplicate keys resolve to A's values, as the coder's own `red_evidence` describes for `factors-any-set`.
  - `test_latest_complete_set_by_ended_at_is_current` also has two complete sets, but they have identical factor rows and it asserts no `factors`.
- **Expected evidence/behavior**: T013 specifies the subquery `WHERE f.set_id = c.set_id`. Design 2.3 and 2.4 give `CurrentSet.factors` as the current set's own. DAC-E3-S1-6 requires each value to be that set's stored row.
- **Impact**: once two complete sets exist, which is every day after the second classification, such a regression shows whichever complete set's rows the aggregate reads last. That is usually the newest one inserted, and usually the current set. It need not be, once rows are rewritten or the planner reads them another way. Those counts drive *{n} qualified, 30 needed* and whether a factor is ranked. Late scope: the production line is unchanged since v1, which could have run this mutant, so this is a warning, not a blocker.
- **Required remediation**: Non-blocking. In a test with two or more complete sets holding different factor rows, where the current set is neither the first nor the last inserted, assert the current set's `factors` exactly. A third set, or a second test that inserts in the opposite order, would do it. `review-v2:factors-complete-sets` should be killed.

### IR-002 — Several `later` candidates are ordered alike by every tried key

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-1, AC-20
- **Tasks**: T011, T013
- **Files**: `src/factorflow/classification/sql/current_set.sql:17` (`later`: `ORDER BY s.started_at DESC`); `tests/integration/test_reader_current_set.py:367-398` (`test_most_recent_non_complete_set_is_later_while_none_is_complete`)
- **Claim challenged**: T011 pins `later` as the most recently started of several non-complete sets, "so a later change is deliberate".
- **Observed evidence**: two mutants survive, 38 passed each:
  - `review-v2:later-by-ended-at` orders `later` by `s.ended_at DESC`, which in PostgreSQL puts nulls first.
  - `review-v2:later-by-run-start` orders it by `r.started_at DESC`.

  T011 is the only test with more than one `later` candidate. Its pair is a failed set started at `T0+1h` (run `T0`, ended `T0+2h`) and a building set started at `T0+1d+1h` (run `T0+1d`, no end). Every one of the three keys picks the building set.
- **Expected evidence/behavior**: Design 2.4 fixes `ORDER BY s.started_at DESC LIMIT 1`. T013 says to keep it "exactly as designed". DEC-0126 (owner `upheld`) settles `later` as the most recent set by that statement, and T011 calls it "the more recently started one".
- **Impact**: the two keys diverge from the set's start only when two candidates' start order differs from their end order, or from their runs' start order. The single-`building` index and the scheduler's oldest-first claim (scheduler design 2.4) make that unlikely with the engine as built. The rule is still the contract's. It is the seam E3-S2, E3-S5 and the shell capability read, and a change of key would pass every test. Late scope: the production line is unchanged since v1.
- **Required remediation**: Non-blocking. Seed two `later` candidates whose set start order differs from their end order (for example, a building set started before a failed one), and two whose runs started in the opposite order to the sets. Assert `later` is the most recently started set in each. Both mutants should be killed.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | TC-COMP-170 asserts `later_block.started_at == building_started` (`test_reader_current_set.py:87`), and TC-COMP-171 asserts `block.started_at == T0 + timedelta(hours=1)` (`:132`). My run kills `review:later-started-is-run-started` and `review:later-started-sql-is-current`, both first failing TC-COMP-170. The coder's log shows TC-COMP-171 and the new T009 case failing them too |
| v1/IR-002 | RESOLVED | TC-COMP-170's building set carries its own `factors` (`3/False, 4/False, 50/True`), and the test asserts the complete set's exactly (`:75-79`). `review:factors-any-set` is killed by TC-COMP-170. A narrower variant, merging complete sets only, survives and is recorded as IR-001 (late) |
| v1/IR-003 | RESOLVED | `test_current_is_chosen_by_ended_at_where_started_at_orders_otherwise` kills `review:current-by-started-at`. `test_set_started_while_current_was_building_is_later` kills `review:later-after-current-end`. T009 is now VERIFIED |

## Scope and Plan Deviations

- No out-of-scope change. The rework touched one test file plus the story's evidence and the plan's frontmatter. `insert_stock_inputs` in `reader_seed.py` is still an unplanned helper inside T002's purpose.
- The new `ended_at` case seeds two complete sets whose windows overlap. The single-`building` index rules that state out for the engine. The docstring says so, and it is the only data on which the designed key can be told from its neighbour. Every `insert_set` the test makes is valid at the database level.
- `CurrentSet`, `LaterSet` and `Summary` docstrings say `later` is "the most recent set … while none is complete", where design 2.3 says "the first". This follows DEC-0126, as v1 recorded.
- The task plan's Validation Plan says no Python build command is defined. `docs/constitution/tech-stack.md` lists `uv build`. I ran it. This is a planning inaccuracy, carried over from v1, and needs no coder action.
- Outside this story: `biome.json` ignores `dist/**` but not `build/**`. So `npm run lint` and `npm run format` fail whenever `uv build` has copied a Vite bundle into `build/lib/`. No story file touches either, and the tracked tree passes. I record it only to explain the component-working-copy result above.
- Bookkeeping: all 19 tasks are checked, and all are verified.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `doc-sync` for CAP-002-E3-S1 with `CAP-002-E3-S1-tasks.md` and this report. IR-001 and IR-002 are optional test-strengthening work. Either can be picked up in a later rework, or by E3-S2, which reuses `read_set_blocks`. Neither blocks.
- **Warnings accepted downstream**: IR-001, IR-002
