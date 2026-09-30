---
artifact_schema_version: 1
artifact_id: CAP-001-E6-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-29
updated: 2026-09-30
docs_synced_review: CAP-001-E6-S3-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: devin
  tool: Devin
  tool_version: unknown
  timestamp: 2026-09-29T02:30:13Z
  source_artifacts:
    - id: CAP-001-E6-S3
      version: "1"
    - id: CAP-001-E6
      version: "1"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-component-design-coverage-service
      version: "6"
    - id: CAP-001-component-design-owner-web-app
      version: "approved"
    - id: CAP-001-ux-design
      version: "approved"
    - id: CAP-001-component-tests
      version: "1"
    - id: CAP-001-E6-S1-tasks
      version: "1"
    - id: CAP-001-E6-S2-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E6-S3 — Coverage API Endpoint

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E6-tasks`
**Date**: 2026-09-29

## Summary

Delivers `src/factorflow/api/routes/coverage.py`, the `GET /api/coverage` route, so
the Coverage screen has one contract to call for per-instrument coverage, gap counts,
gap-detection availability and the never-acquired state (AC-7, AC-8, AC-17). The route
is thin (ingestion-api design sections 1 and 3: "Coverage is read, never computed
here"). It validates the query (`symbol`, `lifecycle`, `from`, `to`, `limit`,
`cursor`), calls `read_coverage`, which CAP-001-E6-S1 delivers and CAP-001-E6-S2
extends with gap fields, and maps the `CoverageView` dataclasses onto the response
shape in the story's API contract. Bad bounds, an unknown lifecycle value and an
inverted date range return `422` in the shared error envelope. Nothing is clamped
silently. Specific gap dates are not included in the collapsed rows. They are
available through an additive, opt-in `expand=<symbol>` query parameter backed by
S2's `read_gap_dates` (DAC-E6-S3-2). The exact shape is PROVISIONAL (Open Gap 1). No
coverage arithmetic, SQL or service change is added here.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | `GET /api/coverage` reports per-instrument data-type presence, covered ranges and last-acquired | T002, T009, T012, T013, T014, T015, T016 |
| AC-8 | Gap counts and gap-detection availability with a reason are present | T003, T005, T012, T013, T014, T015 |
| AC-17 | Nothing acquired → `never_acquired` is true | T004, T013, T015 |
| DAC-E6-10 | Symbol filter, lifecycle filter, `from`, `to`, `limit`, `cursor` supported | T009, T010, T011, T013, T015 |
| DAC-E6-S3-1 | Unavailable → `gap_detection` unavailable with reason; gap counts absent, not zero | T004, T005, T013, T014, T015 |
| DAC-E6-S3-2 | Specific gap dates through expansion, not in every collapsed row; default response bounded at 3000 | T003, T006, T011, T013, T014, T015 |
| DAC-E6-S3-3 | `limit` beyond the canonical bound → `422`, not clamped | T010, T013, T015 |
| DAC-E6-S3-4 | Lifecycle filter includes/excludes retired explicitly; default includes them | T007, T013, T015 |
| DAC-E6-S3-5 | `from` later than `to` → `422` | T008, T013, T015 |

## Phase 1: Setup

**Purpose**: None required. The route, model and wiring files already exist or are created
in Phases 3–4. `fastapi`, `pydantic` and `psycopg` are already declared in
`pyproject.toml`. No new dependency, migration, SQL file or package-data entry is
needed. S3 ships no `.sql`; the package-data entry belongs to CAP-001-E6-S1 T002 (CAP-001-E6-S2 T001 is conditional).

**Checkpoint**: `uv sync --all-extras` succeeds on the branch after CAP-001-E6-S1 and CAP-001-E6-S2 have landed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the HTTP contract before the route exists.

Integration tests go in `tests/integration/test_api_coverage.py`, the file that
ingestion-api design section 7 names for coverage route tests. The one exception is
the page-size test, which section 7 names `tests/integration/test_api_pagination.py`.
Mark them `@pytest.mark.postgres`. Every test carries a traceability comment such as
`# Implements TC-COMP-054`. The component test spec's steps for these TCs are generic
boilerplate. The concrete assertions below are sharpened from the ACs each TC traces
to, and those ACs are the source of truth.

Date literals used below are real weekdays: 2024-01-02 (Tue) to 2024-01-05 (Fri), and
2024-01-08 to 2024-01-10.

### Mandatory Component Tests

