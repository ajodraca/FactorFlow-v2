---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-24
updated: 2026-10-24
story_id: "CAP-002-E2-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-24T23:48:48Z"
reviewed_head: "5be50698ef2bcb1bb345ab6a32c81672fe3ab5a9"
review_base: "f7af5c746b6d73b25f7209fbbf48210111177d23"
reviewed_state_revision: "sha256:f55106348c37f67d3f49daf30a2eae442fc93b85ea711fd3959c6147e0fdc345"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-10-24T23:48:48Z
  source_artifacts:
    - id: CAP-002-E2-S1
      version: "2 (sha256:4d0f7775bf4e0001446b6d916faf807d96ec2e2c4dfdbb4fb3a64621b5a76229)"
    - id: CAP-002-E2-S1-tasks
      version: "1"
    - id: CAP-002-E2-S1-tdd-evidence
      version: "cycles 1 to 3"
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

# Implementation Review: CAP-002-E2-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 12/13 satisfied |
| Planned tasks | 20/21 verified |
| Required validation | 6/7 passed |

The migration itself is right.
- `0006_classifications.sql` is byte-identical to the research-store section 2.4 block.
- All four tables, seven indexes and sixteen named constraints are present.
- The constraint, apply, idempotence and `pg_dump` round-trip tests check the right things.
- Every SQL mutant, catalogue or reviewer-written, is killed by the story's focused suites.
- The suite passes: 1358 tests, ruff, ruff format and `mypy src` all clean.
- The TDD-evidence lint is clean, and the three cycle patches reproduce the committed diff exactly.

One HIGH finding blocks the gate. **IR-001**: the mandatory TC-COMP-076 test (`test_classification_sql_is_covered_by_a_package_data_glob`) decides "covered" with `PurePath.match`. That matcher anchors on the right of the path. setuptools anchors package-data globs at the package root, so the two disagree:
- `"*.sql"`, `"sql/*.sql"` and `"*/*.sql"` each pass TC-COMP-076.
- setuptools would ship none of `classification/sql/*.sql` from any of them.
- All three survive all 111 focused tests as `pyproject.toml` mutants.

The same module already rejects `*.sql` as covering `widgets/sql/read.sql` (`test_guard_reports_a_glob_that_only_looks_like_it_covers_the_file`). CAP-002-E1-S1 review v2/IR-001 was this same defect in TC-COMP-018. TC-COMP-076 is therefore `WEAK`, T010 is `PARTIAL` and DAC-E2-S1-8 is `PARTIAL`.

There is also one validation gap. The tech stack's `uv build` could not run in this unattended unit:
- Sent outside the sandbox, it was refused as *Run outside of the sandbox*: no permission rule names it.
- Inside the sandbox, uv could not open its cache.

The wheel half is still covered: `tests/unit/test_distribution_contents.py` builds a wheel from a copy of `src/` and `pyproject.toml`, and it passed. The sdist half was not run. Because IR-001 is a demonstrated defect, the verdict is `CHANGES-REQUIRED` and not `INCONCLUSIVE` (skill step F.3).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1.md` (v2, approved; revision `sha256:4d0f7775bf4e0001446b6d916faf807d96ec2e2c4dfdbb4fb3a64621b5a76229` equals the approval's `reviewed_revision`, so the `status: planning` → `in-review` edit did not invalidate it) |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1-tasks.md` (v1; only the 21 checkboxes changed — a checkbox-normalised diff against `f7af5c7` is empty) |
| Component | `FactorFlow-v2` (module `research-store`, migration `0006`; packaging) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S1-run-20261024T231312Z` |
| HEAD | `5be50698ef2bcb1bb345ab6a32c81672fe3ab5a9` (`story-coding(CAP-002-E2-S1): migration 0006 classification tables`; trailers `Decision-Id: DEC-0110`, `Decision-Id: DEC-0092`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E2-integration` = `f7af5c746b6d73b25f7209fbbf48210111177d23`, resolved with `pipeline-state.py review-base --base-ref usr/alvaro-de-jodra/CAP-002-E2-integration`; `git merge-base --is-ancestor` exit 0. The range is one commit, and that commit names only CAP-002-E2-S1 |
| Working tree | Clean: no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 43 (10 code/config/test files, the story, the task plan, the TDD-evidence file and 30 evidence files) |

Supervised run `run-20261024T231312Z`, unit `u002`, unattended.

### Changed Files

