---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S6-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E2-S6"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S6.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-31T00:05:06Z"
reviewed_head: "a46dbff81ad6c68a049850a9a63f6008c6769068"
review_base: "d643a52a339fc8c49406851e64e3aa0a6470c968"
reviewed_state_revision: "sha256:d14f1b8d95786ceb6e8db59ec256d92821aceaff904b67842b78cb8b5fc757ba"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E2-S6
    artifact_version: 1
    content_revision: sha256:ec2db0d0960cd5d7206100d6c9068d5c94df8ff6499ef477f57a7d27c70db900
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-31T00:05:06Z
  source_artifacts:
    - id: CAP-002-E2-S6
      version: "1 (sha256:ec2db0d0960cd5d7206100d6c9068d5c94df8ff6499ef477f57a7d27c70db900)"
    - id: CAP-002-E2-S6-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E2-S6-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-factor-engine-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0056
      version: "applied, owner upheld 2026-10-17"
    - id: DEC-0119
      version: "applied, owner upheld 2026-10-18"
    - id: DEC-0122
      version: "applied, owner upheld 2026-10-18"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S6 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 2/5 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 16/17 passed |

The production change is correct. `value_inputs.sql` and `growth_inputs.sql` now mark each input with `bool_or(backfilled)` over the rows its `detail.periods` lists, and a missing input is never marked. `classify.sql` carries the mark onto the classified, input-reason and `not_enough_stocks` rows of value and growth. Momentum and retired rows always get `false`. All of this follows DEC-0056, DEC-0119 and DEC-0122, each owner-upheld and applied. Every constitution and story command passes, and so do the 26 story tests and the 192 delivered S2, S3 and S5 tests. The one required check that fails is the mutation gate (E.9), and it fails for the reason below. The TDD lint reports 0 errors, and I reproduced the coder's RED (19 failed, 7 passed on `d643a52`'s SQL).

The gate fails on one test gap, IR-001 (HIGH). No story test can tell DEC-0056's rule apart from the alternative it rejects. DEC-0056 compares the filing date with the instrument's *first* fundamentals `observed_on`; the rejected rule compares it with the row's *own* `observed_on`. Every row the fixtures write as not backfilled is filed on the same day it is observed, so the two rules agree on every row a story test reads.

- A mutant that switches `value_inputs.sql` to the rejected rule passes all 26 story tests and every delivered focused suite.
- Its `growth_inputs.sql` twin is killed only, and incidentally, by a delivered S3 test.

