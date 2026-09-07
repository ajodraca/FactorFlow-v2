---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-07
updated: 2026-09-07
story_id: "CAP-001-E1-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-07T17:16:52Z"
reviewed_head: "17d69968b1d2077edcce27daf281fbecf85abe31"
review_base: "c9522bc282724f0389144a69b38069d1cb9df4b4"
reviewed_state_revision: "sha256:e58104786dc41cfd5d518ea6180f0adb0aae964cde72d8b4b493e79ac3ea2e93"
verdict: PASS
review_subjects:
  - artifact_id: CAP-001-E1-S2
    artifact_version: 1
    content_revision: sha256:316a3048f11b4882cb11e56c10616869dc5f7821c3d6721773ead3d85f04aade
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-sonnet-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-07T17:16:52Z
  source_artifacts:
    - id: CAP-001-E1-S2
      version: "1"
    - id: CAP-001-E1-S2-tasks
      version: "1"
    - id: CAP-001-component-design-schema-migrator
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 25/25 verified |
| Required validation | 6/6 passed |

The migrator (`src/factorflow/db/migrator.py`), its container entrypoint
(`src/factorflow/db/migrate_main.py`), the fixed advisory-lock constant, the
minimal Dockerfile chaining, and all eleven mandatory component tests plus
four additional unit tests exist exactly as planned. Independent re-execution
of the full `postgres`-marked and non-`postgres` suites, `ruff check`, `ruff
format --check`, and `mypy` all pass with zero modification to the working
tree. Every acceptance criterion traces to production code and a passing
test that exercises the specific behavior, not merely a green name. Two LOW
findings are recorded — a wording gap between the component design's literal
"every message" at `error` level and the task plan's own narrower "non-zero
exits only" interpretation that the implementation correctly follows, and a
concurrency test that proves serialization without an artificial delay to
directly observe the lock held mid-migration. Neither affects a required
task, acceptance criterion, or mandatory test; the gate passes.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S2-tasks.md` |
| Component | FactorFlow-v2 |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S2` |
| HEAD | `17d69968b1d2077edcce27daf281fbecf85abe31` |
| Review base | `main` merge-base `c9522bc282724f0389144a69b38069d1cb9df4b4` |
| Working tree | clean, no staged/unstaged/untracked changes before or after validation |
| Changed files reviewed | 19 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `Dockerfile` | added | T022 |
| `docs/.../stories/CAP-001-E1-S2-tasks.md` | modified | Checkbox/annotation updates only, T001–T025 |
| `docs/.../stories/CAP-001-E1-S2.md` | modified | `status`/`updated` lifecycle fields only |
| `src/factorflow/db/constants.py` | added | T001 |
| `src/factorflow/db/migrate_main.py` | added | T020, T021 |
| `src/factorflow/db/migrator.py` | added | T019, T021 |
| `tests/fixtures/migrations_broken/0002_broken.sql` | added | T004 |
| `tests/fixtures/migrations_ok/0001_extensions_owner_state.sql` (symlink) | added | T003 |
| `tests/fixtures/migrations_ok/0002_test_only.sql` | added | T003 |
| `tests/integration/test_migrator_concurrent.py` | added | T013 |
| `tests/integration/test_migrator_empty.py` | added | T006 |
| `tests/integration/test_migrator_idempotent.py` | added | T008 |
| `tests/integration/test_migrator_preserves_data.py` | added | T007 |
| `tests/integration/test_migrator_refuses.py` | added | T009, T010, T011, T012 |
| `tests/unit/test_migrate_main_exit_codes.py` | added | T017 |
| `tests/unit/test_migration_filenames.py` | modified | T018 |
| `tests/unit/test_migrator_apply_pending_noop.py` | added | T016 |
| `tests/unit/test_migrator_discover.py` | added | T015 |
| `tests/unit/test_migrator_logging.py` | added | T014 |