`.../stories/` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/db/migrations/0006_classifications.sql` | added (112 lines) | AC-10, AC-19, AC-20, DAC-E2-4, DAC-E2-10, DAC-E2-S1-1 to -6; T015 |
| `pyproject.toml` | modified (line 33: `"classification/sql/*.sql"` appended; nothing else changed) | DAC-E2-S1-8; T016 (DEC-0088) |
| `src/factorflow/db/migrations/README.md` | modified (+1 Files-table row) | T018 |
| `tests/unit/test_migration_0006_matches_design.py` | added | AC-19, AC-20; T011 |
| `tests/integration/test_research_constraints.py` | modified (+588 lines appended after the E1-S1 universe cases) | DAC-E2-S1-2 to -6; T005 to T009, T013, T014 |
| `tests/integration/test_research_migrations_apply.py` | modified (+170) | DAC-E2-S1-1, -7; T002 to T004 |
| `tests/unit/test_research_sql_is_append_only.py` | modified (+96) | AC-19, AC-20, DAC-E2-10; T012 |
| `tests/unit/test_package_data_ships_sql.py` | modified (+13; one new test) | DAC-E2-S1-8; T010 |
| `tests/unit/test_migration_filenames.py` | modified (rename and +1 list entry) | DAC-E2-S1-1; T017(a) (DEC-0110, DEC-0092) |
| `tests/unit/test_distribution_contents.py` | modified (tuple entry, docstring, versions literal) | DAC-E2-S1-1; T017(b) (DEC-0110, DEC-0092) |
| `.../stories/CAP-002-E2-S1.md` | modified (`status: planning` → `in-review`) | story-coding lifecycle |
| `.../stories/CAP-002-E2-S1-tasks.md` | modified (21 checkboxes) | T001 to T021 bookkeeping |
| `.../stories/CAP-002-E2-S1-tdd-evidence.yaml` | added (cycles 1 to 3) | T021 |
| `.../stories/CAP-002-E2-S1-evidence/cycle-{1,2,3}.patch`, `red-cycle-{1,2,3}-*.log`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`, `mutation-cycle-1-results-logs/*` (22 logs) | added (30 files) | T021 (RED and mutation evidence) |

