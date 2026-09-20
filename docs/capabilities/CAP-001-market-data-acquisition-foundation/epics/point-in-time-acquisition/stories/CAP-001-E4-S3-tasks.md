---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-18
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-18T02:58:04Z
  source_artifacts:
    - id: CAP-001-E4-S3
      version: "1"
    - id: CAP-001-component-design-observation-writer
      version: "4"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E4-S3 — Observation Writer: One Transaction Per Instrument

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E4-S3`
**Date**: 2026-09-18

## Summary

Implement the typed observation writer so one reached instrument's four successful data-type results, the coverage evidence they justify, acquisition state, and per-data-type run results commit atomically. The writer must use the existing deterministic hash and append-only observation schema, report written versus unchanged rows per data type, merge only actual returned ranges, and roll back every attempted write when any statement fails.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-5 | Persist FactorFlow's observation date, append restatements, and preserve prior values. | T003, T004, T009, T010, T012 |
| AC-6 | Rewriting identical returned values neither duplicates nor mutates history. | T003, T009, T010, T012 |
| AC-7 | Stamp per-data-type acquisition state in the committed instrument transaction. | T002, T009, T011, T012 |
| AC-10 | Persist one result row for every successfully reached data type. | T002, T009, T011, T012 |
| AC-12 | A failed instrument write leaves no observations or false coverage. | T002, T004, T011, T012 |
| DAC-E4-4 | Commit observations, coverage, state, and results together or roll them all back. | T002, T004, T011, T012 |
| DAC-E4-5 | Extend coverage only inside the transaction writing the rows that justify it. | T002, T004, T008, T011, T012 |
| DAC-E4-S3-1 | Return appended and unchanged counts plus actual covered ranges per data type. | T002, T003, T009, T010 |
| DAC-E4-S3-2 | Merge abutting and overlapping ranges into a minimal non-overlapping set. | T001, T005, T008 |
| DAC-E4-S3-3 | Let `coverage_no_overlap` reject an invalid overlapping segment. | T005, T011 |
| DAC-E4-S3-4 | Roll back observations, coverage, state, and results after a mid-write failure. | T004, T011, T012 |
| DAC-E4-S3-5 | Stamp `last_acquired_at`, `last_run_id`, and `last_outcome` atomically. | T002, T011 |
| DAC-E4-S3-6 | Insert one `run_instrument_result` row per successfully reached data type atomically. | T002, T011 |
| DAC-E4-S3-7 | Use `INSERT ... ON CONFLICT DO NOTHING` and never mutate observation history. | T003, T006, T010, T012 |

## Phase 1: Setup

**Purpose**: Establish an isolated PostgreSQL fixture over the prerequisite observation, coverage, and run-journal schema.

- [ ] T001 Extend `tests/conftest.py` with a `migrated_writer_connection` fixture that applies `migrations/0001_extensions_owner_state.sql` through `migrations/0004_runs.sql` in numerical order to each test's isolated PostgreSQL 16 database; do not create or alter prerequisite migrations in this story, and start only after CAP-001-E5-S1 has delivered `0003_coverage.sql` and `0004_runs.sql`.

**Checkpoint**: Writer tests can create an instrument and acquisition run against the production constraints without sharing database state between tests.

---

## Phase 2: Tests (TDD)

**Purpose**: Write and observe focused RED tests for the pure range arithmetic, writer contract, database transaction, idempotence, and append-only invariant before adding production code.

### Mandatory Component Tests

- [ ] T002 [P] Create `tests/integration/test_writer_transaction.py` for TC-COMP-007, TC-COMP-010, TC-COMP-012, TC-COMP-138, TC-COMP-139, TC-COMP-162, TC-COMP-165, TC-COMP-166, and TC-COMP-167: assert one successful four-data-type call commits observations, only the actual returned ranges, per-type acquisition state, exactly four result rows, and per-type appended/unchanged counts; install a test-local PostgreSQL trigger that raises during the acquisition-state step and assert observations, coverage, state, and results all roll back. Include a `# Implements TC-COMP-...` traceability comment for every mapped case (depends on T001).
- [ ] T003 [P] Create `tests/integration/test_writer_idempotence.py` for TC-COMP-005, TC-COMP-006, and TC-COMP-162: write a controlled `observed_on`, repeat the identical four-type payload, and then change one value; assert the repeat reports zero appended and positive unchanged counts without altering stored rows or coverage, while the restatement appends a second row and preserves the first row's observation date. Include a traceability comment for every mapped case (depends on T001).
- [ ] T004 [P] Extend `tests/integration/test_writer_transaction.py` with explicit TC-COMP-138, TC-COMP-139, and TC-COMP-165 failure probes at an observation insert, coverage replacement, acquisition-state upsert, and result insert; after each injected database failure, assert no partial observation, intended coverage, state, or result survives and the original exception propagates (depends on T001).
- [ ] T005 [P] Create `tests/unit/test_coverage_merge.py` and `tests/integration/test_writer_coverage.py` for TC-COMP-163 and TC-COMP-164: cover overlap, enclosure, preceding/following one-day adjacency, unsorted existing segments, and genuinely disjoint ranges in the pure function; then directly attempt an overlapping `coverage_segment` insert and assert PostgreSQL names `coverage_no_overlap`, while a normal writer merge leaves the minimal non-overlapping set. Include matching traceability comments (integration case depends on T001).
- [ ] T006 [P] Extend `tests/unit/test_sql_is_append_only.py` for TC-COMP-168 with writer-source fixtures proving every observation-table statement uses `INSERT ... ON CONFLICT DO NOTHING`; retain the existing scan across `src/factorflow/**/*.py`, and assert an `UPDATE`, `DELETE`, or `ON CONFLICT ... DO UPDATE` against any of the four observation tables is rejected while coverage/state/result mutations remain allowed.

