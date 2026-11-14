---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S2-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E2-S2"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-14T19:16:29Z"
reviewed_head: "3e5f718e3830a6aea385053edd2f9c3de18e8912"
review_base: "39b43c4353a6c0ec994b458b15ba625f184f2626"
reviewed_state_revision: "sha256:d7a224983d85b761050188c491b8afc72ff619a0a352400944b56ba2280efd27"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-003-E2-S2
    artifact_version: 1
    content_revision: sha256:1b45fc6f3fbc39766428d6f2ed6b59517a4e8fc4b81d5b6cf9fdb8a50237d1fe
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-14T19:16:29Z
  source_artifacts:
    - id: CAP-003-E2-S2
      version: "1 (sha256:1b45fc6f3fbc39766428d6f2ed6b59517a4e8fc4b81d5b6cf9fdb8a50237d1fe)"
    - id: CAP-003-E2-S2-tasks
      version: "1 (draft, last_reworked_review CAP-003-E2-S2-implementation-review-v1.md)"
    - id: CAP-003-E2-S2-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-003-E2-S2-implementation-review
      version: "1 (baseline, reviewed_head cdd17562144f59d484435af31e0c8e7d2a261f90)"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003-component-design-data-health-reader
      version: "2"
    - id: CAP-003-system-design
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

# Implementation Review: CAP-003-E2-S2 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 18/18 verified |
| Required validation | 11/11 passed |

This re-review checks `3e5f718` against review base `39b43c4`, the tip of the CAP-003 integration
branch `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` for supervised run
`run-20261114T141555Z`. Its baseline is v1 (`CHANGES-REQUIRED`, `reviewed_head` `cdd1756`).

The rework changed tests only. `git diff cdd1756..HEAD -- src` is empty, so the production code is
the code v1 found correct. The rework resolves all three v1 findings:

- **v1 IR-001.** A new whole-value `LatestDownload` assertion uses three distinct non-null instants,
  and a second one checks a `requested` run with no start and no end. The five carried
  timestamp-mapping mutants are now killed.
- **v1 IR-002.** The all-causes unit case now compares each item with a literal, keyed by kind.
  This kills `rv:credential-item-recorded`.
- **v1 IR-003.** A new unit test pins the package export, which kills `rv:export-dropped`.

The reviewer reran all 56 baseline mutants (scope `carried`) and added 14 of its own (scope `late`).
All 70 were killed and none survived. Every required validation command passes, including the full
suite with the `postgres` tests (2822 passed). The TDD-evidence lint is clean.

