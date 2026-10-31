---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E2-S4"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-30T04:12:53Z"
reviewed_head: "d9fdf13084465c627bf122dc9b088e29c563a548"
review_base: "7688c924c554920816b60fd6af60fc81f1164174"
reviewed_state_revision: "sha256:299b1c48ee3605d667e77dc8bc8e3af3bb59233807a8da2ac38d1c3c19b4432b"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E2-S4
    artifact_version: 1
    content_revision: sha256:082f0afbd0c93634f17f5f0273a7534cfc988e3e6c871737bdb3b984cd1fafc8
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-30T04:12:53Z
  source_artifacts:
    - id: CAP-002-E2-S4
      version: "1 (sha256:082f0afbd0c93634f17f5f0273a7534cfc988e3e6c871737bdb3b984cd1fafc8)"
    - id: CAP-002-E2-S4-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E2-S4-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-factor-engine-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0241
      version: "open, provisional, agent, owner_reviewed false"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 3 |
| Low findings | 2 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 18/18 verified |
| Required validation | 15/15 passed |

The production change is correct as far as this review could test it. `momentum_inputs.sql` and `_momentum_inputs_stage` do what the story, the task plan, factor-engine design 2.4 and the cited decisions require: E and S_k per stock (DEC-0055 (3)), splits in (S_k, E] and dividends against the prior session's adjusted close (DEC-0055 (4), DEC-0118 (2), (3)), latest-trading-day currency (DEC-0055 (5)), the latest observation of every bar and action (DEC-0117 (1)), the payload guard (DEC-0117 (2), (3)), precedence (DEC-0116 (1), DEC-0118 (4), DEC-0241 (2)) and registration between the fundamentals and classification stages (DEC-0115, DEC-0121). All 15 required validation commands pass, among them the full Python suite (1679 passed, 1 xfailed) and the Playwright suite. The TDD-evidence lint is clean, and the reviewed patch is byte-identical to the committed code diff. Every catalogue mutant on a code line is killed except one equivalent, and so are all 58 of the coder's manual mutants, which I reran.

The gate fails on test strength (E.9). Of the 13 mutants this review wrote, 8 change behaviour the contract specifies and still survive the story's suites. Two of the gaps sit in mandatory tests:

- No test gives a second stock a corporate action, or a bar between a dividend's prior session and its ex-date. Dropping the instrument key from the split-set join or from the prior-session lookup passes every test. The mandatory TC-COMP-064 and TC-COMP-065 tests cannot see a stock's adjustment leaking across stocks (IR-001).
- No window holds more than one dividend in the `known_on` test, so `min` in place of `max` over the dividends' prior sessions survives TC-COMP-066 (IR-002).

