---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S4-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-02
updated: 2026-11-02
story_id: "CAP-002-E3-S4"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S4.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-02T17:47:42Z"
reviewed_head: "fadf2c4f53c5367102004d5d387204dc83a32b81"
review_base: "c886972218b97461b869152fe201443ae21de5c1"
reviewed_state_revision: "sha256:ceeda9941f9eaff4e3939fc5bd365097e2f6094012986dad4b4ea2b947dd3959"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-11-02T17:47:42Z
  source_artifacts:
    - id: CAP-002-E3-S4
      version: "1 (sha256:58d94cab203a14b0e70701607f5d728742a906ff03820099cafaf4fd2445195d)"
    - id: CAP-002-E3-S4-tasks
      version: "1 (updated 2026-11-02; sha256:21c4f033bb4742436373675eb07f0a36b8c7093d0bbf71105f7914e5976702e8)"
    - id: CAP-002-E3-S4-tdd-evidence
      version: "cycle-1, rework-1"
    - id: CAP-002-E3-S4-implementation-review
      version: "1 (baseline; reviewed_head 62e53336afee361880a7d83d22bce864df4a9349)"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
    - id: DEC-0132
      version: "applied, owner upheld"
    - id: DEC-0135
      version: "applied, owner upheld"
    - id: DEC-0136
      version: "applied, owner upheld"
    - id: DEC-0137
      version: "applied, owner upheld"
    - id: DEC-0265
      version: "open, decided_by agent; amended to propagating in rework-1"
    - id: DEC-0266
      version: "open, decided_by agent; accepted by the owner for this gate 2026-11-02, not yet upheld on the record"
    - id: DEC-0267
      version: "open, decided_by agent; accepted by the owner for this gate 2026-11-02, not yet upheld on the record"
    - id: DEC-0268
      version: "open, decided_by agent (rework-1)"
    - id: DEC-0269
      version: "open, decided_by agent (rework-1)"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E3-S4 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 0 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 20/20 verified |
| Required validation | 9/9: 7 passed as written; 2 accepted by the owner (DEC-0266, DEC-0267) |

All five v1 findings are resolved, each with current repository evidence:

- **v1 IR-001 (HIGH).** A new deterministic test pins history order for
  same-day re-runs. Both v1 survivors and three further order mutants are
  killed, 15 of 15 in reruns.
- **v1 IR-002.** `_decode_page_cursor` turns every type-confused cursor into
  `CursorError`.
- **v1 IR-003.** DEC-0265 is now `propagating` and blocks CAP-002-E3-S5.
- **v1 IR-004.** DEC-0269 records the two-statement window as accepted.
- **v1 IR-005.** The volume test requires an `instrument_id` index condition,
  which kills the v1 survivor.

The production code is correct, and I found no production defect.

One new finding, **IR-001 (MEDIUM, scope `late`)**. Every test seeds a set's
`classification_date` equal to the UTC date of its timestamps, so nothing pins
that history and the set list return the stored date. Two mutants that derive
the date from `ended_at` or `started_at` survive. A Chicago-evening probe shows
HEAD returns the stored date and both mutants the next day. A late finding
cannot block.

**The verdict rests on two conditions the owner accepted, not this reviewer.**

- **(a) `uv run pytest -m postgres`** cannot run in its testcontainers form
  on this machine: there is no Docker daemon.
  - The plain unsandboxed retry that step F.4 requires was refused by the
    permission classifier. The sandboxed run fails at fixture setup with
    `docker.errors.DockerException`.
  - The same suite ran against a reviewer-owned PostgreSQL 16.15 server instead
    (DEC-0266): `893 passed, 1502 deselected`, exit 0.
- **(b) `uv run pytest -m 'not postgres'`** fails only the four
  `tests/unit/test_deploy_smoke.py` tests. They need IPv6 sockets this kernel
  lacks. Neither the tests nor the script they exercise is in the change set,
  and the same four fail at base `c886972` (DEC-0267).

Under step F.3 either condition would otherwise make this review
`INCONCLUSIVE`. The owner, alvaro-de-jodra, accepted both for this gate,
interactively, on 2026-11-02, in the session that invoked this review. This
reviewer received that decision from the invoking session and did not witness
it. DEC-0266 and DEC-0267 still read `owner_reviewed: false`. The owner's
`uphold` under Follow-Up makes the acceptance durable on the records.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0 · **total 1**

