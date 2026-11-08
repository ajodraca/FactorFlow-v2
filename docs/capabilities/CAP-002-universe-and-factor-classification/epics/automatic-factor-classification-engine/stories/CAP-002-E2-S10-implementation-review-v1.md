---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S10-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-002-E2-S10"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-08T00:26:31Z"
reviewed_head: "5fbcd6bc0d2c8690702b9bfc3b7b3e10b02a78a2"
review_base: "829c9e1684c19f61ca015a82f6853fe769be4b26"
reviewed_state_revision: "sha256:44e672706471bfc7fac224ef09cdc6b7dc14f475fce03b1ae22eb41944ce7013"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-08T00:26:31Z
  source_artifacts:
    - id: CAP-002-E2-S10
      version: "1 (sha256:408cc3f38d71a1fd4886db8ce0217d9b2d3165ee26490d2af6c2083001c3b444)"
    - id: CAP-002-E2-S10-tasks
      version: "1"
    - id: CAP-002-E2-S10-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-component-design-factor-engine
      version: "4"
    - id: CAP-002-system-design
      version: "5"
    - id: CAP-002-factor-engine-component-tests
      version: "2"
    - id: CAP-002-coverage-matrix
      version: "current at 5fbcd6b"
    - id: DEC-0397
      version: "open, owner 2026-11-07"
    - id: DEC-0398
      version: "open, owner 2026-11-07"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E2-S10 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 10/11 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 6/6 passed (`pytest -m postgres`, `pytest -m 'not postgres'`, `ruff check`, `ruff format --check`, `mypy src`, `uv build`) |

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0 · **total 1**

The production change is correct. `momentum_inputs.sql` computes a momentum
input only when one `corporate_actions` segment contains `(S_k, E]` with both
bounds inclusive on the resolved bars. Otherwise the input is `missing`,
`corporate_actions_not_covered`, with the whole `detail` DEC-0397 names, a null
value and `known_on`, and `missing_data_type = 'corporate_actions'`. The cause
order and the per-cause data types are design 2.4's. Every required validation
command passes on the reviewed bytes: 969 postgres tests, including the slow
volume and latency builds; 1659 other tests; ruff check, ruff format, mypy and
`uv build`. The RED reproduces: 15 failed and 84 passed against the delivered
SQL. The TDD-evidence lint is clean.

