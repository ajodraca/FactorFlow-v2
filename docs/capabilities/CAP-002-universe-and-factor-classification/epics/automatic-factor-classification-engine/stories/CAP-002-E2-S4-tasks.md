---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-30
last_reworked_review: CAP-002-E2-S4-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-10-17T23:59:00Z
  source_artifacts:
    - id: CAP-002-E2-S4
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S4 — Momentum Inputs with Split and Dividend Adjustment

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-tasks`
**Date**: 2026-10-17

## Summary

Adds the momentum stage of the factor engine: one SQL file, `momentum_inputs.sql`, and `engine._momentum_inputs_stage`, registered in `engine._STAGES` after S3's `_fundamental_inputs_stage` and above CAP-002-E2-S5's `_classification_stage` when that stage is registered (DEC-0121). For every active instrument the statement derives `return_3m`, `return_6m` and `return_12m` from the stored unadjusted `daily_bar` rows: `E` is the stock's latest bar on or before the classification date minus one month, `S_k` its latest bar on or before `E` minus k months, splits in `(S_k, E]` scale earlier prices by `split_from / split_to`, and each cash dividend in the window compounds the return factor by `1 + cash_amount x split_factor / prior adjusted close`. Rows are inserted into the `inputs` temporary table S3 creates (DEC-0115) and written to `factor_input` by S3's `insert_inputs.sql` with `factors = ['momentum']`. A missing boundary bar makes only the inputs that need it `missing`; a stock whose latest bar precedes the latest trading day held has every momentum input `outdated`; `known_on` is the maximum `observed_on` over the bars and actions used. Five mapped test cases (TC-COMP-063, 064, 065, 066, 102) are implemented, plus a supporting case for TC-COMP-059 showing that unresolved line-item keys leave the momentum inputs `present` (the "momentum still classifies" clause is asserted by CAP-002-E2-S7 T014). No value or growth input, peer set, classification or restatement mark is written here (momentum is never marked, DAC-E2-S6-2).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | Momentum computed from exactly the inputs, periods and equal weights of Section 2 | T004, T005, T006, T007, T008, T011, T012, T013, T016, T017, T018 |
| AC-13 | Outdated when the price is not from the latest trading day held | T009, T014, T016, T017, T018 |
| DAC-E2-1 | Read-time split and dividend adjustment of unadjusted bars, no step the capability does not define | T004, T005, T006, T008, T011, T012, T013, T016, T017 |
| DAC-E2-6 | Price-dependent input `outdated` when the latest bar precedes the latest trading day | T009, T014, T017, T018 |
| DAC-E2-S4-1 | No bar before S_12: `return_12m` missing, the other two present | T004, T017 |
| DAC-E2-S4-2 | 2-for-1 split in the window: pre-split prices halved, return equals the unsplit series' | T005, T017 |
| DAC-E2-S4-3 | Dividend 1 on prior close 100 multiplies the factor by 1.01 | T006, T017 |
| DAC-E2-S4-4 | `known_on` equals the maximum `observed_on` over bars and actions used | T007, T017 |
| DAC-E2-S4-5 | Latest bar precedes the latest trading day: all three inputs `outdated` | T009, T017 |

## Phase 1: Setup

**Purpose**: Confirm the hard prerequisites exist and add the shared test helpers.

- [x] T001 Confirm CAP-002-E2-S2 and CAP-002-E2-S3 have landed on the working branch. From S2: `src/factorflow/classification/engine.py` defines `build`, `BuildContext`, `_STAGES`; `constants.py` defines `MOMENTUM_LAG_MONTHS == 1`, `MOMENTUM_WINDOWS_MONTHS == (3, 6, 12)` and `INPUT_NAMES["momentum"]`; `line_items.py` exists; `tests/integration/engine_support.py` exists. From S3: `engine._fundamental_inputs_stage` is registered in `_STAGES`; `sql/value_inputs.sql` creates the `ON COMMIT DROP` temporary table `inputs(instrument_id, factor, input_name, status, value, as_of, known_on, restated_possible, detail, missing_data_type)`; `sql/insert_inputs.sql` takes `%(factors)s` and `%(set_id)s`; `tests/integration/engine_inputs_support.py` exports `inputs_for`. If any is absent, STOP and report the unmet hard dependency. Then read `engine.py` (how S3 loads its statements at import, how `_fundamental_inputs_stage` binds parameters, where `_fundamental_inputs_stage` is registered in `_STAGES` and whether CAP-002-E2-S5's `_STAGES.append(_classification_stage)` line is present), `value_inputs.sql` (the exact `inputs` column list and the `detail` shape used so `momentum_inputs.sql` writes rows of the same grain), `insert_inputs.sql` (the `prices` enrichment of `missing` rows), and `0002_observations.sql` for `daily_bar` and `corporate_action` (natural keys include `value_hash`, so two observations of one session or action are distinct rows; `daily_bar.close_price` is `numeric(18,6)`; `corporate_action.payload` is `jsonb`)
- [x] T002 Create `tests/integration/engine_momentum_support.py` (a plain module, not `conftest.py`; imports `migrate_through_classification`, `add_instrument`, `add_run`, `add_building_set` from `tests.integration.engine_support` and `inputs_for` from `tests.integration.engine_inputs_support`; edits neither, a plan choice: S4's helpers live in their own module, as S3's live in `engine_inputs_support.py`): `add_bar_observed(conn, instrument_id, session_date, close, observed_on=None, recorded_at=None)` writing a `daily_bar` row with `value_hash = sha256(json of every column)` so a re-acquired session is a distinct row (S2's `add_bar` takes no `observed_on` and is not used for the known_on or revision cases); `add_close_series(conn, instrument_id, closes)` taking a `{session_date: close}` mapping and calling `add_bar_observed` for each; `add_corporate_action(conn, instrument_id, action_type, effective_on, payload, observed_on=None, recorded_at=None)` writing a `corporate_action` row with a distinct `value_hash`; `run_momentum_stages(conn, set_id, monkeypatch)` that sets `engine._STAGES = [engine._fundamental_inputs_stage, engine._momentum_inputs_stage]` (the first creates the `inputs` table DEC-0115 makes the momentum stage insert into; with the real `LINE_ITEMS` every value and growth input is `missing`, which these tests ignore) and calls `engine.build(conn, set_id, 60)`; `momentum_fixture_dates()` returning the boundary dates for classification date 2026-10-17 (E target 2026-09-17, S_3 target 2026-06-17, S_6 target 2026-03-17, S_12 target 2025-09-17). Every writing helper commits. No pytest fixtures (depends on T001)

**Checkpoint**: The prerequisites exist and the helpers import (they fail only on the missing `_momentum_inputs_stage`).

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the expected behaviour from the acceptance criteria and mapped test cases.

Database tests are marked `@pytest.mark.postgres`, carry `# Implements TC-COMP-nnn` above each mapped test and cite their AC or DEC in the docstring of each additional one. The single test module `tests/integration/test_engine_inputs_momentum.py` (the story names it and includes the price-currency case there; see Resolved Conflicts) declares its own fixture over `engine_momentum_support`: migrate, add a roster of the stock under test plus an anchor active stock with a bar on 2026-10-16 so `latest_trading_day` is 2026-10-16, a terminal run and a `building` set with `classification_date` 2026-10-17. The stock under test gets bars on the boundary dates plus 2026-10-16 unless a case removes one. Corporate-action payloads are written the way ingestion stores them, as JSON strings (`{"split_from": "1", "split_to": "2"}`, `{"cash_amount": "1"}`, verified against `CorporateAction.value_payload()`), with one parametrised variant using JSON numbers. Expected returns are computed in the test from the unsplit series with `Decimal` and compared to 8 decimal places (`exp(ln())` arithmetic is exact to far more than that and the stored column is `numeric(30,10)`). New test modules only, a plan choice; `test_engine_currency.py` (CAP-002-E2-S3's module) is not edited because the story's Technical Details place the momentum price-currency case in `test_engine_inputs_momentum.py`.

