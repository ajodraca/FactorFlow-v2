---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S7-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-18
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-10-17T22:40:00Z
  source_artifacts:
    - id: CAP-002-E2-S7
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S7 — Whole-Build Proof: No Backdating and the 3000-Instrument Volume Test

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S7.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-tasks`
**Date**: 2026-10-17

## Summary

Proves the two promises the finished engine makes about a whole build, and one clause of TC-COMP-059, with tests only. First, the volume test `tests/integration/test_engine_volume.py` (`slow` and `postgres` markers): 3000 active instruments with 273 bars and 8 quarters each, built through the real registered stages (fundamentals, momentum, classification), must return `complete` inside 295 seconds of wall-clock time, writing 24,000 `factor_input` rows and 9,000 `factor_classification` rows (TC-COMP-091). Second, the no-backdating case appended to `tests/integration/test_engine_transaction.py`: after a set completes, a backfilled statement is inserted, every row of that set (set row, set-factor rows, inputs, classifications) is byte-for-byte unchanged, and the next set sees the statement with `known_on` equal to the date it was recorded (TC-COMP-162). Third, one end-to-end case appended to CAP-002-E2-S3's `tests/integration/test_engine_inputs_fundamentals.py` (T014) builds 40 stocks through the real stages with the real, unresolved `LINE_ITEMS` and asserts value and growth inputs `missing` with `detail.cause = line_item_mapping_unresolved` while momentum is still ranked and classified and the set is `complete`: the "momentum still classifies" clause of TC-COMP-059, shared with CAP-002-E2-S2. A shared support module builds the populations with set-based SQL. There is no production code in this plan; the only source edits allowed are result-preserving tuning of the SQL files S3 to S6 own, and only if the volume test shows the budget missed (T009).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-11 | 3000 stocks up to date within 5 minutes of the run ending | T002, T003, T006, T007, T008, T009, T011 |
| AC-19 | Earlier-period data changes no recorded classification and never makes one appear known earlier | T002, T004, T005, T011 |
| DAC-E2-5 | 3000-instrument build within the AC-11 budget less one poll interval, proved by a `slow` test | T002, T003, T006, T007, T008, T009, T011 |
| DAC-E2-9 | Inputs selected as they existed when the build transaction ran; later fundamental or price alters no row | T002, T004, T005, T011 |
| DAC-E2-S7-1 | 3000 instruments: `build` completes within 295 s, 24,000 inputs, 9,000 classifications | T002, T003, T006, T007, T008, T009 |
| DAC-E2-S7-2 | Completed set, backfilled statement inserted afterwards: every row unchanged, next set sees it | T002, T004, T005 |
| DAC-E2-S2-5 | CAP-002-E2-S2's criterion, end-to-end clause carried here: an unresolved `LINE_ITEMS` key gives `missing` inputs with the cause and momentum still classifies (TC-COMP-059) | T014 |

## Phase 1: Setup

**Purpose**: Confirm every prerequisite stage exists, learn the helper names, and build the shared populations.

- [x] T001 Confirm CAP-002-E2-S3, S4, S5 and S6 have landed on the working branch, and that S2 (transitive) has: `src/factorflow/classification/engine.py` registers `_fundamental_inputs_stage`, `_momentum_inputs_stage` and `_classification_stage` in `_STAGES`, in that order with the classification stage last (DEC-0121); `sql/statements.sql`, `value_inputs.sql`, `growth_inputs.sql`, `momentum_inputs.sql`, `insert_inputs.sql`, `peer_sets.sql`, `classify.sql` exist; `classify.sql` and the two input files write `restated_possible` from `bool_or` (S6, not the constant `false`); `tests/integration/engine_support.py`, `engine_inputs_support.py`, `test_engine_transaction.py` and `test_engine_inputs_fundamentals.py` exist. If any is absent STOP and report which hard dependency is not implemented. Then read, before writing anything: (1) the exact signatures of `migrate_through_classification`, `add_instrument`, `add_run`, `add_building_set`, `count_classification_rows` (S2), `TEST_KEYS`, `install_test_line_items`, `add_statement`, `add_quarters`, `inputs_for` (S3), and the module-local fixtures and imports at the top of `test_engine_transaction.py` and `test_engine_inputs_fundamentals.py`; (2) `constants.py` for how the engine reads `MIN_PEER_SET_SIZE` (the plan uses the real value 30, never patches it); (3) the S3, S4 and S5 commit messages for the `EXPLAIN (ANALYZE, BUFFERS)` timings their plans (S3 T022, S4 T014, S5 T019) record as signals for this story; (4) the DDL of `instrument`, `daily_bar`, `fundamental_observation` and `corporate_action` in `0001_extensions_owner_state.sql` and `0002_observations.sql` (`value_hash` is a NOT NULL 32-byte `bytea`; `observed_on` is a `date`)
- [x] T002 Create `tests/integration/engine_proof_support.py` (a plain module, not `conftest.py`; imports from `tests.integration.engine_support` and `engine_inputs_support` and edits neither). No pytest fixtures; every committing helper commits. Contents:
  - `volume_sessions(last_session: date, count: int = 273) -> list[date]`: all weekdays from the weekday on or before `last_session - 13 months - 7 days` through `last_session`, then drop evenly spaced interior weekdays (never the first or the last) until exactly `count` remain, standing in for market holidays; assert the oldest session is on or before `last_session - 1 month - 12 months` so the 12-month momentum window has its start bar. 273 consecutive weekdays would span only about 12.6 months and leave `return_12m` `missing`, which is why the generator exists.
  - `populate_volume(conn, n: int = 3000, *, last_session: date) -> tuple[list[int], date]`: set-based `INSERT ... SELECT ... generate_series` / `unnest` statements (the precedent is `tests/integration/test_coverage_volume.py`), never a Python loop per row, never string-interpolated values (pass dates, keys and counts as bound parameters). It inserts: `n` active instruments (`symbol` `V00001` and up); one `daily_bar` per instrument per session with `observed_on = session_date`, `value_hash = sha256(convert_to(instrument_id::text || session_date::text, 'UTF8'))` and a positive close that varies by instrument and by session (for example `20 + (id % 37) + ((id * 7 + ord * (id % 11 + 1)) % 29) / 10.0`) so no two stocks share a return; eight consecutive quarterly period ends for each of `balance_sheet`, `income_statement` and `cash_flow_statement` (newest period end the last quarter end on or before `last_session`, `fiscal_period` `Q1` to `Q4`, never `FY`), `observed_on` and `provider_filing_date` both equal to `last_session - 30 days` so nothing is backfilled, payloads keyed by `TEST_KEYS` (passed as parameters to `jsonb_build_object`) holding JSON **numbers** (not strings, see Notes), positive values that vary by stock and quarter, a positive prior-year base, positive shares and an outflow-negative `capital_expenditure` as S3's test line items expect; 3,000 cash dividends (`payload {"cash_amount": "0.25"}` as a JSON string, the stored form S4's DEC-0117 accepts, one per instrument at a session inside the momentum window) and 300 splits (every tenth instrument, `{"split_from": "1", "split_to": "2"}`, inside the window); then `ANALYZE` on `daily_bar`, `fundamental_observation`, `corporate_action` and `instrument` (DEC-0123). Returns the instrument ids and the classification date, which is `last_session`.
  - `_insert_bar(conn, instrument_id, session_date, close, observed_on) -> None` (module-private): one `INSERT INTO daily_bar` with every value a bound parameter (no string interpolation). It writes the columns the `daily_bar` DDL read in T001 (4) requires. `observed_on` is always passed by the caller and has no default. `value_hash` is a SHA-256 (32 bytes) computed over the instrument id, session date, close and `observed_on`, so a revised close for the same session is a distinct row. Commits. S2's `add_bar` is not used anywhere in this plan: it pins no `observed_on` (register correction from u004).
  - `populate_backdating(conn, *, classification_date: date) -> BackdatingPopulation`: 31 active instruments with distinct per-stock values and one bar on `classification_date` each, written by `_insert_bar` with `observed_on = classification_date` (so set 1's value inputs have `known_on = classification_date`, earlier than the backfill's `observed_on`), eight quarters of the three statement types for 30 of them and **seven** for the last (stock `A`: missing its oldest income-statement quarter, so its growth inputs are `missing`), all statement rows `observed_on = provider_filing_date = classification_date - 30 days`. Returns a dataclass with `instrument_ids`, `a_id`, `missing_period_end` (the quarter A lacks), `first_observed_on` and `other_id` (a stock used by the price case). The 30 others make the growth peer set exactly the floor of 30 in set 1 and 31 in set 2, so the real `MIN_PEER_SET_SIZE` is used.
  - `backfill_statement(conn, pop) -> date`: inserts A's missing oldest income-statement quarter with `observed_on = classification_date + 1 day`, `provider_filing_date = pop.first_observed_on - 60 days` (earlier than A's first fundamentals `observed_on`, so backfilled under DEC-0056) and positive revenue and diluted EPS; returns its `observed_on`.
  - `revise_close(conn, instrument_id, session_date, new_close, observed_on) -> None`: inserts a second `daily_bar` row for an existing session through `_insert_bar`, with a different close and therefore a different `value_hash`. The caller passes an `observed_on` later than every statement `observed_on` (`classification_date - 30 days`) and every bar `observed_on` (`classification_date`) in the backdating population. The revision is then that session's latest row, the one the engine reads (latest session, then latest `observed_on`, DEC-0117 (1)). T005(a) passes `classification_date + 1 day`.
  - `snapshot_set(conn, set_id) -> dict[str, list[tuple]]`: `SELECT *` of the `classification_set` row, and every row of `classification_set_factor`, `factor_input` and `factor_classification` for the set, each ordered by its primary key, all columns, for exact comparison.
  - `complete_and_open_next(conn, classification_date) -> UUID`: adds a terminal run and a `building` set (S2 `add_run`, `add_building_set`) and returns the set id. (depends on T001)

**Checkpoint**: Every hard prerequisite exists and the support module imports.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the tests that prove the whole build. They exercise behaviour S3 to S6 already implement, so they are characterisation tests: the RED evidence for each is a recorded falsification run (T013), not a missing production file.

Database tests are marked `@pytest.mark.postgres`; the volume test also `@pytest.mark.slow` (the marker is declared in `pyproject.toml`, which this plan does not edit). Each mapped test carries `# Implements TC-COMP-nnn`; each additional test cites its AC or DEC in its docstring. No test in this plan patches `engine._STAGES` or `constants.MIN_PEER_SET_SIZE`: the point is the real stages and the real floor. The volume, no-backdating and population tests (T003 to T006) call `install_test_line_items(monkeypatch)`, because the owner's payload keys remain unresolved; T014 alone deliberately does not, because it proves what a build does while they are unresolved (TC-COMP-059).

