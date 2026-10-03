---
artifact_schema_version: 1
artifact_id: CAP-001-E7-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-02
updated: 2026-10-02
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: devin
  tool: Devin
  tool_version: "unknown"
  timestamp: 2026-10-02T03:56:21Z
  source_artifacts:
    - id: CAP-001-E7-S1
      version: "1"
    - id: CAP-001-E7
      version: "1"
    - id: CAP-001
      version: "8"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-tests
      version: "1"
    - id: CAP-001-coverage-matrix
      version: "1"
    - id: CAP-001-E5-S5-tasks
      version: "1"
    - id: tech-stack
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E7-S1 — Per-Instrument Result Queries

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E7-tasks-20261002T034533Z`
**Date**: 2026-10-02

## Summary

When a run fails, the owner-operator needs to see which instrument and which data type failed, and why. The story says it delivers `src/factorflow/runs/queries.py`, the run history and run detail reads. That module already exists. CAP-001-E5-S5 added it in commit `89d9e47`, together with `GET /api/acquisition-runs` and `GET /api/acquisition-runs/{id}`. So this plan is a **delta against the real code**, not a new module. A gap analysis per acceptance criterion against the code as it stands found three things missing:

1. **Per-outcome counts computed in SQL** from `run_instrument_result` (DAC-E7-S1-2). Detail today returns only the persisted `instruments_named/written/failed` columns.
2. **The instrument's symbol on each result row** (AC-10, "which instrument"). Rows carry only `instrument_id`, although the query already joins `instrument` for the cursor.
3. **Enumeration validation of the `state` and `outcome` filters**, which run-journal §4 and ingestion-api §4 require. Today any string is accepted, and an unknown value silently returns an empty page.

Every other criterion is already met by the E5-S5 code. This plan pins those criteria with mapped component tests written as characterization tests. Nothing in the E5-S5 contract changes: the cursor format, failure-first ordering, per-instrument paging with up to `4 * limit` rows, the persisted counts, the response keys and the E5-S5 tests all stay as they are. Every new field is additive.

### Gap Analysis by Acceptance Criterion

| AC | Already satisfied by E5-S5 code | Missing (this plan) |
|----|---------------------------------|---------------------|
| AC-10 | `ResultRow` carries `instrument_id`, `data_type`, `outcome`, `reason` (`queries.py` L84-94, `models.py` L218-226) | Owner-meaningful instrument identity: add `symbol` (Open Gap 2) |
| AC-11 | `not_found` is a distinct literal (`0004_runs.sql` `run_result_outcome_known`; `models.py` `ResultOutcome`), and the outcome filter can select it | Per-outcome counts report `not_found` apart from `failed`. No mapped query-level test exists yet |
| DAC-E7-1 | PK `(run_id, instrument_id, data_type)`, and detail returns per-data-type rows | Query-level test only |
| DAC-E7-3 | `compose_failure_reason` (E3-S5) writes `[kind] symbol=… data_type=… request_id=…: …`, and the read returns the stored text verbatim | Read-path test only |
| DAC-E7-10 | `DetailFilters.outcome`, keyset `decode_detail_cursor` (`queries.py` L341-444) | Validate `outcome` against the enumeration |
| DAC-E7-S1-1 | Per-instrument `limit` (default 50, max 500), `limit + 1` look-ahead | 3000-instrument volume test only |
| DAC-E7-S1-2 | — | Per-outcome counts computed in SQL, independent of paging and the outcome filter (Open Gap 1) |
| DAC-E7-S1-3 | Every data-type row of a page's instruments is fetched in one statement (`_RESULT_ROWS_SQL`) | Query-level test only |
| DAC-E7-S1-4 | `list_runs` orders by `(requested_at, run_id) DESC`, with a state filter and versioned cursor | Validate `state` against `RUN_STATES` |
| DAC-E7-S1-5 | Reasons are redacted before storage (runner `redact` → `compose_failure_reason`) | Read-path test only |

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-10 | A failed or partial run's detail shows the affected instrument, its data type and the reason. | T001, T003, T010, T011, T012, T013, T014 |
| AC-11 | `not_found` is distinguishable from other failures when results are read. | T002, T003, T010, T011, T012, T013, T014 |
| DAC-E7-1 | Results are per data type as well as per instrument. | T004, T014 |
| DAC-E7-3 | A failure reason names the symbol, the data type and the provider request id. | T005, T014 |
| DAC-E7-10 | Run detail supports an outcome filter and cursor paging. | T006, T008, T010, T011, T013, T014 |
| DAC-E7-S1-1 | A 3000-instrument run's detail pages rather than returning in one response. | T006, T014 |
| DAC-E7-S1-2 | Per-outcome counts are available without paging through every row. | T002, T006, T008, T009, T010, T011, T012, T013, T014 |
| DAC-E7-S1-3 | An instrument with mixed per-data-type outcomes returns all four data types together. | T004, T014 |
| DAC-E7-S1-4 | Run history is reverse-chronological with a state filter and cursor paging. | T007, T008, T010, T011, T013, T014 |
| DAC-E7-S1-5 | A returned stored reason contains no credential, asserted by test. | T005, T014 |

## Phase 1: Setup

**Purpose**: Confirm that the producers this delta modifies have landed, and record a characterization baseline before any change (TEST-TDD-007).

- [ ] T001 Before you edit any file, verify that these have landed: CAP-001-E5-S5's `src/factorflow/runs/queries.py` (`list_runs`, `get_run_detail`, `ListFilters`, `DetailFilters`, `ResultRow`, `RunDetail`, `CursorError`), `src/factorflow/api/routes/runs.py`, `src/factorflow/api/models.py` (`RunCounts`, `ResultRow`, `RunState`, `ResultOutcome`), and `tests/integration/test_api_runs.py`. Also verify CAP-001-E5-S1's `migrations/0004_runs.sql` and the `migrated_run_schema_connection` fixture in `tests/conftest.py`, CAP-001-E5-S1's `RUN_STATES` in `src/factorflow/runs/states.py`, CAP-001-E4-S6's per-data-type outcome writes into `run_instrument_result`, and CAP-001-E3-S5's `compose_failure_reason` and `InstrumentNotFound(…, provider_request_id=…)` in `src/factorflow/ingestion/massive/errors.py`. Then run `uv run pytest tests/unit/test_runs_queries.py tests/unit/test_api_runs_routes.py` and `uv run pytest -m postgres tests/integration/test_api_runs.py`, and record them green as the characterization baseline. Stop if any seam differs from this plan's description (prerequisite infrastructure, traces to AC-10).

**Checkpoint**: The E5-S5 read path and its tests are green, unmodified, and recorded as the baseline every later task must preserve.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the mapped component tests and the additional unit and API tests. Observe RED for every new behaviour (counts, symbol, enumeration validation). Record already-satisfied behaviour as passing characterization tests (TEST-TDD-001, TEST-TDD-002, TEST-TDD-007).

T002–T007 share the new file `tests/integration/test_run_queries.py`, so they run serially. Every case is `@pytest.mark.postgres`, uses the `migrated_run_schema_connection` fixture, and calls `factorflow.runs.queries` directly, with no HTTP. Seed runs, instruments and `run_instrument_result` rows with bound-parameter `INSERT`s, following the `_seed_run` / `_seed_instrument` / `_seed_result` helpers in `tests/integration/test_api_runs.py`. Seed volume with `INSERT … SELECT generate_series(…)` so that symbols satisfy `instrument_symbol_shape`, e.g. `'S' || lpad(n::text, 4, '0')`.

### Mandatory Component Tests

- [x] T002 Create `tests/integration/test_run_queries.py` with the shared seed helpers and `# Implements TC-COMP-079`. Seed one terminal `partial` run with a known mix of every outcome across several instruments and data types: for example 5 `written`, 2 `unchanged`, 3 `not_found`, 4 `failed` and 1 `skipped`. Call `get_run_detail(conn, run_id, DetailFilters(limit=1))`. Assert three things:
  - `detail.outcome_counts` equals exactly those five numbers, with every key present and absent outcomes reported as `0`, not omitted.
  - The counts equal the totals of the whole run although only one instrument's rows are on the page, so they did not come from paging.
  - The persisted `detail.run.instruments_named/written/failed` are unchanged.

  Observe RED (`outcome_counts` does not exist yet) before T011 (depends on T001; traces to DAC-E7-S1-2, AC-11).
