---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S6-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
story_id: "CAP-001-E3-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-10T16:42:43Z"
reviewed_head: "0eb02b921be6fe7612079e3f8664fa20d86fa725"
review_base: "878099d4f3f209de591ad1c66e5514918b8ac78d"
reviewed_state_revision: "sha256:c90503d4f2f66c3d5a72763e52d5e4f313532c4953814182e695bde9c150bd13"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E3-S6
    artifact_version: 3
    content_revision: sha256:a4d24710c8e5b06e14b9360b6cc7a0ab196b365b2ffe986a369b8c4fa6628b91
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-medium
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-10T16:42:43Z
  source_artifacts:
    - id: CAP-001-E3-S6
      version: "3"
    - id: CAP-001-E3-S6-tasks
      version: "1"
    - id: CAP-001-component-design-runtime-config
      version: "11"
    - id: CAP-001-component-design-massive-client
      version: "12"
    - id: CAP-001-component-tests
      version: "2"
    - id: CAP-001-coverage-matrix
      version: "2"
  invoking_user: alvarodejodra
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S6 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 4 |
| Acceptance criteria | 20/20 satisfied |
| Planned tasks | 20/20 verified |
| Required validation | 11/11 passed |

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 4 · **total 4**

| ID | Severity | Title |
|----|----------|-------|
| IR-001 | LOW | TC-COMP-356 cannot fail if `base=` is removed (recorded equivalent mutant) |
| IR-002 | LOW | The TLS keyword-argument test omits the `forbid_sockets` guard T006 prescribes |
| IR-003 | LOW | The `http`-acceptance source scan misses the `startswith("http")` form |
| IR-004 | LOW | The `Dockerfile` parser handles neither line continuations nor JSON-form `COPY` |

The two production changes the story names are present, minimal and exactly as
designed: `MassiveSettings._validate_base_url` in
`src/factorflow/config/settings.py:125-160` reproduces the `runtime-config`
section 2.2c reference snippet clause for clause and in its order, substituting
`PydanticCustomError` for the snippet's `ValueError` so the rendered message is
exactly `FACTORFLOW_MASSIVE_BASE_URL: <clause>` (DEC-0044); and
`src/factorflow/ingestion/massive/client.py:61` adds `base=settings.base_url`
with `retries=0` untouched and no `redirect`, `Retry`, proxy or TLS argument
added. No `http` branch, flag, constant or environment variable was introduced
(DEC-0033). `src/factorflow/ingestion_main.py`, `scripts/` and `tests/e2e/` are
byte-identical to the review base, as the plan's Phase 4 and Validation Plan
require.

All nineteen mandatory component tests TC-COMP-347 to TC-COMP-365 are
implemented and traceability-labelled, and I confirmed their regression
sensitivity analytically and by probing the unpatched SDK: `RESTClient` without
`base=` reports `BASE == "https://api.massive.com"` and `retries == 3` on both
the main client and `vx`, so TC-COMP-354, TC-COMP-355, TC-COMP-357 and the T013
four-reads test die the moment either production change is reverted. The
rejection tests assert exact message equality against a per-clause table, so
removing any single validator clause fails a named row. I reran every
constitution and story-specific validation command myself; all pass, including
the full 855-test suite with PostgreSQL containers.

Four LOW findings are recorded. None blocks: each is a bounded test-strength or
evidence-quality note whose underlying behaviour is proven elsewhere in the
same change set, and none makes an acceptance criterion, a required task or a
required validation incomplete.

