---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S6-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-05
updated: 2026-11-05
story_id: "CAP-002-E3-S6"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S6.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-05T00:06:02Z"
reviewed_head: "38532a281dd0212f8c780f13c370d710c0dc2b4f"
review_base: "8ee557175e91eb8b02fecc88595698507b79e8a0"
reviewed_state_revision: "sha256:b178c8d1d7475ecadfd1543a7529af922ba9f8a33eef8016525f009fcd3a9b21"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-05T00:06:02Z
  source_artifacts:
    - id: CAP-002-E3-S6
      version: "1 (sha256:7f0afbb68703054f8ae8dfc206818d03208959877e03e37179ff3f581cc33255)"
    - id: CAP-002-E3-S6-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E3-S6-tdd-evidence
      version: "cycle-1"
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
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E3-S6 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 7/7 satisfied |
| Planned tasks | 9/11 verified |
| Required validation | 12/12 passed |

The production change is correct and confined to what the story allows.
`src/factorflow/api/app.py` gains 15 lines and loses none. Every hunk is a
pure insertion, the `include_router` block is byte-identical to the base, and
the lifespan creates, cancels and awaits the classification task as DAC-E3-S6-1
and DAC-E3-S6-2 require. The new no-secrets sweep reaches all 14 operations the
two routers mount. Every required command passes when rerun here: the non-postgres
suite (1636 passed, 1 xfailed), the postgres suite (919 passed), ruff, ruff format,
mypy, the story-specific selections, T008's suites and T009's git checks. The TDD
evidence lint is clean. The delivered lifespan suites take exactly as long as at
the base.

The gate fails on the tests. TC-COMP-086 is `WEAK`. It does not pin the two task
orders that the task plan and design 2.3 fix, so two hand-written mutants survive
the story's suites:

- creating the classification task before the reclaim task (IR-001). The plan's
  Test 3 names this as one of its claims, and the test omits it.
- cancelling the reclaim task before the classification task (IR-002). Plan T007 (4)
  and the plan's Resolved Conflicts fix the order: classification, then reclaim,
  then `pool.close()`.

