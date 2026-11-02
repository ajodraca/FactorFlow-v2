---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-02
updated: 2026-11-02
story_id: "CAP-002-E3-S4"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S4.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-02T01:11:32Z"
reviewed_head: "62e53336afee361880a7d83d22bce864df4a9349"
review_base: "c886972218b97461b869152fe201443ae21de5c1"
reviewed_state_revision: "sha256:5c08a3e357fa944770f3d372d16b40e181addc1b6e9059bf255525b003e7c934"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E3-S4
    artifact_version: 1
    content_revision: sha256:58d94cab203a14b0e70701607f5d728742a906ff03820099cafaf4fd2445195d
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.316"
  timestamp: 2026-11-02T01:27:59Z
  source_artifacts:
    - id: CAP-002-E3-S4
      version: "1 (sha256:58d94cab203a14b0e70701607f5d728742a906ff03820099cafaf4fd2445195d)"
    - id: CAP-002-E3-S4-tasks
      version: "1 (updated 2026-10-18; sha256:d87314b0e038caedf67bfb7b52fb88298fdabe782153caca207102f2b5c9db69)"
    - id: CAP-002-E3-S4-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0132
      version: "applied, owner upheld"
    - id: DEC-0135
      version: "applied, owner upheld"
    - id: DEC-0136
      version: "applied, owner upheld"
    - id: DEC-0137
      version: "applied, owner upheld"
    - id: DEC-0264
      version: "open, decided_by agent (coding)"
    - id: DEC-0265
      version: "open, decided_by agent (coding)"
    - id: DEC-0266
      version: "open, decided_by agent (this review)"
    - id: DEC-0267
      version: "open, decided_by agent (this review)"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E3-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 2 |
| Low findings | 2 |
| Acceptance criteria | 6/8 satisfied |
| Planned tasks | 20/20 verified |
| Required validation | 8/9 passed |

The production code is correct, and I found no production defect. Both
statements and the three reads behave as design 2.6, DEC-0136 and DEC-0137
require. Every planned task is implemented. The full `-m postgres` suite
passes: 892 tests against a real PostgreSQL 16.15 server, run without Docker
(DEC-0266). The TDD evidence lints clean, and its patch reproduces HEAD byte
for byte.

The gate fails on test strength, IR-001 (HIGH). The suite never pins
"newest `ended_at` first" for earlier sets that share a `classification_date`.
That is the same-day re-run case the plan's Open Gap 4 names. A mutant that
picks history's page of sets by `classification_date` survived all 5 runs. A
mutant that orders the result by `classification_date` survived 2 of 5. A
probe on same-day sets shows both misorder history, and when paging, skip a
set. HEAD is correct on the same data. So TC-COMP-150 and the T007 order tests
are WEAK, and DAC-E3-S4-1 and DAC-E3-9 are PARTIAL.

Non-blocking findings:

- **IR-002 (MEDIUM):** a type-confused cursor escapes as `TypeError` or
  `AttributeError`, not `CursorError`.
- **IR-003 (MEDIUM):** DEC-0265 is recorded `contained`, but CAP-002-E3-S5
  consumes it.
- **IR-004 (LOW):** history reads the current set and its rows in two
  statements, leaving a read window.
- **IR-005 (LOW):** the history index proof cannot tell a keyed probe from a
  full scan of the same index.

The ninth required command, `pytest -m 'not postgres'`, fails only on four
deploy-smoke tests outside the change set. They need IPv6 sockets this kernel
lacks and fail identically at the base (DEC-0267).

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 2 · LOW 2 · **total 5**

