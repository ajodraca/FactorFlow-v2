---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S6-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E2-S6"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S6.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-31T01:17:35Z"
reviewed_head: "e406f693f5ea8149655da14aad660b3992078840"
review_base: "d643a52a339fc8c49406851e64e3aa0a6470c968"
reviewed_state_revision: "sha256:6af44bbb8e1f670a2fba2c20d3861b8cc5fb55037d7907026ba07b0c3cb7bff7"
verdict: PASS
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
  timestamp: 2026-10-31T01:17:35Z
  source_artifacts:
    - id: CAP-002-E2-S6
      version: "1 (sha256:ec2db0d0960cd5d7206100d6c9068d5c94df8ff6499ef477f57a7d27c70db900)"
    - id: CAP-002-E2-S6-tasks
      version: "1 (updated 2026-10-31, last_reworked_review v1)"
    - id: CAP-002-E2-S6-tdd-evidence
      version: "cycle-2"
    - id: CAP-002-E2-S6-implementation-review
      version: "1 (baseline, reviewed_head a46dbff81ad6c68a049850a9a63f6008c6769068)"
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

# Implementation Review: CAP-002-E2-S6 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 5/5 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 17/17 passed |

v1's only finding, IR-001 (HIGH), is resolved. The rework commit `e406f69` changes tests only, in `tests/integration/test_engine_restatement.py`, and no production line has changed since v1's `reviewed_head` `a46dbff`. Both mutants v1 named now fail S6's own tests. Both swap DEC-0056's first-observation rule for the rule it rejects, the row's own `observed_on`:

- `manual:review-value-own-observed-rule` fails TC-COMP-188 at `:271`.
- `manual:review-growth-own-observed-rule` fails TC-COMP-188 at `:274`.

A separate probe confirms that T007 (c) alone kills both, and also kills the same rule written into `statements.sql` itself.

I re-ran 57 mutants: the 54 from v1, carried, and 3 new ones of my own, `late`. 40 were killed and 17 survived. All 17 survivors are carried, and each is equivalent, for the reasons given below. Every required command passes. `npm run lint` and `npm run format` exit 1 only on git-ignored `build/` bundles; over tracked files they exit 0 (environment note). The TDD lint reports 0 errors. Every acceptance criterion is `SATISFIED`, every task is `VERIFIED`, and every mandatory test is `ADEQUATE`.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 0**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S6.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S6` |
| HEAD | `e406f693f5ea8149655da14aad660b3992078840` (rework commit) |
| Review base | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` (no `--base-ref`) gives `d643a52a339fc8c49406851e64e3aa0a6470c968`, the merge of PR #148. `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` empty); only git-ignored build products present |
| Changed files reviewed | 77 in `d643a52..e406f69`: 5 modified and 72 added; no staged, unstaged or untracked files. Of these, 14 changed since the baseline (`a46dbff..e406f69`): 3 modified and 11 added |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `a46dbff81ad6c68a049850a9a63f6008c6769068`, with `CAP-002-E2-S6-implementation-review-v1-mutation.json` |

Gate and state checks:

- `pipeline-state.py check --stage adversarial-review` reported `READY — review changes were reworked; a new review version is required`.
- The prerequisite check exited 0.
- `artifact-gate.py require` passes for the story. Its revision, `sha256:ec2db0d0…`, still equals the approval's `reviewed_revision`.

