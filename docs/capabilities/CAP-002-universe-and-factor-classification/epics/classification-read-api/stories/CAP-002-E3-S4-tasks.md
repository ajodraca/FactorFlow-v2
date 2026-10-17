---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T23:50:00Z
  source_artifacts:
    - id: CAP-002-E3-S4
      version: "1"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E3-S4 — Stock History, Set List and Single-Set Reads with the 3000-Stock Volume Test

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E3-tasks`
**Date**: 2026-10-17

## Summary

Adds to `src/factorflow/classification/reader.py` the three remaining reads of the
Research screen's history surfaces: `stock_history` (a stock's results in earlier
`complete` sets, newest first, exactly as recorded, each cell with its stored
restatement mark; an empty list for a stock never classified, `InstrumentNotFound`
for an unknown symbol), `list_sets` (every set, `building` and `failed` included,
newest `started_at` first, with the three factor counts, the run's outcome and
`run_started_at`, and `failure_reason`) and `get_set`, with `sql/stock_history.sql`
and `sql/sets.sql`. It also adds the 3000-stock `slow` volume test that runs the
list, the seven sorts, the count, the thresholds and `hide_incomplete`, the summary,
history and sets against a full-size store and proves, with the planner forced off
sequential scans, that each is served by the indexed set rows. Everything returned is
a stored row; nothing is recomputed (AC-19, STD-UI-15). No route, UI or compare work
is built here.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-18 | Every classification retained with its date; user can see a stock's earlier classifications | T003, T004, T005, T006, T007, T009, T012, T015 |
| AC-23 | Restatement mark retained with the classification in its history (read-through) | T003, T007, T015 |
| DAC-E3-9 | History returns only `complete` sets' results, newest first, as recorded | T003, T005, T007, T012, T015 |
| DAC-E3-12 | Restatement mark on every read returning a cell (history half) | T003, T007, T015 |
| DAC-E3-S4-1 | History: complete sets only, newest first, as recorded, with the mark | T003, T007, T012, T015 |
| DAC-E3-S4-2 | Never-classified stock: empty list, distinct from unknown symbol | T004, T007, T012, T015 |
| DAC-E3-S4-3 | `failed`/`building` set excluded from history, included in set list with state and `failure_reason` | T005, T008, T012, T013, T015, T016 |
| DAC-E3-S4-4 | 3000 stocks: list, sort, count served from indexed set rows | T006, T009 |

Mapped component test cases (all mandatory): TC-COMP-150 (DAC-E3-S4-1), TC-COMP-151
(DAC-E3-S4-2), TC-COMP-152 (DAC-E3-S4-3), TC-COMP-153 (DAC-E3-S4-4). Integration tests
that reach history and sets through the API (TC-INT-046 to TC-INT-048) and the UI
tab tests (TC-COMP-154, TC-COMP-155, DAC-E5-S2) belong to the API, UI and automation
stages and are not planned here. The coverage matrix maps the history half of the
restatement mark only through TC-COMP-150's wording; this story adds it as an explicit
assertion (T003, T007).

## Phase 1: Setup

**Purpose**: Confirm what this story imports exists and give the tests a way to seed history and a 3000-stock store.

- [ ] T001 Confirm the producers exist before any code is written; STOP and report if one is missing rather than creating it here. (a) From CAP-002-E3-S1/S2/S3: `src/factorflow/classification/reader.py` exporting `read_set_blocks`, `CurrentSet`, `FactorSummary` (with `qualified_count`, `ranked`, `min_peer_set_size`), `FACTORS`, `FactorCell`, `StockRow`, `ClassificationPage`, `ListFilters`, `Thresholds`, `list_classifications`, `summary`, `compare`, `InstrumentNotFound`, `CursorError`, and the module constants holding the loaded SQL (`LIST_SQL`, `SUMMARY_SQL`, `CURRENT_SET_SQL`); open how `InstrumentNotFound` and `CursorError` are defined (CAP-002-E3-S2 may alias `factorflow.runs.queries.CursorError` or define its own) and use the reader's name for both. (b) `tests/integration/reader_seed.py` with `insert_instrument`, `insert_run`, `insert_set`, `insert_input`, `insert_classification`, `seed_scored_stock` and `seed_inputs`. (c) `factorflow.runs.queries.encode_cursor(ts, run_id)` and `decode_cursor(cursor)` (CAP-001, present in the repo) and `factorflow.api.bounds.DEFAULT_PAGE_SIZE`/`MAX_PAGE_SIZE` (present). (d) Migration `0006_classifications.sql` indexes `idx_factor_classification_instrument`, `idx_classification_set_started`, `idx_factor_classification_set_factor_score`, `idx_factor_classification_set_factor_percentile`, `idx_classification_set_complete_recent`, and the pytest markers `postgres` and `slow` in `pyproject.toml` (present). Nothing is edited by this task.
- [ ] T002 Extend `tests/integration/reader_seed.py` (created by CAP-002-E3-S1, extended by S2 and S3; add functions or optional keyword parameters only, change no existing signature, bound parameters only): `bulk_seed_scored_stocks(conn, set_id, count, *, symbol_prefix="S", all_inputs=True) -> list[int]` that inserts `count` active instruments, their three `factor_classification` rows each and, when `all_inputs`, their eight `factor_input` rows, using `cursor.executemany` (or `COPY` through `cursor.copy`) so 3000 stocks seed in a few seconds; the generated values are deterministic from the index (symbols zero-padded `S0000`..`S2999`; `score` and `percentile` distinct and spread over the range; every 10th stock `not_classified` on value with `input_missing` and a matching `missing` input; every 25th `not_classified` on growth with `not_enough_stocks`; every 40th `restated_possible`), and returns the instrument ids in index order so a test can compute the expected order and counts in Python. Add `ANALYZE` of the three tables as an explicit helper `analyze_classification_tables(conn)` (the planner needs statistics at volume). Add no fixture to `tests/conftest.py`; tests use `migrated_run_schema_connection`.

**Checkpoint**: Producers confirmed present; a test can seed a stock's history across several sets and a 3000-stock set in a migrated database.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define history, the set list, `get_set` and the volume proof from the acceptance criteria. Every test imports `from factorflow.classification import reader`, so all fail until Phase 3.

### Mandatory Component Tests

Marker: the integration tests below are `@pytest.mark.postgres`; the volume tests are also `@pytest.mark.slow`; the unit tests are neither. Each carries a `# Implements TC-COMP-nnn` comment and a docstring naming its DAC.

