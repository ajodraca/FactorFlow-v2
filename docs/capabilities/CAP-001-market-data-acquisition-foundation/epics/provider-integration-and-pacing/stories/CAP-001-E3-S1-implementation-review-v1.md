---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-15
updated: 2026-09-15
story_id: "CAP-001-E3-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-15T23:19:19Z"
reviewed_head: "cfcce2281eeec62730c2a922148dcb88ffcf72bf"
review_base: "5c21451942c25c1d76173ea1369b99f7becd8980"
reviewed_state_revision: "sha256:ea40b84cf3a4546d69b34cc38cd971b3689b0c8e47b67574dca6da528f247ebb"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E3-S1
    artifact_version: 1
    content_revision: sha256:0ecf0d721fa121cceb4fbc143d1d862fbea08084b99442398a8586ced8eda090
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-09-15T23:19:19Z
  source_artifacts:
    - id: CAP-001-E3-S1
      version: "1"
    - id: CAP-001-E3-S1-tasks
      version: "1"
    - id: CAP-001-component-design-massive-client
      version: "7"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 1 |
| High findings | 3 |
| Medium findings | 4 |
| Low findings | 4 |
| Acceptance criteria | 10/11 satisfied |
| Planned tasks | 8/12 verified (1 justified NOT APPLICABLE, 3 PARTIAL) |
| Required validation | 7/7 passed |

**Verdict:** CHANGES-REQUIRED — CRITICAL 1 · HIGH 3 · MEDIUM 4 · LOW 4 · **total 12**

| ID | Severity | Title |
|----|----------|-------|
| IR-001 | CRITICAL | Eight of eleven provider requests bypass the rate-limit governor; their errors escape as raw SDK exceptions |
| IR-002 | HIGH | No test exercises the governor seam, so T011's checkpoint has no evidence |
| IR-003 | HIGH | The mandatory market-status test (TC-COMP-213) is vacuous |
| IR-004 | HIGH | T012's required mutation evidence omits two of its five named areas |
| IR-005 | MEDIUM | A malformed or empty 200 response raises a bare `KeyError` or returns empty instead of a typed error |
| IR-006 | MEDIUM | `fetch_corporate_actions` silently ignores the requested date range for ticker-change events |
| IR-007 | MEDIUM | TC-ID traceability comments are mismapped in two test files |
| IR-008 | MEDIUM | DEC-0001, which the implementation now cites, is uncommitted, unresolvable from this repo, and internally inconsistent |
| IR-009 | LOW | The credential log-record test is near-vacuous |
| IR-010 | LOW | An unrelated, vacuous assertion was added to `test_massive_sdk_config.py` |
| IR-011 | LOW | The TDD evidence's full-suite figures do not reproduce |
| IR-012 | LOW | The task plan header names the wrong branch |

The four reads exist, are named in the product's vocabulary, and parse the
provider's shapes into the CAP-001-E3-S2 models. The SDK-construction half of
the story is genuinely correct and genuinely tested: `retries=0`,
`pagination=False`, `trace=False` and both explicit timeouts are asserted
against the substituted `RESTClient`, and the credential test in
`tests/unit/test_massive_auth.py:102` is the strongest test in the change set —
it drives the *real* SDK with only `urllib3.PoolManager.request` substituted and
proves the key travels in an `Authorization: Bearer` header and never in a URL.
I separately confirmed against the installed SDK that every method and keyword
this client calls (`get_ticker_details`, `get_aggs`,
`list_financials_*`, `list_stocks_splits`, `list_stocks_dividends`,
`vx.list_ipos`, `get_ticker_events`, `_get`) exists with the signature used, so
the mock-heavy tests are not hiding a fictional API surface.

