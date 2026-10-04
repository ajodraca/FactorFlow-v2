---
artifact_schema_version: 1
artifact_id: CAP-001-E7-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: adversarial-review-agent
owner_github: ajodraca
created: 2026-10-04
updated: 2026-10-04
story_id: "CAP-001-E7-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-04T22:36:38Z"
reviewed_head: "726607d5018d35e6401f4cf21f7b105b771b6b38"
review_base: "2c28d53493f43b311defea80a9bbcb95eba1a92e"
reviewed_state_revision: "sha256:6ceddb4d285540df66930e413fde522ab80b93d180c9d9a76e1a3f2d70a96749"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E7-S2
    artifact_version: 1
    content_revision: sha256:45946f5a1dde35839cf14f8fae030ea5f0cc813990b27d8952d9ef143a1459c1
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Devin
  tool_version: unknown
  timestamp: "2026-10-04T22:36:38Z"
  source_artifacts:
    - id: CAP-001-E7-S2
      version: "1"
    - id: CAP-001-E7-S2-tasks
      version: "1"
    - id: DEC-0009
      version: "1"
    - id: DEC-0010
      version: "1"
    - id: DEC-0011
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E7-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 12/12 verified |
| Required validation | 9/9 passed |

Every acceptance criterion traces to production code I read on this branch and to
tests whose assertions I checked line by line, and I reproduced the behaviour
independently through `TestClient` rather than trusting the task plan's claims.
The five gaps the plan set out to close are closed: the `500` body is exactly
`{"error": {"code": "internal_error", "request_id": …}}`, its log record and its
`X-Request-Id` header carry the request's id, framework `HTTPException`s now
return the shared envelope with a wording-independent code, an unmatched `/api`
path reports a resource, and a `422` names the offending field. I swept every
non-2xx path I could reach (`DELETE /api/health`, `POST /`, `GET /api`,
`PATCH /api/instruments`, `GET /api/acquisition-runs/not-a-uuid`, an unmatched
`/api` path, a raising probe route) and found one envelope with a non-empty
`resource` and a request id on all of them. I also attempted four credential
disclosure paths the tests do not cover — an unknown body key, a credential as a
`dict` key inside `symbols`, a credential as a top-level key, and a nested object
under `years` — and none reached the response body or any header.

The three provisional decisions the plan depends on (DEC-0009 framework HTTP
error code/message, DEC-0010 `resource` from `_resource_for_path`, DEC-0011
`loc`-only `422` field naming) are recorded under `projects/factorflow-v2/decisions/`
with `owner_reviewed: true` and `owner_verdict: upheld`, so the implementation
rests on settled ground rather than an unrecorded assumption.

