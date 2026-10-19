---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-19
updated: 2026-10-19
story_id: "CAP-002-E1-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-19T22:58:39Z"
reviewed_head: "96509c494f7760111019587c90e8b39a7ac86c26"
review_base: "e452ca9411e6919255d99de8dc333effeceb2db1"
reviewed_state_revision: "sha256:ef667b287630060b65b3f59af73386d0b0098a606fca2032dc11879996c13ad9"
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
  timestamp: 2026-10-19T22:58:39Z
  source_artifacts:
    - id: CAP-002-E1-S1
      version: "2 (sha256:544863155caa450e0b9a020e3d4a834d4e78427f05776afa1dfce9ae139e0f1a)"
    - id: CAP-002-E1-S1-tasks
      version: "1 (sha256:e2e06e50713379ddbdff1ae3fdd596c751f6dfe95e3bfb23456b760a79476296)"
    - id: CAP-002-E1-S1-tdd-evidence
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

# Implementation Review: CAP-002-E1-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 9/10 satisfied |
| Planned tasks | 11/12 verified |
| Required validation | 6/6 passed on the local Python 3.13.7 environment; `uv run pytest -m 'not postgres'` is shown to fail on the project's pinned Python 3.12 (IR-001) |

The migration `0005_universes.sql` is a byte-exact copy of research-store section 2.3. Every constraint, index and apply behaviour the story names is exercised by meaningful tests. All six required validation commands pass locally, the TDD-evidence lint is clean, and all 19 review mutants are killed by the story's focused suites.

