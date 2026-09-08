---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S6-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-08
updated: 2026-09-08
story_id: "CAP-001-E1-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-08T03:01:56Z"
reviewed_head: "f6cdb8996c9703a4ae3c4227c7b5d7bacfad529e"
review_base: "d0b01577741e58cdc2968cb88e08f943e09892d7"
reviewed_state_revision: "sha256:3b24d545875e0cb46690547ab1907339c477ba44cdc481578949a9a139967d52"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-09-08T03:01:56Z
  source_artifacts:
    - id: CAP-001-E1-S6
      version: "1"
    - id: CAP-001-E1-S6-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S6 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 25/25 verified |
| Required validation | 5/5 passed |

This is a rework review. All nine findings from v1 (IR-001 through IR-009) were independently re-verified against the current repository, and all nine are **RESOLVED**. Critically, the three v1 findings whose substance was "the test cannot fail" (IR-002, IR-004, IR-005) were each re-tested by re-applying the exact mutation the v1 finding named: every one now fails the suite. The v1 CRITICAL (IR-001) was verified by direct execution in both installation orders and by re-introducing the shared-sentinel bug, which now fails two dedicated regression tests.

The commit message's self-reported validation result ("144 passed; ruff, ruff format, mypy clean") was **independently reproduced and is accurate** — 114 non-postgres + 30 postgres-marked, with Docker confirmed available so the container-backed cases genuinely ran. The v1 report's caution about a self-reported green suite does not repeat here.

Three new MEDIUM/LOW findings are recorded. None blocks the gate. The most substantive, IR-201, is that the `configure_logging()` call site added to the lifespan — the second half of IR-001's required remediation — is itself covered by no test: deleting that line leaves the full suite green. The production code is correct and AC-13 holds in the shipped container path; what is missing is regression protection for the call site, which matters because a silently-absent redaction install is precisely the failure mode v1 caught.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S6` |
| HEAD | `f6cdb8996c9703a4ae3c4227c7b5d7bacfad529e` |
| Remote | `origin/usr/alvaro-de-jodra/CAP-001-E1-S6` at the same SHA — pushed, no divergence |
| Review base | `origin/main` merge-base `d0b01577741e58cdc2968cb88e08f943e09892d7` |
| Working tree | clean — no staged, unstaged, or untracked files, before and after all validation |
| Commits on branch | 3 (`94a5bba` original, `1fa8b49` v1 report, `f6cdb89` rework) |
| Changed files reviewed | 25 across the full base..HEAD range |

### Change Set

The complete `base..HEAD` set is 25 files (1597 insertions, 43 deletions). The rework commit `f6cdb89` touches 13 of them.

| File | State | Rework delta | Story/Task Justification |
|------|-------|--------------|--------------------------|
| `src/factorflow/api/__init__.py` | added | — | T001 |
| `src/factorflow/api/routes/__init__.py` | added | — | T001 |
| `src/factorflow/api/static/.gitkeep` | added | — | T001 |
| `src/factorflow/api/models.py` | added | modified | T002; IR-006 fix |
| `src/factorflow/api/errors.py` | added | — | T003 |
| `src/factorflow/api/routes/health.py` | added | modified | T016; IR-009 fix |
| `src/factorflow/api/app.py` | added | modified | T017–T020; IR-001 fix |
| `src/factorflow/app_main.py` | added | modified | T021; IR-005 fix (`build_server`) |
| `tests/unit/test_api_request_id.py` | added | modified | T005 (TC-COMP-345); IR-007 fix |
| `tests/unit/test_api_request_id_redaction_composition.py` | added | **new in rework** | IR-001 regression test |
| `tests/unit/test_health_route_unreachable.py` | added | **new in rework** | IR-002 regression test |
| `tests/integration/test_api_binding.py` | added | modified | T006 (TC-COMP-014, 346); IR-003, IR-005 fixes |
| `tests/integration/test_api_health.py` | added | — | T007, T008, T010 |
| `tests/integration/test_api_static_mount.py` | added | modified | T011 (TC-COMP-344); IR-004 fix |
| `tests/unit/test_api_no_secrets.py` | added | — | T009 (TC-COMP-300) |
| `tests/unit/test_api_isolation.py` | added | — | T012 |
| `tests/unit/test_health_schema_version.py` | added | — | T013 |
| `tests/unit/test_health_database_probe.py` | added | — | T014 |
| `tests/unit/test_api_models.py` | added | — | T015 |
| `pyproject.toml` | modified | modified | IR-008 — `pytest-asyncio` removed |
| `uv.lock` | modified | modified | Lockfile for the above |
| `Dockerfile` | modified | — | T021/T023 |
| `.../CAP-001-E1-S6-tasks.md` | modified | modified | Bookkeeping corrections |
| `.../CAP-001-E1-S6.md` | modified | modified | `updated` date |
| `.../CAP-001-E1-S6-implementation-review-v1.md` | added | — | v1 gate report (committed, unmodified by the rework — verified) |

