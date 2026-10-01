---
artifact_schema_version: 1
artifact_id: CAP-001-E6-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-30
updated: 2026-09-30
story_id: "CAP-001-E6-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-30T03:41:56Z"
reviewed_head: "216d6686b6284112f748a0604235442325589623"
review_base: "70bb73d418c88d9414f86d40d95e0d358cd7a2f6"
reviewed_state_revision: "sha256:4fb83b8e23e80448665682256af3e458ce052e825f60553050f5c4b8e66d20b6"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E6-S1
    artifact_version: 1
    content_revision: sha256:3f2aa14781ca21b6cafb0f1e40636639d3d51535d305c17b950f47b6e74d620c
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Windsurf
  tool_version: unknown
  timestamp: 2026-09-30T03:41:56Z
  source_artifacts:
    - id: CAP-001-E6-S1
      version: "1"
    - id: CAP-001-E6-S1-tasks
      version: "1"
    - id: CAP-001-component-design-coverage-service
      version: "6"
    - id: CAP-001-E6-S1-implementation-review
      version: "1"
  invoking_user: alvarodejodra
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E6-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 10/10 passed |

The v1 blocking finding is genuinely closed. DAC-E6-S1-7's date bounds now have
real test evidence at both scales: `test_date_bounds_select_overlapping_segments`
(`tests/integration/test_coverage_reads.py:228-271`) exercises five bound
combinations — unbounded, both bounds, `to_date` only, `from_date` only, and a
`from_date` past every segment — and asserts the full per-instrument range
dictionary by equality, including the two exclusion cases where the range
collapses to `(None, None)`. `test_paging_and_filters_at_3000_instruments`
(`test_coverage_volume.py:97-103`) adds the at-scale half: a bound inside the
seeded year returns all 3000 instruments with their full range, and a bound past
it returns all 3000 with `(None, None)`, which also pins that the bounds narrow
the reported range rather than filtering instruments out of the page. Deleting
either date predicate from `coverage.sql` now fails both tests.

The v1 MEDIUM findings are also closed with current repository evidence, not
assertions. `presence` and `depth_shortfall_years` are now derived from the new
unbounded `acquired_from`/`acquired_to` aggregates (`coverage.sql:21-22`,
`service.py:195, 206-216`) rather than from the window-filtered range, per the
recorded decision DEC-0003, and
`test_date_bounds_do_not_change_presence_or_depth_shortfall` is load-bearing on
that change: with a stated depth of 5 years and a one-month window, the pre-rework
code would have reported `depth_shortfall_years == 5` and
`presence["fundamentals"] is Presence.ABSENT`, both of which the test now forbids.
TC-COMP-045's run-intent half now arranges a `run_instrument_result` row for
`DDD` with `completed_at` later than every `acquisition_state` timestamp in the
fixture, so the `last_acquired_at is None` assertion discriminates.

Every required validation command was rerun independently and every one exits 0,
including the full `postgres`-marked suite against a real PostgreSQL container
(214 passed, up from 211 at v1 by exactly the three new tests). No finding is
blocking. The three warnings concern the coherence of the bounded response
(IR-001), the resolvability and owner review of DEC-0003 (IR-002), and the
carried-over `LIKE` metacharacter item the v1 report already declared optional
(IR-003).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S1-tasks.md` |
| Component | `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E6-S1-run-20260930T025827Z` |
| HEAD | `216d6686b6284112f748a0604235442325589623` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E6-integration-20260930T025827Z` @ `70bb73d418c88d9414f86d40d95e0d358cd7a2f6` (verified ancestor of HEAD via `git merge-base --is-ancestor`) |
| Working tree | clean — `git status --porcelain` empty before and after all validation; no staged, unstaged or untracked non-ignored file |
| Changed files reviewed | 14 |

Three commits separate base from HEAD:

- `4d7473d feat(CAP-001-E6-S1): derive coverage at read time from written rows` (original coding)
- `0e0cbda review(CAP-001-E6-S1): adversarial review v1 - CHANGES-REQUIRED` (the v1 report)
- `216d668 fix(CAP-001-E6-S1): story-coding rework for implementation review v1`