Two LOW findings remain. Both are traceability labels on lines the rework changed. Neither affects
behaviour or test strength, so the gate passes with warnings.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2.md` (status `in-review`; content revision `sha256:1b45fc6f…d1fe`, equal to the approval's `reviewed_revision`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2-tasks.md` (`last_reworked_review: CAP-003-E2-S2-implementation-review-v1.md`) |
| Component | `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-003-E2-S2-run-20261114T141555Z` |
| HEAD | `3e5f718e3830a6aea385053edd2f9c3de18e8912` (`feat(CAP-003-E2-S2): story-coding cycle 2, review rework of implementation-review-v1`) |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` = `39b43c4353a6c0ec994b458b15ba625f184f2626`, from `pipeline-state.py review-base --base-ref …`. `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before review: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 58 across three commits (`cdd1756`, `85c9754`, `3e5f718`): 5 modified, 53 added. 20 of them changed since the baseline |
| Baseline | v1, `reviewed_head` `cdd17562144f59d484435af31e0c8e7d2a261f90`, with `CAP-003-E2-S2-implementation-review-v1-mutation.json` |
| Pipeline state | `pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` → `READY` ("review changes were reworked; a new review version is required"). Without `--base-ref` it reports `BLOCKED`, because the default-branch base pulls E2-S1's commits into the TDD lint. This is the same behaviour v1 recorded |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/data_health/queries.py` | modified (+55); unchanged since baseline | T013; AC-7, AC-8, AC-12, AC-21, DAC-E2-6, DAC-E2-7, DAC-E2-S2-4 |
| `src/factorflow/data_health/reader.py` | modified (+116/-4); unchanged since baseline | T014; AC-7, AC-8, AC-9, AC-12, AC-21, DAC-E2-6 to DAC-E2-8, DAC-E2-S2-1 to DAC-E2-S2-4 |
| `src/factorflow/data_health/__init__.py` | modified (+4/-4); unchanged since baseline | T015 (RD 2.1, plan Resolved Conflict 3) |
| `tests/unit/test_data_health_items.py` | added (+127); +13/-4 since baseline | T002, T003; the rework for v1 IR-002 and IR-003 |
| `tests/integration/test_data_health_attention.py` | added (+711); +41 since baseline | T004 to T012; the rework for v1 IR-001 |
| `docs/…/stories/CAP-003-E2-S2-tdd-evidence.yaml` | added; cycle-2 appended since baseline | T018 |
| `docs/…/stories/CAP-003-E2-S2-evidence/` (cycle-1: 34 files) | added | T018 evidence for cycle-1: patch, mutants, results, 30 logs and the RED log |
| `docs/…/stories/CAP-003-E2-S2-evidence/` (cycle-2: 14 files) | added since baseline | T018 evidence for cycle-2: `cycle-2.patch`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json`, 10 logs (3 baselines, 7 mutants) and `red-cycle-2-rework.log` |
| `docs/…/stories/CAP-003-E2-S2-implementation-review-v1.md`, `…-v1-mutation.json` | added (`85c9754`) | The baseline review and its mutation results, committed by the driver |
| `docs/…/stories/CAP-003-E2-S2-tasks.md` | modified | Bookkeeping: T001 to T018 checked; `last_reworked_review` and `updated` added at rework. No other line changed |
| `docs/…/stories/CAP-003-E2-S2.md` | modified | Bookkeeping: `status: planning` → `in-review`. The content revision is unchanged |

No changed file lacks justification. `pyproject.toml`, `uv.lock`, migrations, `tests/conftest.py`
and every delivered module are untouched (DEC-0211).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `queries.py:82-98` `LATEST_DOWNLOAD_SQL` with the `done` scalar subquery; `reader.py:137-146` builds `LatestDownload(…, Progress(done, named if named > 0 else None))` | `test_progress_counts_complete_instruments_and_total_is_null_before_the_claim`, `test_a_single_named_instrument_is_a_total_of_one`, `test_the_same_five_statements_at_3000_instruments`, `test_latest_download_maps_three_distinct_instants_field_for_field` (`Progress(0, 4)`) | `Progress(0, None)` before the claim; `Progress(40, 120)`, `Progress(1, 1)` and `Progress(1500, 3000)` after |
| AC-8 | SATISFIED | `FOLLOWED_COUNT_SQL` (`queries.py:61-66`), `PRICES_AS_OF_SQL` (`queries.py:69-75`); `reader.py:132,155-156` | `test_followed_count_and_prices_as_of_count_only_active_instruments`, `test_empty_store_reads_zero_and_nones`, the 3000-instrument test | Retired instruments, non-prices segments and earlier segments are excluded. `rv2:prices-none` is killed |
| AC-9 | SATISFIED | `_attention_items` (`reader.py:84-107`) is a pure function of the current read; nothing is persisted | `test_items_exist_exactly_while_their_cause_holds` (four store states; four-table snapshot equal before and after two reads); unit item tests, including the reworked all-causes literal comparison | v1 IR-002 is resolved |
| AC-12 | SATISFIED | `reader.py:138-150` passes `state` through as stored; `LatestTerminalDownload(*terminal_row)` | `test_run_states_are_returned_as_recorded` (8 states); whole-value `LatestDownload` and `LatestTerminalDownload` literals | — |
| AC-21 | SATISFIED | `LATEST_TERMINAL_SQL` (`queries.py:102-108`) filters to the five terminal states; `reader.py:148-150` gives `None` when no row comes back | `test_empty_store_reads_zero_and_nones`; `test_run_states_are_returned_as_recorded` (`None` for the three non-terminal states) | — |
| DAC-E2-6 | SATISFIED | `HAVING count(*) = 4` scoped by `x.run_id = r.run_id`; `named if named > 0 else None` | TC-COMP-036 tests | Any outcome counts toward `done`. `done <= total` is asserted. The no-clamp reasoning holds: `run_instrument_result` has primary key `(run_id, instrument_id, data_type)` and a CHECK limiting `data_type` to the four values (`0004_runs.sql:43-45`) |
| DAC-E2-7 | SATISFIED | `ORDER BY r.requested_at DESC, r.run_id DESC`; `WHERE state IN (five) ORDER BY ended_at DESC, run_id DESC` | `test_running_download_does_not_displace_the_latest_terminal_one`, `test_latest_download_maps_three_distinct_instants_field_for_field`, `test_a_requested_latest_download_has_no_start_and_no_end`, `test_latest_terminal_download_is_ordered_by_ended_at_not_requested_at`, both tie tests, T011 step 2 | Both the choice of run and its field mapping are now pinned. All carried order, filter and mapping mutants are killed, as are the reviewer's `rv2:download-by-started`, `rv2:download-by-ended` and both tie-break-direction mutants |
| DAC-E2-8 | SATISFIED | `reader.py:99-106` follows RD 2.7's table row for row; `AttentionItem` has only `kind`, `recorded_at` and `run_id` | Unit item tests; `test_abandoned_latest_terminal_download_gives_the_item`; T011 | No tier and no copy |
| DAC-E2-S2-1 | SATISFIED | `reader.py:110-167` | `test_empty_store_reads_zero_and_nones` | `checked_at` is aware and equals `SELECT now()` in the still-open transaction. This kills `rv:checked-at-clock` and the reviewer's `rv2:checked-at-statement-ts` |
| DAC-E2-S2-2 | SATISFIED | As DAC-E2-7 and DAC-E2-8 | `test_running_download_does_not_displace_the_latest_terminal_one`, `test_abandoned_latest_terminal_download_gives_the_item` | The abandoned item carries the run's `run_id` and `ended_at` (literal `==`) |
| DAC-E2-S2-3 | SATISFIED | `reader.py:22,105-106,152,157,164`: `credential_present` imported by name from `factorflow.config.settings`; the item takes `checked_at` | `test_credential_missing_item_while_the_key_is_absent` (real `delenv`), `test_reader_calls_the_delivered_credential_presence_function`, `test_module_never_reads_the_key_value`, `test_all_three_causes_give_three_items_and_none_give_none` (now per-item literals) | The validation-plan grep prints nothing. `rv2:items-checked-at-clock` and `rv2:attention-present-negated` are killed |
| DAC-E2-S2-4 | SATISFIED | One cursor issuing exactly five constants (`reader.py:117-127`); progress is a scalar subquery of Q4 | `test_five_fixed_statements_on_a_small_store`, `test_the_same_five_statements_at_3000_instruments` | Five statements, not six, per plan Resolved Conflict 1. v1 accepted this, and it is unchanged |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | E2-S1's `models.py`, `queries.PROBLEM_COUNT_SQL`, `reader.read_problems` and `test_data_health_sql_is_read_only.py` all exist. So do `settings.credential_present`, `migrated_writer_connection`, the `0004_runs.sql` constraints and `runs.queries.get_most_recent_run` | `tests/conftest.py` is untouched |
| T002 | complete | VERIFIED | `tests/unit/test_data_health_items.py:42-95` | Case (d) now compares each item with a literal keyed by kind (`:88-94`), as T002 claims ("every expected item is a literal … compared with `==`"). This resolves v1 IR-002 |
| T003 | complete | VERIFIED | `test_data_health_items.py:106-127` | Identity check, and a substring scan over reader and queries |
| T004 | complete | VERIFIED | `test_data_health_attention.py:150-170`; seed helpers `:52-142` | — |
| T005 | complete | VERIFIED | `test_data_health_attention.py:173-238` | — |
| T006 | complete | VERIFIED | `test_data_health_attention.py:241-365` | Cases (a), (b), (c) and the cancelled edge. The rework adds `:268-306`: distinct instants, and a `requested` run with null start and end. This resolves v1 IR-001 |
| T007 | complete | VERIFIED | `test_data_health_attention.py:368-388` | — |
| T008 | complete | VERIFIED | `test_data_health_attention.py:391-510` | — |
| T009 | complete | VERIFIED | `test_data_health_attention.py:513-533` | — |
| T010 | complete | VERIFIED | `test_data_health_attention.py:536-606` | — |
| T011 | complete | VERIFIED | `test_data_health_attention.py:609-682` | — |
| T012 | complete | VERIFIED | `test_data_health_attention.py:685-711` | — |
| T013 | complete | VERIFIED | `queries.py:7-9,59-108` | Unchanged since baseline. The four constants match T013 and pass E2-S1's shape and token guard |
| T014 | complete | VERIFIED | `reader.py:9-15,17-41,84-167` | Unchanged since baseline. Neither grep finds a commit, rollback, transaction, coverage call or environment read |
| T015 | complete | VERIFIED | `__init__.py:7,9` | Unchanged since baseline. Now pinned by `test_read_attention_is_exported_from_the_package` (`test_data_health_items.py:98-103`). This resolves v1 IR-003; its TC label is IR-001 |
| T016 | complete | VERIFIED | Reviewer rerun: 83 passed | — |
| T017 | complete | VERIFIED | Reviewer rerun of the full validation set | All five TC-IDs appear in `# Implements` comments |
| T018 | complete | VERIFIED | `CAP-003-E2-S2-tdd-evidence.yaml` cycles 1 and 2; `check-tdd-evidence.py … --require-logs` → 0 errors, 0 warnings | Cycle-2: `cycle-2.patch` sha256 `e7fe235d…e1c2` equals `diff_sha256`. Its `tests/` hunks equal `git diff cdd1756..HEAD -- tests` (ignoring `index` lines). `red_log_sha256` and `results_sha256` match their files. The 7/7 mutation block reproduces. The task list is IR-002 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_progress_counts_complete_instruments_and_total_is_null_before_the_claim`, `test_a_single_named_instrument_is_a_total_of_one` / TC-COMP-036 | ADEQUATE | Completeness scoped to the run, mixed outcomes, three-type exclusion, null total at 0, total 1. Kills every carried progress mutant, plus `rv2:having-ge-1`, `rv2:named-from-done` and `rv2:latest-download-none` | none |
| `test_empty_store_reads_zero_and_nones` / TC-COMP-043 | ADEQUATE | Full empty shape. `checked_at` equals the transaction's `now()`. First to kill `rv2:checked-at-statement-ts` and `rv2:attention-present-negated` | none |
| `test_running_download_does_not_displace_the_latest_terminal_one`, `test_latest_download_maps_three_distinct_instants_field_for_field`, `test_a_requested_latest_download_has_no_start_and_no_end` / TC-COMP-044 | ADEQUATE (was WEAK) | Whole-value `LatestDownload` literals with `requested_at` ≠ `started_at` ≠ `ended_at`, and with both nullable fields `None`. All five v1 survivors are killed by `test_latest_download_maps_three_distinct_instants_field_for_field` | none |
| `test_abandoned_latest_terminal_download_gives_the_item`, `test_latest_terminal_download_is_ordered_by_ended_at_not_requested_at`, `test_a_store_whose_only_run_is_cancelled_has_no_item` / TC-COMP-044 | ADEQUATE | Literal terminal values and items; ordering by ended rather than requested; the cancelled edge. Also kill `rv2:items-terminal-none` and `rv2:download-by-ended` | none |
| `test_run_states_are_returned_as_recorded` (8), tie tests (2 × 2) / TC-COMP-044 | ADEQUATE | State round-trip, the terminal/non-terminal split, both tie-breaks in both insertion orders. Also kill `rv2:download-tiebreak-asc` and `rv2:terminal-tiebreak-asc` | none |
| Unit item-rule tests / TC-COMP-044, TC-COMP-045 | ADEQUATE | Literal `AttentionItem` equality per rule and per terminal state | none |
| `test_all_three_causes_give_three_items_and_none_give_none` / TC-COMP-045 | ADEQUATE (was WEAK) | `len == 3` and a dict of literal items keyed by kind, so each item keeps its own `recorded_at` and `run_id` while the causes coexist. Kills `rv:credential-item-recorded` | none |
| `test_credential_missing_item_while_the_key_is_absent`, `test_reader_calls_the_delivered_credential_presence_function`, `test_module_never_reads_the_key_value` / TC-COMP-045 | ADEQUATE | Real `delenv`; identity with the delivered function; substring guard. `test_credential_missing_item_while_the_key_is_absent` kills `rv2:items-checked-at-clock` | none |
| `test_five_fixed_statements_on_a_small_store`, `test_the_same_five_statements_at_3000_instruments` / TC-COMP-046 | ADEQUATE | Exactly the five constants, by identity and equality, at 3 and at 3000 instruments; values right at scale | none |
| T009, T011, T012 tests (additional) | ADEQUATE | As in v1. Unchanged since baseline, and every carried mutant on their lines is killed | none |
| `test_read_attention_is_exported_from_the_package` (T015, no mandated TC) | ADEQUATE | Identity of `factorflow.data_health.read_attention` with `reader.read_attention`, and membership in `__all__`. Kills `rv:export-dropped` and the reviewer's `rv2:all-dropped`, which keeps the import and drops only the `__all__` entry | Labelled `# Implements TC-COMP-044`, which this test does not implement (IR-001) |