All nine required validation commands pass, including the full `uv run pytest`
suite with PostgreSQL containers available (755 passed) — no test was skipped for
want of a container runtime. The two findings are LOW: a maintainability note on
the middleware's exception catch and a pre-existing docstring inaccuracy whose
blast radius this story widens. Neither blocks the gate.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S2-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E7-S2-run-20261004T220203Z` |
| HEAD | `726607d5018d35e6401f4cf21f7b105b771b6b38` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E7-integration-20261004T220203Z` → `2c28d53493f43b311defea80a9bbcb95eba1a92e` (verified ancestor of `HEAD` with `git merge-base --is-ancestor`) |
| Working tree | clean — `git status --porcelain --untracked-files=all` empty before and after validation |
| Commits in range | 20 (10 TDD-cycle commits plus their evidence commits) |
| Changed files reviewed | 7 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/errors.py` | modified | AC: DAC-E7-7, DAC-E7-S2-2, DAC-E7-S2-3; T009 |
| `src/factorflow/api/app.py` | modified | AC: AC-10, DAC-E7-5, DAC-E7-6, DAC-E7-S2-1, DAC-E7-S2-3, DAC-E7-S2-4, DAC-E7-S2-5; T010 |
| `tests/unit/test_api_errors.py` | modified (append only) | T002, T003, T005, T006, T007, T008, T011 |
| `tests/unit/test_api_request_id.py` | modified (append only) | T004 |
| `docs/.../stories/CAP-001-E7-S2-tasks.md` | modified | T001–T012 checkbox state only; no task text changed (verified by diff) |
| `docs/.../stories/CAP-001-E7-S2.md` | modified | `status: planning` → `in-review`; frontmatter only |
| `docs/.../stories/CAP-001-E7-S2-tdd-evidence.yaml` | added | T012 |

No production or test file outside the two modules the story names was touched.
I diffed the two existing test files and confirmed every pre-existing test body
is byte-identical; the new cases are appended, as T002–T008 required.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `app.py:_http_error_handler` (343–370), `app.py:_validation_error_handler` (295–319), `app.py:not_found_handler` (244–264), `errors.py:error_response` (43–73) | `test_api_errors.py::test_every_handled_error_returns_the_full_envelope` (6 params) | Operation (the request), resource and reason are all present on every non-2xx I could produce. The `500` exception is the one DAC-E7-7 states explicitly and the approved story restates; the plan's Resolved Conflict 2 reasons it out and I agree the two criteria are a rule and its stated exception, not a contradiction. |
| DAC-E7-5 | SATISFIED | same as AC-10, plus `app.py:384` registering `StarletteHTTPException` | `test_every_handled_error_returns_the_full_envelope`, `test_framework_error_resource_comes_from_the_path` | Independently swept `DELETE /api/health` → `405 method_not_allowed`/`health`, `PATCH /api/instruments` → `405`/`instruments`, `GET /api` and `/api/` → `404 not_found`/`api`, `POST /` → `405`/`request`. All four fields non-empty; no top-level `detail` anywhere. |
| DAC-E7-6 | SATISFIED | `app.py:227–228` (handle the exception while `_request_id_var` is bound) + `errors.py:86–88` (`extra={"request_id": …}`) | `test_api_request_id.py::test_error_request_id_is_in_every_component_log_record` (500/404/422) | The test loops over *every* `factorflow.api*` record rather than asserting "some record", and separately requires the `unhandled exception during request handling` record by name, so a record emitted unstamped fails it. |
| DAC-E7-7 | SATISFIED | `errors.py:89–92` returns `JSONResponse` with exactly `{"error": {"code", "request_id"}}` | `test_api_errors.py::test_500_body_is_only_the_internal_error_code_and_request_id` | Asserted by whole-body equality, not key presence, so re-adding `message` or `resource` fails. Driver detail proven present in the `ERROR` record via `logging.Formatter().format(record)`. |
| DAC-E7-S2-1 | SATISFIED | `app.py:356–360` derives the code from `HTTPStatus(...).phrase`, never `exc.detail` | `test_handled_error_codes_are_literal_snake_case` (6 params), `test_internal_error_code_is_literal_snake_case`, `test_framework_http_error_code_does_not_change_with_detail_wording`, `test_status_outside_http_status_yields_http_error` | Two `HTTPException(405)`s with different detail text return the identical code. I checked the regex `^[a-z][a-z0-9]*(_[a-z0-9]+)*$` against the derivation: no HTTP reason phrase starts with a digit and `re.sub` + `strip("_")` cannot emit a leading or doubled underscore. |
| DAC-E7-S2-2 | SATISFIED | `errors.py:89–92` | `test_500_body_is_only_the_internal_error_code_and_request_id` | Body is checked for absence of `Traceback`, `RuntimeError`, `psycopg`, `5432` *and* for exact equality, so nothing can be added later without failing. |
| DAC-E7-S2-3 | SATISFIED | `app.py:224–231` (header set after the `finally`, on the error path too), `errors.py:86–88` | `test_error_request_id_is_in_every_component_log_record`, `test_internal_error_handler_stamps_the_record_without_a_bound_id` | The second test exercises the handler with no bound `ContextVar`, which is the only probe that can distinguish the `extra=` stamp from `_stamped_handle`'s. Without it the `extra=` line would be unkillable; its presence is the correct answer to that masking. |
| DAC-E7-S2-4 | SATISFIED | `app.py:364` (fixed message, never `exc.detail`), `app.py:325–340` (`loc` only; `input`/`ctx`/`msg` never read) | `test_raised_credential_never_reaches_the_response` (2 params), `test_submitted_credential_never_reaches_a_validation_error` (2 params), `test_framework_error_message_is_built_from_the_phrase_not_the_detail` | Tests check `response.text` **and every response header value**. I added four adversarial cases of my own (credential as an unknown body key, as a `dict` key under `symbols`, as a top-level key, and as a nested object under `years`): none leaked, because the request models do not set `extra="forbid"` so unknown keys never enter `loc`, and container `loc` entries are indices. |
| DAC-E7-S2-5 | SATISFIED | `app.py:307–318` | `test_validation_error_uses_the_envelope_and_names_the_field` (3 params) | Envelope, `validation_error` code, `_resource_for_path` resource and the backticked field name are all asserted. I confirmed `GET /api/acquisition-runs/not-a-uuid` yields ``…shape: `run_id`.`` with `resource: acquisition-run`, i.e. the path-parameter prefix is stripped as DEC-0011 adopted. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `CAP-001-E7-S2-tdd-evidence.yaml` `baseline:` block names every seam and the 27-passing baseline at `2c28d53` | A pre-edit observation cannot be re-run after the fact, but every seam it names (`ErrorDetail`, `ErrorEnvelope`, `error_response`, `internal_error_handler`, `_request_id_var`, `_install_request_id_patch`, `_add_request_id_middleware`, `not_found_handler`, `_VALIDATION_ERROR_RESOURCES`, `_resource_for_path`, `_validation_error_handler`, both `add_exception_handler` calls) exists in the base commit's files and the base-commit test files are unmodified, which corroborates it. |
| T002 | complete | VERIFIED | `test_api_errors.py:_ENVELOPE_MATRIX` + `test_every_handled_error_returns_the_full_envelope` | All six planned cases present with both `# Implements TC-COMP-070` and `# Implements TC-COMP-010`. Asserts `list(payload) == ["error"]`, no `detail`, four non-empty string fields, `state` absent, and body id == header id. |
| T003 | complete | VERIFIED | `test_500_body_is_only_the_internal_error_code_and_request_id`; probe inserted via `app.router.routes[0:0]` | TC-COMP-072/084 comments present. The log assertion was corrected during T010 (recorded as `test_correction` in the evidence file) because the redaction patch clears `exc_info` and pre-formats `exc_text`; reading the formatted record proves the same property through the real redaction path, so this is a mechanism fix, not a weakening. I verified the corrected assertion is non-vacuous by confirming it reads `logging.Formatter().format(r)` of a real `ERROR` record. |
| T004 | complete | VERIFIED | `test_api_request_id.py::probe_client`, `test_error_request_id_is_in_every_component_log_record`, `test_two_error_requests_get_different_request_ids` | TC-COMP-071/085 comments present. Deviation: a sibling `probe_client` fixture instead of reusing `client`, because a raising probe needs `raise_server_exceptions=False`. Justified and recorded; both pre-existing tests are unchanged. |
| T005 | complete | VERIFIED | `_SNAKE_CASE` regex plus three tests | TC-COMP-083 comment on all three. Two separate probe apps instead of two routes in one app — behaviourally equivalent and recorded. |
| T006 | complete | VERIFIED | `test_raised_credential_never_reaches_the_response`, `test_submitted_credential_never_reaches_a_validation_error` | TC-COMP-086 and TC-COMP-069 comments present. All four planned cases (a)–(d) implemented; the T006 review nit (loose `>= 400` status) was tightened to exact `500`/`400` in the T011 cycle, which I confirmed in the committed code. |
| T007 | complete | VERIFIED | `test_validation_error_uses_the_envelope_and_names_the_field` | TC-COMP-087 comment present; all three planned cases with the planned resources (`settings`, `settings`, `acquisition-run`) and fields (`years`, `body`, `limit`). |
| T008 | complete | VERIFIED | `test_405_keeps_the_allow_header`, `test_raised_404_still_goes_through_the_not_found_handler`, `test_status_outside_http_status_yields_http_error`, `test_framework_error_message_is_built_from_the_phrase_not_the_detail`, `test_framework_error_resource_comes_from_the_path` | All five planned bullets covered. Deviation on the `Allow` bullet: `DELETE /api/health` is answered by the `StaticFiles` mount, whose `HTTPException(405)` carries no headers, so `Allow` is supplied by a probe instead. Documented in the test docstring and the evidence file; see IR-002. `tests/integration/test_api_static_mount.py` is unchanged, as required. |
| T009 | complete | VERIFIED | `errors.py:76–92` | Body reduced exactly as planned; `extra={"request_id": …}` added and `None`-guarded; `ErrorDetail`, `ErrorEnvelope` and `error_response` signatures and the `state`/`resource` behaviour untouched (confirmed by diff); module and handler docstrings cite CAP-001-E7-S2, DAC-E7-7 and DAC-E7-S2-3. |
| T010 | complete | VERIFIED | `app.py:218–232`, `243–254`, `295–340`, `343–370`, `373–384` | All five sub-bullets implemented: middleware catch with the `finally` reset retained and the header set on every response; `_http_error_handler` registered for `StarletteHTTPException` with the `404` status handler keeping precedence (proven empirically by `test_raised_404_still_goes_through_the_not_found_handler`); `resource=_resource_for_path(...)` in `not_found_handler`; `loc`-derived field naming with prefix strip, `body`-alone retention, de-duplication and first-seen order; docstrings updated. |
| T011 | complete | VERIFIED | `CAP-001-E7-S2-tdd-evidence.yaml` `mutation-and-final-validation` cycle | I re-derived each of the eleven mutant claims by inspection and agree every one is killed by the named test. Two are worth stating: "drop the `extra` request id" is killed only by `test_internal_error_handler_stamps_the_record_without_a_bound_id` (the middleware path masks it), and "remove a `loc` prefix strip" is killed only because the assertion requires the backticked whole name (`` `years` `` does not occur in `` `body.years` ``). Both strengthenings are in the committed tests. I re-ran the full validation set independently and reproduced every figure. |
| T012 | complete | VERIFIED | `CAP-001-E7-S2-tdd-evidence.yaml` — 10 cycles, each with `code_review_verdict: APPROVED`, `spec_drift.drift_detected: false`, RED or characterization evidence, `tests_executed: true` and a `commit_hash` | I checked all ten `commit_hash` values against `git log 2c28d53..HEAD`: every one exists on this branch and its subject matches the cycle it claims. No cycle is recorded `REJECTED` or with drift. Characterization cases are recorded as GREEN-on-arrival rather than a fabricated RED, as T012 required. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_every_handled_error_returns_the_full_envelope` / TC-COMP-070, TC-COMP-010 | ADEQUATE | Six real transport-level cases through `create_app()`. `list(payload) == ["error"]` is stronger than a key-presence check: it fails if FastAPI's `detail` shape reappears alongside the envelope. Monkeypatched run queries drive the 404/409 without a database; no mock stands between the test and the handler under test. | none |
| `test_500_body_is_only_the_internal_error_code_and_request_id` / TC-COMP-072, TC-COMP-084 | ADEQUATE | Whole-body equality, header presence and equality, four forbidden substrings, and a positive assertion that the driver text reached the `ERROR` record. The probe raises a realistic driver-shaped `RuntimeError`. Deterministic: no sleeps, no network, the request id is read from the response rather than predicted. | none |
| `test_error_request_id_is_in_every_component_log_record` / TC-COMP-071, TC-COMP-085 | ADEQUATE | Captures at root and requires *every* `factorflow.api*` record to carry the id, with a named assertion on the unhandled-exception record so the 500 case is not vacuously true (the 404 and 422 cases log nothing, which the test tolerates by construction but the 500 case does not). | none |
| `test_two_error_requests_get_different_request_ids` / TC-COMP-085 | ADEQUATE | Guards against a constant or cached id across error responses. | none |
| `test_handled_error_codes_are_literal_snake_case`, `test_internal_error_code_is_literal_snake_case`, `test_framework_http_error_code_does_not_change_with_detail_wording`, `test_status_outside_http_status_yields_http_error` / TC-COMP-083 | ADEQUATE | Regex *and* literal equality, so a code that is snake_case but wrong still fails. The wording-independence test is the discriminating one for DAC-E7-S2-1 and would fail immediately if the code were derived from `exc.detail`. | none |
| `test_raised_credential_never_reaches_the_response`, `test_submitted_credential_never_reaches_a_validation_error` / TC-COMP-086, TC-COMP-069 | ADEQUATE | A synthetic constant is placed in an exception message, an `HTTPException.detail`, a body field and a query parameter, then asserted absent from `response.text` and from every header value. Exact status assertions. I extended the attack surface myself (unknown keys, nested keys) and found no leak. | none |
| `test_validation_error_uses_the_envelope_and_names_the_field` / TC-COMP-087 | ADEQUATE | Three transports (body field, missing body, query), each asserting envelope shape, code, resource and the backticked field. The backticks are what make the prefix-strip mutant detectable. | none |
| `test_405_keeps_the_allow_header` | ADEQUATE | Proves the handler's `exc.headers` copy, through a probe. See IR-002 for what it does not prove. | production 405s carry no `Allow` to copy — pre-existing, not introduced here |
| `test_raised_404_still_goes_through_the_not_found_handler` | ADEQUATE | Pins the status-handler-over-class-handler precedence that the whole design rests on, against the installed Starlette rather than against documentation. | none |
| `test_framework_error_message_is_built_from_the_phrase_not_the_detail` | ADEQUATE | Asserts both the expected phrase and the absence of the detail string. | none |
| `test_framework_error_resource_comes_from_the_path` | ADEQUATE | Covers both `_resource_for_path` branches: mapped prefix and last-segment fallback. | none |
| `test_internal_error_handler_stamps_the_record_without_a_bound_id` | ADEQUATE | Calls the handler directly with no bound `ContextVar`, which is the only probe that isolates the `extra=` stamp from `_stamped_handle`. Asserts the exact list of record ids, so an unstamped extra record also fails. | none |

All ten mapped TC-IDs (TC-COMP-010, 069, 070, 071, 072, 083, 084, 085, 086, 087)
carry `# Implements` trace comments and each maps to the AC the coverage matrix
assigns it. No test is order-dependent, time-dependent or network-dependent; the
only shared global is the pre-existing `logging.Handler` class patch, installed
idempotently by the lifespan.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | `/Users/alvarodejodra/Projects/ai-agents` | 0 | PASS | All eight checks passed. |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001 --story …/CAP-001-E7-S2.md --stage adversarial-review` | `/Users/alvarodejodra/Projects/ai-agents` | 0 | PASS | `READY — story is ready for independent review`. |
| `uv run pytest -m 'not postgres' -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 498 passed, 257 deselected, 2 warnings, 14.29s. |
| `uv run pytest -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | **755 passed**, 2 warnings, 232.49s. Docker was available (`docker info` exit 0), so the postgres-marked tests ran; nothing was skipped for want of a container runtime. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `All checks passed!`. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 171 files already formatted. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 47 source files. |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel built into the git-ignored `dist/`. |
| `npm test` | `repos/factorflow-v2/FactorFlow-v2/web` | 0 | PASS | 36 files, 222 tests passed (`vitest run`). Regression check for `toApiError`. |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2/web` | 0 | PASS | `vite build` emitted into the git-ignored `src/factorflow/api/static/`. |
| `uv run python` ad-hoc envelope sweep and credential-leak probe | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Reviewer-authored throwaway scripts in `/tmp`, deleted afterwards; no repository file created or modified. |
| `uv sync --all-extras` | — | N/A | NOT RUN | The environment was already synced: every other `uv run …` command resolved and executed without re-resolution. Running it would mutate the lockfile environment for no additional evidence. |
| `npm ci` | — | N/A | NOT RUN | `node_modules` was already installed; `npm test` and `npm run build` both ran green against it. `npm ci` would delete and reinstall the tree without adding evidence about this change set. |

