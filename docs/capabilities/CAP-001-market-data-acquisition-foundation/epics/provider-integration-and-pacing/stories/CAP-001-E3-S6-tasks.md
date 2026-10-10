---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S6-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: devin
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-10T15:34:38Z
  source_artifacts:
    - id: CAP-001-E3-S6
      version: "3"
    - id: CAP-001-E3
      version: "4"
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-component-design-runtime-config
      version: "11"
    - id: CAP-001-component-design-massive-client
      version: "12"
    - id: CAP-001-component-design-rate-limit-governor
      version: "8"
    - id: CAP-001-component-design-acquisition-runner
      version: "8"
    - id: CAP-001-component-tests
      version: "2"
    - id: CAP-001-coverage-matrix
      version: "2"
    - id: CAP-001-specification-review
      version: "9"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E3-S6 — Provider Base URL: Validate at Start and Honour It, Release Build Only

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S6.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E3-tasks`
**Date**: 2026-10-10

## Summary

`MassiveSettings.base_url` is loaded today but never validated, and `MassiveClient` builds `RESTClient` without `base=`, so `FACTORFLOW_MASSIVE_BASE_URL` has no effect. This story adds the `runtime-config` section 2.2c validator to `MassiveSettings` (`https` only, clauses 1 to 9, one trailing `/` removed, the message naming the variable and the clause but never the value) and passes `base=settings.base_url` to the SDK so the main client and its `vx` sub-client both honour it. It then proves, without opening a socket, that the client never follows a redirect (a refused redirect is retried by the production governor to the same host and ends in `ProviderUnavailable`, DEC-0042), never uses a proxy (DEC-0038, DEC-0041), never disables TLS verification, and that the release artifact contains nothing under `tests/` (DEC-0033, DEC-0034). Clause 2a (loopback `http`), the test-only entry point, the `main()` parameters and `scripts/run-e2e-server.sh` are CAP-001-E3-S7 and are not planned here. Under the story's landing rule this story merges together with CAP-001-E3-S7.

## Acceptance Criteria Traceability

| AC | Description | Tasks | Test cases |
|----|-------------|-------|------------|
| AC-13 (start refusal) | A non-`https` base URL, loopback `http` included, ends the ingestion process non-zero before any `RESTClient` is built or request sent | T003, T005, T014, T015, T017 | TC-COMP-349, TC-COMP-350, TC-COMP-353 |
| AC-13 (base honoured) | Every request of the four reads, `vx` and `next_url` pages included, goes to the configured `https` base with the key only in `Authorization: Bearer` | T006, T007, T013, T016, T017 | TC-COMP-354, TC-COMP-355, TC-COMP-356 |
| AC-3 | Request URLs are well formed for the acquisition reads (via DAC-E3-S6-9) | T007, T015, T016 | TC-COMP-356 |
| DAC-E3-8 | The governor alone retries, to the configured attempt limit (via DAC-E3-S6-10, S6-13) | T007, T008 | TC-COMP-357, TC-COMP-360 |
| DAC-E3-S6-1 | Unset variable yields `https://api.massive.com` | T002, T015 | TC-COMP-347 |
| DAC-E3-S6-2 | Every accepted table row loads; `https://api.massive.com/` loads as `https://api.massive.com` | T002, T015 | TC-COMP-348 |
| DAC-E3-S6-3 | `http`, `ftp` and scheme-less values raise `ConfigurationError` naming the variable | T003, T015 | TC-COMP-349 |
| DAC-E3-S6-4 | Loopback `http` values raise `ConfigurationError` in the release settings | T003, T015 | TC-COMP-350 |
| DAC-E3-S6-5 | Every other rejected row, plus unbracketed `http://::1:8126` and a control character, raises | T003, T015 | TC-COMP-351 |
| DAC-E3-S6-6 | The message names the variable and the clause, never the value, `s3cret` or the API key | T004, T014, T015 | TC-COMP-352 |
| DAC-E3-S6-7 | `ingestion_main.main()` returns non-zero before any `RESTClient`, naming the variable, not the value | T005, T017 | TC-COMP-353 |
| DAC-E3-S6-8 | `RESTClient` receives `base=settings.base_url`; `BASE` and `vx.BASE` equal it; unset gives `https://api.massive.com` | T006, T007, T016 | TC-COMP-354, TC-COMP-355 |
| DAC-E3-S6-9 | A configured trailing `/` never produces `//v3` | T007, T015, T016 | TC-COMP-356 |
| DAC-E3-S6-10 | `retries == 0` on the main client and on `vx`; `pagination` and `trace` False | T007, T018 | TC-COMP-357 |
| DAC-E3-S6-11 | No construction path sets `verify=False`; the SDK pool keeps `cert_reqs="CERT_REQUIRED"` | T006, T018 | TC-COMP-358 |
| DAC-E3-S6-12 | Socket-free redirect harness whose fake returns the `retries` it was passed | T001, T008 | TC-COMP-359 |
| DAC-E3-S6-13 | Main-pool redirect: `ProviderUnavailable` after `max_attempts` requests, all to `api.massive.com` | T008, T018 | TC-COMP-360 |
| DAC-E3-S6-14 | `vx` redirect driven directly: `max_attempts` `/vX/` requests through the `vx` pool, then `ProviderUnavailable` | T009, T018 | TC-COMP-361 |
| DAC-E3-S6-15 | A `retries=3` control follows the redirect, proving the harness drives urllib3's real path | T010 | TC-COMP-362 |
| DAC-E3-S6-16 | No proxy on either pool, for the base URL and for `http://127.0.0.1:8126` | T011, T018 | TC-COMP-363 |
| DAC-E3-S6-17 | `Dockerfile` and wheel contain nothing under `tests/`; `src/factorflow` imports nothing from `tests` and accepts no `http` base URL | T012, T018 | TC-COMP-364 |
| DAC-E3-S6-18 | New tests carry no `postgres` marker and pass without container or network; existing tests still pass | T019 | TC-COMP-365 |

