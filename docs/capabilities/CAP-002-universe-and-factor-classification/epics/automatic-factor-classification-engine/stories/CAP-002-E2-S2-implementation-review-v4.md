---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S2-implementation-review
artifact_type: implementation-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-27
updated: 2026-10-27
story_id: "CAP-002-E2-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 4
reviewed_at: "2026-10-27T16:06:48Z"
reviewed_head: "b76aa9c0bf7e8e9e113eacece0a74a78f5b15b33"
review_base: "33e569c2d2c489d59f56a648a00a82507decbcd1"
reviewed_state_revision: "sha256:82beb238a0912693684e2412f69f63ccf13b78230c39964a68a5af67c00040b7"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-10-27T16:30:00Z
  source_artifacts:
    - id: CAP-002-E2-S2
      version: "1 (sha256:416b2331639ca3a7f610f2b158467c70d7435f1b0839ca6af554ed5cd3806c0e)"
    - id: CAP-002-E2-S2-tasks
      version: "1 (updated 2026-10-27, last_reworked_review v3)"
    - id: CAP-002-E2-S2-tdd-evidence
      version: "cycle-1 to cycle-4"
    - id: CAP-002-E2-S2-implementation-review
      version: "3"
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

# Implementation Review: CAP-002-E2-S2 — Version 4

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 18/20 verified |
| Required validation | 10/11 passed |

The cycle-4 rework resolves both v3 findings. In this review's run, `ceil-to-round` is killed by the new `0.0012 s` case, and the reviewer probe shows the `300.0004 s` case kills it too. `isolation-serializable` is killed by the new `test_build_transaction_runs_at_repeatable_read`. The cycle-4 test diff is byte-identical to `cycle-4.patch` (sha256 `ea5f50f3...`). Every recorded hash matches, and the TDD-evidence lint reports 0 errors. Every build, suite, lint, format, type, package-data and TDD-evidence command passes on `b76aa9c`, Postgres included. The counts match the coder's cycle-4 claims: 1466 passed with 1 xfailed, 438 postgres, 1028 not-postgres.

The gate still fails on mutation. The reviewer regenerated the catalogue over every changed production file (37 mutants) and reran 46 earlier manual mutants. It also added 13 new manual mutants of its own. Of the 96, 93 are killed and 3 survive. Two of the survivors are not equivalent:

- **IR-001 (HIGH):** `set_context.sql` computing the latest trading day from `max(b.observed_on)` instead of `max(b.session_date)` survives. Every bar the story tests write has `observed_on` equal to `session_date` (`engine_support.add_bar`). So TC-COMP-159 cannot tell the session date from the observation date. In production `observed_on` is the acquisition date, so the mutant would set the latest trading day to a day without a session.
- **IR-002 (HIGH):** a `conn.commit()` inserted between the last stage and `complete_set.sql` survives. No story test has a stage that writes a row when completion then fails. TC-COMP-167's "rolls back and writes nothing" is therefore vacuous: both of its cases write nothing to roll back. A reviewer probe with one stage-written row kills it, leaving 1 row committed for a `failed` set.
- `log-without-reason` survives again and is still equivalent to every specified behaviour (as in v3). This is not a finding.

The production code is correct under both probes, and it has not changed since `dda0207`. Neither finding is a regression introduced by the rework. Earlier reviews did not run these two mutants. The rework is expected to be tests only.

