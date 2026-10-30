---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S9-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-29
updated: 2026-10-29
story_id: "CAP-002-E2-S9"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S9.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S9-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-29T02:39:16Z"
reviewed_head: "c1ee95fe3aa0c75a2b27ce361e9d11946c3e8daa"
review_base: "7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184"
reviewed_state_revision: "sha256:443f9477863721a18c895041d2224579108e2121de8d276cca3df49a65a76d83"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-10-29T02:59:38Z
  source_artifacts:
    - id: CAP-002-E2-S9
      version: "1 (sha256:dfe3308fbd15823d2f2544a764c0dacb52b0dbed80a93c6138198fe1cfd22aba)"
    - id: CAP-002-E2-S9-tasks
      version: "1"
    - id: CAP-002-E2-S9-tdd-evidence
      version: "cycle-2"
    - id: CAP-002-E2-S9-implementation-review
      version: "1"
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

# Implementation Review: CAP-002-E2-S9 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 0 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 16/16 passed |

This is a re-review. Its baseline is review v1 (`reviewed_head` `abb0314`, CHANGES-REQUIRED). The rework commit `c1ee95f` changes tests only: `git diff abb0314..HEAD -- src` is empty. Its code diff (`git diff abb0314..HEAD -- src tests`) has the same SHA-256 as `cycle-2.patch` (`7ca42da6…100f`), which the cycle-2 reviews judged.

All three v1 findings are resolved. Each v1 survivor is now killed by the test written for it:

- `manual:review-outcome-state-constant` (v1 IR-001) by `test_build_outcome_is_logged_at_info_without_raising[complete]`;
- `manual:review-reclaim-failure-swallowed` (v1 IR-002) by `test_raising_reclaim_propagates_before_any_claim`;
- `manual:review-stop-check-after-build` (v1 IR-003) by `test_stop_event_set_during_a_successful_build_claims_again_before_stopping`.

The mutation gate (E.9) was rerun over the whole change set:

- 4 catalogue mutants, regenerated;
- the baseline's 26 manual mutants, carried by `scope --previous`;
- 5 new reviewer mutants.

All 30 `carried` mutants are killed. The 5 new mutants all survive, and `scope` tags each of them `late`: production is unchanged since the baseline, so the baseline could have found them just as well. One is equivalent. The other four expose two test gaps on lines unchanged since v1:

- IR-001: no test runs the loop without a stop event, the shape production uses;
- IR-002: the iteration handler is pinned only with `RuntimeError` and `OSError`.

Under step H, a `late` finding is MEDIUM at most and does not make its test `WEAK`. HEAD's code is correct in both cases, so the CRITICAL production-defect exception does not apply.

Every required validation command passes. `npm run lint` and `npm run format` exit 1 only on the git-ignored `build/` folder; the tracked sources are clean (see Independent Validation). The TDD-evidence lint reports 0 errors and 0 warnings.

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0 · **total 2**