- [x] T001 Create the scaffolding in `tests/integration/test_api_coverage.py`. No test functions yet.
  - Module docstring citing the story, ingestion-api design sections 2.4a, 7 and 11,
    and the TC list below. Set `pytestmark = pytest.mark.postgres`.
  - Fixture `coverage_env(postgres_connection_string, monkeypatch)`. Follow the
    `runs_client` precedent in `tests/integration/test_api_runs.py`:
    - apply every `migrations/*.sql` in sorted order and commit;
    - set `FACTORFLOW_DATABASE_URL`;
    - open `TestClient(create_app())` as a context manager, so the lifespan opens the pool;
    - yield `(client, seed_conn)`, where `seed_conn` is a separate
      `psycopg.connect(postgres_connection_string)`, closed on teardown.
    Do not add a fixture to `tests/conftest.py`: `migrated_connection_string` applies
    only migration 0001, and route test files define their own client fixture.
  - Module-local seed helpers. They follow the direct-INSERT precedent in
    `tests/integration/test_writer_coverage.py` and CAP-001-E6-S2 T002, and each
    commits after writing:
    - `_instrument(conn, symbol, lifecycle="active") -> int`: sets
      `retired_at = now()` when `lifecycle == "retired"`, because the
      `instrument_retired_at_agrees` check requires it;
    - `_segment(conn, instrument_id, data_type, covered_from, covered_to)`;
    - `_bars(conn, instrument_id, dates)`: 32-byte `value_hash` =
      `hashlib.sha256(f"{instrument_id}{d}".encode()).digest()`, with fixed OHLCV values;
    - `_state(conn, instrument_id, data_type, last_acquired_at, last_outcome)`: sets
      `last_run_id = uuid.uuid4()`.
  - Constants, taken from the story's API contract:
    - `ROW_KEYS = {"symbol", "lifecycle", "data_types", "covered_from", "covered_to", "last_acquired_at", "gap_count", "depth_short_by_years"}`
    - `TOP_KEYS = {"instruments", "never_acquired", "gap_detection", "next_cursor"}`
    - `DATA_TYPES = {"reference", "prices", "fundamentals", "corporate_actions"}`
    - `UNAVAILABLE = "fewer_than_two_instruments_with_data"` (coverage-service design 2.4)

- [x] T002 Implement TC-COMP-007 (coverage visibility, AC-7) in `tests/integration/test_api_coverage.py`
  - Arrange:
    - A and B each have `reference` and `prices` segments over 2024-01-02..2024-01-05,
      and bars on all four days.
    - A has `acquisition_state` for `prices` (`written`, at `2024-01-05T22:14:03+00:00`)
      and for `fundamentals` (`not_found`), and no fundamentals segment.
    - A has no row of any kind for `corporate_actions`.
    - Every segment uses the same range, so the row-level range is unambiguous
      whichever way S1 aggregates segments.
  - Act: `GET /api/coverage`.
  - Assert:
    - `200`; `set(body) == TOP_KEYS`; `body["never_acquired"] is False`.
    - Rows ordered by symbol: `["A…", "B…"]`. Use valid symbols, e.g. `AAPL` and `MSFT`.
    - For A:
      - `set(row) == ROW_KEYS`;
      - `set(row["data_types"]) == DATA_TYPES`;
      - `row["data_types"] == {"reference": "present", "prices": "present", "fundamentals": "absent", "corporate_actions": "unknown"}`;
      - `row["covered_from"] == "2024-01-02"` and `row["covered_to"] == "2024-01-05"`;
      - `datetime.fromisoformat(row["last_acquired_at"]) == datetime(2024,1,5,22,14,3,tzinfo=UTC)`;
      - `row["lifecycle"] == "active"`.

- [x] T003 Implement TC-COMP-008 (gap visibility, AC-8) in `tests/integration/test_api_coverage.py`
  - Arrange: A, B and C all have `prices` segments over 2024-01-02..2024-01-05. A and B
    have bars on all four days. C lacks 2024-01-04.
  - Assert on `GET /api/coverage`:
    - `body["gap_detection"] == {"available": True, "reason": None}`, compared as the
      exact dict, so no extra view-level field leaks. See Other Notes.
    - Gap counts by symbol: A `0`, B `0`, C `1`. The `0`s are measured zeros and are
      asserted `== 0`, not falsy.
  - Assert on `GET /api/coverage?expand=C`:
    - `200`;
    - `body["expanded"] == {"symbol": "C…", "gap_dates": ["2024-01-04"]}`, using C's
      normalised symbol.

- [x] T004 Implement TC-COMP-017 (honest empty state, AC-17) in `tests/integration/test_api_coverage.py`
  - Case (a), empty store: migrated, no rows.
    - `GET /api/coverage` returns `200` with `never_acquired is True`, `instruments == []`
      and `next_cursor is None`.
    - `gap_detection == {"available": False, "reason": UNAVAILABLE}`. DAC-E6-S3-1 and
      DAC-E6-4 require the reason whenever detection is unavailable. See Resolved
      Conflicts #4.
  - Case (b), the contrast in ingestion-api design section 7 and design AC 6:
    - Store: one instrument with a segment and bars. Request: `symbol=ZZ`.
    - Returns `200` with `never_acquired is False` and `instruments == []`. The two
      responses must differ.

- [x] T005 Implement TC-COMP-054 (unavailable with reason; counts absent, not zero, DAC-E6-S3-1) in `tests/integration/test_api_coverage.py`
  - Arrange: only A has bars and a `prices` segment, over 2024-01-02..2024-01-05, with
    2024-01-03 missing. B has a `fundamentals` segment only, so two rows are returned
    but only one instrument holds bars.
  - Assert on the response:
    - `body["gap_detection"] == {"available": False, "reason": UNAVAILABLE}`.
    - For **every** row: `"gap_count" in row` and `row["gap_count"] is None`. Assert
      explicitly that it `!= 0`, to guard against a falsy check. See Open Gap 2.
    - `body["never_acquired"] is False`.
  - Assert on `GET /api/coverage?expand=A`: `body["expanded"]["gap_dates"] is None`,
    **not** `[]`. S2's `read_gap_dates` returns `None` when unavailable.

