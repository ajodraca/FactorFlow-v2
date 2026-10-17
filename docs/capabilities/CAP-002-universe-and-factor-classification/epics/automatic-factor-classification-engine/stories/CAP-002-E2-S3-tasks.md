---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S3-tasks
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
  timestamp: 2026-10-17T23:40:00Z
  source_artifacts:
    - id: CAP-002-E2-S3
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S3 — Value and Growth Inputs from Quarterly Fundamentals

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-tasks`
**Date**: 2026-10-17

## Summary

Adds the fundamentals stage of the factor engine: `statements.sql` (latest observation per quarterly period and statement type, with the backfill flag column and the TTM and prior-year window slots), `value_inputs.sql` (`book_to_price`, `earnings_yield`, `fcf_yield`), `growth_inputs.sql` (`revenue_growth`, `eps_growth`) and `insert_inputs.sql` (the `factor_input` writer, parameterised by factor so CAP-002-E2-S4 reuses it for momentum). One stage, registered in `engine._STAGES`, creates the temporary tables `stmt` and `inputs`, derives the five inputs for every active instrument with `status`, `value`, `as_of`, `known_on` and `detail`, applies the fundamentals-side currency rule (latest period end more than 6 months before the classification date is `outdated`) and the price rule for value inputs (latest bar precedes the latest trading day held is `outdated`), and writes the rows. Line-item payload keys come from `line_items.LINE_ITEMS`; while a key is `REQUIRES_INPUT` the dependent inputs are `missing` with `detail.cause = line_item_mapping_unresolved`, and the tests declare their own keys. Seven mapped test cases (TC-COMP-060, 061, 062, 094, 100, 101, 161) plus the S3 half of TC-COMP-059 are implemented. No momentum input, peer set, classification or restatement mark is written here.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | Value, growth inputs computed from exactly the defined inputs, periods, weights | T004, T006, T008, T011, T012, T018, T019, T020, T021 |
| AC-12 | Score only when every input present and current; name the missing or outdated input | T005, T008, T010, T012, T018, T019, T020, T021 |
| AC-13 | Outdated: fundamental period end more than 6 months before the date; price not from the latest trading day | T009, T010, T013, T018, T019, T020, T021 |
| DAC-E2-1 | Each input derived per TTM, prior year, latest balance sheet, no extra step | T004, T005, T006, T008, T012, T018, T019, T020 |
| DAC-E2-6 | Fundamental `outdated` past 6 months; price-dependent `outdated` when the bar precedes the latest trading day | T009, T010, T013, T018, T019, T020, T021 |
| DAC-E2-9 | Inputs selected as they existed when the build transaction ran | T007, T014, T015, T020, T021 |
| DAC-E2-S3-1 | Eight quarters: `revenue_growth` = four-quarter sum over prior four minus one; `as_of` latest period | T004, T019, T020 |
| DAC-E2-S3-2 | Seven quarters: growth `missing`, `detail.periods_found` lists seven; value unaffected | T005, T015, T019, T020 |
| DAC-E2-S3-3 | `FY` rows enter no TTM sum | T006, T015, T020 |
| DAC-E2-S3-4 | Later `observed_on` of a period used, `known_on` equals it, earlier row untouched | T007, T015, T020 |
| DAC-E2-S3-5 | 6 months and a day: `outdated`; exactly 6 months: `present` | T009, T018, T019, T020 |
| DAC-E2-S3-6 | Stale latest bar: value inputs `outdated`, growth unaffected | T010, T018, T020 |
| DAC-E2-S3-7 | Prior base or shares zero or less: `not_computable` (DEC-0055) | T008, T018, T019, T020 |

## Phase 1: Setup

**Purpose**: Confirm the hard prerequisite exists and fix the shared test helpers.

- [ ] T001 Confirm CAP-002-E2-S2 has landed on the working branch: `src/factorflow/classification/engine.py` must define `build`, `BuildContext`, `_STAGES` and `_read_context`; `constants.py` must define `INPUT_NAMES`, `FUNDAMENTALS_STALE_AFTER_MONTHS`; `line_items.py` must define `LINE_ITEMS`, `REQUIRES_INPUT`, `unresolved()` and `UNRESOLVED_CAUSE`; `set_context.sql` and `tests/integration/engine_support.py` must exist. If any is absent, STOP and report that the hard dependency CAP-002-E2-S2 is not implemented. Then read `engine.py` (how the three S2 statements are loaded once at import and executed with bound parameters, how a stage receives `conn` and `BuildContext`), `engine_support.py` (its helper names and signatures) and `0002_observations.sql` (the `value_hash` NOT NULL 32-byte column and the natural key `(instrument_id, fiscal_period_end, statement_type, value_hash)`; two observations of one period must differ in `value_hash`)
- [ ] T002 Create `tests/integration/engine_inputs_support.py` (a plain module, not `conftest.py`; imports the S2 helpers `migrate_through_classification`, `add_instrument`, `add_bar`, `add_run`, `add_building_set` from `tests.integration.engine_support`, and does not edit that file, DEC-0064): `TEST_KEYS` mapping each of the seven line-item names to a test payload key (for example `t_book_equity`), `install_test_line_items(monkeypatch, overrides=None)` that replaces `factorflow.classification.line_items.LINE_ITEMS` entries with `LineItem(label, statement_type, TEST_KEYS[name], sign)` (capital expenditure with `sign=-1` and an outflow-negative fixture value, so the sign path is exercised; `overrides` replaces a key or sign per test); `add_statement(conn, instrument_id, period_end, statement_type, payload, fiscal_period="Q1", observed_on=None, provider_filing_date=None)` writing a `fundamental_observation` row with `value_hash = sha256(json of every column)` so distinct observations of one period are distinct rows; `add_quarters(conn, instrument_id, latest_period_end, n, values)` writing `n` consecutive quarterly period ends (3 calendar months apart, newest first) for the three statement types from per-period dicts; `run_fundamentals_stage(conn, set_id, monkeypatch)` that sets `engine._STAGES = [engine._fundamental_inputs_stage]` and calls `engine.build(conn, set_id, 60)` so later stories' stages never run in these tests; `inputs_for(conn, set_id, instrument_id) -> dict[str, dict]` reading `factor_input` by `input_name` (status, value, as_of, known_on, restated_possible, detail). Every writing helper commits. No pytest fixtures (depends on T001)

**Checkpoint**: The prerequisite exists and the helpers import (they fail only on the missing `_fundamental_inputs_stage`).

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the expected behaviour from the acceptance criteria and mapped test cases.

Database tests are marked `@pytest.mark.postgres`, carry `# Implements TC-COMP-nnn` above each mapped test and cite their AC or DEC in the docstring of each additional one. Each test module declares its own small fixture over `engine_inputs_support` that migrates, adds a roster (the instrument under test plus one active instrument with a bar on the latest trading day so `latest_trading_day` is defined), a terminal run and a `building` set. Payload keys are the test keys from T002 (design section 7: "fixtures declare their own payload keys"); no real Massive key is invented. New test modules only (DEC-0064).