**By severity:** CRITICAL 0 · HIGH 2 · MEDIUM 0 · LOW 0 · **total 2**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tasks.md` |
| Component | `FactorFlow-v2` (also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S2-run-20261024T231312Z` |
| HEAD | `b76aa9c0bf7e8e9e113eacece0a74a78f5b15b33` (`story-coding(CAP-002-E2-S2): rework review v3, tests that pin the millisecond round-up and the REPEATABLE READ level`) |
| Review base | `origin/main` = `33e569c2d2c489d59f56a648a00a82507decbcd1`. `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` resolves it; `git merge-base origin/main HEAD` equals it; `git merge-base --is-ancestor 33e569c HEAD` exits 0. Same base as v3 |
| Working tree | Clean at 16:06:48Z and after validation: no staged, unstaged or untracked files, only ignored caches. `code-revision` `sha256:82beb238...` before and after. The reflog shows no checkout during this review |
| Changed files reviewed | 117 in `33e569c..HEAD`: 6 production, 8 test, 6 story-directory documents, 97 evidence files |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/__init__.py` | unchanged vs base | T002. Blob `17ac0ef` is the pinned line plus LF (`xxd` ends `2e22 2222 0a`). CAP-002-E2-S8 brought the same blob to `main`, so it is absent from the diff, as T019 anticipates |
| `src/factorflow/classification/constants.py` | added | T015 (unchanged since v1) |
| `src/factorflow/classification/line_items.py` | added | T016 (unchanged since v1) |
| `src/factorflow/classification/engine.py` | added | T017. `git diff dda0207 HEAD` is empty for all six S2 production files |
| `src/factorflow/classification/sql/set_context.sql` | added | T013 |
| `src/factorflow/classification/sql/complete_set.sql`, `fail_set.sql` | added | T014 |
| `tests/integration/engine_support.py` | added | T003 |
| `tests/integration/test_engine_context.py` | added | T004, T005; TC-COMP-159 |
| `tests/integration/test_engine_transaction.py` | added | T006 to T009; TC-COMP-166, 167, 090. Cycle 4 adds `test_build_transaction_runs_at_repeatable_read` (v3/IR-002) and the cases `(0.0012, "2")` and `(300.0004, "300001")` (v3/IR-001) |
| `tests/unit/test_engine_sql_safety.py` | added | T010; TC-COMP-160 |
| `tests/unit/test_line_items.py`, `test_line_items_resolved.py` | added | T011; TC-COMP-059 |
| `tests/unit/test_classification_constants.py`, `test_classification_sql_ships.py` | added | T012 |
| `.../stories/CAP-002-E2-S2.md` | modified | Bookkeeping: `status: planning` to `in-review` only. The content revision `sha256:416b2331...` is unchanged and equals the approval's `reviewed_revision` |
| `.../stories/CAP-002-E2-S2-tasks.md` | modified | Bookkeeping: 20 checkboxes, `updated: 2026-10-27` and `last_reworked_review: CAP-002-E2-S2-implementation-review-v3.md`. A word diff against the base shows nothing else |
| `.../stories/CAP-002-E2-S2-tdd-evidence.yaml` | added | T020: cycles 1 to 4 |
| `.../stories/CAP-002-E2-S2-implementation-review-v1.md`, `-v2.md`, `-v3.md` | added | The previous gate reports |
| `.../CAP-002-E2-S2-evidence/` (97 files) | added | T020. Cycle 4 adds 9 files: `cycle-4.patch`, `mutants-cycle-4.json`, `mutation-cycle-4-results.json`, its two baseline and two mutant logs, `red-cycle-4-rework.log` and `full-suite-cycle-4.log` |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `set_context.sql:3` returns the set's `run_id`; `engine.py:73-80` | `test_engine_context.py::test_set_context_resolves_date_latest_trading_day_and_roster` (`first.run_id == run_id`) | S2's share only. The qualifying-run read is CAP-002-E2-S8, and uniqueness is S1's `run_id UNIQUE` |
| AC-11 | SATISFIED | `engine.py:102,105`: a whole-millisecond `statement_timeout`, rounded up, local to the transaction, never 0 | TC-COMP-090; `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero` (now five cases); `test_timeout_is_converted_to_whole_milliseconds`; `test_timeout_is_local_to_the_build_transaction` | v3/IR-001 resolved: `ceil-to-round`, `ceil-to-int`, `ceil-floor-plus-one` and `timeout-ms-scale` are all killed. The 3000-stock volume test is CAP-002-E2-S7 |
| AC-15 | SATISFIED | `set_context.sql:5-14` takes the latest trading day over active instruments only and partitions the rosters; `engine.py:118,149` count the active roster only | `test_set_context_resolves...`, where the retired instrument's later bar is ignored; `test_completed_set_is_sized_by_the_active_roster_only` | `ctx-ltd-any-lifecycle`, `ctx-active-includes-retired`, `ctx-retired-includes-active`, `stored-count-includes-retired` and `result-count-includes-retired` are killed |
| AC-19 | SATISFIED | `engine.py:104` (`REPEATABLE READ`, DEC-0111); no mutation statement under `classification/` | `test_inputs_are_read_from_one_snapshot`; `test_build_transaction_runs_at_repeatable_read`; `test_engine_sql_safety.py` (TC-COMP-160) | v3/IR-002 resolved: `isolation-serializable`, `isolation-read-committed` and `drop-repeatable-read` are killed |
| AC-20 | SATISFIED | `engine.py:110-144` | TC-COMP-166; `test_success_with_no_stages...`; `test_failure_with_an_empty_message...` | — |
| DAC-E2-4 | SATISFIED | S1's `classification_set.run_id UNIQUE`; S2 reads the set's `run_id` | `test_set_context_resolves...` | No S2 task, as the plan states |
| DAC-E2-9 | SATISFIED | `engine.py:104`; `set_context.sql` has no `FOR UPDATE` or `LOCK` | `test_inputs_are_read_from_one_snapshot`; the TC-COMP-159 in-transaction case | — |
| DAC-E2-10 | SATISFIED | `engine.py:110-125`: the stages, `complete_set.sql` and the counts read run in one transaction committed once at `:125`. `:126-144` roll back, then run `fail_set.sql` in a new transaction | TC-COMP-166, TC-COMP-167 (a) and (b), the success, sizing and empty-message tests | The production code is correct; the reviewer probe passes unmutated. The single-commit property is unpinned whenever a stage writes a row and completion then fails (IR-002) |
| DAC-E2-S2-1 | SATISFIED | `engine.py:126-144`, `fail_set.sql` | `test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` (TC-COMP-166) | A second connection reads zero child rows and a `failed` row carrying `RuntimeError` and `injected failure`. The ERROR record carries `set_id` and the exception |
| DAC-E2-S2-2 | SATISFIED | `complete_set.sql:6-7`; `engine.py:121-122`; `fail_set.sql:5-6` | `test_completing_an_already_failed_set_updates_no_row_and_rolls_back`; `test_set_failed_by_another_writer_mid_build_is_left_untouched` | Guard and raise are pinned (`complete-unguarded`, `fail-unguarded`, `complete-raise-removed`, `complete-guard-not-complete`, `fail-guard-not-complete` killed). "Writes nothing" is untested with a stage that writes (IR-002) |
| DAC-E2-S2-3 | SATISFIED | `engine.py:102,105` | `test_build_timeout_fails_the_set_with_a_timeout_reason` (TC-COMP-090) | The committed state is `failed`, with `QueryCanceled` and `timeout` in the reason, zero rows and `elapsed < 0.9` |
| DAC-E2-S2-4 | SATISFIED | `set_context.sql:5-8` is `max(b.session_date)` over active instruments, as T013 and design 2.3 step 2 specify; `engine.py:68-80` | `test_set_context_resolves...`, `test_set_context_without_price_data...`, `test_set_context_rosters_are_in_instrument_id_order`, `test_unknown_set_is_reported...`, `test_empty_active_roster...` | The production code is correct; the reviewer probe passes unmutated. Which date column the latest trading day comes from is unpinned (IR-001) |
| DAC-E2-S2-5 | SATISFIED | `line_items.py`: seven items, `REQUIRES_INPUT`, sign 1, `UNRESOLVED_CAUSE` | `test_line_items.py`; `test_line_items_resolved.py` (strict xfail, DEC-0113) | S2's share. Under E2-F09 the `missing` rows are CAP-002-E2-S3 T012 (a), and "momentum still classifies" is CAP-002-E2-S7 T014 |
| DAC-E2-S2-6 | SATISFIED | No `factorflow.ingestion.massive` import. Every `.execute` first argument is a constant or a name. No UPDATE or DELETE touches an observation or history table | `test_engine_sql_safety.py` (four `# Implements TC-COMP-160` tests plus the rule self-tests) | Passes over the whole package, including CAP-002-E2-S8's scheduler files |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `0006_classifications.sql` present at the base; `pyproject.toml` package-data includes `classification/sql/*.sql` | — |
| T002 | complete | VERIFIED | `__init__.py` is the pinned docstring plus one LF | Identical blob on `main` (S8), so it is not in the diff |
| T003 | complete | VERIFIED | `engine_support.py:25-98` | `count_classification_rows` counts the three child tables; justified, because the set row must survive as `failed`. `add_bar` always writes `observed_on = session_date` (`:55`), which is the root of IR-001 |
| T004 | complete | VERIFIED | `test_engine_context.py:24-30` | — |
| T005 | complete | PARTIAL | `test_engine_context.py:33-111` | TC-COMP-159 asserts the latest trading day only over bars whose `observed_on` equals `session_date`, so `ctx-ltd-observed-on` survives (IR-001) |
| T006 | complete | VERIFIED | `test_engine_transaction.py:113-164` | — |
| T007 | complete | PARTIAL | `test_engine_transaction.py:167-228` | Neither case has a stage that writes a row, so "writes nothing" never has anything to roll back, and `commit-before-complete` survives (IR-002) |
| T008 | complete | VERIFIED | `test_engine_transaction.py:231-256` | — |
| T009 | complete | VERIFIED | `test_engine_transaction.py:259-604` (cases a to f, plus the rework tests) | v3/IR-001 resolved: case (d) now separates rounding up from rounding to nearest (`:471-494`). v3/IR-002 resolved by `:421-440` |
| T010 | complete | VERIFIED | `test_engine_sql_safety.py` | Reuses S1's patterns, a justified deviation (see Scope) |
| T011 | complete | VERIFIED | `test_line_items.py`, `test_line_items_resolved.py` | — |
| T012 | complete | VERIFIED | `test_classification_constants.py`, `test_classification_sql_ships.py` | — |
| T013 | complete | VERIFIED | `set_context.sql` | `max(b.session_date)`, active-only, `ORDER BY` and `coalesce` exactly as specified. The missing pin is recorded against T005 (IR-001) |
| T014 | complete | VERIFIED | `complete_set.sql`, `fail_set.sql` | They match factor-engine 2.3 step 8 and its failure paragraph |
| T015 | complete | VERIFIED | `constants.py` | — |
| T016 | complete | VERIFIED | `line_items.py` | Verbatim from design 2.4 |
| T017 | complete | VERIFIED | `engine.py` | Steps 1 to 7 and the failure path are present and correct, with one commit at step 7. The missing pin is recorded against T007 (IR-002) |
| T018 | complete | VERIFIED | The reviewer reran every Validation Plan command, and all pass. The wheel and sdist carry `classification/sql/{set_context,complete_set,fail_set}.sql` | `test_package_data_ships_sql.py` passes unedited |
| T019 | complete | VERIFIED | The six mapped TCs carry `# Implements`, and every additional test cites an AC or DEC | The diff touches no `pyproject.toml`, `tests/conftest.py`, CAP-001 test or `test_package_data_ships_sql.py` |
| T020 | complete | VERIFIED | `CAP-002-E2-S2-tdd-evidence.yaml` cycles 1 to 4; the reviewer-run lint reports 0 errors | `git log -S <diff_sha256>` finds the carrying commit of each cycle: `7c7f377`, `dda0207`, `c20829d`, `b76aa9c` |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_set_context_resolves_date_latest_trading_day_and_roster` / TC-COMP-159 | WEAK | Asserts the date, `run_id`, the active-only latest trading day and both rosters. A commit from a second connection stays invisible inside the open snapshot and is visible afterwards. Kills the row-index, `ctx-ltd-any-lifecycle`, `ctx-ltd-min` and roster-partition mutants, and the new `ctx-active-desc` | Every bar has `observed_on == session_date`, so `ctx-ltd-observed-on` survives (IR-001) |
| `test_set_context_without_price_data_has_no_latest_trading_day` | ADEQUATE | `NULL` latest trading day; kills `ctx-retired-null-when-empty` | none |
| `test_set_context_rosters_are_in_instrument_id_order` | ADEQUATE | The heap-order precondition, then both rosters in id order. Kills `ctx-active-unordered` and `ctx-retired-unordered` | none |
| `test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` / TC-COMP-166 | ADEQUATE | Zero child rows and a `failed` row, read through a second connection; no traceback in the reason; the ERROR record carries `set_id` and the exception. Kills `drop-rollback`, `drop-failure-commit`, `drop-exc-info`, `log-warning`, `log-no-extra`, the new `log-set-id-uuid` and `isolation-after-timeout`, among others | none |
| `test_completing_an_already_failed_set_updates_no_row_and_rolls_back` / TC-COMP-167 (a) | WEAK | The other writer's reason and `ended_at` stand; the result is `failed`, 0, `{}`. Kills `complete-raise-removed` and the new `failed-result-active-count` and `failed-result-qualified` | No stage runs, so "writes nothing" has nothing to roll back; `commit-before-complete` survives (IR-002) |
| `test_set_failed_by_another_writer_mid_build_is_left_untouched` / TC-COMP-167 (b) | WEAK | The serialization-failure path ends in the same set state | Its stage writes no row before the other writer fails the set, so the zero-row assertion is vacuous (IR-002) |
| `test_build_timeout_fails_the_set_with_a_timeout_reason` / TC-COMP-090 | ADEQUATE | Committed `failed`, `QueryCanceled` with `timeout`, zero rows, under 0.9 s | none |
| `test_success_with_no_stages_completes_the_set` | ADEQUATE | Committed `complete` with `ended_at`, `latest_trading_day` and the size | none |
| `test_completed_set_is_sized_by_the_active_roster_only` | ADEQUATE | 2 active instruments and 1 retired give 2, on the row and in the result | none |
| `test_qualified_counts_are_this_sets_classification_set_factor_rows` | ADEQUATE | Only this set's counts | none |
| `test_stages_run_in_list_order` | ADEQUATE | Kills `stages-reversed` | none |
| `test_unknown_set_is_reported_as_missing_not_as_a_type_error` | ADEQUATE | The exact `LookupError` reason, and the other set stays `building` | none |
| `test_empty_active_roster_fails_with_the_no_price_data_reason` | ADEQUATE | Kills `ctx-active-null-when-empty`, `drop-no-price-check` | none |
| `test_inputs_are_read_from_one_snapshot` | ADEQUATE | One snapshot across stages; kills `drop-repeatable-read` and the new `isolation-read-committed` | none |
| `test_build_transaction_runs_at_repeatable_read` (new) | ADEQUATE | `SHOW transaction_isolation` read inside a stage equals `repeatable read`, with the build `complete`. Kills `isolation-serializable`. Deterministic | none |
| `test_no_price_data_held_fails_the_set_with_a_reason` | ADEQUATE | The DEC-0114 reason | none |
| `test_non_positive_timeout_is_refused_before_touching_the_database` | ADEQUATE | 0, -1 and 0.0 are refused, and the set stays `building` | none |
| `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero` (extended) | ADEQUATE | Five cases, recorded as sent. `(0.0012, "2")` and `(300.0004, "300001")` separate rounding up from rounding to nearest. Python gives `1.2` and `300000.4` for the two products, so neither case rests on float noise. Kills `ceil-to-round`, `ceil-to-int`, `ceil-floor-plus-one`, `timeout-ms-scale` and both `102` catalogue mutants | none |
| `test_timeout_is_converted_to_whole_milliseconds` | ADEQUATE | `30s` observed inside a stage | none |
| `test_timeout_is_local_to_the_build_transaction` | ADEQUATE | Kills `timeout-not-local` | none |
| `test_autocommit_or_open_transaction_connection_is_refused`, `test_connection_with_an_aborted_transaction_is_refused` | ADEQUATE | Autocommit, `INTRANS` and `INERROR` are refused before any statement | none |
| `test_failure_reason_is_one_line`, `test_failure_with_an_empty_message_is_recorded_with_its_class` | ADEQUATE | The first line only, and an empty message, both committed | none |
| `test_engine_sql_safety.py` / TC-COMP-160 | ADEQUATE | Each rule shown able to fail. Kills `complete-unguarded`, `fail-unguarded`, `complete-guard-not-complete`, `fail-guard-not-complete` and `fail-set-unfiltered` | none |
| `test_every_line_item_payload_key_is_resolved` / TC-COMP-059 | ADEQUATE | Strict xfail on `unresolved() == []` (DEC-0113) | none for S2's share |
| `test_line_items.py`, `test_classification_constants.py`, `test_classification_sql_ships.py` | ADEQUATE | All line-item, constant and `frozen` catalogue mutants are killed | none |

**Isolation and determinism.** Each test gets a fresh database (`tests/conftest.py::postgres_connection_string`). The seven story test files passed in all four main mutation baselines (74 passed and 1 xfailed each) and in the focused, full, postgres and non-postgres runs. The two probe baselines passed 7 of 7. The new isolation test and the two new conversion cases read no clock and depend on no host speed.

**Mutation (reviewer, `python -B`, at `b76aa9c`).** 96 mutants:

- **37 catalogue mutants** from `generate --range 33e569c..HEAD --cycle review`: 22 in `engine.py`, 9 in `line_items.py`, 6 in `constants.py`. These are the same 37 as v3, since the production files have not changed.
- **46 earlier manual mutants:** v3's 45 (including `ceil-to-round`, `isolation-serializable` and `log-without-reason`), plus v2's `drop-exc-info`.
- **13 new manual mutants:** `commit-before-complete`, `ctx-ltd-observed-on`, `ctx-active-desc`, `isolation-read-committed`, `isolation-after-timeout`, `ceil-floor-plus-one`, `timeout-ms-scale`, `log-set-id-uuid`, `failed-result-active-count`, `failed-result-qualified`, `complete-guard-not-complete`, `fail-guard-not-complete` and `fail-set-unfiltered`.

93 were killed. Every kill's log names a test that exercises the mutated code. 3 survived:

- `ctx-ltd-observed-on` is non-equivalent (IR-001).
- `commit-before-complete` is non-equivalent (IR-002).
- `log-without-reason` is equivalent to every specified behaviour, as v3 found. T017 and design 2.3 require only that the exception be logged with `set_id`, and `exc_info=True` still carries it.

**Reviewer probe.** The reviewer cloned `b76aa9c` to a scratch directory outside `repos/` and made one scratch commit, `39b1d5b`, adding `tests/integration/test_reviewer_probe_v4.py`. The probe has two cases. The first adds a bar for session 2026-10-02 with `observed_on` 2026-10-05 and expects a latest trading day of 2026-10-02. The second runs a set already failed by another writer, with one stage inserting a `classification_set_factor` row, and expects zero rows afterwards through a second connection. Unmutated, both pass, together with the five conversion cases (7 passed). `ctx-ltd-observed-on` fails the first case (`2026-10-05 == 2026-10-02`). `commit-before-complete` fails the second (`1 == 0`). `ceil-to-round` fails both new conversion cases. The probe is not part of the review subject and is not offered as the fix.

## Independent Validation

`<component>` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`, on the review branch at `b76aa9c` throughout. `<scratch>` is `/private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-run-factorlow-v2-72853f/db9cff1c-3430-41b3-8755-e50004235c55/scratchpad/ir-v4`, outside the repository. The seven story test files are `tests/unit/test_engine_sql_safety.py`, `test_line_items.py`, `test_line_items_resolved.py`, `test_classification_constants.py`, `test_classification_sql_ships.py`, `tests/integration/test_engine_context.py` and `test_engine_transaction.py`. Each `uv`, lint and mutation command ran outside the sandbox as one plain call, with Docker Desktop and testcontainers PostgreSQL 16.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/check-tdd-evidence.py --evidence <component>/.../CAP-002-E2-S2-tdd-evidence.yaml --repo-dir <component> --base 33e569c2d2c489d59f56a648a00a82507decbcd1 --decisions-dir projects/factorflow-v2/decisions --require-logs` (absolute paths, outside the sandbox) | harness root | 0 | PASS (required) | 0 errors, 0 warnings. Checked by hand: `cycle-4.patch` sha256 equals `diff_sha256` `ea5f50f3...` and equals `git diff 196b1a8 b76aa9c -- tests`; `red-cycle-4-rework.log` `7bb38c41...`, `full-suite-cycle-4.log` `f6819d1c...` and `mutation-cycle-4-results.json` `2db63397...` match the evidence file |
| `uv sync --directory <component> --all-extras --offline` | component | 0 | PASS (required) | Resolved 46, checked 43, nothing changed |
| `uv run --directory <component> --all-extras --offline python -B -m pytest -p no:cacheprovider -q -m "postgres or not postgres" <7 story test files> tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_sql_is_append_only.py` | component | 0 | PASS (focused) | 117 passed, 1 xfailed, 5.27 s |
| `uv run --directory <component> --all-extras --offline pytest -p no:cacheprovider -q` | component | 0 | PASS (required) | 1466 passed, 1 xfailed (TC-COMP-059), 236.99 s. Two third-party deprecation warnings (starlette, anyio) |
| `uv run --directory <component> --all-extras --offline pytest -m postgres -p no:cacheprovider -q` | component | 0 | PASS (required) | 438 passed, 1029 deselected, 209.60 s |
| `uv run --directory <component> --all-extras --offline pytest -m "not postgres" -p no:cacheprovider -q` | component | 0 | PASS (required) | 1028 passed, 438 deselected, 1 xfailed, 24.43 s |
| `uv run --directory <component> --all-extras --offline ruff check .` | component | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --all-extras --offline ruff format --check .` | component | 0 | PASS (required) | 228 files already formatted |
| `uv run --directory <component> --all-extras --offline mypy src` | component | 0 | PASS (required) | No issues in 56 source files |
| `uv run --directory <component> --all-extras --offline pytest -p no:cacheprovider -q tests/unit/test_package_data_ships_sql.py tests/unit/test_distribution_contents.py` | component | 0 | PASS (required) | 12 passed; `test_package_data_ships_sql.py` unedited (T018) |
| `uv build --directory <component> --offline --out-dir <scratch>/dist` | component | 0 | PASS (required) | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl`. Both carry `classification/sql/set_context.sql`, `complete_set.sql` and `fail_set.sql`; the wheel has nothing under `tests/` |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 33e569c2d2c489d59f56a648a00a82507decbcd1..HEAD --cycle review --out <scratch>/catalogue.json`; `<scratch>/build_mutants.py` then appends 59 manual mutants into `<scratch>/mutants.json` (sha256 `dea21b3a...`) | harness root | 0 | evidence | 37 catalogue mutants: 4 `drop-defaulted-argument`, 7 `negate-boolean`, 26 `off-by-one` |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --work-root <scratch>/work --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider <7 story test files>' --out <scratch>/results.json` | harness root | 3 | FAIL (required) | 96 mutants: 93 killed, 3 survived (`ctx-ltd-observed-on`, `commit-before-complete`, `log-without-reason`). Four baselines passed. 16:15:29Z to 16:17:04Z. Results sha256 `64f2f3e3...`. A first attempt exited 1 before running anything, because `<scratch>/work` did not exist (`FileNotFoundError` in `mkdtemp`). The reviewer created the directory and reran |
| `python3 scripts/mutation-run.py run --repo-dir <scratch>/probe --mutants <scratch>/mutants.json --only manual:commit-before-complete --only manual:ctx-ltd-observed-on --only manual:ceil-to-round --only manual:log-without-reason --jobs 2 --work-root <scratch>/work --command '... -rf tests/integration/test_reviewer_probe_v4.py tests/integration/test_engine_transaction.py::test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero' --out <scratch>/probe-results.json` | harness root | 3 | evidence | Run on the scratch clone at `39b1d5b`. Two baselines passed, 7 passed each. `commit-before-complete`, `ctx-ltd-observed-on` and `ceil-to-round` are killed; `log-without-reason` survives (equivalent). Results sha256 `c79924d9...` |
| `npm ci`, `npm run build`, `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run test:e2e` | — | N/A | NOT RUN | The change set touches no frontend file, and neither the story nor the plan lists them |

