---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S7-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-12
updated: 2026-10-12
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.296"
  timestamp: 2026-10-13T04:10:00Z
  source_artifacts:
    - id: CAP-001-E1-S7
      version: "2"
    - id: CAP-001-component-design-ingestion-api
      version: "8"
    - id: CAP-001-component-design-runtime-config
      version: "14"
    - id: CAP-001-component-tests
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E1-S7 — Host and Origin Checks on the API

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S7.md`
**Component**: `FactorFlow-v2` (module `ingestion-api`)
**Branch**: planned on `usr/alvaro-de-jodra/CAP-001-stories`; coded on the story's own branch per `docs/branch-naming.md`
**Date**: 2026-10-12

## Summary

Adds one HTTP middleware to `src/factorflow/api/app.py` that refuses a request whose `Host` is missing or not one of the API's three loopback hosts (`400 host_not_allowed`) and a state-changing request whose `Origin` is foreign or `null` (`403 origin_not_allowed`), before any route or the static mount runs (`component-design-ingestion-api.md` v8 section 2.5a; CONST-SEC 1.3 SEC-ENC-001 host-local loopback exception, condition H9). The 15 `TestClient` modules move from the default `Host: testserver` to `base_url="http://127.0.0.1:8000"`, and the release-source guard `test_release_source_accepts_no_http_scheme` is narrowed to exempt exactly the three loopback origin forms in `api/app.py` (DAC-E1-S7-6).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-14 | Interface reachable only on the owner's machine and its loopback names | T003, T004, T013, T014 |
| DAC-E1-18 | Foreign or missing `Host` gets 400; foreign `Origin` on a state change gets 403 | T003, T004, T005, T013 |
| DAC-E1-S7-1 | The three loopback hosts pass; foreign, wrong-port, missing `Host` get 400 before routes and the static mount | T004, T013 |
| DAC-E1-S7-2 | Foreign or `null` `Origin` on each of the five state-changing routes gets 403 and no handler runs | T005, T013 |
| DAC-E1-S7-3 | No `Origin` or a loopback origin passes; `GET` with a foreign `Origin` passes | T006, T013 |
| DAC-E1-S7-4 | Refusal logged at `warning` with request id and rejected header; no body or credential | T007, T013, T014 |
| DAC-E1-S7-5 | Refused `POST /api/acquisition-runs` creates no run | T008, T013 |
| DAC-E1-S7-6 | Release-source guard exempts only the three loopback origin forms in `api/app.py` | T009, T010, T012 |

## Phase 1: Setup

**Purpose**: Make the existing API tests send a loopback `Host`, so they keep passing once the host check lands.

- [ ] T001 Change every `TestClient(app, ...)` construction to pass `base_url="http://127.0.0.1:8000"`, assertions unchanged, in the 15 modules the story lists: `tests/integration/test_api_coverage.py`, `test_api_health.py`, `test_api_instruments.py`, `test_api_pagination.py`, `test_api_runs.py`, `test_api_settings.py`, `test_api_static_mount.py`; `tests/unit/test_api_coverage_routes.py`, `test_api_errors.py`, `test_api_instruments_error_mapping.py`, `test_api_instruments_query_mapping.py`, `test_api_no_secrets.py`, `test_api_request_id.py`, `test_api_request_id_redaction_composition.py`, `test_api_runs_routes.py`. Where a module builds the client in a fixture, change the fixture once. Any module that sets `FACTORFLOW_API_PORT` to another value uses that port in its `base_url` instead.
- [ ] T002 Run `uv run pytest` and confirm the suite is green before any production change (the `base_url` change alone must not alter results).

**Checkpoint**: Full suite green with loopback `Host` headers everywhere.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the middleware's behaviour.

### Mandatory Component Tests

All in the new `tests/unit/test_api_host_origin.py` (no `postgres` marker), each carrying its `# Implements TC-COMP-NNN` comment. The module builds the app with `create_app()` after setting `FACTORFLOW_DATABASE_URL` to the placeholder the other API unit tests use, enters no lifespan where a route is stubbed, and sends explicit `Host` and `Origin` headers.