No unjustified files. Every rework edit maps to a named v1 finding or to bookkeeping the v1 report explicitly called out.

## Previous Review Disposition

Every finding from `CAP-001-E1-S6-implementation-review-v1.md` is dispositioned below. No finding is called resolved without current repository evidence gathered in this review.

| v1 Finding | Severity | Disposition | Independent Verification |
|------------|----------|-------------|--------------------------|
| IR-001 — request-id patch disables S3 credential redaction | CRITICAL | **RESOLVED** (with residual test gap → IR-201) | See below |
| IR-002 — `test_health_unreachable_database` passes with the probe removed | HIGH | **RESOLVED** | Mutation re-applied; now fails |
| IR-003 — AC-14 non-loopback assertion never executes | HIGH | **RESOLVED** | Assertion now executes on this host |
| IR-004 — SPA-fallback test accepts every outcome | HIGH | **RESOLVED** | Mutation re-applied; now fails |
| IR-005 — binding test bypasses `app_main` | MEDIUM | **RESOLVED** | Mutation re-applied; now fails |
| IR-006 — `RunSummary = Any` defeats typing | MEDIUM | **RESOLVED** | Field typed `None` exactly |
| IR-007 — TC-COMP-345 asserts "at least one" record | MEDIUM | **RESOLVED** (weaker than intended → IR-202) | Assertion shape corrected |
| IR-008 — `pytest-asyncio` added but unused | LOW | **RESOLVED** | Removed from `pyproject.toml` and `uv.lock` |
| IR-009 — health logs a field the formatter cannot render | LOW | **RESOLVED** | Folded into message text |

### IR-001 — verification detail

The fix gives the request-id patch its own sentinel (`app.py:71-74`, `_request_id_unstamped_handle`) and wraps whatever `logging.Handler.handle` currently is, rather than reaching past the other patch to the pristine original.

Verified by direct execution against the installed package (no repository file modified):

```
A: configure_logging() then _install_request_id_patch()
   -> "leaking [redacted] here|rid=RID-1"   redacted=True  stamped=True
B: _install_request_id_patch() then configure_logging()
   -> "leaking [redacted] here|rid=RID-1"   redacted=True  stamped=True
```

Both orders now compose. Under v1's code, order A emitted `leaking SECRETKEY123 here` — the credential verbatim.

Verified by mutation: reverting `app.py` to the shared `_unfiltered_handle` sentinel makes both tests in `tests/unit/test_api_request_id_redaction_composition.py` fail (`2 failed, 2 passed`). The regression test is genuinely sensitive to the exact defect.

The second half of the remediation — "call `configure_logging()` in the API process entrypoint" — is present at `app.py:101`, inside `_lifespan`, ahead of `_install_request_id_patch()`. `grep -rn configure_logging src tests` confirms this is now the only production call site, where v1 found none. AC-13's redaction is therefore installed in the shipped container path (`Dockerfile:26` → `factorflow.app_main` → `create_app()` → lifespan).