### Validation Side Effects

- Before (16:06:48Z): the review branch at `b76aa9c`, clean, `code-revision` `sha256:82beb238...`.
- After (16:18:46Z): the same branch, HEAD and `code-revision`. `git status --porcelain -uall` is empty. Only ignored paths were written: `.venv/`, `build/`, `src/factorflow.egg-info/` and caches. Mutation clones, the probe, logs, results and build output are all under `<scratch>`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Title |
|----|----------|-------|
| IR-001 | HIGH | The latest trading day's source column is pinned by no test |
| IR-002 | HIGH | Completing in the build's single transaction is untested when a stage has written rows |

### IR-001 — The latest trading day's source column is pinned by no test

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S2-4, DAC-E2-9, AC-19 (the criterion holds in production code, see the AC table)
- **Tasks**: T005 (TC-COMP-159), T003 (`add_bar`), T013
- **Files**:
  - `src/factorflow/classification/sql/set_context.sql:5-8` (`(SELECT max(b.session_date) FROM daily_bar b JOIN instrument i USING (instrument_id) WHERE i.lifecycle = 'active') AS latest_trading_day`);
  - `tests/integration/engine_support.py:45-63` (`add_bar` binds `session_date` to both `session_date` and `observed_on`);
  - `tests/integration/test_engine_context.py:33-68` (TC-COMP-159).