The T006 test also leaves out one planned assertion: that the error message does
not carry the value (IR-003). Each gap needs one assertion. No production change
is required.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S6.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`; also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S6-run-20261104T230816Z` |
| HEAD | `38532a281dd0212f8c780f13c370d710c0dc2b4f` (one commit over the base: `story-coding(CAP-002-E3-S6): classification scheduler task in the API lifespan; no-secrets sweep over the new routes`, trailers `Decision-Id: DEC-0282`, `Decision-Id: DEC-0283`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261104T230816Z` → `8ee557175e91eb8b02fecc88595698507b79e8a0` (`pipeline-state.py review-base --base-ref …`; ancestor of HEAD, checked with `git merge-base --is-ancestor`) |
| Working tree | Clean before and after validation (`git status --porcelain=v1 -uall` empty; `code-revision` fingerprint `sha256:b178c8d1…9b21` unchanged) |
| Changed files reviewed | 13 |
| Baseline | none: initial review |

`pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261104T230816Z`
reports `READY — story is ready for independent review`. Without `--base-ref`, it
reports `BLOCKED — story coding has not reached in-review`, because its TDD lint
then resolves the base against the remote default branch. The same happened for
CAP-002-E3-S5.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/app.py` | modified (15 added, 0 deleted) | AC-10, DAC-E3-13, DAC-E3-S6-1, DAC-E3-S6-2, DAC-E3-S6-4; T007 (1) to (5) |
| `tests/unit/test_api_classification_lifespan.py` | added | DAC-E3-S6-1, DAC-E3-S6-2; T003, T004, T006 |
| `tests/unit/test_api_no_secrets.py` | modified (116 added, 0 deleted) | DAC-E3-S6-3, DAC-E3-13; T005 |
| `…/stories/CAP-002-E3-S6.md` | modified | status `planning` → `in-review` (story-coding hand-off; content revision unchanged, gate still passes) |
| `…/stories/CAP-002-E3-S6-tasks.md` | modified | 11 checkboxes ticked (T001 to T011) |
| `…/stories/CAP-002-E3-S6-tdd-evidence.yaml` | added | T011 |
| `…/stories/CAP-002-E3-S6-evidence/cycle-1.patch` | added | T011 (reviewed patch) |
| `…/stories/CAP-002-E3-S6-evidence/red-cycle-1.log` | added | T011 |
| `…/stories/CAP-002-E3-S6-evidence/green-cycle-1.log` | added | T011 |
| `…/stories/CAP-002-E3-S6-evidence/code-review-cycle-1.txt` | added | T011 |
| `…/stories/CAP-002-E3-S6-evidence/spec-drift-cycle-1.txt` | added | T011 |
| `…/stories/CAP-002-E3-S6-evidence/mutation-cycle-1-mutants.json` | added | T011 (mutation evidence) |
| `…/stories/CAP-002-E3-S6-evidence/mutation-cycle-1-results.json` | added | T011 (mutation evidence; see IR-004) |

No `dependencies.yaml` change is in the range. The plan's new E2-S8 edge was
committed with the plan.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `src/factorflow/api/app.py:207-209` creates `run_classification_loop(pool=pool, settings=classification_settings)` as a task in `_lifespan`; lines 213-219 cancel and await it | `test_api_classification_lifespan.py::test_classification_task_created_beside_reclaim_task`, `::test_loop_called_with_pool_and_environment_settings` | Start side only, as the story scopes it. The loop is CAP-002-E2-S9's (`classification/scheduler.py:91`, signature matches the call) |
| AC-16 | SATISFIED | `app.py:485-486` `include_router` calls unchanged from the base, ahead of the middleware and static mount (`app.py:488-490`) | `test_api_no_secrets.py::test_new_routes_never_echo_credential` asserts the seven required routes are mounted and sweeps all 14 operations | This story's slice: the routes are mounted and leak nothing. Router registration behind the middleware is TC-COMP-126 (CAP-002-E3-S5) |
| DAC-E3-13 | SATISFIED | `app.py:199`, `207-209`, `213-219`; routers included before `_add_host_origin_middleware`; `git diff --name-status 8ee5571 HEAD` lists no other delivered API file | `test_api_no_secrets.py` (TC-COMP-088); T009 git checks (TC-COMP-089) | — |
| DAC-E3-S6-1 | SATISFIED | `app.py:207-209` creates the task after `reclaim_task` (200-206); `213-219` cancels it, swallows `CancelledError` and logs `Exception`, before the unchanged reclaim block (220-224) and `pool.close()` (225) | `::test_classification_task_created_beside_reclaim_task`, `::test_both_tasks_cancelled_before_pool_close`, `::test_reclaim_cancelled_when_classification_task_already_finished`, `::test_reclaim_cancelled_and_pool_closed_when_classification_task_raised` | The behaviour is correct, and creation, cancellation and the swallowed `CancelledError` are pinned. The two task orders the plan fixes are not pinned (IR-001, IR-002) |
| DAC-E3-S6-2 | SATISFIED | `app.py:199` `ClassificationSettings()` built before either task; `app.py:208` keyword `pool` and `settings` only | `::test_loop_called_with_pool_and_environment_settings` (kwargs exactly `{pool, settings}`; pool is `app.state.db_pool`; settings equal `ClassificationSettings()` with non-default 7.0 and 120.0); `::test_invalid_classification_settings_fail_startup_before_any_task` | T006's "not the value" assertion is missing (IR-003) |
| DAC-E3-S6-3 | SATISFIED | No production change. The routers belong to E1-S6 and E3-S5 | `test_api_no_secrets.py::test_new_routes_never_echo_credential` (body, headers and DEBUG logs of all 14 operations); `::test_secret_detector_fails_on_a_leaking_route_and_a_leaking_log` (canary) | Enumerates from OpenAPI per DEC-0283. Verified independently: on FastAPI 0.141.1, `app.routes` holds `_IncludedRouter` wrappers and no route under the two prefixes |
| DAC-E3-S6-4 | SATISFIED | `git diff -U0 8ee5571 HEAD -- app.py test_api_no_secrets.py`: no `-` line; numstat `15 0` and `116 0`; all seven hunks `@@ -N,0 +M,K @@` | T009 checks rerun here (Independent Validation) | Only `app.py` and `test_api_no_secrets.py` among delivered files; the third code file is the new lifespan test |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `classification/settings.py` (`ClassificationSettings`, prefix `FACTORFLOW_CLASSIFICATION_`, 5.0/300.0, `ge=1`); `classification/scheduler.py:91` signature `(pool, settings, wait_fn=None, dispatch_fn=None, stop_event=None)`; `grep -rn massive` over both modules and `app.py` empty | `app.py` had no module-level logger at the base (only inline `getLogger` calls and a local `log`), so T007 case (5) applies |
| T002 | complete | VERIFIED | Base `8ee5571` is the coding commit's parent and is named in `red_evidence` | The baseline is recorded implicitly, not as a labelled T002 entry |
| T003 | complete | PARTIAL | `test_api_classification_lifespan.py:81-152`, four TC-COMP-086 tests | Test 3 omits the plan's "the classification task is created after the reclaim task" (IR-001). No test pins the cancellation order (IR-002). Test 4 reads `exc_text` in place of `exc_info[1] is boom`, a justified deviation (DEC-0282; `config/redaction.py:44-50` clears `exc_info`) |
| T004 | complete | VERIFIED | `test_api_classification_lifespan.py:155-187` | Every planned assertion is present. Kills mutants 1, 3, 4, r5 and r6 |
| T005 | complete | VERIFIED | `test_api_no_secrets.py:30-139`: `_FakePool`, `_assert_no_secret`, `_new_routes`, `_fill`, sweep and canary; additive only | Enumeration through `app.openapi()` and the canary route moved ahead of the static mount, a justified deviation (DEC-0283). The 14 operations swept match the 14 decorators in `routes/universes.py` and `routes/classifications.py`. None sets `include_in_schema=False` |
| T006 | complete | PARTIAL | `test_api_classification_lifespan.py:190-202` | Asserts `ConfigurationError`, the variable name and that neither loop started. Omits the planned "and not the value" (IR-003). Kills mutant r3 |
| T007 | complete | VERIFIED | `app.py:37-38` imports; `47` `_log`; `199` settings local; `207-209` task; `213-219` cancel, await, `CancelledError` pass, `Exception` logged | Insertions only. Cases (1) to (5) as planned. No done-callback, retry, `include_router` or `_VALIDATION_ERROR_RESOURCES` change. Formatting accepted by `ruff format --check` without touching existing lines |
| T008 | complete | VERIFIED | T008 unit command: 19 passed in 10.82 s at HEAD against 17 passed in 10.79 s at the base, with identical per-test durations (4.02, 2.02, 2.02, 2.01 s); postgres subset 43 passed | The extra classification task adds no measurable shutdown delay |
| T009 | complete | VERIFIED | Git checks rerun here (Independent Validation) | — |
| T010 | complete | VERIFIED | ruff, ruff format, mypy and both suites clean; no file beyond the planned three code files | Neither test file cites DAC-E3-S6-4. It has no pytest case: TC-COMP-089 is a git verification. Recorded under Scope and Plan Deviations |
| T011 | complete | VERIFIED | `CAP-002-E3-S6-tdd-evidence.yaml` (one cycle, `commit_hash: stage`, `code_review_verdict: APPROVED`, `drift_detected: false`); `check-tdd-evidence.py --require-logs` 0 errors and 0 warnings | The cycle's mutation summary counts a stillborn mutant as killed and cites absent baseline logs (IR-004) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_classification_task_created_beside_reclaim_task` / TC-COMP-086 | WEAK | Real `_lifespan` under `asyncio.run` with a recording pool and sleeping doubles. Both loops start after `pool:open`. Kills r9 (loop never created) and 7 | Does not assert `reclaim:start` before `classification:start`. Survivor r2 (IR-001) |
| `test_both_tasks_cancelled_before_pool_close` / TC-COMP-086 | WEAK | Both doubles record `…:cancelled` before `pool:close`, and the exit is clean. Kills r7 (classification cancelled after `pool.close()`) | Does not assert `classification:cancelled` before `reclaim:cancelled`. Survivor r1 (IR-002). A missing `cancel()` hangs rather than fails (IR-005) |
| `test_reclaim_cancelled_when_classification_task_already_finished` / TC-COMP-086 | WEAK | A loop that returns at once still leaves reclaim cancelled before `pool:close` | Omits the planned "created after the reclaim task" claim (IR-001) |
| `test_reclaim_cancelled_and_pool_closed_when_classification_task_raised` / TC-COMP-086 | ADEQUATE | Exactly one ERROR record, from logger `factorflow.api.app`, with the exact message and the traceback in `exc_text`; reclaim cancelled before `pool:close`. Kills 6, 8, 9, 10, 11, 12 and r4 | None. `exc_text` replaces `exc_info` per DEC-0282, a derivation confirmed against `config/redaction.py:44-50` |
| `test_loop_called_with_pool_and_environment_settings` / TC-COMP-087 | ADEQUATE | One call. Keyword set exactly `{pool, settings}`. Pool identity with `app.state.db_pool`. Settings equal `ClassificationSettings()` with non-default 7.0 and 120.0. Kills 1, 3, 4, r5 and r6 | None |
| `test_invalid_classification_settings_fail_startup_before_any_task` / T006 (labelled TC-COMP-087) | WEAK | `ConfigurationError` names the variable, and neither double started. Kills r3 (settings built after the reclaim task exists) | The planned "message does not carry the value" assertion is absent (IR-003) |
| `test_new_routes_never_echo_credential` / TC-COMP-088 | ADEQUATE | Seven required routes asserted mounted. All 14 operations requested; each answers 422 or 500 through the envelope. Body, header values and DEBUG `caplog.text` checked for the secret. Redaction is not installed (no lifespan), so the log check runs on raw records | Success bodies are out of reach with a fake pool; the plan defers them to the E1-S6 and E3-S5 integration tests |
| `test_secret_detector_fails_on_a_leaking_route_and_a_leaking_log` / TC-COMP-088 | ADEQUATE | A leaking route's body, a leaking header and a leaking log line each make `_assert_no_secret` raise. The route must answer with the secret for the first `raises` to hold | None |
| `test_health_never_echoes_credential` (delivered) | ADEQUATE | Unchanged; passes with the classification task now in the lifespan | None |
| TC-COMP-089 (git verification, no pytest case) | ADEQUATE | Rerun here: no removed line, all hunks pure insertions, `include_router` lines identical, no `massive` in `app.py` | None |

Isolation and determinism: the lifespan tests patch `ConnectionPool`,
`_run_reclaim_loop` and `run_classification_loop` through `monkeypatch`, and set
the database URL to an unreachable address. No connection, network call or
timer is involved. Two runs gave identical results.

### Mutation Testing

`mutation-run.py generate --range 8ee5571..HEAD` produced 0 mutants: the
catalogue has no operator for the added `app.py` lines. The run therefore uses
manual mutants: the coder's twelve, rerun unchanged, and nine added by this
review (`r1` to `r9`). The results are copied beside this report as
`CAP-002-E3-S6-implementation-review-v1-mutation.json`. Command: `uv run --offline --all-extras pytest tests/unit/test_api_classification_lifespan.py tests/unit/test_api_no_secrets.py -q -x -p no:cacheprovider`,
`--jobs 4 --timeout 120 --stillborn-pattern 'IndentationError|SyntaxError'`. All
four baselines passed (9 passed).

| Mutant | Change | Result | Killed by / note |
|--------|--------|--------|------------------|
| `app.py:199:manual:1` | settings `None` | killed | `test_loop_called_with_pool_and_environment_settings` |
| `app.py:207:manual:2` | first line of `create_task(` replaced | **stillborn** | `IndentationError`; the coder's results record it as killed (IR-004). Its intent is covered by r9 |
| `app.py:208:manual:3` | `settings` not passed | killed | `test_loop_called_with_pool_and_environment_settings` |
| `app.py:208:manual:4` | `pool=None` | killed | `test_loop_called_with_pool_and_environment_settings` |
| `app.py:213:manual:5` | `classification_task.cancel()` → `pass` | timeout (120 s) | Suite hangs (IR-005) |
| `app.py:215:manual:6` | task not awaited | killed | `test_reclaim_cancelled_and_pool_closed_when_classification_task_raised` |
| `app.py:217:manual:7` | `CancelledError` re-raised | killed | `test_classification_task_created_beside_reclaim_task` |
| `app.py:218:manual:8` | `except ValueError` | killed | `test_reclaim_cancelled_and_pool_closed_when_classification_task_raised` |
| `app.py:219:manual:9` | error not logged | killed | same |
| `app.py:219:manual:10` | message changed | killed | same |
| `app.py:219:manual:11` | logged at INFO | killed | same |
| `app.py:47:manual:12` | logger name `other` | killed | same |
| `app.py:213:manual:r1` | reclaim cancel block moved ahead of the classification block | **survived** | Non-equivalent (IR-002) |
| `app.py:200:manual:r2` | classification task created before the reclaim task | **survived** | Non-equivalent (IR-001) |
| `app.py:199:manual:r3` | settings built inline, after the reclaim task exists | killed | `test_invalid_classification_settings_fail_startup_before_any_task` |
| `app.py:219:manual:r4` | `_log.error` (no traceback) | killed | `test_reclaim_cancelled_and_pool_closed_when_classification_task_raised` (`exc_text` is `None`) |
| `app.py:208:manual:r5` | extra `stop_event=None` keyword | killed | `test_loop_called_with_pool_and_environment_settings` |
| `app.py:199:manual:r6` | `ClassificationSettings.model_construct()` | killed | same (defaults 5.0 and 300.0 instead of 7.0 and 120.0) |
| `app.py:213:manual:r7` | classification block after `pool.close()` | killed | `test_both_tasks_cancelled_before_pool_close` |
| `app.py:213:manual:r8` | `cancel()` line removed | timeout (120 s) | Suite hangs (IR-005) |
| `app.py:207:manual:r9` | `create_task(asyncio.sleep(0))`, loop never created | killed | `test_classification_task_created_beside_reclaim_task` |

Totals: 21 mutants: 16 killed, 2 timeout, 1 stillborn, 2 survived. The two
timeouts count as detected, because the suite never passes. Neither survivor is
equivalent:

- **r2.** Design 2.3 places the new task "in `_lifespan`, after `reclaim_task` is
  created". Plan T007 (3) inserts it "immediately after the closing parenthesis of
  the existing `reclaim_task = asyncio.create_task(...)` statement". Plan T003
  Test 3 lists "the classification task is created after the reclaim task" among
  the claims the test must prove.
- **r1.** Plan T007 (4) fixes "classification block, then the unchanged reclaim
  block, then the unchanged `pool.close()`". The plan's Resolved Conflicts adopt
  this as "the design's cancellation order (classification first, then reclaim,
  then `pool.close()`)", from design 2.3's `for task in (classification_task, reclaim_task)`.

