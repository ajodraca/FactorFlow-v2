---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
story_id: "CAP-002-E2-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-28T03:07:22Z"
reviewed_head: "e67482f5977852551d030619be97eead39f44bde"
review_base: "31359b27afccf009da6efa9a68fea92a498a7aba"
reviewed_state_revision: "sha256:7c07b717b0273549818cded3ec20e089c1f67cd972c4b4eb859db43de66a119d"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E2-S3
    artifact_version: 1
    content_revision: sha256:e36e2eb33ccd79e72b4d9ec6a27ce18a820e3f5c36964bdb3248d8ed95ffefc0
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-28T03:15:00Z
  source_artifacts:
    - id: CAP-002-E2-S3
      version: "1 (sha256:e36e2eb33ccd79e72b4d9ec6a27ce18a820e3f5c36964bdb3248d8ed95ffefc0)"
    - id: CAP-002-E2-S3-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E2-S3-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-factor-engine-component-tests
      version: "TC-COMP-059, 060, 061, 062, 094, 100, 101, 161"
    - id: DEC-0221
      version: "open, decided_by owner, 2026-10-28T01:56:27Z"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 24/24 verified |
| Required validation | 15/15 passed |

The production change is correct as far as this review could test it. The four SQL files and the stage in `engine.py` do what the story, the task plan, factor-engine design 2.3 and 2.4, and the cited decisions require. That includes DEC-0221's consecutive-quarter windows, which the owner decided during this run. All 15 required validation commands pass: the full Python suite (1539 passed, 1 xfailed), the postgres and non-postgres splits, ruff, mypy, the build, every frontend command, and the Playwright suite (18 passed). The TDD-evidence lint is clean. Every catalogue mutant on a code line is killed, and so are the coder's 39 manual mutants.

The gate fails on test strength (E.9). Of the 21 mutants this review wrote, 8 change behaviour the contract specifies and still survive the story's suites:

- Nothing pins `as_of` or `known_on` on an `outdated` or `not_computable` input. DEC-0116 (5) requires both. The mandatory tests TC-COMP-062, 100 and 101 are the ones that produce these rows (IR-001).
- Nothing pins `detail.periods_found` on a missing value input, or on a growth input that is missing a line item. Design 2.4, T018 and T019 require it (IR-002).
- Nothing pins the acquisition data type a missing growth input is enriched with. Design 2.3 step 5 and T019 require it (IR-003).

All three are test-only remediations. No production line needs to change.

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 3 · MEDIUM 2 · LOW 1 · **total 6**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | HIGH | `as_of` and `known_on` on `outdated` and `not_computable` rows are unpinned; 3 non-equivalent mutants survive the TC-COMP-062, 100 and 101 tests |
| IR-002 | HIGH | `periods_found` on missing value inputs, and on a growth input missing a line item, is unpinned; 3 non-equivalent mutants survive |
| IR-003 | HIGH | The `fundamentals` acquisition data type of a missing growth input is unpinned; `growth-data-type-prices` survives |
| IR-004 | MEDIUM | The market-capitalisation bar's `recorded_at` tie-break (DEC-0117 (1)) is unpinned; `value-bar-recorded-asc` survives |
| IR-005 | MEDIUM | T022's signal is not in the commit message where S7 looks for it, and its seq-scan answer is not stated |
| IR-006 | LOW | A present ratio of 1e20 or more overflows `numeric(30,10)` and fails the whole set; this is an owner or design question |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S3` |
| HEAD | `e67482f5977852551d030619be97eead39f44bde` (stage commit `story-coding(CAP-002-E2-S3): fundamental value and growth inputs from quarterly statements`) |
| Review base | `31359b27afccf009da6efa9a68fea92a498a7aba`, from `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` (no `--base-ref`). `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before and after validation: `git status --porcelain --untracked-files=all` is empty, no staged, unstaged or untracked files |
| Changed files reviewed | 173 (170 added, 3 modified) |
| Baseline | none: initial review |

