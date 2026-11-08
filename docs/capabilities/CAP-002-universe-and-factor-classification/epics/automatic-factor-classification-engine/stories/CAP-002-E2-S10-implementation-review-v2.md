---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S10-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-002-E2-S10"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-08T01:00:10Z"
reviewed_head: "c1f79d49177f84c721839ac162e077fbdd7c211f"
review_base: "829c9e1684c19f61ca015a82f6853fe769be4b26"
reviewed_state_revision: "sha256:bbe1e3935c1ff184d14ab7dc544ef71adb9cdc7b64e0a0c845931569cf2adb7d"
verdict: PASS
review_subjects:
  - artifact_id: CAP-002-E2-S10
    artifact_version: 1
    content_revision: sha256:408cc3f38d71a1fd4886db8ce0217d9b2d3165ee26490d2af6c2083001c3b444
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T01:00:10Z
  source_artifacts:
    - id: CAP-002-E2-S10
      version: "1 (sha256:408cc3f38d71a1fd4886db8ce0217d9b2d3165ee26490d2af6c2083001c3b444)"
    - id: CAP-002-E2-S10-tasks
      version: "1 (last_reworked_review v1)"
    - id: CAP-002-E2-S10-tdd-evidence
      version: "cycle-2"
    - id: CAP-002-E2-S10-implementation-review
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "4"
    - id: CAP-002-system-design
      version: "5"
    - id: CAP-002-factor-engine-component-tests
      version: "2"
    - id: DEC-0397
      version: "open, owner 2026-11-07"
    - id: DEC-0398
      version: "open, owner 2026-11-07"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S10 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 6/6 passed (`pytest -m postgres`, `pytest -m 'not postgres'`, `ruff check`, `ruff format --check`, `mypy src`, `uv build`) |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 0**

v1's only finding, IR-001, is resolved. The rework adds one test,
`test_an_uncovered_stock_with_a_stale_latest_bar_is_missing_not_outdated`, and
changes no production line. Its uncovered stock has every boundary bar but a
latest bar dated 2026-10-15, before the latest trading day of 2026-10-16. The
test asserts:

- each momentum input is `missing`, with a null value and `known_on` and
  `as_of` equal to `E`;
- the whole not-covered `detail` matches, with `corporate_actions_coverage = []`;
- `last_acquisition` names `corporate_actions` with outcome `failed`;
- after a full build, the stock is `not_classified` on momentum with reason
  `input_missing` (not `input_outdated`) naming `return_3m`.

