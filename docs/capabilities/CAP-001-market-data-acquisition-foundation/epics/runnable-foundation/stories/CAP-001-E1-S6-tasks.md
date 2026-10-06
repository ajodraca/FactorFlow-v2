---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S6-tasks
artifact_type: story-tasks
artifact_version: 1
status: in-progress
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-10-05
last_reworked_review: CAP-001-E1-S6-implementation-review-v3.md
docs_synced_review: CAP-001-E1-S6-implementation-review-v5.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T00:00:00Z
  source_artifacts:
    - id: CAP-001-E1-S6
      version: "1"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: tech-stack
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E1-S6 — Health Endpoint and API Application Factory

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E1-S6`
**Date**: 2026-09-06

## Summary

This story delivers `src/factorflow/api/app.py` (the FastAPI application factory with its lifespan, request-id middleware, and static-bundle mount), `src/factorflow/api/routes/health.py`, and `src/factorflow/app_main.py` (the uvicorn entrypoint). It establishes the API surface every later endpoint story adds routes to, and answers `GET /api/health` with four of its five fields — liveness, database reachability, credential presence, and schema version — leaving `most_recent_run` as `null` until CAP-001-E7-S3 populates it. It also draws the loopback-only, no-authentication boundary that every subsequent route in this component inherits rather than re-declares.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-14 | API binds to `127.0.0.1` only, unreachable from any other interface | T006, T012, T017 |
| AC-18 | `GET /api/health` reports whether the product is running without inspecting the store directly | T007, T008, T013, T014, T018 |
| DAC-E1-16 | Health reports liveness, database reachability, credential presence as a boolean, and schema version | T007, T013 |
| DAC-E1-9 | Credential presence reported as a boolean, never the value | T009, T015 |
| DAC-E1-S6-1 | Reachable database: `database` reports reachable, `schema_version` reports the highest applied migration version | T007, T013 |
| DAC-E1-S6-2 | Unreachable database: responds `200` with `database` reporting unreachable, not a failed request | T008, T014 |
| DAC-E1-S6-3 | `most_recent_run` present as `null` until CAP-001-E7-S3 | T010, T016 |
| DAC-E1-S6-4 | Application factory mounts the built frontend bundle from the static directory | T011, T019 |
| DAC-E1-S6-5 | Middleware generates a request id included in every log record for that request | T005, T020 |
| DAC-E1-S6-6 | No endpoint declares an authentication requirement | T006, T012 |

## Phase 1: Setup

**Purpose**: Establish the `api/` package layout and the shared response-model and error-envelope scaffolding every route (this story's and later ones') builds on.

- [x] T001 Create `src/factorflow/api/__init__.py`, `src/factorflow/api/routes/__init__.py`, and an empty `src/factorflow/api/static/.gitkeep` (the Vite build output directory this story mounts but does not populate — no frontend build exists yet on this branch)
- [x] T002 [P] Create `src/factorflow/api/models.py` with the `HealthResponse` Pydantic model matching the API contract exactly: `status: Literal["ok"]`, `database: Literal["reachable", "unreachable"]`, `credential_present: bool`, `schema_version: int | None`, `most_recent_run: RunSummary | None` (define `RunSummary` as a placeholder type alias or `None`-only field for now, since CAP-001-E7-S3 owns its shape)
- [x] T003 [P] Create `src/factorflow/api/errors.py` implementing the error envelope from component design section 2.3 (`{"error": {"code", "message", "resource", "request_id"}}`) and a FastAPI exception handler that maps an unhandled exception to `500` with `code: "internal_error"` and the request id only, logging the actual exception server-side
- [x] T004 [P] Confirm CAP-001-E1-S3's `src/factorflow/config/settings.py` (`ApiSettings`, `credential_present()`) and CAP-001-E1-S1's `applied_migrations` table are present and importable on this branch; block on either if not yet landed, rather than duplicating them here

**Checkpoint**: `src/factorflow/api/` exists with `models.py` and `errors.py`; `uv run pytest -m 'not postgres'` still passes with zero new failures; `uv run mypy src` type-checks the new files.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests for the nine mandatory component TC-IDs mapped from the coverage matrix, using the exact test file the component design's section 7 table names for health (`tests/integration/test_api_health.py`) plus supporting files for the app-factory-level concerns.

### Mandatory Component Tests

- [x] T005 [P] Implement TC-COMP-345 / DAC-E1-S6-5 (middleware generates a request id included in every log record for that request) in `tests/unit/test_api_request_id.py` — issue a request via FastAPI's `TestClient`, capture log records emitted during handling, assert every record carries the same request id as a structured field, and assert the id also appears in the response (e.g. as a header or in the error envelope on a failure path)
- [x] T006 [P] Implement TC-COMP-014, TC-COMP-346 / AC-14, DAC-E1-S6-6 (server accepts no connection on a non-loopback interface; no endpoint declares an authentication requirement) in `tests/integration/test_api_binding.py` — start the app via `app_main` with the default `FACTORFLOW_API_HOST`, assert the bound socket is `127.0.0.1`, and separately assert `app.routes` contains no route with a `dependencies` entry requiring a credential, session, or token, and no `securitySchemes` entry in the generated OpenAPI schema
- [x] T007 [P] Implement TC-COMP-307, TC-COMP-341 / DAC-E1-16, DAC-E1-S6-1 (health reports liveness, database reachability, credential presence, schema version; reachable database reports the highest applied migration version) in `tests/integration/test_api_health.py::test_health_reachable_database` — apply migrations against a `testcontainers` PostgreSQL instance, call `GET /api/health`, assert `status == "ok"`, `database == "reachable"`, `schema_version` equals the highest version in `applied_migrations`, and `credential_present` matches whether `FACTORFLOW_MASSIVE_API_KEY` is set in the test environment
- [x] T008 [P] Implement TC-COMP-342, TC-COMP-018 / DAC-E1-S6-2, AC-18 (unreachable database responds `200` with `database` reporting unreachable, not a failed request) in `tests/integration/test_api_health.py::test_health_unreachable_database` — point the app at a stopped or unroutable database, assert the response is still `200` with `database == "unreachable"` and `schema_version == null`
- [x] T009 [P] Implement TC-COMP-300 / DAC-E1-9 (credential presence reported as a boolean, never the value) in `tests/unit/test_api_no_secrets.py::test_health_never_echoes_credential` — set `FACTORFLOW_MASSIVE_API_KEY` to a known test value, call `GET /api/health`, assert the response body (serialized) contains no substring of that value anywhere, only the `credential_present` boolean
- [x] T010 [P] Implement TC-COMP-343 / DAC-E1-S6-3 (`most_recent_run` present as `null` until CAP-001-E7-S3) in `tests/integration/test_api_health.py::test_health_most_recent_run_is_null` — assert the field is present in the serialized response and equals `null`, not merely absent, so the interface never has to special-case a missing key
- [x] T011 [P] Implement TC-COMP-344 / DAC-E1-S6-4 (application factory mounts the built frontend bundle from the static directory) in `tests/integration/test_api_static_mount.py` — request an unmatched non-API path (e.g. `/coverage`), assert it falls back to `index.html` per the SPA fallback (section 2.5), and request an unknown path under `/api`, assert it returns the error envelope with code `not_found` rather than falling through to the bundle

### Additional Unit Tests

- [x] T012 [P] Write a unit test asserting every route registered by the application factory declares no FastAPI `Security`/`Depends`-based auth dependency, in `tests/unit/test_api_isolation.py` — this is broader than T006's OpenAPI-schema check and inspects each route's dependency list directly, guarding against a future route accidentally adding one
- [x] T013 [P] Write a unit test for the schema-version probe function in isolation (not through the full HTTP stack), in `tests/unit/test_health_schema_version.py` — asserts it returns `None` when `applied_migrations` is empty and the correct integer when populated, without going through `TestClient`
- [x] T014 [P] Write a unit test asserting the database-reachability probe catches a connection failure and returns `"unreachable"` rather than propagating the exception, in `tests/unit/test_health_database_probe.py`
- [x] T015 [P] Write a unit test asserting `HealthResponse` (T002) round-trips through `model_dump_json()` with `credential_present` as a JSON boolean, not a stringified value, in `tests/unit/test_api_models.py`

**Checkpoint**: All nine mandatory TC-ID tests and the four additional unit tests are written and fail — `app.py`, `routes/health.py`, and `app_main.py` do not yet exist.

---

## Phase 3: Core Implementation

**Purpose**: Implement the application factory, its lifespan-managed database connection pool, the request-id middleware, and the health route.

- [x] T016 Create `src/factorflow/api/routes/health.py` implementing `GET /api/health`: probes database reachability and the highest `applied_migrations.version` via the request-scoped connection pool, reads `credential_present()` from `src/factorflow/config/settings.py` (CAP-001-E1-S3), and returns a `HealthResponse` (T002) with `most_recent_run` hardcoded to `None` — this route never raises on a database failure; it catches the connection error and reports `"unreachable"` per DAC-E1-S6-2
- [x] T017 Create `src/factorflow/api/app.py` implementing the FastAPI application factory: constructs the app with no default `dependencies` (so no route inherits an auth requirement), registers the exception handler from `errors.py` (T003), registers the health router, and reads the bind host from `ApiSettings` (CAP-001-E1-S3) for use by `app_main.py` — the application factory itself does not bind a socket; binding is `app_main.py`'s job
- [x] T018 Add a `lifespan` context manager to `app.py` that opens a `psycopg_pool.ConnectionPool` sized by `DatabaseSettings.pool_min`/`pool_max` (CAP-001-E1-S3) on startup and closes it on shutdown, storing it on `app.state` for routes (including `health.py`) to use — no design document names the exact module constructing this pool, so this task fixes it here, in the one place FastAPI's lifespan pattern conventionally owns process-wide resources; note this in the story's Notes section rather than treating it as an invented contract
- [x] T019 Add the static-bundle mount to `app.py` per section 2.5: `StaticFiles` mounted at `/` after the `/api` routes are registered, with an SPA fallback returning `index.html` for any unmatched non-API path, and an explicit `not_found` error-envelope response for any unmatched path under `/api`
- [x] T020 Add request-id middleware to `app.py`: generates a UUID per request, binds it into the structured logging context for the duration of the request (so every log record emitted while handling it carries the id as a field), and includes it in the error envelope (`errors.py`, T003) on any non-2xx response
- [x] T021 Create `src/factorflow/app_main.py` as the uvicorn entrypoint: imports the application factory from `app.py`, reads `FACTORFLOW_API_HOST`/`FACTORFLOW_API_PORT` from `ApiSettings`, and runs uvicorn bound to that host and port

**Checkpoint**: `app.py`, `routes/health.py`, and `app_main.py` exist; T005–T015 all pass.

---

## Phase 4: Integration

**Purpose**: Confirm the full application factory, health route, static mount, and binding behavior work together against a real PostgreSQL 16 instance and a real bound socket.

- [x] T022 Run the full `tests/integration/` and `tests/unit/` suites from Phase 2 against the finished implementation, and fix any mismatch between the response shape produced and the API contract's exact JSON example in the story's Technical Details section
- [x] T023 Manually (or via an additional integration test) verify the container-start ordering assumption this story depends on: the API must bind only after `schema-migrator` (CAP-001-E1-S2) has exited zero — this story's own tests do not exercise that ordering, since it is enforced by the container entrypoint chaining CAP-001-E1-S2 already delivers, not by this component

**Checkpoint**: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` both pass in full. All nine mandatory TC-IDs (TC-COMP-014, 018, 300, 307, 341–346) are green.

