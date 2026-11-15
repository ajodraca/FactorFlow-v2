---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E2-S3"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S3.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-14T20:14:00Z"
reviewed_head: "5773f19fcdcb1f9edffc604a13477c747cde42f0"
review_base: "c4e031f8cc1df324da43863c083ac10953056944"
reviewed_state_revision: "sha256:34b1fb908e2eb60806e39eef1c7fe2b410daccfc176e84a757351052e04426c0"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-003-E2-S3
    artifact_version: 1
    content_revision: sha256:3db8d9928b02bd3f3322f431a3a709d45f8bc6f47bbfa4bb85e0b023976c1f1a
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-14T20:14:00Z
  source_artifacts:
    - id: CAP-003-E2-S3
      version: "1 (sha256:3db8d9928b02bd3f3322f431a3a709d45f8bc6f47bbfa4bb85e0b023976c1f1a)"
    - id: CAP-003-E2-S3-tasks
      version: "1 (draft)"
    - id: CAP-003-E2-S3-tdd-evidence
      version: "cycle-1"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003-component-design-data-health-reader
      version: "2"
    - id: CAP-003-data-health-reader-tests
      version: "2 (draft)"
    - id: CAP-003-coverage-matrix
      version: "2 (draft)"
    - id: tech-stack
      version: "7"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E2-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 11/11 passed |

This is the initial review of `5773f19` against review base `c4e031f`. The base is the tip of the
CAP-003 integration branch `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` for
supervised run `run-20261114T141555Z`. No baseline exists, so every finding has scope `initial`.

The reviewer found no defect in the production code:

- `read_data_health` pages `read_coverage` unchanged, with `lifecycle="active"`, `limit=500` and
  the previous cursor, until the cursor is null. It catches nothing.
- It folds each page into running counts. The union keeps five symbols at most.
- Both checks are `None` when the first page reports `never_acquired`.
- It reads `affected_count` from `PROBLEM_COUNT_SQL` and leaves the transaction open for the
  caller.
- The count rules follow DEC-0213 (a) to (e) and DEC-0220, and the status rules follow the RD 2.5
  flowchart.
- No delivered file changed.

All eleven required validation commands pass. That includes the full suite: 2847 tests against a
real PostgreSQL 16 container, with the 3000-stock slow test included. The TDD-evidence lint is
clean, and the reviewed patch matches the committed code byte for byte.

The gate fails on test strength. The reviewer ran 81 mutants: 39 from the shared catalogue and 42
written by hand, including the coder's eleven under review ids. Five survived. One is equivalent.
The other four are not:

- **IR-001 (HIGH).** `rv:state-any-datatype` drops `s.data_type = 'fundamentals'` from
  `FUNDAMENTALS_STATE_SQL`, and all 43 focused tests still pass. DAC-E2-5 and DEC-0213 (e) define
  `problem_count` and `as_of` from the *fundamentals* `acquisition_state` row. Without the
  predicate, the fold reads whichever data type's row the statement returns last for each stock.
  Every test seed records a stock's fundamentals after its other data types, so no test can see
  the difference.
- **IR-002 (MEDIUM).** Two mutants survive on the cross-page merge of gap availability, which the
  plan specifies in Open Gap 4 and T012. In one, the last page's availability wins. In the other,
  the reason comes from the last unavailable page instead of the first. T010 (b) checks only the
  order "available, then unavailable".
- **IR-003 (MEDIUM).** No test pins the package export of `read_data_health` (T013, RD 2.1). This
  is the same gap that E2-S2 v1 IR-003 found for `read_attention`.

