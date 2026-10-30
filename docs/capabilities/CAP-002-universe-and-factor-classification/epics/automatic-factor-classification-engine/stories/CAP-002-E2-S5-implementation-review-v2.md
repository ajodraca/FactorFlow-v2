---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S5-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-29
updated: 2026-10-29
story_id: "CAP-002-E2-S5"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S5.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-29T00:22:55Z"
reviewed_head: "9605c5804c90bea7890b8c96c30bb0e05dbf94c7"
review_base: "7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184"
reviewed_state_revision: "sha256:517579866d2771c9ddf8ee1f4a68c04ce40320bc1a6130574f9de903a8aff00d"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-10-29T00:45:37Z
  source_artifacts:
    - id: CAP-002-E2-S5
      version: "1 (sha256:c3bdfefa6b739ad335a3e9427bc9f610f1481a2ef37d94cc8c82b25cadd72244)"
    - id: CAP-002-E2-S5-tasks
      version: "1 (updated 2026-10-28, last_reworked_review v1)"
    - id: CAP-002-E2-S5-tdd-evidence
      version: "cycle-2"
    - id: CAP-002-E2-S5-implementation-review
      version: "1 (baseline, reviewed_head 31d8c881091a7043ed67d1d9bbe836e345d2baba)"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-factor-engine-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0228
      version: "open, owner decision 2026-10-28"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S5 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 15/15 satisfied |
| Planned tasks | 21/21 verified |
| Required validation | 18/18 passed |

The rework resolves all three findings of review v1. It changes tests only. No production file changed between v1's `reviewed_head` `31d8c88` and `9605c58`.

- **v1 IR-001** is resolved by a new hand-built TC-COMP-069 case (f). Two stocks whose unrounded scores differ by 3.37e-8 both store `0.134840`, and they keep percentiles 50 and 75. I recomputed those literals at 50 digits, outside the coder's oracle.
- **v1 IR-002** is resolved by five multi-gap cases on `growth` and `momentum`. On both factors the input order differs from the alphabetical order of the names and of the labels.
- **v1 IR-003** is settled by owner decision DEC-0228: no tolerance. The decision requires no code change, and the plan and evidence now cite it.

All four mutants v1 found surviving are now killed, each by the new test that targets it. So are my six further mutants of the same rules.

Every required command passes. The full Python suite gives 1515 passed and 1 xfailed. Vitest gives 352, Playwright 18, and the TDD lint reports 0 errors.

Two non-blocking findings remain, both `late`, because they sit on lines unchanged since v1:

- **IR-001 (MEDIUM).** No test pins the exact-zero dispersion comparisons that DAC-E2-3 and DEC-0228 fix. A `< 1e-9` tolerance at either step of `classify.sql` survives.
- **IR-002 (LOW).** A test comment still calls the near-constant composite "the plan's open gap, left to the owner", which DEC-0228 has since answered.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1 · **total 2**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S5.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S5-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S5` |
| HEAD | `9605c5804c90bea7890b8c96c30bb0e05dbf94c7` (rework commit) |
| Review base | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` → `7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184` (merge of PR #140; `git merge-base --is-ancestor` confirms it is an ancestor of HEAD) |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` empty); only git-ignored build products present |
| Changed files reviewed | 103 in `7646ab7..9605c58` (99 added, 4 modified); no staged, unstaged or untracked files. 19 of them changed since the baseline |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `31d8c881091a7043ed67d1d9bbe836e345d2baba`, with `CAP-002-E2-S5-implementation-review-v1-mutation.json` |

`pipeline-state.py check --stage adversarial-review` reported `READY — review changes were reworked; a new review version is required`. The prerequisite check exited 0. `artifact-gate.py require` passes for the story: `approved`, with an unchanged revision `sha256:c3bdfefa…`.

**Re-review scope.** `git diff 31d8c88..9605c58` touches no file under `src/`. It adds lines 371–454 of `tests/integration/test_engine_peer_set.py` and lines 194–220 of `tests/unit/test_composite_arithmetic.py`. It also changes the task plan's frontmatter and one Open Gaps note, appends to the TDD evidence, and adds the cycle-2 evidence. Commit `9245392` added the v1 report and its mutation JSON, which the rework does not touch. Every production line is therefore unchanged since the baseline. A new finding on a production line is `late` unless it shows a CRITICAL defect.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/sql/peer_sets.sql` | added (unchanged since v1) | T014; AC-14, DAC-E2-2, DAC-E2-7 |
| `src/factorflow/classification/sql/classify.sql` | added (unchanged since v1) | T015; AC-8, AC-9, AC-12, AC-14, AC-15 |
| `src/factorflow/classification/engine.py` | modified, additions only (unchanged since v1) | T016 |
| `src/factorflow/classification/constants.py` | modified, additions only (unchanged since v1) | T016 (`INPUT_LABELS`, DEC-0120, DEC-0130) |
| `tests/integration/engine_classify_support.py` | added (unchanged since v1) | T002 |
| `tests/integration/test_engine_peer_set.py` | added; +85 lines since v1 | T003–T008, T010; v1 IR-002 remediation (`FIRST_GAP_CASES`, `test_the_first_gap_follows_the_input_order_where_it_is_not_alphabetical`) |
| `tests/unit/test_composite_arithmetic.py` | added; +27 lines since v1 | T009, T013; v1 IR-001 remediation (case (f)) |
| `tests/unit/test_classify_sql_static.py` | added (unchanged since v1) | T011 |
| `tests/unit/test_classification_stage_order.py` | added (unchanged since v1) | T012 |
| `docs/.../stories/CAP-002-E2-S5.md` | modified (`status` only) | Story-coding bookkeeping, outside the approval revision |
| `docs/.../stories/CAP-002-E2-S5-tasks.md` | modified: checkboxes; since v1 `updated`, `last_reworked_review` and the Open Gaps note citing DEC-0228 | Bookkeeping; v1 IR-003 disposition |
| `docs/.../stories/CAP-002-E2-S5-tdd-evidence.yaml` | added; since v1 cycle-2 appended, and the header and cycle-1 `open_gap` annotated with DEC-0228 | T021 |
| `docs/.../stories/CAP-002-E2-S5-evidence/` cycle-1 files and the 70 `mutation-cycle-1-results-logs/*.log` | added (unchanged since v1) | T019, T021 |
| `docs/.../stories/CAP-002-E2-S5-evidence/cycle-2.patch`, `full-suite-cycle-2.log`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json`, `red-cycle-2-rework.log`, `mutation-cycle-2-results-logs/*.log` (8 files) | added since v1 | T021, cycle-2 |
| `docs/.../stories/CAP-002-E2-S5-implementation-review-v1.md` and `-v1-mutation.json` | added by `9245392` | Review v1, this review's baseline |

No file outside the plan was changed (T020). The rework's code portion of `cycle-2.patch` is byte-identical to `git diff 9245392..HEAD -- src tests`, minus the `index` lines, and its sha256, `c9ea64c3…`, equals cycle-2's `diff_sha256`. The two test files' sha256 values (`8c81ad7d…`, `e8525dcd…`) equal the values in the header of `red-cycle-2-rework.log`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-8 | SATISFIED | `classify.sql` `peer_ids`/`peer` read this set's `factor_input` joined to `active_ids`; no universe table named | TC-COMP-068 `test_scores_are_identical_whatever_the_universe_membership`; static `universe` scan (T011) | Unchanged since v1 |
| AC-9 | SATISFIED | `classify.sql:46-70` (`z`, `composite`, `scored`, `ranked_scores`, ranking the unrounded score) | TC-COMP-069 cases (a)–(f) and properties; `test_classified_rows_carry_the_reference_scores_over_the_full_percentile_range` | Case (f) now pins the unrounded rank (v1 IR-001 resolved) |
| AC-12 | SATISFIED | `classify.sql:71-83` `first_gap` (`DISTINCT ON … ORDER BY a.instrument_id, i.input_order`), row set 2 | TC-COMP-067, TC-COMP-095, `test_the_reason_is_the_first_input_not_present_in_factor_order` (value), `test_the_first_gap_follows_the_input_order_where_it_is_not_alphabetical` (growth, momentum) | The named input follows `INPUT_NAMES` order on every factor (v1 IR-002 resolved) |
| AC-14 | SATISFIED | `peer_sets.sql:10` `>= %(min_peer_set_size)s`; `classify.sql:106-113` | TC-COMP-107 [29] and [30]; '0 of 30' case; `test_the_unranked_reason_states_the_floor_in_force` | Unchanged since v1 |
| AC-15 | SATISFIED | `classify.sql:115-121` over `retired_ids`; peer CTEs read `active_ids` only | TC-COMP-111 (R1 without rows, R2 with a full `present` set) | Unchanged since v1 |
| DAC-E2-2 | SATISFIED | `peer_sets.sql:12-21`, `classify.sql:29-38`: present rows `=` the factor's input count in both statements | TC-COMP-067; `test_a_stock_outside_the_active_roster_is_ignored`; TC-COMP-068 | — |
| DAC-E2-3 | SATISFIED | `classify.sql:48` and `:61`, `CASE WHEN stddev_samp(...) = 0 THEN 0` | Cases (c), (d), (e); properties | The exact `= 0` comparison DEC-0228 keeps is correct but not pinned against a tolerance (IR-001, late, MEDIUM) |
| DAC-E2-7 | SATISFIED | As AC-14 | TC-COMP-107; '0 of 30' case | — |
| DAC-E2-8 | SATISFIED | As AC-15 | TC-COMP-111 | — |
| DAC-E2-S5-1 | SATISFIED | As AC-9 | TC-COMP-069 (a)–(f) to 6 dp; the 40-digit oracle; 40 hypothesis examples | — |
| DAC-E2-S5-2 | SATISFIED | As DAC-E2-2 | TC-COMP-067 | — |
| DAC-E2-S5-3 | SATISFIED | As AC-14 | TC-COMP-107, real `MIN_PEER_SET_SIZE` | — |
| DAC-E2-S5-4 | SATISFIED | As AC-15 | TC-COMP-111 | — |
| DAC-E2-S5-5 | SATISFIED | No universe table in either statement | TC-COMP-068; static scan | — |
| DAC-E2-S5-6 | SATISFIED | `first_gap` → `input_not_computable` | TC-COMP-095; momentum case 4 of the first-gap test (`return_3m` `not_computable` ahead of later `outdated` and `missing`) | — |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `engine.build`, `BuildContext`, `_STAGES`, the three constants and `engine_support.py` exist at `7646ab7` | — |
| T002 | complete | VERIFIED | `tests/integration/engine_classify_support.py` | `roster_value` divides by `10 n²`, not `10 n`; harmless (v1) |
| T003 | complete | VERIFIED | Fixture `store` in `test_engine_peer_set.py` | — |
| T004 | complete | VERIFIED | `test_stock_with_two_of_three_value_inputs_is_outside_the_value_peer_set` | — |
| T005 | complete | VERIFIED | `test_scores_are_identical_whatever_the_universe_membership` | — |
| T006 | complete | VERIFIED | `test_a_factor_ranks_only_from_thirty_qualifying_stocks[29/30]` | — |
| T007 | complete | VERIFIED | `test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` | — |
| T008 | complete | VERIFIED | `test_a_not_computable_input_is_named_as_the_reason` | — |
| T009 | complete | VERIFIED | Cases (a)–(e) and the new (f), `test_composite_arithmetic.py:117-220` | Case (f) goes beyond the plan's (a)–(e), as v1 IR-001's remediation required |
| T010 | complete | VERIFIED | (a)–(h) as in v1. (d) now also runs on `growth` and `momentum`: `test_engine_peer_set.py:371-454` | Was PARTIAL in v1. Its stated concern, first gap in the factor's input order, is now pinned where that order is not alphabetical |
| T011 | complete | VERIFIED | `test_classify_sql_static.py` | — |
| T012 | complete | VERIFIED | `test_classification_stage_order.py` | Vacuous until S3 or S4 registers an input stage, as the plan and DEC-0121 intend |
| T013 | complete | VERIFIED | `test_properties_hold_over_random_peer_sets` | The `assume` filter below 1e-9 composite dispersion is now sanctioned by DEC-0228. Its comment is stale (IR-002) |
| T014 | complete | VERIFIED | `peer_sets.sql` | `LEFT JOIN LATERAL`; equivalent |
| T015 | complete | VERIFIED | `classify.sql` | Unchanged since v1. Its rank-on-unrounded rule and first-gap order are now pinned |
| T016 | complete | VERIFIED | `constants.INPUT_LABELS`; `_classification_stage`; `_STAGES.append(...)` as the last statement | Additions only |
| T017 | complete | VERIFIED | Focused run: 85 passed | — |
| T018 | complete | VERIFIED | Every Validation Plan command passes (Independent Validation). The wheel ships `classify.sql` (4886 B) and `peer_sets.sql` (1103 B) | — |
| T019 | complete | VERIFIED | `t019-explain-cycle-1.log`; recorded in `31d8c88`'s message | A signal for S7, not a gate |
| T020 | complete | VERIFIED | Seven `# Implements TC-COMP-069` markers, including case (f), plus TC-COMP-067, 068, 095, 107 and 111. The new first-gap test cites AC-12, DEC-0120 and design 2.5. The diff is limited to planned files | — |
| T021 | complete | VERIFIED | `check-tdd-evidence.py … --require-logs`: 0 errors, 0 warnings. Cycle-2 RED shows each of the four mutants failing exactly one new test and passing the cycle-1 set (83 passed, 2 deselected) | `commit_hash: stage` for both cycles |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_stock_with_two_of_three_value_inputs_is_outside_the_value_peer_set` / TC-COMP-067 | ADEQUATE | Counts per factor, both reason tuples, classification elsewhere, the oracle over exactly 30 | none |
| `test_scores_are_identical_whatever_the_universe_membership` / TC-COMP-068 | ADEQUATE | Two sets over identical inputs, before and after universes exist; 0/1/3 memberships | none |
| `test_common_z_scores_are_already_standardised`, `test_uncorrelated_inputs_are_re_standardised`, `test_a_zero_dispersion_input_contributes_zero`, `test_every_input_without_dispersion_scores_zero_without_dividing_by_zero`, `test_opposite_inputs_cancel_to_a_constant_composite`, `test_scores_tied_after_rounding_keep_the_percentiles_of_the_unrounded_scores`, `test_properties_hold_over_random_peer_sets` / TC-COMP-069 | ADEQUATE | Literal 6-dp scores and percentiles, oracle, mean-0 and sd-1, range, monotonicity, shift, scale and permutation properties. Case (f) asserts the near-tie on the oracle (`0 < Δ < 1e-6`) and then the literal rows. It kills `rv:percentile-on-rounded-score` and my `round(score, 5)` and `round(score, 7)` variants | A tolerance in either zero-dispersion `CASE` survives (IR-001). That survivor is `late`, so it does not make the test WEAK |
| `test_a_not_computable_input_is_named_as_the_reason` / TC-COMP-095 | ADEQUATE | Reason code, input, label sentence, null score; growth count 30 | none |
| `test_a_factor_ranks_only_from_thirty_qualifying_stocks` / TC-COMP-107 | ADEQUATE | 29 and 30 against the real floor; `BuildResult.qualified_counts` | none |
| `test_retired_instruments_are_in_no_peer_set_and_retired_on_every_factor` / TC-COMP-111 | ADEQUATE | R2's `present` rows prove the exclusion is by roster; `factor_input` counts unchanged | none |
| `test_classified_rows_carry_the_reference_scores_over_the_full_percentile_range` (T010 b) | ADEQUATE | Oracle match, 0 and 100 endpoints, null reasons | none |
| `test_the_reason_is_the_first_input_not_present_in_factor_order` and `test_the_first_gap_follows_the_input_order_where_it_is_not_alphabetical` (T010 c, d) | ADEQUATE | The new test is described below the table. Together the two tests kill every order mutant tried: by name, by label, unordered, by `fi.input_name`, by status, by name descending, and sorted names in the stage | The unordered mutant's kill depends on the plan (see below) |
| `test_an_earlier_sets_inputs_enter_no_statistic_of_a_later_set` (T010 e) | ADEQUATE | Every set-filter mutant killed | none |
| `test_a_stock_outside_the_active_roster_is_ignored` (T010 f) | ADEQUATE | Roster-filter mutants killed | none |
| `test_every_instrument_gets_one_unmarked_row_per_factor_and_every_factor_a_count` (T010 a, g, h) | ADEQUATE | Exact key set, the four status kinds, `restated_possible` false, '0 of 30' | none |
| `test_the_unranked_reason_states_the_floor_in_force` | ADEQUATE | Kills a literal floor in either call | none |
| `test_classify_sql_static.py` (T011) | ADEQUATE | Each rule has a self-test; labels pinned exactly | none |
| `test_classification_stage_order.py` (T012) | ADEQUATE | Registration and order rule with a failing self-test | Vacuous until an input stage exists, by plan |

**The new first-gap test.** It has five stocks, each with at least two inputs not present.

- **Factors.** Both `growth` and `momentum` order their inputs differently from the alphabetical order of the names and of the labels (`eps_growth` and `return_12m` sort first).
- **Kinds of gap.** The cases cover an absent row, every momentum input `outdated`, and a more severe later status that must not win.
- **Assertions.** For each stock the test checks the factor counts (35/33/32) and the full reason tuple: code, input, `reason_detail`, and null score and percentile.
- **Preconditions.** It asserts the `INPUT_NAMES` order it relies on, so it cannot pass vacuously if that order changes.

**Isolation and determinism.** Both new tests are deterministic. Case (f) runs in the module database, in a transaction it rolls back. The first-gap test uses its own database. The `rv:gap-unordered` mutant leaves the row choice to the planner, so no test can guarantee to kill it. The coder disclosed this in `red-cycle-2-rework.log`. My run killed it, failing the first-gap test on its first growth case. The production statement orders by `i.input_order`, so the tests themselves do not depend on the plan.

**Mutation (E.9).** Commands:

1. `mutation-run.py generate` over `7646ab7..HEAD` produced 33 catalogue mutants, all in the two SQL files. They are the same 33 as v1, since the rework changed no production line.
2. I added eight manual mutants of my own (`manual:rv2:*`).
3. `scope --since 31d8c88 --previous <v1 -mutation.json>` added v1's other 61 mutants, for 102 in total. It tagged 94 `carried` and 8 `late`, and reported 0 previous mutants that no longer apply.

The run gave 73 killed and 29 survived. All four non-equivalent survivors of v1 are now killed:

| Mutant | Scope | State | Killed by |
|--------|-------|-------|-----------|
| `manual:rv:percentile-on-rounded-score` | carried | killed | `test_scores_tied_after_rounding_keep_the_percentiles_of_the_unrounded_scores` |
| `manual:rv:gap-order-by-name` | carried | killed | `test_the_first_gap_follows_the_input_order_where_it_is_not_alphabetical` |
| `manual:rv:gap-order-by-label` | carried | killed | same |
| `manual:rv:gap-unordered` | carried | killed | same (plan-dependent, see above) |
| `manual:rv2:percentile-on-rounded-5`, `manual:rv2:percentile-on-rounded-7` | late | killed | case (f) |
| `manual:rv2:gap-order-by-fi-name`, `manual:rv2:stage-names-sorted` (`sorted()` names and labels in `_classification_stage`) | late | killed | the first-gap test |
| `manual:rv2:gap-order-by-status`, `manual:rv2:gap-order-desc-name` | late | killed | `test_the_reason_is_the_first_input_not_present_in_factor_order` |
| `manual:rv2:composite-tolerance` (`stddev_samp(c) OVER () < 1e-9`) | late | **survived** | IR-001 |
| `manual:rv2:input-tolerance` (`stddev_samp(value) OVER w < 1e-9`) | late | **survived** | IR-001 |

I re-derived each of the other 27 survivors, all `carried`. I agree with v1's dispositions:

| Survivor(s) | Disposition | Contract reasoning |
|-------------|-------------|--------------------|
| 22 catalogue mutants on `--` comment lines: `classify.sql` 1, 3 (×2), 5, 6 (×2), 8, 11 (×2), 13 (×2), 14 (×2), 67, 87 (×2), 88; `peer_sets.sql` 1, 4 (×2), 5 (×2) | equivalent | PostgreSQL discards SQL comments. No artifact specifies comment text, and T011's comment scan looks only for `universe`, which none of them adds |
| `classify.sql:48:off-by-one:2` (zero-dispersion input z `THEN 1`) | equivalent | It adds the same constant, 1/m, to every composite, and re-standardisation subtracts it. The input z-score is internal to the statement and never stored. DEC-0053 and design 2.5 fix only the stored score and percentile |
| `manual:coder-input-z-population-sd` | equivalent | Every peer input column has the same n, so every z is scaled by √(n/(n−1)) and re-standardisation removes the factor. The `CASE` still tests `stddev_samp` |
| `manual:coder-input-z-uncentred`, `manual:rv:score-uncentred` | equivalent | Each shifts every composite by one constant (or by the composite's mean, which is exactly 0 because each z column is centred), and re-standardisation removes it |
| `manual:rv:stage-registered-first` (`_STAGES.insert(0, …)`) | equivalent under DEC-0121 | With no input stage registered, both forms give `[_classification_stage]`. DEC-0121 makes the order test the guard, "fails loudly rather than silently". Once S3 or S4 registers above the line, T012 fails on the real code |

## Independent Validation

`<component>` = `repos/factorflow-v2/FactorFlow-v2`. Commands that need Docker, the uv cache or npm ran outside the sandbox as single plain calls, from the harness root, with `--directory`/`--prefix` pointing at the component.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run --directory <component> --all-extras --offline python -B -m pytest -p no:cacheprovider -q -m "postgres or not postgres" tests/unit/test_classify_sql_static.py tests/unit/test_classification_stage_order.py tests/unit/test_composite_arithmetic.py tests/integration/test_engine_peer_set.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_constants.py tests/unit/test_classification_sql_ships.py` | harness root | 0 | PASS (focused) | 85 passed, 5.61 s (83 in v1, plus the two rework tests) |
| `uv sync --all-extras --directory <component>` | harness root | 0 | PASS (required) | Resolved 46, checked 43 packages |
| `uv build --directory <component>` | harness root | 0 | PASS (required) | sdist and wheel built. The wheel lists `factorflow/classification/sql/classify.sql` (4886 B) and `peer_sets.sql` (1103 B) |
| `uv run --directory <component> pytest -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1515 passed, 1 xfailed, 231.28 s (v1: 1513; the two rework tests added) |
| `uv run --directory <component> pytest -m postgres -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 460 passed, 1056 deselected, 208.41 s |
| `uv run --directory <component> pytest -m "not postgres" -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1055 passed, 460 deselected, 1 xfailed, 25.73 s |
| `uv run --directory <component> ruff check .` | harness root | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> ruff format --check .` | harness root | 0 | PASS (required) | 233 files already formatted |
| `uv run --directory <component> mypy src` | harness root | 0 | PASS (required) | No issues in 56 source files |
| `npm ci --prefix <component>` | harness root | 0 | PASS (required) | 250 packages added |
| `npm run build --prefix <component>` | harness root | 0 | PASS (required) | Vite build, 63 modules |
| `npm run test --prefix <component>` | harness root | 0 | PASS (required) | 42 files, 352 tests |
| `npm run test:e2e --prefix <component>` | harness root | 0 | PASS (required) | 18 passed (2.9 min); the `posttest:e2e` hook removed its container |
| `npm run lint --prefix <component>` | harness root | 1 | PASS (environment note) | All 40 errors are in the git-ignored `build/lib/factorflow/api/static/assets/index-BFn-kDOZ.js` (`.gitignore:12: build/`). `uv build` copies the Vite bundle there, and `biome.json` does not ignore it. Rerun over tracked files, `git ls-files -z \| xargs -0 npx biome lint --no-errors-on-unmatched --files-ignore-unknown=true`: 100 files checked, no diagnostics |
| `npm run format --prefix <component>` | harness root | 1 | PASS (environment note) | Both errors are in git-ignored `build/lib/.../index-BFn-kDOZ.js` and `index-CLWAKYLJ.js`. The same tracked-files rerun with `biome format`: 100 files checked, no diagnostics |
| `npx --prefix <component> tsc --noEmit -p <component>` | harness root | 0 | PASS (required) | No output |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/docs/.../CAP-002-E2-S5-tdd-evidence.yaml --repo-dir <component> --base 7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants-scoped.json --jobs 4 --timeout 900 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider <the 7 focused files>' --out <scratch>/mutation-results.json --logs <scratch>/mutation-results-logs --work-root <scratch>/work` | harness root | 3 | PASS (E.9) | 102 mutants: 73 killed, 29 survived. 27 of the survivors are `carried` and equivalent; 2 are `late` (IR-001), so neither makes a test WEAK. The four baselines passed, 85 each. Ran 00:27:06Z to 00:29:57Z. Results sha256 `74e73eba…`, copied beside this report as `CAP-002-E2-S5-implementation-review-v2-mutation.json`. Exit 3 means only that survivors exist |

I also ran an independent check outside the repository: case (f)'s expected rows recomputed at 50-digit precision. Stocks 3 and 4 score `0.13483996559…` and `0.13483999930…` (Δ 3.37e-8). Both round to `0.134840`. Ranked unrounded, their percentiles are 50 and 75; ranked at 5 or 7 places, both are 50.

The full Python suite and the `-m postgres` run both include the 460 PostgreSQL tests. I did not substitute one for the other: both were run.

### Validation Side Effects

- Before: HEAD `9605c58`; `git status --porcelain=v1 --untracked-files=all` empty; `code-revision` `sha256:51757986…a8aff00d`.
- After: HEAD `9605c58`. The only untracked files are this report and its `-mutation.json`, both under `docs/`, which the fingerprint excludes. `code-revision` is unchanged, `sha256:51757986…a8aff00d`. Only git-ignored products were regenerated: `build/`, `dist/`, `src/factorflow.egg-info/`, `src/factorflow/api/static/`, `node_modules/` and `test-results/`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | MEDIUM | late | OPEN | No test pins the exact `= 0` dispersion comparisons of DAC-E2-3 and DEC-0228; a `< 1e-9` tolerance at the input or the composite step survives |
| IR-002 | LOW | late | OPEN | The comment above the property test's `assume` still calls the near-constant composite an open gap left to the owner; DEC-0228 has answered it |

### IR-001 — The exact-zero dispersion comparisons are not pinned against a tolerance

- **Severity**: MEDIUM
- **Scope**: late. Both lines are unchanged since v1's `reviewed_head` `31d8c88`, and `mutation-run.py scope` tagged both mutants `late`. It is a test gap, not a production defect: the code does what DEC-0228 says.
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-3, DAC-E2-S5-1
- **Tasks**: T009, T013, T015
- **Files**: `src/factorflow/classification/sql/classify.sql:48` and `:61`; `tests/unit/test_composite_arithmetic.py`
- **Claim challenged**: TC-COMP-069 pins DAC-E2-3: zero dispersion, and only zero dispersion, contributes 0. It also pins DEC-0228's decision that `classify.sql` "adds no spread threshold or new constant".
- **Observed evidence**: Two mutants pass all 85 focused tests (`manual_rv2_composite-tolerance.log`, `manual_rv2_input-tolerance.log`: "85 passed").
  - `manual:rv2:composite-tolerance` replaces `CASE WHEN stddev_samp(c) OVER () = 0 THEN 0` with `… < 1e-9 THEN 0`.
  - `manual:rv2:input-tolerance` makes the same change to `stddev_samp(value) OVER w`.

  Every hand-built case has a dispersion of exactly 0 or of order 1. The property test's values have four decimals and are distinct, so every input column has a spread far above 1e-9. Its `assume` also skips composites below 1e-9, which DEC-0228 permits.
- **Expected evidence/behavior**: DAC-E2-3 says zero dispersion contributes zero, and gives no tolerance. DEC-0053 z-scores by the sample standard deviation whenever it is not zero. DEC-0228 rejects a composite tolerance: "classify.sql re-standardises the composite exactly as DEC-0053 states and adds no spread threshold or new constant".
- **Impact**: A later change that adds the tolerance DEC-0228 rejected would pass the suite. That change is plausible, since it is the obvious "fix" for v1's IR-003. Two cases would change:
  - **Composite step.** A composite whose real spread is below 1e-9 would score 0 for every stock. Such a spread arises only when the inputs nearly cancel.
  - **Input step.** An input whose values differ only at about the 1e-10 scale `factor_input.value` stores would contribute 0 instead of its z-scores.

  Neither case arises from the inputs this story's tests generate. It is not blocking, because the gap lies in lines unchanged since the baseline.
- **Required remediation**: Optional for this gate; it can be taken now or in a later story touching `classify.sql`. Kill both mutants. One way is a hand-built TC-COMP-069 case with a small but real dispersion, below 1e-9 yet far above numeric noise, at each step. For example, one input constant except for a 1e-10 step on one stock, and `eps_growth = −revenue_growth` except for a 1e-10 perturbation on one stock. Assert that each is re-standardised rather than scored 0. A static T011-style check that both dispersion tests compare with `= 0` would also work.

### IR-002 — A test comment still calls DEC-0228's question open

- **Severity**: LOW
- **Scope**: late (`tests/unit/test_composite_arithmetic.py:258-262` is unchanged since `31d8c88`)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T013, T021
- **Files**: `tests/unit/test_composite_arithmetic.py:258-262`
- **Claim challenged**: The test's own account of why it skips near-constant composites is current.
- **Observed evidence**: The comment reads "That is the plan's open gap, left to the owner, so the examples avoid it". Since this rework, the task plan's Open Gaps note says "Settled by owner decision DEC-0228". The TDD evidence says the same, and so does `9605c58`'s commit message, which lists this comment as a deliberate follow-up.
- **Expected evidence/behavior**: Test commentary agrees with the plan and decision records it cites (T020's traceability intent; DEC-0228).
- **Impact**: A reader of the test would think the tolerance question is still open, and might reopen it with the owner.
- **Required remediation**: Point the comment at DEC-0228 the next time this file changes. No behaviour change.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH): TC-COMP-069 did not pin the rank on the unrounded score | RESOLVED | `test_scores_tied_after_rounding_keep_the_percentiles_of_the_unrounded_scores` (`test_composite_arithmetic.py:196-220`). `manual:rv:percentile-on-rounded-score` is killed in this review's run (`manual_rv_percentile-on-rounded-score.log`: "1 failed, 33 passed"), as are my 5- and 7-place variants. The literals were recomputed independently at 50 digits |
| v1/IR-002 (HIGH): the first-gap order was tested only where it is alphabetical | RESOLVED | `test_the_first_gap_follows_the_input_order_where_it_is_not_alphabetical` (`test_engine_peer_set.py:371-454`). It kills `rv:gap-order-by-name`, `rv:gap-order-by-label` and `rv:gap-unordered`, plus `rv2:gap-order-by-fi-name` and `rv2:stage-names-sorted`. T010 is now VERIFIED |
| v1/IR-003 (MEDIUM): a mathematically constant composite is re-standardised into noise; owner question | RESOLVED (owner decision, no code change) | DEC-0228, 2026-10-28: no tolerance. `classify.sql` is unchanged and matches it. The plan's Open Gaps note and the TDD evidence cite it, and `9605c58` carries `Decision-Id: DEC-0228` in its trailer block, which `git interpret-trailers --parse` reads. DEC-0228's `owner_reviewed: false` and `status: open` await the owner's later blind review; they are not a defect of this story. The leftover test comment is IR-002 |

## Scope and Plan Deviations

- **Justified deviations.** Each of these carries over from v1 and is unchanged:
  - T013 asserts percentile 100 only for a unique top score.
  - T013's `assume` filter, which DEC-0228 now explicitly sanctions.
  - T014's `LEFT JOIN LATERAL`.
  - T002's `roster_value` divisor.

  New in this rework: TC-COMP-069 case (f) extends T009's cases (a)–(e), and T010(d) gains a second test. v1's remediation required both.
- **Bookkeeping.**
  - v1's inconsistency, T010 checked without full evidence, is resolved.
  - The task plan gained `last_reworked_review: CAP-002-E2-S5-implementation-review-v1.md` and the DEC-0228 note.
  - The TDD evidence gained cycle-2 (`tasks: [T009, T010]`) and DEC-0228 annotations on its header and cycle-1's `open_gap`. Cycle-1's facts and hashes are unchanged.
- **Out-of-scope changes.** None.
- **Decision records cited by `Decision-Id`.**
  - `31d8c88` cites DEC-0052, DEC-0053, DEC-0119, DEC-0120, DEC-0121 and DEC-0130. All are `applied` and upheld by the owner, and the implementation matches each one, as in v1.
  - `9605c58` cites DEC-0228, an owner decision (`decided_by: owner`). It is still awaiting the owner's blind review, and the TDD lint accepts it with `--decisions-dir`.
  - The untracked harness record DEC-0221 is scoped to CAP-002-E2-S3 and is not cited here.
- **Notes for later work, not findings.**
  - The `engine.py` module docstring still says "No factor is computed here". T016 and T020 forbid changing existing lines in this story (v1 note; the coder listed it again).
  - `biome.json` ignores `dist/**` but not `build/**`, so `npm run lint` and `npm run format` fail once `uv build` has run. That is a repository configuration matter outside this story.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E2-S5 against this report. Before that, the driver commits this report and `CAP-002-E2-S5-implementation-review-v2-mutation.json`. The next review of this story, if any, passes that JSON to `scope --previous`.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (LOW)
