---
artifact_schema_version: 1
artifact_id: CAP-001-component-design-ingestion-api
artifact_type: component-design
artifact_version: 6
status: approved
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-05
updated: 2026-09-06
ai_provenance:
  agent_id: design-decomposition-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-05T05:20:00Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-ux-design
      version: "5"
    - id: tech-stack
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
approval:
  approval_policy: owner-allowed
  approved_by: "Alvaro de Jodra"
  approved_at: 2026-09-06T02:00:00Z
  reviewed_revision: sha256:5fb48327ab7a372e262486ea291f2a67744b44ac75bf228e165b2cc68fe693f2
  review_artifact: "docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v3.md"
---

# Component: Ingestion API

**Status:** draft
**Capability:** CAP-001
**Owner:** Alvaro de Jodra
**Last Updated:** 2026-09-05

## 1. Overview

The FastAPI application serving the owner interface: nine JSON HTTP operations
across seven paths, plus the built React bundle, bound to loopback, with no authentication. It is the
only network entry point in the capability and the only component the browser
can reach. It never calls Massive and never blocks on a provider request, which
is what keeps the provider's failure modes out of the interface (C1, system
design constraint 5.1).

The API is thin by design. It validates requests, delegates to
`instrument-list-service`, `run-journal` and `coverage-service`, and shapes
responses. It holds no acquisition logic and no coverage arithmetic of its own.

Use cases addressed:

- Name, list and retire instruments, including bulk entry (AC-1, AC-21).
- State the history depth and read it back (AC-2).
- Request an acquisition run, which queues rather than blocks (AC-23).
- List runs and open one, with per-instrument failure detail (AC-9, AC-10,
  AC-11).
- Request cancellation of a run in progress (AC-19).
- Read coverage, gaps and the never-acquired empty state (AC-7, AC-8, AC-17).
- Report liveness, credential presence and the most recent run outcome (AC-18).

Support matrix: one uvicorn worker in the application container, bound to
`127.0.0.1`, published to the host loopback only. One browser client, one owner.

Dependencies: FastAPI, Starlette, Pydantic, uvicorn, `psycopg` 3 connection
pool, and the three services it delegates to. It depends on `schema-migrator`
having exited zero before it binds.

## 2. Design Details

### 2.1 Placement

```
src/factorflow/api/app.py                  application factory, lifespan, middleware
src/factorflow/api/routes/instruments.py
src/factorflow/api/routes/settings.py
src/factorflow/api/routes/runs.py
src/factorflow/api/routes/coverage.py
src/factorflow/api/routes/health.py
src/factorflow/api/models.py               Pydantic request and response models
src/factorflow/api/errors.py               the error envelope and handlers
src/factorflow/api/static/                 Vite build output, served as the SPA
src/factorflow/app_main.py                 uvicorn entrypoint
```

### 2.2 Request handling flow

The diagram below traces the two request shapes that matter, because the
capability's interface is almost entirely one of them or the other. A read is
synchronous end to end: the route validates, the service queries PostgreSQL, and
the response is shaped. A run request is not: the route records a `requested`
row and returns `202 Accepted` immediately, so the browser has a run identifier
before any provider call has been made and never waits on Massive. The decision
point that carries AC-23 is inside `run-journal`, which inserts a `requested`
row whether or not another run is active, leaving the FIFO claim to the runner.
The expected outcome is that no request handler in this component can block on
anything slower than a local PostgreSQL query.

```mermaid
sequenceDiagram
    participant W as owner-web-app
    participant A as ingestion-api
    participant S as instrument-list-service /<br/>coverage-service
    participant J as run-journal
    participant DB as market-data-store

    rect rgb(240,240,240)
    Note over W,DB: Read path, synchronous
    W->>A: GET /api/coverage?symbol=&lifecycle=
    A->>A: validate query model
    S->>DB: SELECT coverage, gaps
    A->>S: delegate
    DB-->>S: rows
    S-->>A: coverage view
    A-->>W: 200 with rows and gap availability
    end

    rect rgb(240,240,240)
    Note over W,DB: Write path, never blocking on the provider
    W->>A: POST /api/acquisition-runs
    A->>A: check history depth is set
    alt Depth not set
        A-->>W: 409 history_depth_not_set
    else Depth set
        A->>J: create requested run
        J->>DB: INSERT acquisition_run (state='requested')
        DB-->>J: run id
        J-->>A: run id, queued_behind
        A-->>W: 202 Accepted, run id, state
    end
    end
```

