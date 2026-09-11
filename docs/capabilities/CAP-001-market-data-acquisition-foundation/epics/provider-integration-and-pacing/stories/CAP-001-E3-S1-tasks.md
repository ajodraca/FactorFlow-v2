---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-10
updated: 2026-09-10
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: unknown
  timestamp: 2026-09-11T02:32:50Z
  source_artifacts:
    - id: CAP-001-E3-S1
      version: "1"
    - id: CAP-001-component-design-massive-client
      version: "7"
    - id: CAP-001-system-design
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E3-S1 — Massive Client: The Four Historical Reads

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E2-S4`
**Date**: 2026-09-10

## Summary

Implement the project-owned Massive boundary for reference data, daily bars, financials, and corporate actions. The client uses Massive's official SDK internally, disables SDK retry, pagination, and trace defaults, and delegates one request at a time to the rate-limit governor. It returns the product-shaped models delivered by CAP-001-E3-S2, preserves paging under governor permits, and keeps the runtime credential out of URLs and logs.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-3 | Four historical data types are returned for a covered named instrument. | T003, T004, T005, T006, T009, T010 |
| AC-13 | Credential is supplied at runtime and never appears in logs or rendered output. | T007, T009, T010 |
| DAC-E3-1 | Client exposes one operation per data type with symbol and date range. | T005, T009 |
| DAC-E3-10 | Reference data retains CIK, composite FIGI, and share class FIGI. | T003, T009 |
| DAC-E3-11 | Delisted instruments remain acquirable with active flag and delisting date. | T003, T009 |
| DAC-E3-14 | The historical interface leaves room for the M3 streaming half. | T006, T009 |
| DAC-E3-S1-1 | SDK defaults requiring override are set explicitly. | T007, T009 |
| DAC-E3-S1-2 | Daily aggregates use multiplier 1, day timespan, and inclusive ISO dates. | T004, T009 |
| DAC-E3-S1-3 | Paging follows `next_url` until exhausted. | T004, T008, T010 |
| DAC-E3-S1-4 | Reference reads use the single-ticker endpoint. | T003, T009 |
| DAC-E3-S1-5 | The forward-looking market-status endpoint is never called. | T007, T009 |
| DAC-E3-S1-6 | Credential is passed to the SDK and absent from log records. | T007, T009 |

## Phase 1: Setup

**Purpose**: Add the approved Massive SDK and establish the package locations for the S1 client and pager.

- [ ] T001 Add the approved `massive` SDK dependency to `pyproject.toml` and resolve it in `uv.lock`; use the official package named by `docs/constitution/tech-stack.md`, without adding a vendor-neutral provider abstraction.
- [ ] T002 [P] Create `src/factorflow/ingestion/__init__.py` and `src/factorflow/ingestion/massive/__init__.py` as package markers for the component-design placement.

**Checkpoint**: `uv sync --all-extras` resolves the SDK, and the `factorflow.ingestion.massive` package imports without an implementation module.

---

## Phase 2: Tests (TDD)

**Purpose**: Write isolated, no-container tests using recorded fixtures and a substituted SDK boundary; run and observe each as failing before production implementation.

### Mandatory Component Tests

- [ ] T003 [P] Implement TC-COMP-003, TC-COMP-204, TC-COMP-205, and TC-COMP-212 in `tests/unit/test_massive_reference.py`: substitute the SDK single-ticker read, assert product-shaped reference output retains CIK/composite FIGI/share-class FIGI and a delisted instrument’s `active` and `delisted_utc`, and assert the list-form endpoint is not used.
- [ ] T004 [P] Implement TC-COMP-003, TC-COMP-210, and TC-COMP-211 in `tests/unit/test_massive_bars.py`: assert the daily aggregate request uses multiplier `1`, timespan `day`, and inclusive `YYYY-MM-DD` range values; supply two recorded pages and assert all rows are returned in order.
- [ ] T005 [P] Implement the TC-COMP-003 financial and corporate-action read coverage in `tests/unit/test_massive_financials.py` and `tests/unit/test_massive_actions.py`, using the parsed model fixtures supplied by CAP-001-E3-S2 and asserting each public read returns the corresponding complete result for a covered symbol.
- [ ] T006 [P] Implement TC-COMP-195 and TC-COMP-208 in `tests/unit/test_massive_client_interface.py`: assert `MassiveClient` exposes the four named operations with the specified symbol/date-range signatures and no generic provider-path operation.
- [ ] T007 [P] Implement TC-COMP-013, TC-COMP-209, TC-COMP-213, and TC-COMP-214 in `tests/unit/test_massive_sdk_config.py` and `tests/unit/test_massive_auth.py`: inspect the substituted `RESTClient` construction for `retries=0`, `pagination=False`, explicit connect/read timeouts, and `trace=False`; assert the runtime credential is passed to the SDK without appearing in captured records, URLs, or an `apiKey` query parameter; assert no market-status request is made.

### Additional Unit Tests

- [ ] T008 [P] Add a failure-path test in `tests/unit/test_massive_bars.py` in which a later page request fails; assert the method raises instead of returning the earlier page as a complete range (component-design-massive-client.md §8 acceptance criterion 12).

**Checkpoint**: The seven mandatory mapped TC IDs are represented by the six test files above, the page-failure test is present, and the new tests are observed RED before T009 begins. Tests carry their TC IDs in traceability comments.

---

## Phase 3: Core Implementation

**Purpose**: Implement the pager and the four product-named read operations against the established models, taxonomy, and governor contracts.

- [ ] T009 Create `src/factorflow/ingestion/massive/client.py` implementing `MassiveClient`, construct its one reusable `massive.RESTClient` from `MassiveSettings`, and implement `fetch_reference`, `fetch_daily_bars`, `fetch_financials`, and `fetch_corporate_actions` with the provider paths and result mapping in `component-design-massive-client.md` §§2.3 and 2.5. Use the single-ticker reference read, explicit daily-bar request parameters, header-based SDK authentication, and the `models.py` types from CAP-001-E3-S2.
- [ ] T010 Create `src/factorflow/ingestion/massive/paging.py` to follow only present `next_url` values one page at a time, accumulating one operation’s complete result and acquiring a governor permit before every page request; do not return partial results when a later page fails.

**Checkpoint**: All four reads return the product-shaped model types, ranges are complete only after the final page, and no code path invokes the market-status or ticker-list endpoints.

---

## Phase 4: Integration

**Purpose**: Wire the client’s SDK calls through the approved retry/pacing and failure-taxonomy seams without expanding their ownership.

- [ ] T011 Update `src/factorflow/ingestion/massive/client.py` to submit each initial and paged SDK request through `RateLimitGovernor.execute` from `src/factorflow/ingestion/rate_limit.py`, using the `Outcome` contract in `component-design-rate-limit-governor.md` §2.3 and the classification functions from `src/factorflow/ingestion/massive/errors.py` delivered by CAP-001-E3-S3. Do not implement governor or taxonomy behavior in this story.

**Checkpoint**: Every SDK request, including a `next_url` page, reaches the existing governor seam exactly once; typed errors and retry policy remain owned by E3-S3 and E3-S4.

---

## Phase 5: Polish

**Purpose**: Verify the complete component change and record the required TDD mutation evidence without adding behavior.

- [ ] T012 Run the S1 unit-test files in `tests/unit/test_massive_reference.py`, `tests/unit/test_massive_bars.py`, `tests/unit/test_massive_financials.py`, `tests/unit/test_massive_actions.py`, `tests/unit/test_massive_client_interface.py`, `tests/unit/test_massive_sdk_config.py`, and `tests/unit/test_massive_auth.py`; then perform and document manual mutations for SDK-default overrides, daily range parameters, paging continuation, forbidden endpoints, and credential redaction in `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tdd-evidence.yaml` before marking implementation tasks complete.

**Checkpoint**: Mandatory tests are green, manual mutations are killed or strengthened, and build/lint/format/type validation passes.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 and T002 precede every implementation and test-import task.
- T003–T008 can run in parallel after T001/T002; T008 depends on the test fixture helpers introduced for T004.
- T009 depends on CAP-001-E3-S2 delivering `src/factorflow/ingestion/massive/models.py` and on the RED tests in T003–T007.
- T010 depends on T004 and supplies the paging behavior consumed by T009.
- T011 depends on CAP-001-E3-S3 delivering `src/factorflow/ingestion/massive/errors.py`, CAP-001-E3-S4 delivering `src/factorflow/ingestion/rate_limit.py`, and the client/pager in T009/T010.
- T012 depends on T003–T011.

### Parallel Opportunities

- T001 and T002 may run in parallel.
- T003, T004, T005, T006, and T007 may run in parallel after setup.
- T009 and T010 may be developed in parallel once their respective RED tests and the E3-S2 models are available; merge T010 before completing T009’s paged reads.

### External Story Dependencies

- CAP-001-E1-S3 is available: `MassiveSettings` supplies the runtime `SecretStr` credential and timeout configuration.
- CAP-001-E3-S2 must be completed before the client is implemented because it owns all response model types.
- CAP-001-E3-S3 and CAP-001-E3-S4 must be completed before T011. Their taxonomy and governor contracts are inputs, not work to duplicate here.

## Validation Plan

### Constitution-Defined Commands

- Install/resolve: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest`
- No-container test subset: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Static analysis: `uv run mypy src`

