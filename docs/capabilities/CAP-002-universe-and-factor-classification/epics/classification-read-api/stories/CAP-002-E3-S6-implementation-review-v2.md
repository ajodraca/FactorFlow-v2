---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S6-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-05
updated: 2026-11-05
story_id: "CAP-002-E3-S6"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S6.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-05T19:05:55Z"
reviewed_head: "fb65f5e79c6e060608785207c8011ef5d8b8d9c0"
review_base: "ffec7a0182ace897b1732664abcf7ea8d9de4d19"
reviewed_state_revision: "sha256:bfb8da027b1c3ee9b7cdda498e915b98e7e6f36eaef0e9bf2026d2cedf1cdd7d"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E3-S6
    artifact_version: 1
    content_revision: sha256:7f0afbb68703054f8ae8dfc206818d03208959877e03e37179ff3f581cc33255
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-05T19:05:55Z
  source_artifacts:
    - id: CAP-002-E3-S6
      version: "1 (sha256:7f0afbb68703054f8ae8dfc206818d03208959877e03e37179ff3f581cc33255)"
    - id: CAP-002-E3-S6-tasks
      version: "1 (updated 2026-11-05, last_reworked_review v1)"
    - id: CAP-002-E3-S6-tdd-evidence
      version: "cycle-1, cycle-2, cycle-3"
    - id: CAP-002-E3-S6-implementation-review
      version: "1 (baseline, reviewed_head 38532a2)"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
    - id: CAP-002-classification-api-component-tests
      version: "1"
    - id: DEC-0142
      version: "applied, owner upheld"
    - id: DEC-0282
      version: "open, decided_by agent (story coding)"
    - id: DEC-0283
      version: "open, decided_by agent (story coding)"
    - id: DEC-0284
      version: "open, decided_by owner"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E3-S6 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 7/7 satisfied |
| Planned tasks | 11/11 verified |
| Required validation | 13/13 passed |

All three blocking findings of v1 are resolved, and the rework is confined to tests.
`src/factorflow/api/app.py` is byte-identical to the baseline (`38532a2`). Since then the
branch gained six assertion lines in `tests/unit/test_api_classification_lifespan.py`,
twelve added lines in the integration helper `tests/integration/api_classification_support.py`,
which the owner put in scope with DEC-0284, the plan note that records that decision, and the
evidence for cycles 2 and 3.

The baseline's two surviving mutants are now killed. r2 (classification task created first)
fails on line 98, and r1 (reclaim cancelled first) fails on line 110. A mutant that puts the
submitted value into the configuration error fails line 206. All 13 required commands pass when
rerun here. The non-postgres suite gives 1636 passed and 1 xfailed, the postgres suite 919 passed,
and ruff, ruff format and mypy are clean. The TDD evidence lint reports 0 errors. The test that
DEC-0284 fixed passed 40 of 40 repeats.

Three non-blocking findings remain:

- IR-001 (MEDIUM, late): a new review mutant that narrows the shutdown handler to
  `except RuntimeError` survives. Test 4's only error double is a `RuntimeError`, while the
  start-up reclaim's real failure is a `psycopg_pool.PoolTimeout`, which is not one.
- IR-002 (LOW, carried): v1's IR-005 is still open. A missing `cancel()` hangs the suite
  instead of failing it.
- IR-003 (LOW, delta): T009's recorded check, TC-COMP-089 and the approved DAC-E3-S6-4 still
  name two delivered files, but DEC-0284 added a third.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S6.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`; also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S6-run-20261104T230816Z` |
| HEAD | `fb65f5e79c6e060608785207c8011ef5d8b8d9c0` (`story-coding(CAP-002-E3-S6): record rework cycles for review v1 and DEC-0284; mark v1 reworked`) |
| Review base | `origin/main` → `ffec7a0182ace897b1732664abcf7ea8d9de4d19` (`pipeline-state.py review-base`, with and without `--base-ref origin/main`; `git merge-base --is-ancestor` exit 0; equals `git merge-base origin/main HEAD`) |
| Working tree | Clean before and after validation (`git status --porcelain=v1 -uall` empty; `code-revision` unchanged) |
| Changed files reviewed | 32 |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `38532a281dd0212f8c780f13c370d710c0dc2b4f`, mutation results `CAP-002-E3-S6-implementation-review-v1-mutation.json` |

`origin/main..HEAD` contains the story commits `38532a2`, `9dd9b2a` (review v1), `ea885eb`,
`6e0d8c6` and `fb65f5e`, plus the merge `71bfec3`, which brought `ffec7a0` in. The diff from
the base therefore holds only this story's work. The v1 base `8ee5571` is an ancestor of
`ffec7a0`. Between them, main added only CAP-002-E5-S1 (`web/` and its story docs), and
nothing under `src/` or `tests/`. `pipeline-state.py check … --stage adversarial-review`
reports `READY — review changes were reworked; a new review version is required`.