### 2.3 Error envelope

Every non-2xx response carries the same body, so the interface has one shape to
render and STD-UI-19's three parts, operation, resource and reason, always have
somewhere to come from.

```json
{
  "error": {
    "code": "history_depth_not_set",
    "message": "History depth is not set. Set it in Settings before acquiring.",
    "resource": "acquisition-run",
    "request_id": "0f2f1c2e-9a44-4f0f-9f1e-2b7b0d0f1a55"
  }
}
```

`code` is a stable snake_case identifier the interface may branch on. `message`
is owner-facing prose. `request_id` is generated per request by middleware and
included in every log record for that request, which is what makes a reported
failure findable in the container log.

The messages are owner-facing and detailed because the interface is loopback
only and its single user is the operator. SEC-ERR-001 requires that internal
detail not reach external clients; there is no external client here, and the
boundary the rule protects is the one the deployment closes. Stack traces and
driver messages are still never returned: a `500` returns
`{"code": "internal_error", "request_id": ...}` and the detail goes to the log.

### 2.4 Endpoint semantics

The full contract is in section 11. Three behaviours need more than a table row.

**Bulk instrument add.** `POST /api/instruments` accepts
`{"symbols": [...]}` for both the single-field add and the *Add many* region the
UX design specifies in section 1.2. The response reports a disposition per
symbol rather than failing the batch, because the UX design requires that
rejected entries never discard accepted ones. Status is `201` when at least one
symbol was added or reactivated, `409` when every symbol was rejected as a
duplicate of an active instrument, and `422` when every symbol was malformed.

**Run request.** `POST /api/acquisition-runs` returns `202` with the run
identifier and `queued_behind`, the identifier of the active run when one
exists and `null` otherwise. The interface uses it to render *A run is in
progress. This will start when it finishes.* The endpoint never rejects a
request because a run is active; that would contradict AC-23.

It does reject two preconditions, both `409` and both nothing to do with
concurrency: `history_depth_not_set` when no depth has been stated (AC-2), and
`no_active_instruments` when the roster holds no active instrument (AC-24,
system design constraint 5.18). Both create no run. The distinction worth
holding is that a queued run is a run the product will do later, whereas these
two are requests it can never satisfy as asked, so recording them as runs would
put rows in the journal that never had work to do.

**Cancelling a queued run.** `POST /api/acquisition-runs/{id}/cancel` accepts a
run in `requested` as well as one `running` (AC-26, constraint 5.20). A
`requested` run moves directly to `cancelled` and is never claimed; a `running`
run moves to `cancelling` and stops cooperatively. Both return `202` with the
resulting state, so the interface renders the difference from the response
rather than by knowing which case it asked for.

**Cancellation.** `POST /api/acquisition-runs/{id}/cancel` returns `202` and
state `cancelling` when the run was `running`, and `409` with code
`run_already_terminal` and the run's actual state when it was not. The `409`
is what the UX design's *This run had already completed.* renders, and it is
the reason the endpoint reports the state rather than only refusing.

### 2.4a Request bounds: the canonical set

Every bound the API validates is declared here and nowhere else, so the request
models, the store's check constraints and the interface's own client-side limits
cannot drift apart. Set by owner decision on 2026-09-05.

These are **API contract constants, not deployment settings.** They are literals
in `api/bounds.py` rather than environment variables, because changing one
changes what the interface may send and what a stored value may be — a contract
change belonging to a capability revision, not to a deployment.

| Bound | Value | Applies to | Why |
|-------|-------|-----------|-----|
| `MAX_HISTORY_DEPTH_YEARS` | 50 | `PUT /api/settings/history-depth` | A sanity bound against typos, not plan enforcement. Comfortably beyond Massive's deepest tier — Advanced reaches back to September 2003, so about 23 years — so it never constrains a legitimate request on any plan |
| `MIN_HISTORY_DEPTH_YEARS` | 1 | as above | Already enforced by the store's `acquisition_run_depth_positive` constraint; restated here so the API rejects before the store has to |
| `DEFAULT_PAGE_SIZE` | 50 | every paginated endpoint | Fills a virtualised viewport with room to scroll |
| `MAX_PAGE_SIZE` | 500 | every paginated endpoint | Bounds one response payload. At 3000 instruments the coverage set spans about 60 pages at the default and 6 at the maximum |
| `MAX_SYMBOLS_PER_REQUEST` | 1000 | `POST /api/instruments` | Bounds request size and the per-symbol validation loop. Adding the full 3000-instrument universe takes three requests. **This is a cap on one request, not on the list** — no maximum instrument count exists, per the `instrument-list-service` design |

