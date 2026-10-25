---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-25
updated: 2026-10-25
story_id: "CAP-002-E2-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-25T00:43:12Z"
reviewed_head: "7c7f37758e2e0494e3e42a8574684eb429c49763"
review_base: "3f897a7d6cc821e1d802613b260fde1d1bf570cd"
reviewed_state_revision: "sha256:188a368978652ad1fa7acb50923cb14d4a85174d825ea616859f45952f4acfff"
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
  timestamp: 2026-10-25T01:05:00Z
  source_artifacts:
    - id: CAP-002-E2-S2
      version: "1 (sha256:416b2331639ca3a7f610f2b158467c70d7435f1b0839ca6af554ed5cd3806c0e)"
    - id: CAP-002-E2-S2-tasks
      version: "1"
    - id: CAP-002-E2-S2-tdd-evidence
      version: "cycle-1"
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
    - id: DEC-0188
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 6 |
| Medium findings | 3 |
| Low findings | 1 |
| Acceptance criteria | 10/14 satisfied |
| Planned tasks | 20/20 verified |
| Required validation | 10/11 passed |

The production code does what the plan and factor-engine design 2.3 describe. `build` runs at `REPEATABLE READ` with a transaction-local timeout, completes the set only when the guarded update matches one row, and otherwise rolls back and records `failed` with a one-line reason in a new transaction. Every suite, lint, format, type and build command passes.

The gate fails on test strength. The reviewer regenerated the catalogue mutants over every changed production file and added 20 hand-written ones. Run without stale bytecode, 8 non-equivalent mutants survive (TEST-TDD-006):

- Dropping either `conn.commit()` survives. Every test reads the set back on the build's own connection, so nothing proves a complete or failed set is ever durable (IR-001). This makes the mandatory TC-COMP-166 and TC-COMP-090 `WEAK`, and leaves AC-20, DAC-E2-10, DAC-E2-S2-1 and DAC-E2-S2-3 `PARTIAL`.
- `set_config(..., true)` changed to `false` survives, so the timeout could leak onto the caller's connection (IR-002).
- The `qualified_counts` read (IR-003), stage order (IR-004), and the missing-set and empty-roster paths (IR-005) have no test that fails when they break.

One planned test is also nondeterministic. `test_sub_millisecond_timeout_rounds_up_never_to_zero` failed on an unmutated baseline worker, because its 1 ms timeout can cancel `set_context.sql` before the stage it observes runs (IR-006).

The coder's "35/35 killed" evidence is not reliable. 14 of its kills are attributed to `test_constant_values`, which cannot observe `engine.py`, because the runner's workers reused bytecode from earlier mutants. A clean rerun does kill all 35 catalogue mutants, but the evidence does not show it (IR-007).

**By severity:** CRITICAL 0 · HIGH 6 · MEDIUM 3 · LOW 1 · **total 10**

