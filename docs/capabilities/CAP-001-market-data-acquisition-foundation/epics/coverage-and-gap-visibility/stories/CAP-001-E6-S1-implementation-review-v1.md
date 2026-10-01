---
artifact_schema_version: 1
artifact_id: CAP-001-E6-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-30
updated: 2026-09-30
story_id: "CAP-001-E6-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-30T03:21:22Z"
reviewed_head: "4d7473dc323433b9ac7c6b63d7ec39c734ba5b8a"
review_base: "70bb73d418c88d9414f86d40d95e0d358cd7a2f6"
reviewed_state_revision: "sha256:3d803298015c1eb4bfacb8243b39477b40ca90a80721e193da955824148bc42c"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-09-30T03:21:22Z
  source_artifacts:
    - id: CAP-001-E6-S1
      version: "1"
    - id: CAP-001-E6-S1-tasks
      version: "1"
    - id: CAP-001-component-design-coverage-service
      version: "6"
  invoking_user: alvarodejodra
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E6-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 2 |
| Low findings | 3 |
| Acceptance criteria | 13/14 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 9/9 passed |

The implementation is substantially correct and every validation command in the
task plan and the tech stack passes independently, including the full
`postgres`-marked suite (211 tests) on a real PostgreSQL 16 container. Coverage
is genuinely derived at read time: `src/factorflow/coverage/sql/coverage.sql`
reads `instrument`, `coverage_segment` and `acquisition_state` only, never
`acquisition_run` or `run_instrument_result`, so AC-12 and DAC-E6-S1-5 hold on
the read side, and `never_acquired.sql` is a separate existence check across all
four observation tables, which is what AC-17 and DAC-E6-S1-2 require.

The gate fails on one item. DAC-E6-S1-7 and its mandatory component tests
TC-COMP-036 and TC-COMP-047 name four supported read features — symbol filter,
lifecycle filter, **date bounds** and cursor paging. Three are tested. The date
bounds are not exercised by any test in the change set: the only appearance of
`from_date`/`to_date` in the new tests is the `from_date > to_date` `ValueError`
case. The two date predicates in `coverage.sql` (lines 20–21) could be deleted
outright and the entire suite would still pass, so the acceptance criterion has
production evidence but no test evidence, and is recorded as PARTIAL.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S1-tasks.md` |
| Component | `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E6-S1-run-20260930T025827Z` |
| HEAD | `4d7473dc323433b9ac7c6b63d7ec39c734ba5b8a` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E6-integration-20260930T025827Z` @ `70bb73d418c88d9414f86d40d95e0d358cd7a2f6` (verified ancestor of HEAD) |
| Working tree | clean — no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 13 |

