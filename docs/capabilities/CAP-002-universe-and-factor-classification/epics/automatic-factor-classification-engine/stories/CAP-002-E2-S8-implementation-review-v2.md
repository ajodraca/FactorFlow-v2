---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S8-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-25
updated: 2026-10-25
story_id: "CAP-002-E2-S8"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S8.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S8-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-25T02:51:43Z"
reviewed_head: "cb0bee2d7fdbae65806283b729fddc764a46a24b"
review_base: "3f897a7d6cc821e1d802613b260fde1d1bf570cd"
reviewed_state_revision: "sha256:de05f753581c1d0dbad6e4de055bcd607af4f4c81b86acdb7ff82b30a7151b5e"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E2-S8
    artifact_version: 1
    content_revision: sha256:ce25978bc7e3d82d5cd49f469620f867c848e7f58818b750949e732579c9747e
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-25T03:05:03Z
  source_artifacts:
    - id: CAP-002-E2-S8
      version: "1 (sha256:ce25978bc7e3d82d5cd49f469620f867c848e7f58818b750949e732579c9747e)"
    - id: CAP-002-E2-S8-tasks
      version: "1 (last_reworked_review: CAP-002-E2-S8-implementation-review-v1.md)"
    - id: CAP-002-E2-S8-tdd-evidence
      version: "cycles 1 to 3"
    - id: CAP-002-E2-S8-implementation-review
      version: "1"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
    - id: CAP-002-classification-scheduler-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "5"
    - id: DEC-0125
      version: "applied, owner upheld"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S8 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 20/20 verified |
| Required validation | 10/10 passed |

The rework resolves v1/IR-001. The production code is unchanged since v1: `git diff e4a49d9..HEAD -- src` is empty, and all six production files are byte-identical to what v1 reviewed. The only code change is the TC-COMP-080 control test (`test_scheduler_claim.py:142-179`), which now:
- compares `classification_date` with `(started_at AT TIME ZONE 'America/Chicago')::date`. `started_at` is filled by `DEFAULT now()` in the claim's own `INSERT` (`0006_classifications.sql`), so both values come from one transaction timestamp and the check is exact, with no midnight race;
- asserts equality, not v1's unconditional one-day tolerance;
- runs under three session zones (`UTC`, `Etc/GMT+4`, `Etc/GMT-14`), so a session-zone-dependent fallback such as `CURRENT_DATE` is caught.

In the reviewer's gate mutation run (51 mutants, 34 of them manual), both v1 survivors are now killed:
- `manual:r-c-default-yesterday` fails the control's `UTC` case;
- `manual:r-c-default-current-date` fails its `Etc/GMT+4` case.

Every remaining survivor is equivalent, at least at the instant of the run (see Independent Validation). These all pass:
- the full suite (1392 tests: 984 `not postgres` plus 408 `postgres`);
- ruff check, ruff format, `mypy src`;
- `uv sync --locked`, `uv build`;
- the TDD-evidence lint.

