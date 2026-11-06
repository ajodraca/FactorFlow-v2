---
artifact_schema_version: 1
artifact_id: CAP-002-integration-tests-automation-review
artifact_type: automation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests-automation-tasks.md
reviewed_at: 2026-11-06T04:22:40Z
reviewed_state_revision: sha256:678f167cf93bd05b216dcb96f5d0809eabf2510f1c08658961a719484d96aff1
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-06T04:22:40Z
  source_artifacts:
    - id: CAP-002-integration-tests
      version: "1"
    - id: CAP-002-integration-tests-automation-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Review: CAP-002-integration-tests — Version 2

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **CHANGES-REQUIRED** |
| Test cases | 58/58 |
| Automation tasks | 16/17 |
| Required commands | 9/9 |
| Findings | 6 |

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 5 · **total 6**

Version 1 was INCONCLUSIVE because `uv build` could not be run. This review
ran it outside the sandbox as one plain call, and it built the sdist and the
wheel. Every other required command also passed on a fresh run: 922 tests in
the integration scope, the slow 3000-stock latency case (3.095 s from run end
to the summary), the full suite (2578 passed, 1 xfailed), the `not postgres`
selection, lint, format and mypy. The evidence is now complete, so the gate
can reach a decision.

The decision is CHANGES-REQUIRED. The branch under review carries no rework of
the version 1 findings. The only change since that review is commit `acb6ee3`,
a flake fix in `test_universe_maintenance.py` that no task names (AR-006).
AR-001 (HIGH) is still open: T011 is checked, but four of the annotations it
names were never added. AR-002 to AR-005 are also still open.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md` (CAP-002-integration-tests v1, status `draft`). Its content revision is unchanged since version 1.
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests-automation-tasks.md` (v1, status `draft`; T001 to T017 all checked). Its content revision is unchanged since version 1.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2`, branch `usr/alvaro-de-jodra/CAP-002-automation-rework`, HEAD `91a34fa`. HEAD is the merge of PR #173 (`usr/alvaro-de-jodra/CAP-002-automation-2`) onto `24c5053`. The plan's header names `usr/alvaro-de-jodra/CAP-002-automation`; the run was directed to the rework branch.
- **Since version 1:** version 1 reviewed `d39bee0`. Since then the branch gained `2edbfcf` (the version 1 report), `acb6ee3` (the flake fix) and the merge `91a34fa`. `git diff 2edbfcf HEAD` changes one file, `tests/integration/test_universe_maintenance.py`, by three lines. No commit addresses AR-001 to AR-005.
- **Working tree:** clean. No staged, unstaged or untracked changes before or after validation (`git status --porcelain` is empty; only ignored build and cache directories exist).
- **Change set:** `git diff 46e0219 HEAD -- tests/integration src`, where `46e0219` is the merge base with `origin/main`. Eighteen files under `tests/integration`, and none under `src`. The e2e-scope commits on the branch (`dbbc657`, `fb9b284`, `e1283ed`) touch no file under `tests/integration`.
- **Decisions in force:** DEC-0286 (PROVISIONAL, test line items), DEC-0287 (TC-INT-046 precondition), DEC-0292 (the population is dated from the database clock), DEC-0293 (`end_run` through `reader_seed.insert_run`), DEC-0294 (roster sizes for TC-INT-032 and 034). The code follows each one as recorded.

### Changed Files

| File | Change |
| --- | --- |
| `tests/integration/classification_cycle_support.py` | added: `running_product`, `end_run`, `seed_roster`, `wait_for_sets`, `chicago_today`, `last_weekday` (T002) |
| `tests/integration/test_api_classification_summary.py` | modified: TC-INT-035, 050, 051, 057 markers; later-set rows, `failure_reason` and same-keys assertions (T009) |
| `tests/integration/test_api_classifications.py` | modified: markers (T007); new tests and added assertions for TC-INT-026, 033, 036, 037, 039, 044, 046, 055, 057, 058 (T008) |
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
| `tests/integration/test_universe_maintenance.py` | modified (`acb6ee3`): `test_a_lower_case_non_member_is_reported_normalised` removes the universe UUID from the message before checking that `ccc` is absent. No task covers it (AR-006). |

## Test Case and Traceability Verification

All test paths are under `tests/integration/`. The code under each case is
the code version 1 reviewed. This review read it again, and the evidence
below was re-derived from the assertions, not copied. Every case has at
least one test marked `# Implements CAP-002 TC-INT-NNN`. The traceability
grep prints `58`, and a loop over 001 to 058 finds no number missing.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-INT-001 | VERIFIED | `test_api_universes.py::test_create_with_a_current_set_carries_a_classification_cell_per_member`; part `::test_create_by_hand_returns_and_reads_the_replayed_universe` | 30 classified stocks. The 201 body and the GET both carry a three-factor `classified` cell for each member. |
| TC-INT-002 | VERIFIED | `test_api_universes.py::test_create_naming_uncovered_symbols_is_refused_whole` | 409 `instrument_not_acquired`; nothing written |
| TC-INT-003 | VERIFIED | `test_api_universes.py::test_add_and_remove_keep_the_dated_record` | The GET straight after the add returns AAA and BBB. |
| TC-INT-004 | VERIFIED | `test_api_universes.py::test_adding_an_uncovered_symbol_is_refused_and_membership_is_unchanged` | 409 naming ZZZ (sent lower case). Members and `written()` are unchanged. |
| TC-INT-005 | VERIFIED | `test_api_universes.py::test_create_from_a_result_saves_the_filter_match_with_provenance` | The pre-POST list symbols and `match_count` equal the members. The re-read members and origin equal the 201 body. |
| TC-INT-006 | VERIFIED | `test_api_universes.py::test_a_newer_complete_set_refuses_the_save` | 409 `classification_set_changed`, nothing written |
| TC-INT-007 | VERIFIED | `test_api_universes.py::test_a_filter_universe_keeps_its_members_when_a_newer_set_matches_differently`; part `test_universe_filter_snapshot.py::test_a_later_set_that_changes_the_matches_leaves_the_members_unchanged` | Under the newer set the list returns `["EEE"]`. The universe keeps its members and its origin set. |
| TC-INT-008 | VERIFIED | `test_api_universes.py::test_a_filter_matching_nothing_is_empty_universe` | 422 `empty_universe`, nothing written |
| TC-INT-009 | VERIFIED | `test_api_universes.py::test_one_stock_in_two_universes_is_listed_in_both_and_in_its_evidence` | Both universes are active with one member. Memberships are `["U1","U2"]`. Name order is not discriminated (AR-002). |
| TC-INT-010 | VERIFIED | `test_api_universes.py::test_names_are_unique_among_active_universes_after_trimming` | 409, and the active names are exactly `Other, Tech` |
| TC-INT-011 | VERIFIED | `test_api_universes.py::test_rename_keeps_the_id_and_the_history` | Same id; `renamed` is first and the earlier events are unchanged |
| TC-INT-012 | VERIFIED | same test as TC-INT-010 | The refused universe reads back as `Other`. |
| TC-INT-013 | VERIFIED | `test_api_universes.py::test_retire_keeps_members_and_events_and_refuses_every_write` | 409 `universe_retired`; the name reads back as `Mine` |
| TC-INT-014 | VERIFIED | same test | Absent from the default list; the only entry of `lifecycle=retired` |
| TC-INT-015 | VERIFIED | same test | The second DELETE returns 409 `universe_retired`. |
| TC-INT-016 | VERIFIED | `test_api_universes.py::test_add_and_remove_keep_the_dated_record` | `removed_at`; BBB is not a member; both events are listed |
| TC-INT-017 | VERIFIED | `test_api_universes.py::test_an_empty_create_is_empty_universe_and_writes_nothing` | 422 `empty_universe` |
| TC-INT-018 | VERIFIED | `test_api_universes.py::test_removing_the_sole_member_is_refused_then_retired_refuses_writes` | 409 `last_member`, member kept |
| TC-INT-019 | VERIFIED | `test_api_universes.py::test_as_of_returns_the_membership_of_each_date` | D1, D2 and D3 return `AAA,BBB`, `AAA` and `AAA,CCC`, with `member_count`, `as_of` and `as_of_before_creation == False` |
| TC-INT-020 | VERIFIED | `test_api_universes.py::test_as_of_reads_past_membership` | No members, `as_of_before_creation`, and `created_at` equals the creation response |
| TC-INT-021 | VERIFIED | `test_api_universes.py::test_events_list_every_kind_newest_first` | Five events of all four kinds; `event_id` strictly descending and unique |
| TC-INT-022 | VERIFIED | `test_api_universes.py::test_as_of_reads_past_membership` | 422 `validation_error` for `2026-13-40`. The specification's literal `not-a-date` is not sent (AR-003). |
| TC-INT-023 | VERIFIED | `test_api_universes.py::test_unknown_universes_and_members_are_404` | 404 `universe_not_found` |
| TC-INT-024 | VERIFIED | `test_research_migrations_apply.py::test_migrator_applies_0005_and_0006_from_0004_and_reapplies_nothing` | `[5, 6]`, the CAP-001 snapshot unchanged, then `[]` |
| TC-INT-025 | VERIFIED | `test_classification_after_build.py::test_evidence_lists_the_eight_inputs_from_a_build` | Real `engine.build` under DEC-0286. Eight `present` inputs, grouped as `INPUT_NAMES`, each with value, `as_of` and `known_on` |
| TC-INT-026 | VERIFIED | `test_api_classifications.py::test_a_stocks_scores_are_the_same_unscoped_and_in_each_universe`; part `test_engine_peer_set.py::test_scores_are_identical_whatever_the_universe_membership` | Three reads carry equal score and percentile. The scope sizes `[2, 1, 1]` show the scope changed. |
| TC-INT-027 | VERIFIED | `test_api_classifications.py::test_the_list_carries_the_set_the_factors_and_string_scores` | Annotation only, as planned |
| TC-INT-028 | VERIFIED | `test_classification_cycle.py::test_succeeded_and_partial_runs_each_get_a_set_in_ended_at_order`; part `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed` | Runs inserted against `ended_at` order. Set `started_at` follows `ended_at`; one complete set per run. The second store half T011 names is unmarked (AR-001). |
| TC-INT-029 | VERIFIED | `test_classification_cycle.py::test_failed_cancelled_and_abandoned_runs_get_no_set`; part `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed` | Empty over five seconds of HTTP reads, and zero sets in the store. One run left a bar. |
| TC-INT-030 | VERIFIED | `test_scheduler_claim.py::test_claim_returns_none_when_the_run_acquired_a_set_between_statements`; `test_research_constraints.py::test_a_second_set_for_the_same_run_is_refused` | Annotation only, as planned |
| TC-INT-031 | VERIFIED | `test_classification_latency.py::test_a_3000_stock_run_is_summarised_within_five_minutes_of_its_end`; part `test_engine_volume.py::test_3000_instruments_build_within_the_budget` | Rerun: 3.095 s from run end to the summary (limit 300 s). `active_instruments == 3000` |
| TC-INT-032 | VERIFIED | `test_classification_after_build.py::test_a_missing_value_input_is_named_and_the_other_factors_still_score` | 31-stock roster (DEC-0294). Value `input_missing` with `reason_input == "fcf_yield"`, no numbers. Growth and momentum are classified. |
| TC-INT-033 | VERIFIED | `test_api_classifications.py::test_thresholds_and_hide_incomplete_follow_the_documented_rule` | At bound 50, DDD (percentile 10) is excluded and `match_count == 3` counts incomplete BBB |
| TC-INT-034 | VERIFIED | `test_classification_after_build.py::test_a_fundamental_one_day_past_six_months_is_outdated_and_exactly_six_months_is_present`; part `test_engine_currency.py::test_fundamentals_outdated_at_six_months_and_a_day` | AAA ends 2026-05-12 and BBB 2026-05-13 against 2026-11-13. AAA's five fundamentals are `outdated`, and value and growth are `input_outdated` naming an input. BBB is `present` and classified. The second store half T011 names is unmarked (AR-001). |
| TC-INT-035 | VERIFIED | `test_api_classification_summary.py::test_the_summary_counts_the_current_stocks`, `::test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count` | Annotation only, as planned |
| TC-INT-036 | VERIFIED | `test_api_classifications.py::test_fewer_than_thirty_qualifying_stocks_show_no_growth_score`; part `test_engine_peer_set.py::test_a_factor_ranks_only_from_thirty_qualifying_stocks` | Every growth cell is `not_enough_stocks` with "29 of 30" and no numbers. The list and the summary both report growth unranked with `qualified_count == 29`. |
| TC-INT-037 | VERIFIED | `test_api_classifications.py::test_a_retired_stock_is_hidden_unscoped_and_retired_in_its_universe`; part `test_engine_peer_set.py::test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` | RRR is absent unscoped and `retired` on all three factors in U |
| TC-INT-038 | VERIFIED | `test_api_classifications.py::test_compare_reports_unknown_symbols_and_enforces_its_bounds` | OLD is `not_classified` / `retired` |
| TC-INT-039 | VERIFIED | `test_api_classifications.py::test_a_sorted_list_pages_with_a_stable_match_count` | Pages of 10, 10 and 5 in strict descending order; `match_count == 25` on each page |
| TC-INT-040 | VERIFIED | same compare test | `unknown_symbols == ["NOPE"]` |
| TC-INT-041 | VERIFIED | same compare test | One and seven symbols both return 422 naming `symbols` |
| TC-INT-042 | VERIFIED | `test_api_classifications.py::test_an_altered_cursor_is_invalid_and_one_for_an_older_set_is_stale` | `cursor_invalid`, then `cursor_stale` |
| TC-INT-043 | VERIFIED | `test_api_classifications.py::test_a_universe_scopes_the_list_and_an_unknown_one_is_404` | 404 `universe_not_found` |
| TC-INT-044 | VERIFIED | `test_api_classifications.py::test_the_evidence_shows_inputs_with_their_dates_and_memberships` | Each shown value, `as_of` and `known_on` equals the stored `factor_input` row and the seeded value |
| TC-INT-045 | VERIFIED | same test | 404 `instrument_not_found` |
| TC-INT-046 | VERIFIED | `test_api_classifications.py::test_the_history_lists_three_earlier_complete_sets_newest_first_and_skips_a_failed_one` | DEC-0287. Three results newest first with the stored scores. The failed and current sets are absent. |
| TC-INT-047 | VERIFIED | `test_classification_cycle.py::test_a_newer_run_leaves_the_earlier_sets_rows_identical`; part `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged` | The S1 snapshot is non-empty and identical after S2. S2 has rows in all three tables. |
| TC-INT-048 | VERIFIED | `test_api_classifications.py::test_the_history_carries_the_stored_restated_flag_and_a_new_stock_has_none`, `::test_the_history_lists_earlier_sets_newest_first_without_the_current_one` | NEW returns an empty `sets` list; NOPE returns 404 |
| TC-INT-049 | VERIFIED | `test_classification_cycle.py::test_a_backfill_after_a_set_changes_only_the_next_set`; part `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged` | The S1 entry is identical before and after the backfill and dated D. Only the next set classifies growth (restated). Every set shares the clock date (AR-004). `::test_backfill_before_the_build_is_seen_by_that_set` is unmarked (AR-001). |
| TC-INT-050 | VERIFIED | `test_api_classification_summary.py::test_a_newer_set_is_carried_as_later_and_equals_the_list_read[building]` | `not_current`; the later set's rows (score 9) are never listed |
| TC-INT-051 | VERIFIED | same test `[failed]` | `later.failure_reason == "boom"`; the list carries only S1's rows |
| TC-INT-052 | VERIFIED | `test_engine_transaction.py::test_completing_an_already_failed_set_updates_no_row_and_rolls_back` | `::test_set_failed_by_another_writer_mid_build_is_left_untouched` is unmarked (AR-001). |
| TC-INT-053 | VERIFIED | `test_classification_cycle.py::test_an_application_start_fails_a_stale_building_set_and_classifies_the_next_run`; part `test_scheduler_restart.py::test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run` | Over HTTP, the stale set is `failed` with `INTERRUPTED_REASON`, and the waiting run's set is complete. |
| TC-INT-054 | VERIFIED | `test_engine_transaction.py::test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set`; part `test_classification_cycle.py::test_a_failing_build_is_listed_as_failed_and_leaves_no_rows` | `RuntimeError: injected failure`; zero rows in all three tables |
| TC-INT-055 | VERIFIED | `test_api_classifications.py::test_the_sets_list_and_detail_agree` | Two complete sets newest first; the detail equals the list row |
| TC-INT-056 | VERIFIED | same test | 404 `classification_set_not_found` |
| TC-INT-057 | VERIFIED | `test_api_classifications.py::test_nothing_classified_says_so`; `test_api_classification_summary.py::test_before_any_complete_set_the_summary_says_nothing_is_classified` | `never_classified`, `set`, `later` and `factors` are equal across the list and the summary. |
| TC-INT-058 | VERIFIED | `test_api_classifications.py::test_the_restatement_mark_is_on_value_and_growth_in_all_four_reads`; part `test_engine_restatement.py::test_statement_filed_before_first_observation_marks_its_inputs_and_classifications` | All four reads show `{value: true, growth: true, momentum: false}`; BBB is unmarked |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | commit `d39bee0` message | The key probe reran and prints `7`. The plan still holds neither recorded count (AR-005). |
| T002 | VERIFIED | `tests/integration/classification_cycle_support.py` | `end_run` uses `insert_run` (DEC-0293); `seed_roster` dates from the clock (DEC-0292); `wait_for_sets` uses a `time.monotonic` deadline |
| T003 | VERIFIED | `tests/integration/test_api_universes.py` | Every named marker is present. |
| T004 | VERIFIED | `tests/integration/test_api_universes.py` | TC-INT-001, 003, 004 and 005 additions are present. |
| T005 | VERIFIED | `tests/integration/test_api_universes.py` | TC-INT-007, 009, 010, 012, 013 and 014 additions are present. |
| T006 | VERIFIED | `tests/integration/test_api_universes.py` | Reuses the `test_universe_as_of.py` helpers |
| T007 | VERIFIED | `tests/integration/test_api_classifications.py` | Markers present; docstring updated |
| T008 | VERIFIED | `tests/integration/test_api_classifications.py` | Every named test and assertion is present. |
| T009 | VERIFIED | `tests/integration/test_api_classification_summary.py` | Markers, later-set rows, `failure_reason` and same-keys assertions |
| T010 | VERIFIED | `tests/integration/test_research_migrations_apply.py` | Present and passing |
| T011 | PARTIAL | `tests/integration/test_engine_*.py`, `test_scheduler_*.py`, `test_research_constraints.py`, `test_universe_filter_snapshot.py` | Still four named annotations missing (AR-001) |
| T012 | VERIFIED | `tests/integration/test_classification_cycle.py` | Parts (a) to (f) |
| T013 | VERIFIED | `tests/integration/test_classification_after_build.py` | Roster sizes per DEC-0294 |
| T014 | VERIFIED | `tests/integration/test_classification_latency.py` | `slow` and `postgres` markers; the elapsed time is printed |
| T015 | VERIFIED | rerun below | 922 passed; the slow case passed; the marker count is 58 |
| T016 | VERIFIED | rerun below | Both running-application files pass twice in one session (18/18). The full suite runs `test_api_universes.py` among the others. |
| T017 | VERIFIED | rerun below | Ruff, format, mypy and `not postgres` are clean. |