- [x] T003 In `tests/integration/test_run_queries.py`, add `# Implements TC-COMP-010` and `# Implements TC-COMP-011`. For a `partial` run with instrument `AAPL` (`prices` `written`, `reference` `failed` with a reason) and instrument `ZZZZ` (all four data types `not_found`), assert that every failed row in `detail.results` carries the instrument's `symbol`, `instrument_id`, `data_type` and non-null `reason`. For `ZZZZ`, assert `outcome == "not_found"`, never `"failed"`. `DetailFilters(outcome="not_found")` must return only `ZZZZ`'s rows, and `outcome="failed"` only `AAPL`'s `reference` row. `outcome_counts` must report `not_found` and `failed` separately. Observe RED on `symbol` before T011 (depends on T002; traces to AC-10, AC-11).
- [x] T004 In `tests/integration/test_run_queries.py`, add `# Implements TC-COMP-066` and `# Implements TC-COMP-080`. Seed one instrument with `prices` `written`, `fundamentals` `not_found`, `reference` `unchanged` and `corporate_actions` `failed`, plus enough other instruments that it is not alone on the page. With `limit=1`, page through the run. Assert that the instrument's four rows arrive on the same page, contiguous, with four distinct `data_type` values and each data type's own outcome. Also assert that the `written`-prices / `not_found`-fundamentals pair returns both rows. These pass against E5-S5 code (characterization, TEST-TDD-007); record them as such and do not fabricate a RED (depends on T003; traces to DAC-E7-1, DAC-E7-S1-3).
- [ ] T005 In `tests/integration/test_run_queries.py`, add `# Implements TC-COMP-068` and `# Implements TC-COMP-082`. Build each stored reason through the real write-side composer: `compose_failure_reason(InstrumentNotFound("not found key=<SECRET>", provider_request_id="req-e7s1-001"), symbol="MSFT", data_type="fundamentals", redact=lambda s: s.replace(SECRET, "[redacted]"))`, and the same for a `ProviderUnavailable`. `SECRET` is a synthetic credential-like constant. Store each reason in `run_instrument_result.reason` and read it back with `get_run_detail`. Assert that the returned reason contains `symbol=MSFT`, `data_type=fundamentals` and `request_id=req-e7s1-001`. Also assert that `SECRET` appears nowhere in any returned `ResultRow`, in `repr(detail)`, or in the serialized API body built in T010. These pass against existing code (characterization) (depends on T004; traces to DAC-E7-3, DAC-E7-S1-5).
- [ ] T006 In `tests/integration/test_run_queries.py`, add `# Implements TC-COMP-075` and `# Implements TC-COMP-078`. Seed a terminal `partial` run of exactly 3000 instruments × four data types (12000 rows), some with a `failed` or `not_found` data type, using `generate_series`. Assert:
  - The default `DetailFilters()` returns exactly 50 instruments (≤ 200 rows) and a non-null `next_cursor`.
  - Traversal at `limit=500` takes 6 pages and yields all 3000 instrument ids, with no duplicates, no omissions, and no instrument split across pages.
  - Failure-first order holds across page boundaries.
  - `outcome="failed"` traversal yields only failed rows and exactly the seeded failed instruments.
  - `outcome_counts` is identical on every page and under every outcome filter, and sums to 12000.

  Time is printed as a diagnostic only, never asserted (ingestion-api §14 Q5). Observe RED on the `outcome_counts` assertions before T011 (depends on T005; traces to DAC-E7-10, DAC-E7-S1-1, DAC-E7-S1-2).
