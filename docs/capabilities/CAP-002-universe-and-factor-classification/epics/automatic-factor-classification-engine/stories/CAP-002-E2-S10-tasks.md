---
artifact_schema_version: 1
artifact_id: CAP-002-E2-S10-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-08
last_reworked_review: CAP-002-E2-S10-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-11-07T23:32:47Z
  source_artifacts:
    - id: CAP-002-E2-S10
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "4"
    - id: CAP-002-system-design
      version: "5"
    - id: CAP-002-factor-engine-component-tests
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E2-S10 — Momentum Requires Corporate-Actions Coverage of Its Window

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/automatic-factor-classification-engine/stories/CAP-002-E2-S10.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E2-S10`
**Date**: 2026-11-07

## Summary

Closes CAP-002 release blocker B3 (DEC-0397, DEC-0398). `src/factorflow/classification/sql/momentum_inputs.sql` outer-joins `corporate_action`, so a stock whose corporate actions were never acquired is scored as if it never split or paid a dividend. After this story a momentum input `return_k` is computed only when one `coverage_segment` with `data_type = 'corporate_actions'` contains its window `(S_k, E]` (`covered_from <= S_k + 1`, `covered_to >= E`, on the `win` relation `s_session + 1` and `e_session`). Otherwise it is `missing` with `detail = {cause: corporate_actions_not_covered, window_months, E, S, corporate_actions_coverage}`, a null value and `known_on`, and `missing_data_type = 'corporate_actions'`, placed after a missing boundary and ahead of `price_not_positive` and `corporate_action_payload_unusable` (owner's order, DEC-0397). A `present` or `outdated` input records its containing segment as `detail.corporate_actions_covered_by`. The two seeds the story names gain one default segment (2000-01-01 to 2099-12-31) per instrument; the two whole-detail expectations DAC-E2-S10-6 names gain that key; a guard in `tests/integration/test_runner_acquires.py` pins CAP-001's released coverage contract (DEC-0398). No migration, no setting, no CAP-001 code change.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | Exactly the defined inputs, periods and weights | T004, T007, T009, T010, T012 |
| AC-12 | No score unless every input present; the missing input named | T004, T005, T008, T012 |
| DAC-E2-1 | Read-time split-and-dividend adjustment of unadjusted bars, no undefined step | T009, T010, T014 |
| DAC-E2-13 | Momentum `missing`, `corporate_actions_not_covered`, unless one segment contains `(S_k, E]` | T004, T006, T007, T008, T011, T012 |
| DAC-E2-S10-1 | No coverage: three inputs missing with the cause and detail; stock `not_classified`, `input_missing`, `return_3m` | T004, T012 (TC-COMP-381) |
| DAC-E2-S10-2 | `last_acquisition` names `corporate_actions`, `failed` | T005, T012 (TC-COMP-382) |
| DAC-E2-S10-3 | Bounds inclusive; `S_k + 2` or `E - 1` is missing and lists the segment | T006, T012 (TC-COMP-383) |
| DAC-E2-S10-4 | Covered window without actions: price return and `corporate_actions_covered_by`, present and outdated | T007, T012 (TC-COMP-384) |
| DAC-E2-S10-5 | Boundary first (`prices`), then not covered over payload and price causes | T008, T012 (TC-COMP-385) |
| DAC-E2-S10-6 | Seeded stocks keep every delivered result; only the two whole-detail expectations gain the key; value and growth unaffected | T002, T003, T009, T010, T014 (TC-COMP-386) |
| DAC-E2-S10-7 | Runner: successful empty fetch covers the range requested; failed or `not_found` records none, existing unchanged | T011 (TC-COMP-387) |

## Phase 1: Setup

**Purpose**: Confirm the hard prerequisites and the schema this story reads.

- [x] T001 Confirm on the working branch: CAP-002-E2-S4's `src/factorflow/classification/sql/momentum_inputs.sql` (the `held`, `win`, `judged`, `priced_window`, `statused` relations) and `tests/integration/test_engine_inputs_momentum.py`; CAP-002-E2-S7's `tests/integration/engine_proof_support.py::populate_volume`; CAP-002-E2-S2's `tests/integration/engine_support.py::add_instrument`; `coverage_segment` and `idx_coverage_instrument (instrument_id, data_type)` in `src/factorflow/db/migrations/0003_coverage.sql`; `insert_inputs.sql` joining `acquisition_state` on `missing_data_type`; and `AcquisitionRunner.execute_claimed` passing `corporate_actions_range=(depth_start, today)` (`src/factorflow/ingestion/runner.py`). If any is absent, STOP and report the missing hard dependency

**Checkpoint**: Every file this plan edits exists in the shape described; the baseline `uv run pytest -m postgres tests/integration/test_engine_inputs_momentum.py tests/integration/test_runner_acquires.py` passes.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the seeds and the failing tests that define the behaviour, and commit them before any production change (the cycle's `red_commit`).

Every new engine test lives in `tests/integration/test_engine_inputs_momentum.py` (story Technical Details), is `@pytest.mark.postgres` through the module's `pytestmark`, uses the module's `env` fixture (stock `AAA`, default-covered after T002, and the anchor fixing L), and carries `# Implements TC-COMP-nnn`. Segments a case needs are written by one module-local helper `cover(conn, instrument_id, covered_from, covered_to, data_type="corporate_actions")` in that test file: no seed module other than the two the story names changes. Uncovered stocks are made with `add_instrument(conn, symbol, corporate_actions_covered=False)`.

