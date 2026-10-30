---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S9-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-29
updated: 2026-10-29
story_id: "CAP-002-E2-S9"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S9.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S9-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-29T01:44:07Z"
reviewed_head: "abb031454ee8b08538bb0049f4778c49f08870ec"
review_base: "7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184"
reviewed_state_revision: "sha256:45751d21462dee05af19c4701a2051f8e5a6f7ff06e400d5484b5d4ba4c3ffb6"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E2-S9
    artifact_version: 1
    content_revision: sha256:dfe3308fbd15823d2f2544a764c0dacb52b0dbed80a93c6138198fe1cfd22aba
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-29T02:00:57Z
  source_artifacts:
    - id: CAP-002-E2-S9
      version: "1 (sha256:dfe3308fbd15823d2f2544a764c0dacb52b0dbed80a93c6138198fe1cfd22aba)"
    - id: CAP-002-E2-S9-tasks
      version: "1"
    - id: CAP-002-E2-S9-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
    - id: CAP-002-classification-scheduler-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S9 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 9/10 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 16/16 passed |

The production code is correct. `run_classification_loop` (`scheduler.py:91-127`) matches design 2.4 line for line. `build_claimed_set` (`scheduler.py:80-88`) holds one pooled connection for the whole `engine.build` call. Every validation command passes:

- the full Python suite (1488 passed, 1 xfailed);
- the `not postgres` and `postgres` runs;
- `ruff check`, `ruff format --check`, `mypy src` and `uv build`;
- the npm, Vitest, Playwright (18 passed) and `tsc` commands.

`npm run lint` and `npm run format` exit 1. Every diagnostic is in the git-ignored `build/` folder; the tracked sources are clean (see Independent Validation). The TDD-evidence lint reports 0 errors.

The story still fails the mutation gate (E.9). This review regenerated the catalogue mutants (4), re-ran the coder's 19 manual mutants, and added 7 of its own: 30 in all. 27 were killed. Three of the reviewer's mutants survive, and each changes behaviour that the design or the task plan specifies:

- `manual:review-outcome-state-constant` (IR-001). The INFO outcome line says `failed` for every build.
- `manual:review-reclaim-failure-swallowed` (IR-002). A failing start-up reclaim is logged, and the loop goes on to claim.
- `manual:review-stop-check-after-build` (IR-003). A stop event set during a successful build ends the loop without the claim the plan says follows.