- [ ] T007 In `tests/integration/test_run_queries.py`, add `# Implements TC-COMP-081`. Seed runs across all eight states, including two with an identical `requested_at`. Assert:
  - `list_runs` returns them in `(requested_at, run_id) DESC` order.
  - `ListFilters(state="failed")` returns only `failed` runs.
  - Cursor traversal at `limit=2` has no gaps or duplicates across the tie.
  - `ListFilters(state="bogus")` raises `ValueError` and no query runs.

  Observe RED for the last assertion only before T011. The other assertions are characterization (depends on T006; traces to DAC-E7-S1-4).

### Additional Unit Tests

- [ ] T008 [P] Extend `tests/unit/test_runs_queries.py`, keeping every existing test unchanged:
  - `RESULT_OUTCOMES` equals `{"written", "unchanged", "not_found", "failed", "skipped"}`, which matches both `typing.get_args(factorflow.api.models.ResultOutcome)` and the `run_result_outcome_known` check in `migrations/0004_runs.sql`. Extract the check with the existing `tests/unit/design_sql.py` helper if it applies; otherwise use a literal parse of the migration file.
  - `ListFilters(state=s)` is accepted for every member of `RUN_STATES` and raises `ValueError` for `"bogus"`, `""` and `"FAILED"`.
  - `DetailFilters(outcome=o)` is accepted for every member of `RESULT_OUTCOMES` and raises `ValueError` otherwise.
  - `None` stays accepted for both.
  - `OutcomeCounts` has exactly the five outcome fields as `int`.

  Observe RED before T011 (depends on T001; traces to DAC-E7-10, DAC-E7-S1-4, DAC-E7-S1-2).