One commit separates base from HEAD: `4d7473d feat(CAP-001-E6-S1): derive
coverage at read time from written rows`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../stories/CAP-001-E6-S1.md` | modified | Bookkeeping: `status: in-progress` → `in-review`. No AC or technical detail altered. |
| `docs/.../stories/CAP-001-E6-S1-tasks.md` | modified | Bookkeeping: T001–T015 checkboxes ticked. No task text altered. |
| `pyproject.toml` | modified | T002 — `[tool.setuptools.package-data] factorflow = ["coverage/sql/*.sql"]`, exactly the entry T002 specifies; nothing else in the file touched. |
| `src/factorflow/coverage/__init__.py` | added | T001 (empty module marker) |
| `src/factorflow/coverage/service.py` | added | T012, T014 |
| `src/factorflow/coverage/sql/coverage.sql` | added | T010 |
| `src/factorflow/coverage/sql/never_acquired.sql` | added | T011 |
| `tests/integration/test_coverage_reads.py` | added | T003 |
| `tests/integration/test_coverage_empty.py` | added | T004 |
| `tests/unit/test_coverage_shapes.py` | added | T005, T009 |
| `tests/integration/test_coverage_retired.py` | added | T006 |
| `tests/integration/test_coverage_depth.py` | added | T007 |
| `tests/integration/test_coverage_volume.py` | added | T008 |

No unjustified file appears in the change set. Nothing forbidden by the plan was
added: there is no `gaps.py`, no `gaps.sql`, no `read_gap_dates`, no
`tests/integration/test_coverage_gaps.py` and no HTTP route, so the S2/S3
boundaries the plan draws are respected. `dependencies.yaml` is untouched and
already carries the `CAP-001-E6-S1: [CAP-001-E2-S2, …]` edge the plan required
(line 40).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `coverage.sql:24-41` (per-instrument × data-type rows, segment MIN/MAX, `acquisition_state`); `service.py:177-207` `_instrument_coverage` | `test_coverage_reads.py::test_coverage_reflects_written_rows_only`, `::test_presence_reports_each_data_type`, `::test_last_acquired_includes_failed_attempts_and_ignores_run_intent` | Presence, range and last-acquired all reported per instrument. |
| AC-12 | SATISFIED | `coverage.sql` reads only `instrument`, `coverage_segment`, `acquisition_state`; no summary table is read or written; `service.py` issues no DML | `test_coverage_reads.py::test_rolled_back_partial_write_leaves_no_coverage` | The rollback test asserts `covered_from is None`, `last_acquired_at is None` and all-`UNKNOWN` presence for the rolled-back instrument — a genuine regression check, since the same instrument row is committed beforehand so its absence from the page cannot mask the assertion. |
| AC-17 | SATISFIED | `service.py:129-141` short-circuits on `never_acquired.sql` before any filtered query | `test_coverage_empty.py::test_empty_store_reports_never_acquired`, `::test_non_matching_filter_on_populated_store_is_not_never_acquired` | Both states are distinguished; `missing_days is None` is asserted explicitly, not merely falsy. |
| AC-21 | SATISFIED | `coverage.sql:6-11` — no default lifecycle predicate on `instrument` | `test_coverage_retired.py::test_retired_instrument_keeps_coverage_and_is_marked` | Retired row appears with `lifecycle == "retired"` and its retained 2020-01-02..2022-10-27 range. |
| DAC-E2-6 | SATISFIED | as AC-21 | `test_coverage_retired.py` asserts `set(rows) == {"AAPL", "TWTR"}` — distinguished, not omitted | — |
| DAC-E6-1 | SATISFIED | `service.py:1-16` docstring and the read-time assembly in `read_coverage`; no persisted summary exists anywhere in the change set | `test_coverage_reads.py::test_coverage_reflects_written_rows_only` (instrument with bars but no segment reports no range) | — |
| DAC-E6-7 | SATISFIED | `never_acquired.sql:3` checks `daily_bar`, `fundamental_observation`, `corporate_action` and `instrument_reference` | `test_coverage_empty.py::test_registered_instruments_without_observations_are_never_acquired`, `::test_any_observation_type_counts_as_acquired` | The fundamentals-only test would fail a `daily_bar`-only implementation, so the four-table requirement is genuinely pinned. |
| DAC-E6-S1-1 | SATISFIED | `service.py:182-191` three-way presence rule; `coverage.sql:33-34` `CROSS JOIN (VALUES …)` guarantees a row for each of the four types, so `by_type[data_type]` cannot raise | `test_coverage_shapes.py::test_presence_has_exactly_three_states`; `test_coverage_reads.py::test_presence_reports_each_data_type` asserts the whole dict including one PRESENT, one ABSENT and two UNKNOWN | — |
| DAC-E6-S1-2 | SATISFIED | `never_acquired.sql` is a separate statement executed before and independently of `coverage.sql` (`service.py:130` vs `:146`) | `test_coverage_empty.py::test_non_matching_filter_on_populated_store_is_not_never_acquired` | — |
| DAC-E6-S1-3 | SATISFIED | `service.py:77-87` `_depth_shortfall_years` implements the ceiling rule from Open Gap 1 exactly | `test_coverage_depth.py::test_shortfall_reported_against_stated_depth`, `::test_no_stated_depth_reports_no_shortfall`; `test_coverage_shapes.py::test_depth_shortfall_years` (5 parametrised cases) | `None` never degrades to `0`; asserted with `is None`. |
| DAC-E6-S1-4 | SATISFIED | as AC-21; `lifecycle` carried through `coverage.sql:26` into `InstrumentCoverage.lifecycle` | `test_coverage_retired.py` | — |
| DAC-E6-S1-5 | SATISFIED | `service.py:192-193, 204` — `max()` over `acquisition_state.last_acquired_at`; `coverage.sql` never joins `acquisition_run` or `run_instrument_result` | `test_coverage_reads.py::test_last_acquired_includes_failed_attempts_and_ignores_run_intent` | The failed-outcome half is proven (a `failed` state later than the `written` state wins). The run-intent half is weakly arranged — see IR-003. |
| DAC-E6-S1-6 | SATISFIED | covered range comes from `coverage_segment`, never from the stated depth; shortfall surfaces through `depth_shortfall_years` | `test_coverage_depth.py::test_uniform_plan_cap_is_a_short_range_not_a_gap` | The gap-count half legitimately awaits CAP-001-E6-S2 (plan Open Gap 6); the covered-range half claimed by this story is proven. |
| DAC-E6-S1-7 | **PARTIAL** | `coverage.sql:7-11` symbol prefix, lifecycle, cursor keyset, `LIMIT`; `:20-21` date bounds; `service.py:146-167` | symbol filter, lifecycle filter and paging: `test_coverage_reads.py::test_symbol_and_lifecycle_filters`, `::test_cursor_paging_returns_every_instrument_once`, `test_coverage_volume.py::test_paging_and_filters_at_3000_instruments` (3000 instruments, 60 pages, ascending, each once). **Date bounds: no test.** | See IR-001. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/coverage/__init__.py` (0 bytes) | No `.gitkeep`, as specified. |
| T002 | complete | VERIFIED | `pyproject.toml:32-33` | Verified functionally: `uv build` then `unzip -l dist/factorflow-0.1.0-py3-none-any.whl` lists both `.sql` files. |
| T003 | complete | VERIFIED | `tests/integration/test_coverage_reads.py` (7 test functions) | Every bullet the task enumerates is present, including the four validation/error cases. The task text itself never enumerated a date-bound case; the resulting AC gap is recorded as IR-001 against DAC-E6-S1-7 rather than against this task. |
| T004 | complete | VERIFIED | `tests/integration/test_coverage_empty.py` (4 tests) | All four bullets implemented, including the explicit `missing_days is None`. |
| T005 | complete | VERIFIED | `tests/unit/test_coverage_shapes.py:26-70` | Field names *and order* asserted against design 2.4 for all three dataclasses; frozen-ness asserted. |
| T006 | complete | VERIFIED | `tests/integration/test_coverage_retired.py` | — |
| T007 | complete | VERIFIED | `tests/integration/test_coverage_depth.py` (3 tests) | Includes the raise-the-depth case (`write_history_depth(conn, 6)` → BBB short by 1) and the no-stated-depth case. Placed outside the S2-owned `test_coverage_gaps.py`, as the task directs. |
| T008 | complete | VERIFIED | `tests/integration/test_coverage_volume.py` | Marked `postgres` and `slow`; seeded with set-based `INSERT … SELECT generate_series(…)`; no elapsed-time assertion, as required. Date bounds not exercised — see IR-001. |
| T009 | complete | VERIFIED | `tests/unit/test_coverage_shapes.py:73-97` | All five rounding cases plus the `UNAVAILABLE_REASON` constant, imported from `factorflow.coverage.service`. |
| T010 | complete | VERIFIED | `src/factorflow/coverage/sql/coverage.sql` | `instrument_id` is selected for S2 as instructed; bound parameters only; no DML (design AC 8). |
| T011 | complete | VERIFIED | `src/factorflow/coverage/sql/never_acquired.sql` | Matches the specified statement verbatim; kept a separate file. |
| T012 | complete | VERIFIED | `src/factorflow/coverage/service.py` | Dataclasses, `UNAVAILABLE_REASON`, import-time SQL load, `read_history_depth` import, validation, the never-acquired short-circuit with `reason=UNAVAILABLE_REASON`, the `_NOT_COMPUTED` placeholder in both places, and no `read_gap_dates`/`gaps.py`. One deviation in step 6's cursor rule — see IR-004. |
| T013 | complete | VERIFIED | reproduced independently: `uv run python -c "from factorflow.coverage.service import read_coverage, CoverageView"` → `IMPORT_OK`; `uv build`; `unzip -l dist/factorflow-0.1.0-py3-none-any.whl \| grep coverage/sql/` → both files | `src/factorflow/__init__.py` unchanged, as expected. |
| T014 | complete | VERIFIED | `service.py:1-16` (module docstring citing 2.2, 2.4, 2.5 and every AC) and `:100-121` (`read_coverage` docstring carrying all three Open-Gap choices) | — |
| T015 | complete | VERIFIED | all five commands rerun independently below, all exit 0 | — |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_coverage_reflects_written_rows_only` / TC-COMP-007, TC-COMP-027 | ADEQUATE | Instrument A holds bars but no segment and reports `covered_from is None`; B holds both and reports exactly 2024-01-02..2024-01-05. Deriving the range from bars instead of segments would fail on A. | none |
| `test_presence_reports_each_data_type` / TC-COMP-007, TC-COMP-041 | ADEQUATE | Asserts the full dict, so a missing key or a wrong third state fails. Distinguishes ABSENT (state row, no segment) from UNKNOWN (neither). | none |
| `test_last_acquired_includes_failed_attempts_and_ignores_run_intent` / TC-COMP-045 | ADEQUATE | A `failed` state at 2024-02-01 beats a `written` state at 2024-01-03, so an implementation filtering on `last_outcome='written'` fails. | The run-intent half is weakly arranged (IR-003); the AC's substance is still proven by the production read path. |
| `test_rolled_back_partial_write_leaves_no_coverage` / TC-COMP-012 | ADEQUATE | Real `rollback()` on the same connection; a committed sibling instrument keeps the read non-empty so the assertions are reached. | none |
| `test_symbol_and_lifecycle_filters` | ADEQUATE | Exact list equality (`["AAL", "AAPL"]`) — a no-op prefix filter would fail. | does not cover date bounds (IR-001) |
| `test_cursor_paging_returns_every_instrument_once` | ADEQUATE | Page sizes `[2, 2, 1]` and the flattened sequence both asserted; loop terminates on `next_cursor is None`, so a cursor that never clears would hang or produce duplicates. | none |
| `test_invalid_input_raises_value_error` | ADEQUATE | Four parametrised cases: reversed dates, unknown lifecycle, `limit=0`, `limit=501`. Boundaries `1` and `500` are implicitly accepted elsewhere. | asserts `ValueError` type only, not message |
| `test_database_error_propagates` | ADEQUATE | Closes the connection and asserts a `psycopg.Error` subclass rather than an empty view (OPS-ERR-001, design AC 9). Fixture teardown is `conn.close()`, which is idempotent, so no order dependence is introduced. | none |
| `test_empty_store_reports_never_acquired` / TC-COMP-017, TC-COMP-042 | ADEQUATE | Full `GapDetection` equality plus a separate `missing_days is None` identity assertion, so a zero cannot slip through. | none |
| `test_registered_instruments_without_observations_are_never_acquired` / TC-COMP-033 | ADEQUATE | Instruments alone do not count as observations. | none |
| `test_non_matching_filter_on_populated_store_is_not_never_acquired` / TC-COMP-017, TC-COMP-042 | ADEQUATE | This is the test that fails if the two queries are ever conflated. | none |
| `test_any_observation_type_counts_as_acquired` / TC-COMP-033 | ADEQUATE | Fundamentals-only store; fails a `daily_bar`-only existence check. | none |
| `test_retired_instrument_keeps_coverage_and_is_marked` / TC-COMP-021, TC-COMP-034, TC-COMP-044, TC-COMP-104 | ADEQUATE | Both instruments present, lifecycle values and the retired range all asserted. | none |
| `test_shortfall_reported_against_stated_depth` / TC-COMP-035, TC-COMP-043 | ADEQUATE | 3-of-5 → `2`, 5-of-5 → `None`, then raising the depth to 6 flips B to `1`; the re-read proves the value is derived per read and not cached. | none |
| `test_no_stated_depth_reports_no_shortfall` / TC-COMP-043 | ADEQUATE | Guards the `stated_years is None` branch. | none |
| `test_uniform_plan_cap_is_a_short_range_not_a_gap` / TC-COMP-038, TC-COMP-046 (covered-range half) | ADEQUATE for the declared half | `covered_from` equals the uniform start for all three rows and every row carries shortfall `5`. | `missing_days in (None, 0)` passes vacuously today — the plan records this openly (Open Gap 6) and assigns the remainder to S2 |
| `test_depth_met_carries_none_not_zero`, `test_shapes_are_frozen_with_design_fields`, `test_presence_has_exactly_three_states` / TC-COMP-037, TC-COMP-041 | ADEQUATE | Field order asserted as a list, so a reordered dataclass fails; `StrEnum` subclassing and the exact three values asserted. | none |
| `test_depth_shortfall_years` (5 cases) | ADEQUATE | Exercises below, at, above, no-depth and no-coverage. | none |
| `test_paging_and_filters_at_3000_instruments` / TC-COMP-036, TC-COMP-047 | **WEAK** | Genuine 3000-instrument correctness: 60 pages, full ascending sequence, prefix and lifecycle subsets all asserted by exact list equality. Deterministic (fixed symbols, no time or randomness). | **No date-bound case**, though the TC it implements names date bounds explicitly — IR-001. |

Mocks and fixtures: none of the new tests use mocks. All integration tests run
against a real PostgreSQL 16 container in an isolated per-test database via the
existing `migrated_writer_connection` fixture; no new fixture was added, as the
plan required. Seeding uses module-local direct-INSERT helpers, matching the
`test_writer_coverage.py` precedent. No test depends on wall-clock time,
ordering, or network access.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `163 files already formatted` |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `All checks passed!` |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `Success: no issues found in 45 source files` (strict mode per `pyproject.toml`) |
| `uv run pytest tests/unit/test_coverage_shapes.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `11 passed in 0.08s` |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `453 passed, 211 deselected in 13.27s` |
| `uv run pytest -m postgres tests/integration/test_coverage_reads.py tests/integration/test_coverage_empty.py tests/integration/test_coverage_retired.py tests/integration/test_coverage_depth.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `19 passed in 4.91s` — narrowest story scope, run first |
| `uv run pytest -m postgres tests/integration/test_coverage_volume.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `1 passed in 6.71s` |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `211 passed, 453 deselected in 161.59s` — the full container suite, not a narrowed substitute. Docker was available (`docker info` succeeded), so no exclusion applies. |
| `uv build` + `unzip -l dist/factorflow-0.1.0-py3-none-any.whl \| grep coverage/sql/` + `uv run python -c "from factorflow.coverage.service import read_coverage, CoverageView"` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Wheel carries `factorflow/coverage/sql/coverage.sql` and `.../never_acquired.sql`; import prints `IMPORT_OK`. Confirms T002 and T013. |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Not required for review: the `.venv` was already resolved and every `uv run` command above resolves the same environment, so an install step would add no evidence and would only risk mutating the lockfile. |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | No frontend file is in the change set; this story adds no TypeScript, no route and no UI (the Coverage screen is CAP-001-E6-S4). The task plan's Validation Plan lists the seven Python commands only. |

