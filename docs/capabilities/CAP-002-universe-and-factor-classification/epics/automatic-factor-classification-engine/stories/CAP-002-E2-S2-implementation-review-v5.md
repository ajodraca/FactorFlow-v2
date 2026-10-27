---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S2-implementation-review
artifact_type: implementation-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-27
updated: 2026-10-27
story_id: "CAP-002-E2-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 5
reviewed_at: "2026-10-27T21:57:41Z"
reviewed_head: "c8842cc6801f37e1c5a01bb6f271cede6a3d9b0f"
review_base: "33e569c2d2c489d59f56a648a00a82507decbcd1"
reviewed_state_revision: "sha256:6d24e9fc30a5def537f204fad89281e233d5422d109ad1c2e824fa713f03fe8a"
verdict: PASS
review_subjects:
  - artifact_id: CAP-002-E2-S2
    artifact_version: 1
    content_revision: sha256:416b2331639ca3a7f610f2b158467c70d7435f1b0839ca6af554ed5cd3806c0e
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-27T22:10:00Z
  source_artifacts:
    - id: CAP-002-E2-S2
      version: "1 (sha256:416b2331639ca3a7f610f2b158467c70d7435f1b0839ca6af554ed5cd3806c0e)"
    - id: CAP-002-E2-S2-tasks
      version: "1 (updated 2026-10-27, last_reworked_review v4)"
    - id: CAP-002-E2-S2-tdd-evidence
      version: "cycle-1 to cycle-5"
    - id: CAP-002-E2-S2-implementation-review
      version: "4 (baseline, reviewed_head b76aa9c0bf7e8e9e113eacece0a74a78f5b15b33)"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-factor-engine-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "6"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S2 — Version 5

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 20/20 verified |
| Required validation | 11/11 passed |

The cycle-5 rework resolves both v4 findings by changing tests only. No production file has changed since `dda0207`: `git diff b76aa9c HEAD -- src` is empty.

- **v4/IR-001 is resolved.** In TC-COMP-159, the newest active bar (session 2026-10-02) now has an `observed_on` of 2026-10-03. Only `max(b.session_date)` returns the asserted latest trading day, so the baseline mutant `ctx-ltd-observed-on` is killed (`2026-10-03 == 2026-10-02`).
- **v4/IR-002 is resolved.** TC-COMP-167 (a) gains a `stage-wrote-rows` case. A stage writes one row to each child table before completion finds the set already failed. Afterwards a second connection reads zero rows. This kills the baseline mutant `commit-before-complete` and the reviewer's two new transaction-boundary mutants.

Every required build, suite, lint, format, type, package-data and TDD-evidence command passes on `c8842cc`, including PostgreSQL. The mutation run covered 98 mutants: 96 carried from the baseline and 2 new late ones. 97 were killed. The one survivor, `log-without-reason`, is a carried mutant that is equivalent against the contract, as v3 and v4 found: it changes only log wording, which design 2.3 and T017 leave open. No new finding was raised in any scope (initial, carried, delta or late).

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 0**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tasks.md` |
| Component | `FactorFlow-v2` (also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S2-run-20261024T231312Z` |
| HEAD | `c8842cc6801f37e1c5a01bb6f271cede6a3d9b0f` (`story-coding(CAP-002-E2-S2): rework review v4, tests that pin the latest trading day's column and completion in the stages' transaction`) |
| Review base | `origin/main` = `33e569c2d2c489d59f56a648a00a82507decbcd1`. `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` resolves it (exit 0). `git merge-base origin/main HEAD` equals it, and `git merge-base --is-ancestor 33e569c HEAD` exits 0. This is the same base as v4 |
| Working tree | Clean at 21:57:41Z and again after validation: no staged, unstaged or untracked files, only ignored caches. `code-revision` was `sha256:6d24e9fc...` both times |
| Changed files reviewed | 127 in `33e569c..HEAD`: 6 production, 8 test, 7 story-directory documents and 106 evidence files |
| Baseline | v4 (`CAP-002-E2-S2-implementation-review-v4.md`, CHANGES-REQUIRED), `reviewed_head` `b76aa9c0bf7e8e9e113eacece0a74a78f5b15b33`. Two commits follow it: `ed27721` (the v4 report) and `c8842cc` (the cycle-5 rework). `git diff --stat b76aa9c HEAD` lists 15 files: 3 test files, the task file (`last_reworked_review` only), the TDD-evidence file, the v4 report and 9 cycle-5 evidence files. No production file |