---

## Phase 5: Polish

**Purpose**: Confirm the credential and error-disclosure boundaries hold under the complete validation suite.

- [x] T024 Review the exception handler (T003) and the health route's database-failure path (T016) for any accidental inclusion of a driver exception's raw text in the HTTP response, tightening either if a `500` or an "unreachable" report leaks more than the error envelope's `code` and `request_id` fields
- [x] T025 Run the complete validation plan (below) and confirm every command passes

**Checkpoint**: All acceptance criteria this story owns are satisfied; `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv run pytest` all pass.

---

## Dependencies & Execution Order

### Task Dependencies
- T001–T004 (Phase 1): T001 has no dependencies; T002, T003 can run in parallel after T001; T004 is a blocking check, not an implementation task.
- T005–T015 (Phase 2): all depend on Phase 1's models and error envelope (T002, T003); independent of each other, can run in parallel.
- T016 depends on T002 (`HealthResponse`) and CAP-001-E1-S3's `credential_present()`.
- T017 depends on T003 (`errors.py`) and CAP-001-E1-S3's `ApiSettings`.
- T018 depends on T017 (extends the same `app.py`) and CAP-001-E1-S3's `DatabaseSettings`.
- T019, T020 depend on T017 (extend the same `app.py`); can be added in either order.
- T021 depends on T017 and T018 (imports the finished factory).
- T022 depends on T016–T021 (full implementation) to make Phase 2's tests pass.
- T023, T024, T025 depend on T022.