The residual gap is that this call site has no test: see IR-201.

### IR-002 — verification detail

Re-applied the exact mutation the v1 finding named — replacing `reachable = probe_database_reachable(pool)` with `reachable = True` in `health.py:70`:

```
uv run pytest tests/unit/test_health_route_unreachable.py tests/integration/test_api_health.py -q
FAILED tests/unit/test_health_route_unreachable.py::test_get_health_reports_unreachable_without_touching_the_version_query
1 failed, 3 passed
```

Under v1 this mutation left all tests passing. The new unit test isolates `get_health` and supplies a pool whose connection raises `AssertionError` if the version-query path is ever entered, so bypassing the probe is now detected. `md5` of `health.py` confirmed identical to its pre-mutation value after restore.

### IR-003 — verification detail

`tests/integration/test_api_binding.py:29-49` replaces `socket.gethostbyname(socket.gethostname())` with `socket.getaddrinfo(..., family=socket.AF_INET)`, and adds an explicit `pytest.skip` when no non-loopback IPv4 address exists.

On this review host — the same host where v1 recorded `gethostbyname` raising `gaierror` — `getaddrinfo` now resolves successfully:

```
hostname: Alvaros-MacBook-Pro.local
getaddrinfo -> [('127.0.0.1', 0), ('192.168.1.122', 0)]
```

So `_find_non_loopback_ipv4()` returns `192.168.1.122` and the `pytest.raises((httpx.ConnectError, httpx.ConnectTimeout))` assertion at line 84-85 **executes** rather than being silently bypassed. The full non-postgres run reports `114 passed` with no skip, confirming the AC-14 negative case ran. Where a host genuinely has no non-loopback interface, the gap is now an explicit skip rather than a silent pass, which is what the v1 remediation asked for.

### IR-004 — verification detail

Re-applied the mutation the v1 finding named — deleting the `app.mount(...)` call at `app.py:175-176`:

```
uv run pytest tests/integration/test_api_static_mount.py -q
FAILED tests/integration/test_api_static_mount.py::test_static_mount_serves_a_bundle_asset_by_exact_path
1 failed, 3 passed
```

The new `client_with_bundle` fixture monkeypatches `_STATIC_DIR` to a `tmp_path` holding a real `index.html` plus a nested `assets/app.js`. The nested asset is the correct discriminator: `not_found_handler` only ever reads `index.html`, so serving `assets/app.js` by exact path can only come from the mount. `test_unmatched_non_api_path_falls_back_to_index` now asserts `200` and the fixture content unconditionally, replacing v1's `status_code in (200, 404)`.

### IR-005 — verification detail

`app_main.build_server()` (`app_main.py:16-30`) now constructs the `uvicorn.Config` from `ApiSettings().host`, and `test_api_binding.py:70` drives it. Re-applied the mutation implied by the finding — changing `host=settings.host` to `host="0.0.0.0"`:

```
uv run pytest tests/integration/test_api_binding.py -q
FAILED tests/integration/test_api_binding.py::test_server_binds_to_loopback_only
1 failed, 1 passed
```

The one line of production code that decides the real bind address is now covered.

### IR-006 — verification detail

`models.py:36` is now `most_recent_run: None = None`, and the `RunSummary = Any` alias is gone. `uv run mypy src` passes under `strict = true`. The docstring at `models.py:21-29` records why, and the field remains present and serialized as `null` (`test_api_models.py:21`, `test_api_health.py::test_health_most_recent_run_is_null`), so DAC-E1-S6-3 is unaffected.

### IR-007 — verification detail

`test_api_request_id.py:39-59` now captures at root via `caplog.at_level(logging.INFO)` without a logger argument, and asserts **every** `factorflow.api.*` record carries the request id, replacing v1's "filter then assert non-empty". The exclusion of non-`factorflow.api` records is documented at lines 47-53 and is defensible: `psycopg_pool`'s background connection-retry worker runs on its own thread outside the request's `ContextVar` scope and legitimately carries no id.

