---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S2-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-27
updated: 2026-10-27
story_id: "CAP-002-E2-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-10-27T03:01:43Z"
reviewed_head: "c20829d0fecf8c80ad51a540973f730d518d8004"
review_base: "33e569c2d2c489d59f56a648a00a82507decbcd1"
reviewed_state_revision: "sha256:8677426a066ef3ecf5f50336d0d898192187aeb0266a68538e3c19a95a612148"
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
  timestamp: 2026-10-27T03:25:00Z
  source_artifacts:
    - id: CAP-002-E2-S2
      version: "1 (sha256:416b2331639ca3a7f610f2b158467c70d7435f1b0839ca6af554ed5cd3806c0e)"
    - id: CAP-002-E2-S2-tasks
      version: "1 (updated 2026-10-26, last_reworked_review v2)"
    - id: CAP-002-E2-S2-tdd-evidence
      version: "cycle-1, cycle-2, cycle-3"
    - id: CAP-002-E2-S2-implementation-review
      version: "2"
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

# Implementation Review: CAP-002-E2-S2 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 19/20 verified |
| Required validation | 10/11 passed |

The rework resolves all five v2 findings. Each of the five non-equivalent v2 survivors is killed by the test the rework added for it. The two roster-ordering mutants are killed too, and so is every other v2 mutant. The TDD-evidence corrections are in place. Every build, suite, lint, format, type, package-data and TDD-evidence command passes on `c20829d`. The counts match the coder's cycle-3 claims exactly: 1463 passed with 1 xfailed, 435 postgres, 1028 not-postgres.

The gate still fails on mutation, on one new mutant. The reviewer regenerated the catalogue over every changed production file (37 mutants) and reran the 34 earlier manual mutants. It also added 11 new manual mutants. Of the 82, 79 are killed and 3 survive:

- **IR-001 (HIGH):** `math.ceil` → `round` in the millisecond conversion survives, and it is not equivalent. T017 and the plan specify rounding *up*. The test that pins the conversion uses 0.0004 s, 0.0015 s and 30 s. The floor `max(1, …)` absorbs the first, round-half-to-even sends 1.5 to 2, and 30 s is whole, so none of the three can tell rounding up from rounding to nearest. A reviewer probe in a scratch clone kills the mutant with 0.0012 s (`"2"`) and 300.0004 s (`"300001"`). The practical effect is under one millisecond, but TEST-TDD-006 sets no materiality threshold.
- **IR-002 (LOW):** `REPEATABLE READ` → `SERIALIZABLE` survives. It is equivalent in the system as built, because no other transaction in `src/` runs at `SERIALIZABLE`, so SSI has nothing to conflict with. DEC-0111's level is nonetheless unpinned.
- `log-without-reason` (the reason dropped from the log message) is equivalent to every specified behaviour. `exc_info=True` still attaches the exception, and the design asks only that the exception be logged with `set_id`. This is not a finding.