The gate fails on one test gap. One mutant changes contract-specified
behaviour and survives the story's suites, and the full suite cannot kill it
either: a stock with no corporate-actions coverage whose latest bar precedes
the latest trading day becomes `outdated` instead of `missing` (IR-001).
DEC-0397, design 2.4 and DAC-E2-13 all say such an input is `missing`. No test
builds a stale, uncovered stock, so the "missing before outdated" rule
(DEC-0116 (1)) is unpinned for the new cause. Under the skill's rule E.9 that
makes TC-COMP-381 `WEAK`, and so HIGH.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E2-S10` |
| HEAD | `5fbcd6bc0d2c8690702b9bfc3b7b3e10b02a78a2` |
| Review base | `pipeline-state.py review-base` → `829c9e1684c19f61ca015a82f6853fe769be4b26` (merge base with `origin/main`; ancestor of HEAD, checked with `git merge-base --is-ancestor`) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 71 (58 added, 13 modified), committed `829c9e1..5fbcd6b` |
| Baseline | none: initial review |

The range holds two groups of commits. The lane's design, review and approval
commits are `b8ee5fe..c643f65`. The story's own commits are `600f0c0` (plan),
`3e654db` (RED), `3601396` (GREEN) and `5fbcd6b` (evidence, ticked tasks and
story status). Approval of the story, factor-engine design v4 and system design
v5 is current: `scripts/artifact-gate.py require` passed for each.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/sql/momentum_inputs.sql` | modified | DAC-E2-13, DAC-E2-S10-1 to -5; T012 |
| `tests/integration/engine_support.py` | modified | DAC-E2-S10-6; T002 |
| `tests/integration/engine_proof_support.py` | modified | DAC-E2-S10-6; T003 |
| `tests/integration/test_engine_inputs_momentum.py` | modified | DAC-E2-S10-1 to -6; T004 to T010 |
| `tests/integration/test_runner_acquires.py` | modified | DAC-E2-S10-7; T011 |
| `docs/capabilities/.../stories/CAP-002-E2-S10.md` | added | The story (`10ae0a8`, `3ac62ad`, approved `c643f65`); status `todo` → `in-review` at `5fbcd6b` (a mutable gate field) |
| `docs/capabilities/.../stories/CAP-002-E2-S10-tasks.md` | added | Task plan (`600f0c0`), ticked at `5fbcd6b` |
| `docs/capabilities/.../stories/CAP-002-E2-S10-tdd-evidence.yaml` | added | T015 |
| `docs/capabilities/.../stories/CAP-002-E2-S10-evidence/` (52 files: RED, GREEN and full-suite logs, `cycle-1.patch`, mutants, mutation results and per-mutant logs) | added | T015 evidence |
| `docs/capabilities/.../design/component-design-factor-engine.md` | modified | Upstream lane artifact v4 (DEC-0397, DEC-0398); approved on specification review v8 |
| `docs/capabilities/.../design/system-design.md` | modified | Upstream lane artifact v5; approved on specification review v8 |
| `docs/capabilities/.../specifications-review-report-v6.md`, `-v7.md`, `-v8.md` | added | Specification-review evidence for the lane |
| `docs/capabilities/.../backlog-review-report-v6.md`, `-v7.md` | added | Backlog-review evidence for the story |
| `docs/capabilities/.../backlog.md`, `dependencies.yaml`, `epics/.../CAP-002-E2.md` | modified | Story added to the backlog, the graph edge `CAP-002-E2-S10: [S4, S7]`, epic E2 v3 |
| `docs/capabilities/.../tests/component/factor-engine-tests.md`, `tests/coverage-matrix.md` | modified | TC-COMP-381 to 387 and their coverage rows |
| `docs/architecture.md` | modified | `Observation read` interface row gains `coverage_segment` (system design v5 section 4.2) |

