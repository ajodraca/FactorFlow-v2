---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S3-tasks
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
  timestamp: 2026-09-11T21:43:54Z
  source_artifacts:
    - id: CAP-001-E4-S3
      version: "1"
    - id: CAP-001-component-design-observation-writer
      version: "4"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-run-journal
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E4-S3 — Observation Writer: One Transaction Per Instrument

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E4-tasks`
**Date**: 2026-09-11

## Summary

Implement the ingestion observation writer so one instrument's four observation types, coverage evidence, acquisition state, and per-data-type run results commit atomically. The writer must preserve append-only point-in-time history, report written versus unchanged rows, and leave no evidence of an attempted instrument if any statement fails.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-3 | Persist reference, prices, fundamentals, and corporate actions for a covered instrument. | T003, T007, T008 |
| AC-4 | Support the per-instrument transaction boundary used across the 3,000-instrument run. | T004, T008, T010 |
| AC-5 | Append point-in-time observations and preserve a restated value. | T003, T004, T008, T010 |
| AC-6 | Rewriting an identical value neither duplicates nor overwrites history. | T003, T008, T010 |
| AC-7 | Stamp coverage/acquisition state with the completed write. | T003, T008, T010 |
| AC-10 | Record one diagnosable per-instrument result for each data type. | T003, T008, T010 |
| AC-12 | Roll back an instrument completely when any write step fails. | T003, T008, T010 |
| DAC-E4-4 | An error at any step rolls back the complete instrument write. | T003, T008, T010 |
| DAC-E4-5 | Merge coverage within the transaction that writes its evidence. | T002, T003, T008, T009 |
| DAC-E4-S3-1 | Return appended and unchanged counts by data type. | T003, T008, T010 |
| DAC-E4-S3-2 | Merge abutting/overlapping coverage ranges to the minimal non-overlapping set. | T002, T003, T009 |
| DAC-E4-S3-3 | Let `coverage_no_overlap` reject a deliberately overlapping segment insert. | T003, T009 |
| DAC-E4-S3-4 | Leave no observations or coverage for a rolled-back attempt. | T003, T008, T010 |
| DAC-E4-S3-5 | Stamp `last_acquired_at`, `last_run_id`, and `last_outcome` transactionally. | T003, T008, T010 |
| DAC-E4-S3-6 | Write one `run_instrument_result` row per data type in that transaction. | T003, T008, T010 |
| DAC-E4-S3-7 | Use `INSERT ... ON CONFLICT DO NOTHING` and never modify observation history. | T003, T008, T011 |

## Phase 1: Setup

**Purpose**: Extend the PostgreSQL test harness to apply the prerequisite observation, coverage, and run-journal migrations in a fresh database for writer tests.

- [ ] T001 Add a `migrated_writer_connection` fixture that applies migrations `0001` through `0004` in `tests/conftest.py`; keep every writer test `postgres`-marked and each test database isolated.

**Checkpoint**: Writer tests can create a valid instrument and run against the same PostgreSQL constraints the production writer will use.

---

## Phase 2: Tests (TDD)

**Purpose**: Write and execute focused RED tests for the mapped component behaviors before implementing the writer.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-163 (minimal merge of adjacent and overlapping ranges) and the disjoint-range edge case in `tests/unit/test_coverage_merge.py`; add `# Implements TC-COMP-163` trace comments.
- [ ] T003 [P] Implement TC-COMP-003, TC-COMP-004, TC-COMP-005, TC-COMP-006, TC-COMP-007, TC-COMP-010, TC-COMP-012, TC-COMP-162, TC-COMP-165, TC-COMP-166, and TC-COMP-167 in `tests/integration/test_writer_transaction.py`; assert a successful four-type write commits rows, exact coverage, acquisition state, result rows, and per-type written/unchanged counts, while a failure injected at the state step leaves no attempted rows, coverage, state, or results. Add a `# Implements TC-COMP-...` trace comment for every case.
- [ ] T004 [P] Implement the restatement, FactorFlow observation-date, and identical-payload assertions for TC-COMP-005, TC-COMP-006, and TC-COMP-162 in `tests/integration/test_writer_idempotence.py`; assert the old row is unchanged, the restatement appends, and an identical rewrite reports zero appended rows without changing coverage. Add matching trace comments.
- [ ] T005 [P] Implement TC-COMP-164 in `tests/integration/test_writer_coverage.py`; seed an overlapping `coverage_segment` directly and assert PostgreSQL rejects it via `coverage_no_overlap`, then assert the writer's normal merge leaves only non-overlapping segments. Add a `# Implements TC-COMP-164` trace comment.
- [ ] T006 [P] Implement TC-COMP-168 in `tests/unit/test_sql_is_append_only.py`; scan the writer SQL for the four observation-table operations and assert `INSERT ... ON CONFLICT DO NOTHING` is used without `UPDATE` or `DELETE` targeting observation history. Add a `# Implements TC-COMP-168` trace comment.

### Additional Unit Tests

- [ ] T007 [P] Add empty-input/no-coverage and one-range-per-data-type result assertions in `tests/integration/test_writer_transaction.py`, separating the writer's `unchanged` result from a provider/no-observation outcome.

**Checkpoint**: The mapped tests and edge tests fail because `coverage.py` and `writer.py` do not yet exist, and their expected database state is explicit.

---

