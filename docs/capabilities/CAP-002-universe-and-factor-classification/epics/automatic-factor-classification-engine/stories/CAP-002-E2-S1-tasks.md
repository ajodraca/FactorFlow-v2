---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S1-tasks
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
  timestamp: 2026-10-17T22:30:00Z
  source_artifacts:
    - id: CAP-002-E2-S1
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S1 — Migration 0006: Classification Set, Peer Set, Input and Classification Tables

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-tasks`
**Date**: 2026-10-17

## Summary

Delivers the forward-only migration `src/factorflow/db/migrations/0006_classifications.sql`, which creates `classification_set`, `classification_set_factor`, `factor_input` and `factor_classification` with the constraints and indexes that `component-design-research-store.md` section 2.4 pins verbatim, so a set can never be half-visible and history cannot be rewritten. It also extends the shared guard and apply tests that CAP-002-E1-S1 creates, adds the `classification/sql/*.sql` package-data glob to `pyproject.toml` with a packaging test (DEC-0088), and brings four delivered tests that pin the migration inventory to `0001` through `0004` up to date, because `0005` and `0006` cannot land without it. The SQL is copied from the design, not re-derived; the work is the tests that prove each constraint refuses what it should.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-10 | Classify after succeeded or partial runs; one set per run; SQL ships in the release image | T005, T012, T017, T018 |
| AC-19 | Earlier-period data changes no recorded classification; nothing appears known before it was produced | T002, T003, T004, T009, T015, T016, T017, T018 |
| AC-20 | No half-finished set shown as current; failure records its reason (build side) | T006, T007, T008, T011, T012, T013, T014, T017 |
| DAC-E2-4 | `classification_set.run_id` unique | T005, T012 |
| DAC-E2-10 | Set completes in the same transaction as its last row, or fails with a reason; no partial set observable | T006, T007, T012, T014 |
| DAC-E2-S1-1 | `0006` applies over `0001`-`0005`; version 6 recorded; no row changes | T002, T004, T012, T016 |
| DAC-E2-S1-2 | Duplicate `run_id` refused | T005, T012 |
| DAC-E2-S1-3 | One `building` set; `complete`/`failed` beside it allowed | T006, T012 |
| DAC-E2-S1-4 | Terminal-shape CHECKs on a set | T007, T012 |
| DAC-E2-S1-5 | Classification shape CHECK and percentile range | T008, T012 |
| DAC-E2-S1-6 | `factor_input` name-matches-factor and present-is-dated | T009, T012 |
| DAC-E2-S1-7 | `pg_dump` restore returns the current set and membership unchanged | T003, T012 |
| DAC-E2-S1-8 | `classification/sql/` covered by a package-data glob | T010, T015 |

## Phase 1: Setup

**Purpose**: Confirm the hard prerequisite exists before any test presumes it.

- [ ] T001 Confirm CAP-002-E1-S1 has landed on the working branch: `src/factorflow/db/migrations/0005_universes.sql`, `tests/unit/test_research_sql_is_append_only.py`, `tests/integration/test_research_migrations_apply.py`, `tests/unit/test_package_data_ships_sql.py` and `tests/integration/test_research_constraints.py` must exist (the last is created by the first of E1-S1/E1-S2 to need it; if it does not exist when this story is coded, create it with the module docstring and fixtures the tasks below need). If `0005_universes.sql` or the other three shared files are absent, STOP and report that the hard dependency CAP-002-E1-S1 is not implemented; `0006` cannot be numbered without gaps (`migrations/README.md`, DEC-0087). Read the existing `tests/conftest.py` fixtures and `src/factorflow/db/migrations/0004_runs.sql` (the `acquisition_run` constraints decide which rows are legal to insert as run parents).

**Checkpoint**: The shared files this story extends exist and were read.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the expected behaviour from the acceptance criteria and mapped test cases.

Every constraint assertion uses `pytest.raises(psycopg.errors.<Class>)` and checks `exc.value.diag.constraint_name` (or the unique-index name) against the exact name in research-store section 2.4, then `rollback()`, following `tests/integration/test_run_constraints.py`. Each test creates its own parents: an `instrument` row, and one terminal `acquisition_run` per classification set (a set needs a distinct `run_id`; `idx_acquisition_run_single_active` forbids more than one active run). Mark database tests `@pytest.mark.postgres` and put `# Implements TC-COMP-nnn` above each.

### Mandatory Component Tests
- [ ] T002 Implement TC-COMP-156 (Migration 0006 applies over 0001-0005 and data unchanged) in `tests/integration/test_research_migrations_apply.py`: on a fresh database apply `discover(MIGRATIONS_DIR)[:5]` through `apply_pending`, insert an instrument, a daily bar, a run and a `universe` with its `created` and `member_added` events, snapshot those rows, then assert `apply_pending(conn, files)` returns `[6]`, `applied_migrations` holds version 6 with the checksum of `0006_classifications.sql`, and every snapshotted CAP-001 and `0005` row reads back identical. Reuse the sentinel-snapshot style of `tests/integration/test_migrations_apply.py`. Also assert the four new tables exist and are empty (depends on T001)
- [ ] T003 Implement TC-COMP-158 (pg_dump restore returns current set and membership unchanged) in `tests/integration/test_research_migrations_apply.py`: migrate a database through `0006`, insert one universe with a `created` and a `member_added` event and one `complete` set (with its `ended_at`, `latest_trading_day`, `active_instruments`, one `classification_set_factor` and one `classified` `factor_classification` row); run `pg_dump -Fc` inside the session `postgres_container` (`container.exec_run`, output to a file in the container), create a second empty database, `pg_restore` into it, and assert the set row, the factor row, the classification row and the universe membership events read back equal to the pre-dump rows. Drop the second database in `finally`. Same file as T002, so not parallel (depends on T002)
- [ ] T004 Add the idempotence test to `tests/integration/test_research_migrations_apply.py`: after `0006` is applied, a second `apply_pending(conn, files)` returns `[]`, `applied_migrations` still holds exactly six rows, and the four classification tables are unchanged (same file as T002, so not parallel; traces to DAC-E2-S1-1; implements no separate TC) (depends on T002)
- [ ] T005 [P] Implement TC-COMP-075 (Duplicate run_id for a classification set is refused) in `tests/integration/test_research_constraints.py`: insert one set for a run, then a second set (state `failed`, with `ended_at` and `failure_reason` so only uniqueness can refuse it) for the same `run_id`; assert `psycopg.errors.UniqueViolation` naming the `run_id` unique constraint (`classification_set_run_id_key`, PostgreSQL's default name for the inline `UNIQUE`). Also assert a `run_id` that names no `acquisition_run` is refused with `ForeignKeyViolation`
- [ ] T006 Implement TC-COMP-163 (Only one building set allowed at a time) in `tests/integration/test_research_constraints.py`: with one `building` set present, a second `building` row for another run raises `UniqueViolation` on `idx_classification_set_single_building`; a `complete` row (all required columns) and a `failed` row (with reason) for two further runs insert without error beside it (depends on T005's helpers)
- [ ] T007 Implement TC-COMP-164 (Complete and failed set required columns enforced) in `tests/integration/test_research_constraints.py`, one assertion per condition with the constraint name: `complete` without `ended_at` -> `classification_set_terminal_has_end`; `complete` with `ended_at` but without `latest_trading_day` -> `classification_set_complete_is_sized`; `complete` without `active_instruments` -> `classification_set_complete_is_sized`; `failed` without `failure_reason` -> `classification_set_failed_has_reason`. Parametrize over these four rows (depends on T005)
- [ ] T008 Implement TC-COMP-165 (Classification row shape CHECK refuses malformed rows) in `tests/integration/test_research_constraints.py`, inserting into `factor_classification` under a `building` set and an existing instrument, with the constraint named per row: `classified` row carrying `reason_code` -> `factor_classification_shape`; `not_classified` row carrying `score` -> `factor_classification_shape`; `not_classified` with `reason_code='input_missing'` and no `reason_input` -> `factor_classification_reason_input_agrees`; `not_classified` with `reason_code='retired'` and a `reason_input` -> `factor_classification_reason_input_agrees`; `classified` with `percentile` 100.5 and with -1 (score present) -> `factor_classification_percentile_range`. Add the accepting controls so the refusals are not vacuous: a valid `classified` row at percentile 0 and at 100, a valid `input_missing` row naming an input, a valid `not_enough_stocks` and a valid `retired` row without one (depends on T005)
- [ ] T009 Implement TC-COMP-157 (factor_input rejects wrong factor name and incomplete present rows) in `tests/integration/test_research_constraints.py`: `factor='value'` with `input_name='return_3m'` -> `factor_input_name_matches_factor`; `status='present'` missing each of `value`, `as_of`, `known_on` in turn -> `factor_input_present_is_dated`; controls: a `present` row with all three, and a `missing` row with none, are accepted; `detail` is `'{}'::jsonb` in every row (depends on T005)
- [ ] T010 [P] Implement TC-COMP-076 (classification/sql is shipped as package data) in `tests/unit/test_package_data_ships_sql.py` (file created by E1-S1): read `pyproject.toml` with `tomllib`, take `[tool.setuptools.package-data].factorflow`, and assert some glob matches `classification/sql/anything.sql` (use `fnmatch`/`PurePath.match` on a synthetic path, because `src/factorflow/classification/sql/` does not exist until CAP-002-E2-S2 and E1-S1's directory-enumerating check cannot see it). Keep E1-S1's existing assertion untouched; add this as a separate test function. Use the existing helper for matching globs if E1-S1 defines one

### Additional Unit Tests
- [ ] T011 [P] Create `tests/unit/test_migration_0006_matches_design.py` (follow `tests/unit/test_migration_0001_matches_design.py`): `tests.unit.design_sql.sql_block_under_heading("### 2.4", path)` with `path` the research-store design file passed explicitly (the helper's default path is the CAP-001 design; do not edit `design_sql.py`); assert `0006_classifications.sql` text equals that block verbatim, that the block was really found (contains `CREATE TABLE classification_set` and `CREATE TABLE factor_classification`), and that the committed text names every constraint and index in section 2.4 (four tables, seven indexes, sixteen constraints) by parsing `CONSTRAINT <name>` and `CREATE [UNIQUE] INDEX <name>` out of the design block rather than from a pasted list (traces to AC-20, AC-19)
- [ ] T012 Extend `tests/unit/test_research_sql_is_append_only.py` (file from E1-S1) so its table list covers `classification_set_factor`, `factor_input` and `factor_classification` beside `universe_event`, reusing `prohibited_observation_mutations` with the larger table list as that file already does; add the rule that every `UPDATE classification_set` found in a migration or Python source under `src/factorflow/` contains the `state = 'building'` guard (and `WHERE set_id`), with positive and negative parametrized strings proving the guard detects an unguarded `UPDATE classification_set SET state = 'complete'` and a guarded one is allowed, and that `DELETE FROM classification_set` is rejected (system design C5, research-store 2.5; traces to AC-19, AC-20)
- [ ] T013 Add table-level edge tests to `tests/integration/test_research_constraints.py` for constraints no mapped TC names, each asserting the constraint name: `classification_set.state` outside the set -> `classification_set_state_known`; a `building` row with `ended_at` -> `classification_set_terminal_has_end`; a non-`failed` row with `failure_reason` -> `classification_set_failed_has_reason`; `classification_set_factor` with factor `quality` -> `classification_set_factor_known` and `qualified_count = -1` -> `classification_set_factor_count_nonnegative`; a second `(set_id, factor)` row -> `UniqueViolation` on its primary key; `factor_input` with status `stale` -> `factor_input_status_known`; `factor_classification` with `reason_code='unknown'` -> `factor_classification_reason_known` and status `maybe` -> `factor_classification_status_known`; all four tables refuse a `set_id` naming no set (`ForeignKeyViolation`) (traces to AC-20)
- [ ] T014 Add an index-and-type test to `tests/integration/test_research_constraints.py`: `pg_indexes` contains the seven named indexes; `idx_classification_set_single_building` is unique and partial; and `information_schema.columns` reports `numeric(30,10)` for `factor_input.value`, `numeric(18,6)` for `factor_classification.score` and `numeric(9,6)` for `factor_classification.percentile`, and `jsonb` NOT NULL for `factor_input.detail` (traces to AC-20)

**Checkpoint**: All tests are written and fail (no `0006` file, no package-data glob yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with the migration, the packaging glob and the inventory updates.

- [ ] T015 Create `src/factorflow/db/migrations/0006_classifications.sql` containing exactly the SQL fenced block under research-store section 2.4 (copy the block byte for byte, ending in a single newline; add nothing and no `BEGIN` or `COMMIT`; the block contains none, and no `VACUUM`/`CONCURRENTLY`). Never edit the design to fit the file (depends on T001)
- [ ] T016 [P] Add `"classification/sql/*.sql"` to the `factorflow` list in `[tool.setuptools.package-data]` in `pyproject.toml`, appended after the globs already there (`coverage/sql/*.sql`, `db/migrations/*.sql`, `api/static/**/*`, plus `universes/sql/*.sql` from E1-S1); change nothing else in the file (DEC-0088)
- [ ] T017 Bring the four delivered tests that pin the migration inventory to `0001`-`0004` up to date, minimal edits only, skipping any already done by E1-S1 for `0005`: (a) `tests/unit/test_migration_filenames.py::test_e5_real_migration_inventory_is_contiguous_through_four` expects the six filenames through `0006_classifications.sql` (rename to `..._through_six`); (b) `tests/unit/test_distribution_contents.py` adds `0005_universes.sql` and `0006_classifications.sql` to `_MIGRATIONS` and expects `"[1, 2, 3, 4, 5, 6]"` with the docstring "versions 1 to 6"; (c) `tests/integration/test_migrations_apply.py::test_new_migrations_apply_after_0002_without_rewriting_rows` keeps its intent by applying `files[:4]` where it applies `files` (expected `[3, 4]` and the later `[]` re-run); (d) `tests/unit/test_migrator_discover.py` compares checksums only for versions present in `_CHECKSUMS_BEFORE_MOVE` (`{f.version: f.checksum for f in files if f.version in _CHECKSUMS_BEFORE_MOVE}`), since the dictionary documents the pre-move checksums of the CAP-001 files and must not grow. Change no other line of these files (PROVISIONAL, see Open Gaps; depends on T015)

**Checkpoint**: `uv run pytest -m postgres` and `-m 'not postgres'` pass for the new and updated tests.

---

## Phase 4: Integration

**Purpose**: Make the migration inventory documentation and the full suite agree.

- [ ] T018 Append the row `| \`0006_classifications.sql\` | CAP-002-E2-S1 | \`classification_set\`, \`classification_set_factor\`, \`factor_input\`, \`factor_classification\` |` to the Files table in `src/factorflow/db/migrations/README.md` (E1-S1 owns the `0005` row; add it in the same style only if it is missing, since the table must read without gaps)
- [ ] T019 Run every command in the Validation Plan from the repository root and fix failures in files this plan names; a failure in any other file is reported, not patched (depends on T015-T018)

**Checkpoint**: The whole suite is green with `0006` applied by the migrator.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T020 Re-read the traceability comments: every test from T002-T010 carries `# Implements TC-COMP-nnn`, and T011-T014 cite the AC they trace to in their docstring; confirm `git diff --stat` touches only the files named in this plan
- [ ] T021 After each TDD cycle in T002-T019 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E1-S1 | hard | Existing graph edge. Creates `0005_universes.sql` (`0006` is numbered after it, no gaps) and the shared files T002, T003, T010 and T012 extend |
| CAP-002-E2-S2 | reverse | Creates `src/factorflow/classification/sql/` and the factor-engine statements that write the tables this story creates; the package-data glob here (T016) is what ships them |
| CAP-002-E3-S1 | context | The reader that sorts on `idx_factor_classification_set_factor_score` and `_percentile`; this story only creates the indexes and imports nothing from it |

### Task Dependencies
- T001: No dependencies
- T002: Depends on T001
- T003, T004: Depend on T002 (same file)
- T005: Depends on T001, can run in parallel with T002 and T010
- T006, T007, T008, T009: Depend on T005 (same file, shared helpers)
- T010: Depends on T001, can run in parallel with T002 and T005
- T011: Depends on T001, can run in parallel with every other test task
- T012: Depends on T001, can run in parallel with every other test task
- T013, T014: Depend on T009 (same file)
- T015: Depends on all of T002-T014 being written (tests first)
- T016: No code dependency; run after the tests, can run in parallel with T015
- T017: Depends on T015
- T018: Depends on T015
- T019: Depends on T015, T016, T017, T018
- T020: Depends on T019
- T021: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: T002 / T005 / T010 / T011 / T012 touch different files and can run in parallel; tasks inside `test_research_constraints.py` and `test_research_migrations_apply.py` are sequential
- Phase 3: T015 and T016 can run in parallel

---

## Validation Plan

### Constitution-Defined Commands
- Build: `uv build`
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (also `uv run pytest` for the full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- AC-19 / DAC-E2-S1-1: the migrator on a store holding `0001`-`0005` and data applies exactly `[6]`; no pre-existing row changes (T002)
- DAC-E2-S1-2 / DAC-E2-4: a duplicate `run_id` is refused (T005)
- DAC-E2-S1-3: a second `building` set is refused, a `complete` and a `failed` one beside it are accepted (T006)
- DAC-E2-S1-4 / DAC-E2-10: each terminal-shape violation is refused by the named constraint (T007)
- DAC-E2-S1-5 / AC-20: each malformed classification row is refused by the named constraint, controls accepted (T008)
- DAC-E2-S1-6: wrong factor name and incomplete `present` rows are refused (T009)
- DAC-E2-S1-7: dump and restore returns the set and membership unchanged (T003)
- DAC-E2-S1-8 / AC-10: `classification/sql/` is covered by a package-data glob (T010); optionally confirm `uv build --wheel` still succeeds, which `tests/unit/test_distribution_contents.py` already does
- Append-only: no `UPDATE`, `DELETE FROM` or upsert names the three append-only classification tables anywhere under `src/factorflow/`, and every `UPDATE classification_set` is guarded by `state = 'building'` (T012)

---

## Notes

### Resolved Conflicts

- **Four delivered tests pin the migration inventory to `0001`-`0004`.** `tests/unit/test_migration_filenames.py`, `tests/unit/test_distribution_contents.py`, `tests/unit/test_migrator_discover.py` and `tests/integration/test_migrations_apply.py` assert the exact set of migration files or versions, so they fail as soon as `0005` or `0006` exists. System design section 8 question 4 (DEC-0084, extending DEC-0064) says the nine listed delivered files are the only ones CAP-002 touches and "no other delivered test is touched"; the story requires `0006` to exist (DAC-E2-S1-1) and lists a green suite as its validation. Governing rule: story and epic acceptance criteria outrank design normative prose, so the four tests are updated minimally (T017). Established by: CAP-002-E2-S1 DAC-E2-S1-1 and Validation versus system-design section 8 question 4. No change to the approved designs is needed for the plan to proceed; the list should be extended at the next revision (see Open Gaps).
- **`design_sql.py` defaults to the CAP-001 design.** `sql_block_under_heading` takes a `path` argument, so T011 passes the research-store design explicitly instead of editing `tests/unit/design_sql.py` (DEC-0064, delivered files untouched).
- **Story status not changed.** The skill asks for the story's `status` to move from `todo` to `planning`; the story is approved and any edit invalidates the approval, so the frontmatter is left as it is (constraint 7).

### Open Gaps

- **Ownership and shape of the four inventory-test edits (T017). PROVISIONAL — awaiting owner confirmation (2026-10-17).** No artifact says which story edits the inventory-pinning tests when `0005` and `0006` land, and DEC-0084's list of nine delivered files omits them. Derivation: CAP-001 pinned the inventory with the tests it shipped, and CAP-002 is the first to add migrations, so the edit is unavoidable; the minimal change (extend the filename list and version string; restrict the equality checks to the CAP-001 versions) keeps each test's intent. If E1-S1 already made the `0005` edits, T017 only extends them. Owning design to absorb it at its next revision: system design section 8 question 4, list of delivered files (nine becomes thirteen).
- **`factorflow/classification/sql/` does not exist yet.** DAC-E2-S1-8 requires the glob and its test now; the directory arrives with CAP-002-E2-S2. T010 therefore asserts the glob against a synthetic path rather than enumerating directories (a directory-enumerating check cannot fail for a directory that is absent). This is a gap in the story's phrasing, not a defect, and needs no design revision.

### Other Notes

- The two score and percentile indexes (T014) exist for the reader built in CAP-002-E3-S1; this story asserts they exist and nothing about their use.
- No behavioural bound is invented: every size, name and constraint comes from research-store section 2.4. `MIN_PEER_SET_SIZE = 30` is a factor-engine constant and must not appear in the migration.
- The graph in `dependencies.yaml` already lists `CAP-002-E2-S1: [CAP-002-E1-S1]`; planning found no new hard edge and made no change to it.
- `tests/integration/test_research_constraints.py` is named in the story as "classification cases appended". If E1-S1 has not created it, T001 creates it; whichever story codes first owns the module docstring and shared helpers (instrument and terminal-run insert helpers), and the other appends.
- Dump and restore (T003) needs `pg_dump` and `pg_restore` binaries, which the `postgres:16` container already carries; executing them via `container.exec_run` avoids requiring client tools on the host.
- Under a driver that commits once per stage, the TDD-evidence file records `commit_hash: stage` (T021).
