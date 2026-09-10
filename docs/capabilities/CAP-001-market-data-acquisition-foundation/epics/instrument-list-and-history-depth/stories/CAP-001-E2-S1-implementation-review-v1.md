---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-10
updated: 2026-09-10
story_id: "CAP-001-E2-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-10T13:22:27Z"
reviewed_head: "3b6ccea5a2e7dfd10e1c33516369afb43d7d8757"
review_base: "c3b79f6430294a9ec4ea51fdd44e87973b4edd28"
reviewed_state_revision: "sha256:cbe7e5a5a32cc642c173b326727992e3244d8234488001862efba6f1b38d5f42"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-09-10T13:22:27Z
  source_artifacts:
    - id: CAP-001-E2-S1
      version: "2"
    - id: CAP-001-E2-S1-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E2-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 4 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 18/20 verified |
| Required validation | 7/7 passed |

The domain implementation is consistent with the reviewed story: it normalises before its database lookup, makes lifecycle-only retirement updates, uses bound parameters, and all required commands pass. The gate fails because four required tests are absent or incapable of detecting the behavior they claim to cover. In particular, the no-delete test passes for a source string containing the prohibited statement.

**By severity:** CRITICAL 0 · HIGH 4 · MEDIUM 0 · LOW 0 · **total 4**

| Finding | Severity | Status |
|---------|----------|--------|
| IR-001 | HIGH | OPEN |
| IR-002 | HIGH | OPEN |
| IR-003 | HIGH | OPEN |
| IR-004 | HIGH | OPEN |

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S1-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E2-S1` |
| HEAD | `3b6ccea5a2e7dfd10e1c33516369afb43d7d8757` |
| Review base | `main` merge base `c3b79f6430294a9ec4ea51fdd44e87973b4edd28` |
| Working tree | Clean before validation; the only post-review change is this report. |
| Changed files reviewed | 13 committed files before this report |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../CAP-001-E2-S1-tasks.md` | modified | Task completion evidence, T001-T020 |
| `docs/.../CAP-001-E2-S1.md` | modified | Story status to `in-review` |
| `src/factorflow/instruments/__init__.py` | added | T001 |
| `src/factorflow/instruments/symbols.py` | added | T004, T012; DAC-E2-1, DAC-E2-S1-1/-2 |
| `src/factorflow/instruments/service.py` | added | T002, T013-T016; all story behavior |
| `tests/conftest.py` | modified | T003 |
| `tests/integration/test_instrument_add.py` | added | T005, T008 |
| `tests/integration/test_instrument_lifecycle.py` | added | T006, T009-T010 |
| `tests/integration/test_instrument_list.py` | added | T007 |
| `tests/integration/test_instrument_volume.py` | added | T019 |
| `tests/unit/test_no_instrument_delete.py` | added | T018 |
| `tests/unit/test_scope_boundaries.py` | added | T011 |
| `tests/unit/test_symbol_normalisation.py` | added | T004 |

