---
artifact_schema_version: 1
artifact_id: CAP-001-integration-tests-automation-tasks
artifact_type: automation-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-09
updated: 2026-09-09
ai_provenance:
  agent_id: automation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-09T00:00:00Z
  source_artifacts:
    - id: CAP-001-integration-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Tasks: Integration Tests

**Test Specification:** `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests.md`
**Component(s):** FactorFlow-v2 application and ingestion process; Massive is an external dependency
**Test Scope:** integration
**Branch:** `main`
**Date:** 2026-09-09

## Summary

Automate the 26 CAP-001 integration cases with pytest, FastAPI's `TestClient`,
httpx, and the existing PostgreSQL-container fixture. The API tests run against
the loopback JSON surface; provider tests mock the Massive HTTPS boundary. Do not
write into Massive or call its live service.

## Test Case Traceability

| TC IDs | Tasks |
|---|---|
| TC-INT-001–005 | T003 |
| TC-INT-006–008 | T004 |
| TC-INT-009–016 | T005 |
| TC-INT-017–019 | T006 |
| TC-INT-020 | T007 |
| TC-INT-021–026 | T008 |

## Test Infrastructure

**Framework:** pytest with FastAPI `TestClient`; PostgreSQL tests are marked
`postgres`.
**Tools:** httpx, psycopg, testcontainers[postgres], pytest monkeypatch.
**Environment:** Use the existing session-scoped PostgreSQL 16 container and
per-test database fixture in `tests/conftest.py`. Provider responses must be
controlled at the Massive-client HTTP boundary.

## Phase 1: Test Infrastructure Setup

**Purpose:** Extend the existing integration-test fixtures only where API routes
need a migrated database and controlled provider responses.

- [ ] T001 Create reusable migrated-database and API-client fixtures in `tests/integration/conftest.py` using the existing `postgres_connection_string` pattern in `tests/conftest.py` (supports TC-INT-001–020).
- [ ] T002 [P] Create controlled Massive HTTP response fixtures in `tests/integration/conftest.py`, without network access or provider credentials (supports TC-INT-021–026).

**Checkpoint:** API and provider-boundary tests can create isolated state and
deterministic responses without modifying shared fixture behavior.

## Phase 2: Test Utilities & Fixtures

**Purpose:** Provide the isolated database, API-client, and provider-response
fixtures required by the integration cases.

**Checkpoint:** Shared fixtures are importable without changing production code.

## Phase 3: Test Implementation

**Purpose:** Add protocol-boundary assertions grouped by the API resource and
provider contract.

- [ ] T003 Implement TC-INT-001–005 in `tests/integration/test_api_instruments.py` (depends on T001).
- [ ] T004 [P] Implement TC-INT-006–008 in `tests/integration/test_api_history_depth.py` (depends on T001).
- [ ] T005 [P] Implement TC-INT-009–016 in `tests/integration/test_api_acquisition_runs.py` (depends on T001).
- [ ] T006 [P] Implement TC-INT-017–019 in `tests/integration/test_api_coverage.py` (depends on T001).
- [ ] T007 [P] Extend `tests/integration/test_api_health.py` for TC-INT-020, preserving its existing reachable/unreachable database coverage (depends on T001).
- [ ] T008 Implement TC-INT-021–026 in `tests/integration/test_massive_client_contracts.py` (depends on T002).

**Checkpoint:** Every integration test ID has an isolated automated assertion at
its declared HTTP or HTTPS protocol boundary.

## Phase 4: Test Validation & Cleanup

**Purpose:** Verify scoped behavior, database isolation, and project checks.

- [ ] T009 Run `uv run pytest tests/integration -m postgres` from the repository root and fix only failures in files introduced by T001–T008 (validates TC-INT-001–026).
- [ ] T010 Run `uv run ruff check .`, `uv run ruff format --check .`, and `uv run mypy src` from the repository root (validates T001–T008).

**Checkpoint:** All 26 planned integration cases pass; the test suite leaves no
database state outside its per-test database.

## Dependencies & Execution Order

### Task Dependencies

- T001 and T002 have no dependencies.
- T003–T007 depend on T001; T008 depends on T002.
- T009 depends on T003–T008; T010 depends on T009.

### Parallel Opportunities

- T001 and T002 may proceed in parallel.
- T003–T008 may proceed in parallel once their listed fixture task completes.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Test-Specific Validation

- Scoped suite: `uv run pytest tests/integration -m postgres`
- Expected result: all 26 CAP-001 integration cases pass.
- The Massive contract tests use controlled HTTP responses; do not consume the
  provider rate budget or use a live credential.

## Notes

- Existing production code currently provides the API foundation and health
  route, while the other declared CAP-001 resource routes may land through
  stories in parallel. T003–T008 are implementation tasks for automation only
  after their corresponding routes and Massive client exist; they must not
  create application behavior as a substitute.
- `tests/conftest.py` is the established PostgreSQL isolation mechanism and
  must remain the single owner of container lifecycle and per-test database
  cleanup.
