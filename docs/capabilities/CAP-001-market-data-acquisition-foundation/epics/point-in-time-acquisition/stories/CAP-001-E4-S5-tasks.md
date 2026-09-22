---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S5-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-16
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.1"
  model: gpt-5
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-16T16:01:15Z
  source_artifacts:
    - id: CAP-001-E4-S5
      version: "1"
    - id: CAP-001-component-design-acquisition-runner
      version: "approved"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-massive-client
      version: "approved"
    - id: CAP-001-component-design-runtime-config
      version: "approved"
    - id: CAP-001-component-design-rate-limit-governor
      version: "approved"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E4-S5 — Acquisition Run Loop

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S5.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E4-tasks`
**Date**: 2026-09-16

## Summary

Implement the ingestion-container entrypoint and sequential acquisition loop. The runner claims work, snapshots the active roster once, refreshes the claim and observes cancellation between instruments, fetches and writes each instrument independently, then finalises the run from recorded results while remaining alive to poll for the next run.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-3 | Acquire reference, daily prices, fundamentals, and corporate actions for every reached active instrument. | T002, T006, T007, T008 |
| AC-4 | Complete a run of up to 3,000 instruments without manual intervention. | T005, T006, T011 |
| AC-9 | Derive the terminal run outcome from written results. | T003, T006, T009 |
| AC-11 | Record an unknown/provider-failed instrument and continue. | T003, T007, T008 |
| AC-19 | Observe cancellation between instruments, retain committed coverage, and finalise cancelled. | T003, T006, T009 |
| AC-23 | Keep polling when no run can be claimed. | T004, T006 |
| DAC-E4-12 | Read the active roster exactly once when a run is claimed. | T002, T006 |
| DAC-E4-13 | Acquire nothing and finalise failed when claimed depth is absent. | T002, T006, T009 |
| DAC-E4-14 | Process every instrument through its own writer transaction. | T002, T007, T008 |
| DAC-E4-S5-1 | Heartbeat and check cancellation at the same iteration point. | T003, T006 |
| DAC-E4-S5-2 | Stop before the next instrument after observed cancellation. | T003, T006, T009 |
| DAC-E4-S5-3 | Stop without further writes after a lost claim. | T003, T006 |
| DAC-E4-S5-4 | Record provider errors per instrument and continue. | T003, T007, T008 |
| DAC-E4-S5-5 | Finalise from written results rather than requested work. | T003, T009 |
| DAC-E4-S5-6 | Wait the configured interval and retry an empty claim. | T004, T006 |
| DAC-E4-S5-7 | Rebuild the provider client after a credential change at claim time. | T004, T006 |
| DAC-E4-S5-8 | Keep only one instrument payload in flight and expose journal progress through per-instrument writes. | T005, T006, T011 |
| DAC-E5-4 | Let `run-journal.finalise` compute the outcome. | T003, T009 |
| DAC-E5-10 | Refresh the claim heartbeat alongside cancellation observation. | T003, T006 |
| DAC-E5-13 | Stop after `heartbeat` reports a reclaimed claim. | T003, T006 |
| DAC-E1-10 | Reload the credential at claim time and rebuild the client only when its fingerprint changes. | T004, T006 |

## Phase 1: Setup

**Purpose**: Establish the ingestion package and PostgreSQL fixture boundary required to exercise the runner against the already-planned journal, writer, roster, and provider seams.

- [x] T001 Create `src/factorflow/ingestion/__init__.py` and extend `tests/conftest.py` with a `migrated_runner_connection` fixture that applies the prerequisite CAP-001 migrations through the run-journal migration; keep runner database tests `postgres`-marked and isolated per test database.

**Checkpoint**: Runner tests have an importable ingestion package and a disposable PostgreSQL schema containing active instruments, runs, coverage, and result tables.

---

## Phase 2: Tests (TDD)

**Purpose**: Write focused RED tests at the provider, journal, roster, planner, and writer boundaries before implementing the orchestration loop.

### Mandatory Component Tests

- [x] T002 [P] Create `tests/integration/test_runner_acquires.py`, `tests/integration/test_runner_depth.py`, and `tests/integration/test_runner_transactions.py` for TC-COMP-003, TC-COMP-004, TC-COMP-146, TC-COMP-147, and TC-COMP-148; stub the provider boundary, seed a claimed run and active roster, assert the roster is read once, all four data types are sent through the writer for each reached instrument, a missing claimed depth makes no provider or writer call and finalises failed, and a simulated interruption after one committed instrument leaves it durable while a later run fetches only the remaining coverage. Add a `# Implements TC-COMP-...` trace comment for every mapped case.
- [x] T003 [P] Create `tests/integration/test_runner_isolation.py`, `tests/integration/test_runner_cancel.py`, and `tests/integration/test_runner_reclaim.py` for TC-COMP-009, TC-COMP-011, TC-COMP-019, TC-COMP-175, TC-COMP-176, TC-COMP-177, TC-COMP-178, TC-COMP-179, TC-COMP-239, TC-COMP-245, and TC-COMP-248; assert heartbeat/cancellation occur together before each instrument, cancellation leaves the next instrument untouched and finalises cancelled, a false heartbeat prevents later writes, typed `InstrumentNotFound` and exhausted provider failures record results then continue, and finalisation is delegated without a caller-selected outcome. Add matching trace comments.
- [x] T004 [P] Create `tests/integration/test_runner_credential.py` and `tests/unit/test_ingestion_main.py` for TC-COMP-023, TC-COMP-180, TC-COMP-181, and TC-COMP-301; use a controlled wait function to assert an empty claim sleeps for `settings.run.poll_interval_seconds` then polls again, and assert a changed credential replaces the client before the first fetch while an unchanged one preserves the existing client. Add matching trace comments.
- [x] T005 [P] Create `tests/integration/test_runner_volume.py` for TC-COMP-182; execute 3,000 stubbed roster entries, assert one-at-a-time processing with no retained earlier payload collection, and assert each completed instrument becomes observable through its writer/journal result before the next begins. Add a `# Implements TC-COMP-182` trace comment.

