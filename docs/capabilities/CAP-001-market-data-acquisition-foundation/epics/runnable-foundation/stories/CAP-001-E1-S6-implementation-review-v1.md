---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S6-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-08
updated: 2026-09-08
story_id: "CAP-001-E1-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-08T02:28:14Z"
reviewed_head: "94a5bba7336ce113de3fae7b7c16e92885940c35"
review_base: "d0b01577741e58cdc2968cb88e08f943e09892d7"
reviewed_state_revision: "sha256:830a7795349e3420480b80f64687cdea830e488e427c62760fcbcb0106831094"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E1-S6
    artifact_version: 1
    content_revision: sha256:a7cdcf3a31a9e610d5abe7a75596593cb29a01eb79b45c07fa8ecd8c3a6bec26
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-08T02:28:14Z
  source_artifacts:
    - id: CAP-001-E1-S6
      version: "1"
    - id: CAP-001-E1-S6-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S6 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 1 |
| High findings | 3 |
| Medium findings | 3 |
| Low findings | 2 |
| Acceptance criteria | 6/10 satisfied |
| Planned tasks | 22/25 verified |
| Required validation | 5/5 passed |

Every required validation command passes, the implementation is well-structured, and the health endpoint's real runtime behavior is correct when exercised by hand. The verdict is driven by defects the passing suite does not detect.

The blocking issue is IR-001: `app.py`'s `_install_request_id_patch()` re-wraps `logging.Handler.handle` using the **same** `_unfiltered_handle` sentinel attribute that CAP-001-E1-S3's `configure_logging()` uses for credential redaction. Because the S6 patch re-wraps from that stored baseline, it discards the redaction wrapper, and a log record containing the provider credential is emitted verbatim. This was proven by direct execution, not inferred. AC-13 and `component-design-runtime-config.md:399` ("installed on every handler at process start, in both processes") are violated. Compounding this, `configure_logging()` is never called anywhere in the API process, so the application process has no redaction installed at all.

Three further HIGH/MEDIUM findings concern tests that cannot fail. Mutation testing showed `test_health_unreachable_database` still passes when `probe_database_reachable` is bypassed entirely (`reachable = True` hardcoded), so DAC-E1-S6-2 has no regression sensitivity; the AC-14 non-loopback assertion is skipped on any host where `gethostbyname` fails (it does on this machine); and the SPA-fallback assertion accepts both 200 and 404, so DAC-E1-S6-4 asserts nothing about the mount.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S6` (matches `origin/`, pushed) |
| HEAD | `94a5bba7336ce113de3fae7b7c16e92885940c35` |
| Review base | `origin/main` merge-base `d0b01577741e58cdc2968cb88e08f943e09892d7` |
| Working tree | clean — no staged, unstaged, or untracked files |
| Changed files reviewed | 22 (1 commit) |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/__init__.py` | added | T001 |
| `src/factorflow/api/routes/__init__.py` | added | T001 |
| `src/factorflow/api/static/.gitkeep` | added | T001 |
| `src/factorflow/api/models.py` | added | T002 |
| `src/factorflow/api/errors.py` | added | T003 |
| `src/factorflow/api/routes/health.py` | added | T016 |
| `src/factorflow/api/app.py` | added | T017–T020 |
| `src/factorflow/app_main.py` | added | T021 |
| `tests/unit/test_api_request_id.py` | added | T005 (TC-COMP-345) |
| `tests/integration/test_api_binding.py` | added | T006 (TC-COMP-014, 346) |
| `tests/integration/test_api_health.py` | added | T007, T008, T010 (TC-COMP-307, 341, 342, 018, 343) |
| `tests/unit/test_api_no_secrets.py` | added | T009 (TC-COMP-300) |
| `tests/integration/test_api_static_mount.py` | added | T011 (TC-COMP-344) |
| `tests/unit/test_api_isolation.py` | added | T012 |
| `tests/unit/test_health_schema_version.py` | added | T013 |
| `tests/unit/test_health_database_probe.py` | added | T014 |
| `tests/unit/test_api_models.py` | added | T015 |
| `pyproject.toml` | modified | T017, T021 — adds `fastapi`, `uvicorn`, `psycopg-pool`, `httpx`, `pytest-asyncio` |
| `uv.lock` | modified | Lockfile for the above |
| `Dockerfile` | modified | T021/T023 — CMD now execs `factorflow.app_main`, replacing the placeholder `factorflow.main:app`. Justified: the prior comment explicitly deferred this to "whichever story adds the FastAPI app" |
| `.../CAP-001-E1-S6-tasks.md` | modified | Task checkboxes T001–T025 |
| `.../CAP-001-E1-S6.md` | modified | `status: planning` → `in-review`, `updated` date |

