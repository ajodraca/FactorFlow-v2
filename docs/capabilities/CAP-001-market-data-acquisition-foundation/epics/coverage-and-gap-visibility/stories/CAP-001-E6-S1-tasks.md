---
artifact_schema_version: 1
artifact_id: CAP-001-E6-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-28
updated: 2026-09-28
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-4-6
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-28T00:00:00Z
  source_artifacts:
    - id: CAP-001-E6-S1
      version: "1"
    - id: CAP-001-component-design-coverage-service
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E6-S1 — Coverage Derivation From Written Rows

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E6-tasks`
**Date**: 2026-09-28

## Summary

Delivers the `src/factorflow/coverage/` package: the `service.py` module
with the four pinned dataclasses (`Presence`, `GapDetection`,
`InstrumentCoverage`, `CoverageView`) and the two public callables
(`read_coverage`, `read_gap_dates`); the `gaps.py` module that holds the
trading-day-set and gap derivation logic; and the SQL files in
`src/factorflow/coverage/sql/` that back those callables. Coverage is derived
at read time from `coverage_segment`, `daily_bar`, `acquisition_state`,
`owner_setting`, and `instrument` — no summary is ever stored. The story
covers no API endpoint (S3) and no frontend (S4).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | Per-instrument coverage: data types present, date range, last acquired | T005, T006, T007 |
| AC-12 | No range shows complete that was not fully acquired | T003, T006, T007 |
| AC-17 | Never-acquired reported distinctly from filter-matching-nothing | T004, T006, T008 |
| AC-21 | Retired instruments appear with retained coverage, marked | T009 |
| DAC-E2-6 | Retired instruments distinguished rather than omitted | T009 |
| DAC-E6-1 | Coverage derived at read time from segments and observation rows | T003, T006 |
| DAC-E6-7 | Never-acquired means no observation row at all | T004, T006, T008 |
| DAC-E6-S1-1 | Per-data-type presence: present / absent / unknown for all four types | T005, T006 |
| DAC-E6-S1-2 | `never_acquired` uses its own query over observation existence | T004, T006, T008 |
| DAC-E6-S1-3 | Depth shortfall reported in years; None when depth is met | T010 |
| DAC-E6-S1-4 | Retired instrument included with lifecycle marker, not omitted | T009 |
| DAC-E6-S1-5 | `last_acquired_at` from `acquisition_state`, not run intent | T007 |
| DAC-E6-S1-6 | Uniform plan-cap shortfall not presented as a data gap | T011 |
| DAC-E6-S1-7 | Reads support symbol filter, lifecycle filter, date bounds, cursor paging | T012 |

## Phase 1: Setup

**Purpose**: Create the `coverage` package structure and SQL directory so all
subsequent tasks have a home.

- [ ] T001 Create `src/factorflow/coverage/__init__.py` (empty module marker)
- [ ] T002 [P] Create `src/factorflow/coverage/sql/` directory (place a `.gitkeep` initially — replaced by T003/T004 SQL files)

**Checkpoint**: `src/factorflow/coverage/` is an importable Python package;
`src/factorflow/coverage/sql/` exists as a directory.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define expected behavior before any
production code is present. Tests are grouped by test file; all files can be
created in parallel.

### Mandatory Component Tests

- [ ] T003 [P] Implement TC-COMP-027 (coverage derived from written rows only) and TC-COMP-031 (gap detection applies to prices only) in `tests/integration/test_coverage_reads.py`
  - Arrange: insert `instrument`, `coverage_segment`, and `daily_bar` rows for two instruments. One instrument has bars but no segment; one has both. Verify segment-only presence matches written rows.
  - Implements TC-COMP-027, TC-COMP-031 (DAC-E6-1, DAC-E6-5)
  - Also covers: AC-7, AC-12, DAC-E6-S1-5 (last_acquired from `acquisition_state`)

- [ ] T004 [P] Implement TC-COMP-033 (never-acquired distinct from filter-empty) in `tests/integration/test_coverage_empty.py`
  - Arrange: (a) empty store — verify `never_acquired=True`, `instruments=[]`; (b) populated store with a non-matching symbol filter — verify `never_acquired=False`, `instruments=[]`.
  - Implements TC-COMP-033 (DAC-E6-7)
  - Also covers: AC-17, DAC-E6-S1-2

- [ ] T005 [P] Implement TC-COMP-037 (per-data-type presence: present / absent / unknown) in `tests/unit/test_coverage_shapes.py`
  - Tests the `Presence` enum values and that `InstrumentCoverage` carries exactly the four data types (`reference`, `prices`, `fundamentals`, `corporate_actions`) with correct state assignment.
  - Also verifies `depth_shortfall_years` is `None` (not 0) when depth is met (component design 2.4 note).
  - Implements TC-COMP-037, TC-COMP-041 (DAC-E6-11, DAC-E6-S1-1)
  - Also covers: DAC-E6-S1-3 (None vs 0 assertion)

- [ ] T006 [P] Implement TC-COMP-028 (trading-day set from all instruments) and TC-COMP-029 (gap only inside own covered range) in `tests/integration/test_coverage_gaps.py`
  - Arrange: three instruments, two have bar on 2024-01-03, one is missing that date but covers 2024-01-01 to 2024-01-05. Verify exactly one gap reported for the missing instrument.
  - Second case: a session before `covered_from` does NOT appear as a gap.
  - Implements TC-COMP-028, TC-COMP-029 (DAC-E6-2, DAC-E6-3)

- [ ] T007 [P] Implement TC-COMP-030 (gap detection unavailable below two instruments) in `tests/integration/test_coverage_gaps.py` (append to same file)
  - Arrange: exactly one instrument with data in the range. Verify `gap_detection.available=False`, `reason="fewer_than_two_instruments_with_data"`, no gap count returned.
  - Implements TC-COMP-030 (DAC-E6-4)
  - Also covers: AC-8, STD-UI-14 compliance (reason travels with unavailability)

- [ ] T008 [P] Implement TC-COMP-032 (market-wide missing day not reported) and TC-COMP-038 (uniform plan-cap shortfall not a gap) in `tests/integration/test_coverage_gaps.py` (append)
  - Case 1: session absent for every instrument — verify no gap for any.
  - Case 2: all instruments start on the same date; dates before it produce no gaps; shortfall reported as depth difference, not gap count.
  - Implements TC-COMP-032, TC-COMP-038 (DAC-E6-6, DAC-E6-12)
  - Also covers: AC-12, AC-17, DAC-E6-S1-6

- [ ] T009 [P] Implement TC-COMP-034 (retired instruments keep coverage) in `tests/integration/test_coverage_retired.py`
  - Arrange: one active, one retired instrument, both with segments. Verify retired appears with `lifecycle="retired"`, not omitted.
  - Implements TC-COMP-034 (DAC-E6-8)
  - Also covers: AC-21, DAC-E2-6, DAC-E6-S1-4

- [ ] T010 [P] Implement TC-COMP-035 (depth shortfall in years) in `tests/integration/test_coverage_depth.py`
  - Arrange: stated depth = 5 years; instrument covered for 3 years. Verify `depth_shortfall_years=2`. Second instrument meets depth: verify `depth_shortfall_years=None`.
  - Implements TC-COMP-035 (DAC-E6-9)
  - Also covers: DAC-E6-S1-3

- [ ] T011 [P] Implement TC-COMP-036 (paging at 3000 instruments) in `tests/integration/test_coverage_volume.py`
  - Arrange: insert 3000 instruments with bars for one year. Verify read completes within the pytest session timeout and that keyset pagination returns all rows across pages.
  - Implements TC-COMP-036 (DAC-E6-10)
  - Also covers: DAC-E6-S1-7 (cursor paging)

- [ ] T012 [P] Implement TC-COMP-040 (specific missing dates behind expansion) in `tests/integration/test_coverage_reads.py` (append)
  - Verify `read_gap_dates` returns the exact list of missing session dates for a given instrument and range (not embedded in the collapsed `CoverageView`).
  - Implements TC-COMP-040 (DAC-E6-14)

### Additional Unit Tests

- [ ] T013 [P] Add unit tests for `GapDetection` shape invariants in `tests/unit/test_coverage_shapes.py` (append)
  - `available=True` → `reason` is `None`; `available=False` → `reason` is `"fewer_than_two_instruments_with_data"`; `missing_days` is `None` when unavailable.

**Checkpoint**: All test files exist; `uv run pytest -m postgres tests/integration/test_coverage_*.py tests/unit/test_coverage_shapes.py` collects all tests and they fail (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: Write the SQL files and the service + gaps modules that make all
tests pass.

- [ ] T014 Write `src/factorflow/coverage/sql/gaps.sql` — the normative gap-detection statement from component-design section 2.3, reproduced exactly:
  ```
  WITH in_range AS (
      SELECT b.instrument_id, b.session_date
        FROM daily_bar b
       WHERE b.session_date BETWEEN %(from_date)s AND %(to_date)s
  ),
  availability AS (
      SELECT count(DISTINCT instrument_id) >= 2 AS available
        FROM in_range
  ),
  trading_day AS (
      SELECT DISTINCT session_date FROM in_range
  ),
  covered AS (
      SELECT cs.instrument_id, cs.covered_from, cs.covered_to
        FROM coverage_segment cs
       WHERE cs.data_type = 'prices'
  )
  SELECT c.instrument_id,
         t.session_date AS missing_date
    FROM covered c
    JOIN trading_day t
      ON t.session_date BETWEEN c.covered_from AND c.covered_to
    LEFT JOIN in_range b
      ON b.instrument_id = c.instrument_id
     AND b.session_date  = t.session_date
   WHERE b.instrument_id IS NULL
     AND (SELECT available FROM availability)
   ORDER BY c.instrument_id, t.session_date;
  ```
  This SQL is normative; do not alter it.

- [ ] T015 Write `src/factorflow/coverage/sql/coverage.sql` — the per-instrument coverage query:
  Joins `instrument`, `coverage_segment` (aggregated to `MIN(covered_from)` / `MAX(covered_to)` per instrument and data type), and `acquisition_state` (for `last_acquired_at`), with keyset pagination by `symbol`. Includes the lifecycle column from `instrument`. Parameterised: `%(symbol_prefix)s`, `%(lifecycle)s`, `%(from_date)s`, `%(to_date)s`, `%(cursor_symbol)s`, `%(limit)s`.

- [ ] T016 Write `src/factorflow/coverage/sql/never_acquired.sql` — the separate existence check:
  `SELECT NOT EXISTS (SELECT 1 FROM daily_bar LIMIT 1) AS never_acquired;`
  Kept separate from the coverage query per design section 2.5 and DAC-E6-S1-2.

- [ ] T017 Write `src/factorflow/coverage/gaps.py` — the trading-day set and gap derivation module:
  - Loads `gaps.sql` at import from `Path(__file__).parent / "sql" / "gaps.sql"`.
  - `check_availability(conn, from_date, to_date) -> bool`: executes the availability sub-query to test `COUNT(DISTINCT instrument_id) >= 2` in the range.
  - `read_gap_dates_for_instrument(conn, instrument_id, from_date, to_date) -> list[date]`: executes `gaps.sql` filtered to one instrument. Returns the missing dates. Returns `[]` when availability is false (caller checks availability separately).
  - Uses `psycopg` 3 bound parameters; no ORM.

- [ ] T018 Write `src/factorflow/coverage/service.py` — the public read API:
  - Declare the four pinned dataclasses exactly as in component-design section 2.4: `Presence(StrEnum)`, `GapDetection(frozen dataclass)`, `InstrumentCoverage(frozen dataclass)`, `CoverageView(frozen dataclass)`.
  - Load `coverage.sql` and `never_acquired.sql` at import.
  - Import `read_history_depth` from `src/factorflow/instruments/settings.py` (delivered by CAP-001-E5-S1).
  - Implement `read_coverage(conn, *, symbol: str | None = None, lifecycle: str | None = None, from_date: date | None = None, to_date: date | None = None, cursor: str | None = None, limit: int = 50) -> CoverageView`:
    1. Execute `never_acquired.sql`; if `True`, return `CoverageView(never_acquired=True, gap_detection=GapDetection(available=False, reason=None, missing_days=None), instruments=[], next_cursor=None)`.
    2. Read `owner_setting` via `read_history_depth`.
    3. Execute `coverage.sql` with bound parameters; reads `coverage_segment` (written by CAP-001-E4-S3) and `acquisition_state` (written by CAP-001-E5-S1); assemble `InstrumentCoverage` rows with `Presence` derivation and `depth_shortfall_years`.
    4. Derive `depth_shortfall_years`: `ceil((stated_depth_days - actual_days) / 365)` rounded up, or `None` when actual days ≥ stated depth days. (PROVISIONAL — see Open Gaps.)
    5. Call `check_availability`; if false, attach `GapDetection(available=False, reason="fewer_than_two_instruments_with_data", missing_days=None)` to the view.
    6. If available, sum gap counts across instruments via `gaps.sql`; queries `daily_bar` (written by CAP-001-E4-S1); attach `GapDetection(available=True, reason=None, missing_days=total)`.
    7. Return `CoverageView` with `next_cursor` derived from the last symbol on the page (keyset cursor).
  - Implement `read_gap_dates(conn, instrument_id: int, from_date: date | None = None, to_date: date | None = None) -> list[date]`: delegates to `gaps.py`. Used by row expansion (CAP-001-E6-S2, CAP-001-E6-S3).
  - `Presence` derivation rules (from component design 2.4 and DAC-E6-S1-1):
    - A data type has at least one `coverage_segment` row → `PRESENT`.
    - A data type has at least one `acquisition_state` row with `last_outcome` in (`not_found`, `failed`) and no segment → `ABSENT`.
    - No row at all for the data type → `UNKNOWN`.

**Checkpoint**: `uv run mypy src` reports no errors in `src/factorflow/coverage/`; all tests in Phase 2 pass under `uv run pytest -m postgres`.

---

## Phase 4: Integration

**Purpose**: Wire the `coverage` package into the broader application so it
is importable by the S3 API endpoint when that story lands. No HTTP surface
is introduced here (that is S3).

- [ ] T019 Update `src/factorflow/__init__.py` (if it has an explicit `__all__` or package export list) to expose `coverage` as a known subpackage — or confirm the package is importable without changes and note that.

**Checkpoint**: `python -c "from factorflow.coverage.service import read_coverage, CoverageView"` succeeds.

---

## Phase 5: Polish

**Purpose**: Validation passes cleanly; docstrings match design intent.

- [ ] T020 Add module-level docstrings to `service.py` and `gaps.py` citing the component design section they implement (2.2–2.5) and the ACs they satisfy (AC-7, AC-8, AC-12, AC-17, AC-21, AC-22).
- [ ] T021 Run `uv run ruff check . --fix` and `uv run mypy src`; resolve any lint or type errors in the new files. Do not touch files outside `src/factorflow/coverage/` and the new test files.

**Checkpoint**: `uv run pytest -m postgres`, `uv run ruff check .`, and `uv run mypy src` all exit 0.

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here classified.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E4-S1 | hard | `instrument` table and `daily_bar` table are created by E4-S1's migration (0001/0002); coverage reads join them. Already in `dependencies.yaml`. |
| CAP-001-E4-S3 | hard | `coverage_segment` is written by the observation writer in E4-S3 (migration 0003); `read_coverage` reads it. Already in `dependencies.yaml`. |
| CAP-001-E5-S1 | hard | `acquisition_state` (migration 0003) and `owner_setting` (settings.py, HISTORY_DEPTH_KEY) are delivered by E5-S1; `read_coverage` imports `read_history_depth` and reads `acquisition_state`. Already in `dependencies.yaml`. |
| CAP-001-E6-S2 | reverse | S2 depends on S1's `service.py` for the gaps module (gaps.py); S1 delivers the contract S2 extends. |
| CAP-001-E6-S3 | reverse | S3 wires `read_coverage` into `GET /api/coverage`; it depends on S1's callables. |

### Task Dependencies

- T001, T002: No dependencies (parallel, Phase 1)
- T003–T013: Depend on T001 (package must exist); all parallel with each other (Phase 2)
- T014, T015, T016: Depend on T002 (sql/ directory); all parallel with each other (Phase 3)
- T017: Depends on T014 (loads gaps.sql at import)
- T018: Depends on T015, T016, T017 (loads coverage.sql, never_acquired.sql; calls gaps.py)
- T019: Depends on T018
- T020, T021: Depend on T018, T019 (Phase 5, parallel with each other)

### Parallel Opportunities

- Phase 1: T001 and T002 in parallel
- Phase 2: T003–T013 all in parallel (different files or non-overlapping sections)
- Phase 3 SQL files: T014, T015, T016 in parallel
- Phase 5: T020 and T021 in parallel

---

## Validation Plan

### Constitution-Defined Commands

- Test (postgres-marked): `uv run pytest -m postgres`
- Lint: `uv run ruff check .`
- Type-check: `uv run mypy src`

### Story-Specific Validation

- AC-7: `uv run pytest -m postgres tests/integration/test_coverage_reads.py` — verifies per-instrument presence, range, and last-acquired.
- AC-12: `uv run pytest -m postgres tests/integration/test_coverage_reads.py` — verifies range only reported where rows exist.
- AC-17: `uv run pytest -m postgres tests/integration/test_coverage_empty.py` — verifies never-acquired vs filter-empty distinction.
- AC-21: `uv run pytest -m postgres tests/integration/test_coverage_retired.py` — verifies retired instruments appear with lifecycle marker.
- AC-22: `uv run pytest -m postgres tests/integration/test_coverage_depth.py` — verifies depth shortfall computation; compliant instruments carry `None`.
- Gap derivation: `uv run pytest -m postgres tests/integration/test_coverage_gaps.py` — verifies trading-day set logic, inside-range filter, and unavailability below two instruments.
- Volume: `uv run pytest -m postgres tests/integration/test_coverage_volume.py` — verifies 3000 instruments paged read completes within suite timeout.
- Dataclass shapes: `uv run pytest tests/unit/test_coverage_shapes.py` — no Postgres container needed.

---

## Notes

### Resolved Conflicts

**OQ 2 (component-design section 14) — default date range**: The OQ entry is not struck through but the normative body (section 2.3, owner decision 2026-09-05) is explicit: when `from_date` or `to_date` is omitted, the service substitutes the instrument's own `covered_from` / `covered_to`. The body governs; the OQ formatting is an oversight (confirmed by resolution register). Adopted as binding in T018.

**OQ 1 (component-design section 14) — gap detection scope**: Fully resolved (struck through); prices only. Adopted in T014 and T017.

### Open Gaps

**PROVISIONAL — depth_shortfall_years calculation**: No artifact defines the exact rounding rule for converting a date-range difference into integer years for `depth_shortfall_years`. This plan adopts: compute `actual_days = (covered_to - covered_from).days + 1`; compute `stated_days = stated_depth_years * 365`; if `actual_days >= stated_days`, return `None`; otherwise return `math.ceil((stated_days - actual_days) / 365)`. Derivation: the UX design shows *Short by n years* with integer display; ceiling rounding is the conservative choice that favours reporting a shortfall over hiding it. Owner should confirm at the next revision of `component-design-coverage-service.md` (section 2.4 or a new section 2.6). Does not block any test since the test fixtures can be arranged to produce an unambiguous integer result regardless of rounding strategy.

**PROVISIONAL — volume test timeout bound**: OQ 3 (component design section 14) states no latency target. The volume test (T011 / TC-COMP-036) asserts "completes within the suite timeout." The pytest default session timeout (if `pytest-timeout` is not configured) is no limit; the resolution register notes this is the implicit bound. If `pytest-timeout` is configured in `pyproject.toml`, that value is the bound. The implementation agent should check `pyproject.toml` for a `timeout` setting before writing the volume test assertion, and record the found value as a comment in the test file. Flag for next revision of component design.

### Other Notes

- `gaps.py` is kept separate from `service.py` because the design names it as a distinct module (section 2.1) and because `read_gap_dates` is called from row expansion independently of `read_coverage`. Keep that boundary.
- `never_acquired.sql` is a three-word query but it must remain a separate `.sql` file to comply with the "SQL as `.sql` files loaded at import" rule (story technical details and component design 2.1). Do not inline it as a string in `service.py`.
- The four data types (`reference`, `prices`, `fundamentals`, `corporate_actions`) are pinned by the `migrations/0003_coverage.sql` CHECK constraint. The `Presence` dict key must use these exact strings, not a local enum, to match what the database returns in `data_type` columns.
- The `migrated_writer_connection` fixture (conftest.py line 162) applies all four migrations and is the correct fixture for all integration tests in this story. Do not create a new fixture.
- TC-COMP-039 (Coverage screen MUST NOT auto-poll) and TC-COMP-040's UI expansion behaviour trace to S4 (frontend). TC-COMP-040's backend contract — that `read_gap_dates` exists as a separate callable — is covered by T012 above. The auto-poll constraint is entirely S4 scope and is not addressed here.