### Re-review scope and the baseline's mutation results

v4 predates the *Re-review scope* rule (harness commit `39f3395`), so it kept no `-mutation.json` beside its report. Its run still exists in the session scratchpad as `ir-v4/results.json` and `ir-v4/mutants.json`.

**Decision: v4's run serves as the baseline's mutation results for `scope --previous`, after a mechanical join.** The reasons:

- **Provenance holds.** `results.json` (sha256 `64f2f3e30af3...`) and `mutants.json` (sha256 `dea21b3a6550...`) match the hashes in the v4 report's validation table. Inside `results.json`, `repo_head` is `b76aa9c` (v4's `reviewed_head`). Its `tree_patch_sha256` is the hash of an empty patch, and its `mutants_sha256` names the same `mutants.json`.
- **Passing the file raw would misreport.** v4 ran before `run` wrote the whole mutant into each result. Its records carry the run keys and `line`, but not `old`/`new` or `original`/`mutated`. Passed raw, `scope` reports all 59 manual mutants as "no longer apply" (probe `scope-probe-raw.json`: 37 carried, 2 late, 59 dropped). Their production lines are unchanged, so that would be false.
- **Omitting `--previous` would misstate provenance.** Every mutant would be tagged `late` (probe `scope-probe-none.json`: 39 late), and v4's 59 manual mutants would not run at all. That contradicts the rule's stated purpose: the baseline's own mutants are carried (`docs/pipeline-driver.md`, *Re-reviews converge*).
- **The join changes no data.** `<scratch>/build_inputs.py` checks both hashes, then joins each `results.json` record to its definition in `mutants.json` by id. It checks that `cycle`, `operator`, `file` and `line` agree. The output, `<scratch>/previous-v4.json` (sha256 `b32feb55...`), has the shape `run` now writes. Nothing is added, dropped or rerun.

`scope --since b76aa9c... --previous previous-v4.json` then tagged 98 mutants: 96 `carried`, 2 `late` and 0 dropped.