**Review environment.** At 2026-10-25T00:46:09Z a process other than this review switched the shared checkout `repos/factorflow-v2/FactorFlow-v2` away from the review branch: `checkout: moving from usr/alvaro-de-jodra/CAP-002-E2-S2-run-20261024T231312Z to main`, `merge origin/main: Fast-forward`, then `checkout: moving from main to usr/alvaro-de-jodra/CAP-003-design`. It happened while the postgres suite was running. That checkout now holds another session's uncommitted CAP-003 design work. Under DEC-0188, every command the switch could have affected was rerun in a scratch clone of `7c7f377` outside `repos/`. That clone's `code-revision` is identical to the one taken on the checkout before the switch. This report was committed on the review branch through a temporary worktree, and the shared checkout was not switched back.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tasks.md` |
| Component | `FactorFlow-v2` (also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S2-run-20261024T231312Z` |
| HEAD | `7c7f37758e2e0494e3e42a8574684eb429c49763` (`story-coding(CAP-002-E2-S2): factor engine build transaction`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E2-integration` = `3f897a7d6cc821e1d802613b260fde1d1bf570cd` (`pipeline-state.py review-base --base-ref`; ancestor of HEAD) |
| Working tree | Clean at 00:43:12Z (no staged, unstaged or untracked files; ignored caches only). `code-revision` `sha256:188a368978652ad1fa7acb50923cb14d4a85174d825ea616859f45952f4acfff`, identical on the scratch clone `/tmp/claude-501/ir-e2s2/subject` |
| Changed files reviewed | 75 (one commit) |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/__init__.py` | added | T002 (one line plus LF, byte-identical to the S8 T014 pin) |
| `src/factorflow/classification/constants.py` | added | T015; AC-11, AC-13, AC-14 |
| `src/factorflow/classification/line_items.py` | added | T016; DAC-E2-S2-5 |
| `src/factorflow/classification/engine.py` | added | T017; AC-20, DAC-E2-10, DAC-E2-S2-1 to -4 |
| `src/factorflow/classification/sql/set_context.sql` | added | T013; DAC-E2-S2-4, DAC-E2-9, AC-15 |
| `src/factorflow/classification/sql/complete_set.sql` | added | T014; DAC-E2-S2-2 |
| `src/factorflow/classification/sql/fail_set.sql` | added | T014; DAC-E2-S2-1 |
| `tests/integration/engine_support.py` | added | T003 |
| `tests/integration/test_engine_context.py` | added | T004, T005; TC-COMP-159 |
| `tests/integration/test_engine_transaction.py` | added | T006 to T009; TC-COMP-166, 167, 090 |
| `tests/unit/test_engine_sql_safety.py` | added | T010; TC-COMP-160 |
| `tests/unit/test_line_items.py` | added | T011 |
| `tests/unit/test_line_items_resolved.py` | added | T011; TC-COMP-059 (strict xfail, DEC-0113) |
| `tests/unit/test_classification_constants.py` | added | T012 |
| `tests/unit/test_classification_sql_ships.py` | added | T012 |
| `.../stories/CAP-002-E2-S2.md` | modified | Bookkeeping: `status: planning` to `in-review` only. The content revision is unchanged and equals the approval's `reviewed_revision` |
| `.../stories/CAP-002-E2-S2-tasks.md` | modified | Bookkeeping: 20 checkboxes `[ ]` to `[x]`, no other change |
| `.../stories/CAP-002-E2-S2-tdd-evidence.yaml` | added | T020 |
| `.../stories/CAP-002-E2-S2-evidence/cycle-1.patch` | added | T020 (reviewed patch; its sha256 equals `diff_sha256`) |
| `.../stories/CAP-002-E2-S2-evidence/mutants-cycle-1.json`, `mutation-cycle-1-results.json` | added | T020 |
| `.../stories/CAP-002-E2-S2-evidence/red-cycle-1-engine.log` | added | T020 |
| `.../stories/CAP-002-E2-S2-evidence/mutation-cycle-1-results-logs/*.log` (53 files) | added | T020. 39 are referenced by the results file; 14 are stale logs of an earlier run (IR-007) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `set_context.sql:3` returns the set's `run_id`; `engine.py:75` | `test_engine_context.py::test_set_context_resolves_date_latest_trading_day_and_roster` (`first.run_id == run_id`) | S2's share only. The qualifying-run read is CAP-002-E2-S8; uniqueness is S1's `run_id ... UNIQUE` (`0006_classifications.sql`) |
| AC-11 | SATISFIED | `engine.py:102,105` (whole-ms `statement_timeout`, never 0) | `test_build_timeout_fails_the_set_with_a_timeout_reason`, `test_timeout_is_converted_to_whole_milliseconds`, `test_sub_millisecond_timeout_rounds_up_never_to_zero` | S2's share is the bound. The 3000-stock volume test is CAP-002-E2-S7. Locality (IR-002) and the flaky sub-ms test (IR-006) are recorded against T009 |
| AC-15 | SATISFIED | `set_context.sql:5-14` (latest trading day over active only; active and retired rosters partitioned) | `test_set_context_resolves...` (retired later bar ignored; `active_ids == (a, b, c)`, `retired_ids == (retired,)`) | Mutants `ctx-ltd-any-lifecycle` and `ctx-active-includes-retired` are killed |
| AC-19 | SATISFIED | `engine.py:104` (`REPEATABLE READ`, DEC-0111); no mutation statement in the package | `test_inputs_are_read_from_one_snapshot`; `test_engine_sql_safety.py` (TC-COMP-160) | Mutant `drop-repeatable-read` is killed |
| AC-20 | PARTIAL | `engine.py:112-139` | `test_failure_after_inputs_written...`, `test_success_with_no_stages_completes_the_set` | The production code is correct. No test shows a complete or failed set is committed: both `commit()` deletions survive (IR-001) |
| DAC-E2-4 | SATISFIED | Enforced by S1's `classification_set.run_id UNIQUE`; S2 reads the set's `run_id` | `test_set_context_resolves...` | No S2 task, as the plan's traceability states |
| DAC-E2-9 | SATISFIED | `engine.py:104`; `set_context.sql` has no `FOR UPDATE` or `LOCK` | `test_inputs_are_read_from_one_snapshot` (a bar committed mid-build is unseen by a later stage; `latest_trading_day` stays the earlier date); TC-COMP-159 in-transaction case | — |
| DAC-E2-10 | PARTIAL | `engine.py:125` (commit with the completion), `:127-132` (rollback, `fail_set.sql` in a new transaction, commit) | Same tests | "in the same transaction ... or ... in a new transaction" is not observed by any test (IR-001) |
| DAC-E2-S2-1 | PARTIAL | `engine.py:126-139`, `fail_set.sql` | `test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` (TC-COMP-166) | Zero rows and the `RuntimeError` reason are asserted, but only on the build's own connection, so the `failed` state is never shown to be durable (IR-001) |
| DAC-E2-S2-2 | SATISFIED | `complete_set.sql:6-7` guard; `engine.py:121-122`; `fail_set.sql:5-6` guard | `test_completing_an_already_failed_set_updates_no_row_and_rolls_back`, `test_set_failed_by_another_writer_mid_build_is_left_untouched` | The other writer commits on its own connection, so its committed `failure_reason` is what is read. Mutants `complete-unguarded`, `fail-unguarded`, `121:negate-boolean` are killed |
| DAC-E2-S2-3 | PARTIAL | `engine.py:102,105` | `test_build_timeout_fails_the_set_with_a_timeout_reason` (TC-COMP-090) | `QueryCanceled` with `timeout` and zero rows are asserted, but on the build's own connection (IR-001). The planned elapsed-time assertion is absent (IR-009) |
| DAC-E2-S2-4 | SATISFIED | `set_context.sql`; `engine.py:68-80` | `test_set_context_resolves...`, `test_set_context_without_price_data_has_no_latest_trading_day` | The empty-active-roster `coalesce` (T013) is untested (IR-005) |
| DAC-E2-S2-5 | SATISFIED | `line_items.py` (seven items, all `REQUIRES_INPUT`, sign 1, `UNRESOLVED_CAUSE`) | `test_line_items.py`; `test_line_items_resolved.py` (strict xfail, DEC-0113) | S2's share. Per the plan's owner-directed fix E2-F09, the derived `missing` rows are CAP-002-E2-S3 T012 (a), and "momentum still classifies" is CAP-002-E2-S7 T014 |
| DAC-E2-S2-6 | SATISFIED | No `factorflow.ingestion.massive` import; all `.execute` first arguments are constants; no UPDATE or DELETE on observation or history tables | `test_engine_sql_safety.py` (four TC-COMP-160 tests plus rule self-tests); S1's `test_research_sql_is_append_only.py` | Lexical gaps in S2's own rules are covered repository-wide (IR-010) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `0006_classifications.sql` present at base; `pyproject.toml` package-data includes `classification/sql/*.sql` | — |
| T002 | complete | VERIFIED | `__init__.py` is the pinned docstring plus one LF (`xxd`: ends `2e22 2222 0a`) | — |
| T003 | complete | VERIFIED | `engine_support.py:25-98` | `count_classification_rows` counts the three child tables, not "the four tables". This is justified: the set row must survive as `failed`, and the docstring says so |
| T004 | complete | VERIFIED | `test_engine_context.py:24-30` | — |
| T005 | complete | VERIFIED | `test_engine_context.py:33-79` | Every planned assertion is present |
| T006 | complete | VERIFIED | `test_engine_transaction.py:82-114` | Implemented as planned. Test strength is IR-001 |
| T007 | complete | VERIFIED | `test_engine_transaction.py:117-175` | `ended_at` "unmodified" is not asserted (IR-009) |
| T008 | complete | VERIFIED | `test_engine_transaction.py:178-198` | "returned in well under the 1 second sleep" is not asserted (IR-009) |
| T009 | complete | VERIFIED | `test_engine_transaction.py:201-344` (cases a to f) | Several cases lack the per-test AC docstring (IR-009). Tests are weak (IR-002 to IR-005) or flaky (IR-006) |
| T010 | complete | VERIFIED | `test_engine_sql_safety.py` | Rule gaps are IR-010 (LOW) |
| T011 | complete | VERIFIED | `test_line_items.py`, `test_line_items_resolved.py` | — |
| T012 | complete | VERIFIED | `test_classification_constants.py` (parses the CHECK), `test_classification_sql_ships.py` | — |
| T013 | complete | VERIFIED | `set_context.sql` | `coalesce` to empty arrays is present but its empty case is untested (IR-005) |
| T014 | complete | VERIFIED | `complete_set.sql`, `fail_set.sql` | Byte-for-byte factor-engine 2.3 step 8 and failure-paragraph shapes |
| T015 | complete | VERIFIED | `constants.py` | — |
| T016 | complete | VERIFIED | `line_items.py` | Verbatim design 2.4 plus `UNRESOLVED_CAUSE` |
| T017 | complete | VERIFIED | `engine.py` | Steps 1 to 7 and the failure path are present. The design's traceback-to-log is missing (IR-008) |
| T018 | complete | VERIFIED | Reviewer reran every Validation Plan command; all pass. Wheel and sdist carry the three `classification/sql/*.sql` files | `test_package_data_ships_sql.py` passes unedited (10 passed) |
| T019 | complete | VERIFIED | Six mapped TCs carry `# Implements`; diff touches only planned files | Per-test AC docstrings missing on five tests (IR-009) |
| T020 | complete | VERIFIED | `CAP-002-E2-S2-tdd-evidence.yaml`; lint 0 errors | Evidence quality is IR-007 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_set_context_resolves_date_latest_trading_day_and_roster` / TC-COMP-159 | ADEQUATE | Date, `run_id`, active-only latest trading day, both rosters; a second connection's commit is invisible inside the open snapshot and visible after. Kills all six row-index mutants and both roster-filter mutants | none |
| `test_set_context_without_price_data_has_no_latest_trading_day` | ADEQUATE | `NULL` latest trading day. Kills `ctx-retired-null-when-empty` | none |
| `test_failure_after_inputs_written_leaves_zero_rows_and_a_failed_set` / TC-COMP-166 | WEAK | Rows written by the stage (proved by reaching `RuntimeError`) are gone; the reason has the class and message and no traceback; an ERROR log carries `set_id` | `drop-failure-commit` survives: the set row is read on the build's own connection (IR-001) |
| `test_completing_an_already_failed_set_updates_no_row_and_rolls_back` / TC-COMP-167 | ADEQUATE | The other writer's committed reason survives; nothing is written; `failed` is returned | `ended_at` not compared (IR-009) |
| `test_set_failed_by_another_writer_mid_build_is_left_untouched` / TC-COMP-167 (b) | ADEQUATE | The serialization-failure path ends in the same state | none |
| `test_build_timeout_fails_the_set_with_a_timeout_reason` / TC-COMP-090 | WEAK | `QueryCanceled`, `timeout`, zero rows | Same-connection read (IR-001); no elapsed-time bound (IR-009) |
| `test_success_with_no_stages_completes_the_set` | WEAK | Result and row fields | `drop-success-commit`, `qualified-counts-not-read` and `qualified-counts-other-sets` survive (IR-001, IR-003) |
| `test_inputs_are_read_from_one_snapshot` | ADEQUATE | One snapshot across stages; kills `drop-repeatable-read` | Its stage list is a palindrome, so it cannot see order (IR-004) |
| `test_no_price_data_held_fails_the_set_with_a_reason` | ADEQUATE | DEC-0114 reason; kills `drop-no-price-check` | none |
| `test_non_positive_timeout_is_refused_before_touching_the_database` | ADEQUATE | 0, -1, 0.0 refused; set stays `building` | none |
| `test_sub_millisecond_timeout_rounds_up_never_to_zero` | WEAK | `1ms` observed inside a stage | Nondeterministic (IR-006); cannot see locality (IR-002) |
| `test_timeout_is_converted_to_whole_milliseconds` | WEAK | `30s` observed inside a stage | `timeout-not-local` survives (IR-002) |
| `test_autocommit_or_open_transaction_connection_is_refused` | ADEQUATE | Both refusals before any statement | none |
| `test_failure_reason_is_one_line` | ADEQUATE | `RuntimeError: first` | none |
| Stage order | MISSING | — | `stages-reversed` survives (IR-004) |
| Missing set, empty active roster | MISSING | — | `drop-lookup-error`, `ctx-active-null-when-empty` survive (IR-005) |
| `test_engine_sql_safety.py` (four `# Implements TC-COMP-160` tests plus self-tests) / TC-COMP-160 | ADEQUATE | Import, interpolation, mutation, guard, `set_id`, `.format` and lexical rules over the package, each shown able to fail; kills `complete-unguarded` and `fail-unguarded` | Statement-boundary and qualified-name gaps, covered by S1's guard (IR-010) |
| `test_every_line_item_payload_key_is_resolved` / TC-COMP-059 | ADEQUATE | Strict xfail on `unresolved() == []` (DEC-0113) | none for S2's share |
| `test_line_items.py` | ADEQUATE | Names, statement types, labels, sentinel, signs, `unresolved()`, monkeypatched resolution, frozen. Kills all line-item mutants | none |
| `test_classification_constants.py` | ADEQUATE | Values; `INPUT_NAMES` equals the parsed `factor_input_name_matches_factor` CHECK | none |
| `test_classification_sql_ships.py` | ADEQUATE | Three files non-empty and equal to the import-time constants; both dataclasses frozen | none |

Isolation: each test gets a fresh database (`tests/conftest.py::postgres_connection_string`). Mutation (reviewer, clean bytecode): 55 mutants, 47 killed and 8 survived. No survivor is equivalent; the impact of each is stated in IR-001 to IR-005.

## Independent Validation

`<clone>` is `/tmp/claude-501/ir-e2s2/subject`, a `git clone --no-hardlinks --branch usr/alvaro-de-jodra/CAP-002-E2-S2-run-20261024T231312Z` of the component at `7c7f377`, with the same `code-revision` as the checkout before the switch (DEC-0188). `<component>` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`. The `uv run`, `uv sync` and mutation commands ran outside the sandbox as one plain call each, which the run's `uv run *`, `uv sync*` and mutation-runner rules permit.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/check-tdd-evidence.py --evidence <component>/docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2-tdd-evidence.yaml --repo-dir <component> --base 3f897a7 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings. Run before the switch |
| `uv sync --directory <clone> --all-extras --offline` | clone | 0 | PASS (required) | 43 packages, CPython 3.12.14 |
| `uv build --directory <component> --out-dir /tmp/claude-501/ir-e2s2/uv-build-dist --offline --find-links /tmp/claude-501/ir-e2s2/wheels --cache-dir /tmp/claude-501/ir-e2s2/uv-cache` (sandbox) | component root | 0 | PASS (required) | Run before the switch. Built `factorflow-0.1.0.tar.gz` and the wheel; both carry `classification/sql/{set_context,complete_set,fail_set}.sql`, and the wheel has nothing under `tests/`. The setuptools 84.2.1 backend is the repack CAP-002-E2-S1 review v2 used (sha256 `3b5c19cf...` and 348 files, both re-checked) |
| `uv run --directory <clone> --all-extras --offline pytest -p no:cacheprovider -q` | clone | 0 | PASS (required) | 1414 passed, 1 xfailed (TC-COMP-059), 233.8 s |
| `uv run --directory <clone> --all-extras --offline pytest -m postgres -p no:cacheprovider -q` | clone | 0 | PASS (required) | 409 passed |
| `uv run --directory <clone> --all-extras --offline pytest -m "not postgres" -p no:cacheprovider -q` | clone | 0 | PASS (required) | 1005 passed, 1 xfailed |
| `uv run --directory <clone> --all-extras --offline ruff check .` | clone | 0 | PASS (required) | All checks passed |
| `uv run --directory <clone> --all-extras --offline ruff format --check .` | clone | 0 | PASS (required) | 220 files already formatted |
| `uv run --directory <clone> --all-extras --offline mypy src` | clone | 0 | PASS (required) | No issues in 54 source files |
| `uv run --directory <clone> --all-extras --offline pytest tests/unit/test_package_data_ships_sql.py` | clone | 0 | PASS (required) | 10 passed, unedited (T018) |
| `mutation-run.py run --repo-dir <clone> --mutants mutants.json --jobs 2 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider <7 story test files>'` | harness root | 3 | FAIL (required) | 55 mutants (35 catalogue from `generate --range 3f897a7..HEAD --cycle review` plus 20 manual), 47 killed, 8 survived. Both baselines passed. Every kill was attributed by its log to a test that exercises the mutated code. Results sha256 `d839df75...` |
| `uv run --directory <component> --offline pytest <7 story test files> tests/unit/test_package_data_ships_sql.py -m "postgres or not postgres"` | component | 0 | PASS (diagnostic) | 66 passed, 1 xfailed. Run before the switch |
| `uv run --directory <component> --offline pytest -m "not postgres"`, `ruff check .`, `ruff format --check .`, `mypy src` | component | 0 | PASS (superseded) | Same results as in the clone. Run before the switch on the checkout's Python 3.13 `.venv` |
| `uv run --directory <component> --offline pytest -m postgres` | component | 0 | NOT COUNTED | 409 passed, but the checkout was switched at 00:46:09Z while this run was under way (it ended 00:47:03Z). Superseded by the clone row |
| `uv build --directory <component> --offline` and `... --out-dir ...` (outside the sandbox) | component | N/A | refused | `Run outside of the sandbox`; the run's policy names `uv run *` and `uv sync*`, not `uv build`. Inside the sandbox without a cache dir: `Failed to initialize cache at /Users/alvarodejodra/.cache/uv ... Operation not permitted (os error 1)`. Superseded by the required row |
| `mutation-run.py run ... --jobs 4` (bytecode enabled) | harness root | 1 | evidence | `baseline failed on worker(s) 0`. The unmutated `test_sub_millisecond_timeout_rounds_up_never_to_zero` failed with `assert [] == ['1ms']`; log line `classification build failed: QueryCanceled: canceling statement due to statement timeout` (IR-006). Earlier attempts stopped on a missing `--work-root` and, after the switch, on `mutant does not apply: ... constants.py` |
| `mutation-run.py run ... --jobs 2` (bytecode enabled) | harness root | 0 | invalid | 55 of 55 "killed", but all 20 manual mutants died in `test_line_items.py` on values from earlier mutants (`sign=2`, keys resolved). The workers reused a stale `.pyc`. Superseded by the required `python -B` row |
| `npm ci`, `npm run build`, `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run test:e2e` | — | N/A | NOT RUN | The change set touches no frontend file, and neither the story nor the plan lists them |

### Validation Side Effects

- Before: the component checkout was on the review branch at `7c7f377`, clean, `code-revision` `sha256:188a3689...` (00:43:12Z).
- During: at 00:46:09Z another process switched the checkout to `main` (fast-forwarded to `5cbe007`) and then to `usr/alvaro-de-jodra/CAP-003-design`. The reflog shows it. That checkout now holds another session's uncommitted work: `docs/architecture.md` is modified and a new `CAP-003-app-shell-and-data-health/design/` directory has appeared. This review ran no checkout or merge, and left the checkout as found.
- After: the clone is clean (no tracked changes) and its `code-revision` is unchanged. Only ignored paths were written (`.venv/`, `build/`, `src/factorflow.egg-info/`, caches). Clones, logs, results and build output were written under `/tmp/claude-501/ir-e2s2/`.
- Unexpected tracked-file changes: none caused by this review.

## Findings

| ID | Severity | Title |
|----|----------|-------|
| IR-001 | HIGH | No test shows a complete or failed set is committed |
| IR-002 | HIGH | The build timeout's transaction scope is untested |
| IR-003 | HIGH | The `qualified_counts` read is untested |
| IR-004 | HIGH | Stage execution order is untested |
| IR-005 | HIGH | The missing-set and empty-active-roster paths are untested |
| IR-006 | HIGH | `test_sub_millisecond_timeout_rounds_up_never_to_zero` is nondeterministic |
| IR-007 | MEDIUM | The TDD evidence overstates what its mutation and RED records show |
| IR-008 | MEDIUM | The build failure's traceback is discarded |
| IR-009 | MEDIUM | Planned assertions and per-test traces are missing |
| IR-010 | LOW | S2's own guard rules miss shapes the repository guard catches |

### IR-001 — No test shows a complete or failed set is committed

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-20, DAC-E2-10, DAC-E2-S2-1, DAC-E2-S2-3
- **Tasks**: T006, T008, T009 (a)
- **Files**: `src/factorflow/classification/engine.py:125` (success `conn.commit()`), `:132` (failure-path `conn.commit()`); `tests/integration/test_engine_transaction.py:47-55` (`set_row` reads on the build's connection), and every transaction test
- **Claim challenged**: TC-COMP-166 and TC-COMP-090 prove the set is recorded `failed` in a new transaction, and T009 (a) proves a complete set.
- **Observed evidence**: Manual mutants `drop-success-commit` (`engine.py:125` to `pass`) and `drop-failure-commit` (`:132` to `pass`) both survive the seven story test files. `set_row` and `count_classification_rows` use the connection `build` just used, so they see its uncommitted writes.
- **Expected evidence/behavior**: DAC-E2-10: "transition to `complete` in the same transaction as its last classification row, or to `failed` ... in a new transaction". Factor-engine 2.3 steps 8 and 9 and its failure paragraph. TEST-TDD-006: no changed-line mutant survives.
- **Impact**: A regression that stops committing passes the suite. A complete set would never become visible. A failed attempt would leave the set `building`, holding `idx_classification_set_single_building` and blocking every later build until the scheduler's start-up reclaim. That is the "half-finished set" AC-20 forbids.
- **Required remediation**: The mandatory and success-path transaction tests observe the terminal set state from a connection other than the one `build` used, or after it is closed or rolled back, so that both mutants are killed.

### IR-002 — The build timeout's transaction scope is untested

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-11, DAC-E2-S2-3
- **Tasks**: T009 (d), T017 step 2
- **Files**: `engine.py:105`; `test_engine_transaction.py:279-315`
- **Claim challenged**: The timeout is set "locally" (`set_config(..., true)`, the parameterised `SET LOCAL`).
- **Observed evidence**: Manual mutant `timeout-not-local` (`true` to `false`) survives. Both timeout tests read `SHOW statement_timeout` inside a stage, where session and local values look the same.
- **Expected evidence/behavior**: Factor-engine 2.3 step 1 and 2.6 (`SET LOCAL statement_timeout`); DEC-0067; T017 step 2; TEST-TDD-006.
- **Impact**: After a successful build, the build's timeout would persist on the scheduler's pooled connection and govern every later statement on it. With a short timeout, unrelated queries fail.
- **Required remediation**: A test shows the connection's `statement_timeout` after `build` returns (complete and failed) is what it was before, and kills the mutant.

### IR-003 — The `qualified_counts` read is untested

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-10 (complete-set contract)
- **Tasks**: T017 step 7, T009 (a)
- **Files**: `engine.py:30-32`, `:123-124`; `test_engine_transaction.py:201-221`
- **Claim challenged**: `BuildResult.qualified_counts` is read from `classification_set_factor` for the set.
- **Observed evidence**: Manual mutants `qualified-counts-not-read` (always `{}`) and `qualified-counts-other-sets` (no `set_id` filter) survive. No successful build in the suite has a `classification_set_factor` row.
- **Expected evidence/behavior**: Factor-engine 2.3 `BuildResult.qualified_counts: factor -> qualified_count`; T017 step 7; TEST-TDD-006.
- **Impact**: CAP-002-E2-S5 fills `classification_set_factor` and relies on this read; a broken or cross-set read would ship unnoticed.
- **Required remediation**: A successful build whose stage writes `classification_set_factor` rows for its set returns exactly those counts, and rows of another set do not appear. Both mutants are killed.

### IR-004 — Stage execution order is untested

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-10
- **Tasks**: T017 step 5, T009 (b)
- **Files**: `engine.py:110`; `test_engine_transaction.py:224-249`
- **Claim challenged**: `build` runs each stage in `_STAGES` in order.
- **Observed evidence**: Manual mutant `stages-reversed` (`for stage in reversed(_STAGES)`) survives. The only multi-stage test uses `[read_latest, commit_newer_bar, read_latest]`, which reads the same either way.
- **Expected evidence/behavior**: T017 step 5; design 2.2 and 2.6 order (inputs, peer sets, classification); DEC-0121; TEST-TDD-006.
- **Impact**: S3 to S5 register input, peer-set and classification stages that depend on that order; a reordering in S2's runner would be caught only by later stories.
- **Required remediation**: A test with distinguishable stages asserts they run in list order, killing the mutant.

### IR-005 — The missing-set and empty-active-roster paths are untested

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S2-4
- **Tasks**: T013, T017 step 3
- **Files**: `engine.py:71-72`; `set_context.sql:9-11`
- **Claim challenged**: `_read_context` raises `LookupError` when no set row exists. `active_ids` is an empty array, not NULL, so an empty roster fails with DEC-0114's reason.
- **Observed evidence**: Manual mutant `drop-lookup-error` (`if False:`) survives: the build fails with `TypeError: 'NoneType' object is not subscriptable` instead. Manual mutant `ctx-active-null-when-empty` (`coalesce(..., NULL::bigint[])`) survives: with no active instrument, `tuple(None)` fails the set with `TypeError: 'NoneType' object is not iterable` instead of `ValueError: no price data held for any active instrument`. No test has an unknown `set_id` or an empty active roster.
- **Expected evidence/behavior**: T017 step 3; T013 ("empty array, not NULL, via `coalesce`"); DEC-0114 ("empty roster or no prices acquired"); TEST-TDD-006.
- **Impact**: The owner-facing `failure_reason` (AC-20, UX section 1.2) would name a Python type error rather than the cause.
- **Required remediation**: Tests for an unknown `set_id` and for a store with no active instrument assert the planned reasons, killing both mutants.

### IR-006 — `test_sub_millisecond_timeout_rounds_up_never_to_zero` is nondeterministic

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-11
- **Tasks**: T009 (d)
- **Files**: `tests/integration/test_engine_transaction.py:279-296`; `engine.py:105-107`
- **Claim challenged**: The test deterministically proves a 0.0004 s timeout becomes `1ms`.
- **Observed evidence**: In the reviewer's four-worker mutation run, worker 0's unmutated baseline failed: `assert [] == ['1ms']`, with the log `classification build failed: QueryCanceled: canceling statement due to statement timeout` (`/tmp/claude-501/ir-e2s2/mutation-logs/baseline-w0.log`). The 1 ms timeout also applies to `set_context.sql`, so under load the build fails before the observing stage runs. The test does not check the build's result. Workers 1 to 3 and every serial run passed.
- **Expected evidence/behavior**: Tests are deterministic and free from time dependence unless controlled (adversarial-review E.6). Required validation (`uv run pytest -m postgres`) must be reliably green.
- **Impact**: The postgres suite fails intermittently on a loaded host or CI runner, independent of any change.
- **Required remediation**: The rounding is observed in a way the 1 ms timeout cannot pre-empt, and the test passes under the same parallel load.

### IR-007 — The TDD evidence overstates what its mutation and RED records show

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T020
- **Files**: `CAP-002-E2-S2-tdd-evidence.yaml:17-40`; `CAP-002-E2-S2-evidence/mutation-cycle-1-results.json` and `-logs/`
- **Claim challenged**: "35/35 killed", and "every new test module failed to import".
- **Observed evidence**:
  - 14 of the 35 recorded kills fail in `test_classification_constants.py::test_constant_values`, which imports only `constants` and `migrate_main` and cannot observe the mutated `engine.py` lines. These are `engine.py:75, 76, 78, 79, 84, 94` (x2), `98`, `102` (x2), `121:off-by-one`, `137:off-by-one`, `138` and `143`.
  - The cause: the runner restores a same-size mutant within the same second, so the worker's `.pyc` stays valid. The reviewer reproduced the effect, then reran with `python -B`: all 35 are killed by tests that exercise them, so the kill count holds.
  - 14 of the 53 committed logs are referenced by no result. They are an earlier run's, against a different `engine.py` (lines 73, 83, 93, 97, 101, 120 and 133).
  - `test_engine_sql_safety.py` imports nothing from `classification` and is absent from the RED log.
- **Expected evidence/behavior**: TEST-TDD-005 and TEST-TDD-006 (mutation evidence that supports the kill claim); TEST-TDD-002 (RED observed for each test-first claim).
- **Impact**: A reader of the evidence cannot trust the attribution, and the same runner behaviour hid all 8 of this review's survivors in one run.
- **Required remediation**: Regenerate the cycle's mutation evidence with a command that cannot reuse stale bytecode, commit only the logs the results reference, and state RED accurately for TC-COMP-160. The runner behaviour itself belongs to the harness (see Follow-Up).

### IR-008 — The build failure's traceback is discarded

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (AC-20 reason is unaffected)
- **Tasks**: T017
- **Files**: `engine.py:129`
- **Claim challenged**: "The exception is logged with the structured logger and `set_id`."
- **Observed evidence**: `log.error("classification build failed: %s", reason, extra={"set_id": ...})` logs only the one-line reason, with no exception information. The traceback reaches neither `failure_reason` nor the log.
- **Expected evidence/behavior**: Factor-engine design section 4, SEC-ERR-001 row: "`failure_reason` is the exception class and message on one line; the stack trace goes to the structured log only". Design 2.3 failure paragraph (SA-LOG-001, OPS-ERR-001). The repository's `RedactingFilter` already scrubs `exc_info` (`config/redaction.py:44-50`).
- **Impact**: When a later stage's SQL fails, the operator has no stack to diagnose it.
- **Required remediation**: The failure log record carries the exception's traceback through the structured logger with `set_id`, while `failure_reason` stays one line.

### IR-009 — Planned assertions and per-test traces are missing

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S2-2, DAC-E2-S2-3
- **Tasks**: T007, T008, T009, T019
- **Files**: `test_engine_transaction.py:117-145`, `:178-198`, `:269-344`
- **Claim challenged**: T007, T008, T009 and T019 are complete as written.
- **Observed evidence**:
  - T007 (a) asks that the other writer's `ended_at` stay unmodified; it is not compared.
  - T008 asks that the call return "in well under the 1 second sleep"; no elapsed time is measured.
  - T009 and T019 ask each additional test to cite its AC or DEC in its docstring. Five tests do not: `test_non_positive_timeout_is_refused_before_touching_the_database`, `test_sub_millisecond_timeout_rounds_up_never_to_zero`, `test_timeout_is_converted_to_whole_milliseconds`, `test_autocommit_or_open_transaction_connection_is_refused` and `test_failure_reason_is_one_line`.
  - Each omission is redundant with an existing assertion or with the module docstring's trace, so the tasks are counted as verified with this deviation.
- **Expected evidence/behavior**: The task plan's T007, T008, T009 and T019 wording; TEST-QUAL-002.
- **Impact**: The checked boxes claim more than the tests show, and the traceability is per module rather than per test.
- **Required remediation**: Add the two assertions and the five docstring traces.

### IR-010 — S2's own guard rules miss shapes the repository guard catches

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S2-6
- **Tasks**: T010
- **Files**: `tests/unit/test_engine_sql_safety.py:34-39`, `:108-111`
- **Claim challenged**: Every `UPDATE classification_set` found in a package file contains the guard, and no UPDATE or DELETE names a history table.
- **Observed evidence**:
  - `_UPDATE_SET` matches up to the next `;`, which in Python source is usually end of file. In a probe, an unguarded update followed later in the same `.py` file by a guarded one, or even by a comment containing `state = 'building'`, was not reported.
  - `_CLASSIFICATION_MUTATION` misses `public.factor_input`, `"factor_input"`, `ONLY` and `INSERT ... ON CONFLICT DO UPDATE`.
  - S1's `tests/unit/test_research_sql_is_append_only.py` catches all of these over the same files, so the suite is still protected.
- **Expected evidence/behavior**: T010's rules; TC-COMP-160.
- **Impact**: S2's module is weaker than its claim and duplicates weaker logic.
- **Required remediation**: Bound `_UPDATE_SET` to the statement or string, and reuse the shared qualified-name matching, or document reliance on S1's guard.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- `count_classification_rows` covers the three child tables (T003 says four). This is justified: the set row must remain as `failed`.
- Story `status` moved `planning` to `in-review`. The content revision `sha256:416b2331...` is unchanged, equal to the approval's `reviewed_revision`.
- `cycle-1.patch` (9949 lines) is the staged diff the per-cycle reviews judged. It also contains an earlier copy of itself and the mutation logs. Its 15 code files are byte-identical to HEAD, and its sha256 equals `diff_sha256`.
- No unjustified change: nothing in `pyproject.toml`, `tests/conftest.py`, a CAP-001 test or `tests/unit/test_package_data_ships_sql.py`.
- Review-environment deviation (DEC-0188): validation after the checkout switch ran in a clone of the reviewed commit, and the report was committed through a temporary worktree.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework against `CAP-002-E2-S2-tasks.md` and this report. Resolve IR-001 to IR-006 so all eight listed mutants are killed and the timeout tests are deterministic, address IR-007 to IR-010, then rerun this review. No production defect was found, so the rework is expected to be tests and evidence, plus the traceback log for IR-008.
- **Warnings accepted downstream**: N/A
- **For the driver and the owner** (outside the Coding Agent's scope):
  - The shared checkout `repos/factorflow-v2/FactorFlow-v2` is on `usr/alvaro-de-jodra/CAP-003-design`, holding that session's uncommitted work, moved there by another process at 00:46:09Z. A unit that assumes the review branch is checked out would act on the wrong branch. Moving the checkout back is a branch switch the owner must approve, and it would carry that session's changes.
  - `scripts/mutation-run.py` reuses stale bytecode across mutants in one worker. A same-size mutant restored within the same second leaves a valid `.pyc`, so later mutants are killed or survive for the wrong reason. Running the command template with `python -B` avoided it here.