- [ ] T009 [P] Extend `tests/unit/test_api_models.py`. Assert that the new `OutcomeCounts` model has exactly the fields `written`, `unchanged`, `not_found`, `failed` and `skipped`, all `int`. `RunCounts` keeps `instruments_named`, `instruments_written` and `instruments_failed`, and adds a required `results_by_outcome: OutcomeCounts`. `ResultRow` keeps every owner-confirmed field (`instrument_id`, `data_type`, `outcome`, `reason`, `attempts`, `completed_at`) and adds `symbol: str`. No new field is credential-shaped. Observe RED before T012 (depends on T001; traces to DAC-E7-S1-2, AC-10).
- [ ] T010 [P] Add separately named `postgres` cases to `tests/integration/test_api_runs.py` without modifying the existing ones:
  - `GET /api/acquisition-runs/{id}` returns `counts.results_by_outcome` with all five keys and SQL-computed values, plus the unchanged persisted `instruments_*` counts.
  - Every element of `results` carries `symbol`.
  - `?outcome=not_found` returns only `not_found` rows, while `counts.results_by_outcome` is unchanged by the filter.
  - `GET /api/acquisition-runs?state=bogus` and `GET /api/acquisition-runs/{id}?outcome=bogus` return `422` with the shared envelope, `resource: "acquisition-run"` and a request id, never `200` with an empty page.
  - The serialized body for T005's seeded credential-bearing reason does not contain the secret.

  Observe RED before T012 and T013 (depends on T001; traces to AC-10, AC-11, DAC-E7-10, DAC-E7-S1-2, DAC-E7-S1-4).

**Checkpoint**: All ten mapped TC-IDs (TC-COMP-010, 011, 066, 068, 075, 078, 079, 080, 081, 082) carry `# Implements` trace comments. RED is observed and recorded for counts, symbol and enumeration validation. Characterization cases pass against unmodified code. The E5-S5 tests are untouched.

---

## Phase 3: Core Implementation

**Purpose**: Add the minimum to the run-journal read boundary that makes T002–T008 green, without changing the E5-S5 ordering, cursor or paging contract (TEST-TDD-003).