Both orders are observable with the file's own doubles: the `events` list
records `…:start` and `…:cancelled` in execution order.

## Independent Validation

`uv` commands ran outside the sandbox as one plain call each. Inside the sandbox,
uv's cache is refused: `error: Failed to initialize cache at /Users/alvarodejodra/.cache/uv … failed to open file … sdists-v9/.git: Operation not permitted (os error 1)`.
`<C>` is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-002-run-7f9510/repos/factorflow-v2/FactorFlow-v2`.
`<H>` is the harness root, `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-002-run-7f9510`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/check-tdd-evidence.py --evidence <story dir>/CAP-002-E3-S6-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 8ee557175e91eb8b02fecc88595698507b79e8a0 --decisions-dir projects/factorflow-v2/decisions --require-logs` | `<H>` | 0 | PASS | 0 errors, 0 warnings |
| `uv run --directory <C> --offline pytest tests/unit/test_api_classification_lifespan.py tests/unit/test_api_no_secrets.py -v -p no:cacheprovider` | `<H>` | 0 | PASS | 9 passed |
| `uv run --directory <C> --offline pytest tests/unit/test_api_classification_lifespan.py -k "created or cancel" -q` (DAC-E3-S6-1) | `<H>` | 0 | PASS | 4 passed, 2 deselected |
| `uv run --directory <C> --offline pytest tests/unit/test_api_classification_lifespan.py -k "settings" -q` (DAC-E3-S6-2) | `<H>` | 0 | PASS | 2 passed, 4 deselected |
| `uv run --directory <C> --offline pytest tests/unit/test_api_no_secrets.py -q` (DAC-E3-S6-3) | `<H>` | 0 | PASS | 3 passed |
| T008: `uv run --directory <C> --offline pytest tests/unit/test_api_no_secrets.py tests/unit/test_api_request_id.py tests/unit/test_api_request_id_redaction_composition.py tests/unit/test_api_instruments_query_mapping.py tests/unit/test_api_instruments_error_mapping.py tests/unit/test_api_reclaim_lifespan.py tests/unit/test_api_isolation.py --durations=10 -q` | `<H>` | 0 | PASS | 19 passed in 10.82 s. The same command on a `git archive` export of `8ee5571` in the scratchpad gives 17 passed in 10.79 s, with identical slowest durations |
| T008: `uv run --directory <C> --offline pytest -m postgres tests/integration/test_api_health.py tests/integration/test_api_runs.py tests/integration/test_api_settings.py tests/integration/test_api_static_mount.py -q` | `<H>` | 0 | PASS | 43 passed, 4 deselected (testcontainers `postgres:16`) |
| `uv run --directory <C> --offline pytest -m "not postgres" -q` | `<H>` | 0 | PASS | 1636 passed, 919 deselected, 1 xfailed (27.78 s) |
| `uv run --directory <C> --offline pytest -m postgres -q` | `<H>` | 0 | PASS | 919 passed, 1637 deselected (281.78 s) |
| `uv run --directory <C> --offline ruff check .` | `<H>` | 0 | PASS | All checks passed |
| `uv run --directory <C> --offline ruff format --check .` | `<H>` | 0 | PASS | 279 files already formatted |
| `uv run --directory <C> --offline mypy src` | `<H>` | 0 | PASS | No issues in 61 source files |
| T009: `git -C <C> diff -U0 8ee5571 HEAD -- src/factorflow/api/app.py tests/unit/test_api_no_secrets.py \| grep -E '^-[^-]'`; `diff --numstat`; hunk headers; `include_router` at base and HEAD; `grep -n -i massive app.py`; `diff --name-status` outside `docs/` | `<H>` | 0 (grep: 1, no match) | PASS | No removed line. Numstat `15 0` and `116 0`. Seven hunks, all `-N,0`. `include_router` block identical (7 lines, same md5). No `massive`. Code files: `M app.py`, `A test_api_classification_lifespan.py`, `M test_api_no_secrets.py` |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 8ee5571..HEAD --cycle review --out <scratch>/mutants-gen.json` | `<H>` | 0 | PASS | 0 mutants (no operator matches the added lines) |
| `python3 scripts/mutation-run.py run --repo-dir <C> --mutants <scratch>/mutants2.json --jobs 4 --timeout 120 --stillborn-pattern 'IndentationError\|SyntaxError' --command '<focused command above>' --out <scratch>/results2.json` | `<H>` | 3 | FAIL (evidence) | 21 mutants: 16 killed, 2 timeout, 1 stillborn, 2 survived (r1, r2). Results sha256 `730fd847…dbcd7` |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | `<H>` | 0 | PASS | `sha256:7f0afbb6…3cc33255`, equal to the approval's `reviewed_revision` |
| `python3 scripts/artifact-gate.py require --project factorflow-v2 --artifact <story>` | `<H>` | 0 | PASS | Gate passed (owner-allowed) |
| `uv build` | — | N/A | NOT RUN | The plan marks it not required: the story changes no packaging |

The mutation run is review evidence, not one of the 12 required commands. Its
survivors are reported as test findings, IR-001 and IR-002.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E3-S6-run-20261104T230816Z`, HEAD `38532a2`, `git status --porcelain=v1 -uall` empty, `code-revision` `sha256:b178c8d1d7475ecadfd1543a7529af922ba9f8a33eef8016525f009fcd3a9b21`.
- After: identical HEAD, empty status, identical `code-revision`. Mutants ran in clones under `$TMPDIR`. The base comparison ran in a scratchpad export.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 3 · MEDIUM 0 · LOW 2 · **total 5**

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | TC-COMP-086 does not pin that the classification task is created after the reclaim task |
| IR-002 | HIGH | initial | TC-COMP-086 does not pin the cancellation order the plan fixes |
| IR-003 | HIGH | initial | The settings-failure test omits the planned assertion that the message does not carry the value |
| IR-004 | LOW | initial | The cycle's mutation evidence counts a stillborn mutant as killed and cites baseline logs that do not exist |
| IR-005 | LOW | initial | A missing `cancel()` hangs the lifespan suite instead of failing it |

