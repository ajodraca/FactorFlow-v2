---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-11
story_id: "CAP-001-E2-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-11T00:01:08Z"
reviewed_head: "dd9a8e211e8bced499506cafe097d1e259039f95"
review_base: "7ed6d7c114ddd4d5fd1415e7c7602a2808b2ba5d"
reviewed_state_revision: "sha256:284515afe91e837b4a78116d8ac8930b47078ce198f762c6d988bdf23fa4ccd7"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-09-11T00:01:08Z
  source_artifacts:
    - id: CAP-001-E2-S3
      version: "1"
    - id: CAP-001-E2-S3-tasks
      version: "1"
    - id: CAP-001-E2-S3-implementation-review
      version: "1"
    - id: CAP-001-component-design-ingestion-api
      version: "approved"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E2-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 26/26 verified |
| Required validation | 6/6 passed |

This is the re-review of the rework commit `dd9a8e2`, which responds to
`CAP-001-E2-S3-implementation-review-v1.md` (CHANGES-REQUIRED: 1 HIGH, 3 MEDIUM,
1 LOW). All five prior findings are independently confirmed resolved against the
current repository state — not accepted on the rework notes' word.

The blocking finding, IR-001, is genuinely fixed. `_validation_error_handler` now
derives `resource` per request via `_resource_for_path()`. This reviewer probed
the running application directly rather than relying on the suite: all seven
distinct `422` shapes reachable on these two routes — non-positive depth,
over-bound depth, non-integer depth, over-bound `limit`, zero `limit`,
unrecognised `lifecycle`, and a malformed `POST` body — now return a non-null,
route-correct `resource` (`"settings"` for the settings route, `"instruments"`
for the instruments route). DAC-E2-S3-3 moves from PARTIAL to SATISFIED, which
promotes TC-COMP-125 from WEAK to ADEQUATE and closes the last unsatisfied
acceptance criterion.

Test strength was verified by mutation rather than by inspection alone: each
defect from v1 was re-introduced in a throwaway copy of the tree in the
scratchpad (the component repository was never modified) and the corresponding
new assertion failed in every case — IR-001 fails both envelope tests, IR-003
fails `test_list_rejects_unrecognised_lifecycle`, IR-005 fails
`test_list_limit_at_bound_accepted`. The new tests therefore carry real
regression sensitivity and are not tautological.

Every required validation command passes independently: `ruff check`,
`ruff format --check`, `mypy src`, `pytest` (192 passed), `pytest -m postgres`
(59 passed, 133 deselected), and the narrowest story-relevant subset (23 passed).
The 192 and the two-new-test delta match the rework note exactly.

One new LOW finding (IR-006) is recorded: `_resource_for_path`'s docstring
describes a fallback behavior its code does not implement. It does not affect
either route this story owns and blocks nothing.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S3-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E2-S3-coding` |
| HEAD | `dd9a8e211e8bced499506cafe097d1e259039f95` |
| Review base | `main` merge-base `7ed6d7c114ddd4d5fd1415e7c7602a2808b2ba5d` |
| Working tree | clean — no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 14 |

The review set is the three commits from the merge base through `HEAD`
(`aa4a40a` implementation, `7acd313` the v1 report, `dd9a8e2` the rework), plus
the working tree, which is clean. The rework commit `dd9a8e2` touches five
files; the full change set is re-verified below rather than only the rework
delta.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/bounds.py` | added | T001 |
| `src/factorflow/api/models.py` | modified | T003 |
| `src/factorflow/api/routes/instruments.py` | added, reworked in `dd9a8e2` | T020, T025; AC-1, DAC-E2-4, DAC-E2-5, DAC-E2-10; IR-003, IR-004 |
| `src/factorflow/api/routes/settings.py` | added | T021; DAC-E2-8, DAC-E2-S3-2 |
| `src/factorflow/api/app.py` | modified, reworked in `dd9a8e2` | T022, T024; IR-001 |
| `tests/conftest.py` | modified | T023 — `migrated_connection_string` fixture for app-factory tests |
| `tests/integration/test_api_instruments.py` | added, reworked in `dd9a8e2` | T006–T009, T012–T014; IR-002, IR-003, IR-005 |
| `tests/integration/test_api_settings.py` | added, reworked in `dd9a8e2` | T010–T012; IR-001 |
| `tests/unit/test_api_models.py` | modified | T015, T018, T019 |
| `tests/unit/test_api_instruments_error_mapping.py` | added | T016 |
| `tests/unit/test_api_instruments_query_mapping.py` | added | T017 |
| `docs/.../CAP-001-E2-S3.md` | modified | status `planning` → `in-review`; bookkeeping |
| `docs/.../CAP-001-E2-S3-tasks.md` | modified, reworked in `dd9a8e2` | task checkboxes, Notes, Rework section |
| `docs/.../CAP-001-E2-S3-implementation-review-v1.md` | added | the v1 gate report itself |

