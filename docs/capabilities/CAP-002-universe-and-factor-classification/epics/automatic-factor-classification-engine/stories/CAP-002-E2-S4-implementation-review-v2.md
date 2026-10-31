---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S4-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E2-S4"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-30T22:19:30Z"
reviewed_head: "9b6f750db1c71d3ab562d4ddaeef73ce8e59efc1"
review_base: "7688c924c554920816b60fd6af60fc81f1164174"
reviewed_state_revision: "sha256:55efcd69c02883b462820902ba399c9bbd2fed80763526600ad24fff115d7a3f"
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
  tool_version: "unknown"
  timestamp: 2026-10-30T22:19:30Z
  source_artifacts:
    - id: CAP-002-E2-S4
      version: "1 (sha256:082f0afbd0c93634f17f5f0273a7534cfc988e3e6c871737bdb3b984cd1fafc8)"
    - id: CAP-002-E2-S4-tasks
      version: "1 (updated 2026-10-30, last_reworked_review v1)"
    - id: CAP-002-E2-S4-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-002-E2-S4-implementation-review
      version: "1 (baseline, reviewed_head d9fdf13084465c627bf122dc9b088e29c563a548)"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-factor-engine-component-tests
      version: "1"
    - id: DEC-0241
      version: "open, provisional, agent, owner_reviewed false"
    - id: DEC-0242
      version: "open, contradiction, owner, owner_reviewed false"
    - id: DEC-0243
      version: "open, contradiction, owner, owner_reviewed false"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S4 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 18/18 verified |
| Required validation | 15/15 passed |

The rework resolves all six v1 findings it was asked to resolve. Each of v1's eight non-equivalent survivors is now killed by the test written for it, and I confirmed each kill in my own run. The two production changes, both on the final `SELECT` of `momentum_inputs.sql`, follow the owner decisions exactly:

- DEC-0242: `known_on` is null on every `missing` input, and present and outdated inputs keep DEC-0118 (1).
- DEC-0243: `corporate_actions` names the acquisition of an input missing for an unusable payload, and every other cause keeps `prices`.

I ran 15 mutants on the two changed expressions, eight of mine and the coder's seven, and 14 are killed. All 15 required validation commands pass, among them the full Python suite (1686 passed, 1 xfailed) and the Playwright suite (18 passed). `npm run lint` and `npm run format` fail only on the git-ignored `build/` bundle. The TDD-evidence lint is clean, and cycle-2's reviewed patch is byte-identical to the committed rework diff.

The gate fails on one delta survivor (E.9). Line 241 is now a per-status `CASE`, and DEC-0242 restates its outdated arm: "Present and outdated momentum inputs keep DEC-0118 (1)". No test pins that arm to anything but a date equal to E. `manual:review2-known-on-outdated-e` writes an outdated input's `known_on` as its E session date. It survives every focused test. A probe in a scratch clone shows the shipped code is right and the mutant is wrong: a stale stock whose S_3 bar was re-acquired on 2026-10-05 gets `known_on` 2026-10-05 from the shipped code and 2026-09-17 from the mutant. The remediation is test-only, one case (IR-001).

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 2 · **total 3**