### Validation Side Effects

- Before: `git status --porcelain --untracked-files=all` → empty (clean tree at `726607d`).
- After: `git status --porcelain --untracked-files=all` → empty.
- Generated but untracked and git-ignored: `dist/` (from `uv build`) and
  `web/dist` → `src/factorflow/api/static/assets/` (from `npm run build` and from
  `src/app/build-output.test.tsx`, which performs a real build by design).
  `git check-ignore` confirms these paths are ignored, and the tracked
  `index.html` marker was left intact.
- Unexpected tracked-file changes: none.

## Findings

| Finding | Severity | Status | Summary |
|---------|----------|--------|---------|
| IR-001 | LOW | OPEN | The middleware's blanket exception catch means `TestClient(raise_server_exceptions=True)` no longer re-raises |
| IR-002 | LOW | OPEN | `_resource_for_path`'s docstring says "first segment" where the code returns the last, and this story widens its reach |

### IR-001 — The middleware's blanket exception catch silently disables `TestClient(raise_server_exceptions=True)`

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E7-6, DAC-E7-S2-3 (both satisfied; this concerns a side effect)
- **Tasks**: T010
- **Files**: `src/factorflow/api/app.py:225–232` (`request_id_middleware`)
- **Claim challenged**: the docstring's statement that the `Exception` handler
  registration "remains only as a backstop".
