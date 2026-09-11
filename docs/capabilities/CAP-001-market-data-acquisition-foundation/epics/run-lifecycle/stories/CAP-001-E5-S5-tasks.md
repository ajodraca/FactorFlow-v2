---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S5-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-11
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-11T23:21:28Z
  source_artifacts:
    - id: CAP-001-E5-S5
      version: "1"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "approved"
    - id: CAP-001-system-design
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S5 — Acquisition Run API Endpoints

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S5.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-tasks`
**Date**: 2026-09-11

## Summary

Add the loopback-only HTTP boundary for requesting, listing, inspecting, and cancelling acquisition runs. The route must reject an unset history depth or empty active roster without a journal row, enqueue valid requests without waiting for a provider, expose journal-backed keyset reads, and preserve the journal's state-dependent cancellation result in the shared API error envelope.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-9 | List recorded run outcomes without representing a non-success outcome as success. | T002, T004, T006 |
| AC-10 | Return per-instrument, per-data-type result and reason in run detail. | T003, T004, T006 |
| AC-19 | Return `cancelling` for running cancellation and surface terminal/unknown results. | T002, T005, T006 |
| AC-23 | Accept a request during an active run as `requested` with `queued_behind`. | T002, T005, T006 |
| AC-24 | Refuse an empty active roster with no run row. | T002, T005, T006 |
| AC-26 | Cancel a queued run directly without changing the active run. | T002, T005, T006 |
| DAC-E5-14 | Refuse each unmet start precondition with its distinct conflict code and no row. | T002, T005, T006 |
| DAC-E5-15 | Return accepted starts as `requested` with the active run or `null`. | T002, T005, T006 |
| DAC-E5-S5-1 | Make simultaneous unmet preconditions deterministic. | T002, T005, T006 |
| DAC-E5-S5-2 | Return terminal cancellation as `409 run_already_terminal` with actual state. | T002, T005, T006 |
| DAC-E5-S5-3 | Map unknown cancellation to `404`. | T002, T005, T006 |
| DAC-E5-S5-4 | List runs reverse-chronologically with state filter, limit, and cursor. | T003, T004, T006 |
| DAC-E5-S5-5 | Return detail counts and outcome-filtered, paged results. | T003, T004, T006 |
| DAC-E5-S5-6 | Assert every start refusal leaves the journal count unchanged. | T002, T005, T006 |

## Phase 1: Setup

**Purpose**: Define the API and journal read types at the existing module boundaries before route behavior is implemented.

- [ ] T001 Update `src/factorflow/api/models.py` with Pydantic request/query and response models for acquisition-run start, list, detail, result rows, counts, and cancellation; import `DEFAULT_PAGE_SIZE` and `MAX_PAGE_SIZE` from `src/factorflow/api/bounds.py` rather than declaring bounds locally (prerequisite infrastructure for AC-9, AC-10, AC-19, AC-23, AC-24, and AC-26).

**Checkpoint**: The run routes have typed models using the already-approved pagination bounds, with no credential-bearing field.

---

## Phase 2: Tests (TDD)

**Purpose**: Write database-backed route tests that pin response codes, journal side effects, filtering, pagination, and the shared error envelope before the routes exist.

### Mandatory Component Tests

- [ ] T002 Create `tests/integration/test_api_runs.py` with `# Implements TC-COMP-019`, `# Implements TC-COMP-023`, `# Implements TC-COMP-024`, `# Implements TC-COMP-026`, `# Implements TC-COMP-249`, `# Implements TC-COMP-250`, `# Implements TC-COMP-279`, `# Implements TC-COMP-280`, `# Implements TC-COMP-281`, and `# Implements TC-COMP-284`: use the existing `TestClient`/PostgreSQL fixture pattern to assert a valid start is `202 requested` with `queued_behind`, an active run queues the next request, absent depth and an empty or retired-only roster each return their prescribed `409` code with an unchanged `acquisition_run` count, both missing preconditions consistently choose the precedence pinned in this plan, queued cancellation returns `cancelled` without changing the active row, running cancellation returns `cancelling`, terminal cancellation returns the actual terminal state in `run_already_terminal`, and an unknown id returns `404`.
- [ ] T003 Add `# Implements TC-COMP-009`, `# Implements TC-COMP-010`, `# Implements TC-COMP-282`, and `# Implements TC-COMP-283` tests in `tests/integration/test_api_runs.py`: seed journal rows and `run_instrument_result` rows through the run-journal/schema seams, then assert reverse-chronological list ordering, state filtering, default/max/over-max `limit` behavior, non-duplicating cursor continuation, detail counts, outcome filtering, result pagination, per-data-type reason visibility, and `404` for an unknown detail id.

