---
artifact_schema_version: 1
artifact_id: CAP-001-E6-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-30
updated: 2026-09-30
story_id: "CAP-001-E6-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-30T04:09:12Z"
reviewed_head: "04ac6cc3c2a77b56e89532e17b5a12fec1d38977"
review_base: "887e50a8b2309306110c948b324eea037371497c"
reviewed_state_revision: "sha256:720c8d301e62ecba27b5125e3beb68892d5578823e835c90a2cbe457705bf539"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E6-S2
    artifact_version: 1
    content_revision: sha256:5e4c67e656021dfd4ae6784eb0b74c7fd0cc94ca181ace360576262117b267f4
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Devin
  tool_version: unknown
  timestamp: 2026-09-30T04:09:12Z
  source_artifacts:
    - id: CAP-001-E6-S2
      version: "1"
    - id: CAP-001-E6-S2-tasks
      version: "1"
  invoking_user: alvarodejodra
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E6-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 4 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 18/19 verified (T001 justified NOT APPLICABLE) |
| Required validation | 9/9 passed |

Gap detection is genuinely implemented, not merely scaffolded. `gaps.sql` is a
byte-for-byte copy of `component-design-coverage-service.md` section 2.3
(verified twice: by diffing the shipped file against the design block myself, and
by the T010 drift guard executing against the design document), so the three
load-bearing properties — the trading-day set built from *all* instruments'
bars, the gap restricted to the instrument's *own* `prices` covered range, and
the availability predicate evaluated *inside* the statement — are structurally
present rather than asserted. Every one of the 12 mandatory component tests
(TC-COMP-008, 028–032, 048–053, plus the backend half of TC-COMP-040) exists,
carries its traceability comment, and makes assertions that a plausible
regression would break: I checked each test's seeded data by hand against the
statement's semantics and confirmed, for example, that TC-COMP-031 would report
three gaps for `A` if the `covered` CTE's `data_type = 'prices'` filter were
removed, and that TC-COMP-050's positive control (`to_date = 2024-01-24`
returning exactly `B × {01-02…01-05}`) proves the zero-row assertion is caused by
the availability predicate and not by an empty range. The unavailable path
returns `None` and never `[]` or `0`, which is the specific false-negative
STD-UI-4 and DAC-E6-4 exist to prevent, and it is asserted as `is None` rather
than as falsy.

All nine constitution- and plan-defined validation commands were rerun
independently from a clean tree and all exited 0, including the full suite with
`postgres`-marked tests (687 passed, container runtime available) and the wheel
check confirming the three new `.sql` files ship inside the distribution. No
tracked file was modified by any command.

The verdict is PASS-WITH-WARNINGS rather than PASS because of two MEDIUM
evidence weaknesses that leave no acceptance criterion, required task or
required validation unsatisfied: the view-level `gap_detection.missing_days`
aggregation is implemented but asserted nowhere (IR-001), and the task plan's
seven story-specific `-k` selector commands select zero tests as written
(IR-002). IR-002 is deliberately not HIGH: the plan's own normative tasks
(T003–T009) instruct comment-based TC traceability, which matches the
repository's established precedent (`tests/unit/test_fetch_plan.py`), so the
implementation followed the plan's instructions and the Validation Plan section
contradicts them. Each TC named by those selectors is independently confirmed
implemented and passing, so the evidence those commands were meant to produce
exists by direct means.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S2-tasks.md` |
| Component | `FactorFlow-v2` (also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E6-S2-run-20260930T025827Z` |
| HEAD | `04ac6cc3c2a77b56e89532e17b5a12fec1d38977` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E6-integration-20260930T025827Z` → `887e50a8b2309306110c948b324eea037371497c` (confirmed an ancestor of HEAD via `git merge-base --is-ancestor`) |
| Working tree | Clean — no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 9 |

The change set is a single commit, `04ac6cc` ("feat(CAP-001-E6-S2): detect gaps
against the derived trading-day set"), plus an empty working tree. No unrelated
work is mixed into the range.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/coverage/gaps.py` | added | AC-8, DAC-E6-2…6, DAC-E6-S2-1…6; T015, T018 |
| `src/factorflow/coverage/sql/gaps.sql` | added | AC-8, DAC-E6-2, DAC-E6-3, DAC-E6-5, DAC-E6-S2-3; T012 |
| `src/factorflow/coverage/sql/gap_range.sql` | added | DAC-E6-4, DAC-E6-S2-3; T013, T018 |
| `src/factorflow/coverage/sql/gap_instrument.sql` | added | DAC-E6-S2-4, DAC-E6-S2-6; T014 |
| `src/factorflow/coverage/service.py` | modified | AC-8, DAC-E6-4, DAC-E6-S2-4, DAC-E6-S2-6; T016, T017, T018 |
| `tests/integration/test_coverage_gaps.py` | added | T002–T009, T011 (TC-COMP-008, 028–032, 040 backend half, 048–053) |
| `tests/unit/test_coverage_gaps_sql_matches_design.py` | added | DAC-E6-2, DAC-E6-3, DAC-E6-S2-3; T010 |
| `docs/…/CAP-001-E6-S2-tasks.md` | modified | Task checkbox bookkeeping only (19 `[ ]`→`[x]` flips, no text changes) |
| `docs/…/CAP-001-E6-S2.md` | modified | `status: planning` → `status: in-review` lifecycle bookkeeping; content revision digest unchanged (`sha256:5e4c67e6…`, still matching the approved `reviewed_revision`) |