### Parallel Opportunities
- Phase 1: T002, T003 in parallel after T001.
- Phase 2: T005 through T015 all in parallel (distinct test files or distinct test functions within a shared file).
- Phase 3: T016 (health route) can be drafted in parallel with T017–T020 (app factory), converging when both are wired together for T022.

---

## Validation Plan

### Constitution-Defined Commands
- Test: `uv run pytest` (this story's mandatory tests require both the container-backed cases in `tests/integration/` and the container-free cases in `tests/unit/`)
- Lint: `uv run ruff check .`
- Format check: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- `GET /api/health` against a reachable, migrated database returns exactly the five fields in the story's JSON example, with `schema_version` equal to the highest version in `applied_migrations` (AC-18, DAC-E1-16, DAC-E1-S6-1).
- `GET /api/health` against an unreachable database still returns `200`, with `database: "unreachable"` rather than a failed request (DAC-E1-S6-2).
- No response body from `GET /api/health`, serialized in any form, contains the provider credential value — only the `credential_present` boolean (AC-13, DAC-E1-9).
- `most_recent_run` is present and `null` in every health response until CAP-001-E7-S3 lands (DAC-E1-S6-3).
- The bound socket accepts no connection on a non-loopback interface (AC-14).
- No route declares a security scheme, dependency, or requirement of any credential, session, or token (DAC-E1-S6-6).
- An unmatched non-API path falls back to the SPA's `index.html`; an unmatched `/api` path returns the error envelope with code `not_found` (DAC-E1-S6-4).

### Postgres-Marked Test Note
Per the tech stack's validation notes: T007, T008, T010, T011, T022's integration cases require the `postgres` marker and a running container runtime. If unavailable, run `uv run pytest -m 'not postgres'` and report the exclusion explicitly — T005, T006, T009, T012–T015 all run without a container and should still pass.

---

## Notes

- **The `psycopg_pool.ConnectionPool` construction site is this story's decision, not an existing contract.** No component design in this capability names the exact module that constructs the pool object CAP-001-E1-S3's `DatabaseSettings.pool_min`/`pool_max` sizes. T018 places it in `app.py`'s lifespan, which is the idiomatic FastAPI location for a process-wide resource with a startup/shutdown hook, and stores it on `app.state` so `health.py` and every later route can reach it without importing `app.py` directly. This is recorded here per constraint 7 (note gaps rather than invent silently), not asserted as something the design already specified.
- **`most_recent_run`'s real shape is CAP-001-E7-S3's to define.** This story hardcodes the field to `None` in `HealthResponse` (T002, T016). When CAP-001-E7-S3 lands, it will need to either populate this same model field or extend it — that story's task plan should treat this field as already present and typed loosely (`RunSummary | None`) rather than adding a new field.
- **This story is a hard dependency on CAP-001-E1-S1, CAP-001-E1-S2, and CAP-001-E1-S3.** It reads `applied_migrations` (S1/S2) and `credential_present()`/`ApiSettings`/`DatabaseSettings` (S3). If any of those have not landed on this branch, T004 should block rather than duplicate their contracts here.
- **No frontend bundle exists yet.** `src/factorflow/api/static/` is created empty (T001) with the SPA-fallback behavior implemented and tested (T011) against whatever is present — including nothing. Building or fetching the actual Vite bundle is out of this story's scope, per the component design's own assumption that "the bundle is built into the image."
- **The container-start ordering (API binds only after the migrator exits zero) is enforced by CAP-001-E1-S2's entrypoint chaining, not by this component.** T023 is a verification step, not an implementation task — no code in this story should attempt to re-check migration status before binding, since that would duplicate a guarantee the entrypoint already provides.
- **Every other route this component eventually needs** (`instruments.py`, `settings.py`, `runs.py`, `coverage.py`, and `api/bounds.py`'s request-bound constants) is out of this story's scope; this plan touches only what the health endpoint and the application factory require.