| Finding | Severity | Scope | Blocks | Title |
|---------|----------|-------|--------|-------|
| IR-001 | HIGH | initial | yes | History order not pinned for earlier sets sharing a classification date; two order mutants survive |
| IR-002 | MEDIUM | initial | no | Type-confused cursor escapes as `TypeError`/`AttributeError`, not `CursorError` |
| IR-003 | MEDIUM | initial | no | DEC-0265 recorded `contained` though CAP-002-E3-S5 consumes the `SetRow.factors` shape |
| IR-004 | LOW | initial | no | Two-statement read window in `stock_history` |
| IR-005 | LOW | initial | no | History index proof cannot tell a keyed probe from a full index scan |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S4.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S4-run-20261101T235358Z` |
| HEAD | `62e53336afee361880a7d83d22bce864df4a9349` (one commit over the base: `feat(classification): CAP-002-E3-S4 story-coding …`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261101T235358Z` → `c886972218b97461b869152fe201443ae21de5c1` (resolved by `pipeline-state.py review-base --base-ref`; `git merge-base --is-ancestor` exit 0) |
| Working tree | Clean: `git status --porcelain=v1 --untracked-files=all` empty, before and after validation; nothing staged or unstaged |
| Changed files reviewed | 19 |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/reader.py` | modified | T014, T015, T016; DAC-E3-S4-1 to -3; DEC-0265 (`factors={}`); `_factor_summaries` extraction allowed by T016 |
| `src/factorflow/classification/sql/stock_history.sql` | added | T012; DAC-E3-S4-1, DAC-E3-S4-2, DAC-E3-9, DAC-E3-12 |
| `src/factorflow/classification/sql/sets.sql` | added | T013; DAC-E3-S4-3 |
| `tests/integration/reader_seed.py` | modified | T002 (adds `bulk_seed_scored_stocks`, `analyze_classification_tables`; optional `score_shift` keyword serves T006 a) |
| `tests/integration/test_reader_history.py` | added | T003, T004, T005, T007, T008 |
| `tests/integration/test_reader_volume.py` | added | T006, T009 |
| `tests/unit/test_reader_paging.py` | added | T010 |
| `tests/unit/test_reader_sql_read_only.py` | modified | T011 |
| `docs/.../stories/CAP-002-E3-S4.md` | modified | `status: planning` → `in-review`, the story-coding lifecycle step; content revision unchanged (equals the approval's `reviewed_revision`) |
| `docs/.../stories/CAP-002-E3-S4-tasks.md` | modified | Checkboxes only (T001–T020 `[x]`) |
| `docs/.../stories/CAP-002-E3-S4-tdd-evidence.yaml` | added | T020 |
| `docs/.../stories/CAP-002-E3-S4-evidence/` (8 files: `cycle-1.patch`, `red-`, `green-`, `full-suite-cycle-1.log`, `code-review-`, `spec-drift-cycle-1.txt`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`) | added | T020 evidence; each SHA-256 equals the value the TDD evidence records |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-18 | SATISFIED | `reader.py:720` `stock_history` returns stored rows from `stock_history.sql` (read-only; `test_reader_sql_read_only.py` covers it) | `test_reader_history.py:145` (TC-COMP-150, re-read after a newer set: identical rows), `:240`, `:264`, `:278`, `:344` | Earlier classifications are visible, dated (`classification_date`, `ended_at`) and as recorded. The ordering clause is under DAC-E3-9 and DAC-E3-S4-1 |
| AC-23 (read-through) | SATISFIED | `stock_history.sql:37` `fc.restated_possible`; `_cell_from_row` (`reader.py:707`, unchanged) | `test_reader_history.py:214-215` (True on value and growth of the middle set only) | `manual:rv-hist-mark-recomputed-from-inputs` killed |
| DAC-E3-9 | PARTIAL | `stock_history.sql:16` (`state = 'complete'`), `:17` (current excluded, DEC-0137), `:22` and `:44` (`ended_at DESC, set_id DESC`) | `:145`, `:278`, `:391`, `:446`, `:498` | "Only complete" and "as recorded" are proved. "Newest first" is not pinned for earlier sets that share a `classification_date` (IR-001) |
| DAC-E3-12 (history half) | SATISFIED | As AC-23 | `:213` (every cell equals the stored row), `:214-215` | Mark carried on every history cell |
| DAC-E3-S4-1 | PARTIAL | As DAC-E3-9 | TC-COMP-150 `:145` | Correct at HEAD (probe, IR-001), but the test is WEAK on order (IR-001) |
| DAC-E3-S4-2 | SATISFIED | `reader.py:742-746` (no row raises `InstrumentNotFound`; a null-`set_id` row is skipped); `stock_history.sql:39-40` (`FROM inst LEFT JOIN page_sets ON true`) | TC-COMP-151 `:240`, `:264` | `rv-hist-inner-page-join`, `rv-reader-null-row-kept` and `reader.py:742:negate-boolean` all killed |
| DAC-E3-S4-3 | SATISFIED | `stock_history.sql:16`; `sets.sql` (no state filter); `reader.py:954` `_row_to_set` | TC-COMP-152 `:278`; `:598`, `:618` | Exclusion by state, not by missing rows (`rv-hist-building-included` and `rv-hist-failed-included` killed). The list carries `state`, `failure_reason` and `ended_at` |
| DAC-E3-S4-4 | SATISFIED | Statements read `factor_classification` through set-keyed indexes (EXPLAIN evidence) | TC-COMP-153 `test_reader_volume.py:203`; T009 `:250` | The structural budget is DEC-0135's (owner upheld). 14 full passes at 3000 stocks in 3.85 s (diagnostic) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Base `c886972` already holds `read_set_blocks`, `_cell_from_row`, `CursorError` (alias of `runs.queries.CursorError`), `InstrumentNotFound`, the seed helpers, `runs.queries.encode/decode_cursor`, `api.bounds` and the `0006` indexes | Nothing edited |
| T002 | complete | VERIFIED | `reader_seed.py` `_bulk_cell`, `bulk_seed_scored_stocks` (`executemany` with `RETURNING`, then `COPY`), `analyze_classification_tables` | Adds the optional keyword `score_shift`, which T002 permits; it lets T006 (a) see a wrong-set read. No conftest fixture |
| T003 | complete | VERIFIED | `test_reader_history.py:145` | Implemented as specified. Its order assertion is WEAK under mutation (IR-001) |
| T004 | complete | VERIFIED | `:240` (cases a, b, c with a set present), `:264` (no set at all) | |
| T005 | complete | VERIFIED | `:278` | Rows are seeded in the failed and building sets, as planned |
| T006 | complete | VERIFIED | `test_reader_volume.py:203` | Seven sorts × two orders × 6 pages; the full order is asserted; cells checked against the current set; EXPLAIN under `SET LOCAL enable_seqscan = off`; elapsed time printed, no bound |
| T007 | complete | VERIFIED | `:344`, `:365`, `:391`, `:411`, `:430`, `:446`, `:478`, `:498`, `:512`, `:532` | Every listed case is present. The order tests share IR-001's gap |
| T008 | complete | VERIFIED | `:548`, `:574`, `:593`, `:598`, `:618`, `:642`, `:656`, `:667`, `:685` | |
| T009 | complete | VERIFIED | `test_reader_volume.py:250` | IR-005 (LOW) on the strength of the history index assertion |
| T010 | complete | VERIFIED | `tests/unit/test_reader_paging.py` (fake connection; bounds, malformed cursors, round trip, `SetNotFound`) | The listed malformed cases raise `CursorError` before any statement. IR-002 covers a class it does not list |
| T011 | complete | VERIFIED | `test_reader_sql_read_only.py` parametrizations extended | |
| T012 | complete | VERIFIED | `stock_history.sql` | Shape as planned: `inst`, `page_sets` grouped per set, keyset, `LEFT JOIN`s, `array_position` order |
| T013 | complete | VERIFIED | `sets.sql` | The `jsonb_object_agg` spelling is identical to `current_set.sql:30-33` |
| T014 | complete | VERIFIED | `reader.py:92`, `:154-155`, `:442`, `:454`, `:472`, `:814`, `:820`, `:954` | One `MAX_PAGE_SIZE` import (`:83`); no model redefined |
| T015 | complete | VERIFIED | `reader.py:720-763` | Cells built only through `_cell_from_row` |
| T016 | complete | VERIFIED | `reader.py:766-811`, `:989` | `_factor_summaries` was extracted from `_row_to_current`'s single call site as a rename-only move, and S1's tests are unchanged (the T016 condition); `test_reader_current_set.py` and `test_reader_summary.py` pass. `factors={}` for a set with no factor row is DEC-0265 (see Scope; IR-003) |
| T017 | complete | VERIFIED | `tests/unit/test_package_data_ships_sql.py` 10 passed | |
| T018 | complete | VERIFIED | Greps (Independent Validation) | `FactorCell(` only at `:709` (`_cell_from_row`) and `:931` (S2 list mapper) |
| T019 | complete | VERIFIED | ruff, format and mypy clean; docstring `reader.py:48-59` cites DAC-E3-S4-1 to -4, DAC-E3-9, DAC-E3-12 and TC-COMP-150 to 153 | No file outside the plan's list |
| T020 | complete | VERIFIED | `CAP-002-E3-S4-tdd-evidence.yaml` | Lint clean with `--require-logs`; all hashes match; the patch replays to HEAD. One cycle fits the plan's tests-first then code phases |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_history_returns_earlier_complete_sets_newest_first_with_marks` / TC-COMP-150 | WEAK | Earlier complete sets only, current excluded, every cell equal to the stored row (read back independently), marks per factor, `run_outcome` for `partial` and `succeeded`, and identical rows after a newer set | The three sets' `classification_date` order equals their `ended_at` order, so ordering by date passes. Two non-equivalent mutants survive (IR-001) |
| `test_never_classified_stock_has_an_empty_history_not_an_unknown_symbol`, `test_unknown_symbol_raises_with_no_set_at_all` / TC-COMP-151 | ADEQUATE | `([], None)` for no rows and for current-only rows; `InstrumentNotFound` with `.symbol`, with and without any set | None |
| `test_history_excludes_failed_and_building_sets_that_the_set_list_includes` / TC-COMP-152 | ADEQUATE | Failed and building sets hold the stock's rows yet are absent from history; the list carries them newest `started_at` first, with state, `failure_reason`, `ended_at`, run fields, stored dates, counts and factor summaries in `FACTORS` order | None |
| `test_list_sort_and_count_at_3000_stocks_are_correct_and_indexed` / TC-COMP-153 | ADEQUATE | 14 full paged passes; `match_count` 3000 on every page; full order against an independently computed order; cells from the current set (the older set is shifted by 100); plan nodes free of the listed Seq Scans; Index Cond on `set_id`; the bound set id in the plan | None |
| T007 history order tests (`:391`, `:446`, `:411`) | WEAK | Ties on `ended_at` broken by `set_id`; keyset paging stable across a newly completed set; full last page has no cursor | None seeds earlier sets that share a `classification_date` but differ in `ended_at` (IR-001) |
| T007 other detail tests (`:344`, `:365`, `:430`, `:478`, `:498`, `:512`, `:532`) | ADEQUATE | Retired stock as stored; only the stock's sets and rows; frozen rows; upper-casing only (`"aapl "` raises with `"AAPL "`); empty with no complete set; one statement besides the set-block read; exact fields | None |
| T008 set list and `get_set` tests | ADEQUATE | Order with a `started_at` tie; keyset paging; empty store; first set not complete; DEC-0265 empty `factors`; `get_set` equals the list row in every state; `SetNotFound`; stored `active_instruments` (1234) and `ended_at` (microseconds) | Every set-list mutant is killed or timed out. `rv-sets-order-by-date` is killed only by T009's index assertion (5/5 runs) |
| `test_thresholds_summary_history_and_sets_at_3000_stocks` / T009 | ADEQUATE | Four threshold, hide and prefix combinations against independently computed counts; summary counts and one-row statement; 20-set history and 21-set list with plan properties | IR-005 (LOW) |
| `tests/unit/test_reader_paging.py` / T010 | ADEQUATE | Limits 0, -1, 501, `True`, 1.5 refused before any statement, for both reads; 8 malformed cursors refused before any statement; round trip; bound keyset; `get_set` parameters; exception hierarchy | A type-confused payload is not among the cases. The behaviour is IR-002 |
| `tests/unit/test_reader_sql_read_only.py` / T011 | ADEQUATE | Both statements are one read-only statement with no `{` and no stray `%` | None |