The gate fails on T011. The task plan's Phase 4 checkpoint reads "Every SDK
request, including a `next_url` page, reaches the existing governor seam exactly
once", and `component-design-massive-client.md` section 2.2 states "Every
request is paced by the governor before it is issued". Neither holds. Only the
two non-paged reads (`_get_one`) and subsequent pages (`_next_page`) are
submitted through `RateLimitGovernor.execute`; the **first** page of every paged
read is handed to `follow_pages` as a bare lambda that calls the SDK directly.
I measured this by counting `RateLimitGovernor.execute` invocations per read:
`fetch_financials` issues four provider requests and zero governor calls,
`fetch_corporate_actions` four and one, `fetch_daily_bars` two and one. Beyond
the lost pacing budget and lost retry, the consequence that makes this CRITICAL
rather than HIGH is the error contract: a provider failure on any of those
requests propagates as `massive.exceptions.BadResponse`, the raw SDK type, not
as the typed `InstrumentNotFound` / `CredentialRejected` / `ProviderUnavailable`
that design sections 2.4 and 8 require and that `CAP-001-E4`'s per-instrument
failure handling (AC-11) depends on. No test covers the governor seam at all, in
either direction, which is why an implementation this far from its plan passes a
green suite.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S1` |
| HEAD | `cfcce2281eeec62730c2a922148dcb88ffcf72bf` |
| Review base | `main` merge-base `5c21451942c25c1d76173ea1369b99f7becd8980` |
| Working tree | clean — no staged, unstaged, or untracked files at review start or after validation |
| Changed files reviewed | 14 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `pyproject.toml` | modified | T001 (`massive>=2`); mypy override for the stub-less SDK is a justified consequence of T001/T009 |
| `uv.lock` | modified | T001 |
| `src/factorflow/ingestion/massive/client.py` | added | T009, T011 |
| `src/factorflow/ingestion/massive/paging.py` | added | T010 |
| `tests/unit/test_massive_reference.py` | modified (appended) | T003 |
| `tests/unit/test_massive_bars.py` | modified (appended) | T004, T008 |
| `tests/unit/test_massive_financials.py` | modified (appended) | T005 |
| `tests/unit/test_massive_actions.py` | modified (appended) | T005 |
| `tests/unit/test_massive_client_interface.py` | added | T006 |
| `tests/unit/test_massive_sdk_config.py` | added | T007 (one added test is unjustified — IR-010) |
| `tests/unit/test_massive_auth.py` | added | T007 |
| `.../stories/CAP-001-E3-S1-tasks.md` | modified | task-state bookkeeping (12 checkboxes) |
| `.../stories/CAP-001-E3-S1-tdd-evidence.yaml` | added | T012 |
| `.../stories/CAP-001-E3-S1.md` | modified | `status: planning` → `in-review` |

No production file outside `src/factorflow/ingestion/massive/` was touched, and
no existing test line was deleted (`git diff --numstat` shows additions only in
every test file). The change set is otherwise tightly scoped to the plan.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-3 | SATISFIED | `client.py:66` `fetch_reference`, `:77` `fetch_daily_bars`, `:105` `fetch_financials`, `:137` `fetch_corporate_actions` | `test_massive_reference.py:142`, `test_massive_bars.py:192`, `test_massive_financials.py:166`, `test_massive_actions.py:185` | Each read returns its parsed model type for a covered symbol. Range fidelity is imperfect for ticker-change events (IR-006) and the unknown-instrument counterpart is broken on three of four reads (IR-001, IR-005) |
| DAC-E3-1 | SATISFIED | `client.py:50` — four named methods, no generic path operation | `test_massive_client_interface.py:19,37,51,61,68` | The public surface is exactly the four reads, each taking `symbol` (+ `start`/`end` where applicable) |
| DAC-E3-10 | SATISFIED | `client.py:72-73` → `models.TickerReference` | `test_massive_reference.py:142` asserts `cik`, `composite_figi`, `share_class_figi` survive the client | — |
| DAC-E3-11 | SATISFIED | `client.py:66-73` (single-ticker read is status-agnostic) | `test_massive_reference.py:181` asserts `is_active is False` and `delisted_utc is not None` through the client | — |
| DAC-E3-14 | SATISFIED | `client.py:50-51` docstring and method set | `test_massive_client_interface.py:78` asserts no `get`/`request`/`call`/`stream`/`subscribe` member | Negative-shape assertion; adequate for a "does not foreclose" criterion |
| DAC-E3-S1-1 | SATISFIED | `client.py:55-62` — `retries=0`, `connect_timeout`, `read_timeout`, `pagination=False`, `trace=False` | `test_massive_sdk_config.py:49,60,70,80,92` | All five constructor assertions inspect the substituted `RESTClient` call kwargs; mutation-2 in the TDD evidence reproduces |
| DAC-E3-S1-2 | SATISFIED | `client.py:89-97` — `multiplier=1`, `timespan="day"`, `from_`/`to` via `date.isoformat()` | `test_massive_bars.py:156`, `:176` | `adjusted=False` is additionally pinned; see IR-008 on the decision record behind it |
| DAC-E3-S1-3 | SATISFIED | `paging.py:57-67` — loop follows `next_url` until falsy, never catches a later page's exception | `test_massive_bars.py:192` (two pages, ordered) and `:220` (second-page failure raises) | The non-partial guarantee is real: I confirmed the pager has no `try`/`except` |
| DAC-E3-S1-4 | SATISFIED | `client.py:72` `get_ticker_details` only | `test_massive_reference.py:161` asserts `list_tickers` is never called | Test carries the wrong TC ID (IR-007) |
| DAC-E3-S1-5 | **PARTIAL** | Correct: no code path in `client.py` references a market-status or holidays endpoint (verified by reading all four reads and every private helper) | `test_massive_sdk_config.py:104` never invokes a read, so it proves nothing | Production behavior is right; the mandatory test evidence is invalid (IR-003) |
| DAC-E3-S1-6 | SATISFIED | `client.py:56` `api_key=settings.api_key.get_secret_value()`; `:61` `trace=False` | `test_massive_auth.py:51`, `:102` (real SDK, `Authorization: Bearer`, no `apiKey` in URL or fields) | The log-record test at `:61` is weak (IR-009), but `:102` carries the criterion |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `pyproject.toml:16` `"massive>=2"`; `uv.lock` +145 lines; `uv sync`/`uv build` succeed | No vendor-neutral abstraction was added, as required |
| T002 | complete | NOT APPLICABLE | `src/factorflow/ingestion/__init__.py` and `.../massive/__init__.py` exist and export correctly, but were created by CAP-001-E3-S3/S4 (`git log` → `18051ee`, `e554152`, `cb7aa10`); this story's diff contains neither file | End state is correct; the checkbox records work this story did not do |
| T003 | complete | VERIFIED | `test_massive_reference.py:142-211` — four client-facing tests | TC IDs on two of them are mismapped (IR-007) |
| T004 | complete | VERIFIED | `test_massive_bars.py:156-217` | Request-parameter and two-page assertions are both regression-sensitive |
| T005 | complete | VERIFIED | `test_massive_financials.py:166-214`; `test_massive_actions.py:185-246` | Each read is asserted to return its complete parsed result for a covered symbol |
| T006 | complete | VERIFIED | `test_massive_client_interface.py:19-90` | TC-COMP-195 and TC-COMP-208 both represented |
| T007 | complete | **PARTIAL** | `test_massive_sdk_config.py` + `test_massive_auth.py` | The four SDK-construction assertions and the credential assertions are sound; "assert no market-status request is made" is implemented as a test that never issues a request (IR-003) |
| T008 | complete | VERIFIED | `test_massive_bars.py:220-239` | A second-page `BadResponse` produces `ProviderUnavailable`; no partial range is returned |
| T009 | complete | VERIFIED | `client.py:50-282` — one reusable `RESTClient`, four reads, section 2.5 paths and parameters | Result mapping matches section 2.5 (statement type per endpoint; `effective_on` per action type). Robustness gaps recorded as IR-005/IR-006 |
| T010 | complete | VERIFIED | `paging.py:32-76` — follows only present `next_url`, one page at a time, no partial result on failure | The module is correct; the permit defect is in how `client.py` wires `first_page` (T011) |
| T011 | complete | **NOT IMPLEMENTED (for the initial request of every paged read)** | `client.py:245-252` `_next_page` and `:254-258` `_get_one` do reach `RateLimitGovernor.execute`; `client.py:89`, `:121`/`:238`, `:153`, `:169`, `:185` do not | The checkpoint "Every SDK request, including a `next_url` page, reaches the existing governor seam exactly once" is measurably false (IR-001) |
| T012 | complete | **PARTIAL** | `CAP-001-E3-S1-tdd-evidence.yaml` records seven mutations | The task names five mutation areas; "forbidden endpoints" and "credential redaction" have no mutation entry (IR-004). Suite figures do not reproduce (IR-011) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_fetch_reference_returns_product_shaped_reference` / TC-COMP-003, TC-COMP-204 | ADEQUATE | Drives the real `fetch_reference` through a substituted SDK, asserts the three identity fields survive as model attributes | none |
| `test_fetch_reference_uses_the_single_ticker_endpoint_only` / TC-COMP-212 (labeled 205) | ADEQUATE | `get_ticker_details` called once with the symbol and `raw=True`; `list_tickers` never called | TC ID mismapped (IR-007) |
| `test_fetch_reference_delisted_instrument_carries_active_and_delisted_fields` / TC-COMP-205 (labeled 212) | ADEQUATE | Delisted fixture returns `is_active is False`, `delisted_utc` set | TC ID mismapped (IR-007) |
| `test_fetch_reference_raises_instrument_not_found_for_unknown_symbol` | ADEQUATE | A `BadResponse` carrying the 404 envelope becomes typed `InstrumentNotFound`; reproduces TDD mutation-7 | Covers only the one read that is governed |
| `test_fetch_daily_bars_requests_multiplier_1_day_timespan_and_inclusive_dates` / TC-COMP-210 | ADEQUATE | Exact kwargs asserted against the substituted SDK | none |
| `test_fetch_daily_bars_requests_unadjusted_bars` | ADEQUATE | Pins `adjusted is False`, which would otherwise silently follow the provider default | none |
| `test_fetch_daily_bars_returns_all_rows_from_a_two_page_response_in_order` / TC-COMP-211 | ADEQUATE | Two envelopes, second reached via `_get`; asserts both rows, their order, and `raw=True` | none |
| `test_fetch_daily_bars_raises_when_a_later_page_fails_rather_than_returning_partial` / T008 | ADEQUATE | Second page raises; `ProviderUnavailable` propagates and no partial list is returned | none |
| `test_fetch_financials_*` / TC-COMP-003 | ADEQUATE | All four sibling endpoints called once with `tickers` and `raw=True`; `statement_type` is asserted to come from which endpoint was called | No paging test on this read |
| `test_fetch_corporate_actions_*` / TC-COMP-003 | ADEQUATE | All four action types returned; split `effective_on` is `execution_date`; ticker events read from `results.events[]` without assuming paging | No assertion that the requested range is honoured (IR-006) |
| `test_exposes_exactly_the_four_named_read_operations` / TC-COMP-195 | ADEQUATE | Exact set equality on public methods — fails if a fifth public method appears | none |
| `test_client_carries_no_streaming_or_websocket_members_yet` / TC-COMP-208 | ADEQUATE | Disjointness against a forbidden-name set | Weak by nature, but proportionate to a "does not foreclose" criterion |
| `test_constructs_one_rest_client_with_{retries,pagination,trace}_disabled`, `..._explicit_connect_and_read_timeouts`, `..._exactly_one_reusable_rest_client` / TC-COMP-013, TC-COMP-209 | ADEQUATE | Inspect the exact constructor kwargs; the trace test is labeled TC-COMP-213 in error (IR-007) | none |
| `test_market_status_endpoint_is_never_called` / TC-COMP-213 | **WEAK** | Constructs the client and asserts `get_market_holidays`/`get_market_status` were not called. No read is ever invoked, so the assertions hold for any implementation, including one where `fetch_daily_bars` calls the forbidden endpoint | Does not exercise the intended path (IR-003) |
| `test_credential_is_passed_to_the_sdk_constructor` / TC-COMP-214 | ADEQUATE | Asserts the unwrapped `SecretStr` reaches `api_key` | none |
| `test_credential_never_appears_in_a_captured_log_record` / TC-COMP-214 | **WEAK** | Logs `str(client)` and asserts the secret is absent from `caplog.text`. `MassiveClient` defines no `__repr__`, so the default object repr can never contain the key | No read or error path is exercised (IR-009) |
| `test_client_holds_no_module_or_class_level_credential_attribute` | ADEQUATE | Scans module and class namespaces for the literal secret | none |
| `test_credential_is_sent_as_a_bearer_header_never_a_url_parameter` | ADEQUATE (strongest in the set) | Uses the real `RESTClient` with only `urllib3.PoolManager.request` patched; asserts the `Authorization: Bearer` header, and the absence of the secret and of `apiKey` from both URL and fields | none |
| `test_no_declared_field_is_typed_float_in_governor_settings_bridge` | **WEAK** | Asserts `not isinstance(settings.requests_per_minute, Decimal)` — an `int` field is trivially not a `Decimal`, and the assertion does not match the test's own name | Unrelated to any task (IR-010) |
| *Governor routing* (no test exists) | **MISSING** | Nothing asserts that any read submits its request through `RateLimitGovernor.execute`, nor that a first-page provider error is typed | T011 has no test evidence (IR-002) |

