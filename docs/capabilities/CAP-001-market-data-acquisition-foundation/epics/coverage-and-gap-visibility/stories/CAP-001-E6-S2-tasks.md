---
artifact_schema_version: 1
artifact_id: CAP-001-E6-S2-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-29
updated: 2026-09-30
docs_synced_review: CAP-001-E6-S2-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-4
  tool: Devin
  tool_version: unknown
  timestamp: 2026-09-29T02:20:02Z
  source_artifacts:
    - id: CAP-001-E6-S2
      version: "1"
    - id: CAP-001-E6
      version: "1"
    - id: CAP-001-component-design-coverage-service
      version: "6"
    - id: CAP-001-component-design-ingestion-api
      version: "approved"
    - id: CAP-001-component-design-market-data-store
      version: "approved"
    - id: CAP-001-component-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E6-S2 — Gap Detection Against the Derived Trading-Day Set

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E6-tasks`
**Date**: 2026-09-29

## Summary

Delivers `src/factorflow/coverage/gaps.py` and `src/factorflow/coverage/sql/gaps.sql`,
so the owner can tell complete coverage from coverage with holes in it (AC-8). The
provider has no historical trading calendar, so a trading day is any date on which
**any** instrument has a daily bar in the requested range. A gap is a date in that
set that falls inside an instrument's own `prices` covered range and has no bar for
that instrument. Detection is reported unavailable, with a reason, when fewer than
two instruments hold bars in the range. It is never reported as zero. The plan also
states two limits rather than hiding them: a day missing for every instrument is not
detected, and detection covers prices only. The story extends the coverage read that
CAP-001-E6-S1 delivers in `src/factorflow/coverage/service.py`. It fills in the gap
fields of the pinned `GapDetection` / `InstrumentCoverage` / `CoverageView`
dataclasses and adds `read_gap_dates` for row expansion. No HTTP surface is added
here; that is CAP-001-E6-S3.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-8 | Missing trading days inside an acquired range are identified | T003, T012, T015, T016 |
| DAC-E6-2 | Trading-day set = union of dates any instrument has a bar in the range | T004, T012, T015 |
| DAC-E6-3 | A missing date is a gap only inside that instrument's own covered range | T005, T012, T015 |
| DAC-E6-4 | Fewer than two instruments with data → unavailable with a reason, not an empty list | T006, T011, T013, T015, T016, T017 |
| DAC-E6-5 | Gap detection applies to daily prices only | T007, T012, T016 |
| DAC-E6-6 | A market-wide provider outage is not claimed as detected | T008, T012 |
| DAC-E6-S2-1 | Checking an instrument against its own dates alone is avoided | T004, T012 |
| DAC-E6-S2-2 | A date before first acquisition is outside coverage, not a gap | T005, T012 |
| DAC-E6-S2-3 | Availability predicate evaluated inside the statement → no rows, not a zero | T006, T010, T012, T015 |
| DAC-E6-S2-4 | Fundamentals / corporate actions: no gaps computed | T007, T016, T017 |
| DAC-E6-S2-5 | A day missing for every instrument yields no gap for anyone | T008, T012 |
| DAC-E6-S2-6 | A count for the collapsed row, specific dates for expansion | T009, T016, T017 |

## Phase 1: Setup

**Purpose**: Make sure the `.sql` files this story adds ship inside the installed package.

- [x] T001 Add package data for the coverage SQL files in `pyproject.toml`, **only if
  CAP-001-E6-S1 has not already added it**: a `[tool.setuptools.package-data]` table
  with `factorflow = ["coverage/sql/*.sql"]`. Why: `[tool.setuptools.packages.find]`
  alone does not ship non-Python files, and the repo has no `MANIFEST.in` and no SCM
  plugin. The `Dockerfile` runs `pip install --no-cache-dir .`, so without this entry
  `gaps.py` fails at import in the container, because design 2.1 requires statements
  "as .sql files loaded at import". This is prerequisite infrastructure for AC-8. It
  is the first `.sql` under `src/`, so there is no earlier precedent. Touch nothing
  else in `pyproject.toml`.

**Checkpoint**: `uv build` produces a wheel. After T012–T014, `unzip -l dist/factorflow-*.whl | grep coverage/sql/` lists the new `.sql` files.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the gap semantics before any production code exists.

All integration tests go in `tests/integration/test_coverage_gaps.py`, the file that
component design section 7 names for gap tests. Mark them `@pytest.mark.postgres`.
Use the existing `migrated_writer_connection` fixture (`tests/conftest.py`), which
applies migrations 0001–0004 to an isolated database. Do not add a new fixture. Every
test carries a traceability comment such as `# Implements TC-COMP-028`. The
component test spec's steps are generic boilerplate. The concrete assertions below
are sharpened from the ACs each TC traces to, and those ACs are the source of truth.

