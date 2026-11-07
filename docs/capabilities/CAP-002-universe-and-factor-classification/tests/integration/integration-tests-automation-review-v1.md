---
artifact_schema_version: 1
artifact_id: CAP-002-integration-tests-automation-review
artifact_type: automation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests-automation-tasks.md
reviewed_at: 2026-11-06T00:36:44Z
reviewed_state_revision: sha256:0c91b426b4106d6e2c8d5f07dee49e003161a8148fd5e10b923999368b9b2590
verdict: INCONCLUSIVE
review_subjects:
  - artifact_id: CAP-002-integration-tests
    artifact_version: 1
    content_revision: sha256:f68852862887cd7ce28dd06502870dd9e413e41d55fd690323d48f3b007b2df5
  - artifact_id: CAP-002-integration-tests-automation-tasks
    artifact_version: 1
    content_revision: sha256:f1d5d3015a881996d7e40bbf38f2eeca9780e9d9a717c6615c4001b1e9d77bcc
ai_provenance:
  agent_id: automation-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-06T00:36:44Z
  source_artifacts:
    - id: CAP-002-integration-tests
      version: "1"
    - id: CAP-002-integration-tests-automation-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Review: CAP-002-integration-tests — Version 1

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **INCONCLUSIVE** |
| Test cases | 58/58 |
| Automation tasks | 16/17 |
| Required commands | __REQ__ |
| Findings | 5 |

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 4 · **total 5**

The automation itself is in good shape. All 58 cases carry an
`# Implements CAP-002 TC-INT-NNN` marker on a test that asserts the case's
Expected Result. The suite passes when rerun: 922 tests in the integration
scope, the slow 3000-stock latency case (2.07 s from run end to summary), both
new running-application files run twice in one session, lint, format, mypy and
the `not postgres` selection. __FULL__

The gate cannot pass for two reasons, one in the change set and one in this
review:

1. **AR-001 (HIGH).** T011 is checked, but four of the annotations it names
   were never added. Each case still has one marked test that asserts it, so
   no behaviour goes unverified. But the checked task claims annotations that
   do not exist, and task-to-test traceability fails for those four tests.
