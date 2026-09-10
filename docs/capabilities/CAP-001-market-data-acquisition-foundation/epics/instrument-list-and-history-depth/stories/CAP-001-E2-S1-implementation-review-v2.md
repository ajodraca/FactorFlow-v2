---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-10
updated: 2026-09-10
story_id: "CAP-001-E2-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-10T13:53:38Z"
reviewed_head: "b44f1dad9098d0d7e888fc679479f102e9183d8b"
review_base: "c3b79f6430294a9ec4ea51fdd44e87973b4edd28"
reviewed_state_revision: "sha256:41ad52bd71d7f5bce91fef8c35027c7875208b9607f1cb4872375a60858dd62e"
verdict: PASS
review_subjects:
  - artifact_id: CAP-001-E2-S1
    artifact_version: 2
    content_revision: sha256:998c68720ab38c0e941d1e30338ef4d4b2ec91a1813805fbd7381cf534588ff8
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-10T13:53:38Z
  source_artifacts:
    - id: CAP-001-E2-S1
      version: "2"
    - id: CAP-001-E2-S1-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E2-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 20/20 verified |
| Required validation | 7/7 passed |

The complete change set implements the story's normalisation, add/reactivation, lifecycle-only retirement, listing, and active-roster contracts using bound PostgreSQL parameters and no ORM. The rework supplies regression-sensitive tests for every v1 gap. All required validation commands passed independently, with no unexpected tracked-file changes.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 0**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S1-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E2-S1` |
| HEAD | `b44f1dad9098d0d7e888fc679479f102e9183d8b` |
| Review base | `main` merge base `c3b79f6430294a9ec4ea51fdd44e87973b4edd28` |
| Working tree | Clean before validation; this report is the sole post-validation untracked file. |
| Changed files reviewed | 14 committed files; no staged, unstaged, or other untracked files before this report |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../CAP-001-E2-S1-implementation-review-v1.md` | added | Prior required gate evidence; re-review disposition source |
| `docs/.../CAP-001-E2-S1-tasks.md` | modified | T001–T020 planning and v1 rework linkage |
| `docs/.../CAP-001-E2-S1.md` | modified | Story lifecycle status for review |
| `src/factorflow/instruments/__init__.py` | added | T001 |
| `src/factorflow/instruments/symbols.py` | added | T004, T012; DAC-E2-1 and DAC-E2-S1-1/-2 |
| `src/factorflow/instruments/service.py` | added | T002, T013–T016; story domain behavior |
| `tests/conftest.py` | modified | T003 PostgreSQL migration fixture |
| `tests/integration/test_instrument_add.py` | added | T005, T008 and v1/IR-001 rework |
| `tests/integration/test_instrument_lifecycle.py` | added | T006, T009–T010 |
| `tests/integration/test_instrument_list.py` | added | T007 and v1/IR-003 rework |
| `tests/integration/test_instrument_volume.py` | added | T019 and v1/IR-004 rework |
| `tests/unit/test_no_instrument_delete.py` | added | T018 and v1/IR-002 rework |
| `tests/unit/test_scope_boundaries.py` | added | T011 |
| `tests/unit/test_symbol_normalisation.py` | added | T004 |

All changed implementation and test paths trace to the task plan. The report and story/task lifecycle changes are required review-cycle evidence; no unjustified code or dependency change was found.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | SATISFIED | `service.py:add_symbols`, `retire_symbol`, `list_instruments` (70–172) | add, lifecycle, and list integration tests | This in-process domain interface is the scope; HTTP is deferred to E2-S3. |
| AC-21 | SATISFIED | `service.py:120–136,175–181` updates lifecycle only and omits retired IDs from the roster | lifecycle tests and no-delete static test | Existing schema has no later observation/coverage/run tables; the T009 future-table TODO is present. |
| DAC-E2-1 | SATISFIED | `symbols.py:5–15`; `service.py:82–92` normalises before lookup | `test_add_symbols_canonicalises_before_database_lookup` | Equivalent raw forms persist exactly one canonical row. |
| DAC-E2-2 | SATISFIED | `service.py:94–115` classifies active duplicate and reactivates retired row | `test_add_reports_duplicate_active_and_reactivates_retired` | Original identity and cleared `retired_at` are asserted. |
| DAC-E2-5 | SATISFIED | `service.py:120–136` has lifecycle update; source scan finds no delete in `src` | lifecycle and static no-delete tests | Retirement does not delete the instrument. |
| DAC-E2-S1-1 | SATISFIED | `normalise` at `symbols.py:8–10`, called before lookup at `service.py:82–90` | canonicalisation integration test | Whitespace/lowercase form produces `AAPL`, then canonical duplicate. |
| DAC-E2-S1-2 | SATISFIED | regex and malformed branch at `symbols.py:5`, `service.py:83–86` | invalid-shape unit parametrization and mixed-batch integration test | Invalid input is classified malformed and has no persisted row. |
| DAC-E2-S1-3 | SATISFIED | `service.py:98–115` updates lifecycle and clears `retired_at` | reactivation integration test | Same `instrument_id` is retained. |
| DAC-E2-S1-4 | SATISFIED | one transaction and per-symbol outcomes at `service.py:80–117` | mixed-batch and 3,000-item malformed-batch tests | Rejections do not discard accepted symbols. |
| DAC-E2-S1-5 | SATISFIED | distinct exceptions at `service.py:33–38,120–136` | lifecycle exception test | Unknown and already-retired paths are distinguishable. |
| DAC-E2-S1-6 | SATISFIED | `retire_symbol` contains only the target-row lifecycle update | unchanged-row lifecycle test and required TODO | Present schema behavior is verified; later-table test extension is explicitly tracked. |
| DAC-E2-S1-7 | SATISFIED | filters, keyset pagination, and lifecycle counts at `service.py:139–172` | four-row and 3,000-instrument list tests | Prefix/lifecycle filtering, cursors, pages, and 2,999/1 counts are asserted. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/instruments/__init__.py` | Empty package marker exists. |
| T002 | complete | VERIFIED | `migrations/0001_extensions_owner_state.sql:16`; `service.py:3–5` | Required unique index exists and its origin is documented. |
| T003 | complete | VERIFIED | `tests/conftest.py:22–24,77–87` | Fixture applies migration 0001 to a fresh PostgreSQL database. |
| T004 | complete | VERIFIED | `symbols.py:5–15`; unit and `test_instrument_add.py:61–72` | Pure rule and service-boundary canonicalisation are both tested. |
| T005 | complete | VERIFIED | `test_instrument_add.py:23–40` | Duplicate-active and reactivation identity/lifecycle assertions are meaningful. |
| T006 | complete | VERIFIED | `test_instrument_lifecycle.py:17–28` | Distinct exceptions are asserted. |
| T007 | complete | VERIFIED | `test_instrument_list.py:16–72` | Prefix/lifecycle filters, cursors, pages, and counts are tested at normal and 3,000-item scale. |
| T008 | complete | VERIFIED | `test_instrument_add.py:43–58` | Each outcome and resulting rows are asserted. |
| T009 | complete | VERIFIED | `test_instrument_lifecycle.py:31–57` | Existing columns/rows are compared; future-table TODO is present. |
| T010 | complete | VERIFIED | `test_instrument_lifecycle.py:60–72` | Retired ID excluded and active IDs ordered by symbol. |
| T011 | complete | VERIFIED | `test_scope_boundaries.py:6–9` | E2-S2 settings module remains absent. |
| T012 | complete | VERIFIED | `symbols.py:1–15` | Single normalisation/validation module and exact pattern exist. |
| T013 | complete | VERIFIED | `service.py:15–117` | Required enum, frozen outcome, transaction, and classifications exist. |
| T014 | complete | VERIFIED | `service.py:33–38,120–136` | Required exceptions and lifecycle-only transition exist. |
| T015 | complete | VERIFIED | `service.py:41–67,139–172` | Dataclasses, keyset paging, filters, and counts exist. |
| T016 | complete | VERIFIED | `service.py:175–181` | Active IDs return in symbol order. |
| T017 | complete | VERIFIED | independent `uv run pytest -m postgres` | All 39 marked tests passed. |
| T018 | complete | VERIFIED | `test_no_instrument_delete.py:6–13` | Case-consistent source scan fails when a forbidden statement is present. |
| T019 | complete | VERIFIED | `test_instrument_volume.py:11–25` | A 3,000-item batch with one malformed entry reports all outcomes and persists 2,999. |
| T020 | complete | VERIFIED | Independent validation below | Every task-plan command passed. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_add_symbols_canonicalises_before_database_lookup` / TC-COMP-099, TC-COMP-111 | ADEQUATE | Adds whitespace/lowercase then canonical input, asserts `ADDED`, `DUPLICATE_ACTIVE`, and one `AAPL` row. | None. |
| `test_invalid_normalised_symbols_are_rejected` plus mixed-batch test / TC-COMP-112 | ADEQUATE | Covers `1AAPL`, 17 characters, and empty input against the exact pattern; database batch confirms malformed input is absent. | None. |
| `test_add_reports_duplicate_active_and_reactivates_retired` / TC-COMP-100, TC-COMP-113 | ADEQUATE | Verifies both dispositions, original identity, active lifecycle, and null `retired_at`. | None. |
| `test_mixed_batch_commits_only_accepted_symbols` / TC-COMP-101, TC-COMP-114 | ADEQUATE | Exercises valid, duplicate-active, and malformed entries together and verifies committed rows. | None for the list-based domain contract in this story. |
| `test_retire_distinguishes_unknown_and_already_retired` / TC-COMP-103, TC-COMP-115 | ADEQUATE | Verifies the required distinct domain exception types. | HTTP mapping is explicitly E2-S3 scope. |
| `test_retirement_changes_only_the_target_instrument_lifecycle` / TC-COMP-116 | ADEQUATE | Compares the modified and untouched existing rows, retaining the plan-mandated future-table TODO. | Later tables do not yet exist. |
| `test_list_filters_and_keyset_pages_with_lifecycle_counts` and 3,000-item roster test / TC-COMP-108, TC-COMP-117 | ADEQUATE | Tests normal and required-volume prefix/lifecycle filters, keyset continuation, and active/retired counts. | None. |
| `test_active_instrument_ids_excludes_retired_symbols_in_symbol_order` | ADEQUATE | Confirms active roster exclusion and deterministic ordering. | None. |
| `test_add_symbols_commits_valid_symbols_from_a_3000_item_malformed_batch` | ADEQUATE | Confirms one malformed disposition, 2,999 added outcomes, and 2,999 persisted rows. | None. |
| `test_no_source_statement_deletes_an_instrument` | ADEQUATE | Searches uppercase source text for uppercase prohibited SQL; the literal case-normalisation assertion demonstrates the comparison form. | None. |
| `test_instruments_settings_module_is_not_implemented` | ADEQUATE | Guards the E2-S2 scope boundary. | None. |

The PostgreSQL fixture isolates each test in a freshly created database. Story tests use no network fixture or mock that bypasses the database service, and their assertions would fail for the regressions addressed by v1.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 42 packages; checked 39. |
| `uv run pytest tests/unit/test_symbol_normalisation.py tests/unit/test_no_instrument_delete.py tests/unit/test_scope_boundaries.py tests/integration/test_instrument_add.py tests/integration/test_instrument_lifecycle.py tests/integration/test_instrument_list.py tests/integration/test_instrument_volume.py` | component repo | 0 | PASS | 16 passed in 5.11s. Narrow story test run. |
| `uv run pytest -m postgres` | component repo | 0 | PASS | 39 passed, 122 deselected, in 7.13s; two upstream deprecation warnings. |
| `uv run pytest -m 'not postgres'` | component repo | 0 | PASS | 122 passed, 39 deselected, in 12.80s; two upstream deprecation warnings. |
| `uv run pytest` | component repo | 0 | PASS | 161 passed in 21.83s; two upstream deprecation warnings. |
| `uv run ruff check .` | component repo | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | component repo | 0 | PASS | 69 files already formatted. |
| `uv run mypy src` | component repo | 0 | PASS | No issues in 19 source files. |

### Validation Side Effects

- Before: `## usr/alvaro-de-jodra/CAP-001-E2-S1` (clean).
- After: `## usr/alvaro-de-jodra/CAP-001-E2-S1` (clean).
- Unexpected tracked-file changes: none. `uv sync` and `testcontainers` used ignored environment/container state only.

## Findings

No findings.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `tests/integration/test_instrument_add.py:61–72` calls `add_symbols` with equivalent raw forms and asserts one canonical row; focused and full test runs pass. |
| v1/IR-002 | RESOLVED | `tests/unit/test_no_instrument_delete.py:8–13` compares uppercase text with uppercase forbidden SQL; a source `rg` finds no prohibited statement in `src`. |
| v1/IR-003 | RESOLVED | `tests/integration/test_instrument_list.py:44–72` adds 3,000 instruments, retires one, then asserts filters, two keyset pages, and 2,999/1 counts. |
| v1/IR-004 | RESOLVED | `tests/integration/test_instrument_volume.py:11–25` replaces one of 3,000 inputs with `1BAD` and asserts malformed/2,999-added/2,999-persisted behavior. |

## Scope and Plan Deviations

- None. The task plan's present-schema limitation for observation, coverage, and run-result rows remains explicitly documented in the required future-table TODO; no later-story behavior was implemented prematurely.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Synchronize component documentation from this passing implementation review, after the report is committed.
- **Warnings accepted downstream**: N/A
