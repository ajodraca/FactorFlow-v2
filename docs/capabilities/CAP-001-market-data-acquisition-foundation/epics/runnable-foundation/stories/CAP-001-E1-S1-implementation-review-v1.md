---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-06
story_id: "CAP-001-E1-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-06T22:12:24Z"
reviewed_head: "3dbbb68c22971a4fbba1f45c708334478126c0f6"
review_base: "6dea479c5133a9134b8f93f2e20af685e99012a1"
reviewed_state_revision: "sha256:34df93b1283b67ae917a478306b16d96ec536d7a4fc7dbc76c10e17c97fabd84"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E1-S1
    artifact_version: 1
    content_revision: sha256:55570e143f7d379b68e4862261077cf24708df65824fc558ae252dc3bd33df32
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T22:12:24Z
  source_artifacts:
    - id: CAP-001-E1-S1
      version: "1"
    - id: CAP-001-E1-S1-tasks
      version: "1"
    - id: CAP-001-component-design-market-data-store
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 3 |
| Low findings | 2 |
| Acceptance criteria | 8/9 satisfied |
| Planned tasks | 16/17 verified |
| Required validation | 7/7 passed |

The implementation is of genuinely high quality: every validation command passes independently, all 19 tests pass against a real PostgreSQL 16 container, and the constraint tests are meaningful behavioural assertions rather than mock theatre. The gate nevertheless fails on one HIGH finding.

`migrations/0001_extensions_owner_state.sql` ships `CREATE UNIQUE INDEX idx_instrument_symbol ON instrument (symbol)`. The approved story explicitly states the opposite: *"A unique index on `symbol` is deliberately **not** added here: symbol uniqueness across lifecycle states is settled in CAP-001-E2-S1, which owns reactivation semantics."* The task plan's own Notes repeat that deferral. The shipped file follows `component-design-market-data-store.md` §2.3 instead, which does contain both indexes — so two approved artifacts contradict each other and the code silently picked one.

This is not cosmetic. CAP-001-E2-S1 plans to create `instrument_symbol_key` on the same column (its Technical Details), so it will now add a redundant duplicate index. Because the migration convention is forward-only and an applied file is never edited, this cannot be corrected inside `0001` — it needs an explicit decision recorded before later stories build on it.

