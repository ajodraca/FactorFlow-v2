---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S1-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-20
updated: 2026-10-20
story_id: "CAP-002-E1-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-10-20T13:32:33Z"
reviewed_head: "2be99e85c0aa88ceb1e62b1985901cae20641d82"
review_base: "e452ca9411e6919255d99de8dc333effeceb2db1"
reviewed_state_revision: "sha256:64d45a526a77de7707b3b3e043b8f48272e60c9632ce1b4d55a40a66e3c28067"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E1-S1
    artifact_version: 2
    content_revision: sha256:544863155caa450e0b9a020e3d4a834d4e78427f05776afa1dfce9ae139e0f1a
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-20T13:32:33Z
  source_artifacts:
    - id: CAP-002-E1-S1
      version: "2 (sha256:544863155caa450e0b9a020e3d4a834d4e78427f05776afa1dfce9ae139e0f1a)"
    - id: CAP-002-E1-S1-tasks
      version: "1 (sha256:19f1efb10fb0e0d78a48030699f3961b9f0beb1146e516eb7ea81e1402679b5a)"
    - id: CAP-002-E1-S1-tdd-evidence
      version: "1 (cycles 1 to 5)"
    - id: CAP-002-E1-S1-implementation-review
      version: "2"
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

# Implementation Review: CAP-002-E1-S1 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 12/12 verified |
| Required validation | 6/6 passed |

The rework resolves the one blocking v2 finding, and the three optional ones too, on current evidence.

- **v2/IR-001 (HIGH) is resolved.** TC-COMP-018 now builds the shipped set the way setuptools does. It expands each package-data glob with `glob(<escaped package root>/<pattern>, recursive=True)`, the same call the cached setuptools 84.0.0 and 84.2.0 `build_py.find_data_files` make. Every `.sql` file in a `sql/` directory must be a member of that set.
  - The v2 survivors `pkg-coverage-glob-one-level` and `pkg-coverage-glob-top-level` are now killed, along with three new reviewer mutants: `dir-only`, `wrong-ext` and `case`.
  - A differential probe built ten real wheels with different `coverage/sql` glob variants. The guard agreed with the wheel contents for nine. The tenth (`Coverage/sql/*.sql`) differs only on macOS's case-insensitive filesystem, where the guard fails closed. Its verdict is correct for a case-sensitive release build.
  - The module passes under real pytest on Python 3.12.14, and the whole `-m 'not postgres'` suite passes on 3.12.14: 830 passed.
- **The three optional v2 findings (IR-002 to IR-004) are resolved.** All four v2 behavioural survivors are now killed by tests that assert behaviour rather than text: `created-unique-global`, `instrument-fk-dropped`, `event-id-not-pk` and `universe-id-nullable`.
- **Validation passes.** All six required commands pass, the TDD-evidence lint is clean, and the gate mutation run kills 31 of 32 mutants. The survivor (`pkg-static-glob-one-level`) mutates the `api/static/**/*` token. That token is byte-identical to `e452ca9` and was introduced by CAP-001-E1-S9, so it lies outside this story's change set (see Scope and Plan Deviations).