- [x] T006 Implement TC-COMP-055 (dates behind expansion, not in collapsed rows, DAC-E6-S3-2) in `tests/integration/test_api_coverage.py`
  - Arrange: A has bars on 2024-01-02..05. B lacks 01-03 and 01-05. Both are covered
    01-02..01-05.
  - Default read:
    - `"expanded" not in body`;
    - every row satisfies `set(row) == ROW_KEYS`;
    - no row value is a list. Walk `row.values()` to prove no date list rides on a
      collapsed row.
  - With `expand=B`:
    - `body["expanded"]["gap_dates"] == ["2024-01-03", "2024-01-05"]`, ascending;
    - `len(gap_dates) == B's gap_count == 2`, so the count and the expansion agree;
    - the rows are still free of date lists.
  - The "bounded at 3000" half is T011.

- [x] T007 Implement TC-COMP-057 (lifecycle filter; default includes retired, DAC-E6-S3-4) in `tests/integration/test_api_coverage.py`
  - Arrange:
    - Seed `AAPL` and `MSFT` as active, each with a `prices` segment over
      2024-01-02..01-05 and bars.
    - Retire `MSFT` through `DELETE /api/instruments/MSFT`. This also covers
      ingestion-api design AC 2 and the section 7 test "Retire keeps coverage". See
      Other Notes for why it lives here.
  - Assert:
    - Default (no `lifecycle`) returns both rows. MSFT has `lifecycle == "retired"`,
      and its `covered_from` / `covered_to` are unchanged ("2024-01-02" / "2024-01-05").
    - `lifecycle=active` returns only AAPL (retired explicitly excluded).
    - `lifecycle=retired` returns only MSFT (retired explicitly selected).
    - `lifecycle=archived` returns `422` with the envelope `error.code == "validation_error"`.

- [x] T008 Implement TC-COMP-058 (inverted range, DAC-E6-S3-5) in `tests/integration/test_api_coverage.py`
  - Arrange: seed the TC-COMP-008 data.
  - `from=2024-01-05&to=2024-01-02` returns `422`, with:
    - `error.code == "validation_error"`;
    - `error.resource == "coverage"`;
    - a message naming `from` and `to`;
    - a non-empty `error.request_id`.
  - `from=2024-01-03&to=2024-01-03` returns `200`, so the boundary is not inverted.
  - `from=2024-13-01` returns `422`, a malformed date rejected by the query model
    (ingestion-api AC 12).

- [x] T009 Implement TC-COMP-036, functional half (filters, bounds, cursor, DAC-E6-10), in `tests/integration/test_api_coverage.py`
  - Symbol filter: seed `AAL`, `AAPL` and `MSFT` with segments.
    - `symbol=AA` returns `["AAL", "AAPL"]`.
    - Follow the `symbol` prefix semantics of S1's `coverage.sql` (`%(symbol_prefix)s`)
      and the `GET /api/instruments` precedent.
  - Date bounds: A and B have `prices` segments over 2024-01-02..2024-01-10 and bars on
    every weekday. B lacks 01-03 and 01-09.
    - `from=2024-01-02&to=2024-01-05` gives B's `gap_count == 1`.
    - The same bounds with `&expand=B` give `gap_dates == ["2024-01-03"]`.
    - No bounds give B's `gap_count == 2`.
  - Cursor paging: seed five instruments with segments.
    - Page with `limit=2`, following `next_cursor` verbatim as `cursor`.
    - Expect exactly three pages of sizes 2, 2 and 1.
    - The union of symbols is the five, ascending, each exactly once.
    - The last page has `next_cursor is None`.

- [x] T010 [P] Implement TC-COMP-056 (limit beyond the canonical bound → 422, DAC-E6-S3-3) in `tests/integration/test_api_pagination.py`
  - This is the file ingestion-api design section 7 names for "Page size defaults and
    caps". Create it with its own fully-migrated `TestClient` fixture, the same shape as
    T001, and the `postgres` mark.
  - Seed 51 instruments, each with a `prices` segment.
  - Assert on `GET /api/coverage`:
    - Omitting `limit` returns exactly 50 rows and a non-null `next_cursor`
      (`DEFAULT_PAGE_SIZE`).
    - `limit=500` returns `200` with 51 rows (`MAX_PAGE_SIZE` accepted).
    - `limit=501` returns `422` with `error.code == "validation_error"` and
      `error.resource == "coverage"`. Assert the status is not `200`, which proves no
      silent clamp.
    - `limit=0` returns `422`, following the `gt=0` precedent in `routes/runs.py` and
      `routes/instruments.py`.
  - Import `DEFAULT_PAGE_SIZE` / `MAX_PAGE_SIZE` from `factorflow.api.bounds` rather
    than hard-coding 50 and 500.