### IR-001 — TC-COMP-086 does not pin that the classification task is created after the reclaim task

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-1, AC-10
- **Tasks**: T003 (Test 3)
- **Files**: `tests/unit/test_api_classification_lifespan.py:81-96` (`test_classification_task_created_beside_reclaim_task`), `:109-122` (`test_reclaim_cancelled_when_classification_task_already_finished`); `src/factorflow/api/app.py:200-209`
- **Claim challenged**: T003 is checked complete, and Test 3 claims "the classification task is created after the reclaim task".
- **Observed evidence**: No test compares the positions of `reclaim:start` and `classification:start`. Test 1 asserts only that both are present after `pool:open`. Test 3 asserts only the reclaim cancellation. Mutant `app.py:200:manual:r2` creates the classification task before the reclaim task, and it passes all 9 tests in both suites (`9 passed`).
- **Expected evidence/behavior**: Design 2.3 places the classification task "after `reclaim_task` is created". Plan T007 (3) places it "immediately after" the reclaim task's `create_task` statement. Plan T003 Test 3 requires the test to prove that order.
- **Impact**: A later edit could reorder task creation and still pass TC-COMP-086. CAP-002's composition stories build on this seam, and their reviews mutate only their own lines.
- **Required remediation**: Make TC-COMP-086 fail when the classification task is created before the reclaim task, as planned for Test 3. Mutant r2 must then be killed.

