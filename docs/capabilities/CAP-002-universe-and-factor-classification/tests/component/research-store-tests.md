---
artifact_schema_version: 1
artifact_id: CAP-002-research-store-component-tests
artifact_type: test-specification
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T18:38:08Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "3"
    - id: CAP-002-backlog
      version: "4"
    - id: CAP-002-component-design-research-store
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# research-store Component Test Specification

### TC-COMP-017: Migration 0005 matches research-store design

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E1-S1-5, AC-3
**Priority:** P2
**Type:** functional

#### Preconditions
- The committed migration text

#### Steps
1. `tests/unit/test_migration_0005_matches_design.py` runs.

#### Expected Result
- Every table, column, constraint and index named in research-store section 2.3 is present, following `test_migration_0001_matches_design.py`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S1-5; no further cases are invented.

### TC-COMP-018: Every sql directory is covered by a package-data glob

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E1-S1-7, AC-3
**Priority:** P2
**Type:** functional

#### Preconditions
- `pyproject.toml` as committed

#### Steps
1. `tests/unit/test_package_data_ships_sql.py` runs.

#### Expected Result
- Every `sql/` directory under `src/factorflow/` — `coverage/sql/`, `universes/sql/` and any added later — matches a `[tool.setuptools.package-data]` glob, so a non-editable install carries every `.sql` a module reads at import.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S1-7; no further cases are invented.

### TC-COMP-034: Partial unique index allows one created and one retired event

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E1-S1-3, DAC-E1-7, AC-5, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A universe that already has a `created` (or a `retired`) event

#### Steps
1. A second one is inserted.

#### Expected Result
- The partial unique index refuses it.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S1-3; no further cases are invented.

### TC-COMP-045: Migration 0005 applies without touching CAP-001 rows

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E1-S1-1, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A store holding `0001` to `0004` with instruments, bars, statements and a run

#### Steps
1. The migrator applies `0005`.

#### Expected Result
- `applied_migrations` records version 5 and no CAP-001 row changes.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S1-1; no further cases are invented.

### TC-COMP-046: Universe event CHECK constraints refuse malformed events

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E1-S1-2, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- An `event_type` outside the allowed set, a `member_added` without `instrument_id`, a `created` without `name`, a `renamed` carrying `filter_provenance`, or an untrimmed or empty name

#### Steps
1. It is inserted.

#### Expected Result
- The named CHECK constraint refuses it.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S1-2; no further cases are invented.

### TC-COMP-047: Static guard finds no UPDATE or DELETE on universe_event

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E1-S1-4, DAC-E1-10, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- Every Python source and `.sql` file under `src/factorflow/`

#### Steps
1. The static guard runs.

#### Expected Result
- No `UPDATE`, `DELETE FROM` or upsert names `universe_event`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S1-4; no further cases are invented.

### TC-COMP-048: Second migrator run after 0005 applies nothing

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E1-S1-6, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A second migrator run after `0005` is applied

#### Steps
1. It runs.

#### Expected Result
- It applies nothing and exits 0.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S1-6; no further cases are invented.

### TC-COMP-075: Duplicate run_id for a classification set is refused

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E2-S1-2, DAC-E2-4, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- A second set naming an existing `run_id`

#### Steps
1. It is inserted.

#### Expected Result
- The unique constraint refuses it.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S1-2; no further cases are invented.

### TC-COMP-076: classification/sql is shipped as package data

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E2-S1-8, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- `pyproject.toml` as committed

#### Steps
1. `tests/unit/test_package_data_ships_sql.py` runs.

#### Expected Result
- `classification/sql/` is covered by a package-data glob, so the scheduler and the reader can load their statements from a non-editable install.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S1-8; no further cases are invented.

### TC-COMP-156: Migration 0006 applies over 0001-0005 and data unchanged

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E2-S1-1, AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- A store holding `0001` to `0005` and data

#### Steps
1. `0006` is applied.

#### Expected Result
- `applied_migrations` records 6 and no CAP-001 or `0005` row changes.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S1-1; no further cases are invented.

### TC-COMP-157: factor_input rejects wrong factor name and incomplete present rows

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E2-S1-6, AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- `return_3m` under `value`, or a `present` input without value, `as_of` or `known_on`

#### Steps
1. Inserted.

#### Expected Result
- It is refused.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S1-6; no further cases are invented.

### TC-COMP-158: pg_dump restore returns current set and membership unchanged

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E2-S1-7, AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- A `pg_dump` of a store with one complete set and one universe

#### Steps
1. Restored into an empty database.

#### Expected Result
- The current set and membership read back unchanged.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S1-7; no further cases are invented.

### TC-COMP-163: Only one building set allowed at a time

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E2-S1-3, DAC-E2-10, AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- A `building` set exists

#### Steps
1. A second `building` row is inserted.

#### Expected Result
- It is refused, while a `complete` or `failed` row beside it is allowed.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S1-3; no further cases are invented.

### TC-COMP-164: Complete and failed set required columns enforced

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E2-S1-4, DAC-E2-10, AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- A `complete` set without `ended_at`, `latest_trading_day` or `active_instruments`, or a `failed` set without `failure_reason`

#### Steps
1. Inserted.

#### Expected Result
- It is refused.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S1-4; no further cases are invented.

### TC-COMP-165: Classification row shape CHECK refuses malformed rows

**Scope:** component
**Component(s):** research-store
**Traces to:** DAC-E2-S1-5, AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- A classified row with a reason, an unclassified row with a score, an `input_missing` row without `reason_input`, a `retired` row with one, or a percentile of 100.5 or -1

#### Steps
1. Inserted.

#### Expected Result
- The shape CHECK refuses it.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S1-5; no further cases are invented.