All 19 mapped component test cases, TC-COMP-347 to TC-COMP-365, are planned.

## Phase 1: Setup

**Purpose**: Add one shared, socket-free transport fake so the redirect, proxy, URL-recording and base-honoured tests use the same harness rather than four copies.

- [x] T001 Create `tests/unit/massive_transport_fakes.py`, following the helper-module precedent of `tests/unit/governor_fakes.py` (no tests in it, no production import beyond `urllib3`). It provides: (a) `generated_test_key() -> str` returning `"TEST-ONLY-" + secrets.token_hex(16)`, so no fixed key literal is committed (`runtime-config` 2.2c item 3); (b) `forbid_sockets(monkeypatch)` patching `socket.create_connection` and `socket.getaddrinfo` to call `pytest.fail(...)`, and recording whether either fired; (c) `RecordingMakeRequest`, a replacement for `urllib3.connectionpool.HTTPConnectionPool._make_request` with urllib3 2.7.0's signature (`self, conn, method, url, body=None, headers=None, retries=None, timeout=..., chunked=False, response_conn=None, preload_content=True, decode_content=True, enforce_content_length=True`). Each call records the pool object (`self`), `self.scheme`, `self.host`, `self.port`, the request path, and the `Authorization` header value; it answers through a per-test responder whose default is status `302` with `Location: https://198.51.100.7/` and an empty body; and it returns a `urllib3.HTTPResponse` constructed with `retries=retries`, the value it was passed, as urllib3 does (DAC-E3-S6-12, specification review v7 FINDING-19 (c)). A responder may instead return status `200` with a JSON body (used by T007, T009's alternative route and T013). Install it with `monkeypatch.setattr(urllib3.connectionpool.HTTPConnectionPool, "_make_request", fake)` so everything above it, the SDK and `PoolManager.urlopen` included, is unpatched. Traces to DAC-E3-S6-12 (prerequisite infrastructure).

**Checkpoint**: The helper module imports cleanly, defines no test, and opens no socket.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the 19 mapped component tests and the additional unit tests first. Each test function carries a `# Implements TC-COMP-NNN` comment, as existing tests do. No test carries a `postgres` marker. Every test that loads settings from the environment first calls `monkeypatch.delenv("FACTORFLOW_MASSIVE_BASE_URL", raising=False)` unless it sets the variable, sets `FACTORFLOW_MASSIVE_API_KEY` to `generated_test_key()` and `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` to `60`, and loads with `MassiveSettings(_env_file=None)` (the `tests/unit/test_settings_validation.py` precedent).

Expected state before Phase 3: RED for TC-COMP-348 (trailing-slash normalisation), 349, 350, 351, 352, 353, 354, 356, T013 and T014. Already GREEN, because they guard behaviour the code has today: TC-COMP-347, 355, 357, 358, 359 to 363 and 364. T018 proves each already-green test can fail by a recorded mutation.

### Mandatory Component Tests

