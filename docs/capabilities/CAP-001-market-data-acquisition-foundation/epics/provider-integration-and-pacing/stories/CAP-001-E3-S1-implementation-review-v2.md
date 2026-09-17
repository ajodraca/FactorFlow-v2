---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-15
updated: 2026-09-15
story_id: "CAP-001-E3-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-15T23:43:55Z"
reviewed_head: "3820cb5460b54a6f768234e4dff707380cf9a4c4"
review_base: "5c21451942c25c1d76173ea1369b99f7becd8980"
reviewed_state_revision: "sha256:c5e66a9370fe195b6a4aaf21f71585f6a9c9d43989cbd75c131ba810cc397567"
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
  timestamp: 2026-09-15T23:43:55Z
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

# Implementation Review: CAP-001-E3-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 2 |
| Low findings | 7 |
| Acceptance criteria | 10/11 satisfied |
| Planned tasks | 10/12 verified (1 justified NOT APPLICABLE, 1 PARTIAL) |
| Required validation | 8/8 passed |

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 1 · MEDIUM 2 · LOW 7 · **total 10**

| ID | Severity | Title |
|----|----------|-------|
| IR-001 | HIGH | The mandatory market-status test exercises one read of four; a forbidden call in the other three passes the whole S1 suite |
| IR-002 | MEDIUM | The new ticker-events range filter raises a bare `TypeError`, and silently drops rows, where the code it replaced raised a typed error |
| IR-003 | MEDIUM | `row[effective_date_field]` still raises a bare `KeyError`, and an empty 200 result set is still returned as "no data" |
| IR-004 | LOW | The credential log-record test still cannot fail |
| IR-005 | LOW | The unrelated, vacuous assertion in `test_massive_sdk_config.py` is still present |
| IR-006 | LOW | The TDD evidence's original non-reproducing suite figures and its "pre-existing failure" claim remain |
| IR-007 | LOW | The task plan header still names the wrong branch |
| IR-008 | LOW | DEC-0001 is still uncommitted, and its body still contradicts its own frontmatter |
| IR-009 | LOW | T007's mandatory TC-COMP-013 was relabelled away with no S1 replacement |
| IR-010 | LOW | `paging.py`'s docstring still describes only `next_page` as the governor seam |

**The CRITICAL is genuinely fixed, and I verified it rather than reading the
commit message.** v1/IR-001 was that eight of eleven provider requests bypassed
`RateLimitGovernor.execute` and their failures escaped as raw
`massive.exceptions.BadResponse`. Every `first_page` callable now wraps its SDK
call in `_through_governor`. Counting governor invocations against SDK requests
at HEAD, with every read exercised: `fetch_reference` 1/1, `fetch_daily_bars`
1/1 and 2/2 across two pages, `fetch_financials` 4/4 and 5/5 with a paged
balance-sheet read, `fetch_corporate_actions` 4/4. Parity is now exact,
including the `next_url` pages. First-page failures surface typed on every
read: a 404 body on `get_aggs` and on `vx.list_ipos` produces
`InstrumentNotFound`, a 401 on `get_aggs` and on
`list_financials_income_statements` produces `CredentialRejected`, and an
unrecognised 5xx produces `ProviderUnavailable` after the governor's three
attempts. v1/IR-002's missing governor test is fixed with real teeth: I
runtime-reverted `_financial_page` to its ungoverned v1 shape and
`tests/unit/test_massive_client_governor_integration.py` failed two tests — the
permit count and the typed-error parametrisation — so it would have caught
v1/IR-001.