No uncommitted or untracked implementation files were present. No scope leakage was identified in the reviewed change set.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | SATISFIED | `service.py:add_symbols`, `retire_symbol`, `list_instruments` (70-172) | add, lifecycle, and list integration tests | In-process domain surface is the story scope; HTTP is E2-S3. |
| AC-21 | SATISFIED | `retire_symbol` updates only `instrument.lifecycle` and `retired_at` (120-136); active roster query (175-181) | lifecycle tests; no-delete test is inadequate (IR-002) | Existing schema has no observation/coverage/run tables; source inspection finds no writes to them. |
| DAC-E2-1 | SATISFIED | `normalise` and `is_valid` (symbols.py:8-15); lookup uses normalised value (service.py:83-92) | `test_symbol_normalisation.py`; end-to-end canonical-row evidence is missing (IR-001) | Implementation is correct; mandatory regression test is weak. |
| DAC-E2-2 | SATISFIED | lifecycle classification and reactivation (service.py:94-115) | `test_add_reports_duplicate_active_and_reactivates_retired` | Preserves original identity and clears `retired_at`. |
| DAC-E2-5 | SATISFIED | No delete path; retirement is an `UPDATE` (service.py:120-136) | lifecycle test; structural test is inadequate (IR-002) | Repository search found no prohibited statement in production source. |
| DAC-E2-S1-1 | SATISFIED | `normalise` (symbols.py:8-10); called before lookup (service.py:83-90) | `test_normalise_trims_and_uppercases` | Production-path regression coverage is missing (IR-001). |
| DAC-E2-S1-2 | SATISFIED | regex and malformed branch (symbols.py:5, service.py:83-86) | invalid-shape parametrization; mixed-batch integration test | Rejected entries are not included in writes. |
| DAC-E2-S1-3 | SATISFIED | retired branch and `UPDATE ... retired_at = NULL` (service.py:98-115) | reactivation integration test | Same `instrument_id` asserted. |
| DAC-E2-S1-4 | SATISFIED | one transaction and per-symbol outcomes (service.py:80-117) | mixed-batch integration test | Valid addition survives invalid and duplicate inputs. |
| DAC-E2-S1-5 | SATISFIED | distinct exceptions (service.py:33-38, 120-136) | lifecycle exception test | Unknown and already-retired paths are distinguishable. |
| DAC-E2-S1-6 | SATISFIED | retirement contains only the targeted update (service.py:120-136) | lifecycle unchanged-row test and future-table TODO | Later owned tables do not exist; the plan's narrower present-state evidence is present. |
| DAC-E2-S1-7 | SATISFIED | filters, keyset cursor, total lifecycle counts (service.py:139-172) | list integration test | Correctness at 3000 instruments lacks required coverage (IR-003). |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/instruments/__init__.py` | Empty package marker exists. |
| T002 | complete | VERIFIED | `migrations/0001_extensions_owner_state.sql:16`; `service.py:3-5` | Existing unique index and required origin comment verified. |
| T003 | complete | VERIFIED | `tests/conftest.py:22-24,77-87` | Fixture applies migration 0001 to a fresh PostgreSQL database. |
| T004 | complete | PARTIAL | `symbols.py:5-15`; `test_symbol_normalisation.py:8-17` | Pure normalisation/shape tests exist, but do not prove normalisation occurs before lookup or insert (IR-001). |
| T005 | complete | VERIFIED | `test_instrument_add.py:23-40` | Both duplicate-active and reactivation identity/lifecycle assertions are meaningful. |
| T006 | complete | VERIFIED | `test_instrument_lifecycle.py:17-28` | Distinct exceptions asserted. |
| T007 | complete | VERIFIED | `test_instrument_list.py:16-41` | Prefix, lifecycle, two keyset pages, and counts are asserted. |
| T008 | complete | VERIFIED | `test_instrument_add.py:43-58` | Per-item outcomes and persisted rows are asserted. |
| T009 | complete | VERIFIED | `test_instrument_lifecycle.py:31-57` | All existing `instrument` columns/rows compared; required E4/E5 TODO present. |
| T010 | complete | VERIFIED | `test_instrument_lifecycle.py:60-72` | Active-only IDs and symbol order asserted. |
| T011 | complete | VERIFIED | `test_scope_boundaries.py:6-9` | E2-S2 settings module remains absent. |
| T012 | complete | VERIFIED | `symbols.py:1-15` | Single rule module and matching pattern exist. |
| T013 | complete | VERIFIED | `service.py:15-117` | Required enum, frozen outcome, transaction, and classifications exist. |
| T014 | complete | VERIFIED | `service.py:33-38,120-136` | Exceptions and lifecycle-only transition exist. |
| T015 | complete | VERIFIED | `service.py:41-67,139-172` | Dataclasses, filters, keyset paging, and total counts exist. |
| T016 | complete | VERIFIED | `service.py:175-181` | Active IDs return in symbol order. |
| T017 | complete | VERIFIED | independent `uv run pytest -m postgres` result | 37 PostgreSQL-marked tests passed. |
| T018 | complete | PARTIAL | `test_no_instrument_delete.py:6-10` | Case-mismatched assertion cannot detect the forbidden SQL (IR-002). |
| T019 | complete | PARTIAL | `test_instrument_volume.py:11-20` | It tests 3000 valid symbols, but not the required malformed-line failure scenario (IR-004). |
| T020 | complete | VERIFIED | Independent validation table | Every task-plan command passed. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_normalise_trims_and_uppercases` / TC-COMP-099, TC-COMP-111 | WEAK | Proves the pure function trims and uppercases. | Does not call `add_symbols` with equivalent raw forms or assert a single stored row; cannot detect removal of the production call to `normalise` (IR-001). |
| `test_invalid_normalised_symbols_are_rejected` / TC-COMP-112 | ADEQUATE | Covers `1AAPL`, 17 characters, and empty string against the exact shape validator. | None for the required unit validation behavior. |
| `test_add_reports_duplicate_active_and_reactivates_retired` / TC-COMP-100, TC-COMP-113 | ADEQUATE | Asserts two dispositions, original identity, active lifecycle, and cleared timestamp against PostgreSQL. | None. |
| `test_mixed_batch_commits_only_accepted_symbols` / TC-COMP-101, TC-COMP-114 | ADEQUATE | Exercises valid, duplicate-active, malformed outcomes together and checks committed rows. | None for this story's raw-list domain contract. |
| `test_retire_distinguishes_unknown_and_already_retired` / TC-COMP-103, TC-COMP-115 | ADEQUATE | Asserts the distinct domain exceptions. | HTTP status mapping is explicitly deferred to E2-S3. |
| `test_retirement_changes_only_the_target_instrument_lifecycle` / TC-COMP-116 | ADEQUATE | Compares target and non-target rows, and includes the plan-mandated future-table TODO. | Later-table behavior cannot be exercised before those tables exist. |
| `test_active_instrument_ids_excludes_retired_symbols_in_symbol_order` | ADEQUATE | Checks retirement removes exactly the retired ID and preserves deterministic order. | None. |
| `test_list_filters_and_keyset_pages_with_lifecycle_counts` / TC-COMP-108, TC-COMP-117 | WEAK | Exercises filters, pagination, and counts on four rows. | TC-COMP-108 requires search/filter at 3000 instruments; no list operation is exercised at that volume (IR-003). |
| `test_add_symbols_classifies_every_symbol_in_a_3000_symbol_batch` | WEAK | Proves every item in a 3000-valid-symbol batch receives `ADDED`. | Does not prove one malformed line leaves the other 2999 committed (IR-004). |
| `test_no_source_statement_deletes_an_instrument` | WEAK | Intended static scan of `src/factorflow`. | The uppercase haystack is searched with a lowercase needle and is therefore insensitive to the prohibited statement (IR-002). |