A probe run against the mutated modules shows an observable difference for each of the three. No survivor can be shown equivalent, so TC-COMP-083, TC-COMP-169 and the T006(c) outcome-line test are `WEAK`. A `WEAK` mandatory test is at least HIGH, and this is an initial review, so all three findings block. DAC-E2-12 is `PARTIAL`: its failure path, a reclaim that raises and must not be followed by a claim, has no test.

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 3 · MEDIUM 0 · LOW 0 · **total 3**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | HIGH | The INFO outcome line is pinned only for a `failed` build; a mutant logging `failed` for every outcome survives |
| IR-002 | HIGH | No test makes the start-up reclaim raise; a mutant that swallows the failure and goes on to claim survives (DAC-E2-12) |
| IR-003 | HIGH | No test sets the stop event during a successful build; a mutant that stops after the build instead of claiming again survives (plan T012, Other Notes) |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S9.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S9-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S9` |
| HEAD | `abb031454ee8b08538bb0049f4778c49f08870ec` (one stage commit, `story-coding(CAP-002-E2-S9): ...`) |
| Review base | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` resolved `7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184` (Merge PR #140). `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean: `git status --porcelain=v1 --untracked-files=all` was empty before and after validation. Nothing staged, unstaged or untracked |
| Changed files reviewed | 42 (8 code, plan and story files, plus 34 evidence files) |
| Baseline | none: initial review (no earlier `CAP-002-E2-S9-implementation-review-v*.md` exists) |

The reviewed patch matches the commit exactly. `cycle-1.patch` (`diff_sha256: e80a639a…69965` in the TDD evidence) has the same SHA-256 as `git diff 7646ab7..HEAD -- src tests`, so the cycle the per-cycle reviews judged is the code committed.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/scheduler.py` | modified | T012: `build_claimed_set`, `run_classification_loop`, module imports `engine`, `line_items`, `ClassificationSettings`, `asyncio`, `Awaitable`/`Callable`; module docstring updated. S8 functions unchanged |
| `tests/unit/test_classification_scheduler_loop.py` | added | T002-T008: TC-COMP-083, 084, 085, 169, design section 7 warning row, default dispatcher and wait, outcome line, `build_claimed_set` |
| `tests/integration/test_scheduler_restart.py` | modified | T009 (TC-COMP-092), T010 (restart-then-build); S8 tests unchanged |
| `tests/unit/test_classification_scheduler_shapes.py` | modified | T011: loop and build signatures, no `time.sleep` / `threading` / ingestion import, every await is `dispatch` or `wait` |
| `tests/unit/test_classification_scheduler_sql.py` | modified | T013: S8's `test_scheduler_module_does_not_import_asyncio` removed and replaced by the planned one-line comment; checks (a)-(d) untouched |
| `.../stories/CAP-002-E2-S9-tasks.md` | modified | Checkboxes T001-T016 only (no other text changed) |
| `.../stories/CAP-002-E2-S9.md` | modified | `status: planning` to `in-review` only (story-coding lifecycle); `artifact-gate.py revision` is unchanged at the approved `sha256:dfe3308f…aba` |
| `.../stories/CAP-002-E2-S9-tdd-evidence.yaml` | added | T016 |
| `.../stories/CAP-002-E2-S9-evidence/**` (34 files: RED and GREEN logs, `cycle-1.patch`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`, 27 mutation logs) | added | T016 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `scheduler.py:107-120`: claim, then build, then look again with no user action; S8's `qualifying_run.sql` admits only `succeeded`/`partial` | `test_scheduler_restart.py::test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run` (B `partial` gets one `complete` set; C `failed` gets none); TC-COMP-083 tests | The lifespan task that starts the loop is CAP-002-E3-S6, as the story scopes it |
| AC-11 | SATISFIED | `scheduler.py:111-113` passes `settings.build_timeout_seconds`; `:120` `continue` (no wait after a build); `:125` waits `poll_interval_seconds` only when idle | TC-COMP-083 (`delays == [5.0]`, build args carry `300.0`); TC-COMP-092 (a 0.05 s timeout reaches the engine); `test_default_wait_is_asyncio_sleep_for_the_poll_interval` | The 3000-stock volume test is CAP-002-E2-S7's (plan, Story Dependency Classification) |
| AC-20 | SATISFIED | `build_claimed_set` returns the engine's result unchanged; the engine records `failed` with its reason in its own transaction | TC-COMP-092: the set is `failed`, the reason starts `QueryCanceled` and contains `timeout`, and all three child tables have zero rows; restart test: A `failed` with the fixed interruption reason | Build side only, as the story scopes it |
| DAC-E2-4 | SATISFIED | S8's unique `run_id` and anti-join; the loop adds no second path | Restart test: `set(by_run) == {run_a, run_b}`, one set per run; a second loop start changes no row (`_full_rows` compare) | |
| DAC-E2-12 | PARTIAL | `scheduler.py:103` dispatches the reclaim once, outside the `try`, before the `while` | Success path: TC-COMP-169 (`dispatcher.calls[0] == (reclaim, (pool,))`, once); restart test (the stale set is `failed` before B is claimed; otherwise the single-building index would refuse B's claim) | The failure path has no test: a reclaim that raises must not be followed by a claim. Mutant `manual:review-reclaim-failure-swallowed` survives (IR-002) |
| DAC-E2-S9-1 | SATISFIED | `scheduler.py:99-100` (`wait_fn or asyncio.sleep`, `dispatch_fn or asyncio.to_thread`), `:103`, `:109`, `:111`, `:125` | TC-COMP-083 (both cases); `test_default_dispatcher_runs_the_database_work_off_the_event_loop_thread`; `test_every_await_in_the_loop_is_a_dispatch_or_a_wait` | The criterion's own wording is proven. IR-001 and IR-003 concern design and plan behaviour beyond it |
| DAC-E2-S9-2 | SATISFIED | `scheduler.py:121-122` `except Exception: log.exception(...)`, then the stop check and the wait | TC-COMP-084: one ERROR record on the scheduler logger with a `RuntimeError: boom` traceback, `delays == [5.0]`, and the next claim made; the build variant (`OSError`); `CancelledError` propagates unlogged | The coder's mutants `catch-base-exception`, `error-without-traceback`, `swallow-silently` and the reviewer's `failed-iteration-skips-wait` are all killed |
| DAC-E2-S9-3 | SATISFIED | `scheduler.py:103` | TC-COMP-169 (3 idle iterations, reclaim once and first); `test_reclaim_runs_even_when_the_stop_event_is_already_set` | `no-reclaim`, `reclaim-every-iteration`, `reclaim-on-loop` and `stop-check-before-claim` are all killed |
| DAC-E2-S9-4 | SATISFIED | `scheduler.py:111-113` passes `build_timeout_seconds`; `:87-88` passes it to `engine.build` unchanged | TC-COMP-092 over a real pool and thread, under 4 s against a 5 s `pg_sleep` stage; `test_build_claimed_set_builds_on_one_checked_out_connection` (`12.5` reaches `build`) | `build-gets-poll-interval` (poll 10 s > the 5 s stage) and `build-timeout-dropped` are killed |
| DAC-E2-S9-5 | SATISFIED | `src/factorflow/ingestion_main.py` is unchanged (not in the diff) | `test_ingestion_main_source_imports_nothing_from_classification` (AST, relative imports resolved, non-vacuous); `test_ingestion_main_loads_no_classification_module_at_runtime` (fresh `-I` interpreter, transitive; the same probe sees the scheduler when it is imported) | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At base `7646ab7`: migration `0006_classifications.sql`, S8's `scheduler.py`/`settings.py`/`scheduler_support.py`, S2's `engine.build`/`_STAGES`/`line_items.unresolved`/`engine_support.py`, `test_engine_transaction.py` and `test_api_reclaim_lifespan.py` all exist | |
| T002 | complete | VERIFIED | `test_classification_scheduler_loop.py:41-180`: `_RecordingWaiter`, `_RecordingDispatcher` (both with runaway guards), `_settings`, `_scripted`, `_result`, `_Fakes`, `_traceback` | `_traceback` accepts `exc_info` or the redacting filter's `exc_text`, a justified rework from the per-cycle review |
| T003 | complete | VERIFIED | `:188-223` (TC-COMP-083, two cases) | Assertions (a)-(d) as planned. Weakness in IR-001 and IR-003 |
| T004 | complete | VERIFIED | `:232-308` (TC-COMP-084, the build variant, `CancelledError`) | |
| T005 | complete | VERIFIED | `:317-350` (TC-COMP-169, stop already set) | Weakness in IR-002 |
| T006 | complete | VERIFIED | `:358-482`: (a) warnings, (b) default dispatcher and default wait, (c) INFO line for a failed build | (c) covers only `failed` (IR-001) |
| T007 | complete | VERIFIED | `:490-544` (TC-COMP-085 static and runtime, non-vacuous guards) | |
| T008 | complete | VERIFIED | `:552-605` | Proves one checkout, build while held, `__exit__` called with no exception, and `__exit__` called with the exception |
| T009 | complete | VERIFIED | `test_scheduler_restart.py:159-207` | Deviation, justified: `poll_interval_seconds=10.0` instead of the planned `1.0`. A build handed the poll interval would then outlast the 5 s stage; recorded in the TDD evidence, and the `build-gets-poll-interval` mutant is killed |
| T010 | complete | VERIFIED | `test_scheduler_restart.py:210-243` | |
| T011 | complete | VERIFIED | `test_classification_scheduler_shapes.py:41-115` | Leaves S8's `psycopg` import alone, as planned |
| T012 | complete | VERIFIED | `scheduler.py:7-20` (imports), `:80-88`, `:91-127` | Verbatim design 2.4. `claim_next_set(pool)` is called with the pool only. No other reclaim call. `mypy src` passes |
| T013 | complete | VERIFIED | `test_classification_scheduler_sql.py:57` (comment); nothing else in the file changed | The commit message cites the reason, as planned |
| T014 | complete | VERIFIED | Independent Validation below; `app.py`, `pyproject.toml`, `ingestion_main.py` and `config/settings.py` are absent from `git diff --stat`; `test_api_isolation.py` and `test_api_reclaim_lifespan.py` pass in the full suite | |
| T015 | complete | VERIFIED | `# Implements TC-COMP-083/084/169/085/092` above the planned tests; other new tests cite their AC; only the planned files changed, plus T016 evidence | |
| T016 | complete | VERIFIED | `CAP-002-E2-S9-tdd-evidence.yaml`: one cycle, `commit_hash: stage`, `code_review_verdict: APPROVED`, `drift_detected: false`, `diff_sha256` equal to the committed code diff; `check-tdd-evidence.py --require-logs` reports 0 errors and 0 warnings | The single cycle fits the plan's shape: every test first (T002-T011), then one production task |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_loop_claims_and_builds_through_the_dispatcher_and_waits_only_when_idle` / TC-COMP-083 | WEAK | Exact dispatch order, build args `(pool, set_id, 300.0)`, `delays == [5.0]`, stop reached. Kills `no-continue-after-build`, `claim-on-loop`, `build-on-loop`, `build-gets-run-id` and the stop-check mutants | Survivors on its complete-build path: `outcome-state-constant` (IR-001) and `stop-check-after-build` (IR-003) |
| `test_loop_with_nothing_to_claim_waits_the_poll_interval_and_builds_nothing` / TC-COMP-083 | ADEQUATE | Idle path: no build, one poll-interval wait | none |
| `test_raising_claim_is_logged_with_exception_and_the_loop_continues` / TC-COMP-084 | ADEQUATE | One ERROR record with that message, a traceback ending `RuntimeError: boom`, a second claim, `delays == [5.0]`. Deterministic after any earlier `configure_logging()` (accepts `exc_text`) | none |
| `test_raising_build_is_logged_with_exception_and_the_loop_continues` / TC-COMP-084 | ADEQUATE | The same for an `OSError` from the build | none |
| `test_cancellation_raised_by_the_dispatcher_propagates_out_of_the_loop` | ADEQUATE | `CancelledError` escapes, no ERROR is logged, no wait | none |
| `test_reclaim_is_dispatched_once_before_the_first_claim` / TC-COMP-169 | WEAK | Reclaim first, once, pool only, across three idle iterations | The reclaim-raises path is unpinned: `reclaim-failure-swallowed` survives (IR-002) |
| `test_reclaim_runs_even_when_the_stop_event_is_already_set` / TC-COMP-169 | ADEQUATE | Exact two calls, no wait | none |
| `test_each_unresolved_line_item_is_warned_once_before_the_first_claim` | ADEQUATE | Exact two messages, both counted before the first claim, not repeated over two iterations | none |
| `test_no_warning_when_every_line_item_is_resolved` | ADEQUATE | No WARNING | none |
| `test_default_dispatcher_runs_the_database_work_off_the_event_loop_thread` | ADEQUATE | Reclaim and claim thread ids differ from the loop thread | none |
| `test_default_wait_is_asyncio_sleep_for_the_poll_interval` | ADEQUATE | Patched `asyncio.sleep` records `[1.0]`; no real sleep | none |
| `test_failed_build_is_logged_at_info_without_raising` (T006 c) | WEAK | Exact INFO line for `failed`, no ERROR, looks again at once | The state is pinned only for `failed`; no test pins the line for a `complete` build (IR-001) |
| `test_ingestion_main_source_imports_nothing_from_classification` / TC-COMP-085 | ADEQUATE | AST over every import form, relative imports resolved, non-vacuous guard | none |
| `test_ingestion_main_loads_no_classification_module_at_runtime` / TC-COMP-085 | ADEQUATE | Fresh isolated interpreter, transitive; the positive control proves the prefix | none |
| `test_build_claimed_set_builds_on_one_checked_out_connection` | ADEQUATE | One `connection()` call; the build sees the held connection (`__exit__` count 0); result identity; clean exit | none |
| `test_build_claimed_set_releases_the_connection_when_the_build_raises` | ADEQUATE | The exception propagates as the same object; `__exit__` receives it | none |
| `test_short_build_timeout_reaches_the_engine_and_fails_the_set` / TC-COMP-092 | ADEQUATE | Real pool, thread and PostgreSQL 16: `failed`, `QueryCanceled…timeout`, zero child rows, the exact INFO line, under 4 s against a 5 s stage | none |
| `test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run` | ADEQUATE | Fixed reason on A, one `complete` set on B, none on C, no `building` row, and an idempotent second start (full-row compare) | none |
| `test_scheduler_shapes.py` (4 new tests, T011) | ADEQUATE | Signature order and defaults, coroutine, no `time.sleep`/`threading`/ingestion import, awaits limited to `dispatch`/`wait`; vacuity guards | none |

Mutation run (E.9; reviewer-generated, independent of the coder's run). Command and paths are under Independent Validation.

- Catalogue: `generate --range 7646ab7..HEAD --cycle review` yields 4 `negate-boolean` mutants on `scheduler.py:107/110/123/126`. All are killed.
- The coder's 19 manual mutants, re-run as `manual:coder-*`: all killed.
- The reviewer's 7 manual mutants: 4 killed (`build-gets-run-id`, `failed-iteration-skips-wait`, `logger-name`, `stop-check-before-claim`), 3 survived.

The 3 survivors are listed below. The probe (`probe.py` against `git archive HEAD src` with the single mutation applied) shows each one is observable.

| Mutant | Change | Observable difference (probe) | Contract it breaks |
|--------|--------|-------------------------------|--------------------|
| `manual:review-outcome-state-constant` | `result.state,` becomes `"failed",` in the INFO call (`scheduler.py:118`) | A `complete` build logs `… ended failed` (HEAD: `… ended complete`) | Design 2.4 (`log.info(... result.state)`); design section 4, Audit ("the log carries the same facts"); plan T012 ("INFO log of set, run and `result.state`") |
| `manual:review-reclaim-failure-swallowed` | Wraps `scheduler.py:103` in `try/except Exception: log.exception(...)` | When the reclaim raises: HEAD propagates `OSError` and dispatches nothing more. The mutant logs, dispatches `claim_next_set`, and returns normally | DAC-E2-12 ("before any new claim is attempted"); design 2.4 (reclaim outside the `try`); plan Open Gaps ("the exception propagates; it satisfies DAC-E2-12's 'before any new claim' because no claim follows") |
| `manual:review-stop-check-after-build` | Adds `if stop_event is not None and stop_event.is_set(): break` before `continue` (`scheduler.py:120`) | Stop set during a successful build: HEAD dispatches one more claim. The mutant stops after the build | Design 2.4 (no check after a build); plan T012 ("adding nothing: a successful build goes straight to `continue` with no stop check"); plan Other Notes, *Stop event* (E2-F26 removed exactly this check) |

## Independent Validation

All commands were run by this reviewer from the harness root. Commands that need uv, Docker or npm ran outside the sandbox as single plain calls, with `--directory <repo> --offline` (uv) or `--prefix <repo>` (npm) in place of `cd`. These forms are equivalent to the tech-stack commands run from the repository root.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review` | harness root | 0 | PASS | `READY` |
| `python3 scripts/artifact-gate.py require --artifact …/CAP-002-E2-S9.md` | harness root | 0 | PASS | Story approved; the revision matches `approval.reviewed_revision` |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E2-S9-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `uv run pytest tests/unit/test_classification_scheduler_loop.py tests/unit/test_classification_scheduler_shapes.py tests/unit/test_classification_scheduler_sql.py` | repo | 0 | PASS | 29 passed |
| `uv run pytest -m postgres tests/integration/test_scheduler_restart.py tests/integration/test_scheduler_claim.py` | repo | 0 | PASS | 17 passed |
| `uv sync --all-extras` | repo | 0 | PASS | Resolved 46, checked 43 packages |
| `uv build` | repo | 0 | PASS | `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl`; writes only ignored `build/`, `dist/`, `src/factorflow.egg-info/` |
| `uv run pytest` | repo | 0 | PASS | 1488 passed, 1 xfailed (`test_line_items_resolved.py`, pre-existing), 2 third-party deprecation warnings, 236.39 s |
| `uv run pytest -m 'not postgres'` | repo | 0 | PASS | 1047 passed, 441 deselected, 1 xfailed |
| `uv run pytest -m postgres` | repo | 0 | PASS | 441 passed, 1048 deselected |
| `uv run ruff check .` | repo | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | repo | 0 | PASS | 229 files already formatted |
| `uv run mypy src` | repo | 0 | PASS | No issues in 56 source files |
| `npm ci` | repo | 0 | PASS | 250 packages. `npm audit` reports 10 vulnerabilities from the unchanged `package-lock.json`; this story changes no frontend dependency |
| `npm run build` | repo | 0 | PASS | Vite bundle into ignored `src/factorflow/api/static/` |
| `npm run test` | repo | 0 | PASS | 42 files, 352 tests passed |
| `npm run test:e2e` | repo | 0 | PASS | 18 passed (2.9 min), real API and PostgreSQL container |
| `npm run lint` | repo | 1 | PASS (environment note) | All diagnostics are in the git-ignored `build/lib/factorflow/api/static/assets/index-BFn-kDOZ.js`. `uv build` copies the Vite bundle there, and `biome.json` does not ignore `build/`. Rerunning with `--max-diagnostics=500` shows 500 diagnostics, every one in that file. `biome lint` over every tracked source path (`web/src`, the five root configs, `biome.json`) exits 0, 84 files |
| `npm run format` | repo | 1 | PASS (environment note) | 2 errors, both in `build/lib/factorflow/api/static/assets/` (`index-BFn-kDOZ.js`, `index-CLWAKYLJ.js`). `biome format` over the tracked source paths exits 0, 84 files. `build/` was already present (ignored) when the review began |
| `npx tsc --noEmit` | repo | 0 | PASS | |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184..HEAD --cycle review --out <scratch>/mutants.json` | harness root | 0 | PASS | 4 mutants (`negate-boolean`); 26 manual mutants appended (19 of the coder's, 7 of the reviewer's) |
| `python3 scripts/mutation-run.py run --repo-dir … --mutants <scratch>/mutants.json --jobs 4 --timeout 300 --command 'PYTHONPATH=src <repo>/.venv/bin/python -m pytest tests/unit/test_classification_scheduler_loop.py tests/unit/test_classification_scheduler_shapes.py tests/unit/test_classification_scheduler_sql.py tests/integration/test_scheduler_restart.py tests/integration/test_scheduler_claim.py -q -p no:cacheprovider' --out <scratch>/results.json` | harness root | 3 | FAIL (gate) | Baselines 4/4 exit 0 (46 passed each); 30 mutants: 27 killed, 3 survived (IR-001, IR-002, IR-003). Results copied to `CAP-002-E2-S9-implementation-review-v1-mutation.json` (sha256 `16835ecc…6da6d5`) |

Required validation counts the 15 tech-stack and story commands plus the TDD-evidence lint (16). The mutation run is a test-quality gate (E.9) and is reported under Test Quality Assessment.

### Validation Side Effects

- Before: HEAD `abb0314`, working tree clean, `reviewed_state_revision` `sha256:45751d21…3ffb6`. Ignored `build/`, `dist/`, `node_modules/`, `.venv/` and `src/factorflow/api/static/` were already present.
- After: HEAD `abb0314`, working tree clean (`git status --porcelain=v1 --untracked-files=all` empty), `code-revision` unchanged at `sha256:45751d21…3ffb6`.
- Unexpected tracked-file changes: none. Only ignored outputs were rewritten (`build/`, `dist/`, `node_modules/`, `src/factorflow/api/static/`, caches).

## Findings

### IR-001 — The INFO outcome line is pinned only for a failed build

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-20, DAC-E2-S9-1 (design 2.4 outcome logging)
- **Tasks**: T003, T006 (c), T012
- **Files**: `src/factorflow/classification/scheduler.py:114-119`; `tests/unit/test_classification_scheduler_loop.py:188-206` (TC-COMP-083), `:463-482` (T006 c); `tests/integration/test_scheduler_restart.py:160-207` (TC-COMP-092)
- **Claim challenged**: The tests prove "the INFO outcome line of set, run and `result.state`" (T012, T006 c).
- **Observed evidence**: Mutant `manual:review-outcome-state-constant` replaces `result.state` with the constant `"failed"`, and all 46 focused tests pass with it. The probe shows a `complete` build logged as `classification set … for run … ended failed`. The outcome line is asserted only in the failed-build unit test and in TC-COMP-092, both `failed` outcomes. TC-COMP-083 and the restart-then-build test, which drive `complete` builds, assert no log.
- **Expected evidence/behavior**: Design 2.4 logs `result.state`. Design section 4, *Audit*, says "the log carries the same facts with `set_id` and `run_id`" as the `classification_set` row. Plan T012 specifies an "INFO log of set, run and `result.state`". The mutant changes behaviour those artifacts specify, so it is not equivalent.
- **Impact**: A regression that logs a fixed or wrong state would tell the owner that every successful build failed (or the reverse), and no test would fail. The durable record in `classification_set` would still be right, so only the operational log misleads.
- **Required remediation**: Add an assertion that a `complete` build logs `classification set <set_id> for run <run_id> ended complete`. Either extend TC-COMP-083 or parametrize the outcome-line test over `complete` and `failed`, so that `manual:review-outcome-state-constant` is killed.

### IR-002 — A failing start-up reclaim is not pinned to propagate before any claim

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-12, DAC-E2-S9-3
- **Tasks**: T005, T012
- **Files**: `src/factorflow/classification/scheduler.py:103`; `tests/unit/test_classification_scheduler_loop.py:317-350` (TC-COMP-169)
- **Claim challenged**: TC-COMP-169 proves that the reclaim happens "before any new claim is attempted" (DAC-E2-12).
- **Observed evidence**: Mutant `manual:review-reclaim-failure-swallowed` wraps the reclaim dispatch in `try/except Exception: log.exception(...)`, and all 46 focused tests pass with it. The probe, with a reclaim that raises `OSError("db unreachable")`:
  - HEAD propagates the `OSError` and dispatches nothing after the reclaim;
  - the mutant logs it, dispatches `claim_next_set`, and returns normally.

  No test makes the dispatched reclaim raise.
- **Expected evidence/behavior**: DAC-E2-12 requires an interrupted `building` set to be recorded `failed` "at the next scheduler start and before any new claim is attempted". Design 2.4 places `await dispatch(reclaim_interrupted_sets, pool)` outside the iteration `try`. The task plan's Open Gaps states the chosen behaviour: "the exception propagates; it satisfies DAC-E2-12's 'before any new claim' because no claim follows". The mutant attempts claims after a failed reclaim, so it is not equivalent.
- **Impact**: Under such a regression, a database outage at start-up would leave the stale `building` row in place, and the loop would keep claiming. The single-building partial unique index would then turn every claim into `None`. Classification would stall silently behind one logged error, instead of the task ending visibly for CAP-002-E3-S6's done-handling.
- **Required remediation**: Add a unit test in which the dispatched `reclaim_interrupted_sets` raises. Assert that the exception propagates out of `run_classification_loop`, that no `claim_next_set` is dispatched, and that no wait is requested, so that `manual:review-reclaim-failure-swallowed` is killed. Do not change the production behaviour: whether start-up should retry is the open owner question already recorded in the plan's Open Gaps and design section 14. Pin the behaviour as designed.

### IR-003 — A stop event set during a successful build is not pinned to claim again

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S9-1 (design 2.4 loop contract)
- **Tasks**: T003, T012
- **Files**: `src/factorflow/classification/scheduler.py:120`; `tests/unit/test_classification_scheduler_loop.py:188-206` (TC-COMP-083)
- **Claim challenged**: The loop is "verbatim from design 2.4 … adding nothing: a successful build goes straight to `continue` with no stop check" (T012), and the tests hold it there.
- **Observed evidence**: Mutant `manual:review-stop-check-after-build` adds a stop check after a successful build, and all 46 focused tests pass with it. The probe, with the stop event set inside a successful build:
  - HEAD dispatches one more `claim_next_set` and then stops at the idle stop check;
  - the mutant stops straight after the build.

  Every test sets the stop event from the waiter or from an exhausted claim, never during a build.
- **Expected evidence/behavior**: Design 2.4 has no stop check after a build. The plan states the behaviour twice. T012 says "adding nothing … no stop check". Other Notes, *Stop event*, says "No check follows a build, so a test that sets the stop event during a build sees the loop claim again, and it stops at the stop check before `await wait(...)` once a claim returns `None`". It also records that cross-plan review E2-F26 removed exactly this check. The mutant changes that specified behaviour, so it is not equivalent.
- **Impact**: Production passes no `stop_event`: per DEC-0142, CAP-002-E3-S6 calls the loop with the pool and settings only. Nothing observes the difference at runtime today. But `stop_event` is the design section 7 test seam, and reintroducing the check that E2-F26 removed would go unnoticed. Per E.9, an effect that is small or not reached yet belongs here and does not lower severity.
- **Required remediation**: Add a unit test in which the faked `build_claimed_set` sets the stop event and returns a `complete` result. Assert that the loop dispatches another `claim_next_set` with no wait in between, and ends at the idle stop check, so that `manual:review-stop-check-after-build` is killed.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T009 poll interval, justified**: `poll_interval_seconds=10.0` instead of the plan's `1.0` (`test_scheduler_restart.py:177-179`). With a poll longer than the 5 s stage, a build handed the poll interval would complete, so the test catches that swap. The swap is mutant `build-gets-poll-interval`, which this review confirms is killed. The deviation is recorded in the TDD evidence.
- **Story status**: the story moved from `planning` to `in-review`, per the story-coding lifecycle. The plan's Resolved Conflicts note says the status stays `todo`, which was already stale before coding began. The content revision used by the approval gate is unchanged (`sha256:dfe3308f…aba`), so the approval stands. No finding.
- **Branch**: the plan header names `usr/alvaro-de-jodra/CAP-002-E2-tasks`, the planning branch; the coding branch is `usr/alvaro-de-jodra/CAP-002-E2-S9`, cut by the driver from `origin/main` `7646ab7`. No finding.
- **No out-of-scope change**: `src/` changes only `scheduler.py`. `app.py`, `pyproject.toml`, `ingestion_main.py`, `config/settings.py`, `uv.lock` and `package-lock.json` are untouched. No delivered CAP-001 test file is edited (DEC-0064 as extended by DEC-0084).
- **Open owner question (pre-existing, not raised here)**: whether start-up reclaim should retry when it fails (plan Open Gaps; design section 14 item 1). IR-002 asks only that the behaviour as designed be pinned.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework of CAP-002-E2-S9 with `CAP-002-E2-S9-tasks.md` and this report)
- **Required action**: Add the three tests that kill `manual:review-outcome-state-constant` (IR-001), `manual:review-reclaim-failure-swallowed` (IR-002) and `manual:review-stop-check-after-build` (IR-003). No production change is required. Record the rework as a new TDD-evidence cycle. Then rerun `$adversarial-review`, which will scope against this report's `reviewed_head` and `-mutation.json`.
- **Warnings accepted downstream**: N/A
