---
artifact_schema_version: 1
artifact_id: CAP-003-massive-client-tests
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
    - id: CAP-003-component-design-massive-client
      version: "1"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# massive-client Component Test Specification

Component tests for `massive-client`'s CAP-003 changes (AC-29, AC-30). Each case verifies one story-level derived acceptance criterion of CAP-003-E8 within a unit test harness for the FactorFlow-v2 repository; every interface this component exposes is a `Python call` (component design section 11), so no case is an integration test. IDs continue after the first test design in AC-ID order, so this file holds 16 cases (TC-COMP-228 to TC-COMP-251, not necessarily contiguous).

**The real-transport harness.** Every case marked *real transport* builds a `MassiveClient` as CAP-001 v15 §2.2b does, with production `MassiveSettings` (env `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60`, every timing value at its default: `max_attempts` 3, `max_throttle_wait_seconds` 300), and drives it through `tests/unit/massive_transport_fakes.py`: `forbid_sockets` plus `RecordingMakeRequest` with a responder keyed on the request path, so only `HTTPConnectionPool._make_request` is replaced and the SDK, urllib3's `Retry` and `PoolManager.urlopen` run unpatched. The governor is built with `GovernorSettings.from_massive_settings(settings)`; one `FakeClock` started at a multiple of 60 is passed as both `monotonic` and `now`, a `FakeSleeper` on that clock as `sleep`, and a `SequenceJitter` as `jitter` (DAC-E8-20). Under the SDK's `retries=0`, a `429` reaches the client as urllib3's `MaxRetryError` whose `reason` is `ResponseError("too many 429 error responses")`, never as a `BadResponse`; no case patches `RESTClient` to raise a `BadResponse` for a `429`. A plan refusal body has the production shape `{"status": "ERROR", "request_id": "…", "message": "You are not entitled to this data. Please upgrade your plan"}` (system design assumption 9 records the production `403` body as not captured; the entitlement rule reads only `error` and `message`, so a body whose `status` is `NOT_AUTHORIZED` rather than `ERROR` classifies the same, TC-COMP-228). Request counts always come from `RecordingMakeRequest`; no case reads a recorded `attempts` value.

### TC-COMP-228: A not-entitled body in either field, any case, classifies ProviderNotEntitled

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-29, DAC-E8-S1-1, DAC-E8-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_massive_error_classification.py`; `classify_error_body` with the entitlement rule

#### Steps
1. Classify `{"status": "ERROR", "request_id": "r1", "message": "You are not entitled to this data. Please upgrade your plan"}`
2. Classify the same text in `error` instead of `message`
3. Classify `{"error": "NOT ENTITLED", "request_id": "r2"}` (upper case)
4. Classify `{"error": "Forbidden", "message": "You are not entitled to this data", "request_id": "r3"}`
5. Classify `{"status": "ERROR", "request_id": "r4", "error": "Forbidden"}` (no marker)

#### Expected Result
- Steps 1 to 4 each return `ProviderNotEntitled` whose `provider_request_id` is the body's `request_id`
- Step 5 returns `ProviderUnavailable`, not `ProviderNotEntitled`

#### Error / Edge Cases
- The marker in `message` beside an unrelated `error` (step 4) still classifies as a plan refusal: each field is searched on its own (component design §2.4 rule 3)
- Step 1 with `"status": "NOT_AUTHORIZED"` in place of `"ERROR"` (PROVISIONAL: the shape the coordinator's production diagnosis reports, which no approved artifact records): still `ProviderNotEntitled` with its `request_id`, since `status` takes part only in the not-found rule

### TC-COMP-229: Rule order keeps not-found and credential first; ProviderNotEntitled is fatal

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-29, DAC-E8-S1-2, DAC-E8-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_massive_error_classification.py`

#### Steps
1. Classify `{"error": "Unknown API Key", "message": "not entitled"}`
2. Classify `{"status": "NOT_FOUND", "message": "not entitled"}`
3. Evaluate `is_fatal_for_governor(ProviderNotEntitled("x"))`
4. Evaluate `issubclass(ProviderNotEntitled, MassiveError)`

