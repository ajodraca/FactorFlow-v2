---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S7-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-14
updated: 2026-10-14
story_id: "CAP-001-E1-S7"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S7.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-14T14:16:38Z"
reviewed_head: "c384cfaf7b30f7c03ef9c5476204778d8c29bd82"
review_base: "9696b74b60b17350fc85953acfd9944629ab3ddf"
reviewed_state_revision: "sha256:88822e99b0352babd5f9e3a44657e59c8adba42e4bc7fe598cf20fc6a862205b"
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
  timestamp: 2026-10-14T14:16:38Z
  source_artifacts:
    - id: CAP-001-E1-S7
      version: "2 (sha256:78a849e2b9256cebc67cdde178f05c45e93e97bcfadf8dab734bc24ed19e999f)"
    - id: CAP-001-E1-S7-tasks
      version: "1 (sha256:2182f90846f5a3b892e8f495239898e12da725d9a6f37b33ca13c3ec8598dcee)"
    - id: CAP-001-E1-S7-tdd-evidence
      version: "1"
    - id: CAP-001-E1-S7-implementation-review
      version: "1"
    - id: CAP-001-component-design-ingestion-api
      version: "8"
    - id: CAP-001-component-tests
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S7 — Version 2

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
| IR-001 | LOW | `app_main.build_server(port=...)` builds a server whose allowed hosts follow `ApiSettings.port`, so a diverging override refuses every request (carried from v1) |

Version 1 reviewed the story branch tip `89b8c8c`. That tip was merged into `main` by PR #113 (`565b7ba`) after CAP-001-E1-S8 (PR #112). The pipeline state check then reported the v1 review stale. S8 had rewritten database-URL placeholders in 14 of the test modules this story also edits, and no passing review covers S8's changes.