| ID | Severity | Scope | Summary |
|----|----------|-------|---------|
| IR-001 | HIGH | delta | An outdated input's `known_on` is pinned only where it equals E: `manual:review2-known-on-outdated-e` survives the TC-COMP-066 and TC-COMP-102 tests |
| IR-002 | LOW | delta | Plan T009 (c) still says a missing momentum input carries the `prices` outcome; DEC-0243 superseded that for the unusable-payload cause, and only T010 carries the note |
| IR-003 | LOW | carried | v1 IR-007, unchanged: one implausible payload or return still overflows `numeric` and fails the whole set |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S4` |
| HEAD | `9b6f750db1c71d3ab562d4ddaeef73ce8e59efc1` (`story-coding(CAP-002-E2-S4): rework review v1, …`) |
| Review base | `pipeline-state.py review-base` with no `--base-ref`: `7688c924c554920816b60fd6af60fc81f1164174` (merge of PR #145). `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before review: `git status --porcelain=v1 --untracked-files=all` empty |
| Changed files reviewed | 283 since the review base: 9 code, test, plan and review files, and 274 evidence files. Since the baseline, 97: `momentum_inputs.sql`, the test module, the plan, the TDD evidence, v1's report and mutation JSON, and 91 evidence files |
| Baseline | Review v1 (`CHANGES-REQUIRED`), `reviewed_head` `d9fdf13084465c627bf122dc9b088e29c563a548`, with `CAP-002-E2-S4-implementation-review-v1-mutation.json`. `git diff d9fdf13..HEAD -- src tests` touches only `momentum_inputs.sql` (+9 −2) and `test_engine_inputs_momentum.py` (+241 −7). `d9fdf13..234563d` adds only v1's two report files |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/sql/momentum_inputs.sql` | added (base); modified since baseline at lines 239-241 and 267-272 | T010; AC-7, AC-13, DAC-E2-1, DAC-E2-6, DAC-E2-S4-1 to 5. The rework lines carry out DEC-0242 and DEC-0243 |
| `src/factorflow/classification/engine.py` | modified since base (+27, additions only); unchanged since baseline | T011 |
| `tests/integration/engine_momentum_support.py` | added; unchanged since baseline | T002 |
| `tests/integration/test_engine_inputs_momentum.py` | added; modified since baseline (+241 −7) | T003 to T009, T018. The rework adds 5 tests, 1 parameter case and 1 helper, and changes 3 existing tests: IR-001 to IR-006 of v1 |
| `.../stories/CAP-002-E2-S4-tasks.md` | modified | Checkboxes. Since baseline: `updated`, `last_reworked_review` and the T010 note recording DEC-0242 and DEC-0243 |
| `.../stories/CAP-002-E2-S4.md` | modified | Frontmatter `status: planning` to `in-review` only. `artifact-gate.py revision` gives the approved `sha256:082f0afb…`, and `artifact-gate.py check` passes |
| `.../stories/CAP-002-E2-S4-tdd-evidence.yaml` | added; cycle-2 appended since baseline | T017 |
| `.../stories/CAP-002-E2-S4-implementation-review-v1.md` and `-v1-mutation.json` | added (commit `234563d`) | Review v1, this review's baseline |
| `.../stories/CAP-002-E2-S4-evidence/` (274 files) | added | T017 and T014. Since the baseline, 91 files: `cycle-2.patch`, `red-cycle-2.py`, `red-cycle-2.log`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json` and 86 mutant and baseline logs |

No change is unjustified. `git diff --stat 7688c92..HEAD` touches nothing in `tests/conftest.py`, `engine_support.py`, `engine_inputs_support.py`, `test_engine_currency.py`, `pyproject.toml`, `insert_inputs.sql` or any delivered test (T015).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `momentum_inputs.sql` `held`, `win`, `judged`, final `SELECT` (`(e_close / s_adjusted_close) * dividend_factor - 1`, line 236); `factor = 'momentum'`, `input_name = concat('return_', k, 'm')`; windows and lag from `constants` (`engine.py:214-236`) | The T004 to T007 tests; `test_each_stock_is_adjusted_by_its_own_corporate_actions_and_prior_sessions` (new) | Per-stock isolation is now pinned: v1 IR-001 resolved |
| AC-13 | SATISFIED | `statused`: `latest_session < %(latest_trading_day)s` gives `outdated` (line 218); `latest_session` is the stock's unbounded `max(session_date)` (lines 24-26) | TC-COMP-102 test and the three currency tests | `review2-latest-session-global` and v1's `outdated-le` are killed |
| DAC-E2-1 | SATISFIED | Split factor over usable splits in (S_k, E] (lines 149, 196-197); dividend factor against the prior session's adjusted close (lines 111-118, 137-139, 150) | TC-COMP-064 and 065 tests; the split and dividend tests; `test_a_dividends_split_factors_are_the_product_of_every_later_split` (new) | v1 IR-003 resolved. The DEC-0117 and DEC-0241 guards are recorded decisions and change nothing for valid data |
| DAC-E2-6 | SATISFIED | As AC-13 | As AC-13 | — |
| DAC-E2-S4-1 | SATISFIED | `win` LEFT JOIN LATERAL S lookup; `boundary = concat('S_', k)` | `test_a_missing_12_month_price_makes_only_return_12m_missing`, which now also asserts `known_on` null on the missing row (DEC-0242) | — |
| DAC-E2-S4-2 | SATISFIED | `s_adjusted_close = s_close × exp(sum(log_factor))` | TC-COMP-064 test: equal to the unsplit twin in both payload forms | — |
| DAC-E2-S4-3 | SATISFIED | `priced.log_term` | TC-COMP-065 test; the new two-stock test, where another stock's later bar lies before the ex-date | — |
| DAC-E2-S4-4 | SATISFIED | `judged.known_on` (lines 163-164), written only when `status <> 'missing'` (line 241, DEC-0242) | TC-COMP-066 test (five parameters, all `present`); `test_known_on_covers_the_prior_session_of_every_dividend_in_the_window` (new, two parameters) | The code is right for outdated inputs too, as the reviewer probe shows. The tests pin outdated `known_on` only where it equals E (IR-001) |
| DAC-E2-S4-5 | SATISFIED | As AC-13; `value` only for `present` (line 235); `as_of = e_session` | TC-COMP-102 test: three `outdated`, value null, `as_of` and `known_on` E, exact detail | — |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S2's and S3's symbols exist at the base | Unchanged since v1 |
| T002 | complete | VERIFIED | `engine_momentum_support.py` | Unchanged since v1 |
| T003 | complete | VERIFIED | `env` fixture, anchor bar on 2026-10-16 | — |
| T004 | complete | VERIFIED | TC-COMP-063 plus the boundary and month-end tests | TC-COMP-063 now asserts `known_on` null (DEC-0242) |
| T005 | complete | VERIFIED | TC-COMP-064 plus the split tests | The new two-stock test closes v1 IR-001 |
| T006 | complete | VERIFIED | TC-COMP-065 plus the dividend tests | The new two-stock and three-split tests close v1 IR-001 and IR-003 |
| T007 | complete | VERIFIED | TC-COMP-066 plus the new two-dividend `known_on` test | The planned case is complete. The outdated gap is in IR-001 |
| T008 | complete | VERIFIED | TC-COMP-102 plus three currency tests | — |
| T009 | complete | VERIFIED | (a) to (g) present. (e) now holds a usable dividend in every window, a `"+1"` case, and the unusable dividend over a zero prior close | (c)'s wording lags DEC-0243 (IR-002) |
| T010 | complete | VERIFIED | `momentum_inputs.sql`; lines 241 and 270-272 carry out DEC-0242 and DEC-0243, which the T010 note records | Justified deviation, unchanged since v1: index lookups replace the `DISTINCT ON` `bar` CTE |
| T011 | complete | VERIFIED | `engine.py:214-236`; no `ingestion` import | Unchanged since v1 |
| T012 | complete | VERIFIED | No S3 file edited; focused suite green (111 passed) | — |
| T013 | complete | VERIFIED | My validation below; the wheel ships `momentum_inputs.sql` (16,324 B, equal to the source); the SQL safety, SQL-ships and stage-order tests pass unedited | — |
| T014 | complete | VERIFIED | `t014-volume-probe.log` and the cycle-1 commit Notes | Unchanged since v1. The rework adds two `CASE` expressions over computed columns and no read. Not rerun |
| T015 | complete | VERIFIED | The five `# Implements` tags (063, 064, 065, 066, 102) are present (lines 133, 304, 463, 819, 896); each new test cites its AC, DEC and v1 finding | — |
| T016 | complete | VERIFIED | The rework adds no `format(`, `\|\|`, brace, `float` or `%` outside `%(name)s` placeholders; `test_engine_sql_safety.py` passes | — |
| T017 | complete | VERIFIED | `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings. Cycle-2 `diff_sha256` `bc903fea…` equals both `git diff 234563d..HEAD -- src tests` and `cycle-2.patch` | Cycle-2 records a fresh code review (APPROVED) and spec-drift review (no drift). Its RED is meaningful: the 8 v1 survivors pass the cycle-1 tests and each fails its new test, which my run reproduces |
| T018 | complete | VERIFIED | `assert_momentum_invariants` still runs; the catalogue `restated_possible` mutant is killed | — |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_a_missing_12_month_price_makes_only_return_12m_missing` / TC-COMP-063 | ADEQUATE | Status, null value, `as_of` E, now null `known_on`, exact boundary detail; the other two present | none |
| `test_a_2_for_1_split_inside_the_window_leaves_the_return_unchanged` / TC-COMP-064 | ADEQUATE | Exact equality with the unsplit twin. Per-stock isolation is pinned beside it by `test_each_stock_is_adjusted_by_its_own_corporate_actions_and_prior_sessions`, which kills `review-split-set-any-instrument`, `review-prior-any-instrument` and my `window-actions-any-instrument` and `held-join-any-instrument` | none |
| `test_a_dividend_of_1_on_a_prior_close_of_100_multiplies_the_factor_by_1_01` / TC-COMP-065 | ADEQUATE | `ret(99, 90, 1.01)` in both payload forms and the full dividend detail. The new two-stock test pins the prior-session lookup's instrument key | none |
| `test_known_on_is_the_latest_observation_of_the_bars_and_actions_used` / TC-COMP-066 | WEAK | Each of the E bar, S bar, split, dividend and prior bar drives `known_on` of a `present` input in turn. The new two-dividend test kills `review-known-on-prior-min` in both parameters | Every case is `present`. An outdated input's `known_on` is asserted only in TC-COMP-102, where it equals the E session date, so `review2-known-on-outdated-e` survives (IR-001) |
| `test_a_stale_latest_bar_makes_all_three_momentum_inputs_outdated` / TC-COMP-102 | ADEQUATE | Three `outdated`, value null, `as_of` and `known_on` E, exact detail; the fresh stock present | Its `known_on` assertion cannot tell E's observation from the maximum (IR-001); the mapped condition, all three `outdated`, is fully pinned |
| `test_each_stock_is_adjusted_by_its_own_corporate_actions_and_prior_sessions` (new) | ADEQUATE | Two stocks over the same sessions, each with its own split or dividend, and a bar of each between the other's prior session and ex-date. Asserts both stocks' values, `splits` and `dividends` | none |
| `test_a_dividends_split_factors_are_the_product_of_every_later_split` (new) | ADEQUATE | Three splits after the prior session, one on the ex-date; asserts the value, `split_factor` 1/6 and `prior_adjusted_close` 100. Kills both `*-factor-max` mutants | none. The split on the ex-date separates the two factors as well as v1's suggested placement would |
| `test_known_on_covers_the_prior_session_of_every_dividend_in_the_window` (new, 2 parameters) | ADEQUATE | Each dividend's prior bar is observed last in turn; asserts `known_on` 2026-10-05 and the compounded value | none |
| `test_an_unusable_payload_makes_only_the_windows_containing_it_missing` (14 cases, 1 new) | ADEQUATE | A usable dividend in every window beside the unusable action; exact detail naming only the unusable action; `known_on` null; the 3-month window present at `ret(120, 100, 1.01)`. Kills `review-unusable-bool-and` and, with `cash-plus-sign`, `review-cash-regex-allows-plus` | none |
| `test_an_unusable_dividend_over_a_non_positive_prior_close_is_missing_for_the_close` (new) | ADEQUATE | `price_not_positive` outranks the unusable payload; `prices` acquisition, not `corporate_actions`; exact detail; `known_on` null | none |
| `test_an_unusable_payload_names_the_corporate_actions_acquisition` (new) | ADEQUATE | `corporate_actions` outcome, distinct from the `prices` one, on the two windows holding the action; none on the present window | none |
| `test_a_non_positive_close_on_a_bar_used_makes_only_its_windows_missing` (6 cases) | ADEQUATE | Now also asserts `known_on` null | none |
| Every other v1 test | ADEQUATE | Unchanged since v1; all carried catalogue and manual mutants on code lines are killed | none |

