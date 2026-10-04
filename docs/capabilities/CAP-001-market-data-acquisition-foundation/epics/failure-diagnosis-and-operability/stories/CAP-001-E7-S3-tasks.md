---
artifact_schema_version: 1
artifact_id: CAP-001-E7-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-02
updated: 2026-10-02
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: devin
  tool: Devin
  tool_version: "unknown"
  timestamp: 2026-10-02T04:18:29Z
  source_artifacts:
    - id: CAP-001-E7-S3
      version: "1"
    - id: CAP-001-E7
      version: "1"
    - id: CAP-001
      version: "8"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-tests
      version: "1"
    - id: CAP-001-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E7-S3 — Most Recent Run Outcome in Health

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E7-tasks-20261002T034533Z`
**Date**: 2026-10-02

## Summary

The owner-operator needs the status region to say how the last run ended, so a failing acquisition is visible without opening the Runs screen (AC-18). `GET /api/health` already returns four of its five fields. CAP-001-E1-S6 delivered it in `src/factorflow/api/routes/health.py` (commits `94a5bba`, `f6cdb89`), and `most_recent_run` is hardcoded to `None` (`health.py` line 95). `HealthResponse.most_recent_run` is typed `None = None` (`src/factorflow/api/models.py` line 46), deliberately, so that this story widens it as a reviewable change (IR-006).

This plan populates the field with `{run_id, state, ended_at}`, the shape in the story's API contract, or `null` when no run exists. The steps:

1. Add one read to the run-journal read boundary `src/factorflow/runs/queries.py`, which CAP-001-E5-S5 created in commit `89d9e47`. It returns the single most recent run, in the same `(requested_at, run_id) DESC` order `list_runs` uses, and `idx_acquisition_run_recent` from `migrations/0004_runs.sql` serves it.
2. Add a `MostRecentRun` response model.
3. Call the read inside the connection block `get_health` already opens.
4. Widen the TypeScript mirror `RunSummary = null` in `web/src/api/types.ts` so it matches the new wire shape.

No migration is added. No other health field changes, and the route still never raises on a database failure.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-18 | Health lets the owner tell whether the most recent acquisition run failed, without inspecting the data store. | T005, T008, T010, T012, T014 |
| DAC-E7-8 | `most_recent_run` reports the most recent run's outcome and completes the payload E1 delivers. | T003, T011, T012, T014 |
| DAC-E7-S3-1 | No run ever recorded → `most_recent_run` is `null`, never a failure. | T002, T008, T009, T012 |
| DAC-E7-S3-2 | A non-terminal most recent run is reported with its current state, not skipped for an older terminal run. | T004, T006, T010, T014 |
| DAC-E7-S3-3 | The reported run carries its id, state and end timestamp, so the region needs no second request. | T003, T007, T011, T013 |
| DAC-E7-S3-4 | The query is indexed so the 30-second poll is cheap. | T006, T010, T014 |

## Phase 1: Setup

**Purpose**: Confirm that the producers this delta reads and modifies have landed, and record a characterization baseline before any change (TEST-TDD-007).

- [x] T001 Before you edit any file, verify these exist as described:
  - CAP-001-E1-S6's `src/factorflow/api/routes/health.py` (`get_health`, `probe_schema_version`, `probe_database_reachable`, the `with pool.connection() as conn:` block, and the `except psycopg.Error` fallback) and `HealthResponse` in `src/factorflow/api/models.py`.
  - CAP-001-E5-S5's `src/factorflow/runs/queries.py`: `RunRow`, `_row_to_run`, `_LIST_SQL_BASE`, `_LIST_ORDER = " ORDER BY requested_at DESC, run_id DESC"`, `list_runs` and `ListFilters`. Also its `RunState` literal in `src/factorflow/api/models.py`.
  - CAP-001-E5-S1's `idx_acquisition_run_recent ON acquisition_run (requested_at DESC)` and the `acquisition_run_terminal_has_end` and `acquisition_run_claim_agrees` checks in `migrations/0004_runs.sql`, plus the `migrated_run_schema_connection` fixture in `tests/conftest.py`.
  - CAP-001-E5-S6's `RunState` and CAP-001-E1-S5's `RunSummary = null` / `HealthResponse` in `web/src/api/types.ts`.

  Then run `uv run pytest tests/unit/test_health_database_probe.py tests/unit/test_health_route_unreachable.py tests/unit/test_health_schema_version.py tests/unit/test_api_models.py tests/unit/test_api_no_secrets.py`, `uv run pytest -m postgres tests/integration/test_api_health.py`, `npx tsc --noEmit` and `npm run test`, and record them green as the baseline. Stop if any seam differs from this description (prerequisite infrastructure; traces to AC-18).

**Checkpoint**: The E1-S6 health path, the E5-S5 read boundary and the E1-S5 status-region tests are green, unmodified, and recorded as the baseline.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the six mapped component tests and the additional unit tests. Observe RED for every new behaviour. Record already-satisfied behaviour as passing characterization tests (TEST-TDD-001, TEST-TDD-002, TEST-TDD-007).

HTTP-level cases go in `tests/integration/test_api_health.py`, the file ingestion-api §7 names for "Health reports the most recent run outcome". Every new case there is `@pytest.mark.postgres` and uses a new module-local fixture, `migrated_health_client`. The fixture applies every migration through the real migrator (`from factorflow.db.migrator import apply_pending, discover`, over the `migrations/` directory, as `migrated_run_schema_connection` does) so that `applied_migrations` and `acquisition_run` both exist. It then sets `FACTORFLOW_DATABASE_URL` and yields `(TestClient(create_app()), postgres_connection_string)`.

Seed runs with bound-parameter `INSERT`s that satisfy the DDL checks. Terminal states need `ended_at`; `running` and `cancelling` need `started_at`, `claimed_by` and `heartbeat_at`; `requested` needs none of them. Copy the shape of `_seed_run` in `tests/integration/test_api_runs.py`, and give it an explicit `ended_at` so the response can be compared exactly. The partial unique index allows at most one `running` or `cancelling` row.

### Mandatory Component Tests

- [x] T002 In `tests/integration/test_api_health.py`, add `# Implements TC-COMP-088` and `test_health_most_recent_run_null_when_no_run_recorded`. Use `migrated_health_client` with an empty `acquisition_run`, and assert:
  - `database == "reachable"`;
  - `schema_version` equals the highest version `discover(...)` returns;
  - the `most_recent_run` key is present and its value `is None`. A reachable store with no run is `null`, not an unreachable or failed answer.

  This passes against unmodified code, so record it as characterization (TEST-TDD-007) and do not fabricate a RED. It must stay green through T012 (depends on T001; traces to DAC-E7-S3-1).