No file outside this list changed. `pyproject.toml` was **not** touched, which is
correct (see T001). `src/factorflow/coverage/sql/coverage.sql` was **not**
touched, which is also correct: it already selected `i.instrument_id`, the one
column T016 made conditional.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-8 | SATISFIED | `sql/gaps.sql:20-29` (`covered` ⋈ `trading_day` LEFT JOIN `in_range` anti-join); `service.py:266-271` | `test_coverage_gaps.py::test_one_session_missing_for_one_of_three_is_one_gap` (TC-COMP-008) | Three instruments, `C` lacks 2024-01-04: `C.missing_days == 1`, `A`/`B` `== 0`, `read_gap_dates(conn,"C") == [2024-01-04]`. Matches design section 7's worked example exactly. |
| DAC-E6-2 | SATISFIED | `sql/gaps.sql:11-13` — `trading_day` is `SELECT DISTINCT session_date FROM in_range`, i.e. over every instrument's bars, with no instrument correlation | `::test_trading_day_set_is_the_union_across_instruments` (TC-COMP-028) | `missing == {A: [01-04], B: [01-02]}`: each missing date is contributed by a *different* instrument's bar, which cannot happen unless the set is a union. `C` absent. |
| DAC-E6-3 | SATISFIED | `sql/gaps.sql:23-24` — `JOIN trading_day t ON t.session_date BETWEEN c.covered_from AND c.covered_to` | `::test_gap_only_inside_the_instruments_own_covered_range` (TC-COMP-029) | `B` covered 01-03..01-04 reports `[]` although 01-02/01-05 are trading days; after deleting `B`'s 01-04 bar it reports exactly `[01-04]`. The delete-and-recheck is the positive control that the empty result was not vacuous. |
| DAC-E6-4 | SATISFIED | `sql/gap_range.sql:13-15` (`count(DISTINCT b.instrument_id) >= 2`); `gaps.py:73-74` early return without executing `GAPS_SQL`; `service.py:78,159,204,267` `_UNAVAILABLE` carries `reason` and `missing_days=None` | `::test_one_instrument_reports_detection_unavailable_not_zero` (TC-COMP-030), `::test_zero_instruments_with_data_in_range_is_unavailable` (T011) | `available is False`, `reason == "fewer_than_two_instruments_with_data"`, `missing_days is None` asserted as `is None` (not falsy), the instrument row equals the view's unavailable object, and `read_gap_dates` returns `None`, not `[]`. |
| DAC-E6-5 | SATISFIED | `sql/gaps.sql:14-18` `covered` CTE filtered `WHERE cs.data_type = 'prices'`; `sql/gap_range.sql:9` same filter; `sql/gap_instrument.sql:3` `has_prices` | `::test_gap_detection_applies_to_prices_only` (TC-COMP-031) | `A` holds a `fundamentals` segment spanning 2023-01-01..2024-12-31 and trading days exist at 01-08..01-10 outside `A`'s prices range; `A` reports 0. Removing the `prices` filter would make this 3, so the test is regression-sensitive. |
| DAC-E6-6 | SATISFIED | Consequence of `trading_day` being derived from existing bars only (`sql/gaps.sql:11-13`); stated as a limit in `gaps.py:17-22` | `::test_market_wide_outage_is_not_claimed` (TC-COMP-032) | Both instruments lack the weekday 2024-01-03: view is `available is True`, both `missing_days == 0`, and no field of the view names 01-03. No detection is claimed. See IR-004 on how absence is asserted. |
| DAC-E6-S2-1 | SATISFIED | Same as DAC-E6-2; the statement has no self-join of an instrument to its own bars | `::test_instrument_is_not_checked_against_its_own_dates` (TC-COMP-048) | `B`'s own bar dates {01-02, 01-04} are hole-free read alone, so a self-referential set yields 0; the test asserts `[01-03]` and `missing_days == 1`, and explicitly `!= 0`. |
| DAC-E6-S2-2 | SATISFIED | `sql/gaps.sql:23-24` lower bound `c.covered_from` | `::test_date_before_first_acquisition_is_outside_coverage` (TC-COMP-049) | `B` first acquired 01-04: `read_gap_dates == []` and `missing_days == 0` although 01-02/01-03 are trading days with no `B` bar. |
| DAC-E6-S2-3 | SATISFIED | `sql/gaps.sql:27-28` — `WHERE b.instrument_id IS NULL AND (SELECT available FROM availability)`, i.e. the predicate gates row emission inside the statement | `::test_availability_predicate_inside_the_statement_returns_no_rows` (TC-COMP-050); `tests/unit/test_coverage_gaps_sql_matches_design.py::test_design_block_is_actually_read` | `GAPS_SQL` is executed directly: zero rows for 01-02..01-05, and the positive control at `to_date=01-24` returns exactly `B × {01-02…01-05}` and nothing for `A`. The four rows the control returns are precisely the rows suppressed in the first execution, so the suppression is proven to come from the predicate. |
| DAC-E6-S2-4 | SATISFIED | `service.py:268-269` `presence["prices"] is not Presence.PRESENT` → `_NOT_COMPUTED` (`missing_days=None`); `service.py:233-234` `has_prices` false → `None` | `::test_fundamentals_and_corporate_actions_have_no_gaps_computed` (TC-COMP-051) | `F` holds only `fundamentals` + `corporate_actions` segments and sparse observations: absent from `detect_gaps().missing`, `missing_days is None` (not a measured 0), `read_gap_dates(conn,"F") is None`. I confirmed `presence` and `has_prices` are the *same* condition — `coverage.sql:21` derives `acquired_from` as `MIN(covered_from)` over the type's segments, so both reduce to "a `prices` `coverage_segment` exists" and cannot disagree. |
| DAC-E6-S2-5 | SATISFIED | Same as DAC-E6-6 | `::test_day_missing_for_every_instrument_is_no_ones_gap` (TC-COMP-052) | `read_gap_dates` returns `[]` for both instruments and 01-03 appears in no instrument's list. Carries the required comment marking this the stated limit (design section 3, STD-UI-18), not a defect. |
| DAC-E6-S2-6 | SATISFIED | `service.py:271` per-instrument `missing_days=len(missing)`; `service.py:210-238` `read_gap_dates` returns the dates | `::test_count_for_collapsed_row_dates_for_expansion` (TC-COMP-053 + TC-COMP-040 backend half) | `B.missing_days == 2`, `read_gap_dates == [01-03, 01-05]` ascending, and `len(dates) == missing_days` ties the two surfaces together. `InstrumentCoverage` exposes no date collection. See IR-003 on the strength of that last assertion. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | NOT APPLICABLE | `pyproject.toml:33-34` `[tool.setuptools.package-data] factorflow = ["coverage/sql/*.sql"]` | The task is conditional: "**only if CAP-001-E6-S1 has not already added it**". `git show 887e50a:pyproject.toml` shows the table already present at the review base, so the correct action was to change nothing, and nothing was changed. Its purpose is independently verified: `unzip -l dist/factorflow-*.whl` lists all three new `.sql` files. |
| T002 | complete | VERIFIED | `tests/integration/test_coverage_gaps.py:1-21,33-64` | Module docstring names the story, design 2.3 and all 12 TCs; `pytestmark = pytest.mark.postgres`; the three required helpers (`_instrument`, `_bars` with a 32-byte `sha256` `value_hash`, `_segment`) plus two composition helpers (`_priced`, `_rows`). Uses the existing `migrated_writer_connection` fixture; no new fixture added. Direct-INSERT seeding follows the `test_writer_coverage.py` precedent. |
| T003 | complete | VERIFIED | `…::test_one_session_missing_for_one_of_three_is_one_gap` | Every assertion the task enumerates is present, including `read_gap_dates(conn,"C") == [date(2024,1,4)]`. |
| T004 | complete | VERIFIED | `…::test_trading_day_set_is_the_union_across_instruments`, `…::test_instrument_is_not_checked_against_its_own_dates` | Seeded data matches the task's specification day for day (A: 01-02/01-03; B: 01-03/01-04; C: all three; all covered to 01-04). The `!= 0` assertion the task demands is present. |
| T005 | complete | VERIFIED | `…::test_gap_only_inside_the_instruments_own_covered_range`, `…::test_date_before_first_acquisition_is_outside_coverage` | Includes the required two-phase check (assert no gaps, delete `B`'s 01-04 bar, assert `[01-04]`). |
| T006 | complete | VERIFIED | `…::test_one_instrument_reports_detection_unavailable_not_zero`, `…::test_availability_predicate_inside_the_statement_returns_no_rows` | Both the `is None`-not-falsy requirement and the `read_gap_dates … is None`-not-`[]` requirement are met literally. The direct `GAPS_SQL` execution with its positive control is implemented as specified, and `detect_gaps(from=01-02,to=01-05).available is False` is asserted. |
| T007 | complete | VERIFIED | `…::test_gap_detection_applies_to_prices_only`, `…::test_fundamentals_and_corporate_actions_have_no_gaps_computed` | `F` seeded with `fundamental_observation` rows as specified; all three required assertions present. |
| T008 | complete | VERIFIED | `…::test_market_wide_outage_is_not_claimed`, `…::test_day_missing_for_every_instrument_is_no_ones_gap` | Both instruments lack 01-03 as specified; the required explanatory comment citing design section 3 / STD-UI-18 is present at `test_coverage_gaps.py:618-619`. |
| T009 | complete | VERIFIED | `…::test_count_for_collapsed_row_dates_for_expansion` | Count, ascending dates, and count-equals-length are asserted; the field-shape guard deviates in form from the task's wording (IR-003). Also carries the `# Implements TC-COMP-040 (backend half)` comment the task requires. |
| T010 | complete | VERIFIED | `tests/unit/test_coverage_gaps_sql_matches_design.py:19-36` | Byte-for-byte comparison against `sql_block_under_heading("### 2.3", …)` read from the design document, following the `test_migration_0001_matches_design.py` precedent, plus the second test proving the extracted block really contains `availability AS` and `(SELECT available FROM availability)`. I independently reproduced the comparison with `sed` over the design file. Needs no container (confirmed: it runs under `-m 'not postgres'`). |
| T011 | complete | VERIFIED | `…::test_default_range_is_everything_acquired`, `…::test_zero_instruments_with_data_in_range_is_unavailable`, `…::test_empty_store_is_unavailable`, `…::test_inverted_range_raises_value_error`, `…::test_unknown_symbol_raises_instrument_not_found`, `…::test_database_failure_propagates` | All five required edge cases plus the empty-store case are present. The empty-store test correctly asserts only `available is False` and `missing_days is None`, avoiding the reason assertion, exactly as the task instructs because of the S1 plan contradiction the plan records at "Other Notes (a)". |
| T012 | complete | VERIFIED | `src/factorflow/coverage/sql/gaps.sql` (29 lines) | Byte-for-byte identical to the design's section 2.3 `sql` block, including the leading `-- src/factorflow/coverage/sql/gaps.sql` comment and trailing newline. Named parameters preserved; no instrument filter, lifecycle filter or `LIMIT` added. Verified twice (manual diff and T010 executing green). |
| T013 | complete | VERIFIED | `src/factorflow/coverage/sql/gap_range.sql` | Returns exactly one row `(from_date, to_date, available)`. `coalesce(%(from_date)s::date, min(cs.covered_from))` / `coalesce(%(to_date)s::date, max(cs.covered_to))` over `coverage_segment WHERE data_type='prices'`; `available` is the same `count(DISTINCT b.instrument_id) >= 2` predicate over `daily_bar`. Bound parameters only, no DML. I checked the degenerate case: with no prices segments the aggregate still yields one row with NULL bounds, `BETWEEN NULL` matches nothing, `count(…) >= 2` evaluates to `false` (not NULL), so `detect_gaps` short-circuits and `GAPS_SQL` is never executed with NULL bounds. |
| T014 | complete | VERIFIED | `src/factorflow/coverage/sql/gap_instrument.sql:3` | The statement is the one the task specifies, verbatim, with the uniqueness rationale recorded in the header comment. |
| T015 | complete | VERIFIED | `src/factorflow/coverage/gaps.py:37-81` | `GAPS_SQL` and `GAP_RANGE_SQL` loaded at import from `Path(__file__).parent / "sql"`; `GAPS_SQL` module-level as T006 requires; `UNAVAILABLE_REASON: Final` defined here and imported by `service.py` (direction is `service → gaps`, never the reverse); frozen `GapResult` with the four specified fields; `detect_gaps` performs the four steps in the required order, including returning without executing `GAPS_SQL` when unavailable. No `try/except` around execution, so database errors propagate (OPS-ERR-001). `mypy --strict` clean. |
| T016 | complete | VERIFIED | `src/factorflow/coverage/service.py:184-207,241-271` | `detect_gaps` called once per request with the caller's bounds unchanged (`None` stays `None`). View-level `GapDetection(True, None, sum(len(v) …))` when available, `_UNAVAILABLE` otherwise. Per-instrument branches implement all three specified cases in the specified order. `coverage.sql` already selected `i.instrument_id`, so the conditional column addition was correctly skipped. S1's filters, cursor lookahead and depth logic are untouched. See "Scope and Plan Deviations" for the one cosmetic change to the never-acquired branch. |
| T017 | complete | VERIFIED | `src/factorflow/coverage/service.py:210-238` | Signature matches the task exactly. `normalise(symbol)` applied before the lookup; `InstrumentNotFound(normalised_symbol)` on no row; `None` when `has_prices` is false; `None` — never `[]` — when detection is unavailable; otherwise `result.missing.get(instrument_id, [])`. No S1 stub remained to replace. |
| T018 | complete | VERIFIED | `gaps.py:1-27`; `sql/gap_range.sql:6`; `service.py:134-143,219-224` | Module docstring cites design 2.2/2.3/3 and AC-8, DAC-E6-2…6, DAC-E6-S2-1…6, and states both limits in plain words. `gap_range.sql` carries the one-line comment citing the 2026-09-05 owner decision. The PROVISIONAL/owner-confirmed choices appear in both the `read_coverage` and `read_gap_dates` docstrings, citing this plan's Open Gaps, following the `runs/queries.py` precedent. |
| T019 | complete | VERIFIED | See "Independent Validation" | All commands the task names were rerun independently and exited 0, and the wheel carries all three `.sql` files. Only files this story owns were modified. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_one_session_missing_for_one_of_three_is_one_gap` / TC-COMP-008 | ADEQUATE | Proves the end-to-end read surface reports one gap for the one instrument missing a shared session and zero for the other two, and that the expansion read names the exact date. Exercises `read_coverage` and `read_gap_dates` against a real migrated database — no mocks anywhere in this file, so nothing can make the result inevitable. | Does not assert the view-level count (IR-001). |
| `test_trading_day_set_is_the_union_across_instruments` / TC-COMP-028 | ADEQUATE | The `{A: [01-04], B: [01-02]}` shape is only reachable if each instrument's missing date was contributed by a different instrument's bar. An implementation that built the set per instrument would return `{}`; one that ignored `covered_to` would add rows. | None. |
| `test_instrument_is_not_checked_against_its_own_dates` / TC-COMP-048 | ADEQUATE | Constructed so a self-referential set gives 0 and the correct answer gives 1, i.e. the two implementations are distinguishable by this test alone. | None. |
| `test_gap_only_inside_the_instruments_own_covered_range` / TC-COMP-029 | ADEQUATE | Strongest test in the file: the delete-and-recheck makes the initial empty result non-vacuous, so "no gaps" cannot pass for the wrong reason. | None. |
| `test_date_before_first_acquisition_is_outside_coverage` / TC-COMP-049 | ADEQUATE | Two trading days precede `B`'s first acquisition and both are correctly excluded; `A` supplies them so they are unambiguously in the trading-day set. | The vacuity risk is covered by TC-COMP-029; acceptable. |
| `test_one_instrument_reports_detection_unavailable_not_zero` / TC-COMP-030 | ADEQUATE | Asserts `is None` rather than falsiness and `!= 0` explicitly, which is the precise distinction DAC-E6-4 and STD-UI-4 require; also asserts the instrument row inherits the identical unavailable object and that `read_gap_dates` returns `None`. `A` genuinely has a hole (01-03), so a zero-returning implementation would be caught. | None. |
| `test_availability_predicate_inside_the_statement_returns_no_rows` / TC-COMP-050 | ADEQUATE | Executes the raw statement, so it tests the SQL rather than the Python short-circuit, and the positive control at a wider `to_date` returns exactly the four rows suppressed by the predicate. This is the only test in the file that could distinguish an in-statement predicate from a Python-side one. | None. |
| `test_gap_detection_applies_to_prices_only` / TC-COMP-031 | ADEQUATE | `A`'s two-year `fundamentals` segment plus `B`'s later bars create the exact conditions under which a missing `data_type` filter yields three spurious gaps for `A`; the test asserts 0 through both surfaces. | None. |
| `test_fundamentals_and_corporate_actions_have_no_gaps_computed` / TC-COMP-051 | ADEQUATE | Distinguishes "not computed" (`None`) from "measured zero" (`0`) for a prices-less instrument, across `detect_gaps`, `InstrumentCoverage.gaps` and `read_gap_dates`. `A`/`B` keep detection available so the `None` is not an artefact of unavailability. | Does not assert `F.gaps.available is True` (the "available follows the view" half of Open Gap 3); minor, the contract's load-bearing half is asserted. |
| `test_market_wide_outage_is_not_claimed` / TC-COMP-032 | ADEQUATE | Both instruments lack the same weekday; asserts detection stays available and both counts are 0, which is the honest answer, and that the date is named nowhere. | Absence asserted via whole-object `repr` (IR-004). |
| `test_day_missing_for_every_instrument_is_no_ones_gap` / TC-COMP-052 | ADEQUATE | Checks the same condition at the `gaps`/`read_gap_dates` level and carries the comment marking it a documented limit rather than a defect, as the plan requires. | None. |
| `test_count_for_collapsed_row_dates_for_expansion` / TC-COMP-053, TC-COMP-040 (backend half) | ADEQUATE | Ties the collapsed count to the expanded dates (`len(dates) == missing_days`) with two gaps, so an off-by-one or a deduplication bug would surface; asserts ascending order. | Field-shape guard weaker than planned (IR-003). |
| `test_gaps_sql_matches_design_verbatim`, `test_design_block_is_actually_read` / T010 | ADEQUATE | Reads the design document itself, not a copy, and the second test proves the extraction found the real block rather than an empty string — the classic failure mode of this guard pattern. Container-free and deterministic. | None. |
| `test_default_range_is_everything_acquired` / T011 | ADEQUATE | A gap in March 2022 is reported on an unbounded read, which is precisely the false negative a trailing-window default would cause; the `from_date=2024-01-01` case then shows the same gap correctly excluded. | None. |
| `test_zero_instruments_with_data_in_range_is_unavailable` / T011 | ADEQUATE | Populated store, explicit range containing no bars: unavailable with reason and `missing_days is None`. Distinguishes "no data in range" from "no gaps". | None. |
| `test_empty_store_is_unavailable` / T011 | ADEQUATE | Correctly asserts only `available is False` and `missing_days is None`, avoiding the reason, per the S1 contradiction the plan documents. | None. |
| `test_inverted_range_raises_value_error` / T011 | ADEQUATE | Pins SEC-INP-001 input validation before any database work. | None. |
| `test_unknown_symbol_raises_instrument_not_found` / T011 | ADEQUATE | Pins the distinction between "unknown instrument" and "no gaps", which an `[]` return would blur. | None. |
| `test_database_failure_propagates` / T011 | ADEQUATE | Closed connection → `psycopg.Error`, proving OPS-ERR-001: a database failure is not rendered as empty coverage. Closing the fixture connection is safe — `conftest.py:183-184` closes it again in `finally` and `close()` is idempotent; the same pattern is used throughout `tests/integration/test_api_runs.py`. | None. |

Determinism and isolation: every test uses the per-test isolated database from
`migrated_writer_connection`, seeds only fixed 2022/2024/2025 dates, and touches
no clock, network or environment. `now()` appears once, in the `_instrument`
helper's `retired_at`, and no assertion reads it. No test depends on another's
state or on collection order. Running the file alone (18 passed) and inside the
full suite (687 passed) gave identical results.

`read_gap_dates`'s `from_date`/`to_date` parameters are the one public path no
test exercises (IR-005).

## Independent Validation

All commands run from a clean tree at `04ac6cc`, working directory
`repos/factorflow-v2/FactorFlow-v2`. A container runtime was available
(`docker info` succeeded), so `postgres`-marked tests were executed rather than
excluded.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 46 packages, checked 43; lockfile unchanged. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `166 files already formatted`. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `All checks passed!`. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `Success: no issues found in 46 source files` under `strict = true`. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `455 passed, 232 deselected` in 13.3s. Includes the T010 drift guard. |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `687 passed` in 200.3s — the full suite including all `postgres`-marked tests. No skips, no xfails. |
| `uv run pytest -m postgres tests/integration/test_coverage_gaps.py tests/unit/test_coverage_gaps_sql_matches_design.py -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `18 passed, 2 deselected`; every story test named individually as PASSED. |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built `factorflow-0.1.0-py3-none-any.whl` and the sdist. |
| `unzip -l dist/factorflow-*.whl \| grep coverage/sql/` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Lists `gaps.sql` (884 B), `gap_range.sql` (839 B), `gap_instrument.sql` (350 B) alongside S1's two files — the T001/T019 packaging checkpoint. |
| `uv run pytest -m postgres tests/integration/test_coverage_gaps.py -k "008 or 028 or 048"` | `repos/factorflow-v2/FactorFlow-v2` | 5 | FAIL | `18 deselected`, no tests ran. Representative of all seven story-specific selector commands in the plan's Validation Plan; see IR-002. Not counted in the required-validation total, for the reason given there. |

### Validation Side Effects

- Before: `git status --porcelain` empty; `HEAD` = `04ac6cc3c2a77b56e89532e17b5a12fec1d38977`.
- After: `git status --porcelain` empty; `HEAD` unchanged.
- Unexpected tracked-file changes: none. `uv build` wrote `dist/` and `build/`,
  both ignored; `uv sync` left `uv.lock` untouched. No command modified a tracked
  file, so constraint 10 did not need to be applied and no validation was
  curtailed.

## Findings

### IR-001 — The view-level `gap_detection.missing_days` aggregation is asserted nowhere

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (owner-confirmed contract, not an AC)
- **Tasks**: T016
- **Files**: `src/factorflow/coverage/service.py:198-204`; `tests/integration/test_coverage_gaps.py`
- **Claim challenged**: T016's requirement that `CoverageView.gap_detection` be `GapDetection(True, None, sum(len(v) for v in result.missing.values()))` when available, i.e. the total across every instrument for the resolved range (the plan's Open Gap 1, confirmed by the owner on 2026-09-29).
- **Observed evidence**: The expression is implemented at `service.py:201`. Searching every test for `gap_detection.missing_days` yields only `is None` and `!= 0` assertions on the *unavailable* path (`test_one_instrument_reports_detection_unavailable_not_zero`, `test_zero_instruments_with_data_in_range_is_unavailable`). On the available path, `test_one_session_missing_for_one_of_three_is_one_gap` and `test_market_wide_outage_is_not_claimed` assert only `available is True` and per-instrument counts. S1's only view-level assertion, `tests/integration/test_coverage_depth.py:102`, is deliberately loose (`in (None, 0)`). Replacing the sum with `0`, with `None`, or with a page-only sum would leave the entire 687-test suite green.
- **Expected evidence/behavior**: At least one assertion on a populated, available read that the view-level `missing_days` equals the total across instruments — for example `view.gap_detection.missing_days == 1` in TC-COMP-008 or `== 2` in TC-COMP-053, ideally with two gap-bearing instruments so a per-instrument or page-only implementation is distinguishable from the total.
- **Impact**: An owner-confirmed field that S3 will expose is unprotected by any test. A regression in it would be invisible until it reached the UI, where a wrong total is exactly the "healthy screen over incomplete data" failure AC-17 and STD-UI-4 exist to prevent.
- **Required remediation**: Add an assertion on the available-path view-level `missing_days` to an existing test in `tests/integration/test_coverage_gaps.py`. No production change is expected.