### Validation Side Effects

- Before: `git status --porcelain` empty; `dist/factorflow-0.1.0-py3-none-any.whl` already present (ignored path).
- After: `git status --porcelain` empty. `uv build` rewrote `dist/factorflow-0.1.0-py3-none-any.whl` and added `dist/factorflow-0.1.0.tar.gz`; `build/` intermediates were created and removed by setuptools. All are git-ignored.
- Unexpected tracked-file changes: none. No mutation-producing validation had to be stopped.
- Test databases are created and dropped inside the session container by `tests/conftest.py`; no state escapes the container.

## Findings

### IR-001 — Date bounds on a coverage read have no test at all

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S1-7 (and its epic parent DAC-E6-10)
- **Tasks**: T003 (Filters and bounds bullet), T008
- **Files**: `src/factorflow/coverage/sql/coverage.sql:20-21`; `src/factorflow/coverage/service.py:150-152`; `tests/integration/test_coverage_reads.py`; `tests/integration/test_coverage_volume.py`
- **Claim challenged**: T003's bullet "Filters and bounds (DAC-E6-S1-7, functional half)" and T008's mapping to TC-COMP-036 / TC-COMP-047, both ticked complete.
- **Observed evidence**: `grep -rn "from_date\|to_date" tests/integration/test_coverage_*.py tests/unit/test_coverage_shapes.py` returns exactly one line — `test_coverage_reads.py:207`, the `from_date > to_date` `ValueError` parameter. No test passes a valid `from_date` or `to_date` to `read_coverage` and asserts the resulting rows. The two date predicates in `coverage.sql` (`cs.covered_to >= %(from_date)s`, `cs.covered_from <= %(to_date)s`) are therefore never executed against a non-`NULL` value by the suite, and could be removed entirely without a single failure.
- **Expected evidence/behavior**: DAC-E6-S1-7 (story, Derived ACs): "coverage reads … support a symbol filter, lifecycle filter, **date bounds** and cursor paging at 3000 instruments." The coverage matrix (`tests/coverage-matrix.md:68, 79`) marks DAC-E6-10 and DAC-E6-S1-7 Covered by the mandatory TC-COMP-036 and TC-COMP-047, whose titles both name date bounds. A mandatory component test must exercise the behaviour its AC states.
- **Impact**: One quarter of a P1 acceptance criterion is unverified. A regression in the segment date-overlap predicates — an inverted comparison, a wrong `NULL` guard, or a dropped clause — is invisible to the suite, and CAP-001-E6-S3 (`GET /api/coverage`) will pass these bounds straight through from HTTP query parameters. The `NULL`-means-no-predicate contract the plan derives from design 2.3 / Resolved Conflict 5 is likewise unpinned.
- **Required remediation**: Add at least one `postgres`-marked case to `tests/integration/test_coverage_reads.py` (or `test_coverage_volume.py` for the at-scale half) that reads with a real `from_date`/`to_date` and asserts which instruments and segment ranges the bounds include and exclude, plus the omitted-bound case (no date predicate applied, per Resolved Conflict 5). Do not weaken the existing assertions. If any part of the bounded-read semantics is genuinely undecided, record it under the plan's Open Gaps rather than leaving the AC untested.