One LOW finding remains. Three of the four tests added in the rework are tagged `# Implements TC-COMP-046`, but TC-COMP-046 specifies only the named CHECK constraints, and these tests exercise a foreign key, a NOT NULL column and the primary key.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1.md` (v2, approved, revision `sha256:544863155caa450e0b9a020e3d4a834d4e78427f05776afa1dfce9ae139e0f1a`, unchanged since approval) |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1-tasks.md` (v1, `last_reworked_review: CAP-002-E1-S1-implementation-review-v2.md`) |
| Component | `FactorFlow-v2` (module `research-store`, migration `0005`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S1-run-20261020T005515Z` |
| HEAD | `2be99e85c0aa88ceb1e62b1985901cae20641d82` (`story-coding(CAP-002-E1-S1): rework v2 IR-001 setuptools glob semantics in TC-COMP-018, IR-002..004`) |
| Review base | `e452ca9411e6919255d99de8dc333effeceb2db1` (FactorFlow-v2 `main` = `origin/main`). Resolved with `pipeline-state.py review-base --base-ref e452ca9411e6919255d99de8dc333effeceb2db1`; `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean: no staged, unstaged or untracked non-ignored files before or after validation. Two empty `.claude/.cc-writes/` directories in the story and evidence directories are tool artifacts that git does not see |
| Changed files reviewed | 29 (5 commits: `96509c4` code, `f370a92` v1 report, `2466ff3` rework 1, `6d412bb` v2 report, `2be99e8` rework 2) |

This is an attended run. The owner chose to finish the story outside the supervised run because that run's continuation base already contained the story. Its base is therefore `main`, the story's true base, and this review covers the whole story change set `e452ca9..HEAD`. Every one of the 5 commits names only `CAP-002-E1-S1`. v2's integration-branch caveat (a supplied base that resolved to HEAD) does not apply here.

### Changed Files

`docs/...` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/db/migrations/0005_universes.sql` | added | AC-3, AC-6, DAC-E1-S1-1 to -6; T008 |
| `pyproject.toml` | modified (line 33: one package-data entry appended; word diff shows nothing else changed) | DAC-E1-S1-7; T009 (DEC-0088) |
| `tests/unit/test_migration_0005_matches_design.py` | added | DAC-E1-S1-5; T001 (TC-COMP-017) |
| `tests/unit/test_package_data_ships_sql.py` | added; reworked in `2466ff3` and `2be99e8` | DAC-E1-S1-7; T002 (TC-COMP-018); v1/IR-001, v2/IR-001 |
| `tests/unit/test_research_sql_is_append_only.py` | added; MERGE pattern and two cases added in `2be99e8` | DAC-E1-S1-4, DAC-E1-10; T003 (TC-COMP-047); v2/IR-003 |
| `tests/integration/test_research_constraints.py` | added; four tests added in `2be99e8` | AC-3, AC-6, DAC-E1-S1-2, -3; T004 (TC-COMP-046, TC-COMP-034); v2/IR-004 |
| `tests/integration/test_research_migrations_apply.py` | added; reworked in `2466ff3` | DAC-E1-S1-1, -6; T005 (TC-COMP-045, TC-COMP-048); v1/IR-002 |
| `tests/unit/test_migration_filenames.py` | modified (+1 list entry) | DAC-E1-S1-1; T006 (DEC-0092) |
| `tests/unit/test_distribution_contents.py` | modified (tuple entry, docstring, versions literal) | DAC-E1-S1-1; T007 (DEC-0092) |
| `tests/unit/test_migrator_discover.py` | modified (one line) | DAC-E1-S1-1; DEC-0187 (PROVISIONAL) |
| `tests/integration/test_migrations_apply.py` | modified (one line) | DAC-E1-S1-1; DEC-0187 (PROVISIONAL) |
| `docs/.../stories/CAP-002-E1-S1.md` | modified (`status: planning` to `in-review`) | story-coding status lifecycle |
| `docs/.../stories/CAP-002-E1-S1-tasks.md` | modified (12 checkboxes; `updated`; `last_reworked_review` now v2) | T001 to T012 bookkeeping; rework marker |
| `docs/.../stories/CAP-002-E1-S1-tdd-evidence.yaml` | added (cycles 1 to 5) | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/cycle-1.patch` to `cycle-5.patch` | added (5 files) | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/red-cycle-1-migration.log` to `red-cycle-5-setuptools-glob.log`, `green-cycle-5-python312.log` | added (6 files) | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/mutation-cycle-1-results.json`, `mutation-cycle-5-results.json` | added (2 files) | T012 (mutation evidence) |
| `docs/.../stories/CAP-002-E1-S1-implementation-review-v1.md`, `-v2.md` | added (`f370a92`, `6d412bb`) | Prior gate reports (adversarial-review stage output) |

Rework delta `6d412bb..2be99e8`, examined line by line:
- three test modules: `test_package_data_ships_sql.py`, `test_research_sql_is_append_only.py` and `test_research_constraints.py`;
- the tasks-file front matter;
- cycle 5 of the TDD evidence, with its four new evidence files.

No production file and no delivered test changed in the rework.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-3 | SATISFIED | `0005_universes.sql:1-4` (each `universe` has its own `universe_id`); `:10` `instrument_id` carries no uniqueness; `:34-37` the single-created and single-retired indexes are per `universe_id` | `tests/integration/test_research_constraints.py::test_two_universes_may_each_be_created` (new) and `::test_one_instrument_may_belong_to_two_universes` | "More than one named universe" is now pinned by behaviour: the new test kills `created-unique-global` in the behavioural-only run |
| AC-6 | SATISFIED | `0005_universes.sql:6-28`: an append-only event log with an identity `event_id` primary key and an America/Chicago `recorded_on`. Removing a member and retiring a universe are recorded as events, never as deletions | `test_research_constraints.py::test_a_valid_lifecycle_is_accepted_and_events_are_ordered`, `::test_an_event_id_is_never_reused` (new), `::test_an_event_without_a_universe_is_refused` (new); `tests/unit/test_research_sql_is_append_only.py::test_research_sql_is_append_only` | As-of replay belongs to CAP-002-E1-S2. `recorded-on-utc` is pinned only by TC-COMP-017 (see Test Quality) |
| DAC-E1-10 | SATISFIED | No `UPDATE`, `DELETE`, upsert or `MERGE … THEN UPDATE/DELETE` against `universe` or `universe_event` anywhere under `src/factorflow/` (the guard passes on the tree) | `test_research_sql_is_append_only.py::test_research_sql_is_append_only` scans every `.sql` and `.py` with `rglob` over `RESEARCH_TABLES = ("universe_event", "universe")` | Reviewer mutant `dml-merge-universe-event` (a MERGE … THEN DELETE appended to `0005`) is killed by this test in the behavioural-only run |
| DAC-E1-S1-1 | SATISFIED | `0005_universes.sql` is additive only: CREATE TABLE, CREATE INDEX and COMMENT ON | `tests/integration/test_research_migrations_apply.py::test_migration_0005_applies_without_touching_cap_001_rows`: `apply_pending` returns `[5]`, the version 5 row carries the file checksum, all 11 CAP-001 tables are unchanged apart from the one new `applied_migrations` row, and the new tables are empty | Kills `dml-owner-setting`, `dml-coverage-segment` and `dml-update-daily-bar` behaviourally |
| DAC-E1-S1-2 | SATISFIED | `0005_universes.sql:16-27`: five named CHECKs | `test_research_constraints.py::test_malformed_event_is_refused_by_its_named_constraint` (11 cases, each asserting `CheckViolation` and `diag.constraint_name`) | All six CHECK mutants are killed behaviourally |
| DAC-E1-S1-3 | SATISFIED | `0005_universes.sql:34-37`: partial unique indexes | `test_research_constraints.py::test_a_second_created_or_retired_event_is_refused` (`UniqueViolation` plus the index name) | `single-created-on-renamed` and `single-retired-not-unique` are killed behaviourally |
| DAC-E1-S1-4 | SATISFIED | As for DAC-E1-10 | `test_research_sql_is_append_only.py::test_guard_detects_prohibited_research_mutation` (10 cases: UPDATE, UPDATE ONLY, DELETE FROM, DELETE FROM ONLY, quoted schema-qualified, upsert, MERGE … THEN UPDATE, MERGE … THEN DELETE, across both tables) and `::test_guard_ignores_other_tables_and_lookalike_names` (which now includes a MERGE … THEN INSERT) | none |
| DAC-E1-S1-5 | SATISFIED | `0005_universes.sql` is byte-identical to the section 2.3 block | `tests/unit/test_migration_0005_matches_design.py`: verbatim comparison, a check that the block was found, 22 named elements, no length bound | Kills every `0005` mutant in the gate run |
| DAC-E1-S1-6 | SATISFIED | The delivered migrator applies `0005` cleanly | `test_research_migrations_apply.py::test_second_migrator_run_after_0005_applies_nothing`: `(0, "schema current at version 5")`, `applied_migrations` unchanged | none |
| DAC-E1-S1-7 | SATISFIED | `pyproject.toml:33` lists `universes/sql/*.sql`; the wheel built from HEAD ships all 5 `coverage/sql/*.sql` files and all 5 migrations | `tests/unit/test_package_data_ships_sql.py` (9 tests) passes on Python 3.13.7 and 3.12.14; the matcher agrees with setuptools (differential wheel probe, 5 glob mutants killed) | v2/IR-001 resolved |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/unit/test_migration_0005_matches_design.py` | Unchanged since v1. Verbatim, block-found, named-element and no-length-bound checks are present; `design_sql.py` is untouched |
| T002 | complete | VERIFIED | `tests/unit/test_package_data_ships_sql.py:23-41` (`uncovered_sql_files` builds `shipped` with `glob(f"{escape(str(package_root))}/{pattern}", recursive=True)`); rule (a) `:45-46`; rule (b) `:50-52`; synthetic tests `:56-85` | Justified deviation: the plan offered `fnmatch`/`PurePath.match`, but neither meets the plan's stated purpose (v2/IR-001), and glob expansion does. The synthetic look-alike cases (`widgets/*.sql`, `*.sql`) fail on the v2 matcher (RED log) |
| T003 | complete | VERIFIED | `tests/unit/test_research_sql_is_append_only.py:16-43` | Still one `RESEARCH_TABLES` constant. Adds `MERGE_MUTATION_PATTERN` (`:29-33`), which goes beyond the plan's three patterns. That addition is justified by DAC-E1-10 ("no UPDATE or DELETE") and v2/IR-003. The delivered guard is untouched (DEC-0064) |
| T004 | complete | VERIFIED | `tests/integration/test_research_constraints.py` | Every planned refusal and positive control is present. Four controls requested by v2/IR-004 are added at `:178-230`. Migrations are still filtered to versions 1 to 5 |
| T005 | complete | VERIFIED | `tests/integration/test_research_migrations_apply.py` | Unchanged since v2. The snapshot covers all 11 CAP-001 tables, and the module-level `seed_cap_001_rows` helper is kept for CAP-002-E2-S1 |
| T006 | complete | VERIFIED | `tests/unit/test_migration_filenames.py:48` | One list entry (DEC-0092) |
| T007 | complete | VERIFIED | `tests/unit/test_distribution_contents.py:28,80,99` | Tuple entry, docstring and versions literal (DEC-0092) |
| T008 | complete | VERIFIED | `src/factorflow/db/migrations/0005_universes.sql` | Verbatim copy of the design block. No BEGIN or COMMIT, no `%`, no length CHECK |
| T009 | complete | VERIFIED | `pyproject.toml:33` | Glob appended last and nothing else changed (word diff). `src/factorflow/universes/` was not created |
| T010 | complete | VERIFIED | `src/factorflow/db/migrations/README.md` unchanged | No checker reads it |
| T011 | complete | VERIFIED | The reviewer reran all six commands, and all pass | The tree holds only the planned files plus the justified extras listed under Scope and Plan Deviations |
| T012 | complete | VERIFIED | `CAP-002-E1-S1-tdd-evidence.yaml` cycles 1 to 5; `CAP-002-E1-S1-evidence/` | The lint is clean with `--require-logs`. Cycle 5 checks: <br>- `diff_sha256` `421ea013…` equals the SHA-256 of `cycle-5.patch`. <br>- `cycle-5.patch` equals `git diff 6d412bb 2be99e8 -- tests src pyproject.toml` once index lines are stripped. <br>- `git log -S <diff_sha256>` finds `2be99e8`. <br>- `red_log_sha256`, the `logs` entry and `results_sha256` all match their files. <br>- Both the RED and GREEN logs are captured pytest output on Python 3.12.14 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_migration_0005_matches_design_verbatim` / TC-COMP-017 | ADEQUATE | Exact text equality with the design's own block; the first test to fail for every `0005` mutant under `-x` | none |
| `test_design_block_is_actually_read` / TC-COMP-017 | ADEQUATE | Stops the comparison from passing vacuously | none |
| `test_migration_0005_names_every_element_of_section_2_3` (22) / TC-COMP-017 | ADEQUATE | Substring presence of every named element | Backed by the verbatim test |
| `test_migration_0005_invents_no_name_length_bound` / TC-COMP-017 | ADEQUATE | No `octet_length` and no `length(` | none |
| `test_every_sql_directory_matches_a_package_data_glob` / TC-COMP-018 | ADEQUATE | Expands each glob as setuptools does and requires every file of every `sql/` directory to be in the shipped set | Kills `pkg-coverage-glob-{dropped,one-level,top-level,dir-only,wrong-ext,case}` |
| `test_universes_sql_glob_is_listed_before_its_directory_exists` / TC-COMP-018 | ADEQUATE | Rule (b) | Kills `pkg-universes-glob-dropped` and `pkg-universes-glob-typo` |
| `test_guard_reports_a_sql_directory_no_glob_covers` / TC-COMP-018 | ADEQUATE | Reports an uncovered `widgets/sql/read.sql` and accepts `widgets/sql/*.sql` | none |
| `test_guard_reports_a_glob_that_only_looks_like_it_covers_the_file` (3) / TC-COMP-018 | ADEQUATE | `widgets/*.sql` and `*.sql` are reported uncovered; both cases fail on the v2 `fnmatchcase` matcher (RED log) | The third case, `widgets/s*/x/*.sql`, is rejected by `fnmatch` as well, so it adds no discriminating power. Harmless |
| `test_guard_accepts_a_glob_setuptools_expands_to_the_file` (3) / TC-COMP-018 | ADEQUATE | `widgets/**/*.sql`, `**/*.sql` and `widgets/*/*.sql` are accepted | The `[**/*.sql]` case kills a reviewer probe that sets `recursive=False`. Removing `escape()` is equivalent for paths without glob metacharacters, which covers the repository and pytest's `tmp_path` |
| `test_research_sql_is_append_only` / TC-COMP-047 | ADEQUATE | Whole-tree scan of every `.sql` and `.py` file for both tables | Kills `dml-merge-universe-event` |
| `test_guard_detects_prohibited_research_mutation` (10) / TC-COMP-047 | ADEQUATE | Exact match text for each statement shape and table; the MERGE cases fail without the pattern (RED log) | none |
| `test_guard_ignores_other_tables_and_lookalike_names` / TC-COMP-047 | ADEQUATE | Another table, `universe_event_foo`, a plain INSERT and a MERGE … THEN INSERT are all ignored | none |
| `test_malformed_event_is_refused_by_its_named_constraint` (11) / TC-COMP-046 | ADEQUATE | Exception type plus `diag.constraint_name` for each CHECK; kills all six CHECK mutants behaviourally | none |
| `test_a_second_created_or_retired_event_is_refused` (2) / TC-COMP-034 | ADEQUATE | `UniqueViolation` plus the index name | none |
| `test_a_valid_lifecycle_is_accepted_and_events_are_ordered` / TC-COMP-046, TC-COMP-034 | ADEQUATE | The full valid sequence is accepted, and `event_id` is strictly increasing | `recorded_on` is asserted only as non-null (see the `recorded-on-utc` note below) |
| `test_one_instrument_may_belong_to_two_universes` / AC-3 | ADEQUATE | The same instrument is a member of two universes | none |
| `test_two_universes_may_each_be_created` / AC-3 (new) | ADEQUATE | Two universes each hold a `created` event | Kills `created-unique-global` |
| `test_a_member_event_for_an_unknown_instrument_is_refused` / tagged TC-COMP-046 (new) | ADEQUATE | `ForeignKeyViolation` naming `universe_event_instrument_id_fkey`; all CHECKs pass for this row, so only the FK can refuse it | Kills `instrument-fk-dropped`. Its TC tag is wrong (IR-001) |
| `test_an_event_without_a_universe_is_refused` / tagged TC-COMP-046 (new) | ADEQUATE | `NotNullViolation` on column `universe_id` | Kills `universe-id-nullable`. Its TC tag is wrong (IR-001) |
| `test_an_event_id_is_never_reused` / tagged TC-COMP-046 (new) | ADEQUATE | Inserts a duplicate `event_id` with `OVERRIDING SYSTEM VALUE` into a second universe; asserts `UniqueViolation` on `universe_event_pkey` | Kills `event-id-not-pk`. Its TC tag is wrong (IR-001) |
| `test_migration_0005_applies_without_touching_cap_001_rows` / TC-COMP-045 | ADEQUATE | Exactly `[5]` applied; the version 5 checksum; all 11 CAP-001 tables compared as full-row text | Kills all three `dml-*` mutants on CAP-001 tables |
| `test_second_migrator_run_after_0005_applies_nothing` / TC-COMP-048 | ADEQUATE | The second run's exit code and exact message; `applied_migrations` unchanged | none |
| `test_e5_real_migration_inventory_is_contiguous_through_four` (T006) | ADEQUATE | Exact five-file inventory | none |
| `test_wheel_carries_the_migrations_and_nothing_under_tests`, `test_installed_layout_resolves_its_migrations` (T007) | ADEQUATE | The wheel carries `0005`, and the installed layout resolves versions 1 to 5 | Kills `pkg-migrations-glob-dropped` |
| `test_migrations_dir_resolves_inside_the_package_with_unchanged_checksums` (DEC-0187) | ADEQUATE | Versions 1 to 4 are still pinned exactly | none |
| `test_new_migrations_apply_after_0002_without_rewriting_rows` (DEC-0187) | ADEQUATE | `[:4]` keeps the `[1, 2]`, `[3, 4]` and `[]` assertions | none |

**Mocks and determinism.** No test uses mocks. Every integration test runs against PostgreSQL 16 through testcontainers, with a fresh database per test. Beyond the controlled container, no test depends on time, test order or the network. The new FK test derives its unknown id as `instrument_id + 1000` in a fixture that holds exactly one instrument, so the id cannot collide.

**TDD evidence.** The cycle-5 RED and GREEN logs are captured runner output, not summaries.
- RED (`red-cycle-5-setuptools-glob.log`): `test_package_data_ships_sql.py` 2 failed, 7 passed; `test_research_sql_is_append_only.py` 2 failed, 10 passed.
- GREEN (`green-cycle-5-python312.log`): 9 passed and 12 passed; the isolated 3.12 `--extra dev` run of `-m 'not postgres'` gives 830 passed.

This reviewer reproduced the GREEN half independently with the same commands. The cycle notes `reviewed_patch` must stay an absolute path, and that claim is true. `scripts/check-tdd-evidence.py:796-802` resolves the path from the harness working directory, but `:809` runs `git -C <repo> apply <path>` (`:267`), which resolves a relative path against the component repo. No single relative path satisfies both, so this is a harness limitation, not a story defect.

**Mutation (TEST-TDD-005/006).**
- **Mutant set.** `mutation-run.py generate` over `e452ca9..HEAD` yields 4 catalogue mutants, all edits to comment text in `0005`. The reviewer reused the v2 reviewer's 22 manual mutants and added 6:
  - `pkg-coverage-glob-dir-only`, `pkg-coverage-glob-wrong-ext` and `pkg-coverage-glob-case`;
  - `pkg-static-glob-one-level` and `pkg-static-glob-dropped`;
  - `dml-merge-universe-event`.
- **Gate run** (the nine focused suites, 83 tests in each baseline): 31 of 32 killed. The one survivor, `pkg-static-glob-one-level`, is outside the story's change set (Scope and Plan Deviations).
- **Behavioural-only run** (constraints, apply, package-data and append-only suites, with no verbatim guard): 24 of 32 killed. The 8 survivors are:
  - the 4 comment edits, which are equivalent;
  - `pkg-migrations-glob-dropped` and `pkg-static-glob-dropped`, both killed in the gate run by T007's wheel test;
  - `pkg-static-glob-one-level`, which is out of scope;
  - `recorded-on-utc`.
- **`recorded-on-utc` is a residual, not a gap.** TC-COMP-017's verbatim test kills it in the gate run. A behavioural kill would depend on the time of day, because UTC and America/Chicago dates differ for only part of each day. v2/IR-004 did not ask for it.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed. The first, sandboxed attempt exited 1 only because the command sandbox denied bash's heredoc temp file; it was rerun unsandboxed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1.md --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref e452ca9411e6919255d99de8dc333effeceb2db1` | harness root | 0 | PASS | `e452ca9411e6919255d99de8dc333effeceb2db1`; `git merge-base --is-ancestor` exit 0; equals `main` and `origin/main` |
| `uv run pytest tests/unit/test_migration_0005_matches_design.py tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_migration_filenames.py tests/unit/test_distribution_contents.py tests/unit/test_migrator_discover.py -q -p no:cacheprovider` | component root | 0 | PASS | 61 passed (Python 3.13.7) |
| `uv run --offline --isolated --python 3.12.14 --with pytest pytest --noconftest -p no:cacheprovider -v tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_migration_0005_matches_design.py tests/unit/test_migration_filenames.py` | component root | 0 | PASS | 51 passed on Python 3.12.14 |
| `uv run pytest tests/integration/test_research_constraints.py tests/integration/test_research_migrations_apply.py tests/integration/test_migrations_apply.py -v -p no:cacheprovider` | component root | 0 | PASS | 22 passed (19 + 2 + 1) |
| `uv run pytest -m 'not postgres' -q -p no:cacheprovider` | component root | 0 | PASS | 830 passed, 295 deselected (Python 3.13.7) |
| `uv run --offline --isolated --python 3.12.14 --extra dev pytest -m 'not postgres' -q -p no:cacheprovider` | component root | 0 | PASS | 830 passed, 295 deselected. The same environment reports `sys.version` 3.12.14. The v2 resolution gap is closed |
| `uv run pytest -m postgres -q -p no:cacheprovider` | component root | 0 | PASS | 295 passed, 830 deselected (198.67 s) |
| `uv run ruff check .` | component root | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | component root | 0 | PASS | 198 files already formatted |
| `uv run mypy src` | component root | 0 | PASS | No issues in 47 source files |
| `uv run mypy tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_migration_0005_matches_design.py tests/integration/test_research_constraints.py tests/integration/test_research_migrations_apply.py` | component root | 0 | PASS | No issues in 5 files (diagnostic at `python_version = "3.12"`) |
| `uv build --out-dir <scratch>/v3/uv-build-dist` | component root | 0 | PASS | sdist and wheel built. The wheel ships 10 `.sql` files: 5 under `coverage/sql/` and migrations `0001` to `0005`. Output went to a scratch directory, so the user's `dist/` is untouched |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base e452ca9411e6919255d99de8dc333effeceb2db1 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `shasum -a 256` on the four cycle-5 evidence files; `git diff 6d412bb 2be99e8 -- tests src pyproject.toml` compared with `cycle-5.patch` (index lines stripped); `git log -S 421ea013…` | evidence dir / component root | 0 | PASS | All four hashes equal the recorded values; the diffs are identical; `2be99e8` carries the fingerprint |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range e452ca9411e6919255d99de8dc333effeceb2db1..HEAD --cycle review --out <scratch>/v3/mutants-catalogue.json` | harness root | 0 | PASS | 4 catalogue mutants (off-by-one in comment text). Merged with 28 manual mutants into `<scratch>/v3/mutants.json` (32) |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/v3/mutants.json --jobs 4 --timeout 900 --work-root <scratch>/v3/mut-work --command 'cd {workdir} && PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=src <component>/.venv/bin/python -m pytest -q -x -p no:cacheprovider -m "postgres or not postgres" <nine focused files>' --out <scratch>/v3/results-gate.json` | harness root | 3 | PASS (one out-of-scope survivor) | 31 killed, 1 survived (`pkg-static-glob-one-level`, see Scope). All 4 baselines report 83 passed. Results sha256 `a190621a03a602fcf84803b882f0559349fabaef804287d5dcee2421f703d289` |
| Same mutants, behavioural suites only (`test_research_constraints.py`, `test_research_migrations_apply.py`, `test_package_data_ships_sql.py`, `test_research_sql_is_append_only.py`) | harness root | 3 | PASS (diagnostic) | 24 killed, 8 survived (classified under Test Quality). Results sha256 `aadc769df7c28de3c98c2566316e2137c388cd2ed43b1e912c164e1421a372c5` |
| Differential probe: for 10 `coverage/sql` glob variants, `uv build --wheel --offline` on a copy of `src/` plus the mutated `pyproject.toml`, compared with `uncovered_sql_files` (module loaded read-only, `-I`, no bytecode) | scratch | 0 | PASS (diagnostic) | 9 of 10 agree. `Coverage/sql/*.sql` disagrees only because macOS is case-insensitive: the local wheel lands in the lowercase build directory, while the guard reports uncovered, which is the correct verdict for a case-sensitive build |
| `uv build --wheel --offline` on copies of `src/` (with the locally built `api/static/assets/`), unmodified and with `"api/static/**/*"` changed to `"api/static/*"` | scratch | 0 / 0 | PASS (diagnostic) | HEAD wheel: 20 `api/static/` files, 19 under `assets/`. Mutant wheel: 1 file, `index.html` only. The out-of-scope survivor is non-equivalent |
| Matcher probes on scratch copies of `test_package_data_ships_sql.py` (`recursive=False`; no `escape`), synthetic tests only (`-k guard`) | scratch | 1 | PASS (diagnostic) | The `recursive=False` copy fails at `[**/*.sql]`, so it is killed; the no-`escape` copy passes, and is equivalent for metacharacter-free paths |
| `scripts/sdd decisions show --project factorflow-v2 DEC-0092` / `DEC-0187` | harness root | 0 / 0 | PASS | DEC-0092: applied, reviewed, `upheld`, with a commit-cache drift note. DEC-0187: open, owner review pending. `2be99e8` carries both trailers in its final paragraph and is listed for both |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | `sha256:544863155caa450e0b9a020e3d4a834d4e78427f05776afa1dfce9ae139e0f1a` (unchanged since approval) |
| `uv run pytest` (full suite) | component root | N/A | NOT RUN | Covered exactly by the two marker halves (830 + 295 = 1125) |
| `npm` / `npx` commands from the tech stack | component root | N/A | NOT RUN | The change set touches no frontend file, and the task plan lists none |

Every `uv`, Docker-backed and mutation command ran outside the command sandbox, because the sandbox denies uv's cache at `~/.cache/uv` and the Docker socket. `<scratch>` is this session's scratchpad directory outside the component repository.

### Validation Side Effects

- **Before:** HEAD `2be99e85c0aa88ceb1e62b1985901cae20641d82`, branch `usr/alvaro-de-jodra/CAP-002-E1-S1-run-20261020T005515Z`, 0 porcelain entries, fingerprint `sha256:64d45a526a77de7707b3b3e043b8f48272e60c9632ce1b4d55a40a66e3c28067`.
- **After:** the same HEAD, branch, porcelain (0 entries) and fingerprint.
- **Unexpected tracked-file changes:** none.
- **Ignored-path effects only:**
  - `uv build` wrote under `build/` and `src/factorflow.egg-info/`;
  - pytest, mypy and ruff wrote their caches;
  - uv created and discarded isolated 3.12 environments under `~/.cache/uv/builds-v0`.
- **Outside the repository:** mutation clones, probe wheels and results were written under the scratchpad.

The only file this review adds to the component repo is this report.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · **total 1**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | LOW | Three rework tests that exercise a foreign key, a NOT NULL column and the primary key are tagged `# Implements TC-COMP-046`, which specifies only the named CHECK constraints |

### IR-001 — Rework tests carry a TC-COMP-046 tag the test case does not specify

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-3, AC-6 (DAC-E1-S1-2 by mislabel)
- **Tasks**: T004
- **Files**: `tests/integration/test_research_constraints.py:193` (`test_a_member_event_for_an_unknown_instrument_is_refused`), `:206` (`test_an_event_without_a_universe_is_refused`), `:215` (`test_an_event_id_is_never_reused`)
- **Claim challenged**: Each of the three tests implements TC-COMP-046.
- **Observed evidence**:
  - TC-COMP-046 ("Universe event CHECK constraints refuse malformed events", `tests/component/research-store-tests.md:113-131`) traces to DAC-E1-S1-2.
  - Its preconditions are the five CHECK cases, and its expected result is "The named CHECK constraint refuses it". It states "no further cases are invented".
  - The three tests assert `ForeignKeyViolation` on `universe_event_instrument_id_fkey`, `NotNullViolation` on `universe_id`, and `UniqueViolation` on `universe_event_pkey`. None of these is a CHECK constraint.
  - The fourth new test, `test_two_universes_may_each_be_created`, is tagged `# Implements AC-3`, following the module's existing convention.
- **Expected evidence/behavior**: The implementation-planning contract requires each test's traceability comment to name the test case it implements. The tests are valid and useful: they close v2/IR-004 and each kills its intended mutant. But they implement research-store section 2.3 column constraints that trace to AC-6 and AC-3, not TC-COMP-046.
- **Impact**: A reader or a later traceability sweep over-counts TC-COMP-046's implementation and cannot find the evidence for the FK, NOT NULL and primary-key properties under the criteria those properties serve. No gate effect.
- **Required remediation**: Optional. Re-tag the three tests to the criteria they serve, for example `# Implements AC-6` (and `AC-3` for the instrument FK), as the module already does for AC-3. Alternatively, record them as additional unit tests beyond the mandatory TCs. Keep `# Implements TC-COMP-046` on the CHECK cases only.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 | RESOLVED | `tests/unit/test_package_data_ships_sql.py:29-33` expands each glob with `glob(<escaped root>/<pattern>, recursive=True)`. The cached setuptools 84.0.0 and 84.2.0 `build_py.find_data_files:131` use `partial(glob, recursive=True)`. Evidence: <br>- **Mutants:** `pkg-coverage-glob-one-level` and `pkg-coverage-glob-top-level` are killed in both mutation runs, and so are the reviewer's new `dir-only`, `wrong-ext` and `case` mutants. <br>- **Synthetic case:** the look-alike case requested by v2 exists and fails on the v2 matcher (RED log). <br>- **Python 3.12:** the module passes under real pytest, and the full `-m 'not postgres'` suite passes on 3.12.14. <br>- **Differential probe:** the guard agrees with real wheel contents for 9 of 10 glob variants; the tenth fails closed |
| v2/IR-002 | RESOLVED | `red-cycle-5-setuptools-glob.log` and `green-cycle-5-python312.log` are captured pytest output on Python 3.12.14, and their hashes match the evidence. `reviewed_patch` remains absolute, and the harness requires it to: `check-tdd-evidence.py:796-809` resolves the path from the harness working directory for hashing but passes it to `git -C <repo> apply` |
| v2/IR-003 | RESOLVED | `test_research_sql_is_append_only.py:29-33` adds `MERGE_MUTATION_PATTERN`, and `:77-89` adds the `UPDATE ONLY`, MERGE … THEN UPDATE and MERGE … THEN DELETE cases. The MERGE cases fail without the pattern (RED log), and the guard kills the reviewer mutant `dml-merge-universe-event` across the tree |
| v2/IR-004 | RESOLVED | Four tests added at `test_research_constraints.py:178-230` kill `created-unique-global`, `instrument-fk-dropped`, `universe-id-nullable` and `event-id-not-pk` in the behavioural-only run; in v2 all four survived. `recorded-on-utc` stays pinned by TC-COMP-017 alone. v2's remediation did not include it, and any behavioural kill would depend on the time of day. The new tests' TC tag is reported as v3/IR-001 |

## Scope and Plan Deviations

- **Out-of-scope mutation survivor (observation, not a story finding).**
  - **What survives:** `manual:pkg-static-glob-one-level` (`"api/static/**/*"` changed to `"api/static/*"`). It is non-equivalent: a wheel built with real `api/static/assets/` ships `index.html` and none of the 19 asset files.
  - **Why it is outside this story:** the `api/static/**/*` token is byte-identical at `e452ca9`. `git diff --word-diff` shows the story only appended `"universes/sql/*.sql"`, and `git log -S` shows the token was introduced by CAP-001-E1-S9 (`528eb76`).
  - **Why no story test can kill it:** the test that should kill it is CAP-001's delivered `tests/unit/test_distribution_contents.py`, whose stub `api/static/` has no subdirectory. TC-COMP-018 covers only `sql/` directories, per DAC-E1-S1-7.
  - **No story test is weak:** this story did not author the gap, and none of its mandatory tests is the one meant to detect it. The owner may raise it against CAP-001's release-image tests.
- **T002** uses glob expansion instead of the plan's suggested `fnmatch`/`PurePath.match`. This is justified: v2/IR-001 showed both suggested matchers accept globs setuptools does not ship, which contradicts the plan's own stated purpose.
- **T003** adds a fourth pattern (MERGE) beyond the plan's "same three patterns". This is justified by DAC-E1-10 and v2/IR-003. The single `RESEARCH_TABLES` constant for CAP-002-E2-S1 is preserved.
- **T004** gains four controls beyond the plan, justified by v2/IR-004. Their tags are IR-001.
- **DEC-0092** justifies T006 and T007. The decision is reviewed (verdict `upheld`) and applied; `decisions show` reports a drifted commit cache.
- **DEC-0187** justifies the two one-line delivered-test edits. It is still PROVISIONAL and unreviewed by the owner. Both edits are unchanged since v1, and both keep the version 1 to 4 assertions exact.
- **Trailers.** `2be99e8` carries `Decision-Id: DEC-0092` and `Decision-Id: DEC-0187`, as do `96509c4` and the plan commit. Both trailers sit in the final paragraph, so git and `decisions show` see them. Because every story-coding commit now carries both trailers, `decisions revert DEC-0187` would revert the story and both of its reworks together. That is consistent, since `2be99e8` edits files that `96509c4` created.
- **Story and tasks bookkeeping.** The story `status` is `in-review`. All 12 task boxes are checked, and all 12 tasks are VERIFIED, so the bookkeeping is consistent.
- **No unjustified files** are in the change set.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**:
  - Run `$doc-sync` for CAP-002-E1-S1 with `CAP-002-E1-S1-tasks.md` and this report. Doc sync owns the `src/factorflow/db/migrations/README.md` file-table row (T010).
  - **Owner, before or alongside doc sync:** commit this report on the story branch and push the branch.
  - **Owner:** review DEC-0187, which is still PROVISIONAL, and run `scripts/sdd decisions verify` to refresh DEC-0092's drifted commit cache.
  - **Owner, optional:** raise the `api/static/**/*` observation against CAP-001's distribution tests.
- **Warnings accepted downstream**: IR-001 (LOW)
