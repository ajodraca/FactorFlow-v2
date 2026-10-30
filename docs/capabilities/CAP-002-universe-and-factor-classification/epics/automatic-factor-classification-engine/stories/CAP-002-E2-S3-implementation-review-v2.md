---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
story_id: "CAP-002-E2-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-28T21:44:13Z"
reviewed_head: "f83459b86660eb60f0d8b6dfd83e3823b873367c"
review_base: "31359b27afccf009da6efa9a68fea92a498a7aba"
reviewed_state_revision: "sha256:c45089e1e268a562d47bb2c110d334c453db476eef5be69080cbe2f288fdb3cb"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-10-28T21:50:00Z
  source_artifacts:
    - id: CAP-002-E2-S3
      version: "1 (sha256:e36e2eb33ccd79e72b4d9ec6a27ce18a820e3f5c36964bdb3248d8ed95ffefc0)"
    - id: CAP-002-E2-S3-tasks
      version: "1 (updated 2026-10-28, last_reworked_review v1)"
    - id: CAP-002-E2-S3-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-002-E2-S3-implementation-review
      version: "1 (baseline, reviewed_head e67482f5977852551d030619be97eead39f44bde)"
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

# Implementation Review: CAP-002-E2-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 4 |
| Low findings | 1 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 24/24 verified |
| Required validation | 16/16 passed |

This is a re-review. Its baseline is review v1 (`CHANGES-REQUIRED`, `reviewed_head` `e67482f`). The rework commit `f83459b` changes tests only: `git diff e67482f..HEAD -- src` is empty. The committed test diff is byte-identical to `CAP-002-E2-S3-evidence/cycle-2.patch` (index lines aside), whose sha256 `e0bead64…` is the evidence's `diff_sha256`.

All six v1 findings are dispositioned:

- IR-001 to IR-004 are resolved. Each of v1's 8 non-equivalent survivors is now killed by a behavioural assertion in a rework test.
- IR-005 is resolved. The rework commit message states both T022 answers, including the `first_observed` sequential scan.
- IR-006 (LOW, owner question) stays open, carried as IR-005 below.

All 16 required validation commands pass, including the full Python suite (1540 passed, 1 xfailed) and Playwright (18 passed). The TDD-evidence lint is clean.

Every mutant this review carried from v1 behaves as v1 judged, with one difference: the 8 former survivors are now killed. 13 new reviewer mutants of production lines unchanged since the baseline found 8 more non-equivalent survivors. By step H they are `late`, so they cannot block. They are reported as four MEDIUM findings (IR-001 to IR-004), all test-only gaps; no production defect was found.

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 4 · LOW 1 · **total 5**

| ID | Severity | Scope | Summary |
|----|----------|-------|---------|
| IR-001 | MEDIUM | late | The `line_item_mapping_unresolved` cause for a stock without full windows is unpinned; 2 survivors |
| IR-002 | MEDIUM | late | Null `as_of` and `known_on` on missing value inputs (DEC-0116 (5)) are unpinned; 2 survivors |
| IR-003 | MEDIUM | late | A newest balance sheet observed last never decides `known_on` in any test (DEC-0055 (7)); 1 survivor |
| IR-004 | MEDIUM | late | `detail.periods` and the market-capitalisation parts on outdated and not-computable rows are unpinned; 3 survivors |
| IR-005 | LOW | carried | v1 IR-006: a present ratio of 1e20 or more overflows `numeric(30,10)` and fails the set; owner question |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S3` |
| HEAD | `f83459b86660eb60f0d8b6dfd83e3823b873367c` (`story-coding(CAP-002-E2-S3): rework review v1, …`) |
| Review base | `31359b27afccf009da6efa9a68fea92a498a7aba`, from `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` (no `--base-ref`); `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before and after validation: `git status --porcelain=v1 -uall` is empty |
| Changed files reviewed | 193 since the base (190 added, 3 modified); 24 since the baseline (20 added, 4 modified) |
| Baseline | v1, `reviewed_head` `e67482f5977852551d030619be97eead39f44bde`, mutation file `CAP-002-E2-S3-implementation-review-v1-mutation.json` |

