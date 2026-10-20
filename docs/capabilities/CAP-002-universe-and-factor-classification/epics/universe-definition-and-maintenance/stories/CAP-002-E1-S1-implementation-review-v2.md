---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-20
updated: 2026-10-20
story_id: "CAP-002-E1-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-20T01:10:09Z"
reviewed_head: "2466ff39f60a5325a949ae000e6c2b322eaa9975"
review_base: "e452ca9411e6919255d99de8dc333effeceb2db1"
reviewed_state_revision: "sha256:425c6b34be7f97de4c90755b4942d4efc81d908420880cf964c33c0324dc8b85"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-10-20T01:10:09Z
  source_artifacts:
    - id: CAP-002-E1-S1
      version: "2 (sha256:544863155caa450e0b9a020e3d4a834d4e78427f05776afa1dfce9ae139e0f1a)"
    - id: CAP-002-E1-S1-tasks
      version: "1 (sha256:507cbd7b04c9bd113c18eb612b8c3cab0aef89ee935a7f31168f36d04d500d45)"
    - id: CAP-002-E1-S1-tdd-evidence
      version: "1 (cycles 1 to 4)"
    - id: CAP-002-E1-S1-implementation-review
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

# Implementation Review: CAP-002-E1-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 3 |
| Acceptance criteria | 9/10 satisfied |
| Planned tasks | 11/12 verified |
| Required validation | 6/6 passed |

Both v1 findings the rework targeted are resolved on current evidence. IR-001 (v1) is gone: the reworked TC-COMP-018 module passes 3/3 under real pytest on Python 3.12.14. The v1-reviewed module fails 2/3 there with the reported `AttributeError`, and mypy at the project's `python_version = "3.12"` is now clean. IR-002 (v1) is gone: TC-COMP-045 snapshots all 11 CAP-001 tables, and it now kills mutants that write into `owner_setting` and `coverage_segment`, two tables the v1 snapshot omitted. All six required validation commands pass.

The gate still fails on one new HIGH finding, which the IR-001 fix introduced. The replacement matcher `fnmatchcase(relative.as_posix(), glob)` lets `*` cross `/`. setuptools resolves package-data with `glob(pattern, recursive=True)`, where `*` does not. Two non-equivalent mutants of the changed `pyproject.toml:33` line survive every focused suite: `coverage/sql/*.sql` changed to `coverage/*.sql`, and to `*.sql`. A wheel built from the first mutant ships none of the five `coverage/sql/*.sql` files that `factorflow.coverage.gaps` and `factorflow.coverage.service` read at import. TC-COMP-018 still passes on it. The v1 matcher (`PurePath.full_match`) rejected both globs. The mandatory TC-COMP-018 is therefore `WEAK`, and DAC-E1-S1-7 is `PARTIAL`.