Under that mutant, stocks with no backfilled row get all three value inputs marked. That makes TC-COMP-186, a mandatory test, `WEAK`, which is at least HIGH under the skill's rules. The fix is a test-only change.

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0 · **total 1**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S6.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S6` |
| HEAD | `a46dbff81ad6c68a049850a9a63f6008c6769068` (stage commit) |
| Review base | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` → `d643a52a339fc8c49406851e64e3aa0a6470c968` (merge of PR #148). `git merge-base --is-ancestor` confirms it is an ancestor of HEAD; it is HEAD's parent |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` empty); only git-ignored build products present |
| Changed files reviewed | 66 in `d643a52..a46dbff`: 5 modified (the 3 SQL files, the story and the task plan) and 61 added; no staged, unstaged or untracked files |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review` reported `READY — story is ready for independent review`. The prerequisite check exited 0. `artifact-gate.py require` passes for the story. Its revision `sha256:ec2db0d0…` equals the approval's `reviewed_revision`, so the status change from `planning` to `in-review` left the approval intact.

`git diff d643a52..a46dbff -- src tests <mutants-cycle-1.json>` hashes to `f902bf5e…208a`, the TDD evidence's `diff_sha256`, and so does `cycle-1.patch`. The reviews therefore judged exactly the committed code. The commit's trailer block parses (`git interpret-trailers --parse`) to `Decision-Id: DEC-0056`, `DEC-0119` and `DEC-0122`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/sql/value_inputs.sql` | modified (+6 −5) | T009; AC-23, DAC-E2-11, DAC-E2-S6-1 |
| `src/factorflow/classification/sql/growth_inputs.sql` | modified (+6 −5) | T010; AC-23, DAC-E2-11, DAC-E2-S6-1 |
| `src/factorflow/classification/sql/classify.sql` | modified (+23 −8) | T011; AC-23, DAC-E2-11, DAC-E2-S6-1, DAC-E2-S6-2 |
| `tests/integration/engine_restatement_support.py` | added (229 lines) | T002 |
| `tests/integration/test_engine_restatement.py` | added (622 lines) | T003–T007; TC-COMP-186, 187, 188 |
| `tests/unit/test_restatement_sql_static.py` | added (210 lines) | T008 |
| `docs/.../stories/CAP-002-E2-S6.md` | modified (`status: planning` → `in-review`) | story-coding bookkeeping; approval revision unchanged |
| `docs/.../stories/CAP-002-E2-S6-tasks.md` | modified (16 checkboxes) | T001–T016 completion state |
| `docs/.../stories/CAP-002-E2-S6-tdd-evidence.yaml` | added (191 lines) | T016 |
| `docs/.../stories/CAP-002-E2-S6-evidence/` (57 files) | added | T016: `cycle-1.patch`, `red-cycle-1-restatement.log`, `full-suite-cycle-1.log`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json` and its 52 logs |

No file outside the plan was touched. `engine.py`, `constants.py`, `line_items.py`, `tests/conftest.py`, `pyproject.toml`, the migrations and every delivered S2, S3 and S5 test and helper are unchanged (T012, T015).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-23 | PARTIAL | `value_inputs.sql:29,75,106,168`; `growth_inputs.sql:24,51,69,102`; `classify.sql:84-95,102,115,125`; append-only: no `UPDATE`/`DELETE` added (`test_research_sql_is_append_only.py` passes) | `test_engine_restatement.py`: TC-COMP-186 (`:147-173`), TC-COMP-188 (`:234-272`) and the T007 cases (`:278-622`) | The marking, the any-row rule, the used-rows rule, the not-classified rows and retention in history are all implemented and tested. The condition "a period already reported before acquisition of that stock began" is implemented correctly, by S3's `backfilled` flag carried through, but no story test pins it against the row's own `observed_on` (IR-001) |
| DAC-E2-11 | PARTIAL | as AC-23; momentum excluded by the single guard at `classify.sql:93` | TC-COMP-186, TC-COMP-187 (`:179-222`), T007 (f) (`:598-622`) | "Never with a momentum classification" is fully tested. The "precedes the instrument's first fundamentals `observed_on`" condition carries the same gap (IR-001) |
| DAC-E2-S6-1 | PARTIAL | `value_inputs.sql:168`, `growth_inputs.sql:102`, `classify.sql:102,115,125` | TC-COMP-186; T007 (a)–(e) | A's five inputs and both classifications are marked, and B, C and D's are not. But B, C and D's rows are all filed on their own `observed_on`, so the controls cannot show that the first observation, rather than the row's own, decides the mark. TC-COMP-186 is `WEAK` (IR-001) |
| DAC-E2-S6-2 | SATISFIED | `classify.sql:84-95`: `marks` is empty unless `%(factor)s IN ('value', 'growth')`, so every momentum row gets `coalesce(NULL, false)` | TC-COMP-187: A's momentum input rows are inserted with `restated_possible = true`, and A's momentum classification is still `classified` and `false`. T007 (f): marked momentum inputs alone mark nothing. T008: exactly one guard, literals `value` and `growth`, no `'momentum'` anywhere in the SQL | Kills `marks-no-factor-guard`, `marks-guard-admits-momentum` and `marks-guard-value-only` |
| DAC-E2-S6-3 | SATISFIED | No `UPDATE` or `DELETE` of `factor_input` or `factor_classification`; each build only inserts rows for its own `set_id` (`classify.sql:96-136`, `insert_inputs.sql`) | TC-COMP-188: every column of every set-1 classification and input row is unchanged after set 2 is built over fresh data, and set 2 holds its own rows for the same keys | Matches the plan: migration `0006` has no trigger, so no rejected-`UPDATE` test is written |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `test_restatement_sql_static.py:22-54` `PARAMETERS_BEFORE` | I extracted the `%(name)s` sets of `d643a52`'s three SQL files: they equal the hard-coded sets, and HEAD adds none. The delivered assertions on `restated_possible` (`test_engine_inputs_fundamentals.py:181,835`, `test_engine_peer_set.py:541`, `test_research_constraints.py:814-815`) sit on fixtures with no backfilled row, and all pass unedited |
| T002 | complete | VERIFIED | `engine_restatement_support.py:30-229` | Every helper is present, and every statement row is written through `add_statement` with both dates explicit. Additions (justified in the TDD evidence, deviation (3)): `floor`, `statement_types`, `add_marked_inputs` and `input_snapshot`. The prescribed fixture, in which every non-backfilled row is filed on its own `observed_on`, is the root of IR-001 |
| T003 | complete | VERIFIED | `test_engine_restatement.py:75-108` (`store`, `build_fixture`) | Migrated store, a `succeeded` run and a `building` set; A–D with bars on `L` |
| T004 | complete | VERIFIED | `test_engine_restatement.py:147-173` | Implemented as planned. The test is `WEAK` for the reason in IR-001 |
| T005 | complete | VERIFIED | `test_engine_restatement.py:179-222` | Classification stage only, floor 3, A's momentum rows marked `true`. Adds stock E (deviation (4)), which covers the momentum row of a ranked factor that is not classified |
| T006 | complete | VERIFIED | `test_engine_restatement.py:234-272` | Snapshot of every column of set 1's classification and input rows, before and after set 2. It does not finish set 1's run separately: `add_run` creates a `succeeded` run |
| T007 | complete | VERIFIED | `test_engine_restatement.py:278-622` | (a) `:278`, (b) `:314`, (c) `:335`, (d) `:376` and `:537`, (e) `:563`, (f) `:598`. Three extra cases (`:408`, `:447`, `:483`) were added on review or to kill mutants (deviation (5)). (c) is `WEAK` for IR-001 |
| T008 | complete | VERIFIED | `test_restatement_sql_static.py:137-210` | Its detectors have self-tests (`:137-158`), and it failed 7 tests on `d643a52`'s SQL |
| T009 | complete | VERIFIED | `value_inputs.sql:29,75,106,166-168` | The column is computed from the same `used` rows that `detail.periods` aggregates, and is `false` when missing |
| T010 | complete | VERIFIED | `growth_inputs.sql:24,51,69,100-102` | As T009, over the eight income-statement rows |
| T011 | complete | VERIFIED | `classify.sql:84-95,99-127` | The guard is written once, inside `marks`, not in each row set (deviation (1)). The static test pins a single guard. `JOIN active` stands in for `ANY(%(active_ids)s)` (deviation (2)). The retired row set keeps `false`. No placeholder was added |
| T012 | complete | VERIFIED | `git diff --stat` | `engine.py`, `constants.py` and `line_items.py` are unchanged |
| T013 | complete | VERIFIED | Independent reruns | 26 story tests passed. The 192 delivered tests ran unedited and passed (`test_engine_inputs_fundamentals`, `test_engine_peer_set`, `test_composite_arithmetic`, `test_classify_sql_static`, `test_engine_sql_safety`, `test_classification_sql_ships`, `test_research_sql_is_append_only`, `test_engine_transaction`, `test_classification_stage_order`) |
| T014 | complete | VERIFIED | Independent Validation below | Every command passes. The S2 safety and ship tests pass over the edited SQL |
| T015 | complete | VERIFIED | Changed Files table | Each mapped test carries `# Implements TC-COMP-18n` (`:147`, `:179`, `:234`), and each additional test cites its AC or DEC in its docstring |
| T016 | complete | VERIFIED | `CAP-002-E2-S6-tdd-evidence.yaml` | One cycle, `code_review_verdict: APPROVED`, `drift_detected: false`, `commit_hash: stage`. Its `diff_sha256` equals both the committed diff and `cycle-1.patch`. Every cited log hash matches. The TDD lint reports 0 errors |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_statement_filed_before_first_observation_marks_its_inputs_and_classifications` / TC-COMP-186 | WEAK | A's five inputs and both classifications are `true`; B, C and D are `false` on everything; momentum is `false`; each column equals the `or` of its `detail.periods` flags | Every control row has `provider_filing_date == observed_on`, so it cannot tell "before the first observation" from "before its own observation". `manual:review-value-own-observed-rule` survives (IR-001) |
| `test_momentum_classification_is_never_marked` / TC-COMP-187 | ADEQUATE | A's momentum input rows say `true`, yet its classified momentum row is `false`, with a score and a percentile. E's input-missing momentum row is `false`. B, C and D are `false` | none |
| `test_a_later_set_leaves_the_earlier_sets_mark_unchanged` / TC-COMP-188 | ADEQUATE | Every column of every set-1 classification and input row, compared before and after set 2; set 2 holds its own rows for the same keys | Proves what TC-COMP-188 asks. Its fresh quarter is the one fixture where the two rules differ, but it checks set 2's marks only against set 2's own inputs (see IR-001) |
| `test_only_the_rows_an_input_reads_mark_it` / T007 (a) | ADEQUATE | An unused ninth quarter marks nothing. The oldest prior-year quarter marks only growth, and the oldest trailing quarter marks `earnings_yield` and growth | none |
| `test_one_backfilled_row_marks_only_the_inputs_that_read_it` / T007 (b) | ADEQUATE | Only `fcf_yield` is marked; value is `true`, growth and momentum are `false` | none |
| `test_filing_date_boundary_and_null_filing_date` / T007 (c) | WEAK | Filed on the first observation is not backfilled, one day earlier is, and null is not. Each case is checked on the input and on the `detail` flag | Every case has a filing date on or before the first observation, or null, so the rejected own-`observed_on` rule gives the same answers (IR-001) |
| `test_a_not_classified_row_for_a_missing_input_carries_the_mark` / T007 (d) | ADEQUATE | `fcf_yield` is missing with no period listed. The value row is `input_missing` on `fcf_yield` and still `true` | none |
| `test_a_factor_whose_inputs_are_all_missing_is_not_marked` | ADEQUATE | Both growth inputs are missing although they read backfilled rows, so they and the growth row are `false` | none |
| `test_outdated_inputs_and_their_not_classified_rows_carry_the_mark` | ADEQUATE | Five outdated, backfilled inputs are marked, and so are both `input_outdated` rows | none |
| `test_not_computable_inputs_and_their_not_classified_rows_carry_the_mark` | ADEQUATE | `not_computable` inputs are marked exactly where they list a backfilled row, and so are both `input_not_computable` rows | none |
| `test_unranked_rows_carry_the_mark_and_retired_rows_never_do` / T007 (d) | ADEQUATE | At floor 5, every `not_enough_stocks` row of A on value and growth is `true` and all others are `false`. A retired stock with backfilled statements is `false` on all three factors | none |
| `test_the_mark_changes_no_score_or_reason` / T007 (e) | ADEQUATE | `status`, `score`, `percentile` and all three reason columns are identical across the backfilled and null-filed sets, and only the mark differs | none |
| `test_a_marked_momentum_input_alone_marks_nothing` / T007 (f) | ADEQUATE | A's marked momentum rows reach none of its three classifications | none |
| `tests/unit/test_restatement_sql_static.py` (13 tests) / T008 | ADEQUATE | Detector self-tests; `bool_or(backfilled)` in both input files; no constant `false` row set except `retired`; one guard naming only `value` and `growth`; no new placeholder | none |
| Delivered S2/S3/S5 regression set (192 tests, unedited) | ADEQUATE | Rerun over the edited SQL | none |

**Mutation (E.9).** I regenerated the catalogue over `d643a52..HEAD`: 18 mutants, 13 off-by-one and 5 negate-boolean. I re-ran the coder's 30 manual mutants and added 6 of my own, 54 in all. The run used the 9 focused files listed under Independent Validation. Result: 36 killed, 18 survived.

| Survivor(s) | Count | Disposition |
|-------------|-------|-------------|
| Catalogue mutants at `classify.sql:86,87,99,100`, `growth_inputs.sql:101` and `value_inputs.sql:167` | 15 | **Equivalent.** Each one rewrites text inside a `--` comment. PostgreSQL discards comments, and the static test strips them before matching (`code()`). No test or safety rule reads them, and no artifact specifies comment wording |
| `manual:marks-no-roster-join` | 1 | **Equivalent.** `marks` is joined only onto row sets whose ids already come from `active`: `ranked_scores` (through `peer_ids JOIN active`), `first_gap` (`FROM active`) and `active` itself. A non-roster stock's mark is never read, `bool_or` per id is unchanged, and no stored row differs. DEC-0119's roster restriction still bounds every row written |
| `manual:review-marks-non-missing-only` (mine: `bool_or … FILTER (WHERE fi.status <> 'missing')`) | 1 | **Equivalent.** DEC-0122 marks an input over the rows its `detail.periods` lists, and a missing input lists none. `value_inputs.sql:168` and `growth_inputs.sql:102` write `false` for every missing input, so the filter only drops `false` rows. With every row missing, `NULL` is coalesced to `false`, the same answer. Momentum never reaches `marks`. No state the contract allows differs |
| `manual:review-value-own-observed-rule` (mine) | 1 | **Not equivalent → IR-001.** It changes the backfill rule DEC-0056 fixes |

Killed among my own: `review-growth-own-observed-rule`, killed by S3's `test_engine_inputs_fundamentals.py:181` only after every S6 test passed; `review-classified-any-stock-mark`; `review-value-newest-only`; and `review-growth-prior-only`. The four catalogue `coalesce(m.restated, true)` mutants at `classify.sql:102`, `:115` and `:125` are killed, and so are all 29 other coder manual mutants. Per mutant, the outcomes on the coder's 48 IDs match `mutation-cycle-1-results.json` exactly.

## Independent Validation

`<component>` = `repos/factorflow-v2/FactorFlow-v2`. Commands that need Docker, the uv cache or npm ran outside the sandbox as single plain calls, with `--directory`/`--prefix` pointing at the component.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run --directory <component> --offline pytest -p no:cacheprovider -q -m "postgres or not postgres" tests/integration/test_engine_restatement.py tests/unit/test_restatement_sql_static.py` | harness root | 0 | PASS (focused) | 26 passed, 4.03 s |
| `uv run --directory <component> --offline pytest -p no:cacheprovider -q -m "postgres or not postgres" <the 9 delivered S2/S3/S5 files of T013>` | harness root | 0 | PASS (focused, T013) | 192 passed, 14.07 s |
| `uv sync --all-extras --directory <component>` | harness root | 0 | PASS (required) | Resolved 46, checked 43 packages |
| `uv build --directory <component>` | harness root | 0 | PASS (required) | sdist and wheel built. `classify.sql`, `value_inputs.sql` and `growth_inputs.sql` are in the wheel |
| `uv run --directory <component> pytest -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1638 passed, 1 xfailed, 252.05 s (matches `full-suite-cycle-1.log`) |
| `uv run --directory <component> pytest -m postgres -q -p no:cacheprovider` | harness root | 0 | PASS (required, story) | 543 passed, 1096 deselected, 223.93 s |
| `uv run --directory <component> pytest -m "not postgres" -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1095 passed, 543 deselected, 1 xfailed, 26.03 s |
| `uv run --directory <component> --offline ruff check .` | harness root | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --offline ruff format --check .` | harness root | 0 | PASS (required) | 241 files already formatted |
| `uv run --directory <component> --offline mypy src` | harness root | 0 | PASS (required) | No issues in 56 source files |
| `npm ci --prefix <component>` | harness root | 0 | PASS (required) | 250 packages added. Its audit notice (10 vulnerabilities) predates this story, which changes no package |
| `npm run build --prefix <component>` | harness root | 0 | PASS (required) | Vite build, 63 modules |
| `npm run test --prefix <component>` | harness root | 0 | PASS (required) | 50 files, 950 tests |
| `npm run test:e2e --prefix <component>` | harness root | 0 | PASS (required) | 18 passed (2.9 min). The `posttest:e2e` hook removed `factorflow-e2e-postgres` afterwards |
| `npm run lint --prefix <component>` | harness root | 1 | PASS (environment note) | `Found 120 errors` over 123 files. The 6 files beyond the 117 tracked ones are the git-ignored Vite bundles in `build/lib/factorflow/api/static/assets/` (`.gitignore:12: build/`), which `uv build` copies there and `biome.json` does not ignore; every diagnostic shown is in them. Rerun over tracked files, `git ls-files -z \| xargs -0 npx biome lint --no-errors-on-unmatched --files-ignore-unknown=true`: 117 files checked, exit 0 |
| `npm run format --prefix <component>` | harness root | 1 | PASS (environment note) | `Found 6 errors`, one in each of the 6 git-ignored `build/lib/.../index-*.js` bundles. The same tracked-files rerun with `biome format`: 117 files checked, exit 0 |
| `npx --prefix <component> tsc --noEmit -p <component>` | harness root | 0 | PASS (required) | No output |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/docs/.../CAP-002-E2-S6-tdd-evidence.yaml --repo-dir <component> --base d643a52a339fc8c49406851e64e3aa0a6470c968 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider tests/integration/test_engine_restatement.py tests/unit/test_restatement_sql_static.py tests/integration/test_engine_inputs_fundamentals.py tests/integration/test_engine_peer_set.py tests/unit/test_classify_sql_static.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_sql_ships.py tests/unit/test_research_sql_is_append_only.py tests/integration/test_engine_transaction.py' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 3 | FAIL (E.9) | 54 mutants: 36 killed, 18 survived. 17 survivors are equivalent; 1 is not (IR-001). All four baselines passed. Ran 23:55:39Z–23:58:30Z. Results sha256 `fe9eda72e8709fb68bd100f7b25f9844bf14bb87ac0f986cc7ba6ceb0863d114`, copied beside this report as `CAP-002-E2-S6-implementation-review-v1-mutation.json`. A first attempt exited 1 before running anything because the `--work-root` directory did not exist |

Two further checks ran in a throwaway clone of HEAD in the scratchpad, never in the review subject:

- **RED reproduced.** With `src/` checked out at `d643a52` and the three test files as committed, the story tests give 19 failed and 7 passed. The failures are the 12 behaviour tests and 7 static tests, as `red-cycle-1-restatement.log` records.
- **IR-001 probe.** I wrote a scratch test that copies TC-COMP-188's two-set setup and asserts that B, C and D's set-2 inputs are all `false`. On HEAD it passes. With `manual:review-value-own-observed-rule` applied it fails: B, C and D's `book_to_price`, `earnings_yield` and `fcf_yield` become `true`. The 26 story tests in the same run all pass.

The full Python suite and the `-m postgres` run both include the 543 PostgreSQL tests. I did not substitute one for the other: both were run.

### Validation Side Effects

- Before: HEAD `a46dbff`; `git status --porcelain=v1 --untracked-files=all` empty; `code-revision` `sha256:d14f1b8d…c757ba`.
- After: HEAD `a46dbff`. The only untracked files are this report and its `-mutation.json`, both under `docs/`, which the fingerprint excludes. `code-revision` is unchanged at `sha256:d14f1b8d…c757ba`. Only git-ignored products were regenerated: `build/`, `dist/`, `src/factorflow.egg-info/`, `src/factorflow/api/static/`, `node_modules/`, `test-results/` and the tool caches.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | initial | OPEN | No story test tells DEC-0056's first-observation rule apart from the rejected own-`observed_on` rule. A `value_inputs.sql` mutant using the rejected rule survives every focused suite, so TC-COMP-186 is `WEAK` |

### IR-001 — The backfill rule is not pinned against the row's own observation date

- **Severity**: HIGH. A mandatory test (TC-COMP-186) is `WEAK` because a mutant that is not equivalent survives (skill E.9 and H). The production code is correct today, which does not lower the severity.
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-23, DAC-E2-11, DAC-E2-S6-1
- **Tasks**: T002 (fixture), T004 (TC-COMP-186), T006 (TC-COMP-188), T007 (c)
- **Files**:
  - Production lines the mutants replace:
    - `src/factorflow/classification/sql/value_inputs.sql:29` (the `s.backfilled` column this story added to `used`), aggregated at `:75` and written at `:168`
    - `src/factorflow/classification/sql/growth_inputs.sql:24`, `:51` and `:102`, likewise
  - Fixture: `tests/integration/engine_restatement_support.py:93-142`. `add_fundamentals` files every non-backfilled row on its own `observed_on`.
  - Tests:
    - `tests/integration/test_engine_restatement.py:147-173` (TC-COMP-186)
    - `:234-272` (TC-COMP-188)
    - `:335-373` (T007 (c))
- **Claim challenged**: TC-COMP-186 and the T007 (c) boundary test claim to pin DEC-0056's rule. Under that rule a row is backfilled, and so marks the inputs that list it, only when its `provider_filing_date` is earlier than the instrument's first fundamentals `observed_on`.
- **Observed evidence**:
  - **The value mutant survives.** `manual:review-value-own-observed-rule` replaces `s.backfilled` at `value_inputs.sql:29` with `coalesce(s.provider_filing_date < s.observed_on, false) AS backfilled`. That is DEC-0056's first rejected alternative. It passes all 26 story tests and every delivered focused suite: `manual_review-value-own-observed-rule.log` shows a clean exit, 20.1 s.
  - **The growth twin survives every S6 test.** `manual:review-growth-own-observed-rule` is killed only by S3's delivered `test_revenue_growth_is_four_quarter_sum_over_prior_four_minus_one`, at `test_engine_inputs_fundamentals.py:181`. The story files run first under `-x`, so every S6 test passed before that S3 test failed.
  - **Why nothing catches them.** Each non-backfilled row the story fixtures write has `provider_filing_date == observed_on`. The re-observed rows of T007 (c) and (e) are filed `FIRST − 1` or null. On all of these rows the two rules give the same answer.
  - **The one distinguishing row is not checked.** TC-COMP-188's fresh quarter is filed 2027-01-05, after `FIRST`, and observed 2027-01-10. The rules disagree only there, but the test asserts only that set 2's classification flags agree with set 2's input flags (`:268-272`). It never runs `assert_column_agrees_with_detail` on set 2, which would catch the mutant.
  - **The probe confirms the effect.** In the scratch probe described under Independent Validation, the mutant turns B, C and D's three value inputs in set 2 to `true`, while all 26 story tests pass.
- **Expected evidence/behavior**:
  - **DEC-0056** (owner upheld, applied): a row is "backfilled when its provider_filing_date is earlier than the earliest observed_on among all fundamental_observation rows for the same instrument". The alternative it rejects is "Compare provider_filing_date with the row's own observed_on".
  - **DEC-0122**: an input's mark is `bool_or(backfilled)` over the rows its `detail.periods` lists.
  - **TC-COMP-186**: its precondition is "a statement filed before the instrument's first fundamentals observation".
  - **Required test strength**: a mapped test has to separate the rule it names from the plausible wrong one (skill E.3 and E.9).
- **Impact**: A provider files a statement on or before the day FactorFlow observes it, and almost always some days before. A regression to the rejected rule would therefore mark nearly every value input, and every value classification, of a stock acquired as its statements were filed. The possibly-restated mark would stop meaning anything, and the suite would stay green for value. For growth it would stay green across every S6 test, held only by one S3 assertion written for another purpose. The reader and UI stories that surface this mark (TC-COMP-189 to 192) build on this column.
- **Required remediation**: Make S6's own tests kill both own-observed mutants. Add at least one row that is not backfilled under DEC-0056 but would be under the rejected rule. Its `provider_filing_date` must be on or after the stock's first `observed_on` and before its own `observed_on`. Assert that the value and growth inputs that list it are `false`, that the column agrees with `detail`, and that their classifications are `false`. Any one of these would do:
  - In TC-COMP-188, assert B, C and D's set-2 inputs and classifications are `false`, and run `assert_column_agrees_with_detail` on set 2.
  - Add a T007 (c) case.
  - Give the control stocks' fixture rows such a filing date.

  This is a test-only change. Record it as a new TDD cycle.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations.** The TDD evidence records all six, and each holds up:
  1. T011's guard is written once, inside `marks`. Same result, and a single guard is what the static test pins.
  2. `JOIN active` replaces `instrument_id = ANY(%(active_ids)s)`. It is the same set, and `peer_ids` does the same.
  3. T002's helpers gain `floor`, `statement_types`, `add_marked_inputs` and `input_snapshot`. T007 (d) and T006 need them.
  4. TC-COMP-187 adds a fifth stock, E.
  5. Three tests go beyond T007's list: all growth inputs missing, outdated inputs, and not-computable inputs.
  6. The mutants file is staged in the reviewed patch.
- **One TDD cycle for T001–T014.** The plan's Parallel Opportunities note allows it, since TC-COMP-186 and 188 need all three SQL edits together.
- **Bookkeeping.** Every checked task has evidence, and no unchecked task appears implemented. The story moved from `planning` to `in-review` without invalidating its approval.
- **Out-of-scope changes.** None.
- **Decision records.** DEC-0056, DEC-0119 and DEC-0122, cited by `Decision-Id:` trailer, are each `owner_reviewed: true`, `owner_verdict: upheld` and `status: applied`, and the code follows each one. DEC-0121, cited by the plan, is also upheld; this story replaces the constant `false` it left. No decision is the owner's to make here, and none was recorded.
- **Observation for the design owner (not a finding).** The two texts read differently for a missing input:
  - Factor-engine design 2.4 says an input is marked when "any statement row used is `backfilled`".
  - DEC-0122, owner-upheld and later, narrows that to the rows its `detail.periods` lists. A missing input lists none, so it is never marked, even when it read a backfilled row.

  The code follows DEC-0122, and `test_a_factor_whose_inputs_are_all_missing_is_not_marked` pins it. The task plan's Open Gaps already names factor-engine 2.4 and 2.5 for revision on the unranked-row question. This reading belongs in the same revision. It is a design-text matter, not this story's code.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework `CAP-002-E2-S6-tasks.md` against this report. Kill `manual:review-value-own-observed-rule` and `manual:review-growth-own-observed-rule` with the story's own tests (IR-001), then rerun this review. The next review's baseline is this v1, `reviewed_head` `a46dbff`, with `CAP-002-E2-S6-implementation-review-v1-mutation.json` as `scope --previous`.
- **Warnings accepted downstream**: N/A