No unjustified file changes. No dependency or configuration changes. The rework
commit's docs delta is confined to the tasks file's `updated` date, a
`last_reworked_review` key, and an appended Rework section — bookkeeping
consistent with the rework, with no task checkbox flipped to hide an
unimplemented item.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | SATISFIED | `src/factorflow/api/routes/instruments.py` — all three routes; `app.py:231-232` mounts both routers | `tests/integration/test_api_instruments.py::test_add_status_codes`, `::test_retire_status_codes`, `::test_list_filters_and_counts` | Add, list and retire all reachable over HTTP with no config file or direct store access. Unchanged from v1. |
| DAC-E2-4 | SATISFIED | `instruments.py:add_instruments` (lines 74-95) — `201` when `added or reactivated`, `409` when all `DUPLICATE_ACTIVE`, else `422` | `test_add_status_codes` exercises all three | Re-verified against a real database this run. |
| DAC-E2-5 | SATISFIED | `instruments.py:retire_instrument` (lines 112-127) — `InstrumentNotFound` → `404`, `AlreadyRetired` → `409` | `test_retire_status_codes`; `tests/unit/test_api_instruments_error_mapping.py` | Explicit `except` clauses, not a bare re-raise. `retired_at` semantics improved by the IR-004 rework; see disposition below. |
| DAC-E2-8 | SATISFIED | `models.py:SetHistoryDepthRequest._bounded_depth` rejects `<1`, `>50`, and `bool` | `test_put_depth_rejects_invalid` (0, -5, "five", 3.5, 51); `tests/unit/test_api_models.py` | Probed directly: all three invalid depth shapes now also carry `resource: "settings"` in the envelope. |
| DAC-E2-10 | SATISFIED | `instruments.py:list_instruments_route` (lines 145-178) builds `InstrumentFilters` from `symbol`, `lifecycle`, `limit`, `cursor`; response carries both counts and `next_cursor` | `test_list_filters_and_counts`, `test_list_cursor_pagination`, `test_list_rejects_unrecognised_lifecycle`; `tests/unit/test_api_instruments_query_mapping.py` | v1's IR-003 robustness gap on `lifecycle` is closed — the parameter is now `Literal["active", "retired"] \| None`. |
| DAC-E2-S3-1 | SATISFIED | `instruments.py:add_instruments` classifies into `added`/`reactivated`/`rejected`, attaching `_REJECTION_REASONS[disposition]` | `test_add_mixed_batch_response_shape` asserts exact group membership and that both rejections carry a reason | Reasons derive from the domain `Disposition`, not re-derived in the route. |
| DAC-E2-S3-2 | SATISFIED | `settings.py:get_history_depth` returns `HistoryDepthResponse(years=None, updated_at=None)`; `years: int \| None` is required so it serializes as `null` | `test_get_depth_when_unset` asserts `"years" in body` and `body["years"] is None`; `tests/unit/test_api_models.py::test_history_depth_response_serializes_absent_years_as_json_null` | `null` correctly distinguished from `0` and from an omitted key. |
| DAC-E2-S3-3 | **SATISFIED** (was PARTIAL in v1) | `app.py:_resource_for_path` (lines 186-201) + `_validation_error_handler` (lines 204-218) now pass a per-request `resource`; the 404/409 paths already passed `resource="instruments"` | `test_error_envelope_shape` asserts all four fields on 404, 409 **and** a 422; `test_error_envelope_shape_on_settings` asserts all four on a 422 | The v1 blocking defect. Verified by direct probe of the running app across seven `422` shapes on both routes — every one returns a non-null, route-correct `resource`. See the IR-001 disposition. |
| DAC-E2-S3-4 | SATISFIED | `instruments.py:list_instruments_route` — `limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE)` | `test_list_limit_over_bound_rejected` (501 → 422) **and** `test_list_limit_at_bound_accepted` (500 → 200) | Both sides of the inclusive bound now asserted, closing v1's IR-005. Probe confirms `limit=0` is also `422`, with `resource` populated. |
| DAC-E2-S3-5 | SATISFIED | Route forwards `cursor` unchanged; `service.list_instruments` uses `symbol > cursor` with `ORDER BY symbol` keyset paging | `test_list_cursor_pagination` walks three pages at `limit=2`, asserting the union equals `sorted(symbols)` with no duplicate | Proves stable ordering with no skip or repeat across page boundaries. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/api/bounds.py` — all five constants at the design's section 2.4a values (50/1/50/500/1000) with rationale comments | Unchanged by the rework; re-confirmed. |
| T002 | complete | VERIFIED | `src/factorflow/api/routes/__init__.py` pre-existed from CAP-001-E1-S6; not duplicated | Confirmed, not re-created. |
| T003 | complete | VERIFIED | `models.py` — all seven named models present | `InstrumentResponse` added beyond the plan's list; justified — `InstrumentListResponse` needs a row type. |
| T004 | complete | VERIFIED | `service.py` and `instruments/settings.py` present with every named symbol; imports resolve (mypy clean) | Blocking check satisfied. |
| T005 | complete | VERIFIED | `src/factorflow/api/app.py:create_app` exists and is imported by both route test modules | Blocking check satisfied. |
| T006 | complete | VERIFIED | `test_api_instruments.py::test_add_status_codes` | All three status codes exercised. |
| T007 | complete | VERIFIED | `test_api_instruments.py::test_add_mixed_batch_response_shape` | Four-disposition batch including duplicate-of-retired reactivation. |
| T008 | complete | VERIFIED | `test_api_instruments.py::test_retire_status_codes` | 404, 200 (with `lifecycle`/`retired_at`), 409 all asserted. |
| T009 | complete | VERIFIED | `test_api_instruments.py::test_list_filters_and_counts` | Prefix filter, lifecycle filter, both counts asserted against seeded totals. |
| T010 | complete | VERIFIED | `test_api_settings.py::test_put_depth_rejects_invalid` | All five specified cases present. |
| T011 | complete | VERIFIED | `test_api_settings.py::test_get_depth_when_unset` | Asserted with `is None`, not a falsy check. |
| T012 | complete | **VERIFIED** (was PARTIAL in v1) | `test_error_envelope_shape` lines 106-137 and `test_error_envelope_shape_on_settings` lines 53-65 | T012's requirement — all four envelope fields present and non-empty for a case from each route — is now met. The instruments test asserts all four on 404, 409 and 422; the settings test asserts all four on its 422. Both prior gaps (IR-001, IR-002) closed. |
| T013 | complete | VERIFIED | `test_api_instruments.py::test_list_limit_over_bound_rejected` | Asserts 422 at 501. Now paired with the on-bound companion added for IR-005. |
| T014 | complete | VERIFIED | `test_api_instruments.py::test_list_cursor_pagination` | Exceeds the plan — three pages rather than two. |
| T015 | complete | VERIFIED | `test_api_models.py::test_add_instruments_request_rejects_batch_over_bound` (+ at-bound companion) | Boundary tested on both sides. |
| T016 | complete | VERIFIED | `tests/unit/test_api_instruments_error_mapping.py` — both exception types | `_FakePool` avoids a real connection without bypassing the route body. |
| T017 | complete | VERIFIED | `tests/unit/test_api_instruments_query_mapping.py` — default and explicit-parameter cases | Captures the real `InstrumentFilters` the route constructs. |
| T018 | complete | VERIFIED | `test_api_models.py::test_set_history_depth_request_rejects_non_positive_and_over_bound` | Model-layer rejection confirmed before any store call. |
| T019 | complete | VERIFIED | `test_api_models.py::test_history_depth_response_serializes_absent_years_as_json_null` | Asserts key presence and `null` value. |
| T020 | complete | VERIFIED | `src/factorflow/api/routes/instruments.py` | All three routes with the specified status logic; `lifecycle` now validated at this layer per IR-003. |
| T021 | complete | VERIFIED | `src/factorflow/api/routes/settings.py` | Both routes; bound enforced at the model layer as planned. |
| T022 | complete | VERIFIED | `app.py:231-232` — `include_router(instruments.router)`, `include_router(settings.router)` | Registered alongside the existing health router. |
| T023 | complete | VERIFIED | `uv run pytest -m postgres` — 59 passed, rerun independently this review | Response shapes match the story's API Contract table. |
| T024 | complete | **VERIFIED** (was VERIFIED-with-defect in v1) | `app.py:_validation_error_handler` + `_resource_for_path` + `add_exception_handler(RequestValidationError, ...)`; routes use `error_response()` | The owner-confirmed deviation from the plan's literal `xfail` instruction is documented in the tasks Notes. The envelope is now wired *completely*, not just structurally — the v1 gap is closed. |
| T025 | complete | VERIFIED | `instruments.py`/`settings.py` contain no normalisation, no duplicate re-check, no reactivation re-derivation | The `retired_at` data-access leak stays removed; the IR-004 rework repositions the clock sample without re-introducing a store query. |
| T026 | complete | VERIFIED | All six commands rerun independently below | The rework's claimed "192 passed" matches this reviewer's independent run exactly. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_add_status_codes` / TC-COMP-102 | ADEQUATE | Drives all three branches of the status logic through the real app and a real database; each branch fails if the classification is inverted. | None. |
| `test_add_mixed_batch_response_shape` / TC-COMP-123 | ADEQUATE | Asserts exact group membership by symbol (`== ["GOOG"]`, `== ["AAPL"]`) rather than counts, and that both rejection kinds carry a reason. A misrouted disposition fails it. | Asserts the reason is truthy but not its content; acceptable, the text is not contracted. |
| `test_retire_status_codes` / TC-COMP-103 | ADEQUATE | Unknown → 404, active → 200 with body fields, repeat → 409, in one ordered sequence that proves the transition. | Asserts `retired_at` is truthy but not its value; see IR-004 disposition — acceptable given the field is explicitly an approximation. |
| `test_list_filters_and_counts` / TC-COMP-108 | ADEQUATE | Prefix filter and lifecycle filter asserted as exact sets, counts as exact integers against seeded totals. | TC-COMP-108's volume clause is exercised at the service layer by CAP-001-E2-S1; the HTTP surface adds no volume behavior. Not a gap for this story. |
| `test_list_rejects_unrecognised_lifecycle` / IR-003 | ADEQUATE | Asserts `lifecycle=bogus-value` → 422. **Mutation-verified**: reverting the parameter to `str \| None` makes this test fail. | Asserts only the status code, not the envelope; the envelope on that same path is covered by `test_error_envelope_shape`'s 422 case. |
| `test_put_depth_rejects_invalid` / TC-COMP-106 | ADEQUATE | Five distinct invalid shapes including both type errors and the upper bound. | None. |
| `test_get_depth_when_unset` / TC-COMP-124 | ADEQUATE | Distinguishes an absent key, `null`, and a falsy `0` — the exact distinction the AC names. | None. |
| `test_error_envelope_shape` + `test_error_envelope_shape_on_settings` / TC-COMP-125 | **ADEQUATE** (was WEAK in v1) | Together prove the envelope on a 404, a 409 and two 422s (one per route), each asserting all four fields non-empty. **Mutation-verified**: removing `resource=_resource_for_path(...)` from `_validation_error_handler` fails *both* tests. The field that was broken in v1 is now the field under assertion. | None. The v1 blind spot is closed on both routes. |
| `test_list_limit_over_bound_rejected` / TC-COMP-126 | ADEQUATE | 501 → 422 at the exact boundary above `MAX_PAGE_SIZE`. | None — the on-bound side is now covered by its companion. |
| `test_list_limit_at_bound_accepted` / IR-005 | ADEQUATE | 500 → 200, the inclusive boundary. **Mutation-verified**: changing `le=MAX_PAGE_SIZE` to `lt=MAX_PAGE_SIZE` fails this test and no other. | None. |
| `test_list_cursor_pagination` / TC-COMP-127 | ADEQUATE | Three sequential pages; the union-equals-sorted assertion fails on any skip, repeat, or ordering instability. | None. |
| `tests/unit/test_api_instruments_error_mapping.py` (2 tests) / T016 | ADEQUATE | Monkeypatches only `retire_symbol`, so the route body, handler registration and envelope formatting all really execute. | None. |
| `tests/unit/test_api_instruments_query_mapping.py` (2 tests) / T017 | ADEQUATE | Captures the actual `InstrumentFilters` instance and asserts every field. | None. |
| `tests/unit/test_api_models.py` (5 tests) / T015, T018, T019 | ADEQUATE | Model-layer validation tested at and beyond both bounds; serialization asserted through real JSON. | None. |