Both are test-only remediations; no production line needs to change for them.

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 2 · MEDIUM 3 · LOW 2 · **total 7**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | HIGH | Per-stock isolation of corporate actions is unpinned: `review-split-set-any-instrument` and `review-prior-any-instrument` survive the TC-COMP-064 and TC-COMP-065 tests |
| IR-002 | HIGH | `known_on` over several dividends' prior sessions is unpinned: `review-known-on-prior-min` survives the TC-COMP-066 test |
| IR-003 | MEDIUM | A dividend's split factors over two or more later splits are unpinned: `review-close-factor-max` and `review-cash-factor-max` survive |
| IR-004 | MEDIUM | The unusable-payload and non-positive-close tests leave three specified behaviours unpinned: an unusable action beside usable ones, a sign-prefixed string, and DEC-0241 (2)'s precedence for an unusable dividend |
| IR-005 | MEDIUM | `known_on` of a missing momentum input follows a rule no artifact records: it counts actions that were not applied, unlike T010, DEC-0118 (1) and S3's missing rows |
| IR-006 | LOW | A momentum input missing for an unusable corporate-action payload carries the `prices` acquisition outcome, not `corporate_actions` (design 2.3 step 5); the code follows T010, so this is a design question |
| IR-007 | LOW | One implausible payload can still fail the whole set: a plain-decimal string over 131,072 digits, or a return of 1e20 or more, overflows `numeric` |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S4` |
| HEAD | `d9fdf13084465c627bf122dc9b088e29c563a548` (the stage commit, `story-coding(CAP-002-E2-S4)`) |
| Review base | `pipeline-state.py review-base` with no `--base-ref`: `7688c924c554920816b60fd6af60fc81f1164174` (HEAD~1, merge of PR #145); `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before review: `git status --porcelain=v1 --untracked-files=all` empty |
| Changed files reviewed | 190 (7 code, test and story files; 183 evidence files) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/sql/momentum_inputs.sql` | added | T010; AC-7, AC-13, DAC-E2-1, DAC-E2-6, DAC-E2-S4-1 to 5 |
| `src/factorflow/classification/engine.py` | modified (+27, additions only) | T011; `_MOMENTUM_INPUTS_SQL`, `_momentum_inputs_stage`, `_STAGES.append(_momentum_inputs_stage)` at line 236, between line 211 (fundamentals) and line 274 (classification) |
| `tests/integration/engine_momentum_support.py` | added | T002 |
| `tests/integration/test_engine_inputs_momentum.py` | added | T003 to T009, T018 |
| `.../stories/CAP-002-E2-S4-tasks.md` | modified | T001 to T018 checkboxes only |
| `.../stories/CAP-002-E2-S4.md` | modified | Frontmatter `status: planning` to `in-review` only. `artifact-gate.py revision` still gives the approved `sha256:082f0afb…`, and `artifact-gate.py check` passes |
| `.../stories/CAP-002-E2-S4-tdd-evidence.yaml` | added | T017 |
| `.../stories/CAP-002-E2-S4-evidence/` (183 files) | added | T017: `cycle-1.patch`, three RED logs, the full-suite log, `mutants-cycle-1.json`, `mutation-cycle-1-results.json` and 176 mutant and baseline logs. T014: `t014-volume-probe.py` and its log |

No change is unjustified. Nothing in `tests/conftest.py`, `engine_support.py`, `engine_inputs_support.py`, `test_engine_currency.py`, `pyproject.toml`, `insert_inputs.sql` or any delivered test was touched (T015).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `momentum_inputs.sql` `held`, `win`, `judged`, final `SELECT` (`(e_close / s_adjusted_close) * dividend_factor - 1`); `factor = 'momentum'`, `input_name = concat('return_', k, 'm')`; windows and lag from `constants` (`engine.py:214-236`) | The T004 to T007 tests; `test_every_active_stock_has_exactly_three_momentum_rows_and_a_retired_one_none` | Per-stock isolation is correct in the SQL but unpinned (IR-001) |
| AC-13 | SATISFIED | `statused`: `latest_session < %(latest_trading_day)s` gives `outdated` (line 218); `latest_session` is the stock's unbounded `max(session_date)` (lines 24-26) | TC-COMP-102 test; `test_a_latest_bar_after_e_but_before_the_latest_trading_day_is_outdated`; `test_a_retired_stocks_later_bar_does_not_move_the_latest_trading_day` | Reviewer `outdated-le` is killed |
| DAC-E2-1 | SATISFIED | Split factor `exp(sum(ln(split_from / split_to)))` over usable splits in (S_k, E] (lines 149, 196-197); dividend factor `exp(sum(ln(1 + cash × cash_factor / (prior_close × close_factor))))` (lines 137-139, 150); prior session `session_date < effective_on` (line 126) | TC-COMP-064 and 065 tests; split tests (outside, on S_k, on E, reverse, two splits, plain decimals); dividend tests (two, outside, zero, later split, split on ex-date, factors stop at E, split on prior session, ticker and IPO) | The compound of two later splits on one dividend is unpinned (IR-003). The DEC-0117 and DEC-0241 guards are steps the design does not list. Both are recorded decisions and change nothing for valid data |
| DAC-E2-6 | SATISFIED | As AC-13 | As AC-13 | — |
| DAC-E2-S4-1 | SATISFIED | `win` LEFT JOIN LATERAL S lookup; `boundary = concat('S_', k)` | `test_a_missing_12_month_price_makes_only_return_12m_missing` (exact detail, other two present with value, `as_of`, `known_on`) | — |
| DAC-E2-S4-2 | SATISFIED | `s_adjusted_close = s_close × exp(sum(log_factor))` | TC-COMP-064 test: split stock's value equals the twin's exactly, for JSON strings and numbers; adjusted S is 50 | — |
| DAC-E2-S4-3 | SATISFIED | `priced.log_term` | TC-COMP-065 test: `ret(99, 90, 1.01)` and the full dividend detail | Isolation unpinned (IR-001) |
| DAC-E2-S4-4 | SATISFIED | `greatest(e_observed_on, s_observed_on, max(a.observed_on), max(a.prior_observed_on))` (lines 163-164) | TC-COMP-066 test, five parameters; unused bars and out-of-window actions observed later do not move it; `known_on` differs per k | Several dividends' prior sessions are unpinned (IR-002) |
| DAC-E2-S4-5 | SATISFIED | As AC-13; `value` only for `present` (line 235); `as_of = e_session` | TC-COMP-102 test: three `outdated`, value null, `as_of` E, `known_on` E, exact detail; the fresh stock `present` | — |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S2's and S3's symbols exist at the base (`engine.build`, `_STAGES`, `_fundamental_inputs_stage`, `inputs`, `insert_inputs.sql` with `%(factors)s`, `inputs_for`) | — |
| T002 | complete | VERIFIED | `engine_momentum_support.py`: `add_bar_observed`, `add_close_series`, `add_corporate_action`, `run_momentum_stages`, `momentum_fixture_dates`; every writer commits | `value_hash` covers every column written, so re-acquisitions are distinct rows |
| T003 | complete | VERIFIED | `env` fixture, anchor bar on 2026-10-16 | — |
| T004 | complete | VERIFIED | TC-COMP-063 plus four boundary tests and the month-end case | — |
| T005 | complete | VERIFIED | TC-COMP-064 (two payload forms) plus six split tests | Isolation gap, IR-001 |
| T006 | complete | VERIFIED | TC-COMP-065 (two payload forms) plus eight dividend tests | IR-001, IR-003 |
| T007 | complete | VERIFIED | TC-COMP-066, five parameters | IR-002 |
| T008 | complete | VERIFIED | TC-COMP-102 plus three currency tests | — |
| T009 | complete | VERIFIED | (a) to (g) each present: precedence, TC-COMP-059 support, roster and acquisition, revisions, unusable payloads (13 cases), snapshot, one bar | IR-004 |
| T010 | complete | VERIFIED | `momentum_inputs.sql`, one `INSERT INTO inputs … SELECT` | Justified deviation: index lookups instead of the `DISTINCT ON` `bar` CTE (T014 evidence). Unrecorded deviation on `known_on` of missing rows, IR-005 |
| T011 | complete | VERIFIED | `engine.py:214-236`; no `ingestion` import | — |
| T012 | complete | VERIFIED | No S3 file edited; focused suite green | — |
| T013 | complete | VERIFIED | My validation below; the wheel ships `momentum_inputs.sql` (15,712 B); `test_engine_sql_safety.py`, `test_classification_sql_ships.py` and `test_classification_stage_order.py` pass unedited | — |
| T014 | complete | VERIFIED | Commit message Notes and `t014-volume-probe.log`: 0.40 s, `daily_bar` read only through `idx_daily_bar_instrument_session` | A signal, not a gate. I read the plan; I did not rerun the probe |
| T015 | complete | VERIFIED | The five mapped `# Implements` tags (063, 064, 065, 066, 102) are present; additional tests cite an AC or DEC; diff limited to the planned files | — |
| T016 | complete | VERIFIED | No `format(`, `\|\|`, braces, `float` or `double precision`; `%` only in `%(name)s` placeholders; divergences in the commit Notes | — |
| T017 | complete | VERIFIED | `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings; `diff_sha256` `5ae8e9ec…` equals `git diff 7688c92..HEAD -- src tests` | One cycle for the whole plan; the code review rejected round one, and the rework stayed inside the cycle with its own RED |
| T018 | complete | VERIFIED | `assert_momentum_invariants` runs in four tests; reviewer `restated-true` is killed by it | — |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_a_missing_12_month_price_makes_only_return_12m_missing` / TC-COMP-063 | ADEQUATE | Status, null value, `as_of` E, the exact boundary detail; the other two present with value, `as_of` and `known_on` | none |
| `test_a_2_for_1_split_inside_the_window_leaves_the_return_unchanged` / TC-COMP-064 | WEAK | Exact equality with the unsplit twin in both payload forms; split detail; adjusted S of 50 | The twin carries no corporate action, so a split set joined across stocks passes (IR-001) |
| `test_a_dividend_of_1_on_a_prior_close_of_100_multiplies_the_factor_by_1_01` / TC-COMP-065 | WEAK | `ret(99, 90, 1.01)` in both payload forms; the whole dividend detail; kills `review-prior-on-ex-date` | No other stock has a bar before the ex-date, so a prior-session lookup without the instrument key passes (IR-001) |
| `test_known_on_is_the_latest_observation_of_the_bars_and_actions_used` / TC-COMP-066 | WEAK | Each of the E bar, S bar, split, dividend and prior bar drives `known_on` in turn; later unused rows excluded; 6m and 12m see the earlier split | One dividend per window, so `min` over prior sessions passes (IR-002) |
| `test_a_stale_latest_bar_makes_all_three_momentum_inputs_outdated` / TC-COMP-102 | ADEQUATE | Three `outdated`, value null, `as_of` and `known_on` E, exact detail with both dates; the fresh stock present | none |
| T004 boundary tests (four plus month-end) | ADEQUATE | Resolved E and S_k dates, the on-target bar, the after-target bar, `interval` month-end semantics | none |
| T005 split tests (outside, on S_k, on E, reverse, two, plain decimals) | ADEQUATE | Values and split lists per window; kill the window-edge mutants | none |
| `test_a_dividend_before_a_later_split_is_scaled_by_that_split` and the other T006 dividend tests | WEAK (non-mandatory) | Value, `split_factor`, `prior_adjusted_close` with one later split | No dividend has two later splits (IR-003) |
| T008 currency tests | ADEQUATE | Currency on the latest bar, the active-only latest trading day, independence from statements | none |
| T009 (a) precedence, (b) TC-COMP-059 support, (c) roster and acquisition, (d) revisions and ties, (f) snapshot, (g) one bar | ADEQUATE | Kill every ordering, roster, data-type, snapshot and precedence mutant tried | none |
| `test_an_unusable_payload_makes_only_the_windows_containing_it_missing` (T009 e), `test_a_non_positive_close_on_a_bar_used_makes_only_its_windows_missing`, `test_missing_ranks_before_outdated_whatever_the_cause` | WEAK (non-mandatory) | 13 payload cases with exact detail; six DEC-0241 cases; cause precedence | Each window holds one action; no `+` string; no unusable dividend with a non-positive prior (IR-004) |
| `test_a_positive_close_below_one_is_read`, `test_the_momentum_stage_is_registered_once_between_fundamentals_and_classification` | ADEQUATE | Cut-off and registration order | none |

