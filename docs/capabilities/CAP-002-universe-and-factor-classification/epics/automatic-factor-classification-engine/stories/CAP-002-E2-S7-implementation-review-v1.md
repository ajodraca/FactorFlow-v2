---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S7-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E2-S7"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S7.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-31T21:54:11Z"
reviewed_head: "f42831f718896663c140e27bfc8b1280d3547706"
review_base: "f4deee3e319a7f7ef536df83d85d212b0fbf623f"
reviewed_state_revision: "sha256:b8d62b95e45ed4a29a6204f654b2d292e0ea571817f10aedfaab8e3178ec194c"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E2-S7
    artifact_version: 1
    content_revision: sha256:814b78fc0cbf415b71e065e5f1d6e36b9bb005c48f96357cb5e9d5152f4bbb1b
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-31T21:54:11Z
  source_artifacts:
    - id: CAP-002-E2-S7
      version: "1 (sha256:814b78fc0cbf415b71e065e5f1d6e36b9bb005c48f96357cb5e9d5152f4bbb1b)"
    - id: CAP-002-E2-S7-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E2-S7-tdd-evidence
      version: "cycle-1 to cycle-5"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-factor-engine-component-tests
      version: "1"
    - id: DEC-0123
      version: "applied, owner upheld 2026-10-18"
    - id: DEC-0124
      version: "applied, owner upheld 2026-10-18"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S7 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 6/6 satisfied (and the plan-carried DAC-E2-S2-5 end-to-end clause, satisfied) |
| Planned tasks | 12/14 verified, 2 justified NOT APPLICABLE (T009, T010) |
| Required validation | 16/16 passed (2 with an environment note: `npm run lint` and `npm run format`) |

This is an initial review. The story adds tests only, and `git diff f4deee3..HEAD -- src` is empty, so no production line changed and no SQL tuning was needed. I reran the volume proof. The 3000-instrument build completed in 1.433 s against the 295 s budget, with 24,000 inputs, 9,000 classified rows and three ranked factors of 3000. TC-COMP-162 and the two DAC-E2-9 companion cases pass. They compare all four tables of the completed set, column by column, before and after the later data.

The cycle patches rebuild every test file of HEAD exactly, and the TDD-evidence lint is clean. The catalogue generates no mutant, because no production line changed. I wrote five mutants of my own against the SQL the S7 tests claim to pin: `known_on` from the bar and the statement, the latest-observation order, the backfill mark, and the unresolved cause. Each one is killed by the S7 test that targets it.

Every required command passes. `npm run lint` and `npm run format` exit 1, but only on git-ignored bundles under `build/`; honouring `.gitignore`, both exit 0 over 123 files. Two LOW findings remain: the plan checks two skipped tasks with no note in the plan (IR-001), and a static-guard rule is weaker than its docstring says (IR-002). Neither affects an acceptance criterion.

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

