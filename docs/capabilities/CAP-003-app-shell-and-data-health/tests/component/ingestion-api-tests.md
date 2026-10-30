---
artifact_schema_version: 1
artifact_id: CAP-003-ingestion-api-tests
artifact_type: test-specification
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-30T02:26:09Z
  source_artifacts:
    - id: CAP-003
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-backlog
      version: "2"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# ingestion-api Component Test Specification

Component tests for `ingestion-api` (CAP-003). Each case verifies one story-level or epic-level derived acceptance criterion within a unit test harness for the FactorFlow-v2 repository; IDs are assigned in AC-ID order across every component file, so this file holds 2 cases (TC-COMP-054 to TC-COMP-055, not necessarily contiguous).

### TC-COMP-054: app.py changes by one import and one include_router line only

**Scope:** component
**Component(s):** ingestion-api
**Traces to:** AC-17, DAC-E2-S5-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The story's diff of `src/factorflow/api/app.py`

#### Steps
1. Read the diff
2. Run `tests/integration/test_api_static_mount.py` and `tests/unit/test_api_host_origin.py`

#### Expected Result
- Only the import and the `include_router(data_health.router)` line change
- Both delivered tests pass unchanged

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-055: No-secrets test: the three routes answer 200 without the key's value

**Scope:** component
**Component(s):** ingestion-api
**Traces to:** AC-4, DAC-E2-S5-2, DAC-E2-13
**Priority:** P1
**Type:** security

#### Preconditions
- `FACTORFLOW_MASSIVE_API_KEY` set to a known value; reader stubbed; pool replaced by a stub

#### Steps
1. Build `create_app` and GET each of the three routes
2. Measure the request time
3. Search `response.text` for the value

#### Expected Result
- Each answers `200` without a database and without waiting on the pool's 30 s checkout
- The value is absent from every body

#### Error / Edge Cases
- None beyond the scenario
