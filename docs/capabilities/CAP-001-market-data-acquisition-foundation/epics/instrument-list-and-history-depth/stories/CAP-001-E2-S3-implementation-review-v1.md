---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-10
updated: 2026-09-10
story_id: "CAP-001-E2-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-10T00:00:00Z"
reviewed_head: "aa4a40a9c0de2008cc5049a04d8f100ae919bd84"
review_base: "7ed6d7c114ddd4d5fd1415e7c7602a2808b2ba5d"
reviewed_state_revision: "sha256:ef874428f823e594cd54684665fcb8a44fb5136485545e5f90a33c6076afcbeb"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E2-S3
    artifact_version: 1
    content_revision: sha256:905b7a715042d793a9575fe4d871fd57ace037c1436654f37170f12507fd58fb
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-10T00:00:00Z
  source_artifacts:
    - id: CAP-001-E2-S3
      version: "1"
    - id: CAP-001-E2-S3-tasks
      version: "1"
    - id: CAP-001-component-design-ingestion-api
      version: "approved"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E2-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 3 |
| Low findings | 1 |
| Acceptance criteria | 9/10 satisfied |
| Planned tasks | 25/26 verified |
| Required validation | 5/5 passed |

The implementation is substantially correct and every required validation command
passes independently (`ruff check`, `ruff format --check`, `mypy src`, `pytest`
190 passed, `pytest -m postgres` 57 passed). Both route modules exist, are
mounted on the application factory, and delegate to the CAP-001-E2-S1/E2-S2
domain modules without duplicating business rules.

The gate nonetheless fails on one demonstrated acceptance-criterion violation.
DAC-E2-S3-3 requires that **any** non-2xx response from these routes carry the
shared error envelope with a `resource`. The 404/409 paths do. Every `422` —
which is the failure mode named by DAC-E2-4 (all-malformed), DAC-E2-8
(non-positive depth) and DAC-E2-S3-4 (over-bound `limit`), and therefore the
most frequently reached error on these routes — returns `resource: null`,
because `_validation_error_handler` in `app.py` omits the argument. This was not
caught because neither error-envelope test asserts `resource` on a `422`:
`test_error_envelope_shape` asserts it only on the 404, and
`test_error_envelope_shape_on_settings` — whose only case *is* a `422` — omits
the `resource` assertion that its own task (T012) specified. The defect and the
test gap are the same finding's two halves, so the mandatory test TC-COMP-125 is
also assessed WEAK rather than ADEQUATE.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S3-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E2-S3-coding` |
| HEAD | `aa4a40a9c0de2008cc5049a04d8f100ae919bd84` |
| Review base | `main` merge-base `7ed6d7c114ddd4d5fd1415e7c7602a2808b2ba5d` |
| Working tree | clean — no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 13 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/bounds.py` | added | T001 |
| `src/factorflow/api/models.py` | modified | T003 |
| `src/factorflow/api/routes/instruments.py` | added | T020; AC-1, DAC-E2-4, DAC-E2-5, DAC-E2-10 |
| `src/factorflow/api/routes/settings.py` | added | T021; DAC-E2-8, DAC-E2-S3-2 |
| `src/factorflow/api/app.py` | modified | T022, T024 |
| `tests/conftest.py` | modified | T023 — `migrated_connection_string` fixture for app-factory tests |
| `tests/integration/test_api_instruments.py` | added | T006–T009, T012–T014 |
| `tests/integration/test_api_settings.py` | added | T010–T012 |
| `tests/unit/test_api_models.py` | modified | T015, T018, T019 |
| `tests/unit/test_api_instruments_error_mapping.py` | added | T016 |
| `tests/unit/test_api_instruments_query_mapping.py` | added | T017 |
| `docs/.../CAP-001-E2-S3.md` | modified | status `planning` → `in-review`; bookkeeping |
| `docs/.../CAP-001-E2-S3-tasks.md` | modified | task checkboxes, T024/T025/T026 outcome notes |