Seed data with module-local helpers in that test file. They follow the direct-INSERT
precedent in `tests/integration/test_writer_coverage.py`:

- `_instrument(conn, symbol, lifecycle="active") -> int`
- `_bars(conn, instrument_id, dates)`: inserts `daily_bar` rows with a 32-byte
  `value_hash`, e.g. `hashlib.sha256(f"{instrument_id}{d}".encode()).digest()`, and
  fixed OHLCV values.
- `_segment(conn, instrument_id, data_type, covered_from, covered_to)`: inserts a
  `coverage_segment` row.
- `commit` after seeding.

The trading-day set is derived only from bars that exist, so sparse seeding on real
weekdays (2024-01-02 Tue … 2024-01-05 Fri) is enough.

### Mandatory Component Tests

- [x] T002 Create `tests/integration/test_coverage_gaps.py` with the module docstring
  (story, design 2.3, the TC list below), `pytestmark = pytest.mark.postgres`, and the
  three seed helpers above. No test functions yet (scaffolding for T003–T011).

- [x] T003 Implement TC-COMP-008 (Gap visibility, AC-8) in `tests/integration/test_coverage_gaps.py`
  - Arrange: A, B, C all have `prices` segments 2024-01-02..2024-01-05. A and B have
    bars on all four days. C lacks 2024-01-04.
  - Act: `read_coverage(conn)` with no bounds.
  - Assert: `view.gap_detection.available is True`. C's
    `InstrumentCoverage.gaps.missing_days == 1`. A and B each have `== 0`.
    `read_gap_dates(conn, "C") == [date(2024, 1, 4)]`. This matches design section 7:
    "three instruments, one missing a session the other two have, produces exactly one gap".

- [x] T004 Implement TC-COMP-028 (trading-day set is the union across instruments, DAC-E6-2) and TC-COMP-048 (own-dates check avoided, DAC-E6-S2-1) in `tests/integration/test_coverage_gaps.py`
  - TC-COMP-028: A, B, C are covered 2024-01-02..2024-01-04. A has bars on 01-02 and
    01-03. B has bars on 01-03 and 01-04. C has bars on all three days. Assert
    `gaps.detect_gaps(conn)` gives `missing == {A: [01-04], B: [01-02]}` and C is
    absent. Each missing date is contributed by a *different* instrument, which proves
    the union.
  - TC-COMP-048: A has bars on 01-02, 01-03, 01-04. B has bars on 01-02 and 01-04.
    Both are covered 01-02..01-04. B's own bar dates are hole-free when read on their
    own, so a self-referential check would give zero. Assert B's dates `== [01-03]`
    and `missing_days == 1`, asserted **not** 0.

- [x] T005 Implement TC-COMP-029 (gap only inside own covered range, DAC-E6-3) and TC-COMP-049 (date before first acquisition is outside coverage, DAC-E6-S2-2) in `tests/integration/test_coverage_gaps.py`
  - TC-COMP-029: A is covered 01-02..01-05 with bars on all four days. B is covered
    01-03..01-04 with bars on both days. Assert B has no gaps: 01-02 and 01-05 are
    trading days but fall outside B's range. Then delete B's 01-04 bar. Assert
    exactly `[01-04]`: the inside-range date *is* a gap.
  - TC-COMP-049: A is covered 01-02..01-05 with bars on all days. B's segment starts
    01-04 (first acquisition) with bars on 01-04 and 01-05. Assert
    `read_gap_dates(conn, "B") == []` and B's `missing_days == 0`, even though 01-02
    and 01-03 are trading days with no B bar.