### IR-002 — Depth shortfall and presence are computed from date-filtered segments

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S1-3, DAC-E6-S1-1 (interaction with DAC-E6-S1-7)
- **Tasks**: T010, T012
- **Files**: `src/factorflow/coverage/sql/coverage.sql:13-23`; `src/factorflow/coverage/service.py:186-205`
- **Claim challenged**: T012 step 4's derivation of `presence`, `covered_from`/`covered_to` and `depth_shortfall_years`.
- **Observed evidence**: The `segment` CTE applies the `from_date`/`to_date` overlap predicates, and its output is the sole source of `covered_from`, `covered_to`, `presence[...] == PRESENT` and — through `_depth_shortfall_years(covered_from, covered_to, stated_years)` at `service.py:205` — the shortfall. A read bounded to a narrow window therefore reports a narrower range, and an instrument that fully meets the stated depth can report a positive `depth_shortfall_years`; a data type whose only segment falls outside the window reports `ABSENT` (when an `acquisition_state` row exists) or `UNKNOWN`.
- **Expected evidence/behavior**: DAC-E6-S1-3 and design section 2.4 define the shortfall as coverage measured against the *stated history depth*, a property of the instrument, not of the requested window. Design section 3 is explicit that the response "carries the covered range per instrument … which is what keeps the shortfall visible to the owner as a shorter range instead of as a gap count" — the shortfall is meant to describe acquisition, not the query.
- **Impact**: Once CAP-001-E6-S3 exposes `from_date`/`to_date` over HTTP, a filtered Coverage screen can render *Short by n years* for an instrument that is not short, and `coverage-absent` for a data type that is present outside the window. No test detects either, because of IR-001.
- **Required remediation**: Decide, and record, whether the depth shortfall is computed from the unbounded coverage or from the bounded read. If unbounded is intended, derive the shortfall from a range that ignores the date predicates and cover it with a bounded-read test. If the current behaviour is intended, state it in the plan's Open Gaps (and the `read_coverage` docstring) and pin it with a test.

