---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-24
updated: 2026-10-24
story_id: "CAP-002-E2-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-25T00:03:35Z"
reviewed_head: "1e5a1c8104cb1d446b593b74ab1975ac64204f14"
review_base: "f7af5c746b6d73b25f7209fbbf48210111177d23"
reviewed_state_revision: "sha256:e8b8d3717e08954ff49ed5cb9b17abbcd78656bbf91a190cf3b8c3dacbe903b1"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E2-S1
    artifact_version: 2
    content_revision: sha256:4d0f7775bf4e0001446b6d916faf807d96ec2e2c4dfdbb4fb3a64621b5a76229
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-25T00:14:53Z
  source_artifacts:
    - id: CAP-002-E2-S1
      version: "2 (sha256:4d0f7775bf4e0001446b6d916faf807d96ec2e2c4dfdbb4fb3a64621b5a76229)"
    - id: CAP-002-E2-S1-tasks
      version: "1"
    - id: CAP-002-E2-S1-tdd-evidence
      version: "cycles 1 to 4"
    - id: CAP-002-E2-S1-implementation-review
      version: "1"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-research-store-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "5"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 21/21 verified |
| Required validation | 10/10 passed |

The rework resolves v1/IR-001.
- TC-COMP-076 (`test_classification_sql_is_covered_by_a_package_data_glob`) now builds a synthetic `classification/sql/anything.sql`. It asks the module's `uncovered_sql_files` whether the committed globs ship it.
- `uncovered_sql_files` expands each pattern with `glob(<root>/<pattern>, recursive=True)`. That is exactly what setuptools 84.2.x `build_py.find_data_files` does.
- In the reviewer's gate mutation run, the three globs that survived v1 (`*.sql`, `sql/*.sql`, `*/*.sql`) are now killed by TC-COMP-076 itself. So are seven further mis-anchored or misspelt variants.
- The only two survivors, `classification/**/*.sql` and `*/sql/*.sql`, are equivalent: setuptools ships `classification/sql/*.sql` under both.

The rest of the change set is unchanged since v1, and was re-verified against HEAD:
- The four cycle patches, applied in order to the base, reproduce all ten code files at HEAD byte for byte.
- `0006_classifications.sql` equals the research-store section 2.4 block verbatim.
- All 46 non-equivalent mutants are killed.
- The full suite passes (1358), and so do ruff, ruff format, `mypy src` and `uv sync --all-extras --locked`.
- `uv build` passes. v1 could not run it, so the sdist half is now verified.

One LOW finding remains, carried from v1/IR-002 and still optional. Five classification guard tests carry the universe-only `TC-COMP-047` tag, and the unplanned `restated_possible` test is tagged AC-19 although the design maps it to AC-23. No gate is affected, so the verdict is `PASS-WITH-WARNINGS`.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1.md` (v2, approved, `status: in-review`). Its revision `sha256:4d0f7775bf4e0001446b6d916faf807d96ec2e2c4dfdbb4fb3a64621b5a76229` equals the approval's `reviewed_revision` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1-tasks.md` (v1). The rework changed only `updated` and added `last_reworked_review: CAP-002-E2-S1-implementation-review-v1.md` |
| Component | `FactorFlow-v2` (module `research-store`, migration `0006`; packaging) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S1-run-20261024T231312Z` |
| HEAD | `1e5a1c8104cb1d446b593b74ab1975ac64204f14` (`story-coding(CAP-002-E2-S1): rework IR-001, TC-COMP-076 decides coverage the way setuptools does`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E2-integration` = `f7af5c746b6d73b25f7209fbbf48210111177d23`, resolved with `pipeline-state.py review-base --base-ref usr/alvaro-de-jodra/CAP-002-E2-integration`. `git merge-base --is-ancestor` exits 0. The range holds three commits, all for CAP-002-E2-S1: `5be5069` (coding), `c23ca1a` (review v1) and `1e5a1c8` (rework) |
| Working tree | Clean: no staged, unstaged or untracked non-ignored files, before or after validation |
| Changed files reviewed | 46 (10 code, config and test files; the story; the task plan; the TDD-evidence file; the v1 review report; 32 evidence files) |

Supervised run `run-20261024T231312Z`, unit `u004`, unattended. The rework delta since v1 (`c23ca1a..1e5a1c8`) is five files:
- `tests/unit/test_package_data_ships_sql.py` (+10/−5);
- the task plan front matter;
- the TDD-evidence cycle-4 entry;
- `cycle-4.patch`;
- `red-cycle-4-package-data-anchoring.log`.

### Changed Files