**Isolation and determinism.** Every test builds its own migrated database (`migrate_through_classification`), fixes every date, and gives each re-acquired row a distinct `observed_on` or an explicit `recorded_at`. The tie test inserts the later recording first, so insertion order cannot pass it. I found no order, clock or network dependence.

**Mutation (E.9).** Commands are in the validation table.

1. `mutation-run.py generate` over `7688c92..HEAD` gave 112 catalogue mutants, all in `momentum_inputs.sql` (103 `off-by-one`, 9 `negate-boolean`). The catalogue found nothing to mutate in the `engine.py` additions.
2. I added 13 manual mutants of my own (`manual:review-*`). I also reran the coder's 58 manual mutants from `mutants-cycle-1.json`, tagged for this review, so their kills are my evidence, not the coder's.
3. All 183 ran in four parallel clones, against the focused suite (104 tests; all four baselines passed). Result: 118 killed and 65 survived.

| Survivor(s) | Disposition | Contract reasoning |
|-------------|-------------|--------------------|
| 56 catalogue mutants on `--` comment lines (lines 2, 3, 5, 8, 17, 36, 51, 63, 81, 105, 108, 132, 133, 144, 152, 161, 169, 202, 209, 211, 234, 240) | equivalent | PostgreSQL discards SQL comments. No artifact specifies comment text, and the SQL safety scan finds no `%`, brace or `\|\|` in any of them |
| `momentum_inputs.sql:205:negate-boolean:1` (`coalesce(…, true) AS price_not_positive`) | equivalent | The `coalesce` default is reached only when the comparison is null, which happens only when E or S_k is absent. Such a row is `missing` on its boundary, and the detail's boundary branch comes first (lines 242-247), so status, value and detail are unchanged |
| `manual:review-split-set-any-instrument` | **non-equivalent** | DEC-0055 (3), (4) and design 2.4 (`ca.instrument_id = b.instrument_id`) adjust a stock by its own splits. IR-001 |
| `manual:review-prior-any-instrument` | **non-equivalent** | DEC-0118 (3): the prior session is "the stock's latest bar before the ex-date". IR-001 |
| `manual:review-known-on-prior-min` | **non-equivalent** | DEC-0118 (1): the maximum over "the prior-session bar of each dividend applied". IR-002 |
| `manual:review-close-factor-max`, `manual:review-cash-factor-max` | **non-equivalent** | Design 2.4: the product of `split_from/split_to` over the splits after the bar; "the same cumulative factor as for the price". IR-003 |
| `manual:review-unusable-bool-and` | **non-equivalent** | DEC-0117 (3): any unusable split or dividend in the window makes the input missing. IR-004 |
| `manual:review-cash-regex-allows-plus` | **non-equivalent** | DEC-0117 (2), and T010's guard `'^-?[0-9]+(\.[0-9]+)?$'`, which DEC-0116 (4) names as DEC-0117 (2)'s guard: `+1` is not a plain decimal. IR-004 |
| `manual:review-non-positive-ignores-unusable` | **non-equivalent** | DEC-0241 (1) covers the prior session of any dividend in the window, and (2) ranks a non-positive close before an unusable payload. IR-004 |