Determinism and isolation: every test substitutes the SDK or the urllib3
transport, injects a no-op `sleep` into the governor, and reads fixtures from
`tests/fixtures/massive/`. No network, clock, ordering, or environment
dependence was observed; the suite is fast (0.17s for the seven files) and
repeatable.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py tests/unit/test_massive_client_interface.py tests/unit/test_massive_sdk_config.py tests/unit/test_massive_auth.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 78 passed |
| `uv run pytest -m 'not postgres' -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 277 passed, 59 deselected (TDD evidence records 263 passed + 1 failure — IR-011) |
| `uv run pytest -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 336 passed, 0 failed; the `test_api_static_mount` failure the evidence calls pre-existing does not reproduce |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 101 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success, no issues in 30 source files |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel built |

Two reviewer-authored probes were executed from the scratchpad (no repository
file created or modified) to obtain the evidence behind IR-001, IR-005 and
IR-006:

| Probe | Observed result |
|-------|-----------------|
| Count `RateLimitGovernor.execute` calls vs SDK requests per read | `fetch_reference` 1/1; `fetch_daily_bars` (2 pages) 1/2; `fetch_financials` **0/4**; `fetch_corporate_actions` **1/4** |
| First-page `BadResponse` (404, 5xx, 401) on bars and financials | Raised `massive.exceptions.BadResponse` in all three cases; `execute` called 0 times |
| Reference read, 200 body with no `results` key | `builtins.KeyError: 'results'` |
| Corporate actions, split row missing `execution_date` | `builtins.KeyError: 'execution_date'` |
| Corporate actions, range 2020-01-01→2024-12-31, ticker-change event dated 1998-01-05 | Returned without raising or filtering: `[('ticker_change', '1998-01-05')]` |
| Daily bars, 200 with an empty result set | Returned `[]` (design section 2.2 maps this to `InstrumentNotFound`) |