This version reviews the story as merged: base `9696b74` (`main` immediately before #113, its first parent) through `c384cfa` (`565b7ba` plus the v1 report).

1. **Same code change.** The production and test lines #113 adds and removes relative to `main` are identical to those reviewed in v1. Both sorted `-U0` digests are `ab93446…` over `src` and `tests`.
2. **No new lines from the merge.** `git show --cc 565b7ba` shows that the merge combined S8's placeholder lines with this story's `base_url` lines in the 14 shared modules. It introduced no line absent from both parents.
3. **Core files unchanged.** `src/factorflow/api/app.py`, `src/factorflow/app_main.py`, `tests/unit/test_api_host_origin.py` and `tests/unit/test_release_excludes_test_paths.py` are byte-identical to the reviewed tip.

Every required command passed again on the merged state:
- `uv run pytest`: 1031 passed, including S8's tests and the PostgreSQL-marked tests
- `npm run test:e2e`: 18 passed
- the same mutation checks: a no-op middleware fails 19 of 28 tests, and registering it outside the request-id middleware fails 1

IR-001 is unchanged and remains open as a LOW warning.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S7.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S7-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S7-review` (branched from `origin/main` at `565b7ba`; PR #114) |
| HEAD | `c384cfaf7b30f7c03ef9c5476204778d8c29bd82` |
| Review base | `--base-ref 9696b74` (first parent of the #113 merge, `main` with E1-S8 merged): `9696b74b60b17350fc85953acfd9944629ab3ddf` |
| Working tree | clean (no staged, unstaged or untracked non-ignored files) before and after validation |
| Changed files reviewed | 23 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/app.py` | modified | DAC-E1-18, DAC-E1-S7-1 to S7-5, AC-14; T013 |
| `tests/unit/test_api_host_origin.py` | added | DAC-E1-S7-1 to S7-5; T003–T008, T011 |
| `tests/unit/test_release_excludes_test_paths.py` | modified | DAC-E1-S7-6; T009, T010, T012 |
| `tests/integration/test_api_coverage.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/integration/test_api_health.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/integration/test_api_instruments.py` | modified | Story Description; T001 |
| `tests/integration/test_api_pagination.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/integration/test_api_runs.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/integration/test_api_settings.py` | modified | Story Description; T001 |
| `tests/integration/test_api_static_mount.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/unit/test_api_coverage_routes.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/unit/test_api_errors.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/unit/test_api_instruments_error_mapping.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/unit/test_api_instruments_query_mapping.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/unit/test_api_no_secrets.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/unit/test_api_request_id.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/unit/test_api_request_id_redaction_composition.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/unit/test_api_runs_routes.py` | modified | Story Description; T001 (merged beside S8's placeholder change) |
| `tests/integration/test_api_binding.py` | modified | DAC-E1-S7-1; T014 — deviation recorded in the TDD evidence (merged beside S8's change) |
| `docs/.../stories/CAP-001-E1-S7.md` | modified | Status to `in-review`; T014–T016 |
| `docs/.../stories/CAP-001-E1-S7-tasks.md` | modified | Task ticks; T001–T016 |
| `docs/.../stories/CAP-001-E1-S7-tdd-evidence.yaml` | added | T016 |
| `docs/.../stories/CAP-001-E1-S7-implementation-review-v1.md` | added | Prior gate evidence (commit `c384cfa`) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-14 | SATISFIED | `src/factorflow/api/app.py:_add_host_origin_middleware` (allowed hosts are the three loopback names on `ApiSettings.port`), called from `create_app()` line 463 | `tests/unit/test_api_host_origin.py` (all); `tests/integration/test_api_binding.py:test_server_binds_to_loopback_only`; `npm run test:e2e` | Unchanged since v1; re-validated on the merged state. |
| DAC-E1-18 | SATISFIED | `app.py:host_origin_middleware` — `400 host_not_allowed` / `403 origin_not_allowed` via `error_response`, without `call_next` | TC-COMP-390 and TC-COMP-401–407 tests | Host check precedes the Origin check. |
| DAC-E1-S7-1 | SATISFIED | `allowed_hosts` frozenset on `ApiSettings.port`; `host is None or host.lower() not in allowed_hosts` | `test_the_three_loopback_hosts_pass`, `test_a_foreign_or_wrong_port_host_is_refused`, `test_a_missing_host_is_refused`, `test_the_allowed_hosts_follow_the_configured_port` | `/api/health` and `/` both covered; spy, pool double and static marker prove nothing downstream ran. |
| DAC-E1-S7-2 | SATISFIED | Non-safe method with an `Origin` outside `allowed_origins` → 403 | `test_a_foreign_or_null_origin_is_refused_on_every_state_changing_route` (5 routes × 2 origins) | `null` refused. |
| DAC-E1-S7-3 | SATISFIED | Absent `Origin` and safe methods skip the check | `test_no_origin_or_a_loopback_origin_is_not_refused`, `test_a_get_with_a_foreign_origin_is_not_refused` | Handler reached in each case. |
| DAC-E1-S7-4 | SATISFIED | `log.warning(..., %r, request_id)`; request id from the outer request-id middleware; no body read | `test_a_refusal_is_logged_at_warning_with_the_request_id_and_the_header` | Ordering mutant fails this test on the merged state too. |
| DAC-E1-S7-5 | SATISFIED | Same 403 path; `call_next` not invoked | `test_a_refused_run_start_creates_no_run` | `pool.calls == []`. |
| DAC-E1-S7-6 | SATISFIED | n/a (test code): `tests/unit/test_release_excludes_test_paths.py:_http_scheme_offenders` exempts the three parts only in `api/app.py` | TC-COMP-364/408, TC-COMP-409, path-keyed test | The only `http://` constant in `src/factorflow` remains `api/app.py:270`. S8's migration move adds none. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | 15 listed modules pass `base_url="http://127.0.0.1:8000"`; in the 14 shared with S8 the merged line keeps S8's `postgresql://unused@127.0.0.1/unused` placeholder beside it | No `TestClient(` construction under `tests/` lacks `base_url`. |
| T002 | complete | VERIFIED | TDD evidence baseline: 934 passed after T001 at `2f985e4` | Historical baseline; not re-run. |
| T003 | complete | VERIFIED | TC-COMP-390 test | Unchanged since v1. |
| T004 | complete | VERIFIED | TC-COMP-401, TC-COMP-402 tests | Unchanged since v1. |
| T005 | complete | VERIFIED | TC-COMP-403 test | Unchanged since v1. |
| T006 | complete | VERIFIED | TC-COMP-404, TC-COMP-405 tests | Unchanged since v1. |
| T007 | complete | VERIFIED | TC-COMP-406 test | Unchanged since v1. |
| T008 | complete | VERIFIED | TC-COMP-407 test | Unchanged since v1. |
| T009 | complete | VERIFIED | TC-COMP-408 marker; TC-COMP-409 test; `_http_scheme_offenders(package_root)` | Unchanged since v1. |
| T010 | complete | VERIFIED | `test_the_exemption_is_keyed_on_the_path_not_the_file_name` | Unchanged since v1. |
| T011 | complete | VERIFIED | `test_the_allowed_hosts_follow_the_configured_port` | Unchanged since v1. |
| T012 | complete | VERIFIED | Narrowed guard and module docstring | Unchanged since v1. |
| T013 | complete | VERIFIED | `app.py:246` `_add_host_origin_middleware`, registered at line 463 before `_add_request_id_middleware` | Byte-identical to the v1 subject. |
| T014 | complete | VERIFIED | Re-run on the merged state: `uv run pytest` 1031 passed, `npm run test:e2e` 18 passed | — |
| T015 | complete | VERIFIED | Re-run: ruff check, ruff format --check, mypy src clean | — |
| T016 | complete | VERIFIED | `CAP-001-E1-S7-tdd-evidence.yaml`: two APPROVED, drift-free cycles naming `ee7180d` and `7511706` | Both commits are in this branch's history. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_loopback_host_and_own_origin_are_served_normally` / TC-COMP-390 | ADEQUATE | Normal health body, static marker on `/`, `201` with the normalised symbol | none |
| `test_the_three_loopback_hosts_pass` / TC-COMP-401 | ADEQUATE | Exact `200` with the health body for each host | none |
| `test_a_foreign_or_wrong_port_host_is_refused`, `test_a_missing_host_is_refused` / TC-COMP-402 | ADEQUATE | `400` and code; no handler or static file ran; missing Host via raw ASGI | none |
| `test_a_foreign_or_null_origin_is_refused_on_every_state_changing_route` / TC-COMP-403 | ADEQUATE | Five routes × two origins; status, code, no pool use | none |
| `test_no_origin_or_a_loopback_origin_is_not_refused` / TC-COMP-404 | ADEQUATE | Handler reached for no Origin and each loopback origin | none |
| `test_a_get_with_a_foreign_origin_is_not_refused` / TC-COMP-405 | ADEQUATE | Normal health response, one handler call | HEAD/OPTIONS not exercised; exempt through the same set (spec edge case) |
| `test_a_refusal_is_logged_at_warning_with_the_request_id_and_the_header` / TC-COMP-406 | ADEQUATE | One warning per refusal with value and id; ids agree; no body or key logged | none |
| `test_a_refused_run_start_creates_no_run` / TC-COMP-407 | ADEQUATE | 403 and no pool use | none |
| `test_release_source_accepts_no_http_scheme` / TC-COMP-364, TC-COMP-408 | ADEQUATE | Real `src/factorflow` scan passes on the merged tree, including S8's moved `db/migrations` package | none |
| `test_the_exemption_admits_only_the_three_forms_in_api_app` / TC-COMP-409 | ADEQUATE | Exact offender counts over five synthetic trees | none |
| `test_the_exemption_is_keyed_on_the_path_not_the_file_name` (T010) | ADEQUATE | `ingestion/app.py` is not exempt | none |
| `test_the_allowed_hosts_follow_the_configured_port` (T011) | ADEQUATE | 8123 accepted, 8000 refused | none |

Regression sensitivity was re-checked on the merged state with in-memory mutants run from a script outside the repository, with no files modified. A no-op middleware fails 19 of 28 tests, and the request-id-inside ordering fails 1 (TC-COMP-406). In the 14 shared modules, S8's placeholder lines change no assertion of this story's tests.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras --reinstall` | branch worktree at `c384cfa` | 0 | PASS | Reinstall needed after the worktree was moved: script shebangs in the git-ignored `.venv` held the old path |
| `uv run ruff check .` | branch worktree | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | branch worktree | 0 | PASS | 190 files already formatted |
| `uv run mypy src` | branch worktree | 0 | PASS | No issues in 47 source files |
| `uv run pytest tests/unit/test_api_host_origin.py tests/unit/test_release_excludes_test_paths.py -q` | branch worktree | 0 | PASS | 34 passed |
| `uv run pytest -m 'not postgres' -q` | branch worktree | 0 | PASS | 757 passed, 274 deselected |
| `uv run pytest -q` | branch worktree | 0 | PASS | 1031 passed (PostgreSQL-marked included; Docker 28.3.2) |
| `npm ci` | branch worktree | 0 | PASS | — |
| `npm run build` | branch worktree | 0 | PASS | Bundle to the git-ignored `src/factorflow/api/static/` |
| `npm run test:e2e` | branch worktree | 0 | PASS | 18 passed (2.9m) |
| `uv build --out-dir /tmp/ir-e1s7-dist` | branch worktree | 0 | PASS | Built outside the repository, then removed |
| `grep -rn "TestClient(" tests \| grep -v base_url` | branch worktree | 0 | PASS | Only the multi-line call at `test_api_request_id.py:92` and a docstring |

### Validation Side Effects

- Before: `git status --porcelain` empty; state revision `sha256:88822e99…205b` (absolute `--repo-dir`).
- After: `git status --porcelain` empty; state revision unchanged. Only ignored artefacts were touched (`.venv`, `node_modules`, the frontend bundle, `__pycache__`).
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — `build_server(port=...)` now builds a server that refuses every request

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S7-1
- **Tasks**: T013
- **Files**: `src/factorflow/app_main.py:13` (`app = create_app()` at import), `src/factorflow/app_main.py:build_server`; `tests/integration/test_api_binding.py:78-84`
- **Claim challenged**: `build_server`'s docstring says "`port` overrides `ApiSettings.port` when given".
- **Observed evidence**: Unchanged from v1. The module-level `app` fixes its allowed hosts from `ApiSettings().port` at import, so a server built with a different `port` answers every request `400 host_not_allowed`. The binding test works around this, and production `main()` passes no override.
- **Expected evidence/behavior**: Ingestion-api section 2.5a: `<port>` is `ApiSettings.port`.
- **Impact**: Latent; the only caller is a test that compensates.
- **Required remediation**: In a later change, make the override and the allowed hosts agree, or document that `port` must equal `ApiSettings.port`. Not blocking.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | STILL OPEN | `src/factorflow/app_main.py` is byte-identical to `89b8c8c` (`git diff 89b8c8c HEAD -- src/factorflow/app_main.py` is empty) |

## Scope and Plan Deviations

- Reason for this version: v1's subject (`89b8c8c`) and the merged code differ in 14 test modules, and only because of the #113 merge combining S7's lines with E1-S8's. The derived state check therefore reported v1 stale. This review takes the merged state as its subject. It does not review E1-S8's own changes, which still need their own implementation review. That review would be required for S8 regardless of this story.
- `tests/integration/test_api_binding.py` is outside the plan's file list. The deviation is recorded in the TDD evidence and justified, as in v1.
- TC-COMP-403 and TC-COMP-407 use the `app.state.db_pool` recording double, which is justified as in v1.
- The guard exemption accepts the three string parts anywhere in `api/app.py`, as T012 and TC-COMP-409 specify. They are used only in `allowed_origins` (`app.py:270`).
- The tasks file remains `status: draft`; no gate in this phase reads it.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-001-E1-S7 on `usr/alvaro-de-jodra/CAP-001-E1-S7-review` (PR #114). Separately, run `$adversarial-review` for CAP-001-E1-S8, which is merged and unreviewed.
- **Warnings accepted downstream**: IR-001
