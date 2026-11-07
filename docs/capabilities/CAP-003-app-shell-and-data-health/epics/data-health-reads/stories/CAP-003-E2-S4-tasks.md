---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S4-tasks
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
  timestamp: 2026-11-07T06:02:20Z
  source_artifacts:
    - id: CAP-003-E2-S4
      version: "1"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-data-health-api-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E2-S4 — data-health-api Router and Response Models for the Three Reads

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Creates `data-health-api` (component-design-data-health-api.md, "AD" below,
sections 2.1 to 2.4, 3, 4, 7): `src/factorflow/api/data_health_models.py`, the
Pydantic response models that mirror system design §4.2 field for field plus
each check's `exception_count` (DEC-0220), each with a `from_reader` classmethod
copying the `data-health-reader` dataclasses (component-design-data-health-reader.md,
"RD" below, 2.2) across, following the `classification_models.py` precedent;
and `src/factorflow/api/routes/data_health.py`, an `APIRouter` with
`GET /api/attention`, `GET /api/data-health` and `GET /api/data-health/problems`.
Each handler checks one connection out of `request.app.state.db_pool`, calls its
reader function once and returns the result through `from_reader`; the problems
route bounds `limit` with `Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE)`
and refuses a cursor that is not a symbol after `normalise` with
`422 validation_error`, resource `data-health`, without echoing it. A reader's
`psycopg.Error` propagates uncaught. The responses carry facts in the domain
vocabulary: no sentence, no tier, no secret. The router is not registered here
(CAP-003-E2-S5 adds the `include_router` line), so the unit tests run on a
minimal `FastAPI()` app that includes the router; no delivered file is edited
(AC-17, DEC-0211).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-11 | `GET /api/data-health` carries the verdict counts and the two checks | T004, T006, T009, T010 |
| AC-13 | Every problem row carries its failures' facts | T004, T005, T006, T009, T010 |
| AC-17 | No delivered model, route, status code or refusal changes; the new routes are additive | T001, T011, T012 |
| AC-19 | Field names stay in the domain vocabulary | T003, T009 |
| DAC-E2-3 | Problems route takes `limit` (default 50, max 500) and `cursor`; `422 validation_error` for a bad bound or a non-symbol cursor; never clamps; never echoes | T005, T007, T010 |
| DAC-E2-11 | Nullable counts and dates serialise as `null`, never omitted, never `0` | T004, T006, T009, T010 |
| DAC-E2-12 | No field named *stock* or *download*; no sentence or tier | T003, T009 |
| DAC-E2-S4-1 | Every §4.2 field present; ISO-8601 timestamps with offset; `YYYY-MM-DD` dates; the five nullables serialise as `null` | T004, T006, T009 |
| DAC-E2-S4-2 | `limit=0`, `limit=501`, `cursor=not a symbol` each `422 validation_error`; cursor refusal names `data-health` and its fixed message; no echo | T005, T010 |
| DAC-E2-S4-3 | Each handler calls its reader once with one pooled connection and returns through `from_reader`; `psycopg.Error` propagates | T006, T010 |
| DAC-E2-S4-4 | `limit` and `cursor` reach the reader only after validation; `credential_present` is a boolean; no handler logging | T007, T008, T009, T010 |

## Phase 1: Setup

**Purpose**: Confirm the prerequisites this plan imports before any file is written.

