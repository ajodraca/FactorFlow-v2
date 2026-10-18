---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S6-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-18
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-10-18T00:20:00Z
  source_artifacts:
    - id: CAP-002-E2-S6
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S6 — Possibly-Restated Mark for Value and Growth Classifications

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S6.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-tasks`
**Date**: 2026-10-17

## Summary

Turns the backfill flag into the stored mark. Two SQL edits and one new test module do the work; no Python source changes. First, `value_inputs.sql` and `growth_inputs.sql` (CAP-002-E2-S3) stop writing the constant `false` and write `restated_possible = bool_or(backfilled)` over exactly the statement rows that populate each input's `detail` (DEC-0056: `provider_filing_date` earlier than the instrument's first fundamentals `observed_on`, a flag `statements.sql` already computes). Second, `classify.sql` (CAP-002-E2-S5) stops writing the constant `false` and writes, for value and growth, `bool_or(factor_input.restated_possible)` over the stock's committed `factor_input` rows of the build's own set (DEC-0119) on every active-stock row of the factor; momentum and retired rows are always `false`. The mark is written once with the row and never updated (append-only, C5), so an earlier set is untouched by a later build. Three mapped test cases (TC-COMP-186, 187, 188) are implemented in `tests/integration/test_engine_restatement.py`, with a support module, extra cases and a no-database static test.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-23 | Value or growth classification marked when any fundamental behind it was backfilled; mark retained in history | T004, T005, T006, T007, T008, T009, T010, T011, T013 |
| DAC-E2-11 | Classification built on a statement filed before the first fundamentals `observed_on` carries `restated_possible`, appended with it, never on momentum | T004, T005, T007, T008, T009, T010, T011, T013 |
| DAC-E2-S6-1 | Pre-first-observation statement: its inputs and the value and growth classifications carry the mark | T004, T007, T009, T010, T011, T013 |
| DAC-E2-S6-2 | A momentum classification for the same stock is never marked | T005, T008, T011, T013 |
| DAC-E2-S6-3 | A marked classification in a completed set is unchanged when a later set is built | T006, T013 |

## Phase 1: Setup

**Purpose**: Confirm both hard prerequisites exist, learn exactly what they write today, and fix the shared test helpers.

- [ ] T001 Confirm CAP-002-E2-S3 and CAP-002-E2-S5 have landed on the working branch. From S3: `src/factorflow/classification/engine.py` defines `_fundamental_inputs_stage` and registers it in `_STAGES`; `sql/statements.sql`, `sql/value_inputs.sql`, `sql/growth_inputs.sql`, `sql/insert_inputs.sql` exist; `tests/integration/engine_inputs_support.py` exports `install_test_line_items`, `add_statement`, `inputs_for`. From S5: `engine._classification_stage` is registered, `sql/peer_sets.sql` and `sql/classify.sql` exist, `tests/integration/engine_classify_support.py` exists. If any is absent, STOP and report which hard dependency is not implemented. Then read, before editing anything: (1) how `value_inputs.sql` and `growth_inputs.sql` write `restated_possible` today (a constant `false` with a comment citing S6) and which CTE or columns feed each input's `detail` periods, including the `backfilled` flag; (2) how `classify.sql` writes `restated_possible` in each of its four row sets (classified, input-reason `not_classified`, `not_enough_stocks`, `retired`); (3) the `%(name)s` placeholder names that `value_inputs.sql`, `growth_inputs.sql` and `classify.sql` each already use, recorded as one set per file (T008 hard-codes these three sets). Then `grep -rn "restated_possible" tests/` and list every delivered assertion on it. None is expected to conflict with the mark. CAP-002-E2-S3 T004 asserts `restated_possible = false` only on a fixture with no backfilled row (its `provider_filing_date` defaults to null). CAP-002-E2-S5 T010(g) asserts it only on classifications built from `factor_input` rows left at the column's default `false`. CAP-002-E2-S3 T012(k) asserts only the `backfilled` flag in `detail`, not the column. If a delivered test nevertheless asserts `restated_possible` is false against a fixture that contains a statement with `provider_filing_date` earlier than the instrument's first `observed_on`, STOP and report the test: it departs from its own story's plan and editing it is outside this plan's file list (T015), so the conflict is the owner's. A fixture whose `provider_filing_date` is null or equal to the first `observed_on` is unaffected (DEC-0056 is a strict "earlier than")
- [ ] T002 Create `tests/integration/engine_restatement_support.py` (a plain module, not `conftest.py`; imports from `tests.integration.engine_support`, `engine_inputs_support` and `engine_classify_support` and edits none of them: a plan choice that keeps S6's diff to its own files (T015); they are the modules of CAP-002-E2-S2, CAP-002-E2-S3 and CAP-002-E2-S5, and this story keeps its own helpers in this new module instead of extending them; DEC-0064 governs only edits to files delivered by CAP-001): `MIN_FLOOR = 3`; `run_two_stage_build(conn, set_id, monkeypatch)` that sets `monkeypatch.setattr(constants, "MIN_PEER_SET_SIZE", MIN_FLOOR)` (so hand-built peer sets stay small; the 30-stock floor is S5's test), calls `install_test_line_items(monkeypatch)`, sets `engine._STAGES = [engine._fundamental_inputs_stage, engine._classification_stage]` and calls `engine.build(conn, set_id, 60)`, so neither the momentum stage nor any later story's stage runs; `add_fundamentals(conn, instrument_id, *, latest_period_end, first_observed_on, filed_before_first: set[tuple[str, int]] = frozenset(), quarters=8, extra_old_quarter_backfilled=False)` writing every row with the S3 `add_statement` helper, one call per `(statement_type, period end)`, with `observed_on` and `provider_filing_date` always passed explicitly. It never relies on `add_statement`'s `None` defaults and does not use the S3 `add_quarters` helper, whose signature `add_quarters(conn, instrument_id, latest_period_end, n, values, *, numbers=False)` takes neither date. It writes `quarters` consecutive quarterly period ends, 3 calendar months apart and newest first, where `quarter_index` 0 is `latest_period_end`, of balance sheet, income statement and cash flow statement (income and cash flow for the TTM and prior-year windows, balance sheet for at least the newest quarter), with distinct per-stock values so no two inputs are perfectly correlated. Every row has `observed_on = first_observed_on` and `provider_filing_date = first_observed_on` (equal, so not backfilled under the strict rule), with two exceptions. Each `(statement_type, quarter_index)` listed in `filed_before_first` gets `provider_filing_date = first_observed_on - 30 days` (backfilled). `extra_old_quarter_backfilled=True` adds a ninth, older income-statement quarter (`quarter_index` 8, 24 months before `latest_period_end`, outside both windows; used only with the default `quarters=8`) with `observed_on = first_observed_on` and `provider_filing_date = first_observed_on - 30 days`, while the other rows are not backfilled. Each period of each statement type is written once, so the stock's first `observed_on` is exactly `first_observed_on`. Callers pass a `latest_period_end` on or before the set's classification date and within the 6-month stale bound of it, so the inputs are `present`. Any statement row a test writes outside `add_fundamentals` (T006's fresh quarter, and the one-day-earlier and null filing dates of T007 (c) and (e)) also goes through `add_statement` with both dates passed explicitly (`provider_filing_date=None` only where the case asks for a null filing date) and with `observed_on` no earlier than that stock's `first_observed_on`. That way the first `observed_on` against which `statements.sql` computes `backfilled` (S3 T015, DEC-0056) is the one the case intends; `add_bar_for(conn, instrument_id, session_date)` using the S2 `add_bar` helper so every active stock has a bar on the latest trading day and market capitalisation is defined; `add_momentum_inputs(conn, set_id, instrument_id, restated=False)` writing three `present` `factor_input` rows for `momentum` with the S5 `add_factor_inputs` helper's shape but setting `restated_possible` as given (own INSERT, same columns); `input_flags(conn, set_id, instrument_id) -> dict[str, bool]` and `classification_flags(conn, set_id) -> dict[(instrument_id, factor), bool]`; `snapshot(conn, set_id) -> list[tuple]` returning every `factor_classification` row of the set ordered by primary key with all columns, for byte-for-byte comparison. Every committing helper commits; no pytest fixtures (depends on T001)

**Checkpoint**: Both prerequisites exist, no delivered test conflicts with the mark, and the helpers import.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the expected behaviour from the acceptance criteria and mapped test cases.

Database tests are marked `@pytest.mark.postgres`, carry `# Implements TC-COMP-nnn` above each mapped test and cite their AC or DEC in the docstring of each additional one. The module declares its own small fixture that migrates, creates a terminal run and a `building` set. A standard fixture population is four active stocks A to D: A's statements are all backfilled (every row's `provider_filing_date` is earlier than A's first `observed_on`), B, C and D are observed as filed (`provider_filing_date` equals `observed_on`, none backfilled). Four stocks and a floor of 3 give a ranked peer set on value and growth. New test modules only, and no S2, S3 or S5 test or helper is edited. This is a plan choice, since none needs to change (T001); DEC-0064 (as extended by DEC-0084) governs only edits to files delivered by CAP-001 and is not the reason.