The assertion shape is correct. Its strength in practice is limited by which records happen to exist during a health request — see IR-202.

### IR-008 / IR-009 — verification detail

`pytest-asyncio` no longer appears in `pyproject.toml` or `uv.lock` (`grep -rn asyncio pyproject.toml uv.lock` returns nothing). `health.py:88` now emits `"health check completed: database=%s"` with the value interpolated into the message text rather than attached as an unrendered `extra` field; observed live in the mutation run output.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-14 (loopback-only bind) | SATISFIED | `app_main.py:26-30` `build_server` reads `ApiSettings().host`; `config/settings.py` `_reject_non_loopback_host` | `test_api_binding.py:52-88` | Both halves now execute on this host. Mutation `host="0.0.0.0"` fails the test. Upgraded from PARTIAL in v1. |
| AC-18 (health reports running state without inspecting store) | SATISFIED | `routes/health.py:65-96` | `test_api_health.py`, `test_health_route_unreachable.py` | Unchanged from v1's SATISFIED, now additionally protected by the IR-002 regression test. |
| DAC-E1-16 (liveness, db reachability, credential bool, schema version) | SATISFIED | `models.py:32-36`; `routes/health.py:90-96` | `test_api_health.py::test_health_reachable_database` (postgres-marked, 30 passed) | Container-backed; asserts `max` version. |
| DAC-E1-9 (credential presence is a boolean, never the value) | SATISFIED | `routes/health.py:93`; `models.py:34` | `test_api_no_secrets.py:21-23` | Response path unchanged and mutation-verified in v1. The **log** path, broken in v1, is now correct and covered by `test_api_request_id_redaction_composition.py`. |
| DAC-E1-S6-1 (reachable db reports highest applied version) | SATISFIED | `routes/health.py:30-40` | `test_api_health.py`; `test_health_schema_version.py` | Unchanged. |
| DAC-E1-S6-2 (unreachable db still 200, reports unreachable) | SATISFIED | `routes/health.py:46-83` | `test_health_route_unreachable.py` + `test_api_health.py::test_health_unreachable_database` | Upgraded from PARTIAL. The `reachable = True` mutation now fails. |
| DAC-E1-S6-3 (`most_recent_run` present as `null`) | SATISFIED | `models.py:36` typed `None` | `test_api_health.py::test_health_most_recent_run_is_null`; `test_api_models.py:21` | Typing tightened per IR-006 without changing the wire contract. |
| DAC-E1-S6-4 (factory mounts the built frontend bundle) | SATISFIED | `app.py:145-176` | `test_api_static_mount.py:52-75` | Upgraded from NOT SATISFIED. Removing `app.mount(...)` now fails. |
| DAC-E1-S6-5 (request id in every log record for that request) | SATISFIED | `app.py:39-82`, `119-142` | `test_api_request_id.py`; `test_api_request_id_redaction_composition.py` | Upgraded from PARTIAL. The mechanism no longer breaks redaction, and composes in both install orders. |
| DAC-E1-S6-6 (no endpoint declares an auth requirement) | SATISFIED | `app.py:183` `FastAPI(lifespan=...)` with no `dependencies` | `test_api_isolation.py:18-30`; `test_api_binding.py:91-107` | Unchanged. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `api/__init__.py`, `api/routes/__init__.py`, `api/static/.gitkeep` | — |
| T002 | complete | VERIFIED | `models.py:32-36` | Upgraded from PARTIAL — `RunSummary = Any` removed (IR-006). |
| T003 | complete | VERIFIED | `errors.py:23-63` | — |
| T004 | complete | VERIFIED | `config/settings.py`, `db/applied_migrations.py` present and imported | — |
| T005 | complete | VERIFIED | `tests/unit/test_api_request_id.py` | Strengthened per IR-007. |
| T006 | complete | VERIFIED | `tests/integration/test_api_binding.py` | Upgraded from PARTIAL — non-loopback half executes (IR-003); drives `app_main.build_server` (IR-005). |
| T007 | complete | VERIFIED | `test_api_health.py:14-45` | Container-backed. |
| T008 | complete | VERIFIED | `test_api_health.py:48-66` + `test_health_route_unreachable.py` | Upgraded from PARTIAL — mutation-sensitive (IR-002). |
| T009 | complete | VERIFIED | `test_api_no_secrets.py` | — |
| T010 | complete | VERIFIED | `test_api_health.py:69-82` | — |
| T011 | complete | VERIFIED | `test_api_static_mount.py` | Upgraded from PARTIAL — fixture bundle + nested asset (IR-004). |
| T012 | complete | VERIFIED | `test_api_isolation.py` | — |
| T013 | complete | VERIFIED | `test_health_schema_version.py` | — |
| T014 | complete | VERIFIED | `test_health_database_probe.py` | — |
| T015 | complete | VERIFIED | `test_api_models.py` | — |
| T016 | complete | VERIFIED | `routes/health.py` | IR-009 message-text change applied. |
| T017 | complete | VERIFIED | `app.py:179-192` | No default `dependencies`. |
| T018 | complete | VERIFIED | `app.py:85-116` | Pool sized from `DatabaseSettings`, closed in `finally`. |
| T019 | complete | VERIFIED | `app.py:145-176` | Now genuinely test-covered. |
| T020 | complete | VERIFIED | `app.py:39-82`, `119-142` | `ContextVar` with token reset in `finally`; distinct sentinel (IR-001). |
| T021 | complete | VERIFIED | `app_main.py:13-38` | `build_server()` added for the settings-to-socket path. |
| T022 | complete | VERIFIED | Full suite rerun below | 144 tests pass independently. |
| T023 | complete | VERIFIED | `Dockerfile:26` `migrate_main && exec python -m factorflow.app_main` | Chain present and correct. |
| T024 | complete | VERIFIED | `errors.py:48-63`; `routes/health.py`; `app.py:101` | Upgraded from PARTIAL — the log channel this task's purpose covers is now redacted, which was the v1 defect. |
| T025 | complete | VERIFIED | Commands rerun below | All five pass. |

