---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S7-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-10-17T22:40:00Z
  source_artifacts:
    - id: CAP-002-E2-S7
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S7 — Whole-Build Proof: No Backdating and the 3000-Instrument Volume Test

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S7.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-tasks`
**Date**: 2026-10-17

## Summary

Proves the two promises the finished engine makes about a whole build, with tests only. First, the volume test `tests/integration/test_engine_volume.py` (`slow` and `postgres` markers): 3000 active instruments with 273 bars and 8 quarters each, built through the real registered stages (fundamentals, momentum, classification), must return `complete` inside 295 seconds of wall-clock time, writing 24,000 `factor_input` rows and 9,000 `factor_classification` rows (TC-COMP-091). Second, the no-backdating case appended to `tests/integration/test_engine_transaction.py`: after a set completes, a backfilled statement is inserted, every row of that set (set row, set-factor rows, inputs, classifications) is byte-for-byte unchanged, and the next set sees the statement with `known_on` equal to the date it was recorded (TC-COMP-162). A shared support module builds the populations with set-based SQL. There is no production code in this plan; the only source edits allowed are result-preserving tuning of the SQL files S3 to S6 own, and only if the volume test shows the budget missed (T009).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-11 | 3000 stocks up to date within 5 minutes of the run ending | T002, T003, T006, T007, T008, T009, T011 |
| AC-19 | Earlier-period data changes no recorded classification and never makes one appear known earlier | T002, T004, T005, T011 |
| DAC-E2-5 | 3000-instrument build within the AC-11 budget less one poll interval, proved by a `slow` test | T002, T003, T006, T007, T008, T009, T011 |
| DAC-E2-9 | Inputs selected as they existed when the build transaction ran; later fundamental or price alters no row | T002, T004, T005, T011 |
| DAC-E2-S7-1 | 3000 instruments: `build` completes within 295 s, 24,000 inputs, 9,000 classifications | T002, T003, T006, T007, T008, T009 |
| DAC-E2-S7-2 | Completed set, backfilled statement inserted afterwards: every row unchanged, next set sees it | T002, T004, T005 |

## Phase 1: Setup

**Purpose**: Confirm every prerequisite stage exists, learn the helper names, and build the shared populations.

- [ ] T001 Confirm CAP-002-E2-S3, S4, S5 and S6 have landed on the working branch, and that S2 (transitive) has: `src/factorflow/classification/engine.py` registers `_fundamental_inputs_stage`, `_momentum_inputs_stage` and `_classification_stage` in `_STAGES`, in that order with the classification stage last (DEC-0121); `sql/statements.sql`, `value_inputs.sql`, `growth_inputs.sql`, `momentum_inputs.sql`, `insert_inputs.sql`, `peer_sets.sql`, `classify.sql` exist; `classify.sql` and the two input files write `restated_possible` from `bool_or` (S6, not the constant `false`); `tests/integration/engine_support.py`, `engine_inputs_support.py` and `test_engine_transaction.py` exist. If any is absent STOP and report which hard dependency is not implemented. Then read, before writing anything: (1) the exact signatures of `migrate_through_classification`, `add_instrument`, `add_bar`, `add_run`, `add_building_set`, `count_classification_rows` (S2), `TEST_KEYS`, `install_test_line_items`, `add_statement`, `add_quarters`, `inputs_for` (S3), and the module-local fixture and imports at the top of `test_engine_transaction.py`; (2) `constants.py` for how the engine reads `MIN_PEER_SET_SIZE` (the plan uses the real value 30, never patches it); (3) the S3, S4 and S5 commit messages for the `EXPLAIN (ANALYZE, BUFFERS)` timings their plans (S3 T022, S4 T014, S5 T019) record as signals for this story; (4) the DDL of `instrument`, `daily_bar`, `fundamental_observation` and `corporate_action` in `0001_extensions_owner_state.sql` and `0002_observations.sql` (`value_hash` is a NOT NULL 32-byte `bytea`; `observed_on` is a `date`)
- [ ] T002 Create `tests/integration/engine_proof_support.py` (a plain module, not `conftest.py`; imports from `tests.integration.engine_support` and `engine_inputs_support` and edits neither). No pytest fixtures; every committing helper commits. Contents:
  - `volume_sessions(last_session: date, count: int = 273) -> list[date]`: all weekdays from the weekday on or before `last_session - 13 months - 7 days` through `last_session`, then drop evenly spaced interior weekdays (never the first or the last) until exactly `count` remain, standing in for market holidays; assert the oldest session is on or before `last_session - 1 month - 12 months` so the 12-month momentum window has its start bar. 273 consecutive weekdays would span only about 12.6 months and leave `return_12m` `missing`, which is why the generator exists.
  - `populate_volume(conn, n: int = 3000, *, last_session: date) -> tuple[list[int], date]`: set-based `INSERT ... SELECT ... generate_series` / `unnest` statements (the precedent is `tests/integration/test_coverage_volume.py`), never a Python loop per row, never string-interpolated values (pass dates, keys and counts as bound parameters). It inserts: `n` active instruments (`symbol` `V00001` and up); one `daily_bar` per instrument per session with `observed_on = session_date`, `value_hash = sha256(convert_to(instrument_id::text || session_date::text, 'UTF8'))` and a positive close that varies by instrument and by session (for example `20 + (id % 37) + ((id * 7 + ord * (id % 11 + 1)) % 29) / 10.0`) so no two stocks share a return; eight consecutive quarterly period ends for each of `balance_sheet`, `income_statement` and `cash_flow_statement` (newest period end the last quarter end on or before `last_session`, `fiscal_period` `Q1` to `Q4`, never `FY`), `observed_on` and `provider_filing_date` both equal to `last_session - 30 days` so nothing is backfilled, payloads keyed by `TEST_KEYS` (passed as parameters to `jsonb_build_object`) holding JSON **numbers** (not strings, see Notes), positive values that vary by stock and quarter, a positive prior-year base, positive shares and an outflow-negative `capital_expenditure` as S3's test line items expect; 3,000 cash dividends (`payload {"cash_amount": "0.25"}` as a JSON string, the stored form S4's DEC-0117 accepts, one per instrument at a session inside the momentum window) and 300 splits (every tenth instrument, `{"split_from": "1", "split_to": "2"}`, inside the window); then `ANALYZE` on `daily_bar`, `fundamental_observation`, `corporate_action` and `instrument` (DEC-0123). Returns the instrument ids and the classification date, which is `last_session`.
  - `populate_backdating(conn, *, classification_date: date) -> BackdatingPopulation`: 31 active instruments with distinct per-stock values and one bar on `classification_date` each (S2 `add_bar`), eight quarters of the three statement types for 30 of them and **seven** for the last (stock `A`: missing its oldest income-statement quarter, so its growth inputs are `missing`), all rows `observed_on = provider_filing_date = classification_date - 30 days`. Returns a dataclass with `instrument_ids`, `a_id`, `missing_period_end` (the quarter A lacks), `first_observed_on` and `other_id` (a stock used by the price case). The 30 others make the growth peer set exactly the floor of 30 in set 1 and 31 in set 2, so the real `MIN_PEER_SET_SIZE` is used.
  - `backfill_statement(conn, pop) -> date`: inserts A's missing oldest income-statement quarter with `observed_on = classification_date + 1 day`, `provider_filing_date = pop.first_observed_on - 60 days` (earlier than A's first fundamentals `observed_on`, so backfilled under DEC-0056) and positive revenue and diluted EPS; returns its `observed_on`.
  - `revise_close(conn, instrument_id, session_date, new_close, observed_on) -> None`: inserts a second `daily_bar` row for an existing session with a different `value_hash` and close.
  - `snapshot_set(conn, set_id) -> dict[str, list[tuple]]`: `SELECT *` of the `classification_set` row, and every row of `classification_set_factor`, `factor_input` and `factor_classification` for the set, each ordered by its primary key, all columns, for exact comparison.
  - `complete_and_open_next(conn, classification_date) -> UUID`: adds a terminal run and a `building` set (S2 `add_run`, `add_building_set`) and returns the set id. (depends on T001)

**Checkpoint**: Every hard prerequisite exists and the support module imports.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the tests that prove the whole build. They exercise behaviour S3 to S6 already implement, so they are characterisation tests: the RED evidence for each is a recorded falsification run (T013), not a missing production file.

Database tests are marked `@pytest.mark.postgres`; the volume test also `@pytest.mark.slow` (the marker is declared in `pyproject.toml`, which this plan does not edit). Each mapped test carries `# Implements TC-COMP-nnn`; each additional test cites its AC or DEC in its docstring. Neither test patches `engine._STAGES` or `constants.MIN_PEER_SET_SIZE`: the point is the real stages and the real floor. Both call `install_test_line_items(monkeypatch)` only, because the owner's payload keys remain unresolved.

