---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S5-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T06:07:53Z
  source_artifacts:
    - id: CAP-003-E2-S5
      version: "1"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-ingestion-api
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ingestion-api-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E2-S5 — ingestion-api: Register the data_health Router and Extend the No-Secrets Test

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S5.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Makes the two `ingestion-api` edits of component-design-ingestion-api.md ("ID"
below) 2.1 to 2.3 (DEC-0211): `src/factorflow/api/app.py` gains one entry,
`data_health,`, in its parenthesised `from factorflow.api.routes import (...)`
block and one line, `app.include_router(data_health.router)`, after the
delivered `app.include_router(classifications.router)` and before
`_add_host_origin_middleware(app)` and `_add_static_mount(app)`, so
`GET /api/attention`, `GET /api/data-health` and `GET /api/data-health/problems`
(the router CAP-003-E2-S4 creates) are served by `create_app` behind the
delivered request-id, Host and Origin middleware and the delivered envelope.
`tests/unit/test_api_no_secrets.py` gains the parametrised
`test_data_health_routes_never_echo_credential` with its two helpers,
`stub_reader_functions` and `StubPool`: each route answers `200` through
`create_app` with populated reader stubs and a stub pool, with no database and
no wait on the pool's 30 s checkout timeout, and the market data key's value
appears in no body, header or log. No other `ingestion-api` file changes;
`_resource_for_path` is not extended (ID 3); no delivered route, model, status
code or refusal changes (AC-17).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-4 | No new response carries the credential's value; the delivered no-secrets test is extended to the three new routes | T002, T006 |
| AC-17 | No delivered route, model, status code or refusal changes | T001, T003, T004, T005, T006 |
| DAC-E2-10 | Router included by `create_app` with the delivered routers and before `_add_static_mount`; foreign `Host` refused, foreign `Origin` on `GET` not refused, unknown `/api` path still `not_found`, every refusal carries a request id | T002, T003, T004, T005 |
| DAC-E2-13 | `tests/unit/test_api_no_secrets.py` gains one parametrised test: a populated `200` body of each route never contains `FACTORFLOW_MASSIVE_API_KEY`'s value | T002, T006 |
| DAC-E2-S5-1 | `app.py`'s diff is the one import and the one `include_router` line; `test_api_static_mount.py` and `test_api_host_origin.py` pass unchanged | T003, T004, T005 |
| DAC-E2-S5-2 | Each route answers `200` through `create_app` with the reader stubbed and the pool replaced, no database, no 30 s wait, `secret_value` absent from `response.text` | T002, T004 |

## Phase 1: Setup

**Purpose**: Confirm the router this story registers exists, and nothing else has been registered for it yet.

- [ ] T001 Confirm, without editing anything, and STOP and report if one does not hold: (a) CAP-003-E2-S4 has landed `src/factorflow/api/routes/data_health.py` with `router = APIRouter()` holding exactly `GET /api/attention`, `GET /api/data-health` and `GET /api/data-health/problems`, and importing `read_attention`, `read_data_health` and `read_problems` by name from `factorflow.data_health` (the seam S4's plan T010 fixes, so this story's stubs patch them on `factorflow.api.routes.data_health`); (b) `factorflow.data_health.models` exposes the RD 2.2 frozen dataclasses `Attention`, `Problems`, `LatestDownload`, `Progress`, `LatestTerminalDownload`, `AttentionItem`, `DataHealth`, `DailyPricesCheck`, `GapDetectionState`, `CompanyFinancialsCheck`, `ProblemPage`, `ProblemRow`, `Failure` with RD 2.2's field names (CAP-003-E2-S1's plan); (c) `src/factorflow/api/app.py` does not yet import or include `data_health`, its `create_app` includes `classifications.router` last before `_add_host_origin_middleware(app)`, and `tests/unit/test_api_no_secrets.py` has no `data_health` test. Touch nothing outside `src/factorflow/api/app.py` and `tests/unit/test_api_no_secrets.py` in this story (ID 2.1; DEC-0211): `api/models.py`, `api/bounds.py`, `api/errors.py`, `_resource_for_path`, `_VALIDATION_ERROR_RESOURCES`, the routes and the two delivered test files `tests/integration/test_api_static_mount.py` and `tests/unit/test_api_host_origin.py` stay as they are.