- **Claim challenged**: TC-COMP-159 proves `set_context.sql` returns "the latest trading day held across active instruments", the newest `session_date` (T013, design 2.3 step 2, DEC-0055 (5)).
- **Observed evidence**:
  - Manual mutant `ctx-ltd-observed-on` (`max(b.session_date)` becomes `max(b.observed_on)`) survives the seven story test files, with 74 passed and 1 xfailed.
  - It survives because every bar the story tests write has `observed_on` equal to `session_date`, so the two columns hold the same maximum in every fixture.
  - The mutant is not equivalent. `daily_bar.observed_on` defaults to the acquisition date (`0002_observations.sql:22`, `CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago'`). A next-morning acquisition, a weekend run or any history backfill gives `observed_on > session_date`.
  - The reviewer probe adds one bar for session 2026-10-02 observed on 2026-10-05. It passes unmutated, and the mutant fails it (`2026-10-05 == 2026-10-02`).
- **Expected evidence/behavior**:
  - T013: `latest_trading_day` = `max(b.session_date)`.
  - TC-COMP-159's expected result.
  - TEST-TDD-006 (High): no changed-line mutant survives while a task is marked complete.
  - Adversarial-review E.9: a non-equivalent survivor makes the test that should kill it WEAK; a WEAK mandatory test is at least HIGH.
