---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S8-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-25
last_reworked_review: CAP-002-E2-S8-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-10-17T22:50:00Z
  source_artifacts:
    - id: CAP-002-E2-S8
      version: "1"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S8 — Classification Settings, Qualifying-Run Claim and Interrupted-Build Reclaim

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S8.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-tasks`
**Date**: 2026-10-17

## Summary

Delivers the scheduler's data-side half: `ClassificationSettings` (`FACTORFLOW_CLASSIFICATION_*`, poll 5 s, timeout 300 s, poll strictly below timeout) in `src/factorflow/classification/settings.py`; `claim_next_set` and `reclaim_interrupted_sets` in `src/factorflow/classification/scheduler.py`; and the three SQL files `qualifying_run.sql`, `claim_set.sql` and `reclaim_interrupted.sql` that `component-design-classification-scheduler.md` section 2.4 gives. The asyncio loop, the build handoff and the `app.py` wiring are CAP-002-E2-S9 and `classification-api` and are not touched. The SQL and settings model are copied from the design; the work is the tests that prove the claim picks only `succeeded`/`partial` runs, oldest first, once each, never beside a `building` set, stamps the Chicago date, and that a stale `building` set is recorded `failed` with the fixed reason.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-10 | Classify without user action after `succeeded`/`partial` runs; never after `failed`, `cancelled`, `abandoned` | T003, T004, T005, T006, T007, T008, T011, T012, T013, T015, T016, T017 |
| AC-20 | Set never half-written; a failure records its reason (build side) | T009, T010, T012, T016, T017 |
| DAC-E2-4 | `run_id` unique; a run acquires at most one set; `failed`/`cancelled`/`abandoned` runs never acquire one | T005, T008, T011, T016, T017 |
| DAC-E2-12 | Interrupted `building` set recorded `failed` with the fixed reason, before any new claim | T009, T010, T012, T016, T017 |
| DAC-E2-S8-1 | Only `succeeded` and `partial` runs are claimed | T004, T016, T017 |
| DAC-E2-S8-2 | Claimed in `ended_at` order; a run with a set is never claimed again | T005, T016, T017 |
| DAC-E2-S8-3 | Claim while a set is `building` returns `None`, inserts nothing | T006, T016, T017 |
| DAC-E2-S8-4 | Claim at 23:30 America/Chicago stamps the Chicago date | T007, T016, T017 |
| DAC-E2-S8-5 | A `failed` set for run A does not block later run B, and A is not reclaimed | T008, T017 |
| DAC-E2-S8-6 | Reclaim records a stale `building` set `failed`; `complete`/`failed` unchanged; next run claimable | T009, T010, T016, T017 |
| DAC-E2-S8-7 | Poll below 1 s, or poll not below timeout, fails naming the variable and not its value | T003, T015 |

## Phase 1: Setup

**Purpose**: Confirm the hard prerequisite exists and learn the package's current state before any test presumes it.

- [x] T001 Confirm CAP-002-E2-S1 has landed on the working branch: `src/factorflow/db/migrations/0006_classifications.sql` must exist and define `classification_set` with `idx_classification_set_single_building` and the `run_id` unique constraint (CAP-002-E1-S1's `0005` is its transitive prerequisite). If `0006` is absent, STOP and report that hard dependency CAP-002-E2-S1 is not implemented. Also note whether `src/factorflow/classification/__init__.py` exists (CAP-002-E2-S2 creates it): T014 creates it only if absent. Read `src/factorflow/runs/journal.py` (claim style), `src/factorflow/coverage/service.py` lines 33-36 (`_SQL_DIR = Path(__file__).parent / "sql"` and `.read_text()` at import: the pattern the SQL loading follows), `src/factorflow/config/settings.py` (`_EnvNamedSettings`, `RunSettings`) and `src/factorflow/api/app.py` lines 104-150 (`ConnectionPool` use)

**Checkpoint**: `0006` exists; the package's state is known.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the expected behaviour from the acceptance criteria and mapped test cases.

Database tests are `@pytest.mark.postgres` with `# Implements TC-COMP-nnn` above each. Every integration test gives `claim_next_set` and `reclaim_interrupted_sets` a real `psycopg_pool.ConnectionPool` over the test database (`ConnectionPool(conninfo, min_size=1, max_size=2, open=True)`, closed in the fixture's `finally`), because the design's signatures take the pool. `ended_at` is always set explicitly so `ended_at` order is deterministic.

