---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-20
last_reworked_review: CAP-002-E1-S1-implementation-review-v2.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T21:12:43Z
  source_artifacts:
    - id: CAP-002-E1-S1
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-component-design-universe-service
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E1-S1 — Migration 0005: universe and universe_event Tables

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1.md`
**Component**: `FactorFlow-v2` (module `research-store`, migration `0005` only)
**Branch**: `usr/alvaro-de-jodra/CAP-002-E1-tasks`
**Date**: 2026-10-17

## Summary

Deliver `src/factorflow/db/migrations/0005_universes.sql`, creating `universe` and `universe_event` exactly as `component-design-research-store.md` section 2.3 specifies (five named CHECKs, four indexes, two column comments), plus the shared guards later CAP-002 stories extend: `tests/unit/test_research_sql_is_append_only.py`, `tests/unit/test_package_data_ships_sql.py` and the research-store apply and constraint tests. It appends `universes/sql/*.sql` to `[tool.setuptools.package-data]` (DEC-0088) so the `universe-service` SQL ships in a non-editable install. Adding a fifth migration breaks two delivered inventory tests; the plan edits both minimally under DEC-0092 (PROVISIONAL). No production Python is written: the story's only production artefacts are one SQL file and one `pyproject.toml` line.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-3 | More than one named universe; a stock may belong to several (no uniqueness across universes on `instrument_id`) | T001, T002, T004, T008, T009 |
| AC-6 | Dated membership retained, append-only, as-of by `recorded_on` and `event_id` | T003, T004, T005, T008 |
| DAC-E1-10 | No UPDATE or DELETE against `universe` or `universe_event` in any `.sql` or Python source under the tree | T003 |
| DAC-E1-S1-1 | `0005` applies on a store holding `0001` to `0004` and data; `applied_migrations` records 5; no CAP-001 row changes (TC-COMP-045) | T005, T006, T007, T008 |
| DAC-E1-S1-2 | Named CHECKs refuse unknown type, member without instrument, created without name, renamed with provenance, untrimmed or empty name (TC-COMP-046) | T004, T008 |
| DAC-E1-S1-3 | Second `created` or `retired` event refused by the partial unique index (TC-COMP-034) | T004, T008 |
| DAC-E1-S1-4 | Static guard: no `UPDATE`, `DELETE FROM` or upsert names `universe_event` (TC-COMP-047) | T003 |
| DAC-E1-S1-5 | `test_migration_0005_matches_design.py` finds every table, column, constraint and index of section 2.3 (TC-COMP-017) | T001, T008 |
| DAC-E1-S1-6 | A second migrator run after `0005` applies nothing and exits 0 (TC-COMP-048) | T005 |
| DAC-E1-S1-7 | Every `sql/` directory under `src/factorflow/` matches a package-data glob (TC-COMP-018) | T002, T009 |

Mapped component test cases (coverage-matrix rows DAC-E1-S1-1 to -7 and DAC-E1-10): TC-COMP-017, TC-COMP-018, TC-COMP-034, TC-COMP-045, TC-COMP-046, TC-COMP-047, TC-COMP-048. Seven TCs, all `Covered` in `tests/coverage-matrix.md`. TC-COMP-075, -076, -156 to -165 belong to CAP-002-E2-S1 and are not planned here.

## Phase 1: Setup

Skipped: no new dependency, directory or configuration is needed before the tests. `pyproject.toml` is edited in Phase 3 so that its guard test is observed failing first.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define expected behaviour from the ACs. Test module paths are fixed by the story's Implementation section and research-store section 2.1/7. Each test module defines its own migration path with `MIGRATIONS_DIR / "0005_universes.sql"` from `factorflow.db.migrate_main`; `tests/conftest.py` is not edited (it is not on DEC-0084's delivered-file list).

### Mandatory Component Tests

- [x] T001 [P] Implement TC-COMP-017 (Migration 0005 matches research-store design) in `tests/unit/test_migration_0005_matches_design.py` (`# Implements TC-COMP-017`). Follow `tests/unit/test_migration_0001_matches_design.py`: read the design's own SQL, never a pasted copy. `tests/unit/design_sql.py::sql_block_under_heading` accepts a `path` argument, so call `sql_block_under_heading("### 2.3", path=<REPO_ROOT>/docs/capabilities/CAP-002-universe-and-factor-classification/design/component-design-research-store.md)` (define the path constant in the new module; do not edit `design_sql.py`). Assert (a) `0005_universes.sql` text equals the block verbatim; (b) a sanity test that the block really was found (contains `CREATE TABLE universe (` and `CREATE TABLE universe_event (`); (c) explicit presence of every name section 2.3 lists: tables `universe`, `universe_event`; columns `universe_id`, `created_at`, `event_id`, `event_type`, `instrument_id`, `name`, `filter_provenance`, `recorded_at`, `recorded_on`; constraints `universe_event_type_known`, `universe_event_member_has_instrument`, `universe_event_name_agrees`, `universe_event_name_trimmed`, `universe_event_provenance_only_on_created`; indexes `idx_universe_event_universe`, `idx_universe_event_instrument`, `idx_universe_event_single_created`, `idx_universe_event_single_retired`; and that no `CHECK` mentions `octet_length`/`length(` (no invented name-length bound). Fails now: the migration file does not exist.
- [x] T002 [P] Implement TC-COMP-018 (Every sql directory is covered by a package-data glob) in `tests/unit/test_package_data_ships_sql.py` (`# Implements TC-COMP-018`). Parse `pyproject.toml` with `tomllib` and read `tool.setuptools.package-data["factorflow"]`. Assert: (a) for every directory named `sql` found by `rglob` under `src/factorflow/` that holds at least one `.sql` file, each of its `.sql` files matches at least one glob (match the path relative to `src/factorflow/` with `fnmatch`/`PurePath.match`; the existing globs are `coverage/sql/*.sql`, `db/migrations/*.sql`, `api/static/**/*`); (b) `universes/sql/*.sql` is present in the list explicitly, because `src/factorflow/universes/sql/` does not exist until CAP-002-E1-S2 creates it, so rule (a) alone cannot see it (DAC-E1-S1-7 names it). Add a small synthetic-input test of the matcher (a `sql/` directory under a throwaway tree with no glob is reported) so the guard is shown to fail. CAP-002-E2-S1 extends rule (b) with `classification/sql/*.sql`. Fails now: `universes/sql/*.sql` is absent.
- [x] T003 [P] Implement TC-COMP-047 (Static guard finds no UPDATE or DELETE on universe_event) in `tests/unit/test_research_sql_is_append_only.py` (`# Implements TC-COMP-047`, also names DAC-E1-10). Scan every `.sql` and every `.py` under `src/factorflow/` (`rglob`, not only `db/migrations/`: DAC-E1-S1-4 says every `.sql` file). Table tuple for this story: `universe_event` and `universe` (DAC-E1-10 names both; see Resolved Conflicts). The delivered helper `prohibited_observation_mutations` in `tests/unit/test_sql_is_append_only.py` hard-codes its table list in module constants and cannot take another list, and DEC-0064 forbids editing the delivered file, so this module builds the same three patterns (`UPDATE [ONLY]`, `DELETE FROM [ONLY]`, `INSERT ... ON CONFLICT ... DO UPDATE`, each with optional schema qualification and quoting) from its own table tuple, exposing `prohibited_research_mutations(text) -> list[str]`. Include the delivered file's parametrised detection cases rewritten for `universe_event` (UPDATE, DELETE FROM, DELETE FROM ONLY, schema-qualified, upsert) and a negative case (`UPDATE instrument SET ...` is ignored; `universe_event_foo` is not matched because of the `(?!\w)` lookahead). Structure the table tuple as a single module constant so CAP-002-E2-S1 extends it with the three classification tables and the `classification_set` `state = 'building'` guard. This guard passes on the current tree (no such statements exist) so its RED evidence is the detection tests failing before the pattern builder exists.
- [x] T004 [P] Implement TC-COMP-046 (Universe event CHECK constraints refuse malformed events) and TC-COMP-034 (Partial unique index allows one created and one retired event) in `tests/integration/test_research_constraints.py`, marked `pytest.mark.postgres` (`# Implements TC-COMP-046, TC-COMP-034`). Apply `0001` to `0005` to a database from the `postgres_connection_string` fixture via `discover(MIGRATIONS_DIR)` filtered to versions 1 to 5 and `apply_pending` (so CAP-002-E2-S1's `0006` does not change this test). Insert one `instrument` and one `universe` (`INSERT INTO universe DEFAULT VALUES RETURNING universe_id`). Cases, each inside a savepoint or fresh transaction so one refusal does not abort the next, each asserting `psycopg.errors.CheckViolation` and that `exc.diag.constraint_name` is the named constraint: unknown `event_type` -> `universe_event_type_known`; `member_added` with NULL `instrument_id` -> `universe_event_member_has_instrument`; `created` with NULL `name` -> `universe_event_name_agrees`; `renamed` carrying `filter_provenance` -> `universe_event_provenance_only_on_created`; name `' x'` (untrimmed) and name `''` -> `universe_event_name_trimmed`. TC-COMP-034: insert `created` then a second `created` for the same universe, and `retired` then a second `retired`, each asserting `psycopg.errors.UniqueViolation` with constraint name `idx_universe_event_single_created` / `idx_universe_event_single_retired`. Add positive controls that make the refusals meaningful: a valid `created` (with `filter_provenance`), `renamed`, `member_added`/`member_removed` and `retired` sequence is accepted, the same instrument may be `member_added` in two different universes (AC-3), `recorded_on` defaults to a date and `event_id` is strictly increasing. Fails now: tables do not exist.
- [x] T005 [P] Implement TC-COMP-045 (Migration 0005 applies without touching CAP-001 rows) and TC-COMP-048 (Second migrator run after 0005 applies nothing) in `tests/integration/test_research_migrations_apply.py`, marked `pytest.mark.postgres` (`# Implements TC-COMP-045, TC-COMP-048`). TC-COMP-045: apply versions 1 to 4 with `apply_pending`; seed one `instrument`, one `daily_bar`, one `fundamental_observation` and one `acquisition_run` (copy the column lists from `tests/integration/test_migrations_apply.py` for `instrument` and `daily_bar`, and from `0002_observations.sql` and `0004_runs.sql` / `tests/integration/test_run_cancel.py` for the other two); snapshot every CAP-001 table's rows (`SELECT * ... ORDER BY` per table, including `applied_migrations` rows for versions 1 to 4); apply versions up to 5 and assert `apply_pending` returned `[5]`, `applied_migrations` holds a version 5 row with the file's checksum, the version 1 to 4 rows and every seeded CAP-001 row are unchanged, and `universe`/`universe_event` exist and are empty. TC-COMP-048: using `factorflow.db.migrate_main.run_migrations(url, MIGRATIONS_DIR)` against a fresh database, the first call returns exit code 0 and the second returns `(0, "schema current at version <highest>")` and leaves `applied_migrations` unchanged. Structure the seeding in a module-level helper so CAP-002-E2-S1 adds its `0006` cases without rewriting it. Fails now: `apply_pending` returns `[]` for version 5.

### Delivered-test maintenance (DEC-0092, PROVISIONAL)

- [x] T006 [P] Edit `tests/unit/test_migration_filenames.py` `test_e5_real_migration_inventory_is_contiguous_through_four`: the expected list gains `"0005_universes.sql"`, and nothing else in the file changes (leave the function name as is to keep the edit to one list entry; the other assertions in the file are already general). Done first it is red (expects five files, four exist) and goes green with T008. Traces to DAC-E1-S1-1 (the story cannot pass its Validation otherwise); backlog review v5 FINDING-19.
- [x] T007 [P] Edit `tests/unit/test_distribution_contents.py`: add `"0005_universes.sql"` to `_MIGRATIONS`, change `assert versions == "[1, 2, 3, 4]"` to `"[1, 2, 3, 4, 5]"`, and the docstring "versions 1 to 4" to "versions 1 to 5"; nothing else changes. Same trace as T006. (This test builds a wheel with `uv build --wheel --offline`; it runs under `-m 'not postgres'`.)

**Checkpoint**: All new tests exist and fail for the right reason (missing migration or missing glob); T006 and T007 fail because the file count is now wrong in the other direction. No production file has been touched.

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with the two production artefacts.

- [x] T008 Create `src/factorflow/db/migrations/0005_universes.sql` containing exactly the ```sql block under `### 2.3` of `docs/capabilities/CAP-002-universe-and-factor-classification/design/component-design-research-store.md` (copy it; T001's verbatim comparison enforces it, trailing newline as `sql_block_under_heading` returns it). Plain SQL, one file one transaction, no `BEGIN`/`COMMIT` (the block contains neither; `discover` and `test_migration_filenames.py` reject them), additive only (no delivered table, column or index is altered), no length `CHECK` on `name`. Do not wrap in a transaction and do not add statements the design does not show (depends on T001 to T007 existing).
- [x] T009 [P] Edit `pyproject.toml` line `factorflow = [...]` under `[tool.setuptools.package-data]`: append `"universes/sql/*.sql"` to the end of the list, giving `["coverage/sql/*.sql", "db/migrations/*.sql", "api/static/**/*", "universes/sql/*.sql"]`. Nothing else in the file changes (DEC-0088; `pyproject.toml` is the tenth delivered file CAP-002 edits). Do not create `src/factorflow/universes/`; CAP-002-E1-S2 does.

**Checkpoint**: `uv run pytest -m 'not postgres'` and `uv run pytest -m postgres` pass for every test written in Phase 2, including T006 and T007.

---

## Phase 4: Integration

Skipped: this story adds no wiring. The migration is discovered by the delivered migrator through `MIGRATIONS_DIR`; no module imports it.

---

## Phase 5: Polish

**Purpose**: Final checks and cross-cutting concerns.

- [x] T010 Confirm `src/factorflow/db/migrations/README.md` needs no edit: the story says the file table is not edited "unless the checker requires it". Planning found no checker: `grep` over `tests/` and `scripts/` shows no test reads that README (`tests/unit/test_readme_deployment.py` reads the repository README). Leave the file table unchanged; if the coding agent finds a checker that reads it, add the `0005_universes.sql | CAP-002-E1-S1 | universe, universe_event` row and report it. Doc-sync records the row after review otherwise.
- [x] T011 Run every validation command in the Validation Plan from the repository root and fix any failure introduced by T001 to T009 (including `ruff format --check` on the new modules and `mypy src`, which is unaffected because no source file changes). Confirm `git status` shows only the files named in T001 to T009 plus the task file and TDD-evidence file.
- [x] T012 After each TDD cycle in T001–T011 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E1-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC). Suggested cycles: (1) T001, T004, T005, T006, T007 with T008 (the migration); (2) T002 with T009 (package data); (3) T003 (the append-only guard, RED evidence is its detection tests failing before the pattern builder exists).

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E1-S2 | reverse | Creates `src/factorflow/universes/sql/` and loads its statements at import; consumes the tables and the `universes/sql/*.sql` glob this story delivers. Graph: `E1-S2: [E1-S1]` |
| CAP-002-E2-S1 | reverse | Extends `test_research_sql_is_append_only.py`, `test_package_data_ships_sql.py` and `test_research_migrations_apply.py` created here and adds `0006`. Graph: `E2-S1: [E1-S1]` |

No new hard edge: this story imports nothing another story creates (`dependencies.yaml` already has `CAP-002-E1-S1: []`), so `dependencies.yaml` is unchanged. The producers it uses are all delivered CAP-001 code (migrator, `design_sql.py`, `conftest.py` fixtures).

### Task Dependencies
- T001 to T007: no dependencies on each other (separate files); all precede T008 and T009.
- T008: depends on T001 to T007 being written (TDD order). T001, T004, T005, T006, T007 pass only after it.
- T009: depends on T002; can run in parallel with T008. T002 passes only after it.
- T010: depends on T008.
- T011: depends on T008, T009, T010.
- T012: interleaved — runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities
- Phase 2: T001 to T007 can all be written in parallel.
- Phase 3: T008 and T009 can run in parallel.

### Phase dependencies
Phase 2 before Phase 3; Phase 5 after Phase 3. Phase 1 and Phase 4 are skipped.

---

## Validation Plan

### Constitution-Defined Commands
- Build: `uv build` (T007's wheel test builds one with `uv build --wheel --offline`)
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- DAC-E1-S1-1: T005 shows version 5 recorded and every seeded CAP-001 row unchanged; T006 and T007 show the delivered inventory tests agree with five files.
- DAC-E1-S1-2: T004 shows each malformed event refused with the named constraint.
- DAC-E1-S1-3: T004 shows a second `created` and a second `retired` refused with the named index.
- DAC-E1-S1-4 and DAC-E1-10: T003 passes on the whole tree and its detection cases fail on synthetic `UPDATE`/`DELETE FROM`/upsert against `universe_event` and `universe`.
- DAC-E1-S1-5: T001 verbatim and named-element assertions.
- DAC-E1-S1-6: T005 second `run_migrations` call returns exit code 0 with `schema current at version N`.
- DAC-E1-S1-7: T002 passes after T009 and fails on a synthetic uncovered `sql/` directory.

---

## Notes

### Resolved Conflicts

- **Guard table list: `universe` and `universe_event` versus the four append-only tables.** DAC-E1-10 (epic AC) says no statement against `universe` or `universe_event` may be an UPDATE or DELETE; research-store section 2.5 lists only `universe_event` among the append-only tables and calls `universe` "insert-only in content"; DAC-E1-S1-4 names only `universe_event`. Governing rule: capability and epic ACs outrank story ACs and design prose. The guard covers both tables. This is a superset, not a contradiction, so no source edit is required.
- **Guard scope: migrations directory versus the whole tree.** Research-store section 2.5 scans `.sql` under `src/factorflow/db/migrations/`; DAC-E1-S1-4 and DAC-E1-10 say every `.sql` file under the tree. The story AC governs: the guard scans `.sql` with `rglob` under `src/factorflow/`, which includes the migrations and the future `universes/sql/`.
- **"Importing its helper with this capability's table list" (section 2.5).** The delivered `prohibited_observation_mutations` takes only text; its table list is a module constant. The design's other constraint, that the delivered test file is not edited (DEC-0064), governs, and the design's stated purpose is to "reuse the matching logic". The new module reproduces the three patterns over its own table tuple. The design phrase is the less precise statement; flag it for the next revision of `component-design-research-store.md` section 2.5.
- **Stale labels.** Both E1 component designs say `**Status:** draft` in the body while front matter is `approved`; front matter governs. `universe-service` section 12 cites research-store v1, the approved version is v2. No behavioural effect.

### Open Gaps

- **Delivered migration-inventory tests (PROVISIONAL — awaiting owner confirmation (2026-10-17)).** Adding `0005` fails `tests/unit/test_migration_filenames.py::test_e5_real_migration_inventory_is_contiguous_through_four` and `tests/unit/test_distribution_contents.py::test_installed_layout_resolves_its_migrations`, both under `uv run pytest -m 'not postgres'`, the story's Validation. The approved story, DEC-0084/0088 and system design section 8 question 4 ("no other delivered test is touched") list neither; backlog review v5 FINDING-19 raised it and the story was approved with the finding open (READY-WITH-WARNINGS, no waiver). Derivation: the story's Validation and DAC-E1-S1-1 (story ACs) outrank design prose; a new test module cannot fix an exact-equality assertion; FINDING-19 itself prescribes "each test gains `0005` and nothing else". Plan adopts T006 and T007. Recorded as DEC-0092 (`Decision-Id: DEC-0092` belongs on the commit). Follow-up: owner confirms FINDING-19, widens the delivered-file list in system design section 8 question 4 (also FINDING-13's `pyproject.toml` row) and adds the two tests and a DAC to this story at its next revision. This is a genuine gap (no artifact settles it), not a precedence conflict.
- **Universe name maximum length** is undecided (system design section 8 question 2, research-store and universe-service section 14 question 1). The plan adds no length `CHECK` (AGT-EVIDENCE-002: it would be an invented bound) and T001 asserts none exists. A length bound would arrive as a later additive migration. Owner's decision; nothing here depends on it.
- **No read-latency target** for the 3000-row classified list (system design section 8 question 8): none asserted; not a story concern.

### Other Notes

- The register `logs/runs/run-20261017T210926Z/resolution-register-CAP-002-E1.md` was checked against the artifacts: it was right for this story, with two additions it did not carry: FINDING-19 above, and the fact that the register's open point on the migrations README has no checker (T010).
- `0005` references `instrument (instrument_id)` from migration `0001`; `gen_random_uuid()` is built in on PostgreSQL 16 (the testcontainers image is `postgres:16`), so no extension is needed.
- The migrator's `discover` rejects any file containing `BEGIN` or `COMMIT` case-insensitively; the section 2.3 block contains neither (checked at planning), so a verbatim copy is safe.
- `COMMENT ON COLUMN` text includes JSON braces; the migrator executes the file without bound parameters, so no `%` escaping applies. Do not introduce a `%` into the file.
- The delivered `src/factorflow/db/migrations/README.md` file table stays unedited by this story (T010).
- Retention (research-store question 3) is not a story concern.