The reviewed patch `CAP-002-E2-S3-evidence/cycle-1.patch` has sha256 `5bfc6284…`, which equals the evidence's `diff_sha256`. For each of the nine `src/` and `tests/` files, the patch is identical to `git diff 31359b2..HEAD`, compared file by file with `index` lines ignored. So the code the per-cycle reviews approved is the code committed.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/engine.py` | modified (additions only) | T016: `_line_item_parameters`, `_fundamental_inputs_stage`, the four statement loads, registration (DEC-0121) |
| `src/factorflow/classification/sql/statements.sql` | added | T015, as amended by DEC-0221 |
| `src/factorflow/classification/sql/value_inputs.sql` | added | T018 |
| `src/factorflow/classification/sql/growth_inputs.sql` | added | T019 |
| `src/factorflow/classification/sql/insert_inputs.sql` | added | T017 |
| `tests/integration/engine_inputs_support.py` | added | T002 |
| `tests/integration/test_engine_inputs_fundamentals.py` | added | T003 to T008, T012, T014 |
| `tests/integration/test_engine_currency.py` | added | T009, T010, T013 |
| `tests/unit/test_engine_line_item_params.py` | added | T011 |
| `.../stories/CAP-002-E2-S3.md` | modified | Status `planning` to `in-review` (story-coding G). The content revision is unchanged: `artifact-gate.py revision` gives `sha256:e36e2eb3…`, the approved `reviewed_revision`, and `artifact-gate.py check` passes |
| `.../stories/CAP-002-E2-S3-tasks.md` | modified | Checkboxes only. A word diff shows 24 `[ ]` to `[x]` changes and nothing else |
| `.../stories/CAP-002-E2-S3-tdd-evidence.yaml` | added | T024 |
| `.../stories/CAP-002-E2-S3-evidence/` (161 files) | added | T024 and T022: `cycle-1.patch`, the RED, full-suite and T022 logs, `t022-volume-probe.py`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json` and 154 mutation logs |

No unjustified file, dependency or configuration change. `tests/conftest.py`, `tests/integration/engine_support.py`, `pyproject.toml`, `constants.py`, `line_items.py` and every delivered test are untouched (T023).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `value_inputs.sql` `judged` (numerator per input, `close_price * shares_outstanding`). `growth_inputs.sql:96` (`trailing_sum / prior_sum - 1`). `statements.sql` windows | `test_revenue_growth_is_four_quarter_sum…`, `test_eps_growth…`, `test_fcf_yield_subtracts_signed_capital_expenditure`, `test_market_capitalisation_is_latest_close_times_newest_shares`, `test_plain_decimal_*`, `test_growth_applies_the_line_item_sign` | Exact values to 10 places. The stored `value` is `numeric(30,10)`, see IR-006 |
| AC-12 | SATISFIED (S3 share) | Every non-present row carries `status` and a `detail.cause`. Unresolved keys name their `line_items` (`value_inputs.sql:138`, `growth_inputs.sql:70`) | `test_unresolved_line_items_leave_value_and_growth_missing`, `test_only_unresolved_line_items_are_named`, `test_resolved_items_classify_independently…`, `test_seven_quarters…` | Writing `not_classified` on the classification is CAP-002-E2-S5's (S5 T008, TC-COMP-095), as the plan allocates. `periods_found` on value rows is unpinned (IR-002) |
| AC-13 | SATISFIED | `value_inputs.sql:145-146`; `growth_inputs.sql:86` | `test_fundamentals_outdated_at_six_months_and_a_day`, `test_fundamentals_present_at_exactly_six_months`, the month-end case, `test_stale_latest_bar…`, `test_growth_ignores_bar_currency` | Dates on outdated rows are unpinned (IR-001) |
| DAC-E2-1 | SATISFIED | TTM over `ttm_slot` 1-4, prior year over `prior_slot` 1-4 (DEC-0221), newest balance sheet (`period_rank = 1`), sign applied | As AC-7, plus the window tests (52-week filer, gaps, the 4-month boundary, three quarters) and `test_statement_windows_assign_trailing_and_prior_slots` | The DEC-0221 window replaces the design's 12-month span rule. It is the rule DEC-0055 (1) states |
| DAC-E2-6 | SATISFIED | `fundamentals_outdated` and `prices_outdated` (`value_inputs.sql:145-146`); growth reads no bar | The TC-COMP-100 and TC-COMP-101 tests; `test_stale_period_and_stale_bar_are_both_named` | Precedence follows DEC-0116 (1) |
| DAC-E2-9 | SATISFIED | Stage runs on the build's REPEATABLE READ connection (DEC-0111). `statements.sql` orders by `observed_on DESC, recorded_at DESC` | `test_statement_committed_during_the_build_is_not_used`, `test_later_observation…`, `test_equal_observed_on_is_decided_by_the_later_recorded_at` | — |
| DAC-E2-S3-1 | SATISFIED | `growth_inputs.sql:96`, `as_of = max(fiscal_period_end)` | `test_revenue_growth_is_four_quarter_sum_over_prior_four_minus_one` (value, `as_of`, `known_on`, full `detail`) | — |
| DAC-E2-S3-2 | SATISFIED | `growth_inputs.sql:72` and `found` | `test_seven_quarters_leave_growth_missing_and_value_unaffected` plus the gap variants | — |
| DAC-E2-S3-3 | SATISFIED | `statements.sql:16`, which filters before `DISTINCT ON` | `test_annual_rows_enter_no_trailing_sum`, `test_stock_with_only_annual_statements…` | Reviewer mutant `statements-fy-filtered-after-ranking` is killed |
| DAC-E2-S3-4 | SATISFIED | `statements.sql:10-19` | `test_later_observation_of_a_period_is_used_and_earlier_untouched` (both rows byte-identical), the tie test | — |
| DAC-E2-S3-5 | SATISFIED | `value_inputs.sql:117-118`, `growth_inputs.sql:76-77` (`make_interval(months => 6)`) | TC-COMP-100 pair and the month-end case | Dates on outdated rows are unpinned (IR-001) |
| DAC-E2-S3-6 | SATISFIED | `value_inputs.sql:146`; growth never reads a bar | `test_stale_latest_bar_makes_value_inputs_outdated_and_leaves_growth`, `test_stock_without_any_bar…`, `test_retired_stock_bar…` | Dates on outdated rows are unpinned (IR-001) |
| DAC-E2-S3-7 | SATISFIED (S3 share) | `value_inputs.sql:153`, `growth_inputs.sql:87`, with the causes and components in `detail` | The two TC-COMP-062 tests, `test_market_capitalisation_of_one_is_computable`, `test_small_positive_prior_year_base_is_computable` | The "factor not classified with that reason input" half is S5 T008 (TC-COMP-095). Dates on `not_computable` rows are unpinned (IR-001) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Prerequisites exist. The commit message records the model class (`FinancialStatement`, `models.py:206`) and the serialised form | The record names the `>= 1e16` exponent case. Floats below `1e-6` also serialise in exponent form (`str(Decimal(str(1e-07)))` is `1E-7`). Carried to the owner below |
| T002 | complete | VERIFIED | `tests/integration/engine_inputs_support.py` | Signatures as planned, plus keyword-only `numbers` and `recorded_at` on `add_statement` |
| T003 | complete | VERIFIED | Module fixture `env` | — |
| T004 | complete | VERIFIED | TC-COMP-060 test | — |
| T005 | complete | VERIFIED | TC-COMP-094 test and the gap variants | Value `periods_found` is unpinned (IR-002) |
| T006 | complete | VERIFIED | TC-COMP-061 tests | — |
| T007 | complete | VERIFIED | TC-COMP-161 test and the tie test | — |
| T008 | complete | VERIFIED | TC-COMP-062 tests | The assertions the plan asks for are present. Dates are unpinned (IR-001) |
| T009 | complete | VERIFIED | TC-COMP-100 tests, the month-end case, the growth case | `known_on` on outdated rows is unpinned (IR-001) |
| T010 | complete | VERIFIED | TC-COMP-101, no-bar and retired-bar tests | — |
| T011 | complete | VERIFIED | `tests/unit/test_engine_line_item_params.py` | Adds a registration-once test |
| T012 | complete | VERIFIED | Cases (a) to (k) are present | Gaps: (b), (e) and (h) for `periods_found` (IR-002); (j) for growth's data type (IR-003); (d) for the `recorded_at` tie (IR-004) |
| T013 | complete | VERIFIED | Both causes named, the DEC-0116 (3) date, growth ignores bars | — |
| T014 | complete | VERIFIED | `test_statement_committed_during_the_build_is_not_used` | — |
| T015 | complete | VERIFIED | `statements.sql` | Justified deviation: DEC-0221 (owner) replaces T015's 12-month span wording with consecutive ends at most 4 months apart, prior year at ranks 5-8 |
| T016 | complete | VERIFIED | `engine.py:161-207`; additions only; registered at the end (no `_classification_stage` yet) | — |
| T017 | complete | VERIFIED | `insert_inputs.sql` | — |
| T018 | complete | VERIFIED | `value_inputs.sql` | — |
| T019 | complete | VERIFIED | `growth_inputs.sql` | — |
| T020 | complete | VERIFIED | 72 story tests pass | — |
| T021 | complete | VERIFIED | Re-run below. S2's `test_engine_sql_safety.py` and `test_classification_sql_ships.py` pass unedited, and the wheel carries the four files | `test_classification_stage_order.py` does not exist yet (S5) |
| T022 | complete | VERIFIED | `t022-volume-probe.log`/`.py`; timings in the TDD evidence | Recorded in the evidence file, not the commit message, and the seq-scan answer is not stated (IR-005) |
| T023 | complete | VERIFIED | All seven TCs are tagged. Every other test's docstring cites an AC, DAC, DEC, SEC id or the design | Checked mechanically over all three test modules |
| T024 | complete | VERIFIED | `CAP-002-E2-S3-tdd-evidence.yaml`: one cycle, `commit_hash: stage`, APPROVED, no drift; lint clean | — |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_revenue_growth_is_four_quarter_sum_over_prior_four_minus_one` / TC-COMP-060 | ADEQUATE | Distinct revenues, exact value, `as_of` P1, `known_on` from a re-acquired prior-window row, full `detail` equality including filing dates and `backfilled` | none |
| `test_seven_quarters_leave_growth_missing_and_value_unaffected` / TC-COMP-094 | ADEQUATE | Seven `periods_found` ends, income type only, null dates, value inputs exact | none for growth. Value-side `periods_found` belongs to IR-002 |
| `test_annual_rows_enter_no_trailing_sum` / TC-COMP-061 | ADEQUATE | FY rows at P1 (observed later), inside the trailing window and inside the prior window | none |
| `test_later_observation_of_a_period_is_used_and_earlier_untouched` / TC-COMP-161 | ADEQUATE | Later value used, `known_on` 2026-07-15, both rows byte-identical | none |
| `test_non_positive_prior_year_base_makes_growth_not_computable` / TC-COMP-062 | WEAK | Zero and negative bases for both items; cause, base, eight periods, `as_of` P1 | `known_on` unasserted. Mutant `growth-known-on-present-only` survives (IR-001) |
| `test_non_positive_shares_make_every_value_input_not_computable` / TC-COMP-062 | WEAK | Zero and negative shares; cause, shares, market cap, null value | `as_of` and `known_on` unasserted. Mutants `value-as-of-present-or-outdated` and `value-known-on-present-only` survive (IR-001) |
| `test_fundamentals_outdated_at_six_months_and_a_day` / TC-COMP-100 | WEAK | All five inputs `outdated`, null value, `as_of`, the `detail.outdated` object | `known_on` unasserted. `value-known-on-present-only` and `growth-known-on-present-only` survive (IR-001) |
| `test_fundamentals_present_at_exactly_six_months` / TC-COMP-100 | ADEQUATE | All five `present` at the boundary | none |
| `test_stale_latest_bar_makes_value_inputs_outdated_and_leaves_growth` / TC-COMP-101 | WEAK | Stale stock's value inputs `outdated` with the prices cause; growth and the current stock unaffected | `as_of` and `known_on` on the outdated rows unasserted (IR-001) |
| DEC-0221 window tests: 52-week filer and gaps, the 4-month boundary pair, three quarters, `test_statement_windows_assign_trailing_and_prior_slots` | ADEQUATE for windows | Kill every window mutant: the catalogue ones on `statements.sql:36, 47, 48, 56-58`, the coder's 13 `statements-*` ones and `statements-partition-instrument-only` | Value inputs' `periods_found` asserted only as a cause (IR-002) |
| `test_absent_item_in_newest_balance_sheet_does_not_fall_back`, `test_unusable_line_item_value_reads_as_absent[*]` | WEAK | Cause and `line_items` on the value input | `periods_found` unasserted. `value-absent-periods-found-dropped` and `value-found-window-only` survive (IR-002) |
| `test_absent_line_item_and_stale_is_missing` | WEAK | Statuses only | Growth `line_item_absent` detail unasserted. `growth-absent-periods-found-dropped` survives (IR-002) |
| `test_missing_input_carries_the_last_fundamentals_acquisition`, `test_missing_price_carries_the_last_prices_acquisition`, `test_missing_input_without_acquisition_state_has_no_acquisition_key` | WEAK | Value inputs' enrichment for fundamentals and prices; absent row leaves `detail` unchanged | No growth missing row meets an `acquisition_state` row. `growth-data-type-prices` survives (IR-003) |
| `test_market_capitalisation_is_latest_close_times_newest_shares` | WEAK | Latest session, then latest `observed_on`; every MC component | `recorded_at` tie unpinned. `value-bar-recorded-asc` survives (IR-004) |
| Other T012, T013 and T014 tests (sign, number and string forms, fractions, ratios, retired roster, no statements, factor filter, precedence, `known_on` of present rows, backfill flag, snapshot, mixed `as_of`, both causes) | ADEQUATE | Each kills the mutants aimed at it, among them `value-known-on-least`, `value-absent-check-dropped`, `value-ttm-ignores-formed`, `statements-first-observed-quarterly-only`, `growth-found-all-types`, `growth-as-of-present-or-outdated` | none |
| `tests/unit/test_engine_line_item_params.py` | ADEQUATE | `None` for the sentinel, call-time read, key and sign of a resolved item, registered once | none |