- [x] T006 Implement TC-COMP-030 (unavailable below two instruments, with a reason, DAC-E6-4) and TC-COMP-050 (predicate inside the statement → no rows, DAC-E6-S2-3) in `tests/integration/test_coverage_gaps.py`
  - TC-COMP-030 (one instrument): only A has bars and a segment, 01-02..01-05, with
    01-03 missing. Assert `view.gap_detection.available is False` and
    `reason == "fewer_than_two_instruments_with_data"`. Assert
    `view.gap_detection.missing_days is None`, **explicitly** `is not 0` (asserted as
    `is None`, not falsy). Assert A's `InstrumentCoverage.gaps` carries the same
    unavailable state. Assert `read_gap_dates(conn, "A") is None`, **not** `[]`.
  - TC-COMP-050: A is covered 01-02..01-05 with bars on all days. B's `prices` segment
    covers 01-02..01-31, but B has bars only on 01-22..01-24. Execute `gaps.GAPS_SQL`
    directly with `from_date=01-02, to_date=01-05`. Assert **zero rows**. Without the
    in-statement predicate, B would report four gaps. Positive control: the same
    statement with `to_date=01-24` returns B × {01-02, 01-03, 01-04, 01-05} and nothing
    for A. Also assert `detect_gaps(conn, from_date=01-02, to_date=01-05).available is False`.

- [x] T007 Implement TC-COMP-031 (prices only, DAC-E6-5) and TC-COMP-051 (no gaps for fundamentals / corporate actions, DAC-E6-S2-4) in `tests/integration/test_coverage_gaps.py`
  - TC-COMP-031: A and B have `prices` segments 01-02..01-05 and bars on all days.
    A also has a `fundamentals` segment 2023-01-01..2024-12-31. Give B extra bars
    01-08..01-10 and widen B's prices segment to 01-10. Assert A reports no gaps for
    01-08..01-10: its fundamentals range asserts nothing about completeness.
  - TC-COMP-051: F has only a `fundamentals` segment (2023-01-01..2024-12-31, sparse
    `fundamental_observation` rows) and a `corporate_actions` segment, and no prices
    segment. A and B provide an available trading-day set inside F's fundamentals
    span. Assert F never appears in `detect_gaps(...).missing`. Assert F's
    `InstrumentCoverage.gaps.missing_days is None` (not computed, not measured zero).
    Assert `read_gap_dates(conn, "F") is None`. See Open Gaps, PROVISIONAL item 3.

- [x] T008 Implement TC-COMP-032 (market-wide outage not claimed, DAC-E6-6) and TC-COMP-052 (a day missing for everyone yields no gap, DAC-E6-S2-5) in `tests/integration/test_coverage_gaps.py`
  - A and B are both covered 01-02..01-05, and **both** lack 01-03, a weekday.
  - TC-COMP-032, service level: `view.gap_detection.available is True`. Both
    instruments' `missing_days == 0`. No response field names 01-03.
  - TC-COMP-052, gaps level: `read_gap_dates` returns `[]` for both, and `01-03` is
    in no instrument's list in `detect_gaps(conn).missing`. Add a comment that this
    documents the stated limit (design section 3, STD-UI-18) and is not a defect.

- [x] T009 Implement TC-COMP-053 (count for collapsed row, dates for expansion, DAC-E6-S2-6) in `tests/integration/test_coverage_gaps.py`
  - Arrange: A has bars on 01-02..01-05. B lacks 01-03 and 01-05. Both are covered
    01-02..01-05.
  - Assert B's `InstrumentCoverage.gaps.missing_days == 2`. Assert
    `read_gap_dates(conn, "B") == [date(2024,1,3), date(2024,1,5)]`, ascending, and
    that it equals the count. Assert `InstrumentCoverage` has no field holding dates:
    `{f.name for f in dataclasses.fields(InstrumentCoverage)}` contains no date list,
    so dates sit behind expansion only. Also exercises TC-COMP-040's backend half
    (DAC-E6-14).

### Additional Unit Tests