## Phase 3: Core Implementation

**Purpose**: Implement pure coverage merge arithmetic and the typed, single-transaction observation write path.

- [ ] T008 Create `merge_ranges(existing, written)` in `src/factorflow/ingestion/coverage.py`; sort ranges and merge overlap or next-day adjacency while preserving genuinely disjoint ranges.
- [ ] T009 Create the `WriteResult` contract, writer-local parsed-observation boundary, and `write_instrument` in `src/factorflow/ingestion/writer.py`; use the hashing function from `src/factorflow/ingestion/hashing.py`, bound `psycopg` parameters, the prescribed natural-key conflict behavior, and `connection.transaction()` for one instrument.
- [ ] T010 In `src/factorflow/ingestion/writer.py`, implement the four parameterized observation-table inserts with `ON CONFLICT DO NOTHING`, and accumulate the per-data-type appended and unchanged counts needed by `WriteResult`.

**Checkpoint**: A successful call returns `WriteResult` with counts by data type, and every committed coverage segment, state stamp, and result row is backed by the same instrument transaction's observation rows.

---

## Phase 4: Integration

**Purpose**: Complete the database-backed operations that make coverage, acquisition state, and run results visible with the observation rows.

- [ ] T011 Complete the coverage replacement, `acquisition_state` upsert, and one `run_instrument_result` insert per data type in `src/factorflow/ingestion/writer.py`, retaining them inside the same transaction as observation appends and preserving rollback/re-raise behavior.

**Checkpoint**: Observation rows and their derived coverage/state/result rows commit together or all roll back.

---

## Phase 5: Polish

**Purpose**: Prove the append-only and PostgreSQL-enforced invariants under the real database schema.

- [ ] T012 Run the targeted `postgres` writer tests and the append-only SQL test from `tests/unit/test_sql_is_append_only.py`; manually mutate the writer's conflict action and coverage merge condition in a local, uncommitted copy to confirm the tests fail, then restore the implementation before continuing.
- [ ] T013 Run `uv run pytest -m postgres`, `uv run ruff check .`, `uv run ruff format --check .`, and `uv run mypy src` from the repository root; record any unavailable-container exclusion rather than calling a partial test run successful.

**Checkpoint**: Every mapped test passes against PostgreSQL, manual mutations of changed behavior are caught, and the repository's Python validation commands pass.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 must finish before T003, T004, T005, and T007.
- T002 has no production-code dependency; T003 through T007 should be written and observed RED before T008 through T010.
- T008 and T009 may start after their respective RED tests; T010 depends on T009; T011 depends on T010.
- T012 depends on T002 through T011; T013 depends on T012.

### Parallel Opportunities

- T002 through T007 touch separate test concerns and can be written in parallel after T001.
- T008 and T009 can proceed in parallel once their test contracts exist; T010 and T011 remain sequential after T009.

### Phase Dependencies

- Phase 2 must produce observed RED results before Phase 3 begins.
- Phase 3 must be complete before Phase 4 integration; Phase 5 follows Phase 4.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest` and `uv run pytest -m postgres`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Apply migrations `0001` through `0004` to a disposable PostgreSQL 16 test database before writer integration tests; do not mock `coverage_no_overlap`.
- Verify a successful four-data-type write persists observations, merged coverage, acquisition state, and exactly one run result per data type after one commit.
- Inject a failure after observation insertion but before the state/result writes and verify the attempted instrument leaves none of those rows.
- Re-run an identical payload and a restated payload, verifying unchanged versus appended counts and immutability of the original observation.
- Directly attempt an overlapping coverage insert to demonstrate the exclusion constraint rejects the invalid state.

## Notes

### Resolved Conflicts

- The story assigns per-data-type `run_instrument_result` insertion to the observation-writer transaction, while `component-design-market-data-store.md` §2.4 diagram labels the insert as an acquisition-runner action. The story's scope and write sequence govern: implement it in `writer.py`, while retaining the shared one-instrument transaction boundary. The result still satisfies the store design's atomicity requirement.
- `component-design-observation-writer.md` §2.4 allows coverage-segment replacement with `DELETE`; its §3 append-only prohibition applies to the four observation-history tables only. Coverage replacement is therefore permitted inside the transaction.
- The writer design's open question contrasts run-start and per-instrument dates, but `system-design.md` §3 steps 15-17 specifies `observed_on = today` at the append. That higher-authority system design governs the date supplied to each write.

### Open Gaps

- **PROVISIONAL — awaiting owner confirmation (2026-09-11):** No approved artifact defines the concrete shape or source module of `ParsedObservations`, although the writer interface names it. This plan adopts a writer-local, typed parsed-observation boundary keyed by the four schema data types and carrying each type's actual returned coverage range. It is derived from the four observation tables and `coverage_segment.data_type` values in `component-design-market-data-store.md` §2.3, and is the smallest shape that lets the writer determine coverage from returned rows. The next revision of `component-design-observation-writer.md` should define this interface and ownership explicitly.

### Other Notes

- This story relies on CAP-001-E4-S1's observation and coverage migrations, CAP-001-E4-S2's hashing module, and CAP-001-E5-S1's `0004_runs.sql`; T001 must apply those existing migrations only in test setup and must not modify them.
- All SQL must use bound `psycopg` parameters. `observed_on` is FactorFlow's date; the provider filing date remains descriptive payload data only.