**Landing rule.** This story must not reach `main` on its own. The story's
Description and the plan's Other Notes require it to merge in the same merge
commit as CAP-001-E3-S7; `scripts/run-e2e-server.sh:145` still sets
`FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:8126`, which the new validator
now refuses. This review does not relax that constraint and the E2E job was
not run as a gate here, per the plan's Validation Plan.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S6-tasks.md` |
| Component | `FactorFlow-v2` (project repo and component repo are the same) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S6-run-20261010T160604Z` |
| HEAD | `0eb02b921be6fe7612079e3f8664fa20d86fa725` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E3-integration-20261010T160604Z` @ `878099d4f3f209de591ad1c66e5514918b8ac78d` (resolved with `pipeline-state.py review-base --base-ref`, confirmed an ancestor of HEAD) |
| Working tree | clean before and after validation (`git status --porcelain` empty both times); one commit, `0eb02b9`, on the base |
| Changed files reviewed | 12 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/config/settings.py` | modified | AC-13 (a); T015 |
| `src/factorflow/ingestion/massive/client.py` | modified | AC-13 (b); T016 |
| `tests/unit/massive_transport_fakes.py` | added | DAC-E3-S6-12; T001 |
| `tests/unit/test_settings_base_url.py` | added | DAC-E3-S6-1 to S6-6; T002, T003, T004, T014 |
| `tests/unit/test_ingestion_main.py` | modified | DAC-E3-S6-7; T005 |
| `tests/unit/test_massive_tls.py` | added | DAC-E3-S6-8, S6-11; T006 |
| `tests/unit/test_massive_sdk_config.py` | modified | DAC-E3-S6-8 to S6-10, AC-13 (b); T007, T013 |
| `tests/unit/test_massive_redirects.py` | added | DAC-E3-S6-12 to S6-16; T008 to T011 |
| `tests/unit/test_release_excludes_test_paths.py` | added | DAC-E3-S6-17; T012 |
| `.../stories/CAP-001-E3-S6.md` | modified | story-coding bookkeeping: `status: planning` → `in-review` only |
| `.../stories/CAP-001-E3-S6-tasks.md` | modified | task-checkbox bookkeeping: T001 to T020 ticked, no prose changed |
| `.../stories/CAP-001-E3-S6-tdd-evidence.yaml` | added | T020 (INV-TDD-002) |

No unjustified file appears in the change set. `git diff` against the base over
`scripts`, `tests/e2e` and `src/factorflow/ingestion_main.py` is empty.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 (a) start refusal | SATISFIED | `src/factorflow/config/settings.py:125-160` `_validate_base_url`; `_EnvNamedSettings` renders `ConfigurationError` | `tests/unit/test_ingestion_main.py::test_main_refuses_a_non_https_base_url_before_any_client`; `tests/unit/test_settings_base_url.py::test_aggregate_settings_load_raises_the_base_url_error_unchanged` | I reproduced the refusal outside pytest: `FACTORFLOW_MASSIVE_BASE_URL=http://api.massive.com uv run python -m factorflow.ingestion_main` → exit 1, stderr `Configuration error: FACTORFLOW_MASSIVE_BASE_URL: scheme must be https`, value not printed |
| AC-13 (b) base honoured | SATISFIED | `src/factorflow/ingestion/massive/client.py:61` `base=settings.base_url` | `test_massive_sdk_config.py::test_every_request_of_the_four_reads_goes_to_the_configured_base`, `::test_real_sdk_and_vx_sub_client_use_the_configured_base` | All four reads plus the `next_url` page recorded at `https://stub.example:8443`; `Authorization` is exactly `Bearer <key>`; no path carries the key or `apiKey`; `/vX/reference/ipos` attributed to the `vx` pool by object identity |
| DAC-E3-S6-1 | SATISFIED | `settings.py:118` default `https://api.massive.com` | `test_settings_base_url.py::test_unset_base_url_defaults_to_the_governed_host` (TC-COMP-347) | — |
| DAC-E3-S6-2 | SATISFIED | `settings.py:158-160` trailing-`/` removal | `::test_accepted_base_url_loads` (TC-COMP-348), 5 rows | `HTTPS://API.MASSIVE.COM` accepted unchanged; `urlsplit` lowercases the scheme, as the design notes |
| DAC-E3-S6-3 | SATISFIED | `settings.py:143-144` scheme clause | `::test_non_https_scheme_is_rejected` (TC-COMP-349) | — |
| DAC-E3-S6-4 | SATISFIED | same scheme clause, no loopback branch | `::test_loopback_http_is_rejected_by_the_release_settings` (TC-COMP-350) | Docstring states the test is unchanged when clause 2a takes effect |
| DAC-E3-S6-5 | SATISFIED | `settings.py:138-157` clauses 3 to 8 | `::test_other_rejected_rows_are_rejected` (TC-COMP-351), 15 rows | Includes unbracketed `http://::1:8126` and `"...\x7f"` |
| DAC-E3-S6-6 | SATISFIED | `PydanticCustomError` clause strings, `include_input=False` in `_EnvNamedSettings` | `::test_rejection_message_names_variable_and_clause_only` (TC-COMP-352), 21 rows, plus `::test_unbracketed_ipv6_message_names_variable_only` | Asserts exact equality `FACTORFLOW_MASSIVE_BASE_URL: <clause>` and absence of the value, `s3cret` and the generated key |
| DAC-E3-S6-7 | SATISFIED | `src/factorflow/ingestion_main.py` unchanged; refusal comes from `Settings()` | `test_ingestion_main.py::test_main_refuses_a_non_https_base_url_before_any_client` (TC-COMP-353) | `psycopg.connect` and `run_polling_loop` are patched to `pytest.fail`, so a missing validator fails loudly rather than silently |
| DAC-E3-S6-8 | SATISFIED | `client.py:61` | `test_massive_sdk_config.py::test_rest_client_receives_the_configured_base`, `::test_real_sdk_and_vx_sub_client_use_the_configured_base` (TC-COMP-354); `test_massive_tls.py::test_unset_base_reaches_both_sdk_clients_as_the_governed_host` (TC-COMP-355) | I verified on the unpatched SDK that the default `BASE` is `https://api.massive.com`, so the configured-base assertions are regression-sensitive |
| DAC-E3-S6-9 | SATISFIED | `settings.py:160` | `::test_trailing_slash_base_never_produces_a_double_slash` (TC-COMP-356) | See IR-001 for the one mutation this test cannot kill |
| DAC-E3-S6-10 | SATISFIED | `client.py:62` `retries=0`, `pagination=False`, `trace=False` | `::test_real_sdk_retries_pagination_and_trace_are_off_on_both_clients` (TC-COMP-357) | SDK default is `retries=3` on both clients (verified), so the assertion is meaningful |
| DAC-E3-S6-11 | SATISFIED | no TLS argument on either construction path | `test_massive_tls.py::test_no_construction_path_passes_a_tls_override`, `::test_both_sdk_pools_require_certificates` (TC-COMP-358) | Both `MassiveClient.__init__` and `_build_client_for_key` covered; see IR-002 |
| DAC-E3-S6-12 | SATISFIED | n/a (test harness) | `massive_transport_fakes.py:93-166`; asserted by `_assert_harness_held` (TC-COMP-359) after 360, 361 and 362 | Only `HTTPConnectionPool._make_request` is patched; the response carries the identical `retries` object (`returned is passed`) |
| DAC-E3-S6-13 | SATISFIED | `client.py` governor seam + error classifier | `test_massive_redirects.py::test_main_pool_redirect_is_refused_and_retried_to_the_same_host` (TC-COMP-360) | Asserts `ProviderUnavailable`, `not isinstance(..., MaxRetryError)`, `__cause__` is a `MaxRetryError`, 3 requests, all to `api.massive.com`, none to `198.51.100.7` |
| DAC-E3-S6-14 | SATISFIED | `MassiveClient._through_governor` | `::test_vx_redirect_is_refused_through_the_vx_pool` (TC-COMP-361) | Route one; `/vX/reference/ipos` requests attributed to the `vx` `PoolManager` by object identity and asserted non-empty, so the test cannot pass on the main pool alone |
| DAC-E3-S6-15 | SATISFIED | n/a (control) | `::test_control_client_with_retries_follows_the_redirect` (TC-COMP-362) | The `retries=3` control does record `198.51.100.7`, proving the fake drives urllib3's real redirect path |
| DAC-E3-S6-16 | SATISFIED | no proxy or `ProxyManager` argument in `client.py` | `::test_no_proxy_is_used_by_either_pool` (TC-COMP-363) | Six proxy variables set, `NO_PROXY`/`no_proxy` deleted; both pools, both URL forms, `transport.requests == []` |
| DAC-E3-S6-17 | SATISFIED | `Dockerfile` copies only `pyproject.toml`, `uv.lock`, `src`, `migrations`; no `src/factorflow` module imports `tests` or accepts `http` | `test_release_excludes_test_paths.py`, four tests (TC-COMP-364) | Wheel built offline and inspected; see IR-003 and IR-004 for the scan's bounds |
| DAC-E3-S6-18 | SATISFIED | n/a | Independently rerun: `uv run pytest -m 'not postgres'` 585 passed; `-m postgres --collect-only` over the six files collects nothing (77 deselected) (TC-COMP-365) | `test_massive_sdk_config.py`, `test_massive_auth.py` and `test_ingestion_main.py` all pass |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/unit/massive_transport_fakes.py` | Provides `generated_test_key`, `forbid_sockets`, `RecordingMakeRequest` with the urllib3 2.7.0 `_make_request` signature; contains no test; imports only stdlib, `pytest` and `urllib3` |
| T002 | complete | VERIFIED | `test_settings_base_url.py:72-101` | Both parametrised rows and the expected normalisation are exactly as planned |
| T003 | complete | VERIFIED | `test_settings_base_url.py:107-163` | All 3 + 3 + 15 values present |
| T004 | complete | VERIFIED | `test_settings_base_url.py:169-196` | Exact-equality message table; the empty-string substring check is skipped as planned; `http://::1:8126` asserts only the prefix |
| T005 | complete | VERIFIED | `test_ingestion_main.py:101-138` | All four environment variables, three failing patches, argument-free `main()`, stderr and `caplog` assertions |
| T006 | complete | VERIFIED | `test_massive_tls.py:35-80` | Both construction paths covered; `forbid_sockets` used in two of the three tests (IR-002) |
| T007 | complete | VERIFIED | `test_massive_sdk_config.py:175-231` | Existing tests and the `_settings` helper untouched |
| T008 | complete | VERIFIED | `test_massive_redirects.py:33-95` | Governor built with `sleep`/`jitter` injected and `monotonic` left real, per specification review v9 FINDING-27 |
| T009 | complete | VERIFIED | `test_massive_redirects.py:99-120` | Pool identity attribution as planned |
| T010 | complete | VERIFIED | `test_massive_redirects.py:124-137` | — |
| T011 | complete | VERIFIED | `test_massive_redirects.py:141-170` | `type(...) is urllib3.HTTPConnectionPool` used, not `isinstance`, as DEC-0041 requires |
| T012 | complete | VERIFIED | `test_release_excludes_test_paths.py` | (a), (b) and (c) all present; `uv build --wheel --offline` per DEC-0045. See IR-003, IR-004 |
| T013 | complete | VERIFIED | `test_massive_sdk_config.py:250-294` | The `next_url` page is asserted followed, so the assertion set is non-vacuous |
| T014 | complete | VERIFIED | `test_settings_base_url.py:202-214` | Justified deviation: `Settings(_env_file=None)` rather than bare `Settings()`, matching the file's own isolation precedent; behaviour asserted is identical |
| T015 | complete | VERIFIED | `src/factorflow/config/settings.py:125-160` | Clause-for-clause match with the 2.2c snippet; `PydanticCustomError` per DEC-0044; the `# clause 2a lives only under tests/ (DEC-0033)` comment is present |
| T016 | complete | VERIFIED | `src/factorflow/ingestion/massive/client.py:58-63` and the module docstring | Justified deviation: the required comment sits on its own line above `base=` because inline it exceeds the 100-column ruff limit |
| T017 | complete | VERIFIED | `git diff 878099d..HEAD -- src/factorflow/ingestion_main.py` is empty | The entry point needed no change and received none |
| T018 | complete | VERIFIED | `CAP-001-E3-S6-tdd-evidence.yaml:182-220` | 16 mutations, `surviving_mutants: []`. I did not re-apply the mutations (reviewer may not edit production code) but confirmed the two load-bearing kills analytically against the unpatched SDK, and recorded the one documented equivalent mutant as IR-001 |
| T019 | complete | VERIFIED | Every command rerun independently; see Independent Validation | Recorded counts (585 / 855 / 180 files / 47 modules) reproduce exactly |
| T020 | complete | VERIFIED | `CAP-001-E3-S6-tdd-evidence.yaml` | Four cycles, each with `diff_sha256`, `code_review_verdict: APPROVED`, `spec_drift.drift_detected: false`, `tests_executed: true`, `commit_hash: stage`; no `REJECTED` or drifting cycle; commit `0eb02b9` carries `Decision-Id: DEC-0044` and `DEC-0045` |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_unset_base_url_defaults_to_the_governed_host` / TC-COMP-347 | ADEQUATE | Explicit `delenv` then exact default equality | none |
| `test_accepted_base_url_loads` / TC-COMP-348 | ADEQUATE | Asserts the returned value per row, so the normalisation (and only it) is pinned; kills the "trailing `/` not removed" mutant | none |
| `test_non_https_scheme_is_rejected` / TC-COMP-349 | ADEQUATE | Raise + variable name | none |
| `test_loopback_http_is_rejected_by_the_release_settings` / TC-COMP-350 | ADEQUATE | Three loopback forms, all rejected | none |
| `test_other_rejected_rows_are_rejected` / TC-COMP-351 | ADEQUATE | 15 boundary rows including ports `0`, `70000`, `abc`, control character, leading whitespace | none |
| `test_rejection_message_names_variable_and_clause_only` / TC-COMP-352 | ADEQUATE | Exact message equality per clause plus three non-disclosure assertions against a freshly generated key; a clause removal moves a row to a different message and fails | none |
| `test_main_refuses_a_non_https_base_url_before_any_client` / TC-COMP-353 | ADEQUATE | Return code, `RESTClient` never called, stderr content and absence of the value, `caplog` clean; the two `pytest.fail` patches make a missing validator fail rather than hang | The `caplog` assertion cannot fire on this path (logging is not configured yet); harmless, and already noted by the coding cycle's own reviewer |
| `test_rest_client_receives_the_configured_base`, `test_real_sdk_and_vx_sub_client_use_the_configured_base` / TC-COMP-354 | ADEQUATE | Keyword inspection plus real-SDK `BASE`/`vx.BASE`; dies if `base=` is removed (SDK default differs) | none |
| `test_unset_base_reaches_both_sdk_clients_as_the_governed_host` / TC-COMP-355 | ADEQUATE | Default propagation to both clients | none |
| `test_trailing_slash_base_never_produces_a_double_slash` / TC-COMP-356 | ADEQUATE | Records the real first request through the harness and asserts scheme, host, `/v3/` prefix and no `//v3`; kills the "trailing `/` not removed" mutant | Cannot kill the `base=` removal mutant — IR-001 |
| `test_real_sdk_retries_pagination_and_trace_are_off_on_both_clients` / TC-COMP-357 | ADEQUATE | `retries == 0` on both clients against an SDK whose default is 3 | none |
| `test_no_construction_path_passes_a_tls_override`, `test_both_sdk_pools_require_certificates` / TC-COMP-358 | ADEQUATE | Both construction paths; `call_count == 2` guards against a vacuous loop; real-pool `cert_reqs` assertion | Keyword-only inspection; `forbid_sockets` omitted on the mocked test — IR-002 |
| `_assert_harness_held` / TC-COMP-359 | ADEQUATE | Socket guards unfired, non-empty request list, every scheme `https`, `returned is passed` identity on `retries`; applied after 360, 361 and 362 as the plan prescribes | none |
| `test_main_pool_redirect_is_refused_and_retried_to_the_same_host` / TC-COMP-360 | ADEQUATE | Exception type, negative type, cause chain, exact attempt count tied to `settings.max_attempts` (asserted to be 3), host set | none |
| `test_vx_redirect_is_refused_through_the_vx_pool` / TC-COMP-361 | ADEQUATE | Pool-identity attribution, non-empty `/vX/` guard, attempt count, host set | none |
| `test_control_client_with_retries_follows_the_redirect` / TC-COMP-362 | ADEQUATE | Positive control; without it the two redirect tests would prove nothing | none |
| `test_no_proxy_is_used_by_either_pool` / TC-COMP-363 | ADEQUATE | Both managers, `ProxyManager` negative, exact `HTTPConnectionPool` type for the loopback form, `proxy is None`, nothing sent | none |
| `test_dockerfile_copies_nothing_under_tests`, `test_built_wheel_contains_nothing_under_tests`, `test_release_source_imports_nothing_from_tests`, `test_release_source_accepts_no_http_scheme` / TC-COMP-364 | ADEQUATE | Parser non-empty guard; wheel listing has a positive `factorflow/` assertion so an empty listing cannot pass; AST walk over every module with a non-empty file guard | Scan and parser bounds — IR-003, IR-004 |
| `uv run pytest -m 'not postgres'` + marker collection / TC-COMP-365 | ADEQUATE | Rerun independently; marker exclusion verified by collection, not by assertion of intent | none |
| `test_every_request_of_the_four_reads_goes_to_the_configured_base` (T013) | ADEQUATE | All four reads, `next_url` page asserted followed, port asserted, `Bearer` header equality, key absent from paths, `vx` pool identity | none |
| `test_aggregate_settings_load_raises_the_base_url_error_unchanged` (T014) | ADEQUATE | Pins the exact message on the aggregate path `main()` takes | none |

