---
artifact_schema_version: 1
artifact_id: CAP-003-data-health-api-tests
artifact_type: test-specification
artifact_version: 2
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-11-08
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T19:19:17Z
  source_artifacts:
    - id: CAP-003
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-backlog
      version: "4"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# data-health-api Component Test Specification

Component tests for `data-health-api` (CAP-003). Each case verifies one story-level or epic-level derived acceptance criterion within a unit test harness for the FactorFlow-v2 repository; IDs are assigned in AC-ID order across every component file, so this file holds 9 cases (TC-COMP-037 to TC-COMP-277, not necessarily contiguous).

### TC-COMP-037: Responses keep the domain vocabulary with no sentence or tier

**Scope:** component
**Component(s):** data-health-api
**Traces to:** AC-19, DAC-E2-12
**Priority:** P2
**Type:** functional

#### Preconditions
- The three Pydantic models in `data_health_models.py`

#### Steps
1. Enumerate every field name of each model and nested model
2. Serialise populated fixtures

#### Expected Result
- No field is named *stock* or *download*; names are `instrument`-level facts, run states and outcomes
- No field carries a composed sentence or a tier

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-050: Response models serialise every field with nulls, never omitted

**Scope:** component
**Component(s):** data-health-api
**Traces to:** AC-24, DAC-E2-S4-1, DAC-E2-11
**Priority:** P1
**Type:** functional

#### Preconditions
- Reader fixtures with absent nullable values

#### Steps
1. Serialise each model through `from_reader`
2. Inspect timestamps, session dates and the nullable fields

#### Expected Result
- Every system design §4.2 field present except each failure's `cause`, which CAP-003-E8-S7 adds and TC-COMP-275 then requires (E2-S4 v2); timestamps ISO-8601 with offset; session dates `YYYY-MM-DD`
- `gap_stock_count`, `prices_as_of`, `latest_session`, `as_of` and `progress.total` serialise as `null`, never omitted and never `0`

#### Error / Edge Cases
- `checks` null exactly when `never_acquired`

### TC-COMP-051: problems route refuses bad limit and cursor with 422 and no echo

**Scope:** component
**Component(s):** data-health-api
**Traces to:** AC-13, DAC-E2-S4-2, DAC-E2-3
**Priority:** P1
**Type:** security

#### Preconditions
- `create_app` with the reader stubbed

#### Steps
1. GET `/api/data-health/problems?limit=0`
2. GET with `limit=501`
3. GET with `cursor=not a symbol`

#### Expected Result
- Each answers `422 validation_error`
- The cursor refusal names resource `data-health` with *`cursor` must be a stock symbol.*
- No body contains the submitted value

#### Error / Edge Cases
- Valid cursor in lower case: normalised, accepted

### TC-COMP-052: Each handler delegates once and lets psycopg.Error propagate

**Scope:** component
**Component(s):** data-health-api
**Traces to:** AC-11, AC-21, DAC-E2-S4-3, DAC-E2-9
**Priority:** P1
**Type:** functional

#### Preconditions
- Reader functions mocked; `request.app.state.db_pool` stubbed

#### Steps
1. Call each of the three handlers
2. Make the reader raise `psycopg.Error`

#### Expected Result
- Each calls its reader once with one pooled connection and returns the value through `from_reader` unchanged
- The error propagates out of the handler uncaught

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-053: Validated parameters reach SQL only as bound values; no extra logging

**Scope:** component
**Component(s):** data-health-api
**Traces to:** AC-4, DAC-E2-S4-4
**Priority:** P2
**Type:** security

#### Preconditions
- Handler sources and the reader call site

#### Steps
1. Trace `limit` and `cursor` from the handler to the reader
2. Inspect logging in the handlers

#### Expected Result
- Only validated values are passed and bound as parameters (SEC-INP-001, SEC-INP-002)
- `credential_present` is a boolean; no handler logs beyond the delivered request-id stamping

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-274: FailureResponse serialises cause always, null included, and refuses a seventh value

**Scope:** component
**Component(s):** data-health-api
**Traces to:** AC-29, AC-30, DAC-E8-S7-1, DAC-E8-13
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_api_data_health_models.py`

#### Steps
1. Serialise a failure with each of the six causes
2. Serialise a failure with cause `None`
3. Construct a `FailureResponse` with cause `"throttled"` (outside the six)

#### Expected Result
- Step 1: the JSON carries that `cause`
- Step 2: `"cause": null` is present, not omitted
- Step 3 raises Pydantic's `ValidationError`

#### Error / Edge Cases
- `retryable` serialises as the reader passed it

### TC-COMP-275: The field check now includes failures[].cause

**Scope:** component
**Component(s):** data-health-api
**Traces to:** AC-24, DAC-E8-S7-2, DAC-E8-13
**Priority:** P1
**Type:** functional

#### Preconditions
- CAP-003-E2-S4's DAC-E2-S4-1 test (TC-COMP-050) after this story

#### Steps
1. Run it

#### Expected Result
- It asserts every system design §4.2 field present including `failures[].cause`
- Every other E2-S4 assertion passes unchanged

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-276: No route, parameter, status or other field changes; the API composes no fix

**Scope:** component
**Component(s):** data-health-api
**Traces to:** AC-17, AC-19, DAC-E8-S7-4, DAC-E8-13
**Priority:** P2
**Type:** security

#### Preconditions
- The routes and models after the story, compared with CAP-003-E2-S4 and E2-S6; the no-secrets test CAP-003-E2-S5 extends

#### Steps
1. Compare routes, query parameters, status codes, refusals and field names
2. Run the no-secrets test
3. Serialise a populated response and search it for a sentence or a fix

#### Expected Result
- Only `failures[].cause` is added; nothing else changed
- The no-secrets test passes
- No response carries a sentence or a fix; `cause` is domain vocabulary (DAC-E2-12, DEC-0200)

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-277: Every FailureResponse fixture and spelled-out failure body carries cause

**Scope:** component
**Component(s):** data-health-api
**Traces to:** AC-29, DAC-E8-S7-5, DAC-E8-13
**Priority:** P2
**Type:** functional

#### Preconditions
- CAP-003-E2-S4's `tests/unit/test_api_data_health_models.py` and `tests/unit/test_api_data_health_routes.py`, and CAP-003-E2-S6's `tests/integration/test_api_data_health.py`

#### Steps
1. Run `uv run pytest`
2. Search the three files for each `FailureResponse` constructed and each failure body spelled in full

#### Expected Result
- Each carries `cause`
- Every pre-existing assertion other than TC-COMP-275's field check passes unchanged

#### Error / Edge Cases
- None beyond the scenario
