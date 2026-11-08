---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S6-tasks
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
  timestamp: 2026-11-07T06:13:18Z
  source_artifacts:
    - id: CAP-003-E2-S6
      version: "1"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-component-design-ingestion-api
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-integration-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E2-S6 — data-health-api Integration Tests Through the Delivered Application

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S6.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Writes `data-health-api`'s two integration test files of
component-design-data-health-api.md ("AD" below) 2.1, 2.2 and 7, both run
through the delivered `create_app` against a migrated PostgreSQL test
container (`pytestmark = pytest.mark.postgres`, `TestClient(create_app(),
base_url="http://127.0.0.1:8000")` with the lifespan entered, the precedent of
`tests/integration/test_api_classification_host_origin.py` and
`tests/integration/api_classification_support.py`).
`tests/integration/test_api_data_health.py` proves, on a store seeded with
failures on three stocks, that the `GET /api/attention` and
`GET /api/data-health` bodies equal what `data-health-reader` computes on the
same store (and pinned literal counts), that `affected_count`,
`problems.stock_count` and the problem rows are one set, that
`GET /api/data-health/problems?limit=2` pages concatenate to the reader's full
problem set with no cursor on the last page, that an empty store answers `200`
with `never_acquired` true and both checks `null`, and that a reader raising
`psycopg.Error` answers the delivered `500` `internal_error` envelope with
`X-Request-Id` and no internal detail.
`tests/integration/test_api_data_health_host_origin.py` proves the three routes
sit behind the delivered middleware: a foreign `Host` gets
`400 host_not_allowed` before any handler runs, a foreign `Origin` on a `GET` is
not refused, an unknown `/api` path still answers the `not_found` envelope, and
every refusal carries a request id. No production file changes.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-13 | `affected_count` equals the number of *Needs fixing* rows | T003, T004 |
| AC-16 | `problems.stock_count` and the rows are the same set | T003, T004, T007 |
| AC-21 | An empty store answers `200` with both checks `null` | T005 |
| DAC-E2-9 | The three routes answer `200` with the §4.2 shapes whenever the database answers; a `psycopg.Error` reaches the delivered `500` `internal_error` envelope with `X-Request-Id` | T003, T005, T006 |
| DAC-E2-10 | A foreign `Host` gets `400 host_not_allowed` on all three routes; a foreign `Origin` on a `GET` is not refused; (epic text) an unknown `/api` path still answers `not_found` and every refusal carries a request id | T007, T008 |
| DAC-E2-S6-1 | Pages of `limit=2` over three problem stocks concatenate to the reader's full problem set; the last page carries no cursor | T004 |
| DAC-E2-S6-2 | The `500` body is the delivered envelope with no internal detail (SEC-ERR-001) and `X-Request-Id` is present | T006 |

## Phase 1: Setup

**Purpose**: Confirm the delivered and upstream code these tests exercise exists as the plans describe it.

- [ ] T001 Confirm, without editing anything, and STOP and report if one does not hold: (a) CAP-003-E2-S5 has landed `app.include_router(data_health.router)` in `create_app` in `src/factorflow/api/app.py`, after `app.include_router(classifications.router)` and before `_add_static_mount(app)`; (b) CAP-003-E2-S4 has landed `src/factorflow/api/routes/data_health.py`, which imports `read_attention`, `read_data_health` and `read_problems` by name from `factorflow.data_health` (the seam T006 and T007 patch on `factorflow.api.routes.data_health`), and `src/factorflow/api/data_health_models.py` with `AttentionResponse.from_reader`, `DataHealthResponse.from_reader` and `ProblemPageResponse.from_reader`; (c) CAP-003-E2-S1, CAP-003-E2-S2 and CAP-003-E2-S3 have landed `factorflow.data_health` exporting `read_attention(conn)`, `read_data_health(conn)` and `read_problems(conn, *, cursor, limit)`; (d) the delivered `src/factorflow/api/errors.py` `internal_error_handler` body is exactly `{"error": {"code": "internal_error", "request_id": ...}}` and `src/factorflow/api/app.py`'s `request_id_middleware` turns an unhandled exception into it while the id is bound; the host refusal message is "The request's Host is not one of this API's loopback addresses."; the `not_found` message is "No resource exists at this path." with `resource` from `_resource_for_path`. Edit no file under `src/`: this story adds two test files and its TDD evidence file only.