**Regression sensitivity (mutation evidence).** Rather than accept the new tests
on inspection, this reviewer re-introduced each v1 defect in a disposable copy of
the tree under the scratchpad and reran the relevant tests. The component
repository was never modified and the copy was deleted afterward.

| Re-introduced defect | Mutation applied | Result |
|----------------------|------------------|--------|
| IR-001 | Removed `resource=_resource_for_path(request.url.path)` from `_validation_error_handler` | `test_error_envelope_shape` **and** `test_error_envelope_shape_on_settings` both FAILED |
| IR-003 | Reverted `lifecycle` to `str \| None = Query(default=None)` | `test_list_rejects_unrecognised_lifecycle` FAILED |
| IR-005 | Changed `le=MAX_PAGE_SIZE` to `lt=MAX_PAGE_SIZE` | `test_list_limit_at_bound_accepted` FAILED |

Each mutation failed only the intended test(s), confirming the new assertions are
targeted and not incidentally satisfied.

**Isolation and determinism**: verified. `tests/conftest.py` creates a fresh
database per test inside one session container, and `migrated_connection_string`
applies migration 0001 before `create_app` opens its pool. No test depends on
execution order, wall-clock time, network access, or another test's rows. The
suite passed identically across the separate narrow, full, and `-m postgres`
runs below, and again inside the disposable mutation copy at baseline.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest tests/integration/test_api_instruments.py tests/integration/test_api_settings.py tests/unit/test_api_models.py tests/unit/test_api_instruments_error_mapping.py tests/unit/test_api_instruments_query_mapping.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 23 passed — the narrowest story-relevant set, run first. 21 in v1 + the 2 new rework tests. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed! |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 79 files already formatted. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 23 source files. |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 192 passed, 2 warnings in 20.75s. Matches the rework note's claimed count exactly (190 + 2 new). |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 59 passed, 133 deselected, in 8.63s. Docker runtime available; no exclusion needed. 57 in v1 + the 2 new postgres-marked tests. |