### Additional Unit Tests

- [ ] T007 [P] Add writer-contract tests in `tests/unit/test_writer_contract.py` for the owner-confirmed writer-local `ParsedObservations` grouping: require typed collections for `TickerReference`, `DailyBar`, `FinancialStatement`, and `CorporateAction`, preserve each data type's actual returned range independently, and verify the immutable `WriteResult` exposes matching per-type appended, unchanged, and covered-range mappings without importing a future runner module.

**Checkpoint**: The new tests have been executed and observed RED because `factorflow.ingestion.coverage` and `factorflow.ingestion.writer` do not exist; record each RED command and failure in `CAP-001-E4-S3-tdd-evidence.yaml` before beginning the corresponding production cycle.

---

## Phase 3: Core Implementation

**Purpose**: Implement the pure coverage arithmetic and the typed writer-local input/result contracts that drive the SQL path.

- [ ] T008 Create `merge_ranges(existing, written)` in `src/factorflow/ingestion/coverage.py`; sort inclusive date ranges, coalesce overlap and one-calendar-day adjacency in either direction, preserve disjoint segments, and return the minimal ordered set (depends on T005 RED evidence).
- [ ] T009 Create immutable `ObservationBatch`, `ParsedObservations`, and `WriteResult` contracts in `src/factorflow/ingestion/writer.py`: group the four existing provider-model collections with each data type's actual returned coverage range, use the schema data-type names `reference`, `prices`, `fundamentals`, and `corporate_actions`, and expose per-type appended, unchanged, and covered-range results without depending on `runner.py` (depends on T007 RED evidence).
- [ ] T010 In `src/factorflow/ingestion/writer.py`, implement bound-parameter insert helpers for `instrument_reference`, `daily_bar`, `fundamental_observation`, and `corporate_action`; hash each model's `value_payload()` with `factorflow.ingestion.hashing.value_hash`, pass the caller-supplied FactorFlow `observed_on`, use each table's existing natural key with `ON CONFLICT DO NOTHING`, adapt JSON payloads through psycopg's JSON support, and derive appended versus unchanged counts from returned rows without any observation-table update or delete (depends on T003, T006, T009).