Determinism and isolation: every test using the environment goes through
`monkeypatch`, deletes `FACTORFLOW_MASSIVE_BASE_URL` when it does not set it,
and loads with `_env_file=None`; keys are generated per test, so no fixed key
literal is added. No test touches the clock with a frozen `monotonic`, which is
what specification review v9 FINDING-27 warned against. No test opens a socket:
`forbid_sockets` is installed wherever a transport can be reached, and the full
suite completes with the socket guards never firing. Reruns of the six affected
files were stable.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001 --story .../CAP-001-E3-S6.md --stage adversarial-review` | `/Users/alvarodejodra/Projects/ai-agents` | 0 | PASS | `READY — story is ready for independent review` |
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | `/Users/alvarodejodra/Projects/ai-agents` | 0 | PASS | all eight checks passed |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 43 packages checked, no change |
| `uv run pytest -m 'not postgres' -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 585 passed, 270 deselected, 14.07s — matches the recorded count |
| `uv run pytest -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 855 passed, 208.83s (PostgreSQL containers available) |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 180 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success, no issues in 47 source files |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel built |
| `uv run pytest -q -m 'not postgres' tests/unit/test_settings_base_url.py tests/unit/test_massive_tls.py tests/unit/test_massive_sdk_config.py tests/unit/test_massive_redirects.py tests/unit/test_release_excludes_test_paths.py tests/unit/test_ingestion_main.py tests/unit/test_massive_auth.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 80 passed in 0.76s, no network, no container (story-specific validation 1) |
| `uv run pytest -m postgres --collect-only -q <the six new or extended files>` | `repos/factorflow-v2/FactorFlow-v2` | 5 | PASS | `no tests collected (77 deselected)`; exit 5 is pytest's "no tests collected", the intended outcome |
| `FACTORFLOW_MASSIVE_BASE_URL=http://api.massive.com ... uv run python -m factorflow.ingestion_main` | `repos/factorflow-v2/FactorFlow-v2` | 1 | PASS | stderr `Configuration error: FACTORFLOW_MASSIVE_BASE_URL: scheme must be https`; the value is absent (story-specific validation 2) |
| `git diff 878099d..HEAD --name-only -- scripts tests/e2e src/factorflow/ingestion_main.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | empty (story-specific validation 3) |
| `uv run python -c "RESTClient(...)"` SDK-default probe | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Reviewer probe, not a plan command: default `BASE=https://api.massive.com`, default `retries=3` on client and `vx` — establishes regression sensitivity of TC-COMP-354/355/357 |

