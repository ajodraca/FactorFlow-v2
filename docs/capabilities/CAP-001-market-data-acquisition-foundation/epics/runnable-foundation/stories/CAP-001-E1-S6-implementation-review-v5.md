---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S6-implementation-review
artifact_type: implementation-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-05
updated: 2026-10-05
story_id: "CAP-001-E1-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 5
reviewed_at: "2026-10-06T01:55:13Z"
reviewed_head: "41a9a9dc0718de3b3b7119d08fb2f23c0ce4cf53"
review_base: "d0b01577741e58cdc2968cb88e08f943e09892d7"
reviewed_state_revision: "sha256:cc26b88cd8c385d8c6a145a9ba3562c0165ee2a2adb59cbc2c25a331244e7db1"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E1-S6
    artifact_version: 1
    content_revision: sha256:a7cdcf3a31a9e610d5abe7a75596593cb29a01eb79b45c07fa8ecd8c3a6bec26
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5.5
  tool: Devin
  tool_version: "unknown"
  timestamp: 2026-10-06T01:55:13Z
  source_artifacts:
    - id: CAP-001-E1-S6
      version: "1"
    - id: CAP-001-E1-S6-tasks
      version: "1"
    - id: CAP-001-E1-S6-implementation-review
      version: "4"
    - id: EXP-20260917-1
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S6 — Version 5

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 3 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 25/25 verified |
| Required validation | 5/5 passed |

This is a shared-file re-review, not a rework cycle. E1-S6 merged to `main` with PR #21 after v4 passed, and doc sync ran at `d6be516`. The derived state then reopened the gate:

```
adversarial-review: RESUME — component repository changed after the latest passing review,
in files no other passing review covers: tests/integration/test_api_static_mount.py
```

The question for this review was whether E1-S6's ten criteria still hold on `main` at `41a9a9d`, after every later change to files the story delivered. They do.

**The trigger file changed fixture setup only.** `EXP-20260917-1` (`f0b40c2`) made the `client` fixture point `_STATIC_DIR` at an empty `tmp_path`, and reworded two docstrings. All four assertions are unchanged. The change makes TC-COMP-344 deterministic: the ignored Vite build that now sits in `src/factorflow/api/static/` (`index.html`, `assets/`) previously turned the no-bundle test's `404` into a `200`. That build output was present throughout this review, and all four tests passed against it. Removing `app.mount(...)` still fails `test_static_mount_serves_a_bundle_asset_by_exact_path`, so the test still discriminates.

**Sibling stories changed the production files this story delivered. None of those changes undid an E1-S6 criterion.** E2-S3, E5-S4, E5-S5, E6-S3, E7-S1, E7-S2 and E7-S3 each extended `app.py`, `errors.py`, `models.py` or `routes/health.py` under their own passing reviews. These were re-read in full against each criterion:
- Binding: `app_main.py` is unchanged.
- No auth dependency: `create_app` still builds `FastAPI(lifespan=_lifespan)` with no `dependencies`.
- Redaction and request-id: `configure_logging()` still runs before `_install_request_id_patch()` in `_lifespan`.
- Unreachable database still reports `200`.
- Static mount and SPA fallback are intact.
- `most_recent_run` is still serialised as `null` when no run is recorded.

E7-S3 now populates `most_recent_run` when a run exists. That is the end condition DAC-E1-S6-3 names ("until CAP-001-E7-S3 populates it"), not a regression.