Commits from the base: `e67482f` (stage commit, reviewed by v1), `f1d6607` (v1 report and its mutation file, docs only), `f83459b` (rework).

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/engine.py` | modified (additions only) | T016. Unchanged since the baseline |
| `src/factorflow/classification/sql/statements.sql` | added | T015 as amended by DEC-0221. Unchanged since the baseline |
| `src/factorflow/classification/sql/value_inputs.sql` | added | T018. Unchanged since the baseline |
| `src/factorflow/classification/sql/growth_inputs.sql` | added | T019. Unchanged since the baseline |
| `src/factorflow/classification/sql/insert_inputs.sql` | added | T017. Unchanged since the baseline |
| `tests/integration/engine_inputs_support.py` | added | T002. Unchanged since the baseline |
| `tests/integration/test_engine_inputs_fundamentals.py` | added; **modified in the delta** | T003 to T008, T012, T014. Rework adds `periods_found()`, `_bar_recorded()` and `test_equal_bar_observation_is_decided_by_the_later_recorded_at`, and strengthens 7 tests. No assertion was removed or weakened |
| `tests/integration/test_engine_currency.py` | added; **modified in the delta** | T009, T010, T013. Rework adds `known_on` and `as_of` assertions to TC-COMP-100 and TC-COMP-101 |
| `tests/unit/test_engine_line_item_params.py` | added | T011. Unchanged since the baseline |
| `.../stories/CAP-002-E2-S3.md` | modified | Status `in-review`, from the stage commit. `artifact-gate.py revision` gives `sha256:e36e2eb3…`, the approved `reviewed_revision`, and `artifact-gate.py check` passes. Unchanged since the baseline |
| `.../stories/CAP-002-E2-S3-tasks.md` | modified; **modified in the delta** | Checkboxes (stage commit). The rework adds frontmatter only: `updated: 2026-10-28` and `last_reworked_review`. `check-artifacts.py --strict` passes |
| `.../stories/CAP-002-E2-S3-tdd-evidence.yaml` | added; **modified in the delta** | T024: cycle-2 appended |
| `.../stories/CAP-002-E2-S3-implementation-review-v1.md` and `-v1-mutation.json` | added (commit `f1d6607`) | The baseline review and its mutation results |
| `.../stories/CAP-002-E2-S3-evidence/` (178 files) | added | T024 and T022. 161 from cycle 1. 17 in the delta: `cycle-2.patch`, `red-cycle-2-rework.log`, `full-suite-cycle-2.log`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json`, `mutation-cycle-2-review-v1-rerun.json`, and 12 mutation logs (4 baselines, 8 mutants) |