### Additional Unit Tests

- [x] T006 [P] Add loop-boundary tests in `tests/unit/test_runner_reason.py` and `tests/unit/test_ingestion_main.py`: provider exception reasons are redacted before the writer/journal sees them, startup loads validated settings and exits non-zero through the entrypoint on configuration failure, and the runner never calls the API process.

**Checkpoint**: Tests make the claimed-run lifecycle, one-time roster snapshot, cooperative stop points, client rotation, and constant-per-instrument memory observable and fail because the runner and entrypoint do not exist.

---

## Phase 3: Core Implementation

**Purpose**: Implement the typed runner state and the sequential claimed-run loop using the existing component contracts rather than direct SQL.

- [x] T007 Create the runner dependencies and `run_once`/claimed-run execution flow in `src/factorflow/ingestion/runner.py`; call `run-journal.claim_next`, reload and fingerprint the credential at claim time, rebuild `MassiveClient` only when the fingerprint changes, finalise a no-depth claim as failed before roster/provider access, and read `instrument-list-service`'s active roster exactly once after a valid claim.
- [x] T008 In `src/factorflow/ingestion/runner.py`, process the fixed roster sequentially: at the top of every iteration call the run-journal heartbeat and cancellation check together, exit without another planner/fetch/write when cancellation is requested or the claim is lost, call `plan_fetches` per data type, fetch the four Massive data types, and pass one instrument's parsed data and actual ranges to `write_instrument` so its transaction remains the boundary.
- [x] T009 In `src/factorflow/ingestion/runner.py`, map typed provider errors to the documented `not_found` or `failed` per-data-type result with a redacted reason, continue to the next instrument after a per-instrument failure, and call `run-journal.finalise(run_id)` after normal completion or observed cancellation without supplying a terminal outcome.

**Checkpoint**: The runner owns orchestration only: journal methods own lifecycle transitions, `plan.py` owns missing-range calculation, `massive-client` owns provider interpretation, and `writer.py` owns the one-instrument transaction.

---

## Phase 4: Integration

**Purpose**: Keep the ingestion container alive and connect validated runtime settings to the runner without crossing into the API process.

- [x] T010 Create `src/factorflow/ingestion_main.py` to load `Settings`, configure structured/redacted logging, construct the runner's journal, roster, planner, writer, provider-client factory, and wait dependencies, then repeatedly invoke the runner so an empty claim waits exactly `settings.run.poll_interval_seconds` before the next attempt; return a non-zero process status naming the invalid setting on configuration failure.

**Checkpoint**: The ingestion container has an independently runnable entrypoint that polls indefinitely, uses only the shared database handoff, and does not import or call application API routes.

---

## Phase 5: Polish

**Purpose**: Verify the orchestration contract against PostgreSQL, the 3,000-instrument scale scenario, and the repository Python checks.