- [x] T002 [P] Implement TC-COMP-347 and TC-COMP-348 in a new `tests/unit/test_settings_base_url.py` (module docstring cites `component-design-runtime-config.md` section 2.2c and CAP-001-E3-S6). TC-COMP-347: with the variable absent, `MassiveSettings(_env_file=None).base_url == "https://api.massive.com"`. TC-COMP-348: parametrise over `https://api.massive.com`, `https://api.massive.com/`, `HTTPS://API.MASSIVE.COM`, `https://api.massive.com:443` and `https://other.example`; each loads without error; assert `https://api.massive.com/` loads as `https://api.massive.com` (clause 6), and every other value loads unchanged, which is the 2.2c snippet's return value (the validator lowercases nothing and strips nothing).
- [x] T003 Implement TC-COMP-349, TC-COMP-350 and TC-COMP-351 in `tests/unit/test_settings_base_url.py` (depends on T002, same file). Each value is set through `monkeypatch.setenv` and each load must raise `ConfigurationError` whose message contains `FACTORFLOW_MASSIVE_BASE_URL`. TC-COMP-349: `http://api.massive.com`, `ftp://api.massive.com`, `api.massive.com`. TC-COMP-350: `http://127.0.0.1:8126`, `http://localhost:8126`, `http://[::1]:8126`; the docstring states the test stays unchanged when clause 2a takes effect (SEC-NDG-001, DEC-0033). TC-COMP-351: `https://`, `https:///v3`, `https:api.massive.com`, `https://user:pw@api.massive.com`, `https://api.massive.com:0`, `https://api.massive.com:70000`, `https://api.massive.com:abc`, `https://api.massive.com/v3`, `https://api.massive.com//`, `https://api.massive.com?x=1`, `https://api.massive.com#f`, the empty string, `" https://api.massive.com"`, unbracketed `http://::1:8126` and `"https://api.massive.com\x7f"`. For `http://::1:8126` assert only rejection and the variable name, never the clause (story Open Question, specification review v7 FINDING-12 (c)).
- [x] T004 Implement TC-COMP-352 in `tests/unit/test_settings_base_url.py` (depends on T003, same file). With `FACTORFLOW_MASSIVE_API_KEY` set to `generated_test_key()`, load `https://user:s3cret@api.massive.com` and every rejected value of T003. Assert each message equals exactly `FACTORFLOW_MASSIVE_BASE_URL: <clause>` (section 2.2c clause 9; see Resolved Conflicts 1), where the clause is the 2.2c snippet string for that value: `must be a non-empty URL without whitespace` (empty, surrounding whitespace, `\x7f`), `must not carry a query or fragment`, `scheme must be https` (`http`, `ftp`, scheme-less, the three loopback values), `host is missing` (`https://`, `https:///v3`, `https:api.massive.com`), `must not carry userinfo` (both userinfo values), `port must be an integer from 1 to 65535` (`:0`, `:70000`, `:abc`), `must not carry a path` (`/v3`, `//`). For `http://::1:8126` assert only that the message starts with `FACTORFLOW_MASSIVE_BASE_URL: `. Assert no message contains the submitted value (skip this substring check for the empty string, which every string contains), `s3cret`, or the API key.
- [x] T005 [P] Implement TC-COMP-353 in `tests/unit/test_ingestion_main.py` (extend; keep every existing test unchanged). Set `FACTORFLOW_DATABASE_URL=postgresql://unused/unused`, `FACTORFLOW_MASSIVE_API_KEY=generated_test_key()`, `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60` and `FACTORFLOW_MASSIVE_BASE_URL=http://api.massive.com`. Patch `factorflow.ingestion.massive.client.RESTClient` with a `MagicMock`, and patch `factorflow.ingestion_main.psycopg.connect` and `factorflow.ingestion_main.run_polling_loop` with mocks that call `pytest.fail`, so a missing validator fails the test rather than opening a connection. Call `factorflow.ingestion_main.main()` with no arguments (the S7 keyword parameters do not exist yet and are not added here). Assert the return value is non-zero, the `RESTClient` mock was never called, and the stderr line captured with `capsys` names `FACTORFLOW_MASSIVE_BASE_URL` and does not contain `http://api.massive.com`; also assert no `caplog` record contains the value (see Resolved Conflicts 3 for why stderr is the log line).
- [x] T006 [P] Implement TC-COMP-355 and TC-COMP-358 in a new `tests/unit/test_massive_tls.py`. TC-COMP-355: with the variable unset, build `MassiveClient(settings=MassiveSettings(_env_file=None), governor=...)` on the real, unpatched SDK and assert `client._rest_client.BASE == client._rest_client.vx.BASE == "https://api.massive.com"`. TC-COMP-358: cover both construction paths the component offers, `MassiveClient.__init__` and `factorflow.ingestion_main._build_client_for_key(key_value, settings)` (the credential-rebuild path). With `factorflow.ingestion.massive.client.RESTClient` patched, assert neither call's keyword arguments contain `verify`, `cert_reqs`, `ssl_context` or `ca_certs`; on the real SDK assert `client._rest_client.client.connection_pool_kw["cert_reqs"] == "CERT_REQUIRED"` and the same for `client._rest_client.vx.client`. No socket is opened (use `forbid_sockets`).
- [x] T007 [P] Implement TC-COMP-354, TC-COMP-356 and TC-COMP-357 in `tests/unit/test_massive_sdk_config.py` (extend; keep the existing tests and their `_settings` helper unchanged; new tests pass `api_key=generated_test_key()`). TC-COMP-354: with `FACTORFLOW_MASSIVE_BASE_URL=https://stub.example:8443`, (a) with `RESTClient` patched, assert `kwargs["base"] == settings.base_url == "https://stub.example:8443"`; (b) on the real SDK, assert `BASE` and `vx.BASE` both equal `https://stub.example:8443`. TC-COMP-356: with `FACTORFLOW_MASSIVE_BASE_URL=https://api.massive.com/`, install `RecordingMakeRequest` with a `200` responder returning `{"request_id": "req_ok_001", "results": <tests/fixtures/massive/reference_active.json>}` and `forbid_sockets`, call `fetch_reference("AAPL")`, and assert the first recorded request is `https`, host `api.massive.com`, path starting `/v3/`, and that the reconstructed URL contains no `//v3`. TC-COMP-357: on the real SDK assert `client._rest_client.retries == 0`, `client._rest_client.vx.retries == 0`, `client._rest_client.pagination is False` and `client._rest_client.trace is False`.
- [x] T008 [P] Implement TC-COMP-359 and TC-COMP-360 in a new `tests/unit/test_massive_redirects.py`. Harness per T001, on the default base (variable unset), key from `generated_test_key()`. The governor is `RateLimitGovernor(GovernorSettings.from_massive_settings(settings), sleep=lambda _s: None, jitter=lambda: 0.0)` with `settings` loaded from the environment with `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60` and `max_attempts` left at its default of 3; `monotonic` is not injected (specification review v9 FINDING-27: a frozen clock with a no-op `sleep` never ends the token wait). TC-COMP-359 (harness assertions, applied after TC-COMP-360, 361 and 362 through a shared assertion helper): neither socket guard fired, every recorded scheme is `https`, and the fake's returned response carried the `retries` object it was passed. TC-COMP-360: `pytest.raises(ProviderUnavailable)` around `fetch_reference("AAPL")`; assert the raised error is not a `urllib3.exceptions.MaxRetryError`, its `__cause__` is one, the recorded requests number `settings.max_attempts` (3), each is host `api.massive.com`, and none is to `198.51.100.7`.
- [x] T009 Implement TC-COMP-361 in `tests/unit/test_massive_redirects.py` (depends on T008, same file). Use route one of `massive-client` section 7: `client._through_governor(lambda: client._rest_client.vx.list_ipos(ticker="AAPL", raw=True))` with the T008 governor. Assert `ProviderUnavailable`; the recorded requests whose path starts `/vX/reference/ipos` number 3 and every one was recorded on the pool `client._rest_client.vx.client.connection_from_url("https://api.massive.com")` (pool identity, the attribution specification review v9 SR-7 verified); every recorded request is host `api.massive.com`, none is `198.51.100.7`; and the test asserts explicitly that at least one `/vX/reference/ipos` request was recorded, so it cannot pass while exercising only the main pool.
- [x] T010 Implement TC-COMP-362 in `tests/unit/test_massive_redirects.py` (depends on T008, same file). Inside the harness, build a bare SDK `RESTClient(api_key=generated_test_key(), retries=3)` on the default base (a `MassiveClient` takes no `retries` argument) and call `get_ticker_details("AAPL")`, expecting `urllib3.exceptions.MaxRetryError` once its redirect budget is spent. Assert at least one recorded request has host `198.51.100.7`, which proves the fake drives urllib3's real redirect path, and that no socket guard fired.
- [x] T011 Implement TC-COMP-363 in `tests/unit/test_massive_redirects.py` (depends on T008, same file). Set `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `http_proxy`, `https_proxy` and `all_proxy` to `http://127.0.0.1:9`, delete `NO_PROXY` and `no_proxy`, enable `forbid_sockets` and install `RecordingMakeRequest`. Build `MassiveClient` as in 2.2b. For each of `client._rest_client.client` and `client._rest_client.vx.client`: assert `isinstance(pool, urllib3.PoolManager)` and not `isinstance(pool, urllib3.ProxyManager)`; `pool.connection_from_url("https://api.massive.com")` is an `HTTPSConnectionPool` with host `api.massive.com` and `proxy is None`; `pool.connection_from_url("http://127.0.0.1:8126")` has `type(...) is urllib3.HTTPConnectionPool` (not the `HTTPS` subclass) and `proxy is None` (DEC-0041). Assert the fake recorded no request.
- [x] T012 [P] Implement TC-COMP-364 in a new `tests/unit/test_release_excludes_test_paths.py`. (a) Parse the repository `Dockerfile`'s `COPY` and `ADD` instructions and assert no source path is `tests`, starts with `tests/`, or is a whole-context copy (`.` or `./`). (b) Run `uv build --wheel --offline --out-dir <tmp_path>` with `subprocess.run(..., check=True, cwd=<repo root>)` (the `tests/unit/test_no_committed_secrets.py` subprocess precedent) and assert no name in the single built wheel's `zipfile` listing starts with `tests/`. `--offline` keeps the test off the network (see Other Notes). (c) Walk every `*.py` under `src/factorflow` with `ast` and assert no `Import`/`ImportFrom` names `tests` or `tests.*`; and that no string constant starts with `http://` (case-insensitive) and no `Compare` node, nor any `set`/`tuple`/`list` literal, contains the constant `"http"` (case-insensitive). The call argument in `@app.middleware("http")` in `src/factorflow/api/app.py` is neither and so is not flagged; the docstring states why the rule is shaped this way.