### IR-002 — TC-COMP-086 does not pin the cancellation order the plan fixes

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-1, AC-10
- **Tasks**: T003 (Test 2), T007 (4)
- **Files**: `tests/unit/test_api_classification_lifespan.py:99-106` (`test_both_tasks_cancelled_before_pool_close`); `src/factorflow/api/app.py:212-225`
- **Claim challenged**: TC-COMP-086 proves the shutdown sequence that T007 (4) implements.
- **Observed evidence**: The test asserts that each `…:cancelled` precedes `pool:close`, but not their relative order. Mutant `app.py:213:manual:r1` moves the unchanged reclaim cancel-and-await block ahead of the classification block, and it passes all 9 tests. The `events` list records the order, so the difference is observable with the existing doubles.
- **Expected evidence/behavior**: Plan T007 (4) fixes the order inside `finally` as "classification block, then the unchanged reclaim block, then the unchanged `pool.close()`". The plan's Resolved Conflicts call this "the design's cancellation order (classification first, then reclaim, then `pool.close()`)", from design 2.3's `for task in (classification_task, reclaim_task)`. A plain block move inserts lines only, so T009's additive-diff check would not catch the reorder either.
- **Impact**: The specified cancellation order can regress with every gate green.
- **Required remediation**: Make TC-COMP-086 fail when the reclaim task is cancelled before the classification task. Mutant r1 must then be killed.