No unjustified files. `pytest-asyncio` is added but no test in this change set is `async`; see IR-008.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-14 (loopback-only bind) | PARTIAL | `app_main.py:18` uses `settings.host`; `config/settings.py:91-104` `_reject_non_loopback_host` | `tests/integration/test_api_binding.py:29` | Loopback reachability is asserted. The non-loopback half is inside `if non_loopback_ip and non_loopback_ip != "127.0.0.1"`, and `socket.gethostbyname` raises `gaierror` on this host, so the assertion never executes. See IR-003. |
| AC-18 (health reports running state without inspecting store) | SATISFIED | `routes/health.py:65-96` | `test_api_health.py:48`, `test_api_binding.py:48` | Endpoint returns 200 with a status body; verified live returning `{'status':'ok', ...}`. |
| DAC-E1-16 (liveness, db reachability, credential bool, schema version) | SATISFIED | `models.py:22-34`; `routes/health.py:90-96` | `test_api_health.py::test_health_reachable_database` | Confirmed against a real container: `schema_version == 2` from seeded `applied_migrations`, `credential_present is True`. |
| DAC-E1-9 (credential presence is a boolean, never the value) | SATISFIED | `routes/health.py:93` calls `credential_present()`; `models.py:32` types it `bool` | `test_api_no_secrets.py:12` | Mutation-verified: injecting the key value into the response body makes the test fail. Note this covers the **response**; the **log** path is broken — IR-001. |
| DAC-E1-S6-1 (reachable db reports highest applied version) | SATISFIED | `routes/health.py:30-40` `probe_schema_version` uses `max(version)` | `test_api_health.py:14`; `test_health_schema_version.py:38-46` | Parametrised unit test covers empty (`None`) and populated (`4`) rows. |
| DAC-E1-S6-2 (unreachable db still 200, reports unreachable) | PARTIAL | `routes/health.py:46-62`, `71-83` | `test_api_health.py::test_health_unreachable_database` | Runtime behavior is **correct** (verified live: 200 with `database: 'unreachable'`, `schema_version: None`). But the test survives a mutation that removes the probe entirely, so the criterion is not protected against regression. See IR-002. |
| DAC-E1-S6-3 (`most_recent_run` present as `null`) | SATISFIED | `models.py:34`; `routes/health.py:95` | `test_api_health.py::test_health_most_recent_run_is_null:81` | Asserts key presence *and* `is None`, as the task required. |
| DAC-E1-S6-4 (factory mounts the built frontend bundle) | NOT SATISFIED | `app.py:154-155` mount; `app.py:144-152` fallback | `test_api_static_mount.py:20-35` | The mount is conditional on `_STATIC_DIR.exists()` and the directory holds only `.gitkeep`, so no bundle behavior is exercised. The test accepts `status_code in (200, 404)`, which is every outcome it can produce. See IR-004. |
| DAC-E1-S6-5 (request id in every log record for that request) | PARTIAL | `app.py:38-69`, `99-121` | `test_api_request_id.py:26` | The mechanism works and is regression-sensitive (mutation-verified). However it achieves this by a class-level patch that breaks S3's redaction — IR-001 — so the implementation as written is not acceptable. |
| DAC-E1-S6-6 (no endpoint declares an auth requirement) | SATISFIED | `app.py:162` constructs `FastAPI(lifespan=...)` with no `dependencies` | `test_api_isolation.py:18-30`; `test_api_binding.py:66-82` | `test_api_isolation.py` asserts `dependant.dependencies == []` for every route plus empty router-level dependencies — a genuinely strict check. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `api/__init__.py`, `api/routes/__init__.py`, `api/static/.gitkeep` all present | — |
| T002 | complete | PARTIAL | `models.py:22-34` | All fields match the contract, but `RunSummary = Any` (`models.py:19`) makes `most_recent_run: Any \| None` equivalent to untyped. See IR-006. |
| T003 | complete | VERIFIED | `errors.py:23-63` | Envelope has `code`/`message`/`resource`/`request_id`; handler returns 500 with no driver text. |
| T004 | complete | VERIFIED | `config/settings.py` `ApiSettings`, `credential_present`; `db/applied_migrations.py` | Both present and imported by the new code. |
| T005 | complete | VERIFIED | `tests/unit/test_api_request_id.py` | Mutation-verified: disabling the record stamp fails the test. |
| T006 | complete | PARTIAL | `tests/integration/test_api_binding.py` | Auth half is solid; the non-loopback half is conditionally skipped. See IR-003. Deviation: the test drives `uvicorn.Config(host="127.0.0.1", ...)` literally rather than `app_main` as the task specified. See IR-005. |
| T007 | complete | VERIFIED | `test_api_health.py:14-45` | Seeds versions 1 and 2, asserts `schema_version == 2` against a real container. |
| T008 | complete | PARTIAL | `test_api_health.py:48-66` | Assertions are correct but not regression-sensitive. See IR-002. |
| T009 | complete | VERIFIED | `test_api_no_secrets.py` | Mutation-verified. |
| T010 | complete | VERIFIED | `test_api_health.py:69-82` | — |
| T011 | complete | PARTIAL | `test_api_static_mount.py` | `/api` envelope half verified live; SPA half asserts nothing. See IR-004. |
| T012 | complete | VERIFIED | `test_api_isolation.py` | Stricter than T006's schema check, as the task intended. |
| T013 | complete | VERIFIED | `test_health_schema_version.py` | Both `None` and populated cases. |
| T014 | complete | VERIFIED | `test_health_database_probe.py` | Fake pool raises `psycopg.OperationalError`; asserts `False` returned. Confirmed `PoolTimeout` subclasses `psycopg.Error`, so the production `except` clause covers pool exhaustion too. |
| T015 | complete | VERIFIED | `test_api_models.py` | Asserts real JSON `bool`, not a truthy string. |
| T016 | complete | VERIFIED | `routes/health.py` | Never raises on db failure; extra guard at `71-83` correctly re-reports `unreachable` if the version query fails after a successful probe. |
| T017 | complete | VERIFIED | `app.py:158-171` | No default `dependencies`; handler and router registered. |
| T018 | complete | VERIFIED | `app.py:72-96` | Pool opened from `DatabaseSettings.pool_min`/`pool_max`, stored on `app.state`, closed in `finally`. |
| T019 | complete | VERIFIED | `app.py:124-155` | Implemented as specified; the *test* is what falls short (IR-004). |
| T020 | complete | VERIFIED | `app.py:99-121` | Correctly uses `ContextVar` with token reset in `finally` — safe under concurrency. |
| T021 | complete | VERIFIED | `app_main.py` | Reads `ApiSettings`, runs uvicorn on that host/port. |
| T022 | complete | VERIFIED | Full suite reruns below | 139 tests pass independently. |
| T023 | complete | VERIFIED | `Dockerfile:26` `migrate_main && exec python -m factorflow.app_main` | The `&&` chain is present and correct. |
| T024 | complete | PARTIAL | `errors.py:48-63`; `routes/health.py` | The HTTP-response half is genuinely satisfied. The task's stated purpose — confirming the credential/error-disclosure boundary holds — was not met for the log channel, which this story actively broke. See IR-001. |
| T025 | complete | VERIFIED | Commands rerun below | All five pass. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_api_request_id.py` / TC-COMP-345 | ADEQUATE | Asserts a log record carries the same id as the `X-Request-Id` header, plus a second test that two requests differ. Mutation (removing `record.request_id = request_id`) → FAILED, so it is regression-sensitive. | Only asserts *at least one* record carries the id, not *every* record as DAC-E1-S6-5 words it. Minor — IR-007. |
| `test_api_binding.py::test_server_binds_to_loopback_only` / TC-COMP-014 | WEAK | Binds a real uvicorn server on a free port and confirms loopback reachability. | The non-loopback rejection — the actual substance of AC-14 — is inside a conditional that does not execute when `gethostbyname` raises, which it does on this host. IR-003. |
| `test_api_binding.py::test_no_route_declares_an_authentication_dependency` / TC-COMP-346 | ADEQUATE | Checks dependency callable names for "auth" and asserts no `securitySchemes` in the generated OpenAPI. | Name-substring matching is weak in isolation, but `test_api_isolation.py` covers it strictly. |
| `test_api_health.py::test_health_reachable_database` / TC-COMP-307, 341 | ADEQUATE | Real container, real DDL, two seeded rows; asserts `max` version is reported, not merely non-null. | None. |
| `test_api_health.py::test_health_unreachable_database` / TC-COMP-342, TC-COMP-018 | WEAK | Points at `127.0.0.1:1` and asserts 200 / `unreachable` / `schema_version is None`. | Passes unchanged when `reachable = probe_database_reachable(pool)` is replaced with `reachable = True` — the `except psycopg.Error` fallback at `health.py:75-83` produces an identical body, so the probe under test can be deleted without failing. IR-002. |
| `test_api_health.py::test_health_most_recent_run_is_null` / TC-COMP-343 | ADEQUATE | Asserts key presence and `is None` separately. | Marked `postgres` but never uses `postgres_connection_string` meaningfully for its assertion; harmless. |
| `test_api_no_secrets.py` / TC-COMP-300 | ADEQUATE | Asserts the secret substring is absent from raw `response.text` and that the boolean is `True`. Mutation-verified. | Covers the response body only, not logs. |
| `test_api_static_mount.py::test_unmatched_non_api_path_falls_back_to_index` / TC-COMP-344 | WEAK | Accepts `status_code in (200, 404)` and branches its assertions accordingly. | With both outcomes accepted, no possible response fails it. DAC-E1-S6-4 is unverified. IR-004. |
| `test_api_static_mount.py::test_unmatched_api_path_returns_error_envelope` | ADEQUATE | Asserts 404 with `error.code == "not_found"`. Reproduced live. | — |
| `test_api_isolation.py` | ADEQUATE | Asserts empty router dependencies and empty per-route `dependant.dependencies`. | — |
| `test_health_schema_version.py` | ADEQUATE | Parametrised over empty/populated. Fakes are thin and do not make the result inevitable — the real `max(version)` SQL path is separately covered by the container test. | — |
| `test_health_database_probe.py` | ADEQUATE | Fake pool raises on `__enter__`, asserting the catch works rather than that a mock was called. | Single case; does not cover `PoolTimeout`, though that is a verified subclass. |
| `test_api_models.py` | ADEQUATE | `json.loads` round-trip with `is True` and `isinstance(..., bool)`. | — |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "All checks passed!" |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "57 files already formatted" |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Success: no issues found in 16 source files" |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 109 passed, 30 deselected |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 30 passed, 109 deselected. Docker confirmed available; a real `postgres:16` container start was independently timed at ~1.5s, ruling out silently-skipped container work. |

Supplementary evidence gathered (not part of the required plan):

- Live reproduction of the unreachable-database path returned `200 {'status':'ok','database':'unreachable','credential_present':False,'schema_version':None,'most_recent_run':None}`.
- Live reproduction of `/api/does-not-exist` returned the `not_found` envelope; `/coverage` returned a bare 404.
- Redaction-bypass reproduction for IR-001 (script run against the installed package, no repository file modified).
- Four mutation experiments. Each mutation was applied to a working-tree copy, run, then reverted; `md5` checksums of `src/factorflow/api/app.py` and `src/factorflow/api/routes/health.py` were confirmed identical to their pre-mutation values and `git status` confirmed clean afterwards.

### Validation Side Effects

- Before: working tree clean at `94a5bba`, no untracked files.
- After: working tree clean at `94a5bba`, no untracked files.
- Unexpected tracked-file changes: none. Mutation testing was fully reverted and verified by checksum; no validation command modified a tracked file.

## Findings

### IR-001 — The request-id patch silently disables CAP-001-E1-S3's credential redaction

- **Severity**: CRITICAL
- **Status**: OPEN
- **Acceptance criteria**: AC-13, DAC-E1-9, DAC-E1-S6-5
- **Tasks**: T020, T024
- **Files**: `src/factorflow/api/app.py:38-69` (`_install_request_id_patch`); interacts with `src/factorflow/config/settings.py:259-268` (`configure_logging`)
- **Claim challenged**: `app.py:38-57`'s docstring claims it "reuses that mechanism rather than inventing a second one", and T024 claims the credential-disclosure boundary was reviewed and holds.
- **Observed evidence**: Both functions store the original `logging.Handler.handle` under the identical sentinel `logging.Handler._unfiltered_handle`, then reassign `logging.Handler.handle`. Whichever runs second reads the *unwrapped* baseline out of the sentinel and wraps that, discarding the other's wrapper. Executed directly:

  ```
  configure_logging(); _install_request_id_patch()
  logger.info('leaking SECRETKEY123 here')
  OUTPUT: leaking SECRETKEY123 here|rid=RID-1
  REDACTED? False
  ```

  With `configure_logging()` alone the same record emits `leaking [redacted] here`. The two patches are mutually exclusive, not composable.

  Separately, `grep -rn configure_logging src tests` shows **no production call site at all** — only the definition and `tests/unit/test_redaction.py`. `app_main.py` never calls it, so the application process currently installs no redaction filter regardless of ordering.
- **Expected evidence/behavior**: `component-design-runtime-config.md:399` — "The filter is installed on every handler at process start, in both processes." AC-13 requires the credential is never logged. The redaction filter is described at `:400` as the backstop that exists precisely because `SecretStr` protects the object and not a string.
- **Impact**: In the shipped container (`Dockerfile:26` runs `factorflow.app_main`), any log record in the API process containing the provider credential or the database URL — a driver exception, a third-party library's debug output, `errors.py:57`'s `exc_info=exc` traceback — is written unredacted to the container log. This is a credential-disclosure defect, and the existing `test_redaction.py` suite cannot catch it because those tests never import `app.py`.
- **Required remediation**: Make request-id stamping and redaction compose rather than overwrite (for example, distinct sentinel attributes, or a single shared patch point that applies both transformations), and call `configure_logging()` in the API process entrypoint. Add a regression test that installs both and asserts a record carrying a secret is emitted redacted *and* carries the request id, in both installation orders.

### IR-002 — `test_health_unreachable_database` passes with the probe under test removed

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S6-2, AC-18
- **Tasks**: T008
- **Files**: `tests/integration/test_api_health.py:48-66`; `src/factorflow/api/routes/health.py:46-62`, `71-83`
- **Claim challenged**: T008 is checked complete and TC-COMP-342 is claimed green.
- **Observed evidence**: Replacing `reachable = probe_database_reachable(pool)` (`health.py:70`) with `reachable = True` leaves all three tests in `test_api_health.py` passing (`3 passed in 32.09s`), including `test_health_unreachable_database` in isolation (`1 passed`). The reason is the secondary guard at `health.py:75-83`: with `reachable` forced true, the code enters the version query, the pool raises `psycopg.Error`, and the `except` resets `reachable = False` with `schema_version = None` — byte-identical output. The mutation is invisible to the assertions.
- **Expected evidence/behavior**: Constraint 8 of the review contract and the task plan's own framing require a test that fails when a plausible regression is introduced. `probe_database_reachable` is the function TC-COMP-342 exists to protect.
- **Impact**: The dedicated reachability probe, including its deliberate 2-second health-appropriate timeout (`health.py:43`, `59`), can be deleted or broken with no test failure. The 30s-default-timeout problem that `_HEALTH_PROBE_TIMEOUT_SECONDS` was introduced to avoid would silently return.
- **Required remediation**: Strengthen the test so it distinguishes the probe path from the fallback path — for example assert the response is produced within a bound well under the pool's default timeout, or add a unit-level test asserting `get_health` reports `unreachable` when `probe_database_reachable` returns `False` while the version query is not reached. The mutation `reachable = True` must fail at least one test.

### IR-003 — The AC-14 non-loopback assertion never executes

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-14
- **Tasks**: T006
- **Files**: `tests/integration/test_api_binding.py:51-60`
- **Claim challenged**: T006 claims TC-COMP-014's "server accepts no connection on a non-loopback interface" is implemented and green.
- **Observed evidence**: The `pytest.raises((httpx.ConnectError, httpx.ConnectTimeout))` assertion is guarded by `if non_loopback_ip and non_loopback_ip != "127.0.0.1"`. `non_loopback_ip` is `None` whenever `socket.gethostbyname(socket.gethostname())` raises `gaierror`, which it does on the review host:

  ```
  hostname: Alvaros-MacBook-Pro.local
  gethostbyname: [Errno 8] nodename nor servname provided, or not known
  ```

  The test therefore reports PASS having asserted only that loopback works. It also passes on any host resolving its hostname to `127.0.0.1`.
- **Expected evidence/behavior**: AC-14 — "it binds to `127.0.0.1` only and is unreachable from any other interface." TC-COMP-014 is a P1 mandatory component test for the capability's primary network-exposure control.
- **Impact**: A regression binding the server to `0.0.0.0` would not be caught on any developer machine or CI runner with this DNS behavior. The silent skip is worse than an explicit skip because the suite reports the criterion as covered.
- **Required remediation**: Make the negative case deterministic and unconditional — bind the server and assert a connection attempt to a non-loopback address the host genuinely owns fails, enumerating interfaces directly rather than via hostname resolution; or `pytest.skip` explicitly when no non-loopback address is available so the gap is visible rather than silent. Note `ApiSettings._reject_non_loopback_host` (S3) already blocks the config path; this test's job is the socket-level guarantee.

### IR-004 — The SPA-fallback test accepts every outcome it can produce

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S6-4
- **Tasks**: T011, T019
- **Files**: `tests/integration/test_api_static_mount.py:20-35`; `src/factorflow/api/app.py:144-155`
- **Claim challenged**: T011 claims TC-COMP-344 ("the factory mounts the built frontend bundle") is implemented and green.
- **Observed evidence**: The test asserts `response.status_code in (200, 404)`, then branches. Since `_STATIC_DIR` contains only `.gitkeep`, `index.html` never exists, so `app.py:152` returns a bare `Response(status_code=404)` — confirmed live: `/coverage -> 404, content-type None`. The 404 branch's only assertion is that the content-type does not start with `application/json`, which a bodiless 404 satisfies trivially. No mount behavior is asserted in either branch.
- **Expected evidence/behavior**: DAC-E1-S6-4 requires the factory to mount the bundle from the static directory. TC-COMP-344 is P1.
- **Impact**: Removing the `app.mount(...)` call at `app.py:155` entirely would not fail this test. The SPA fallback that the owner web app (CAP-001-E1-S4/S5) depends on for client-side routing is unverified.
- **Required remediation**: Give the test a controlled static directory containing a fixture `index.html` (a `tmp_path` monkeypatched over `_STATIC_DIR`, or a fixture bundle) and assert unconditionally that an unmatched non-API path returns 200 with that content. Removing the mount must fail the test.

### IR-005 — `test_api_binding.py` bypasses `app_main`, so the settings-to-socket path is untested

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-14
- **Tasks**: T006
- **Files**: `tests/integration/test_api_binding.py:29-49`; `src/factorflow/app_main.py:16-18`
- **Claim challenged**: T006 specifies "start the app via `app_main` with the default `FACTORFLOW_API_HOST`".
- **Observed evidence**: The test builds `uvicorn.Config(app, host="127.0.0.1", port=port, ...)` with the host string hardcoded. It deletes `FACTORFLOW_API_HOST` (line 32) and sets `FACTORFLOW_API_PORT` (line 33), but neither is read — `app_main.main()` is never called, and `ApiSettings` is never constructed in this test. The test would still pass if `app_main.py:18` passed `host="0.0.0.0"`.
- **Expected evidence/behavior**: The task plan's stated approach, and the fact that `app_main.py` is the only module in the story that turns configuration into a bound socket.
- **Impact**: The one line of production code that decides the real bind address is not covered by any test. Combined with IR-003, no test constrains the deployed bind host.
- **Required remediation**: Drive the server through `app_main`'s settings path (or assert `ApiSettings().host` is what is handed to `uvicorn.Config`) so a change to `app_main.py`'s host argument fails a test.

### IR-006 — `RunSummary = Any` defeats the typing the task asked for

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S6-3
- **Tasks**: T002
- **Files**: `src/factorflow/api/models.py:19`, `:34`
- **Claim challenged**: T002 asks for `most_recent_run: RunSummary | None` with `RunSummary` as "a placeholder type alias or `None`-only field".
- **Observed evidence**: `RunSummary = Any`, so `most_recent_run: Any | None` collapses to `Any` — the annotation permits any value, and `mypy --strict` will not flag a future assignment of a wrong shape. The story's own text (`CAP-001-E1-S6.md:73`) and the task Notes call for the field to be `null` until CAP-001-E7-S3 populates it.
- **Expected evidence/behavior**: The task explicitly offered a `None`-only field as the alternative, which would express the current contract exactly and force CAP-001-E7-S3 to widen the type deliberately.
- **Impact**: `mypy` gives no protection on this field, and the "typed loosely" handoff the Notes promise to CAP-001-E7-S3 is in practice untyped. `test_api_models.py` only ever constructs it as `None`.
- **Required remediation**: Type the field `None` for now (or a minimal placeholder model), so widening it in CAP-001-E7-S3 is an explicit, reviewable change.

### IR-007 — TC-COMP-345 asserts "at least one" record, not "every" record

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S6-5
- **Tasks**: T005
- **Files**: `tests/unit/test_api_request_id.py:36-43`
- **Claim challenged**: T005 asks to "assert every record carries the same request id as a structured field".
- **Observed evidence**: The test filters `caplog.records` down to those whose `request_id` matches, then asserts the filtered list is non-empty. A record emitted during the request *without* the id would be filtered out rather than failing the assertion. `caplog.at_level` is also scoped to the single logger `factorflow.api.routes.health`, so records from any other module during the request are not examined.
- **Expected evidence/behavior**: DAC-E1-S6-5 — "includes it in **every** log record for that request."
- **Impact**: A code path emitting an unstamped record (for instance from a handler installed before the patch, the exact class of bug behind IR-001) would not be detected.
- **Required remediation**: Assert that every record captured during the request carries the id, and widen capture beyond the single health logger.

### IR-008 — `pytest-asyncio` added but unused

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T017, T021 (dependency changes)
- **Files**: `pyproject.toml` dev extras
- **Claim challenged**: Dependency additions should be justified by the story.
- **Observed evidence**: `pytest-asyncio` is added to the dev extras and loads at session start (visible in pytest's plugin banner: `asyncio: mode=Mode.STRICT`), but no test added by this story is `async def`. `httpx` by contrast is genuinely used (`test_api_binding.py:11`).
- **Expected evidence/behavior**: Constraint 7 — every change justified by the story or task plan. Neither T017 nor T021 calls for async test support.
- **Impact**: Minor supply-surface and maintenance cost; no functional risk.
- **Required remediation**: Remove it, or add a brief note recording which upcoming story needs it.

### IR-009 — Health route logs a field the configured formatter cannot render

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T016
- **Files**: `src/factorflow/api/routes/health.py:85-88`
- **Claim challenged**: Structured-logging consistency with SA-LOG-001's usage elsewhere in the component.
- **Observed evidence**: `_LOGGER.info("health check completed", extra={"database": ...})` attaches a `database` field. No formatter in the component renders arbitrary `extra` fields, so the value is carried on the record but never emitted. This is benign in isolation, but it is the same `extra`-based pattern whose visibility IR-001 makes unreliable.
- **Expected evidence/behavior**: Log fields the component intends to be operationally visible should be reachable through the configured handler.
- **Impact**: An operator grepping the container log for health-check outcomes finds only the bare message.
- **Required remediation**: Either include the field in the message text or adopt a formatter that renders structured fields; no change required if the field is intentionally record-only.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **`Dockerfile` modified without a dedicated task.** Justified. The pre-existing comment explicitly deferred the CMD to "whichever story adds the FastAPI app", and T021/T023 own the entrypoint. The new CMD correctly preserves the `migrate_main && exec ...` chain that AC-16 depends on.
- **Task-plan branch header is stale.** `CAP-001-E1-S6-tasks.md:33` names `usr/alvaro-de-jodra/CAP-001-epics`; the work was done on `usr/alvaro-de-jodra/CAP-001-E1-S6`. Bookkeeping only; the actual branch follows the `usr/<name>/` convention in `AGENTS.md`.
- **Tasks file `status` remains `draft`** (`CAP-001-E1-S6-tasks.md:6`) while all 25 boxes are checked, and its `updated` date is `2026-09-06` despite the 2026-09-07 commit. Bookkeeping inconsistency.
- **T006 path deviation** — implemented without `app_main`; recorded as IR-005.
- **No task plan authorized `pytest-asyncio`** — recorded as IR-008.
- **All 25 task boxes are checked**, but T002, T006, T008, T011 and T024 are assessed PARTIAL on the evidence above. The checkmarks overstate completion.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Resolve IR-001 first — it is a credential-disclosure defect in the shipped container path and needs both the patch-composition fix and a `configure_logging()` call in the API process, with a regression test covering both installation orders. Then restore regression sensitivity to the three weak mandatory tests (IR-002, IR-003, IR-004); each must fail under the specific mutation named in its finding. Address IR-005 through IR-009 as scoped. Do not mark the tasks file complete until the PARTIAL tasks have supporting evidence. Rerun `$adversarial-review` afterwards.
- **Warnings accepted downstream**: N/A — verdict is CHANGES-REQUIRED.