No acceptance criterion is functionally broken by this: DAC-E2-S1-3 reactivates the existing row rather than inserting a second, so a unique `symbol` remains compatible with the intended end state. The failure is one of authority and traceability, not of runtime behaviour, which is why it is HIGH rather than CRITICAL.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S1-tasks.md` |
| Component | FactorFlow-v2 |
| Branch | `usr/alvaro-de-jodra/CAP-001-epics` |
| HEAD | `3dbbb68c22971a4fbba1f45c708334478126c0f6` |
| Review base | `origin/main` merge-base `6dea479c5133a9134b8f93f2e20af685e99012a1` |
| Working tree | Clean — no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 21 attributable to this story (39 in branch range; 18 are other stories' task plans) |

Local `main` was rejected as a base: it is 10 commits behind `origin/main`, which is the configured default branch (`refs/remotes/origin/HEAD`). Using it would have widened the change set with already-merged work.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `pyproject.toml` | added | T001, T003 |
| `uv.lock` | added | T001 (lockfile for declared dependencies) |
| `.gitignore` | added | T001 (bootstrap hygiene; see IR-006) |
| `src/factorflow/__init__.py` | added | T002 |
| `src/factorflow/db/__init__.py` | added | T002 |
| `src/factorflow/db/applied_migrations.py` | added | T011-impl; DAC-E1-2, DAC-E1-S1-5 |
| `migrations/0001_extensions_owner_state.sql` | added | T012; DAC-E1-S1-1..4 |
| `migrations/README.md` | added | T015 |
| `tests/__init__.py` | added | T004 |
| `tests/unit/__init__.py` | added | T004 |
| `tests/integration/__init__.py` | added | T004 |
| `tests/conftest.py` | added | T004, T014 |
| `tests/integration/test_applied_migrations_table.py` | added | T005; TC-COMP-293, 313 |
| `tests/integration/test_migration_0001.py` | added | T006; TC-COMP-309 |
| `tests/integration/test_instrument_constraints.py` | added | T007; TC-COMP-310, 311 |
| `tests/integration/test_owner_setting.py` | added | T008; TC-COMP-312 |
| `tests/integration/test_migration_idempotence.py` | added | T009; TC-COMP-314 |
| `tests/unit/test_migration_0001_matches_design.py` | added | T010 |
| `tests/unit/test_applied_migrations_ddl_matches_design.py` | added | T011 |
| `CAP-001-E1-S1.md` | modified | Status transition to `in-review` |
| `CAP-001-E1-S1-tasks.md` | modified | Task checkbox updates |

The 18 other files in the branch range (`CAP-001-E1-S2..S6`, `CAP-001-E2-S1..S4` task plans and story status lines) are planning artifacts for other stories, delivered by separate commits. They are **not** scope leakage by this story and were excluded from the code review, though IR-001 draws on `CAP-001-E2-S1.md` as evidence of downstream impact.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-15 | SATISFIED | `migrations/0001_extensions_owner_state.sql`; `src/factorflow/db/applied_migrations.py:APPLIED_MIGRATIONS_DDL` | `tests/integration/test_migration_idempotence.py::test_second_application_loses_no_existing_rows` | Narrow slice only, as the story scopes it. An `AAPL` row inserted between applications survives the second. See IR-002 on the guard being test-local. |
| DAC-E1-1 | SATISFIED | Single schema; no second store introduced anywhere in the change set | Structural — no dedicated test | Verified by inspection: every table is created in the one database the fixture provisions. TC-COMP-292 has no implementing test — see IR-003. |
| DAC-E1-2 | SATISFIED | `src/factorflow/db/applied_migrations.py` — DDL exported as a constant, not as a migration file | `test_applied_migrations_table.py::test_applied_migrations_creatable_before_any_migration_file` | Proven creatable against a completely empty database, which is the substantive claim. |
| DAC-E1-S1-1 | SATISFIED | `migrations/0001_extensions_owner_state.sql:1` `CREATE EXTENSION IF NOT EXISTS btree_gist` | `test_migration_0001.py::test_applying_0001_creates_btree_gist_extension` | Asserts against `pg_extension`, not against the file text. |
| DAC-E1-S1-2 | SATISFIED | `instrument_symbol_uppercase`, `instrument_symbol_shape` check constraints | `test_instrument_constraints.py::test_lowercase_symbol_is_rejected`, `::test_symbol_over_sixteen_characters_is_rejected` | Rejection asserted via `psycopg.errors.CheckViolation` — proves database-level enforcement, exactly as the AC demands ("rather than by application code"). |
| DAC-E1-S1-3 | SATISFIED | `instrument_lifecycle_known`, `instrument_retired_at_agrees` | `::test_unknown_lifecycle_value_is_rejected`, `::test_retired_without_retired_at_is_rejected`, `::test_active_with_retired_at_is_rejected` | Both directions of the iff are covered, plus two positive cases. Strong. |
| DAC-E1-S1-4 | SATISFIED | `owner_setting` table, `setting_value jsonb NOT NULL` | `test_owner_setting.py` — all three tests | Column type read from `information_schema`; PK asserted; JSON round-trip confirmed. |
| DAC-E1-S1-5 | SATISFIED | `APPLIED_MIGRATIONS_DDL` — four columns, `version` PK | `test_applied_migrations_table.py::test_applied_migrations_has_exactly_four_columns_with_version_as_pk` | Asserts exact column list and ordinal position — would fail on an added column. |
| DAC-E1-S1-6 | **PARTIAL** | No production code implements the skip decision | `test_migration_idempotence.py::test_applying_0001_twice_records_exactly_one_row` | The guard `_apply_0001_if_not_recorded` is defined **inside the test file**. The AC is verified against test-local logic, not shipped behaviour. See IR-002. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `pyproject.toml` | src layout, setuptools backend, `psycopg[binary]>=3`, dev extras all present. `uv sync --all-extras` exits 0. |
| T002 | complete | VERIFIED | `src/factorflow/__init__.py`, `src/factorflow/db/__init__.py` | Both empty package markers exist. |
| T003 | complete | VERIFIED | `pyproject.toml` `[tool.pytest.ini_options]` | `postgres` marker registered; `testpaths = ["tests"]`. `-m 'not postgres'` deselects 17 and exits 0. |
| T004 | complete | VERIFIED | `tests/conftest.py`; three `__init__.py` files | Session-scoped PostgreSQL 16 container. See IR-004 on cleanup placement. |
| T005 | complete | VERIFIED | `tests/integration/test_applied_migrations_table.py` | TC-COMP-293 and TC-COMP-313 both genuinely implemented. |
| T006 | complete | VERIFIED | `tests/integration/test_migration_0001.py` | TC-COMP-309 implemented. |
| T007 | complete | VERIFIED | `tests/integration/test_instrument_constraints.py` | All five required rejection cases present, as the story's Testing section enumerates. |
| T008 | complete | VERIFIED | `tests/integration/test_owner_setting.py` | TC-COMP-312 implemented. |
| T009 | complete | VERIFIED | `tests/integration/test_migration_idempotence.py` | File exists and tests pass; the AC it serves is nonetheless PARTIAL (IR-002). Task itself is as-planned — the plan specified a test-local guard. |
| T010 | complete | VERIFIED | `tests/unit/test_migration_0001_matches_design.py` | Exists and passes. Weak as a drift guard — see IR-005. |
| T011 | complete | VERIFIED | `tests/unit/test_applied_migrations_ddl_matches_design.py` | Exists and passes. Same weakness (IR-005). |
| T012 | **complete** | **PARTIAL** | `migrations/0001_extensions_owner_state.sql` | File matches the design §2.3 verbatim, **including both indexes** — which the approved story explicitly excludes. See IR-001. |
| T013 | complete | NOT APPLICABLE | — | Explicitly a placeholder per the plan's Notes; `instrument` and `owner_setting` both live in the T012 file. Justified. |
| T011-impl | complete | VERIFIED | `src/factorflow/db/applied_migrations.py` | Exports `APPLIED_MIGRATIONS_DDL` verbatim from design §2.2. Confirmed byte-identical. |
| T014 | complete | VERIFIED | `tests/conftest.py` per-test database fixture | The claimed isolation fix is real: each test gets a uniquely named database via `psycopg.sql.Identifier`. Independently confirmed by 17/17 passing. |
| T015 | complete | VERIFIED | `migrations/README.md` | Documents forward-only, one-file-per-migration, never-edited conventions. |
| T016 | complete | VERIFIED | `pyproject.toml` `[tool.ruff] extend-exclude` | All validation commands confirmed passing independently. The `docs`/`design-system` exclusion is justified in an in-file comment. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_applied_migrations_creatable_before_any_migration_file` / TC-COMP-293 | ADEQUATE | Executes the exported DDL against an empty database and confirms the table appears in `information_schema`. Proves the ordering claim that matters. | None |
| `test_applied_migrations_has_exactly_four_columns_with_version_as_pk` / TC-COMP-313 | ADEQUATE | Asserts the exact column list by ordinal position and that the PK is exactly `version`. Would fail if a column were added, removed, or reordered. | None |
| `test_applied_migrations_record_round_trips` / TC-COMP-313 | ADEQUATE | Inserts and reads back; confirms `applied_at` defaults non-null. | None |
| `test_applying_0001_creates_btree_gist_extension` / TC-COMP-309 | ADEQUATE | Queries `pg_extension` after applying the real file. Genuine behavioural check, not a text match. | None |
| `test_applying_0001_creates_instrument_and_owner_setting_tables` / TC-COMP-309 | ADEQUATE | Confirms both tables exist post-migration. | None |
| `test_lowercase_symbol_is_rejected` / TC-COMP-310 | ADEQUATE | `pytest.raises(psycopg.errors.CheckViolation)` — proves database-level rejection, which is precisely what the AC requires. | None |
| `test_symbol_over_sixteen_characters_is_rejected` / TC-COMP-310 | ADEQUATE | Boundary case at 17 chars against the `{0,15}` regex. | Does not assert the 16-char boundary is *accepted*; the negative side is the AC's requirement, so this is not a defect. |
| `test_unknown_lifecycle_value_is_rejected` / TC-COMP-311 | ADEQUATE | Rejects `delisted`. | None |
| `test_retired_without_retired_at_is_rejected` / TC-COMP-311 | ADEQUATE | Covers one direction of the iff. | None |
| `test_active_with_retired_at_is_rejected` / TC-COMP-311 | ADEQUATE | Covers the other direction. Together these fully pin `instrument_retired_at_agrees`. | None |
| `test_valid_active_instrument_is_accepted`, `test_valid_retired_instrument_is_accepted` / TC-COMP-310, 311 | ADEQUATE | Positive controls — prove the constraints are not rejecting everything, which a negative-only suite could hide. | None |
| `test_setting_value_column_is_jsonb` / TC-COMP-312 | ADEQUATE | Reads `data_type` from `information_schema`; asserts exactly `jsonb` (not `json`). | None |
| `test_setting_key_is_the_primary_key` / TC-COMP-312 | ADEQUATE | Asserts the PK column list is exactly `["setting_key"]`. | None |
| `test_arbitrary_json_shaped_value_round_trips` / TC-COMP-312 | ADEQUATE | Round-trips `{"years": 5}` and compares to the original dict — confirms psycopg's jsonb adaptation. | None |
| `test_applying_0001_twice_records_exactly_one_row` / TC-COMP-314 | **WEAK** | Proves the *test's own* `_apply_0001_if_not_recorded` helper is idempotent, and asserts the returned booleans plus a row count of 1. | The guard under test is defined in the test file. No shipped code implements it, so no production regression could make this fail. See IR-002. |
| `test_second_application_loses_no_existing_rows` / AC-15 | **WEAK** | Confirms an `AAPL` row survives a second guarded application. Same structural limitation. | As above. |
| `test_migration_0001_matches_design_verbatim` / T010 | **WEAK** | Compares the shipped file to a Python string literal. | The literal is a *copy* of the design, not a read of it. If the design changes, this passes against a stale copy — it cannot detect the drift it exists to catch. See IR-005. Notably, it also encodes the two indexes the story says are absent, so it actively locks in IR-001. |
| `test_applied_migrations_ddl_matches_design_verbatim` / T011 | **WEAK** | Same pattern against `APPLIED_MIGRATIONS_DDL`. | Same as above. |
| TC-COMP-292 / DAC-E1-1 | **MISSING** | — | No implementing test exists. Marked "Covered" in the coverage matrix at P1. See IR-003. |