### IR-003 — TC-COMP-045's "not from a run's intent" half is vacuously arranged

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S1-5
- **Tasks**: T003
- **Files**: `tests/integration/test_coverage_reads.py:127-145` (`test_last_acquired_includes_failed_attempts_and_ignores_run_intent`)
- **Claim challenged**: T003's requirement that "an instrument with a queued `acquisition_run` but no `acquisition_state` row reports `None` (run intent is not read)".
- **Observed evidence**: The test inserts a bare `INSERT INTO acquisition_run (state, history_depth_years) VALUES ('requested', 5)` with no link to instrument `DDD`. Per-instrument run intent lives in `run_instrument_result (run_id, instrument_id, data_type, outcome, completed_at)` (`migrations/0004_runs.sql:35-48`); `acquisition_run` itself has no `instrument_id` column. The assertion `rows["DDD"].last_acquired_at is None` would therefore hold even if `coverage.sql` did read per-instrument run intent.
- **Expected evidence/behavior**: DAC-E6-S1-5 and design 2.2 require last-acquired to come from `acquisition_state` and never from what a run intended. A test asserting that must arrange intent that *could* be mistaken for acquisition — a `run_instrument_result` row for `DDD` with no matching `acquisition_state` row.
- **Impact**: The stronger half of a mandatory P1 test does not discriminate. The AC still holds on current code (`coverage.sql` references neither run table), so this is a test-strength defect rather than a behavioural one, but the guard against a future regression is absent.
- **Required remediation**: Give `DDD` a `run_instrument_result` row (e.g. `outcome='written'`, a recent `completed_at`) alongside its parent `acquisition_run`, keep the `acquisition_state` row absent, and keep the `last_acquired_at is None` assertion. No other test needs to change.