**Isolation and determinism.** Every test builds its own migrated database, fixes every date, and gives each re-acquired row a distinct `observed_on`. The new `record_acquisitions` helper fixes `last_acquired_at` and gives each data type a distinct outcome, so a wrong data type cannot pass by coincidence. I found no order, clock or network dependence.

**Mutation (E.9).** Commands are in the validation table.

1. `generate` over `7688c92..HEAD` gave 117 catalogue mutants, all in `momentum_inputs.sql` (108 `off-by-one`, 9 `negate-boolean`). The catalogue has no operator for `<>` or a SQL `CASE`, so it mutates only the rework's comment lines.
2. I added 11 manual mutants of my own (`manual:review2-*`). Eight sit on the two rework expressions and three on unchanged lines. I also reran the coder's 7 `rework-*` mutants as my own evidence.
3. `scope --since d9fdf13 --previous <v1 -mutation.json>` added 72 of v1's mutants: its 13 reviewer and 57 of the coder's 58 cycle-1 manual mutants, and 2 catalogue mutants whose IDs `generate` no longer produces. One no longer applies: `manual:missing-data-type-fundamentals`, whose line the rework replaced. The resulting 207 mutants were tagged 182 `carried`, 18 `delta` and 7 `late`.
4. All 207 ran in four parallel clones against the focused suite (111 tests; all four baselines passed). Result: 143 killed and 64 survived.