Every command in the task plan's Validation Plan was run. `uv sync --all-extras`
was not rerun as a mutating install step; the existing environment resolved all
imports and mypy reported no missing stubs, so no dependency gap is masked.

Two ad-hoc read-only probes were run in addition to the suite: a direct call of
`_resource_for_path` across eleven path shapes, and a live `TestClient` probe of
all seven reachable `422` shapes on both routes with a fake pool. Both wrote only
to the scratchpad and left the component repository untouched.

### Validation Side Effects

- Before: `git status --porcelain` empty — clean tree at `dd9a8e2`.
- After: `git status --porcelain` empty — clean tree at `dd9a8e2`; `git rev-parse HEAD` unchanged.
- Unexpected tracked-file changes: none.
- The mutation-testing copy lived entirely under the session scratchpad and was removed after use; the component repository was never written to.

## Findings

### IR-006 — `_resource_for_path`'s docstring describes a fallback its code does not implement

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A — neither route this story owns reaches the fallback branch
- **Tasks**: T024 (the handler this helper serves)
- **Files**: `src/factorflow/api/app.py:186-201` — `_resource_for_path`
- **Claim challenged**: The docstring states the helper "Falls back to the path's own **first** segment for any route this story does not own, so a future route never silently reports someone else's resource name."
- **Observed evidence**: The fallback is `return path.strip("/").split("/")[-1] or "request"`, which takes the **last** segment, not the first. Probed directly: `/api/runs/123/events` → `"events"`; `/api/coverage` → `"coverage"`; `/` → `"request"`. For a nested future route the returned value is the leaf segment, and where the leaf is a path parameter the resource would be the parameter's value rather than a resource name (for example `/api/runs/123` → `"123"`). Separately, `/api/settings` → `"settings"` resolves correctly but by the fallback rather than by the `_VALIDATION_ERROR_RESOURCES` map, which contains only the full `/api/settings/history-depth` key.
- **Expected evidence/behavior**: A docstring should describe what the code does. Neither the story nor `component-design-ingestion-api.md` section 2.3 specifies the fallback's behavior for routes outside this story, so the code is not wrong against any stated requirement — only against its own comment.
- **Impact**: None on this story. `/api/instruments`, `/api/instruments/{symbol}` and `/api/settings/history-depth` are all matched by the explicit map before the fallback runs, and all were probed returning the correct resource. The risk is confined to a future route story that reads this docstring and inherits a leaf-segment resource — plausibly a path-parameter value — while believing it gets the first segment.
- **Required remediation**: Either correct the docstring to say "last segment", or change the fallback to the first path segment after `/api` so it matches the stated intent. A future route story may equally choose to add its own entry to `_VALIDATION_ERROR_RESOURCES` and leave the fallback alone. No change to this story's routes is implied, and this finding does not block the gate.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) — every `422` omits `resource` | **RESOLVED** | `app.py:186-201` adds `_resource_for_path`; `app.py:217` passes `resource=_resource_for_path(request.url.path)`. Independently probed via `TestClient` against the real app: `PUT /api/settings/history-depth {"years":0}`, `{"years":51}`, `{"years":"five"}` → `resource: "settings"`; `GET /api/instruments?limit=501`, `?limit=0`, `?lifecycle=bogus`, and a malformed `POST /api/instruments` body → `resource: "instruments"`. All four envelope fields non-empty in every case. Mutation-verified: removing the argument fails both envelope tests. DAC-E2-S3-3 → SATISFIED, TC-COMP-125 → ADEQUATE. |
| v1/IR-002 (MEDIUM) — `409` envelope assertion omits `resource` | **RESOLVED** | `tests/integration/test_api_instruments.py:125` — `assert conflict_envelope["resource"]` added to the 409 block, which now asserts all four fields alongside the 404 block above it. |
| v1/IR-003 (MEDIUM) — unrecognised `lifecycle` silently accepted | **RESOLVED** | `instruments.py:148` — `lifecycle: Literal["active", "retired"] \| None = Query(default=None)`. Probed: `GET /api/instruments?lifecycle=bogus` now returns `422` with a populated envelope rather than an empty `200` list. `test_list_rejects_unrecognised_lifecycle` added and mutation-verified. Recorded as owner-confirmed in the tasks Rework section. |
| v1/IR-004 (MEDIUM) — `retired_at` sampled from the app clock before the transaction | **RESOLVED** | `instruments.py:129-141` — the `datetime.now(UTC)` sample moved from before the `try` block to after the `with pool.connection()` block exits, which is after `retire_symbol`'s `connection.transaction()` has committed (confirmed by reading `service.retire_symbol`, which wraps its work in `connection.transaction()`). The comment no longer claims a "sub-millisecond" gap and states plainly that the value is the API's approximation, not the exact persisted value. This is the second of the two remediations v1 offered — the route-layer option — with the `retire_symbol` contract change explicitly deferred as out of scope for this rework. The residual imprecision is now accurately documented rather than misdescribed, which is what the finding asked for. |
| v1/IR-005 (LOW) — `limit` boundary tested only on the rejecting side | **RESOLVED** | `tests/integration/test_api_instruments.py:149-157` — `test_list_limit_at_bound_accepted` asserts `limit=500` → `200`. Mutation-verified: an `le`-to-`lt` change on the bound fails this test. |