## Independent Validation

The working directory is `repos/factorflow-v2/FactorFlow-v2`. Because the
sandbox refuses the Docker socket and uv's cache, each command was run outside
the sandbox as one plain call, `uv run --directory <repo> --offline <command>`
(and `uv build --directory <repo> --offline --out-dir <scratchpad>/dist`, so
the build left nothing in the repository).

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl` into the scratchpad. This resolves the version 1 blocker. |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 2578 passed, 1 xfailed, in 396.06 s. Includes the `slow` tests. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1636 passed, 942 deselected, 1 xfailed |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 285 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 61 source files |
| `uv run pytest tests/integration -m "postgres and not slow" -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 922 passed, 22 deselected, in 172.83 s |
| `uv run pytest tests/integration/test_classification_latency.py -m slow -q -s` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1 passed; `run end to summarised: 3.095s` |
| `grep -rhoE "Implements CAP-002 TC-INT-0[0-9]{2}" tests \| sort -u \| wc -l` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `58`; no number from 001 to 058 is missing |
| `uv run pytest tests/integration/test_classification_cycle.py ×2 tests/integration/test_classification_after_build.py ×2 --keep-duplicates -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supporting (T016): 18 passed |
| `uv run python -c "from factorflow.classification import line_items; print(len(line_items.unresolved()))"` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supporting (T001, DEC-0286): `7` |
| `uv sync --all-extras`, `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | n/a | NOT-RUN | Not required here. The task plan's Validation Plan lists only the Python commands. The change set has no frontend file. `uv sync` installs and would rewrite `.venv`, which a read-only review does not do. The required set is the nine rows above the two supporting rows. |