### Mandatory Component Tests

- [x] T003 Create `tests/integration/test_engine_inputs_momentum.py` with the module-local fixture (depends on T002)
- [x] T004 Implement TC-COMP-063 (a missing 12-month price makes only `return_12m` missing) in `tests/integration/test_engine_inputs_momentum.py`: boundary bars for E, S_3 and S_6 but none on or before 2025-09-17; assert `return_12m` is `missing` with `detail.boundary == "S_12"`, `value` null, and `return_3m` and `return_6m` are `present` with the expected returns and `as_of` equal to the E bar date. Add the boundary-resolution cases the design lists (E is the latest bar on or before D minus one month, S_k the latest on or before E minus k months): bars on non-target days so each boundary resolves to an earlier session (`detail` carries the resolved `E` and `S_k` dates); a bar exactly on the target date is chosen over an earlier one; a bar after the target is never chosen; a month-end case (classification date 2026-03-31 gives E target 2026-02-28, pinning PostgreSQL `interval` semantics, with a second set); and a stock with no bar on or before E has all three inputs `missing` with `detail.boundary == "E"` (DAC-E2-S4-1, DAC-E2-1, AC-7) (depends on T003)
- [x] T005 Implement TC-COMP-064 (a 2-for-1 split inside the window leaves the return unchanged) in `tests/integration/test_engine_inputs_momentum.py` (same file, not parallel): a stock with closes 100 before and 50 after a 2026-07-01 split (`split_from "1"`, `split_to "2"`) inside the 3-month window, and an unsplit twin series (no split, closes 50 throughout the post-split stretch scaled the same) as a second stock; assert the split stock's `return_3m` equals the unsplit series' return, `detail` lists the split with its `effective_on`, `split_from`, `split_to`, and the adjusted and raw closes of both boundaries. Add: a split before S_k or after E is not applied; a reverse split (`split_from "2"`, `split_to "1"`) doubles earlier prices; two splits in one window compound; the JSON-number payload variant gives the same result (DAC-E2-S4-2, DAC-E2-1, AC-7) (depends on T004)
- [x] T006 Implement TC-COMP-065 (a dividend of 1 against a prior close of 100 multiplies the return factor by 1.01) in `tests/integration/test_engine_inputs_momentum.py` (same file, not parallel): a stock with no split, prior session close 100, ex-date (`effective_on`) inside the window, `cash_amount "1"`; assert the return equals `(close_E / close_S) x 1.01 - 1`. Add: two dividends compound (`1.01 x 1.02` against their own prior closes); a dividend on or before S_k or after E is not applied; a zero-amount dividend leaves the factor at 1; a dividend followed by a later split in the window is scaled by that split's factor (cash amount x split_from/split_to over splits strictly after the ex-date, DEC-0118); a split on the ex-date itself does not scale the cash amount (DEC-0118); `ticker_change` and `ipo` actions are ignored (DAC-E2-S4-3, DAC-E2-1, AC-7) (depends on T005)
- [x] T007 Implement TC-COMP-066 (`known_on` is the maximum `observed_on` of the bars and actions used) in `tests/integration/test_engine_inputs_momentum.py` (same file, not parallel): distinct `observed_on` values on the E bar, the S_k bar, a split and a dividend's prior-session bar; assert `known_on` equals the maximum of exactly those; a bar inside the window that feeds no figure but has a later `observed_on` does not move `known_on`; an action outside `(S_k, E]` with a later `observed_on` does not move it; `known_on` differs per k when the windows use different actions (DAC-E2-S4-4, AC-7, DEC-0118) (depends on T006)
- [x] T008 Implement TC-COMP-102 (a stale latest bar makes all three momentum inputs outdated) in `tests/integration/test_engine_inputs_momentum.py` (same file, not parallel): two active stocks with complete boundary bars, one with its latest bar on the latest trading day held and one whose latest bar is a day earlier; assert the stale stock's three inputs are `outdated` with `detail` naming its latest bar date and the latest trading day, `as_of` still E and `value` null (DEC-0116 (5): value only for present), and the other stock's three are `present`. Add: a stock whose latest bar is after E but before L is `outdated`; a retired stock's later bar does not move the latest trading day; the momentum inputs of the stale stock do not depend on its fundamentals (DAC-E2-S4-5, DAC-E2-6, AC-13) (depends on T007)