Since the baseline (`git diff 38532a2 HEAD -- src tests`) only two code files changed:
`tests/unit/test_api_classification_lifespan.py` (+6) and
`tests/integration/api_classification_support.py` (+12). No production file changed.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/app.py` | modified (15 added, 0 deleted; unchanged since v1) | AC-10, DAC-E3-13, DAC-E3-S6-1, DAC-E3-S6-2, DAC-E3-S6-4; T007 (1) to (5) |
| `tests/unit/test_api_classification_lifespan.py` | added (208 lines; +6 since v1) | DAC-E3-S6-1, DAC-E3-S6-2; T003, T004, T006; rework of v1 IR-001 to IR-003 |
| `tests/unit/test_api_no_secrets.py` | modified (116 added, 0 deleted; unchanged since v1) | DAC-E3-S6-3, DAC-E3-13; T005 |
| `tests/integration/api_classification_support.py` | modified (12 added, 0 deleted; new since v1) | DEC-0284 (decided_by owner); plan Other Notes "Change set added by DEC-0284"; TDD cycle-3 (T008). See IR-003 |
| `…/stories/CAP-002-E3-S6.md` | modified | Status `planning` → `in-review`. The content revision is unchanged and the gate still passes |
| `…/stories/CAP-002-E3-S6-tasks.md` | modified | Checkboxes T001 to T011, `updated`, `last_reworked_review: …-v1.md`, and the DEC-0284 change-set note |
| `…/stories/CAP-002-E3-S6-tdd-evidence.yaml` | added | T011: cycles 1, 2 and 3 |
| `…/stories/CAP-002-E3-S6-implementation-review-v1.md`, `…-v1-mutation.json` | added | Review v1 and its mutation results (this review's baseline) |
| `…/CAP-002-E3-S6-evidence/cycle-1.patch`, `red-cycle-1.log`, `green-cycle-1.log`, `code-review-cycle-1.txt`, `spec-drift-cycle-1.txt`, `mutation-cycle-1-mutants.json`, `mutation-cycle-1-results.json` | added (7) | T011, cycle 1 |
| `…/CAP-002-E3-S6-evidence/cycle-2.patch`, `cycle-3.patch`, `red-cycle-2.log`, `red-cycle-3.log`, `green-cycle-2.log`, `green-cycle-3.log`, `code-review-cycle-2-3.txt`, `spec-drift-cycle-2-3.txt` | added (8) | T011, cycles 2 and 3 |
| `…/CAP-002-E3-S6-evidence/mutation-cycle-2-mutants.json`, `mutation-cycle-2-results.json`, `mutation-cycle-2-results-logs/` (3 baseline logs, 3 mutant logs) | added (8) | T011, cycle 2 mutation evidence (v1 IR-004) |

No `dependencies.yaml` or packaging change is in the range.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `src/factorflow/api/app.py:207-209` runs `run_classification_loop(pool=pool, settings=classification_settings)` as a task in `_lifespan`. Lines 213-219 cancel and await it | `test_api_classification_lifespan.py::test_classification_task_created_beside_reclaim_task`, `::test_loop_called_with_pool_and_environment_settings` | Start side only, as the story scopes it. The loop is CAP-002-E2-S9's (`classification/scheduler.py`, signature `(pool, settings, wait_fn=None, dispatch_fn=None, stop_event=None)`) |
| AC-16 | SATISFIED | `include_router` lines identical to the base: 7 lines, `cmp` exit 0. They stay ahead of the middleware and static mount | `test_api_no_secrets.py::test_new_routes_never_echo_credential` asserts the seven required routes are mounted and sweeps every operation under the two prefixes | This story's slice: the routes are mounted and leak nothing. TC-COMP-126 is CAP-002-E3-S5's |
| DAC-E3-13 | SATISFIED | `app.py:199`, `207-209`, `213-219`. Routers are included before `_add_host_origin_middleware`. No other delivered API file under `src/` changed | TC-COMP-088 (`test_api_no_secrets.py`); TC-COMP-089 (T009 git checks rerun here) | — |
| DAC-E3-S6-1 | SATISFIED | `app.py:207-209` creates the task after `reclaim_task` (200-206). `213-219` cancel it, swallow `CancelledError` and log `Exception`, all before the unchanged reclaim block (220-224) and `pool.close()` (225) | `::test_classification_task_created_beside_reclaim_task` (creation order, line 98), `::test_both_tasks_cancelled_before_pool_close` (cancellation order, line 110), `::test_reclaim_cancelled_when_classification_task_already_finished`, `::test_reclaim_cancelled_and_pool_closed_when_classification_task_raised` | Both task orders are now pinned: r1 and r2 are killed. IR-001 records a late survivor in the error handler's type breadth |
| DAC-E3-S6-2 | SATISFIED | `app.py:199` builds `ClassificationSettings()` before either task exists. `app.py:208` passes keyword `pool` and `settings` only | `::test_loop_called_with_pool_and_environment_settings`; `::test_invalid_classification_settings_fail_startup_before_any_task` (variable named, value absent: line 206) | Mutants 1, 3, 4, r3, r5, r6, v2-1 and v2-c1 are killed |
| DAC-E3-S6-3 | SATISFIED | No production change. The routers belong to E1-S6 and E3-S5 | `::test_new_routes_never_echo_credential` (body, header values and DEBUG logs of every operation); `::test_secret_detector_fails_on_a_leaking_route_and_a_leaking_log` (canary) | Unchanged since v1. Enumerates through OpenAPI per DEC-0283 |
| DAC-E3-S6-4 | SATISFIED | `git diff -U0 ffec7a0 HEAD` over the three modified delivered files has no `-` line. Numstat is `15 0`, `116 0` and `12 0`, and all 11 hunks are `@@ -N,0 +M,K @@`. `app.py` is the only production file changed | T009 checks rerun here (Independent Validation) | The third delivered file, the test helper, is an owner-directed exception (DEC-0284, `decided_by: owner`). The plan's Other Notes record it. Additive only, no production change. The texts that still name two files are IR-003 |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `classification/settings.py` (`ClassificationSettings`, prefix `FACTORFLOW_CLASSIFICATION_`, 5.0 and 300.0, `ge=1`); `classification/scheduler.py` signature matches the call; `grep -n -i massive app.py` empty | Unchanged since v1. T007 case (5) applies |
| T002 | complete | VERIFIED | v1's baseline `8ee5571` is the parent of `38532a2` and is named in cycle-1 `red_evidence` | Recorded implicitly, as v1 noted |
| T003 | complete | VERIFIED | `test_api_classification_lifespan.py:81-156`, four TC-COMP-086 tests. Line 98 asserts `reclaim:start` before `classification:start`. Line 110 asserts `classification:cancelled` before `reclaim:cancelled` | v1 IR-001 and IR-002 resolved. Test 3's "created after the reclaim task" claim is asserted in Test 1. That is the same TC, and the order is deterministic, because `asyncio` starts tasks in creation order. Test 4 reads `exc_text` (DEC-0282) |
| T004 | complete | VERIFIED | `test_api_classification_lifespan.py:159-191` | Unchanged since v1. Every planned assertion is present |
| T005 | complete | VERIFIED | `test_api_no_secrets.py:30-139` | Unchanged since v1 (DEC-0283) |
| T006 | complete | VERIFIED | `test_api_classification_lifespan.py:194-208`. Line 206 asserts that no `0` remains once the variable name is removed from the message | v1 IR-003 resolved. The actual message is `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS: Input should be greater than or equal to 1` |
| T007 | complete | VERIFIED | `app.py:37-38`, `47`, `199`, `207-209`, `213-219` | Unchanged since v1. Insertions only |
| T008 | complete | VERIFIED | T008 unit command: 19 passed in 10.86 s, with the same slowest durations as v1 (4.02, 2.02, 2.02, 2.01 s). Postgres subset: 43 passed | Cycle 3 (DEC-0284) handles a delivered integration helper whose test raced the loop's start-up reclaim. The owner directed the fix, so it is not an unrecorded edit to a delivered test (Open Gap 3) |
| T009 | complete | VERIFIED | Rerun against `ffec7a0` (Independent Validation) | Additive-only, `include_router` unchanged, no `massive`. The file list now includes the DEC-0284 helper. T009's own text does not (IR-003) |
| T010 | complete | VERIFIED | ruff, ruff format, mypy and both suites clean | Neither test file cites DAC-E3-S6-4, as v1 recorded. TC-COMP-089 is a git verification, not a pytest case |
| T011 | complete | VERIFIED | Three cycles. `check-tdd-evidence.py --require-logs` gives 0 errors and 0 warnings. Cycle-2 and cycle-3 patch, log and results hashes were recomputed and match | Cycle-2 RED was observed with mutants. That is the right form for a test-only rework of correct production code |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_classification_task_created_beside_reclaim_task` / TC-COMP-086 | ADEQUATE | Real `_lifespan` under `asyncio.run`, with a recording pool and sleeping doubles. Both loops start after `pool:open`, reclaim first (line 98). Kills r2, r9, 7 and v2-1 | None |
| `test_both_tasks_cancelled_before_pool_close` / TC-COMP-086 | ADEQUATE | Classification is cancelled before reclaim, and both before `pool:close`. The exit is clean. Kills r1 and r7 | A missing `cancel()` hangs instead of failing (IR-002, LOW) |
| `test_reclaim_cancelled_when_classification_task_already_finished` / TC-COMP-086 | ADEQUATE | A loop that returns at once still leaves reclaim cancelled before `pool:close` | None. The creation-order claim is pinned by the first test |
| `test_reclaim_cancelled_and_pool_closed_when_classification_task_raised` / TC-COMP-086 | ADEQUATE | Exactly one ERROR record, from `factorflow.api.app`, with the exact message and the traceback in `exc_text`. Reclaim is cancelled before `pool:close`. Kills 6, 8, 9, 10, 11, 12, r4, v2-2 and v2-3 | The `late` survivor v2-4 (`except RuntimeError`) does not make it `WEAK` (IR-001, MEDIUM) |
| `test_loop_called_with_pool_and_environment_settings` / TC-COMP-087 | ADEQUATE | One call. Keyword set exactly `{pool, settings}`. Pool identity with `app.state.db_pool`. Settings equal `ClassificationSettings()` at 7.0 and 120.0. Kills 1, 3, 4, r5 and r6 | None |
| `test_invalid_classification_settings_fail_startup_before_any_task` / T006 (labelled TC-COMP-087) | ADEQUATE | `ConfigurationError` names the variable and, after the name is removed, carries no `0`. Neither double started. Kills r3 and v2-c1 | None. The substring check is stricter than needed and fails safe |
| `test_new_routes_never_echo_credential` / TC-COMP-088 | ADEQUATE | Unchanged since v1. Seven required routes asserted mounted. Every operation requested. Body, headers and DEBUG logs checked | Success bodies are deferred to the E1-S6 and E3-S5 integration tests, as planned |
| `test_secret_detector_fails_on_a_leaking_route_and_a_leaking_log` / TC-COMP-088 | ADEQUATE | Unchanged since v1. A leaking body, header and log line each make `_assert_no_secret` raise | None |
| `test_health_never_echoes_credential` (delivered) | ADEQUATE | Unchanged. Passes with the classification task in the lifespan | None |
| TC-COMP-089 (git verification, no pytest case) | ADEQUATE | Rerun against `ffec7a0`. No removed line, all hunks pure insertions, `include_router` identical, no `massive` | Its expected file list omits the DEC-0284 helper (IR-003) |
| `classification_app` helper (`tests/integration/api_classification_support.py`, DEC-0284) | ADEQUATE | Patches the module attribute `factorflow.api.app.run_classification_loop`, which `_lifespan` looks up at call time. `factorflow/api/__init__.py` is empty, so `app_module` is the module. The stand-in waits until cancelled, and `monkeypatch` undoes it per test | None. `test_the_sets_list_and_detail_agree` passed 40/40 repeats here, against 1 failure in 28 at `ea885eb` (`red-cycle-3.log`) |