No unjustified file, dependency or configuration change. `tests/conftest.py`, `tests/integration/engine_support.py`, `pyproject.toml`, `constants.py`, `line_items.py` and every delivered test are untouched (T023).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `value_inputs.sql` `judged` (numerators, `close_price * shares_outstanding`); `growth_inputs.sql:96`; `statements.sql` windows | TC-COMP-060 test, `test_eps_growth…`, `test_fcf_yield_subtracts_signed_capital_expenditure`, `test_market_capitalisation_is_latest_close_times_newest_shares`, `test_equal_bar_observation_is_decided_by_the_later_recorded_at`, `test_plain_decimal_*`, `test_growth_applies_the_line_item_sign` | Exact values to 10 places; the bar's `recorded_at` tie is now pinned |
| AC-12 | SATISFIED (S3 share) | Every non-present row carries `status` and `detail.cause`; `periods_found` (`value_inputs.sql:79-90, 175-178`, `growth_inputs.sql:55-64, 109-112`); acquisition enrichment (`insert_inputs.sql:10-20`) | `test_three_quarters_form_no_trailing_window`, `test_quarter_absent_from_the_trailing_window_forms_no_window`, `test_absent_item_in_newest_balance_sheet_does_not_fall_back`, `test_absent_line_item_and_stale_is_missing`, `test_missing_input_carries_the_last_fundamentals_acquisition`, the unresolved-key tests | Writing `not_classified` on the classification is CAP-002-E2-S5's (S5 T008). The unresolved cause on a short-history stock is unpinned (IR-001, late) |
| AC-13 | SATISFIED | `value_inputs.sql:145-146`; `growth_inputs.sql:86` | TC-COMP-100 pair, month-end case, TC-COMP-101, `test_stale_period_and_stale_bar_are_both_named`, `test_growth_ignores_bar_currency` | Dates on outdated rows are now pinned |
| DAC-E2-1 | SATISFIED | TTM over `ttm_slot` 1-4, prior year over `prior_slot` 1-4 (DEC-0221), newest balance sheet (`period_rank = 1`), sign applied | As AC-7, plus the DEC-0221 window tests and `test_statement_windows_assign_trailing_and_prior_slots` | — |
| DAC-E2-6 | SATISFIED | `fundamentals_outdated`, `prices_outdated` (`value_inputs.sql:145-146`); growth reads no bar | TC-COMP-100, TC-COMP-101, the both-causes test | — |
| DAC-E2-9 | SATISFIED | The stage runs on the build's REPEATABLE READ connection (DEC-0111). `statements.sql:18-19` and the bar `ORDER BY` (`value_inputs.sql:99`) break ties on `recorded_at` | `test_statement_committed_during_the_build_is_not_used`, TC-COMP-161 test, both `recorded_at` tie tests | — |
| DAC-E2-S3-1 | SATISFIED | `growth_inputs.sql:96`; `as_of = max(fiscal_period_end)` | TC-COMP-060 test (value, `as_of`, `known_on`, full `detail`) | — |
| DAC-E2-S3-2 | SATISFIED | `growth_inputs.sql:72` and `found` | TC-COMP-094 test and the gap variants; value inputs' `periods_found` is now exact | — |
| DAC-E2-S3-3 | SATISFIED | `statements.sql:16`, which filters before `DISTINCT ON` | TC-COMP-061 tests | — |
| DAC-E2-S3-4 | SATISFIED | `statements.sql:10-19` | TC-COMP-161 test (both rows byte-identical), the tie test | — |
| DAC-E2-S3-5 | SATISFIED | `value_inputs.sql:117-118`, `growth_inputs.sql:76-77` | TC-COMP-100 pair (now with `known_on`), month-end case | — |
| DAC-E2-S3-6 | SATISFIED | `value_inputs.sql:146`; growth never reads a bar | TC-COMP-101 (now with `as_of` and `known_on`), no-bar and retired-bar tests | — |
| DAC-E2-S3-7 | SATISFIED (S3 share) | `value_inputs.sql:153`, `growth_inputs.sql:87`, with cause and components in `detail` | Both TC-COMP-062 tests (now with `as_of` and `known_on`), the boundary tests | The "factor not classified with that reason input" half is S5 T008 (TC-COMP-095) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Prerequisites exist; the stage commit message records the serialised form | — |
| T002 | complete | VERIFIED | `tests/integration/engine_inputs_support.py` | Unchanged since the baseline |
| T003 | complete | VERIFIED | Module fixture `env` | — |
| T004 | complete | VERIFIED | TC-COMP-060 test | — |
| T005 | complete | VERIFIED | TC-COMP-094 test and the gap variants; the rework adds exact value-side `periods_found` | v1 IR-002 closed |
| T006 | complete | VERIFIED | TC-COMP-061 tests | — |
| T007 | complete | VERIFIED | TC-COMP-161 test and the tie test | — |
| T008 | complete | VERIFIED | TC-COMP-062 tests now assert `as_of` and `known_on` | v1 IR-001 closed |
| T009 | complete | VERIFIED | TC-COMP-100 test now asserts `known_on` (the bar for value inputs, the newest statement for growth) | v1 IR-001 closed |
| T010 | complete | VERIFIED | TC-COMP-101 test now asserts `as_of` and `known_on` | Both candidate dates are equal in this fixture, as its comment says. The bar deciding `known_on` is pinned by TC-COMP-100 and `test_value_known_on_is_the_latest_observation_of_statements_and_bar` |
| T011 | complete | VERIFIED | `tests/unit/test_engine_line_item_params.py` | — |
| T012 | complete | VERIFIED | Cases (a) to (k). The rework closes (b), (e), (h) `periods_found`, (j) growth's data type and (d) the `recorded_at` tie | Late gaps: IR-001 to IR-004 |
| T013 | complete | VERIFIED | Both causes named, the DEC-0116 (3) date, growth ignores bars | — |
| T014 | complete | VERIFIED | `test_statement_committed_during_the_build_is_not_used` | — |
| T015 | complete | VERIFIED | `statements.sql` | Justified deviation: DEC-0221 (owner) replaces the 12-month span rule |
| T016 | complete | VERIFIED | `engine.py:161-207`, additions only; registered at the end (no `_classification_stage` yet) | — |
| T017 | complete | VERIFIED | `insert_inputs.sql` | — |
| T018 | complete | VERIFIED | `value_inputs.sql` | — |
| T019 | complete | VERIFIED | `growth_inputs.sql` | — |
| T020 | complete | VERIFIED | 73 story tests pass | — |
| T021 | complete | VERIFIED | Re-run below. S2's `test_engine_sql_safety.py` and `test_classification_sql_ships.py` pass unedited, and the wheel carries the four files | `test_classification_stage_order.py` does not exist yet (S5) |
| T022 | complete | VERIFIED | `t022-volume-probe.log`/`.py`; the rework commit message records the timings (largest 561 ms) and the `first_observed` sequential scan (4.8 ms over 72,000 rows) | v1 IR-005 closed |
| T023 | complete | VERIFIED | Seven TCs tagged (TC-COMP-062 and 100 twice each). The new test's docstring cites DEC-0117 (1) and design 2.4 | Checked mechanically |
| T024 | complete | VERIFIED | `CAP-002-E2-S3-tdd-evidence.yaml`: cycle-2 with `commit_hash: stage`, APPROVED, no drift; the lint is clean | The cycle-2 RED is mutant-based: each v1 survivor fails the changed tests (4, 2, 5, 4, 2, 1, 1, 1 failures). That is the meaningful RED for a test-only rework |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_revenue_growth_is_four_quarter_sum_over_prior_four_minus_one` / TC-COMP-060 | ADEQUATE | Exact value, `as_of` P1, `known_on` from a re-acquired prior-window row, full `detail` | none. Kills the new `growth-known-on-trailing-only` |
| `test_seven_quarters_leave_growth_missing_and_value_unaffected` / TC-COMP-094 | ADEQUATE | Seven `periods_found` ends, null dates on growth rows, value inputs exact | none. Kills the new `growth-as-of-on-missing` and `growth-known-on-on-missing` |
| `test_annual_rows_enter_no_trailing_sum` / TC-COMP-061 | ADEQUATE | FY rows at P1, inside the trailing window and inside the prior window | none |
| `test_later_observation_of_a_period_is_used_and_earlier_untouched` / TC-COMP-161 | ADEQUATE | Later value used, `known_on` 2026-07-15, both rows byte-identical | none |
| `test_non_positive_prior_year_base_makes_growth_not_computable` / TC-COMP-062 | ADEQUATE | Adds `known_on == P1 + 15 days`; cause, base, eight periods, `as_of` | none blocking. Kills `growth-known-on-present-only` |
| `test_non_positive_shares_make_every_value_input_not_computable` / TC-COMP-062 | ADEQUATE | Adds `as_of == P1`, `known_on == max(P1 + 15, L)` (the bar decides); cause, shares, market cap | `detail.periods` unasserted (IR-004, late, which does not make the test WEAK). Kills `value-known-on-present-only` and `value-as-of-present-or-outdated` |
| `test_fundamentals_outdated_at_six_months_and_a_day` / TC-COMP-100 | ADEQUATE | Adds `known_on`: L (bar) for value, latest + 15 days for growth | `detail.periods` unasserted (IR-004, late) |
| `test_fundamentals_present_at_exactly_six_months` / TC-COMP-100 | ADEQUATE | All five `present` at the boundary | none |
| `test_stale_latest_bar_makes_value_inputs_outdated_and_leaves_growth` / TC-COMP-101 | ADEQUATE | Adds `(as_of, known_on)` on the stale stock's value inputs | Both dates coincide here, as the test's comment says. `greatest()` is pinned by other tests |
| DEC-0221 window tests and `test_statement_windows_assign_trailing_and_prior_slots` | ADEQUATE | Kill every window mutant; value inputs' `periods_found` is now exact in two of them | none |
| `test_absent_item_in_newest_balance_sheet_does_not_fall_back` | ADEQUATE | Full `detail`, with every balance sheet in `periods_found` | Null dates on the missing row unasserted (IR-002, late) |
| `test_absent_line_item_and_stale_is_missing` | ADEQUATE | Growth `cause` and `periods_found`; full `earnings_yield` detail | none |
| `test_missing_input_carries_the_last_fundamentals_acquisition` | ADEQUATE | A missing value and a missing growth input both carry the `fundamentals` outcome, with a differing `prices` row present | none. Kills `growth-data-type-prices` |
| `test_equal_bar_observation_is_decided_by_the_later_recorded_at` (new) | ADEQUATE | Same session and `observed_on`, different `recorded_at` and close, both insertion orders, two stocks; asserts the later recording's close and value | none. Kills `value-bar-recorded-asc`. Its local `_bar_recorded` helper is justified: `engine_support.add_bar` takes no `recorded_at`, and T023 forbids editing it |
| `test_value_known_on_is_the_latest_observation_of_statements_and_bar` | ADEQUATE | Window rows and a later bar decide `known_on` | The newest balance sheet never decides (IR-003, late) |
| `test_unresolved_line_items_leave_value_and_growth_missing` | ADEQUATE | Every input names its line items; the set completes | A stock without full windows is never read (IR-001, late) |
| Other T012, T013, T014 tests | ADEQUATE | Unchanged since v1, which judged them; their mutants are still killed | none |
| `tests/unit/test_engine_line_item_params.py` | ADEQUATE | `None` for the sentinel, call-time read, key and sign, registered once | none |

**Isolation and determinism.** Each test gets a fresh database (`tests/conftest.py::postgres_connection_string`). Dates and `recorded_at` values are fixed literals, and no test reads the clock. The four mutation baselines each passed in 19.8 to 19.9 s, and every suite gave the same counts across runs.

**Mutation (reviewer, at `f83459b`).** 183 mutants were run.

- **Generation.** `generate --range 31359b2..HEAD --cycle review` gives the same 110 catalogue mutants as v1. Eleven reviewer manual mutants were added. `scope --since e67482f --previous <v1 mutation file>` added v1's 60 manual mutants and tagged 170 `carried` and 11 `late`. Two corrected variants (`-b`) were run separately and scoped `late`.
- **Carried (170): 107 killed, 63 survived.**
  - All 48 catalogue mutants on code lines are killed.
  - The 62 catalogue mutants on SQL `--` comment lines survive. They are equivalent: PostgreSQL discards comments before planning.
  - Of v1's 60 manual mutants, 59 are killed. That includes all 8 v1 survivors, each failing on a behavioural assertion in a rework test, never on the SQL safety tests.
  - The remaining one, `growth-absent-line-items-dropped`, survives and is equivalent. Design 2.4 ("Statements") and T019 specify only `cause` and `periods_found` for a growth input missing a line item, and its single line item is named by `input_name`. I re-derived this independently and agree with v1.
- **Late (13 reviewer mutants): 5 killed, 8 survived.**
  - Three kills are behavioural: `growth-known-on-trailing-only`, `growth-as-of-on-missing` and `growth-known-on-on-missing`.
  - Two kills are artefacts. `value-outdated-detail-without-base` and `growth-outdated-detail-without-base` used `'{}'::jsonb`, and only `test_engine_sql_files_use_named_parameters_only` rejected them, as a brace placeholder. Their `-b` variants use `jsonb_build_object()`, and both survive.
  - The 8 survivors are all non-equivalent: `growth-window-before-unresolved`, `value-periods-before-unresolved` (IR-001); `value-as-of-on-missing`, `value-known-on-on-missing` (IR-002); `value-known-on-excludes-balance-sheet` (IR-003); `value-outdated-detail-without-base-b`, `growth-outdated-detail-without-base-b`, `value-not-computable-periods-dropped` (IR-004).
  - All 8 change lines unchanged since the baseline. v1 could have run them, so they are `late`.
- **Results.** `CAP-002-E2-S3-implementation-review-v2-mutation.json` is the main run (sha256 `54c5e2a3…`) with the supplementary run (sha256 `981d2981…`) appended under `supplementary_runs`. The merged file's sha256 is `d78562af…`.

## Independent Validation

`<component>` is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/feactorflow-v2-cap-002-e2-pipeline-285094/repos/factorflow-v2/FactorFlow-v2`, at `f83459b` throughout. `<scratch>` is this session's scratchpad, outside the repository. `uv`, `npm` and every Docker-backed command were run outside the sandbox, each as one plain call: the `uv` cache, `npm ci` and the Docker socket are refused inside it. Docker Desktop and testcontainers PostgreSQL 16 served every postgres test.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | evidence | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | evidence | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/…/CAP-002-E2-S3-tdd-evidence.yaml --repo-dir <component> --base 31359b27afccf009da6efa9a68fea92a498a7aba --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings |
| `uv run --directory <component> --offline pytest tests/integration/test_engine_inputs_fundamentals.py tests/integration/test_engine_currency.py tests/unit/test_engine_line_item_params.py -q -p no:cacheprovider` | component | 0 | PASS (focused) | 73 passed, 9.60 s (v1: 72; one new test) |
| `uv sync --directory <component> --all-extras --offline` | component | 0 | PASS (required) | Resolved 46, checked 43 |
| `uv run --directory <component> --offline pytest -q -p no:cacheprovider` | component | 0 | PASS (required) | 1540 passed, 1 xfailed (S2's strict-xfail TC-COMP-059), 250.81 s |
| `uv run --directory <component> --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS (required) | 507 passed, 1034 deselected, 237.43 s |
| `uv run --directory <component> --offline pytest -m "not postgres" -q -p no:cacheprovider` | component | 0 | PASS (required) | 1033 passed, 507 deselected, 1 xfailed, 25.91 s |
| `uv run --directory <component> --offline ruff check .` | component | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --offline ruff format --check .` | component | 0 | PASS (required) | 232 files already formatted |
| `uv run --directory <component> --offline mypy src` | component | 0 | PASS (required) | No issues in 56 source files |
| `npm --prefix <component> ci --offline --no-audit --no-fund` | component | 0 | PASS (required) | 250 packages from the local cache |
| `npm --prefix <component> run build` | component | 0 | PASS (required) | Vite bundle into the ignored `src/factorflow/api/static/` |
| `npm --prefix <component> run test` | component | 0 | PASS (required) | 41 files, 297 tests |
| `npm --prefix <component> run lint` | component | 0 | PASS (required) | 97 files, no fixes. Run before `uv build`; see the environment note |
| `npm --prefix <component> run format` | component | 0 | PASS (required) | 97 files, no fixes. Run before `uv build` |
| `npm --prefix <component> exec -- tsc --noEmit -p <component>` | component | 0 | PASS (required) | No output; `npx tsc --noEmit` with the root `tsconfig.json` named |
| `npm --prefix <component> run test:e2e` | component | 0 | PASS (required) | 18 passed (3.0 m); `posttest:e2e` removed the container |
| `uv build --directory <component> --offline` | component | 0 | PASS (required) | sdist and wheel built; the wheel contains `classification/sql/statements.sql`, `value_inputs.sql`, `growth_inputs.sql`, `insert_inputs.sql` |
| `npm --prefix <component> run lint` (again, after `uv build`) | component | 1 | environment note | 40 errors, all in `./build/lib/factorflow/api/static/assets/index-BFn-kDOZ.js`, the Vite bundle `uv build` copies into the git-ignored `build/`. `biome.json` does not ignore `build/`. No tracked file is affected, and nothing was deleted |
| `npm --prefix <component> run format` (again, after `uv build`) | component | 1 | environment note | 2 errors, both in `./build/lib/factorflow/api/static/assets/` (`index-BFn-kDOZ.js` and an older `index-CLWAKYLJ.js`). No tracked file is affected |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 31359b27afccf009da6efa9a68fea92a498a7aba..HEAD --cycle review --out <scratch>/mut2/generated.json`, then `python3 -I <scratch>/tools/add_manual.py …` | harness root | 0 | evidence | 110 catalogue mutants (7 `negate-boolean`, 103 `off-by-one`) plus 11 reviewer manual |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/mut2/with-manual.json --since e67482f5977852551d030619be97eead39f44bde --previous <component>/…/CAP-002-E2-S3-implementation-review-v1-mutation.json --out <scratch>/mut2/mutants.json` | harness root | 0 | evidence | 181 mutants: 170 carried, 11 late; 0 previous mutants no longer apply. `mutants.json` sha256 `7a0937ac…` |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mut2/mutants.json --jobs 4 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider tests/unit/test_engine_line_item_params.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_sql_ships.py tests/integration/test_engine_inputs_fundamentals.py tests/integration/test_engine_currency.py' --out <scratch>/mut2/results.json --logs <scratch>/mut2/logs --work-root <scratch>/mut2/work` | harness root | 3 | evidence (E.9) | 112 killed, 69 survived. 21:22:35Z to 21:30:09Z. Every non-equivalent survivor is `late` |
| The same `run` over `<scratch>/mut2/supp-mutants.json` (the two `-b` variants, scoped late), `--jobs 2` | harness root | 3 | evidence (E.9) | 2 survived (IR-004) |
| `python3 scripts/artifact-gate.py revision`, then `check`, on the story | harness root | 0 | evidence | `sha256:e36e2eb3…`, equal to the approved `reviewed_revision`; gate passed |
| `python3 scripts/check-artifacts.py --project factorflow-v2 --artifact <tasks> --strict` | harness root | 0 | evidence | PASSED |

Nothing required was excluded. Every command in `docs/constitution/tech-stack.md` and the story's validation list ran in full.

### Validation Side Effects

- Before (21:19:14Z): branch `usr/alvaro-de-jodra/CAP-002-E2-S3` at `f83459b`, clean, `code-revision` `sha256:c45089e1…`.
- After (21:44:13Z): same branch, HEAD and `code-revision`, and `git status --porcelain=v1 -uall` is empty. Only ignored paths were written: `.venv/`, `build/`, `dist/`, `src/factorflow.egg-info/`, `node_modules/`, `src/factorflow/api/static/*`, `test-results/`. Mutation clones, logs and results stayed under `<scratch>`.
- Unexpected tracked-file changes: none.

## Decision Records Cited by the Rework Commit

`git log -1 --format='%(trailers:key=Decision-Id,valueonly)' f83459b` lists DEC-0055, DEC-0116, DEC-0117 and DEC-0221. The tests the rework adds assert what each states:

| Decision | Standing | Judgement |
|----------|----------|-----------|
| DEC-0055 | agent, owner `upheld`, `applied` | (7): `known_on` assertions on outdated and not-computable rows. The balance-sheet case is IR-003 |
| DEC-0116 | agent, owner `upheld`, `applied` | (5): dates on outdated and not-computable rows are now pinned. Null dates on missing value rows are IR-002 |
| DEC-0117 | agent, owner `upheld`, `applied` | (1): the bar's `recorded_at` tie is now pinned |
| DEC-0221 | **owner**, `open`, `owner_reviewed: false` | Has standing: `decided_by: owner`, recorded in this attended run. The windows still match it, and every window mutant is killed. The record is still **untracked** in the harness worktree (`?? projects/factorflow-v2/decisions/DEC-0221.md`), so the driver must commit it with the run's records |

## Findings

### IR-001 — The unresolved-mapping cause is unpinned for a stock without full windows

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-12
- **Tasks**: T012 (a) (test); T018, T019 (behaviour)
- **Files**: `src/factorflow/classification/sql/value_inputs.sql:138-141`, `growth_inputs.sql:70-73`. Test: `test_unresolved_line_items_leave_value_and_growth_missing`
- **Claim challenged**: while a key is `REQUIRES_INPUT`, every dependent input is `missing` with `line_item_mapping_unresolved`.
- **Observed evidence**: reviewer mutants `growth-window-before-unresolved` and `value-periods-before-unresolved` survive the story suites. Each moves the `periods_missing` test ahead of the unresolved test. The only unresolved-key fixture gives the stock under test eight full quarters, so its windows always form. The fixture's peer stock has no statements, but its rows are never read.
- **Expected evidence/behavior**: design 2.4 ("Line items"): "While any key is unresolved, every input depending on it is `missing` with `detail.cause = "line_item_mapping_unresolved"`". T018 and T019 list the unresolved cause first.
- **Impact**: the code is correct today. Until the owner supplies the payload keys, this is the state of every stock in production. A regression would report "periods missing" for a short-history stock instead of naming the mapping gap.
- **Required remediation**: none required for this gate (late). When convenient, read a stock with unresolved keys and fewer than eight quarters (or none), and assert the unresolved cause on its value and growth inputs.

### IR-002 — Null dates on missing value inputs are unpinned

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-12
- **Tasks**: T012 (b), (e) (tests); T018 (behaviour)
- **Files**: `value_inputs.sql:163-164`. Tests: `test_absent_item_in_newest_balance_sheet_does_not_fall_back`, `test_unusable_line_item_value_reads_as_absent`, `test_three_quarters_form_no_trailing_window`
- **Claim challenged**: `as_of` and `known_on` are null on every `missing` row.
- **Observed evidence**: reviewer mutants `value-as-of-on-missing` and `value-known-on-on-missing` survive. They write the dates on missing value rows whose statement rows exist. Only growth rows have null dates asserted (TC-COMP-094), and the growth counterparts of these mutants are killed.
- **Expected evidence/behavior**: DEC-0116 (5): "`as_of` and `known_on` are set whenever the rows used are determined and null for missing".
- **Impact**: the code is correct today. A regression would give a missing value input a date, which readers could take for evidence of a usable input.
- **Required remediation**: none required for this gate (late). When convenient, assert both dates are `None` on one `line_item_absent` value row.

### IR-003 — No test has the newest balance sheet decide `known_on`

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-9, AC-7
- **Tasks**: T012 (i)
- **Files**: `value_inputs.sql:74, 107`. Test: `test_value_known_on_is_the_latest_observation_of_statements_and_bar`
- **Claim challenged**: a value input's `known_on` is the latest `observed_on` of every row it used.
- **Observed evidence**: reviewer mutant `value-known-on-excludes-balance-sheet` survives. It drops balance-sheet rows from the statements' `max(observed_on)`. In the T012 (i) test, the newest balance sheet is observed on 2026-10-01, before the bar on L. Every other fixture also observes it no later than the bar or the window rows.
- **Expected evidence/behavior**: DEC-0055 (7). Design 2.4: "`known_on` is the latest `observed_on` across every statement, bar and corporate-action row the input used".
- **Impact**: the code is correct today. A regression would misdate `book_to_price` when shares or book equity are re-acquired after the bar.
- **Required remediation**: none required for this gate (late). When convenient, observe the newest balance sheet after the bar and the window rows, and assert `known_on` for all three value inputs.

### IR-004 — `detail` on outdated and not-computable rows is unpinned beyond its cause

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-12, AC-13, DAC-E2-S3-7
- **Tasks**: T008, T009, T010, T013 (tests); T018, T019 (behaviour)
- **Files**: `value_inputs.sql:179-180, 192-193`; `growth_inputs.sql:113-114`. Tests: the TC-COMP-062, 100 and 101 tests, `test_stale_period_and_stale_bar_are_both_named`
- **Claim challenged**: a non-present fundamental input still records the rows it was computed from.
- **Observed evidence**: three reviewer mutants survive:
  - `value-outdated-detail-without-base-b` drops `periods` and the market-capitalisation parts from outdated value rows.
  - `growth-outdated-detail-without-base-b` drops `periods` from outdated growth rows.
  - `value-not-computable-periods-dropped` drops `periods` from not-computable value rows.

  The tests assert `cause`, `outdated`, shares and market capitalisation, never `periods`.
- **Expected evidence/behavior**: design 2.4: "`detail` records, for a fundamental input, each period end used with its `observed_on`, `provider_filing_date` and `backfilled` flag plus the market-capitalisation components". DEC-0122 derives `restated_possible` from "exactly the statement rows listed in its detail periods". `classify.sql` then writes that mark on input-reason `not_classified` rows too, which are the rows an outdated or not-computable input produces.
- **Impact**: the code is correct today. CAP-002-E2-S6 builds on this seam. A regression would silently clear the restatement mark on every stock not classified for an outdated or not-computable input.
- **Required remediation**: none required for this gate (late). When convenient, assert `detail.periods` on one outdated value row, one outdated growth row and one not-computable value row, and the close and shares on the outdated value row.

### IR-005 — A present ratio of 1e20 or more fails the whole set (v1 IR-006)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: AC-12 (by analogy)
- **Tasks**: T018, T019
- **Files**: `value_inputs.sql:162`, `growth_inputs.sql:96`, `insert_inputs.sql`; `factor_input.value numeric(30, 10)` (migration `0006_classifications.sql:47`)
- **Claim challenged**: one stock's payload never aborts the set.
- **Observed evidence**: unchanged since v1. `inputs.value` is unconstrained `numeric`, and `factor_input.value` holds at most 20 integer digits. A tiny positive market capitalisation or prior-year base can produce a ratio that raises `numeric field overflow`, which fails the build. The rework commit carries it to the owner.
- **Expected evidence/behavior**: no artifact fixes this case. It is an owner or design question, for example `not_computable` above a bound.
- **Impact**: it needs implausible data, but it would fail every stock's classification at once.
- **Required remediation**: none unless the owner decides it. Carry it to the factor-engine design's next revision.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | Killed in this review's run: `value-known-on-present-only` and `value-as-of-present-or-outdated` by `test_non_positive_shares_make_every_value_input_not_computable[shares0]`, and `growth-known-on-present-only` by `test_non_positive_prior_year_base_makes_growth_not_computable[revenue-prior0-base0]`. TC-COMP-100 and 101 now assert `known_on` (and `as_of`) |
| v1/IR-002 (HIGH) | RESOLVED | `value-found-window-only` is killed by `test_quarter_absent_from_the_trailing_window_forms_no_window`, `value-absent-periods-found-dropped` by `test_absent_item_in_newest_balance_sheet_does_not_fall_back`, and `growth-absent-periods-found-dropped` by `test_absent_line_item_and_stale_is_missing`. All three of v1's required cases are asserted exactly |
| v1/IR-003 (HIGH) | RESOLVED | `growth-data-type-prices` is killed by `test_missing_input_carries_the_last_fundamentals_acquisition`, which now has a missing `revenue_growth` and differing `fundamentals` and `prices` outcomes |
| v1/IR-004 (MEDIUM) | RESOLVED | `value-bar-recorded-asc` is killed by the new `test_equal_bar_observation_is_decided_by_the_later_recorded_at` (both insertion orders) |
| v1/IR-005 (MEDIUM) | RESOLVED | The `f83459b` commit message states the T022 timings (none near 30 s), the `stmt` index scan, and the `first_observed` sequential scan without `idx_fundamental_instrument_period` (72,000 rows, 4.8 ms), where CAP-002-E2-S7 T001 (3) looks |
| v1/IR-006 (LOW) | STILL OPEN | Carried as IR-005; no artifact or owner decision has addressed it |

## Scope and Plan Deviations

- **DEC-0221 (justified, unchanged).** `statements.sql` implements consecutive quarter ends at most 4 months apart, with the prior year at ranks 5 to 8. That replaces T015's and design 2.4's 12-month span rule. The 4-month bound is a SQL literal (`statements.sql:36`) because T023 forbids editing `constants.py`. Design 3 needs it at the revision DEC-0221 promises.
- **Rework scope.** Tests, plan frontmatter and evidence only; no production line changed. `_bar_recorded` duplicates `add_bar` with a `recorded_at`, which is justified by T023.
- **No scope leakage.** `engine.py`'s module docstring still describes S2 only, which is doc-sync's to fix.
- **Bookkeeping.** All 24 tasks are checked and verified; nothing is inconsistent.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`) with `CAP-002-E2-S3-tasks.md` and this report.
- **Required action**:
  - The driver commits this report, `CAP-002-E2-S3-implementation-review-v2-mutation.json`, and the harness record `projects/factorflow-v2/decisions/DEC-0221.md`, which is still untracked.
  - IR-001 to IR-004 are optional test hardening. A later change can kill the 8 late survivors defined in the v2 mutation file.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004, IR-005.
- **Owner questions carried, not decided here**:
  - Payload values in exponent notation read as absent under DEC-0116 (4). Ingestion writes that form for floats of `1e16` or more and for non-zero floats below `1e-6`.
  - Two quarterly period ends a few days apart count as two quarters under DEC-0221's "distinct `fiscal_period_end`".
  - IR-005's overflow.
  - Environment: `biome.json` ignores `dist/**` but not `build/**`, so `npm run lint` and `npm run format` fail once `uv build` has copied the Vite bundle into the ignored `build/lib`.