- [ ] T011 Update `src/factorflow/runs/queries.py`:
  - **Outcome constant.** Add `RESULT_OUTCOMES: frozenset[str]`, the five values pinned by `run_result_outcome_known` in `migrations/0004_runs.sql`. Cite the DDL in a comment.
  - **Filter validation.** In `ListFilters.__post_init__`, reject a non-`None` `state` not in `factorflow.runs.states.RUN_STATES`. In `DetailFilters.__post_init__`, reject a non-`None` `outcome` not in `RESULT_OUTCOMES`. Both raise `ValueError`, matching the existing `limit` check. Cite run-journal §4 (SEC-INP-002).
  - **Counts type.** Add a frozen `OutcomeCounts` dataclass with `written`, `unchanged`, `not_found`, `failed` and `skipped` as `int`.
  - **Counts statement.** Add one bound-parameter `_OUTCOME_COUNTS_SQL` (`SELECT outcome, count(*) FROM run_instrument_result WHERE run_id = %s GROUP BY outcome`). Its scope is the whole run: it applies neither the outcome filter nor the cursor (Open Gap 1). It follows the `count(*) FILTER` precedent of `finalise` in run-journal §2.5.
  - **Counts field.** Add `outcome_counts: OutcomeCounts` to `RunDetail`, computed in `get_run_detail` after the run row is found. A missing outcome is `0`. `RunNotFound` stays unchanged.
  - **Symbol.** Add `symbol: str` to `ResultRow`. Populate it from the `(instrument_id, has_failure, symbol)` tuples `_INSTRUMENT_IDS_SQL` already returns, with no new SQL.
  - **Docstring.** Extend the module docstring with the CAP-001-E7-S1 additions.

  Leave cursor encoding, `_INSTRUMENT_IDS_SQL`, `_RESULT_ROWS_SQL`, failure-first ordering and the `4 * limit` contract unchanged (depends on RED from T002, T003, T006, T007 and T008; satisfies AC-10, AC-11, DAC-E7-10, DAC-E7-S1-2, DAC-E7-S1-4).

**Checkpoint**: T002–T008 are green. `tests/unit/test_runs_queries.py`'s pre-existing cases and every E5-S5 case in `tests/integration/test_api_runs.py` still pass.

---

## Phase 4: Integration

**Purpose**: Surface the new read data through the existing `GET` endpoints. The additions are additive fields (ingestion-api §6), and the existing route enforces the enumerations.

- [ ] T012 Update `src/factorflow/api/models.py`. Add an `OutcomeCounts(BaseModel)` with the five `int` fields, and add a required `results_by_outcome: OutcomeCounts` to `RunCounts`, keeping the three persisted fields. Add `symbol: str` to `ResultRow`, keeping every owner-confirmed field and its type. Extend the E5-S5 comment block to name the CAP-001-E7-S1 additions (depends on RED from T009 and T010; satisfies AC-10, DAC-E7-S1-2).
- [ ] T013 Update `src/factorflow/api/routes/runs.py`:
  - Type `list_runs_route`'s `state` as `RunState | None` and `get_run`'s `outcome` as `ResultOutcome | None`, importing both from `factorflow.api.models`. An unknown value then returns the existing `422` validation envelope with `resource: "acquisition-run"` through `_VALIDATION_ERROR_RESOURCES` in `src/factorflow/api/app.py`, which is unchanged.
  - Build `RunCounts.results_by_outcome` from `detail.outcome_counts`.
  - Pass `symbol=r.symbol` into each `ResultRow`.
  - Change no status code, top-level key, cursor handling or not-found mapping.

  (depends on T011 and T012; satisfies AC-10, AC-11, DAC-E7-10, DAC-E7-S1-2, DAC-E7-S1-4).

**Checkpoint**: T010 is green through `create_app()` against PostgreSQL. Every E5-S5 API case still passes. The detail body gains only additive fields.

---

## Phase 5: Polish

**Purpose**: Kill mutants on the changed behaviour, refactor safely, run full validation, and keep the per-cycle evidence chain.

- [ ] T014 After T002–T013 are green and their T015 entries are complete, run the TEST-TDD-005 and TEST-TDD-006 mutation checks on the changed lines. Mutate the counts `GROUP BY` and the zero-default, any leak of the outcome filter or cursor into the counts statement, the `symbol` mapping (e.g. swapping instruments), the `RUN_STATES` and `RESULT_OUTCOMES` membership checks, and the route `Literal` types. Strengthen tests until every mutant is killed. Do behaviour-preserving refactoring under TEST-TDD-004, keep the T001 characterization baseline green (TEST-TDD-007), verify the TEST-TDD-001 to TEST-TDD-008 chain, and run every command in the Validation Plan (depends on T002–T013; verifies all story criteria).
- [ ] T015 Run this after **each** TDD cycle in T002–T014, not once at the end. Stage only that cycle's diff. Dispatch an independent code-review subagent and an independent spec-drift subagent against it. Append the cycle to `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S1-tdd-evidence.yaml`, beside this story, with `code_review_verdict`, `spec_drift.drift_detected` and its RED/GREEN evidence. Record characterization cycles (T004, T005 and the characterization parts of T006/T007) as such, with GREEN-on-arrival evidence instead of a fabricated RED. Do not commit a `REJECTED` or `drift_detected: true` cycle. After the commit, record its `commit_hash` and `tests_executed: true` before the next cycle begins (INV-TDD-002, TEST-TDD-008; traces to no AC).

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

