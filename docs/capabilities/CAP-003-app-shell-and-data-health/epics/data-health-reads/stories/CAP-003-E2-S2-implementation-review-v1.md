---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E2-S2"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-14T18:48:56Z"
reviewed_head: "cdd17562144f59d484435af31e0c8e7d2a261f90"
review_base: "39b43c4353a6c0ec994b458b15ba625f184f2626"
reviewed_state_revision: "sha256:21981f59e5c5082c3ffd906301848ba593018a8453620979209969f3f9d75aaf"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-14T18:48:56Z
  source_artifacts:
    - id: CAP-003-E2-S2
      version: "1 (sha256:1b45fc6f3fbc39766428d6f2ed6b59517a4e8fc4b81d5b6cf9fdb8a50237d1fe)"
    - id: CAP-003-E2-S2-tasks
      version: "1 (draft)"
    - id: CAP-003-E2-S2-tdd-evidence
      version: "cycle-1"
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

# Implementation Review: CAP-003-E2-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 1 |
| Low findings | 0 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 18/18 verified |
| Required validation | 11/11 passed |

This is the initial review of `cdd1756` against review base `39b43c4`, the tip of the CAP-003
integration branch `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` for supervised run
`run-20261114T141555Z`. The production code is correct as far as reading and testing can show.
The five statements select the right rows. `checked_at` is the transaction's `now()`. The three
item rules match component design 2.7. The reader calls the delivered `credential_present()`. Every
validation command passes and the TDD-evidence lint is clean.

The gate fails on test strength. The reviewer reran the coder's 28 mutants (all killed) and added 28
of its own. Seven of the 56 survive, and none of the seven is equivalent:

- **Five survivors (IR-001).** They rewire `latest_download`'s `requested_at`, `started_at` or
  `ended_at`. The only test that compares a whole `LatestDownload` uses a run whose `requested_at`
  equals its `started_at` and whose `ended_at` is null. No other test reads those three fields.
  This leaves the mandatory TC-COMP-044 test `WEAK`.
- **One survivor (IR-002).** It lets another cause's timestamp leak into the `credential_missing`
  item. The one test that raises all three causes at once compares item kinds only. This leaves
  the mandatory TC-COMP-045 test `WEAK`.
- **One survivor (IR-003, MEDIUM).** It drops `read_attention` from the package export, which no
  test pins.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2.md` (status `in-review`, approved revision `sha256:1b45fc6f…d1fe`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2-tasks.md` |
| Component | `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-003-E2-S2-run-20261114T141555Z` |
| HEAD | `cdd17562144f59d484435af31e0c8e7d2a261f90` (`feat(CAP-003-E2-S2): story-coding, read_attention aggregate`) |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` = `39b43c4353a6c0ec994b458b15ba625f184f2626`, from `pipeline-state.py review-base --base-ref …`; `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before review: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 42: 5 modified, 37 added, all in one commit |
| Baseline | none: initial review |
| Pipeline state | `pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` → `READY`. Without `--base-ref` it reports `BLOCKED`, because the default-branch base pulls E2-S1's commits into the TDD lint. The driver supplied the integration ref for this reason. |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/data_health/queries.py` | modified (+55) | T013; AC-7, AC-8, AC-12, AC-21, DAC-E2-6, DAC-E2-7, DAC-E2-S2-4 |
| `src/factorflow/data_health/reader.py` | modified (+116/-4) | T014; AC-7, AC-8, AC-9, AC-12, AC-21, DAC-E2-6 to DAC-E2-8, DAC-E2-S2-1 to DAC-E2-S2-4 |
| `src/factorflow/data_health/__init__.py` | modified (+4/-4) | T015 (RD 2.1, plan Resolved Conflict 3) |
| `tests/unit/test_data_health_items.py` | added (+118) | T002, T003 |
| `tests/integration/test_data_health_attention.py` | added (+670) | T004 to T012 |
| `docs/…/stories/CAP-003-E2-S2-tdd-evidence.yaml` | added | T018 |
| `docs/…/stories/CAP-003-E2-S2-evidence/cycle-1.patch` | added | T018 `reviewed_patch`. Its `src/` and `tests/` hunks match `git diff 39b43c4..HEAD -- src tests` byte for byte, ignoring `index` lines |
| `docs/…/stories/CAP-003-E2-S2-evidence/mutants-cycle-1.json`, `mutation-cycle-1-results.json` | added | T018 mutation block |
| `docs/…/stories/CAP-003-E2-S2-evidence/mutation-cycle-1-results-logs/*.log` (30 files) | added | T018 mutation logs (2 baselines, 13 generated, 15 manual) |
| `docs/…/stories/CAP-003-E2-S2-evidence/red-cycle-1-attention.log` | added | T018 RED log; its sha256 `68e83ebc…5fb393` matches `red_log_sha256` |
| `docs/…/stories/CAP-003-E2-S2-tasks.md` | modified | Bookkeeping: T001 to T018 checked. No other line changed |
| `docs/…/stories/CAP-003-E2-S2.md` | modified | Bookkeeping: `status: planning` → `in-review`. The content revision is unchanged and equals the approval's `reviewed_revision` |

