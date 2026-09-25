---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S5-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-25
docs_synced_review: CAP-001-E5-S5-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-18T15:28:00Z
  source_artifacts:
    - id: CAP-001-E5-S5
      version: "1"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-instrument-list-service
      version: "6"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-system-design
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S5 — Acquisition Run API Endpoints

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S5.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-tasks`
**Date**: 2026-09-18

## Summary

Add the loopback-only HTTP boundary for requesting, listing, inspecting, and cancelling acquisition runs. The API rejects an unset history depth or empty active roster without writing a journal row, queues valid requests without waiting for a provider, exposes journal-backed keyset reads, and translates cancellation outcomes into the shared error envelope. Run detail pages by instrument, so the maximum `limit=500` may return up to 2,000 data-type rows, and both run reads use owner-confirmed versioned URL-safe opaque composite cursors.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-9 | List persisted run outcomes honestly, including non-success terminal states. | T003, T005, T006, T008, T009, T010, T012 |
| AC-10 | Return the affected instrument, data type, outcome, and reason in run detail. | T003, T005, T006, T008, T009, T010, T012 |
| AC-19 | Return `cancelling` for running cancellation and expose terminal/unknown races accurately. | T002, T004, T006, T007, T009, T010, T012 |
| AC-23 | Accept an active-run request as `requested` with `queued_behind`. | T002, T005, T006, T009, T010, T012 |
| AC-24 | Refuse an empty active roster with no run row. | T002, T004, T007, T009, T010, T012 |
| AC-26 | Cancel a queued run directly without changing the active run. | T002, T006, T009, T010, T012 |
| DAC-E5-14 | Give each unmet start precondition its distinct conflict code and write no row. | T002, T004, T007, T009, T012 |
| DAC-E5-15 | Return accepted starts as `requested` with an active run id or `null`. | T002, T005, T006, T009, T010, T012 |
| DAC-E5-S5-1 | Choose `history_depth_not_set` deterministically when both preconditions are absent. | T002, T009, T012 |
| DAC-E5-S5-2 | Return terminal cancellation as `409 run_already_terminal` carrying the persisted state. | T002, T004, T007, T009, T010, T012 |
| DAC-E5-S5-3 | Map unknown cancellation to `404`. | T002, T004, T009, T010, T012 |
| DAC-E5-S5-4 | List runs reverse-chronologically with state filter, bound, and stable cursor. | T003, T005, T006, T008, T009, T010, T012 |
| DAC-E5-S5-5 | Return run detail, persisted counts, and outcome-filtered paged results. | T003, T005, T006, T008, T009, T010, T012 |
| DAC-E5-S5-6 | Prove every start refusal leaves the journal count unchanged. | T002, T009, T012 |

## Phase 1: Setup

**Purpose**: Gate S5 on landed, compatible boundaries without selecting a side in S1’s unresolved migration-ownership contradiction.

- [x] T001 Before changing S5 test or production files, verify that CAP-001-E5-S1’s completed `migrations/0004_runs.sql`, `src/factorflow/runs/states.py`, and migrated run-schema fixture in `tests/conftest.py` have landed; verify CAP-001-E5-S2 exports `request_run`, CAP-001-E5-S3 exports `request_cancel` and its typed unknown/terminal outcomes, CAP-001-E2-S1 exports `active_instrument_ids`, CAP-001-E2-S2 exports `read_history_depth`, and CAP-001-E1-S6 exposes `app.state.db_pool` through `create_app()`. Stop implementation if the required schema artifacts have not landed or if those public seams differ from their approved stories; do not resolve, relocate, or work around the `acquisition_state` ownership contradiction in S5 (prerequisite infrastructure for all criteria).

**Checkpoint**: The migration-backed journal, request/cancel transitions, precondition reads, pool, and test fixture are present; no S5 behavior has been written.

---

## Phase 2: Tests (TDD)

**Purpose**: Under TEST-TDD-001 and TEST-TDD-002, write each behavior test first and execute it to observe RED before its production change.

### Mandatory Component Tests

- [x] T002 Create `tests/integration/test_api_runs.py` with separately named, `postgres`-marked cases carrying `# Implements TC-COMP-019`, `# Implements TC-COMP-023`, `# Implements TC-COMP-024`, `# Implements TC-COMP-026`, `# Implements TC-COMP-249`, `# Implements TC-COMP-250`, `# Implements TC-COMP-279`, `# Implements TC-COMP-280`, `# Implements TC-COMP-281`, and `# Implements TC-COMP-284`: through `TestClient(create_app())`, assert a valid empty-body start returns `202` with a distinct `requested` row and `queued_behind: null`; an existing `running` or `cancelling` run yields a second persisted `requested` row and the active id; unset depth, an empty roster, and a retired-only roster each return the prescribed `409` envelope with singular `resource: "acquisition-run"` while a before/after `acquisition_run` count is unchanged; simultaneous missing preconditions choose owner-confirmed `history_depth_not_set`; queued cancellation returns `cancelled` without changing the active row; running cancellation returns `cancelling`; every terminal state returns `run_already_terminal` carrying that exact state; and an unknown UUID returns `404`. Execute and record RED before T006, T007, T009, or T010 changes these behaviors (depends on T001).
- [x] T003 Add separately named cases to `tests/integration/test_api_runs.py` carrying `# Implements TC-COMP-009`, `# Implements TC-COMP-010`, `# Implements TC-COMP-282`, and `# Implements TC-COMP-283`: seed tied and distinct `requested_at` values across all eight states and mixed `written`, `unchanged`, `not_found`, `failed`, and `skipped` results; assert reverse `(requested_at, run_id)` ordering, state filtering, default `limit=50`, accepted `limit=500`, rejected `limit=501`, malformed or unsupported-version cursor `422` envelopes, and gap/duplicate-free continuation. For detail, assert unknown `404`, owner-confirmed `run`/`counts`/`results` keys, persisted counts, failure-first ordering, outcome filtering, up to 500 instruments and therefore up to 2,000 result rows, all available data-type rows kept together, and instrument-level continuation. Execute and record RED before T006, T008, T009, or T010 changes these behaviors (depends on T001 and T002; edits are serialized because both use the same file).

