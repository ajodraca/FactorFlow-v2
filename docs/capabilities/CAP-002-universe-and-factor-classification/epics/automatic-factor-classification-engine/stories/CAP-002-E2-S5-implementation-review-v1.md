---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S5-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
story_id: "CAP-002-E2-S5"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S5.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-28T23:20:47Z"
reviewed_head: "31d8c881091a7043ed67d1d9bbe836e345d2baba"
review_base: "7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184"
reviewed_state_revision: "sha256:7a094744901715f5469b5f69016ff4f010b4cba6a63a4901d819c5674c135695"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E2-S5
    artifact_version: 1
    content_revision: sha256:c3bdfefa6b739ad335a3e9427bc9f610f1481a2ef37d94cc8c82b25cadd72244
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-28T23:40:05Z
  source_artifacts:
    - id: CAP-002-E2-S5
      version: "1 (sha256:c3bdfefa6b739ad335a3e9427bc9f610f1481a2ef37d94cc8c82b25cadd72244)"
    - id: CAP-002-E2-S5-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E2-S5-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-factor-engine-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S5 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 1 |
| Low findings | 0 |
| Acceptance criteria | 15/15 satisfied |
| Planned tasks | 20/21 verified |
| Required validation | 17/18 passed |

The production code does what the story asks. `peer_sets.sql` counts a stock only when its `present` rows number the factor's inputs. `classify.sql` implements DEC-0053 with window functions and writes exactly one row per active and retired instrument per factor. The stage is registered last (DEC-0121). Every required build, suite, lint, format, type, package-data and TDD-evidence command passes on `31d8c88`: the full Python suite (1513 passed, 1 xfailed), PostgreSQL (458), Vitest (352) and Playwright (18).

The gate fails on test strength (E.9). I ran 94 mutants: 33 from the shared catalogue, the coder's 33 hand-written mutants re-run, and 28 of my own. 63 were killed and 31 survived. 27 of the survivors are equivalent against the contract. Four are not, and no test kills them:

- **IR-001 (HIGH).** TC-COMP-069 does not pin T015's rule that the percentile ranks the unrounded score. Ranking on `round(score, 6)` passes every test, yet changes the percentiles of stocks whose stored scores are equal.
- **IR-002 (HIGH).** The T010(d) test checks "first non-present input in the factor's order" only on `value`, whose order happens to be alphabetical. Ordering the gap by input name, by label, or not at all passes every test. That would rename the reason input on `growth` and `momentum`.
- **IR-003 (MEDIUM, owner question).** The plan's open gap is real, and I reproduced it. When inputs cancel mathematically, the composite still has a tiny spread after rounding, so the re-standardisation produces noise instead of 0.