The gate still fails on one HIGH finding. The mandatory TC-COMP-018 guard `tests/unit/test_package_data_ships_sql.py` calls `PurePath.full_match`, which exists only on Python 3.13 and later. The project declares `requires-python = ">=3.12"`, the tech stack says Python 3.12+, the release image is `python:3.12-slim`, and CI pins `UV_PYTHON: "3.12"` before running `uv run pytest -m 'not postgres'`. Under the supported interpreter, two TC-COMP-018 tests raise `AttributeError`, so DAC-E1-S1-7 cannot be demonstrated and CI's required step fails. Local runs pass only because the development `.venv` is Python 3.13.7. Mypy at the project's configured `python_version = "3.12"` reports the defect directly.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1.md` (v2, approved, revision `sha256:544863155caa450e0b9a020e3d4a834d4e78427f05776afa1dfce9ae139e0f1a`) |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1-tasks.md` (v1) |
| Component | `FactorFlow-v2` (module `research-store`, migration `0005`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S1-run-20261019T223047Z` |
| HEAD | `96509c494f7760111019587c90e8b39a7ac86c26` (`story-coding(CAP-002-E1-S1): migration 0005 universe tables, guards and tests`, trailers `Decision-Id: DEC-0092`, `Decision-Id: DEC-0187`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261019T222804Z` at `e452ca9411e6919255d99de8dc333effeceb2db1`, resolved with `pipeline-state.py review-base --base-ref`; `git merge-base --is-ancestor` exit 0; one commit in range |
| Working tree | Clean: no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 21 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/db/migrations/0005_universes.sql` | added | AC-3, AC-6, DAC-E1-S1-1 to -6; T008 |
| `pyproject.toml` | modified (one package-data entry) | DAC-E1-S1-7; T009 (DEC-0088) |
| `tests/unit/test_migration_0005_matches_design.py` | added | DAC-E1-S1-5; T001 (TC-COMP-017) |
| `tests/unit/test_package_data_ships_sql.py` | added | DAC-E1-S1-7; T002 (TC-COMP-018) |
| `tests/unit/test_research_sql_is_append_only.py` | added | DAC-E1-S1-4, DAC-E1-10; T003 (TC-COMP-047) |
| `tests/integration/test_research_constraints.py` | added | AC-3, DAC-E1-S1-2, DAC-E1-S1-3; T004 (TC-COMP-046, TC-COMP-034) |
| `tests/integration/test_research_migrations_apply.py` | added | DAC-E1-S1-1, DAC-E1-S1-6; T005 (TC-COMP-045, TC-COMP-048) |
| `tests/unit/test_migration_filenames.py` | modified (+1 list entry) | DAC-E1-S1-1; T006 (DEC-0092, PROVISIONAL) |
| `tests/unit/test_distribution_contents.py` | modified (tuple entry, docstring, versions literal) | DAC-E1-S1-1; T007 (DEC-0092, PROVISIONAL) |
| `tests/unit/test_migrator_discover.py` | modified (one line) | DAC-E1-S1-1; not in plan, justified by DEC-0187 (PROVISIONAL) |
| `tests/integration/test_migrations_apply.py` | modified (one line) | DAC-E1-S1-1; not in plan, justified by DEC-0187 (PROVISIONAL) |
| `docs/.../stories/CAP-002-E1-S1.md` | modified (`status: planning` to `in-review`) | story-coding status lifecycle |
| `docs/.../stories/CAP-002-E1-S1-tasks.md` | modified (12 checkboxes only) | T001 to T012 bookkeeping |
| `docs/.../stories/CAP-002-E1-S1-tdd-evidence.yaml` | added | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/cycle-1.patch` | added | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/cycle-2.patch` | added | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/cycle-3.patch` | added | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/red-cycle-1-migration.log` | added | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/red-cycle-2-package-data.log` | added | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/red-cycle-3-append-only.log` | added | T012 |
| `docs/.../stories/CAP-002-E1-S1-evidence/mutation-cycle-1-results.json` | added | T012 (mutation evidence) |

`docs/...` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-3 | SATISFIED | `0005_universes.sql:1-4` (`universe` keyed by its own `universe_id`); `:10` `instrument_id` carries no uniqueness; `:34-37` single-created/retired indexes are per `universe_id` | `tests/integration/test_research_constraints.py::test_one_instrument_may_belong_to_two_universes`; `tests/unit/test_migration_0005_matches_design.py::test_migration_0005_matches_design_verbatim` | The "more than one named universe" half is pinned only by the verbatim guard, with no behavioural test (IR-004, LOW) |
| AC-6 | SATISFIED | `0005_universes.sql:6-28` append-only event log with `event_id` identity and `recorded_on` defaulting to the America/Chicago date; `member_removed` and `retired` are event types, not deletions | `test_research_constraints.py::test_a_valid_lifecycle_is_accepted_and_events_are_ordered`; `tests/unit/test_research_sql_is_append_only.py::test_research_sql_is_append_only` | Story slice is the store; as-of replay belongs to CAP-002-E1-S2 |
| DAC-E1-10 | SATISFIED | No `UPDATE`/`DELETE` against `universe` or `universe_event` anywhere under `src/factorflow/` (guard passes on the tree) | `test_research_sql_is_append_only.py::test_research_sql_is_append_only` scans every `.sql` and `.py` under `src/factorflow/` via `rglob`; `RESEARCH_TABLES = ("universe_event", "universe")` | MERGE-based mutation is not detected (IR-003, LOW) |
| DAC-E1-S1-1 | SATISFIED | `0005_universes.sql` is additive only (CREATE TABLE/INDEX, COMMENT); no delivered object is altered | `tests/integration/test_research_migrations_apply.py::test_migration_0005_applies_without_touching_cap_001_rows` (`apply_pending` returns `[5]`, version 5 row with the file checksum, seeded rows and version 1 to 4 rows unchanged, new tables empty) | Snapshot covers 5 of 11 CAP-001 tables (IR-002, MEDIUM) |
| DAC-E1-S1-2 | SATISFIED | `0005_universes.sql:16-27` five named CHECKs | `test_research_constraints.py::test_malformed_event_is_refused_by_its_named_constraint` (11 cases; each asserts `CheckViolation` and `diag.constraint_name`) | I checked by hand that each case violates exactly one CHECK, so the asserted name is deterministic |
| DAC-E1-S1-3 | SATISFIED | `0005_universes.sql:34-37` partial unique indexes | `test_research_constraints.py::test_a_second_created_or_retired_event_is_refused` (asserts `UniqueViolation` and the index name) | Lifecycle test shows a `created` and a `retired` coexist in one universe |
| DAC-E1-S1-4 | SATISFIED | As DAC-E1-10 | `test_research_sql_is_append_only.py` detection cases (UPDATE, DELETE FROM, DELETE FROM ONLY, schema-qualified quoted, upsert, both tables) and the negative case (`instrument`, `universe_event_foo`) | RED evidence: 7 detection cases failed against a stubbed helper |
| DAC-E1-S1-5 | SATISFIED | `0005_universes.sql` equals the section 2.3 block byte for byte | `test_migration_0005_matches_design.py` (verbatim, block-found sanity, 22 named elements, no length bound) | Reads the design file itself via `sql_block_under_heading(..., path=...)` |
| DAC-E1-S1-6 | SATISFIED | Delivered migrator; `0005` applies cleanly | `test_research_migrations_apply.py::test_second_migrator_run_after_0005_applies_nothing` (`(0, "schema current at version 5")`, `applied_migrations` unchanged) | The first run returning 0 implies every file, `0005` included, was applied |
| DAC-E1-S1-7 | PARTIAL | `pyproject.toml:33` lists `universes/sql/*.sql`; wheel built from HEAD ships `coverage/sql/*.sql` and all five migrations | `tests/unit/test_package_data_ships_sql.py` passes on Python 3.13.7 only | Under the project's pinned Python 3.12, two of its three tests raise `AttributeError` (IR-001, HIGH) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/unit/test_migration_0005_matches_design.py` | Verbatim comparison, sanity check, named elements and no-length-bound check as planned; `design_sql.py` untouched |
| T002 | complete | PARTIAL | `tests/unit/test_package_data_ships_sql.py:20-30,33-51` | Rules (a) and (b) and the synthetic matcher test exist, but the matcher uses `PurePath.full_match` (3.13+), not the plan's `fnmatch`/`PurePath.match`; it fails on the supported 3.12 (IR-001) |
| T003 | complete | VERIFIED | `tests/unit/test_research_sql_is_append_only.py` | Own pattern builder over a single `RESEARCH_TABLES` constant; delivered `test_sql_is_append_only.py` untouched (DEC-0064) |
| T004 | complete | VERIFIED | `tests/integration/test_research_constraints.py` | Migrations filtered to versions 1 to 5; every planned refusal and positive control present; isolation by a fresh database per test (`tests/conftest.py::postgres_connection_string`) |
| T005 | complete | VERIFIED | `tests/integration/test_research_migrations_apply.py` | All planned assertions present; the snapshot is narrower than the plan's "every CAP-001 table" (IR-002) |
| T006 | complete | VERIFIED | `tests/unit/test_migration_filenames.py:48` | One list entry added; nothing else changed |
| T007 | complete | VERIFIED | `tests/unit/test_distribution_contents.py:28,80,99` | Tuple entry, docstring and versions literal only |
| T008 | complete | VERIFIED | `src/factorflow/db/migrations/0005_universes.sql` | Verbatim; no BEGIN/COMMIT, no `%`, no length CHECK |
| T009 | complete | VERIFIED | `pyproject.toml:33` | Glob appended at the end; nothing else changed; `src/factorflow/universes/` not created |
| T010 | complete | VERIFIED | `src/factorflow/db/migrations/README.md` unchanged | `grep` over `tests/` and `scripts/` finds no reader of the migrations README (only `tests/unit/test_readme_deployment.py`, which reads the repository README) |
| T011 | complete | VERIFIED | Reviewer reran all six commands: pass locally | The coder's environment is Python 3.13.7, which masked IR-001. The tree holds two extra files edited under DEC-0187 and the story status change (both justified) |
| T012 | complete | VERIFIED | `CAP-002-E1-S1-tdd-evidence.yaml`, `CAP-002-E1-S1-evidence/` | Lint clean. Each `diff_sha256` equals the SHA-256 of its `cycle-N.patch`. Applying the three patches in order to `review_base` reproduces HEAD's `src/`, `tests/` and `pyproject.toml` exactly. `commit_hash: stage` per plan |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_migration_0005_matches_design_verbatim` / TC-COMP-017 | ADEQUATE | Exact text equality with the design's own block; kills every textual mutant (19/19 in the gate run) | none |
| `test_design_block_is_actually_read` / TC-COMP-017 | ADEQUATE | Guards against an empty or wrong block making the comparison vacuous | none |
| `test_migration_0005_names_every_element_of_section_2_3` (22 cases) / TC-COMP-017 | ADEQUATE | Substring presence of every named table, column, constraint and index | Substring check alone is weak (`name`), but it is backed by the verbatim test |
| `test_migration_0005_invents_no_name_length_bound` / TC-COMP-017 | ADEQUATE | No `octet_length`/`length(` in the migration | none |
| `test_every_sql_directory_matches_a_package_data_glob` / TC-COMP-018 | WEAK | Correct rule on 3.13 | Raises `AttributeError` on Python 3.12, the project's pinned interpreter (IR-001) |
| `test_universes_sql_glob_is_listed_before_its_directory_exists` / TC-COMP-018 | ADEQUATE | Rule (b); observed RED before T009 | none |
| `test_guard_reports_a_sql_directory_no_glob_covers` / TC-COMP-018 | WEAK | Synthetic uncovered `sql/` reported and covered one accepted | Same `full_match` defect (IR-001) |
| `test_research_sql_is_append_only` / TC-COMP-047 | ADEQUATE | Scans every `.sql`/`.py` under `src/factorflow/` for both tables | none blocking |
| `test_guard_detects_prohibited_research_mutation` (7 cases) / TC-COMP-047 | ADEQUATE | Exact match text asserted for each shape and both tables; failed against a stubbed helper | No `UPDATE ONLY` case; MERGE not covered (IR-003) |
| `test_guard_ignores_other_tables_and_lookalike_names` / TC-COMP-047 | ADEQUATE | `instrument`, `universe_event_foo`, plain INSERT ignored | none |
| `test_malformed_event_is_refused_by_its_named_constraint` (11 cases) / TC-COMP-046 | ADEQUATE | Exception type and `diag.constraint_name` for every CHECK, including both member types, renamed-with-instrument, retired-with-name, leading/trailing space and empty name | none |
| `test_a_second_created_or_retired_event_is_refused` (2 cases) / TC-COMP-034 | ADEQUATE | `UniqueViolation` plus index name for second `created` and second `retired` | none |
| `test_a_valid_lifecycle_is_accepted_and_events_are_ordered` / TC-COMP-046, TC-COMP-034 | ADEQUATE | Full valid sequence accepted; `event_id` order equals insertion order | `recorded_on` asserted only non-null, not the Chicago date (IR-004) |
| `test_one_instrument_may_belong_to_two_universes` / AC-3 | ADEQUATE | Same instrument added to two universes | No two-`created`-universes control (IR-004) |
| `test_migration_0005_applies_without_touching_cap_001_rows` / TC-COMP-045 | ADEQUATE | `[5]` applied, checksum, version 1 to 4 rows and seeded rows unchanged as full-row text, new tables empty | Unseeded CAP-001 tables are not snapshotted (IR-002) |
| `test_second_migrator_run_after_0005_applies_nothing` / TC-COMP-048 | ADEQUATE | Exit code and exact message of the second `run_migrations`; `applied_migrations` unchanged | It passed in the RED run because it does not depend on the version; acceptable for an idempotence property |
| `test_e5_real_migration_inventory_is_contiguous_through_four` (T006) | ADEQUATE | Exact five-file inventory | none |
| `test_wheel_carries_the_migrations_and_nothing_under_tests`, `test_installed_layout_resolves_its_migrations` (T007) | ADEQUATE | Wheel carries `0005`; installed layout resolves versions 1 to 5 | none |
| `test_migrations_dir_resolves_inside_the_package_with_unchanged_checksums` (DEC-0187) | ADEQUATE | Still pins versions 1 to 4 exactly (the filtered map must equal the four-key map) | Not weakened for its purpose |
| `test_new_migrations_apply_after_0002_without_rewriting_rows` (DEC-0187) | ADEQUATE | `[:4]` keeps the `[1, 2]`, `[3, 4]` and `[]` assertions as written | none |

Mock validity: no mocks are used; every integration test runs against PostgreSQL 16 through testcontainers. Isolation: each test gets its own database. Determinism: no time, order or network dependence beyond the controlled container.

TDD evidence: the RED logs show the 0005 tests failing for the missing file, the delivered inventory tests failing, rule (b) failing before T009, and the guard's detection cases failing against a stub. Mutation (TEST-TDD): the reviewer regenerated mutants over every changed production file (`0005_universes.sql`, `pyproject.toml`) and added 15 manual mutants. All 19 were killed by the focused suites. A diagnostic run with the verbatim guard excluded is reported under IR-004.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` (via `bash`) | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1.md --stage adversarial-review` | harness root | 0 | PASS | `READY` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261019T222804Z` | harness root | 0 | PASS | `e452ca9411e6919255d99de8dc333effeceb2db1`, ancestor of HEAD |
| `uv run pytest tests/unit/test_migration_0005_matches_design.py tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_migration_filenames.py tests/unit/test_distribution_contents.py tests/unit/test_migrator_discover.py -q` | component root | 0 | PASS | 52 passed (Python 3.13.7) |
| `uv run pytest tests/integration/test_research_constraints.py tests/integration/test_research_migrations_apply.py tests/integration/test_migrations_apply.py -q` | component root | 0 | PASS | 18 passed |
| `uv run pytest -m 'not postgres'` | component root | 0 | PASS | 821 passed, 291 deselected (Python 3.13.7); shown to fail on Python 3.12 by IR-001 |
| `uv run pytest -m postgres` | component root | 0 | PASS | 291 passed, 821 deselected (194.98 s) |
| `uv run ruff check .` | component root | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | component root | 0 | PASS | 198 files already formatted |
| `uv run mypy src` | component root | 0 | PASS | No issues in 47 source files |
| `uv build --out-dir "$TMPDIR/ff-build.*"` | component root | 0 | PASS | sdist and wheel built; wheel ships `factorflow/db/migrations/0005_universes.sql` and all `coverage/sql/*.sql`. Output went to a temp dir instead of `dist/` so the user's existing `dist/` was not overwritten; same build otherwise |
| `uv run mypy tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_migration_0005_matches_design.py tests/integration/test_research_constraints.py tests/integration/test_research_migrations_apply.py` | component root | 1 | FAIL | Diagnostic for IR-001, using the project's `python_version = "3.12"`: `tests/unit/test_package_data_ships_sql.py:28: error: "PurePath" has no attribute "full_match"  [attr-defined]` |
| `uv run mypy --python-version 3.13 tests/unit/test_package_data_ships_sql.py` | component root | 0 | PASS | Diagnostic contrast: clean on 3.13 |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base e452ca9411e6919255d99de8dc333effeceb2db1 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range e452ca9..HEAD --cycle review --out $TMPDIR/ff-review-mut/mutants.json` plus 15 manual mutants | harness root | 0 | PASS | 4 catalogue mutants (comment text) plus 15 manual mutants: 12 on `0005_universes.sql` and 3 on `pyproject.toml` |
| `python3 scripts/mutation-run.py run ... --jobs 4 --command 'cd {workdir} && PYTHONPATH=src .venv/bin/python -m pytest -q -x -m "postgres or not postgres"' + the nine focused test files` | harness root | 0 | PASS | 19/19 killed; baselines exit 0 in all 4 clones; results `$TMPDIR/ff-review-mut/results-gate.json` sha256 `965b33a8b152374f643e6bf955b77886fc6cddd29cd4f6d31ba61335c3f58e38` |
| Same mutants, behavioural tests only (`test_research_constraints.py`, `test_research_migrations_apply.py`, `test_package_data_ships_sql.py`) | harness root | 3 | PASS (diagnostic) | 10 killed, 9 survived; survivors analysed in IR-004; results sha256 `0c889330fb43962607ed17080869e6f15a19f74c6a3cf3427315cb43aa7a1b85` |
| Replay of `cycle-1.patch`, `cycle-2.patch`, `cycle-3.patch` on a temp clone at `review_base`, then `git diff --cached 96509c4 -- src tests pyproject.toml` | temp clone | 0 | PASS | No difference: the reviewed patches are the committed code |
| `uv run pytest` (full suite) | component root | N/A | NOT RUN | Covered exactly by the two marker halves above (821 + 291 = 1112, the full collection) |
| `uv sync --all-extras` | component root | N/A | NOT RUN | Environment install, not a check of the change; `uv run` re-synced the editable package itself |
| `npm` / `npx` commands from the tech stack | component root | N/A | NOT RUN | The change set touches no frontend file, and the task plan does not list them |

All `uv` commands ran outside the command sandbox because the sandbox denies uv's cache at `~/.cache/uv`. PostgreSQL tests also need the Docker daemon.

### Validation Side Effects

- Before: HEAD `96509c494f7760111019587c90e8b39a7ac86c26`, branch `usr/alvaro-de-jodra/CAP-002-E1-S1-run-20261019T223047Z`, 0 porcelain entries, fingerprint `sha256:ef667b287630060b65b3f59af73386d0b0098a606fca2032dc11879996c13ad9`.
- After: identical HEAD, branch, 0 porcelain entries and fingerprint.
- Unexpected tracked-file changes: none. Ignored-path effects only: `uv run` reinstalled the editable `factorflow` into `.venv/`; `uv build` and `test_distribution_contents.py` wrote under `build/`; pytest and mypy caches. Mutation clones and results were written under `$TMPDIR`.

## Findings

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 2 · **total 4**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | HIGH | `tests/unit/test_package_data_ships_sql.py:28` calls `PurePath.full_match` (Python 3.13+); the project pins Python 3.12, so TC-COMP-018 raises `AttributeError` there |
| IR-002 | MEDIUM | TC-COMP-045 snapshots 5 of the 11 CAP-001 tables; T005 asks for every CAP-001 table |
| IR-003 | LOW | The append-only guard misses MERGE-based UPDATE/DELETE and has no `UPDATE ONLY` case |
| IR-004 | LOW | Two-named-universes, Chicago `recorded_on`, instrument FK and `event_id` PK are pinned only by the verbatim guard |

### IR-001 — TC-COMP-018 guard uses a Python 3.13-only API on a Python 3.12 project

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S1-7
- **Tasks**: T002 (T011)
- **Files**: `tests/unit/test_package_data_ships_sql.py:28` (`uncovered_sql_files`: `PurePath(relative).full_match(glob)`)
- **Claim challenged**: T002 is complete and TC-COMP-018 passes under the story's Validation `uv run pytest -m 'not postgres'`.
- **Observed evidence**: `PurePath.full_match` was added in Python 3.13. The typeshed stub bundled with the project's mypy (`.venv/lib/python3.13/site-packages/mypy/typeshed/stdlib/pathlib/__init__.pyi:58-60`) defines it only under `if sys.version_info >= (3, 13)`. `uv run mypy tests/unit/test_package_data_ships_sql.py` at the project's configured `python_version = "3.12"` exits 1 with `"PurePath" has no attribute "full_match"`, while `--python-version 3.13` exits 0. The project targets 3.12 everywhere: `pyproject.toml:9` `requires-python = ">=3.12"`, `:44` ruff `target-version = "py312"`, `:58` mypy `python_version = "3.12"`, `.github/workflows/validate.yml:48` `UV_PYTHON: "3.12"` before `uv run pytest -m 'not postgres'`, `Dockerfile:13,20` `python:3.12-slim`, and `docs/constitution/tech-stack.md:84` "Python 3.12+". The local `.venv` is Python 3.13.7, which is why the coder's and the reviewer's local runs pass. `src/factorflow/coverage/sql/` holds five `.sql` files, so the call is reached on every run. I did not run the suite under 3.12, because no 3.12 interpreter is installed here (only 3.9.6 and 3.13) and installing one would change the user's environment outside the review subject; the static evidence is conclusive.
- **Expected evidence/behavior**: Story Validation and tech stack: `uv run pytest -m 'not postgres'` passes on the supported Python, 3.12 or later. Task T002 says to match with `fnmatch`/`PurePath.match`. DAC-E1-S1-7 says the test runs and finds every `sql/` directory covered.
- **Impact**: On Python 3.12, `test_every_sql_directory_matches_a_package_data_glob` and `test_guard_reports_a_sql_directory_no_glob_covers` raise `AttributeError`. CI's "Tests without a container" step fails on the first push of this branch, and the TC-COMP-018 guard that CAP-002-E1-S2 and CAP-002-E2-S1 rely on does not run on the supported interpreter.
- **Required remediation**: Replace the matcher with one available on Python 3.12. It must still accept `coverage/sql/*.sql` for `coverage/sql/x.sql`, keep the `api/static/**/*` glob working, and keep the synthetic uncovered-directory test failing for an uncovered `sql/`. Show `tests/unit/test_package_data_ships_sql.py` passing under Python 3.12 (for example `uv run --python 3.12 --isolated pytest tests/unit/test_package_data_ships_sql.py`, or the pinned CI job) as well as under the local interpreter, and record that run in the TDD evidence.

### IR-002 — TC-COMP-045 snapshot covers 5 of the 11 CAP-001 tables

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S1-1
- **Tasks**: T005
- **Files**: `tests/integration/test_research_migrations_apply.py:13-19` (`CAP_001_TABLES`), `:50-57` (`snapshot_cap_001`)
- **Claim challenged**: T005 says to "snapshot every CAP-001 table's rows (`SELECT * ... ORDER BY` per table, including `applied_migrations` rows for versions 1 to 4)".
- **Observed evidence**: `CAP_001_TABLES` lists `instrument`, `daily_bar`, `fundamental_observation`, `acquisition_run` and `applied_migrations`. Migrations `0001` to `0004` also create `owner_setting`, `instrument_reference`, `corporate_action`, `coverage_segment`, `acquisition_state` and `run_instrument_result`, none of which is snapshotted. The required assertions on the seeded rows are present and pass.
- **Expected evidence/behavior**: T005's snapshot breadth, and DAC-E1-S1-1's "no CAP-001 row changes", which covers a row added to any CAP-001 table.
- **Impact**: A migration that inserts into, or rewrites, any of the six omitted tables passes TC-COMP-045. The module is the helper CAP-002-E2-S1 extends for `0006`, so the gap carries forward. There is no effect on `0005` itself, whose text is pinned to the design and contains no DML.
- **Required remediation**: Snapshot every CAP-001 table, either by listing all eleven or by deriving the list from the catalogue after `0004` is applied, so that a row added to or changed in any of them fails the comparison.

### IR-003 — Append-only guard misses MERGE and pins no UPDATE ONLY case

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S1-4, DAC-E1-10
- **Tasks**: T003
- **Files**: `tests/unit/test_research_sql_is_append_only.py:19-28` (patterns), `:54-71` (detection cases)
- **Claim challenged**: The guard finds every `UPDATE`, `DELETE FROM` or upsert naming the universe tables.
- **Observed evidence**: Probing `prohibited_research_mutations` with the venv interpreter gave these results. `MERGE INTO universe_event e USING src s ON ... WHEN MATCHED THEN UPDATE SET ...` returns `[]`, and so does `... WHEN MATCHED THEN DELETE`. MERGE is supported on PostgreSQL 15 and later, and the test container runs 16. `UPDATE ONLY universe_event` is detected, but no parametrised case pins it, although the delivered guard's case list has one. Python comments are scanned too: `# replay rather than update universe state in place` returns `['update universe']`, a false positive that fails safe.
- **Expected evidence/behavior**: DAC-E1-10: no statement against the two tables may be an UPDATE or DELETE. DAC-E1-S1-4 names upserts. The plan asked for parity with the three delivered patterns, so this is a hardening item rather than a plan violation.
- **Impact**: A later story could rewrite or delete universe history through MERGE without failing the guard. Prose containing "update universe" in a later module will fail the guard and need rewording.
- **Required remediation**: Optional. Add MERGE ... WHEN MATCHED THEN UPDATE/DELETE detection and an `UPDATE ONLY universe_event` case. Decide whether comments and docstrings stay in scope; keeping them is fail-safe.

### IR-004 — Several 0005 properties are pinned only by the verbatim design guard

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-3, AC-6
- **Tasks**: T004
- **Files**: `tests/integration/test_research_constraints.py:120-175`
- **Claim challenged**: The constraint tests prove the schema's behaviour independently of the verbatim text comparison.
- **Observed evidence**: The behavioural-only mutation run left these mutants alive, all killed in the gate run by `test_migration_0005_matches_design_verbatim`:
  - `created-unique-global`: `idx_universe_event_single_created` keyed on `event_type`, which would refuse a second named universe.
  - `recorded-on-utc`: the `recorded_on` default computed in UTC rather than America/Chicago.
  - `instrument-fk-dropped`: no foreign key on `instrument_id`.
  - `event-id-not-pk`: `event_id` no longer the primary key.

  The other survivors are behaviourally equivalent: four comment-text edits, and dropping `idx_universe_event_instrument`, which affects performance only. No test creates two universes that each carry a `created` event, and `recorded_on` is asserted only as non-null.
- **Expected evidence/behavior**: AC-3, "more than one named universe at a time". AC-6 and research-store section 2.3: `recorded_on` is the America/Chicago date grain.
- **Impact**: There is no gate survivor, because the verbatim guard keeps the shipped text equal to the design. If the design text itself were edited wrongly, though, the behavioural tests would not notice for these properties.
- **Required remediation**: Optional. Add a positive control with two universes each holding a `created` event, and a `member_added` naming an unknown `instrument_id` refused with `ForeignKeyViolation`.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **DEC-0187 (PROVISIONAL, agent-decided in this run, owner not yet reviewed)** justifies two delivered-test edits outside the plan: `tests/unit/test_migrator_discover.py:98` (filter to versions up to 4) and `tests/integration/test_migrations_apply.py:17` (`discover(...)[:4]`). Both are one line, keep their original assertions, and do not weaken their guards. The decision text says "passes `files[:4]` to the second `apply_pending`". The code slices at discovery instead, which covers the second and third calls alike, with the same effect. The HEAD commit carries `Decision-Id: DEC-0187`. The record's `commits` cache is still empty; `scripts/sdd decisions verify` refreshes it.
- **DEC-0092 (PROVISIONAL)** justifies T006 and T007, as planned. The commit carries `Decision-Id: DEC-0092`.
- T011 expected only T001 to T009 files plus the task and TDD-evidence files. The tree also holds the story status change, the evidence directory and the two DEC-0187 edits, all justified.
- T002 uses `PurePath.full_match` instead of the planned `fnmatch`/`PurePath.match`, which is unjustified (IR-001).
- T005's snapshot is narrower than planned (IR-002).
- Bookkeeping: all 12 task boxes are checked; T002 is PARTIAL. The TDD evidence's `reviewed_patch` fields use absolute paths on this machine while the other evidence paths are relative to the harness root. The lint accepts this; it is noted for portability only.
- The coder's mutation run used `-x` over two test files and mutated only `0005_universes.sql`. The reviewer's run also covered `pyproject.toml` and all nine focused test files.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Resolve IR-001: a Python 3.12-compatible matcher in `tests/unit/test_package_data_ships_sql.py`, with a run under Python 3.12 recorded in the TDD evidence. Then address IR-002, and optionally IR-003 and IR-004, and rerun this review as version 2 with `CAP-002-E1-S1-tasks.md` and this report.
- **Warnings accepted downstream**: N/A