## Findings

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | HIGH | Still open from version 1. T011 is checked `[x]`, but four tests it names carry no `# Implements CAP-002 TC-INT-NNN` line at HEAD `91a34fa`: `test_engine_transaction.py::test_set_failed_by_another_writer_mid_build_is_left_untouched` (TC-INT-052), `test_engine_transaction.py::test_backfill_before_the_build_is_seen_by_that_set` (TC-INT-049 part), `test_engine_currency.py::test_fundamentals_present_at_exactly_six_months` (TC-INT-034 part; it carries only `# Implements TC-COMP-100`) and `test_scheduler_claim.py::test_qualifying_runs_are_claimed_oldest_first_once_each` (TC-INT-028 part; it carries only `# Implements TC-COMP-078`). | The checked task claims work that was not done. Task-to-test traceability fails for four planned tests. Each case still has another marked test that asserts it, so no behaviour is unverified. | Add the four marker lines beside the existing `# Implements TC-COMP-NNN` lines, as T011 says, with `(part: store half)` where the plan calls the test a part. Alternatively, revise T011 through `$automation-planning` to drop them. Do not leave the task checked as written. |
| AR-002 | LOW | Still open. `test_one_stock_in_two_universes_is_listed_in_both_and_in_its_evidence` creates U1 before U2 and asserts memberships `["U1","U2"]`. | Name order and creation order coincide, so a regression to creation-order sorting would pass. The case requires name order. | Create the universes against name order (for example U2 first). |
| AR-003 | LOW | Still open. TC-INT-022's step sends `as_of=not-a-date`; the test sends `2026-13-40`. | The non-date-shaped input the specification names is not exercised. | Send `not-a-date`, or add it beside the existing value. |
| AR-004 | LOW | Still open. DEC-0292: `seed_roster` and the TC-INT-049 test date from `chicago_today()`, and the loop stamps sets from the database clock. `populate_backdating(classification_date=chicago_today())` is not moved off weekends. | A run across Chicago midnight, or on a weekend, may date the population differently. In TC-INT-049 every set shares one date, so "not backdated" rests on the S1 entry being unchanged. Not exercised here (Thursday evening in Chicago). | Optional: pin the loop's date if these tests flake, or record the dependency in the module docstring. |
| AR-005 | LOW | Still open. T001 asks for the baseline pass count and the unresolved-key count "in the task notes". The plan holds neither. | Minor evidence gap. This review reran the probe (`7`). | Record both in the task plan's notes on the rework. |
| AR-006 | LOW | New. Commit `acb6ee3` changes `tests/integration/test_universe_maintenance.py::test_a_lower_case_non_member_is_reported_normalised` (it removes the universe UUID from the message before asserting that `ccc` is absent). No task in the plan names this file, and the plan is unchanged. | The fix is correct: the old assertion failed whenever the random UUID contained `ccc`. But the change set holds a test change that no task traces, so task-to-test traceability is not complete in that direction. | Record the change in the task plan (a note, or a task through `$automation-planning`), or land it through `$expedited-change` instead. No code change is needed. |