- **Observed evidence**: the middleware now converts every exception escaping
  `call_next` into a response, so the exception never reaches Starlette's
  `ServerErrorMiddleware`. That middleware is also what re-raises for
  `TestClient(app)` with the default `raise_server_exceptions=True`. Every test
  in this repository that drives an error path already passes
  `raise_server_exceptions=False`, so the full suite is green (755 passed), and
  the behaviour is exactly what T010 specified. But a future test written as
  `TestClient(app).get(...)` will now receive a `500` where it would previously
  have received the exception and its traceback.
- **Expected evidence/behavior**: nothing in the story, the plan or a
  constitution requires the old re-raise. This is a maintainability consequence
  of a required change, not a violated requirement.
- **Impact**: a future failing test may report an opaque `500` instead of the
  underlying exception, costing debugging time. No production impact: the
  exception is still logged in full, with the request id, by
  `internal_error_handler`.
- **Required remediation**: none required for this gate. If the team wants it
  addressed, the bounded result is a sentence in `_add_request_id_middleware`'s
  docstring stating that exceptions no longer propagate to `ServerErrorMiddleware`
  and that tests asserting on a raised exception must say so explicitly.

### IR-002 — `_resource_for_path`'s docstring still describes the opposite of its fallback, and this story widens its reach

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E7-5 (satisfied)
- **Tasks**: T010
- **Files**: `src/factorflow/api/app.py:277–292` (`_resource_for_path`, docstring line 286–287)
- **Claim challenged**: the docstring's "Falls back to the path's own first
  segment".