- [x] T010 [P] Add a drift guard in `tests/unit/test_coverage_gaps_sql_matches_design.py`
  following the precedent of `tests/unit/test_migration_0001_matches_design.py`.
  Compare `src/factorflow/coverage/sql/gaps.sql` byte-for-byte to
  `sql_block_under_heading("### 2.3", path=<REPO_ROOT>/docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-coverage-service.md)`
  from `tests/unit/design_sql.py`. Add a second test asserting that the extracted
  block contains `availability AS` and `(SELECT available FROM availability)`, so the
  guard is proven to read the real block. This pins the design's three load-bearing
  properties (DAC-E6-2, DAC-E6-3, DAC-E6-S2-3) against silent edits. Needs no
  container.

- [x] T011 Add edge-case integration tests to `tests/integration/test_coverage_gaps.py`:
  - **Default range is everything acquired** (design 2.3, owner decision 2026-09-05;
    ingestion-api 2.4a). A and B are covered 2022-03-14..2024-01-04. Both have bars
    on {2022-03-14, 2022-03-15, 2022-03-16, 2024-01-02, 2024-01-03, 2024-01-04}, except
    that B lacks 2022-03-15. With no bounds, assert B's `missing_days == 1` and
    `read_gap_dates(conn, "B") == [2022-03-15]`: a gap older than any trailing window
    is still reported. With only `from_date=2024-01-01` supplied, assert B has 0
    gaps. The omitted `to_date` resolves to the latest prices `covered_to`.
  - **Zero instruments with data in the range** (story Testing). The store is
    populated, but the explicit range 2025-06-02..2025-06-06 holds no bars. Assert
    `detect_gaps(...).available is False` and the view reports the reason with
    `missing_days is None`. The empty-store case is S1's never-acquired
    short-circuit. Assert only `available is False` and `missing_days is None` there
    (see Other Notes).
  - **Inverted range**: `detect_gaps(conn, from_date=01-05, to_date=01-02)` raises
    `ValueError` (design section 4, SEC-INP-001).
  - **Unknown symbol**: `read_gap_dates(conn, "ZZZZ")` raises
    `factorflow.instruments.service.InstrumentNotFound`. It does not return `[]`,
    which would read as "no gaps".
  - **Database failure propagates** (design AC 9, OPS-ERR-001). On a closed
    connection, `detect_gaps` raises a `psycopg.Error` subclass and returns no empty
    result.

**Checkpoint**: `uv run pytest tests/unit/test_coverage_gaps_sql_matches_design.py` and `uv run pytest -m postgres tests/integration/test_coverage_gaps.py` are collected and fail for missing production code, not for fixture or seeding errors.

---

## Phase 3: Core Implementation

**Purpose**: Add the gap statements and the `gaps.py` derivation module that make Phase 2 pass.

> **Reconcile, don't duplicate.** The draft CAP-001-E6-S1 task plan (T014, T017)
> also lists `gaps.sql` and `gaps.py`. The approved stories give them to this story
> (see Resolved Conflicts). If S1's implementation has already created either file,
> bring it into line with the tasks below rather than creating a second copy.

- [x] T012 [P] Create `src/factorflow/coverage/sql/gaps.sql` as a **byte-for-byte copy**
  of the `sql` block in component-design-coverage-service.md section 2.3. Include its
  first line, the comment `-- src/factorflow/coverage/sql/gaps.sql`, and the trailing
  newline. Keep the named parameters `%(from_date)s` / `%(to_date)s`. Do not add an
  instrument filter, lifecycle filter or `LIMIT`. T010 enforces the exact copy.

- [x] T013 [P] Create `src/factorflow/coverage/sql/gap_range.sql`. It is one
  read-only statement that returns exactly one row
  `(from_date date, to_date date, available boolean)`:
  - `from_date = coalesce(%(from_date)s::date, min(covered_from))` and
    `to_date = coalesce(%(to_date)s::date, max(covered_to))`, both over
    `coverage_segment WHERE data_type = 'prices'`. This applies the owner decision
    that an omitted bound means everything acquired (design 2.3). See Resolved
    Conflicts #2 for why the union of prices ranges gives the same per-instrument gap
    output as per-instrument bounds.
  - `available = (SELECT count(DISTINCT b.instrument_id) >= 2 FROM daily_bar b WHERE b.session_date BETWEEN <resolved from> AND <resolved to>)`.
    This is the same predicate as the `availability` CTE in `gaps.sql`. It is how the
    service learns availability *before* computing gaps (design 2.2 flowchart, nodes
    H→I/J). With no prices segment and no supplied bounds, both bounds are NULL and
    `available` is false.
  - Bound parameters only. No DML. Reads `coverage_segment` (migration 0003,
    delivered by CAP-001-E5-S1) and `daily_bar` (migration 0002, delivered by
    CAP-001-E4-S1).