- [x] T011 Run the targeted `postgres` runner tests in `tests/integration/test_runner_acquires.py`, `tests/integration/test_runner_depth.py`, `tests/integration/test_runner_isolation.py`, `tests/integration/test_runner_cancel.py`, `tests/integration/test_runner_reclaim.py`, `tests/integration/test_runner_credential.py`, and `tests/integration/test_runner_volume.py`; manually mutate the cancellation/lost-claim guard and client-fingerprint branch in a local uncommitted copy to confirm the tests fail, then restore the implementation before continuing.
- [x] T012 Run `uv run pytest -m postgres`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv build` from the repository root; record an unavailable container runtime rather than representing a partial test run as successful.

**Checkpoint**: The complete runner behavior is covered by mapped tests, mutations of the stop and rotation behavior are caught, and the repository validation commands pass.

## Dependencies & Execution Order

### Task Dependencies

- T001 prepares the package and database fixture used by T002, T003, T004, and T005.
- T002 through T006 must be written and observed RED before T007 through T009.
- T007 establishes claim, credential, depth, and roster behavior; T008 depends on T007; T009 depends on T008.
- T010 depends on the runnable loop from T007 through T009. T011 depends on T001 through T010; T012 depends on T011.

### Parallel Opportunities

- T002 through T005 cover separate runner concerns and can be written in parallel after T001.
- T006 is independent of the PostgreSQL cases and can proceed in parallel with T002 through T005.

### Phase Dependencies

- Phase 2 must produce observed RED results before Phase 3 begins.
- Phase 3 must be complete before the entrypoint work in Phase 4; Phase 5 follows the integrated runner.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest` and `uv run pytest -m postgres`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Use a real PostgreSQL 16 test container with the prerequisite schema migrations; substitute the Massive client at its typed boundary and never make a network request.
- Verify the roster is read once after a valid claim, each reached instrument calls all four planned fetches, and no-depth claims finalise failed without starting acquisition.
- Verify cancellation and a false heartbeat occur before the next instrument, preserve already committed coverage, and prohibit later writer calls.
- Verify `InstrumentNotFound` and exhausted provider failures produce an observable per-instrument result and allow later roster entries to complete; verify finalisation receives only the run ID and derives its state from results.
- Verify a changed credential creates the next client before its first fetch, an unchanged credential retains the client, empty claims use the configured poll interval, and a 3,000-entry run retains no per-roster payload accumulation.

## Notes

### Resolved Conflicts

- `component-design-acquisition-runner.md` §2.5 describes a single journal round trip, while its API table and `component-design-run-journal.md` §2.4 define separate `heartbeat` and `cancellation_requested` operations. The story's DAC-E4-S5-1 requires only the same iteration point. The explicit interfaces govern: issue both operations at the top of each iteration before planning or writing; do not invent a combined journal API.
- The story describes the runner recording provider errors, while `CAP-001-E4-S3-tasks.md` assigns `run_instrument_result` insertion to `writer.py`. The existing S3 task plan and the writer design's one-transaction contract govern: the runner maps typed provider failures into writer-facing result input rather than inserting journal rows directly.

### Open Gaps

- **PROVISIONAL — awaiting owner confirmation (2026-09-11):** No approved artifact specifies the concrete dependency-injection shape for the runner's wait operation, clock, journal/roster access, or provider-client factory. This plan adopts explicit constructor dependencies, including an injected wait callable, so unit tests can observe polling without real time and the production entrypoint supplies the configured dependencies. It is the minimal shape consistent with the specified in-process interfaces and belongs in the next revision of `component-design-acquisition-runner.md` §2.2.
- **PROVISIONAL — provider daily-bars adjustment (2026-09-16):** The Massive-client Open Questions leave adjusted versus unadjusted daily bars unresolved. S5 has no parameter or acceptance criterion that selects that provider option, so the runner will invoke the established daily-bars client operation without adding a selector, default, or transformation. This preserves the client boundary and makes no unsupported provider choice; the owning `component-design-massive-client.md` must absorb the owner decision before its behavior is implemented.

### Other Notes

- CAP-001-E4-S3 supplies `write_instrument` and its one-instrument transaction, CAP-001-E4-S4 supplies `plan_fetches`, CAP-001-E3-S1 and CAP-001-E3-S4 supply typed provider reads and pacing, and CAP-001-E5-S2 supplies the claim/journal contract. This story integrates those interfaces and must not duplicate their database or provider logic.
- The resolution register is correct for S5: `history_depth_years` is bounded to 1–50, the claim returns the run ID and depth, the poll interval is 5 seconds, and the runtime-config Open Questions resolve credential reload and heartbeat values. Its adjusted/unadjusted-bars note is now recorded as an explicit S5 provisional boundary; no correction is required.