`.../stories/` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/db/migrations/0006_classifications.sql` | added (112 lines) | AC-10, AC-19, AC-20, DAC-E2-4, DAC-E2-10, DAC-E2-S1-1 to -6; T015 |
| `pyproject.toml` | modified (line 33: `"classification/sql/*.sql"` appended; nothing else) | DAC-E2-S1-8; T016 (DEC-0088) |
| `src/factorflow/db/migrations/README.md` | modified (+1 Files-table row) | T018 |
| `tests/unit/test_migration_0006_matches_design.py` | added | AC-19, AC-20; T011 |
| `tests/integration/test_research_constraints.py` | modified (+587/−2) | DAC-E2-S1-2 to -6; T005 to T009, T013, T014 |
| `tests/integration/test_research_migrations_apply.py` | modified (+175/−1) | DAC-E2-S1-1, -7; T002 to T004 |
| `tests/unit/test_research_sql_is_append_only.py` | modified (+98/−2) | AC-19, AC-20, DAC-E2-10; T012 |
| `tests/unit/test_package_data_ships_sql.py` | modified (+15 net; reworked in cycle 4) | DAC-E2-S1-8; T010 (v1/IR-001) |
| `tests/unit/test_migration_filenames.py` | modified (rename and +1 list entry) | DAC-E2-S1-1; T017(a) (DEC-0110, DEC-0092) |
| `tests/unit/test_distribution_contents.py` | modified (tuple entry, docstring, versions literal) | DAC-E2-S1-1; T017(b) (DEC-0110, DEC-0092) |
| `.../stories/CAP-002-E2-S1.md` | modified (`status: planning` → `in-review`) | story-coding lifecycle |
| `.../stories/CAP-002-E2-S1-tasks.md` | modified (21 checkboxes; `updated`; `last_reworked_review`) | T001 to T021 bookkeeping; rework bookkeeping |
| `.../stories/CAP-002-E2-S1-tdd-evidence.yaml` | added (cycles 1 to 4) | T021 |
| `.../stories/CAP-002-E2-S1-implementation-review-v1.md` | added | Review v1 (gate artifact; not coder work) |
| `.../stories/CAP-002-E2-S1-evidence/`: `cycle-{1,2,3,4}.patch`, `red-cycle-{1,2,3,4}-*.log`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`, `mutation-cycle-1-results-logs/*` (22 logs) | added (32 files) | T021 (RED and mutation evidence) |

