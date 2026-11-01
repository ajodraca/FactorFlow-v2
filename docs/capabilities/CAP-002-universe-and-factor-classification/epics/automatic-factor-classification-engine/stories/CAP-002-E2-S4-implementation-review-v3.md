---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S4-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E2-S4"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-10-31T02:50:51Z"
reviewed_head: "8d877ef133eefab77a497987f6bf031bb0bd530a"
review_base: "7688c924c554920816b60fd6af60fc81f1164174"
reviewed_state_revision: "sha256:35269795878c61a291fbcb59e29c1d1128f5a0eb508bbfd31f11962f04522e06"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-10-31T02:50:51Z
  source_artifacts:
    - id: CAP-002-E2-S4
      version: "1 (sha256:082f0afbd0c93634f17f5f0273a7534cfc988e3e6c871737bdb3b984cd1fafc8)"
    - id: CAP-002-E2-S4-tasks
      version: "1 (updated 2026-10-30, last_reworked_review v2)"
    - id: CAP-002-E2-S4-tdd-evidence
      version: "cycle-1, cycle-2, cycle-3"
    - id: CAP-002-E2-S4-implementation-review
      version: "2 (baseline, reviewed_head 9b6f750db1c71d3ab562d4ddaeef73ce8e59efc1)"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-factor-engine-component-tests
      version: "1"
    - id: DEC-0241
      version: "open, provisional, agent, owner_reviewed false, second opinion agrees"
    - id: DEC-0242
      version: "open, contradiction, owner, owner_reviewed false"
    - id: DEC-0243
      version: "open, contradiction, owner, owner_reviewed false"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S4 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 18/18 verified |
| Required validation | 15/15 passed |

The rework resolves both findings v2 asked it to resolve. It changes only tests and plan text: `git diff 9b6f750..HEAD -- src` is empty.

- **v2 IR-001.** The new test `test_an_outdated_inputs_known_on_is_the_latest_observation_of_the_rows_used` kills v2's survivor `manual:review2-known-on-outdated-e` in my run. It also kills five mutants of my own on the outdated arm of line 241. Each of the test's five parameters (E bar, S bar, split, dividend, prior bar) is the only one that kills the mutant dropping that row.
- **v2 IR-002.** Plan T009 (c) now carries the DEC-0243 note.

I ran all 15 required validation commands and all pass. The full Python suite gives 1691 passed and 1 xfailed, and Playwright gives 18 passed. `npm run lint` and `npm run format` exit 1 only on git-ignored `build/` bundles; the tracked files are clean. The TDD-evidence lint is clean, and cycle-3's `diff_sha256` matches the committed rework diff byte for byte.

I ran 215 mutants: 151 were killed and 64 survived. 63 survivors are equivalent. The 64th, `manual:review3-known-on-outdated-stock-max`, is a new hand-written mutant on line 241, a production line unchanged since v2. `mutation-run.py scope` tags it `late`. It is non-equivalent: a probe shows it gives a stale stock's `return_6m` the S_3 bar's late observation. Under step H a late survivor is MEDIUM at most and makes no test `WEAK`, so it does not block (IR-001). v1 IR-007 stays open at LOW, as before (IR-002).

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1 · **total 2**