### Mandatory Component Tests

- [ ] T003 Create `tests/integration/test_engine_restatement.py` with the module-local fixture and a `build_fixture(...)` helper that creates stocks A to D with T002's helpers (depends on T002)
- [ ] T004 Implement TC-COMP-186 (pre-first-observation statement marks inputs and value and growth classifications) in `tests/integration/test_engine_restatement.py`: run `run_two_stage_build` over the standard population. Assert A's five `factor_input` rows (`book_to_price`, `earnings_yield`, `fcf_yield`, `revenue_growth`, `eps_growth`) all have `restated_possible = true`; A's `value` and `growth` `factor_classification` rows are `classified` with `restated_possible = true`; for B, C and D every input row and both classification rows are `false`; for each of A's inputs the column equals the `or` of the `backfilled` flags in `detail` (the column and the detail agree). A's `momentum` row is `not_classified` (no momentum inputs exist in this build) and `false` (DAC-E2-S6-1, DAC-E2-11, AC-23) (depends on T003)
- [ ] T005 Implement TC-COMP-187 (momentum classification never marked) in `tests/integration/test_engine_restatement.py` (same file, not parallel): run only the classification stage (`engine._STAGES = [engine._classification_stage]`, floor patched to 3) over four stocks whose value, growth and momentum `factor_input` rows are all inserted directly and `present`, A's value and growth rows with `restated_possible = true` and A's momentum rows deliberately also `restated_possible = true` (a state no S4 build produces, so the test proves the guard lives in `classify.sql` and not in an upstream coincidence). Assert A's `value` and `growth` classifications are `classified` and `true`; A's `momentum` classification is `classified`, has a score and a percentile, and is `false`; B, C and D are `false` on all three factors (DAC-E2-S6-2, DAC-E2-11, AC-23) (depends on T004)
- [ ] T006 Implement TC-COMP-188 (earlier row's mark unchanged by a later set) in `tests/integration/test_engine_restatement.py` (same file, not parallel): build set 1 over the standard population and confirm A's value and growth rows are marked; take `snapshot(conn, set_1)` and the set-1 `factor_input` rows; finish set 1's run, add a new run and a new `building` set, add a fresh quarter for every stock (A's new quarter filed after A's first observation, so not backfilled), build set 2. Assert `snapshot(conn, set_1)` and the set-1 input rows are identical to before (every column, including `restated_possible`), that set 2 holds its own rows for the same `(instrument, factor)` keys, and that A's set-1 mark is still `true` while set 2's mark is whatever set 2's own inputs give (not compared to set 1's). Do not write a test that expects the database to reject an `UPDATE`: migration `0006` has no trigger (research-store 2.4, copied verbatim by CAP-002-E2-S1 T015), and TC-COMP-188 asks only that the earlier row's mark is unchanged, which the snapshot comparison above proves. Append-only is enforced by never writing an `UPDATE` or `DELETE` of `factor_input` or `factor_classification` (research-store 2.5 item 1) and by the static guard `tests/unit/test_research_sql_is_append_only.py` (created by CAP-002-E1-S1 T003, extended to these tables by CAP-002-E2-S1 T012), which this story's SQL edits must keep passing (DAC-E2-S6-3, AC-23) (depends on T005)

### Additional Unit Tests

- [ ] T007 Add to `tests/integration/test_engine_restatement.py` (same file, not parallel) the cases no mapped TC names: (a) only rows an input uses count: a stock with a ninth, older income-statement quarter outside both TTM windows that is backfilled, every other row not backfilled, has `restated_possible = false` on all its inputs and classifications, while the same quarter inside a window marks the inputs that read it; (b) any-row rule and per-input scope: only A's newest cash-flow quarter is backfilled (all other rows `provider_filing_date == observed_on`): `fcf_yield` is `true` and `book_to_price` and `earnings_yield` are `false` provided they read no cash-flow row, `value` classification is `true`, and `growth` classification and both growth inputs are `false`; (c) boundary: `provider_filing_date` equal to the stock's first `observed_on` is not backfilled, one day earlier is; a null `provider_filing_date` is not backfilled (DEC-0056); (d) not-classified rows carry the same mark (DEC-0122): A with `fcf_yield` `missing` and its other value inputs backfilled has `value` `not_classified` with `input_missing` and `restated_possible = true`; with the floor patched to 5 and four stocks the unranked `value` rows (`not_enough_stocks`) of the stocks whose inputs were backfilled carry the mark and the others do not; a retired instrument's three rows are `false`; (e) the mark changes no score: build the same population twice, once with A's rows backfilled and once with `provider_filing_date` null, and assert every `status`, `score`, `percentile`, `reason_code`, `reason_input` and `reason_detail` is identical across the two sets; (f) a momentum `factor_input` row alone never marks, with every value and growth row `false`, all of A's classifications are `false` (AC-23, DAC-E2-11, DEC-0056, DEC-0122) (depends on T006)
- [ ] T008 [P] Create `tests/unit/test_restatement_sql_static.py` (no database): `classify.sql` reads `restated_possible` from `factor_input` and uses `bool_or`; the only factor literals in its restatement guard are `'value'` and `'growth'` and both are members of `constants.FACTORS`, `'momentum'` appears nowhere in the file as a restated condition; `value_inputs.sql` and `growth_inputs.sql` use `bool_or` over a `backfilled` column and none of the three files still writes a constant `false` for `restated_possible` outside the `retired` row set; no new `%(name)s` parameter is introduced: every `%(name)s` placeholder in each of `value_inputs.sql`, `growth_inputs.sql` and `classify.sql` is in the set recorded for that file at T001, hard-coded in the test as one literal set per file (S3 delivers no placeholder allow-list for its two files; the allow-list for `classify.sql` stays S5's `tests/unit/test_classify_sql_static.py`, run unedited at T013) (AC-23, DAC-E2-S6-2, DEC-0119) (depends on T001)

**Checkpoint**: All tests are written and fail (the SQL still writes the constant `false`).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass by editing three SQL files. Each edit replaces only the `restated_possible` expression (plus the CTE or join it needs); no other column, row set or parameter changes. Statements stay parameterised, never interpolated, and avoid `||`, `{}` and `format()` (the S2 safety test scans every `classification/sql/*.sql`).

- [ ] T009 [P] Edit `src/factorflow/classification/sql/value_inputs.sql` (S3's file; the story wires the mark, so S6 owns this change): replace the constant `false` in the `restated_possible` column of the `book_to_price`, `earnings_yield` and `fcf_yield` rows with `bool_or(backfilled)` over the same statement rows that build that input's `detail` periods, so the column and the detail cannot disagree; the rows are those the input reads, including the newest balance sheet that supplies `shares_outstanding` for market capitalisation. A status of `missing` with no rows read gives `false`. Replace the S6 comment with one citing AC-23, DAC-E2-11 and DEC-0056 (depends on T001)
- [ ] T010 [P] Edit `src/factorflow/classification/sql/growth_inputs.sql` (S3's file): same replacement for `revenue_growth` and `eps_growth` over the eight income-statement rows of the TTM and prior-year windows (depends on T001)
- [ ] T011 Edit `src/factorflow/classification/sql/classify.sql` (S5's file): add a CTE `marks` that returns, per `instrument_id`, `bool_or(restated_possible)` over `factor_input` rows with `set_id = %(set_id)s`, `factor = %(factor)s` and `instrument_id = ANY(%(active_ids)s::bigint[])`; in each of the three active-stock row sets (classified; `not_classified` with an input reason; `not_classified` with `not_enough_stocks`) replace the constant with `COALESCE(marks.restated, false) AND %(factor)s IN ('value', 'growth')`, using a `LEFT JOIN marks` so a stock with no input rows gets `false`; leave the `retired` row set at the constant `false` (no input exists for it). Comment citing AC-23, DAC-E2-11, DEC-0119 and DEC-0122 and noting that the factor guard is what makes momentum "never marked" independent of the input rows. No new placeholder; no `inputs` temporary table, no universe table (depends on T001)
- [ ] T012 Confirm `src/factorflow/classification/engine.py`, `constants.py` and `line_items.py` need no edit: both stages already pass every parameter the three statements use. If T001 shows otherwise, add only what is missing and say so in the commit message (depends on T009, T010, T011)
- [ ] T013 Make the tests pass by running them in file order, fixing only the files named in T009 to T012. Then run the S3 and S5 delivered tests unedited (`tests/integration/test_engine_inputs_fundamentals.py`, `tests/integration/test_engine_peer_set.py`, `tests/unit/test_composite_arithmetic.py`, `tests/unit/test_classify_sql_static.py`) to confirm none regresses (depends on T009, T010, T011, T012)

**Checkpoint**: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` pass; A's value and growth inputs and classifications are marked, momentum and retired rows never, and the S3 and S5 tests are unchanged and green.

---

## Phase 4: Integration

**Purpose**: Confirm the edits fit the repository's gates.

- [ ] T014 Run every command in the Validation Plan from the repository root and fix failures in files this plan names; a failure in any other file is reported, not patched. Confirm the S2 safety test (`tests/unit/test_engine_sql_safety.py`) and ship test (`tests/unit/test_classification_sql_ships.py`) still pass over the edited `.sql` files without edits to them (depends on T013)

**Checkpoint**: The whole suite is green with the mark in place.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T015 Re-read traceability: each of the three mapped tests carries `# Implements TC-COMP-nnn`, each additional test cites its AC or DEC in its docstring; confirm `git diff --stat` touches only `value_inputs.sql`, `growth_inputs.sql`, `classify.sql` and the new files named in this plan, with nothing in `tests/conftest.py`, any delivered test or helper from S2, S3 or S5, `pyproject.toml`, `engine.py` or `constants.py` (depends on T014)
- [ ] T016 After each TDD cycle in T003-T014 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S6-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S3 | hard | Existing graph edge. T009 and T010 edit `value_inputs.sql` and `growth_inputs.sql`, and the tests call `_fundamental_inputs_stage`, `statements.sql`'s `backfilled` column and the `engine_inputs_support.py` helpers (T001, T002) |
| CAP-002-E2-S5 | hard | Existing graph edge. T011 edits `classify.sql`; the tests call `_classification_stage` and the `engine_classify_support.py` helpers (T001, T002) |
| CAP-002-E2-S2 | context | Transitive through S3 and S5: `engine.build`, `_STAGES`, `engine_support.py`, `constants.py`. The plan imports no S2 file the S3 or S5 helpers do not already wrap, except `add_bar` and the set helpers named in T002 |
| CAP-002-E2-S1 | context | Transitive: the `factor_input` and `factor_classification` tables of migration `0006` (which has no trigger) and the append-only static guard `tests/unit/test_research_sql_is_append_only.py` that CAP-002-E2-S1 T012 extends to them (T006) |
| CAP-002-E1-S1 | context | Transitive through S1: the migration chain the fixture applies; no code is imported |
| CAP-002-E2-S4 | soft | Writes the momentum `factor_input` rows with `restated_possible = false`. These tests insert momentum rows directly (T005, T007f), so they need no S4 code, and the plan registers no stage |
| CAP-002-E2-S7 | reverse | The volume test builds through the finished SQL; S7 may tune these three files (S7 Implementation) |
| CAP-002-E2-S8 | context | Creates the `building` set a build receives; these tests create sets through the S2 helper |
| CAP-002-E2-S9 | context | Calls `build`; this story adds no scheduler code |

### Task Dependencies

- T001: No dependencies
- T002: Depends on T001
- T003: Depends on T002; T004 -> T005 -> T006 -> T007 are sequential, same file `test_engine_restatement.py`
- T008: Depends on T001 only (no database), different file
- T009, T010, T011: Depend on T001; three different files, independent
- T012: Depends on T009, T010, T011
- T013: Depends on T009, T010, T011, T012
- T014: Depends on T013
- T015: Depends on T014
- T016: Interleaved, after every TDD cycle and before the next cycle begins

### Parallel Opportunities

- Phase 2: the restatement chain (T003-T007) and T008 touch different files
- Phase 3: T009, T010 and T011 edit different files and can run in parallel; T009 and T010 are one cycle with T011 only if the test of that cycle needs both (the end-to-end tests T004, T006 do)

---

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (also `uv run pytest` for the full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- DAC-E2-S6-1 / DAC-E2-11: a backfilled stock's five inputs and its value and growth classifications are marked; the other stocks are not; the column agrees with `detail` (T004, T007)
- DAC-E2-S6-2: a momentum classification is `false` even when its input rows say `true` (T005, T008)
- DAC-E2-S6-3: a later set leaves every column of an earlier set unchanged (T006)
- AC-23: any-row rule, used-rows-only rule, boundary and null filing date, not-classified rows, mark does not change scores (T007)

---

## Notes

### Resolved Conflicts

- **Design 2.4 puts `restated_possible` on `inputs` and 2.5 reads it from `inputs`; the S3 and S5 plans write a constant `false`.** Design 2.5's snippet joins `inputs`. DEC-0119 settled that classification reads `factor_input`, and DEC-0121 and the S3 plan settled that S3 and S5 write the constant `false` until this story. Governing rule: story ACs and its Description outrank the design snippet ("wires the backfill flag from `statements.sql` through `factor_input` into `factor_classification.restated_possible`"). Result: S6 replaces the constant in the three SQL files and the classification reads the committed `factor_input` column. Established by: S6 Description, DEC-0119, DEC-0121, S3 plan Resolved Conflicts.
- **The story names only `tests/integration/test_engine_restatement.py`.** The plan adds a support module and a static unit test as well. Governing rule: the story's Implementation line lists the primary test, not the only file, and no story, design or decision forbids additional test modules, so the support module and the static unit test are added beside it as new files. DEC-0064 does not govern this: it assigns the edits to files delivered by CAP-001 (composition roots, migrations 0005 and 0006) and says nothing about CAP-002 test modules; no delivered CAP-001 test file is edited either (DEC-0064 as extended by DEC-0084).
- **Design 2.5 `bool_or(i.restated_possible)` is shown only for classified rows.** The prose applies it to `not_classified` input-reason rows too. See Open Gaps for the unranked rows.
- **Story status not changed.** The skill asks for `status` to move from `todo` to `planning`; the story is approved and any edit invalidates the approval, so the frontmatter is left as it is (constraint 7), as in the CAP-002-E2-S2 to S5 plans.

### Open Gaps

- **Which statement rows an input "uses", and which classification rows carry the mark. PROVISIONAL — awaiting owner confirmation (2026-10-17).** DEC-0056 says the mark applies to "inputs derived from a backfilled observation" and to a classification "whose inputs use at least one backfilled row", but names neither which statements a given input uses nor whether `not_classified` rows carry it. Derivation: design 2.4 says an input is marked "when any statement row used is `backfilled`", and `detail` already lists each period used with its `backfilled` flag, so the rows used are exactly the rows in `detail`, including the newest balance sheet that supplies `shares_outstanding`; design 2.5 says a `not_classified` row's `restated_possible` is `bool_or` over the factor's inputs, and the same rule applied to an unranked factor's rows (design silent) keeps one rule for every active-stock row of a value or growth factor; a retired row has no inputs and is `false`. Momentum is `false` by the AC and DAC-E2-11, enforced in `classify.sql` and not left to S4's rows. Recorded as DEC-0122. Owning design: factor-engine 2.4 and 2.5, at its next revision, to say whether unranked rows carry the mark.
- **Used-rows rule for a ninth, older quarter.** Because `statements.sql` computes `backfilled` against the minimum `observed_on` over all the instrument's rows (S3 T015), an unused old quarter can lower that minimum. T007 (a) pins that an unused backfilled row does not mark; it does not decide whether an unused row should. This follows design 2.4 ("any statement row used"), so it is not a new decision.
- **Payload keys for the seven line items remain the owner's question** (system design section 8 question 1, factor-engine section 14 question 1). It blocks S3's real values, not this story: the tests install S3's test keys (T002) and never read the real mapping.
- **Owner-directed fix (cross-plan review 2026-10-18, E2-F03): no S3 or S5 test asserts the `restated_possible` column on a backfilled fixture, so S6 edits none of their tests, and DEC-0064 is no longer cited for "delivered test files are not edited"** — CAP-002-E2-S3 T012(k) now asserts only the `backfilled` flag in `detail` (true for a statement filed before the first fundamentals `observed_on`, false otherwise) and no longer pins `restated_possible = false` on that fixture. S3 T004 and S5 T010(g) assert `false` only where no row is backfilled or marked, which T009 to T011 leave `false`. So T001's STOP guards only against an unplanned assertion of that kind, and T013's unedited re-run of the S3 and S5 tests is expected to pass. Derivation: S3's ACs contain no restatement criterion and its constant `false` is the placeholder this story replaces (DAC-E2-S6-1, DEC-0122). The column on a backfilled fixture is asserted here (T004, T007). DEC-0064 (as extended by DEC-0084 and DEC-0110) names only edits to files delivered by CAP-001, so keeping S6's tests in new modules is this plan's own scope choice (T015), stated as such in T001, T002, the Phase 2 intro and Resolved Conflicts.
- Owner-directed fix (cross-plan review 2026-10-18, E2-F15): `classify.sql` arrives from CAP-002-E2-S5 with the bound placeholder `input_labels`, the product-vocabulary label of each input taken from `constants.INPUT_LABELS`, among the parameters T001 item (3) records. T001 item (3) therefore records it among `classify.sql`'s placeholders, so T008's hard-coded set for that file includes it; S5's `tests/unit/test_classify_sql_static.py` allows it (S5 T011). Derivation: S5 T011, T015 and T016 adopt that parameter so that `reason_detail` is built from the input label (factor-engine section 2.5, reader design 2.6, DEC-0120 as amended; section 10 requires product vocabulary). T011 here adds no placeholder and leaves the `reason_detail` expressions unchanged.
- Owner-directed fix (cross-plan review 2026-10-18, E2-F18): T002 no longer cites DEC-0064 for leaving the `engine_support.py`, `engine_inputs_support.py` and `engine_classify_support.py` helper modules unchanged, and the Resolved Conflicts bullet on the extra test files no longer names DEC-0064 as its governing rule. Leaving the sibling helper modules unchanged is now a plan choice. Derivation: DEC-0064 assigns one owner to each edit of a delivered CAP-001 file (`app.py`, `shell.tsx`, `routes.tsx`, `client.ts`, migrations 0005 and 0006). DEC-0084 adds named delivered test files to that list. Neither says anything about a module one CAP-002 story creates for another. The three helper modules are created by CAP-002-E2-S2, CAP-002-E2-S3 and CAP-002-E2-S5. File placement is unchanged.
- **Owner-directed fix (cross-plan review 2026-10-18, E2-F19): T008's no-new-parameter check compares each of `value_inputs.sql`, `growth_inputs.sql` and `classify.sql` with the `%(name)s` placeholder names that file already used when T001 read it, hard-coded as one set per file and checked as a subset, instead of with "the set the S3 and S5 static tests allow"** — S3 delivers no placeholder allow-list (S3 plan Other Notes: "this plan adds no safety test of its own"; S3 T011 tests only `engine._line_item_parameters()`), S3 T016 leaves the bound names of the seven line-item keys and signs to its coder, and S2's `tests/unit/test_engine_sql_safety.py` checks only the `%(name)s` form, so S3's delivered SQL is the only source that names its parameters. A subset check is exactly "no new parameter", and it leaves CAP-002-E2-S7's output-preserving tuning (S7 T009) free to move a parameter use. `classify.sql`'s allow-list stays S5's `tests/unit/test_classify_sql_static.py`, run unedited at T013, so it is not restated here.
- Owner-directed fix (cross-plan review 2026-10-18, E2-F21): `add_fundamentals` (T002) writes every statement row through S3's `add_statement` with `observed_on` and `provider_filing_date` passed explicitly, takes a new keyword `latest_period_end` (`quarter_index` 0 is that period end, older quarters 3 calendar months apart, the backfilled ninth quarter is `quarter_index` 8), and no longer uses S3's `add_quarters`. Any other statement row a test writes (T006, T007 (c) and (e)) also passes both dates explicitly, with `observed_on` no earlier than the stock's `first_observed_on`. Derivation: S3 T002 fixes `add_quarters(conn, instrument_id, latest_period_end, n, values, *, numbers=False)` with no date parameter, and it does not say what `add_statement`'s `None` defaults write. A row written through either default, or an extra observation dated earlier, would move the instrument's first `observed_on`, and `statements.sql` computes `backfilled` against that date (S3 T015, DEC-0056). T004 and T007 (a) to (c) test what they claim only when that minimum is exactly `first_observed_on`. `latest_period_end` is the period-end anchor `add_quarters` used to receive. No story, design or test specification fixes test-helper signatures.

### Other Notes

- Stories CAP-002-E1-S1, CAP-002-E2-S1, CAP-002-E2-S2, CAP-002-E2-S4, CAP-002-E2-S7, CAP-002-E2-S8 and CAP-002-E2-S9 are classified in the table above; none is a new hard edge. `dependencies.yaml` already lists `CAP-002-E2-S6: [CAP-002-E2-S3, CAP-002-E2-S5]`; planning made no change to it.
- The mark is written with the row and never updated, which is the "retained with that classification in its history" half of AC-23. No `UPDATE` or `DELETE` of `factor_input` or `factor_classification` is written anywhere (research-store 2.5 item 1), and the static guard `tests/unit/test_research_sql_is_append_only.py` (CAP-002-E1-S1 T003, extended by CAP-002-E2-S1 T012) fails on one in any `.sql` or `.py` file under `src/factorflow/`; migration `0006` has no trigger. This story adds no migration and no trigger.
- Under a driver that commits once per stage, the TDD-evidence file records `commit_hash: stage` (T016).
