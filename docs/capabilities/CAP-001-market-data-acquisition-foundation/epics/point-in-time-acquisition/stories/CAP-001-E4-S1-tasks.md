---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-17
last_reworked_review: CAP-001-E4-S1-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-16T03:26:24Z
  source_artifacts:
    - id: CAP-001-E4-S1
      version: "1"
    - id: CAP-001-component-design-market-data-store
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E4-S1 — Observation Schema: Append-Only Point-in-Time Tables

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E4-tasks`
**Date**: 2026-09-11

## Summary

Create migration `0002_observations.sql` and its PostgreSQL-backed and static safeguards so FactorFlow records reference data, daily bars, fundamentals, and corporate actions as append-only, point-in-time observations. `observed_on` defaults to FactorFlow's current date but is not part of an idempotence key: identical inserts must be no-ops across re-fetches, restatements must coexist, and no migration or application SQL may mutate observation history.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-5 | Stored values carry FactorFlow's observation date and restatements add records. | T001, T003 |
| AC-6 | Re-acquisition neither duplicates, overwrites, nor removes records. | T001, T002, T003 |
| DAC-E1-6 | Each observation table's natural key includes a value hash. | T001, T003 |
| DAC-E4-1 | Provider filing date is descriptive, never the as-of date. | T001, T003 |
| DAC-E4-2 | Appends use `INSERT ... ON CONFLICT DO NOTHING`. | T001, T003 |
| DAC-E4-S1-1 | `observed_on` defaults to FactorFlow's current date and is not provider-derived. | T001, T003 |
| DAC-E4-S1-2 | Re-inserting an identical value affects zero rows and preserves the existing row. | T001, T003 |
| DAC-E4-S1-3 | A different hash for the same date/instrument coexists with the old row. | T001, T003 |
| DAC-E4-S1-4 | Value hash is exactly a 32-byte digest. | T001, T003 |
| DAC-E4-S1-5 | `daily_bar` price and volume use exact numerics. | T001, T003 |
| DAC-E4-S1-6 | Observation-history migrations contain no `UPDATE` or `DELETE`. | T002, T003 |
| DAC-E4-S1-7 | Observation query paths contain no `UPDATE` or `DELETE`. | T002 |

## Phase 1: Setup

**Purpose**: Reuse the existing PostgreSQL test-container fixtures and migration discovery path; this story adds no dependency or configuration change.

**Checkpoint**: `tests/conftest.py`'s PostgreSQL connection fixture and the existing migrator can apply the new numbered migration from `migrations/`.

---

## Phase 2: Tests (TDD)

**Purpose**: Define the required database behavior and repository-wide append-only guard before adding the migration.

### Mandatory Component Tests

- [x] T001 [P] Create PostgreSQL-backed append-only observation tests in `tests/integration/test_observation_append.py` for TC-COMP-005, TC-COMP-006, TC-COMP-135, TC-COMP-136, TC-COMP-150, TC-COMP-151, TC-COMP-152, TC-COMP-153, TC-COMP-154, and TC-COMP-297: apply migrations `0001` and `0002`; assert all four tables exist; assert `observed_on` is the database `current_date` default rather than a provider value; assert `fundamental_observation.provider_filing_date` remains descriptive; assert each value-hash check rejects 31- and 33-byte inputs; assert `daily_bar` uses PostgreSQL `numeric` types; and execute `INSERT ... ON CONFLICT DO NOTHING` cases proving the same natural key and value hash affects zero rows even when re-fetched on a later `observed_on`, while a changed hash for the same natural period coexists. Include a `# Implements TC-COMP-…` traceability comment for every listed case.
- [x] T002 [P] Create the static append-only guard in `tests/unit/test_sql_is_append_only.py` for TC-COMP-155 and TC-COMP-156: scan every `migrations/*.sql` file and Python source under `src/factorflow/` case-insensitively, and fail only when an `UPDATE` or `DELETE` statement targets `instrument_reference`, `daily_bar`, `fundamental_observation`, or `corporate_action`. Include `# Implements TC-COMP-155, TC-COMP-156` and a fixture proving a prohibited statement is detected.

**Checkpoint**: The new tests fail because migration `0002_observations.sql` does not yet exist; the static guard is ready to protect future SQL paths.

---

## Phase 3: Core Implementation

**Purpose**: Add the forward-only SQL schema that enforces append-only point-in-time observation storage.