| Survivor(s) | Scope | Disposition | Contract reasoning |
|-------------|-------|-------------|--------------------|
| 62 mutants on `--` comment lines (lines 2, 3, 5, 8, 17, 36, 51, 63, 81, 105, 108, 132, 133, 144, 152, 161, 169, 202, 209, 211, 234, 239, 240, 242, 268) | 56 carried, 3 delta, 3 late | equivalent | PostgreSQL discards SQL comments. No artifact specifies comment text, and no mutation adds a `%`, brace or `\|\|` that the SQL safety test scans for |
| `momentum_inputs.sql:205:negate-boolean:1` (`coalesce(…, true) AS price_not_positive`) | carried | equivalent | The default is reached only when E or S_k is absent. I rechecked this against the rework's new use of `price_not_positive` at line 270. A window lacking a boundary joins no action (`a.effective_on > w.s_session` is null), so `unusable` is false and the data type is `prices` either way. Status and the boundary detail come first, as in v1 |
| `manual:review2-known-on-outdated-e` (line 241: `CASE s.status WHEN 'present' THEN s.known_on WHEN 'outdated' THEN s.e_session END`) | delta | **non-equivalent** | DEC-0242: "Present and outdated momentum inputs keep DEC-0118 (1)", the latest `observed_on` over the bars and actions applied. DAC-E2-S4-4 and TC-COMP-066 cover every input written. IR-001 |

