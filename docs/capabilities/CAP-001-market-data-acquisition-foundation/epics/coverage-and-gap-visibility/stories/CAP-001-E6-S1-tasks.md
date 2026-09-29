---
artifact_schema_version: 1
artifact_id: CAP-001-E6-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-28
updated: 2026-09-29
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: devin
  tool: Devin
  tool_version: unknown
  timestamp: 2026-09-29T03:32:21Z
  source_artifacts:
    - id: CAP-001-E6-S1
      version: "1"
    - id: CAP-001-component-design-coverage-service
      version: "6"
    - id: CAP-001-component-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E6-S1 — Coverage Derivation From Written Rows

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E6-tasks`
**Date**: 2026-09-29 (revised; first written 2026-09-28)

## Summary

Delivers `src/factorflow/coverage/service.py` and the coverage half of
`src/factorflow/coverage/sql/` (`coverage.sql`, `never_acquired.sql`), as the
approved story's Description states. `service.py` declares the four pinned
dataclasses (`Presence`, `GapDetection`, `InstrumentCoverage`, `CoverageView`)
and the public `read_coverage` callable. Coverage is derived at read time from
`coverage_segment`, the observation tables, `acquisition_state`, `owner_setting`
and `instrument`; no summary is ever stored.

Gap detection is **not** in this story. `gaps.py`, `gaps.sql`, `read_gap_dates`
and the gap tests (`tests/integration/test_coverage_gaps.py`) belong to
CAP-001-E6-S2, which depends on this story and wires its gap results into
`service.py` (S2-tasks T015–T017). This story only exposes the `GapDetection`
shape, sets the reasoned unavailable state on the never-acquired branch, and
leaves a documented "not computed" placeholder in the gap fields of a populated
read for S2 to replace. No API endpoint (CAP-001-E6-S3) and no frontend
(CAP-001-E6-S4) is added here.

This revision also makes S1 the owner of the `pyproject.toml` package-data entry
for `coverage/sql/*.sql`, because `coverage.sql` is the first `.sql` file under
`src/`. S2-tasks T001 adds the entry only if S1 has not.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | Per-instrument coverage: data types present, date range, last acquired | T003, T010, T012 |
| AC-12 | No range shows complete that was not fully acquired | T003, T010, T012 |
| AC-17 | Never-acquired reported rather than an empty successful state | T004, T011, T012 |
| AC-21 | Retired instruments appear with retained coverage, marked | T006, T010, T012 |
| DAC-E2-6 | Retired instruments distinguished rather than omitted | T006, T010 |
| DAC-E6-1 | Coverage derived at read time from segments and observation rows | T003, T010, T012 |
| DAC-E6-7 | Never-acquired means no observation row at all | T004, T011, T012 |
| DAC-E6-S1-1 | Per-data-type presence: present / absent / unknown for all four types | T003, T005, T012 |
| DAC-E6-S1-2 | `never_acquired` uses its own query over observation existence | T004, T011, T012 |
| DAC-E6-S1-3 | Depth shortfall reported in years; `None` when depth is met | T005, T007, T009, T012 |
| DAC-E6-S1-4 | Retired instrument included with lifecycle marker, not omitted | T006, T012 |
| DAC-E6-S1-5 | `last_acquired_at` from `acquisition_state`, not run intent | T003, T010, T012 |
| DAC-E6-S1-6 | Uniform plan-cap shortfall not presented as a data gap | T007 (covered-range half; see Notes) |
| DAC-E6-S1-7 | Reads support symbol filter, lifecycle filter, date bounds, cursor paging at 3000 | T003, T008, T010, T012 |

Supporting infrastructure: T001, T002 (package and packaging), T013 (importability
and wheel contents), T014–T015 (docstrings, validation).

## Phase 1: Setup

**Purpose**: Create the `coverage` package and make sure its `.sql` files ship in
the installed package.

- [ ] T001 Create `src/factorflow/coverage/__init__.py` (empty module marker). The
  `sql/` directory is created by T010/T011 when the first `.sql` file is written; no
  `.gitkeep` is needed.
- [ ] T002 [P] Add package data for the coverage SQL files in `pyproject.toml`: a
  `[tool.setuptools.package-data]` table with `factorflow = ["coverage/sql/*.sql"]`.
  Why: `[tool.setuptools.packages.find]` alone does not ship non-Python files, the
  repo has no `MANIFEST.in` and no SCM plugin, and the `Dockerfile` runs
  `pip install --no-cache-dir .`, so without this entry `service.py` fails at import
  in the container, because the story and design 2.1 require the statements "as .sql
  files loaded at import". This story owns the entry because `coverage.sql` is the
  first `.sql` under `src/`; CAP-001-E6-S2 T001 is conditional on it and becomes a
  no-op. The glob also covers S2's `gaps.sql`, `gap_range.sql` and
  `gap_instrument.sql`. Touch nothing else in `pyproject.toml`.

**Checkpoint**: `src/factorflow/coverage/` is an importable package; `uv build`
produces a wheel (its `.sql` contents are checked in T013).

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the expected behaviour before any
production code exists.

All integration tests are marked `postgres` and use the existing
`migrated_writer_connection` fixture in `tests/conftest.py`, which applies
migrations 0001–0004 to an isolated database. Do not add a new fixture. Seed data
with module-local direct-INSERT helpers following the precedent in
`tests/integration/test_writer_coverage.py`. Every test carries a traceability
comment such as `# Implements TC-COMP-027`. The component test spec's steps are
generic boilerplate; the concrete assertions below are sharpened from the ACs each
TC traces to, and those ACs are the source of truth.

S1 tests must **not** assert the gap values of a populated read
(`view.gap_detection` or `InstrumentCoverage.gaps` when `never_acquired` is false),
because CAP-001-E6-S2 T016 replaces the S1 placeholder there. The only gap value S1
pins is the never-acquired branch (T004), which S2 leaves untouched.

### Mandatory Component Tests

- [ ] T003 [P] Implement TC-COMP-007 (AC-7), TC-COMP-027 (DAC-E6-1), TC-COMP-012 (AC-12) and TC-COMP-045 (DAC-E6-S1-5) in `tests/integration/test_coverage_reads.py`
  - Written rows only (TC-COMP-027, TC-COMP-007): instrument A has `daily_bar`
    rows but no `coverage_segment`; instrument B has both, with a `prices` segment
    2024-01-02..2024-01-05. Assert A's `covered_from` / `covered_to` are `None` and
    its `presence["prices"]` is not `PRESENT`; B reports exactly
    2024-01-02..2024-01-05 and `presence["prices"] is Presence.PRESENT`.
  - Presence per data type (story Testing, DAC-E6-S1-1): B also has an
    `acquisition_state` row for `fundamentals` with `last_outcome='not_found'` and no
    fundamentals segment, and nothing at all for `corporate_actions`. Assert
    `presence == {"reference": UNKNOWN, "prices": PRESENT, "fundamentals": ABSENT, "corporate_actions": UNKNOWN}`
    for a B with no reference rows.
  - Last acquired (TC-COMP-045, design section 7 "Last acquired includes failed
    attempts"): give B an `acquisition_state` row with `last_outcome='failed'` whose
    `last_acquired_at` is later than its `written` row. Assert B's
    `last_acquired_at` equals that later timestamp, and that an instrument with a
    queued `acquisition_run` but no `acquisition_state` row reports `None` (run
    intent is not read).
  - Rolled-back partial write (TC-COMP-012, story Testing): open a transaction,
    insert bars, a `coverage_segment` and an `acquisition_state` row for instrument
    C, then `rollback()`. Assert C appears with `covered_from is None`,
    `last_acquired_at is None` and every presence `UNKNOWN`.
  - Filters and bounds (DAC-E6-S1-7, functional half): with `AAL`, `AAPL`, `MSFT`
    seeded, `symbol="AA"` returns `["AAL", "AAPL"]`; `lifecycle="retired"` returns
    only retired rows; cursor paging with `limit=2` over five instruments yields
    pages of 2, 2, 1 with no duplicates.
  - Input validation and errors (design section 4, SEC-INP-001; design AC 9,
    OPS-ERR-001): `from_date > to_date` raises `ValueError`; an unknown `lifecycle`
    raises `ValueError`; on a closed connection `read_coverage` raises a
    `psycopg.Error` subclass rather than returning an empty view.

- [ ] T004 [P] Implement TC-COMP-017 (AC-17), TC-COMP-033 (DAC-E6-7) and TC-COMP-042 (DAC-E6-S1-2) in `tests/integration/test_coverage_empty.py`
  - Empty store: `read_coverage(conn)` returns `never_acquired is True`,
    `instruments == []`, `next_cursor is None`, and
    `gap_detection == GapDetection(available=False, reason="fewer_than_two_instruments_with_data", missing_days=None)`.
    Assert `missing_days is None` explicitly (not falsy). DAC-E6-4 and DAC-E6-S3-1
    require a reason whenever detection is unavailable, and an empty store has
    fewer than two instruments with data. CAP-001-E6-S3 T004 asserts the same
    reason over HTTP.
  - Instruments registered but no observation row: still `never_acquired is True`
    (instruments alone are not observations).
  - Populated store, non-matching filter: `symbol="ZZZZ"` returns
    `never_acquired is False` and `instruments == []`.
  - Any observation type counts (DAC-E6-7 "absence of any observation row"): a store
    whose only observation is one `fundamental_observation` row reports
    `never_acquired is False`.

- [ ] T005 [P] Implement TC-COMP-037 (DAC-E6-11) and TC-COMP-041 (DAC-E6-S1-1) in `tests/unit/test_coverage_shapes.py`
  - `Presence` has exactly the three values `present`, `absent`, `unknown`, and is a
    `StrEnum`.
  - `GapDetection`, `InstrumentCoverage` and `CoverageView` are frozen dataclasses
    whose field names and order match component design section 2.4 exactly.
  - Also covers DAC-E6-S1-3's shape rule: an `InstrumentCoverage` meeting depth is
    constructed with `depth_shortfall_years=None`, and the test asserts `is None`
    (design section 7 "Shortfall is absent, not zero").
  - No container needed.

- [ ] T006 [P] Implement TC-COMP-021 (AC-21), TC-COMP-034 (DAC-E6-8), TC-COMP-044 (DAC-E6-S1-4) and TC-COMP-104 (DAC-E2-6) in `tests/integration/test_coverage_retired.py`
  - Arrange one active and one retired instrument (`lifecycle='retired'`,
    `retired_at` set), both with `prices` segments and bars.
  - Assert both appear in an unfiltered read; the retired one has
    `lifecycle == "retired"` and its retained `covered_from` / `covered_to`; the
    active one has `lifecycle == "active"`.

- [ ] T007 [P] Implement TC-COMP-035 (DAC-E6-9), TC-COMP-043 (DAC-E6-S1-3), and the covered-range half of TC-COMP-038 (DAC-E6-12) / TC-COMP-046 (DAC-E6-S1-6) in `tests/integration/test_coverage_depth.py`
  - Depth (TC-COMP-035, TC-COMP-043; story Testing): set the stated depth to 5 years
    with `write_history_depth`. Instrument A is covered for 3 years: assert
    `depth_shortfall_years == 2`. Instrument B meets 5 years: assert
    `depth_shortfall_years is None`. Raising the stated depth marks B short. With no
    stated depth, every row has `depth_shortfall_years is None`.
  - Uniform plan cap, covered-range half (TC-COMP-038, TC-COMP-046): stated depth 10
    years; every instrument's `prices` segment starts on the same date 5 years back,
    with bars on shared sessions. Assert every row's `covered_from` equals that
    uniform start (the covered range, not the stated depth, is reported), every row
    reports the shortfall through `depth_shortfall_years`, and no row's
    `gaps.missing_days` is a positive integer (`in (None, 0)`). This half is S1's.
    The gap-count half (dates before the uniform start produce no gaps) can only be
    proven once CAP-001-E6-S2's `gaps.py` exists; see Notes.
  - Placement: design section 7 lists this test under
    `tests/integration/test_coverage_gaps.py`, but that file is created by
    CAP-001-E6-S2 T002. It lives here so that S1 does not create an S2-owned file.

- [ ] T008 [P] Implement TC-COMP-036 (DAC-E6-10) and TC-COMP-047 (DAC-E6-S1-7) in `tests/integration/test_coverage_volume.py`
  - Mark `postgres` and `slow` (precedent: `tests/integration/test_runner_volume.py`).
  - Arrange 3000 instruments with `prices` segments and one year of bars, seeded with
    set-based `INSERT … SELECT generate_series(…)` rather than row-by-row inserts.
  - Assert correctness only: following `next_cursor` at the default `limit=50`
    returns all 3000 symbols, ascending, each exactly once, in 60 pages; a symbol
    prefix and a lifecycle filter narrow the set correctly at this size.
  - Assert **no elapsed-time bound**. No latency target exists (coverage-service
    OQ 3) and `pyproject.toml` configures no `pytest-timeout`; see Open Gaps.

### Additional Unit Tests

- [ ] T009 [P] Add unit tests for the depth-shortfall helper and the never-acquired
  gap state in `tests/unit/test_coverage_shapes.py` (append):
  - `_depth_shortfall_years(covered_from, covered_to, stated_years)` follows the
    PROVISIONAL ceiling rule in Open Gaps: 3 of 5 years → 2; exactly 5 → `None`;
    more than 5 → `None`; `stated_years is None` → `None`; no coverage → `None`.
  - The module constant `UNAVAILABLE_REASON == "fewer_than_two_instruments_with_data"`
    (design 2.4). Import it from `factorflow.coverage.service`; after S2 moves the
    definition to `gaps.py` (S2-tasks T015) the name stays importable from
    `service.py`.

**Checkpoint**: `uv run pytest tests/unit/test_coverage_shapes.py` and
`uv run pytest -m postgres tests/integration/test_coverage_reads.py tests/integration/test_coverage_empty.py tests/integration/test_coverage_retired.py tests/integration/test_coverage_depth.py tests/integration/test_coverage_volume.py`
collect all tests and fail for missing production code, not for fixture or seeding
errors.

---

## Phase 3: Core Implementation

**Purpose**: Write the coverage SQL files and `service.py` that make Phase 2 pass.

- [ ] T010 [P] Write `src/factorflow/coverage/sql/coverage.sql` — the per-instrument
  coverage page:
  - Selects from `instrument` (`instrument_id`, `symbol`, `lifecycle`), left-joined
    to `coverage_segment` aggregated per instrument and data type
    (`MIN(covered_from)`, `MAX(covered_to)`), and to `acquisition_state`
    (`data_type`, `last_outcome`, `last_acquired_at`).
  - Selects `i.instrument_id` even though the public dataclasses do not expose it:
    CAP-001-E6-S2 T016 needs it to attach per-row gap counts, so selecting it here
    spares S2 an edit to this file.
  - Retired instruments are included (no default lifecycle predicate; AC-21).
  - Keyset pagination by `symbol` ascending: `symbol > %(cursor_symbol)s` when a
    cursor is given, `LIMIT %(limit)s` rows of instruments.
  - Parameters: `%(symbol_prefix)s` (a `LIKE` prefix, following the
    `list_instruments` precedent in `src/factorflow/instruments/service.py`),
    `%(lifecycle)s`, `%(from_date)s`, `%(to_date)s` (segments overlapping the bounds
    only), `%(cursor_symbol)s`, `%(limit)s`. Bound parameters only; no DML (design
    AC 8).
- [ ] T011 [P] Write `src/factorflow/coverage/sql/never_acquired.sql` — the separate
  existence check over **every** observation table in migration 0002:
  `SELECT NOT (EXISTS (SELECT 1 FROM daily_bar) OR EXISTS (SELECT 1 FROM fundamental_observation) OR EXISTS (SELECT 1 FROM corporate_action) OR EXISTS (SELECT 1 FROM instrument_reference)) AS never_acquired;`
  DAC-E6-7 defines never-acquired as "the absence of any observation row in the
  store", so checking `daily_bar` alone would be wrong. Kept separate from the
  coverage query per design section 2.5 and DAC-E6-S1-2.
- [ ] T012 Write `src/factorflow/coverage/service.py` — the public read API
  (depends on T010, T011):
  - Declare the four pinned dataclasses exactly as in design section 2.4:
    `Presence(StrEnum)`, `GapDetection`, `InstrumentCoverage`, `CoverageView`
    (frozen). Declare `UNAVAILABLE_REASON: Final = "fewer_than_two_instruments_with_data"`
    here; S2-tasks T015 moves the single definition to `gaps.py` and imports it back.
  - Load `coverage.sql` and `never_acquired.sql` at import from
    `Path(__file__).parent / "sql"`.
  - Import `read_history_depth` from `factorflow.instruments.settings`, delivered by
    CAP-001-E2-S2.
  - Implement `read_coverage(conn, *, symbol: str | None = None, lifecycle: str | None = None, from_date: date | None = None, to_date: date | None = None, cursor: str | None = None, limit: int = 50) -> CoverageView`:
    1. Validate input (design section 4): `from_date <= to_date` when both are
       given, `lifecycle in {"active", "retired"}` when given, and `1 <= limit <= 500`
       (ingestion-api section 11); raise `ValueError` otherwise.
    2. Execute `never_acquired.sql`. If true, return
       `CoverageView(never_acquired=True, gap_detection=GapDetection(available=False, reason=UNAVAILABLE_REASON, missing_days=None), instruments=[], next_cursor=None)`.
       Gaps are not computed on this branch (design 2.2 node C), but the reason is
       always carried when detection is unavailable (DAC-E6-4, DAC-E6-S3-1).
    3. Read the stated depth with `read_history_depth(conn)`.
    4. Execute `coverage.sql` with bound parameters. It reads `coverage_segment`
       (migration 0003 by CAP-001-E5-S1, written by CAP-001-E4-S3's writer) and
       `acquisition_state` (migration 0003 by CAP-001-E5-S1). Assemble one
       `InstrumentCoverage` per instrument:
       - `presence`: one entry for each of `reference`, `prices`, `fundamentals`,
         `corporate_actions` (the migration 0003 CHECK values): at least one
         segment → `PRESENT`; an `acquisition_state` row but no segment →
         `ABSENT`; neither → `UNKNOWN`.
       - `covered_from` / `covered_to`: the instrument's `prices` range (PROVISIONAL,
         see Open Gaps), `None` when it has no prices segment.
       - `last_acquired_at`: `MAX(acquisition_state.last_acquired_at)` across data
         types, `None` when there is no row.
       - `depth_shortfall_years`: from `_depth_shortfall_years(...)` (PROVISIONAL
         rounding, see Open Gaps).
       - `gaps`: the "not computed" placeholder
         `GapDetection(available=True, reason=None, missing_days=None)`.
    5. Set `CoverageView.gap_detection` to the same "not computed" placeholder.
       Step 4's `gaps` and this field are the only values CAP-001-E6-S2 T016
       replaces; the placeholder reuses S2's own encoding for "not computed"
       (S2-tasks T016 / PROVISIONAL item 3), is never a zero, and no consumer reads
       it before S2 lands, because CAP-001-E6-S3 depends on both stories. See Open
       Gaps.
    6. Return the `CoverageView` with `next_cursor` set to the last symbol on the
       page when the page is full, otherwise `None`.
  - Do **not** declare `read_gap_dates`, and do not import or create `gaps.py`.
    Both are CAP-001-E6-S2 T015/T017. `service.py` never depends on S2 code in
    this story.
  - psycopg 3 bound parameters, no ORM, no `try/except` around execution
    (OPS-ERR-001); `mypy --strict` clean.

**Checkpoint**: `uv run mypy src` reports no errors in `src/factorflow/coverage/`;
every Phase 2 test passes under `uv run pytest -m postgres` and
`uv run pytest tests/unit/test_coverage_shapes.py`.

---

## Phase 4: Integration

**Purpose**: Confirm the package is importable by the S3 API route and ships its
SQL. No HTTP surface is introduced here.

- [ ] T013 Confirm `python -c "from factorflow.coverage.service import read_coverage, CoverageView"`
  succeeds without changes to `src/factorflow/__init__.py` (it has no `__all__`
  export list, so none is expected). Then run `uv build` and confirm that
  `unzip -l dist/factorflow-*.whl` lists `factorflow/coverage/sql/coverage.sql` and
  `factorflow/coverage/sql/never_acquired.sql` (T002).

**Checkpoint**: The import succeeds and the wheel carries both `.sql` files.

---

## Phase 5: Polish

**Purpose**: Validation passes cleanly; docstrings match design intent.

- [ ] T014 [P] Add a module docstring to `src/factorflow/coverage/service.py` citing
  component design sections 2.2, 2.4 and 2.5 and the ACs it satisfies (AC-7, AC-12,
  AC-17, AC-21, DAC-E6-1, DAC-E6-7, DAC-E6-S1-1…7). Put the PROVISIONAL choices
  (depth rounding, prices range, gap placeholder) in the `read_coverage` docstring,
  citing this plan's Open Gaps, as `src/factorflow/runs/queries.py` does for its
  owner-confirmed cursor contract.
- [ ] T015 Run `uv run ruff format --check .`, `uv run ruff check .`,
  `uv run mypy src`, `uv run pytest -m 'not postgres'` and `uv run pytest -m postgres`.
  Fix issues only in files this story touches.

**Checkpoint**: Every validation command exits 0.

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here classified.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E2-S2 | hard | `service.py` imports `read_history_depth` from `src/factorflow/instruments/settings.py`, which CAP-001-E2-S2 delivers (its Description). Not reachable through the existing edges. **New edge added to `dependencies.yaml` in this revision.** |
| CAP-001-E4-S1 | hard | `never_acquired.sql` reads `daily_bar`, `fundamental_observation`, `corporate_action` and `instrument_reference`, created by migration 0002 (E4-S1 Description). Existing edge. |
| CAP-001-E4-S3 | hard | The `coverage_segment` rows `read_coverage` reports are committed by E4-S3's writer (`src/factorflow/ingestion/writer.py`, `coverage.py`). Existing edge. |
| CAP-001-E5-S1 | hard | `coverage_segment` and `acquisition_state` are created by migration 0003 (E5-S1 Description); `coverage.sql` reads both. Existing edge. |
| CAP-001-E6-S2 | reverse | S2 depends on S1 (existing S2 → S1 edge): it adds `gaps.py`, `gaps.sql`, `read_gap_dates` and replaces S1's gap placeholder in `service.py` (S2-tasks T015–T017). S1 imports nothing from S2. |
| CAP-001-E6-S3 | reverse | S3 calls `read_coverage` from `GET /api/coverage` and asserts the never-acquired reason (S3-tasks T004, T015). |
| CAP-001-E6-S4 | context | Cited only for scope: the Coverage screen and TC-COMP-039 are S4's; S4 consumes S1 output through S3's HTTP body. |

### Task Dependencies

- T001, T002: no dependencies (parallel, Phase 1)
- T003–T009: depend on T001; parallel with each other (different files, or
  non-overlapping appends to `test_coverage_shapes.py` for T005/T009)
- T010, T011: depend on T001; parallel with each other
- T012: depends on T010, T011
- T013: depends on T002, T012
- T014, T015: depend on T012, T013

### Parallel Opportunities

- Phase 1: T001 and T002
- Phase 2: T003–T009
- Phase 3: T010 and T011
- Phase 5: T014 with the formatting part of T015

### Phase Dependencies

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5. CAP-001-E6-S2's plan starts only
after this story's `service.py` exists.

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

- AC-7 / AC-12 / DAC-E6-1 / DAC-E6-S1-5: `uv run pytest -m postgres tests/integration/test_coverage_reads.py` — presence, range and last acquired come only from committed rows; a rolled-back write leaves no coverage.
- AC-17 / DAC-E6-7 / DAC-E6-S1-2: `uv run pytest -m postgres tests/integration/test_coverage_empty.py` — never-acquired vs filter-empty, and the reasoned unavailable gap state on the empty store.
- AC-21 / DAC-E2-6 / DAC-E6-S1-4: `uv run pytest -m postgres tests/integration/test_coverage_retired.py`.
- DAC-E6-S1-3 / DAC-E6-S1-6 (covered-range half): `uv run pytest -m postgres tests/integration/test_coverage_depth.py`.
- DAC-E6-S1-7: `uv run pytest -m postgres tests/integration/test_coverage_volume.py` — correctness of paging and filters at 3000 instruments; no elapsed-time assertion.
- DAC-E6-S1-1 and shapes: `uv run pytest tests/unit/test_coverage_shapes.py` — no container.
- Packaging: `uv build && unzip -l dist/factorflow-*.whl | grep coverage/sql/`.

---

## Notes

### Mapped Component Test Cases

TC-COMP-007, TC-COMP-012, TC-COMP-017, TC-COMP-021, TC-COMP-027, TC-COMP-033,
TC-COMP-034, TC-COMP-035, TC-COMP-036, TC-COMP-037, TC-COMP-038 (covered-range half
only), TC-COMP-041, TC-COMP-042, TC-COMP-043, TC-COMP-044, TC-COMP-045,
TC-COMP-046 (covered-range half only), TC-COMP-047, TC-COMP-104. These are the
coverage-matrix rows for this story's ACs. TC-COMP-007, -012, -017, -021, -042…-047
and -104 were missing from the first version of this plan.

### Resolved Conflicts

1. **Gap-detection ownership (revision 2026-09-29).** The first version of this plan
   claimed `gaps.py`, `gaps.sql`, `read_gap_dates` and the gap tests (old T006–T008,
   T012–T014, T017, T018 steps 5–6). The approved stories govern a draft plan:
   CAP-001-E6-S1's Description delivers "`service.py` and the coverage half of
   `sql/`", and CAP-001-E6-S2's delivers "`gaps.py` and `gaps.sql`". The dependency
   graph runs S2 → S1, so S1 must not depend on S2. Resolution: S1 exposes the
   `GapDetection` / `InstrumentCoverage` shapes and a "not computed" placeholder;
   S2-tasks T016 populates the gap fields and T017 adds `read_gap_dates`. S2's
   "reconcile, don't duplicate" instruction (S2-tasks Phase 3) is now vacuous,
   because S1 no longer creates either file. Removed TCs: TC-COMP-028, -029, -030,
   -031, -032 (S2's ACs) and TC-COMP-040 (DAC-E6-14, not an S1 AC; S2-tasks T009
   exercises its backend half).
2. **Reason on the never-acquired branch.** The first version returned
   `reason=None` there while its own T013 required the reason whenever detection is
   unavailable. DAC-E6-4 (epic AC) and DAC-E6-S3-1 (S3 story AC) outrank a draft
   plan: T012 step 2 now sets `reason=UNAVAILABLE_REASON`, and T004 asserts it,
   consistent with CAP-001-E6-S3 T004. S2-tasks T016 leaves this branch untouched.
3. **`read_gap_dates(instrument_id: int)` removed.** S1 no longer declares it. The
   owner-confirmed signature is S2's:
   `read_gap_dates(conn, symbol, *, from_date, to_date) -> list[date] | None`
   (S2-tasks T017, PROVISIONAL item 4).
4. **Package-data ownership.** S1 owns the `pyproject.toml` entry (T002). S2-tasks
   T001 is conditional ("only if CAP-001-E6-S1 has not already added it") and
   becomes a no-op, so exactly one story adds it. CAP-001-E6-S3's note that the entry
   "belongs to CAP-001-E6-S2 T001" is superseded by this ownership; it has no effect
   on S3's tasks.
5. **OQ 2 (design section 14) — default date range.** The OQ entry is not struck
   through, but the normative body (section 2.3, owner decision 2026-09-05) is
   explicit: an omitted bound means everything acquired. For S1's coverage read an
   omitted bound applies no date predicate. Gap-range resolution is S2's
   (`gap_range.sql`).
6. **DAC-E6-7 scope of never-acquired.** The first version checked `daily_bar` only.
   DAC-E6-7 says "absence of any observation row in the store"; T011 now checks all
   four observation tables of migration 0002.
7. **Dependency citations.** The first version attributed `instrument` to
   CAP-001-E4-S1 and `settings.py` / `owner_setting` to CAP-001-E5-S1. Per the story
   Descriptions, E4-S1 delivers migration 0002 only, E5-S1 delivers migration 0003
   (and 0004), and `settings.py` is CAP-001-E2-S2's. The table above is corrected
   and the E2-S2 edge is added to the graph.

### Open Gaps

1. **CONFIRMED by owner (2026-09-29; carried from 2026-09-28): `depth_shortfall_years` rounding.**
   - Undefined: no artifact fixes how a date-range difference becomes whole years.
   - Adopted: `actual_days = (covered_to - covered_from).days + 1`;
     `stated_days = stated_years * 365`; `None` if `actual_days >= stated_days`,
     otherwise `math.ceil((stated_days - actual_days) / 365)`.
   - Derivation: the UX design shows *Short by n years* as an integer; ceiling
     favours reporting a shortfall over hiding it. Fixtures in T007/T009 produce an
     unambiguous result either way. CAP-001-E6-S4 already cites this rule.
   - Absorb in: component-design-coverage-service.md section 2.4.
2. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): which range fills `InstrumentCoverage.covered_from` / `covered_to`.**
   - Undefined: design 2.4 gives one range per instrument, but segments exist per
     data type.
   - Adopted: the `MIN(covered_from)` / `MAX(covered_to)` of the instrument's
     `prices` segments; `None` when it has none. The same range feeds the depth
     shortfall.
   - Derivation: the stated history depth governs daily-bar backfill, gap detection
     and S2's default range are prices-only (design 2.3, OQ 1), and per-data-type
     presence is already reported separately.
   - Absorb in: section 2.4.
3. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): gap fields before CAP-001-E6-S2 lands.**
   - Undefined: S1 must construct `GapDetection` values on a populated read but
     computes no gaps.
   - Adopted: `GapDetection(available=True, reason=None, missing_days=None)`, S2's
     existing "not computed" encoding (S2-tasks T016 / PROVISIONAL item 3), for the
     view and every row. It is never a zero (STD-UI-4, STD-UI-14), no new reason
     string is invented, and S2-tasks T016 replaces it. No consumer sees it, since
     CAP-001-E6-S3 hard-depends on S2. S1 tests do not assert it.
   - Absorb in: nothing after S2 lands; recorded so the interim state is not an
     unrecorded assumption.
4. **Genuine gap, not blocking: no latency target (coverage-service OQ 3).** Design
   section 7 says the volume test "returns within the suite timeout", but
   `pyproject.toml` configures no `pytest-timeout`, so no bound exists to adopt. T008
   asserts correctness only. The earlier PROVISIONAL "suite's implicit timeout" is
   withdrawn (resolution register section 8). Absorb in: section 5 / OQ 3 when the
   owner states a target.
5. **Genuine gap, not blocking: disjoint segments collapse into one range.** The
   writer keeps non-abutting segments separate (`merge_ranges` in
   `src/factorflow/ingestion/coverage.py`), but the single `covered_from` /
   `covered_to` pair spans any hole between them, and S2 treats dates between
   segments as outside coverage, so the hole is not a gap either. AC-12 is still
   held on the write side (segments commit only with their rows), but the collapsed
   row cannot show the hole. The design's row expansion ("per-data-type ranges",
   section 10) is the natural home for the detail. No task is planned. Absorb in:
   section 2.4 / 10.
6. **Genuine gap, not blocking: TC-COMP-038 / TC-COMP-046 gap-count half.** It needs
   `gaps.py`, and CAP-001-E6-S2's plan does not map TC-COMP-038 or -046. T007's
   `missing_days in (None, 0)` assertion passes vacuously before S2 and becomes a real
   check once S2's T016 lands. **Coordinator action:** decide whether S2's
   implementation adds a dedicated uniform-start case to `test_coverage_gaps.py`.
   This plan does not edit S2-tasks.

### Other Notes

- **Task renumbering.** The first version's service task was T018. CAP-001-E6-S3-tasks
  (T015) and CAP-001-E6-S4-tasks cite "CAP-001-E6-S1-tasks T018" for the
  `read_coverage` signature and the rounding rule. That task is now **T012**; the
  signature and rule are unchanged.
- `never_acquired.sql` must stay a separate `.sql` file, per the "SQL as `.sql` files
  loaded at import" rule (story Technical Details, design 2.1). Do not inline it.
- The four data types are pinned by the migration 0003 CHECK constraint. The
  `presence` dict keys use those exact strings.
- No cursor-validation exception is defined: the cursor is a plain symbol keyset
  position bound as a parameter, so any string is a valid position.
  CAP-001-E6-S3-tasks Open Gap 3 anticipates exactly this case.
- TC-COMP-039 (the Coverage screen must not auto-poll) is CAP-001-E6-S4's.
- Validation commands are defined in the tech stack. The project-wide constitution
  and `ui-conventions.md` (STD-UI-4, STD-UI-14) inform the None-vs-zero choices.