### Mandatory Component Tests

- [x] T003 Create `tests/integration/test_engine_volume.py` and implement TC-COMP-091 (3000 instruments build within 295 s with expected row counts), `@pytest.mark.slow` and `@pytest.mark.postgres`. Module-local fixture: migrate with `migrate_through_classification`, `populate_volume(conn, 3000, last_session=<fixed date>)` and one terminal run and `building` set whose `classification_date` is that last session. Constants at module top: `BUDGET_SECONDS = 295  # DAC-E2-5: AC-11's 300 s less one 5 s poll interval (DEC-0054)` and `TIMEOUT_SECONDS = 300.0  # scheduler default, DEC-0067`. The test installs the test line items, takes `time.perf_counter()` immediately before and after the one `engine.build(conn, set_id, TIMEOUT_SECONDS)` call (fixture load and `ANALYZE` excluded, because `statement_timeout` is per statement and cannot bound a whole build), and asserts: `result.state == "complete"` and `result.failure_reason is None`; elapsed `<= BUDGET_SECONDS`; `count_classification_rows` gives 24,000 `factor_input` rows (3000 x 8), 9,000 `factor_classification` rows (3000 x 3), 3 `classification_set_factor` rows; every factor is ranked with `qualified_counts == {"value": 3000, "growth": 3000, "momentum": 3000}`; all 9,000 classification rows are `classified` (so the heaviest path ran, not a fast path of `missing` rows); the set row is `complete` with `active_instruments = 3000`. Print the elapsed time (`-s` or `capsys`-independent: use `print`, as `test_runner_volume.py` records its diagnostic) so the coder can report it (DAC-E2-S7-1, DAC-E2-5, AC-11, DEC-0123) (depends on T002)
- [x] T004 Implement TC-COMP-162 (Backfill after completion leaves the set unchanged) by appending one test to `tests/integration/test_engine_transaction.py` (S2's file; the story names it; no existing test or helper in the file is changed): `populate_backdating`, install test line items, build **set 1** with the real stages, assert `complete` and take `snapshot_set(set_1)`. Preconditions asserted: A's growth inputs are `missing` (`detail.periods_found` lists seven periods), A's `growth` classification is `not_classified` with `reason_code = 'input_missing'`, `growth` `qualified_count` is 30 and `ranked`. Then `backfill_statement`, assert the new row's `recorded_at` is later than set 1's `ended_at` (the insert really happened after completion). Assert `snapshot_set(set_1)` is identical to the first snapshot. Open run 2 and **set 2** (`classification_date` one day later, the backfill's `observed_on`), build it with the real stages, then assert: A's `growth` inputs in set 2 are `present`, `restated_possible` is true, `known_on` equals the backfill's `observed_on` and is not earlier than it nor equal to the filing date or the period end; A's `growth` classification in set 2 is `classified` with `restated_possible` true; `growth` `qualified_count` is 31; no `known_on` in set 1 is on or after the backfill's `observed_on`; and `snapshot_set(set_1)` is still identical to the first snapshot after set 2 completed (DAC-E2-S7-2, DAC-E2-9, AC-19, DEC-0124) (depends on T002)