**The gate fails on a much smaller residue, and on one defect the rework
introduced.** v1/IR-003 required the mandatory market-status test
(TC-COMP-213, whose Expected Result is "When acquisition **runs**, Then it is
never called") to exercise the acquisition path; its remediation said to invoke
all four reads. The rework invokes one, `fetch_reference`. I runtime-mutated
`fetch_financials` to call `get_market_status` and ran all 88 S1 tests: 88
passed. The recorded mutation-9 that is meant to prove the test works targets
`fetch_reference` — the single read the test happens to cover. The production
code is correct today (I enumerated every SDK method the four reads call and
there is no market-status or ticker-list call anywhere), so this is test
validity, not behaviour — but it is a mandatory TC ID that does not protect
three-quarters of the criterion it is mapped to, and the fix is three lines.

The rework's own diff introduced one new defect. The v1/IR-006 fix filters
ticker-change events client-side with `start_iso <= row.get("date", "") <=
end_iso`. On the one endpoint the component design flags as the highest
contract risk (`GET /vX/reference/tickers/{id}/events`, experimental, `vX`), a
non-string `date` now raises a bare `TypeError` where the code it replaced
raised a typed `ProviderContractViolation`, and a row with no `date` key at all
is now silently dropped rather than raising. Both regress the error contract
that v1/IR-001 was raised to protect, in the opposite direction.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S1` |
| HEAD | `3820cb5460b54a6f768234e4dff707380cf9a4c4` |
| Review base | `main` merge-base `5c21451942c25c1d76173ea1369b99f7becd8980` |
| Working tree | clean — no staged, unstaged, or untracked files at review start or after validation |
| Changed files reviewed | 16 |

Commits in range: `055e2a1` (original coding), `cfcce22` (DEC-0001 citation),
`3820cb5` (rework for review v1). The rework commit is
`cfcce22..3820cb5`: 8 files, +862/−61.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `pyproject.toml` | modified | T001 (`massive>=2`); the `[[tool.mypy.overrides]]` block is a justified consequence of T001/T009 |
| `uv.lock` | modified | T001 |
| `src/factorflow/ingestion/massive/client.py` | added | T009, T011 (rework: +49/−34, all of it the governor routing, the `results` guard, the events filter and the DEC-0001 docstring) |
| `src/factorflow/ingestion/massive/paging.py` | added | T010 (untouched by the rework) |
| `tests/unit/test_massive_reference.py` | modified (appended) | T003; rework corrected two TC IDs and added the contract-violation test |
| `tests/unit/test_massive_bars.py` | modified (appended) | T004, T008 (untouched by the rework) |
| `tests/unit/test_massive_financials.py` | modified (appended) | T005 (untouched by the rework) |
| `tests/unit/test_massive_actions.py` | modified (appended) | T005; rework added the out-of-range events test and widened two query ranges |
| `tests/unit/test_massive_client_interface.py` | added | T006 (untouched by the rework) |
| `tests/unit/test_massive_sdk_config.py` | added | T007; rework corrected TC IDs and made the market-status test exercise a read (one added test is still unjustified — IR-005) |
| `tests/unit/test_massive_auth.py` | added | T007 (untouched by the rework) |
| `tests/unit/test_massive_client_governor_integration.py` | **added by the rework** | T011, v1/IR-002. Justified and in scope |
| `.../stories/CAP-001-E3-S1-tasks.md` | modified | task-state bookkeeping; rework added `updated` and `last_reworked_review` |
| `.../stories/CAP-001-E3-S1-tdd-evidence.yaml` | added | T012; rework added mutation-8, mutation-9, the rework narrative and the resolved `open_items` entry |
| `.../stories/CAP-001-E3-S1.md` | modified | `status: planning` → `in-review` |
| `.../stories/CAP-001-E3-S1-implementation-review-v1.md` | added | the v1 gate report, committed by the rework commit. Expected; not a code change |

No production file outside `src/factorflow/ingestion/massive/` was touched. The
rework deleted no test and weakened no existing assertion; the only two
assertion changes widen a query range in two corporate-action tests so the
2007-dated fixture survives the new client-side filter, and both carry a comment
saying so.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-3 | SATISFIED | `client.py:66` `fetch_reference`, `:77` `fetch_daily_bars`, `:108` `fetch_financials`, `:140` `fetch_corporate_actions` | `test_massive_reference.py:142`, `test_massive_bars.py:192`, `test_massive_financials.py:166`, `test_massive_actions.py:185` | Each read returns its parsed model type for a covered symbol, and the unknown-instrument counterpart is now typed on all four reads (probe: 404 → `InstrumentNotFound` on bars, IPOs and reference). Range fidelity for ticker-change events is now honoured (`client.py:216`) but its malformed-row handling regressed (IR-002) |
| DAC-E3-1 | SATISFIED | `client.py:50` — four named methods, no generic path operation | `test_massive_client_interface.py:19,37,51,61,68` | Exact set equality on the public surface |
| DAC-E3-10 | SATISFIED | `client.py:72-73` → `models.TickerReference` | `test_massive_reference.py:142` asserts `cik`, `composite_figi`, `share_class_figi` survive the client | — |
| DAC-E3-11 | SATISFIED | `client.py:66-73` (the single-ticker read is status-agnostic) | `test_massive_reference.py:197` asserts `is_active is False` and `delisted_utc is not None` through the client | TC ID corrected to TC-COMP-205, which matches `all-component-tests.md:4517` |
| DAC-E3-14 | SATISFIED | `client.py:50-51` docstring and method set | `test_massive_client_interface.py:78` asserts no `get`/`request`/`call`/`stream`/`subscribe` member | Negative-shape assertion; proportionate to a "does not foreclose" criterion |
| DAC-E3-S1-1 | SATISFIED | `client.py:55-62` — `retries=0`, `connect_timeout`, `read_timeout`, `pagination=False`, `trace=False` | `test_massive_sdk_config.py:63,74,84,94,106` | All five assertions inspect the substituted `RESTClient` call kwargs; mutation-8 (`trace=False` → `True`) is now recorded and is reproducible by inspection |
| DAC-E3-S1-2 | SATISFIED | `client.py:91-99` — `multiplier=1`, `timespan="day"`, `from_`/`to` via `date.isoformat()`, `adjusted=False` | `test_massive_bars.py:156`, `:176` | See IR-008 on DEC-0001's durability; the docstring no longer claims a path that does not exist |
| DAC-E3-S1-3 | SATISFIED | `paging.py:57-67` — follows `next_url` until falsy, never catches a later page's exception; `client.py:260` `_next_page` takes a permit per page | `test_massive_bars.py:192` (two pages, ordered), `:220` (second-page failure raises), `test_massive_client_governor_integration.py:84` (permit per page) | Probe confirmed a paged financials read is 5 requests / 5 permits |
| DAC-E3-S1-4 | SATISFIED | `client.py:72` `get_ticker_details` only | `test_massive_reference.py:177` asserts `list_tickers` is never called | TC ID corrected to TC-COMP-212 |
| DAC-E3-S1-5 | **PARTIAL** | Correct: I enumerated every SDK method the four reads call — `get_ticker_details`, `get_aggs`, the four `list_financials_*`, `list_stocks_splits`, `list_stocks_dividends`, `vx.list_ipos`, `get_ticker_events`, `_get` — and none is a market-status or ticker-list path | `test_massive_sdk_config.py:118` now exercises `fetch_reference`, but only that one read | Production behaviour is right; the mandatory test protects one read of four (IR-001) |
| DAC-E3-S1-6 | SATISFIED | `client.py:56` `api_key=settings.api_key.get_secret_value()`; `:61` `trace=False` | `test_massive_auth.py:51`, `:102` (real SDK, `Authorization: Bearer`, no `apiKey` in URL or fields) | The log-record test at `:61` is still near-vacuous (IR-004), but `:102` carries the criterion |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `pyproject.toml` `"massive>=2"`; `uv.lock`; `uv sync --all-extras` and `uv build` succeed | No vendor-neutral abstraction added |
| T002 | complete | NOT APPLICABLE | `src/factorflow/ingestion/__init__.py` and `.../massive/__init__.py` exist and export correctly, but were created by CAP-001-E3-S3/S4; this story's diff contains neither file | Unchanged from v1. End state correct; the checkbox records work this story did not do |
| T003 | complete | VERIFIED | `test_massive_reference.py:142-231` — five client-facing tests | TC IDs now match `all-component-tests.md` (v1/IR-007 resolved) |
| T004 | complete | VERIFIED | `test_massive_bars.py:156-217` | Untouched by the rework; request-parameter and two-page assertions remain regression-sensitive |
| T005 | complete | VERIFIED | `test_massive_financials.py:166-214`; `test_massive_actions.py:185-273` | The rework added one corporate-action test and widened two query ranges, both disclosed in comments |
| T006 | complete | VERIFIED | `test_massive_client_interface.py:19-90` | TC-COMP-195 and TC-COMP-208 both represented |
| T007 | complete | **PARTIAL** | `test_massive_sdk_config.py` + `test_massive_auth.py` | The SDK-construction and credential assertions are sound. "Assert no market-status request is made" now exercises one read of four and passes with a live violation in the other three (IR-001). The task's mandatory TC-COMP-013 no longer appears on any S1 test (IR-009) |
| T008 | complete | VERIFIED | `test_massive_bars.py:220-239` | A second-page `BadResponse` produces `ProviderUnavailable`; no partial range returned |
| T009 | complete | VERIFIED | `client.py:50-297` — one reusable `RESTClient`, four reads, section 2.5 paths and result mapping | Result mapping still matches section 2.5. Robustness gaps recorded as IR-002 and IR-003 rather than as task failure, since neither is a path the task text names |
| T010 | complete | VERIFIED | `paging.py:32-76` — follows only present `next_url`, one page at a time, no partial result on failure | Unchanged by the rework; the permit defect that v1 attributed to T011's wiring is gone. Docstring is now slightly stale (IR-010) |
| T011 | complete | **VERIFIED** (was NOT IMPLEMENTED in v1) | `client.py:90`, `:156`, `:174`, `:192`, `:251` (`_financial_page`), `:260` (`_next_page`), `:269` (`_get_one`) all route through `:275` `_through_governor` | The Phase 4 checkpoint "Every SDK request, including a `next_url` page, reaches the existing governor seam exactly once" is now measurably true: permits equal SDK requests 1:1 on every read and every page |
| T012 | complete | VERIFIED | `CAP-001-E3-S1-tdd-evidence.yaml` now records nine mutations covering all five named areas | mutation-8 (credential redaction) and mutation-9 (forbidden endpoints) close v1/IR-004. mutation-9 targets the one read the market-status test covers, which is why it passes while IR-001 stands. Suite figures remain stale (IR-006) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_fetch_reference_routes_its_single_request_through_the_governor` / T011 | ADEQUATE | Patches `RateLimitGovernor.execute` with `autospec` and asserts one permit for one request | Asserts an absolute count rather than parity with the SDK call count, so a *surplus* ungoverned request would not fail it |
| `test_fetch_daily_bars_routes_both_the_first_and_next_page_through_the_governor` / T011 | ADEQUATE | Two envelopes, second reached via `_get`; asserts two permits | as above |
| `test_fetch_financials_routes_each_of_the_four_statement_reads_through_the_governor` / T011 | ADEQUATE | Four statement endpoints, four permits. Verified regression-sensitive: runtime-reverting `_financial_page` to its ungoverned v1 shape makes it fail | as above |
| `test_fetch_corporate_actions_routes_all_four_reads_through_the_governor` / T011 | ADEQUATE | Splits, dividends, IPOs and ticker events; four permits | as above |
| `test_a_first_page_provider_failure_surfaces_as_the_typed_error[×4]` / T011 | ADEQUATE | Parametrised across all four reads; a 404 envelope on each read's *first* SDK call must raise `InstrumentNotFound`, not `BadResponse`. Verified regression-sensitive | Covers only the first endpoint of each multi-endpoint read; my probe separately confirmed dividends and IPOs are typed too |
| `test_fetch_reference_raises_provider_contract_violation_when_results_is_missing` / v1-IR-005 | ADEQUATE | A 200 envelope with no `results` key reaches `_validate` and raises `ProviderContractViolation`. Reproduced by probe | Only the reference read; the sibling missing-key paths are untested and still untyped (IR-003) |
| `test_fetch_corporate_actions_excludes_ticker_events_outside_the_requested_range` / v1-IR-006 | ADEQUATE | A 2007-dated event queried over 2020–2024 is filtered out; asserts `actions == []` | No boundary case (event exactly on `start` or `end`) and no malformed-`date` case (IR-002) |
| `test_market_status_endpoint_is_never_called` / TC-COMP-213 | **WEAK** | Now invokes `fetch_reference` before asserting `get_market_holidays`/`get_market_status` were not called, so it is no longer vacuous | Exercises one read of four. Probe: runtime-mutating `fetch_financials` to call `get_market_status` leaves all 88 S1 tests green (IR-001) |
| `test_constructs_one_rest_client_with_{retries,pagination,trace}_disabled`, `..._explicit_connect_and_read_timeouts`, `..._exactly_one_reusable_rest_client` / TC-COMP-209 | ADEQUATE | Inspect the exact constructor kwargs; all now correctly cite TC-COMP-209 (DAC-E3-S1-1), matching `all-component-tests.md:4605` | none |
| `test_fetch_reference_uses_the_single_ticker_endpoint_only` / TC-COMP-212 | ADEQUATE | `get_ticker_details` called once with the symbol and `raw=True`; `list_tickers` never called | TC ID now correct |
| `test_fetch_reference_delisted_instrument_carries_active_and_delisted_fields` / TC-COMP-205 | ADEQUATE | Delisted fixture returns `is_active is False`, `delisted_utc` set | TC ID now correct |
| `test_fetch_reference_returns_product_shaped_reference` / TC-COMP-003, TC-COMP-204 | ADEQUATE | Three identity fields survive as model attributes | none |
| `test_fetch_reference_raises_instrument_not_found_for_unknown_symbol` | ADEQUATE | A 404 envelope becomes typed `InstrumentNotFound` | none |
| `test_fetch_daily_bars_requests_multiplier_1_day_timespan_and_inclusive_dates` / TC-COMP-210 | ADEQUATE | Exact kwargs asserted against the substituted SDK | none |
| `test_fetch_daily_bars_requests_unadjusted_bars` | ADEQUATE | Pins `adjusted is False` | none |
| `test_fetch_daily_bars_returns_all_rows_from_a_two_page_response_in_order` / TC-COMP-211 | ADEQUATE | Two envelopes, second via `_get`; asserts both rows, order and `raw=True` | none |
| `test_fetch_daily_bars_raises_when_a_later_page_fails_rather_than_returning_partial` / T008 | ADEQUATE | Second page raises; `ProviderUnavailable` propagates, no partial list | none |
| `test_fetch_financials_*` / TC-COMP-003 | ADEQUATE | Four sibling endpoints called once each with `tickers` and `raw=True`; `statement_type` asserted per endpoint | No paging test on this read (the governor test covers the paged case indirectly) |
| `test_fetch_corporate_actions_*` / TC-COMP-003 | ADEQUATE | All four action types returned; split `effective_on` is `execution_date`; ticker events read from `results.events[]` without assuming paging | Range fidelity now asserted; malformed-row handling not (IR-002) |
| `test_exposes_exactly_the_four_named_read_operations` / TC-COMP-195 | ADEQUATE | Exact set equality on public methods | none |
| `test_client_carries_no_streaming_or_websocket_members_yet` / TC-COMP-208 | ADEQUATE | Disjointness against a forbidden-name set | Weak by nature, proportionate to the criterion |
| `test_credential_is_passed_to_the_sdk_constructor` / TC-COMP-214 | ADEQUATE | Asserts the unwrapped `SecretStr` reaches `api_key` | none |
| `test_credential_never_appears_in_a_captured_log_record` / TC-COMP-214 | **WEAK** | Logs `str(client)` and asserts the secret is absent. `MassiveClient` defines no `__repr__`, so the default object repr can never contain the key | Unchanged from v1 (IR-004) |
| `test_client_holds_no_module_or_class_level_credential_attribute` | ADEQUATE | Scans module and class namespaces for the literal secret | none |
| `test_credential_is_sent_as_a_bearer_header_never_a_url_parameter` | ADEQUATE (strongest in the set) | Real `RESTClient` with only `urllib3.PoolManager.request` patched; asserts the `Authorization: Bearer` header and the absence of the secret and of `apiKey` from URL and fields | none |
| `test_no_declared_field_is_typed_float_in_governor_settings_bridge` | **WEAK** | Asserts `not isinstance(settings.requests_per_minute, Decimal)` on an `int` field; the name says `float` while the body checks `Decimal` | Unchanged from v1; unrelated to any task (IR-005) |

Determinism and isolation: the new governor test file follows the established
pattern — substituted `RESTClient`, a real `RateLimitGovernor` with a no-op
`sleep`, fixtures from `tests/fixtures/massive/`. `patch.object(...,
autospec=True)` is correctly scoped to the `with` block, so no global state
leaks between tests. No network, clock, ordering, or environment dependence was
observed; the eight S1 files run in 0.17s and repeat identically.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py tests/unit/test_massive_client_interface.py tests/unit/test_massive_sdk_config.py tests/unit/test_massive_auth.py tests/unit/test_massive_client_governor_integration.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 88 passed in 0.17s (78 at v1; the 10 new tests are the governor file's 8 plus the two rework tests) |
| `uv run pytest -m 'not postgres' -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 287 passed, 59 deselected. Matches the rework's recorded `rework_test_result` exactly |
| `uv run pytest -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 346 passed, 0 failed |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 102 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success, no issues in 30 source files |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel built |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 44 packages, checked 41 |

Five reviewer-authored probes were executed from the scratchpad against the
installed package. No repository file was created or modified by any of them;
the two mutation probes patch class attributes at runtime rather than editing
source.

| Probe | Observed result |
|-------|-----------------|
| Governor permits vs SDK requests, all four reads, with and without paging | `fetch_reference` 1/1; `fetch_daily_bars` 1/1 and 2/2; `fetch_financials` 4/4 and 5/5 (paged balance sheets); `fetch_corporate_actions` 4/4. **Parity everywhere** |
| Full enumeration of SDK methods the four reads call | `get_ticker_details`, `get_aggs`, four `list_financials_*`, `list_stocks_splits`, `list_stocks_dividends`, `vx.list_ipos`, `get_ticker_events`, `_get`. No market-status, no `list_tickers` |
| First-page `BadResponse` (404, 401, 5xx) on bars, financials, IPOs and reference | `InstrumentNotFound`, `CredentialRejected`, `ProviderUnavailable` respectively; no `BadResponse` escaped |
| Reference read, 200 body with no `results` key | `ProviderContractViolation` (was `KeyError` at v1) |
| Bars read, 200 with an empty result set | Returned `[]` (design section 2.2 maps this to `InstrumentNotFound`) — unchanged |
| Split row missing `execution_date`; dividend row missing `ex_dividend_date`; IPO row missing `listing_date` | `builtins.KeyError` in all three cases — unchanged |
| Ticker-change event with `date` as an `int`, or `null` | `builtins.TypeError: '<=' not supported between instances of 'str' and 'int'/'NoneType'`. The same rows through the unchanged `_corporate_actions` helper produce `ProviderContractViolation` — a regression |
| Ticker-change event with no `date` key | Silently dropped; `fetch_corporate_actions` returns `[]` with no error |
| Ticker-change event dated `2024-12-31T00:00:00Z` with `end=2024-12-31` | Dropped by the lexicographic comparison, although the model parses the same value to `2024-12-31` |
| Runtime mutation: `fetch_financials` calls `get_market_status` | All 88 S1 tests pass |
| Runtime mutation: `fetch_reference` calls `get_market_status` | `test_market_status_endpoint_is_never_called` fails (mutation-9 reproduces, for that read only) |
| Runtime mutation: `_financial_page` reverted to its ungoverned v1 shape | `test_massive_client_governor_integration.py` fails 2 of 8 — the permit count and the typed-error case |

### Validation Side Effects

- Before: `git status --porcelain` empty at `3820cb5460b54a6f768234e4dff707380cf9a4c4`
- After: `git status --porcelain` empty at `3820cb5460b54a6f768234e4dff707380cf9a4c4`
- Unexpected tracked-file changes: none. `uv build` wrote to the ignored `dist/`
  directory only.

## Findings

### IR-001 — The mandatory market-status test exercises one read of four, so a forbidden call in the other three passes the whole S1 suite

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S1-5
- **Tasks**: T007, T012
- **Files**: `tests/unit/test_massive_sdk_config.py:118-138`; `docs/.../CAP-001-E3-S1-tdd-evidence.yaml` (`mutation-9-forbidden-endpoint-call`)
- **Claim challenged**: The rework commit's "IR-003 (HIGH): the market-status-never-called test asserted nothing was called without ever invoking a read; it now exercises `fetch_reference` first", and mutation-9's `caught: true`.
- **Observed evidence**: The test constructs the client, calls `client.fetch_reference("AAPL")`, then asserts `not instance.get_market_holidays.called` and `not instance.get_market_status.called`. No other read is invoked. I applied the forbidden call to a different read at runtime — wrapping `MassiveClient.fetch_financials` so it calls `self._rest_client.get_market_status()` first — and ran all eight S1 test files: **88 passed**. Applying the same wrapper to `fetch_reference` does fail the test, which is precisely why mutation-9, whose recorded `target` is `client.MassiveClient.fetch_reference`, shows `caught: true` without establishing anything about the other three reads.
- **Expected evidence/behavior**: TC-COMP-213 (`all-component-tests.md:4693`) states "Given the market-status endpoint, When acquisition **runs**, Then it is never called". Acquisition is the four reads, not one. The story's Testing section requires "A test asserts the market-status path is never requested", and v1/IR-003's remediation said explicitly: "Invoke all four reads against substituted responses inside the test, then assert the forbidden SDK methods (and `list_tickers`, already covered elsewhere) were never called."
- **Impact**: Production behaviour is correct today — I enumerated every SDK method the four reads call and none is a market-status or ticker-list path — so there is no defect to ship. The defect is that the only mandatory test mapped to DAC-E3-S1-5 protects 25% of the surface it claims, and the mutation evidence that is supposed to demonstrate otherwise was run against the covered quarter. A future change to `fetch_daily_bars`, `fetch_financials` or `fetch_corporate_actions` can reintroduce the forbidden call with the gate green.
- **Required remediation**: Invoke all four reads inside `test_market_status_endpoint_is_never_called` against substituted responses (the arrangement already exists in `test_massive_client_governor_integration.py:127-144`), then assert `get_market_holidays`, `get_market_status` and `list_tickers` were never called. Re-record mutation-9 against a read other than `fetch_reference`.

### IR-002 — The new ticker-events range filter raises a bare `TypeError`, and silently drops rows, where the code it replaced raised a typed error

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-3 (unknown/malformed counterpart); component design section 8 acceptance criterion 6
- **Tasks**: T009 (introduced by the v1/IR-006 rework)
- **Files**: `src/factorflow/ingestion/massive/client.py:214-223`
- **Claim challenged**: The rework commit's "IR-006: `fetch_corporate_actions`'s ticker-events read now filters by the requested date range client-side" — i.e. that the filter is a pure narrowing of the returned set.
- **Observed evidence**: The filter is `event_rows = [row for row in all_event_rows if start_iso <= row.get("date", "") <= end_iso]`. Three behaviours follow, all reproduced by probe against HEAD. (1) A row whose `date` is a JSON number or `null` raises `builtins.TypeError: '<=' not supported between instances of 'str' and 'int'` / `'NoneType'` — an untyped exception escaping the component boundary. The identical rows passed through the unchanged `_corporate_actions` helper (`client.py:229-242`), which is the path they took before the rework, produce `ProviderContractViolation: The provider's response for CorporateAction failed model validation`. (2) A row with no `date` key at all matches `""`, fails the comparison, and is **silently dropped**: `fetch_corporate_actions` returns `[]` with no error where the pre-rework code raised (loudly, if untypedly). (3) The comparison is lexicographic on strings, so an event dated `2024-12-31T00:00:00Z` with `end=2024-12-31` is excluded, even though `models.CorporateAction` parses that same value to `2024-12-31` — verified: the datetime-shaped value at the boundary is dropped while an in-range datetime-shaped value is kept.
- **Expected evidence/behavior**: Component design section 8 acceptance criterion 6 — "A 200 response that does not validate produces `ProviderContractViolation` and no partial observations". Section 2.5 marks `GET /vX/reference/tickers/{id}/events` as experimental with a non-stable contract and says the two `vX` endpoints "carry more contract risk than the rest"; section 2.4 says a `ProviderContractViolation` is what a changed provider must look like. Section 2.4 also warns against the false negative "guessing 'not found'", which is what a silent drop produces.
- **Impact**: On the endpoint the design singles out as most likely to change, a shape change now produces either an untyped `TypeError` that `CAP-001-E4`'s `MassiveError` handling will not recognise, or — worse — no error at all and an empty ticker-change set written into append-only history as though the instrument had none. Both are in the class the v1 CRITICAL was raised to close.
- **Required remediation**: Filter on the parsed value rather than on the raw string, or validate the row before filtering, so a non-string, absent or unparseable `date` produces `ProviderContractViolation` instead of a `TypeError` or a silent drop, and so an inclusive `end` boundary holds for any value the model accepts. Add tests for a malformed `date`, an absent `date`, and an event exactly on each boundary.

### IR-003 — `row[effective_date_field]` still raises a bare `KeyError`, and an empty 200 result set is still returned as "no data"

- **Severity**: MEDIUM
- **Status**: OPEN (v1/IR-005, partially resolved)
- **Acceptance criteria**: AC-3 (unknown-instrument counterpart); component design section 8 acceptance criterion 6, section 2.2's "200 with an empty result set" branch
- **Tasks**: T009
- **Files**: `src/factorflow/ingestion/massive/client.py:238` (`row[effective_date_field]`), `:89-104` (`fetch_daily_bars`), `:123-127` (`fetch_financials`)
- **Claim challenged**: The rework commit's "IR-005: `fetch_reference` no longer raises a bare `KeyError` on a malformed 200", offered as the resolution of a finding with three named sub-cases.
- **Observed evidence**: One of the three is fixed. `envelope["results"]` became `envelope.get("results")` at `client.py:73`, and a 200 reference body without `results` now raises `ProviderContractViolation` (probe confirms; `test_massive_reference.py:161` pins it). The other two are unchanged at HEAD. A split row missing `execution_date`, a dividend row missing `ex_dividend_date`, and an IPO row missing `listing_date` each still raise `builtins.KeyError` from `client.py:238` — verified by probe on all three. A bars read returning `{"results": []}` still returns `[]`. No deferral, owner decision, or rationale for leaving either was recorded in the task plan, the TDD evidence, or `projects/factorflow-v2/decisions/`.
- **Expected evidence/behavior**: v1/IR-005's remediation was "Convert missing-key access on a 200 body into `ProviderContractViolation`, and decide explicitly (with the design's section 2.2 branch, or an owner decision if it conflicts) how an empty result set is reported per read. Add tests for both." Design section 2.2's sequence puts "200 with an empty result set" on the `InstrumentNotFound` branch; section 2.5 flags `GET /vX/reference/ipos` — one of the three sites — as a `vX` unstable contract. Skill constraint 12 forbids proceeding on an unrecorded assumption in either direction: leaving these is a legitimate choice, but it has to be written down.
- **Impact**: A provider shape change on splits, dividends or IPOs produces an untyped `KeyError` the runner's `MassiveError` handling will not recognise; an instrument the provider does not hold bars for is stored as "no data" rather than recorded as unrecognised — the false negative section 2.4 says AC-12 exists to prevent.
- **Required remediation**: Either apply the same `.get()`-and-validate treatment at `client.py:238` and decide the empty-result-set branch per read, with tests for both; or record an explicit, owner-attributable deferral naming what is left open and why, and update the task plan's deviations accordingly.

### IR-004 — The credential log-record test still cannot fail

- **Severity**: LOW
- **Status**: OPEN (v1/IR-009, unchanged)
- **Acceptance criteria**: DAC-E3-S1-6 (covered adequately elsewhere)
- **Tasks**: T007
- **Files**: `tests/unit/test_massive_auth.py:61-72`
- **Claim challenged**: That a test proves the credential is never written to a log record.
- **Observed evidence**: The file is byte-identical to v1 (`git diff cfcce22..3820cb5 -- tests/unit/test_massive_auth.py` is empty). The test logs `"constructed client: %s" % client` and asserts the secret is absent from `caplog.text`; `MassiveClient` still defines no `__repr__` or `__str__`, so the message is the default object repr and the assertion is true by construction. No read or error path is exercised.
- **Expected evidence/behavior**: A regression-sensitive test would have to log something that could plausibly contain the key.
- **Impact**: None today — `trace=False` (tested, and now mutation-covered as mutation-8) and the header test at `:102` carry the criterion. Test strength only.
- **Required remediation**: Exercise a read and an error path with logging captured, or delete the assertion and rely on the two tests that do carry it.

### IR-005 — The unrelated, vacuous assertion in `test_massive_sdk_config.py` is still present

- **Severity**: LOW
- **Status**: OPEN (v1/IR-010, unchanged)
- **Acceptance criteria**: N/A
- **Tasks**: none — not traceable to any planned task
- **Files**: `tests/unit/test_massive_sdk_config.py:141-147`
- **Claim challenged**: That every added test is justified by the story or task plan.
- **Observed evidence**: `test_no_declared_field_is_typed_float_in_governor_settings_bridge` asserts `not isinstance(settings.requests_per_minute, Decimal)`. The field is an `int`, so the assertion is trivially true; the name says `float` while the body checks `Decimal`; the docstring cites DAC-E3-S2-3, which belongs to CAP-001-E3-S2. The rework touched this file but left the test unchanged, and the rework's own narrative does not mention it.
- **Expected evidence/behavior**: Skill constraint 7 — every implementation change must be justified by the story or task plan.
- **Impact**: Minor scope leakage and a misleading test name in the file that carries this story's SDK-construction evidence.
- **Required remediation**: Remove it, or replace it with an assertion that matches its name and belongs to a planned task.

### IR-006 — The TDD evidence's original non-reproducing suite figures and its "pre-existing failure" claim remain

- **Severity**: LOW
- **Status**: OPEN (v1/IR-011, partially resolved)
- **Acceptance criteria**: N/A
- **Tasks**: T012
- **Files**: `docs/.../CAP-001-E3-S1-tdd-evidence.yaml:72`, `:78`, `:212`
- **Claim challenged**: "263 passed, 59 deselected, 1 pre-existing unrelated failure (`tests/integration/test_api_static_mount.py`)" and "321 passed, 1 pre-existing unrelated failure".
- **Observed evidence**: The rework added `rework_test_command` / `rework_test_result: "287 passed, 59 deselected"` at the end of the file, which reproduces exactly at HEAD. It did not touch `full_suite_result` (`:72`), `full_suite_with_postgres_result` (`:78`) or `post_mutation_verification.result` (`:212`), which still record 263 and 321 passing plus a named failure. At HEAD I measure 287 passed / 59 deselected and 346 passed / 0 failed, and `tests/integration/test_api_static_mount.py::test_no_bundle_yet_falls_back_to_a_bare_404` does not fail.
- **Expected evidence/behavior**: Recorded validation results should reproduce at the committed state, or say what changed.
- **Impact**: The file now contains both a reproducing figure and a non-reproducing one with no note distinguishing them, and the "pre-existing failure" annotation still misleads a reader into expecting a red test that does not exist.
- **Required remediation**: Annotate or re-record the superseded entries so the file states which figures belong to which commit.

### IR-007 — The task plan header still names the wrong branch

- **Severity**: LOW
- **Status**: OPEN (v1/IR-012, unchanged)
- **Acceptance criteria**: N/A
- **Tasks**: N/A (plan metadata)
- **Files**: `docs/.../CAP-001-E3-S1-tasks.md:34`
- **Claim challenged**: `**Branch**: usr/alvaro-de-jodra/CAP-001-E2-S4`
- **Observed evidence**: Line 34 is unchanged at HEAD. The rework edited this file (adding `updated: 2026-09-15` and `last_reworked_review:` to the frontmatter) without correcting the branch, although v1/IR-012's remediation was "Correct the header when the plan is next edited for rework". The work is on `usr/alvaro-de-jodra/CAP-001-E3-S1`.
- **Expected evidence/behavior**: `AGENTS.md` and `docs/branch-naming.md` require the plan's branch to name this story's branch.
- **Impact**: A reader following the plan would look for the change set on another story's branch.
- **Required remediation**: Set the header to `usr/alvaro-de-jodra/CAP-001-E3-S1`.

### IR-008 — DEC-0001 is still uncommitted, and its body still contradicts its own frontmatter

- **Severity**: LOW
- **Status**: OPEN (v1/IR-008, substantially resolved)
- **Acceptance criteria**: DAC-E3-S1-2 (the `adjusted` value)
- **Tasks**: T009, T012
- **Files**: `src/factorflow/ingestion/massive/client.py:85-87`; `/Users/alvarodejodra/Projects/ai-agents/projects/factorflow-v2/decisions/DEC-0001.md`; `docs/.../CAP-001-E3-S1-tdd-evidence.yaml` (`open_items`)
- **Claim challenged**: The rework's "IR-008: `fetch_daily_bars`'s docstring no longer cites DEC-0001 as a path inside this repo" and the TDD evidence's "the owner confirmed unadjusted (DEC-0001, `decided_by` owner, `owner_reviewed` true, verdict upheld)".
- **Observed evidence**: Two of the three v1 sub-problems are genuinely fixed. The docstring no longer names a path that does not exist and now states the record lives in the separate harness repo. DEC-0001 itself now carries `owner_reviewed: true`, `owner_verdict: upheld`, `status: applied`, and an appended "Owner review — upheld 2026-09-15T23:23:55Z / Confirmed directly by the owner (Alvaro de Jodra) in chat" stanza; the TDD evidence's stale `OQ-3-adjusted-parameter-still-unresolved` entry was rewritten as resolved. Two residues remain. (1) `git status --porcelain projects/factorflow-v2/` in the harness repository still reports `?? projects/factorflow-v2/decisions/` — the record is untracked, so it exists only in one working tree and no reader of either repository can reach it through version control. (2) The record's own body still contains `## Owner review` followed by `_Not yet reviewed._` immediately above the upheld stanza, and `decided_at` remains identical to `opened`, so the document asserts both states at once.
- **Expected evidence/behavior**: A code comment asserting an owner decision must point at a durable record whose content agrees with the claim. `docs/decision-records.md` requires `owner_reviewed` to reflect what actually happened.
- **Impact**: The substantive question is settled — the owner's confirmation is recorded and the chosen value matches the design's own leaning, so `adjusted=False` is no longer an unrecorded assumption. What remains is durability: an untracked file is one `git clean` from gone, and it is the only evidence behind a `one-way` decision that section 14 says "Blocks: the meaning of stored price history, and therefore AC-5 and AC-6".
- **Required remediation**: Commit `projects/factorflow-v2/decisions/DEC-0001.md` in the harness repository, and remove the superseded `_Not yet reviewed._` stanza so the body matches the frontmatter. No change to this component is required.

### IR-009 — T007's mandatory TC-COMP-013 was relabelled away with no S1 replacement

- **Severity**: LOW
- **Status**: OPEN (introduced by the v1/IR-007 rework)
- **Acceptance criteria**: N/A (traceability)
- **Tasks**: T007
- **Files**: `tests/unit/test_massive_sdk_config.py:60,64`; `tests/unit/test_massive_auth.py:48,94`
- **Claim challenged**: The rework's "IR-007: corrected four mismapped TC-COMP IDs", as a complete traceability correction.
- **Observed evidence**: The four corrections are right — I checked each against `all-component-tests.md` (205 delisted `:4517`, 212 single-ticker `:4671`, 209 SDK defaults `:4605`, 213 market status `:4693`). The relabel of `test_constructs_one_rest_client_with_retries_disabled` from TC-COMP-013 to TC-COMP-209 is also right, since TC-COMP-013 is credential handling (AC-13, `:293`) and has nothing to do with the retry default. The consequence is that T007 names TC-COMP-013 as one of its four mandatory IDs and no S1 test now carries it, although `test_massive_auth.py` is exactly where its substance lives. `grep -rn "TC-COMP-013" tests/` returns only `test_settings_secrecy.py` and `test_massive_failure_reasons.py`, both owned by other stories, so the capability-level coverage matrix is unaffected.
- **Expected evidence/behavior**: Skill constraint 8.1 and the Phase 2 checkpoint — "Tests carry their TC IDs in traceability comments" — for the IDs the task names.
- **Impact**: An audit of T007's mandatory IDs against this story's files finds three of four. No coverage is actually missing.
- **Required remediation**: Add TC-COMP-013 to the traceability comment on `test_massive_auth.py:48` or `:94`, whichever the task intends.

### IR-010 — `paging.py`'s docstring still describes only `next_page` as the governor seam

- **Severity**: LOW
- **Status**: OPEN (stale after the v1/IR-001 rework)
- **Acceptance criteria**: N/A
- **Tasks**: T010, T011
- **Files**: `src/factorflow/ingestion/massive/paging.py:41-50`
- **Claim challenged**: That the module's contract documentation matches the wiring after the rework.
- **Observed evidence**: `follow_pages`'s docstring says of `next_page`: "It is the caller's seam onto the rate-limit governor: a permit is acquired **before every page request**, including this one". Of `first_page` it says only "`first_page` issues the initial request." Since the rework, `first_page` is equally a governed seam in every caller, and `client.py:14-16` and `:262-264` both say so. `paging.py` was not touched by the rework.
- **Expected evidence/behavior**: The module documenting the paging contract should state the invariant the Phase 4 checkpoint requires, for both callbacks.
- **Impact**: The one file a maintainer reads to learn how paging and pacing interact still implies that only subsequent pages need a permit — which is the exact belief that produced v1/IR-001.
- **Required remediation**: State in `first_page`'s description that it, too, must be a governed callable.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (CRITICAL) — eight of eleven requests bypass the governor; errors escape as raw SDK exceptions | **RESOLVED** | `client.py:90`, `:156`, `:174`, `:192`, `:251` now wrap every `first_page` in `_through_governor`. Probe: permits equal SDK requests 1:1 on all four reads, including paged reads (1/1, 2/2, 4/4, 5/5, 4/4). Probe: 404/401/5xx on a first page of bars, financials, IPOs and reference yield `InstrumentNotFound`/`CredentialRejected`/`ProviderUnavailable`; no `BadResponse` escapes |
| v1/IR-002 (HIGH) — no test exercises the governor seam | **RESOLVED** | `tests/unit/test_massive_client_governor_integration.py` (8 tests) patches `RateLimitGovernor.execute` and counts permits per read, plus a parametrised first-page-failure test over all four reads. Verified regression-sensitive: runtime-reverting `_financial_page` to its ungoverned v1 shape fails 2 of its 8 tests |
| v1/IR-003 (HIGH) — the mandatory market-status test is vacuous | **STILL OPEN** (partially addressed) | The test now calls `fetch_reference`, so it is no longer vacuous; but it covers one read of four. Probe: a forbidden call in `fetch_financials` leaves all 88 S1 tests green. Re-raised as IR-001 |
| v1/IR-004 (HIGH) — T012's mutation evidence omits two of five areas | **RESOLVED** | `CAP-001-E3-S1-tdd-evidence.yaml` now records `mutation-8-credential-redaction-trace-flag` and `mutation-9-forbidden-endpoint-call`, covering the two missing areas. mutation-9's narrow target is recorded under IR-001 rather than reopening this finding |
| v1/IR-005 (MEDIUM) — malformed or empty 200 raises `KeyError` or returns empty | **STILL OPEN** (partially addressed) | `fetch_reference` fixed and tested (`client.py:73`, `test_massive_reference.py:161`). `client.py:238` still raises `KeyError` for splits, dividends and IPOs; an empty bars result set still returns `[]`; no deferral recorded. Re-raised as IR-003 |
| v1/IR-006 (MEDIUM) — `fetch_corporate_actions` ignores the range for ticker-change events | **RESOLVED for the stated case; introduced a new defect** | `client.py:214-216` filters client-side and `test_massive_actions.py:253` pins it. The filter's handling of malformed and boundary `date` values is a new defect, raised as IR-002 |
| v1/IR-007 (MEDIUM) — TC-ID traceability comments mismapped in two files | **RESOLVED** | All four corrections verified against `all-component-tests.md`: TC-COMP-205 `:4517`, TC-COMP-212 `:4671`, TC-COMP-209 `:4605`, TC-COMP-213 `:4693`. One consequence is recorded separately as IR-009 |
| v1/IR-008 (MEDIUM) — DEC-0001 uncommitted, unresolvable and internally inconsistent | **STILL OPEN** (substantially addressed) | Docstring no longer cites a non-existent in-repo path; DEC-0001 now records `owner_reviewed: true` / `upheld` / `status: applied`; the TDD evidence `open_items` entry was rewritten as resolved. The record is still untracked (`?? projects/factorflow-v2/decisions/`) and its body still says `_Not yet reviewed._`. Re-raised at LOW as IR-008 |
| v1/IR-009 (LOW) — the credential log-record test cannot fail | **STILL OPEN** | `tests/unit/test_massive_auth.py` is byte-identical across the rework. Re-raised as IR-004 |
| v1/IR-010 (LOW) — an unrelated, vacuous assertion in `test_massive_sdk_config.py` | **STILL OPEN** | `test_no_declared_field_is_typed_float_in_governor_settings_bridge` unchanged at `:141-147`, although the rework edited the file. Re-raised as IR-005 |
| v1/IR-011 (LOW) — the TDD evidence's full-suite figures do not reproduce | **STILL OPEN** (partially addressed) | A reproducing `rework_test_result` was added; the original non-reproducing entries at `:71-78` and `:210-213` remain. Re-raised as IR-006 |
| v1/IR-012 (LOW) — the task plan header names the wrong branch | **STILL OPEN** | `CAP-001-E3-S1-tasks.md:34` still reads `usr/alvaro-de-jodra/CAP-001-E2-S4`, although the rework edited that file's frontmatter. Re-raised as IR-007 |

## Scope and Plan Deviations

- **T002 bookkeeping, unchanged.** `src/factorflow/ingestion/__init__.py` and
  `src/factorflow/ingestion/massive/__init__.py` were created by CAP-001-E3-S3
  and CAP-001-E3-S4 and appear nowhere in this story's diff. The checkbox
  records work this story did not perform. End state correct; recorded as a
  deviation rather than a finding, as in v1.
- **The rework is tightly scoped.** Eight files, +862/−61, and every hunk maps
  to a numbered v1 finding. No production file outside
  `src/factorflow/ingestion/massive/client.py` was touched; `paging.py`,
  `errors.py`, `models.py`, `rate_limit.py` and `config/settings.py` are
  untouched, which is the ownership boundary the plan's Notes require. No test
  was deleted and no existing assertion weakened.
- **Two test query ranges widened.** `test_massive_actions.py:207` and `:246`
  change `date(2020, 1, 1)` to `date(2000, 1, 1)` so the 2007-dated
  `action_ticker_change.json` fixture survives the new client-side filter. Both
  carry a comment explaining why, and neither weakens what the test asserts.
  Accepted.
- **New test file is justified.** `tests/unit/test_massive_client_governor_integration.py`
  is not named by any task path, but it is the direct remediation v1/IR-002
  required for T011 and follows the established fixture and substitution
  pattern. Accepted.
- **Reuse of a private SDK hook, unchanged.** `client.py:266` calls
  `self._rest_client._get(...)` to re-issue a `next_url` page, documented in
  `paging.py`. Proportionate and disclosed, as in v1; still a real upgrade
  hazard, since `_get` carries no compatibility promise.
- **Justified addition, unchanged.** The `[[tool.mypy.overrides]]` block in
  `pyproject.toml` remains a documented consequence of T001/T009 and is scoped
  to the `massive` module only. Accepted.

## Follow-Up

- **Next agent**: Coding Agent, with
  `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tasks.md`
  and this report; then a new Adversarial Review (v3).
- **Required action**: IR-001 is the only finding that blocks the gate on its
  own and it is a three-line test change plus one re-recorded mutation. IR-002
  is the rework's own regression on the `vX` ticker-events endpoint and should
  be fixed in the same cycle, together with IR-003 — which needs either the
  same `.get()`-and-validate treatment at `client.py:238` and a decision on the
  empty-result-set branch, or an explicit recorded deferral. The seven LOW
  findings are bookkeeping and test-strength items; four of them (IR-004,
  IR-005, IR-006, IR-007) were raised in v1, not addressed, and not mentioned
  in the rework commit's summary, so they should be either fixed or explicitly
  declined this cycle rather than carried forward silently a third time. Do not
  proceed to Doc Sync.
- **Warnings accepted downstream**: N/A — the verdict is CHANGES-REQUIRED.
