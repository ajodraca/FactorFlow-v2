---
artifact_schema_version: 1
artifact_id: CAP-002-integration-tests-automation-review
artifact_type: automation-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests-automation-tasks.md
reviewed_at: 2026-11-07T05:12:48Z
reviewed_state_revision: sha256:a0b0c3979ba271e608544b8a2e8faf81dd7a48c95d280e337c8b0ff090d9659f
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
  tool_version: "unknown"
  timestamp: 2026-11-07T05:12:48Z
  source_artifacts:
    - id: CAP-002-integration-tests
      version: "1"
    - id: CAP-002-integration-tests-automation-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Review: CAP-002-integration-tests — Version 4

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **PASS-WITH-WARNINGS** |
| Test cases | 58/58 |
| Automation tasks | 17/17 |
| Required commands | 9/9 |
| Findings | 1 |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · **total 1**

Version 3 passed at `712952e` with no findings. Pipeline state now marks it
stale ("automation code changed after review") because the branch has gained
three sets of changes. This review supplies evidence at `b8ff14b`.

Two of those changes do not reach this scope. The e2e rework and e2e stub task
T014 touch only `tests/e2e/`, `tests/unit/`, `scripts/run-e2e-server.sh`,
`biome.json` and `tsconfig.e2e.json`. The third, expedited change
EXP-20261107-1 (DEC-0295, owner-approved), does reach it. It changes
`src/factorflow/classification/` and six files under `tests/integration/`.
Two of those files hold CAP-002 TC-INT markers, and two are support modules
that eleven other TC-INT cases build on.

No `# Implements CAP-002 TC-INT-NNN` line changed and no marked test body
changed. The marked tests that run a real build now run against the new SQL
and the reworked fixtures, and all of them pass. All nine required commands
passed on a fresh run. The integration scope rose from 922 to 930 passed, and
the extra eight are EXP-20261107-1's new engine cases.