**Isolation and determinism.** Each test gets a fresh database (`tests/conftest.py::postgres_connection_string`). Dates are fixed literals and no test reads the clock. The four mutation baselines and every validation run passed with the same counts.

**Mutation (reviewer, at `e67482f`).** `mutants.json` has sha256 `1b05098c…` and 170 mutants:

- 110 catalogue mutants from `generate --range 31359b2..HEAD --cycle review`, the same 110 the coder generated. The 48 on code lines are all killed. The 62 on SQL `--` comment lines all survive. They are equivalent: PostgreSQL discards comments before planning, so the statements are unchanged.
- The coder's 39 manual mutants, re-tagged `review`. All are killed, which confirms the evidence's claim.
- 21 reviewer manual mutants. 12 are killed. 9 survive:
  - 8 are non-equivalent: `value-known-on-present-only`, `value-as-of-present-or-outdated`, `growth-known-on-present-only` (IR-001); `value-found-window-only`, `value-absent-periods-found-dropped`, `growth-absent-periods-found-dropped` (IR-002); `growth-data-type-prices` (IR-003); `value-bar-recorded-asc` (IR-004).
  - 1 is equivalent: `growth-absent-line-items-dropped`, which drops `detail.line_items` from a growth input that is missing a line item. Design 2.4 ("Statements") and T019 specify only `cause` and `periods_found` for that case. A growth input reads exactly one line item, which the row's `input_name` already identifies.