### Additional Unit Tests

- [x] T009 Add to `tests/integration/test_engine_inputs_momentum.py` (same file, not parallel) the cases no mapped TC names: (a) reason precedence (DEC-0116 (1), DEC-0118): a stale stock lacking the S_12 bar has `return_12m` `missing` and the other two `outdated`; a stock with no bar at all is `missing` for all three; (b) supporting case for TC-COMP-059 (no `# Implements` tag; it shows only that the momentum inputs stay `present`, and the "momentum still classifies" clause is asserted by CAP-002-E2-S7 T014): with the real `LINE_ITEMS` (every key `REQUIRES_INPUT`) value and growth inputs are `missing` and the three momentum inputs of a complete stock are `present`, `build` returns `complete`; (c) a retired instrument gets no momentum row and an active one exactly three, named per `constants.INPUT_NAMES["momentum"]`, each with `factor == "momentum"`, `restated_possible` false and the `acquisition_state` `prices` outcome in `detail.last_acquisition` only when `missing`; (d) revision handling (DEC-0117): a bar re-acquired for the same session with a later `observed_on` is used and the earlier row is untouched; on equal `observed_on` the later `recorded_at` wins; a revised dividend (same `effective_on`, later `observed_on`, different amount) is applied once with the later amount; (e) unusable payloads (DEC-0117): a split with `split_to` of `"0"`, a non-numeric string, a missing key or a negative `cash_amount` in the window makes the inputs whose window contains it `missing` with `detail.cause == "corporate_action_payload_unusable"` naming the action, the other windows are unaffected and the set completes; (f) snapshot: a stage injected before the momentum stage commits a newer bar on a second connection; the first set does not see it and a second set does (DAC-E2-9, AC-19, DEC-0111); (g) a stock with exactly one bar has all three inputs `missing` (S_k cannot resolve) rather than a zero return (AC-7, AC-13) (depends on T008)