- **Impact**: A regression to the observation date would set `L` to a day on which no session exists. Under the design 2.4 currency rule, every stock's price-dependent inputs would then be `outdated`, because each stock's latest `session_date` precedes `L`. That would disable every value and momentum classification, and no test would fail.
- **Required remediation**: A set-context case in which an active bar's `observed_on` differs from its `session_date` (for example, later), so that the asserted latest trading day can only be the session date, killing `ctx-ltd-observed-on`. The mutant's exact `old`/`new` pair is in `<scratch>/mutants.json`. `engine_support.py` is this story's own helper (T003), so extending it is in scope.

### IR-002 — Completing in the build's single transaction is untested when a stage has written rows

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-10, DAC-E2-S2-2, AC-20 (the criteria hold in production code, see the AC table)
- **Tasks**: T007 (TC-COMP-167), T017 steps 5 to 7
- **Files**:
  - `src/factorflow/classification/engine.py:110-125` (stages, `complete_set.sql`, the counts read and the single `conn.commit()` at `:125`);
  - `tests/integration/test_engine_transaction.py:167-198` (TC-COMP-167 (a), `_STAGES = []`);
  - `tests/integration/test_engine_transaction.py:201-228` (TC-COMP-167 (b): the stage only fails the set on another connection).
- **Claim challenged**: TC-COMP-167 proves that when the set is no longer `building`, `build` "rolls back and writes nothing" (DAC-E2-S2-2). Together with TC-COMP-166, it is meant to prove that a set "MUST transition to `complete` in the same transaction as its last classification row, or to `failed` ... with every row of that attempt rolled back" (DAC-E2-10).
- **Observed evidence**:
  - Manual mutant `commit-before-complete` inserts `conn.commit()` after the stage loop, before `complete_set.sql`. It survives the seven story test files, with 74 passed and 1 xfailed.
  - TC-COMP-166's stage raises before any commit could run. Neither TC-COMP-167 case has a stage that writes a row. The tests that do write rows from a stage (`test_qualified_counts_...`, `test_inputs_are_read_from_one_snapshot`) end `complete` either way.
  - The mutant is not equivalent for the story's contract. The stages are the seam this story defines (DEC-0112). DAC-E2-S2-1 and DAC-E2-10 are stated over rows that stages write, and CAP-002-E2-S3 to S5 register real stages in this module.
  - The reviewer probe fails the set on another connection before the build, then runs one stage that inserts a `classification_set_factor` row. It passes unmutated, with zero rows read through a second connection. Under the mutant it fails with `1 == 0`: the row stays committed for a `failed` set.