**History depth is bounded but not plan-validated.** The owner decided on
2026-09-05 that a stated depth beyond the provider plan's reach is issued as
stated and the provider returns what it holds — recorded in the tech stack's
provider evaluation. `MAX_HISTORY_DEPTH_YEARS` therefore exists to reject
`9999`, not to reject `10` on a five-year plan. The two rules are independent
and both hold: the API refuses the absurd, and the plan silently truncates the
merely optimistic.

**The coverage range defaults to everything acquired.** When `from` and `to` are
omitted from `GET /api/coverage`, the service derives the range per instrument
from its own coverage segments rather than applying a default window. This is
the load-bearing choice of the four, because gap detection is computed only
*inside* the requested range: a default trailing window would compute gaps over
that window alone and render a healthy screen while older gaps sat outside it,
which is the false negative AC-8 and AC-17 exist to prevent. Omitting the range
therefore means "everything you hold", which is also the question AC-7 asks.

### 2.5 Serving the interface bundle

The Vite build writes to `src/factorflow/api/static/`. The API mounts it with
Starlette's `StaticFiles` at `/`, after the `/api` routes, with an SPA fallback
that returns `index.html` for any unmatched non-API path so client-side routing
works on reload. Requests under `/api` never fall through to the bundle; an
unknown API path returns the error envelope with code `not_found`.

### 2.6 Messages

N/A, not applicable for this component. No broker, topic or queue. The interface
learns of run completion by polling, per the UX design's 10-second run poll and
30-second health poll.

## 3. Constraints and Assumptions

- **Loopback only, no authentication** (AC-14, system design constraint 5.11).
  uvicorn binds `FACTORFLOW_API_HOST`, defaulted to `127.0.0.1`, and the compose
  file publishes the port to `127.0.0.1` only. No endpoint assumes an
  authenticated principal, and no session, cookie or token exists, so a later
  capability adding authentication adds it rather than retrofitting around an
  assumption.
- **The API never calls the provider** (C1). No route imports `massive-client`.
  A repository test asserts this, because the constraint is architectural and
  easy to break with one convenient import.
- **The API never blocks on a run.** `POST /api/acquisition-runs` returns before
  any acquisition work happens.
- **The API binds only after migration succeeds** (AC-16). Enforced by the
  container entrypoint, not by the API.
- **Coverage is read, never computed here.** `coverage-service` owns the
  arithmetic; the API shapes its output.
- **Assumption: one browser client.** No rate limiting, no CORS configuration
  beyond same-origin, no pagination pressure from concurrent readers.
- **Assumption: the bundle is built into the image.** The API does not build or
  fetch frontend assets at runtime.

## 4. Security

- **Authentication and authorization: none, deliberately.** The owner decided on
  2026-09-03 that the interface is loopback-bound and unauthenticated.
  SEC-AUTH-001 requires authentication on every externally reachable endpoint;
  these endpoints are not externally reachable, which is the specific condition
  the decision rests on. The capability records that this ceases to hold the
  moment the interface is exposed to any network, and the capability's own open
  questions carry when to revisit it. This design adds no dependency on the
  absence of authentication, so adding it later is additive.
- **Network exposure (AC-14).** Two independent controls: the uvicorn bind
  address and the published port. An integration test asserts the process is not
  listening on a non-loopback interface.
- **Input validation (SEC-INP-001).** Every request body and query string is a
  Pydantic model. Symbols are validated against the same pattern the database
  check constraint enforces, with a maximum length; `symbols` arrays are capped
  at 1000; `limit` is bounded at 500, defaulting to 50 (section 2.4a); `state` and `outcome` filters are validated against
  enumerations rather than passed through.
- **Injection (SEC-INP-002).** No query is built by concatenation. The one
  dynamic element, sort column, resolves through an allowlist in the service
  layer.
- **Error disclosure (SEC-ERR-001).** Section 2.3. A `500` returns a code and a
  request identifier only.