## Previous Review Disposition

- **v1 AR-001: open, not addressed.** The four tests still lack their markers
  at `91a34fa`, and the plan is unchanged (same content revision). Carried
  forward as AR-001.
- **v1 AR-002: open, not addressed.** The test is unchanged since `d39bee0`.
  Carried forward as AR-002.
- **v1 AR-003: open, not addressed.** The test still sends `2026-13-40`.
  Carried forward as AR-003.
- **v1 AR-004: open, not addressed (optional).** `classification_cycle_support.py`
  and `test_classification_cycle.py` are unchanged. Carried forward as AR-004.
- **v1 AR-005: open, not addressed.** The plan's content revision is
  unchanged. Carried forward as AR-005.
- **v1 blocker, `uv build` not run: resolved.** Run outside the sandbox as one
  plain call; exit 0, sdist and wheel built.

## Verdict

**Verdict:** CHANGES-REQUIRED

The required evidence is complete, and every required command passed. The
verdict is not a pass because AR-001 (HIGH) remains open against the checked
task T011. Route AR-001 and AR-006, plus the optional AR-002 to AR-005, back
to `$automation-coding`. If T011 changes, or AR-006 becomes a planned task,
route through `$automation-planning` first. Rework belongs on a commit to the
branch under review, followed by a version 3 review.