No changed file lacks justification. `pyproject.toml`, `uv.lock`, migrations, `tests/conftest.py`
and every delivered module are untouched, as DEC-0211 requires.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `queries.py:82-98` `LATEST_DOWNLOAD_SQL` with the `done` scalar subquery; `reader.py:137-146` maps it to `LatestDownload(..., Progress(done, named if named > 0 else None))` | `test_progress_counts_complete_instruments_and_total_is_null_before_the_claim`, `test_a_single_named_instrument_is_a_total_of_one`, `test_the_same_five_statements_at_3000_instruments` | Progress reads `Progress(0, None)` before the claim, `Progress(40, 120)` after, `Progress(1, 1)` and `Progress(1500, 3000)`. |
| AC-8 | SATISFIED | `FOLLOWED_COUNT_SQL` (`queries.py:61-66`), `PRICES_AS_OF_SQL` (`queries.py:69-75`); `reader.py:132,155-156` | `test_followed_count_and_prices_as_of_count_only_active_instruments`, `test_empty_store_reads_zero_and_nones`, 3000-instrument test | Retired, non-prices and earlier segments are excluded, which kills `followed-all`, `asof-all-instruments`, `asof-any-type` and `asof-min`. |
| AC-9 | SATISFIED | `_attention_items` (`reader.py:84-107`) is a pure function of the current read; nothing is persisted | `test_items_exist_exactly_while_their_cause_holds` (items come and go across four store states; four-table snapshot equal before and after two reads); unit item tests | Production is correct. IR-002 records the test gap for coexisting causes. |
| AC-12 | SATISFIED | `reader.py:138-150` passes `state` through as stored, and `LatestTerminalDownload(*terminal_row)` | `test_run_states_are_returned_as_recorded` over all eight states | Outcomes are not re-mapped. The problem block is read by E2-S1's `PROBLEM_COUNT_SQL` unchanged. |
| AC-21 | SATISFIED | `LATEST_TERMINAL_SQL` (`queries.py:102-108`) filters to the five terminal states; `reader.py:148-150` gives `None` when no row comes back | `test_empty_store_reads_zero_and_nones`; `test_run_states_are_returned_as_recorded` (non-terminal states give `None`) | — |
| DAC-E2-6 | SATISFIED | `HAVING count(*) = 4` scoped by `x.run_id = r.run_id`; `named if named > 0 else None` | TC-COMP-036 tests | Any outcome counts toward `done` (mixed `failed` and `skipped` rows are complete). `done <= total` is asserted. The plan's no-clamp reasoning (Other Notes) holds: results exist only for named roster instruments. |
| DAC-E2-7 | SATISFIED | `ORDER BY r.requested_at DESC, r.run_id DESC` and `WHERE state IN (five) ORDER BY ended_at DESC, run_id DESC` | `test_running_download_does_not_displace_the_latest_terminal_one`, `test_latest_terminal_download_is_ordered_by_ended_at_not_requested_at`, both tie tests, `test_items_exist_exactly_while_their_cause_holds` step 2 | The choice of run is fully pinned. Every order and filter mutant is killed. The field-level mapping of the selected run is weakly tested: IR-001. |
| DAC-E2-8 | SATISFIED | `reader.py:99-106` follows RD 2.7's table row for row; `AttentionItem` has only `kind`, `recorded_at` and `run_id` (no tier, no copy) | Unit tests `test_data_problems_item_follows_the_stock_count`, `test_download_not_complete_only_for_failed_and_abandoned` (5 states), `test_credential_missing_item_is_stamped_with_checked_at` | Production is correct. IR-002 covers the case where the three causes coexist. |
| DAC-E2-S2-1 | SATISFIED | `reader.py:110-167` | `test_empty_store_reads_zero_and_nones` | Asserts the full empty shape. `checked_at` is tz-aware and equals `SELECT now()` in the still-open transaction, which kills `rv:checked-at-clock` (`clock_timestamp()`). |
| DAC-E2-S2-2 | SATISFIED | As DAC-E2-7 and DAC-E2-8 | `test_running_download_does_not_displace_the_latest_terminal_one`, `test_abandoned_latest_terminal_download_gives_the_item` | The abandoned item carries the run's `run_id` and `ended_at` (literal `==`). |
| DAC-E2-S2-3 | SATISFIED | `reader.py:23,105-106,152,157,164`: `credential_present` imported by name from `factorflow.config.settings`; the item takes `checked_at` | `test_credential_missing_item_while_the_key_is_absent` (real `delenv`), `test_reader_calls_the_delivered_credential_presence_function` (identity), `test_module_never_reads_the_key_value` (reader and queries) | The value never enters the module. The validation-plan grep prints nothing. IR-002 covers the coexisting-cause gap. |
| DAC-E2-S2-4 | SATISFIED | One cursor issuing exactly five constants (`reader.py:117-127`); progress is a scalar subquery of Q4 | `test_five_fixed_statements_on_a_small_store`, `test_the_same_five_statements_at_3000_instruments` (identity and equality of the five constants) | Five statements, not six. This follows plan Resolved Conflict 1, which RD 2.6 ("its progress in the same statement") and the story Description support. The operative requirement (a fixed, roster-independent set of aggregates with no per-instrument statement and no `coverage-service` call) is met and pinned. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | E2-S1's `models.py` (RD 2.2 fields and order), `queries.PROBLEM_COUNT_SQL`, `reader.read_problems`, `test_data_health_sql_is_read_only.py`, `settings.credential_present` (`settings.py:345`), `migrated_writer_connection`, the three `0004_runs.sql` constraints and `runs.queries.get_most_recent_run` all exist | `tests/conftest.py` is untouched |
| T002 | complete | VERIFIED | `tests/unit/test_data_health_items.py:44-94` | Cases (a) to (d) are present. Case (d) compares kinds only (IR-002) |
| T003 | complete | VERIFIED | `test_data_health_items.py:98-118` | Identity check, plus a substring scan of reader and queries for the six tokens, with the file name and hit in the message |
| T004 | complete | VERIFIED | `test_data_health_attention.py:151-170` | Plus the seed helpers at `:52-142` (bound parameters only) |
| T005 | complete | VERIFIED | `test_data_health_attention.py:174-220` | 50 instruments; earlier R0 complete for all; R1 `Progress(0, None)` then `Progress(40, 120)` |
| T006 | complete | VERIFIED | `test_data_health_attention.py:242-324` | Cases (a), (b), (c) and the cancelled edge. Case (a)'s literal cannot separate `requested_at` from `started_at` (IR-001) |
| T007 | complete | VERIFIED | `test_data_health_attention.py:328-347` | `delenv`, then `setenv` with a fresh read and `SENTINEL not in repr` |
| T008 | complete | VERIFIED | `test_data_health_attention.py:350-469` | Counting wrapper over `cursor()` only; set-based 3000-instrument seed; values right at scale |
| T009 | complete | VERIFIED | `test_data_health_attention.py:473-492` | — |
| T010 | complete | VERIFIED | `test_data_health_attention.py:495-565` | Eight states; both tie-breaks in both insertion orders; equality with `get_most_recent_run` |
| T011 | complete | VERIFIED | `test_data_health_attention.py:568-641` | Four steps and the four-table snapshot |
| T012 | complete | VERIFIED | `test_data_health_attention.py:645-670` | Retired `ABR` at `t5` excluded; `type(...) is tuple` |
| T013 | complete | VERIFIED | `queries.py:7-9,59-108` | Four `Final[str]` constants; each starts with `SELECT` and has no `{` and no `%`. The SQL matches T013 verbatim (whitespace aside). The docstring and comments hold no guard token (`test_sources_hold_no_write_or_ddl_token` passes) |
| T014 | complete | VERIFIED | `reader.py:9-15,18-41,84-167` | `_attention_items` signature as planned. One `with conn.cursor()` and five ordered `execute`/`fetchone` pairs. No commit, rollback, `transaction()`, coverage call or environment read (greps empty) |
| T015 | complete | VERIFIED | `__init__.py:7,9` | `read_attention` is imported and in `__all__`, sorted; `_attention_items` is not exported. No test pins it (IR-003) |
| T016 | complete | VERIFIED | Reviewer rerun: 83 passed | — |
| T017 | complete | VERIFIED | Reviewer rerun of the full validation set (see Independent Validation) | All five TC-IDs appear in `# Implements` comments. The diff stat adds T018's evidence files to T017's expected list (justified) |
| T018 | complete | VERIFIED | `CAP-003-E2-S2-tdd-evidence.yaml` cycle-1; `check-tdd-evidence.py … --require-logs` → 0 errors, 0 warnings | One cycle covers T001 to T018. `diff_sha256` and `reviewed_patch` are present, and the patch matches the committed code. `commit_hash: stage` per the driver. The coder's mutation block (28/28 killed) reproduces |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_progress_counts_complete_instruments_and_total_is_null_before_the_claim` / TC-COMP-036 | ADEQUATE | Run-scoped completeness against an earlier complete run. Mixed outcomes count. Three-type instruments are excluded. `total` is null at 0. Kills `having-ge-3`, `having-run-scope`, `rv:having-any`, `rv:done-not-skipped`, `rv:done-not-failed`, `rv:reader-total-unconditional`, `rv:reader-done-zero` and `145:off-by-one:1` | none |
| `test_a_single_named_instrument_is_a_total_of_one` / TC-COMP-036 | ADEQUATE | `Progress(1, 1)`; kills `145:off-by-one:2` (`named > 1`) | none |
| `test_empty_store_reads_zero_and_nones` / TC-COMP-043 | ADEQUATE | Full empty shape. `checked_at` is aware and equal to the transaction's `now()` | none |
| `test_running_download_does_not_displace_the_latest_terminal_one` / TC-COMP-044 | **WEAK** | Compares whole `LatestDownload` and `LatestTerminalDownload` literals and proves the running run does not displace the partial one | Run B has `requested_at == started_at == t3` and `ended_at = None`. Five non-equivalent mutants survive: `rv:download-requested-from-started`, `rv:download-started-from-requested`, `rv:download-ended-null`, `rv:reader-swap-requested-started` and `rv:reader-ended-none` (IR-001) |
| `test_abandoned_latest_terminal_download_gives_the_item`, `test_latest_terminal_download_is_ordered_by_ended_at_not_requested_at`, `test_a_store_whose_only_run_is_cancelled_has_no_item` / TC-COMP-044 | ADEQUATE | Literal `LatestTerminalDownload` and item equality. Ended-versus-requested ordering. The cancelled edge. Kill `terminal-by-requested`, `terminal-no-abandoned`, `rv:terminal-asc`, `rv:terminal-reason-null`, `rv:terminal-ended-from-requested` and `rv:terminal-no-cancelled` | none for the terminal selection |
| `test_run_states_are_returned_as_recorded` (8), tie tests (2 × 2) / TC-COMP-044 | ADEQUATE | Each state round-trips. The terminal/non-terminal split. Both tie-breaks in both insertion orders. Kill `terminal-any-state`, `rv:terminal-no-succeeded`, `rv:terminal-no-partial`, `rv:terminal-no-failed`, `download-no-tiebreak` and `terminal-no-tiebreak` | Assert `state` and `run_id` only, which contributes to IR-001 |
| Unit `test_data_problems_item_follows_the_stock_count`, `test_download_not_complete_only_for_failed_and_abandoned`, `test_no_terminal_download_gives_no_download_item`, `test_credential_missing_item_is_stamped_with_checked_at` / TC-COMP-044, TC-COMP-045 | ADEQUATE | Literal `AttentionItem` equality per rule and per state. Kill every catalogue mutant on lines 99, 101 and 105, plus `item-cancelled`, `rv:problems-recorded-checked`, `rv:terminal-item-recorded-checked` and `rv:terminal-item-run-none` | Each rule is exercised with the other two causes absent |
| `test_all_three_causes_give_three_items_and_none_give_none` / TC-COMP-045 | **WEAK** | Asserts three items and the three kinds; asserts `()` with no cause | Does not compare the items' `recorded_at` or `run_id` when causes coexist. `rv:credential-item-recorded` survives (IR-002) |
| `test_credential_missing_item_while_the_key_is_absent` / TC-COMP-045 | ADEQUATE for what it seeds | Real `delenv`. The item equals `checked_at`. The present case shows no item and no `SENTINEL` in `repr`. Kills `credential-true`, `rv:items-credential-true` and `rv:attention-present-true` | Empty store, so `newest_completed_at` is always `None` (IR-002) |
| `test_reader_calls_the_delivered_credential_presence_function`, `test_module_never_reads_the_key_value` / TC-COMP-045 step 2 | ADEQUATE | Identity with the delivered function; substring guard over both modules | none |
| `test_five_fixed_statements_on_a_small_store`, `test_the_same_five_statements_at_3000_instruments` / TC-COMP-046 | ADEQUATE | Exact five-constant list by identity and equality at 3 and at 3000 instruments. Values right at scale | none |
| `test_followed_count_and_prices_as_of_count_only_active_instruments` (T009) | ADEQUATE | Kills `followed-all`, `asof-all-instruments`, `asof-any-type` and `asof-min` | none |
| `test_items_exist_exactly_while_their_cause_holds` (T011) | ADEQUATE | Items track their causes across four committed states. The read leaves the four tables byte-equal | none |
| `test_problem_block_is_mapped_field_for_field` (T012) | ADEQUATE | Literal `Problems` equality and tuple type. Kills `symbols-list` and `rv:problems-completed-none` | none |
| `__init__.py` export (T015, no TC) | MISSING (non-mandatory) | — | `rv:export-dropped` survives (IR-003) |