No changed file lacks a justification.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `0006_classifications.sql:3` (`run_id ... NOT NULL UNIQUE REFERENCES acquisition_run`); `pyproject.toml:33` glob | `test_research_constraints.py::test_a_second_set_for_the_same_run_is_refused`, `::test_a_set_naming_no_run_is_refused`; `test_package_data_ships_sql.py::test_classification_sql_is_covered_by_a_package_data_glob` | Store and packaging share only. Recomputing after a qualifying run is the scheduler's job (CAP-002-E2-S8). The packaging leg's test weakness is recorded once, under DAC-E2-S1-8 (IR-001) |
| AC-19 | SATISFIED | `0006` is additive: `CREATE TABLE`, `CREATE INDEX` and `COMMENT ON` only; `classification_date date NOT NULL` (`:5`); `factor_input_present_is_dated` (`:61-63`) | `test_research_migrations_apply.py::test_migration_0006_applies_without_touching_earlier_rows`, `::test_pg_dump_restore_returns_the_current_set_and_membership_unchanged`; `test_research_sql_is_append_only.py::test_research_sql_is_append_only` (five-table tuple) | No CAP-001 or `0005` row changes, and `UPDATE`, `DELETE` or upsert against the three append-only classification tables is refused by the static guard |
| AC-20 | SATISFIED | `idx_classification_set_single_building` (`:22-23`); `classification_set_terminal_has_end`, `_failed_has_reason`, `_complete_is_sized` (`:13-19`) | TC-COMP-163, TC-COMP-164, TC-COMP-165 tests; `test_every_classification_set_update_is_guarded_by_building_state` | Build side, as the story scopes it. The one-transaction write belongs to `factor-engine` (TC-COMP-166, TC-COMP-167) |
| DAC-E2-4 | SATISFIED | `:3` unique `run_id` with an FK to `acquisition_run` | `test_a_second_set_for_the_same_run_is_refused` (`UniqueViolation`, `classification_set_run_id_key`; the second row is a `failed` set, so only uniqueness can refuse it), `test_a_set_naming_no_run_is_refused` (`classification_set_run_id_fkey`) | "A failed, cancelled or abandoned run never acquires one" is not a property of the approved DDL. The coverage matrix assigns it to `classification-scheduler` (TC-COMP-078, TC-COMP-081) |
| DAC-E2-10 | SATISFIED | Terminal-shape CHECKs (`:13-19`); single-building index | `test_a_terminal_set_missing_a_required_column_is_refused` (4 cases); `test_set_level_edge_constraints_are_named`; guard tests for `UPDATE classification_set` | Store share. Same-transaction completion and rollback belong to `factor-engine` |
| DAC-E2-S1-1 | SATISFIED | `0006` is additive only | `test_migration_0006_applies_without_touching_earlier_rows`: `apply_pending` returns `[6]`; the version 6 checksum equals the file's; all 13 pre-existing tables are unchanged as full-row text apart from the new `applied_migrations` row; the four new tables are empty. `test_a_second_apply_after_0006_changes_nothing`: `[]`, 6 rows, tables unchanged | none |
| DAC-E2-S1-2 | SATISFIED | `:3` | `test_a_second_set_for_the_same_run_is_refused` (count stays 1) | Kills `manual:run-id-not-unique` behaviourally |
| DAC-E2-S1-3 | SATISFIED | `:22-23` | `test_only_one_building_set_is_allowed_but_terminal_sets_may_sit_beside_it`: `UniqueViolation` on `idx_classification_set_single_building`, then a `complete` and a `failed` row accepted beside it (count 3) | Kills `single-building-not-unique` and `single-building-wrong-state` behaviourally |
| DAC-E2-S1-4 | SATISFIED | `:13-19` | `test_a_terminal_set_missing_a_required_column_is_refused`: four parametrised rows, each asserting `CheckViolation` and `diag.constraint_name` | Kills `complete-sized-drops-active` and `failed-reason-one-way` behaviourally |
| DAC-E2-S1-5 | SATISFIED | `:88-97` | `test_a_malformed_classification_row_is_refused_by_its_named_constraint` (6 rows) plus `test_a_well_formed_classification_row_is_accepted` (5 accepting controls: percentile 0 and 100, `input_missing` naming an input, `not_enough_stocks`, `retired`) | Every row the DAC names is refused by the named constraint, and the controls show none of the refusals is vacuous |
| DAC-E2-S1-6 | SATISFIED | `:55-63` | `test_a_malformed_factor_input_is_refused_by_its_named_constraint` (4 rows); `test_a_present_dated_input_and_a_bare_missing_input_are_accepted` | `detail` is `'{}'::jsonb` in every row. Kills `present-dated-drops-known-on` and `name-matches-value-admits-return` behaviourally |
| DAC-E2-S1-7 | SATISFIED | n/a (operational property of the schema) | `test_pg_dump_restore_returns_the_current_set_and_membership_unchanged`: `pg_dump -Fc` and `pg_restore` run inside the session container; five tables (set, set factor, classification, universe, universe events) compared as full-row text; the restored database is dropped in `finally` | none |
| DAC-E2-S1-8 | PARTIAL | `pyproject.toml:33` lists `"classification/sql/*.sql"`, which setuptools expands to `classification/sql/*.sql` | `test_package_data_ships_sql.py:56-64` | The oracle `PurePath.match` also accepts `"*.sql"`, `"sql/*.sql"` and `"*/*.sql"`, none of which ships `classification/sql/`. Three surviving mutants (IR-001, HIGH) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `0005_universes.sql` and the four shared test files exist at `f7af5c7` (the diff modifies them; it does not create them) | The hard dependency CAP-002-E1-S1 has landed |
| T002 | complete | VERIFIED | `test_research_migrations_apply.py:152-183` | Seeds an instrument, bar, statement, run and a universe with `created` and `member_added`. Snapshots all 13 tables, then checks `[6]`, the checksum and that the new tables are empty. The plan's `discover(...)[:5]` is written as `version <= 5`, which is equivalent |
| T003 | complete | VERIFIED | `test_research_migrations_apply.py:207-289` | Matches the plan in every element, including `container.exec_run` and the drop in `finally`. The in-container `/tmp/factorflow.dump` is not removed; the container is discarded per session, so this is harmless |
| T004 | complete | VERIFIED | `test_research_migrations_apply.py:186-204` | `[]`, six rows, four tables unchanged; tagged `# Implements DAC-E2-S1-1` as the plan says |
| T005 | complete | VERIFIED | `test_research_constraints.py:363-392` | Unique key and FK names asserted |
| T006 | complete | VERIFIED | `test_research_constraints.py:395-414` | none |
| T007 | complete | VERIFIED | `test_research_constraints.py:417-442` | Parametrised over the four rows |
| T008 | complete | VERIFIED | `test_research_constraints.py:454-546` | Every refusal and accepting control in the plan is present |
| T009 | complete | VERIFIED | `test_research_constraints.py:549-610` | none |
| T010 | complete | PARTIAL | `test_package_data_ships_sql.py:55-64` | The test exists, is a separate function, leaves E1-S1's assertions untouched and fails without the glob (RED log). But its matcher accepts globs setuptools does not ship (IR-001). The plan also says "Use the existing helper for matching globs if E1-S1 defines one". E1-S1 does: `uncovered_sql_files` (`:23-41`), which is setuptools-faithful and already takes a synthetic root (`:68-74`). It was not used |
| T011 | complete | VERIFIED | `tests/unit/test_migration_0006_matches_design.py` | Verbatim equality with the design block; a check that the block was found; 4 tables, 7 indexes and 16 constraints parsed from the design block. `design_sql.py` is untouched |
| T012 | complete | VERIFIED | `test_research_sql_is_append_only.py:18-24, 117-202` | `RESEARCH_TABLES` holds exactly five tables. `prohibited_research_mutations` keeps its name and signature, and the delivered `test_sql_is_append_only.py` is untouched. The guard rule scans the same `rglob` set. All four plan strings are present (unguarded detected, factor-engine shape allowed, reclaim shape allowed, `DELETE` rejected). TC tag: IR-002 |
| T013 | complete | VERIFIED | `test_research_constraints.py:613-761` | Justified deviation: the plan expected `status='maybe'` to be refused by `factor_classification_status_known`, but the test asserts `factor_classification_shape`. PostgreSQL applies CHECKs in name order, and the shape CHECK is false for any status outside the two values, so `status_known` can never be the reported constraint; it is logically implied by the shape CHECK. The plan's "all four tables refuse a `set_id`" covers three, because `classification_set` has no `set_id` FK; its `run_id` FK is pinned under T005 |
| T014 | complete | VERIFIED | `test_research_constraints.py:764-800` | Exact set of seven index names; unique and partial; the four column types and nullability. Kills `score-index-dropped`, `detail-nullable` and the six catalogue `numeric` mutants behaviourally |
| T015 | complete | VERIFIED | `0006_classifications.sql` | Reviewer `diff` against the design block: no differences, single trailing newline. No `BEGIN`, `COMMIT`, `VACUUM` or `CONCURRENTLY` (`test_migration_filenames.py` guards pass) |
| T016 | complete | VERIFIED | `pyproject.toml:33` | Appended last; the word diff shows nothing else changed |
| T017 | complete | VERIFIED | `test_migration_filenames.py:42-50`; `test_distribution_contents.py:29, 81, 100` | (a) and (b) as planned. (c) and (d) were already made by CAP-002-E1-S1 under DEC-0187, in equivalent form: `discover(...)[:4]` in `test_migrations_apply.py:17` and `version <= 4` in `test_migrator_discover.py:98`. Both still pass with `0006` present. The commit carries both required trailers |
| T018 | complete | VERIFIED | `src/factorflow/db/migrations/README.md:37` | Matches the plan's row text exactly |
| T019 | complete | VERIFIED | Reviewer reran the suite: 1358 passed; ruff, format and mypy clean | The coder's claim of 1358 passed is reproduced. `uv build` was not rerunnable here (see Independent Validation) |
| T020 | complete | VERIFIED | `# Implements` comments are present on every T002 to T010 test; T011 cites AC-20 and AC-19 in its docstring; T013 and T014 carry `# Implements AC-20` | Two tags name the wrong criterion (IR-002). The change set touches only files the plan names, plus T021 evidence and the story status |
| T021 | complete | VERIFIED | `CAP-002-E2-S1-tdd-evidence.yaml`; `CAP-002-E2-S1-evidence/` | Lint clean with `--require-logs`. Each `diff_sha256` equals its patch's SHA-256, and the three patches together equal `git diff f7af5c7 HEAD` for all 10 code files (index lines stripped). `commit_hash: stage` is used as the plan allows. The YAML header says one code-review and one spec-drift subagent "judged all three patches"; whether each review ran before the next cycle began cannot be verified from the repository. The lint accepts it, and no finding is raised |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_migration_0006_applies_without_touching_earlier_rows` / TC-COMP-156 | ADEQUATE | Exact `[6]`, checksum, full-row snapshot of 13 tables, empty new tables | `manual:dml-update-instrument` (a no-op `UPDATE instrument SET lifecycle = lifecycle`) survives the behavioural run. It is equivalent with respect to row content, which is what the DAC protects |
| `test_a_second_apply_after_0006_changes_nothing` / DAC-E2-S1-1 | ADEQUATE | `[]`, 6 rows, four tables unchanged with one complete set present | none |
| `test_pg_dump_restore_returns_the_current_set_and_membership_unchanged` / TC-COMP-158 | ADEQUATE | Real `pg_dump -Fc` and `pg_restore`; exit codes asserted; five tables compared as full-row text; non-empty precondition asserted | none |
| `test_a_second_set_for_the_same_run_is_refused`, `test_a_set_naming_no_run_is_refused` / TC-COMP-075 | ADEQUATE | Exception class plus constraint name; the second row is `failed` with all columns, so only uniqueness can refuse it | Kills `run-id-not-unique` and `run-id-fk-dropped` |
| `test_only_one_building_set_is_allowed_but_terminal_sets_may_sit_beside_it` / TC-COMP-163 | ADEQUATE | Refusal by index name; terminal rows accepted beside it | `((true))` → `((false))` survives the behavioural run. It is equivalent: any constant gives every `building` row the same key |
| `test_a_terminal_set_missing_a_required_column_is_refused` / TC-COMP-164 | ADEQUATE | Four rows, each needing exactly one constraint to fail | none |
| `test_a_malformed_classification_row_is_refused_by_its_named_constraint`, `test_a_well_formed_classification_row_is_accepted` / TC-COMP-165 | ADEQUATE | Six refusals by name and five accepting controls | Two residual behavioural survivors that only the verbatim guard (T011) kills: `shape-classified-allows-reason-input`, a `classified` row with a `reason_input` and no `reason_code`; and `reason-input-agrees-drops-outdated`, where `input_outdated` and `input_not_computable` are never exercised. Neither row is named by DAC-E2-S1-5, and both are killed in the gate run |
| `test_a_malformed_factor_input_is_refused_by_its_named_constraint`, `test_a_present_dated_input_and_a_bare_missing_input_are_accepted` / TC-COMP-157 | ADEQUATE | Name-matches-factor and each missing `present` column, plus controls | none |
| `test_classification_sql_is_covered_by_a_package_data_glob` / TC-COMP-076 | **WEAK** | Fails when the glob is removed (RED log; kills `pkg-classification-glob-dropped`, `-one-level` and `-wrong-ext`) | `PurePath.match` is right-anchored. `"*.sql"`, `"sql/*.sql"` and `"*/*.sql"` pass it, yet setuptools ships nothing under `classification/sql/` for any of them. Three survivors across all 111 focused tests (IR-001) |
| `test_migration_0006_matches_design_verbatim`, `test_design_block_is_actually_read`, `test_migration_0006_names_every_table_index_and_constraint_in_the_design` / T011 | ADEQUATE | Exact text equality with the design's own block; counts parsed from the design | The first test to fail for every SQL mutant under `-x` |
| `test_every_classification_set_update_is_guarded_by_building_state` and its three parametrised companions / T012 | ADEQUATE | Whole-tree scan, plus the positive and negative strings the plan names; `DELETE` is rejected even when it names `building` | The pattern stops at the first `"`. A guarded `UPDATE` split across Python string literals would be reported as unguarded, which fails closed. No such code exists yet. TC tag: IR-002 |
| `test_guard_covers_the_classification_tables` / T012 | ADEQUATE | `UPDATE` and `DELETE` on the three tables detected; RED shown with the two-entry tuple | none |
| `test_set_level_edge_constraints_are_named`, `test_set_factor_edge_constraints_are_named`, `test_input_and_classification_edge_constraints_are_named`, `test_every_classification_table_refuses_a_set_that_does_not_exist` / T013 | ADEQUATE | Constraint, primary-key and FK names asserted; every refusal rolled back | Kills `set-factor-pk-dropped` and `set-factor-fk-dropped` |
| `test_indexes_and_column_types_match_the_design` / T014 | ADEQUATE | Exact index set; unique and partial; precision, scale and nullability | none |
| `test_restated_possible_defaults_to_false_on_inputs_and_classifications` / unplanned | ADEQUATE | Defaults on both tables | Kills the two catalogue `DEFAULT true` mutants behaviourally. Tagged AC-19; the design maps the column to AC-23 (IR-002) |
| T017 inventory tests (`test_e5_real_migration_inventory_is_contiguous_through_six`, `test_wheel_carries_the_migrations_and_nothing_under_tests`, `test_installed_layout_resolves_its_migrations`) | ADEQUATE | Exact six-file inventory; the wheel carries `0006`; the installed layout resolves versions 1 to 6 | none |