The PostgreSQL fixture uses isolated per-test databases, and the exercised tests are deterministic and do not mock the unit under test.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 42 packages; checked 39. |
| `uv run pytest tests/unit/test_symbol_normalisation.py tests/unit/test_no_instrument_delete.py tests/unit/test_scope_boundaries.py tests/integration/test_instrument_add.py tests/integration/test_instrument_lifecycle.py tests/integration/test_instrument_list.py tests/integration/test_instrument_volume.py` | component repo | 0 | PASS | 14 passed in 4.44s. Narrow story test run. |
| `uv run pytest -m postgres` | component repo | 0 | PASS | 37 passed, 122 deselected, in 6.54s; two upstream deprecation warnings. |
| `uv run pytest -m 'not postgres'` | component repo | 0 | PASS | 122 passed, 37 deselected, in 12.71s; two upstream deprecation warnings. |
| `uv run pytest` | component repo | 0 | PASS | 159 passed in 18.83s; two upstream deprecation warnings. |
| `uv run ruff check .` | component repo | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | component repo | 0 | PASS | 69 files already formatted. |
| `uv run mypy src` | component repo | 0 | PASS | No issues in 19 source files. |

### Validation Side Effects

- Before: `## usr/alvaro-de-jodra/CAP-001-E2-S1` (clean).
- After validation: `## usr/alvaro-de-jodra/CAP-001-E2-S1` (clean).
- Unexpected tracked-file changes: none. `uv sync` and testcontainers used ignored environment/container state only.

## Findings