Isolation and determinism: every database test runs on its own database (`migrated_writer_connection`)
and uses fixed aware instants. An autouse fixture sets the credential, so no result depends on the
developer's environment. Items are compared by kind or as literals, never by an order the design
leaves open. The mock surface is limited to the counting wrapper, which delegates every call to the
real cursor.

**Mutation run (reviewer).** 13 catalogue mutants were generated over `39b43c4..HEAD`. The reviewer
added the coder's 15 manual mutants and 28 of its own. All 56 ran with the focused suites, and 49
were killed. The seven survivors, none equivalent:

| Mutant | Change | Why not equivalent |
|--------|--------|--------------------|
| `rv:download-requested-from-started` | `LATEST_DOWNLOAD_SQL` selects `r.started_at` in the `requested_at` position | System design §4.2 `GET /api/attention` and RD 2.2 specify `latest_download.requested_at`. For a `requested` run it would read `None` |
| `rv:download-started-from-requested` | selects `r.requested_at` in the `started_at` position | Same contract. An unclaimed run would show a start time |
| `rv:download-ended-null` | selects `NULL::timestamptz` for `ended_at` | Same contract. A latest download that has ended would read as never ended |
| `rv:reader-swap-requested-started` | `LatestDownload(run_id, state, started_at, requested_at, …)` | Same contract (RD 2.2 field order) |
| `rv:reader-ended-none` | `LatestDownload(…, None, Progress(…))` | Same contract |
| `rv:credential-item-recorded` | `credential_missing.recorded_at = problems.newest_completed_at or checked_at` | DAC-E2-S2-3 and RD 2.7 fix `recorded_at` to `checked_at` |
| `rv:export-dropped` | removes `read_attention` from the `__init__.py` import and `__all__` | RD 2.1 and 2.2 put `read_attention` in the package interface, and T015 adds it |