Five of my mutants are killed: `restated-true`, `distinct-on-without-type` (a split and a dividend on one date), `prior-on-ex-date`, `outdated-le` and `cash-json-number-only`. All 58 of the coder's manual mutants are killed in my run, which matches `mutation-cycle-1-results.json`.

## Independent Validation

`<component>` = `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/feactorflow-v2-cap-002-e2-pipeline-285094/repos/factorflow-v2/FactorFlow-v2`. Every command that needs Docker, the uv cache or npm ran outside the sandbox as one plain call, with `--directory` or `--prefix` naming the component.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider tests/integration/test_engine_inputs_momentum.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_stage_order.py tests/unit/test_classification_sql_ships.py` | each mutation clone | 0 | PASS (focused) | The four mutation baselines: 104 passed each, 11.4 to 11.5 s |
| `uv sync --all-extras --directory <component>` | harness root | 0 | PASS (required) | Resolved 46 packages, checked 43 |
| `uv build --directory <component>` | harness root | 0 | PASS (required) | sdist and wheel built; the wheel lists `factorflow/classification/sql/momentum_inputs.sql` (15,712 B) |
| `uv run --directory <component> pytest -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1679 passed, 1 xfailed, 251.87 s. The xfail is S2's strict TC-COMP-059 line-item check |
| `uv run --directory <component> pytest -m postgres -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 597 passed, 1083 deselected, 222.02 s |
| `uv run --directory <component> pytest -m "not postgres" -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1082 passed, 597 deselected, 1 xfailed, 29.34 s |
| `uv run --directory <component> ruff check .` | harness root | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> ruff format --check .` | harness root | 0 | PASS (required) | 240 files already formatted |
| `uv run --directory <component> mypy src` | harness root | 0 | PASS (required) | No issues in 56 source files |
| `npm ci --prefix <component>` | harness root | 0 | PASS (required) | 250 packages added |
| `npm run build --prefix <component>` | harness root | 0 | PASS (required) | Vite build, 63 modules |
| `npm run test --prefix <component>` | harness root | 0 | PASS (required) | 47 files, 876 tests |
| `npm run test:e2e --prefix <component>` | harness root | 0 | PASS (required) | 18 passed (2.9 min); the `posttest:e2e` hook removed its container |
| `npm run lint --prefix <component>` | harness root | 1 | PASS (environment note) | Every diagnostic is in the git-ignored `build/lib/factorflow/api/static/assets/*.js` bundle (`.gitignore:12: build/`), which `uv build` copies there and `biome.json` does not ignore. Rerun over tracked files, `git ls-files -z \| xargs -0 npx biome lint --no-errors-on-unmatched --files-ignore-unknown=true`: exit 0, 110 files checked, no diagnostics |
| `npm run format --prefix <component>` | harness root | 1 | PASS (environment note) | All four errors are in git-ignored `build/lib/.../index-*.js` bundles. The same tracked-files rerun with `biome format`: exit 0, 110 files, no diagnostics |
| `npx --prefix <component> tsc --noEmit -p <component>` | harness root | 0 | PASS (required) | No output |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/docs/.../CAP-002-E2-S4-tdd-evidence.yaml --repo-dir <component> --base 7688c924c554920816b60fd6af60fc81f1164174 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (E.8) | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 7688c924c554920816b60fd6af60fc81f1164174..HEAD --cycle review --out <scratch>/mutants.json` | harness root | 0 | PASS | 112 catalogue mutants; then 13 reviewer and 58 coder manual mutants appended (183, sha256 `6fddfb24…`) |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 900 --command '<the focused command above>' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 3 | FAIL (E.9) | 183 mutants: 118 killed, 65 survived; 57 equivalent, 8 non-equivalent (IR-001 to IR-004). Ran 03:52:14Z to 04:00:01Z. Results sha256 `373ffe81…`, copied beside this report as `CAP-002-E2-S4-implementation-review-v1-mutation.json`. Exit 3 means survivors exist |

Two probes ran outside the repository, each in a throwaway `postgres:16` container through the component's virtualenv, for IR-007. A 131,073-digit string matches the guard's regex, and its `::numeric` cast raises `NumericValueOutOfRange: value overflows numeric format`; 131,072 digits cast. A value of `1e20` cast to `numeric(30,10)` raises `numeric field overflow`.

The full suite and the `-m postgres` run both include the PostgreSQL tests. I ran both and did not substitute one for the other. Nothing was excluded.

### Validation Side Effects

- Before: HEAD `d9fdf13`; `git status --porcelain=v1 --untracked-files=all` empty; `code-revision` `sha256:299b1c48…c19b4432b`.
- After: HEAD `d9fdf13`. The only untracked files are this report and its `-mutation.json`, both under `docs/`, which the fingerprint excludes. `code-revision` is unchanged, `sha256:299b1c48…c19b4432b`. Only git-ignored products were regenerated: `.venv/`, `build/`, `dist/`, `src/factorflow.egg-info/`, `src/factorflow/api/static/`, `node_modules/` and `test-results/`.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — Per-stock isolation of corporate actions is pinned by no test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-7, DAC-E2-1, DAC-E2-S4-2, DAC-E2-S4-3
- **Tasks**: T005, T006 (tests); T010 (behaviour)
- **Files**: `momentum_inputs.sql:121` (`LEFT JOIN split_set sp ON sp.instrument_id = a.instrument_id`), `momentum_inputs.sql:124-125` (prior-session lookup, `d.instrument_id = a.instrument_id`). Tests: `test_a_2_for_1_split_inside_the_window_leaves_the_return_unchanged` (TC-COMP-064), `test_a_dividend_of_1_on_a_prior_close_of_100_multiplies_the_factor_by_1_01` (TC-COMP-065), and every other split and dividend test
- **Claim challenged**: the TC-COMP-064 and TC-COMP-065 tests prove that a stock's return is adjusted by its own splits and dividends.
- **Observed evidence**: two reviewer mutants survive all 104 focused tests:
  - `review-split-set-any-instrument` joins every stock's usable splits to every action. Once two stocks hold splits, each action is duplicated per stock and a dividend is scaled by another stock's splits.
  - `review-prior-any-instrument` takes a dividend's prior session from whichever stock has the latest bar before the ex-date.

  In every test, corporate actions sit on one stock only. TC-COMP-064's twin has none. The only other stock in the TC-COMP-065 fixture is the anchor, whose one bar falls on 2026-10-16, after every ex-date.
- **Expected evidence/behavior**: DEC-0055 (3) resolves boundaries "against the stock's own daily bars", and DEC-0055 (4) applies "every split in corporate_action with effective_on in the window". Design 2.4's SQL keys every action to `ca.instrument_id = b.instrument_id`. DEC-0118 (3) defines the prior session as "the stock's latest bar before the ex-date".
- **Impact**: the code is correct today. Either regression would pass every test while scrambling the dividend adjustment of every stock in a real build, where all stocks trade the same sessions and many carry dividends and splits.
- **Required remediation**: one test where at least two active stocks each hold corporate actions over the same sessions with different closes. For example, stock A has a dividend, and stock B has a split and a bar between A's prior session and A's ex-date. Assert each stock's three returns and its `splits` and `dividends` detail, so both mutants above are killed.

### IR-002 — `known_on` over several dividends' prior sessions is pinned by no test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-4, AC-7
- **Tasks**: T007 (test); T010 (behaviour)
- **Files**: `momentum_inputs.sql:163-164` (`max(a.prior_observed_on)`); `test_known_on_is_the_latest_observation_of_the_bars_and_actions_used` (TC-COMP-066)
- **Claim challenged**: the TC-COMP-066 test proves `known_on` is the maximum `observed_on` over every bar and action used.
- **Observed evidence**: `review-known-on-prior-min` (`min(a.prior_observed_on)`) survives. Each window in the test holds exactly one dividend, so the maximum and minimum of the prior sessions' `observed_on` coincide. No other test asserts `known_on` with two dividends in one window.
- **Expected evidence/behavior**: DEC-0118 (1): "known_on is the maximum observed_on over the E bar, the S_k bar, the prior-session bar of each dividend applied, and every split and dividend in (S_k, E] that is applied". DAC-E2-S4-4 and DEC-0055 (7) say the same.
- **Impact**: a 12-month window normally holds four quarterly dividends. If the prior bar of an earlier dividend is re-acquired later, a regression could date the input before it was knowable, and nothing would fail. That breaks the point-in-time guarantee AC-17 and AC-19 rely on.
- **Required remediation**: one TC-COMP-066 case with two dividends in a window, where the earlier dividend's prior-session bar has the latest `observed_on` of every row used. Assert `known_on` equals it, so the mutant is killed.

### IR-003 — A dividend's split factors over two or more later splits are pinned by no test

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-1
- **Tasks**: T006
- **Files**: `momentum_inputs.sql:111-118` (`close_factor`, `cash_factor`); `test_a_dividend_before_a_later_split_is_scaled_by_that_split`, `test_a_dividends_split_factors_stop_at_e`
- **Claim challenged**: a dividend's prior close and cash amount are scaled by the product of the splits after them.
- **Observed evidence**: `review-close-factor-max` and `review-cash-factor-max` replace the product (`exp(sum(log))`) with the largest single factor (`exp(max(log))`). Both survive. Every test that scales a dividend has exactly one later split. `test_two_splits_in_one_window_compound` has two splits but no dividend.
- **Expected evidence/behavior**: design 2.4 adjusts prices "by the product of split_from/split_to over splits after it and on or before E", and says "the split factor applied to a dividend is the same cumulative factor as for the price". DEC-0118 (2) also requires the product. T006 as written asks for "a later split", so the planned test is complete. That is why this finding is MEDIUM.
- **Impact**: the code is correct. A regression would mis-scale a dividend that precedes two splits in the window, and nothing would fail.
- **Required remediation**: one dividend followed by two splits in the window, at least one of them strictly between the prior session and the ex-date, so the two factors differ. Assert the value, `split_factor` and `prior_adjusted_close`, so both mutants are killed.

### IR-004 — The unusable-payload and non-positive-close tests leave three specified behaviours unpinned

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-1, AC-7
- **Tasks**: T009 (e); T010
- **Files**: `momentum_inputs.sql:151` (`bool_or(NOT a.usable)`), `:74` (`cash_amount` regex), `:159` (`non_positive_dividends` filter). Tests: `test_an_unusable_payload_makes_only_the_windows_containing_it_missing`, `test_a_non_positive_close_on_a_bar_used_makes_only_its_windows_missing`, `test_missing_ranks_before_outdated_whatever_the_cause`
- **Claim challenged**: the unusable-payload and DEC-0241 tests pin DEC-0117 (2), (3) and DEC-0241 (1), (2).
- **Observed evidence**: three reviewer mutants survive:
  - `review-unusable-bool-and` (`bool_and`) marks a window unusable only when every action in it is unusable. Every unusable-payload fixture has exactly one action in the window.
  - `review-cash-regex-allows-plus` accepts `"+1"`. No case uses a sign-prefixed string that PostgreSQL would cast.
  - `review-non-positive-ignores-unusable` stops counting an unusable dividend's non-positive prior close. No fixture combines the two, so the precedence is never exercised for that pair.
- **Expected evidence/behavior**: DEC-0117 (3): "a split or dividend in the window that is absent, not so numeric or out of range makes every momentum input … whose window contains it missing". DEC-0117 (2), with T010's guard `'^-?[0-9]+(\.[0-9]+)?$'` (DEC-0116 (4) calls it "the guard of DEC-0117 (2)"). DEC-0241 (1) covers the prior session of any dividend in the window, and (2) ranks a non-positive close before an unusable payload. T009 (e) as written lists four single-action cases, and the tests cover them, so this finding is MEDIUM.
- **Impact**: the first mutant matters most. A real 12-month window holds several dividends, and a regression would compute a return that silently ignores the one unusable payload, which is the "wrong rather than missing" outcome DEC-0117 rejects. The other two change only a `+`-prefixed string and the named cause.
- **Required remediation**: (a) an unusable action in a window that also holds a usable split or dividend; assert `missing` with only the unusable action named. (b) `{"cash_amount": "+1"}` as an unusable case. (c) An unusable dividend whose prior close is not positive; assert `detail.cause == "price_not_positive"`. Each kills one of the mutants above.

### IR-005 — `known_on` of a missing momentum input follows a rule no artifact records

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-4 (scope of "used")
- **Tasks**: T010
- **Files**: `momentum_inputs.sql:163-164`; `test_an_unusable_payload_makes_only_the_windows_containing_it_missing` (asserts `row["known_on"] == observed_on`, the unusable action's date)
- **Claim challenged**: `known_on` follows T010 and DEC-0118 (1).
- **Observed evidence**: for a `missing` row, the statement takes `max(a.observed_on)` and `max(a.prior_observed_on)` over every action in (S_k, E]. That includes the unusable action, and a dividend whose prior close is not positive, neither of which is applied. The test pins the unusable action's `observed_on` (2026-09-30) as `known_on`, citing DEC-0055 (7). The TDD evidence's spec-drift notes list the choice ("known_on on missing rows counts every split and dividend in the window and the rows read"). No decision records it, and neither the commit Notes nor the plan mention it.
- **Expected evidence/behavior**: T010: "`known_on` is the maximum `observed_on` over the E bar, the S_k bar, each applied dividend's prior-session bar and every applied split and dividend (DEC-0118), null when E is absent". DEC-0118 (1) says "that is applied". For value and growth, S3 writes `known_on` null on every `missing` row under DEC-0116 (5) ("null for missing"; `value_inputs.sql` `CASE WHEN s.status <> 'missing'`). DEC-0118 (4) carves out `as_of` for momentum ("as_of is E whenever E exists"), but not `known_on`.
- **Impact**: present and outdated rows are unaffected, because every action in their window is applied. On missing rows the evidence date follows a third rule, which differs from both the plan and S3. The repository cannot tell whether that was a decision or a slip. AGENTS.md forbids proceeding on an unrecorded assumption.
- **Required remediation**: settle the rule for `known_on` on a missing momentum input and record it. If the owner decides in this run, record that as a decision; otherwise record a provisional decision. Then align T010's wording, the SQL and the test assertion to the recorded rule. This is the first question for the owner below.

### IR-006 — A momentum input missing for an unusable corporate action names the prices acquisition

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-12 (by the evidence it supports)
- **Tasks**: T010
- **Files**: `momentum_inputs.sql:265` (`'prices'::text AS missing_data_type`), `insert_inputs.sql` enrichment
- **Claim challenged**: a missing input's `detail.last_acquisition` names the data type it lacks.
- **Observed evidence**: every momentum row sets `missing_data_type = 'prices'`, as T010 says. A row missing because of `corporate_action_payload_unusable` is therefore enriched with the last `prices` outcome. The independent code review raised this as non-blocking.
- **Expected evidence/behavior**: design 2.3 step 5 enriches a missing input "with the instrument's latest `acquisition_state` outcome for the data type concerned". For an unusable split or dividend, that data type is `corporate_actions`. DEC-0241 (1) fixes `prices` for its own cause only.
- **Impact**: the evidence screen would pair the cause "corporate action payload unusable" with the last price download's outcome. The cause and the action are still named correctly.
- **Required remediation**: none in this rework unless the owner decides it. The code follows the plan, so this is a question for the owner or for the design's next revision. If `corporate_actions` is chosen, T010, the SQL and one test change together.

### IR-007 — One implausible payload can still fail the whole set

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (DEC-0117 (3), "it never aborts the build")
- **Tasks**: T010
- **Files**: `momentum_inputs.sql:65-76` (casts in `parsed`), the final `value` expression, and `factor_input.value numeric(30,10)` (migration `0006`)
- **Claim challenged**: one stock's payload never aborts the set.
- **Observed evidence**: two probes in a `postgres:16` container. A 131,073-digit plain-decimal string passes the regex, and its cast raises `value overflows numeric format`. `parsed` casts the latest split and dividend of every active stock, in a window or not, so one such row fails the build. The guard also bounds only the sign, so an extreme usable ratio or cash amount can produce a return of 1e20 or more, which raises `numeric field overflow` when inserted into `factor_input`. The code review noted the first case.
- **Expected evidence/behavior**: no artifact fixes a magnitude bound. DEC-0117 (3) says an unusable payload "never aborts the build", and the same class of problem was left to the owner in CAP-002-E2-S3 review v1 IR-006.
- **Impact**: it needs data no provider sends, but it fails every stock's classification at once.
- **Required remediation**: none in this rework unless the owner decides it. Carry it to the design's next revision with S3's IR-006.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified: the latest-observation rule as lookups.** T010 asked for a `DISTINCT ON` `bar` CTE. The SQL uses `ORDER BY session_date DESC, observed_on DESC, recorded_at DESC LIMIT 1` lookups instead, which give the same rule and the same rows. Its first draft took over 10 minutes at 3000 instruments; the commit Notes and `t014-volume-probe.log` record this, and the coder's ordering mutants (killed in my run) pin the rule.
- **Justified: the design's undefined join.** Design 2.4 leaves `prior_adjusted_close` undefined. The SQL uses the stock's latest bar before the ex-date, per DEC-0118 (3) and the plan's Resolved Conflicts.
- **Justified: a missing boundary gives a `missing` row.** The design's inner joins would drop the row instead. This follows DEC-0055 (3) and T010 ("the roster, not the bars, drives the output").
- **Justified, provisional: DEC-0241.** Design 2.4 says momentum is never `not_computable` because "prices are positive by acquisition". Neither `DailyBar` (`close_price: Decimal`, no bound) nor `daily_bar` (`close_price numeric(18,6) NOT NULL`, no CHECK) enforces that. Judged on its record, DEC-0241 is sound:
  - It derives from design section 3 ("missing, never wrong") and the DEC-0117 (3) precedent.
  - It changes nothing for valid data, contradicts no approved artifact, and its rejected alternatives are reasonable.
  - Its standing: `open`, `kind: provisional`, `decided_by: agent`, `owner_reviewed: false`, `class: contained`, and untracked in the harness until the driver commits it. The commit carries its trailer in the final paragraph. No other branch or worktree holds a DEC-0241.

  It needs the owner's review through the driver's `$blind-review` step. It does not block this gate.
- **Unrecorded: `known_on` on missing rows.** See IR-005.
- **Bookkeeping:** the story's `status` moved from `planning` to `in-review`. The approved revision is unchanged and the gate passes. The tasks file changed only its checkboxes.
- **Decisions judged on their records:** DEC-0052, 0055, 0111, 0115, 0116, 0117, 0118 and 0121 are each `applied` and owner-upheld, and the code follows each one. Two notes: DEC-0116 (5)'s "null for missing" is followed for `value` but not for `known_on` (IR-005); DEC-0118 (4)'s `as_of` carve-out is followed.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework of `CAP-002-E2-S4-tasks.md` against this report)
- **Required action**: resolve IR-001 and IR-002, both test-only. Resolve IR-003 and IR-004, also test-only, in the same rework. Record the rule for IR-005, then align T010, the SQL and the test to it. IR-006 and IR-007 change nothing unless the owner decides them. Then rerun `$adversarial-review`, which will use this report as its baseline.
- **Warnings accepted downstream**: N/A
- **Questions for the owner**:
  1. IR-005: what is `known_on` on a missing momentum input? Null, as S3 writes for missing value and growth rows; the latest observation of every row read, including the unusable action, as implemented; or the applied rows only, as T010 words it?
  2. IR-006: should an input missing for an unusable corporate-action payload carry the `corporate_actions` acquisition outcome instead of `prices`?
  3. DEC-0241 is open and unreviewed; it reaches you through the driver's blind review.