- [x] T011 Implement TC-COMP-036 / TC-COMP-055 volume half (3000 instruments) in `tests/integration/test_api_coverage.py`, marked `@pytest.mark.slow` as well as `postgres`
  - Seed 3000 active instruments in one statement: `INSERT … SELECT 'S' || lpad(g::text, 4, '0') FROM generate_series(1, 3000) g`.
  - Seed one `prices` segment each over 2024-01-02..2024-01-05, in one `INSERT … SELECT`.
  - Seed bars on those four days for the first three instruments only, so detection is
    available and seeding stays cheap.
  - Assert:
    - Traversing with `limit=500` takes exactly 6 pages and yields 3000 unique symbols.
    - The default read returns 50 rows.
    - Every row satisfies `set(row) == ROW_KEYS`, with no date list, and
      `"expanded" not in body`.
  - Do **not** assert elapsed time. No latency target exists (Open Gap 5).

### Additional Unit Tests

- [x] T012 Add edge-case integration tests to `tests/integration/test_api_coverage.py`
  - **Omitting the range covers everything** (ingestion-api design section 7 "Coverage
    without a range covers everything", section 2.4a, AC-8):
    - Arrange: A and B have `prices` segments over 2022-03-14..2024-01-04. Both have
      bars on {2022-03-14, 2022-03-15, 2022-03-16, 2024-01-02, 2024-01-03, 2024-01-04},
      except that B lacks 2022-03-15.
    - With no `from` / `to`: B's `covered_from == "2022-03-14"` and `gap_count == 1`,
      and `expand=B` gives `["2022-03-15"]`. A gap older than any trailing window is
      still reported.
  - **Depth shortfall is `null` when met, never `0`** (coverage-service design 2.4 and
    AC 7). See Resolved Conflicts #1.
    - Arrange: `PUT /api/settings/history-depth {"years": 5}`. Seed instrument `DEEP`
      with a `prices` segment over 2019-01-02..2024-01-05 and instrument `SHAL` over
      2023-01-03..2024-01-05. Both get bars on shared dates.
    - Assert that DEEP's `depth_short_by_years is None` and that SHAL's is an `int`
      `> 0`. The exact integer is S1's PROVISIONAL rounding rule, so do not pin it here.
  - **Expansion errors**:
    - `expand=ZZZZ` (valid shape, unknown) returns `404`, with `error.code == "instrument_not_found"` and `error.resource == "coverage"`.
    - `expand=$$$` returns `422` `validation_error`.
    - `expand=aapl` returns `200`, with `expanded.symbol == "AAPL"` (normalised).

- [x] T013 [P] Add route unit tests in `tests/unit/test_api_coverage_routes.py`. They need no container.
  - Follow the `_FakePool` / `_client` precedent in `tests/unit/test_api_runs_routes.py`
    (`TestClient(app, raise_server_exceptions=False)`, no lifespan).
  - Monkeypatch `factorflow.api.routes.coverage.read_coverage` and
    `factorflow.api.routes.coverage.read_gap_dates` with spies. The fakes build real
    `CoverageView` / `InstrumentCoverage` / `GapDetection` / `Presence` instances from
    `factorflow.coverage.service`.
  - **Route registration**: `app.openapi()["paths"]` contains `/api/coverage`. Its
    `GET` parameters include `symbol`, `lifecycle`, `from`, `to`, `limit`, `cursor`
    and `expand`, confirming the `from` alias.
  - **Field mapping** (AC-7, AC-8):
    - `presence` maps to `data_types`, with `.value` strings.
    - `depth_shortfall_years=None` maps to `depth_short_by_years: null`, and `3` maps to `3`.
    - `gaps.missing_days=None` maps to `gap_count: null`, and `0` maps to `0`.
    - `covered_from` / `covered_to` render as ISO dates, `null` when `None`.
    - View-level `gap_detection` serialises to exactly `{"available", "reason"}`, with
      no `missing_days`. See Other Notes.
  - **Pass-through**: the query `symbol=AA&lifecycle=retired&from=2024-01-02&to=2024-01-05&limit=7&cursor=X`
    reaches `read_coverage` as
    `symbol="AA", lifecycle="retired", from_date=date(2024,1,2), to_date=date(2024,1,5), limit=7, cursor="X"`.
    Omitted bounds reach it as `None`, never a default window (ingestion-api design 2.4a).
  - **Inverted range** returns `422`, and the `read_coverage` spy is **not called**.
    The route rejects the request before the service.
  - **Database failure** (ingestion-api AC 11, coverage-service AC 9, OPS-ERR-001):
    - `read_coverage` raising `psycopg.OperationalError("driver detail xyz")` gives `500`
      with `error.code == "internal_error"`.
    - `"driver detail xyz"` does not appear in `response.text`.
    - The route never catches it and never renders zero gaps or empty coverage.
  - **Expansion**:
    - `read_gap_dates` raising `InstrumentNotFound` gives `404` `instrument_not_found`.
    - Without `expand`, `read_gap_dates` is not called and `"expanded"` is absent.
    - With `expand`, it is called once with the request's `from_date` / `to_date`.

**Checkpoint**: `uv run pytest tests/unit/test_api_coverage_routes.py` and `uv run pytest -m postgres tests/integration/test_api_coverage.py tests/integration/test_api_pagination.py` are collected. They fail because the route and models do not exist yet (`404` / import errors), not because of fixture or seeding errors.

---

## Phase 3: Core Implementation

**Purpose**: Add the response models and the thin route that make Phase 2 pass.

- [x] T014 Add the coverage response models to `src/factorflow/api/models.py`, appended in a
  `# Coverage models — CAP-001-E6-S3` section after the run models. They follow the
  file's existing style.
  - `CoverageDataTypes(BaseModel)`: `reference`, `prices`, `fundamentals` and
    `corporate_actions`, each typed
    `Literal["present", "absent", "unknown"]`. This pins the four keys named by the
    `coverage_data_type_known` check in `migrations/0003_coverage.sql`.
  - `CoverageInstrument(BaseModel)`:
    - `symbol: str`
    - `lifecycle: Literal["active", "retired"]`
    - `data_types: CoverageDataTypes`
    - `covered_from: date | None`
    - `covered_to: date | None`
    - `last_acquired_at: datetime | None`
    - `gap_count: int | None`: `null` when unavailable or not computed, never `0`
      (DAC-E6-S3-1, STD-UI-4)
    - `depth_short_by_years: int | None`: `null` when the depth is met (coverage-service
      design 2.4)

    The field names come from the story's API contract.
  - `CoverageGapDetection(BaseModel)`: `available: bool`, `reason: str | None`.
  - `CoverageExpansion(BaseModel)`: `symbol: str`, `gap_dates: list[date] | None`.
    `None` means not computed, `[]` means computed with none missing.
  - `CoverageResponse(BaseModel)`:
    - `instruments: list[CoverageInstrument]`
    - `never_acquired: bool`
    - `gap_detection: CoverageGapDetection`
    - `next_cursor: str | None`
    - `expanded: CoverageExpansion | None = None`
  - Docstrings cite the story, ingestion-api design section 11, and Open Gaps 1–2.
  - Update the module docstring's list of contributing stories to add
    CAP-001-E6-S3's coverage models.
  - Import `date` next to the existing `datetime` import.

- [x] T015 Create `src/factorflow/api/routes/coverage.py` (depends on T014). Follow the structure of `routes/runs.py` and `routes/instruments.py`.
  - Module docstring: cite ingestion-api design sections 2.4a, 3 and 11; the story;
    "thin surface over `coverage-service`"; "auth: none, loopback only"; and "no
    provider import".
  - `router = APIRouter()`, `_RESOURCE = "coverage"`, and a local `_request_id(request)`
    helper, as in `runs.py`.
  - Handler signature:
    `@router.get("/api/coverage", response_model=None) def read_coverage_route(request: Request, symbol: str | None = Query(default=None), lifecycle: Literal["active", "retired"] | None = Query(default=None), from_date: date | None = Query(default=None, alias="from"), to_date: date | None = Query(default=None, alias="to"), limit: int = Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE), cursor: str | None = Query(default=None), expand: str | None = Query(default=None)) -> JSONResponse`.
  - How the parameters are validated:
    - `limit` bounds come from `factorflow.api.bounds`, which CAP-001-E2-S3
      delivered. An out-of-range value
      raises FastAPI's `RequestValidationError`. The existing
      `_validation_error_handler` in `app.py` maps that to the envelope with
      `code="validation_error"`, and `_resource_for_path` falls back to `"coverage"`.
      This is DAC-E6-S3-3, with no clamping.
    - `lifecycle` is omitted by default, which returns both lifecycles
      (DAC-E6-S3-4). This follows the `GET /api/instruments` precedent.
  - Before any database access:
    1. If both bounds are given and `from_date > to_date`, return
       `error_response(422, code="validation_error", message="`from` must not be later than `to`.", resource=_RESOURCE)`
       (DAC-E6-S3-5, coverage-service design section 4).
    2. If `expand` is given, compute `expand_symbol = normalise(expand)`. If
       `not is_valid(expand_symbol)`, return `422` `validation_error` (SEC-INP-001:
       symbols are validated against the database pattern). Use `normalise` and
       `is_valid` from `factorflow.instruments.symbols`, which CAP-001-E2-S1
       delivered.
  - Then, inside `with request.app.state.db_pool.connection() as conn:`:
    - `view = read_coverage(conn, symbol=symbol, lifecycle=lifecycle, from_date=from_date, to_date=to_date, cursor=cursor, limit=limit)`.
      This is S1's signature (CAP-001-E6-S1-tasks T012). Pass omitted bounds as `None`:
      the service resolves "everything acquired" (ingestion-api design 2.4a,
      coverage-service design 2.3).
    - If `expand_symbol`: `gap_dates = read_gap_dates(conn, expand_symbol, from_date=from_date, to_date=to_date)`,
      using S2's signature (CAP-001-E6-S2-tasks T017). Catch
      `factorflow.instruments.service.InstrumentNotFound` and return `404` with
      `code="instrument_not_found"`, the same code and message shape as `DELETE /api/instruments/{symbol}`.
  - Import `read_coverage` and `read_gap_dates` into the module namespace
    (`from factorflow.coverage.service import read_coverage, read_gap_dates`) so T013
    can monkeypatch them.
  - Cursor errors: if S1's `service.py` exposes a dedicated cursor-validation exception,
    catch it and return `422` `validation_error`, following the `CursorError` handling
    in `routes/runs.py`. Otherwise add no handler. Never catch bare `ValueError` or
    `psycopg.Error`, because database errors must propagate to `internal_error_handler`
    (OPS-ERR-001).
  - Map the result into `CoverageResponse`:
    - `data_types` from `CoverageDataTypes(**{k: v.value for k, v in row.presence.items()})`
    - `gap_count` from `row.gaps.missing_days`
    - `depth_short_by_years` from `row.depth_shortfall_years`
    - `gap_detection` from `CoverageGapDetection(available=view.gap_detection.available, reason=view.gap_detection.reason)`
    - `never_acquired` and `next_cursor` copied unchanged
  - Serialise with `body.model_dump(mode="json", exclude={"expanded"} if expand_symbol is None else None)`
    and return `JSONResponse(200, …)`. The default response then carries exactly the
    story's four top-level keys (Open Gap 1).
  - Do no coverage arithmetic, run no SQL, and do not import `massive_client` (C1,
    `tests/unit/test_api_isolation.py`).

**Checkpoint**: The T013 unit tests pass. The integration tests still fail with `404` until T016 registers the router.

---

## Phase 4: Integration

**Purpose**: Register the route on the application.

- [x] T016 Wire the router in `src/factorflow/api/app.py`, the application factory
  CAP-001-E1-S6 delivered (depends on T015).
  - Add `coverage` to the `from factorflow.api.routes import …` line.
  - Add `app.include_router(coverage.router)` after `runs.router` in `create_app()`,
    before `_add_static_mount`, so `/api/coverage` is matched before the SPA fallback
    (ingestion-api design 2.5).
  - Touch nothing else. `_resource_for_path` already yields `"coverage"` for
    `/api/coverage` through its last-segment fallback, so `_VALIDATION_ERROR_RESOURCES`
    needs no entry.

**Checkpoint**: Every test in T002–T013 passes under `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'`. The existing `tests/unit/test_api_isolation.py`, `test_api_binding.py` and `test_api_errors.py` still pass with the new route registered.

---

## Phase 5: Polish

**Purpose**: Traceability comments and clean validation.

- [x] T017 [P] In `src/factorflow/api/routes/coverage.py`, put the PROVISIONAL decisions in
  the handler docstring, citing this plan's Open Gaps 1–2. This follows the precedent in
  `routes/runs.py` and `runs/queries.py` for owner-confirmed contract choices:
  - the `expand` / `expanded` contract;
  - `gap_count: null` rather than an omitted key.

  Add a one-line comment above the inverted-range check that cites DAC-E6-S3-5.
  Add one above the `lifecycle` default that cites DAC-E6-S3-4 and AC-21.
- [x] T018 Run the validation commands:
  - `uv run ruff format --check .`
  - `uv run ruff check .`
  - `uv run mypy src`
  - `uv run pytest -m 'not postgres'`
  - `uv run pytest -m postgres`

  Fix issues only in the files this story touches.

**Checkpoint**: All acceptance criteria are satisfied, and every validation command exits 0.

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S6 | hard | `app.py` (`create_app`, `_validation_error_handler`, request-id middleware), `errors.py` (`error_response`, `internal_error_handler`). Existing edge. |
| CAP-001-E6-S1 | hard | `read_coverage`, `CoverageView`, `InstrumentCoverage`, `GapDetection` and `Presence` in `src/factorflow/coverage/service.py`. Existing edge. |
| CAP-001-E6-S2 | hard | The gap fields of `read_coverage` and `read_gap_dates(conn, symbol, *, from_date, to_date) -> list[date] \| None` (S2-tasks T016, T017). Existing edge. |
| CAP-001-E2-S1 | hard | The route imports `normalise` / `is_valid` from `src/factorflow/instruments/symbols.py` and `InstrumentNotFound` from `src/factorflow/instruments/service.py`, created by CAP-001-E2-S1. **New edge added to `dependencies.yaml`.** It is also transitive through CAP-001-E6-S2, but recorded directly because this story's own module imports it. |
| CAP-001-E2-S3 | hard | The route imports `DEFAULT_PAGE_SIZE` / `MAX_PAGE_SIZE` from `src/factorflow/api/bounds.py`, whose docstring records it as created by CAP-001-E2-S3. T007 exercises `DELETE /api/instruments/{symbol}`, and the `validation_error` envelope mapping in `app.py` was added by that story. **New edge added to `dependencies.yaml`.** |
| CAP-001-E6-S4 | reverse | The Coverage screen consumes `GET /api/coverage`, including the `expand` / `expanded` contract (Open Gap 1). It already lists CAP-001-E6-S3 as a hard edge. |

### Task Dependencies

- T001: No dependencies. T002–T009, T011 and T012 depend on T001 and run in sequence,
  because they share one file.
- T010: No dependencies (separate file)
- T013: No dependencies (separate file). It imports `factorflow.coverage.service`,
  so it needs S1 and S2 merged.
- T014: No dependencies
- T015: Depends on T014
- T016: Depends on T015
- T017: Depends on T015
- T018: Depends on all previous tasks

### Parallel Opportunities

- Phase 2: T010 and T013 run in parallel with the T001→T012 chain.
- Phase 5: T017 runs in parallel with the formatting part of T018.

---

## Validation Plan

### Constitution-Defined Commands

From `docs/constitution/tech-stack.md` → Validation Commands:

- Install: `uv sync --all-extras`
- Build: `uv build`
- Test (full): `uv run pytest`
- Test (container-free): `uv run pytest -m 'not postgres'`
- Test (story scope, from the story): `uv run pytest -m postgres`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- AC-7: `uv run pytest -m postgres tests/integration/test_api_coverage.py -k 007`. The
  presence map has all four keys and all three states. Range and last-acquired are
  exact.
- AC-8: `-k 008`. Counts are exact, the view reports available with a null reason, and
  the expansion dates match the count.
- AC-17: `-k 017`. The empty store gives `never_acquired: true` with the reason. A
  non-matching filter gives `false`.
- DAC-E6-S3-1: `-k 054`. Every row has `gap_count is None`, never `0`, and
  `expanded.gap_dates is None`.
- DAC-E6-S3-2: `-k 055`, plus the slow volume test. No date list sits in any collapsed
  row, and `expanded` appears only on request.
- DAC-E6-S3-3: `uv run pytest -m postgres tests/integration/test_api_pagination.py`.
  The results are 50, 500 accepted, 501 → 422, and 0 → 422.
- DAC-E6-S3-4: `-k 057`. The default includes retired, and `active` and `retired`
  filter explicitly.
- DAC-E6-S3-5: `-k 058`. An inverted range gives 422, and equal bounds give 200.
- DAC-E6-10: `-k 036`, plus `uv run pytest -m "postgres and slow" tests/integration/test_api_coverage.py`.
- Contract and error mapping without a container: `uv run pytest tests/unit/test_api_coverage_routes.py`.
- Regression: `uv run pytest tests/unit/test_api_isolation.py tests/unit/test_api_errors.py tests/integration/test_api_binding.py`.

---

## Notes

### Resolved Conflicts

1. **`depth_short_by_years: 0` in the story's example JSON vs "`None` when the depth is
   met, never zero"** (coverage-service design 2.4, its AC 7, and S1's DAC-E6-S1-3).
   An illustrative snippet ranks below normative design prose and acceptance criteria.
   The API returns `null` when the depth is met (T012, T013). The example's value
   should be corrected at the story's next revision.
2. **Whether gap dates are fetched on expansion.**
   - ux-design 1.1 says "Expanding does not fetch: coverage is one read".
     owner-web-app section 5 opens with "Row expansion does not fetch".
   - Against that:
     - DAC-E6-S3-2 (story AC) and DAC-E6-14 (epic AC) say specific dates are
       available "through expansion rather than included in every collapsed row".
     - coverage-service section 5 says dates "are fetched only when the owner expands a row".
     - owner-web-app section 5 itself continues "fetched once per expansion rather
       than pre-loaded for 3000 rows".
   - Epic and story ACs outrank design prose. The default response therefore carries
     no dates, and a separate opt-in request returns them.
   - The UX sentence should be corrected at the next UX-design revision. CAP-001-E6-S4
     must fetch on expansion.
3. **`read_gap_dates` signature: CAP-001-E6-S1-tasks vs CAP-001-E6-S2-tasks.**
   *Resolved 2026-09-29: the revised S1-tasks no longer declares `read_gap_dates`; S2's signature stands.*
   - S1-tasks T018 declares `read_gap_dates(conn, instrument_id: int, …) -> list[date]`.
     S2-tasks T017 declares `read_gap_dates(conn, symbol: str, *, from_date, to_date) -> list[date] | None`.
   - The approved stories give gap detection to S2 (S2 Description), so S2's interface
     governs, as the coordinator's register section 7 also records.
   - It is also the only one the API can call: the public `InstrumentCoverage` exposes
     `symbol` and no `instrument_id`.
4. **Reason on the never-acquired branch.**
   *Resolved 2026-09-29: revised S1-tasks T012 returns `"fewer_than_two_instruments_with_data"` on this branch.*
   - CAP-001-E6-S1-tasks T018 step 1 returns `GapDetection(available=False, reason=None, …)`
     when nothing has been acquired.
   - DAC-E6-S3-1 (story AC) and DAC-E6-4 (epic AC) require unavailability to carry a
     reason, and an empty store has fewer than two instruments with data.
   - ACs outrank a draft task plan. T004 asserts
     `reason == "fewer_than_two_instruments_with_data"`.
   - **Coordinator action:** S1's implementation must set that reason on the
     never-acquired branch, as S2-tasks Other Notes (a) already flagged. The route does
     not patch the reason in, because "coverage is read, never computed here"
     (ingestion-api design section 3).

### Open Gaps

1. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): the HTTP shape of gap-date expansion.**
   - Undefined:
     - DAC-E6-S3-2 requires dates to be available through expansion.
     - coverage-service section 11 declares `read_gap_dates` as backing row expansion.
     - But ingestion-api section 11 and system design 4.2 declare no request parameter
       and no path that exposes it.
     - The story also requires "one endpoint", so a second path is excluded.
   - Adopted:
     - An additive, optional query parameter `expand=<symbol>` on `GET /api/coverage`.
     - When it is supplied, the response gains a top-level
       `"expanded": {"symbol": <normalised>, "gap_dates": [ISO dates] | null}`,
       computed by `read_gap_dates` with the request's `from` / `to`.
     - When it is omitted, the `expanded` key is absent, so the default body is exactly
       the story's contract.
     - Errors: an unknown symbol returns `404 instrument_not_found`, and a malformed
       symbol returns `422 validation_error`.
   - Derivation:
     - Skill rule 9a: prefer an additive, defaulted change over altering a declared
       interface.
     - System design 4.2 marks the endpoint "stable within this capability", and
       ingestion-api section 6 says adding a field is compatible.
     - A single-symbol parameter costs one `read_gap_dates` call per expansion,
       whereas page-wide dates would cost up to 500 whole-view gap queries.
     - `null` versus `[]` follows S2's PROVISIONAL item 4. The `404` code follows
       `DELETE /api/instruments/{symbol}`.
   - Absorb in: ingestion-api section 11 and system design 4.2 at their next revision.
     CAP-001-E6-S4 consumes this contract.
2. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): "gap counts absent" is `gap_count: null`, not an omitted key.**
   - Undefined: DAC-E6-S3-1 says "absent rather than zero" but not how absence is
     encoded in JSON.
   - Adopted: the key is always present, with the value `null`, both when detection is
     unavailable and when an instrument has no prices coverage (S2 PROVISIONAL item 3).
   - Derivation:
     - The story's example always shows the key.
     - `HistoryDepthResponse` in `models.py` sets the precedent: "`years` is `null`,
       not omitted … a caller need not treat a missing key and an explicit `null` as
       two different things".
     - STD-UI-4 distinguishes missing from zero, and `null` does that.
   - Absorb in: ingestion-api section 11.
3. **Genuine gap: cursor error type.** CAP-001-E6-S1-tasks does not say whether
   `read_coverage` rejects a malformed cursor, or with what exception. T015 maps a
   dedicated cursor exception to `422` only if S1 defines one, following
   `routes/runs.py`. Otherwise an arbitrary cursor is a symbol keyset position and
   needs no error. Absorb in: coverage-service section 2.4.
4. **Genuine gap: per-row "not computed" vs "unavailable".** When the view is available
   but an instrument has no prices coverage, its `gap_count` is `null`, as it is when
   the view is unavailable. The response distinguishes the two only through the
   view-level `gap_detection`. The story contract has no per-row availability field,
   so none is added. CAP-001-E6-S4 should render an unavailable view as the
   `coverage-unknown` badge, and a `null` count on an available view as inapplicable
   (blank, STD-UI-4). Absorb in: ux-design 1.1 / ingestion-api section 11.