The code under IR-001 has not changed since v1. v1 and v2 did not run this mutant. This is not a regression introduced by the rework.

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 1 · **total 2**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tasks.md` |
| Component | `FactorFlow-v2` (also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S2-run-20261024T231312Z` |
| HEAD | `c20829d0fecf8c80ad51a540973f730d518d8004` (`story-coding(CAP-002-E2-S2): rework review v2, tests that pin set sizing, empty reasons, aborted transactions and roster order`) |
| Review base | `origin/main` = `33e569c2d2c489d59f56a648a00a82507decbcd1`. Confirmed by `pipeline-state.py review-base`, both with and without `--base-ref origin/main`, and `git merge-base --is-ancestor` exits 0. The branch merged it in `70d3728`, a clean merge with an empty `--cc` diff, which touched no S2 file. v2's base, `3f897a7` (the E2 integration branch), and the integration branch's current tip `5d16ea9` are both ancestors of `33e569c` |
| Working tree | Clean at 03:01:43Z and after validation: no staged, unstaged or untracked files; only ignored caches. `code-revision` `sha256:8677426a...` before and after. The reflog shows no checkout during this review |
| Changed files reviewed | 107 in `33e569c..HEAD`: 6 production, 8 test, 5 story-directory documents, 88 evidence files |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/__init__.py` | unchanged vs base | T002. The blob `17ac0ef` is byte-identical to the pinned line plus LF (`xxd` ends `2e22 2222 0a`). CAP-002-E2-S8 brought the same blob to `main`, so it is absent from the diff, as T019 anticipates |
| `src/factorflow/classification/constants.py` | added | T015 (unchanged since v1) |
| `src/factorflow/classification/line_items.py` | added | T016 (unchanged since v1) |
| `src/factorflow/classification/engine.py` | added | T017 (unchanged since v2: `git diff dda0207 HEAD` is empty for every production file) |
| `src/factorflow/classification/sql/set_context.sql` | added | T013 (unchanged since v1) |
| `src/factorflow/classification/sql/complete_set.sql`, `fail_set.sql` | added | T014 (unchanged since v1) |
| `tests/integration/engine_support.py` | added | T003 |
| `tests/integration/test_engine_context.py` | added | T004, T005; TC-COMP-159. The rework adds `test_set_context_rosters_are_in_instrument_id_order` (v2/IR-004) |
| `tests/integration/test_engine_transaction.py` | added | T006 to T009; TC-COMP-166, 167, 090. The rework adds three tests: `test_completed_set_is_sized_by_the_active_roster_only` (v2/IR-001), `test_connection_with_an_aborted_transaction_is_refused` (v2/IR-003) and `test_failure_with_an_empty_message_is_recorded_with_its_class` (v2/IR-002) |
| `tests/unit/test_engine_sql_safety.py` | added | T010; TC-COMP-160 |
| `tests/unit/test_line_items.py`, `test_line_items_resolved.py` | added | T011; TC-COMP-059 |
| `tests/unit/test_classification_constants.py`, `test_classification_sql_ships.py` | added | T012 |
| `.../stories/CAP-002-E2-S2.md` | modified | Bookkeeping: `status: planning` to `in-review` only. The content revision `sha256:416b2331...` is unchanged and equals the approval's `reviewed_revision` |
| `.../stories/CAP-002-E2-S2-tasks.md` | modified | Bookkeeping: 20 checkboxes, `updated: 2026-10-26` and `last_reworked_review: CAP-002-E2-S2-implementation-review-v2.md`. A word diff shows nothing else |
| `.../stories/CAP-002-E2-S2-tdd-evidence.yaml` | added | T020: cycles 1 to 3 |
| `.../stories/CAP-002-E2-S2-implementation-review-v1.md`, `-v2.md` | added | The previous gate reports |
| `.../CAP-002-E2-S2-evidence/` (88 files) | added | T020. It holds three cycle patches, three mutant files, three results files, four RED logs and two full-suite logs. It also holds 73 mutation logs: 37 for cycle 1, 25 for cycle 2 and 11 for cycle 3. Hashes are checked below |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `set_context.sql:3` returns the set's `run_id`; `engine.py:75` | `test_engine_context.py::test_set_context_resolves_date_latest_trading_day_and_roster` (`first.run_id == run_id`) | S2's share only. The qualifying-run read is CAP-002-E2-S8, and uniqueness is S1's `run_id UNIQUE` |
| AC-11 | SATISFIED | `engine.py:101-105` sets a whole-millisecond `statement_timeout`, local to the transaction and never 0 | TC-COMP-090; `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero`; `test_timeout_is_converted_to_whole_milliseconds`; `test_timeout_is_local_to_the_build_transaction` | S2's share is the bound, and the bound is applied and proven. The 3000-stock volume test is CAP-002-E2-S7. The round-up direction T017 specifies is unpinned (IR-001, recorded against T009). The deviation is under 1 ms on a 300 s budget, so the AC itself holds |
| AC-15 | SATISFIED | `set_context.sql:5-14`: the latest trading day is taken over active instruments only, and the rosters are partitioned. `engine.py:118`, `:149` count the active roster only | `test_set_context_resolves...` (the retired instrument's later bar is ignored); `test_completed_set_is_sized_by_the_active_roster_only` (2 active and 1 retired give `active_instruments == 2`, committed and in the result) | `ctx-ltd-any-lifecycle`, `ctx-active-includes-retired`, `ctx-retired-includes-active`, `stored-count-includes-retired` and `result-count-includes-retired` are all killed |
| AC-19 | SATISFIED | `engine.py:104` (`REPEATABLE READ`, DEC-0111); no mutation statement under `classification/` | `test_inputs_are_read_from_one_snapshot`; `test_engine_sql_safety.py` (TC-COMP-160) | `drop-repeatable-read` is killed. The specific level is IR-002 (LOW, equivalent) |
| AC-20 | SATISFIED | `engine.py:112-144` | TC-COMP-166; `test_success_with_no_stages...`; `test_failure_with_an_empty_message...`, which reads through a second connection | v2/IR-002 resolved: an exception with an empty message now has a killing test |
| DAC-E2-4 | SATISFIED | S1's `classification_set.run_id UNIQUE`; S2 reads the set's `run_id` | `test_set_context_resolves...` | No S2 task, as the plan states |
| DAC-E2-9 | SATISFIED | `engine.py:104`; `set_context.sql` has no `FOR UPDATE` or `LOCK` | `test_inputs_are_read_from_one_snapshot`; the TC-COMP-159 in-transaction case | — |
| DAC-E2-10 | SATISFIED | `engine.py:113-125` completes the set in the build transaction; `:126-144` rolls back, then runs `fail_set.sql` in a new transaction | TC-COMP-166, TC-COMP-167 (a) and (b), the success test, the sizing test and the empty-message test, all observing the committed state | v2/IR-001 and IR-002 resolved; `complete-no-active-count`, `reason-no-empty-guard`, `complete-raise-removed` and `failed-result-no-reason` are killed |
| DAC-E2-S2-1 | SATISFIED | `engine.py:126-144`, `fail_set.sql` | `test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` (TC-COMP-166) | Zero child rows and a `failed` row carrying `RuntimeError` and `injected failure` are read from a second connection. The ERROR record carries `set_id` and the exception |
| DAC-E2-S2-2 | SATISFIED | `complete_set.sql:6-7`; `engine.py:121-122`; `fail_set.sql:5-6` | `test_completing_an_already_failed_set_updates_no_row_and_rolls_back`; `test_set_failed_by_another_writer_mid_build_is_left_untouched` | `complete-unguarded`, `fail-unguarded`, `121:negate-boolean`, `121:off-by-one` and `complete-raise-removed` are killed |
| DAC-E2-S2-3 | SATISFIED | `engine.py:102,105` | `test_build_timeout_fails_the_set_with_a_timeout_reason` (TC-COMP-090) | The committed state is `failed`, with `QueryCanceled` and `timeout` in the reason, zero rows and `elapsed < 0.9` |
| DAC-E2-S2-4 | SATISFIED | `set_context.sql`; `engine.py:68-80` | `test_set_context_resolves...`, `test_set_context_without_price_data...`, `test_set_context_rosters_are_in_instrument_id_order`, `test_unknown_set_is_reported_as_missing_not_as_a_type_error`, `test_empty_active_roster_fails_with_the_no_price_data_reason` | v2/IR-004 resolved: the `ORDER BY` T013 specifies is now observed over a heap whose order is not id order, with index scans disabled. `ctx-set-unfiltered` is killed |
| DAC-E2-S2-5 | SATISFIED | `line_items.py`: seven items, `REQUIRES_INPUT`, sign 1, `UNRESOLVED_CAUSE` | `test_line_items.py`; `test_line_items_resolved.py` (strict xfail, DEC-0113) | S2's share. Under the owner-directed fix E2-F09, the `missing` rows are CAP-002-E2-S3 T012 (a), and "momentum still classifies" is CAP-002-E2-S7 T014 |
| DAC-E2-S2-6 | SATISFIED | No `factorflow.ingestion.massive` import; every `.execute` first argument is a constant or a name; no UPDATE or DELETE on an observation or history table | `test_engine_sql_safety.py` (four `# Implements TC-COMP-160` tests plus rule self-tests) | Passes over the whole package, now including CAP-002-E2-S8's `scheduler.py`, `settings.py`, `claim_set.sql`, `qualifying_run.sql` and `reclaim_interrupted.sql` from the merge |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `0006_classifications.sql` present at the base; `pyproject.toml:33` package-data includes `classification/sql/*.sql` | — |
| T002 | complete | VERIFIED | `__init__.py` is the pinned docstring plus one LF | Identical blob on `main` (S8), so not in the diff |
| T003 | complete | VERIFIED | `engine_support.py:25-98` | `count_classification_rows` counts the three child tables. Justified: the set row must survive as `failed` |
| T004 | complete | VERIFIED | `test_engine_context.py:24-30` | — |
| T005 | complete | VERIFIED | `test_engine_context.py:33-68`, `:82-111` | The roster order is now observed (v2/IR-004) |
| T006 | complete | VERIFIED | `test_engine_transaction.py:113-164` | — |
| T007 | complete | VERIFIED | `test_engine_transaction.py:167-228` | — |
| T008 | complete | VERIFIED | `test_engine_transaction.py:231-256` | — |
| T009 | complete | PARTIAL | `test_engine_transaction.py:259-576` (cases a to f, plus the v1 and v2 rework tests) | (a), (e) and (f) are now complete (v2/IR-001 to IR-003). In (d), the conversion test `:449-466` cannot tell T017's round-up from rounding to nearest, so `ceil-to-round` survives (IR-001) |
| T010 | complete | VERIFIED | `test_engine_sql_safety.py` | Reuses S1's patterns, a justified deviation (see Scope) |
| T011 | complete | VERIFIED | `test_line_items.py`, `test_line_items_resolved.py` | — |
| T012 | complete | VERIFIED | `test_classification_constants.py`, `test_classification_sql_ships.py` | — |
| T013 | complete | VERIFIED | `set_context.sql` | `ORDER BY` and `coalesce` are both observed |
| T014 | complete | VERIFIED | `complete_set.sql`, `fail_set.sql` | They match factor-engine 2.3 step 8 and the shapes in its failure paragraph |
| T015 | complete | VERIFIED | `constants.py` | — |
| T016 | complete | VERIFIED | `line_items.py` | Verbatim from design 2.4 |
| T017 | complete | VERIFIED | `engine.py` | Steps 1 to 7 and the failure path are present and correct, and step 2 is `math.ceil` exactly as specified. The missing pin is recorded against T009 (IR-001) |
| T018 | complete | VERIFIED | The reviewer reran every Validation Plan command, and all pass. The wheel and sdist carry `classification/sql/{set_context,complete_set,fail_set}.sql` | `test_package_data_ships_sql.py` passes unedited |
| T019 | complete | VERIFIED | The six mapped TCs carry `# Implements`, and every additional test cites an AC or DEC | The diff touches no `pyproject.toml`, `tests/conftest.py`, CAP-001 test or `test_package_data_ships_sql.py` |
| T020 | complete | VERIFIED | `CAP-002-E2-S2-tdd-evidence.yaml` cycles 1 to 3; the reviewer-run lint reports 0 errors | Hashes are checked by hand below |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_set_context_resolves_date_latest_trading_day_and_roster` / TC-COMP-159 | ADEQUATE | Asserts the date, `run_id`, the active-only latest trading day and both rosters. A commit from a second connection stays invisible inside the open snapshot and becomes visible afterwards. Kills all six row-index mutants, `ctx-ltd-*`, `ctx-active-includes-retired` and `ctx-retired-includes-active` | none |
| `test_set_context_without_price_data_has_no_latest_trading_day` | ADEQUATE | A `NULL` latest trading day; kills `ctx-retired-null-when-empty` | none |
| `test_set_context_rosters_are_in_instrument_id_order` (new) | ADEQUATE | A no-op `UPDATE` moves rows `a` and `old` to the end of the heap. Index and bitmap scans are disabled, and the heap order `([b, a], [older, old])` is asserted as a precondition, so a regression shows up as a failed precondition rather than a silent pass. Kills `ctx-active-unordered` and `ctx-retired-unordered`. Deterministic on a fresh database per test. It passed in four parallel baselines and in every suite run | none |
| `test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` / TC-COMP-166 | ADEQUATE | Zero child rows and a `failed` row, read through a second connection; class and message present, no traceback in `failure_reason`; an ERROR record with `set_id` and the exception attached. Kills `drop-failure-commit`, `drop-rollback`, `log-warning`, `log-no-extra`, both `132` catalogue mutants, `fail-fixed-reason`, `fail-no-ended-at`, `reason-no-class`, `except-psycopg-only` and `failed-result-no-reason` | none |
| `test_completing_an_already_failed_set_updates_no_row_and_rolls_back` / TC-COMP-167 | ADEQUATE | The other writer's reason and `ended_at` stand; nothing is written; the result is `failed`, 0, `{}`. Kills `complete-raise-removed` | none |
| `test_set_failed_by_another_writer_mid_build_is_left_untouched` / TC-COMP-167 (b) | ADEQUATE | The serialization-failure path ends in the same state | none |
| `test_build_timeout_fails_the_set_with_a_timeout_reason` / TC-COMP-090 | ADEQUATE | Committed `failed`, `QueryCanceled` with `timeout`, zero rows, returns in under 0.9 s | none |
| `test_success_with_no_stages_completes_the_set` | ADEQUATE | Committed `complete`, with `ended_at` and `latest_trading_day` set; the result fields. Kills `drop-success-commit`, `complete-no-ltd`, `complete-no-ended-at` and `complete-ltd-is-classification-date` | none |
| `test_completed_set_is_sized_by_the_active_roster_only` (new) | ADEQUATE | 2 active instruments and 1 retired, all holding bars, give `active_instruments == 2` on the committed row and in `BuildResult`. Kills `complete-no-active-count`, `stored-count-includes-retired` and `result-count-includes-retired` | none |
| `test_qualified_counts_are_this_sets_classification_set_factor_rows` | ADEQUATE | Returns exactly this set's counts and excludes the other set's row | none |
| `test_stages_run_in_list_order` | ADEQUATE | Kills `stages-reversed` | none |
| `test_unknown_set_is_reported_as_missing_not_as_a_type_error` | ADEQUATE | The exact `LookupError` reason, and the other set stays `building`. Kills `drop-lookup-error` and `ctx-set-unfiltered` | none |
| `test_empty_active_roster_fails_with_the_no_price_data_reason` | ADEQUATE | Kills `ctx-active-null-when-empty` and `drop-no-price-check` | none |
| `test_inputs_are_read_from_one_snapshot` | ADEQUATE | One snapshot across stages; kills `drop-repeatable-read` | `isolation-serializable` survives. It is equivalent in the system as built (IR-002, LOW) |
| `test_no_price_data_held_fails_the_set_with_a_reason` | ADEQUATE | The DEC-0114 reason | none |
| `test_non_positive_timeout_is_refused_before_touching_the_database` | ADEQUATE | 0, -1 and 0.0 are refused and the set stays `building`. Kills `94:off-by-one:1` and `94:off-by-one:2` | none |
| `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero` | WEAK | Records the `set_config` parameter as sent. Its cases are 0.0004 s → `"1"`, 0.0015 s → `"2"` and 30 s → `"30000"`. Kills `ceil-to-int` (the coder's cycle-2 `ms-floor`) and both `102` catalogue mutants | `ceil-to-round` survives. 0.0004 s is absorbed by `max(1, …)`, 1.5 rounds half-to-even to 2, and 30 s is whole, so the round-up property the test's name claims is never exercised (IR-001) |
| `test_timeout_is_converted_to_whole_milliseconds` | ADEQUATE | `30s` observed inside a stage | none |
| `test_timeout_is_local_to_the_build_transaction` | ADEQUATE | Kills `timeout-not-local` | none |
| `test_autocommit_or_open_transaction_connection_is_refused` | ADEQUATE | Autocommit and `INTRANS` are refused. Kills `autocommit-unchecked` and `98:negate-boolean` | none |
| `test_connection_with_an_aborted_transaction_is_refused` (new) | ADEQUATE | An `INERROR` connection is refused with `ValueError`, and the set stays `building`. Kills `txn-status-intrans-only` | none |
| `test_failure_reason_is_one_line` | ADEQUATE | Kills `reason-whole-message`, `reason-last-line` and `84:off-by-one` | none |
| `test_failure_with_an_empty_message_is_recorded_with_its_class` (new) | ADEQUATE | Committed `failed` with `ended_at` and `RuntimeError: `; `build` does not raise. Kills `reason-no-empty-guard` | none |
| `test_engine_sql_safety.py` / TC-COMP-160 | ADEQUATE | Import, interpolation, mutation, guard, `set_id`, `.format` and lexical rules, each shown able to fail; kills `complete-unguarded` and `fail-unguarded` | none |
| `test_every_line_item_payload_key_is_resolved` / TC-COMP-059 | ADEQUATE | Strict xfail on `unresolved() == []` (DEC-0113) | none for S2's share |
| `test_line_items.py` | ADEQUATE | Kills all nine line-item mutants | none |
| `test_classification_constants.py` | ADEQUATE | Kills all six constant mutants; `INPUT_NAMES` equals the parsed CHECK | none |
| `test_classification_sql_ships.py` | ADEQUATE | The three files are non-empty and equal to the import-time constants. Kills both `frozen` mutants on the engine dataclasses | none |

**Isolation and determinism.** Each test gets a fresh database (`tests/conftest.py::postgres_connection_string`). Six baselines of the seven story test files passed, four in the main mutation run and two in the supplementary run, each with 71 passed and 1 xfailed. The full suite, the postgres suite and the non-postgres suite also passed.

**Mutation (reviewer, `python -B`, at `c20829d`).** 82 mutants:

- **37 catalogue mutants** from `generate --range 33e569c..HEAD --cycle review`: 22 in `engine.py`, 9 in `line_items.py`, 6 in `constants.py`.
- **34 earlier manual mutants:** v2's 33, plus cycle-3's `ctx-retired-unordered`.
- **11 new manual mutants:** `ceil-to-round`, `ceil-to-int`, `isolation-serializable`, `reason-last-line`, `complete-raise-removed`, `except-psycopg-only`, `failed-result-no-reason`, `ctx-set-unfiltered`, `ctx-retired-includes-active`, `complete-ltd-is-classification-date` and `log-without-reason`.

79 were killed. Every kill's log names a test that exercises the mutated code. 3 survived:

- `ceil-to-round` is non-equivalent (IR-001).
- `isolation-serializable` is equivalent in the system as built (IR-002).
- `log-without-reason` is equivalent to every specified behaviour: T017 and design 2.3 require only that the exception be logged with `set_id`, and `exc_info=True` still carries it. No finding.

**Reviewer probe.** The reviewer wrote three probe cases in a scratch clone outside `repos/`: `(0.0012, "2")`, `(300.0004, "300001")`, and a stage asserting `SHOW transaction_isolation == 'repeatable read'`. They are not part of the review subject and are not offered as the fix. Unmutated, all three pass. `ceil-to-round` fails both conversion cases, and `isolation-serializable` fails the isolation case.

## Independent Validation

`<component>` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`, on the review branch at `c20829d` throughout. `<scratch>` is `/private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-run-factorlow-v2-72853f/db9cff1c-3430-41b3-8755-e50004235c55/scratchpad/ir-v3`, outside the repository. The seven story test files are `tests/unit/test_engine_sql_safety.py`, `test_line_items.py`, `test_line_items_resolved.py`, `test_classification_constants.py`, `test_classification_sql_ships.py`, `tests/integration/test_engine_context.py` and `test_engine_transaction.py`. Each `uv` and mutation command ran outside the sandbox as one plain call.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/.../CAP-002-E2-S2-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 33e569c2d2c489d59f56a648a00a82507decbcd1 --decisions-dir projects/factorflow-v2/decisions --require-logs` (sandboxed) | harness root | 1 | superseded | Three `TDD-LINT-DIFF` errors, each from the sandbox: `error: unable to create temporary file: Operation not permitted`. The row below reran the same command outside the sandbox |
| The same command with absolute paths, outside the sandbox | harness root | 0 | PASS (required) | 0 errors, 0 warnings. Checked by hand: `cycle-3.patch` sha256 equals `diff_sha256` `6c75ba20...`; `mutation-cycle-3-results.json` matches `d189e24b...`; the RED and full-suite logs for cycles 2 and 3 match their recorded sha256 |
| `uv sync --directory <component> --all-extras --offline` | component | 0 | PASS (required) | Resolved 46, checked 43, nothing changed (CPython 3.13.7) |
| `uv run --directory <component> --all-extras --offline python -B -m pytest -p no:cacheprovider -q -m "postgres or not postgres" <7 story test files> tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_sql_is_append_only.py` | component | 0 | PASS (focused) | 114 passed, 1 xfailed, 4.87 s |
| `uv run --directory <component> --all-extras --offline pytest -p no:cacheprovider -q` | component | 0 | PASS (required) | 1463 passed, 1 xfailed (TC-COMP-059), 245.20 s. Two third-party deprecation warnings (starlette, anyio) |
| `uv run --directory <component> --all-extras --offline pytest -m postgres -p no:cacheprovider -q` | component | 0 | PASS (required) | 435 passed, 1029 deselected, 226.36 s |
| `uv run --directory <component> --all-extras --offline pytest -m "not postgres" -p no:cacheprovider -q` | component | 0 | PASS (required) | 1028 passed, 435 deselected, 1 xfailed, 24.97 s |
| `uv run --directory <component> --all-extras --offline ruff check .` | component | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --all-extras --offline ruff format --check .` | component | 0 | PASS (required) | 228 files already formatted |
| `uv run --directory <component> --all-extras --offline mypy src` | component | 0 | PASS (required) | No issues in 56 source files |
| `uv run --directory <component> --all-extras --offline pytest -p no:cacheprovider -q tests/unit/test_package_data_ships_sql.py tests/unit/test_distribution_contents.py` | component | 0 | PASS (required) | 12 passed; `test_package_data_ships_sql.py` unedited (T018) |
| `uv build --directory <component> --offline --out-dir <scratch>/dist` | component | 0 | PASS (required) | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl`. Both carry the three S2 statements; the wheel has nothing under `tests/` |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 33e569c2d2c489d59f56a648a00a82507decbcd1..HEAD --cycle review --out <scratch>/catalogue.json`, then 43 manual mutants appended into `<scratch>/mutants.json` (sha256 `d5da0667...`) | harness root | 0 | evidence | 37 catalogue mutants: 4 `drop-defaulted-argument`, 7 `negate-boolean`, 26 `off-by-one` |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --work-root <scratch>/work --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider <7 story test files>' --out <scratch>/results.json` | harness root | 3 | FAIL (required) | 80 mutants: 78 killed, 2 survived (`ceil-to-round`, `isolation-serializable`). Four baselines passed. Results sha256 `316439f9...` |
| The same `run` with `--mutants <scratch>/mutants-extra.json --jobs 2 --out <scratch>/results-extra.json` | harness root | 3 | evidence | 2 mutants: `complete-ltd-is-classification-date` killed; `log-without-reason` survived (equivalent). Two baselines passed. Results sha256 `0ba336b7...` |
| `python3 scripts/mutation-run.py run --repo-dir <scratch>/probe --mutants <scratch>/mutants.json --only manual:ceil-to-round --only manual:isolation-serializable --jobs 2 --command '... tests/integration/test_reviewer_probe_v3.py' --out <scratch>/probe-results.json` | harness root | 0 | evidence | Run on a scratch clone of `c20829d` plus one scratch commit with the probe. Baselines: 3 passed. Both survivors are killed. Results sha256 `9689468e...` |
| `npm ci`, `npm run build`, `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run test:e2e` | — | N/A | NOT RUN | The change set touches no frontend file, and neither the story nor the plan lists them |