2. **Build not run.** `uv build`, the tech stack's Build command, was refused
   by the permission system twice: once with `--out-dir` set to the
   scratchpad, and once as the plain call
   `uv build --directory <repo> --offline` outside the sandbox. A sandboxed
   attempt fails because uv cannot reach the package index offline. The
   change set touches only `tests/`, which is outside the packaged `src`
   tree (`[tool.setuptools.packages.find] where = ["src"]`), so a build
   failure is unlikely. It is still a required command, and this review did
   not run it. Under step 5 of the skill and the run's instructions, that
   makes the verdict `INCONCLUSIVE`, not a pass.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md` (CAP-002-integration-tests v1, status `draft`).
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests-automation-tasks.md` (v1, status `draft`; all of T001 to T017 checked).
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2`, branch `usr/alvaro-de-jodra/CAP-002-automation-2`, HEAD `d39bee0`. The plan's header names `usr/alvaro-de-jodra/CAP-002-automation`; the run was directed to this branch.
- **Working tree:** clean. No staged, unstaged or untracked changes before or after validation.
- **Change set:** the two commits that touch `tests/integration` since the plan commit `763517d`: `24c5053` (T003, T007, T011 markers) and `d39bee0` (T001 to T017). They were inventoried with `git diff 46e0219 HEAD -- tests/integration`, where `46e0219` is the merge base with `origin/main`. Commits between them on the branch (`dbbc657`, `fb9b284`, `e1283ed`) belong to the CAP-002 e2e scope and touch no file under `tests/integration`. The only other change `d39bee0` makes is to tick the task plan's checkboxes.
- **Decisions in force:** DEC-0286 (PROVISIONAL, test line items), DEC-0287 (TC-INT-046 precondition), DEC-0292 (the population is dated from the database clock), DEC-0293 (`end_run` through `reader_seed.insert_run`), DEC-0294 (roster sizes for TC-INT-032 and 034). The code follows each one as recorded.

### Changed Files

| File | Change |
| --- | --- |
| `tests/integration/classification_cycle_support.py` | added: `running_product`, `end_run`, `seed_roster`, `wait_for_sets`, `chicago_today`, `last_weekday` (T002) |
| `tests/integration/test_api_classification_summary.py` | modified: TC-INT-035, 050, 051, 057 markers; later-set rows, `failure_reason` and same-keys assertions (T009) |
| `tests/integration/test_api_classifications.py` | modified: markers (T007); seven new tests and added assertions for TC-INT-026, 033, 036, 037, 039, 044, 046, 055, 057, 058 (T008) |
| `tests/integration/test_api_universes.py` | modified: markers (T003); new tests and assertions for TC-INT-001, 003, 004, 005, 007, 009, 010, 012, 013, 014, 019, 020, 021 (T004 to T006) |
| `tests/integration/test_classification_after_build.py` | added: TC-INT-025, 032, 034 over a real `engine.build` (T013) |
| `tests/integration/test_classification_cycle.py` | added: TC-INT-028, 029, 047, 049, 053, 054 (part) through the running application (T012) |
| `tests/integration/test_classification_latency.py` | added: TC-INT-031 slow latency case (T014) |
| `tests/integration/test_engine_currency.py` | modified: TC-INT-034 store-half marker (T011) |
| `tests/integration/test_engine_peer_set.py` | modified: TC-INT-026, 036, 037 engine-half markers (T011) |
| `tests/integration/test_engine_restatement.py` | modified: TC-INT-058 engine-half marker (T011) |
| `tests/integration/test_engine_transaction.py` | modified: TC-INT-047, 049, 052, 054 markers (T011) |
| `tests/integration/test_engine_volume.py` | modified: TC-INT-031 engine-budget marker (T011) |
| `tests/integration/test_research_constraints.py` | modified: TC-INT-030 marker (T011) |
| `tests/integration/test_research_migrations_apply.py` | modified: new TC-INT-024 test (T010) |
| `tests/integration/test_scheduler_claim.py` | modified: TC-INT-028, 029, 030 markers (T011) |
| `tests/integration/test_scheduler_restart.py` | modified: TC-INT-053 store-half marker (T011) |
| `tests/integration/test_universe_filter_snapshot.py` | modified: TC-INT-007 store-half marker (T011) |

## Test Case and Traceability Verification

All test paths are under `tests/integration/`. Every case has at least one test marked `# Implements CAP-002 TC-INT-NNN`. The command `grep -rhoE "Implements CAP-002 TC-INT-0[0-9]{2}" tests | sort -u | wc -l` prints `58`, and a loop over 001 to 058 finds no number missing.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-INT-001 | VERIFIED | `test_api_universes.py::test_create_with_a_current_set_carries_a_classification_cell_per_member`; part `::test_create_by_hand_returns_and_reads_the_replayed_universe` | 30 classified stocks in a complete set. Both the 201 body and the GET carry a three-factor `classified` cell per member. |
| TC-INT-002 | VERIFIED | `test_api_universes.py::test_create_naming_uncovered_symbols_is_refused_whole` | 409 `instrument_not_acquired`, `symbols == ["BBB","ZZZ"]`, `written == (0, 0)` |
| TC-INT-003 | VERIFIED | `test_api_universes.py::test_add_and_remove_keep_the_dated_record` | The GET straight after the add returns AAA and BBB. |
| TC-INT-004 | VERIFIED | `test_api_universes.py::test_adding_an_uncovered_symbol_is_refused_and_membership_is_unchanged` | 409 naming ZZZ. Members and writes are unchanged. |
| TC-INT-005 | VERIFIED | `test_api_universes.py::test_create_from_a_result_saves_the_filter_match_with_provenance` | The pre-POST `GET /api/classifications` symbols and `match_count` equal the members. The re-read members and origin equal the 201 body. |
| TC-INT-006 | VERIFIED | `test_api_universes.py::test_a_newer_complete_set_refuses_the_save` | 409 `classification_set_changed`, nothing written |
| TC-INT-007 | VERIFIED | `test_api_universes.py::test_a_filter_universe_keeps_its_members_when_a_newer_set_matches_differently`; part `test_universe_filter_snapshot.py::test_a_later_set_that_changes_the_matches_leaves_the_members_unchanged` | Under the newer set, the HTTP list returns `["EEE"]`. The universe keeps its saved members and origin set. |
| TC-INT-008 | VERIFIED | `test_api_universes.py::test_a_filter_matching_nothing_is_empty_universe` | 422 `empty_universe`, nothing written |
| TC-INT-009 | VERIFIED | `test_api_universes.py::test_one_stock_in_two_universes_is_listed_in_both_and_in_its_evidence` | Behaviour asserted. Name order is not discriminated (AR-002). |
| TC-INT-010 | VERIFIED | `test_api_universes.py::test_names_are_unique_among_active_universes_after_trimming` | 409, and the active names are exactly `Other, Tech` |
| TC-INT-011 | VERIFIED | `test_api_universes.py::test_rename_keeps_the_id_and_the_history` | Same id. `renamed` is first and the earlier events are unchanged. |
| TC-INT-012 | VERIFIED | same test as TC-INT-010 | The refused universe reads back as `Other`. |
| TC-INT-013 | VERIFIED | `test_api_universes.py::test_retire_keeps_members_and_events_and_refuses_every_write` | 409 `universe_retired`. The name reads back as `Mine`. |
| TC-INT-014 | VERIFIED | same test | The universe is absent from the default list and the only entry of `lifecycle=retired`. Members and events stay readable. |
| TC-INT-015 | VERIFIED | same test | The second DELETE returns 409 `universe_retired`. |
| TC-INT-016 | VERIFIED | `test_api_universes.py::test_add_and_remove_keep_the_dated_record` | `removed_at`; BBB is not a member; both events are listed. |
| TC-INT-017 | VERIFIED | `test_api_universes.py::test_an_empty_create_is_empty_universe_and_writes_nothing` | 422 `empty_universe`; `lifecycle=all` lists only `Kept` |
| TC-INT-018 | VERIFIED | `test_api_universes.py::test_removing_the_sole_member_is_refused_then_retired_refuses_writes` | 409 `last_member`, with AAA still a member |
| TC-INT-019 | VERIFIED | `test_api_universes.py::test_as_of_returns_the_membership_of_each_date` | D1, D2 and D3 return `AAA,BBB`, `AAA` and `AAA,CCC`. Events are dated with the `test_universe_as_of.py` helpers. |
| TC-INT-020 | VERIFIED | `test_api_universes.py::test_as_of_reads_past_membership` | No members, `as_of_before_creation`, and `created_at` equals the creation response |
| TC-INT-021 | VERIFIED | `test_api_universes.py::test_events_list_every_kind_newest_first` | Five events of all four kinds, with `event_id` strictly descending |
| TC-INT-022 | VERIFIED | `test_api_universes.py::test_as_of_reads_past_membership` | 422 `validation_error` for `2026-13-40`. The specification's literal `not-a-date` is not sent (AR-003). |
| TC-INT-023 | VERIFIED | `test_api_universes.py::test_unknown_universes_and_members_are_404` | 404 `universe_not_found` in the envelope |
| TC-INT-024 | VERIFIED | `test_research_migrations_apply.py::test_migrator_applies_0005_and_0006_from_0004_and_reapplies_nothing` | `[5, 6]`, the CAP-001 snapshot unchanged, then `[]` on the second run |
| TC-INT-025 | VERIFIED | `test_classification_after_build.py::test_evidence_lists_the_eight_inputs_from_a_build` | Real `engine.build` over test keys (DEC-0286). Eight `present` inputs grouped by factor, each with value, `as_of` and `known_on`. |
| TC-INT-026 | VERIFIED | `test_api_classifications.py::test_a_stocks_scores_are_the_same_unscoped_and_in_each_universe`; part `test_engine_peer_set.py::test_scores_are_identical_whatever_the_universe_membership` | The three reads carry equal score and percentile. |
| TC-INT-027 | VERIFIED | `test_api_classifications.py::test_the_list_carries_the_set_the_factors_and_string_scores` | `set`, `later`, `match_count`, scores as decimal strings |
| TC-INT-028 | VERIFIED | `test_classification_cycle.py::test_succeeded_and_partial_runs_each_get_a_set_in_ended_at_order`; part `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed` | Runs inserted in reverse `ended_at` order. The sets' `started_at` follow `ended_at`, one per run, both complete. The second store half named by T011 is unmarked (AR-001). |
| TC-INT-029 | VERIFIED | `test_classification_cycle.py::test_failed_cancelled_and_abandoned_runs_get_no_set`; part `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed` | No set over five one-second polls (HTTP), and none in the store |
| TC-INT-030 | VERIFIED | `test_scheduler_claim.py::test_claim_returns_none_when_the_run_acquired_a_set_between_statements`; `test_research_constraints.py::test_a_second_set_for_the_same_run_is_refused` | Annotation only, as planned |
| TC-INT-031 | VERIFIED | `test_classification_latency.py::test_a_3000_stock_run_is_summarised_within_five_minutes_of_its_end`; part `test_engine_volume.py::test_3000_instruments_build_within_the_budget` | Rerun: 2.073 s from run end to the summary (limit 300 s). The volume build alone took 1.461 s. |
| TC-INT-032 | VERIFIED | `test_classification_after_build.py::test_a_missing_value_input_is_named_and_the_other_factors_still_score` | 31-stock roster (DEC-0294). Value `input_missing`, `reason_input == "fcf_yield"`, no score or percentile. Growth and momentum are classified. |
| TC-INT-033 | VERIFIED | `test_api_classifications.py::test_thresholds_and_hide_incomplete_follow_the_documented_rule` | At bound 50: incomplete BBB listed and counted, DDD (percentile 10) excluded, `match_count == 3` |
| TC-INT-034 | VERIFIED | `test_classification_after_build.py::test_a_fundamental_one_day_past_six_months_is_outdated_and_exactly_six_months_is_present`; part `test_engine_currency.py::test_fundamentals_outdated_at_six_months_and_a_day` | AAA's five fundamentals `outdated`, value and growth `input_outdated` naming an input; BBB `present` and classified. The second store half named by T011 is unmarked (AR-001). |
| TC-INT-035 | VERIFIED | `test_api_classification_summary.py::test_the_summary_counts_the_current_stocks`, `::test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count` | Annotation only, as planned |
| TC-INT-036 | VERIFIED | `test_api_classifications.py::test_fewer_than_thirty_qualifying_stocks_show_no_growth_score`; part `test_engine_peer_set.py::test_a_factor_ranks_only_from_thirty_qualifying_stocks` | Seeded rows (the plan's seeded form): every growth cell is `not_enough_stocks` with "29 of 30" and no numbers. The list and the summary both report growth unranked. |
| TC-INT-037 | VERIFIED | `test_api_classifications.py::test_a_retired_stock_is_hidden_unscoped_and_retired_in_its_universe`; part `test_engine_peer_set.py::test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` | RRR is absent unscoped and listed in U as `retired` on all three factors |
| TC-INT-038 | VERIFIED | `test_api_classifications.py::test_compare_reports_unknown_symbols_and_enforces_its_bounds` | `AAA,OLD`: OLD is `not_classified` / `retired` |
| TC-INT-039 | VERIFIED | `test_api_classifications.py::test_a_sorted_list_pages_with_a_stable_match_count` | `value_percentile` desc, pages of 10, 10 and 5 in strict descending order, `match_count == 25` on each page |
| TC-INT-040 | VERIFIED | same compare test | `unknown_symbols == ["NOPE"]` |
| TC-INT-041 | VERIFIED | same compare test | One symbol and seven symbols both return 422 naming `symbols` |
| TC-INT-042 | VERIFIED | `test_api_classifications.py::test_an_altered_cursor_is_invalid_and_one_for_an_older_set_is_stale` | `cursor_invalid`, then `cursor_stale` |
| TC-INT-043 | VERIFIED | `test_api_classifications.py::test_a_universe_scopes_the_list_and_an_unknown_one_is_404` | 404 `universe_not_found` |
| TC-INT-044 | VERIFIED | `test_api_classifications.py::test_the_evidence_shows_inputs_with_their_dates_and_memberships` | Each shown value, `as_of` and `known_on` equals the stored `factor_input` row and the seeded value. Memberships are `["Mine"]`. |
| TC-INT-045 | VERIFIED | same test | 404 `instrument_not_found` |
| TC-INT-046 | VERIFIED | `test_api_classifications.py::test_the_history_lists_three_earlier_complete_sets_newest_first_and_skips_a_failed_one` | DEC-0287: four complete sets plus a failed set holding AAA rows. Three results newest first with the stored scores. The failed and current sets are absent. |
| TC-INT-047 | VERIFIED | `test_classification_cycle.py::test_a_newer_run_leaves_the_earlier_sets_rows_identical`; part `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged` | The S1 snapshot is non-empty and identical after S2. S2 has rows in all three tables. |
| TC-INT-048 | VERIFIED | `test_api_classifications.py::test_the_history_carries_the_stored_restated_flag_and_a_new_stock_has_none`, `::test_the_history_lists_earlier_sets_newest_first_without_the_current_one` | NEW returns an empty `sets` list; NOPE returns 404 |
| TC-INT-049 | VERIFIED | `test_classification_cycle.py::test_a_backfill_after_a_set_changes_only_the_next_set`; part `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged` | The S1 history entry is byte-identical before and after the backfill, dated D. Only the set built after the backfill classifies growth (restated). Every set shares the clock date (DEC-0292), so the classification date cannot show a backdate (AR-004). `::test_backfill_before_the_build_is_seen_by_that_set` is unmarked (AR-001). |
| TC-INT-050 | VERIFIED | `test_api_classification_summary.py::test_a_newer_set_is_carried_as_later_and_equals_the_list_read[building]` | `not_current` is true on both reads. The later set's rows (score 9) are never returned. |
| TC-INT-051 | VERIFIED | same test `[failed]` | `later.failure_reason == "boom"`, the list carries only S1's rows, and the failed set holds rows |
| TC-INT-052 | VERIFIED | `test_engine_transaction.py::test_completing_an_already_failed_set_updates_no_row_and_rolls_back` | Another writer's failure stands; zero rows (also read through a second connection). `::test_set_failed_by_another_writer_mid_build_is_left_untouched` is unmarked (AR-001). |
| TC-INT-053 | VERIFIED | `test_classification_cycle.py::test_an_application_start_fails_a_stale_building_set_and_classifies_the_next_run`; part `test_scheduler_restart.py::test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run` | Read over HTTP: the stale set is `failed` with `INTERRUPTED_REASON`, and the waiting run's set is complete. The store half asserts that this happens before any claim. |
| TC-INT-054 | VERIFIED | `test_engine_transaction.py::test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set`; part `test_classification_cycle.py::test_a_failing_build_is_listed_as_failed_and_leaves_no_rows` | The running product records `RuntimeError: injected failure`, with zero rows in all three tables |
| TC-INT-055 | VERIFIED | `test_api_classifications.py::test_the_sets_list_and_detail_agree` | Newest first across two complete sets. The detail equals the list row, `ended_at` included. |
| TC-INT-056 | VERIFIED | same test | 404 `classification_set_not_found` |
| TC-INT-057 | VERIFIED | `test_api_classifications.py::test_nothing_classified_says_so`; `test_api_classification_summary.py::test_before_any_complete_set_the_summary_says_nothing_is_classified` | `never_classified`, `set`, `later` and `factors` are equal across the list and the summary |
| TC-INT-058 | VERIFIED | `test_api_classifications.py::test_the_restatement_mark_is_on_value_and_growth_in_all_four_reads`; part `test_engine_restatement.py::test_statement_filed_before_first_observation_marks_its_inputs_and_classifications` | List, compare, evidence and history all show `{value: true, growth: true, momentum: false}`. BBB is unmarked. |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | commit `d39bee0` message ("Baseline before edits: 900 passed") | Rerun of the probe prints `7` unresolved keys. The baseline went in the commit message, not the task notes (AR-005). |
| T002 | VERIFIED | `tests/integration/classification_cycle_support.py` | `end_run` uses `insert_run` (DEC-0293) and `seed_roster` dates from the clock (DEC-0292). `wait_for_sets` uses a `time.monotonic` deadline. |
| T003 | VERIFIED | `tests/integration/test_api_universes.py` | Every named marker is present. |
| T004 | VERIFIED | `tests/integration/test_api_universes.py` | TC-INT-001, 003, 004, 005 additions present |
| T005 | VERIFIED | `tests/integration/test_api_universes.py` | TC-INT-007, 009, 010, 012, 013, 014 additions present |
| T006 | VERIFIED | `tests/integration/test_api_universes.py` | Reuses the `test_universe_as_of.py` helpers, as the plan says |
| T007 | VERIFIED | `tests/integration/test_api_classifications.py` | Markers present and docstring updated |
| T008 | VERIFIED | `tests/integration/test_api_classifications.py` | Every named test and assertion present |
| T009 | VERIFIED | `tests/integration/test_api_classification_summary.py` | Markers, later-set rows, `failure_reason` and same-keys assertions |
| T010 | VERIFIED | `tests/integration/test_research_migrations_apply.py` | Present and passing |
| T011 | PARTIAL | `tests/integration/test_engine_*.py`, `test_scheduler_*.py`, `test_research_constraints.py`, `test_universe_filter_snapshot.py` | Four of the named annotations are missing (AR-001). |
| T012 | VERIFIED | `tests/integration/test_classification_cycle.py` | All six parts (a) to (f) |
| T013 | VERIFIED | `tests/integration/test_classification_after_build.py` | Roster sizes per DEC-0294 |
| T014 | VERIFIED | `tests/integration/test_classification_latency.py` | `slow` and `postgres` markers. The elapsed time is printed. |
| T015 | VERIFIED | rerun below | 922 passed; the slow case passed; the marker count is 58 |
| T016 | VERIFIED | rerun below | Both running-application files pass alone and twice in one session (18/18). `pytest-randomly` is not installed, so `-p no:randomly` has no effect. The full suite runs `test_api_universes.py` among the others. |
| T017 | VERIFIED | rerun below | Ruff, format, mypy and `not postgres` are clean. |

## Independent Validation

The working directory is `repos/factorflow-v2/FactorFlow-v2`. Inside the
sandbox, every `uv` call failed with `Failed to initialize cache at
/Users/alvarodejodra/.cache/uv … Operation not permitted (os error 1)`. Each
command was therefore rerun outside the sandbox as one plain call:
`uv run --directory <repo> --offline <command>`.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv run pytest tests/integration -m "postgres and not slow" -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 922 passed, 22 deselected, in 110.48 s. Matches the coder's reported count. |
| `uv run pytest tests/integration/test_classification_latency.py -m slow -q -s` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1 passed; `run end to summarised: 2.073s` |
| `uv run pytest tests/integration/test_engine_volume.py -m slow -q -s` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supporting run for the TC-INT-031 engine half; build took 1.461 s |
| `uv run pytest tests/integration/test_classification_cycle.py ×2 tests/integration/test_classification_after_build.py ×2 --keep-duplicates -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 18 passed (9 tests × 2), T016 isolation |
| `grep -rhoE "Implements CAP-002 TC-INT-0[0-9]{2}" tests \| sort -u \| wc -l` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `58`; no number from 001 to 058 is missing |
| `uv run python -c "from factorflow.classification import line_items; print(len(line_items.unresolved()))"` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `7` (non-zero, as DEC-0286 assumes) |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 285 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 61 source files |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1636 passed, 942 deselected, 1 xfailed |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | __FULLCODE__ | __FULLRES__ | __FULLNOTE__ |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | n/a | NOT-RUN | Both calls outside the sandbox (`uv build --directory <repo> --offline`, and the same with `--out-dir` in the scratchpad) were refused: "Permission to use Bash has been denied." Inside the sandbox it fails with "setuptools was not found in the cache … the network was disabled". |

## Findings

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | HIGH | T011 is checked `[x]`, but four tests it names carry no `# Implements CAP-002 TC-INT-NNN` line: `test_engine_transaction.py::test_set_failed_by_another_writer_mid_build_is_left_untouched` (TC-INT-052), `test_engine_transaction.py::test_backfill_before_the_build_is_seen_by_that_set` (TC-INT-049 part), `test_engine_currency.py::test_fundamentals_present_at_exactly_six_months` (TC-INT-034 part) and `test_scheduler_claim.py::test_qualifying_runs_are_claimed_oldest_first_once_each` (TC-INT-028 part). | The checked task claims work that was not done. The plan's Notes make these "two halves" cases complete only when both halves are traceable. A reader searching for TC-INT-028, 034, 049 or 052 misses one planned test each. The behaviour is still asserted by another marked test, so no case is unverified. | Add the four marker lines beside the existing `# Implements TC-COMP-NNN` lines, as T011 says, with `(part: store half)` where the plan calls it a part. Alternatively, revise T011 through `$automation-planning` to drop them. Do not leave the task checked as written. |
| AR-002 | LOW | `test_api_universes.py::test_one_stock_in_two_universes_is_listed_in_both_and_in_its_evidence` creates U1 before U2 and asserts memberships `["U1","U2"]`. | Name order and creation order coincide, so a regression to creation-order sorting would pass. `stock_memberships.sql` orders by `n.name, u.universe_id`, which the spec requires ("in name order"). | Create the universes against name order (for example U2 first) so that the assertion can tell the two orders apart. |
| AR-003 | LOW | TC-INT-022's step sends `as_of=not-a-date`; `test_as_of_reads_past_membership` sends `2026-13-40`. The task plan records this and leaves the choice to the owner. | The non-date-shaped input the specification names is not exercised. A parser that handled only date-shaped strings would go undetected. | Send `not-a-date`, or add it beside the existing value. |
| AR-004 | LOW | DEC-0292: `seed_roster` and the TC-INT-049 test date their populations from `chicago_today()`, and the loop stamps sets from the database clock. `populate_backdating(classification_date=chicago_today())` is not moved off weekends the way `seed_roster` is. | A run that crosses Chicago midnight between seeding and the claim may compute a different date, and on a weekend the backdating population is dated a Saturday or Sunday. Neither case was exercised here (the run was on a Thursday evening in Chicago). In TC-INT-049 every set shares one date, so "not backdated" rests on the S1 entry being unchanged, not on its date. | Optional: pin the date the loop uses (for example through the `claim_next_set` override, DEC-0125) if these tests ever flake, or record the dependency in the module docstring. |
| AR-005 | LOW | T001 asks for the baseline pass count and the unresolved-key count to be recorded "in the task notes". The plan holds neither. The commit message records the pass count (900), not the key count. | Minor evidence gap. This review reran the key probe (`7`). | Record both in the task plan's notes on the next rework. |

## Previous Review Disposition

Not applicable — initial review.

## Verdict

**Verdict:** INCONCLUSIVE

Every test case is verified, and every rerun command passed. The verdict is
not a pass for two reasons. The tech stack's `uv build` could not be run
(refused by the permission system), and AR-001 is a HIGH finding against a
checked task. Next steps:

- Route AR-001, and the optional AR-002 to AR-005, back to
  `$automation-coding`. If T011 is to change, route it through
  `$automation-planning` first.
- The next review needs `uv build` allowed for this run, so the build can be
  rerun and the gate can close.
