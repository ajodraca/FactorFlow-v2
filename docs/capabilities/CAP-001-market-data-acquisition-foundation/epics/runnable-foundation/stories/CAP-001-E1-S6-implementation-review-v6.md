---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S6-implementation-review
artifact_type: implementation-review
artifact_version: 6
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
story_id: "CAP-001-E1-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 6
reviewed_at: "2026-10-10T03:59:44Z"
reviewed_head: "771aaaa432dcfab4b9b3587e6e916e4aa284cda6"
review_base: "d0b01577741e58cdc2968cb88e08f943e09892d7"
reviewed_state_revision: "sha256:1ed4a7dd16f1801d987ddf54bb570ac9e64219b1f0186d168dc813e6fbbd390a"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E1-S6
    artifact_version: 1
    content_revision: sha256:a7cdcf3a31a9e610d5abe7a75596593cb29a01eb79b45c07fa8ecd8c3a6bec26
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-10T03:59:44Z
  source_artifacts:
    - id: CAP-001-E1-S6
      version: "1"
    - id: CAP-001-E1-S6-tasks
      version: "1"
    - id: CAP-001-E1-S6-implementation-review
      version: "5"
    - id: CAP-001-integration-tests-automation-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S6 — Version 6

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 4 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 25/25 verified |
| Required validation | 6/6 passed |

This is a second shared-file re-review on `main`, not a rework cycle. v5 passed at `41a9a9d`, and doc sync confirmed it at `c406531`. The derived state then reopened the gate:

```
adversarial-review: RESUME — component repository changed after the latest passing review,
in files no other passing review covers: tests/integration/test_api_health.py
```

The question for this review: do E1-S6's ten criteria still hold on `main` at `771aaaa`, after every change since v5 to the files this story delivered? They do.

**The trigger is a single comment line.** Commit `26cfe3c` ("test(CAP-001): automate integration tasks", integration automation plan T008) added `# Implements TC-INT-020` at `test_api_health.py:178`. That line annotates `test_health_reports_the_most_recent_terminal_run`, which is CAP-001-E7-S3's test, not one of E1-S6's. No assertion, fixture or import changed. No integration automation review exists yet, which is why no other passing review covers the file.

**No other E1-S6 file changed in a way that matters.** Of the 24 files the story delivered, 22 are byte-for-byte unchanged since v5. `app.py`, `routes/health.py`, `config/settings.py` and `test_api_static_mount.py` have the same md5 as v5 recorded. The only other change is to `README.md`: commit `c39be73` (CAP-001-E5-S3 doc sync) rewrote the run journal's `finalise` section, which is not one of E1-S6's sections. The other post-v5 commits touched none of E1-S6's files:
- `EXP-20261009-1` (`16fe009`, `f7baf77`, `16cad2a`) changed `ingestion/massive/client.py` and Massive unit tests.
- The CI commits (`dbabe65`, `96cf0fd`) added a Docker Hub login to `.github/workflows/validate.yml`.
- `9ee0649` (E2E automation) changed `tests/e2e/` and `scripts/run-e2e-server.sh`.

**This review found two new weaknesses in E1-S6's own tests. Neither was introduced after v5.**
- **IR-604 (MEDIUM).** On this host, AC-14's non-loopback assertion is skipped, even though the host owns two non-loopback IPv4 addresses. `_find_non_loopback_ipv4` resolves the hostname rather than enumerating interfaces, which contradicts its own docstring. The criterion still has current evidence:
  - The unchanged test body was run against the host's real addresses through a reviewer-side plugin. It passed.
  - With the server bound to `0.0.0.0` instead, it failed.
  - CI on `771aaaa` ran the full suite with no skips (788 passed).
- **IR-605 (LOW).** TC-COMP-343's E1-S6 test runs against an unmigrated database, so it asserts the `null` from the error path.

v5's three LOW findings are carried forward unchanged as IR-601 to IR-603, because the files involved have not changed. Fresh mutation runs reproduced v5's evidence.

