---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S2-tasks
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
    - id: CAP-001-E1-S2
      version: "1"
    - id: CAP-001-component-design-schema-migrator
      version: "4"
    - id: tech-stack
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E1-S2 — Forward-Only Migrator With Refusal to Start on an Inconsistent Store

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-epics`
**Date**: 2026-09-06

## Summary

This story delivers `src/factorflow/db/migrator.py` (discovery, checksum comparison, advisory-lock serialization, per-file transactional application) and the container entrypoint `src/factorflow/db/migrate_main.py`, which maps every outcome to one of five exit codes and runs before uvicorn binds. It applies the migration file and `applied_migrations` definition delivered by CAP-001-E1-S1, and it is the component that decides whether the product is allowed to run at all against the data it finds — AC-15 (bring existing data forward without loss) and AC-16 (refuse to start rather than serve from a store the build doesn't understand) rest entirely on it.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-15 | Unapplied migrations are applied in ascending order; no existing row lost or rewritten | T007, T008, T015, T016 |
| AC-16 | A store that cannot be brought forward causes the migrator to report failure and the API to never bind | T009–T012, T017, T020 |
| DAC-E1-3 | Migrations applied in ascending numbered order, each recorded with version/name/checksum | T006, T007, T015 |
| DAC-E1-4 | Store holding an unknown migration number exits non-zero, API never binds | T009, T017 |
| DAC-E1-5 | Advisory lock serializes two concurrently-starting containers | T013, T019 |
| DAC-E1-S2-1 | Schema already current exits `0` logging `schema current at version N`, applies nothing | T008, T016 |
| DAC-E1-S2-2 | Unreachable database/rejected credentials exits `1` naming host and database, never the password | T009, T017 |
| DAC-E1-S2-3 | Store ahead of build exits `2` stating both versions | T010, T017 |
| DAC-E1-S2-4 | Checksum mismatch on a recorded migration exits `3` | T011, T017 |
| DAC-E1-S2-5 | A migration failing partway exits `4`, nothing from it committed | T012, T018 |
| DAC-E1-S2-6 | Every migrator message goes through the structured logger at `error`, carrying the migration version, never `print` | T014, T021 |
| DAC-E1-S2-7 | Connection-failure messages are built from known-safe fields, never from the raw driver exception | T009, T014, T021 |
| DAC-E1-S2-8 | Advisory lock is held for the duration of a long migration | T013, T019 |

## Phase 1: Setup

**Purpose**: Establish the fixed constants and container-entrypoint scaffolding the migrator and its tests both need before any logic is written.

- [x] T001 Create `src/factorflow/db/constants.py` defining `ADVISORY_LOCK_KEY: int = 0x46414354_4F52464C` (a fixed, named `bigint` key for `pg_advisory_lock`, chosen once here per component design section 14 open question 2, which explicitly defers the value to the implementing story) — document in a module docstring that this value must never change once shipped, since a changed key stops serializing against migrators built from the prior key
- [x] T002 [P] Extend `tests/conftest.py` (from CAP-001-E1-S1) with a fixture that seeds a `testcontainers` PostgreSQL 16 instance with migration `0001` NOT yet applied, for tests that exercise `discover`/`apply_pending` from an empty store — **deviation**: `conftest.py`'s existing `postgres_connection_string` fixture already yields a freshly created, empty database per test (no migrations applied), which is exactly this state; adding a second fixture that does the same thing under a different name would be a pure alias with no behavioral difference, so tests use `postgres_connection_string` directly instead
- [x] T003 [P] Add a `tests/fixtures/migrations_ok/` directory containing a copy of `0001_extensions_owner_state.sql` (symlinked or copied from the repo's real `migrations/` directory at test-collection time) plus a synthetic `0002_test_only.sql` used only by this story's failure-path tests, so a deliberately broken migration file does not have to live in the real `migrations/` directory — implemented as a symlink (not a copy) so the fixture cannot drift from the real file the design-drift test guards
- [x] T004 [P] Add `tests/fixtures/migrations_broken/0002_broken.sql` containing a statement that fails at execution time (e.g. `INSERT INTO does_not_exist VALUES (1);`), for the exit-4 test
- [x] T005 [P] Confirm (no code change) that `src/factorflow/db/applied_migrations.py` and `migrations/0001_extensions_owner_state.sql` from CAP-001-E1-S1 are present and importable; if CAP-001-E1-S1 has not yet landed on this branch, block on it rather than duplicating its DDL here — confirmed present, CAP-001-E1-S1 merged to main (commit c9522bc)

**Checkpoint**: Fixtures for a clean database, an "already migrated" database, and a broken migration file all exist; the advisory lock key is defined in one place; `uv run pytest -m 'not postgres'` still passes with zero new failures.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests for the eleven mandatory component TC-IDs mapped from the coverage matrix, plus additional unit tests for internal functions the component design's interface names but the TC-IDs don't individually cover.

### Mandatory Component Tests

- [x] T006 [P] Implement TC-COMP-294 (migrations applied in ascending numbered order, each recorded with version/name/checksum; a correction is a new file, never an edit) in `tests/integration/test_migrator_empty.py` — apply against an empty database seeded with `0001` only (from T002/T005), assert one row in `applied_migrations` with the correct version, name, and SHA-256 checksum of the file bytes
- [x] T007 [P] Implement TC-COMP-015 (forward data evolution: an existing store's history is brought forward without loss) in `tests/integration/test_migrator_preserves_data.py` — apply `0001`, insert an `instrument` row directly, run `apply_pending` again, assert the row is byte-identical and no second `applied_migrations` row for version 1 was written
- [x] T008 [P] Implement TC-COMP-315 / DAC-E1-S2-1 (schema already current exits `0` logging `schema current at version N`, applies nothing) in `tests/integration/test_migrator_idempotent.py` — run `apply_pending` twice against the same store, assert the second call returns an empty list of applied versions and the log record's message
- [x] T009 [P] Implement TC-COMP-016, TC-COMP-295, TC-COMP-316 / DAC-E1-4, DAC-E1-S2-2, DAC-E1-S2-7 (unreachable database or rejected credentials exits `1`, message names host and database but never the password, and is built from known-safe fields rather than the raw driver exception) in `tests/integration/test_migrator_refuses.py::test_unreachable_database` — point `migrate_main` at a bad host/port, assert exit code `1` and that the captured log message contains the host and database name but not the password substring used in the connection string
- [x] T010 [P] Implement TC-COMP-317 / DAC-E1-S2-3 (store holds a version this build does not carry exits `2` stating both versions) in `tests/integration/test_migrator_refuses.py::test_store_ahead_of_build` — seed `applied_migrations` with a synthetic row at version `99`, assert exit code `2` and a message naming `99` and the build's highest known version
- [x] T011 [P] Implement TC-COMP-318 / DAC-E1-S2-4 (recorded checksum differs from the file this build carries exits `3`) in `tests/integration/test_migrator_refuses.py::test_checksum_mismatch` — apply `0001`, then mutate the recorded checksum for version 1 directly in `applied_migrations`, re-run, assert exit code `3` naming version 1
- [x] T012 [P] Implement TC-COMP-319 / DAC-E1-S2-5 (a migration failing partway exits `4`, nothing from it committed) in `tests/integration/test_migrator_refuses.py::test_failing_migration_rolls_back` — apply `0001` cleanly, then run against `tests/fixtures/migrations_broken/0002_broken.sql` (T004), assert exit code `4`, no `applied_migrations` row for version 2, and none of that file's statements persisted
- [x] T013 [P] Implement TC-COMP-296, TC-COMP-322 / DAC-E1-5, DAC-E1-S2-8 (advisory lock serializes two concurrently-starting containers; the lock is held for the duration of a long migration) in `tests/integration/test_migrator_concurrent.py` — start two `apply_pending` calls concurrently (threads or processes) against one empty store, assert each version is applied exactly once and both calls exit `0`
- [x] T014 [P] Implement TC-COMP-320, TC-COMP-321 / DAC-E1-S2-6, DAC-E1-S2-7 (every migrator message goes through the structured logger at `error` carrying the migration version, never `print`; failure messages never contain the raw driver exception) in `tests/unit/test_migrator_logging.py` — capture the structured logger's output for each exit path, assert no `print` call occurred (patch `builtins.print` to fail the test if called) and that a connection failure's log record contains no substring from the raw `psycopg.OperationalError` message, only the known-safe host/database fields

### Additional Unit Tests

- [x] T015 [P] Write a unit test for `discover()` in `tests/unit/test_migrator_discover.py` — asserts it returns `MigrationFile` entries ordered by version, raises `MigrationError` on a malformed filename (not matching `NNNN_snake_case_name.sql`) and on a repeated version number, per the component design's interface docstring
- [x] T016 [P] Write a unit test asserting `apply_pending` returns an empty list (not `None`) when given zero unapplied files, in `tests/unit/test_migrator_apply_pending_noop.py`
- [x] T017 [P] Write a unit test asserting `migrate_main`'s exit-code mapping table (0/1/2/3/4) matches the component design's section 2.5 table exactly, in `tests/unit/test_migrate_main_exit_codes.py` — one parametrized case per exit code, driving `migrate_main`'s outcome-to-exit-code function with a mocked `MigrationError` subtype or successful result and asserting `sys.exit` is called with the right code
- [x] T018 [P] Write a unit test asserting a migration file containing `BEGIN` or `COMMIT` is rejected before being applied (per component design section 2.2: "the file must not contain `BEGIN` or `COMMIT`"), in `tests/unit/test_migration_filenames.py` — this test can be added here or alongside CAP-001-E1-S1's filename tests if that file already exists on this branch

**Checkpoint**: All eleven mandatory TC-ID tests and the four additional unit tests are written and fail — `src/factorflow/db/migrator.py` and `src/factorflow/db/migrate_main.py` do not yet exist.

---

## Phase 3: Core Implementation

**Purpose**: Implement the migrator's discovery, application, and locking logic, and the entrypoint that maps outcomes to exit codes.

- [x] T019 Create `src/factorflow/db/migrator.py` implementing `MigrationError`, the frozen `MigrationFile` dataclass, `discover(directory: Path) -> list[MigrationFile]`, and `apply_pending(connection: psycopg.Connection, files: list[MigrationFile]) -> list[int]` exactly per component design section 2.4 — `apply_pending` takes `pg_advisory_lock(ADVISORY_LOCK_KEY)` (from T001) for its full duration, opens one transaction per file, inserts the `applied_migrations` row (using `src/factorflow/db/applied_migrations.py`'s DDL from CAP-001-E1-S1) inside that same transaction, and compares recorded checksums (SHA-256 of file bytes) against the files this build carries before applying anything
- [x] T020 Create `src/factorflow/db/migrate_main.py` as the container entrypoint: connects using the database URL from the `FACTORFLOW_DATABASE_URL` environment variable (per CAP-001-E1-S3's documented configuration surface — read directly from `os.environ` in this story since `runtime-config` is not yet implemented; replacing this read with `runtime-config`'s settings object is CAP-001-E1-S3's or a follow-up integration concern, not this story's), calls `discover` then `apply_pending`, and maps every outcome (success, connection failure, store-ahead, checksum mismatch, migration failure) to exit codes 0–4 per component design section 2.5's message-shape table
- [x] T021 Add structured logging to both modules: every exit path logs through the project's structured logger (not `print`) at `error` level (for non-zero exits) carrying the migration version as a field, and every failure message is constructed from known-safe fields (host, database name, migration version) rather than by formatting the raw driver exception — this is what T009's and T014's tests assert

**Checkpoint**: `migrator.py` and `migrate_main.py` exist; T006–T018 all pass except the ones requiring the entrypoint wiring finished in Phase 4.

---

## Phase 4: Integration

**Purpose**: Wire the entrypoint into the application container's start sequence and confirm end-to-end behavior against a real PostgreSQL 16 instance.

- [x] T022 Add (or update, if CAP-001-E1-S1 or a later infra story already created one) the application container's entrypoint script/Dockerfile `CMD` so it runs `python -m factorflow.db.migrate_main && exec uvicorn ...` — chained with `&&` per component design section 6, so a non-zero migrator exit prevents the API from starting without additional supervision logic. If no Dockerfile exists yet on this branch, create a minimal one at the repo root scoped only to satisfying this chaining requirement, and note in this task's completion that full container packaging is out of this story's scope
- [x] T023 Run the full `tests/integration/` and `tests/unit/` suites from Phase 2 against the real fixtures and implementation, and fix any mismatch between the exit-code messages produced and the component design section 2.5 table

**Checkpoint**: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` both pass in full. All eleven mandatory TC-IDs (TC-COMP-015, 016, 294, 295, 296, 315–322) are green.