- **The credential is never echoed (AC-13).** No endpoint accepts it, returns
  it, or has a field for it. `GET /api/health` reports presence as a boolean.
  A response-model test asserts no response model contains a secret-shaped
  field.
- **Data classification.** Everything the API returns is Internal. No Restricted
  value crosses the boundary.
- **Privacy impact: none.** No PII, no customer data, one owner.
- **SAST and SCA.** FastAPI, Starlette, Pydantic and uvicorn are scanned through
  `pyproject.toml`. `ruff` and `mypy` run as blocking checks per the tech
  stack's validation commands.
- **Crypto usage: none in this component.** TLS is not terminated here; traffic
  is loopback only, which is why SEC-ENC-001 does not engage on this hop.

## 5. Scalability and Performance

- **Concurrency: one user.** A single uvicorn worker is sufficient (C8). No
  horizontal scale requirement exists anywhere in this capability.
- **The heaviest read is coverage at 3000 instruments** (AC-4). It is paginated
  by keyset cursor so the interface's virtualised table can request what it
  displays rather than the whole set in one response.
- **Polling load.** The UX design specifies a 10-second run poll while any run is
  non-terminal and a 30-second health poll. Both read the run journal, which is a
  small indexed table, rather than deriving coverage.
- **Connection pool** is bounded by `runtime-config` at a maximum of 4
  connections (SA-RES-001). One user polling two endpoints does not approach it.
- **Timeouts.** Every database call inherits the pool's statement timeout. No
  external call exists in this component to time out.
- **No latency SLA is stated** by the capability or the system design, so none is
  asserted here. Recorded in section 14.

## 6. Upgrade

- **No previous release.** This capability introduces the API.
- **Contract stability.** Every endpoint is declared "stable within this
  capability" by the system design's section 4.2. A later capability adding a
  field to a response is compatible; removing or renaming one is not, and must
  be treated as a breaking interface change in that capability's design.
- **Data migration: none owned here.** The API reads a schema
  `schema-migrator` has already brought forward.
- **Behaviour change after upgrade: none in this capability.**
- **Manual actions required: none.**
- **Rollback (OPS-MIG-003).** Reverting the application image reverts the API
  and the bundle together, because they ship in one image. The constraint is the
  schema: an older API against a newer schema is refused by the migrator, so the
  rollback path is image and data restore together, as recorded in the
  `market-data-store` design.

## 7. Testing

FastAPI's `TestClient` for route-level tests, `testcontainers[postgres]` for the
integration tests that need a real store.

| Test | File | What it proves |
|------|------|----------------|
| Bulk add reports per-symbol disposition | `tests/integration/test_api_instruments.py` | A batch of valid, duplicate and malformed symbols adds the valid ones and reports the rest (AC-1) |
| Duplicate of a retired instrument reactivates | `tests/integration/test_api_instruments.py` | Response offers reactivation rather than an error (AC-21) |
| Retire keeps coverage | `tests/integration/test_api_instruments.py` | After `DELETE`, coverage still lists the instrument as retired (AC-21) |
| Depth is required before a run | `tests/integration/test_api_runs.py` | `POST /api/acquisition-runs` with no depth returns 409 `history_depth_not_set` (AC-2) |
| Run request returns immediately | `tests/integration/test_api_runs.py` | 202 with a run id, and the run row is `requested` (AC-23) |
| Second request queues | `tests/integration/test_api_runs.py` | With one run `running`, a second request returns 202 and `queued_behind` naming the first (AC-23) |
| Cancel on a terminal run | `tests/integration/test_api_runs.py` | 409 `run_already_terminal` carrying the actual state (AC-19) |
| Run with an empty roster is refused | `tests/integration/test_api_runs.py` | With no active instrument, 409 `no_active_instruments` and no run row is created (AC-24) |
| A retired-only roster is an empty roster | `tests/integration/test_api_runs.py` | Instruments that exist but are all retired still produce 409 `no_active_instruments` (AC-24) |
| Cancelling a queued run does not touch the active one | `tests/integration/test_api_runs.py` | The queued run becomes `cancelled`, the running run stays `running` (AC-26) |
| Never-acquired coverage is distinct from empty | `tests/integration/test_api_coverage.py` | The response marks never-acquired explicitly rather than returning an empty list (AC-17) |
| Gap detection unavailable below two instruments | `tests/integration/test_api_coverage.py` | `gap_detection.available` is false with a reason, and no zero is reported (AC-8) |
| Health reports the most recent run outcome | `tests/integration/test_api_health.py` | Liveness, credential presence and last run state (AC-18) |
| No response model leaks the credential | `tests/unit/test_api_no_secrets.py` | Static inspection of every response model finds no credential field (AC-13) |
| The API does not import the provider client | `tests/unit/test_api_isolation.py` | No module under `api/` imports `massive_client` (C1) |
| Bind address is loopback | `tests/integration/test_api_binding.py` | The server is not listening on a non-loopback interface (AC-14) |
| History depth above the maximum is refused | `tests/integration/test_api_settings.py` | `{"years": 9999}` returns 422 naming the 1..50 range, and the stored depth is unchanged (section 2.4a) |
| A depth beyond the plan is accepted | `tests/integration/test_api_settings.py` | `{"years": 10}` succeeds even though the plan holds five years; the bound rejects typos, not plans (section 2.4a) |
| Page size defaults and caps | `tests/integration/test_api_pagination.py` | Omitting `limit` returns at most 50; `limit=500` is accepted; `limit=501` returns 422 |
| Bulk add is capped per request | `tests/integration/test_api_instruments.py` | 1000 symbols is accepted; 1001 returns 422 naming the cap, and no symbol is added |
| Coverage without a range covers everything | `tests/integration/test_api_coverage.py` | Omitting `from` and `to` returns each instrument's full covered range, and a gap outside any trailing window is still reported (AC-8, section 2.4a) |
| Unknown API path returns the envelope | `tests/unit/test_api_errors.py` | 404 with code `not_found`, not the SPA bundle |
| Internal error hides detail | `tests/unit/test_api_errors.py` | A raised exception returns code and request id only, and the detail is in the log (SEC-ERR-001) |