### Additional Unit Tests

- [x] T013 Add a base-honoured test for AC-13's second criterion in `tests/unit/test_massive_sdk_config.py` (depends on T007, same file). With `FACTORFLOW_MASSIVE_BASE_URL=https://stub.example:8443`, `forbid_sockets`, and `RecordingMakeRequest` answering `200` (a two-page bars response whose first page's `next_url` is `https://api.massive.com/v2/aggs/ticker/AAPL/range/1/day/2024-01-01/2024-01-31?cursor=abc`, empty result pages for every other list endpoint, `{"results": {"events": []}}` for ticker events, and the reference fixture for `get_ticker_details`), run all four reads. Assert every recorded request is `https`, host `stub.example`, port `8443` (the `next_url` page included, because `paging.follow_pages` reuses only its path), the `/vX/reference/ipos` request was recorded on the `vx` pool, every `Authorization` value equals `"Bearer " + key`, and no recorded path contains the key or `apiKey`.
- [x] T014 Add an aggregate-load test in `tests/unit/test_settings_base_url.py` (depends on T004, same file). With valid `FACTORFLOW_DATABASE_URL`, API key and rate set and `FACTORFLOW_MASSIVE_BASE_URL=http://api.massive.com`, `Settings()` raises `ConfigurationError` whose message is exactly `FACTORFLOW_MASSIVE_BASE_URL: scheme must be https`. This pins the path `ingestion_main.main()` takes: `Settings` builds `MassiveSettings` through `default_factory`, so the error reaches `main` unchanged.