Isolation and determinism: the three new tests and the reworked unit case use fixed aware instants
(`_t(n)` and module constants), a database per test, and the autouse credential fixture. They do not
depend on order: the unit case compares a dict keyed by kind, never a position.

**Mutation run (reviewer).**

- **Generated.** `generate` over `39b43c4..HEAD` produced 13 catalogue mutants (8
  negate-boolean, 5 off-by-one), identical in id to the baseline's.
- **Added.** The reviewer added 14 manual mutants of its own (`rv2:*`).
- **Scoped.** `scope --since cdd1756 --previous <v1 mutation.json>` brought in the baseline's 43
  manual mutants. It tagged 56 `carried` (the baseline ran them) and 14 `late` (new mutants on lines
  unchanged since the baseline). No baseline mutant had stopped applying.
- **Run.** All 70 ran with the focused suites, `-x`, three workers. All three worker baselines
  passed. **70 killed, 0 survived, 0 stillborn, 0 timeout.** The results are copied beside this
  report as `CAP-003-E2-S2-implementation-review-v2-mutation.json`.

The reviewer's 14 late mutants:

- `rv2:checked-at-statement-ts`: `now()` → `statement_timestamp()`.
- `rv2:download-tiebreak-asc`, `rv2:terminal-tiebreak-asc`: the tie-break runs `ASC`.
- `rv2:download-by-started`, `rv2:download-by-ended`: the latest download is ordered by start or end
  time instead of request time.
