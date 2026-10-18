---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S6-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-18
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T23:25:00Z
  source_artifacts:
    - id: CAP-002-E3-S6
      version: "1"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
    - id: CAP-002-classification-api-component-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E3-S6 — API Composition: Scheduler Start in the Lifespan and No-Secrets Test over the New Routes

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S6.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E3-tasks`
**Date**: 2026-10-17

## Summary

Finishes the API side of CAP-002's composition with two additive edits to delivered files and one new test
file. `src/factorflow/api/app.py` gains the imports of `run_classification_loop` and `ClassificationSettings`
and, in `_lifespan`, creates the classification scheduler task from `ClassificationSettings()` beside the
reclaim task and cancels and awaits it on shutdown, before `pool.close()`, logging rather than propagating an exception the task already ended with, so the reclaim task's cancel and `pool.close()` still run (AC-10, DAC-E3-13; Open Gap 6).
`tests/unit/test_api_no_secrets.py` gains the same no-credential assertion over every route the universes and
classifications routers register, response bodies, headers and logs alike (DAC-E3-S6-3). The two
`include_router` calls are not made here: CAP-002-E1-S6 and CAP-002-E3-S5 make them (DEC-0086). The loop itself
and everything it does is CAP-002-E2-S9's. No existing line of either delivered file is removed or reordered
(DAC-E3-S6-4, AGT-SCOPE-002).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-10 | Classifications are refreshed without user action after a succeeded or partial run (start side: the lifespan task that runs E2's loop) | T003, T004, T006, T007, T008 |
| AC-16 | Sort, filter and compare over the read routes (this story: the routes are mounted behind the middleware and leak no secret) | T005, T009 |
| DAC-E3-13 | `app.py` end state: routers included before the middleware and static mount, scheduler task beside the reclaim task, `test_api_no_secrets.py` carries the assertion over the new routes, no other delivered API file changes | T002, T003, T004, T005, T007, T009 |
| DAC-E3-S6-1 | Classification task created beside the reclaim task; both cancelled on shutdown; `CancelledError` swallowed (TC-COMP-086) | T003, T007, T008 |
| DAC-E3-S6-2 | The scheduler coroutine is called with the pool and `ClassificationSettings()` (TC-COMP-087) | T004, T006, T007 |
| DAC-E3-S6-3 | No universes or classifications response or log contains a credential (TC-COMP-088) | T005 |
| DAC-E3-S6-4 | No delivered file other than `app.py` and `test_api_no_secrets.py` changed; no existing line removed or reordered (TC-COMP-089) | T002, T009 |

Mapped component test cases (`classification-api-tests.md`, coverage matrix): TC-COMP-086, TC-COMP-087,
TC-COMP-088, TC-COMP-089. Every other `classification-api-tests.md` case belongs to CAP-002-E1-S6 or
CAP-002-E3-S5 and is not planned here; TC-COMP-126 ("routers registered behind middleware") is CAP-002-E3-S5's
(its T008), so no duplicate is written in the lifespan file.

## Phase 1: Setup

**Purpose**: Confirm the producers this story imports exist and fix the base the scope check measures against.

- [ ] T001 Confirm the producers exist before any code is written; STOP and report if one is missing rather than creating it here. (a) From CAP-002-E2-S8 and CAP-002-E2-S9: `src/factorflow/classification/settings.py` exporting `ClassificationSettings` (derives `_EnvNamedSettings`, prefix `FACTORFLOW_CLASSIFICATION_`, fields `poll_interval_seconds` default 5.0 and `build_timeout_seconds` default 300.0) and `src/factorflow/classification/scheduler.py` exporting `async def run_classification_loop(pool, settings, wait_fn=None, dispatch_fn=None, stop_event=None)`; read the actual signature (the call in T007 follows it; scheduler design 2.4 and CAP-002-E2-S9's T011 and T012 pin `(pool, settings, wait_fn=None, dispatch_fn=None, stop_event=None)`). (b) From CAP-002-E1-S6 and CAP-002-E3-S5: `src/factorflow/api/app.py` already imports `universes` and `classifications` from `factorflow.api.routes` and calls `app.include_router(universes.router)` and `app.include_router(classifications.router)` before `_add_host_origin_middleware`; list the route paths each router registers (`[(sorted(r.methods), r.path) for r in app.routes if r.path.startswith(("/api/universes", "/api/classifications"))]`) for T005. (c) Read the current `_lifespan` in `src/factorflow/api/app.py` and the delivered `tests/unit/test_api_no_secrets.py`, `tests/unit/test_api_reclaim_lifespan.py` and `tests/unit/test_api_runs_routes.py` (the `_FakePool` pattern); also note the name of `app.py`'s module-level logger (its `logging.getLogger(...)` assignment) for T007 (4), or that `app.py` defines none (T007 (5)). (d) `grep -rn "massive" src/factorflow/classification/scheduler.py src/factorflow/classification/settings.py`: importing these into `app.py` must not pull the Massive client into the API process (`test_api_isolation.py`, design section 7 "No provider import"); if it does, STOP and report. Nothing is edited by this task.
- [ ] T002 Record the scope baseline for DAC-E3-S6-4: `git -C repos/factorflow-v2/FactorFlow-v2 rev-parse HEAD` and `git -C repos/factorflow-v2/FactorFlow-v2 status --short` before the first edit, and note both in the review hand-off. CAP-002-E1-S6 and CAP-002-E3-S5 have already edited `app.py`; the check in T009 compares this story's own change against this baseline, not against the delivered CAP-001 file. (depends on T001)

**Checkpoint**: Producers verified; baseline recorded; no file changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the lifespan and no-secrets behaviour from the acceptance criteria.

### Mandatory Component Tests

Doubles are injected by monkeypatching module attributes of `factorflow.api.app` and the
`FACTORFLOW_CLASSIFICATION_*` environment, never by adding a parameter to `_lifespan` (DEC-0142). The tests
drive the real `_lifespan(FastAPI())` under `asyncio.run` (the project installs no async test plugin, as
`test_api_reclaim_lifespan.py` records). Common doubles, defined once in `tests/unit/test_api_classification_lifespan.py`: `_RecordingPool` replaces `app_module.ConnectionPool` (constructor takes the keyword arguments `_lifespan` passes and ignores them; `open()` appends `"pool:open"` and `close()` appends `"pool:close"` to a shared `events` list); a `_sleeping_loop(name, events)` coroutine function used for both `_run_reclaim_loop` and `run_classification_loop` that appends `f"{name}:start"`, awaits `asyncio.Event().wait()`, and on `asyncio.CancelledError` appends `f"{name}:cancelled"` and re-raises. `FACTORFLOW_DATABASE_URL` is set to `postgresql://unused@127.0.0.1/unused` by an autouse fixture; no real connection is opened.