Determinism and isolation: the suite is sound. Each test provisions its own uniquely named database inside a shared session container, so there is no cross-test table collision and no order dependence. No test touches the network, wall-clock time, or environment state beyond the container. Mocks are absent entirely — every assertion runs against real PostgreSQL, which is the right choice for schema work and materially stronger than a mocked equivalent.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved and installed; psycopg 3.3.5, pytest 9.1.1, ruff 0.16.6, testcontainers 4.15.0. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "All checks passed!" |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "15 files already formatted" |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Success: no issues found in 3 source files" (strict mode). |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | **17 passed, 2 deselected in 4.42s** against a real `postgres:16` container. Docker was running, so no exclusion fallback was needed. |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 19 passed in 2.43s. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 2 passed, 17 deselected — confirms the marker split works as T003 intended. |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built `factorflow-0.1.0.tar.gz` and the wheel. |

Every command in the task plan's Validation Plan was run. None was substituted with a narrower form, and the documented `postgres`-marker exclusion rule was **not** invoked — the full container-backed suite executed.

### Validation Side Effects

- Before: working tree clean at `3dbbb68`; no staged, unstaged, or untracked non-ignored files.
- After: working tree clean at `3dbbb68`; no tracked file modified.
- Unexpected tracked-file changes: **none**.
- Generated (all git-ignored): `.venv/`, `.pytest_cache/`, `.ruff_cache/`, `.mypy_cache/`, `src/factorflow.egg-info/`, `__pycache__/` directories, and `dist/` from `uv build`. `dist/` is ignored only incidentally by the frontend-oriented `dist/` pattern — see IR-006.