**Checkpoint**: Prerequisites confirmed; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing no-secrets test and record the green baseline of the delivered tests the edit must not disturb.

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-055 (no-secrets test: the three routes answer 200 without the key's value) in `tests/unit/test_api_no_secrets.py`, appended after the delivered tests under a section comment naming CAP-003-E2-S5, TC-COMP-055, DAC-E2-13 and DAC-E2-S5-2 (the section-comment precedent of the file's delivered CAP-002 block). Change no delivered line of the file; reuse its `_assert_no_secret` helper.
  - Helper `StubPool`: a class whose `connection()` is a `@contextmanager` that increments `self.checkouts` (starting at `0`) and yields `object()` (the delivered `_FakePool` shape, plus a counter that proves the route used this pool).
  - Helper `stub_reader_functions(monkeypatch: pytest.MonkeyPatch, *, credential_present: bool) -> None`: `monkeypatch.setattr` on `factorflow.api.routes.data_health.read_attention`, `.read_data_health` and `.read_problems`, each to a function accepting the route's call shape (`(conn)`, `(conn)`, `(conn, *, cursor, limit)`) and returning a populated literal built from `factorflow.data_health.models` with keyword arguments: an `Attention` with `credential_present=credential_present`, `followed_count=3`, `prices_as_of=date(2026, 10, 19)`, `Problems(stock_count=1, symbols=("AAA",), newest_completed_at=<aware UTC datetime>)`, a `LatestDownload` with a `Progress(done=1, total=3)`, a `LatestTerminalDownload` with `state="failed"` and `failure_reason="provider unavailable"`, and one `AttentionItem` of kind `data_problems`; a `DataHealth` with `never_acquired=False`, both checks populated (`DailyPricesCheck` with `status="exceptions"` and `exception_symbols=("AAA",)`, `CompanyFinancialsCheck` with `status="ok"`) and `problems` set to the problem page below; and a `ProblemPage(rows=(ProblemRow(symbol="AAA", failures=(Failure(data_type="prices", outcome="failed", reason="provider timeout", attempts=3, completed_at=<aware UTC datetime>, run_id=UUID(...)),), retryable=True),), next_cursor=None)`. No literal in these fixtures contains the secret, so any occurrence of it in a response was put there by the route, the response models or the application.
  - Test `test_data_health_routes_never_echo_credential(monkeypatch, caplog, tmp_path, path)`, `@pytest.mark.parametrize("path", ["/api/attention", "/api/data-health", "/api/data-health/problems"])`, no `postgres` marker, docstring `# Implements TC-COMP-055`: `secret_value = "sk-super-secret-massive-key-0123456789"` (ID 2.3); `monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", secret_value)`; `monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")`; `caplog.set_level(logging.DEBUG)`; `monkeypatch.setattr(factorflow.api.app, "_STATIC_DIR", tmp_path)` (the `test_api_static_mount.py` precedent, so `_add_static_mount` always mounts `/` and a router registered after it is observably shadowed whatever the checkout's `static/` holds); `stub_reader_functions(monkeypatch, credential_present=True)`; `app = create_app()`; `pool = StubPool()`; `app.state.db_pool = pool`; `client = TestClient(app, base_url="http://127.0.0.1:8000")` used without entering its context, so the lifespan never runs and no real `ConnectionPool` is ever constructed (the delivered CAP-002 test's precedent in the same file; Resolved Conflict 2); `start = time.monotonic()`; `response = client.get(path)`; `elapsed = time.monotonic() - start`.
  - Assertions, in this order so a failure names its cause: `response.status_code == 200`, with the message carrying `response.text` (a `404` `not_found` envelope means the router is not registered or is registered after the static mount); `pool.checkouts == 1` (the request went through the replaced pool and nothing else); `elapsed < 30.0` (the pool's 30 s checkout timeout, the bound DAC-E2-S5-2 names); `_assert_no_secret(secret_value, text=response.text, headers=dict(response.headers), logs=caplog.text)`, which includes `secret_value not in response.text` (DAC-E2-S5-2).
  - (Implements TC-COMP-055; AC-4, DAC-E2-13, DAC-E2-S5-2, DAC-E2-10) — kills: a hand-written deletion of `app.include_router(data_health.router)` in `create_app` (each path answers `404 not_found`, status assertion fails); a hand-written move of that line below `_add_static_mount(app)` (the `/` mount on `tmp_path` matches first and the path answers `404`); a hand-written field `key: str = Field(default_factory=lambda: os.environ.get("FACTORFLOW_MASSIVE_API_KEY", ""))` on `AttentionResponse`, `DataHealthResponse` or `ProblemPageResponse` in `src/factorflow/api/data_health_models.py` (the value appears in that route's `response.text`); and a hand-written `pool = ConnectionPool(...)` checkout inside a handler in place of `request.app.state.db_pool` (`pool.checkouts == 0`, or a `PoolTimeout` after 30 s that fails both the status and the elapsed assertion).
- [ ] T003 Implement TC-COMP-054 (app.py changes by one import and one include_router line only) as its steps state, a diff reading and a run of the two delivered tests, not as a new test file (the story's Implementation names only two files, and DAC-E2-S5-1 requires the delivered tests to pass *unchanged*). Before any production edit, run `uv run pytest tests/integration/test_api_static_mount.py tests/unit/test_api_host_origin.py` and record it green as the baseline; then run `uv run pytest tests/unit/test_api_no_secrets.py` and record T002's three new cases failing on `assert 404 == 200` (the RED evidence; the delivered cases stay green). The post-edit half (diff and re-run) is T005. (Implements TC-COMP-054; AC-17, DAC-E2-S5-1) — kills: a hand-written extension of `_resource_for_path` or `_VALIDATION_ERROR_RESOURCES` with a `/api/data-health` entry, or a trailing-comment or reformatting edit to a neighbouring line (T005's `--numstat` reads other than `2	0`); a hand-written reordering of `_add_host_origin_middleware(app)` and `_add_request_id_middleware(app)` alongside the edit (the delivered `test_api_host_origin.py` and request-id assertions turn red after the edit).

### Additional Unit Tests

None. The registration has no internal logic beyond the two lines; Host and Origin on the three routes are asserted through `create_app` by CAP-003-E2-S6 (TC-INT-028, DAC-E2-10), and the unknown-`/api`-path `not_found` envelope by the delivered `tests/integration/test_api_static_mount.py`.

**Checkpoint**: T002's three parametrised cases fail with `404` `not_found`; every delivered test in the two delivered files and in `tests/unit/test_api_no_secrets.py` is green.

---

## Phase 3: Core Implementation

**Purpose**: Register the router on the delivered application factory.

- [ ] T004 Edit `src/factorflow/api/app.py`, two added lines and nothing else (ID 2.1, 2.2; DEC-0211): (1) in the parenthesised `from factorflow.api.routes import (` block, add `    data_health,` on its own line after `    coverage,` (ruff `I` order: `classifications`, `coverage`, `data_health`, `health`, ...); (2) in `create_app`, add `    app.include_router(data_health.router)` on its own line directly after `    app.include_router(classifications.router)` and before the blank line preceding `_add_host_origin_middleware(app)`. No trailing comment (the delivered `include_router` lines carry none, and the design snippet's comment would exceed the 100-column line length; Resolved Conflict 3). Do not touch the docstring of `create_app`, `_resource_for_path`, `_VALIDATION_ERROR_RESOURCES`, the middleware or the static mount (ID 3). (depends on T002, T003)

**Checkpoint**: T002 passes for all three paths; `uv run mypy src` is clean.

---

## Phase 4: Integration

**Purpose**: Prove the application is otherwise unchanged.

- [ ] T005 Complete TC-COMP-054 after T004: (a) `git diff --numstat HEAD -- src/factorflow/api/app.py` prints `2	0	src/factorflow/api/app.py`, and `git diff -U0 HEAD -- src/factorflow/api/app.py` shows exactly the two added lines `+    data_health,` and `+    app.include_router(data_health.router)` (DAC-E2-S5-1); (b) `git diff --quiet HEAD -- tests/integration/test_api_static_mount.py tests/unit/test_api_host_origin.py` exits `0` (unchanged); (c) `uv run pytest tests/integration/test_api_static_mount.py tests/unit/test_api_host_origin.py` passes, as at the T003 baseline (unknown `/api` path still answers the `not_found` envelope, the Host and Origin refusals hold, DAC-E2-10). Then run the delivered API unit suites, all green without edit: `uv run pytest tests/unit/test_api_no_secrets.py tests/unit/test_api_request_id.py tests/unit/test_api_errors.py tests/unit/test_api_isolation.py tests/unit/test_api_models.py tests/unit/test_api_data_health_routes.py tests/unit/test_api_data_health_models.py` (the delivered `test_new_routes_never_echo_credential` enumerates only the `/api/universes` and `/api/classifications` prefixes, so the added routes do not change what it requests) (Implements TC-COMP-054; AC-17, DAC-E2-S5-1, DAC-E2-10) (depends on T004)

**Checkpoint**: The app.py diff is the two lines; every delivered API test is green.

---

## Phase 5: Polish

**Purpose**: Final validation and the TDD evidence.

- [ ] T006 Run the full validation set (Validation Plan below) and fix any lint, format or type finding in this story's two files only. Confirm `tests/unit/test_api_no_secrets.py` carries `# Implements TC-COMP-055` and that `git diff --stat HEAD` lists exactly `src/factorflow/api/app.py`, `tests/unit/test_api_no_secrets.py` and this story's TDD evidence file (AC-17, AC-4, DEC-0211). (depends on T005)
- [ ] T007 After each TDD cycle in T002–T006 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E2-S5-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence (RED: T003's three `404` failures; GREEN: T004's pass), the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E2-S4 | hard | Existing graph edge. `app.py` imports `factorflow.api.routes.data_health` and includes its `router`; T002 patches the reader names on that module |
| CAP-003-E2-S1 | hard | New graph edge. T002's `stub_reader_functions` imports `Attention`, `Problems`, `ProblemPage`, `ProblemRow`, `Failure` and the other RD 2.2 dataclasses from `factorflow.data_health.models`, which S1 creates; already reachable transitively through CAP-003-E2-S4, added so the direct import is a graph edge |
| CAP-003-E2-S6 | reverse | Asserts DAC-E2-10's Host and Origin refusals (TC-INT-028) and the delivered `500` envelope on these routes through `create_app`; its graph line holds this story |

The real-stack end-to-end stories of E3 to E7 that list CAP-003-E2-S5 on their graph lines are reverse dependents too (they reach `/api/attention` through the registration this story adds); this plan cites none of them individually.

### Task Dependencies
- T001: none
- T002: depends on T001
- T003: depends on T002 (the RED run needs the new test)
- T004: depends on T002, T003
- T005: depends on T004
- T006: depends on T005
- T007: interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- None worth taking: two files, two lines of production code, one test.

---

## Validation Plan

### Constitution-Defined Commands
(tech stack v7, Validation Commands table; working directory the repository root)
- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest` (needs a container runtime for `postgres`-marked tests; without one run `uv run pytest -m 'not postgres'` and report the exclusion, never as a green full suite; this story's test carries no `postgres` marker)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- Focused: `uv run pytest tests/unit/test_api_no_secrets.py tests/integration/test_api_static_mount.py tests/unit/test_api_host_origin.py`
- DAC-E2-S5-2, DAC-E2-13, AC-4: T002 passes for all three paths (`200`, one checkout of `StubPool`, under 30 s, the secret absent from body, headers and logs)
- DAC-E2-S5-1, AC-17: T005's `--numstat` reads `2	0` and the two delivered test files are unchanged and green
- DAC-E2-10: T002's `200`s prove the router sits before the static mount; T005 proves the delivered Host/Origin and `/api` `not_found` behaviour unchanged; the refusals on the three routes themselves are CAP-003-E2-S6's TC-INT-028

---

## Notes

### Resolved Conflicts

1. **Line numbers and placement.** The story places the new line after `include_router(coverage.router)` "(line 461)" and before `_add_static_mount` "(line 465)", "after `classification-api`'s two calls if they have landed". CAP-002 has landed: today `coverage` is line 484, `universes` and `classifications` are 485–486, `_add_host_origin_middleware(app)` 488 and `_add_static_mount(app)` 490. The line numbers are illustrative; DAC-E2-10's ordering rule and ID 2.2 / ID 14 OQ1 ("whichever lands second places its line after the other's"; system design open question 2 answered, CAP-002 first) govern: T004 adds the line after `classifications.router`.
2. **Lifespan entry and helper shape in the no-secrets test.** ID 2.3's snippet enters `with TestClient(app, ...)` (running the lifespan, which constructs and opens a real `ConnectionPool`, starts the reclaim and classification loops against the unused URL) and then replaces `app.state.db_pool`. The snippet is illustrative; DAC-E2-S5-2 governs ("through `create_app` with the reader stubbed and the pool replaced, without a database and without waiting on the pool's 30 s checkout timeout"). T002 follows the local precedent of the same file's CAP-002 test (`app.state.db_pool = _FakePool()` and a `TestClient` used without its context), so no real pool exists and no background task can touch one. The two helper names `stub_reader_functions` and `StubPool` come from the story's Description and ID 2.3 and are kept; `StubPool` differs from the delivered `_FakePool` by its `checkouts` counter, which T002 asserts.
3. **Import form and trailing comment.** ID 2.2's snippet shows a one-line `from factorflow.api.routes import coverage, data_health, health, ...` and a trailing comment on the `include_router` line. The delivered import is a parenthesised block and the delivered `include_router` lines carry no comment; the comment as written would exceed ruff's 100-column limit. DAC-E2-S5-1 ("the one import and the one `include_router` line") governs: one `data_health,` entry in the block and a bare `include_router` line, two added lines in all.

### Open Gaps

None. No PROVISIONAL decision: the secret value and the database URL are ID 2.3's; the 30 s bound is DAC-E2-S5-2's (and `psycopg_pool`'s default checkout timeout, which the lifespan's `ConnectionPool(...)` call does not override); the placement is DAC-E2-10's and ID 2.2's; the three paths are system design §4.2's.

### Other Notes

- **Mapped test cases.** TC-COMP-054 and TC-COMP-055 (`tests/component/ingestion-api-tests.md`); the coverage matrix lists the story "2 of 2" derived ACs covered. DAC-E2-10 maps to TC-INT-028, which CAP-003-E2-S6 implements in `tests/integration/test_api_data_health_host_origin.py`; ID 7's "Router is registered" row is CAP-003-E2-S6's `tests/integration/test_api_data_health.py`.
- **Why `_STATIC_DIR` is patched in T002.** `_add_static_mount` mounts `/` only when the static directory exists. Pointing it at `tmp_path` makes the mount unconditional in the test, so a router included after the mount is shadowed and fails the `200` assertion regardless of whether a checkout's `src/factorflow/api/static/` holds its `.gitkeep`.
- **Middleware order.** Middleware is added to the application, not to routes, so the new line's position relative to `_add_host_origin_middleware` and `_add_request_id_middleware` does not change what runs on the three routes; only its position before `_add_static_mount` is observable (ID 3).
- **No `_resource_for_path` change.** A `limit` refusal on `/api/data-health/problems` keeps the delivered fallback resource `problems`; the router's cursor refusal names `data-health` (ID 3; epic Open Question 2). Do not "fix" either.
- **Register cross-check.** The epic resolution register's C1, C2, C11 and value 23 agree with this plan; T002 adds the `StubPool` helper the story names instead of reusing `_FakePool` (both are allowed by C11), for the checkout counter.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `src/factorflow/api/app.py: app.include_router(data_health.router) → ` (line deleted, with the now-unused `data_health,` import entry also deleted so ruff and mypy still pass; killed by T002, `404`)
  - `src/factorflow/api/app.py: move app.include_router(data_health.router) from after app.include_router(classifications.router) to after _add_static_mount(app)` (T002, the `/` mount on `tmp_path` answers first)
  - `src/factorflow/api/data_health_models.py: (AttentionResponse) add field key: str = Field(default_factory=lambda: os.environ.get("FACTORFLOW_MASSIVE_API_KEY", ""))` (T002, `/api/attention` case)