- [ ] T003 [P] Implement TC-COMP-086 (lifespan creates and cancels the classification task) in `tests/unit/test_api_classification_lifespan.py` (new file; DAC-E3-S6-1; AC-10). Module docstring cites DAC-E3-S6-1, DAC-E3-S6-2, DEC-0142; each test carries `# Implements TC-COMP-086`. Test 1: inside `async with app_module._lifespan(FastAPI())`, after two `await asyncio.sleep(0)`, `events` contains both `"reclaim:start"` and `"classification:start"` (the classification task exists beside the reclaim task) and `"pool:open"` precedes them. Test 2: on exit `events` contains `"classification:cancelled"` and `"reclaim:cancelled"`, both before `"pool:close"` (cancel and await before the pool closes), and the `async with` exits without raising (`CancelledError` swallowed for both tasks, as for the reclaim task). Test 3: the classification task is created after the reclaim task and the reclaim task is cancelled even when the classification double finishes immediately (a `run_classification_loop` double that returns at once leaves `"reclaim:cancelled"` before `"pool:close"` and the exit clean). Test 4 covers a task that ended with an error before shutdown: CAP-002-E2-S9's start-up reclaim runs outside the loop's `try`, so if it raises, the task ends with that exception (Open Gap 6). Define `boom = RuntimeError("start-up reclaim failed")` and a `run_classification_loop` double `async def _raising_loop(**kwargs): raise boom`. With `caplog.set_level(logging.ERROR)`, enter `async with app_module._lifespan(FastAPI())`, `await asyncio.sleep(0)` twice so that the classification task has finished, then exit. Assert all of the following. The `async with` exits without raising. `events` contains both `"reclaim:cancelled"` and `"pool:close"`, with `"reclaim:cancelled"` before `"pool:close"` (the unchanged reclaim block and `pool.close()` still ran). Exactly one record at ERROR or above is captured; its `getMessage()` is `"classification scheduler task ended with an error"` and its `exc_info[1] is boom`. Name the test so that `-k "cancel"` selects it, for example `test_reclaim_cancelled_and_pool_closed_when_classification_task_raised`. All fail until T007 (the attribute `run_classification_loop` does not exist on `factorflow.api.app`; `monkeypatch.setattr(..., raising=True)` fails). (depends on T001)
- [ ] T004 Implement TC-COMP-087 (lifespan passes pool and `ClassificationSettings` to the scheduler) in `tests/unit/test_api_classification_lifespan.py` (DAC-E3-S6-2; AC-10; written after T003, same file). With `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS=7` and `FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS=120` set and a `run_classification_loop` double that records its keyword arguments: the double is called exactly once; it is called with the keyword arguments `pool` and `settings` and no others (production relies on the loop's own `wait_fn`, `dispatch_fn` and `stop_event` defaults, so none is passed); `calls[0]["pool"]` is the `_RecordingPool` instance and equals `app.state.db_pool`; `calls[0]["settings"]` is an instance of `ClassificationSettings`, equals `ClassificationSettings()` built in the test under the same environment, and has `poll_interval_seconds == 7.0` and `build_timeout_seconds == 120.0` (non-default values prove the settings are read from the environment, not default-constructed). The double records the arguments at call time, so the assertion does not depend on loop completion. `# Implements TC-COMP-087`. (depends on T003)
- [ ] T005 [P] Implement TC-COMP-088 (no-secrets test covers every new route) in `tests/unit/test_api_no_secrets.py` (extend the delivered file additively: new imports as new lines, new tests appended after `test_health_never_echoes_credential`, no existing line changed; DAC-E3-S6-3, DAC-E3-13; AC-10, AC-16; DEC-0084). A module-private `_FakePool` (the `test_api_runs_routes.py` pattern, `connection()` yields `object()`) is set as `app.state.db_pool` of `create_app()`; the app is not entered as a context manager, so the lifespan, the pool and the scheduler do not run; the client is `TestClient(app, base_url="http://127.0.0.1:8000", raise_server_exceptions=False)`. With `FACTORFLOW_MASSIVE_API_KEY` set to a distinctive secret and `caplog.set_level(logging.DEBUG)`, the test enumerates `app.routes` and, for every route whose path starts with `/api/universes` or `/api/classifications`, requests each of its methods (path parameters filled: a name ending in `id` gets a fresh `uuid4`, any other gets `AAA`; non-GET methods send `json={}`), and asserts that the secret appears in none of `response.text`, the response header values, nor `caplog.text`. The enumerated set must include at least `GET /api/universes`, `GET /api/classifications`, `GET /api/classifications/summary`, `/sets`, `/sets/{set_id}`, `/stocks/{symbol}` and `/stocks/{symbol}/history` (so a router that was never mounted fails here rather than passing on an empty loop). Because a fake pool turns most responses into 422/404/500 envelopes, the assertion covers the error and disclosure paths that SEC-ERR-001 cares about; success bodies are covered by CAP-002-E3-S5's and CAP-002-E1-S6's integration tests, which seed no credential-bearing field. A canary test proves the detector works: a throwaway route added to a fresh `create_app()` that echoes the secret, and a log line carrying it, each make the shared `_assert_no_secret(...)` helper raise `AssertionError` (this is the RED evidence for the cycle, because the helper does not exist before T005 and the canary fails without it). `# Implements TC-COMP-088`. (depends on T001)

### Additional Unit Tests

- [ ] T006 [P] Settings construction failure in `tests/unit/test_api_classification_lifespan.py` (DAC-E3-S6-2; AC-10). With `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS=0` (below the `ge=1` bound) the `_lifespan` entry raises `factorflow.config.settings.ConfigurationError` whose message names `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS` and not the value, and neither loop double has recorded `"…:start"` (settings are constructed before either task is created, so a bad configuration fails startup before any background task exists). Written after T004 (same file). (depends on T004)

**Checkpoint**: All tests written and failing (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the lifespan start and stop the classification scheduler. Insertions only.

- [ ] T007 Edit `src/factorflow/api/app.py` (delivered by CAP-001, extended by CAP-002-E1-S6 and CAP-002-E3-S5), adding lines and removing, rewording or reordering none (DAC-E3-S6-1, DAC-E3-S6-2, DAC-E3-S6-4; AC-10; DAC-E3-13; design 2.3). Four insertions (a fifth only in the case (5) names): (1) two new import lines placed where `ruff` isort puts them, between the `from factorflow.api.routes import ...` line and the `from factorflow.config.settings import (` block: `from factorflow.classification.scheduler import run_classification_loop` and `from factorflow.classification.settings import ClassificationSettings`; (2) one line immediately after `run_settings = RunSettings()`: `classification_settings = ClassificationSettings()` (constructed beside `RunSettings()` and before either task exists, so a bad `FACTORFLOW_CLASSIFICATION_*` value fails startup before a task is created, T006); (3) immediately after the closing parenthesis of the existing `reclaim_task = asyncio.create_task(...)` statement and before `try:`: `classification_task = asyncio.create_task(run_classification_loop(pool=pool, settings=classification_settings))` (keyword arguments exactly as design 2.3 shows; no other argument); (4) in the existing `finally:` block, insert a new block before the existing `reclaim_task.cancel()` line. It repeats the existing pattern for the new task and adds one handler: `classification_task.cancel()`, then `try: await classification_task` / `except asyncio.CancelledError: pass` / `except Exception: <logger>.exception("classification scheduler task ended with an error")`, where `<logger>` is the module-level logger T001 (c) found in `app.py`. The `except Exception` handler is required because the task can end on its own with an exception before shutdown. CAP-002-E2-S9 runs the start-up `await dispatch(reclaim_interrupted_sets, pool)` outside the loop's `try` (scheduler design 2.4; CAP-002-E2-S9 T012 and Open Gaps, "Reclaim failing at start is not caught"). If that call raises, the task finishes with the exception, `cancel()` on the finished task does nothing, and `await classification_task` re-raises it. Without the handler, the exception would leave the `finally` before the unchanged reclaim block and `pool.close()`, and the lifespan exit would raise (T003 Test 4). `asyncio.CancelledError` is a `BaseException`, so the handler never catches the shutdown cancellation itself. Attach no done-callback and add no retry or restart (Open Gap 6). (5) Only if T001 (c) found no module-level logger in `app.py`: add `import logging` where `ruff` isort places it (if it is not already imported) and `_log = logging.getLogger(__name__)` as a new line directly after the import block, and use `_log` as `<logger>` in (4). Both are added lines. Do NOT restructure the `finally` into the `for task in (classification_task, reclaim_task):` loop that the design 2.3 snippet shows: that replaces and reorders existing lines, which the story's DAC-E3-S6-4, DAC-E3-13 and the design's own prose ("nothing removed or reordered") forbid; the snippet is illustrative and the ACs govern (see Resolved Conflicts). The existing order inside `finally` is therefore classification block, then the unchanged reclaim block, then the unchanged `pool.close()`. Touch nothing else: no `include_router` change, no `_VALIDATION_ERROR_RESOURCES` entry, no docstring edit. If the new lines make `ruff format` want to reformat an existing line, STOP and report instead of accepting the reformat. (depends on T001, T003, T004, T006)

**Checkpoint**: T003, T004 and T006 pass; `app.py` differs from its previous state by added lines only.

---

## Phase 4: Integration

**Purpose**: Show the delivered application still behaves with the scheduler task running in its lifespan, and that the change is exactly the scope the story allows.

- [ ] T008 Run the delivered suites that enter the real lifespan against an unreachable database, and confirm the added classification task changes neither their results nor their duration: `uv run pytest tests/unit/test_api_no_secrets.py tests/unit/test_api_request_id.py tests/unit/test_api_request_id_redaction_composition.py tests/unit/test_api_instruments_query_mapping.py tests/unit/test_api_instruments_error_mapping.py tests/unit/test_api_reclaim_lifespan.py tests/unit/test_api_isolation.py --durations=10`, then `uv run pytest -m postgres tests/integration/test_api_health.py tests/integration/test_api_runs.py tests/integration/test_api_settings.py tests/integration/test_api_static_mount.py` (skip the second command and report if no container runtime is available). With the unreachable `postgresql://unused@127.0.0.1/unused` URL, the classification loop's first dispatched call (the start-up reclaim, CAP-002-E2-S9) runs in a worker thread exactly as the reclaim sweep does. In these short-lived suites the cancel reaches the task while that thread is still waiting on the pool, so the task ends by cancellation and `pool.close()` after the cancel releases the thread. The start-up reclaim sits outside the loop's `try` (scheduler design 2.4; CAP-002-E2-S9 Open Gaps). If it raised before shutdown, the task would end with that exception, and T007 (4)'s `except Exception` handler would log it while the reclaim block and `pool.close()` still run, so the suite would still pass. Every suite must pass with durations no worse than before this change by more than the pool-close wait. If a delivered test fails or hangs because of the new task, do not edit it (AGT-SCOPE-002): STOP and report which test and why (Open Gap 3). (depends on T007)
- [ ] T009 Implement TC-COMP-089 (only `app.py` and `test_api_no_secrets.py` changed, additively) as a verification, recorded in the review hand-off (DAC-E3-S6-4, DAC-E3-13; AC-10, AC-16; AGT-SCOPE-002). With `B` the HEAD recorded in T002: `git -C repos/factorflow-v2/FactorFlow-v2 diff --stat B` lists, among delivered files, only `src/factorflow/api/app.py` and `tests/unit/test_api_no_secrets.py`, and otherwise only the new `tests/unit/test_api_classification_lifespan.py`, this plan, the TDD-evidence file and `dependencies.yaml` if it changed; `git diff -U0 B -- src/factorflow/api/app.py tests/unit/test_api_no_secrets.py | grep -E '^-[^-]'` prints nothing (no line removed or changed); `git diff --numstat B -- src/factorflow/api/app.py tests/unit/test_api_no_secrets.py` shows 0 deleted lines for each file, and every hunk of `git diff -U0 B` is a pure insertion (`@@ -N,0 +M,K @@`), so no existing line is removed, changed or reordered; `grep -n "include_router" src/factorflow/api/app.py` is unchanged from `B`; `grep -rn "massive" src/factorflow/api/app.py` returns nothing. (depends on T007, T008, T005)

**Checkpoint**: The delivered suites still pass with the scheduler task running; the change set is additive and confined to the two allowed delivered files.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [ ] T010 Run the full validation set (Validation Plan below), fix any lint, format or type finding in the files this story added or extended without altering existing lines of `app.py` or `test_api_no_secrets.py`, and confirm the new test file and the extended test file cite DAC-E3-S6-1 to DAC-E3-S6-4, DEC-0142 and TC-COMP-086 to TC-COMP-088. Add no file beyond `tests/unit/test_api_classification_lifespan.py` and the two edits above. (depends on T009)
- [ ] T011 After each TDD cycle in T003–T010 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E3-S6-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S9 | hard | Existing graph edge (`E3-S6: [E2-S9, E1-S6, E3-S5]`). Delivers `run_classification_loop` in `classification/scheduler.py`, imported into `app.py` (T001, T007) |
| CAP-002-E1-S6 | hard | Existing graph edge. Mounts the universes router the no-secrets test enumerates and makes the first `app.py` edit this one builds on (T001, T005) |
| CAP-002-E3-S5 | hard | Existing graph edge. Mounts the classifications router the no-secrets test enumerates (T001, T005) |
| CAP-002-E2-S8 | hard | NEW EDGE. `ClassificationSettings` lives in `src/factorflow/classification/settings.py`, delivered by E2-S8 (its Description: "Delivers `src/factorflow/classification/settings.py` (`ClassificationSettings`...)"), and `app.py` imports it directly (T007). The story's Dependencies section cites it as arriving with E2-S9 and the graph holds `E2-S9: [E2-S8, E2-S2]`, so the module is reached transitively; the edge is added because this story imports the module itself, per the producer map rule |

New graph edge: `CAP-002-E3-S6` gains `CAP-002-E2-S8` (see Notes, Other Notes). No cycle: E2-S8 depends on
E2-S1, which depends on E1-S1.

### Task Dependencies
- T001: No dependencies
- T002: Depends on T001
- T003, T005: Depend on T001; different files, can run in parallel
- T004: Depends on T003 (same file)
- T006: Depends on T004 (same file)
- T007: Depends on T001, T003, T004, T006
- T008: Depends on T007
- T009: Depends on T005, T007, T008
- T010: Depends on T009
- T011: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: T003 → T004 → T006 are sequential in `test_api_classification_lifespan.py`; T005 (the no-secrets file) runs in parallel with that chain
- Phase 3 and later are sequential: one file, one scope check

---

## Validation Plan

### Constitution-Defined Commands
- Build: `uv build` (tech-stack Validation Commands table; not required, this story changes no packaging)
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (the story's Validation section; `uv run pytest` runs both)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

If no container runtime is available, run `uv run pytest -m 'not postgres'` and report that the
`postgres`-marked tests (the integration part of T008) were excluded (tech stack, Validation Commands note).

### Story-Specific Validation
- DAC-E3-S6-1: `uv run pytest tests/unit/test_api_classification_lifespan.py -k "created or cancel"` shows TC-COMP-086 green: both tasks start, both are cancelled before `pool:close`, the exit is clean, and a classification task that already raised is logged once while the reclaim task is still cancelled before `pool:close` (Test 4)
- DAC-E3-S6-2: `uv run pytest tests/unit/test_api_classification_lifespan.py -k "settings"` shows TC-COMP-087 green: one call with keyword `pool` and `settings`, settings equal to `ClassificationSettings()` under non-default environment values; the configuration-failure case is green
- DAC-E3-S6-3: `uv run pytest tests/unit/test_api_no_secrets.py` shows TC-COMP-088 green: the health test and the new route sweep, and the canary proves the detector fails on a leak
- DAC-E3-S6-4: T009's `git diff` reads and `grep` checks return as stated (TC-COMP-089)
- Delivered behaviour unchanged: T008's suites pass and are not slower than before the change

---

## Notes

### Resolved Conflicts

- **Design 2.3's snippet rewrites `finally` as `for task in (classification_task, reclaim_task):` while its prose says "Three insertions, nothing removed or reordered".** The snippet replaces the existing `reclaim_task.cancel()` and `try/except` lines; the story's DAC-E3-S6-4 and DAC-E3-13, TC-COMP-089 and the design's own prose all say no existing line is removed or reordered. Precedence: story AC > design prose > illustrative snippet, and the prose is on the AC's side. T007 inserts a parallel cancel-and-await block for the new task before the unchanged reclaim block, which preserves the design's cancellation order (classification first, then reclaim, then `pool.close()`). No source edit required.
- **Design 2.3 constructs `ClassificationSettings()` inline in the `create_task` call; the plan constructs it into a local one line earlier (T007 (2)).** Both satisfy DAC-E3-S6-2 and TC-COMP-087 ("called with the pool and `ClassificationSettings()`"). The local keeps a configuration failure from leaving a started reclaim task behind. It adds a line; it changes none. No source edit required.
- **API design section 7 says the lifespan test proves the lifecycle "as `test_api_reclaim_lifespan.py` proves for the reclaim task".** That file tests `_run_reclaim_loop` directly, not `_lifespan`. For the classification task the call site is the thing under test (TC-COMP-087), so the new file drives `_lifespan` itself; how its doubles are injected is DEC-0142 (Open Gap 1).
- **Design 7 names three routes for the no-secrets extension (`GET /api/universes`, `GET /api/classifications`, `GET /api/classifications/summary`); DAC-E3-S6-3 and TC-COMP-088 say "any universes or classifications route".** The AC governs and is stricter: T005 sweeps every route the two routers register, which includes the three. No source edit required.
- **Design 7 places the row "Routers registered behind middleware" in `test_api_classification_lifespan.py`; CAP-002-E3-S5 implements it as TC-COMP-126 in its routes file** (its plan, Resolved Conflicts). This story does not duplicate it; the file this story creates holds only the scheduler-task tests.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-10-17): how the lifespan test injects its doubles.** The story and TC-COMP-087 say "injected doubles", but `_lifespan` has no injection parameter and DAC-E3-S6-4 forbids changing existing lines. The plan drives the real `_lifespan(FastAPI())` and monkeypatches `ConnectionPool`, `_run_reclaim_loop` and `run_classification_loop` as attributes of `factorflow.api.app`, with `FACTORFLOW_CLASSIFICATION_*` set in the environment; no seam is added to production code. Derivation: AGT-SCOPE-002 and simplicity (a test-only seam is an unrequested production change); `app.py` imports the loop and the settings by name, so patching the module attributes replaces exactly what `_lifespan` calls. Recorded as DEC-0142. Flag for the classification-api design section 7, whose "as `test_api_reclaim_lifespan.py` proves" wording describes a different seam.
2. **The upstream modules are taken from design and the producers' task plans, not read from code.** `src/factorflow/classification/` does not exist at planning time. Task plans exist for CAP-002-E1-S6, CAP-002-E2-S8, CAP-002-E2-S9 and CAP-002-E3-S5, and this plan cites them. Scheduler design 2.4 and CAP-002-E2-S9 T012, with its signature test T011, pin `run_classification_loop(pool, settings, wait_fn=None, dispatch_fn=None, stop_event=None)`, which matches the call in T007. Scheduler design 2.3 and CAP-002-E2-S8 pin `ClassificationSettings`. CAP-002-E2-S9's Open Gaps ("Reclaim failing at start is not caught") pin a start-up reclaim that can end the task with an exception, which T007 (4) handles. T001 verifies each against the code and STOPs on a mismatch. If the actual keyword names differ from `pool` and `settings`, T004 and T007 follow the code, and the difference is reported against the scheduler design and CAP-002-E2-S9's plan.
3. **Delivered tests that enter the lifespan now also start the classification task.** `test_api_no_secrets.py` (health test), `test_api_request_id.py`, `test_api_request_id_redaction_composition.py`, the instruments mapping tests and several integration files use `with TestClient(app)` against `postgresql://unused@127.0.0.1/unused`. The reclaim task already runs this way. Inside its `while True`, the loop logs an iteration failure and continues (CAP-002-E2-S9, DAC-E2-S9-2). Its start-up `await dispatch(reclaim_interrupted_sets, pool)`, however, runs once before that `try` (scheduler design 2.4; CAP-002-E2-S9 T012 and Open Gaps, "Reclaim failing at start is not caught"). If it raises, the task ends with that exception, and T007 (4)'s `except Exception` handler logs it at shutdown without skipping the reclaim block or `pool.close()` (T003 Test 4; Open Gap 6). In these short-lived suites the cancel reaches the task while the start-up reclaim's worker thread is still waiting on the pool, so no failure is expected. `asyncio.to_thread` work cannot be cancelled, though, and may delay shutdown until `pool.close()` releases the waiting thread. T008 measures this. A failure or a material slowdown is reported, not worked around by editing a delivered test (AGT-SCOPE-002).
4. **A build running at shutdown is not completed.** Cancelling the task does not stop a build already running in a worker thread; `pool.close()` then ends its connection and the set stays `building` until the next start, when `reclaim_interrupted_sets` records it `failed` (scheduler design, DEC-0067). Nothing is added here: the cleanup is the scheduler's and the story's ACs ask for cancel-and-await only.
5. **Not a bound for this story:** `MAX_UNIVERSE_NAME_LENGTH` (API design 14 question 1) concerns universe names and no code here reads one. The `app.py` ownership question (API design 14 question 2, DEC-0064, DEC-0084, review FINDING-13) is the owner's and does not block planning; this plan edits exactly the two files the story lists.
6. **Owner-directed fix (cross-plan review 2026-10-18, E3-F08): a classification task that has already ended with an exception is logged at shutdown and does not stop the rest of the shutdown.** T007 (4)'s inserted block catches `Exception` after `asyncio.CancelledError` and calls `<app.py's module logger>.exception("classification scheduler task ended with an error")`. The unchanged reclaim cancel-and-await and `pool.close()` therefore still run, and the lifespan exits without raising (T003 Test 4). Two alternatives were not adopted. A done-callback that logs when the task exits cannot replace the handler, because a task that ended with an exception re-raises it on every `await`, and beside the handler it would log the same failure twice. No retry or restart of the task is added. Consequence: if the start-up reclaim raises, classification stays stopped until the next application start, and the failure is logged only when the application shuts down. — Derivation: CAP-002-E2-S9's plan (T012 and Open Gaps, "Reclaim failing at start is not caught") pins that the start-up `await dispatch(reclaim_interrupted_sets, pool)` runs outside the loop's `try` (scheduler design 2.4), so the task can end with that exception. That plan hands logging or restarting such a task to this story. The handler is the narrowest change that logs the exception and keeps the cleanup DAC-E3-S6-1 requires, and it adds lines only (DAC-E3-S6-4, T009). DEC-0142 is amended to list it. Whether start-up should retry, or the task be restarted, stays PROVISIONAL — awaiting owner confirmation; CAP-002-E2-S9 flags it for scheduler design sections 2.4 and 14. Also flagged for classification-api design 2.3, whose `for task in (classification_task, reclaim_task):` snippet swallows only `CancelledError` and has the same gap.

### Other Notes

- **Dependency graph.** One edge added: `CAP-002-E3-S6: [CAP-002-E2-S9, CAP-002-E2-S8, CAP-002-E1-S6, CAP-002-E3-S5]` (E2-S8 inserted in numeric order). `app.py` imports `factorflow.classification.settings`, which E2-S8 creates; the graph previously reached it only through E2-S9 (`E2-S9: [E2-S8, E2-S2]`). The three existing edges are unchanged; no existing edge was removed.
- **Story status.** The skill's step of setting the story's frontmatter `status: planning` was not performed: the supervising instruction forbids editing the approved story (editing it would also invalidate its approval revision). The story stays `todo`.
- **Mapped TCs.** TC-COMP-086 (T003), TC-COMP-087 (T004), TC-COMP-088 (T005), TC-COMP-089 (T009, a verification of the change set, not a pytest case, because it reads `git diff`). No integration or end-to-end case is mapped to this story in the coverage matrix.
- **Shared file risk.** `app.py` is edited by CAP-002-E1-S6 (universes), CAP-002-E3-S5 (classifications) and this story; this story builds on both and must be applied after them. `tests/unit/test_api_no_secrets.py` is edited only here.
- **Not planned.** The two `include_router` calls (E1-S6, E3-S5, DEC-0086); the loop and its behaviour (E2-S9, TC-COMP-075 to 085); the routes (E1-S6, E3-S5); any edit to `_VALIDATION_ERROR_RESOURCES`.
