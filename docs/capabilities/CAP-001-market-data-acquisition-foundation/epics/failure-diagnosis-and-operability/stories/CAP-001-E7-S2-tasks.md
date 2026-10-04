---
artifact_schema_version: 1
artifact_id: CAP-001-E7-S2-tasks
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
  timestamp: 2026-10-02T04:07:14Z
  source_artifacts:
    - id: CAP-001-E7-S2
      version: "1"
    - id: CAP-001-E7
      version: "1"
    - id: CAP-001
      version: "8"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-component-tests
      version: "1"
    - id: CAP-001-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E7-S2 — Shared Error Envelope and Request Correlation

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E7-tasks-20261002T034533Z`
**Date**: 2026-10-02

## Summary

Every error must tell the owner-operator the operation, the resource and the reason, and must carry a request id that finds the failure in the log. The story says it delivers `src/factorflow/api/errors.py` and the request-id middleware in `app.py`. Both already exist: CAP-001-E1-S6 created them (`94a5bba`, reworked in `f6cdb89`), CAP-001-E2-S3 added the application-wide validation handler and `_resource_for_path` (`aa4a40a`, `dd9a8e2`), and CAP-001-E5-S5 added the optional `error.state` (`89d9e47`). This plan is therefore a **delta against the real code**. A probe of the current application through `TestClient` (planning, 2026-10-02) found five gaps against the story's criteria:

1. **A `500` body carries more than code and request id.** `internal_error_handler` returns `message` and `resource: null` as well (DAC-E7-7).
2. **The `500` log record carries no request id, and the `500` response has no `X-Request-Id` header.** Starlette runs the `Exception` handler in `ServerErrorMiddleware`, outside the `@app.middleware("http")` request-id middleware, so `_request_id_var` has already been reset when the detail is logged (DAC-E7-6, DAC-E7-S2-3). This is the record that matters most: it holds the stack trace.
3. **Framework HTTP errors other than 404 bypass the envelope.** `DELETE /api/health` returns `405 {"detail": "Method Not Allowed"}`, and any `HTTPException` returns `{"detail": <detail>}`, echoing its detail text (DAC-E7-5, DAC-E7-S2-4).
4. **An unmatched `/api` path returns `resource: null`** (DAC-E7-5 requires the resource).
5. **A validation failure does not name the field.** The message is always "The request did not match the expected shape." Ingestion-api §8 item 12 requires the field to be named, and the reason is what AC-10 asks for.

Everything else is already met and is pinned here by mapped component tests written as characterization tests: the `{"error": {...}}` envelope on every route-composed error, the stable codes, the Pydantic validation override, request ids stamped on in-request records, and the body/header request-id match. The E5-S5 `error_response` signature and its `state` behaviour, the E2-S3 resource mapping, and every existing test stay as they are.

### Gap Analysis by Acceptance Criterion

| AC | Already satisfied | Missing (this plan) |
|----|-------------------|---------------------|
| AC-10 | Route-composed errors carry `code`, `message`, `resource` (`errors.py` `error_response`; every `routes/*.py` call passes `resource`) | `resource` on unmatched-path 404s and framework HTTP errors; field named on 422 |
| DAC-E7-5 | `error_response`, `not_found_handler`, `_validation_error_handler` | Framework `HTTPException` (e.g. 405) into the envelope; `resource` on 404 |
| DAC-E7-6 | `_request_id_var` + `_install_request_id_patch` stamp in-request records (`tests/unit/test_api_request_id.py`) | Stamp the unhandled-exception record |
| DAC-E7-7 | `code: internal_error`, no driver text (`tests/unit/test_api_errors.py::test_500_does_not_expose_driver_detail`) | Body reduced to `code` and `request_id` only |
| DAC-E7-S2-1 | Every code is a literal snake_case string | Codes for framework HTTP errors, not derived from detail wording |
| DAC-E7-S2-2 | No driver text in the `500` body | Asserted with no stack trace, exception class name or driver message |
| DAC-E7-S2-3 | Body and header ids match on route errors (`test_request_id_same_in_body_and_header_on_409`) | Same id in the `500` log record and an `X-Request-Id` header on the `500` |
| DAC-E7-S2-4 | Fixed messages in `_validation_error_handler` and the 500 path never echo input | `HTTPException.detail` is no longer echoed |
| DAC-E7-S2-5 | `RequestValidationError` → `validation_error` envelope (`app.py` `_validation_error_handler`) | Field named in the message (ingestion-api §8 item 12) |

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-10 | Any failure the owner sees has its operation, resource and reason available from the response. | T001, T002, T007, T008, T010, T011 |
| DAC-E7-5 | Every non-2xx response carries one envelope: stable snake_case code, owner-facing prose, resource and request id. | T002, T005, T008, T010, T011 |
| DAC-E7-6 | A generated request id is in every log record for the request. | T004, T009, T010, T011 |
| DAC-E7-7 | A `500` returns only an internal-error code and the request id, with the detail in the log. | T003, T009, T010, T011 |
| DAC-E7-S2-1 | Codes are stable snake_case and do not change with message wording. | T005, T008, T010, T011 |
| DAC-E7-S2-2 | No stack trace or driver message in an unhandled exception's response body. | T003, T009, T010, T011 |
| DAC-E7-S2-3 | The id in a response is the id in that request's log records. | T003, T004, T009, T010, T011 |
| DAC-E7-S2-4 | No credential value can appear in any error response. | T006, T008, T010, T011 |
| DAC-E7-S2-5 | Pydantic validation failures use the shared envelope, not FastAPI's default. | T007, T010, T011 |

## Phase 1: Setup

**Purpose**: Confirm the producers this delta modifies have landed, and record a characterization baseline before any change (TEST-TDD-007).

- [x] T001 Before you edit any file, verify these seams exist as described: in `src/factorflow/api/errors.py`, `ErrorDetail`, `ErrorEnvelope`, `error_response(status_code, code, message, request_id, resource=None, state=None)` and `internal_error_handler` (CAP-001-E1-S6, CAP-001-E5-S5); in `src/factorflow/api/app.py`, `_request_id_var`, `_install_request_id_patch`, `_add_request_id_middleware`, `not_found_handler` inside `_add_static_mount`, `_VALIDATION_ERROR_RESOURCES`, `_resource_for_path`, `_validation_error_handler` and the two `add_exception_handler` calls in `create_app` (CAP-001-E1-S6, CAP-001-E2-S3). Then run `uv run pytest -m 'not postgres' tests/unit/test_api_errors.py tests/unit/test_api_request_id.py tests/unit/test_api_request_id_redaction_composition.py tests/unit/test_api_no_secrets.py tests/unit/test_api_instruments_error_mapping.py tests/unit/test_api_runs_routes.py tests/unit/test_api_coverage_routes.py` and record it green as the baseline. Stop if any seam differs from this description (prerequisite infrastructure, traces to AC-10).

**Checkpoint**: The existing envelope, handlers and middleware are green and unmodified, and recorded as the baseline every later task must preserve.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the mapped component tests and the additional unit tests. Observe RED for every gap in the Summary. Record already-satisfied behaviour as passing characterization tests (TEST-TDD-001, TEST-TDD-002, TEST-TDD-007).

Shared mechanics for every task in this phase:

- All cases are plain `pytest` with FastAPI's `TestClient`, carry no `postgres` marker, and must pass under `uv run pytest -m 'not postgres'`. Set `FACTORFLOW_DATABASE_URL=postgresql://unused/unused` and stub the pool the way the existing `_app_with_pool` / `_FakePool` helpers in `tests/unit/test_api_errors.py` do. Route-level failures (`409 history_depth_not_set`, `404` run not found) are driven by monkeypatching `factorflow.api.routes.runs.*`, as those tests already do.
- A test needing a route that raises (an unhandled exception, an `HTTPException`) adds a probe route through an `APIRouter` and inserts its routes **at the front** of `app.router.routes` (`app.router.routes[0:0] = probe.routes`). A route appended after `create_app()` returns sits behind the `StaticFiles` mount at `/` and is never reached; planning's probe hit exactly that.
- Tests asserting on log records use a client entered as a context manager (`with TestClient(app) as client`), as `tests/unit/test_api_request_id.py`'s fixture does, so `_lifespan` installs `configure_logging()` and `_install_request_id_patch()`. Use `raise_server_exceptions=False` wherever a probe route raises.
- Every test carries its `# Implements TC-COMP-NNN` trace comment.

T002, T003, T005, T006, T007 and T008 extend `tests/unit/test_api_errors.py` (the file ingestion-api §7 names for these cases) and run serially. Every existing test in that file stays unchanged. T004 extends `tests/unit/test_api_request_id.py` and can run in parallel with them.

### Mandatory Component Tests

- [x] T002 In `tests/unit/test_api_errors.py`, add `# Implements TC-COMP-070` and `# Implements TC-COMP-010`. Parametrise over every handled error type: unmatched `GET /api/does-not-exist` (404), `GET /api/acquisition-runs/{uuid}` with the run absent (404 `not_found`), `POST /api/acquisition-runs` without depth (409 `history_depth_not_set`), `PUT /api/settings/history-depth` with `{"years": "x"}` (422), `GET /api/instruments?limit=501` (422), and `DELETE /api/health` (405). For each, assert:
  - the body's only top-level key is `"error"`, and there is no top-level `"detail"`;
  - `error` carries `code`, `message`, `resource` and `request_id`, each a non-empty string (`state` remains permitted only on `run_already_terminal`, per the existing test);
  - `error.request_id` equals the `X-Request-Id` header.

  Observe RED for the 405 case (Starlette's default `{"detail": …}` body) and for the unmatched path (`resource` is `null`). The other cases are characterization (depends on T001; traces to DAC-E7-5, AC-10).
- [x] T003 In `tests/unit/test_api_errors.py`, add `# Implements TC-COMP-072` and `# Implements TC-COMP-084`. Through a probe route raising `RuntimeError("psycopg.OperationalError: connection to 127.0.0.1:5432 failed")`, assert:
  - status `500` and a body exactly equal to `{"error": {"code": "internal_error", "request_id": <id>}}`, with no `message` and no `resource` key;
  - `<id>` equals the `X-Request-Id` header, which is present;
  - the body contains none of `Traceback`, `RuntimeError`, `psycopg`, `5432`;
  - a captured `ERROR` record from logger `factorflow.api` carries `exc_info` whose formatted text contains the driver message, so the detail went to the log.

  Observe RED on the extra keys and on the missing header (depends on T002; traces to DAC-E7-7, DAC-E7-S2-2, DAC-E7-S2-3).
- [x] T004 [P] In `tests/unit/test_api_request_id.py`, add `# Implements TC-COMP-071` and `# Implements TC-COMP-085`, reusing the existing `client` fixture with a probe route inserted as described above. For a `500` from a probe route that first logs an `INFO` line on `factorflow.api.probe` and then raises, a `404` on an unmatched `/api` path, and a `422` from `GET /api/instruments?limit=501`, capture at root (`caplog.at_level(logging.INFO)`) and assert that every `factorflow.api*` record carries `request_id` equal to the response's `X-Request-Id` and its `error.request_id`. For the `500`, specifically assert that the `unhandled exception during request handling` record carries it. Two error requests get different ids. Keep both existing tests unchanged. Observe RED on the `500` record (its `request_id` is `None` today) (depends on T001; traces to DAC-E7-6, DAC-E7-S2-3).
- [x] T005 In `tests/unit/test_api_errors.py`, add `# Implements TC-COMP-083`. Assert that every `error.code` produced by T002's matrix and T003's `500` matches `^[a-z][a-z0-9]*(_[a-z0-9]+)*$` and equals its expected literal. Add two probe routes raising `starlette.exceptions.HTTPException(status_code=405, detail="wording one")` and `(…, detail="completely different wording")`, and assert both return the same `error.code` (`method_not_allowed`, Open Gap 1). Observe RED on the probe routes (depends on T003; traces to DAC-E7-S2-1, DAC-E7-5).
- [x] T006 In `tests/unit/test_api_errors.py`, add `# Implements TC-COMP-086` and `# Implements TC-COMP-069`. Set `FACTORFLOW_MASSIVE_API_KEY` to a synthetic `SECRET` constant and compose each error with that value in scope:
  - (a) a probe route raising `RuntimeError(f"auth failed apiKey={SECRET}")` → `500`;
  - (b) a probe route raising `HTTPException(status_code=400, detail=f"bad key {SECRET}")`;
  - (c) `PUT /api/settings/history-depth` with `{"years": SECRET}` → `422`, where FastAPI's default shape would echo the input;
  - (d) `GET /api/instruments?limit=` + `SECRET` → `422`.

  Assert `SECRET` appears in neither `response.text` nor any response header value. Observe RED on (b), whose detail is echoed today. (a), (c) and (d) are characterization (depends on T005; traces to DAC-E7-S2-4).
- [x] T007 In `tests/unit/test_api_errors.py`, add `# Implements TC-COMP-087`. For `PUT /api/settings/history-depth` with `{"years": "x"}`, the same route with no body, and `GET /api/acquisition-runs?limit=0`, assert the body is the shared envelope with no top-level `detail`, `code == "validation_error"`, `resource` from `_resource_for_path` (`settings`, `settings`, `acquisition-run`), and `message` naming the offending field (`years`, `body` for the missing body, `limit`). Observe RED on the field naming (depends on T006; traces to DAC-E7-S2-5, AC-10).

### Additional Unit Tests

- [x] T008 In `tests/unit/test_api_errors.py`, add implementation-level cases for the framework HTTP error handler:
  - `405` keeps Starlette's `Allow` response header;
  - an `HTTPException(status_code=404)` raised from a probe route still goes through `not_found_handler` (`code: not_found`), because the status-specific handler takes precedence;
  - a status code absent from `http.HTTPStatus` (e.g. `599`) yields `code: "http_error"`;
  - `error.message` is the fixed sentence built from the reason phrase, never the detail text;
  - `resource` comes from `_resource_for_path`.

  `tests/integration/test_api_static_mount.py` already covers the non-API SPA fallback, which must stay unchanged; do not duplicate it here. Observe RED (depends on T007; traces to DAC-E7-5, DAC-E7-S2-1, DAC-E7-S2-4).

**Checkpoint**: All nine mapped TC-IDs plus TC-COMP-069 (TC-COMP-010, 069, 070, 071, 072, 083, 084, 085, 086, 087) carry `# Implements` trace comments. RED is observed and recorded for each of the five gaps. The characterization cases pass against unmodified code. No existing test is modified.

---

## Phase 3: Core Implementation

**Purpose**: Reduce the `500` to its specified shape and make its log record findable, without touching the envelope that route-composed errors use (TEST-TDD-003).

- [x] T009 Update `src/factorflow/api/errors.py`:
  - **Body.** `internal_error_handler` returns `JSONResponse(status_code=500, content={"error": {"code": "internal_error", "request_id": request_id}})` directly, with no `message` and no `resource` (ingestion-api §2.3 and §4, DAC-E7-7; Resolved Conflicts 1 and 2).
  - **Log record.** Keep `_LOGGER.error("unhandled exception during request handling", exc_info=exc)` and add `extra={"request_id": request_id}` when `request.state` carries one. The handler is then correct even when Starlette's `ServerErrorMiddleware` invokes it after `_request_id_var` was reset. `_stamped_handle` sets the attribute only when it is absent, so the two compose.
  - **Unchanged.** `ErrorDetail`, `ErrorEnvelope` and `error_response` keep their signature, the `state` exclusion and the `resource`-may-be-null behaviour that CAP-001-E5-S5 and every route depend on.
  - **Docstrings.** Update the module and handler docstrings to cite CAP-001-E7-S2, DAC-E7-7 and DAC-E7-S2-3.

  (depends on RED from T003 and T004; satisfies DAC-E7-7, DAC-E7-S2-2, DAC-E7-S2-3, DAC-E7-6).

**Checkpoint**: T003's body assertions are green, and T004 is green for records logged from the handler. Every pre-existing test in `tests/unit/test_api_errors.py` and `tests/unit/test_api_coverage_routes.py::test_database_failure_is_an_internal_error` still passes.

---

## Phase 4: Integration

**Purpose**: Wire the remaining envelope coverage and the `500` correlation into the application factory and middleware.

- [x] T010 Update `src/factorflow/api/app.py`:
  - **Middleware.** In `_add_request_id_middleware`, wrap `await call_next(request)` in `try/except Exception as exc`, and on an exception build the response with `internal_error_handler(request, exc)` while `_request_id_var` is still bound. Keep the `finally` reset. Set `X-Request-Id` on every response, the `500` included. Keep `app.add_exception_handler(Exception, internal_error_handler)` as the backstop. Planning verified that this Starlette (1.6.0) re-raises app exceptions from `call_next` (DAC-E7-6, DAC-E7-S2-3).
  - **Framework HTTP errors.** Add `_http_error_handler(request, exc: starlette.exceptions.HTTPException)` beside `_validation_error_handler` and register it in `create_app` with `app.add_exception_handler(StarletteHTTPException, _http_error_handler)`. The status-specific `404` handler keeps precedence. The handler returns `error_response`:
    - `code`: snake_case of `http.HTTPStatus(exc.status_code).phrase`, or `"http_error"` when the status is not in `HTTPStatus`;
    - `message`: a fixed owner-facing sentence built from the phrase, never `exc.detail`;
    - `resource`: `_resource_for_path(request.url.path)`;
    - `request_id`: from `request.state`;
    - and it copies `exc.headers` (e.g. `Allow`) onto the response.

    See Open Gap 1. It lives in `app.py` rather than `errors.py` because it needs `_resource_for_path`, following the `_validation_error_handler` precedent (DAC-E7-5, DAC-E7-S2-1, DAC-E7-S2-4).
  - **Unmatched API path.** In `not_found_handler`, pass `resource=_resource_for_path(request.url.path)`. Keep `code`, `message`, the `/api` prefix test and the non-API `index.html` / bare-404 fallback unchanged (Open Gap 2; DAC-E7-5).
  - **Validation message.** In `_validation_error_handler`, name the offending fields in `message`, taken from each `exc.errors()` entry's `loc`: drop a leading `body`, `query`, `path`, `header` or `cookie` segment, keep `body` itself when it is the only segment, de-duplicate and keep first-seen order. Never include an error's `input`, `ctx` or `msg`. Keep `code="validation_error"`, status `422` and `resource=_resource_for_path(...)` unchanged (Open Gap 3; ingestion-api §8 item 12, DAC-E7-S2-5, DAC-E7-S2-4).
  - **Docstrings.** Update `_add_request_id_middleware`'s and `create_app`'s docstrings to name the CAP-001-E7-S2 additions.

  (depends on T009 and RED from T002, T004, T005, T006, T007 and T008; satisfies AC-10, DAC-E7-5, DAC-E7-6, DAC-E7-S2-1, DAC-E7-S2-3, DAC-E7-S2-4, DAC-E7-S2-5).

**Checkpoint**: T002–T008 are green through `create_app()`. Every existing API unit test passes unmodified, including `test_cancel_malformed_uuid_returns_422_envelope`, `test_request_id_same_in_body_and_header_on_409` and the `IR-001` composition tests.

---

## Phase 5: Polish

**Purpose**: Kill mutants on the changed behaviour, run full validation, and keep the per-cycle evidence chain.

- [x] T011 After T002–T010 are green and their T012 entries are complete, run the TEST-TDD-005 and TEST-TDD-006 mutation checks on the changed lines. Mutate:
  - re-adding `message` or `resource` to the `500`;
  - dropping the middleware `except` branch, the `extra` request id, or the header on the `500`;
  - echoing `exc.detail` or `input` into any message;
  - deriving the code from `exc.detail`;
  - dropping the `Allow` header copy;
  - restoring `resource=None` in `not_found_handler`;
  - removing a `loc` prefix strip.

  Strengthen tests until every mutant is killed. Then run the full constitution validation set below. Confirm that `web/src/api/client.ts`'s `toApiError` still reads `error.request_id` and `error.code` from a `500`, and that `npm test` (`vitest run`, `package.json`) and `npm run build` stay green (traces to every AC).
- [x] T012 Run this after **each** TDD cycle in T002–T011, not once at the end. Stage only that cycle's diff. Dispatch an independent code-review subagent and an independent spec-drift subagent against it. Append the cycle to `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S2-tdd-evidence.yaml`, beside this story, with `code_review_verdict`, `spec_drift.drift_detected` and its RED/GREEN evidence. Record characterization cases (the already-green parts of T002, T006 and T007) as such, with GREEN-on-arrival evidence instead of a fabricated RED. Do not commit a `REJECTED` or `drift_detected: true` cycle. After the commit, record its `commit_hash` and `tests_executed: true` before the next cycle begins (INV-TDD-002, TEST-TDD-008; traces to no AC).

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

`dependencies.yaml` now records
`CAP-001-E7-S2: [CAP-001-E1-S6, CAP-001-E2-S3, CAP-001-E5-S5]`. This revision adds two hard edges. Both producers are implemented and merged (story status `docs-sync`), so neither blocks scheduling.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S6 | hard | Existing edge. It created `src/factorflow/api/errors.py`, `create_app`, `_request_id_var`, `_install_request_id_patch`, `_add_request_id_middleware` and `not_found_handler` (`94a5bba`, `f6cdb89`), and `tests/unit/test_api_request_id.py`, which T004 extends. T009 and T010 modify all of them. |
| CAP-001-E2-S3 | hard | **New edge.** It created `_validation_error_handler`, `_VALIDATION_ERROR_RESOURCES` and `_resource_for_path` in `src/factorflow/api/app.py` (`aa4a40a`, `dd9a8e2`). T010 modifies the handler and reuses `_resource_for_path` for two more handlers. |
| CAP-001-E5-S5 | hard | **New edge.** It extended `error_response` with `state` in `src/factorflow/api/errors.py` and created `tests/unit/test_api_errors.py` (`89d9e47`). T009 modifies `errors.py` around that contract, and T002–T008 extend that test file. |
| CAP-001-E7-S1 | soft | Its T010 asserts that `?state=bogus` and `?outcome=bogus` return the `422` envelope with `resource: "acquisition-run"` and a request id, produced by `_validation_error_handler`. This plan changes only that handler's `message` wording, and the code, resource and request id stay as asserted. Neither story imports from the other, so both can be developed against the approved ingestion-api §2.3 envelope. It also maps TC-COMP-010 to its run-detail facet. |
| CAP-001-E5-S6 | context | The Runs screen's `web/src/api/client.ts` `toApiError` reads `error.message`, `error.request_id`, `error.code` and `error.state`, and falls back to a generic message when `message` is absent. A `500` without `message` therefore still yields the request id. Its docstring already anticipates this story. |
| CAP-001-E2-S4 | context | The Instruments screen consumes the same `ApiError` path as CAP-001-E5-S6. It is unaffected for the same reason. |
| CAP-001-E6-S4 | context | The Coverage screen consumes the same `ApiError` path. It is unaffected. |
| CAP-001-E7-S4 | context | The run-detail screen will render errors through the same client. Owner-web-app §8 item 17 (a `500` renders an error and a retry) needs no `message` from the API. |

### Task Dependencies

- T001 gates everything.
- T002 → T003 → T005 → T006 → T007 → T008 run serially because they share `tests/unit/test_api_errors.py`.
- T004 depends only on T001 and touches `tests/unit/test_api_request_id.py` (`[P]`).
- T009 depends on RED from T003 and T004.
- T010 depends on T009 and on RED from T002, T004, T005, T006, T007 and T008.
- T011 depends on T002–T010 and their T012 entries.
- T012 is interleaved: it runs after every TDD cycle, before that cycle's commit.

### Parallel Opportunities

- T004 can be written in parallel with the T002–T008 chain.
- T009 (`errors.py`) and the non-middleware parts of T010 (`app.py`) touch different files, but the middleware change calls `internal_error_handler`'s new behaviour, so implement T009 first. TEST-TDD-008 serializes their commits anyway.

### Phase Dependencies

- Phase 1 precedes everything.
- Phase 2's RED for each behaviour precedes the matching Phase 3 or Phase 4 change.
- Phase 3 supplies the reduced `500` body and the stamped record, which Phase 4's middleware reuses.
- T012 runs at every commit boundary in Phases 2–4. T011 is the final mutation and validation pass.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest` (full suite); `uv run pytest -m 'not postgres'` (no container)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`
- Frontend (regression only, no frontend file changes): `npm ci`, `npm run build`, `npm test`

The story's own validation line (`uv run pytest -m 'not postgres'`, `uv run ruff check .`, `uv run mypy src`) is a subset of these commands.

### Story-Specific Validation

- `uv run pytest -m 'not postgres' tests/unit/test_api_errors.py tests/unit/test_api_request_id.py`. All ten TC-IDs carry trace comments and pass.
- DAC-E7-5 / AC-10: every handled error type, including `405` and an unmatched `/api` path, returns `{"error": {code, message, resource, request_id}}` with non-empty values and no top-level `detail`.
- DAC-E7-7 / DAC-E7-S2-2: a `500` body is exactly `{"error": {"code": "internal_error", "request_id": …}}`. No traceback, exception class or driver text appears, and the driver text is in the `ERROR` log record.
- DAC-E7-6 / DAC-E7-S2-3: on `404`, `422` and `500`, every `factorflow.api*` record carries the id that appears in the body and in `X-Request-Id`. The `500` now has the header.
- DAC-E7-S2-1: every code is snake_case and literal. Two `HTTPException`s with different detail wording yield the same code.
- DAC-E7-S2-4: a synthetic credential raised in an exception, an `HTTPException.detail`, a body field and a query parameter never reaches the response body or headers.
- DAC-E7-S2-5: Pydantic failures return `validation_error` in the envelope and name the field.
- Regression: every pre-existing case in `tests/unit/test_api_*.py` and `tests/integration/test_api_*.py` passes unmodified. Under a container runtime, run the full `uv run pytest`. Without one, report the `-m 'not postgres'` subset only and do not present it as a green full suite.

---

## Notes

### Resolved Conflicts

- **The `500` snippet is unwrapped.**
  - *Conflict:* Ingestion-api §2.3 and the story's Technical Details write the `500` as `{"code": "internal_error", "request_id": ...}`, with no `error` wrapper.
  - *Resolution:* T009 nests it under `error`: `{"error": {"code": "internal_error", "request_id": …}}`.
  - *Basis:* DAC-E7-5 (epic AC: "Every non-2xx API response MUST carry one envelope shape") and ingestion-api §2.3's normative prose ("Every non-2xx response carries the same body") outrank an illustrative inline snippet. The existing code and `web/src/api/client.ts` (`body.error.request_id`) already use the wrapper. An unwrapped `500` would lose the request id in the interface.
- **DAC-E7-5's four fields versus DAC-E7-7's "only".**
  - *Conflict:* DAC-E7-5 lists code, prose, resource and request id for every non-2xx. DAC-E7-7 says a `500` returns only the code and the request id.
  - *Resolution:* The `500` carries `code` and `request_id` only, and every other non-2xx carries all four.
  - *Basis:* This is a general rule and its stated exception, not a contradiction. DAC-E7-7's "only" is explicit, and the approved story ("A `500` returns `{…}` only") and ingestion-api §2.3/§4 (SEC-ERR-001: "A `500` returns a code and a request identifier only") state the same exception. No artifact places `message` on a `500`. The story's AC-10 restatement ("operation, resource and reason available from the response") does not override it: capability AC-10 concerns run failure detail, the operation is the request the interface itself made, and for a `500` the interface supplies its own reason (owner-web-app §8 item 17).
- **Existing `500` behaviour versus the approved design.**
  - *Conflict:* The current `500` returns `message` and `resource: null`.
  - *Resolution:* T009 removes both.
  - *Basis:* Code is not an approved artifact, and approved DAC-E7-7 and ingestion-api §2.3/§4 govern. This conforms the code to approved behaviour rather than changing it.
- **"Delivers `errors.py` and the middleware" versus existing files.**
  - *Conflict:* The story describes delivering files that CAP-001-E1-S6 already created.
  - *Resolution:* This plan is a delta, and the E1-S6, E2-S3 and E5-S5 contracts are preserved.
  - *Basis:* Code that already exists is the baseline. The approved artifacts do not conflict.
- **Design status label.**
  - *Conflict:* `component-design-ingestion-api.md` has body `**Status:** draft` but frontmatter `status: approved`.
  - *Resolution:* The design is treated as approved.
  - *Basis:* The governed frontmatter wins, and the body label is stale.

### Open Gaps

- **PROVISIONAL — awaiting owner confirmation (2026-10-02) — code and message for framework HTTP errors other than 404 (DAC-E7-5, DAC-E7-S2-1).**
  - *Undefined:* No artifact names the code or message for a Starlette/FastAPI `HTTPException` the routes do not compose themselves (in practice `405 Method Not Allowed`). The only framework code an artifact fixes is `not_found` (ingestion-api §2.5).
  - *Adopted:*
    - `code` is the snake_case of `http.HTTPStatus(status).phrase` (`405` → `method_not_allowed`), or `http_error` for a status outside `HTTPStatus`.
    - `message` is a fixed sentence built from the phrase, never `exc.detail`.
    - `exc.headers` are preserved.
  - *Derivation:*
    - The existing `not_found` is exactly snake_case("Not Found"), so the rule reproduces the one code the design fixes.
    - DAC-E7-S2-1 forbids a code that changes with wording, which rules out deriving it from `detail`.
    - DAC-E7-S2-4 forbids echoing text that may carry a credential, which rules out `detail` in the message.
    - `Allow` on a `405` is HTTP-required and harmless.
  - *Rejected:*
    - One generic `http_error` code for all statuses: the interface could not branch on it.
    - Passing `exc.detail` through: it is wording-dependent and a disclosure risk.
    - A hand-written code table: it is speculative for statuses no route raises.
  - *Absorb in:* `component-design-ingestion-api.md` §2.3 at its next revision.
- **PROVISIONAL — awaiting owner confirmation (2026-10-02) — `resource` on an unmatched `/api` path and on framework HTTP errors (DAC-E7-5).**
  - *Undefined:* DAC-E7-5 requires a resource on every non-2xx response, but no artifact names one for a path that matches no route. Today it is `null`.
  - *Adopted:* `_resource_for_path(request.url.path)`: the mapped resource for a known prefix (e.g. `DELETE /api/instruments/AAPL/x` → `instruments`), otherwise the path's last segment, or `request` for an empty path.
  - *Derivation:*
    - This is the established local precedent. CAP-001-E2-S3's adversarial review IR-001 introduced `_resource_for_path` precisely so that no application-wide handler reports a null or wrong resource.
    - `tests/integration/test_api_instruments.py` and `test_api_settings.py` assert a truthy `resource` on every envelope they see.
  - *Rejected:*
    - Keeping `null`: it violates DAC-E7-5.
    - Returning the full path: it is a path, not a resource name, and inconsistent with the mapped names.
  - *Absorb in:* `component-design-ingestion-api.md` §2.3/§2.5 at its next revision.
  - *Also note:* `_resource_for_path`'s docstring says "first segment" while the code takes the last. This plan keeps the code's behaviour and does not change the docstring outside its task scope.
- **PROVISIONAL — awaiting owner confirmation (2026-10-02) — which part of a Pydantic error the `422` message names (DAC-E7-S2-5, ingestion-api §8 item 12).**
  - *Undefined:* §8 item 12 requires "the field named and no stack trace", but no artifact says how the field is rendered or whether Pydantic's own `msg` is included.
  - *Adopted:* Name the field paths from `loc` only, with the transport prefix (`body`, `query`, `path`, `header`, `cookie`) dropped, de-duplicated and in first-seen order, e.g. "The request did not match the expected shape: `years`." Never include `input`, `ctx` or `msg`.
  - *Derivation:*
    - §8 item 12 asks for the field.
    - DAC-E7-S2-4 forbids anything that can carry a submitted value: `input` and `ctx` always can, and `msg` can for some error types.
    - Keeping `code` fixed means the wording change cannot break a client (DAC-E7-S2-1).
    - No existing test asserts the old sentence.
  - *Rejected:*
    - Including Pydantic's `msg`: it is a disclosure risk and couples prose to library wording.
    - Leaving the generic sentence: it fails §8 item 12.
  - *Absorb in:* `component-design-ingestion-api.md` §2.3 at its next revision.

### Other Notes

- **Why the middleware catches.** Starlette always places `ServerErrorMiddleware`, which runs the `Exception` handler, outside every user middleware. The `@app.middleware("http")` wrapper's `finally` therefore resets `_request_id_var` before the `500` is logged and before any header can be added. Planning reproduced both effects with `TestClient` on 2026-10-02. Catching in the middleware is the smallest change that keeps the id bound for the whole error path. The `extra=` in T009 makes the handler correct on its own, in case the middleware is bypassed.
- **No raw credential handling.** Nothing here reads or compares the credential value. System design constraint 5.12 keeps the application from depending on it. DAC-E7-S2-4 holds structurally: no error message echoes exception text, `HTTPException.detail` or request input. T006 asserts this with a synthetic value.
- **TC-COMP-069 (DAC-E7-4).** It is mapped by no story's AC list. CAP-001-E7-S1 covers the stored-reason half through TC-COMP-082. This plan implements its error-response facet alongside TC-COMP-086, because DAC-E7-S2-4 traces to DAC-E7-4. The rendered-in-browser half belongs to the owner-web-app suite.
- **TC-COMP-010 (AC-10)** is shared with CAP-001-E7-S1, which implements its run-detail facet. This plan implements its error-envelope facet in T002. Both carry the trace comment.
- **Out of scope, observed.** Ingestion-api §7 expects `{"years": 9999}` to return a 422 "naming the 1..50 range". After T010 the generic handler names `years` but not the range. Range-specific copy belongs to CAP-001-E2-S3's settings route and is not planned here.
- **Server access logs.** uvicorn's access-log records are emitted outside the request's `ContextVar` scope and are not `factorflow.api*` records. As in CAP-001-E1-S6's test, DAC-E7-6 is asserted on this component's own loggers.
- **TDD evidence.** The story makes behaviour-changing commits (the `500` body, middleware, handlers), so the T012 evidence task applies. Under a supervised driver that commits once per stage, the DEC-0006 precedent (scoped to E5-S6) applies by analogy only. It is not extended here, and the driver decides commit granularity.
- **Interface consumers.** The screens of CAP-001-E2-S4, CAP-001-E5-S6 and CAP-001-E6-S4, and the future CAP-001-E7-S4 run detail, read errors through `web/src/api/client.ts` `toApiError`. A `500` without `message` falls back to that function's generic sentence and still carries `request_id` and `code`. No frontend change is planned. T011 runs the web suite as a regression check.
- **No migration, no new dependency, no frontend change.** `starlette.exceptions.HTTPException` and `http.HTTPStatus` are already available.
