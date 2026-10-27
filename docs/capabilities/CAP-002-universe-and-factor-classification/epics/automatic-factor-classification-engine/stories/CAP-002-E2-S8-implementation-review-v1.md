---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S8-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-24
updated: 2026-10-24
story_id: "CAP-002-E2-S8"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S8.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S8-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-25T02:23:08Z"
reviewed_head: "e4a49d96c2d906a5301e55764b36a30a28cf049b"
review_base: "3f897a7d6cc821e1d802613b260fde1d1bf570cd"
reviewed_state_revision: "sha256:42457828c37dda0f09d413355649d5346e1bc5c872d0c97de73ed9755c65ac82"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-10-25T02:38:28Z
  source_artifacts:
    - id: CAP-002-E2-S8
      version: "1 (sha256:ce25978bc7e3d82d5cd49f469620f867c848e7f58818b750949e732579c9747e)"
    - id: CAP-002-E2-S8-tasks
      version: "1"
    - id: CAP-002-E2-S8-tdd-evidence
      version: "cycles 1 and 2"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-classification-scheduler-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "5"
    - id: DEC-0125
      version: "applied, owner upheld 2026-10-18"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S8 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 19/20 verified |
| Required validation | 9/10 passed |

The production code is correct and matches the design.
- `settings.py` is design section 2.3 plus the strict `poll < timeout` invariant, which names the two variables and never their values.
- The three SQL files are design section 2.4 verbatim, except for the owner-upheld DEC-0125 `COALESCE(%(at)s::timestamptz, CURRENT_TIMESTAMP)` hook.
- `scheduler.py` runs the claim as one transaction. It turns only `UniqueViolation` into `None`, after the connection has rolled back.
- The reviewed cycle patches reproduce every code and test file at HEAD byte for byte.
- The full suite (1390), ruff, ruff format, `mypy src`, `uv sync --locked`, `uv build` and the TDD-evidence lint all pass.

One test-strength defect blocks the gate (IR-001). The loop in CAP-002-E2-S9 calls `claim_next_set(pool)` with no `at`. Only the T007 control test exercises that production branch, and its assertion accepts a stamp one day behind the expected Chicago date unconditionally. Two non-equivalent mutants of `claim_set.sql` survive every focused suite because of it:
- the fallback becomes `CURRENT_TIMESTAMP - interval '1 day'`;
- the fallback becomes `CURRENT_DATE`.