Isolation and determinism: the lifespan tests use only `monkeypatch` doubles and an unreachable
database URL. The two order assertions depend only on asyncio's FIFO task start and on the
sequential `finally`. Every mutant baseline passed (4 of 4, 9 passed each).

### Mutation Testing

`mutation-run.py generate --range ffec7a0..HEAD` gives 0 mutants: no catalogue operator
matches the added `app.py` lines. `scope --since 38532a2 --previous …-v1-mutation.json` carries
the baseline's 21 manual mutants, all tagged `carried`. This review added five of its own. Run
through `scope` alone, the tool tags them all `late`, because none sits on a line changed since
`38532a2`. The run file hand-tags `v2-c1` as `delta`. That makes no difference, since it is
killed.

The run uses the story's focused suites: `uv run --offline --all-extras pytest tests/unit/test_api_classification_lifespan.py tests/unit/test_api_no_secrets.py -q -x -p no:cacheprovider`,
with `--jobs 4 --timeout 60 --stillborn-pattern 'IndentationError|SyntaxError'`. The results
are copied beside this report as `CAP-002-E3-S6-implementation-review-v2-mutation.json`
(sha256 `23212daa…09872f`).

| Mutant | Scope | Change | Result | Killed by / note |
|--------|-------|--------|--------|------------------|
| `app.py:199:manual:1` | carried | settings `None` | killed | `test_loop_called_with_pool_and_environment_settings` |
| `app.py:207:manual:2` | carried | first line of `create_task(` replaced | stillborn | `IndentationError`. r9 covers its intent |
| `app.py:208:manual:3` | carried | `settings` not passed | killed | TC-COMP-087 |
| `app.py:208:manual:4` | carried | `pool=None` | killed | TC-COMP-087 |
| `app.py:213:manual:5` | carried | `cancel()` → `pass` | timeout (60 s) | Suite hangs (IR-002) |
| `app.py:215:manual:6` | carried | task not awaited | killed | Test 4 |
| `app.py:217:manual:7` | carried | `CancelledError` re-raised | killed | Test 1 |
| `app.py:218:manual:8` | carried | `except ValueError` | killed | Test 4 |
| `app.py:219:manual:9`, `:10`, `:11` | carried | not logged / message changed / INFO | killed | Test 4 |
| `app.py:47:manual:12` | carried | logger name `other` | killed | Test 4 |
| `app.py:213:manual:r1` | carried | reclaim block before classification block | **killed** | `test_both_tasks_cancelled_before_pool_close` (`assert 4 < 3`). Survived at v1 |
| `app.py:200:manual:r2` | carried | classification task created first | **killed** | `test_classification_task_created_beside_reclaim_task` (`assert 2 < 1`). Survived at v1 |
| `app.py:199:manual:r3` | carried | settings built inline, after the reclaim task | killed | T006 test |
| `app.py:219:manual:r4` | carried | `_log.error` (no traceback) | killed | Test 4 |
| `app.py:208:manual:r5` | carried | extra `stop_event=None` | killed | TC-COMP-087 |
| `app.py:199:manual:r6` | carried | `ClassificationSettings.model_construct()` | killed | TC-COMP-087 |
| `app.py:213:manual:r7` | carried | classification block after `pool.close()` | killed | Test 2 |
| `app.py:213:manual:r8` | carried | `cancel()` removed | timeout (60 s) | Suite hangs (IR-002) |
| `app.py:207:manual:r9` | carried | loop never created | killed | Test 1 |
| `config/settings.py:66:manual:v2-c1` | late | configuration error carries the submitted value (the coder's cycle-2 r3, rerun) | killed | T006 test, line 206 (`'0' is contained here: … (input '0')`) |
| `app.py:208:manual:v2-1` | late | positional `(pool, classification_settings)` | killed | Test 1. The keyword-only double raises `TypeError` |
| `app.py:219:manual:v2-2` | late | logged error re-raised | killed | Test 4 (`RuntimeError: start-up reclaim failed` escapes) |
| `app.py:219:manual:v2-3` | late | `_log.warning(…, exc_info=True)` | killed | Test 4 (`assert 0 == 1`) |
| `app.py:218:manual:v2-4` | late | `except Exception` → `except RuntimeError` | **survived** | Non-equivalent (IR-001) |

Totals: 26 mutants. 22 killed, 2 timed out, 1 was stillborn and 1 survived. Both timeouts
count as detected, because the suite never passes. The survivor v2-4 is not equivalent. Plan
T007 (4) prescribes `except Exception`, and Open Gap 6 requires that any exception the task
already ended with is logged while the reclaim block and `pool.close()` still run. The start-up
reclaim's realistic failure is `psycopg_pool.PoolTimeout`. Its MRO, checked here, is
`PoolTimeout → OperationalError → DatabaseError → Error → Exception`, which is not a
`RuntimeError`. The survivor is `late`: line 218 is unchanged since `38532a2`, and Test 4's
`RuntimeError` double (line 136) is the one plan T003 Test 4 prescribes. So it does not make
Test 4 `WEAK`, and its finding is capped at MEDIUM.

## Independent Validation

`uv` commands ran outside the sandbox, one plain call each. Inside the sandbox uv's cache is
refused: `error: Failed to initialize cache at /Users/alvarodejodra/.cache/uv … failed to open file … sdists-v9/.git: Operation not permitted (os error 1)`.
`<C>` is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-002-run-913c58/repos/factorflow-v2/FactorFlow-v2`,
and `<H>` is the harness root `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-002-run-913c58`.
Every `uv run` below is `uv run --directory <C> --offline --all-extras … -p no:cacheprovider`
(pytest) or `uv run --directory <C> --offline --all-extras …` (others).

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/check-tdd-evidence.py --evidence <story dir>/CAP-002-E3-S6-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base ffec7a0182ace897b1732664abcf7ea8d9de4d19 --decisions-dir projects/factorflow-v2/decisions --require-logs` | `<H>` | 0 | PASS | 0 errors, 0 warnings |
| `pytest tests/unit/test_api_classification_lifespan.py tests/unit/test_api_no_secrets.py -v` | `<H>` | 0 | PASS | 9 passed |
| `pytest tests/unit/test_api_classification_lifespan.py -k "created or cancel" -q` (DAC-E3-S6-1) | `<H>` | 0 | PASS | 4 passed, 2 deselected |
| `pytest tests/unit/test_api_classification_lifespan.py -k "settings" -q` (DAC-E3-S6-2) | `<H>` | 0 | PASS | 2 passed, 4 deselected |
| `pytest tests/unit/test_api_no_secrets.py -q` (DAC-E3-S6-3) | `<H>` | 0 | PASS | 3 passed |
| T008: `pytest tests/unit/test_api_no_secrets.py tests/unit/test_api_request_id.py tests/unit/test_api_request_id_redaction_composition.py tests/unit/test_api_instruments_query_mapping.py tests/unit/test_api_instruments_error_mapping.py tests/unit/test_api_reclaim_lifespan.py tests/unit/test_api_isolation.py --durations=10 -q` | `<H>` | 0 | PASS | 19 passed in 10.86 s. Slowest durations match v1's base and HEAD measurements |
| T008: `pytest -m postgres tests/integration/test_api_health.py tests/integration/test_api_runs.py tests/integration/test_api_settings.py tests/integration/test_api_static_mount.py -q` | `<H>` | 0 | PASS | 43 passed, 4 deselected (testcontainers `postgres:16`) |
| `pytest -m "not postgres" -q` | `<H>` | 0 | PASS | 1636 passed, 919 deselected, 1 xfailed (29.65 s) |
| `pytest -m postgres -q` | `<H>` | 0 | PASS | 919 passed, 1637 deselected (305.46 s) |
| `ruff check .` | `<H>` | 0 | PASS | All checks passed |
| `ruff format --check .` | `<H>` | 0 | PASS | 279 files already formatted |
| `mypy src` | `<H>` | 0 | PASS | No issues in 61 source files |
| T009: `git -C <C> diff --name-status ffec7a0 HEAD -- . ':!docs'`; `diff --numstat`; `diff -U0 … \| grep -E '^-[^-]'`; hunk headers; `include_router` lines at base and HEAD (`cmp`); `grep -n -i massive app.py` | `<H>` | 0 (grep: 1, no match) | PASS | Code files: `M app.py`, `M api_classification_support.py`, `A test_api_classification_lifespan.py`, `M test_api_no_secrets.py`. Numstat `15 0`, `12 0`, `116 0`. No removed line. 11 hunks, all `-N,0`. `include_router` 7 lines, identical. No `massive` |
| `pytest -m postgres tests/integration/test_api_classifications.py tests/integration/test_api_classification_summary.py tests/integration/test_api_universes.py tests/integration/test_api_classification_host_origin.py -q` | `<H>` | 0 | PASS (evidence) | 52 passed. These are the suites that use the DEC-0284 helper, plus the other classification and universes API suites |
| `<scratch>/repeat.sh 40 tests/integration/test_api_classifications.py::test_the_sets_list_and_detail_agree` | `<H>` | 0 | PASS (evidence) | 0 failures in 40 (DEC-0284 fix) |
| `<scratch>/repeat.sh 30 tests/integration/test_api_universes.py tests/integration/test_api_runs.py` | `<H>` | 0 | PASS (evidence) | 0 failures in 30 (52 passed each). These suites still run the real loop. See Scope and Plan Deviations |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range ffec7a0..HEAD --cycle review --out <scratch>/mutants-gen.json` | `<H>` | 0 | PASS | 0 mutants |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants-gen.json --since 38532a281dd0212f8c780f13c370d710c0dc2b4f --previous <story dir>/CAP-002-E3-S6-implementation-review-v1-mutation.json --out <scratch>/mutants-scoped.json` | `<H>` | 0 | PASS | 21 carried; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <C> --mutants <scratch>/mutants-review.json --jobs 4 --timeout 60 --stillborn-pattern "IndentationError\|SyntaxError" --command '<focused command above>' --out <scratch>/results-review.json --logs <scratch>/mutation-logs` | `<H>` | 3 | FAIL (evidence) | 26 mutants: 22 killed, 2 timeout, 1 stillborn, 1 survived (v2-4, `late`) |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | `<H>` | 0 | PASS | `sha256:7f0afbb6…3cc33255`, equal to the approval's `reviewed_revision` |
| `python3 scripts/artifact-gate.py require --project factorflow-v2 --artifact <story>` | `<H>` | 0 | PASS | Gate passed (owner-allowed) |
| `uv build` | — | N/A | NOT RUN | The plan marks it not required: the story changes no packaging |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format` | — | N/A | NOT RUN | The story changes no frontend file. Its Validation section and the plan's Validation Plan list only the Python commands. `npm run test` also writes into the API's static directory (tech stack), which would alter the review subject |

The 13 required commands are the TDD lint, the focused suites, the three story-specific
selections, T008's two commands, the two suites, ruff, ruff format, mypy and T009's git checks.
The mutation run is review evidence, not a required command. Its survivor is reported as
IR-001.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E3-S6-run-20261104T230816Z`, HEAD `fb65f5e`, `git status --porcelain=v1 -uall` empty, `code-revision` `sha256:bfb8da027b1c3ee9b7cdda498e915b98e7e6f36eaef0e9bf2026d2cedf1cdd7d`.
- After: identical HEAD, empty status, identical `code-revision`. Mutants ran in clones under `$TMPDIR`. Scripts, mutant files, results and logs live in the session scratchpad.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 2 · **total 3**

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | late | The raised-task test uses only a `RuntimeError`, so a handler narrowed to `RuntimeError` survives |
| IR-002 | LOW | carried | A missing `cancel()` hangs the lifespan suite instead of failing it (v1 IR-005) |
| IR-003 | LOW | delta | T009, TC-COMP-089 and DAC-E3-S6-4 still name two delivered files after DEC-0284 added a third |

### IR-001 — The raised-task test uses only a `RuntimeError`, so a handler narrowed to `RuntimeError` survives

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-1, AC-10
- **Tasks**: T003 (Test 4), T007 (4)
- **Files**: `tests/unit/test_api_classification_lifespan.py:129-156` (`test_reclaim_cancelled_and_pool_closed_when_classification_task_raised`, `boom` at line 136); `src/factorflow/api/app.py:218-219`
- **Claim challenged**: TC-COMP-086 Test 4 proves that a task already ended with an exception is logged, and that the reclaim block and `pool.close()` still run (plan Open Gap 6).
- **Observed evidence**: Mutant `app.py:218:manual:v2-4` replaces `except Exception:` with `except RuntimeError:`, and it passes all 9 tests (`9 passed`). The test's only error is `RuntimeError("start-up reclaim failed")`. The failure that motivates the handler is the start-up `reclaim_interrupted_sets` call failing on the pool. That raises `psycopg_pool.PoolTimeout`, whose MRO, checked here, is `OperationalError → DatabaseError → Error → Exception`, with no `RuntimeError`. Under the mutant, such an error would escape the `finally` before the reclaim block and `pool.close()`.
- **Expected evidence/behavior**: Plan T007 (4) prescribes `except Exception: _log.exception(...)`. Its stated reason is that the task "can end on its own with an exception before shutdown", and Open Gap 6 states the same for any exception.
- **Impact**: A later narrowing of the handler would let a real database failure at start-up skip `pool.close()` and fail shutdown, with every gate green. The production code is correct today.
- **Required remediation**: Optional, non-blocking (`late`). Make Test 4, or a second case, raise an exception outside `RuntimeError`, such as a `psycopg.OperationalError`, so that v2-4 is killed.

### IR-002 — A missing `cancel()` hangs the lifespan suite instead of failing it (v1 IR-005)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-1
- **Tasks**: T003
- **Files**: `tests/unit/test_api_classification_lifespan.py:41-50` (`_sleeping_loop`), `:73-78` (`_enter_and_leave`)
- **Claim challenged**: TC-COMP-086 detects a classification task that is not cancelled on shutdown.
- **Observed evidence**: Mutants `app.py:213:manual:5` and `manual:r8` both ran to the 60 s timeout here, as they reached v1's 120 s. The sleeping double waits on an `Event` that is never set, and the project installs no pytest timeout. The rework did not touch this. The coder's code review records it as "IR-005 (optional) not addressed".
- **Expected evidence/behavior**: Plan T003 Test 2 expects the `async with` to exit without raising. A failing assertion would report the regression better than a hang.
- **Impact**: The regression is detected, but as a stalled CI job with no message.
- **Required remediation**: Optional. Bound the shutdown in the test, for example with `asyncio.wait_for`, so that a missing cancel fails with a message.

### IR-003 — T009, TC-COMP-089 and DAC-E3-S6-4 still name two delivered files after DEC-0284 added a third

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-4, DAC-E3-13
- **Tasks**: T009
- **Files**: `tests/integration/api_classification_support.py` (+12 since v1); plan T009 and Notes › Other Notes ("Change set added by DEC-0284"); `classification-api-tests.md` TC-COMP-089; story DAC-E3-S6-4; `projects/factorflow-v2/decisions/DEC-0284.md`
- **Claim challenged**: T009 is checked complete. As written, its check expects `git diff --stat B` to list, among delivered files, only `app.py` and `test_api_no_secrets.py`.
- **Observed evidence**: `git diff --name-status ffec7a0 HEAD -- . ':!docs'` also lists `M tests/integration/api_classification_support.py`, a delivered CAP-002-E3-S5 helper. The owner authorised it (DEC-0284, `decided_by: owner`, which "is added to S6's change set"), and a plan note records it. T009's expected list, TC-COMP-089's expected result and the approved story's DAC-E3-S6-4 still read "no delivered file other than `app.py` and `test_api_no_secrets.py`". The change is additive (`12 0`, pure-insertion hunks) and touches no production code.
- **Expected evidence/behavior**: The plan's recorded verification should pass as written against the change set the owner approved. Constraint 7 requires bidirectional traceability.
- **Impact**: Evidence quality only. A later reader who reruns T009 as written sees it fail, and must find DEC-0284 to learn why. The spec-drift reviewer flagged the same gap in `spec-drift-cycle-2-3.txt`.
- **Required remediation**: Reconcile T009's expected file list with the DEC-0284 note, for example by naming the helper as the owner-directed exception. Whether the approved story or TC-COMP-089 is amended is the owner's call. Doc Sync can carry the note.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `test_api_classification_lifespan.py:98` asserts `reclaim:start` before `classification:start`. Mutant r2 is killed (`assert 2 < 1`) |
| v1/IR-002 | RESOLVED | `test_api_classification_lifespan.py:110` asserts `classification:cancelled` before `reclaim:cancelled`. Mutant r1 is killed (`assert 4 < 3`) |
| v1/IR-003 | RESOLVED | `test_api_classification_lifespan.py:206`. Mutant v2-c1 (message carries `(input '0')`) is killed |
| v1/IR-004 | RESOLVED | Cycle 2 uses three well-formed mutants and commits its 3 baseline and 3 mutant logs. Hashes were recomputed and match `mutation-cycle-2-results.json`. The remediation applied to "the next cycle's evidence". The cycle-1 entry is historical and unchanged |
| v1/IR-005 | STILL OPEN | Mutants 5 and r8 still time out. Carried as IR-002 (LOW) |

## Scope and Plan Deviations

- **Owner-directed, recorded:** DEC-0284 (`decided_by: owner`) adds
  `tests/integration/api_classification_support.py` to the change set. Its
  `classification_app` swaps `run_classification_loop` for a stand-in that waits until it is
  cancelled. The real loop's start-up reclaim (DAC-E2-12) raced the `building` sets those
  tests seed after the app starts: 1 failure in 28 at `ea885eb` (`red-cycle-3.log`), none in
  60 after the fix (`green-cycle-3.log`), and none in 40 here. The flake was latent from cycle 1,
  because `38532a2` starts the loop. v1's single postgres run (919 passed) did not catch it.
  The mismatch with T009 and the approved texts is IR-003.
- **Residual exposure, observed:** the stand-in covers only the two suites that use
  `classification_app`. Those are the only API suites that seed `building` sets (`grep`
  over `tests/integration/test_api_*.py`). `test_api_universes.py` and `test_api_runs.py`
  still run the real loop over seeded `succeeded` runs. `seed_set` inserts a run and then its
  set as two autocommit statements, and `classification_set.run_id` is `UNIQUE`. A loop claim
  between the two inserts would therefore fail the second one. Thirty repeats of both suites
  gave no failure, so no flake is shown. This is recorded as residual risk, not as a finding.
  If one appears, the DEC-0284 remedy extends to those fixtures.
- **Justified, recorded (unchanged since v1):** DEC-0282 (Test 4 reads `exc_text`) and
  DEC-0283 (OpenAPI enumeration; canary route ahead of the static mount).
- **Bookkeeping:** Commit `ea885eb` was committed while the postgres suite was known to fail
  intermittently. Its message says so, and the coder's code review records it as Low. The
  branch head is green, and cycle-2's GREEN names its tree, `71bfec3`. Cycle-2 RED is
  "observed after the fact" with mutants, against the v1 tests and the reworked ones
  (`red-cycle-2.log`). That is sound for a test-only rework. As v1 noted, T010 claims both
  test files cite DAC-E3-S6-4 and neither does, and the T006 test is labelled
  `# Implements TC-COMP-087`.
- **Out of scope:** none. No production file changed since v1. No dependency, configuration
  or packaging change. The merge `71bfec3` introduced only `ffec7a0`'s own content
  (CAP-002-E5-S1, `web/` and its story docs), none of which is in `origin/main..HEAD`'s diff.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run doc sync for CAP-002-E3-S6 against this report. Carry the DEC-0284
  change-set exception (IR-003) into the documentation it touches. IR-001 and IR-002 are
  optional test hardening. Neither blocks.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003