- `rv2:named-from-done`: `0 AS instruments_named`.
- `rv2:having-ge-1`: `HAVING count(*) >= 1`.
- `rv2:prices-none`: `prices_as_of` is built as `None`.
- `rv2:items-checked-at-clock`: items take `datetime.now()` instead of `checked_at`.
- `rv2:items-no-problems`: items take an empty problem block.
- `rv2:items-terminal-none`: items get no terminal download.
- `rv2:latest-download-none`: the `Attention` value gets no latest download.
- `rv2:all-dropped`: `__all__` loses `read_attention` while the import stays.
- `rv2:attention-present-negated`: the credential flag is inverted.

## Independent Validation

All commands ran from the reviewer's shell against `repos/factorflow-v2/FactorFlow-v2` (abbreviated
`<repo>`). `uv … --directory <repo>` runs with `<repo>` as its working directory. Every command ran
inside the sandbox; none was refused.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` (prerequisite, not counted) | harness root | 0 | PASS | All eight checks passed |
| `uv run --directory <repo> --offline pytest tests/unit/test_data_health_items.py tests/integration/test_data_health_attention.py -q -p no:cacheprovider` | `<repo>` | 0 | PASS | 40 passed in 4.21s (13 unit, 27 postgres). v1 had 37; the rework added 3 tests |
| `uv run --directory <repo> --offline pytest tests/unit/test_data_health_sql_is_read_only.py tests/unit/test_data_health_models.py tests/integration/test_data_health_problems.py tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py tests/unit/test_credential_presence.py -q -p no:cacheprovider` (T016) | `<repo>` | 0 | PASS | 83 passed in 3.15s |
| `uv sync --directory <repo> --all-extras --offline` | `<repo>` | 0 | PASS | Resolved 46 packages, checked 43 |
| `uv build --directory <repo> --offline` | `<repo>` | 0 | PASS | Built `dist/factorflow-0.2.0.tar.gz` and `dist/factorflow-0.2.0-py3-none-any.whl` |
| `uv run --directory <repo> --offline pytest -q -p no:cacheprovider` | `<repo>` | 0 | PASS | 2822 passed, 2 warnings (starlette and fastapi deprecations), 395.45s. This is the full suite with the `postgres` tests included, not an exclusion run |
| `uv run --directory <repo> --offline ruff check .` | `<repo>` | 0 | PASS | All checks passed |
| `uv run --directory <repo> --offline ruff format --check .` | `<repo>` | 0 | PASS | 295 files already formatted |
| `uv run --directory <repo> --offline mypy src` | `<repo>` | 0 | PASS | No issues in 65 source files |
| `grep -nE "FACTORFLOW_MASSIVE_API_KEY\|os\.environ\|getenv\|get_secret_value" src/factorflow/data_health/` | `<repo>` | 1 | PASS | No match (the required result) |
| `grep -nE "conn\.(commit\|rollback\|transaction)\(" src/factorflow/data_health/reader.py` | `<repo>` | 1 | PASS | No match (the required result) |
| `python3 scripts/check-tdd-evidence.py --evidence <repo>/docs/…/CAP-003-E2-S2-tdd-evidence.yaml --repo-dir <repo> --base 39b43c4353a6c0ec994b458b15ba625f184f2626 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir <repo> --range 39b43c4…..HEAD --cycle review --out <scratch>/generated.json`, plus 14 reviewer manual mutants | harness root | 0 | — | 13 generated |
| `python3 scripts/mutation-run.py scope --repo-dir <repo> --mutants <scratch>/all.json --since cdd17562144f59d484435af31e0c8e7d2a261f90 --previous <repo>/docs/…/CAP-003-E2-S2-implementation-review-v1-mutation.json --out <scratch>/scoped.json` | harness root | 0 | — | 70 mutants: 56 carried, 14 late; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <scratch>/scoped.json --jobs 3 --command 'uv run --offline --all-extras pytest tests/unit/test_data_health_items.py tests/integration/test_data_health_attention.py -x -q -p no:cacheprovider' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 0 | PASS | 70 killed, 0 survived; results sha256 `bce779f3…1801` |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | — | N/A | NOT RUN | Not required. The story's Validation and the plan's Validation Plan name only the Python commands, and no frontend file is in the change set |

### Validation Side Effects

- Before: `git status --porcelain --untracked-files=all` was empty at `3e5f718`.
  `pipeline-state.py code-revision` gave `sha256:d7a22498…efd27`. Ignored build outputs and
  caches (`dist/`, `build/`, `src/factorflow.egg-info/`, `.hypothesis/`) were already present.
- After: HEAD was still `3e5f718` and `git status --porcelain --untracked-files=all` was empty
  before this report was written. `code-revision` gave the same `sha256:d7a22498…efd27`. `uv build`
  refreshed the ignored `dist/`, `build/` and `src/factorflow.egg-info/`. The mutation run worked in
  clones under the reviewer's scratch directory, outside the repository. The only files the reviewer
  adds are this report and its `-mutation.json`.
- Unexpected tracked-file changes: none.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | LOW | delta | OPEN | The new package-export test is labelled `# Implements TC-COMP-044`, a test case it does not implement |
| IR-002 | LOW | delta | OPEN | The TDD-evidence cycle-2 `tasks` list omits T002, whose case (d) the cycle rewrote |