#### Expected Result
- Step 1 is `CredentialRejected`; step 2 is `InstrumentNotFound`
- Step 3 is true; step 4 holds

#### Error / Edge Cases
- A body naming the API key and the entitlement marker together stops the run as `CredentialRejected` (component design §8 criterion 8)

### TC-COMP-230: A real 403 plan refusal is sent once, waits nothing and composes the fixed reason

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-29, DAC-E8-S1-3, DAC-E8-1, DAC-E8-4, DAC-E8-20
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_massive_retry.py`, real transport (file header)
- The responder answers `/stocks/financials/v1/balance-sheets` with `403` and `{"status": "ERROR", "request_id": "req_403_001", "message": "You are not entitled to this data. Please upgrade your plan"}`

#### Steps
1. Run `fetch_financials("KO", ...)`
2. Read `RecordingMakeRequest`'s recorded requests and the `FakeSleeper`'s calls
3. Call `compose_failure_reason(err, symbol="KO", data_type="fundamentals", redact=...)` on the raised error

#### Expected Result
- `ProviderNotEntitled` is raised with `provider_request_id` `req_403_001`
- Exactly one request was recorded, none to the income-statement or cash-flow paths; the sleeper recorded no wait
- The reason is exactly `[not_entitled] symbol=KO data_type=fundamentals request_id=req_403_001: the provider plan is not entitled to this data`

#### Error / Edge Cases
- Parametrised with the text in `error`, and with `error` `"Forbidden"` plus the text in `message`: same three results
- No reason contains the provider's text *Please upgrade your plan*

### TC-COMP-231: An unrecognised 403 envelope is still retried to the limit as unavailable

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-29, DAC-E8-S1-4, DAC-E8-3
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_massive_retry.py`, real transport (file header)
- The responder answers `403` with `{"status": "ERROR", "request_id": "r1", "error": "Forbidden"}`

#### Steps
1. Run the read
2. Count the recorded requests and compose the failure reason

#### Expected Result
- Three requests (`max_attempts`) were recorded
- A `ProviderUnavailable` that is not a `ProviderNotEntitled` is raised, composing kind `unavailable`

#### Error / Edge Cases
- A body that is not JSON: same retry and kind (system design constraint 16 (c))
- CAP-001's delivered timeout and unrecognised-envelope row in `test_massive_retry.py` (CAP-001's TC-INT-026, not this capability's) stays as it is

### TC-COMP-232: The not_entitled reason carries the fixed description, never the provider's text or the credential

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-29, DAC-E8-S1-5, DAC-E8-4
**Priority:** P1
**Type:** security

#### Preconditions
- `tests/unit/test_massive_failure_reasons.py` with a `redact` spy and the credential fixture

#### Steps
1. Compose a `ProviderNotEntitled` whose message holds other text, including the credential fixture
2. Inspect the reason and the `redact` spy's calls
3. Compose each delivered kind (`InstrumentNotFound`, `CredentialRejected`, `ProviderUnavailable`, `ProviderContractViolation`)
4. Compose an unlisted `MassiveError` subclass

#### Expected Result
- The reason starts `[not_entitled] ` and ends with the fixed *the provider plan is not entitled to this data*; `redact` is never called with the error's text; the credential fixture appears nowhere in it
- Each delivered kind still composes its own kind
- The unlisted subclass raises `TypeError`

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-234: The plan-refusal change keeps _safe_fields, adds no package and reads no attempts

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-29, DAC-E8-S1-7
**Priority:** P2
**Type:** security

#### Preconditions
- The story's change set to `errors.py`, `__init__.py`, `outcomes.py` and its tests; the lock file

#### Steps
1. Read `_safe_fields` after the change
2. Compose every reason a plan refusal can produce and search it for provider free text
3. Compare the lock file with the base branch
4. Search the story's tests for a read of `attempts`

#### Expected Result
- `_safe_fields` still reads only `status`, `message`, `error` and `request_id` (SEC-INP-001)
- No stored reason from a plan refusal carries provider free text (AGT-PROHIB-003)
- No package is added (SEC-DEP-001)
- No assertion reads the recorded `attempts` value; request counts come from `RecordingMakeRequest`

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-240: Six kinds by exact class; ProviderRateLimited composes rate_limited without the credential

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-30, DAC-E8-S2-6, DAC-E8-4
**Priority:** P1
**Type:** security

