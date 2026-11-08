---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T19:40:00Z
  source_artifacts:
    - id: CAP-003-E8-S3
      version: "1"
    - id: CAP-003-E8
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-component-design-massive-client
      version: "1"
    - id: CAP-003-component-design-rate-limit-governor
      version: "1"
    - id: CAP-003-massive-client-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "2"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E8-S3 — A Real 429 Is Throttling, Not an Attempt, and Each Stock Starts Its Own Budget

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S3.md`
**Component**: `FactorFlow-v2` (module `massive-client`, `src/factorflow/ingestion/massive/client.py`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-E8-tasks` (planning); coding cuts its own `usr/alvaro-de-jodra/` branch per `docs/branch-naming.md`
**Date**: 2026-11-08

## Summary

Production stored Massive `429` rate-limit answers as `[unavailable] … failed 3 consecutive attempts` (CAP-002 release follow-up F1). Under the locked SDK 2.8.0 built with `retries=0`, urllib3's `Retry(total=0, status_forcelist=[413, 429, 499, 500, 502, 503, 504])` turns a real `429` into `urllib3.exceptions.MaxRetryError(reason=ResponseError("too many 429 error responses"))` before the SDK can raise `BadResponse`, and the closure in `MassiveClient._through_governor` (`client.py` lines 288-300) classifies every non-`BadResponse` as `RETRYABLE`. Planning reproduced this socket-free on the current code through `tests/unit/massive_transport_fakes.py`: a `429` gives three requests and `ProviderUnavailable("The provider failed 3 consecutive attempts.")` whose `__cause__.reason` equals `ResponseError.SPECIFIC_ERROR.format(status_code=429)`. This story lifts the classifier to a module-level `classify_for_governor(exc) -> Outcome` whose first rule maps that `MaxRetryError` to `THROTTLED` against urllib3's own constant, wires it into `_through_governor` (keeping the delivered `except BadResponse` re-raise), and adds `MassiveClient.start_instrument()`, which starts the governor's per-stock throttle budget (CAP-003-E8-S2) and sends nothing (massive-client CAP-003 §2.3, §2.6). The SDK construction, the redirect refusal and DEC-0038/DEC-0041/DEC-0042's controls are unchanged. The delivered `RESTClient`-patched `429` test that hid the bug is replaced by real-transport rows. This story lands and releases together with CAP-003-E8-S4 (owner decision, 2026-11-08).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-30 | A rate limit is not a failed attempt; past one stock's wait budget it is recorded under its own reason | T003, T004, T005, T006, T007, T014, T015, T016 |
| AC-29 | A plan refusal is still sent once through the lifted classifier | T010, T014, T015 |
| DAC-E8-2 | A `429` `MaxRetryError` is `THROTTLED`; `503`, too many redirects, connection errors and a refused redirect stay `RETRYABLE` to the configured host only; a rate-limited `BadResponse` is still `THROTTLED` | T004, T008, T009, T014, T015 |
| DAC-E8-3 | An unrecognised error envelope stays `RETRYABLE`, retried to `max_attempts` | T009, T010, T012, T014 |
| DAC-E8-7 | `start_instrument()` calls `start_throttle_budget()` once and sends nothing | T002, T006, T013 |
| DAC-E8-20 | Every `429`/`403` test runs the real SDK/urllib3 path with production settings, `from_massive_settings` and one `FakeClock` as `monotonic` and `now`; no patched `RESTClient` raising a `BadResponse` for a `429` | T003, T004, T005, T006, T007, T008, T011 |
| DAC-E8-S3-1 | Five real `429`s then `200`: reference returned, six requests, five 60.0 s boundary waits, no `ProviderUnavailable` (replaces TC-INT-025) | T003, T004, T014, T015 |
| DAC-E8-S3-2 | Persistent real `429`, jitter `[0.0]`, after `start_instrument()`: `ProviderRateLimited` (a `ProviderUnavailable`, no `request_id`, `__cause__` `MaxRetryError`), six requests, five 60.0 s waits = 300 s; reason starts `[rate_limited] symbol=AAPL data_type=reference request_id=unavailable: ` | T005, T014, T015 |
| DAC-E8-S3-3 | Without `start_instrument()` the next read fails after one request and no sleep; after it, a read waits again | T006, T013, T014, T015 |
| DAC-E8-S3-4 | Persistent real `429`, jitter `[0.999]`: sleeps total ≤ 300 s and total + next declined delay > 300 s | T007, T014, T015 |
| DAC-E8-S3-5 | Real `302` to `198.51.100.7` and real `503`: three requests to the configured host each, `ProviderUnavailable` not `ProviderRateLimited`; delivered redirect rows pass unchanged | T008, T014, T016 |
| DAC-E8-S3-6 | `classify_for_governor` direct: `429` `THROTTLED`; `503`, `"too many redirects"`, `NewConnectionError` `RETRYABLE`; `BadResponse(<error_rate_limited.json>)` `THROTTLED` | T009, T012, T014 |
| DAC-E8-S3-7 | CAP-003-E8-S1's real-transport `403` rows and the delivered TC-INT-026 timeout row pass unchanged through the lifted classifier | T010, T015 |
| DAC-E8-S3-8 | `start_instrument()` on a spy governor: `start_throttle_budget()` once, no request recorded | T002, T013 |
| DAC-E8-S3-9 | `client.py` imports `MaxRetryError`, `ResponseError` from `urllib3.exceptions`; no package added; no patched-`RESTClient` `429`; no test reads `attempts` | T011, T014, T016 |

