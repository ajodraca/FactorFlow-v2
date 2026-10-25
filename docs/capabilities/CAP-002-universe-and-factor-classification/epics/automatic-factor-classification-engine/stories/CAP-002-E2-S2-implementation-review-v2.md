---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S2-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-25
updated: 2026-10-25
story_id: "CAP-002-E2-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-25T01:26:56Z"
reviewed_head: "dda0207f3787ba490dc2ef05d3deb7daee2a5698"
review_base: "3f897a7d6cc821e1d802613b260fde1d1bf570cd"
reviewed_state_revision: "sha256:af29918ec28fa1023193b59576723f4214b5341f2469679d8aa5d8d037af076d"
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
  timestamp: 2026-10-25T01:44:00Z
  source_artifacts:
    - id: CAP-002-E2-S2
      version: "1 (sha256:416b2331639ca3a7f610f2b158467c70d7435f1b0839ca6af554ed5cd3806c0e)"
    - id: CAP-002-E2-S2-tasks
      version: "1 (updated 2026-10-25, last_reworked_review v1)"
    - id: CAP-002-E2-S2-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-002-E2-S2-implementation-review
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-factor-engine-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "5"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S2 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 12/14 satisfied |
| Planned tasks | 19/20 verified |
| Required validation | 10/11 passed |

The rework resolves all ten v1 findings. The reviewer reran all eight v1 survivors and they are now killed, each by the test the rework added for it. The flaky sub-millisecond test was replaced with a deterministic spy, and four parallel baselines passed. The failure log now carries the traceback. Every build, suite, lint, format, type, package-data and TDD-evidence command passes.

The gate still fails on mutation. The reviewer regenerated the catalogue over every changed production file: 37 mutants, all killed. The 20 v1 manual mutants were rerun, also all killed. The reviewer added 13 new manual mutants for branches v1 did not probe, and 6 of them survive. One survivor is equivalent for every behaviour this story ships (IR-004, LOW). The other five are not equivalent. A reviewer probe in a scratch clone kills all five, which shows the gaps can be closed:

- **IR-001:** the `active_instruments` stored on a completed set is pinned by no test. The only completing test has one active instrument and no retired one. So a constant `active_instruments = 1` survives in `complete_set.sql`, and so does counting retired instruments in `engine.py`.
- **IR-002:** the empty-message branch of `_reason` is untested. Without it, a stage that raises an exception with no message makes `build` raise `IndexError` from its failure handler. The set is then left `building` with no reason.
- **IR-003:** the "not inside a transaction" precondition is tested only for an open transaction (`INTRANS`), not for an aborted one (`INERROR`).

These three are new in v2. They concern code that has not changed since v1: only the `log.error` call in `engine.py` changed between `7c7f377` and `dda0207`. v1 did not run these mutants. They are not regressions introduced by the rework.