### IR-004 — `next_cursor` deviates from T012 step 6 (lookahead instead of page-full)

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S1-7
- **Tasks**: T012
- **Files**: `src/factorflow/coverage/service.py:154, 164-167`; `src/factorflow/coverage/sql/coverage.sql:11`
- **Claim challenged**: T012 step 6: "`next_cursor` set to the last symbol on the page when the page is full, otherwise `None`", with T010 specifying `LIMIT %(limit)s`.
- **Observed evidence**: The implementation binds `"limit": limit + 1`, truncates to `limit`, and sets `next_cursor` only when the extra row was fetched. The plan's literal rule would have emitted a cursor on an exactly-full final page, producing one trailing empty page — and `test_cursor_paging_returns_every_instrument_once` (`[2, 2, 1]` over five instruments) and `test_paging_and_filters_at_3000_instruments` (`len(pages) == 60`) both encode the lookahead behaviour, not the plan's.
- **Expected evidence/behavior**: Implementation and plan text should agree, or the deviation should be recorded. The behaviour itself is better and consistent with the ingestion-api paging contract; only the record is missing.
- **Impact**: A reader comparing plan to code sees an unexplained divergence, and CAP-001-E6-S3/S4 cite this plan for the `read_coverage` contract.
- **Required remediation**: Record the deviation (a Notes or Open Gaps entry in the task plan, or a line in the `read_coverage` docstring) stating that a `limit + 1` lookahead is used so that no empty trailing page is produced. Do not change the behaviour.