No unjustified file changes. No dependency or configuration changes.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | SATISFIED | `src/factorflow/api/routes/instruments.py` — all three routes; `app.py:206-207` mounts both routers | `tests/integration/test_api_instruments.py::test_add_status_codes`, `::test_retire_status_codes`, `::test_list_filters_and_counts` | Add, list and retire are all reachable over HTTP with no config file or direct store access. |
| DAC-E2-4 | SATISFIED | `instruments.py:add_instruments` — `201` when `added or reactivated`, `409` when all `DUPLICATE_ACTIVE`, else `422` | `test_add_status_codes` exercises all three | Verified independently against a real database. |
| DAC-E2-5 | SATISFIED | `instruments.py:retire_instrument` — `InstrumentNotFound` → `404`, `AlreadyRetired` → `409` | `test_retire_status_codes`; `tests/unit/test_api_instruments_error_mapping.py` (both cases) | Explicit `except` clauses, not a bare re-raise, as T016 required. |
| DAC-E2-8 | SATISFIED | `models.py:SetHistoryDepthRequest._bounded_depth` rejects `<1`, `>50`, and `bool`; non-int rejected by Pydantic coercion | `test_put_depth_rejects_invalid` (0, -5, "five", 3.5, 51); `tests/unit/test_api_models.py::test_set_history_depth_request_rejects_non_positive_and_over_bound` | The explicit `isinstance(years, bool)` guard correctly stops `True` being accepted as `1`. |
| DAC-E2-10 | SATISFIED | `instruments.py:list_instruments_route` builds `InstrumentFilters` from `symbol`, `lifecycle`, `limit`, `cursor`; response carries `active_count`/`retired_count`/`next_cursor` | `test_list_filters_and_counts`, `test_list_cursor_pagination`; `tests/unit/test_api_instruments_query_mapping.py` (both cases) | See IR-003 on unvalidated `lifecycle` values — a robustness gap, not an AC violation. |
| DAC-E2-S3-1 | SATISFIED | `instruments.py:add_instruments` classifies into `added`/`reactivated`/`rejected`, attaching `_REJECTION_REASONS[disposition]` to each rejection | `test_add_mixed_batch_response_shape` asserts all four dispositions land in the right group and both rejections carry a reason | Reasons come from the domain `Disposition`, not re-derived. |
| DAC-E2-S3-2 | SATISFIED | `settings.py:get_history_depth` returns `HistoryDepthResponse(years=None, updated_at=None)` when `read_history_depth` is `None`; `years: int \| None` is a required field so it serializes as `null`, never omitted | `test_get_depth_when_unset` asserts `"years" in body` and `body["years"] is None`; `tests/unit/test_api_models.py::test_history_depth_response_serializes_absent_years_as_json_null` | `null` correctly distinguished from `0`, asserted with the JSON `null` literal as T011 required. |
| DAC-E2-S3-3 | **PARTIAL** | 404/409 use `error_response(..., resource="instruments")`. `app.py:_validation_error_handler` calls `error_response()` **without** `resource`, so every `422` returns `"resource": null` | `test_error_envelope_shape` asserts `resource` only on the 404; `test_error_envelope_shape_on_settings` tests a `422` but never asserts `resource` | See IR-001. Verified by direct probe: `PUT /api/settings/history-depth {"years":0}`, `GET /api/instruments?limit=501`, and a malformed `POST` body all return `{"error": {..., "resource": null, ...}}`. |
| DAC-E2-S3-4 | SATISFIED | `instruments.py:list_instruments_route` — `limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE)` | `test_list_limit_over_bound_rejected` (limit=501 → 422) | Rejected, not clamped. Probe confirms `limit=0` is also `422`. |
| DAC-E2-S3-5 | SATISFIED | Route forwards `cursor` unchanged; `service.list_instruments` uses `symbol > cursor` with `ORDER BY symbol` keyset paging | `test_list_cursor_pagination` walks three pages at `limit=2` and asserts the union equals `sorted(symbols)` with no duplicate | Genuinely proves stable ordering and no skip or repeat across page boundaries. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/api/bounds.py` — all five constants at the design's section 2.4a values (50/1/50/500/1000), each with its rationale | Rationale text matches the design table verbatim. |
| T002 | complete | VERIFIED | `src/factorflow/api/routes/__init__.py` pre-existed from CAP-001-E1-S6; not duplicated | Confirmed, not re-created, as instructed. |
| T003 | complete | VERIFIED | `models.py` — `AddInstrumentsRequest`, `SymbolOutcomeResponse`, `AddInstrumentsResponse`, `RetireInstrumentResponse`, `InstrumentListResponse`, `HistoryDepthResponse`, `SetHistoryDepthRequest` | `InstrumentResponse` added beyond the plan's list; a justified deviation — `InstrumentListResponse` needs a row type. |
| T004 | complete | VERIFIED | `service.py` and `instruments/settings.py` present with every named symbol; imports resolve (mypy clean) | Blocking check satisfied. |
| T005 | complete | VERIFIED | `src/factorflow/api/app.py:create_app` exists and is imported by both route test modules | Blocking check satisfied. |
| T006 | complete | VERIFIED | `test_api_instruments.py::test_add_status_codes` | All three status codes exercised. |
| T007 | complete | VERIFIED | `test_api_instruments.py::test_add_mixed_batch_response_shape` | Four-disposition batch as specified, including duplicate-of-retired reactivation. |
| T008 | complete | VERIFIED | `test_api_instruments.py::test_retire_status_codes` | 404, 200 (with `lifecycle`/`retired_at`), 409 all asserted. |
| T009 | complete | VERIFIED | `test_api_instruments.py::test_list_filters_and_counts` | Prefix filter, lifecycle filter, and both counts asserted against seeded totals. |
| T010 | complete | VERIFIED | `test_api_settings.py::test_put_depth_rejects_invalid` | All five specified cases present. |
| T011 | complete | VERIFIED | `test_api_settings.py::test_get_depth_when_unset` | Asserted with `is None`, not a falsy check. |
| T012 | complete | **PARTIAL** | `test_error_envelope_shape` and `test_error_envelope_shape_on_settings` | T012 required all four fields "present and non-empty" for a case from each route. The settings test omits the `resource` assertion entirely, and its case is a `422` where `resource` is in fact `null` (IR-001). The instruments test omits `resource` on its 409 case (IR-002). |
| T013 | complete | VERIFIED | `test_api_instruments.py::test_list_limit_over_bound_rejected` | Asserts 422. Does not additionally assert "not 500 rows", but the 422 makes a body impossible; acceptable. |
| T014 | complete | VERIFIED | `test_api_instruments.py::test_list_cursor_pagination` | Exceeds the plan — three pages rather than two. |
| T015 | complete | VERIFIED | `test_api_models.py::test_add_instruments_request_rejects_batch_over_bound` (+ at-bound companion) | Boundary tested on both sides. |
| T016 | complete | VERIFIED | `tests/unit/test_api_instruments_error_mapping.py` — both exception types | `_FakePool` avoids a real connection without bypassing the route body. |
| T017 | complete | VERIFIED | `tests/unit/test_api_instruments_query_mapping.py` — default and explicit-parameter cases | Captures the real `InstrumentFilters` the route constructs. |
| T018 | complete | VERIFIED | `test_api_models.py::test_set_history_depth_request_rejects_non_positive_and_over_bound` | Model-layer rejection confirmed before any store call. |
| T019 | complete | VERIFIED | `test_api_models.py::test_history_depth_response_serializes_absent_years_as_json_null` | Asserts key presence and `null` value. |
| T020 | complete | VERIFIED | `src/factorflow/api/routes/instruments.py` | All three routes with the specified status logic. |
| T021 | complete | VERIFIED | `src/factorflow/api/routes/settings.py` | Both routes; bound enforced at the model layer as planned. |
| T022 | complete | VERIFIED | `app.py:206-207` — `include_router(instruments.router)`, `include_router(settings.router)` | Registered alongside the existing health router. |
| T023 | complete | VERIFIED | `uv run pytest -m postgres` — 57 passed, rerun independently | Response shapes match the story's API Contract table. |
| T024 | complete | VERIFIED | `app.py:_validation_error_handler` + `add_exception_handler(RequestValidationError, ...)`; routes use `error_response()` | The deviation from the plan's literal `xfail` instruction is documented in the tasks Notes and owner-confirmed. The envelope is wired, but incompletely — IR-001. |
| T025 | complete | VERIFIED | `instruments.py`/`settings.py` contain no normalisation, no duplicate re-check, no reactivation re-derivation | The `retired_at` leak the note describes is genuinely removed; see IR-004 on what replaced it. |
| T026 | complete | VERIFIED | All five commands rerun independently below | The claimed "190 tests" matches exactly. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_add_status_codes` / TC-COMP-102 | ADEQUATE | Drives all three branches of the status logic through the real app and a real database; each branch would fail if the classification were inverted. | None. |
| `test_add_mixed_batch_response_shape` / TC-COMP-123 | ADEQUATE | Asserts exact group membership by symbol (`== ["GOOG"]`, `== ["AAPL"]`) rather than counts, and that both rejection kinds carry a reason. A misrouted disposition fails it. | Asserts the reason is truthy but not its content; acceptable, the text is not contracted. |
| `test_retire_status_codes` / TC-COMP-103 | ADEQUATE | Unknown → 404, active → 200 with body fields, repeat → 409, in one ordered sequence that proves the transition. | None. |
| `test_list_filters_and_counts` / TC-COMP-108 | ADEQUATE | Prefix filter asserted as an exact set, lifecycle filter as an exact set, counts as exact integers against seeded totals. | TC-COMP-108's 3000-instrument volume clause is exercised at the service layer by CAP-001-E2-S1, not here; the HTTP surface adds no volume behavior, so this is not a gap for this story. |
| `test_put_depth_rejects_invalid` / TC-COMP-106 | ADEQUATE | Five distinct invalid shapes including the type errors and the upper bound. | None. |
| `test_get_depth_when_unset` / TC-COMP-124 | ADEQUATE | Distinguishes an absent key, `null`, and a falsy `0` — the exact distinction the AC names. | None. |
| `test_error_envelope_shape` + `test_error_envelope_shape_on_settings` / TC-COMP-125 | **WEAK** | Prove the envelope exists on a 404, a 409 and a 422, with `code`, `message` and `request_id` populated. | Neither asserts `resource` on any `422`, and the instruments test omits it on the 409. The one field the tests skip is the one that is actually broken (IR-001, IR-002) — the test suite passes over a real AC violation. |
| `test_list_limit_over_bound_rejected` / TC-COMP-126 | ADEQUATE | 501 → 422 at the exact boundary above `MAX_PAGE_SIZE`. | Does not assert 500 is accepted; the on-bound side is untested (IR-005). |
| `test_list_cursor_pagination` / TC-COMP-127 | ADEQUATE | Three sequential pages; the union-equals-sorted assertion fails on any skip, repeat, or ordering instability. Strong regression sensitivity. | None. |
| `tests/unit/test_api_instruments_error_mapping.py` (2 tests) / T016 | ADEQUATE | Monkeypatches only `retire_symbol`, so the route body, the handler registration and the envelope formatting all really execute. The mock does not make the result inevitable. | None. |
| `tests/unit/test_api_instruments_query_mapping.py` (2 tests) / T017 | ADEQUATE | Captures the actual `InstrumentFilters` instance and asserts every field, so a mis-wired query parameter fails it. | None. |
| `tests/unit/test_api_models.py` (5 tests) / T015, T018, T019 | ADEQUATE | Model-layer validation tested at and beyond both bounds; serialization asserted through real JSON. | None. |