One LOW finding covers the TDD evidence. It records a single cycle where the plan asked for one
cycle per test task, and one recorded kill was a `NameError` rather than a failed assertion.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S3.md`. Status `in-review`. Content revision `sha256:3db8d992…c1f1a`, equal to the approval's `reviewed_revision` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S3-tasks.md` (v1, draft; T001 to T016 checked) |
| Component | `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-003-E2-S3-run-20261114T141555Z` |
| HEAD | `5773f19fcdcb1f9edffc604a13477c747cde42f0` (`feat(CAP-003-E2-S3): story-coding, read_data_health checks`) |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` = `c4e031f8cc1df324da43863c083ac10953056944`, resolved by `pipeline-state.py review-base --base-ref …`. `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before review. No staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 64, all in one commit: 3 modified source files, 2 new test files, 3 modified or new story documents, and 56 new evidence files |
| Baseline | None: initial review |
| Pipeline state | `pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` → `READY` ("story is ready for independent review"). Without `--base-ref`, the check reports `BLOCKED` ("story coding has not reached in-review"). The default-branch base pulls sibling commits into the TDD lint, which E2-S2's reviews also recorded |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/data_health/reader.py` | modified (+173/-2) | T012; AC-11, AC-12, AC-21, AC-24, DAC-E2-4, DAC-E2-5, DAC-E2-15, DAC-E2-S3-1 to DAC-E2-S3-3 |
| `src/factorflow/data_health/queries.py` | modified (+26) | T011; DAC-E2-5, AC-11. The plan's Resolved Conflict 2 places these constants here, following RD 2.1 |
| `src/factorflow/data_health/__init__.py` | modified (+4/-4) | T013 (RD 2.1) |
| `tests/unit/test_data_health_checks.py` | added (+261) | T002, T003, T009, T010 (TC-COMP-035, TC-COMP-047) |
| `tests/integration/test_data_health_checks.py` | added (+390) | T004 to T008 (TC-COMP-038, -048, -049) |
| `docs/…/stories/CAP-003-E2-S3-tdd-evidence.yaml` | added | T016 |
| `docs/…/stories/CAP-003-E2-S3-evidence/` (56 files) | added | T016 evidence: `cycle-1.patch`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`, `red-cycle-1-checks.log` and 52 mutation logs (2 baselines and 50 mutants) |
| `docs/…/stories/CAP-003-E2-S3-tasks.md` | modified | Bookkeeping: T001 to T016 checked. No other line changed |
| `docs/…/stories/CAP-003-E2-S3.md` | modified | Bookkeeping: `status: planning` → `in-review`. The content revision is unchanged |

Every changed file is justified by the story or the plan. `pyproject.toml`, `uv.lock`, the
migrations, `tests/conftest.py`, `coverage/service.py` and every other delivered module are
untouched (DEC-0211).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `reader.py:296-336` `read_data_health` returns `DataHealth` with `affected_count`, both checks, `latest_session` and `as_of` | `test_a_real_store_with_every_group_and_a_partial_download` (literal checks, `affected_count`, rows); TC-COMP-035 and TC-COMP-047 unit literals | Each check carries the time it is current to: `latest_session` and `as_of` |
| AC-12 | SATISFIED | `reader.py:229-252` counts every exception group. Status is `exceptions` when any count is above zero (`:256`, `:274`) | T007 runs on a `partial` run store and both checks read `exceptions` | IR-001: one way to read the financials check as clean is not guarded |
| AC-21 | SATISFIED | `reader.py:311-314`, `:333-334`: `never_acquired` comes from page 1, and both checks are `None` | `test_empty_store_is_never_acquired_with_null_checks`, `test_a_download_that_ended_with_every_request_failed_is_never_acquired_with_rows` | `rv:never-acquired-*-built` and `314:negate-boolean` are killed |
| AC-24 | SATISFIED | `reader.py:255` sets `gap_stock_count` to `None` when unavailable | TC-COMP-035 (d), (f); T008; T010 (b), (c) | `rv:gap-count-zero-when-unavailable` is killed |
| DAC-E2-4 | SATISFIED | `reader.py:254-271`: the status order is `exceptions`, then `not_determinable`, then `ok`. The reason comes from the view (`:226-228`) | TC-COMP-035 (a)-(f), full literals; T008 on a real store | IR-002: the cross-page merge of availability is pinned in one direction only |
| DAC-E2-5 | SATISFIED | `reader.py:230-252`: `_UNSEEN` covers presence `absent` and `unknown`, behind is `covered_to < latest_session`, problem is `in ("failed", "not_found")`, and each stock is added once per union. `queries.py:115-134` holds `latest_session` and the fundamentals state | TC-COMP-047 tests; T007; T010 (a) | The code is correct. IR-001: the fundamentals-only predicate of the problem and `as_of` source is unpinned |
| DAC-E2-15 | SATISFIED | `reader.py:311`, `:319`: `lifecycle="active"`, `limit=MAX_LIMIT` and the previous `next_cursor`. There is no `try` or `except` in the module | `test_read_data_health_pages_read_coverage_unchanged_to_a_null_cursor` (literal kwargs for three calls), the one-page test, and `test_value_error_from_read_coverage_propagates_unchanged` (`is err`) | `rv:value-error-wrapped`, `rv:limit-50`, `rv:cursor-none`, `rv:lifecycle-none` and `311:drop-defaulted-argument` are all killed |
| DAC-E2-S3-1 | SATISFIED | As DAC-E2-5 | `test_unknown_presence_counts_as_absent_not_behind`, `test_absent_and_failed_is_in_both_counts_and_once_in_the_union`, `test_gaps_and_behind_is_one_stock_in_the_union` | `rv:unknown-not-absent`, `rv:prices-union-per-group` and `rv:financials-union-per-group` are killed |
| DAC-E2-S3-2 | SATISFIED | `reader.py:321-327`: `affected_count` and the first page are read whether or not anything was acquired | The two TC-COMP-048 tests: 60 affected, 50 rows `P0001` to `P0050`, cursor `P0050`, four failures each, `retryable` | `rv:affected-from-rows` is killed (`assert 50 == 60`) |
| DAC-E2-S3-3 | SATISFIED | `reader.py:194-204` `_Union` keeps five at most. Pages are `lifecycle="active"`, and `FUNDAMENTALS_STATE_SQL` is keyed by page symbols | `test_retired_stocks_are_excluded_and_3000_stocks_take_six_pages` (six cursors, literal checks, `R0001` absent); `test_union_keeps_at_most_five_symbols` | `rv:head-*-any-lifecycle` and `203:off-by-one` are killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S1's models, `PROBLEM_COUNT_SQL` and `read_problems` exist at base. `coverage/service.py` exports `MAX_LIMIT == 500`, `UNAVAILABLE_REASON` and the signature the plan states. `migrated_writer_connection` exists | Nothing was edited |
| T002 | complete | VERIFIED | `tests/unit/test_data_health_checks.py:107-153`, six parametrised cases (a)-(f) with full `DailyPricesCheck` literals | Every planned kill dies, including `256:off-by-one:1`, `258:negate-boolean`, `rv:status-drops-gap-term` and `rv:gap-count-zero-when-unavailable` |
| T003 | complete | VERIFIED | `:156-212`, five tests for rules (a)-(e) | All planned kills die |
| T004 | complete | VERIFIED | `tests/integration/test_data_health_checks.py:158-206` | Literal `(args, kwargs)` for three pages and for one page. The `ValueError` identity is checked |
| T005 | complete | VERIFIED | `:209-257` | Both stores. The plan's affected-count mutant is killed once written so it runs (IR-004) |
| T006 | complete | VERIFIED | `:260-303`, `@pytest.mark.slow`, ran in the focused and full suites | Six cursors; literal checks at 3000 stocks; `followed_count == 3000` |
| T007 | complete | VERIFIED | `:306-364` | Every planned kill dies. The test is `WEAK` against `rv:state-any-datatype` (IR-001) |
| T008 | complete | VERIFIED | `:367-390` | Literal checks on a one-stock store |
| T009 | complete | VERIFIED | `tests/unit/test_data_health_checks.py:215-223` | `len(union.symbols) <= 5` after every `add`; 3000 count |
| T010 | complete | VERIFIED | `:226-261`, cases (a), (b) and (c) | (b) is `WEAK` against `rv:availability-last-page-wins` and `rv:gap-reason-last-unavailable` (IR-002) |
| T011 | complete | VERIFIED | `queries.py:109-134`: `DATA_HEALTH_HEAD_SQL` and `FUNDAMENTALS_STATE_SQL` as planned, each `Final[str]`, a single `SELECT` with only a bound `%(symbols)s` | S1's read-only guard passes (20 tests) |
| T012 | complete | VERIFIED | `reader.py:186-336` | Two minor deviations, both justified (see Scope and Plan Deviations): rows are unpacked without `cast`, and `_fundamentals_state` returns early for an empty page |
| T013 | complete | VERIFIED | `__init__.py:7,9` | The export is present. No test pins it (IR-003) |
| T014 | complete | VERIFIED | The guard command passes, 38 tests | No router registered and no `factorflow.api` import |
| T015 | complete | VERIFIED | The full validation set passes (see Independent Validation). The five TC-ID comments are present | `git diff --stat` also lists the evidence directory, story and plan bookkeeping, as every sibling story's does |
| T016 | complete | VERIFIED | `CAP-003-E2-S3-tdd-evidence.yaml` cycle-1; the lint reports 0 errors and 0 warnings; the `reviewed_patch` `src`/`tests` hunks equal `git diff c4e031f..HEAD -- src tests` | IR-004: one cycle where the plan asked for one cycle per test task, and one manual kill was a `NameError` |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_daily_prices_status_and_null_gap_count` / TC-COMP-035 | ADEQUATE | Full `DailyPricesCheck` literals for six cases. They cover the three statuses, a null gap count when unavailable, the reason carried, and the edge case "unavailable and absent". The reason is written as a literal, independent of the code | none |
| Five rule tests / TC-COMP-047 | ADEQUATE | Unknown counts as absent and not behind (both checks are literals). Absent-and-failed and gaps-and-behind each count once in their union. `not_found` is a problem and `written` is not, with `as_of` T1. More than five symbols across a page boundary keep the first five, with count 7 | none |
| `test_union_keeps_at_most_five_symbols` / T009 | ADEQUATE | Bounded after every `add`; count 3000; the first five kept | none |
| `test_financials_as_of_is_the_latest_written_across_pages` / T010 (a) | ADEQUATE | Max across pages; the `written` filter; `problem_count` | none |
| `test_gap_availability_is_the_conjunction_over_pages` / T010 (b) | **WEAK** | Pages "available, then unavailable" give null, the reason and `not_determinable` | The reverse order, and two unavailable pages with distinct reasons, are unpinned (IR-002) |
| `test_no_prices_anywhere_leaves_latest_session_null` / T010 (c) | ADEQUATE | Full literal; no `TypeError` with a null `latest_session` | none |
| Three paging tests / TC-COMP-038 | ADEQUATE | Literal `(args, kwargs)` per call, including connection identity and an explicit `cursor: None`; the spy caps calls at ten; `ValueError` identity | none |
| Two never-acquired tests / TC-COMP-048 | ADEQUATE | Empty store; a store where everything failed, with 60 affected, 50 rows, the cursor, four failures each and `retryable` | none |
| `test_retired_stocks_are_excluded_and_3000_stocks_take_six_pages` / TC-COMP-049 | ADEQUATE | Six cursors, `lifecycle` and `limit` on every call, literal checks, rows | none |
| `test_a_real_store_with_every_group_and_a_partial_download` / T007 | **WEAK** | Literal checks over every group; `affected_count`; rows; `checked_at == now()` in the open transaction; `INTRANS` | Every seed writes a stock's fundamentals row after its other data types, so a fundamentals state read without its data-type predicate is invisible (IR-001) |
| `test_not_determinable_on_a_real_store` / T008 | ADEQUATE | Literal `not_determinable` with the reason; financials `ok` with `as_of` T1 | none |
| Package export of `read_data_health` / T013 | MISSING (no test planned) | — | IR-003 |

