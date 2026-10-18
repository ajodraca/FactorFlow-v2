---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S5-tasks
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
  timestamp: 2026-10-17T23:55:00Z
  source_artifacts:
    - id: CAP-002-E2-S5
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S5 — Peer Sets, Composite Score and Percentile Classification

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S5.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-tasks`
**Date**: 2026-10-17

## Summary

Adds the classification half of the factor engine: `peer_sets.sql` (one `INSERT INTO classification_set_factor` for the three factors: qualified count and `ranked` at the floor of 30), `classify.sql` (one `INSERT INTO factor_classification` per factor: z-scores with the sample standard deviation, equal-weight mean, re-standardisation, `percent_rank() x 100` for the peer set, and `not_classified` rows for stocks outside it, for every stock of an unranked factor, and for retired stocks) and one stage, `engine._classification_stage`, registered last in `engine._STAGES`, plus `INPUT_LABELS` in `constants.py`, the product-vocabulary label of each input, which `classify.sql` receives as a bound array to write `reason_detail` (DEC-0120). Both statements read the committed `factor_input` rows of the build's own set joined to the active roster passed in as a parameter (DEC-0119); they read no `inputs` temporary table and no universe table, and PostgreSQL window functions do the arithmetic with no numeric library (DEC-0052, DEC-0053). Six mapped test cases (TC-COMP-067, 068, 069, 095, 107, 111) are implemented, plus a Python reference implementation of DEC-0053 used by the composite test and `hypothesis` property tests. No input is derived and no restatement mark is written here (`restated_possible` is the constant `false` until CAP-002-E2-S6).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-8 | One peer set, identical in every universe | T002, T005, T011, T014, T015, T017 |
| AC-9 | Standardised score and percentile 0 to 100 | T009, T010, T013, T015, T017 |
| AC-12 | No score unless every input present and current; name the input | T004, T008, T010, T015, T017 |
| AC-14 | Under 30 qualify: no scores, state how many qualified | T006, T014, T015, T017 |
| AC-15 | Retired stock in no peer set, shown `retired` (compute side) | T007, T010, T014, T015, T017 |
| DAC-E2-2 | Peer set is exactly the active stocks with every input present; universe-independent | T004, T005, T010, T011, T014, T015, T017 |
| DAC-E2-3 | z-score, equal-weight mean, re-standardise, `percent_rank` x 100; zero dispersion contributes 0 | T009, T013, T015, T017 |
| DAC-E2-7 | Ranked only at 30 or more; below that `not_enough_stocks` with the count | T006, T014, T015, T017 |
| DAC-E2-8 | Retired excluded from every peer set, `retired` on all three factors, no `factor_input` rows | T007, T010, T014, T015, T017 |
| DAC-E2-S5-1 | Hand-built peer set matches the arithmetic; zero dispersion gives 0; properties hold | T009, T013, T015, T017 |
| DAC-E2-S5-2 | Two of three value inputs: outside the value peer set, classified on growth and momentum | T004, T014, T015, T017 |
| DAC-E2-S5-3 | 29 qualify: unranked, `29 of 30 stocks qualified`, no score; 30 ranks | T006, T014, T015, T017 |
| DAC-E2-S5-4 | Retired: no peer set, `retired` on all three factors, no `factor_input` rows | T007, T014, T015, T017 |
| DAC-E2-S5-5 | Scores identical for zero, one or several universes; no universe table read | T005, T011, T014, T015, T017 |
| DAC-E2-S5-6 | `not_computable` input gives `input_not_computable` naming it | T008, T015, T017 |

## Phase 1: Setup

**Purpose**: Confirm the hard prerequisite exists and fix the shared test helpers.

- [ ] T001 Confirm CAP-002-E2-S2 has landed on the working branch: `src/factorflow/classification/engine.py` must define `build`, `BuildContext` (with `set_id`, `run_id`, `classification_date`, `latest_trading_day`, `active_ids`, `retired_ids`), `BuildResult` and `_STAGES`; `constants.py` must define `MIN_PEER_SET_SIZE`, `FACTORS`, `INPUT_NAMES`; `tests/integration/engine_support.py` must exist. If any is absent, STOP and report that the hard dependency CAP-002-E2-S2 is not implemented. Then read `engine.py` (how the S2 statements are loaded once at import and executed with bound parameters, how `build` reads `qualified_counts` back from `classification_set_factor`, which stages are already registered in `_STAGES`), `engine_support.py` (helper names and signatures: `migrate_through_classification`, `add_instrument`, `add_bar`, `add_run`, `add_building_set`, `count_classification_rows`) and `src/factorflow/db/migrations/0005_universes.sql` (the `universe` and `universe_event` columns T005 inserts into; E1-S1 is a transitive prerequisite through S2 and S1, so the tables exist)
- [ ] T002 Create `tests/integration/engine_classify_support.py` (a plain module, not `conftest.py`; imports from `tests.integration.engine_support` and does not edit it, a plan choice: `engine_support.py` belongs to CAP-002-E2-S2, which creates it in its T003, and CAP-002-E2-S3, CAP-002-E2-S4 and CAP-002-E2-S9 also import it with no dependency edge to this story, so an edit here would be unordered against theirs; DEC-0064 covers only files delivered by CAP-001): `INPUTS_BY_FACTOR` read from `constants.INPUT_NAMES` (never a second list); `add_factor_inputs(conn, set_id, instrument_id, factor, statuses=None, values=None)` writing one `factor_input` row per input of the factor, default every input `present` with a distinct `Decimal` value, `as_of` and `known_on` set, `detail` `{}`, and `statuses` / `values` overriding single inputs by name (a non-`present` row has `value` null, as the CHECK and DEC-0116 (5) require); `add_full_roster(conn, set_id, n_active, n_retired=0)` creating instruments, one bar for every active instrument on one date so `latest_trading_day` is defined, and `present` inputs on all eight inputs for the active ones, with values shaped so no two inputs are perfectly correlated (for example input `k` of stock `i` is `((i * (k + 3)) % n) / n + i / (10 * n)`); `run_classification_build(conn, set_id, monkeypatch)` that sets `engine._STAGES = [engine._classification_stage]` and calls `engine.build(conn, set_id, 60)` so no input stage runs; `classifications_for(conn, set_id) -> dict[(instrument_id, factor), dict]` and `factor_counts_for(conn, set_id) -> dict[factor, (qualified_count, ranked)]`; the non-committing variants used by the property test, `insert_instrument(cur, symbol, lifecycle)` and `insert_factor_inputs(cur, set_id, instrument_id, factor, values)` (same INSERT shapes as the committing helpers), and `make_context(set_id, run_id, active_ids, retired_ids) -> BuildContext`; and `reference_scores(peer: dict[int, list[Decimal]]) -> dict[int, tuple[Decimal, Decimal]]`, a pure-Python oracle of DEC-0053 written independently of the SQL with `decimal` at 40 digits of precision (sample mean and sample standard deviation per input column, a zero standard deviation giving z 0, equal-weight mean, re-standardisation, a zero composite standard deviation giving score 0, `percent_rank` as `(rank - 1) / (n - 1)` with ties sharing the lowest rank, times 100). Every committing helper commits; no pytest fixtures (depends on T001)

**Checkpoint**: The prerequisite exists and the helpers import (they fail only on the missing `_classification_stage`).

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the expected behaviour from the acceptance criteria and mapped test cases.

Database tests are marked `@pytest.mark.postgres`, carry `# Implements TC-COMP-nnn` above each mapped test and cite their AC or DEC in the docstring of each additional one. Each integration module declares its own small fixture over `engine_classify_support` that migrates, then builds the roster the test needs plus a terminal run and a `building` set. Inputs are inserted into `factor_input` directly, so these tests do not depend on CAP-002-E2-S3 or CAP-002-E2-S4. New test modules only: no delivered CAP-001 test file is edited (DEC-0064 as extended by DEC-0084), and S2's `tests/integration/engine_support.py` is left unchanged as a plan choice (T002).