**Mocks and determinism.** No test uses mocks. Every database test runs against PostgreSQL 16 through testcontainers, with a fresh database per test. Dates are fixed literals. The `pg_dump` test names its restore database with a UUID and drops it in `finally`. No test depends on order, network or wall-clock time.

**Mutation (TEST-TDD-005/006).** The reviewer used 42 mutants:
- 19 from the catalogue, generated by `mutation-run.py generate` over `f7af5c7..HEAD`. They are identical in number and operators to the coder's set.
- 23 written by hand: 6 against the `pyproject.toml` line this story changed, 17 against `0006` behaviour.

The coder recorded cycle 2 as `not_applicable` because configuration has no operator to mutate. The linter accepts that, but skill step E.9 asks the reviewer to add manual mutants for every changed production file, and `pyproject.toml:33` is one.

- **Gate run (all nine focused suites; every baseline 111 passed):** 39 of 42 killed. The three survivors are `manual:pkg-classification-glob-top-level`, `-sql-only` and `-any-dir`; each survivor log shows `111 passed`.
- **Equivalence check, by a probe on a synthetic `factorflow/classification/sql/anything.sql`:**

  | Glob | TC-COMP-076 oracle | setuptools (`glob(<root>/<pattern>, recursive=True)`) | module helper `uncovered_sql_files` |
  |------|--------------------|-------------------------------------------------------|-------------------------------------|
  | `classification/sql/*.sql` | covered | shipped | covered |
  | `*.sql` | covered | not shipped | not covered |
  | `sql/*.sql` | covered | not shipped | not covered |
  | `*/*.sql` | covered | not shipped | not covered |
  | `**/*.sql` | covered | shipped | covered |

  The setuptools expansion matches `build_py.find_data_files` in the cached setuptools 84.2.1, which expands each pattern with `partial(glob, recursive=True)`. The survivors are not equivalent with respect to DAC-E2-S1-8, whose purpose is that a non-editable install carries the statements CAP-002-E2-S2 will add.