Determinism: every test computes its expected order from stored values and
sorted UUIDs, never from the statements under test. The one probabilistic
element is the rate at which `test_history_breaks_an_ended_at_tie_by_set_id_descending`
kills an ordering regression: it depends on random UUIDs, because its third
set crosses UTC midnight (IR-001). Isolation: each test gets a fresh database
from `postgres_connection_string`.

### Mutation Run

My own run (I.5), not the coder's. The catalogue was regenerated over every
changed production file (`generate --range c886972..HEAD --cycle review`: 45
mutants), and 26 manual mutants came from my reading of design 2.6, DEC-0135,
DEC-0136 and DEC-0137, the plan's Open Gap 4, and AC-19. The command ran each
clone's own `src` against the reviewer server (DEC-0266):

`PYTHONPATH=src:<scratch>/plugin <component>/.venv/bin/python -m pytest -q -x -p reviewer_localpg -p no:cacheprovider tests/unit/test_reader_paging.py tests/unit/test_reader_sql_read_only.py tests/integration/test_reader_history.py tests/integration/test_reader_volume.py tests/integration/test_reader_current_set.py tests/integration/test_reader_summary.py`

The two current-set and summary suites cover the `_factor_summaries`
extraction. I checked that a clone's `src` shadows the venv's editable install.