**Checkpoint**: T002 to T014 exist, are traceability-labelled, carry no `postgres` marker, and the RED set listed above fails for the stated reason while the GREEN set passes.

---

## Phase 3: Core Implementation

**Purpose**: Add the validator and the `base=` argument, the only two production changes the story names.

- [x] T015 Add `_validate_base_url` to `MassiveSettings` in `src/factorflow/config/settings.py` as `@field_validator("base_url")` + `@classmethod`, following the `runtime-config` section 2.2c snippet clause for clause and in its order: empty, whitespace or non-printable character; `?` or `#`; `urlsplit(value).scheme != "https"`; missing `hostname`; `@` in `netloc`; `parts.port` raising `ValueError` or equal to `0`; `path` not in `("", "/")`; return `value[:-1] if parts.path == "/" else value`. Raise each clause as `pydantic_core.PydanticCustomError("base_url", "<clause>")` with the snippet's exact clause strings, instead of the snippet's `ValueError`, so `_EnvNamedSettings` renders exactly `FACTORFLOW_MASSIVE_BASE_URL: <clause>` (Resolved Conflicts 1). Import `urlsplit` from `urllib.parse`, `field_validator` from `pydantic` and `PydanticCustomError` from `pydantic_core`. Add no `http` branch, flag, constant or environment variable; keep the comment `# clause 2a lives only under tests/ (DEC-0033)` at the scheme check. The docstring cites section 2.2c, DAC-E3-S6-1 to S6-6 and TC-COMP-347 to TC-COMP-352, and explains the `PydanticCustomError` choice the way `ApiSettings._reject_non_loopback_host` explains its own gap. Leave `base_url: str = "https://api.massive.com"` and `_EnvNamedSettings` unchanged.
- [x] T016 [P] Add `base=settings.base_url,` to the `RESTClient(...)` call in `MassiveClient.__init__` in `src/factorflow/ingestion/massive/client.py`, with the comment `# validated https at start (runtime-config 2.2c); vx inherits it (section 2.2b)`. Leave the `retries=0` line exactly as it is, and add no `redirect`, `Retry`, proxy or `ProxyManager` argument. Update the module docstring's sentence about "the three SDK defaults section 2.2b identifies" so it also names `base` as mandatory (section 2.2b, DAC-E3-S6-8).