### Additional Unit Tests

- [x] T005 Add to `tests/integration/test_engine_transaction.py` (same file, not parallel with T004) the cases no mapped TC names: (a) price revision: build set 1 over the backdating population, `snapshot_set`, `revise_close` for `other_id`'s latest session (`classification_date`) with a different close and `observed_on = classification_date + 1 day`, later than every statement and bar `observed_on` in the population, assert set 1 is unchanged, open set 2 with `complete_and_open_next(conn, classification_date + 1 day)` as in T004, build it and assert `other_id`'s `book_to_price` value (market capitalisation uses the latest observed close) differs from set 1's while its `known_on` is the revision's `observed_on` (DAC-E2-9 names "a fundamental or price", AC-19); (b) control: a population where the same backfilled statement is inserted **before** set 1 is built yields A's growth inputs `present` in set 1, so the before/after comparison in T004 is shown able to fail and the `missing` precondition there is not an artefact of the fixture (AC-19) (depends on T004)
- [x] T006 [P] Create `tests/integration/test_engine_volume_population.py` (`postgres`, not `slow`): `populate_volume(conn, 40, last_session=...)` then one real build with the test line items. Assert `volume_sessions` returns exactly 273 distinct weekdays, ascending, last equal to `last_session`, oldest on or before `last_session - 13 months`; the build is `complete`, `factor_input` holds 40 x 8 rows all `present`, `factor_classification` holds 40 x 3 rows all `classified`, and each instrument has the 273 bars, 24 statement rows and the dividend. This proves the 3000-row fixture is not degenerate (a population whose inputs are `missing` would pass the time budget by doing less work) at a cost of seconds, and runs in the normal suite (DAC-E2-S7-1, DEC-0123) (depends on T002)
- [x] T007 [P] Create `tests/unit/test_engine_volume_static.py` (no database): parse `tests/integration/test_engine_volume.py` with `ast` and assert the volume test function is marked both `slow` and `postgres`, the literal `295` and `300.0` appear exactly once each as the named constants, the module calls `engine.build` exactly once, and it contains no assignment to `_STAGES` and no reference to `MIN_PEER_SET_SIZE` (a patched stage list or floor would defeat the proof). Include a negative case on an inline source string proving each rule can fail (DAC-E2-5) (depends on T003)
- [x] T014 [P] Append one test, `test_unresolved_line_items_still_classify_momentum`, to `tests/integration/test_engine_inputs_fundamentals.py`. The file is CAP-002-E2-S3's; factor-engine section 7 row "Unresolved line items" names it for this check, and no existing test or fixture in it changes. The test is marked `@pytest.mark.postgres` and has no `# Implements` tag, because the tag stays on CAP-002-E2-S2 T011. Its docstring cites TC-COMP-059 (the end-to-end "momentum still classifies" clause, shared with CAP-002-E2-S2), DAC-E2-S2-5, factor-engine section 8 acceptance criterion 13 and section 7 row "Unresolved line items".
  Imports: add `populate_volume` and `complete_and_open_next` from `tests.integration.engine_proof_support` to the module's import block. Also add any of `migrate_through_classification` (`tests.integration.engine_support`), `inputs_for` (`tests.integration.engine_inputs_support`), `engine` and `line_items` (`factorflow.classification`) that the module does not already import. Ruff's import sorting may merge them into existing import statements. Apart from the import block, no existing line of the file changes, and the test goes at the end of the module.
  Setup: do not request S3's module-local fixture; its roster (the instrument under test plus one extra active stock) would change the counts and the latest trading day. Instead:
  - request the delivered `postgres_connection_string` fixture that S3's fixture is built on (S2 T003);
  - call `migrate_through_classification(postgres_connection_string)`;
  - open and close a connection of its own, the way the module-local fixture does;
  - call `ids, classification_date = populate_volume(conn, 40, last_session=<a fixed weekday date literal, as T003 and T006 use>)`. This gives 273 bars per stock, so all three momentum windows resolve, and eight quarters keyed by `TEST_KEYS`, which the real mapping never reads;
  - call `set_id = complete_and_open_next(conn, classification_date)`.
  It does not call `install_test_line_items` or S3's `run_fundamentals_stage` (which narrows `_STAGES`), and it patches neither `engine._STAGES` nor `constants.MIN_PEER_SET_SIZE`.
  Precondition: `line_items.unresolved()` names all seven line items.
  Then call `result = engine.build(conn, set_id, 60)` and assert:
  (a) `result.state == "complete"`, `result.failure_reason is None` and `result.qualified_counts == {"value": 0, "growth": 0, "momentum": 40}`; the set row is `complete` with `active_instruments = 40`.
  (b) For every id in `ids`, `inputs_for` gives the five value and growth inputs (`book_to_price`, `earnings_yield`, `fcf_yield`, `revenue_growth`, `eps_growth`) `missing` with `detail["cause"] == "line_item_mapping_unresolved"`, and the three momentum inputs `present`.
  (c) `classification_set_factor` for the set has `momentum` with `ranked = true` and `qualified_count = 40`, and has `value` and `growth` with `ranked = false` and `qualified_count = 0`.
  (d) All 40 `momentum` rows of `factor_classification` are `classified`, each with a non-null `score` and `percentile`.
  (e) All 40 `value` rows and all 40 `growth` rows are `not_classified` with `reason_code = 'not_enough_stocks'`, `reason_input` null, `reason_detail = '0 of 30 stocks qualified'` and no score.
  Do not assert `input_missing` on classification rows. An unranked factor's reason wins (factor-engine 2.5; CAP-002-E2-S5 T006 and T010 (h)), and `factor_classification` has no `detail` column, so the cause is asserted on `factor_input` only. Traces to DAC-E2-S2-5, AC-7, AC-12 and AC-14. (depends on T002)