| ID | Severity | Scope | Summary |
|----|----------|-------|---------|
| IR-001 | MEDIUM | late | An outdated input's `known_on` is pinned on one window only. `manual:review3-known-on-outdated-stock-max`, which takes the maximum over a stock's outdated windows, survives |
| IR-002 | LOW | carried | v1 IR-007 and v2 IR-003, unchanged: one implausible payload or return can still overflow `numeric` and fail the whole set |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S4` |
| HEAD | `8d877ef133eefab77a497987f6bf031bb0bd530a` (`story-coding(CAP-002-E2-S4): rework review v2, …`) |
| Review base | `pipeline-state.py review-base`, run with no `--base-ref`, gives `7688c924c554920816b60fd6af60fc81f1164174` (merge of PR #145). `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before the review: `git status --porcelain=v1 --untracked-files=all` printed nothing |
| Changed files reviewed | 303 since the review base: 11 code, test, plan, evidence-YAML and review files, and 292 evidence files. 23 since the baseline: the test module, the plan, the TDD evidence, v2's report and mutation JSON, and 18 evidence files |
| Baseline | Review v2 (`CHANGES-REQUIRED`), `reviewed_head` `9b6f750db1c71d3ab562d4ddaeef73ce8e59efc1`, with `CAP-002-E2-S4-implementation-review-v2-mutation.json`. `git diff 9b6f750..HEAD -- src tests` touches only `test_engine_inputs_momentum.py` (+31). `9b6f750..41bc50e` adds only v2's two report files |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/sql/momentum_inputs.sql` | added since base; unchanged since baseline | T010; AC-7, AC-13, DAC-E2-1, DAC-E2-6, DAC-E2-S4-1 to 5 |
| `src/factorflow/classification/engine.py` | modified since base (+27, additions only); unchanged since baseline | T011 |
| `tests/integration/engine_momentum_support.py` | added; unchanged since baseline | T002 |
| `tests/integration/test_engine_inputs_momentum.py` | added; one new test since baseline (+31, lines 893-921) | T003 to T009, T018. The rework adds `test_an_outdated_inputs_known_on_is_the_latest_observation_of_the_rows_used`, with 5 parameters, for v2 IR-001. No existing test changed |
| `.../stories/CAP-002-E2-S4-tasks.md` | modified | Checkboxes. Since baseline: `last_reworked_review` is now v2, and the T009 note recording DEC-0243 is new (v2 IR-002) |
| `.../stories/CAP-002-E2-S4.md` | modified | Frontmatter `status` changes from `planning` to `in-review` only. `artifact-gate.py revision` gives the approved `sha256:082f0afb…`, and `artifact-gate.py check` passes |
| `.../stories/CAP-002-E2-S4-tdd-evidence.yaml` | added; cycle-3 appended since baseline | T017 |
| `.../stories/CAP-002-E2-S4-implementation-review-v1.md`, `-v2.md` and their `-mutation.json` | added (commits `234563d`, `41bc50e`) | Reviews v1 and v2; v2 is this review's baseline |
| `.../stories/CAP-002-E2-S4-evidence/` (292 files) | added | T017 and T014. 18 are new since the baseline: `cycle-3.patch`, `red-cycle-3.py`, `red-cycle-3.log`, `mutants-cycle-3.json`, `mutation-cycle-3-results.json`, and 13 mutant and baseline logs |