### Mandatory Component Tests

- [ ] T003 Create `tests/integration/test_engine_inputs_fundamentals.py` with the module-local fixture (depends on T002)
- [ ] T004 Implement TC-COMP-060 (revenue_growth equals four-quarter sum over prior four minus one) in `tests/integration/test_engine_inputs_fundamentals.py`: eight quarterly income statements with distinct revenues; assert `revenue_growth` is `present`, its `value` equals `Decimal(sum of newest four) / Decimal(sum of prior four) - 1` to the 10 decimal places of `numeric(30,10)`, `as_of` is the newest period end, `known_on` is the maximum `observed_on` of the eight rows, `restated_possible` is false and `detail` lists the eight period ends used with `observed_on`, `provider_filing_date` and `backfilled` (DAC-E2-S3-1, AC-7) (depends on T003)
- [ ] T005 Implement TC-COMP-094 (seven quarters leave growth inputs missing, value unaffected) in `tests/integration/test_engine_inputs_fundamentals.py` (same file as T004, not parallel): seven quarterly income statements plus a current balance sheet and cash-flow quarters; assert `revenue_growth` and `eps_growth` are `missing`, `detail.periods_found` has exactly seven period ends, and `book_to_price`, `earnings_yield`, `fcf_yield` are `present` and equal their formula. Add the variant where the seventh quarter is absent from the prior window only, and the variant where an eight-quarter history has one quarter missing in the middle (`periods_found` lists seven, the span rule fails the window, growth `missing`) (DAC-E2-S3-2, AC-12) (depends on T004)
- [ ] T006 Implement TC-COMP-061 (annual FY rows enter no TTM sum) in `tests/integration/test_engine_inputs_fundamentals.py` (same file, not parallel): four quarters whose sum is known plus `fiscal_period = 'FY'` income rows with very large values, one sharing a `fiscal_period_end` with the newest quarter and one on its own date; assert the TTM-based inputs equal the four-quarter result, and that a stock with only `FY` rows has growth and TTM value inputs `missing` (DAC-E2-S3-3, AC-7) (depends on T005)
- [ ] T007 Implement TC-COMP-161 (later observation of a period is used; earlier untouched) in `tests/integration/test_engine_inputs_fundamentals.py` (same file, not parallel): one period observed twice with different values and `observed_on` of 2026-06-01 then 2026-07-15; assert the input uses the later row's value, `known_on` equals 2026-07-15 and both `fundamental_observation` rows are still present and byte-identical afterwards. Add the tie case: equal `observed_on`, different `recorded_at`, the later `recorded_at` wins (design 2.3 step 3) (DAC-E2-S3-4, DAC-E2-9, AC-19) (depends on T006)
- [ ] T008 Implement TC-COMP-062 (non-positive base or shares make inputs not_computable) in `tests/integration/test_engine_inputs_fundamentals.py` (same file, not parallel): parametrise prior-year revenue and prior-year diluted EPS of zero and of a negative number, each giving `revenue_growth` or `eps_growth` `not_computable` while the other growth input and the value inputs keep their own status; and `shares_outstanding` of zero and of a negative number, each giving all three value inputs `not_computable` with `detail.cause == "market_capitalisation_not_positive"`. Assert `value` is null on every `not_computable` row and the row names the input (the "factor is not classified with that reason input" half is written by CAP-002-E2-S5 against `classify.sql`) (DAC-E2-S3-7, DEC-0055 (2), AC-7) (depends on T007)
- [ ] T009 Create `tests/integration/test_engine_currency.py` with its module-local fixture and implement TC-COMP-100 (outdated at 6 months and a day, present at exactly 6) (parallel with T003-T008: different file; depends on T002): classification date 2026-10-17; latest quarterly period end 2026-04-16 (6 months and a day) gives every fundamental input `outdated` with `detail` naming the latest period end; 2026-04-17 (exactly 6 months) gives `present`. Add a month-end case (classification date 2026-08-31 against a period end 2026-02-28 is present, against 2026-02-27 is outdated) to pin PostgreSQL `interval '6 months'` semantics, and a growth case showing the same rule uses the newest period P1 (DAC-E2-S3-5, DAC-E2-6, AC-13) (depends on T002)
- [ ] T010 Implement TC-COMP-101 (stale latest bar makes value inputs outdated, growth unaffected) in `tests/integration/test_engine_currency.py` (same file as T009, not parallel): two active stocks, one with a bar on the latest trading day held and one whose latest bar is a day earlier, both with current fundamentals; assert the stale stock's three value inputs are `outdated` with `detail` naming its latest bar date and the latest trading day, its growth inputs are `present`, and the other stock is unaffected. Add: a stock with no bar at all has value inputs `missing` and growth unaffected; a retired stock's later bar does not move the latest trading day (it is `BuildContext.latest_trading_day`, active only) (DAC-E2-S3-6, DAC-E2-6, AC-13) (depends on T009)