No change touches `src/factorflow/ingestion` or `src/factorflow/db`: `git diff
829c9e1..HEAD -- src/factorflow/ingestion src/factorflow/db` is empty. So there
is no CAP-001 code change and no migration, as the story and DEC-0398 require.
No changed file lacks a justification.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `momentum_inputs.sql:58-64` (probe), `:246-250` (status), `:268-270` (value only when present) | `test_a_covered_window_without_actions_gives_the_price_return_and_names_its_segment`; every delivered split/dividend test, unchanged and passing over the default segment | A window's actions are applied only where coverage proves they were acquired. Covered windows compute exactly as delivered |
| AC-12 | SATISFIED | `momentum_inputs.sql:246-247`, `:283-287`, `:309-314`; `insert_inputs.sql` enriches the `missing` detail by `missing_data_type` | `test_a_stock_without_corporate_actions_coverage_is_not_classified_on_momentum` (full build: `not_classified`, `input_missing`, `return_3m`, label, null score and percentile); `test_a_momentum_input_missing_coverage_names_the_corporate_actions_acquisition` | An uncovered stock gets no score and its input is named. IR-001's stale case is not scored either way, so AC-12 itself holds |
| DAC-E2-1 | SATISFIED | Split and dividend arithmetic unchanged (`:77-228`); only the covered gate is added | The delivered momentum suite, run unchanged except the two named expectations: 969 postgres tests pass | No new step; read-time adjustment as delivered |
| DAC-E2-13 | PARTIAL | `momentum_inputs.sql:58-64` (`covered_from <= s.session_date + 1`, `covered_to >= h.e_session`), `:246` (not covered → `missing` ahead of `outdated`) | TC-COMP-381, 383, 384, 385 cover the present, bound and cause-order branches | Production is correct. The rule that an uncovered input is `missing` and never `outdated` has no test: mutant `manual:review-outdated-before-not-covered` survives (IR-001) |
| DAC-E2-S10-1 | SATISFIED | `:246-247`, `:283-287`, `:274` (null `known_on` when missing) | `test_a_stock_without_corporate_actions_coverage_has_every_momentum_input_missing` (whole `detail` equality, null value and `known_on`, `as_of == E`, a `prices` segment that must not count); `test_a_stock_without_corporate_actions_coverage_is_not_classified_on_momentum` | Peer-set floor 2 rather than the plan's 1. The asserted outcome is unchanged (see Deviations) |
| DAC-E2-S10-2 | SATISFIED | `:310` (`WHEN NOT s.covered THEN 'corporate_actions'`) | `test_a_momentum_input_missing_coverage_names_the_corporate_actions_acquisition` with distinct `prices`/`corporate_actions` outcomes | Kills `manual:not-covered-data-type-prices` and `manual:review-missing-data-type-uncovered-dropped` |
| DAC-E2-S10-3 | SATISFIED | `:62-63` | `test_coverage_must_contain_the_window_with_both_bounds_inclusive` (exact-12, exact-6, late-start-6, early-end, two-segments); `test_coverage_bounds_are_the_resolved_bars_not_their_targets` | Inclusive bounds proved on k = 12, 6 and 3. The generated `<`, `+ 2` and `>` mutants and the target-based mutants are all killed |
| DAC-E2-S10-4 | SATISFIED | `:258-260` (`corporate_actions_covered_by` in `base`), `:297-303` | `test_a_covered_window_without_actions_gives_the_price_return_and_names_its_segment` (present and outdated, distinct segments per stock) | Value is `close(E)/close(S_k) - 1` to 8 places |
| DAC-E2-S10-5 | SATISFIED | `:277-287` (`detail` order), `:309-314` (data type order) | `test_a_missing_boundary_ranks_before_coverage_and_coverage_before_price_and_payload` | Boundary → `prices`; unusable payload and `E` close 0 → `corporate_actions_not_covered` → `corporate_actions` |
| DAC-E2-S10-6 | SATISFIED | Seeds: `engine_support.py:38-63`, `engine_proof_support.py:122-131`, `:264-268` | The two named expectations gain only the key (`test_engine_inputs_momentum.py:189`, `:966`); `test_value_and_growth_inputs_do_not_depend_on_corporate_actions_coverage`; the full postgres run (volume, latency, `classification_cycle`, scheduler restart) passes | No other delivered test changed (`git diff 829c9e1..HEAD` of the test module) |
| DAC-E2-S10-7 | SATISFIED | No runner change (released behaviour) | `test_a_successful_empty_corporate_actions_fetch_covers_the_range_requested`; `test_a_failed_or_not_found_corporate_actions_fetch_records_no_coverage` (4 cases) | Guard passes against the released runner and writer. `merge_ranges` (`src/factorflow/ingestion/coverage.py`) merges abutting segments, as design 2.4 states |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `0003_coverage.sql` (`coverage_no_overlap` EXCLUDE, `idx_coverage_instrument`); `insert_inputs.sql` joins `acquisition_state` on `missing_data_type`; runner range proven by the T011 guard | Hard dependencies present |
| T002 | complete | VERIFIED | `tests/integration/engine_support.py:38` `DEFAULT_CORPORATE_ACTIONS_COVERAGE`; `:42-63` `add_instrument(..., corporate_actions_covered=True)` inserts the segment before its commit | Keyword-compatible and defaulted; module docstring cites S10, DEC-0397, DEC-0398 |
| T003 | complete | VERIFIED | `tests/integration/engine_proof_support.py:122-127` `_COVERAGE_SQL`; `:129-131` `_ANALYZE_SQL` gains `coverage_segment`; `:264-267` | `ANALYZE coverage_segment` is part of T003 as planned, not a deviation |
| T004 | complete | VERIFIED | `test_engine_inputs_momentum.py:1594-1656` | Floor 2 with a second covered stock `PEER` (justified, see Deviations). The test gap in IR-001 is a branch the plan never listed |
| T005 | complete | VERIFIED | `:1659-1675`, `record_outcomes` `:1575` | Timestamp parsed and compared |
| T006 | complete | VERIFIED | `:1678-1720` (5 parametrized cases); added `:1723-1752` resolved-bar case | Extra case justified (see Deviations) |
| T007 | complete | VERIFIED | `:1755-1782` | One build with a second stock `STALE` instead of rebuilding one stock: stronger, because it kills a covered-by lookup that ignores the instrument |
| T008 | complete | VERIFIED | `:1785-1824` | All three stocks as planned |
| T009 | complete | VERIFIED | `:189`, `:966` | Only those two expectations changed |
| T010 | complete | VERIFIED | `:1827-1859` | Compares status, value, `as_of`, `known_on`, `restated_possible` and `detail` |
| T011 | complete | VERIFIED | `tests/integration/test_runner_acquires.py:220-320` | Also asserts the success case's `run_instrument_result` is `unchanged` (see Deviations) |
| T012 | complete | VERIFIED | `momentum_inputs.sql:7-10`, `:45`, `:55-76`, `:175`, `:226-227`, `:237-260`, `:283-287`, `:305-316` | `LEFT JOIN LATERAL … LIMIT 1` instead of the story's `EXISTS` (plan's Resolved Conflicts) |
| T013 | complete | VERIFIED | Independent full runs: 969 postgres and 1659 other tests passed | The slow volume and latency tests are marked `postgres` and ran inside `-m postgres` |
| T014 | complete | VERIFIED | `# Implements TC-COMP-381` to `387` above every new test and the two edits; docstrings cite DAC and DEC; `git diff 600f0c0..HEAD` touches only the five planned code files and the story's docs | |
| T015 | complete | VERIFIED | `CAP-002-E2-S10-tdd-evidence.yaml` cycle-1: RED `3e654db`, GREEN `3601396`, reviews APPROVED and no drift, `diff_sha256`, mutation block; `check-tdd-evidence.py --require-logs` exit 0 | Its mutation block lists 16 equivalent survivors, all confirmed here. It could not include this review's new survivor |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_a_stock_without_corporate_actions_coverage_has_every_momentum_input_missing`, `test_a_stock_without_corporate_actions_coverage_is_not_classified_on_momentum` / TC-COMP-381 | WEAK | Whole-`detail` equality, null value and `known_on`, `as_of`; a `prices` segment that must not count; a full build asserting the classification row exactly. Kills the instrument, data-type, coverage-list and status mutants | No stale uncovered stock, so DEC-0116 (1)'s "missing before outdated" is unpinned for the new cause. `manual:review-outdated-before-not-covered` survives (IR-001) |
| `test_a_momentum_input_missing_coverage_names_the_corporate_actions_acquisition` / TC-COMP-382 | ADEQUATE | Distinct outcomes per data type make the data type observable; `acquired_at` compared | none |
| `test_coverage_must_contain_the_window_with_both_bounds_inclusive`, `test_coverage_bounds_are_the_resolved_bars_not_their_targets` / TC-COMP-383 | ADEQUATE | Inclusive bounds on each side, exact and off by one day, on target and off-target bars; listing order with reverse insertion; the containing segment named | none |
| `test_a_covered_window_without_actions_gives_the_price_return_and_names_its_segment` / TC-COMP-384 | ADEQUATE | Present value to 8 places; distinct segments per stock; outdated rows carry their own segment | none |
| `test_a_missing_boundary_ranks_before_coverage_and_coverage_before_price_and_payload` / TC-COMP-385 | ADEQUATE | Boundary first naming `prices`; not covered over unusable payload and `E` close 0, naming `corporate_actions`; whole `detail` for `EZERO` | none |
| Two edited expectations and `test_value_and_growth_inputs_do_not_depend_on_corporate_actions_coverage` / TC-COMP-386 | ADEQUATE | The key added and nothing else; value and growth rows identical across covered and uncovered stocks | none |
| `test_a_successful_empty_corporate_actions_fetch_covers_the_range_requested`, `test_a_failed_or_not_found_corporate_actions_fetch_records_no_coverage` / TC-COMP-387 | ADEQUATE | Fetch call arguments; segment equal to the range requested; failed and `not_found` with and without a prior segment leave coverage exactly as before; prices still written | none |

