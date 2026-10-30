---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
story_id: "CAP-002-E3-S1"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S1.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-30T02:38:26Z"
reviewed_head: "4364fd56b68e640c662b9bc50984fd17b665946a"
review_base: "7688c924c554920816b60fd6af60fc81f1164174"
reviewed_state_revision: "sha256:a429c3d5d78d616d31da7d3a162470559468ecd4d2f20c6f52fd6bedf837c2c4"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E3-S1
    artifact_version: 1
    content_revision: sha256:aed58807f7a7be9b964d1579526c9b067cb9689e6277c4141b3400ac8ab9c616
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-30T02:38:26Z
  source_artifacts:
    - id: CAP-002-E3-S1
      version: "1 (sha256:aed58807f7a7be9b964d1579526c9b067cb9689e6277c4141b3400ac8ab9c616)"
    - id: CAP-002-E3-S1-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E3-S1-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-E3
      version: "4"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E3-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 18/19 verified |
| Required validation | 18/19 passed |

The production code does what the story asks. `current_set.sql` is the design 2.4 statement with its select list closed as T013 directs. `summary.sql` is design 2.4 verbatim. `reader.py` builds the `set` and `later` blocks once in `read_set_blocks`, and `summary` and `current_set` reuse them. `followed_count` is the stored `active_instruments`. Nothing writes or commits. The wheel ships both new statements. Every required build, suite, lint, format, type, package-data and TDD-evidence command passes on `4364fd5`: the full Python suite (1638 passed, 1 xfailed), PostgreSQL (553), Vitest (876) and Playwright (18).

The gate fails on test strength (E.9). I ran 64 mutants: 24 from the shared catalogue, the coder's 17 manual mutants re-run, and 23 of my own. 54 were killed and 10 survived. Five survivors are equivalent; the coder's evidence records the same five. The other five change behaviour the design, DEC-0082 or the task plan specifies, and no test kills them:

- **IR-001 (HIGH).** `later.started_at` is asserted nowhere. TC-COMP-170 and TC-COMP-171 still pass when the field carries the download's start time, or the current set's start time.
- **IR-002 (HIGH).** The set block's `factors` are never checked while another set has factor rows. The `factors` subquery can lose its `f.set_id = c.set_id` correlation, merging every set's counts, and every test passes.
- **IR-003 (HIGH).** The seeded timestamps never let `ended_at` and `started_at` disagree. So nothing pins the designed keys: the current set is the latest by `ended_at`, and `later` starts after the current set's `started_at`. T009 implements its two cases as worded, but they cannot fail on the wrong key.

**By severity:** CRITICAL 0 · HIGH 3 · MEDIUM 0 · LOW 0 · **total 3**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S1.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S1` |
| HEAD | `4364fd56b68e640c662b9bc50984fd17b665946a` (one stage commit) |
| Review base | `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` → `7688c924c554920816b60fd6af60fc81f1164174`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation (`git status --porcelain=v1 -uall` empty); only git-ignored build products present |
| Changed files reviewed | 15 (13 added, 2 modified), all in `7688c92..4364fd5`; no staged, unstaged or untracked files |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review` reported `READY`. The prerequisite check exited 0. `artifact-gate.py require` passes for the story and for the reader design. The story's revision equals its approval's `reviewed_revision`; the `status: planning → in-review` edit is outside the revision.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/reader.py` | added | T015, T016; AC-13, AC-20–AC-22, DAC-E3-1, DAC-E3-10, DAC-E3-11 |
| `src/factorflow/classification/sql/current_set.sql` | added | T013; DAC-E3-1, AC-20, AC-21 |
| `src/factorflow/classification/sql/summary.sql` | added | T014; DAC-E3-10, DAC-E3-S1-4, DAC-E3-S1-5 |
| `tests/integration/reader_seed.py` | added | T002 |
| `tests/integration/test_reader_current_set.py` | added | T003, T004, T005, T009, T011 |
| `tests/integration/test_reader_summary.py` | added | T006, T007, T008, T010 |
| `tests/unit/test_reader_sql_read_only.py` | added | T012 |
| `docs/.../stories/CAP-002-E3-S1.md` | modified (`status` only) | Story-coding bookkeeping; outside the approval revision |
| `docs/.../stories/CAP-002-E3-S1-tasks.md` | modified (19 checkboxes only) | Bookkeeping; see IR-003 for T009 |
| `docs/.../stories/CAP-002-E3-S1-tdd-evidence.yaml` | added | T019 |
| `docs/.../stories/CAP-002-E3-S1-evidence/cycle-1.patch`, `red-cycle-1.log`, `green-cycle-1.log`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json` | added | T019 evidence |