### Additional Unit Tests

- [x] T004 [P] Add tests in `tests/unit/test_api_errors.py` and `tests/unit/test_api_runs_routes.py` for the approved singular `resource: "acquisition-run"` on every S5 non-2xx branch, the precedence-resolved optional `error.state` only on `run_already_terminal`, the same request id in body and `X-Request-Id`, FastAPI-generated `422` mapping, and exception-to-HTTP mapping without driver text. Execute and record RED before T007, T009, or T010 (depends on T001’s landed-artifact checks only).
- [x] T005 [P] Add model tests in `tests/unit/test_api_models.py` and query-boundary tests in `tests/unit/test_runs_queries.py`: pin the exact eight run-state and five result-outcome literals; owner-confirmed response keys and result fields; run summary timestamps/counts; `queued_behind` UUID-or-null serialization; canonical inclusive `1..500` numeric bounds; per-instrument detail limits with up to `4 * limit` result rows; parameterized SQL rather than interpolated filters; explicit detail not-found; versioned URL-safe opaque composite cursor encoding/validation; malformed and unsupported-version rejection; `limit + 1`; tied-timestamp and failure-first ordering predicates; outcome filtering; and continuation assertions. Execute the model portion to RED before T006 and the query portion to RED before T008; do not cite T007 as either RED target (depends on T001; parallel with T004 and with T002 until T003 begins).

**Checkpoint**: All 14 mapped TC-IDs have concrete trace comments; every model, query, route, and error behavior has an observed RED result before its production change, satisfying TEST-TDD-001 and TEST-TDD-002.

---

## Phase 3: Core Implementation

**Purpose**: Make the observed tests green with minimum typed response/error models and a read-only journal query boundary, per TEST-TDD-003.