| ID | Severity | Scope | Summary |
|----|----------|-------|---------|
| IR-001 | MEDIUM | late | No test runs `run_classification_loop` with `stop_event` omitted, as CAP-002-E3-S6 will; three mutants that end the loop when `stop_event` is `None` survive |
| IR-002 | MEDIUM | late | The iteration handler is pinned only with `RuntimeError` and `OSError`; narrowing `except Exception` to those two survives, and a `psycopg` error would then end the loop |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S9.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S9-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S9` |
| HEAD | `c1ee95fe3aa0c75a2b27ce361e9d11946c3e8daa`. Three commits since the base: `abb0314` (story coding), `267cd67` (review v1), `c1ee95f` (rework) |
| Review base | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` (no `--base-ref`) resolved `7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184` (Merge PR #140). `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean: `git status --porcelain=v1 --untracked-files=all` was empty before and after validation. Nothing staged, unstaged or untracked |
| Changed files reviewed | 83 since the base: 10 code, plan, story, TDD-evidence and review files, plus 73 evidence files. 44 of them changed since the baseline (39 evidence files) |
| Baseline | v1 (`CAP-002-E2-S9-implementation-review-v1.md`, CHANGES-REQUIRED), `reviewed_head` `abb031454ee8b08538bb0049f4778c49f08870ec`, with `CAP-002-E2-S9-implementation-review-v1-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/scheduler.py` | modified (unchanged since baseline) | T012: `build_claimed_set` (`:80-88`), `run_classification_loop` (`:91-127`); module imports of `engine`, `line_items`, `ClassificationSettings`, `asyncio`, `Awaitable`/`Callable`. S8's functions unchanged |
| `tests/unit/test_classification_scheduler_loop.py` | added; changed since baseline | T002-T008. The rework adds `:226-245` (v1 IR-003) and `:375-396` (v1 IR-002), and parametrizes `:509-530` over `complete` and `failed` (v1 IR-001) |
| `tests/integration/test_scheduler_restart.py` | modified (unchanged since baseline) | T009 (TC-COMP-092, `:159-207`), T010 (restart-then-build, `:210-243`); S8's tests unchanged |
| `tests/unit/test_classification_scheduler_shapes.py` | modified (unchanged since baseline) | T011 (`:41-115`) |
| `tests/unit/test_classification_scheduler_sql.py` | modified (unchanged since baseline) | T013: S8's asyncio-import guard replaced by the planned one-line comment (`:57`) |
| `.../stories/CAP-002-E2-S9-tasks.md` | modified | Checkboxes T001-T016; frontmatter `updated` and `last_reworked_review: CAP-002-E2-S9-implementation-review-v1.md` (rework bookkeeping). No other text changed |
| `.../stories/CAP-002-E2-S9.md` | modified (unchanged since baseline) | `status: planning` to `in-review` only. `artifact-gate.py revision` is still the approved `sha256:dfe3308f…aba` |
| `.../stories/CAP-002-E2-S9-tdd-evidence.yaml` | added; changed since baseline | T016: cycle-1, and cycle-2 for the rework |
| `.../stories/CAP-002-E2-S9-evidence/**` (73 files) | added (39 since baseline) | T016: RED/GREEN logs, `cycle-1.patch`, `cycle-2.patch`, the mutants files, the mutation results and their logs |
| `.../stories/CAP-002-E2-S9-implementation-review-v1.md`, `...-v1-mutation.json` | added (commit `267cd67`) | Review v1, the baseline of this review |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `scheduler.py:107-120`: claim, build, then look again with no user action. S8's `qualifying_run.sql` admits only `succeeded`/`partial` | `test_scheduler_restart.py::test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run`: B (`partial`) gets one `complete` set, C (`failed`) none. TC-COMP-083 tests | The lifespan task is CAP-002-E3-S6, as the story scopes it. IR-001 records that the production call shape (no `stop_event`) is untested |
| AC-11 | SATISFIED | `scheduler.py:111-113` passes `settings.build_timeout_seconds`. `:120` `continue` (no wait after a build). `:125` waits `poll_interval_seconds` only when idle | TC-COMP-083 (`delays == [5.0]`, build args carry `300.0`); the new stop-during-build test (claims again with `delays == []`); TC-COMP-092; `test_default_wait_is_asyncio_sleep_for_the_poll_interval` | The 3000-stock volume test belongs to CAP-002-E2-S7 |
| AC-20 | SATISFIED | `build_claimed_set` returns the engine's result unchanged; the engine records `failed` and its reason itself | TC-COMP-092: `failed`, the reason starts `QueryCanceled` and contains `timeout`, zero child rows. Restart test: A is `failed` with the fixed reason. The outcome line is pinned for both `complete` and `failed` | Build side only |
| DAC-E2-4 | SATISFIED | S8's unique `run_id` and anti-join; the loop adds no second path | Restart test: one set per run; a second loop start changes no row | |
| DAC-E2-12 | SATISFIED | `scheduler.py:103`: one reclaim dispatch, outside the `try`, before the `while` | TC-COMP-169 (reclaim first, once); restart test. New: `test_raising_reclaim_propagates_before_any_claim` (`:375-396`). The same `OSError` leaves the loop, only the reclaim is dispatched, and no wait is requested | v1's PARTIAL is closed. The failure path is pinned as designed; whether start-up should retry stays the owner's open question (plan Open Gaps; design 14 item 1) |
| DAC-E2-S9-1 | SATISFIED | `scheduler.py:99-100`, `:103`, `:109`, `:111`, `:125` | TC-COMP-083 (three cases now, including stop during a build); the default-dispatcher test; `test_every_await_in_the_loop_is_a_dispatch_or_a_wait` | |
| DAC-E2-S9-2 | SATISFIED | `scheduler.py:121-122` `except Exception: log.exception(...)`, then the stop check and the wait | TC-COMP-084: claim and build variants; `CancelledError` propagates unlogged | The criterion's own case, a raising claim, is proven. IR-002 records that only `RuntimeError`/`OSError` are exercised |
| DAC-E2-S9-3 | SATISFIED | `scheduler.py:103` | TC-COMP-169; `test_reclaim_runs_even_when_the_stop_event_is_already_set`; the new raising-reclaim test | |
| DAC-E2-S9-4 | SATISFIED | `scheduler.py:111-113`; `:87-88` passes the timeout to `engine.build` unchanged | TC-COMP-092 over a real pool and a real thread, under 4 s against a 5 s `pg_sleep` stage; `test_build_claimed_set_builds_on_one_checked_out_connection` | |
| DAC-E2-S9-5 | SATISFIED | `src/factorflow/ingestion_main.py` is unchanged | Both TC-COMP-085 tests (AST and a fresh `-I` interpreter, each with a non-vacuity guard) | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At base `7646ab7`: migration `0006`, S8's `scheduler.py`/`settings.py`/`scheduler_support.py`, S2's `engine.build`/`_STAGES`/`line_items.unresolved`/`engine_support.py` all exist | |
| T002 | complete | VERIFIED | `test_classification_scheduler_loop.py:41-180`: doubles with runaway guards, `_settings`, `_scripted`, `_result`, `_Fakes`, `_traceback` | |
| T003 | complete | VERIFIED | `:187-245`: TC-COMP-083's two planned cases, plus the rework's stop-during-build case (`:226-245`) | The rework case pins plan T012 and Other Notes, *Stop event* |
| T004 | complete | VERIFIED | `:253-330` (TC-COMP-084, the build variant, `CancelledError`) | IR-002 notes the narrow exception types |
| T005 | complete | VERIFIED | `:338-396`: TC-COMP-169, stop already set, and the rework's raising-reclaim case | |
| T006 | complete | VERIFIED | `:404-530`: (a) warnings, (b) default dispatcher and default wait, (c) INFO outcome line, now parametrized over `complete` and `failed` | (c) was renamed to `test_build_outcome_is_logged_at_info_without_raising`. That is justified: it now covers both outcomes |
| T007 | complete | VERIFIED | `:571-592` (TC-COMP-085, static and runtime) | |
| T008 | complete | VERIFIED | `:600-653` | |
| T009 | complete | VERIFIED | `test_scheduler_restart.py:159-207` | Justified deviation, carried from v1: `poll_interval_seconds=10.0` instead of `1.0`, so `build-gets-poll-interval` is killed (it is, again) |
| T010 | complete | VERIFIED | `test_scheduler_restart.py:210-243` | |
| T011 | complete | VERIFIED | `test_classification_scheduler_shapes.py:41-115` | |
| T012 | complete | VERIFIED | `scheduler.py:7-20`, `:80-88`, `:91-127`: design 2.4 verbatim; `claim_next_set(pool)` with the pool only; no other reclaim call | Unchanged since v1 |
| T013 | complete | VERIFIED | `test_classification_scheduler_sql.py:57` | |
| T014 | complete | VERIFIED | Independent Validation below. `app.py`, `pyproject.toml`, `ingestion_main.py`, `config/settings.py`, `uv.lock` and `package-lock.json` are absent from `git diff --name-only 7646ab7..HEAD` | |
| T015 | complete | VERIFIED | `# Implements TC-COMP-083/084/169/085/092` above the planned tests only; the three rework tests cite their ACs in docstrings and carry no TC tag; only the planned files changed, plus T016 evidence | |
| T016 | complete | VERIFIED | `CAP-002-E2-S9-tdd-evidence.yaml` cycle-2: `commit_hash: stage`, `code_review_verdict: APPROVED`, `drift_detected: false`, `diff_sha256` `7ca42da6…100f`, equal to `git diff abb0314..HEAD -- src tests`; RED shows each v1 survivor failing only its own new test (`red-cycle-2-review-v1-survivors.log`); `check-tdd-evidence.py --require-logs` 0 errors, 0 warnings | A test-only rework can show RED only against the mutant it targets; that is what cycle-2 records |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_loop_claims_and_builds_through_the_dispatcher_and_waits_only_when_idle` / TC-COMP-083 | ADEQUATE | Exact dispatch order, build args `(pool, set_id, 300.0)`, `delays == [5.0]`, stop reached | v1's two survivors on its path are now killed by the tests below. The late survivors of IR-001 do not make it `WEAK` (H) |
| `test_loop_with_nothing_to_claim_waits_the_poll_interval_and_builds_nothing` / TC-COMP-083 | ADEQUATE | Idle path: no build, one poll-interval wait | none |
| `test_stop_event_set_during_a_successful_build_claims_again_before_stopping` (new, T003) | ADEQUATE | The build double sets the stop event and returns `complete`. Asserts the exact order `[reclaim, claim, build, claim]` and `delays == []`: the loop claims again at once and stops at the idle check. Kills `manual:review-stop-check-after-build` (1 failed, 48 passed in its log) | none |
| `test_raising_claim_is_logged_with_exception_and_the_loop_continues` / TC-COMP-084 | ADEQUATE | One ERROR record, traceback ending `RuntimeError: boom`, a second claim, `delays == [5.0]` | Exception type not varied (IR-002, late) |
| `test_raising_build_is_logged_with_exception_and_the_loop_continues` / TC-COMP-084 | ADEQUATE | The same for an `OSError` from the build | Exception type not varied (IR-002, late) |
| `test_cancellation_raised_by_the_dispatcher_propagates_out_of_the_loop` | ADEQUATE | `CancelledError` escapes, no ERROR logged, no wait | none |
| `test_reclaim_is_dispatched_once_before_the_first_claim` / TC-COMP-169 | ADEQUATE | Reclaim first, once, pool only, across three idle iterations | v1's survivor on the reclaim path is killed by the new test below |
| `test_reclaim_runs_even_when_the_stop_event_is_already_set` / TC-COMP-169 | ADEQUATE | Exact two calls, no wait | none |
| `test_raising_reclaim_propagates_before_any_claim` (new, T005) | ADEQUATE | The dispatched reclaim raises `OSError("db unreachable")`. Asserts that the same object leaves `asyncio.run` (`raised.value is unreachable`), that only the reclaim was dispatched, and that no wait was requested. Kills `manual:review-reclaim-failure-swallowed` | none |
| `test_each_unresolved_line_item_is_warned_once_before_the_first_claim` | ADEQUATE | Exact two messages, both before the first claim, not repeated | none (`review2-warn-before-reclaim` is equivalent; see below) |
| `test_no_warning_when_every_line_item_is_resolved` | ADEQUATE | No WARNING | none |
| `test_default_dispatcher_runs_the_database_work_off_the_event_loop_thread` | ADEQUATE | Reclaim and claim thread ids differ from the loop thread | none |
| `test_default_wait_is_asyncio_sleep_for_the_poll_interval` | ADEQUATE | Patched `asyncio.sleep` records `[1.0]` | none |
| `test_build_outcome_is_logged_at_info_without_raising[complete]`, `[failed]` (reworked, T006 c) | ADEQUATE | Exact INFO line `classification set <set> for run <run> ended <state>` for each state; no ERROR; looks again at once. The `[complete]` case kills `manual:review-outcome-state-constant` | none |
| `test_ingestion_main_source_imports_nothing_from_classification` / TC-COMP-085 | ADEQUATE | AST over every import form, relative imports resolved, non-vacuous | none |
| `test_ingestion_main_loads_no_classification_module_at_runtime` / TC-COMP-085 | ADEQUATE | Fresh isolated interpreter, transitive, positive control | none |
| `test_build_claimed_set_builds_on_one_checked_out_connection` | ADEQUATE | One checkout, build while held, result identity, clean exit | none |
| `test_build_claimed_set_releases_the_connection_when_the_build_raises` | ADEQUATE | The exception propagates; `__exit__` receives it | none |
| `test_short_build_timeout_reaches_the_engine_and_fails_the_set` / TC-COMP-092 | ADEQUATE | Real pool, thread and PostgreSQL 16: `failed`, `QueryCanceled…timeout`, zero child rows, exact INFO line, under 4 s | none |
| `test_restart_reclaims_the_stale_set_then_builds_the_next_qualifying_run` | ADEQUATE | Fixed reason on A, one `complete` set on B, none on C, no `building` row, idempotent second start | none |
| `test_classification_scheduler_shapes.py` (4 S9 tests, T011) | ADEQUATE | Signature order and defaults, coroutine, no `time.sleep`/`threading`/ingestion import, awaits limited to `dispatch`/`wait` | none |

Determinism: the four rework tests pass in isolation (`-k`, 4 passed). They also pass after `test_redaction.py` in one process (31 passed) and in the full suite. They use no clock, network or real sleep.

Mutation run (E.9). The commands and paths are under Independent Validation.

- **Mutants run.** `generate --range 7646ab7..HEAD --cycle review` regenerates the 4 `negate-boolean` mutants on `scheduler.py:107/110/123/126`. This review then added 5 manual mutants. `scope --since abb0314 --previous …-v1-mutation.json` added the baseline's 26 manual mutants (0 no longer apply) and tagged the set: 30 `carried`, 5 `late`.
- **Carried.** All 30 are killed, including v1's three survivors. Four focused-suite baselines exit 0 with 49 passed each.
- **Late.** All 5 survive. This is expected, because every one of them is on a production line unchanged since `abb0314`.

A probe (`git archive HEAD src`, each mutation applied to its own copy, one script driving each copy) shows how each late survivor behaves:

| Mutant (late) | Change | Observable difference (probe) | Judgement |
|---------------|--------|-------------------------------|-----------|
| `manual:review2-stop-none-breaks-before-wait` | `scheduler.py:123` `stop_event is not None and …` to `stop_event is None or …` | `stop_event` omitted, waiter cancels after 3 waits. HEAD: runs until cancelled, 3 claims, 3 waits. Mutant: returns normally after 1 claim and 0 waits | Not equivalent: IR-001 |
| `manual:review2-stop-none-breaks-after-wait` | `scheduler.py:126`, the same change | Mutant: returns normally after 1 claim and 1 wait | Not equivalent: IR-001 |
| `manual:review2-stop-event-required` | `scheduler.py:123` `if stop_event.is_set():` | Mutant: raises `AttributeError: 'NoneType' object has no attribute 'is_set'` after 1 claim | Not equivalent: IR-001 |
| `manual:review2-narrow-except` | `scheduler.py:121` `except Exception:` to `except (RuntimeError, OSError):` | A `psycopg.OperationalError` from the claim. HEAD: one ERROR record, then a second claim. Mutant: the `OperationalError` ends the loop with nothing logged | Not equivalent: IR-002 |
| `manual:review2-warn-before-reclaim` | Moves the two line-item warning lines above the `scheduler.py:103` reclaim dispatch | The only difference is the order of start-up log records. When the reclaim raises, the mutant has already logged its warning; HEAD has not | **Equivalent.** The contract specifies only that the warnings come "at start" and before the first claim. The story Description ("It warns once per unresolved line item at start"), the design section 7 row ("A warning per unresolved item at start") and plan T006 (a) ("emitted before the first claim is dispatched") all leave the warning-versus-reclaim order open. DAC-E2-S9-3 orders only the reclaim against the first claim, and both orders satisfy it. Not a finding |

## Independent Validation

This reviewer ran every command from the harness root. Commands that need uv, Docker or npm ran outside the sandbox as single plain calls. In place of `cd`, the uv calls take `--directory <repo> --offline` and the npm calls take `--prefix <repo>`; both forms are equivalent to the tech-stack commands run from the repository root. Nothing required was excluded.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story …/CAP-002-E2-S9.md --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184`, an ancestor of HEAD |
| `python3 scripts/artifact-gate.py require --project factorflow-v2 --artifact …/CAP-002-E2-S9.md` | harness root | 0 | PASS | Gate passed (owner-allowed). The revision matches `approval.reviewed_revision` |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E2-S9-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `uv run pytest tests/unit/test_classification_scheduler_loop.py tests/unit/test_classification_scheduler_shapes.py tests/unit/test_classification_scheduler_sql.py` | repo | 0 | PASS | 32 passed (plan Phase 3 checkpoint) |
| `uv run pytest -m postgres tests/integration/test_scheduler_restart.py tests/integration/test_scheduler_claim.py` | repo | 0 | PASS | 17 passed (plan Phase 3 checkpoint) |
| `uv run pytest tests/unit/test_redaction.py tests/unit/test_classification_scheduler_loop.py` | repo | 0 | PASS | 31 passed. Order-dependence check for the redacting filter |
| `uv run pytest tests/unit/test_classification_scheduler_loop.py -k "stop_event_set_during or raising_reclaim or build_outcome_is_logged"` | repo | 0 | PASS | 4 passed in isolation |
| `uv sync --all-extras` | repo | 0 | PASS | Resolved 46 packages, checked 43 |
| `uv build` | repo | 0 | PASS | `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl`. It writes only the ignored `build/`, `dist/` and `src/factorflow.egg-info/` |
| `uv run pytest` | repo | 0 | PASS | 1491 passed, 1 xfailed (`test_line_items_resolved.py`, pre-existing), 2 third-party deprecation warnings, 230.11 s. That is v1's 1488 plus the 3 new test items |
| `uv run pytest -m 'not postgres'` | repo | 0 | PASS | 1050 passed, 441 deselected, 1 xfailed |
| `uv run pytest -m postgres` | repo | 0 | PASS | 441 passed, 1051 deselected, 216.97 s (testcontainers PostgreSQL 16) |
| `uv run ruff check .` | repo | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | repo | 0 | PASS | 229 files already formatted |
| `uv run mypy src` | repo | 0 | PASS | No issues in 56 source files |
| `npm ci` | repo | 0 | PASS | 250 packages added. `npm audit` reports 10 vulnerabilities from the unchanged `package-lock.json`; this story changes no frontend dependency |
| `npm run build` | repo | 0 | PASS | Vite bundle into the ignored `src/factorflow/api/static/` |
| `npm run test` | repo | 0 | PASS | 42 files, 352 tests passed |
| `npm run test:e2e` | repo | 0 | PASS | 18 passed (2.9 min), real API and PostgreSQL container; `posttest:e2e` removed the container |
| `npm run lint` | repo | 1 | PASS (environment note) | Every diagnostic is in the git-ignored `build/lib/factorflow/api/static/assets/index-BFn-kDOZ.js` (`.gitignore:12: build/`; `git ls-files build` is empty). `uv build` copies the Vite bundle there, and `biome.json` does not ignore `build/`. Rerunning with `biome lint --max-diagnostics=500 .` from the repo shows 500 diagnostics, all in that file. `biome lint` over every tracked source path (`web/src`, the five root configs and `biome.json`) exits 0 over 84 files. Nothing was deleted to work around it |
| `npm run format` | repo | 1 | PASS (environment note) | 2 errors, both in `build/lib/factorflow/api/static/assets/` (`index-BFn-kDOZ.js`, `index-CLWAKYLJ.js`). `biome format` over the same tracked paths exits 0 over 84 files |
| `npx tsc --noEmit` (with `-p <repo>/tsconfig.json`, the root config) | repo | 0 | PASS | No output |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184..HEAD --cycle review --out <scratch>/mut/mutants.json` | harness root | 0 | PASS | 4 mutants (`negate-boolean`). 5 reviewer manual mutants (`manual:review2-*`) were then appended |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mut/mutants.json --since abb031454ee8b08538bb0049f4778c49f08870ec --previous …/CAP-002-E2-S9-implementation-review-v1-mutation.json --out <scratch>/mut/mutants-scoped.json` | harness root | 0 | PASS | 35 mutants: 30 `carried`, 5 `late`. 0 previous mutants no longer apply. sha256 `a503f71e…3234` |
| `python3 scripts/mutation-run.py run --repo-dir … --mutants <scratch>/mut/mutants-scoped.json --jobs 4 --timeout 300 --command 'PYTHONPATH=src <repo>/.venv/bin/python -m pytest tests/unit/test_classification_scheduler_loop.py tests/unit/test_classification_scheduler_shapes.py tests/unit/test_classification_scheduler_sql.py tests/integration/test_scheduler_restart.py tests/integration/test_scheduler_claim.py -q -p no:cacheprovider' --out <scratch>/mut/results.json` | harness root | 3 | PASS (gate, by scope) | All 4 baselines exit 0 (49 passed). 30 `carried`: 30 killed. 5 `late`: 5 survived (IR-001, IR-002, and one equivalent). Under step H, late survivors cannot block. Results copied to `CAP-002-E2-S9-implementation-review-v2-mutation.json` (sha256 `23c00e5f…3775`) |

Required validation is counted as in v1: the 15 tech-stack and story commands plus the TDD-evidence lint, 16 in all. The mutation run is the E.9 test-quality gate, reported under Test Quality Assessment. Its exit code 3 reflects the 5 late survivors.

### Validation Side Effects

- Before: HEAD `c1ee95f`; working tree clean (`git status --porcelain=v1 --untracked-files=all` empty); `reviewed_state_revision` `sha256:443f9477…6d83`. The ignored `build/`, `dist/`, `node_modules/`, `.venv/` and `src/factorflow/api/static/` were already present.
- After: HEAD `c1ee95f`; `git diff --stat` empty; `code-revision` unchanged at `sha256:443f9477…6d83`. The only untracked paths are this report and its `-v2-mutation.json`, the review's permitted writes. Both are under `docs/`, which the fingerprint excludes.
- Unexpected tracked-file changes: none. Only ignored outputs were rewritten (`build/`, `dist/`, `node_modules/`, `src/factorflow/api/static/`, caches).

## Findings

### IR-001 — No test runs the loop with `stop_event` omitted, the shape production uses

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-10, DAC-E2-S9-1
- **Tasks**: T003, T012
- **Files**: `src/factorflow/classification/scheduler.py:96`, `:123-127`. Every call site passes a stop event: `tests/unit/test_classification_scheduler_loop.py:156-164` (`_run_loop`), `:318-324`, `:466-468`, `:498-503`; `tests/integration/test_scheduler_restart.py:147-151`
- **Claim challenged**: The tests prove the loop "runs until cancelled" (design section 11) in the shape CAP-002-E3-S6 will start it.
- **Observed evidence**: Three late mutants survive all 49 focused tests: `review2-stop-none-breaks-before-wait`, `review2-stop-none-breaks-after-wait` and `review2-stop-event-required`. The probe runs the loop with `stop_event` omitted and a waiter that raises `CancelledError` on its third wait:
  - HEAD keeps claiming and waiting until it is cancelled (3 claims, 3 waits);
  - the first two mutants return normally after one idle claim;
  - the third raises `AttributeError` after one idle claim.

  `grep -rn run_classification_loop tests src` finds no call without `stop_event`. CAP-002-E3-S6's lifespan test will not exercise this path either, because per DEC-0142 it monkeypatches `run_classification_loop` in `factorflow.api.app`.
- **Expected evidence/behavior**: Several artifacts specify the no-stop-event path:
  - Design 2.4 gives `stop_event: asyncio.Event | None = None` and guards both checks with `stop_event is not None`.
  - Design 2.2 and DEC-0142 have the lifespan create the task with the pool and settings only.
  - Design section 11 says the coroutine "runs until cancelled".
  - Plan Other Notes, *Stop event*, says production shutdown cancels the task and `stop_event` is the test seam.

  Each mutant changes that specified behaviour, so none is equivalent.
- **Impact**: Under any of these regressions, the production scheduler would stop after its first idle poll and classify nothing more until the application restarted. That breaks AC-10, and no test would fail. HEAD is correct, so this is a test gap rather than a production defect. The lines are unchanged since the baseline (`git diff abb0314..HEAD -- src` is empty) and v1 could have found it, so it is `late`: MEDIUM at most, and it does not make TC-COMP-083 `WEAK` (step H).
- **Required remediation**: Add a unit test that runs `run_classification_loop` with `stop_event` omitted and ends it the way production does, by cancellation. For example, use a `wait_fn` that raises `asyncio.CancelledError` after several waits. Assert that the loop keeps claiming and waiting until it is cancelled, so that all three mutants are killed. No production change is needed.

### IR-002 — The iteration handler is pinned only with `RuntimeError` and `OSError`

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S9-2, AC-10
- **Tasks**: T004, T012
- **Files**: `src/factorflow/classification/scheduler.py:121-122`; `tests/unit/test_classification_scheduler_loop.py:253-300` (TC-COMP-084, claim and build variants)
- **Claim challenged**: TC-COMP-084 proves that a failing iteration, whatever it raises, is logged and the loop continues (OPS-ERR-001; design section 3).
- **Observed evidence**: The late mutant `review2-narrow-except` (`except (RuntimeError, OSError):`) survives all 49 focused tests. The probe makes the claim raise `psycopg.OperationalError("connection refused")`:
  - HEAD logs `classification scheduler iteration failed` and claims again;
  - the mutant lets the error end the loop with nothing logged.

  `psycopg.Error` derives from `Exception`, not from `OSError`, so every database-driver error falls outside the two types the tests use.
- **Expected evidence/behavior**: Several artifacts require the handler to catch any iteration failure:
  - Design 2.4 gives `except Exception:`.
  - Design section 3 says "the loop never exits on an iteration failure and never swallows one silently".
  - Design section 8 criterion 9 covers a database unreachable for several polls: "each iteration logs and the loop resumes claiming when it returns".
  - DAC-E2-S9-2 is stated for "a raising claim" without limiting the exception type.

  The mutant changes that specified behaviour, so it is not equivalent.
- **Impact**: Under such a regression, the first database error during a claim or a build would end the scheduler task. Classification would then stop until a restart, which is the failure design criterion 9 exists to prevent, and no test would fail. HEAD is correct, so this is a test gap. The lines are unchanged since the baseline, so it is `late`: MEDIUM at most, and it does not make TC-COMP-084 `WEAK`.
- **Required remediation**: Add, or parametrize, a TC-COMP-084 case whose claim raises an exception outside `RuntimeError` and `OSError`, so that `review2-narrow-except` is killed. The natural choice is `psycopg.OperationalError`, the case design criterion 9 names. No production change is needed.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (outcome line pinned only for `failed`) | RESOLVED | `test_classification_scheduler_loop.py:509-530` is parametrized over `complete` and `failed`, with exact message equality. `manual:review-outcome-state-constant` is killed by the `[complete]` case (`ended failed != ended complete`) |
| v1/IR-002 (failing start-up reclaim not pinned) | RESOLVED | `:375-396` `test_raising_reclaim_propagates_before_any_claim`. `manual:review-reclaim-failure-swallowed` is killed by that test alone. Production behaviour is unchanged, as v1 required |
| v1/IR-003 (stop during a successful build not pinned) | RESOLVED | `:226-245` `test_stop_event_set_during_a_successful_build_claims_again_before_stopping`. `manual:review-stop-check-after-build` is killed by that test alone |

## Scope and Plan Deviations

- **Test-only rework, confirmed from git**: `git diff abb0314..HEAD -- src` is empty. The code delta is the one test file, and it matches `cycle-2.patch` byte for byte (SHA-256).
- **Plan frontmatter**: `updated: 2026-10-29` and `last_reworked_review: CAP-002-E2-S9-implementation-review-v1.md` were added. This is rework bookkeeping, and the plan text is otherwise unchanged. No finding.
- **T009 poll interval, T006 (c) rename, story status and branch name**: as v1 recorded, justified. No finding.
- **No out-of-scope change**: `src/` changes only `scheduler.py`. No delivered CAP-001 file is edited (DEC-0064 as extended by DEC-0084).
- **Open owner question (pre-existing, not raised here)**: whether a failing start-up reclaim should retry (plan Open Gaps; design section 14 item 1). The rework pins the behaviour as designed, which is what v1 asked for. This review does not treat the open question as a defect of this story.
- **Decisions**: none recorded by this review.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync` for CAP-002-E2-S9)
- **Required action**: Proceed to doc sync with IR-001 and IR-002 recorded. Both are late test gaps with no production change required. Each can be closed by adding one unit test in `tests/unit/test_classification_scheduler_loop.py` that kills its named mutants (`-v2-mutation.json`).
- **Warnings accepted downstream**: IR-001, IR-002