- [ ] T003 Implement TC-COMP-150 (history returns complete sets newest first with marks) in `tests/integration/test_reader_history.py` (DAC-E3-S4-1, DAC-E3-9, DAC-E3-12; AC-18, AC-23). Stock AAPL; three `complete` sets with distinct `ended_at` (oldest, middle, current); each set holds AAPL's three `factor_classification` rows with different stored `score`, `percentile`, `reason_code` and `restated_possible` (true on value and growth in the middle set only, false elsewhere). `reader.stock_history(conn, "AAPL", limit=50, cursor=None)` returns `([HistoryRow, HistoryRow], None)` for the oldest and middle sets in that order (newest `ended_at` first; the current set is excluded, DEC-0137 and the Open Gap 1 resolution). Each `HistoryRow` carries `set_id`, `classification_date`, `run_id`, `run_outcome` (the run's state, `succeeded` and `partial` both seeded), `ended_at` and `factors` with the three keys in `FACTORS` order; every `FactorCell` equals the stored row (`Decimal` compared by value, reason fields as stored, `restated_possible` as stored: True on value and growth of the middle row, False elsewhere). Re-reading after inserting a newer complete set for other stocks returns identical rows (nothing recomputed, AC-19).
- [ ] T004 Implement TC-COMP-151 (never-classified stock history is empty, not unknown) in `tests/integration/test_reader_history.py` (DAC-E3-S4-2; AC-18). Three cases: (a) a known instrument with no `factor_classification` row in any set returns `([], None)`; (b) a known instrument whose only row is in the current set returns `([], None)` (current excluded); (c) a symbol that is no instrument (`"NOPE"`) raises `reader.InstrumentNotFound`, with a complete set present and, in a fresh database, with no set at all. The empty list and the exception are the two distinct outcomes: assert `[] != raises`, i.e. (a) does not raise and (c) does not return.
- [ ] T005 Implement TC-COMP-152 (history excludes failed/building sets; set list includes them) in `tests/integration/test_reader_history.py` (DAC-E3-S4-3, DAC-E3-9; AC-18, AC-20, AC-21). Seed one older `complete` set (with AAPL's rows), the current `complete` set, a `failed` set (`failure_reason="boom"`, `ended_at` set, no rows for AAPL), and a `building` set holding AAPL's rows already (the engine writes rows as it goes; a failed set can too, so seed rows in the failed set as well to prove exclusion is by state and not by absence of rows). History returns only the older complete set. `reader.list_sets(conn, limit=50, cursor=None)` returns four `SetRow`s newest `started_at` first including the `failed` one (`state == "failed"`, `failure_reason == "boom"`, `ended_at` not None) and the `building` one (`state == "building"`, `ended_at is None`, `failure_reason is None`), each with `run_id`, `run_started_at` equal to its run's `started_at`, `run_outcome` equal to its run's state, `classification_date`, `latest_trading_day`, `active_instruments` and `factors` as `{factor: FactorSummary(qualified_count, ranked, 30)}` in `FACTORS` order from `classification_set_factor`.
- [ ] T006 Implement TC-COMP-153 (3000-stock list, sort and count served from indexed rows) in `tests/integration/test_reader_volume.py`, marked `postgres` and `slow` (DAC-E3-S4-4; AC-18; DEC-0135). Seed with `bulk_seed_scored_stocks` one older `complete` set of 3000 stocks (so a scan of another set is observable) and the current `complete` set of 3000, then `analyze_classification_tables`. (a) Correctness: for each of the seven sorts in `reader.SORT_ALLOWLIST`, ascending and descending, page the unscoped list at `limit=MAX_PAGE_SIZE` through `next_cursor` until it is None (six pages); `match_count == 3000` on every page; the union is the 3000 stocks once each; the first and last pages equal the Python-computed expected order (classified before `not_classified` for a factor sort, ties by symbol); every row's cell values come from the current set, not the older one. (b) Indexed: capture the statements `list_classifications` issues through a recording wrapper around the connection (the pattern of the statement-counting wrapper of CAP-002-E3-S3 T010), re-run each captured statement inside a transaction as `EXPLAIN` after `SET LOCAL enable_seqscan = off`, and assert the plan text contains no `Seq Scan on factor_classification`, no `Seq Scan on classification_set` and no `Seq Scan on instrument` for the symbol sort, and that every `factor_classification` access names an `Index Cond` containing `set_id`; no plan node scans the older set. (c) Print the elapsed time of one full pass as a diagnostic and assert no bound (DEC-0135; precedent `tests/integration/test_runner_volume.py` TC-COMP-190). The expected-order helper lives in the test file; it reads the seeded values back from the database, never from the SQL under test.

### Additional Unit and Integration Tests

- [ ] T007 History details in `tests/integration/test_reader_history.py` (design section 7 row "History is as recorded"; AC-18, AC-19, AC-23, DAC-E3-12): a retired instrument with three `not_classified` rows carrying `retired` in an earlier set appears in history with those cells as stored; a set in which the stock has no rows (it was added later) is not listed for it; history for a stock is unaffected by another stock's rows; two earlier sets with equal `ended_at` order by `set_id` descending (total order, no duplicate or skipped set when paged); paging: five earlier sets at `limit=2` give pages of 2, 2, 1 and `next_cursor` None only on the last, each set once, the cursor stable when a newer complete set is inserted between page requests (keyset, not offset); `symbol` lookup is case-insensitive (`"aapl"` finds `AAPL`, consistent with CAP-002-E3-S3 DEC-0132); with no complete set at all a known instrument returns `([], None)`; the statement-counting wrapper shows one history statement plus the set-block read per call, never one statement per set or per factor; `HistoryRow` carries exactly the fields of design section 2.3 (`dataclasses.fields`).
- [ ] T008 Set list and `get_set` details in `tests/integration/test_reader_history.py` (design section 7 row "Sets list"; AC-20, AC-21, DEC-0083): sets order by `started_at` descending then `set_id` descending; paging at `limit=2` over five sets covers each set once with a stable cursor; with no set at all `list_sets` returns `([], None)`; a first set `building` or `failed` with no complete set is listed (the never-classified case of DEC-0082 on the sets side); `get_set(conn, set_id)` returns the same `SetRow` as the matching entry of `list_sets` for a `complete`, a `failed` and a `building` set; `get_set(conn, uuid4())` raises `reader.SetNotFound`; a `partial` run's set shows `run_outcome == "partial"`; the `ended_at` and `active_instruments` are the set's stored values (nothing recomputed, `active_instruments` is the stored column even when it differs from the row count); `SetRow.factors` holds all three factors with `min_peer_set_size == 30`.
- [ ] T009 Volume extras in `tests/integration/test_reader_volume.py`, marked `postgres` and `slow` (design section 7 row "Volume"; AC-18, DAC-E3-S4-4): on the same 3000-stock seed (a separate test function, so each mandatory TC stays independently runnable): thresholds (`value_percentile_min`) with and without `hide_incomplete` and a symbol prefix return the Python-computed `match_count` on first and last pages, the same number on both; `summary(conn).stocks_current.current_count` equals the Python-computed count of stocks with no `missing`/`outdated` input, `followed_count == 3000`, and the summary's statement is one row (counts only); `stock_history` for one stock with rows in 20 earlier sets (seeded with one stock only, not 20 full sets) and `list_sets` over 21 sets each issue indexed statements, shown with the same `SET LOCAL enable_seqscan = off` plus `EXPLAIN` technique: no `Seq Scan on factor_classification` (history uses `idx_factor_classification_instrument`) and the sets statement uses `idx_classification_set_started` or the `classification_set` primary key; the `EXPLAIN` of the history statement names no `factor_input` relation.
- [ ] T010 [P] Paging and lookup validation in `tests/unit/test_reader_paging.py` (not `postgres`; design section 2.3, DEC-0136): with a recording fake connection (the `tests/unit/governor_fakes.py` pattern) `reader.stock_history(fake, "AAPL", limit=0, cursor=None)`, `limit=MAX_PAGE_SIZE + 1` and `list_sets(fake, limit=0, cursor=None)` raise `ValueError` before the fake sees any statement; `limit=1` and `limit=MAX_PAGE_SIZE` pass the check; a malformed cursor (`"!!"`, valid base64 of non-JSON, a payload with the wrong version, a payload with a non-UUID `id`) raises `reader.CursorError` for both reads and before any statement; `encode_cursor`/`decode_cursor` from `factorflow.runs.queries` round-trip a `(datetime, UUID)` and the reader's reads accept a cursor produced by them (one definition of the wire format, SA-DUP-001); `reader.SetNotFound` is a `LookupError` and `reader.InstrumentNotFound` is not a `SetNotFound`.
- [ ] T011 [P] Read-only and parameterisation guard: extend `tests/unit/test_reader_sql_read_only.py` (CAP-002-E3-S1, extended by S2 and S3) so its scan also covers `stock_history.sql` and `sets.sql` (one statement each, beginning `WITH` or `SELECT`, no write keyword, comments stripped), and assert both files contain no `{` placeholder and no `%` other than `%(name)s` bound parameters (SEC-INP-002: the symbol, limit, keyset and set id travel only as bound parameters).

**Checkpoint**: All tests written and failing (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with the two statements, the row models and the three public reads.

- [ ] T012 [P] Create `src/factorflow/classification/sql/stock_history.sql`, one statement with bound parameters `%(symbol)s::text`, `%(current_set_id)s::uuid` (NULL when no current set), `%(after_ended_at)s::timestamptz`, `%(after_set_id)s::uuid` (both NULL on the first page) and `%(page_size)s::integer` (the requested limit plus one). Shape: CTE `inst` (`SELECT instrument_id FROM instrument WHERE symbol = %(symbol)s::text`); CTE `page_sets` selecting from `factor_classification fc` where `fc.instrument_id = (SELECT instrument_id FROM inst)`, joined to `classification_set s` on `set_id` with `s.state = 'complete'` and `s.set_id IS DISTINCT FROM %(current_set_id)s::uuid`, grouped to one row per set, keyset `(s.ended_at, s.set_id) < (after_ended_at, after_set_id)` when the cursor is given, `ORDER BY s.ended_at DESC, s.set_id DESC LIMIT %(page_size)s`; then a final `SELECT` that `LEFT JOIN`s `inst` to `page_sets` and the stock's three `factor_classification` rows for those sets and to `acquisition_run` on `run_id` for `run_outcome` (`acquisition_run.state`), returning `instrument_id`, `set_id`, `classification_date`, `run_id`, `run_outcome`, `ended_at`, `factor`, `status`, `score`, `percentile`, `reason_code`, `reason_input`, `reason_detail`, `restated_possible`, ordered `ended_at DESC, set_id DESC, array_position(<factor order>, factor)` with the factor order bound as `%(factor_order)s::text[]`. Zero rows means the symbol is unknown; one row with a NULL `set_id` means a known stock with no history. Read the stock's rows through `idx_factor_classification_instrument (instrument_id, set_id)`; touch no `factor_input`. (design 2.6; DEC-0137; depends on T001)
- [ ] T013 [P] Create `src/factorflow/classification/sql/sets.sql`, one statement with bound parameters `%(set_id)s::uuid` (NULL for a list), `%(after_started_at)s::timestamptz`, `%(after_set_id)s::uuid` and `%(page_size)s::integer`. Shape: `classification_set s JOIN acquisition_run r USING (run_id)`, `WHERE (%(set_id)s::uuid IS NULL OR s.set_id = %(set_id)s::uuid)` and the keyset `(s.started_at, s.set_id) < (after_started_at, after_set_id)` when given, `ORDER BY s.started_at DESC, s.set_id DESC LIMIT %(page_size)s`; columns `set_id`, `state`, `classification_date`, `run_id`, `run_started_at` (`r.started_at`), `run_outcome` (`r.state`), `started_at`, `ended_at`, `failure_reason`, `latest_trading_day`, `active_instruments`, and `factors` as `(SELECT jsonb_object_agg(f.factor, jsonb_build_object('qualified_count', f.qualified_count, 'ranked', f.ranked)) FROM classification_set_factor f WHERE f.set_id = s.set_id)`, the same expression as `current_set.sql` (CAP-002-E3-S1 T013; reuse that spelling exactly). One statement serves `list_sets` and `get_set`. (design 2.6; DEC-0083; depends on T001)
- [ ] T014 Add to `src/factorflow/classification/reader.py`, in the existing style: load `stock_history.sql` and `sets.sql` at import as `HISTORY_SQL` and `SETS_SQL` next to the earlier constants (`read_text()`, the `gaps.py` pattern); `from factorflow.api.bounds import MAX_PAGE_SIZE` only if CAP-002-E3-S2 has not already imported it (reuse its import otherwise); `from factorflow.runs import queries as _run_queries` for `encode_cursor`/`decode_cursor` (the one wire format; do not copy its code); the frozen dataclasses `HistoryRow` (`set_id`, `classification_date`, `run_id`, `run_outcome`, `ended_at`, `factors: dict[str, FactorCell]`) and `SetRow` (`set_id`, `state`, `classification_date`, `run_id`, `run_started_at`, `run_outcome`, `started_at`, `ended_at`, `failure_reason`, `latest_trading_day`, `active_instruments`, `factors: dict[str, FactorSummary]`) with the field types of design 2.3 and the API design's `SetResponse`; `class SetNotFound(LookupError)`; and the private helpers `_check_limit(limit)` (`ValueError` unless `1 <= limit <= MAX_PAGE_SIZE`), `_decode_page_cursor(cursor)` (returns `(datetime, UUID)` or `(None, None)`; re-raises `factorflow.runs.queries.CursorError` as the reader's `CursorError`) and `_row_to_set(row)`, mapping by name through the cursor description (the `_row_to_*` pattern of `runs/queries.py`). Do not redefine `FactorCell`, `FactorSummary`, `CurrentSet`, `FACTORS`, `InstrumentNotFound` or `CursorError`. (DEC-0136; depends on T001)
- [ ] T015 Add `stock_history(conn, symbol, limit, cursor) -> tuple[list[HistoryRow], str | None]` to `src/factorflow/classification/reader.py`: `_check_limit`, decode the cursor, upper-case the symbol (as `stock_evidence` does, CAP-002-E3-S3 DEC-0132), `current, _later = read_set_blocks(conn)`, run `HISTORY_SQL` once with `{"symbol", "current_set_id": current.set_id if current else None, "after_ended_at", "after_set_id", "page_size": limit + 1, "factor_order": list(FACTORS)}` using a plain cursor; zero rows raises `InstrumentNotFound`; one row with a null `set_id` returns `([], None)`; otherwise group the rows by `set_id` in the order returned into `HistoryRow`s with one `FactorCell` per row, keep the first `limit` sets and, when a further set existed, return `next_cursor = _run_queries.encode_cursor(last_kept.ended_at, last_kept.set_id)`. Build every `FactorCell` from the stored columns, nothing derived (AC-19). No `commit`, no write. (depends on T012, T014)
- [ ] T016 Add `list_sets(conn, limit, cursor) -> tuple[list[SetRow], str | None]` and `get_set(conn, set_id) -> SetRow` to `src/factorflow/classification/reader.py`: `list_sets` runs `SETS_SQL` with a NULL `set_id`, `page_size = limit + 1` and the decoded keyset, keeps `limit` rows and encodes the cursor from the last kept row's `(started_at, set_id)`; `get_set` runs `SETS_SQL` with the given `set_id` and `page_size = 1` and raises `SetNotFound` on zero rows. `factors` maps to `{f: FactorSummary(qualified_count, ranked, MIN_PEER_SET_SIZE) for f in FACTORS}` through the same constructor `read_set_blocks` uses; if CAP-002-E3-S1 built it inline, add no second copy: call a shared private helper that S1 already exposes, or extract one in this task only if S1's code has one call site and the extraction is a rename-only move with S1's tests unchanged (otherwise record the duplicate in the review hand-off). No `commit`, no write. (depends on T013, T014)

**Checkpoint**: T003 to T011 pass; `uv run mypy src` is clean for the changed module.

---

## Phase 4: Integration

**Purpose**: Confirm the new statements ship in the release image and that the cursor, the bounds and the factor-cell construction each have one definition.

- [ ] T017 Run `uv run pytest tests/unit/test_package_data_ships_sql.py` (the guard CAP-002-E1-S1 created and CAP-002-E2-S1 extended). It must pass with `classification/sql/stock_history.sql` and `sets.sql` present, proving a non-editable install carries them (DEC-0088). If it fails, do not edit `pyproject.toml` here: the glob is CAP-002-E2-S1's deliverable; record the failure in the review hand-off. Nothing is mounted or wired in this story: the routes (CAP-002-E3-S5) consume `stock_history`, `list_sets`, `get_set`, `SetNotFound` and `CursorError` later. (depends on T012, T013)
- [ ] T018 Confirm single definitions (SA-DUP-001): `grep -n "base64\|json.dumps" src/factorflow/classification/reader.py` shows only what CAP-002-E3-S2's own cursor already uses and nothing added by this story (history and sets use `factorflow.runs.queries`); `grep -n "MAX_PAGE_SIZE" src/factorflow/classification/reader.py` shows one import; `grep -n "FactorCell(" src/factorflow/classification/reader.py` shows no more construction sites than the list mapper plus the history mapper (name both in the review hand-off, and reuse the list's `_row_to_cell` helper if S2 has one); `grep -rn "factor_input" src/factorflow/classification/sql/stock_history.sql src/factorflow/classification/sql/sets.sql` returns nothing; no new import of `factorflow.universes.service` or `factorflow.api.routes`. (depends on T016)