### Mandatory Component Tests

- [ ] T003 Create `tests/integration/test_engine_volume.py` and implement TC-COMP-091 (3000 instruments build within 295 s with expected row counts), `@pytest.mark.slow` and `@pytest.mark.postgres`. Module-local fixture: migrate with `migrate_through_classification`, `populate_volume(conn, 3000, last_session=<fixed date>)` and one terminal run and `building` set whose `classification_date` is that last session. Constants at module top: `BUDGET_SECONDS = 295  # DAC-E2-5: AC-11's 300 s less one 5 s poll interval (DEC-0054)` and `TIMEOUT_SECONDS = 300.0  # scheduler default, DEC-0067`. The test installs the test line items, takes `time.perf_counter()` immediately before and after the one `engine.build(conn, set_id, TIMEOUT_SECONDS)` call (fixture load and `ANALYZE` excluded, because `statement_timeout` is per statement and cannot bound a whole build), and asserts: `result.state == "complete"` and `result.failure_reason is None`; elapsed `<= BUDGET_SECONDS`; `count_classification_rows` gives 24,000 `factor_input` rows (3000 x 8), 9,000 `factor_classification` rows (3000 x 3), 3 `classification_set_factor` rows; every factor is ranked with `qualified_counts == {"value": 3000, "growth": 3000, "momentum": 3000}`; all 9,000 classification rows are `classified` (so the heaviest path ran, not a fast path of `missing` rows); the set row is `complete` with `active_instruments = 3000`. Print the elapsed time (`-s` or `capsys`-independent: use `print`, as `test_runner_volume.py` records its diagnostic) so the coder can report it (DAC-E2-S7-1, DAC-E2-5, AC-11, DEC-0123) (depends on T002)
- [ ] T004 Implement TC-COMP-162 (Backfill after completion leaves the set unchanged) by appending one test to `tests/integration/test_engine_transaction.py` (S2's file; the story names it; no existing test or helper in the file is changed): `populate_backdating`, install test line items, build **set 1** with the real stages, assert `complete` and take `snapshot_set(set_1)`. Preconditions asserted: A's growth inputs are `missing` (`detail.periods_found` lists seven periods), A's `growth` classification is `not_classified` with `reason_code = 'input_missing'`, `growth` `qualified_count` is 30 and `ranked`. Then `backfill_statement`, assert the new row's `recorded_at` is later than set 1's `ended_at` (the insert really happened after completion). Assert `snapshot_set(set_1)` is identical to the first snapshot. Open run 2 and **set 2** (`classification_date` one day later, the backfill's `observed_on`), build it with the real stages, then assert: A's `growth` inputs in set 2 are `present`, `restated_possible` is true, `known_on` equals the backfill's `observed_on` and is not earlier than it nor equal to the filing date or the period end; A's `growth` classification in set 2 is `classified` with `restated_possible` true; `growth` `qualified_count` is 31; no `known_on` in set 1 is on or after the backfill's `observed_on`; and `snapshot_set(set_1)` is still identical to the first snapshot after set 2 completed (DAC-E2-S7-2, DAC-E2-9, AC-19, DEC-0124) (depends on T002)