All 25 tasks VERIFIED; no PARTIAL or NOT IMPLEMENTED remain. The task file's checked boxes are now consistent with the evidence, which they were not in v1.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_api_request_id_redaction_composition.py` (new) | ADEQUATE | Installs both patches in both orders, asserts a secret-bearing record is emitted redacted *and* carrying the id. Autouse fixture clears both sentinels around each test so the process-global patch state does not leak between tests. Mutation (revert to shared sentinel) → 2 FAILED. | Covers the two functions called directly, not the lifespan call site — IR-201. |
| `test_health_route_unreachable.py` (new) / IR-002 regression | ADEQUATE | Isolates `get_health` with a pool that raises `AssertionError` if the version query is reached, plus `assert_called_once_with(pool)`. Mutation (`reachable = True`) → FAILED. | — |
| `test_api_request_id.py` / TC-COMP-345 | ADEQUATE | Captures at root; requires every `factorflow.api.*` record to carry the id; second test asserts two requests differ. | Only one `factorflow.api.*` record exists during a health request, so the "every" quantifier is not exercised against a multi-record path — IR-202. |
| `test_api_binding.py::test_server_binds_to_loopback_only` / TC-COMP-014 | ADEQUATE | Drives `app_main.build_server(port=...)`, asserts loopback reachable and the host's real non-loopback IPv4 refused. Mutation (`host="0.0.0.0"`) → FAILED. Explicit skip when no non-loopback interface exists. | Upgraded from WEAK. |
| `test_api_binding.py::test_no_route_declares_an_authentication_dependency` / TC-COMP-346 | ADEQUATE | Dependency-name check plus absence of `securitySchemes`. | Name-substring matching is weak alone; `test_api_isolation.py` covers it strictly. Unchanged from v1. |
| `test_api_health.py::test_health_reachable_database` / TC-COMP-307, 341 | ADEQUATE | Real container, seeded rows, asserts `max` version. | — |
| `test_api_health.py::test_health_unreachable_database` / TC-COMP-342, 018 | ADEQUATE | HTTP-level 200/`unreachable`/`schema_version is None`. | Still survives the `reachable = True` mutation on its own; the new unit test is what supplies the sensitivity. Acceptable — the pair together covers the criterion. |
| `test_api_health.py::test_health_most_recent_run_is_null` / TC-COMP-343 | ADEQUATE | Key presence and `is None` separately. | — |
| `test_api_no_secrets.py` / TC-COMP-300 | ADEQUATE | Secret substring absent from raw `response.text`; boolean is `True`. | — |
| `test_api_static_mount.py::test_static_mount_serves_a_bundle_asset_by_exact_path` / TC-COMP-344 | ADEQUATE | Fixture bundle with a nested asset only the mount can serve. Mutation (remove mount) → FAILED. | Upgraded from WEAK. |
| `test_api_static_mount.py::test_unmatched_non_api_path_falls_back_to_index` | ADEQUATE | Unconditional 200 + `text/html` + fixture content. | Upgraded from WEAK. |
| `test_api_static_mount.py::test_no_bundle_yet_falls_back_to_a_bare_404` | ADEQUATE | Confirms the no-bundle case degrades to a plain 404, never the `not_found` envelope. | — |
| `test_api_static_mount.py::test_unmatched_api_path_returns_error_envelope` | ADEQUATE | 404 with `error.code == "not_found"` and a `request_id`. | — |
| `test_api_isolation.py` | ADEQUATE | Empty router dependencies and empty per-route `dependant.dependencies`. | — |
| `test_health_schema_version.py` | ADEQUATE | Parametrised over empty/populated. | — |
| `test_health_database_probe.py` | ADEQUATE | Fake pool raises on `__enter__`; asserts the catch works. | Single case. Unchanged from v1. |
| `test_api_models.py` | ADEQUATE | JSON round-trip, `is True`, `isinstance(..., bool)`, `most_recent_run is None`. | — |