`dependencies.yaml` now records
`CAP-001-E7-S1: [CAP-001-E3-S5, CAP-001-E4-S6, CAP-001-E5-S1, CAP-001-E5-S5]`. This revision adds two hard edges. Both producers are implemented and merged, so neither blocks scheduling.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E3-S5 | hard | **New edge.** T005 imports `compose_failure_reason` and `InstrumentNotFound`/`ProviderUnavailable` from `src/factorflow/ingestion/massive/errors.py`, added in commit `cb7aa10` (`CAP-001-E3-S5: story-coding — provider failure reasons`). It was already a transitive prerequisite through E4-S6 and is now explicit. |
| CAP-001-E4-S6 | hard | Existing edge. The per-data-type outcomes (`written`, `unchanged`, `not_found`, `failed`, `skipped`) and the reasons these queries read. |
| CAP-001-E5-S1 | hard | Existing edge. `acquisition_run`, `run_instrument_result` and indexes in `migrations/0004_runs.sql`, `RUN_STATES` in `src/factorflow/runs/states.py`, and the `migrated_run_schema_connection` fixture. |
| CAP-001-E5-S5 | hard | **New edge.** T011–T013 modify `src/factorflow/runs/queries.py`, `src/factorflow/api/models.py` and `src/factorflow/api/routes/runs.py`, and T010 extends `tests/integration/test_api_runs.py`. All of them were created in commit `89d9e47` (`feat(CAP-001-E5-S5)`). |
| CAP-001-E7-S4 | reverse | Consumes `GET /api/acquisition-runs/{id}`, including the new `counts.results_by_outcome` and `results[].symbol`. Its graph entry already lists this story. |
| CAP-001-E5-S6 | context | The Runs screen consumes `GET /api/acquisition-runs`. The only change on that endpoint is that an invalid `state` now returns `422`. The screen sends only enumerated states (DEC-0004/DEC-0005 API types), so it is unaffected. |

### Task Dependencies

- T001 gates everything.
- T002 → T003 → T004 → T005 → T006 → T007 run serially because they share `tests/integration/test_run_queries.py`.
- T008, T009 and T010 depend only on T001 and touch separate files (`[P]`).
- T011 depends on RED from T002, T003, T006, T007 and T008.
- T012 depends on RED from T009 and T010.
- T013 depends on T011 and T012.
- T014 depends on T002–T013 and their T015 entries.
- T015 is interleaved: it runs after every TDD cycle, before that cycle's commit.

### Parallel Opportunities

- T008, T009 and T010 can be written in parallel with each other and with the T002–T007 chain.
- T011 (`queries.py`) and T012 (`models.py`) touch different files and can be implemented in parallel once their RED tests exist. TEST-TDD-008 still serializes their commit and evidence cycles.

### Phase Dependencies