- [x] T006 Update `src/factorflow/api/models.py` with typed run-start, run-summary, counts, result-row, list/detail, and cancellation response models using owner-confirmed top-level keys `runs`, `next_cursor`, `run`, `counts`, and `results`, and result fields `instrument_id`, `data_type`, `outcome`, `reason`, `attempts`, and `completed_at`; represent run summaries with `run_id`, `state`, `history_depth_years`, `requested_at`, `started_at`, `ended_at`, `instruments_named`, `instruments_written`, `instruments_failed`, and `failure_reason`; use exact `Literal` sets, UUID/datetime types, and `DEFAULT_PAGE_SIZE`/`MAX_PAGE_SIZE` from `src/factorflow/api/bounds.py`; do not create a start-body model because the approved request body is empty and do not add a credential-shaped field. Implement only enough to make T002/T003/T005 model assertions green (depends on the applicable RED portions of T002, T003, and T005; satisfies AC-9, AC-10, AC-19, AC-23, AC-26, DAC-E5-15, DAC-E5-S5-4, and DAC-E5-S5-5).
- [x] T007 Update `src/factorflow/api/errors.py` to reconcile the stale implementation shape with the approved terminal-cancellation contract: allow `ErrorDetail`/`error_response` to carry `state: str | None`, exclude it when absent so existing envelope bodies retain their established fields, and include it only for `run_already_terminal`; retain singular `resource: "acquisition-run"`, owner-facing message, and request id, and never expose driver detail. Make T002/T004 error assertions green (depends on T002 and T004 RED; satisfies AC-19, AC-24, DAC-E5-14, and DAC-E5-S5-2).
- [x] T008 Create `src/factorflow/runs/queries.py` with frozen typed filter/row/page/detail dataclasses and psycopg-parameterized list/detail functions: list runs by `(requested_at, run_id) DESC` with exact state filtering and `limit + 1`; retrieve one run and its persisted counts; select up to `limit + 1` instrument identities by optional matching outcome, order failure-first then by stable symbol/id, fetch all available data-type rows for the selected page, and return no more than `4 * limit` result rows while preserving instrument boundaries. Encode/decode a versioned URL-safe opaque composite cursor containing every failure-first ordering key and reject malformed or unsupported-version values as a typed query error; perform no lifecycle transition and return an explicit typed not-found result for an unknown run. Make T003/T005 query assertions green (depends on T003 and T005 query RED; satisfies AC-9, AC-10, DAC-E5-S5-4, and DAC-E5-S5-5).

**Checkpoint**: Models and read functions pass focused tests; existing envelope consumers remain compatible; request and cancellation SQL still belongs only to S2/S3’s journal functions.

---

## Phase 4: Integration

**Purpose**: Bind the four approved routes to existing domain seams and the migration-backed store without duplicating lifecycle policy.

- [x] T009 Create `src/factorflow/api/routes/runs.py` with `POST /api/acquisition-runs`, `GET /api/acquisition-runs`, `GET /api/acquisition-runs/{id}`, and `POST /api/acquisition-runs/{id}/cancel`: use FastAPI `Query` numeric bounds imported from `src/factorflow/api/bounds.py`, the owner-confirmed per-instrument detail limit and versioned cursor contract, exact state/outcome literals, `request.app.state.db_pool`, `read_history_depth`, `active_instrument_ids`, `request_run`, `request_cancel`, and `runs.queries`; check history depth before roster; make each accepted mutation exactly one journal call; return `202` without importing a provider or waiting for the runner; use singular `resource: "acquisition-run"`; map malformed or unsupported-version cursors to `422`, unknown reads/cancellations to `404`, and terminal cancellation to `409` through `error_response` with the actual persisted state. Make T002–T005 route assertions green (depends on T002–T008; satisfies all story criteria).
- [x] T010 Update `src/factorflow/api/app.py` to include `factorflow.api.routes.runs.router` before the static mount and map `/api/acquisition-runs` to singular `acquisition-run` in `_VALIDATION_ERROR_RESOURCES`; preserve the existing request-id middleware, exception handlers, pool lifespan, and fallback logic. Make T002–T004 registration/validation assertions green (depends on T002–T004 RED and T009; satisfies AC-9, AC-10, AC-19, AC-23, AC-24, AC-26, DAC-E5-15, and DAC-E5-S5-2 through DAC-E5-S5-5 by making their routes reachable and their validation envelopes consistent).

**Checkpoint**: All four routes pass through `create_app()` against PostgreSQL; valid mutations delegate once, every non-2xx response uses the singular-resource request-id envelope, and no API module imports or calls the provider.

---

## Phase 5: Polish

**Purpose**: Apply the per-commit review gate during implementation, then independently complete mutation/refactor and final repository validation.

- [x] T011 After each T002–T010 task or smallest coherent TDD cycle is ready, stage only that cycle’s diff; dispatch an independent code-review subagent and an independent spec-drift verification subagent against the staged diff; append both verdicts and RED/GREEN execution evidence to `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S5-tdd-evidence.yaml`; do not commit a `REJECTED` or `drift_detected: true` cycle. After the permitted commit, record its hash and `tests_executed: true` before beginning the next cycle, enforcing TEST-TDD-008. This gate is interleaved after every cycle rather than deferred until T010; it is prerequisite quality infrastructure and does not independently claim an AC.
- [x] T012 After T002–T010 are green and their T011 entries are complete, perform TEST-TDD-005 and TEST-TDD-006 mutation checks on precondition precedence, refusal side effects, active queue acceptance, cancellation mappings, terminal-state envelope field, singular resource, list tie-breaker/cursor predicate, per-instrument detail-limit payload cap, outcome filter, failure-first ordering, instrument grouping, numeric bounds, and provider isolation; strengthen tests until every changed-line mutant is killed. Perform behavior-preserving refactoring with green tests under TEST-TDD-004, retain characterization coverage for modified existing error/app behavior under TEST-TDD-007, verify the complete TEST-TDD-001 through TEST-TDD-008 evidence chain, and run every command in the Validation Plan (depends on T002–T011; verifies all story criteria).