### Story-Specific Validation

- Run the S1 test files with `uv run pytest -m 'not postgres' tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py tests/unit/test_massive_client_interface.py tests/unit/test_massive_sdk_config.py tests/unit/test_massive_auth.py`.
- Verify each SDK construction explicitly has `retries=0`, `pagination=False`, `trace=False`, and both SDK timeout fields sourced from `MassiveSettings` (component design §2.2b).
- Verify every daily range request uses multiplier `1`, timespan `day`, and the requested inclusive dates; verify a two-page response returns every row and a second-page failure is raised.
- Verify the test doubles observe no `GET /v1/marketstatus/upcoming`, no ticker-list call, and no credential in a URL or captured log record.
- Follow the required RED → GREEN → MUTATE → STRENGTHEN → REFACTOR cycle; record each cycle’s observed failure, commit hash, and manual mutation result in `CAP-001-E3-S1-tdd-evidence.yaml` before starting the next cycle.

## Notes

- This plan does not implement models, error classification, retry policy, or rate limiting. Those concerns have explicit ownership in CAP-001-E3-S2, CAP-001-E3-S3, and CAP-001-E3-S4.
- The repository does not yet contain `src/factorflow/ingestion/`, Massive dependency entries, or Massive tests; all paths in this plan are new and follow the approved component-design placement.
- Live-provider tests are deliberately excluded: the component design requires recorded response fixtures served through a local SDK substitute so the suite remains deterministic and consumes no provider rate budget.