**Checkpoint**: Prerequisites confirmed; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the two integration files. The production code exists (CAP-003-E2-S1 to S5), so each test's RED evidence is its failure against the hand-written mutant it names, applied to a scratch copy and reverted before staging (Other Notes).

**Shared shape of `tests/integration/test_api_data_health.py`** (module docstring naming AD 2.1, 2.2, 7, component-design-ingestion-api.md 7 "Router is registered", TC-INT-016, TC-INT-017, DAC-E2-9, DAC-E2-S6-1, DAC-E2-S6-2; `pytestmark = pytest.mark.postgres`):

- Fixture `env(postgres_connection_string, monkeypatch) -> Iterator[tuple[TestClient, psycopg.Connection]]`: open `conn = psycopg.connect(postgres_connection_string)`, `apply_pending(conn, discover(MIGRATIONS_DIR))`, `conn.commit()` (the `classification_app` precedent, so every migration the lifespan's loops need exists); `monkeypatch.setenv("FACTORFLOW_DATABASE_URL", postgres_connection_string)`; `monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", SENTINEL)` with `SENTINEL = "sk-data-health-int-0123456789"`, so `credential_present` is true and no `credential_missing` item (whose `recorded_at` is the per-call `checked_at`) depends on the developer's environment; then `with TestClient(create_app(), base_url="http://127.0.0.1:8000") as client: yield client, conn`, closing `conn` in `finally`. The lifespan opens the real pool, so every request reads the store through `app.state.db_pool`.
- Module-private seed helpers written with bound parameters only, repeating the shapes the CAP-003-E2-S1/S2/S3 plans give their own files (test modules keep them private): `_instrument(conn, symbol) -> int` (active); `_bars(conn, instrument_id, dates)` and `_segment(conn, instrument_id, data_type, covered_from, covered_to)` as in `tests/integration/test_coverage_gaps.py`; `_run(conn, *, state, requested_at, started_at, ended_at, instruments_named) -> UUID` with `history_depth_years = 1`, honouring `acquisition_run_terminal_has_end`; `_record(conn, run_id, instrument_id, data_type, outcome, *, reason=None, attempts=1, completed_at)` inserting the `run_instrument_result` row and upserting `acquisition_state` with the same `run_id`, `last_outcome = outcome` and `last_acquired_at = completed_at` (the pairing the delivered writer keeps).
- Fixed aware literals, never `now()`: `D2..D5 = date(2024, 1, 2) .. date(2024, 1, 5)`; `T0 = datetime(2026, 10, 20, 21, 0, tzinfo=UTC)`, `T1 = T0 + 10 min`, `T2 = T0 + 20 min`, `T3 = T0 + 30 min`, `T_END = T0 + 1 h`.
- `_seed_three_failures(conn) -> UUID` (the store of DAC-E2-S6-1): active `AAA`, `BBB`, `CCC`, `DDD`, each with daily bars on `D2..D5` and a `prices` segment `D2..D5`; one run `R = _run(state="partial", requested_at=T0, started_at=T0, ended_at=T_END, instruments_named=4)`; for every instrument and every data type `reference`, `prices`, `fundamentals`, `corporate_actions` one `_record(..., "written", completed_at=T0)` except: `AAA` `prices` `failed`, `reason="provider timeout"`, `attempts=3`, `completed_at=T1`; `BBB` `fundamentals` `not_found`, `reason=None`, `attempts=1`, `completed_at=T2`; `CCC` `prices` `failed`, `reason="provider unavailable"`, `attempts=2`, `completed_at=T1`, and `CCC` `fundamentals` `failed`, `reason="provider timeout"`, `attempts=3`, `completed_at=T3`. `DDD` has no failure. Ends with `conn.commit()` and returns `R`.
- `EXPECTED_ROWS(R)`: the hand-written problem set, independent of the code under test, in symbol order: `AAA` with `failures == [{"data_type": "prices", "outcome": "failed", "reason": "provider timeout", "attempts": 3, "completed_at": T1, "run_id": str(R)}]`, `retryable: True`; `BBB` with `[{"data_type": "fundamentals", "outcome": "not_found", "reason": None, "attempts": 1, "completed_at": T2, "run_id": str(R)}]`, `retryable: False`; `CCC` with `[{"data_type": "fundamentals", "outcome": "failed", "reason": "provider timeout", "attempts": 3, "completed_at": T3, ...}, {"data_type": "prices", "outcome": "failed", "reason": "provider unavailable", "attempts": 2, "completed_at": T1, ...}]`, `retryable: True`. A helper `_instants(rows)` returns the rows with every `completed_at` string parsed by `datetime.fromisoformat` (the instant is the contract; the offset spelling follows the session time zone), so the comparison is against these aware literals.
- `_reader_json(conn, read, model)` returns `model.from_reader(read(conn)).model_dump(mode="json")` and then `conn.rollback()` (the reader leaves its transaction to the caller); `_without_checked_at(body)` returns a copy without the top-level `checked_at`, the one field that is a per-call `now()` (RD 2.3).

### Mandatory Integration Tests

- [ ] T002 Create `tests/integration/test_api_data_health.py` with the module docstring, imports, `env` fixture, seed helpers, literals, `EXPECTED_ROWS`, `_instants`, `_reader_json` and `_without_checked_at` described above. Holds no assertion itself. (depends on T001)
- [ ] T003 Implement the bodies-match-the-reader half of TC-INT-016 (edge: "`GET /api/data-health` body matches the reader; `affected_count` equals the row count") in `tests/integration/test_api_data_health.py`, `# Implements TC-INT-016`, test `test_bodies_match_the_reader_on_a_seeded_store`. After `R = _seed_three_failures(conn)`: (a) `GET /api/attention` and `GET /api/data-health` each answer `200`; (b) `_without_checked_at(response.json())` equals `_without_checked_at(_reader_json(conn, read_attention, AttentionResponse))`, and likewise for `read_data_health` with `DataHealthResponse` (the route serves exactly what the reader computes on the store the application reads, AD 7 "End to end"); each response's `checked_at` parses with `datetime.fromisoformat` to an aware value no earlier than the reader's (both are PostgreSQL `now()`, the reader read first); (c) independent literals from the seed, so a mutant shared by the reader and the route cannot cancel out: attention `followed_count == 4`, `problems["stock_count"] == 3`, `problems["symbols"] == ["AAA", "BBB", "CCC"]`, `datetime.fromisoformat(problems["newest_completed_at"]) == T3`, `latest_terminal_download["run_id"] == str(R)` and `["state"] == "partial"`, `{item["kind"] for item in items} == {"data_problems"}`; data health `never_acquired is False`, `followed_count == 4`, `affected_count == 3`, `checks["daily_prices"]` and `checks["company_financials"]` are both objects, `checks["company_financials"]["problem_count"] == 2` (`BBB` `not_found`, `CCC` `failed`; DEC-0213 e), `problems["next_cursor"] is None`, `_instants(problems["rows"]) == EXPECTED_ROWS(R)`; (d) one set (AC-13, AC-16): `affected_count == len(problems["rows"]) == attention problems.stock_count == 3`, and the row symbols equal the attention `symbols` as a set (three stocks, so the first three are all of them) (Implements TC-INT-016; AC-13, AC-16, DAC-E2-9) — kills: a hand-written `limit=1` in place of `_FIRST_PAGE_LIMIT` in `read_data_health` (rows 1, `affected_count` 3); swap-case of the reader a handler calls (`get_data_health` calling `read_attention` fails the response model, `500`); negate-boolean on `s.last_outcome IN ('failed', 'not_found')` in `PROBLEM_COUNT_SQL` only (`stock_count` reads 1, the literal 3 fails while the rows still read 3); drop-field-copy of `affected_count` in `DataHealthResponse.from_reader` (the literal `3` fails although both sides of (b) carry the same mutant, the symmetric-comparison guard (c) exists for).
- [ ] T004 Implement TC-INT-016's main scenario (keyset pages concatenate to the full problem set) in `tests/integration/test_api_data_health.py`, `# Implements TC-INT-016`, test `test_problem_pages_concatenate_to_the_reader_full_set`. After `R = _seed_three_failures(conn)`, page with `client.get("/api/data-health/problems", params={"limit": 2} | ({"cursor": cursor} if cursor else {}))` from `cursor = None` until a page's `next_cursor` is `None`, with a guard of at most 5 requests (`pytest.fail` naming the cursors seen, so a route that ignores the cursor fails instead of looping). Assert: every page answers `200`; page sizes `[2, 1]`; the cursors returned are `["BBB", None]`, with the `next_cursor` key present and `null` on the last page (DAC-E2-S6-1); `_instants(concatenated rows) == EXPECTED_ROWS(R)` (independent literal); the concatenated rows equal `[ProblemRowResponse-dumped rows of read_problems(conn, cursor=None, limit=500)]`, i.e. `_reader_json(conn, lambda c: read_problems(c, cursor=None, limit=500), ProblemPageResponse)["rows"]` (the reader's full set, DAC-E2-3); no symbol appears twice; and the concatenated symbols equal `GET /api/data-health`'s first-page row symbols and number `affected_count` (AC-16) (Implements TC-INT-016; DAC-E2-S6-1, DAC-E2-3, AC-13, AC-16) — kills: a hand-written route argument `limit=DEFAULT_PAGE_SIZE` in place of `limit=limit` (first page holds 3 rows); a hand-written route argument `cursor=None` in place of `cursor=cursor_symbol` (the second page repeats `AAA`, `BBB` and the guard or the duplicate check fails); off-by-one on `limit_plus_one` (`limit + 1` → `limit`: no lookahead, the first page's `next_cursor` is `None` and `CCC` is never fetched); negate-boolean on the reader's "a further stock exists" test (the last page carries `"CCC"`).
- [ ] T005 Implement AD 7's "Empty store" row in `tests/integration/test_api_data_health.py` (DAC-E2-9's empty-store clause; AD 8 criterion 1), test `test_an_empty_store_answers_200_with_null_checks`, nothing seeded: `GET /api/data-health` answers `200` with `never_acquired is True`, `checks == {"daily_prices": None, "company_financials": None}` (the object with both members `null`, CAP-003-E2-S4 plan Resolved Conflict 2), `followed_count == 0`, `affected_count == 0`, `problems == {"rows": [], "next_cursor": None}`; `GET /api/attention` answers `200` with `followed_count == 0`, `prices_as_of is None`, `problems == {"stock_count": 0, "symbols": [], "newest_completed_at": None}`, `latest_download is None`, `latest_terminal_download is None`, `items == []` (zero counts on attention, epic DAC-E2-9); `GET /api/data-health/problems` answers `200` with `{"rows": [], "next_cursor": None}`. Every key named here is present in the body (`"prices_as_of" in body` etc.), so an omitted `null` fails (AC-21, STD-UI-14) (Implements AD 7 "Empty store"; AC-21, DAC-E2-9) — kills: a hand-written `checks=None if health.never_acquired else ...` in `DataHealthResponse.from_reader` (`checks` reads `null`); negate-boolean on `never_acquired` in `read_data_health` (the checks are computed and read as objects); a hand-written `response_model_exclude_none=True` on a route decorator (the `null` keys go missing); a hand-written `raise` for an empty store in a reader (`500`).
- [ ] T006 Implement TC-INT-017 (a reader failure answers the delivered 500 envelope with X-Request-Id) in `tests/integration/test_api_data_health.py`, `# Implements TC-INT-017`, test `test_a_reader_failure_is_the_delivered_internal_error`, parametrised over `("/api/attention", "read_attention")`, `("/api/data-health", "read_data_health")`, `("/api/data-health/problems", "read_problems")`. Inside `env`, `monkeypatch.setattr(f"factorflow.api.routes.data_health.{name}", raiser)` where `raiser(*args, **kwargs)` raises `psycopg.OperationalError(DRIVER_TEXT)` with `DRIVER_TEXT = "connection to server at 127.0.0.1:5432 failed: FATAL relation acquisition_state"`; request through a second client on the same app, `TestClient(client.app, base_url="http://127.0.0.1:8000", raise_server_exceptions=False)` (the `tests/unit/test_api_errors.py` precedent, so an exception escaping the request-id middleware becomes Starlette's bare `500` and fails the assertions instead of raising into the test). Assert: `status_code == 500`; `request_id = response.headers["X-Request-Id"]` is present and `uuid.UUID(request_id)` parses; `response.json() == {"error": {"code": "internal_error", "request_id": request_id}}` exactly, with no `message` key (Resolved Conflict 1); and none of `"Traceback"`, `"OperationalError"`, `"psycopg"`, `"5432"`, `"acquisition_state"`, `DRIVER_TEXT` occurs in `response.text` (SEC-ERR-001; no partial aggregate is presented as complete) (Implements TC-INT-017; DAC-E2-9, DAC-E2-S6-2; AC-11, AC-13, AC-21) — kills: a hand-written `try: ... except psycopg.Error: return <Response>.from_reader(<empty>)` in a handler (`200`, a partial body presented as complete); a hand-written `except Exception as exc: response = await internal_error_handler(request, exc)` removed from `request_id_middleware` (Starlette's `ServerErrorMiddleware` answers without `X-Request-Id`); a hand-written `"message": str(exc)` added to `internal_error_handler`'s body (the exact-body equality and the driver-text scan fail); drop-field-copy of `request_id` in that body (`"unknown"` differs from the header).

**Shared shape of `tests/integration/test_api_data_health_host_origin.py`** (module docstring naming AD 3, 4, 7 "Host and Origin", AD 8 criterion 5, TC-INT-028, DAC-E2-10; `pytestmark = pytest.mark.postgres`): `PATHS = ("/api/attention", "/api/data-health", "/api/data-health/problems")`; `FOREIGN_HOSTS = ("evil.example:8000", "127.0.0.1:9000")` (another site, and the right address on the wrong port); `FOREIGN_ORIGINS = ("https://evil.example", "null")`; a `client` fixture over a fully migrated empty store, as `tests/integration/test_api_classification_host_origin.py` builds it (`apply_pending(conn, discover(MIGRATIONS_DIR))`, `FACTORFLOW_DATABASE_URL`, `FACTORFLOW_MASSIVE_API_KEY` set, lifespan entered); a fixture `reader_calls(monkeypatch) -> list[str]` that wraps each of `read_attention`, `read_data_health`, `read_problems` on `factorflow.api.routes.data_health` with a function that appends the name and then calls the original, so a test sees whether a handler ran.

- [ ] T007 Implement TC-INT-028 steps 1 and 2 in `tests/integration/test_api_data_health_host_origin.py`, `# Implements TC-INT-028`. (a) `test_a_foreign_host_is_refused_before_any_handler`, parametrised over `PATHS` × `FOREIGN_HOSTS`: `client.get(path, headers={"Host": host})` answers `400` with `response.json() == {"error": {"code": "host_not_allowed", "message": "The request's Host is not one of this API's loopback addresses.", "resource": None, "request_id": response.headers["X-Request-Id"]}}` and `reader_calls == []` (refused by the delivered middleware before reaching a handler, AD 8 criterion 5); then the same path without the header answers `200` and `reader_calls` holds that route's reader once (the refusal was the Host's, not the route's). (b) `test_a_foreign_origin_does_not_refuse_a_get`, parametrised over `PATHS` × `FOREIGN_ORIGINS`: `client.get(path, headers={"Origin": origin})` answers `200` and its reader ran once (a `GET` changes no state, so the Origin check does not apply; system design constraint 9) (Implements TC-INT-028; DAC-E2-10; AC-16, AC-17) — kills: negate-boolean on `host.lower() not in allowed_hosts` (the foreign host is served and the loopback one refused); a hand-written `"GET"` removed from `_SAFE_METHODS` (a foreign `Origin` on a `GET` answers `403 origin_not_allowed`); a hand-written port-free host comparison `host.split(":")[0] in {"127.0.0.1", "localhost", "[::1]"}` (`127.0.0.1:9000` is served); a hand-written `app.include_router(data_health.router)` moved below `_add_static_mount(app)` (the loopback request answers `404`).
- [ ] T008 Implement TC-INT-028 step 3 and its "every refusal carries a request id" result in `tests/integration/test_api_data_health_host_origin.py`, `# Implements TC-INT-028`, test `test_an_unknown_api_path_is_still_not_found`: `client.get("/api/data-health/unknown")` answers `404` with `response.json() == {"error": {"code": "not_found", "message": "No resource exists at this path.", "resource": "unknown", "request_id": response.headers["X-Request-Id"]}}` (the delivered fallback resource, the path's last segment; `_resource_for_path` is not extended, component-design-ingestion-api.md 3) and `reader_calls == []`; additionally every refusal of T007 (a) asserted `request_id` equal to a present `X-Request-Id` header (Implements TC-INT-028; DAC-E2-10 as the epic states it; AC-17) — kills: a hand-written `response.headers["X-Request-Id"] = request_id` removed from `request_id_middleware` (`KeyError` on the header in T007 and T008); a hand-written route `@router.get("/api/data-health/{rest:path}")` or a static mount added before the `/api` routes (the unknown path answers `200` or `index.html` instead of the envelope).

### Additional Unit Tests

None. This story writes integration tests only; the unit-level shapes, validation and propagation are CAP-003-E2-S4's (`tests/unit/test_api_data_health_models.py`, `tests/unit/test_api_data_health_routes.py`) and the credential scan is CAP-003-E2-S5's.

**Checkpoint**: Both files pass on the delivered code (`uv run pytest tests/integration/test_api_data_health.py tests/integration/test_api_data_health_host_origin.py`), and each test has been seen failing against its named mutant.

---

## Phase 3: Core Implementation

**Purpose**: None. The routes, readers, registration and middleware exist (CAP-003-E2-S1 to S5 and CAP-001's delivered application); this story changes no production file.

**Checkpoint**: `git diff --stat HEAD -- src/` is empty.

---

## Phase 4: Integration

**Purpose**: Prove the new files sit beside the delivered suites without disturbing them.

- [ ] T009 Run `uv run pytest tests/integration/test_api_data_health.py tests/integration/test_api_data_health_host_origin.py tests/integration/test_api_static_mount.py tests/integration/test_api_classification_host_origin.py tests/unit/test_api_host_origin.py tests/unit/test_api_no_secrets.py tests/unit/test_api_data_health_routes.py tests/unit/test_api_data_health_models.py` and confirm all pass; the two new files must also pass when run alone and in either order (each test owns its database through `postgres_connection_string`, so no seed leaks between tests). (DAC-E2-9, DAC-E2-10; depends on T003–T008)

**Checkpoint**: The new files and the delivered API suites are green together.

---

## Phase 5: Polish

**Purpose**: Final validation and the TDD evidence.

- [ ] T010 Run the full validation set (Validation Plan below) and fix any lint, format or type finding in this story's two files only. Confirm the test comments name `TC-INT-016`, `TC-INT-017` and `TC-INT-028` (`# Implements TC-INT-0NN`), and that `git diff --stat HEAD` lists exactly `tests/integration/test_api_data_health.py`, `tests/integration/test_api_data_health_host_origin.py` and this story's TDD evidence file. (depends on T009)
- [ ] T011 After each TDD cycle in T002–T010 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E2-S6-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence (RED: each new test's failure against the hand-written mutant its task names, applied to the working copy and reverted before staging; GREEN: its pass on the delivered code), the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change, which is every cycle of this test-only story), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every cycle is named by a TDD-evidence entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E2-S5 | hard | Existing graph edge. The routes answer through `create_app` only once S5's `include_router(data_health.router)` line exists |
| CAP-003-E2-S2 | hard | Existing graph edge. T003 compares `GET /api/attention` with `read_attention(conn)` on the same store |
| CAP-003-E2-S3 | hard | Existing graph edge. T003 compares `GET /api/data-health` with `read_data_health(conn)` |
| CAP-003-E2-S4 | hard | New graph edge. T003 and T004 import `AttentionResponse`, `DataHealthResponse` and `ProblemPageResponse` from `factorflow.api.data_health_models`, and T006 and T007 patch the reader names on `factorflow.api.routes.data_health`, both modules S4 creates; already reachable transitively through CAP-003-E2-S5, added so the direct import is a graph edge (the CAP-003-E2-S5 plan's precedent for its direct S1 import) |
| CAP-003-E2-S1 | hard | New graph edge. T004 imports `read_problems` from `factorflow.data_health`, which S1 creates; already reachable transitively through S2, S3 and S5 |
| CAP-003-E2-S7 | context | Sibling story that times `GET /api/data-health` at 3000 stocks (TC-INT-047, AD 5) and asserts the three-way equality at volume (TC-INT-026); cited only to place latency and volume outside this plan. Neither story imports the other's files |

### Task Dependencies
- T001: none
- T002: depends on T001
- T003, T004, T005, T006: depend on T002 (same file, shared fixture and helpers); sequential within the file
- T007: depends on T001; can run in parallel with T002–T006 (different file)
- T008: depends on T007 (same file, shared fixtures)
- T009: depends on T003–T008
- T010: depends on T009
- T011: interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- `tests/integration/test_api_data_health.py` (T002–T006) and `tests/integration/test_api_data_health_host_origin.py` (T007–T008) are independent files.

---

## Validation Plan

### Constitution-Defined Commands
(tech stack v7, Validation Commands table; working directory the repository root)
- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest` (both new files are `postgres`-marked and need a container runtime; without one run `uv run pytest -m 'not postgres'` and report the exclusion of these files, never as a green full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src` (the tests are outside `src`; ruff still checks them)

### Story-Specific Validation
- Focused: `uv run pytest tests/integration/test_api_data_health.py tests/integration/test_api_data_health_host_origin.py`
- AC-13, AC-16, DAC-E2-S6-1: T003 and T004 green; `affected_count`, `problems.stock_count`, the first-page rows and the concatenated pages are the same three stocks, matching both the literal and the reader
- AC-21, DAC-E2-9: T005 (empty store, `200`, both checks `null`) and T006 (`500` envelope) green for all three routes
- DAC-E2-S6-2: T006's exact-body equality and driver-text scan green
- DAC-E2-10: T007 and T008 green for every path, host and origin
- No production change: `git diff --quiet HEAD -- src/` exits `0`

---

## Notes

### Resolved Conflicts

1. **"The delivered envelope's fixed message" against a `500` body with no message.** DAC-E2-S6-2, TC-INT-017 and AD 4 speak of the `internal_error` envelope's "fixed message". The delivered `500` body is exactly `{"error": {"code": "internal_error", "request_id": <id>}}` (`src/factorflow/api/errors.py` `internal_error_handler`; asserted by the delivered `tests/unit/test_api_errors.py::test_500_body_is_only_the_internal_error_code_and_request_id`). AC-17 (CAP-001's behaviour is preserved, capability rank) governs: T006 asserts that exact body, with `request_id` equal to the `X-Request-Id` header and no `message` key; nothing is added to the envelope. The requirement the "fixed message" phrase carries — no internal detail (SEC-ERR-001) — is asserted by the driver-text scan. (Register C6.)
2. **The story's DAC-E2-10 against the epic's.** The story lists DAC-E2-10 as the Host and Origin clauses only; the epic's DAC-E2-10 adds that an unknown `/api` path still answers the `not_found` envelope and every refusal carries a request id, and TC-INT-028 tests all of it. The epic criterion outranks the story's abridged copy: T008 covers the two added clauses.
3. **Where the `500` envelope is asserted.** AD 7's "Database down" row names `tests/unit/test_api_data_health_routes.py`; DAC-E2-S4-3 and the CAP-003-E2-S4 plan (Resolved Conflict 4) assert propagation there and leave the envelope with `X-Request-Id` to this story. The story ACs govern: T006 asserts it through `create_app`.
4. **"Bodies match the reader's values" against a per-call `checked_at`.** `checked_at` is PostgreSQL's `now()` in each read (RD 2.3; the CAP-003-E2-S2 and S3 plans), so a body and a separate reader call can never agree on it. The requirement is that the route serves the reader's computation; T003 compares every other field and asserts the response's `checked_at` is aware and no earlier than the reader's. The attention fixture sets the credential so no `credential_missing` item, whose `recorded_at` is `checked_at`, enters the comparison.

### Open Gaps

None. No PROVISIONAL decision: the seed, the hosts, the origins and the page-loop guard are test data, not contracts; every asserted message, code and shape is pinned by the delivered `app.py` and `errors.py`, system design §4.2 and AD 2.4.

### Other Notes

- **Mapped test cases.** TC-INT-016, TC-INT-017 and TC-INT-028 (`tests/integration/integration-tests.md`); the coverage matrix lists this story "2 of 2" derived ACs covered (DAC-E2-S6-1 → TC-INT-016, DAC-E2-S6-2 → TC-INT-017). AD 7's "Empty store" row has no TC-ID and is T005. No component test case maps to this story.
- **Test-only story; TDD cycles without a production change.** The story makes no behaviour-changing production commit: the code under test lands in CAP-003-E2-S1 to S5. T011's cycles therefore carry `mutation: {not_applicable: "test-only story; no production change"}`, and the RED evidence of each cycle is its tests failing against the hand-written mutants below, applied to the working copy and reverted before the cycle's diff is staged (never staged, never committed).
- **Symmetric-comparison guard.** T003 and T004 compare the HTTP body with the reader's value dumped through the same response model, which cancels any mutant in the model or the reader. Each test therefore also asserts independent literals derived from the seed (`affected_count == 3`, `stock_count == 3`, `EXPECTED_ROWS`), and those carry the kills.
- **Lifespan loops.** Entering `TestClient` runs the delivered reclaim and classification loops against the test store. The seed holds only a `partial` run (no `running` or `cancelling` run for reclaim to touch), and the classification loop writes no table these reads use, so neither changes what the routes return. If the classification loop's logging proves noisy, the `api_classification_support._idle_scheduler` patch is the precedent; it is not required.
- **Snapshot consistency (register G5).** `read_data_health` issues several statements on a READ COMMITTED connection; the seeded store does not change during a request here, so the equalities hold. The concurrent-download case is not this story's to test.
- **Latency and volume are not here.** AD 5's p95 bound at 3000 stocks (AC-28, TC-INT-047) and the three-way equality at volume (TC-INT-026) are CAP-003-E2-S7's `tests/integration/test_data_health_volume.py`; this plan's store holds four stocks.
- **Register cross-check.** The epic resolution register's C4, C6, values 19 to 22 and the 2026-11-07 S4 seam correction agree with this plan.
- **Hand-written mutants** (apply each to the working copy for the RED run and revert; add to the mutation run beside the generated ones):
  - `src/factorflow/api/routes/data_health.py: read_problems(conn, cursor=cursor_symbol, limit=limit) → read_problems(conn, cursor=None, limit=limit)` (T004)
  - `src/factorflow/api/routes/data_health.py: read_problems(conn, cursor=cursor_symbol, limit=limit) → read_problems(conn, cursor=cursor_symbol, limit=DEFAULT_PAGE_SIZE)` (T004)
  - `src/factorflow/api/data_health_models.py: (DataHealthResponse.from_reader) checks=<object> → checks=None if health.never_acquired else <object>` (T005)
  - `src/factorflow/api/routes/data_health.py: with pool.connection() as conn: return ... → try: <same> except psycopg.Error: return <Response>.from_reader(<empty value>)` (T006)
  - `src/factorflow/api/app.py: except Exception as exc: response = await internal_error_handler(request, exc) → ` (deleted, `try/finally` kept) (T006)
  - `src/factorflow/api/app.py: _SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS"}) → frozenset({"HEAD", "OPTIONS"})` (T007)
  - `src/factorflow/api/app.py: if host is None or host.lower() not in allowed_hosts: → if host is None or host.lower().split(":")[0] not in {"127.0.0.1", "localhost", "[::1]"}:` (T007, `127.0.0.1:9000`)
  - `src/factorflow/api/app.py: response.headers["X-Request-Id"] = request_id → ` (deleted) (T006, T007, T008)