- [ ] T003 [P] Implement TC-COMP-390 (loopback host and own origin served normally on `/api/health`, `/`, and `POST /api/instruments` with the instruments service stubbed)
- [ ] T004 [P] Implement TC-COMP-401 (three loopback hosts pass) and TC-COMP-402 (foreign `evil.example:8000`, wrong-port `127.0.0.1:9999` and missing `Host` each get 400 `host_not_allowed` on `/api/health` and `/`, parametrised; a recording stub proves no route handler ran). Sending no `Host` needs a raw ASGI call or a transport that omits the header, since `TestClient` always adds one; build the scope directly if needed.
- [ ] T005 [P] Implement TC-COMP-403: parametrise over the five state-changing routes (`POST /api/acquisition-runs`, `POST /api/acquisition-runs/{run_id}/cancel`, `PUT /api/settings/history-depth`, `POST /api/instruments`, `DELETE /api/instruments/{symbol}`) and over `Origin: https://evil.example` and `Origin: null`; expect 403 `origin_not_allowed` and no handler call (handlers or their service dependencies replaced by recording doubles through FastAPI dependency overrides or `app.state`, following the pattern each route's existing unit tests use)
- [ ] T006 [P] Implement TC-COMP-404 (no `Origin`, and each of the three loopback origins, reach the `POST /api/acquisition-runs` handler) and TC-COMP-405 (`GET /api/health` with a foreign `Origin` is not refused)
- [ ] T007 [P] Implement TC-COMP-406: capture records on the structured logging path (`caplog` on the root logger, as `test_api_request_id.py` does); one `warning` record per refusal carries the request id and the rejected header value; no record contains the posted JSON body or a distinctive `FACTORFLOW_MASSIVE_API_KEY` value; the response's `X-Request-Id` equals the record's id
- [ ] T008 [P] Implement TC-COMP-407: the run-creation path of `POST /api/acquisition-runs` replaced by a recording double; a foreign `Origin` gives 403 and the double is never called
- [ ] T009 [P] Implement TC-COMP-408 and TC-COMP-409 in `tests/unit/test_release_excludes_test_paths.py`: TC-COMP-408 is the existing `test_release_source_accepts_no_http_scheme` passing against `src/factorflow` with the middleware in place; TC-COMP-409 is a new test that runs the guard's scan over synthetic trees in `tmp_path` (the three forms in a module other than `api/app.py`; a fourth `http://example.com` in `api/app.py`; a module comparing a value with `"http"`) and asserts each yields an offender. Refactor the scan into a helper taking a root path so both tests share it.

### Additional Unit Tests

- [ ] T010 [P] In `tests/unit/test_release_excludes_test_paths.py`, assert the exemption is keyed on the path relative to `src/factorflow` (`api/app.py`), so a file named `app.py` in another package is not exempt
- [ ] T011 [P] In `tests/unit/test_api_host_origin.py`, assert the allowed sets follow `ApiSettings.port`: with `FACTORFLOW_API_PORT=8123`, `Host: 127.0.0.1:8123` passes and `Host: 127.0.0.1:8000` gets 400 (ingestion-api section 2.5a: "`<port>` is `ApiSettings.port`"; the E2E stack's port 8123 relies on it)

**Checkpoint**: All new tests written and failing (no production code yet); TC-COMP-408 still passes.

---

## Phase 3: Core Implementation

**Purpose**: The middleware and the narrowed guard.

- [ ] T012 Narrow `test_release_source_accepts_no_http_scheme` in `tests/unit/test_release_excludes_test_paths.py`: an `ast.Constant` starting with `http://` is accepted only when the file is `src/factorflow/api/app.py` and the value is exactly `http://127.0.0.1:`, `http://localhost:` or `http://[::1]:` (the literal parts of the f-strings T013 builds). The comparison and literal-membership checks for `"http"` stay unconditional. Update the module docstring to cite DAC-E1-S7-6 and ingestion-api section 2.5a. (DAC-E1-S7-6)
- [ ] T013 Add `_add_host_origin_middleware(app)` to `src/factorflow/api/app.py`, called from `create_app()` **before** `_add_request_id_middleware(app)`. Starlette makes the last-registered `@app.middleware("http")` the outermost, so the request-id middleware wraps this one and every refusal carries `request.state.request_id` and the `X-Request-Id` header. Behaviour:
  - Read `ApiSettings().port` once at factory time and build `allowed_hosts = {f"127.0.0.1:{port}", f"localhost:{port}", f"[::1]:{port}"}` and `allowed_origins = {f"http://127.0.0.1:{port}", f"http://localhost:{port}", f"http://[::1]:{port}"}`.
  - `Host`: compare `request.headers.get("host")` (host part lower-cased) for exact membership; missing or not a member returns `error_response(400, "host_not_allowed", <fixed message>, request_id, resource=None)` without calling `call_next`.
  - `Origin`: when the method is not `GET`, `HEAD` or `OPTIONS` and an `Origin` header is present, it must be an exact member of `allowed_origins` (so `null` is refused); otherwise return `error_response(403, "origin_not_allowed", <fixed message>, ...)`.
  - Log each refusal through `logging.getLogger(__name__).warning(...)` with the request id and the rejected header value; read no body and no setting other than the port.
  - Docstring cites ingestion-api section 2.5a, CONST-SEC 1.3 H9, DAC-E1-18 and DAC-E1-S7-1 to S7-5.
  (DAC-E1-18, DAC-E1-S7-1 to S7-5, AC-14)

**Checkpoint**: Every Phase 2 test passes.

---

## Phase 4: Integration

**Purpose**: Confirm the real stacks still work through the middleware.

- [ ] T014 Run `uv run pytest` (PostgreSQL-marked integration tests included) and `npm run test:e2e`. The E2E pages are served by the API itself at `http://127.0.0.1:8123` (`playwright.config.ts` `baseURL`, `scripts/run-e2e-server.sh`), so their `Host` and `Origin` are the API's own loopback forms and must pass unchanged. A failure here is a defect in T013, not a reason to widen the allowed sets.

**Checkpoint**: Full Python suite and Playwright suite green.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T015 Run `uv run ruff check .`, `uv run ruff format --check .` and `uv run mypy src`; fix findings in the touched files only.
- [ ] T016 After each TDD cycle in T003–T013 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-001-E1-S7-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Hard edges already in `dependencies.yaml` for this story: CAP-001-E1-S6, CAP-001-E2-S3, CAP-001-E3-S6, CAP-001-E5-S5, CAP-001-E7-S2 (all done). No new edge.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S8 | soft | Edits 13 of the same test modules (placeholder URLs) but no file this story's code imports; whichever merges second rebases (story Dependencies) |
| CAP-001-E1-S9 | soft | Also edits `tests/unit/test_release_excludes_test_paths.py` (its Dockerfile assertions); no code dependency in either direction |

### Task Dependencies
- T001 → T002: setup before any test.
- T003–T011: depend on T002; parallel with each other.
- T012: depends on T009, T010 (tests first).
- T013: depends on T003–T008, T011.
- T014: depends on T012, T013.
- T015: depends on T014.
- T016: interleaved — runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities
- Phase 2: T003–T011 touch two test files and can be written in parallel.
- Phase 3: T012 and T013 touch different files.

---

## Validation Plan

### Constitution-Defined Commands
- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest -m 'not postgres'`, then `uv run pytest`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Types: `uv run mypy src`
- End-to-end: `npm ci`, `npm run build`, `npm run test:e2e`

### Story-Specific Validation
- `uv run pytest tests/unit/test_api_host_origin.py tests/unit/test_release_excludes_test_paths.py -q` passes, with TC-COMP-390 and TC-COMP-401 to 409 present by marker.
- `grep -rn "TestClient(" tests | grep -v base_url` returns nothing in the 15 listed modules.
- `npm run test:e2e` passes unchanged (DAC-E1-18 does not refuse the interface's own requests).

## Notes

- **Middleware order (resolved by precedence and local pattern).** The story leaves the order to the plan; DAC-E1-S7-4 requires the refusal to carry the request id, and Starlette's `add_middleware` makes the last-registered middleware outermost, so T013 registers before the request-id middleware. No artifact conflict.
- **Missing `Host`.** HTTP/1.1 clients always send `Host`, and `TestClient` adds one; TC-COMP-402's missing-`Host` case is exercised through a hand-built ASGI scope. This is a test technique, not a design gap.
- **Guard narrowing scope.** DAC-E1-S7-6 supersedes DAC-E3-S6-17 (c)'s heuristic only for the three exact strings in `api/app.py`; the guard's intent (no `http` provider base URL in the release build, SEC-NDG-001) is unchanged, and TC-COMP-364's assertions are unchanged (coverage matrix v3 note).
- **Shared test modules.** CAP-001-E1-S8 rewrites the `postgresql://unused/unused` placeholders in 13 of the modules T001 touches, and CAP-001-E1-S9 extends `tests/unit/test_release_excludes_test_paths.py` alongside T009 and T012. Neither is a code dependency; whichever story merges second rebases onto the first.
- **No TDD exception.** Every behaviour-changing commit is covered by T016.
