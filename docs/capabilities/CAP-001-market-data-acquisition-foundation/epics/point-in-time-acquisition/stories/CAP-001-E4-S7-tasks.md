---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S7-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-11
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-11T23:00:00Z
  source_artifacts:
    - id: CAP-001-E4-S7
      version: "1"
    - id: CAP-001-component-design-acquisition-runner
      version: "approved"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-observation-writer
      version: "approved"
    - id: CAP-001-component-design-market-data-store
      version: "approved"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E4-S7 — Volume and Resumability at 3000 Instruments

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S7.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E4-tasks`
**Date**: 2026-09-11

## Summary

Harden the acquisition runner delivered by CAP-001-E4-S5 with PostgreSQL-backed volume and interruption tests. The work proves that the runner keeps only the active instrument in memory, reuses its database boundary across a long run, preserves only committed coverage after an interruption, and lets the run-journal reclaim release the next requested run. It records elapsed time for diagnostics only because no approved duration target exists.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-4 | A run covering up to 3,000 named instruments completes without manual intervention. | T002, T004, T005, T007 |
| AC-6 | A later run does not duplicate, overwrite, or remove previously acquired data. | T003, T006 |
| AC-12 | An interrupted run leaves no coverage that presents incomplete work as complete. | T003, T005, T006 |
| AC-20 | A stopped run becomes terminal and does not prevent a later run starting. | T003, T006 |
| DAC-E4-14 | Every instrument is committed in its own transaction, losing at most the active instrument on interruption. | T003, T005 |
| DAC-E4-S7-1 | A 3,000-instrument run has bounded memory with no per-instrument result accumulation. | T002, T004, T005 |
| DAC-E4-S7-2 | After a mid-run interruption, committed instruments are not re-fetched and the remainder completes. | T003, T006 |
| DAC-E4-S7-3 | A long run does not leak database connections across instruments. | T002, T004, T005 |
| DAC-E4-S7-4 | Coverage after interruption contains exactly committed instruments and no partial active-instrument range. | T003, T005 |
| DAC-E4-S7-5 | Tests assert completion and resumability, and log elapsed time without a duration threshold. | T002, T004, T007 |

## Phase 1: Setup

**Purpose**: Extend the planned runner test boundary so long-run tests can observe committed state, live payload ownership, and database connection use without a live provider.

- [ ] T001 Extend `tests/conftest.py` and the CAP-001-E4-S5 runner fixture support to apply all prerequisite migrations through the run-journal reclaim schema, expose isolated PostgreSQL connections for acquisition-run, observation-writer, coverage, and result assertions, and provide deterministic stub provider/writer observability for a 3,000-item roster.

**Checkpoint**: PostgreSQL-marked runner tests can seed a claimed run and inspect transactions, coverage, results, and connection state without network access.

---

## Phase 2: Tests (TDD)

**Purpose**: Add failing behavioral tests for volume, connection reuse, interruption, reclaim, and the intentionally non-SLA duration measurement before changing runner behavior.

### Mandatory Component Tests

- [ ] T002 [P] Extend `tests/integration/test_runner_volume.py` for TC-COMP-004, TC-COMP-190, TC-COMP-192, and TC-COMP-194; run 3,000 stubbed instruments through the runner, record elapsed time as test diagnostic output only, assert all entries complete without intervention, assert no result or payload collection grows with completed instruments using the runner/provider test seam, and sample PostgreSQL backend connection identity/count before and after the run to prove no per-instrument connection growth. Add `# Implements TC-COMP-004`, `# Implements TC-COMP-190`, `# Implements TC-COMP-192`, and `# Implements TC-COMP-194` trace comments.
- [ ] T003 [P] Create `tests/integration/test_runner_resume.py` for TC-COMP-006, TC-COMP-012, TC-COMP-020, TC-COMP-148, TC-COMP-191, and TC-COMP-193; block the stub provider during a chosen in-flight instrument, terminate the runner path before its writer transaction commits, invoke the application-side reclaim sweep, start a later requested run, and assert previously committed instruments are not fetched again, the active instrument has neither a result nor coverage, the remainder completes, and the abandoned run no longer blocks the queue. Add a matching `# Implements TC-COMP-...` trace comment for every mapped case.

### Additional Unit Tests

- [ ] T004 [P] Add focused instrumentation tests in `tests/unit/test_runner_volume_support.py` for the long-run test doubles: each completed instrument releases its parsed payload before the next fetch, diagnostic elapsed-time reporting creates no pass/fail threshold, and the connection sampler counts only connections opened by the test fixture.

**Checkpoint**: The suite has observed RED failures for bounded active payload ownership, stable connection use, post-interruption coverage truthfulness, reclaim, and resumed acquisition.

---

## Phase 3: Core Implementation