## Independent Validation

All commands ran from the reviewer's shell against `repos/factorflow-v2/FactorFlow-v2` (abbreviated
`<repo>`). `uv … --directory <repo>` runs with `<repo>` as its working directory. Every command ran
inside the sandbox; none was refused.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` (prerequisite, not counted as validation) | harness root | 0 | PASS | All eight checks passed |
| `uv run --directory <repo> --offline pytest tests/unit/test_data_health_items.py tests/integration/test_data_health_attention.py -q` | `<repo>` | 0 | PASS | 37 passed in 3.74s (12 unit, 25 postgres) |
| `uv run --directory <repo> --offline pytest tests/unit/test_data_health_sql_is_read_only.py tests/unit/test_data_health_models.py tests/integration/test_data_health_problems.py tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py tests/unit/test_credential_presence.py -q -p no:cacheprovider` (T016) | `<repo>` | 0 | PASS | 83 passed in 7.07s |
| `uv sync --directory <repo> --all-extras --offline` | `<repo>` | 0 | PASS | Resolved 46, checked 43 packages |
| `uv build --directory <repo> --offline` | `<repo>` | 0 | PASS | Built `dist/factorflow-0.2.0.tar.gz` and the wheel; all four `data_health` modules packaged |
| `uv run --directory <repo> --offline pytest -q -p no:cacheprovider` | `<repo>` | 0 | PASS | 2819 passed, 2 warnings (third-party deprecations in starlette and fastapi), 446.03s. This is the full suite with the `postgres` tests included, not an exclusion run. `-p no:cacheprovider` only stops `.pytest_cache` writes and deselects nothing |
| `uv run --directory <repo> --offline ruff check .` | `<repo>` | 0 | PASS | All checks passed |
| `uv run --directory <repo> --offline ruff format --check .` | `<repo>` | 0 | PASS | 295 files already formatted |
| `uv run --directory <repo> --offline mypy src` | `<repo>` | 0 | PASS | No issues in 65 source files |
| `grep -nE "FACTORFLOW_MASSIVE_API_KEY\|os\.environ\|getenv\|get_secret_value" src/factorflow/data_health/` | `<repo>` | 1 | PASS | No match (the required result) |
| `grep -nE "conn\.(commit\|rollback\|transaction)\(" src/factorflow/data_health/reader.py` | `<repo>` | 1 | PASS | No match (the required result) |
| `python3 scripts/check-tdd-evidence.py --evidence <repo>/docs/…/CAP-003-E2-S2-tdd-evidence.yaml --repo-dir <repo> --base 39b43c4353a6c0ec994b458b15ba625f184f2626 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir <repo> --range 39b43c4…..HEAD --cycle review --out <scratch>/mutants.json`, plus 43 manual mutants appended | harness root | 0 | — | 13 generated (8 negate-boolean, 5 off-by-one) |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <scratch>/mutants.json --jobs 3 --command 'uv run --offline --all-extras pytest tests/unit/test_data_health_items.py tests/integration/test_data_health_attention.py -x -q -p no:cacheprovider' --out <scratch>/mutation-results.json …` | harness root | 3 | 49 killed, 7 survived | Results copied beside this report as `CAP-003-E2-S2-implementation-review-v1-mutation.json`. Two earlier attempts did not run any mutant: one failed because the `--work-root` directory was missing, the other because the clones lacked `--all-extras`, so `pytest` could not be spawned |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | — | N/A | NOT RUN | Not required. The story's Validation and the plan's Validation Plan name only the Python commands, and no frontend file is in the change set |