### Validation Side Effects

- Before (03:01:43Z): the review branch at `c20829d`, clean, `code-revision` `sha256:8677426a...`.
- After: the same branch, HEAD and `code-revision`. `git status --porcelain -uall` is empty. Only ignored paths were written: `.venv/`, `build/`, `src/factorflow.egg-info/` and caches. Mutation clones, the probe, logs, results and build output are under `<scratch>`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Title |
|----|----------|-------|
| IR-001 | HIGH | The millisecond conversion's round-up is pinned by no test |
| IR-002 | LOW | DEC-0111's isolation level is pinned only as one snapshot |

### IR-001 — The millisecond conversion's round-up is pinned by no test

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-11 (the build timeout bound; the AC itself holds, see the AC table)
- **Tasks**: T009 (d), T017 step 2
- **Files**:
  - `src/factorflow/classification/engine.py:102` (`timeout_ms = str(max(1, math.ceil(timeout_seconds * 1000)))`);
  - `tests/integration/test_engine_transaction.py:449-466` (`test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero`, cases `(0.0004, "1")`, `(0.0015, "2")`, `(30, "30000")`).
- **Claim challenged**: the build rounds `timeout_seconds` *up* to whole milliseconds, and the test named "rounded up" proves it.
- **Observed evidence**:
  - Manual mutant `ceil-to-round` (`math.ceil(timeout_seconds * 1000)` becomes `round(timeout_seconds * 1000)`) survives the seven story test files, with 71 passed and 1 xfailed.
  - The three cases cannot tell the two apart. 0.0004 × 1000 = 0.4 rounds to 0, which `max(1, …)` lifts to 1. 0.0015 × 1000 = 1.5 rounds half-to-even to 2. 30 s is a whole number.
  - The mutant is not equivalent. `ClassificationSettings.build_timeout_seconds` is a `float` (`ge=1`), so a configured 300.0004 s sends `300000` instead of `300001`, and 0.0012 s sends `1` instead of `2`.
  - The reviewer probe passes unmutated with `(0.0012, "2")` and `(300.0004, "300001")`, and both cases kill the mutant.