**Purpose**: Make the already-planned sequential runner meet the new observability and resource-lifetime assertions without weakening its one-instrument transaction boundary.

- [ ] T005 Update `src/factorflow/ingestion/runner.py` only as required by the RED tests: retain no per-instrument parsed payload, result, or coverage collection after `write_instrument` returns; preserve the single claimed-run dependency set and database/pool lifetime across the roster; and keep the writer transaction as the only coverage/result commit boundary.
- [ ] T006 Update `src/factorflow/ingestion/runner.py` and `src/factorflow/runs/reclaim.py` only as required by the RED resume test so an interrupted runner stops before the active writer transaction commits, a reclaimed claim cannot accept subsequent writes, and a later claimed run relies on coverage planning and idempotent writer behavior rather than re-fetching committed instruments.

**Checkpoint**: The runner releases active-instrument state after each transaction, cannot write after reclaim, and resumes from durable coverage without a new persistence path.

---

## Phase 4: Integration

**Purpose**: Exercise the runner, writer, coverage, and application-side reclaim contracts together against PostgreSQL.

- [ ] T007 Run `uv run pytest -m 'postgres and slow'` for `tests/integration/test_runner_volume.py` and `tests/integration/test_runner_resume.py`; manually mutate the active-payload release, connection-reuse, and post-reclaim write guards in a local uncommitted copy to confirm their tests fail, then restore the implementation before continuing.

**Checkpoint**: The runner, per-instrument writer transaction, coverage planner, and application-side reclaim sweep prove the complete volume and resume path together.

---

## Phase 5: Polish

**Purpose**: Run the complete repository quality gates and report any unavailable PostgreSQL verification accurately.
- [ ] T008 Run `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv build` from the repository root; if no container runtime is available, run `uv run pytest -m 'not postgres'` and report the excluded PostgreSQL verification rather than treating it as a green full suite.

**Checkpoint**: The long-run and resume scenarios pass against PostgreSQL, mutations of the ownership/reclaim guards are caught, and the repository validation commands pass.

## Dependencies & Execution Order

### Task Dependencies

- T001 prepares the isolated PostgreSQL and stub boundaries used by T002 and T003.
- T002, T003, and T004 must be written and observed RED before T005 or T006.
- T005 addresses volume and connection lifetime; T006 depends on the interruption scenario in T003 and the run-journal reclaim contract.
- T007 depends on T001 through T006; T008 follows T007.

### Parallel Opportunities

- T002 and T003 exercise independent volume and resume paths after T001.
- T004 can proceed in parallel with the PostgreSQL tests.
- T005 and T006 may be implemented in parallel once their separate RED tests identify the required runner changes.

### Phase Dependencies

- Phase 2 must produce observed RED results before Phase 3 begins.
- Phase 3 must be complete before PostgreSQL validation and mutation checks in Phase 4.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest` and `uv run pytest -m 'postgres and slow'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Use a real PostgreSQL 16 test container and a substituted Massive-client boundary; the volume and resume scenarios must make no network requests.
- Verify a 3,000-item roster completes with only the active instrument payload retained, stable database connection use, and elapsed time emitted for diagnosis without a timing assertion.
- Interrupt a run inside the active instrument, reclaim it in the application-side sweep, and prove committed coverage remains while the active instrument has no result or coverage.
- Start a later requested run and prove it fetches only the uncovered remainder, using coverage and writer idempotency rather than a special resume store.

## Notes

### Resolved Conflicts

- No conflict was found. The E4-S7 description's kill-and-resume test depends on CAP-001-E5-S4's application-container reclaim sweep; `component-design-run-journal.md` §2.6 governs that placement, while `component-design-acquisition-runner.md` §§2.2 and 5 govern per-instrument commit and constant-space behavior.

### Open Gaps

- **PROVISIONAL — awaiting owner confirmation (2026-09-11):** No approved artifact fixes a byte threshold or sampling interval for “memory stays bounded.” This plan adopts a structural constant-space check: a 3,000-instrument stub exposes at most one live parsed payload/result at a time and the runner retains no completed-instrument collection; process elapsed time is diagnostic only. This derives directly from `component-design-acquisition-runner.md` §5, which defines peak memory as one instrument's payload and states no duration target. Record the concrete observability contract in the next revision of `component-design-acquisition-runner.md` §5.

### Other Notes

- CAP-001-E4-S5 supplies the runner and its sequential loop, CAP-001-E4-S3 supplies the writer transaction, CAP-001-E4-S4 supplies coverage planning, and CAP-001-E5-S4 supplies reclaim. This story must harden those seams rather than add a parallel resume mechanism.
- The shared resolution register is correct: provider request IDs may remain in failure reasons, credentials must not; 429 is pacing rather than a persisted result; elapsed time remains informational with no duration target.