### Validation Side Effects

- Before: `git status --porcelain --untracked-files=all` empty at `cdd1756`. Ignored build
  outputs (`dist/`, `build/`, `src/factorflow.egg-info/`, caches) already present.
- After: HEAD still `cdd1756`. `git status --porcelain --untracked-files=all` lists only this
  report and its `-mutation.json`, both written by the reviewer. `pipeline-state.py code-revision`
  gives `sha256:21981f59…aaf` before and after validation. `uv build` refreshed the ignored
  `dist/`, `build/` and `src/factorflow.egg-info/`. The mutation run worked in clones under the
  reviewer's scratch directory, outside the repository.
- Unexpected tracked-file changes: none.

## Findings

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 2 · MEDIUM 1 · LOW 0 · **total 3**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | initial | OPEN | `latest_download`'s `requested_at`, `started_at` and `ended_at` are pinned by no test (five mutants survive; TC-COMP-044 test `WEAK`) |
| IR-002 | HIGH | initial | OPEN | `credential_missing.recorded_at` is checked only when no other cause holds (`rv:credential-item-recorded` survives; TC-COMP-045 test `WEAK`) |
| IR-003 | MEDIUM | initial | OPEN | The package export of `read_attention` is pinned by no test (`rv:export-dropped` survives) |