No change is unjustified. `git diff --stat 7688c92..HEAD` touches none of these: `tests/conftest.py`, `engine_support.py`, `engine_inputs_support.py`, `test_engine_currency.py`, `pyproject.toml`, `package.json`, `package-lock.json`, `insert_inputs.sql`, or any delivered test (T015).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `momentum_inputs.sql`: `held`, `win`, `judged`, and the final `SELECT`, which computes `(e_close / s_adjusted_close) * dividend_factor - 1` (line 236). `factor = 'momentum'` and `input_name = concat('return_', k, 'm')`. The windows and lag come from `constants` (`engine.py:214-236`) | The T004 to T007 tests and `test_each_stock_is_adjusted_by_its_own_corporate_actions_and_prior_sessions` | Unchanged since v2 |
| AC-13 | SATISFIED | `statused`: `latest_session < %(latest_trading_day)s` gives `outdated` (line 218). `latest_session` is the stock's unbounded `max(session_date)` (lines 24-26) | The TC-COMP-102 test and the three currency tests | — |
| DAC-E2-1 | SATISFIED | The split factor is taken over usable splits in (S_k, E] (lines 149, 196-197). The dividend factor is taken against the prior session's adjusted close (lines 111-118, 137-139, 150) | The TC-COMP-064 and 065 tests, and the split, dividend and multi-split tests | The DEC-0117 and DEC-0241 guards change nothing for valid data |
| DAC-E2-6 | SATISFIED | As AC-13 | As AC-13 | — |
| DAC-E2-S4-1 | SATISFIED | The S lookup in `win` is a LEFT JOIN LATERAL; `boundary = concat('S_', k)` | `test_a_missing_12_month_price_makes_only_return_12m_missing`, which also asserts `known_on` null on the missing row (DEC-0242) | — |
| DAC-E2-S4-2 | SATISFIED | `s_adjusted_close = s_close × exp(sum(log_factor))` | The TC-COMP-064 test: exact equality with the unsplit twin in both payload forms | — |
| DAC-E2-S4-3 | SATISFIED | `priced.log_term` | The TC-COMP-065 test and the two-stock test | — |
| DAC-E2-S4-4 | SATISFIED | `judged.known_on` (lines 163-164), written only when `status <> 'missing'` (line 241, DEC-0242) | The TC-COMP-066 test (5 present cases); `test_known_on_covers_the_prior_session_of_every_dividend_in_the_window`; and new: `test_an_outdated_inputs_known_on_is_the_latest_observation_of_the_rows_used` (5 outdated cases) | The present and outdated arms are now both pinned against E. An outdated input's per-window distinction is not pinned (IR-001, late) |
| DAC-E2-S4-5 | SATISFIED | As AC-13. `value` is set only for `present` (line 235), and `as_of = e_session` | The TC-COMP-102 test: three `outdated` rows, value null, `as_of` and `known_on` E, exact detail | — |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S2's and S3's symbols exist at the base | Unchanged since v1 |
| T002 | complete | VERIFIED | `engine_momentum_support.py` | Unchanged since v1 |
| T003 | complete | VERIFIED | `env` fixture with an anchor bar on 2026-10-16 | — |
| T004 | complete | VERIFIED | TC-COMP-063 plus the boundary and month-end tests | — |
| T005 | complete | VERIFIED | TC-COMP-064 plus the split tests | — |
| T006 | complete | VERIFIED | TC-COMP-065 plus the dividend tests | — |
| T007 | complete | VERIFIED | TC-COMP-066, the two-dividend `known_on` test, and the new outdated `known_on` test | The planned cases are complete. The rework closes v2 IR-001; the per-window gap is IR-001 here (late) |
| T008 | complete | VERIFIED | TC-COMP-102 plus three currency tests | — |
| T009 | complete | VERIFIED | Parts (a) to (g) present | (c) now carries the DEC-0243 supersession note, so v2 IR-002 is resolved |
| T010 | complete | VERIFIED | `momentum_inputs.sql`. Lines 241 and 270-272 carry out DEC-0242 and DEC-0243, which the T010 note records | A justified deviation, unchanged since v1: index lookups replace the `DISTINCT ON` `bar` CTE |
| T011 | complete | VERIFIED | `engine.py:214-236`; no `ingestion` import | Unchanged since v1 |
| T012 | complete | VERIFIED | No S3 file edited; the focused suite is green (116 passed) | — |
| T013 | complete | VERIFIED | My validation below. The wheel ships `momentum_inputs.sql` at 16,324 B, the source's size. The SQL-safety, SQL-ships and stage-order tests pass unedited | — |
| T014 | complete | VERIFIED | `t014-volume-probe.log` and the cycle-1 commit Notes | Not rerun: no production line changed since v2, and none since v1 except two `CASE` expressions over computed columns |
| T015 | complete | VERIFIED | The five `# Implements` tags are present (TC-COMP-063 at line 133, 064 at 304, 065 at 463, 066 at 819, 102 at 927). The new test cites DEC-0242, DEC-0118 (1), DAC-E2-S4-4 and v2 IR-001 | — |
| T016 | complete | VERIFIED | No SQL changed since v2; `test_engine_sql_safety.py` passes | — |
| T017 | complete | VERIFIED | `check-tdd-evidence.py --require-logs` gives 0 errors and 0 warnings. Cycle-3's `diff_sha256` `8c10deb9…` equals both `git diff 41bc50e..HEAD -- src tests` and `cycle-3.patch`. The `red_log`, `red-cycle-3.py` and results SHA-256 values match the files | Cycle-3 records a fresh code review (APPROVED) and spec-drift review (no drift), and `commit_hash: stage`. Its RED is observed against v2's survivor, since no production line changed. The SHA-256 values in the RED log header match HEAD 41bc50e's SQL and test module, and the cycle's test module equals HEAD's |
| T018 | complete | VERIFIED | `assert_momentum_invariants` still runs; the catalogue `restated_possible` mutant and `review-restated-true` are killed | — |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_a_missing_12_month_price_makes_only_return_12m_missing` / TC-COMP-063 | ADEQUATE | Status, null value, `as_of` E, null `known_on`, exact boundary detail; the other two windows present | none |
| `test_a_2_for_1_split_inside_the_window_leaves_the_return_unchanged` / TC-COMP-064 | ADEQUATE | Exact equality with the unsplit twin in both payload forms. Per-stock isolation is pinned beside it by the two-stock test | none |
| `test_a_dividend_of_1_on_a_prior_close_of_100_multiplies_the_factor_by_1_01` / TC-COMP-065 | ADEQUATE | `ret(99, 90, 1.01)` in both payload forms, and the full dividend detail | none |
| `test_known_on_is_the_latest_observation_of_the_bars_and_actions_used` / TC-COMP-066 | ADEQUATE | Each of the E bar, S bar, split, dividend and prior bar drives a present input's `known_on` in turn. Distinct per-window values (10-05 against 10-15) pin per-window grouping for present inputs. The outdated arm is now pinned by the companion test below, and v2's survivor is killed | The per-window distinction for outdated inputs is IR-001. It is `late`, so it does not make this test `WEAK` |
| `test_an_outdated_inputs_known_on_is_the_latest_observation_of_the_rows_used` (new, 5 parameters) | ADEQUATE | A stale stock (latest bar 2026-10-15, L 2026-10-16) has every row observed on its own date except one, observed on 2026-10-05. It asserts `outdated`, value null, `as_of` E, and `known_on` 2026-10-05. The latest bar is observed on 2026-10-15, after every row used, so a `known_on` that counted it would read 10-15; `rework3-known-on-outdated-latest-session` is killed that way. Each parameter is load-bearing: in my run the prior-bar, split, dividend and S-bar cases are each the first to fail their own dropped-row mutant. Isolated, with fixed dates | Asserts `return_3m` only (IR-001) |
| `test_a_stale_latest_bar_makes_all_three_momentum_inputs_outdated` / TC-COMP-102 | ADEQUATE | Three `outdated` rows, value null, `as_of` and `known_on` E, exact detail; the fresh stock present | none against its mapped condition |
| Every other test in the module | ADEQUATE | Unchanged since v2. Every carried catalogue and manual mutant on a code line is killed except the equivalent line-205 mutant | none |

**Isolation and determinism.** Every test builds its own migrated database and fixes every date. Each re-acquired row gets a distinct `observed_on`. The new test adds no clock, network or order dependence. Its `observed` map is rebuilt per parameter, so no case leaks into another.

**Mutation (E.9).** Commands are in the validation table.

1. `generate` over `7688c92..HEAD` gave 117 catalogue mutants, all in `momentum_inputs.sql` (108 `off-by-one`, 9 `negate-boolean`). It derives none for `engine.py`; the carried `stage-*` manual mutants cover that file.
2. I added 6 manual mutants of my own (`manual:review3-*`), all on the outdated arm of line 241. I also reran the coder's 2 `rework3-*` mutants as my own evidence.
3. `scope --since 9b6f750 --previous <v2 -mutation.json>` added 90 of v2's mutants: its 88 manual mutants and 2 catalogue mutants whose IDs `generate` no longer produces. None was dropped. The resulting 215 mutants were tagged 204 `carried`, 11 `late` and 0 `delta`; no production line changed since v2.
4. All 215 ran in four parallel clones against the focused suite of 116 tests. All four baselines passed. Result: 151 killed, 64 survived.

| Survivor(s) | Scope | Disposition | Contract reasoning |
|-------------|-------|-------------|--------------------|
| 62 mutants on `--` comment lines (lines 2, 3, 5, 8, 17, 36, 51, 63, 81, 105, 108, 132, 133, 144, 152, 161, 169, 202, 209, 211, 234, 239, 240, 242, 268) | 59 carried, 3 late (line 242) | equivalent | PostgreSQL discards SQL comments, and no artifact specifies comment text. The SQL-safety test passed on each mutant, so none adds a `%`, brace or `\|\|` |
| `momentum_inputs.sql:205:negate-boolean:1` (`coalesce(…, true) AS price_not_positive`) | carried | equivalent | The default is reached only when E or S_k is absent. Such a window joins no action, since `a.effective_on > w.s_session` or `<= w.e_session` is null. So `unusable` is false and `missing_data_type` is `prices` either way, while status and the boundary detail take precedence. This matches v2's disposition, rechecked against the unchanged code |
| `manual:review3-known-on-outdated-stock-max` (line 241: an outdated input's `known_on` becomes `max(s.known_on) OVER (PARTITION BY s.instrument_id, s.status)`) | **late** | **non-equivalent** | DEC-0242 keeps DEC-0118 (1) for outdated inputs: `known_on` is the latest `observed_on` over that input's own E bar, S_k bar, prior sessions and actions in (S_k, E]. DAC-E2-S4-4 and TC-COMP-066 apply it per input written. A scratch-clone probe confirms the difference. IR-001 |

Killed, among them every mutant that bears on a v2 finding:

- **v2 IR-001.** `manual:review2-known-on-outdated-e` (carried) is killed by `test_an_outdated_inputs_known_on_…[E bar]`, which reads 2026-09-17 for 2026-10-05.
- **Mine.** `review3-known-on-outdated-e-observed` and `-without-s` are killed by `[S bar]`, `-without-split` by `[split]`, `-without-dividend` by `[dividend]`, and `-without-prior` by `[prior bar]`.
- **The coder's.** `rework3-known-on-outdated-bars-only` and `-latest-session` are killed.
- **Carried.** Every v1 and v2 reviewer mutant and every coder manual mutant that still applies is killed, among them the missing-arm and data-type mutants behind DEC-0242 and DEC-0243.

## Independent Validation

`<component>` = `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/feactorflow-v2-cap-002-e2-pipeline-285094/repos/factorflow-v2/FactorFlow-v2`. `<scratch>` = this session's scratchpad `s4-ir-v3` folder, outside the repository. Every command needing Docker, the uv cache or npm ran outside the sandbox as one plain call, with `--directory` or `--prefix` naming the component.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run --directory <component> --all-extras --offline python -B -m pytest -m "postgres or not postgres" -q -p no:cacheprovider tests/integration/test_engine_inputs_momentum.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_stage_order.py tests/unit/test_classification_sql_ships.py` | harness root | 0 | PASS (focused) | 116 passed in 9.66 s: v2's 111 plus the 5 new parameters |
| `uv sync --all-extras --directory <component>` | harness root | 0 | PASS (required) | Resolved 46 packages, checked 43 |
| `uv build --directory <component>` | harness root | 0 | PASS (required) | sdist and wheel built; the wheel lists `factorflow/classification/sql/momentum_inputs.sql` (16,324 B, the source's size) |
| `uv run --directory <component> pytest -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1691 passed, 1 xfailed, 263.04 s. The xfail is S2's strict TC-COMP-059 line-item check. The count is v2's 1686 plus the 5 new parameters |
| `uv run --directory <component> pytest -m postgres -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 609 passed, 1083 deselected, 234.21 s |
| `uv run --directory <component> pytest -m "not postgres" -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1082 passed, 609 deselected, 1 xfailed, 25.56 s |
| `uv run --directory <component> ruff check .` | harness root | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> ruff format --check .` | harness root | 0 | PASS (required) | 240 files already formatted |
| `uv run --directory <component> mypy src` | harness root | 0 | PASS (required) | No issues found in 56 source files |
| `npm ci --prefix <component>` | harness root | 0 | PASS (required) | 250 packages added. npm reports 10 audit vulnerabilities, but this story changes neither `package.json` nor `package-lock.json`, so that is not a finding here |
| `npm run build --prefix <component>` | harness root | 0 | PASS (required) | Vite build, 63 modules |
| `npm run test --prefix <component>` | harness root | 0 | PASS (required) | 47 files, 876 tests passed |
| `npm run test:e2e --prefix <component>` | harness root | 0 | PASS (required) | 18 passed (2.9 min). The `posttest:e2e` hook removed its container |
| `npm run lint --prefix <component>` | harness root | 1 | PASS (environment note) | "Found 120 errors", all in git-ignored bundles under `build/lib/factorflow/api/static/assets/` (`.gitignore:12: build/`). `uv build` copies the bundles there and `biome.json` does not ignore them. `biome lint --max-diagnostics=1000 .` from `<component>` names only `build/lib/…` files. The tracked-files rerun, `git ls-files -z \| xargs -0 ./node_modules/.bin/biome lint --no-errors-on-unmatched --files-ignore-unknown=true`, exits 0 over 110 files with no diagnostics |
| `npm run format --prefix <component>` | harness root | 1 | PASS (environment note) | "Found 6 errors", one in each of six git-ignored `build/lib/…/assets/index-*.js` bundles. The same tracked-files rerun with `biome format` exits 0 over 110 files with no diagnostics |
| `npx --prefix <component> tsc --noEmit -p <component>` | harness root | 0 | PASS (required) | No output |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/docs/.../CAP-002-E2-S4-tdd-evidence.yaml --repo-dir <component> --base 7688c924c554920816b60fd6af60fc81f1164174 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (E.8) | 0 errors, 0 warnings |
| `python3 scripts/artifact-gate.py check --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | Gate passed (owner-allowed). `revision` gives `sha256:082f0afb…` |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 7688c924c554920816b60fd6af60fc81f1164174..HEAD --cycle review --out <scratch>/generated.json` | harness root | 0 | PASS | 117 catalogue mutants. 6 reviewer and 2 coder `rework3-*` manual mutants were then appended (`<scratch>/with-manual.json`) |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/with-manual.json --since 9b6f750db1c71d3ab562d4ddaeef73ce8e59efc1 --previous <component>/docs/.../CAP-002-E2-S4-implementation-review-v2-mutation.json --out <scratch>/mutants.json` | harness root | 0 | PASS | 215 mutants: 204 carried, 11 late; no previous mutant dropped. sha256 `da2230e3…` |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 900 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider <the four focused files>' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 3 | PASS (E.9) | 215 mutants: 151 killed and 64 survived, of which 63 are equivalent. The 64th is a late non-equivalent survivor (IR-001), which step H does not let block. Exit 3 means survivors exist. Ran 02:21:49Z to 02:35:17Z. Results sha256 `8e95e235…`, copied beside this report as `CAP-002-E2-S4-implementation-review-v3-mutation.json`. A first attempt exited 1 before running anything because `<scratch>/work` did not exist; I created it and reran |
| `uv run --directory <scratch>/probe --all-extras --offline python -B -m pytest -m postgres -q -p no:cacheprovider tests/integration/test_probe_outdated_known_on_per_window.py` | harness root | 0, then 1 | PASS on HEAD, FAIL on the mutant (IR-001 evidence) | `<scratch>/probe` is a `git clone --local` of HEAD with one reviewer probe test added. The probe's stale stock has its S_3 bar observed on 2026-10-05. On HEAD's SQL, `return_3m` is 10-05 and `return_6m` and `return_12m` are E (1 passed). With `review3-known-on-outdated-stock-max` applied in the clone, `return_6m` fails with `assert datetime.date(2026, 10, 5) == datetime.date(2026, 9, 17)` |

Both the full suite and the `-m postgres` run include the PostgreSQL tests. I ran both and substituted neither for the other.

**Excluded:** the T014 volume probe. It is a signal, not a gate, and no production line changed since v2. Nothing else was excluded.

### Validation Side Effects

- **Before.** HEAD `8d877ef`. `git status --porcelain=v1 --untracked-files=all` printed nothing. `code-revision` was `sha256:35269795…f04522e06`.
- **After.** HEAD `8d877ef`, branch unchanged, and `git status` printed nothing before this report was written. `code-revision` is unchanged at `sha256:35269795…f04522e06`.
  - Only git-ignored products were regenerated: `.venv/`, `build/`, `dist/`, `src/factorflow.egg-info/`, `src/factorflow/api/static/`, `node_modules/` and `test-results/`.
  - The mutation clones and the probe clone live in `<scratch>`, outside the repository.
  - The only new files are this report and its `-mutation.json`. Both are under `docs/`, which the fingerprint excludes.
- **Unexpected tracked-file changes:** none.

## Findings

### IR-001 — An outdated input's `known_on` is pinned on one window only

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-4, AC-7
- **Tasks**: T007 (test); T010 (behaviour, line 241)
- **Files**:
  - `momentum_inputs.sql:241` (`CASE WHEN s.status <> 'missing' THEN s.known_on END AS known_on`), unchanged since v2.
  - The test is `test_an_outdated_inputs_known_on_is_the_latest_observation_of_the_rows_used` (lines 893-921), which asserts `return_3m` only.
- **Claim challenged**: the cycle-3 code review accepted "only return_3m is asserted, which suffices because line 241 applies per row".
- **Observed evidence**:
  - `manual:review3-known-on-outdated-stock-max` survives all 116 focused tests. It gives an outdated input the greatest `known_on` among its stock's outdated windows.
  - TC-COMP-066 pins per-window values for present inputs only, where `return_3m` is 10-05 and the longer windows are 10-15.
  - For outdated inputs, every test that reads `known_on` has the three windows agreeing or reads only `return_3m`: TC-COMP-102 (all E), the currency-independence test (two stocks compared) and the new test.
  - The scratch-clone probe shows the shipped code is right: a stale stock whose S_3 bar is observed late gets `return_6m.known_on` = E. The mutant gives 2026-10-05.
- **Expected evidence/behavior**: DEC-0242 says "Present and outdated momentum inputs keep DEC-0118 (1)". That is the latest `observed_on` over the rows the input itself uses, per window. DAC-E2-S4-4 and TC-COMP-066 apply it to each input written.
- **Impact**: the code is correct today. A regression that dated an outdated input by another window's rows would put a stale stock's 6- or 12-month input after the date it became knowable. Nothing would fail. It is a small effect and blocks nothing.
- **Scope note**: line 241 is unchanged since v2's `reviewed_head`, and `mutation-run.py scope` tags the mutant `late`. v2 could have found it just as well, since its TC-COMP-102 assertions have all three windows equal to E. Under step H it is MEDIUM at most and makes no test `WEAK`.
- **Required remediation**: none required for this gate. Optionally, the new test could also assert `return_6m` and `return_12m` in the `S bar` case, both E, since S_3 is not a row those windows use. That kills the mutant.

### IR-002 — One implausible payload or return can still fail the whole set (v1 IR-007, v2 IR-003)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A (DEC-0117 (3): "it never aborts the build")
- **Tasks**: T010
- **Files**: the casts in `parsed` (`momentum_inputs.sql:64-76`), the `value` expression (line 236), and `factor_input.value numeric(30,10)`
- **Claim challenged**: one stock's data never aborts the set.
- **Observed evidence**: those lines are unchanged since v1. The rework commit again carries the finding "to the design's next revision with S3's IR-006", and no owner decision addresses it.
- **Expected evidence/behavior**: no artifact fixes a magnitude bound. v1 recorded two probes: a 131,073-digit plain-decimal string fails its `::numeric` cast, and a return of 1e20 or more overflows `numeric(30,10)`.
- **Impact**: as v1 found, it needs data no provider sends, but it would fail every stock's classification at once.
- **Required remediation**: none unless the owner decides it. Carry it to the design's next revision.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 (HIGH) | RESOLVED | `test_an_outdated_inputs_known_on_is_the_latest_observation_of_the_rows_used` kills `manual:review2-known-on-outdated-e` in my run (`[E bar]`, 2026-09-17 read for 2026-10-05). It also kills my five outdated-arm mutants, each through its own parameter, and the coder's two `rework3-*` mutants. The test asserts `outdated`, value null, `as_of` E, and `known_on` equal to the late observation. A remaining per-window gap is new and late (IR-001) |
| v2/IR-002 (LOW) | RESOLVED | Plan T009 now carries a note under (c): DEC-0243 gives `corporate_actions` for an unusable payload, and every other missing momentum input keeps `prices`. It matches DEC-0243's decision text and the T010 note |
| v2/IR-003 (LOW) | STILL OPEN | Unchanged code and no owner decision; carried as IR-002 |

## Scope and Plan Deviations

- **Owner decisions applied, unchanged since v2.** DEC-0242 and DEC-0243 are `decided_by: owner`, recorded in this run. Their `status: open` and `owner_reviewed: false` belong to the owner's later blind review and are not a defect of this story. Line 241 and lines 270-272 follow them exactly, and the new test pins DEC-0242's outdated arm.
- **DEC-0241, judged on its record and standing.** It is `kind: provisional`, `decided_by: agent`, `status: open` and `owner_reviewed: false`. Since v2 it has gained a blind second opinion that agrees (`second_opinion_agrees: true`, `triage: accepted`). It derives from design section 3 and the precedent of DEC-0117 (3). It changes nothing for valid data and contradicts no approved artifact. Its phrase "as for every momentum input" in (1) is stale against DEC-0243, but that is the decision's own record, as v2 noted. It reaches the owner through the driver's blind review and does not block this gate.
- **Decision records.** DEC-0241, DEC-0242 and DEC-0243 are untracked in the harness until the driver commits them. No other file with those IDs exists in any harness worktree, the shared checkout, or `git log --all`. The `Decision-Id` trailers parse: commit `8d877ef` carries DEC-0242 and DEC-0243, `9b6f750` carries all three, and `d9fdf13` carries DEC-0241.
- **Rework-cap note.** The commit message says this second rework was an owner override of the driver's one-rework cap. The work-item log `projects/factorflow-v2/work-items/CAP-002-E2-S4.jsonl` records a driver transition with that reason. That is the driver's state, not an input to this gate, and this review does not judge it.
- **Design wording follows later.** Design 2.4 and DEC-0055 (7) still word `known_on` with no exception for missing rows. The commit's follow-ups record this for the design's next revision, as v2 noted.
- **Justified, unchanged since v1:** index lookups in place of the `DISTINCT ON` CTE; the prior session per DEC-0118 (3); a missing boundary writes a `missing` row.
- **Bookkeeping:** the story's `status` is `in-review`, and its approved revision is unchanged. Since v2 the plan changed `last_reworked_review` and added the T009 note.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync` for CAP-002-E2-S4)
- **Required action**: proceed to doc sync with the two warnings recorded. No rework is required. IR-001 can optionally be closed by adding two assertions to the new test. IR-002 waits for the design's next revision unless the owner decides it.
- **Warnings accepted downstream**: IR-001 (MEDIUM, late), IR-002 (LOW, carried)
- **Questions for the owner**: none blocking. DEC-0241, DEC-0242 and DEC-0243 reach you through the driver's blind review. IR-002 (v1 IR-007) needs your decision only if you want a magnitude bound before the design's next revision.