- **Expected evidence/behavior**:
  - DAC-E2-10; DAC-E2-S2-2 ("rolls back and writes nothing").
  - Factor-engine 2.6: "Everything between `BEGIN` and `COMMIT` is one transaction".
  - T017 steps 5 to 7 (stages, completion, counts, then `commit`).
  - TEST-TDD-006; adversarial-review E.9.
- **Impact**:
  - A regression that commits before completion would pass the suite. For example, a commit added to "save" the stages' work, or a stage run under its own `conn.transaction()` block.
  - Once real stages exist, every input, peer-set and classification row of an attempt whose completion fails would stay committed against a `failed` set. Readers could also see a `building` set's rows before completion.
  - No later story's plan tests this path (CAP-002-E2-S7 adds only TC-COMP-091 and TC-COMP-162 to this file).
- **Required remediation**: A TC-COMP-167 path (before or mid-build) in which a stage writes at least one classification row and completion then fails. The test asserts, through a second connection, that no row remains for the set, killing `commit-before-complete`. The mutant's exact `old`/`new` pair is in `<scratch>/mutants.json`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v3/IR-001 | RESOLVED | `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero` (`test_engine_transaction.py:471-494`) adds `(0.0012, "2")` and `(300.0004, "300001")`. In this review's run, `ceil-to-round` is killed by `[0.0012-2]`. The probe run, without `-x`, shows both new cases fail under the mutant (`'1' == '2'`, `'300000' == '300001'`) |
| v3/IR-002 | RESOLVED | `test_build_transaction_runs_at_repeatable_read` (`:421-440`) asserts `SHOW transaction_isolation == 'repeatable read'` inside a stage. `isolation-serializable` is killed in that test, and the new `isolation-read-committed` is killed by `test_inputs_are_read_from_one_snapshot` |