---

## Phase 5: Polish

**Purpose**: Close out logging correctness and confirm the complete validation suite passes.

- [x] T024 Review every log record emitted across all five exit paths for accidental inclusion of connection-string fragments or driver exception text (beyond what T009/T014 already assert), tightening any message that leaks more than host/database/migration version
- [x] T025 Run the complete validation plan (below) and confirm every command passes

**Checkpoint**: All acceptance criteria this story owns are satisfied; `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv run pytest -m postgres` all pass.

---

## Dependencies & Execution Order

### Task Dependencies
- T001–T005 (Phase 1): T001 has no dependencies; T002–T004 depend on `tests/conftest.py` existing (CAP-001-E1-S1); T005 is a blocking check, not an implementation task.
- T006–T018 (Phase 2): all depend on Phase 1's fixtures (T001–T005); independent of each other, can run in parallel.
- T019 depends on T001 (advisory lock key) and CAP-001-E1-S1's `applied_migrations.py` and `migrations/0001_...sql`.
- T020 depends on T019 existing (imports `discover`/`apply_pending`) and on CAP-001-E1-S3's documented `FACTORFLOW_DATABASE_URL` contract (not the module itself).
- T021 depends on T019 and T020 both existing (adds logging into both).
- T022 depends on T020 (the entrypoint it chains).
- T023 depends on T019, T020, T021 (full implementation) to make Phase 2's tests pass.
- T024, T025 depend on T023.