No file outside the plan was changed. Nothing touched `tests/conftest.py`, `pyproject.toml`, a migration, or any CAP-001 or E2 module. The seven code files are the five source and test files and the two SQL files T018 allows. For each of them, the code in `cycle-1.patch` is byte-identical to `git diff 7688c92..HEAD`, ignoring `index` lines. Its sha256, `ca3dee03…`, equals the evidence's `diff_sha256`. The log and results hashes match too.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | SATISFIED | `summary.sql`: `bool_or(fi.status IN ('missing', 'outdated'))` per instrument of one set | `test_missing_or_outdated_input_makes_a_stock_not_current`, `test_not_computable_does_not_rescue_a_missing_input` (TC-COMP-103) | The engine applies the outdated rule when it writes the status; the summary counts the statuses |
| AC-20 | SATISFIED | `current_set.sql` `current` and `later` CTEs, `FULL JOIN … ON true`; `reader.read_set_blocks` sets `not_current = later is not None` | TC-COMP-170, TC-COMP-171, `test_newer_failed_set_is_later_and_previous_set_still_served` | The complete set is still served beside a building or failed `later`, and `failure_reason` reaches the block |
| AC-21 | SATISFIED | `CurrentSet` carries `classification_date`, `run_id`, `run_started_at` (`acquisition_run.started_at`), `run_outcome`, `ended_at` | `test_current_set_carries_run_and_set_fields[succeeded/partial]`, TC-COMP-178 | `later.started_at` is not pinned (IR-001) |
| AC-22 | SATISFIED | `summary` returns `Summary(set=None, never_classified=True, …)` with no complete set; `read_set_blocks` returns `(None, None)` with no row | TC-COMP-181, `test_summary_with_no_set_at_all` | — |
| DAC-E3-1 | SATISFIED | `current_set.sql:5-19` exactly as design 2.4: `ORDER BY s.ended_at DESC LIMIT 1` over `complete`; `later` by `started_at > current.started_at`, `ORDER BY started_at DESC LIMIT 1` | TC-COMP-170, T009 cases, T011 pin | Behaviour correct. The `ended_at` and `started_at` keys are not pinned (IR-003) |
| DAC-E3-10 | SATISFIED | As AC-13; `followed_count = current.active_instruments` | TC-COMP-103; `test_an_unranked_factor_changes_no_stocks_currency`; `test_complete_set_with_no_inputs_counts_zero_current` | `not_computable` alone leaves a stock current |
| DAC-E3-11 | SATISFIED | `summary` takes `set` and `later` from `read_set_blocks`, the function E3-S2 must reuse | TC-COMP-171 (summary half); TC-COMP-181 | The list half is E3-S2's and the API half E3-S5's (TC-COMP-173), as the plan records |
| DAC-E3-S1-1 | SATISFIED | As DAC-E3-1 | TC-COMP-170 through `read_set_blocks`, `summary` and `current_set` | TC-COMP-170 is WEAK (IR-001, IR-002) |
| DAC-E3-S1-2 | SATISFIED | `current` columns null, `later` columns set → `(None, LaterSet)` | TC-COMP-171 `[building]`, `[failed]` | `failure_reason` "boom" and `ended_at` asserted on the failed case. TC-COMP-171 is WEAK (IR-001) |
| DAC-E3-S1-3 | SATISFIED | Zero rows → `(None, None)`; `Summary` has one field list in every state | TC-COMP-181 | Field names compared across the empty and populated states |
| DAC-E3-S1-4 | SATISFIED | As AC-13 | TC-COMP-103 (both tests) | `missing`, `outdated` and `not_computable` mutants of the status list are killed |
| DAC-E3-S1-5 | SATISFIED | `summary.sql` returns `current_count`, `scored_roster`; `Summary`/`StocksCurrent` hold no stock rows | `test_summary_statement_returns_counts_only`; `test_summary_and_current_set_are_served_from_indexes` (`enable_seqscan = off`, no `Seq Scan` on the three tables) | Index evidence as the plan's Open Gap 4 states; volume is E3-S4's |
| DAC-E3-S1-6 | SATISFIED | Every field is read from a column; `ranked` and `qualified_count` from `classification_set_factor`; `min_peer_set_size` from `MIN_PEER_SET_SIZE` | TC-COMP-178 (7 vs 3 stocks; 41/True with no classification rows; 33/False); `tests/unit/test_reader_sql_read_only.py` | — |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `classification/__init__.py`, `constants.py` (`MIN_PEER_SET_SIZE`, `FACTORS`, `INPUT_NAMES`), `0006_classifications.sql`, `classification/sql/*.sql` in `[tool.setuptools.package-data]` all exist at `7688c92` | — |
| T002 | complete | VERIFIED | `tests/integration/reader_seed.py`: `insert_instrument`, `insert_run`, `insert_set`, `insert_input`, plus `insert_stock_inputs`; bound parameters only | `insert_stock_inputs` is an unplanned convenience over `insert_input`, inside T002's purpose. No fixture added to `conftest.py` |
| T003 | complete | VERIFIED | `test_complete_set_with_newer_building_set_is_served_with_later` | Every assertion the task lists is present. The test is WEAK (IR-001, IR-002) |
| T004 | complete | VERIFIED | `test_first_set_building_or_failed_is_never_classified_with_later[building/failed]`, a fresh database each | WEAK (IR-001) |
| T005 | complete | VERIFIED | `test_no_set_at_all_is_never_classified_in_the_same_shape` | — |
| T006 | complete | VERIFIED | `test_missing_or_outdated_input_makes_a_stock_not_current`, `test_not_computable_does_not_rescue_a_missing_input` | — |
| T007 | complete | VERIFIED | `test_summary_statement_returns_counts_only`, `test_summary_and_current_set_are_served_from_indexes` | — |
| T008 | complete | VERIFIED | `test_reader_returns_stored_values_and_recomputes_nothing` | — |
| T009 | complete | PARTIAL | `test_latest_complete_set_by_ended_at_is_current`, `test_newer_failed_set_is_later_and_previous_set_still_served`, `test_complete_set_alone_has_no_later`, `test_building_set_older_than_current_is_not_later`, `test_current_set_carries_run_and_set_fields` | Each case is implemented as worded. But "the later `ended_at` is current" and "older than the current … is not later" are not covered: the seeded sets never let `started_at` and `ended_at` order differently. Two non-equivalent mutants survive (IR-003) |
| T010 | complete | VERIFIED | Six summary-shape tests in `test_reader_summary.py` | — |
| T011 | complete | VERIFIED | `test_most_recent_non_complete_set_is_later_while_none_is_complete`, with the PROVISIONAL comment | DEC-0126 (owner `upheld`) settled Open Gap 1 as implemented |
| T012 | complete | VERIFIED | `tests/unit/test_reader_sql_read_only.py`, with a self-test of the comment stripper | — |
| T013 | complete | VERIFIED | `current_set.sql` | The select list matches T013; `current` is kept as the CTE name |
| T014 | complete | VERIFIED | `summary.sql` | Verbatim from design 2.4 apart from the header comment |
| T015 | complete | VERIFIED | `reader.py` dataclasses, `read_set_blocks`, `current_set`; `FACTORS`/`MIN_PEER_SET_SIZE` imported and re-exported | No `api.bounds` or `classification_bounds` import (grep exit 1); no E3-S2 types |
| T016 | complete | VERIFIED | `reader.summary` | `followed_count` is `active_instruments`, not `scored_roster` (killed: `followed-is-scored-roster`) |
| T017 | complete | VERIFIED | `tests/unit/test_package_data_ships_sql.py` passes (10); the built wheel contains `classification/sql/current_set.sql` and `summary.sql` | — |
| T018 | complete | VERIFIED | Every validation command passes (Independent Validation); docstring and tests cite DAC-E3-S1-1 to -6 and the six TC-IDs | — |
| T019 | complete | VERIFIED | `check-tdd-evidence.py … --require-logs`: 0 errors, 0 warnings; one cycle, `commit_hash: stage`, `APPROVED`, `drift_detected: false` | See the RED note under Test Quality |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_complete_set_with_newer_building_set_is_served_with_later` / TC-COMP-170 | WEAK | `set_id`, `not_current`, `never_classified`, and `later`'s `set_id`, `state`, `run_id`, `run_started_at`, `ended_at`, `failure_reason`. Checked through `read_set_blocks`, `summary` and `current_set`, which agree | `later.started_at` never asserted (IR-001). The complete set's `factors` are not asserted, though the building set has factor rows of its own (IR-002) |
| `test_first_set_building_or_failed_is_never_classified_with_later` / TC-COMP-171 | WEAK | `set` None, `never_classified`, `later` identity, `run_started_at`; `failure_reason` and `ended_at` on the failed case | `later.started_at` never asserted (IR-001) |
| `test_no_set_at_all_is_never_classified_in_the_same_shape` / TC-COMP-181 | ADEQUATE | `(None, None)`, `never_classified`, one `Summary` field list across states | none |
| `test_missing_or_outdated_input_makes_a_stock_not_current`, `test_not_computable_does_not_rescue_a_missing_input` / TC-COMP-103 | ADEQUATE | Exact `StocksCurrent(2, 4)` over all four status kinds; the converse case | none; every status-list, `bool_and` and per-factor grouping mutant is killed |
| `test_summary_statement_returns_counts_only`, `test_summary_and_current_set_are_served_from_indexes` / TC-COMP-104 | ADEQUATE | Column names, one row `(59, 60)`, integer types, the dataclass field lists; `EXPLAIN` under `enable_seqscan = off` | Index path only, as the plan's Open Gap 4 states |
| `test_reader_returns_stored_values_and_recomputes_nothing` / TC-COMP-178 | ADEQUATE | Stored values that no recount could produce: 7 vs 3 stocks, 41 qualified with no classification rows, 33 unranked, `partial` | One set only; IR-002 is pinned through TC-COMP-170 |
| T009 tests (`test_latest_complete_set_by_ended_at_is_current`, `test_building_set_older_than_current_is_not_later`) | WEAK | Pass on the designed SQL | Every seeded set has `started_at < ended_at <` the next set's `started_at`, so the wrong timestamp key passes (IR-003) |
| T009 tests (`test_newer_failed_set_is_later_and_previous_set_still_served`, `test_complete_set_alone_has_no_later`, `test_current_set_carries_run_and_set_fields`) | ADEQUATE | `failure_reason`, `not_current` false with no later, every `CurrentSet` field with distinct values, `FACTORS` order, `min_peer_set_size` | none for their single-key cases |
| T010 tests (six) | ADEQUATE | Shape before any set, building-only, the complete set's count while a newer set builds (that set's own all-present stock), `followed_count == scored_roster`, unranked factor, zero inputs | none |
| `test_most_recent_non_complete_set_is_later_while_none_is_complete` (T011) | ADEQUATE | Most recent of two non-complete sets; one row returned | none |
| `test_returned_blocks_are_immutable` | ADEQUATE | Five frozen dataclasses | none; kills the five `frozen=False` mutants |
| `test_reader_statement_is_one_read_only_query`, `test_comment_stripping_does_not_hide_a_write` (T012) | ADEQUATE | One statement, `WITH`/`SELECT`, no write keyword, located beside the module | none |

**Isolation and determinism.** Each integration test gets its own migrated database (`migrated_run_schema_connection`). Timestamps are fixed constants. The seed helpers commit, so the reader's statements see the rows. No test depends on time, order or network beyond the testcontainer.

**RED evidence.** The single RED is a collection-time import error for all three new modules, because no `reader.py` existed. The plan designs it that way ("they fail at import until Phase 3"), and the lint accepts it. It shows that the tests reach the module, not that each test fails for its own reason. The mutation run is the evidence that does show that, and it is where this review fails.

**Mutation (E.9).** I regenerated mutants with `mutation-run.py generate` over `7688c92..HEAD`. That gave 24 catalogue mutants: 12 `negate-boolean`, 8 `off-by-one` and 4 `drop-defaulted-argument`. I re-ran the coder's 17 manual mutants and added 23 of my own over both SQL files and `reader.py`. Of the 64, 54 were killed and 10 survived. All four baselines passed with 36 tests each. Survivors and their dispositions:

| Survivor(s) | Disposition | Contract reasoning |
|-------------|-------------|--------------------|
| `reader.py:111:drop-defaulted-argument:1`, `reader.py:111:negate-boolean:1` (`zip(..., strict=True)` → default / `False`) | equivalent | `names` and `row` come from one cursor result, so their lengths are always equal and `strict` never fires. No artifact specifies the check |
| `current_set.sql:2:off-by-one:1`, `:3:off-by-one:1`, `:3:off-by-one:2` | equivalent | Digits inside the `--` header comment, which PostgreSQL discards. No artifact specifies comment text |
| `review:later-started-is-run-started` (`started_at=c["later_run_started_at"]`), `review:later-started-sql-is-current` (`c.started_at AS later_started_at`) | **not equivalent** | IR-001 |
| `review:factors-any-set` (`WHERE f.set_id IS NOT NULL`) | **not equivalent** | IR-002 |
| `review:current-by-started-at` (`ORDER BY s.started_at DESC`), `review:later-after-current-end` (`COALESCE((SELECT ended_at FROM current), …)`) | **not equivalent** | IR-003 |

Killed reviewer mutants include several things: the summary bound to `later.set_id`, `later` dropped from either `Summary` branch, `FULL JOIN` turned into `LEFT` or `RIGHT`, `later`'s lower bound removed or set to `'infinity'`, `later` without `LIMIT`, `ORDER BY` removed from `current`, `state <> 'failed'` for `current`, `run_outcome` read from the set, `later.run_id` read from the current set, `latest_trading_day` read from `classification_date`, `FACTORS` reordered, grouping by factor, `bool_and`, and `scored_roster` filtered.

## Independent Validation

`<component>` is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-design-cap-003-f106a0/repos/factorflow-v2/FactorFlow-v2`, at `4364fd5` throughout. `<scratch>` is this session's scratchpad, outside the repository. The sandbox refused the `uv` cache (`Failed to initialize cache … Operation not permitted`) and the TDD lint's temporary file (`unable to create temporary file: Operation not permitted`). So `uv`, `npm`, every Docker-backed command and the lint ran outside the sandbox, each as one plain call.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | evidence | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | evidence | `READY — story is ready for independent review` |
| `uv run --directory <component> --offline pytest tests/integration/test_reader_current_set.py tests/integration/test_reader_summary.py tests/unit/test_reader_sql_read_only.py tests/unit/test_package_data_ships_sql.py -p no:cacheprovider -q` | component | 0 | PASS (focused) | 36 passed, 4.96 s |
| `python3 scripts/check-tdd-evidence.py --evidence <component>/…/CAP-002-E3-S1-tdd-evidence.yaml --repo-dir <component> --base 7688c924c554920816b60fd6af60fc81f1164174 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS (required) | 0 errors, 0 warnings. The sandboxed attempt failed on a temporary file, as quoted above |
| `uv sync --directory <component> --all-extras --offline` | component | 0 | PASS (required) | Resolved 46, checked 43 |
| `uv run --directory <component> --offline pytest -q -p no:cacheprovider` | component | 0 | PASS (required) | 1638 passed, 1 xfailed, 260.67 s; two third-party deprecation warnings |
| `uv run --directory <component> --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS (required) | 553 passed, 1086 deselected, 237.59 s |
| `uv run --directory <component> --offline pytest -m "not postgres" -q -p no:cacheprovider` | component | 0 | PASS (required) | 1085 passed, 553 deselected, 1 xfailed, 25.62 s |
| `uv run --directory <component> --offline ruff check .` | component | 0 | PASS (required) | All checks passed |
| `uv run --directory <component> --offline ruff format --check .` | component | 0 | PASS (required) | 243 files already formatted |
| `uv run --directory <component> --offline mypy src` | component | 0 | PASS (required) | No issues in 57 source files |
| `npm --prefix <component> ci --offline --no-audit --no-fund` | component | 0 | PASS (required) | 250 packages from the local cache |
| `npm --prefix <component> run lint` | component | 0 | PASS (required) | 110 files, no fixes; run before `uv build` |
| `npm --prefix <component> run format` | component | 0 | PASS (required) | 110 files, no fixes; run before `uv build` |
| `npm --prefix <component> exec -- tsc --noEmit -p <component>` | component | 0 | PASS (required) | No output |
| `npm --prefix <component> run test` | component | 0 | PASS (required) | 47 files, 876 tests |
| `npm --prefix <component> run build` | component | 0 | PASS (required) | Vite bundle into the ignored `src/factorflow/api/static/` |
| `npm --prefix <component> run test:e2e` | component | 0 | PASS (required) | 18 passed (2.9 m); `posttest:e2e` removed the container |
| `uv build --directory <component> --offline` | component | 0 | PASS (required) | sdist and wheel built; the wheel contains `factorflow/classification/sql/current_set.sql` and `summary.sql` |
| `grep -rn "api.bounds\|classification_bounds" src/factorflow/classification/reader.py` | component | 1 | PASS (story-specific) | No match, as the plan requires |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7688c924c554920816b60fd6af60fc81f1164174..HEAD --cycle review --out <scratch>/mut/mutants.json` | harness root | 0 | evidence | 24 catalogue mutants; then the coder's 17 manual and 23 reviewer manual mutants were added into `<scratch>/mut/mutants-review-all.json` (sha256 `eaf7e488…`) |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mut/mutants-review-all.json --jobs 4 --timeout 900 --command 'uv run --all-extras --offline python -B -m pytest -m "postgres or not postgres" -x -q -p no:cacheprovider tests/integration/test_reader_current_set.py tests/integration/test_reader_summary.py tests/unit/test_reader_sql_read_only.py tests/unit/test_package_data_ships_sql.py' --out <scratch>/mut/mutation-review-results.json --logs <scratch>/mut/logs --work-root <scratch>/mut/work` | harness root | 3 | FAIL (E.9) | 64 mutants: 54 killed, 10 survived, 5 of them non-equivalent (IR-001, IR-002, IR-003). Four baselines passed with 36 each. Ran 02:23:14Z to 02:24:45Z. Results sha256 `944436e4…`, copied beside this report as `CAP-002-E3-S1-implementation-review-v1-mutation.json` |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>`, then `require` on the story and the reader design | harness root | 0 | evidence | `sha256:aed58807…`, equal to the approved `reviewed_revision`; both gates passed |

Nothing required was excluded. Every command in `docs/constitution/tech-stack.md` and the story's validation list ran in full.

### Validation Side Effects

- Before (02:25:42Z): branch `usr/alvaro-de-jodra/CAP-002-E3-S1` at `4364fd5`, clean, `code-revision` `sha256:a429c3d5…`.
- After (02:37:31Z): same branch, HEAD and `code-revision`; `git status --porcelain=v1 -uall` is empty. Only ignored paths were written: `.venv/`, `build/`, `dist/`, `src/factorflow.egg-info/`, `node_modules/`, `src/factorflow/api/static/{index.html,assets/}`, `test-results/`. Mutation clones, logs and results stayed under `<scratch>`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | initial | OPEN | TC-COMP-170 and TC-COMP-171 are WEAK: `later.started_at` is never asserted; two mutants survive |
| IR-002 | HIGH | initial | OPEN | TC-COMP-170 is WEAK: the set block's `factors` are never checked while another set has factor rows; `factors-any-set` survives |
| IR-003 | HIGH | initial | OPEN | T009 is PARTIAL: no seeded data lets `ended_at` and `started_at` disagree, so the current-set and `later` keys are unpinned; two mutants survive |

### IR-001 — `later.started_at` is asserted by no test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-20, AC-21, DAC-E3-1, DAC-E3-11, DAC-E3-S1-1, DAC-E3-S1-2
- **Tasks**: T003, T004
- **Files**: `src/factorflow/classification/reader.py:148` (`_row_to_later`, `started_at=c["later_started_at"]`); `src/factorflow/classification/sql/current_set.sql:38`; `tests/integration/test_reader_current_set.py:47-81` (TC-COMP-170), `:86-121` (TC-COMP-171)
- **Claim challenged**: TC-COMP-170 and TC-COMP-171 prove that `later` carries the newer or first set.
- **Observed evidence**: two mutants survive the focused suites (36 passed each). `review:later-started-is-run-started` sets `LaterSet.started_at` from the run's `started_at`. `review:later-started-sql-is-current` selects `c.started_at AS later_started_at`, which gives the current set's start, or `None` before any complete set. No test reads `later.started_at`. TC-COMP-170 asserts `set_id`, `state`, `run_id`, `run_started_at`, `ended_at` and `failure_reason`, and TC-COMP-171 the same minus `ended_at` on the building case.
- **Expected evidence/behavior**: DEC-0082 (owner `upheld`) defines the `later` block as `{set_id, state, started_at, ended_at, failure_reason, run_id, run_started_at}`. Design 2.3 declares `LaterSet.started_at` as the set's own start, beside `run_started_at`. Design §7, row *Not current while building*, requires `later` to yield "its `state`, `started_at`, `run_id` and `run_started_at`".
- **Impact**: `later.started_at` is the field consumers read for when the newer attempt began. A regression that put the download's start time, or the current set's, there would pass the gate. E3-S2 and E3-S5 reuse this block and mutate only their own lines, so they would not catch it either.
- **Required remediation**: Assert `later.started_at` against the seeded set's `started_at`, distinct from the run's `started_at`, in TC-COMP-170 and in both TC-COMP-171 cases. Both mutants must be killed.

### IR-002 — The set block's `factors` are never checked while another set has factor rows

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-21, DAC-E3-1, DAC-E3-S1-1, DAC-E3-S1-6
- **Tasks**: T003, T009, T013
- **Files**: `src/factorflow/classification/sql/current_set.sql:30-33` (the `factors` subquery, `WHERE f.set_id = c.set_id`); `tests/integration/test_reader_current_set.py:47-81`, `:228-265`; `tests/integration/test_reader_summary.py:156-199`
- **Claim challenged**: the set block carries the current set's own per-factor `qualified_count` and `ranked`.
- **Observed evidence**: `review:factors-any-set` survives (36 passed). It replaces the correlation with `WHERE f.set_id IS NOT NULL`, so `jsonb_object_agg` merges every set's `classification_set_factor` rows, and a duplicate key keeps whichever row the aggregate reads last. Only two tests assert `factors`: `test_current_set_carries_run_and_set_fields` and TC-COMP-178, and each seeds a single set. TC-COMP-170 seeds a complete set (35/31/12) and a building set whose `insert_set` writes three `(0, false)` rows, but asserts no `factors`.
- **Expected evidence/behavior**: T013 specifies the subquery `WHERE f.set_id = c.set_id`. Design 2.3 and 2.4 require the `CurrentSet.factors` of the current set. The story's description says the summary carries the per-factor counts. DAC-E3-S1-6 requires each returned value to be the stored row, which means this set's row.
- **Impact**: with two or more complete sets, which is every day after the second classification, such a regression shows another set's qualified counts and ranked flags. Those counts are the source of *{n} qualified, 30 needed* and of whether a factor is ranked. Nothing in the gate would notice.
- **Required remediation**: In a test where another set has `classification_set_factor` rows with different values, assert the current set's `factors` exactly. TC-COMP-170, or a T009 case with two complete sets, is the natural place. `review:factors-any-set` must be killed.

### IR-003 — The `ended_at` and `started_at` keys of current and later resolution are not pinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-1, AC-20
- **Tasks**: T009 (PARTIAL), T013
- **Files**: `src/factorflow/classification/sql/current_set.sql:9` (`ORDER BY s.ended_at DESC`), `:16` (`s.started_at > COALESCE((SELECT started_at FROM current), '-infinity')`); `tests/integration/test_reader_current_set.py:154-167` (`test_latest_complete_set_by_ended_at_is_current`), `:211-225` (`test_building_set_older_than_current_is_not_later`)
- **Claim challenged**: T009, which asks that "with two `complete` sets the one with the later `ended_at` is current" and that "a `building` set older than the current complete set (not newer) is not `later`".
- **Observed evidence**: two mutants survive (36 passed each). `review:current-by-started-at` picks the current set by `started_at DESC`. `review:later-after-current-end` makes `later` start after the current set's `ended_at` instead of its `started_at`. Every seeded set has `ended_at = started_at + 5 min`, and sets are hours or days apart. So the `started_at` order always equals the `ended_at` order, and no seeded set starts inside the current set's `[started_at, ended_at]` window. The tests cannot tell either designed key from its neighbour.
- **Expected evidence/behavior**: design 2.4 fixes `ORDER BY s.ended_at DESC` for `current`, and `s.started_at > (SELECT started_at FROM current)` for `later`. Design §7, row *Current is latest complete*, says "the later `ended_at` is current". DEC-0082 defines `later` as the most recent set newer than `set`. T009 names both cases. The schema allows both distinguishing states: two `complete` sets whose `ended_at` order differs from their `started_at` order, and a set started between the current set's start and end, since only one `building` row is unique-indexed.
- **Impact**: with the engine as built, both orders agree in practice. The engine stamps `started_at` and `ended_at` with `now()`, and the single-`building` index serialises builds. A race between a claim transaction and a completing one is the only way for them to diverge. This does not lower the severity. The rule is the contract's, these reads are the seam that E3-S2, E3-S5 and the shell capability build on, and a change to either key would pass every test.
- **Required remediation**: Add data where the keys disagree. One case is two `complete` sets, A started first but ended last, with A current. The other is a set started after the current set's `started_at` but before its `ended_at`, which must be `later` with `not_current` true. Both mutants must be killed.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- No out-of-scope change. The seven code files are the ones T018 allows. `insert_stock_inputs` in `reader_seed.py` is an unplanned helper inside T002's purpose.
- `CurrentSet`, `LaterSet` and `Summary` docstrings describe `later` as "the most recent set … while none is complete", where design 2.3 says "the first". This follows the plan's Open Gap 1, which DEC-0126 (owner `upheld`) settled. T011 pins it.
- The task plan's Validation Plan says no Python build command is defined. `docs/constitution/tech-stack.md` lists `uv build`. I ran it, and it passes. This is a planning inaccuracy, not an implementation defect, and needs no coder action.
- The plan's per-cycle reviews (T019) ran once, over the single RED/GREEN cycle the plan's structure produces. Tests come first in Phase 2, then the code in Phase 3. The lint accepts this.
- Bookkeeping: all 19 tasks are checked. T009 is checked but PARTIAL (IR-003).

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework the tests only, under `story-coding`, with `CAP-002-E3-S1-tasks.md` and this report. Production code needs no change. Kill `review:later-started-is-run-started`, `review:later-started-sql-is-current`, `review:factors-any-set`, `review:current-by-started-at` and `review:later-after-current-end`. Their exact `old`/`new` text is in `CAP-002-E3-S1-implementation-review-v1-mutation.json`. Add a TDD-evidence cycle for the rework, then rerun this review, which will use v1 as its baseline.
- **Warnings accepted downstream**: N/A