## Scope and Plan Deviations

- T010 asked for "a local pattern" for the classification tables. `test_engine_sql_safety.py` instead reuses CAP-002-E2-S1's `prohibited_research_mutations` and `unguarded_classification_set_updates`, without editing them. v2 and v3 accepted this as justified and stricter, and it is unchanged.
- `count_classification_rows` covers the three child tables, where T003 says four. This is justified: the set row must survive as `failed`.
- `engine.py:30-32` keeps the qualified-counts read as an inline module constant rather than a `.sql` file. T017 step 7 names no file, design 2.1 lists none, and inline constants are an established pattern (`universes/service.py`). Not a finding.
- The story's `status` moved from `planning` to `in-review`. The content revision `sha256:416b2331...` is unchanged.
- The tasks file gained `updated: 2026-10-27` and `last_reworked_review: ...-v3.md`. This is pipeline bookkeeping, with no task text changed.
- The cycle-4 RED and GREEN clones ran CPython 3.12.14, against the checkout's 3.13.7. The tech stack allows Python 3.12+.
- No unjustified change: nothing in `pyproject.toml`, `tests/conftest.py`, a CAP-001 test or `tests/unit/test_package_data_ships_sql.py`.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework against `CAP-002-E2-S2-tasks.md` and this report, then rerun this review. Resolve IR-001 by killing `ctx-ltd-observed-on`, and IR-002 by killing `commit-before-complete`. No production defect was found, so the rework is expected to be tests only, in `test_engine_context.py`, `test_engine_transaction.py` and, if needed, `engine_support.py`.
- **Warnings accepted downstream**: N/A