### Additional Unit Tests

- [ ] T005 Add to `tests/integration/test_engine_transaction.py` (same file, not parallel with T004) the cases no mapped TC names: (a) price revision: build set 1 over the backdating population, `snapshot_set`, `revise_close` for `other_id`'s latest session (different close, later `observed_on`), assert set 1 is unchanged, build set 2 and assert `other_id`'s `book_to_price` value (market capitalisation uses the latest observed close) differs from set 1's while its `known_on` is the revision's `observed_on` (DAC-E2-9 names "a fundamental or price", AC-19); (b) control: a population where the same backfilled statement is inserted **before** set 1 is built yields A's growth inputs `present` in set 1, so the before/after comparison in T004 is shown able to fail and the `missing` precondition there is not an artefact of the fixture (AC-19) (depends on T004)
- [ ] T006 [P] Create `tests/integration/test_engine_volume_population.py` (`postgres`, not `slow`): `populate_volume(conn, 40, last_session=...)` then one real build with the test line items. Assert `volume_sessions` returns exactly 273 distinct weekdays, ascending, last equal to `last_session`, oldest on or before `last_session - 13 months`; the build is `complete`, `factor_input` holds 40 x 8 rows all `present`, `factor_classification` holds 40 x 3 rows all `classified`, and each instrument has the 273 bars, 24 statement rows and the dividend. This proves the 3000-row fixture is not degenerate (a population whose inputs are `missing` would pass the time budget by doing less work) at a cost of seconds, and runs in the normal suite (DAC-E2-S7-1, DEC-0123) (depends on T002)
- [ ] T007 [P] Create `tests/unit/test_engine_volume_static.py` (no database): parse `tests/integration/test_engine_volume.py` with `ast` and assert the volume test function is marked both `slow` and `postgres`, the literal `295` and `300.0` appear exactly once each as the named constants, the module calls `engine.build` exactly once, and it contains no assignment to `_STAGES` and no reference to `MIN_PEER_SET_SIZE` (a patched stage list or floor would defeat the proof). Include a negative case on an inline source string proving each rule can fail (DAC-E2-5) (depends on T003)