- The 37 regenerated catalogue mutants are identical to v4's and carried.
- The reviewer's two new manual mutants change production lines that have not changed since the baseline, so they are `late`.
- No mutant is `delta`, because no production line changed.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/__init__.py` | unchanged vs base | T002. Blob `17ac0ef` is the pinned line plus LF (`xxd` ends `2e22 2222 0a`). CAP-002-E2-S8 brought the same blob to `main`, so it is absent from the diff, as T019 anticipates |
| `src/factorflow/classification/constants.py` | added | T015 (unchanged since v1) |
| `src/factorflow/classification/line_items.py` | added | T016 (unchanged since v1) |
| `src/factorflow/classification/engine.py` | added | T017. `git diff dda0207 HEAD` shows no S2 production file |
| `src/factorflow/classification/sql/set_context.sql` | added | T013 |
| `src/factorflow/classification/sql/complete_set.sql`, `fail_set.sql` | added | T014 |
| `tests/integration/engine_support.py` | added | T003. Cycle 5 adds the optional `observed_on` to `add_bar`, defaulting to `session_date`, so every earlier caller is unchanged. This is the remediation v4/IR-001 sanctioned |
| `tests/integration/test_engine_context.py` | added | T004, T005; TC-COMP-159. Cycle 5 gives the 2026-10-02 bar `observed_on=2026-10-03` (`:42-44`, `:57-59`) |
| `tests/integration/test_engine_transaction.py` | added | T006 to T009; TC-COMP-166, 167 and 090. Cycle 5 splits `write_rows` out of `write_rows_then_raise` (`:89-121`, behaviour unchanged) and parametrizes TC-COMP-167 (a) with `stage-wrote-rows` (`:178-222`) |
| `tests/unit/test_engine_sql_safety.py` | added | T010; TC-COMP-160 |
| `tests/unit/test_line_items.py`, `test_line_items_resolved.py` | added | T011; TC-COMP-059 |
| `tests/unit/test_classification_constants.py`, `test_classification_sql_ships.py` | added | T012 |
| `.../stories/CAP-002-E2-S2.md` | modified | Bookkeeping only: `status: planning` to `in-review`. The content revision `sha256:416b2331...` is unchanged and equals the approval's `reviewed_revision` |
| `.../stories/CAP-002-E2-S2-tasks.md` | modified | Bookkeeping: 20 checkboxes, `updated: 2026-10-27` and `last_reworked_review: CAP-002-E2-S2-implementation-review-v4.md`. A word diff against the base shows nothing else |
| `.../stories/CAP-002-E2-S2-tdd-evidence.yaml` | added | T020: cycles 1 to 5 |
| `.../stories/CAP-002-E2-S2-implementation-review-v1.md` to `-v4.md` | added | The previous gate reports |
| `.../CAP-002-E2-S2-evidence/` (106 files) | added | T020. Cycle 5 adds 9 files: `cycle-5.patch`, `mutants-cycle-5.json`, `mutation-cycle-5-results.json`, its two baseline logs and two mutant logs, `red-cycle-5-rework.log` and `full-suite-cycle-5.log` |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `set_context.sql:3` returns the set's `run_id`; `engine.py:73-80` | TC-COMP-159 (`first.run_id == run_id`) | S2's share only. The qualifying-run read is CAP-002-E2-S8's, and uniqueness is S1's `run_id UNIQUE` |
| AC-11 | SATISFIED | `engine.py:102,105`: a whole-millisecond `statement_timeout`, rounded up, local to the transaction, never 0 | TC-COMP-090; `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero` (five cases); `test_timeout_is_converted_to_whole_milliseconds`; `test_timeout_is_local_to_the_build_transaction` | Killed: `ceil-to-round`, `ceil-to-int`, `ceil-floor-plus-one`, `timeout-ms-scale`, `timeout-not-local`, `timeout-wrong-guc` and both `:102` catalogue mutants. The 3000-stock volume test belongs to CAP-002-E2-S7 |
| AC-15 | SATISFIED | `set_context.sql:5-14` takes the latest trading day over active instruments only and partitions the rosters; `engine.py:118,149` count the active roster only | TC-COMP-159 (the retired instrument's later bar is ignored); `test_completed_set_is_sized_by_the_active_roster_only` | Killed: `ctx-ltd-any-lifecycle`, `ctx-active-includes-retired`, `ctx-retired-includes-active`, `stored-count-includes-retired` and `result-count-includes-retired` |
| AC-19 | SATISFIED | `engine.py:104` (`REPEATABLE READ`, DEC-0111); no mutation statement under `classification/` | `test_inputs_are_read_from_one_snapshot`; `test_build_transaction_runs_at_repeatable_read`; `test_engine_sql_safety.py` (TC-COMP-160) | Killed: `drop-repeatable-read`, `isolation-read-committed`, `isolation-serializable` and `isolation-after-timeout` |
| AC-20 | SATISFIED | `engine.py:110-144` | TC-COMP-166; TC-COMP-167 (a), both cases; `test_success_with_no_stages_completes_the_set`; `test_failure_with_an_empty_message_is_recorded_with_its_class` | — |
| DAC-E2-4 | SATISFIED | S1's `classification_set.run_id UNIQUE`; S2 reads the set's `run_id` | TC-COMP-159 | No S2 task, as the plan states |
| DAC-E2-9 | SATISFIED | `engine.py:104`; `set_context.sql` has no `FOR UPDATE` or `LOCK` | `test_inputs_are_read_from_one_snapshot`; the TC-COMP-159 in-transaction case | — |
| DAC-E2-10 | SATISFIED | `engine.py:110-125`: the stages, `complete_set.sql` and the counts read run in one transaction, committed once at `:125`. `:126-144` roll back, then run `fail_set.sql` in a new transaction | TC-COMP-166; TC-COMP-167 (a) `stage-wrote-rows`, with zero rows read through a second connection (`:214-218`); TC-COMP-167 (b); the success and sizing tests | v4/IR-002 resolved: `[stage-wrote-rows]` kills `commit-before-complete` and the reviewer's new `commit-each-stage` and `commit-before-rowcount-check` |
| DAC-E2-S2-1 | SATISFIED | `engine.py:126-144`, `fail_set.sql` | `test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` (TC-COMP-166) | A second connection reads zero child rows and a `failed` row carrying `RuntimeError` and `injected failure`. The ERROR record carries `set_id` and the exception |
| DAC-E2-S2-2 | SATISFIED | `complete_set.sql:6-7`; `engine.py:121-122`; `fail_set.sql:5-6` | `test_completing_an_already_failed_set_updates_no_row_and_rolls_back[no-stage]` and `[stage-wrote-rows]`; `test_set_failed_by_another_writer_mid_build_is_left_untouched` | "Rolls back and writes nothing" is now exercised with rows to roll back. Killed: `complete-raise-removed`, `complete-unguarded`, `fail-unguarded`, `complete-guard-not-complete` and `fail-guard-not-complete` |
| DAC-E2-S2-3 | SATISFIED | `engine.py:102,105` | `test_build_timeout_fails_the_set_with_a_timeout_reason` (TC-COMP-090) | Committed `failed`, with `QueryCanceled` and `timeout` in the reason, zero rows and `elapsed < 0.9` |
| DAC-E2-S2-4 | SATISFIED | `set_context.sql:5-8` is `max(b.session_date)` over active instruments, as T013 and design 2.3 step 2 specify; `engine.py:68-80` | TC-COMP-159, `test_set_context_without_price_data...`, `test_set_context_rosters_are_in_instrument_id_order`, `test_unknown_set_is_reported...`, `test_empty_active_roster...` | v4/IR-001 resolved: TC-COMP-159 kills `ctx-ltd-observed-on` |
| DAC-E2-S2-5 | SATISFIED | `line_items.py`: seven items, `REQUIRES_INPUT`, sign 1, `UNRESOLVED_CAUSE` | `test_line_items.py`; `test_line_items_resolved.py` (strict xfail, DEC-0113) | S2's share. Under E2-F09, the `missing` rows belong to CAP-002-E2-S3 T012 (a), and "momentum still classifies" to CAP-002-E2-S7 T014 |
| DAC-E2-S2-6 | SATISFIED | No `factorflow.ingestion.massive` import. Every `.execute` first argument is a constant or a name. No UPDATE or DELETE touches an observation or history table | `test_engine_sql_safety.py` (four `# Implements TC-COMP-160` tests plus the rule self-tests) | Passes over the whole package, including CAP-002-E2-S8's scheduler files |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `0006_classifications.sql` is present at the base; `pyproject.toml` package-data includes `classification/sql/*.sql` | — |
| T002 | complete | VERIFIED | `__init__.py` is the pinned docstring plus one LF | Not in the diff, because `main` has the identical blob (from S8) |
| T003 | complete | VERIFIED | `engine_support.py:25-103` | `add_bar` gains an optional `observed_on` (`:45-68`), defaulting to the session date. `count_classification_rows` counts the three child tables. This is justified because the set row must survive as `failed` |
| T004 | complete | VERIFIED | `test_engine_context.py:24-30` | — |
| T005 | complete | VERIFIED | `test_engine_context.py:33-82` | v4/IR-001 resolved. The newest active bar's `observed_on` is later than every active session date, so `ctx-ltd-observed-on` is killed |
| T006 | complete | VERIFIED | `test_engine_transaction.py:124-175` | The `write_rows` split leaves the stage's three inserts and the raise unchanged |
| T007 | complete | VERIFIED | `test_engine_transaction.py:178-252` | v4/IR-002 resolved. Case (a) also runs with a stage that writes rows, so its zero-row assertion has something to roll back. Case (b) is unchanged |
| T008 | complete | VERIFIED | `test_engine_transaction.py:255-280` | — |
| T009 | complete | VERIFIED | `test_engine_transaction.py:283-628` (cases a to f, plus the earlier rework tests) | — |
| T010 | complete | VERIFIED | `test_engine_sql_safety.py` | Reuses S1's patterns, a justified deviation (see Scope and Plan Deviations) |
| T011 | complete | VERIFIED | `test_line_items.py`, `test_line_items_resolved.py` | — |
| T012 | complete | VERIFIED | `test_classification_constants.py`, `test_classification_sql_ships.py` | — |
| T013 | complete | VERIFIED | `set_context.sql` | `max(b.session_date)`, active-only, `ORDER BY` and `coalesce`, exactly as specified |
| T014 | complete | VERIFIED | `complete_set.sql`, `fail_set.sql` | They match factor-engine 2.3 step 8 and its failure paragraph |
| T015 | complete | VERIFIED | `constants.py` | — |
| T016 | complete | VERIFIED | `line_items.py` | Verbatim from design 2.4 |
| T017 | complete | VERIFIED | `engine.py` | Steps 1 to 7 and the failure path are present and correct, with one commit at step 7 |
| T018 | complete | VERIFIED | The reviewer reran every Validation Plan command, and all pass. The wheel and the sdist carry `classification/sql/{set_context,complete_set,fail_set}.sql` | `test_package_data_ships_sql.py` passes unedited. `git diff 33e569c HEAD` is empty for that file, `pyproject.toml` and `tests/conftest.py` |
| T019 | complete | VERIFIED | The six mapped TCs carry `# Implements`, and every additional test cites an AC or DEC | The diff touches no `pyproject.toml`, `tests/conftest.py`, CAP-001 test or `test_package_data_ships_sql.py` |
| T020 | complete | VERIFIED | `CAP-002-E2-S2-tdd-evidence.yaml` cycles 1 to 5; the reviewer-run lint reports 0 errors | Cycle 5: `cycle-5.patch` (sha256 `9fdfae52...`) equals `diff_sha256`, `git diff ed27721 c8842cc -- tests` and `git diff b76aa9c c8842cc -- tests`. `git log -S` finds `c8842cc` (`commit_hash: stage`). The RED-log, full-suite-log and mutation-results hashes match |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_set_context_resolves_date_latest_trading_day_and_roster` / TC-COMP-159 | ADEQUATE | Asserts the date, `run_id`, both rosters and the active-only latest trading day, which now differs from every `observed_on`. A commit from a second connection is invisible inside the open snapshot and visible afterwards. Kills `ctx-ltd-observed-on`, `ctx-ltd-any-lifecycle`, `ctx-ltd-min`, `ctx-active-desc`, `ctx-active-includes-retired` and `ctx-retired-includes-active` | none |
| `test_set_context_without_price_data_has_no_latest_trading_day` | ADEQUATE | A `NULL` latest trading day; kills `ctx-retired-null-when-empty` | none |
| `test_set_context_rosters_are_in_instrument_id_order` | ADEQUATE | Checks the heap-order precondition, then both rosters in id order; kills `ctx-active-unordered` and `ctx-retired-unordered` | none |
| `test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` / TC-COMP-166 | ADEQUATE | A second connection reads zero child rows and a `failed` row. The reason has no traceback, and the ERROR record carries `set_id` and the exception. Kills `drop-rollback`, `drop-failure-commit`, `drop-exc-info`, `log-warning`, `log-no-extra`, `log-set-id-uuid`, `isolation-after-timeout` and `except-psycopg-only`, among others | none |
| `test_completing_an_already_failed_set_updates_no_row_and_rolls_back[no-stage]` / TC-COMP-167 (a) | ADEQUATE | The other writer's reason and `ended_at` stand. The result is `failed`, 0, `{}`. Kills `complete-raise-removed`, `failed-result-active-count` and `failed-result-qualified` | none |
| `test_completing_an_already_failed_set_updates_no_row_and_rolls_back[stage-wrote-rows]` / TC-COMP-167 (a) | ADEQUATE | A stage writes one row to each child table, then completion matches no row and raises. The build connection and a second connection both read zero rows, and the set row is unmodified. Kills `commit-before-complete`, `commit-each-stage` and `commit-before-rowcount-check` (`{...: 1} != {...: 0}`) | none |
| `test_set_failed_by_another_writer_mid_build_is_left_untouched` / TC-COMP-167 (b) | ADEQUATE | The serialization-failure path ends in the same set state | Its stage writes no row. Case (a) `stage-wrote-rows` pins the rollback of written rows, as v4/IR-002's remediation allowed ("before or mid-build") |
| `test_build_timeout_fails_the_set_with_a_timeout_reason` / TC-COMP-090 | ADEQUATE | Committed `failed`, `QueryCanceled` with `timeout`, zero rows, under 0.9 s; kills `timeout-wrong-guc` | none |
| `test_success_with_no_stages_completes_the_set` | ADEQUATE | Committed `complete` with `ended_at`, `latest_trading_day` and the size. Kills `drop-success-commit`, `complete-no-ltd`, `complete-no-ended-at` and `complete-ltd-is-classification-date` | none |
| `test_completed_set_is_sized_by_the_active_roster_only` | ADEQUATE | 2 active and 1 retired give 2, on the row and in the result | none |
| `test_qualified_counts_are_this_sets_classification_set_factor_rows` | ADEQUATE | Returns only this set's counts | none |
| `test_stages_run_in_list_order` | ADEQUATE | Kills `stages-reversed` | none |
| `test_unknown_set_is_reported_as_missing_not_as_a_type_error` | ADEQUATE | The exact `LookupError` reason; the other set stays `building`. Kills `drop-lookup-error` and `ctx-set-unfiltered` | none |
| `test_empty_active_roster_fails_with_the_no_price_data_reason` | ADEQUATE | Kills `ctx-active-null-when-empty` and `drop-no-price-check` | none |
| `test_inputs_are_read_from_one_snapshot` | ADEQUATE | One snapshot across stages. Kills `drop-repeatable-read` and `isolation-read-committed` | none |
| `test_build_transaction_runs_at_repeatable_read` | ADEQUATE | `SHOW transaction_isolation` reads `repeatable read` inside a stage. Kills `isolation-serializable` | none |
| `test_no_price_data_held_fails_the_set_with_a_reason` | ADEQUATE | The DEC-0114 reason | none |
| `test_non_positive_timeout_is_refused_before_touching_the_database` | ADEQUATE | 0, -1 and 0.0 are refused, and the set stays `building` | none |
| `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero` | ADEQUATE | Five cases, recorded as sent. Kills `ceil-to-round`, `ceil-to-int`, `ceil-floor-plus-one`, `timeout-ms-scale` and both `:102` catalogue mutants | none |
| `test_timeout_is_converted_to_whole_milliseconds`, `test_timeout_is_local_to_the_build_transaction` | ADEQUATE | `30s` observed inside a stage; the session timeout is unchanged after success and after failure. Kills `timeout-not-local` | none |
| `test_autocommit_or_open_transaction_connection_is_refused`, `test_connection_with_an_aborted_transaction_is_refused` | ADEQUATE | Autocommit, `INTRANS` and `INERROR` are refused before any statement. Kills `autocommit-unchecked` and `txn-status-intrans-only` | none |
| `test_failure_reason_is_one_line`, `test_failure_with_an_empty_message_is_recorded_with_its_class` | ADEQUATE | Only the first line is kept, and an empty message is recorded with its class; both are committed. Kills `reason-whole-message`, `reason-last-line` and `reason-no-empty-guard` | none |
| `test_engine_sql_safety.py` / TC-COMP-160 | ADEQUATE | Each rule is shown able to fail. Kills `complete-unguarded`, `fail-unguarded`, `complete-guard-not-complete`, `fail-guard-not-complete` and `fail-set-unfiltered` | none |
| `test_every_line_item_payload_key_is_resolved` / TC-COMP-059 | ADEQUATE | Strict xfail on `unresolved() == []` (DEC-0113) | none for S2's share |
| `test_line_items.py`, `test_classification_constants.py`, `test_classification_sql_ships.py` | ADEQUATE | Every line-item and constant catalogue mutant is killed, including the `frozen` negations | none |

**Isolation and determinism.** Each test gets a fresh database (`tests/conftest.py::postgres_connection_string`). The seven story test files passed in all four mutation baselines (75 passed and 1 xfailed each) and in the focused, full, postgres and non-postgres runs. The two changed tests read no clock and depend on no host speed. Their dates are fixed literals; 2026-10-02 is a Friday, as the comment says.

**Mutation (reviewer, `python -B`, at `c8842cc`).** 98 mutants after `scope`:

- **37 catalogue mutants** from `generate --range 33e569c..HEAD --cycle review`: 22 in `engine.py`, 9 in `line_items.py` and 6 in `constants.py`. They match v4's 37 in id and definition. All are `carried`.
- **59 baseline manual mutants**, added by `scope --previous` from v4's run. All are `carried`.
- **2 new reviewer mutants**, both `late`. `commit-each-stage` commits after every stage. `commit-before-rowcount-check` commits between `complete_set.sql` and its rowcount check (DAC-E2-S2-2: the build raises inside the transaction).

97 were killed. Each kill's log names a failing test in one of the seven story files. 1 survived:

- `log-without-reason` is `carried`; v4 ran it and judged it equivalent. It drops `reason` from the ERROR message's format arguments. The record keeps level ERROR, `exc_info` (the exception and its traceback) and `extra={"set_id": ...}`.
- The contract leaves the wording open. Factor-engine design 2.3 and T017 require only that the exception be "logged with the structured logger and `set_id`". SA-LOG-001 governs the logging framework and placeholders. OPS-ERR-001 requires only that the error not be swallowed.
- No artifact specifies the message wording, so the mutant is equivalent (E.9: "log wording"). No finding.

## Independent Validation

`<component>` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`, on the review branch at `c8842cc` throughout. `<scratch>` is `/private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-run-factorlow-v2-72853f/db9cff1c-3430-41b3-8755-e50004235c55/scratchpad/ir-v5`, outside the repository. The seven story test files are `tests/unit/test_engine_sql_safety.py`, `test_line_items.py`, `test_line_items_resolved.py`, `test_classification_constants.py`, `test_classification_sql_ships.py`, `tests/integration/test_engine_context.py` and `test_engine_transaction.py`.

