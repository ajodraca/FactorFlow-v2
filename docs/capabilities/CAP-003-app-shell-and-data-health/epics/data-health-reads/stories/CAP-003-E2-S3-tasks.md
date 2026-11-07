---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T05:53:26Z
  source_artifacts:
    - id: CAP-003-E2-S3
      version: "1"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-001-component-design-coverage-service
      version: "6"
    - id: CAP-003-data-health-reader-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E2-S3 — read_data_health: the Daily Prices and Company Financials Checks over coverage-service Pages

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-06

## Summary

Adds `read_data_health(conn) -> DataHealth` to the `data-health-reader` package
CAP-003-E2-S1 creates (component-design-data-health-reader.md, "RD" below,
sections 2.2, 2.5, 3, 5). It calls `coverage-service`'s delivered
`read_coverage(conn, lifecycle="active", cursor=..., limit=MAX_LIMIT)`
unchanged, page by page to a null cursor, and folds each page into running
counts that keep at most five exception symbols per check. When the first page
reports `never_acquired`, both checks are `None` (AC-21). Otherwise it builds
the Daily prices check (`absent_count` for presence `absent` or `unknown`,
`behind_count` for `covered_to` earlier than `latest_session`, `gap_stock_count`
for `missing_days` above zero and `None` when gap detection is unavailable, the
union's first five symbols and its size, and the status of the RD 2.5
flowchart) and the Company financials check (`absent_count`, `problem_count`
from fundamentals `acquisition_state.last_outcome` `failed` or `not_found`,
`as_of` the latest fundamentals `last_acquired_at` with `last_outcome`
`written`, the union and its size), per DEC-0213 and DEC-0220. `affected_count`
is `PROBLEM_COUNT_SQL`'s `stock_count`, the same statement behind
`Problems.stock_count`, and `problems` is `read_problems(conn, cursor=None,
limit=50)`. Two read-only statements are added to `queries.py`: one for
`checked_at`, `followed_count` and `latest_session`, one for the fundamentals
state of a page's stocks. Nothing is written, no schema changes and no
delivered file is edited (DEC-0211).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-11 | `GET /api/data-health` carries the verdict counts and the two checks with the time each is current to | T002, T003, T005, T006, T007, T009, T010, T011, T012 |
| AC-12 | A check built on a partial or interrupted download carries its exceptions rather than reading as clean | T007, T011 |
| AC-21 | Before anything was acquired, both checks are null, never zero counts | T005, T011 |
| AC-24 | A null part stays null, never `0` | T002, T003, T008, T011 |
| DAC-E2-4 | Daily prices status `exceptions`, `not_determinable` or `ok` per the flowchart; `gap_stock_count` null, never 0, when gap detection is unavailable, reason carried | T002, T007, T008, T011 |
| DAC-E2-5 | Count rules and exception unions per DEC-0213 and DEC-0220 | T003, T006, T007, T009, T010, T011 |
| DAC-E2-15 | `read_data_health` calls `read_coverage` unchanged, page by page, and does not catch its `ValueError` | T004, T011 |
| DAC-E2-S3-1 | Unknown presence counts as absent, not behind; absent-and-failed counts in both counts and once in the union; gaps-and-behind counts once | T003, T007, T011 |
| DAC-E2-S3-2 | Empty store: `never_acquired`, both checks `None`, `affected_count` 0; a download that ended with every request failed: `never_acquired` with `affected_count` and rows populated | T005, T011 |
| DAC-E2-S3-3 | A retired stock with a failure is in no count and no row; 3000 active stocks: six pages, at most five symbols kept per check | T006, T009, T011 |

## Phase 1: Setup

**Purpose**: Confirm the delivered and upstream prerequisites before any file is written.