**Isolation and determinism**: verified. `tests/conftest.py` creates a fresh
database per test inside one session container, and the new
`migrated_connection_string` fixture applies migration 0001 before `create_app`
opens its pool — the ordering the app factory genuinely requires. No test depends
on execution order, wall-clock time, network access, or another test's rows. The
suite passed identically across the separate full, `-m postgres`, and
story-subset runs below.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed! |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 79 files already formatted. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 23 source files. |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 190 passed, 2 warnings in 20.04s. Matches the task plan's claimed count exactly. |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 57 passed, 133 deselected. Docker runtime available; no exclusion needed. |
| `uv run pytest tests/integration/test_api_instruments.py tests/integration/test_api_settings.py tests/unit/test_api_models.py tests/unit/test_api_instruments_error_mapping.py tests/unit/test_api_instruments_query_mapping.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 21 passed — the narrowest story-relevant set, run first. |

Two ad-hoc read-only probes were run against the app factory with a fake pool to
inspect response bodies the test suite does not assert (the `422` envelope, and
an unknown `lifecycle` value). Both wrote only to the scratchpad directory and
left the component repository untouched.

### Validation Side Effects

- Before: `git status --porcelain` empty — clean tree at `aa4a40a`.
- After: `git status --porcelain` empty — clean tree at `aa4a40a`.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — Every `422` from these routes omits `resource` from the error envelope

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S3-3 (also affects the error paths of DAC-E2-4, DAC-E2-8, DAC-E2-S3-4)
- **Tasks**: T012, T024
- **Files**: `src/factorflow/api/app.py` — `_validation_error_handler`; `tests/integration/test_api_settings.py::test_error_envelope_shape_on_settings`
- **Claim challenged**: T024's note states "DAC-E2-S3-3 is fully satisfied by this story rather than deferred", and the tasks file marks T012 complete.
- **Observed evidence**: `_validation_error_handler` calls `error_response(status_code=422, code="validation_error", message=..., request_id=...)` with no `resource` argument, so `ErrorDetail.resource` takes its `None` default. Probing the running app confirms it on all three `422` shapes: `PUT /api/settings/history-depth {"years": 0}` → `{"error": {"code": "validation_error", "message": "The request did not match the expected shape.", "resource": null, "request_id": "..."}}`; `GET /api/instruments?limit=501` → the same; a malformed `POST /api/instruments` body → the same. The suite does not catch this because `test_error_envelope_shape_on_settings`, whose only case is a `422`, asserts `code`, `message` and `request_id` but never `resource`.
- **Expected evidence/behavior**: The story's DAC-E2-S3-3 requires that any non-2xx response from these routes carry the envelope "with a stable snake_case code, owner-facing message, **resource** and request id". `component-design-ingestion-api.md` section 2.3 states the envelope exists so that STD-UI-19's three parts — operation, **resource** and reason — "always have somewhere to come from", and its example populates `resource`. T012 required asserting all four fields "present and non-empty".
- **Impact**: The interface cannot render STD-UI-19's resource part for the most commonly reached error class on these routes — every validation rejection, including the two the story's own ACs name (`DAC-E2-8`'s non-positive depth and `DAC-E2-S3-4`'s over-bound limit). The envelope is structurally present but semantically incomplete, and the gap is invisible to the current tests.
- **Required remediation**: Make `422` responses from `instruments.py` and `settings.py` carry a non-null `resource`, and strengthen the error-envelope tests so a `422` case from each route asserts all four fields non-empty, as T012 specified. Note that `_validation_error_handler` is registered application-wide, so the `resource` must be derived per request (for example from the request path) rather than hard-coded to one value; alternatively confirm with the owner whether a shared handler may carry a generic resource. No redesign of `errors.py` is implied.

### IR-002 — The `409` envelope assertion omits `resource` even though the route sets it

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S3-3
- **Tasks**: T012
- **Files**: `tests/integration/test_api_instruments.py::test_error_envelope_shape` lines 111-116
- **Claim challenged**: T012 claims a complete four-field envelope assertion for a `404`/`409` case from the route.
- **Observed evidence**: The 404 block asserts `code`, `message`, `resource`, `request_id`. The 409 block immediately below asserts only `code`, `message`, `request_id` — `resource` is dropped without explanation, though `retire_instrument` does pass `resource="instruments"` on that path.
- **Expected evidence/behavior**: T012 requires all four fields present and non-empty for the checked cases.
- **Impact**: A regression that dropped `resource` from the `409` path specifically would not fail any test. Low practical risk today since the field is set, but it is the same blind spot that let IR-001 through.
- **Required remediation**: Assert `resource` in the `409` block as well.

### IR-003 — An unrecognised `lifecycle` query value is silently accepted

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-10 (robustness, not a stated violation)
- **Tasks**: T020
- **Files**: `src/factorflow/api/routes/instruments.py:list_instruments_route` — `lifecycle: str | None = Query(default=None)`
- **Claim challenged**: The route "builds `InstrumentFilters` from query parameters" correctly for the list contract.
- **Observed evidence**: Probing `GET /api/instruments?lifecycle=bogus-value` returns `200` and forwards `InstrumentFilters(page_size=50, symbol_prefix=None, lifecycle='bogus-value', cursor=None)` into the service, which builds `lifecycle = 'bogus-value'` as a SQL predicate and matches nothing. The caller receives an empty list indistinguishable from a genuinely empty result.
- **Expected evidence/behavior**: The store constrains lifecycle to `('active','retired')` (`migrations/0001_extensions_owner_state.sql`, `instrument_lifecycle_known`), and `bounds.py`/section 2.4a exist precisely so the API rejects before the store has to. `limit` is validated at this layer; `lifecycle` is the only enumerated parameter that is not. The value is safely parameterised, so there is no injection risk.
- **Impact**: A client typo produces a silent empty list rather than a `422`, which is the same failure mode DAC-E2-S3-4 rejects for `limit` ("rejected rather than silently clamped"). No AC names `lifecycle` validation explicitly, so this is not scored as an AC violation.
- **Required remediation**: Constrain `lifecycle` to the two known values with a `Literal` or enum so an unknown value returns `422`, and add a test for it. Confirm with the owner if the permissive behavior is intentional.

### IR-004 — `retired_at` is reported from the API process clock and never read back from the store

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-5
- **Tasks**: T025
- **Files**: `src/factorflow/api/routes/instruments.py:retire_instrument` — `retired_at = datetime.now(UTC)` captured *before* the `retire_symbol` call
- **Claim challenged**: T025 records that removing the route's own `SELECT retired_at` was a clean fix, owner-confirmed, because the field is "informational only, never used for ordering".
- **Observed evidence**: `service.retire_symbol` writes `retired_at = now()` using the **database** clock, while the route returns a value taken from the **application** clock, sampled before the transaction even runs. The two values are never reconciled, so the response reports a timestamp that is not the one persisted. The comment states the gap is "sub-millisecond", but nothing bounds it: the sample happens before connection checkout, transaction start, and two round trips, and the app and database clocks are independent. `test_retire_status_codes` asserts only that `retired_at` is truthy, so no test would notice any divergence.
- **Expected evidence/behavior**: The story's API contract specifies `DELETE /api/instruments/{symbol}` returns `200 {lifecycle: "retired", retired_at}`. A response field named `retired_at` reasonably denotes the recorded retirement time.
- **Impact**: A client that stores or displays this timestamp holds a value that disagrees with the store's own row. The owner accepted the tradeoff for the stated reason, so this is recorded rather than treated as a contract breach — but the accepted rationale ("sub-millisecond") is not what the code guarantees.
- **Required remediation**: Either have `retire_symbol` return the `retired_at` it wrote (the clean fix, and a CAP-001-E2-S1 contract change rather than a route-layer one), or sample the clock immediately after the transaction commits and record in the code comment that the value is the API's approximation rather than the stored one. Owner direction should settle which.

### IR-005 — The `limit` boundary is tested only on the rejecting side

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S3-4
- **Tasks**: T013
- **Files**: `tests/integration/test_api_instruments.py::test_list_limit_over_bound_rejected`
- **Claim challenged**: The over-bound rejection is fully covered.
- **Observed evidence**: Only `limit=501` is asserted. No test asserts `limit=500` (exactly `MAX_PAGE_SIZE`) is accepted. An off-by-one that changed `le` to `lt` would leave the suite green.
- **Expected evidence/behavior**: `MAX_PAGE_SIZE` is inclusive per section 2.4a. `test_add_instruments_request_accepts_batch_at_bound` demonstrates the on-bound companion pattern this file already follows elsewhere.
- **Impact**: A boundary regression on the paging cap would pass unnoticed. No current defect.
- **Required remediation**: Add an on-bound acceptance assertion for `limit=500`.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified — `InstrumentResponse` added to `models.py` beyond T003's enumerated list.** `InstrumentListResponse` needs a typed row model; the plan named the container but not its element.
- **Justified — `migrated_connection_string` fixture added to `tests/conftest.py`.** Not named by any task, but required because `create_app` opens its own pool at construction time, so the schema must exist before the app is built. The docstring explains exactly this. Shared-fixture placement is consistent with the file's existing pattern.
- **Justified and owner-confirmed — T024 deviated from the plan's literal instruction.** The plan directed `xfail` markers pending CAP-001-E7-S2. `errors.py` already existed from CAP-001-E1-S6, and the coding agent raised this with the owner rather than assuming, recording the decision in the tasks Notes. The deviation is sound; its execution is incomplete (IR-001).
- **Bookkeeping — the `test_error_envelope_shape_on_settings` and `test_put_depth_accepts_bounded_value` tests are not named by any task.** Both are in-scope additions; noted only for completeness.
- **Open, inherited, not this story's to fix** — the CAP-001-E1-S6 / CAP-001-E7-S2 ownership overlap for `errors.py` and request-id middleware remains unresolved, as the tasks Notes correctly state. Flagged here so it is not lost at the epic level.
- No scope leakage. No dead code, debug artifacts, unrelated refactors, dependency changes, or configuration changes. No secret handling and no authorization surface: every route is unauthenticated by design (loopback only, per the story's Auth line and DAC-E1-S6-6).

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Resolve IR-001 (`422` responses must carry `resource`, with tests asserting it), then rerun `$adversarial-review` against this task file and this report. IR-002 through IR-005 should be addressed in the same pass or explicitly deferred with owner direction — IR-003 and IR-004 both warrant an owner decision rather than a unilateral fix.
- **Warnings accepted downstream**: N/A — verdict is CHANGES-REQUIRED.