### Additional Unit Tests

- [ ] T004 Add focused route/model tests in `tests/unit/test_api_models.py` and `tests/unit/test_api_runs_query_mapping.py` for accepted run-state/outcome query literals, the default and inclusive maximum page sizes, cursor/query mapping into the journal read filters, and response-model serialization of UUIDs, timestamps, counts, result outcomes, and `queued_behind` `null`.

**Checkpoint**: Tests are marked `postgres` where they require the run schema, contain their TC traceability comments, and are RED until the journal read boundary and routes are implemented.

---

## Phase 3: Core Implementation

**Purpose**: Implement the journal read boundary and thin HTTP routes without duplicating state transitions or database policy in the API layer.

- [ ] T005 Create `src/factorflow/runs/queries.py` and update `src/factorflow/runs/journal.py` only for exported exceptions/types needed by the boundary: define typed, psycopg-parameterized list and detail query functions over `acquisition_run` and `run_instrument_result`, using reverse `requested_at` keyset ordering, state/outcome filters, and `limit + 1` pagination; return an explicit not-found result for an unknown run and leave request/cancel transitions owned by the existing `request_run` and `request_cancel` functions (depends on CAP-001-E5-S1, CAP-001-E5-S2, and CAP-001-E5-S3).
- [ ] T006 Create `src/factorflow/api/routes/runs.py`: implement the four declared `/api/acquisition-runs` routes using the connection pool, `read_history_depth`, `active_instrument_ids`, `request_run`, `request_cancel`, and `runs.queries`; check history depth before the active roster so two absent preconditions deterministically return `history_depth_not_set`; map journal exceptions to the established `error_response` envelope, return only the approved success states, and never call a provider or wait for a runner (depends on T001–T005).
- [ ] T007 Update `src/factorflow/api/app.py` to include `src/factorflow/api/routes/runs.py` and extend the existing validation-error resource mapping so FastAPI-generated `422` responses for these routes use `resource: "acquisition-runs"` (depends on T006).

**Checkpoint**: Valid starts and state changes pass through the journal exactly once; every non-2xx route outcome retains the existing envelope and request id.

---

## Phase 4: Integration

**Purpose**: Execute the route tests against the real migration-backed schema and verify the public contract through FastAPI.

- [ ] T008 Update `tests/integration/test_api_runs.py` to consume the completed run-schema fixture from `tests/conftest.py`, keep journal setup behind its public functions rather than raw transition SQL where possible, and run the complete start/list/detail/cancel scenarios through `create_app()` (depends on T002, T003, and T005–T007).

**Checkpoint**: The external HTTP contract is proven against a disposable PostgreSQL database and its persisted journal/result rows.

---

## Phase 5: Polish

**Purpose**: Strengthen behavior tests and perform the repository validation required for completion.

- [ ] T009 Strengthen `tests/integration/test_api_runs.py` and `tests/unit/test_api_runs_query_mapping.py` after manually mutating the start-precondition order, active-run queue response, reverse ordering, state/outcome predicates, cursor predicate, terminal-error mapping, and maximum page bound; retain tests that kill each mutation and record the required RED→GREEN→MUTATE→STRENGTHEN evidence (depends on T008).

**Checkpoint**: Tests fail if a refused request writes a row, an active run causes rejection, list/detail pagination duplicates data, or cancellation misreports an unknown or terminal run.