#### Preconditions
- `tests/unit/test_massive_failure_reasons.py`; the credential fixture

#### Steps
1. Compose one reason for each of the six classes `InstrumentNotFound`, `CredentialRejected`, `ProviderUnavailable`, `ProviderContractViolation`, `ProviderNotEntitled`, `ProviderRateLimited`
2. Compose a `ProviderRateLimited` whose message contains the credential fixture
3. Compose an unlisted `MassiveError` subclass
4. Evaluate `issubclass(ProviderRateLimited, ProviderUnavailable)`

#### Expected Result
- Each class gives its own kind and every reason starts `[<kind>] `
- `ProviderRateLimited` gives `rate_limited` with `request_id=unavailable`, never kind `unavailable`
- The step 2 reason does not contain the credential (CAP-001 AC-13)
- Step 3 raises `TypeError`; step 4 holds

#### Error / Edge Cases
- The lookup is by exact class: the subclass `ProviderRateLimited` never falls back to its parent's kind

### TC-COMP-243: A real 429 five times then 200 is waited out at the boundary, never an attempt

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-30, DAC-E8-S3-1, DAC-E8-2, DAC-E8-20
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_massive_retry.py`, real transport (file header); jitter `[0.0]`
- The responder answers the first five requests of `fetch_reference("AAPL")` (`max_attempts + 2`) with `429` and the body of `tests/fixtures/massive/error_rate_limited.json`, then `200` with the `reference_active.json` envelope

#### Steps
1. Run `fetch_reference("AAPL")`
2. Read the recorded requests and the `FakeSleeper`'s calls

#### Expected Result
- The reference is returned
- Six requests were recorded; the sleeper recorded five waits of 60.0 s, each a boundary wait and none a backoff delay
- No `ProviderUnavailable` is raised although five exceeds `max_attempts`

#### Error / Edge Cases
- This row replaces CAP-001's patched `RESTClient` test (CAP-001's TC-INT-025) and keeps its marker; the 429 reaches the classifier as a `MaxRetryError`, never a `BadResponse`

### TC-COMP-244: A persistent real 429 spends exactly the 300 s budget and raises ProviderRateLimited

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-30, DAC-E8-S3-2, DAC-E8-5, DAC-E8-6
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_massive_retry.py`, real transport (file header); every request answered `429`; jitter `[0.0]`

#### Steps
1. Call `start_instrument()`
2. Run `fetch_reference("AAPL")`
3. Compose the reason with `compose_failure_reason(err, symbol="AAPL", data_type="reference", redact=...)`

#### Expected Result
- `ProviderRateLimited` is raised, an instance of `ProviderUnavailable`, with `provider_request_id` `None` and a `__cause__` that is a `MaxRetryError`
- Six requests and five 60.0 s waits were recorded, totalling 300 s and never more
- The reason starts `[rate_limited] symbol=AAPL data_type=reference request_id=unavailable: `

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-245: The budget is the stock's: a spent budget fails the next read after one request

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-30, DAC-E8-S3-3, DAC-E8-5, DAC-E8-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The state TC-COMP-244 leaves: same client, governor and clock, budget spent, every request still answered `429`

#### Steps
1. Without calling `start_instrument()`, run `fetch_daily_bars("AAPL", ...)`
2. Call `start_instrument()` and run `fetch_reference("AAPL")`

#### Expected Result
- Step 1 raises `ProviderRateLimited` after exactly one request and no further sleep
- Step 2 waits again: the sleeper records new boundary waits before the budget is spent

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-246: Jitter never takes the real-transport budget past 300 s

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-30, DAC-E8-S3-4, DAC-E8-5
**Priority:** P1
**Type:** non-functional

#### Preconditions
- `tests/unit/test_massive_retry.py`, real transport (file header); every request answered `429`; `SequenceJitter([0.999])`

#### Steps
1. Call `start_instrument()` and run the read
2. Sum the `FakeSleeper`'s calls and compute the next delay the governor would have taken