| ID | Severity | Scope | Summary |
|----|----------|-------|---------|
| IR-001 | LOW | initial | T009 and T010 are checked `[x]` although neither ran (the budget was met); the skip is recorded only in the commit message and the TDD-evidence header, not in the plan |
| IR-002 | LOW | initial | The static guard's budget rule accepts any `assert <expr> <= BUDGET_SECONDS`, so it does not tie the assert to the measured elapsed time its docstring names |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S7.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S7-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S7` |
| HEAD | `f42831f718896663c140e27bfc8b1280d3547706` (the stage commit `story-coding(CAP-002-E2-S7)`, Decision-Id trailers DEC-0123 and DEC-0124) |
| Review base | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` gave `f4deee3e319a7f7ef536df83d85d212b0fbf623f` (merge of PR #154, HEAD's parent). `git merge-base --is-ancestor` exits 0 |
| Working tree | Clean: `git status --porcelain=v1 -uall` printed nothing before and after validation. Nothing staged, unstaged or untracked |
| Changed files reviewed | 25: 6 test files, the story, the task plan, the TDD-evidence YAML, and 16 evidence files (5 cycle patches, 10 RED and GREEN logs, the T008 run log) |
| Baseline | none: initial review (no earlier `CAP-002-E2-S7-implementation-review-v*.md`) |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `tests/integration/engine_proof_support.py` (+354) | added | T002; DAC-E2-S7-1, DAC-E2-S7-2; DEC-0123, DEC-0124 |
| `tests/integration/test_engine_volume.py` (+83) | added | T003; TC-COMP-091; DAC-E2-S7-1, DAC-E2-5, AC-11 |
| `tests/integration/test_engine_volume_population.py` (+120) | added | T006; DAC-E2-S7-1, DEC-0123 |
| `tests/unit/test_engine_volume_static.py` (+341) | added | T007; DAC-E2-5 |
| `tests/integration/test_engine_transaction.py` (+177, -1) | modified | T004 (TC-COMP-162), T005 (a) and (b). The -1 is `from datetime import date`, which became `date, timedelta` in the import block; no existing test, fixture or helper changed |
| `tests/integration/test_engine_inputs_fundamentals.py` (+75) | modified | T014: one import line and one appended test; no existing line changed |
| `.../stories/CAP-002-E2-S7.md` | modified | `status: planning` became `in-review` (outside the content revision, which still matches the approval's `reviewed_revision`) |
| `.../stories/CAP-002-E2-S7-tasks.md` | modified | 14 checkboxes, `[ ]` to `[x]`; no other text changed (`git diff --word-diff`) |
| `.../stories/CAP-002-E2-S7-tdd-evidence.yaml` | added | T013 |
| `.../stories/CAP-002-E2-S7-evidence/` (16 files) | added | T013 RED and GREEN logs and cycle patches; T008 run log |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `engine.build` with the real `_STAGES` (`engine.py:211`, `:236`, `:274`). No production change | `test_engine_volume.py::test_3000_instruments_build_within_the_budget` | 3000 stocks complete in 1.433 s (my `-m slow` run; the coder recorded 1.649 s and 2.159 s), well inside the 295 s DAC-E2-5 budget. Within this story's scope, AC-11 is proved through DAC-E2-5: the build part, with the 5 s poll (DEC-0054) subtracted. The poll itself belongs to the scheduler stories |
| AC-19 | SATISFIED | Append-only writes (`insert_inputs.sql`, `classify.sql`). `known_on` is `max(observed_on)` (`growth_inputs.sql:50`) and `greatest(p.known_on, b.observed_on)` (`value_inputs.sql:108`) | `test_engine_transaction.py::test_backfill_after_completion_leaves_the_set_unchanged`, `::test_revised_close_after_completion_leaves_the_set_unchanged`, `::test_backfill_before_the_build_is_seen_by_that_set` | Clause 1: set 1's four-table snapshot is equal after the backfill and again after set 2 completes. Clause 2: set 2's `known_on` equals the backfill's `observed_on`, not its filing date or period end, and no set-1 `known_on` is on or after it. Three of my mutants of those lines are killed here |
| DAC-E2-5 | SATISFIED | as AC-11 | `test_engine_volume.py` (both `slow` and `postgres`) and `tests/unit/test_engine_volume_static.py` | Proved by a `slow` test, not asserted at runtime. The static guard pins the marks, `BUDGET_SECONDS = 295`, `TIMEOUT_SECONDS = 300.0`, one `engine.build`, and no `_STAGES` or `MIN_PEER_SET_SIZE` |
| DAC-E2-9 | SATISFIED | the build reads in one transaction; append-only writes | TC-COMP-162 (fundamental) and T005 (a) (price) | A fundamental and a price recorded after completion each alter no row of set 1. The next set prices from the revision, known on its `observed_on`. My `known_on-ignores-bar` and `bar-earliest-observation` mutants are killed by T005 (a) |
| DAC-E2-S7-1 | SATISFIED | as AC-11 | TC-COMP-091; T006 at 40 stocks | `count_classification_rows` gives 3 / 24,000 / 9,000. `qualified_counts` and `classification_set_factor` give 3000 ranked on each factor. 9,000 rows are `classified` and the set is `complete` with 3000 active. T006 shows the same generator yields all 8 inputs `present`, 273 bars, 24 statements and the dividend per stock, with the splits inside the 6- and 12-month windows |
| DAC-E2-S7-2 | SATISFIED | as AC-19 | TC-COMP-162 | Set 1: A's growth inputs are `missing` (7 periods found), A is `not_classified` on growth for `input_missing`, and growth is ranked at 30. After the backfill, set 1 is unchanged. Set 2: A's growth inputs are `present`, `restated_possible` is true, `known_on` is the backfill date, A is classified and marked, and growth is ranked at 31 |
| DAC-E2-S2-5 (plan-carried end-to-end clause, T014; not a story criterion) | SATISFIED | `growth_inputs.sql:71`, `value_inputs.sql` unresolved array, `line_items.py` | `test_engine_inputs_fundamentals.py::test_unresolved_line_items_still_classify_momentum` | With the real, unresolved `LINE_ITEMS` (precondition: all 7 asserted), the five value and growth inputs are `missing` with `line_item_mapping_unresolved`. Momentum is ranked at 40 and all 40 rows are classified. Value and growth are `not_enough_stocks` with `0 of 30 stocks qualified`, and the set is complete. My `unresolved-cause-dropped` mutant is killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `engine.py` registers the three stages in DEC-0121 order (lines 211, 236, 274). The seven SQL files exist. `bool_or` marks are at `classify.sql:88`, `value_inputs.sql:75` and `growth_inputs.sql:51`. The four support and test files exist | Read-only task. The prerequisites hold on HEAD |
| T002 | complete | VERIFIED | `engine_proof_support.py`: `volume_sessions`, `populate_volume`, `_insert_bar`, `populate_backdating`, `backfill_statement`, `revise_close`, `snapshot_set`, `complete_and_open_next` | Set-based `INSERT ... SELECT` with bound parameters, and `ANALYZE` of the four tables. `snapshot_set` orders each table by its primary key (migration 0006: `(set_id, factor)`, `(set_id, instrument_id, factor, input_name)` and `(set_id, instrument_id, factor)`) and reads `jsonb` as text. One recorded deviation: `BackdatingPopulation.classification_date` is added, which `backfill_statement` needs. Justified |
| T003 | complete | VERIFIED | `test_engine_volume.py:45-83` | Every assertion T003 lists is present. The clock is around the one `engine.build` call only (DEC-0123), and the diagnostic is printed |
| T004 | complete | VERIFIED | `test_engine_transaction.py:691-749` | Every precondition and postcondition T004 lists is asserted, and the snapshots are asserted non-empty. The `recorded_at > ended_at` check carries a comment that `ended_at` is the build transaction's start time (`complete_set.sql` `now()`), so it shows "after the build began" and the call order gives "after completion" (see Scope notes) |
| T005 | complete | VERIFIED | `test_engine_transaction.py:752-780` (a) and `:783-804` (b) | (a): set 1 is unchanged after the revision and again after set 2. Set 2's `detail.close` is the revised close, its value differs, and its `known_on` is the revision date. (b): the control gives A's growth inputs `present` in set 1 and growth ranked at 31 |
| T006 | complete | VERIFIED | `test_engine_volume_population.py` | 273 distinct, ascending weekdays reaching back 13 months. At 40 stocks: 320 inputs `present`, 120 rows `classified`, (273, 24, 1) held per stock, and every momentum input lists its dividend, with every tenth stock's split in the 6- and 12-month windows |
| T007 | complete | VERIFIED | `tests/unit/test_engine_volume_static.py` | Every rule T007 names, plus disabling marks and calls, single bindings, `TIMEOUT_SECONDS` passed, and one budget assert. There are 26 negative cases and a positive inline source. See IR-002 |
| T008 | complete | VERIFIED | `CAP-002-E2-S7-evidence/t008-volume-run.log` (2.159 s); my `-m slow` run (1.433 s) | Within budget, so T009 and T010 do not apply. The commit message states the elapsed time and the skip |
| T009 | complete | NOT APPLICABLE | `git diff f4deee3..HEAD -- src` is empty | Conditional on a missed budget, which did not happen. It is checked `[x]` with no note in the plan (IR-001) |
| T010 | complete | NOT APPLICABLE | as T009 | Conditional on T009. It is checked `[x]` with no note (IR-001) |
| T011 | complete | VERIFIED | the validation table below | Every Validation Plan command passes. `-m 'not postgres'` takes 25.6 s, and the volume population is built only inside the `slow` test's fixture |
| T012 | complete | VERIFIED | `# Implements TC-COMP-091` (`test_engine_volume.py:45`) and `# Implements TC-COMP-162` (`test_engine_transaction.py:691`) | T014 carries no tag, and its docstring cites TC-COMP-059, DAC-E2-S2-5 and factor-engine section 8 criterion 13 and section 7. The diff touches only the files the plan names. No change to `conftest.py`, `pyproject.toml`, `engine.py`, `constants.py`, a migration or an SQL file |
| T013 | complete | VERIFIED | `CAP-002-E2-S7-tdd-evidence.yaml` (5 cycles) | The lint gives 0 errors and 0 warnings with `--require-logs`. Each `diff_sha256` equals its `cycle-N.patch` sha256. Applied in order to `f4deee3` on a temporary index, the five patches reproduce every test file of HEAD byte for byte. RED logs show the T013 perturbations failing for the reason named |
| T014 | complete | VERIFIED | `test_engine_inputs_fundamentals.py:1387-1455` | Steps (a) to (e) are asserted, with no `install_test_line_items`, no `_STAGES` or floor patch, and its own connection over `postgres_connection_string` |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_3000_instruments_build_within_the_budget` / TC-COMP-091 (mandatory) | ADEQUATE | Real stages and floor; the elapsed time of the `build` call alone; exact row counts in three tables; 3000 qualified and ranked on each factor; all 9,000 rows `classified`, so the population is not degenerate; set `complete` with 3000 active. The coder's RED (`BUDGET_SECONDS = 1`) shows the time assertion can fail | The 3000-row run does not itself count corporate actions in the input detail. T006 does that at 40 stocks, from the same generator with the same `LAST_SESSION` literal. DEC-0123 accepts this split |
| `test_backfill_after_completion_leaves_the_set_unchanged` / TC-COMP-162 (mandatory) | ADEQUATE | Exact equality of four snapshots (`SELECT *`, primary-key order, `jsonb` as text), checked twice; preconditions that make "sees the statement" observable; `known_on` pinned against the filing date and the period end; the restatement mark on input and classification; peer-set size 30 then 31. Killed `known_on-period-end` and `never-backfilled` | none |
| `test_revised_close_after_completion_leaves_the_set_unchanged` (T005 (a)) | ADEQUATE | Snapshot unchanged twice; the revised close read through `detail.close`; value differs; `known_on` is the revision date. Killed `known_on-ignores-bar` and `bar-earliest-observation` | none |
| `test_backfill_before_the_build_is_seen_by_that_set` (T005 (b), control) | ADEQUATE | The same statement recorded before set 1 makes A's growth `present`, marked, and known on its `observed_on`, at 31 ranked. This shows TC-COMP-162's `missing` precondition comes from the statement's absence. Its `known_on`, one day after its own classification date, is a fixture artefact, and a comment says so. It matches the design: selection is by the build's snapshot, with no `observed_on <= D` bound (DAC-E2-9, DEC-0117 (1)) | none |
| `test_volume_sessions_reach_the_12_month_window`, `test_forty_stock_population_builds_with_every_input_present` (T006) | ADEQUATE | Generator properties; every input `present`; per-stock row counts; corporate actions applied inside the windows. The coder's RED (seven quarters) turns growth `missing` | none |
| `tests/unit/test_engine_volume_static.py` (T007, 29 tests) | ADEQUATE | `ast` rules against the real file, a passing inline source, and 26 single-rule breaks, each asserting its own message | The budget rule does not tie the left operand to the measured elapsed time (IR-002, LOW) |
| `test_unresolved_line_items_still_classify_momentum` (T014) | ADEQUATE | Precondition on the real mapping; per-stock input status and cause; factor ranking; momentum scores and percentiles; exact `not_enough_stocks` rows. The coder's RED (29 stocks) and my `unresolved-cause-dropped` mutant are both killed | Per the plan it fails at its precondition once the owner resolves the payload keys, at the same time as S2's strict xfail. That is by design (T014) |

Isolation and determinism: each test gets a fresh database (`conftest.py:80`, `postgres_connection_string`). All dates are fixed literals (2026-11-13, a Friday). No test patches `_STAGES` or `MIN_PEER_SET_SIZE`, and there is no autouse fixture in the two appended modules. Line items are patched with `monkeypatch`, so each test undoes its own. The only environment dependence is the wall clock of the volume test, and its margin is about 200 times.

**Mutation (E.9).** `mutation-run.py generate` over `f4deee3..HEAD` writes 0 mutants, because the change set adds no production line. Reading what the S7 tests claim to pin, I added five manual mutants of unchanged production SQL, tagged cycle `review`:

| Mutant | Change | Result | Killed by |
|--------|--------|--------|-----------|
| `manual:value_inputs.sql:known_on-ignores-bar` | `greatest(p.known_on, b.observed_on)` to `p.known_on` | killed | T005 (a) |
| `manual:value_inputs.sql:bar-earliest-observation` | latest bar by `observed_on ASC` | killed | T005 (a) |
| `manual:growth_inputs.sql:known_on-period-end` | `max(observed_on)` to `max(fiscal_period_end)` | killed | TC-COMP-162 and T005 (b) |
| `manual:statements.sql:never-backfilled` | `backfilled` constant `false` | killed | TC-COMP-162 and T005 (b) |
| `manual:growth_inputs.sql:unresolved-cause-dropped` | the unresolved branch never taken | killed | T014 |

The focused command ran only S7's 36 tests: the three appended transaction tests, T014, the population module, the volume test and the static module. So every kill is an S7 test's. The three baselines each gave 36 passed. No survivor. I wrote no snapshot-immutability mutant. Set 1's rows could change only through an `UPDATE` or `DELETE` that the append-only schema and `test_research_sql_is_append_only.py` already refuse. The one `UPDATE` shape, `complete_set.sql`, is guarded by `state = 'building'`, and set 1 is `complete`.

## Independent Validation

`<component>` = `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/feactorflow-v2-cap-002-e2-pipeline-285094/repos/factorflow-v2/FactorFlow-v2`. `<scratch>` = this session's scratchpad `mutation` folder, outside the repository. Every command that needed Docker, the uv cache or npm ran outside the sandbox as one plain call, with `--directory` or `--prefix` naming the component.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras --directory <component>` | harness root | 0 | PASS (required) | Resolved 46 packages, checked 43 |
| `uv run --directory <component> pytest -m slow -s -p no:cacheprovider -q` | harness root | 0 | PASS (story, first) | 9 passed, 2025 deselected, 178.31 s. `[TC-COMP-091 diagnostic] 3000-instrument build elapsed: 1.433s`. `-s` shows the diagnostic |
| `uv run --directory <component> pytest` | harness root | 0 | PASS (required) | 2033 passed, 1 xfailed, 286.01 s. The full suite includes the `slow` and `postgres` tests. The xfail is S2's strict line-item check (TC-COMP-059) |
| `uv run --directory <component> pytest -m postgres -q` | harness root | 0 | PASS (required) | 769 passed, 1265 deselected, 260.94 s. Includes the volume test, which carries both markers |
| `uv run --directory <component> pytest -m "not postgres" -q` | harness root | 0 | PASS (required) | 1264 passed, 769 deselected, 1 xfailed, 25.57 s. 1264 + 769 + 1 = 2034, the full suite's total |
| `uv run --directory <component> ruff check .` | harness root | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> ruff format --check .` | harness root | 0 | PASS (required) | 257 files already formatted |
| `uv run --directory <component> mypy src` | harness root | 0 | PASS (required) | No issues found in 57 source files |
| `uv build --directory <component>` | harness root | 0 | PASS (required) | Built `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl` |
| `npm ci --prefix <component>` | harness root | 0 | PASS (required) | 250 packages added. npm reports 10 audit vulnerabilities, but this story changes neither `package.json` nor `package-lock.json`, so that is not a finding here |
| `npm run build --prefix <component>` | harness root | 0 | PASS (required) | Vite build, 63 modules |
| `npm run test --prefix <component>` | harness root | 0 | PASS (required) | 53 test files, 1069 tests passed |
| `npm run test:e2e --prefix <component>` | harness root | 0 | PASS (required) | 18 passed (2.9 min) on chromium against a real API and PostgreSQL container. The `posttest:e2e` hook removed `factorflow-e2e-postgres` |
| `npm run lint --prefix <component>` | harness root | 1 | PASS (environment note) | "Found 55560 errors". `--reporter=github` puts every one of them in eight git-ignored bundles, `build/lib/factorflow/api/static/assets/index-*.js` (`.gitignore:12: build/`). `uv build` copies the bundles there and `biome.json` does not ignore `build/`. The rerun `npx biome lint . --vcs-enabled=true --vcs-client-kind=git --vcs-use-ignore-file=true` exits 0 over 123 files with no diagnostics |
| `npm run format --prefix <component>` | harness root | 1 | PASS (environment note) | "Found 8 errors": the same eight `build/` bundles. The `.gitignore`-honouring rerun of `biome format` exits 0 over 123 files |
| `npx --prefix <component> tsc --noEmit -p <component>` | harness root | 0 | PASS (required) | No output |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/docs/.../CAP-002-E2-S7-tdd-evidence.yaml --repo-dir <component> --base f4deee3e319a7f7ef536df83d85d212b0fbf623f --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (E.8) | 0 errors, 0 warnings |
| `GIT_INDEX_FILE=$TMPDIR/s7-review-index`: `git read-tree f4deee3`, then `git apply --cached` on `cycle-1.patch` to `cycle-5.patch`, then `git diff-index --cached --stat HEAD` | `<component>` | 0 | PASS | All five apply in order. The only difference from HEAD is the docs and evidence files the patches do not carry: every test file matches. A temporary index was used, so the repository's own index was untouched |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range f4deee3e319a7f7ef536df83d85d212b0fbf623f..HEAD --cycle review --out $TMPDIR/s7-review/mutants.json` | harness root | 0 | PASS | 0 mutants: no production line changed. The five manual mutants were then written to `<scratch>/mutants.json` |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 3 --timeout 900 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -q -p no:cacheprovider <S7's 7 test ids/modules>' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 0 | PASS (E.9) | 5 mutants, 5 killed; baselines 36 passed on each of 3 workers. Results sha256 `358deebb2f6fb66f74b335bf593c384dbc85e6787cff00de4bc6217cb508e341`, copied beside this report as `CAP-002-E2-S7-implementation-review-v1-mutation.json` |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY` |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | `sha256:814b78fc…bb1b`, equal to the story approval's `reviewed_revision` |
| `uv run --directory <component> mypy --strict <the six changed test files>` | harness root | 1 | INFORMATIONAL (not required) | 4 errors, all on lines older than this story (`git blame`: `e67482f5`, `dda0207f`): `engine_inputs_support.py:194`, `test_engine_inputs_fundamentals.py:130` and `:995`, `test_engine_transaction.py:65`. No error is in an S7 line |

**Excluded:** none of the required commands. The story's Validation section (`-m slow`, `-m postgres`, `ruff check`, `mypy src`) and every command in the tech-stack table were run. I ran both the full suite and the `-m postgres` run, and substituted neither for the other.

### Validation Side Effects

- **Before.** HEAD `f42831f`. `git status --porcelain=v1 -uall` printed nothing. `code-revision` was `sha256:b8d62b95e45ed4a29a6204f654b2d292e0ea571817f10aedfaab8e3178ec194c`.
- **After.** HEAD `f42831f`, branch unchanged, and `git status` printed nothing before this report was written. `code-revision` is unchanged at `sha256:b8d62b95e45ed4a29a6204f654b2d292e0ea571817f10aedfaab8e3178ec194c`.
  - Only git-ignored products were regenerated: `.venv/`, `build/`, `dist/`, `src/factorflow.egg-info/`, `src/factorflow/api/static/`, `node_modules/`, `.mypy_cache/` and the Playwright output.
  - The mutation clones live in `<scratch>/work`, outside the repository, and were removed by the runner.
  - The only new files are this report and its `-mutation.json`. Both are under `docs/`, which the fingerprint excludes.
- **Unexpected tracked-file changes:** none.

## Findings

### IR-001 — Two skipped conditional tasks are checked complete with no note in the plan

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009, T010
- **Files**: `CAP-002-E2-S7-tasks.md`, T009 and T010 lines (`- [x] T009 Only when T008 shows the budget missed: ...`, `- [x] T010 If T009 ran: ...`)
- **Claim challenged**: the plan shows 14 of 14 tasks done.
- **Observed evidence**:
  - `git diff f4deee3..HEAD -- src` is empty, so no tuning ran, and T010's re-run had nothing to re-run.
  - The skip is recorded only in the commit message ("T009 and T010 were skipped") and in the TDD-evidence header.
  - The plan's own diff is checkboxes only.
- **Expected evidence/behavior**: task step C.5 asks that a checked task carry evidence of its work. A conditional task that did not apply should say so where the plan is read.
- **Impact**: a reader of the plan alone could believe SQL tuning was done and re-verified. Nothing in the code is affected.
- **Required remediation**: none required for this gate. Optionally, annotate T009 and T010 in the plan as not applicable, with T008's measured time, or leave them unchecked with that note.

### IR-002 — The static guard's budget rule does not tie the assert to the measured time

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-5 (guard only; the criterion is proved by the volume test itself)
- **Tasks**: T007
- **Files**: `tests/unit/test_engine_volume_static.py`, `_build_rules` (lines 154-182)
- **Claim challenged**: its docstring says it requires "one assertion of the elapsed time against `BUDGET_SECONDS` itself".
- **Observed evidence**: the rule accepts any `assert <expr> <= BUDGET_SECONDS`. The left operand is never checked, and nothing checks that `time.perf_counter()` brackets the `engine.build` call. So `assert 0 <= BUDGET_SECONDS` keeps every rule. The cycle-3 code review recorded this as non-blocking, and it was not changed.
- **Expected evidence/behavior**: T007 does not require this rule, so the gap is beyond the plan. The rule's docstring, though, claims more than it checks.
- **Impact**: a later edit that stops asserting the measured time would pass the guard. The volume test as delivered asserts `elapsed <= BUDGET_SECONDS` correctly, so nothing is wrong today.
- **Required remediation**: none required for this gate. Optionally, require the left operand to be the name bound from `time.perf_counter() - <start>`, or narrow the docstring to what the rule checks.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations (recorded in the TDD evidence):**
  - `BackdatingPopulation` carries `classification_date`.
  - T003 also asserts each `classification_set_factor` row.
  - T006 also asserts that the corporate actions appear in the momentum detail, and puts the `volume_sessions` check in its own unmarked test.
  - T007 adds rules beyond its list: disabling marks and calls, single binding, the timeout passed, and one budget assert.
  - T004 and T005 add helpers and assertions inside the appended S7 section only.
  - Each one strengthens the proof and none changes an existing line.
- **Bookkeeping:** T009 and T010 are checked though not applicable (IR-001). The story `status` moved to `in-review`. The tasks file keeps `status: draft`, its planning branch name in the header, and `updated: 2026-10-18`, all as planned (Resolved Conflicts, third bullet).
- **Out of scope:** none. No production, configuration, migration or dependency file changed.
- **Decisions judged on their records:**
  - DEC-0123 (volume test shape) and DEC-0124 (no-backdating assertions) are both `status: applied` and owner-reviewed `upheld` on 2026-10-18. The implementation conforms to each clause.
    - DEC-0123: 3,000 dividends and 300 splits; `ANALYZE` after the load; `timeout_seconds = 300.0`; the clock around `build` only; every input present; 24,000 inputs and 9,000 classified rows.
    - DEC-0124: four tables compared column by column; the backfill fills A's missing growth quarter and is filed before A's first observation; set 2 has it `present`, `restated_possible`, and known on its `observed_on`; a separate price case.
  - The decisions the code comments cite are all `applied` and `upheld`: DEC-0054, DEC-0055, DEC-0056, DEC-0067, DEC-0116, DEC-0117 and DEC-0121.
  - DEC-0221, which is `open`, is cited only by S3's `statements.sql`, not by any S7 line.
  - No new decision was needed or recorded by this review.
- **Observation for the owner (no finding, no decision needed for this gate):** `complete_set.sql` sets `ended_at = now()`, as factor-engine design 2.3 and system design step 13a specify. In PostgreSQL that is the build transaction's start time, not the moment of completion. The T004 comment says this accurately. For a build of about 2 s the difference is immaterial. Any future measure of AC-11 from `classification_set.ended_at` would understate a build's duration, though, so the owner may want design 2.3 to say which instant `ended_at` names at its next revision.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: run `$doc-sync` for CAP-002-E2-S7 against this report. The stage commit is `f42831f`.
- **Warnings accepted downstream**: IR-001, IR-002
