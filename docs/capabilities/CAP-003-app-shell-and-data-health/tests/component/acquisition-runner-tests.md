---
artifact_schema_version: 1
artifact_id: CAP-003-acquisition-runner-tests
artifact_type: test-specification
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
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
    - id: CAP-003-component-design-acquisition-runner
      version: "1"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# acquisition-runner Component Test Specification

Component tests for `acquisition-runner`'s CAP-003 changes (AC-29, AC-30), including `outcomes.py`'s `classify_provider_error`. Each case verifies one story-level derived acceptance criterion of CAP-003-E8 within a unit test harness for the FactorFlow-v2 repository. The runner's interfaces are `Python call` entries (component design section 11) and its store writes are SQL inside the component, so its PostgreSQL-backed rows (`testcontainers[postgres]`, marker `postgres`, in `tests/integration/test_runner_provider_refusals.py`) are component tests here, as `data-health-reader`'s are (coverage matrix note 3). IDs continue after the first test design in AC-ID order, so this file holds 10 cases (TC-COMP-233 to TC-COMP-259, not necessarily contiguous).

Every case that sends a `403` or a `429` uses the real `MassiveClient` and governor over `tests/unit/massive_transport_fakes.py` exactly as `massive-client-tests.md` describes (production `MassiveSettings`, `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60`, every timing value at its default, `GovernorSettings.from_massive_settings(settings)`, one `FakeClock` as both `monotonic` and `now`, a `FakeSleeper` on it). Request counts come from `RecordingMakeRequest`; no case reads `run_instrument_result.attempts`.

### TC-COMP-233: classify_provider_error records ProviderNotEntitled as failed with the reason unreworded

**Scope:** component
**Component(s):** acquisition-runner
**Traces to:** AC-29, DAC-E8-S1-6, DAC-E8-8
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_outcomes.py`; a composed reason `r`

#### Steps
1. Call `classify_provider_error(ProviderNotEntitled("x"), data_type="fundamentals", reason=r)`
2. Call it with a `CredentialRejected`
3. Call it with an unrecognised exception type

#### Expected Result
- Step 1 returns outcome `failed` with `reason` exactly `r`
- Step 2 still raises `ValueError`; step 3 still raises `TypeError`, whose text names the accepted types

#### Error / Edge Cases
- No outcome value is added: `failed` is the delivered value

### TC-COMP-241: classify_provider_error records ProviderRateLimited as failed through the delivered branch

**Scope:** component
**Component(s):** acquisition-runner
**Traces to:** AC-30, DAC-E8-S2-7, DAC-E8-8
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_outcomes.py`; a composed reason `r`

#### Steps
1. Call `classify_provider_error(ProviderRateLimited("x"), data_type="reference", reason=r)`

#### Expected Result
- Returns outcome `failed` with `reason` exactly `r`, through the delivered `isinstance(error, ProviderUnavailable)` branch

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-252: start_instrument is called once per stock, after its heartbeat and cancellation check

**Scope:** component
**Component(s):** acquisition-runner
**Traces to:** AC-30, DAC-E8-S4-1, DAC-E8-7
**Priority:** P1
**Type:** functional

#### Preconditions
- A `MagicMock` client over a two-stock roster; the journal's `heartbeat` and `cancellation_requested` spies and the client attached to one parent `Mock`

#### Steps
1. Run `execute_claimed`
2. Read the parent mock's call order
3. Repeat with cancellation requested before the second stock

#### Expected Result
- `start_instrument` is called twice, each call after that stock's `heartbeat` and `cancellation_requested` and before its first `fetch_*` call
- With cancellation before the second stock, it is called once: a stock never fetched starts no budget

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-253: A real 403 plan refusal is sent once per stock and the download finishes partial

**Scope:** component
**Component(s):** acquisition-runner
**Traces to:** AC-29, DAC-E8-S4-2, DAC-E8-9, DAC-E8-20
**Priority:** P1
**Type:** functional

#### Preconditions
- PostgreSQL (`postgres` marker); followed stocks `AAPL` and `KO`; real client and governor over the transport harness
- Every `/stocks/financials/v1/*` request answers `403` with `{"status": "ERROR", "request_id": "req_403_<n>", "message": "You are not entitled to this data. Please upgrade your plan"}`; the reference request `200` with the `reference_active.json` envelope, its `ticker` the requested symbol; every other read `200` with an empty result set

#### Steps
1. Run the download
2. Read each stock's `run_instrument_result` rows and the run's final state
3. Read `RecordingMakeRequest`'s requests by path

#### Expected Result
- Each stock records `fundamentals` `failed` with a reason starting `[not_entitled] symbol=<symbol> data_type=fundamentals request_id=req_403_` and ending `the provider plan is not entitled to this data`
- Exactly one request per stock reached `/stocks/financials/v1/balance-sheets`, none the income-statement or cash-flow paths
- The other three data types are `written` or `unchanged`; the run is finalised `partial`

#### Error / Edge Cases
- The refusal does not stop the download: the second stock is fetched after the first stock's refusal

### TC-COMP-254: Persistent 429 at the default timing set stays inside the staleness window and finishes partial

**Scope:** component
**Component(s):** acquisition-runner
**Traces to:** AC-30, DAC-E8-S4-3, DAC-E8-10, DAC-E8-8, DAC-E8-20
**Priority:** P1
**Type:** non-functional