- [x] T003 Create `migrations/0002_observations.sql` with `instrument_reference`, `daily_bar`, `fundamental_observation`, and `corporate_action`, each referencing `instrument`, declaring `observed_on date NOT NULL DEFAULT current_date`, a non-null `bytea value_hash` with `octet_length(value_hash) = 32`, and a natural-key unique constraint over the data-type key and `value_hash` (never `observed_on`, so an identical re-fetch remains a no-op). Use `numeric(18, 6)` prices and `numeric(20, 4)` volume for `daily_bar`; retain `fundamental_observation.provider_filing_date` solely as a descriptive field with a column comment; add the design-specified read indexes; do not add `UPDATE`, `DELETE`, `BEGIN`, or `COMMIT` statements. The follow-on writer must use `INSERT ... ON CONFLICT DO NOTHING` against these constraints (depends on T001, T002).

**Checkpoint**: Applying `0001` then `0002` creates the four queryable observation tables and all database constraints needed by the tests.

---

## Phase 4: Integration

**Purpose**: Rely on the existing schema migrator to discover and apply `0002_observations.sql`; no new runtime integration code belongs to this schema-only story.

**Checkpoint**: The existing migration discovery tests find version 2 after version 1 with no filename, transaction-boundary, or ordering error.

---

## Phase 5: Polish

**Purpose**: Demonstrate the migration and safeguards work under the real PostgreSQL test environment and the repository quality gates.

- [x] T004 Run the story-focused and full validation commands from the repository root: `uv run pytest -m postgres tests/integration/test_observation_append.py`, `uv run pytest tests/unit/test_sql_is_append_only.py`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv build`; record RED before T003, then GREEN and manual mutation evidence that adding `observed_on` to a unique constraint, removing a `value_hash` length check, or introducing an observation-table `DELETE` makes a named test fail (depends on T003).

**Checkpoint**: All mapped tests and quality gates pass, and the changed behavior has RED→GREEN→MUTATE evidence.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 and T002 have no dependencies and can proceed in parallel.
- T003 depends on T001 and T002 being written and observed failing.
- T004 depends on T003.

### Parallel Opportunities

- T001 and T002 modify separate test files and can run in parallel.

### Phase Dependencies

- Phase 1 must complete before Phase 2.
- Phase 3 begins only after the migration makes Phase 1 green.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Run `uv run pytest -m postgres tests/integration/test_observation_append.py` against PostgreSQL 16 to verify defaults, constraints, no-op re-inserts across observation dates, restatement coexistence, numeric storage, and filing-date semantics.
- Run `uv run pytest tests/unit/test_sql_is_append_only.py` to ensure no migration or Python SQL string mutates an observation-history table.
- Confirm the new migration is discovered as version 2 and contains neither transaction control nor non-transactional DDL through the existing migration filename tests.

## Notes

### Resolved Conflicts

- The story's non-AC Data Changes prose says `observed_on` belongs in each unique constraint, while AC-6 and DAC-E4-S1-2 require an identical re-fetch to write zero rows. Including a date that defaults on every fetch would make an identical value distinct on a later day. The acceptance criteria govern: T003 excludes `observed_on` from every idempotence key and uses the design's matching unique-key shape. DAC-E4-S1-1 still governs the database default. The story's Data Changes prose should be corrected in its next approved revision.
- The approved design's `0002` SQL block declares `observed_on date NOT NULL` without a default, while DAC-E4-S1-1 requires FactorFlow's current observation date and the approved owner decision fixes its zone as `America/Chicago`. The migration therefore intentionally uses `DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date`. A verbatim design-drift guard for `0002` is deferred until Doc Sync corrects the approved design block; pinning the known mismatch in a test would preserve rather than detect drift.

### Open Gaps

- None. The value-hash width, exact numeric types, migration filename, target table set, and append-only enforcement mechanism are all specified by the story and component design.

### Other Notes

- The scope of the append-only static guard is only the four observation-history tables. The design permits `DELETE` while merging `coverage_segment`; that statement must not be treated as a violation.
- The guard scans numbered migrations and `src/factorflow/**/*.py`, the repository's two executable SQL locations. Test fixtures intentionally contain prohibited examples and are not query paths; scanning them would make the guard reject its own positive cases. If executable SQL gains another location, that location must be added to `observation_sql_paths()` in the same change.
- No application writer is introduced in this story. Its later implementation must use `INSERT ... ON CONFLICT DO NOTHING` against the constraints created here.