End-to-end coverage of these flows through the browser belongs to
`owner-web-app`'s Playwright suite and is specified there.

## 8. Acceptance Criteria

1. `POST /api/instruments` with a mixed batch adds every valid symbol and
   reports each rejected one with a reason, adding none of the rejected.
2. `DELETE /api/instruments/{symbol}` retires the instrument and it remains
   present in `GET /api/coverage` marked retired.
3. `POST /api/acquisition-runs` before any history depth is set returns 409 with
   code `history_depth_not_set` and creates no run.
4. `POST /api/acquisition-runs` while a run is active returns 202 and reports
   the active run in `queued_behind`.
5. `POST /api/acquisition-runs/{id}/cancel` on a terminal run returns 409
   carrying that run's state.
5a. `POST /api/acquisition-runs` with no active instrument returns 409 with code
   `no_active_instruments` and creates no run.
5b. `POST /api/acquisition-runs/{id}/cancel` on a `requested` run returns 202
   with state `cancelled`, and any run already `running` is unaffected.
6. `GET /api/coverage` before any acquisition distinguishes never-acquired from
   an empty result.
7. `GET /api/coverage` reports gap detection as unavailable, with a reason, when
   fewer than two instruments hold data in the range.
8. `GET /api/health` returns liveness, credential presence as a boolean, and the
   most recent run's outcome.
9. No response body from any endpoint contains the provider credential.
10. The server accepts no connection on a non-loopback interface.
11. Failure scenario: a database failure during a read returns 500 with a code
    and request identifier, and the driver message appears only in the log.
12. Failure scenario: a malformed request body returns 422 with the field named
    and no stack trace.

## 9. Workflows

- **Acquire for the first time.** Settings sets depth, Instruments names
  symbols, and the run request returns a run id the interface routes to. Steps 2
  to 4 of the capability's first flow.
- **Confirm the data is fit to rely on.** `GET /api/coverage` answers the whole
  of the second flow.
- **Diagnose a failure.** `GET /api/acquisition-runs` then
  `GET /api/acquisition-runs/{id}` answer the third flow's steps 2 and 3.
- **Stop a run.** The cancel endpoint and its 409 branch answer the fourth flow,
  including step 5, where the run had already finished.
- **Add an instrument after the first acquisition.** `POST /api/instruments`
  then a run request, answering the fifth flow.
- **Intersection with later capabilities.** M1 classification will need reads
  over the same store. Whether it extends this API or introduces its own surface
  is that capability's decision; nothing here forecloses either.

## 10. UX / GUI