**Review-base caveat (not a code finding; the owner or driver must resolve it before the next review).** The driver-supplied `--base-ref usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261019T231500Z` resolves to `2466ff3`, which is this story's own HEAD. That leaves an empty review range. The run ledger shows why: `run_started` records `integration_base_ref: usr/alvaro-de-jodra/CAP-002-E1-S1-run-20261019T223047Z`, so this run's frozen integration base is the unreviewed story branch itself. This review therefore covers the story's actual change set from `e452ca9`. See Review Subject for the derivation.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1.md` (v2, approved, revision `sha256:544863155caa450e0b9a020e3d4a834d4e78427f05776afa1dfce9ae139e0f1a`, unchanged since v1) |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1-tasks.md` (v1, `last_reworked_review: CAP-002-E1-S1-implementation-review-v1.md`) |
| Component | `FactorFlow-v2` (module `research-store`, migration `0005`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S1-run-20261020T005515Z` |
| HEAD | `2466ff39f60a5325a949ae000e6c2b322eaa9975` (`story-coding(CAP-002-E1-S1): rework IR-001 3.12-compatible package-data matcher, IR-002 full CAP-001 snapshot`) |
| Review base | `e452ca9411e6919255d99de8dc333effeceb2db1` (see derivation below). The supplied `usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261019T231500Z` resolved via `pipeline-state.py review-base --base-ref` to `2466ff39f60a5325a949ae000e6c2b322eaa9975` = HEAD |
| Working tree | Clean: no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 24 (3 commits: `96509c4` code, `f370a92` v1 report, `2466ff3` rework) |

**Base derivation.** `git rev-list e452ca9..HEAD` holds exactly three commits, and each subject names only `CAP-002-E1-S1`. `e452ca9` has four independent sources:
- the `review_base` recorded by v1;
- the `base_commit` of `integration_started` in `run-20261019T223047Z`, the run in which this story was coded (frozen from `origin/main`);
- `git merge-base HEAD origin/main`;
- `git merge-base HEAD main`.

The supplied base cannot separate the story from unrelated work, because it contains the whole story. `mutation-run.py generate --range 2466ff3..HEAD` yields 0 mutants, and a review against it would assess nothing. No decision record was written: this reviewer's only permitted write is this report. The choice, its derivation and its consequence (Follow-Up) are recorded here.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/db/migrations/0005_universes.sql` | added | AC-3, AC-6, DAC-E1-S1-1 to -6; T008 |
| `pyproject.toml` | modified (line 33, one package-data entry) | DAC-E1-S1-7; T009 (DEC-0088) |
| `tests/unit/test_migration_0005_matches_design.py` | added | DAC-E1-S1-5; T001 (TC-COMP-017) |
| `tests/unit/test_package_data_ships_sql.py` | added; reworked in `2466ff3` | DAC-E1-S1-7; T002 (TC-COMP-018); v1 IR-001 |
| `tests/unit/test_research_sql_is_append_only.py` | added | DAC-E1-S1-4, DAC-E1-10; T003 (TC-COMP-047) |
| `tests/integration/test_research_constraints.py` | added | AC-3, DAC-E1-S1-2, -3; T004 (TC-COMP-046, TC-COMP-034) |
| `tests/integration/test_research_migrations_apply.py` | added; reworked in `2466ff3` | DAC-E1-S1-1, -6; T005 (TC-COMP-045, TC-COMP-048); v1 IR-002 |
| `tests/unit/test_migration_filenames.py` | modified (+1 list entry) | DAC-E1-S1-1; T006 (DEC-0092, PROVISIONAL) |
| `tests/unit/test_distribution_contents.py` | modified (tuple entry, docstring, versions literal) | DAC-E1-S1-1; T007 (DEC-0092, PROVISIONAL) |
| `tests/unit/test_migrator_discover.py` | modified (one line) | DAC-E1-S1-1; DEC-0187 (PROVISIONAL) |
| `tests/integration/test_migrations_apply.py` | modified (one line) | DAC-E1-S1-1; DEC-0187 (PROVISIONAL) |
| `docs/.../stories/CAP-002-E1-S1.md` | modified (`status: planning` to `in-review`) | story-coding status lifecycle |
| `docs/.../stories/CAP-002-E1-S1-tasks.md` | modified (12 checkboxes; `updated`, `last_reworked_review`) | T001 to T012 bookkeeping; rework marker |
| `docs/.../stories/CAP-002-E1-S1-tdd-evidence.yaml` | added (cycles 1 to 4) | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/cycle-1.patch` to `cycle-4.patch` | added (4 files) | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/red-cycle-1-migration.log`, `red-cycle-2-package-data.log`, `red-cycle-3-append-only.log`, `red-cycle-4-python312.log` | added (4 files) | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/mutation-cycle-1-results.json` | added | T012 (mutation evidence) |
| `docs/.../stories/CAP-002-E1-S1-implementation-review-v1.md` | added (`f370a92`) | Prior gate report (adversarial-review stage output) |

`docs/...` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance`.

Rework delta `f370a92..2466ff3`: `tests/unit/test_package_data_ships_sql.py` (matcher), `tests/integration/test_research_migrations_apply.py` (snapshot), the tasks-file front matter, cycle 4 of the TDD evidence, `cycle-4.patch` and `red-cycle-4-python312.log`. No production file changed in the rework.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-3 | SATISFIED | `0005_universes.sql:1-4` (`universe` keyed by its own `universe_id`); `:10` `instrument_id` has no uniqueness; `:34-37` single-created/retired indexes are per `universe_id` | `tests/integration/test_research_constraints.py::test_one_instrument_may_belong_to_two_universes`; `tests/unit/test_migration_0005_matches_design.py::test_migration_0005_matches_design_verbatim` | "More than one named universe" is pinned only by the verbatim guard (IR-004, LOW) |
| AC-6 | SATISFIED | `0005_universes.sql:6-28` append-only event log with identity `event_id` and America/Chicago `recorded_on`; removal and retirement are event types, not deletions | `test_research_constraints.py::test_a_valid_lifecycle_is_accepted_and_events_are_ordered`; `tests/unit/test_research_sql_is_append_only.py::test_research_sql_is_append_only` | As-of replay belongs to CAP-002-E1-S2 |
| DAC-E1-10 | SATISFIED | No `UPDATE`/`DELETE` against `universe` or `universe_event` anywhere under `src/factorflow/` (guard passes on the tree) | `test_research_sql_is_append_only.py::test_research_sql_is_append_only` scans every `.sql` and `.py` via `rglob` over `RESEARCH_TABLES = ("universe_event", "universe")` | MERGE is not detected (IR-003, LOW) |
| DAC-E1-S1-1 | SATISFIED | `0005_universes.sql` is additive only (CREATE TABLE/INDEX, COMMENT ON) | `tests/integration/test_research_migrations_apply.py::test_migration_0005_applies_without_touching_cap_001_rows`: `apply_pending` returns `[5]`; the version 5 row carries the file checksum; every row of all 11 CAP-001 tables (`cap_001_tables`, `assert len(tables) == 11`) is unchanged apart from the one added `applied_migrations` row; new tables are empty | v1 IR-002 resolved: kills `dml-owner-setting` and `dml-coverage-segment` (behavioural run) |
| DAC-E1-S1-2 | SATISFIED | `0005_universes.sql:16-27` five named CHECKs | `test_research_constraints.py::test_malformed_event_is_refused_by_its_named_constraint` (11 cases, each asserting `CheckViolation` and `diag.constraint_name`) | All six CHECK mutants killed behaviourally |
| DAC-E1-S1-3 | SATISFIED | `0005_universes.sql:34-37` partial unique indexes | `test_research_constraints.py::test_a_second_created_or_retired_event_is_refused` (`UniqueViolation` plus index name) | `single-created-on-renamed` and `single-retired-not-unique` killed behaviourally |
| DAC-E1-S1-4 | SATISFIED | As DAC-E1-10 | `test_research_sql_is_append_only.py` detection cases (UPDATE, DELETE FROM, DELETE FROM ONLY, quoted schema-qualified, upsert, both tables) and lookalike negative case | No `UPDATE ONLY` case (IR-003, LOW) |
| DAC-E1-S1-5 | SATISFIED | `0005_universes.sql` equals the section 2.3 block byte for byte | `test_migration_0005_matches_design.py` (verbatim, block-found sanity, 22 named elements, no length bound) | Kills every 0005 mutant in the gate run |
| DAC-E1-S1-6 | SATISFIED | Delivered migrator; `0005` applies cleanly | `test_research_migrations_apply.py::test_second_migrator_run_after_0005_applies_nothing` (`(0, "schema current at version 5")`, `applied_migrations` unchanged) | none |
| DAC-E1-S1-7 | PARTIAL | `pyproject.toml:33` lists `universes/sql/*.sql`; the wheel built from HEAD ships all 5 `coverage/sql/*.sql` and all 5 migrations | `tests/unit/test_package_data_ships_sql.py` passes on Python 3.13.7 and 3.12.14 | The guard also passes on globs that do not ship `coverage/sql/` (IR-001, HIGH) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/unit/test_migration_0005_matches_design.py` | Unchanged since v1; verbatim, sanity, named-element and no-length-bound checks; `design_sql.py` untouched |
| T002 | complete | PARTIAL | `tests/unit/test_package_data_ships_sql.py:21-31` (`uncovered_sql_files`, `fnmatchcase` at `:29`) | Rule (a), rule (b) and the synthetic test exist and run on 3.12. Rule (a)'s matcher accepts globs setuptools does not honour (IR-001). The plan offered `fnmatch`, but its stated purpose (a non-editable install carries every `.sql`) is not met for that class of glob |
| T003 | complete | VERIFIED | `tests/unit/test_research_sql_is_append_only.py` | Unchanged since v1; single `RESEARCH_TABLES` constant; delivered guard untouched (DEC-0064) |
| T004 | complete | VERIFIED | `tests/integration/test_research_constraints.py` | Unchanged since v1; migrations filtered to versions 1 to 5; every planned refusal and positive control present |
| T005 | complete | VERIFIED | `tests/integration/test_research_migrations_apply.py:42-58,70-76` | Snapshot now covers every CAP-001 table, derived from `pg_tables` after `0004` and pinned at 11. Seeding stays in the module-level `seed_cap_001_rows` helper for CAP-002-E2-S1 |
| T006 | complete | VERIFIED | `tests/unit/test_migration_filenames.py:48` | One list entry |
| T007 | complete | VERIFIED | `tests/unit/test_distribution_contents.py:28,80,99` | Tuple entry, docstring and versions literal |
| T008 | complete | VERIFIED | `src/factorflow/db/migrations/0005_universes.sql` | Verbatim copy; no BEGIN/COMMIT, no `%`, no length CHECK |
| T009 | complete | VERIFIED | `pyproject.toml:33` | Glob appended last; nothing else changed; `src/factorflow/universes/` not created |
| T010 | complete | VERIFIED | `src/factorflow/db/migrations/README.md` unchanged | No checker reads it |
| T011 | complete | VERIFIED | Reviewer reran all six commands: all pass | Tree holds only the planned files plus the justified extras listed in Scope and Plan Deviations |
| T012 | complete | VERIFIED | `CAP-002-E1-S1-tdd-evidence.yaml` cycles 1 to 4; `CAP-002-E1-S1-evidence/` | Lint clean. Cycle 4: `diff_sha256` equals SHA-256 of `cycle-4.patch` (`b6e7bae3…`); `red_log_sha256` matches; `cycle-4.patch` equals `git diff 96509c4 2466ff3 -- tests src pyproject.toml`; `git log -S <diff_sha256>` finds `2466ff3`. Evidence quality noted under IR-002 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_migration_0005_matches_design_verbatim` / TC-COMP-017 | ADEQUATE | Exact text equality with the design's own block; kills all 20 `0005` mutants first under `-x` | none |
| `test_design_block_is_actually_read` / TC-COMP-017 | ADEQUATE | Keeps the comparison from passing vacuously | none |
| `test_migration_0005_names_every_element_of_section_2_3` (22) / TC-COMP-017 | ADEQUATE | Substring presence of every named element | Backed by the verbatim test |
| `test_migration_0005_invents_no_name_length_bound` / TC-COMP-017 | ADEQUATE | No `octet_length`/`length(` | none |
| `test_every_sql_directory_matches_a_package_data_glob` / TC-COMP-018 | WEAK | Runs on 3.12 and 3.13; finds `coverage/sql/` and checks each file against the globs | Accepts `coverage/*.sql` and `*.sql`, which setuptools does not expand to `coverage/sql/*.sql`; two surviving mutants (IR-001) |
| `test_universes_sql_glob_is_listed_before_its_directory_exists` / TC-COMP-018 | ADEQUATE | Rule (b); kills `pkg-universes-glob-dropped` and `pkg-universes-glob-typo` | none |
| `test_guard_reports_a_sql_directory_no_glob_covers` / TC-COMP-018 | WEAK | Reports an uncovered `widgets/sql/read.sql` and accepts `widgets/sql/*.sql` | No case where a glob that only looks like it covers the file (one level up, or top level) is rejected (IR-001) |
| `test_research_sql_is_append_only` / TC-COMP-047 | ADEQUATE | Whole-tree scan of `.sql` and `.py` for both tables | none blocking |
| `test_guard_detects_prohibited_research_mutation` (7) / TC-COMP-047 | ADEQUATE | Exact match text per shape and table | No MERGE or `UPDATE ONLY` case (IR-003) |
| `test_guard_ignores_other_tables_and_lookalike_names` / TC-COMP-047 | ADEQUATE | Other table, `universe_event_foo`, plain INSERT ignored | none |
| `test_malformed_event_is_refused_by_its_named_constraint` (11) / TC-COMP-046 | ADEQUATE | Exception type plus `diag.constraint_name` per CHECK; kills all six CHECK mutants behaviourally | none |
| `test_a_second_created_or_retired_event_is_refused` (2) / TC-COMP-034 | ADEQUATE | `UniqueViolation` plus index name | none |
| `test_a_valid_lifecycle_is_accepted_and_events_are_ordered` / TC-COMP-046, TC-COMP-034 | ADEQUATE | Full valid sequence accepted; `event_id` strictly increasing | `recorded_on` asserted only non-null (IR-004) |
| `test_one_instrument_may_belong_to_two_universes` / AC-3 | ADEQUATE | Same instrument in two universes | No two-`created`-universes control (IR-004) |
| `test_migration_0005_applies_without_touching_cap_001_rows` / TC-COMP-045 | ADEQUATE | Exactly `[5]` applied; version 5 checksum; all 11 CAP-001 tables compared as full-row text; new tables empty | v1 gap closed: kills inserts into `owner_setting` and `coverage_segment` and an update of the seeded `daily_bar` row |
| `test_second_migrator_run_after_0005_applies_nothing` / TC-COMP-048 | ADEQUATE | Exit code and exact message of the second run; `applied_migrations` unchanged | none |
| `test_e5_real_migration_inventory_is_contiguous_through_four` (T006) | ADEQUATE | Exact five-file inventory | none |
| `test_wheel_carries_the_migrations_and_nothing_under_tests`, `test_installed_layout_resolves_its_migrations` (T007) | ADEQUATE | Wheel carries `0005`; installed layout resolves versions 1 to 5; kills `pkg-migrations-glob-dropped` | Asserts nothing about `coverage/sql/`, so it does not cover IR-001 |
| `test_migrations_dir_resolves_inside_the_package_with_unchanged_checksums` (DEC-0187) | ADEQUATE | Versions 1 to 4 still pinned exactly | none |
| `test_new_migrations_apply_after_0002_without_rewriting_rows` (DEC-0187) | ADEQUATE | `[:4]` keeps the `[1, 2]`, `[3, 4]` and `[]` assertions | none |

Mock validity: no mocks. Every integration test runs against PostgreSQL 16 through testcontainers, with a fresh database per test. Determinism: no time, order or network dependence beyond the controlled container.

TDD evidence: the cycle-4 RED was reproduced independently. The v1-reviewed module, extracted read-only with `git archive 96509c4` and run under pytest on Python 3.12.14, fails `test_every_sql_directory_matches_a_package_data_glob` and `test_guard_reports_a_sql_directory_no_glob_covers` with `AttributeError: 'PurePosixPath' object has no attribute 'full_match'`. These are the two failures the log names.

Mutation (TEST-TDD-005/006): the reviewer regenerated mutants over `e452ca9..HEAD` (4 catalogue mutants, all comment text in `0005`). It added 22 manual mutants: 13 schema mutants (CHECKs, indexes, keys, defaults) and 3 DML mutants on `0005`, and 6 glob mutants on `pyproject.toml:33`. Gate run: 24 of 26 killed. `manual:pkg-coverage-glob-one-level` and `manual:pkg-coverage-glob-top-level` survived (IR-001). Both are shown non-equivalent by a wheel build.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1.md --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261019T231500Z` | harness root | 0 | PASS (unusable) | `2466ff39f60a5325a949ae000e6c2b322eaa9975` = HEAD; empty range (see Review Subject) |
| `uv run pytest tests/unit/test_migration_0005_matches_design.py tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_migration_filenames.py tests/unit/test_distribution_contents.py tests/unit/test_migrator_discover.py -q` | component root | 0 | PASS | 52 passed (Python 3.13.7) |
| `uv run pytest tests/integration/test_research_constraints.py tests/integration/test_research_migrations_apply.py tests/integration/test_migrations_apply.py -v` | component root | 0 | PASS | 18 passed |
| `uv run pytest -m 'not postgres' -q` | component root | 0 | PASS | 821 passed, 291 deselected |
| `uv run pytest -m postgres -q -p no:randomly` | component root | 0 | PASS | 291 passed, 821 deselected (193.14 s). `-p no:randomly` is a no-op: the only plugins loaded are anyio and hypothesis |
| `uv run ruff check .` (run as `.venv/bin/ruff check .`) | component root | 0 | PASS | All checks passed |
| `uv run ruff format --check .` (run as `.venv/bin/ruff format --check .`) | component root | 0 | PASS | 198 files already formatted |
| `uv run mypy src` (run as `.venv/bin/mypy src`) | component root | 0 | PASS | No issues in 47 source files |
| `uv build --out-dir /tmp/claude-501/ff-v2-review/uv-build-dist` | component root | 0 | PASS | sdist and wheel built; the wheel ships 10 `.sql` files: `coverage/sql/` x5 and migrations `0001` to `0005`. Output went to a temp dir so the user's `dist/` was not overwritten |
| `.venv/bin/mypy tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_migration_0005_matches_design.py tests/integration/test_research_constraints.py tests/integration/test_research_migrations_apply.py` | component root | 0 | PASS | IR-001 (v1) diagnostic at `python_version = "3.12"`: no issues (v1: `"PurePath" has no attribute "full_match"`) |
| `uv run --offline --isolated --python 3.12.14 --with pytest pytest --noconftest -p no:cacheprovider -v tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_migration_0005_matches_design.py tests/unit/test_migration_filenames.py` | component root | 0 | PASS | 42 passed on Python 3.12.14 (pytest 9.1.1) |
| Same 3.12.14 pytest run of `tests/unit/test_package_data_ships_sql.py` from `git archive 96509c4` in `/tmp/claude-501/ff-v2-review/old-96509c4` (`--no-project`) | temp dir | 1 | FAIL (expected) | RED reproduction: 2 failed (`full_match` `AttributeError`), 1 passed |
| `uv run --offline --isolated --python 3.12.14 --extra dev pytest ...` / `--with pytest --with hypothesis --with 'testcontainers[postgres]' ...` | component root | 1 | NOT RUN (resolution failed) | The full `-m 'not postgres'` suite cannot be run on 3.12 offline: no cached cp312 `mypy` wheel, and `hypothesis`/`testcontainers` dependencies are not in the cache. The reviewer did not fetch packages from the network. The pinned CI job (`UV_PYTHON: "3.12"`) remains the full 3.12 check |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base e452ca9411e6919255d99de8dc333effeceb2db1 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| Same lint with `--base 2466ff39f60a5325a949ae000e6c2b322eaa9975` | harness root | 0 | PASS | 0 errors, 0 warnings; the lint cannot distinguish the two bases |
| `shasum -a 256 cycle-4.patch red-cycle-4-python312.log`; `git diff 96509c4 2466ff3 -- tests/ src/ pyproject.toml` compared to `cycle-4.patch` (index lines stripped) | evidence dir / component root | 0 | PASS | Hashes equal the recorded `diff_sha256` and `red_log_sha256`; diffs identical |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 2466ff39f60a5325a949ae000e6c2b322eaa9975..HEAD --cycle review --out /tmp/claude-501/ff-v2-review/mutants-supplied-base.json` | harness root | 0 | PASS | 0 mutants: the supplied base leaves nothing to mutate |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range e452ca9411e6919255d99de8dc333effeceb2db1..HEAD --cycle review --out /tmp/claude-501/ff-v2-review/mutants.json` plus 22 manual mutants | harness root | 0 | PASS | 4 catalogue (off-by-one, comment text) plus 22 manual mutants |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants /tmp/claude-501/ff-v2-review/mutants.json --jobs 4 --timeout 900 --command 'cd {workdir} && PYTHONPATH=src <component>/.venv/bin/python -m pytest -q -x -p no:cacheprovider -m "postgres or not postgres"' + the nine focused test files --out /tmp/claude-501/ff-v2-review/results-gate.json` | harness root | 3 | FAIL | 24 killed, 2 survived (`pkg-coverage-glob-one-level`, `pkg-coverage-glob-top-level`; survivor logs show `70 passed`); baselines 70 passed in all 4 clones; results sha256 `c051110fa89d2f8c1952dd4ff8369b2dcf511ff2d0c2fe187e615c1ed39704e1` |
| Same mutants, behavioural tests only (`test_research_constraints.py`, `test_research_migrations_apply.py`, `test_package_data_ships_sql.py`) | harness root | 3 | PASS (diagnostic) | 14 killed, 12 survived. Survivors: 4 comment edits (equivalent), `recorded-on-utc`, `instrument-fk-dropped`, `event-id-not-pk`, `created-unique-global`, `universe-id-nullable` (IR-004), `pkg-migrations-glob-dropped` (killed in the gate run by T007's wheel test) and the two IR-001 survivors. `dml-owner-setting` and `dml-coverage-segment` are killed by TC-COMP-045. Results sha256 `8c474b870f6381aa01de76cd8e21d2b5e0033657deab2a4d5639c2fc64407118` |
| `uv build --wheel --offline` on `git archive HEAD` copies, unmodified and with `"coverage/sql/*.sql"` changed to `"coverage/*.sql"` | `/tmp/claude-501/ff-v2-review/wheel-head`, `wheel-mut` | 0 / 0 | PASS (diagnostic) | HEAD wheel: 10 `.sql`, 5 under `coverage/sql/`. Mutant wheel: 5 `.sql`, none under `coverage/sql/`, so the mutant is non-equivalent |
| `uv run pytest` (full suite) | component root | N/A | NOT RUN | Covered exactly by the two marker halves (821 + 291 = 1112) |
| `npm` / `npx` commands from the tech stack | component root | N/A | NOT RUN | The change set touches no frontend file and the task plan lists none |

All `uv`, Docker-backed and mutation commands ran outside the command sandbox, which denies uv's cache at `~/.cache/uv` and the Docker socket. The permission layer refused one unsandboxed `uv run ruff check .`, so ruff and mypy ran from the same project `.venv` the preceding `uv run` calls had already synced. Only `uv run`'s environment sync was skipped: the tool binaries, configuration and environment are identical.

### Validation Side Effects

- Before: HEAD `2466ff39f60a5325a949ae000e6c2b322eaa9975`, branch `usr/alvaro-de-jodra/CAP-002-E1-S1-run-20261020T005515Z`, 0 porcelain entries, fingerprint `sha256:425c6b34be7f97de4c90755b4942d4efc81d908420880cf964c33c0324dc8b85`.
- After: identical HEAD, branch, 0 porcelain entries and fingerprint.
- Unexpected tracked-file changes: none. Ignored-path effects only: `uv build` and `test_distribution_contents.py` wrote under `build/`, plus pytest and mypy caches. Isolated 3.12 environments were created and discarded by uv under `~/.cache/uv/builds-v0`. Mutation clones, wheels and results were written under `/tmp/claude-501/ff-v2-review/`. The only file this review adds to the component repo is this report.

## Findings

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 3 · **total 4**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | HIGH | The reworked TC-COMP-018 matcher (`fnmatchcase`) accepts globs that setuptools does not expand to the `sql/` files; two non-equivalent `pyproject.toml:33` mutants survive |
| IR-002 | LOW | Cycle-4 TDD evidence: the RED log is a hand-written summary, and the 3.12 GREEN was not captured through pytest |
| IR-003 | LOW | Carried from v1/IR-003: the append-only guard misses MERGE and pins no `UPDATE ONLY` case |
| IR-004 | LOW | Carried from v1/IR-004: several `0005` properties are pinned only by the verbatim design guard |

### IR-001 — TC-COMP-018 accepts package-data globs that do not ship the `sql/` files

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S1-7
- **Tasks**: T002 (T009)
- **Files**: `tests/unit/test_package_data_ships_sql.py:29` (`uncovered_sql_files`: `fnmatchcase(relative.as_posix(), glob)`); `pyproject.toml:33`
- **Claim challenged**: The rework says TC-COMP-018 is fixed: the matcher is "now fnmatchcase on the posix path, valid on the project's 3.12" (TDD evidence cycle 4), and the guard proves that "a non-editable install carries every `.sql` a module reads at import".
- **Observed evidence**:
  - `fnmatch` treats `*` as matching any characters, `/` included. setuptools resolves package data in `build_py.find_data_files` with `glob(pattern, recursive=True)`, where `*` stays within one path segment.
  - For `coverage/sql/gaps.sql`, the guard's matcher accepts `coverage/*.sql` and `*.sql`. Both `PurePath.full_match` (the v1 matcher) and setuptools reject them.
  - Gate mutation run: `manual:pkg-coverage-glob-one-level` (`"coverage/sql/*.sql"` to `"coverage/*.sql"`) and `manual:pkg-coverage-glob-top-level` (to `"*.sql"`) both survive all nine focused suites (`70 passed` in each survivor log).
  - Non-equivalence: `uv build --wheel --offline` on a `git archive HEAD` copy with the first mutant produces a wheel with no `factorflow/coverage/sql/*.sql` (5 `.sql` files against 10 from HEAD). `src/factorflow/coverage/gaps.py:31-33` and `service.py:33-35` read those files at import, so the release image (`pip install --no-deps .`) would fail to import `factorflow.coverage` while TC-COMP-018 passes.
  - A probe with the current `uncovered_sql_files` shows the same root cause for nested directories: `db/migrations/sql/x.sql` is reported covered by `db/migrations/*.sql`, which setuptools does not ship.
  - v1's matcher would have killed both mutants. The weakness was introduced by the IR-001 rework.
- **Expected evidence/behavior**: Two sources set it. DAC-E1-S1-7 and TC-COMP-018 Expected Result: every `sql/` directory, `coverage/sql/` named explicitly, matches a package-data glob "so a non-editable install carries every `.sql` a module reads at import". Skill step E.9 and TEST-TDD-006: no non-equivalent changed-line mutant may survive. `pyproject.toml:33` is the line this story changed.
- **Impact**: A plausible regression to the `coverage/sql/*.sql` glob, a typo or an over-broad simplification, ships a broken release image without failing TC-COMP-018. CAP-002-E1-S2 (`universes/sql/`) and CAP-002-E2-S1 (`classification/sql/`, TC-COMP-076, which the E2-S1 plan says should reuse this helper) inherit the same blind spot.
- **Required remediation**: Make the TC-COMP-018 matcher agree with setuptools on Python 3.12. One way is to expand each glob the way `build_py` does, `glob(str(package_root / pattern), recursive=True)`, and require every `sql/*.sql` file to be in the expanded set. An equivalent per-segment matcher also works. Keep `api/static/**/*` and the existing synthetic test working. Add a synthetic case showing that a glob which only looks like it covers the file (for example `widgets/*.sql` or `*.sql` for `widgets/sql/read.sql`) is reported uncovered. Show `manual:pkg-coverage-glob-one-level` and `manual:pkg-coverage-glob-top-level` killed, and the module passing under Python 3.12.

### IR-002 — Cycle-4 TDD evidence is a summary, not captured output

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012
- **Files**: `docs/.../stories/CAP-002-E1-S1-evidence/red-cycle-4-python312.log` (3 lines); `CAP-002-E1-S1-tdd-evidence.yaml` cycle-4 `green_evidence`, `reviewed_patch`
- **Claim challenged**: Cycle 4 records an observed RED under Python 3.12 and a GREEN run under 3.12, as v1/IR-001 required ("record that run in the TDD evidence").
- **Observed evidence**:
  - The RED log is three hand-written lines (`# RED (IR-001)…`, two `FAIL … AttributeError …` lines), not tool output.
  - The 3.12 GREEN was obtained by calling the three test functions directly, "uv could not fetch pytest for 3.12 offline", and no log of it is kept. Here, `uv run --offline --isolated --python 3.12.14 --with pytest pytest --noconftest …` runs the module under real pytest offline.
  - `reviewed_patch` is again an absolute path on this machine, while `red_log` is relative to the harness root.
  - The reviewer reproduced the RED exactly: same two tests, same message. The claim is true, and `--require-logs` passes.
- **Expected evidence/behavior**: TEST-TDD-002 asks for explicit failing-test execution evidence. Captured runner output is the stronger form of it.
- **Impact**: A later reader cannot verify the cycle-4 RED and GREEN from the log alone. No gate effect.
- **Required remediation**: Optional. In the next cycle, capture the 3.12 pytest output for RED and GREEN as the logs, and record `reviewed_patch` relative to the harness root.

### IR-003 — Append-only guard misses MERGE and pins no `UPDATE ONLY` case (carried from v1/IR-003)

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S1-4, DAC-E1-10
- **Tasks**: T003
- **Files**: `tests/unit/test_research_sql_is_append_only.py:19-28` (patterns), `:54-71` (detection cases)
- **Claim challenged**: The guard finds every UPDATE, DELETE or upsert that names the universe tables.
- **Observed evidence**: Re-probed at HEAD. `prohibited_research_mutations` returns `[]` for `MERGE INTO universe_event e USING src s ON … WHEN MATCHED THEN UPDATE SET …` and for `… WHEN MATCHED THEN DELETE`. `UPDATE ONLY universe_event` is detected, but no parametrised case pins it; the only `ONLY` case is `DELETE FROM ONLY` (`:59`). Cycle 4 states IR-003 was deliberately not addressed (optional).
- **Expected evidence/behavior**: DAC-E1-10 forbids any UPDATE or DELETE against the two tables. The plan asked only for parity with the delivered guard's three patterns.
- **Impact**: A later story could rewrite universe history through MERGE without failing the guard.
- **Required remediation**: Optional. Add MERGE … WHEN MATCHED THEN UPDATE/DELETE detection and an `UPDATE ONLY universe_event` case.

### IR-004 — Several `0005` properties are pinned only by the verbatim design guard (carried from v1/IR-004)

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-3, AC-6
- **Tasks**: T004
- **Files**: `tests/integration/test_research_constraints.py:120-175`
- **Claim challenged**: The constraint tests prove the schema's behaviour independently of the text comparison.
- **Observed evidence**: The behavioural-only mutation run still leaves `created-unique-global`, `recorded-on-utc`, `instrument-fk-dropped` and `event-id-not-pk` alive. It also leaves `universe-id-nullable` (`universe_event.universe_id` without `NOT NULL`) alive. All five are killed in the gate run by `test_migration_0005_matches_design_verbatim`.
- **Expected evidence/behavior**: AC-3 says "more than one named universe at a time". Research-store section 2.3 sets the America/Chicago `recorded_on` grain and the column constraints.
- **Impact**: There is no gate survivor. If the design text itself were edited wrongly, the behavioural tests would not notice for these properties.
- **Required remediation**: Optional. Add a control with two universes, each holding a `created` event, and a refused `member_added` for an unknown `instrument_id` (`ForeignKeyViolation`) and a NULL `universe_id` (`NotNullViolation`).

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `tests/unit/test_package_data_ships_sql.py:8,29` no longer uses `PurePath.full_match`. Under pytest on Python 3.12.14 the reworked module passes 3/3, and the `96509c4` module fails 2/3 with the reported `AttributeError`. mypy at `python_version = "3.12"` is clean over the changed test files. The replacement matcher introduced v2/IR-001 |
| v1/IR-002 | RESOLVED | `tests/integration/test_research_migrations_apply.py:42-46,70-76`: the table list comes from `pg_tables` after `0004`, `assert len(tables) == 11`, and every non-`applied_migrations` table is compared in full. Behavioural mutants `dml-owner-setting` and `dml-coverage-segment` (tables absent from v1's list) are killed by `test_migration_0005_applies_without_touching_cap_001_rows` |
| v1/IR-003 | STILL OPEN | Re-probed at HEAD: MERGE still undetected; carried as v2/IR-003 (LOW, optional) |
| v1/IR-004 | STILL OPEN | Behavioural survivors unchanged, plus `universe-id-nullable`; carried as v2/IR-004 (LOW, optional) |

## Scope and Plan Deviations

- **Review base.** The supplied integration base resolves to HEAD, because this run (`run-20261020T005515Z`) froze its integration branch at the previous S1 run branch (`integration_base_ref: usr/alvaro-de-jodra/CAP-002-E1-S1-run-20261019T223047Z`, `base_commit 2466ff3`). The story's unreviewed implementation therefore sits inside the frozen base. This review records `review_base: e452ca9…` because that commit separates the complete story change set (derivation under Review Subject). The supplied ref was not used, because it would leave nothing to review. For a later passing review this has a direct consequence. `integration-branch.py promote` requires `review_base` to equal the frozen base `2466ff3` whenever the reviewed commit is not strictly behind it, so a review that records `e452ca9` will be refused. A review that records `2466ff3` would see only the rework delta, not the story.
- **DEC-0187 (PROVISIONAL, agent-decided, owner not yet reviewed)** still justifies the two one-line delivered-test edits (`tests/unit/test_migrator_discover.py:98`, `tests/integration/test_migrations_apply.py:17`), unchanged since v1. `96509c4` carries `Decision-Id: DEC-0187`, and the record's `commits` cache is still empty (`scripts/sdd decisions verify` refreshes it). `2466ff3` carries no trailer and needs none: it edits only the planned T002 and T005 modules.
- **DEC-0092 (PROVISIONAL)** justifies T006 and T007, as planned; `96509c4` carries the trailer.
- T002 follows the plan's suggested `fnmatch`, but that matcher does not meet the plan's stated purpose (IR-001). The plan text "match … with `fnmatch`/`PurePath.match`" should be read against setuptools' glob semantics. `PurePath.match` also accepts `*.sql` for `coverage/sql/gaps.sql`, because it matches from the right.
- The story file's `status` is still `in-review` and all 12 task boxes remain checked. T002 is PARTIAL.
- No unjustified files in the change set.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Resolve IR-001 with a TC-COMP-018 matcher that agrees with setuptools' `glob(…, recursive=True)` on Python 3.12, plus a synthetic look-alike-glob case, so `pkg-coverage-glob-one-level` and `pkg-coverage-glob-top-level` are killed. IR-002 to IR-004 are optional. Then rerun this review as version 3 with `CAP-002-E1-S1-tasks.md` and this report.
- **Owner or driver action before v3 (evidence, not code)**: Choose the base against which this story is reviewed and promoted. The current run's integration branch `usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261019T231500Z` already contains the whole unreviewed story. A v3 review against it either covers only the rework delta or, if it records the true base `e452ca9`, is refused by `promote`. Either relaunch with an integration base that excludes the story (for example `origin/main` = `e452ca9`) and carry the story branch forward, or record a decision accepting `e452ca9` as the story's review base for this run. No decision record was written by this review.
- **Warnings accepted downstream**: N/A