**Checkpoint**: All tests are written and fail (no `_momentum_inputs_stage`, no SQL yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass. The SQL file holds one statement, takes only `%(name)s` parameters and never interpolates (S2's `test_engine_sql_safety.py` scans every `classification/sql/*.sql`; avoid `||`, `{}` and `format()`, because a bare `%s` inside `format()` collides with psycopg 3's named-parameter syntax: build text with `concat()`).

- [x] T010 Create `src/factorflow/classification/sql/momentum_inputs.sql` as one `INSERT INTO inputs (instrument_id, factor, input_name, status, value, as_of, known_on, restated_possible, detail, missing_data_type) SELECT ...` over `daily_bar` and `corporate_action` (depends on T001). Parameters: `active_ids` (bigint[]), `classification_date`, `latest_trading_day`, `momentum_lag_months`, `momentum_windows` (int[]), all bound. Logic, in CTEs: (1) `bar` = per `(instrument_id, session_date)` the row with the greatest `observed_on`, then greatest `recorded_at` (`DISTINCT ON`; `daily_bar_latest` is this CTE, no view or migration, DEC-0117), restricted to `instrument_id = ANY(%(active_ids)s)`; (2) `latest_bar` = each stock's greatest `session_date` with no upper bound (aligned with S3's bar selection and with `latest_trading_day`); (3) `e` = each stock's greatest `session_date <= %(classification_date)s - make_interval(months => %(momentum_lag_months)s)`; (4) `win` = `e` cross joined to `unnest(%(momentum_windows)s)` as `k`, with `s` = greatest `session_date <= e.session_date - make_interval(months => k)`; (5) `act` = per `(instrument_id, action_type, effective_on)` the row with the greatest `observed_on` then `recorded_at` for `split` and `dividend`, with `effective_on > s.session_date AND effective_on <= e.session_date`, parsed through `jsonb_typeof` in `('number','string')` and a plain-decimal check (`payload ->> key ~ '^-?[0-9]+(\.[0-9]+)?$'`) before any cast, flagged `unusable` when a key is absent or not numeric, `split_from <= 0`, `split_to <= 0` or `cash_amount < 0` (DEC-0117); (6) split factor per boundary bar = `exp(sum(ln(split_from / split_to)))` over usable splits with `effective_on > bar.session_date` and `<= e.session_date`, `COALESCE(..., 1)`, giving `adj_close` for the `s` and `e` bars and for each dividend's prior session (the stock's latest bar with `session_date < ex-date`); (7) `div_factor` = `exp(sum(ln(1 + cash_amount x sf / prior_adj_close)))` where `sf` is the product of `split_from / split_to` over splits with `effective_on` strictly after the ex-date and on or before E (DEC-0118); (8) `total_return = (adj_close_e / adj_close_s) x COALESCE(div_factor, 1) - 1`. Status per DEC-0116 (1)/(2): `missing` when `e` or `s` has no bar (`detail.boundary` = `"E"` or `"S_<k>"`, the latter built as `concat('S_', k)`) or any in-window action is `unusable` (`detail.cause = 'corporate_action_payload_unusable'` naming `action_type`, `effective_on`), else `outdated` when `latest_bar.session_date < %(latest_trading_day)s` (detail names both dates), else `present`; never `not_computable`. `value` is set only for `present` rows (the `factor_input_present_is_dated` CHECK); `as_of` is E whenever E exists; `known_on` is the maximum `observed_on` over the E bar, the S_k bar, each applied dividend's prior-session bar and every applied split and dividend (DEC-0118), null when E is absent; `restated_possible` is the constant `false` with a comment citing DAC-E2-S6-2 and CAP-002-E2-S6; `factor = 'momentum'`; `input_name = concat('return_', k, 'm')` (giving `return_3m`, `return_6m`, `return_12m`; never `format()`, whose bare `%s` psycopg 3 rejects with `ProgrammingError` beside the statement's named parameters, and never `||`; S2's `test_engine_sql_safety.py` rejects both); `missing_data_type = 'prices'`; `detail` records `E`, `S_k`, the two raw and two adjusted closes and every split and dividend applied with its `effective_on`, payload values and `observed_on` (design 2.4). One row per active stock and window, including stocks with no bars at all (the roster, not the bars, drives the output). No numeric library, no `FOR UPDATE`, no write to any table but `inputs`
  - Note (review v1 rework, 2026-10-30): two owner decisions supersede this task's wording on two points. **DEC-0242** (review v1 IR-005): a `missing` momentum input has `known_on` null, whatever its cause, in place of "the maximum `observed_on` ... null when E is absent" for missing rows; `as_of` stays E whenever E exists, the cause and the rows read stay in `detail`, and present and outdated inputs keep DEC-0118 (1). **DEC-0243** (review v1 IR-006): a momentum input missing with `detail.cause = 'corporate_action_payload_unusable'` has `missing_data_type = 'corporate_actions'`, in place of `'prices'`; every other momentum input, a missing boundary and DEC-0241's `price_not_positive` among them, keeps `'prices'`.
- [x] T011 Add `_momentum_inputs_stage` to `src/factorflow/classification/engine.py` (depends on T001, T010; edit only by adding): load `momentum_inputs.sql` once at import beside S3's statements; `_momentum_inputs_stage(conn, ctx)` runs, on the build's connection, `momentum_inputs.sql` with `active_ids`, `classification_date`, `latest_trading_day`, `momentum_lag_months = constants.MOMENTUM_LAG_MONTHS` and `momentum_windows = list(constants.MOMENTUM_WINDOWS_MONTHS)`, then S3's `insert_inputs.sql` with `set_id` and `factors = ["momentum"]`; register it with `_STAGES.append(_momentum_inputs_stage)` placed after S3's `_STAGES.append(_fundamental_inputs_stage)` line and above CAP-002-E2-S5's `_STAGES.append(_classification_stage)` line when that line exists, so the list order is fundamentals, momentum, classification (DEC-0121, DEC-0112, DEC-0115; the momentum stage must follow the fundamentals stage because it inserts into the `inputs` table that stage creates; S5 reads the committed `factor_input` rows, never `inputs` (DEC-0119), and CAP-002-E2-S6 registers no stage). Do not create `inputs` or edit S3's stage or SQL. No `ingestion` import
- [x] T012 Make the tests pass by running them in file order, fixing only `momentum_inputs.sql` and the addition in `engine.py`; do not edit `insert_inputs.sql` or any S3 file. If `insert_inputs.sql` fails to write a momentum row, STOP and report the S3 defect (depends on T010, T011)

**Checkpoint**: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` pass for the new tests; `factor_input` holds three momentum rows per active stock and none for retired stocks.

---

## Phase 4: Integration

**Purpose**: Confirm the stage fits the repository's gates and the package's other tests.

- [x] T013 Run every command in the Validation Plan from the repository root and fix failures in files this plan names; a failure in any other file is reported, not patched. Confirm S2's `tests/unit/test_engine_sql_safety.py` and `tests/unit/test_classification_sql_ships.py` pass over `momentum_inputs.sql` without edits to them, that `uv build --wheel` output contains `classification/sql/momentum_inputs.sql` (the `classification/sql/*.sql` glob is already in `pyproject.toml`; this plan edits neither), that S3's tests still pass with the momentum stage registered after the fundamentals stage (S3 tests replace `_STAGES`, so they are unaffected by design), and that CAP-002-E2-S5's `tests/unit/test_classification_stage_order.py`, when present, passes unedited with the momentum stage above `_classification_stage` (DEC-0121) (depends on T012)
- [x] T014 Run the stage once, outside the test suite, over a 3000-instrument roster with 273 bars each (design section 5: about 820 thousand rows) with `EXPLAIN (ANALYZE, BUFFERS)` on the `momentum_inputs.sql` statement, and record in the commit message whether it exceeds 30 seconds or sequentially scans `daily_bar` without `idx_daily_bar_instrument_session`. Report the observation as a signal for CAP-002-E2-S7's volume test; it is not a gate here (the 5-minute budget, AC-11, is asserted there) (depends on T013)

**Checkpoint**: The whole suite is green with the stage in place.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [x] T015 Re-read traceability: each of the five mapped tests carries `# Implements TC-COMP-nnn`, each additional test cites its AC or DEC in its docstring, and `git diff --stat` touches only the files named in this plan (the new SQL file, the new test and helper modules, and additions to `engine.py`; nothing in `tests/conftest.py`, `tests/integration/engine_support.py`, `tests/integration/engine_inputs_support.py`, `test_engine_currency.py`, `pyproject.toml`, `insert_inputs.sql` or any delivered test)
- [x] T016 Check the SQL against the design snippet line by line: the split factor on price uses `effective_on > bar.session_date` and `<= E`; the dividend uses the prior session's adjusted close; the stored `value` keeps `numeric(30,10)` precision and the SQL contains no `float`/`double precision` cast (DEC-0052); the file contains no `format(`, no `||`, no `{` or `}` and no `%` other than the `%(name)s` placeholders (`input_name` is `concat('return_', k, 'm')` and `detail.boundary` is `concat('S_', k)`). Record any divergence in the Notes of the commit message, not by editing the design
- [x] T017 After each TDD cycle in T003-T014 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S4-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)
- [x] T018 Confirm no momentum input is ever written `not_computable` and no momentum `factor_input` row has `restated_possible = true`, by querying the stage's output once over the fixture of T009 (documented in the TDD-evidence entry; supports AC-7 and the S6 guarantee)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S2 | hard | Existing graph edge. Supplies `engine.build`, `_STAGES`, `BuildContext`, `constants.py` and `tests/integration/engine_support.py` this stage imports (T001) |
| CAP-002-E2-S3 | hard | Existing graph edge. Creates the `inputs` temporary table the momentum SQL inserts into and owns `sql/insert_inputs.sql` this stage reuses with `factors = ['momentum']` (DEC-0115); also `tests/integration/engine_inputs_support.py` (`inputs_for`) |
| CAP-002-E2-S1 | context | Transitive through S2 (the four classification tables); this plan imports nothing from S1 directly |
| CAP-002-E2-S5 | soft | S5 reads the committed momentum `factor_input` rows this stage writes, never `inputs` (DEC-0119); this stage is registered above S5's `_classification_stage` when S5 has landed (DEC-0121), which S5's `tests/unit/test_classification_stage_order.py` checks |
| CAP-002-E2-S6 | reverse | Wires the restatement mark; momentum is never marked (DAC-E2-S6-2), and this story writes `restated_possible = false` |
| CAP-002-E2-S7 | reverse | The 3000-instrument volume test builds through this stage (T014 only samples it) |

### Task Dependencies

- T001: No dependencies
- T002: Depends on T001
- T003: Depends on T002; T004 -> T005 -> T006 -> T007 -> T008 -> T009 are sequential, same file `test_engine_inputs_momentum.py`
- T010: Depends on T001 (new file, independent of the tests)
- T011: Depends on T001 and T010 (loads the file at import)
- T012: Depends on T010, T011
- T013: Depends on T012; T014 on T013
- T015: Depends on T014; T016 on T012
- T017: Interleaved, after every TDD cycle and before the next cycle begins
- T018: Depends on T012

### Parallel Opportunities

- Phase 2 is one test file written in order, so it is sequential; T010 (SQL) can be drafted in parallel with the tests but is verified only after T009
- T016 can run beside T013

### Phase Dependencies

- Phase 1 before everything; Phase 2 before Phase 3's T012; Phase 4 after Phase 3; Phase 5 after Phase 4

---

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (also `uv run pytest` for the full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- DAC-E2-S4-1 / DAC-E2-1: no bar before S_12 gives `return_12m` `missing` and the other two present (T004)
- DAC-E2-S4-2: a 2-for-1 split in the window gives the unsplit series' return (T005)
- DAC-E2-S4-3: a dividend of 1 on a prior close of 100 multiplies the factor by 1.01 (T006)
- DAC-E2-S4-4 / AC-7: `known_on` equals the maximum `observed_on` over bars and actions used (T007)
- DAC-E2-S4-5 / DAC-E2-6 / AC-13: a stale latest bar makes all three inputs `outdated` (T008)
- Supporting case for TC-COMP-059: unresolved line-item keys leave the three momentum inputs `present` and the set complete (T009 b); "momentum still classifies" is asserted by CAP-002-E2-S7 T014

---

## Notes

### Resolved Conflicts

- **Where the price-currency test lives.** Factor-engine section 7 puts "outdated prices: value and momentum inputs" in `tests/integration/test_engine_currency.py`; the story's Technical Details put the momentum price-currency case in `tests/integration/test_engine_inputs_momentum.py`, and S3 creates `test_engine_currency.py` as its own new module. Precedence: story ACs and technical details outrank design prose. The governing sentence is the story's Technical Details line "Tests: `tests/integration/test_engine_inputs_momentum.py` (including the momentum price-currency case).", which outranks factor-engine section 7's "Outdated prices" row naming `tests/integration/test_engine_currency.py`. DEC-0064 does not bear on this: it assigns the composition-root edits to delivered CAP-001 files and says nothing about test modules a CAP-002 story creates. The momentum currency case (TC-COMP-102) is implemented in `test_engine_inputs_momentum.py`. No design change needed.
- **Design snippet versus DEC-0055 on the dividend base.** The design SQL joins `prior_adjusted_close` on `p.before = d.effective_on` without defining `before`, and the snippet uses `daily_bar_latest`, which no migration creates. DEC-0055 (4) says "the prior session's adjusted close". Precedence: the decision's normative prose governs the snippet. `daily_bar_latest` is a CTE inside `momentum_inputs.sql`, and the prior session is the stock's latest bar strictly before the ex-date (DEC-0118). No design change needed.
- **`E` against price currency.** DEC-0055 (3) resolves `E` against the classification date minus one month; (5) defines currency against the stock's latest bar and the latest trading day held. They are independent: `E` positions the window, the latest bar (unbounded, as in S3) decides `outdated`. A stale stock with all boundaries is `outdated` with `as_of = E`.
- **Story status not changed.** The skill asks for `status` to move from `todo` to `planning`; the story is approved and any edit invalidates the approval, so the frontmatter is left as it is (constraint 7), as in the S2 and S3 plans.

### Open Gaps

- **Corporate-action revisions, stored value form and unusable payloads. PROVISIONAL — awaiting owner confirmation (2026-10-17).** No artifact says how a revised or re-acquired split or dividend counts, or what an unusable payload does. Derivation: statements use the latest observation per period; the design says a re-acquired bar is used as currently known; section 3 says an input is `missing`, never wrong; ingestion writes Decimal fields as JSON strings (`{'split_from': '1', 'split_to': '2'}`, verified), so numeric strings must be accepted. Recorded as DEC-0117. Owning design: factor-engine 2.4, at its next revision.
- **`known_on`, the dividend's split scaling, reason precedence and `as_of` for momentum. PROVISIONAL — awaiting owner confirmation (2026-10-17).** Derivation: `known_on` covers the bars and actions actually used; the design SQL scales a dividend by splits strictly after the ex-date; DEC-0116 (1) and (3) already settle precedence and `as_of` for fundamentals. A split effective on the ex-date itself is the only reading with a visible alternative and is flagged for the design's next revision. Recorded as DEC-0118. Owning design: factor-engine 2.4.
- **Line-item payload value form, aligned with S3 (cross-plan review 2026-10-18, E2-F07).** DEC-0116 (4) first counted a line-item payload value that is not a JSON number as absent, while `FundamentalStatement.value_payload()` probably serialises `Decimal` as a JSON string like `CorporateAction`. DEC-0116 (4) is now amended to accept a JSON number or a JSON string holding a plain decimal, and S3's T018 and T019 read line items through the same guard as this plan's T010 (`jsonb_typeof(...) IN ('number','string')` and `~ '^-?[0-9]+(\.[0-9]+)?$'` before any cast); S3's T001 checks `value_payload()`. Nothing in this plan changes.
- **Same-day split and dividend.** Under DEC-0118 a split effective on a dividend's ex-date scales the prior session's close but not the cash amount, following the design SQL literally. If the provider reports the dividend in post-split terms on that date this is wrong by the split ratio. Not determinable from any artifact; the owner confirms or amends at the design's next revision.
- **Window bars outside the classification date.** The latest bar is unbounded above (S3 aligned); bars later than the classification date cannot exist in practice because the build runs after acquisition. E is bounded at `D - 1 month`, so such bars never enter a return.
- Owner-directed fix (cross-plan review 2026-10-18, E2-F02): the Summary, T011 and T013 register `_momentum_inputs_stage` after the fundamentals stage and above `_STAGES.append(_classification_stage)` when that line exists. T011 drops the claim that CAP-002-E2-S5 and CAP-002-E2-S6 read `inputs`. The S5 row is reclassified from reverse to soft. — Derivation: DEC-0121 makes CAP-002-E2-S5 register `_classification_stage` last, and S5 can land before this story (graph edge S2 only). Appending would therefore put momentum after classification and fail S5's order test (S5 T012). The fundamentals-first order is DEC-0115's, because this stage inserts into the `inputs` table S3's stage creates. DEC-0119 decides that S5 reads committed `factor_input`, and S6 registers no stage (S6 T012). DEC-0115's decision text is amended to match.
- **Owner-directed fix (cross-plan review 2026-10-18, E2-F06): `momentum_inputs.sql` builds `input_name` as `concat('return_', k, 'm')` and `detail.boundary` as `concat('S_', k)`, and contains no `format()`, `||`, `{}` or `%` other than `%(name)s` placeholders (T010, T016, Phase 3 Purpose) — derivation:** the factor-engine design names only the outputs (`return_3m`, `return_6m`, `return_12m`, sections 2.1 and 2.4), not how they are built. The earlier `format('return_%sm', k)` put a bare `%s` beside the statement's `%(name)s` parameters. psycopg 3 (DEC-0052) rejects that mix ("positional and named placeholders cannot be mixed"), and S2's T010 safety test (`%(name)s` placeholders only, no `||`) also rejects it. `concat()` accepts the integer `k` from `unnest(int[])`, produces the names the `factor_input_name_matches_factor` CHECK expects, and follows the convention already stated in CAP-002-E2-S5 (Phase 3), CAP-002-E2-S6 (Phase 3) and CAP-002-E2-S7 (T009).
- Owner-directed fix (cross-plan review 2026-10-18, E2-F09): T009 (b) is a supporting case for TC-COMP-059 with no TC tag, showing only that the momentum inputs stay `present`. It no longer claims the "momentum still classifies" clause, which CAP-002-E2-S7 T014 asserts. — Derivation: this story's harness sets `_STAGES` to the fundamentals and momentum stages only, with no classification stage, so it cannot observe a classification. S7 is the only E2 story that runs every stage. The `# Implements TC-COMP-059` tag stays on CAP-002-E2-S2 T011.
- **Owner-directed fix (cross-plan review 2026-10-18, E2-F12):** S4 keeps its test helpers in the new `tests/integration/engine_momentum_support.py` and edits neither S2's `tests/integration/engine_support.py` nor S3's `tests/integration/engine_inputs_support.py`, as a plan choice rather than under DEC-0064 — derivation: DEC-0064 assigns only the composition-root edits to delivered CAP-001 files (`src/factorflow/api/app.py`, `web/src/app/shell.tsx`, `web/src/app/routes.tsx`, `web/src/api/client.ts`, migrations `0005_universes.sql` and `0006_classifications.sql`) and says nothing about test modules a CAP-002 story creates; S2's `add_bar` takes no `observed_on`, which the known_on and revision cases need, and a separate module leaves S2's and S3's support files unchanged for the other stories that import them. The home of TC-COMP-102, `tests/integration/test_engine_inputs_momentum.py`, is fixed by the story's Technical Details, not by this fix.

### Other Notes

- Stories CAP-002-E2-S1, CAP-002-E2-S5, CAP-002-E2-S6 and CAP-002-E2-S7 are classified in the table above; none is a new hard edge. `dependencies.yaml` already lists `CAP-002-E2-S4: [CAP-002-E2-S2, CAP-002-E2-S3]`; planning made no change to it.
- Under a driver that commits once per stage, the TDD-evidence file records `commit_hash: stage` (T017).
- The stage reads `constants.MOMENTUM_LAG_MONTHS` and `MOMENTUM_WINDOWS_MONTHS` through module attribute access, so no number is repeated in SQL or in `engine.py`.