Determinism: every engine test runs on a fresh migrated PostgreSQL 16 database
from testcontainers, with fixed dates and no network. The runner tests stub the
provider at the `MassiveClient` boundary and do not bypass the runner or the
writer.

**RED check, reproduced.** I exported HEAD with `git archive` into the
scratchpad and replaced only `momentum_inputs.sql` with its `829c9e1` version.
The focused command there gave `15 failed, 84 passed`. The 15 failures are the
11 new tests and parameter cases plus the two edited expectations; the 84
passes include every TC-COMP-387 guard case. This matches the coder's
`red-cycle-1-final-tests.log`.

**Mutation, regenerated.** `mutation-run.py generate --range
829c9e1..HEAD --cycle review` produced the same 20 generated mutants over the
one changed production file. To them I added the coder's 17 manual mutants,
re-tagged for this cycle, and 13 of my own: 50 mutants, run with the plan's
focused command, `--jobs 4`. All four baselines passed with 144 tests.

| Group | Mutants | Killed | Survived |
|-------|---------|--------|----------|
| Generated, executable SQL (`:62` x2, `:63`, `:64` x2) | 5 | 4 | 1 (`:64:off-by-one:1`, equivalent) |
| Generated, inside `--` comments (`:9`, `:10`, `:56`, `:237`, `:238`, `:239`, `:306`, `:308`) | 15 | 0 | 15 (equivalent) |
| Coder's manual | 17 | 17 | 0 |
| Reviewer's manual | 13 | 12 | 1 (`manual:review-outdated-before-not-covered`, **not equivalent**) |
| **Total** | **50** | **33** | **17** |

