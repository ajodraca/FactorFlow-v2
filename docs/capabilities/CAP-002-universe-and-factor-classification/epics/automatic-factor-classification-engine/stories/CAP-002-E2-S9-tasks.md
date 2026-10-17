---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S9-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-10-17T23:15:00Z
  source_artifacts:
    - id: CAP-002-E2-S9
      version: "1"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S9 — Classification Loop: Dispatch Off the Event Loop, Restart Reclaim and Build Pass-Through

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S9.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-tasks`
**Date**: 2026-10-17

## Summary

Adds the asyncio half of the scheduler to `src/factorflow/classification/scheduler.py`, beside the synchronous `claim_next_set`, `reclaim_interrupted_sets`, `ClaimedSet` and `ReclaimedSet` that CAP-002-E2-S8 delivers: `build_claimed_set(pool, set_id, timeout_seconds)` (one pooled connection for the whole build, handed to `engine.build`) and `run_classification_loop(pool, settings, wait_fn, dispatch_fn, stop_event)` exactly as `component-design-classification-scheduler.md` section 2.4 gives it. The loop dispatches `reclaim_interrupted_sets` once before the first claim, warns once per unresolved line item, then claims and builds through the injected dispatcher (default `asyncio.to_thread`), looks again at once after a build, waits `poll_interval_seconds` only when idle or after a failed iteration, and logs with `log.exception` and continues on any iteration failure. The lifespan task that starts the loop is CAP-002-E3-S6 and `app.py` is not touched. Five mapped test cases (TC-COMP-083, 084, 085, 092, 169) plus the cases the design table lists without a TC (line-item warnings, off-the-event-loop default dispatch, restart-then-build end to end) are implemented, and one assertion in a delivered S8 test that this story necessarily falsifies is removed (see Resolved Conflicts).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-10 | Classify without user action after `succeeded`/`partial` runs; never after `failed`, `cancelled`, `abandoned` | T003, T004, T006, T007, T008, T010, T011, T012, T014 |
| AC-11 | Up to date within 5 minutes of the run ending | T003, T009, T010, T012, T014 (poll interval and look-again after a build; the timeout reaches the engine; the 3000-stock volume test is CAP-002-E2-S7) |
| AC-20 | Set never half-written; a failure records its reason (build side) | T005, T009, T010, T012, T014 |
| DAC-E2-4 | A run acquires at most one set; non-qualifying runs never acquire one | T010 (the S8 claim SQL does the work; the loop test confirms a failed set is not rebuilt) |
| DAC-E2-12 | Interrupted `building` set recorded `failed` before any new claim | T005, T010, T012, T014 |
| DAC-E2-S9-1 | Claim and build go through the dispatcher; idle iterations wait the poll interval | T003, T006, T012, T014 (TC-COMP-083) |
| DAC-E2-S9-2 | A raising claim is logged with `exception` and the loop continues | T004, T012, T014 (TC-COMP-084) |
| DAC-E2-S9-3 | `reclaim_interrupted_sets` dispatched before the first claim and never again | T005, T010, T012, T014 (TC-COMP-169) |
| DAC-E2-S9-4 | Too-short `build_timeout_seconds` reaches the engine; set `failed` with a timeout reason | T009, T013, T014 (TC-COMP-092) |
| DAC-E2-S9-5 | `factorflow.ingestion_main` imports nothing under `factorflow.classification` | T007, T014 (TC-COMP-085) |

## Phase 1: Setup

**Purpose**: Confirm the hard prerequisites exist and learn the helpers this story imports.

- [ ] T001 Confirm CAP-002-E2-S8 and CAP-002-E2-S2 have landed on the working branch. Migration `0006` (CAP-002-E2-S1, transitive through S8) must exist. Required from S8: `src/factorflow/classification/scheduler.py` defining `claim_next_set`, `reclaim_interrupted_sets`, `ClaimedSet(set_id, run_id)`, `ReclaimedSet`; `src/factorflow/classification/settings.py` defining `ClassificationSettings`; `tests/integration/scheduler_support.py` (`migrate_all`, `open_pool`, `add_run`, `add_set`, `set_rows`); `tests/integration/test_scheduler_restart.py`; `tests/unit/test_classification_scheduler_sql.py`. Required from S2: `engine.build(conn, set_id, timeout_seconds) -> BuildResult`, `engine._STAGES`, `line_items.unresolved()`, `tests/integration/engine_support.py` (`add_instrument`, `add_bar`). If any is absent, STOP and report which hard dependency is not implemented. Then read: `engine_support.py` (exact helper signatures; the timeout and completion tests need an active instrument with a bar, otherwise `build` fails with `no price data held for any active instrument` before any timeout can occur), `tests/integration/test_engine_transaction.py` (how S2's TC-COMP-090 injects a `pg_sleep` stage through `_STAGES`), `tests/unit/test_api_reclaim_lifespan.py` (the `_RecordingWaiter` / `_RecordingDispatcher` doubles and the `asyncio.run` pattern: no async test plugin is installed) and `src/factorflow/api/app.py` lines 104-199 (`_run_reclaim_loop`, the shape this loop copies)

**Checkpoint**: Both prerequisites exist; helper names and signatures are known.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the expected behaviour from the acceptance criteria and mapped test cases.

Unit tests run the coroutine under `asyncio.run` with injected `wait_fn`, `dispatch_fn` and `stop_event`; the loop looks up `claim_next_set`, `build_claimed_set` and `reclaim_interrupted_sets` as module globals at call time, so tests substitute them with `monkeypatch.setattr(scheduler, name, fake)`. Doubles are module-local to the new test file; do not edit `test_api_reclaim_lifespan.py` (DEC-0064). Database tests are `@pytest.mark.postgres` with `# Implements TC-COMP-nnn`.