**Checkpoint**: All tests are written. The unit and population tests and T014 pass against the finished stages; the volume test and TC-COMP-162 are expected to pass on first run if S3 to S6 are correct, and a failure is a finding (T008, T009), not an expected RED.

---

## Phase 3: Core Implementation

**Purpose**: Run the proof and, only if it fails the budget, tune SQL. This story adds no production code.

- [x] T008 Run `uv run pytest -m slow tests/integration/test_engine_volume.py -s` and record the elapsed time of the build and each statement's contribution if the stage files log it. If it passes within 295 s, no source file changes in this phase and T009 is skipped; say so in the commit message together with the elapsed time. If it fails on the row counts or a state other than `complete`, the cause is a defect in a stage that S3 to S6 delivered: STOP and report it with the failure reason instead of patching around it (depends on T003, T006)
- [x] T009 Only when T008 shows the budget missed: profile with `EXPLAIN (ANALYZE, BUFFERS)` on the statement(s) the T008 breakdown and the S3 T022, S4 T014 and S5 T019 signals point at, then tune in the files the story names (`src/factorflow/classification/sql/statements.sql`, `value_inputs.sql`, `growth_inputs.sql`, `momentum_inputs.sql`, `insert_inputs.sql`, `peer_sets.sql`, `classify.sql`) by single-statement rewrites inside each existing file only: rewriting a query, reordering CTEs, adding a `MATERIALIZED` or `NOT MATERIALIZED` hint to a CTE, or precomputing more of an intermediate result inside the existing `CREATE TEMP TABLE stmt ON COMMIT DROP AS SELECT` statement of `statements.sql`. Every file stays exactly one statement, run only by the existing parameterised execute call(s) of its stage, each of which runs that one statement (`classify.sql` once per factor, CAP-002-E2-S5 T016; `insert_inputs.sql` once by each of the S3 and S4 stages, DEC-0115). The S3, S4 and S5 plans pin one statement per file, and psycopg 3 refuses several commands in one execute when parameters are bound. Add no SQL file and no execute call, and do not change the column list of the `inputs` temporary table (DEC-0115; `growth_inputs.sql` and S4's `momentum_inputs.sql` insert into it). A tuning edit must keep every output row identical: the delivered tests of S3 to S6 (T010) pass unedited, and the statements stay parameterised and free of `||`, `{}` and `format()` (S2's safety test). Do not add a migration or an index on a permanent table (migration 0006 is pinned by research-store 2.4; a new permanent index is a new migration, which is outside "tests only plus SQL tuning"). Do not raise the budget, drop work from the fixture, edit `_STAGES` or `engine.py`, or cap the population. If the budget is still missed after tuning, or the only remaining lever is a permanent index or a lever that needs a second statement (a new temporary table, a temporary-table index, an `ANALYZE` of a temporary table, a new SQL file or a new execute call in `engine.py`), STOP and report the measurements to the owner (depends on T008)
- [x] T010 If T009 ran: re-run every delivered test of S3 to S6 unedited (`tests/integration/test_engine_inputs_fundamentals.py`, `test_engine_inputs_momentum.py`, `test_engine_currency.py`, `test_engine_peer_set.py`, `test_engine_restatement.py`, `tests/unit/test_composite_arithmetic.py`, `test_classify_sql_static.py`, `test_restatement_sql_static.py`, `test_engine_sql_safety.py`, `test_classification_sql_ships.py`) and then T003 and T004 again (depends on T009)