## Findings

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 2 · **total 6**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | HIGH | Migration `0001` ships a unique index on `symbol` the approved story defers to CAP-001-E2-S1 |
| IR-002 | MEDIUM | DAC-E1-S1-6 / TC-COMP-314 verified against a guard defined inside the test file |
| IR-003 | MEDIUM | TC-COMP-292 (P1) has no implementing test but is recorded as "Covered" |
| IR-004 | MEDIUM | Fixture leaks databases when a test fails (cleanup outside `finally`) |
| IR-005 | LOW | Design-drift guards compare against a hardcoded copy, not the design document |
| IR-006 | LOW | `dist/` is git-ignored only incidentally |

### IR-001 — Migration `0001` ships a unique index on `symbol` that the approved story explicitly defers to CAP-001-E2-S1

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S1-2 (adjacent); impacts DAC-E2-2, DAC-E2-S1-3
- **Tasks**: T012, T010
- **Files**: `migrations/0001_extensions_owner_state.sql:17-18`; `tests/unit/test_migration_0001_matches_design.py:31-32`
- **Claim challenged**: T012 claims the migration was created "exactly as specified", and the story is the authority on what this story ships.
- **Observed evidence**: The shipped file contains `CREATE UNIQUE INDEX idx_instrument_symbol ON instrument (symbol);` and `CREATE INDEX idx_instrument_active ON instrument (instrument_id) WHERE lifecycle = 'active';`. Both are absent from the story's Technical Details SQL block. The story states verbatim: *"A unique index on `symbol` is deliberately **not** added here: symbol uniqueness across lifecycle states is settled in CAP-001-E2-S1, which owns reactivation semantics."* The task plan's Notes repeat this: *"`idx_instrument_symbol` is a plain unique index in this migration"* appears in T012 while the Notes simultaneously say uniqueness *"is deliberately not enforced here"* — the plan contradicts itself. `component-design-market-data-store.md:182-183` does contain both indexes, and the code follows the design.
- **Expected evidence/behavior**: The approved story (revision `sha256:55570e14…`) is the specification this story implements. Either the migration omits the unique index, or the story and plan are corrected through the specification-review process to record the decision that the design wins.
- **Impact**: `CAP-001-E2-S1.md:90-93` states *"A unique index on `symbol` is added here"* and specifies `CREATE UNIQUE INDEX instrument_symbol_key ON instrument (symbol);`. That story will now create a second, redundant unique index on an already-uniquely-indexed column under a different name. Because the migration convention is forward-only and an applied file is never edited (`migrations/README.md`), `0001` cannot be corrected in place once applied — remediation cost rises with every downstream story. The end-state semantics are compatible (DAC-E2-S1-3 reactivates the existing row rather than inserting a duplicate), so no runtime break is expected; the defect is that an approved constraint was overridden silently and an owning story was pre-empted.
- **Required remediation**: Reconcile the conflict and record the outcome before Doc Sync. Either (a) amend `CAP-001-E1-S1.md` and the task plan through the normal specification path to state that both indexes ship in `0001` per design §2.3, and amend `CAP-001-E2-S1.md` to drop its duplicate `instrument_symbol_key` creation; or (b) remove both index statements from `0001` to match the story. Option (a) is the likely correct resolution given the design and the passing test suite, but it is a specification decision, not one this review can make unilaterally.