### Additional Unit Tests

- [ ] T011 [P] Create `tests/unit/test_engine_line_item_params.py` for the pure helper `engine._line_item_parameters()` (named in T016): with the real `LINE_ITEMS` every key is passed as `None` and every item is listed as unresolved; with one key replaced by `"X"` and sign `-1` that item carries key `"X"` and sign `-1` and the other six stay unresolved; the sentinel `REQUIRES_INPUT` string never appears in the returned parameters; the function reads `line_items.LINE_ITEMS` at call time (a monkeypatched entry is seen). Traces to AC-7, SEC-INP-002 (keys are passed as parameters, never interpolated) (depends on T001)
- [ ] T012 Add to `tests/integration/test_engine_inputs_fundamentals.py` (same file, not parallel) the cases no mapped TC names: (a) the carried half of TC-COMP-059: with the real `LINE_ITEMS` (all `REQUIRES_INPUT`) every value and growth input of an active stock is `missing` with `detail.cause == "line_item_mapping_unresolved"` and `detail.line_items` naming exactly the line items that input needs, and `build` returns `complete`; with only `net_income` resolved, `earnings_yield` gets a different status from `book_to_price` and `fcf_yield` stays `missing` naming `operating_cash_flow` and `capital_expenditure` (S2 plan note: this assertion belongs here; the momentum half belongs to S4). (b) payload value absent, or present but a JSON string or null, counts as absent: the input is `missing`, no cast error, the set completes (DEC-0116). (c) `fcf_yield` equals `(TTM operating cash flow - TTM capital expenditure) / MC` with the test sign `-1` on capital expenditure (design 2.4 `LineItem.sign`). (d) `earnings_yield` and `book_to_price` equal their formulas with market capitalisation `close x shares_outstanding`, where `close` is the stock's latest bar (latest `observed_on` of that session) and `shares_outstanding` comes from the most recent quarterly balance sheet; `detail` carries `close`, bar date, `shares_outstanding`, balance-sheet period end and the market capitalisation. (e) a balance-sheet value comes from the single most recent quarterly row on or before the classification date, a row dated after it is never used, and a missing line item in that row makes the input `missing` rather than falling back to an older quarter. (f) a `ratios` statement type row is never read. (g) a retired instrument gets no `factor_input` row; an active one gets exactly five. (h) reason precedence (DEC-0116): stale and non-positive prior base gives `outdated`; absent line item and stale gives `missing`. (i) `known_on` for a value input is the maximum `observed_on` across every statement row and the bar used (DEC-0055 (7)). (j) enrichment: a `missing` input's `detail` carries the instrument's `acquisition_state` outcome for `fundamentals` (or `prices` when the bar is the missing part), for example `not_found`; no `acquisition_state` row means no such key. (k) `restated_possible` is false on every row S3 writes even for a statement with `provider_filing_date` before the instrument's first fundamentals `observed_on`, while `detail` reports `backfilled: true` for it (the mark itself is CAP-002-E2-S6's) (DAC-E2-1, AC-12, AC-7) (depends on T008)
- [ ] T013 Add to `tests/integration/test_engine_currency.py` (same file, not parallel): a stock with both a stale period and a stale bar is `outdated` with both causes in `detail`; a value input that mixes statement types uses the earliest of the latest period ends as `as_of` and as the staleness date (DEC-0116 (3)); growth inputs ignore bar staleness entirely (AC-13) (depends on T010)
- [ ] T014 Add to `tests/integration/test_engine_inputs_fundamentals.py` (same file, not parallel) the snapshot case: monkeypatch `_STAGES` to `[stage_that_commits_a_newer_statement_on_a_second_connection, engine._fundamental_inputs_stage]`; the newer observation of the newest period, committed after `build` began, is not used (value and `known_on` come from the earlier observation) and a second build of a new set uses it; the first set's rows are unchanged after the second build (DAC-E2-9, AC-19; REPEATABLE READ per DEC-0111) (depends on T012)

**Checkpoint**: All tests are written and fail (no `_fundamental_inputs_stage`, no SQL yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass. The four SQL files each hold one statement, take only `%(name)s` parameters and never interpolate (T010 of the S2 plan scans every `classification/sql/*.sql`).

- [ ] T015 [P] Create `src/factorflow/classification/sql/statements.sql`: one `CREATE TEMP TABLE stmt ON COMMIT DROP AS SELECT ...` over `fundamental_observation` for `instrument_id = ANY(%(active_ids)s)`, `statement_type IN ('balance_sheet','income_statement','cash_flow_statement')`, `fiscal_period <> 'FY'` (filter before ranking, so an `FY` row sharing a quarter-end date never displaces or joins the quarter) and `fiscal_period_end <= %(classification_date)s`. Per `(instrument_id, statement_type, fiscal_period_end)` keep the single row ordered `observed_on DESC, recorded_at DESC` (`DISTINCT ON` or `row_number()`; design 2.3 step 3). Columns: `instrument_id`, `statement_type`, `fiscal_period_end`, `payload`, `observed_on`, `provider_filing_date`, `backfilled` (`provider_filing_date < min(observed_on)` over **all** the instrument's `fundamental_observation` rows, every statement type, period kind and version; null filing date is not backfilled; DEC-0056), `period_rank` (1 newest per instrument and type), `ttm_slot` (1..4 for the four newest rows when those four satisfy the span rule `P4 > P1 - interval '12 months'`, otherwise null for the whole window) and `prior_slot` (1..4 for the four newest rows with `fiscal_period_end <= P1 - interval '12 months'` under the same span rule against their own newest member, otherwise null). A window with fewer than four rows or failing the span rule gets no slots, which the input files read as `missing`. Reads only; no `FOR UPDATE` (DEC-0055 (1); depends on T001)
- [ ] T016 Add `_line_item_parameters()` and the stage to `src/factorflow/classification/engine.py` (depends on T001; edit only by adding): load `statements.sql`, `value_inputs.sql`, `growth_inputs.sql`, `insert_inputs.sql` once at import beside the S2 statements; `_line_item_parameters() -> dict` read at call time from `line_items.LINE_ITEMS`, returning for each of the seven names a key (`None` when the stored key is `REQUIRES_INPUT`, so the sentinel never reaches SQL) and its `sign`, plus `unresolved` (the names, from `line_items.unresolved()`) and `unresolved_cause = UNRESOLVED_CAUSE`; `_fundamental_inputs_stage(conn, ctx)` running, on the build's connection and in order, `statements.sql`, `value_inputs.sql`, `growth_inputs.sql`, then `insert_inputs.sql` with `factors = ["value", "growth"]`, passing `active_ids`, `classification_date`, `latest_trading_day`, `set_id`, the line-item parameters and `FUNDAMENTALS_STALE_AFTER_MONTHS` as bound parameters; append the stage to `_STAGES` (S4 to S6 append after it, DEC-0112, DEC-0115). No numeric library, no `ingestion` import. A statement that cannot take a parameter (an `interval` multiplier) uses `make_interval(months => %(stale_months)s)`
- [ ] T017 [P] Create `src/factorflow/classification/sql/insert_inputs.sql`: `INSERT INTO factor_input (set_id, instrument_id, factor, input_name, status, value, as_of, known_on, restated_possible, detail) SELECT %(set_id)s, ... FROM inputs WHERE factor = ANY(%(factors)s)`. For `status = 'missing'` rows join `acquisition_state` on `(instrument_id, data_type)` where the row's `missing_data_type` (`fundamentals` or `prices`) names the data type, and merge `jsonb_build_object('last_acquisition', jsonb_build_object('data_type', ..., 'outcome', last_outcome, 'acquired_at', last_acquired_at))` into `detail` (design 2.3 step 5, AC-12); no match leaves `detail` unchanged. `value` is written only for `present` rows (the `factor_input_present_is_dated` CHECK is satisfied by the earlier files). Writes only `factor_input` (depends on T001)
- [ ] T018 Create `src/factorflow/classification/sql/value_inputs.sql` (depends on T015, T017): `CREATE TEMP TABLE inputs ON COMMIT DROP AS SELECT ...` with columns `instrument_id, factor, input_name, status, value, as_of, known_on, restated_possible, detail, missing_data_type` (S4 inserts into this table, DEC-0115). One row for each of `book_to_price`, `earnings_yield`, `fcf_yield` per active instrument. Per design 2.4 and DEC-0116: line items are read as `payload ->> <key param>` and used only when `jsonb_typeof(payload -> key) = 'number'`, multiplied by the item's `sign`; market capitalisation is the instrument's latest bar close (latest session, then latest `observed_on`) times `shares_outstanding` from the `period_rank = 1` balance sheet; `book_to_price = book_equity(P1) / MC`, `earnings_yield = sum(net_income, ttm_slot 1..4) / MC`, `fcf_yield = (sum(operating_cash_flow) - sum(capital_expenditure)) / MC`. Status: `missing` when a needed line item's key is `NULL` (detail `cause` = `unresolved_cause` and `line_items` naming the needed unresolved items), when the balance sheet or TTM window or any needed value is absent (detail `periods_found`), or when the instrument has no bar; else `outdated` when `as_of < %(classification_date)s - make_interval(months => %(stale_months)s)` or the instrument's latest bar date `< %(latest_trading_day)s` (detail naming the period end, the bar date and the latest trading day, and every applicable cause); else `not_computable` when `MC <= 0` (detail `cause = "market_capitalisation_not_positive"` with the components); else `present`. `as_of` is the earliest of the latest period ends used, `known_on` the maximum `observed_on` across every statement row and the bar used, `restated_possible` constant `false` with a comment citing CAP-002-E2-S6 (S3 only reports `backfilled` in `detail`), `detail` the periods used with `observed_on`, `provider_filing_date`, `backfilled`, plus `close`, bar date, `shares_outstanding` and market capitalisation. `factor = 'value'`
- [ ] T019 Create `src/factorflow/classification/sql/growth_inputs.sql` (depends on T015, T018): `INSERT INTO inputs SELECT ...` rows for `revenue_growth` and `eps_growth` per active instrument: `sum(item over ttm_slot 1..4) / sum(item over prior_slot 1..4) - 1` on the `income_statement` rows, items `revenue` and `diluted_eps`. Status in the same order as T018: `missing` (unresolved key with the same `cause`; either window absent or any of the eight values absent, `detail.periods_found` = every quarterly `income_statement` period end found on or before the classification date, so seven quarters list seven), `outdated` (newest period end earlier than the stale bound; **bar currency is never consulted**), `not_computable` (prior-year sum `<= 0`, detail naming the base), else `present`. `as_of` is the newest period end P1, `known_on` the maximum `observed_on` of the eight rows, `restated_possible` constant `false`, `detail` the eight periods with `observed_on`, `provider_filing_date`, `backfilled`. `factor = 'growth'`, `missing_data_type = 'fundamentals'`
- [ ] T020 Make the tests pass by running them in file order, fixing only the files named in T015 to T019, and keep `engine._fundamental_inputs_stage` the single registered stage for S3 (depends on T015, T016, T017, T018, T019)

**Checkpoint**: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` pass for the new tests; `factor_input` holds five rows per active stock after the stage and none for retired stocks.

---

## Phase 4: Integration

**Purpose**: Confirm the stage fits the repository's gates and the package's other tests.

- [ ] T021 Run every command in the Validation Plan from the repository root and fix failures in files this plan names; a failure in any other file is reported, not patched. Confirm the S2 safety test (`tests/unit/test_engine_sql_safety.py`) and ship test (`tests/unit/test_classification_sql_ships.py`) pass over the four new `.sql` files without edits to them, and that `uv build --wheel` output contains `classification/sql/statements.sql`, `value_inputs.sql`, `growth_inputs.sql` and `insert_inputs.sql` (the `classification/sql/*.sql` glob is already in `pyproject.toml`; this plan edits neither) (depends on T020)
- [ ] T022 Run the stage over a 3000-instrument synthetic roster with 8 quarters of three statement types once, outside the test suite, with `EXPLAIN (ANALYZE, BUFFERS)` on the `stmt` build and the two input statements, and record in the commit message whether any statement exceeds 30 seconds or sequentially scans `fundamental_observation` without `idx_fundamental_instrument_period`. This is a signal for CAP-002-E2-S7's volume test, not a gate here (the 5-minute budget, AC-11, is asserted there) (depends on T021)

**Checkpoint**: The whole suite is green with the stage in place.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T023 Re-read traceability: each of the seven mapped tests carries `# Implements TC-COMP-nnn`, each additional test cites its AC or DEC in its docstring, and `git diff --stat` touches only the files named in this plan (new files, plus additions to `engine.py`; nothing in `tests/conftest.py`, `tests/integration/engine_support.py`, `pyproject.toml` or any delivered test)
- [ ] T024 After each TDD cycle in T003-T022 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S3-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S2 | hard | Existing graph edge. Supplies `engine.build`, `_STAGES`, `BuildContext`, `set_context.sql`, `constants.py`, `line_items.py` and `tests/integration/engine_support.py` this stage imports (T001) |
| CAP-002-E2-S1 | context | Transitive through S2 (the four classification tables); this plan imports nothing from S1 directly |
| CAP-002-E2-S4 | reverse | Appends the momentum stage, inserts into the `inputs` temp table this story creates and reuses `insert_inputs.sql` with `factors = ['momentum']` (DEC-0115). The `acquisition_state` enrichment for `prices` serves S4 too |
| CAP-002-E2-S5 | reverse | `classify.sql` and `peer_sets.sql` read the `inputs` table (kept, not truncated) and the status vocabulary written here; the "factor not classified with that reason input" half of DAC-E2-S3-7 is asserted there |
| CAP-002-E2-S6 | reverse | Wires `backfilled` from `stmt` and `detail` into `restated_possible`; this story writes `restated_possible = false` and reports `backfilled` in `detail` only |
| CAP-002-E2-S7 | reverse | The 3000-instrument volume test builds through the stage (T022 only samples it) |
| CAP-002-E2-S8 | context | Creates the `building` set a build receives; S3 tests create sets directly through the S2 helper |
| CAP-002-E2-S9 | context | Calls `build`; this story adds no scheduler code |

### Task Dependencies

- T001: No dependencies
- T002: Depends on T001
- T003: Depends on T002; T004 -> T005 -> T006 -> T007 -> T008 -> T012 -> T014 are sequential, same file `test_engine_inputs_fundamentals.py`
- T009 -> T010 -> T013: sequential, same file `test_engine_currency.py`; T009 depends on T002
- T011: Depends on T001 only (pure unit test)
- T015, T017: Depend on T001; independent files
- T016: Depends on T001 (edits `engine.py` by adding)
- T018: Depends on T015, T017; T019 depends on T015, T018 (it inserts into the table T018 creates)
- T020: Depends on T015-T019
- T021: Depends on T020; T022 on T021
- T023: Depends on T022
- T024: Interleaved, after every TDD cycle and before the next cycle begins

### Parallel Opportunities

- Phase 2: the fundamentals chain (T003-T008, T012, T014), the currency chain (T009, T010, T013) and T011 touch different files and can run in parallel
- Phase 3: T015, T016 and T017 can run in parallel; T018 and T019 are sequential

---

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (also `uv run pytest` for the full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- DAC-E2-S3-1 / DAC-E2-1: eight quarters give `revenue_growth` equal to the ratio of the sums minus one, `as_of` the latest period (T004)
- DAC-E2-S3-2: seven quarters give `missing` growth with seven periods listed and unaffected value inputs (T005)
- DAC-E2-S3-3: `FY` rows enter no sum, including one sharing a quarter-end date (T006)
- DAC-E2-S3-4 / DAC-E2-9: the later `observed_on` is used, `known_on` equals it, the earlier row is untouched; a statement committed mid-build is not seen (T007, T014)
- DAC-E2-S3-5 / AC-13: outdated at 6 months and a day, present at exactly 6, including month-end dates (T009)
- DAC-E2-S3-6: a stale latest bar makes value inputs `outdated`; growth is unaffected (T010, T013)
- DAC-E2-S3-7 / DEC-0055: zero or negative prior base or shares give `not_computable` (T008)
- AC-12 / TC-COMP-059 (S3 half): unresolved keys give `missing` with `line_item_mapping_unresolved` and the set completes (T012a)

---

## Notes

### Resolved Conflicts

- **S3 versus S6 on the backfill flag.** S3's description gives `statements.sql` "the backfill flag column"; S6 "wires the backfill flag from `statements.sql` through `factor_input` into `factor_classification.restated_possible`", while design 2.4 has `restated_possible` as a column of `inputs`. Governing rule: story ACs outrank the design, and the S3 ACs (DAC-E2-S3-1 to 7) contain no restatement criterion while DAC-E2-11 and DAC-E2-S6-1 belong to S6. S3 computes `backfilled` (DEC-0056) and reports it in `detail`; `inputs.restated_possible` is written `false`; S6 turns that into the mark. No design change needed.
- **`close(L)` in the market-capitalisation formula.** DEC-0055 (6) says "latest close" and design 2.4 writes `close(L)`, where `L` is the latest trading day across active instruments. A stock whose latest bar precedes `L` has no `close(L)`, and DEC-0055 (5) and DAC-E2-6 make it `outdated`. Both read together without contradiction: the stock's own latest bar close is used for market capitalisation, and the stale-bar rule decides the status. Established by DEC-0055 (5), (6) and DAC-E2-S3-6. No design change needed.
- **`PROVISIONAL` DEC-0112 seam versus design 2.1 placement.** Design 2.1 lists `insert_inputs.sql` after the momentum SQL and writes all 24,000 rows in one statement, while S3 owns the file and S4 follows it. The `factors` parameter (DEC-0115) delivers the same rows with two executions; row content and the single transaction are unchanged.
- **Illustrative design snippets.** The design shows no fundamentals SQL, only formulas and rules; where the section 2.4 prose ("four most recent distinct quarterly `fiscal_period_end` values ... `P4` later than `P1` minus 12 months") and the table agree, the prose is implemented as `ttm_slot` and `prior_slot` in T015.
- **Story status not changed.** The skill asks for `status` to move from `todo` to `planning`; the story is approved and any edit invalidates the approval, so the frontmatter is left as it is (constraint 7), as in the CAP-002-E2-S2 plan.

### Open Gaps

- **Temp-table and writer seam shared with S4. PROVISIONAL — awaiting owner confirmation (2026-10-17).** No artifact says how two stories' stages share `inputs` and `insert_inputs.sql`. Derivation: design 2.4 names the tables, S4 says it reuses S3's writer and DEC-0112 makes each story append a stage, so `value_inputs.sql` creates `inputs`, `growth_inputs.sql` and S4's momentum file insert into it, and `insert_inputs.sql` takes a `factors` array. Recorded as DEC-0115. Owning design: factor-engine 2.1 and 2.3 step 4-5, at its next revision. The S4 and S5 planners must insert into and read `inputs` rather than create it.
- **Reason precedence, `as_of` for multi-statement inputs, non-numeric payload values and null fields on non-present rows. PROVISIONAL — awaiting owner confirmation (2026-10-17).** Derivation in DEC-0116: `missing`, then `outdated`, then `not_computable`; the earliest of the latest period ends used is `as_of` and the staleness date; a payload value that is absent or not a JSON number is absent; `value` is set only for `present` rows. Recorded as DEC-0116. Owning design: factor-engine 2.4, at its next revision.
- **Payload keys for the seven line items remain the owner's question** (system design section 8 question 1, factor-engine section 14 question 1). Not resolved and not invented: the tests install their own keys (T002) and `line_items.py` is untouched. The keys may turn out to be nested in the statement payload rather than top-level; `payload ->> key` as the design writes it assumes top-level, and a nested layout would be a design revision, not a change here. Real-data verification waits on the owner's answer.
- **Bar selection for market capitalisation.** The latest bar is taken as the greatest `session_date` (no upper bound at the classification date, matching `latest_trading_day`), then the latest `observed_on` of that session. No artifact bounds it at the classification date; the build always runs after acquisition, and a bar later than the classification date cannot exist in practice. Not a decision with a visible alternative; recorded so S4 aligns its `daily_bar_latest` selection.

### Other Notes

- Stories CAP-002-E2-S1, CAP-002-E2-S4, CAP-002-E2-S5, CAP-002-E2-S6, CAP-002-E2-S7, CAP-002-E2-S8 and CAP-002-E2-S9 are classified in the table above; none is a new hard edge. `dependencies.yaml` already lists `CAP-002-E2-S3: [CAP-002-E2-S2]`; planning made no change to it.
- The stage reads `line_items.LINE_ITEMS` at call time through module attribute access so tests can substitute entries with `monkeypatch`; it must never import `LINE_ITEMS` by name into `engine.py`.
- The pre-existing `tests/unit/test_sql_is_append_only.py` and S2's `test_engine_sql_safety.py` already cover the new SQL and Python; this plan adds no safety test of its own.
- Under a driver that commits once per stage, the TDD-evidence file records `commit_hash: stage` (T024).
