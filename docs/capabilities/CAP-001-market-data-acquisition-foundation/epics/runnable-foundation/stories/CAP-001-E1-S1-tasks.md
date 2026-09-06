---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-06
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T00:00:00Z
  source_artifacts:
    - id: CAP-001-E1-S1
      version: "1"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: tech-stack
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E1-S1 — Schema Foundation: Instruments, Settings and Applied Migrations

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-epics`
**Date**: 2026-09-06

## Summary

This story delivers migration `0001_extensions_owner_state.sql` (the `btree_gist` extension, `instrument`, and `owner_setting`) and the `applied_migrations` table definition that the schema-migrator (CAP-001-E1-S2) will create and read. It is the first story in the capability and the first code in the repository: nothing exists yet — no `pyproject.toml`, no `src/` layout, no `migrations/` directory, no test suite. This story therefore also bootstraps the Python project per the approved tech stack (uv, pytest with `testcontainers[postgres]`, ruff, mypy) to the minimum needed to apply and test this one migration file. The migrator's application logic (reading `applied_migrations`, deciding what to run, advisory locking) is explicitly out of scope — that is CAP-001-E1-S2 — so tests here apply the SQL directly via `psycopg` 3 rather than through a migrator component.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-15 | Applying migrations to an existing store neither loses nor rewrites previously acquired history (partially satisfied here: `0001` applied twice records one net application) | T009, T014 |
| DAC-E1-1 | All capability state lives in one PostgreSQL database | T009 (structural — single schema, no split store) |
| DAC-E1-2 | `applied_migrations` is created before the first migration file runs, and its definition belongs to `market-data-store` | T005, T011 |
| DAC-E1-S1-1 | Applying `0001` creates the `btree_gist` extension | T006, T012 |
| DAC-E1-S1-2 | `instrument.symbol` must be uppercase and match the shape regex, via check constraints | T007, T013 |
| DAC-E1-S1-3 | `instrument.lifecycle` must be `active`/`retired`; `retired_at` set iff `retired` | T007, T013 |
| DAC-E1-S1-4 | `owner_setting` holds history depth as `jsonb` keyed by `setting_key` | T008, T013 |
| DAC-E1-S1-5 | `applied_migrations` row carries `version` (PK), `name`, `checksum`, `applied_at` | T005, T011 |
| DAC-E1-S1-6 | Applying `0001` twice is a no-op the second time (recorded once, no statement re-run) | T009, T014 |

## Phase 1: Setup

**Purpose**: Bootstrap the Python project structure this and every later story builds on — there is no existing `pyproject.toml`, `src/` layout, or test configuration in the repository.

- [ ] T001 Create `pyproject.toml` at repo root defining the `src/` layout (setuptools backend), the `factorflow` package under `src/factorflow/`, and dependencies `psycopg[binary]>=3`, with dev dependencies `pytest`, `testcontainers[postgres]`, `ruff`, `mypy`
- [ ] T002 [P] Create `src/factorflow/__init__.py` and `src/factorflow/db/__init__.py` as empty package markers
- [ ] T003 [P] Create `pytest.ini` or `[tool.pytest.ini_options]` in `pyproject.toml` registering the `postgres` marker (so `uv run pytest -m 'not postgres'` works from the first commit) and setting `testpaths = ["tests"]`
- [ ] T004 [P] Create `tests/__init__.py`, `tests/unit/__init__.py`, `tests/integration/__init__.py`, and `tests/conftest.py` with a session-scoped `testcontainers` PostgreSQL 16 fixture (marked `postgres`) that yields a `psycopg` connection string, per the tech stack's `testcontainers[postgres]` choice

**Checkpoint**: `uv sync --all-extras` succeeds; `uv run pytest -m 'not postgres'` runs (collects zero tests, exits 0); `uv run ruff check .` and `uv run mypy src` run cleanly against the empty package.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests for the mandatory component TC-IDs mapped from the coverage matrix, plus the additional unit/integration tests the story's own "Testing" section calls for, before the migration SQL exists.

### Mandatory Component Tests

- [ ] T005 [P] Implement TC-COMP-293 and TC-COMP-313 (`applied_migrations` is created before the first migration file runs; its row carries `version` PK, `name`, `checksum`, `applied_at`) in `tests/integration/test_applied_migrations_table.py` — assert the constant DDL from `src/factorflow/db/applied_migrations.py` (T011) creates the table with exactly those four columns and `version` as primary key, and that it can be created before any migration file is applied
- [ ] T006 [P] Implement TC-COMP-309 (applying `0001` creates the `btree_gist` extension) in `tests/integration/test_migration_0001.py` — apply `migrations/0001_extensions_owner_state.sql` to an empty database and assert `btree_gist` appears in `pg_extension`
- [ ] T007 [P] Implement TC-COMP-310 and TC-COMP-311 (symbol shape/case check constraints; lifecycle and `retired_at` agreement) in `tests/integration/test_instrument_constraints.py` — one test per rejected case: lowercase symbol, symbol over 16 characters, unknown lifecycle value, `retired` without `retired_at`, `active` with `retired_at` (per the story's own Testing section)
- [ ] T008 [P] Implement TC-COMP-312 (`owner_setting.setting_value` is `jsonb` keyed by `setting_key`) in `tests/integration/test_owner_setting.py` — assert the column type is `jsonb`, `setting_key` is the primary key, and a row with an arbitrary JSON-shaped value round-trips
- [ ] T009 [P] Implement TC-COMP-314 (applying `0001` twice records one row and re-runs no statement) in `tests/integration/test_migration_idempotence.py` — apply `0001`, record it in `applied_migrations`, attempt the same version again guarded by a `SELECT ... WHERE version = 1`, and assert exactly one row exists and the second attempt executes no DDL

### Additional Unit Tests

- [ ] T010 [P] Write a unit test asserting `migrations/0001_extensions_owner_state.sql` matches byte-for-byte the SQL text embedded in `component-design-market-data-store.md` section 2.3, in `tests/unit/test_migration_0001_matches_design.py` — catches silent drift between the design doc and the shipped file, since the design explicitly says the migrator must never see an edited already-applied file
- [ ] T011 [P] Write a unit test asserting the `applied_migrations` DDL constant in `src/factorflow/db/applied_migrations.py` matches the SQL text reproduced in `component-design-market-data-store.md` section 2.2, in `tests/unit/test_applied_migrations_ddl_matches_design.py`

**Checkpoint**: All tests above written and failing — `migrations/0001_extensions_owner_state.sql` and `src/factorflow/db/applied_migrations.py` do not yet exist. `uv run pytest -m postgres` fails with collection or assertion errors; `uv run pytest -m 'not postgres'` fails on T010/T011.

---

## Phase 3: Core Implementation

**Purpose**: Add the migration file and the `applied_migrations` definition the tests require.

- [ ] T012 Create `migrations/0001_extensions_owner_state.sql` at the repo root with the `btree_gist` extension, `instrument` table (with all four check constraints, `idx_instrument_symbol` unique index, `idx_instrument_active` partial index), and `owner_setting` table, exactly as specified in `component-design-market-data-store.md` section 2.3
- [ ] T013 (covered by T012 — no separate file; `instrument` and `owner_setting` are both defined in `migrations/0001_extensions_owner_state.sql`)
- [ ] T011-impl Create `src/factorflow/db/applied_migrations.py` exporting a module-level constant `APPLIED_MIGRATIONS_DDL` holding the `CREATE TABLE IF NOT EXISTS applied_migrations (...)` statement from `component-design-market-data-store.md` section 2.2, verbatim, for CAP-001-E1-S2's migrator to import and execute before running migration files

**Checkpoint**: `migrations/0001_extensions_owner_state.sql` exists and is syntactically valid SQL; `src/factorflow/db/applied_migrations.py` exports the DDL constant; T010 and T011 unit tests pass.

---

## Phase 4: Integration

**Purpose**: Prove the migration file and the `applied_migrations` definition work together against a real PostgreSQL 16 instance, closing out the mandatory component tests.

- [ ] T014 Run the full `tests/integration/` suite from Phase 2 against the `testcontainers[postgres]` fixture (T004) with `migrations/0001_extensions_owner_state.sql` and `applied_migrations.py` now present, and fix any constraint or type mismatch surfaced by TC-COMP-293, TC-COMP-309 through TC-COMP-314

**Checkpoint**: `uv run pytest -m postgres` passes in full. All eight mandatory TC-IDs (TC-COMP-292, 293, 309–314) are green. TC-COMP-292 (single-database state) is satisfied structurally — no task creates a second store — and is asserted by confirming every table in this story lives in the one PostgreSQL schema the fixture provisions.

---

## Phase 5: Polish

**Purpose**: Close the two intentional design gaps this story leaves for later stories, and confirm the full validation suite is green.

- [ ] T015 Add a short `migrations/README.md` noting the forward-only, one-file-per-migration convention (numbered, ascending, never edited once applied) so `0002`–`0004` in later E1 stories follow the same shape without re-deriving it from the design doc
- [ ] T016 Run the complete validation plan (below) and confirm every command passes with nothing excluded except the documented `postgres`-marker exclusion rule

**Checkpoint**: All acceptance criteria this story owns are satisfied; `uv run ruff format --check .`, `uv run ruff check .`, `uv run mypy src`, and `uv run pytest -m postgres` all pass.

---

## Dependencies & Execution Order

### Task Dependencies
- T001–T004 (Phase 1): no dependencies on each other beyond T001 existing before `uv sync` is meaningful; T002–T004 can run in parallel once T001 exists.
- T005–T011 (Phase 2 tests): depend on Phase 1's `conftest.py` fixture (T004); independent of each other, can run in parallel.
- T012 depends on Phase 1 only; write it to make T006, T007, T008, T009, and T010 pass.
- T011-impl depends on Phase 1 only; write it to make T005 and T011 pass.
- T014 depends on T012 and T011-impl both existing (Phase 3 complete).
- T015 depends on T012 (documents the convention the shipped file follows).
- T016 depends on every prior task.

### Parallel Opportunities
- Phase 1: T002, T003, T004 in parallel after T001.
- Phase 2: T005, T006, T007, T008, T009, T010, T011 all in parallel (distinct test files).
- Phase 3: T012 and T011-impl in parallel (distinct files, no shared state).

---

## Validation Plan

### Constitution-Defined Commands
- Install: `uv sync --all-extras`
- Build: `uv build`
- Test (full): `uv run pytest`
- Test (no container runtime): `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format check: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- Applying `migrations/0001_extensions_owner_state.sql` to an empty PostgreSQL 16 database succeeds and creates the `btree_gist` extension, `instrument`, and `owner_setting` (DAC-E1-S1-1, DAC-E1-S1-4).
- Each of the five violating cases in the story's Testing section is rejected by a check constraint, not by application code: lowercase symbol, symbol over 16 characters, unknown lifecycle, `retired` without `retired_at`, `active` with `retired_at` (DAC-E1-S1-2, DAC-E1-S1-3).
- `applied_migrations`, created independently of any migration file, holds exactly `version` (PK), `name`, `checksum`, `applied_at` (DAC-E1-2, DAC-E1-S1-5).
- Applying `0001` a second time, guarded by a check against `applied_migrations`, records no second row and executes no statement (DAC-E1-S1-6).
- `migrations/0001_extensions_owner_state.sql` and `src/factorflow/db/applied_migrations.py` match their respective SQL text in `component-design-market-data-store.md` verbatim.