- [ ] T001 Confirm, without editing anything, and STOP and report if one does not hold: (a) CAP-003-E2-S1, CAP-003-E2-S2 and CAP-003-E2-S3 have landed `src/factorflow/data_health/models.py` with the thirteen frozen dataclasses of RD 2.2 (`Progress`, `LatestDownload`, `LatestTerminalDownload`, `Problems`, `AttentionItem`, `Attention`, `Failure`, `ProblemRow`, `ProblemPage`, `GapDetectionState`, `DailyPricesCheck`, `CompanyFinancialsCheck`, `DataHealth`) with exactly RD 2.2's fields, and `src/factorflow/data_health/__init__.py` exporting `read_attention`, `read_data_health` and `read_problems` (the S1 plan's T014, S2's T015, S3's T013); `read_problems` has the keyword-only signature `(conn, *, cursor, limit)`. (b) The delivered `factorflow.api.bounds.DEFAULT_PAGE_SIZE == 50` and `MAX_PAGE_SIZE == 500`; `factorflow.instruments.symbols.normalise` and `is_valid`; `factorflow.api.errors.error_response(status_code, code, message, request_id, resource=None, state=None)`; and `factorflow.api.app._validation_error_handler` (registered application-wide in `create_app` for `RequestValidationError`). (c) `src/factorflow/api/routes/data_health.py` and `src/factorflow/api/data_health_models.py` do not exist yet. Edit no delivered file: `api/app.py`, `api/models.py`, `api/bounds.py`, `api/errors.py` and `tests/unit/test_api_no_secrets.py` stay untouched (the router line and the no-secrets extension are CAP-003-E2-S5's, DEC-0211).

**Checkpoint**: Prerequisites confirmed; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the wire shapes, the parameter validation, the delegation and the propagation.

Shared harness, written once at the top of each test file as module-private helpers:

- Fixed literals: `T0 = datetime(2026, 10, 20, 21, 0, tzinfo=UTC)` (serialises `"2026-10-20T21:00:00Z"`); `T_EST = datetime(2026, 10, 20, 16, 30, tzinfo=timezone(timedelta(hours=-5)))` (serialises `"2026-10-20T16:30:00-05:00"`, proving an offset other than UTC is kept); `D0 = date(2026, 10, 19)` (serialises `"2026-10-19"`); `RUN_A = UUID("aaaaaaaa-0000-0000-0000-000000000001")`, `RUN_B = UUID("bbbbbbbb-0000-0000-0000-000000000002")`.
- Reader fixtures are built from the real dataclasses in `factorflow.data_health.models` with literal values, never from the code under test. The expected JSON is a hand-written literal `dict` in the test file (never produced by `from_reader`, `model_dump` or another model), so a mutant cannot cancel out on both sides.
- In `tests/unit/test_api_data_health_routes.py`: `_CONN = object()`; a `_FakePool` whose `connection()` is a `@contextmanager` that increments `self.checkouts` and yields `_CONN` (the `_FakePool` precedent of `tests/unit/test_api_coverage_routes.py`); a `_Spy` recording `(args, kwargs)` per call that returns a prepared value or raises a prepared exception (the `_Spy` precedent of the same file); `_unreached(name)` a spy raising `AssertionError(f"{name} reached")`. The reader functions are replaced where the router looks them up, `monkeypatch.setattr("factorflow.api.routes.data_health.read_attention", spy)` (and likewise `read_data_health`, `read_problems`); every test installs all three, the ones it does not expect as `_unreached`. `_client(pool, *, raise_server_exceptions=True)` builds `app = FastAPI()`, `app.add_exception_handler(RequestValidationError, _validation_error_handler)` (the delivered handler, imported from `factorflow.api.app`; precedent of importing a private: `tests/unit/test_api_reclaim_lifespan.py`), `app.include_router(data_health.router)`, `app.state.db_pool = pool`, and returns `TestClient(app, base_url="http://127.0.0.1:8000", raise_server_exceptions=...)`. No `create_app`, no database, no environment variable.

### Mandatory Component Tests

- [ ] T002 [P] Create `tests/unit/test_api_data_health_models.py` (no `postgres` marker) with the shared literals and these reader fixtures from `factorflow.data_health.models`: `ATTENTION_FULL` (`checked_at=T0`, `followed_count=3`, `prices_as_of=D0`, `credential_present=True`, `Problems(2, ("AAA", "BBB"), T_EST)`, `LatestDownload(RUN_A, "running", T0, T0, None, Progress(1, 3))`, `LatestTerminalDownload(RUN_B, "failed", T0, "provider unavailable")`, items `AttentionItem("data_problems", T_EST, None)` and `AttentionItem("download_not_complete", T0, RUN_B)`); `ATTENTION_EMPTY` (`T0`, `0`, `None`, `False`, `Problems(0, (), None)`, `None`, `None`, one item `AttentionItem("credential_missing", T0, None)`); `ATTENTION_UNNAMED` (as full but `Progress(0, None)` and `started_at=None`); `HEALTH_FULL` (`never_acquired=False`, `followed_count=3`, `affected_count=2`, `DailyPricesCheck("exceptions", 1, None, 1, D0, GapDetectionState(False, "fewer_than_two_instruments_with_data"), 2, ("AAA", "BBB"))`, `CompanyFinancialsCheck("exceptions", 1, 1, T_EST, 2, ("AAA", "CCC"))`, `ProblemPage((ProblemRow("AAA", (Failure("fundamentals", "not_found", None, 2, T0, RUN_B), Failure("prices", "failed", "provider timeout", 3, T_EST, RUN_B)), True),), "AAA")`); `HEALTH_ZEROS` (`never_acquired=False`, `followed_count=1`, `affected_count=0`, `DailyPricesCheck("ok", 0, 0, 0, None, GapDetectionState(True, None), 0, ())`, `CompanyFinancialsCheck("ok", 0, 0, None, 0, ())`, `ProblemPage((), None)`); `HEALTH_NEVER` (`T0`, `True`, `0`, `0`, `None`, `None`, `ProblemPage((), None)`). Shared by T003 and T004; holds no assertion itself.
- [ ] T003 Implement TC-COMP-037 (responses keep the domain vocabulary with no sentence or tier) in `tests/unit/test_api_data_health_models.py` (`# Implements TC-COMP-037`). (a) A helper `field_names(model)` walks `model.model_fields` recursively into every nested `BaseModel` (unwrapping `X | None` and `list[X]` annotations with `typing.get_args`) and returns the set of field names found; assert, against a hand-written literal set, that the union over `AttentionResponse`, `DataHealthResponse` and `ProblemPageResponse` equals exactly `{"checked_at", "followed_count", "prices_as_of", "credential_present", "problems", "stock_count", "symbols", "newest_completed_at", "latest_download", "run_id", "state", "requested_at", "started_at", "ended_at", "progress", "done", "total", "latest_terminal_download", "failure_reason", "items", "kind", "recorded_at", "never_acquired", "affected_count", "checks", "daily_prices", "company_financials", "status", "absent_count", "gap_stock_count", "behind_count", "latest_session", "gap_detection", "available", "reason", "exception_count", "exception_symbols", "problem_count", "as_of", "rows", "next_cursor", "symbol", "failures", "data_type", "outcome", "attempts", "completed_at", "retryable"}`. (b) No field name is one of `stock`, `stocks`, `download`, `downloads`, `tier`, `sentence`, `message`, `label`, `text`, `title` (DAC-E2-12 as read in Resolved Conflict 1). (c) No serialised string value of `ATTENTION_FULL`, `HEALTH_FULL` or `HEALTH_ZEROS` through `from_reader` is a tier name (`critical`, `serious`, `warning`, `good`, `neutral`): collect every string leaf of `model_dump(mode="json")` (Implements TC-COMP-037; AC-19, DAC-E2-12) — kills: a hand-written added field `tier: str = "good"` on `DailyPricesCheckResponse` (the name set gains `tier`, (b) and (c) fail), drop-field-copy of `exception_count` replaced by an omitted field (the name set loses it), and a hand-written rename `stock_count` → `stocks` (the literal set differs, which also guards the field-for-field mirror CAP-003-E3-S1's browser types depend on).
- [ ] T004 Implement TC-COMP-050 (response models serialise every field with nulls, never omitted) in `tests/unit/test_api_data_health_models.py` (`# Implements TC-COMP-050`). For each fixture of T002, assert `<Model>.from_reader(fixture).model_dump(mode="json")` equals a hand-written literal `dict` in the test file: `AttentionResponse` for the three attention fixtures, `DataHealthResponse` for the three health fixtures, `ProblemPageResponse` for `HEALTH_FULL.problems`. The literals pin, field for field: every §4.2 key present at every level; timestamps as `"2026-10-20T21:00:00Z"` and `"2026-10-20T16:30:00-05:00"`; session dates as `"2026-10-19"`; UUIDs as their string; tuples as JSON lists; `items` and `failures` in fixture order; and `null`, with the key present, for `prices_as_of` and `problems.newest_completed_at` (`ATTENTION_EMPTY`), `progress.total` with `done` `0` and `started_at` (`ATTENTION_UNNAMED`), `latest_download` and `latest_terminal_download` (`ATTENTION_EMPTY`), `gap_stock_count` (`HEALTH_FULL`), `gap_detection.reason`, `latest_session` and `as_of` (`HEALTH_ZEROS`), `failures[0].reason`. Beside them, `HEALTH_ZEROS` serialises `gap_stock_count` as `0` (a value of `0` stays `0`, so `null` and `0` are told apart). Edge from the TC, read as Resolved Conflict 2 settles it: `HEALTH_NEVER` serialises `checks` as the object `{"daily_prices": null, "company_financials": null}`, never as `null` and never omitted, with `never_acquired: true`; `HEALTH_FULL` serialises both members as objects with `never_acquired: false`. Additionally assert, for every timestamp string in the three full fixtures' output, `datetime.fromisoformat(value).tzinfo is not None` (Implements TC-COMP-050; DAC-E2-S4-1, DAC-E2-11; AC-11, AC-13, AC-24) — kills: drop-field-copy on each copied field (e.g. `gap_stock_count=check.gap_stock_count` → `gap_stock_count=None` changes `HEALTH_ZEROS`' `0`; `exception_count`, `as_of`, `failure_reason`, `run_id` likewise change a literal), hand-written `gap_stock_count=check.gap_stock_count or 0` and `total=progress.total or 0` (the `null` literals read `0`), a hand-written type change `prices_as_of: date | None` → `datetime | None` (`"2026-10-19"` reads `"2026-10-19T00:00:00"`), and a hand-written `checks=None if health.never_acquired else ...` (the `HEALTH_NEVER` literal expects the object).
- [ ] T005 Implement TC-COMP-051 (problems route refuses bad limit and cursor with 422 and no echo) in `tests/unit/test_api_data_health_routes.py` (`# Implements TC-COMP-051`), on `_client(_FakePool())` with all three reader functions `_unreached`. `GET /api/data-health/problems?limit=0` and `?limit=501` each answer `422` with `response.json() == {"error": {"code": "validation_error", "message": "The request did not match the expected shape: `limit`.", "resource": "problems", "request_id": "unknown"}}` (the delivered handler's fixed message and its path fallback; Resolved Conflict 3), and `"501" not in response.text` for the second. `GET /api/data-health/problems?cursor=not%20a%20symbol` answers `422` with `response.json() == {"error": {"code": "validation_error", "message": "`cursor` must be a stock symbol.", "resource": "data-health", "request_id": "unknown"}}` and `"not a symbol" not in response.text` and `"NOT A SYMBOL" not in response.text`. `?cursor=` (empty) answers the same cursor refusal. After every refusal `pool.checkouts == 0` (validation precedes the checkout). Edge from the TC: `?cursor=ko` with a `read_problems` spy returning `ProblemPage((), None)` answers `200` and the spy's single call has `kwargs["cursor"] == "KO"` (Implements TC-COMP-051; DAC-E2-S4-2, DAC-E2-3; AC-13) — kills: off-by-one on `gt=0` → `ge=0` (`limit=0` reaches the reader, which is `_unreached`), negate-boolean on `not is_valid(cursor_symbol)` (the bad cursor reaches the reader and `ko` is refused), drop-defaulted-argument on `resource=_RESOURCE` (`resource` reads `null`), a hand-written removal of `normalise(...)` (`ko` fails `is_valid` and is refused), a hand-written message carrying `{cursor!r}` (the body contains the value).
- [ ] T006 Implement TC-COMP-052 (each handler delegates once and lets `psycopg.Error` propagate) in `tests/unit/test_api_data_health_routes.py` (`# Implements TC-COMP-052`). Delegation, one test per route on a fresh `_FakePool()`, the two other readers `_unreached`: `GET /api/attention` with a `read_attention` spy returning `ATTENTION_FULL` (the same literal fixture as T002, redeclared in this file) answers `200` with `response.json()` equal to the hand-written literal of T004 for that fixture; the spy has exactly one call, whose `args` is a 1-tuple whose element `is _CONN` and whose `kwargs == {}`; `pool.checkouts == 1`. Likewise `GET /api/data-health` with `read_data_health` returning `HEALTH_FULL`, and `GET /api/data-health/problems?cursor=AAA&limit=7` with `read_problems` returning `HEALTH_FULL.problems` (the spy's `kwargs == {"cursor": "AAA", "limit": 7}`, `limit` an `int`). Empty store (AC-21, DAC-E2-9): `read_attention` returning `ATTENTION_EMPTY` answers `200` with zero counts and `latest_terminal_download: null`, and `read_data_health` returning `HEALTH_NEVER` answers `200` with `never_acquired: true` and `checks == {"daily_prices": None, "company_financials": None}`. Propagation, parametrised over the three paths: the path's reader raises a prepared `err = psycopg.OperationalError("connection lost")`; on `_client(pool, raise_server_exceptions=True)`, `with pytest.raises(psycopg.Error) as excinfo: client.get(path)` and `assert excinfo.value is err` (the minimal app registers no `Exception` handler, so the identical object reaching the test proves no handler code caught, wrapped or replaced it; the delivered `500` envelope with `X-Request-Id` is asserted through `create_app` in CAP-003-E2-S6) (Implements TC-COMP-052; DAC-E2-S4-3, DAC-E2-9; AC-11, AC-21) — kills: swap-case of the reader called by a handler (e.g. `get_data_health` calling `read_attention` hits `_unreached`), a hand-written `try: ... except psycopg.Error: return ...` in a handler (no exception, or a different object, reaches the test), a hand-written second `pool.connection()` checkout (`checkouts == 2`), drop-defaulted-argument on `limit=limit` passed to `read_problems` (the reader's call lacks `limit`, a `TypeError` on the real keyword-only signature and a `kwargs` mismatch on the spy), and a hand-written `response_model_exclude_none=True` on a route decorator (the literal's `null` keys go missing).
- [ ] T007 Implement TC-COMP-053 (validated parameters reach SQL only as bound values; no extra logging) in `tests/unit/test_api_data_health_routes.py` (`# Implements TC-COMP-053`). (a) Only validated values reach the reader: `GET /api/data-health/problems` with no parameter calls `read_problems` with `kwargs == {"cursor": None, "limit": 50}`; `?limit=1` and `?limit=500` each reach the reader with that `int` (the bounds are inclusive and never clamped); `?cursor=%20brk.b%20` reaches it as `"BRK.B"`; every refused request of T005 reached no reader (already proved there). (b) The router holds no SQL and no logging: `src = inspect.getsource(factorflow.api.routes.data_health)`; assert `".execute(" not in src`, `"import logging" not in src`, `"getLogger" not in src`, `"print(" not in src`. (c) Behaviourally, with `caplog.set_level(logging.DEBUG)`, one successful request to each route and one cursor refusal leave no record whose `name` starts with `"factorflow"` (the minimal app has no request-id middleware, so any `factorflow` record would be the handlers' own; `httpx` records from the test client are ignored) (Implements TC-COMP-053; DAC-E2-S4-4; AC-4; SEC-INP-001, SEC-INP-002) — kills: drop-defaulted-argument on `default=DEFAULT_PAGE_SIZE` (the bare request is refused instead of reaching the reader with `50`), off-by-one on `le=MAX_PAGE_SIZE` → `lt=MAX_PAGE_SIZE` (`limit=500` is refused), a hand-written `_LOGGER.info("problems page %s", cursor)` in a handler (a `factorflow` record appears and the static check fails).

### Additional Unit Tests

- [ ] T008 [P] Route table and credential type in `tests/unit/test_api_data_health_routes.py`: (a) `{(route.path, frozenset(route.methods)) for route in data_health.router.routes if isinstance(route, APIRoute)}` equals the literal `{("/api/attention", {"GET"}), ("/api/data-health", {"GET"}), ("/api/data-health/problems", {"GET"})}` (system design constraint 9: every route is `GET` and changes no state; AD 3, route order: neither literal path captures the other); (b) `GET /api/data-health/problems` is served by the problems handler, not the data-health one: with `read_data_health` `_unreached` and a `read_problems` spy, it answers `200`. In `tests/unit/test_api_data_health_models.py`: `AttentionResponse.model_fields["credential_present"].annotation is bool`, and `AttentionResponse.from_reader(ATTENTION_FULL).model_dump(mode="json")["credential_present"] is True` (a JSON boolean, never a string; AC-4, DAC-E2-S4-4) — kills: a hand-written `@router.post` on a handler (method set differs), a hand-written type change `credential_present: bool` → `str` (Pydantic v2 refuses the `bool` input, so `from_reader` raises).

**Checkpoint**: All tests written; they fail on `ImportError` for `factorflow.api.data_health_models` and `factorflow.api.routes.data_health` (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: Create the response models and the router.

- [ ] T009 Create `src/factorflow/api/data_health_models.py`. Module docstring cites AD 2.4, system design §4.2, RD 2.2, DEC-0200 (facts in the domain vocabulary, no sentence, no tier), DEC-0220 (`exception_count`), DEC-0213 (nullable counts are `null`, never `0`) and the `classification_models.py` precedent (a separate module, so no delivered file is edited). One `pydantic.BaseModel` per shape, fields in RD 2.2 order, no defaults (every field is required, so none can be omitted), no `exclude_none`, no `model_config` that drops `None`:
  - `ProgressResponse` (`done: int`, `total: int | None`); `LatestDownloadResponse` (`run_id: UUID`, `state: str`, `requested_at: datetime`, `started_at: datetime | None`, `ended_at: datetime | None`, `progress: ProgressResponse`); `LatestTerminalDownloadResponse` (`run_id: UUID`, `state: str`, `ended_at: datetime`, `failure_reason: str | None`); `ProblemsResponse` (`stock_count: int`, `symbols: list[str]`, `newest_completed_at: datetime | None`); `AttentionItemResponse` (`kind: Literal["data_problems", "download_not_complete", "credential_missing"]`, `recorded_at: datetime`, `run_id: UUID | None`); `AttentionResponse` (`checked_at: datetime`, `followed_count: int`, `prices_as_of: date | None`, `credential_present: bool`, `problems: ProblemsResponse`, `latest_download: LatestDownloadResponse | None`, `latest_terminal_download: LatestTerminalDownloadResponse | None`, `items: list[AttentionItemResponse]`).
  - `FailureResponse` (`data_type: str`, `outcome: Literal["failed", "not_found"]`, `reason: str | None`, `attempts: int`, `completed_at: datetime`, `run_id: UUID`); `ProblemRowResponse` (`symbol: str`, `failures: list[FailureResponse]`, `retryable: bool`); `ProblemPageResponse` (`rows: list[ProblemRowResponse]`, `next_cursor: str | None`).
  - `GapDetectionResponse` (`available: bool`, `reason: str | None`); `DailyPricesCheckResponse` (`status: Literal["ok", "exceptions", "not_determinable"]`, `absent_count: int`, `gap_stock_count: int | None`, `behind_count: int`, `latest_session: date | None`, `gap_detection: GapDetectionResponse`, `exception_count: int`, `exception_symbols: list[str]`); `CompanyFinancialsCheckResponse` (`status: Literal["ok", "exceptions"]`, `absent_count: int`, `problem_count: int`, `as_of: datetime | None`, `exception_count: int`, `exception_symbols: list[str]`); `ChecksResponse` (`daily_prices: DailyPricesCheckResponse | None`, `company_financials: CompanyFinancialsCheckResponse | None`); `DataHealthResponse` (`checked_at: datetime`, `never_acquired: bool`, `followed_count: int`, `affected_count: int`, `checks: ChecksResponse`, `problems: ProblemPageResponse`).
  - Each model has `@classmethod from_reader(cls, value: <dataclass>) -> "<Model>"` copying every field by name, recursing through the nested models' own `from_reader`, converting tuples to lists, mapping a `None` nested dataclass to `None`, and nothing else: no default substituted, no clamp, no state or reason rewritten (states and reasons pass through as recorded, AD 2.4). `DataHealthResponse.from_reader` nests the reader's top-level `daily_prices` and `company_financials` under `checks=ChecksResponse(...)`, always an object (Resolved Conflict 2). The five models AD 2.4 names keep their names; the nested ones are named as above (class names are not on the wire). Comments and docstrings name AC-11, AC-13, AC-19, DAC-E2-11, DAC-E2-12 and DAC-E2-S4-1. (depends on T001)
- [ ] T010 Create `src/factorflow/api/routes/data_health.py` as AD 2.3 shows it. Module docstring cites AD 2.1 to 2.3, 3 and 4, DEC-0200, DEC-0208, DEC-0211, SEC-INP-001, SEC-INP-002 and SEC-ERR-001, says the router validates, delegates and shapes and holds no SQL, no derivation and no logging, and that registration is CAP-003-E2-S5's. Contents: `router = APIRouter()`; `_RESOURCE: Final = "data-health"`; the three readers imported by name, `from factorflow.data_health import read_attention, read_data_health, read_problems` (the seam the T006 doubles, and CAP-003-E2-S5's no-secrets stubs, patch on `factorflow.api.routes.data_health`); the models from `factorflow.api.data_health_models`; `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE` from `factorflow.api.bounds`; `error_response` from `factorflow.api.errors`; `is_valid`, `normalise` from `factorflow.instruments.symbols`.
  - `@router.get("/api/attention", response_model=AttentionResponse) def get_attention(request: Request) -> AttentionResponse`: `with request.app.state.db_pool.connection() as conn: return AttentionResponse.from_reader(read_attention(conn))`.
  - `@router.get("/api/data-health", response_model=DataHealthResponse) def get_data_health(request: Request) -> DataHealthResponse`: the same with `read_data_health` and `DataHealthResponse`.
  - `@router.get("/api/data-health/problems", response_model=None) def get_problems(request: Request, limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE), cursor: str | None = Query(default=None)) -> JSONResponse | ProblemPageResponse`: `cursor_symbol = normalise(cursor) if cursor is not None else None`; if `cursor_symbol is not None and not is_valid(cursor_symbol)`, return `error_response(status_code=422, code="validation_error", message="`cursor` must be a stock symbol.", request_id=getattr(request.state, "request_id", "unknown"), resource=_RESOURCE)` before any checkout; otherwise one checkout and `read_problems(conn, cursor=cursor_symbol, limit=limit)` through `ProblemPageResponse.from_reader`. A `limit` outside 1 to 500 is refused by the `Query` bound through the delivered application-wide handler, never clamped (the `routes/coverage.py` precedent). If T004's literal timestamps (`...Z`) do not come back from this route because FastAPI's encoder for `response_model=None` serialises differently from `model_dump(mode="json")`, return `JSONResponse(content=model.model_dump(mode="json"))` as `routes/coverage.py` does; the T006 literal decides, not the snippet.
  - No `try`/`except` anywhere (a `psycopg.Error` propagates to the delivered `500` handler, DAC-E2-S4-3); no `commit`, no `rollback`; no logger. Ruff `B008` on `Query(...)` defaults is handled as `routes/coverage.py` handles it. (depends on T009)

**Checkpoint**: T002 to T008 pass; `uv run mypy src` is clean for the two new modules.

---

## Phase 4: Integration

**Purpose**: Prove the new modules leave the delivered API untouched; nothing is wired here.

- [ ] T011 Run the delivered API unit suites unchanged: `uv run pytest tests/unit/test_api_no_secrets.py tests/unit/test_api_host_origin.py tests/unit/test_api_isolation.py tests/unit/test_api_errors.py tests/unit/test_api_models.py tests/unit/test_api_coverage_routes.py tests/unit/test_api_classifications_routes.py`. All pass without edits: the router is not registered, so `create_app()` serves exactly the delivered routes (AC-17). Do not edit `src/factorflow/api/app.py` and do not add the `include_router` line: that is CAP-003-E2-S5's (DEC-0211); the delivered `500` envelope and the Host and Origin middleware on these routes are asserted through `create_app` in CAP-003-E2-S6. (depends on T010)

**Checkpoint**: Delivered API suites green; `git diff --stat` names only the new files.

---

## Phase 5: Polish

**Purpose**: Final validation and the TDD evidence.

- [ ] T012 Run the full validation set (Validation Plan below) and fix any lint, format or type finding in this story's four files only. Confirm the test comments name `TC-COMP-037`, `TC-COMP-050`, `TC-COMP-051`, `TC-COMP-052` and `TC-COMP-053` (`# Implements TC-COMP-0NN`) and that `git diff --stat` lists exactly `src/factorflow/api/data_health_models.py`, `src/factorflow/api/routes/data_health.py`, `tests/unit/test_api_data_health_models.py` and `tests/unit/test_api_data_health_routes.py`, plus this story's TDD evidence file (AC-17, DEC-0211). (depends on T011)
- [ ] T013 After each TDD cycle in T002–T012 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E2-S4-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E2-S1 | hard | Existing graph edge. Imports `models.py` (`Failure`, `ProblemRow`, `ProblemPage`, and every dataclass `from_reader` maps) and `read_problems` from `factorflow.data_health` |
| CAP-003-E2-S2 | hard | Existing graph edge. Imports `read_attention` (exported from `__init__.py` by S2's T015) |
| CAP-003-E2-S3 | hard | Existing graph edge. Imports `read_data_health` (exported by S3's T013) |
| CAP-003-E2-S5 | reverse | Imports `factorflow.api.routes.data_health.router` into `create_app` and stubs the three readers on this module for the no-secrets test; its graph line holds this story |
| CAP-003-E2-S6 | reverse | Exercises these routes through `create_app` and asserts the delivered `500` envelope with `X-Request-Id` and the Host and Origin posture (DAC-E2-S4-3 defers those there); reaches this story through its edge on CAP-003-E2-S5 |
| CAP-003-E2-S7 | reverse | Times `GET /api/data-health` served by this router at 3,000 stocks (AD 5); reaches this story through CAP-003-E2-S5 |
| CAP-003-E3-S1 | soft | Its browser types `Attention`, `DataHealth` and `ProblemPage` mirror these responses field for field (component-design-owner-shell); both build concurrently against system design §4.2, which T003's literal field set pins on this side |

No new hard edge: the three imports this plan makes are already the graph line `CAP-003-E2-S4: [CAP-003-E2-S1, CAP-003-E2-S2, CAP-003-E2-S3]`.

### Task Dependencies
- T001: none
- T002: depends on T001; T003, T004 depend on T002 (same file); T008's models half joins that file after T004
- T005, T006, T007: depend on T001; same file (`tests/unit/test_api_data_health_routes.py`, shared harness), written in that order; T008's routes half after T007
- T009: depends on T001
- T010: depends on T009
- T011: depends on T010
- T012: depends on T011
- T013: interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: the models test file (T002–T004) and the routes test file (T005–T007) are independent
- Phase 3: none (the router imports the models)

---

## Validation Plan

### Constitution-Defined Commands
(tech stack v7, Validation Commands table; working directory the repository root)
- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest` (needs a container runtime for `postgres`-marked tests; without one run `uv run pytest -m 'not postgres'` and report the exclusion, never as a green full suite; this story's own tests carry no `postgres` marker)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- Focused: `uv run pytest tests/unit/test_api_data_health_models.py tests/unit/test_api_data_health_routes.py`
- DAC-E2-S4-1, DAC-E2-11: T004 passes; every nullable key is present with `null`, and `gap_stock_count` `0` stays `0`
- DAC-E2-S4-2, DAC-E2-3: T005 passes (`limit` 0 and 501, the bad and the empty cursor refused with the literal envelopes; `ko` accepted as `KO`)
- DAC-E2-S4-3: T006 passes (one call, one checkout, the identical `psycopg.Error` object reaches the test)
- DAC-E2-S4-4: T007 and T008 pass (validated values only; no `factorflow` log record; `credential_present` a JSON boolean)
- DAC-E2-12, AC-19: T003 passes
- AC-17: T011 passes and `git diff --stat` names only the four new files and the evidence file

---

## Notes

### Resolved Conflicts

1. **"No response field named *stock* or *download*" against fields that contain those words.** DAC-E2-12 says no response field is "named *stock* or *download*", while system design §4.2 and AD 2.4 define `problems.stock_count`, `gap_stock_count`, `latest_download` and `latest_terminal_download`. The same epic's DAC-E2-11 (equal rank) names `gap_stock_count` as a response field that MUST serialise as `null`, and the story's DAC-E2-S4-1 names it too, so the epic's criteria are consistent only if DAC-E2-12 forbids a field whose name *is* the display-vocabulary word (`stock`, `download`) standing for an `instrument` or an `acquisition_run`, not a field whose compound name contains it. Governing: DAC-E2-11 and DAC-E2-12 read together, with system design §4.2. T003 asserts the exact §4.2 field set and that no field is named `stock`, `stocks`, `download` or `downloads`; no field is renamed.
2. **`checks` null against `checks` members null.** TC-COMP-050's edge says "`checks` null exactly when `never_acquired`"; system design §4.2 ("both checks are null when `never_acquired`"), AD 2.4 ("`checks {daily_prices, company_financials}`, each null exactly when `never_acquired` is true") and the story's API Contract put the null on the two members. The design's normative prose outranks the test specification: `checks` is always an object and its two members are `null` together exactly when `never_acquired` is true (T004, T006, T009).
3. **`create_app` against the minimal app.** TC-COMP-051's precondition is "`create_app` with the reader stubbed"; the story says the unit tests run "on a minimal `FastAPI()` app including the router", because the router is registered only in CAP-003-E2-S5. A bare `FastAPI()` answers a bad `limit` with FastAPI's default `{"detail": [...]}` body, which echoes the input and carries no `validation_error` code, failing DAC-E2-S4-2. The story governs over the test specification: the minimal app gets the delivered `_validation_error_handler` (imported from `factorflow.api.app`, as `tests/unit/test_api_reclaim_lifespan.py` imports a private), so the `limit` refusal is the delivered envelope, with `resource` `problems` (the delivered last-segment fallback; `_resource_for_path` is not extended, component-design-ingestion-api 3; epic Open Question 2) and `request_id` `"unknown"` (no request-id middleware on the minimal app).
4. **Where the `500` envelope is asserted.** AD 7's "Database down" row puts the `500` `internal_error` envelope with `X-Request-Id` in `tests/unit/test_api_data_health_routes.py`; DAC-E2-S4-3 says the handler lets `psycopg.Error` propagate uncaught and that the envelope is asserted in CAP-003-E2-S6. The story AC governs: T006 asserts propagation of the identical object only. The delivered `500` body is exactly `{"error": {"code": "internal_error", "request_id": ...}}`, with no `message` (`src/factorflow/api/errors.py`), for whoever asserts it in S6.

### Open Gaps

None. No PROVISIONAL decision: every value this plan uses is fixed by an artifact or the delivered code: the bounds by `api/bounds.py` and AD 2.3; the cursor refusal's code, message and resource by AD 2.3 and DAC-E2-S4-2; the `limit` refusal's message and resource by the delivered `_validation_error_handler`; the fields by system design §4.2, AD 2.4 and RD 2.2. The nested models' class names are implementation detail (they are not on the wire).

### Other Notes

- **Mapped test cases.** TC-COMP-037, TC-COMP-050, TC-COMP-051, TC-COMP-052 and TC-COMP-053 (`tests/component/data-health-api-tests.md`); the coverage matrix lists the story "4 of 4" derived ACs covered by them. AD 7's integration rows (`tests/integration/test_api_data_health.py`, `test_api_data_health_host_origin.py`) belong to CAP-003-E2-S6, and the AC-28 latency row (`tests/integration/test_data_health_volume.py`) to CAP-003-E2-S7.
- **Wire format of timestamps.** Pydantic v2 serialises an aware UTC `datetime` as `...Z`, which is ISO-8601 with an offset (the precedent `tests/unit/test_api_classifications_routes.py` asserts the same); a non-UTC offset is kept as `-05:00`. The reader's `datetime` values come from `timestamptz` columns and are aware.
- **No length constraint on `symbols` or `exception_symbols`.** AD 2.4's `symbols[≤3]` and `exception_symbols[≤5]` describe what the reader returns (RD 2.2; asserted in CAP-003-E2-S2 and E2-S3). The models do not add `max_length`: a violation would turn a reader fact into a response-validation `500`, and mirroring field for field adds no rule.
- **States pass through.** `state` stays `str` (the reader's type) so a recorded state reaches the interface as recorded (AD 2.4, DEC-0210, DEC-0217); `status`, `kind` and `outcome` are the `Literal`s RD 2.2 declares.
- **Register cross-check.** The epic resolution register's C3, C4, C5 and values 18 to 22 and 24 agree with this plan; DAC-E2-12's reading (Resolved Conflict 1) is added to its Corrections.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `src/factorflow/api/data_health_models.py: gap_stock_count=check.gap_stock_count → gap_stock_count=check.gap_stock_count or 0` (killed by T004)
  - `src/factorflow/api/data_health_models.py: total=progress.total → total=progress.total or 0` (T004)
  - `src/factorflow/api/data_health_models.py: prices_as_of: date | None → prices_as_of: datetime | None` (T004)
  - `src/factorflow/api/data_health_models.py: checks=ChecksResponse( → checks=None if health.never_acquired else ChecksResponse(` (T004; mypy needs `checks: ChecksResponse | None` for the mutant to type-check, so apply both)
  - `src/factorflow/api/routes/data_health.py: @router.get("/api/data-health", response_model=DataHealthResponse) → @router.get("/api/data-health", response_model=DataHealthResponse, response_model_exclude_none=True)` (T006)
  - `src/factorflow/api/routes/data_health.py: with request.app.state.db_pool.connection() as conn: → with request.app.state.db_pool.connection() as conn, request.app.state.db_pool.connection() as _second:` (in `get_attention`; T006, `checkouts == 2`)
  - `src/factorflow/api/routes/data_health.py: cursor_symbol = normalise(cursor) if cursor is not None else None → cursor_symbol = cursor` (T005)
  - `src/factorflow/api/routes/data_health.py: message="`cursor` must be a stock symbol." → message=f"`cursor` must be a stock symbol, not {cursor!r}."` (T005)
- **Equivalent mutants** (record as such, with the reason): `getattr(request.state, "request_id", "unknown")` → `"unknown"` is not observable on the minimal app, which has no request-id middleware; the request id on these routes is observed through `create_app` in CAP-003-E2-S6.
