---
artifact_schema_version: 1
artifact_id: CAP-002-integration-tests-automation-review
artifact_type: automation-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests-automation-tasks.md
reviewed_at: 2026-11-07T15:46:11Z
reviewed_state_revision: sha256:b35e025162254ea0c2f059a57b0b5b642de8a5c073661ae9484b2332ebbea295
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
  timestamp: 2026-11-07T15:46:11Z
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
| Findings | 2 |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

Version 4 passed with warnings. It recorded `reviewed_state_revision`
`sha256:a0b0c397…659f`. Pipeline state now marks it stale ("automation code
changed after review"), because two merged expedited changes touched tests
after it. The fingerprint is now `sha256:b35e0251…a295` at `829c9e1`. This
review supplies evidence at that commit.

- **EXP-20261107-2** (PR #178, owner-approved) does reach this scope. It
  changes `tests/integration/test_api_universes.py`, the file that holds
  TC-INT-001 to TC-INT-023. Its `client` fixture now replaces the live
  classification scheduler with the idle stand-in from
  `api_classification_support.py`. The change also adds one regression test.
  No marker line and no marked test body changed. Every TC-INT case in the
  module seeds its classification sets itself. None of them names
  classification-scheduler as a component. So idling the loop keeps each
  case's intent. It also removes a race that could have changed those cases'
  results.
- **EXP-20261107-3** (PR #179) does not reach this scope. It bumps the version
  to 0.2.0 in `pyproject.toml`, `uv.lock`, `package.json`,
  `package-lock.json` and `README.md`, and it adds the unit test
  `tests/unit/test_version_agreement.py`. No integration test and no source
  file reads the version.

All nine required commands passed on a fresh run. The integration scope rose
from 930 to 931 passed. The extra test is EXP-20261107-2's regression test.
The full suite rose from 2608 to 2610 passed: that regression test plus the
version-agreement unit test.

Both findings are LOW and concern the task plan only. AR-001 carries over
from version 4 unchanged, because the plan has not changed since then (same
content revision). AR-002 is new: the plan's Test Infrastructure section still
says the `client` fixture of `test_api_universes.py` starts the real
classification loop, which stopped being true with EXP-20261107-2.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md` (CAP-002-integration-tests v1, status `draft`). Its content revision `sha256:f6885286…` is unchanged since version 1.
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests-automation-tasks.md` (v1, status `draft`, `last_reworked_review: integration-tests-automation-review-v2.md`; T001 to T017 all checked). Its content revision `sha256:6340bf69…` is unchanged since version 3.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2`, branch `usr/alvaro-de-jodra/CAP-002-automation-rework`, HEAD `829c9e1` (the CAP-002 release merge), equal to `origin/main`.
- **Since version 4:** version 4 reviewed `b8ff14b`, and its fingerprint held through `efac1ab`. `git diff --stat efac1ab HEAD -- . ':!docs'` lists seven files: `README.md`, `package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock` (all EXP-20261107-3, version only), `tests/unit/test_version_agreement.py` (EXP-20261107-3, new) and `tests/integration/test_api_universes.py` (EXP-20261107-2, `0620fbd`, +9 lines). `git diff efac1ab HEAD -- src` is empty. The remaining commits since `b8ff14b` are documentation: the EXP records and reviews, the story status moves to `done`, the e2e review v5 and the integration review v4.
- **Out of this review's coverage:** the version bump files and `tests/unit/test_version_agreement.py` belong to EXP-20261107-3 and its review v1. They are not TC-INT automation, so they are not listed below. This review read them only to confirm that they do not reach the integration scope. A grep for `0.1.0`, `0.2.0`, `__version__` and `importlib.metadata` in `tests/integration` and `src` finds nothing. `tests/e2e/` belongs to the e2e specification's review.
- **Working tree:** `git status --porcelain` lists one untracked file both before and after validation: `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-review-v6.md`. A concurrent e2e reviewer is writing it. It is documentation, which the fingerprint excludes, and it is outside this scope. `uv build` wrote its artefacts to the scratchpad with `--out-dir`. Its `src/factorflow.egg-info` is ignored. The `automation-revision` fingerprint is `sha256:b35e0251…a295` both before and after the commands.
- **Decisions in force:** unchanged from version 4: DEC-0286 (PROVISIONAL, still `status: open`, `owner_reviewed: false`; its premise is superseded, see AR-001), DEC-0287, DEC-0292, DEC-0293, DEC-0294 and DEC-0295.

### Changed Files

| File | Change |
| --- | --- |
| `tests/integration/test_api_universes.py` | modified (`0620fbd`, EXP-20261107-2): the `client` fixture now runs `monkeypatch.setattr(app_module, "run_classification_loop", _idle_scheduler)` before it enters `TestClient(create_app())`, with two new imports (`factorflow.api.app as app_module`, and `_idle_scheduler` from `tests.integration.api_classification_support`). The change also adds the non-TC-INT regression test `test_the_client_runs_no_classification_scheduler`. No `# Implements CAP-002 TC-INT-NNN` line and no TC-INT test body changed. |

## Test Case and Traceability Verification

All test paths are under `tests/integration/`. The traceability grep prints
`58`, and a loop over 001 to 058 finds no number missing.
`git diff b8ff14b HEAD -- tests` adds or removes no line that matches
`Implements` or `TC-INT`.

**How the EXP-20261107-2 change was judged (TC-INT-001 to TC-INT-023).**

- **Patch target.** `src/factorflow/api/app.py:37` imports
  `run_classification_loop` into the module namespace, and `_lifespan` looks
  the name up when it starts the task (`app.py:207-208`). So patching the
  `app_module` attribute before `TestClient` is entered replaces the loop that
  the lifespan starts. `api_classification_support.classification_app`
  patches the same target, and the classification API cases have used it
  since version 1. `tests/unit/test_api_classification_lifespan.py`
  (TC-COMP-087) pins that the lifespan starts whatever this attribute names.
- **What still runs.** The reclaim loop (`_run_reclaim_loop`) stays real. It
  sweeps only stale `running` acquisition runs, and this module seeds none.
- **What the cases need.** None of TC-INT-001 to TC-INT-023 names
  classification-scheduler in its Component(s) line. Their components are
  classification-api, universe-service, classification-reader and
  research-store. Every precondition that needs a classification set (001,
  005, 006, 007, 008, 009) is met by `seed_set` or `classify`. No test in the
  module waits for a scheduler-built set or asserts one.
- **Effect on determinism.** Before this change, a scheduler poll could claim a
  seeded succeeded run, which caused the CI `UniqueViolation`. A
  scheduler-built set could also have become the current set and changed what
  TC-INT-001, 005, 006 and 007 read. The change removes both paths. The cases
  now test exactly their stated preconditions.
- **The cases that do need the real loop are untouched.** TC-INT-028, 029,
  031, 047, 049, 053 and 054 start the application through
  `classification_cycle_support.running_product`. That helper does not use
  this fixture and does not patch the loop. It passed in the full suite, in
  the integration scope and in the slow run.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-INT-001 | VERIFIED | `test_api_universes.py::test_create_with_a_current_set_carries_a_classification_cell_per_member`; part `::test_create_by_hand_returns_and_reads_the_replayed_universe` | Fixture now idles the loop. The set is seeded by `seed_set`; the body and marker are unchanged. The by-hand part asserts `set is None` with no run seeded, and the outcome is the same either way. Passed in 8 sessions (full suite, integration scope, 5 sequential module runs, 1 reverse-order run) |
| TC-INT-002 | VERIFIED | `test_api_universes.py::test_create_naming_uncovered_symbols_is_refused_whole` | Fixture idles the loop; no set involved; passed (8 sessions) |
| TC-INT-003 | VERIFIED | `test_api_universes.py::test_add_and_remove_keep_the_dated_record` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-004 | VERIFIED | `test_api_universes.py::test_adding_an_uncovered_symbol_is_refused_and_membership_is_unchanged` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-005 | VERIFIED | `test_api_universes.py::test_create_from_a_result_saves_the_filter_match_with_provenance` | Set S is seeded. With the loop idle, no scheduler-built set can supersede S between the step-1 read and the save. Passed (8 sessions) |
| TC-INT-006 | VERIFIED | `test_api_universes.py::test_a_newer_complete_set_refuses_the_save` | The newer set S2 is seeded explicitly (`seed_set(...)` at the `newer =` line), as the precondition says. Passed (8 sessions) |
| TC-INT-007 | VERIFIED | `test_api_universes.py::test_a_filter_universe_keeps_its_members_when_a_newer_set_matches_differently`; part `test_universe_filter_snapshot.py::test_a_later_set_that_changes_the_matches_leaves_the_members_unchanged` | S and S2 are both seeded. The store half is unchanged since v4. Passed |
| TC-INT-008 | VERIFIED | `test_api_universes.py::test_a_filter_matching_nothing_is_empty_universe` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-009 | VERIFIED | `test_api_universes.py::test_one_stock_in_two_universes_is_listed_in_both_and_in_its_evidence` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-010 | VERIFIED | `test_api_universes.py::test_names_are_unique_among_active_universes_after_trimming` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-011 | VERIFIED | `test_api_universes.py::test_rename_keeps_the_id_and_the_history` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-012 | VERIFIED | same test as TC-INT-010 | Fixture idles the loop; passed (8 sessions) |
| TC-INT-013 | VERIFIED | `test_api_universes.py::test_retire_keeps_members_and_events_and_refuses_every_write` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-014 | VERIFIED | same test | Fixture idles the loop; passed (8 sessions) |
| TC-INT-015 | VERIFIED | same test | Fixture idles the loop; passed (8 sessions) |
| TC-INT-016 | VERIFIED | `test_api_universes.py::test_add_and_remove_keep_the_dated_record` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-017 | VERIFIED | `test_api_universes.py::test_an_empty_create_is_empty_universe_and_writes_nothing` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-018 | VERIFIED | `test_api_universes.py::test_removing_the_sole_member_is_refused_then_retired_refuses_writes` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-019 | VERIFIED | `test_api_universes.py::test_as_of_returns_the_membership_of_each_date` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-020 | VERIFIED | `test_api_universes.py::test_as_of_reads_past_membership` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-021 | VERIFIED | `test_api_universes.py::test_events_list_every_kind_newest_first` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-022 | VERIFIED | `test_api_universes.py::test_as_of_reads_past_membership` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-023 | VERIFIED | `test_api_universes.py::test_unknown_universes_and_members_are_404` | Fixture idles the loop; passed (8 sessions) |
| TC-INT-024 | VERIFIED | `test_research_migrations_apply.py::test_migrator_applies_0005_and_0006_from_0004_and_reapplies_nothing` | Unchanged since v4; passed |
| TC-INT-025 | VERIFIED | `test_classification_after_build.py::test_evidence_lists_the_eight_inputs_from_a_build` | Unchanged since v4 (test, helpers and SQL); passed |
| TC-INT-026 | VERIFIED | `test_api_classifications.py::test_a_stocks_scores_are_the_same_unscoped_and_in_each_universe`; part `test_engine_peer_set.py::test_scores_are_identical_whatever_the_universe_membership` | Unchanged since v4; passed |
| TC-INT-027 | VERIFIED | `test_api_classifications.py::test_the_list_carries_the_set_the_factors_and_string_scores` | Unchanged since v4; passed |
| TC-INT-028 | VERIFIED | `test_classification_cycle.py::test_succeeded_and_partial_runs_each_get_a_set_in_ended_at_order`; part `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed`, `::test_qualifying_runs_are_claimed_oldest_first_once_each` | Unchanged since v4. Uses the real loop through `running_product`, which EXP-20261107-2 does not touch. Passed |
| TC-INT-029 | VERIFIED | `test_classification_cycle.py::test_failed_cancelled_and_abandoned_runs_get_no_set`; part `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed` | As TC-INT-028; passed |
| TC-INT-030 | VERIFIED | `test_scheduler_claim.py::test_claim_returns_none_when_the_run_acquired_a_set_between_statements`; `test_research_constraints.py::test_a_second_set_for_the_same_run_is_refused` | Unchanged since v4; passed |
| TC-INT-031 | VERIFIED | `test_classification_latency.py::test_a_3000_stock_run_is_summarised_within_five_minutes_of_its_end`; part `test_engine_volume.py::test_3000_instruments_build_within_the_budget` | Unchanged since v4. Rerun: `run end to summarised: 4.110s` (v4: 3.064 s; limit 300 s). The engine-budget half passed in the full suite |
| TC-INT-032 | VERIFIED | `test_classification_after_build.py::test_a_missing_value_input_is_named_and_the_other_factors_still_score` | Unchanged since v4; passed |
| TC-INT-033 | VERIFIED | `test_api_classifications.py::test_thresholds_and_hide_incomplete_follow_the_documented_rule` | Unchanged since v4; passed |
| TC-INT-034 | VERIFIED | `test_classification_after_build.py::test_a_fundamental_one_day_past_six_months_is_outdated_and_exactly_six_months_is_present`; part `test_engine_currency.py::test_fundamentals_outdated_at_six_months_and_a_day`, `::test_fundamentals_present_at_exactly_six_months` | Unchanged since v4; passed |
| TC-INT-035 | VERIFIED | `test_api_classification_summary.py::test_the_summary_counts_the_current_stocks`, `::test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count` | Unchanged since v4; passed |
| TC-INT-036 | VERIFIED | `test_api_classifications.py::test_fewer_than_thirty_qualifying_stocks_show_no_growth_score`; part `test_engine_peer_set.py::test_a_factor_ranks_only_from_thirty_qualifying_stocks` | Unchanged since v4; passed |
| TC-INT-037 | VERIFIED | `test_api_classifications.py::test_a_retired_stock_is_hidden_unscoped_and_retired_in_its_universe`; part `test_engine_peer_set.py::test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` | Unchanged since v4; passed |
| TC-INT-038 | VERIFIED | `test_api_classifications.py::test_compare_reports_unknown_symbols_and_enforces_its_bounds` | Unchanged since v4; passed |
| TC-INT-039 | VERIFIED | `test_api_classifications.py::test_a_sorted_list_pages_with_a_stable_match_count` | Unchanged since v4; passed |
| TC-INT-040 | VERIFIED | same compare test | Unchanged since v4; passed |
| TC-INT-041 | VERIFIED | same compare test | Unchanged since v4; passed |
| TC-INT-042 | VERIFIED | `test_api_classifications.py::test_an_altered_cursor_is_invalid_and_one_for_an_older_set_is_stale` | Unchanged since v4; passed |
| TC-INT-043 | VERIFIED | `test_api_classifications.py::test_a_universe_scopes_the_list_and_an_unknown_one_is_404` | Unchanged since v4; passed |
| TC-INT-044 | VERIFIED | `test_api_classifications.py::test_the_evidence_shows_inputs_with_their_dates_and_memberships` | Unchanged since v4; passed |
| TC-INT-045 | VERIFIED | same test | Unchanged since v4; passed |
| TC-INT-046 | VERIFIED | `test_api_classifications.py::test_the_history_lists_the_earlier_complete_sets_newest_first_and_skips_a_failed_one` | Unchanged since v4; passed. Still checked against DEC-0287 as the owner ruled it (two results) |
| TC-INT-047 | VERIFIED | `test_classification_cycle.py::test_a_newer_run_leaves_the_earlier_sets_rows_identical`; part `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged` | Unchanged since v4; real loop through `running_product`; passed |
| TC-INT-048 | VERIFIED | `test_api_classifications.py::test_the_history_carries_the_stored_restated_flag_and_a_new_stock_has_none`, `::test_the_history_lists_earlier_sets_newest_first_without_the_current_one` | Unchanged since v4; passed |
| TC-INT-049 | VERIFIED | `test_classification_cycle.py::test_a_backfill_after_a_set_changes_only_the_next_set`; part `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged`, `::test_backfill_before_the_build_is_seen_by_that_set` | Unchanged since v4; passed |
| TC-INT-050 | VERIFIED | `test_api_classification_summary.py::test_a_newer_set_is_carried_as_later_and_equals_the_list_read[building]` | Unchanged since v4; passed |
| TC-INT-051 | VERIFIED | same test `[failed]` | Unchanged since v4; passed |
| TC-INT-052 | VERIFIED | `test_engine_transaction.py::test_completing_an_already_failed_set_updates_no_row_and_rolls_back`, `::test_set_failed_by_another_writer_mid_build_is_left_untouched` | Unchanged since v4; passed |
| TC-INT-053 | VERIFIED | `test_classification_cycle.py::test_an_application_start_fails_a_stale_building_set_and_classifies_the_next_run`; part `test_scheduler_restart.py::test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run` | Unchanged since v4; real loop through `running_product`; passed |
| TC-INT-054 | VERIFIED | `test_engine_transaction.py::test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set`; part `test_classification_cycle.py::test_a_failing_build_is_listed_as_failed_and_leaves_no_rows` | Unchanged since v4; passed |
| TC-INT-055 | VERIFIED | `test_api_classifications.py::test_the_sets_list_and_detail_agree` | Unchanged since v4; passed |
| TC-INT-056 | VERIFIED | same test | Unchanged since v4; passed |
| TC-INT-057 | VERIFIED | `test_api_classifications.py::test_nothing_classified_says_so`; `test_api_classification_summary.py::test_before_any_complete_set_the_summary_says_nothing_is_classified` | Unchanged since v4; passed |
| TC-INT-058 | VERIFIED | `test_api_classifications.py::test_the_restatement_mark_is_on_value_and_growth_in_all_four_reads`; part `test_engine_restatement.py::test_statement_filed_before_first_observation_marks_its_inputs_and_classifications` | Unchanged since v4; passed |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | commit `d39bee0` message; task plan Notes | Historical baseline, satisfied when it ran. The probe still prints `0` against the plan's recorded `7`; see AR-001 (carried). |
| T002 | VERIFIED | `tests/integration/classification_cycle_support.py` | Unchanged since v4. `running_product` still starts the real loop. It neither uses nor depends on the universes `client` fixture. |
| T003 | VERIFIED | `tests/integration/test_api_universes.py` | Every T003 marker is present and byte-identical. The fixture change does not alter any annotated test. |
| T004 | VERIFIED | `tests/integration/test_api_universes.py` | The TC-INT-001, 003, 004 and 005 tests and assertions are unchanged. They run over the idle-loop fixture and pass. |
| T005 | VERIFIED | `tests/integration/test_api_universes.py` | The TC-INT-007, 009, 010, 012, 013 and 014 tests and assertions are unchanged and pass. |
| T006 | VERIFIED | `tests/integration/test_api_universes.py` | The TC-INT-019, 020 and 021 tests and assertions are unchanged and pass. |
| T007 | VERIFIED | `tests/integration/test_api_classifications.py` | Unchanged since v4 |
| T008 | VERIFIED | `tests/integration/test_api_classifications.py` | Unchanged since v4 |
| T009 | VERIFIED | `tests/integration/test_api_classification_summary.py` | Unchanged since v4 |
| T010 | VERIFIED | `tests/integration/test_research_migrations_apply.py` | Unchanged since v4 |
| T011 | VERIFIED | `tests/integration/test_engine_*.py`, `test_scheduler_*.py`, `test_research_constraints.py`, `test_universe_filter_snapshot.py` | Unchanged since v4; all eighteen markers present |
| T012 | VERIFIED | `tests/integration/test_classification_cycle.py` | Unchanged since v4 |
| T013 | VERIFIED | `tests/integration/test_classification_after_build.py` | Unchanged since v4 |
| T014 | VERIFIED | `tests/integration/test_classification_latency.py` | Unchanged since v4. Slow case rerun at 4.110 s |
| T015 | VERIFIED | rerun below | 931 passed (930 plus the EXP-20261107-2 regression test). The slow case passed and the marker count is 58. |
| T016 | VERIFIED | rerun below | `test_api_universes.py`, the module the change touched, passed with `-p no:randomly` five times in a row (30 passed each run, no flake). It passed once more with its 30 node IDs given in reverse collection order. Each `TestClient` exits its lifespan, which cancels the idle task, so no loop outlives its client. The full suite and the integration scope also passed. |
| T017 | VERIFIED | rerun below | Ruff, format, mypy and `not postgres` are clean |

## Independent Validation

The working directory is `repos/factorflow-v2/FactorFlow-v2`. As in version
4, every `uv` command ran outside the sandbox as one plain call, with the
directory and offline mode as options (`uv run --directory <repo> --offline
…`). `uv build` used `--out-dir <scratchpad>/dist`. Docker was running.
Testcontainers starts its own PostgreSQL container on a random port. No
command contacted the production stack on `127.0.0.1:8000` or `:5432`, and
no `docker compose` command was run. `-p no:cacheprovider` was added to the
pytest calls only so that the review wrote no `.pytest_cache`; it does not
change which tests run.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built `factorflow-0.2.0.tar.gz` and `factorflow-0.2.0-py3-none-any.whl` into the scratchpad |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 2610 passed, 2 warnings (third-party deprecations), in 573.07 s. Includes `postgres` and `slow`. v4 had 2608; the two new tests are the EXP-20261107-2 regression test and `tests/unit/test_version_agreement.py`. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1659 passed, 951 deselected (v4: 1658; plus the version-agreement unit test) |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 285 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 61 source files |
| `uv run pytest tests/integration -m "postgres and not slow" -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 931 passed, 22 deselected, in 188.55 s |
| `uv run pytest tests/integration/test_classification_latency.py -m slow -q -s` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1 passed; `[TC-INT-031 diagnostic] run end to summarised: 4.110s` |
| `grep -rhoE "Implements CAP-002 TC-INT-0[0-9]{2}" tests \| sort -u \| wc -l` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `58`; no number from 001 to 058 is missing |
| `uv run pytest tests/integration/test_api_universes.py -p no:randomly -q`, run 5 times in a row | `repos/factorflow-v2/FactorFlow-v2` | 0 (each) | PASS | Supporting (T016, affected module): 30 passed in each of the 5 runs |
| `uv run pytest <the module's 30 node IDs in reverse collection order> -p no:randomly -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supporting (T016): 30 passed |
| `git diff b8ff14b HEAD -- tests \| grep -E "^[+-].*(Implements\|TC-INT)"` | `repos/factorflow-v2/FactorFlow-v2` | 1 | PASS | Supporting: no marker line added or removed since v4 (grep exit 1 means "no match") |
| `python3 scripts/pipeline-state.py automation-revision --repo-dir repos/factorflow-v2/FactorFlow-v2 --tasks <tasks>` (before and after validation) | harness root | 0 | PASS | `sha256:b35e025162254ea0c2f059a57b0b5b642de8a5c073661ae9484b2332ebbea295` both times |
| `uv sync --all-extras`, `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | n/a | NOT-RUN | Not required here. The task plan's Validation Plan lists only the Python commands. This scope's change set has no frontend file; the version bump in `package.json` and `package-lock.json` belongs to EXP-20261107-3, whose record ran the npm checks. `uv sync` would rewrite `.venv`, which a read-only review does not do. The e2e suite belongs to the concurrent e2e review. |

## Findings

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | LOW | Carried from v4 unchanged; the plan's content revision is still `sha256:6340bf69…`. The plan's Summary DEC-0286 bullet says "Every payload key in `src/factorflow/classification/line_items.py` is still `[REQUIRES INPUT]`". T001 asks for an unresolved count that is "non-zero, DEC-0286". The plan's Notes record the probe printing `7`. Since DEC-0295 (`ae525ff`), `line_items.py` binds all seven keys and the probe prints `0`. DEC-0286 is still `status: open`, `owner_reviewed: false`. | No test is wrong. The automation follows design section 7 (fixtures declare their own payload keys), and that approach holds whether or not the production keys are bound. But the plan misstates the repository, and a later reader who reruns T001's probe gets `0` against a recorded `7`. | At the plan's next revision (`$automation-coding` or `$automation-planning`), record that DEC-0295 bound the keys and that the `7` is historical. The owner disposes DEC-0286 as superseded in premise when convenient. No test or code change is required. |
| AR-002 | LOW | Task plan, Test Infrastructure, **Environment**: "The running application cases (T012, T013, T014) build the app with `create_app()` and `FACTORFLOW_DATABASE_URL`, as the `client` fixture of `test_api_universes.py` does, so the real lifespan starts the classification loop". **Tools** also lists "the `client` / `conn` / `database` fixtures of `test_api_universes.py`". Since EXP-20261107-2 (`0620fbd`), that `client` fixture replaces the loop with `_idle_scheduler` (`test_api_universes.py:58`). The fixture is therefore the plan's example of an application that does *not* start the real loop. | No test is wrong. T012 to T014 build their application through `classification_cycle_support.running_product`, which starts the real loop and passed. The plan's pointer is now wrong, though. A reader who reuses the universes `client` fixture for a running-application case, as the sentence suggests, gets an idle loop, and `wait_for_sets` times out. | At the plan's next revision, point the running-application description at `classification_cycle_support.running_product`. Note that the universes `client` fixture idles the loop on purpose (EXP-20261107-2). No test or code change is required. |

Observations, none a finding:

- **Regression test strength.**
  `test_the_client_runs_no_classification_scheduler` asserts the fixture's
  configuration (`app_module.run_classification_loop is _idle_scheduler`). It
  does not assert the absence of a scheduler-built set. Together with the
  lifespan unit test (TC-COMP-087), which pins that the lifespan starts this
  attribute, it covers the chain. A deterministic reproduction of the race
  would need a hook in `seed_set` or the scheduler. EXP-20261107-2 review v1
  reproduced the race (3 of 16 module runs on the old code) and killed a
  mutant with the `setattr` removed. This review did not repeat the mutation.
  The six fresh module runs here (five sequential, one reverse) and the two
  suite runs were all clean.
- **Private helper reuse.** `_idle_scheduler` is imported across modules
  despite its leading underscore. It is the same stand-in, used for the same
  reason, as `api_classification_support.py` uses it, and a duplicate would be
  worse. Tests are not type-checked by any constitution command. EXP-20261107-2
  review v1 noted that strict mypy over this test file would flag
  `attr-defined` on the `app_module.run_classification_loop` read.
- **Carried from v4.** The test specification's `source_artifacts` still cite
  system design v3 and factor-engine v2, while the owner re-approved v4 and v3.
  No integration expected result depends on the difference. The plan's
  `Branch:` header still names `usr/alvaro-de-jodra/CAP-002-automation`. The
  specification's TC-INT-046 still reads "three results", while the test
  asserts two per DEC-0287. Each stays with the artifact's next revision.

## Previous Review Disposition

Version 4 recorded one finding and three observations.

- **AR-001 (LOW, plan drift on payload keys and the T001 probe): still open, carried as AR-001.** The task plan has not been revised since v4 (same content revision), and DEC-0286 is still open.
- **Observation, specification `source_artifacts` cite superseded design versions: still open, unchanged.** It stays with `$test-design`.
- **Observation, no TC-INT case builds from the real Massive payload keys: unchanged.** The production keys are pinned by unit tests and the e2e stub, outside this scope.
- **Observation, plan `Branch:` header and TC-INT-046 "three results" wording: still open, unchanged.** Both are carried above.

This review resolves the staleness that pipeline state reported. The
fingerprint moved from v4's `sha256:a0b0c397…` to `sha256:b35e0251…`.
Of the changes behind that move, only `tests/integration/test_api_universes.py`
falls inside this scope. It keeps every TC-INT case's intent, and all 58 cases
pass against it.

## Verdict

**Verdict:** PASS-WITH-WARNINGS

All 58 cases and 17 tasks are verified with bidirectional traceability at
`829c9e1`. All nine required commands passed on a fresh run.
EXP-20261107-2 changed only the universes `client` fixture and added one
non-TC-INT regression test. It changed no marker and no marked test body.
TC-INT-001 to TC-INT-023 seed their own sets and do not involve the scheduler,
so idling the loop keeps their intent and makes them deterministic. The cases
that need the real loop still start it through `running_product` and pass.
EXP-20261107-3 does not reach this scope. Both findings are LOW plan drift and
need no code change. Proceed to the final completion check.