#### Preconditions
- PostgreSQL (`postgres` marker); settings at every default with `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60` (`max_throttle_wait_seconds` 300, `stale_after_seconds` 900, `max_attempts` 3)
- One `FakeClock` started at a multiple of 60 as the governor's `monotonic` and `now`, a `FakeSleeper` on it as `sleep`; `factorflow.ingestion.runner.heartbeat` and `factorflow.ingestion.runner.finalise` wrapped to record the clock at each call before delegating
- Roster `KO` then `AAPL`; every `KO` request answers `429` with the `error_rate_limited.json` body; `AAPL` answers as in TC-COMP-253
- Parametrised over jitter `[0.0]` and `[0.999]`

#### Steps
1. Run the download
2. Partition the `FakeSleeper` calls by the recorded heartbeat and `finalise` times
3. Read the stored results, the requests by path and the run's final state

#### Expected Result
- (a) The sleeps between consecutive heartbeats, and between the last heartbeat and `finalise`, sum to at most 300 s; every interval is below 900 s, the reclaim predicate's window
- (b) `KO` records all four data types `failed` with reasons starting `[rate_limited] symbol=KO data_type=<type> request_id=unavailable: `
- (c) After `KO`'s budget is spent, its prices, fundamentals and corporate-actions reads each sent exactly one request
- (d) `AAPL`'s budget started fresh; its reference, prices and corporate actions are `written` or `unchanged` and its fundamentals `failed` with a reason starting `[not_entitled] symbol=AAPL data_type=fundamentals `
- (e) The run is finalised `partial`, never `abandoned`

#### Error / Edge Cases
- With jitter `[0.999]` the bound on the sleeps still holds (review v14 FINDING-55)

### TC-COMP-255: Everything throttled finishes failed by the outcome rule, never abandoned

**Scope:** component
**Component(s):** acquisition-runner
**Traces to:** AC-30, DAC-E8-S4-4, DAC-E8-10
**Priority:** P1
**Type:** functional

#### Preconditions
- TC-COMP-254's setup with jitter `[0.0]` and a roster of `KO` alone

#### Steps
1. Run the download
2. Read the stored results and the run's final state

#### Expected Result
- Four `[rate_limited]` rows are recorded
- The run is finalised `failed` by the delivered outcome rule, never `abandoned` (system design open question 13, answered 2026-11-07)

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-256: The delivered runner tests pass with clients that accept start_instrument

**Scope:** component
**Component(s):** acquisition-runner
**Traces to:** AC-29, AC-30, DAC-E8-S4-5, DAC-E8-8
**Priority:** P1
**Type:** functional

#### Preconditions
- Every delivered `tests/integration/test_runner_*.py` (among them `test_runner_isolation.py`, `test_runner_outcomes.py`, `test_runner_cancel.py`, `test_runner_reclaim.py`, `test_runner_credential.py`) and `tests/unit/test_runner_*.py`

#### Steps
1. Run each after the change

#### Expected Result
- Each passes unchanged; the `MagicMock` clients accept `start_instrument()`
- In the credential case a `CredentialRejected` still fails the whole download at once

#### Error / Edge Cases
- A rejected credential after a plan refusal or a rate limit on an earlier data type still fails the download at once (component design §8 criterion 6)

### TC-COMP-257: README discloses the upgrade from 0.2.0

**Scope:** component
**Component(s):** acquisition-runner
**Traces to:** AC-29, AC-30, DAC-E8-S4-6, DAC-E8-19
**Priority:** P2
**Type:** non-functional

#### Preconditions
- `README.md` after the story

#### Steps
1. Locate the subsection under *Deploying and operating FactorFlow*
2. Read its content against system design constraint 17

#### Expected Result
- `### Upgrading from 0.2.0: provider refusals reported by cause` sits immediately after *Upgrade, backup and rollback* and names release 0.2.0 (`factorflow:0.2.0-829c9e1`, deployed 2026-11-07)
- It states (a) a throttled stock waits to the minute boundary for up to the 300 s budget per stock (`FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS`) instead of failing within seconds, downloads on a plan whose request limit is below `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` taking up to one budget longer per followed stock, cancelling still taking effect after the current stock; (b) a plan refusal costs one request instead of three; (c) stored reasons gain `not_entitled` and `rate_limited`, results recorded before the upgrade keep `[unavailable]` and are not rewritten; (d) rollback is a redeploy of the previous image with no data step
- It says no migration, new variable or manual action is needed, and refers to the *Upgrade, backup and rollback* procedure rather than restating it

#### Error / Edge Cases
- A documentary check: verified by reading the file in review, as TC-COMP-225 verifies a process criterion

### TC-COMP-258: Results recorded before the upgrade are never updated

**Scope:** component
**Component(s):** acquisition-runner
**Traces to:** AC-29, AC-30, DAC-E8-S4-7, DAC-E8-19
**Priority:** P1
**Type:** functional

#### Preconditions
- PostgreSQL (`postgres` marker); `run_instrument_result` rows of an earlier run with reasons beginning `[unavailable] `

#### Steps
1. Run TC-COMP-253's and TC-COMP-254's downloads against this store
2. Read the earlier run's rows
3. Search `runner.py`'s diff for an `UPDATE` of an earlier run's results

#### Expected Result
- Every earlier row is byte for byte as it was; the runner only inserts results for the run it executes
- No such `UPDATE` is added

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-259: Runner refusal tests count requests from the transport, never attempts

**Scope:** component
**Component(s):** acquisition-runner
**Traces to:** AC-29, AC-30, DAC-E8-S4-8, DAC-E8-9, DAC-E8-10
**Priority:** P2
**Type:** functional

#### Preconditions
- `tests/integration/test_runner_provider_refusals.py`

#### Steps
1. Read every assertion of a request count
2. Search for a read of `run_instrument_result.attempts`

#### Expected Result
- Every request count comes from `RecordingMakeRequest`
- No assertion reads `attempts`, which the delivered writer never records

#### Error / Edge Cases
- None beyond the scenario