| Set | Mutants | Killed | Survived | Timeout |
|-----|---------|--------|----------|---------|
| Catalogue (45) | 45 | 30 | 13 | 2 |
| Manual (26) | 26 | 22 | 3 | 1 |
| **Total** | **71** | **52** | **16** | **3** |

Three green baselines (20.7 s, 20.7 s, 20.8 s). The results file has SHA-256
`1c8904a8caf4d27673423b839b89e1e19cc2a97c6475ff8ca6e04cfabe9bda6e` and is
copied beside this report as `CAP-002-E3-S4-implementation-review-v1-mutation.json`.

Killed manual mutants:

- **History statement**:
  - `rv-hist-building-included` and `rv-hist-failed-included` (state filter)
  - `rv-hist-no-group`
  - `rv-hist-inner-page-join` and `rv-hist-inner-run-join`
  - `rv-hist-keyset-no-tiebreak`
  - `rv-hist-mark-recomputed-from-inputs`
- **Sets statement**:
  - `rv-sets-order-by-date` and `rv-sets-order-asc`
  - `rv-sets-keyset-no-tiebreak`
  - `rv-sets-ranked-constant`, `rv-sets-failure-reason-null`,
    `rv-sets-active-recomputed`, `rv-sets-ltd-from-date` and
    `rv-sets-ended-from-run` (stored columns)
- **Reader**:
  - `rv-reader-null-row-kept`, `rv-reader-history-keeps-extra`
  - `rv-reader-history-symbol-stripped`, `rv-reader-notfound-raw-symbol`
  - `rv-reader-empty-cursor-first-page`
  - `rv-reader-summaries-sorted`, `rv-reader-set-run-started-from-set`

Survivors and their dispositions:

- **Non-equivalent: IR-001.**
  - **`manual:rv-hist-page-order-by-date`** (`stock_history.sql:22` →
    `ORDER BY s.classification_date DESC, s.set_id DESC`). It survived this
    run and 4 of 4 reruns.
  - **`manual:rv-hist-final-order-by-date`** (`stock_history.sql:44` →
    `ORDER BY p.classification_date DESC, p.set_id DESC, …`). It survived this
    run and 1 of 4 reruns (2 of 5 in all). The rerun results file has SHA-256
    `ff8de838…e0121`.
  - The contract fixes the order: design 2.6 ("newest `ended_at` first",
    keyset `(ended_at, set_id)`), DEC-0137 ("newest ended_at first, tie broken
    by set_id") and plan Open Gap 4 ("Two complete sets can share a
    `classification_date`; both are listed, ordered by `ended_at`").
- **Equivalent under DEC-0135: `manual:rv-hist-index-defeated`**
  (`fc.instrument_id + 0`). Results are identical, and only the `page_sets`
  probe loses its Index Cond. The plan still has no Seq Scan on
  `factor_classification`, still reads it through
  `idx_factor_classification_instrument` (the final join keeps a keyed probe;
  EXPLAIN evidence), and still names no `factor_input`. Those are exactly the
  per-statement properties DEC-0135 (owner upheld) fixes for history. IR-005
  records the proof's limit.
- **Equivalent: `reader.py:741` and `:811`, `drop-defaulted-argument` and
  `negate-boolean` on `zip(..., strict=True)`.** `names` and each `row` come
  from the same cursor result, so their lengths are always equal and `strict`
  never fires. No artifact specifies the defensive check.
- **Equivalent: digit changes inside the `--` header comments of `sets.sql`
  (lines 1, 3, 3 and 5) and `stock_history.sql` (lines 1 to 5).** PostgreSQL
  discards comments. No artifact specifies comment text.
- **Timeouts (detected).** The suite cannot pass under any of these three:
  - `sets.sql:25` and `stock_history.sql:20` `off-by-one` (`<` → `<=`). An
    inclusive keyset repeats the last kept set, so the paging loops in the
    tests never end.
  - `manual:rv-reader-sets-cursor-from-ended`. The list cursor is taken from
    `ended_at`, which re-admits the last kept set the same way.

The coder's own run (`mutation-cycle-1-results.json`, 73 mutants: 55 killed,
13 survived, 5 timeouts) included no classification-date order mutant.