- **Expected evidence/behavior**:
  - T017 step 2: `ms = str(max(1, math.ceil(timeout_seconds * 1000)))`.
  - The plan's Open Gaps: `build` "rounds up to whole milliseconds".
  - TEST-TDD-006 (High): no changed-line mutant survives while a task is marked complete.
  - Adversarial-review E.9: a non-equivalent survivor makes its test WEAK.
- **Impact**: A regression to rounding to nearest would shorten a configured timeout by up to half a millisecond without failing the suite. The practical effect on the 300 s budget is negligible. The test's name and docstring nonetheless claim a property it does not exercise.
- **Required remediation**: The conversion test also covers a value whose fractional millisecond rounds differently up than to nearest, killing `ceil-to-round`. Its exact `old`/`new` pair is in `<scratch>/mutants.json`.

### IR-002 — DEC-0111's isolation level is pinned only as one snapshot

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-9, AC-19
- **Tasks**: T009 (b), T017 step 2
- **Files**: `src/factorflow/classification/engine.py:104`; `tests/integration/test_engine_transaction.py:393-418`
- **Claim challenged**: the build runs at `REPEATABLE READ` (DEC-0111), and `test_inputs_are_read_from_one_snapshot` pins it.
- **Observed evidence**:
  - Manual mutant `isolation-serializable` survives. The test proves a snapshot, which `SERIALIZABLE` also gives; it does not prove the level.
  - The mutant is equivalent in the system as built. PostgreSQL's SSI tracks read-write conflicts only among `SERIALIZABLE` transactions, and `grep -rniE 'serializable|isolation' src/` finds no other transaction at that level. A concurrent update of the set row raises the same `SerializationFailure` under both levels.
  - The reviewer probe (`SHOW transaction_isolation == 'repeatable read'` inside a stage) kills it.
