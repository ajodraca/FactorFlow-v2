---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S7-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-14
updated: 2026-10-14
story_id: "CAP-001-E1-S7"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S7.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-14T13:16:38Z"
reviewed_head: "89b8c8c564472c4c229706715204dabbe18fdeac"
review_base: "73b1ea5c58544c9359ec778db1cbdccd5f23096c"
reviewed_state_revision: "sha256:888b9abd0ffbfc637e1a5718f842a89fa84d9c31a583e0dea8061c6c1062709f"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E1-S7
    artifact_version: 2
    content_revision: sha256:78a849e2b9256cebc67cdde178f05c45e93e97bcfadf8dab734bc24ed19e999f
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5-medium
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-14T13:16:38Z
  source_artifacts:
    - id: CAP-001-E1-S7
      version: "2 (sha256:78a849e2b9256cebc67cdde178f05c45e93e97bcfadf8dab734bc24ed19e999f)"
    - id: CAP-001-E1-S7-tasks
      version: "1 (sha256:2182f90846f5a3b892e8f495239898e12da725d9a6f37b33ca13c3ec8598dcee)"
    - id: CAP-001-E1-S7-tdd-evidence
      version: "1"
    - id: CAP-001-component-design-ingestion-api
      version: "8"
    - id: CAP-001-component-tests
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S7 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 12/12 passed |

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · **total 1**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | LOW | `app_main.build_server(port=...)` builds a server whose allowed hosts follow `ApiSettings.port`, so a diverging override refuses every request |

The middleware in `src/factorflow/api/app.py` implements both checks of ingestion-api section 2.5a: exact allowed sets derived from `ApiSettings.port`, a lower-cased `Host`, `null` Origin refused, safe methods exempt, and no body read. It is registered inside the request-id middleware, so every refusal carries the request id. The release-source guard is narrowed to exactly the three string parts in `api/app.py` and nothing else.

Independent mutation runs confirm the new tests detect the defects they target. Removing the middleware fails 19 of 28 tests. Registering it outside the request-id middleware fails TC-COMP-406.

