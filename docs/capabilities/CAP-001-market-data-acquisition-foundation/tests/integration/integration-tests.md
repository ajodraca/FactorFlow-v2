---
artifact_schema_version: 1
artifact_id: CAP-001-integration-tests
artifact_type: test-specification
artifact_version: 2
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-10-10
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.296"
  timestamp: 2026-10-10T07:05:00Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-E3-S6
      version: "3"
    - id: CAP-001-E3-S7
      version: "3"
    - id: CAP-001-E5-S1
      version: "2"
    - id: CAP-001-component-design-massive-client
      version: "12"
    - id: CAP-001-component-design-runtime-config
      version: "11"
    - id: CAP-001-component-design-acquisition-runner
      version: "8"
    - id: CAP-001-component-design-market-data-store
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Integration Test Specification

### TC-INT-001: GET /api/instruments contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Call the loopback GET endpoint with its documented filters and cursor; verify the 200 response exposes instruments, active/retired counts, and a next cursor.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-002: POST /api/instruments contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- POST a valid symbol list; verify the 201 response separates added, reactivated, and rejected entries.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-003: POST /api/instruments duplicate or malformed input

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** DAC-E2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- POST an all-duplicate list and an all-malformed list; verify 409 and 422 respectively using the shared error envelope.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-004: DELETE /api/instruments/{symbol} contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-21
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- DELETE an active symbol; verify the 200 response records retirement and a retirement timestamp.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-005: DELETE /api/instruments/{symbol} errors

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** DAC-E2-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- DELETE an unknown and an already-retired symbol; verify 404 and 409 with distinct owner-facing outcomes.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-006: GET /api/settings/history-depth contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Call the endpoint before a depth is set; verify 200 and years is null.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-007: PUT /api/settings/history-depth contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- PUT a positive whole-year depth; verify 200 returns the saved value and update timestamp.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-008: PUT /api/settings/history-depth validation

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** DAC-E2-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- PUT a non-positive or non-integer depth; verify 422 through the shared error envelope.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-009: POST /api/acquisition-runs contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-23
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- POST while a run is active; verify 202 requested state and queued_behind without concurrent execution.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-010: POST /api/acquisition-runs prerequisite refusals

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-24
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- POST with history depth unset and with no active instruments; verify deterministic 409 refusal and no run record.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-011: GET /api/acquisition-runs contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-9
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Call with state, limit, and cursor; verify reverse-chronological run records and next cursor.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-012: GET /api/acquisition-runs/{id} contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Call for an existing run; verify its counts and per-instrument, per-data-type result data.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-013: GET /api/acquisition-runs/{id} unknown run

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Call with an unknown id; verify 404 in the shared error envelope.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-014: POST /api/acquisition-runs/{id}/cancel running contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Cancel a running run; verify 202 cancelling state, without claiming immediate cancellation.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-015: POST /api/acquisition-runs/{id}/cancel queued contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-26
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Cancel a requested run; verify 202 cancelled state and that the active run is unaffected.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-016: POST /api/acquisition-runs/{id}/cancel error paths

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** DAC-E5-9
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Cancel a terminal and an unknown run; verify 409 with actual state and 404 respectively.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-017: GET /api/coverage contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Call with documented filters, range bounds, limit, and cursor; verify coverage rows, presence, range, last-acquired, and gap availability.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-018: GET /api/coverage invalid bounds

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** DAC-E6-S3-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Call with from later than to; verify 422 rather than a silent result.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-019: GET /api/coverage limit bound

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** DAC-E6-S3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Call above the canonical limit; verify 422 rather than silent clamping.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-020: GET /api/health contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-18
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Call the loopback health endpoint; verify liveness, database reachability, credential presence boolean, schema version, and recent run data.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-021: Massive reference-data HTTPS contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api, massive-client, Massive REST API
**Traces to:** AC-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Issue the documented Massive reference request through massive-client; verify the response is mapped into the acquisition contract.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-022: Massive daily-prices HTTPS contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api, massive-client, Massive REST API
**Traces to:** AC-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Issue the documented daily-aggregate request through massive-client; verify price observations are returned to the caller.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-023: Massive fundamentals HTTPS contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api, massive-client, Massive REST API
**Traces to:** AC-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Issue the documented fundamentals request through massive-client; verify the response maps into observations.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-024: Massive corporate-actions HTTPS contract

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api, massive-client, Massive REST API
**Traces to:** AC-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Issue the documented corporate-actions request through massive-client; verify the response maps into observations.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-025: Massive not-found and rate-limit propagation

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api, massive-client, Massive REST API
**Traces to:** AC-11, DAC-E3-2, DAC-E3-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Return provider 404 and 429 responses; verify not-found is isolated and 429 is paced rather than counted as an attempt.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-026: Massive timeout and server-error propagation

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api, massive-client, Massive REST API
**Traces to:** DAC-E3-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The documented external-protocol endpoint is available with controlled contract fixtures.

#### Steps
1. Send the documented HTTP or HTTPS request at the protocol boundary.
2. Observe only its response, status, and documented externally visible side effects.

#### Expected Result
- Return timeout and 5xx responses until the configured attempt limit; verify bounded retry and per-instrument failure propagation.

#### Error / Edge Cases
- The response is asserted at the protocol boundary; component internals are not inspected.

### TC-INT-027: E2E acquisition stack reaches the loopback Massive stub

**Scope:** integration
**Component(s):** ingestion-api, acquisition-runner, massive-client, Massive REST API (DEC-0025 loopback stub)
**Traces to:** DAC-E3-S7-14
**Priority:** P1
**Type:** functional

#### Preconditions
- CAP-001-E3-S6 and CAP-001-E3-S7 are both applied (landing rule).
- The stack is started by `scripts/run-e2e-server.sh`, which serves the acquisition API on port 8125 and the DEC-0025 stub on `127.0.0.1:8126`, with a provider key generated for the run.
- The acquisition stack has a stated history depth and at least one active instrument the stub's fixtures cover.

#### Steps
1. Wait until `GET /api/health` on port 8125 answers.
2. Confirm the acquisition ingestion process started by the script is still running.
3. Send `POST /api/acquisition-runs` to port 8125.
4. Poll `GET /api/acquisition-runs/{id}` on port 8125 until the run is terminal.
5. Read the requests the stub on `127.0.0.1:8126` received.

#### Expected Result
- After health answers, the ingestion process is still running rather than having refused to start.
- The stub received the run's provider `GET` requests on `127.0.0.1:8126`.
- The run reaches a terminal state, so the acquisition E2E journeys run against the stub (`runtime-config` section 14 item 4).

#### Error / Edge Cases
- With CAP-001-E3-S6 applied alone, the ingestion process refuses to start on `http://127.0.0.1:8126`; this case then fails at step 2, which is the breakage the landing rule prevents.