**By severity:** CRITICAL 0 · HIGH 2 · MEDIUM 1 · LOW 0 · **total 3**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S5.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S5-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S5` |
| HEAD | `31d8c881091a7043ed67d1d9bbe836e345d2baba` (stage commit) |
| Review base | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` → `7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184` (merge of PR #140, an ancestor of HEAD) |
| Working tree | Clean before and after validation (`git status --porcelain --untracked-files=all` empty); only git-ignored build products present |
| Changed files reviewed | 88 (84 added, 4 modified), all in `7646ab7..31d8c88`; no staged, unstaged or untracked files |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review` reported `READY`. The prerequisite check exited 0. `artifact-gate.py require` passes for the story: `approved`, and its revision equals the approval's `reviewed_revision`, because the `status: planning → in-review` edit is outside the revision. The task plan is `draft` without an approval block, as every CAP-002-E2 plan is.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/sql/peer_sets.sql` | added | T014; AC-14, DAC-E2-2, DAC-E2-7 |
| `src/factorflow/classification/sql/classify.sql` | added | T015; AC-8, AC-9, AC-12, AC-14, AC-15 |
| `src/factorflow/classification/engine.py` | modified (additions only) | T016: `constants` import, two statement loads, `_classification_stage`, `_STAGES.append` as the last statement |
| `src/factorflow/classification/constants.py` | modified (additions only) | T016: `INPUT_LABELS` (DEC-0120, DEC-0130) |
| `tests/integration/engine_classify_support.py` | added | T002 |
| `tests/integration/test_engine_peer_set.py` | added | T003–T008, T010 |
| `tests/unit/test_composite_arithmetic.py` | added | T009, T013 |
| `tests/unit/test_classify_sql_static.py` | added | T011 |
| `tests/unit/test_classification_stage_order.py` | added | T012 |
| `docs/.../stories/CAP-002-E2-S5.md` | modified (`status` only) | Story-coding bookkeeping; outside the approval revision |
| `docs/.../stories/CAP-002-E2-S5-tasks.md` | modified (21 checkboxes only) | Bookkeeping; see IR-002 for T010 |
| `docs/.../stories/CAP-002-E2-S5-tdd-evidence.yaml` | added | T021 |
| `docs/.../stories/CAP-002-E2-S5-evidence/cycle-1.patch`, `full-suite-cycle-1.log`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`, `red-cycle-1-classification.log`, `t019-explain-cycle-1.log` | added | T019, T021 evidence |
| `docs/.../stories/CAP-002-E2-S5-evidence/mutation-cycle-1-results-logs/*.log` (70 files) | added | T021 mutation evidence |

No file outside the plan was changed. Nothing touched `tests/conftest.py`, `tests/integration/engine_support.py`, `pyproject.toml`, or any delivered or sibling-story test (T020). The code portion of `cycle-1.patch` is byte-identical to `git diff 7646ab7..HEAD -- src tests`, minus the `index` lines. Its sha256, `cf03ebcc…`, equals the evidence's `diff_sha256`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-8 | SATISFIED | `classify.sql` `peer_ids`/`peer` read `factor_input` of the set joined to `active_ids`; no universe table named | `test_scores_are_identical_whatever_the_universe_membership` (TC-COMP-068); `test_statement_never_names_a_universe_table` | One peer set per factor; membership cannot reach either statement |
| AC-9 | SATISFIED | `classify.sql:46-70` (`z`, `composite`, `scored`, `ranked_scores`) | TC-COMP-069 cases (a)–(e) and properties; `test_classified_rows_carry_the_reference_scores_over_the_full_percentile_range` | Compute side. See IR-001 for the unrounded-rank rule |
| AC-12 | SATISFIED | `classify.sql` `first_gap` and row set 2: `reason_code` `input_<status>`, `reason_input` named, absent row read as `missing` | TC-COMP-067, TC-COMP-095, `test_the_reason_is_the_first_input_not_present_in_factor_order`, TC-COMP-107 at 30 | The input is always named. Which input is named on multi-gap growth/momentum stocks is not pinned (IR-002) |
| AC-14 | SATISFIED | `peer_sets.sql:10` `>= %(min_peer_set_size)s`; `classify.sql` row set 3 `concat(qualified_count, ' of ', floor, …)` | TC-COMP-107 [29] and [30]; `test_every_instrument_gets_one_unmarked_row_per_factor_and_every_factor_a_count` ('0 of 30'); `test_the_unranked_reason_states_the_floor_in_force` | `BuildResult.qualified_counts['value'] == 29` asserted |
| AC-15 | SATISFIED | `classify.sql` row set 4 over `retired_ids`; peer CTEs join only `active_ids` | TC-COMP-111 (R1 without rows, R2 with a full set of `present` rows) | The stage writes no `factor_input` row (counts 0 and 8 before and after) |
| DAC-E2-2 | SATISFIED | `peer_sets.sql:13-20` and `classify.sql:29-38`: present rows `=` input count, same rule in both | TC-COMP-067 (status `missing` and absent row both excluded); `test_a_stock_outside_the_active_roster_is_ignored`; TC-COMP-068 | The PK and `factor_input_name_matches_factor` CHECK make the count rule exact |
| DAC-E2-3 | SATISFIED | `classify.sql:48`, `:61` `CASE WHEN stddev_samp(...) = 0 THEN 0` | Cases (c), (d), (e); properties | Computed zero dispersion gives 0, with no division by zero. Mathematically zero dispersion that rounding leaves non-zero is the plan's open gap (IR-003) |
| DAC-E2-7 | SATISFIED | As AC-14 | TC-COMP-107; the '0 of 30' case | Every active stock, including the outdated ones, gets `not_enough_stocks` |
| DAC-E2-8 | SATISFIED | As AC-15 | TC-COMP-111 | Three `retired` rows per retired instrument, null `reason_detail` (DEC-0120) |
| DAC-E2-S5-1 | SATISFIED | As AC-9 | TC-COMP-069 literal cases (a)–(e) to 6 dp; oracle `reference_scores`; properties under 40 examples | Stable under 8 additional `--hypothesis-seed` runs. Test is WEAK on T015's rank rule (IR-001) |
| DAC-E2-S5-2 | SATISFIED | As DAC-E2-2 | TC-COMP-067: `value` (30, ranked), A and B `input_missing` `fcf_yield`, classified on growth and momentum; value statistics equal the oracle over the 30 | — |
| DAC-E2-S5-3 | SATISFIED | As AC-14 | TC-COMP-107 [29]: (29, false), 35 rows `'29 of 30 stocks qualified'`, no score; [30]: ranked, 30 classified, 5 `input_outdated` `fcf_yield` | Uses the real `MIN_PEER_SET_SIZE` |
| DAC-E2-S5-4 | SATISFIED | As AC-15 | TC-COMP-111 | — |
| DAC-E2-S5-5 | SATISFIED | No universe table in either statement | TC-COMP-068 (0, 1 and 3 universes, plus a universe holding a retired stock); static `universe` scan | — |
| DAC-E2-S5-6 | SATISFIED | `first_gap` with `status = 'not_computable'` → `input_not_computable` | TC-COMP-095: `eps_growth`, `'earnings-per-share growth not computable'`, growth (30, ranked), P classified on value and momentum | — |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `engine.build`, `BuildContext`, `_STAGES`, `constants.MIN_PEER_SET_SIZE/FACTORS/INPUT_NAMES`, `tests/integration/engine_support.py` all exist at `7646ab7` | — |
| T002 | complete | VERIFIED | `tests/integration/engine_classify_support.py`: committing and non-committing helpers, `make_context`, `reference_scores` at 40 digits | `roster_value` uses `i/(10 n²)`, not the plan's `i/(10 n)`. Values stay distinct and not collinear; harmless |
| T003 | complete | VERIFIED | Module fixture `store` in `test_engine_peer_set.py` | — |
| T004 | complete | VERIFIED | `test_stock_with_two_of_three_value_inputs_is_outside_the_value_peer_set` | — |
| T005 | complete | VERIFIED | `test_scores_are_identical_whatever_the_universe_membership` | — |
| T006 | complete | VERIFIED | `test_a_factor_ranks_only_from_thirty_qualifying_stocks[29/30]` | — |
| T007 | complete | VERIFIED | `test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` | — |
| T008 | complete | VERIFIED | `test_a_not_computable_input_is_named_as_the_reason` | — |
| T009 | complete | VERIFIED | Cases (a)–(e) in `test_composite_arithmetic.py:117-193`, with literal values | See IR-001 for the rank rule no case pins |
| T010 | complete | PARTIAL | (a), (b), (c), (e), (f), (g) and (h) are implemented. (d) is implemented exactly as worded, on `value` only | (d)'s stated concern, "first non-present input in the factor's input order", is not covered on a factor whose order differs from alphabetical. Three non-equivalent mutants survive (IR-002). Checked box without full evidence |
| T011 | complete | VERIFIED | `test_classify_sql_static.py`, 24 tests, each detector with a self-test | — |
| T012 | complete | VERIFIED | `test_classification_stage_order.py` | Vacuous until S3 and S4 register input stages, as the plan intends |
| T013 | complete | VERIFIED | `test_properties_hold_over_random_peer_sets` | Two justified deviations. `assume` skips examples with composite dispersion below 1e-9 (the plan's open gap; IR-003). The top percentile is asserted 100 only when the top score is unique, because `percent_rank` gives tied rows the lowest rank |
| T014 | complete | VERIFIED | `peer_sets.sql` | `LEFT JOIN LATERAL` instead of a plain left join; equivalent |
| T015 | complete | VERIFIED | `classify.sql`: four row sets, label from bound `input_labels`, no label text, no `replace(` | Behaviour correct. Its rank-on-unrounded-score rule is untested (IR-001) |
| T016 | complete | VERIFIED | `constants.INPUT_LABELS`; `_classification_stage`; `_STAGES.append(...)` as the last statement | Both files changed by additions only (`git diff` shows no `-` code lines) |
| T017 | complete | VERIFIED | Focused run: 83 passed (46 story tests plus the S2 safety, constants and ships tests) | — |
| T018 | complete | VERIFIED | Every Validation Plan command passes (Independent Validation). The wheel contains `classification/sql/peer_sets.sql` and `classify.sql` | — |
| T019 | complete | VERIFIED | `t019-explain-cycle-1.log`; recorded in the commit message (about 9–11 ms and 50 ms; the seq scan of `factor_input` after ANALYZE) | A signal for S7, not a gate |
| T020 | complete | VERIFIED | Six `# Implements TC-COMP-nnn` markers. Every additional test cites an AC or DEC. The diff is limited to planned files | — |
| T021 | complete | VERIFIED | `check-tdd-evidence.py … --require-logs`: 0 errors, 0 warnings. The RED log's test-file sha256 values equal the committed files; every RED failure is the missing stage, SQL or labels | One cycle, `commit_hash: stage` |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_stock_with_two_of_three_value_inputs_is_outside_the_value_peer_set` / TC-COMP-067 | ADEQUATE | Counts per factor, the full reason tuple for both the `missing` row and the absent row, classification on the other two factors, the oracle over exactly the 30 | none |
| `test_scores_are_identical_whatever_the_universe_membership` / TC-COMP-068 | ADEQUATE | Builds two sets over identical inputs, before and after universes exist, and compares every row; memberships 0/1/3 are asserted | none |
| `test_common_z_scores_are_already_standardised`, `test_uncorrelated_inputs_are_re_standardised`, `test_a_zero_dispersion_input_contributes_zero`, `test_every_input_without_dispersion_scores_zero_without_dividing_by_zero`, `test_opposite_inputs_cancel_to_a_constant_composite`, `test_properties_hold_over_random_peer_sets` / TC-COMP-069 | WEAK | Literal 6-dp scores and percentiles; an independent 40-digit oracle; mean-0 and sd-1, range, monotonicity, shift, scale and permutation properties. Kills sample-sd, max-not-mean, cume_dist, DESC, the 101× factor and both zero-dispersion `THEN` mutants at the score step | `percent_rank() OVER (ORDER BY round(score, 6))` survives (IR-001). T015 requires ranking on the unrounded score |
| `test_a_not_computable_input_is_named_as_the_reason` / TC-COMP-095 | ADEQUATE | Reason code, input, label sentence, null score; growth count 30; P classified elsewhere | none for its single-gap scenario |
| `test_a_factor_ranks_only_from_thirty_qualifying_stocks` / TC-COMP-107 | ADEQUATE | 29 and 30 against the real floor; every value row's tuple; `BuildResult.qualified_counts`; the `>` mutant on the floor is killed | none |
| `test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` / TC-COMP-111 | ADEQUATE | R2's `present` rows prove the exclusion is by roster; `factor_input` counts unchanged | none |
| `test_classified_rows_carry_the_reference_scores_over_the_full_percentile_range` (T010 b) | ADEQUATE | Oracle match, 0 and 100 endpoints, null reasons, `3 × 31` rows | none |
| `test_the_reason_is_the_first_input_not_present_in_factor_order` (T010 c, d) | WEAK | Absent counts as missing; first-in-order beats most-severe on `value` | `value`'s order is alphabetical (`book_to_price` < `earnings_yield` < `fcf_yield`), so ordering by name, by label, or not at all survives (IR-002) |
| `test_an_earlier_sets_inputs_enter_no_statistic_of_a_later_set` (T010 e) | ADEQUATE | Each set-filter mutant (peer, peer_ids, values, gap, pf) is killed | none |
| `test_a_stock_outside_the_active_roster_is_ignored` (T010 f) | ADEQUATE | Calls the stage directly with a narrowed roster; the roster-filter mutants are killed | none |
| `test_every_instrument_gets_one_unmarked_row_per_factor_and_every_factor_a_count` (T010 a, g, h) | ADEQUATE | Exact key set, the four status/reason kinds, `restated_possible` false, '0 of 30' | none |
| `test_the_unranked_reason_states_the_floor_in_force` | ADEQUATE | Kills a literal floor in either call | none |
| `test_classify_sql_static.py` (T011) | ADEQUATE | Each rule has a self-test that can fail; labels pinned exactly | none |
| `test_classification_stage_order.py` (T012) | ADEQUATE | Registration and order rule with a failing self-test | Vacuous until an input stage exists, by plan |

**Isolation and determinism.** Each integration test uses its own database. The composite module uses a module-scoped database and rolls back every case and every hypothesis example. The property test passed under 8 extra seeds (101, 202, …, 808). No test depends on time or network beyond the testcontainer.

**Mutation (E.9).** I regenerated mutants with `mutation-run.py generate` over `7646ab7..HEAD`: 33 catalogue mutants, all in the two SQL files. No catalogue operator matches the added Python lines. I also re-ran the coder's 33 manual mutants and added 28 of my own over the SQL and `engine.py`, for 94 in total: 63 killed and 31 survived. Survivors and their dispositions:

| Survivor(s) | Disposition | Contract reasoning |
|-------------|-------------|--------------------|
| 22 catalogue mutants on `--` comment lines: `classify.sql` lines 1, 3 (×2), 5, 6 (×2), 8, 11 (×2), 13 (×2), 14 (×2), 67, 87 (×2), 88; `peer_sets.sql` lines 1, 4 (×2), 5 (×2) | equivalent | PostgreSQL discards SQL comments. No test or safety rule reads them, and no artifact specifies comment text |
| `classify.sql:48:off-by-one:2` (zero-dispersion input z `THEN 1`) | equivalent | Adds the same constant, 1/m, to every composite. The re-standardisation subtracts the mean, so the stored score and percentile are unchanged in exact arithmetic. DEC-0053 and design 2.5 fix only those outputs; the input z-score is never stored |
| `manual:coder-input-z-population-sd` | equivalent | Every input column of a peer set has the same n, so `stddev_pop` scales every z by √(n/(n−1)). The re-standardisation removes the factor. The sample sd is pinned where it is observable: `score-population-sd` is killed by case (a) |
| `manual:coder-input-z-uncentred`, `manual:rv:score-uncentred` | equivalent | Dropping the input mean shifts every composite by one constant, which the re-standardisation removes. The composite's own mean is exactly 0, because each z column is centred, so `c − avg(c)` equals `c` |
| `manual:rv:stage-registered-first` (`_STAGES.insert(0, …)`) | equivalent | With no input stage registered, both give `[_classification_stage]`. Once S3 or S4 registers above the line, the existing T012 test fails on the real code, with no mutation needed. T012 accepts the vacuity until then |
| `manual:rv:percentile-on-rounded-score` | **not equivalent** | IR-001 |
| `manual:rv:gap-order-by-name`, `manual:rv:gap-order-by-label`, `manual:rv:gap-unordered` | **not equivalent** | IR-002 |

## Independent Validation

`<component>` = `repos/factorflow-v2/FactorFlow-v2`. Commands that need Docker, the uv cache or npm ran outside the sandbox, as single plain calls.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run --directory <component> --all-extras --offline python -B -m pytest -p no:cacheprovider -q -m "postgres or not postgres" tests/unit/test_classify_sql_static.py tests/unit/test_classification_stage_order.py tests/unit/test_composite_arithmetic.py tests/integration/test_engine_peer_set.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_constants.py tests/unit/test_classification_sql_ships.py` | harness root | 0 | PASS (focused) | 83 passed, 5.51 s (46 of them in the story's own files) |
| `uv sync --all-extras --directory <component>` | harness root | 0 | PASS (required) | Resolved 46, checked 43 packages |
| `uv build --directory <component>` | harness root | 0 | PASS (required) | sdist and wheel built. The wheel lists `factorflow/classification/sql/classify.sql` (4886 B) and `peer_sets.sql` (1103 B) |
| `uv run --directory <component> pytest -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1513 passed, 1 xfailed, 263.15 s |
| `uv run --directory <component> pytest -m postgres -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 458 passed, 1056 deselected, 234.21 s |
| `uv run --directory <component> pytest -m "not postgres" -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1055 passed, 458 deselected, 1 xfailed, 25.67 s |
| `uv run --directory <component> ruff check .` | harness root | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> ruff format --check .` | harness root | 0 | PASS (required) | 233 files already formatted |
| `uv run --directory <component> mypy src` | harness root | 0 | PASS (required) | No issues in 56 source files |
| `npm ci --prefix <component>` | harness root | 0 | PASS (required) | 250 packages added |
| `npm run build --prefix <component>` | harness root | 0 | PASS (required) | Vite build, 63 modules |
| `npm run test --prefix <component>` | harness root | 0 | PASS (required) | 42 files, 352 tests |
| `npm run test:e2e --prefix <component>` | harness root | 0 | PASS (required) | 18 passed (2.9 min) |
| `npm run lint --prefix <component>` | harness root | 1 | PASS (environment note) | Every diagnostic is in the git-ignored `build/lib/factorflow/api/static/assets/index-*.js`, which `uv build` copies from the Vite bundle and `biome.json` does not ignore (`.gitignore:12: build/`). Over tracked files (`git ls-files -z \| xargs -0 npx biome lint --no-errors-on-unmatched --files-ignore-unknown=true`): 100 files checked, no diagnostics |
| `npm run format --prefix <component>` | harness root | 1 | PASS (environment note) | Same cause and same tracked-files rerun: 100 files checked, no diagnostics |
| `npx --prefix <component> tsc --noEmit -p <component>` | harness root | 0 | PASS (required) | No output |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/docs/.../CAP-002-E2-S5-tdd-evidence.yaml --repo-dir <component> --base 7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants-review-all.json --jobs 4 --timeout 900 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider <the 7 focused files>' --out <scratch>/mutation-review-results.json` | harness root | 3 | FAIL (E.9) | 94 mutants: 63 killed, 31 survived, 4 of them non-equivalent (IR-001, IR-002). Four baselines passed, 83 each. Ran 23:23:04Z to 23:25:47Z. Results sha256 `2b79a5f7…`, copied beside this report as `CAP-002-E2-S5-implementation-review-v1-mutation.json` |

I also ran two reviewer probes outside the repository, through the repo's own helpers and the real stage on a throwaway `postgres:16` container. They are evidence for IR-001 and IR-003, not validation commands.

### Validation Side Effects

- Before: HEAD `31d8c88`; `git status --porcelain --untracked-files=all` empty; `code-revision` `sha256:7a094744…c135695`.
- After: HEAD `31d8c88`; status empty; `code-revision` unchanged, `sha256:7a094744…c135695`. Only git-ignored products were regenerated: `build/`, `dist/`, `src/factorflow.egg-info/`, `src/factorflow/api/static/` and `test-results/`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | initial | OPEN | TC-COMP-069 is WEAK: no test pins T015's rank on the unrounded score; `rv:percentile-on-rounded-score` survives |
| IR-002 | HIGH | initial | OPEN | T010(d) is WEAK: the first-gap order is tested only on `value`, whose order is alphabetical; three order mutants survive |
| IR-003 | MEDIUM | initial | OPEN | A mathematically constant composite is re-standardised into noise; the plan's open gap, awaiting the owner's tolerance decision |

### IR-001 — Percentile ranking on the unrounded score is not pinned by any test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-9, DAC-E2-3, DAC-E2-S5-1
- **Tasks**: T009, T013, T015
- **Files**: `src/factorflow/classification/sql/classify.sql:66-70` (`ranked_scores`); `tests/unit/test_composite_arithmetic.py`; `tests/integration/test_engine_peer_set.py`
- **Claim challenged**: TC-COMP-069 and the T010(b) test prove the percentile is `percent_rank() × 100` exactly as the plan specifies.
- **Observed evidence**: Mutant `manual:rv:percentile-on-rounded-score` replaces `percent_rank() OVER (ORDER BY score)` with `percent_rank() OVER (ORDER BY round(score, 6))`. All 83 focused tests pass on it (`manual_rv_percentile-on-rounded-score.log`). The behaviour differs. Reviewer probe: growth over five stocks, `revenue_growth` `[1, 2, 3, 3.0000001, 5]`, `eps_growth` `[10, 20, 30, 30, 50]`. Production stores two stocks with the same score `0.134840` and percentiles `50` and `75`. The mutant would give both `50`. Every test's peer set has scores far apart, so a tie at 6 decimals never occurs.
- **Expected evidence/behavior**: T015: "`100 * percent_rank() OVER (ORDER BY score)` computed on the unrounded score (design 2.5; the column stores 6 decimal places)". Task-plan Other Notes: "A stock with the same `score` after rounding to six decimals keeps the percentile computed from the unrounded score". Design 2.5's statement ranks `s.score`, which is unrounded.
- **Impact**: A regression to ranking the stored value would pass the suite. Over a 3000-stock peer set with unit-variance scores, about one pair per factor per set is expected to share a 6-dp score, so the difference is reachable in production.
- **Required remediation**: Add a test, for example a hand-built TC-COMP-069 case, in which two peer stocks' unrounded scores differ by less than 1e-6. Assert that they store equal scores and the distinct percentiles of the unrounded ranking, so that `manual:rv:percentile-on-rounded-score` is killed.

### IR-002 — "First non-present input in the factor's order" is tested only where that order is alphabetical

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-12
- **Tasks**: T010 (d), T015
- **Files**: `src/factorflow/classification/sql/classify.sql:71-83` (`first_gap`, `ORDER BY a.instrument_id, i.input_order`); `tests/integration/test_engine_peer_set.py:319-368` (`test_the_reason_is_the_first_input_not_present_in_factor_order`)
- **Claim challenged**: T010(d) proves the reason is "the first non-present input in the factor's input order, not the most severe" (DEC-0120; design 2.5).
- **Observed evidence**: The test's multi-gap stocks are all on `value`. Its `INPUT_NAMES` order, `book_to_price, earnings_yield, fcf_yield`, is also its alphabetical and label order. Three mutants survive the 83 focused tests: `rv:gap-order-by-name` (`ORDER BY a.instrument_id, i.input_name`), `rv:gap-order-by-label` (`… i.label`) and `rv:gap-unordered` (`ORDER BY a.instrument_id` only, so `DISTINCT ON` keeps an unspecified row). No test has two non-present inputs on `growth` (`revenue_growth, eps_growth`; alphabetically `eps_growth` comes first) or on `momentum` (`return_3m, return_6m, return_12m`; alphabetically `return_12m` comes first). TC-COMP-095 has a single gap.
- **Expected evidence/behavior**: Design 2.5: `reason_code` is "the status of the first input of the factor that is not `present`, in the factor's input order", with `reason_input` that input's name. The same rule is in DEC-0120's question and T010(d). E.5 and E.9 require a test that fails under a plausible regression of that rule.
- **Impact**: Factor-engine section 7 says a stock with stale prices has every momentum input `outdated`. Production names `return_3m` ('3-month total return outdated'). Under any of the three mutants, `return_12m` would be named and no test would fail. The same applies to a growth stock missing both inputs.
- **Required remediation**: Extend the T010(d) case, or add one, with at least two non-present inputs on `momentum` and on `growth`. Assert `reason_code`, `reason_input` and `reason_detail` of the first input in `INPUT_NAMES` order, so that all three mutants are killed.

### IR-003 — A mathematically constant composite is re-standardised into noise (plan open gap, owner decision)

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-3, DAC-E2-S5-1
- **Tasks**: T013, T015
- **Files**: `src/factorflow/classification/sql/classify.sql:59-65` (`scored`, `stddev_samp(c) OVER () = 0`); `tests/unit/test_composite_arithmetic.py:236` (`assume(... >= Decimal("1e-9"))`)
- **Claim challenged**: Zero dispersion at the composite step contributes 0 (DAC-E2-3, DEC-0053).
- **Observed evidence**: Reviewer probe on the real stage, growth over seven stocks, `revenue_growth = [1, 2, 4, 8, 16, 32, 64]`, `eps_growth = 7 − 3 × revenue_growth`. The inputs' z-scores cancel exactly in exact arithmetic, so the composite is constant. The stage stores scores `-1.069045` and `0.801784` with percentiles `0` and `50` instead of 0 for every stock. The exact-negation cases (`A, −A`) and `A, 1 − 2A` happen to round to exactly zero and score 0. The coder recorded the same effect in the TDD evidence (`open_gap`). The property test now skips such examples rather than asserting on them.
- **Expected evidence/behavior**: The task plan's Open Gaps, "Near-constant composite caused by numeric rounding. Not decided; reported.", say no artifact fixes a tolerance, that none may be invented, and that an observed artefact goes to the owner. The coder followed that. This finding carries it to the gate.
- **Impact**: It needs a factor's inputs to be exactly linearly dependent across the whole peer set, which real ratios over 30 or more stocks will practically never be. When it happens, the scores are arbitrary and not 0.
- **Required remediation**: No coding change until the owner decides. If the owner sets a tolerance, apply it to the composite dispersion test in `classify.sql`, add a hand-built case such as the probe above, and remove or narrow the `assume` filter.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations.**
  - T013 asserts percentile 100 only for a unique top score. The plan's "at least two scores differ" is contradicted by `percent_rank`'s tie rule.
  - T013 skips examples with a composite spread below 1e-9 (IR-003).
  - T014 uses `LEFT JOIN LATERAL`.
  - T002's `roster_value` divides by `10 n²`, not `10 n`.
- **Bookkeeping inconsistency.** T010 is checked complete, but its (d) case does not cover its stated concern (IR-002).
- **Out-of-scope changes.** None.
- **Decision records cited by `Decision-Id`.** DEC-0052, DEC-0053, DEC-0119, DEC-0120, DEC-0121 and DEC-0130 are all `status: applied`, `owner_reviewed: true`, `owner_verdict: upheld`. DEC-0052's choice is now written into tech-stack v7 (OQ-TS-3 closed for classification). The implementation matches each record:
  - DEC-0052: no numeric library, enforced by a static test.
  - DEC-0053: the composite.
  - DEC-0119: reads `factor_input` and `active_ids` only.
  - DEC-0120: label plus status word, an absent row read as `missing`, `'N of 30'` from the constant, null `reason_detail` on retired rows.
  - DEC-0121: registered last; `restated_possible` the constant false.
  - DEC-0130: the eight labels in `constants.INPUT_LABELS`.

  The trailers parse with `git interpret-trailers --parse`. The untracked harness record `DEC-0221` is scoped to CAP-002-E2-S3 and is not cited here.
- **Note for later work, not a finding.** The `engine.py` module docstring still says "No factor is computed here". T016 and T020 forbid changing existing lines in this story.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**:
  - Rework `CAP-002-E2-S5-tasks.md` against this report. Add tests that kill `manual:rv:percentile-on-rounded-score` (IR-001), and `manual:rv:gap-order-by-name`, `manual:rv:gap-order-by-label` and `manual:rv:gap-unordered` (IR-002). No production change is required for either.
  - IR-003 awaits the owner's answer: should `classify.sql` treat a composite spread below a tolerance as zero dispersion, and if so which tolerance?
  - Then rerun this review. The next review passes this report's `-mutation.json` as `scope --previous`.
- **Warnings accepted downstream**: N/A