- [x] T002 Create `tests/integration/scheduler_support.py` (a plain module, not `conftest.py`, because `tests/conftest.py` is delivered; no pytest fixtures; every helper that writes commits). It must not import `tests/integration/engine_support.py`, which CAP-002-E2-S2 owns and this story does not depend on (see Notes). Contents: `migrate_all(connection_string) -> None` applying `discover(MIGRATIONS_DIR)` (import `MIGRATIONS_DIR` from `factorflow.db.migrate_main`) through `apply_pending` and asserting `applied_migrations` holds version 6; `open_pool(connection_string)` returning an open pool; `add_run(conn, state, ended_at=None) -> UUID` inserting an `acquisition_run` that satisfies `acquisition_run_claim_agrees` and `acquisition_run_terminal_has_end` (`history_depth_years = 1`; terminal states take `ended_at`, default `now()`; `running` takes `started_at`, `claimed_by`, `heartbeat_at`; `requested` takes none; only one `running` row may exist at a time, `idx_acquisition_run_single_active`); `add_set(conn, run_id, state, classification_date=date(2026, 10, 1)) -> UUID` inserting a `classification_set` row that satisfies the terminal-shape CHECKs (a `complete` row carries `ended_at`, `latest_trading_day`, `active_instruments`; a `failed` row carries `ended_at` and `failure_reason`); `set_rows(conn) -> list[tuple]` returning `(set_id, run_id, state, failure_reason)` ordered by `started_at, set_id`. (depends on T001)
- [x] T003 [P] Implement TC-COMP-082 (Invalid poll interval settings fail naming the variable) in `tests/unit/test_classification_settings.py`, using `monkeypatch.setenv`/`delenv` for every case and `pytest.raises(ConfigurationError)` (from `factorflow.config.settings`) like `tests/unit/test_settings_validation.py`: `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS=0.5` -> the message contains `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS` and does not contain `0.5`; poll `45` with timeout `30` -> the message names both `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS` and `FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS` and contains neither `45` nor `30`; poll equal to timeout (`60` and `60`) is also refused (the invariant is strictly less than). Additional cases in the same file (AC-10, DAC-E2-S8-7): no variables set gives `poll_interval_seconds == 5.0` and `build_timeout_seconds == 300.0`; both variables accepted at a valid pair (`2` and `10`); timeout `0.5` -> names `FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS`, not `0.5`; a non-numeric poll (`abc`) names the variable and not `abc`; the class derives from `_EnvNamedSettings` and its `env_prefix` is `FACTORFLOW_CLASSIFICATION_`. Import `ClassificationSettings` from `factorflow.classification.settings` (depends on T001)
- [x] T004 Implement TC-COMP-077 (Only succeeded and partial runs are claimed) in `tests/integration/test_scheduler_claim.py` (module-local fixture: `migrate_all` on `postgres_connection_string`, a pool, a connection, all closed in `finally`): seed one run per state `failed`, `cancelled`, `abandoned`, `requested` and `running` (the latter two with no set) and call `claim_next_set(pool)`; assert it returns `None` and `set_rows` is empty. Then seed one `succeeded` run and assert `claim_next_set` returns a `ClaimedSet` whose `run_id` is that run and whose `set_id` names a `building` row; reset the database for the `partial` case (parametrize over `succeeded` and `partial`, each with the non-qualifying runs present) (depends on T002)
- [x] T005 Implement TC-COMP-078 (Qualifying runs claimed in ended_at order, once each) in `tests/integration/test_scheduler_claim.py`: three qualifying runs inserted out of order (`ended_at` second, third, first; mix `succeeded` and `partial`); claim over three iterations, and between claims complete the claimed set so the single-building index does not refuse the next (`UPDATE classification_set SET state='complete', ended_at=now(), latest_trading_day=..., active_instruments=0 WHERE set_id=... AND state='building'` as the test's own SQL; this is the only `UPDATE` in the test and carries the guard); assert the three `run_id`s come back in `ended_at` order, a fourth claim returns `None`, and `set_rows` holds exactly three sets, one per run (DAC-E2-4) (depends on T004, same file)
- [x] T006 Implement TC-COMP-079 (Claim while a set is building returns None) in `tests/integration/test_scheduler_claim.py`: run A with a `building` set (inserted with `add_set`) and a later qualifying run B; `claim_next_set` returns `None`, `set_rows` is unchanged (one row, A's, still `building`) and run B still has no set; the call must not raise (the `UniqueViolation` on `idx_classification_set_single_building` is swallowed and the transaction rolled back) (depends on T004, same file)
- [x] T007 Implement TC-COMP-080 (Claim at 23:30 Chicago stamps the Chicago date) in `tests/integration/test_scheduler_claim.py`, using the `at` keyword that DEC-0125 adds to `claim_next_set`: parametrize over a summer instant `datetime(2026, 10, 15, 23, 30, tzinfo=ZoneInfo("America/Chicago"))` (04:30 UTC on 16 October, so a UTC-date stamp would fail) and a winter instant `datetime(2026, 12, 15, 23, 30, tzinfo=ZoneInfo("America/Chicago"))`; assert the persisted `classification_date` equals the Chicago date (`date(2026, 10, 15)`, `date(2026, 12, 15)`). Add one control with `at` omitted asserting `classification_date` equals the Chicago date of the database's own clock (`SELECT (now() AT TIME ZONE 'America/Chicago')::date`, read in the same test) (depends on T004, same file)
- [x] T008 Implement TC-COMP-081 (Failed set for run A does not block later run B) in `tests/integration/test_scheduler_claim.py`: run A (`succeeded`, earlier `ended_at`) with a `failed` set (reason supplied), run B (`partial`, later `ended_at`) with none; the first claim returns B, the next returns `None`, and `set_rows` holds A's `failed` set unchanged and B's `building` set, with no second set for A (DAC-E2-4: a failed run is never retried) (depends on T004, same file)
- [x] T009 Implement TC-COMP-168 (reclaim_interrupted_sets fails stale building sets only) in `tests/integration/test_scheduler_restart.py` (module-local fixture as T004; file created by this story, and CAP-002-E2-S9 appends its restart-ordering cases to it): seed run A with a `building` set that has no `factor_classification`, `factor_input` or `classification_set_factor` rows, run B with a `complete` set, run C with a `failed` set (own reason, captured before) and a later qualifying run D with no set; call `reclaim_interrupted_sets(pool)`; assert A's set is `failed`, `ended_at` is set, `failure_reason` equals exactly `interrupted: the application restarted during the build`; B's and C's rows are byte-for-byte equal to the rows read before (compare the full row, including C's original reason); then `claim_next_set(pool)` returns D's run (the single-building index no longer blocks it) (depends on T002)
- [x] T010 Add reclaim edge tests to `tests/integration/test_scheduler_restart.py` (AC-20, DAC-E2-12, DAC-E2-S8-6; no mapped TC): with nothing `building`, `reclaim_interrupted_sets` returns an empty list and changes nothing; with one `building` set it returns one entry carrying that `set_id` and `run_id`, and logs one record at `WARNING` (use `caplog`) naming the set; a second call returns an empty list (idempotent). Assert the fixed reason contains none of the terms STD-UI v5 and v6 relabelled (`stock`, `download`, `Incomplete`, `score`, compared case-insensitively) (depends on T009, same file)
- [x] T011 [P] Add the race-path test to `tests/integration/test_scheduler_claim.py` (DAC-E2-4, AC-10; no mapped TC): `claim_next_set` must return `None`, not raise, when the `INSERT` hits the `run_id` unique constraint because the run acquired a set between the two statements (design 2.4). Reproduce it with `monkeypatch.setattr` on the module-level query-text constant that holds `qualifying_run.sql`, replacing it with `SELECT '<run id>'::uuid` for a run that already has a `failed` set; assert `None`, no new row, and that the pool still serves a following call (the connection was rolled back, not left in an aborted transaction) (depends on T008, same file)
- [x] T012 [P] Create `tests/unit/test_classification_scheduler_sql.py` (AC-10, AC-20, DAC-E2-4, DAC-E2-12; no mapped TC): read the three files under `src/factorflow/classification/sql/` and assert (a) `qualifying_run.sql` selects from `acquisition_run`, lists exactly `'succeeded'` and `'partial'` as states, excludes runs that have a `classification_set`, and orders by `r.ended_at ASC` with `LIMIT 1`; (b) `claim_set.sql` is a single `INSERT INTO classification_set` with state `'building'`, `RETURNING set_id`, and names `America/Chicago`; (c) `reclaim_interrupted.sql` contains `state = 'building'` in its `WHERE` and sets `state = 'failed'`; (d) none of the three contains `DELETE`, and `scheduler.py` source contains neither `DELETE FROM` nor an `UPDATE` of any of the four append-only classification tables (research-store 2.5 item 1); (e) `scheduler.py` does not import `asyncio` (the loop is S9, so a loop leaking in here is caught). Locate files with `Path(factorflow.classification.__file__).parent / "sql"` (depends on T001)
- [x] T013 [P] Add the claim-shape unit test to `tests/unit/test_classification_settings.py`'s sibling `tests/unit/test_classification_scheduler_shapes.py` (AC-10; no mapped TC): `ClaimedSet` is a frozen dataclass with exactly `set_id: UUID` and `run_id: UUID`; `ReclaimedSet` likewise; `claim_next_set`'s signature is `(pool, *, at=None)` with `at` keyword-only and defaulting to `None` (the loop in S9 calls `claim_next_set(pool)`; DEC-0125), checked with `inspect.signature`; `reclaim_interrupted_sets`'s signature is `(pool)` (depends on T001)

**Checkpoint**: All tests are written and fail (no settings, SQL or scheduler yet; the package marker already exists if CAP-002-E2-S2 landed first).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass.

- [x] T014 Create `src/factorflow/classification/__init__.py` only if T001 found it absent, with exactly one line, `"""Factor classification (CAP-002): engine, scheduler and reader."""`, terminated by a single LF newline and nothing else (no re-exports, no `__all__`, no logic, no blank or comment line). This is byte for byte the content CAP-002-E2-S2 T002 pins, so the two sibling stories add the same blob in either landing order or on concurrent branches. If the file already exists (CAP-002-E2-S2 created it), leave it untouched whatever its content (depends on T001)
- [x] T015 [P] Create `src/factorflow/classification/settings.py` with `ClassificationSettings(_EnvNamedSettings)` exactly as design section 2.3: `model_config = SettingsConfigDict(env_prefix="FACTORFLOW_CLASSIFICATION_")`, `poll_interval_seconds: float = Field(default=5.0, ge=1)`, `build_timeout_seconds: float = Field(default=300.0, ge=1)`. Import `_EnvNamedSettings` from `factorflow.config.settings`; do not copy it and do not edit `config/settings.py` (system design constraint 10). Add `@model_validator(mode="after")` raising `ValueError` when `poll_interval_seconds >= build_timeout_seconds`, with a message built only from the two variable names (`FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS must be less than FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS`), the pattern `Settings._check_timing_invariants` uses; the value must never appear. Do not add the model to the top-level `Settings` aggregate (depends on T003, T014)
- [x] T016 [P] Create `src/factorflow/classification/sql/qualifying_run.sql`, `claim_set.sql` and `reclaim_interrupted.sql`, each the SQL block in design section 2.4, with one change to `claim_set.sql` recorded under DEC-0125: the classification date reads `(COALESCE(%(at)s::timestamptz, CURRENT_TIMESTAMP) AT TIME ZONE 'America/Chicago')::date`. The reclaim reason literal is exactly `interrupted: the application restarted during the build`, and `reclaim_interrupted.sql` keeps `WHERE state = 'building'` and `RETURNING set_id, run_id`. No `BEGIN`/`COMMIT`; `-- ` header comments allowed. The `classification/sql/*.sql` package-data glob is CAP-002-E2-S1's (T016 there); do not edit `pyproject.toml` (depends on T012, T014)
- [x] T017 Create `src/factorflow/classification/scheduler.py` (synchronous functions only; `run_classification_loop` is CAP-002-E2-S9): `_SQL_DIR = Path(__file__).parent / "sql"` and the three statements read at import as `Final` constants, the query-text constant for `qualifying_run.sql` being a module attribute T011 patches; `@dataclass(frozen=True) ClaimedSet(set_id: UUID, run_id: UUID)` and `ReclaimedSet(set_id: UUID, run_id: UUID)`; `claim_next_set(pool: "ConnectionPool[Any]", *, at: datetime | None = None) -> ClaimedSet | None` running `qualifying_run.sql` then `claim_set.sql` in one transaction (`with pool.connection() as conn:`, commit on exit), returning `None` when no run qualifies, and returning `None` (not raising) on `psycopg.errors.UniqueViolation` from the insert, with the `try` placed around the `with` so the connection is rolled back before it returns to the pool; `reclaim_interrupted_sets(pool) -> list[ReclaimedSet]` running `reclaim_interrupted.sql` in one transaction and logging each reclaimed set at `WARNING` through `logging.getLogger(__name__)`. Type hints satisfy `mypy src`; follow `src/factorflow/api/app.py` for the `ConnectionPool[Any]` annotation (depends on T004-T013, T015, T016)

**Checkpoint**: `uv run pytest -m postgres tests/integration/test_scheduler_claim.py tests/integration/test_scheduler_restart.py` and `uv run pytest tests/unit/test_classification_settings.py tests/unit/test_classification_scheduler_sql.py tests/unit/test_classification_scheduler_shapes.py` pass.

---

## Phase 4: Integration

**Purpose**: Confirm the new package is clean beside the rest of the suite. This story wires nothing: the loop and the lifespan tasks are CAP-002-E2-S9 and `classification-api`.

- [x] T018 Run every command in the Validation Plan from the repository root and fix failures in files this plan names; a failure in any other file is reported, not patched. Confirm in particular that `tests/unit/test_research_sql_is_append_only.py` (CAP-002-E2-S1 T012) and, when CAP-002-E2-S2 has landed, `tests/unit/test_engine_sql_safety.py` (CAP-002-E2-S2 T010) pass unedited over `reclaim_interrupted.sql`, `qualifying_run.sql`, `claim_set.sql` and `scheduler.py`; both admit the reclaim shape (Resolved Conflicts), so a failure in either is reported, not patched (depends on T017)

**Checkpoint**: The whole suite is green with the scheduler data-side in place.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [x] T019 Re-read traceability: every test from T003-T009 carries `# Implements TC-COMP-nnn`, T010-T013 cite the AC or DEC they trace to in their docstring, and `git diff --stat` touches only the files named in this plan (the new package files, the three SQL files and the new test modules; no `pyproject.toml`, `app.py`, `config/settings.py` or delivered test file)
- [x] T020 After each TDD cycle in T003-T018 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S8-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S1 | hard | Existing graph edge. Creates `0006_classifications.sql` (`classification_set`, `idx_classification_set_single_building`, the `run_id` unique constraint) that every claim and reclaim test runs against, and the `classification/sql/*.sql` package-data glob that ships this story's SQL (T001) |
| CAP-002-E2-S2 | soft | Sibling, no edge in the graph. Both stories create `src/factorflow/classification/__init__.py` only if absent (S2 T002, S8 T014), with the same one-line docstring pinned byte for byte in both plans, so either landing order or concurrent branches yield one identical file and S2 owns `engine_support.py`, which this plan deliberately does not import; the contract between them is the `classification_set` table S1 creates and the `building` -> `complete`/`failed` transition. S8 imports no S2 code, so the two can be developed concurrently. S2's `tests/unit/test_engine_sql_safety.py` (T010) scans every file under `classification/`, including this plan's three SQL files and `scheduler.py`, and requires `state = 'building'` on every `UPDATE classification_set` and `set_id = %(set_id)s` only in `complete_set.sql` and `fail_set.sql`, so `reclaim_interrupted.sql` passes it whichever story lands first (T018) |
| CAP-002-E2-S9 | reverse | Consumes this story: its loop calls `reclaim_interrupted_sets(pool)` and `claim_next_set(pool)`, reads `ClaimedSet`, and appends cases to `tests/integration/test_scheduler_restart.py` |
| CAP-002-E1-S1 | context | Transitive through S1; supplies `0005` so `0006` is numbered without gaps. This plan imports nothing it creates |

### Task Dependencies
- T001: No dependencies
- T002: Depends on T001
- T003: Depends on T001, can run in parallel with every other test task
- T004: Depends on T002
- T005, T006, T007, T008: Depend on T004 (same file, shared fixture)
- T009: Depends on T002
- T010: Depends on T009 (same file)
- T011: Depends on T008 (same file as T004)
- T012, T013: Depend on T001, can run in parallel with every other test task
- T014: Depends on T001
- T015: Depends on T003, T014
- T016: Depends on T012, T014
- T017: Depends on T004-T013, T015, T016 (tests first)
- T018: Depends on T017
- T019: Depends on T018
- T020: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: T003 / T012 / T013 touch different files from each other and from the integration tests and can run in parallel; tests inside `test_scheduler_claim.py` (T004-T008, T011) are sequential, and `test_scheduler_restart.py` (T009-T010) is a separate chain that can run beside them
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
- DAC-E2-S8-1 / AC-10: runs in `failed`, `cancelled`, `abandoned`, `running`, `requested` are never claimed; `succeeded` and `partial` are (T004)
- DAC-E2-S8-2 / DAC-E2-4: three runs claimed in `ended_at` order, none twice (T005)
- DAC-E2-S8-3: a claim beside a `building` set returns `None` and inserts nothing (T006)
- DAC-E2-S8-4: the stamped date is the Chicago date at 23:30, in summer and in winter (T007)
- DAC-E2-S8-5: a failed run's set is not repeated while a later run is claimed (T008, T011)
- DAC-E2-S8-6 / DAC-E2-12: a stale `building` set becomes `failed` with the exact fixed reason; `complete` and `failed` sets unchanged; the next run is claimable (T009, T010)
- DAC-E2-S8-7: `0.5` poll, and poll not below timeout, fail naming the variable and not the value (T003)

---

## Notes

### Resolved Conflicts

- **Reclaim `UPDATE` shape: research-store 2.5 prose versus scheduler 2.4 SQL.** Research-store section 2.5 item 1 says `classification_set` admits one `UPDATE` shape "guarded by `WHERE set_id = %(set_id)s AND state = 'building'`", issued by the factor-engine and by the scheduler's start-up reclaim; the scheduler's `reclaim_interrupted.sql` is guarded by `WHERE state = 'building'` alone because it fails every orphaned row at once. Governing rule: the scheduler design is the more specific statement of its own SQL; DAC-E2-S8-6 requires every `building` row to become `failed`, which a per-`set_id` statement could not do in one pass; and the enforcement the designs specify asserts only the `state = 'building'` guard (research-store 2.5 item 2 and its section 7 "Append-only guard" row; TC-COMP-160 and factor-engine section 7 ask for no `set_id` guard). Two guards scan this file and both admit it. `tests/unit/test_research_sql_is_append_only.py` is created by CAP-002-E1-S1 T003 as an `rglob` over every `.sql` and `.py` under `src/factorflow/`, so it does see `classification/sql/*.sql`, and CAP-002-E2-S1 T012 requires only `state = 'building'` in every `UPDATE classification_set`, with no `WHERE set_id`. `tests/unit/test_engine_sql_safety.py` (CAP-002-E2-S2 T010) applies its mutation rules and the `state = 'building'` rule to every file under `classification/` and requires `set_id = %(set_id)s` only in `complete_set.sql` and `fail_set.sql`. Established by: scheduler 2.4 and DAC-E2-12 versus research-store 2.5 item 1 prose; cross-plan review 2026-10-18, E2-F01. T018 runs both guards, and this plan edits neither. Flag for the next revision of research-store 2.5: name the reclaim as a second permitted shape guarded by `state = 'building'` alone.
- **`claim_next_set` must be testable at 23:30 Chicago.** `CURRENT_TIMESTAMP` cannot be set from a test, and neither the story nor the design declares a clock. Settled by the additive, defaulted `at` keyword recorded as DEC-0125 (PROVISIONAL); the loop's call `claim_next_set(pool)` is unchanged (constraint 9a and 9 step 5: an additive interface change over altering a declared signature). Flag for the next revision of the scheduler design, section 2.4: the claim signature and `claim_set.sql` carry the `at` hook.
- **Story status not changed.** The skill asks for the story's `status` to move from `todo` to `planning`; the story is approved and any edit invalidates the approval, so the frontmatter is left as it is (constraint 7).

### Open Gaps

- **The `at` keyword on `claim_next_set` and the `COALESCE` in `claim_set.sql`. PROVISIONAL — awaiting owner confirmation (2026-10-17).** `claim_next_set(pool, *, at: datetime | None = None)` (T013, T017), and `claim_set.sql` stamps `(COALESCE(%(at)s::timestamptz, CURRENT_TIMESTAMP) AT TIME ZONE 'America/Chicago')::date` where design section 2.4 has `(CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date` (T016); T007 exercises it. DAC-E2-S8-4 / TC-COMP-080 need a claim made at 23:30 America/Chicago, but `CURRENT_TIMESTAMP` cannot be set from a test and no artifact declares a clock. Derivation: constraint 9a prefers an additive, defaulted keyword over altering a declared signature; production calls pass nothing and get the design's expression, and CAP-002-E2-S9's loop call `claim_next_set(pool)` is unchanged. Rejected: a test-local copy of `claim_set.sql` (it would test a copy, not the shipped file) and freezing server time (not possible for `CURRENT_TIMESTAMP`). Recorded as DEC-0125. Owning design: classification-scheduler section 2.4, at its next revision. Tasks resting on it: T007, T013, T016, T017.
- **Poll default 5 s and build timeout default 300 s, with a lower bound of 1 s on each.** Both defaults are named in the story and design (DEC-0054, DEC-0067) as provisional owner-upholdable values; the `ge=1` bound and the strict `poll < timeout` invariant come from design section 2.3 and DAC-E2-S8-7. This plan adopts them as written and invents no other bound. They are PROVISIONAL under those two decisions and await the owner's confirmation, not under a new decision here.
- **The reclaim reason text.** `interrupted: the application restarted during the build` is the design's literal (section 2.4) and is pinned verbatim by T009; the interface wording for it belongs to `classification-ui` and is not decided here.
- Owner-directed fix (cross-plan review 2026-10-18, E2-F08): the package marker `src/factorflow/classification/__init__.py` is the single line `"""Factor classification (CAP-002): engine, scheduler and reader."""` plus one LF newline, pinned identically in this plan's T014 and CAP-002-E2-S2 T002, each creating it only if absent. Derivation: no approved artifact gives the file's content. Story CAP-002-E2-S2 and factor-engine design 2.1 list the file. The classification-scheduler and classification-reader designs (section 2.1) place their modules in the same package. S2 and S8 are soft siblings with no graph edge, so only byte-identical content lets either landing order, or two concurrent branches, produce one file without an overwrite or an add/add merge conflict.

### Other Notes

- The graph already lists `CAP-002-E2-S8: [CAP-002-E2-S1]`. Planning found no new hard edge and made no change to `dependencies.yaml`. Making S8 depend on S2 for `engine_support.py` or the package `__init__.py` would add an edge nobody needs, so T002 gives the scheduler tests their own helper and T014 creates the `__init__.py` only if absent. `CAP-002-E2-S9` already depends on both.
- Register correction: the resolution register says `src/factorflow/classification/` does not exist yet; that holds at plan time. It also does not mention that `tests/integration/test_scheduler_restart.py` is created by this story (its "reclaim cases") and appended to by S9.
- Register correction (cross-plan review 2026-10-18, E2-F01): the register's "Allowed single UPDATE shape on classification_set guarded `WHERE set_id = %(set_id)s AND state = 'building'`" does not cover the scheduler's start-up reclaim, which is guarded by `WHERE state = 'building'` alone (scheduler design 2.4). Both guards that scan `reclaim_interrupted.sql` admit it: CAP-002-E2-S1 T012 requires only `state = 'building'`, and CAP-002-E2-S2 T010 requires `set_id = %(set_id)s` only in `complete_set.sql` and `fail_set.sql`.
- `ClaimedSet` and `ReclaimedSet` are named by this plan: design 2.4 shows the loop reading `claimed.set_id` and `claimed.run_id` but gives the types no name. CAP-002-E2-S9 should import them from `factorflow.classification.scheduler`.
- `build_claimed_set` and the handoff to `factor_engine.build` belong to CAP-002-E2-S9; nothing here imports `engine.py`.
- Under a driver that commits once per stage, the TDD-evidence file records `commit_hash: stage` (T020). Commits resting on DEC-0125 carry `Decision-Id: DEC-0125`.