Not run, with reasons:

- **The E2E job / `scripts/run-e2e-server.sh`.** The plan's Validation Plan
  states explicitly that the E2E job is expected to fail on this story alone
  under the landing rule and is not a gate here. Not a validation gap: it is a
  planned, documented consequence that CAP-001-E3-S7 resolves in the same merge.
- **T018's 16 manual mutations.** Re-applying them requires editing production
  code, which this agent may not do (constraint 3/4). Their load-bearing claims
  were instead corroborated by reading the assertions and by the SDK-default
  probe above; the one documented survivor is IR-001.

### Validation Side Effects

- Before: `git status --porcelain` empty at `0eb02b9`.
- After: `git status --porcelain` empty at `0eb02b9`.
- Unexpected tracked-file changes: none. `uv build` and the wheel test write
  `dist/`, `build/` and `src/factorflow.egg-info/`, all already ignored, as
  DEC-0045 anticipated.

## Findings

### IR-001 — TC-COMP-356 cannot fail if `base=` is removed (recorded equivalent mutant)

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-9
- **Tasks**: T007, T018
- **Files**: `tests/unit/test_massive_sdk_config.py:206-231`; `CAP-001-E3-S6-tdd-evidence.yaml:110-116,189-191`
- **Claim challenged**: the plan's Phase 2 expectation that TC-COMP-356 is RED before Phase 3, and T018's requirement to strengthen any test a mutation leaves green.
- **Observed evidence**: the test configures `https://api.massive.com/`, which normalises to the SDK's own default base, so removing `base=settings.base_url` produces the identical recorded URL. The coding agent recorded this as mutation M2's one survivor and as a Phase-2 deviation rather than strengthening the test.
- **Expected evidence/behavior**: the plan lists TC-COMP-356 among the RED set and T018 says "Strengthen any test a mutation leaves green."
- **Impact**: none to the criterion. DAC-E3-S6-9 is about trailing-slash normalisation, which the test does pin (mutation C6b dies here), and the `base=` mutant is killed by TC-COMP-354 (both variants) and T013. The analysis in the evidence file is correct: this is a true equivalent mutant for this one test.
- **Required remediation**: none required for this gate. If the team wants the test to carry the `base=` guarantee too, parametrise it over a non-default host with a trailing slash (for example `https://stub.example:8443/`) in addition to the default-host row.