**Checkpoint**: The pure merge and four idempotent append paths satisfy their focused tests and return typed per-data-type counts and ranges.

---

## Phase 4: Integration

**Purpose**: Complete the one-instrument transaction by committing coverage, acquisition state, and run results with the observation rows.

- [ ] T011 Implement `write_instrument(connection, instrument_id, run_id, observations, observed_on)` in `src/factorflow/ingestion/writer.py` using one `connection.transaction()` context: append all supplied data types, read and replace only that instrument/data type's `coverage_segment` rows using `merge_ranges`, upsert `acquisition_state` with `last_acquired_at = now()`, `last_run_id`, and successful state outcome `written`, and insert one `run_instrument_result` per successfully reached data type with outcome `written` when rows appended or `unchanged` when every returned row already existed. Let every database or hashing error propagate so the context rolls back all work; do not update acquisition-run counters or record provider failures in this story (depends on T002–T004, T008–T010).

**Checkpoint**: Observations, actual coverage, acquisition state, and four successful result rows become visible together after commit or remain wholly absent after any failure.

---

## Phase 5: Polish

**Purpose**: Preserve durable RED→GREEN→MUTATE evidence and run every relevant repository quality gate.

- [ ] T012 Create `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S3-tdd-evidence.yaml`; record each focused RED and GREEN command with its commit hash before starting the next cycle, then manually mutate in separate restored probes: adjacency handling, the observation conflict action, a coverage write moved outside the transaction, and rollback propagation. Name the test that kills each mutation, strengthen any surviving test before proceeding, and finish with a clean source diff for every probe (depends on T001–T011).
- [ ] T013 Run from the repository root: `uv sync --all-extras`, the focused coverage/writer/append-only tests, `uv run pytest -m 'not postgres'`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `uv build`, `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, and `npx tsc --noEmit`; record exact results in `CAP-001-E4-S3-tdd-evidence.yaml`, and if the PostgreSQL container or Playwright browser is unavailable report that exclusion rather than describing the partial suite as green (depends on T012).

**Checkpoint**: Every mapped behavior passes against PostgreSQL 16, every changed behavior has a killed mutation, all validation results are durable, and no unrelated source or specification file changed.

---

## Dependencies & Execution Order

### Story Dependencies

- CAP-001-E4-S1 and CAP-001-E4-S2 are merged and supply `migrations/0002_observations.sql`, the four provider persistence shapes, the append-only guard, and `src/factorflow/ingestion/hashing.py`.
- CAP-001-E5-S1 must be planned, implemented, reviewed, and integrated before E4-S3 story coding starts because T001 and the transaction tests require `migrations/0003_coverage.sql` and `migrations/0004_runs.sql`.

### Task Dependencies

- T001 waits for CAP-001-E5-S1 and then prepares the shared database fixture.
- T002 through T007 touch separate test concerns and may be authored in parallel after T001 where marked; every relevant RED must be observed and recorded before its production task.
- T008 depends on T005; T009 depends on T007; T010 depends on T003, T006, and T009.
- T011 depends on T002 through T004 and T008 through T010.
- T012 follows the corresponding GREEN implementation and gates each subsequent TDD cycle; T013 depends on all earlier tasks.

### Parallel Opportunities

- The unit portion of T005 and the static guard work in T006 can begin while the PostgreSQL fixture is being finalized.
- After T001, T002 through T007 cover distinct behaviors and files and may proceed in parallel only while preserving separate RED evidence.
- T008 and T009 target separate production modules and may proceed in parallel after their respective RED evidence; T010 and T011 remain sequential.

### Phase Dependencies

- Phase 2 must produce observed RED evidence before Phase 3 begins.
- Phase 3 must establish both the merge function and typed writer contract before Phase 4 assembles the transaction.
- Phase 5 follows the complete transaction and does not waive unavailable validation.

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`, `npm ci`
- Build: `uv build`, `npm run build`
- Python tests: `uv run pytest`, `uv run pytest -m 'not postgres'`
- Frontend tests: `npm run test`, `npm run test:e2e`
- Lint: `uv run ruff check .`, `npm run lint`
- Format check: `uv run ruff format --check .`, `npm run format`
- Type check: `uv run mypy src`, `npx tsc --noEmit`