### Mandatory Component Tests

- [ ] T003 Create `tests/integration/test_engine_peer_set.py` with the module-local fixture (depends on T002)
- [ ] T004 Implement TC-COMP-067 (stock with two of three value inputs is outside the value peer set) in `tests/integration/test_engine_peer_set.py`: 32 active stocks with every input `present`; stock A has `book_to_price` and `earnings_yield` `present` and `fcf_yield` with status `missing`; stock B has only two `value` rows at all (the third row absent). Assert `classification_set_factor` for `value` has `qualified_count = 30` and `ranked = true`, `growth` and `momentum` 32 and ranked; A and B are `not_classified` on `value` with `reason_code = 'input_missing'`, `reason_input` `fcf_yield`, null score and percentile, and `classified` on `growth` and `momentum` with a score and a percentile; the 30 qualifying stocks' scores and percentiles equal `reference_scores` over exactly those 30 (A's two present values and B's two rows move no statistic) (DAC-E2-S5-2, DAC-E2-2, AC-8, AC-12) (depends on T003)
- [ ] T005 Implement TC-COMP-068 (scores identical regardless of universe membership) in `tests/integration/test_engine_peer_set.py` (same file as T004, not parallel): build set 1 over 32 active stocks with no universe row in the database; then insert universes and member events per the 0005 shape read in T001 so that one stock is in no universe, one in a single universe and one in three, plus a universe holding a retired stock; finish set 1's run, add a new run and `building` set, write the same input values for set 2 and build it. Assert every `(instrument, factor)` row has the same `status`, `score`, `percentile`, `reason_code` and `reason_input` in both sets, and that the three named stocks agree in particular. The "no universe table is read" half is the static check in T011 (DAC-E2-S5-5, DAC-E2-2, AC-8) (depends on T004)
- [ ] T006 Implement TC-COMP-107 (29 qualifying stocks: not ranked; 30 ranks) in `tests/integration/test_engine_peer_set.py` (same file, not parallel), parametrised over 29 and 30 qualifying `value` stocks, each with 35 active stocks (the others have `fcf_yield` `outdated`) and every `growth` and `momentum` input present for all 35. At 29: `classification_set_factor` has `qualified_count = 29`, `ranked = false`; all 35 active stocks are `not_classified` on `value` with `reason_code = 'not_enough_stocks'`, `reason_input` null and `reason_detail = '29 of 30 stocks qualified'` (including the six stocks that also have an outdated input: the unranked reason wins); no `value` row has a score or percentile; `growth` and `momentum` are ranked and classified; `BuildResult.qualified_counts['value'] == 29`. At 30: `ranked = true`, 30 `classified` and five `not_classified` with `input_outdated` naming `fcf_yield`. Use the real `constants.MIN_PEER_SET_SIZE` (30), unpatched (DAC-E2-S5-3, DAC-E2-7, AC-14) (depends on T005)
- [ ] T007 Implement TC-COMP-111 (retired instrument in no peer set, `retired` on all three factors, no `factor_input` rows) in `tests/integration/test_engine_peer_set.py` (same file, not parallel): 31 active stocks and two retired ones, R1 with no `factor_input` rows and R2 with a full set of `present` rows inserted to prove the exclusion does not depend on their absence. Assert `qualified_count` for every factor is 31 and ranked, the statistics equal `reference_scores` over the 31 active stocks only, R1 and R2 each have exactly three `factor_classification` rows with `status = 'not_classified'`, `reason_code = 'retired'`, null `reason_input`, `reason_detail` null, null score and percentile; and the `factor_input` row count for R1 is still zero and for R2 unchanged after the build (the stage writes no `factor_input` row) (DAC-E2-S5-4, DAC-E2-8, AC-15) (depends on T006)
- [ ] T008 Implement TC-COMP-095 (`not_computable` input yields `input_not_computable` naming it) in `tests/integration/test_engine_peer_set.py` (same file, not parallel): 31 active stocks; stock P has `revenue_growth` `present` and `eps_growth` `not_computable`. Assert `growth` is `not_classified` for P with `reason_code = 'input_not_computable'`, `reason_input = 'eps_growth'`, `reason_detail = 'earnings-per-share growth not computable'`, null score and percentile, `growth` `qualified_count` is 30 and ranked, and P is classified on `value` and `momentum`. This is the "factor is not classified with that reason input" half of CAP-002-E2-S3's DAC-E2-S3-7 (DAC-E2-S5-6, AC-12) (depends on T007)
- [ ] T009 Implement TC-COMP-069 (composite arithmetic matches hand-built peer set and properties) in `tests/unit/test_composite_arithmetic.py` (new file, marked `postgres`; parallel with T003-T008: different file; depends on T002). The statements need PostgreSQL, so the file runs `peer_sets.sql` and `classify.sql` through `engine._classification_stage` on a module-scoped connection with `constants.MIN_PEER_SET_SIZE` patched to 3 inside each test (`unittest.mock.patch.object`, so hand-built peer sets stay small; the 30-stock floor is tested in T006). Every hand-built case (a) to (e) uses the `growth` factor, the only factor with two inputs (`constants.INPUT_NAMES['growth']`: `revenue_growth`, then `eps_growth`). Each stock gets a `present` `factor_input` row for both growth inputs, the first listed column being `revenue_growth` and the second `eps_growth`, so every stock meets the DEC-0119 present-count rule. Assertions read only the `growth` rows; `value` and `momentum` have no inputs in these cases, are unranked and are not asserted. Hand-built cases with literal expected values written in the test: (a) one factor, five stocks, two inputs `[1, 2, 3, 4, 5]` and `[10, 20, 30, 40, 50]`: z-scores use the sample standard deviation (the square root of 2.5), the composite equals the common z, re-standardisation leaves it unchanged, scores are `-1.264911, -0.632456, 0, 0.632456, 1.264911` and percentiles `0, 25, 50, 75, 100`; (b) two uncorrelated inputs where the composite's sample standard deviation is not 1, so re-standardisation visibly rescales to mean 0 and sample sd 1 (expected values computed by hand in the test body from the stated formulas, and asserted equal to `reference_scores`); (c) a zero-dispersion input (all values equal) contributes z 0 to every stock, so the score equals the other input's z divided by two re-standardised; (d) every input zero-dispersion: every score is 0 and every percentile 0, no division error; (e) inputs `A` and `-A`, whose composite is constant: scores 0. Assert score to 6 decimal places and percentile to 6 (DAC-E2-S5-1, DAC-E2-3, AC-9) (depends on T002)