**Checkpoint**: Every S5 behavior is green, mutation-sensitive, independently reviewed before its commit, and recorded with complete TEST-TDD-001 through TEST-TDD-008 evidence.

## Dependencies & Execution Order

### Task Dependencies

- T001 is a hard gate on landed S1/S2/S3, E1-S6, and E2-S1/S2 artifacts; it does not resolve or bypass S1’s migration-ownership contradiction.
- T002 and T003 share `tests/integration/test_api_runs.py` and execute serially. T004 and T005 affect separate unit-test files and carry legitimate `[P]` markers.
- T006 depends on the relevant RED assertions in T002, T003, and T005; T007 depends on T002/T004 RED; T008 depends on T003/T005 query RED.
- T009 depends on T002–T008; T010 depends on T002–T004 RED and T009.
- T011 is interleaved after each T002–T010 cycle and must complete before the next implementation cycle begins; T012 depends on completed T002–T010 behavior and all corresponding T011 evidence entries.

### Parallel Opportunities

- T004 and T005 can proceed in parallel with each other; T002 can proceed alongside them until T003 begins editing the shared integration file.
- After their own RED tests, T006, T007, and T008 affect separate production files, but TEST-TDD-008 still serializes commit/evidence cycles.
- T002 and T003 carry no `[P]` marker because they share `tests/integration/test_api_runs.py`; T005’s `[P]` is valid because neither of its files is modified by T002–T004.

### Phase Dependencies

- Phase 1 gates coding on landed prerequisites without claiming that S1’s unresolved ownership contradiction has a decision record.
- Phase 2 precedes each corresponding Phase 3/4 behavior under TEST-TDD-001 and TEST-TDD-002; Phase 3 supplies the types, envelope extension, and reads consumed in Phase 4.
- T011 runs at every commit boundary during Phases 2–4; T012 is the separate final mutation/refactor/validation task.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Full Python tests: `uv run pytest`
- Non-container tests: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Run `uv run pytest -m postgres tests/integration/test_api_runs.py` against PostgreSQL 16 and `uv run pytest tests/unit/test_api_errors.py tests/unit/test_api_runs_routes.py tests/unit/test_api_models.py tests/unit/test_runs_queries.py`; verify all 14 mapped TC-IDs have trace comments and pass.
- Independently unset depth and remove/retire the roster, then combine both conditions; assert exact `409` codes, singular `resource: "acquisition-run"`, request id, and unchanged run count, with owner-confirmed depth-first precedence for the combined case.
- Seed no-active, `running`, and `cancelling` queue scenarios; assert `202 requested`, exact `queued_behind` UUID-or-null, one new row, no active-row mutation, and no provider import/call.
- Exercise queued, running, every terminal, and unknown cancellation; assert `202 cancelled`, `202 cancelling`, `409` with `error.state`, and `404` respectively, with the same request id in header/envelope and no driver detail.
- Seed equal timestamps, all eight states, and more than one page; verify `(requested_at, run_id)` reverse keyset continuation, filters, default `50`, accepted `500`, rejected `501`, the owner-confirmed cursor representation, malformed-cursor `422`, and no duplicates or omissions.
- Validate the owner-confirmed per-instrument detail limit and payload consequence explicitly: seed 501 instruments with four data types each; prove `limit=500` can return up to 2,000 result rows for 500 complete instrument groups, continuation starts at instrument 501, outcome filtering selects instruments consistently, and no instrument is split across pages.
- Verify TEST-TDD-001 through TEST-TDD-008 entries, including observed RED, minimum GREEN, mutation kills, behavior-preserving refactor, characterization coverage, per-cycle test execution, independent verdicts, and commit hashes.
- If the container runtime is unavailable, run and report the non-PostgreSQL subset, but do not represent the partial run as a green full suite.

---

## Notes

### Resolved Conflicts