All five prior findings are independently confirmed resolved against repository
evidence at `dd9a8e2`. No prior finding is carried forward as STILL OPEN.

## Scope and Plan Deviations

- **Justified — `InstrumentResponse` added to `models.py` beyond T003's enumerated list.** `InstrumentListResponse` needs a typed row model; the plan named the container but not its element. Carried forward from v1, unchanged.
- **Justified — `migrated_connection_string` fixture in `tests/conftest.py`.** Not named by any task, but required because `create_app` opens its own pool at construction time, so the schema must exist before the app is built. Carried forward from v1, unchanged.
- **Justified and owner-confirmed — T024 deviated from the plan's literal `xfail` instruction.** `errors.py` already existed from CAP-001-E1-S6; the coding agent raised this with the owner and recorded the decision in the tasks Notes. In v1 the deviation was sound but incompletely executed; as of `dd9a8e2` the execution is complete.
- **Justified and owner-confirmed — IR-003 and IR-004 rework choices.** v1 flagged both as warranting owner direction rather than a unilateral fix. The tasks Rework section records both as owner-confirmed, and the chosen remedies match the options v1 enumerated. The IR-004 remedy takes the route-layer option and explicitly defers the `retire_symbol` signature change as a CAP-001-E2-S1 concern — a reasonable scope boundary for a rework pass.
- **Bookkeeping — `test_error_envelope_shape_on_settings` and `test_put_depth_accepts_bounded_value` are not named by any task.** Both are in-scope additions; noted for completeness. The two rework tests (`test_list_rejects_unrecognised_lifecycle`, `test_list_limit_at_bound_accepted`) are likewise not in the original plan but are directly traceable to v1 findings IR-003 and IR-005.
- **Open, inherited, not this story's to fix** — the CAP-001-E1-S6 / CAP-001-E7-S2 ownership overlap for `errors.py` and the request-id middleware remains unresolved, as the tasks Notes state. Re-flagged here so it is not lost at the epic level. This story consumed `errors.py` rather than redefining it, so it neither worsens nor resolves the overlap.
- **Forward-looking, not blocking** — `_VALIDATION_ERROR_RESOURCES` is keyed by full path and lives in `app.py`, while the route paths themselves are declared in the route modules. A future route that changes its path without updating the map would silently fall through to the leaf-segment fallback. Noted as context for the runs and coverage route stories; not a defect in this story, whose two paths are both correctly mapped and probe correctly.
- No scope leakage. No dead code, debug artifacts, unrelated refactors, dependency changes, or configuration changes. No secret handling and no authorization surface: every route is unauthenticated by design (loopback only, per the story's Auth line and DAC-E1-S6-6).

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to `$doc-sync` for CAP-001-E2-S3 with IR-006 recorded as an accepted warning. IR-006 requires no code change before doc sync; it may be folded into whichever later route story (runs or coverage) first extends `_VALIDATION_ERROR_RESOURCES`, or corrected as a one-line docstring fix through the expedited lane.
- **Warnings accepted downstream**: IR-006 (LOW).