No changed file lacks a justification.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `0006_classifications.sql:3` (`run_id ... NOT NULL UNIQUE REFERENCES acquisition_run`); `pyproject.toml:33` glob | `test_research_constraints.py::test_a_second_set_for_the_same_run_is_refused`, `::test_a_set_naming_no_run_is_refused`; `test_package_data_ships_sql.py::test_classification_sql_is_covered_by_a_package_data_glob` | This story owns the store and packaging share. Recomputing after a qualifying run belongs to `classification-scheduler` (CAP-002-E2-S8). `uv build` shows the wheel and sdist build with the new glob |
| AC-19 | SATISFIED | `0006` is additive: `CREATE TABLE`, `CREATE INDEX` and `COMMENT ON` only. `classification_date date NOT NULL` (`:5`); `factor_input_present_is_dated` (`:61-63`) | `test_research_migrations_apply.py::test_migration_0006_applies_without_touching_earlier_rows`, `::test_pg_dump_restore_returns_the_current_set_and_membership_unchanged`; `test_research_sql_is_append_only.py::test_research_sql_is_append_only` (five-table tuple) | No CAP-001 or `0005` row changes. The static guard refuses `UPDATE`, `DELETE` or an upsert against the three append-only classification tables |
| AC-20 | SATISFIED | `idx_classification_set_single_building` (`:22-23`); `classification_set_terminal_has_end`, `_failed_has_reason`, `_complete_is_sized` (`:13-19`) | TC-COMP-163, TC-COMP-164 and TC-COMP-165 tests; `test_every_classification_set_update_is_guarded_by_building_state` | Build side, as the story scopes it. The one-transaction write belongs to `factor-engine` (TC-COMP-166, TC-COMP-167) |
| DAC-E2-4 | SATISFIED | `:3`: unique `run_id` with an FK to `acquisition_run` | `test_a_second_set_for_the_same_run_is_refused` (`UniqueViolation`, `classification_set_run_id_key`; the second row is a fully formed `failed` set, so only uniqueness can refuse it); `test_a_set_naming_no_run_is_refused` (`classification_set_run_id_fkey`) | The rule that a failed, cancelled or abandoned run never acquires a set is not a DDL property. The coverage matrix assigns it to `classification-scheduler` (TC-COMP-078, TC-COMP-081) |
| DAC-E2-10 | SATISFIED | Terminal-shape CHECKs (`:13-19`); single-building index | `test_a_terminal_set_missing_a_required_column_is_refused` (4 cases); `test_set_level_edge_constraints_are_named`; the `UPDATE classification_set` guard tests | Store share only. Same-transaction completion and rollback belong to `factor-engine` |
| DAC-E2-S1-1 | SATISFIED | `0006` is additive only | `test_migration_0006_applies_without_touching_earlier_rows` (`:153`): `apply_pending` returns `[6]`; the version 6 checksum equals the file's; all 13 pre-existing tables are unchanged as full-row text, apart from the new `applied_migrations` row; the four new tables are empty. `test_a_second_apply_after_0006_changes_nothing` (`:187`): `[]`, 6 rows, tables unchanged | none |
| DAC-E2-S1-2 | SATISFIED | `:3` | `test_a_second_set_for_the_same_run_is_refused` (count stays 1) | Kills `manual:run-id-not-unique` behaviourally |
| DAC-E2-S1-3 | SATISFIED | `:22-23` | `test_only_one_building_set_is_allowed_but_terminal_sets_may_sit_beside_it` (`:396`): `UniqueViolation` on `idx_classification_set_single_building`, then a `complete` and a `failed` row are accepted beside it (count 3) | Kills `single-building-not-unique` and `single-building-wrong-state` behaviourally |
| DAC-E2-S1-4 | SATISFIED | `:13-19` | `test_a_terminal_set_missing_a_required_column_is_refused` (`:427`): four parametrised rows, each asserting `CheckViolation` and `diag.constraint_name` | Kills `terminal-end-only-complete`, `failed-reason-one-way` and `complete-sized-drops-active` behaviourally |
| DAC-E2-S1-5 | SATISFIED | `:88-97` | `test_a_malformed_classification_row_is_refused_by_its_named_constraint` (`:494`, 6 rows) plus `test_a_well_formed_classification_row_is_accepted` (`:535`, 5 accepting controls) | Every row the DAC names is refused by the named constraint. The controls (percentile 0 and 100, `input_missing` naming an input, `not_enough_stocks`, `retired`) show no refusal is vacuous |
| DAC-E2-S1-6 | SATISFIED | `:55-63` | `test_a_malformed_factor_input_is_refused_by_its_named_constraint` (`:573`, 4 rows); `test_a_present_dated_input_and_a_bare_missing_input_are_accepted` (`:592`) | `detail` is `'{}'::jsonb` in every row. Kills `name-matches-value-admits-return`, `present-dated-drops-known-on` and `present-dated-drops-value` behaviourally |
| DAC-E2-S1-7 | SATISFIED | n/a (an operational property of the schema) | `test_pg_dump_restore_returns_the_current_set_and_membership_unchanged` (`:208`): `pg_dump -Fc` and `pg_restore` run inside the session container with exit codes asserted. Five non-empty tables are compared as full-row text. The restored database is dropped in `finally` | none |
| DAC-E2-S1-8 | SATISFIED | `pyproject.toml:33` lists `"classification/sql/*.sql"` | `test_package_data_ships_sql.py:55-67` (TC-COMP-076): `uncovered_sql_files(tmp_path, package_data_globs()) == []` over a synthetic `classification/sql/anything.sql` | The check is setuptools-faithful (probe and gate mutation run under Test Quality). It does not depend on `src/factorflow/classification/sql/`, which does not exist until CAP-002-E2-S2. v1/IR-001 is resolved |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `0005_universes.sql` and the four shared test files exist at `f7af5c7`; the diff modifies them rather than creating them | The hard dependency CAP-002-E1-S1 has landed |
| T002 | complete | VERIFIED | `test_research_migrations_apply.py:152-184` | Seeds an instrument, a bar, a statement, a run, and a universe with `created` and `member_added` events. Snapshots all 13 tables, then checks `[6]`, the checksum and that the new tables are empty. `version <= 5` is equivalent to the plan's `discover(...)[:5]` |
| T003 | complete | VERIFIED | `test_research_migrations_apply.py:207-289` | `container.exec_run` for `pg_dump -Fc` and `pg_restore`; the second database is dropped in `finally` |
| T004 | complete | VERIFIED | `test_research_migrations_apply.py:186-204` | `[]`, six rows, four tables unchanged. Tagged `# Implements DAC-E2-S1-1`, as the plan says |
| T005 | complete | VERIFIED | `test_research_constraints.py:363-393` | Unique-key and FK names asserted |
| T006 | complete | VERIFIED | `test_research_constraints.py:395-414` | none |
| T007 | complete | VERIFIED | `test_research_constraints.py:417-442` | Parametrised over the four rows |
| T008 | complete | VERIFIED | `test_research_constraints.py:454-546` | Every refusal and accepting control in the plan is present |
| T009 | complete | VERIFIED | `test_research_constraints.py:549-610` | none |
| T010 | complete | VERIFIED | `test_package_data_ships_sql.py:55-67` | A separate function; E1-S1's TC-COMP-018 tests (`:44-100`) are untouched. It now follows the plan's "Use the existing helper for matching globs if E1-S1 defines one" clause by calling `uncovered_sql_files` (`:23-41`) on a synthetic tree, instead of the plan's `fnmatch`/`PurePath.match` suggestion. That suggestion was the source of v1/IR-001, so the deviation is justified. Removing the now-unused `PurePath` import is the only other change. RED for `*.sql`, `sql/*.sql` and `*/*.sql` was reproduced by the reviewer |
| T011 | complete | VERIFIED | `tests/unit/test_migration_0006_matches_design.py` | Verbatim equality with the design block; a check that the block was found; 4 tables, 7 indexes and 16 constraints parsed from the design block. `design_sql.py` is untouched. The reviewer's own extraction of the section 2.4 block also equals the file |
| T012 | complete | VERIFIED | `test_research_sql_is_append_only.py:18-24, 117-202` | `RESEARCH_TABLES` holds exactly five tables. `prohibited_research_mutations` keeps its name and signature, and the delivered `test_sql_is_append_only.py` is untouched. The guard rule scans the same `rglob` set. All four plan strings are present: unguarded detected, factor-engine shape allowed, reclaim shape allowed, `DELETE` rejected. TC tag: IR-001 |
| T013 | complete | VERIFIED | `test_research_constraints.py:613-761` | Justified deviation, as in v1: `status='maybe'` asserts `factor_classification_shape`. PostgreSQL checks CHECK constraints in name order, and the shape CHECK is false for any status outside the two values, so it is the one reported (comment at `:706-707`). "All four tables refuse a `set_id`" is met for the three tables that carry a `set_id` FK; `classification_set`'s `run_id` FK is pinned under T005 |
| T014 | complete | VERIFIED | `test_research_constraints.py:764-800` | Exact set of seven index names; unique and partial; the four column types and their nullability |
| T015 | complete | VERIFIED | `0006_classifications.sql` | Verbatim with the design, a single trailing newline, and no `BEGIN`, `COMMIT`, `VACUUM` or `CONCURRENTLY` |
| T016 | complete | VERIFIED | `pyproject.toml:33` | Appended last; nothing else in the file changed. `uv sync --all-extras --locked` confirms the lock is unaffected |
| T017 | complete | VERIFIED | `test_migration_filenames.py:42-50`; `test_distribution_contents.py:29, 81, 100` | (a) and (b) as planned. CAP-002-E1-S1 had already made (c) and (d) in equivalent form: `discover(...)[:4]` at `test_migrations_apply.py:17` and `version <= 4` at `test_migrator_discover.py:98`. Both pass with `0006` present. `5be5069` carries both required trailers |
| T018 | complete | VERIFIED | `src/factorflow/db/migrations/README.md:37` | Matches the plan's row text exactly |
| T019 | complete | VERIFIED | Reviewer reran every Validation Plan command, `uv build` included; all pass | 1358 passed, matching the coder's claim |
| T020 | complete | VERIFIED | `# Implements` comments are on every T002 to T010 test. T011 cites AC-20 and AC-19 in its docstring; T013 and T014 carry `# Implements AC-20` | Two tags name the wrong criterion (IR-001). The change set touches only files the plan names, plus the T021 evidence, the story status and the v1 report |
| T021 | complete | VERIFIED | `CAP-002-E2-S1-tdd-evidence.yaml`; `CAP-002-E2-S1-evidence/` | Lint clean with `--require-logs`. Each cited `diff_sha256` and `red_log_sha256` equals its file's SHA-256 (cycle-4 rechecked). The four patches applied in order to `f7af5c7` reproduce all ten code files at HEAD. `commit_hash: stage` is used as the plan allows. The repository cannot show whether each cycle's subagent review ran before the next cycle began; the lint accepts the record and no finding is raised |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_migration_0006_applies_without_touching_earlier_rows` / TC-COMP-156 | ADEQUATE | Exact `[6]`, checksum, full-row snapshot of 13 tables, empty new tables | none |
| `test_a_second_apply_after_0006_changes_nothing` / DAC-E2-S1-1 | ADEQUATE | `[]`, 6 rows, four tables unchanged with one complete set present | none |
| `test_pg_dump_restore_returns_the_current_set_and_membership_unchanged` / TC-COMP-158 | ADEQUATE | Real `pg_dump -Fc` and `pg_restore`; exit codes asserted; five tables compared as full-row text; non-empty precondition asserted | The in-container `/tmp/factorflow.dump` is not removed. The session container is discarded and the suite runs serially, so this is harmless |
| `test_a_second_set_for_the_same_run_is_refused`, `test_a_set_naming_no_run_is_refused` / TC-COMP-075 | ADEQUATE | Exception class plus constraint name; only uniqueness can refuse the second row | none |
| `test_only_one_building_set_is_allowed_but_terminal_sets_may_sit_beside_it` / TC-COMP-163 | ADEQUATE | Refusal by index name; terminal rows accepted beside it | `((true))` → `((false))` survives the behaviour-only run. It is equivalent: any constant gives every `building` row the same key |
| `test_a_terminal_set_missing_a_required_column_is_refused` / TC-COMP-164 | ADEQUATE | Four rows, each needing exactly one constraint to fail | none |
| `test_a_malformed_classification_row_is_refused_by_its_named_constraint`, `test_a_well_formed_classification_row_is_accepted` / TC-COMP-165 | ADEQUATE | Six refusals by name and five accepting controls | Kills `shape-classified-allows-reason`, `shape-unclassified-allows-score`, `reason-input-one-way` and both percentile bounds behaviourally |
| `test_a_malformed_factor_input_is_refused_by_its_named_constraint`, `test_a_present_dated_input_and_a_bare_missing_input_are_accepted` / TC-COMP-157 | ADEQUATE | Name-matches-factor and each missing `present` column, plus controls | none |
| `test_classification_sql_is_covered_by_a_package_data_glob` / TC-COMP-076 | ADEQUATE | Expands the committed globs against a synthetic `classification/sql/anything.sql`, the way setuptools does. The test fails, at its own assertion (`:67`), for every glob that would not ship the file | none. The two surviving mutants, `classification/**/*.sql` and `*/sql/*.sql`, both ship the file (probe below) |
| `test_migration_0006_matches_design_verbatim`, `test_design_block_is_actually_read`, `test_migration_0006_names_every_table_index_and_constraint_in_the_design` / T011 | ADEQUATE | Exact text equality with the design's own block; counts parsed from the design | Under `-x`, the first test to fail for every SQL mutant |
| `test_every_classification_set_update_is_guarded_by_building_state` and its three parametrised companions / T012 | ADEQUATE | Whole-tree scan, plus the positive and negative strings the plan names; `DELETE` is rejected even when it names `building` | The statement pattern stops at the first `;` or `"`. Two `UPDATE classification_set` statements with no separator between them would be judged as one, but that is not valid SQL, so no real code is affected. TC tag: IR-001 |
| `test_guard_covers_the_classification_tables` / T012 | ADEQUATE | `UPDATE` and `DELETE` on the three tables detected | none |
| `test_set_level_edge_constraints_are_named`, `test_set_factor_edge_constraints_are_named`, `test_input_and_classification_edge_constraints_are_named`, `test_every_classification_table_refuses_a_set_that_does_not_exist` / T013 | ADEQUATE | Constraint, primary-key and FK names asserted; every refusal rolled back | Kills `count-allows-negative` behaviourally |
| `test_indexes_and_column_types_match_the_design` / T014 | ADEQUATE | Exact index set; unique and partial; precision, scale and nullability | Kills the catalogue `numeric` off-by-one mutants behaviourally |
| `test_restated_possible_defaults_to_false_on_inputs_and_classifications` / unplanned | ADEQUATE | Defaults on both tables | Kills the two catalogue `DEFAULT true` mutants behaviourally. Tagged AC-19, but the design maps the column to AC-23 (IR-001) |
| T017 inventory tests (`test_e5_real_migration_inventory_is_contiguous_through_six`, `test_wheel_carries_the_migrations_and_nothing_under_tests`, `test_installed_layout_resolves_its_migrations`) | ADEQUATE | Exact six-file inventory; the wheel carries `0006`; the installed layout resolves versions 1 to 6 | none |

**Mocks and determinism.** No test uses mocks. Every database test runs against PostgreSQL 16 through testcontainers, with a fresh database per test. Dates are fixed literals, and the restore database is named with a UUID. TC-COMP-076 writes only under pytest's `tmp_path`. No test depends on order, network or wall-clock time.

**Setuptools equivalence of TC-COMP-076's oracle.**
- setuptools 84.2.1 (the cached build backend) and 84.2.0 have the same `build_py.find_data_files`: patterns are `os.path.join(src_dir, convert_path(pattern))`, expanded with `partial(glob, recursive=True)` and filtered by `os.path.isfile`.
- `uncovered_sql_files` performs the same expansion; its only change is `glob.escape` on the root.
- The reviewer's probe (`glob_probe.py`, stdlib `glob` with `recursive=True` on a synthetic tree) gives:

| Glob | Ships `classification/sql/anything.sql` | TC-COMP-076 (gate run) |
|------|-----------------------------------------|------------------------|
| `classification/sql/*.sql` (committed) | yes | passes |
| `classification/**/*.sql` | yes | passes (equivalent survivor) |
| `*/sql/*.sql` | yes | passes (equivalent survivor) |
| `*.sql` | no | fails at `:67` |
| `sql/*.sql` | no | fails at `:67` |
| `*/*.sql` | no | fails at `:67` |

**Mutation (TEST-TDD-005/006).** The reviewer used 48 mutants:
- 19 from the catalogue, generated by `mutation-run.py generate` over `f7af5c7..HEAD`: `negate-boolean` 3 and `off-by-one` 16, the same as the coder's set;
- 29 written by hand: 13 against `pyproject.toml:33` and 16 against `0006` behaviour.

- **Gate run (nine focused suites under `-x`; all four baselines 111 passed):** 46 killed, 2 survived. Every kill log was checked: each is an assertion failure in a named test, and none is a collection or uv error.
  - The ten mis-anchored or misspelt `classification` globs fail at TC-COMP-076 `:67`: `*.sql`, `sql/*.sql`, `*/*.sql`, `classification/*.sql`, `classification/sql/*.txt`, `classification/sq/*.sql`, `Classification/sql/*.sql`, `classifications/sql/*.sql`, `classification/sql/*/*.sql` and the dropped entry.
  - Dropping `universes/sql/*.sql` fails TC-COMP-018.
  - Every SQL mutant fails the verbatim guard first.
  - The two survivors are `manual:pkg-glob-recursive` and `manual:pkg-glob-any-sql-dir`. Both are equivalent, per the probe above.
- **Behaviour-only run (diagnostic; the 35 SQL mutants; the verbatim guard excluded; no `-x`):** 30 killed, 5 survived. All five survivors are equivalent:
  - the `((false))` index expression;
  - four edits to `COMMENT ON` text (lines 108, 110 and 112).

  Every manually written behavioural SQL mutant is killed by the constraint and apply tests on their own.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1.md --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-E2-integration` | harness root | 0 | PASS | `f7af5c746b6d73b25f7209fbbf48210111177d23`; an ancestor of HEAD |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f7af5c746b6d73b25f7209fbbf48210111177d23 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings |
| Cycle-patch reproduction: `git archive f7af5c7` extracted to `<scratch>/base`, then `git apply` of `cycle-1` to `cycle-4` in order, then `cmp` of the ten code files against `git archive HEAD` | scratch | 0 | PASS | All four applied; all ten files identical. `shasum -a 256` of `cycle-4.patch` and `red-cycle-4-package-data-anchoring.log` equals the YAML's `diff_sha256` and `red_log_sha256` |
| `uv run --directory <component> --offline pytest <6 focused unit files> -q -p no:cacheprovider` | component root | 0 | PASS | 55 passed |
| `uv run --directory <component> --offline pytest tests/integration/test_research_constraints.py tests/integration/test_research_migrations_apply.py tests/integration/test_migrations_apply.py -q -p no:cacheprovider` | component root | 0 | PASS | 56 passed |
| `uv sync --all-extras --locked --directory <component>` | component root | 0 | PASS (required) | `Resolved 46 packages`, `Checked 43 packages`. `--locked` was added so that a stale lock fails instead of rewriting the tracked `uv.lock` |
| `uv run --directory <component> pytest -m postgres -q -p no:cacheprovider` | component root | 0 | PASS (required) | 393 passed, 965 deselected (201.12 s) |
| `uv run --directory <component> pytest -m "not postgres" -q -p no:cacheprovider` | component root | 0 | PASS (required) | 965 passed, 393 deselected |
| `uv run --directory <component> pytest -q -p no:cacheprovider` | component root | 0 | PASS (required) | 1358 passed (237.04 s) |
| `uv run --directory <component> ruff check .` | component root | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> ruff format --check .` | component root | 0 | PASS (required) | 208 files already formatted |
| `uv run --directory <component> mypy src` | component root | 0 | PASS (required) | No issues in 50 source files |
| `uv build --directory <component> --out-dir <scratch>/uv-build-dist` (one plain call, outside the sandbox) | component root | N/A | refused | `Run outside of the sandbox`. The run's policy names `uv run *` and `uv sync*`, not `uv build`. Superseded by the next two rows |
| `uv build --directory <component> --out-dir <scratch>/uv-build-dist --cache-dir <scratch>/uv-cache` (sandbox) | component root | 2 | refused | `Failed to fetch: https://pypi.org/simple/setuptools/`; the sandbox denies `pypi.org:443`. Superseded by the next row |
| `uv build --directory <component> --out-dir <scratch>/uv-build-dist --offline --find-links <scratch>/wheels --cache-dir <scratch>/uv-cache` (sandbox) | component root | 0 | PASS (required) | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl`. The wheel holds 16 `.sql` files, including `factorflow/db/migrations/0006_classifications.sql`, and nothing under `tests/`; the sdist holds `0006` too. `<scratch>/wheels` holds setuptools 84.2.1 repacked from the local uv cache (`~/.cache/uv/archive-v0/2YEXGW7dY86Rro9h`). It has 348 files, matching its RECORD's 348 entries, and sha256 `3b5c19cf6cf3569fa264d21178a19ab6e0997a6187cf6f345a592e6f0b2937e0`. The build backend is unchanged; CAP-002-E1-S3 review v1 used the same method |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range f7af5c746b6d73b25f7209fbbf48210111177d23..HEAD --cycle review --out <scratch>/mutants-catalogue.json` | harness root | 0 | PASS | 19 mutants, merged with 29 manual mutants by `<scratch>/scripts/build_mutants.py` into `<scratch>/mutants.json` (sha256 `a60aefff8c8b26313b69b01f919fc104bc1346fd60a9e2e92511fa05e4048605`) |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 900 --work-root <scratch>/mut-gate --logs <scratch>/mut-gate-logs --command "uv run --directory '{workdir}' --offline --extra dev pytest <nine focused files> -q -x --no-header -p no:cacheprovider" --out <scratch>/results-gate.json` | harness root | 3 | PASS (required) | 46 killed, 2 survived, both shown equivalent. All four baselines 111 passed. Results sha256 `dd44fcff514aca71a6a10e706e9a234964649420e6abf4a099a1ad8fac1a62db`. The first attempt exited 1 before running anything, because the work root did not exist; it was created and the run repeated |
| The same runner over `<scratch>/mutants-sql.json` (35 SQL mutants), eight suites (no `test_migration_0006_matches_design.py`), without `-x`, `--out <scratch>/results-behav.json` | harness root | 3 | PASS (diagnostic) | 30 killed, 5 equivalent survivors. Results sha256 `d4f0daa6b682d0209360277449667253522d8b715c4c07128483054e9d92081c` |
| `python3 -I -B <scratch>/scripts/glob_probe.py` | scratch | 0 | PASS (diagnostic) | The equivalence table under Test Quality |
| `scripts/sdd decisions show --project factorflow-v2 DEC-0110` / `DEC-0092` | harness root | 0 / 0 | PASS | Both applied, reviewed, `upheld`; both list `5be5069`. Each reports a drifted commit cache |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | `sha256:4d0f7775bf4e0001446b6d916faf807d96ec2e2c4dfdbb4fb3a64621b5a76229`, equal to the approval's `reviewed_revision` |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | component root | N/A | NOT RUN | Not applicable. The change set touches no frontend file, and neither the story nor the task plan lists these commands. `npm run build` would rewrite the packaged `api/static/` assets |

`<component>` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`, and `<scratch>` is `/tmp/claude-501/ir-u004`, outside the component repository. The `uv run`, `uv sync` and mutation commands ran outside the sandbox, as the run's `uv run *`, `uv sync*` and mutation-runner rules permit. The successful `uv build` ran inside the sandbox. Ten commands are counted as required: the TDD lint, `uv sync`, `uv build`, the three pytest runs, ruff, ruff format, mypy and the gate mutation run.

### Validation Side Effects

- Before: HEAD `1e5a1c8104cb1d446b593b74ab1975ac64204f14`, branch `usr/alvaro-de-jodra/CAP-002-E2-S1-run-20261024T231312Z`, 0 porcelain entries, fingerprint `sha256:e8b8d3717e08954ff49ed5cb9b17abbcd78656bbf91a190cf3b8c3dacbe903b1`.
- After: the same HEAD, branch, porcelain (0 entries) and fingerprint.
- Unexpected tracked-file changes: none. Ignored-path effects only: setuptools rewrote `src/factorflow.egg-info/` (`.gitignore:4`) during `uv build` and the editable reinstalls, and used `build/` (`.gitignore:12`). `dist/` was not touched, because the output went to `<scratch>`. Mutation clones, logs, results, probes, wheels and the build output were written under `<scratch>` only.

The only file this review adds to the component repository is this report.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · **total 1**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | LOW | The classification guard tests are tagged TC-COMP-047 (universe-only), and the `restated_possible` test is tagged AC-19 (the design maps it to AC-23); carried from v1/IR-002 |

### IR-001 — Two groups of tests carry a traceability tag their test case or criterion does not specify

- **Severity**: LOW
- **Status**: OPEN (carried from v1/IR-002; not addressed by the rework, which says so in its commit message and in TDD-evidence cycle-4)
- **Acceptance criteria**: AC-19, AC-20, DAC-E2-10 (by mislabel)
- **Tasks**: T012, T020
- **Files**:
  - `tests/unit/test_research_sql_is_append_only.py:143, 154, 169, 185, 198`: the five classification guard tests carry `# Implements TC-COMP-047`, three alone and two with `DAC-E2-10`.
  - `tests/integration/test_research_constraints.py:803`: `# Implements AC-19` above `test_restated_possible_defaults_to_false_on_inputs_and_classifications`.
- **Claim challenged**: Each test's traceability comment names the test case or criterion it implements (T020).
- **Observed evidence**:
  - TC-COMP-047 ("Static guard finds no UPDATE or DELETE on universe_event", `tests/component/research-store-tests.md`) traces to DAC-E1-S1-4, DAC-E1-10 and AC-6. Its expected result names only `universe_event`, and its edge-cases line reads "no further cases are invented". T012's own traceability is "system design C5, research-store 2.5; traces to AC-19, AC-20".
  - The research-store design's traceability table (section 13) maps `restated_possible` to AC-23, which this story does not list.
- **Expected evidence/behavior**: Tags name the criteria the tests serve. For T012's tests, that is AC-19, AC-20 and DAC-E2-10, as its plan text says. The `restated_possible` test serves research-store section 2.4 (AC-23 in the design's table).
- **Impact**: A traceability sweep over-counts TC-COMP-047, recording E1-S1's universe-only test case as implemented by classification guards. The unplanned test is filed under a criterion it does not prove. No gate effect.
- **Required remediation**: Optional. Re-tag the five T012 tests to AC-19, AC-20 or DAC-E2-10, keeping TC-COMP-047 on the universe cases. Re-tag or annotate the `restated_possible` test as a section 2.4 extra (AC-23).

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `test_package_data_ships_sql.py:55-67` calls `uncovered_sql_files(tmp_path, package_data_globs())` on a synthetic `classification/sql/anything.sql`, with no dependence on `src/factorflow/classification/sql/`. TC-COMP-018's tests (`:44-52`, `:70-100`) are unchanged. In the gate mutation run, `manual:pkg-glob-top-level` (`*.sql`), `-sql-only` (`sql/*.sql`) and `-any-dir` (`*/*.sql`) are killed by this test at `:67` (`1 failed, 2 passed`). Seven further mis-anchored variants are killed the same way. The only survivors are setuptools-equivalent. The coder's RED log for the three globs is consistent with the reviewer's own runs |
| v1/IR-002 | STILL OPEN | Carried as IR-001 above; the lines and tags are unchanged at HEAD |
| v1 validation gap (`uv build` not run; not a finding) | RESOLVED | `uv build` passed inside the sandbox with a locally provisioned setuptools 84.2.1 backend; both the sdist and the wheel carry `0006_classifications.sql` |

## Scope and Plan Deviations

- **T010, justified**:
  - TC-COMP-076 uses the E1-S1 helper on a synthetic tree, as the plan's "Use the existing helper for matching globs if E1-S1 defines one" clause directs. It does not use the plan's `fnmatch`/`PurePath.match` suggestion, whose right-anchored matching was v1/IR-001.
  - TDD-evidence cycle-4 records this choice.
  - No decision record is needed: the plan itself supplies the instruction.
- **T013, justified** (unchanged since v1): `status='maybe'` asserts `factor_classification_shape`, because PostgreSQL reports CHECK violations in name order. "All four tables refuse a `set_id`" is met for the three tables that carry a `set_id` FK.
- **T017(c) and (d), justified**: CAP-002-E1-S1 made these edits under DEC-0187, in equivalent form; the plan says to skip "any already done by E1-S1".
- **Unplanned test, justified**: `test_restated_possible_defaults_to_false_on_inputs_and_classifications` pins a research-store 2.4 default that no other test pins behaviourally. Its tag is IR-001.
- **Decisions**: DEC-0110 and DEC-0092 justify T017. Both are reviewed and `upheld`, and `5be5069` carries both trailers in its final paragraph. The rework commit `1e5a1c8` needs no trailer.
- **Bookkeeping**:
  - The story `status` is `in-review`, and the approval revision is unchanged.
  - All 21 task boxes are checked and all 21 tasks are VERIFIED.
  - The task plan's `last_reworked_review` names v1.
  - The TDD-evidence header comment still says the review subagents "judged all three patches". Cycle-4 carries its own `code_review_verdict` and `spec_drift`, so the record is complete.
- **No out-of-scope files**.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**:
  - Run `$doc-sync` for CAP-002-E2-S1 against this report.
  - IR-001 is optional and may be addressed in a later touch of these test files.
  - **Owner:** commit this report on the story branch and push the branch. Doc sync for this story stays blocked until the report is committed.
- **Warnings accepted downstream**: IR-001