- [x] T014 [P] Create `src/factorflow/coverage/sql/gap_instrument.sql`. It is one
  read-only statement: `SELECT i.instrument_id, EXISTS (SELECT 1 FROM coverage_segment cs WHERE cs.instrument_id = i.instrument_id AND cs.data_type = 'prices') AS has_prices FROM instrument i WHERE i.symbol = %(symbol)s;`
  The unique index `idx_instrument_symbol` guarantees at most one row. Used by
  `read_gap_dates` (T017).

- [x] T015 Create `src/factorflow/coverage/gaps.py` (depends on T012, T013):
  - At import, load `GAPS_SQL` and `GAP_RANGE_SQL` from `Path(__file__).parent / "sql"`.
    Expose `GAPS_SQL` at module level, because T006 executes it directly.
  - `UNAVAILABLE_REASON: Final = "fewer_than_two_instruments_with_data"` is the
    reason string pinned by design 2.4. If S1's `service.py` already declares this
    literal, move the single definition here and import it there.
    `service.py` imports `gaps.py`, never the reverse.
  - `@dataclass(frozen=True) class GapResult`: `available: bool`,
    `from_date: date | None`, `to_date: date | None`,
    `missing: dict[int, list[date]]`, keyed by `instrument_id` with ascending dates.
  - `detect_gaps(conn: psycopg.Connection, *, from_date: date | None = None, to_date: date | None = None) -> GapResult`:
    1. If both bounds are given and `from_date > to_date`, raise `ValueError`.
    2. Execute `GAP_RANGE_SQL` to get the resolved bounds and `available`.
    3. If not available, return `GapResult(False, from, to, {})` **without** executing
       `GAPS_SQL`. Gaps are computed only after the availability check (design 2.2).
    4. Otherwise execute `GAPS_SQL` once with the resolved bounds. Group rows by
       `instrument_id`, keeping the statement's `ORDER BY`, and return
       `GapResult(True, from, to, missing)`.
  - psycopg 3 bound parameters, no ORM, no `try/except` around execution. Database
    errors propagate (design section 4, OPS-ERR-001, component design AC 9).
    `mypy --strict` clean.

**Checkpoint**: T004–T008's `detect_gaps` / `GAPS_SQL` assertions and T010 pass. The service-level assertions still fail until Phase 4.

---

## Phase 4: Integration

**Purpose**: Wire gap results into the coverage read that CAP-001-E6-S1 delivers, and add the expansion read.

