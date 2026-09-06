---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-06
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T21:55:44Z
  source_artifacts:
    - id: CAP-001-E2-S3
      version: "1"
    - id: CAP-001-component-design-ingestion-api
      version: "approved"
    - id: CAP-001-E2-S1
      version: "1"
    - id: CAP-001-E2-S2
      version: "1"
    - id: CAP-001-E1-S6
      version: "1"
    - id: tech-stack
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E2-S3 — Instrument and Settings API Endpoints

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-epics`
**Date**: 2026-09-06

## Summary

This story delivers `src/factorflow/api/routes/instruments.py` and `src/factorflow/api/routes/settings.py`, the thin HTTP surface over CAP-001-E2-S1's `service.py` and CAP-001-E2-S2's `settings.py`. No domain logic is duplicated here: each route validates its request with a Pydantic model, delegates to the domain function, and shapes the response per the API contract. This story also introduces `src/factorflow/api/bounds.py`, the canonical request-bound constants (`MAX_HISTORY_DEPTH_YEARS`, `MIN_HISTORY_DEPTH_YEARS`, `MAX_SYMBOLS_PER_REQUEST`, `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`) that this story is the first to need and that later route stories (runs, coverage) will import rather than redeclare.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-1 | Owner adds, lists, or retires instruments with no config file or direct store access | T007, T008, T009, T015, T016, T017 |
| DAC-E2-4 | `POST /api/instruments` returns `201`/`409`/`422` per the batch outcome | T007, T015 |
| DAC-E2-5 | `DELETE /api/instruments/{symbol}` returns `404` unknown / `409` already retired | T008, T016 |
| DAC-E2-8 | `PUT /api/settings/history-depth` returns `422` for a non-positive-integer value | T010, T018 |
| DAC-E2-10 | `GET /api/instruments` supports prefix filter, lifecycle filter, limit, cursor, and reports counts | T009, T017 |
| DAC-E2-S3-1 | `201` body reports `added`, `reactivated`, `rejected` separately, each rejection carrying a reason | T007, T015 |
| DAC-E2-S3-2 | `GET /api/settings/history-depth` with no depth set responds with `years: null` | T011, T019 |
| DAC-E2-S3-3 | Every non-2xx response from these routes carries the shared error envelope | T012, T020 |
| DAC-E2-S3-4 | A `limit` beyond the canonical bound is rejected with `422`, never clamped | T006, T013, T021 |
| DAC-E2-S3-5 | A cursor from a previous page continues to the next page with stable ordering | T014, T022 |

## Phase 1: Setup

**Purpose**: Introduce the canonical request-bound constants this story is the first to need, and the Pydantic request/response models for both route files.

- [ ] T001 Create `src/factorflow/api/bounds.py` defining the five request-bound constants from `component-design-ingestion-api.md` section 2.4a as module-level literals: `MAX_HISTORY_DEPTH_YEARS = 50`, `MIN_HISTORY_DEPTH_YEARS = 1`, `DEFAULT_PAGE_SIZE = 50`, `MAX_PAGE_SIZE = 500`, `MAX_SYMBOLS_PER_REQUEST = 1000` — each with the one-line rationale from the design table as a comment, since later stories (runs, coverage) will import from here rather than redeclare
- [ ] T002 [P] Create `src/factorflow/api/routes/__init__.py` if it does not already exist (CAP-001-E1-S6 may have created it for `health.py`); confirm rather than duplicate
- [ ] T003 [P] Add to `src/factorflow/api/models.py` (created by CAP-001-E1-S6 for `HealthResponse`) the request/response models this story needs: `AddInstrumentsRequest` (`symbols: list[str]`, capped at `MAX_SYMBOLS_PER_REQUEST` via a Pydantic field validator), `SymbolOutcomeResponse` (`input_symbol`, `normalised_symbol`, `disposition`, `reason: str | None`), `AddInstrumentsResponse` (`added`, `reactivated`, `rejected: list[SymbolOutcomeResponse]`), `RetireInstrumentResponse` (`lifecycle: Literal["retired"]`, `retired_at`), `InstrumentListResponse` (instrument rows, `active_count`, `retired_count`, `next_cursor`), `HistoryDepthResponse` (`years: int | None`, `updated_at: datetime | None`), `SetHistoryDepthRequest` (`years: int`)
- [ ] T004 [P] Confirm CAP-001-E2-S1's `src/factorflow/instruments/service.py` (`add_symbols`, `retire_symbol`, `list_instruments`, `InstrumentFilters`, `InstrumentPage`, `InstrumentNotFound`, `AlreadyRetired`) and CAP-001-E2-S2's `src/factorflow/instruments/settings.py` (`read_history_depth`, `write_history_depth`) are present and importable on this branch; block on either if not yet landed, rather than duplicating their contracts here
- [ ] T005 [P] Confirm CAP-001-E1-S6's `src/factorflow/api/app.py` application factory exists and is importable, since both route modules register on it; block if not yet landed

**Checkpoint**: `src/factorflow/api/bounds.py` exists with the five constants; `models.py` exports the new request/response models; `uv run mypy src` type-checks them against nothing yet importing `service.py`/`settings.py` incorrectly.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests for the mandatory component TC-IDs mapped from the coverage matrix, using FastAPI's `TestClient`, before `instruments.py` and `settings.py` route modules exist. Every non-2xx assertion in this phase depends on CAP-001-E7-S2's error envelope and exception handlers being registered on the application factory; if E7-S2 has not landed, these tests should assert the concrete status code and body shape from this story's own API Contract table and be revisited once E7-S2's handlers are wired in, rather than importing anything from `errors.py` that does not yet exist.

### Mandatory Component Tests

- [ ] T006 [P] Implement TC-COMP-102 (`POST /api/instruments` returns `201` at least one added/reactivated, `409` all duplicate, `422` all malformed) in `tests/integration/test_api_instruments.py::test_add_status_codes` — three cases: a batch with at least one valid symbol, a batch of only duplicates-of-active, a batch of only malformed symbols
- [ ] T007 [P] Implement TC-COMP-123 (`201` body reports `added`, `reactivated`, `rejected` separately, each rejection carrying a reason) in `tests/integration/test_api_instruments.py::test_add_mixed_batch_response_shape` — a batch of one new symbol, one duplicate-of-retired (reactivation), one duplicate-of-active, and one malformed symbol; assert all four dispositions appear in the correct response group and the malformed/duplicate entries carry a `reason`
- [ ] T008 [P] Implement TC-COMP-103 (`DELETE /api/instruments/{symbol}` returns `404` unknown, `409` already retired) in `tests/integration/test_api_instruments.py::test_retire_status_codes` — call `DELETE` on a symbol never added (expect `404`), then on a symbol already retired (expect `409`), and separately on an active symbol (expect `200` with `lifecycle: "retired"` and `retired_at`)
- [ ] T009 [P] Implement TC-COMP-108 (`GET /api/instruments` supports prefix filter, lifecycle filter, limit, cursor, reports counts) in `tests/integration/test_api_instruments.py::test_list_filters_and_counts` — seed a mix of active/retired instruments with varied symbols, assert `symbol` prefix filtering, `lifecycle` filtering, and that `active_count`/`retired_count` in the response match the seeded totals
- [ ] T010 [P] Implement TC-COMP-106 (`PUT /api/settings/history-depth` rejects a non-positive-integer value with `422`) in `tests/integration/test_api_settings.py::test_put_depth_rejects_invalid` — assert `422` for `0`, a negative integer, a non-integer (string or float), and a value above `MAX_HISTORY_DEPTH_YEARS` (per the design's 1..50 range, section 2.4a — see Notes on this bound's placement)
- [ ] T011 [P] Implement TC-COMP-124 (`GET /api/settings/history-depth` with no depth set responds `years: null`) in `tests/integration/test_api_settings.py::test_get_depth_when_unset` — call `GET` before any `PUT`, assert the response is `200` with `"years": null`, asserted with the JSON `null` literal rather than a falsy check
- [ ] T012 [P] Implement TC-COMP-125 (every non-2xx response from these routes carries the shared error envelope) in `tests/integration/test_api_instruments.py::test_error_envelope_shape` and a matching case in `tests/integration/test_api_settings.py` — for one `404`/`409` case from each route, assert the body matches `{"error": {"code", "message", "resource", "request_id"}}` with all four fields present and non-empty; if CAP-001-E7-S2 has not landed, mark these `xfail` with a comment naming the dependency rather than skip silently
- [ ] T013 [P] Implement TC-COMP-126 (a `limit` beyond the canonical bound is rejected `422`, not clamped) in `tests/integration/test_api_instruments.py::test_list_limit_over_bound_rejected` — call `GET /api/instruments?limit=501` (one above `MAX_PAGE_SIZE`), assert `422` and that the response does not silently return 500 rows
- [ ] T014 [P] Implement TC-COMP-127 (a cursor from a previous page continues to the next page with stable ordering) in `tests/integration/test_api_instruments.py::test_list_cursor_pagination` — seed enough instruments to span two pages at a small `limit`, request the first page, pass its `next_cursor` to a second request, and assert the combined pages contain every seeded instrument exactly once in stable `symbol` order

### Additional Unit Tests

- [ ] T015 [P] Write a unit test asserting `AddInstrumentsRequest` rejects a `symbols` array longer than `MAX_SYMBOLS_PER_REQUEST` with a Pydantic validation error, in `tests/unit/test_api_models.py` — this is request-shape validation, distinct from T006's end-to-end status-code assertion
- [ ] T016 [P] Write a unit test asserting the `instruments.py` route module maps `InstrumentNotFound` to `404` and `AlreadyRetired` to `409` via explicit exception handling (not a bare re-raise), in `tests/unit/test_api_instruments_error_mapping.py`
- [ ] T017 [P] Write a unit test asserting `list_instruments`'s `InstrumentFilters` is constructed from the query parameters with `DEFAULT_PAGE_SIZE` applied when `limit` is omitted, in `tests/unit/test_api_instruments_query_mapping.py`
- [ ] T018 [P] Write a unit test asserting `SetHistoryDepthRequest`'s Pydantic field validation rejects `0`, a negative integer, and a value above `MAX_HISTORY_DEPTH_YEARS` at the model layer, before the route ever calls `write_history_depth`, in `tests/unit/test_api_models.py`
- [ ] T019 [P] Write a unit test asserting `HistoryDepthResponse` serializes an absent depth as JSON `null` for `years`, not an omitted key, in `tests/unit/test_api_models.py`

**Checkpoint**: All tests above written and failing — `src/factorflow/api/routes/instruments.py` and `settings.py` do not yet exist. `uv run pytest -m postgres` fails with import or `404` (route-not-found) errors; `uv run pytest -m 'not postgres'` fails on T015, T017, T018, T019.

---

## Phase 3: Core Implementation

**Purpose**: Implement both route modules, delegating to CAP-001-E2-S1/E2-S2's domain logic and shaping responses per the API contract.

- [ ] T020 Create `src/factorflow/api/routes/instruments.py` with a FastAPI `APIRouter` exposing `GET /api/instruments`, `POST /api/instruments`, and `DELETE /api/instruments/{symbol}`, per `component-design-ingestion-api.md` sections 2.4 and 11:
  - `POST`: validate `AddInstrumentsRequest` (T003), call `add_symbols` (CAP-001-E2-S1), classify the returned `SymbolOutcome` list into `added`/`reactivated`/`rejected` groups, and return `201` if `added` or `reactivated` is non-empty, `409` if every outcome is `duplicate_active`, `422` if every outcome is `malformed`
  - `DELETE`: call `retire_symbol` (CAP-001-E2-S1), catching `InstrumentNotFound` → `404` and `AlreadyRetired` → `409`, returning `200` with `lifecycle` and `retired_at` on success
  - `GET`: build `InstrumentFilters` from query parameters (`symbol` prefix, `lifecycle`, `limit` defaulted to `DEFAULT_PAGE_SIZE` and rejected above `MAX_PAGE_SIZE` via a Pydantic query-param validator, `cursor`), call `list_instruments` (CAP-001-E2-S1), and shape the `InstrumentPage` into `InstrumentListResponse`
- [ ] T021 Create `src/factorflow/api/routes/settings.py` with a FastAPI `APIRouter` exposing `GET /api/settings/history-depth` and `PUT /api/settings/history-depth`, per section 11:
  - `GET`: call `read_history_depth` (CAP-001-E2-S2), return `HistoryDepthResponse` with `years: null` when the result is `None`
  - `PUT`: validate `SetHistoryDepthRequest` (T003) with a Pydantic field validator enforcing `MIN_HISTORY_DEPTH_YEARS <= years <= MAX_HISTORY_DEPTH_YEARS` (returns `422` automatically on violation), then call `write_history_depth` (CAP-001-E2-S2) and return the new value with `updated_at`
- [ ] T022 Register both routers on the application factory in `src/factorflow/api/app.py` (CAP-001-E1-S6), alongside the existing health router

**Checkpoint**: `instruments.py` and `settings.py` exist and are mounted on the app. T015, T017, T018, T019 pass in isolation.

---

## Phase 4: Integration

**Purpose**: Prove both route modules work end to end against a real PostgreSQL 16 instance and the full application factory, closing out the mandatory component tests.

- [ ] T023 Run the full `tests/integration/test_api_instruments.py` and `tests/integration/test_api_settings.py` suites from Phase 2 against the finished implementation, and fix any mismatch between the response shape produced and the API contract's exact examples in the story's Technical Details section
- [ ] T024 If CAP-001-E7-S2 has landed by this point, remove the `xfail` markers from T012's error-envelope tests and confirm they pass against the real exception handlers; if not, leave the `xfail` markers in place and note the follow-up in this file's Notes section (see below)

**Checkpoint**: `uv run pytest -m postgres` passes in full (accounting for any `xfail` on the error-envelope assertions pending CAP-001-E7-S2). All mandatory TC-IDs mapped to this story (TC-COMP-102, 103, 106, 108, 123, 124, 126, 127) are green; TC-COMP-125 is green only once CAP-001-E7-S2 lands.

---

## Phase 5: Polish

**Purpose**: Confirm no domain logic leaked into the route layer and the full validation suite is green.

- [ ] T025 Review `instruments.py` and `settings.py` for any business rule that duplicates rather than delegates to CAP-001-E2-S1/E2-S2 (e.g., re-implementing symbol normalisation, re-checking duplicate status, or re-deriving the reactivation transition instead of trusting `add_symbols`'s returned `Disposition`) — per the story's own framing, this is a thin HTTP surface and should contain no domain logic
- [ ] T026 Run the complete validation plan (below) and confirm every command passes

**Checkpoint**: All acceptance criteria this story owns are satisfied (with TC-COMP-125 tracked as a known follow-up if CAP-001-E7-S2 is still pending); `uv run ruff format --check .`, `uv run ruff check .`, `uv run mypy src`, and `uv run pytest -m postgres` all pass.

---

## Dependencies & Execution Order

### Task Dependencies
- T001 has no dependencies.
- T002 depends on CAP-001-E1-S6 having created `src/factorflow/api/routes/__init__.py`, or creates it if absent.
- T003 depends on T001 (references the bound constants in field validators) and on CAP-001-E1-S6's `models.py` already existing.
- T004, T005 are blocking checks, not implementation tasks.
- T006–T014 (Phase 2, mandatory tests) depend on T001–T005; independent of each other, can run in parallel.
- T015–T019 (Phase 2, additional tests) depend on T003; independent of each other, can run in parallel.
- T020 depends on T001, T003, T004 (calls into `service.py`).
- T021 depends on T001, T003, T004 (calls into `settings.py`).
- T022 depends on T020, T021, and T005 (`app.py` existing).
- T023 depends on T020, T021, T022 (full implementation) to make Phase 2's tests pass.
- T024 depends on T023 and on CAP-001-E7-S2's landing status.
- T025, T026 depend on T023.

### Parallel Opportunities
- Phase 1: T002, T003 in parallel after T001; T004, T005 in parallel with everything else in Phase 1.
- Phase 2: T006 through T019 all in parallel (distinct test functions, mostly within two shared files).
- Phase 3: T020 and T021 can be implemented in parallel (distinct route files, no shared state beyond `bounds.py` and `models.py`, both already complete from Phase 1).

---

## Validation Plan

### Constitution-Defined Commands
- Install: `uv sync --all-extras`
- Test (full): `uv run pytest`
- Test (no container runtime): `uv run pytest -m 'not postgres'`
- Test (this story, container required): `uv run pytest -m postgres`
- Lint: `uv run ruff check .`
- Format check: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- AC-1 / DAC-E2-10: `GET /api/instruments` supports a symbol prefix filter, a lifecycle filter, a `limit`, and a cursor, and reports `active_count`/`retired_count` accurately.
- DAC-E2-4 / DAC-E2-S3-1: `POST /api/instruments` returns `201` with `added`/`reactivated`/`rejected` populated correctly for a mixed batch; `409` when every symbol is a duplicate of an active instrument; `422` when every symbol is malformed.
- DAC-E2-5: `DELETE /api/instruments/{symbol}` returns `404` for an unknown symbol, `409` for one already retired, and `200` with `lifecycle`/`retired_at` otherwise.
- DAC-E2-8 / DAC-E2-S3-2: `PUT /api/settings/history-depth` returns `422` for any value that is not a positive integer in `1..50`; `GET` returns `years: null` before any value is set.
- DAC-E2-S3-3: every non-2xx response from `instruments.py` and `settings.py` carries the shared error envelope — tracked with `xfail` pending CAP-001-E7-S2 if that story has not landed (see Notes).
- DAC-E2-S3-4: `limit` above `MAX_PAGE_SIZE` (500) is rejected with `422`, never silently clamped.
- DAC-E2-S3-5: a `next_cursor` from one page reliably continues to the next with no duplicate or skipped instrument.

---

## Notes

- **This story's error-envelope requirement (DAC-E2-S3-3) depends on CAP-001-E7-S2, which is `status: todo` and unplanned as of this writing.** CAP-001-E1-S6's already-written task plan (`CAP-001-E1-S6-tasks.md`) built `src/factorflow/api/errors.py` and request-id middleware itself (its T003, T020), even though E7-S2's own Description states it is the story that delivers exactly those two things, and this story's own Dependencies section names E7-S2 (not E1-S6) as the owner. Per the user's direction, this plan treats E7-S2 as the intended owner and does **not** assume `errors.py` exists yet: T012's error-envelope tests are written to `xfail` with a named reason if the envelope isn't wired in when this story is implemented, rather than blocking this story entirely or importing from a module this story does not own. **This conflict should be resolved before CAP-001-E1-S6 is implemented** — likely by trimming T003/T020 from `CAP-001-E1-S6-tasks.md` so `errors.py` and the middleware are built exactly once, by CAP-001-E7-S2, and E1-S6's application factory only registers handlers CAP-001-E7-S2 supplies.
- **`api/bounds.py` has no prior owner.** No story text before this one names it as a deliverable, even though `component-design-ingestion-api.md` section 2.4a describes it as already-decided, canonical, and shared across every route story (instruments, settings, runs, coverage). This plan creates it here (T001) since this is the first story whose acceptance criteria actually require the bound values (`MAX_HISTORY_DEPTH_YEARS`, `MAX_SYMBOLS_PER_REQUEST`, `MAX_PAGE_SIZE`, `DEFAULT_PAGE_SIZE`). Later stories for `runs.py` and `coverage.py` should import from this file rather than redeclare any of these constants.
- **The 1..50 history-depth bound lives at the API layer, not in `instrument-list-service`.** CAP-001-E2-S2's task plan (already committed) deliberately left `write_history_depth` uncapped, per that story's own DAC-E2-S2-5 ("this module records it unchanged and enforces no cap"). This story's `PUT /api/settings/history-depth` (T021) is where `MAX_HISTORY_DEPTH_YEARS` is actually enforced, via Pydantic validation before `write_history_depth` is ever called — this resolves the ambiguity flagged in CAP-001-E2-S2-tasks.md's Notes section: the design's "1..50" bound and the story's "no cap" instruction are both correct, just at different layers.
- No component test spec entry for TC-COMP-102–127 in this story provides scenario-level detail beyond a restated Given/When/Then; the concrete test scenarios in Phase 2 are derived from the story's own API Contract table and Testing section.