This component renders no markup of its own beyond serving the built bundle, and
every screen in the UX design depends on its contracts. Three couplings are
tight enough to record:

- **The `blocked` Start action.** The UX design renders Start as `button`
  `blocked` with the reason *History depth is not set. Set it in Settings before
  acquiring.* The API's 409 code `history_depth_not_set` and its message are the
  same fact, and the message text here matches the interface copy so a race
  between the two produces one sentence rather than two.
- **The queued-run notice.** `queued_behind` is what lets the interface say *A
  run is in progress. This will start when it finishes.* without a second
  request.
- **The already-completed cancellation.** The 409's state field is what the
  interface renders as *This run had already completed.*

Internationalization: none. The API emits English owner-facing messages, and the
interface renders them. Dates and timestamps are ISO-8601 in responses; zone
rendering is the interface's concern per STD-UI-5.

## 11. API Endpoints

| Endpoint | Method/Operation | Auth/Privilege | Request | Response | Notes |
|----------|-----------------|----------------|---------|----------|-------|
| `/api/instruments` | GET | none, loopback only | `symbol` prefix filter, `lifecycle`, `limit` (default 50, max 500), `cursor` | `200` with instruments, counts of active and retired, `next_cursor` | AC-1 |
| `/api/instruments` | POST | none | `{"symbols": ["AAPL", "MSFT"]}`, at most 1000 per request | `201` with `added`, `reactivated`, `rejected` each carrying a reason; `409` when all duplicate; `422` when all malformed or the array exceeds 1000 | AC-1; bulk and single share one endpoint. Section 2.4a |
| `/api/instruments/{symbol}` | DELETE | none | path symbol | `200` with `lifecycle: retired` and `retired_at`; `404` unknown; `409` already retired | AC-21, retires and never deletes |
| `/api/settings/history-depth` | PUT | none | `{"years": 5}`, an integer in 1..50 | `200` with `years` and `updated_at`; `422` when not a positive integer or above 50 | AC-2; section 2.4a. The bound rejects typos, not plans |
| `/api/settings/history-depth` | GET | none | none | `200` with `years` or `null` when never set | AC-2; declared in system design v3 section 4.2 |
| `/api/acquisition-runs` | POST | none | empty body | `202` with `run_id`, `state: requested`, `queued_behind`; `409` `history_depth_not_set`; `409` `no_active_instruments` | AC-23, never blocks; AC-24 refuses an empty roster |
| `/api/acquisition-runs` | GET | none | `state` filter, `limit` (default 50, max 500), `cursor` | `200` with runs in reverse chronological order and `next_cursor` | AC-9 |
| `/api/acquisition-runs/{id}` | GET | none | path id, `outcome` filter, `limit` (default 50, max 500), `cursor` | `200` with the run, its counts, and per-instrument per-data-type results; `404` unknown | AC-10, AC-11 |
| `/api/acquisition-runs/{id}/cancel` | POST | none | path id | `202` with `state: cancelling` when the run was running, or `state: cancelled` when it was still queued; `409` `run_already_terminal` with the actual state; `404` unknown | AC-19, AC-26 |
| `/api/coverage` | GET | none | `symbol` filter, `lifecycle`, `from`, `to` (both optional; omitted means the full covered range per instrument), `limit` (default 50, max 500), `cursor` | `200` with per-instrument data-type presence, covered ranges, last acquired, gap counts, `never_acquired`, and `gap_detection` availability with a reason | AC-7, AC-8, AC-17, AC-21. Section 2.4a |
| `/api/health` | GET | none | none | `200` with `status`, `database`, `credential_present`, `schema_version`, `most_recent_run` | AC-18; `credential_present` declared in system design v3 section 4.2, sourced from the application's own environment per constraint 5.12 |
| `/` and any non-API path | GET | none | none | `200` `index.html`, or the built asset | SPA fallback, section 2.5 |

Interfaces consumed by this component: `instrument-list-service`, `run-journal`
and `coverage-service`, all in-process; and `market-data-store` through the
connection pool. It consumes no external integration.

## 12. References