### Parallel Opportunities
- Phase 1: T002, T003, T004 in parallel after T001.
- Phase 2: T006 through T018 all in parallel (distinct test files/cases).
- Phase 3: T019 and T020 have a soft dependency (T020 imports T019) but can be drafted in parallel and integrated at T021.

---

## Validation Plan

### Constitution-Defined Commands
- Test: `uv run pytest -m postgres` (this story's mandatory tests all require the container)
- Test (no container): `uv run pytest -m 'not postgres'` (unit tests only — T015–T018)
- Lint: `uv run ruff check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- Applying `0001` to an empty database via `migrate_main` exits `0` and records exactly one row in `applied_migrations` (AC-15, DAC-E1-3).
- Running `migrate_main` a second time against the same store exits `0`, applies nothing, and every previously-written row (including `instrument`/`owner_setting` data) is unchanged (AC-15, DAC-E1-S2-1).
- Each of the four non-zero exits (1 unreachable, 2 store-ahead, 3 checksum mismatch, 4 migration failure) is exercised and produces the exact message shape from component design section 2.5 (AC-16, DAC-E1-4, DAC-E1-S2-2 through DAC-E1-S2-5).
- No log record from this module contains the database password, regardless of exit path (AC-13, DAC-E1-S2-7).
- Two concurrent `migrate_main` invocations against one empty store both exit `0` and each migration version is applied exactly once (DAC-E1-5, DAC-E1-S2-8).
- The container entrypoint's `&&` chaining means a non-zero migrator exit leaves uvicorn unexecuted — verified by T022/T023 rather than by a unit test, since it is a shell-level property.

### Postgres-Marked Test Note
Per the tech stack's validation notes: every mandatory TC-ID in this story except T015–T018 (unit tests) requires the `postgres` marker and a running container runtime. If unavailable, run `uv run pytest -m 'not postgres'` and report the exclusion explicitly rather than reporting a partial run as a green suite.

---

## Notes

- **The advisory lock key is fixed here, by design.** Component design section 14, open question 2, explicitly defers the constant's value to "the implementing story" — this plan picks one in T001 (`ADVISORY_LOCK_KEY = 0x46414354_4F52464C`, an arbitrary but fixed 64-bit value) and documents it as immutable once shipped. No later story should redefine it; a changed key would silently stop serializing concurrent migrators built from different versions.
- **This story consumes CAP-001-E1-S3's settings contract, not its module.** CAP-001-E1-S3 (`runtime-config`) is still `todo` at the time of this plan. Per CAP-001-E1-S2's own "Dependencies" section, it can be developed in parallel against the documented `FACTORFLOW_DATABASE_URL` contract. T020 reads the environment variable directly rather than importing a `runtime-config` module that does not yet exist; wiring the real settings object in once CAP-001-E1-S3 lands is a small follow-up change, not a redesign, and is called out here so the coding agent does not block on it.
- **CAP-001-E1-S1 is a hard dependency, not a parallel one.** This story applies `migrations/0001_extensions_owner_state.sql` and creates rows against the `applied_migrations` table CAP-001-E1-S1 defines. If that story's task plan has not been coded yet on this branch, T005 should block rather than duplicate the migration file or DDL constant here.
- **Container packaging (T022) is scoped minimally.** No Dockerfile or docker-compose configuration exists anywhere in the repository yet. This story creates only the entrypoint chaining needed to prove AC-16's "API never binds" property; full container image definition for the application and ingestion processes (per tech stack C1's two-process topology) is not an acceptance criterion of this story and should not be over-built here.
- **Synthetic test migration files (T003, T004) live under `tests/fixtures/`, never under the real `migrations/` directory.** The real `migrations/` directory must contain only migrations this build actually ships; a broken or test-only file placed there would be picked up by `discover()` in production.