### Validation Side Effects

- Before: `git status --porcelain` empty at `cfcce2281eeec62730c2a922148dcb88ffcf72bf`
- After: `git status --porcelain` empty at `cfcce2281eeec62730c2a922148dcb88ffcf72bf`
- Unexpected tracked-file changes: none

## Findings

### IR-001 — Eight of eleven provider requests bypass the rate-limit governor, and their errors escape as raw SDK exceptions

- **Severity**: CRITICAL
- **Status**: OPEN
- **Acceptance criteria**: AC-3 (unknown-instrument counterpart), AC-11 downstream; component design section 8 acceptance criteria 4, 5, 8
- **Tasks**: T011 (primary), T009
- **Files**: `src/factorflow/ingestion/massive/client.py:88-100` (`fetch_daily_bars` → `first_page`), `:120-124` with `:231-243` (`fetch_financials` → `_financial_page`), `:152-161`, `:168-177`, `:184-193` (`fetch_corporate_actions` splits/dividends/IPOs); contrast `:245-252` `_next_page` and `:254-258` `_get_one`, which are correct; `src/factorflow/ingestion/massive/paging.py:57`
- **Claim challenged**: T011 is checked complete, and its checkpoint asserts "Every SDK request, including a `next_url` page, reaches the existing governor seam exactly once."
- **Observed evidence**: `follow_pages` invokes `first_page()` directly at `paging.py:57`, and every caller passes a bare lambda that calls the SDK without `_through_governor`. Counting `RateLimitGovernor.execute` calls against SDK calls: `fetch_financials` 0 governor calls for 4 requests; `fetch_corporate_actions` 1 for 4; `fetch_daily_bars` 1 for 2. Only `fetch_reference` (1/1) is fully governed. A `BadResponse` raised by any ungoverned request propagates unchanged: the probe observed `massive.exceptions.BadResponse` escaping `fetch_daily_bars` for a 404 body, for a 5xx body, and escaping `fetch_financials` for a 401 body.
- **Expected evidence/behavior**: `component-design-massive-client.md` section 2.2 — "Every request is paced by the governor before it is issued"; section 2.2b — "each page is a provider request that must take a governor permit"; section 2.4 and section 8 acceptance criteria 4, 5 and 8 — an unrecognised instrument yields `InstrumentNotFound`, a rejected credential yields `CredentialRejected`, and an exhausted transport failure yields `ProviderUnavailable`. T011 requires each initial *and* paged request to go through `RateLimitGovernor.execute`.
- **Impact**: Three compounding failures. (1) Pacing: the owner's `requests_per_minute` budget is applied to roughly a quarter of real traffic, so a 3000-instrument run will exceed the configured rate and trip provider throttling the governor exists to prevent. (2) Retry: a transient 5xx or timeout on a first page fails the instrument immediately instead of being retried to `max_attempts`. (3) Error contract: `CAP-001-E4`'s runner catches the `MassiveError` family; a raw `massive.exceptions.BadResponse` is outside it, so an unknown symbol on bars/financials/actions cannot be recorded as a per-instrument `InstrumentNotFound` (AC-11) and a rejected credential on those reads cannot be recognised as the run-failing `CredentialRejected`. The exception also carries the raw provider body into whatever handler is left, which is the surface AC-13/SEC-SEC-001 were written to keep controlled.
- **Required remediation**: Route the initial request of every paged read through the same governor seam the subsequent pages use — for example by passing `first_page` as a governed callable (`lambda: self._through_governor(...)`) or by having `follow_pages` receive one `send` seam it applies to every page including the first. Then add the tests IR-002 names. Do not implement pacing or retry behavior here; the seam already exists.