Killed, among them every mutant that bears on a v1 finding (each by the test written for it):

- IR-001: `review-split-set-any-instrument`, `review-prior-any-instrument`
- IR-002: `review-known-on-prior-min`
- IR-003: `review-close-factor-max`, `review-cash-factor-max`
- IR-004: `review-unusable-bool-and`, `review-cash-regex-allows-plus`, `review-non-positive-ignores-unusable`
- IR-005 and IR-006: all 7 `rework-*` mutants, and my `review2-known-on-not-boundary`, `-missing-e-bar`, `-missing-applied-bars`, `review2-data-type-or`, `-missing-not-boundary`, `-any-missing-cause` and `-swapped`
- my late `review2-latest-session-global`, `-window-actions-any-instrument` and `-held-join-any-instrument`

All 57 of the coder's cycle-1 manual mutants that still apply are killed.

## Independent Validation

`<component>` = `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/feactorflow-v2-cap-002-e2-pipeline-285094/repos/factorflow-v2/FactorFlow-v2`; `<scratch>` = this session's scratchpad `s4-ir-v2` folder, outside the repository. Every command that needs Docker, the uv cache or npm ran outside the sandbox as one plain call, with `--directory` or `--prefix` naming the component.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider tests/integration/test_engine_inputs_momentum.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_stage_order.py tests/unit/test_classification_sql_ships.py` | each mutation clone | 0 | PASS (focused) | The four mutation baselines: 111 passed each |
| `uv sync --all-extras --directory <component>` | harness root | 0 | PASS (required) | Resolved 46 packages, checked 43 |
| `uv build --directory <component>` | harness root | 0 | PASS (required) | sdist and wheel built; the wheel lists `factorflow/classification/sql/momentum_inputs.sql` (16,324 B, the source's size) |
| `uv run --directory <component> pytest -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1686 passed, 1 xfailed, 249.67 s. The xfail is S2's strict TC-COMP-059 line-item check; 7 more tests than v1's 1679, the rework's additions |
| `uv run --directory <component> pytest -m postgres -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 604 passed, 1083 deselected, 227.67 s |
| `uv run --directory <component> pytest -m "not postgres" -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1082 passed, 604 deselected, 1 xfailed, 26.88 s |
| `uv run --directory <component> ruff check .` | harness root | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> ruff format --check .` | harness root | 0 | PASS (required) | 240 files already formatted |
| `uv run --directory <component> mypy src` | harness root | 0 | PASS (required) | No issues in 56 source files |
| `npm ci --prefix <component>` | harness root | 0 | PASS (required) | 250 packages added |
| `npm run build --prefix <component>` | harness root | 0 | PASS (required) | Vite build, 63 modules |
| `npm run test --prefix <component>` | harness root | 0 | PASS (required) | 47 files, 876 tests |
| `npm run test:e2e --prefix <component>` | harness root | 0 | PASS (required) | 18 passed (2.9 min); the `posttest:e2e` hook removed its container (`docker ps -a --filter name=factorflow-e2e-postgres` is empty) |
| `npm run lint --prefix <component>` | harness root | 1 | PASS (environment note) | "Found 80 errors", every one in the git-ignored `build/lib/factorflow/api/static/assets/index-BFn-kDOZ.js` (`.gitignore:12: build/`), which `uv build` copies there and `biome.json` does not ignore. `npx biome lint --max-diagnostics=1000 .` from `<component>` lists no other file. The tracked-files rerun, `git ls-files -z \| xargs -0 npx biome lint --no-errors-on-unmatched --files-ignore-unknown=true`: exit 0, 110 files, no diagnostics |
| `npm run format --prefix <component>` | harness root | 1 | PASS (environment note) | "Found 4 errors", one in each of four git-ignored `build/lib/.../assets/index-*.js` bundles. The same tracked-files rerun with `biome format`: exit 0, 110 files, no diagnostics |
| `npx --prefix <component> tsc --noEmit -p <component>` | harness root | 0 | PASS (required) | No output |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/docs/.../CAP-002-E2-S4-tdd-evidence.yaml --repo-dir <component> --base 7688c924c554920816b60fd6af60fc81f1164174 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (E.8) | 0 errors, 0 warnings |
| `python3 scripts/artifact-gate.py check --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | Gate passed (owner-allowed); `revision` gives `sha256:082f0afb…` |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 7688c924c554920816b60fd6af60fc81f1164174..HEAD --cycle review --out <scratch>/generated.json` | harness root | 0 | PASS | 117 catalogue mutants; then 11 reviewer and 7 coder `rework-*` manual mutants appended |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/with-manual.json --since d9fdf13084465c627bf122dc9b088e29c563a548 --previous <component>/docs/.../CAP-002-E2-S4-implementation-review-v1-mutation.json --out <scratch>/mutants.json` | harness root | 0 | PASS | 207 mutants: 182 carried, 18 delta, 7 late; one previous mutant no longer applies. sha256 `06c2dccf…` |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 900 --command '<the focused command above>' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 3 | FAIL (E.9) | 207 mutants: 143 killed, 64 survived; 63 equivalent, 1 non-equivalent (IR-001). Ran 22:24:06Z to 22:33:34Z. Results sha256 `b6d9bdca…`, copied beside this report as `CAP-002-E2-S4-implementation-review-v2-mutation.json`. Exit 3 means survivors exist |
| `uv run --directory <scratch>/probe --all-extras --offline python -B -m pytest -m postgres -q -p no:cacheprovider tests/integration/test_probe_outdated_known_on.py` | harness root | 0, then 1 | PASS on HEAD, FAIL on the mutant (IR-001 evidence) | `<scratch>/probe` is a `git clone --local` of HEAD with one reviewer probe test added. On HEAD's SQL it passes (1 passed). With `review2-known-on-outdated-e` applied in the clone it fails: `assert datetime.date(2026, 9, 17) == datetime.date(2026, 10, 5)` |

The full suite and the `-m postgres` run both include the PostgreSQL tests. I ran both and did not substitute one for the other. I did not rerun the T014 volume probe, a signal rather than a gate, because the rework adds no read. Nothing else was excluded.

### Validation Side Effects

- Before: HEAD `9b6f750`; `git status --porcelain=v1 --untracked-files=all` empty; `code-revision` `sha256:55efcd69…ac06dc8`
- After: HEAD `9b6f750`; branch unchanged. The only untracked files are this report and its `-mutation.json`, both under `docs/`, which the fingerprint excludes. `code-revision` is unchanged, `sha256:55efcd69…ac06dc8`. Only git-ignored products were regenerated: `.venv/`, `build/`, `dist/`, `src/factorflow.egg-info/`, `src/factorflow/api/static/`, `node_modules/` and `test-results/`. The mutation clones and the probe clone live in `<scratch>`, outside the repository
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — An outdated input's `known_on` is pinned only where it equals E

- **Severity**: HIGH
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-4, AC-7 (and AC-13 by the input it dates)
- **Tasks**: T007 (test); T010 (behaviour, line 241)
- **Files**: `momentum_inputs.sql:241` (`CASE WHEN s.status <> 'missing' THEN s.known_on END AS known_on`). Tests: `test_known_on_is_the_latest_observation_of_the_bars_and_actions_used` (TC-COMP-066), `test_a_stale_latest_bar_makes_all_three_momentum_inputs_outdated` (TC-COMP-102), `test_momentum_currency_does_not_depend_on_fundamentals`
- **Claim challenged**: the rework's tests pin DEC-0242 on line 241: null for missing, and DEC-0118 (1) for present and outdated.
- **Observed evidence**:
  - The rework turned line 241 from `s.known_on` into a status-conditional `CASE`, and `mutation-run.py scope` tags mutants on it `delta`.
  - The missing arm is pinned by five tests, and the present arm by TC-COMP-066.
  - The outdated arm is asserted only in TC-COMP-102, where the stale stock's E bar is also the latest observation of every row used, so the maximum equals the E session date.
  - `manual:review2-known-on-outdated-e` survives all 111 focused tests. It replaces line 241 with `CASE s.status WHEN 'present' THEN s.known_on WHEN 'outdated' THEN s.e_session END`.
  - The reviewer probe in a scratch clone uses a stale stock whose S_3 bar was re-acquired on 2026-10-05. The shipped code gives `return_3m` `known_on` 2026-10-05, which is correct. The mutant gives 2026-09-17.
- **Expected evidence/behavior**: DEC-0242: "Present and outdated momentum inputs keep DEC-0118 (1): known_on is the latest observed_on over the E bar, the S_k bar, the prior-session bar of each dividend applied and every split and dividend applied in (S_k, E]". DAC-E2-S4-4 and TC-COMP-066 ("The input is written") apply to every input written, not only present ones.
- **Impact**: the code is correct today. A regression in the outdated arm would date a stale stock's momentum input before a re-acquired bar or a late-observed action it uses was knowable, and nothing would fail. That breaks the point-in-time record AC-17 and AC-19 rely on. Outdated inputs are common: every stock whose latest bar trails the latest trading day.
- **Scope note**: this gap also existed at v1, where line 239 was an unconditional `s.known_on`. Step H takes scope from git, and the line changed. The rework made it a per-status expression and DEC-0242 restated each status's rule, so the outdated arm is new code that the rework's tests do not pin. It is therefore `delta`, and as a non-equivalent survivor it makes the mandatory TC-COMP-066 test `WEAK`.
- **Required remediation**: one case in which an outdated input uses a row observed after its E bar, for example a re-acquired S_k bar or a split or dividend observed late. Assert that its `known_on` equals that row's `observed_on`, so that `review2-known-on-outdated-e` is killed. Test-only; no production line needs to change.

### IR-002 — Plan T009 (c) still names the `prices` outcome for every missing momentum input

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A (plan evidence)
- **Tasks**: T009 (c), T010
- **Files**: `CAP-002-E2-S4-tasks.md` T009 (c): "the `acquisition_state` `prices` outcome in `detail.last_acquisition` only when `missing`"
- **Claim challenged**: the plan records every supersession the owner decisions made.
- **Observed evidence**: the rework added a note under T010 recording DEC-0242 and DEC-0243, but T009 (c) is unchanged. Under DEC-0243, a row missing for `corporate_action_payload_unusable` carries the `corporate_actions` outcome, which `test_an_unusable_payload_names_the_corporate_actions_acquisition` asserts. The commit's follow-up list names T009 (c) "for the design's next revision", but T009 is plan text that this story owns. DEC-0241 (1)'s phrase "as for every momentum input" is stale for the same reason. That is the decision's own record, not this story's artifact.
- **Expected evidence/behavior**: DEC-0243 ("This supersedes plan T010's prices for that one cause") and the T010 note itself.
- **Impact**: a reader of T009 alone, or a later re-review, would expect `prices` on every missing row. The code and tests are right.
- **Required remediation**: add to T009 (c) the same pointer to DEC-0243 that T010 carries.

### IR-003 — One implausible payload or return can still fail the whole set (v1 IR-007)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A (DEC-0117 (3): "it never aborts the build")
- **Tasks**: T010
- **Files**: `momentum_inputs.sql:64-76` (casts in `parsed`), the `value` expression (line 236), `factor_input.value numeric(30,10)`
- **Claim challenged**: one stock's data never aborts the set.
- **Observed evidence**: those lines are unchanged since v1. The rework commit carries the finding forward "for the design's next revision, with S3's IR-006". No owner decision addresses it.
- **Expected evidence/behavior**: no artifact fixes a magnitude bound. v1 recorded the two probes: a 131,073-digit plain-decimal string fails its `::numeric` cast, and a return of 1e20 or more overflows `numeric(30,10)`.
- **Impact**: as v1 found: it needs data no provider sends, but it fails every stock's classification at once.
- **Required remediation**: none in this rework unless the owner decides it. Carry it to the design's next revision.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | `test_each_stock_is_adjusted_by_its_own_corporate_actions_and_prior_sessions` kills `review-split-set-any-instrument` and `review-prior-any-instrument` in my run. Stock B's split and bar lie between A's prior session and ex-date, and the reverse holds too |
| v1/IR-002 (HIGH) | RESOLVED | `test_known_on_covers_the_prior_session_of_every_dividend_in_the_window` kills `review-known-on-prior-min` in both parameters, so `min` fails whichever prior bar is observed last |
| v1/IR-003 (MEDIUM) | RESOLVED | `test_a_dividends_split_factors_are_the_product_of_every_later_split` kills `review-close-factor-max` and `review-cash-factor-max`. `split_factor` 1/6 and `prior_adjusted_close` 100 are asserted |
| v1/IR-004 (MEDIUM) | RESOLVED | (a) A usable dividend sits beside every unusable case, which kills `review-unusable-bool-and`. (b) The `cash-plus-sign` case kills `review-cash-regex-allows-plus`. (c) `test_an_unusable_dividend_over_a_non_positive_prior_close_is_missing_for_the_close` kills `review-non-positive-ignores-unusable` |
| v1/IR-005 (MEDIUM) | RESOLVED | The owner decided DEC-0242, and the T010 note records it. Line 241 writes `known_on` only when the input is not `missing`. Missing rows assert null in TC-COMP-063, the unusable-payload, non-positive-close and new precedence tests, and in the E-boundary test. The missing-arm mutants (`rework-known-on-unguarded` and `-never`, `review2-known-on-not-boundary`, `-missing-e-bar` and `-missing-applied-bars`) are killed. The outdated arm's gap is new as IR-001 |
| v1/IR-006 (LOW) | RESOLVED | The owner decided DEC-0243, and the T010 note records it. Lines 270-272 give `corporate_actions` when `unusable AND NOT price_not_positive`. The two new acquisition tests pin both sides. All 4 `rework-data-type-*` and 4 `review2-data-type-*` mutants are killed |
| v1/IR-007 (LOW) | STILL OPEN | Unchanged code and no owner decision; carried as IR-003 |

## Scope and Plan Deviations

- **Owner decisions applied.** DEC-0242 and DEC-0243 are `decided_by: owner`, recorded in this run on v1's IR-005 and IR-006. Their `status: open` and `owner_reviewed: false` belong to the owner's later blind review and are not a defect of this story. The code follows each exactly:
  - A boundary-missing window joins no action, so it can never take `corporate_actions`, and the SQL comment at line 269 says so truly.
  - A row both unusable and over a non-positive close names `prices`, the cause it reports.
- **DEC-0241, judged on its record and standing.** It is `kind: provisional`, `decided_by: agent`, `status: open` and `owner_reviewed: false`, unchanged since v1, and v1's reasoning still holds:
  - It derives from design section 3 and the precedent of DEC-0117 (3).
  - It changes nothing for valid data and contradicts no approved artifact.
  - DEC-0243 narrows its phrase "as for every momentum input" without changing what it decides for its own cause, which still names `prices`.

  It reaches the owner through the driver's blind review. It does not block this gate.
- **Decision records.** DEC-0241, DEC-0242 and DEC-0243 are untracked in the harness until the driver commits them. I found no other file with those IDs in any harness worktree or branch. The rework commit carries all three `Decision-Id` trailers in its final paragraph, and `git log --format=%(trailers)` parses them.
- **Design wording follows later.** Design 2.4 and DEC-0055 (7) still word `known_on` with no exception for missing rows. The commit records this for the design's next revision. That is consistent with DEC-0116 (5), which S3 already follows.
- **Justified, unchanged since v1:** index lookups in place of the `DISTINCT ON` CTE; the prior session per DEC-0118 (3); a missing boundary writes a `missing` row.
- **Bookkeeping:** the story's `status` moved from `planning` to `in-review`, and its approved revision is unchanged. Besides its checkboxes, the plan changed `updated`, `last_reworked_review` and the T010 note.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework of `CAP-002-E2-S4-tasks.md` against this report)
- **Required action**: resolve IR-001 with one test case, an outdated input whose `known_on` comes from a row observed after its E bar, and confirm that `manual:review2-known-on-outdated-e` is killed. In the same rework, add the DEC-0243 pointer to T009 (c) (IR-002). IR-003 changes nothing unless the owner decides it. Then rerun `$adversarial-review`, which will use this report as its baseline.
- **Warnings accepted downstream**: N/A
- **Questions for the owner**: none blocking. DEC-0241, DEC-0242 and DEC-0243 reach you through the driver's blind review. IR-003 (v1 IR-007) waits for the design's next revision unless you decide it now.