### IR-003 — The settings-failure test omits the planned assertion that the message does not carry the value

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-2, AC-10
- **Tasks**: T006
- **Files**: `tests/unit/test_api_classification_lifespan.py:190-202` (`test_invalid_classification_settings_fail_startup_before_any_task`)
- **Claim challenged**: T006 is checked complete. The plan's test asserts the `ConfigurationError` "whose message names `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS` and not the value".
- **Observed evidence**: The test asserts only that the variable name is in the message (line 200), with no check on the submitted value. The coder's own spec-drift note records the omission ("it does not separately assert the value is absent"). No decision record covers it. The actual message is `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS: Input should be greater than or equal to 1`, which carries no value for `0`, `0.25` or `-3`. The assertion is therefore both possible and true today.
- **Expected evidence/behavior**: Plan T006. The same module holds its own cross-field error to that rule: `classification/settings.py:21`, "The message names the two variables and never their values (DAC-E1-7)".
- **Impact**: A change that put the configured value into this startup error would pass this story's test.
- **Required remediation**: Assert, as T006 plans, that the raised message does not contain the submitted value. Alternatively, record a decision if the assertion is to be dropped.

### IR-004 — The cycle's mutation evidence counts a stillborn mutant as killed and cites baseline logs that do not exist

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `…/CAP-002-E3-S6-evidence/mutation-cycle-1-mutants.json` (mutant `app.py:207:manual:2`), `…/mutation-cycle-1-results.json` (`baselines[*].log`), `…/CAP-002-E3-S6-tdd-evidence.yaml` (`mutation.killed: 11`)
- **Claim challenged**: "generated: 12, killed: 11, …, score: 1.0".
- **Observed evidence**: Mutant 2 replaces only the first line of a three-line statement. The file then fails to import with `IndentationError: unexpected indent`. That is a stillborn mutant, which tests the compiler rather than the suite, yet the results record it as `killed`. The results file also cites `…/CAP-002-E3-S6-evidence/mutation-cycle-1-results-logs/baseline-w{0,1,2}.log` with SHA-256 digests, but no such directory exists in the tree. `--require-logs` does not check these paths.
- **Expected evidence/behavior**: Mutation counts that reflect what ran (`mutation-run.py`: "`stillborn` when it does not build (not a kill)"), and cited logs that exist.
- **Impact**: The evidence overstates kill coverage by one. The intended "loop never created" behaviour is in fact covered: the well-formed r9 is killed by Test 1.
- **Required remediation**: In the next cycle's evidence, use well-formed mutants or a stillborn pattern, and cite only logs that are committed.