### IR-002 — No test exercises the governor seam, so T011's checkpoint has no evidence in either direction

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: N/A (task-level); supports AC-3's failure counterpart
- **Tasks**: T011, T012
- **Files**: `tests/unit/test_massive_bars.py`, `tests/unit/test_massive_financials.py`, `tests/unit/test_massive_actions.py`, `tests/unit/test_massive_reference.py` — no test in any of them asserts a governor interaction
- **Claim challenged**: The task plan's Phase 4 checkpoint and the TDD evidence's claim that mutation-7 covers the governor path.
- **Observed evidence**: Every S1 test constructs a real `RateLimitGovernor` and passes it in, but none observes it. `grep` for `execute` across the seven S1 test files returns nothing. Mutation-7 in the TDD evidence mutates the `classify` closure and is detected only by `test_massive_reference.py:197` — the one read that happens to be governed — so it cannot distinguish "the governor is used everywhere" from "the governor is used once".
- **Expected evidence/behavior**: Skill constraint 8 and the plan's own checkpoint require a test that would fail if a request stopped reaching the governor. `component-design-rate-limit-governor.md` section 2.3 assigns this component the caller side of that contract.
- **Impact**: IR-001 is a plan-to-code divergence of exactly the kind a checkpoint test exists to catch, and it survived a green 78-test suite and a seven-mutation session. Without such a test, the same regression returns on the next refactor.
- **Required remediation**: Add at least one test per read asserting that the number of `RateLimitGovernor.execute` invocations equals the number of SDK requests issued, and at least one asserting that a first-page provider error surfaces as the typed `MassiveError` subclass rather than `BadResponse`.

### IR-003 — The mandatory market-status test (TC-COMP-213) never invokes a read, so it cannot fail

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S1-5
- **Tasks**: T007
- **Files**: `tests/unit/test_massive_sdk_config.py:104-113`
- **Claim challenged**: T007's "assert no market-status request is made", and the story's Testing bullet "A test asserts the market-status path is never requested".
- **Observed evidence**: The test body constructs `MassiveClient` inside the `patch` block and then asserts `not instance.get_market_holidays.called` and `not instance.get_market_status.called`. No `fetch_*` method is called, so no acquisition is run. The assertions would hold for an implementation in which every one of the four reads called the forbidden endpoint.
- **Expected evidence/behavior**: TC-COMP-213 reads "Given the market-status endpoint, **When acquisition runs**, Then it is never called". The test must exercise the acquisition path it is asserting about.
- **Impact**: DAC-E3-S1-5 has no valid test evidence. The production code is in fact correct today (I read all four reads and every helper; nothing references a market-status or holidays path), so this is a test-validity defect rather than a behavioral one — but it is a mandatory TC-ID that does not protect the criterion it is mapped to.
- **Required remediation**: Invoke all four reads against substituted responses inside the test, then assert the forbidden SDK methods (and `list_tickers`, already covered elsewhere) were never called. Record a matching mutation in the TDD evidence per IR-004.

