---
artifact_schema_version: 1
artifact_id: CAP-002-classification-api-component-tests
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
    - id: CAP-002-component-design-classification-api
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# classification-api Component Test Specification

### TC-COMP-004: POST /api/universes uncovered symbol returns envelope naming all

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E1-S6-1, DAC-E1-1, AC-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `POST /api/universes` with symbols

#### Steps
1. Any is uncovered.

#### Expected Result
- The response is the error envelope naming the operation, the resource and every uncovered symbol, and nothing is written.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S6-1; no further cases are invented.

### TC-COMP-005: Out-of-bounds request rejected before the service is called

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E1-S6-4, AC-1
**Priority:** P1
**Type:** functional

#### Preconditions
- A request beyond the bounds in `classification_bounds.py`

#### Steps
1. It is validated.

#### Expected Result
- It is rejected before the service is called.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S6-4; no further cases are invented.

### TC-COMP-027: POST members with current member reports already_member in 200

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E1-S6-3, DAC-E1-6, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- `POST .../members` with a current member

#### Steps
1. It is called.

#### Expected Result
- `already_member` is reported in the 200 body, not as an error.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S6-3; no further cases are invented.

### TC-COMP-028: Universes router mounted behind middleware, ahead of static

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E1-S6-5, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- The application is built with `create_app()`

#### Steps
1. `GET /api/universes` is called through `TestClient`.

#### Expected Result
- The route is mounted behind the Host and Origin and request-id middleware and ahead of the static mount.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S6-5; no further cases are invented.

### TC-COMP-040: Service refusals map to documented status and code

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E1-S6-2, AC-5
**Priority:** P1
**Type:** security

#### Preconditions
- A refusal (`universe_name_in_use`, `last_member`, `universe_retired`, `empty_universe`, `classification_set_changed`, `instrument_not_acquired`)

#### Steps
1. It is raised by the service.

#### Expected Result
- Error mapping returns the documented status and code with no stack trace or credential in the body.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S6-2; no further cases are invented.

### TC-COMP-041: DELETE sole member returns last_member, writes nothing

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E1-S6-6, DAC-E1-7, AC-5, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- `DELETE .../members/{symbol}` on the sole member

#### Steps
1. Called.

#### Expected Result
- `last_member` is returned and nothing is written.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S6-6; no further cases are invented.

### TC-COMP-070: Cells serialise as decimal strings with restated_possible

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E3-S5-4, AC-9
**Priority:** P2
**Type:** functional

#### Preconditions
- A cell

#### Steps
1. Serialised.

#### Expected Result
- Scores and percentiles are decimal strings at stored precision and `restated_possible` is present.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S5-4; no further cases are invented.

### TC-COMP-086: Lifespan creates and cancels the classification task

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E3-S6-1, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The lifespan

#### Steps
1. The app starts.

#### Expected Result
- The classification task is created beside the reclaim task and both are cancelled on shutdown, with `CancelledError` swallowed as for the reclaim task.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S6-1; no further cases are invented.

### TC-COMP-087: Lifespan passes pool and ClassificationSettings to the scheduler

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E3-S6-2, AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- `test_api_classification_lifespan.py` with injected doubles

#### Steps
1. It runs.

#### Expected Result
- The scheduler coroutine is called with the pool and `ClassificationSettings()`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S6-2; no further cases are invented.

### TC-COMP-088: No-secrets test covers every new route

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E3-S6-3, DAC-E3-13, AC-10, AC-16
**Priority:** P1
**Type:** security

#### Preconditions
- Any universes or classifications route

#### Steps
1. The no-secrets test runs.

#### Expected Result
- No response or log contains a credential.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S6-3; no further cases are invented.

### TC-COMP-089: Only app.py and test_api_no_secrets.py changed, additively

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E3-S6-4, DAC-E3-13, AC-10, AC-16
**Priority:** P1
**Type:** security

#### Preconditions
- The edit

#### Steps
1. `git diff` is read.

#### Expected Result
- No delivered file other than `app.py` and `test_api_no_secrets.py` changed and no existing line is removed or reordered (AGT-SCOPE-002).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S6-4; no further cases are invented.

### TC-COMP-125: Compare outside 2 to 6 rejected before the reader

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E3-S5-2, DAC-E3-7, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- Compare with fewer than `MIN_COMPARE_SYMBOLS` (2) or more than `MAX_COMPARE_SYMBOLS` (6) symbols

#### Steps
1. Validated.

#### Expected Result
- The request is rejected before the reader is called.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S5-2; no further cases are invented.

### TC-COMP-126: Classification routes mounted behind middleware, ahead of static

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E3-S5-6, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- `create_app()`

#### Steps
1. The classification routes are called through `TestClient`.

#### Expected Result
- They are mounted behind the Host/Origin and request-id middleware and ahead of the static mount.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S5-6; no further cases are invented.

### TC-COMP-148: Unknown symbol on evidence returns documented error envelope

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E3-S5-5, AC-17
**Priority:** P2
**Type:** functional

#### Preconditions
- An unknown symbol on the evidence route

#### Steps
1. Called.

#### Expected Result
- The error envelope returns the documented code naming the operation and resource.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S5-5; no further cases are invented.

### TC-COMP-172: /summary routed to the summary handler

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E3-S5-1, AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- `GET /api/classifications/summary`

#### Steps
1. Called.

#### Expected Result
- It is routed to the summary handler, not captured by a path parameter.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S5-1; no further cases are invented.

### TC-COMP-173: List and summary share never_classified/set/later shape

**Scope:** component
**Component(s):** classification-api
**Traces to:** DAC-E3-S5-3, DAC-E3-11, AC-20, AC-22
**Priority:** P1
**Type:** functional

#### Preconditions
- No set exists

#### Steps
1. The list and the summary are read.

#### Expected Result
- Both carry the same `never_classified`, `set` and `later` shape.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S5-3; no further cases are invented.