- [x] T016 Wire gap detection into `read_coverage` in `src/factorflow/coverage/service.py`
  (S1's module). Change only the gap fields:
  - After S1 assembles the page rows, call
    `gaps.detect_gaps(conn, from_date=from_date, to_date=to_date)` **once per
    request**. Pass the caller's bounds unchanged; `None` stays `None`, because
    `gap_range.sql` resolves defaults.
  - `CoverageView.gap_detection`:
    - When available: `GapDetection(True, None, sum(len(v) for v in result.missing.values()))`.
    - When unavailable: `GapDetection(False, UNAVAILABLE_REASON, None)`.
    - See PROVISIONAL item 1.
  - Each `InstrumentCoverage.gaps`:
    - When the view is unavailable: `GapDetection(False, UNAVAILABLE_REASON, None)`.
    - When the instrument's `presence["prices"] is not Presence.PRESENT`:
      `GapDetection(True, None, None)`, meaning not computed (DAC-E6-S2-4).
    - Otherwise: `GapDetection(True, None, len(result.missing.get(instrument_id, [])))`.
    - See PROVISIONAL items 2 and 3.
  - This needs each page row's `instrument_id`. If S1's `coverage.sql` does not
    already select `i.instrument_id`, add that one column to its select list. The
    change is additive and does not change the pinned public dataclasses.
  - Leave S1's never-acquired short-circuit, filters, cursor and depth logic untouched.

- [x] T017 Add `read_gap_dates` to `src/factorflow/coverage/service.py` (depends on T014, T015, T016). The design section 11 API names it: "Instrument, date range → the specific missing dates".
  - Signature: `read_gap_dates(conn: psycopg.Connection, symbol: str, *, from_date: date | None = None, to_date: date | None = None) -> list[date] | None`.
  - Normalise `symbol` with `factorflow.instruments.symbols.normalise`, following
    the `retire_symbol` precedent. Both that module and `InstrumentNotFound` were
    delivered by CAP-001-E2-S1. Execute `gap_instrument.sql`, loaded at import.
    If there is no row, raise `factorflow.instruments.service.InstrumentNotFound`.
  - If `has_prices` is false, return `None` (not computed, DAC-E6-S2-4).
  - Otherwise call `gaps.detect_gaps(conn, from_date=..., to_date=...)`. If it is
    unavailable, return `None`, **never `[]`** (DAC-E6-4). If available, return
    `result.missing.get(instrument_id, [])`.
  - If S1 already declared a `read_gap_dates` stub, for example with
    `instrument_id: int` as in its draft plan, replace it with this signature. See
    PROVISIONAL item 4.

**Checkpoint**: Every test in `tests/integration/test_coverage_gaps.py` passes under `uv run pytest -m postgres`. S1's existing coverage tests still pass.

---

## Phase 5: Polish

**Purpose**: Traceability comments, documentation and clean validation.

- [x] T018 [P] Add a module docstring to `src/factorflow/coverage/gaps.py`. It cites
  component design 2.2, 2.3 and 3, and AC-8, DAC-E6-2…6, DAC-E6-S2-1…6. It states
  both limits in plain words: unavailable below two instruments, and a market-wide
  outage is undetectable. Add a one-line code comment above the default-range
  resolution in `gap_range.sql` that cites the owner decision of 2026-09-05. Put the
  PROVISIONAL choices in the `read_coverage` and `read_gap_dates` docstrings, citing
  this plan's Open Gaps, as the existing `runs/queries.py` does for its
  owner-confirmed cursor contract.
- [x] T019 Run `uv run ruff format --check .`, `uv run ruff check .`, `uv run mypy src`, `uv run pytest -m 'not postgres'` and `uv run pytest -m postgres`. Fix issues only in files this story touches. Then run `uv build` and confirm that `unzip -l dist/factorflow-*.whl` lists `factorflow/coverage/sql/gaps.sql`, `gap_range.sql` and `gap_instrument.sql`.

**Checkpoint**: All acceptance criteria satisfied. Every validation command exits 0. The wheel carries the SQL files.

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E6-S1 | hard | T016/T017 modify `src/factorflow/coverage/service.py` (the pinned dataclasses, `read_coverage`, `coverage.sql`) created by S1. Existing edge. |
| CAP-001-E4-S1 | hard | `gaps.sql` and `gap_range.sql` read `daily_bar` (migration 0002). Existing edge. |
| CAP-001-E5-S1 | hard | `gaps.sql`, `gap_range.sql` and `gap_instrument.sql` read `coverage_segment`, created by `migrations/0003_coverage.sql` (added in commit c9580e3, "CAP-001-E5-S1: story-coding — coverage and run schema"). **New edge added to `dependencies.yaml`.** It is already implied transitively through CAP-001-E6-S1; recorded directly because this story's own statements read the table. |
| CAP-001-E2-S1 | hard | `read_gap_dates` imports `InstrumentNotFound` from `src/factorflow/instruments/service.py` and `normalise` from `src/factorflow/instruments/symbols.py`, both created by CAP-001-E2-S1 (commit 3b6ccea). **New edge added to `dependencies.yaml`.** |
| CAP-001-E6-S3 | reverse | S3's `GET /api/coverage` consumes the gap fields and `read_gap_dates` this story delivers. S3 already lists CAP-001-E6-S2 as a hard edge. |

### Task Dependencies

- T001: No dependencies
- T002: No dependencies. T003–T009 and T011 depend on T002 and run in sequence, because they share one file.
- T010: No dependencies (separate file)
- T012, T013, T014: Depend on T001 for packaging only; parallel with each other
- T015: Depends on T012, T013
- T016: Depends on T015
- T017: Depends on T014, T015, T016 (same file as T016)
- T018: Depends on T015, T017
- T019: Depends on all previous tasks

### Parallel Opportunities

- Phase 2: T010 runs in parallel with the T002→T011 chain
- Phase 3: T012, T013, T014 in parallel
- Phase 5: T018 in parallel with the formatting part of T019

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

- AC-8 / DAC-E6-2 / DAC-E6-S2-1: `uv run pytest -m postgres tests/integration/test_coverage_gaps.py -k "008 or 028 or 048"`. Exactly one gap for the instrument missing a shared session. The union is proven by dates contributed by different instruments.
- DAC-E6-3 / DAC-E6-S2-2: `-k "029 or 049"`. Dates outside an instrument's own covered range, including before its first acquisition, are never gaps.
- DAC-E6-4 / DAC-E6-S2-3: `-k "030 or 050"`. Unavailable carries the reason and `missing_days is None`. `read_gap_dates` returns `None`. The raw statement returns zero rows when the predicate is false.
- DAC-E6-5 / DAC-E6-S2-4: `-k "031 or 051"`. Fundamentals and corporate-action ranges produce no gaps. A prices-less instrument reports `None`, not 0.
- DAC-E6-6 / DAC-E6-S2-5: `-k "032 or 052"`. A day missing for every instrument is reported for nobody.
- DAC-E6-S2-6: `-k 053`. The count equals the number of dates, and dates only come through `read_gap_dates`.
- Drift guard: `uv run pytest tests/unit/test_coverage_gaps_sql_matches_design.py`.
- Packaging: `uv build && unzip -l dist/factorflow-*.whl | grep coverage/sql/`.

---

## Notes

### Resolved Conflicts

1. **Who delivers `gaps.py`, `gaps.sql` and the gap tests.** The draft
   CAP-001-E6-S1 task plan puts them in S1: T006–T008, T012, T013, T014, T017,
   T018 steps 5–6 and `read_gap_dates`. Both approved stories give them to this story:
   - CAP-001-E6-S2 Description: "Delivers `src/factorflow/coverage/gaps.py` and
     `src/factorflow/coverage/sql/gaps.sql`".
   - CAP-001-E6-S1 Description: "Delivers `src/factorflow/coverage/service.py` and
     the coverage half of `src/factorflow/coverage/sql/`".

   The stories, as approved acceptance-bearing artifacts, govern a draft task plan.
   This plan owns gap derivation. The S1 plan should be trimmed to match; that is a
   coordinator action. Phase 3 has a reconcile-not-duplicate instruction in case S1's
   implementation lands those files first.
2. **Default range: OQ 2 (section 14) vs section 2.3 body.** OQ 2 is not struck
   through. Its text says "computes gaps over the union of all covered ranges when no
   range is supplied". Section 2.3's body records the owner decision of 2026-09-05:
   "substitutes the instrument's own coverage bounds". Normative body prose that
   carries a dated owner decision governs an unstruck OQ entry. The two agree on gap
   output: `gaps.sql` already joins each trading day to the instrument's *own*
   `covered_from..covered_to`, so resolving omitted bounds to the union of prices
   ranges (T013) returns exactly the per-instrument-bounds dates for every
   instrument. The one observable difference is the availability predicate, which is
   evaluated over the union. See PROVISIONAL item 2.

### Open Gaps

1. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): meaning of `CoverageView.gap_detection.missing_days`.**
   - Undefined: design 2.4 types it `int | None` and calls the view-level object "the
     whole-view availability", but never says what the count covers.
   - Adopted: when available, the total missing days across **all** instruments the
     statement returns for the resolved range, not only the current page. `None`
     when unavailable.
   - Derivation: section 5 says the trading-day set "is a property of the whole list
     and is computed once per request". A page-only sum would change with the cursor.
     The S3 response example exposes only `available` / `reason` at view level, so
     the value has no consumer yet.
   - Absorb in: the next revision of component-design-coverage-service.md section 2.4.
2. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): per-instrument availability.**
   - Undefined: `InstrumentCoverage.gaps` is a full `GapDetection`, but only one
     availability predicate is defined: ≥ 2 instruments with bars "in the range"
     (design 2.3, system design step 43).
   - Adopted: every instrument inherits the whole-view predicate evaluated over the
     resolved request range.
   - Derivation: the normative statement evaluates exactly one predicate per
     execution.
   - Known limit: if instruments' prices ranges do not overlap at all, one
     instrument's dates may be checked only against its own bars. Each such
     instrument then reports 0 while the view is available. Only a per-instrument
     predicate would remove this, which is a design change.
   - Absorb in: section 2.3/2.4.
3. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): instruments with no prices coverage.**
   - Undefined: the `missing_days` value for an instrument with no `prices` segment.
   - Adopted: `missing_days = None` with `available` following the view.
     `read_gap_dates` returns `None`.
   - Derivation: DAC-E6-S2-4 says no gaps are "computed" for non-price data. STD-UI-4
     reserves zero for a measured zero.
   - Absorb in: section 2.4.
4. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): `read_gap_dates` identity and return shape.**
   - Undefined: design section 11 says only "Instrument, date range → the specific
     missing dates".
   - Adopted:
     - Keyed by `symbol`, normalised.
     - Returns `list[date] | None`: `None` = not computed (unavailable, or no prices
       coverage), `[]` = computed and none missing.
     - An unknown symbol raises `InstrumentNotFound`.
   - Derivation:
     - The public `InstrumentCoverage` exposes only `symbol`, and symbols are unique
       (`idx_instrument_symbol`).
     - DAC-E6-4 forbids an empty list standing in for unavailability.
     - `InstrumentNotFound` is the existing precedent in `retire_symbol`.
     - This departs from the S1 draft plan's `instrument_id: int`.
   - Absorb in: section 11 and the S3 expansion contract.