- **Expected evidence/behavior**: DEC-0111 ("the weakest level that fixes one snapshot") and T017 step 2. Because the mutant is equivalent here, it is not a TEST-TDD-006 blocker.
- **Impact**: If a later component opens `SERIALIZABLE` transactions, a regression to that level could add serialization failures to builds, and nothing would catch it.
- **Required remediation**: Optional. Either pin the level inside a stage, or record that it is deliberately unpinned.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 | RESOLVED | `test_completed_set_is_sized_by_the_active_roster_only` (`test_engine_transaction.py:283-304`) asserts `active_instruments == 2` on the committed row and in the result, over 2 active instruments and 1 retired. This review's run kills `complete-no-active-count`, `stored-count-includes-retired` and `result-count-includes-retired`, each in that test |
| v2/IR-002 | RESOLVED | `test_failure_with_an_empty_message_is_recorded_with_its_class` (`:555-576`) asserts a committed `failed` row with `ended_at` and `RuntimeError: `. `reason-no-empty-guard` is killed in that test |
| v2/IR-003 | RESOLVED | `test_connection_with_an_aborted_transaction_is_refused` (`:523-535`) checks `INERROR`, expects `ValueError` and confirms the set stays `building`. `txn-status-intrans-only` is killed in that test |
| v2/IR-004 | RESOLVED | `test_set_context_rosters_are_in_instrument_id_order` (`test_engine_context.py:82-111`) asserts a heap-order precondition and disables index scans. `ctx-active-unordered` and `ctx-retired-unordered` are both killed in that test |
| v2/IR-005 | RESOLVED | Cycle-1 `mutation_state` labels the rerun as made on `5368ae9` with the cycle-2 tree (`tdd-evidence.yaml:37-42`). `red-cycle-2-committed-assertion.log` fails on `assert record.exc_text is not None`, which is the committed assertion. `full-suite-cycle-2-dda0207.log` records 1425 passed, 1 xfailed. All three hashes match |