- Phase 1 precedes everything.
- Phase 2's RED for each behaviour precedes the matching Phase 3 or Phase 4 change.
- Phase 3 supplies `outcome_counts`, `symbol` and filter validation, which Phase 4 surfaces.
- T015 runs at every commit boundary in Phases 2–4. T014 is the final mutation, refactor and validation pass.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest` (full suite); `uv run pytest -m 'not postgres'` (no container)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

The story's own validation line (`uv run pytest -m postgres`, `uv run ruff check .`, `uv run mypy src`) is a subset of these commands.

### Story-Specific Validation

- `uv run pytest -m postgres tests/integration/test_run_queries.py tests/integration/test_api_runs.py` and `uv run pytest tests/unit/test_runs_queries.py tests/unit/test_api_models.py tests/unit/test_api_runs_routes.py`. All ten mapped TC-IDs carry trace comments and pass.
- AC-10 / AC-11: a failed row returns `symbol`, `data_type` and `reason`. `not_found` and `failed` are distinct in rows, in filtering and in `results_by_outcome`.
- DAC-E7-S1-2: on a mixed run, `results_by_outcome` matches the seeded totals at `limit=1`, is unchanged across pages and outcome filters, and leaves the persisted `instruments_*` counts untouched.
- DAC-E7-S1-1 / DAC-E7-10: 3000 instruments page at 50 by default. Six pages at `limit=500` return every instrument once and never split one. Outcome-filtered traversal is complete.
- DAC-E7-S1-3 / DAC-E7-1: an instrument with mixed outcomes returns its four data types together.
- DAC-E7-S1-4: list order, the state filter, tie-safe cursor traversal, and `422` for an unknown state.
- DAC-E7-3 / DAC-E7-S1-5: a reason composed by the real composer returns symbol, data type and request id, and the synthetic secret is absent from query output and the API body.
- Regression: every pre-existing E5-S5 case in `tests/integration/test_api_runs.py` and `tests/unit/test_runs_queries.py` passes unmodified.
- If no container runtime is available, run and report the `-m 'not postgres'` subset only. Do not present it as a green full suite.

---

## Notes

### Resolved Conflicts

- **Redaction on read versus before storage (DAC-E7-S1-5).**
  - *Conflict:* The story's Testing bullet ("a reason containing a credential-like value is asserted absent from query output") could be read as asking the read path to strip a raw credential from stored text.
  - *Resolution:* No read-side redaction is added. T005 sends a credential through the real write-side composer and then asserts that it is absent from the read output.
  - *Basis:* The AC itself says "Given a **stored** reason". Run-journal §4 (normative) places redaction *before* storage. System design constraint 5.12 forbids the application process from ever reading the credential value, so read-side redaction by value is prohibited. AC and design prose outrank a Technical Details bullet.
- **Filter validation versus existing behaviour.**
  - *Conflict:* `routes/runs.py` and `queries.py` accept any `state` and `outcome` string today, so `?state=bogus` returns `200` with an empty page.
  - *Resolution:* T011 and T013 validate both filters and return `422`. This conforms the code to the approved design. It is not a change to approved product behaviour.
  - *Basis:* Run-journal §4 ("the state and outcome filters on the read paths validate against enumerations") and ingestion-api §4 (SEC-INP-001) are approved normative prose and outrank existing code. The E5-S5 plan's T009 also asked for "exact state/outcome literals".
- **"Delivers `src/factorflow/runs/queries.py`" versus an existing file.**
  - *Conflict:* The story describes delivering a module that CAP-001-E5-S5 already created in commit `89d9e47`, following run-journal §2.1's placement.
  - *Resolution:* This plan is a delta on that module, and the E5-S5 contract is preserved.
  - *Basis:* Code that already exists is the baseline. Approved artifacts do not conflict here.
- **Design status label.**
  - *Conflict:* `component-design-run-journal.md` has body `**Status:** draft` but frontmatter `status: approved`.
  - *Resolution:* The design is treated as approved.
  - *Basis:* The governed frontmatter wins, and the body label is stale.

### Open Gaps

- **PROVISIONAL — awaiting owner confirmation (2026-10-02) — unit, scope and shape of per-outcome counts (DAC-E7-S1-2).**
  - *Undefined:* No artifact fixes the counting unit, the scope or the field name. The story says only "per-outcome counts computed in SQL", and ingestion-api §11 says only "its counts".
  - *Adopted:* Count `run_instrument_result` **rows** (instrument × data type) per outcome across the **whole run**, ignoring the outcome filter and the cursor. All five outcomes are always present and default to `0`. The query exposes them as `RunDetail.outcome_counts` and the API as `counts.results_by_outcome.{written,unchanged,not_found,failed,skipped}`. The persisted `instruments_*` counts stay alongside.
  - *Derivation:*
    - An outcome belongs to a row. The PK is `(run_id, instrument_id, data_type)`, and DAC-E7-1 records results per data type, so an instrument has no single outcome to count.
    - `finalise` (run-journal §2.5) already computes run-level counts in SQL from rows by outcome. This plan follows that local precedent.
    - "Without paging through every row" means the counts must not depend on the page, and the same reasoning keeps them independent of the filter, which is a view of the run.
    - The five keys come from the `run_result_outcome_known` DDL.
    - A computed zero is a true `0`, unlike STD-UI-4's null for an *unavailable* value.
    - Adding a field to a response is compatible (ingestion-api §6).
  - *Rejected:*
    - Instrument-level counts per outcome: an instrument with mixed outcomes would be double-counted or need an invented precedence.
    - Counts that follow the filter: these would be useless as a summary.
  - *Absorb in:* `component-design-ingestion-api.md` §11 (detail schema) and `component-design-run-journal.md` §5 at their next revision.
- **PROVISIONAL — awaiting owner confirmation (2026-10-02) — `symbol` on each result row (AC-10).**
  - *Undefined:* The owner-confirmed E5-S5 result fields (2026-09-17) are `instrument_id`, `data_type`, `outcome`, `reason`, `attempts` and `completed_at`. None identifies the instrument in owner terms, and no artifact says whether the symbol belongs on the row.
  - *Adopted:* Add `symbol: str` to `queries.ResultRow` and the API `ResultRow`, additively. Every confirmed field is kept unchanged.
  - *Derivation:*
    - AC-10 requires "which instrument" to be available.
    - UX design §1.5 and STD-UI-19 name the resource as *the named instrument*, and the instrument table is one row per instrument.
    - `_INSTRUMENT_IDS_SQL` already selects `i.symbol` for the cursor, so this needs no new query.
    - A symbol inside `reason` exists only for failed rows, so `written`/`unchanged` rows would otherwise have no owner-readable identity.
    - Additive fields are compatible (ingestion-api §6).
  - *Rejected:* Having CAP-001-E7-S4 map ids through `GET /api/instruments`. That endpoint is paged and lifecycle-filtered, and a retired instrument in an old run would not resolve on the default view.
  - *Absorb in:* `component-design-ingestion-api.md` §11 result schema at its next revision.

### Other Notes

- **TDD evidence.** The story makes behaviour-changing commits (counts, symbol, filter validation), so the T015 evidence task applies. Under a supervised driver that commits once per stage, the precedent in `projects/factorflow-v2/decisions/DEC-0006.md` (scoped to E5-S6) applies by analogy: the stage commit hash is recorded by reference for every cycle. That decision is not extended here, and the driver decides commit granularity.
- **Outcome filter semantics are unchanged.** With `outcome=X`, E5-S5 returns only the matching rows of each selected instrument, and its test asserts `all(r["outcome"] == "failed")`. DAC-E7-S1-3's "all four data types together" applies to the unfiltered read, so this plan does not change filtered behaviour. This plan does not decide whether a filtered view should show an instrument's non-matching data types too (DAC-E7-S4-7 says "only matching instruments render"). CAP-001-E7-S4 must not assume either reading.
- **Runs screen compatibility.** CAP-001-E5-S6's Runs screen calls `GET /api/acquisition-runs` and sends only enumerated `state` values (its typed API client, fixed by DEC-0004/DEC-0005). The new `422` for an unknown state therefore does not affect it. Keep its web tests green when running the full suite.
- **Run-level `acquisition_run.failure_reason`.** The journal's failed-run path writes it (`src/factorflow/runs/journal.py` `_FAILED_UPDATE_SQL`). This story's per-instrument reason tests do not cover it. Its redaction belongs to the write path, and this plan neither asserts nor changes it.
- **No latency target.** ingestion-api §14 Q5 is open. The 3000-instrument test prints elapsed time as a diagnostic only, following the `tests/integration/test_runner_volume.py` precedent.
- **No migration.** The counts statement is a `GROUP BY` on the `run_instrument_result` PK prefix `run_id`, which is already indexed, so no index is added.
- **E2E coverage.** The coverage matrix also maps AC-10 to TC-E2E-002/005 and AC-11 to TC-E2E-006. Those are browser flows owned by the owner-web-app Playwright suite (CAP-001-E7-S4), not by this backend story.
- **Isolation.** Test code may import `factorflow.ingestion.massive.errors`. No module under `src/factorflow/api/` or `src/factorflow/runs/queries.py` gains a provider import (`tests/unit/test_api_isolation.py`).