## Dependencies & Execution Order

### Task Dependencies

- T001 can be written immediately, but its model fields must use the confirmed response-shape decision in Open Gaps.
- T002–T004 depend on the run schema and may be authored before production implementation; T002 and T003 share `tests/integration/test_api_runs.py` and must not be edited concurrently.
- T005 depends on CAP-001-E5-S1's run schema, CAP-001-E5-S2's request interface, and CAP-001-E5-S3's cancellation interface.
- T006 depends on T001–T005; T007 depends on T006; T008 depends on T002, T003, and T005–T007; T009 depends on T008.

### Parallel Opportunities

- T001 and T004 can proceed in parallel because they modify different test/model files.
- T002 and T003 may be designed in parallel but must be serialized when editing `tests/integration/test_api_runs.py`.

### Phase Dependencies

- Phase 2 precedes Phase 3 under TDD.
- The journal schema and S2/S3 interfaces are external prerequisites for the core implementation.
- Phase 4 requires the application registration from T007; Phase 5 follows the full integration path.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Targeted database tests: `uv run pytest -m postgres tests/integration/test_api_runs.py`
- Focused unit tests: `uv run pytest tests/unit/test_api_models.py tests/unit/test_api_runs_query_mapping.py`
- Full Python tests: `uv run pytest`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Apply the completed CAP-001-E5-S1 schema to a fresh PostgreSQL test container, set/unset history depth and active instruments independently, and prove every `409` leaves the run count unchanged.
- Seed requested, running, and terminal rows to verify `202` queueing/cancellation states, terminal-state conflict payloads, and unknown-id `404` handling all use the common error envelope with a request id.
- Seed ordered run timestamps and result rows to verify reverse keyset pagination, filters, maximum `limit=500`, rejection of `limit=501`, result paging, counts, and per-data-type failure reasons.
- Record per-cycle RED, GREEN, mutation, strengthening, and refactor evidence required by TEST-TDD-001 through TEST-TDD-008; if a container runtime is unavailable, report PostgreSQL tests as excluded rather than green.

---

## Notes

### Resolved Conflicts

- The ingestion API design's normative request-flow prose and AC-24 govern: active runs are queued, while only missing history depth or an empty active roster are refused. No source conflict remains after the resolved Open Question in `component-design-ingestion-api.md` section 14.
- The approved bounds in `component-design-ingestion-api.md` section 2.4a govern list and detail pagination: default `50`, maximum `500`; no route-local value is introduced.

### Open Gaps

- **PROVISIONAL — awaiting owner confirmation (2026-09-11):** When both start preconditions are absent, return `409 history_depth_not_set` before checking the active roster. Derivation: the request-flow sequence in `component-design-ingestion-api.md` section 2.2 checks depth before entering the journal path, and the story requires a deterministic single refusal but names no precedence. Record this decision in the next revision of `component-design-ingestion-api.md` section 2.4.
- **PROVISIONAL — awaiting owner confirmation (2026-09-11):** Use the response field names `runs`, `next_cursor`, `run`, `counts`, and `results`; represent a run with the persisted `acquisition_run` columns needed by the story and a result with `instrument_id`, `data_type`, `outcome`, `reason`, `attempts`, and `completed_at`. Derivation: existing API responses use plural collection keys plus `next_cursor` (`InstrumentListResponse`), the storage schema defines those persisted columns, and the design fixes required content but not JSON key names or the exact count shape. Record the final public response schema in the next revision of `component-design-ingestion-api.md` section 11.

### Other Notes

- CAP-001-E5-S1 remains a hard implementation prerequisite. Its plan stopped on the unresolved contradiction over the migration that owns `acquisition_state`; this plan consumes the eventual completed run schema and does not select a migration owner.
- CAP-001-E5-S2 and CAP-001-E5-S3 own request/claim and cancellation transitions. This story is the API adapter and read-path owner; it must not recreate those SQL transitions in `runs.py`.
- The endpoint is loopback-only and unauthenticated by approved design. It must not add a credential, session, provider client import, or a synchronous provider call.