**Checkpoint**: Every Phase 2 test passes; `uv run mypy src` reports no new error.

---

## Phase 4: Integration

**Purpose**: Confirm the entry point and the credential-rebuild path carry the validated base without any change to code another story owns.

- [x] T017 Verify, without editing, that `src/factorflow/ingestion_main.py` needs no change: `main()` already turns the `ConfigurationError` from `Settings()` into a stderr line and return code 1 before `psycopg.connect` or any client is built (TC-COMP-353 green), and `_build_client_for_key` keeps `base_url` through `settings.massive.model_copy(update={"api_key": ...})`, so a rebuilt client keeps the configured base (TC-COMP-358's second construction path green). The `main()` keyword parameters are CAP-001-E3-S7's (DEC-0035) and are not added here. If either check fails, stop and report rather than editing the entry point.

**Checkpoint**: Start refusal and base propagation hold on the release entry point, and `ingestion_main.py` is unchanged.

---

## Phase 5: Polish

**Purpose**: Prove every guard test can fail, run the full validation set, and record TDD evidence.

- [x] T018 Perform and revert these manual mutations, recording each failing test in the TDD evidence (T020): in `src/factorflow/ingestion/massive/client.py`, `retries=0` changed to `retries=3` (TC-COMP-357 and TC-COMP-360 must fail; TC-COMP-361 must fail or record a `198.51.100.7` request), and `base=` removed (TC-COMP-354, TC-COMP-356, T013 must fail); a temporary line after the `RESTClient(...)` call setting `self._rest_client.client.connection_pool_kw["cert_reqs"] = "CERT_NONE"` (TC-COMP-358 must fail); in `src/factorflow/config/settings.py`, each validator clause removed one at a time (its TC-COMP-348 to TC-COMP-352 rows must fail) and an `"http"` scheme accepted (TC-COMP-349, TC-COMP-350, TC-COMP-364 (c) must fail); in `tests/unit/massive_transport_fakes.py`, the fake returning `retries=None` (TC-COMP-359 must fail); and a temporary `COPY tests ./tests` in `Dockerfile` (TC-COMP-364 (a) must fail). Strengthen any test a mutation leaves green.
- [x] T019 Implement TC-COMP-365 as a recorded suite check: run `uv run pytest -m 'not postgres'` and confirm it passes, including the existing `tests/unit/test_massive_sdk_config.py`, `tests/unit/test_massive_auth.py` and `tests/unit/test_ingestion_main.py`; run `uv run pytest -m postgres --collect-only -q tests/unit/test_settings_base_url.py tests/unit/test_massive_tls.py tests/unit/test_massive_redirects.py tests/unit/test_release_excludes_test_paths.py tests/unit/test_massive_sdk_config.py tests/unit/test_ingestion_main.py` and confirm it selects no test; then run the remaining validation commands below. Record the outputs in the TDD evidence file.
- [x] T020 After each TDD cycle in T002–T019 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S6-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC). Suggested cycles: (1) validator, T002–T004 and T014 RED, then T015; (2) start refusal, T005 against T015; (3) base honoured, T007 and T013 RED, then T016; (4) guard tests T006 and T008–T012, GREEN on arrival, made meaningful by T018's mutations, which the cycle records as such rather than as a RED phase.

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S3 | hard | `MassiveSettings`, `_EnvNamedSettings`, `ConfigurationError` and `Settings` in `src/factorflow/config/settings.py`, which T015 extends. Existing edge. |
| CAP-001-E3-S1 | hard | `MassiveClient.__init__`'s `RESTClient(...)` call and `_through_governor` in `src/factorflow/ingestion/massive/client.py` (T009, T016). Existing edge. |
| CAP-001-E3-S3 | hard | T008 and T009 import `ProviderUnavailable` from `src/factorflow/ingestion/massive/errors.py`, whose docstring names CAP-001-E3-S3. **New edge added to `dependencies.yaml`.** It is also transitive through CAP-001-E3-S4, but recorded directly because this story's own tests import it. |
| CAP-001-E3-S4 | hard | `RateLimitGovernor` and `GovernorSettings.from_massive_settings` in `src/factorflow/ingestion/rate_limit.py`, whose `max_attempts` retry T008 and T009 assert. Existing edge. |
| CAP-001-E4-S5 | hard | `factorflow.ingestion_main.main` and `_build_client_for_key` (T005, T006, T017). Existing edge. |
| CAP-001-E3-S7 | reverse | CAP-001-E3-S7 wraps this story's validator in its test-only entry point and already hard-depends on CAP-001-E3-S6. The two merge together under the landing rule; that is a merge-order constraint, not a graph edge. |