### Story-Specific Validation

- Apply migrations `0001` through `0004` to a disposable PostgreSQL 16 database; never mock the `coverage_no_overlap` exclusion constraint.
- Verify a successful four-data-type call commits observations, only actual returned ranges, acquisition state, and exactly four successful result rows in one transaction.
- Inject failures at observation, coverage, state, and result steps and verify no partial state survives and the original exception propagates.
- Repeat identical values and then restate one value, verifying per-type counts, unchanged coverage, and immutability of the earlier observation.
- Exercise pure range merging across overlap, enclosure, both adjacency directions, unsorted input, and disjoint ranges; directly prove PostgreSQL rejects a remaining overlap.
- Run the append-only scan over the implemented writer and kill mutations to its conflict action, transaction boundary, rollback path, and adjacency condition.

## Notes

### Resolved Conflicts

- The story's abbreviated signature names `range_written` and omits the connection/date, while the observation-writer design's concrete interface takes `connection`, `observations`, and `observed_on` and states that actual ranges come from parsed observations. The concrete design plus the owner-confirmed grouped DTO govern: `ParsedObservations` carries the four actual per-data-type ranges, and `write_instrument` takes the connection and FactorFlow date explicitly.
- The observation-writer design's illustrative `WriteResult.covered_range` is singular, while DAC-E4-S3-1 reports by data type and coverage is independently keyed by data type. The owner-confirmed grouped boundary governs: `WriteResult` exposes covered ranges per data type alongside per-type counts.
- `component-design-market-data-store.md` §2.4 labels `run_instrument_result` insertion as an acquisition-runner action, while the story and observation-writer transaction contract require per-data-type results inside the atomic writer transaction. The story's narrower acceptance criteria govern: E4-S3 inserts successful `written`/`unchanged` results; later runner/outcome stories supply provider-failure classifications without moving the transaction boundary.
- `acquisition_state.last_outcome` permits `written`, `not_found`, and `failed`, while `run_instrument_result.outcome` also permits `unchanged`. For a successful re-fetch that appends nothing, the state projection records `written` to mean successfully acquired, while the run result records `unchanged`; the existing DDL constraints and run-journal success rule pin that distinction.
- Coverage replacement may delete `coverage_segment` rows, but the append-only prohibition covers only `instrument_reference`, `daily_bar`, `fundamental_observation`, and `corporate_action`. Transactional coverage replacement is therefore allowed; observation updates, deletes, and conflict updates remain forbidden.

### Open Gaps

- None. **Owner decision confirmed 2026-09-18:** `ParsedObservations` is a writer-local typed grouping of the four existing provider-model collections and each data type's actual returned coverage range. This avoids a dependency on the not-yet-implemented runner and is the smallest boundary that can prove coverage reflects returned data. The next revision of `component-design-observation-writer.md` should define this ownership and per-data-type shape explicitly.

### Other Notes

- E4-S3 planning is complete independently of dependency delivery, but story coding remains blocked until CAP-001-E5-S1 supplies `0003_coverage.sql` and `0004_runs.sql`; do not recreate those tables in tests or in E4-S3 production code.
- `ParsedObservations` represents successfully returned provider data. Empty/not-found/failed classification belongs to CAP-001-E4-S6 and runner orchestration; E4-S3 must not invent provider retry, failure-reason, cancellation, or acquisition-run-counter behavior.
- Use the merged provider models' `value_payload()` methods and bound psycopg parameters. The supplied `observed_on` is FactorFlow's date; `provider_filing_date` remains descriptive payload data only.