### IR-005 — `cursor` is not normalised, unlike the `list_instruments` precedent

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S1-7
- **Tasks**: T012
- **Files**: `src/factorflow/coverage/service.py:153`; compare `src/factorflow/instruments/service.py:151`
- **Claim challenged**: T010's instruction to follow the `list_instruments` precedent for the symbol filter and keyset cursor.
- **Observed evidence**: `symbol` is passed through `normalise(...)` (`service.py:149`) but `cursor` is bound raw. `list_instruments` normalises both (`parameters.append(normalise(filters.cursor))`). A lowercase or space-padded cursor supplied by an external caller compares against uppercase stored symbols and silently returns a wrong page start.
- **Expected evidence/behavior**: Consistent handling of owner-supplied symbol-shaped inputs, as the cited precedent does. Not currently reachable in-process, because every cursor the service emits is already a normalised symbol.
- **Impact**: Latent inconsistency that CAP-001-E6-S3 could expose once the cursor arrives as an HTTP query parameter.
- **Required remediation**: Apply `normalise` to `cursor` as well, or record why it is deliberately raw (the plan's Notes already argue any string is a valid keyset position).

### IR-006 — `LIKE` metacharacters in the symbol prefix are not escaped

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S1-7
- **Tasks**: T010
- **Files**: `src/factorflow/coverage/sql/coverage.sql:7`
- **Claim challenged**: Design section 4's input-validation posture (SEC-INP-001) for the instrument filter.
- **Observed evidence**: The prefix is bound as a parameter and concatenated with `'%'`, so there is no SQL injection (SEC-INP-002 is satisfied). But `_` and `%` inside the supplied prefix remain `LIKE` wildcards, so `A_L` matches `AAL`. The value is not shape-validated with `symbols.is_valid` before use.
- **Expected evidence/behavior**: The existing `list_instruments` implementation has the identical property, so this is a pre-existing repository pattern rather than a regression introduced here, and the plan explicitly directed following that precedent.
- **Impact**: A filter can match more symbols than the owner intended. No security or data-integrity consequence; read-only path.
- **Required remediation**: Optional. If addressed, prefer a single shared prefix-escaping helper used by both `list_instruments` and `read_coverage` rather than a local fix here, and treat it as its own change.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified**: `docs/.../CAP-001-E6-S1.md` `status: in-progress` → `in-review` and the T001–T015 checkbox ticks are routine Phase 6a bookkeeping; no acceptance criterion, technical detail or task text was altered (verified by `git diff 70bb73d..HEAD -- docs/`).
- **Justified**: `pyproject.toml` carries exactly the `[tool.setuptools.package-data]` entry T002 specifies and nothing else, as instructed.
- **Justified**: `tests/integration/test_coverage_depth.py` hosts the TC-COMP-038 / TC-COMP-046 covered-range half instead of the design's `test_coverage_gaps.py`, because that file is CAP-001-E6-S2's — T007 directs this.
- **Recorded deviation**: `next_cursor` lookahead (IR-004).
- **Bookkeeping consistency**: no unchecked task appears implemented, and no checked task lacked evidence.
- **Scope leakage**: none found. No S2 artefact (`gaps.py`, `gaps.sql`, `read_gap_dates`, `test_coverage_gaps.py`), no S3 route and no S4 frontend file was added; no unrelated refactor, dead code or debug artefact appears in the diff; `pyproject.toml` is the only dependency/configuration change and it adds no dependency.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Resolve IR-001 (blocking): add a real date-bound test for DAC-E6-S1-7 / TC-COMP-036 / TC-COMP-047. Address or explicitly record IR-002 and IR-003. IR-004 through IR-006 are non-blocking and may be dispositioned with a recorded rationale. Then rerun `$adversarial-review` with this report as the prior version.
- **Warnings accepted downstream**: N/A — the verdict is CHANGES-REQUIRED, so no finding is accepted downstream.