### Task Dependencies

- T001: No dependencies.
- T002: Depends on T001 (uses `generated_test_key`). T003, T004 and T014 follow T002 in sequence, because they share one file.
- T005, T006, T007, T008, T012: Depend on T001 only; each is a separate file, so they run in parallel with each other and with the T002 chain.
- T009, T010, T011: Depend on T008 and run in sequence, because they share one file.
- T013: Depends on T007 (same file).
- T015: Depends on T002, T003, T004 and T014 being written and RED.
- T016: Depends on T007 and T013 being written and RED; parallel with T015 (different file).
- T017: Depends on T005, T006, T015 and T016.
- T018: Depends on T015, T016 and all Phase 2 tests.
- T019: Depends on T018.
- T020: Interleaved — runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- Phase 2: the T002 chain, T005, T006, T007 (then T013), the T008 chain and T012 can all proceed in parallel after T001.
- Phase 3: T015 and T016 touch different files and can run in parallel.

### Phase Dependencies

- Phase 1 precedes Phase 2. Phase 3 starts only when its tests are RED. Phase 4 follows Phase 3. Phase 5 follows Phase 4, except T020, which runs after every cycle.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest`
- No-container test subset: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- `uv run pytest -m 'not postgres' tests/unit/test_settings_base_url.py tests/unit/test_massive_tls.py tests/unit/test_massive_sdk_config.py tests/unit/test_massive_redirects.py tests/unit/test_release_excludes_test_paths.py tests/unit/test_ingestion_main.py tests/unit/test_massive_auth.py` passes with no network and no container.
- `FACTORFLOW_MASSIVE_BASE_URL=http://api.massive.com` with otherwise valid settings: `uv run python -m factorflow.ingestion_main` exits 1 and its stderr names the variable but not the value (AC-13, DAC-E3-S6-7).
- `git diff` shows no change under `scripts/`, `tests/e2e/` or `src/factorflow/ingestion_main.py` (S7 scope and Phase 4).
- Every mutation in T018 is killed.
- The E2E job is expected to fail on this story alone (the story's landing rule); it is not run as a gate here, and this story must not reach `main` except in the same merge as CAP-001-E3-S7.

---

## Notes

### Resolved Conflicts

1. **Message format: section 2.2c prose against its snippet.** Clause 9 says the message "reads `FACTORFLOW_MASSIVE_BASE_URL: <clause that failed>`", and the story's API Contract repeats it. The snippet raises `ValueError`, which Pydantic renders as `Value error, <clause>`, so `_EnvNamedSettings` would produce `FACTORFLOW_MASSIVE_BASE_URL: Value error, <clause>`. Design normative prose outranks an illustrative snippet, so the prose governs. T015 raises `PydanticCustomError` with the snippet's own clause strings, which renders exactly the prose format and changes nothing else; DAC-E3-S6-6 and TC-COMP-352 (contains the variable and the clause) hold either way. `_EnvNamedSettings` is not changed, because that would alter every other variable's message. Flag the snippet for `runtime-config`'s next revision. Recorded as DEC-0044.
2. **Unbracketed `http://::1:8126`: the 2.2c table against the clause order.** The table gives "host missing"; clause order (2 before 3), the snippet, the story's Implementation section ("checks the scheme first") and the story's approved Open Question all give "scheme must be https", and the Open Question records that the table is the element needing correction. The story outranks the design, so scheme-first governs. DAC-E3-S6-5 and TC-COMP-351 assert only rejection and the variable name, and T004 does not assert this value's clause.
3. **TC-COMP-353's "log records" against the entry point's stderr line.** `ingestion_main.main()` prints the `ConfigurationError` to stderr before logging is configured. `component-design-acquisition-runner.md` section 2.1 says a `ConfigurationError` "is handled exactly as today", and `runtime-config` section 4 says validation failures are written to the container log the owner reads, which is that stderr stream. Story DAC-E3-S6-7's "log line" is therefore the stderr line. The test specification is the lower authority, so T005 reads stderr with `capsys` and also checks `caplog`, and `ingestion_main.py` is not changed.
4. **No live conflict on redirects.** The story's "Design refinement required" paragraph is satisfied: `massive-client` v12 sections 2.2b and 7 now match DAC-E3-S6-10 and S6-12 to S6-15 and DEC-0042. Its "urllib3 raises `MaxRetryError`" is the urllib3 level; `ProviderUnavailable` is the `MassiveClient` boundary (T008 asserts both: the raised type and its `__cause__`).
5. **Not conflicts.** DAC-E3-S6-15's "same main-pool read" and TC-COMP-362's bare `RESTClient(retries=3).get_ticker_details` are the same SDK call `fetch_reference` makes, on a client that can take `retries`. `massive-client` section 7 allows the governor budget to be set through `requests_per_minute` or an injected `monotonic`; T008 uses `requests_per_minute`, which satisfies the design and avoids the hang specification review v9 FINDING-27 found.

### Open Gaps

- **Offline wheel build mechanism (T012) — PROVISIONAL — awaiting owner confirmation (2026-10-10), DEC-0045.** DAC-E3-S6-17 names "the wheel `uv build` produces" and DAC-E3-S6-18 requires no network; no artifact says how both hold. Adopted: `uv build --wheel --offline --out-dir <tmp_path>`. Derivation: `uv sync --all-extras` runs before pytest in the tech stack's validation order and in `.github/workflows/validate.yml`, so the setuptools backend is in uv's cache; verified locally on 2026-10-10 (see Other Notes).
- Apart from that mechanism, no bound, limit, default or threshold in this plan is left undetermined. The default base (`https://api.massive.com`), the port range (1 to 65535), `max_attempts` (3), the redirect target (`https://198.51.100.7/`), the proxy value (`http://127.0.0.1:9`), the loopback probe URL (`http://127.0.0.1:8126`) and the test-key form are fixed by `runtime-config` 2.2c and 2.3, `massive-client` section 7, the story and TC-COMP-359 to 363. The test `requests_per_minute` of 60 meets TC-COMP-360's and 361's "no smaller than 3" and matches the existing tests in `tests/unit/test_massive_sdk_config.py`; it is a test input, not a product value.

### Other Notes

- **Producer map.** Every module this plan modifies or imports already exists: `src/factorflow/config/settings.py` (CAP-001-E1-S3), `src/factorflow/ingestion/massive/client.py` (CAP-001-E3-S1), `src/factorflow/ingestion/massive/errors.py` (CAP-001-E3-S3), `src/factorflow/ingestion/rate_limit.py` (CAP-001-E3-S4) and `src/factorflow/ingestion_main.py` (CAP-001-E4-S5). All five stories are implemented, so none delays this one.
- **Offline wheel build (T012).** DAC-E3-S6-17 names "the wheel `uv build` produces" and DAC-E3-S6-18 requires no network. No artifact says how both hold. The plan uses `uv build --wheel --offline`, which finds the setuptools build backend in uv's cache: `uv sync --all-extras` builds the editable `factorflow` project first, both in the tech stack's validation order and in `.github/workflows/validate.yml`, which runs it before `uv run pytest -m 'not postgres'`. Verified locally on 2026-10-10 (a 56-file wheel, no `tests/` entry). If the CI cache does not hold the backend, the test fails loudly; the implementing agent must then report it rather than drop `--offline` or add a dependency. The build writes `build/` and `src/factorflow.egg-info/`, both already in `.gitignore`.
- **Landing rule.** Once T015 lands, `scripts/run-e2e-server.sh` line 145 (`FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:8126`) starts an ingestion process that refuses to start. Do not change the script here; it is CAP-001-E3-S7's. Merge this story only together with CAP-001-E3-S7 by one of the two routes in the story's Description, with a merge commit.
- **Design version.** The story cites `massive-client` v11; v12 (approved) is current and is the version planned against. v12 differs only in aligning section 2.2b and section 7 with DEC-0042 and the story.
- **Existing fixed key literals.** `tests/unit/test_massive_sdk_config.py` (`"test-secret-key"`) and `tests/unit/test_massive_auth.py` already hold fixed placeholder keys. They are left unchanged (surgical); every test added here uses `generated_test_key()`, as the story requires for the redirect and proxy tests.
- **No README change.** The README already lists `FACTORFLOW_MASSIVE_BASE_URL` with its default. Documenting the new validation rule is `$doc-sync`'s.
- **Out of scope** (story Description): clause 2a, the test-only entry point, `main()` parameters, `scripts/run-e2e-server.sh`, `runtime-config` section 14 items 5 and 6, `massive-client` section 14 item 7, and release-evidence naming (ER-002).