- **Behavioural-only run (the verbatim guard excluded; diagnostic):** 31 of 42 killed. The 11 survivors are:
  - the three packaging survivors above;
  - four comment-text edits and the `((false))` index expression, all equivalent;
  - the no-op `dml-update-instrument`, equivalent as described above;
  - `shape-classified-allows-reason-input` and `reason-input-agrees-drops-outdated`, which the verbatim guard kills in the gate run.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1.md --stage adversarial-review` | harness root | 0 | PASS | `READY — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-E2-integration` | harness root | 0 | PASS | `f7af5c746b6d73b25f7209fbbf48210111177d23`; an ancestor of HEAD |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f7af5c746b6d73b25f7209fbbf48210111177d23 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| Cycle-patch reproduction: `git diff f7af5c7 HEAD -- <each patch's files>` compared with `cycle-{1,2,3}.patch`, index lines stripped | component root | 0 | PASS | All three identical; together they cover all 10 code files |
| `uv run --directory <component> pytest <6 focused unit files> -q -p no:cacheprovider` | component root | 0 | PASS | 55 passed |
| `uv run --directory <component> pytest tests/integration/test_research_constraints.py tests/integration/test_research_migrations_apply.py tests/integration/test_migrations_apply.py -v -p no:cacheprovider` | component root | 0 | PASS | 56 passed (Python 3.13.7) |
| `uv run --directory <component> pytest -m postgres -q -p no:cacheprovider` | component root | 0 | PASS | 393 passed, 965 deselected (206.92 s) |
| `uv run --directory <component> pytest -m "not postgres" -q -p no:cacheprovider` | component root | 0 | PASS | 965 passed, 393 deselected |
| `uv run --directory <component> pytest -q -p no:cacheprovider` | component root | 0 | PASS | 1358 passed (234.61 s) |
| `uv run --directory <component> ruff check .` | component root | 0 | PASS | All checks passed |
| `uv run --directory <component> ruff format --check .` | component root | 0 | PASS | 208 files already formatted |
| `uv run --directory <component> mypy src` | component root | 0 | PASS | No issues in 50 source files |
| `uv build --directory <component> --out-dir <scratch>/uv-build-dist` | component root | N/A | NOT RUN | Sent as one plain call outside the sandbox, twice: refused as `Run outside of the sandbox` (the run's policy names `uv run *` and `uv sync*`, not `uv build`). Sent inside the sandbox: `error: Failed to initialize cache at /Users/alvarodejodra/.cache/uv ... Operation not permitted (os error 1)`. The wheel half is exercised by `test_distribution_contents.py::built_wheel` (`uv build --wheel --offline` on a copy of `src/` and `pyproject.toml`), which passed in both full runs. The sdist half is unverified |
| `uv run --directory <component> mypy <5 changed test modules>` | component root | 1 | PASS (diagnostic, not required) | 7 errors in `test_research_constraints.py`. The project does not type-check tests: `mypy tests` reports 204 errors in 60 files at HEAD. No finding |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range f7af5c746b6d73b25f7209fbbf48210111177d23..HEAD --cycle review --out <scratch>/mutants-catalogue.json` | harness root | 0 | PASS | 19 mutants (`negate-boolean` 3, `off-by-one` 16), merged with 23 manual mutants into `<scratch>/mutants.json` (sha256 `f893559dba7cf9f7e1f89e49e6679b8617b6438f1b524760333e758c6c3dec9c`) |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 900 --work-root <scratch>/mut-gate --command "uv run --directory '{workdir}' --offline --extra dev pytest <nine focused files> -q -x --no-header -p no:cacheprovider" --out <scratch>/results-gate.json` | harness root | 3 | FAIL | 39 killed, 3 survived (IR-001). All 4 baselines 111 passed. Results sha256 `aee147285d3f0f7ecb3e5f35038d06bc20ece7ab80e23129608e1b3d79dcbdb8` |
| Same mutants, the eight behavioural suites only (no `test_migration_0006_matches_design.py`) | harness root | 3 | PASS (diagnostic) | 31 killed, 11 survived, classified under Test Quality. Results sha256 `814b4a7e46656382decb7877827fc833aabdf267b6e6477975d02b4b19b1b75a` |
| Glob probe: `uv run --directory <component> --offline python -I -B <scratch>/glob_probe.py <component>/tests/unit/test_package_data_ships_sql.py` | component root | 0 | PASS (diagnostic) | The table under Test Quality. The module is loaded read-only and the synthetic tree lives in a fresh temporary directory |
| `scripts/sdd decisions show --project factorflow-v2 DEC-0110` / `DEC-0092` | harness root | 0 / 0 | PASS | Both applied, owner-reviewed, `upheld`. Both list `5be5069`. Each reports a drifted commit cache |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | `sha256:4d0f7775bf4e0001446b6d916faf807d96ec2e2c4dfdbb4fb3a64621b5a76229`, equal to the approval's `reviewed_revision` |
| `npm` / `npx` commands from the tech stack | component root | N/A | NOT RUN | The change set touches no frontend file, and neither the story nor the task plan lists them |

`<component>` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`, and `<scratch>` is `$TMPDIR/ir-u002`, outside the component repository. Every `uv` and mutation command ran outside the sandbox, as permitted by the run's `uv run *` and mutation-runner rules.

### Validation Side Effects

- Before: HEAD `5be50698ef2bcb1bb345ab6a32c81672fe3ab5a9`, branch `usr/alvaro-de-jodra/CAP-002-E2-S1-run-20261024T231312Z`, 0 porcelain entries, fingerprint `sha256:f55106348c37f67d3f49daf30a2eae442fc93b85ea711fd3959c6147e0fdc345`.
- After: the same HEAD, branch, porcelain (0 entries) and fingerprint.
- Unexpected tracked-file changes: none. Mutation clones, logs, results and probe files were written under `<scratch>` only.

The only file this review adds to the component repository is this report.

## Findings

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 1 · **total 2**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | HIGH | TC-COMP-076's `PurePath.match` oracle accepts `*.sql`, `sql/*.sql` and `*/*.sql`, none of which ships `classification/sql/`; three non-equivalent `pyproject.toml` mutants survive |
| IR-002 | LOW | The classification guard tests are tagged TC-COMP-047 (universe-only), and the `restated_possible` test is tagged AC-19 (the design maps it to AC-23) |

### IR-001 — TC-COMP-076 accepts package-data globs that do not ship `classification/sql/`

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S1-8 (and the packaging leg of AC-10)
- **Tasks**: T010 (T016)
- **Files**: `tests/unit/test_package_data_ships_sql.py:55-64` (`test_classification_sql_is_covered_by_a_package_data_glob`: `any(PurePath("classification/sql/anything.sql").match(pattern) ...)`); `pyproject.toml:33`
- **Claim challenged**: TC-COMP-076 proves that "`classification/sql/` is covered by a package-data glob, so the scheduler and the reader can load their statements from a non-editable install" (DAC-E2-S1-8; TDD evidence cycle 2).
- **Observed evidence**:
  - `PurePath.match` matches a relative pattern from the right. setuptools anchors each package-data pattern at the package directory: `build_py.find_data_files` expands it with `partial(glob, recursive=True)` (cached setuptools 84.2.1).
  - Probe on a synthetic `classification/sql/anything.sql`: the test's oracle reports `"*.sql"`, `"sql/*.sql"` and `"*/*.sql"` as covering it. setuptools ships it for none of them, and the module's own `uncovered_sql_files` agrees with setuptools.
  - Gate mutation run: `manual:pkg-classification-glob-top-level`, `-sql-only` and `-any-dir` (line 33's glob replaced by each) survive all nine focused suites, with `111 passed` in every survivor log.
  - The same module asserts the opposite for the same glob shape: `test_guard_reports_a_glob_that_only_looks_like_it_covers_the_file[*.sql]` (`:77-87`) requires `*.sql` not to cover `widgets/sql/read.sql`.
  - T010 directs: "Use the existing helper for matching globs if E1-S1 defines one". E1-S1 defines `uncovered_sql_files(package_root, globs)` (`:23-41`), and `:68-74` already uses it on a synthetic root. TC-COMP-076 does not use it.
  - Precedent: CAP-002-E1-S1 review v2/IR-001 (HIGH) was this defect in TC-COMP-018 (an `fnmatch` matcher accepting `coverage/*.sql` and `*.sql`). Review v3 records that the plan's suggested `fnmatch`/`PurePath.match` "neither meets the plan's stated purpose".
- **Expected evidence/behavior**:
  - DAC-E2-S1-8 and TC-COMP-076's expected result: the glob must cover `classification/sql/` in the sense a non-editable install honours.
  - Skill step E.9 / TEST-TDD-006: no non-equivalent mutant of a changed line may survive the story's focused suites.
- **Impact**: Today the committed glob is correct, and HEAD's wheel is the same under each surviving mutant, because the directory does not exist yet. But TC-COMP-076 exists to pin this before CAP-002-E2-S2 creates `classification/sql/`, and it would stay green under each of the three mis-anchored globs. TC-COMP-018 would catch such a glob only once the directory and its files exist. Until then, the story's own guard gives false assurance.
- **Required remediation**: Make TC-COMP-076 decide coverage the way setuptools does, for example by reusing `uncovered_sql_files` on a synthetic tree that holds `classification/sql/<file>.sql`. Keep the test independent of whether `src/factorflow/classification/sql/` exists. Show RED for at least the `*.sql` and `sql/*.sql` variants. TC-COMP-018's existing tests stay untouched.

### IR-002 — Two new tests carry a traceability tag their test case or criterion does not specify

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-19, AC-20, DAC-E2-10 (by mislabel)
- **Tasks**: T012, T020
- **Files**:
  - `tests/unit/test_research_sql_is_append_only.py:143, 154, 169, 185, 198`: the five classification guard tests carry `# Implements TC-COMP-047`, three of them alone and two with `DAC-E2-10`.
  - `tests/integration/test_research_constraints.py:803`: `# Implements AC-19`.
- **Claim challenged**: Each test's traceability comment names the test case or criterion it implements (T020).
- **Observed evidence**:
  - TC-COMP-047 ("Static guard finds no UPDATE or DELETE on universe_event", `tests/component/research-store-tests.md:133-151`) traces to DAC-E1-S1-4, DAC-E1-10 and AC-6. Its expected result names only `universe_event`, and "no further cases are invented". T012's own traceability is "system design C5, research-store 2.5; traces to AC-19, AC-20".
  - `test_restated_possible_defaults_to_false_on_inputs_and_classifications` is not in the plan. The research-store design's traceability table maps `restated_possible` to AC-23, which this story does not list; it does not map it to AC-19.
  - CAP-002-E1-S1 review v3/IR-001 (LOW) raised the same class of mislabel.
- **Expected evidence/behavior**: Tags name the criteria the tests serve. T012's tests serve AC-19, AC-20 and DAC-E2-10, as its plan text says. The `restated_possible` test serves research-store section 2.4 (AC-23 in the design's traceability table).
- **Impact**: A traceability sweep over-counts TC-COMP-047 and records E1-S1's universe-only test case as implemented by classification guards. The unplanned test is filed under a criterion it does not prove. No gate effect.
- **Required remediation**: Optional. Re-tag the five T012 tests to AC-19, AC-20 or DAC-E2-10 (keep TC-COMP-047 on the universe cases). Re-tag or annotate the `restated_possible` test as a design-section 2.4 extra.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T013, justified**:
  - The `status='maybe'` case asserts `factor_classification_shape` instead of the plan's `factor_classification_status_known`. PostgreSQL reports CHECK violations in constraint-name order, and the shape CHECK is false for any status outside the two values. `status_known` therefore cannot be reported for any insertable row. A code comment at `test_research_constraints.py:706-707` records this.
  - "All four tables refuse a `set_id`" is met for the three tables that carry a `set_id` FK.
- **T017(c) and (d), justified**: these edits were already made by CAP-002-E1-S1 under DEC-0187, in equivalent form. The plan says to skip "any already done by E1-S1".
- **Unplanned test, justified**: `test_restated_possible_defaults_to_false_on_inputs_and_classifications` pins a research-store 2.4 default that no other test pins behaviourally. Its tag is IR-002.
- **T010 deviation, unjustified**: the plan's "Use the existing helper" instruction was not followed (IR-001).
- **Decisions**: DEC-0110 and DEC-0092 justify T017; both are reviewed and `upheld`. `5be5069` carries both trailers in its final paragraph. `decisions show` reports drifted commit caches for both.
- **Bookkeeping**: the story `status` is `in-review`, and the approval revision is unchanged. All 21 task boxes are checked; 20 tasks are VERIFIED and T010 is PARTIAL.
- **No out-of-scope files**.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**:
  - Run `$story-coding` rework for CAP-002-E2-S1 with `CAP-002-E2-S1-tasks.md` and this report, and resolve IR-001. IR-002 is optional.
  - Record the rework as a new TDD-evidence cycle, with RED shown for the mis-anchored glob variants.
  - Set `last_reworked_review` to this report, then rerun `$adversarial-review` against the same base.
  - Have the rerun execute `uv build` where a permission rule allows it, so the sdist half is verified.
  - **Owner:** commit this report on the story branch and push the branch. Adversarial review for this story stays at this version until the report is committed.
- **Warnings accepted downstream**: N/A