### IR-002 — The plan's seven story-specific validation commands select no tests

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-8, DAC-E6-2…6, DAC-E6-S2-1…6 (the per-AC validation route, not the criteria themselves)
- **Tasks**: T003–T009, T019
- **Files**: `docs/…/CAP-001-E6-S2-tasks.md:414-422`; `tests/integration/test_coverage_gaps.py`
- **Claim challenged**: The plan's Validation Plan asserts that each AC group is validated by a command of the form `uv run pytest -m postgres tests/integration/test_coverage_gaps.py -k "008 or 028 or 048"`.
- **Observed evidence**: Run as written, that command reports `18 deselected` and exits 5 ("no tests ran"); `--collect-only` confirms `no tests collected`. The same holds for all seven selectors (`-k "029 or 049"`, `"030 or 050"`, `"031 or 051"`, `"032 or 052"`, `-k 053`), because no test function name contains a TC number — traceability is carried in `# Implements TC-COMP-0NN` comments instead.
- **Expected evidence/behavior**: A validation command named by the plan should select and pass the tests it claims to validate. Note that the plan is internally inconsistent here: T002 and T003–T009 explicitly instruct comment-based traceability ("Every test carries a traceability comment such as `# Implements TC-COMP-028`"), which is also the repository's established precedent (`tests/unit/test_fetch_plan.py:62`, `tests/unit/test_migration_0001_matches_design.py`). The implementation followed the normative task instructions; the Validation Plan section contradicts them.
- **Impact**: The plan's per-AC validation gate cannot be executed as documented, so a future reader or CI job wiring those commands up would silently validate nothing and see exit 5. The underlying evidence is not missing — every TC named by those selectors is implemented, carries its comment, and passes (confirmed individually by name in this review) — but it is only reachable by running the whole file.
- **Required remediation**: Reconcile the two, in the plan rather than by rewriting working tests unless the owner prefers otherwise: either replace the `-k` selectors with the equivalent `-k "<test function name> or …"` forms, or state that per-AC validation runs the whole file and traceability is by comment. If the owner prefers selector-based validation, embed TC numbers in the test function names — but that departs from repository precedent and is a plan decision, not a code defect.