All nine mandatory TC-IDs (TC-COMP-014, 018, 300, 307, 341–346) are implemented and ADEQUATE. No WEAK or MISSING mandatory test remains.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "All checks passed!" |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "59 files already formatted" |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Success: no issues found in 16 source files" (`strict = true`) |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 114 passed, 30 deselected, 0 skipped |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 30 passed, 114 deselected. `docker info` confirmed available, so container-backed cases genuinely ran. |

Combined: 144 tests pass, matching the rework commit's claim exactly. The commit message's validation claim was verified, not accepted.

Mutation and reproduction experiments performed independently (each applied to a working-tree copy, run, then reverted, with `md5` checksums confirmed identical to pre-mutation values and `git status` confirmed clean afterwards):

| Experiment | Target | Result |
|------------|--------|--------|
| Revert request-id patch to shared `_unfiltered_handle` sentinel | `app.py` | 2 FAILED — IR-001 protected |
| Delete `configure_logging()` from `_lifespan` | `app.py` | 114 passed — **no test fails**, see IR-201 |
| `reachable = True` | `health.py` | 1 FAILED — IR-002 protected |
| Remove `app.mount(...)` | `app.py` | 1 FAILED — IR-004 protected |
| `host="0.0.0.0"` | `app_main.py` | 1 FAILED — IR-005 protected |
| Stamp only `factorflow.api.routes.health` records | `app.py` | 2 passed — see IR-202 |
| Direct execution of both patch orders | installed package, no file modified | Both redacted and stamped — IR-001 confirmed fixed |
| `getaddrinfo` resolution on the review host | no file modified | Returns `192.168.1.122` — IR-003 assertion executes |

### Validation Side Effects