| Finding | Severity | Scope | Blocks | Title |
|---------|----------|-------|--------|-------|
| IR-001 | MEDIUM | late | no | No test pins the stored `classification_date` against one derived from the set's timestamps; two late mutants survive |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S4.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S4-run-20261101T235358Z` |
| HEAD | `fadf2c4f53c5367102004d5d387204dc83a32b81` (`fix(classification): CAP-002-E3-S4 story-coding rework-1 …`), over `4b0bbd4` (review v1) and `62e5333` (story-coding) |
| Review base | `c886972218b97461b869152fe201443ae21de5c1` (`pipeline-state.py review-base`, no `--base-ref`; `git merge-base --is-ancestor` exit 0; the same commit v1 resolved from the integration branch) |
| Working tree | Clean: `git status --porcelain=v1 --untracked-files=all` empty before and after validation |
| Changed files reviewed | 29 (`c886972..HEAD`); 16 of them changed since the baseline (`62e5333..HEAD`) |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `62e53336afee361880a7d83d22bce864df4a9349`, with `CAP-002-E3-S4-implementation-review-v1-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/reader.py` | modified | T014, T015, T016; DEC-0265. Since v1: `_decode_page_cursor` re-raises `TypeError`/`AttributeError` as `CursorError` (v1 IR-002; T014; DEC-0268) |
| `src/factorflow/classification/sql/stock_history.sql` | added | T012; unchanged since v1 |
| `src/factorflow/classification/sql/sets.sql` | added | T013; unchanged since v1 |
| `tests/integration/reader_seed.py` | modified | T002; unchanged since v1 |
| `tests/integration/test_reader_history.py` | added | T003, T004, T005, T007, T008. Since v1: `test_history_orders_same_day_reruns_by_ended_at_not_by_date_or_id` (v1 IR-001; T007) |
| `tests/integration/test_reader_volume.py` | added | T006, T009. Since v1: the index helper takes the column; T009 asserts an `instrument_id` index condition (v1 IR-005) |
| `tests/unit/test_reader_paging.py` | added | T010. Since v1: four type-confused cursors in `MALFORMED` (v1 IR-002) |
| `tests/unit/test_reader_sql_read_only.py` | modified | T011; unchanged since v1 |
| `docs/.../stories/CAP-002-E3-S4.md` | modified | `status: in-review`; content revision equals the approval's `reviewed_revision` |
| `docs/.../stories/CAP-002-E3-S4-tasks.md` | modified | Checkboxes T001–T020; since v1 only `updated` and `last_reworked_review` (bookkeeping) |
| `docs/.../stories/CAP-002-E3-S4-tdd-evidence.yaml` | added | T020; cycles `cycle-1` and `rework-1` |
| `docs/.../stories/CAP-002-E3-S4-evidence/` (16 files: 8 for `cycle-1`, 8 for `rework-1`) | added | T020 evidence; all 14 hashed files equal the values the TDD evidence records |
| `docs/.../stories/CAP-002-E3-S4-implementation-review-v1.md` and `-v1-mutation.json` | added | Review v1 and its mutation results (commit `4b0bbd4`); the baseline |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-18 | SATISFIED | `reader.py:720` `stock_history` over `stock_history.sql` (one read-only statement) | `test_reader_history.py:145` (TC-COMP-150, identical rows after a newer set), `:240`, `:264`, `:278`, `:344` | Earlier classifications are visible, with their date, run and `ended_at`, as stored. IR-001 is a test gap on the date column; HEAD returns the stored date (probe) |
| AC-23 (read-through) | SATISFIED | `stock_history.sql:38` `fc.restated_possible`; `_cell_from_row` (`reader.py:707`, unchanged) | `test_reader_history.py:145` (True on value and growth of the middle set only) | `rv-hist-mark-recomputed-from-inputs` killed |
| DAC-E3-9 | SATISFIED | `stock_history.sql:16` (`state = 'complete'`), `:17` (current excluded, DEC-0137), `:22` and `:44` (`ended_at DESC, set_id DESC`) | `:145`, `:278`, `:391`, `:411`, `:488` | Newest `ended_at` first is now pinned for same-day re-runs (`:411`); v1 IR-001 resolved |
| DAC-E3-12 (history half) | SATISFIED | As AC-23 | `:145` (every cell equals the stored row; marks per factor) | |
| DAC-E3-S4-1 | SATISFIED | As DAC-E3-9 | TC-COMP-150 `:145`; `:411` | Order mutants on page selection and on the final order (date, `started_at`, id descending, id ascending, `ended_at` ascending) are all killed |
| DAC-E3-S4-2 | SATISFIED | `reader.py:742-747` (no row raises `InstrumentNotFound`; a null `set_id` row is skipped); `stock_history.sql:39-40` | TC-COMP-151 `:240`, `:264` | `rv-hist-inner-page-join`, `rv-reader-null-row-kept`, `reader.py:742:negate-boolean` killed |
| DAC-E3-S4-3 | SATISFIED | `stock_history.sql:16`; `sets.sql` (no state filter); `reader.py:958` `_row_to_set` | TC-COMP-152 `:278`; `:640`, `:660` | Exclusion is by state, not by missing rows; the list carries `state`, `failure_reason` and `ended_at` |
| DAC-E3-S4-4 | SATISFIED | Both statements read `factor_classification` through keyed indexes (plans under `enable_seqscan = off`) | TC-COMP-153 `test_reader_volume.py:203`; T009 `:250` | Budget per DEC-0135 (owner upheld). The history plan now must carry `Index Cond` on `instrument_id` (`:317`). Diagnostic: 14 full passes over 3000 stocks in 3.90 s |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Base `c886972` holds every named producer, seed helper, cursor function, bound and index | Nothing edited |
| T002 | complete | VERIFIED | `reader_seed.py` `bulk_seed_scored_stocks`, `analyze_classification_tables` | Unchanged since v1; optional `score_shift` as v1 recorded |
| T003 | complete | VERIFIED | `test_reader_history.py:145` | ADEQUATE now that `:411` pins the same-day order |
| T004 | complete | VERIFIED | `:240`, `:264` | |
| T005 | complete | VERIFIED | `:278` | |
| T006 | complete | VERIFIED | `test_reader_volume.py:203` | |
| T007 | complete | VERIFIED | `:344`, `:365`, `:391`, `:411`, `:453`, `:472`, `:488`, `:520`, `:540`, `:554`, `:574` | `:411` added in rework-1 for v1 IR-001 |
| T008 | complete | VERIFIED | `:590`, `:616`, `:635`, `:640`, `:660`, `:684`, `:698`, `:709`, `:727` | |
| T009 | complete | VERIFIED | `test_reader_volume.py:250`, `:317` | `:317` added in rework-1 for v1 IR-005 |
| T010 | complete | VERIFIED | `tests/unit/test_reader_paging.py:101` (`MALFORMED`, 12 cases, both reads), `:120` | Four type-confused cases added in rework-1 for v1 IR-002 |
| T011 | complete | VERIFIED | `test_reader_sql_read_only.py` parametrizations | |
| T012 | complete | VERIFIED | `stock_history.sql` | Shape as planned |
| T013 | complete | VERIFIED | `sets.sql` | `jsonb_object_agg` spelling as `current_set.sql` |
| T014 | complete | VERIFIED | `reader.py:154-155`, `:442`, `:454`, `:472`, `:814`, `:820-829`, `:958` | `_decode_page_cursor` also maps type errors (DEC-0268); one `MAX_PAGE_SIZE` import (`:83`) |
| T015 | complete | VERIFIED | `reader.py:720-763` | Cells only through `_cell_from_row` |
| T016 | complete | VERIFIED | `reader.py:766-811`, `:993` | `_factor_summaries` rename-only extraction as v1 verified; `factors={}` per DEC-0265 |
| T017 | complete | VERIFIED | `tests/unit/test_package_data_ships_sql.py` 10 passed (in the focused run) | |
| T018 | complete | VERIFIED | Greps (Independent Validation) | `FactorCell(` only at `:709` (`_cell_from_row`) and `:935` (S2 list mapper `_row_to_cell`) |
| T019 | complete | VERIFIED | ruff, format, mypy clean; module docstring (`reader.py:48-59`) cites DAC-E3-S4-1 to -4, DAC-E3-9, DAC-E3-12 and TC-COMP-150 to 153 | No file outside the plan's list |
| T020 | complete | VERIFIED | `CAP-002-E3-S4-tdd-evidence.yaml` | Lint clean with `--require-logs`; 14 hashes match; `rework-1.patch` applied to `62e5333` reproduces HEAD byte for byte |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_history_returns_earlier_complete_sets_newest_first_with_marks` / TC-COMP-150 | ADEQUATE | Earlier complete sets only, current excluded, every cell equal to the stored row, marks per factor, `run_outcome` for `partial` and `succeeded`, identical rows after a newer set | Order is now also pinned by `:411`. `classification_date` is seeded equal to the UTC date of the set's times (IR-001, late: does not make this test WEAK) |
| `test_history_orders_same_day_reruns_by_ended_at_not_by_date_or_id` (`:411`, T007, v1 IR-001) | ADEQUATE | Three earlier sets share one date; `started_at` and `ended_at` are assigned after reading the generated ids so that newest `ended_at` first (smallest, largest, middle id) differs from date, id and `started_at` order in either direction. Asserted unpaged, at `limit=1` and at `limit=2`, with exact `ended_at` values | Deterministic: no dependence on random UUID order. Kills the five order mutants 15/15 alone |
| TC-COMP-151 (`:240`, `:264`) | ADEQUATE | `([], None)` for no rows and for current-only rows; `InstrumentNotFound` with and without any set | None |
| TC-COMP-152 (`:278`) | ADEQUATE | Failed and building sets hold the stock's rows yet are absent from history; the list carries them with state, `failure_reason`, `ended_at`, run fields and factor summaries | `classification_date` as for TC-COMP-150 (IR-001, late) |
| TC-COMP-153 (`test_reader_volume.py:203`) | ADEQUATE | 14 paged passes; `match_count` 3000 on every page; full order against an independently computed order; cells from the current set; no listed Seq Scan; `Index Cond` on `set_id` | None |
| Other T007 tests (`:344`, `:365`, `:391`, `:453`, `:472`, `:488`, `:520`, `:540`, `:554`, `:574`) | ADEQUATE | Retired stock as stored; only the stock's sets; tie by `set_id`; last page without cursor; frozen rows; keyset stable across a newer set; upper-casing only; empty with no complete set; one statement; exact fields | None |
| T008 tests (`:590` to `:727`) | ADEQUATE | Order with a `started_at` tie; keyset paging; empty store; first set not complete; DEC-0265 empty `factors`; `get_set` equals the list row in every state; `SetNotFound`; stored `active_instruments` and `ended_at` | `classification_date` (IR-001, late) |
| `test_thresholds_summary_history_and_sets_at_3000_stocks` / T009 | ADEQUATE | Threshold, hide and prefix counts; summary counts; 20-set history and 21-set list plans; history plan now keyed on `instrument_id` | None (v1 IR-005 resolved) |
| `tests/unit/test_reader_paging.py` / T010 | ADEQUATE | Limits refused before any statement; 12 malformed cursors refused before any statement for both reads, including non-string and null `ts` and `id`; round trip; bound keyset; exception hierarchy | None (v1 IR-002 resolved). A naive `ts` is accepted by design (DEC-0268) |
| `tests/unit/test_reader_sql_read_only.py` / T011 | ADEQUATE | Both statements are one read-only statement with no `{` and no stray `%` | None |

Determinism: v1 noted one probabilistic kill, which depended on a random
`set_id` order. The new same-day test removes it: the rerun file shows the
date-order mutants killed on every run. Isolation: each test gets a fresh
database from `postgres_connection_string`.

### Mutation Run

**Provenance.** This review ran in two parts.

- **Before a container restart** (2026-11-02, 16:34–17:07Z), this review
  generated the mutants, ran them, reran the order mutants and ran both
  probes, under `<scratch>`.
- **After the restart** I verified that evidence:
  - the results hash;
  - an independent `generate` and `scope`, whose mutants file is byte-identical
    to the one the run used;
  - the kill and survivor logs;
  - a rerun of eight sampled mutants and of both probes against unchanged
    HEAD.

I then reran every validation command myself.

**Commands.** All ran from the harness root.

- `generate --range c886972..HEAD --cycle review`: 45 mutants (26
  off-by-one, 12 negate-boolean, 6 drop-defaulted-argument, 1
  drop-field-copy). My regeneration is byte-identical.
- 16 manual mutants were appended (`<scratch>/add_manual_v2.py`; each `old`
  checked unique at HEAD).
- `scope --since 62e53336… --previous …-v1-mutation.json`: 86 mutants. It
  carries 25 of v1's 26 manual mutants; `rv-reader-empty-cursor-first-page`
  no longer applies, and `rv2-reader-empty-cursor-first-page` replaces it.
  Tags: 70 `carried`, 5 `delta`, 11 `late`. `mutants.json` SHA-256 is
  `e9a98be8…6914b`.
- `run --jobs 3 --command 'PYTHONPATH=src:<scratch>/plugin <venv>/python -m pytest -q -x -p reviewer_localpg_v2 -p no:cacheprovider tests/unit/test_reader_paging.py tests/unit/test_reader_sql_read_only.py tests/integration/test_reader_history.py tests/integration/test_reader_volume.py tests/integration/test_reader_current_set.py tests/integration/test_reader_summary.py'`.
  It had three green baselines (107 passed; 17.4 s, 17.4 s, 18.4 s).

| Set | Mutants | Killed | Survived | Timeout |
|-----|---------|--------|----------|---------|
| Carried (70) | 70 | 54 | 13 | 3 |
| Delta (5) | 5 | 5 | 0 | 0 |
| Late (11) | 11 | 9 | 2 | 0 |
| **Total** | **86** | **68** | **15** | **3** |

The results file has SHA-256
`2da56312f6582ba536a78ece1c65f04f9e75ad5c1a6b45b411f41fc9cd28f033` and is
copied beside this report as `CAP-002-E3-S4-implementation-review-v2-mutation.json`.

**Delta mutants (all killed).** They cover the `_decode_page_cursor` rework:

- `rv2-cursor-catch-type-only` and `rv2-cursor-catch-attr-only`;
- `rv2-cursor-reraise-valueerror`;
- `rv2-cursor-unwrapped`;
- `rv2-reader-empty-cursor-first-page`.

**v1 survivors now killed:**

- `rv-hist-page-order-by-date`, killed in 3.6 s;
- `rv-hist-final-order-by-date`, killed in 3.1 s;
- `rv-hist-index-defeated`, killed by T009's new `instrument_id`
  index-condition assertion (`test_reader_volume.py:137`, a Bitmap Heap Scan
  with an empty `Index Cond`).

**Late mutants killed:**

- history order: `rv2-hist-page-order-by-started`, `rv2-hist-page-order-by-id`,
  `rv2-hist-final-order-by-id-asc` and `rv2-hist-final-order-ended-asc`;
- history contents: `rv2-hist-current-included`, `rv2-hist-run-outcome-constant`
  and `rv2-reader-history-one-group`;
- set list: `rv2-sets-order-by-ended` and `rv2-sets-run-outcome-from-set`.

**Reruns.** `<scratch>/reruns.json` (SHA-256 `f9d902d6…a3ccb`) holds five
order mutants × 3, run with only the new test
(`… tests/integration/test_reader_history.py -k same_day_reruns`). All 15 were
killed (`reruns-results.json`, SHA-256 `f461a71b…e0afb`). The five are:

- the two v1 date-order mutants;
- the `started_at` page order;
- the id-only page order;
- the id-ascending final order.

So the new test alone pins them, deterministically.

**My spot rerun.** I reran eight mutants with the same runner and command,
`--jobs 2`, against unchanged HEAD (`<scratch>-verify/spot-results.json`,
SHA-256 `b9bc327f…6d373`), and every outcome matched the run:

- killed: `rv2-cursor-unwrapped`, `rv2-cursor-catch-attr-only`,
  `rv-hist-page-order-by-date`, `rv-hist-final-order-by-date` and
  `rv-hist-index-defeated`;
- survived: `rv2-hist-date-from-ended`, `rv2-sets-date-from-started` and
  `reader.py:741:negate-boolean:1`.

Survivors and their dispositions:

- **Non-equivalent, late: IR-001.**
  - `manual:rv2-hist-date-from-ended` changes `stock_history.sql:27` to
    `(p.ended_at AT TIME ZONE 'UTC')::date AS classification_date`.
  - `manual:rv2-sets-date-from-started` changes `sets.sql:8` to
    `(s.started_at AT TIME ZONE 'UTC')::date AS classification_date`.
  - Both production lines are unchanged since `62e5333`, and `scope` tagged
    both mutants `late`.
- **Equivalent, carried (13, as in v1 and the coder's cycle-1):**
  - `reader.py:741` and `:811` `drop-defaulted-argument` and `negate-boolean`
    on `zip(..., strict=True)`: `names` and each `row` come from one cursor
    result, so `strict` never fires, and no artifact specifies the check.
  - Digit changes inside the `--` header comments of `sets.sql` (lines 1, 3,
    3, 5) and `stock_history.sql` (lines 1 to 5): PostgreSQL discards
    comments, and no artifact specifies comment text.
- **Timeouts (detected, carried).** These make paging repeat the last kept set,
  so the tests' paging loops never end:
  - `sets.sql:25` and `stock_history.sql:20` `off-by-one` (`<` → `<=`);
  - `manual:rv-reader-sets-cursor-from-ended`.

## Independent Validation

Component commands ran with `--directory repos/factorflow-v2/FactorFlow-v2`.
`scripts/` commands ran from the harness root.

`<scratch>` is
`/tmp/claude-0/-home-user/5c7a5c14-a397-54f5-9e78-e2f8e97f5200/scratchpad/ir-e3s4-v2`,
and `<scratch>-verify` is the same path with `-verify` appended. Both are
outside the component repository.

"Reviewer PG" means a PostgreSQL 16.15 cluster this review initialised at
`/var/lib/postgresql/ir-e3s4-v2r` (127.0.0.1:55436, fsync off). The container
restart stopped it, and I restarted it with the same options. The
testcontainers class is substituted by `<scratch>/plugin/reviewer_localpg_v2.py`
(SHA-256 `c179bb4d…e64e`), loaded with `-p reviewer_localpg_v2` through
`--env-file <scratch>/plugin/localpg.env`.

Neither the coder's server (55432) nor the coder's plugin is used (DEC-0266).

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `c886972218b97461b869152fe201443ae21de5c1`; `git merge-base --is-ancestor` exit 0 |
| `uv run --directory … --offline pytest -m postgres -x -q -p no:cacheprovider` (sandboxed, container) | component | 1 | NOT RUN (environment) | Fixture setup: `docker.errors.DockerException: Error while fetching server API version: ('Connection aborted.', FileNotFoundError(2, 'No such file or directory'))`. `/var/run/docker.sock` absent |
| same command, outside the sandbox (one plain call, `dangerouslyDisableSandbox`) | component | N/A | NOT RUN (refused) | Refused by the permission classifier (`[Auto-Mode Bypass]`), as the same retry was earlier in this review. Not retried |
| `uv run --directory … --offline --env-file <scratch>/plugin/localpg.env pytest -p reviewer_localpg_v2 -p no:cacheprovider -m postgres -q` | component | 0 | PASS (reviewer PG; owner-accepted, DEC-0266) | `893 passed, 1502 deselected, 2 warnings in 1238.35s`: every postgres-marked test, including the `pg_dump`/`pg_restore` test (TC-COMP-158), which runs with the local 16.15 client tools against the same server. The run was slow but did not fail. CAP-001's `test_coverage_volume.py` spent about 12 s per page in `gaps.sql`, against 1.4 s for the same query run standalone. That test is outside the change set |
| `uv run --directory … --offline pytest -m 'not postgres' -q -p no:cacheprovider` (sandboxed, plain) | component | 1 | FAIL (environment; owner-accepted, DEC-0267) | `4 failed, 1497 passed, 893 deselected, 1 xfailed`. All four in `tests/unit/test_deploy_smoke.py`, from `scripts/deploy-smoke.sh` check 4: `OSError: [Errno 97] Address family not supported by protocol` (`/proc/net/if_inet6` absent). Not retried unsandboxed after the refusal above: the missing IPv6 is a kernel property, and v1's unsandboxed run of this command failed identically |
| `PYTHONPATH=src <venv>/python -m pytest -q -p no:cacheprovider tests/unit/test_deploy_smoke.py` in a clone of base `c886972` | `<scratch>/base-clone` | 1 | evidence | `4 failed, 8 passed`: the same four. Three show `Errno 97` directly. In the fourth (`…check_4_fails_when_non_loopback…`) check 4 dies on the same `Errno 97` before the VM probe it asserts; I printed the script's output through the test's own stubs to confirm |
| `git diff --stat c886972..HEAD -- tests/unit/test_deploy_smoke.py scripts/deploy-smoke.sh` | component | 0 | evidence | Empty: neither file is in the change set |
| `uv run --directory … --offline --env-file <scratch>/plugin/localpg.env pytest -p reviewer_localpg_v2 -p no:cacheprovider tests/integration/test_reader_history.py tests/integration/test_reader_volume.py tests/unit/test_reader_paging.py tests/unit/test_reader_sql_read_only.py tests/unit/test_package_data_ships_sql.py -v -s` | component | 0 | PASS (reviewer PG) | `92 passed in 11.64s`, including T017's `test_package_data_ships_sql.py` (10 passed). `TC-COMP-153: 14 full passes over 3000 stocks in 3.90s (diagnostic only)` |
| `uv run --directory … --offline ruff check .` | component | 0 | PASS | `All checks passed!` |
| `uv run --directory … --offline ruff format --check .` | component | 0 | PASS | `273 files already formatted` |
| `uv run --directory … --offline mypy src` | component | 0 | PASS | `Success: no issues found in 60 source files` |
| T018 greps on `reader.py` and the two new statements | component | 0/0/0/1/1 | PASS | `base64\|json.dumps`: the same five lines as at base (S2's cursor), shifted. `MAX_PAGE_SIZE`: one import (`:83`). `FactorCell(`: `:709` and `:935` only. `factor_input` in the new SQL: none. `universes.service\|api.routes`: none |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E3-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base c886972218b97461b869152fe201443ae21de5c1 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| SHA-256 of every log, patch and results file the TDD evidence cites | harness root | 0 | PASS | 14 of 14 equal the recorded values (`rework-1.patch` = `diff_sha256` `dfdb196e…6012`) |
| Patch replay: `git archive 62e5333 src tests`, `git apply --include='src/*' --include='tests/*' rework-1.patch`, `cmp` against `git show HEAD:<file>` | `<scratch>-verify/replay` | 0 | PASS | The 4 code files changed since v1 are byte-identical to HEAD |
| `python3 scripts/mutation-run.py generate … --range c886972..HEAD --cycle review` and `scope … --since 62e5333 --previous <v1 -mutation.json>` | harness root | 0/0 | PASS | Byte-identical to the run's `generated.json` and `mutants.json` (`e9a98be8…6914b`); `{"carried": 70, "delta": 5, "late": 11}` |
| `python3 scripts/mutation-run.py run …` (86 mutants; see Mutation Run) | harness root | 3 | evidence | 68 killed, 15 survived, 3 timeouts; `results.json` `2da56312…f033` |
| `python3 scripts/mutation-run.py run … --only <8 ids> --jobs 2` (spot rerun) | harness root | 3 | evidence | Every outcome matches the run |
| `<venv>/python <scratch>/probe_cursor.py` (fake connection that fails on any statement) | component | 0 | evidence | 14 malformed shapes (`ts` int, null, list, object, bool; `id` int, null, list, object, float; list and string payloads; string `v`; 100000-deep nesting) raise `CursorError` before any statement for both reads. A naive `ts` and a valid cursor decode (DEC-0268) |
| `PYTHONPATH=src:. <venv>/python <scratch>/probe_dates.py` (throwaway database on reviewer PG; mutated SQL swapped in memory only) | component | 0 | evidence | A set stored with `classification_date` 2026-10-01 and times on 2026-10-02 UTC (a Chicago-evening build; `claim_set.sql` stamps the America/Chicago date). HEAD: history and list both `2026-10-01`. `rv2-hist-date-from-ended`: `2026-10-02`. `rv2-sets-date-from-started`: `2026-10-02` in `list_sets` and `get_set` |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact docs/…/CAP-002-E3-S4.md` | harness root | 0 | PASS | `sha256:58d94cab…195d`, equal to the story approval's `reviewed_revision` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before validation, and after all test, mutation and probe runs) | harness root | 0 | PASS | `sha256:ceeda9941f9eaff4e3939fc5bd365097e2f6094012986dad4b4ea2b947dd3959` both times |

Required validation is the same nine commands as v1:

- the story's five (`pytest -m postgres`, `pytest -m 'not postgres'`,
  `ruff check`, `ruff format --check`, `mypy src`);
- the focused story suites;
- T017;
- the T018 greps;
- the TDD-evidence lint.

Seven pass as written. The remaining two pass only because the owner accepted
them:

- **`pytest -m postgres`** passes on the reviewer server, not in a container.
  The owner accepted that substitution for this gate (DEC-0266).
- **`pytest -m 'not postgres'`** fails on four environment-only tests outside
  the change set. The owner accepted it as an environment exclusion for this
  gate (DEC-0267). This suite is not reported as green.

Excluded, with reasons:

- **npm commands.** No frontend file changed.
- **`uv sync --all-extras` and `uv build`.** `pyproject.toml` and `uv.lock`
  are unchanged, and neither command is in the story's or the plan's
  validation; T017 is the plan's packaging check.

### Validation Side Effects

- Before: HEAD `fadf2c4`, branch `usr/alvaro-de-jodra/CAP-002-E3-S4-run-20261101T235358Z`, `git status --porcelain=v1 --untracked-files=all` empty, `code-revision` `sha256:ceeda994…3959`.
- After: the same HEAD, branch, empty status and `code-revision`. Pytest left
  only ignored `__pycache__` entries.
- Outside the component repository: the mutation clones, logs, probes,
  plugin, base clone and the reviewer cluster. The probe's throwaway database
  was dropped.
- Untouched: the coder's server on 55432 and the other clusters under
  `/var/lib/postgresql`.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — No test pins the stored `classification_date` against one derived from the set's timestamps; two late mutants survive

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-18, DAC-E3-9 ("exactly as each was recorded"), DAC-E3-S4-1, DAC-E3-S4-3
- **Tasks**: T003, T005, T008
- **Files**:
  - `tests/integration/test_reader_history.py:47-77` (`_set`, whose default
    is `started_at.date()`), `:151` and `:156` (TC-COMP-150), `:423`
    (same-day test)
  - The production lines under test are correct and unchanged since v1:
    `src/factorflow/classification/sql/stock_history.sql:27` and
    `src/factorflow/classification/sql/sets.sql:8`
- **Claim challenged**: history and the set list return each set's stored
  `classification_date` (T003: each `HistoryRow` carries `classification_date`;
  T005 and T008: set rows carry their stored values).
- **Observed evidence**:
  - Every seeded set's `classification_date` equals the UTC date of its
    `started_at` and `ended_at`:
    - TC-COMP-150 seeds 2026-10-01 and 2026-10-02 sets at 22:30 UTC on
      those days.
    - The sets tests default to `started_at.date()`.
    - The new same-day test uses 2026-10-02 with times on that UTC day.
  - So `rv2-hist-date-from-ended` (`stock_history.sql:27`) and
    `rv2-sets-date-from-started` (`sets.sql:8`) survive the focused suites:
    in the run, in my spot rerun, and with 107 tests green.
  - The probe stores a set the way `claim_set.sql` stamps an evening build
    (America/Chicago date 2026-10-01, times on 2026-10-02 UTC).
    - HEAD returns 2026-10-01 from `stock_history`, `list_sets` and
      `get_set`.
    - Each mutant returns 2026-10-02.
- **Expected evidence/behavior**:
  - AC-18: "retained with the date it was produced".
  - Reader design 2.6: history is grouped "with the set's
    `classification_date` … Each row is what was recorded; nothing is
    recomputed (AC-19)".
  - STD-UI-5: dates are America/Chicago dates and MUST NOT be converted
    between zones.
  - So both mutants change specified behaviour and are not equivalent.
  - adversarial-review E.9 and H: a survivor tagged `late` is reported, MEDIUM
    at most, and does not make its test `WEAK`.
- **Impact**: none today, because the code is correct. Suppose a later edit
  derived the date from the set's timestamps, or converted it through UTC.
  Every test would stay green. The Earlier scores tab and the set history
  dialog would then show the next day's date for any set built after 19:00
  Central (18:00 in winter), contrary to AC-18 and STD-UI-5.
- **Required remediation** (non-blocking): add a test where a complete set's
  stored `classification_date` differs from the UTC date of its `started_at`
  and `ended_at`, as for a Chicago-evening build. Assert that `stock_history`,
  `list_sets` and `get_set` each return the stored date. Both mutants above
  must then be killed. No production change.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `test_reader_history.py:411` `test_history_orders_same_day_reruns_by_ended_at_not_by_date_or_id`: three earlier sets share one date, newest `ended_at` is neither date, id nor `started_at` order; asserted unpaged and at `limit=1` and `2`. Both v1 survivors killed in the run; with the `started_at`, id-only and id-ascending order mutants, 15/15 killed by this test alone in reruns. TC-COMP-150, the T007 order tests, DAC-E3-9 and DAC-E3-S4-1 are now ADEQUATE / SATISFIED |
| v1/IR-002 | RESOLVED | `reader.py:820-829` re-raises `TypeError` and `AttributeError` as `CursorError` (chained; DEC-0268); `test_reader_paging.py:110-114` adds non-string and null `ts` and `id` for both reads. The probe shows 14 malformed shapes refused before any statement. The 5 delta mutants on the rework are killed. The naive `ts` is accepted by DEC-0268, as DEC-0136 already accepts a tampered cursor yielding a wrong page; v1 required only the type-confused class |
| v1/IR-003 | RESOLVED | `projects/factorflow-v2/decisions/DEC-0265.md`: `class: propagating`, `blocks: [CAP-002-E3-S4, CAP-002-E3-S5]`, with an amendment section citing v1 IR-003 and S5's T015 and T012 (10) |
| v1/IR-004 | RESOLVED | `DEC-0269` records the two-statement window as accepted (one of the three remedies v1 offered), shared with `stock_evidence`, and leaves closing both to the owner. `reader.py:729-740` unchanged, as T015 prescribes |
| v1/IR-005 | RESOLVED | `test_reader_volume.py:317` asserts every `factor_classification` access in the history plan carries an `Index Cond` naming `instrument_id`; `manual:rv-hist-index-defeated` killed in the run and in my spot rerun |

## Scope and Plan Deviations

- **Rework scope.** Since v1, only these changed:
  - `reader.py:820-829`;
  - three test files;
  - the task plan's `updated` and `last_reworked_review`;
  - the TDD evidence and its 8 `rework-1` files.
  
  Each traces to a v1 finding. No production line other than the IR-002
  wrapper changed, and no unjustified file, dependency or refactor exists.
- **DEC-0268.** v1 IR-002 is fixed in the reader, not in CAP-001's
  `runs.queries`, because the plan's file list and SA-DUP-001 forbid copying
  `decode_cursor`. The same type-confusion gap on `/api/runs` is a follow-up
  for the owner's CAP-001 lane. It is outside this story's change set.
- **DEC-0269.** v1 IR-004 is accepted rather than changed in code. It is a
  provisional agent decision, not yet owner reviewed.
- **Coder's environment.** The coder's rework-1 postgres evidence ran on the
  coder's server, 55432 (DEC-0264). Its pg_dump test ran under "an
  exec_run-capable copy" of review v1's plugin. This review's evidence uses
  neither: it uses its own plugin (`reviewer_localpg_v2.py`) and its own
  server (55436).
- **Carried from v1, unchanged:**
  - DEC-0265's empty `factors`;
  - the `_factor_summaries` extraction;
  - `bulk_seed_scored_stocks(..., score_shift=…)`;
  - the story's `status: in-review`.
- Bookkeeping: all 20 tasks are checked and all are implemented.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**:
  - Run doc sync for CAP-002-E3-S4 against this report.
  - IR-001 is non-blocking. Its test can go to a later rework of this story,
    or to the reverse-dependent CAP-002-E3-S5, at the owner's choice.
- **Warnings accepted downstream**: IR-001
- **Owner record of the two accepted conditions**: the owner should uphold
  DEC-0266 and DEC-0267 on the records, so that the acceptance this verdict
  rests on is durable:
  - `scripts/sdd decisions uphold DEC-0266 --project factorflow-v2 --after`
  - `scripts/sdd decisions uphold DEC-0267 --project factorflow-v2 --after`

  `--after` is required because both are unreviewed agent decisions the owner
  read before deciding. `docs/decision-records.md` records such a review as
  `review_mode: after`.
- **Environment for the next run**: the next review needs either a Docker
  daemon or the same substitution as DEC-0266. The IPv6 deploy-smoke failures
  recur on this machine (DEC-0267).
- **Commit trailers**: the commit carrying this report and its
  `-mutation.json` should end with `Decision-Id: DEC-0266` and
  `Decision-Id: DEC-0267`.