- [ ] T001 Confirm, without editing anything, and STOP and report if one does not hold: (a) CAP-003-E2-S1 has landed `src/factorflow/data_health/{__init__,models,queries,reader}.py` with `DataHealth`, `DailyPricesCheck`, `CompanyFinancialsCheck`, `GapDetectionState` and `ProblemPage` in `models.py` exactly as RD 2.2 lists them, `PROBLEM_COUNT_SQL` in `queries.py` (no parameters, one row, first column `stock_count`), and `read_problems(conn, *, cursor, limit)` in `reader.py`; and `tests/unit/test_data_health_sql_is_read_only.py` (S1's T002, T003), which scans the whole text of `queries.py` and `reader.py` and checks every `*_SQL` constant. (b) The delivered `src/factorflow/coverage/service.py` exports `read_coverage`, `CoverageView`, `InstrumentCoverage`, `GapDetection`, `Presence`, `MAX_LIMIT == 500` and `UNAVAILABLE_REASON == "fewer_than_two_instruments_with_data"`, with the signature `read_coverage(conn, *, symbol=None, lifecycle=None, from_date=None, to_date=None, cursor=None, limit=50)`. (c) `tests/conftest.py` provides `migrated_writer_connection` (migrations 0001 to 0004, one database per test). Add no fixture to `tests/conftest.py`.

**Checkpoint**: Prerequisites confirmed; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the two checks, the paging contract with `coverage-service` and the never-acquired and retired cases.

**Unit tests** (`tests/unit/test_data_health_checks.py`, no `postgres` marker) drive the private fold in `reader.py` (T013) with hand-built `coverage-service` values, never a database, and compare against complete literal dataclasses. Importing a private name from a test is the local precedent of `tests/unit/test_api_reclaim_lifespan.py`. Module-private helpers in the test file:

- Dates `D2, D3, D4, D5 = date(2024, 1, 2) ... date(2024, 1, 5)`; times `T1 = datetime(2026, 10, 20, 21, 0, tzinfo=UTC)`, `T2 = T1 + timedelta(hours=1)`, `T3 = T1 + timedelta(hours=2)`.
- `REASON = "fewer_than_two_instruments_with_data"`, written as this literal rather than imported, so the expected value is independent of the code under test.
- `_stock(symbol, *, prices=Presence.PRESENT, fundamentals=Presence.PRESENT, covered_to=D5, missing_days=0, gaps_available=True) -> InstrumentCoverage`: `presence` holds all four data types (`reference` and `corporate_actions` `PRESENT`); `covered_from = D2` when `covered_to` is set, else `None`; `last_acquired_at` and `depth_shortfall_years` `None`; `gaps = GapDetection(gaps_available, None if gaps_available else REASON, missing_days if gaps_available else None)`. A stock whose prices are not `PRESENT` passes `covered_to=None, missing_days=None`, as `coverage-service` reports it.
- `_view(stocks, *, available=True, next_cursor=None) -> CoverageView`: `never_acquired=False`, `gap_detection = GapDetection(available, None if available else REASON, 0 if available else None)`.

**Integration tests** (`tests/integration/test_data_health_checks.py`, `pytestmark = pytest.mark.postgres`; the 3000-stock test also `@pytest.mark.slow`, the precedent of `tests/integration/test_coverage_volume.py`) use `migrated_writer_connection` and module-private seed helpers written with bound parameters only (precedents: `tests/integration/test_coverage_gaps.py` and the CAP-003-E2-S1 plan's `_record`):

- `_instrument(conn, symbol, lifecycle="active") -> int` (with `retired_at` set exactly when retired); `_roster(conn, n, prefix="S") -> None`, one `INSERT ... SELECT %s || lpad(n::text, 4, '0') ... FROM generate_series(1, %s)` of active instruments `S0001`, `S0002`, ...; `_bars(conn, instrument_id, dates)` and `_segment(conn, instrument_id, data_type, covered_from, covered_to)` as in `test_coverage_gaps.py`; `_run(conn, *, state, requested_at, ended_at) -> UUID` (`history_depth_years = 1`, honouring `acquisition_run_terminal_has_end`); `_record(conn, run_id, instrument_id, data_type, outcome, *, reason=None, attempts=1, completed_at)`, inserting the `run_instrument_result` row and upserting `acquisition_state` with the same `run_id` and `last_acquired_at = completed_at`, the pairing the delivered writer keeps.
- Every seed ends with `conn.commit()` before the reader is called; times are the fixed literals above, never `now()`.
- `_coverage_spy(monkeypatch) -> list[tuple[tuple[object, ...], dict[str, object]]]`: replaces `factorflow.data_health.reader.read_coverage` with a wrapper that records `(args, kwargs)`, raises `AssertionError("read_coverage called more than 10 times")` on an eleventh call (so a cursor mutant that never advances fails instead of hanging), and otherwise returns the delivered `factorflow.coverage.service.read_coverage(*args, **kwargs)`.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-035 (Daily prices status: exceptions, not_determinable, ok; gap count null) in `tests/unit/test_data_health_checks.py` (`# Implements TC-COMP-035`). Parametrised: each case folds one `_view(...)` page into `_ChecksFold(latest_session=D5)` with an empty fundamentals mapping and asserts `fold.daily_prices()` equals the complete literal `DailyPricesCheck(status, absent_count, gap_stock_count, behind_count, latest_session, gap_detection, exception_count, exception_symbols)`:
  (a) absent only, `[_stock("AAA"), _stock("BBB", prices=Presence.ABSENT, covered_to=None, missing_days=None)]` → `("exceptions", 1, 0, 0, D5, GapDetectionState(True, None), 1, ("BBB",))`;
  (b) behind only, `[_stock("AAA"), _stock("CCC", covered_to=D4)]` → `("exceptions", 0, 0, 1, D5, GapDetectionState(True, None), 1, ("CCC",))`;
  (c) gaps only, `[_stock("AAA", missing_days=2), _stock("BBB")]` → `("exceptions", 0, 1, 0, D5, GapDetectionState(True, None), 1, ("AAA",))`;
  (d) clean, gap detection unavailable, `_view([_stock("AAA", gaps_available=False)], available=False)` → `("not_determinable", 0, None, 0, D5, GapDetectionState(False, REASON), 0, ())`;
  (e) clean and available, `[_stock("AAA"), _stock("BBB")]` → `("ok", 0, 0, 0, D5, GapDetectionState(True, None), 0, ())`;
  (f) edge: unavailable and absent, `_view([_stock("AAA", gaps_available=False), _stock("BBB", prices=Presence.ABSENT, covered_to=None, missing_days=None, gaps_available=False)], available=False)` → `("exceptions", 1, None, 0, D5, GapDetectionState(False, REASON), 1, ("BBB",))`
  (Implements TC-COMP-035; DAC-E2-4; AC-11, AC-24) — kills: off-by-one on the status total `> 0` → `>= 0` (case e reads `exceptions`), negate-boolean on the availability test (cases d and e swap `not_determinable` and `ok`), swap-case `"not_determinable"` ↔ `"ok"` (case d), hand-written `gap_stock_count = None` → `0` when unavailable (cases d and f read `0`), hand-written removal of the gap term from the status total (case c reads `ok`). The observation is the full literal dataclass.
- [ ] T003 [P] Implement TC-COMP-047 (check counting rules: unknown presence, overlaps and union counts) in `tests/unit/test_data_health_checks.py` (`# Implements TC-COMP-047`), one test per rule, each asserting complete literal check dataclasses:
  (a) unknown presence: `_view([_stock("AAA"), _stock("UNK", prices=Presence.UNKNOWN, fundamentals=Presence.UNKNOWN, covered_to=None, missing_days=None)])` with `latest_session=D5` → `daily_prices()` has `absent_count == 1`, `behind_count == 0`, `exception_symbols == ("UNK",)`; `company_financials()` has `absent_count == 1`;
  (b) absent and failed for fundamentals: `_view([_stock("FLD", fundamentals=Presence.ABSENT)])` with fundamentals mapping `{"FLD": ("failed", T1)}` → `company_financials() == CompanyFinancialsCheck("exceptions", 1, 1, None, 1, ("FLD",))`;
  (c) `not_found` is a problem and `written` is not: mapping `{"AAA": ("written", T1), "NFD": ("not_found", T2)}` over `[_stock("AAA"), _stock("NFD")]` → `CompanyFinancialsCheck("exceptions", 0, 1, T1, 1, ("NFD",))`;
  (d) gaps and behind: `[_stock("AAA"), _stock("GBH", covered_to=D4, missing_days=1)]` → `DailyPricesCheck("exceptions", 0, 1, 1, D5, GapDetectionState(True, None), 1, ("GBH",))`;
  (e) edge, more than five across a page boundary: page 1 `AAA, BBB, CCC, DDD` and page 2 `EEE, FFF, GGG`, every stock prices and fundamentals `UNKNOWN` (`covered_to=None, missing_days=None`) → both checks have `exception_symbols == ("AAA", "BBB", "CCC", "DDD", "EEE")` and `exception_count == 7`
  (Implements TC-COMP-047; DAC-E2-S3-1, DAC-E2-5; AC-11) — kills: hand-written `in (Presence.ABSENT, Presence.UNKNOWN)` → `== Presence.ABSENT` (a reads 0 absent), hand-written behind test `covered_to is not None and covered_to < latest_session` → `covered_to is None or covered_to < latest_session` (a counts `UNK` behind), hand-written `("failed", "not_found")` → `("failed",)` (c reads 0 problems), hand-written union counting per group instead of per stock (b and d read `exception_count == 2`), hand-written `_Union` reset per page (e reads `("EEE", "FFF", "GGG")`).
- [ ] T004 Implement TC-COMP-038 (read_data_health pages read_coverage unchanged to a null cursor) in `tests/integration/test_data_health_checks.py` (`# Implements TC-COMP-038`). Seed `_roster(conn, 1200)` and give `S0001` bars `[D2, D3]` and a `prices` segment `D2..D3`, so `never_acquired` is false. With `_coverage_spy`, call `read_data_health(conn)` and assert the recorded calls equal, literally, three entries whose `args == (conn,)` (identity of the connection) and whose `kwargs` are `{"lifecycle": "active", "cursor": None, "limit": 500}`, `{"lifecycle": "active", "cursor": "S0500", "limit": 500}`, `{"lifecycle": "active", "cursor": "S1000", "limit": 500}`. Edge, one page: on a store of three instruments the spy records one call with `cursor None`. `ValueError`: in a second test, replace `factorflow.data_health.reader.read_coverage` with a function that raises a prepared `err = ValueError("limit must be between 1 and 500, got 0")`; `with pytest.raises(ValueError) as excinfo: read_data_health(conn)` and `assert excinfo.value is err` (Implements TC-COMP-038; DAC-E2-15; AC-11) — kills: drop-defaulted-argument on `cursor=None` in the first call (the first `kwargs` lacks `cursor`), hand-written `limit=MAX_LIMIT` → `limit=50` (kwargs differ and 24 calls exceed the spy cap), hand-written `cursor=view.next_cursor` → `cursor=None` (the spy cap fails it), a hand-written `try: ... except ValueError:` around the call (no exception, or a different one, reaches the test).
- [ ] T005 Implement TC-COMP-048 (never_acquired with and without an ended download) in `tests/integration/test_data_health_checks.py` (`# Implements TC-COMP-048`). (a) Empty migrated store: `read_data_health(conn)` returns `never_acquired is True`, `daily_prices is None`, `company_financials is None`, `followed_count == 0`, `affected_count == 0`, `problems == ProblemPage(rows=(), next_cursor=None)`. (b) A download ended and every request failed: `_roster(conn, 60, prefix="P")` (`P0001` to `P0060`), one run `_run(state="failed", ...)`, and for every instrument and each of the four data types a `failed` result with reason `"provider timeout"` (240 paired rows, seeded with one `INSERT ... SELECT` per table or `_record` in a loop); no observation row anywhere. Assert `never_acquired is True`, both checks `None`, `followed_count == 60`, `affected_count == 60`, `len(problems.rows) == 50`, `problems.rows[0].symbol == "P0001"`, `problems.rows[-1].symbol == "P0050"`, `problems.next_cursor == "P0050"`, and every row has four failures and `retryable is True`. Edge from the TC: no check is `ok` on either store, which the two `None` checks prove (Implements TC-COMP-048; DAC-E2-S3-2; AC-21; review v1 FINDING-10) — kills: hand-written `affected_count = len(problems.rows)` (reads 50, not 60), off-by-one on the first-page size `50` → `51` (51 rows; cursor `P0051`), negate-boolean on the never-acquired branch (checks built with zero counts instead of `None`), hand-written early `return` with `affected_count=0` in the never-acquired branch (case b reads 0).
- [ ] T006 Implement TC-COMP-049 (retired stocks excluded; six coverage pages and bounded memory at 3000) in `tests/integration/test_data_health_checks.py` (`# Implements TC-COMP-049`; `@pytest.mark.slow`). Seed `_roster(conn, 3000)`; `S0001` bars `[D2, D3, D4, D5]` and prices segment `D2..D5`; `S0002` bars `[D2, D3, D4]` and prices segment `D2..D4`; run R1 (`partial`) records `fundamentals` `failed` for `S0003` at `T1`; a retired `R0001` (`_instrument(conn, "R0001", "retired")`) with R1 recording `prices` and `fundamentals` `failed` and a `prices` segment `D2..2024-01-08` (no bars). With `_coverage_spy`, assert: six recorded calls with `cursor` `None`, `"S0500"`, `"S1000"`, `"S1500"`, `"S2000"`, `"S2500"`, each `lifecycle="active"` and `limit=500`; `followed_count == 3000`; `daily_prices == DailyPricesCheck("exceptions", 2998, 0, 1, D5, GapDetectionState(True, None), 2999, ("S0002", "S0003", "S0004", "S0005", "S0006"))`; `company_financials == CompanyFinancialsCheck("exceptions", 3000, 1, None, 3000, ("S0001", "S0002", "S0003", "S0004", "S0005"))`; `affected_count == 1`; `[r.symbol for r in problems.rows] == ["S0003"]` and `problems.next_cursor is None`; `"R0001"` appears in no `exception_symbols` and no row. "At most five symbols kept per check" is observed structurally by T009 (the fold's own list never exceeds five); here the returned tuples have exactly five entries while each count is in the thousands (Implements TC-COMP-049; DAC-E2-S3-3, DAC-E2-1; AC-13, AC-16, AC-28) — kills: hand-written `WHERE i.lifecycle = 'active'` → `WHERE true` in `DATA_HEALTH_HEAD_SQL`'s `latest_session` (the retired segment ends `2024-01-08`, so `latest_session` and `behind_count` change), the same mutant in its `followed_count` (reads 3001), hand-written `lifecycle="active"` → `lifecycle=None` (the spy kwargs differ and `R0001` joins a union).

### Additional Unit Tests

- [ ] T007 A real store with every group and a partial download (AC-11, AC-12, DAC-E2-5, DAC-E2-S3-1) in `tests/integration/test_data_health_checks.py`. Seed active `AAA`, `BBB`, `CCC`, `DDD`, `EEE` and retired `RET`; run R1 with `state="partial"`:
  - `AAA`: bars `D2..D5`, prices segment `D2..D5`, fundamentals segment `2023-10-01..2024-03-31`; R1 records `prices` and `fundamentals` `written` at `T1`.
  - `BBB`: bars `D2, D3, D5`, prices segment `D2..D5` (a gap on `D4`); R1 records `prices` `written` at `T1` and `fundamentals` `failed` at `T3` with reason `"provider timeout"`; no fundamentals segment.
  - `CCC`: bars `D2, D3`, prices segment `D2..D3` (behind); fundamentals segment as `AAA`; R1 records `prices` `written` at `T1` and `fundamentals` `written` at `T2`.
  - `DDD`: nothing (every presence `unknown`).
  - `EEE`: bars `D2..D5`, prices segment `D2..D5`; R1 records `prices` `written` at `T1` and `fundamentals` `not_found` at `T1`; no fundamentals segment.
  - `RET` (retired): a prices segment `D2..2024-01-08`, no bars; R1 records `fundamentals` `failed` at `T3`.
  Assert: `never_acquired is False`; `followed_count == 5`; `daily_prices == DailyPricesCheck("exceptions", 1, 1, 1, D5, GapDetectionState(True, None), 3, ("BBB", "CCC", "DDD"))`; `company_financials == CompanyFinancialsCheck("exceptions", 3, 2, T2, 3, ("BBB", "DDD", "EEE"))`; `affected_count == 2`; `[r.symbol for r in problems.rows] == ["BBB", "EEE"]`; `problems.next_cursor is None`; `checked_at` is aware and equals `SELECT now()` run on the same connection right after the call (same transaction); and `conn.info.transaction_status == psycopg.pq.TransactionStatus.INTRANS` after the call (RD 3: the caller owns the transaction) — kills: hand-written `cs.data_type = 'prices'` → `'fundamentals'` in `DATA_HEALTH_HEAD_SQL` (`latest_session` becomes `2024-03-31` and `behind_count` 4), hand-written `s.data_type = 'fundamentals'` → `'prices'` in `FUNDAMENTALS_STATE_SQL` (`problem_count` 0 and `as_of` `T1`), negate-boolean on `last_outcome == "written"` in the `as_of` fold (`as_of` `T3`), hand-written `checked_at` from `datetime.now(UTC)` (differs from the transaction's `now()`), a hand-written `conn.commit()` at the end of `read_data_health` (status `IDLE`).
- [ ] T008 Not determinable on a real store (DAC-E2-4, AC-24) in `tests/integration/test_data_health_checks.py`. Seed one active `SOLO` with bars `D2..D5`, prices segment `D2..D5`, a fundamentals segment `2023-10-01..2024-03-31`, and R1 (`succeeded`) recording `prices` and `fundamentals` `written` at `T1`. Assert `daily_prices == DailyPricesCheck("not_determinable", 0, None, 0, D5, GapDetectionState(False, "fewer_than_two_instruments_with_data"), 0, ())` and `company_financials == CompanyFinancialsCheck("ok", 0, 0, T1, 0, ())` — kills: hand-written `gap_stock_count = None` → `0` when unavailable, and taking `gap_detection` from a fresh `GapDetection(True, None)` instead of the view (reason lost).
- [ ] T009 [P] The union keeps at most five symbols (DAC-E2-S3-3, DAC-E2-5) in `tests/unit/test_data_health_checks.py`. Add `S0001` to `S3000` in order to one `_Union()`, asserting `len(union.symbols) <= 5` after every `add`; finally `union.count == 3000` and `union.symbols == ["S0001", "S0002", "S0003", "S0004", "S0005"]` — kills: off-by-one on the guard `< 5` → `<= 5` (six kept), hand-written removal of the guard with truncation moved to the output (the in-loop length exceeds five), negate-boolean on the guard (nothing kept).
- [ ] T010 [P] Financials `as_of`, gap availability across pages and a null `latest_session` (DAC-E2-5, DAC-E2-4) in `tests/unit/test_data_health_checks.py`. (a) `as_of` across pages: page 1 `[_stock("AAA"), _stock("BBB")]` with mapping `{"AAA": ("written", T2), "BBB": ("failed", T3)}`, page 2 `[_stock("CCC")]` with `{"CCC": ("written", T1)}` → `company_financials().as_of == T2` and `problem_count == 1`. (b) Availability is the conjunction over pages: page 1 `_view([_stock("AAA")])` available, page 2 `_view([_stock("BBB", gaps_available=False)], available=False)` → `daily_prices()` has `gap_stock_count is None` and `gap_detection == GapDetectionState(False, REASON)`, status `not_determinable`. (c) No prices anywhere: `_ChecksFold(latest_session=None)` over `_view([_stock("AAA", prices=Presence.UNKNOWN, covered_to=None, missing_days=None, gaps_available=False)], available=False)` → `DailyPricesCheck("exceptions", 1, None, 0, None, GapDetectionState(False, REASON), 1, ("AAA",))`, with no `TypeError` from comparing `None` — kills: the last page overwriting `as_of` instead of taking the maximum (reads `T1`), `min` for `max` (reads `T1`), dropping the `written` filter (reads `T3`), taking availability from the first page only (b reads `ok` with `gap_stock_count == 0`).

**Checkpoint**: All tests written; they fail on `ImportError` for `read_data_health`, `_ChecksFold` and `_Union` (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: Add the two statements, the fold and `read_data_health`.

- [ ] T011 Add to `src/factorflow/data_health/queries.py` two module-level `Final[str]` constants, each a single read whose first keyword is `SELECT`, with no `{`, no `;` and no `%` other than a bound `%(name)s`, so S1's checks (its T003) pass on them:
  - `DATA_HEALTH_HEAD_SQL`, no parameters, one row: `SELECT now() AS checked_at, (SELECT count(*) FROM instrument i WHERE i.lifecycle = 'active') AS followed_count, (SELECT max(cs.covered_to) FROM coverage_segment cs JOIN instrument i ON i.instrument_id = cs.instrument_id WHERE i.lifecycle = 'active' AND cs.data_type = 'prices') AS latest_session`. `latest_session` is the same value as the maximum `covered_to` over the coverage pages, because `coverage.sql` reports each instrument's prices `covered_to` as `MAX(covered_to)` over its prices segments with no date bound (Open Gaps 2).
  - `FUNDAMENTALS_STATE_SQL`, one parameter: `SELECT i.symbol, s.last_outcome, s.last_acquired_at FROM instrument i JOIN acquisition_state s ON s.instrument_id = i.instrument_id WHERE s.data_type = 'fundamentals' AND i.symbol = ANY(%(symbols)s)`. The symbols are one coverage page's active stocks, so the page fixes the population (Open Gaps 1).
  Extend the module docstring to cite RD 2.5 and DEC-0213 for the two constants. None of the six words insert, update, delete, truncate, alter or drop may appear anywhere in the file, in any case (S1's whole-text scan). (traces to DAC-E2-5, AC-11; depends on T001)
- [ ] T012 Extend `src/factorflow/data_health/reader.py` (depends on T011):
  - Imports: `from factorflow.coverage.service import MAX_LIMIT, CoverageView, Presence, read_coverage` (imported by name, so T004's and T006's spy on `factorflow.data_health.reader.read_coverage` sees every call); the models `DataHealth`, `DailyPricesCheck`, `CompanyFinancialsCheck`, `GapDetectionState`; `DATA_HEALTH_HEAD_SQL`, `FUNDAMENTALS_STATE_SQL`, `PROBLEM_COUNT_SQL`.
  - Constants: `_EXCEPTION_SYMBOLS_KEPT: Final = 5` (RD 2.2, "first five by symbol") and `_FIRST_PAGE_LIMIT: Final = 50` (RD 2.2 and system design §4.2, "first page of 50"; Other Notes on why it is not imported from `api/bounds.py`).
  - `@dataclass class _Union` with `count: int = 0` and `symbols: list[str] = field(default_factory=list)`, and `add(symbol)`: `count += 1`, and append only while `len(symbols) < _EXCEPTION_SYMBOLS_KEPT`. Called once per stock that is in any group of the check. Pages arrive in ascending symbol order, so the kept symbols are the first five by symbol.
  - `@dataclass class _ChecksFold` with `latest_session: date | None` and running fields: prices absent, behind and gap counts; `gaps_available: bool = True` and `gaps_reason: str | None = None`; a prices `_Union`; financials absent and problem counts; `as_of: datetime | None = None`; a financials `_Union`.
  - `add_page(view: CoverageView, fundamentals: Mapping[str, tuple[str, datetime]]) -> None`:
    - Gap availability: when `view.gap_detection.available` is false, set `gaps_available = False` and keep the first such `reason`.
    - Per instrument, prices:
      - absent: `presence["prices"] in (Presence.ABSENT, Presence.UNKNOWN)`;
      - behind: `covered_to is not None and latest_session is not None and covered_to < latest_session`;
      - gap: `gaps.missing_days is not None and gaps.missing_days > 0`.
      - Each true group adds 1 to its count. The stock is added once to the prices union when any group holds.
    - Per instrument, financials:
      - absent: `presence["fundamentals"] in (Presence.ABSENT, Presence.UNKNOWN)`;
      - problem: the mapped `last_outcome in ("failed", "not_found")`;
      - the stock is added once to the financials union when either holds;
      - `as_of = max(as_of, last_acquired_at)` when the mapped `last_outcome == "written"`.
  - `daily_prices() -> DailyPricesCheck`:
    - `gap_stock_count` is the gap count when every page was available, else `None` (DEC-0213 c).
    - `status` is `"exceptions"` when `absent + behind + (gap_stock_count or 0) > 0`, otherwise `"not_determinable"` when unavailable, otherwise `"ok"` (RD 2.5 flowchart; DEC-0213 d).
    - `gap_detection = GapDetectionState(gaps_available, gaps_reason)`, then the remaining counts, `latest_session`, `exception_count = union.count` and `exception_symbols = tuple(union.symbols)`.
  - `company_financials() -> CompanyFinancialsCheck`: `status` is `"exceptions"` when either count is above zero, else `"ok"`; then the counts, `as_of`, `exception_count` and `exception_symbols` (DEC-0213 e; DEC-0220).
  - Use `|=`, `+=` or assignment, never a `.update(` call or the word in a comment (S1's whole-text scan).
  - `_fundamentals_state(conn, symbols: list[str]) -> dict[str, tuple[str, datetime]]` executes `FUNDAMENTALS_STATE_SQL` with `{"symbols": symbols}` and maps symbol to `(last_outcome, last_acquired_at)`. It is not called for a page with no instruments.
  - `read_data_health(conn: psycopg.Connection) -> DataHealth`:
    - (1) Execute `DATA_HEALTH_HEAD_SQL` for `checked_at`, `followed_count` and `latest_session`.
    - (2) `view = read_coverage(conn, lifecycle="active", cursor=None, limit=MAX_LIMIT)`. `never_acquired = view.never_acquired`, taken from the first page (RD 2.5 step 2).
    - (3) When not never-acquired, loop. Each page calls `fold.add_page(view, _fundamentals_state(conn, [i.symbol for i in view.instruments]))`. Stop when `view.next_cursor is None`, else `view = read_coverage(conn, lifecycle="active", cursor=view.next_cursor, limit=MAX_LIMIT)`.
    - Do not catch `ValueError` or any other exception (DAC-E2-15; RD AC 8).
    - (4) Execute `PROBLEM_COUNT_SQL` and take its `stock_count` as `affected_count`, the statement behind `Problems.stock_count` (DEC-0201; register C10).
    - (5) `problems = read_problems(conn, cursor=None, limit=_FIRST_PAGE_LIMIT)`.
    - (6) Return `DataHealth(checked_at, never_acquired, followed_count, affected_count, daily_prices=None if never_acquired else fold.daily_prices(), company_financials=None if never_acquired else fold.company_financials(), problems=problems)`.
    - No `commit`, `rollback` or `conn.transaction()`; the caller owns the transaction (RD 3).
    - The docstring cites RD 2.5, 3 and 5, DEC-0201, DEC-0213, DEC-0220, AC-11, AC-12, AC-21, AC-24, DAC-E2-4, DAC-E2-5, DAC-E2-15 and DAC-E2-S3-1 to DAC-E2-S3-3. It contains none of the six tokens.
  - mypy strict: type the `fetchone()` rows with `cast`, and `assert row is not None` as `coverage/service.py` does.
- [ ] T013 Add `read_data_health` to `src/factorflow/data_health/__init__.py`: import it from `factorflow.data_health.reader` and add `"read_data_health"` to `__all__`. Keep `read_problems` and any name CAP-003-E2-S2 added (RD 2.1; S1 plan Open Gap 1). (depends on T012)

**Checkpoint**: T002 to T010 pass; `uv run mypy src` is clean for `src/factorflow/data_health/`.

---

## Phase 4: Integration

**Purpose**: Prove the extended package keeps the read-only and delivered guards green. Nothing is wired in this story.

- [ ] T014 Run `uv run pytest tests/unit/test_data_health_sql_is_read_only.py tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py`. All three must pass unchanged on the new constants and functions:
  - S1's whole-text, six-token scan;
  - S1's per-`*_SQL` check (first keyword `SELECT`, bound `%(name)s` only);
  - the delivered append-only and package-data guards (`queries.py` holds its statements as Python constants, so `pyproject.toml` is not edited).
  Do not register a router or import the package from `factorflow.api`. `data-health-api` (CAP-003-E2-S4) consumes `read_data_health`. (traces to AC-11; depends on T013)

**Checkpoint**: Guards green; `git diff --stat` lists only the files this plan names.

---

## Phase 5: Polish

**Purpose**: Final validation and the TDD evidence.

- [ ] T015 Run the full validation set (Validation Plan below). Fix any lint, format or type finding, in this story's files only. Check two things:
  - the test comments name `TC-COMP-035`, `TC-COMP-038`, `TC-COMP-047`, `TC-COMP-048` and `TC-COMP-049` (`# Implements TC-COMP-0NN`);
  - `git diff --stat` lists exactly `src/factorflow/data_health/{__init__,queries,reader}.py`, `tests/unit/test_data_health_checks.py`, `tests/integration/test_data_health_checks.py` and this story's TDD evidence file.
  (traces to AC-11; depends on T014)
- [ ] T016 After each TDD cycle in T002–T015 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E2-S3-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E2-S1 | hard | Existing graph edge. This plan imports `models.py` (`DataHealth`, both check dataclasses, `GapDetectionState`, `ProblemPage`), `PROBLEM_COUNT_SQL` and `read_problems`, and extends `queries.py`, `reader.py` and `__init__.py`, which S1 creates |
| CAP-003-E2-S2 | context | Imports nothing from S2. This plan defines its own `DATA_HEALTH_HEAD_SQL` instead of reusing S2's followed-count and prices-as-of statements, so the two stories stay parallel, as the graph has them (Open Gaps 3). Both extend `reader.py`, `queries.py` and `__init__.py` in separate constants and functions |
| CAP-003-E2-S4 | reverse | `data-health-api` calls `read_data_health(conn)` and maps it through `DataHealthResponse.from_reader`, nesting the two checks under `checks` (component-design-data-health-api §2.3). Its graph line holds this story |
| CAP-003-E2-S7 | reverse | The 3000-stock volume and latency test times `read_data_health` through the application. Its graph line holds this story |

No hard edge is added. `CAP-003-E2-S3: [CAP-003-E2-S1]` is unchanged. Cross-capability inputs are delivered: `coverage-service`'s `read_coverage` (CAP-001), and migrations 0001 to 0004.

### Task Dependencies
- T001: none
- T002, T003, T009, T010: depend on T001; same unit file, so write them in sequence (one cycle each)
- T004: depends on T001 (integration file, shared seed helpers)
- T005 to T008: depend on T004 (same file)
- T011: depends on T001
- T012: depends on T011
- T013: depends on T012
- T014: depends on T013
- T015: depends on T014
- T016: interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: the unit file (T002, T003, T009, T010) and the integration file (T004 to T008) are independent
- T011 can be written alongside the Phase 2 tests

---

## Validation Plan

### Constitution-Defined Commands
(tech stack v7, Validation Commands table; working directory the repository root)
- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest` (needs a container runtime for `postgres`-marked tests; without one run `uv run pytest -m 'not postgres'` and report the exclusion, never as a green full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- Focused: `uv run pytest tests/unit/test_data_health_checks.py tests/integration/test_data_health_checks.py tests/unit/test_data_health_sql_is_read_only.py`
- DAC-E2-4, AC-24: T002 and T008 pass. `gap_stock_count` is `None`, never `0`, in every unavailable case.
- DAC-E2-5, DAC-E2-S3-1: T003, T007 and T010 pass with the literal checks.
- DAC-E2-15: T004 passes. `grep -n "except" src/factorflow/data_health/reader.py` prints nothing.
- DAC-E2-S3-2, AC-21: T005 passes on both stores.
- DAC-E2-S3-3: T006 (`-m slow` included) and T009 pass.
- Read-only (RD 3): `uv run pytest tests/unit/test_data_health_sql_is_read_only.py` passes. `grep -nE "conn\.(commit|rollback|transaction)\(" src/factorflow/data_health/reader.py` prints nothing. The T012 docstring describes the caller's transaction in prose, never as one of these call forms.
- No delivered file changed: `git diff --stat` names only `src/factorflow/data_health/*` and the two new test files (DEC-0211).

---

## Notes

### Resolved Conflicts

1. **"One pass over the pages" against facts the pages do not carry.** RD 2.5 says that the checks come from "one pass over `coverage-service`'s pages", and the story Description agrees. DEC-0213 (e) and the story Description define `problem_count` and `as_of` by the fundamentals `acquisition_state.last_outcome` and `last_acquired_at`. `InstrumentCoverage` carries neither per type: its `last_acquired_at` is the maximum over all four types (`coverage/service.py` `_instrument_coverage`). System design §4.2 *Problem and download read* names `acquisition_state` as one of this module's SQL reads. The story AC DAC-E2-5 and DEC-0213 govern over the design's prose. The fold still makes one pass over the pages, and each page's fundamentals state comes from `FUNDAMENTALS_STATE_SQL` keyed by that page's symbols. The page count stays six at 3000 (DAC-E2-S3-3), and `read_coverage` is called unchanged (DAC-E2-15).
2. **Story file list against design placement.** The story's *Implementation* lists `reader.py` as the only source file. RD 2.1 puts every parameterised `SELECT` in `queries.py`, "one constant each", and S1's read-only and bound-parameter tests check that file. The design's normative placement governs, because the file list is not an acceptance criterion. The two new statements go in `queries.py`. `__init__.py` gains the export RD 2.1 lists.
3. **Where "at most five symbols per check" is observed.** TC-COMP-049 says to "inspect kept symbols" at 3000 stocks. The returned `exception_symbols` cannot tell a bounded fold from one that keeps every symbol and truncates at the end. DAC-E2-S3-3 says *memory* holds at most five, and the epic NFR *Volume* says memory does not grow with the roster. The AC governs over the TC's step. T009 observes the fold's own list after every `add`. T006 asserts the returned tuples at scale.

### Open Gaps

1. **How the fundamentals facts join the fold** (register G1). No artifact fixes the mechanism. The plan adds one bounded `FUNDAMENTALS_STATE_SQL` per coverage page, keyed by that page's symbols. Memory per page is bounded by the page size of 500, which `read_coverage` already holds, not by the roster. The page fixes the population, so the statement needs no lifecycle predicate. Derivation: DEC-0213 (e) for the values; the epic NFR *Volume* for the memory bound; RD 2.5 for one pass. Rejected alternatives:
   - one roster-wide query: it holds up to 3000 symbols;
   - aggregate-only SQL: it cannot give the overlap with coverage's presence, so it cannot give the union size DEC-0220 requires.
   Flag for the next revision of component-design-data-health-reader §2.5. Blocks nothing.
2. **When `latest_session` is known** (register G2). `behind_count` needs `latest_session` while folding. The flowchart computes it after the pages (RD 2.5 step 6). Computing it after the pages would need a second pass, which breaks "six pages", or memory that grows with the roster. The plan reads it first, in `DATA_HEALTH_HEAD_SQL`, as `max(covered_to)` over active instruments' prices segments. That is the same value: `coverage.sql` reports `covered_to` as `MAX(covered_to)` of each instrument's prices segments with no date bound. DEC-0213 (b) and the story define the value, so only the order of computation is new. Flag for RD §2.5.
3. **The source of `checked_at` and `followed_count`, and which story owns the statement** (register G3, G4). RD 2.2 lists `DataHealth.checked_at` and `followed_count` without a source. Coverage pages cannot supply `followed_count` when `never_acquired` is true, because `instruments` is then empty, and DAC-E2-S3-2's FINDING-10 store still has followed stocks. The local precedent is the attention read: `checked_at` is Q1's `now()` and `followed_count` is `count(*)` of active instruments (RD 2.3). The plan follows that precedent in its own `DATA_HEALTH_HEAD_SQL`, instead of reusing E2-S2's statements. This keeps the graph's E2-S2 ∥ E2-S3 parallelism (`dependencies.yaml` gives both stories only `[CAP-003-E2-S1]`), at the cost of two constants with the same semantics. Flag for RD §2.2 and §2.5. A later refactor may merge the two constants once both stories land.
4. **Gap availability over six pages.** `read_coverage` runs gap detection on every page call, and RD 2.5 has a single "view `gap_detection.available?`". Availability can differ between pages only if the store changes during the read. The plan treats detection as available only when every page reported it available, and carries the first unavailable page's reason. Derivation: DEC-0213 (c) and STD-UI-4. A count that could not be computed for part of the roster is null, never a partial number. Flag for RD §2.5.
5. **Snapshot consistency** (register G5). The delivered pool is non-autocommit READ COMMITTED. `read_data_health` issues the head statement, the coverage pages, the fundamentals lookups, `PROBLEM_COUNT_SQL` and the problem page as separate statements. While a download is writing, `affected_count` and the first page can therefore come from different snapshots (AC-16, "one set"). The function cannot set the isolation level, because the caller owns the transaction (RD 3; DAC-E2-S1-4), and no artifact sets REPEATABLE READ. The plan changes nothing, and its tests read a quiescent store. Flag for component-design-data-health-api §2.3 and RD §3.
6. **Six full gap detections per request** (register G6). Each `read_coverage` page runs `gaps.detect_gaps` over the whole store. `coverage-service` must stay unchanged (DAC-E2-15). The latency budget is measured by CAP-003-E2-S7 (AC-28). This plan only records the risk. Flag for RD §5.

### Other Notes

- **No PROVISIONAL decision.** Every value this plan uses is fixed by an artifact:
  - the count rules and statuses by DEC-0213 (a) to (e) and the RD 2.5 flowchart;
  - the five symbols by RD 2.2 and DAC-E2-5;
  - the first page of 50 by RD 2.2 and system design §4.2;
  - `limit=500` by DAC-E2-15 and `MAX_LIMIT`;
  - the unavailable reason by `coverage-service`.
  Open Gaps 1 to 4 decide only the mechanism or the source of a value the artifacts define. None of them is a bound, a default or a threshold.
- **`_FIRST_PAGE_LIMIT` is local, not imported from `api/bounds.py`.** No module outside `factorflow.api` imports from it today, and a reader that imports the API layer would invert the dependency `data-health-api → data-health-reader`. The value 50 equals `bounds.DEFAULT_PAGE_SIZE` by RD 2.2. CAP-003-E2-S4 keeps using `bounds.py` for the route.
- **Read-only scan reaches prose and code.** The scan covers the whole text of `queries.py` and `reader.py`, case-insensitively, so none of the words insert, update, delete, truncate, alter or drop may appear in the new constants, functions, docstrings or comments, for example "a later download updates". This includes a `dict.update(...)` call. Use `|=` or assignment.
- **`checks` nesting** is E2-S4's. The reader keeps `daily_prices` and `company_financials` as top-level `DataHealth` fields (RD 2.2). `from_reader` nests them under `checks`.
- **Ordering.** The union's "first five by symbol" relies on `read_coverage` returning instruments ordered by symbol (`coverage.sql` `ORDER BY p.symbol`) and paging by `i.symbol > cursor`. The tests use plain upper-case letters and zero-padded digits, so the expected literals do not depend on collation rules for `.` or `-`.
- **Mapped test cases.** TC-COMP-035, TC-COMP-038, TC-COMP-047, TC-COMP-048 and TC-COMP-049 (data-health-reader-tests.md) map to this story's ACs per the coverage matrix ("3 of 3" derived ACs). TC-COMP-038 and TC-COMP-049 need a store, so they are in the `postgres`-marked integration file, as the story's file list allows.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `src/factorflow/data_health/queries.py: WHERE i.lifecycle = 'active' AND cs.data_type = 'prices' → WHERE cs.data_type = 'prices'` (T006, T007)
  - `src/factorflow/data_health/queries.py: AND cs.data_type = 'prices' → AND cs.data_type = 'fundamentals'` (T007)
  - `src/factorflow/data_health/queries.py: (SELECT count(*) FROM instrument i WHERE i.lifecycle = 'active') → (SELECT count(*) FROM instrument i)` (T006)
  - `src/factorflow/data_health/queries.py: WHERE s.data_type = 'fundamentals' → WHERE s.data_type = 'prices'` (T007)
  - `src/factorflow/data_health/reader.py: in (Presence.ABSENT, Presence.UNKNOWN) → == Presence.ABSENT` (T003)
  - `src/factorflow/data_health/reader.py: in ("failed", "not_found") → in ("failed",)` (T003)
  - `src/factorflow/data_health/reader.py: limit=MAX_LIMIT → limit=50` (T004)
  - `src/factorflow/data_health/reader.py: cursor=view.next_cursor → cursor=None` (T004, fails through the spy cap)
  - `src/factorflow/data_health/reader.py: lifecycle="active" → lifecycle=None` (T004, T006)
  - `src/factorflow/data_health/reader.py: affected_count = <stock_count> → affected_count = len(problems.rows)` (T005)
  - `src/factorflow/data_health/reader.py: return DataHealth(...) → conn.commit(); return DataHealth(...)` (T007)
- **Equivalent mutant** (record as such, with the reason): removing the `latest_session is not None` conjunct of the behind test. `latest_session` is `None` only when no active instrument has a prices segment, and then every page reports `covered_to is None`, so the first conjunct already short-circuits. Removing the `covered_to is not None` conjunct is not equivalent: `None < date` raises `TypeError`, which T003 (a) observes.