**Mutation run.** The reviewer generated 39 mutants with the shared catalogue over every changed
production file. The catalogue produces none for `queries.py` or `__init__.py`. The reviewer added
42 manual mutants:

- The coder's eleven, under `rv:` ids. `rv:affected-from-rows` is rewritten so that it runs.
- Thirty-one of the reviewer's own. They cover each union and count rule, the status terms,
  `as_of` (min, last-wins, any outcome), the page loop, `latest_session`, `checked_at`
  (Python clock, `statement_timestamp()`), a wrapped `ValueError`, both new statements and the
  package export.

Results, run with the focused suites: 76 killed and 5 survived. Results sha256 `86c6ca21…f6db5`,
copied beside this report.

| Survivor | Equivalent? | Disposition |
|----------|-------------|-------------|
| `reader.py:251:off-by-one:1` (`>` → `>=` in the `as_of` maximum) | Yes | When the two instants are equal, the assignment stores the same value. DEC-0213 (e) defines `as_of` as an instant, so no artifact can observe the difference. This matches the coder's recorded disposition |
| `rv:state-any-datatype` | No | IR-001 |
| `rv:availability-last-page-wins` | No | IR-002 |
| `rv:gap-reason-last-unavailable` | No | IR-002. The plan's T012 says "keep the first such reason", and Open Gap 4 says "carries the first unavailable page's reason" |
| `rv:export-dropped` | No | IR-003 |