**By severity:** CRITICAL 0 · HIGH 3 · MEDIUM 0 · LOW 2 · **total 5**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tasks.md` |
| Component | `FactorFlow-v2` (also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S2-run-20261024T231312Z` |
| HEAD | `dda0207f3787ba490dc2ef05d3deb7daee2a5698` (`story-coding(CAP-002-E2-S2): rework review v1, tests that fail when the build stops committing`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E2-integration` = `3f897a7d6cc821e1d802613b260fde1d1bf570cd` (`pipeline-state.py review-base --base-ref`; `git merge-base --is-ancestor` exit 0) |
| Working tree | Clean at 01:26:56Z and after validation: no staged, unstaged or untracked files; ignored caches only. `code-revision` `sha256:af29918e...` before and after. Reflog shows no checkout or switch during this review (the last entry is the coder's own `20:25:39 -0500` re-checkout of the review branch) |
| Changed files reviewed | 89 across three commits (`7c7f377` coding, `5368ae9` review v1, `dda0207` rework) |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/__init__.py` | added | T002 (one line plus LF; unchanged since v1) |
| `src/factorflow/classification/constants.py` | added | T015 (unchanged since v1) |
| `src/factorflow/classification/line_items.py` | added | T016 (unchanged since v1) |
| `src/factorflow/classification/engine.py` | added | T017. Rework: `log.error(..., exc_info=True, extra=...)` at `:129-134` (v1/IR-008), no other change |
| `src/factorflow/classification/sql/set_context.sql` | added | T013 (unchanged since v1) |
| `src/factorflow/classification/sql/complete_set.sql`, `fail_set.sql` | added | T014 (unchanged since v1) |
| `tests/integration/engine_support.py` | added | T003 (unchanged since v1) |
| `tests/integration/test_engine_context.py` | added | T004, T005; TC-COMP-159 (unchanged since v1) |
| `tests/integration/test_engine_transaction.py` | added | T006 to T009; TC-COMP-166, 167, 090. Rework adds `committed`, `statement_timeout`, `RecordingConnection` and seven tests (v1/IR-001 to IR-006, IR-009) |
| `tests/unit/test_engine_sql_safety.py` | added | T010; TC-COMP-160. Rework reuses CAP-002-E2-S1's `prohibited_research_mutations` and `unguarded_classification_set_updates` (v1/IR-010) |
| `tests/unit/test_line_items.py`, `test_line_items_resolved.py` | added | T011; TC-COMP-059 (unchanged since v1) |
| `tests/unit/test_classification_constants.py`, `test_classification_sql_ships.py` | added | T012 (unchanged since v1) |
| `.../stories/CAP-002-E2-S2.md` | modified | Bookkeeping: `status: planning` to `in-review` only. The content revision is unchanged and equals the approval's `reviewed_revision` |
| `.../stories/CAP-002-E2-S2-tasks.md` | modified | Bookkeeping: 20 checkboxes; `updated: 2026-10-25`; `last_reworked_review: CAP-002-E2-S2-implementation-review-v1.md` |
| `.../stories/CAP-002-E2-S2-tdd-evidence.yaml` | added | T020: cycle-1 (corrected RED text, regenerated mutation hash) and cycle-2 (the rework) |
| `.../stories/CAP-002-E2-S2-implementation-review-v1.md` | added | The previous gate report (`5368ae9`) |
| `.../CAP-002-E2-S2-evidence/cycle-1.patch`, `cycle-2.patch` | added | T020 reviewed patches. Each sha256 equals its cycle's `diff_sha256` |
| `.../CAP-002-E2-S2-evidence/mutants-cycle-{1,2}.json`, `mutation-cycle-{1,2}-results.json` | added | T020 |
| `.../CAP-002-E2-S2-evidence/red-cycle-1-engine.log`, `red-cycle-2-rework.log` | added | T020 |
| `.../CAP-002-E2-S2-evidence/mutation-cycle-1-results-logs/*.log` (37), `mutation-cycle-2-results-logs/*.log` (25) | added | T020. Every log is referenced by its results file (37/37 and 25/25), and every `log_sha256` matches |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `set_context.sql:3` returns the set's `run_id`; `engine.py:75` | `test_engine_context.py::test_set_context_resolves_date_latest_trading_day_and_roster` (`first.run_id == run_id`) | S2's share only. The qualifying-run read is CAP-002-E2-S8, and uniqueness is S1's `run_id UNIQUE` |
| AC-11 | SATISFIED | `engine.py:102,105` (whole-millisecond, transaction-local `statement_timeout`, never 0) | TC-COMP-090 test; `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero` (0.0004 to `1`, 0.0015 to `2`, 30 to `30000`); `test_timeout_is_converted_to_whole_milliseconds`; `test_timeout_is_local_to_the_build_transaction` | S2's share is the bound. The 3000-stock volume test is CAP-002-E2-S7. Mutants `timeout-not-local`, `timeout-wrong-guc`, `ms-floor` and both `102` off-by-ones are killed |
| AC-15 | SATISFIED | `set_context.sql:5-14` (latest trading day over active instruments only; rosters partitioned) | `test_set_context_resolves...` (the retired instrument's later bar is ignored; `active_ids == (a, b, c)`, `retired_ids == (retired,)`) | The compute side S2 owns is the partition, which is killed-tested (`ctx-ltd-any-lifecycle`, `ctx-active-includes-retired`). The set row's count is IR-001, recorded against DAC-E2-10 |
| AC-19 | SATISFIED | `engine.py:104` (`REPEATABLE READ`, DEC-0111); no mutation statement under `classification/` | `test_inputs_are_read_from_one_snapshot`; `test_engine_sql_safety.py` (TC-COMP-160) | `drop-repeatable-read` is killed |
| AC-20 | PARTIAL | `engine.py:112-144` | `test_failure_after_inputs_written...` and `test_success_with_no_stages...`, both read through a second connection (`committed`) | Durability is now proven (v1/IR-001 resolved). The empty-message failure branch is untested, and its regression leaves a failed build `building` with no reason (IR-002) |
| DAC-E2-4 | SATISFIED | S1's `classification_set.run_id UNIQUE`; S2 reads the set's `run_id` | `test_set_context_resolves...` | No S2 task, as the plan states |
| DAC-E2-9 | SATISFIED | `engine.py:104`; `set_context.sql` has no `FOR UPDATE` or `LOCK` | `test_inputs_are_read_from_one_snapshot`; the TC-COMP-159 in-transaction case | — |
| DAC-E2-10 | PARTIAL | `engine.py:113-125` (complete in the build transaction); `:126-144` (rollback, then `fail_set.sql` in a new transaction) | Same tests, which now observe the committed state | The complete-set sizing written with the completion (IR-001) and the empty-message failure path (IR-002) have no killing test |
| DAC-E2-S2-1 | SATISFIED | `engine.py:126-144`, `fail_set.sql` | `test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` (TC-COMP-166) | Zero child rows and the `failed` row with `RuntimeError` and `injected failure` are read from a second connection, and so is `ended_at`. The ERROR record carries `set_id` and the traceback |
| DAC-E2-S2-2 | SATISFIED | `complete_set.sql:6-7`; `engine.py:121-122`; `fail_set.sql:5-6` | `test_completing_an_already_failed_set_updates_no_row_and_rolls_back` (other writer's `failure_reason` and `ended_at` unchanged); `test_set_failed_by_another_writer_mid_build_is_left_untouched` | `complete-unguarded`, `fail-unguarded`, `121:negate-boolean` and `142:off-by-one` are killed |
| DAC-E2-S2-3 | SATISFIED | `engine.py:102,105` | `test_build_timeout_fails_the_set_with_a_timeout_reason` (TC-COMP-090) | Committed `failed` state, `QueryCanceled` with `timeout`, zero rows, and `elapsed < 0.9` |
| DAC-E2-S2-4 | SATISFIED | `set_context.sql`; `engine.py:68-80` | `test_set_context_resolves...`, `test_set_context_without_price_data...`, `test_unknown_set_is_reported_as_missing_not_as_a_type_error`, `test_empty_active_roster_fails_with_the_no_price_data_reason` | `drop-lookup-error` and `ctx-active-null-when-empty` are killed (v1/IR-005 resolved). The roster's `ORDER BY` is unobserved (IR-004, LOW) |
| DAC-E2-S2-5 | SATISFIED | `line_items.py` (seven items, `REQUIRES_INPUT`, sign 1, `UNRESOLVED_CAUSE`) | `test_line_items.py`; `test_line_items_resolved.py` (strict xfail, DEC-0113) | S2's share. Per the owner-directed fix E2-F09, the `missing` rows are CAP-002-E2-S3 T012 (a), and "momentum still classifies" is CAP-002-E2-S7 T014 |
| DAC-E2-S2-6 | SATISFIED | No `factorflow.ingestion.massive` import; every `.execute` first argument is a constant or name; no UPDATE or DELETE on observation or history tables | `test_engine_sql_safety.py` (four `# Implements TC-COMP-160` tests plus rule self-tests, now including qualified, quoted, `ONLY`, upsert and statement-bounded cases) | v1/IR-010 resolved |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `0006_classifications.sql` present at the base; `pyproject.toml` package-data includes `classification/sql/*.sql` | — |
| T002 | complete | VERIFIED | `__init__.py` is the pinned docstring plus one LF (`xxd` ends `2e22 2222 0a`) | — |
| T003 | complete | VERIFIED | `engine_support.py:25-98` | `count_classification_rows` counts the three child tables. Justified: the set row must survive as `failed` |
| T004 | complete | VERIFIED | `test_engine_context.py:24-30` | — |
| T005 | complete | VERIFIED | `test_engine_context.py:33-68` | The ordering T013 specifies is not observable here (IR-004) |
| T006 | complete | VERIFIED | `test_engine_transaction.py:113-164` | Committed-state reads and the traceback assertion were added |
| T007 | complete | VERIFIED | `test_engine_transaction.py:167-228` | `ended_at` is now compared (`:198`) |
| T008 | complete | VERIFIED | `test_engine_transaction.py:231-256` | `elapsed < 0.9` (`:250`) |
| T009 | complete | PARTIAL | `test_engine_transaction.py:259-513` (cases a to f, plus the v1 rework tests) | (a) `active_instruments` is asserted only on a one-instrument roster with no retired instrument (IR-001). (e) Only the `INTRANS` state is refused-tested (IR-003). (f) The one-line rule is tested, but not the empty-message branch of the same function (IR-002) |
| T010 | complete | VERIFIED | `test_engine_sql_safety.py` | It now reuses S1's patterns, a justified deviation from "a local pattern" (see Scope) |
| T011 | complete | VERIFIED | `test_line_items.py`, `test_line_items_resolved.py` | — |
| T012 | complete | VERIFIED | `test_classification_constants.py`, `test_classification_sql_ships.py` | — |
| T013 | complete | VERIFIED | `set_context.sql` | `coalesce` to an empty array is tested (`ctx-active-null-when-empty` killed). `ORDER BY` is IR-004 |
| T014 | complete | VERIFIED | `complete_set.sql`, `fail_set.sql` | Factor-engine 2.3 step 8 and failure-paragraph shapes |
| T015 | complete | VERIFIED | `constants.py` | — |
| T016 | complete | VERIFIED | `line_items.py` | — |
| T017 | complete | VERIFIED | `engine.py` | Steps 1 to 7 and the failure path are present and correct. The traceback reaches the log (v1/IR-008 resolved). The test gaps are recorded against T009 |
| T018 | complete | VERIFIED | The reviewer reran every Validation Plan command, and all pass. The wheel and sdist carry the three `classification/sql/*.sql` files | `test_package_data_ships_sql.py` passes unedited |
| T019 | complete | VERIFIED | Six mapped TCs carry `# Implements`; every additional test now cites an AC or DEC in its docstring | The diff touches no `pyproject.toml`, `tests/conftest.py`, CAP-001 test or `test_package_data_ships_sql.py` |
| T020 | complete | VERIFIED | `CAP-002-E2-S2-tdd-evidence.yaml` cycle-1 and cycle-2; the lint reports 0 errors | Evidence fidelity residuals are IR-005 (LOW) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_set_context_resolves_date_latest_trading_day_and_roster` / TC-COMP-159 | ADEQUATE | Date, `run_id`, active-only latest trading day and both rosters. A second connection's commit is invisible inside the open snapshot and visible after. Kills all six row-index mutants, both roster-filter mutants and `ctx-ltd-min` | `ctx-active-unordered` survives, equivalent for S2 (IR-004) |
| `test_set_context_without_price_data_has_no_latest_trading_day` | ADEQUATE | `NULL` latest trading day; kills `ctx-retired-null-when-empty` | none |
| `test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` / TC-COMP-166 | ADEQUATE | Zero child rows and the `failed` row read from a second connection; class, message and no traceback in `failure_reason`; an ERROR record with `set_id` carrying the exception. Kills `drop-failure-commit`, `drop-rollback`, `log-warning`, `log-no-extra`, `drop-exc-info`, `fail-fixed-reason`, `fail-no-ended-at` and `reason-no-class` | The `exc_info`/`exc_text` branch depends on whether an earlier test left `RedactingFilter` installed. Both branches assert the traceback, so strength is unaffected |
| `test_completing_an_already_failed_set_updates_no_row_and_rolls_back` / TC-COMP-167 | ADEQUATE | The other writer's committed reason and `ended_at` stand; nothing is written; the result is `failed` with 0 and `{}` | none |
| `test_set_failed_by_another_writer_mid_build_is_left_untouched` / TC-COMP-167 (b) | ADEQUATE | The serialization-failure path ends in the same state | none |
| `test_build_timeout_fails_the_set_with_a_timeout_reason` / TC-COMP-090 | ADEQUATE | Committed `failed`, `QueryCanceled` with `timeout`, zero rows, returns under 0.9 s; kills `timeout-wrong-guc` and `94:off-by-one:2` | none |
| `test_success_with_no_stages_completes_the_set` | WEAK | Committed `complete`, `ended_at`, `latest_trading_day`; result fields; kills `drop-success-commit`, `complete-no-ltd`, `complete-no-ended-at` | The fixture has one active instrument and no retired one, so `active_instruments == 1` cannot tell the roster size from a constant. `complete-no-active-count`, `stored-count-includes-retired` and `result-count-includes-retired` survive (IR-001) |
| `test_qualified_counts_are_this_sets_classification_set_factor_rows` | ADEQUATE | Exactly this set's counts, and another set's row excluded; kills both `qualified-counts-*` | none |
| `test_stages_run_in_list_order` | ADEQUATE | Distinguishable stages in list order; kills `stages-reversed` | none |
| `test_unknown_set_is_reported_as_missing_not_as_a_type_error` | ADEQUATE | Exact `LookupError` reason; kills `drop-lookup-error` | none |
| `test_empty_active_roster_fails_with_the_no_price_data_reason` | ADEQUATE | Exact DEC-0114 reason with only a retired instrument; kills `ctx-active-null-when-empty` and `drop-no-price-check` | none |
| `test_inputs_are_read_from_one_snapshot` | ADEQUATE | One snapshot across stages; kills `drop-repeatable-read` | none |
| `test_no_price_data_held_fails_the_set_with_a_reason` | ADEQUATE | DEC-0114 reason | none |
| `test_non_positive_timeout_is_refused_before_touching_the_database` | ADEQUATE | 0, -1 and 0.0 refused; the set stays `building`; kills `94:off-by-one:1` | none |
| `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero` | ADEQUATE | The `set_config` parameter is recorded as sent by a `psycopg.Connection` subclass, so the 1 ms timeout cannot pre-empt the observation. Kills `ms-floor` and both `102` off-by-ones. Passed in four parallel baselines and in every suite run | none |
| `test_timeout_is_converted_to_whole_milliseconds` | ADEQUATE | `30s` observed inside a stage | none |
| `test_timeout_is_local_to_the_build_transaction` | ADEQUATE | The connection's `statement_timeout` is unchanged after a complete and after a failed build; kills `timeout-not-local` | none |
| `test_autocommit_or_open_transaction_connection_is_refused` | WEAK | Autocommit and an open (`INTRANS`) transaction are refused before any statement; kills `autocommit-unchecked` and `98:negate-boolean` | An aborted (`INERROR`) transaction is not covered, so `txn-status-intrans-only` survives (IR-003) |
| `test_failure_reason_is_one_line` | WEAK | `RuntimeError: first`; kills `reason-whole-message` | No exception with an empty message, so `reason-no-empty-guard` survives (IR-002) |
| `test_engine_sql_safety.py` / TC-COMP-160 | ADEQUATE | Import, interpolation, mutation, guard, `set_id`, `.format` and lexical rules over the package, each shown able to fail; kills `complete-unguarded` and `fail-unguarded` | none |
| `test_every_line_item_payload_key_is_resolved` / TC-COMP-059 | ADEQUATE | Strict xfail on `unresolved() == []` (DEC-0113) | none for S2's share |
| `test_line_items.py` | ADEQUATE | Names, statement types, labels, sentinel, signs, `unresolved()`, monkeypatched resolution, frozen; kills all nine line-item mutants | none |
| `test_classification_constants.py` | ADEQUATE | Values; `INPUT_NAMES` equals the parsed CHECK; kills all six constant mutants | none |
| `test_classification_sql_ships.py` | ADEQUATE | Three files non-empty and equal to the import-time constants; both dataclasses frozen | none |

**Isolation.** Each test gets a fresh database (`tests/conftest.py::postgres_connection_string`).

**Determinism.** Four mutation-run baselines ran in parallel, and all passed with 67 passed and 1 xfailed. The full suite and the postgres suite also passed.

**Mutation (reviewer, `python -B`, 4 workers, at `dda0207`).** 70 mutants:

- 37 catalogue mutants from `generate --range 3f897a7..HEAD --cycle review`;
- 20 v1 manual mutants, with `log-no-extra` rewritten for the multi-line call;
- 13 new manual mutants.

64 were killed and 6 survived. Every kill's log names a test that exercises the mutated code. Of the 6 survivors, 5 are non-equivalent: IR-001, IR-002 and IR-003. The sixth is equivalent for the shipped behaviour (IR-004).

**Reviewer probes.** The reviewer wrote four probe tests in a scratch clone outside `repos/` and ran the 6 survivors against them. The probes are not part of the review subject and are not offered as the fix. Unmutated, all four passed. Mutated, all 5 non-equivalent survivors were killed. `ctx-active-unordered` survived even after an `UPDATE` of an instrument row.

## Independent Validation

`<component>` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`, on the review branch at `dda0207` throughout. Each `uv run`, `uv sync` and mutation command ran outside the sandbox as one plain call, which the run's `uv run *`, `uv sync*` and mutation-runner rules permit. Output went to `/tmp/claude-501/ir-e2s2-v2/`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/check-tdd-evidence.py --evidence <component>/docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tdd-evidence.yaml --repo-dir <component> --base 3f897a7d6cc821e1d802613b260fde1d1bf570cd --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings. The reviewer also checked by hand: `cycle-2.patch` sha256 = `diff_sha256` `c71bb43f...`; both results sha256 match `results_sha256`; `red-cycle-2-rework.log` sha256 matches; every log is referenced and its hash matches |
| `uv sync --directory <component> --all-extras --offline` | component | 0 | PASS (required) | Resolved 46, checked 43 packages, nothing changed (checkout `.venv`, CPython 3.13.7) |
| `uv build --directory <component> --out-dir /tmp/claude-501/ir-e2s2-v2/dist --offline --find-links /tmp/claude-501/ir-e2s2/wheels --cache-dir /tmp/claude-501/ir-e2s2/uv-cache` (sandbox) | component | 0 | PASS (required) | Built `factorflow-0.1.0.tar.gz` and the wheel. Both carry `classification/sql/{set_context,complete_set,fail_set}.sql`, and the wheel has nothing under `tests/`. Build backend: `setuptools-84.2.1-py3-none-any.whl`, sha256 `3b5c19cf...`, the wheel v1 used |
| `uv build --directory <component> --offline --out-dir /tmp/claude-501/ir-e2s2-v2/dist-plain` (outside the sandbox) | component | N/A | refused | `Run outside of the sandbox`: the run's policy does not name `uv build`. Superseded by the row above |
| `uv run --directory <component> --all-extras --offline python -B -m pytest -p no:cacheprovider -q -m "postgres or not postgres" <7 story test files> tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py` | component | 0 | PASS (focused) | 102 passed, 1 xfailed, 4.69 s |
| `uv run --directory <component> --all-extras --offline pytest -p no:cacheprovider -q` | component | 0 | PASS (required) | 1425 passed, 1 xfailed (TC-COMP-059), 242.88 s |
| `uv run --directory <component> --all-extras --offline pytest -m postgres -p no:cacheprovider -q` | component | 0 | PASS (required) | 416 passed, 1010 deselected, 223.51 s |
| `uv run --directory <component> --all-extras --offline pytest -m "not postgres" -p no:cacheprovider -q` | component | 0 | PASS (required) | 1009 passed, 416 deselected, 1 xfailed, 25.07 s |
| `uv run --directory <component> --all-extras --offline ruff check .` | component | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --all-extras --offline ruff format --check .` | component | 0 | PASS (required) | 220 files already formatted |
| `uv run --directory <component> --all-extras --offline mypy src` | component | 0 | PASS (required) | No issues in 54 source files |
| `uv run --directory <component> --all-extras --offline pytest -p no:cacheprovider -q tests/unit/test_package_data_ships_sql.py tests/unit/test_distribution_contents.py` | component | 0 | PASS (required) | 12 passed; `test_package_data_ships_sql.py` unedited (T018) |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 3f897a7d...HEAD --cycle review --out /tmp/claude-501/ir-e2s2-v2/mutants.json`, then 33 manual mutants appended | harness root | 0 | evidence | 37 catalogue mutants over `engine.py` (22), `line_items.py` (9) and `constants.py` (6). Manual mutants also cover the three `.sql` files |
| `python3 /Users/alvarodejodra/Projects/ai-agents/scripts/mutation-run.py run --repo-dir <component> --mutants /tmp/claude-501/ir-e2s2-v2/mutants.json --jobs 4 --work-root /tmp/claude-501/ir-e2s2-v2 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider <7 story test files>' --out /tmp/claude-501/ir-e2s2-v2/results.json` | harness root | 3 | FAIL (required) | 70 mutants, 64 killed, 6 survived. Four baselines passed. Results sha256 `51f87130...` |
| `python3 .../mutation-run.py run --repo-dir /tmp/claude-501/ir-e2s2-v2/probe --mutants .../mutants.json --only <6 survivors> --jobs 2 --command '... tests/integration/test_reviewer_probe.py' --out /tmp/claude-501/ir-e2s2-v2/probe-results.json` | harness root | 3 | evidence | Run on the scratch clone of `dda0207` plus one scratch commit holding the four probes. 5 killed; `ctx-active-unordered` survived. Results sha256 `e8684117...`. The probes passed unmutated (4 passed) |
| `npm ci`, `npm run build`, `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run test:e2e` | — | N/A | NOT RUN | The change set touches no frontend file, and neither the story nor the plan lists them |

### Validation Side Effects

- Before: the review branch at `dda0207`, clean, `code-revision` `sha256:af29918e...` (01:26:56Z).
- After: the same branch, HEAD and `code-revision`. `git status --porcelain -uall` is empty. Only ignored paths were written (`.venv/`, `build/`, `src/factorflow.egg-info/`, caches). Mutation clones, probes, logs, results and build output are under `/tmp/claude-501/ir-e2s2-v2/`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Title |
|----|----------|-------|
| IR-001 | HIGH | The completed set's `active_instruments` is pinned by no test |
| IR-002 | HIGH | The empty-message branch of the failure reason is untested |
| IR-003 | HIGH | The open-transaction precondition is tested only for `INTRANS` |
| IR-004 | LOW | The roster ordering T013 specifies is not observable |
| IR-005 | LOW | TDD evidence records a state other than the one it names |

### IR-001 — The completed set's `active_instruments` is pinned by no test

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-10 (the completion sizes the set), AC-15 (retired instruments not counted as active)
- **Tasks**: T009 (a), T014, T017
- **Files**:
  - `src/factorflow/classification/sql/complete_set.sql:5`;
  - `src/factorflow/classification/engine.py:118` (`"active_instruments": len(context.active_ids)`) and `:149`;
  - `tests/integration/test_engine_transaction.py:41-46` (the `building_set` fixture: one active instrument) and `:259-280`.
- **Claim challenged**: T009 (a) proves `active_instruments` equals the active roster size, on the set row and in `BuildResult`.
- **Observed evidence**: Three non-equivalent mutants survive the seven story test files:
  - `complete-no-active-count`: `active_instruments = %(active_instruments)s` becomes `active_instruments = 1`;
  - `stored-count-includes-retired`: `engine.py:118` adds `len(context.retired_ids)`;
  - `result-count-includes-retired`: the same change at `engine.py:149`.

  The only completing tests that check the count run on one active instrument and no retired one. A reviewer probe with two active instruments and one retired, all with bars, kills all three.
- **Expected evidence/behavior**:
  - T009 (a): "`active_instruments` equals the active roster size";
  - factor-engine 2.3 step 8 (`active_instruments = %(n)s`) and `BuildResult.active_instruments`;
  - AC-15 (a retired stock is not counted);
  - TEST-TDD-006 (no changed-line mutant survives); adversarial-review E.4 (fixtures do not make the expected result inevitable).
- **Impact**: A completed set could record a wrong number of active stocks without failing the suite: a constant, or a count that includes retired instruments. Nothing in the suite would notice.
- **Required remediation**: A completing build over a roster of at least two active instruments and at least one retired instrument asserts the committed `active_instruments` and `BuildResult.active_instruments`, killing all three mutants.

### IR-002 — The empty-message branch of the failure reason is untested

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-20, DAC-E2-10
- **Tasks**: T009 (f), T017
- **Files**: `src/factorflow/classification/engine.py:84` (`message = str(exc).splitlines()[0] if str(exc) else ""`); `tests/integration/test_engine_transaction.py:499-513`
- **Claim challenged**: `build` records every stage failure as `failed` with its class in a new transaction and never raises for a build failure.
- **Observed evidence**:
  - Manual mutant `reason-no-empty-guard` drops `if str(exc) else ""` and survives the story suites.
  - With it, an exception whose message is empty (`RuntimeError()`, or a bare `assert` in a later stage) makes `"".splitlines()[0]` raise `IndexError` inside the `except` block. `build` then raises after its rollback, before `fail_set.sql` runs.
  - The reviewer probe (a stage raising `RuntimeError()`) passes unmutated, with `failure_reason == "RuntimeError: "` and the set committed `failed`. The probe kills the mutant.
- **Expected evidence/behavior**:
  - factor-engine 2.3: `build` "returns the terminal state and never raises for a build failure";
  - DAC-E2-10: `failed` with the exception class as its reason, in a new transaction;
  - AC-20: a failure shows its reason;
  - TEST-TDD-001 (the guard is behaviour with no failing test) and TEST-TDD-006.
- **Impact**: A regression in this branch would leave a failed build's set `building` with no reason. `idx_classification_set_single_building` would then block every later build until the scheduler's reclaim. Design 2.3 accepts that path only for a lost connection.
- **Required remediation**: A test whose stage raises an exception with an empty message asserts that the committed set is `failed` with the class as its reason, killing the mutant.

### IR-003 — The open-transaction precondition is tested only for `INTRANS`

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: N/A (a caller precondition; the docstring traces it to DAC-E2-S2-3 and DEC-0111)
- **Tasks**: T009 (e), T017 step 1
- **Files**: `src/factorflow/classification/engine.py:98-99`; `tests/integration/test_engine_transaction.py:485-496`
- **Claim challenged**: A connection "already inside a transaction is refused with `ValueError` before any statement".
- **Observed evidence**:
  - Manual mutant `txn-status-intrans-only` (`!= TransactionStatus.IDLE` becomes `== TransactionStatus.INTRANS`) survives. The test opens only an `INTRANS` transaction with `SELECT 1`.
  - With the mutant, a connection whose transaction has already failed (`INERROR`) passes the check. `SET TRANSACTION` then raises `InFailedSqlTransaction`, which `build` catches: it rolls back and records the set `failed`, instead of refusing the call.
  - The reviewer probe (`SELECT 1/0`, then `build`) passes unmutated with `ValueError` and kills the mutant.
- **Expected evidence/behavior**: T017 step 1 ("`conn.info.transaction_status` is `IDLE`, else `ValueError` before any statement"); T009 (e); TEST-TDD-006.
- **Impact**: A caller bug that hands `build` an aborted connection would fail a `building` set rather than surface as a `ValueError`. Nothing in the suite would notice.
- **Required remediation**: The refusal test also covers a connection whose transaction is in error, killing the mutant.

### IR-004 — The roster ordering T013 specifies is not observable

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S2-4
- **Tasks**: T005, T013
- **Files**: `src/factorflow/classification/sql/set_context.sql:9-14`; `tests/integration/test_engine_context.py:57-58`
- **Claim challenged**: `active_ids` and `retired_ids` are `array_agg(... ORDER BY instrument_id)` (T013), and TC-COMP-159 asserts the exact tuple.
- **Observed evidence**: Manual mutant `ctx-active-unordered` (`ORDER BY` dropped for the active roster) survives the story suites. It also survives a reviewer probe that updates an instrument row first: on these small tables the scan order already equals id order.
- **Expected evidence/behavior**: T013. The mutant is equivalent for every behaviour this story ships, because S2 consumes only `len(context.active_ids)` (`engine.py:118`, `:149`). It is therefore not a TEST-TDD-006 blocker here.
- **Impact**: The determinism T013 asks for would go unguarded once a later stage reads `BuildContext.active_ids` in order.
- **Required remediation**: Optional. Pin the order with a roster whose physical order differs from id order, or record that no consumer depends on it.

### IR-005 — TDD evidence records a state other than the one it names

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T020
- **Files**:
  - `CAP-002-E2-S2-tdd-evidence.yaml:34-44` (cycle-1 mutation), `:61-69` (cycle-2 RED and GREEN);
  - `CAP-002-E2-S2-evidence/mutation-cycle-1-results.json`;
  - `CAP-002-E2-S2-evidence/red-cycle-2-rework.log`.
- **Claim challenged**: The cycle-1 mutation record is cycle 1's. `red-cycle-2-rework.log` shows the committed tests failing.
- **Observed evidence**:
  - The regenerated cycle-1 results ran on `repo_head` `5368ae9` with tree patch `1e33e4c2...`, which is the rework tree. Their kills are attributed to tests cycle 1 did not contain. For example, `engine.py:102:off-by-one:1` is killed by `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero[0.0004-1]`. The original cycle-1 run was on `3f897a7` plus `cycle-1.patch` (`2c2b459c...`).
  - The RED log's header says "tests as committed in the cycle", but its failing line is `assert records[0].exc_info is not None`. The committed test (`:158-164`) has the conditional `exc_info`/`exc_text` assertion instead.
  - Cycle-2 `green_evidence` defers the full-suite result to "the completion summary", which is not in the repository.
  - The claims themselves hold. v1 reproduced all 35 cycle-1 kills with `python -B` on `7c7f377`. This review's run kills `drop-exc-info` and both `132` mutants with the committed test, and the full suite passes.
- **Expected evidence/behavior**: TEST-TDD-002 and TEST-TDD-005 (evidence of the cycle it names); v1/IR-007's remediation.
- **Impact**: A later reader cannot reproduce cycle 1's mutation record from the state it names.
- **Required remediation**: Optional. Either label the cycle-1 rerun as made on the rework tree, or rerun it on `7c7f377`. Re-capture or annotate the RED log against the committed assertion. Record the full-suite result in the evidence itself.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `committed()` reads through a second autocommit connection (`test_engine_transaction.py:63-67`), used by TC-COMP-166, TC-COMP-090 and the success test. This review's run kills `drop-success-commit` (`test_success_with_no_stages_completes_the_set`) and `drop-failure-commit` (TC-COMP-166) |
| v1/IR-002 | RESOLVED | `test_timeout_is_local_to_the_build_transaction` (`:465-482`) kills `timeout-not-local` |
| v1/IR-003 | RESOLVED | `test_qualified_counts_are_this_sets_classification_set_factor_rows` (`:283-315`) kills `qualified-counts-not-read` and `qualified-counts-other-sets` |
| v1/IR-004 | RESOLVED | `test_stages_run_in_list_order` (`:318-337`) kills `stages-reversed` |
| v1/IR-005 | RESOLVED | `test_unknown_set_is_reported_as_missing_not_as_a_type_error` kills `drop-lookup-error`; `test_empty_active_roster_fails_with_the_no_price_data_reason` kills `ctx-active-null-when-empty` |
| v1/IR-006 | RESOLVED | The flaky test is replaced by `test_timeout_is_sent_in_whole_milliseconds_rounded_up_never_to_zero`, which records the `set_config` parameter. Four parallel baselines, the full suite and the postgres suite all pass |
| v1/IR-007 | RESOLVED | Mutation evidence was regenerated with `python -B`. Logs are 37/37 and 25/25 referenced with matching hashes. Every kill is attributed to a test that exercises the code. The RED text now states that `test_engine_sql_safety.py` passed from the start. Residual labelling issues are v2/IR-005 (LOW) |
| v1/IR-008 | RESOLVED | `engine.py:129-134` logs with `exc_info=True` and `set_id`. TC-COMP-166 asserts the traceback (`:156-164`). `drop-exc-info` and both `132` catalogue mutants are killed. `failure_reason` stays one line (`reason-whole-message` killed) |
| v1/IR-009 | RESOLVED | The other writer's `ended_at` is compared (`:183-184`, `:198`); `elapsed < 0.9` (`:250`). The five tests cite an AC or DEC in their docstrings (`:418`, `:433`, `:450`, `:488`, `:504`) |
| v1/IR-010 | RESOLVED | `test_engine_sql_safety.py:15-18`, `:98-105` reuse S1's qualified-name, `ONLY`, upsert and statement-bounded patterns. Self-tests at `:166-169` and `:178-184` show each new shape detected |

## Scope and Plan Deviations

- T010 asked for "a local pattern" for the classification tables. `test_engine_sql_safety.py` now imports `prohibited_research_mutations` and `unguarded_classification_set_updates` from CAP-002-E2-S1's `tests/unit/test_research_sql_is_append_only.py`, without editing it. This is justified by v1/IR-010's remediation. It is also stricter than T010: it adds `universe` to the protected tables, rejects `DELETE FROM classification_set`, and requires the guard after `WHERE`. It still admits the scheduler's reclaim statement, which the self-test proves.
- `count_classification_rows` covers the three child tables (T003 says four). This is justified: the set row must remain as `failed`.
- Story `status` moved from `planning` to `in-review`. The content revision `sha256:416b2331...` is unchanged.
- The tasks file gained `updated: 2026-10-25` and `last_reworked_review`. This is pipeline bookkeeping, with no task text changed.
- No unjustified change: nothing in `pyproject.toml`, `tests/conftest.py`, a CAP-001 test or `tests/unit/test_package_data_ships_sql.py`.
- The review environment was undisturbed this time. The reflog shows no switch during the review, so DEC-0188's clone-and-worktree arrangement was not needed. This report is written in the shared checkout on the review branch and left uncommitted (`docs/completion.md`).

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework against `CAP-002-E2-S2-tasks.md` and this report, then rerun this review. Resolve IR-001 to IR-003 so that the five non-equivalent survivors are killed: `complete-no-active-count`, `stored-count-includes-retired`, `result-count-includes-retired`, `reason-no-empty-guard` and `txn-status-intrans-only`. Their exact `old`/`new` pairs are in `/tmp/claude-501/ir-e2s2-v2/mutants.json`. No production defect was found, so the rework is expected to be tests only. IR-004 and IR-005 are optional.
- **Warnings accepted downstream**: N/A