### IR-002 — DAC-E1-S1-6 and TC-COMP-314 are verified against a guard defined inside the test file

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S1-6, AC-15
- **Tasks**: T009
- **Files**: `tests/integration/test_migration_idempotence.py:31-56`
- **Claim challenged**: That TC-COMP-314 ("applying 0001 twice… no statement runs") is covered by this story.
- **Observed evidence**: `_apply_0001_if_not_recorded` — the function containing the entire skip decision — is defined in the test module. No module under `src/` implements it. The test asserts its own helper returns `True` then `False`.
- **Expected evidence/behavior**: A test should fail when production behaviour regresses. No production change can affect this test's outcome, because the behaviour under test lives only in the test.
- **Impact**: The idempotence AC has no shipped implementation behind it. This is largely an artifact of correct scoping — the migrator is genuinely CAP-001-E1-S2 — and both the task plan and the test docstring disclose it honestly, which is why this is MEDIUM rather than HIGH. The risk is that the coverage matrix now records TC-COMP-314 as satisfied, so E1-S2 may not re-verify it against the real migrator.
- **Required remediation**: No code change required in this story. Ensure CAP-001-E1-S2 re-implements TC-COMP-314 against the actual migrator and that the coverage matrix does not treat this story's test-local proof as final coverage.

### IR-003 — TC-COMP-292 (P1) has no implementing test but is recorded as "Covered"

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-1
- **Tasks**: T014
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/coverage-matrix.md:324`
- **Claim challenged**: The T014 checkpoint asserts "All eight mandatory TC-IDs (TC-COMP-292, 293, 309–314) are green."
- **Observed evidence**: No test references TC-COMP-292. `grep` across `tests/` returns nothing. The coverage matrix marks DAC-E1-1 / TC-COMP-292 as "Covered" at priority P1. The task plan's Notes concede it "has no dedicated implementation task… verified by inspection at T014".
- **Expected evidence/behavior**: A P1 TC-ID marked "Covered" should have an implementing test, or the matrix should mark it as structurally verified so the gap is visible.
- **Impact**: The claim of eight green TC-IDs is not accurate — seven are tested and one is asserted by inspection. The inspection conclusion itself is correct (I verified no second datastore is introduced anywhere in the change set), so this is an evidence-bookkeeping defect rather than a functional one.
- **Required remediation**: Either add an assertion that all story tables reside in a single database, or amend the coverage matrix so TC-COMP-292's status distinguishes structural verification from test coverage. Correct the T014 checkpoint text either way.

### IR-004 — Fixture leaks databases when a test fails

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T004, T014
- **Files**: `tests/conftest.py:44-67`
- **Claim challenged**: That the per-test database fixture cleans up after itself.
- **Observed evidence**: The `pg_terminate_backend` and `DROP DATABASE` calls sit after `yield` but **outside** the `try/finally`. Only `admin_conn.close()` is protected. When a test fails or errors, pytest throws into the generator at the `yield`, so both cleanup statements are skipped and the database persists for the life of the session container.
- **Expected evidence/behavior**: Teardown that must always run belongs in `finally`.
- **Impact**: Not observable today — all 17 tests pass, and the container is discarded at session end. It becomes real during red-phase TDD or a failing CI run with many tests: orphaned databases accumulate inside the shared container and can exhaust connection or disk limits. Contained and low-probability, hence MEDIUM.
- **Required remediation**: Move the terminate/drop pair into the `finally` block so cleanup runs on both the passing and failing paths.

### IR-005 — Design-drift guards compare against a hardcoded copy, not the design document

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T010, T011
- **Files**: `tests/unit/test_migration_0001_matches_design.py:17-40`; `tests/unit/test_applied_migrations_ddl_matches_design.py:13-23`
- **Claim challenged**: T010's stated purpose — "catches silent drift between the design doc and the shipped file".
- **Observed evidence**: Both tests define `EXPECTED_SQL` / `EXPECTED_DDL` as Python string literals annotated "Verbatim from component-design-market-data-store.md". Neither test opens, reads, or parses that document. The comparison is file-against-copy, not file-against-design.
- **Expected evidence/behavior**: A drift guard between two artifacts must read both. As written, editing the design leaves these tests green, which is the exact scenario they were written to catch.
- **Impact**: The guard detects changes to the SQL file, which has some value, but not the drift it advertises. IR-001 illustrates the cost concretely: the hardcoded literal already encodes the two disputed indexes, so this test now actively pins the implementation to the side of the contradiction the story rejects.
- **Required remediation**: Extract the SQL block from `component-design-market-data-store.md` §2.2/§2.3 at test time (fenced-block parse keyed by section heading) and compare the shipped artifact against that, so a design edit fails the test.

### IR-006 — `dist/` is git-ignored only incidentally

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T001
- **Files**: `.gitignore:12-14`
- **Claim challenged**: That the bootstrap `.gitignore` covers this story's Python build output.
- **Observed evidence**: `uv build` (a documented validation command) writes `dist/`. The only `dist/` entry sits under the `# Frontend (created by later stories)` heading alongside `node_modules/`. The Python section covers caches and `*.egg-info/` but not build output.
- **Expected evidence/behavior**: Python build artifacts should be ignored under the Python section deliberately.
- **Impact**: None today — the pattern matches regardless. If a later story reorganises the frontend section, Python wheels could start showing as untracked and be committed accidentally.
- **Required remediation**: Add `dist/` (and optionally `build/`) to the Python section, or annotate the existing entry as covering both toolchains.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T012 deviates from the story on both indexes** (IR-001). The deviation follows `component-design-market-data-store.md` §2.3, so it is not arbitrary, but it is unjustified against the story and plan text and was not recorded as a deviation anywhere in the task plan.
- **The task plan contradicts itself on `idx_instrument_symbol`.** T012 instructs creating it; the Notes state uniqueness "is deliberately not enforced here". A coding agent following this plan could not satisfy both.
- **T013 is a documented placeholder** — legitimately NOT APPLICABLE, disclosed in the plan's Notes.
- **`T011-impl` is a non-sequential task ID.** The plan explains and permits this. Bookkeeping only.
- **Ruff `extend-exclude` for `docs/` and `design-system/` was added under T016**, beyond the task's literal "run validation" wording. It is justified in an in-file comment (ruff would otherwise reformat Python fences inside approved design documents) and is the correct call — a justified deviation, not scope leakage.
- **Bootstrap scope** (`pyproject.toml`, `src/` layout, test harness) exceeds a pure schema story but is explicitly authorised by the plan's Summary and Notes and by the tech stack document.
- **Other stories' task plans in the branch range** are separate commits for separate stories; not attributed to this story.
- **All 17 task checkboxes were marked complete.** Sixteen are genuinely done. T012 is checked but PARTIAL — a checkbox that overstates the evidence.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Resolve IR-001 — reconcile the story, task plan, and design on whether `idx_instrument_symbol` and `idx_instrument_active` belong in migration `0001`, and align `CAP-001-E2-S1` so it does not create a duplicate unique index. Address IR-004 (fixture cleanup) alongside it, as it is a small contained change. IR-002, IR-003, IR-005, and IR-006 may be carried into rework or accepted as tracked debt at the owner's discretion, but IR-003's coverage-matrix claim should be corrected before Doc Sync records this story as fully covered. Re-run this review afterwards.
- **Warnings accepted downstream**: N/A — verdict is CHANGES-REQUIRED.