The one finding is LOW. The task plan still says every payload key is
`[REQUIRES INPUT]` and that the T001 probe prints `7`. DEC-0295 bound the
keys, and the probe now prints `0`. The automation does not depend on that
claim.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md` (CAP-002-integration-tests v1, status `draft`). Its content revision `sha256:f6885286…` is unchanged since version 1. It names no payload key, statement type or share source, so DEC-0295 changes none of its expected results. Its `source_artifacts` still cite system design v3 and factor-engine v2, but the owner has since re-approved v4 and v3 (see Findings, observations).
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests-automation-tasks.md` (v1, status `draft`, `last_reworked_review: integration-tests-automation-review-v2.md`; T001 to T017 all checked). Its content revision `sha256:6340bf69…` is unchanged since version 3.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2`, branch `usr/alvaro-de-jodra/CAP-002-automation-rework`, HEAD `b8ff14b`. The run was directed to this branch, as in versions 2 and 3.
- **Since version 3:** version 3 reviewed `712952e`. `git log 712952e..HEAD -- tests/integration src` lists exactly two commits: `ae525ff` (feat, EXP-20261107-1) and `e39341d` (its review v1 rework test). `git diff 712952e HEAD -- tests/integration` covers six files, with 259 insertions and 74 deletions. The other commits on the branch are e2e (`c15c923`, `9d93e3b`, `b8ff14b` and the e2e plan and reviews), specification and design documents, the EXP record and reviews, and the reference doc sync.
- **Out of this review's coverage:** `src/factorflow/classification/line_items.py`, `src/factorflow/classification/engine.py` and `src/factorflow/classification/sql/value_inputs.sql` are production code. EXP-20261107-1 review v2 (PASS-WITH-WARNINGS, owner-approved in `46b97f0`) covers them. This review read their diff only to judge how they affect the TC-INT automation, and does not list them below. `tests/e2e/`, `tests/unit/` and the e2e scripts belong to the e2e specification's review.
- **Working tree:** apart from one untracked file, `git status --porcelain` is empty before and after validation. That file is `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-review-v5.md`, which a concurrent e2e reviewer is writing. It is documentation, which the fingerprint excludes, and it is outside this scope. `uv build` wrote its artefacts to the scratchpad with `--out-dir`. Its `src/factorflow.egg-info` is ignored (`.gitignore:4`). The `automation-revision` fingerprint is `sha256:a0b0c397…` both before and after the commands.
- **Decisions in force:** DEC-0286 (PROVISIONAL; its premise is now superseded, see AR-001), DEC-0287 (owner ruling on TC-INT-046), DEC-0292, DEC-0293, DEC-0294, and the new DEC-0295 (owner, Massive payload keys; shares from the most recent income statement; capex by magnitude; book equity less preferred stock).

### Changed Files

| File | Change |
| --- | --- |
| `tests/integration/engine_inputs_support.py` | modified (`ae525ff`): `install_test_line_items` now builds each test item with the new `fixture_line_item`, which keeps production's statement type, sign, `magnitude` and `less_key` (as `TEST_LESS_KEY`) and swaps only the payload key. It drops the fixture-only `_TEST_SIGNS`. TC-INT-025, 028, 029, 031, 032, 034, 047, 049, 052, 053, 054 and 058 build through this helper. |
| `tests/integration/engine_proof_support.py` | modified (`ae525ff`): `populate_volume` writes shares outstanding on the income statement instead of the balance sheet, as DEC-0295 binds it. TC-INT-025, 028, 029, 031, 032, 034, 047, 049, 053 and 054 seed their rosters through it. |
| `tests/integration/test_engine_currency.py` | modified (`ae525ff`, `e39341d`): `test_mixed_statement_input_is_dated_by_its_earliest_latest_period` is re-dated for shares from the income statement, and `test_an_old_income_statement_dates_every_value_input` is new. The two TC-INT-034 (store half) tests at lines 96 and 122 and their markers are unchanged. |
| `tests/integration/test_engine_inputs_fundamentals.py` | modified (`ae525ff`, `e39341d`): expectations follow the shares move; `unresolve_all` restores `REQUIRES_INPUT` where a test needs it; seven DEC-0295 cases are added (shares never summed, no income statement, capex magnitude, book equity less preferred ×3, unreadable preferred). No CAP-002 TC-INT marker. |
| `tests/integration/test_engine_inputs_momentum.py` | modified (`ae525ff`): the unresolved-keys case now unresolves the keys itself. No CAP-002 TC-INT marker. |
| `tests/integration/test_engine_restatement.py` | modified (`ae525ff`): two non-TC-INT tests follow the statements each value input now reads. The TC-INT-058 (engine half) test at line 148 and its marker are unchanged. |

## Test Case and Traceability Verification

All test paths are under `tests/integration/`. For the 46 cases whose files
and helpers are unchanged since `712952e`, the evidence below is version 3's,
re-confirmed by grep of the marker and by a passing run at `b8ff14b`. The
twelve cases that build through a changed helper were read again against the
new fixtures and SQL; their notes say what was checked. The traceability grep
prints `58`, and a loop over 001 to 058 finds no number missing. The diff
since `712952e` adds or removes no line that matches `Implements` or
`TC-INT`.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-INT-001 | VERIFIED | `test_api_universes.py::test_create_with_a_current_set_carries_a_classification_cell_per_member`; part `::test_create_by_hand_returns_and_reads_the_replayed_universe` | Unchanged since v3; passed |
| TC-INT-002 | VERIFIED | `test_api_universes.py::test_create_naming_uncovered_symbols_is_refused_whole` | Unchanged since v3; passed |
| TC-INT-003 | VERIFIED | `test_api_universes.py::test_add_and_remove_keep_the_dated_record` | Unchanged since v3; passed |
| TC-INT-004 | VERIFIED | `test_api_universes.py::test_adding_an_uncovered_symbol_is_refused_and_membership_is_unchanged` | Unchanged since v3; passed |
| TC-INT-005 | VERIFIED | `test_api_universes.py::test_create_from_a_result_saves_the_filter_match_with_provenance` | Unchanged since v3; passed |
| TC-INT-006 | VERIFIED | `test_api_universes.py::test_a_newer_complete_set_refuses_the_save` | Unchanged since v3; passed |
| TC-INT-007 | VERIFIED | `test_api_universes.py::test_a_filter_universe_keeps_its_members_when_a_newer_set_matches_differently`; part `test_universe_filter_snapshot.py::test_a_later_set_that_changes_the_matches_leaves_the_members_unchanged` | Unchanged since v3; passed |
| TC-INT-008 | VERIFIED | `test_api_universes.py::test_a_filter_matching_nothing_is_empty_universe` | Unchanged since v3; passed |
| TC-INT-009 | VERIFIED | `test_api_universes.py::test_one_stock_in_two_universes_is_listed_in_both_and_in_its_evidence` | Unchanged since v3; passed |
| TC-INT-010 | VERIFIED | `test_api_universes.py::test_names_are_unique_among_active_universes_after_trimming` | Unchanged since v3; passed |
| TC-INT-011 | VERIFIED | `test_api_universes.py::test_rename_keeps_the_id_and_the_history` | Unchanged since v3; passed |
| TC-INT-012 | VERIFIED | same test as TC-INT-010 | Unchanged since v3; passed |
| TC-INT-013 | VERIFIED | `test_api_universes.py::test_retire_keeps_members_and_events_and_refuses_every_write` | Unchanged since v3; passed |
| TC-INT-014 | VERIFIED | same test | Unchanged since v3; passed |
| TC-INT-015 | VERIFIED | same test | Unchanged since v3; passed |
| TC-INT-016 | VERIFIED | `test_api_universes.py::test_add_and_remove_keep_the_dated_record` | Unchanged since v3; passed |
| TC-INT-017 | VERIFIED | `test_api_universes.py::test_an_empty_create_is_empty_universe_and_writes_nothing` | Unchanged since v3; passed |
| TC-INT-018 | VERIFIED | `test_api_universes.py::test_removing_the_sole_member_is_refused_then_retired_refuses_writes` | Unchanged since v3; passed |
| TC-INT-019 | VERIFIED | `test_api_universes.py::test_as_of_returns_the_membership_of_each_date` | Unchanged since v3; passed |
| TC-INT-020 | VERIFIED | `test_api_universes.py::test_as_of_reads_past_membership` | Unchanged since v3; passed |
| TC-INT-021 | VERIFIED | `test_api_universes.py::test_events_list_every_kind_newest_first` | Unchanged since v3; passed |
| TC-INT-022 | VERIFIED | `test_api_universes.py::test_as_of_reads_past_membership` | Unchanged since v3; passed |
| TC-INT-023 | VERIFIED | `test_api_universes.py::test_unknown_universes_and_members_are_404` | Unchanged since v3; passed |
| TC-INT-024 | VERIFIED | `test_research_migrations_apply.py::test_migrator_applies_0005_and_0006_from_0004_and_reapplies_nothing` | Unchanged since v3; passed |
| TC-INT-025 | VERIFIED | `test_classification_after_build.py::test_evidence_lists_the_eight_inputs_from_a_build` | Affected through `populate_volume` and the new SQL. The roster now carries shares on the income statement, and the test still asserts eight `present` inputs with value, `as_of` and `known_on`, and all three factors classified. A fixture that left shares on the balance sheet would now make every value input `periods_missing`, so this test also tracks production's statement types. Passed three times (full suite, integration scope, targeted rerun). |
| TC-INT-026 | VERIFIED | `test_api_classifications.py::test_a_stocks_scores_are_the_same_unscoped_and_in_each_universe`; part `test_engine_peer_set.py::test_scores_are_identical_whatever_the_universe_membership` | Unchanged since v3; passed |
| TC-INT-027 | VERIFIED | `test_api_classifications.py::test_the_list_carries_the_set_the_factors_and_string_scores` | Unchanged since v3; passed |
| TC-INT-028 | VERIFIED | `test_classification_cycle.py::test_succeeded_and_partial_runs_each_get_a_set_in_ended_at_order`; part `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed`, `::test_qualifying_runs_are_claimed_oldest_first_once_each` | Affected only through `seed_roster` → `populate_volume` and `install_test_line_items`; assertions concern set order and count. Passed. |
| TC-INT-029 | VERIFIED | `test_classification_cycle.py::test_failed_cancelled_and_abandoned_runs_get_no_set`; part `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed` | As TC-INT-028; passed |
| TC-INT-030 | VERIFIED | `test_scheduler_claim.py::test_claim_returns_none_when_the_run_acquired_a_set_between_statements`; `test_research_constraints.py::test_a_second_set_for_the_same_run_is_refused` | Unchanged since v3; passed |
| TC-INT-031 | VERIFIED | `test_classification_latency.py::test_a_3000_stock_run_is_summarised_within_five_minutes_of_its_end`; part `test_engine_volume.py::test_3000_instruments_build_within_the_budget` | Affected through `populate_volume` and the new SQL (an extra `period_rank = 1` income-statement read per value input). Rerun: `run end to summarised: 3.064s` (v3: 2.067 s; limit 300 s). The engine-budget half passed in the full suite. |
| TC-INT-032 | VERIFIED | `test_classification_after_build.py::test_a_missing_value_input_is_named_and_the_other_factors_still_score` | Affected through `populate_volume`. The victim's cash-flow statements are deleted; under DEC-0295 `fcf_yield` reads cash-flow and income statements, so it is still the only missing value input, and value is `input_missing` with `reason_input == "fcf_yield"`. Growth and momentum stay classified. Passed. |
| TC-INT-033 | VERIFIED | `test_api_classifications.py::test_thresholds_and_hide_incomplete_follow_the_documented_rule` | Unchanged since v3; passed |
| TC-INT-034 | VERIFIED | `test_classification_after_build.py::test_a_fundamental_one_day_past_six_months_is_outdated_and_exactly_six_months_is_present`; part `test_engine_currency.py::test_fundamentals_outdated_at_six_months_and_a_day`, `::test_fundamentals_present_at_exactly_six_months` | Affected through `install_test_line_items` and the SQL. `add_stock` writes all three statement types with the same period ends, so the income-statement shares source dates value inputs by the same period end as before. AAA's five fundamentals are `outdated` and value and growth are `input_outdated`; BBB is `present` and classified. The two store-half tests and their markers are unchanged in text and passed. The shares-dating edge DEC-0295 introduced is covered by the new, non-TC-INT `test_an_old_income_statement_dates_every_value_input`. |
| TC-INT-035 | VERIFIED | `test_api_classification_summary.py::test_the_summary_counts_the_current_stocks`, `::test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count` | Unchanged since v3; passed |
| TC-INT-036 | VERIFIED | `test_api_classifications.py::test_fewer_than_thirty_qualifying_stocks_show_no_growth_score`; part `test_engine_peer_set.py::test_a_factor_ranks_only_from_thirty_qualifying_stocks` | Unchanged since v3; passed |
| TC-INT-037 | VERIFIED | `test_api_classifications.py::test_a_retired_stock_is_hidden_unscoped_and_retired_in_its_universe`; part `test_engine_peer_set.py::test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` | Unchanged since v3; passed |
| TC-INT-038 | VERIFIED | `test_api_classifications.py::test_compare_reports_unknown_symbols_and_enforces_its_bounds` | Unchanged since v3; passed |
| TC-INT-039 | VERIFIED | `test_api_classifications.py::test_a_sorted_list_pages_with_a_stable_match_count` | Unchanged since v3; passed |
| TC-INT-040 | VERIFIED | same compare test | Unchanged since v3; passed |
| TC-INT-041 | VERIFIED | same compare test | Unchanged since v3; passed |
| TC-INT-042 | VERIFIED | `test_api_classifications.py::test_an_altered_cursor_is_invalid_and_one_for_an_older_set_is_stale` | Unchanged since v3; passed |
| TC-INT-043 | VERIFIED | `test_api_classifications.py::test_a_universe_scopes_the_list_and_an_unknown_one_is_404` | Unchanged since v3; passed |
| TC-INT-044 | VERIFIED | `test_api_classifications.py::test_the_evidence_shows_inputs_with_their_dates_and_memberships` | Unchanged since v3; passed |
| TC-INT-045 | VERIFIED | same test | Unchanged since v3; passed |
| TC-INT-046 | VERIFIED | `test_api_classifications.py::test_the_history_lists_the_earlier_complete_sets_newest_first_and_skips_a_failed_one` | Unchanged since v3; passed. Still checked against DEC-0287 as the owner ruled it (two results). |
| TC-INT-047 | VERIFIED | `test_classification_cycle.py::test_a_newer_run_leaves_the_earlier_sets_rows_identical`; part `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged` | Affected only through the shared helpers; assertions compare row snapshots. Passed. |
| TC-INT-048 | VERIFIED | `test_api_classifications.py::test_the_history_carries_the_stored_restated_flag_and_a_new_stock_has_none`, `::test_the_history_lists_earlier_sets_newest_first_without_the_current_one` | Unchanged since v3; passed |
| TC-INT-049 | VERIFIED | `test_classification_cycle.py::test_a_backfill_after_a_set_changes_only_the_next_set`; part `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged`, `::test_backfill_before_the_build_is_seen_by_that_set` | Affected only through the shared helpers; passed |
| TC-INT-050 | VERIFIED | `test_api_classification_summary.py::test_a_newer_set_is_carried_as_later_and_equals_the_list_read[building]` | Unchanged since v3; passed |
| TC-INT-051 | VERIFIED | same test `[failed]` | Unchanged since v3; passed |
| TC-INT-052 | VERIFIED | `test_engine_transaction.py::test_completing_an_already_failed_set_updates_no_row_and_rolls_back`, `::test_set_failed_by_another_writer_mid_build_is_left_untouched` | Affected only through `install_test_line_items`; passed |
| TC-INT-053 | VERIFIED | `test_classification_cycle.py::test_an_application_start_fails_a_stale_building_set_and_classifies_the_next_run`; part `test_scheduler_restart.py::test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run` | Affected only through the shared helpers; passed |
| TC-INT-054 | VERIFIED | `test_engine_transaction.py::test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set`; part `test_classification_cycle.py::test_a_failing_build_is_listed_as_failed_and_leaves_no_rows` | Affected only through the shared helpers; passed |
| TC-INT-055 | VERIFIED | `test_api_classifications.py::test_the_sets_list_and_detail_agree` | Unchanged since v3; passed |
| TC-INT-056 | VERIFIED | same test | Unchanged since v3; passed |
| TC-INT-057 | VERIFIED | `test_api_classifications.py::test_nothing_classified_says_so`; `test_api_classification_summary.py::test_before_any_complete_set_the_summary_says_nothing_is_classified` | Unchanged since v3; passed |
| TC-INT-058 | VERIFIED | `test_api_classifications.py::test_the_restatement_mark_is_on_value_and_growth_in_all_four_reads`; part `test_engine_restatement.py::test_statement_filed_before_first_observation_marks_its_inputs_and_classifications` | The engine-half test is unchanged in text. `engine_restatement_support.statement_payload` places each item by `LINE_ITEMS[name].statement_type`, so shares now land on the income statement on their own. Stock A, whose statements of every type are backfilled, still has every fundamental input and both value and growth marked, and B to D none. The two neighbouring tests `ae525ff` edited are not TC-INT tests; their new expectations (`book_to_price` alone reads the balance sheet; every value input lists the income statement) follow DEC-0295. Passed. |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | commit `d39bee0` message; task plan Notes | Historical baseline, satisfied when it ran (900 passed; probe `7`). The probe now prints `0` because DEC-0295 bound the keys. The plan still reads `7` and "non-zero"; see AR-001. |
| T002 | VERIFIED | `tests/integration/classification_cycle_support.py` | Unchanged since v3. Its imports `install_test_line_items` and `populate_volume` changed underneath it and still meet the task. |
| T003 | VERIFIED | `tests/integration/test_api_universes.py` | Unchanged since v3 |
| T004 | VERIFIED | `tests/integration/test_api_universes.py` | Unchanged since v3 |
| T005 | VERIFIED | `tests/integration/test_api_universes.py` | Unchanged since v3 |
| T006 | VERIFIED | `tests/integration/test_api_universes.py` | Unchanged since v3 |
| T007 | VERIFIED | `tests/integration/test_api_classifications.py` | Unchanged since v3 |
| T008 | VERIFIED | `tests/integration/test_api_classifications.py` | Unchanged since v3 |
| T009 | VERIFIED | `tests/integration/test_api_classification_summary.py` | Unchanged since v3 |
| T010 | VERIFIED | `tests/integration/test_research_migrations_apply.py` | Unchanged since v3 |
| T011 | VERIFIED | `tests/integration/test_engine_*.py`, `test_scheduler_*.py`, `test_research_constraints.py`, `test_universe_filter_snapshot.py` | All eighteen markers T011 names are present; the three in `test_engine_currency.py` and `test_engine_restatement.py` are byte-identical to v3. |
| T012 | VERIFIED | `tests/integration/test_classification_cycle.py` | Unchanged since v3 |
| T013 | VERIFIED | `tests/integration/test_classification_after_build.py` | Unchanged since v3. Its docstring ("the line items carry their test keys (DEC-0286)") is still true: `install_test_line_items` swaps only the keys. |
| T014 | VERIFIED | `tests/integration/test_classification_latency.py` | Unchanged since v3; slow case rerun at 3.064 s |
| T015 | VERIFIED | rerun below | 930 passed (922 plus EXP-20261107-1's eight); the slow case passed; the marker count is 58 |
| T016 | VERIFIED | rerun below | The three files that build through the changed helpers or hold changed tests passed in three separate sessions: the full suite, the integration scope and a targeted rerun (56 passed). |
| T017 | VERIFIED | rerun below | Ruff, format, mypy and `not postgres` are clean. |

## Independent Validation

The working directory is `repos/factorflow-v2/FactorFlow-v2`. As in version
3, every `uv` command ran outside the sandbox as one plain call, with the
directory and offline mode as options (`uv run --directory <repo> --offline
…`). `uv build` used `--out-dir <scratchpad>/dist`. Docker was running.
`-p no:cacheprovider` was added to pytest calls only so the review wrote no
`.pytest_cache`; it does not change which tests run.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl` into the scratchpad |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 2608 passed, 2 warnings (third-party deprecations), in 811.07 s. Includes `postgres` and `slow`. No xfail remains: EXP-20261107-1 removed the strict xfail on `test_line_items_resolved.py`. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1658 passed, 950 deselected |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 284 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 61 source files |
| `uv run pytest tests/integration -m "postgres and not slow" -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 930 passed, 22 deselected, in 136.56 s |
| `uv run pytest tests/integration/test_classification_latency.py -m slow -q -s` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1 passed; `run end to summarised: 3.064s` |
| `grep -rhoE "Implements CAP-002 TC-INT-0[0-9]{2}" tests \| sort -u \| wc -l` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `58`; no number from 001 to 058 is missing |
| `uv run pytest tests/integration/test_classification_after_build.py tests/integration/test_engine_currency.py tests/integration/test_engine_restatement.py tests/integration/test_engine_restatement.py tests/integration/test_engine_currency.py tests/integration/test_classification_after_build.py --keep-duplicates -p no:randomly -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supporting (T016, affected files): 56 passed. pytest ran each test once despite `--keep-duplicates`, so this counts as one more session, not a double run. |
| `uv run python -c "from factorflow.classification import line_items; print(len(line_items.unresolved()))"` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supporting (T001): prints `0`, not the plan's `7`. Expected after DEC-0295; see AR-001. |
| `git diff 712952e HEAD -- tests \| grep -E "^[+-].*(Implements\|TC-INT)"` | `repos/factorflow-v2/FactorFlow-v2` | 1 | PASS | Supporting: no marker line added or removed since v3 (grep exit 1 is "no match") |
| `uv sync --all-extras`, `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | n/a | NOT-RUN | Not required here. The task plan's Validation Plan lists only the Python commands, and this scope's change set has no frontend file. `uv sync` would rewrite `.venv`, which a read-only review does not do. The e2e suite belongs to the concurrent e2e review. |

## Findings

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | LOW | Task plan, Summary DEC-0286 bullet: "Every payload key in `src/factorflow/classification/line_items.py` is still `[REQUIRES INPUT]`". T001: confirm the probe "prints the unresolved count the plan assumes (non-zero, DEC-0286)". Notes, T001 baseline: "The unresolved line-item key probe prints `7` (non-zero, as DEC-0286 assumes)". At `b8ff14b`, `line_items.py` binds all seven keys (DEC-0295, `ae525ff`) and the probe prints `0`. DEC-0286 (`status: open`, not owner-reviewed) rests on the same premise. | No test is wrong. The automation follows design section 7 ("fixtures declare their own payload keys"), and that approach holds whether or not production keys are bound. This review confirms the plan's Notes prediction that "when the keys resolve, no integration test needs changing". But the plan now misstates the repository, and a later reader rerunning T001's probe gets `0` against a recorded expectation of non-zero `7`. | At the plan's next revision (`$automation-coding` or `$automation-planning`), record that DEC-0295 bound the keys. Keep `install_test_line_items` as the design section 7 seam, and note that the T001 probe now prints `0`; the `7` is historical. The owner disposes DEC-0286 as superseded in premise when convenient. No test or code change is required. |

Observations, none a finding:

- The test specification's `source_artifacts` cite system design v3 and factor-engine v2. The owner has since re-approved system design v4 and factor-engine v3 (`e0b479d`). No integration case's expected result depends on what changed (keys, shares source, capex sign, preferred deduction), so the specification needs no change for this scope. Refreshing the citation is `$test-design`'s call.
- No TC-INT case builds from the real Massive payload keys: every engine-built case swaps in test keys. The production keys are pinned by unit tests (`tests/unit/test_line_items.py`, `test_line_items_resolved.py`) and the e2e stub (`b8ff14b`), outside this scope. The plan's Notes leave an integration test over the stub provider's real payloads to the owner as optional.
- Carried from v3: the plan's `Branch:` header still names `usr/alvaro-de-jodra/CAP-002-automation`, while the work is on `usr/alvaro-de-jodra/CAP-002-automation-rework`. The specification's TC-INT-046 still reads "three results", while the test asserts two per the owner's DEC-0287 ruling.

## Previous Review Disposition

Version 3 recorded no findings. Its two observations:

- **Plan `Branch:` header (v3 observation): still open, unchanged.** It is carried above as an observation. It is not a finding, because the run was directed to the rework branch.
- **TC-INT-046 "three results" wording (v3 observation): still open, unchanged.** The owner left it for the specification's next revision. The test still asserts the owner's two-result form and passed.

The staleness pipeline state reported is resolved by this review. The
fingerprint moved from v3's `sha256:78de82d7…` to `sha256:a0b0c397…`. Of the
changes behind that move, those inside this scope are the six files in Changed
Files plus the production SQL and line items they exercise, and every TC-INT
case passes against them.

## Verdict

**Verdict:** PASS-WITH-WARNINGS

All 58 cases and 17 tasks are verified with bidirectional traceability at
`b8ff14b`. All nine required commands passed on a fresh run. EXP-20261107-1
changed no TC-INT marker and no marked test body. The engine-built cases
pass against its new SQL and fixtures, which now follow production's
statement types. The single LOW finding is plan drift and needs no code
change. Proceed to the final completion check.
