---
artifact_schema_version: 1
artifact_id: CAP-002-integration-tests-automation-review
artifact_type: automation-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests-automation-tasks.md
reviewed_at: 2026-11-08T01:22:03Z
reviewed_state_revision: sha256:7d091c138764d9cbfe850d09f8fa100e893cb74d076d1d3823b203bf14fd854e
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-integration-tests
    artifact_version: 1
    content_revision: sha256:f68852862887cd7ce28dd06502870dd9e413e41d55fd690323d48f3b007b2df5
  - artifact_id: CAP-002-integration-tests-automation-tasks
    artifact_version: 1
    content_revision: sha256:6340bf69a5fb077d91bd1bfebbc0f14936cff956cc11b400206ed3a4a4f80312
ai_provenance:
  agent_id: automation-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T01:22:03Z
  source_artifacts:
    - id: CAP-002-integration-tests
      version: "1"
    - id: CAP-002-integration-tests-automation-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Review: CAP-002-integration-tests — Version 5

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **PASS-WITH-WARNINGS** |
| Test cases | 58/58 |
| Automation tasks | 17/17 |
| Required commands | 9/9 |
| Findings | 1 |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · **total 1**

Version 4 passed with one LOW finding. Pipeline state now marks it stale
("automation code changed after review") because the code fingerprint moved
from `sha256:a0b0c397…` to `sha256:7d091c13…`. The fingerprint hashes every
tracked file outside `docs/` and the root readme. This review supplies
evidence at `7c771fc`.

Three sets of changes landed after version 4 was written (`4290833`):

- **EXP-20261107-2** (owner-approved on its review v1). It touches
  `tests/integration/test_api_universes.py`, which holds 24 TC-INT markers. The
  `client` fixture now replaces the classification loop with
  `_idle_scheduler`, and one guard test is new. No marker and no marked test
  body changed.
- **EXP-20261107-3, release 0.2.0.** This is the version bump in
  `pyproject.toml`, `uv.lock`, `package.json`, `package-lock.json` and
  `README.md`, plus `tests/unit/test_version_agreement.py`. It does not reach
  this scope.
- **Story CAP-002-E2-S10** (B3; DEC-0397, DEC-0398; implementation review v2
  PASS). Momentum is now computed only over a window that a
  `corporate_actions` coverage segment contains. The story changes
  `momentum_inputs.sql` and the shared seeds `engine_support.add_instrument`
  and `engine_proof_support.populate_volume`. Every engine-built TC-INT case
  builds on those seeds. The story also adds non-TC-INT cases to
  `test_engine_inputs_momentum.py` and `test_runner_acquires.py`.

The diff since `4290833` adds or removes no `Implements CAP-002 TC-INT` line,
and no marked test body changed. The seed change keeps every engine-built case
meaningful. Without it, every momentum input those cases build would now be
`missing` with cause `corporate_actions_not_covered`. All nine required
commands passed on a fresh run. The integration scope rose from 930 to 950
passed. The 20 extra tests are S10's 14 momentum cases and 5 runner guard
cases, plus EXP-20261107-2's scheduler guard.