### IR-001 — The package-export test carries a TC-ID it does not implement

- **Severity**: LOW
- **Scope**: delta (`tests/unit/test_data_health_items.py:98-103` was added after the baseline's
  `reviewed_head`)
- **Status**: OPEN
- **Acceptance criteria**: N/A (traceability only)
- **Tasks**: T015, T017
- **Files**: `tests/unit/test_data_health_items.py:98` (`# Implements TC-COMP-044` above
  `test_read_attention_is_exported_from_the_package`)
- **Claim challenged**: T017 says the test comments name the mapped TC-IDs. A `# Implements TC-…`
  comment claims that the test implements that specification case.
- **Observed evidence**: TC-COMP-044 (`data-health-reader-tests.md`, "Latest versus latest terminal
  download and the abandoned item") traces to AC-9, AC-12, AC-21, DAC-E2-S2-2, DAC-E2-7 and DAC-E2-8.
  The test asserts only `package.read_attention is reader.read_attention` and
  `"read_attention" in package.__all__`. T015 carries no TC-ID; the plan maps it to RD 2.1 and
  Resolved Conflict 3.
- **Expected evidence/behavior**: The traceability comment names what the test implements: T015 /
  RD 2.1, or no TC-ID.
- **Impact**: A coverage or traceability tool will count an export check as TC-COMP-044 evidence,
  which overstates the evidence for the latest-download contract. Behaviour and test strength are
  unaffected.
- **Required remediation**: Optional. Drop the TC-ID from this test, or replace it with a
  plan/design reference such as `# T015 (component design 2.1)`.

### IR-002 — The cycle-2 `tasks` list omits T002

- **Severity**: LOW
- **Scope**: delta (`CAP-003-E2-S2-tdd-evidence.yaml` cycle-2 was added after the baseline's
  `reviewed_head`)
- **Status**: OPEN
- **Acceptance criteria**: N/A (evidence quality)
- **Tasks**: T002, T018
- **Files**: `docs/…/stories/CAP-003-E2-S2-tdd-evidence.yaml` (cycle-2 `tasks: [T004, T006, T010,
  T015]`); `tests/unit/test_data_health_items.py:88-94`
- **Claim challenged**: T018 requires each cycle entry to name the cycle's work. Cycle-2's
  description says it resolves IR-002 in "the all-causes case".
- **Observed evidence**: The all-causes case is T002 (d) (`test_all_three_causes_give_three_items_and_none_give_none`),
  and `cycle-2.patch` rewrites its assertion. T002 is absent from the cycle's `tasks`. The lint passes
  because it does not check task lists against hunks.
- **Expected evidence/behavior**: The cycle's `tasks` list names every task whose test the cycle
  changed: T002, T006 and T015 at least.
- **Impact**: Anyone tracing T002's history through the evidence file would miss the rework of its
  case (d). Behaviour and test strength are unaffected.
- **Required remediation**: Optional. Add T002 to cycle-2's `tasks` the next time the evidence file
  is touched.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) — `latest_download`'s `requested_at`, `started_at`, `ended_at` unpinned | RESOLVED | `tests/integration/test_data_health_attention.py:268-306`: `test_latest_download_maps_three_distinct_instants_field_for_field` (`_t(1)`, `_t(2)`, `_t(3)`, whole-value literal) and `test_a_requested_latest_download_has_no_start_and_no_end`. In the reviewer's run, `rv:download-requested-from-started`, `rv:download-started-from-requested`, `rv:download-ended-null`, `rv:reader-swap-requested-started` and `rv:reader-ended-none` (all `carried`) are killed, each failing at the first of these tests |