5. **Genuine gap, not blocking: no latency target (OQ 3).** No performance AC applies
   to this story. The 3000-instrument volume test belongs to S1 (TC-COMP-036) and
   will now exercise `gaps.sql`. If it is too slow, the remedy is an additive instrument
   filter on the `covered` CTE. T010 pins section 2.3, so that needs a design revision.

### Other Notes

- **Page scoping.** Section 5 says a page "computes gaps for the instruments on that
  page only". This plan runs the unmodified normative statement once per request and
  keeps page rows' counts from the result map. The observable response is identical.
  Only the work done differs, and no latency target exists (Open Gap 5).
- **Retired instruments** contribute to the trading-day set and receive gaps inside
  their retained covered range. The normative statement has no lifecycle filter,
  and AC-21 keeps retired coverage visible. Do not add one.
- **`daily_bar` is append-only.** Its natural key includes `value_hash`, so
  restatements create several rows per `(instrument_id, session_date)`. Neither the
  `DISTINCT` trading-day CTE nor the `LEFT JOIN … IS NULL` anti-join is affected.
- **Dates between two non-contiguous segments** of one instrument are outside its
  covered range and are therefore not gaps. That is what the statement computes; no
  extra test is planned.
- **For the coordinator: S1 draft plan issues found while reading it.**
  - (a) Its T018 step 1 sets `reason=None` on the never-acquired branch. Its T013
    asserts that an unavailable `GapDetection` always carries
    `"fewer_than_two_instruments_with_data"`. The two contradict. T011 here therefore
    avoids asserting the reason on the empty store.
  - (b) It adds `.sql` files without the `pyproject.toml` package-data entry (T001
    here).
  - (c) TC-COMP-038 (DAC-E6-12, an S1 AC) sits in `test_coverage_gaps.py` per design
    section 7. Its gap-count half can only pass once this story's `gaps.py` exists, so
    S1 should assert only the covered-range half, or defer that assertion until this
    story lands.
- Validation commands are defined in the tech stack and listed above. No component
  constitution exists under the repo's `docs/constitution/` beyond the project-wide
  files, and `ui-conventions.md` (STD-UI-4, STD-UI-14, STD-UI-18) informs the
  None-vs-zero choices.