5. **Genuine gap, not blocking: no latency target** (ingestion-api OQ 5,
   coverage-service OQ 3). T011 asserts correctness at 3000 instruments and no elapsed
   time. `pyproject.toml` configures no `pytest-timeout`, so there is no implicit
   "suite timeout" to adopt as a bound.

### Other Notes

- **View-level `missing_days` is not exposed.** The story's contract shows
  `gap_detection` as `{available, reason}` only. S2's whole-view total
  (S2 PROVISIONAL item 1) therefore stays internal, and T003/T013 assert the exact
  two-key dict. Adding it later is compatible (ingestion-api section 6).
- **Retire-keeps-coverage test placement.** Ingestion-api design section 7 lists that
  test under `tests/integration/test_api_instruments.py`, but that file's
  `migrated_connection_string` fixture applies only migration 0001, and coverage needs
  0002 and 0003. T007 covers it in `test_api_coverage.py` instead, rather than
  changing the existing fixture.
- **Lifecycle values** are `active` and `retired`. Omitting the parameter includes
  both. This is the local precedent from `GET /api/instruments` (`routes/instruments.py`,
  IR-003), and it satisfies DAC-E6-S3-4's "included or excluded explicitly … default
  includes them" without adding an `all` value.
- **Symbol filter** is passed through raw, as `GET /api/instruments` does. Prefix
  semantics and normalisation belong to S1's `coverage.sql`. Only `expand`, which
  names one instrument, is validated against `SYMBOL_PATTERN`.
- **Bounds** are all pinned: `DEFAULT_PAGE_SIZE = 50` and `MAX_PAGE_SIZE = 500` in
  `api/bounds.py` (ingestion-api design 2.4a, owner decision 2026-09-05), and the
  `gt=0` lower bound follows the precedent in `routes/runs.py` / `routes/instruments.py`.
  This plan introduces no new numeric bound.
- **No component constitution** exists beyond the project-wide files under the repo's
  `docs/constitution/`. The `null`-versus-zero choices follow `ui-conventions.md`
  (STD-UI-4, STD-UI-14).
- **Build order.** The `src/factorflow/coverage/` package does not exist yet. S3's code
  and tests cannot run until CAP-001-E6-S1 and CAP-001-E6-S2 are merged. Both are
  existing hard edges.