All required commands pass. The full suite is 788 tests: 517 passed and 1 skipped in the non-postgres run, and 270 passed in the postgres run. That matches CI's count.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 4 · **total 5**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S6-rereview`, a worktree that tracks `origin/main` and has no commits of its own |
| HEAD | `771aaaa432dcfab4b9b3587e6e916e4aa284cda6` (= `origin/main`, the PR #94 merge) |
| Review base | The story's original base, `d0b01577741e58cdc2968cb88e08f943e09892d7`, as recorded by v1–v5. It is an ancestor of HEAD (`git merge-base --is-ancestor` exit 0). v5's HEAD `41a9a9d` is also an ancestor (exit 0). |
| Working tree | Clean before and after validation (`git status --porcelain` empty). The only ignored artifacts present are `.venv/`, `.mypy_cache/`, `.ruff_cache/`, `.hypothesis/`, `src/factorflow.egg-info/` and `__pycache__/`. Unlike at v5, `src/factorflow/api/static/` holds only `.gitkeep`. |
| Changed files reviewed | 24 story-delivered files (all non-`docs/capabilities` paths in `d0b0157..5e6a9af`). For each, every commit in `41a9a9d..771aaaa` that touched it is attributed below. |
| Pipeline state (before) | `adversarial-review: RESUME`, trigger `tests/integration/test_api_health.py`; `doc-sync: BLOCKED — implementation review has not passed` |

### Review-base note

On this branch, `pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` resolves to HEAD itself (`771aaaa`), so it yields an empty diff. The story's code has been on `main` since PR #21. This review follows the v5 approach and the CAP-001-E3-S3 v3 precedent:
- `review_base` stays at the story's original base.
- Scope is limited to the 24 story-delivered files as they are at HEAD.
- Each change after v5's HEAD `41a9a9d` is attributed to the commit and story or plan that made it.

This keeps E1-S6's change set separate from unrelated work in `d0b0157..HEAD`.

### Changed Files

| File | State since v5 (`41a9a9d..HEAD`) | Story/Task Justification |
|------|----------------------------------|--------------------------|
| `src/factorflow/api/__init__.py` | unchanged | T001 |
| `src/factorflow/api/routes/__init__.py` | unchanged | T001 |
| `src/factorflow/api/static/.gitkeep` | unchanged | T001 |
| `src/factorflow/api/models.py` | unchanged | T002 |
| `src/factorflow/api/errors.py` | unchanged | T003, T024 |
| `src/factorflow/api/routes/health.py` | unchanged (md5 `0411665404c12681fa6f13f0c65320b6`, same as v5) | T016, T024 |
| `src/factorflow/api/app.py` | unchanged (md5 `d35438e9522da269aebf6d7ab5722685`, same as v5) | T017–T020 |
| `src/factorflow/app_main.py` | unchanged | T021 |
| `tests/unit/test_api_request_id.py` | unchanged | T005 (TC-COMP-345) |
| `tests/unit/test_api_request_id_redaction_composition.py` | unchanged | IR-001/IR-201/IR-301 regressions |
| `tests/unit/test_health_route_unreachable.py` | unchanged | IR-002 regression |
| `tests/integration/test_api_binding.py` | unchanged | T006 (TC-COMP-014, 346) |
| `tests/integration/test_api_health.py` | **modified by `26cfe3c`**, the trigger: one comment line, `# Implements TC-INT-020`, at `:178` on E7-S3's `test_health_reports_the_most_recent_terminal_run` | T007, T008, T010. The added line is justified by `integration-tests-automation-tasks.md` T008 and touches no E1-S6 function. |
| `tests/integration/test_api_static_mount.py` | unchanged (md5 `a2dedd2f3a84c3ccd782b8e235d606e3`, same as v5) | T011 (TC-COMP-344) |
| `tests/unit/test_api_no_secrets.py` | unchanged | T009 (TC-COMP-300) |
| `tests/unit/test_api_isolation.py` | unchanged | T012 |
| `tests/unit/test_health_schema_version.py` | unchanged | T013 |
| `tests/unit/test_health_database_probe.py` | unchanged | T014 |
| `tests/unit/test_api_models.py` | unchanged | T015 |
| `pyproject.toml` | unchanged | Dependencies |
| `uv.lock` | unchanged | Lockfile |
| `Dockerfile` | unchanged | T021/T023 |
| `README.md` | modified by `c39be73` (CAP-001-E5-S3 doc sync; run journal `finalise` section, `README.md:1013-1026`) | Doc Sync; outside E1-S6's README sections |
| `docs/constitution/tech-stack.md` | unchanged | Doc Sync |

No unjustified files. The dependencies E1-S6 reads, `config/settings.py` (E1-S3), `db/applied_migrations.py` and `migrations/` (E1-S1/S2), are also unchanged since v5. The only post-v5 change under `src/` is `ingestion/massive/client.py` (EXP-20261009-1), which nothing in E1-S6 imports.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-14 (loopback-only bind) | SATISFIED | `app_main.py:16-30` `build_server` reads `ApiSettings().host`. Unchanged since v5. | `test_api_binding.py:52` `test_server_binds_to_loopback_only` | The plain run skipped the non-loopback half here (IR-604). Fresh evidence came three ways: the same test with the host's own `192.0.2.2` and `172.17.0.1` supplied gave `2 passed` each; mutation M6 (bind `0.0.0.0`) gave `1 failed` (connection accepted, `httpx.ReadTimeout`); and CI run 38016348840 at `771aaaa` reported `788 passed` with no skip. |
| AC-18 (health reports running state without inspecting the store) | SATISFIED | `routes/health.py:69-109` | `test_api_health.py:122` `test_health_unreachable_database`; `test_health_route_unreachable.py:49`; `test_api_health.py:242` (E7-S3) | The route never raises on a database failure (`:62-66`, `:87-96`). |
| DAC-E1-16 (liveness, db reachability, credential bool, schema version) | SATISFIED | `models.py:42-46`; `routes/health.py:103-109` | `test_api_health.py:91` `test_health_reachable_database` | Container-backed; 270 postgres tests passed with Docker 29.8.2. |
| DAC-E1-9 (credential presence is a boolean, never the value) | SATISFIED | `routes/health.py:106` `credential_present()`; `models.py:44` `bool`; `app.py:168` `configure_logging()` | `test_api_no_secrets.py:12`; `test_api_request_id_redaction_composition.py:107` | M5 (the credential value added to the body) and M3 (no `configure_logging()`) both fail their tests. |
| DAC-E1-S6-1 (reachable db reports highest applied version) | SATISFIED | `routes/health.py:34-44` `probe_schema_version`, `:76-79` | `test_api_health.py:91`, `:116`; `test_health_schema_version.py:45` | Logged `database=reachable` against the migrated database. |
| DAC-E1-S6-2 (unreachable db still 200, reports unreachable) | SATISFIED | `routes/health.py:50-66`, `:87-96` | `test_health_database_probe.py:23`; `test_health_route_unreachable.py:49`; `test_api_health.py:122` | M4 (the probe stops catching `psycopg.Error`) fails `test_health_database_probe.py`. |
| DAC-E1-S6-3 (`most_recent_run` present as `null` until E7-S3) | SATISFIED | `models.py:46` default `None`; `routes/health.py:74`, `:80-86` | `test_api_health.py:118` (reachable, migrated, `is None`); `:160` (E7-S3, reachable, key present and `None`); `:143`; `test_api_models.py:208` | E7-S3 populates the field when a run exists, which is the criterion's stated end condition. `:143` asserts the null on the error path (IR-605). The reachable-and-null case rests on `:118` and `:160`. |
| DAC-E1-S6-4 (factory mounts the built frontend bundle) | SATISFIED | `app.py:235-267` (`not_found_handler` `:244-264`, mount `:267`) | `test_api_static_mount.py` (4 tests) | M1 (mount skipped) fails `test_static_mount_serves_a_bundle_asset_by_exact_path`. |
| DAC-E1-S6-5 (request id in every log record for that request) | SATISFIED | `app.py:48-96` (`_request_id_var`, `_install_request_id_patch`), `:200-232` (middleware) | `test_api_request_id.py:27`, `:104`; `test_api_request_id_redaction_composition.py:107` | M2 fails `test_api_request_id.py` only through E7-S2's `[unhandled-500]` case (IR-602). |
| DAC-E1-S6-6 (no endpoint declares an auth requirement) | SATISFIED | `app.py:380` `FastAPI(lifespan=_lifespan)`, no `dependencies` | `test_api_isolation.py:18`; `test_api_binding.py:91` | These tests run in the non-postgres suite and do not depend on the host's interfaces. Both pass over every registered router. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `api/__init__.py`, `api/routes/__init__.py`, `api/static/.gitkeep` | Unchanged since v5. |
| T002 | complete | VERIFIED | `models.py:24-46` `HealthResponse` | Unchanged since v5. |
| T003 | complete | VERIFIED | `errors.py:43-92` | Unchanged; the 500 body is `{code, request_id}` only. |
| T004 | complete | VERIFIED | `config/settings.py`, `db/applied_migrations.py` | Both unchanged since v5. |
| T005 | complete | VERIFIED | `tests/unit/test_api_request_id.py:27`, `:63` | Unchanged; IR-602. |
| T006 | complete | VERIFIED | `tests/integration/test_api_binding.py:52`, `:91` | Unchanged. Its assertions discriminate (M6), but on this host the AC-14 half skipped; see IR-604. |
| T007 | complete | VERIFIED | `test_api_health.py:91` | Passed (postgres). |
| T008 | complete | VERIFIED | `test_api_health.py:122`; `test_health_route_unreachable.py:49` | Passed. |
| T009 | complete | VERIFIED | `test_api_no_secrets.py:12` | M5 fails it. |
| T010 | complete | VERIFIED | `test_api_health.py:143` | Asserts key presence and `null` as the task requires; IR-605 on the precondition. |
| T011 | complete | VERIFIED | `test_api_static_mount.py` | Unchanged; IR-603. |
| T012 | complete | VERIFIED | `test_api_isolation.py:18` | Unchanged. |
| T013 | complete | VERIFIED | `test_health_schema_version.py:45` | Unchanged. |
| T014 | complete | VERIFIED | `test_health_database_probe.py:23` | M4 fails it. |
| T015 | complete | VERIFIED | `test_api_models.py:88-101` | Unchanged. |
| T016 | complete | VERIFIED | `routes/health.py:69-109` | Unchanged since v5. |
| T017 | complete | VERIFIED | `app.py:373-395` | Unchanged since v5. |
| T018 | complete | VERIFIED | `app.py:152-197` | Unchanged since v5. |
| T019 | complete | VERIFIED | `app.py:235-267` | Unchanged since v5. |
| T020 | complete | VERIFIED | `app.py:48-96`, `:200-232` | Unchanged since v5. |
| T021 | complete | VERIFIED | `app_main.py:13-38` | Unchanged since v5. |
| T022 | complete | VERIFIED | Full suite rerun below | 787 passed, 1 skipped (IR-604), split across the two marker runs. |
| T023 | complete | VERIFIED | `Dockerfile:26` `migrate_main && exec python -m factorflow.app_main` | Unchanged. |
| T024 | complete | VERIFIED | `errors.py:76-92`; `routes/health.py:87-96`; `app.py:168` | Unchanged. |
| T025 | complete | VERIFIED | Commands rerun below | All required commands pass. |

All 25 tasks are VERIFIED. The task file still has `status: in-progress` and the story still has `status: docs-sync`, the bookkeeping inconsistency v2–v5 accepted.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_api_binding.py::test_server_binds_to_loopback_only` / TC-COMP-014 | ADEQUATE | Drives `app_main.build_server`. It asserts loopback is reachable and a real non-loopback address is refused. When it runs, it discriminates: with `192.0.2.2` supplied it gives `2 passed`; under M6 it gives `1 failed`. CI at `771aaaa` ran it (no skips). | IR-604: on hosts whose hostname resolves only to loopback, the skip guard fires even though non-loopback interfaces exist, as it did on this host. |
| `test_api_binding.py::test_no_route_declares_an_authentication_dependency` / TC-COMP-346 | ADEQUATE | Route dependency names and the OpenAPI `securitySchemes` are checked for every registered router. | None. |
| `test_api_health.py::test_health_reachable_database` / TC-COMP-307, 341 | ADEQUATE | Real container with every migration applied. Asserts the max applied version, `credential_present is True`, and `most_recent_run is None`. | None. |
| `test_api_health.py::test_health_unreachable_database` / TC-COMP-342, 018 | ADEQUATE | Asserts HTTP 200, `unreachable`, `schema_version is None`, and `credential_present is False`. | None. |
| `test_api_health.py::test_health_most_recent_run_is_null` / TC-COMP-343 | ADEQUATE | Asserts key presence and `is None` separately. That is TC-COMP-343's expected result, which states no reachability precondition. | IR-605: the database is fresh and unmigrated, so the request logs `database=unreachable` and the `null` comes from the error path. |
| `test_api_static_mount.py` (4 tests) / TC-COMP-344 | ADEQUATE | Both fixtures own their static directory. Exact-path serving depends on the mount (M1 fails it). Covers the SPA fallback and the `/api` `not_found` envelope. | IR-603. |
| `test_api_request_id.py` (E1-S6's two functions) / TC-COMP-345 | ADEQUATE | Every `factorflow.api*` record carries the id; the id is echoed in the header; ids differ per request. | IR-602. |
| `test_api_no_secrets.py` / TC-COMP-300 | ADEQUATE | The secret value is absent from the raw body and `credential_present is True`. M5 fails it with the secret visible in the body. | None. |
| `test_api_request_id_redaction_composition.py` (3 tests) | ADEQUATE | M3 fails the lifespan test: `assert 'SECRETKEY789' not in 'leaking SECRETKEY789 here'`. | None. |
| `test_api_isolation.py`, `test_health_schema_version.py`, `test_health_database_probe.py`, `test_health_route_unreachable.py`, `test_api_models.py:88` | ADEQUATE | Unchanged since v5. M4 fails `test_health_database_probe.py`. | None. |

All nine mandatory TC-IDs (TC-COMP-014, 018, 300, 307, 341–346) remain implemented. TC-COMP-014 is rated ADEQUATE, not WEAK, because its assertions are unchanged and were shown to discriminate on this host when given the host's real address, and because the required CI suite executes it. The defect is in its applicability guard, which IR-604 records.

## Independent Validation

Working directory for every command: `repos/factorflow-v2/FactorFlow-v2`, which resolves through the review shim to the `ff-e1s6` worktree at `771aaaa`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Constitution setup step; installs the `dev` extra (ruff 0.16.6, mypy, pytest, testcontainers 4.15.0) into the ignored `.venv/` |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "All checks passed!" |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "175 files already formatted" |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Success: no issues found in 47 source files" |
| `uv run pytest -m 'not postgres' -q -p no:cacheprovider -rs` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 517 passed, **1 skipped**, 270 deselected. Skip: `test_api_binding.py:62`, "no non-loopback IPv4 interface found on this host" (IR-604). Reported here so that this run is not presented as a fully green suite. |
| `uv run pytest -m postgres -q -p no:cacheprovider -rs --durations=5` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 270 passed, 518 deselected, 605 s (Docker 29.8.2, `postgres:16` from the local image cache, no Hub pull) |
| `uv build --out-dir <scratchpad>/v6probe-e1s6/dist` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel built; output written outside the repository |

Combined: 787 passed and 1 skipped out of 788 tests. Together the two marker runs cover `uv run pytest` in full. CI run 38016348840 (job "Python — lint, types, tests", head `771aaaa`) reports `788 passed` for its full-suite step, so the skipped test runs on GitHub-hosted runners.

Story-relevant files were run first, as the narrowest set: `uv run pytest -q -p no:cacheprovider` over the 11 E1-S6 test files gave `50 passed, 1 skipped` (exit 0; the same binding skip).

Not counted:
- An initial `uv run ruff check .`, `uv run ruff format --check .` and `uv run mypy src`, run before `uv sync --all-extras`, used tools from `/root/.local/bin` because `.venv` had no `dev` extra yet. That `mypy` exited 1 with 109 `import-not-found`-driven errors. This was an environment set-up error, and the commands were rerun after the sync, as shown above.
- A first postgres run was stopped by the session's 10-minute background limit at about 93%, with no failure printed. The rerun above completed.
- The `npm` commands in the tech stack were not run. E1-S6 delivers no TypeScript, and the frontend job of CI run 38016348840 succeeded.

Reviewer probes, run with pytest plugins kept outside the repository (`-p supply_ip`, `-p mutate`, `-p mutate2` on `PYTHONPATH`). No tracked file was edited for any probe:

| Experiment | Target | Result |
|------------|--------|--------|
| P1: supply the host's own `192.0.2.2` to `_find_non_loopback_ipv4` | `test_api_binding.py` | **2 passed** |
| P2: supply `172.17.0.1` (docker0) | `test_api_binding.py` | **2 passed** |
| M6: P1 plus `uvicorn.Config(host="0.0.0.0")` | `app_main.py:27-29` | **1 failed, 1 passed**: `httpx.ReadTimeout`, so the connection to `192.0.2.2` was accepted |
| M1: `FastAPI.mount(..., name="static")` becomes a no-op | `app.py:267` | `test_api_static_mount.py`: **1 failed, 3 passed** (`test_static_mount_serves_a_bundle_asset_by_exact_path`) |
| M2: stamp only `factorflow.api.routes.health` records | `app.py:53-96` | `test_api_request_id.py`: **1 failed, 5 passed** (`[unhandled-500]`); E1-S6's two functions pass (IR-602) |
| M3: `configure_logging` becomes a no-op in `_lifespan` | `app.py:168` | `test_lifespan_installs_redaction_end_to_end` fails: `assert 'SECRETKEY789' not in 'leaking SECRETKEY789 here'` |
| M4: the reachability probe stops catching `psycopg.Error` | `routes/health.py:62-66` | `test_health_database_probe.py`: **1 failed** (`psycopg.OperationalError: connection refused`) |
| M5: the health body gains a field carrying `FACTORFLOW_MASSIVE_API_KEY` | `routes/health.py:103-109`, `models.py:24-46` | `test_api_no_secrets.py`: fails, with the secret visible in the body |
| Baselines with the plugins loaded and no mutation | the files above | 13 passed; 2 passed |
| L1: `-o log_cli=true --log-cli-level=INFO` on `:143` and `:160` | `test_api_health.py` | `:143` logs `health check completed: database=unreachable` and `reclaim sweep failed`; `:160` logs `database=reachable` |

### Validation Side Effects

- Before: clean tree at `771aaaa`. md5 values: `app.py` `d35438e9522da269aebf6d7ab5722685`, `routes/health.py` `0411665404c12681fa6f13f0c65320b6`, `config/settings.py` `ca1721c8d583470a83030015f895ace1`, `test_api_health.py` `8b9558d978da5ec16a194d637c004cb9`, `test_api_static_mount.py` `a2dedd2f3a84c3ccd782b8e235d606e3`. `code-revision` `sha256:1ed4a7dd…390a`.
- After: clean tree at `771aaaa`, with all five md5 values identical and `git status --porcelain` empty. `code-revision` is unchanged (`sha256:1ed4a7dd16f1801d987ddf54bb570ac9e64219b1f0186d168dc813e6fbbd390a`). The new files are all ignored: `.venv/`, `.mypy_cache/`, `.ruff_cache/`, `.hypothesis/`, `src/factorflow.egg-info/` and `__pycache__/`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Status | Title |
|----|----------|--------|-------|
| IR-601 | LOW | OPEN | A repeat `configure_logging()` call would drop request-id stamping |
| IR-602 | LOW | OPEN | TC-COMP-345's success-path function still ranges over a single record |
| IR-603 | LOW | OPEN | The no-bundle test's content-type assertion passes when the header is absent |
| IR-604 | MEDIUM | OPEN | AC-14's non-loopback assertion skips on a host that has non-loopback interfaces |
| IR-605 | LOW | OPEN | TC-COMP-343's E1-S6 test asserts the `null` from the error path |

### IR-601 — A repeat `configure_logging()` call would drop request-id stamping

- **Severity**: LOW
- **Status**: OPEN (carried forward from v2/IR-203, v3, v4/IR-401, v5/IR-501)
- **Acceptance criteria**: DAC-E1-S6-5 (currently SATISFIED)
- **Tasks**: T020
- **Files**: `src/factorflow/config/settings.py`; `src/factorflow/api/app.py:53-96`
- **Claim challenged**: That the two `logging.Handler.handle` patches compose safely under any call sequence.
- **Observed evidence**: `git log 41a9a9d..HEAD -- src/factorflow/config/settings.py src/factorflow/api/app.py` is empty, and both md5 values match v5. `configure_logging` still rebuilds from its pristine `_unfiltered_handle`, while `_install_request_id_patch` wraps whatever is current. `_lifespan` (`app.py:168-169`) still calls each of them once, in the safe order.
- **Expected evidence/behavior**: Symmetric composition, so neither patch can silently disable the other.
- **Impact**: Latent. No code path calls `configure_logging()` a second time.
- **Required remediation**: None for this story. The asymmetry lives in `settings.py`, so this is arguably CAP-001-E1-S3's to own.

### IR-602 — TC-COMP-345's success-path function still ranges over a single record

- **Severity**: LOW
- **Status**: OPEN (carried forward from v4/IR-402, v5/IR-502)
- **Acceptance criteria**: DAC-E1-S6-5 (SATISFIED on other evidence)
- **Tasks**: T005
- **Files**: `tests/unit/test_api_request_id.py:27-60`
- **Claim challenged**: That the mandatory TC-ID verifies the id on *every* record for a request.
- **Observed evidence**: Mutation M2, rerun this cycle, gives `test_api_request_id.py`: `1 failed, 5 passed`. The only failure is E7-S2's `[unhandled-500]` case. E1-S6's `test_request_id_appears_in_every_log_record_and_the_response` still passes, because `GET /api/health` emits only the `routes.health` record.
- **Expected evidence/behavior**: The success-path assertion should range over at least two loggers.
- **Impact**: Unchanged from v5. Under M2, the error-path cases and the composition test catch the regression; the success-path function alone does not.
- **Required remediation**: None blocking. If tightened later, emit a second `factorflow.api.*` record during the success-path request.

### IR-603 — The no-bundle test's content-type assertion passes when the header is absent

- **Severity**: LOW
- **Status**: OPEN (carried forward from v5/IR-503, first recorded as `EXP-20260917-1` review ER-001)
- **Acceptance criteria**: DAC-E1-S6-4 (SATISFIED on other evidence)
- **Tasks**: T011
- **Files**: `tests/integration/test_api_static_mount.py:87`; `src/factorflow/api/app.py:264`
- **Claim challenged**: That `test_no_bundle_yet_falls_back_to_a_bare_404` proves a *bare* 404.
- **Observed evidence**: Both files are unchanged since v5; `test_api_static_mount.py` has the same md5. `app.py:264` returns `Response(status_code=404)`, which sends no `content-type`. The assertion `...get("content-type", "").startswith("application/json") is False` therefore passes through the `""` default. It would also pass for a 404 with a `text/html` or `text/plain` body.
- **Expected evidence/behavior**: The docstring's "plain 404" claim should be asserted directly.
- **Impact**: A regression that served a non-JSON 404 with a body when no bundle exists would not be caught here.
- **Required remediation**: None blocking. Optional hardening: assert `response.content == b""` and `"content-type" not in response.headers`.

### IR-604 — AC-14's non-loopback assertion skips on a host that has non-loopback interfaces

- **Severity**: MEDIUM
- **Status**: OPEN (new; residual of v1/IR-003, which v2 marked resolved on a host where the hostname resolved to a LAN address)
- **Acceptance criteria**: AC-14 (SATISFIED on the probe and CI evidence below)
- **Tasks**: T006
- **Files**: `tests/integration/test_api_binding.py:29-49` (`_find_non_loopback_ipv4`), `:60-65` (skip)
- **Claim challenged**: The helper's docstring, at `:35-37`, says `getaddrinfo` "resolves the *interface* addresses directly rather than depending on that name lookup". The skip, at `:62-65`, says it fires only when "no non-loopback IPv4 interface" exists.
- **Observed evidence**:
  - The helper calls `socket.getaddrinfo(socket.gethostname(), None, family=AF_INET)`. That is a name lookup, not interface enumeration.
  - On this host, `gethostname()` is `vm`, and `/etc/hosts` maps `vm` to `127.0.0.1`, so `getaddrinfo` returns only `127.0.0.1`.
  - The host nonetheless owns `192.0.2.2` and `172.17.0.1` (`/proc/net/fib_trie`, `hostname -I`).
  - Result: `SKIPPED [1] tests/integration/test_api_binding.py:62` in the non-postgres run and in the story-relevant run.
  - With either real address supplied (P1, P2), the unchanged test body passes. With the server bound to `0.0.0.0` (M6), it fails.
  - CI at `771aaaa` reports `788 passed` with no skip.
- **Expected evidence/behavior**: v1/IR-003's remediation allowed an explicit skip only "when no non-loopback address is available". TC-COMP-014 requires that the interface "MUST NOT be reachable from a non-loopback network interface". The skip should fire only when the host truly has no non-loopback IPv4 address.
- **Impact**: A local `uv run pytest` passes without exercising AC-14's substance on any host whose hostname resolves only to loopback. That includes this container and many sandboxed or containerized agent environments. A regression to a `0.0.0.0` bind would pass such a local run. It would still be caught in CI, and by `ApiSettings._reject_non_loopback_host` (E1-S3) at the configuration layer. The skip is visible with `-rs` or in the `1 skipped` count, but a summary of `exit 0` reads as green.
- **Required remediation**: Make the helper find a non-loopback IPv4 address the host actually owns without relying on hostname resolution. For example, enumerate interfaces, or take the local address of an unconnected-route UDP socket. Correct the docstring to match. Keep the explicit skip for hosts that genuinely have none. This does not block this gate.

### IR-605 — TC-COMP-343's E1-S6 test asserts the `null` from the error path

- **Severity**: LOW
- **Status**: OPEN (new; present since the test's first version, `94a5bba`)
- **Acceptance criteria**: DAC-E1-S6-3 (SATISFIED on other evidence)
- **Tasks**: T010, T013, T016
- **Files**: `tests/integration/test_api_health.py:142-155`; `src/factorflow/api/routes/health.py:34-44` (docstring `:35-39`), `:87-96`
- **Claim challenged**: That `test_health_most_recent_run_is_null` observes `most_recent_run` as `null` on a normal health response.
- **Observed evidence**:
  - The test points the app at `postgres_connection_string`, which `tests/conftest.py:80-99` documents as "a freshly created, empty database". The test applies no migrations.
  - `probe_schema_version` therefore raises on the missing `applied_migrations` table, and `get_health` maps that to `unreachable`. With live logging (L1), the request logs `health check completed: database=unreachable`, and the reclaim loop logs `reclaim sweep failed`.
  - The test passes because the error path also yields `most_recent_run = None`.
  - Separately, `probe_schema_version`'s docstring says it returns `None` when "the table itself does not exist". In fact the function raises in that case, and only `get_health`'s `except psycopg.Error` turns the failure into `unreachable`.
- **Expected evidence/behavior**: TC-COMP-343's expected result states no reachability precondition, so the test meets its letter. The criterion's intent is that a normal response carries the key as `null` until E7-S3. That case is proven by `test_health_reachable_database` (`:118`) and E7-S3's `test_health_most_recent_run_null_when_no_run_recorded` (`:160`), both on a migrated, reachable database.
- **Impact**: Evidence quality only. The test still fails if the field is dropped from the model. It cannot detect a reachable-path regression, which the two tests named above cover.
- **Required remediation**: None blocking. Optionally:
  - Migrate the database in this test (for example, reuse `migrated_health_client`) and assert `database == "reachable"`.
  - Correct `probe_schema_version`'s docstring so that a missing table is described as raising.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v5/IR-501 — a repeat `configure_logging()` drops stamping | STILL OPEN | `settings.py` and `app.py` untouched since `41a9a9d` (md5 identical to v5). Carried forward as IR-601. |
| v5/IR-502 — TC-COMP-345's quantifier ranges over one record | STILL OPEN | M2 rerun: `1 failed, 5 passed`, the same as v5. E1-S6's success-path function still passes. Carried forward as IR-602. |
| v5/IR-503 — the no-bundle content-type assertion is vacuous | STILL OPEN | `test_api_static_mount.py` md5 identical to v5; `app.py:264` unchanged. Carried forward as IR-603. |

## Scope and Plan Deviations

- **Shared-file re-review on `main`.** The review branch has no commits of its own. The subject is E1-S6's 24 delivered files at `771aaaa`, with `review_base` kept at the story's original base (see the review-base note).
- **Why the gate reopened.** The trigger, `tests/integration/test_api_health.py`, changed through Phase 6b integration automation (`26cfe3c`, T008), for which no automation review exists yet. The change is one traceability comment on an E7-S3 test.
- **DAC-E1-S6-3's end condition has occurred.** E7-S3 populates `most_recent_run`. The criterion is read as v5 read it: `null` when no run exists, and a populated object once a run is recorded.
- **Story `status: docs-sync`, task file `status: in-progress`.** This is the inconsistency v2–v5 accepted. It is not raised again.
- **Validation environment.**
  - Docker 29.8.2, started for this review; `postgres:16` came from the local image cache, with no Docker Hub pull.
  - Python 3.13.16 locally, against `requires-python >=3.12`; CI uses 3.12.
  - Ignored build output is absent from `src/factorflow/api/static/`, unlike at v5. The static-mount tests do not depend on it.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Docs were last confirmed at `c406531` against v5. Since v5, the only changes in E1-S6's scope are:
  - a traceability comment on an E7-S3 test;
  - an E5-S3 README section that is outside E1-S6's sections.

  Neither documents E1-S6 behavior. Doc sync is expected to confirm that no doc changes are needed and to set `docs_synced_review: CAP-001-E1-S6-implementation-review-v6.md`. Moving the story to `done` still waits for capability automation review.
- **Warnings accepted downstream**: IR-604 (MEDIUM, the AC-14 skip guard depends on hostname resolution), IR-601 (LOW, latent `settings.py` asymmetry, arguably E1-S3's), IR-602 (LOW, the success-path quantifier), IR-603 (LOW, the vacuous content-type assertion), IR-605 (LOW, TC-COMP-343's error-path precondition and the docstring for a missing table). None blocks the gate.