- [ ] T002 Create `tests/unit/test_classification_scheduler_loop.py` with its shared doubles only (no tests yet): `_RecordingWaiter` (records requested delays, sets a `stop_event` after a configurable number of waits, then `await asyncio.sleep(0)`), `_RecordingDispatcher` (records `(fn, args)` in order and runs `fn(*args)` synchronously), a `_settings(poll=5.0, timeout=300.0)` helper built with `ClassificationSettings(poll_interval_seconds=..., build_timeout_seconds=...)`, a scripted-claim factory (returns a list of values or raises, in order; `None` once exhausted), and a `_result(state)` factory for `BuildResult` (read its constructor from `engine.py`). Module docstring cites TC-COMP-083, 084, 085, 169 and the unresolved-warning row of design section 7 (depends on T001)
- [ ] T003 Implement TC-COMP-083 (Loop claims and builds via dispatcher; idle waits poll interval) in `tests/unit/test_classification_scheduler_loop.py`: `claim_next_set` scripted to return one `ClaimedSet` then `None`; `build_claimed_set` faked to return `_result("complete")` and record its arguments; `reclaim_interrupted_sets` faked to return `[]`; run `run_classification_loop(pool_double, _settings(5.0, 300.0), wait_fn=waiter.wait, dispatch_fn=dispatcher.dispatch, stop_event=waiter.stop)` under `asyncio.run`. Assert (a) the dispatcher saw, in order, `reclaim_interrupted_sets`, `claim_next_set`, `build_claimed_set`, `claim_next_set`; (b) the build call carried `(pool_double, claimed.set_id, 300.0)` (the timeout is `settings.build_timeout_seconds`); (c) `waiter.delays == [5.0]`: no wait between the claim, the build and the second claim (never sleeps after a build) and exactly one wait after the idle claim; (d) the loop returned once the stop event was set. A second case where the first claim is `None`: delays `[5.0]`, no build dispatched (depends on T002)
- [ ] T004 Implement TC-COMP-084 (Raising claim is logged and the loop continues) in `tests/unit/test_classification_scheduler_loop.py`: `claim_next_set` scripted to raise `RuntimeError("boom")` then return `None`; with `caplog` at `ERROR`, assert one record from the logger `factorflow.classification.scheduler` with `exc_info` set to the `RuntimeError` (a `log.exception` call, OPS-ERR-001), that the second claim was dispatched (the loop continued), that `waiter.delays == [5.0]` (a failed iteration still waits the poll interval and does not spin), and that the loop returned normally. Add: `build_claimed_set` raising `OSError` for a claimed set is logged the same way and the loop continues; an `asyncio.CancelledError` raised by the dispatcher propagates out of the loop (it is a `BaseException`, so `except Exception` must not swallow it; shutdown cancels the task) (depends on T002, same file)
- [ ] T005 Implement TC-COMP-169 (Reclaim runs once before the first claim) in `tests/unit/test_classification_scheduler_loop.py`: run the loop for three idle iterations (waiter stops after the third wait); assert the dispatched sequence begins with `reclaim_interrupted_sets` and `reclaim_interrupted_sets` appears exactly once overall, before every `claim_next_set`, with the pool as its only argument. Add: a loop whose `stop_event` is already set still dispatches reclaim first (reclaim is unconditional at start) and then makes at most one claim iteration (depends on T002, same file)
- [ ] T006 [P] Add to `tests/unit/test_classification_scheduler_loop.py` the cases no mapped TC names, each citing the AC in its docstring (AC-10, DAC-E2-S9-1): (a) unresolved line items are warned: `monkeypatch.setattr(line_items, "unresolved", lambda: ["net_income", "revenue"])` gives exactly two `WARNING` records on the scheduler logger, one naming each line item, emitted before the first claim is dispatched and not repeated on later iterations; `lambda: []` gives none (design section 7 row "Unresolved line items are warned"); (b) off the event loop by default: with `dispatch_fn` omitted, a faked `claim_next_set` records `threading.get_ident()` and the test asserts it differs from the event loop thread's id (the default dispatcher is `asyncio.to_thread`); with `wait_fn` omitted the loop still runs when the stop event is set by a fake build, using a `poll_interval_seconds` of 1 and no real sleep reached (set the stop event inside the final faked claim so the post-claim path breaks before waiting is needed, or patch `asyncio.sleep` in the scheduler module with a recording coroutine); (c) after a build the stop event is honoured: with the stop event set by the faked build and a second claim scripted to return a set, the loop returns without dispatching that second claim (see Resolved Conflicts, stop check after a build); (d) a failed build is logged without raising: `_result("failed")` yields an INFO record containing the set id, the run id and `failed` (depends on T002, same file)
- [ ] T007 [P] Implement TC-COMP-085 (ingestion_main imports nothing from classification) in a new file `tests/unit/test_ingestion_isolation.py`: (a) static: parse `src/factorflow/ingestion_main.py` with `ast` and assert no `Import` or `ImportFrom` names a module starting `factorflow.classification` (including `from factorflow import classification`); (b) dynamic and transitive: run `subprocess.run([sys.executable, "-I", "-c", "import sys, factorflow.ingestion_main; print(sorted(m for m in sys.modules if m.startswith('factorflow.classification')))"], capture_output=True, text=True, check=True)` and assert the printed list is `[]` (a transitive import through any ingestion module would show here). Placed in a new file beside `tests/unit/test_api_isolation.py` rather than inside the loop test file, because the subprocess test needs no loop doubles; design section 7 names the loop test file for it, a naming difference that changes no behaviour (Resolved Conflicts). The test passes before the loop exists only if ingestion is already clean; it is a guard, so also assert the `factorflow.classification` package was importable in the same interpreter (`import factorflow.classification.scheduler` succeeds in a second subprocess) so a typo in the module prefix cannot make the check vacuous (depends on T001)
- [ ] T008 [P] Add `build_claimed_set` unit tests to `tests/unit/test_classification_scheduler_loop.py` (AC-11, AC-20, DAC-E2-S9-4): with a `MagicMock` pool whose `connection()` is a context manager yielding a connection double and `monkeypatch.setattr(scheduler.engine, "build", fake)` (reach `build` through the module attribute `engine.build`, never `from ... import build`, so the substitution is seen), assert `build_claimed_set(pool, set_id, 12.5)` checks out exactly one connection, calls `build(conn, set_id, 12.5)` once with that connection, returns the engine's `BuildResult` unchanged, and releases the connection (the context manager exited) whether `build` returns or raises (depends on T002, same file)
- [ ] T009 Implement TC-COMP-092 (Short build timeout reaches the engine and fails the set) in `tests/integration/test_scheduler_restart.py` (S8 created this file; append, keep its fixture and imports): module-local fixture `migrate_all(postgres_connection_string)`, `open_pool`, one active instrument with a bar (S2's `add_instrument`, `add_bar`), one `succeeded` run via `add_run`, `monkeypatch.setattr(engine, "_STAGES", [sleeping_stage])` where the stage executes `SELECT pg_sleep(5)` (as S2's TC-COMP-090 does, so the timeout is hit deterministically even though `set_context.sql` could finish within the budget). Settings: `ClassificationSettings.model_construct(poll_interval_seconds=1.0, build_timeout_seconds=0.05)` with a comment that `model_construct` skips the `ge=1` and poll-below-timeout validators on purpose, because a 50 ms timeout is the only way to make a unit-sized store "too short" and the validators are already proven in S8. Run `asyncio.run(run_classification_loop(pool, settings, wait_fn=stop_after_first_wait, stop_event=stop))` with the default dispatcher, so the call crosses a real thread and a real pool. Assert (a) the run's set is `failed` with a `failure_reason` starting `QueryCanceled` and containing `timeout` (the engine's own format, S2 T008); (b) `count` of rows in `factor_input`, `factor_classification` and `classification_set_factor` for the set is zero; (c) the loop returned and logged one INFO record naming the set and `failed`; (d) total elapsed time is under 4 seconds (the stage sleeps 5 s, so the timeout, not the sleep, ended the build) (depends on T001, T008)
- [ ] T010 Add the restart-then-build end-to-end case to `tests/integration/test_scheduler_restart.py` (DAC-E2-12, AC-10, AC-20, DAC-E2-4; the design's acceptance criterion 10; no mapped TC): run A (`succeeded`, earlier `ended_at`) with a stale `building` set (`add_set`), run B (`partial`, later `ended_at`) with none, run C (`failed`) with none, one active instrument with a bar, `monkeypatch.setattr(engine, "_STAGES", [])`, valid settings (`poll 1`, `timeout 60`), the default dispatcher. Run the loop until its first idle wait. Assert A's set is `failed` with `failure_reason` equal to `interrupted: the application restarted during the build`; B has exactly one set and it is `complete`; C has none; no run has more than one set; the single-building index was never violated (no `building` row remains). Then run the loop a second time and assert nothing changes (no set rebuilt, no reclaim of a non-`building` set) (depends on T009, same file)
- [ ] T011 [P] Add `tests/unit/test_classification_scheduler_shapes.py` cases (extending S8's new file is forbidden by DEC-0064, so make `tests/unit/test_classification_loop_signature.py`) (AC-10, design 2.4): with `inspect.signature`, `run_classification_loop` is a coroutine function with parameters `(pool, settings, wait_fn=None, dispatch_fn=None, stop_event=None)` in that order and `build_claimed_set` has `(pool, set_id, timeout_seconds)`; `scheduler.py` source contains no `time.sleep`, no `threading` import, and no `import psycopg` of a blocking call made directly from a `async def` body (assert via `ast`: the only `await` targets inside `run_classification_loop` are `dispatch(...)`/`wait(...)`/`dispatch_fn`-derived callables, so no synchronous database call can run on the event loop); the module does not import `factorflow.ingestion` (depends on T001)

**Checkpoint**: All tests are written and fail (the loop and `build_claimed_set` do not exist). The signature, isolation and existing S8 tests still run.

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass.

- [ ] T012 Edit `src/factorflow/classification/scheduler.py` (add only; S8's functions stay as delivered). Add imports `asyncio`, `logging`, `Awaitable`/`Callable`, `ClassificationSettings` and `from factorflow.classification import engine, line_items` (module imports, so tests can substitute `engine.build` and `line_items.unresolved`). Add `build_claimed_set(pool, set_id, timeout_seconds) -> engine.BuildResult`: `with pool.connection() as conn: return engine.build(conn, set_id, timeout_seconds)`. Add `async def run_classification_loop(pool, settings, wait_fn=None, dispatch_fn=None, stop_event=None) -> None` verbatim from design 2.4 (`wait = wait_fn or asyncio.sleep`, `dispatch = dispatch_fn or asyncio.to_thread`, `log = logging.getLogger(__name__)`; `await dispatch(reclaim_interrupted_sets, pool)` once; one `log.warning` per `line_items.unresolved()` name; `while True` with `try`, claim, build with `settings.build_timeout_seconds`, INFO log of set, run and `result.state`, `continue`, `except Exception: log.exception("classification scheduler iteration failed")`, stop checks around `await wait(settings.poll_interval_seconds)`), with exactly one addition: after a successful build and before `continue`, `if stop_event is not None and stop_event.is_set(): break` (T006c; Resolved Conflicts). Call `claim_next_set(pool)` with the pool only (S8 keeps `at` keyword-only and defaulted). Annotate `pool: "ConnectionPool[Any]"` as S8 does; `dispatch_fn: Callable[..., Awaitable[Any]] | None`; `mypy src` must pass. Do not call `reclaim_interrupted_sets` anywhere else (depends on T003-T011)
- [ ] T013 Update the one delivered S8 assertion this story falsifies, in `tests/unit/test_classification_scheduler_sql.py` (CAP-002-E2-S8 T012): remove the check (e) that `scheduler.py` does not import `asyncio`, and nothing else in that file (checks (a)-(d) stay and must still pass). Replace it with a check that `scheduler.py` contains no `DELETE`/`UPDATE` of an append-only classification table is already covered by (d), so add nothing. Cite in the commit message and in a one-line comment where the assertion stood: "the loop (CAP-002-E2-S9) lives in this module, so asyncio is imported here". This is the only edit this plan makes to a delivered test file; the edit is necessary because S8 used the absence of `asyncio` as its boundary guard and the story and design place the loop in the same module (DEC-0064 forbids editing delivered tests for convenience, not where the story's own deliverable makes one assertion false) (depends on T012)

**Checkpoint**: `uv run pytest tests/unit/test_classification_scheduler_loop.py tests/unit/test_ingestion_isolation.py tests/unit/test_classification_loop_signature.py tests/unit/test_classification_scheduler_sql.py` and `uv run pytest -m postgres tests/integration/test_scheduler_restart.py tests/integration/test_scheduler_claim.py` pass.

---

## Phase 4: Integration

**Purpose**: Confirm the loop is clean beside the rest of the suite. Nothing is wired into `app.py` here: the lifespan task is CAP-002-E3-S6.

- [ ] T014 Run every command in the Validation Plan from the repository root and fix failures in files this plan names; a failure in any other file is reported, not patched. Confirm that `tests/unit/test_api_isolation.py` and `tests/unit/test_api_reclaim_lifespan.py` still pass, that `git diff --stat` shows no change to `src/factorflow/api/app.py`, `pyproject.toml`, `src/factorflow/ingestion_main.py` or `src/factorflow/config/settings.py`, and that `python -I -c "import factorflow.ingestion_main, sys; assert not [m for m in sys.modules if m.startswith('factorflow.classification')]"` exits 0 (depends on T012, T013)

**Checkpoint**: The whole suite is green with the loop in place and ingestion untouched.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T015 Re-read traceability: T003, T004, T005, T007 and T009 carry `# Implements TC-COMP-nnn` above the test they implement (083, 084, 169, 085, 092); every other new test cites its AC or DEC in its docstring; `git diff --stat` touches only `scheduler.py`, the four new/extended test files named in this plan, and the single assertion in `test_classification_scheduler_sql.py`
- [ ] T016 After each TDD cycle in T003-T014 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S9-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S8 | hard | Existing graph edge. Supplies `claim_next_set`, `reclaim_interrupted_sets`, `ClaimedSet`, `ClassificationSettings`, `scheduler.py` itself, `tests/integration/scheduler_support.py` and `test_scheduler_restart.py` (T001, T009, T010, T012) |
| CAP-002-E2-S2 | hard | Existing graph edge. Supplies `engine.build`, `BuildResult`, `_STAGES`, `line_items.unresolved()` and `tests/integration/engine_support.py` (T001, T008, T009, T012) |
| CAP-002-E2-S1 | context | Transitive through S8 (migration `0006`); this plan imports nothing S1 creates directly |
| CAP-002-E2-S7 | context | Owns the 3000-instrument volume test (AC-11) that builds through the engine; this story supplies only the timeout pass-through and imports nothing S7 creates |
| CAP-002-E3-S6 | reverse | Existing graph edge `CAP-002-E3-S6: [CAP-002-E2-S9, ...]`. Creates the lifespan task that calls `run_classification_loop` and cancels it before pool close |

### Task Dependencies
- T001: No dependencies
- T002: Depends on T001
- T003, T004, T005: Depend on T002 (same file, sequential)
- T006, T008: Depend on T002; same file as T003-T005 so not parallel with them, parallel with T007 and T011
- T007, T011: Depend on T001 only; different files, parallel with everything in Phase 2
- T009: Depends on T001, T008 (same integration file chain); T010 depends on T009
- T012: Depends on T003-T011 (tests first)
- T013: Depends on T012
- T014: Depends on T012, T013
- T015: Depends on T014
- T016: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: T007 and T011 each own a file and run beside the loop test chain (T003-T006, T008) and the integration chain (T009-T010)
- Phase 3: none (T012 then T013)

---

## Validation Plan

### Constitution-Defined Commands
- Build: `uv build`
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (also `uv run pytest` for the full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- DAC-E2-S9-1 / TC-COMP-083: claim and build go through the injected dispatcher; one wait per idle iteration, none after a build (T003, T006b)
- DAC-E2-S9-2 / TC-COMP-084: a raising claim is logged by `log.exception` and the loop continues (T004)
- DAC-E2-S9-3 / TC-COMP-169: reclaim dispatched first and exactly once (T005, T010)
- DAC-E2-S9-4 / TC-COMP-092: a 50 ms timeout reaches the engine; the set is `failed` with a `QueryCanceled` timeout reason and no classification rows (T009)
- DAC-E2-S9-5 / TC-COMP-085: `factorflow.ingestion_main` loads no `factorflow.classification` module, statically and at runtime (T007)
- DAC-E2-12 / AC-10: stale `building` set failed, then the next qualifying run built, non-qualifying run untouched (T010)

---

## Notes

### Resolved Conflicts

- **S8's plan guards its boundary with "`scheduler.py` does not import `asyncio`"; this story's deliverable makes that false.** CAP-002-E2-S8 T012(e) asserts the absence of an `asyncio` import in `scheduler.py` so a leaked loop is caught; the story (S9) and design 2.4 place `run_classification_loop` in that same module. Governing rule: story acceptance criteria and the design's file placement outrank a sibling plan's test guard (a test specification and its guards rank below the story). Established by: S9 description ("Adds `run_classification_loop` to `src/factorflow/classification/scheduler.py`") against S8 T012(e). Resolution: T013 removes that one assertion once the loop lands and edits nothing else. DEC-0064 (delivered test files are not edited) concerns tests whose behaviour the new story does not change; here the edit is forced by the story's own file placement, so it is the minimal exception, and is named so the reviewer can see it. Flag for S8: its plan should have scoped the guard to a stated condition rather than a permanent invariant.
- **Design snippet checks `stop_event` only when idle; the story needs shutdown to be reachable under a backlog.** In design 2.4 the `continue` after a build skips both stop checks, so a long backlog of qualifying runs could never see the stop event. No AC addresses it. Resolved by the ladder's step 5 (local precedent): `_run_reclaim_loop` in `app.py` honours its stop event on every pass. The plan adds one `if stop_event is not None and stop_event.is_set(): break` after a successful build; the look-again-at-once and never-sleep-after-a-build behaviour are unchanged. Established by: DAC-E2-S9-1 (the injected `stop_event` is the termination mechanism) and design 2.4's own idle checks. Flag for the next revision of the scheduler design, section 2.4.
- **Design section 7 puts the ingestion-import test in `test_classification_scheduler_loop.py`; this plan puts it in `tests/unit/test_ingestion_isolation.py`.** The row's own wording is "`tests/unit/test_api_isolation.py` pattern, new assertion in ...". The story's Technical Details name only the loop file. Both are test-placement prose that changes no behaviour; the subprocess check needs none of the loop doubles. TC-COMP-085 and DAC-E2-S9-5 are satisfied either way.
- **TC-COMP-092's precondition ("`build_timeout_seconds` too short for the store") against `ClassificationSettings`'s `ge=1` lower bound.** A realistic "too short" value is below 1 s, which the validated settings refuse. The test builds its settings with `model_construct` to carry a 50 ms timeout through the loop unchanged, and forces the build to exceed it with a `pg_sleep` stage (the pattern of S2's TC-COMP-090). The `ge=1` bound is S8's (design 2.3) and is not changed here.
- **Story status not changed.** The story is approved and any edit invalidates the approval (constraint 7); the frontmatter stays `todo`, as in S1-S8.

### Open Gaps

None of these is a bound or default this story invents. All numeric values (poll 5 s, timeout 300 s, the `ge=1` lower bounds) are S8's and are PROVISIONAL under DEC-0054 and DEC-0067; this plan adds no new provisional value.

- **Reclaim failing at start is not caught.** In design 2.4 `await dispatch(reclaim_interrupted_sets, pool)` sits outside the `try`. If it raises (for example the database is unreachable at that moment), the exception ends the task, no claim is ever made, and nothing but the task's done-callback sees it. No artifact says whether start-up should retry. This plan follows the design as written (the exception propagates; it satisfies DAC-E2-12's "before any new claim" because no claim follows) and adds no retry. CAP-002-E3-S6, which creates the task, should log or restart a task that exits unexpectedly. Flag for the next revision of the scheduler design section 2.4 and 14 (owner decision).
- **A build that raises leaves its set `building` until the next application start.** `engine.build` records `failed` itself, but if recording fails (connection lost, S2's documented non-caught case) the loop logs and continues, while the single-building index then makes every later claim return `None`, so classification stalls until a restart reclaims the row (DEC-0067's design, section 14 item 1). Not repaired here. Flag for the owner with design 14 item 1.

### Other Notes

- Graph: `CAP-002-E2-S9: [CAP-002-E2-S8, CAP-002-E2-S2]` is already correct and complete for everything this plan imports. No edge was added and `dependencies.yaml` is unchanged.
- Register check: the resolution-register head start has no entry for S9 and none was needed. Two facts it does not state, now recorded here: `scheduler.py`, `ClaimedSet` and `tests/integration/test_scheduler_restart.py` come from S8, and S8's plan carries a test that this story must edit (T013). The register's statement that `src/factorflow/classification/` does not exist yet still holds at plan time. The register's "DEC-0121 stages go above `_classification_stage`" affects `engine._STAGES` only; this story monkeypatches `_STAGES` in its integration tests and is indifferent to the stage order.
- `build_claimed_set` is named by the design (2.4) but not defined there; this plan defines it in `scheduler.py` beside the loop, as the design's text "checks out one connection for the whole build and calls `factor_engine.build`" describes. It uses `engine.build` through the module attribute so tests can substitute it.
- Under a driver that commits once per stage, the TDD-evidence file records `commit_hash: stage` (T016).
