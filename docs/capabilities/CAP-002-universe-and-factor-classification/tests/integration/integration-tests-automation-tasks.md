---
artifact_schema_version: 1
artifact_id: CAP-002-integration-tests-automation-tasks
artifact_type: automation-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-05
updated: 2026-11-05
ai_provenance:
  agent_id: automation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-11-05T20:55:00Z
  source_artifacts:
    - id: CAP-002-integration-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Tasks: CAP-002-integration-tests — Integration Tests

**Test Specification**: `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md`
**Component(s)**: `FactorFlow-v2`
**Test Scope**: integration
**Branch**: `usr/alvaro-de-jodra/CAP-002-automation`
**Date**: 2026-11-05

## Summary

Automate the 58 CAP-002 integration cases (TC-INT-001 to TC-INT-058). They cover
the universes routes, the classification routes, the factor engine, the
scheduler and the research-store migrations, all inside the one project repo
`FactorFlow-v2`. No third-party repo is involved and no task writes outside the
project repo's `repos:` entry.

The component stories delivered most of this behaviour with tests of their own
(`tests/integration/test_api_universes.py`, `test_api_classifications.py`,
`test_api_classification_summary.py`, `test_universe_*.py`, `test_reader_*.py`,
`test_engine_*.py`, `test_scheduler_*.py`, `test_research_*.py`). Those tests
carry TC-COMP, DAC or AC identifiers, and `test_api_classifications.py` and
`test_api_classification_summary.py` say in their docstrings that they overlap
TC-INT cases "cited, not claimed". This plan follows the approach CAP-001's
integration plan took (`CAP-001-.../tests/integration/integration-tests-automation-tasks.md`
v2): **where an existing test already asserts the case's Expected Result, add
traceability to it; where it misses part of the Expected Result, add the missing
assertion or a new test; plan nothing that duplicates a passing test.** Each
mapping below was checked against the test's assertions, not its name.

Outcome of that check, by the Automation column of the table below: cases whose
row says only "Annotate" need traceability alone; cases whose row also says "Add"
need a named assertion or test; cases whose row starts with "Add" need a new test.
For the engine and scheduler cases an existing test covers the store half and is
annotated as such, and the new test adds the missing half through the running
application and the API.

Two decisions shape the plan (both agent decisions in an unattended run, to be
reviewed by the owner):

- **DEC-0286 (PROVISIONAL).** Every payload key in
  `src/factorflow/classification/line_items.py` is still `[REQUIRES INPUT]`
  (system design section 8, question 1), so value and growth cannot be derived from
  real provider payloads. TC-INT-025, 031, 032 and 034 run in process with the
  existing test-only helper `install_test_line_items`
  (`tests/integration/engine_inputs_support.py`), as the delivered engine and
  volume tests do. No production key is written. This is the pytest counterpart of
  DEC-0285, which guards the e2e cases that need the real stack.
- **DEC-0287.** TC-INT-046 expects three history results from "three complete sets
  and one failed set", but the approved reader design (DEC-0137) excludes the
  current set from history. The test seeds four complete sets, the newest being
  current, plus one failed set, and asserts three results. See Notes.

**Marker convention.** CAP-001 already uses `# Implements TC-INT-001` to
`TC-INT-027` for its own cases (for example `tests/integration/test_api_runs.py`),
so a bare `TC-INT-NNN` is ambiguous in this repo. Every CAP-002 marker is written
`# Implements CAP-002 TC-INT-NNN` (on the line above the test, as the existing
`# Implements TC-COMP-NNN` lines are). Where a test covers only part of a case,
the marker line is followed by `(part: <what>)`.

## Test Case Traceability

"Annotate" means add the `# Implements CAP-002 TC-INT-NNN` line. "Add" means add the
named assertion or test. Test names are in the file named in the Tasks column's
task. Paths are relative to the repository root.