- [x] T002 [P] Seed: in `tests/integration/engine_support.py`, `add_instrument(conn, symbol, lifecycle="active", corporate_actions_covered: bool = True)` also inserts one `coverage_segment` (`data_type = 'corporate_actions'`, `covered_from = 2000-01-01`, `covered_to = 2099-12-31`) when the flag is true, in the same transaction, before its commit. Expose the two dates as a module constant `DEFAULT_CORPORATE_ACTIONS_COVERAGE` so tests compare against it rather than retyping it. Update the module docstring to name CAP-002-E2-S10 and DEC-0397/DEC-0398 (the default mirrors a successful acquisition). Signature order unchanged; the new parameter is keyword-compatible and defaulted, so every caller (`engine_momentum_support`, `engine_inputs_support`, `engine_classify_support`, `engine_proof_support`, `engine_restatement_support`, and every engine test) is unchanged (DAC-E2-S10-6)
- [x] T003 [P] Seed: in `tests/integration/engine_proof_support.py::populate_volume`, after the instruments are inserted, one set-based `INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) SELECT id, 'corporate_actions', %(from)s, %(to)s FROM unnest(%(ids)s::bigint[])` with the same two dates (imported from `engine_support.DEFAULT_CORPORATE_ACTIONS_COVERAGE`), and `coverage_segment` added to `_ANALYZE_SQL`, so the volume store has planner statistics for the new probe as for the tables it already analyses (DEC-0123). Update the function docstring. `populate_backdating` needs nothing: it uses `add_instrument` (DAC-E2-S10-6)
- [x] T004 Implement TC-COMP-381 (Momentum without corporate-actions coverage is missing and not classified) in `tests/integration/test_engine_inputs_momentum.py`: stock `BARE` with `corporate_actions_covered=False`, the `STANDARD` bars, and a `prices` segment 2000-01-01 to 2099-12-31 written by `cover(..., data_type="prices")` (so only the `corporate_actions` data type counts). Build with `run_momentum_stages`. For each of the three inputs assert `status == "missing"`, `value is None`, `known_on is None`, `as_of == E` and the whole `detail == {"cause": "corporate_actions_not_covered", "window_months": k, "E": bar(E, 120), "S": bar(S_k, close), "corporate_actions_coverage": []}`; `AAA` with the same bars and the default segment stays `present` on all three. A second test builds the set with every stage (`engine.build`) and `monkeypatch.setattr(constants, "MIN_PEER_SET_SIZE", 1)` (the floor is read at call time) so momentum is ranked by `AAA` alone: `BARE`'s momentum `factor_classification` row is `not_classified`, `reason_code = input_missing`, `reason_input = return_3m`, `reason_detail = f"{INPUT_LABELS['return_3m']} missing"`, null score and percentile, and `AAA` is `classified`. This is the story's key RED test — kills: negate-boolean on the `covered` test in `statused`; manual: drop the `cs.instrument_id` predicate (the anchor's and `AAA`'s default segments would cover `BARE`); manual: `'corporate_actions'` → `'prices'` in the probe (the `prices` segment would cover `BARE`); manual: coverage array without its `data_type` filter (`[]` would list the `prices` segment)
- [x] T005 Implement TC-COMP-382 (A missing momentum input names the corporate-actions acquisition) in the same file: `BARE` as in T004 with `acquisition_state` rows `prices` → `not_found` and `corporate_actions` → `failed` (distinct outcomes and the module's `ACQUIRED_AT`, so the data type is observable). Each of the three momentum inputs has `detail.last_acquisition == {"data_type": "corporate_actions", "outcome": "failed", "acquired_at": ...}` (parse and compare the timestamp) — kills: manual `missing_data_type` for the new cause → `'prices'` (would read `not_found`)
- [x] T006 Implement TC-COMP-383 (Coverage must contain the window, bounds inclusive) in the same file, parametrized over one `BARE` stock with the `STANDARD` bars (so `s_session` is each `S_k` target and `e_session` is `E`) and the segments: (a) exactly `S_12 + 1` to `E` → all three `present`, each `corporate_actions_covered_by == {"covered_from": S_12 + 1, "covered_to": E}`; (b) exactly `S_6 + 1` to `E` → `return_3m`, `return_6m` present, `return_12m` missing listing that segment; (c) `S_6 + 2` to `E` → `return_3m` present (the window the segment does contain), `return_6m` and `return_12m` missing listing it; (d) `S_12 + 1` to `E - 1` → all three missing listing it; (e) two segments, `S_6 + 2` to `E` inserted before `S_12 + 1` to `S_6`, → `return_3m` present covered by the later segment, `return_6m` and `return_12m` missing with `corporate_actions_coverage` listing both in `covered_from` order. Missing rows also assert the whole not-covered `detail`, null value and `known_on` — kills: off-by-one on `+ 1` (either direction: (a)/(b) or (c)), off-by-one `<=` → `<` on `covered_from` ((a)/(b)), `>=` → `>` on `covered_to` ((a)/(b)), and manual `ORDER BY covered_from` → `ORDER BY covered_from DESC` ((e))
- [x] T007 Implement TC-COMP-384 (A covered window with no actions gives the price return and names its segment) in the same file: `BARE` with segment 2020-01-02 to 2026-10-01 and the `STANDARD` bars, and `STALE` with segment 2021-03-04 to 2026-10-15 and the `STANDARD` closes but its latest bar on 2026-10-15 (before L). `BARE`'s three inputs are `present`, value `ret(120, close(S_k))` to 8 places and `detail.corporate_actions_covered_by == {"covered_from": "2020-01-02", "covered_to": "2026-10-01"}`; `STALE`'s three are `outdated`, null value, with its own segment as `corporate_actions_covered_by`. Distinct segments per stock kill a containing-segment lookup that ignores the instrument — kills: manual drop of `corporate_actions_covered_by` from the outdated `detail` branch; manual `covered_by` taken from another stock
- [x] T008 Implement TC-COMP-385 (Order of momentum missing causes) in the same file, with three uncovered stocks, each with both `acquisition_state` rows (`prices` → `not_found`, `corporate_actions` → `failed`): (1) `NOS12` with bars on `S_6`, `S_3`, `E`, L (no `S_12` bar): `return_12m` `detail.boundary == "S_12"` and `last_acquisition.data_type == "prices"`; `return_3m` and `return_6m` are `corporate_actions_not_covered` naming `corporate_actions`; (2) `UNUSABLE` with `STANDARD` bars, a bar on 2026-04-30 and an unusable split on 2026-05-01 (`split_to = "0"`): all three `corporate_actions_not_covered`, `last_acquisition.data_type == "corporate_actions"`; (3) `EZERO` with `STANDARD` bars but `E` close 0: all three `corporate_actions_not_covered` naming `corporate_actions` (owner's order, DEC-0397: a non-positive close no longer ranks first) — kills: manual move of the not-covered branch after `price_not_positive` in the `detail` `CASE` ((3)), manual move after the unusable branch ((2)), manual not-covered branch before the boundary branches ((1)), manual `missing_data_type` boundary case → `'corporate_actions'` ((1))

### Delivered expectations (DAC-E2-S10-6, TC-COMP-386)

- [x] T009 In `tests/integration/test_engine_inputs_momentum.py`, add `"corporate_actions_covered_by": {"covered_from": "2000-01-01", "covered_to": "2099-12-31"}` (from `DEFAULT_CORPORATE_ACTIONS_COVERAGE`) to the expected `detail` of exactly `test_every_window_is_present_with_bars_on_every_boundary` and `test_a_stale_latest_bar_makes_all_three_momentum_inputs_outdated`, and change nothing else in any delivered test. Every other delivered test (splits, dividends, boundaries, currency, `known_on`, unusable payloads, `price_not_positive`) runs unchanged against the default segment — kills: manual drop of `corporate_actions_covered_by` from the present `detail` (`base`)
- [x] T010 Add `test_value_and_growth_inputs_do_not_depend_on_corporate_actions_coverage` to the same file (TC-COMP-386 "Value and growth inputs are the same with and without coverage", design 2.4 "Value and growth read no corporate action"): `AAA` (default-covered) and `BARE` (uncovered) with the same `STANDARD` bars and eight identical quarters (`add_quarters`, `install_test_line_items`, as `test_momentum_currency_does_not_depend_on_fundamentals` does); every value and growth input of the two stocks has equal `status`, `value`, `as_of`, `known_on` and `detail`, and is `present`, while `BARE`'s momentum is missing — kills: manual coverage test applied to every factor's rows (would make value/growth differ)

### Coverage contract guard (DAC-E2-S10-7, TC-COMP-387)

- [x] T011 [P] Implement TC-COMP-387 (A successful empty corporate-actions fetch covers the range requested) in `tests/integration/test_runner_acquires.py` (design section 7 places it there; a CAP-001 test module gains test functions only — no CAP-001 code, design or delivered assertion changes, story Technical Details), reusing the module's `_insert_instrument`, `_insert_claimed_run`, `_make_reference`, `_make_daily_bar` and `_make_financial` and the `migrated_runner_connection` fixture, with `today = 2025-09-22`, depth 5, so the range requested is `2020-09-22` to `2025-09-22` (`depth_start_for_run`). (a) `fetch_corporate_actions` returns `[]`: assert it was called once with `("AAPL", date(2020, 9, 22), today)`, and `coverage_segment` for the instrument and `corporate_actions` is exactly `[(date(2020, 9, 22), today)]`. (b) Parametrized over `ProviderUnavailable` (outcome `failed`) and `InstrumentNotFound` (outcome `not_found`) and over no prior segment or a prior segment `2020-09-22` to `2025-08-31`: `fetch_corporate_actions` raises; assert it was called (the fetch happened), `run_instrument_result` records the expected outcome for `corporate_actions`, and the instrument's `corporate_actions` segments equal the prior state exactly (`[]` or the one segment). The `prices` segment of the same instrument is written in every case, showing the instrument was processed. A guard: it is expected to pass against the delivered runner and stays as the record of DEC-0398's contract — kills nothing in this story's production diff (no runner change); it fails if CAP-001's writer ever changes the semantics DEC-0398 adopts

**Checkpoint**: Committed as the cycle's `red_commit` (test files only). Against the delivered SQL: T004 to T010's new tests and the two edited expectations fail; every other delivered test and T011's guard pass; the RED log is saved.

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass in the one production file.

- [x] T012 Edit `src/factorflow/classification/sql/momentum_inputs.sql` (read-only SQL, no migration):
  1. `win`: a `LEFT JOIN LATERAL` after the `S_k` lookup selecting the containing segment `(cs.covered_from, cs.covered_to)` from `coverage_segment cs WHERE cs.instrument_id = h.instrument_id AND cs.data_type = 'corporate_actions' AND cs.covered_from <= s.session_date + 1 AND cs.covered_to >= h.e_session LIMIT 1` — one probe of `idx_coverage_instrument` per stock and window; segments never overlap, so at most one row matches. Expose `ca_covered_from`, `ca_covered_to` and carry them through `judged`'s select list and `GROUP BY`.
  2. A `coverage` relation: per active instrument, `jsonb_agg(jsonb_build_object('covered_from', covered_from, 'covered_to', covered_to) ORDER BY covered_from)` over its `corporate_actions` segments, left-joined in the final `SELECT` and read as `coalesce(..., '[]')`.
  3. `statused`: `covered` = the containing segment exists; `status` is `missing` also when not covered; `base` gains `corporate_actions_covered_by`.
  4. `detail` `CASE`: after the two boundary branches and before `price_not_positive`, `WHEN NOT s.covered THEN {cause: 'corporate_actions_not_covered', window_months, E, S, corporate_actions_coverage}`; the outdated branch keeps `base` (which now carries the key).
  5. `missing_data_type`: `prices` for a missing boundary, `corporate_actions` when not covered, `prices` for `price_not_positive`, `corporate_actions` for an unusable payload (DEC-0243 as extended by DEC-0397).
  6. Header and `statused` comments: cite CAP-002-E2-S10, DEC-0397, DEC-0398 and the new cause order. Keep comment wording free of comparison operators and numerals where possible, since the mutation runner does not mask `--` comments.
  (depends on T002-T011)

**Checkpoint**: `uv run pytest -m postgres tests/integration/test_engine_inputs_momentum.py tests/integration/test_runner_acquires.py` passes; `uv run pytest tests/unit/test_engine_sql_safety.py tests/unit/test_classification_sql_ships.py tests/unit/test_sql_is_append_only.py` passes (the SQL stays read-only and shipped).

---

## Phase 4: Integration

**Purpose**: Confirm every build seeded through the two seeds classifies as delivered.

- [x] T013 Run every command in the Validation Plan. Confirm by running, without editing them, the suites that seed through `populate_volume` or `add_instrument` and build: `tests/integration/test_engine_peer_set.py`, `test_engine_restatement.py`, `test_engine_currency.py`, `test_engine_inputs_fundamentals.py`, `test_engine_context.py`, `test_engine_transaction.py`, `test_engine_volume_population.py`, `test_classification_after_build.py`, `test_classification_cycle.py`, `test_classification_latency.py`, `test_scheduler_restart.py`, and the `slow` volume test `test_engine_volume.py` (run separately, its timing reported). A failure in a file this plan does not name is reported, not patched (depends on T012)

**Checkpoint**: The whole suite is green; the volume, latency and integration-automation builds classify as delivered.

---

## Phase 5: Polish

**Purpose**: Traceability and evidence.

- [x] T014 Re-read traceability: T004-T008 and T011 carry `# Implements TC-COMP-381` to `387` above their tests, T009's two edits and T010 carry `# Implements TC-COMP-386`; every new test's docstring cites its DAC and DEC; `git diff --stat <plan commit>..HEAD` touches only `momentum_inputs.sql`, `engine_support.py`, `engine_proof_support.py`, `test_engine_inputs_momentum.py`, `test_runner_acquires.py` and the story's docs. `docs/reference/classification-engine.md` is left to doc sync (story Technical Details)
- [x] T015 After each TDD cycle in T002–T013 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E2-S10-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S4 | hard | Existing graph edge. Supplies `momentum_inputs.sql` and `test_engine_inputs_momentum.py` (T004-T010, T012) |
| CAP-002-E2-S7 | hard | Existing graph edge. Supplies `engine_proof_support.populate_volume` (T003) and the volume and latency tests T013 runs |
| CAP-002-E2-S2 | context | Supplies `engine_support.add_instrument` (T002), transitively through S4's own hard edge on S2; this plan imports nothing S2 alone provides that S4 does not already require |

CAP-001's acquisition runner and writer (CAP-001-E4-S5, CAP-001-E4-S6) are released code of another capability that T011 exercises and does not change; they are not stories of this capability's graph.

### Task Dependencies
- T001: No dependencies
- T002, T003: Depend on T001; different files, parallel
- T004-T010: Depend on T002 (the default segment and the `corporate_actions_covered` flag); same file, sequential
- T011: Depends on T001 only; different file, parallel with T002-T010
- T012: Depends on T002-T011 (tests first, committed as the RED commit)
- T013: Depends on T012
- T014: Depends on T013
- T015: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: T002, T003 and T011 own separate files; T004-T010 share one file

---

## Validation Plan

### Constitution-Defined Commands
- Build: `uv build`
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'`
- Focused tests, per phase: `uv run pytest -m postgres tests/integration/test_engine_inputs_momentum.py tests/integration/test_runner_acquires.py` plus `uv run pytest tests/unit/test_engine_sql_safety.py tests/unit/test_classification_sql_ships.py tests/unit/test_classification_stage_order.py` — run at each phase checkpoint and, as one `-m "postgres or not postgres" -x` command over the same files, as the mutation runner's command; the full test commands run on the final bytes
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`
- Slow volume test, separately: `uv run pytest -m slow tests/integration/test_engine_volume.py`

### Story-Specific Validation
- DAC-E2-S10-1 / TC-COMP-381: an uncovered stock's three inputs are missing with the cause and whole detail; it is `not_classified`, `input_missing`, `return_3m` in a full build (T004)
- DAC-E2-S10-2 / TC-COMP-382: `last_acquisition` is the `corporate_actions` `failed` row (T005)
- DAC-E2-S10-3 / TC-COMP-383: `S_k + 1` and `E` inclusive; `S_k + 2` and `E - 1` excluded; a contained window stays present (T006)
- DAC-E2-S10-4 / TC-COMP-384: price return and `corporate_actions_covered_by` on present and outdated inputs (T007)
- DAC-E2-S10-5 / TC-COMP-385: boundary (`prices`) before not covered before price and payload causes (T008)
- DAC-E2-S10-6 / TC-COMP-386: only the two named expectations change; value and growth identical with and without coverage; volume, latency and integration builds classify as delivered (T009, T010, T013)
- DAC-E2-S10-7 / TC-COMP-387: the runner guard passes against the delivered runner (T011)
- `git diff <base>..HEAD -- src/factorflow/ingestion src/factorflow/db` is empty (no CAP-001 code change, no migration)

---

## Notes

### Resolved Conflicts

- **The story says "one `EXISTS` probe"; the design asks for the containing segment.** Design 2.4 and DAC-E2-S10-4 require a present or outdated input to record the segment that contains its window, which an `EXISTS` cannot return. Governing rule: acceptance criteria outrank a sketch (constraint 9.1); the design's own `EXISTS` is introduced as "the sketch". Resolution: T012 uses one `LEFT JOIN LATERAL ... LIMIT 1` probe of `idx_coverage_instrument` per stock and window, which is the same index probe and yields the segment; covered means a row was found.
- **Where the segment helper lives.** The new cases need to write arbitrary segments, and the story allows exactly two seed changes ("No other seed changes"). Resolution: the helper `cover` is local to `test_engine_inputs_momentum.py` (a test module, not a seed), and `engine_momentum_support.py` is not edited.
- **`populate_volume`'s `ANALYZE`.** T003 adds `coverage_segment` to the statistics `populate_volume` already gathers. This is part of the one seed the story names and keeps DEC-0123's rationale (a fresh bulk load lacks the statistics a long-lived store holds) true for the new probe; it changes no data.
- **Story status.** `status`, `updated` and `approval` are mutable gate fields (`scripts/artifact-gate.py` `MUTABLE_GATE_FIELDS`), so the story moves `todo` → `planning` here without invalidating its approval (the S9 plan's note that a status edit invalidates approval predates that rule).

### Open Gaps

None. Every bound is fixed by an artifact: the inclusive bounds and the cause order are DEC-0397 and design 2.4; the per-cause data types are design 2.4 (DEC-0243 as extended); the default seed segment 2000-01-01 to 2099-12-31 is the story's.

### Other Notes

- Graph: `CAP-002-E2-S10: [CAP-002-E2-S4, CAP-002-E2-S7]` is correct and complete; `dependencies.yaml` is unchanged.
- Commit granularity (not under a driver): the plan commit; the RED commit (Phase 2 test files only, recorded as `red_commit`); the GREEN commit (`momentum_inputs.sql`, plus any test correction a review asks for), which is the cycle's `commit_hash` and whose staged diff is fingerprinted, reviewed and mutated; then a documentation commit carrying the evidence file, its logs, patch and mutation results, the ticked tasks and the story status. The reviewers are given the RED commit's diff as well as the staged GREEN diff, since the tests are the cycle's substance.
- One TDD cycle: the rule is one SQL change whose every branch the Phase 2 tests define together.
- Hand-written mutants for the mutation run (beside the generated ones), in `src/factorflow/classification/sql/momentum_inputs.sql`:
  - `cs.instrument_id = h.instrument_id` → `true`
  - `cs.data_type = 'corporate_actions'` (probe) → `cs.data_type = 'prices'`
  - the coverage array's `data_type = 'corporate_actions'` filter → removed
  - the coverage array's `ORDER BY covered_from` → `ORDER BY covered_from DESC`
  - not-covered `missing_data_type` → `'prices'`
  - boundary `missing_data_type` → `'corporate_actions'`
  - not-covered `detail` branch moved after the `price_not_positive` branch
  - not-covered `detail` branch moved after the unusable-payload branch
  - `corporate_actions_covered_by` removed from `base`
  - the `NOT covered` term removed from `status`
  - `corporate_actions_coverage` → `jsonb_build_array()` in the not-covered `detail`
- Risk: `coverage_segment` has no row for every instrument in production; after deployment the stocks without corporate-actions coverage are not classified on momentum (design 6, the intended fail-safe). Nothing here mitigates that; it is the owner's accepted behaviour.

### Implementation Notes (story coding, 2026-11-07)

- T004's full-build test uses a peer-set floor of 2 with a second covered stock `PEER`, not 1: with one qualifying stock `stddev_samp` is null, `classify.sql` writes a null score and the set fails `factor_classification_shape`. The asserted outcome for the uncovered stock is unchanged. Changed during GREEN and recorded in the cycle's evidence.
- T006 gained one case during GREEN, `test_coverage_bounds_are_the_resolved_bars_not_their_targets`: the `STANDARD` bars sit on their targets, so no planned case told the resolved `S_k` and `E` bars from their targets, and the hand-written mutants that read the targets survived that suite. Both reviewers judged it in scope (it pins design 2.4's bounds).
- T011: a successful corporate-actions fetch that returns no action records `run_instrument_result.outcome = unchanged` (no row written), not `written`; the guard asserts the released value.
- The mutation run's one non-comment survivor, `LIMIT 1` → `LIMIT 2` on the containing-segment probe, is equivalent under `coverage_no_overlap` (migration 0003).
- Review v1 rework (2026-11-08), IR-001: one TC-COMP-381 test added under T004, `test_an_uncovered_stock_with_a_stale_latest_bar_is_missing_not_outdated` (an uncovered stock whose latest bar precedes the latest trading day is missing, not outdated, and `input_missing` on momentum). No production change; the review's mutant `manual:review-outdated-before-not-covered` is now killed (TDD evidence cycle-2).