The tests are isolated and deterministic. Each integration test has its own migrated database,
every seed uses fixed literal times and commits before the read, and the unit tests use no
database. Mocks never bypass the unit under test: the spy delegates to the delivered
`read_coverage`, and the unit fold receives hand-built `coverage-service` values of the shapes
`_instrument_coverage` produces.

## Independent Validation

All commands ran from the reviewer's shell against `repos/factorflow-v2/FactorFlow-v2`
(abbreviated `<repo>`). `uv … --directory <repo>` runs with `<repo>` as its working directory.
Every command ran inside the sandbox, and none was refused.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` (prerequisite, not counted) | harness root | 0 | PASS | All eight checks passed |
| `uv run --directory <repo> pytest tests/unit/test_data_health_checks.py tests/integration/test_data_health_checks.py tests/unit/test_data_health_sql_is_read_only.py` (plan: Focused) | `<repo>` | 0 | PASS | 43 passed in 2.76s: 15 unit, 8 postgres including the slow 3000-stock test, and 20 read-only |
| `uv run --directory <repo> pytest tests/unit/test_data_health_sql_is_read_only.py tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py` (T014) | `<repo>` | 0 | PASS | 38 passed |
| `uv sync --directory <repo> --all-extras --offline` | `<repo>` | 0 | PASS | Resolved 46 packages, checked 43 |
| `uv build --directory <repo> --offline` | `<repo>` | 0 | PASS | Built `dist/factorflow-0.2.0.tar.gz` and `dist/factorflow-0.2.0-py3-none-any.whl` |
| `uv run --directory <repo> pytest` | `<repo>` | 0 | PASS | 2847 passed with 2 warnings (starlette deprecations) in 345.85s. This is the full suite with the `postgres` tests included, not an exclusion run |
| `uv run --directory <repo> ruff check .` | `<repo>` | 0 | PASS | All checks passed |
| `uv run --directory <repo> ruff format --check .` | `<repo>` | 0 | PASS | 297 files already formatted |
| `uv run --directory <repo> mypy src` | `<repo>` | 0 | PASS | No issues in 65 source files |
| `grep -n "except" src/factorflow/data_health/reader.py` (plan: DAC-E2-15) | `<repo>` | 0 | PASS (intent) | It prints four lines, all of them the required words "exception symbols" (l.20) and the status literal `"exceptions"` (l.257, 274, 276). None is an `except` clause. `grep -nw "except"` and `grep -n "try:"` both exit 1 with no match. See Scope and Plan Deviations |
| `grep -nE "conn\.(commit\|rollback\|transaction)\(" src/factorflow/data_health/reader.py` | `<repo>` | 1 | PASS | No match, the required result |
| `python3 scripts/check-tdd-evidence.py --evidence <repo>/docs/…/CAP-003-E2-S3-tdd-evidence.yaml --repo-dir <repo> --base c4e031f8cc1df324da43863c083ac10953056944 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir <repo> --range c4e031f…..HEAD --cycle review --out <scratch>/mutants.json`, plus 42 manual mutants appended | harness root | 0 | — | 39 generated: 20 off-by-one, 14 negate-boolean, 3 drop-field-copy, 2 drop-defaulted-argument |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <scratch>/mutants.json --jobs 3 --command 'uv run --offline --all-extras pytest tests/unit/test_data_health_checks.py tests/integration/test_data_health_checks.py tests/unit/test_data_health_sql_is_read_only.py -x -q -p no:cacheprovider' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 3 | FAIL | 81 mutants: 76 killed and 5 survived (1 equivalent). Three baselines passed. The first attempt exited 1 before running anything, because `--work-root` did not exist yet. It was created and the command rerun unchanged |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | — | N/A | NOT RUN | Not required. The story's Validation and the plan's Validation Plan name only the Python commands, and the change set holds no frontend file |

The mutation run is TDD evidence (skill step E.9), not a required validation command. Its
survivors are reported as findings IR-001 to IR-003.

### Validation Side Effects

- Before: `git status --porcelain --untracked-files=all` was empty at `5773f19`, and
  `pipeline-state.py code-revision` gave `sha256:34b1fb90…26c0`. Ignored build outputs and caches
  (`dist/`, `build/`, `src/factorflow.egg-info/`, `.hypothesis/`) were already present.
- After: HEAD was still `5773f19`, `git status --porcelain --untracked-files=all` was empty, and
  `code-revision` gave the same `sha256:34b1fb90…26c0`. `uv build` refreshed the ignored `dist/`,
  `build/` and `src/factorflow.egg-info/`. The mutation run worked in clones under the reviewer's
  scratch directory, outside the repository. The only files the reviewer adds are this report and
  its `-mutation.json`.
- Unexpected tracked-file changes: none.

## Findings

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 1 · MEDIUM 2 · LOW 1 · **total 4**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | initial | OPEN | The fundamentals-only predicate of `FUNDAMENTALS_STATE_SQL` is unpinned. `problem_count` and `as_of` can come from another data type's state |
| IR-002 | MEDIUM | initial | OPEN | The cross-page merge of gap availability is pinned in one direction only |
| IR-003 | MEDIUM | initial | OPEN | No test pins the package export of `read_data_health` |
| IR-004 | LOW | initial | OPEN | The TDD evidence is coarser than the plan, and one recorded kill was a `NameError` |

### IR-001 — The fundamentals-only predicate of `FUNDAMENTALS_STATE_SQL` is unpinned: `problem_count` and `as_of` can come from another data type's state

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-5, DAC-E2-S3-1 and AC-12. The code satisfies them, but the
  tests that should guard them cannot see this violation.
- **Tasks**: T007, which guards T011's `FUNDAMENTALS_STATE_SQL`
- **Files**:
  - `src/factorflow/data_health/queries.py:128-134` (`WHERE s.data_type = 'fundamentals'`)
  - `src/factorflow/data_health/reader.py:285-293` (`_fundamentals_state`, a dict comprehension
    that keeps the last row per symbol) and `:243-252`
  - `tests/integration/test_data_health_checks.py:306-364` (T007), `:367-390` (T008), `:260-303`
    (TC-COMP-049)
- **Claim challenged**: T007 proves the financials count rules on a real store. The plan names
  `s.data_type = 'fundamentals'` → `'prices'` as T007's kill.
- **Observed evidence**:
  - `rv:state-any-datatype` drops the predicate, leaving `WHERE i.symbol = ANY(%(symbols)s)`. All
    43 focused tests pass (log `rv_state-any-datatype.log`: `43 passed in 2.69s`). The coder's
    `'prices'` substitution is killed, so the predicate's value is pinned, but its presence is not.
  - Without the predicate, the statement returns up to four rows per symbol in no specified order.
    `_fundamentals_state` keeps whichever row comes last.
  - Every seed that reaches the fold writes a stock's `fundamentals` state after its other data
    types (T007's `AAA`, `BBB`, `CCC` and `EEE`; T008's `SOLO`), or writes fundamentals only
    (TC-COMP-049's `S0003`). In heap order the fundamentals row is therefore always last, and the
    mapping is unchanged.
  - No test has an active stock whose non-fundamentals outcome differs from its fundamentals
    outcome and is recorded after it.
- **Expected evidence/behavior**:
  - DAC-E2-5: "the financials `problem_count` MUST count active stocks whose fundamentals
    `last_outcome` is `failed` or `not_found`".
  - DEC-0213 (e): "`as_of` is the latest fundamentals `last_acquired_at` whose `last_outcome` is
    `written`".
  - RD 2.5 states the same rules.
  - Skill step E.9 says that a survivor makes the test that should kill it `WEAK`. This follows
    E2-S1 v1 IR-001: when the AC-level rule itself is unguarded, the finding is HIGH even if the
    weak test is an additional one.
- **Impact**: This is the reviewer's derivation from the code. A scratch-clone probe was not run,
  because the permission request for it was denied. On a real store the delivered writer upserts
  `acquisition_state` for all four data types, and updated rows move in heap order. Under the
  mutant:
  - A stock with an earlier fundamentals segment but a latest fundamentals `failed` is read as
    `written` when another data type's `written` row comes last. `problem_count` drops, and when
    no stock is absent the Company financials check reads `ok`. That is the clean-looking check
    AC-12 forbids.
  - A stock whose only failure is `prices` or `reference` is counted as a fundamentals problem.
  - `as_of` can become another data type's `last_acquired_at`.

  Every test stays green.
- **Required remediation**: Kill `rv:state-any-datatype` with the story's focused suites. Seed at
  least one active stock whose non-fundamentals outcome differs from its fundamentals outcome and
  is recorded after it. Examples are fundamentals `written` followed by `prices` `failed`, or
  fundamentals `failed` followed by `corporate_actions` `written` at a later time. Then assert the
  literal `CompanyFinancialsCheck`: `problem_count` and `as_of` must come from the fundamentals
  rows only.

### IR-002 — The cross-page merge of gap availability is pinned in one direction only

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-4 and AC-24 are not made incomplete. TC-COMP-035 and T008 pin
  the null count, the reason and `not_determinable` for an unavailable view. Only the merge across
  pages is unpinned.
- **Tasks**: T010 (b), which guards T012's `add_page` availability rule
- **Files**:
  - `src/factorflow/data_health/reader.py:226-228`
  - `tests/unit/test_data_health_checks.py:240-251` (`test_gap_availability_is_the_conjunction_over_pages`)
- **Claim challenged**: T010 (b) proves that "availability is the conjunction over pages", and
  that the first unavailable page's reason is carried (T012; plan Open Gap 4).
- **Observed evidence**: Two non-equivalent mutants pass all 43 focused tests:
  - `rv:availability-last-page-wins` replaces the guarded block with
    `self.gaps_available = view.gap_detection.available` and
    `self.gaps_reason = view.gap_detection.reason`, so the last page decides.
  - `rv:gap-reason-last-unavailable` drops `and self.gaps_available`, so a later unavailable page
    overwrites the reason.

  T010 (b) folds only the order "available, then unavailable". Last-wins and conjunction agree on
  that order, and every unavailable page in the tests carries the same reason.
- **Expected evidence/behavior**:
  - Plan Open Gap 4: "treats detection as available only when every page reported it available,
    and carries the first unavailable page's reason".
  - T012: "keep the first such reason".
  - Open Gap 4 also cites DEC-0213 (c) and STD-UI-4: "a count that could not be computed for part
    of the roster is null, never a partial number".
  - The severity follows E2-S1 v1 IR-003. T010 is an additional test, and the AC behaviour it
    supports is pinned elsewhere.
- **Impact**: Availability can change between pages only while a download writes during the read
  (plan Open Gap 4). Under the first mutant, the order "unavailable, then available" returns a gap
  count computed from the later pages only. The status can then be `ok`, a partial number shown as
  complete. The reason mutant cannot be observed with the delivered `coverage-service`, which has
  one reason constant. It changes plan-specified behaviour that a later `coverage-service` reason
  would expose.
- **Required remediation**: Kill both mutants with the focused suites. Add a unit fold over
  pages "unavailable (reason r1), then available, then unavailable (reason r2)". Assert that
  `gap_stock_count is None`, that `gap_detection == GapDetectionState(False, "r1")`, and the
  status.

### IR-003 — No test pins the package export of `read_data_health`

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. T013 carries no mandatory TC-ID.
- **Tasks**: T013
- **Files**: `src/factorflow/data_health/__init__.py:7,9`; `tests/` (absence)
- **Claim challenged**: T013 adds `read_data_health` to the package exports (RD 2.1: "exports
  read_attention, read_data_health, read_problems").
- **Observed evidence**: The export is present and correct at HEAD. `rv:export-dropped` removes it
  from both the import and `__all__`, and the focused suites still pass (`43 passed in 2.74s`). The
  full suite would not catch it either. Both new test files import from
  `factorflow.data_health.reader`. The only package-level export test,
  `tests/unit/test_data_health_items.py:99-103`, checks `read_attention` alone.
- **Expected evidence/behavior**: A plan-specified public export should be pinned. The plan's
  Phase 2 defines no test for T013, so the gap comes from the plan rather than from a skipped
  requirement. That makes it MEDIUM, consistent with E2-S2 v1 IR-003, which raised the same gap
  for `read_attention`.
- **Impact**: None for any current caller. `data-health-api` (E2-S4) will import it, and a later
  edit could drop it unnoticed until then.
- **Required remediation**: Assert that `factorflow.data_health.read_data_health is
  factorflow.data_health.reader.read_data_health` and that `"read_data_health" in
  factorflow.data_health.__all__`. For example, add the assertion beside the existing
  `read_attention` export test.

### IR-004 — The TDD evidence is coarser than the plan, and one recorded kill was a `NameError`

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T016, and the Task Dependencies line for T002, T003, T009 and T010
- **Files**:
  - `docs/…/stories/CAP-003-E2-S3-tdd-evidence.yaml` (one cycle, `tasks: [T001 … T016]`)
  - `docs/…/stories/CAP-003-E2-S3-evidence/red-cycle-1-checks.log`
  - `docs/…/stories/CAP-003-E2-S3-evidence/mutants-cycle-1.json` (`man:affected-len`)
  - `docs/…/stories/CAP-003-E2-S3-evidence/mutation-cycle-1-results-logs/man_affected-len.log:55`
- **Claim challenged**: T016 runs "after each TDD cycle … not once at the end", and the plan's
  Task Dependencies say "write them in sequence (one cycle each)". The mutation block records 49
  kills.
- **Observed evidence**:
  - One cycle covers all sixteen tasks, so the independent reviews ran once, at the end.
  - The RED log is a single collection `ImportError` for the unit module, captured with `-x`. No
    integration test and no individual assertion is shown failing for its intended reason.
  - The coder's `man:affected-len` replaces the value with `len(problems_rows)`, a name that does
    not exist. It was scored killed by `NameError: name 'problems_rows' is not defined`, not by an
    assertion.
  - The reviewer's runnable form, `rv:affected-from-rows`, is killed by TC-COMP-048
    (`assert 50 == 60`). No test gap results.
- **Expected evidence/behavior**: Cycles as the plan sequences them. A manual mutant that executes
  and fails an assertion. The lint passes, and the plan's Phase 2 checkpoint accepts an
  `ImportError` RED, so this is evidence quality only.
- **Impact**: The evidence overstates how much behaviour the coder's mutants proved. The
  reviewer's run makes up for it at this gate.
- **Required remediation**: Optional. In the rework, record the new tests as their own cycle with
  a RED that fails on assertions. Write manual mutants so they execute.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, T012.** The plan asks that `fetchone()` rows be typed with `cast`. The code unpacks
  the rows as tuples, and `mypy src` passes, so the outcome the plan wanted (strict type check
  clean) holds.
- **Justified, T012.** "`_fundamentals_state` is not called for a page with no instruments." It is
  called, but it returns `{}` before any statement runs (`reader.py:289-290`). The observable
  result is the same: no statement is issued. `289:negate-boolean` is killed.
- **Plan defect, not the coder's: the story-specific validation for DAC-E2-15.**
  `grep -n "except" reader.py` "prints nothing" cannot hold while RD 2.2's status literal
  `"exceptions"` exists, because the pattern matches a substring. The intent holds: there is no
  `except` clause and no `try`. A future plan revision could use `grep -nw "except"`.
- **Bookkeeping.** The story status changed from `planning` to `in-review`, and all sixteen tasks
  are checked. Both match the evidence. No out-of-scope file, dependency or refactor was found.
- **Recorded open gaps, not findings.** The plan's Open Gaps 1 to 6 are mechanisms the plan flags
  for the next revision of RD §2.2, §2.5 and §5:
  - one fundamentals lookup per page;
  - `latest_session` read first;
  - its own head statement;
  - availability as a conjunction;
  - snapshots under READ COMMITTED;
  - six gap detections.

  The reviewer confirmed the claim in Open Gap 2 against `coverage/sql/coverage.sql`: with no
  date bounds, an instrument's `covered_to` is the `MAX(covered_to)` of its `prices` segments, so
  `DATA_HEALTH_HEAD_SQL`'s `latest_session` equals the maximum over the pages.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework against this report and the task plan
  `CAP-003-E2-S3-tasks.md`. IR-001 must be resolved: kill `rv:state-any-datatype` with a seeded
  store whose non-fundamentals outcome is recorded after, and differs from, the fundamentals
  outcome. IR-002 and IR-003 should be resolved in the same rework: one unit fold, plus one export
  assertion. Each fix changes tests only. Record the rework as a new TDD-evidence cycle, set
  `last_reworked_review: CAP-003-E2-S3-implementation-review-v1.md` in the task file, then rerun
  this review.
- **Warnings accepted downstream**: N/A