Every required command passed: lint, format, types, the `not postgres` suite, the full suite (964 passed, PostgreSQL included), `npm run test:e2e` (18 passed) and `uv build`. The one finding is a LOW latent hazard in `app_main.build_server(port=...)`, whose override no longer yields a usable server.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S7.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S7-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | detached HEAD at the tip of `usr/alvaro-de-jodra/CAP-001-E1-S7` (local and `origin` agree), reviewed in a separate worktree; merged to `main` by PR #113 (`565b7ba`) |
| HEAD | `89b8c8c564472c4c229706715204dabbe18fdeac` |
| Review base | `--base-ref 73b1ea5` (`usr/alvaro-de-jodra/CAP-001-stories`, the merge base with both `main` before PR #113 and CAP-001-E1-S8): `73b1ea5c58544c9359ec778db1cbdccd5f23096c` |
| Working tree | clean (no staged, unstaged or untracked non-ignored files) before and after validation |
| Changed files reviewed | 22 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/app.py` | modified | DAC-E1-18, DAC-E1-S7-1 to S7-5, AC-14; T013 |
| `tests/unit/test_api_host_origin.py` | added | DAC-E1-S7-1 to S7-5; T003–T008, T011 |
| `tests/unit/test_release_excludes_test_paths.py` | modified | DAC-E1-S7-6; T009, T010, T012 |
| `tests/integration/test_api_coverage.py` | modified | Story Description; T001 |
| `tests/integration/test_api_health.py` | modified | Story Description; T001 |
| `tests/integration/test_api_instruments.py` | modified | Story Description; T001 |
| `tests/integration/test_api_pagination.py` | modified | Story Description; T001 |
| `tests/integration/test_api_runs.py` | modified | Story Description; T001 |
| `tests/integration/test_api_settings.py` | modified | Story Description; T001 |
| `tests/integration/test_api_static_mount.py` | modified | Story Description; T001 |
| `tests/unit/test_api_coverage_routes.py` | modified | Story Description; T001 |
| `tests/unit/test_api_errors.py` | modified | Story Description; T001 |
| `tests/unit/test_api_instruments_error_mapping.py` | modified | Story Description; T001 |
| `tests/unit/test_api_instruments_query_mapping.py` | modified | Story Description; T001 |
| `tests/unit/test_api_no_secrets.py` | modified | Story Description; T001 |
| `tests/unit/test_api_request_id.py` | modified | Story Description; T001 |
| `tests/unit/test_api_request_id_redaction_composition.py` | modified | Story Description; T001 |
| `tests/unit/test_api_runs_routes.py` | modified | Story Description; T001 |
| `tests/integration/test_api_binding.py` | modified | DAC-E1-S7-1 (allowed hosts follow `ApiSettings.port`); T014 — deviation recorded in the TDD evidence (see Scope and Plan Deviations) |
| `docs/.../stories/CAP-001-E1-S7.md` | modified | Status to `in-review`; T014–T016 |
| `docs/.../stories/CAP-001-E1-S7-tasks.md` | modified | Task ticks; T001–T016 |
| `docs/.../stories/CAP-001-E1-S7-tdd-evidence.yaml` | added | T016 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-14 | SATISFIED | `src/factorflow/api/app.py:_add_host_origin_middleware` (allowed hosts are the three loopback names on `ApiSettings.port`), called from `create_app()` line 463 | `tests/unit/test_api_host_origin.py` (all); `tests/integration/test_api_binding.py:test_server_binds_to_loopback_only`; `npm run test:e2e` | Requests naming any non-loopback host are refused; the loopback binding itself is unchanged and its test still passes. |
| DAC-E1-18 | SATISFIED | `app.py:host_origin_middleware` — `400 host_not_allowed` for a missing or foreign `Host`, `403 origin_not_allowed` for a foreign `Origin` on a non-safe method, both via `error_response` without `call_next` | `test_loopback_host_and_own_origin_are_served_normally` (TC-COMP-390), plus TC-COMP-401–407 tests | Host check runs before the Origin check, as the API contract requires. |
| DAC-E1-S7-1 | SATISFIED | `allowed_hosts` frozenset of `127.0.0.1:<port>`, `localhost:<port>`, `[::1]:<port>`; `host is None or host.lower() not in allowed_hosts` | `test_the_three_loopback_hosts_pass`, `test_a_foreign_or_wrong_port_host_is_refused`, `test_a_missing_host_is_refused` (hand-built ASGI scope), `test_the_allowed_hosts_follow_the_configured_port` | Both `/api/health` and `/` covered; health spy, pool double and static marker each prove nothing downstream ran. |
| DAC-E1-S7-2 | SATISFIED | `request.method not in _SAFE_METHODS and origin is not None and origin not in allowed_origins` → 403 | `test_a_foreign_or_null_origin_is_refused_on_every_state_changing_route` (5 routes × 2 origins) | `null` is not in the allowed set, so it is refused. A 403 with `origin_not_allowed` can only come from the middleware, which returns before `call_next`; `pool.calls == []` corroborates. |
| DAC-E1-S7-3 | SATISFIED | Absent `Origin` and safe methods skip the check | `test_no_origin_or_a_loopback_origin_is_not_refused` (4 cases, handler reached: `len(pool.calls) == 1`), `test_a_get_with_a_foreign_origin_is_not_refused` | — |
| DAC-E1-S7-4 | SATISFIED | `log.warning(..., %r, request_id)` on each refusal; `request.state.request_id` set by the outer request-id middleware; no body or setting read except the port | `test_a_refusal_is_logged_at_warning_with_the_request_id_and_the_header` | Response `X-Request-Id` and envelope `request_id` equal the logged id. A body marker and a distinctive API key are absent from every record. The ordering mutant (request-id inside) fails this test. |
| DAC-E1-S7-5 | SATISFIED | Same 403 path; `call_next` not invoked | `test_a_refused_run_start_creates_no_run` | The run-creation path needs a pool connection; `pool.calls == []` proves no run could be written. |
| DAC-E1-S7-6 | SATISFIED | n/a (test code): `tests/unit/test_release_excludes_test_paths.py:_http_scheme_offenders` exempts `_ORIGIN_ALLOW_LIST_PARTS` only when `path.relative_to(package_root) == api/app.py` | `test_release_source_accepts_no_http_scheme` (TC-COMP-364/408), `test_the_exemption_admits_only_the_three_forms_in_api_app` (TC-COMP-409), `test_the_exemption_is_keyed_on_the_path_not_the_file_name` | Comparison and literal checks for `"http"` stay unconditional. The only `http://` constant left in `src/factorflow` is the allow-list on `api/app.py:270`, with no indirection. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | 15 listed modules pass `base_url="http://127.0.0.1:8000"` (commit `2f985e4`) | No `TestClient(` construction under `tests/` lacks `base_url` (the only grep hit without it on the same line is a multi-line call and a docstring). |
| T002 | complete | VERIFIED | TDD evidence baseline: 934 passed after T001 | Baseline recorded against `73b1ea5`; not re-run at that commit by this review. |
| T003 | complete | VERIFIED | `test_loopback_host_and_own_origin_are_served_normally` (`# Implements TC-COMP-390`) | Covers `/api/health`, `/` and `POST /api/instruments` with `add_symbols` stubbed. |
| T004 | complete | VERIFIED | TC-COMP-401 and TC-COMP-402 tests; `_asgi_get_without_host` | Missing-Host case uses a hand-built scope, as the plan anticipates. |
| T005 | complete | VERIFIED | TC-COMP-403 test, 10 parametrised cases | Recording double is `app.state.db_pool`, not per-route service overrides. This is acceptable because every handler opens a connection, and the 403 status independently proves refusal. |
| T006 | complete | VERIFIED | TC-COMP-404 and TC-COMP-405 tests | — |
| T007 | complete | VERIFIED | TC-COMP-406 test | — |
| T008 | complete | VERIFIED | TC-COMP-407 test | Double is the pool that run creation must use; see T005 note. |
| T009 | complete | VERIFIED | TC-COMP-408 marker on `test_release_source_accepts_no_http_scheme`; TC-COMP-409 test over five synthetic trees; scan refactored into `_http_scheme_offenders(package_root)` | — |
| T010 | complete | VERIFIED | `test_the_exemption_is_keyed_on_the_path_not_the_file_name` | — |
| T011 | complete | VERIFIED | `test_the_allowed_hosts_follow_the_configured_port` (port 8123) | — |
| T012 | complete | VERIFIED | `_ORIGIN_ALLOW_LIST_MODULE`, `_ORIGIN_ALLOW_LIST_PARTS`, module docstring cites DAC-E1-S7-6 and section 2.5a | `_source_trees()` is kept for the imports test and is not dead code. |
| T013 | complete | VERIFIED | `app.py:246` `_add_host_origin_middleware`, registered at line 463 before `_add_request_id_middleware` | Matches every bullet of T013. The docstring cites section 2.5a, H9, DAC-E1-18 and S7-1 to S7-5. |
| T014 | complete | VERIFIED | Re-run by this review: `uv run pytest` 964 passed, `npm run test:e2e` 18 passed | Allowed sets were not widened. |
| T015 | complete | VERIFIED | Re-run: ruff check, ruff format --check, mypy src all clean | — |
| T016 | complete | VERIFIED | `CAP-001-E1-S7-tdd-evidence.yaml`: two cycles, each `code_review_verdict: APPROVED`, `drift_detected: false`, `tests_executed: true`, `diff_sha256`, and a `commit_hash` naming commits `ee7180d` and `7511706` | Cycle 2's RED claim (19 of 28 fail without the middleware) is independently reproduced. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_loopback_host_and_own_origin_are_served_normally` / TC-COMP-390 | ADEQUATE | Asserts health's normal body, the static marker on `/`, and `201` with the normalised symbol from the real route over a stubbed service | none |
| `test_the_three_loopback_hosts_pass` / TC-COMP-401 | ADEQUATE | Exact `200` with the health body for each host (stronger than the spec's "not 400") | none |
| `test_a_foreign_or_wrong_port_host_is_refused`, `test_a_missing_host_is_refused` / TC-COMP-402 | ADEQUATE | `400` and envelope code; health spy, pool and static marker each prove no handler or static file ran; missing Host is exercised via raw ASGI | none |
| `test_a_foreign_or_null_origin_is_refused_on_every_state_changing_route` / TC-COMP-403 | ADEQUATE | All five routes × `https://evil.example` and `null`; status, code, no pool use | none |
| `test_no_origin_or_a_loopback_origin_is_not_refused` / TC-COMP-404 | ADEQUATE | Handler reached (exactly one pool call) for no Origin and each loopback origin | none |
| `test_a_get_with_a_foreign_origin_is_not_refused` / TC-COMP-405 | ADEQUATE | Normal health response and one handler call | HEAD/OPTIONS not exercised; the spec lists them as an edge case covered "by the same rule", and the code exempts them via one shared set |
| `test_a_refusal_is_logged_at_warning_with_the_request_id_and_the_header` / TC-COMP-406 | ADEQUATE | One warning per refusal containing the rejected value and request id; header and envelope ids agree; no body or key in any record; ordering mutant fails it | none |
| `test_a_refused_run_start_creates_no_run` / TC-COMP-407 | ADEQUATE | 403 and no pool use on the run-creation route | none |
| `test_release_source_accepts_no_http_scheme` / TC-COMP-364, TC-COMP-408 | ADEQUATE | Real `src/factorflow` scan passes with the allow-list present | none |
| `test_the_exemption_admits_only_the_three_forms_in_api_app` / TC-COMP-409 | ADEQUATE | Exact offender counts for: forms in another module, a fourth URL in `api/app.py`, a comparison, and a listing in both modules | none |
| `test_the_exemption_is_keyed_on_the_path_not_the_file_name` (T010) | ADEQUATE | `ingestion/app.py` holding the forms yields three offenders | none |
| `test_the_allowed_hosts_follow_the_configured_port` (T011) | ADEQUATE | Port 8123 accepted, 8000 refused with `host_not_allowed` | none |

Regression sensitivity was checked by running the module against two in-memory mutants from a script outside the repository, with no files modified. A no-op middleware fails 19 of 28 tests. Registering the middleware outside the request-id middleware fails 1 test (TC-COMP-406). Tests are isolated: each builds its own app, `FACTORFLOW_API_PORT` and `_STATIC_DIR` are set per test through `monkeypatch`, and nothing touches the network or the database.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | review worktree at `89b8c8c` | 0 | PASS | — |
| `uv run ruff check .` | review worktree | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | review worktree | 0 | PASS | 185 files already formatted |
| `uv run mypy src` | review worktree | 0 | PASS | No issues in 47 source files |
| `uv run pytest tests/unit/test_api_host_origin.py tests/unit/test_release_excludes_test_paths.py -q` | review worktree | 0 | PASS | 34 passed; TC-COMP-390 and 401–409 present by marker |
| `uv run pytest -m 'not postgres' -q` | review worktree | 0 | PASS | 690 passed, 274 deselected |
| `uv run pytest -q` | review worktree | 0 | PASS | 964 passed (PostgreSQL-marked included; Docker 28.3.2) |
| `npm ci` | review worktree | 0 | PASS | — |
| `npm run build` | review worktree | 0 | PASS | Bundle written to the git-ignored `src/factorflow/api/static/` |
| `npm run test:e2e` | review worktree | 0 | PASS | 18 passed (2.9m); E2E origins pass the middleware |
| `uv build --out-dir /tmp/ir-e1s7-dist` | review worktree | 0 | PASS | sdist and wheel built outside the repository |
| `grep -rn "TestClient(" tests \| grep -v base_url` | review worktree | 0 | PASS | Only a multi-line call (`test_api_request_id.py:92`, `base_url` on the next line) and a docstring; none of the 15 modules constructs a client without it |

### Validation Side Effects

- Before: `git status --porcelain` empty; tracked tree identical to `89b8c8c`; state revision `sha256:888b9abd…709f`.
- After: `git status --porcelain` empty; state revision unchanged (`sha256:888b9abd…709f`). Only ignored artefacts were created (`.venv`, `node_modules`, the frontend bundle, `__pycache__`).
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — `build_server(port=...)` now builds a server that refuses every request

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S7-1
- **Tasks**: T013
- **Files**: `src/factorflow/app_main.py:13` (`app = create_app()` at import), `src/factorflow/app_main.py:build_server`; `tests/integration/test_api_binding.py:78-84`
- **Claim challenged**: `build_server`'s docstring says "`port` overrides `ApiSettings.port` when given".
- **Observed evidence**: The module-level `app` is built at import, and its allowed hosts are fixed from `ApiSettings().port`. A server built with any different `port` binds that port, but its middleware answers every request `400 host_not_allowed`. The binding test had to set `FACTORFLOW_API_PORT` and replace `app_main.app` to work around this. Production `main()` calls `build_server()` with no override, so production behaviour is correct.
- **Expected evidence/behavior**: Ingestion-api section 2.5a says `<port>` is `ApiSettings.port`, so a port override that diverges from it should not be offered as a working option.
- **Impact**: Latent. The only caller is a test that compensates. A future caller using the documented override would get a server that refuses everything, with no clear signal why.
- **Required remediation**: In a later change, make the override and the allowed hosts agree, or document in `build_server` that `port` must equal `ApiSettings.port`. Not blocking.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- `tests/integration/test_api_binding.py` is outside the plan's file list. It starts the real server on a free port, so it now sets `FACTORFLOW_API_PORT` to that port and rebuilds `app_main.app`. The deviation is recorded in the TDD evidence (cycle `host-origin-middleware`, `deviation`) and is necessary under section 2.5a. Justified.
- TC-COMP-403 and TC-COMP-407 use the `app.state.db_pool` recording double rather than per-route service doubles. Each state-changing handler and the run-creation path open a pool connection, and the 403 code independently proves the middleware answered. Justified.
- The guard exemption accepts the three string parts anywhere in `api/app.py` without checking how they are used. That is exactly what T012 and TC-COMP-409 specify, and TC-COMP-409 makes indirection a review concern. This review found the parts used only in `allowed_origins` (`app.py:270`). No action.
- The tasks file remains `status: draft` while its tasks are ticked. No gate in this phase reads that field (`pipeline-state.py check --stage adversarial-review` reported `READY`).
- The story branch was merged into `main` (PR #113, `565b7ba`) before this review. The review covers the branch tip `89b8c8c`, which is the second parent of that merge.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-001-E1-S7 on the reviewed implementation.
- **Warnings accepted downstream**: IR-001