### IR-003 — TC-COMP-053's "no date field" guard is weaker than the plan specifies

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S2-6
- **Tasks**: T009
- **Files**: `tests/integration/test_coverage_gaps.py:646`
- **Claim challenged**: T009 requires asserting that `InstrumentCoverage` "has no field holding dates", via `{f.name for f in dataclasses.fields(InstrumentCoverage)}`.
- **Observed evidence**: The test instead asserts `not any("list" in str(field.type) for field in dataclasses.fields(InstrumentCoverage))`. This does fail for a literal `list[date]` field, so it is not inert, but it passes for `tuple[date, ...]`, `Sequence[date]`, `frozenset[date]`, or a type alias, and it inspects the annotation string rather than the field set the task names.
- **Expected evidence/behavior**: The field-set inspection T009 specifies, or an equivalent that is insensitive to how a date collection is spelled.
- **Impact**: The architectural rule "dates live behind expansion only" is guarded against one spelling of a violation. `tests/unit/test_coverage_shapes.py:46-49` independently pins the exact field list, which limits real exposure.
- **Required remediation**: Assert over the field names/types in a form that catches any date collection, or rely explicitly on `test_coverage_shapes.py` and drop the substring check.

### IR-004 — The market-wide-outage negative is asserted through a whole-object `repr`

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-6
- **Tasks**: T008
- **Files**: `tests/integration/test_coverage_gaps.py:611`
- **Claim challenged**: T008's "No response field names 01-03".
- **Observed evidence**: Implemented as `assert repr(D3) not in repr(view)`. The assertion is indirect (it searches a formatted string rather than the fields) and carries no positive control proving `repr(view)` would contain a date at all, so it would also pass if `repr` ever stopped rendering dates.
- **Expected evidence/behavior**: A field-directed assertion, or a companion assertion that a date known to be present (e.g. `repr(D2)`, `B`'s `covered_from`) does appear in the same `repr`, which would prove the check can fail.
- **Impact**: Low. The substantive DAC-E6-6 assertions in the same test (detection stays available, both counts are 0) and `test_day_missing_for_every_instrument_is_no_ones_gap` carry the criterion; this is a belt-and-braces check that is weaker than it looks.
- **Required remediation**: Add the positive control, or assert against the dataclass fields directly.

### IR-005 — `read_gap_dates`'s date-bound parameters are never exercised

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S2-6
- **Tasks**: T017
- **Files**: `src/factorflow/coverage/service.py:210-238`; `tests/integration/test_coverage_gaps.py`
- **Claim challenged**: T017's signature includes `from_date` / `to_date`, which S3's expansion contract will use to keep the expanded dates consistent with the collapsed count for a bounded read.
- **Observed evidence**: Every call in the test file passes symbol only. Bounds are exercised on `detect_gaps` (TC-COMP-050, `test_zero_instruments_with_data_in_range_is_unavailable`) and on `read_coverage` (`test_default_range_is_everything_acquired`), but never through `read_gap_dates`.
- **Expected evidence/behavior**: One assertion that `read_gap_dates(conn, symbol, from_date=…, to_date=…)` narrows the returned dates consistently with `read_coverage`'s count for the same bounds.
- **Impact**: Low — the parameters are a direct pass-through to the tested `detect_gaps` — but the count/dates consistency that DAC-E6-S2-6 rests on is only demonstrated for the unbounded case, and S3 will call this with bounds.
- **Required remediation**: Extend `test_default_range_is_everything_acquired` (which already seeds a suitable two-era dataset) with a bounded `read_gap_dates` assertion.

### IR-006 — `# type: ignore[arg-type]` in the `_rows` test helper hides a real signature mismatch

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T002
- **Files**: `tests/integration/test_coverage_gaps.py:420-421`
- **Claim challenged**: General code quality of the changed test code.
- **Observed evidence**: `def _rows(conn, **bounds: date)` forwards `**bounds` into `read_coverage`, whose other keyword parameters are not `date`-typed, so the call needs a blanket `# type: ignore[arg-type]`. Because the constitution's type-check command is `uv run mypy src`, tests are unchecked and the suppression is invisible to validation.
- **Expected evidence/behavior**: Explicit `from_date` / `to_date` keyword parameters on the helper, which removes the need for the suppression.
- **Impact**: Cosmetic. No behaviour is affected and no other suppression was introduced.
- **Required remediation**: Give `_rows` explicit optional `from_date` / `to_date` parameters and drop the `type: ignore`.

## Previous Review Disposition

Not applicable — initial review. (Two prior reports exist in this directory,
`CAP-001-E6-S1-implementation-review-v1.md` and `-v2.md`, but they review
CAP-001-E6-S1 and carry no findings against this story. No
`CAP-001-E6-S2-implementation-review-v*.md` existed before this one.)

## Scope and Plan Deviations

- **T001 correctly performed no action.** `[tool.setuptools.package-data]` was
  already present at the review base, which is the condition the task names for
  skipping it. The checkbox is marked complete; the honest classification is NOT
  APPLICABLE, and the task's purpose is independently verified by the wheel
  listing. Not a finding — flagged only so the bookkeeping is not mistaken for
  evidence of an edit.
- **T016's never-acquired branch was touched, cosmetically.** T016 says "Leave
  S1's never-acquired short-circuit … untouched", and the branch at
  `service.py:157-162` was rewritten from an inline
  `GapDetection(available=False, reason=UNAVAILABLE_REASON, missing_days=None)`
  to the new module-level `_UNAVAILABLE` constant. The value is field-for-field
  identical and `test_coverage_empty.py:54-57` (S1's test, unmodified) still
  passes, so behaviour is unchanged. Justified: it is the same
  single-definition de-duplication T015 mandates for `UNAVAILABLE_REASON`, and
  leaving two copies of the literal would invite drift.
- **`UNAVAILABLE_REASON` is re-exported** from `service.py` as
  `from factorflow.coverage.gaps import UNAVAILABLE_REASON as UNAVAILABLE_REASON`.
  This is scope-justified: T015 requires the single definition to move to
  `gaps.py`, and the redundant-alias form preserves the existing public name for
  S1's consumers under `mypy --strict`'s re-export rules. Import direction is
  `service → gaps` only, as T015 requires; no cycle.
- **`coverage.sql` was not modified.** T016's instruction to add
  `i.instrument_id` was conditional; the column was already selected. Correctly
  skipped.
- **Story frontmatter `status: planning` → `in-review`** is the expected coding
  lifecycle bookkeeping. The story's content revision digest is unchanged
  (`sha256:5e4c67e6…`), still matching the approved `reviewed_revision`, so no
  approved content was altered.
- **Task-plan edits are checkbox flips only** — 19 `[ ]`→`[x]`, no prose, no
  traceability-table or validation-command changes. Each flip is corroborated
  above; no checked task lacks evidence and no unchecked task appears
  implemented.
- **No scope leakage.** Every changed file maps to a task, and no dependency,
  configuration, migration, API route or unrelated refactor was introduced. The
  known accepted costs — running the unmodified statement once per request
  rather than per page (plan "Other Notes", Open Gap 5) and the non-overlapping-
  ranges limit of a single availability predicate (Open Gap 2) — are documented
  in the plan and honoured in the code, not silently worked around.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to documentation synchronisation for
  CAP-001-E6-S2. Carry IR-001 through IR-006 forward as accepted warnings; they
  are test-strength and plan-evidence improvements, not blockers, and none
  requires a production-code change. IR-002 should be resolved in the task plan
  (or by owner decision on test naming) rather than by rewriting passing tests.
- **Warnings accepted downstream**: IR-001, IR-002 (MEDIUM); IR-003, IR-004,
  IR-005, IR-006 (LOW)