## Independent Validation

Component commands ran with `--directory repos/factorflow-v2/FactorFlow-v2`.
`scripts/` commands ran from the harness root. `<scratch>` is
`/tmp/claude-0/-home-user-AI-agents/5c7a5c14-a397-54f5-9e78-e2f8e97f5200/scratchpad/ir-e3s4-v1`,
outside the component repository. "Reviewer PG" means a fresh PostgreSQL
16.15 cluster I initialised for this review (127.0.0.1:55433), substituted
for the container by `<scratch>/plugin/reviewer_localpg.py` (SHA-256
`45068b93…379b`). It is not the coder's server or plugin (DEC-0266).

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261101T235358Z` | harness root | 0 | PASS | `c886972218b97461b869152fe201443ae21de5c1`, an ancestor of HEAD |
| `uv run --directory … --offline ruff check .` | component | 0 | PASS | `All checks passed!` |
| `uv run --directory … --offline ruff format --check .` | component | 0 | PASS | `273 files already formatted` |
| `uv run --directory … --offline mypy src` | component | 0 | PASS | `Success: no issues found in 60 source files` |
| `uv run --directory … --offline pytest -m "not postgres" -q -p no:cacheprovider` (sandboxed) | component | 1 | FAIL (environment) | `4 failed, 1489 passed, 892 deselected, 1 xfailed`. All four are in `tests/unit/test_deploy_smoke.py`: `OSError: [Errno 97] Address family not supported by protocol` from `scripts/deploy-smoke.sh` check 4 |
| same command, outside the sandbox (one plain call) | component | 1 | FAIL (environment; excluded, DEC-0267) | Identical: the same 4 failed, 1489 passed. Neither file differs between base and HEAD (`git diff` empty) |
| `PYTHONPATH=src <venv>/python -m pytest -q -p no:cacheprovider tests/unit/test_deploy_smoke.py` in `git clone --shared` of base `c886972` | `<scratch>/base-clone` | 1 | evidence | `4 failed, 8 passed`: the same four tests fail at the base in this environment |
| `uv run --directory … --offline pytest tests/integration/test_reader_history.py -m postgres -q -p no:cacheprovider -x` (sandboxed, container) | component | 1 | NOT RUN (environment) | Fixture setup: `docker.errors.DockerException` |
| `uv run --directory … --offline pytest -m postgres -q -p no:cacheprovider -x` (outside the sandbox, one plain call, container) | component | 1 | NOT RUN (environment) | `docker.errors.DockerException: Error while fetching server API version: ('Connection aborted.', FileNotFoundError(2, 'No such file or directory'))`. No Docker daemon (`/var/run/docker.sock` absent) |
| `uv run --directory … --offline --env-file <scratch>/plugin/localpg.env pytest -p reviewer_localpg -p no:cacheprovider tests/integration/test_reader_history.py tests/integration/test_reader_volume.py tests/unit/test_reader_paging.py tests/unit/test_reader_sql_read_only.py tests/unit/test_package_data_ships_sql.py -v -s` | component | 0 | PASS (reviewer PG) | `83 passed in 10.49s`. TC-COMP-153: `14 full passes over 3000 stocks in 3.85s (diagnostic only)`. Includes T017's `test_package_data_ships_sql.py` (10 passed) |
| `uv run --directory … --offline --env-file <scratch>/plugin/localpg.env pytest -p reviewer_localpg -p no:cacheprovider -m postgres -q` | component | 0 | PASS (reviewer PG, DEC-0266) | `892 passed, 1494 deselected, 2 warnings in 592.27s`. Includes the `pg_dump`/`pg_restore` test (TC-COMP-158), run with the local 16.15 client tools against the same server |
| T018 greps on `reader.py` and the two new statements | component | 0/0/0/1/1 | PASS | `base64\|json.dumps`: only S2's cursor lines (the same four lines as at base, shifted). `MAX_PAGE_SIZE`: one import (`:83`). `FactorCell(`: `:709` and `:931` only. `factor_input` in the new SQL: none. `universes.service\|api.routes`: none |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E3-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base c886972218b97461b869152fe201443ae21de5c1 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| `sha256sum` of the 8 files under `CAP-002-E3-S4-evidence/` | component | 0 | PASS | Each equals the value in the TDD evidence (`diff_sha256` `7dfbe878…af8` = `cycle-1.patch`) |
| Patch replay: `git archive c886972 src tests` into scratch, `git apply --include='src/*' --include='tests/*' cycle-1.patch`, `cmp` against `git show HEAD:<file>` | `<scratch>/replay` | 0 | PASS | All 8 code files are byte-identical to HEAD: the reviewed patch is the delivered code |
| RED log inspection (`red-cycle-1.log`) | component | N/A | PASS | 59 failed on `AttributeError` for the missing reader names and on the 8 missing-SQL `FileNotFoundError`s, a meaningful RED |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range c886972218b97461b869152fe201443ae21de5c1..HEAD --cycle review --out <scratch>/generated.json` | harness root | 0 | PASS | `45 mutant(s)`: 26 off-by-one, 12 negate-boolean, 6 drop-defaulted-argument, 1 drop-field-copy. 26 manual mutants appended (`<scratch>/add_manual.py`; each `old` checked unique at HEAD) → `mutants.json` SHA-256 `80e5b898…b55a5` |
| `python3 scripts/mutation-run.py run --repo-dir … --mutants <scratch>/mutants.json --jobs 3 --timeout 300 --command '<above>' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` | harness root | 3 | evidence | Three green baselines; tallies under Mutation Run. Exit 3 reports survivors |
| same runner, `--mutants <scratch>/reruns.json --jobs 2` (the two history order mutants and `rv-sets-order-by-date`, four reruns each) | harness root | 3 | evidence | `{"killed": 7, "survived": 5}`: page-order survived 4/4, final-order 1/4, sets-order killed 4/4 |
| `<venv>/python <scratch>/probe_same_date.py` (three runs; throwaway database; mutated SQL swapped in memory only) | `<scratch>` | 0 | evidence | Four same-day complete sets (the last is current). HEAD: newest `ended_at` first at `limit=50` and when paged at `limit=1`, 3/3 runs. Final-order mutant: wrong order 3/3, and a set skipped when paging. Page-order mutant: a set skipped when paging in run 1 (`[['eb4e08fe'], ['83c647f4']]`, missing `4b078da7`) |
| `<venv>/python <scratch>/explain_history.py` (T009-shaped store) | `<scratch>` | 0 | evidence | History: `factor_classification` read only through `idx_factor_classification_instrument` with `Index Cond: (instrument_id = …)`, with `enable_seqscan` on and off. Sets: `idx_classification_set_started` with `enable_seqscan = off` |
| Cursor probe (fake connection; `reader.list_sets` and `reader.stock_history` with base64 JSON payloads) | component | 0 | evidence | `{"v":1,"ts":5,…}` and `{"ts":null}` raise `TypeError`; `{"id":5}` raises `AttributeError`; a naive `ts` is accepted. All before any statement (IR-002) |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact docs/…/CAP-002-E3-S4.md` | harness root | 0 | PASS | `sha256:58d94cab…195d`, equal to the story approval's `reviewed_revision` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before validation, and after all test, mutation and probe runs) | harness root | 0 | PASS | `sha256:5c08a3e357fa944770f3d372d16b40e181addc1b6e9059bf255525b003e7c934` both times |

Required validation is nine commands:

- the story's five (`pytest -m postgres`, `pytest -m 'not postgres'`,
  `ruff check`, `ruff format --check`, `mypy src`);
- the focused story suites;
- T017;
- the T018 greps;
- the TDD-evidence lint.

Eight pass. `pytest -m postgres` passes on the reviewer server, not in a
container (DEC-0266). `pytest -m 'not postgres'` fails only on the four
deploy-smoke tests that need IPv6 sockets. Those are an environment exclusion
outside the review subject (DEC-0267), and that suite is not reported as
green.

Excluded, with reasons:

- **npm commands** (`npm ci`, `npm run build|test|test:e2e|lint|format`,
  `npx tsc --noEmit`). No frontend file changed.
- **`uv sync --all-extras` and `uv build`.** `pyproject.toml` and `uv.lock`
  are unchanged, and neither command is in the story's or the plan's
  validation. T017's guard is the plan's packaging check.

### Validation Side Effects

- Before: HEAD `62e5333`, branch `usr/alvaro-de-jodra/CAP-002-E3-S4-run-20261101T235358Z`, `git status --porcelain=v1 --untracked-files=all` empty, `code-revision` `sha256:5c08a3e3…7c934`. Ignored `.venv/`, `build/`, caches and `__pycache__/` were already present.
- After: the same HEAD, branch, empty status and `code-revision`. The pytest runs left only ignored `__pycache__` entries. The mutation clones, logs, probes, plugin and the reviewer PostgreSQL cluster (`/var/lib/postgresql/ir-e3s4-u002`) are all outside the component repository. The coder's server on port 55432 was not used or touched.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — History order is not pinned for earlier sets that share a classification date; two order mutants survive

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S4-1, DAC-E3-9 (AC-18)
- **Tasks**: T003, T007
- **Files**:
  - `tests/integration/test_reader_history.py:145`
    (`test_history_returns_earlier_complete_sets_newest_first_with_marks`,
    TC-COMP-150), `:391`
    (`test_history_breaks_an_ended_at_tie_by_set_id_descending`), `:446`
    (`test_history_pages_by_keyset_and_a_newer_set_shifts_no_page`)
  - The production lines under test are correct:
    `src/factorflow/classification/sql/stock_history.sql:22` and `:44`
- **Claim challenged**: TC-COMP-150 and the T007 order tests prove history is
  "newest first" (DAC-E3-S4-1, DAC-E3-9). That means newest `ended_at` first,
  ties by `set_id` (DEC-0137).
- **Observed evidence**:
  - Every ordering test seeds earlier sets whose `classification_date` order
    equals their `ended_at` order. The only sets sharing a date are in the
    tie test, and they share `ended_at` too. Its third set falls on the next
    UTC date only because `T0 + 2h` crosses midnight.
  - `manual:rv-hist-page-order-by-date` picks the page of sets by
    `classification_date DESC, set_id DESC`. It survived all 5 runs.
    `manual:rv-hist-final-order-by-date` orders the result that way. It
    survived 2 of 5, killed only when the midnight-crossing set happens not to
    hold the largest random `set_id`.
  - Probe `probe_same_date.py` used four same-day complete sets, each
    re-run completing an hour after the last. HEAD returns the three earlier
    sets newest `ended_at` first, unpaged and paged at `limit=1`, in 3 of 3
    runs.
  - Under the final-order mutant, the order was wrong in all 3 probe runs and
    paging lost a set.
  - Under the page-order mutant, paging lost the newest earlier set in run 1
    (`[['eb4e08fe'], ['83c647f4']]`, missing `4b078da7`).
- **Expected evidence/behavior**:
  - Design 2.6: history pages "newest `ended_at` first … keyset on
    `(ended_at, set_id)`".
  - DEC-0137 (owner upheld): "newest ended_at first, tie broken by set_id".
  - Task plan Open Gap 4: "Two complete sets can share a
    `classification_date`; both are listed, ordered by `ended_at`".
  - adversarial-review E.9: no non-equivalent mutant may survive.
- **Impact**: none today, because the code is correct. A later edit that
  orders or pages history by the classification date would ship with every
  test green. It would misorder same-day re-runs on the Earlier scores tab
  and, across pages, silently drop one: the re-run case the plan itself names.
- **Required remediation**: add a deterministic test of `stock_history` over
  at least three earlier complete sets that share one `classification_date`
  and have distinct `ended_at`.
  - Arrange them so `ended_at` order differs from `set_id` order, for example
    by giving the newest `ended_at` to the smallest `set_id` after reading
    the generated ids.
  - Assert newest `ended_at` first, both unpaged and paged at `limit=1`, with
    no set repeated or skipped.
  - Both mutants above must then be killed on every run.

### IR-002 — A cursor whose `ts` or `id` has the wrong JSON type escapes as `TypeError`/`AttributeError`, not `CursorError`

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T010, T014
- **Files**:
  - `src/factorflow/classification/reader.py:820` (`_decode_page_cursor`)
  - The root cause is unchanged CAP-001 code:
    `src/factorflow/runs/queries.py:191-193`, where `decode_cursor` catches
    only `KeyError` and `ValueError` around `datetime.fromisoformat` and
    `UUID(...)`
- **Claim challenged**: "a malformed cursor … raises `reader.CursorError` for
  both reads and before any statement" (T010; DEC-0136).
- **Observed evidence**: the cursor probe gave these results through both
  `list_sets` and `stock_history`, before any statement:
  - `{"v":1,"ts":5,"id":"<uuid>"}` and `{"v":1,"ts":null,…}` raise
    `TypeError: fromisoformat: argument must be str`.
  - `{"v":1,"ts":"…","id":5}` raises `AttributeError: 'int' object has no
    attribute 'replace'`.
  - A naive `ts` is accepted and read in the session time zone.
  - The eight malformed cases the tests list all raise `CursorError`.
- **Expected evidence/behavior**:
  - Reader design §4: "cursors are versioned and refused on any mismatch".
  - DEC-0136 (owner upheld): a malformed cursor surfaces as the reader's
    `CursorError`.
  - CAP-002-E3-S5 maps `CursorError` to 422 `cursor_invalid`.
- **Impact**: a hand-altered history or sets cursor gets a 500
  `internal_error` instead of a 422 once S5 mounts the routes. No data is
  exposed (SEC-ERR-001 handler). The same class already affects
  `/api/runs`.
- **Required remediation**: make the history and sets cursor path raise
  `CursorError` for any payload it cannot decode into `(datetime, UUID)`,
  with a test of a non-string `ts` and a non-string `id` for both reads.
  - The fix can go in `_decode_page_cursor`, or in
    `runs.queries.decode_cursor`. That is CAP-001 code, so its lane is the
    owner's choice; the plan forbids copying it.

### IR-003 — DEC-0265 is recorded `contained`, but it changes the `SetRow.factors` shape CAP-002-E3-S5 consumes

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S4-3
- **Tasks**: T016
- **Files**:
  - `projects/factorflow-v2/decisions/DEC-0265.md` (`class: contained`,
    `blocks: [CAP-002-E3-S4]`)
  - `src/factorflow/classification/reader.py:968`
  - `src/factorflow/classification/sql/sets.sql:4-5`
- **Claim challenged**: the coding-time decision that a set with no
  `classification_set_factor` row carries `factors == {}` reaches nothing
  downstream.
- **Observed evidence**: the decision's premise holds.
  - `engine.py:114-155` writes the factor rows in the build transaction, and
    on failure rolls back before marking the set `failed`.
  - So every real building or failed set reaches `list_sets` and `get_set`
    with `factors == {}` (`test_a_set_with_no_factor_rows_carries_empty_factors`).
  - But CAP-002-E3-S5, which is reverse-dependent on this story, serialises
    `SetRow` into `SetResponse`. Its plan T015 builds `SetResponse` with
    "exactly the fields of design 2.7", and design 2.7 gives `factors` as
    `{… {qualified_count, ranked, min_peer_set_size}}`.
  - S5's plan T012 (10) seeds its sets through `insert_set`, which always
    writes three factor rows, so S5's tests would never meet the empty map.
- **Expected evidence/behavior**:
  - `docs/decision-records.md`, *Classes*: `contained` means "nothing
    downstream consumes it"; `propagating` means it "feeds generated stories,
    task plans or code".
  - Precedent: DEC-0136 and DEC-0137 were amended from `contained` to
    `propagating`, and made to block CAP-002-E3-S5, for this reason
    (cross-plan review E3-F06).
- **Impact**:
  - An owner override of DEC-0265 would not flag CAP-002-E3-S5 for
    re-planning.
  - S5 could type set `factors` with three required keys and return 500 for
    every real building or failed set in the set history dialog.
- **Required remediation**: amend DEC-0265 to `class: propagating` and add
  CAP-002-E3-S5 to `blocks`, so S5's plan accounts for the empty `factors`
  map. No code change in this story.

### IR-004 — `stock_history` reads the current set and the history in two statements

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S4-1 (DEC-0137)
- **Tasks**: T015
- **Files**: `src/factorflow/classification/reader.py:729-740`
- **Claim challenged**: the current set is never in history.
- **Observed evidence**: `read_set_blocks(conn)` and `HISTORY_SQL` are
  separate statements on the caller's connection, under its isolation level.
  If a set completes between them under READ COMMITTED, that response lists
  the newly current set in history and omits the former current set.
  - The task plan (T015) prescribes this sequence.
  - `stock_evidence` uses the same pattern (CAP-002-E3-S3).
  - The coder's own code review noted it as non-blocking.
- **Expected evidence/behavior**: DEC-0137 excludes the current set.
- **Impact**: transient, for one response during the seconds a build
  commits. No stored data is affected.
- **Required remediation**: optional. Either resolve the current set inside
  `stock_history.sql`, or run both statements in one snapshot. Otherwise,
  record the window as accepted alongside `stock_evidence`'s.

### IR-005 — The history index proof cannot tell a keyed probe from a full scan of the same index

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S4-4 (T009 extras)
- **Tasks**: T009
- **Files**: `tests/integration/test_reader_volume.py:313-316`
- **Claim challenged**: history "uses `idx_factor_classification_instrument`"
  (T009; design §5 "History pages by `idx_factor_classification_instrument`").
- **Observed evidence**: `manual:rv-hist-index-defeated`
  (`WHERE fc.instrument_id + 0 = …`) survived. The `page_sets` access becomes
  an unconditioned scan of the index. The final join still probes it with
  `Index Cond: (instrument_id = …)`, so the test's assertions all hold:
  the name appears, there is no Seq Scan, and no `factor_input` appears.
- **Expected evidence/behavior**: DEC-0135 (owner upheld) fixes exactly
  those three properties. The mutant is therefore equivalent under the
  contract, and this is not a blocking gap.
- **Impact**: a regression that turned history's page selection into a full
  index scan would pass. At 3000 stocks × 21 sets that is cheap. It grows
  with retained sets.
- **Required remediation**: optional. Assert that every
  `factor_classification` access in the history plan carries an `Index Cond`
  naming `instrument_id`, mirroring T006's `set_id` assertion.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **DEC-0265 (coding, PROVISIONAL).** `SetRow.factors` is `{}` when
  `sets.sql` returns null factors. Design 2.3 and T016 assumed three rows. The
  premise is verified in `engine.py`. This is the smallest change that lets
  `list_sets` and `get_set` carry real building and failed sets
  (DAC-E3-S4-3), it invents no counts (AC-19), and it is tested at `:618`.
  The deviation is justified. Its decision class is IR-003.
- **DEC-0264 (coding).** The coder ran postgres-marked tests against a local
  server through `localpg_plugin`. I did not reuse that server or plugin; my
  evidence comes from my own server and plugin (DEC-0266).
- **`_factor_summaries` extraction** from `_row_to_current`. T016 permits it
  when S1's code has one call site, the move is rename-only and S1's tests are
  unchanged; all three hold. `rv-reader-summaries-sorted` was killed.
- **`bulk_seed_scored_stocks(..., score_shift=…)`.** An optional keyword
  beyond T002's signature, which T002 allows. It makes T006 (a) able to
  detect a read of the older set.
- **One TDD cycle for T001–T020.** This matches the plan's tests-first then
  code phases. The lint passes.
- **Story frontmatter `status: planning` → `in-review`.** This is the
  story-coding lifecycle step, and the content revision is unchanged. Plan
  Other Notes says the story would stay `todo`; that note predates coding.
- No unjustified file, dependency or refactor. Bookkeeping: all 20 tasks are
  checked and all are implemented.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**:
  - Rework with `CAP-002-E3-S4-tasks.md` and this report.
  - Resolve IR-001 with the deterministic same-date history test. The
    production code needs no change for it.
  - Address IR-002 and IR-003. IR-003 is an amendment to DEC-0265's class
    and `blocks`.
  - IR-004 and IR-005 are optional.
  - Then rerun this review (v2). It will scope mutants against this report's
    `reviewed_head` and `-mutation.json`.
- **Warnings accepted downstream**: N/A
- **Environment for the next run**: the next review needs either a Docker
  daemon or the same substitution as DEC-0266. The four IPv6 deploy-smoke
  failures recur on this machine for every story (DEC-0267).
- **Commit trailers**: this review rests on DEC-0266 and DEC-0267. The commit
  carrying this report and its `-mutation.json` should end with
  `Decision-Id: DEC-0266` and `Decision-Id: DEC-0267`.