| Type | Document Name | Description | Link |
|------|---------------|-------------|------|
| Capability | CAP-001 v6 | AC-1, AC-2, AC-7 to AC-11, AC-13, AC-14, AC-17 to AC-19, AC-21, AC-23 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/Capability-CAP-001.md` |
| System design | CAP-001 system design v3 | Interfaces 4.2, control flow 3, constraints 5.1, 5.11, 5.17 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/system-design.md` |
| UX design | CAP-001 UX design v4 | Screens 1.1 to 1.5, cross-screen navigation, the copy this API's messages must match | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-design.md` |
| Standard | STD-UI v4 | STD-UI-19 error parts, STD-UI-25 polling and last-updated | `docs/constitution/standards/ui-conventions.md` |
| Constitution | Tech Stack v3 | FastAPI on uvicorn, Pydantic, validation commands | `docs/constitution/tech-stack.md` |

## 13. Traceability

| Capability AC | System Design Element | Component Design Element | Section |
|--------------|----------------------|--------------------------|---------|
| AC-1 | `GET/POST/DELETE /api/instruments` | Bulk-tolerant POST with per-symbol disposition | 2.4, 11 |
| AC-2 | `PUT /api/settings/history-depth` | PUT plus the GET this design adds for the Settings screen | 11, 14 |
| AC-7 | `GET /api/coverage` | Coverage response shape with presence, ranges and last acquired | 11 |
| AC-8 | Gap detection, unavailable below two instruments | `gap_detection` object carrying availability and reason | 2.4, 11 |
| AC-9 | `run-journal` computes outcome from written coverage | Run list and detail responses reporting the recorded outcome only | 11 |
| AC-10 | Per-instrument failure records | Run detail returning per-instrument per-data-type outcome and reason | 11 |
| AC-11 | Per-instrument isolation | `not_found` reported distinctly from `failed` in run detail | 11 |
| AC-13 | No API echo of the credential | No request or response model carries it; health reports a boolean | 4, 11 |
| AC-14 | Port published to `127.0.0.1`; uvicorn bound to loopback | Bind address and published port, both asserted by test | 3, 4, 7 |
| AC-17 | Coverage distinguishes never acquired from acquired and empty | `never_acquired` field in the coverage response | 11 |
| AC-18 | `GET /api/health` | Liveness, credential presence, most recent run outcome | 11 |
| AC-19 | `POST /api/acquisition-runs/{id}/cancel` | 202 `cancelling`, 409 `run_already_terminal` with state | 2.4, 11 |
| AC-21 | Retire rather than delete; coverage reports retired | DELETE returns `retired`; coverage carries lifecycle | 11 |
| AC-23 | `POST` creates `requested`; FIFO claim by the runner | 202 with `queued_behind`, never a rejection | 2.4, 11 |

## 14. Open Questions

1. ~~`GET /api/settings/history-depth` is not in the system design's interface
   table.~~ **Resolved 2026-09-05: the endpoint was added to system design v3
   section 4.2**, on the owner's decision, as a separate route rather than folded
   into `GET /api/health`. Owner configuration does not belong in an endpoint
   polled every 30 seconds for operational status.
2. ~~`credential_present` on `GET /api/health` is not in the system design's
   interface text.~~ **Resolved 2026-09-05: system design v3 declares it**, and
   constraint 5.12 now states that the credential is supplied to both containers
   with the application reading only whether it is set. The alternative, having
   ingestion record presence in the store, was rejected because health would then
   report a credential as supplied after ingestion had stopped, and AC-18 exists
   so the owner can trust that answer.
3. ~~What happens when a run is requested with no active instruments?~~
   **Resolved 2026-09-05: refused at this boundary.** The capability now states
   it as AC-24 and the system design as constraint 5.18. `POST
   /api/acquisition-runs` returns `409` with code `no_active_instruments` and
   creates no run. This design previously accepted the request and let the run
   complete, which conflicted with `acquisition-runner` section 2.4 — deriving
   the outcome from what was written makes a zero-instrument run `failed`. The
   refusal removes the conflict rather than special-casing the outcome rule.
4. ~~What page size should the paginated endpoints use?~~ **Resolved 2026-09-05
   by owner decision: default 50, maximum 500**, together with the other request
   bounds now recorded in section 2.4a — maximum history depth 50 years, and at
   most 1000 symbols per bulk add. The coverage range defaults to everything
   acquired rather than a trailing window, which section 2.4a explains is the
   consequential one of the four.
5. **What API latency is acceptable at 3000 instruments?** No value is stated
   anywhere, so section 5 sizes the work without asserting a target. *Owner:
   capability owner. Blocks: a performance acceptance criterion.*