### IR-005 — A missing `cancel()` hangs the lifespan suite instead of failing it

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-1
- **Tasks**: T003
- **Files**: `tests/unit/test_api_classification_lifespan.py:41-50` (`_sleeping_loop`), `:73-78` (`_enter_and_leave`)
- **Claim challenged**: TC-COMP-086 detects a classification task that is not cancelled on shutdown.
- **Observed evidence**: Mutants `app.py:213:manual:5` and `manual:r8` both ran to the 120 s timeout. The sleeping double waits on an `Event` that is never set, so `await classification_task` never returns, and the project installs no pytest timeout.
- **Expected evidence/behavior**: Plan T003 Test 2 expects "the `async with` exits without raising", which a failing assertion would show more usefully than a hang.
- **Impact**: This regression is detected, but as a stalled CI job with no message.
- **Required remediation**: Optional. Bound the shutdown in the test so a missing cancel fails with a message.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, recorded:** DEC-0282 covers T003 Test 4. It reads the traceback
  from `exc_text`, because the redaction filter (`config/redaction.py:44-50`,
  installed by `configure_logging()` in `_lifespan`) moves it there and clears
  `exc_info`. The derivation holds, and the test still pins the exception's type
  and message.
- **Justified, recorded:** DEC-0283 covers T005. It enumerates through
  `app.openapi()["paths"]` because `app.routes` holds `_IncludedRouter`
  wrappers on FastAPI 0.141.1, which this review observed directly. It also
  moves the canary route ahead of the static mount. Both change only test
  mechanics, and the seven required routes are still asserted.
