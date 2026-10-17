---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S2-tasks
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
  tool_version: unknown
  timestamp: 2026-10-17T23:10:00Z
  source_artifacts:
    - id: CAP-002-E2-S2
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S2 — Factor Engine Build Transaction: Constants, Set Context, Completion, Failure and Timeout

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-tasks`
**Date**: 2026-10-17

## Summary

Creates the `factorflow.classification` package and the build spine of the factor engine: `constants.py`, `line_items.py` (seven line items, every key `REQUIRES_INPUT`), `engine.build(conn, set_id, timeout_seconds) -> BuildResult` and the three statements `set_context.sql`, `complete_set.sql` and `fail_set.sql`. `build` runs an ordered list of stages (empty in this story; CAP-002-E2-S3 to S6 append theirs) inside one `REPEATABLE READ` transaction with a local `statement_timeout`, completes the set in that transaction, and on any exception rolls back every row of the attempt and records the set `failed` with the exception class and message in a new transaction, so no reader can see half a set. Four tests prove the transaction behaviour (TC-COMP-166, 167, 090, 159), one safety test proves the package is isolated from ingestion and append-only (TC-COMP-160), and one strict-xfail test keeps the unresolved payload-key question from being forgotten (TC-COMP-059). No factor is computed here.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-10 | Classify after succeeded or partial runs only | T005, T013, T017 (build resolves the set's `run_id`; the qualifying-run read is CAP-002-E2-S8, uniqueness is S1) |
| AC-11 | Up to date within 5 minutes | T008, T012, T017 (timeout bound; the 3000-stock volume test is CAP-002-E2-S7) |
| AC-15 | Retired stock outside every peer set (compute side) | T005, T013 (retired roster partitioned from the active roster) |
| AC-19 | Earlier-period data changes no recorded classification | T005, T009, T010, T013, T017 |
| AC-20 | Set never half-written; failure records its reason | T006, T007, T009, T017 |
| DAC-E2-4 | `run_id` unique; failed runs never acquire a set | No S2 task: enforced by the S1 constraint (`classification_set_run_id_key`) and the S8 qualifying-run read; T005 only asserts the context returns the set's `run_id` |
| DAC-E2-9 | Inputs selected as they existed when the build transaction ran | T005, T009, T013, T017 |
| DAC-E2-10 | Complete with the last row, or failed with a reason and every row rolled back | T006, T007, T009, T014, T017 |
| DAC-E2-S2-1 | Injected failure leaves zero rows and a `failed` set with the class | T006, T017 |
| DAC-E2-S2-2 | Already-failed set: `complete_set.sql` updates no row; build rolls back, writes nothing | T007, T014 |
| DAC-E2-S2-3 | `timeout_seconds` 0.001: `failed` with a timeout reason, no rows | T008, T017 |
| DAC-E2-S2-4 | `set_context.sql` returns date, latest trading day, active roster, in-transaction | T005, T013 |
| DAC-E2-S2-5 | Unresolved key: inputs `missing` with the cause; test fails until resolved | T011, T016 (contract and test here; the derived `missing` rows are asserted by CAP-002-E2-S3, see Notes) |
| DAC-E2-S2-6 | No ingestion import, parameterised statements, no mutation of observation or history tables | T010, T013, T014 |

## Phase 1: Setup

**Purpose**: Confirm the hard prerequisite exists and create the empty package.

- [ ] T001 Confirm CAP-002-E2-S1 has landed on the working branch: `src/factorflow/db/migrations/0006_classifications.sql` must exist and `pyproject.toml` `[tool.setuptools.package-data].factorflow` must contain `classification/sql/*.sql`. If either is absent, STOP and report that the hard dependency CAP-002-E2-S1 is not implemented (every integration test below needs the four classification tables). Read `src/factorflow/coverage/service.py` (how `.sql` files are loaded once at import and executed with bound parameters), `tests/conftest.py` (`postgres_connection_string`, `migrated_run_schema_connection`) and `src/factorflow/db/migrate_main.py` (`MIGRATIONS_DIR`)
- [ ] T002 Create `src/factorflow/classification/__init__.py` containing only a module docstring naming the package and CAP-002-E2-S2 (no re-exports, no logic) and the directory `src/factorflow/classification/sql/` (it is created by T015's files; do not add a placeholder) (depends on T001)

**Checkpoint**: The prerequisite exists, the package imports.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the expected behaviour from the acceptance criteria and mapped test cases.

Database tests are marked `@pytest.mark.postgres` and carry `# Implements TC-COMP-nnn` above each. The build is exercised through the public `build` function; stages are injected by monkeypatching `factorflow.classification.engine._STAGES` (DEC-0112). New test modules only: no delivered test file is edited (DEC-0064).

### Mandatory Component Tests
- [ ] T003 Create the shared fixture helper `tests/integration/engine_support.py` (a plain module, not `conftest.py`, because `tests/conftest.py` is a delivered file): `migrate_through_classification(connection_string)` applies `discover(MIGRATIONS_DIR)` through `apply_pending` and asserts version 6 is recorded; `add_instrument(conn, symbol, lifecycle="active")`, `add_bar(conn, instrument_id, session_date, close=10)` (writes the `value_hash` and `observed_on` columns `daily_bar` requires, see `0002_observations.sql`), `add_run(conn, state="succeeded")` returning a terminal `run_id` (`ended_at` set so `idx_acquisition_run_single_active` is not hit), `add_building_set(conn, run_id, classification_date)` and `count_classification_rows(conn, set_id) -> dict[str, int]` over the four tables. Every helper takes the connection and commits. Provide no pytest fixtures; each test module declares its own small fixture that calls `migrate_through_classification(postgres_connection_string)` and yields a connection (depends on T001)
- [ ] T004 [P] Create `tests/integration/test_engine_context.py` with a module-local fixture over `tests/integration/engine_support.py` (depends on T003)
- [ ] T005 Implement TC-COMP-159 (set_context resolves date, latest trading day and roster in-transaction) in `tests/integration/test_engine_context.py`, calling `engine._read_context(cur, set_id)` on a cursor inside an open transaction: with two active instruments having bars on different dates, one active instrument with an older last bar, one retired instrument with a *later* bar, and a building set for a run, assert `classification_date` and `run_id` equal the set row, `latest_trading_day` is the newest bar over the **active** instruments only (the retired later bar must not count), `active_ids` is exactly the active instrument ids and `retired_ids` exactly the retired one (AC-15 compute side). In-transaction proof: open the context read on connection A inside a `REPEATABLE READ` transaction, commit a newer active bar on connection B, run the read again on A and assert `latest_trading_day` unchanged; then a fresh transaction sees the newer bar. Also assert a store with no bar for any active instrument gives `latest_trading_day is None` (depends on T004)
- [ ] T006 Implement TC-COMP-166 (Failure after inputs written leaves zero rows and failed set) in `tests/integration/test_engine_transaction.py` (new file): monkeypatch `_STAGES` with one stage that inserts, through its cursor, one `classification_set_factor` row, one `present` and dated `factor_input` row and one `classified` `factor_classification` row for the build's set, then raises `RuntimeError("injected failure")`. Assert `build` returns `BuildResult(state="failed")`, `count_classification_rows` is zero for all four tables, the set row is `failed` with `ended_at` set and `failure_reason` starting `RuntimeError` and containing `injected failure`, and `caplog` holds an ERROR record carrying the `set_id`. Assert the stack trace is not in `failure_reason` (SEC-ERR-001) (depends on T003)
- [ ] T007 Implement TC-COMP-167 (Completing an already-failed set updates no row and rolls back) in `tests/integration/test_engine_transaction.py` (same file as T006, not parallel): two cases. (a) Mark the building set `failed` on a second connection and commit **before** calling `build` with no stages and no injected failure; assert `complete_set.sql` updated no row (the build raises inside its transaction), `build` returns `failed`, no classification row exists and the set row still carries the other writer's `failure_reason` and `ended_at`, unmodified, because `fail_set.sql` is guarded by `state = 'building'`. (b) Mid-build variant: a stage marks the set `failed` on a second connection and commits; assert the same end state (under `REPEATABLE READ` PostgreSQL raises a serialization failure on the guarded update rather than reporting rowcount 0; both paths end in the same state, see Notes) (depends on T006)
- [ ] T008 Implement TC-COMP-090 (Build timeout fails the set with a timeout reason) in `tests/integration/test_engine_transaction.py` (same file, not parallel): populate instruments and bars, monkeypatch `_STAGES` with a stage executing `SELECT pg_sleep(1)`, call `build(conn, set_id, 0.001)`; assert `failed`, `failure_reason` starts `QueryCanceled` and contains `timeout`, zero classification rows, and that the call returned in well under the 1 second sleep. The `pg_sleep` stage makes the case deterministic, since `set_context.sql` alone can finish inside 1 ms (depends on T007)

### Additional Unit Tests
- [ ] T009 Add to `tests/integration/test_engine_transaction.py` (same file, not parallel) the cases no mapped TC names, each with the AC it traces to in its docstring: (a) success with no stages: `BuildResult.state == "complete"`, `failure_reason is None`, `active_instruments` equals the active roster size, `qualified_counts == {}`, the set row `complete` with `ended_at`, `latest_trading_day` and `active_instruments` set (AC-20); (b) snapshot: a stage reads `max(session_date)` over `daily_bar`, a second connection then commits a newer bar, a later stage reads it again; both reads equal and the stored `latest_trading_day` is the earlier date (DAC-E2-9, AC-19, DEC-0111); (c) no price data held: with no bar for any active instrument the set is `failed` with `failure_reason` equal to `ValueError: no price data held for any active instrument` (DEC-0114; use the exception class chosen in T016); (d) `timeout_seconds <= 0` raises `ValueError` before touching the database and `timeout_seconds=0.0004` still sets a positive millisecond value (never 0, which disables the timeout); (e) a connection with `autocommit=True` or already inside a transaction is refused with `ValueError` before any statement; (f) `failure_reason` is one line: a stage raising `RuntimeError("first\nsecond")` records only `RuntimeError: first` (depends on T008)
- [ ] T010 [P] Implement TC-COMP-160 (classification package is isolated from ingestion and append-only) in `tests/unit/test_engine_sql_safety.py` (new file). Walk `src/factorflow/classification/**/*.py` with `ast`: no `Import`/`ImportFrom` whose module is `factorflow.ingestion.massive` or starts with `factorflow.ingestion.massive.`, nor `from factorflow.ingestion import massive`; every `.execute(` first argument is a name or string constant, never a `JoinedStr`, `%` or `+` expression or a `.format(` call (reuse the AST walk idea in `tests/unit/test_history_depth_sql_safety.py`; its `_sql_argument_literals` is private to that module, so write the equivalent). Read each `classification/sql/*.sql` and assert no `.format`-style braces, no `||` concatenation, and that parameters use `%(name)s` placeholders only. For mutation: import `prohibited_observation_mutations` from `tests.unit.test_sql_is_append_only` for the four observation tables, add a local pattern for `classification_set_factor`, `factor_input`, `factor_classification` and `universe_event`, apply both to every file under `classification/`, and allow exactly the two guarded `UPDATE classification_set` statements (each must contain `state = 'building'` and `set_id = %(set_id)s`). Include parametrized positive and negative strings proving each rule can fail: an `import factorflow.ingestion.massive.client`, an f-string execute, `DELETE FROM factor_input`, an unguarded `UPDATE classification_set SET state = 'complete'` are detected, the guarded one is allowed. The existing scan in `tests/unit/test_sql_is_append_only.py` covers `.py` and migrations only, so this test is what covers the package's `.sql` files (traces to AC-19) (depends on T001)
- [ ] T011 [P] Implement TC-COMP-059 in two new files. `tests/unit/test_line_items_resolved.py`: one test asserting `line_items.unresolved() == []`, marked `@pytest.mark.xfail(strict=True, reason="[REQUIRES INPUT] Massive payload keys for the seven line items: system design section 8 question 1")` (DEC-0113; `# Implements TC-COMP-059`). `tests/unit/test_line_items.py`: `LINE_ITEMS` has exactly the seven names `book_equity`, `shares_outstanding`, `net_income`, `diluted_eps`, `revenue`, `operating_cash_flow`, `capital_expenditure`; each has the statement type of the design (`balance_sheet`, `balance_sheet`, `income_statement`, `income_statement`, `income_statement`, `cash_flow_statement`, `cash_flow_statement`), `sign == 1`, `payload_key == REQUIRES_INPUT`; `unresolved()` returns all seven today; a copy of `LINE_ITEMS` with one key replaced by `"X"` (monkeypatched) is reported as the six others; `UNRESOLVED_CAUSE == "line_item_mapping_unresolved"`; `LineItem` is frozen (traces to AC-7)
- [ ] T012 [P] Create `tests/unit/test_classification_constants.py`: `MIN_PEER_SET_SIZE == 30`, `FUNDAMENTALS_STALE_AFTER_MONTHS == 6`, `MOMENTUM_LAG_MONTHS == 1`, `MOMENTUM_WINDOWS_MONTHS == (3, 6, 12)`, `FACTORS == ("value", "growth", "momentum")`; `INPUT_NAMES` maps each factor to `("book_to_price", "earnings_yield", "fcf_yield")`, `("revenue_growth", "eps_growth")`, `("return_3m", "return_6m", "return_12m")` and the union equals the names in the `factor_input_name_matches_factor` CHECK parsed from `src/factorflow/db/migrations/0006_classifications.sql` (parse the quoted names in that constraint, do not paste a second list). Add `tests/unit/test_classification_sql_ships.py`: every `src/factorflow/classification/sql/*.sql` matches a glob in `[tool.setuptools.package-data].factorflow` (`tomllib`, `PurePath.match`), the three S2 files exist and are non-empty, and `engine` exposes them as module constants loaded at import (replaces, for the real directory, the synthetic-path check CAP-002-E2-S1 ships in `tests/unit/test_package_data_ships_sql.py`, which stays untouched) (traces to AC-11, AC-10)

**Checkpoint**: All tests are written and fail (no `factorflow.classification.engine` yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass.

- [ ] T013 [P] Create `src/factorflow/classification/sql/set_context.sql`: one statement, `%(set_id)s` the only parameter, returning one row `set_id`, `run_id`, `classification_date` from `classification_set`, `latest_trading_day` = `max(b.session_date)` over `daily_bar b JOIN instrument i USING (instrument_id) WHERE i.lifecycle = 'active'`, `active_ids` = `array_agg(instrument_id ORDER BY instrument_id)` of active instruments (empty array, not NULL, via `coalesce`) and `retired_ids` likewise for retired. No `FOR UPDATE`, no `LOCK`; it reads rows as they exist in the build's snapshot (DAC-E2-S2-4, DAC-E2-9) (depends on T005)
- [ ] T014 [P] Create `src/factorflow/classification/sql/complete_set.sql` exactly as factor-engine 2.3 step 8: `UPDATE classification_set SET state = 'complete', ended_at = now(), latest_trading_day = %(latest_trading_day)s, active_instruments = %(active_instruments)s WHERE set_id = %(set_id)s AND state = 'building'`; and `src/factorflow/classification/sql/fail_set.sql`: `UPDATE classification_set SET state = 'failed', ended_at = now(), failure_reason = %(reason)s WHERE set_id = %(set_id)s AND state = 'building'`. Both are the only `UPDATE` in the package (depends on T006, T007)
- [ ] T015 [P] Create `src/factorflow/classification/constants.py` with the values and shapes T012 pins, one line comment each naming the source (AC-14 owner 2026-10-12; AC-13; capability section 2). `INPUT_NAMES: dict[str, tuple[str, ...]]` keyed by factor (DEC-0112). No other number (depends on T012)
- [ ] T016 Create `src/factorflow/classification/line_items.py` verbatim from factor-engine 2.4: `REQUIRES_INPUT`, frozen `LineItem(label, statement_type, payload_key, sign)`, `LINE_ITEMS` with the seven items all `REQUIRES_INPUT` and sign 1, `unresolved()`, plus `UNRESOLVED_CAUSE = "line_item_mapping_unresolved"` for CAP-002-E2-S3 to share. Add no resolved key, and do not guess any (depends on T011)
- [ ] T017 Create `src/factorflow/classification/engine.py` (depends on T013, T014, T015, T016): load the three statements once at import from `Path(__file__).parent / "sql"` as module constants; frozen `BuildContext(set_id, run_id, classification_date, latest_trading_day, active_ids, retired_ids)`; `Stage = Callable[[psycopg.Connection, BuildContext], None]`; `_STAGES: list[Stage] = []` with a docstring telling S3 to S6 to append in the design 2.2 order (inputs, peer sets, classification); frozen `BuildResult` exactly as design 2.3; `_read_context(cur, set_id) -> BuildContext`; `build(conn, set_id, timeout_seconds)`: (1) validate `timeout_seconds > 0` and the connection (`autocommit` false and `conn.info.transaction_status` is `IDLE`), else `ValueError` before any statement; (2) `SET TRANSACTION ISOLATION LEVEL REPEATABLE READ` first (DEC-0111), then `SELECT set_config('statement_timeout', %(ms)s, true)` with `ms = str(max(1, math.ceil(timeout_seconds * 1000)))` (`SET LOCAL` cannot take a bound parameter; `set_config(..., true)` is its parameterised form, and 0 would disable the timeout); (3) `_read_context`, raising `LookupError` if no row; (4) raise `ValueError("no price data held for any active instrument")` when `latest_trading_day is None` (DEC-0114); (5) run each stage in `_STAGES` in order; (6) `complete_set.sql` and raise `RuntimeError("classification set is no longer building")` when `rowcount != 1`; (7) read `qualified_counts` from `classification_set_factor` for the set, then `commit`. On any `Exception`: `rollback`, log with the structured logger and `set_id`, then in a new transaction run `fail_set.sql` with the reason (`f"{type(exc).__name__}: {message}"`, first line of the message only, no traceback), commit and return `BuildResult(state="failed", failure_reason=reason, active_instruments=0, qualified_counts={})`. A failure inside the failure-recording transaction (connection lost) is not caught: the scheduler's start-up reclaim records it (DEC-0067, factor-engine acceptance criterion 12). No numeric library, no `ingestion` import

**Checkpoint**: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` pass for the new tests (the strict xfail reports as xfailed).

---

## Phase 4: Integration

**Purpose**: Confirm the package fits the repository's gates.

- [ ] T018 Run every command in the Validation Plan from the repository root and fix failures in files this plan names; a failure in any other file is reported, not patched. Confirm `uv build --wheel` output contains the three `classification/sql/*.sql` files (the existing `tests/unit/test_distribution_contents.py` build path) (depends on T017)

**Checkpoint**: The whole suite is green with the new package in place.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T019 Re-read the traceability comments: each of the six mapped tests carries `# Implements TC-COMP-nnn`, each additional test cites its AC or DEC in its docstring; confirm `git diff --stat` touches only the files named in this plan (all new, plus nothing in `tests/conftest.py`, `pyproject.toml` or any delivered test)
- [ ] T020 After each TDD cycle in T003-T018 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S2-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S1 | hard | Existing graph edge. Creates the four classification tables the engine writes and the `classification/sql/*.sql` package-data glob T012 checks (T001) |
| CAP-002-E1-S1 | context | Transitive through S1 (`0005` precedes `0006`); this plan imports nothing from the universe package |
| CAP-002-E2-S3 | reverse | Appends the input stage to `_STAGES`, reuses `constants.py`, `line_items.py` and `UNRESOLVED_CAUSE`; asserts the derived `missing` rows for TC-COMP-059 |
| CAP-002-E2-S4 | reverse | Appends the momentum stage to `_STAGES` and uses `BuildContext` |
| CAP-002-E2-S5 | reverse | Appends the peer-set and classification stages; fills `qualified_counts` |
| CAP-002-E2-S6 | reverse | Marks restatement inside the stages S3 and S5 add; no S2 code is consumed except the seam |
| CAP-002-E2-S9 | reverse | The scheduler loop calls `engine.build` and warns using `line_items.unresolved()` |
| CAP-002-E2-S7 | reverse | The 3000-instrument volume test (AC-11) builds through `engine.build` and the stages; this story supplies only the timeout bound |
| CAP-002-E2-S8 | context | The scheduler's qualifying-run read creates the `building` set this build receives; no S2 code imports it and it imports only `build` |

### Task Dependencies
- T001: No dependencies
- T002: Depends on T001
- T003: Depends on T001
- T004: Depends on T003; can run in parallel with T006's file creation
- T005: Depends on T004
- T006 -> T007 -> T008 -> T009: sequential, same file `tests/integration/test_engine_transaction.py`; T006 depends on T003
- T010, T011, T012: Depend on T001 only, can run in parallel with every other test task (different files)
- T013, T014, T015: Independent files, can run in parallel once their tests exist
- T016: Depends on T011
- T017: Depends on T013, T014, T015, T016
- T018: Depends on T017
- T019: Depends on T018
- T020: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: T004/T005, the T006-T009 chain, T010, T011 and T012 touch different files and can run in parallel
- Phase 3: T013, T014 and T015 can run in parallel

---

## Validation Plan

### Constitution-Defined Commands
- Build: `uv build`
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (also `uv run pytest` for the full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- DAC-E2-S2-1 / DAC-E2-10: a failure after rows are written leaves zero rows in all four tables and a `failed` set with the exception class (T006)
- DAC-E2-S2-2: an already-failed set is neither completed nor overwritten; nothing is written (T007)
- DAC-E2-S2-3 / AC-11: a 1 ms timeout yields `failed` with `QueryCanceled` and a timeout message, no rows (T008)
- DAC-E2-S2-4 / DAC-E2-9: the context reads active-only latest trading day and both rosters from the build's own snapshot (T005, T009b)
- DAC-E2-S2-5: all seven keys unresolved today; the strict xfail flips to a suite failure the day the owner resolves them (T011)
- DAC-E2-S2-6 / AC-19: no ingestion import, no interpolated SQL, no mutation of observation or history tables, only the two guarded `UPDATE classification_set` (T010)

---

## Notes

### Resolved Conflicts

- **The interface says `build` never raises; the story and TC-COMP-167 say it raises inside the transaction.** Factor-engine 2.3 (`build` "returns the terminal state and never raises for a build failure") and DAC-E2-S2-2 / TC-COMP-167 ("`build` raises inside the transaction, rolls back and writes nothing") describe different boundaries of one function. Governing rule: the story AC outranks the design, and the two read together without contradiction: `complete_set.sql` matching no row raises *inside* the transaction (T017 step 6), the `except` rolls back, and the caller receives `BuildResult(state="failed")`. T007 asserts both halves. Established by: DAC-E2-S2-2 and factor-engine 2.3 steps 8 and the failure paragraph. No design change needed.
- **TC-COMP-059 is mapped to this story but asserts S3's behaviour.** The test case's steps are "inputs are derived", and there is no input stage until CAP-002-E2-S3. Governing rule: dependency order (S3 is the producer of the derived rows). This story ships what it owns: the `LINE_ITEMS` contract, `UNRESOLVED_CAUSE` and the test that fails until the keys are resolved (T011). The assertion that value and growth inputs are `missing` with `detail.cause = line_item_mapping_unresolved` while momentum still classifies must be written in S3's `tests/integration/test_engine_inputs_fundamentals.py`, which design section 7 already lists for the "Unresolved line items" row. The next planner of S3 should carry TC-COMP-059 as shared with this story. The coverage matrix needs no change.
- **TC-INT-052** (completing a no-longer-building set changes nothing) is an integration-scope case; it is covered at the component level by T007 and left to Phase 6b automation.
- **Story status not changed.** The skill asks for the story's `status` to move from `todo` to `planning`; the story is approved and any edit invalidates the approval, so the frontmatter is left as it is (constraint 7).

### Open Gaps

- **Isolation level of the build transaction. PROVISIONAL — awaiting owner confirmation (2026-10-17).** No artifact names it. Derivation: DAC-E2-9 requires inputs "as they existed when that set's build transaction ran", which is false across statements under PostgreSQL's default `READ COMMITTED` if acquisition commits mid-build; `REPEATABLE READ` is the weakest level that fixes one snapshot. Consequence: a concurrent writer that changes the *set row itself* makes the guarded update raise a serialization failure rather than match zero rows; the end state is identical (T007b). Recorded as DEC-0111. Owning design: factor-engine 2.3 step 1, to say so at its next revision.
- **How a stage plugs in, and the `BuildContext` shape. PROVISIONAL — awaiting owner confirmation (2026-10-17).** The story says stages are added by S3 to S6 and requires a failure injected "after inputs are written" before any stage exists, but no artifact fixes the seam. Derivation: a module-level ordered `_STAGES` list, empty here, with a frozen `BuildContext` built from `set_context.sql`'s columns; `INPUT_NAMES` is a dict keyed by factor, taken from the `factor_input_name_matches_factor` CHECK. Recorded as DEC-0112. Owning design: factor-engine 2.1 and 2.3, at its next revision. S3 to S6 planners must append to `_STAGES` rather than edit `build`.
- **`test_line_items_resolved.py` shape. PROVISIONAL — awaiting owner confirmation (2026-10-17).** The story says the test "fails until every key is resolved"; shipping a plain failing test leaves every gate red until an open owner question is answered. Derivation: `xfail(strict=True)` preserves the property (cannot be forgotten, fails the suite the day the keys are resolved, until the marker is removed) without a red baseline. Recorded as DEC-0113. Owning artifact: story S2 DAC-E2-S2-5 and TC-COMP-059 wording, at the next revision.
- **A build with no price data for any active stock. PROVISIONAL — awaiting owner confirmation (2026-10-17).** `latest_trading_day` is NULL, which `classification_set_complete_is_sized` refuses to complete. No artifact says what the set shows. Derivation: AC-20 allows only complete or failed with a reason, so the set is `failed` with the reason `ValueError: no price data held for any active instrument` rather than a constraint error. Recorded as DEC-0114. Owning design: factor-engine 2.3, at its next revision.
- **Payload keys for the seven line items remain an owner question** (system design section 8 question 1, factor-engine section 14 question 1). Not resolved here and not invented: every key stays `REQUIRES_INPUT`. It blocks S3's real-data verification, not this story.
- **Build timeout default (300 s) and the range of `timeout_seconds`.** The default lives in the scheduler (DEC-0067); `build` only requires a positive number and rounds up to whole milliseconds, because `statement_timeout = 0` disables the timeout. That rounding is the minimal reading of "0.001 seconds", not a new bound.

### Other Notes

- Stories CAP-002-E1-S1, CAP-002-E2-S4, CAP-002-E2-S5, CAP-002-E2-S6 and CAP-002-E2-S9 are classified in the table above; none is a new hard edge.
- Nothing in this plan edits an approved artifact, a delivered test, `tests/conftest.py`, `pyproject.toml` or `src/factorflow/db/migrations/README.md` (S1 owns those).
- `dependencies.yaml` already lists `CAP-002-E2-S2: [CAP-002-E2-S1]`; planning found no new hard edge and made no change to it.
- `engine.py` logs through `logging.getLogger(__name__)` with `set_id` in `extra`, the pattern in `src/factorflow/ingestion/runner.py`.
- Under a driver that commits once per stage, the TDD-evidence file records `commit_hash: stage` (T020).