**Checkpoint**: The volume test passes within 295 s on the real stages, with no change to any file, or with result-preserving SQL tuning only.

---

## Phase 4: Integration

**Purpose**: Confirm the new tests fit the repository's gates.

- [x] T011 Run every command in the Validation Plan from the repository root and fix failures in files this plan names; a failure in any other file is reported, not patched. Confirm `uv run pytest -m postgres` still passes with the volume test included (it carries both markers) and that the default `uv run pytest -m 'not postgres'` run stays fast: the volume population is built only inside the `slow` test's fixture, never at import (depends on T008, T010, T014)

**Checkpoint**: The whole suite is green with the proof in place.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [x] T012 Re-read traceability: `# Implements TC-COMP-091` above the volume test, `# Implements TC-COMP-162` above the appended test, each additional test cites its AC or DEC in its docstring; T014's test carries no `# Implements` tag and cites TC-COMP-059, DAC-E2-S2-5 and factor-engine section 8 acceptance criterion 13 in its docstring; confirm `git diff --stat` touches only the files named in this plan: new `engine_proof_support.py`, `test_engine_volume.py`, `test_engine_volume_population.py`, `test_engine_volume_static.py`, the one appended region of `test_engine_transaction.py`, the import-block additions and the one appended test (T014) of `test_engine_inputs_fundamentals.py`, and, only if T009 ran, the named SQL files; nothing in `tests/conftest.py`, `pyproject.toml`, any other delivered test or helper from S2 to S6 (and no existing test or fixture in the two appended files), `engine.py`, `constants.py` or a migration (depends on T011)
- [x] T013 After each TDD cycle in T003-T011 and T014 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S7-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC). RED evidence for a cycle whose behaviour already exists is a falsification run recorded in the entry: for T003 temporarily set `BUDGET_SECONDS` to 1 and show the test fails; for T004 and T005 temporarily move `backfill_statement` ahead of the set-1 build and show the unchanged-set assertion fails; for T006 temporarily drop one quarter of the population and show an input turn `missing`; for T014 temporarily pass 29 instead of 40 to `populate_volume` and show the test fails because momentum is no longer ranked (29 is below the floor of 30), so the momentum count and ranking checks in (a) or (c) fail; each perturbation is reverted before the diff is staged. Never skip a cycle (INV-TDD-005 needs a human's acknowledgement, which planning cannot give)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S3 | hard | Existing graph edge. The tests build through `_fundamental_inputs_stage` and import `TEST_KEYS`, `install_test_line_items`, `add_statement`, `add_quarters`, `inputs_for` from `engine_inputs_support.py` (T001, T002) |
| CAP-002-E2-S4 | hard | Existing graph edge. The volume build runs `_momentum_inputs_stage` over 273 bars per instrument (T003) |
| CAP-002-E2-S5 | hard | Existing graph edge. The tests build through `_classification_stage`, `peer_sets.sql` and `classify.sql` (T003, T004) |
| CAP-002-E2-S6 | hard | Existing graph edge. The rows written carry the restatement mark T004 asserts on A's growth rows |
| CAP-002-E2-S2 | hard | New graph edge added by this plan (`dependencies.yaml` entry for S7). S7 imports the `engine_support.py` helpers and appends one test to S2's `test_engine_transaction.py` (T001, T004); the file must exist, so the dependency is direct, not only transitive through S3 and S5 |
| CAP-002-E2-S1 | context | Transitive: the four classification tables the snapshots read. `classification_set_factor`, `factor_input` and `factor_classification` are kept append-only by research-store 2.5 (no `UPDATE` or `DELETE` is written; static guard `tests/unit/test_research_sql_is_append_only.py`, extended by CAP-002-E2-S1 T012), and `classification_set` takes only the `state = 'building'`-guarded `UPDATE` that guard checks; migration `0006` has no trigger |
| CAP-002-E1-S1 | context | Transitive through S1: the migration chain `migrate_through_classification` applies |
| CAP-002-E2-S8 | context | Creates the `building` set a build receives; these tests create sets through the S2 helper |
| CAP-002-E2-S9 | context | The scheduler calls `build` and supplies the 5 s poll interval (DEC-0054) the 295 s budget subtracts; this story imports no scheduler code and takes the number from DAC-E2-5 |

### Task Dependencies

- T001: No dependencies
- T002: Depends on T001
- T003: Depends on T002; different file from T004, T006, T007
- T004 -> T005: sequential, same file `tests/integration/test_engine_transaction.py`; T004 depends on T002
- T006: Depends on T002 only (different file)
- T007: Depends on T003 (parses its source)
- T014: Depends on T002 only (uses `populate_volume` and `complete_and_open_next`); appends to S3's `test_engine_inputs_fundamentals.py`, a different file from T003-T007
- T008: Depends on T003 and T006
- T009: Depends on T008 and runs only if the budget is missed
- T010: Depends on T009 (skipped when T009 is)
- T011: Depends on T008, T010 and T014
- T012: Depends on T011
- T013: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- Phase 2: T003, the T004-T005 chain, T006, T007 and T014 touch different files and can run in parallel once T002 exists
- Phase 3 and later are sequential; the volume run (minutes) should not share a container run with other slow tests

---

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest -m slow`, `uv run pytest -m postgres`, `uv run pytest -m 'not postgres'` (also `uv run pytest` for the full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- DAC-E2-S7-1 / DAC-E2-5 / AC-11: the build of 3000 instruments is `complete`, took at most 295 s of wall-clock time, wrote 24,000 inputs and 9,000 classified rows (T003, T006, T008)
- DAC-E2-S7-2 / DAC-E2-9 / AC-19: all four tables of a completed set are identical after a backfilled statement, after a revised price and after a second set completes; the second set shows the statement with the right `known_on` and mark (T004, T005)
- DAC-E2-S2-5 (CAP-002-E2-S2's, end-to-end clause) / TC-COMP-059: with the real, unresolved `LINE_ITEMS`, value and growth inputs are `missing` with `line_item_mapping_unresolved`; momentum is ranked and all 40 stocks are `classified` on it; value and growth are unranked with `0 of 30 stocks qualified`; the set is `complete` (T014)

---

## Notes

### Resolved Conflicts

- **The register, S2, S3 and S6 plans cite DEC-0064 for "delivered test files are not edited".** DEC-0064 (and DEC-0084, DEC-0110) concern files of the delivered CAP-001 code (composition roots, four navigation tests, migration-inventory tests); none of them forbids one CAP-002 story from adding a case to a file another CAP-002 story creates. The story and factor-engine section 2.1 both place the no-backdating case in `tests/integration/test_engine_transaction.py`. Governing rule: the story Description and the design agree, and no decision contradicts them, so T004 appends one test there without changing any existing line. The other plans' "new modules only" is stricter than required and is not wrong for them. Established by: story S7 Description, factor-engine 2.1 and 7, DEC-0064/0084/0110 scope. No design change needed.
- **Factor-engine 7 describes the volume budget as "within the budget less the poll interval" and "asserts the build, not the budget"; DAC-E2-S7-1 and TC-COMP-091 say 295 seconds.** Both read together without contradiction: 295 = 300 less one 5 s poll (DEC-0054), and the test asserts the build alone. Established by DAC-E2-5, TC-COMP-091, factor-engine 5. No design change needed.
- **Story status not changed.** The skill asks for `status` to move from `todo` to `planning`; the story is approved and any edit invalidates the approval, so the frontmatter is left as it is (constraint 7), as in the S2 to S6 plans.

### Open Gaps

- **Volume test shape. PROVISIONAL — awaiting owner confirmation (2026-10-17).** No artifact fixes the corporate-action volume, which clock the 295 seconds covers, the timeout handed to `build`, or the mix of input statuses. Derivation: design section 5 sizes the load (a few thousand corporate actions) and says the test asserts the build; `statement_timeout` is per statement, so only wall-clock time bounds the whole build; all-present inputs are the heaviest path; `ANALYZE` reproduces production planner statistics. Chosen: 3,000 dividends and 300 splits, `ANALYZE` after load, `timeout_seconds=300`, clock around the `build` call only, all eight inputs present. Recorded as DEC-0123 (`projects/factorflow-v2/decisions/DEC-0123.md`). Owning design: factor-engine section 7, at its next revision, to say what the volume population is.
- **No-backdating assertion shape. PROVISIONAL — awaiting owner confirmation (2026-10-17).** AC-19's second clause ("appear to have been known before the date it was produced") and "every row of that set" have no stated measure. Derivation: compare all four tables of the set column by column; make the backfilled statement fill a missing quarter so the next set visibly differs; assert `known_on` equals the statement's `observed_on`. Recorded as DEC-0124 (`projects/factorflow-v2/decisions/DEC-0124.md`). Owning design: factor-engine section 7 row "Later data changes nothing", at its next revision.
- **Payload value form: JSON numbers versus strings.** S3's DEC-0116 (4), amended in cross-plan review E2-F07, uses a line-item payload value that is a JSON number or a JSON string holding a plain decimal, through the same guard as S4's DEC-0117 (2). This plan writes JSON numbers, which pass that guard, so the volume test times the guarded path; S3's T012(b) covers the string form. The real payload keys stay the owner's question (system design section 8 question 1).
- **A permanent index is not available to this story.** If tuning shows a missing permanent index is the only way under 295 s, the story's "tests only, plus SQL tuning" does not cover a new migration, and research-store section 2.4 pins the DDL of 0006, so 0006 cannot gain the index either. T009 stops and reports instead of adding one. No artifact fixes what the owner would then choose, so no value is invented.
- **Payload keys for the seven line items remain the owner's question** (system design section 8 question 1, factor-engine section 14 question 1). The volume, no-backdating and population tests (T003 to T006) install S3's test keys. T014 alone runs with the real, unresolved mapping, to prove TC-COMP-059's "momentum still classifies" clause.
- Owner-directed fix (cross-plan review 2026-10-18, E2-F09): T014 appends one end-to-end case for TC-COMP-059's "momentum still classifies" clause (DAC-E2-S2-5, factor-engine section 8 acceptance criterion 13) to CAP-002-E2-S3's `tests/integration/test_engine_inputs_fundamentals.py`. It runs over a 40-stock `populate_volume` population with the real, unresolved `LINE_ITEMS`, the real `_STAGES` and the real `MIN_PEER_SET_SIZE`. It asserts momentum ranked and classified, and value and growth unranked with `0 of 30 stocks qualified`. — Derivation: CAP-002-E2-S2 hands the clause on. CAP-002-E2-S3 and CAP-002-E2-S4 cannot observe a classification, because their harnesses narrow `_STAGES`, and CAP-002-E2-S5 never reads `LINE_ITEMS`. This story is the only E2 story with hard edges on S3, S4 and S5. Factor-engine section 7 row "Unresolved line items" names the file. 40 is the size T006 already uses and clears the floor of 30, so momentum ranks. The value and growth reason is `not_enough_stocks`, not `input_missing`, because an unranked factor's reason wins (factor-engine 2.5, CAP-002-E2-S5 T006 and T010 (h)); `factor_classification` has no `detail` column, so the cause is asserted on `factor_input` only. The `# Implements TC-COMP-059` tag stays on CAP-002-E2-S2 T011 alone, because the coverage matrix maps the TC only to DAC-E2-S2-5; T014 cites the TC in its docstring. DEC-0064, DEC-0084 and DEC-0110 do not forbid the append (Resolved Conflicts, first bullet). The Open Gaps bullet on the seven line items' payload keys was amended for the same finding: only T003 to T006 install S3's test keys.
- **Owner-directed fix (cross-plan review 2026-10-18, E2-F16): the backdating bars carry a pinned `observed_on`.** Adopted:
  - `populate_backdating` writes each stock's one bar through the module-private `_insert_bar` with `observed_on = classification_date`, never through S2's `add_bar`.
  - `revise_close` writes through the same helper.
  - T005(a) passes the revision `observed_on = classification_date + 1 day` and opens set 2 at `classification_date + 1 day`.
  — Derivation:
  - S2 T003 says only that `add_bar` writes the `observed_on` column `daily_bar` requires, and pins no value (register correction u004: it takes no `observed_on`).
  - A value input's `known_on` is the maximum `observed_on` across its statement rows and the bar used (S3 T012 (i) and T018, DEC-0055 (7)). The bar used is the latest session's row with the latest `observed_on`, with no upper bound (S3 T018, DEC-0117 (1)).
  - So T004's "no `known_on` in set 1 is on or after the backfill's `observed_on`" and T005(a)'s "`known_on` is the revision's `observed_on`" hold only if the bar's `observed_on` is at or before `classification_date` and the revision's is later than every row in the population.
  - `observed_on` equal to the bar's session date follows `populate_volume`. `classification_date + 1 day` matches T004's backfill and set-2 date.
  - A local INSERT rather than S4's `add_bar_observed` keeps the helper beside `revise_close`, which already writes its own row, and adds no import.
- **Owner-directed fix (cross-plan review 2026-10-18, E2-F22): T009 tunes only by single-statement rewrites inside each existing SQL file. The permitted levers are query rewrites, CTE reordering, `MATERIALIZED` / `NOT MATERIALIZED` CTE hints, and more precomputation inside the existing `CREATE TEMP TABLE stmt ON COMMIT DROP AS SELECT` of `statements.sql`. A new temporary table, a temporary-table index, an `ANALYZE` of a temporary table, a new SQL file or a new execute call is a STOP-and-report case, like the permanent index** — The story limits this plan to "Tests only, plus SQL tuning in files owned by E2-S3 to E2-S6". The S3, S4 and S5 plans pin each of those files to one statement, which the stage functions in `engine.py` run with bound parameters, one statement per execute (`classify.sql` once per factor, `insert_inputs.sql` once by each of the S3 and S4 stages). psycopg 3 refuses several commands in one execute when parameters are bound, and `CREATE TABLE AS` cannot declare an index. A temporary-table index or an extra temporary table therefore needs a new execute in `engine.py`, which T009 and T012 forbid. Factor-engine section 5 says temporary tables "let the planner index them" but requires no such index, so adding one, and the `engine.py` edit it needs, is left to the owner.

### Other Notes

- Stories CAP-002-E1-S1, CAP-002-E2-S1, CAP-002-E2-S8 and CAP-002-E2-S9 are classified in the table above as context. One hard edge was added: `dependencies.yaml` now lists `CAP-002-E2-S7: [CAP-002-E2-S2, CAP-002-E2-S3, CAP-002-E2-S4, CAP-002-E2-S5, CAP-002-E2-S6]` (S2 was reachable only transitively). No cycle: S2 depends only on S1.
- The register's "Corrections" are consistent with this plan: S5 reads committed `factor_input` rows (DEC-0119), so the volume build writes 24,000 rows and reads them back; `_STAGES` order is DEC-0121's; `daily_bar_latest` is a CTE inside `momentum_inputs.sql`; and S2's `add_bar` takes no `observed_on` (correction from u004), so `populate_backdating` and `revise_close` write their bars through the local `_insert_bar` with an explicit `observed_on`, and this plan never calls `add_bar`.
- The volume test is slow by design (it loads about 820 thousand bars and 72 thousand statement rows). Its elapsed time depends on the container's resources; the number printed by T003 is the evidence S3 T022, S4 T014 and S5 T019 asked for.
- Under a driver that commits once per stage, the TDD-evidence file records `commit_hash: stage` (T013).