#### Expected Result
- `ProviderRateLimited` is raised
- The recorded sleeps total at most 300 s
- That total plus the next computed delay, which the governor declined to sleep, exceeds 300 s

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-247: A refused redirect and a forcelisted 503 stay retryable and reach no other host

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-30, DAC-E8-S3-5, DAC-E8-2
**Priority:** P1
**Type:** security

#### Preconditions
- `tests/unit/test_massive_retry.py`, real transport (file header)
- Two responders: one answering `302` to `https://198.51.100.7/`, one answering `503`

#### Steps
1. Run the read against the redirecting responder
2. Run the read against the `503` responder
3. Run the delivered `tests/unit/test_massive_redirects.py`

#### Expected Result
- Each read gives three requests to the configured host and a `ProviderUnavailable` that is not a `ProviderRateLimited`
- No request reaches `198.51.100.7`
- The delivered redirect rows pass unchanged (DEC-0038, DEC-0041, DEC-0042 controls untouched)

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-248: classify_for_governor matches only urllib3's 429 constant; the body check still throttles

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-30, DAC-E8-S3-6, DAC-E8-2
**Priority:** P1
**Type:** functional

#### Preconditions
- `classify_for_governor` imported from `client.py`; `MaxRetryError` and `ResponseError` from `urllib3.exceptions`

#### Steps
1. Classify `MaxRetryError(pool, url, ResponseError(ResponseError.SPECIFIC_ERROR.format(status_code=429)))`
2. Classify the same with status `503`
3. Classify a `MaxRetryError` whose reason is `ResponseError("too many redirects")`
4. Classify a `MaxRetryError` whose reason is a `NewConnectionError`
5. Classify `BadResponse(<error_rate_limited.json>)`

#### Expected Result
- Step 1 is `THROTTLED`; steps 2 to 4 are `RETRYABLE`; step 5 is `THROTTLED`

#### Error / Edge Cases
- Step 5 is the only row that builds a `BadResponse` for a `429`; it stands for an SDK without the forcelist entry, not for production
- The expected 429 string is taken from urllib3's constant, never hand-typed

### TC-COMP-249: The plan-refusal and unrecognised-403 rows pass through the lifted classifier

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-29, DAC-E8-S3-7, DAC-E8-3
**Priority:** P1
**Type:** functional

#### Preconditions
- `classify_for_governor` wired as the client's `classify`; the rows of TC-COMP-230 and TC-COMP-231 and CAP-001's delivered timeout row

#### Steps
1. Run TC-COMP-230's plan-refusal row
2. Run TC-COMP-231's unrecognised-`403` row
3. Run the delivered timeout row

#### Expected Result
- Step 1: one request and `ProviderNotEntitled`
- Step 2: three requests and `ProviderUnavailable`
- Step 3 passes unchanged

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-250: start_instrument starts the governor's budget once and sends no request

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-30, DAC-E8-S3-8, DAC-E8-7
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_massive_client_governor_integration.py`; a client with a spy governor over `RecordingMakeRequest`

#### Steps
1. Call `MassiveClient.start_instrument()`

#### Expected Result
- The governor's `start_throttle_budget()` is called once
- `RecordingMakeRequest` records no request

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-251: The 429 change adds no package and no test fakes a 429 BadResponse or reads attempts

**Scope:** component
**Component(s):** massive-client
**Traces to:** AC-30, DAC-E8-S3-9, DAC-E8-20
**Priority:** P2
**Type:** security

#### Preconditions
- The story's change set to `client.py` and its tests; the lock file

#### Steps
1. Read `client.py`'s imports
2. Search every test for `RESTClient` patched to raise `BadResponse` with a `429`
3. Search every test for a read of `attempts`
4. Compare the lock file with the base branch

#### Expected Result
- `client.py` imports `MaxRetryError` and `ResponseError` from `urllib3.exceptions`; no package is added (urllib3 already locked at 2.7.0, SEC-DEP-001)
- No such patch exists
- No assertion reads the recorded `attempts` value

#### Error / Edge Cases
- None beyond the scenario