**Checkpoint**: All tests are written. The unit and population tests pass against the finished stages; the volume test and TC-COMP-162 are expected to pass on first run if S3 to S6 are correct, and a failure is a finding (T008, T009), not an expected RED.

---

## Phase 3: Core Implementation

**Purpose**: Run the proof and, only if it fails the budget, tune SQL. This story adds no production code.

- [ ] T008 Run `uv run pytest -m slow tests/integration/test_engine_volume.py -s` and record the elapsed time of the build and each statement's contribution if the stage files log it. If it passes within 295 s, no source file changes in this phase and T009 is skipped; say so in the commit message together with the elapsed time. If it fails on the row counts or a state other than `complete`, the cause is a defect in a stage that S3 to S6 delivered: STOP and report it with the failure reason instead of patching around it (depends on T003, T006)
- [ ] T009 Only when T008 shows the budget missed: profile with `EXPLAIN (ANALYZE, BUFFERS)` on the statement(s) the T008 breakdown and the S3 T022, S4 T014 and S5 T019 signals point at, then tune in the files the story names (`src/factorflow/classification/sql/statements.sql`, `value_inputs.sql`, `growth_inputs.sql`, `momentum_inputs.sql`, `insert_inputs.sql`, `peer_sets.sql`, `classify.sql`) by rewriting a query, reordering CTEs, materialising an intermediate result in a temporary table, or adding a temporary-table index. A tuning edit must keep every output row identical: the delivered tests of S3 to S6 (T010) pass unedited, and the statements stay parameterised and free of `||`, `{}` and `format()` (S2's safety test). Do not add a migration or an index on a permanent table (migration 0006 is pinned by research-store 2.4 and DEC-0087 forbids gaps; a new permanent index is a new migration, which is outside "tests only plus SQL tuning"). Do not raise the budget, drop work from the fixture, edit `_STAGES` or `engine.py`, or cap the population. If the budget is still missed after tuning, or the only remaining lever is a permanent index, STOP and report the measurements to the owner (depends on T008)
- [ ] T010 If T009 ran: re-run every delivered test of S3 to S6 unedited (`tests/integration/test_engine_inputs_fundamentals.py`, `test_engine_inputs_momentum.py`, `test_engine_currency.py`, `test_engine_peer_set.py`, `test_engine_restatement.py`, `tests/unit/test_composite_arithmetic.py`, `test_classify_sql_static.py`, `test_restatement_sql_static.py`, `test_engine_sql_safety.py`, `test_classification_sql_ships.py`) and then T003 and T004 again (depends on T009)

**Checkpoint**: The volume test passes within 295 s on the real stages, with no change to any file, or with result-preserving SQL tuning only.

---

## Phase 4: Integration

**Purpose**: Confirm the new tests fit the repository's gates.

- [ ] T011 Run every command in the Validation Plan from the repository root and fix failures in files this plan names; a failure in any other file is reported, not patched. Confirm `uv run pytest -m postgres` still passes with the volume test included (it carries both markers) and that the default `uv run pytest -m 'not postgres'` run stays fast: the volume population is built only inside the `slow` test's fixture, never at import (depends on T008, T010)

**Checkpoint**: The whole suite is green with the proof in place.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T012 Re-read traceability: `# Implements TC-COMP-091` above the volume test, `# Implements TC-COMP-162` above the appended test, each additional test cites its AC or DEC in its docstring; confirm `git diff --stat` touches only the files named in this plan: new `engine_proof_support.py`, `test_engine_volume.py`, `test_engine_volume_population.py`, `test_engine_volume_static.py`, the one appended region of `test_engine_transaction.py`, and, only if T009 ran, the named SQL files; nothing in `tests/conftest.py`, `pyproject.toml`, any other delivered test or helper from S2 to S6, `engine.py`, `constants.py` or a migration (depends on T011)
- [ ] T013 After each TDD cycle in T003-T011 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S7-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC). RED evidence for a cycle whose behaviour already exists is a falsification run recorded in the entry: for T003 temporarily set `BUDGET_SECONDS` to 1 and show the test fails; for T004 and T005 temporarily move `backfill_statement` ahead of the set-1 build and show the unchanged-set assertion fails; for T006 temporarily drop one quarter of the population and show an input turn `missing`; each perturbation is reverted before the diff is staged. Never skip a cycle (INV-TDD-005 needs a human's acknowledgement, which planning cannot give)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S3 | hard | Existing graph edge. The tests build through `_fundamental_inputs_stage` and import `TEST_KEYS`, `install_test_line_items`, `add_statement`, `add_quarters`, `inputs_for` from `engine_inputs_support.py` (T001, T002) |
| CAP-002-E2-S4 | hard | Existing graph edge. The volume build runs `_momentum_inputs_stage` over 273 bars per instrument (T003) |
| CAP-002-E2-S5 | hard | Existing graph edge. The tests build through `_classification_stage`, `peer_sets.sql` and `classify.sql` (T003, T004) |
| CAP-002-E2-S6 | hard | Existing graph edge. The rows written carry the restatement mark T004 asserts on A's growth rows |
| CAP-002-E2-S2 | hard | New graph edge added by this plan (`dependencies.yaml` entry for S7). S7 imports the `engine_support.py` helpers and appends one test to S2's `test_engine_transaction.py` (T001, T004); the file must exist, so the dependency is direct, not only transitive through S3 and S5 |
| CAP-002-E2-S1 | context | Transitive: the four classification tables and the append-only triggers the snapshots read |
| CAP-002-E1-S1 | context | Transitive through S1: the migration chain `migrate_through_classification` applies |
| CAP-002-E2-S8 | context | Creates the `building` set a build receives; these tests create sets through the S2 helper |
| CAP-002-E2-S9 | context | The scheduler calls `build` and supplies the 5 s poll interval (DEC-0054) the 295 s budget subtracts; this story imports no scheduler code and takes the number from DAC-E2-5 |

### Task Dependencies

- T001: No dependencies
- T002: Depends on T001
- T003: Depends on T002; different file from T004, T006, T007
- T004 -> T005: sequential, same file `tests/integration/test_engine_transaction.py`; T004 depends on T002
- T006: Depends on T002 only (different file)
- T007: Depends on T003 (parses its source)
- T008: Depends on T003 and T006
- T009: Depends on T008 and runs only if the budget is missed
- T010: Depends on T009 (skipped when T009 is)
- T011: Depends on T008 and T010
- T012: Depends on T011
- T013: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- Phase 2: T003, the T004-T005 chain, T006 and T007 touch different files and can run in parallel once T002 exists
- Phase 3 and later are sequential; the volume run (minutes) should not share a container run with other slow tests

---

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest -m slow`, `uv run pytest -m postgres`, `uv run pytest -m 'not postgres'` (also `uv run pytest` for the full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- DAC-E2-S7-1 / DAC-E2-5 / AC-11: the build of 3000 instruments is `complete`, took at most 295 s of wall-clock time, wrote 24,000 inputs and 9,000 classified rows (T003, T006, T008)
- DAC-E2-S7-2 / DAC-E2-9 / AC-19: all four tables of a completed set are identical after a backfilled statement, after a revised price and after a second set completes; the second set shows the statement with the right `known_on` and mark (T004, T005)

---

## Notes

### Resolved Conflicts

- **The register, S2, S3 and S6 plans cite DEC-0064 for "delivered test files are not edited".** DEC-0064 (and DEC-0084, DEC-0110) concern files of the delivered CAP-001 code (composition roots, four navigation tests, migration-inventory tests); none of them forbids one CAP-002 story from adding a case to a file another CAP-002 story creates. The story and factor-engine section 2.1 both place the no-backdating case in `tests/integration/test_engine_transaction.py`. Governing rule: the story Description and the design agree, and no decision contradicts them, so T004 appends one test there without changing any existing line. The other plans' "new modules only" is stricter than required and is not wrong for them. Established by: story S7 Description, factor-engine 2.1 and 7, DEC-0064/0084/0110 scope. No design change needed.
- **Factor-engine 7 describes the volume budget as "within the budget less the poll interval" and "asserts the build, not the budget"; DAC-E2-S7-1 and TC-COMP-091 say 295 seconds.** Both read together without contradiction: 295 = 300 less one 5 s poll (DEC-0054), and the test asserts the build alone. Established by DAC-E2-5, TC-COMP-091, factor-engine 5. No design change needed.
- **Story status not changed.** The skill asks for `status` to move from `todo` to `planning`; the story is approved and any edit invalidates the approval, so the frontmatter is left as it is (constraint 7), as in the S2 to S6 plans.

### Open Gaps

- **Volume test shape. PROVISIONAL — awaiting owner confirmation (2026-10-17).** No artifact fixes the corporate-action volume, which clock the 295 seconds covers, the timeout handed to `build`, or the mix of input statuses. Derivation: design section 5 sizes the load (a few thousand corporate actions) and says the test asserts the build; `statement_timeout` is per statement, so only wall-clock time bounds the whole build; all-present inputs are the heaviest path; `ANALYZE` reproduces production planner statistics. Chosen: 3,000 dividends and 300 splits, `ANALYZE` after load, `timeout_seconds=300`, clock around the `build` call only, all eight inputs present. Recorded as DEC-0123 (`projects/factorflow-v2/decisions/DEC-0123.md`). Owning design: factor-engine section 7, at its next revision, to say what the volume population is.
- **No-backdating assertion shape. PROVISIONAL — awaiting owner confirmation (2026-10-17).** AC-19's second clause ("appear to have been known before the date it was produced") and "every row of that set" have no stated measure. Derivation: compare all four tables of the set column by column; make the backfilled statement fill a missing quarter so the next set visibly differs; assert `known_on` equals the statement's `observed_on`. Recorded as DEC-0124 (`projects/factorflow-v2/decisions/DEC-0124.md`). Owning design: factor-engine section 7 row "Later data changes nothing", at its next revision.
- **Payload value form: JSON numbers versus strings.** S3's DEC-0116 (4) counts a line-item payload value that is not a JSON number as absent, while S4 reports that ingestion serialises Decimal fields as JSON strings, so real statements may read as `missing` (flagged in the S4 plan, unverified). This plan writes JSON numbers, which is what S3's stage accepts, so the volume test proves the timing of the numeric path. If the S3 coder finds real payloads are strings and widens the rule, the fixture still passes; if it narrows nothing, nothing changes here. The real-data question stays the owner's (system design section 8 question 1).
- **A permanent index is not available to this story.** If tuning shows a missing permanent index is the only way under 295 s, the story's "tests only, plus SQL tuning" does not cover a migration and DEC-0087 keeps 0006 as the only classification migration. T009 stops and reports instead of adding one. No artifact fixes what the owner would then choose, so no value is invented.
- **Payload keys for the seven line items remain the owner's question** (system design section 8 question 1, factor-engine section 14 question 1). The tests install S3's test keys and never read the real mapping.

### Other Notes

- Stories CAP-002-E1-S1, CAP-002-E2-S1, CAP-002-E2-S8 and CAP-002-E2-S9 are classified in the table above as context. One hard edge was added: `dependencies.yaml` now lists `CAP-002-E2-S7: [CAP-002-E2-S2, CAP-002-E2-S3, CAP-002-E2-S4, CAP-002-E2-S5, CAP-002-E2-S6]` (S2 was reachable only transitively). No cycle: S2 depends only on S1.
- The register's "Corrections" are consistent with this plan: S5 reads committed `factor_input` rows (DEC-0119), so the volume build writes 24,000 rows and reads them back; `_STAGES` order is DEC-0121's; `daily_bar_latest` is a CTE inside `momentum_inputs.sql`.
- The volume test is slow by design (it loads about 820 thousand bars and 72 thousand statement rows). Its elapsed time depends on the container's resources; the number printed by T003 is the evidence S3 T022, S4 T014 and S5 T019 asked for.
- Under a driver that commits once per stage, the TDD-evidence file records `commit_hash: stage` (T013).