**Checkpoint**: The new SQL is covered by the package-data guard and the reader duplicates neither the cursor nor the cell mapping.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [ ] T019 Run the full validation set (Validation Plan below), fix any lint, format or type finding in the files this story added or extended, and confirm the module docstring and test comments cite DAC-E3-S4-1 to DAC-E3-S4-4, DAC-E3-9, DAC-E3-12 and the four TC-IDs. Add no file beyond the two SQL files, `test_reader_history.py`, `test_reader_volume.py`, `test_reader_paging.py`, the `reader_seed.py` and `test_reader_sql_read_only.py` extensions and `reader.py`. (depends on T016, T017, T018)
- [ ] T020 After each TDD cycle in T003–T019 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E3-S4-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E3-S3 | hard | Existing graph edge (`E3-S4: [E3-S3]`). `reader.py` with the list and compare reads the volume test exercises, and the shared models (`FactorCell`, `InstrumentNotFound`, `reader_seed.py` extensions) history extends (T001, T006, T014, T015) |
| CAP-002-E3-S2 | context | Owns `list_classifications`, `ListFilters`, `Thresholds`, `SORT_ALLOWLIST`, `FactorCell`, `CursorError`; reached through CAP-002-E3-S3's hard edge |
| CAP-002-E3-S1 | context | Owns `read_set_blocks`, `CurrentSet`, `FactorSummary`, `summary` and `reader_seed.py`; reached through CAP-002-E3-S2 and CAP-002-E3-S3 |
| CAP-002-E2-S1 | context | Owns the `0006` tables and indexes the statements read and the package-data glob (T017); reached through CAP-002-E3-S1 |
| CAP-002-E1-S1 | context | Created the package-data guard `tests/unit/test_package_data_ships_sql.py` run in T017; reached through CAP-002-E2-S1 |
| CAP-002-E3-S5 | reverse | The history and sets routes call `stock_history`, `list_sets`, `get_set` and map `SetNotFound`, `InstrumentNotFound`, `CursorError` |