- **Active-run behavior:** `component-design-ingestion-api.md` §2.2’s request-flow diagram omits the active-roster check, while story AC-23/AC-24 and the same design’s normative §2.4 prose require valid active-run requests to queue and only absent depth or no active instruments to conflict. Acceptance criteria and normative prose govern the incomplete diagram.
- **Queued cancellation:** The generic sentence in `component-design-ingestion-api.md` §2.4 says a run that was “not” running is terminal, but story AC-26, the specifically titled queued-cancellation subsection in the same §2.4, the §11 endpoint row, and the run-journal state machine require `requested -> cancelled`. AC precedence and the more specific queued contract govern; this is not based on document order.
- **Error resource name:** Approved `component-design-ingestion-api.md` §2.3 explicitly shows `resource: "acquisition-run"`. Existing `src/factorflow/api/app.py` and `routes/instruments.py` use plural `instruments` for that different resource, but code precedent cannot override the S5-specific approved API artifact. S5 therefore uses singular `acquisition-run` on route and validation errors. The next revision of `component-design-ingestion-api.md` §2.3 should state whether resource names are generally singular domain concepts or endpoint-specific values so future routes do not have to infer the convention.
- **Terminal cancellation state:** Approved `component-design-ingestion-api.md` §§2.4, 10, and 11 require the `409 run_already_terminal` response to carry the actual state; current `src/factorflow/api/errors.py::ErrorDetail` has only `code`, `message`, `resource`, and `request_id`. The approved API behavior outranks the stale implementation shape, so T007 adds optional `error.state`, omitted on other errors. This is a precedence resolution, not a provisional product decision.
- **Detail pagination and bounds:** `component-design-run-journal.md` §5 already establishes that run detail is paginated per instrument. `component-design-ingestion-api.md` §2.4a and `src/factorflow/api/bounds.py` bind the numeric default to 50 and maximum to 500, with 501 rejected rather than clamped. The residual decision was the response-size consequence of returning up to four data-type rows for each selected instrument; the owner-confirmed resolution is recorded below.

### Open Gaps

- **Owner-confirmed, design revision pending — simultaneous preconditions:** Owner-authored commit `1900ef71fd34f658c9079914cbbaa0259ea1d844` (2026-09-11) confirms `409 history_depth_not_set` before roster inspection. The next revision of `component-design-ingestion-api.md` §2.4 should absorb the precedence.
- **Owner-confirmed, design revision pending — response names:** The same owner-authored commit confirms top-level `runs`, `next_cursor`, `run`, `counts`, and `results`, and result fields `instrument_id`, `data_type`, `outcome`, `reason`, `attempts`, and `completed_at`. The next revision of `component-design-ingestion-api.md` §11 should publish the complete schemas.
- **Owner-confirmed (attended 2026-09-17), design revision pending — detail payload consequence:** `component-design-run-journal.md` §5 already establishes per-instrument detail pagination, and `ux-design.md` §1.5 establishes four expandable data types per instrument. The owner confirmed that detail `limit` counts instruments and that one page may therefore contain up to `4 * limit` data-type rows: at the approved maximum, up to 500 instruments and 2,000 result rows. The next revision of `component-design-ingestion-api.md` §§2.4a and 11 must state the per-instrument unit and payload consequence explicitly.
- **Owner-confirmed (attended 2026-09-17), design revision pending — composite cursor representation:** No approved artifact fixed serialization for the composite keys needed to avoid tied-timestamp and failure-first pagination gaps. The owner confirmed a versioned URL-safe opaque cursor containing every failure-first ordering key; clients treat it as opaque, and malformed or unsupported-version values return the shared `422` envelope. The next revision of `component-design-ingestion-api.md` §11 must define the cursor encoding and invalid-version behavior.

### Other Notes

- **Implementation prerequisite — unresolved ownership, schema-artifact gate only:** `CAP-001-E5-S1.md` assigns `acquisition_state` to `migrations/0004_runs.sql`, while `component-design-market-data-store.md` §2.3 places it in `migrations/0003_coverage.sql`; no traceable record under `projects/factorflow-v2/decisions/` resolves the contradiction. T001 requires the completed migrations/fixture to have landed but does not select an owner, edit either migration, or claim the contradiction is resolved.
- CAP-001-E5-S2 and CAP-001-E5-S3 own request/claim and cancellation transitions. S5 owns only the HTTP adapter and read path and must not duplicate transition SQL in `runs.py` or `queries.py`.
- The endpoint remains loopback-only and unauthenticated by approved design. It adds no credential/session field, provider client import, synchronous provider call, or wait for ingestion.
- PostgreSQL query values remain bound parameters. Dynamic ordering is fixed code, never caller-provided SQL.