- [x] T003 In `tests/integration/test_api_health.py`, add `# Implements TC-COMP-090` and `# Implements TC-COMP-073`. Seed one terminal `partial` run with a fixed `requested_at` and `ended_at`. `GET /api/health` and assert:
  - the body's key set is exactly `{"status", "database", "credential_present", "schema_version", "most_recent_run"}`;
  - the four E1 fields still hold (`status == "ok"`, `database == "reachable"`, `credential_present` is a `bool` matching the environment, `schema_version` is the highest migration);
  - `most_recent_run`'s key set is exactly `{"run_id", "state", "ended_at"}`;
  - `run_id` equals the seeded id as a string and `state == "partial"`;
  - `datetime.fromisoformat(ended_at)` equals the seeded `ended_at` as an aware datetime. Compare values, not the string form; zone rendering is the interface's concern (ingestion-api §10).

  Observe RED: today the field is `None` (depends on T002; traces to DAC-E7-S3-3, DAC-E7-8).
- [x] T004 In `tests/integration/test_api_health.py`, add `# Implements TC-COMP-089`, parametrised over the three non-terminal states `requested`, `running` and `cancelling`. Seed an older terminal `failed` run, then a newer run in the parametrised state with a later `requested_at`. Assert:
  - `most_recent_run.run_id` is the newer run;
  - `state` is the parametrised state;
  - `ended_at is None` (the `acquisition_run_terminal_has_end` DDL makes a non-terminal run's end timestamp null).

  It must never report the older `failed` run. Observe RED (depends on T003; traces to DAC-E7-S3-2).
- [x] T005 In `tests/integration/test_api_health.py`, add `# Implements TC-COMP-018`. Cover AC-18's question, "did the most recent run fail?", in both directions:
  - an older `succeeded` and a newer `failed` run report `state == "failed"`;
  - in a fresh database, an older `failed` and a newer `succeeded` run report `state == "succeeded"`, so a past failure is not sticky;
  - the answer comes from `GET /api/health` alone, with no request to `/api/acquisition-runs`. Assert this with a single request on the client.

  Observe RED (depends on T004; traces to AC-18).
- [x] T006 Create `tests/integration/test_run_most_recent.py`, kept separate from CAP-001-E7-S1's planned `tests/integration/test_run_queries.py` so the two stories do not collide. Add `# Implements TC-COMP-091` and `# Implements TC-COMP-089`. Use `migrated_run_schema_connection` and call `factorflow.runs.queries` directly, with no HTTP.
  - **Index (DAC-E7-S3-4).** Seed 1000 terminal `succeeded` runs with distinct `requested_at` values using one `INSERT … SELECT … FROM generate_series(1, 1000)`, then run `ANALYZE acquisition_run`. Execute `EXPLAIN (FORMAT JSON)` with `queries._MOST_RECENT_RUN_SQL`, the exact statement the read executes. Walk the plan tree recursively and assert:
    - some node is an `Index Scan` or `Index Only Scan` with `"Index Name": "idx_acquisition_run_recent"`;
    - no node is a `Seq Scan` on `acquisition_run`.

    Do not set `enable_seqscan` or any other planner setting. The assertion is about the plan the poll actually gets.
  - **Ties.** Seed two runs with an identical `requested_at`. `get_most_recent_run(conn)` returns the one with the greater `run_id`, and its `run_id` equals `list_runs(conn, ListFilters(limit=1)).rows[0].run_id`. The status region and the first row of the Runs list therefore name the same run.
  - **Non-terminal.** A newer `requested` run is returned ahead of an older terminal one.
  - **Empty.** An empty table returns `None`.

  Observe RED, since neither the function nor the constant exists yet (depends on T001; traces to DAC-E7-S3-4, DAC-E7-S3-2).

### Additional Unit Tests

- [ ] T007 [P] Extend `tests/unit/test_api_models.py`, keeping the existing tests unchanged:
  - `MostRecentRun.model_fields` is exactly `{"run_id", "state", "ended_at"}`.
  - `state` accepts every `typing.get_args(RunState)` value and rejects `"bogus"` with `ValidationError`.
  - `ended_at=None` serializes as JSON `null` and is present, not omitted.
  - `HealthResponse(..., most_recent_run=MostRecentRun(...))` round-trips through `model_dump_json()` with the three keys.
  - `HealthResponse(..., most_recent_run=None)` still serializes `null` (DAC-E1-S6-3).

  `tests/unit/test_api_no_secrets.py` must keep passing over the new model without modification. Observe RED (depends on T001; traces to DAC-E7-S3-3).
- [ ] T008 [P] Create `tests/unit/test_health_most_recent_run.py`. Follow the `_fake_request` and fake-pool pattern in `tests/unit/test_health_route_unreachable.py`, monkeypatch `health.probe_database_reachable` to `True`, and stub `health.probe_schema_version` and `health.get_most_recent_run`. Assert:
  - When `get_most_recent_run` returns a `RunRow` in `failed` with an `ended_at`, `get_health(...)` returns `most_recent_run` with that `run_id`, `state` and `ended_at`, not some other `RunRow` field.
  - When it returns `None`, `most_recent_run is None` and `database == "reachable"`.
  - When it raises `psycopg.OperationalError`, `get_health` does not raise. It returns `database == "unreachable"`, `schema_version is None` and `most_recent_run is None`. This is the same fallback shape the existing version-query branch produces (Open Gap 3).

  Observe RED (depends on T001; traces to AC-18, DAC-E7-S3-1).
- [x] T009 [P] In `tests/integration/test_api_health.py`, update the setup of the existing `test_health_reachable_database`. It currently creates only `APPLIED_MIGRATIONS_DDL` and two synthetic rows, so `acquisition_run` does not exist. Once T012 reads that table, the existing `except psycopg.Error` branch would report the database as `unreachable`. Give the test the real schema with `apply_pending(conn, discover(...))`, and assert `schema_version` equals the highest discovered version instead of the literal `2`. Keep every other assertion (`status`, `database == "reachable"`, `credential_present is True`, `most_recent_run is None` on an empty run table). The test keeps DAC-E1-S6-1's intent, the highest applied version, and its precondition now matches production, where the migrator always runs before the API binds (AC-16). Leave `test_health_unreachable_database` and `test_health_most_recent_run_is_null` unchanged. The latter runs against an unmigrated database and stays green through the unreachable path. This passes both before and after T012, so record it as a characterization precondition change (depends on T001; traces to DAC-E7-S3-1).

**Checkpoint**: All six mapped TC-IDs (TC-COMP-018, 073, 088, 089, 090, 091) carry `# Implements` trace comments. RED is observed and recorded for T003–T008. T002 and T009 are recorded as characterization. Every pre-existing health and model test is untouched except T009's setup change.

---

## Phase 3: Core Implementation

**Purpose**: Add the most-recent-run read and the response model, without changing the E5-S5 list/detail contract (TEST-TDD-003).

- [ ] T010 Update `src/factorflow/runs/queries.py`:
  - Add `_MOST_RECENT_RUN_SQL = _LIST_SQL_BASE + _LIST_ORDER + " LIMIT 1"`. It has no `WHERE` clause and no state filter: a non-terminal run is reported, never skipped (DAC-E7-S3-2).
  - Add `get_most_recent_run(connection: psycopg.Connection) -> RunRow | None`. It executes that constant with no parameters and maps the row through the existing `_row_to_run`.
  - In a comment, cite `idx_acquisition_run_recent` (`migrations/0004_runs.sql`), DAC-E7-S3-4 and TC-COMP-091, and say that the order deliberately repeats `list_runs`' so health and the Runs list agree (Open Gap 1).
  - Extend the module docstring's "This module owns" list with the CAP-001-E7-S3 addition.

  Leave `list_runs`, `get_run_detail`, the cursors and `RunRow` unchanged (depends on RED from T006; satisfies DAC-E7-S3-2, DAC-E7-S3-4, AC-18).
- [ ] T011 [P] Update `src/factorflow/api/models.py`:
  - Add `class MostRecentRun(BaseModel)` with `run_id: UUID`, `state: RunState` and `ended_at: datetime | None`, and a docstring citing the story's API contract and the `acquisition_run_terminal_has_end` DDL as the reason `ended_at` is null for a non-terminal run. Place it after `RunState`, which it references.
  - Change `HealthResponse.most_recent_run` from `None = None` to `MostRecentRun | None = None`.
  - Rewrite the IR-006 paragraph of the `HealthResponse` docstring to record that CAP-001-E7-S3 has now widened the type, and drop "this story hardcodes the field to `None`".

  Add no field beyond the three (depends on RED from T007; satisfies DAC-E7-S3-3, DAC-E7-8).

**Checkpoint**: T006 and T007 are green. Every pre-existing case in `tests/unit/test_runs_queries.py`, `tests/integration/test_api_runs.py` and `tests/unit/test_api_no_secrets.py` still passes.

---

## Phase 4: Integration

**Purpose**: Serve the read through `GET /api/health` and keep the interface's type mirror true to the wire.

- [ ] T012 Update `src/factorflow/api/routes/health.py`:
  - Import `get_most_recent_run` from `factorflow.runs.queries` and `MostRecentRun` from `factorflow.api.models`.
  - In `get_health`, initialise `most_recent_run: MostRecentRun | None = None`.
  - Inside the existing `with pool.connection() as conn:` block, after `probe_schema_version(conn)`, call `get_most_recent_run(conn)`. When it returns a row, build `MostRecentRun(run_id=row.run_id, state=row.state, ended_at=row.ended_at)`.
  - In the existing `except psycopg.Error` branch, also reset `most_recent_run = None`, so every database-derived field is null whenever `database` is `unreachable` (Open Gap 3).
  - Pass `most_recent_run=most_recent_run` to `HealthResponse`.
  - Update the module docstring to name the fifth field and CAP-001-E7-S3, and note that the route still delegates the read to the run-journal boundary (ingestion-api §1, run-journal §9).

  Leave `probe_database_reachable`, its 2-second timeout, the log line, and the rule that the reachability probe gates every query unchanged. `tests/unit/test_health_route_unreachable.py` must stay green unmodified (depends on T010, T011 and RED from T003, T004, T005, T008; satisfies AC-18, DAC-E7-8, DAC-E7-S3-1, DAC-E7-S3-2).
- [ ] T013 [P] Update `web/src/api/types.ts`:
  - Replace `export type RunSummary = null;` with `export interface RunSummary { run_id: string; state: RunState; ended_at: string | null; }`. The names are snake_case because `fetchHealth()` in `web/src/api/client.ts` casts the raw JSON without mapping.
  - Change `HealthResponse.most_recent_run` to `RunSummary | null`.
  - Rewrite the `RunSummary` doc comment to say CAP-001-E7-S3 widened it to the wire shape, mirroring `MostRecentRun` in `src/factorflow/api/models.py`.
  - Update the `AcquisitionRun` comment that calls `RunSummary` "the health placeholder" so it says "the health `most_recent_run` shape".

  Do not modify `web/src/app/status-region.tsx`, its tests or any fixture. Every existing `most_recent_run: null` fixture stays type-correct, and the populated rendering is out of this story's scope (Open Gap 2, Other Notes). No behaviour changes, so there is no RED: `npx tsc --noEmit`, `npm run lint` and `npm run test` must stay green (depends on T011; satisfies DAC-E7-S3-3).

**Checkpoint**: T002–T009 are green through `create_app()` against PostgreSQL. The health body has exactly five keys, and `most_recent_run` is either `null` or exactly `{run_id, state, ended_at}`. The TypeScript mirror type-checks, and the web suite is unchanged and green.

---

## Phase 5: Polish

**Purpose**: Kill mutants on the changed behaviour, run full validation, and keep the per-cycle evidence chain.

- [ ] T014 After T002–T013 are green and their T015 entries are complete, run the TEST-TDD-005 and TEST-TDD-006 mutation checks on the changed lines and strengthen tests until every mutant is killed:
  - In `_MOST_RECENT_RUN_SQL`: `DESC` → `ASC`, drop the `run_id` tie-breaker, drop `LIMIT 1`, or add `WHERE ended_at IS NOT NULL` / a terminal-state filter.
  - In `get_health`: keep `most_recent_run = None` hardcoded, omit the reset in the `except` branch, or map `requested_at`/`started_at` into `ended_at`.
  - In `MostRecentRun`: loosen `state` to `str`.

  Do behaviour-preserving refactoring under TEST-TDD-004, keep the T001 baseline green (TEST-TDD-007), verify the TEST-TDD-001 to TEST-TDD-008 chain, and run every command in the Validation Plan (depends on T002–T013; verifies all story criteria).
- [ ] T015 Run this after **each** TDD cycle in T002–T014, not once at the end. Stage only that cycle's diff. Dispatch an independent code-review subagent and an independent spec-drift subagent against it. Append the cycle to `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S3-tdd-evidence.yaml`, beside this story, with `code_review_verdict`, `spec_drift.drift_detected` and its RED/GREEN evidence. Record the characterization cycles (T002, T009) and the type-only change (T013) as such, with GREEN-on-arrival evidence instead of a fabricated RED. Do not commit a `REJECTED` or `drift_detected: true` cycle. After the commit, record its `commit_hash` and `tests_executed: true` before the next cycle begins (INV-TDD-002, TEST-TDD-008; traces to no AC).

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

After this plan, `dependencies.yaml` records
`CAP-001-E7-S3: [CAP-001-E1-S5, CAP-001-E1-S6, CAP-001-E5-S1, CAP-001-E5-S5, CAP-001-E5-S6]`. This revision adds two hard edges. Every producer is implemented and merged, so none of them blocks scheduling.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S5 | hard | Existing edge. T013 modifies `RunSummary` and `HealthResponse` in `web/src/api/types.ts`, which E1-S5 created (commit `163fb18`). The status region (`web/src/app/status-region.tsx`) consumes the field. |
| CAP-001-E1-S6 | hard | Existing edge. T012 modifies `src/factorflow/api/routes/health.py` and T011 modifies `HealthResponse` in `src/factorflow/api/models.py` (commits `94a5bba`, `f6cdb89`). T009 updates its `tests/integration/test_api_health.py`. |
| CAP-001-E5-S1 | hard | Existing edge. `acquisition_run`, `idx_acquisition_run_recent` and the DDL checks in `migrations/0004_runs.sql`, plus the `migrated_run_schema_connection` fixture (commit `c9580e3`). |
| CAP-001-E5-S5 | hard | **New edge.** T010 adds to `src/factorflow/runs/queries.py` and reuses its `RunRow`, `_row_to_run`, `_LIST_SQL_BASE` and `_LIST_ORDER`. T011 references `RunState` in `src/factorflow/api/models.py`, and T006 compares against `list_runs`. All of these were created in commit `89d9e47` (`feat(CAP-001-E5-S5)`). |
| CAP-001-E5-S6 | hard | **New edge.** T013's `RunSummary` references `RunState` in `web/src/api/types.ts`, which E5-S6 added in commit `1a0eb78`. |
| CAP-001-E7-S1 | soft | Its plan also edits `src/factorflow/runs/queries.py` and `src/factorflow/api/models.py`. It changes the detail-read types (`ResultRow`, `RunDetail`, `RunCounts`) and filter validation. This plan only adds a new function, a constant and a new model, and does not touch `RunRow` or `ListFilters`' signature, so the stories can develop concurrently and merge textually. If E7-S1 lands first, its `state` validation in `ListFilters.__post_init__` does not affect `ListFilters(limit=1)` in T006. |
| CAP-001-E7-S4 | context | Run detail is the destination the status region should link to (ux-design "Diagnosing a failure"), but E7-S4 consumes `GET /api/acquisition-runs/{id}`, not health. It supplies nothing to this plan and consumes nothing from it. |

### Task Dependencies

- T001 gates everything.
- T002 → T003 → T004 → T005 run serially because they share `tests/integration/test_api_health.py`. T009 edits the same file, so run it serially with that chain, before T002 or after T005.
- T006, T007 and T008 depend only on T001 and touch separate files (`[P]`).
- T010 depends on RED from T006.
- T011 depends on RED from T007.
- T012 depends on T010, T011 and RED from T003, T004, T005 and T008.
- T013 depends on T011, for the wire shape it mirrors.
- T014 depends on T002–T013 and their T015 entries.
- T015 is interleaved: it runs after every TDD cycle, before that cycle's commit.

### Parallel Opportunities

- T006, T007 and T008 can be written in parallel with each other and with the T002–T005 chain.
- T010 (`queries.py`) and T011 (`models.py`) touch different files and can be implemented in parallel. T013 (`types.ts`) can run in parallel with T012 once T011 exists. TEST-TDD-008 still serializes their commit and evidence cycles.

### Phase Dependencies

- Phase 1 precedes everything.
- Phase 2's RED for each behaviour precedes the matching Phase 3 or Phase 4 change.
- Phase 3 supplies the read and the model, which Phase 4 wires into the route and mirrors into the interface types.
- T015 runs at every commit boundary in Phases 2–4. T014 is the final mutation and validation pass.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`, `npm ci`
- Build: `uv build`, `npm run build`
- Test: `uv run pytest` (full suite); `uv run pytest -m 'not postgres'` (no container); `npm run test`
- Lint: `uv run ruff check .`, `npm run lint`
- Format: `uv run ruff format --check .`, `npm run format`
- Type check: `uv run mypy src`, `npx tsc --noEmit`

The story's own validation line (`uv run pytest -m postgres`, `uv run ruff check .`, `uv run mypy src`) is a subset of these. The npm commands are added because T013 touches `web/src/api/types.ts`.

### Story-Specific Validation

- `uv run pytest -m postgres tests/integration/test_api_health.py tests/integration/test_run_most_recent.py` and `uv run pytest tests/unit/test_api_models.py tests/unit/test_health_most_recent_run.py tests/unit/test_health_route_unreachable.py tests/unit/test_api_no_secrets.py`. All six mapped TC-IDs carry trace comments and pass.
- DAC-E7-S3-1: a migrated database with no run returns `database: "reachable"` and `most_recent_run: null`.
- DAC-E7-S3-3 / DAC-E7-8: a terminal run returns exactly `{run_id, state, ended_at}` with the stored values, and the body still has exactly the five health keys.
- DAC-E7-S3-2: a newer `requested`, `running` or `cancelling` run is reported with `ended_at: null` ahead of an older `failed` one.
- AC-18: `failed` is reported when it is the latest run, and not after a later success. One health request answers it.
- DAC-E7-S3-4: on 1000 analysed runs, the `EXPLAIN (FORMAT JSON)` plan of the shipped statement uses `idx_acquisition_run_recent` and has no `Seq Scan` on `acquisition_run`, with no planner setting changed.
- Failure path: a run-query `psycopg.Error` yields `200` with `database: "unreachable"` and all database-derived fields null. The route never raises.
- Regression: every pre-existing case in `tests/unit/test_health_*.py`, `tests/integration/test_api_runs.py`, `tests/unit/test_runs_queries.py` and the `web/src/app/status-region*.test.tsx` suites passes. `test_health_reachable_database` passes with only the T009 setup change.
- If no container runtime is available, run and report the `-m 'not postgres'` subset only. Do not present it as a green full suite.

---

## Notes

### Resolved Conflicts

- **The story's `ended_at` example versus non-terminal runs.**
  - *Conflict:* The story's API contract shows `ended_at` as a timestamp. DAC-E7-S3-2 requires reporting a run that has not ended.
  - *Resolution:* `ended_at` is `null` for `requested`, `running` and `cancelling`.
  - *Basis:* The story AC (DAC-E7-S3-2) outranks the illustrative JSON snippet. The `acquisition_run_terminal_has_end` check in `migrations/0004_runs.sql` (market-data-store §2.3 DDL) pins `ended_at IS NOT NULL` exactly for terminal states.
- **The story's "Delivers" framing versus existing code.**
  - *Conflict:* The story reads as if it completes a new endpoint, but `health.py`, `HealthResponse` and `queries.py` all exist.
  - *Resolution:* This plan is a delta on them.
  - *Basis:* Code that already exists is the baseline. Approved artifacts do not conflict here.
- **Design status label.**
  - *Conflict:* `component-design-ingestion-api.md` and `component-design-run-journal.md` both have body `**Status:** draft` but frontmatter `status: approved`.
  - *Resolution:* Both are treated as approved.
  - *Basis:* The governed frontmatter wins, and the body labels are stale.

### Open Gaps

- **PROVISIONAL — awaiting owner confirmation (2026-10-02) — which run is "the most recent run" (Open Gap 1).**
  - *Undefined:* No artifact names the ordering key. The story, ingestion-api §11, system design 4.2 and run-journal §9 all say "most recent run" without saying by which timestamp.
  - *Adopted:* `ORDER BY requested_at DESC, run_id DESC LIMIT 1`, with no state filter, reusing `queries._LIST_SQL_BASE` and `_LIST_ORDER`. A run queued behind an active one is therefore reported as `requested`.
  - *Derivation:*
    - DAC-E7-S3-2 rules out any key that skips non-terminal runs: `ended_at` is null until a run ends, and `started_at` is null for `requested`.
    - DAC-E7-S3-4 requires an index, and `idx_acquisition_run_recent ON acquisition_run (requested_at DESC)` is the only `acquisition_run` index on a time column without a state predicate.
    - Run history is "reverse chronological" by `requested_at` (ingestion-api §11, run-journal §5).
    - The `run_id` tie-breaker is the owner-confirmed E5-S5 `list_runs` order (DAC-E5-S5-4), so the status region and the first row of the Runs list always name the same run.
  - *Rejected:*
    - Ordering by `ended_at` or `started_at`: either violates DAC-E7-S3-2 and has no index.
    - Preferring the active run over a newer queued run: it needs a two-key precedence no artifact states and that the Runs list does not show.
  - *Confidence:* high.
  - *Absorb in:* `component-design-ingestion-api.md` §11 health row and `component-design-run-journal.md` §5 read paths at their next revision.
- **PROVISIONAL — awaiting owner confirmation (2026-10-02) — widening the TypeScript mirror in this backend story (Open Gap 2).**
  - *Undefined:* The story's module is `ingestion-api`, and its tags and validation line are backend-only. Still, `web/src/api/types.ts` types `most_recent_run` as exactly `null` (`RunSummary = null`). Its comment, written by CAP-001-E1-S5, says this "forces the widening to be a deliberate, reviewable change in that story" (CAP-001-E7-S3). No artifact says which story widens it.
  - *Adopted:* T013 widens only the type, to `RunSummary | null` with `{run_id, state, ended_at}`. It changes no component, rendering or test.
  - *Derivation:*
    - owner-web-app §2.1 makes `types.ts` the hand-written mirror of the API's published contracts. Once T012 ships, `RunSummary = null` would be false about the wire.
    - The change is the smallest one that keeps the mirror honest, and the existing `health.most_recent_run === null` branch still type-checks.
    - This applies ladder step 5, local precedent: E1-S6 and E1-S5 both deferred the widening to this story by name.
  - *Rejected:*
    - Leaving the web tree untouched: the mirror would knowingly drift from the wire.
    - Also implementing the populated status-region line: that is UX rendering beyond this story's ACs (see the backlog gap below).
  - *Confidence:* medium-high.
  - *Absorb in:* the story that renders the populated outcome line (backlog gap below).
- **PROVISIONAL — awaiting owner confirmation (2026-10-02) — health's answer when the run read fails (Open Gap 3).**
  - *Undefined:* No artifact says what `most_recent_run` is when the reachability probe succeeds but the run query raises.
  - *Adopted:* The run read shares the existing `with pool.connection()` block and `except psycopg.Error` branch with the version query. On failure the response is `200` with `database: "unreachable"`, `schema_version: null` and `most_recent_run: null`.
  - *Derivation:*
    - This is the local precedent in `health.py` lines 72–83, which reports "unreachable" when the version query fails after a successful probe, "rather than a reachable database with no schema version -- a shape health never otherwise produces".
    - DAC-E7-S3-1 gives `null` with a reachable database one meaning, "no run ever recorded". Returning `null` on a failed read with `database: "reachable"` would assert something false.
    - DAC-E1-S6-2 requires the route never to raise.
  - *Rejected:*
    - A reachable database with `most_recent_run: null`: a false "no run recorded".
    - Propagating a `500`: violates DAC-E1-S6-2.
  - *Confidence:* high.
  - *Absorb in:* `component-design-ingestion-api.md` §11 / §8 item 8 at its next revision.
- **Backlog gap (not provisional; owner action) — no story renders the populated outcome line.**
  - *Undefined:* After this story ships, `web/src/app/status-region.tsx`'s `RunOutcomeLine` reaches its existing "recorded" branch and renders the neutral text *Most recent run recorded*. That is no false failure or false success, but it does not state how the run ended or link to its detail.
  - *Why it matters:*
    - ux-design §0 and owner-web-app §2.2 say the status region reports "how the most recent acquisition run ended".
    - ux-design "Diagnosing a failure" and owner-web-app §9 say it links to that run's detail.
    - TC-E2E-011 expects the region to visibly report the outcome.
  - *Who owns it:* CAP-001-E1-S5 delivered only the `null` branch (DAC-E1-S5-4), and its task plan deferred the populated content to this story. This story's ACs are API-level (module `ingestion-api`), and no CAP-001-E7-S4 AC covers the status region.
  - *Not planned here:* Rendering state tiers (STD-UI-12), copy and a link to the run-detail route that CAP-001-E7-S4 creates would extend this story's approved scope.
  - *Next step:* The owner should add a story, or amend CAP-001-E1-S5 or CAP-001-E7-S4, at the next backlog revision. Until then, AC-18 is satisfied at the API boundary only.

### Other Notes

- **Existing-code baseline (verified 2026-10-02).**
  - `health.py` line 95 hardcodes `most_recent_run=None`.
  - `HealthResponse.most_recent_run` is `None = None` (`models.py` line 46).
  - `queries.py` has no single-run "latest" read. `list_runs(ListFilters(limit=1))` would fetch `limit + 1` rows and encode a cursor, so a dedicated `LIMIT 1` statement is added and its SQL is exposed for the EXPLAIN test.
  - No test in the repo uses `EXPLAIN` yet. T006 is the first, and it walks the JSON plan rather than matching text.
- **Python and TypeScript names.** The API module already has a Pydantic `RunSummary`, the run-list item. The new health model is therefore named `MostRecentRun`. The TypeScript name `RunSummary` (the health shape) is kept, because E1-S5 and E5-S6 comments refer to it by that name.
- **Why `test_health_reachable_database` changes (T009).** Its database has only `applied_migrations`. Once health reads `acquisition_run`, the existing fallback reports it unreachable. Migrating the test database through the real migrator matches production (AC-16: the API binds only after migration) and keeps the test's assertions about the highest version and the boolean credential.
- **EXPLAIN fixture volume.** 1000 analysed rows is a test-fixture choice, not a product bound. It is an order of magnitude beyond run-journal §5's "after a hundred runs" scale, so the planner's real choice is exercised without any planner setting. If the plan still shows a `Seq Scan` at that volume, stop and report it. Do not add an index or migration under this story.
- **No latency target.** ingestion-api §14 Q5 is open, so none is asserted. "Cheap" is pinned structurally, by the index plan.
- **Out of scope here:** TC-INT-020 (`GET /api/health` contract, AC-18) and TC-E2E-011 (status region shows the outcome) belong to the integration and E2E automation task lists (`tests/integration/integration-tests-automation-tasks.md` T007, `tests/e2e/e2e-tests-automation-tasks.md` T008). The coverage matrix does not list TC-INT-020 against AC-18 (its row shows `—`) although `integration-tests.md` traces it there. T007 of the automation list extends the same `tests/integration/test_api_health.py` and must preserve this story's cases.
- **TDD evidence.** The story makes behaviour-changing commits (the read, the model, the route), so the T015 evidence task applies. Under a supervised driver that commits once per stage, the DEC-0006 precedent (scoped to E5-S6) applies by analogy only. It is not extended here, and the driver decides commit granularity.
- **Error envelope.** This plan adds no HTTP method to `/api/health` and changes no error path, so the sibling envelope work that probes `DELETE /api/health` for its `405` is unaffected.
- **Isolation.** `health.py` gains only one import from outside `factorflow.api`: `factorflow.runs.queries`. No module under `src/factorflow/api/` gains a provider import (`tests/unit/test_api_isolation.py`), and the new model has no credential-shaped field (`tests/unit/test_api_no_secrets.py`).