Each `uv`, lint and mutation command ran outside the sandbox as one plain call, with Docker Desktop and testcontainers PostgreSQL 16. The TDD-evidence lint first ran inside the sandbox and failed every cycle with `error: unable to create temporary file: Operation not permitted`. It was rerun outside the sandbox as one plain call, and that run is the result recorded below.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | evidence | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/.../CAP-002-E2-S2-tdd-evidence.yaml --repo-dir <component> --base 33e569c2d2c489d59f56a648a00a82507decbcd1 --decisions-dir projects/factorflow-v2/decisions --require-logs` (absolute paths) | harness root | 0 | PASS (required) | 0 errors, 0 warnings. Hand checks: `cycle-5.patch` = `diff_sha256` `9fdfae52...` = `git diff ed27721 c8842cc -- tests`. `red-cycle-5-rework.log` `ae7c3805...`, `full-suite-cycle-5.log` `a60726c1...` and `mutation-cycle-5-results.json` `0318f531...` match the evidence file |
| `uv sync --directory <component> --all-extras --offline` | component | 0 | PASS (required) | Resolved 46, checked 43, nothing changed |
| `uv run --directory <component> --all-extras --offline python -B -m pytest -p no:cacheprovider -q -rxXs -m "postgres or not postgres" <7 story test files> tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_sql_is_append_only.py` | component | 0 | PASS (focused) | 118 passed, 1 xfailed (TC-COMP-059), 5.29 s. One more pass than v4's 117: the new `stage-wrote-rows` case |
| `uv run --directory <component> --all-extras --offline pytest -p no:cacheprovider -q` | component | 0 | PASS (required) | 1467 passed, 1 xfailed, 238.95 s. Two third-party deprecation warnings (starlette, anyio) |
| `uv run --directory <component> --all-extras --offline pytest -m postgres -p no:cacheprovider -q` | component | 0 | PASS (required) | 439 passed, 1029 deselected, 212.98 s |
| `uv run --directory <component> --all-extras --offline pytest -m "not postgres" -p no:cacheprovider -q` | component | 0 | PASS (required) | 1028 passed, 439 deselected, 1 xfailed, 24.87 s |
| `uv run --directory <component> --all-extras --offline ruff check .` | component | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --all-extras --offline ruff format --check .` | component | 0 | PASS (required) | 228 files already formatted |
| `uv run --directory <component> --all-extras --offline mypy src` | component | 0 | PASS (required) | No issues in 56 source files |
| `uv run --directory <component> --all-extras --offline pytest -p no:cacheprovider -q tests/unit/test_package_data_ships_sql.py tests/unit/test_distribution_contents.py` | component | 0 | PASS (required) | 12 passed; `test_package_data_ships_sql.py` is unedited (T018) |
| `uv build --directory <component> --offline --out-dir <scratch>/dist` | component | 0 | PASS (required) | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl`. Both carry `classification/sql/set_context.sql`, `complete_set.sql` and `fail_set.sql`. The wheel has nothing under `tests/` |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 33e569c2d2c489d59f56a648a00a82507decbcd1..HEAD --cycle review --out <scratch>/catalogue.json`, then `python3 -I <scratch>/build_inputs.py` | harness root | 0 | evidence | 37 catalogue mutants (4 `drop-defaulted-argument`, 7 `negate-boolean`, 26 `off-by-one`), identical to v4's. `build_inputs.py` writes `previous-v4.json` (see *Re-review scope*) and `mutants-pre-scope.json` (the 37 plus 2 reviewer mutants, sha256 `231e6335...`) |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/mutants-pre-scope.json --since b76aa9c0bf7e8e9e113eacece0a74a78f5b15b33 --previous <scratch>/previous-v4.json --out <scratch>/mutants.json` | harness root | 0 | evidence | 98 mutants: 96 `carried`, 2 `late`; 0 previous mutants dropped. `mutants.json` sha256 `6520b93c...`. The two unused probes, with raw `results.json` and with no `--previous`, are recorded under *Re-review scope* |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --work-root <scratch>/work --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider <7 story test files>' --out <scratch>/results.json` | harness root | 3 | PASS (required) | 98 mutants: 97 killed, 1 survived (`log-without-reason`, carried, equivalent). The runner exits 3 on any survivor; the E.9 gate (no non-equivalent survivor) holds. Four baselines passed (75 passed, 1 xfailed each). Ran 22:03:33Z to 22:05:08Z. Results sha256 `3b90625e...`, copied beside this report as `CAP-002-E2-S2-implementation-review-v5-mutation.json` |
| `npm ci`, `npm run build`, `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run test:e2e` | — | N/A | NOT RUN | Not applicable. The change set touches no frontend file: nothing under `web/` and no `package.json`. Neither the story's Validation section nor the plan's Validation Plan lists these commands |

### Validation Side Effects

- Before (21:57:41Z): the review branch at `c8842cc`, clean, with `code-revision` `sha256:6d24e9fc...`.
- After (22:09:24Z): the same branch, HEAD and `code-revision`. `git status --porcelain -uall` is empty. Only ignored paths were written: `.venv/`, `build/`, `src/factorflow.egg-info/` and caches. Mutation clones, logs, results and build output are all under `<scratch>`.
- Unexpected tracked-file changes: none.

## Findings

No findings.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v4/IR-001 | RESOLVED | `tests/integration/test_engine_context.py:42-44` gives the active 2026-10-02 bar `observed_on=2026-10-03` through `engine_support.add_bar(..., observed_on=...)` (`engine_support.py:45-68`). `:59` still asserts `latest_trading_day == 2026-10-02`. The carried baseline mutant `ctx-ltd-observed-on` is killed in `test_set_context_resolves_date_latest_trading_day_and_roster` (`assert datetime.date(2026, 10, 3) == datetime.date(2026, 10, 2)`) |
| v4/IR-002 | RESOLVED | `tests/integration/test_engine_transaction.py:178-222` parametrizes TC-COMP-167 (a) with `stage-wrote-rows`; its stage (`write_rows`, `:89-111`) inserts one row into each child table. `:209-218` assert zero rows on the build connection and through a second connection. The carried baseline mutant `commit-before-complete` is killed (`{'factor_input': 1} != {'factor_input': 0}` and the other two tables likewise), as are the reviewer's `commit-each-stage` and `commit-before-rowcount-check` |

## Scope and Plan Deviations

- **T003 helper signature.** T003 names `add_bar(conn, instrument_id, session_date, close=10)`. Cycle 5 adds an optional `observed_on` that defaults to the session date, so every earlier caller is unchanged. This is justified: it is v4/IR-001's remediation, made in this story's own helper.
- **T010 patterns.** T010 asked for "a local pattern" for the classification tables. `test_engine_sql_safety.py` instead reuses CAP-002-E2-S1's `prohibited_research_mutations` and `unguarded_classification_set_updates`, without editing them. v2 to v4 accepted this as justified and stricter, and it is unchanged.
- **Child-table count.** `count_classification_rows` covers three child tables where T003 says four. This is justified: the set row itself must survive as `failed`.
- **Inline counts query.** `engine.py:30-32` keeps the qualified-counts read as an inline module constant, not a `.sql` file. T017 step 7 names no file and design 2.1 lists none. Not a finding.
- **Story status.** The story's `status` moved from `planning` to `in-review`. The content revision `sha256:416b2331...` is unchanged.
- **Tasks-file bookkeeping.** The tasks file's `last_reworked_review` now names v4. This is pipeline bookkeeping; no task text changed.
- **Unbacked coder claim.** Cycle 5's `green_evidence` states that v4's 96 mutants were rerun against the cycle-5 tests and 95 were killed. No committed file backs that statement. The coder's results sit in the session scratchpad (`c5/carried-v4-results.json`), outside the repository. The reviewer did not rely on them. This review's own run of the same 96 mutants at `c8842cc` gives the same outcome. It is not a finding: the claim is supplementary to the cycle's `mutation:` block and is independently confirmed.
- **No unjustified change.** The diff touches nothing in `pyproject.toml`, `tests/conftest.py`, any CAP-001 test or `tests/unit/test_package_data_ships_sql.py`.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E2-S2 against `CAP-002-E2-S2-tasks.md` and this report. This review approves nothing; any approval or merge remains the owner's.
- **Warnings accepted downstream**: N/A