Results: 99 killed, 71 survived. Results sha256 `417fa664…`, copied beside this report as `CAP-002-E2-S3-implementation-review-v1-mutation.json`.

## Independent Validation

`<component>` is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/feactorflow-v2-cap-002-e2-pipeline-285094/repos/factorflow-v2/FactorFlow-v2`, at `e67482f` throughout. `<scratch>` is this session's scratchpad, outside the repository. Inside the sandbox, `uv` failed with `Failed to initialize cache at /Users/alvarodejodra/.cache/uv … Operation not permitted`, and `npm ci` hit `EPERM` on `node_modules/iconv-lite/.idea`. Each such command was rerun outside the sandbox as one plain call. Docker Desktop and testcontainers PostgreSQL 16 served every postgres test.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | evidence | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | evidence | `READY — story is ready for independent review` |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/…/CAP-002-E2-S3-tdd-evidence.yaml --repo-dir <component> --base 31359b27afccf009da6efa9a68fea92a498a7aba --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings |
| `uv run --directory <component> --offline pytest tests/integration/test_engine_inputs_fundamentals.py tests/integration/test_engine_currency.py tests/unit/test_engine_line_item_params.py -q -p no:cacheprovider` | component | 0 | PASS (focused) | 72 passed, 10.04 s |
| `uv sync --directory <component> --all-extras --offline` | component | 0 | PASS (required) | Resolved 46, checked 43 |
| `uv build --directory <component> --offline` | component | 0 | PASS (required) | sdist and wheel built; the wheel contains `classification/sql/statements.sql`, `value_inputs.sql`, `growth_inputs.sql`, `insert_inputs.sql` |
| `uv run --directory <component> --offline pytest -q -p no:cacheprovider` | component | 0 | PASS (required) | 1539 passed, 1 xfailed (S2's strict-xfail TC-COMP-059), 236.99 s |
| `uv run --directory <component> --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS (required) | 506 passed, 1034 deselected, 210.07 s |
| `uv run --directory <component> --offline pytest -m "not postgres" -q -p no:cacheprovider` | component | 0 | PASS (required) | 1033 passed, 506 deselected, 1 xfailed, 25.15 s |
| `uv run --directory <component> --offline ruff check .` | component | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --offline ruff format --check .` | component | 0 | PASS (required) | 232 files already formatted |
| `uv run --directory <component> --offline mypy src` | component | 0 | PASS (required) | No issues in 56 source files |
| `npm --prefix <component> ci --offline --no-audit --no-fund` | component | 0 | PASS (required) | 250 packages from the local cache. `--offline` keeps it off the network; the lockfile install is otherwise `npm ci` |
| `npm --prefix <component> run build` | component | 0 | PASS (required) | Vite bundle into the ignored `src/factorflow/api/static/` |
| `npm --prefix <component> run test` | component | 0 | PASS (required) | 41 files, 297 tests |
| `npm --prefix <component> run lint` | component | 0 | PASS (required) | 97 files, no fixes |
| `npm --prefix <component> run format` | component | 0 | PASS (required) | 97 files, no fixes |
| `npm --prefix <component> exec -- tsc --noEmit -p <component>` | component | 0 | PASS (required) | No output; this is `npx tsc --noEmit` with the root `tsconfig.json` named |
| `npm --prefix <component> run test:e2e` | component | 0 | PASS (required) | 18 passed (3.0 m), and the `posttest:e2e` backstop removed the container |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 31359b27afccf009da6efa9a68fea92a498a7aba..HEAD --cycle review --out <scratch>/mut/generated.json`, then `python3 -I <scratch>/tools/build_mutants.py …` | harness root | 0 | evidence | 110 catalogue mutants (7 `negate-boolean`, 103 `off-by-one`) plus 39 coder and 21 reviewer manual mutants |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mut/mutants.json --jobs 4 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider tests/unit/test_engine_line_item_params.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_sql_ships.py tests/integration/test_engine_inputs_fundamentals.py tests/integration/test_engine_currency.py' --out <scratch>/mut/results.json --logs <scratch>/mut/logs --work-root <scratch>/mut/work` | harness root | 3 | FAIL (E.9 gate) | 99 killed, 71 survived. 8 non-equivalent survivors (IR-001 to IR-004). The four baselines passed (17.5 to 17.6 s). Ran 02:47:47Z to 02:54:14Z. The first attempt exited 1 before running anything, because `--work-root` did not exist yet |