### IR-004 — T012's required mutation evidence omits two of the five areas the task names

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: N/A (task-level)
- **Tasks**: T012
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tdd-evidence.yaml` (`manual_mutations`, 7 entries)
- **Claim challenged**: T012 is checked complete and requires "manual mutations for SDK-default overrides, daily range parameters, paging continuation, forbidden endpoints, and credential redaction".
- **Observed evidence**: The recorded mutations cover SDK defaults (mutation-2), daily range parameters (mutation-1), paging continuation (mutation-6), plus three result-mapping mutations and one governor-classify mutation. There is no mutation for a forbidden endpoint (e.g. making a read call `get_market_status`) and none for credential redaction (e.g. removing `trace=False`, or logging the key).
- **Expected evidence/behavior**: The task enumerates five areas; each needs a mutation that is applied, observed caught, and reverted.
- **Impact**: The two missing areas are precisely the two whose tests are weakest (IR-003, IR-009). A forbidden-endpoint mutation would have exposed IR-003 immediately, because the vacuous test would have survived it.
- **Required remediation**: Perform and record the two missing mutations after strengthening the corresponding tests, and re-run the documented cycle.

### IR-005 — A malformed or empty 200 response raises a bare `KeyError`, or returns empty, instead of the typed error the design requires

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-3 (unknown-instrument counterpart); component design section 8 acceptance criterion 6, section 2.2's "200 with an empty result set" branch
- **Tasks**: T009
- **Files**: `src/factorflow/ingestion/massive/client.py:73` (`envelope["results"]`), `:203` (`(events_envelope.get("results") or {}).get("events")`), `:225` (`row[effective_date_field]`)
- **Claim challenged**: T009's claim to implement section 2.5's result mapping completely.
- **Observed evidence**: Probe results — a 200 reference body without a `results` key raises `builtins.KeyError: 'results'`; a split row missing `execution_date` raises `builtins.KeyError: 'execution_date'`; a bars read returning `{"results": []}` returns `[]` rather than `InstrumentNotFound`. Pydantic-level failures *are* handled correctly via `_validate` → `wrap_validation_error` (`client.py:278-282`); these three paths sit upstream of that conversion.
- **Expected evidence/behavior**: Section 8 acceptance criterion 6 — "A 200 response that does not validate produces `ProviderContractViolation` and no partial observations". Section 2.2's sequence puts "200 with an empty result set" on the `InstrumentNotFound` branch. Section 2.5 warns that the two `vX` endpoints (IPOs, ticker events) carry the highest contract risk, and `:225` is exactly where an IPO row's `listing_date` is read.
- **Impact**: A provider shape change produces an untyped `KeyError` that the runner's `MassiveError` handling will not recognise, and an empty result set is stored as "no data" rather than recorded as an unrecognised instrument — the false negative section 2.4 says AC-12 exists to prevent.
- **Required remediation**: Convert missing-key access on a 200 body into `ProviderContractViolation`, and decide explicitly (with the design's section 2.2 branch, or an owner decision if it conflicts) how an empty result set is reported per read. Add tests for both.

### IR-006 — `fetch_corporate_actions` silently ignores the requested date range for ticker-change events

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-3 ("over the requested range"), DAC-E3-1
- **Tasks**: T009
- **Files**: `src/factorflow/ingestion/massive/client.py:200-210`
- **Claim challenged**: That `fetch_corporate_actions(symbol, start, end)` honours `start`/`end` for all four action types.
- **Observed evidence**: The splits, dividends and IPO branches each pass `*_gte`/`*_lte` filters built from `start`/`end`. The ticker-events branch passes only `symbol` and `types="ticker_change"`, and no client-side filter is applied afterwards. Probe: a range of 2020-01-01→2024-12-31 returned a ticker-change event dated 1998-01-05.
- **Expected evidence/behavior**: AC-3 requires the four data types "returned over the requested range". `component-design-massive-client.md` section 2.5 documents that `GET /vX/reference/tickers/{id}/events` filters only by `id` and `types`, which means honouring the range for this endpoint necessarily means filtering client-side — or documenting deliberately that it is unfiltered.
- **Impact**: Rows outside the requested window are returned and, downstream, written into an append-only point-in-time store the run did not ask to extend. The behavior is undocumented in the method's docstring, so a caller cannot tell.
- **Required remediation**: Either filter the events rows to `start <= effective_on <= end` before returning them, or record the deliberate exception in the method docstring and in the task plan's deviations, with a test pinning whichever is chosen.

### IR-007 — TC-ID traceability comments are mismapped in two test files

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (traceability)
- **Tasks**: T003, T007 (Phase 2 checkpoint: "Tests carry their TC IDs in traceability comments")
- **Files**: `tests/unit/test_massive_reference.py:161` and `:181`; `tests/unit/test_massive_sdk_config.py:70` and `:104`
- **Claim challenged**: That each test's recorded TC ID matches the component test specification.
- **Observed evidence**: Per `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/component/all-component-tests.md`, TC-COMP-205 is the delisted-instrument case and TC-COMP-212 is the single-ticker reference case; the two tests carry each other's IDs. TC-COMP-213 is the market-status case and TC-COMP-214 the credential case; `test_constructs_one_rest_client_with_trace_disabled` is labeled TC-COMP-213 and `test_market_status_endpoint_is_never_called` is labeled TC-COMP-214. (`test_massive_auth.py:48` labels the credential tests TC-COMP-214 correctly, so the same ID appears on two unrelated tests.)
- **Expected evidence/behavior**: Skill constraint 8.1 — mandatory TC-IDs must retain traceability to the component test specification.
- **Impact**: A coverage audit reading these comments would conclude TC-COMP-213 is satisfied by a trace-flag assertion and TC-COMP-212 by a delisting assertion. Combined with IR-003, the mislabel is what lets a vacuous market-status test look covered.
- **Required remediation**: Correct the four traceability comments to match `all-component-tests.md`.

### IR-008 — DEC-0001, which the implementation now cites, is uncommitted, unresolvable from this repository, and internally inconsistent

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S1-2 (the `adjusted` value)
- **Tasks**: T009
- **Files**: `src/factorflow/ingestion/massive/client.py:85-86`; `tests/unit/test_massive_bars.py:176-180`; commit `cfcce22`; `docs/.../CAP-001-E3-S1-tdd-evidence.yaml` (`open_items`)
- **Claim challenged**: The docstring statement "The owner confirmed unadjusted; see `DEC-0001` (`projects/factorflow-v2/decisions/DEC-0001.md`)" and commit `cfcce22`'s message "The owner confirmed unadjusted".
- **Observed evidence**: Three separate problems, all verifiable. (1) The cited path does not exist in `FactorFlow-v2`; the file lives in the harness repository at `/Users/alvarodejodra/Projects/ai-agents/projects/factorflow-v2/decisions/DEC-0001.md` and is **untracked there** (`git status` in the harness repo reports `?? projects/factorflow-v2/decisions/`), so nothing a reader of this component can reach resolves the reference. (2) The record is internally inconsistent: it carries `decided_by: owner` alongside `owner_reviewed: false`, `owner_verdict: null` and `status: open`, with `decided_at` identical to `opened`. `docs/decision-records.md` states that `decided_by` is "never written speculatively" and that `owner_reviewed` is "`false` until a human actually looks". (3) The record is `class: one-way`, which `docs/decision-records.md` dispositions as "**Never auto-decided.** Queue it for the owner", and `docs/unattended-mode.md` lists a `one-way` decision as a mandatory abstain. I cannot determine from the repository whether an owner actually made this call interactively; the record as written does not establish it.
- **Expected evidence/behavior**: A code comment asserting an owner decision must point at a resolvable, committed record whose fields agree with the claim. Skill constraint 12 forbids proceeding on an unrecorded assumption in either direction.
- **Impact**: `adjusted=False` determines what every stored price bar means, and section 14 open question 3 says it "Blocks: the meaning of stored price history, and therefore AC-5 and AC-6". The chosen value matches the design's own stated leaning, so the *value* is defensible; what is not established is that the decision was made by the authority the code claims made it. The TDD evidence still records the question as unresolved with a follow-up for the owner, directly contradicting the docstring in the same change set.
- **Required remediation**: Commit the decision record where the citation can resolve it (or cite a path inside this repository), reconcile `decided_by` / `owner_reviewed` / `status` with what actually happened, and update the stale `open_items` entry in the TDD evidence. If no owner has in fact reviewed a `one-way` decision, the docstring and commit message must say so rather than asserting confirmation.

### IR-009 — The credential log-record test cannot fail

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S1-6 (covered adequately elsewhere)
- **Tasks**: T007
- **Files**: `tests/unit/test_massive_auth.py:61-72`
- **Claim challenged**: That a test proves the credential is never written to a log record.
- **Observed evidence**: The test logs `"constructed client: %s" % client` and asserts the secret is not in `caplog.text`. `MassiveClient` defines no `__repr__` or `__str__`, so the message is the default `<...MassiveClient object at 0x...>`; the assertion is true by construction and no read or error path is exercised.
- **Expected evidence/behavior**: A regression-sensitive test would have to log something that could plausibly contain the key.
- **Impact**: None today — `trace=False` (tested) and the header test at `:102` carry the criterion. The finding is test-strength only.
- **Required remediation**: Exercise a read and an error path with logging captured, or fold this assertion into the mutation evidence IR-004 requires.

### IR-010 — An unrelated, vacuous assertion was added to `test_massive_sdk_config.py`

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: none — not traceable to any planned task
- **Files**: `tests/unit/test_massive_sdk_config.py:116-122`
- **Claim challenged**: That every added test is justified by the story or task plan.
- **Observed evidence**: `test_no_declared_field_is_typed_float_in_governor_settings_bridge` asserts `not isinstance(settings.requests_per_minute, Decimal)`. The field is an `int`, so the assertion is trivially true; the test's name says `float` while its body checks `Decimal`; and its docstring describes it as a "smoke check for DAC-E3-S2-3-adjacent regressions" — DAC-E3-S2-3 belongs to CAP-001-E3-S2, not this story.
- **Expected evidence/behavior**: Skill constraint 7 — every implementation change must be justified by the story or task plan.
- **Impact**: Minor scope leakage and a misleading test name in the file that carries this story's SDK-construction evidence.
- **Required remediation**: Remove it, or replace it with an assertion that matches its name and belongs to a planned task.

### IR-011 — The TDD evidence's full-suite figures do not reproduce

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012
- **Files**: `docs/.../CAP-001-E3-S1-tdd-evidence.yaml` (`full_suite_result`, `full_suite_with_postgres_result`, `post_mutation_verification.result`)
- **Claim challenged**: "263 passed, 59 deselected, 1 pre-existing unrelated failure (`tests/integration/test_api_static_mount.py`)" and "321 passed, 1 pre-existing unrelated failure".
- **Observed evidence**: At the reviewed HEAD, `uv run pytest -m 'not postgres' -q` reports 277 passed, 59 deselected, 0 failed, and `uv run pytest -q` reports 336 passed, 0 failed. The deselected count matches exactly while the passing count differs by 14, and the named failure does not occur. The subset figure the evidence records for the same session (78 passed across the seven S1 files) does match today exactly.
- **Expected evidence/behavior**: Recorded validation results should reproduce at the committed state, or the evidence should say what changed.
- **Impact**: The substantive claim is understated rather than overstated — the suite is greener than recorded — but the recorded numbers cannot be used to detect a future regression, and the "pre-existing failure" note now misleads.
- **Required remediation**: Re-record the suite figures against the committed HEAD.

### IR-012 — The task plan header names the wrong branch

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: N/A (plan metadata)
- **Files**: `docs/.../CAP-001-E3-S1-tasks.md:33`
- **Claim challenged**: `**Branch**: usr/alvaro-de-jodra/CAP-001-E2-S4`
- **Observed evidence**: The work was implemented on `usr/alvaro-de-jodra/CAP-001-E3-S1`. The incorrect value predates this story's coding commits (the line is unchanged in `git diff 5c21451..HEAD`), so it originates in implementation planning.
- **Expected evidence/behavior**: `AGENTS.md` and `docs/branch-naming.md` require the plan's branch to name this story's branch.
- **Impact**: A reader following the plan would look for the change set on another story's branch.
- **Required remediation**: Correct the header when the plan is next edited for rework.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T002 bookkeeping.** `src/factorflow/ingestion/__init__.py` and
  `src/factorflow/ingestion/massive/__init__.py` were created by CAP-001-E3-S3
  and CAP-001-E3-S4 (`18051ee`, `e554152`, `cb7aa10`) and appear nowhere in this
  story's diff. The checkbox is ticked for work this story did not perform. The
  end state is correct, so this is recorded as a deviation rather than a
  finding.
- **Justified addition.** The `[[tool.mypy.overrides]]` block added to
  `pyproject.toml` is not named by any task, but it is a direct and documented
  consequence of T001/T009 (the SDK ships no `py.typed`), is scoped to the
  `massive` module only, and carries a comment explaining why the gap does not
  propagate. Accepted.
- **Reuse of a private SDK hook.** `client.py:251` calls
  `self._rest_client._get(...)` to re-issue a `next_url` page, and `paging.py`
  documents the choice explicitly. `component-design-massive-client.md` section
  2.2b requires the component to follow pages itself with the SDK's own pager
  off, and reimplementing transport would be worse; the deviation is
  proportionate and disclosed. Noted, not raised as a finding — but it is a
  real upgrade hazard, since `_get` carries no compatibility promise.
- **No scope leakage in production code.** Every production line added lives in
  `src/factorflow/ingestion/massive/client.py` or `paging.py`. Nothing in
  `errors.py`, `models.py`, `rate_limit.py` or `config/settings.py` was
  modified, which is exactly the ownership boundary the plan's Notes require.

## Follow-Up

- **Next agent**: Coding Agent, with
  `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tasks.md`
  and this report; then a new Adversarial Review (v2).
- **Required action**: Resolve IR-001 (route every initial paged request through
  the governor and restore the typed-error contract on those paths), then
  IR-002, IR-003 and IR-004, which are the missing evidence that let IR-001
  survive. IR-005 through IR-008 should be resolved or explicitly deferred with
  an owner-recorded rationale in the same cycle; IR-008 in particular must be
  settled before the `adjusted=False` choice is treated as owner-approved.
  Do not proceed to Doc Sync.
- **Warnings accepted downstream**: N/A — the verdict is CHANGES-REQUIRED.