**One of v4's three findings is resolved, one is narrowed, one is unchanged.**
- v4/IR-403 (`last_reworked_review`) is **resolved**.
- v4/IR-402 (TC-COMP-345's quantifier) is **narrowed further**. E7-S2 added error-path tests to the same file, and those tests now fail under the stamping mutation. The original success-path function still does not.
- v4/IR-401 (`configure_logging` asymmetry) is **unchanged**, because `settings.py` has not been touched since v4.

There is one new LOW finding: the weak content-type assertion that `EXP-20260917-1`'s review recorded as ER-001 is carried into this story's record, because it sits in E1-S6's own test file.

All 784 tests pass (515 non-postgres, 269 postgres), and all five required commands pass.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 3 · **total 3**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S6`, which tracks `origin/main` and was created from it on 2026-10-05. It is not PR #21's branch, which merged on 2026-09-08. |
| HEAD | `41a9a9dc0718de3b3b7119d08fb2f23c0ce4cf53` (= `origin/main`, the PR #83 merge) |
| Review base | The story's original base, `d0b01577741e58cdc2968cb88e08f943e09892d7`, as recorded by v1–v4. It is an ancestor of HEAD (`git merge-base --is-ancestor` exit 0). |
| Working tree | Clean before and after validation and all five mutation experiments. Ignored build output is present in `src/factorflow/api/static/` (`git check-ignore` → `.gitignore:18`). |
| Changed files reviewed | 24 story-delivered files (all non-`docs/capabilities` paths in `d0b0157..5e6a9af`), plus every later commit that touched any of them |
| Pipeline state (before) | `adversarial-review: RESUME`, trigger `tests/integration/test_api_static_mount.py` |

### Review-base note

`pipeline-state.py review-base` resolves to HEAD itself (`41a9a9d`) on this branch, because the story's code has long been part of `main`, so it yields an empty diff. Following the precedent of the CAP-001-E3-S3 v3 shared-file re-review, this review keeps the story's original `review_base` and limits itself to the story-delivered files. For each file, any change after v4's HEAD `5e6a9af` is attributed below to the commit and story that made it. That separates E1-S6's change set from unrelated work in `d0b0157..HEAD` without widening scope.

### Changed Files

| File | State since v4 (`5e6a9af..HEAD`) | Story/Task Justification |
|------|----------------------------------|--------------------------|
| `src/factorflow/api/__init__.py` | unchanged | T001 |
| `src/factorflow/api/routes/__init__.py` | unchanged | T001 |
| `src/factorflow/api/static/.gitkeep` | unchanged | T001 |
| `src/factorflow/api/models.py` | modified by E2-S3 `aa4a40a`, E5-S5 `89d9e47`, E6-S3 `5077fcf`, E7-S1 `0e7e5e9`, E7-S3 `cb4771d` | T002; `HealthResponse` fields at `models.py:43-46` keep E1-S6's contract |
| `src/factorflow/api/errors.py` | modified by E5-S5 `89d9e47`, E7-S2 `b0ee0c2` | T003; the 500 body is now `{code, request_id}` (E7-S2, DAC-E7-7), which still meets T003/T024's no-driver-text requirement |
| `src/factorflow/api/routes/health.py` | modified by E7-S3 `cd313ab` | T016; adds the `most_recent_run` read inside the same guarded connection block |
| `src/factorflow/api/app.py` | modified by E2-S3 `aa4a40a`/`dd9a8e2`, E5-S4 `dc80f33`, E5-S5 `89d9e47`, E6-S3 `5077fcf`, E7-S2 `c121afa` | T017–T020; routers, handlers and the reclaim loop added, with E1-S6's lifespan, middleware and mount preserved |
| `src/factorflow/app_main.py` | unchanged | T021 |
| `tests/unit/test_api_request_id.py` | modified by E7-S2 `28f36aa` (two error-path tests appended) | T005 (TC-COMP-345); E1-S6's two functions unchanged |
| `tests/unit/test_api_request_id_redaction_composition.py` | unchanged | IR-001/IR-201/IR-301 regressions |
| `tests/unit/test_health_route_unreachable.py` | unchanged | IR-002 regression |
| `tests/integration/test_api_binding.py` | unchanged | T006 (TC-COMP-014, 346) |
| `tests/integration/test_api_health.py` | modified by E7-S3 `f7df176`, `69fd984` | T007, T008, T010; E1-S6's three tests kept, E7-S3 cases added |
| `tests/integration/test_api_static_mount.py` | **modified by `EXP-20260917-1` `f0b40c2`**, the trigger | T011 (TC-COMP-344); fixture isolation only |
| `tests/unit/test_api_no_secrets.py` | unchanged | T009 (TC-COMP-300) |
| `tests/unit/test_api_isolation.py` | unchanged | T012 |
| `tests/unit/test_health_schema_version.py` | unchanged | T013 |
| `tests/unit/test_health_database_probe.py` | unchanged | T014 |
| `tests/unit/test_api_models.py` | modified by E2-S3 `aa4a40a`, E7-S1 `d3fe412`, E7-S3 `834e10b` | T015; E1-S6's round-trip test at `:88-101` unchanged in substance |
| `pyproject.toml` | modified by later stories (dependency additions) | Dependencies |
| `uv.lock` | modified by later stories | Lockfile |
| `Dockerfile` | unchanged | T021/T023 |
| `README.md` | modified by later stories' doc syncs | Doc Sync |
| `docs/constitution/tech-stack.md` | modified by later revisions | Doc Sync |

No unjustified files. Every post-v4 change to a story-delivered file belongs to a named sibling story or to `EXP-20260917-1`, and none of them reverses an E1-S6 behavior (verified per criterion below).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-14 (loopback-only bind) | SATISFIED | `app_main.py:16-30` `build_server` reads `ApiSettings().host` (unchanged since v4) | `test_api_binding.py:52` `test_server_binds_to_loopback_only` | Passed in the non-postgres run. |
| AC-18 (health reports running state without inspecting the store) | SATISFIED | `routes/health.py:69-109` | `test_api_health.py:122` `test_health_unreachable_database`; `test_health_route_unreachable.py:49` | Route still never raises on a database failure (`:62-66`, `:87-96`). |
| DAC-E1-16 (liveness, db reachability, credential bool, schema version) | SATISFIED | `models.py:43-46`; `routes/health.py:103-109` | `test_api_health.py:91` `test_health_reachable_database` | Container-backed; 269 postgres tests passed with Docker 28.3.2. |
| DAC-E1-9 (credential presence is a boolean, never the value) | SATISFIED | `routes/health.py:106` `credential_present()`; `models.py:44` `bool`; `app.py:168` `configure_logging()` | `test_api_no_secrets.py:12`; `test_api_request_id_redaction_composition.py:107` | Mutations M3 and M5 below both fail the tests. `routes/health.py:22` still imports `credential_present` by name and calls it bare, so the composition test's monkeypatch still intercepts the in-request call. |
| DAC-E1-S6-1 (reachable db reports highest applied version) | SATISFIED | `routes/health.py:34-44` `probe_schema_version` | `test_api_health.py:91`; `test_health_schema_version.py:45` | Unchanged probe. |
| DAC-E1-S6-2 (unreachable db still 200, reports unreachable) | SATISFIED | `routes/health.py:50-66`, `:87-96` | `test_health_database_probe.py:23`; `test_health_route_unreachable.py:49`; `test_api_health.py:122` | Mutation M4 fails the probe test. E7-S3's added read sits inside the same `except psycopg.Error` block, so a mid-request failure still reports `unreachable` with `schema_version` and `most_recent_run` both `None`. |
| DAC-E1-S6-3 (`most_recent_run` present as `null` until E7-S3) | SATISFIED | `models.py:46` default `None`; `routes/health.py:74`, `:81-86` | `test_api_health.py:143` `test_health_most_recent_run_is_null`, `:160`; `test_api_models.py:208` | E7-S3 now populates the field when a run exists, which is the criterion's stated end condition. With no run recorded, the key is still present and `null`. |
| DAC-E1-S6-4 (factory mounts the built frontend bundle) | SATISFIED | `app.py:235-267` (`not_found_handler` `:244-264`, mount `:267`) | `test_api_static_mount.py` (4 tests) | Mutation M1 (mount removed) fails `test_static_mount_serves_a_bundle_asset_by_exact_path`. All four tests pass with a real build present in the package directory. |
| DAC-E1-S6-5 (request id in every log record for that request) | SATISFIED | `app.py:48-96` (`_request_id_var`, `_install_request_id_patch`), `:200-232` (middleware) | `test_api_request_id.py:27`, `:104`; `test_api_request_id_redaction_composition.py:107` | Mutation M2 now fails `test_api_request_id.py` alone (an E7-S2 error-path case); see IR-502. |
| DAC-E1-S6-6 (no endpoint declares an auth requirement) | SATISFIED | `app.py:380` `FastAPI(lifespan=_lifespan)`, no `dependencies` | `test_api_isolation.py:18`; `test_api_binding.py:91` | These tests now range over every router added since (instruments, settings, runs, coverage), and all pass. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `api/__init__.py`, `api/routes/__init__.py`, `api/static/.gitkeep` | Unchanged since v4. |
| T002 | complete | VERIFIED | `models.py:24-46` `HealthResponse` | E7-S3 typed `most_recent_run` as `MostRecentRun \| None`, as the task plan's Notes anticipated. |
| T003 | complete | VERIFIED | `errors.py:43-92` | E7-S2 narrowed the 500 body further; still `internal_error` plus request id only. |
| T004 | complete | VERIFIED | `config/settings.py`, `db/applied_migrations.py` | Both unchanged since v4. |
| T005 | complete | VERIFIED | `tests/unit/test_api_request_id.py:27`, `:63` | E1-S6's functions unchanged; IR-502. |
| T006 | complete | VERIFIED | `tests/integration/test_api_binding.py` | Unchanged since v4. |
| T007 | complete | VERIFIED | `test_api_health.py:91` | Passed (postgres). |
| T008 | complete | VERIFIED | `test_api_health.py:122`; `test_health_route_unreachable.py` | Passed. |
| T009 | complete | VERIFIED | `test_api_no_secrets.py:12` | Unchanged; mutation M5 fails it. |
| T010 | complete | VERIFIED | `test_api_health.py:143` | Kept by E7-S3. |
| T011 | complete | VERIFIED | `test_api_static_mount.py` | Fixture isolation by `EXP-20260917-1`; assertions unchanged; IR-503. |
| T012 | complete | VERIFIED | `test_api_isolation.py:18` | Unchanged. |
| T013 | complete | VERIFIED | `test_health_schema_version.py:45` | Unchanged. |
| T014 | complete | VERIFIED | `test_health_database_probe.py:23` | Unchanged; mutation M4 fails it. |
| T015 | complete | VERIFIED | `test_api_models.py:88-101` | Unchanged in substance. |
| T016 | complete | VERIFIED | `routes/health.py:69-109` | E7-S3 extension preserves the no-raise contract. |
| T017 | complete | VERIFIED | `app.py:373-395` | Additional routers and handlers; no default dependencies. |
| T018 | complete | VERIFIED | `app.py:152-197` | Pool lifecycle intact; E5-S4's reclaim task is cancelled before `pool.close()`. |
| T019 | complete | VERIFIED | `app.py:235-267` | Unchanged behavior. |
| T020 | complete | VERIFIED | `app.py:48-96`, `:200-232` | E7-S2 handles unhandled exceptions inside the middleware while the id is still bound, which strengthens T020. |
| T021 | complete | VERIFIED | `app_main.py:13-38` | Unchanged since v4. |
| T022 | complete | VERIFIED | Full suite rerun below | 784 passed. |
| T023 | complete | VERIFIED | `Dockerfile:26` `migrate_main && exec python -m factorflow.app_main` | Unchanged. |
| T024 | complete | VERIFIED | `errors.py:76-92`; `routes/health.py:87-96`; `app.py:168` | The 500 body carries no `message` at all since E7-S2. |
| T025 | complete | VERIFIED | Commands rerun below | All five pass. |

All 25 tasks VERIFIED. The task file's `last_reworked_review` now names v3, which closes v4/IR-403.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_api_static_mount.py` (4 tests) / TC-COMP-344 | ADEQUATE | Both fixtures now own their static directory (`tmp_path`), so results no longer depend on ignored build output. Exact-path asset serving depends on the mount (M1 fails it). SPA fallback returns the fixture `index.html`. An unmatched `/api` path returns the `not_found` envelope with a request id. | IR-503: the no-bundle test's content-type assertion passes vacuously when the header is absent. |
| `test_api_request_id.py::test_request_id_appears_in_every_log_record_and_the_response` / TC-COMP-345 | ADEQUATE | Every `factorflow.api*` record carries the id; the id is echoed in the header. | IR-502: on the success path, only one component record is emitted. |
| `test_api_request_id.py::test_two_requests_get_different_request_ids` / TC-COMP-345 | ADEQUATE | Distinct ids per request. | None. |
| `test_api_request_id_redaction_composition.py` (3 tests) | ADEQUATE | Unchanged since v4. M3 (no `configure_logging()`) fails the lifespan test with the literal secret disclosure. | None. |
| `test_api_binding.py` (2 tests) / TC-COMP-014, 346 | ADEQUATE | Unchanged; now covers every router registered since. | None. |
| `test_api_health.py::test_health_reachable_database` / TC-COMP-307, 341 | ADEQUATE | Real container, max applied version, and (since E7-S3) `most_recent_run is None` with no run. | None. |
| `test_api_health.py::test_health_unreachable_database` / TC-COMP-342, 018 | ADEQUATE | HTTP 200, `unreachable`, `schema_version is None`. | None. |
| `test_api_health.py::test_health_most_recent_run_is_null` / TC-COMP-343 | ADEQUATE | Key presence and `is None`, asserted separately. | None. |
| `test_api_no_secrets.py` / TC-COMP-300 | ADEQUATE | M5 (credential value serialised into the body) fails it. | None. |
| `test_api_isolation.py`, `test_health_schema_version.py`, `test_health_database_probe.py`, `test_health_route_unreachable.py`, `test_api_models.py:88` | ADEQUATE | Unchanged since v4; M4 fails `test_health_database_probe.py`. | None. |

All nine mandatory TC-IDs (TC-COMP-014, 018, 300, 307, 341–346) remain implemented and ADEQUATE.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "All checks passed!" |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "173 files already formatted" |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Success: no issues found in 47 source files" |
| `uv run pytest -m 'not postgres' -q -p no:cacheprovider` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 515 passed, 269 deselected |
| `uv run pytest -m postgres -q -p no:cacheprovider` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 269 passed, 515 deselected (Docker 28.3.2 available) |

Combined: 784 tests pass, which covers `uv run pytest` in full.

Mutation experiments were applied to working-tree copies and run, then restored from copies held outside the repository:

| Experiment | Target | Result |
|------------|--------|--------|
| M1: remove `app.mount("/", StaticFiles(...))` | `app.py:267` | `test_api_static_mount.py`: **1 failed, 3 passed** (`test_static_mount_serves_a_bundle_asset_by_exact_path`) |
| M2: stamp only `factorflow.api.routes.health` records | `app.py:92` | `test_api_request_id.py` alone: **1 failed, 5 passed** (`[unhandled-500]`); E1-S6's two functions still pass (IR-502) |
| M3: drop `configure_logging()` from `_lifespan` | `app.py:168` | Composition test fails: `AssertionError: assert 'SECRETKEY789' not in 'leaking SECRETKEY789 here'` |
| M4: reachability probe stops catching `psycopg.Error` | `routes/health.py:65` | **1 failed, 1 passed** (`test_unreachable_database_returns_false_not_an_exception`) |
| M5: serialise the credential value into the health body | `routes/health.py:103-109` | `test_api_no_secrets.py`: **1 failed** |

### Validation Side Effects

- Before: clean tree at `41a9a9d`. `md5`: `app.py` `d35438e9522da269aebf6d7ab5722685`, `routes/health.py` `0411665404c12681fa6f13f0c65320b6`, `config/settings.py` `ca1721c8d583470a83030015f895ace1`, `test_api_static_mount.py` `a2dedd2f3a84c3ccd782b8e235d606e3`.
- After: clean tree at `41a9a9d`; `app.py` and `routes/health.py` md5 identical to before; `git status --porcelain` empty.
- Unexpected tracked-file changes: none. Pytest ran with `-p no:cacheprovider`, and no validation command modified a tracked file.

## Findings

| ID | Severity | Status | Title |
|----|----------|--------|-------|
| IR-501 | LOW | OPEN | A repeat `configure_logging()` call would drop request-id stamping |
| IR-502 | LOW | OPEN | TC-COMP-345's success-path function still ranges over a single record |
| IR-503 | LOW | OPEN | The no-bundle test's content-type assertion passes when the header is absent |

### IR-501 — A repeat `configure_logging()` call would drop request-id stamping

- **Severity**: LOW
- **Status**: OPEN (carried forward from v2/IR-203, v3, v4/IR-401)
- **Acceptance criteria**: DAC-E1-S6-5 (currently SATISFIED)
- **Tasks**: T020
- **Files**: `src/factorflow/config/settings.py`; `src/factorflow/api/app.py:53-96`
- **Claim challenged**: That the two `logging.Handler.handle` patches compose safely under any call sequence.
- **Observed evidence**: `git log 5e6a9af..HEAD -- src/factorflow/config/settings.py` is empty, so the asymmetry v4 described is unchanged. `configure_logging` rebuilds from its pristine `_unfiltered_handle`, while `_install_request_id_patch` wraps whatever is current. `_lifespan` (`app.py:168-169`) still calls them once each, in the safe order.
- **Expected evidence/behavior**: Symmetric composition, so neither patch can silently disable the other.
- **Impact**: Latent. No code path calls `configure_logging()` a second time.
- **Required remediation**: None for this story. This is arguably CAP-001-E1-S3's to own, since the asymmetry lives in `settings.py`.

### IR-502 — TC-COMP-345's success-path function still ranges over a single record

- **Severity**: LOW
- **Status**: OPEN (narrowed from v4/IR-402)
- **Acceptance criteria**: DAC-E1-S6-5 (SATISFIED on other evidence)
- **Tasks**: T005
- **Files**: `tests/unit/test_api_request_id.py:27-60`
- **Claim challenged**: That the mandatory TC-ID verifies the id on *every* record for a request.
- **Observed evidence**: Under mutation M2, `test_api_request_id.py` run alone now fails (`1 failed, 5 passed`). This is new since v4, where the same run reported `2 passed`. The failing case is E7-S2's `test_error_request_id_is_in_every_component_log_record[unhandled-500]`, whose `factorflow.api.probe` record exposes the narrowed stamping. E1-S6's own success-path function still passes under M2, because a `GET /api/health` emits only the `routes.health` record.
- **Expected evidence/behavior**: The success-path assertion should range over at least two loggers.
- **Impact**: Smaller than at v4. The mandatory test file now catches the regression on error paths, and the composition test catches it on the success path. Only the success-path function's own quantifier is still a weak traceability point.
- **Required remediation**: None blocking. If tightened later, emit a second `factorflow.api.*` record during the success-path request.

### IR-503 — The no-bundle test's content-type assertion passes when the header is absent

- **Severity**: LOW
- **Status**: OPEN (first recorded as `EXP-20260917-1` review ER-001; carried into this story's record because the test is E1-S6's)
- **Acceptance criteria**: DAC-E1-S6-4 (SATISFIED on other evidence)
- **Tasks**: T011
- **Files**: `tests/integration/test_api_static_mount.py:87`; `src/factorflow/api/app.py:264`
- **Claim challenged**: That `test_no_bundle_yet_falls_back_to_a_bare_404` proves a *bare* 404.
- **Observed evidence**: `app.py:264` returns `Response(status_code=404)`, which has no media type, so no `content-type` header is sent. The assertion `response.headers.get("content-type", "").startswith("application/json") is False` then passes through the `""` default. It would also pass for a bodied `text/html` or `text/plain` 404.
- **Expected evidence/behavior**: The docstring's "plain 404" claim should be asserted directly.
- **Impact**: A future regression that served a non-JSON bodied 404 when no bundle exists would not be caught here. The SPA-fallback and `/api` envelope behaviors are covered by the other three tests.
- **Required remediation**: None blocking. Optional hardening: assert `response.content == b""` and `"content-type" not in response.headers`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v4/IR-401 — repeat `configure_logging()` drops stamping | STILL OPEN | `settings.py` untouched since `5e6a9af`; carried forward as IR-501. |
| v4/IR-402 — TC-COMP-345's quantifier ranges over one record | STILL OPEN (narrowed) | Under M2, `test_api_request_id.py` alone now reports `1 failed, 5 passed`, where v4 saw `2 passed`. E1-S6's success-path function still passes. Carried forward as IR-502. |
| v4/IR-403 — `last_reworked_review` points at v2 | RESOLVED | `CAP-001-E1-S6-tasks.md:11` reads `last_reworked_review: CAP-001-E1-S6-implementation-review-v3.md`. |

## Scope and Plan Deviations

- **Shared-file re-review on `main`.** The review branch has no story commits of its own. The subject is E1-S6's delivered files as they exist on `main` at `41a9a9d`, with `review_base` kept at the story's original base (see the review-base note above).
- **Why the gate reopened.** The trigger, `tests/integration/test_api_static_mount.py`, was changed by an expedited change that passed its own review. `pipeline-state.py`'s `covered_elsewhere` only counts story implementation reviews under `docs/capabilities/`, so it could not see that coverage. This re-review closes the gap for this story. The harness behavior itself is out of scope here and is recorded as a follow-up.
- **DAC-E1-S6-3's end condition has occurred.** E7-S3 now populates `most_recent_run`. The criterion is read as satisfied: `null` when no run exists, a populated object once E7-S3's behavior applies.
- **Story `status: docs-sync`, task file `status: in-progress`.** This is the same inconsistency v2–v4 accepted. It is not raised again.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Docs were synced at `d6be516`, and the only change in E1-S6's scope since v4 is test-fixture isolation, which documents no behavior. Doc sync is expected to confirm no doc changes and set `docs_synced_review: CAP-001-E1-S6-implementation-review-v5.md`. Moving the story to `done` still waits for capability automation review.
- **Warnings accepted downstream**: IR-501 (LOW, latent `settings.py` asymmetry, arguably E1-S3's), IR-502 (LOW, success-path quantifier, now narrowed), IR-503 (LOW, vacuous content-type assertion). None blocks the gate.