- **Unrecorded deviations (findings):** T003 Test 3 omits its creation-order
  claim (IR-001). T006 omits its "not the value" assertion (IR-003).
- **Bookkeeping:** T010 claims both test files cite DAC-E3-S6-1 to DAC-E3-S6-4,
  but neither cites DAC-E3-S6-4. That criterion has no pytest case: TC-COMP-089
  is a git verification, recorded in the TDD evidence. T002's baseline is
  recorded only implicitly, as `8ee5571`, the commit's parent, named in
  `red_evidence`. The T006 test carries `# Implements TC-COMP-087`, while the
  plan files it under Additional Unit Tests for DAC-E3-S6-2.
- **Out of scope:** none. No production file other than `app.py` changed, and
  no dependency or configuration changed. A configuration error in
  `ClassificationSettings()` raises after `pool.open()` without closing the
  pool. This matches the delivered `RunSettings()` placement that plan T007 (2)
  prescribes, and the coder's code review records it. It is not attributed to
  this story.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework the tests against this report and the task plan.
  IR-001 and IR-002 require TC-COMP-086 to kill mutants r1 and r2, by asserting
  task-creation order and cancellation order. IR-003 requires T006's "not the
  value" assertion, or a recorded decision to drop it. No production change is
  required. Then rerun adversarial review (v2) with
  `CAP-002-E3-S6-implementation-review-v1-mutation.json` as `scope --previous`.
- **Warnings accepted downstream**: N/A