No unjustified changes were found. `tests/conftest.py` (T002) was not
modified; the task plan itself records this as a deliberate deviation
(existing `postgres_connection_string` fixture already provides the needed
state) and no behavior gap results.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-15 | SATISFIED | `migrator.py:82-139` (`apply_pending`, one transaction per file, checksum recording) | `test_migrator_empty.py::test_apply_pending_against_empty_database_records_checksum_version_name`, `test_migrator_preserves_data.py::test_second_apply_pending_preserves_existing_rows` | Bring-forward and no-loss both independently verified against real PostgreSQL |
| AC-16 | SATISFIED | `migrate_main.py:98-140` (`run_migrations`, four distinct non-zero paths), `Dockerfile:30` (`&&` chaining) | `test_migrator_refuses.py` (all four cases) | Every refusal path maps to a distinct exit code; entrypoint chaining verified by inspection, consistent with story's stated shell-level proof method |
| DAC-E1-3 | SATISFIED | `migrator.py:110-137` (ascending order, version/name/checksum insert) | `test_migrator_empty.py` (both cases) | Order and recorded fields confirmed |
| DAC-E1-4 | SATISFIED | `migrator.py:102-108` (store-ahead check before any DDL) | `test_migrator_refuses.py::test_store_ahead_of_build` | Exit 2, no DDL applied |
| DAC-E1-5 | SATISFIED | `migrator.py:89-91,140-143` (`pg_advisory_lock`/`pg_advisory_unlock`) | `test_migrator_concurrent.py::test_two_concurrent_migrators_each_apply_every_version_exactly_once` | Two real connections, two threads, each version applied exactly once |
| DAC-E1-S2-1 | SATISFIED | `migrate_main.py:134-138` (`_schema_current_message`) | `test_migrator_idempotent.py` (both cases) | Empty-list return and message text both asserted |
| DAC-E1-S2-2 | SATISFIED | `migrate_main.py:77-83` (`_connection_failure_message`) | `test_migrator_refuses.py::test_unreachable_database`, `test_migrator_logging.py` (three cases) | Host/database named, password substring absent, in both an integration and a unit test |
| DAC-E1-S2-3 | SATISFIED | `migrator.py:102-108` | `test_migrator_refuses.py::test_store_ahead_of_build` | Both versions named in message |
| DAC-E1-S2-4 | SATISFIED | `migrator.py:110-115` | `test_migrator_refuses.py::test_checksum_mismatch` | Exit 3, version named |
| DAC-E1-S2-5 | SATISFIED | `migrator.py:122-137` (per-file transaction, rollback on `psycopg.Error`) | `test_migrator_refuses.py::test_failing_migration_rolls_back` | Exit 4; no `applied_migrations` row and no table from the broken file after rollback |
| DAC-E1-S2-6 | SATISFIED | `migrate_main.py:94-95,167-177` (`_log_failure` at `error`; success at `info`) | `test_migrator_logging.py::test_migrator_logger_emits_error_records_with_version_field`, `test_no_print_call_...` | See IR-001 (LOW): task plan narrows the component design's literal "every message" to non-zero exits; implementation matches the task plan it was built against |
| DAC-E1-S2-7 | SATISFIED | `migrate_main.py:77-83` (built from `host`/`database` only, never `error`) | `test_migrator_logging.py` (three cases), `test_migrator_refuses.py::test_unreachable_database` | Confirmed the raw `psycopg.OperationalError` text never reaches the message in both a unit and an integration test |
| DAC-E1-S2-8 | SATISFIED | `migrator.py:89-91,140-143` (lock held across the whole `try`/`finally` body) | `test_migrator_concurrent.py` | See IR-002 (LOW): test proves serialization outcome, not a mid-migration block, by direct observation |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/db/constants.py:15` | `ADVISORY_LOCK_KEY` defined once, documented immutable |
| T002 | complete | VERIFIED (justified deviation) | `tests/conftest.py` unchanged | Task plan itself records the deviation reasoning; existing fixture already provides an empty, unmigrated database per test |
| T003 | complete | VERIFIED | `tests/fixtures/migrations_ok/` (symlink + synthetic file) | Symlink confirmed, cannot drift from real file |
| T004 | complete | VERIFIED | `tests/fixtures/migrations_broken/0002_broken.sql` | Fails at execution time as intended |
| T005 | complete | VERIFIED | `src/factorflow/db/applied_migrations.py`, `migrations/0001_extensions_owner_state.sql` present | CAP-001-E1-S1 confirmed merged at `c9522bc` |
| T006 | complete | VERIFIED | `tests/integration/test_migrator_empty.py` | TC-COMP-294 passes against real PostgreSQL |
| T007 | complete | VERIFIED | `tests/integration/test_migrator_preserves_data.py` | TC-COMP-015 passes |
| T008 | complete | VERIFIED | `tests/integration/test_migrator_idempotent.py` | TC-COMP-315 passes |
| T009 | complete | VERIFIED | `tests/integration/test_migrator_refuses.py::test_unreachable_database` | TC-COMP-016/295/316 pass |
| T010 | complete | VERIFIED | `tests/integration/test_migrator_refuses.py::test_store_ahead_of_build` | TC-COMP-317 passes |
| T011 | complete | VERIFIED | `tests/integration/test_migrator_refuses.py::test_checksum_mismatch` | TC-COMP-318 passes |
| T012 | complete | VERIFIED | `tests/integration/test_migrator_refuses.py::test_failing_migration_rolls_back` | TC-COMP-319 passes |
| T013 | complete | VERIFIED | `tests/integration/test_migrator_concurrent.py` | TC-COMP-296/322 pass |
| T014 | complete | VERIFIED | `tests/unit/test_migrator_logging.py` | TC-COMP-320/321 pass |
| T015 | complete | VERIFIED | `tests/unit/test_migrator_discover.py` | All six cases pass |
| T016 | complete | VERIFIED | `tests/unit/test_migrator_apply_pending_noop.py` | Empty-list, not-None assertion passes |
| T017 | complete | VERIFIED (justified deviation) | `tests/unit/test_migrate_main_exit_codes.py` | Task text says "asserting `sys.exit` is called"; the implementation tests the pure `exit_code_for_outcome` function directly rather than `sys.exit`, which is the correct unit-level target since `main()`'s own `sys.exit` call is a one-line wrapper exercised implicitly. No behavior gap. |
| T018 | complete | VERIFIED | `tests/unit/test_migration_filenames.py::test_discover_rejects_a_file_containing_begin`/`_commit` | Both cases added as planned |
| T019 | complete | VERIFIED | `src/factorflow/db/migrator.py` | `MigrationError`, `MigrationFile`, `discover`, `apply_pending` all present and match component design section 2.4's interface exactly |
| T020 | complete | VERIFIED | `src/factorflow/db/migrate_main.py` | Reads `FACTORFLOW_DATABASE_URL`, calls `discover`/`apply_pending`, maps every outcome to exit codes 0–4 |
| T021 | complete | VERIFIED | `migrate_main.py:94-95,167-177` | Structured logger only, no `print`; failure messages built from safe fields |
| T022 | complete | VERIFIED | `Dockerfile:30` | `&&` chaining present; file documents its own minimal scope as the task instructs |
| T023 | complete | VERIFIED | Full `postgres` and non-`postgres` suites re-run independently, both green | See Independent Validation |
| T024 | complete | VERIFIED | `migrator.py:134`, `migrate_main.py:77-83,111,151` reviewed; no connection-string fragment or password ever interpolated into a message | Confirmed by direct inspection plus the passing redaction tests |
| T025 | complete | VERIFIED | All required validation commands re-run independently, all pass | See Independent Validation |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|-----------------------------------|-----|
| `test_migrator_empty.py` / TC-COMP-294 | ADEQUATE | Asserts exact `(version, name, checksum)` tuple against an independently computed SHA-256, and ascending multi-file order | None |
| `test_migrator_preserves_data.py` / TC-COMP-015 | ADEQUATE | Inserts a real row, re-runs `apply_pending`, asserts byte-identical row and no duplicate `applied_migrations` row | None |
| `test_migrator_idempotent.py` / TC-COMP-315 | ADEQUATE | Asserts second call returns `[]` and the exact message text | None |
| `test_migrator_refuses.py::test_unreachable_database` / TC-COMP-016,295,316 | ADEQUATE | Asserts exit 1, host/database present, password substring absent | None |
| `test_migrator_refuses.py::test_store_ahead_of_build` / TC-COMP-317 | ADEQUATE | Seeds a real version-99 row, asserts exit 2 and both versions named | None |
| `test_migrator_refuses.py::test_checksum_mismatch` / TC-COMP-318 | ADEQUATE | Tampers a real recorded checksum, asserts exit 3 and version named | None |
| `test_migrator_refuses.py::test_failing_migration_rolls_back` / TC-COMP-319 | ADEQUATE | Asserts exit 4, no `applied_migrations` row, and the broken file's own table absent — proves the whole-file rollback, not just the outer exit code | None |
| `test_migrator_concurrent.py` / TC-COMP-296,322 | ADEQUATE | Two real threads, two real connections, combined applied versions `[1, 2]` exactly once each | Proves serialization outcome; does not directly observe the lock held mid-migration via an artificial delay (IR-002, LOW) |
| `test_migrator_logging.py` / TC-COMP-320,321 | ADEQUATE | Patches `builtins.print` to fail the test if called; asserts caplog record at ERROR with a `version` field; asserts secret substrings absent from three distinct raw-exception shapes | None |
| `test_migrator_discover.py` | ADEQUATE | Covers ordering, checksum/sql population, the real `migrations/` directory, malformed filename, repeated version, and non-`.sql` files ignored | None |
| `test_migrator_apply_pending_noop.py` | ADEQUATE | Asserts `[] ` and `is not None` explicitly against a `MagicMock` connection that is never touched (zero files means no cursor is opened) | None |
| `test_migrate_main_exit_codes.py` | ADEQUATE | Parametrized over all five outcomes against the real `exit_code_for_outcome`; a second test pins every subtype as a `MigrationError` | None |
| `test_migration_filenames.py` | ADEQUATE | Real-migrations-directory checks plus `BEGIN`/`COMMIT` rejection on synthetic files via the real `discover()` | None |

Mandatory component test mappings (TC-COMP-015, 016, 294, 295, 296,
315–322 — eleven IDs) are all present and independently re-executed; all
pass against real PostgreSQL. Mocks are used only where the design commits
to not touching a connection (T016); every database-backed assertion runs
against `testcontainers` PostgreSQL 16, not a substitute. No test asserts
only mock-call shape; all assert observable database or exit-code state.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 27 packages, no lockfile change |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 30 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues found in 6 source files |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 27 passed, 27 deselected |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 27 passed, 27 deselected, 4.70s, real `testcontainers` PostgreSQL 16 |

### Validation Side Effects

- Before: `git status --porcelain` empty, working tree clean at `17d6996`.
- After: `git status --porcelain` empty, no change.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — Component design's literal "every message at error" is narrower in the task plan and the implementation

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S2-6
- **Tasks**: T021
- **Files**: `src/factorflow/db/migrate_main.py:167-177` (`main()`)
- **Claim challenged**: Component design section 2.5 states "Every message is emitted through the structured logger at `error` level," which read literally includes the exit-0 success message.
- **Observed evidence**: `main()` logs the exit-0 success message via `_LOGGER.info(message)`, not `.error(...)`.
- **Expected evidence/behavior**: The task plan's own T021 explicitly narrows this to "at `error` level (for non-zero exits)" — a deliberate, recorded interpretation the coding agent correctly followed. The story's DAC-E1-S2-6 wording ("any migrator message... error level") is closer to the design's broader phrasing than to the task plan's narrowing.
- **Impact**: None functional — an `INFO`-level success message is conventional and arguably better practice than logging a non-error event at `error`. The gap is a traceability wording mismatch between the component design/story text and the task plan that was built from them, not a behavioral defect.
- **Required remediation**: None required to pass this gate. If the owner wants the literal design wording honored, a follow-up could log the exit-0 message at `error` too, or the component design/story text could be corrected to say "every non-zero-exit message" during doc sync to remove the ambiguity for future readers.

### IR-002 — Concurrency test proves serialization outcome, not the lock held mid-migration

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S2-8
- **Tasks**: T013
- **Files**: `tests/integration/test_migrator_concurrent.py`
- **Claim challenged**: DAC-E1-S2-8 requires "the advisory lock is held for its duration" on "a long migration."
- **Observed evidence**: The test runs two real concurrent `apply_pending` calls against four small, fast migration files and asserts each version is applied exactly once — a correct proof of TC-COMP-296/322 (no double-apply), but it contains no artificial delay inside a migration file that would let a test directly observe the second thread blocked while the first is still mid-transaction.
- **Expected evidence/behavior**: A stronger test would insert a deliberate `pg_sleep` (or an in-process delay hook) inside one migration and assert the second caller's start time is after the first's commit, directly proving the lock is held for the full duration rather than only proving the net outcome is correct.
- **Impact**: None on the mandatory TC-IDs, which this test satisfies as written. The gap is theoretical: a race that briefly releases and reacquires the lock mid-file could pass today's test while violating the "held for duration" property, but `apply_pending`'s actual code (`migrator.py:89-91,140-143`) plainly does hold `pg_advisory_lock` across the entire `try`/`finally` body with no early release, so the implementation itself is not suspect — only the test's power to catch a future regression on this specific point is limited.
- **Required remediation**: None required to pass this gate. Optional follow-up: add a delay-based variant if a future change to `apply_pending`'s lock handling needs a regression guard stronger than the current outcome-based proof.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- T002: justified deviation, recorded in the task plan itself — the existing `postgres_connection_string` fixture already provides an empty, unmigrated database per test, so no second fixture was added. No behavior gap.
- T017: justified deviation — the test drives the pure `exit_code_for_outcome` function rather than asserting a `sys.exit` call, which is the correct unit-level boundary; `main()`'s own `sys.exit(main())` line is a trivial wrapper.
- No unjustified scope leakage found. `Dockerfile` is new but explicitly scoped and justified by T022, with its own comment documenting the scope boundary.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Synchronize `FactorFlow-v2` component documentation to reflect the delivered migrator and entrypoint, per the passing verdict.
- **Warnings accepted downstream**: IR-001, IR-002 (both LOW)