The single LOW finding is version 4's AR-001, carried unchanged. The task plan
is byte-identical to the one version 4 reviewed.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md` (CAP-002-integration-tests v1, status `draft`). Its content revision `sha256:f6885286…` is unchanged since version 1. It names no corporate action, split, dividend or coverage segment, so DEC-0397 changes none of its expected results. Its `source_artifacts` still cite system design v3 and factor-engine v2; see the observations.
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests-automation-tasks.md` (v1, status `draft`, `last_reworked_review: integration-tests-automation-review-v2.md`; T001 to T017 all checked). Its content revision `sha256:6340bf69…` is unchanged since version 3.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2`, the plan's `Component(s)` line (`FactorFlow-v2`). The branch is `usr/alvaro-de-jodra/CAP-002-E2-S10` and HEAD is `7c771fc5500761c585c37810490ece7652b7e630`. The run was directed to this branch, and no branch was switched.
- **Since version 4:** version 4 reviewed `b8ff14b`. Its code is identical to that of `4290833`, the commit that wrote the report (`git diff --stat b8ff14b 4290833 -- . ':!docs'` is empty). `git diff --name-only 4290833 HEAD -- . ':!docs'` lists 11 files. They are the five version manifests and `tests/unit/test_version_agreement.py` (EXP-20261107-3), `tests/integration/test_api_universes.py` (EXP-20261107-2, `0620fbd`), and `src/factorflow/classification/sql/momentum_inputs.sql`, `tests/integration/engine_support.py`, `tests/integration/engine_proof_support.py`, `tests/integration/test_engine_inputs_momentum.py` and `tests/integration/test_runner_acquires.py` (S10: `3e654db`, `3601396`, `cce88c9`).
- **Out of this review's coverage:** the production SQL `src/factorflow/classification/sql/momentum_inputs.sql` belongs to S10, which implementation review v2 covers. This review read its diff only to judge how it affects the TC-INT automation, and does not list it below. The version manifests and `tests/unit/test_version_agreement.py` belong to EXP-20261107-3 and do not touch this scope.
- **Working tree:** `git status --porcelain` is empty before and after validation. `uv build` wrote to the scratchpad with `--out-dir`. The `automation-revision` fingerprint is `sha256:7d091c13…` both before and after the commands.
- **Decisions in force:** DEC-0286 (PROVISIONAL; premise superseded, see AR-001), DEC-0287, DEC-0292 to DEC-0295 as in version 4, and now DEC-0397 (momentum requires corporate-actions coverage of its window) and DEC-0398 (CAP-002 relies on CAP-001's released coverage contract).
- **Prerequisites:** `scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` passed every check. Context freshness was 20 h.

### Changed Files

| File | Change |
| --- | --- |
| `tests/integration/engine_support.py` | modified (S10, `3601396`): new `DEFAULT_CORPORATE_ACTIONS_COVERAGE = (2000-01-01, 2099-12-31)`. `add_instrument` now inserts one `corporate_actions` segment over that range unless `corporate_actions_covered=False`, and commits once after both inserts. Every engine-built TC-INT case reaches it through `engine_inputs_support`, `engine_classify_support`, `engine_restatement_support` or directly: TC-INT-025, 026, 028, 029, 031, 032, 034, 036, 037, 047, 049, 052, 053, 054 and 058. No TC-INT test passes the opt-out. |
| `tests/integration/engine_proof_support.py` | modified (S10, `3601396`): `populate_volume` inserts the same default segment for every instrument in one statement, and its `ANALYZE` now includes `coverage_segment`. The instruments come from `_INSTRUMENTS_SQL`, not `add_instrument`, so no instrument gets two overlapping segments. Through `classification_cycle_support.seed_roster`, this reaches TC-INT-025, 028, 029, 031, 032, 034, 047, 049, 053 and 054. |
| `tests/integration/test_api_universes.py` | modified (EXP-20261107-2, `0620fbd`): the `client` fixture patches `app_module.run_classification_loop` with `api_classification_support._idle_scheduler`, and the new non-TC-INT `test_the_client_runs_no_classification_scheduler` guards that. No TC-INT marker or marked body changed. |
| `tests/integration/test_engine_inputs_momentum.py` | modified (S10, `3e654db`, `cce88c9`): 9 new test functions (14 collected cases) for TC-COMP-381 to 386. Earlier expectations gain `corporate_actions_covered_by`. No CAP-002 TC-INT marker. |
| `tests/integration/test_runner_acquires.py` | modified (S10, `3e654db`): 2 new test functions (5 collected cases) for CAP-002 TC-COMP-387, the coverage contract guard on CAP-001's runner. No CAP-002 TC-INT marker. |

## Test Case and Traceability Verification

All test paths are under `tests/integration/`. The traceability grep prints
`58`, and a loop over 001 to 058 finds no number missing.
`git diff 4290833 HEAD -- tests` adds or removes no line that matches
`Implements CAP-002 TC-INT` or `TC-INT`. Every added marker line is a
TC-COMP marker.

For each case, the note says how the changes since version 4 reach it.
"Seeded API" means the test seeds sets with `reader_seed` or
`api_classification_support` and runs no build. `add_instrument` and
`populate_volume` are not in its path, and neither is the momentum SQL.

How DEC-0397 reaches the engine-built cases: in `momentum_inputs.sql`, a
window is `missing` unless one `corporate_actions` segment satisfies
`covered_from <= S_k session + 1` and `covered_to >= E session`. The default
segment, 2000-01-01 to 2099-12-31, contains every fixture window. Apart from
the segment's own bounds, every literal date in the engine support, engine,
cycle and restart test files lies between 2020 and 2027. Every window that was computed before is
therefore computed now, with the same value. The only difference is the new
`detail.corporate_actions_covered_by` key, and no TC-INT test compares a
momentum `detail` by equality. The seeds are load-bearing. Without the
default segment, every momentum input in these cases would be `missing`, and
every case that asserts momentum `classified` or `present` would fail. Those
cases are TC-INT-025 (eight `present` inputs), 032 ("growth and momentum stay
classified"), 031 (summarised set), 026 and 036 (engine peer sets).

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-INT-001 | VERIFIED | `test_api_universes.py::test_create_with_a_current_set_carries_a_classification_cell_per_member`; part `::test_create_by_hand_returns_and_reads_the_replayed_universe` | `client` fixture now idles the loop (EXP-20261107-2). The test seeds its set, so a live loop was never part of the expected result. Passed. |
| TC-INT-002 | VERIFIED | `test_api_universes.py::test_create_naming_uncovered_symbols_is_refused_whole` | Seeds through `test_universe_create.seed_instrument`, not `add_instrument`, so the universe coverage check (`coverage_check.sql`, any data type) sees the same rows as before. Passed. |
| TC-INT-003 | VERIFIED | `test_api_universes.py::test_add_and_remove_keep_the_dated_record` | As TC-INT-001; passed |
| TC-INT-004 | VERIFIED | `test_api_universes.py::test_adding_an_uncovered_symbol_is_refused_and_membership_is_unchanged` | As TC-INT-002; passed |
| TC-INT-005 | VERIFIED | `test_api_universes.py::test_create_from_a_result_saves_the_filter_match_with_provenance` | As TC-INT-001; passed |
| TC-INT-006 | VERIFIED | `test_api_universes.py::test_a_newer_complete_set_refuses_the_save` | As TC-INT-001; passed |
| TC-INT-007 | VERIFIED | `test_api_universes.py::test_a_filter_universe_keeps_its_members_when_a_newer_set_matches_differently`; part `test_universe_filter_snapshot.py::test_a_later_set_that_changes_the_matches_leaves_the_members_unchanged` | The newer set is seeded (`seed_set`). The idle loop removes the race EXP-20261107-2 fixed, where a live loop could claim the seeded run first. Passed. |
| TC-INT-008 | VERIFIED | `test_api_universes.py::test_a_filter_matching_nothing_is_empty_universe` | As TC-INT-001; passed |
| TC-INT-009 | VERIFIED | `test_api_universes.py::test_one_stock_in_two_universes_is_listed_in_both_and_in_its_evidence` | As TC-INT-001; passed |
| TC-INT-010 | VERIFIED | `test_api_universes.py::test_names_are_unique_among_active_universes_after_trimming` | As TC-INT-001; passed |
| TC-INT-011 | VERIFIED | `test_api_universes.py::test_rename_keeps_the_id_and_the_history` | As TC-INT-001; passed |
| TC-INT-012 | VERIFIED | same test as TC-INT-010 | As TC-INT-001; passed |
| TC-INT-013 | VERIFIED | `test_api_universes.py::test_retire_keeps_members_and_events_and_refuses_every_write` | As TC-INT-001; passed |
| TC-INT-014 | VERIFIED | same test | As TC-INT-001; passed |
| TC-INT-015 | VERIFIED | same test | As TC-INT-001; passed |
| TC-INT-016 | VERIFIED | `test_api_universes.py::test_add_and_remove_keep_the_dated_record` | As TC-INT-001; passed |
| TC-INT-017 | VERIFIED | `test_api_universes.py::test_an_empty_create_is_empty_universe_and_writes_nothing` | As TC-INT-001; passed |
| TC-INT-018 | VERIFIED | `test_api_universes.py::test_removing_the_sole_member_is_refused_then_retired_refuses_writes` | As TC-INT-001; passed |
| TC-INT-019 | VERIFIED | `test_api_universes.py::test_as_of_returns_the_membership_of_each_date` | As TC-INT-001; passed |
| TC-INT-020 | VERIFIED | `test_api_universes.py::test_as_of_reads_past_membership` | As TC-INT-001; passed |
| TC-INT-021 | VERIFIED | `test_api_universes.py::test_events_list_every_kind_newest_first` | As TC-INT-001; passed |
| TC-INT-022 | VERIFIED | `test_api_universes.py::test_as_of_reads_past_membership` | As TC-INT-001; passed |
| TC-INT-023 | VERIFIED | `test_api_universes.py::test_unknown_universes_and_members_are_404` | As TC-INT-001; passed |
| TC-INT-024 | VERIFIED | `test_research_migrations_apply.py::test_migrator_applies_0005_and_0006_from_0004_and_reapplies_nothing` | Unchanged; no migration added. Passed. |
| TC-INT-025 | VERIFIED | `test_classification_after_build.py::test_evidence_lists_the_eight_inputs_from_a_build` | Reached through `add_instrument` and `populate_volume`, and the new SQL. The test still asserts eight `present` inputs, each with value, `as_of` and `known_on`, and all three factors classified. The three momentum inputs are present only because the seeds now record coverage, so this case also tracks the B3 contract from the covered side. Passed in the full suite, in the integration scope and in a targeted rerun. |
| TC-INT-026 | VERIFIED | `test_api_classifications.py::test_a_stocks_scores_are_the_same_unscoped_and_in_each_universe`; part `test_engine_peer_set.py::test_scores_are_identical_whatever_the_universe_membership` | API half: seeded API. Engine half: through `add_instrument`, every instrument covered. Passed. |
| TC-INT-027 | VERIFIED | `test_api_classifications.py::test_the_list_carries_the_set_the_factors_and_string_scores` | Seeded API; passed |
| TC-INT-028 | VERIFIED | `test_classification_cycle.py::test_succeeded_and_partial_runs_each_get_a_set_in_ended_at_order`; part `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed`, `::test_qualifying_runs_are_claimed_oldest_first_once_each` | Reached through `seed_roster` → `populate_volume`; the assertions concern set order and count. Passed. |
| TC-INT-029 | VERIFIED | `test_classification_cycle.py::test_failed_cancelled_and_abandoned_runs_get_no_set`; part `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed` | As TC-INT-028; passed |
| TC-INT-030 | VERIFIED | `test_scheduler_claim.py::test_claim_returns_none_when_the_run_acquired_a_set_between_statements`; `test_research_constraints.py::test_a_second_set_for_the_same_run_is_refused` | `scheduler_support` does not use the changed seeds. Passed. |
| TC-INT-031 | VERIFIED | `test_classification_latency.py::test_a_3000_stock_run_is_summarised_within_five_minutes_of_its_end`; part `test_engine_volume.py::test_3000_instruments_build_within_the_budget` | Reached through `populate_volume` (3000 segments, now analysed) and the new SQL, which adds one lateral `coverage_segment` probe per stock and window plus one aggregate. Rerun: `run end to summarised: 3.061s` (v4: 3.064 s; limit 300 s). The engine-budget half passed in the full suite. |
| TC-INT-032 | VERIFIED | `test_classification_after_build.py::test_a_missing_value_input_is_named_and_the_other_factors_still_score` | Reached through `populate_volume`. The victim keeps its coverage, so momentum stays classified, and `fcf_yield` is still the only missing input (value `input_missing`, `reason_input == "fcf_yield"`). Passed. |
| TC-INT-033 | VERIFIED | `test_api_classifications.py::test_thresholds_and_hide_incomplete_follow_the_documented_rule` | Seeded API; passed |
| TC-INT-034 | VERIFIED | `test_classification_after_build.py::test_a_fundamental_one_day_past_six_months_is_outdated_and_exactly_six_months_is_present`; part `test_engine_currency.py::test_fundamentals_outdated_at_six_months_and_a_day`, `::test_fundamentals_present_at_exactly_six_months` | Reached through `add_instrument`. Coverage does not affect value or growth (design 2.4; TC-COMP-386, `test_value_and_growth_inputs_do_not_depend_on_corporate_actions_coverage`). The outdated and present assertions are unchanged and passed. |
| TC-INT-035 | VERIFIED | `test_api_classification_summary.py::test_the_summary_counts_the_current_stocks`, `::test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count` | Seeded API; passed |
| TC-INT-036 | VERIFIED | `test_api_classifications.py::test_fewer_than_thirty_qualifying_stocks_show_no_growth_score`; part `test_engine_peer_set.py::test_a_factor_ranks_only_from_thirty_qualifying_stocks` | Engine half through `add_instrument`; passed |
| TC-INT-037 | VERIFIED | `test_api_classifications.py::test_a_retired_stock_is_hidden_unscoped_and_retired_in_its_universe`; part `test_engine_peer_set.py::test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` | A retired `add_instrument` now carries a segment too. The case asserts that a retired stock is in no peer set and is `retired` on every factor, and the segment does not change that lifecycle rule. Passed. |
| TC-INT-038 | VERIFIED | `test_api_classifications.py::test_compare_reports_unknown_symbols_and_enforces_its_bounds` | Seeded API; passed |
| TC-INT-039 | VERIFIED | `test_api_classifications.py::test_a_sorted_list_pages_with_a_stable_match_count` | Seeded API; passed |
| TC-INT-040 | VERIFIED | same compare test | Seeded API; passed |
| TC-INT-041 | VERIFIED | same compare test | Seeded API; passed |
| TC-INT-042 | VERIFIED | `test_api_classifications.py::test_an_altered_cursor_is_invalid_and_one_for_an_older_set_is_stale` | Seeded API; passed |
| TC-INT-043 | VERIFIED | `test_api_classifications.py::test_a_universe_scopes_the_list_and_an_unknown_one_is_404` | Seeded API; passed |
| TC-INT-044 | VERIFIED | `test_api_classifications.py::test_the_evidence_shows_inputs_with_their_dates_and_memberships` | Seeded API: its inputs come from `reader_seed`, not from a build, so the new `corporate_actions_covered_by` detail key never reaches it. Passed. |
| TC-INT-045 | VERIFIED | same test | Seeded API; passed |
| TC-INT-046 | VERIFIED | `test_api_classifications.py::test_the_history_lists_the_earlier_complete_sets_newest_first_and_skips_a_failed_one` | Seeded API; still checked against DEC-0287 (two results). Passed. |
| TC-INT-047 | VERIFIED | `test_classification_cycle.py::test_a_newer_run_leaves_the_earlier_sets_rows_identical`; part `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged` | Reached through the shared seeds. The assertions compare row snapshots of one set across a later build. The snapshot now holds `corporate_actions_covered_by` and stays identical. Passed. |
| TC-INT-048 | VERIFIED | `test_api_classifications.py::test_the_history_carries_the_stored_restated_flag_and_a_new_stock_has_none`, `::test_the_history_lists_earlier_sets_newest_first_without_the_current_one` | Seeded API; passed |
| TC-INT-049 | VERIFIED | `test_classification_cycle.py::test_a_backfill_after_a_set_changes_only_the_next_set`; part `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged`, `::test_backfill_before_the_build_is_seen_by_that_set` | Reached through the shared seeds; passed |
| TC-INT-050 | VERIFIED | `test_api_classification_summary.py::test_a_newer_set_is_carried_as_later_and_equals_the_list_read[building]` | Seeded API; passed |
| TC-INT-051 | VERIFIED | same test `[failed]` | Seeded API; passed |
| TC-INT-052 | VERIFIED | `test_engine_transaction.py::test_completing_an_already_failed_set_updates_no_row_and_rolls_back`, `::test_set_failed_by_another_writer_mid_build_is_left_untouched` | Reached through `add_instrument`; passed |
| TC-INT-053 | VERIFIED | `test_classification_cycle.py::test_an_application_start_fails_a_stale_building_set_and_classifies_the_next_run`; part `test_scheduler_restart.py::test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run` | Reached through the shared seeds; passed |
| TC-INT-054 | VERIFIED | `test_engine_transaction.py::test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set`; part `test_classification_cycle.py::test_a_failing_build_is_listed_as_failed_and_leaves_no_rows` | Reached through the shared seeds; passed |
| TC-INT-055 | VERIFIED | `test_api_classifications.py::test_the_sets_list_and_detail_agree` | Seeded API; passed |
| TC-INT-056 | VERIFIED | same test | Seeded API; passed |
| TC-INT-057 | VERIFIED | `test_api_classifications.py::test_nothing_classified_says_so`; `test_api_classification_summary.py::test_before_any_complete_set_the_summary_says_nothing_is_classified` | Seeded API; passed |
| TC-INT-058 | VERIFIED | `test_api_classifications.py::test_the_restatement_mark_is_on_value_and_growth_in_all_four_reads`; part `test_engine_restatement.py::test_statement_filed_before_first_observation_marks_its_inputs_and_classifications` | Engine half through `add_instrument`. The restatement mark is on value and growth only, and coverage does not touch those. Passed. |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | commit `d39bee0` message; task plan Notes | Historical baseline, as in version 4. The unresolved-key probe still prints `0`, not the plan's `7` (AR-001). |
| T002 | VERIFIED | `tests/integration/classification_cycle_support.py` | Unchanged. `seed_roster` still calls `populate_volume`, which now also records coverage; the task's contract (seed a roster, return ids and date) holds. |
| T003 | VERIFIED | `tests/integration/test_api_universes.py` | Markers unchanged |
| T004 | VERIFIED | `tests/integration/test_api_universes.py` | Test bodies unchanged |
| T005 | VERIFIED | `tests/integration/test_api_universes.py` | Test bodies unchanged |
| T006 | VERIFIED | `tests/integration/test_api_universes.py` | Test bodies unchanged |
| T007 | VERIFIED | `tests/integration/test_api_classifications.py` | Unchanged |
| T008 | VERIFIED | `tests/integration/test_api_classifications.py` | Unchanged |
| T009 | VERIFIED | `tests/integration/test_api_classification_summary.py` | Unchanged |
| T010 | VERIFIED | `tests/integration/test_research_migrations_apply.py` | Unchanged |
| T011 | VERIFIED | `tests/integration/test_engine_*.py`, `test_scheduler_*.py`, `test_research_constraints.py`, `test_universe_filter_snapshot.py` | All eighteen markers T011 names are present and unchanged in text. `test_engine_inputs_momentum.py` holds none of them. |
| T012 | VERIFIED | `tests/integration/test_classification_cycle.py` | Unchanged |
| T013 | VERIFIED | `tests/integration/test_classification_after_build.py` | Unchanged. Its docstring (test keys, DEC-0286) is still true. |
| T014 | VERIFIED | `tests/integration/test_classification_latency.py` | Unchanged; slow case rerun at 3.061 s |
| T015 | VERIFIED | rerun below | 950 passed (930 plus the 20 non-TC-INT tests named above); the slow case passed; the marker count is 58 |
| T016 | VERIFIED | rerun below | The files that build through the changed seeds, and `test_api_universes.py`, passed in three separate sessions: the full suite, the integration scope, and a targeted rerun with `-p no:randomly`. |
| T017 | VERIFIED | rerun below | Ruff, format, mypy and `not postgres` are clean. |

## Independent Validation

The working directory is `repos/factorflow-v2/FactorFlow-v2`. Inside the
sandbox, `uv` could not open its cache ("Failed to initialize cache at
`/Users/alvarodejodra/.cache/uv` … Operation not permitted"). Every `uv`
command therefore ran outside the sandbox as one plain call, with the
directory and offline mode as options (`uv run --directory <repo> --offline
…`). `-p no:cacheprovider` was added to pytest calls only so the review wrote
no `.pytest_cache`. Docker was running. The tests started their own
testcontainers. No production container or port (8000, 5432) was touched.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv build` (`--out-dir <scratchpad>/dist`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built `factorflow-0.2.0.tar.gz` and `factorflow-0.2.0-py3-none-any.whl` |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 2629 passed, 2 warnings (third-party deprecations), in 467.67 s. Includes `postgres` and `slow`. No skip or xfail. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1659 passed, 970 deselected (v4: 1658; `test_version_agreement.py` is new) |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 285 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 61 source files |
| `uv run pytest tests/integration -m "postgres and not slow" -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 950 passed, 22 deselected, in 126.24 s |
| `uv run pytest tests/integration/test_classification_latency.py -m slow -q -s` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1 passed; `run end to summarised: 3.061s` |
| `grep -rhoE "Implements CAP-002 TC-INT-0[0-9]{2}" tests \| sort -u \| wc -l` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `58`; no number from 001 to 058 is missing |
| `uv run pytest -p no:randomly -q` over `test_classification_after_build.py`, `test_classification_cycle.py`, `test_engine_currency.py`, `test_engine_restatement.py`, `test_engine_transaction.py`, `test_engine_peer_set.py`, `test_scheduler_restart.py`, `test_api_universes.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supporting (T016): 113 passed in 32.16 s, a separate session in file order |
| `uv run pytest --collect-only -q` over the three changed test files | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supporting: confirms the 20 new collected cases (14 momentum, 5 runner, 1 universes guard) |
| `git diff 4290833 HEAD -- tests \| grep -E "^[+-].*(Implements\|TC-INT)"` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supporting: the matches are 11 added TC-COMP-381 to 387 markers. No line matches `TC-INT`. |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | n/a | NOT-RUN | Not validation. It would rewrite `.venv`, which a read-only review does not do. The task plan's Validation Plan lists only the Python commands. |

## Findings

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | LOW | Carried from version 4, unchanged. The task plan's content revision is the same as in version 4. The Summary's DEC-0286 bullet still says every payload key "is still `[REQUIRES INPUT]`". T001 still expects the probe to print a non-zero count, and the Notes still record `7`. At `7c771fc`, `line_items.py` binds all seven keys (DEC-0295) and the probe prints `0`. | No test is wrong, and the plan's prediction "when the keys resolve, no integration test needs changing" still holds. But the plan misstates the repository, and a later reader rerunning T001's probe gets `0` against a recorded `7`. | At the plan's next revision (`$automation-coding` or `$automation-planning`), record that DEC-0295 bound the keys and that the `7` is historical. Keep `install_test_line_items` as the design section 7 seam. The owner disposes DEC-0286 as superseded in premise. No test or code change is required. |

Observations, none a finding:

- **B3 at integration level.** No TC-INT case exercises an uncovered window. Every engine-built case seeds the default segment, so the integration suite proves only the covered side of DEC-0397. That follows the coverage matrix. `DAC-E2-13` and `DAC-E2-S10-1` to `-7` map to TC-COMP-381 to 387, with no TC-INT or TC-E2E column. The uncovered side and the runner's coverage contract are therefore proven only by component tests, all of which passed here. Adding an integration case for the uncovered side, for example a built set read through the evidence API, would be `$test-design`'s call, not automation drift.
- **Seed range.** `DEFAULT_CORPORATE_ACTIONS_COVERAGE` (2000 to 2099) is wider than any real acquisition records, which is the history depth to the run date (`runner.py:330`). It contains every fixture window by construction. The engine-built TC-INT cases therefore no longer show what coverage a real acquisition writes. A regression in the runner's coverage write would pass every TC-INT case and fail TC-COMP-387 (`test_runner_acquires.py`).
- **Specification citations.** The specification's `source_artifacts` cite system design v3 and factor-engine v2, while v5 and v4 are now owner-approved (`d85ed60`). No TC-INT expected result depends on what changed. Refreshing the citation is `$test-design`'s call.
- Carried from versions 3 and 4: the plan's `Branch:` header still names `usr/alvaro-de-jodra/CAP-002-automation`. The specification's TC-INT-046 still reads "three results", while the test asserts two, per DEC-0287.

## Previous Review Disposition

| Prior Finding | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| v4 AR-001 | LOW | Still open, carried as AR-001 | The task plan is byte-identical (`sha256:6340bf69…`), so the drift remains. The automation does not depend on it. |
| v4 observation: specification cites design v3 / factor-engine v2 | — | Still open; citations now two revisions behind | Carried above |
| v4 observation: no TC-INT case builds from real Massive keys | — | Unchanged | The e2e stub covers the real keys; outside this scope |
| v3/v4 observations: plan `Branch:` header, TC-INT-046 wording | — | Still open, unchanged | Carried above |

The staleness pipeline state reported is resolved by this review. The
fingerprint moved from version 4's `sha256:a0b0c397…` to
`sha256:7d091c13…`. Within this scope, that move is the five test files in
Changed Files plus the momentum SQL they exercise. Every TC-INT case passes
against them.

## Verdict

**Verdict:** PASS-WITH-WARNINGS

All 58 cases and 17 tasks are verified, with bidirectional traceability, at
`7c771fc`. All nine required commands passed on a fresh run. No TC-INT marker
or marked test body changed. The S10 seed change keeps every engine-built case
on the covered side of DEC-0397, so their momentum assertions still hold. The
EXP-20261107-2 fixture change only removes a scheduler race from seeded API
tests. The single LOW finding is plan drift carried from version 4 and needs
no code change. Proceed to the final completion check.