- Before: working tree clean at `f6cdb89`, no untracked files.
- After: working tree clean at `f6cdb89`, no untracked files.
- Unexpected tracked-file changes: none. All mutation experiments were reverted from pre-mutation copies and verified by `md5` checksum (`src/factorflow/api/app.py` → `c80c845bdb6374791bfd5fb29d1d65a3`, `src/factorflow/api/routes/health.py` → `262f7f3773f751c11f99b92cb5c2b665`, both matching their pre-mutation values). No validation command modified a tracked file. Scratch scripts were written outside the repository.

## Findings

### IR-201 — The `configure_logging()` call site added for IR-001 is itself untested

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-13, DAC-E1-9 (regression protection only; both are currently SATISFIED)
- **Tasks**: T020, T024
- **Files**: `src/factorflow/api/app.py:101`; `tests/unit/test_api_request_id_redaction_composition.py`
- **Claim challenged**: The rework commit states it "calls `configure_logging()` in the API process's lifespan for the first time" and that the added test asserts the composition. Both are true, but the commit implies IR-001's remediation is fully covered.
- **Observed evidence**: Deleting the `configure_logging()` line from `_lifespan` leaves the entire suite green:

  ```
  uv run pytest -m 'not postgres' -q
  114 passed, 30 deselected
  ```

  The new composition test calls `settings_module.configure_logging()` and `app_module._install_request_id_patch()` directly (lines 68-69, 82-83); it never constructs the app or enters its lifespan, so it cannot observe whether the application actually installs redaction at startup. `grep -rn configure_logging src tests` confirms `app.py:101` is the only production call site, and no test references it. `ruff` flags the resulting unused import, but that is an incidental lint signal, not a behavioral guarantee — an implementation that kept the import for another purpose would remove even that.
- **Expected evidence/behavior**: `component-design-runtime-config.md:399` — "The filter is installed on every handler at process start, in both processes." v1's IR-001 remediation asked for "a regression test that installs both and asserts a record carrying a secret is emitted redacted *and* carries the request id" — satisfied — but the defect v1 actually found in the field was that `configure_logging()` had **no call site at all**, and that half remains unprotected.
- **Impact**: Regression risk only; the current shipped path is correct. A future refactor of `_lifespan` that drops or reorders the call would silently restore v1's condition — an API process with no credential redaction — and no test would fail. This is the same silent-absence failure mode v1 caught, so it is worth closing.
- **Required remediation**: Add a test that drives the app through its lifespan (e.g. `with TestClient(create_app()):`) with a secret set, emits a record carrying that secret from within a request, and asserts it is redacted. Deleting `configure_logging()` from `_lifespan` must fail that test.

### IR-202 — TC-COMP-345's "every record" quantifier is not exercised against a multi-record path

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S6-5 (currently SATISFIED)
- **Tasks**: T005
- **Files**: `tests/unit/test_api_request_id.py:54-59`; `src/factorflow/api/app.py:76-80`
- **Claim challenged**: The rework commit states the test now "requires every one to carry the id", resolving IR-007. The assertion shape is indeed correct; its discriminating power is not.
- **Observed evidence**: Mutating the stamping condition at `app.py:78` to apply only to records whose `name` is `"factorflow.api.routes.health"` leaves the test passing (`2 passed`). During a `GET /api/health` request the only `factorflow.api.*` record emitted is the one from `routes.health` (`health.py:88`), so the filtered list has exactly one element and a per-record quantifier over it cannot distinguish "every record" from "this record".
- **Expected evidence/behavior**: DAC-E1-S6-5 — "middleware generates a request id and includes it in every log record for that request." v1's IR-007 remediation asked to "assert that every record captured during the request carries the id, and widen capture beyond the single health logger." The capture was widened; the exercised surface was not.
- **Impact**: A regression that stamps only some records would go undetected as long as the health route's own record is among the stamped ones. Lower risk than v1's version, since the assertion would now catch an unstamped record if the request emitted one, but the test does not prove it would.
- **Required remediation**: Have the test provoke at least one additional `factorflow.api.*` record during the request from a module other than `routes.health` (a temporary logger emitted from a test-only route, or asserting against the error path where `errors.py` also logs), so the quantifier has more than one record to range over.

