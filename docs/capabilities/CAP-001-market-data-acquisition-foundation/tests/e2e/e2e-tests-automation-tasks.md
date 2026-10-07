---
artifact_schema_version: 1
artifact_id: CAP-001-e2e-tests-automation-tasks
artifact_type: automation-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-09
updated: 2026-10-07
ai_provenance:
  agent_id: automation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-09T00:00:00Z
  source_artifacts:
    - id: CAP-001-e2e-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Tasks: E2E Tests

**Test Specification:** `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md`
**Component(s)**: `FactorFlow-v2`
**Test Scope:** e2e
**Branch:** `main`
**Date:** 2026-09-09

## Summary

Automate the 12 owner-visible CAP-001 journeys with Playwright, which is already
declared in `package.json` but has no checked-in E2E configuration or tests.
Reuse the React application's `web/src/app` conventions for selectors and
use deterministic API/provider fixtures; no journey may call the live provider.

## Test Case Traceability

| TC IDs | Tasks |
|---|---|
| TC-E2E-001–002 | T004 |
| TC-E2E-003–004 | T005 |
| TC-E2E-005–008 | T006 |
| TC-E2E-009–010 | T007 |
| TC-E2E-011–012 | T008 |

## Test Infrastructure

**Framework:** Playwright (`@playwright/test`), already listed in
`package.json`.
**Existing application tests:** Vitest tests reside beside components under
`web/src/app/`; no browser-test structure exists yet.
**Environment:** A locally served web application, API fixtures, PostgreSQL
state supplied by the existing Python test infrastructure, and controlled
Massive responses.

## Phase 1: Test Infrastructure Setup

**Purpose:** Create the browser-test configuration and a deterministic local
environment without changing production behavior.

- [ ] T001 Create `web/playwright.config.ts` with the local Vite web-server command, a single Chromium project, and the `web/e2e` test directory (supports TC-E2E-001–012).
- [ ] T002 Create `web/e2e/fixtures.ts` with owner-browser setup, API-state setup, and controlled-provider-response helpers (supports TC-E2E-001–012).

**Checkpoint:** `npm run test:e2e` can discover a browser suite against a
local, deterministic application.

## Phase 2: Test Utilities & Fixtures

**Purpose:** Make the six owner journeys reproducible without live credentials
or provider calls.

- [ ] T003 Create `web/e2e/fixtures.ts` helpers for no-data, acquired-data, failed-run, running-run, and migration-refusal states (supports TC-E2E-001–012).

**Checkpoint:** Each E2E test can arrange its externally visible precondition
through test infrastructure rather than implementation internals.

## Phase 3: Test Implementation

**Purpose:** Implement externally observable owner journeys.

- [ ] T004 Implement TC-E2E-001–002 in `web/e2e/first-acquisition.spec.ts` (depends on T001–T003).
- [ ] T005 [P] Implement TC-E2E-003–004 in `web/e2e/coverage.spec.ts` (depends on T001–T003).
- [ ] T006 [P] Implement TC-E2E-005–008 in `web/e2e/run-lifecycle.spec.ts` (depends on T001–T003).
- [ ] T007 [P] Implement TC-E2E-009–010 in `web/e2e/instrument-lifecycle.spec.ts` (depends on T001–T003).
- [ ] T008 [P] Implement TC-E2E-011–012 in `web/e2e/startup-and-health.spec.ts` (depends on T001–T003).

**Checkpoint:** All 12 journeys execute only browser-visible actions and
assertions.

## Phase 4: Test Validation & Cleanup

**Purpose:** Verify browser-test reliability, isolation, and project checks.

- [ ] T009 Run `npm run test:e2e` from the repository root and repair only the E2E automation files created in T001–T008.
- [ ] T010 Run `npm run build`, `npm run test`, `npm run lint`, `npm run format`, and `npx tsc --noEmit` from the repository root.

**Checkpoint:** The E2E suite passes with no live provider request and leaves no
test data outside its isolated environment.

## Dependencies & Execution Order

T002 depends on T001; T003 depends on T002; T004–T008 depend on T001–T003 and
can run in parallel by file; T009 depends on T004–T008; T010 depends on T009.

## Validation Plan

- Build: `npm run build`
- Unit/component tests: `npm run test`
- E2E suite: `npm run test:e2e`
- Lint: `npm run lint`
- Format: `npm run format`
- Type check: `npx tsc --noEmit`
- Expected result: all 12 CAP-001 E2E cases pass.

## Notes

- `package.json` exposes `test:e2e`, but no Playwright configuration or
  browser tests are checked in yet; T001 supplies that missing infrastructure.
- The specified owner-interface screens and several API resources must exist
  before their corresponding browser tests can be implemented. Automation work
  must not create those product behaviors.