### Postgres-Marked Test Note
Per the tech stack's validation notes: if no container runtime is available when this story is implemented, run `uv run pytest -m 'not postgres'` and report the exclusion explicitly. Do not report a partial run (Phase 1 tests only) as a green suite — every mandatory TC-ID in this story requires the `postgres` marker.

---

## Notes

- **This story also bootstraps the Python project.** No `pyproject.toml`, `src/` layout, or test configuration exists anywhere in the repository yet; per the tech stack document ("None of these scripts exist yet. The first stories create `pyproject.toml` and `package.json`, and MUST define these command names"), Phase 1 here is that bootstrap for the Python side. `package.json` for the frontend is out of scope for this story — no acceptance criterion here touches the owner interface.
- **`applied_migrations` is intentionally not created by a migration file.** Per the story description and the component design, it is created by the migrator before the first migration file runs. Since the migrator itself (`src/factorflow/db/migrator.py`) is CAP-001-E1-S2, this story instead exports its DDL as an importable constant (T011-impl) so E1-S2 can execute it without redefining the schema, and so the two stories' definitions cannot drift (enforced by the unit test in T011).
- **T013 is a placeholder, not a real task.** `instrument` and `owner_setting` are both defined inside the single file `migrations/0001_extensions_owner_state.sql` created by T012; there is no second file to create. It is listed in the traceability table only so the table's task references stay stable against the AC list — no action is required beyond T012.
- **Task ID `T011-impl` is used for the `applied_migrations.py` implementation** to keep it visibly paired with its T011 unit test without renumbering the whole sequence; a coding agent should feel free to renumber sequentially when executing, as long as the dependency ordering above is preserved.
- **DAC-E1-1 (single-database state) has no dedicated implementation task.** It is a structural property — nothing in this story or any story in this capability introduces a second store — and is verified by inspection at T014 rather than by a targeted test, consistent with TC-COMP-292's own preconditions ("no additional condition is assumed").
- **Symbol uniqueness across lifecycle states is deliberately not enforced here.** `idx_instrument_symbol` is a plain unique index in this migration; reactivation semantics (a retired symbol becoming active again) are explicitly deferred to CAP-001-E2-S1 per the story text, and no task in this plan should add logic anticipating that.
- **AC-15 is only partially satisfied by this story.** Full forward-evolution behavior (applying several unapplied migrations in order, refusing an inconsistent store) belongs to CAP-001-E1-S2's migrator. This story's contribution to AC-15 is narrower: applying `0001` twice must not lose or rewrite the `instrument`/`owner_setting` rows already present, which T009/T014 verify directly against the SQL file rather than through a migrator.