No new hard edge: this story imports nothing from CAP-002-E1-S6 (it needs only
`factorflow.api.bounds`, which exists, and `factorflow.runs.queries`, CAP-001).

### Task Dependencies
- T001: No dependencies
- T002: Depends on T001
- T003, T004, T005, T007, T008: Depend on T002; same file `test_reader_history.py`, written in order
- T006, T009: Depend on T002; same file `test_reader_volume.py`, written in order
- T010, T011: Depend on T001; separate unit files, can run in parallel with every other test task (they fail until Phase 3)
- T012, T013: Depend on T001; independent files, can run in parallel with each other (after Phase 2)
- T014: Depends on T001; can run in parallel with T012 and T013
- T015: Depends on T012, T014
- T016: Depends on T013, T014; can run in parallel with T015
- T017: Depends on T012, T013
- T018: Depends on T016
- T019: Depends on T016, T017, T018
- T020: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: the history file group (T003, T004, T005, T007, T008), the volume file group (T006, T009) and the unit files (T010, T011) are independent files
- Phase 3: T012, T013 and T014 are independent; T015 and T016 can run in parallel after them

---

## Validation Plan

### Constitution-Defined Commands
- Build: none defined for Python in the tech-stack Validation Commands table (no separate build step)
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (the story's Validation section; `uv run pytest` runs both). The volume tests are `postgres` and `slow`; run them alone with `uv run pytest tests/integration/test_reader_volume.py -m "postgres and slow" -s`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

If no container runtime is available, run `uv run pytest -m 'not postgres'` and report that the `postgres`-marked history, sets and volume tests were excluded (tech stack, Validation Commands note).

### Story-Specific Validation
- DAC-E3-S4-1: `uv run pytest tests/integration/test_reader_history.py -m postgres -k "history"` shows TC-COMP-150 green: earlier complete sets only, newest first, cells and `restated_possible` as stored
- DAC-E3-S4-2: TC-COMP-151 green: `([], None)` for a stock never classified, `InstrumentNotFound` for an unknown symbol
- DAC-E3-S4-3: TC-COMP-152 green: `failed` and `building` sets absent from history, present in `list_sets` with `state`, `failure_reason`, `ended_at`
- DAC-E3-S4-4: `uv run pytest tests/integration/test_reader_volume.py -m "postgres and slow" -s` shows TC-COMP-153 green: seven sorts both directions correct at 3000 stocks, `match_count` 3000 on every page, no `Seq Scan` on the set tables under `enable_seqscan = off`, elapsed time printed and not asserted
- Single definitions: `tests/unit/test_reader_sql_read_only.py` and `tests/unit/test_reader_paging.py` pass; the `grep` checks of T018 return as stated

---

## Notes

### Resolved Conflicts

- **"Only `complete` sets' results" (DAC-E3-9, DAC-E3-S4-1) versus reader design 2.6 and its test row, which page "sets other than the current one" and state "the current set is excluded".** Not a contradiction: the criteria bound which sets may appear (complete only) and their order; none requires the current set to appear. AC-18 asks for a stock's *earlier* classifications, and the current result is the evidence read. The design is the more specific statement and governs. Recorded as DEC-0137 (`kind: contradiction`, high confidence).
- **Reader design 2.6 keysets history on `(ended_at, set_id)` and sets on `(started_at, set_id)` and says the reader "shares the encoder" with `runs/queries.py` (design 2.5).** Both keysets are a timestamp and a UUID, exactly the payload of the public `runs.queries.encode_cursor(ts, run_id)`, so the plan reuses it. CAP-002-E3-S2 could not (its list cursor carries sort, order, key and set), which is why it has a private encoder; that does not apply here. Settled by the design's own sharing statement; the choices around it are DEC-0136.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-10-17): what "within the test's budget" means for the volume test (DAC-E3-S4-4, TC-COMP-153).** No artifact states a budget; reader design section 5 says the volume test "exercises the shape without asserting a number" and section 14 Q1 (no read-latency target at 3000 rows) is open. The plan asserts correctness at 3000 stocks plus indexed access (planner forced off sequential scans, `EXPLAIN`), prints elapsed time and asserts no bound. Derivation: design 5 and 14, and the repository precedent in `test_coverage_volume.py` and `test_runner_volume.py` (TC-COMP-190), which cite the same missing target. Recorded as DEC-0135. Flag for the owner: when Q1 is answered, a number is added to T006 (c) only. Flag for the next revision of the story/TC-153 wording ("budget" has no referent).
2. **PROVISIONAL — awaiting owner confirmation (2026-10-17): limit bounds, cursor, and the error for an unknown set.** Design 2.3 gives `limit` and `cursor` parameters but no bounds, no cursor format and no exception for `get_set`. The plan: `limit` in `1..MAX_PAGE_SIZE` or `ValueError`; the cursor is `runs.queries` `(timestamp, set_id)`, malformed ones raise the reader's `CursorError`; unknown set raises `SetNotFound(LookupError)`. A cursor is not bound to the symbol or endpoint that issued it, so a history cursor given to the sets list returns a wrong page rather than `cursor_stale`; the API design's `cursor_stale` text covers only list cursors. Derivation: the existing public cursor, the S2 `ListFilters` limit bounds, and the API design's `classification_set_not_found` 404. Recorded as DEC-0136. Flag for the API design if a stale-cursor 422 is wanted on history and sets (the cursor would need a kind field the existing encoder lacks), and for reader design 2.3 to name `SetNotFound`.
3. **Resolved by decision, not provisional: the current set is not in history (DEC-0137, see Resolved Conflicts).** Flag for the story's wording at its next revision ("only complete sets" reads as inclusive of the current one).
4. **History across a re-run of the same download date.** Two complete sets can share a `classification_date`; both are listed, ordered by `ended_at`. No artifact asks for one result per date. Not a bound.
5. **A stock added after a set was built has no rows in it.** That set does not appear in the stock's history (no row, no result), consistent with CAP-002-E3-S3 DEC-0131 (stored rows only). Not a bound.
6. **`SetRow.run_outcome` for a `building` set.** It is the run's state as stored (a running state), not one of `succeeded|partial`, which the design lists for the current set only. The plan returns the stored value and types the field `str`. Flag for the API design's `SetResponse` if the enumeration should be closed.
7. **Planner behaviour at volume.** The `EXPLAIN` assertions use `SET LOCAL enable_seqscan = off` (the technique CAP-002-E3-S1 T007 records) because at 3000 rows the planner may legitimately choose a sequential scan; the assertion is that an index path exists and is the one named, not that the planner prefers it. If a statement cannot avoid a sequential scan even then, that is a design defect in the statement (for example a missing index), reported in the review hand-off, not weakened here.

### Other Notes

- **Dependency graph.** No edge added or removed. `CAP-002-E3-S4: [CAP-002-E3-S3]` already holds the producer of `reader.py`, the list and compare reads and the seeding helpers; E3-S1, E3-S2 and the E2 stories are reached through it. No cycle: E3-S5 depends on this story.
- **Story status.** The skill's step of setting the story's frontmatter `status: planning` was not performed: the supervising instruction forbids editing the approved story. The story stays `todo`.
- **Consistency with the CAP-002-E3-S1, S2 and S3 plans.** This plan extends, and does not redefine, `read_set_blocks`, `CurrentSet`, `FactorSummary`, `FactorCell`, `InstrumentNotFound`, `CursorError`, `reader_seed.py` and `test_reader_sql_read_only.py`; it reuses their import-at-load SQL pattern, the statement-counting wrapper, the `_row_to_*` mapping and the `migrated_run_schema_connection` fixture, and upper-cases symbols as S3 does (DEC-0132).
- **Volume cost.** `migrated_run_schema_connection` is function-scoped, so each volume test seeds its own 3000-stock store; two test functions keep the bulk insert (T002) to two runs. The tests are `slow`; the story's two `pytest -m` validation commands include them, so a CI that cannot afford them selects `-m "not slow"` explicitly.
- **Index use.** History reads `factor_classification` through `idx_factor_classification_instrument (instrument_id, set_id)` and `classification_set` by primary key; sets order by `idx_classification_set_started`; the list reads use the indexes of research-store section 2.5. T006 and T009 are what prove this; no claim rests on the design text alone.
- **Risk.** Run T001 first. CAP-002-E3-S1 to E3-S3 and the E2 tables are `todo` at planning time and `src/factorflow/classification/` does not exist yet; this story cannot start until E3-S3 has landed, and shares `reader.py` and `reader_seed.py` with it, so edits must be rebased onto S3's, not parallel to them.