### Additional Unit Tests

- [ ] T010 Add to `tests/integration/test_engine_peer_set.py` (same file, not parallel) the cases no mapped TC names: (a) every active and every retired instrument has exactly one `factor_classification` row per factor (`3 x (A + R)` rows) and none for any other instrument; (b) classified rows: percentile within 0 to 100 inclusive, the minimum percentile 0 and the maximum 100, score and percentile equal `reference_scores` to 6 decimals, `reason_code` and `reason_input` null; (c) an input with no `factor_input` row counts as `missing` and is named (DEC-0120); (d) reason is the first non-present input in the factor's input order, not the most severe: `earnings_yield` `not_computable` with `fcf_yield` `missing` gives `input_not_computable` naming `earnings_yield`; `book_to_price` `outdated` with `fcf_yield` `missing` gives `input_outdated` naming `book_to_price`; `reason_detail` is `'book-to-price outdated'` (DEC-0120); (e) `factor_input` rows of an earlier set with very different values do not enter the later set's statistics (`set_id` filter); (f) rows for a stock outside `ctx.active_ids` are ignored even if present and its lifecycle in the table is active; (g) `restated_possible` is false on every classification row written (the mark is CAP-002-E2-S6's); (h) `BuildResult.state == 'complete'` and `qualified_counts` has all three factors, including a factor with zero qualifying stocks (`ranked` false, every active stock `not_enough_stocks` with `'0 of 30 stocks qualified'`) (AC-8, AC-9, AC-12, AC-14, AC-15, DEC-0120) (depends on T008)
- [ ] T011 [P] Create `tests/unit/test_classify_sql_static.py` (no database): `peer_sets.sql` and `classify.sql` exist under `src/factorflow/classification/sql/`; neither contains the word `universe` (case-insensitive, comments included), neither names the `inputs` temporary table (no `FROM inputs` or `JOIN inputs`) and both read `factor_input` (DEC-0119); every parameter is a `%(name)s` placeholder from the set `set_id`, `factor`, `factors`, `input_names`, `input_labels`, `input_counts`, `min_peer_set_size`, `active_ids`, `retired_ids`; `classify.sql` uses `stddev_samp`, `percent_rank` and `avg` and `peer_sets.sql` writes only `classification_set_factor`; and no module under `src/factorflow/classification/` imports `numpy`, `scipy`, `pandas` or `statistics` (DEC-0052). `constants.INPUT_LABELS` has exactly the keys of the union of `constants.INPUT_NAMES` values. It maps them to `book_to_price` 'book-to-price', `earnings_yield` 'earnings yield', `fcf_yield` 'free-cash-flow yield', `revenue_growth` 'revenue growth', `eps_growth` 'earnings-per-share growth', `return_3m` '3-month total return', `return_6m` '6-month total return' and `return_12m` '12-month total return'. No label equals its key and none contains `_` (STD-UI-1, factor-engine section 10). `classify.sql` contains none of those eight label strings and no `replace(` call, so the labels have one table (reader design 2.6; DEC-0120). This is the "no universe table is read" half of DAC-E2-S5-5; the safety test of CAP-002-E2-S2 already forbids interpolation and mutation of other tables (AC-8, DEC-0052, DEC-0119, DEC-0120) (depends on T001)
- [ ] T012 [P] Create `tests/unit/test_classification_stage_order.py` (no database): `engine._classification_stage` is in `engine._STAGES`, and no stage named `_fundamental_inputs_stage` or `_momentum_inputs_stage` that is also registered comes after it (vacuously true until CAP-002-E2-S3 and CAP-002-E2-S4 land, strict afterwards; CAP-002-E2-S6 registers no stage, so the test guards no restatement stage); the test fails with a message telling the coder to insert the new stage above `_classification_stage` (DEC-0121; traces to DAC-E2-2, order of design 2.2 and 2.6) (depends on T001)
- [ ] T013 Add to `tests/unit/test_composite_arithmetic.py` (same file as T009, not parallel) the `hypothesis` property tests over random peer sets, `@settings(deadline=None, max_examples=40)`, each example run in `with conn.transaction(): ...; raise psycopg.Rollback` using the non-committing helpers so examples leave no rows (the set row is created once by the module fixture): each example draws `factor` from `constants.FACTORS` (`st.sampled_from`) and 3 to 12 stocks. For every stock it generates exactly `len(constants.INPUT_NAMES[factor])` `Decimal` values with four decimals in `[-1000, 1000]` (two for `growth`, three for `value` and `momentum`), the k-th value being input `constants.INPUT_NAMES[factor][k]`. Values are written with `insert_factor_inputs` for that factor only, so every generated stock has a `present` row for every input of the factor and enters its peer set under the DEC-0119 present-count rule; `constants.INPUT_NAMES` is not patched. Each example body runs under `unittest.mock.patch.object(constants, 'MIN_PEER_SET_SIZE', 3)`, as in T009, so a peer set of 3 to 12 stocks is ranked. The properties are asserted on the drawn factor's `factor_classification` rows only; the two other factors have no `factor_input` rows in the example, are unranked and are not asserted. Properties: scores and percentiles equal `reference_scores` within 2e-6 and 1e-5; the mean of the scores is 0 and the sample standard deviation 1 within 1e-5 whenever the oracle's composite dispersion is not zero; percentiles lie in 0 to 100 and are non-decreasing in score; the lowest score has percentile 0 and the highest 100 when at least two scores differ; adding a constant to one input or multiplying it by a positive constant leaves every score unchanged; permuting the stocks permutes the results and changes no value. Strategies produce distinct values, so a near-constant composite caused by numeric rounding is not generated (see Open Gaps) (DAC-E2-S5-1, DAC-E2-3, AC-9) (depends on T009)

**Checkpoint**: All tests are written and fail (no `_classification_stage`, no SQL yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass. Both SQL files hold one statement each, take only `%(name)s` parameters and never interpolate (the S2 safety test scans every `classification/sql/*.sql`; avoid `||` and `{}`, and avoid `format()` because a bare `%s` collides with parameter syntax: build text with `concat()`).

- [ ] T014 [P] Create `src/factorflow/classification/sql/peer_sets.sql`: one `INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked)` over `unnest(%(factors)s::text[], %(input_counts)s::int[]) AS f(factor, n_inputs)`, left-joined to the active instruments (`instrument_id = ANY(%(active_ids)s::bigint[])`) of this set (`set_id = %(set_id)s`) that have exactly `n_inputs` `factor_input` rows with `status = 'present'` for the factor (count of present rows equals the factor's input count, which excludes a stock with an absent row, DAC-E2-2 and DEC-0119). `qualified_count` is that count and `ranked` is `qualified_count >= %(min_peer_set_size)s`; every factor gets a row, including one with zero qualifying stocks. Reads `factor_input` only; no universe table, no `inputs` (depends on T001)
- [ ] T015 [P] Create `src/factorflow/classification/sql/classify.sql`: one `INSERT INTO factor_classification (set_id, instrument_id, factor, status, score, percentile, reason_code, reason_input, reason_detail, restated_possible)` for the single factor in `%(factor)s` with ordered `%(input_names)s::text[]` and the parallel `%(input_labels)s::text[]` (element k is the label of input k), built from CTEs over `factor_input` of this set (`set_id = %(set_id)s`) restricted to `%(active_ids)s::bigint[]`: `pf` reads this factor's `ranked` and `qualified_count` from `classification_set_factor`; `peer` is the stock whose `present` rows number `cardinality(input_names)` (the DEC-0119 rule, same as `peer_sets.sql`) with its input values; `z` is `(value - avg(value) OVER (PARTITION BY input_name)) / stddev_samp(value) OVER (PARTITION BY input_name)`, with 0 when the standard deviation is 0 (a `CASE`, never a division by zero); `composite` is `avg(z)` per stock; `scored` re-standardises it the same way over the peer set with `OVER ()`; `ranked_scores` adds `100 * percent_rank() OVER (ORDER BY score)` computed on the unrounded score (design 2.5; the column stores 6 decimal places). The statement unions four row sets: (1) `classified` rows for the peer set when `pf.ranked`; (2) `not_classified` rows for the active stocks outside the peer set when `pf.ranked`, with `reason_code` from the status of the first input in `input_names` order that is not `present`, taking an input with no row as `missing` (`input_missing`, `input_outdated`, `input_not_computable`), `reason_input` that input's name and `reason_detail` `concat(<that input's label>, ' missing' | ' outdated' | ' not computable')`. The label is the element of `%(input_labels)s` at the input's position in `%(input_names)s`; read the pair with `unnest(%(input_names)s::text[], %(input_labels)s::text[]) WITH ORDINALITY`. Example: `'free-cash-flow yield missing'`. The file holds no label text and never derives a label from the name: no `replace()`, no `CASE` over input names (DEC-0120, DEC-0130); (3) when not `pf.ranked`, `not_classified` for every active stock with `reason_code = 'not_enough_stocks'`, null `reason_input`, `reason_detail = concat(qualified_count, ' of ', %(min_peer_set_size)s, ' stocks qualified')` and no score; (4) `not_classified` with `reason_code = 'retired'`, null `reason_input` and null `reason_detail` for every id in `%(retired_ids)s::bigint[]`. `restated_possible` is the constant `false` with a comment citing CAP-002-E2-S6 and DEC-0121 (the mark is S6's). Satisfies the `factor_classification_shape` and `factor_classification_reason_input_agrees` CHECKs by construction. Reads `factor_input` and `classification_set_factor`; no universe table, no `inputs` (depends on T001)
- [ ] T016 Add `INPUT_LABELS: dict[str, str]` to `src/factorflow/classification/constants.py`, by adding only (no existing line changes). Key it by input name in `INPUT_NAMES` order, give it the eight labels T011 pins, and add a one-line comment naming its source (factor-engine section 10, reader design 2.6, UX brief section 2 item 9; DEC-0120). If `constants.py` already defines `INPUT_LABELS`, do not define a second one. Then add `_classification_stage` to `src/factorflow/classification/engine.py` (depends on T014, T015; edit only by adding): load `peer_sets.sql` and `classify.sql` once at import beside the other statements; `_classification_stage(conn, ctx)` running on the build's connection, in order, `peer_sets.sql` once (parameters `set_id`, `factors = list(constants.FACTORS)`, `input_counts = [len(constants.INPUT_NAMES[f]) for f in constants.FACTORS]`, `min_peer_set_size`, `active_ids`) and then `classify.sql` once per factor in `constants.FACTORS` order (parameters `set_id`, `factor`, `input_names = list(constants.INPUT_NAMES[factor])`, `input_labels = [constants.INPUT_LABELS[n] for n in constants.INPUT_NAMES[factor]]`, `min_peer_set_size`, `active_ids`, `retired_ids`). Read `constants.MIN_PEER_SET_SIZE`, `FACTORS`, `INPUT_NAMES` and `INPUT_LABELS` through module attribute access at call time (tests patch the floor; no number is repeated here). Register it as the last statement of the module, `_STAGES.append(_classification_stage)`, with a comment that stages producing inputs are inserted above this line (DEC-0121). No numeric library, no `ingestion` import
- [ ] T017 Make the tests pass by running them in file order, fixing only the files named in T014 to T016 (depends on T014, T015, T016)

**Checkpoint**: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` pass for the new tests; after the stage every active and retired instrument has one row per factor.

---

## Phase 4: Integration

**Purpose**: Confirm the stage fits the repository's gates and the package's other tests.

- [ ] T018 Run every command in the Validation Plan from the repository root and fix failures in files this plan names; a failure in any other file is reported, not patched. Confirm the S2 safety test (`tests/unit/test_engine_sql_safety.py`) and ship test (`tests/unit/test_classification_sql_ships.py`) pass over the two new `.sql` files without edits to them, and that `uv build --wheel` output contains `classification/sql/peer_sets.sql` and `classification/sql/classify.sql` (the `classification/sql/*.sql` glob is already in `pyproject.toml`; this plan does not edit it) (depends on T017)
- [ ] T019 Run the classification stage once, outside the test suite, over 3000 active instruments with all eight inputs `present` (24,000 `factor_input` rows) with `EXPLAIN (ANALYZE, BUFFERS)` on `peer_sets.sql` and one `classify.sql` call, and record in the commit message whether either exceeds 10 seconds or sequentially scans `factor_input` beyond the set's own rows. A signal for CAP-002-E2-S7's volume test, not a gate here (the 5-minute budget, AC-11, is asserted there) (depends on T018)

**Checkpoint**: The whole suite is green with the stage in place.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T020 Re-read traceability: each of the six mapped tests carries `# Implements TC-COMP-nnn`, each additional test cites its AC or DEC in its docstring; confirm `git diff --stat` touches only the files named in this plan (new files, plus additions to `engine.py` and the `INPUT_LABELS` addition to `constants.py` (T016), with no existing line of either changed; nothing in `tests/conftest.py`, `tests/integration/engine_support.py`, `pyproject.toml`, or any delivered or sibling-story test)
- [ ] T021 After each TDD cycle in T003-T019 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S5-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S2 | hard | Existing graph edge. Supplies `engine.build`, `_STAGES`, `BuildContext`, `constants.py` (`MIN_PEER_SET_SIZE`, `FACTORS`, `INPUT_NAMES`) and `tests/integration/engine_support.py` this stage imports (T001); T016 adds `INPUT_LABELS` to that `constants.py` by adding only |
| CAP-002-E2-S1 | context | Transitive through S2: the four classification tables and their CHECKs. This plan imports no S1 file |
| CAP-002-E1-S1 | context | Transitive through S1 and S2: T005 inserts universe rows into the tables migration 0005 creates; no code is imported |
| CAP-002-E2-S3 | soft | Both develop against the `factor_input` table of S1. S3 writes the rows this stage reads; S5's tests insert `factor_input` rows directly (T002) and the story says it is developable in parallel. This plan reads `factor_input`, never S3's `inputs` temporary table (DEC-0119), and S3's plan classifies S5 as soft |
| CAP-002-E2-S4 | soft | Same as S3 for the momentum rows; S4 inserts into `inputs` and writes `factor_input`, which is all S5 reads |
| CAP-002-E2-S6 | reverse | Edits `classify.sql` to carry the restatement mark onto the classification (S6 Dependencies); this story writes `restated_possible = false` (DEC-0121) |
| CAP-002-E2-S7 | reverse | The 3000-instrument volume test builds through this stage (T019 only samples it) |
| CAP-002-E3-S3 | reverse | Imports `INPUT_LABELS` from `constants.py`, which this story adds, for each evidence input's `label` (reader design 2.6: the same table `reason_detail` is written from; DEC-0130; edge `CAP-002-E3-S3 -> CAP-002-E2-S5` in the E3 graph, cross-plan review E3-F05) |
| CAP-002-E2-S8 | context | Creates the `building` set a build receives; S5 tests create sets through the S2 helper |
| CAP-002-E2-S9 | context | Calls `build`; this story adds no scheduler code |

### Task Dependencies

- T001: No dependencies
- T002: Depends on T001
- T003: Depends on T002; T004 -> T005 -> T006 -> T007 -> T008 -> T010 are sequential, same file `test_engine_peer_set.py`
- T009 -> T013: sequential, same file `test_composite_arithmetic.py`; T009 depends on T002
- T011, T012: Depend on T001 only (no database), different files
- T014, T015: Depend on T001; independent files
- T016: Depends on T014, T015 (adds `INPUT_LABELS` to `constants.py` and edits `engine.py`, both by adding)
- T017: Depends on T014, T015, T016
- T018: Depends on T017; T019 on T018
- T020: Depends on T019
- T021: Interleaved, after every TDD cycle and before the next cycle begins

### Parallel Opportunities

- Phase 2: the peer-set chain (T003-T008, T010), the composite chain (T009, T013), T011 and T012 touch different files and can run in parallel
- Phase 3: T014 and T015 can run in parallel; T016 follows them

---

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (also `uv run pytest` for the full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- DAC-E2-S5-1 / DAC-E2-3: hand-built peer sets match literal expected scores, a zero-dispersion input contributes 0, the properties hold over random peer sets (T009, T013)
- DAC-E2-S5-2 / DAC-E2-2: a stock with two of three value inputs is outside the value peer set and classified on growth and momentum (T004)
- DAC-E2-S5-3 / DAC-E2-7: 29 qualify gives an unranked factor with `29 of 30 stocks qualified` and no score; 30 ranks (T006)
- DAC-E2-S5-4 / DAC-E2-8: a retired instrument is in no peer set, is `retired` on three factors and has no `factor_input` rows (T007)
- DAC-E2-S5-5: scores identical across universe memberships; no universe table is named in the SQL (T005, T011)
- DAC-E2-S5-6: a `not_computable` input gives `input_not_computable` naming it (T008)

---

## Notes

### Resolved Conflicts

- **Design 2.5 and DEC-0115 read the `inputs` temporary table; the story reads `factor_input`.** Factor-engine 2.5's illustrative `classify.sql` joins `inputs` and an `active_roster`, DEC-0115 said the tables were kept "so S5 can read `inputs`", and the CAP-002-E2-S3 plan listed S5 as a reverse consumer of `inputs` (both corrected by the cross-plan review of 2026-10-18, E2-F02). The story's Technical Details say S5 is developable in parallel with S3 and S4 and "its tests insert `factor_input` rows directly", and the dependency graph gives S5 only the edge to S2. Governing rule: story text outranks the design's illustrative snippet and a sibling plan. Inside one transaction `factor_input` holds exactly what `insert_inputs.sql` copies from `inputs`, so a real build gives the same result. Established by: the story's Dependencies and Implementation sections, and design 2.5 being a snippet ("one factor; the factor and its input names are parameters"). Recorded as DEC-0119. S3's coder need not keep `inputs` alive for this story.
- **The snippet's peer-set condition versus DAC-E2-2.** The snippet's `NOT EXISTS (... status <> 'present')` admits a stock whose row for an input is absent, while DAC-E2-2 and TC-COMP-067 require every input to be `present`. Governing rule: story and epic ACs outrank the design snippet. The plan counts `present` rows against the factor's input count (T014, T015). Established by: DAC-E2-2, DAC-E2-S5-2. No design change needed beyond updating the illustrative snippet at its next revision.
- **TC-COMP-111 "the build runs" versus a stage-only test.** The retired and peer-set tests run the full `build` with `_STAGES` reduced to the classification stage (T002), so completion, `qualified_counts` and the row writes are observed together, while the hypothesis tests call the stage directly with a hand-made `BuildContext` inside a rolled-back transaction. Both read the same SQL.
- **Design 2.1 puts the composite test behind "a test double".** The arithmetic exists only as SQL, so a double that avoids PostgreSQL would not test it. T009 and T013 run the real statements and use a pure-Python oracle (`reference_scores`) as the independent expectation. Established by: factor-engine section 7 ("`hypothesis` over random peer sets") and DAC-E2-S5-1.
- **Story status not changed.** The skill asks for `status` to move from `todo` to `planning`; the story is approved and any edit invalidates the approval, so the frontmatter is left as it is (constraint 7), as in the CAP-002-E2-S2 to S4 plans.

### Open Gaps

- **Reason text, absent input rows, and `reason_detail` for retired stocks. PROVISIONAL — awaiting owner confirmation (2026-10-17).** The designs fix the vocabulary of `reason_detail`:
  - Factor-engine section 2.5 builds it from the input label and cause; section 10 requires product vocabulary, never a payload key (STD-UI-1), and names `LineItem.label` (the line-item labels of 2.5's examples, which need the per-input `detail` of S3 and S4).
  - Reader design 2.6 names one label table for both the reader's `label` and the engine's `reason_detail`.
  - UX brief section 2 item 9 lists the eight labels, which `constants.INPUT_LABELS` holds (see the owner-directed fix below).

  No artifact fixes:
  - the sentence shape (design 2.5's three examples depend on per-input `detail` shapes of S3 and S4);
  - what an active stock with no `factor_input` row for an input is;
  - what `reason_detail` a `retired` row carries.

  The richer line-item form section 10 describes (a sentence built from `LineItem.label` and the cause) stays within this PROVISIONAL sentence-shape gap: this plan names the input, and the line-item form waits on the per-input `detail` of S3 and S4.

  Derivation:
  - AC-12 needs only the input named, which `reason_input` does, and the UI renders its own sentences from `reason_code` and `reason_input`. So the sentence is the label followed by the status in words, for example `'book-to-price outdated'`.
  - DAC-E2-2 requires every input present, so an absent row is not present, and reading it as `missing` is the safest choice.
  - A `retired` row's reason is complete in its code.

  Recorded as DEC-0120. Owning design: factor-engine 2.5 and 10, at their next revision (section 10 names `LineItem.label`), to say whether richer text is wanted. The label values are DEC-0130's, and CAP-002-E3-S3 imports the same `constants.INPUT_LABELS` for each evidence input's `label`, so the table's keys stay exactly the names of `INPUT_NAMES` and its values change only with DEC-0130. Owner-directed fix (cross-plan review 2026-10-18, E3-F05): `constants.INPUT_LABELS`, added by this story, is the single label table for `classify.sql`'s `reason_detail` and the reader's evidence `label`, with DEC-0130's values — derivation: reader design 2.6 names one table for both, but CAP-002-E3-S3 had kept a second one in `reader.py` while this plan wrote `reason_detail` from the input name with underscores shown as spaces. The engine cannot import `reader.py`, so the table sits in `constants.py`, which both modules import.
- Owner-directed fix (cross-plan review 2026-10-18, E2-F15): this plan adopts the following.
  - `INPUT_LABELS: dict[str, str]`, added to `src/factorflow/classification/constants.py` by T016: `book_to_price` 'book-to-price', `earnings_yield` 'earnings yield', `fcf_yield` 'free-cash-flow yield', `revenue_growth` 'revenue growth', `eps_growth` 'earnings-per-share growth', `return_3m` '3-month total return', `return_6m` '6-month total return', `return_12m` '12-month total return'.
  - The bound placeholder `%(input_labels)s::text[]`, parallel to `%(input_names)s` and allowed by T011.
  - `reason_detail = concat(label, ' missing' | ' outdated' | ' not computable')` in `classify.sql`, replacing the underscores-to-spaces name.

  Derivation:
  - Factor-engine section 2.5 names the input label, section 10 requires product vocabulary and never a payload key, and reader design 2.6 says one table serves the reader's `label` and the engine's `reason_detail`.
  - The table is therefore Python, where the reader can import it (factor-engine must not import the reader), and not a `CASE` copy inside the SQL.
  - The values are the UX brief section 2 item 9 / UX design section 1.6 vocabulary, identical to the eight labels DEC-0130 adopts for the reader.
  - `constants.py` is the CAP-002-E2-S2 module this story already hard-depends on, so placing the table there adds no edge to this story's own dependencies (the reader's import adds `CAP-002-E3-S3 -> CAP-002-E2-S5` to the E3 graph, cross-plan review E3-F05).
  - CAP-002-E3-S3 imports and re-exports this `constants.INPUT_LABELS` for each evidence input's `label` instead of defining its own table in `reader.py` (its T008, T016, T020; cross-plan review E3-F05; DEC-0130), through the edge `CAP-002-E3-S3 -> CAP-002-E2-S5` in the E3 graph.
- **Stage registration order and the restatement constant. PROVISIONAL — awaiting owner confirmation (2026-10-17).** S5 can land before S3, S4 and S6 (graph edge S2 only), and no artifact says where a stage registers. Derivation: design 2.2 and 2.6 fix the order inputs, peer sets, classification; the classification stage registers last, input stages are inserted above it, and a test fails if an input stage follows it. `restated_possible` is the constant false because S6's story is where the mark is carried onto the classification, as S3 and S4 do for inputs. Recorded as DEC-0121. S3 and S4 planners and coders must insert above `_STAGES.append(_classification_stage)` rather than append after it; S6 registers no stage (design 2.2 and 2.6 list no restatement stage, and design 2.4 and 2.5 carry the mark inside the input SQL and `classify.sql`, which is all the CAP-002-E2-S6 plan edits); the S3 and S4 plans carry this rule since the cross-plan review of 2026-10-18 (E2-F02).
- **Near-constant composite caused by numeric rounding. Not decided; reported.** DAC-E2-3 says zero dispersion contributes zero, and the SQL tests it exactly (`stddev_samp(...) = 0`). If two inputs are mathematically opposite but `numeric` division leaves a composite spread of, say, 1e-17, the re-standardisation divides by a tiny non-zero number and returns noise instead of 0. No artifact fixes a tolerance, so none is invented here; T009 (e) pins the exact-symmetry case (`A` and `-A`) and T013's strategies avoid generating the rounding case. If the coder observes the artefact in either test, report it to the owner rather than adding a bound.
- **Payload keys for the seven line items remain the owner's question** (system design section 8 question 1, factor-engine section 14 question 1). It blocks S3's real values, not this story: S5 reads `factor_input` and its tests insert their own rows.
- Owner-directed fix (cross-plan review 2026-10-18, E2-F14): T013 draws `factor` from `constants.FACTORS` and generates exactly `len(constants.INPUT_NAMES[factor])` inputs per stock (two for `growth`, three for `value` and `momentum`), with `constants.MIN_PEER_SET_SIZE` patched to 3 as in T009, instead of generating 1 to 3 inputs of `value`; T009's hand-built cases (a) to (e) name `growth`. — DEC-0119 admits a stock to a peer set only when its `present` rows number the factor's input count (T014, T015), and CAP-002-E2-S2 T012 fixes `INPUT_NAMES` at three `value` inputs and two `growth` inputs. A `value` example with one or two inputs therefore has an empty peer set and an unranked factor, while `reference_scores` scores the generated columns, so the property could never hold. Drawing the factor needs no patch of `INPUT_NAMES`, whereas T020 forbids changing any existing line of `constants.py`, and replacing that dict in a test would break T016's `input_counts`, which reads every factor. A one-input composite is not generated because no factor has one input. No approved artifact fixes the input counts a test generates.
- Owner-directed fix (cross-plan review 2026-10-18, E2-F18): T002 and the Phase 2 introduction no longer cite DEC-0064 for leaving `tests/integration/engine_support.py` unchanged. That rule is now a plan choice, and DEC-0064 is cited only for not editing delivered CAP-001 test files. Derivation: DEC-0064 assigns one owner to each edit of a delivered CAP-001 file (`app.py`, `shell.tsx`, `routes.tsx`, `client.ts`, migrations 0005 and 0006). DEC-0084 adds named delivered test files to that list. Neither says anything about a module one CAP-002 story creates for another. `engine_support.py` is created by CAP-002-E2-S2 T003, and `dependencies.yaml` gives CAP-002-E2-S3, CAP-002-E2-S4 and CAP-002-E2-S9, which also import it, no edge with this story. So S5 keeps its helpers in its own `tests/integration/engine_classify_support.py` rather than extending S2's file. File placement and T020's no-touch list are unchanged.

### Other Notes

- Stories CAP-002-E1-S1, CAP-002-E2-S1, CAP-002-E2-S3, CAP-002-E2-S4, CAP-002-E2-S6, CAP-002-E2-S7, CAP-002-E2-S8, CAP-002-E2-S9 and CAP-002-E3-S3 are classified in the table above; none is a new hard edge. `dependencies.yaml` already lists `CAP-002-E2-S5: [CAP-002-E2-S2]`; planning made no change to it.
- A stock with the same `score` after rounding to six decimals keeps the percentile computed from the unrounded score; ties in the unrounded score share the lowest rank, which is `percent_rank()`'s behaviour, and an all-equal peer set (every score 0) gets percentile 0 for every stock.
- Unranked factors still receive a `classification_set_factor` row with the true `qualified_count`, which `build` returns in `BuildResult.qualified_counts`.
- Under a driver that commits once per stage, the TDD-evidence file records `commit_hash: stage` (T021).