One LOW evidence-accuracy finding remains (IR-001). The cycle-3 evidence says the three zones kill a `CURRENT_DATE` fallback "whatever the hour". That is not true from 04:00 to 05:00 UTC under CDT, or from 04:00 to 06:00 UTC under CST. In that window the mutant stamps the correct date under every zone, so the gap is harmless. But a mutation run made then would report a survivor that this evidence says cannot exist.

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · **total 1**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | LOW | Cycle-3 evidence claims the `CURRENT_DATE` mutant is killed "whatever the hour". It survives every session zone for 1 h (CDT) or 2 h (CST) before Chicago midnight, and `Etc/GMT-14` adds no coverage |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S8.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S8-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S8-run-20261024T231312Z` |
| HEAD | `cb0bee2d7fdbae65806283b729fddc764a46a24b`. Three commits over the base: `e4a49d9` (story coding, `Decision-Id: DEC-0125`), `07e3f9a` (review v1), `cb0bee2` (IR-001 rework) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E2-integration` = `3f897a7d6cc821e1d802613b260fde1d1bf570cd`, resolved by `pipeline-state.py review-base --base-ref`. It is the merge base and an ancestor of HEAD (`git merge-base --is-ancestor`) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 72 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/__init__.py` | added | T014. One docstring line plus LF. The integration base has no `classification/` package, because CAP-002-E2-S2 has not landed |
| `src/factorflow/classification/settings.py` | added | T015; DAC-E2-S8-7, AC-10 |
| `src/factorflow/classification/scheduler.py` | added | T017; AC-10, AC-20, DAC-E2-4, DAC-E2-12 |
| `src/factorflow/classification/sql/qualifying_run.sql` | added | T016; DAC-E2-S8-1, DAC-E2-S8-2 |
| `src/factorflow/classification/sql/claim_set.sql` | added | T016; DAC-E2-S8-3, DAC-E2-S8-4; DEC-0125 |
| `src/factorflow/classification/sql/reclaim_interrupted.sql` | added | T016; DAC-E2-12, DAC-E2-S8-6 |
| `tests/integration/scheduler_support.py` | added | T002 |
| `tests/integration/test_scheduler_claim.py` | added | T004 to T008, T011. Modified in `cb0bee2` (T007 control, v1/IR-001) |
| `tests/integration/test_scheduler_restart.py` | added | T009, T010 |
| `tests/unit/test_classification_settings.py` | added | T003 |
| `tests/unit/test_classification_scheduler_sql.py` | added | T012 |
| `tests/unit/test_classification_scheduler_shapes.py` | added | T013 |
| `.../stories/CAP-002-E2-S8.md` | modified | `status: planning` to `in-review` (story-coding lifecycle). `artifact-gate.py revision` still equals `approval.reviewed_revision` |
| `.../stories/CAP-002-E2-S8-tasks.md` | modified | 20 checkboxes `[ ]` to `[x]`, `updated: 2026-10-25` and `last_reworked_review: CAP-002-E2-S8-implementation-review-v1.md`. No task text changed |
| `.../stories/CAP-002-E2-S8-tdd-evidence.yaml` | added | T020. Cycles 1 and 2, plus cycle 3 (the rework) |
| `.../stories/CAP-002-E2-S8-implementation-review-v1.md` | added | Review v1, committed by the driver in `07e3f9a` |
| `.../stories/CAP-002-E2-S8-evidence/**` (56 files) | added | T020: cycle patches 1 to 3, mutant and result files with their logs for cycles 1 to 3, and the RED logs for cycles 1 to 3 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `qualifying_run.sql:4` (`state IN ('succeeded', 'partial')`), `:5` (anti-join), `:6` (`ended_at ASC`); `scheduler.py:36-57` `claim_next_set` | `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed[succeeded,partial]`, `::test_qualifying_runs_are_claimed_oldest_first_once_each`, `::test_failed_set_for_run_a_does_not_block_later_run_b`; `test_classification_scheduler_sql.py::test_qualifying_run_selects_oldest_succeeded_or_partial_run_without_a_set` | This story owns the data-side claim. "Without user action" is the loop, which is CAP-002-E2-S9 |
| AC-20 | SATISFIED | `claim_set.sql` inserts only a `building` row and writes no classification rows; `reclaim_interrupted.sql:5` writes the fixed reason | `test_scheduler_restart.py::test_reclaim_fails_stale_building_sets_only` (exact reason); `test_classification_scheduler_sql.py::test_interruption_reason_is_fixed_and_avoids_relabelled_interface_terms` | Build side only, as the story scopes it |
| DAC-E2-4 | SATISFIED | `0006_classifications.sql` `run_id ... UNIQUE` (from S1); anti-join at `qualifying_run.sql:5`; `scheduler.py:56-57` turns a `run_id` race into `None` | `::test_qualifying_runs_are_claimed_oldest_first_once_each` (three sets, one per run; a fourth claim returns `None`); `::test_failed_set_for_run_a_does_not_block_later_run_b`; `::test_claim_returns_none_when_the_run_acquired_a_set_between_statements` | `failed`, `cancelled` and `abandoned` runs never qualify (seeded in T004) |
| DAC-E2-12 | SATISFIED | `reclaim_interrupted.sql` (`WHERE state = 'building'`, `failed`, `ended_at = now()`, fixed reason); `scheduler.py:60-71` (one transaction; one `WARNING` per set, after commit) | `test_scheduler_restart.py` (all three tests) | "At the next scheduler start, before any new claim" is the loop's ordering, which is CAP-002-E2-S9 (TC-COMP-169). This story delivers the reclaim the loop calls |
| DAC-E2-S8-1 | SATISFIED | `qualifying_run.sql:4` | `::test_only_succeeded_and_partial_runs_are_claimed` seeds `failed`, `cancelled`, `abandoned`, `requested` and `running`, asserts `None` and an empty table, then claims the qualifying run | All of these reviewer mutants are killed: adding `requested`, `cancelled`, `abandoned`, `running` or `cancelling`; dropping `succeeded`; a five-state blacklist |
| DAC-E2-S8-2 | SATISFIED | `qualifying_run.sql:5-7` | `::test_qualifying_runs_are_claimed_oldest_first_once_each`: insertion order second, third, first, with mixed states | The `ORDER BY r.requested_at`, `ended_at DESC`, `LIMIT 2` and dropped-anti-join mutants are killed |
| DAC-E2-S8-3 | SATISFIED | `idx_classification_set_single_building` (S1) plus `scheduler.py:56-57` | `::test_claim_beside_a_building_set_returns_none_and_inserts_nothing` | Does not raise; A's single row stays `building`; B has no set |
| DAC-E2-S8-4 | SATISFIED | `claim_set.sql:4` `(COALESCE(%(at)s::timestamptz, CURRENT_TIMESTAMP) AT TIME ZONE 'America/Chicago')::date` (DEC-0125, owner upheld) | `::test_claim_stamps_the_chicago_date` (23:30 Chicago on 15 October and 15 December); `::test_claim_without_at_stamps_the_database_clock_chicago_date[UTC, Etc/GMT+4, Etc/GMT-14]` (production `at=None` branch, exact) | Killed: New York, Denver, dropped `AT TIME ZONE`, `at=None` and dropped-fallback mutants. Also killed: the fallback set to yesterday, tomorrow, `CURRENT_DATE` or the UTC date (see IR-001 for the `CURRENT_DATE` window) |
| DAC-E2-S8-5 | SATISFIED | `qualifying_run.sql:5` (any set, `failed` included, excludes its run) | `::test_failed_set_for_run_a_does_not_block_later_run_b` | A's `failed` row is unchanged; B gets `building`; the next claim returns `None`. The mutant that lets a failed set's run requalify is killed |
| DAC-E2-S8-6 | SATISFIED | `reclaim_interrupted.sql` | `::test_reclaim_fails_stale_building_sets_only` checks four things: a full-row `t::text` compare of the `complete` and `failed` rows; the exact reason; `ended_at` not earlier than a `clock_timestamp()` read taken before the reclaim; and that D is then claimable. Also `::test_reclaim_with_nothing_building_returns_empty_and_changes_nothing` | The `WHERE state IN ('building','failed')`, `ended_at = now() - 1 day` and short-reason mutants are killed |
| DAC-E2-S8-7 | SATISFIED | `settings.py:14-15` (`ge=1`), `:17-28` (strict invariant; the message holds only the variable names) | `test_classification_settings.py` (9 tests) | `0.5`, `45`/`30`, `60`/`60`, timeout `0.5` and `abc` all fail naming the variable and not the value |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Base tree: `0006_classifications.sql` defines `run_id UNIQUE` and `idx_classification_set_single_building`; `classification/__init__.py` is absent at `3f897a7` | Prerequisite S1 is on the integration base |
| T002 | complete | VERIFIED | `scheduler_support.py`: `migrate_all` asserts version 6; `open_pool`; `add_run` follows the run-state rules; `add_set` follows the terminal shapes; `set_rows` orders by `started_at, set_id`; every writer commits | Does not import `engine_support.py`. `add_set`'s `failure_reason` keyword is additive |
| T003 | complete | VERIFIED | `test_classification_settings.py:26-103` | The valid pair is `2.5`/`10` and there is an extra `1`/`1.5` boundary case (justified in v1) |
| T004 | complete | VERIFIED | `test_scheduler_claim.py:54-72` | Parametrized over `succeeded` and `partial`; each case gets a fresh database |
| T005 | complete | VERIFIED | `test_scheduler_claim.py:75-93`; `_complete` at `:42-51` | The only `UPDATE` carries `AND state = 'building'` |
| T006 | complete | VERIFIED | `test_scheduler_claim.py:96-109` | |
| T007 | complete | VERIFIED | `test_scheduler_claim.py:112-139` (summer and winter `at` cases); `:142-179` (control) | v1 had this task PARTIAL. The control now asserts equality against the claim transaction's own clock (`started_at`), under three session zones. The plan's "`now()`, read in the same test" became the set's own `started_at`, as v1's remediation proposed. That is justified: it removes the midnight race and keeps "equals" |
| T008 | complete | VERIFIED | `test_scheduler_claim.py:182-199` | |
| T009 | complete | VERIFIED | `test_scheduler_restart.py:56-94` | |
| T010 | complete | VERIFIED | `test_scheduler_restart.py:97-125`; `test_classification_scheduler_sql.py:62-70` | The relabelled-terms check reads the shipped literal (justified in v1) |
| T011 | complete | VERIFIED | `test_scheduler_claim.py:202-219` | Patches `scheduler._QUALIFYING_RUN_SQL`; asserts `None`, no new row, and a usable pool afterwards |
| T012 | complete | VERIFIED | `test_classification_scheduler_sql.py:25-59` | Items (a) to (e) are present |
| T013 | complete | VERIFIED | `test_classification_scheduler_shapes.py` | |
| T014 | complete | VERIFIED | `classification/__init__.py` | Created because T001 found it absent |
| T015 | complete | VERIFIED | `settings.py` | Imports `_EnvNamedSettings`; `config/settings.py` is untouched; the model is not added to `Settings` |
| T016 | complete | VERIFIED | The three SQL files | Design 2.4 verbatim, plus the DEC-0125 change; no `BEGIN`/`COMMIT`; `pyproject.toml` untouched (the S1 glob ships them, as the built wheel shows) |
| T017 | complete | VERIFIED | `scheduler.py:16-71` | `try` wraps the `with`; `Final` constants are read at import; `logging.getLogger(__name__)`. The unreachable `RuntimeError` at `:53-54` is a mypy narrowing (justified in v1) |
| T018 | complete | VERIFIED | The reviewer reran every Validation Plan command (see Independent Validation) | `test_research_sql_is_append_only.py` passes unedited. `test_engine_sql_safety.py` still does not exist on the base (S2 has not landed), which the plan allows |
| T019 | complete | VERIFIED | `git diff --stat 3f897a7..HEAD -- src tests pyproject.toml uv.lock` | 12 plan-named code and test files only. No `pyproject.toml`, `uv.lock`, `app.py`, `config/settings.py` or delivered test file |
| T020 | complete | VERIFIED | `CAP-002-E2-S8-tdd-evidence.yaml` cycles 1 to 3 | Cycle 3 is `APPROVED` with `drift_detected: false` and `tests_executed: true`. Its `diff_sha256` `b6fe5031…7ee4` equals the SHA-256 of `cycle-3.patch`. With `index` lines stripped, that patch equals `git diff e4a49d9..HEAD -- tests/integration/test_scheduler_claim.py`. Applying cycles 1 to 3 in order to an archive of `3f897a7` reproduces all 12 code and test files at HEAD byte for byte. The RED log, results and log hashes match. The lint is clean. IR-001 concerns one sentence of cycle-3's description |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_only_succeeded_and_partial_runs_are_claimed` / TC-COMP-077 | ADEQUATE | Real pool over a migrated database. All five non-qualifying states are seeded first, so a weakened filter would claim one. Asserts `None` and an empty table, then the exact `(set_id, run_id, 'building')` row | none |
| `test_qualifying_runs_are_claimed_oldest_first_once_each` / TC-COMP-078 | ADEQUATE | Out-of-order insertion with mixed states; exact order; a fourth claim returns `None`; one set per run | none |
| `test_claim_beside_a_building_set_returns_none_and_inserts_nothing` / TC-COMP-079 | ADEQUATE | Exercises the partial-index `UniqueViolation` path; asserts the exact rows | none |
| `test_claim_stamps_the_chicago_date[summer, winter]` / TC-COMP-080 | ADEQUATE | 23:30 CDT and 23:30 CST through `at`; the persisted date is read back | none |
| `test_claim_without_at_stamps_the_database_clock_chicago_date[UTC, Etc/GMT+4, Etc/GMT-14]` / TC-COMP-080 (T007 control) | ADEQUATE | The production `at=None` branch, compared exactly with the Chicago date of the claim transaction's `now()`. Session zones take effect: the coder's log and this review's logs show the `CURRENT_DATE` mutant passing `UTC` and failing `Etc/GMT+4`. The oracle is exact, so any fallback whose stamp differs at run time fails | Its kill power for sub-day shifts depends on the hour, which no test can avoid without setting the database clock (DEC-0125). `Etc/GMT-14` is redundant (IR-001) |
| `test_failed_set_for_run_a_does_not_block_later_run_b` / TC-COMP-081 | ADEQUATE | A's failed row is compared on `(set_id, run_id, state, reason)`; B gets `building`; the next claim returns `None` | none |
| `test_classification_settings.py` (3 tagged plus 6 extra) / TC-COMP-082 | ADEQUATE | `ConfigurationError` messages are checked for the variable names and for the absence of each value; boundaries at 1 and at equality | none (`manual:r-s-timeout-gt` is equivalent; see below) |
| `test_reclaim_fails_stale_building_sets_only` / TC-COMP-168 | ADEQUATE | Full-row text compare of the untouched rows; exact reason; `ended_at` lower bound; the next run is claimable | none |
| `test_reclaim_with_nothing_building_...`, `test_reclaim_reports_and_logs_...` (T010) | ADEQUATE | Return value equals `[ReclaimedSet(stale, run_a)]`; one `WARNING` naming the set; idempotent | none |
| `test_claim_returns_none_when_the_run_acquired_a_set_between_statements` (T011) | ADEQUATE | Forces the `run_id` `UniqueViolation`; asserts `None`, no row, and a usable pool | none |
| `test_claim_does_not_swallow_other_database_errors` (unplanned) | ADEQUATE | A `ForeignKeyViolation` must propagate. Kills the `except ForeignKeyViolation` and `except IntegrityError` widenings | none |
| `test_classification_scheduler_sql.py` (T012) | ADEQUATE | Regexes pin the state list, anti-join, order and limit; the single `building` insert and `America/Chicago`; the reclaim guard; no `DELETE`; no append-only `UPDATE`; no `asyncio`; the reason literal | none |
| `test_classification_scheduler_shapes.py` (T013) | ADEQUATE | `dataclasses` params, fields and type hints; `inspect.signature` kinds and defaults | none |

Isolation and determinism:
- Every database test gets a fresh database (`tests/conftest.py:79-113`).
- Every order-relevant `ended_at` is explicit.
- Settings tests clear both variables and pass `_env_file=None`.
- The control now compares two values written by one transaction, so its pass or fail on correct code is deterministic at any hour.
- It opens its own pool, with the session zone in libpq `options`, and closes the pool and its connection in `finally`.

No test mocks the unit under test. T011 and the unplanned error test replace only the query text.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | Supporting |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required`; supporting |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-E2-integration` | harness root | 0 | PASS | `3f897a7…`; `merge-base --is-ancestor` holds; supporting |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 3f897a7d6cc821e1d802613b260fde1d1bf570cd --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | `0 error(s), 0 warning(s)` |
| `uv run --directory <component> --offline pytest <3 story unit files> -v -p no:cacheprovider` | component | 0 | PASS | 19 passed; supporting (narrowest first) |
| `uv run --directory <component> --offline pytest -m postgres tests/integration/test_scheduler_claim.py tests/integration/test_scheduler_restart.py -v -p no:cacheprovider` | component | 0 | PASS | 15 passed, including the three control zones; supporting |
| `uv run --directory <component> --offline pytest -m 'not postgres' -q -p no:cacheprovider` | component | 0 | PASS (required) | 984 passed, 408 deselected |
| `uv run --directory <component> --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS (required) | 408 passed, 984 deselected (v1 had 406; the control gained two zones) |
| `uv run --directory <component> --offline pytest -q -p no:cacheprovider` | component | 0 | PASS (required) | 1392 passed |
| `uv run --directory <component> --offline ruff check .` | component | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --offline ruff format --check .` | component | 0 | PASS (required) | 217 files already formatted |
| `uv run --directory <component> --offline mypy src` | component | 0 | PASS (required) | No issues in 53 source files |
| `uv sync --directory <component> --all-extras --offline --locked` | component | 0 | PASS (required) | Resolved 46, checked 43; `--locked` leaves `uv.lock` untouched |
| `uv build --directory <component> --offline --out-dir <scratch>/dist` (one plain call, outside the sandbox) | component | N/A | refused | `Run outside of the sandbox`: the run's policy names `uv run *` and `uv sync*`, not `uv build`. Superseded below |
| `uv build --directory <component> --out-dir <build>/dist --offline --find-links <build>/wheels --cache-dir <build>/cache` (sandbox) | component | 0 | PASS (required) | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl`. Both carry `classification/__init__.py`, `scheduler.py`, `settings.py` and the three `classification/sql/*.sql`; the wheel has nothing under `tests/`. `<build>/wheels` holds setuptools 84.2.1, repacked by this review from the local uv cache (`~/.cache/uv/archive-v0/2YEXGW7dY86Rro9h`): 348 files equal 348 RECORD entries, sha256 `3b5c19cf…37e0`, the same method as v1 |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 3f897a7d6cc821e1d802613b260fde1d1bf570cd..HEAD --cycle review --out <mut>/mutants.json`, plus 34 reviewer `manual` mutants | harness root | 0 | PASS | 17 catalogue mutants over every changed production file. The manual set is v1's 21 plus 13 new. Final mutants file sha256 `282b4137…61d8b` |
| `python3 /Users/alvarodejodra/Projects/ai-agents/scripts/mutation-run.py run --repo-dir <component> --mutants <mut>/mutants.json --jobs 4 --command 'PYTHONPATH=src <component>/.venv/bin/python -m pytest tests/unit/test_classification_settings.py tests/unit/test_classification_scheduler_sql.py tests/unit/test_classification_scheduler_shapes.py tests/unit/test_research_sql_is_append_only.py tests/integration/test_scheduler_claim.py tests/integration/test_scheduler_restart.py -q -x -p no:cacheprovider' --out <mut>/results.json --logs <mut>/logs --work-root <mut>/work` | harness root | 3 | PASS (required) | 51 mutants: 43 killed, 8 survived, all 8 equivalent (below). The runner exits 3 whenever anything survives. Four baselines green (59 passed). Ran 03:03:36Z to 03:04:07Z (22:03 CDT); results sha256 `566b44d3…8875` |
| `git diff e4a49d9..HEAD -- tests/integration/test_scheduler_claim.py` vs `cycle-3.patch` (`index` lines stripped); cycles 1 to 3 applied to `git archive 3f897a7` | component | 0 | PASS | Exact match; all 12 code and test files reproduced; supporting |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | `sha256:ce25978b…747e`, equal to `approval.reviewed_revision` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `sha256:de05f753…1b5e` before and after validation |

Paths used above:
- `<component>` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`.
- `<scratch>` is `/tmp/claude-501/s8v2.JdZ3`, `<build>` is `/tmp/claude-501/s8v2-build`, and `<mut>` is `/tmp/claude-501/s8v2-mut`.
- Every `uv run`, `uv sync` and `mutation-run.py run` call ran outside the sandbox as one plain call, as the run's rules permit.

Ten commands are counted as required: the TDD lint, `uv sync`, `uv build`, the three pytest runs, ruff, ruff format, mypy, and the gate mutation run.

Mutation survivors (8), all equivalent:
- Five catalogue mutants change a digit inside a `-- ` header comment, which PostgreSQL discards:
  - `claim_set.sql:1:off-by-one:1`
  - `claim_set.sql:1:off-by-one:2`
  - `qualifying_run.sql:1:off-by-one:1`
  - `qualifying_run.sql:1:off-by-one:2`
  - `reclaim_interrupted.sql:1:off-by-one:1`
- `qualifying_run.sql:5:off-by-one:1` changes `SELECT 1` to `SELECT 2` inside `NOT EXISTS`, whose select list is never read.
- `manual:r-s-timeout-gt` changes `ge=1` to `gt=1` on the timeout. The accepted set is unchanged, because `timeout > poll >= 1`. `TIMEOUT=1` is refused either way, naming the variable and never the value (DAC-E2-S8-7). This matches v1's disposition.
- `manual:v2-c-default-minus-hour` changes the fallback to `CURRENT_TIMESTAMP - interval '1 hour'`. It is equivalent at the instant of the run.
  - At 22:03 CDT, the stamped date is the same with or without the shift, so no assertion could tell them apart.
  - The control's exact oracle fails it in the only hour it differs, 00:00 to 01:00 Chicago.
  - A shift of under a day can be caught at any hour only by setting the database clock. DEC-0125 records that this cannot be done for `CURRENT_TIMESTAMP`, and the `at` hook it adds bypasses the fallback.
  - This is the standard v1's remediation set: killed whenever the stamp differs.

The new reviewer mutants that were killed:
- `claim_set.sql`: fallback set to tomorrow; fallback set to the UTC date (it fails the `UTC` case now, at 03:03 UTC, while the two dates differ); zone set to `America/Denver`; dropped `AT TIME ZONE`; dropped fallback; state `'complete'`.
- `scheduler.py`: `except IntegrityError`.
- `reclaim_interrupted.sql`: `ended_at` one day early; a short reason.
- `qualifying_run.sql`: `ended_at DESC`; dropped anti-join.
- `settings.py`: poll `ge=0`.

All of v1's other manual mutants were killed again.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E2-S8-run-20261024T231312Z`, HEAD `cb0bee2`, no staged, unstaged or untracked non-ignored files, code-revision `sha256:de05f753…1b5e`.
- After: identical branch, HEAD, porcelain status and code-revision. The branch was checked again after validation, since DEC-0188 records a concurrent branch switch on this checkout earlier in the run.
- Unexpected tracked-file changes: none.
- Ignored-path effects only:
  - `.pytest_cache/`, `.mypy_cache/`, `.ruff_cache/`, `__pycache__/` and `src/factorflow.egg-info/` were refreshed.
  - setuptools used `build/`.
  - Build output went to `<build>/dist`.
  - Mutation clones, logs and results stayed under `<mut>`.

## Findings

### IR-001 — Cycle-3 evidence overstates the `CURRENT_DATE` kill as independent of the hour

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S8-4 (evidence only)
- **Tasks**: T020 (T007)
- **Files**: `CAP-002-E2-S8-tdd-evidence.yaml`, cycle-3 `description`; `tests/integration/test_scheduler_claim.py:143-145`
- **Claim challenged**: Cycle 3 says the control "runs under three session time zones (UTC, Etc/GMT+4, Etc/GMT-14) so a CURRENT_DATE fallback is killed whatever the hour".
- **Observed evidence**:
  - A `CURRENT_DATE` fallback stamps the Chicago date of the session zone's last midnight. The control fails it only when a Chicago midnight falls between that session midnight and now.
  - A minute-by-minute simulation with `zoneinfo` shows the mutant passes all three zones from 04:00 to 05:00 UTC on 2026-10-24 (CDT) and from 04:00 to 06:00 UTC on 2026-12-15 (CST). Scripts: `/tmp/claude-501/s8v2-sim/window.py`, `perzone.py`.
  - Inside that window, the mutant stamps the correct date under all 598 IANA zones (`allzones.py`, at 04:30 UTC). It is therefore harmless there, and no choice of zones could close the window.
  - `Etc/GMT-14` adds no hour of coverage beyond `UTC` and `Etc/GMT+4`: 1380 of 1440 minutes covered either way (CDT), 1320 (CST).
  - The test's own comment is accurate ("a part of the day that moves with the zone"); only the evidence sentence overreaches.
- **Expected evidence/behavior**: TDD evidence states what the tests prove (TEST-TDD-005 and TEST-TDD-006, mutation evidence validated at review). A mutation run between 23:00 and 24:00 CDT (22:00 to 24:00 CST) would report `manual:r-c-default-current-date` surviving. The evidence says no such survivor can exist.
- **Impact**: None on production behaviour or on any acceptance criterion. A later reviewer or doc-sync pass that relies on the sentence could misread a survivor in that window as a regression.
- **Required remediation**:
  - No code change is required.
  - When this story's evidence is next touched, or at doc sync, record the window: the `CURRENT_DATE` mutant is killed whenever its stamp differs from the correct date, which is every hour except the last one (CDT) or two (CST) before Chicago midnight, when it is correct under every zone.
  - Optionally drop the redundant `Etc/GMT-14` case.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | The control asserts `stamped == expected`, where `expected` is `(started_at AT TIME ZONE 'America/Chicago')::date`, the claim transaction's own `now()` (`test_scheduler_claim.py:166`, `:179`). Cycle-3 RED log `red-cycle-3-default-yesterday.log` shows 3 failures under `manual:r-c-default-yesterday`. In this review's mutation run, `r-c-default-yesterday` fails the `UTC` case and `r-c-default-current-date` fails the `Etc/GMT+4` case (logs `manual_r-c-default-yesterday.log` and `manual_r-c-default-current-date.log`, `1 failed` each). The `CURRENT_DATE` mutant is killed whenever its stamp differs from the correct date, as v1 required (window caveat: IR-001) |

## Scope and Plan Deviations

- **T007, justified (new in v2)**:
  - The control's oracle is the set's `started_at` rather than a separate `now()` read. This keeps the plan's "equals" and removes the race.
  - The session-zone parametrization goes beyond the plan, and is what kills a `CURRENT_DATE` regression.
  - The test builds its own pool, because it needs per-zone libpq `options`.
- **Carried from v1, still justified**:
  - T003's `2.5`/`10` valid pair and the `1`/`1.5` boundary case.
  - T010's relabelled-terms check on the shipped literal.
  - The unplanned error-propagation test.
  - The unreachable mypy-narrowing `RuntimeError` in `scheduler.py:53-54`.
- **Decisions**:
  - DEC-0125 is `applied` and owner `upheld`, and `e4a49d9` carries `Decision-Id: DEC-0125`.
  - The rework commit `cb0bee2` carries no trailer. That is correct: it changes only the `at`-omitted control, which tests the design's own `CURRENT_TIMESTAMP` path and would stand unchanged if DEC-0125 were reverted.
  - This review recorded no new decision.
- **Bookkeeping**:
  - The story is `in-review` with an unchanged approval revision.
  - The task file gains `last_reworked_review` and `updated`, and all 20 boxes are checked. All 20 tasks are VERIFIED.
- **Sibling state**:
  - CAP-002-E2-S2 has still not landed on `usr/alvaro-de-jodra/CAP-002-E2-integration` (`3f897a7`), so `tests/unit/test_engine_sql_safety.py` does not exist. T018 makes that guard conditional.
  - S8 created the shared package marker with the byte content both plans pin.
- **No out-of-scope files**.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**:
  - Commit this report on `usr/alvaro-de-jodra/CAP-002-E2-S8-run-20261024T231312Z` (the supervised driver or the owner) and push the branch. Adversarial review for this story stays at v1's CHANGES-REQUIRED until this report is committed.
  - Then run `$doc-sync` for CAP-002-E2-S8 (component `FactorFlow-v2`).
  - At doc sync, record IR-001's window wherever the scheduler's verified test behaviour is described.
- **Warnings accepted downstream**: IR-001