This review re-ran v1's mutants under the new test. The mutant v1 reported
surviving, `manual:review-outdated-before-not-covered`, is now killed, and the
new test is the one that fails. The 16 survivors are v1's 16 equivalents. A new
late mutant is killed too. Every required command passes on the reviewed bytes:
970 postgres and 1659 other tests, plus ruff, mypy and the build. The
TDD-evidence lint is clean.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S10` |
| HEAD | `c1f79d49177f84c721839ac162e077fbdd7c211f` |
| Review base | `pipeline-state.py review-base` → `829c9e1684c19f61ca015a82f6853fe769be4b26` (merge base with `origin/main`, an ancestor of HEAD) |
| Working tree | Clean before and after validation |
| Changed files reviewed | 134 since the base (121 added, 13 modified). Of these, 5 non-evidence files changed since the baseline: one test module, the task plan, the TDD evidence, and the v1 report with its mutation results. There are also 59 new cycle-2 files under `CAP-002-E2-S10-evidence/` |
| Baseline | v1 (`CAP-002-E2-S10-implementation-review-v1.md`, CHANGES-REQUIRED), `reviewed_head` `5fbcd6bc0d2c8690702b9bfc3b7b3e10b02a78a2`, mutation results `CAP-002-E2-S10-implementation-review-v1-mutation.json` |

Commits since the baseline:

| Commit | Content |
|--------|---------|
| `5ba778c` | Review v1 |
| `cce88c9` | The IR-001 test, test only |
| `c1f79d4` | Cycle-2 TDD evidence, the task plan's rework note and `last_reworked_review` |

`git diff 5fbcd6b..HEAD -- src/` is empty, so no production line changed since
the baseline. Approval of the story, factor-engine design v4 and system design
v5 is still current: `artifact-gate.py require` passed for each.

### Changed Files

Since the baseline, `git diff 5fbcd6b..HEAD`:

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `tests/integration/test_engine_inputs_momentum.py` | modified (+40) | IR-001; T004 (TC-COMP-381); DAC-E2-13, DAC-E2-S10-1 |
| `docs/capabilities/.../stories/CAP-002-E2-S10-tasks.md` | modified | `updated`, `last_reworked_review`, and an Implementation Notes line recording the rework |
| `docs/capabilities/.../stories/CAP-002-E2-S10-tdd-evidence.yaml` | modified | T015, cycle-2 |
| `docs/capabilities/.../stories/CAP-002-E2-S10-evidence/` (59 cycle-2 files: `cycle-2.patch`, RED, GREEN and full-suite logs, mutants and mutation results with per-mutant logs) | added | T015 evidence for cycle-2 |
| `docs/capabilities/.../stories/CAP-002-E2-S10-implementation-review-v1.md`, `-v1-mutation.json` | added | Review v1, the baseline |

The rest of the change set (`829c9e1..5fbcd6b`) is unchanged since v1, and v1's
Changed Files table still applies. No changed file lacks a justification.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `momentum_inputs.sql:58-64`, `:246-250`, `:268-270` | `test_a_covered_window_without_actions_gives_the_price_return_and_names_its_segment`; delivered split/dividend tests over the default segment | Unchanged since v1 |
| AC-12 | SATISFIED | `momentum_inputs.sql:246-247`, `:283-287`, `:309-314`; `insert_inputs.sql` | `test_a_stock_without_corporate_actions_coverage_is_not_classified_on_momentum`; `test_an_uncovered_stock_with_a_stale_latest_bar_is_missing_not_outdated` (reason `input_missing` naming `return_3m`) | The stale case now names the missing input, not an outdated one |
| DAC-E2-1 | SATISFIED | Adjustment arithmetic unchanged (`:77-228`) | Delivered momentum suite; 970 postgres pass | Unchanged since v1 |
| DAC-E2-13 | SATISFIED | `momentum_inputs.sql:62-63` (probe), `:246` (not covered → `missing` ahead of `outdated`) | TC-COMP-381 (three tests, including `test_an_uncovered_stock_with_a_stale_latest_bar_is_missing_not_outdated` at `test_engine_inputs_momentum.py:1659-1696`), 383, 384, 385 | v1 was PARTIAL on the unpinned stale branch. It is now pinned: the new test kills `manual:review-outdated-before-not-covered` |
| DAC-E2-S10-1 | SATISFIED | `:246-247`, `:274`, `:283-287` | `test_a_stock_without_corporate_actions_coverage_has_every_momentum_input_missing`, `test_a_stock_without_corporate_actions_coverage_is_not_classified_on_momentum`, `test_an_uncovered_stock_with_a_stale_latest_bar_is_missing_not_outdated` | |
| DAC-E2-S10-2 | SATISFIED | `:310` | `test_a_momentum_input_missing_coverage_names_the_corporate_actions_acquisition`; the new test asserts the same on a stale stock | |
| DAC-E2-S10-3 | SATISFIED | `:62-63` | `test_coverage_must_contain_the_window_with_both_bounds_inclusive`, `test_coverage_bounds_are_the_resolved_bars_not_their_targets` | Unchanged since v1. The new late mutant (probe end bound on the latest bar) is killed by `[exact-12]` |
| DAC-E2-S10-4 | SATISFIED | `:258-260`, `:297-303` | `test_a_covered_window_without_actions_gives_the_price_return_and_names_its_segment` | Unchanged since v1 |
| DAC-E2-S10-5 | SATISFIED | `:277-287`, `:309-314` | `test_a_missing_boundary_ranks_before_coverage_and_coverage_before_price_and_payload` | Unchanged since v1 |
| DAC-E2-S10-6 | SATISFIED | Seeds `engine_support.py:38-63`, `engine_proof_support.py:122-131`, `:264-268` | The two named expectations (`:189`, `:966`); `test_value_and_growth_inputs_do_not_depend_on_corporate_actions_coverage`; full postgres run including volume, latency and integration builds | The rework touches no delivered test |
| DAC-E2-S10-7 | SATISFIED | No runner change | `test_runner_acquires.py` TC-COMP-387 guard (5 cases) | Unchanged since v1; passes |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | As v1 | Unchanged |
| T002 | complete | VERIFIED | `tests/integration/engine_support.py:38-63` | Unchanged |
| T003 | complete | VERIFIED | `tests/integration/engine_proof_support.py:122-131`, `:264-268` | Unchanged |
| T004 | complete | VERIFIED | `test_engine_inputs_momentum.py:1594-1696` (three TC-COMP-381 tests) | IR-001's stale case added in `cce88c9` and recorded in the plan's Implementation Notes |
| T005 | complete | VERIFIED | `:1699-1715` | Shifted by the inserted test; content unchanged |
| T006 | complete | VERIFIED | `:1718-1792` (parametrized cases and the resolved-bar case) | Content unchanged |
| T007 | complete | VERIFIED | `:1795-1822` | Content unchanged |
| T008 | complete | VERIFIED | `:1825-1864` | Content unchanged |
| T009 | complete | VERIFIED | `:189`, `:966` | Unchanged |
| T010 | complete | VERIFIED | `:1867-1899` | Content unchanged |
| T011 | complete | VERIFIED | `tests/integration/test_runner_acquires.py:220-320` | Unchanged |
| T012 | complete | VERIFIED | `src/factorflow/classification/sql/momentum_inputs.sql`, unchanged since v1 | |
| T013 | complete | VERIFIED | Independent full runs: 970 postgres, 1659 non-postgres | |
| T014 | complete | VERIFIED | 11 `# Implements TC-COMP-38x` markers in the momentum module (the new test carries `TC-COMP-381`) and 2 in `test_runner_acquires.py`. The new docstring cites DAC-E2-13, DAC-E2-S10-1, DEC-0397, DEC-0116 (1) and IR-001 | |
| T015 | complete | VERIFIED | `CAP-002-E2-S10-tdd-evidence.yaml` cycle-2: `commit_hash` `cce88c9`, `diff_sha256`, `reviewed_patch` `cycle-2.patch`, fresh code review APPROVED, spec drift false, a RED against the v1 survivor with an unmutated control, and the mutation block. `check-tdd-evidence.py --require-logs` exits 0 | |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_a_stock_without_corporate_actions_coverage_has_every_momentum_input_missing`, `test_a_stock_without_corporate_actions_coverage_is_not_classified_on_momentum`, `test_an_uncovered_stock_with_a_stale_latest_bar_is_missing_not_outdated` / TC-COMP-381 | ADEQUATE | The new test builds a stale, uncovered stock with distinct `prices` and `corporate_actions` outcomes, using every stage and two covered peers. For each input it asserts status, value, `known_on`, `as_of` and the whole `detail` without `last_acquisition`, and separately that `last_acquisition` names `corporate_actions`/`failed` with its timestamp. It also asserts the classification triple. With the v1 mutant applied it fails on `'outdated' == 'missing'` (the coder's `red-cycle-2-ir-001.log` and this review's mutant log). The unmutated control passes | none. It reads three classification columns; the sibling test checks `reason_detail`, score and percentile |
| TC-COMP-382 to TC-COMP-387 tests | ADEQUATE | Unchanged since v1, where each was judged ADEQUATE; all killed mutants stay killed | none |

**Mutation, re-run against the baseline.**

- `mutation-run.py generate --range 829c9e1..HEAD --cycle review-v2` produced
  the same 20 mutants as v1, since there is no production change.
- Added to those: v1's 30 manual mutants (the coder's 17 and v1's 13, re-tagged
  for this cycle) and one new one,
  `manual:review-v2-probe-end-on-latest-session`, which reads the probe's end
  bound from the latest bar instead of `E`.
- `mutation-run.py scope --since 5fbcd6b --previous
  CAP-002-E2-S10-implementation-review-v1-mutation.json` tagged 50 mutants
  `carried` and the new one `late`. No previous mutant had stopped applying.
- The run used the plan's focused command and `--jobs 4`. All four baselines
  passed.

| Scope | Mutants | Killed | Survived |
|-------|---------|--------|----------|
| carried | 50 | 34 | 16 |
| late | 1 | 1 | 0 |
| **Total** | **51** | **35** | **16** |

The 16 survivors are v1's equivalents, unchanged:

- 15 mutate text inside `--` comments, at lines 9, 10 (x3), 56, 237 (x4), 238,
  239 (x2), 306 and 308 (x2). PostgreSQL never executes comment text, and no
  artifact specifies its wording.
- `:64:off-by-one:1` changes `LIMIT 1` to `LIMIT 2`. `coverage_no_overlap` in
  `0003_coverage.sql` means no two segments of one instrument and data type can
  both contain the non-empty window `[S_k + 1, E]`.

`manual:review-outdated-before-not-covered` is killed by
`test_an_uncovered_stock_with_a_stale_latest_bar_is_missing_not_outdated` (log:
1 failed, 81 passed under `-x`). The late mutant is killed by
`test_coverage_must_contain_the_window_with_both_bounds_inclusive[exact-12]`.

These figures match the coder's cycle-2 claim of 34 killed and 16 equivalent
survivors over the same 50 mutants; the 35th kill is this review's new late
mutant. Results are in `CAP-002-E2-S10-implementation-review-v2-mutation.json`,
beside this report.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | `PASSED - proceed with the skill workflow.` |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10.md --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `829c9e1684c19f61ca015a82f6853fe769be4b26` |
| `python3 scripts/artifact-gate.py require --project factorflow-v2 --artifact` for the story, factor-engine design and system design | harness root | 0, 0, 0 | PASS | All three `passed (owner-allowed)` |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 829c9e1684c19f61ca015a82f6853fe769be4b26 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS | `970 passed, 1659 deselected, 2 warnings in 414.20s` (slow volume and latency tests included) |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest -m "not postgres" -q -p no:cacheprovider` | component | 0 | PASS | `1659 passed, 970 deselected, 2 warnings in 25.41s` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline ruff check .` | component | 0 | PASS | `All checks passed!` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline ruff format --check .` | component | 0 | PASS | `285 files already formatted` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline mypy src` | component | 0 | PASS | `Success: no issues found in 61 source files` |
| `uv build --directory repos/factorflow-v2/FactorFlow-v2 --offline --out-dir /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/dist2` | component | 0 | PASS | sdist and wheel built |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 829c9e1684c19f61ca015a82f6853fe769be4b26..HEAD --cycle review-v2 --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/mut2/mutants.json` | harness root | 0 | PASS | 20 generated |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/mut2/mutants.json --since 5fbcd6bc0d2c8690702b9bfc3b7b3e10b02a78a2 --previous repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10-implementation-review-v1-mutation.json --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/mut2/mutants-scoped.json` | harness root | 0 | PASS | 50 carried, 1 late |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/mut2/mutants-scoped.json --jobs 4 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider tests/integration/test_engine_inputs_momentum.py tests/integration/test_runner_acquires.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_sql_ships.py tests/unit/test_classification_stage_order.py tests/unit/test_sql_is_append_only.py' --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/mut2/results.json` | harness root | 3 | PASS | 51 mutants: 35 killed, 16 survived, all 16 equivalent. Exit code 3 is the runner's signal that survivors exist |
| `npm ci`, `npm run build`, `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | component | N/A | NOT RUN | Not applicable: no TypeScript, web or e2e file in the change set, and the story and plan validation lists name only the Python commands |
| `npm run test:e2e` | component | N/A | NOT RUN | Needs the running acquisition stack, which this review must not touch; no e2e file changed |

The Python commands ran outside the Bash sandbox, as in v1: the sandbox refuses
the `uv` cache, and testcontainers needs the Docker socket. Each test run
started its own `postgres:16` container; no production container or port was
used.

### Validation Side Effects

- Before: `git status --porcelain=v1 --untracked-files=all` empty at `c1f79d4`.
- After: empty at `c1f79d4`. `uv build` rewrote the git-ignored
  `src/factorflow.egg-info/`, and the mutation run worked in clones under
  `$TMPDIR`.
- Unexpected tracked-file changes: none.

## Findings

No findings.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `cce88c9` adds `test_an_uncovered_stock_with_a_stale_latest_bar_is_missing_not_outdated` (`test_engine_inputs_momentum.py:1659-1696`), meeting every item of v1's required remediation: a stale uncovered stock; all three inputs `missing` and `corporate_actions_not_covered`; null `known_on`; `last_acquisition` naming `corporate_actions` with an `acquisition_state` row present. In this review's run, `manual:review-outdated-before-not-covered` is killed by that test. With no mutant applied, the test passes in the 970-test postgres run. `git diff 5fbcd6b..HEAD -- src/` is empty, as v1 required |

## Scope and Plan Deviations

- **Rework scope.** Test only, as v1 asked. The task plan records the rework in
  its Implementation Notes and in `last_reworked_review`. The TDD evidence adds
  cycle-2 with fresh independent reviews.
- **The new test's precondition.** It goes beyond TC-COMP-381's literal
  precondition by making the latest bar stale. That is exactly the case IR-001
  asked for, and DAC-E2-13 and DEC-0397 specify it. It uses the same peer-set
  floor of 2, already accepted in v1.
- v1's other deviation judgements stand unchanged: the `LEFT JOIN LATERAL`
  probe, the floor of 2, the resolved-bar test, the runner guard's `unchanged`
  assertion, and TC-COMP-384's second stock. Doc sync should describe the probe
  as written, not as the story's `EXISTS` sketch.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`)
- **Required action**: Synchronise `docs/reference/classification-engine.md` with
  the implemented behaviour, as the story's Technical Details assign to doc sync:
  - the cause `corporate_actions_not_covered` and its `detail`;
  - `corporate_actions_covered_by` on present and outdated inputs;
  - the per-cause data type;
  - the cause order;
  - the containing-segment probe as written.
- **Warnings accepted downstream**: N/A