## Phase 1: Setup

**Purpose**: Confirm the two hard predecessors have landed on the coding branch, so the tests below fail for this story's reason and not for a missing symbol.

- [ ] T001 Verify on the coding branch, without editing them, that CAP-003-E8-S1 and CAP-003-E8-S2 have landed: `src/factorflow/ingestion/massive/errors.py` defines `ProviderNotEntitled` and `ProviderRateLimited` and `_ERROR_KIND_BY_TYPE` holds `not_entitled` and `rate_limited`; `src/factorflow/ingestion/rate_limit.py` defines `RateLimitGovernor.start_throttle_budget()` and the check-before-wait `THROTTLED` branch; `tests/unit/test_massive_retry.py` holds CAP-003-E8-S1's real-transport rows (TC-COMP-230, TC-COMP-231). Run the focused command (Validation Plan) and record it green as the baseline. If either story is absent, stop: this story's tests import `ProviderRateLimited` and call `start_throttle_budget()` (hard edges already in `dependencies.yaml`). (prerequisite; traces to DAC-E8-7, DAC-E8-S3-2)

**Checkpoint**: Predecessor symbols present; focused suites green on the unchanged `client.py`.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define expected behaviour from acceptance criteria. Two TDD cycles: **cycle 1** is T002 (RED) then T013 (GREEN); **cycle 2** is T003–T011 (RED) then T014–T015 (GREEN). Cycle 1 runs first because T005–T007 call `start_instrument()`.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-250 (start_instrument starts the governor's budget once and sends no request) in `tests/unit/test_massive_client_governor_integration.py` as `test_start_instrument_starts_the_governor_budget_once_and_sends_nothing`, with `# Implements TC-COMP-250` above it. Build production `MassiveSettings` from env as `tests/unit/test_massive_redirects.py`'s `_settings` does (`FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60`, `generated_test_key()`, `FACTORFLOW_MASSIVE_BASE_URL` and `FACTORFLOW_MASSIVE_MAX_ATTEMPTS` unset, `_env_file=None`); install `forbid_sockets(monkeypatch)` and `RecordingMakeRequest().install(monkeypatch)` from `tests.unit.massive_transport_fakes`; pass `governor = MagicMock(spec=RateLimitGovernor)` to a real `MassiveClient`. Call `client.start_instrument()` once. Assert `governor.start_throttle_budget.assert_called_once_with()`, `governor.execute.call_count == 0`, `transport.requests == []`, `guard.fired == []`. RED: `AttributeError` (no `start_instrument`). — kills: hand-written `start_instrument` body → `pass` (no call recorded), and a body calling `start_throttle_budget()` twice (call count 2), and any body that sends (`execute` called / a request recorded)

- [ ] T003 Rewrite the module docstring and harness of `tests/unit/test_massive_retry.py`: the docstring says the `429` rows run the real SDK and urllib3 path through `tests/unit/massive_transport_fakes.py` (massive-client CAP-003 §7; DAC-E8-20) and that only the delivered TC-INT-026 row still patches `RESTClient`. Reuse the real-transport harness CAP-003-E8-S1 adds to this file for TC-COMP-230/231 (its plan names `_CLOCK_START = 1_800_000_000.0`, `_production_settings(monkeypatch)` and `_real_transport_client(settings)`, which builds `RateLimitGovernor(GovernorSettings.from_massive_settings(settings), monotonic=clock, sleep=sleeper, jitter=SequenceJitter([0.0]), now=clock)` on a `FakeClock(_CLOCK_START)`); do not add a second set. The one change to it: an additive keyword `jitter: Sequence[float] = (0.0,)` on `_real_transport_client`, passed to `SequenceJitter`, so T007 can use `[0.999]` while S1's rows keep `[0.0]` by default. If S1 landed the harness under other names, use those; if it landed none, add exactly those three helpers as described. Each test builds its own client and governor (the budget is instance state). Add a path-keyed responder helper that answers `429` with `tests/fixtures/massive/error_rate_limited.json`'s body via `json_answer(body, 429)` and can switch to `200` after N matching requests; match on `request.path.startswith("/v3/reference/tickers/AAPL")`, since the recorded path carries the query string (observed at planning: `/v3/reference/tickers/AAPL?ticker=AAPL`). (test infrastructure for T004–T008; traces to DAC-E8-20)

- [ ] T004 Implement TC-COMP-243 (A real 429 five times then 200 is waited out at the boundary, never an attempt) in `tests/unit/test_massive_retry.py`, replacing the delivered `test_rate_limited_responses_are_paced_without_consuming_attempts` (the patched-`RESTClient` test) and keeping its marker: `# Implements TC-INT-025` (CAP-001's ID, coverage-matrix note 13) and `# Implements TC-COMP-243`. Responder: first five reference requests `429` + rate-limited body, then `200` with `{"request_id": "req_ok_001", "results": <reference_active.json>}`; jitter `[0.0]`; no `start_instrument()` (the budget starts at zero from construction, rate-limit-governor §3). Assert the result is a `TickerReference` with `cik == "0000320193"`, `len(transport.requests) == 6`, `sleeper.calls == [60.0, 60.0, 60.0, 60.0, 60.0]` (literal; a backoff delay at jitter 0.0 would be `0.0`, so this list also proves none was a backoff), and no exception. RED: `ProviderUnavailable` after three requests. — kills: swap-case `Outcome.THROTTLED` → `Outcome.RETRYABLE` on rule 1 of `classify_for_governor`; negate-boolean `==` → `!=` on `str(exc.reason) == _THROTTLED_RETRY_REASON`; off-by-one `status_code=429` → `430`; hand-written `_through_governor` still passing the old closure

- [ ] T005 Implement TC-COMP-244 (A persistent real 429 spends exactly the 300 s budget and raises ProviderRateLimited) in `tests/unit/test_massive_retry.py`, `# Implements TC-COMP-244`. Every request `429`; jitter `[0.0]`; `client.start_instrument()` then `fetch_reference("AAPL")` under `pytest.raises(ProviderRateLimited)`. Assert `isinstance(err, ProviderUnavailable)`, `err.provider_request_id is None`, `isinstance(err.__cause__, MaxRetryError)`, `len(transport.requests) == 6`, `sleeper.calls == [60.0] * 5`, `sum(sleeper.calls) == 300.0`, and `compose_failure_reason(err, symbol="AAPL", data_type="reference", redact=lambda text: text).startswith("[rate_limited] symbol=AAPL data_type=reference request_id=unavailable: ")` (literal prefix in the test). RED: `ProviderUnavailable` that is not a `ProviderRateLimited`, after three requests. — kills: swap-case `Outcome.THROTTLED` → `Outcome.RETRYABLE` on rule 1 (observed: exception type and 3 requests instead of 6); negate-boolean `and` → `or` in rule 1's conjunction is killed by T008/T009, not here

- [ ] T006 Implement TC-COMP-245 (The budget is the stock's: a spent budget fails the next read after one request) in `tests/unit/test_massive_retry.py`, `# Implements TC-COMP-245`, as one test continuing T005's scenario on one client, governor and clock (repeat T005's arrange-and-act; do not share state across tests). Step 1, without `start_instrument()`: `fetch_daily_bars("AAPL", date(2024, 1, 1), date(2024, 1, 31))` raises `ProviderRateLimited`; assert exactly one new request and that its path starts `/v2/aggs/ticker/AAPL`, and `len(sleeper.calls) == 5` (no new sleep). Step 2: `client.start_instrument()`, then `fetch_reference("AAPL")` raises `ProviderRateLimited` again with `sleeper.calls[5:] == [60.0] * 5` and six new requests (the clock sits at `_CLOCK_START + 300.0`, a multiple of 60, so each wait is exactly 60.0). RED: step 1 gives three requests and a plain `ProviderUnavailable`. — kills: hand-written `start_instrument` body → `pass` (step 2 would raise after one request with no new wait); swap-case on rule 1

- [ ] T007 Implement TC-COMP-246 (Jitter never takes the real-transport budget past 300 s) in `tests/unit/test_massive_retry.py`, `# Implements TC-COMP-246`. Every request `429`; `SequenceJitter([0.999])`; `client.start_instrument()` then `fetch_reference("AAPL")` raises `ProviderRateLimited`. Assert `sum(sleeper.calls) <= 300.0` and `sum(sleeper.calls) + next_delay > 300.0`, where the test computes `next_delay` independently from the clock with a literal formula, `boundary = 60.0 - (clock() % 60.0); next_delay = boundary + 0.999 * boundary`, never by calling a governor method. Expected values at planning (S2's algorithm, clock from a multiple of 60; float rounding at `_CLOCK_START` may move the last digits): five requests, sleeps ≈ `[119.94, 0.11994, 119.82018, 0.23964]`, sum ≈ 240.12, next ≈ 119.70; assert only the two inequalities and `len(transport.requests) == len(sleeper.calls) + 1`. RED: plain `ProviderUnavailable` after three requests. — kills: swap-case on rule 1 (no sleep is ever a boundary wait, so the `+ next_delay > 300` bound fails and the type differs)

- [ ] T008 Implement TC-COMP-247 (A refused redirect and a forcelisted 503 stay retryable and reach no other host) in `tests/unit/test_massive_retry.py`, `# Implements TC-COMP-247`, parametrised over two responders: `redirect_answer` (the harness default, `302` to `https://198.51.100.7/`) and `json_answer({"status": "ERROR", "request_id": "r503", "error": "Service Unavailable"}, 503)`; jitter `[0.0]`; read `fetch_reference("AAPL")`. Assert `pytest.raises(ProviderUnavailable)`, `not isinstance(err, ProviderRateLimited)`, `isinstance(err.__cause__, MaxRetryError)`, `len(transport.requests) == 3`, every request host `api.massive.com` and none `198.51.100.7`, and `sleeper.calls == [0.0, 0.0]` (two backoff delays at jitter 0.0, never a 60.0 boundary wait). Step 3 of the case is T016's run of `tests/unit/test_massive_redirects.py` unchanged. Passes at RED as a regression guard (observed at planning: three requests to `api.massive.com` for both). — kills: negate-boolean `and` → `or` in rule 1 (any `MaxRetryError` would be `THROTTLED`: six requests and `ProviderRateLimited`)

- [ ] T009 Implement TC-COMP-248 (classify_for_governor matches only urllib3's 429 constant; the body check still throttles) in `tests/unit/test_massive_retry.py`, `# Implements TC-COMP-248`, as one parametrised test reaching the function as `massive_client.classify_for_governor` through `from factorflow.ingestion.massive import client as massive_client` (so RED is a per-test `AttributeError`, not a collection error that would mask T004–T008's RED). Rows, each expected `Outcome` a literal: `MaxRetryError(None, "/v3/reference/tickers/AAPL", ResponseError(ResponseError.SPECIFIC_ERROR.format(status_code=429)))` → `THROTTLED`; the same with `status_code=503` → `RETRYABLE`; reason `ResponseError("too many redirects")` → `RETRYABLE`; reason `NewConnectionError(None, "Failed to establish a new connection")` → `RETRYABLE`; `BadResponse(<error_rate_limited.json text>)` → `THROTTLED` (the only row building a `BadResponse` for a `429`, standing for an SDK without the forcelist entry; it patches nothing). The test builds the `429` string from `ResponseError.SPECIFIC_ERROR` with the literal `429`, never from `client._THROTTLED_RETRY_REASON` (that would be a symmetric comparison). — kills: off-by-one `429` → `430` in the constant; negate-boolean `==` → `!=`; negate-boolean `and` → `or` (the `503` row becomes `THROTTLED`); swap-case `THROTTLED` → `RETRYABLE` on rule 3 (`is_rate_limited_body`); negate-boolean dropping `not` in `if not isinstance(exc, BadResponse)`

- [ ] T010 Implement TC-COMP-249 (The plan-refusal and unrecognised-403 rows pass through the lifted classifier) by adding `# Implements TC-COMP-249` above CAP-003-E8-S1's real-transport plan-refusal test (TC-COMP-230) and unrecognised-`403` test (TC-COMP-231) and above the delivered `test_timeouts_and_server_errors_retry_to_the_attempt_limit` (CAP-001's TC-INT-026), all in `tests/unit/test_massive_retry.py`; their bodies and assertions are not edited (DAC-E8-S3-7: "pass unchanged"). They pass at RED and must still pass after T014–T015 with `classify_for_governor` wired in: one request and `ProviderNotEntitled`; three requests and `ProviderUnavailable`; three sends and `ProviderUnavailable` for the timeout and unknown-shape rows. — kills: swap-case on rule 4, `Outcome.FATAL if is_fatal_for_governor(error) else Outcome.RETRYABLE` → branches swapped (plan refusal sent three times; unrecognised `403` sent once); hand-written removal of the `except BadResponse` re-raise in `_through_governor` (the SDK's `BadResponse` escapes instead of `ProviderNotEntitled`)

- [ ] T011 Implement TC-COMP-251 (The 429 change adds no package and no test fakes a 429 BadResponse or reads attempts) in `tests/unit/test_massive_retry.py` as a static test, `# Implements TC-COMP-251`, following the repository's static-guard precedent (`tests/unit/test_research_sql_is_append_only.py` reads source under `REPO_ROOT`). Using `ast` only, never a text regex over test files: (a) `src/factorflow/ingestion/massive/client.py` has an `ImportFrom` of `urllib3.exceptions` naming `MaxRetryError` and `ResponseError`; (b) its module-level `_THROTTLED_RETRY_REASON` is assigned a `Call` of `ResponseError.SPECIFIC_ERROR.format` with keyword `status_code=429`, and no string constant in `client.py` equals `"too many 429 error responses"` (DAC-E8-S3-9: "never a hand-typed copy"); (c) in every `tests/**/*.py`, no function that contains a `Call` to `patch` (a `Name` or `Attribute` named `patch`) whose first argument is a string constant ending `.RESTClient` also contains a string constant containing `error_rate_limited` or `429`, or an integer constant `429`; (d) in `tests/unit/test_massive_retry.py` and `tests/unit/test_massive_client_governor_integration.py`, no `ast.Attribute` has `attr == "attempts"` and no `ast.Subscript` slice is the constant `"attempts"`. RED: (a) and (b) fail on the current `client.py`. The lock-file clause is a Validation Plan command, not a test. — kills: hand-written `_THROTTLED_RETRY_REASON = ResponseError.SPECIFIC_ERROR.format(status_code=429)` → `"too many 429 error responses"`, which no behavioural test can tell apart at the locked urllib3 2.7.0 (see Other Notes); re-adding the patched-`RESTClient` `429` test

### Additional Unit Tests

- [ ] T012 Add three rows to T009's parametrised `classify_for_governor` test in `tests/unit/test_massive_retry.py` (same `# Implements TC-COMP-248` test; these rows are implementation-level, beyond the case's steps): (i) `MaxRetryError(None, "/v3/reference/tickers/AAPL", ProtocolError(ResponseError.SPECIFIC_ERROR.format(status_code=429)))` → `RETRYABLE`, a reason that is not a `ResponseError` although its text equals the `429` string (`ProtocolError` is used because its `str` is exactly the message, checked at planning; `NewConnectionError`'s `str` is prefixed `"None: "` and would not exercise the conjunct); (ii) `BadResponse(<error_not_found.json text>)` → `FATAL`; (iii) `BadResponse(<error_unknown_shape.json text>)` → `RETRYABLE` (delivered fixtures; rule 4 unchanged at unit level, DAC-E8-3). — kills: hand-written removal of the `isinstance(exc.reason, ResponseError)` conjunct in rule 1 (row (i) becomes `THROTTLED`); swap-case on rule 4's conditional (rows (ii) and (iii) swap)

**Checkpoint**: Cycle 1 — T002 fails with `AttributeError` before T013. Cycle 2 — T004–T007 fail with a plain `ProviderUnavailable` after three requests, T009 and T012 fail with `AttributeError: … classify_for_governor`, T011 fails on (a) and (b); T008 and T010 pass as regression guards. No production code yet.

---

## Phase 3: Core Implementation

**Purpose**: Add the stock boundary and the lifted classifier in `client.py`, exactly as massive-client CAP-003 §2.3 and §2.6 specify.

- [ ] T013 Add `MassiveClient.start_instrument(self) -> None` to `src/factorflow/ingestion/massive/client.py`, after `__init__`, whose body is the single call `self._governor.start_throttle_budget()` and whose docstring is the design's (§2.6: the budget is spent per stock across all of that stock's requests; `acquisition-runner` calls this once per stock at the top-of-stock checkpoint; CAP-003 system design §3.6 note 3). It sends nothing. Cycle 1 GREEN for T002. (traces to DAC-E8-7, DAC-E8-S3-8)

- [ ] T014 In `src/factorflow/ingestion/massive/client.py`: add `from urllib3.exceptions import MaxRetryError, ResponseError` beside the delivered `from urllib3 import HTTPResponse`; add the module constant `_THROTTLED_RETRY_REASON = ResponseError.SPECIFIC_ERROR.format(status_code=429)` with a comment naming urllib3 2.7.0's constant and system design assumption 10; add the module-level `classify_for_governor(exc: BaseException) -> Outcome` before `class MassiveClient`, with the design's docstring and its four rules in order, first match winning: (1) `isinstance(exc, MaxRetryError) and isinstance(exc.reason, ResponseError) and str(exc.reason) == _THROTTLED_RETRY_REASON` → `Outcome.THROTTLED`; (2) `not isinstance(exc, BadResponse)` → `Outcome.RETRYABLE`; (3) `is_rate_limited_body(str(exc))` → `Outcome.THROTTLED`; (4) `Outcome.FATAL if is_fatal_for_governor(classify_error_body(str(exc))) else Outcome.RETRYABLE`. Add `"classify_for_governor"` to `__all__` (it is an in-process interface, massive-client §11). No other import, constant or package. (traces to DAC-E8-2, DAC-E8-3, DAC-E8-S3-6, DAC-E8-S3-9)

**Checkpoint**: T002, T009, T011 and T012 pass; T004–T007 still fail until T015 wires the function in.

---

## Phase 4: Integration

**Purpose**: Route every governed request through the lifted classifier.

- [ ] T015 Rewrite `MassiveClient._through_governor` in `src/factorflow/ingestion/massive/client.py` to `return self._governor.execute(send, classify_for_governor)`, deleting the nested `classify` closure, and keep the delivered `except BadResponse as exc: raise classify_error_body(str(exc)) from exc` with the design's comment (a `FATAL` re-raise, typed from the one response). Pass `classify_for_governor` positionally, as the delivered call did, so the delivered `execute` spies in `test_massive_client_governor_integration.py` (`lambda self, send, classify: send()`) keep matching. Cycle 2 GREEN for T004–T011 and T012. (traces to AC-30, AC-29, DAC-E8-2, DAC-E8-S3-1 to DAC-E8-S3-7)

**Checkpoint**: The focused command passes: every new row green, CAP-003-E8-S1's rows and the delivered TC-INT-026 and redirect rows green unchanged.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [ ] T016 Update the module docstring of `src/factorflow/ingestion/massive/client.py` with one paragraph naming CAP-003-E8-S3 and massive-client CAP-003 §2.3 and §2.6 (the `429` `MaxRetryError` is throttling; `start_instrument()` is the stock boundary), leaving the CAP-001 text as it is. Then run, on the final bytes, every Constitution-Defined Command, the delivered `tests/unit/test_massive_redirects.py` unchanged (TC-COMP-247 step 3), the lock-file check and the review greps in Story-Specific Validation. Do not open a pull request or build a release from a commit holding this story without CAP-003-E8-S4 (owner decision 2026-11-08). (traces to AC-30, DAC-E8-S3-5, DAC-E8-S3-9)
- [ ] T017 After each TDD cycle in T002–T015 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E8-S3-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it. Story coding is attended with one commit per story, so the story commit carries both cycles and this evidence file and cannot hold its own hash: record `commit_hash: stage` for both cycles, which `scripts/check-tdd-evidence.py` resolves to the story commit that introduced each `diff_sha256`. Two cycles are expected: cycle 1 (T002 → T013) and cycle 2 (T003–T011, T012 → T014–T015). (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E8-S1 | hard | Existing graph edge. `ProviderNotEntitled` in `errors.py` and its real-transport rows TC-COMP-230/231 in `tests/unit/test_massive_retry.py`, which T010 marks and re-runs through `classify_for_governor` (DAC-E8-S3-7), and the real-transport harness (`_production_settings`, `_real_transport_client`, `_CLOCK_START`) T003 reuses. |
| CAP-003-E8-S2 | hard | Existing graph edge. `RateLimitGovernor.start_throttle_budget()` (T013, T002's `MagicMock(spec=...)`), `ProviderRateLimited` and its `rate_limited` kind (T005–T008), and the check-before-wait budget whose arithmetic T004–T007 assert. |
| CAP-003-E8-S4 | reverse | E8-S4's runner calls `MassiveClient.start_instrument()` once per stock and its integration rows drive this story's `429` classification; nothing here imports E8-S4's code. Joint landing and release (owner decision 2026-11-08) is a release constraint, not an implementation prerequisite. |

### Task Dependencies
- T001: none; gates every other task.
- Cycle 1: T002 (RED) → T013 (GREEN) → T017 entry for cycle 1.
- Cycle 2 (after cycle 1): T003 → T004, T005, T006, T007, T008, T009, T010, T011, T012 (all in `tests/unit/test_massive_retry.py`, written in that order) → T014 → T015 → T017 entry for cycle 2.
- T016: depends on T015.
- T017: interleaved — runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities
- T002 (`test_massive_client_governor_integration.py`) can be written in parallel with T003–T011 (`test_massive_retry.py`), but its GREEN (T013) must close cycle 1 before cycle 2's tests are run as RED, because T005–T007 call `start_instrument()`.
- T004–T011 share one file and are not parallel.
- T013 and T014 touch the same file; keep them in their cycles.

---

## Validation Plan

### Constitution-Defined Commands
- Build: `uv build`
- Test: `uv run pytest` (or `uv run pytest -m 'not postgres'` when no container runtime is available, reported as an exclusion; this story adds no `postgres` row)
- Focused tests, per phase: `uv run pytest tests/unit/test_massive_retry.py tests/unit/test_massive_client_governor_integration.py tests/unit/test_massive_redirects.py tests/unit/test_massive_error_classification.py -q` — run at each phase checkpoint and as `scripts/mutation-run.py run --command`; the full test command runs once on the final bytes. In this clone, which has no virtual environment, the equivalent is `PYTHONPATH=<project repo> /Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin/python -m pytest <same paths> -q -p no:cacheprovider` (36 passed at planning on the unchanged code).
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- DAC-E8-S3-1 to DAC-E8-S3-4: the focused command passes with T004–T007 green; their RED, captured before T014–T015, shows a plain `ProviderUnavailable` after three requests (the production F1 symptom).
- DAC-E8-S3-5: `tests/unit/test_massive_redirects.py` passes with no edit (`git diff --exit-code -- tests/unit/test_massive_redirects.py` against the story's base); T008 green.
- DAC-E8-S3-6, DAC-E8-S3-8: T009, T012 and T002 green.
- DAC-E8-S3-7: CAP-003-E8-S1's TC-COMP-230/231 tests and the delivered TC-INT-026 test pass, and their diff in this story is comment lines only (`git diff -U0 -- tests/unit/test_massive_retry.py` shows no changed line inside those three functions other than `# Implements TC-COMP-249`).
- DAC-E8-S3-9, no package added: `git diff --cached --exit-code -- uv.lock pyproject.toml` exits 0 before the story commit (and `git diff --exit-code HEAD~1 HEAD -- uv.lock pyproject.toml` after it).
- DAC-E8-S3-9, review: T011 green; `grep -n "urllib3.exceptions" src/factorflow/ingestion/massive/client.py` shows the one import; the SDK construction block in `MassiveClient.__init__` (`retries=0`, `pagination=False`, `trace=False`, `base=`) is unchanged in the diff.
- Scope: the story's diff touches only `src/factorflow/ingestion/massive/client.py`, `tests/unit/test_massive_retry.py`, `tests/unit/test_massive_client_governor_integration.py`, the TDD-evidence file and this plan's checkboxes.
- Joint release: the pull request, or the release, also carries CAP-003-E8-S4 (story Description; backlog review v6 FINDING-13).

---

## Notes

### Resolved Conflicts

1. **DAC-E8-20 ("every test of a `429` … MUST run through the real SDK") against TC-COMP-248's direct calls (DAC-E8-S3-6).** Both bind; DAC-E8-2, at the same epic level as DAC-E8-20, itself requires that "a `BadResponse` carrying the rate-limited body MUST still classify as `THROTTLED`", which no real-transport test can reach because the locked SDK never builds that `BadResponse` under `retries=0`. Applying constraint 9.2, DAC-E8-20's operative requirement is that request-driven `429`/`403` tests use the transport harness and that no test patches `RESTClient` to raise a `BadResponse` for a `429`; "which the real SDK cannot raise" is its rationale. T009 calls the pure function without patching anything, as massive-client §7's rows "The 429 rule uses urllib3's constant" and "The defensive body check still throttles" specify. No source edit is needed.
2. **massive-client §2.1 lists more files than this story edits** (`errors.py`, `__init__.py`, `test_massive_error_classification.py`, `test_massive_failure_reasons.py`). The backlog splits them across CAP-003-E8-S1 and CAP-003-E8-S2; this story's Implementation section names `client.py`, `test_massive_retry.py` and `test_massive_client_governor_integration.py`, and the plan touches only those. `test_massive_error_classification.py` is in the focused command only to show the rule-3 body check (TC-COMP-225, delivered) still passes.

### Open Gaps

1. **"The read" in DAC-E8-S3-4 and DAC-E8-S3-5 is unnamed.** No artifact names the endpoint for the jitter row or the redirect/`503` row. The plan uses `fetch_reference("AAPL")` for both: it is the read DAC-E8-S3-2 names for the persistent-`429` row the jitter row varies, and the read the delivered redirect row (`test_main_pool_redirect_is_refused_and_retried_to_the_same_host`) uses. Any single-request read gives the same counts. Flag for the next revision of `tests/component/massive-client-tests.md` (TC-COMP-246, TC-COMP-247).
2. **TC-COMP-251 step 4 "compare the lock file with the base branch" names no base.** The plan checks the staged diff of `uv.lock` and `pyproject.toml` before the one story commit, and `HEAD~1..HEAD` after it, which is the same comparison for a one-commit story. Flag for the same test specification's next revision.

No value in this story is undetermined in the sense of constraint 9b (bound, limit, default or threshold): the budget (300 s), `max_attempts` (3), the rate (60 per minute) and the jitter values are fixed by the story and the settings defaults. No owner decision is pending from this plan.

### Other Notes

- **Two `TC-INT-025` IDs.** `# Implements TC-INT-025` in `test_massive_retry.py` and in `test_massive_client_governor_integration.py` are CAP-001's delivered IDs, not CAP-003's TC-INT-025 (coverage-matrix note 13). T004 keeps the marker on the replacement test, as DAC-E8-S3-1 requires, beside `# Implements TC-COMP-243`; the governor-integration file's `TC-INT-025` test (first-page typed error) is untouched.
- **TC ownership.** The coverage matrix maps DAC-E8-2, -3, -5, -6 and -7 to cases owned by sibling stories as well (TC-COMP-231, TC-COMP-235 to TC-COMP-242, TC-COMP-252). Each is implemented by the story whose story-level DAC it traces; this plan's mandatory set is the nine cases tracing DAC-E8-S3-1 to DAC-E8-S3-9 (TC-COMP-243 to TC-COMP-251), and TC-COMP-249 re-runs CAP-003-E8-S1's TC-COMP-230/231 rows rather than duplicating them.
- **Root cause reproduced at planning.** On the current `client.py`, through `forbid_sockets` + `RecordingMakeRequest` with production settings and a `FakeClock(600.0)` as `monotonic` and `now`: a `429` gives three requests to `/v3/reference/tickers/AAPL?ticker=AAPL`, backoff sleeps `[0.0, 0.0]`, and `ProviderUnavailable` with `__cause__` `MaxRetryError(reason=ResponseError('too many 429 error responses'))`, equal to `ResponseError.SPECIFIC_ERROR.format(status_code=429)`; a `503` gives the same with `'too many 503 error responses'`; the `302` gives `ResponseError('too many redirects')`, three requests, all to `api.massive.com`. Production settings defaults: `max_attempts` 3, `max_throttle_wait_seconds` 300.0, `backoff_initial_seconds` 2.0, `timeout_seconds` 30.0.
- **Budget arithmetic the rows rely on (CAP-003-E8-S2's algorithm).** Clock from a multiple of 60 (`_CLOCK_START`), jitter `[0.0]`: five waits of exactly 60.0 fit (spent 240 + 60 = 300, not > 300); the sixth `429` would make 360, so `ProviderRateLimited` is raised after six requests. Jitter `[0.999]`: five requests, four sleeps summing ≈ 240.12, next declined delay ≈ 119.70. If CAP-003-E8-S2 lands with different arithmetic, T004–T007's literals must follow S2's approved design (rate-limit-governor §2.2), not be loosened.
- **No shared state between tests.** The budget is instance state on the governor (rate-limit-governor §3); every test builds its own client, governor, clock and transport. T006 repeats T005's arrange rather than depending on test order.
- **Equivalent mutant recorded.** `_THROTTLED_RETRY_REASON = ResponseError.SPECIFIC_ERROR.format(status_code=429)` → the literal `"too many 429 error responses"` has the same value at the locked urllib3 2.7.0, so no behavioural test can kill it; T011's AST check (b) observes the declaration the story requires ("never a hand-typed copy") instead.
- **Hand-written mutants** for the mutation run, beside the generated ones:
  - `src/factorflow/ingestion/massive/client.py`: `self._governor.start_throttle_budget()` → `pass` (killed by T002, T006)
  - `src/factorflow/ingestion/massive/client.py`: `return self._governor.execute(send, classify_for_governor)` → `return self._governor.execute(send, lambda exc: Outcome.RETRYABLE if not isinstance(exc, BadResponse) else classify_for_governor(exc))` (the pre-change closure; killed by T004–T007)
  - `src/factorflow/ingestion/massive/client.py`: `and isinstance(exc.reason, ResponseError)` → removed (killed by T012's `ProtocolError` row carrying the `429` text)
  - `src/factorflow/ingestion/massive/client.py`: `_THROTTLED_RETRY_REASON = ResponseError.SPECIFIC_ERROR.format(status_code=429)` → `_THROTTLED_RETRY_REASON = "too many 429 error responses"` (equivalent behaviourally; killed by T011 (b))
  - `src/factorflow/ingestion/massive/client.py`: `raise classify_error_body(str(exc)) from exc` → `raise` (killed by T010 via CAP-003-E8-S1's plan-refusal row, which expects `ProviderNotEntitled`)
- **Generated operators that apply:** `negate-boolean` (`==`/`!=`, `and`/`or`, the leading `not` in rule 2), `off-by-one` (`429`), `swap-case` (`Outcome.THROTTLED`/`RETRYABLE`/`FATAL` in each rule), `drop-defaulted-argument` (`retries=0` in the delivered SDK construction: killed by the delivered `test_massive_redirects.py` rows and T008, which would see the redirect followed).
- **Test-strength review of each task against the four failure modes.** Symmetric comparison: T009 and T011 build the `429` string from urllib3's constant in the test, never from `client._THROTTLED_RETRY_REASON`; T007 computes the next delay with its own formula, never through the governor. Wrong property: T005, T006 and T008 assert `ProviderRateLimited` membership (or its absence) and request counts, because `ProviderUnavailable` alone holds under both the mutant and the real code; T004 asserts the literal sleep list, because a backoff at jitter 0.0 is `0.0` and a boundary wait is `60.0`. Inferred declaration: the hand-typed constant is handled above. Self-contradicting check: T011 uses `ast` nodes, not text, so its own source (which names `RESTClient`, `429`, `error_rate_limited` and `attempts` as string constants inside comparisons) does not match its own rules (c) and (d); the Story-Specific Validation greps target `client.py` and `uv.lock`/`pyproject.toml` only, which the plan's code satisfies.
- **`classify_for_governor` in `__all__`.** No artifact says whether `client.__all__` lists it; massive-client §11 names it an in-process interface, so T014 adds it. `factorflow.ingestion.massive.__init__` is not changed (massive-client §2.1 re-exports only the two new error types, which are CAP-003-E8-S1's and CAP-003-E8-S2's).
- **Joint landing with CAP-003-E8-S4.** Without E8-S4's per-stock `start_instrument()` call, this story's budget starts at client construction and, because `CredentialAwareClientFactory.get_or_rebuild` caches one client per credential, spans the ingestion process; after 300 s of throttling every later throttled request would fail after one send. The coder must not open a pull request or build a release holding this story without E8-S4.