The cycle-2 hash checks out. `git diff 2cc906d..e406f69 -- tests src <mutants-cycle-2.json>` hashes to `ece54e37…6744`, which is both the TDD evidence's cycle-2 `diff_sha256` and the hash of `cycle-2.patch`. The patch therefore holds exactly the committed change. The rework commit's trailer block parses to `Decision-Id: DEC-0056` and `Decision-Id: DEC-0122`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/sql/value_inputs.sql` | modified (+6 −5), unchanged since baseline | T009; AC-23, DAC-E2-11, DAC-E2-S6-1 |
| `src/factorflow/classification/sql/growth_inputs.sql` | modified (+6 −5), unchanged since baseline | T010; AC-23, DAC-E2-11, DAC-E2-S6-1 |
| `src/factorflow/classification/sql/classify.sql` | modified (+23 −8), unchanged since baseline | T011; AC-23, DAC-E2-11, DAC-E2-S6-1, DAC-E2-S6-2 |
| `tests/integration/engine_restatement_support.py` | added (229 lines), unchanged since baseline | T002 |
| `tests/integration/test_engine_restatement.py` | added (644 lines); **changed since baseline** (+28 −6) | T003–T007; TC-COMP-186, 187, 188; cycle-2 strengthens T006 (`:227-281`) and T007 (c) (`:344-395`) for IR-001 |
| `tests/unit/test_restatement_sql_static.py` | added (210 lines), unchanged since baseline | T008 |
| `docs/.../stories/CAP-002-E2-S6.md` | modified (`status: planning` → `in-review`), unchanged since baseline | story-coding bookkeeping; approval revision unchanged |
| `docs/.../stories/CAP-002-E2-S6-tasks.md` | modified; **changed since baseline** (frontmatter only: `updated`, `last_reworked_review: …-v1.md`) | T001–T016 completion state; rework marker |
| `docs/.../stories/CAP-002-E2-S6-tdd-evidence.yaml` | added; **changed since baseline** (cycle-2 appended, header comment) | T016 |
| `docs/.../stories/CAP-002-E2-S6-evidence/` (66 files) | added; 9 of them since baseline (`cycle-2.patch`, `red-cycle-2-rework.log`, `full-suite-cycle-2.log`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json` and its 4 logs) | T016 |
| `docs/.../stories/CAP-002-E2-S6-implementation-review-v1.md` and `-v1-mutation.json` | added (the v1 reviewer's own files, committed by the driver in `2cc906d`) | adversarial-review v1 |

No file outside the plan was touched. These are all unchanged:

- `engine.py`, `constants.py` and `line_items.py`
- `tests/conftest.py` and `pyproject.toml`
- the migrations
- every delivered S2, S3 and S5 test and helper

That satisfies T012 and T015.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-23 | SATISFIED | `value_inputs.sql:29,75,106,168`; `growth_inputs.sql:24,51,69,102`; `classify.sql:84-95,102,115,125`; S3's `statements.sql:21-32` computes `backfilled` per DEC-0056. Append-only: no `UPDATE`/`DELETE` added (`test_research_sql_is_append_only.py` passes) | TC-COMP-186 (`:147-173`), TC-COMP-188 (`:234-281`), the T007 cases (`:287-644`) | The condition "a period already reported before acquisition of that stock began" is now pinned against the rejected own-`observed_on` rule. TC-COMP-188's set-2 quarter is filed after the first observation and before its own, and T007 (c)'s stock D is re-observed on `FIRST + 1` and filed `FIRST`. Both are asserted unmarked. Marking, the any-row rule, the used-rows rule, not-classified rows and retention in history are each tested as in v1 |
| DAC-E2-11 | SATISFIED | As AC-23; momentum is excluded by the single guard at `classify.sql:93` | TC-COMP-186, TC-COMP-187 (`:179-222`), TC-COMP-188 (`:280`), T007 (f) (`:620-644`) | "Precedes the instrument's first fundamentals `observed_on`" is now discriminated (IR-001 resolved). "Never with a momentum classification" is tested on marked momentum inputs |
| DAC-E2-S6-1 | SATISFIED | `value_inputs.sql:168`, `growth_inputs.sql:102`, `classify.sql:102,115,125` | TC-COMP-186; TC-COMP-188 set 2 (`:271-281`); T007 (a)–(e) | A's five inputs and both classifications are marked; B, C and D's are not. A row filed on or after the first observation but before its own observation marks nothing, on value (`:271`, `:364`) and on growth (`:274`, `:364`, `:367`) |
| DAC-E2-S6-2 | SATISFIED | `classify.sql:84-95`: `marks` is empty unless `%(factor)s IN ('value', 'growth')` | TC-COMP-187: A's momentum inputs are inserted `true`, yet its classified momentum row is `false`. T007 (f). T008: one guard, literals `value` and `growth` only | Kills `marks-no-factor-guard`, `marks-guard-admits-momentum` and `marks-guard-value-only` (carried, killed again) |
| DAC-E2-S6-3 | SATISFIED | No `UPDATE`/`DELETE` of `factor_input` or `factor_classification`; each build inserts only its own `set_id`'s rows (`classify.sql:96-136`, `insert_inputs.sql`) | TC-COMP-188: every column of every set-1 classification and input row is unchanged after set 2 (`:262-263`), and set 2 holds its own rows for the same keys (`:265`) | Migration `0006` has no trigger, so no rejected-`UPDATE` test, as planned |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `test_restatement_sql_static.py:22-54` `PARAMETERS_BEFORE` | Unchanged since baseline. The delivered `restated_possible` assertions (S3 `:181,835`, S5 `:541`, `test_research_constraints.py:814-815`) still pass unedited on fixtures with no backfilled row |
| T002 | complete | VERIFIED | `engine_restatement_support.py:30-229` | Unchanged since baseline. Every statement row is written through `add_statement` with both dates explicit |
| T003 | complete | VERIFIED | `test_engine_restatement.py:75-141` (`store`, `build_fixture`, `reobserve`, `assert_column_agrees_with_detail`) | Migrated store, `succeeded` run and `building` set; A–D with bars on `L` |
| T004 | complete | VERIFIED | `test_engine_restatement.py:147-173` | Unchanged since baseline. See Test Quality for why it is now `ADEQUATE` |
| T005 | complete | VERIFIED | `test_engine_restatement.py:179-222` | Classification stage only, floor 3, A's momentum rows marked `true`, plus stock E |
| T006 | complete | VERIFIED | `test_engine_restatement.py:227-281` | Cycle-2 adds the set-2 assertions. A's `book_to_price` is unmarked and its other four inputs are marked (`:271`); B, C and D have no marked input or classification (`:272-275`); every stock's column agrees with its `detail` (`:281`). The set-1 snapshot comparison is unchanged. Still "set 2's own inputs", never compared with set 1 |
| T007 | complete | VERIFIED | `test_engine_restatement.py:287-644` | (a) `:287`, (b) `:323`, (c) `:344`, (d) `:398` and `:559`, (e) `:585`, (f) `:620`, plus the three extra cases at `:430`, `:469` and `:505`. Cycle-2 adds stock D to (c) (`:356-357`, `:364-369`, `:390-395`) |
| T008 | complete | VERIFIED | `test_restatement_sql_static.py:137-210` | Unchanged since baseline; 13 tests pass |
| T009 | complete | VERIFIED | `value_inputs.sql:29,75,106,166-168` | Unchanged since baseline |
| T010 | complete | VERIFIED | `growth_inputs.sql:24,51,69,100-102` | Unchanged since baseline |
| T011 | complete | VERIFIED | `classify.sql:84-95,99-127` | Unchanged since baseline; the retired set keeps `false` (`:135`) |
| T012 | complete | VERIFIED | `git diff --stat d643a52..e406f69` | `engine.py`, `constants.py` and `line_items.py` are unchanged |
| T013 | complete | VERIFIED | Independent reruns | 26 story tests pass. The 192 delivered S2, S3 and S5 tests (9 files plus `test_composite_arithmetic.py` and `test_classification_stage_order.py`) run unedited: 218 passed in all |
| T014 | complete | VERIFIED | Independent Validation below | Every command passes. The S2 safety test and the ship test pass over the edited SQL |
| T015 | complete | VERIFIED | Changed Files table | Each mapped test carries `# Implements TC-COMP-18n` (`:147`, `:179`, `:234`). Each additional test cites its AC or DEC in its docstring, including the extended (c) docstring (`:347-349`) |
| T016 | complete | VERIFIED | `CAP-002-E2-S6-tdd-evidence.yaml` cycle-2 | `tasks: [T006, T007]`, `code_review_verdict: APPROVED`, `drift_detected: false`, `tests_executed: true`, `commit_hash: stage`. Its `diff_sha256` equals the committed diff. The RED log shows both mutants surviving the cycle-1 tests and failing the cycle-2 tests. The TDD lint (`--require-logs`) reports 0 errors |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_statement_filed_before_first_observation_marks_its_inputs_and_classifications` / TC-COMP-186 | ADEQUATE | A's five inputs and both classifications are `true`; B, C and D are `false` on everything; momentum is `false`; each column equals the `or` of its `detail.periods` flags | Its controls are still filed on their own `observed_on`, so on its own it does not separate the two rules. IR-001's remediation accepted moving that discrimination into TC-COMP-188 or T007 (c), and the mutants that made it `WEAK` in v1 are now killed by S6's own tests, so no survivor weakens it |
| `test_momentum_classification_is_never_marked` / TC-COMP-187 | ADEQUATE | A's momentum input rows say `true`, yet its classified momentum row is `false` with a score and a percentile. E's `input_missing` momentum row is `false`. B, C and D are `false` | none |
| `test_a_later_set_leaves_the_earlier_sets_mark_unchanged` / TC-COMP-188 | ADEQUATE | Every column of every set-1 classification and input row is compared before and after set 2. Set 2's own marks are pinned: P0, filed 2027-01-05 (after `FIRST`) and observed 2027-01-10, marks nothing. Column and `detail` agree for every stock | none. It kills both IR-001 mutants and the `statements.sql` variant |
| `test_only_the_rows_an_input_reads_mark_it` / T007 (a) | ADEQUATE | An unused ninth quarter marks nothing; the oldest prior-year quarter marks only growth; the oldest trailing quarter marks `earnings_yield` and growth | none |
| `test_one_backfilled_row_marks_only_the_inputs_that_read_it` / T007 (b) | ADEQUATE | Only `fcf_yield` is marked; value is `true`, growth and momentum `false` | none |
| `test_filing_date_boundary_and_null_filing_date` / T007 (c) | ADEQUATE | A row filed on the first observation is not backfilled; one filed a day earlier is; a null filing date is not. Cycle-2 adds D, re-observed on `FIRST + 1` and filed on `FIRST`: all five inputs and both classifications are `false`, column and `detail` agree for A–D, and the `detail` shows the later observation was read | none. Run alone, it kills both IR-001 mutants and the `statements.sql` variant (probe below) |
| `test_a_not_classified_row_for_a_missing_input_carries_the_mark` / T007 (d) | ADEQUATE | `fcf_yield` missing with no period listed; the value row is `input_missing` on `fcf_yield` and still `true` | none |
| `test_a_factor_whose_inputs_are_all_missing_is_not_marked` | ADEQUATE | Both growth inputs are missing although they read backfilled rows; they and the growth row are `false` | none |
| `test_outdated_inputs_and_their_not_classified_rows_carry_the_mark` | ADEQUATE | Five outdated, backfilled inputs are marked, as are both `input_outdated` rows | none |
| `test_not_computable_inputs_and_their_not_classified_rows_carry_the_mark` | ADEQUATE | `not_computable` inputs are marked exactly where they list a backfilled row, as are both `input_not_computable` rows | none |
| `test_unranked_rows_carry_the_mark_and_retired_rows_never_do` / T007 (d) | ADEQUATE | At floor 5, only A's value and growth `not_enough_stocks` rows are `true`; a retired, backfilled stock is `false` on all three factors | none |
| `test_the_mark_changes_no_score_or_reason` / T007 (e) | ADEQUATE | `status`, `score`, `percentile` and the three reason columns are identical across the backfilled and null-filed sets; only the mark differs | none |
| `test_a_marked_momentum_input_alone_marks_nothing` / T007 (f) | ADEQUATE | A's marked momentum rows reach none of its three classifications | none |
| `tests/unit/test_restatement_sql_static.py` (13 tests) / T008 | ADEQUATE | Detector self-tests; `bool_or(backfilled)` in both input files; no constant `false` row set except `retired`; one guard naming only `value` and `growth`; no new placeholder | none |
| Delivered S2/S3/S5 regression set (192 tests, unedited) | ADEQUATE | Rerun over the edited SQL | none |

The tests are deterministic. They use fixed dates and module-local migrated stores, and nothing reads the clock or the network. The new set-2 and stock-D rows go through `add_statement` with both dates explicit and `observed_on` no earlier than `FIRST`, as T002 requires.

**Mutation (E.9).**

- **Generation.** I regenerated the catalogue over `d643a52..HEAD`: 18 mutants (13 off-by-one, 5 negate-boolean), each identical to v1's.
- **My own mutants.** I added 3:
  - `manual:review2-statements-own-observed-rule`, the rejected rule written into `statements.sql:32`, where it would change both the column and `detail`;
  - `manual:review2-value-either-rule` and `manual:review2-growth-either-rule`, each marking a row under either rule.
- **Scope.** `mutation-run.py scope --since a46dbff… --previous …-v1-mutation.json` added v1's other 36 mutants. It tagged 54 `carried` (every mutant v1 ran) and my 3 `late`. No production line changed since the baseline, so none is `delta`.
- **Run.** The run used the same 9 focused files as v1. Result: 40 killed, 17 survived.

| Survivor(s) | Scope | Count | Disposition |
|-------------|-------|-------|-------------|
| Catalogue mutants at `classify.sql:86,87,99,100`, `growth_inputs.sql:101` and `value_inputs.sql:167` | carried | 15 | **Equivalent.** Every one of these lines is a `--` comment. PostgreSQL discards comments, and the static test strips them before matching (`test_restatement_sql_static.py:62-64`, `code()`). No `||`, `{}` or `format(` can enter through them, so the S2 safety scan sees the same text. No artifact specifies comment wording |
| `manual:marks-no-roster-join` | carried | 1 | **Equivalent.** `marks` is only `LEFT JOIN`ed onto row sets whose ids already come from `active`: `ranked_scores` (via `peer_ids JOIN active`, `:29-70`), `first_gap` (`FROM active`, `:71-83`) and `active` itself (`:126`). A non-roster stock's mark is never read, so no stored row can differ in any state. DEC-0119's roster bound still holds for every row written |
| `manual:review-marks-non-missing-only` | carried | 1 | **Equivalent.** DEC-0122 marks an input over the rows its `detail.periods` lists, and a missing input lists none. `value_inputs.sql:168` and `growth_inputs.sql:102` write `false` for every missing input. Filtering out missing rows therefore drops only `false` values, and an all-filtered stock coalesces to `false`. Momentum never reaches `marks`. No state the contract allows differs |

Killed:

- **IR-001's two mutants.** `manual:review-value-own-observed-rule` fails at `test_engine_restatement.py:271`, and `manual:review-growth-own-observed-rule` at `:274`. Both are TC-COMP-188, which runs first under `-x`, before any S3 test.
- **My 3 late mutants.** All 3 are killed by TC-COMP-188 as well.
- **The rest.** The other 35 carried mutants are killed, as they were in v1.

A separate probe ran T007 (c) alone, using `--only` on the two IR-001 mutants and the `statements.sql` variant. It killed all 3, so both strengthened tests discriminate on their own.

## Independent Validation

`<component>` = `repos/factorflow-v2/FactorFlow-v2`. Commands that need Docker, the uv cache or npm ran outside the sandbox as single plain calls, with `--directory` or `--prefix` pointing at the component. Nothing was excluded.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run --directory <component> --offline pytest -p no:cacheprovider -q -m "postgres or not postgres" tests/integration/test_engine_restatement.py tests/unit/test_restatement_sql_static.py` | harness root | 0 | PASS (focused) | 26 passed, 3.80 s |
| `uv run --directory <component> --offline pytest -p no:cacheprovider -q -m "postgres or not postgres" <the 2 story files and the 11 delivered S2/S3/S5 files of T013/T014>` | harness root | 0 | PASS (focused, T013) | 218 passed, 14.66 s (26 story and 192 delivered) |
| `uv sync --all-extras --directory <component>` | harness root | 0 | PASS (required) | Resolved 46, checked 43 packages |
| `uv build --directory <component>` | harness root | 0 | PASS (required) | sdist and wheel built; `classify.sql`, `value_inputs.sql` and `growth_inputs.sql` copied into the wheel |
| `uv run --directory <component> pytest -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1638 passed, 1 xfailed, 358.25 s (matches `full-suite-cycle-2.log`) |
| `uv run --directory <component> pytest -m postgres -q -p no:cacheprovider` | harness root | 0 | PASS (required, story) | 543 passed, 1096 deselected, 261.91 s |
| `uv run --directory <component> pytest -m "not postgres" -q -p no:cacheprovider` | harness root | 0 | PASS (required) | 1095 passed, 543 deselected, 1 xfailed, 25.22 s |
| `uv run --directory <component> --offline ruff check .` | harness root | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --offline ruff format --check .` | harness root | 0 | PASS (required) | 241 files already formatted |
| `uv run --directory <component> --offline mypy src` | harness root | 0 | PASS (required) | No issues in 56 source files |
| `npm ci --prefix <component>` | harness root | 0 | PASS (required) | 250 packages added. Its audit notice (10 vulnerabilities) predates this story, which changes no package |
| `npm run build --prefix <component>` | harness root | 0 | PASS (required) | Vite build, 63 modules |
| `npm run test --prefix <component>` | harness root | 0 | PASS (required) | 50 files, 950 tests |
| `npm run test:e2e --prefix <component>` | harness root | 0 | PASS (required) | 18 passed (2.9 min). The `posttest:e2e` hook removed `factorflow-e2e-postgres` |
| `npm run lint --prefix <component>` | harness root | 1 | PASS (environment note) | `Checked 123 files`, `Found 120 errors`. The 6 files beyond the 117 tracked ones are git-ignored Vite bundles in `build/lib/factorflow/api/static/assets/` (`.gitignore:12: build/`). `uv build` copies them there, and `biome.json` does not ignore `build/`. Every diagnostic is in one of them. Rerun over tracked files (`git ls-files -z \| xargs -0 npx biome lint --no-errors-on-unmatched --files-ignore-unknown=true`): 117 files checked, exit 0 |
| `npm run format --prefix <component>` | harness root | 1 | PASS (environment note) | `Checked 123 files`, `Found 6 errors`, one in each of the 6 git-ignored `build/lib/.../index-*.js` bundles. The same tracked-files rerun with `biome format`: 117 files checked, exit 0 |
| `npx --prefix <component> tsc --noEmit -p <component>` | harness root | 0 | PASS (required) | No output |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/docs/.../CAP-002-E2-S6-tdd-evidence.yaml --repo-dir <component> --base d643a52a339fc8c49406851e64e3aa0a6470c968 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider tests/integration/test_engine_restatement.py tests/unit/test_restatement_sql_static.py tests/integration/test_engine_inputs_fundamentals.py tests/integration/test_engine_peer_set.py tests/unit/test_classify_sql_static.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_sql_ships.py tests/unit/test_research_sql_is_append_only.py tests/integration/test_engine_transaction.py' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 3 | PASS (E.9) | 57 mutants: 40 killed and 17 survived, every survivor carried and equivalent. All 4 baselines passed. Ran 00:53:49Z to 00:56:25Z on `e406f69` with an empty tree patch. Results sha256 `f94010e95b19313d0b249229c3ec83204ff0c889d9e5802a27e3ecbf55b794f9`, copied beside this report as `CAP-002-E2-S6-implementation-review-v2-mutation.json`. Exit 3 is the runner's "survivors exist" code |
| `python3 scripts/mutation-run.py run … --only manual:review-value-own-observed-rule --only manual:review-growth-own-observed-rule --only manual:review2-statements-own-observed-rule --jobs 3 --command '… pytest … tests/integration/test_engine_restatement.py::test_filing_date_boundary_and_null_filing_date' …` | harness root | 0 | PASS (probe) | 3 killed by T007 (c) alone. Results sha256 `5ad6c692…5567`, kept in the scratchpad (not a gate artifact) |

Two counts cover the same database tests. The full Python suite includes the 543 PostgreSQL tests, and the story's own `-m postgres` command also runs them. Both were run; neither stands in for the other.

### Validation Side Effects

- Before: HEAD `e406f69`; `git status --porcelain=v1 --untracked-files=all` empty; `code-revision` `sha256:6af44bbb…7bff7`.
- After: HEAD `e406f69`; `git status` empty before this report was written; `code-revision` unchanged at `sha256:6af44bbb…7bff7`. Only git-ignored products were regenerated: `build/`, `dist/`, `src/factorflow.egg-info/`, `src/factorflow/api/static/`, `node_modules/`, `test-results/` and the tool caches. This report and its `-mutation.json` are under `docs/`, which the fingerprint excludes.
- Unexpected tracked-file changes: none.

## Findings

No findings.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | v1 asked S6's own tests to kill both own-observed mutants. They do. `manual:review-value-own-observed-rule` fails TC-COMP-188 at `test_engine_restatement.py:271` (A's set-2 `book_to_price` `true`), and `manual:review-growth-own-observed-rule` fails it at `:274` (B's set-2 growth inputs `true`). Both failures come before any S3 test under `-x`. Run alone, T007 (c) also kills both, and kills the rule written into `statements.sql`. The rework uses two of the three remedies IR-001 listed: set-2 assertions plus `assert_column_agrees_with_detail` in TC-COMP-188 (`:267-281`), and a new T007 (c) case (`:356-395`). No assertion was removed or weakened. `git diff --numstat a46dbff..e406f69 -- tests` shows 28 lines added and 6 removed. The 6 removed lines are two comments (`P0_FILED`'s and set 2's), the (c) docstring, the (c) unpacking, and two comprehensions, each rewritten to include D. Cycle-2 was recorded as a new TDD cycle, as required |

## Scope and Plan Deviations

- **Justified deviations.** v1 accepted six cycle-1 deviations, and they are unchanged. Cycle-2 adds three:
  1. T007 (c) gains a fourth stock D, which writes two statement rows outside `add_fundamentals`. T002 lists such rows as examples, not as a closed list. D's rows follow T002's rule: both dates are explicit and `observed_on` is no earlier than `FIRST`. IR-001's remediation named this case.
  2. TC-COMP-188 now pins set 2's marks to the values DEC-0056 gives. That is still "whatever set 2's own inputs give" (T006), and it is never compared with set 1.
  3. TC-COMP-186 is unchanged. IR-001 allowed the discrimination to live in TC-COMP-188 or T007 (c).
- **Bookkeeping.**
  - Every checked task has evidence, and no unchecked task appears implemented.
  - The task plan's only rework edit is frontmatter (`updated`, `last_reworked_review`).
  - The story's approval revision is intact.
  - The cycle-2 `green_evidence` says the tech-stack validation counts "are in the completion summary", which is not in the repository. Its pytest evidence (`full-suite-cycle-2.log`) is present and hash-checked. This review reran every tech-stack command itself, above, so nothing rests on that summary.
- **Out-of-scope changes.** None.
- **Decision records.**
  - DEC-0056, DEC-0119 and DEC-0122 are each `owner_reviewed: true`, `owner_verdict: upheld`, `status: applied`, and the code follows each one.
  - The rework commit cites DEC-0056 and DEC-0122 by trailer.
  - The untracked harness records DEC-0241 to DEC-0243 are scoped to CAP-002-E2-S4 and do not bear on this story.
  - No decision was the owner's to make here, and none was recorded.
- **Carried observations, not findings.** Both are as v1 and the rework commit describe them:
  - Factor-engine design 2.4 marks an input when "any statement row used" is backfilled. DEC-0122 narrows that to the rows its `detail` lists. This belongs in the design revision already named in the plan's Open Gaps.
  - `biome.json` ignores `dist/**` but not `build/**`. That is the cause of the `npm run lint` and `npm run format` environment notes, and it predates this story.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E2-S6 against `CAP-002-E2-S6-tasks.md` and this report. Commit this report and `CAP-002-E2-S6-implementation-review-v2-mutation.json` to the branch first, because the doc-sync stage reads the committed review.
- **Warnings accepted downstream**: N/A