### IR-001 — Canonicalisation is not tested through the database service

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-1, DAC-E2-S1-1
- **Tasks**: T004
- **Files**: `tests/unit/test_symbol_normalisation.py:8-17`; `src/factorflow/instruments/service.py:82-92`
- **Claim challenged**: T004 claims normalisation occurs before any lookup or insert and TC-COMP-099 proves equivalent forms are one row.
- **Observed evidence**: The only normalisation test calls `normalise` directly. No test calls `add_symbols` with `" aapl "` and `"AAPL"`, then asserts both the outcomes and one canonical database row. A regression removing the `normalise` call from `add_symbols` leaves this unit test green.
- **Expected evidence/behavior**: Story DAC-E2-1/DAC-E2-S1-1, T004, and TC-COMP-099 require canonicalisation before database use so two forms are one row.
- **Impact**: A regression at the service boundary can permit an invalid/non-canonical database write or fail instead of reporting a duplicate without the required test detecting it.
- **Required remediation**: Add a PostgreSQL-backed service test that adds equivalent whitespace/lowercase and canonical inputs and asserts the correct outcomes and exactly one canonical `instrument` row.

### IR-002 — The no-delete structural test cannot detect a forbidden delete

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-21, DAC-E2-5
- **Tasks**: T018
- **Files**: `tests/unit/test_no_instrument_delete.py:8-10`
- **Claim challenged**: T018 claims a static scan asserts no `DELETE FROM instrument` exists in `src/factorflow/`.
- **Observed evidence**: The test computes `statements.upper()` but searches for lowercase `"DELETE FROM instrument"`. Independent evaluation of that exact expression with the candidate `"DELETE FROM instrument"` returned `True`, meaning the assertion would pass even when the prohibited SQL is present.
- **Expected evidence/behavior**: T018 and component-design-instrument-list-service.md section 7 require a structural backstop for the no-delete lifecycle rule.
- **Impact**: A future destructive query can land while the claimed safeguard stays green, risking irreversible loss of point-in-time history.
- **Required remediation**: Make the comparison case-consistent and add a regression-sensitive assertion that fails for a prohibited statement in the scanned form.

### IR-003 — Required 3000-instrument list behavior is untested

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S1-7
- **Tasks**: T007
- **Files**: `tests/integration/test_instrument_list.py:16-41`; `tests/integration/test_instrument_volume.py:11-20`
- **Claim challenged**: T007 maps TC-COMP-108 and asserts the list supports filtering and paging.
- **Observed evidence**: The list test seeds four instruments. The sole 3000-item test calls `add_symbols` and never calls `list_instruments`; no test verifies prefix/lifecycle filtering, cursors, or counts at the mapped TC-COMP-108 scale.
- **Expected evidence/behavior**: TC-COMP-108 requires search and filter at 3000 instruments with active/retired counts; the component design section 5 identifies 3000 as the operating volume.
- **Impact**: Scale-sensitive query or pagination regressions can pass the full suite despite failing the mandatory component test contract.
- **Required remediation**: Add a PostgreSQL-backed 3000-instrument list test covering filtered/cursor results and lifecycle counts.

### IR-004 — The volume test omits the required malformed-line batch scenario

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S1-4
- **Tasks**: T019
- **Files**: `tests/integration/test_instrument_volume.py:11-20`
- **Claim challenged**: T019 claims the boundary test validates the bulk path at 3000 symbols.
- **Observed evidence**: The generated input contains 3000 valid symbols and asserts only `ADDED` dispositions. It does not exercise a malformed entry with accepted neighbors, nor assert that the other 2999 are committed.
- **Expected evidence/behavior**: Component-design-instrument-list-service.md section 8 acceptance criterion 10 requires a 3000-symbol batch with one malformed line to add the other 2999; section 7 identifies this as the bulk-at-volume test.
- **Impact**: The required all-or-nothing failure boundary is unprotected at the claimed request volume.
- **Required remediation**: Extend or add a 3000-item integration test containing one malformed symbol; assert its malformed disposition and verify every other symbol persisted.

## Previous Review Disposition

Not applicable — initial review. The retry began after a prior reviewer produced no report artifact.

## Scope and Plan Deviations

- No unjustified implementation scope changes found.
- The task plan intentionally constrains the present retirement test to the existing `instrument` schema and records the future-table extension in its TODO; this is justified by absent later-story tables.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework CAP-001-E2-S1 using this report and task plan: correct the four test gaps, rerun required validation, then request a new adversarial review.
- **Warnings accepted downstream**: N/A
