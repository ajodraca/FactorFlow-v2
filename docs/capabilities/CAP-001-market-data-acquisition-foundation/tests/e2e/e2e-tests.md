---
artifact_schema_version: 1
artifact_id: CAP-001-e2e-tests
artifact_type: test-specification
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-06
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-06T00:00:00Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# End-to-End Test Specification

### TC-E2E-001: First acquisition succeeds

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-1, AC-2, AC-3, AC-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The product is running with a provider credential supplied from the environment.

#### Steps
1. Open Settings, state the required history depth, add named instruments.
2. start acquisition. Refresh the Coverage view..

#### Expected Result
- The owner sees the named instruments with all four data types and their acquired date ranges.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-002: First acquisition reports provider failure

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-9, AC-10, AC-12
**Priority:** P1
**Type:** functional

#### Preconditions
- The product is running with an invalid credential or unavailable provider.

#### Steps
1. State history depth, add named instruments, start acquisition, then open Runs and the affected run..
2. Observe the visible result.

#### Expected Result
- The owner sees a failed or partial outcome with the affected instrument, data type, and reason; coverage does not appear complete.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-003: Coverage is fit to rely on

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-7, AC-8
**Priority:** P1
**Type:** functional

#### Preconditions
- At least two named instruments have acquired daily-price data.

#### Steps
1. Open Coverage and inspect data-type presence, date ranges, last-acquired times.
2. missing-day indicators..

#### Expected Result
- The owner can distinguish complete coverage from gaps and can open specific missing dates.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-004: Coverage reports no acquired data honestly

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-17
**Priority:** P1
**Type:** functional

#### Preconditions
- No acquisition has completed.

#### Steps
1. Open Coverage..
2. Observe the visible result.

#### Expected Result
- The owner sees explicit copy that no data has been acquired, not an empty healthy-looking table.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-005: Failed acquisition is diagnosed and recovered

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-6, AC-9, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- A prior run is failed or partial and its cause is corrected.

#### Steps
1. Open Runs, open the failed or partial run, inspect its failure detail.
2. start another run..

#### Expected Result
- The new run completes; the owner sees updated coverage without duplicated or overwritten prior data.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-006: Unknown instrument does not stop recovery

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-11
**Priority:** P1
**Type:** functional

#### Preconditions
- The named list includes an instrument the provider does not recognise and another it does.

#### Steps
1. Start acquisition, open the completed run, then open Coverage..
2. Observe the visible result.

#### Expected Result
- The owner sees the unrecognised instrument and reason while the recognised instrument has acquired coverage.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-007: Run is cancelled while in progress

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- An acquisition run is visibly under way.

#### Steps
1. Open its run detail, request cancellation.
2. refresh the run and coverage views..

#### Expected Result
- The owner sees cancelling and then cancelled; coverage already obtained remains, and unreached instruments have no new coverage.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-008: Cancellation races completed run

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- A run completes before the owner’s cancellation request is processed.

#### Steps
1. Request cancellation from the run detail after it has completed..
2. Observe the visible result.

#### Expected Result
- The owner is told that the run completed rather than being shown a cancellation that did not happen.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-009: Instrument is added after initial acquisition

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-1, AC-3, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- Existing active instruments already have coverage.

#### Steps
1. Add a new instrument, start acquisition.
2. open Coverage..

#### Expected Result
- The new instrument is populated to the stated depth while previously covered instruments are not disturbed.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-010: Retired instrument remains visible

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-21, AC-25
**Priority:** P1
**Type:** functional

#### Preconditions
- An instrument has coverage and a run is under way or will be started later.

#### Steps
1. Retire the instrument, inspect Coverage, then start a later run..
2. Observe the visible result.

#### Expected Result
- The owner sees retained coverage marked retired; it remains in the active run’s scope if already started and is not acquired in the later run.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-011: Product starts and reports health

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-13, AC-14, AC-15, AC-18
**Priority:** P1
**Type:** functional

#### Preconditions
- A deployable product version and an existing compatible data store are available.

#### Steps
1. Start the product with runtime environment values, open the owner interface on loopback.
2. inspect its status region..

#### Expected Result
- The interface is reachable locally only and visibly reports that the product is answering plus the most recent run outcome.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.

### TC-E2E-012: Inconsistent store prevents unsafe start

**Scope:** e2e
**Component(s):** owner-web-app, ingestion-api, instrument-list-service, run-journal, coverage-service, acquisition-runner, massive-client, observation-writer, market-data-store
**Traces to:** AC-16
**Priority:** P1
**Type:** functional

#### Preconditions
- The data store cannot be brought forward to the product version.

#### Steps
1. Start the product and open an already available owner-interface bundle..
2. Observe the visible result.

#### Expected Result
- The owner sees a named unavailable state explaining that the product did not start; no API surface is available to serve or write data.

#### Error / Edge Cases
- The journey asserts only owner-visible behavior and interface responses.