Equivalence:

- **The 15 comment mutants** change only `--` comment text, which PostgreSQL
  never executes. No artifact specifies comment wording.
- **`:64:off-by-one:1`** changes `LIMIT 1` to `LIMIT 2`. Two
  `corporate_actions` segments of one instrument that both contained a
  non-empty window `[S_k + 1, E]` would overlap, and `coverage_no_overlap`
  (`0003_coverage.sql`, an `EXCLUDE` on instrument, data type and
  `daterange '[]'`) forbids that. The probe therefore returns at most one row
  under either limit.

The non-equivalent survivor is IR-001. The reviewer's 12 killed mutants are:

- the coverage list read as null;
- `LEFT JOIN coverage` changed to an inner join;
- the coverage join on `true`;
- the unusable-payload data type changed to `prices`;
- the `price_not_positive` data type changed to `corporate_actions`;
- the probe's end bound read from `S_k`;
- `covered_to` swapped for `covered_from` in `corporate_actions_covered_by`;
- `detail.S` replaced by the `E` bar in the not-covered `detail`;
- the list's `covered_from` taken from `covered_to`;
- the S boundary branch guarded by `covered`;
- the not-covered `detail` branch removed;
- the not-covered data-type branch removed.

Results: `CAP-002-E2-S10-implementation-review-v1-mutation.json` beside this
report.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10.md --stage adversarial-review` | harness root | 0 | PASS | `adversarial-review: READY` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `829c9e1684c19f61ca015a82f6853fe769be4b26` |
| `python3 scripts/artifact-gate.py require --project factorflow-v2 --artifact docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10.md`, then `docs/capabilities/CAP-002-universe-and-factor-classification/design/component-design-factor-engine.md`, then `docs/capabilities/CAP-002-universe-and-factor-classification/design/system-design.md` | harness root | 0, 0, 0 | PASS | All three `passed (owner-allowed)` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS | `969 passed, 1659 deselected, 2 warnings in 503.54s` (volume, latency and integration builds included) |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest -m "not postgres" -q -p no:cacheprovider` | component | 0 | PASS | `1659 passed, 969 deselected, 2 warnings in 34.50s` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline ruff check .` | component | 0 | PASS | `All checks passed!` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline ruff format --check .` | component | 0 | PASS | `285 files already formatted` |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline mypy src` | component | 0 | PASS | `Success: no issues found in 61 source files` |
| `uv build --directory repos/factorflow-v2/FactorFlow-v2 --offline --out-dir /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/dist` | component | 0 | PASS | sdist and wheel built; wheel ships `factorflow/classification/sql/momentum_inputs.sql` |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 829c9e1684c19f61ca015a82f6853fe769be4b26 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| RED check: `uv run --directory /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/red --all-extras --offline python -B -m pytest -m postgres -q -p no:cacheprovider --tb=no -rf tests/integration/test_engine_inputs_momentum.py tests/integration/test_runner_acquires.py` | HEAD export with the delivered SQL | 1 | PASS (expected failure) | `15 failed, 84 passed` |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 829c9e1684c19f61ca015a82f6853fe769be4b26..HEAD --cycle review --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/mut/mutants.json` | harness root | 0 | PASS | 20 generated (`negate-boolean` 1, `off-by-one` 19) |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/mut/mutants.json --jobs 4 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider tests/integration/test_engine_inputs_momentum.py tests/integration/test_runner_acquires.py tests/unit/test_engine_sql_safety.py tests/unit/test_classification_sql_ships.py tests/unit/test_classification_stage_order.py tests/unit/test_sql_is_append_only.py' --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-confident-shtern-083e4b/32dcd9ff-fb53-4005-8409-e856d3707e6f/scratchpad/mut/results.json` | harness root | 3 | FAIL | 50 mutants: 33 killed, 17 survived (16 equivalent, 1 not; IR-001) |
| `npm ci`, `npm run build`, `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | component | N/A | NOT RUN | Not applicable: the change set touches no TypeScript, web or e2e file, and the story's and plan's validation lists name only the Python commands |
| `npm run test:e2e` | component | N/A | NOT RUN | Needs the running acquisition stack, which this review must not touch. No e2e file changed; the two real-build specs (`research-after-download`, `fix-insufficient-evidence`) acquire through the runner, which records `corporate_actions` coverage on a successful fetch |

The Python tests ran outside the Bash sandbox. The sandbox refuses the `uv`
cache (`failed to open file /Users/alvarodejodra/.cache/uv/sdists-v9/.git:
Operation not permitted`), and testcontainers needs the Docker socket. Each
test run started its own `postgres:16` container; no production container or
port was used.

### Validation Side Effects

- Before: `git status --porcelain=v1 --untracked-files=all` empty at `5fbcd6b`.
- After: empty at `5fbcd6b`. `uv build` rewrote the git-ignored
  `src/factorflow.egg-info/`; the mutation run and the RED check worked in
  clones and exports under `$TMPDIR` and the scratchpad.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | An uncovered momentum input is not pinned as `missing` ahead of `outdated` |

### IR-001 — An uncovered momentum input is not pinned as `missing` ahead of `outdated`

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-13, DAC-E2-S10-1
- **Tasks**: T004 (TC-COMP-381), T012 step 3
- **Files**: `src/factorflow/classification/sql/momentum_inputs.sql:246-249` (`statused.status`); `tests/integration/test_engine_inputs_momentum.py:1594-1656` (TC-COMP-381)
- **Claim challenged**: The tests define the not-covered rule "together" (plan, One TDD cycle), and the mutation run's only non-comment survivor is the equivalent `LIMIT 2` (tasks, Implementation Notes; TDD evidence `survivors`).
- **Observed evidence**:
  - The reviewer's mutant `manual:review-outdated-before-not-covered` survives the story's focused suite (144 passed; log `manual_review-outdated-before-not-covered.log`).
  - The mutant moves `j.ca_covered_from IS NULL` out of the first `missing` arm and into a `WHEN … THEN 'missing'` placed after the `outdated` arm.
  - Under it, a stock with no corporate-actions coverage whose latest bar precedes the latest trading day is written as `outdated`. Its `known_on` is not null, and insert_inputs omits `last_acquisition` because the row is not `missing`. Its `detail` still says `corporate_actions_not_covered`, and the classification reason becomes `input_outdated` (`classify.sql`, `concat('input_', g.status)`).
  - No test in the suite builds such a stock. Every uncovered stock the new tests create has a bar on the latest trading day; `STALE` in TC-COMP-384 is covered. `corporate_actions_covered=False` appears only in `test_engine_inputs_momentum.py`, and every other seed covers by default, so the full suite cannot kill the mutant either.
  - The delivered `test_missing_ranks_before_outdated_whatever_the_cause` (`:1454`) pins only the delivered causes.
- **Expected evidence/behavior**:
  - DEC-0397: an input is "present or outdated only when" a segment contains its window; "Otherwise it is missing".
  - Design 2.4: "Otherwise the input is `missing`".
  - DAC-E2-13: an input "MUST be `missing` … unless one `corporate_actions` coverage segment … contains its whole window".
  - DEC-0116 (1): missing before outdated.
  - The production code at `:246-247` does this; no test proves it.
- **Impact**:
  - A regression that ranks `outdated` ahead of the coverage test would pass the gate.
  - In production on 2026-11-07, 31 of 42 momentum stocks had no coverage. Any of them whose latest bar lags the latest trading day would then be shown as not classified for out-of-date prices, with a `known_on` and no `last_acquisition`. The real cause, corporate actions never acquired, would not be named (AC-12's "the missing or outdated input named").
  - The score is withheld either way.
- **Required remediation**:
  - Add a test, traced to TC-COMP-381 or DAC-E2-13, that builds an uncovered stock whose latest bar precedes the latest trading day.
  - It must assert that all three momentum inputs are `missing` with cause `corporate_actions_not_covered`, a null `known_on`, and `last_acquisition` naming `corporate_actions` when an `acquisition_state` row exists.
  - The mutant `manual:review-outdated-before-not-covered` (in the attached mutation JSON) must then be killed.
  - Only a test is needed; the production SQL is correct.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

Each deviation the coder reported was checked against the repository:

- **`LEFT JOIN LATERAL … LIMIT 1` instead of `EXISTS`.** Justified. The story's
  Technical Details say "one `EXISTS` probe", but DAC-E2-S10-4 and design 2.4
  need the containing segment, which `EXISTS` cannot return. The plan records
  this under Resolved Conflicts, and design 2.4 calls its `EXISTS` "the sketch".
  The probe is the same index probe, and `LIMIT 1` is safe under
  `coverage_no_overlap`. Doc sync should describe the probe as written.
- **Peer-set floor of 2 in the key test (plan: 1).** Justified. With one
  qualifying stock `stddev_samp` is null and the set fails
  `factor_classification_shape`, which the coder logged in
  `red-cycle-1-key-test-corrected.log`. The asserted outcome for `BARE` is the
  one DAC-E2-S10-1 states. The floor is monkeypatched only in the test.
- **Extra resolved-bar test (`test_coverage_bounds_are_the_resolved_bars_not_their_targets`).**
  Justified. Every planned TC-COMP-383 case put its bars on their targets, so
  none could tell the resolved bars `s_session` and `e_session` from the
  targets. The new case kills `manual:probe-on-s-target` and
  `manual:probe-on-e-target`, and it pins design 2.4's bounds.
- **`ANALYZE coverage_segment` in `populate_volume`.** Planned in T003, so not a
  deviation.
- **Runner guard asserts `run_instrument_result.outcome = unchanged` for the
  empty successful fetch.** Accepted.
  - It is an assertion the plan did not list. It records the released
    outcome, because `writer.py` writes no `corporate_action` row, so the
    outcome is `unchanged`.
  - It shows that the fetch was treated as a success rather than a failure,
    which strengthens DAC-E2-S10-7.
  - Its cost: a future CAP-001 relabelling of empty-fetch outcomes would fail
    this CAP-002 guard even if coverage stayed as DEC-0398 adopts it. Whoever
    changes the label would see this test and update it.
- **TC-COMP-384 uses a second stock instead of rebuilding one.** Stronger than
  the specification's two builds, and recorded in T007 of the plan.
- **Reported results.** The coder reported 969 postgres and 1659 other tests,
  ruff and mypy clean; all are reproduced above. The coder also reported 21 of
  37 mutants killed with all 16 survivors equivalent. That is confirmed for
  their 37 mutants. This review's 13 additional mutants found one
  non-equivalent survivor, IR-001.
- **Bookkeeping.**
  - Every task is ticked, consistent with the evidence.
  - The story's status is `in-review`, a mutable gate field;
    `artifact-gate.py require` still passes.
  - The tasks file stays `status: draft`, as other story plans in this epic do.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding`, rework)
- **Required action**: Resolve IR-001 with
  `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10-tasks.md`
  and this report. The rework adds a test only. Then rerun
  `$adversarial-review`, which takes this report as its baseline and
  `CAP-002-E2-S10-implementation-review-v1-mutation.json` as `scope --previous`.
- **Warnings accepted downstream**: N/A