Not run: no story-specific command beyond the above. Nothing was excluded.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E2-S3` at `e67482f`, clean, `code-revision` `sha256:7c07b717…`.
- After (03:07:22Z): same branch, HEAD and `code-revision`. `git status --porcelain --untracked-files=all` is empty. Only ignored paths were written: `.venv/`, `build/`, `dist/`, `src/factorflow.egg-info/`, `node_modules/`, `src/factorflow/api/static/*`, `test-results/`. Mutation clones, logs and results stayed under `<scratch>`.
- Unexpected tracked-file changes: none.

## Decision Records Cited by the Commit

`git log -1 --format='%(trailers:key=Decision-Id,valueonly)'` lists all nine trailers.

| Decision | Standing | Judgement |
|----------|----------|-----------|
| DEC-0055 | agent, owner `upheld`, `applied` | Implemented: (1) as read by DEC-0221, (2) and (5) to (7) |
| DEC-0056 | agent, `upheld`, `applied` | Implemented: the `backfilled` flag over every row of the instrument (`statements.sql:21-32`) |
| DEC-0111 | agent, `upheld`, `applied` | Relied on: S2's REPEATABLE READ; the snapshot test passes |
| DEC-0115 | agent, `upheld`, `applied` | Implemented: `stmt` and `inputs` temp tables; `factors` filter |
| DEC-0116 | agent, `upheld`, `applied` | Implemented, including the (4) guard. (5)'s dates on non-present rows are not tested (IR-001) |
| DEC-0117 | agent, `upheld`, `applied` (scope S4) | (2) guard shared. (1)'s bar order is followed but untested (IR-004) |
| DEC-0121 | agent, `upheld`, `applied` | Implemented: registered at the end, with no `_classification_stage` present |
| DEC-0122 | agent, `upheld`, `applied` (scope S6) | Respected: `detail.periods` lists every row used, including the balance sheet |
| DEC-0221 | **owner**, `open`, `owner_reviewed: false` (the `decisions new` default) | Has standing: `decided_by: owner`, recorded in this attended run. It applies DEC-0055 (1), which design 2.4 says it implements. The implementation matches it exactly, and its window mutants are all killed. `decisions.py show` finds its one commit, `e67482f`. The record file is still **untracked** in the harness worktree, so the driver must commit it with the run's records. Design 2.4 and T015 still state the superseded rule; DEC-0221 defers that amendment to the design's next revision |

## Findings

### IR-001 — Dates on outdated and not-computable inputs are pinned by no test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S3-5, DAC-E2-S3-6, DAC-E2-S3-7, AC-13 (the user story's "with the date each was known")
- **Tasks**: T008, T009, T010 (tests); T018, T019 (behaviour)
- **Files**: `src/factorflow/classification/sql/value_inputs.sql:163-164`, `growth_inputs.sql:98`. Tests: `test_non_positive_shares_make_every_value_input_not_computable`, `test_non_positive_prior_year_base_makes_growth_not_computable`, `test_fundamentals_outdated_at_six_months_and_a_day`, `test_stale_latest_bar_makes_value_inputs_outdated_and_leaves_growth`
- **Claim challenged**: the TC-COMP-062, 100 and 101 tests prove the `not_computable` and `outdated` rows the stage writes.
- **Observed evidence**: three reviewer mutants survive the story suites (106 passed each):
  - `value-known-on-present-only` writes `known_on` only for `present` value rows.
  - `growth-known-on-present-only` does the same for growth rows.
  - `value-as-of-present-or-outdated` drops `as_of` from `not_computable` value rows.

  No test asserts `known_on` on any `outdated` or `not_computable` row, or `as_of` on a `not_computable` value row.
- **Expected evidence/behavior**: DEC-0116 (5) requires that `as_of` and `known_on` "are set whenever the rows used are determined and null for missing". Design 2.4 makes `known_on` the latest `observed_on` across every row the input used. Factor-engine section 8 criterion 7 requires that "every input records `as_of`, `known_on`".
- **Impact**: the code is correct today. A regression that nulls these dates would pass every test, and S5 and the evidence screen read these rows.
- **Required remediation**: assert `as_of` and `known_on` on the `not_computable` value and growth rows (TC-COMP-062), on the fundamentals-outdated rows (TC-COMP-100) and on the price-outdated value rows (TC-COMP-101). Each expected value must be computed from the fixture, so the three mutants above are killed.

### IR-002 — `periods_found` on missing value inputs, and on a growth input missing a line item, is pinned by no test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-12, DAC-E2-1
- **Tasks**: T005, T012 (b), (e), (h) (tests); T018, T019 (behaviour)
- **Files**: `value_inputs.sql:79-90` (`found`), `value_inputs.sql:175-178`, `growth_inputs.sql:109-112`. Tests: the value-side assertions of `test_three_quarters_form_no_trailing_window`, `test_quarter_absent_from_the_trailing_window_forms_no_window`, `test_gap_between_third_and_fourth_quarters…`, `test_fifty_two_week_filer_missing_a_quarter…`, `test_absent_item_in_newest_balance_sheet_does_not_fall_back`, `test_unusable_line_item_value_reads_as_absent`, `test_absent_line_item_and_stale_is_missing`
- **Claim challenged**: missing inputs carry the evidence of what exists.
- **Observed evidence**: three reviewer mutants survive:
  - `value-found-window-only` drops balance sheets from value inputs' `periods_found`. For `book_to_price` that leaves the list empty.
  - `value-absent-periods-found-dropped` drops `periods_found` from `line_item_absent` value rows.
  - `growth-absent-periods-found-dropped` drops it from `line_item_absent` growth rows.

  The only content asserted for value `periods_found` is `[]`, in the annual-only test. The growth `line_item_absent` detail is never read.
- **Expected evidence/behavior**: design 2.4 ("Fewer than four periods in either window, or a line item absent from a period's payload, makes the input `missing`, with `detail.periods_found` listing what exists"). T018 (`missing` … "(detail `periods_found`)"). T019 (`periods_found` = every quarterly income-statement period end on or before the date).
- **Impact**: the code is correct today. A regression in this evidence would pass, and it is what explains a not-classified stock (AC-12).
- **Required remediation**: assert the exact `periods_found` on at least:
  - one `periods_missing` value input that reads a TTM window, with balance sheets and window rows;
  - `book_to_price` missing a line item;
  - a value input and a growth input whose cause is `line_item_absent`.

  The three mutants above must be killed.

### IR-003 — The acquisition data type of a missing growth input is pinned by no test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-12
- **Tasks**: T012 (j) (test); T017, T019 (behaviour)
- **Files**: `growth_inputs.sql:124` (`'fundamentals'::text`), `insert_inputs.sql:17-20`. Tests: `test_missing_input_carries_the_last_fundamentals_acquisition`, `test_missing_input_without_acquisition_state_has_no_acquisition_key`
- **Claim challenged**: T012 (j) states that "a `missing` input's `detail` carries the instrument's `acquisition_state` outcome for `fundamentals`".
- **Observed evidence**: reviewer mutant `growth-data-type-prices` survives. It makes growth rows look up `prices`. Every enrichment assertion is on a value input. The one growth assertion runs with no `acquisition_state` row at all.
- **Expected evidence/behavior**: design 2.3 step 5 enriches "with the instrument's latest `acquisition_state` outcome for the data type concerned". T019 sets `missing_data_type = 'fundamentals'` for growth.
- **Impact**: a regression would show a missing growth input with the last price download's outcome, which is the wrong evidence for AC-12.
- **Required remediation**: one case with both `fundamentals` and `prices` `acquisition_state` rows whose outcomes differ. A missing growth input must carry the `fundamentals` outcome, so the mutant is killed.

### IR-004 — The bar chosen for market capitalisation is not pinned when two observations share a session and an `observed_on`

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-1
- **Tasks**: T012 (d)
- **Files**: `value_inputs.sql:99`; `test_market_capitalisation_is_latest_close_times_newest_shares`
- **Claim challenged**: the close used is the latest observation of the latest session.
- **Observed evidence**: reviewer mutant `value-bar-recorded-asc` survives. It reverses `recorded_at DESC` in the bar `ORDER BY`. The test separates observations by `observed_on` only.
- **Expected evidence/behavior**: DEC-0117 (1) orders bar observations "`observed_on DESC` then `recorded_at DESC`". Design 2.4 selects bars "as the statements stage does for periods", and that stage breaks ties on `recorded_at` (design 2.3 step 3). T012 (d) as written asks only for the latest `observed_on`, so the planned test is complete. That is why this finding is MEDIUM.
- **Impact**: the code is correct. Without a test, a regression would pick an older same-day re-acquisition's close.
- **Required remediation**: one same-session, same-`observed_on` pair with different `recorded_at` and close, in both insertion orders as the statements tie test does. Assert the later recording's close.

### IR-005 — T022's signal is not recorded where the plan says, and its seq-scan answer is not stated

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T022
- **Files**: commit `e67482f` message; `CAP-002-E2-S3-tdd-evidence.yaml` `green_evidence`; `CAP-002-E2-S3-evidence/t022-volume-probe.log`
- **Claim challenged**: T022 says to "record in the commit message whether any statement exceeds 30 seconds or sequentially scans `fundamental_observation` without `idx_fundamental_instrument_period`".
- **Observed evidence**:
  - The commit message has no T022 line.
  - The TDD evidence gives the timings: 0.9 s for the build, 0.14, 0.56, 0.22 and 0.12 s per statement, so nothing is near 30 s. It does not answer the seq-scan question.
  - The committed log answers it. The `stmt` read uses `Index Scan using idx_fundamental_instrument_period` (line 27). The `first_observed` CTE runs `Seq Scan on fundamental_observation f_1` over all 72,000 rows (line 41).
- **Expected evidence/behavior**: the plan's T022 text. CAP-002-E2-S7 T001 (3) reads "the S3, S4 and S5 commit messages for the `EXPLAIN (ANALYZE, BUFFERS)` timings".
- **Impact**: S7's planner will not find the signal where its plan looks, and nobody has stated that one statement seq-scans the table. The scan is harmless at 72,000 rows.
- **Required remediation**: state both T022 answers, including the `first_observed` seq scan, in the rework commit message or the TDD evidence, where S7 T001 (3) can find them.

### IR-006 — A present ratio of 1e20 or more fails the whole set

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-12 (by analogy)
- **Tasks**: T018, T019
- **Files**: `value_inputs.sql:162`, `growth_inputs.sql:96`, `insert_inputs.sql`; `factor_input.value numeric(30,10)` (migration `0006`)
- **Claim challenged**: one stock's payload never aborts the set (the rationale of DEC-0116's rejected "cast with `->> numeric`" alternative).
- **Observed evidence**: `inputs.value` is unconstrained `numeric`. `factor_input.value` holds at most 20 integer digits, so a present ratio at or above `1e20` raises `numeric field overflow` and the build fails. The guard accepts any plain decimal, so a tiny positive market capitalisation or prior-year base can produce such a ratio. The coder raised this as a follow-up.
- **Expected evidence/behavior**: no artifact fixes this case. It is an owner or design question: for example, `not_computable` above a bound.
- **Impact**: it needs implausible data, but it fails every stock's classification at once.
- **Required remediation**: none in this rework unless the owner decides it. Carry it to the design's next revision.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **DEC-0221 (justified).** `statements.sql` implements consecutive quarter ends at most 4 months apart, with the prior year at ranks 5-8. That replaces T015's and design 2.4's 12-month span rule. The commit message and the TDD evidence both record it.
- **4-month bound.** The bound is a SQL literal (`statements.sql:36`), commented with DEC-0221, because T023 allows no edit to `constants.py`. Design 3's list of quantitative constants needs it at the revision DEC-0221 promises.
- **T022.** Results were recorded in the TDD evidence instead of the commit message (IR-005).
- **No scope leakage.** The `engine.py` diff is additions only. `engine.py`'s module docstring still describes S2 alone. That is doc-sync's, and the coder raised it.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding`, review-rework mode) with `CAP-002-E2-S3-tasks.md` and this report.
- **Required action**:
  - Close IR-001, IR-002 and IR-003 with tests only, then IR-004 and IR-005.
  - The rework must kill these 8 mutants: `value-known-on-present-only`, `value-as-of-present-or-outdated`, `growth-known-on-present-only`, `value-found-window-only`, `value-absent-periods-found-dropped`, `growth-absent-periods-found-dropped`, `growth-data-type-prices` and `value-bar-recorded-asc`. Each is defined in `CAP-002-E2-S3-implementation-review-v1-mutation.json`.
  - The next review scopes against this report's `reviewed_head` and mutation file.
  - The driver must commit `projects/factorflow-v2/decisions/DEC-0221.md` with the run's records.
- **Owner questions carried, not decided here**:
  - Payload values in exponent notation read as absent under DEC-0116 (4). Ingestion writes that form for floats of `1e16` or more and for non-zero floats below `1e-6`.
  - Two quarterly period ends a few days apart count as two quarters under DEC-0221's "distinct `fiscal_period_end`".
  - IR-006's overflow.
- **Warnings accepted downstream**: N/A.