## Scope and Plan Deviations

- T010 asked for "a local pattern" for the classification tables. `test_engine_sql_safety.py` instead reuses CAP-002-E2-S1's `prohibited_research_mutations` and `unguarded_classification_set_updates`, without editing them. v2 accepted this as justified and stricter, and it is unchanged.
- `count_classification_rows` covers the three child tables, where T003 says four. This is justified: the set row must survive as `failed`.
- The story's `status` moved from `planning` to `in-review`. The content revision `sha256:416b2331...` is unchanged.
- The tasks file gained `updated: 2026-10-26` and `last_reworked_review`. This is pipeline bookkeeping, with no task text changed.
- `70d3728` merged `origin/main` cleanly. It brought in CAP-002-E2-S8's scheduler files, and TC-COMP-160's package-wide rules now scan them and pass. It changed no S2 file.
- The cycle-3 RED clone ran CPython 3.12.14, against the checkout's 3.13.7. The tech stack allows Python 3.12+, so this is not a finding.
- No unjustified change: nothing in `pyproject.toml`, `tests/conftest.py`, a CAP-001 test or `tests/unit/test_package_data_ships_sql.py`.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework against `CAP-002-E2-S2-tasks.md` and this report, then rerun this review. Resolve IR-001 by killing `ceil-to-round`. No production defect was found, so the rework is expected to be tests only. IR-002 is optional.
- **Warnings accepted downstream**: N/A