### IR-002 — The TLS keyword-argument test omits the `forbid_sockets` guard T006 prescribes

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-11
- **Tasks**: T006
- **Files**: `tests/unit/test_massive_tls.py:49-63`
- **Claim challenged**: T006's closing instruction, "No socket is opened (use `forbid_sockets`)."
- **Observed evidence**: `test_unset_base_reaches_both_sdk_clients_as_the_governed_host` and `test_both_sdk_pools_require_certificates` both call `forbid_sockets(monkeypatch)`; `test_no_construction_path_passes_a_tls_override` does not.
- **Expected evidence/behavior**: every test in the file installs the socket guard, per T006.
- **Impact**: negligible today — the test patches `factorflow.ingestion.massive.client.RESTClient` for its whole body, so no real SDK client and therefore no pool exists. The guard would, however, be the thing that catches a future construction path that escapes the patch.
- **Required remediation**: add `forbid_sockets(monkeypatch)` to that test, or record in its docstring why the patch makes the guard unnecessary.

### IR-003 — The `http`-acceptance source scan misses the `startswith("http")` form

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-17
- **Tasks**: T012
- **Files**: `tests/unit/test_release_excludes_test_paths.py:105-126`
- **Claim challenged**: "No module under `src/factorflow` … accepts an `http` base URL scheme."
- **Observed evidence**: the AST rule flags an `http://` string constant, a `Compare` node with the constant `"http"`, and `"http"` inside a set/tuple/list literal. A future acceptance written as `value.startswith("http")`, `scheme in SOME_NAME` or a `match` case would not be flagged. The rule's shape is exactly what T012 prescribes, deliberately, so that `@app.middleware("http")` is not a false positive.
- **Expected evidence/behavior**: the criterion names the property, not the detection shape; the plan names the shape.
- **Impact**: none now — the only scheme check in `src/factorflow` is the validator's `parts.scheme != "https"`, which the scan would flag if it were widened to accept `http`, and mutation ACCEPT-http confirms that. The note is about the guard's durability, not a present defect.
- **Required remediation**: none required for this gate. Consider extending the rule to `Call` nodes whose function is `str.startswith`/`str.endswith` with an `http` argument at the next revision of this test.