The rework commit touches 5 files (+158/−16): `service.py`, `coverage.sql`,
`test_coverage_reads.py`, `test_coverage_volume.py` and the tasks frontmatter.
It adds no new file and deletes none.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../stories/CAP-001-E6-S1.md` | modified | Bookkeeping: `status: in-progress` → `in-review`. No AC or technical detail altered (`git diff 70bb73d..HEAD` on this path is the single frontmatter line). |
| `docs/.../stories/CAP-001-E6-S1-tasks.md` | modified | Bookkeeping: T001–T015 ticked; rework added `updated: 2026-09-30` and `last_reworked_review: CAP-001-E6-S1-implementation-review-v1.md`. No task body text altered by either commit. |
| `docs/.../stories/CAP-001-E6-S1-implementation-review-v1.md` | added | The v1 gate report, committed by the review driver. |
| `pyproject.toml` | modified | T002 — `[tool.setuptools.package-data] factorflow = ["coverage/sql/*.sql"]`; nothing else in the file touched. Unchanged by the rework. |
| `src/factorflow/coverage/__init__.py` | added | T001 (empty module marker) |
| `src/factorflow/coverage/service.py` | added; modified by rework | T012, T014; rework: cursor normalisation (v1/IR-005), unbounded presence/shortfall (v1/IR-002 + DEC-0003), lookahead docstring (v1/IR-004) |
| `src/factorflow/coverage/sql/coverage.sql` | added; modified by rework | T010; rework: `acquired_from`/`acquired_to` aggregates alongside the bound-filtered range |
| `src/factorflow/coverage/sql/never_acquired.sql` | added | T011. Unchanged by the rework. |
| `tests/integration/test_coverage_reads.py` | added; modified by rework | T003; rework: `test_date_bounds_select_overlapping_segments`, `test_date_bounds_do_not_change_presence_or_depth_shortfall`, `test_cursor_is_normalised_like_the_symbol_filter`, and the `run_instrument_result` arrangement |
| `tests/integration/test_coverage_empty.py` | added | T004. Unchanged by the rework. |
| `tests/unit/test_coverage_shapes.py` | added | T005, T009. Unchanged by the rework. |
| `tests/integration/test_coverage_retired.py` | added | T006. Unchanged by the rework. |
| `tests/integration/test_coverage_depth.py` | added | T007. Unchanged by the rework. |
| `tests/integration/test_coverage_volume.py` | added; modified by rework | T008; rework: `_all_ranges` helper and the two at-scale date-bound assertions |

No unjustified file appears in the change set. The S2/S3/S4 boundaries the plan
draws are still respected: `git ls-files` shows no `src/factorflow/coverage/gaps.py`,
no `gaps.sql`, no `read_gap_dates` symbol, no `tests/integration/test_coverage_gaps.py`,
no HTTP route and no frontend file. `pyproject.toml` remains the only
configuration change and adds no dependency; `uv.lock` is untouched.
`dependencies.yaml` is untouched and already carries the `CAP-001-E6-S1`
edge set the plan requires.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `coverage.sql:33-52` (one row per instrument × data type, segment MIN/MAX, `acquisition_state`); `service.py:187-218` `_instrument_coverage` | `test_coverage_reads.py::test_coverage_reflects_written_rows_only`, `::test_presence_reports_each_data_type`, `::test_last_acquired_includes_failed_attempts_and_ignores_run_intent` | Presence, range and last-acquired reported per instrument; all three come from written rows. |
| AC-12 | SATISFIED | `coverage.sql` reads only `instrument`, `coverage_segment`, `acquisition_state`; `never_acquired.sql` reads only observation tables; `service.py` issues no DML | `test_coverage_reads.py::test_rolled_back_partial_write_leaves_no_coverage` | A committed sibling instrument keeps the page non-empty so the rollback assertions are reached; `covered_from is None`, `last_acquired_at is None` and all-`UNKNOWN` presence are all asserted. Reconfirmed after the rework: the new `acquired_from` aggregate reads the same rolled-back table, so nothing survives a rollback through it. |
| AC-17 | SATISFIED | `service.py:139-151` short-circuits on `never_acquired.sql` before the filtered query and before `read_history_depth` | `test_coverage_empty.py::test_empty_store_reports_never_acquired`, `::test_non_matching_filter_on_populated_store_is_not_never_acquired` | `missing_days is None` asserted by identity, not falsiness. |
| AC-21 | SATISFIED | `coverage.sql:7-14` — no default lifecycle predicate on `instrument` | `test_coverage_retired.py::test_retired_instrument_keeps_coverage_and_is_marked` | Retired row appears with `lifecycle == "retired"` and its retained range. |
| DAC-E2-6 | SATISFIED | as AC-21 | `test_coverage_retired.py` asserts both symbols appear and that the two lifecycles differ | Distinguished, not omitted. |
| DAC-E6-1 | SATISFIED | No persisted summary exists anywhere in the change set; every field is assembled per call in `read_coverage` | `test_coverage_reads.py::test_coverage_reflects_written_rows_only`; `test_coverage_depth.py::test_shortfall_reported_against_stated_depth` (raising the depth between two reads changes the answer, proving nothing is cached) | — |
| DAC-E6-7 | SATISFIED | `never_acquired.sql` checks `daily_bar`, `fundamental_observation`, `corporate_action` and `instrument_reference` | `test_coverage_empty.py::test_registered_instruments_without_observations_are_never_acquired`, `::test_any_observation_type_counts_as_acquired` | The fundamentals-only store would defeat a `daily_bar`-only check. |
| DAC-E6-S1-1 | SATISFIED | `service.py:194-201` three-way rule now keyed on the unbounded `acquired_from`; `coverage.sql:44-45` `CROSS JOIN (VALUES …)` guarantees a row per data type, so `by_type[data_type]` cannot raise | `test_coverage_shapes.py::test_presence_has_exactly_three_states`; `test_coverage_reads.py::test_presence_reports_each_data_type` (full dict equality, one PRESENT, one ABSENT, two UNKNOWN); `::test_date_bounds_do_not_change_presence_or_depth_shortfall` (a data type held only outside the window is still PRESENT) | Upgraded from v1: presence is now a property of acquisition, not of the query. |
| DAC-E6-S1-2 | SATISFIED | `never_acquired.sql` is a separate statement executed independently of and before `coverage.sql` (`service.py:140` vs `:156`) | `test_coverage_empty.py::test_non_matching_filter_on_populated_store_is_not_never_acquired` | — |
| DAC-E6-S1-3 | SATISFIED | `service.py:77-87` `_depth_shortfall_years` (ceiling rule, Open Gap 1) fed from `acquired_from`/`acquired_to` at `:216` | `test_coverage_depth.py::test_shortfall_reported_against_stated_depth`, `::test_no_stated_depth_reports_no_shortfall`; `test_coverage_shapes.py::test_depth_shortfall_years` (5 cases); `test_coverage_reads.py::test_date_bounds_do_not_change_presence_or_depth_shortfall` | `None` never degrades to `0`; asserted with `is None`. The shortfall now measures acquisition against the stated depth regardless of the requested window (DEC-0003). See IR-001 for the coherence warning. |
| DAC-E6-S1-4 | SATISFIED | as AC-21; `lifecycle` carried from `coverage.sql:35` into `InstrumentCoverage.lifecycle` | `test_coverage_retired.py` | — |
| DAC-E6-S1-5 | SATISFIED | `service.py:202-203, 215` — `max()` over `acquisition_state.last_acquired_at` only; `coverage.sql` joins neither `acquisition_run` nor `run_instrument_result` (verified by reading the whole 52-line statement) | `test_coverage_reads.py::test_last_acquired_includes_failed_attempts_and_ignores_run_intent` | Both halves now discriminate: a `failed` state at 2024-02-01 beats a `written` state at 2024-01-03, and `DDD` carries a `run_instrument_result` row at 2024-03-01 with no `acquisition_state` row yet still reports `None`. |
| DAC-E6-S1-6 | SATISFIED | Covered range comes from `coverage_segment`, never from the stated depth; the shortfall surfaces through `depth_shortfall_years` | `test_coverage_depth.py::test_uniform_plan_cap_is_a_short_range_not_a_gap` | The covered-range half this story owns is proven. The gap-count half legitimately awaits CAP-001-E6-S2 (plan Open Gap 6); `missing_days in (None, 0)` still passes vacuously today, which the plan records openly. |
| DAC-E6-S1-7 | SATISFIED | `coverage.sql:10-14` symbol prefix, lifecycle, cursor keyset, `LIMIT`; `:19-27` date bounds; `service.py:156-177` including the lookahead cursor | Symbol/lifecycle: `test_coverage_reads.py::test_symbol_and_lifecycle_filters`. Paging: `::test_cursor_paging_returns_every_instrument_once`, `::test_cursor_is_normalised_like_the_symbol_filter`. **Date bounds: `::test_date_bounds_select_overlapping_segments` (5 bound combinations, full dict equality).** At 3000: `test_coverage_volume.py::test_paging_and_filters_at_3000_instruments` now covers all four features — 60 pages ascending with each symbol once, prefix subset, lifecycle subset, and two date-bound reads. | Upgraded from PARTIAL at v1. All four named features have production and test evidence. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/coverage/__init__.py` (0 bytes) | No `.gitkeep`, as specified. |
| T002 | complete | VERIFIED | `pyproject.toml:32-33` | Verified functionally, not textually: `uv build` then `unzip -l dist/factorflow-0.1.0-py3-none-any.whl` lists both `.sql` files. |
| T003 | complete | VERIFIED | `tests/integration/test_coverage_reads.py` (10 test functions, 13 cases) | Every bullet the task enumerates is now present *including* the "Filters and bounds" bullet's date half, which was the v1 gap. The run-intent arrangement matches the task text as corrected by v1/IR-003. |
| T004 | complete | VERIFIED | `tests/integration/test_coverage_empty.py` (4 tests) | All four bullets, including the explicit `missing_days is None`. Untouched by the rework and still passing. |
| T005 | complete | VERIFIED | `tests/unit/test_coverage_shapes.py:24-70` | Field names *and order* asserted as lists against design 2.4 for all three dataclasses; frozen-ness and `StrEnum` asserted. |
| T006 | complete | VERIFIED | `tests/integration/test_coverage_retired.py` | — |
| T007 | complete | VERIFIED | `tests/integration/test_coverage_depth.py` (3 tests) | Includes the raise-the-depth case and the no-stated-depth case. Placed outside the S2-owned `test_coverage_gaps.py`, as the task directs. |
| T008 | complete | VERIFIED | `tests/integration/test_coverage_volume.py` | Marked `postgres` and `slow`; set-based `INSERT … SELECT generate_series(…)` seeding; no elapsed-time assertion. Date bounds now exercised at 3000 instruments (`:97-103`). |
| T009 | complete | VERIFIED | `tests/unit/test_coverage_shapes.py:73-97` | Five rounding cases plus `UNAVAILABLE_REASON`, imported from `factorflow.coverage.service`. |
| T010 | complete | VERIFIED | `src/factorflow/coverage/sql/coverage.sql` | Bound parameters only; no DML; `instrument_id` selected for S2. Deviation: the statement now computes both a bound-filtered range and an unbounded one rather than "segments overlapping the bounds only". Justified and recorded in the file header (`:3-5`) and in DEC-0003; the task's bounded range is preserved for `covered_from`/`covered_to`. |
| T011 | complete | VERIFIED | `src/factorflow/coverage/sql/never_acquired.sql` | Matches the specified statement; kept a separate file. |
| T012 | complete | VERIFIED | `src/factorflow/coverage/service.py` | Dataclasses, `UNAVAILABLE_REASON`, import-time SQL load, `read_history_depth` import, the three validations, the never-acquired short-circuit carrying `UNAVAILABLE_REASON`, the `_NOT_COMPUTED` placeholder in both places, and no `read_gap_dates`/`gaps.py`. Two recorded deviations, both now documented in the docstring (`:107-118`): the `limit + 1` lookahead cursor, and presence/shortfall computed from every segment per DEC-0003. |
| T013 | complete | VERIFIED | Reproduced independently at this HEAD: `uv run python -c "from factorflow.coverage.service import read_coverage, CoverageView"` → `IMPORT_OK`; `uv build` exit 0; `unzip -l` lists both `.sql` files | `src/factorflow/__init__.py` unchanged, as expected. |
| T014 | complete | VERIFIED | `service.py:1-16` (module docstring citing 2.2, 2.4, 2.5 and every AC) and `:100-131` (`read_coverage` docstring carrying the three Open-Gap choices plus both rework deviations) | — |
| T015 | complete | VERIFIED | All five named commands rerun independently below; all exit 0 | — |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_coverage_reflects_written_rows_only` / TC-COMP-007, TC-COMP-027 | ADEQUATE | `AAA` holds bars but no segment and reports `covered_from is None`; `BBB` holds both and reports exactly 2024-01-02..2024-01-05. Deriving the range from bars rather than segments fails on `AAA`. | none |
| `test_presence_reports_each_data_type` / TC-COMP-007, TC-COMP-041 | ADEQUATE | Full dict equality, so a missing key or wrong third state fails. Distinguishes ABSENT (state row, no segment) from UNKNOWN (neither). | none |
| `test_last_acquired_includes_failed_attempts_and_ignores_run_intent` / TC-COMP-045 | ADEQUATE (was ADEQUATE with a vacuous half at v1) | A `failed` state at 2024-02-01 beats a `written` state at 2024-01-03, so filtering on `last_outcome='written'` fails. `DDD` now holds a `run_instrument_result` row (`outcome='written'`, `completed_at` 2024-03-01, the latest timestamp in the fixture) and no `acquisition_state` row, so the `last_acquired_at is None` assertion would fail if the read ever consulted per-instrument run intent. | none |
| `test_rolled_back_partial_write_leaves_no_coverage` / TC-COMP-012 | ADEQUATE | Real `rollback()` on the same connection; a committed sibling keeps the page non-empty so the assertions are reached. | none |
| `test_symbol_and_lifecycle_filters` | ADEQUATE | Exact list equality (`["AAL", "AAPL"]`) plus `(symbol, lifecycle)` tuple equality for the retired read — a no-op filter fails. | none |
| `test_cursor_paging_returns_every_instrument_once` | ADEQUATE | Page sizes `[2, 2, 1]` and the flattened sequence both asserted; the loop terminates on `next_cursor is None`, so a cursor that never clears hangs or duplicates. | none |
| `test_cursor_is_normalised_like_the_symbol_filter` | ADEQUATE | `cursor=" aaa "` must return `["BBB", "CCC"]`. Without `normalise`, `' aaa ' > 'AAA'` in the C collation the keyset uses, so the raw-cursor implementation returns a different set and the test fails. Directly pins the v1/IR-005 fix. | none |
| `test_date_bounds_select_overlapping_segments` | ADEQUATE | Five reads over three instruments with four segments, each asserted as a whole `{symbol: (from, to)}` dict: unbounded gives each instrument's full span; a 2024 window drops `CCC` to `(None, None)` and narrows `AAA` from 2020-01-02 to 2024-01-02; a `to_date`-only read drops `BBB`; a `from_date`-only read on a boundary date (`2020-12-31`, equal to a `covered_to`) keeps every row, pinning the inclusive `>=` comparison; a `from_date` past every segment collapses all three. Removing either predicate, or flipping a comparison, fails at least two of the five assertions. Instruments are never filtered out — only their ranges collapse — which is the contract S3 will expose. | none |
| `test_date_bounds_do_not_change_presence_or_depth_shortfall` | ADEQUATE | Stated depth 5 years; `AAA` holds prices 2015-01-02..2019-12-31 and 2024-01-02..2024-01-31 plus a fundamentals segment in 2016 with a `written` state. A one-month 2024 window must still report `depth_shortfall_years is None` and `presence["fundamentals"] is Presence.PRESENT`, while `covered_from/covered_to` narrow to January 2024. I traced the pre-rework code against this fixture: it would have produced shortfall `5` (30 covered days against 1825) and `ABSENT` fundamentals, so both assertions fail on the old implementation. The test is the regression guard for DEC-0003. | Does not assert the converse case — an instrument genuinely short of the depth still reporting its shortfall under a *narrow* window. `test_coverage_depth.py` covers the shortfall unbounded, so the rule is pinned from one side only. Non-blocking. |
| `test_invalid_input_raises_value_error` | ADEQUATE | Four parametrised cases: reversed dates, unknown lifecycle, `limit=0`, `limit=501`. | Asserts the exception type only, not the message. |
| `test_database_error_propagates` | ADEQUATE | Closes the connection and asserts a `psycopg.Error` subclass rather than an empty view (OPS-ERR-001, design §4). Fixture teardown `close()` is idempotent, so no order dependence. | none |
| `test_empty_store_reports_never_acquired` / TC-COMP-017, TC-COMP-042 | ADEQUATE | Full `GapDetection` equality plus a separate `missing_days is None` identity assertion, so a zero cannot slip through. | none |
| `test_registered_instruments_without_observations_are_never_acquired` / TC-COMP-033 | ADEQUATE | Instruments alone are not observations. | none |
| `test_non_matching_filter_on_populated_store_is_not_never_acquired` / TC-COMP-017, TC-COMP-042 | ADEQUATE | The test that fails if the two queries are ever conflated. | none |
| `test_any_observation_type_counts_as_acquired` / TC-COMP-033 | ADEQUATE | Fundamentals-only store; defeats a `daily_bar`-only existence check. | none |
| `test_retired_instrument_keeps_coverage_and_is_marked` / TC-COMP-021, TC-COMP-034, TC-COMP-044, TC-COMP-104 | ADEQUATE | Both instruments present, lifecycle values and the retired retained range all asserted. | none |
| `test_shortfall_reported_against_stated_depth` / TC-COMP-035, TC-COMP-043 | ADEQUATE | 3-of-5 → `2`, 5-of-5 → `None`, then raising the depth to 6 flips `BBB` to `1`; the re-read proves the value is derived per read. | none |
| `test_no_stated_depth_reports_no_shortfall` / TC-COMP-043 | ADEQUATE | Guards the `stated_years is None` branch. | none |
| `test_uniform_plan_cap_is_a_short_range_not_a_gap` / TC-COMP-038, TC-COMP-046 (covered-range half) | ADEQUATE for the declared half | `covered_from` equals the uniform start on all three rows and each carries shortfall `5`. | `missing_days in (None, 0)` still passes vacuously before S2; recorded by the plan (Open Gap 6). |
| `test_shapes_are_frozen_with_design_fields`, `test_presence_has_exactly_three_states`, `test_depth_met_carries_none_not_zero` / TC-COMP-037, TC-COMP-041 | ADEQUATE | Field order asserted as a list, so a reordered dataclass fails; `StrEnum` subclassing and the exact three values asserted. | none |
| `test_depth_shortfall_years` (5 cases), `test_unavailable_reason_constant` | ADEQUATE | Below, at, above, no-depth and no-coverage; the reason constant pinned by value. | none |
| `test_paging_and_filters_at_3000_instruments` / TC-COMP-036, TC-COMP-047 | ADEQUATE (was WEAK at v1) | All four features the TC names are now asserted at 3000 instruments: 60 pages with the full ascending symbol sequence, the `S1` prefix subset, the retired subset, and two date-bound sweeps collected over every page — one inside the seeded year returning the full range for all 3000, one past it returning `(None, None)` for all 3000. Both sweeps assert `list(...) == expected`, so a bound that silently dropped instruments from the page would fail. Deterministic: fixed symbols, no randomness, no wall-clock dependence. | No elapsed-time bound, as the plan requires (Open Gap 4). |

Mocks and fixtures: no new test uses a mock. Every integration test runs against
a real PostgreSQL container in an isolated per-test database through the existing
`migrated_writer_connection` fixture; no fixture was added, as the plan required.
Seeding uses module-local direct-INSERT helpers, matching the
`test_writer_coverage.py` precedent. No test depends on wall-clock time, ordering
or network access. I confirmed the two new `test_coverage_reads.py` tests seed
their own instruments and commit before reading, so they are order-independent
within the module.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-001-E6-integration-20260930T025827Z` | harness root | 0 | PASS | `70bb73d418c88d9414f86d40d95e0d358cd7a2f6`; no default-branch fallback used |
| `uv run pytest tests/unit/test_coverage_shapes.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `11 passed in 0.07s` — narrowest story scope, run first |
| `uv run pytest -m postgres tests/integration/test_coverage_reads.py tests/integration/test_coverage_empty.py tests/integration/test_coverage_retired.py tests/integration/test_coverage_depth.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `22 passed in 3.31s` (19 at v1; +3 new `test_coverage_reads.py` cases) |
| `uv run pytest -m postgres tests/integration/test_coverage_volume.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `1 passed in 6.49s` (6.71s at v1 — the added date-bound sweeps and the restructured `segment` CTE cost nothing measurable) |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `163 files already formatted` |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `All checks passed!` |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `Success: no issues found in 45 source files` (strict per `pyproject.toml`) |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `453 passed, 214 deselected in 13.25s` |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `214 passed, 453 deselected in 144.71s` — the full container suite, not a narrowed substitute. `docker info` succeeded, so no exclusion applies. Exactly +3 over v1's 211, matching the three added tests; no pre-existing test regressed. |
| `uv build` + `unzip -l dist/factorflow-0.1.0-py3-none-any.whl \| grep coverage/sql/` + `uv run python -c "from factorflow.coverage.service import read_coverage, CoverageView"` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Wheel carries `factorflow/coverage/sql/coverage.sql` (2100 B) and `never_acquired.sql` (380 B); import prints `IMPORT_OK`. Confirms T002 and T013. |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Not required for review evidence: the `.venv` is already resolved and every `uv run` above resolves that same environment. Running it would add no evidence and risks mutating `uv.lock`. |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | No frontend file is in the change set; this story adds no TypeScript, route or UI (the Coverage screen is CAP-001-E6-S4). The task plan's Validation Plan lists the Python commands only. |

### Validation Side Effects

- Before: `git status --porcelain` empty. `dist/` already contained a previously
  built wheel (git-ignored).
- After: `git status --porcelain` empty. `uv build` rewrote
  `dist/factorflow-0.1.0-py3-none-any.whl` and `dist/factorflow-0.1.0.tar.gz`,
  and setuptools created and removed `build/` intermediates. All are git-ignored.
- Unexpected tracked-file changes: none. No mutation-producing validation had to
  be stopped, and no review-relevant file was created or modified by validation.
- Test databases are created and dropped inside the session container by
  `tests/conftest.py`; no state escapes the container.

## Findings

### IR-001 — A bounded read mixes window-scoped and acquisition-scoped fields in one row

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S1-3, DAC-E6-S1-6, DAC-E6-S1-7 (interaction)
- **Tasks**: T010, T012
- **Files**: `src/factorflow/coverage/sql/coverage.sql:16-32`; `src/factorflow/coverage/service.py:206-217`; `tests/integration/test_coverage_reads.py:274-297`; `projects/factorflow-v2/decisions/DEC-0003.md` (harness repository)
- **Claim challenged**: DEC-0003's resolution of v1/IR-002 — that `from_date`/`to_date` narrow `covered_from`/`covered_to` while `presence` and `depth_shortfall_years` ignore them.
- **Observed evidence**: The decision is implemented faithfully and tested. `test_date_bounds_do_not_change_presence_or_depth_shortfall` asserts, as the intended behaviour, a single `InstrumentCoverage` whose `covered_from`/`covered_to` is 2024-01-02..2024-01-31 — 30 days — and whose `depth_shortfall_years` is `None` against a stated depth of 5 years. The row therefore reports a range roughly 60× shorter than the stated depth while carrying no shortfall marker, and a `presence` of `PRESENT` for a data type whose only segment (2016-03-31) lies outside the reported range.
- **Expected evidence/behavior**: `component-design-coverage-service.md` §3 makes the covered range the mechanism by which the shortfall is communicated: "The response already carries the covered range per instrument rather than the stated depth, which is what keeps the shortfall visible to the owner as a shorter range instead of as a gap count." That linkage holds only while the range and the shortfall are measured over the same segments. No artifact states which of the two should yield when a date bound is supplied; DEC-0003 chose, as an agent decision with `owner_reviewed: false`, to keep the range bounded and the shortfall unbounded, and it did not amend §3 or the task plan it names in `artifacts`.
- **Impact**: CAP-001-E6-S3 passes `from_date`/`to_date` through from HTTP query parameters and CAP-001-E6-S4 renders the Depth column and the covered range from the same row, so a filtered Coverage screen will show a short range with no Depth marker and a `coverage-present` badge for a type with no data inside the visible range. This is not the v1/IR-002 failure (which was the more damaging inverse) and no acceptance criterion is violated, but the response's internal consistency on a bounded read is now undefined by the specifications rather than decided by them, and it is the S3/S4 rendering contract.
- **Required remediation**: Have the owner review DEC-0003 (it lists CAP-001-E6-S2/S3/S4 under `blocks`) and absorb the outcome into `component-design-coverage-service.md` §2.4/§3 so S3 and S4 inherit a stated rule rather than an inferred one. If the current split stands, add the converse test case — an instrument genuinely short of the stated depth still reporting its shortfall under a narrow window — so the rule is pinned from both sides. No change to this story's production code is required.

### IR-002 — DEC-0003 is cited from three component files but is untracked, unreviewed, and unresolvable inside the component repository

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (evidence quality)
- **Tasks**: T010, T012, T014
- **Files**: `src/factorflow/coverage/sql/coverage.sql:5`; `src/factorflow/coverage/service.py:117`; `tests/integration/test_coverage_reads.py:11`; `/Users/alvarodejodra/Projects/ai-agents/projects/factorflow-v2/decisions/DEC-0003.md`
- **Claim challenged**: That the behavioural change answering v1/IR-002 rests on a durable, resolvable, recorded decision.
- **Observed evidence**: `grep -rn "DEC-0003"` in `FactorFlow-v2` returns three citations in shipped source and test files. The record itself exists only at `projects/factorflow-v2/decisions/DEC-0003.md` in the separate harness repository, where `git status --porcelain` reports it as `?? projects/factorflow-v2/decisions/DEC-0003.md` — untracked, so it lives in one working tree only. Its frontmatter carries `decided_by: agent`, `owner_reviewed: false`, `owner_verdict: null`, `status: open`, `propagated_after: null`, and lists `CAP-001-E6-S1-tasks.md` and `component-design-coverage-service.md` under `artifacts`; neither has been amended. The recording itself satisfies `docs/unattended-mode.md` — the decision was not taken silently — and its derivation from design §2.4 and §11 AC 7 is sound.
- **Expected evidence/behavior**: A normative decision that changes shipped behaviour and gates three downstream stories should be reachable from the repository that cites it, and should survive version control. Specification review v5 (`specifications-review-report-v5.md`, FINDING-1) and the CAP-001-E3-S1/E3-S4 reviews raised the identical defect for DEC-0001 and DEC-0002; this is the third instance of the same pattern.
- **Impact**: A reader of `coverage.sql` or `service.py` cannot resolve the citation, and an uncommitted record can be lost, which would leave the unbounded presence/shortfall behaviour with no rationale at all. No runtime or test consequence.
- **Required remediation**: Commit `DEC-0003.md` in the harness repository, obtain the owner review it is waiting on, and absorb the outcome into the two artifacts it names (which also discharges IR-001). Owner and doc-sync scope; no component code change.

### IR-003 — `LIKE` metacharacters in the symbol prefix are still unescaped (carried from v1/IR-006)

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S1-7
- **Tasks**: T010
- **Files**: `src/factorflow/coverage/sql/coverage.sql:10`; compare `src/factorflow/instruments/service.py`
- **Claim challenged**: Design §4's input-validation posture (SEC-INP-001) for the instrument filter.
- **Observed evidence**: Unchanged by the rework. The prefix is a bound parameter concatenated with `'%%'`, so there is no injection (SEC-INP-002 holds), but `_` and `%` inside the supplied prefix remain `LIKE` wildcards, so `A_L` matches `AAL`. The value is not shape-validated with `symbols.is_valid` before use.
- **Expected evidence/behavior**: `list_instruments` has the identical property, so this is a pre-existing repository pattern that the plan explicitly directed following, not a regression introduced here. The v1 report classified remediation as optional and the rework commit message records the deliberate deferral to a separate shared-helper change.
- **Impact**: A filter can match more symbols than the owner intended on a read-only path. No security or data-integrity consequence.
- **Required remediation**: Optional and out of this story's scope. If addressed, prefer one shared prefix-escaping helper used by both `list_instruments` and `read_coverage`, as its own change.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) — date bounds on a coverage read have no test at all | **RESOLVED** | `tests/integration/test_coverage_reads.py:228-271` `test_date_bounds_select_overlapping_segments` asserts five bound combinations by full dict equality, including two exclusion cases and the inclusive `from_date == covered_to` boundary; `tests/integration/test_coverage_volume.py:97-103` adds the at-scale half over all 60 pages. `grep -n "from_date\|to_date" tests/integration/test_coverage_*.py` now returns 20 lines across both files, against one (the `ValueError` parameter) at v1. Deleting either predicate in `coverage.sql` fails at least two assertions. Both tests pass in the runs recorded above. |
| v1/IR-002 (MEDIUM) — depth shortfall and presence computed from date-filtered segments | **RESOLVED** | `coverage.sql:21-22` adds unfiltered `acquired_from`/`acquired_to` aggregates alongside the `FILTER (WHERE in_bounds)` range; `service.py:195` keys presence on `acquired_from` and `:216` feeds `_depth_shortfall_years` from `acquired_from`/`acquired_to`. `test_date_bounds_do_not_change_presence_or_depth_shortfall` is load-bearing: the v1 code would report shortfall `5` and `ABSENT` fundamentals on its fixture. The behaviour change is recorded in DEC-0003. The residual coherence question is re-raised at MEDIUM as v2/IR-001 and the record's durability as v2/IR-002 — neither is the original defect. |
| v1/IR-003 (MEDIUM) — TC-COMP-045's "not from a run's intent" half is vacuously arranged | **RESOLVED** | `test_coverage_reads.py:139-156` now captures `run_id` with `RETURNING` and inserts `run_instrument_result (run_id, instrument_id='DDD', data_type='prices', outcome='written', completed_at=2024-03-01T12:00Z)` — the latest timestamp in the fixture — while leaving `DDD` without an `acquisition_state` row. The retained `rows["DDD"].last_acquired_at is None` assertion now fails if the read ever consults per-instrument run intent, exactly the remediation the finding specified. |
| v1/IR-004 (LOW) — `next_cursor` lookahead deviates from T012 step 6 unrecorded | **RESOLVED** | `service.py:107-112` records the deviation in the `read_coverage` docstring, naming the `limit + 1` lookahead, its purpose (no empty trailing page) and the plan wording it departs from. Behaviour unchanged, as the finding required. |
| v1/IR-005 (LOW) — `cursor` is not normalised, unlike the `list_instruments` precedent | **RESOLVED** | `service.py:163` binds `normalise(cursor) if cursor is not None else None`, matching the `symbol` treatment at `:159`; documented at `:111-112`; pinned by the new `test_cursor_is_normalised_like_the_symbol_filter` (`cursor=" aaa "` → `["BBB", "CCC"]`). |
| v1/IR-006 (LOW) — `LIKE` metacharacters in the symbol prefix are not escaped | **STILL OPEN** | `coverage.sql:10` unchanged. Deferred deliberately as a shared-helper change, which the v1 finding permitted ("Optional … treat it as its own change"). Re-raised unchanged as v2/IR-003. |

## Scope and Plan Deviations

- **Justified**: the `coverage.sql` `segment` CTE now computes both a
  bound-filtered range and an unbounded one, where T010 says "segments
  overlapping the bounds only". The task's bounded semantics are preserved for
  `covered_from`/`covered_to`; the addition exists to satisfy DEC-0003, and the
  file header (`:3-5`) records it. I confirmed the restructuring is
  behaviour-preserving for the unbounded read (`test_coverage_depth.py` and
  `test_coverage_reflects_written_rows_only` pass unchanged) and costs nothing
  measurable at 3000 instruments (6.49s vs 6.71s at v1); the inner subquery is a
  simple non-aggregating select that PostgreSQL flattens, so the join to `page`
  is not deferred behind a full scan.
- **Recorded deviation**: `next_cursor` uses a `limit + 1` lookahead rather than
  T012 step 6's "page is full" rule — now documented in the `read_coverage`
  docstring (v1/IR-004 closed).
- **Recorded deviation**: `presence` and `depth_shortfall_years` ignore the date
  bounds — documented in the docstring, the SQL header and DEC-0003. The
  decision record has not yet been absorbed into the task plan or the component
  design (IR-001, IR-002).
- **Justified**: `tests/integration/test_coverage_depth.py` hosts the
  TC-COMP-038/046 covered-range half instead of the design's
  `test_coverage_gaps.py`, because that file is CAP-001-E6-S2's — T007 directs
  this.
- **Justified**: the tasks frontmatter gained `last_reworked_review` and an
  `updated` date; no task body text was altered by either commit.
- **Bookkeeping consistency**: no unchecked task appears implemented, and no
  checked task lacks evidence.
- **Scope leakage**: none found. No S2 artefact (`gaps.py`, `gaps.sql`,
  `read_gap_dates`, `test_coverage_gaps.py`), no S3 route and no S4 frontend
  file was added; no unrelated refactor, dead code or debug artefact appears in
  the diff; `pyproject.toml` is the only configuration change and it adds no
  dependency; `uv.lock` is untouched.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to Doc Sync with IR-001, IR-002 and IR-003
  recorded as accepted warnings. Doc Sync should carry DEC-0003's outcome into
  `component-design-coverage-service.md` §2.4/§3 and the task plan's Open Gaps
  (IR-001, IR-002), and the harness repository should commit
  `projects/factorflow-v2/decisions/DEC-0003.md` and route it for owner review
  before CAP-001-E6-S3 consumes the bounded-read contract.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (LOW), IR-003 (LOW).