- **Observed evidence**: the implementation is
  `path.strip("/").split("/")[-1] or "request"` — the **last** segment. I
  confirmed the behaviour empirically: `GET /api/does-not-exist` reports
  `resource: "does-not-exist"` and `DELETE /api/health` reports
  `resource: "health"`, both last segments. Before this story the function was
  read by one handler (`_validation_error_handler`); after T010 it is read by
  three (`not_found_handler` and `_http_error_handler` as well), so the
  inaccurate sentence now describes the resource name on every unmatched path
  and every framework HTTP error. The task plan's Open Gap 2 notes the
  discrepancy and explicitly keeps the code's behaviour and the docstring out of
  scope, so this is a pre-existing defect the story inherits rather than
  introduces, and DEC-0010 (owner-upheld) adopted the actual behaviour.
- **Expected evidence/behavior**: a docstring that describes what the function
  returns. DEC-0010 records the adopted rule as "the mapped resource name, else
  the last path segment, else `request`".
- **Impact**: a reader reasoning about a future route's resource name from the
  docstring will get it wrong. No runtime impact.
- **Required remediation**: none required for this gate. The bounded fix is to
  change "first segment" to "last segment" in that docstring when
  `component-design-ingestion-api.md` absorbs DEC-0010.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, recorded deviations.** Three, all documented in
  `CAP-001-E7-S2-tdd-evidence.yaml` and visible in the committed tests: (1) T004
  uses a sibling `probe_client` fixture rather than reusing `client`, because a
  raising probe needs `raise_server_exceptions=False`; the original `client`
  fixture is unmodified. (2) T008's "`405` keeps Starlette's `Allow` header"
  is exercised through a probe `HTTPException(405, headers={"Allow": "GET"})`
  rather than `DELETE /api/health`, because the `StaticFiles` mount answers that
  request with a header-less `HTTPException(405)`; I reproduced this
  independently — the production 405 genuinely carries no `Allow`, and did not
  before this story either. (3) T003's log assertion was corrected during the
  T010 cycle from reading `exc_info` to formatting the record, because the
  credential-redaction patch clears `exc_info` after pre-formatting a scrubbed
  `exc_text`; the corrected assertion proves the same property through the real
  redaction path and is not weaker.
- **Bookkeeping.** All twelve task checkboxes are `[x]` and all twelve are
  independently VERIFIED; no checked task lacks evidence and no unchecked task
  appears implemented. The only diff to the tasks file is checkbox state. The
  story's `status` moved `planning` → `in-review`, which is the correct state
  for a story entering this gate.
- **Scope leakage.** None. The change set is confined to the two modules the
  story names, their two test files, and this story's own documents. No
  dependency, configuration, migration or frontend file changed — consistent
  with the plan's closing note.
- **Provisional decisions.** DEC-0009, DEC-0010 and DEC-0011 are all recorded
  under `projects/factorflow-v2/decisions/` with `owner_reviewed: true`,
  `owner_verdict: upheld` and `status: applied`. The implementation matches each
  adopted rule. No unrecorded assumption was required of me during this review.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: proceed to doc sync for CAP-001-E7-S2 with the two LOW
  findings recorded. `component-design-ingestion-api.md` §2.3/§2.5 should absorb
  DEC-0009, DEC-0010 and DEC-0011 at its next revision, as the plan's Open Gaps
  state; IR-002's docstring correction belongs with that revision.
- **Warnings accepted downstream**: IR-001, IR-002