### IR-004 — The `Dockerfile` parser handles neither line continuations nor JSON-form `COPY`

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S6-17
- **Tasks**: T012
- **Files**: `tests/unit/test_release_excludes_test_paths.py:30-53`
- **Claim challenged**: "Parse the repository `Dockerfile`'s `COPY` and `ADD` instructions and assert no source path is `tests`…"
- **Observed evidence**: `_copy_sources` splits line by line. A `COPY` whose arguments continue onto the next line with a trailing `\`, or the JSON exec form `COPY ["tests", "./tests"]`, would place `tests` on a line the parser does not classify as a `COPY`, and the test would pass. The repository `Dockerfile` uses three simple one-line `COPY` instructions, so the parser is correct for the file as it stands, and the non-empty `assert sources` guard means a parse failure cannot silently pass.
- **Expected evidence/behavior**: the guard should hold for any `Dockerfile` the repository may later carry, since its purpose is to stop `tests/` entering the release image (SEC-NDG-001).
- **Impact**: none today; a latent blind spot if the `Dockerfile` grows a multi-line or JSON-form copy.
- **Required remediation**: none required for this gate. Join continuation lines before classifying, and handle the JSON array form, at the next revision of this test.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, recorded in the TDD evidence.** TC-COMP-356 was GREEN on arrival
  rather than RED, for the equivalent-mutant reason analysed in IR-001.
- **Justified, recorded in the TDD evidence.** The T016 comment sits above
  `base=settings.base_url` rather than inline, because inline it breaks the
  100-column ruff limit. The comment text is unchanged.
- **Justified, unrecorded but harmless.** T014 says `Settings()`; the test calls
  `Settings(_env_file=None)`, matching the isolation precedent every other test
  in the file follows. The asserted behaviour is identical and I reproduced the
  same message from a real process invocation.
- **Bookkeeping.** All twenty task checkboxes are ticked and the story status
  moved `planning` → `in-review`. Both match the implementation state I
  verified; no inconsistency found in either direction.
- **No scope leakage.** The change set is the two planned production files, the
  six planned test files, the helper module, and the three artifact files.
  Nothing under `scripts/`, `tests/e2e/` or `src/factorflow/ingestion_main.py`
  changed, and no dependency or configuration file changed.
- **Merge-order constraint carried forward.** The story's landing rule
  (merge with CAP-001-E3-S7, one merge commit, never squash or rebase) is
  unaffected by this review and remains in force.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to `$doc-sync` for CAP-001-E3-S6, then hold the
  branch under the story's landing rule: it reaches `main` only in the same
  merge commit as CAP-001-E3-S7. The four LOW findings are accepted as warnings
  and need no rework before Doc Sync; IR-002 is the only one with a one-line
  fix, and may be folded into any later touch of `tests/unit/test_massive_tls.py`.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004