### IR-203 — A repeat `configure_logging()` call after the request-id patch silently drops stamping

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (latent; not reachable in current code)
- **Tasks**: T020
- **Files**: `src/factorflow/api/app.py:71-82`; `src/factorflow/config/settings.py:259-268`
- **Claim challenged**: `app.py:39-69`'s docstring states the two patches "compose regardless of order". They compose for the two orderings the tests cover, but not for every sequence.
- **Observed evidence**: `configure_logging()` is documented as idempotent and re-seeds its secret list on each call, always rebuilding from the pristine `_unfiltered_handle` baseline. So the sequence `configure_logging(); _install_request_id_patch(); configure_logging()` discards the request-id wrapper. Executed directly:

  ```
  C: configure, reqid, configure again
     -> "leaking [redacted] here|rid=None"   redacted=True  stamped=False
  ```

  This is the mirror image of v1's IR-001 (redaction lost) rather than a repeat of it — the credential stays redacted, so there is no disclosure risk. It is not currently reachable: `_lifespan` always calls the two together in that order, and two successive lifespan startups were verified to stamp correctly (`startup 1: RID-1`, `startup 2: RID-2`), because the request-id patch re-runs after each `configure_logging()`.
- **Expected evidence/behavior**: The asymmetry is that `_install_request_id_patch` was taught to wrap the current `handle`, while `configure_logging` still reaches past whatever is installed. A patch that composes in one direction only is fragile in the way v1's finding was.
- **Impact**: None today. A future caller that re-seeds logging secrets without re-running the request-id patch — for instance a settings-reload path — would silently lose request-id stamping, and IR-202's test would not catch it.
- **Required remediation**: Optional, and arguably CAP-001-E1-S3's to own rather than this story's. Either have `configure_logging` wrap the current `Handler.handle` symmetrically, or note the ordering requirement at both call sites so a future reload path re-runs both.

## Scope and Plan Deviations

- **`Dockerfile` modified without a dedicated task.** Justified, unchanged from v1's assessment. The pre-existing comment deferred the CMD to "whichever story adds the FastAPI app"; T021/T023 own the entrypoint, and the `migrate_main && exec ...` chain AC-16 depends on is preserved.
- **`app_main.build_server()` added beyond T021's literal wording.** Justified — introduced specifically to satisfy v1's IR-005, which required the settings-to-socket path be testable. The function is minimal and `main()` delegates to it, so no behavior changed.
- **v1 bookkeeping deviations all corrected.** The tasks file `status` is now `in-progress` (was `draft` with all boxes checked), its branch header now reads `usr/alvaro-de-jodra/CAP-001-E1-S6` (was the stale `CAP-001-epics`), `updated` dates are current, and `last_reworked_review` records the v1 report. The v1 report file itself was not modified by the rework — verified by diff.
- **All 25 task boxes checked, and the evidence now supports all 25.** The overstatement v1 recorded is resolved.
- **No scope leakage in the rework.** All 13 files touched by `f6cdb89` map to a named v1 finding or to bookkeeping v1 called out. `pytest-asyncio` was removed rather than justified, closing IR-008.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to `$doc-sync` for CAP-001-E1-S6. The three MEDIUM/LOW findings are recorded as accepted warnings and do not block the gate.
- **Warnings accepted downstream**: IR-201 (the `configure_logging()` lifespan call site has no regression test — production behavior is correct, but the v1 failure mode could silently return), IR-202 (TC-COMP-345's "every record" assertion ranges over a single record in practice), IR-203 (a repeat `configure_logging()` call would drop request-id stamping; not reachable in current code). IR-201 is the one worth scheduling — either folded into this story if the owner prefers a clean gate, or tracked against the next story that touches `api/app.py`'s lifespan.