| v1/IR-002 (HIGH) — `credential_missing.recorded_at` unchecked while causes coexist | RESOLVED | `tests/unit/test_data_health_items.py:88-94` compares a dict of literal `AttentionItem`s keyed by kind. `rv:credential-item-recorded` (`carried`) is killed at `test_all_three_causes_give_three_items_and_none_give_none` |
| v1/IR-003 (MEDIUM) — package export of `read_attention` untested | RESOLVED | `tests/unit/test_data_health_items.py:98-103`. `rv:export-dropped` (`carried`) and the reviewer's `rv2:all-dropped` are killed. The test's TC label is new finding IR-001 |

## Scope and Plan Deviations

- **Rework scope (justified).** `3e5f718` changes tests and evidence only, as v1's Follow-Up
  required. `git diff cdd1756..HEAD -- src` is empty.
- **Three tests beyond the plan's Phase 2 list (justified).** Two integration tests and one unit
  test were added to resolve v1 IR-001 and IR-003. Each is justified by a v1 finding and traces to
  T006 or T015.
- **Five statements, not six; credential absence by `delenv`; `__init__.py` edited (justified,
  unchanged).** As v1 recorded, under plan Resolved Conflicts 1 to 3.
- **Traceability labels (observation).** As v1 noted, the T009 and T012 tests carry
  `# Implements TC-COMP-043`, and the T010 and T011 tests carry TC-COMP-044 and TC-COMP-045. The new
  export-test label is recorded separately as IR-001.
- **Evidence files beyond T017's expected diff stat (justified).** The cycle-1 and cycle-2 patches,
  mutants, results, logs and RED logs are T018's required evidence. The v1 report pair is review
  output.
- **Bookkeeping.** Every checked task has evidence. No unchecked task appears implemented. The story
  status `in-review` matches the hand-off. `last_reworked_review` names v1.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-003-E2-S2 against
  `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2-tasks.md`
  and this report. The two LOW findings are optional; the coder may fix them in a later touch of
  the same files.
- **Warnings accepted downstream**: IR-001, IR-002