| TC ID | Test Case Title | Scope | Component(s) | Automation | Tasks |
|-------|----------------|-------|---------------|------------|-------|
| TC-INT-001 | POST /api/universes creates a universe from covered symbols | integration | classification-api, universe-service, research-store | Annotate `test_api_universes.py::test_create_by_hand_returns_and_reads_the_replayed_universe` (201, 2 members, GET returns the same). Add a test with a complete set of 30 or more stocks that asserts each member carries a classification cell (the existing test runs with no set, so `factors` is `None`) | T003, T004 |
| TC-INT-002 | POST /api/universes refuses an uncovered symbol | integration | classification-api, universe-service, research-store | Annotate `test_api_universes.py::test_create_naming_uncovered_symbols_is_refused_whole` (409 `instrument_not_acquired`, `symbols` names the uncovered ones, nothing written) | T003 |
| TC-INT-003 | POST /api/universes/{id}/members adds covered symbols | integration | classification-api, universe-service, research-store | Annotate `test_api_universes.py::test_add_and_remove_keep_the_dated_record` (`{"added": ["BBB"], "already_member": []}`). Add a GET of the universe straight after the add asserting AAA and BBB (the test reads members only after the removal) | T003, T004 |
| TC-INT-004 | POST /api/universes/{id}/members refuses an uncovered symbol | integration | classification-api, universe-service, research-store | Add `test_api_universes.py::test_adding_an_uncovered_symbol_is_refused_and_membership_is_unchanged` (409 `instrument_not_acquired` naming ZZZ, GET shows membership and event count unchanged). The refusal is tested only at service level (`test_universe_create.py::test_add_refuses_the_whole_request_and_changes_nothing`) | T004 |
| TC-INT-005 | POST /api/universes from a filter snapshots the filtered result | integration | classification-api, universe-service, classification-reader, research-store | Annotate `test_api_universes.py::test_create_from_a_result_saves_the_filter_match_with_provenance` (201, origin with bounds, hide_incomplete, symbol, set_id, classification_date). Add a `GET /api/classifications` with the same filter before the POST and assert its symbols and `match_count` equal the created members, then re-read the universe and compare members and origin (the test compares to `reader.evaluate_filter`, not to the HTTP list) | T003, T004 |
| TC-INT-006 | POST /api/universes from a filter refuses a superseded set | integration | classification-api, universe-service, classification-reader, research-store | Annotate `test_api_universes.py::test_a_newer_complete_set_refuses_the_save` (409 `classification_set_changed`, `written()` unchanged so no universe exists) | T003 |
| TC-INT-007 | A filter-built universe keeps its members after a new set | integration | classification-api, universe-service, classification-reader, research-store | Add `test_api_universes.py::test_a_filter_universe_keeps_its_members_when_a_newer_set_matches_differently` through HTTP: save from a filter, seed a newer complete set that matches other stocks, assert `GET /api/universes/{id}` returns the saved members and `GET /api/classifications` with the same filter differs. The service-level `test_universe_filter_snapshot.py::test_a_later_set_that_changes_the_matches_leaves_the_members_unchanged` is annotated as the store half | T005, T011 |
| TC-INT-008 | POST /api/universes from a filter matching no stock is refused | integration | classification-api, universe-service, classification-reader, research-store | Annotate `test_api_universes.py::test_a_filter_matching_nothing_is_empty_universe` (422 `empty_universe`, nothing written, current `set_id`) | T003 |
| TC-INT-009 | One stock belongs to two universes at the same time | integration | classification-api, universe-service, classification-reader, research-store | Add `test_api_universes.py::test_one_stock_in_two_universes_is_listed_in_both_and_in_its_evidence`: `GET /api/universes` lists both active; `GET /api/classifications/stocks/AAA` lists `memberships` U1 and U2 in name order. Existing evidence tests use one universe (`test_api_classifications.py::test_the_evidence_shows_inputs_with_their_dates_and_memberships`) and the two-universe case is service-level (`test_universe_create.py::test_a_stock_may_belong_to_several_universes`) | T005 |
| TC-INT-010 | POST /api/universes refuses a name already used by an active universe | integration | classification-api, universe-service, research-store | Annotate `test_api_universes.py::test_names_are_unique_among_active_universes_after_trimming` (409 `universe_name_in_use`). Add an assertion that exactly one active universe named Core exists afterwards | T003, T005 |
| TC-INT-011 | PATCH /api/universes/{id} renames and keeps history | integration | classification-api, universe-service, research-store | Annotate `test_api_universes.py::test_rename_keeps_the_id_and_the_history` (same id, new name, earlier events unchanged, one `renamed` event first) | T003 |
| TC-INT-012 | PATCH /api/universes/{id} refuses a name in use | integration | classification-api, universe-service, research-store | Add an assertion to `test_api_universes.py::test_names_are_unique_among_active_universes_after_trimming` that the refused universe keeps its name (the 409 is asserted, the name is not read back). The 409 itself is the existing `patched` assertion | T005 |
| TC-INT-013 | PATCH on a retired universe is refused | integration | classification-api, universe-service, research-store | Annotate `test_api_universes.py::test_retire_keeps_members_and_events_and_refuses_every_write` (409 `universe_retired` on PATCH). Add a read-back that the name is unchanged | T005 |
| TC-INT-014 | DELETE /api/universes/{id} retires without deleting | integration | classification-api, universe-service, research-store | Annotate `test_api_universes.py::test_retire_keeps_members_and_events_and_refuses_every_write` (200 `retired`, `retired_at`, members and events readable). Add the list reads: absent from the default list, present in `lifecycle=retired` (`test_the_list_filters_counts_and_pages` checks the filters on other data) | T005 |
| TC-INT-015 | DELETE on an already retired universe is refused | integration | classification-api, universe-service, research-store | Annotate the same test's second `client.delete(f"/api/universes/{universe_id}")` (409 `universe_retired`) | T003 |
| TC-INT-016 | DELETE /api/universes/{id}/members/{symbol} removes but retains history | integration | classification-api, universe-service, research-store | Annotate `test_api_universes.py::test_add_and_remove_keep_the_dated_record` (200 `removed_at`, BBB not a member, `member_added` and `member_removed` listed) | T003 |
| TC-INT-017 | POST /api/universes with no symbols is refused | integration | classification-api, universe-service | Annotate `test_api_universes.py::test_an_empty_create_is_empty_universe_and_writes_nothing` (422 `empty_universe`; listing lacks "Empty") | T003 |
| TC-INT-018 | DELETE the last member is refused | integration | classification-api, universe-service, research-store | Annotate `test_api_universes.py::test_removing_the_sole_member_is_refused_then_retired_refuses_writes` (409 `last_member`, member kept) | T003 |
| TC-INT-019 | GET /api/universes/{id}?as_of returns past membership | integration | classification-api, universe-service, research-store | Add `test_api_universes.py::test_as_of_returns_the_membership_of_each_date`: create on D1 with AAA, BBB; remove BBB on D2; add CCC on D3, by setting `recorded_at` and `recorded_on` of the events on the connection as `test_universe_as_of.py` does, then three GETs with `as_of` D1, D2, D3. The existing API test (`test_as_of_reads_past_membership`) reads only today and 2000-01-01; the date folding is tested at service level only | T006 |
| TC-INT-020 | GET /api/universes/{id}?as_of before creation reports as_of_before_creation | integration | classification-api, universe-service, research-store | Annotate `test_api_universes.py::test_as_of_reads_past_membership` (200, no members, `as_of_before_creation` true). Add the assertion that the response states the creation date | T003, T006 |
| TC-INT-021 | GET /api/universes/{id}/events lists membership events newest first | integration | classification-api, universe-service, research-store | Add `test_api_universes.py::test_events_list_every_kind_newest_first`: a universe with `created`, `member_added`, `member_removed` and `renamed` events, one GET, four events, descending `event_id`, none omitted. The existing paging test seeds only `created` and `member_added` | T006 |
| TC-INT-022 | GET /api/universes/{id} rejects a malformed as_of | integration | classification-api, universe-service | Annotate `test_api_universes.py::test_as_of_reads_past_membership` (its `malformed` call returns 422 `validation_error`; the case's input is `not-a-date`, the existing one `2026-13-40`, both malformed dates) | T003 |
| TC-INT-023 | GET /api/universes/{id} for an unknown universe returns 404 | integration | classification-api, universe-service | Annotate `test_api_universes.py::test_unknown_universes_and_members_are_404` (first GET, 404 `universe_not_found` in the envelope) | T003 |
| TC-INT-024 | Forward-only migrations apply without touching CAP-001 data | integration | research-store | Add `test_research_migrations_apply.py::test_migrator_applies_0005_and_0006_from_0004_and_reapplies_nothing`: store at 0004 with the CAP-001 rows `seed_cap_001_rows` writes, one `apply_pending` over every file, assert versions `[5, 6]`, CAP-001 rows unchanged, a second run applies nothing. The existing tests apply 0005 and 0006 in two separate steps | T010 |
| TC-INT-025 | Evidence exposes the eight factor inputs derived from acquired data | integration | classification-api, factor-engine, research-store | Add `test_classification_after_build.py::test_evidence_lists_the_eight_inputs_from_a_build`: acquisition rows for one stock (8 quarters, 13 months of bars) plus a 30-stock roster, a real `engine.build` under `install_test_line_items` (DEC-0286), then `GET /api/classifications/stocks/{symbol}`: eight inputs, each with `value`, `as_of`, `known_on`, grouped under value, growth, momentum. The seeded API test (`test_the_evidence_shows_inputs_with_their_dates_and_memberships`) never runs the engine | T013 |
| TC-INT-026 | A stock's classification is identical unscoped and within each universe | integration | classification-api, classification-reader, universe-service, research-store | Add `test_api_classifications.py::test_a_stocks_scores_are_the_same_unscoped_and_in_each_universe` (three GETs, equal score and percentile for the three factors). The engine half (`test_engine_peer_set.py::test_scores_are_identical_whatever_the_universe_membership`) is annotated | T008, T011 |
| TC-INT-027 | GET /api/classifications returns score and percentile per ranked factor | integration | classification-api, classification-reader, research-store | Annotate `test_api_classifications.py::test_the_list_carries_the_set_the_factors_and_string_scores` (`set`, `later`, `match_count`; score and percentile as decimal strings) | T007 |
| TC-INT-028 | Succeeded and partial acquisition runs lead to a classification set | integration | classification-scheduler, factor-engine, research-store | Add `test_classification_cycle.py::test_succeeded_and_partial_runs_each_get_a_set_in_ended_at_order` through the running application (T002) with the sets read from `GET /api/classifications/sets`. Store-level halves annotated: `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed` and `::test_qualifying_runs_are_claimed_oldest_first_once_each` | T011, T012 |
| TC-INT-029 | Failed, cancelled and abandoned runs lead to no set | integration | classification-scheduler, research-store | Add `test_classification_cycle.py::test_failed_cancelled_and_abandoned_runs_get_no_set` (one of the three has observations written, several poll intervals, `GET /api/classifications/sets` empty). Store half annotated: `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed` | T011, T012 |
| TC-INT-030 | A second set claim for the same run is refused | integration | classification-scheduler, research-store | Annotate `test_scheduler_claim.py::test_claim_returns_none_when_the_run_acquired_a_set_between_statements` (unique violation handled as no claim, set count stays 1) and `test_research_constraints.py::test_a_second_set_for_the_same_run_is_refused` | T011 |
| TC-INT-031 | Classification of 3000 stocks completes within 5 minutes of run end | integration | classification-scheduler, factor-engine, research-store, classification-api | Add `test_classification_latency.py::test_a_3000_stock_run_is_summarised_within_five_minutes_of_its_end` (slow): `populate_volume` roster, a run ending `succeeded` at T, running application, poll `GET /api/classifications/summary` until `set` reflects the run, assert elapsed from T is at most 300 s. The engine budget alone (`test_engine_volume.py::test_3000_instruments_build_within_the_budget`, annotated) leaves out the poll and the API read | T011, T014 |
| TC-INT-032 | Evidence names the missing input when a factor is not classified | integration | classification-api, factor-engine, research-store | Add `test_classification_after_build.py::test_a_missing_value_input_is_named_and_the_other_factors_still_score`: a stock without a cash-flow statement in a 30-stock roster, built, then the evidence: value `not_classified`, reason `input_missing` naming the input, no score or percentile; growth and momentum classified | T013 |
| TC-INT-033 | Thresholds exclude only classified stocks that fail the bound | integration | classification-api, classification-reader, research-store | Annotate `test_api_classifications.py::test_thresholds_and_hide_incomplete_follow_the_documented_rule` (incomplete BBB listed under a bound). Add an assertion that `match_count` counts it and uses a bound of 50 with a classified stock below it excluded (the test asserts membership only, with a bound of 90) | T007, T008 |
| TC-INT-034 | A fundamental older than 6 months is outdated; exactly 6 months is present | integration | classification-api, factor-engine, research-store | Add `test_classification_after_build.py::test_a_fundamental_one_day_past_six_months_is_outdated_and_exactly_six_months_is_present` (AAA, BBB built, both evidence reads: AAA fundamental inputs `outdated`, value and growth `input_outdated` naming the input; BBB `present`). The store half is annotated: `test_engine_currency.py::test_fundamentals_outdated_at_six_months_and_a_day` and `::test_fundamentals_present_at_exactly_six_months` | T011, T013 |
| TC-INT-035 | Summary counts stocks with missing or outdated inputs as not current | integration | classification-api, classification-reader, research-store | Annotate `test_api_classification_summary.py::test_the_summary_counts_the_current_stocks` (missing excluded, `not_computable` included) and `::test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count` (outdated excluded). Together they assert the case's rule | T009 |
| TC-INT-036 | Fewer than 30 qualifying stocks shows no scores | integration | classification-api, factor-engine, classification-reader, research-store | Add `test_api_classifications.py::test_fewer_than_thirty_qualifying_stocks_show_no_growth_score` (list and summary: every stock `not_classified` on growth, `not_enough_stocks`, "29 of 30" in the reason, other factors ranked). Engine half annotated: `test_engine_peer_set.py::test_a_factor_ranks_only_from_thirty_qualifying_stocks` | T008, T011 |
| TC-INT-037 | Retired stock is excluded unscoped and shown as retired in a universe | integration | classification-api, classification-reader, universe-service, factor-engine, research-store | Add `test_api_classifications.py::test_a_retired_stock_is_hidden_unscoped_and_retired_in_its_universe` (RRR absent from the unscoped list, listed in U with `retired` on all three factors; `test_a_universe_scopes_the_list_and_an_unknown_one_is_404` seeds the retired stock with a value score, not the retired reason). Engine half annotated: `test_engine_peer_set.py::test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` | T008, T011 |
| TC-INT-038 | Compare includes a retired stock with its retired reason | integration | classification-api, classification-reader, research-store | Annotate `test_api_classifications.py::test_compare_reports_unknown_symbols_and_enforces_its_bounds` (`symbols=AAA,OLD`: both returned, OLD cells `not_classified` with `retired`) | T007 |
| TC-INT-039 | List sorts by factor and pages with a stable match_count | integration | classification-api, classification-reader, research-store | Add `test_api_classifications.py::test_a_sorted_list_pages_with_a_stable_match_count` (`sort`, `order=desc`, `limit=10`, follow `next_cursor`; order holds across both pages and `match_count` is the whole scope on each). Sorting is asserted on one page (`test_sort_orders_and_bad_input_is_422`) and paging without a sort (`test_the_match_count_covers_the_whole_set_on_every_page`) | T008 |
| TC-INT-040 | Compare reports unrecognised symbols | integration | classification-api, classification-reader, research-store | Annotate `test_api_classifications.py::test_compare_reports_unknown_symbols_and_enforces_its_bounds` (`unknown_symbols == ["NOPE"]`) | T007 |
| TC-INT-041 | Compare outside 2 to 6 symbols is rejected | integration | classification-api, classification-reader | Annotate the same test's loop over one symbol and seven symbols (422 naming `symbols`) | T007 |
| TC-INT-042 | A tampered or stale cursor is rejected | integration | classification-api, classification-reader | Annotate `test_api_classifications.py::test_an_altered_cursor_is_invalid_and_one_for_an_older_set_is_stale` (422 `cursor_invalid`, then 422 `cursor_stale`) | T007 |
| TC-INT-043 | Scoping to an unknown universe returns 404 | integration | classification-api, classification-reader, universe-service | Annotate `test_api_classifications.py::test_a_universe_scopes_the_list_and_an_unknown_one_is_404` (404 `universe_not_found`) | T007 |
| TC-INT-044 | Evidence lists every input with value, as_of and known_on | integration | classification-api, classification-reader, research-store | Annotate `test_api_classifications.py::test_the_evidence_shows_inputs_with_their_dates_and_memberships`. Add assertions on the values: each present input's `value`, `as_of`, `known_on` equal the seeded `factor_input` row (the test checks the keys exist, not their values) | T007, T008 |
| TC-INT-045 | Evidence for an unknown symbol returns 404 | integration | classification-api, classification-reader | Annotate the first call in the same test (404 `instrument_not_found`) | T007 |
| TC-INT-046 | History lists a stock's complete sets newest first | integration | classification-api, classification-reader, research-store | Add `test_api_classifications.py::test_the_history_lists_three_earlier_complete_sets_newest_first_and_skips_a_failed_one` (DEC-0287: four complete sets, the newest current, plus one failed set holding rows for AAA; three results newest first, equal to the rows stored). The existing `test_the_history_lists_earlier_sets_newest_first_without_the_current_one` seeds two earlier sets and no failed set with rows | T008 |
| TC-INT-047 | A later set does not overwrite earlier classification rows | integration | factor-engine, research-store | Add `test_classification_cycle.py::test_a_newer_run_leaves_the_earlier_sets_rows_identical` (snapshot S1 rows, running application classifies a newer run, snapshot again, S2 rows exist separately). Store half annotated: `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged` | T011, T012 |
| TC-INT-048 | History for a never-classified stock is empty; unknown symbol is 404 | integration | classification-api, classification-reader | Annotate `test_api_classifications.py::test_the_history_carries_the_stored_restated_flag_and_a_new_stock_has_none` (NEW: 200, `sets == []`) and `::test_the_history_lists_earlier_sets_newest_first_without_the_current_one` (NOPE: 404). Together they assert both calls | T007 |
| TC-INT-049 | Backfill after a set does not alter it or backdate it | integration | factor-engine, research-store, classification-api | Add `test_classification_cycle.py::test_a_backfill_after_a_set_changes_only_the_next_set` (history of AAA before and after the backfill is identical and dated D; the next qualifying run, classified by the running application, reflects it at its own date). Store halves annotated: `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged` and `::test_backfill_before_the_build_is_seen_by_that_set` | T011, T012 |
| TC-INT-050 | A building later set leaves the previous set displayed and marked not current | integration | classification-api, classification-reader, classification-scheduler, research-store | Annotate `test_api_classification_summary.py::test_a_newer_set_is_carried_as_later_and_equals_the_list_read[building]` (`set` S1, `later` building, `not_current` true on both reads). Add an assertion that the list returns no row of the building set | T009 |
| TC-INT-051 | A failed build shows the failure and keeps the previous set | integration | classification-api, factor-engine, classification-scheduler, research-store | Annotate the same test's `failed` case (`later.state == "failed"`). Add the rows the case names: the failed set holds some `factor_classification` rows, `later.failure_reason` is shown, the list contains only S1 results | T009 |
| TC-INT-052 | Completing a set that is no longer building changes nothing | integration | factor-engine, research-store | Annotate `test_engine_transaction.py::test_completing_an_already_failed_set_updates_no_row_and_rolls_back` and `::test_set_failed_by_another_writer_mid_build_is_left_untouched` | T011 |
| TC-INT-053 | An interrupted building set is failed at start | integration | classification-scheduler, research-store | Annotate `test_scheduler_restart.py::test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run` (fixed interruption reason before any claim, next qualifying run classified; read from the store, which is what `GET /api/classifications/sets` returns). Add to the T012 cycle fixture a start of the application over a store holding a stale `building` set and a read of `GET /api/classifications/sets` | T011, T012 |
| TC-INT-054 | A build failure rolls back every row of the attempt | integration | factor-engine, research-store | Annotate `test_engine_transaction.py::test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` (zero rows in the three tables, set `failed` with class and message). It forces the failure with an injected stage and `engine.build`, not through the running product; the case's step 1 ("let the running product classify the run") is covered by T012's failed-build assertion | T011, T012 |
| TC-INT-055 | Sets list and set detail name the run and its start time | integration | classification-api, classification-reader, research-store | Annotate `test_api_classifications.py::test_the_sets_list_and_detail_agree` (`run_started_at` on every row; detail equals the list row). Add an assertion that the detail's `ended_at` (the produced-at) equals the list's and that two complete sets are listed newest first | T007, T008 |
| TC-INT-056 | Set detail for an unknown id returns 404 | integration | classification-api, classification-reader | Annotate the same test's unknown-id call (404 `classification_set_not_found`) | T007 |
| TC-INT-057 | Before any set exists, list and summary say nothing has been classified | integration | classification-api, classification-reader | Annotate `test_api_classifications.py::test_nothing_classified_says_so` (list) and `test_api_classification_summary.py::test_before_any_complete_set_the_summary_says_nothing_is_classified` (summary). Add one assertion in each file that the two bodies carry the same keys (the case says "in the same shape"; today each is checked on its own) | T007, T009 |
| TC-INT-058 | The restatement mark is carried on list, compare, evidence and history | integration | classification-api, classification-reader, factor-engine, research-store | Add `test_api_classifications.py::test_the_restatement_mark_is_on_value_and_growth_in_all_four_reads` (seeded stock with `restated=["value", "growth"]` in the current set and an earlier set; list, compare, evidence, history: `restated_possible` true on value and growth, never on momentum). Today list, evidence and history each assert it separately and compare not at all. Engine half annotated: `test_engine_restatement.py::test_statement_filed_before_first_observation_marks_its_inputs_and_classifications` | T008, T011 |

All 58 cases are automatable. TC-INT-031 is a performance case marked `slow` and
runs only when `-m slow` is selected (see Validation Plan).

## Test Infrastructure

**Framework**: pytest (`[tool.pytest.ini_options]` in `pyproject.toml`; markers
`postgres` and `slow`) with FastAPI `TestClient`; psycopg 3.
**Tools**: `testcontainers[postgres]` through `tests/conftest.py`
(`postgres_connection_string`, `migrated_connection_string`: one PostgreSQL 16
container per session, one database per test); the support modules
`reader_seed.py` (`insert_instrument`, `insert_run`, `insert_set`,
`insert_classification`, `insert_universe`, `seed_scored_stock`, `seed_inputs`),
`api_classification_support.py` (`classification_app`, `complete_set`,
`later_set`, `SCORE`), `scheduler_support.py` (`add_run`, `add_set`, `set_rows`),
`engine_support.py`, `engine_inputs_support.py` (`install_test_line_items`,
`add_statement`, `add_quarters`), `engine_proof_support.py`
(`populate_volume`, `populate_backdating`, `backfill_statement`, `snapshot_set`,
`complete_and_open_next`) and the `client` / `conn` / `database` fixtures of
`test_api_universes.py`. No new `conftest.py`.
**Environment**: a container runtime for every test (`postgres` marker). The running
application cases (T012, T013, T014) build the app with `create_app()` and
`FACTORFLOW_DATABASE_URL`, as the `client` fixture of `test_api_universes.py`
does, so the real lifespan starts the classification loop, with
`FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS=1` (the setting's floor is 1; its
default is 5). They apply `install_test_line_items` first (DEC-0286); the
`TestClient` runs the loop in the same process, so the patch is in force there.

## Phase 1: Test Infrastructure Setup

**Purpose**: Know the suite's state before any test changes.

- [ ] T001 Baseline: with a container runtime available, run `uv run pytest tests/integration -m "postgres and not slow" -q` from the repository root and record the pass count and any failure in the task notes before editing. Confirm `uv run python -c "from factorflow.classification import line_items; print(len(line_items.unresolved()))"` prints the unresolved count the plan assumes (non-zero, DEC-0286). If no container runtime is available, record that and run `uv run pytest -m 'not postgres'`; do not report a partial run as green (tech stack note).

**Checkpoint**: The starting pass count and the unresolved-key count are recorded.

---

## Phase 2: Test Utilities & Fixtures

**Purpose**: One shared helper for the cases that need the running application.

- [ ] T002 Create `tests/integration/classification_cycle_support.py` (depends on T001), a plain module like `reader_seed.py`, with: `running_product(connection_string, monkeypatch, poll_seconds=1)`, a context manager that sets `FACTORFLOW_DATABASE_URL` and `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS`, applies `install_test_line_items(monkeypatch)`, and yields a `TestClient(create_app(), base_url="http://127.0.0.1:8000")` so the lifespan starts the loop; `seed_roster(conn, count, last_session)` that calls `engine_proof_support.populate_volume` for the roster and returns its ids and classification date; `end_run(conn, state, ended_at)` over `scheduler_support.add_run`; and `wait_for_sets(client, count, timeout_seconds=60)`, which polls `GET /api/classifications/sets` once a second until `count` complete sets are listed and fails with the last body on timeout. Reuse the helpers named above; add nothing they already provide. Check the real signatures of `populate_volume`, `add_run` and `create_app` when writing it. Supports TC-INT-028, 029, 031, 047, 049, 053, 054.

**Checkpoint**: A test can start the real application over a seeded store, end acquisition runs, and wait for sets to appear without sleeping blindly.

---

## Phase 3: Test Implementation

**Purpose**: Make every case a marked, passing test. Add `# Implements CAP-002 TC-INT-NNN` on the line above each test (or inside the changed test, above the new assertions, with `(part: ...)`). Tasks that edit one file run in sequence.

### Universes routes (`tests/integration/test_api_universes.py`)

- [x] T003 Annotate in `tests/integration/test_api_universes.py` (depends on T001): TC-INT-002 on `test_create_naming_uncovered_symbols_is_refused_whole`; TC-INT-006 on `test_a_newer_complete_set_refuses_the_save`; TC-INT-008 on `test_a_filter_matching_nothing_is_empty_universe`; TC-INT-010 and TC-INT-011, TC-INT-015, TC-INT-016, TC-INT-017, TC-INT-018 on the tests named in the traceability table; TC-INT-020 (part), TC-INT-022 on `test_as_of_reads_past_membership`; TC-INT-023 on `test_unknown_universes_and_members_are_404`; TC-INT-001 (part), TC-INT-003 (part), TC-INT-005 (part), TC-INT-013 (part), TC-INT-014 (part) on their tests. Markers only, no logic change.
- [ ] T004 In `tests/integration/test_api_universes.py` (depends on T003): TC-INT-001 add `test_create_with_a_current_set_carries_a_classification_cell_per_member` using `seed_classified` extended to 30 stocks (or `complete_set` and `seed_scored_stock` over 30 symbols); TC-INT-003 add the GET straight after the add in `test_add_and_remove_keep_the_dated_record` (members AAA and BBB); TC-INT-004 add `test_adding_an_uncovered_symbol_is_refused_and_membership_is_unchanged`; TC-INT-005 extend `test_create_from_a_result_saves_the_filter_match_with_provenance` with the pre-POST `GET /api/classifications` and the comparison of symbols and `match_count`, and the re-read of members and origin.
- [ ] T005 In `tests/integration/test_api_universes.py` (depends on T004): TC-INT-007 add `test_a_filter_universe_keeps_its_members_when_a_newer_set_matches_differently` (reuse `seed_classified`, `seed_set`, `classify`); TC-INT-009 add `test_one_stock_in_two_universes_is_listed_in_both_and_in_its_evidence` (create U1 and U2 holding AAA by API, seed a complete set with AAA scored); TC-INT-010 add the count of active universes named Core; TC-INT-012 add the read-back of the renamed-to universe's name in `test_names_are_unique_among_active_universes_after_trimming`; TC-INT-013 add the name read-back after the refused PATCH in `test_retire_keeps_members_and_events_and_refuses_every_write`; TC-INT-014 add the default list (absent) and `lifecycle=retired` list (present) after the retire.
- [ ] T006 In `tests/integration/test_api_universes.py` (depends on T005): TC-INT-019 add `test_as_of_returns_the_membership_of_each_date` (set `universe_event.recorded_at` and `recorded_on` for the three dates directly on `conn`, in the way `tests/integration/test_universe_as_of.py` does; read its helper first and reuse it rather than redefining it); TC-INT-020 add the creation-date assertion on the before-creation response; TC-INT-021 add `test_events_list_every_kind_newest_first`.

### Classification routes (`tests/integration/test_api_classifications.py`, `test_api_classification_summary.py`)

- [x] T007 [P] Annotate in `tests/integration/test_api_classifications.py` (depends on T001): TC-INT-027 on `test_the_list_carries_the_set_the_factors_and_string_scores`; TC-INT-033 (part) on `test_thresholds_and_hide_incomplete_follow_the_documented_rule`; TC-INT-038, 040, 041 on `test_compare_reports_unknown_symbols_and_enforces_its_bounds`; TC-INT-042 on `test_an_altered_cursor_is_invalid_and_one_for_an_older_set_is_stale`; TC-INT-043 on `test_a_universe_scopes_the_list_and_an_unknown_one_is_404`; TC-INT-044 (part), TC-INT-045 on `test_the_evidence_shows_inputs_with_their_dates_and_memberships`; TC-INT-048 on the two history tests; TC-INT-055 (part), TC-INT-056 on `test_the_sets_list_and_detail_agree`; TC-INT-057 (part) on `test_nothing_classified_says_so`. Update the module docstring's "Overlaps TC-INT-... (cited, not claimed)" sentence to say these cases are now claimed by `# Implements CAP-002 TC-INT-NNN` markers.
- [ ] T008 In `tests/integration/test_api_classifications.py` (depends on T007): add `test_a_stocks_scores_are_the_same_unscoped_and_in_each_universe` (TC-INT-026; AAA in U1 and U2 via `insert_universe`, three GETs, compare score and percentile for the three factors); add the `match_count` assertion and a classified stock below a bound of 50 to the threshold test (TC-INT-033); add `test_fewer_than_thirty_qualifying_stocks_show_no_growth_score` (TC-INT-036; 29 stocks with growth `("not_enough_stocks", ...)` and the other factors scored, read the list and the summary; take the reason's "29 of 30" wording from the stored `reason_detail` you seed, which the engine writes, see `test_engine_peer_set.py::test_the_unranked_reason_states_the_floor_in_force`); add `test_a_retired_stock_is_hidden_unscoped_and_retired_in_its_universe` (TC-INT-037; `lifecycle="retired"` with `("retired", None)` on all three factors); add `test_a_sorted_list_pages_with_a_stable_match_count` (TC-INT-039; 25 stocks, `sort=value_percentile` or another value from the reader's allow-list `tests/unit/test_reader_sort_allowlist.py` lists, `order=desc`, `limit=10`); add the value, `as_of` and `known_on` assertions (TC-INT-044) by passing `values=` to `seed_inputs`; add `test_the_history_lists_three_earlier_complete_sets_newest_first_and_skips_a_failed_one` (TC-INT-046, DEC-0287); add the `ended_at` equality and two-set ordering assertion to the sets test (TC-INT-055); add `test_the_restatement_mark_is_on_value_and_growth_in_all_four_reads` (TC-INT-058; list, `symbols=AAA,BBB`, evidence, history); add the same-keys assertion (TC-INT-057).
- [ ] T009 [P] In `tests/integration/test_api_classification_summary.py` (depends on T001): annotate TC-INT-035 on `test_the_summary_counts_the_current_stocks` and `test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count`; TC-INT-050 (part) and TC-INT-051 (part) on `test_a_newer_set_is_carried_as_later_and_equals_the_list_read`; TC-INT-057 (part) on `test_before_any_complete_set_the_summary_says_nothing_is_classified`. Add to the `building` and `failed` parametrisations: one `factor_classification` row on the later set (use `insert_classification`) and the assertion that `GET /api/classifications` returns none of the later set's rows and, for `failed`, that `later.failure_reason` equals the stored text (TC-INT-050, 051). Add the same-keys assertion against the list body (TC-INT-057).

### Store, engine and scheduler

- [ ] T010 [P] In `tests/integration/test_research_migrations_apply.py` (depends on T001): add `test_migrator_applies_0005_and_0006_from_0004_and_reapplies_nothing` (TC-INT-024) using `seed_cap_001_rows`, `cap_001_tables`, `snapshot_cap_001` and `apply_pending` already in that module; assert versions `[5, 6]`, CAP-001 snapshot unchanged, and `apply_pending(conn, files) == []` on the second call.
- [x] T011 [P] Annotate the store and engine halves (depends on T001), markers only: `tests/integration/test_universe_filter_snapshot.py::test_a_later_set_that_changes_the_matches_leaves_the_members_unchanged` (TC-INT-007, part); `test_engine_peer_set.py::test_scores_are_identical_whatever_the_universe_membership` (TC-INT-026, part), `::test_a_factor_ranks_only_from_thirty_qualifying_stocks` (TC-INT-036, part), `::test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` (TC-INT-037, part); `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed` (TC-INT-028 and TC-INT-029, part), `::test_qualifying_runs_are_claimed_oldest_first_once_each` (TC-INT-028, part), `::test_claim_returns_none_when_the_run_acquired_a_set_between_statements` (TC-INT-030); `test_research_constraints.py::test_a_second_set_for_the_same_run_is_refused` (TC-INT-030); `test_scheduler_restart.py::test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run` (TC-INT-053, part); `test_engine_transaction.py::test_completing_an_already_failed_set_updates_no_row_and_rolls_back` and `::test_set_failed_by_another_writer_mid_build_is_left_untouched` (TC-INT-052), `::test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` (TC-INT-054, part), `::test_backfill_after_completion_leaves_the_set_unchanged` (TC-INT-047 and TC-INT-049, part), `::test_backfill_before_the_build_is_seen_by_that_set` (TC-INT-049, part); `test_engine_currency.py::test_fundamentals_outdated_at_six_months_and_a_day` and `::test_fundamentals_present_at_exactly_six_months` (TC-INT-034, part); `test_engine_restatement.py::test_statement_filed_before_first_observation_marks_its_inputs_and_classifications` (TC-INT-058, part); `test_engine_volume.py::test_3000_instruments_build_within_the_budget` (TC-INT-031, part). These tests already carry `# Implements TC-COMP-NNN`; add the CAP-002 line beside it, do not replace it.

### Running application

- [ ] T012 Create `tests/integration/test_classification_cycle.py` (depends on T002, T011) with module `pytestmark = pytest.mark.postgres`, each test over `running_product` and a store migrated through 0006, reading results only through HTTP: (a) TC-INT-028 two ended runs (one `succeeded`, one `partial`, distinct `ended_at`), `wait_for_sets(2)`, sets listed with their `run_id`, created in `ended_at` order; (b) TC-INT-029 one `failed`, one `cancelled`, one `abandoned` run (one with `daily_bar` observations written), wait several poll intervals (at least 4 s), `GET /api/classifications/sets` returns no set; (c) TC-INT-047 a roster of 30 or more stocks and run R1, wait for S1, snapshot S1's rows in `classification_set_factor`, `factor_input` and `factor_classification` through `engine_proof_support.snapshot_set`, end run R2, wait for S2, snapshot S1 again (identical) and assert S2 rows exist separately; (d) TC-INT-049 the backdating population (`populate_backdating`, `backfill_statement`): S1 at D, read `GET /api/classifications/stocks/AAA/history` after a further set exists, backfill an earlier fundamental, history unchanged and still dated D, then S2 reflects the backfill at its own date; (e) TC-INT-053 start the application over a store holding a stale `building` set and a succeeded run, `GET /api/classifications/sets` shows the stale set `failed` with the fixed interruption reason (`INTERRUPTED_REASON` in `test_scheduler_restart.py`) and the next qualifying run `complete`; (f) TC-INT-054 (part) make the engine fail for one run (monkeypatch `engine._STAGES` with the failing stage `test_engine_transaction.py::write_rows_then_raise` builds, or the equivalent) and assert the set is `failed` and the sets list shows that failure. Use `time.monotonic` deadlines in `wait_for_sets`, never a bare `sleep` of the whole wait.
- [ ] T013 [P] Create `tests/integration/test_classification_after_build.py` (depends on T002) with `pytestmark = pytest.mark.postgres`: a 30-stock roster built with real statements through `engine_inputs_support.add_quarters` / `add_statement` and bars, `engine.build` under `install_test_line_items`, then the API through `classification_app`: (a) TC-INT-025 `test_evidence_lists_the_eight_inputs_from_a_build` (eight inputs, grouped under value, growth, momentum, each with value, `as_of`, `known_on`); (b) TC-INT-032 `test_a_missing_value_input_is_named_and_the_other_factors_still_score` (one stock without a cash-flow statement); (c) TC-INT-034 `test_a_fundamental_one_day_past_six_months_is_outdated_and_exactly_six_months_is_present` (AAA latest period ended six months and a day before the classification date, BBB exactly six months; use `engine_inputs_support.months_before`). Build the roster with one helper in the file, parameterised by the number of quarters and the latest period end.
- [ ] T014 [P] Create `tests/integration/test_classification_latency.py` (depends on T002) with `@pytest.mark.slow` and `@pytest.mark.postgres`: TC-INT-031 `test_a_3000_stock_run_is_summarised_within_five_minutes_of_its_end` seeding with `seed_roster(conn, 3000, LAST_SESSION)` (same population and date as `test_engine_volume.py`), starting `running_product`, inserting the `succeeded` run with `ended_at` set at T, polling `GET /api/classifications/summary` every second until `set` is not null and its `run_id` is the run, and asserting `monotonic elapsed <= 300` (AC-11's five minutes; the build budget is 295 s plus the one-second poll). Print the elapsed time as `test_engine_volume.py` does.

**Checkpoint**: Every one of the 58 test cases has at least one test marked `# Implements CAP-002 TC-INT-NNN`, and every Expected Result bullet of the case is asserted by that test or one of the tests listed for the case.

---

## Phase 4: Test Validation & Cleanup

**Purpose**: Prove the suite is green, isolated and traceable.

- [ ] T015 Run the integration suite: `uv run pytest tests/integration -m "postgres and not slow" -q`, then `uv run pytest tests/integration/test_classification_latency.py -m slow -q`; confirm both pass. Then check traceability: `grep -rhoE "Implements CAP-002 TC-INT-0[0-9]{2}" tests | sort -u | wc -l` prints 58 and no TC-INT number from 001 to 058 is missing. Depends on T003 to T014.
- [ ] T016 Isolation: run `tests/integration/test_classification_cycle.py` and `tests/integration/test_classification_after_build.py` each alone, then twice in the same session, and `tests/integration/test_api_universes.py` with `-p no:randomly` and again in reverse file order; confirm no test relies on another test's data or on the monkeypatch of a previous test, and that no application thread or classification loop outlives its `TestClient`. Remove duplicated seed code and unused imports. Depends on T015.
- [ ] T017 Project gates on the changed files: `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv run pytest -m 'not postgres'` (confirms nothing outside the `postgres` marker broke). New test modules must not weaken the repo's strict mypy settings, which cover `src` only. Depends on T016.

**Checkpoint**: All 58 cases pass, the suite is isolated, lint and format are clean, and the marker count is 58.

---

## Dependencies & Execution Order

### Task Dependencies
- T001: no dependencies.
- T002, T003, T007, T009, T010, T011: depend on T001 only; different files, parallel.
- T004 depends on T003; T005 on T004; T006 on T005 (same file, sequential).
- T008 depends on T007 (same file).
- T012 depends on T002 and T011. T013 and T014 depend on T002.
- T015 depends on T003 to T014. T016 depends on T015. T017 depends on T016.

### Parallel Opportunities
- After T001: T002, T003, T007, T009, T010, T011 together.
- After T002: T012, T013, T014 together (three new files).
- The three chains `test_api_universes.py` (T003 to T006), `test_api_classifications.py` (T007, T008) and the new running-application files can proceed side by side.

### Phase Dependencies
Phase 1, then Phase 2, then Phase 3, then Phase 4. Annotation tasks do not need Phase 2 and may start straight after T001.

---

## Validation Plan

### Constitution-Defined Commands
(`docs/constitution/tech-stack.md`, Validation Commands, working directory `.`)
- Build: `uv build`
- Test: `uv run pytest`, `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`, `uv run mypy src`
- Format: `uv run ruff format --check .`

### Test-Specific Validation
- Run the integration scope: `uv run pytest tests/integration -m "postgres and not slow" -q`
- Run the slow performance case: `uv run pytest tests/integration/test_classification_latency.py -m slow -q`
- Traceability: `grep -rhoE "Implements CAP-002 TC-INT-0[0-9]{2}" tests | sort -u | wc -l` must print `58`.
- Expected result: the baseline pass count from T001 plus the new tests, none failing, none skipped for a missing runtime. Every `postgres` run needs a container runtime; report a missing runtime instead of a partial green (tech stack note).

---

## Notes

- **Marker format.** CAP-001's integration plan used bare `TC-INT-001` to `TC-INT-027`, and those markers are in the repo. CAP-002 reuses the numbers, so its markers read `Implements CAP-002 TC-INT-NNN`. A reader or tool matching a bare `TC-INT-NNN` finds CAP-001 and CAP-002 tests together; the count check in the Validation Plan uses the `CAP-002` prefix to avoid that.
- **DEC-0286 (PROVISIONAL).** Cases whose Expected Result needs an engine build to produce value or growth (TC-INT-025, 031, 032, 034, 036 in part) run with `install_test_line_items`, the established test seam. They prove engine and API behaviour over test keys. They do not prove the real Massive payload keys: that is the open system design question 1 and the guarded e2e cases of DEC-0285. When the keys resolve, no integration test needs changing, but the owner may add one that builds from the stub provider's real payloads.
- **TC-INT-046 wording (DEC-0287).** The specification's precondition ("three complete sets and one failed set" yielding "three results") disagrees with the approved design: the current set is excluded from history (DEC-0137; `component-design-classification-reader.md` section 7; `test_reader_history.py`). The plan keeps the three results and adds a fourth complete set. The owner may want the precondition reworded at the next test-design revision; this plan does not edit the specification.
- **Seeded versus built API tests.** The API suites seed `classification_set` rows directly (`reader_seed.py`), so they prove the routes and the reader, not the build. TC-INT-025, 032 and 034 therefore run a real build (T013); the rest keep the seeded form that the delivered tests use, because the build behaviour behind them is asserted at store level and annotated in T011.
- **Cases covered in two halves.** Where the table says "store half annotated", the case is complete only when both the annotated test and the new running-application or API test pass. A reviewer should read both.
- **Case with no distinct input in the specification.** TC-INT-022 names `not-a-date`; the existing test sends `2026-13-40`. Both are rejected by the same date parse, so the plan annotates rather than adds. If the owner wants the literal input, change the string in that one call.
- **Duplicate symbols (TC-INT-001 edge case).** The specification records it as a coverage note, not tested. No task covers it.
- **TC-INT-053 via the API.** The restart test reads the store directly. T012(e) adds the `GET /api/classifications/sets` read the case names.
- **Risk: running-application tests.** T012 to T014 depend on the lifespan starting the loop and on `install_test_line_items` reaching the loop's thread. Both hold in process today (`tests/unit/test_api_classification_lifespan.py`), but the coding agent should confirm with one run before writing all six tests, and report if a test needs the loop's poll interval below the setting's floor of 1 second.
- **Suite constraints.** No task edits `src/`, `playwright.config.ts`, or any specification. No task writes into a third-party repo. The slow test needs several minutes and about the memory `test_engine_volume.py` needs.
