---
artifact_schema_version: 1
artifact_id: CAP-002-classification-scheduler-component-tests
artifact_type: test-specification
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T18:38:08Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "3"
    - id: CAP-002-backlog
      version: "4"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# classification-scheduler Component Test Specification

### TC-COMP-077: Only succeeded and partial runs are claimed

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S8-1, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- Runs in `failed`, `cancelled`, `abandoned`, `running` or `requested`

#### Steps
1. Claims are attempted.

#### Expected Result
- None is claimed; `succeeded` and `partial` are.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S8-1; no further cases are invented.

### TC-COMP-078: Qualifying runs claimed in ended_at order, once each

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S8-2, DAC-E2-4, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- Three qualifying runs

#### Steps
1. Claimed over three iterations.

#### Expected Result
- They are claimed in `ended_at` order and a run with a set is never claimed again.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S8-2; no further cases are invented.

### TC-COMP-079: Claim while a set is building returns None

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S8-3, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- A set `building`

#### Steps
1. A claim is attempted.

#### Expected Result
- It returns `None` and inserts nothing.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S8-3; no further cases are invented.

### TC-COMP-080: Claim at 23:30 Chicago stamps the Chicago date

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S8-4, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- A claim at 23:30 America/Chicago

#### Steps
1. The set is stamped.

#### Expected Result
- The classification date is the Chicago date, not the next UTC date (STD-UI-5).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S8-4; no further cases are invented.

### TC-COMP-081: Failed set for run A does not block later run B

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S8-5, DAC-E2-4, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- A `failed` set for run A

#### Steps
1. Claims continue.

#### Expected Result
- No new set is created for A while a later qualifying run B is claimed.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S8-5; no further cases are invented.

### TC-COMP-082: Invalid poll interval settings fail naming the variable

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S8-7, AC-10
**Priority:** P1
**Type:** non-functional

#### Preconditions
- `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS=0.5` or a poll interval not less than the timeout

#### Steps
1. Settings load.

#### Expected Result
- They fail naming the variable and not its value.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S8-7; no further cases are invented.

### TC-COMP-083: Loop claims and builds via dispatcher; idle waits poll interval

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S9-1, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- Injected `wait_fn`, `dispatch_fn` and `stop_event`

#### Steps
1. The loop runs under `asyncio.run`.

#### Expected Result
- Claim and build go through the dispatcher and idle iterations wait the poll interval.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S9-1; no further cases are invented.

### TC-COMP-084: Raising claim is logged and the loop continues

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S9-2, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- A raising claim

#### Steps
1. The loop iterates.

#### Expected Result
- The exception is logged with `exception` and the loop continues (OPS-ERR-001).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S9-2; no further cases are invented.

### TC-COMP-085: ingestion_main imports nothing from classification

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S9-5, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- `factorflow.ingestion_main`

#### Steps
1. Imports are inspected.

#### Expected Result
- It imports nothing under `factorflow.classification`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S9-5; no further cases are invented.

### TC-COMP-092: Short build timeout reaches the engine and fails the set

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S9-4, AC-11
**Priority:** P1
**Type:** functional

#### Preconditions
- `build_timeout_seconds` too short for the store

#### Steps
1. The loop builds.

#### Expected Result
- The timeout reaches the engine and the set is `failed` with a timeout reason.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S9-4; no further cases are invented.

### TC-COMP-168: reclaim_interrupted_sets fails stale building sets only

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S8-6, DAC-E2-12, AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- A `building` row with no classification rows

#### Steps
1. `reclaim_interrupted_sets` runs.

#### Expected Result
- It becomes `failed` with the fixed interruption reason and the next qualifying run is claimable; `complete` and `failed` sets are unchanged.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S8-6; no further cases are invented.

### TC-COMP-169: Reclaim runs once before the first claim

**Scope:** component
**Component(s):** classification-scheduler
**Traces to:** DAC-E2-S9-3, DAC-E2-12, AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- Loop start

#### Steps
1. It begins.

#### Expected Result
- `reclaim_interrupted_sets` is dispatched before the first claim and never again.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S9-3; no further cases are invented.