### IR-001 — `latest_download`'s `requested_at`, `started_at` and `ended_at` are not pinned by any test

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-7, DAC-E2-S2-2 (the run's recorded fields), AC-12
- **Tasks**: T006, T010, T013, T014
- **Files**: `src/factorflow/data_health/queries.py:85-87` (`LATEST_DOWNLOAD_SQL` select list);
  `src/factorflow/data_health/reader.py:138-146`;
  `tests/integration/test_data_health_attention.py:242-265`, `:495-521`
- **Claim challenged**: TC-COMP-044's tests prove that `latest_download` is "the run with the
  greatest `requested_at`" with its recorded values. T006 (a) claims its whole-value
  `LatestDownload(...)` comparison pins the mapping.
- **Observed evidence**: The only whole-value `LatestDownload` assertion is T006 (a). It seeds run B
  with `requested_at=_t(3)`, `started_at=_t(3)` and no `ended_at`, so a `requested_at`/`started_at`
  swap or a constant-null `ended_at` produces the same literal. Every other test reads only
  `latest_download.run_id`, `.state` or `.progress`. Five mutants survive the focused suites with 37
  passed: `rv:download-requested-from-started`, `rv:download-started-from-requested`,
  `rv:download-ended-null` (SQL) and `rv:reader-swap-requested-started`, `rv:reader-ended-none`
  (Python). `read_attention` is called by no other test in the repository.
- **Expected evidence/behavior**: System design §4.2 (`GET /api/attention`: `latest_download
  {run_id, state, requested_at, started_at, ended_at, progress}`) and component design 2.2 define
  these fields. DAC-E2-7 requires the latest download to be that run, as recorded. Under the
  adversarial-review rule E.9, a mutant that changes specified behaviour is not equivalent, and its
  survival makes the test that should kill it `WEAK`.
- **Impact**: The production code maps the fields correctly today: the select order, the unpacking
  order and the dataclass order agree. But a reordering of the select list or the constructor would
  ship unnoticed to `data-health-api` (E2-S4) and to the setup and Home progress displays. E2-S4's
  review mutates only its own lines.
- **Required remediation**: Assert a latest download whose `requested_at`, `started_at` and
  `ended_at` are three distinct non-null instants, for example a terminal latest download, compared
  as a whole `LatestDownload` literal. Also assert a `requested` latest download with `started_at`
  and `ended_at` both `None`, so every survivor above is killed.

### IR-002 — The `credential_missing` item's `recorded_at` is checked only when no other cause holds

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S2-3, DAC-E2-8, AC-9
- **Tasks**: T002, T007, T011
- **Files**: `src/factorflow/data_health/reader.py:105-106`;
  `tests/unit/test_data_health_items.py:81-94`
- **Claim challenged**: T002 states that "every expected item is a literal `AttentionItem(...)`
  compared with `==`, so `recorded_at` and `run_id` are both checked". TC-COMP-045 claims the
  `credential_missing` item has `recorded_at == checked_at`.
- **Observed evidence**: `test_all_three_causes_give_three_items_and_none_give_none` is the only test
  where the three causes coexist, and it asserts `len(items) == 3` and the set of kinds only. Every
  other `credential_missing` assertion runs with `problems.newest_completed_at` `None`:
  T002 (c) uses `NONE_PROBLEMS`, T007 uses an empty store, and T011 step 4 comes after the problem
  is resolved. The mutant `rv:credential-item-recorded` survives, 37 passed. It sets
  `AttentionItem("credential_missing", problems.newest_completed_at or checked_at, None)`.
- **Expected evidence/behavior**: RD 2.7 and DAC-E2-S2-3 fix `credential_missing.recorded_at` to
  `checked_at`, independent of the other causes. The test should hold each item to its own recency
  when the causes coexist.
- **Impact**: The production code is correct. A regression that shares or defaults a recency across
  item kinds would pass the suite. Home sorts the *Needs you* list by `recorded_at`.
- **Required remediation**: In the all-causes case (or a new one), compare each item with `==`
  against its literal `AttentionItem` (`data_problems`/`T1`/`None`,
  `download_not_complete`/`T2`/`RUN`, `credential_missing`/`CHECKED`/`None`), keyed by kind.
  `rv:credential-item-recorded` must then be killed.

### IR-003 — The package export of `read_attention` is pinned by no test

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (T015 carries no mandatory TC-ID)
- **Tasks**: T015
- **Files**: `src/factorflow/data_health/__init__.py:7,9`; `tests/` (absence)
- **Claim challenged**: T015 says the package exports `read_attention` (RD 2.1: "exports
  read_attention, read_data_health, read_problems").
- **Observed evidence**: The export is present and correct at HEAD. `rv:export-dropped` removes it
  from both the import and `__all__`, and the focused suites still pass (37 passed). No module in
  `src/` or `tests/` imports `read_attention` from the package root: `grep -rn "from
  factorflow.data_health import" tests src` finds only `models`, `queries` and `reader`.
- **Expected evidence/behavior**: A plan-specified public export should be pinned. The plan's
  Phase 2 defines no test for T015, so this gap is inherited from the plan rather than a skipped
  requirement. That makes it MEDIUM, consistent with CAP-001-E3-S3 v3 IR-001 and
  CAP-002-E1-S5 v1 IR-004.
- **Impact**: None for any current caller. E2-S4 will import it; a later edit could drop it
  unnoticed until then.
- **Required remediation**: Optional. Assert `factorflow.data_health.read_attention is
  factorflow.data_health.reader.read_attention` and `"read_attention" in
  factorflow.data_health.__all__`, for example in `tests/unit/test_data_health_items.py`.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Five statements, not six (justified).** DAC-E2-S2-4 and TC-COMP-046 say "five aggregate
  statements plus the progress aggregate". RD 2.6 and the story Description put the progress inside
  Q4. Plan Resolved Conflict 1 resolved this and the implementation follows it. TC-COMP-046's tests
  pin the exact five constants. The test specification ranks below the story and the design, so no
  change is needed. Recording this conflict in the test specification is the test owner's call.
- **Credential absence by `delenv` (justified).** TC-COMP-045 patches `credential_present()`; T007
  removes the variable instead (plan Resolved Conflict 2), which exercises the real function. T003's
  identity check shows it is the delivered one.
- **`__init__.py` edited (justified).** The story's file list omits it. RD 2.1 and plan Resolved
  Conflict 3 require the export.
- **Extra test beyond the plan (justified).** `test_a_single_named_instrument_is_a_total_of_one` was
  added to kill the catalogue mutant `named > 1`, as the TDD evidence says.
- **Traceability labels (observation, no finding).** The T009 and T012 tests carry
  `# Implements TC-COMP-043`, and the T010 and T011 tests carry TC-COMP-044 and TC-COMP-045, although
  the plan lists T009 to T012 as additional tests. The mappings are close: TC-COMP-043's file header
  names AC-8, and TC-COMP-044 traces to AC-9 and AC-12. A coverage tool will count these tests
  under those TC-IDs.
- **Evidence files beyond T017's expected diff stat (justified).** The patch, mutants, mutation
  results, logs and RED log are T018's required evidence.
- **Bookkeeping.** Every checked task has evidence. No unchecked task appears implemented. The
  story status `in-review` matches the hand-off.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework the tests only: no production change is indicated. Resolve IR-001 and
  IR-002 so that the seven reviewer mutants listed above are killed. `rv:export-dropped` may stay
  alive only if IR-003 is consciously left open. Record the rework as a new TDD-evidence cycle, then
  rerun `$adversarial-review` with
  `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2-tasks.md`
  and this report. The next review uses this report as its baseline (`reviewed_head` `cdd1756`) and
  this report's `-mutation.json` for `scope --previous`.
- **Warnings accepted downstream**: N/A