Skill step E.9 makes the control test `WEAK`. That makes T007 `PARTIAL`, and the gate mutation run fails.

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0 · **total 1**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | HIGH | The TC-COMP-080 control (`at` omitted) accepts `expected - 1 day` unconditionally; two non-equivalent mutants of the production fallback in `claim_set.sql` survive |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S8.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S8-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S8-run-20261024T231312Z` |
| HEAD | `e4a49d96c2d906a5301e55764b36a30a28cf049b` (one commit over the base, carrying `Decision-Id: DEC-0125`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E2-integration` = `3f897a7d6cc821e1d802613b260fde1d1bf570cd`, from `pipeline-state.py review-base --base-ref`; it is an ancestor of HEAD |
| Working tree | Clean: no staged, unstaged or untracked non-ignored files, before and after validation |
| Changed files reviewed | 61 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/__init__.py` | added | T014. One docstring line plus LF (`xxd` checked). The integration base had no `classification/` package, because CAP-002-E2-S2 has not landed |
| `src/factorflow/classification/settings.py` | added | T015; DAC-E2-S8-7, AC-10 |
| `src/factorflow/classification/scheduler.py` | added | T017; AC-10, AC-20, DAC-E2-4, DAC-E2-12 |
| `src/factorflow/classification/sql/qualifying_run.sql` | added | T016; DAC-E2-S8-1, DAC-E2-S8-2 |
| `src/factorflow/classification/sql/claim_set.sql` | added | T016; DAC-E2-S8-3, DAC-E2-S8-4; DEC-0125 |
| `src/factorflow/classification/sql/reclaim_interrupted.sql` | added | T016; DAC-E2-12, DAC-E2-S8-6 |
| `tests/integration/scheduler_support.py` | added | T002 |
| `tests/integration/test_scheduler_claim.py` | added | T004 to T008, T011 |
| `tests/integration/test_scheduler_restart.py` | added | T009, T010 |
| `tests/unit/test_classification_settings.py` | added | T003 |
| `tests/unit/test_classification_scheduler_sql.py` | added | T012 |
| `tests/unit/test_classification_scheduler_shapes.py` | added | T013 |
| `.../stories/CAP-002-E2-S8.md` | modified | `status: planning` → `in-review` (story-coding lifecycle). `artifact-gate.py revision` still equals `approval.reviewed_revision` |
| `.../stories/CAP-002-E2-S8-tasks.md` | modified | 20 checkbox lines `[ ]` → `[x]`, and nothing else (T001 to T020) |
| `.../stories/CAP-002-E2-S8-tdd-evidence.yaml` | added | T020 |
| `.../stories/CAP-002-E2-S8-evidence/**` (46 files) | added | T020. Contents: `cycle-1.patch`, `cycle-2.patch`, `mutants-cycle-{1,2}.json`, `mutation-cycle-{1,2}-results.json` and their logs, and `red-cycle-{1,2}-*.log` |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `qualifying_run.sql:4` (`state IN ('succeeded', 'partial')`), `:5` (anti-join), `:6` (`ended_at ASC`); `scheduler.py:44-57` `claim_next_set` | `test_scheduler_claim.py::test_only_succeeded_and_partial_runs_are_claimed[succeeded/partial]`, `::test_qualifying_runs_are_claimed_oldest_first_once_each`, `::test_failed_set_for_run_a_does_not_block_later_run_b`; `test_classification_scheduler_sql.py::test_qualifying_run_selects_oldest_succeeded_or_partial_run_without_a_set` | This story owns the data-side claim. "Without user action" is the loop, which is CAP-002-E2-S9 |
| AC-20 | SATISFIED | `claim_set.sql` inserts only a `building` row and writes no classification rows; `reclaim_interrupted.sql:5` writes the fixed reason | `test_scheduler_restart.py::test_reclaim_fails_stale_building_sets_only` (exact reason), `test_classification_scheduler_sql.py::test_interruption_reason_is_fixed_and_avoids_relabelled_interface_terms` | Build side only, as the story scopes it |
| DAC-E2-4 | SATISFIED | `0006_classifications.sql:3` (`run_id ... UNIQUE`, from S1); anti-join at `qualifying_run.sql:5`; `scheduler.py:56-57` handles a `run_id` race as `None` | `::test_qualifying_runs_are_claimed_oldest_first_once_each` (three sets, one per run, and a fourth claim returns `None`); `::test_failed_set_for_run_a_does_not_block_later_run_b`; `::test_claim_returns_none_when_the_run_acquired_a_set_between_statements` | `failed`, `cancelled` and `abandoned` runs never qualify (T004 seeds each) |
| DAC-E2-12 | SATISFIED | `reclaim_interrupted.sql` (`WHERE state = 'building'`, `failed`, `ended_at = now()`, the fixed reason); `scheduler.py:60-71` (one transaction, `WARNING` per set after commit) | `test_scheduler_restart.py` (all three tests) | "At the next scheduler start, before any new claim" is the loop's ordering, which is CAP-002-E2-S9 (TC-COMP-169). This story delivers the reclaim it calls |
| DAC-E2-S8-1 | SATISFIED | `qualifying_run.sql:4` | `::test_only_succeeded_and_partial_runs_are_claimed` seeds `failed`, `cancelled`, `abandoned`, `requested` and `running`; the claim returns `None` and inserts nothing, then claims the `succeeded`/`partial` run | Reviewer mutants that add `requested`, `cancelled`, `abandoned`, `running` or `cancelling`, drop `succeeded`, or rewrite the list as a blacklist of the five named states are all killed |
| DAC-E2-S8-2 | SATISFIED | `qualifying_run.sql:5-7` | `::test_qualifying_runs_are_claimed_oldest_first_once_each`: insertion order second, third, first, with mixed states | The reviewer's `ORDER BY r.requested_at` mutant is killed |
| DAC-E2-S8-3 | SATISFIED | `idx_classification_set_single_building` (S1) plus `scheduler.py:56-57` | `::test_claim_beside_a_building_set_returns_none_and_inserts_nothing` | Does not raise; one row (A's) stays `building`; B has no set |
| DAC-E2-S8-4 | SATISFIED | `claim_set.sql:4` `(COALESCE(%(at)s::timestamptz, CURRENT_TIMESTAMP) AT TIME ZONE 'America/Chicago')::date` (DEC-0125, owner upheld) | `::test_claim_stamps_the_chicago_date` (23:30 Chicago on 15 October and 15 December) | The code is correct, and the `at` cases prove the shared expression. The reviewer's New York and `at=None` mutants are killed, and so were the coder's UTC and drop-COALESCE mutants (`mutation-cycle-2-results.json`). The control that covers the production `at=None` branch is WEAK; see IR-001 |
| DAC-E2-S8-5 | SATISFIED | `qualifying_run.sql:5` (any set, `failed` included, excludes its run) | `::test_failed_set_for_run_a_does_not_block_later_run_b` | A's `failed` row is unchanged; B gets `building`; the next claim returns `None`. The reviewer mutant that lets a failed set's run requalify is killed |
| DAC-E2-S8-6 | SATISFIED | `reclaim_interrupted.sql` | `::test_reclaim_fails_stale_building_sets_only` (full-row `t::text` compare of the `complete` and `failed` rows, exact reason, `ended_at >= clock_timestamp()` read before, then D claimable); `::test_reclaim_with_nothing_building_returns_empty_and_changes_nothing` | The reviewer's `WHERE state IN ('building','failed')` mutant is killed |
| DAC-E2-S8-7 | SATISFIED | `settings.py:14-15` (`ge=1`), `:17-27` (strict invariant; the message holds only the variable names); `_EnvNamedSettings` builds messages with `include_input=False` | `test_classification_settings.py` (9 tests) | `0.5`, `45`/`30`, `60`/`60`, timeout `0.5` and `abc` all fail naming the variable and not the value |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Base tree: `0006_classifications.sql` defines `run_id UNIQUE` and `idx_classification_set_single_building`; `classification/__init__.py` is absent | Prerequisite S1 is on the integration base |
| T002 | complete | VERIFIED | `scheduler_support.py`: `migrate_all` asserts version 6; `open_pool`; `add_run` follows the state rules; `add_set` follows the terminal shapes; `set_rows` orders by `started_at, set_id`; every writer commits | Does not import `engine_support.py`. `add_set` gains a `failure_reason` keyword (additive) |
| T003 | complete | VERIFIED | `test_classification_settings.py:26-103` | Valid pair uses `2.5`/`10`, not `2`/`10`, so a float-to-int mutant dies (cycle-1 rework). The `1`/`1.5` lower-bound case is extra |
| T004 | complete | VERIFIED | `test_scheduler_claim.py:54-72` | Parametrized over `succeeded` and `partial`; each case gets a fresh database (`tests/conftest.py:79-113`) |
| T005 | complete | VERIFIED | `test_scheduler_claim.py:75-93`, `_complete` at `:42-51` | The only `UPDATE` carries `AND state = 'building'` |
| T006 | complete | VERIFIED | `test_scheduler_claim.py:96-109` | |
| T007 | complete | PARTIAL | `test_scheduler_claim.py:112-139` (summer and winter `at` cases); `:142-163` (control) | The plan's control asserts `classification_date` *equals* the database clock's Chicago date. The test asserts `stamped in (expected, expected - timedelta(days=1))` unconditionally, so two non-equivalent mutants survive (IR-001) |
| T008 | complete | VERIFIED | `test_scheduler_claim.py:166-183` | |
| T009 | complete | VERIFIED | `test_scheduler_restart.py:56-94` | |
| T010 | complete | VERIFIED | `test_scheduler_restart.py:97-125`; `test_classification_scheduler_sql.py:62-70` | The relabelled-terms assertion sits in the SQL unit test, which reads the shipped literal, not in `test_scheduler_restart.py`. Coverage is equivalent: T009 pins the persisted reason to the same literal |
| T011 | complete | VERIFIED | `test_scheduler_claim.py:186-203` | Patches `scheduler._QUALIFYING_RUN_SQL`; asserts `None`, no new row, and that a follow-up claim succeeds |
| T012 | complete | VERIFIED | `test_classification_scheduler_sql.py:25-59` | Items (a) to (e) are all present. The append-only table list matches research-store 2.5 |
| T013 | complete | VERIFIED | `test_classification_scheduler_shapes.py` | Frozen dataclasses, field names and types; `at` is keyword-only with default `None`; `reclaim_interrupted_sets(pool)` |
| T014 | complete | VERIFIED | `classification/__init__.py` (one line, LF-terminated) | Created because T001 found it absent |
| T015 | complete | VERIFIED | `settings.py` | Imports `_EnvNamedSettings`; `config/settings.py` is untouched; not added to `Settings` |
| T016 | complete | VERIFIED | The three SQL files | Design 2.4 verbatim, plus the DEC-0125 change; `-- ` headers; no `BEGIN`/`COMMIT`; `pyproject.toml` untouched (the S1 glob ships them, as `uv build` confirms) |
| T017 | complete | VERIFIED | `scheduler.py:16-71` | `try` wraps the `with`; `Final` constants are read at import; `logging.getLogger(__name__)`. An unplanned defensive `RuntimeError` at `:53-54` narrows the type for mypy and cannot be reached (`INSERT ... RETURNING`) |
| T018 | complete | VERIFIED | Reviewer reran every Validation Plan command (see Independent Validation) | `test_research_sql_is_append_only.py` passes unedited. `test_engine_sql_safety.py` does not exist (S2 has not landed), which the plan allows |
| T019 | complete | VERIFIED | `git diff --stat 3f897a7..HEAD` | Only plan-named files and T020 evidence. No `pyproject.toml`, `app.py`, `config/settings.py` or delivered test file |
| T020 | complete | VERIFIED | `CAP-002-E2-S8-tdd-evidence.yaml` | Two cycles, each `APPROVED` with `drift_detected: false`. `diff_sha256` equals each cycle patch's SHA-256. Each `reviewed_patch`, with `index` lines stripped, equals `git diff 3f897a7..HEAD` over its files exactly. `commit_hash: stage`; the commit carries `Decision-Id: DEC-0125`. Lint is clean |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_only_succeeded_and_partial_runs_are_claimed` / TC-COMP-077 | ADEQUATE | Real pool over a migrated database. All five non-qualifying states are seeded first, with earlier `ended_at`, so a weakened filter would claim them. Asserts `None`, then an empty table, then the exact `(set_id, run_id, 'building')` row | `cancelling` is not seeded (the story names five states), but the SQL-text test pins the list, and the `cancelling` and blacklist mutants are killed |
| `test_qualifying_runs_are_claimed_oldest_first_once_each` / TC-COMP-078 | ADEQUATE | Out-of-order insertion with mixed states; asserts exact order, a fourth `None`, and one set per run | none |
| `test_claim_beside_a_building_set_returns_none_and_inserts_nothing` / TC-COMP-079 | ADEQUATE | Exercises the partial-index `UniqueViolation` path; asserts exact rows | none |
| `test_claim_stamps_the_chicago_date[summer, winter]` / TC-COMP-080 | ADEQUATE | 23:30 CDT and 23:30 CST, persisted date read back. Kills the reviewer's New York and `at=None` mutants, and the coder's UTC and drop-COALESCE mutants | none |
| `test_claim_without_at_stamps_the_database_clock_chicago_date` / TC-COMP-080 (T007 control) | WEAK | The only test of the production `at=None` branch | Accepts `expected - 1 day` with no check that the clock crossed Chicago midnight; `manual:r-c-default-yesterday` and `manual:r-c-default-current-date` survive (IR-001) |
| `test_failed_set_for_run_a_does_not_block_later_run_b` / TC-COMP-081 | ADEQUATE | A's failed row is compared on `(set_id, run_id, state, reason)`; B gets `building`; the next claim returns `None` | none |
| `test_classification_settings.py` (3 tagged plus 6 extra) / TC-COMP-082 | ADEQUATE | `ConfigurationError` messages are checked both for the variable names and for the absence of each value; boundaries at 1 and equality | none (`manual:r-s-timeout-gt` survives but is equivalent; see Independent Validation) |
| `test_reclaim_fails_stale_building_sets_only` / TC-COMP-168 | ADEQUATE | Full-row text compare of the untouched rows; exact reason; `ended_at` lower-bounded by a clock read taken before; next run claimable | none |
| `test_reclaim_with_nothing_building_...`, `test_reclaim_reports_and_logs_...` (T010) | ADEQUATE | Return value equals `[ReclaimedSet(stale, run_a)]`; exactly one `WARNING` naming the set; idempotent | none; `_log.info` and RETURNING-swap mutants are killed |
| `test_claim_returns_none_when_the_run_acquired_a_set_between_statements` (T011) | ADEQUATE | Forces the `run_id` `UniqueViolation`; asserts `None`, no row, and that the pool is still usable | none |
| `test_claim_does_not_swallow_other_database_errors` (unplanned) | ADEQUATE | A `ForeignKeyViolation` must propagate; kills widened-`except` mutants (coder's and reviewer's `ForeignKeyViolation` swap) | none |
| `test_classification_scheduler_sql.py` (T012) | ADEQUATE | Regexes pin the state list, anti-join, order and limit, the single `building` insert, the reclaim guard, no `DELETE`, no append-only `UPDATE`, no `asyncio` import, and the reason literal | none |
| `test_classification_scheduler_shapes.py` (T013) | ADEQUATE | `dataclasses` params, fields and type hints; `inspect.signature` kinds and defaults | none |

Isolation and determinism:
- Every database test gets a fresh database (`tests/conftest.py:79-113`), and every `ended_at` that affects order is explicit.
- Settings tests clear both variables and pass `_env_file=None`.
- The only clock dependence is the T007 control, whose tolerance is the subject of IR-001.

The mocks are honest: none of the claim or reclaim tests mocks the unit under test. T011 replaces only the query text, to force the race.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | Supporting |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY`; supporting |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-E2-integration` | harness root | 0 | PASS | `3f897a7…`, an ancestor of HEAD; supporting |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 3f897a7d6cc821e1d802613b260fde1d1bf570cd --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | `0 error(s), 0 warning(s)` |
| `uv run --directory <component> --offline pytest <3 story unit files> -v` | component | 0 | PASS | 19 passed; supporting (narrowest first) |
| `uv run --directory <component> --offline pytest -m postgres tests/integration/test_scheduler_claim.py tests/integration/test_scheduler_restart.py -v` | component | 0 | PASS | 13 passed; supporting |
| `uv run --directory <component> --offline pytest -m 'not postgres' -q` | component | 0 | PASS (required) | 984 passed, 406 deselected |
| `uv run --directory <component> --offline pytest -m postgres -q` | component | 0 | PASS (required) | 406 passed, 984 deselected |
| `uv run --directory <component> --offline pytest -q -p no:cacheprovider` | component | 0 | PASS (required) | 1390 passed (collect-only also reports 1390 = 984 + 406). `-p no:cacheprovider` only skips the ignored `.pytest_cache` write |
| `uv run --directory <component> --offline ruff check .` | component | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --offline ruff format --check .` | component | 0 | PASS (required) | 217 files already formatted |
| `uv run --directory <component> --offline mypy src` | component | 0 | PASS (required) | No issues in 53 source files |
| `uv sync --directory <component> --all-extras --offline --locked` | component | 0 | PASS (required) | Resolved 46, checked 43. `--locked` guarantees `uv.lock` is not rewritten |
| `uv build --directory <component> --offline` (one plain call, outside the sandbox) | component | N/A | refused | `Run outside of the sandbox`: the run's policy names `uv run *` and `uv sync*`, not `uv build`. Superseded below |
| `uv build --directory <component> --offline` (sandbox) | component | 2 | refused | `Failed to initialize cache at /Users/alvarodejodra/.cache/uv … Operation not permitted`. Superseded below |
| `uv build --directory <component> --cache-dir <scratch>/cache --out-dir <scratch>/dist` (sandbox) | component | 2 | refused | `Failed to fetch: https://pypi.org/simple/setuptools/`; the sandbox denies `pypi.org:443`. Superseded below |
| `uv build --directory <component> --out-dir <scratch>/dist --offline --find-links <scratch>/wheels --cache-dir <scratch>/cache` (sandbox) | component | 0 | PASS (required) | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl`. Both carry `classification/__init__.py`, `scheduler.py`, `settings.py` and the three `classification/sql/*.sql`; the wheel has nothing under `tests/`. `<scratch>/wheels` holds setuptools 84.2.1 repacked from the local uv cache (`~/.cache/uv/archive-v0/2YEXGW7dY86Rro9h`, 348 files = 348 RECORD entries, sha256 `3b5c19cf…37e0`), the same method as CAP-002-E2-S1 review v2 |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 3f897a7d6cc821e1d802613b260fde1d1bf570cd..HEAD --cycle review --out <scratch-mut>/mutants.json`, plus 21 reviewer `manual` mutants | harness root | 0 | PASS | 17 catalogue mutants over every changed production file. Final mutants file sha256 `0ce10fec…6051` |
| `python3 /Users/alvarodejodra/Projects/ai-agents/scripts/mutation-run.py run --repo-dir <component> --mutants <scratch-mut>/mutants.json --jobs 4 --command 'PYTHONPATH=src <component>/.venv/bin/python -m pytest tests/unit/test_classification_settings.py tests/unit/test_classification_scheduler_sql.py tests/unit/test_classification_scheduler_shapes.py tests/unit/test_research_sql_is_append_only.py tests/integration/test_scheduler_claim.py tests/integration/test_scheduler_restart.py -q -x -p no:cacheprovider' --out <scratch-mut>/results.json --logs <scratch-mut>/logs --work-root <scratch-mut>/work` | harness root | 3 | FAIL (required) | 38 mutants, 29 killed, 9 survived. Results sha256 `6e35a668…4847`; baselines green (57 passed). Survivors are detailed below |
| `git diff 3f897a7..HEAD -- <cycle files>` vs `cycle-{1,2}.patch` (`index` lines stripped) | component | 0 | PASS | Both match exactly; supporting |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | `sha256:ce25978b…747e`, equal to the story's `approval.reviewed_revision` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `sha256:42457828…ac82`, identical before and after validation |

Paths used above:
- `<component>` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`.
- `<scratch>` is `/tmp/claude-501/s8-review-build`, and `<scratch-mut>` is `/tmp/claude-501/s8-review-mut`.

Ten commands are counted as required: the TDD lint, `uv sync`, `uv build`, the three pytest runs, ruff, ruff format, mypy, and the gate mutation run. The `uv run`, `uv sync` and mutation commands ran outside the sandbox as one plain call each, which the run's `uv run *`, `uv sync*` and mutation-runner rules permit. The passing `uv build` ran inside the sandbox.

Mutation survivors (9):
- Five catalogue mutants change a digit inside a `-- ` header comment, which PostgreSQL discards, so they are equivalent:
  - `claim_set.sql:1:off-by-one:1`
  - `claim_set.sql:1:off-by-one:2`
  - `qualifying_run.sql:1:off-by-one:1`
  - `qualifying_run.sql:1:off-by-one:2`
  - `reclaim_interrupted.sql:1:off-by-one:1`
- `qualifying_run.sql:5:off-by-one:1` changes `SELECT 1` to `SELECT 2` inside `NOT EXISTS`, whose select list is never read. Equivalent.
- `manual:r-s-timeout-gt` changes the timeout bound from `ge=1` to `gt=1`. It is equivalent with respect to every stated contract.
  - The accepted set is identical: the invariant requires `timeout > poll >= 1`, so a timeout of exactly 1 is refused either way.
  - The only difference is which refusal fires for `TIMEOUT=1`. The field bound names `FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS`; the invariant names both variables. Both meet DAC-E2-S8-7 (name the variable, not the value).
- `manual:r-c-default-yesterday` and `manual:r-c-default-current-date` are not equivalent. Production would stamp the previous Chicago date, always for the first and for most hours of the day for the second. Both pass all 57 focused tests: logs `manual_r-c-default-yesterday.log` and `manual_r-c-default-current-date.log`, `57 passed`. This is IR-001.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E2-S8-run-20261024T231312Z`, HEAD `e4a49d9`, no staged, unstaged or untracked non-ignored files, code-revision `sha256:42457828…ac82`.
- After: identical branch, HEAD, porcelain status and code-revision. The branch was rechecked mid-review, since DEC-0188 records a concurrent branch switch on this checkout earlier in the run.
- Unexpected tracked-file changes: none.
- Ignored-path effects only:
  - `.pytest_cache/`, `.mypy_cache/`, `.ruff_cache/`, `.venv/` and `src/factorflow.egg-info/` were refreshed.
  - `build/` was used by setuptools.
  - `dist/` was not touched, because build output went to `<scratch>/dist`.
  - Mutation clones, logs and results stayed under `<scratch-mut>`.

## Findings

### IR-001 — The TC-COMP-080 control does not pin the production `at=None` branch to the Chicago date

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S8-4 (production branch), AC-10
- **Tasks**: T007 (T016, T017)
- **Files**: `tests/integration/test_scheduler_claim.py:142-163` (`test_claim_without_at_stamps_the_database_clock_chicago_date`, assertion at `:163`); `src/factorflow/classification/sql/claim_set.sql:4`
- **Claim challenged**: T007's control shows that a claim with `at` omitted stamps "the Chicago date of the database's own clock". This is the only test of the branch CAP-002-E2-S9's loop actually calls (`claim_next_set(pool)`; design 2.4).
- **Observed evidence**:
  - The test reads `(now() AT TIME ZONE 'America/Chicago')::date` in a later transaction than the claim. It then asserts `stamped in (expected, expected - timedelta(days=1))` with no check that the two reads crossed Chicago midnight, so a stamp one day behind is accepted at any time of day.
  - In the gate mutation run, two mutants of line 4 survive all 57 focused tests (`57 passed` in both logs). Both change only the fallback and leave the `at` path intact:
    - `manual:r-c-default-yesterday`: `COALESCE(%(at)s::timestamptz, CURRENT_TIMESTAMP - interval '1 day')`
    - `manual:r-c-default-current-date`: `COALESCE(%(at)s::timestamptz, CURRENT_DATE)`. With the container's UTC session, this stamps the previous Chicago day between Chicago midnight and the UTC rollover, which is most of the day.
  - The parametrized `at` cases cannot catch these, because they never evaluate the fallback.
- **Expected evidence/behavior**:
  - T007: the control asserts `classification_date` *equals* the Chicago date of the database clock.
  - DAC-E2-S8-4 and STD-UI-5: the stamped date is the America/Chicago date at set creation.
  - Skill step E.9 / TEST-TDD-006: no non-equivalent mutant of a changed line may survive the story's focused suites.
- **Impact**: A regression in the fallback, such as simplifying it to `CURRENT_DATE`, would ship with a green suite. Production sets would then be dated a day early. `classification_date` is what the product shows a classification is dated by (0006 column comment, AC-18, AC-19).
- **Required remediation**:
  - Make the control fail whenever the `at=None` branch stamps a date other than the Chicago date of the claim transaction's own clock. Allow a one-day difference only when the test observes Chicago midnight being crossed, or remove the race altogether. One way: compare against the set's own `started_at`, which `DEFAULT now()` fills in the claim's transaction, so it equals that transaction's `CURRENT_TIMESTAMP`.
  - Record it as a new TDD-evidence cycle. RED must show the strengthened control failing under `manual:r-c-default-yesterday`.
  - `manual:r-c-default-current-date` must be killed whenever its stamp differs from the correct date.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T003, justified**: the valid pair is `2.5`/`10` (kills a float-to-int mutant). The `1`/`1.5` lower-bound acceptance test is extra; it pins the `ge=1` boundary.
- **T010, justified**: the relabelled-terms check reads the shipped SQL literal in `test_classification_scheduler_sql.py`, not the persisted reason in `test_scheduler_restart.py`. T009 pins the persisted reason to the same literal, so coverage is equivalent.
- **Unplanned test, justified**: `test_claim_does_not_swallow_other_database_errors` enforces design 2.4's "only a `UniqueViolation` means not now" and OPS-ERR-001, and kills widened-`except` mutants.
- **Unplanned code, justified**: `scheduler.py:53-54` raises `RuntimeError` if `RETURNING` yields no row. It is a mypy narrowing that `INSERT … RETURNING` cannot reach, and is not observable.
- **T007 deviation, unjustified**: the control's planned "equals" was relaxed to an unconditional one-day tolerance (IR-001). The code comment gives midnight as the reason, but the tolerance is not bounded to that case.
- **Decisions**: DEC-0125 (`at` keyword plus `COALESCE`) is `applied` and owner `upheld`, and `e4a49d9` carries `Decision-Id: DEC-0125`. This review recorded no new decision.
- **Bookkeeping**: the story status is `in-review` and the approval revision is unchanged. All 20 task boxes are checked; 19 tasks are VERIFIED and T007 is PARTIAL.
- **Sibling state**: CAP-002-E2-S2 has not landed on the integration branch, so `tests/unit/test_engine_sql_safety.py` does not exist yet. T018 makes that guard conditional. S8 created the shared package marker with the byte content both plans pin.
- **No out-of-scope files**.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**:
  - Run `$story-coding` rework for CAP-002-E2-S8 with `CAP-002-E2-S8-tasks.md` and this report, and resolve IR-001.
  - Record the rework as a new TDD-evidence cycle, with RED shown for `manual:r-c-default-yesterday`.
  - Rerun `$adversarial-review` against the same base, `usr/alvaro-de-jodra/CAP-002-E2-integration`.
  - Commit this report on the story branch (the supervised driver or the owner) and push the branch. Adversarial review for this story stays at this version until the report is committed.
- **Warnings accepted downstream**: N/A
