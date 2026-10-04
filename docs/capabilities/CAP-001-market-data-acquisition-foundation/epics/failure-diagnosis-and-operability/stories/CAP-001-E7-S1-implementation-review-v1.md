---
artifact_schema_version: 1
artifact_id: CAP-001-E7-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: adversarial-review-agent
owner_github: ajodraca
created: 2026-10-04
updated: 2026-10-04
story_id: "CAP-001-E7-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-04T19:35:32Z"
reviewed_head: "721c8562e34fb03e0b7f37c3d65a9a72649cac24"
review_base: "03d8d67a3e1b23a03b0348be3488ea8fe1699c82"
reviewed_state_revision: "sha256:a8f3b2f93b1a165c405c8634c541b7b9ed779f6b35b31e7bb0469bb44682fd12"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E7-S1
    artifact_version: 1
    content_revision: sha256:1477facb3a3acce6b9aae2214b8474fecbf4a62691a438abd5669c4a5f6b7bda
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: unknown
  timestamp: "2026-10-04T19:35:32Z"
  source_artifacts:
    - id: CAP-001-E7-S1
      version: "1"
    - id: CAP-001-E7-S1-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E7-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 14/15 verified |
| Required validation | 8/9 passed |

**Verdict:** `CHANGES-REQUIRED`

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0 · **total 1**

The implementation correctly adds whole-run, row-based outcome counts, result-row symbols, and enumerated read filters without changing the established run paging contract. Independent focused PostgreSQL and unit validation passed, as did the non-PostgreSQL suite, lint, format, type, and build checks. The gate cannot pass because T001 requires a recorded characterization baseline *before any edit*, but remains unchecked and the only recorded T001 regression confirmation is commit `721c856` after all implementation commits. That historical prerequisite cannot truthfully be reconstructed or satisfied by checking the box now.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S1-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E7-S1-run-20261002T233024Z` |
| HEAD | `721c8562e34fb03e0b7f37c3d65a9a72649cac24` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E7-integration-20261002T233024Z` → `03d8d67a3e1b23a03b0348be3488ea8fe1699c82` |
| Working tree | clean before and after review validation; no staged or untracked files |
| Changed files reviewed | 10 |

`pipeline-state.py review-base` resolved the supplied integration ref to the recorded base, and that commit is an ancestor of `HEAD`. The review set included the committed range, index, working tree, and untracked non-ignored files; only the committed range was non-empty.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../CAP-001-E7-S1.md` | modified | lifecycle state for T001–T015 |
| `docs/.../CAP-001-E7-S1-tasks.md` | modified | T002–T015 completion and DEC-0021 record |
| `docs/.../CAP-001-E7-S1-tdd-evidence.yaml` | added | T015 durable per-cycle evidence |
| `src/factorflow/runs/queries.py` | modified | T011; AC-10, AC-11, DAC-E7-10, DAC-E7-S1-2, DAC-E7-S1-4 |
| `src/factorflow/api/models.py` | modified | T012; AC-10, DAC-E7-S1-2 |
| `src/factorflow/api/routes/runs.py` | modified | T013; AC-10, AC-11, DAC-E7-10, DAC-E7-S1-2, DAC-E7-S1-4 |
| `tests/integration/test_run_queries.py` | added | T002–T007; TC-COMP-010/011/066/068/075/078/079/080/081/082 |
| `tests/integration/test_api_runs.py` | modified | T010 API integration coverage |
| `tests/unit/test_runs_queries.py` | modified | T008 filter and query-model coverage |
| `tests/unit/test_api_models.py` | modified | T009 API-model coverage |

No changed file was unrelated to the story. `git diff --check` reported no whitespace errors.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `queries.py:102-112,450-482`; `models.py:220-241`; `routes/runs.py:239-270` | `test_detail_rows_name_instruments_and_keep_not_found_distinct`; `test_api_detail_includes_sql_outcome_counts_and_symbols` | Each read row receives the selected instrument's persisted symbol, data type, and stored reason. |
| AC-11 | SATISFIED | `queries.py:41-44,397-407`; `models.py:189-196`; `routes/runs.py:239-260` | `test_detail_rows_name_instruments_and_keep_not_found_distinct`; `test_api_detail_outcome_filter_preserves_counts_and_redacts_reason` | `not_found` remains a distinct result literal, filter value, and count. |
| DAC-E7-1 | SATISFIED | Existing all-data-type row query preserved at `queries.py:362-375` | `test_detail_keeps_all_data_types_for_an_instrument_on_one_page` / TC-COMP-066 | A per-instrument page retains four independently-outcome-bearing data-type rows. |
| DAC-E7-3 | SATISFIED | Read path returns persisted `reason` at `queries.py:471-482` | `test_detail_returns_pre_redacted_composed_failure_reasons` / TC-COMP-068 | Real composed reasons retain symbol, data type, and request id. |
| DAC-E7-10 | SATISFIED | `queries.py:67-82,409-459`; `routes/runs.py:111-188` | volume/filter tests and API invalid-enumeration test / TC-COMP-075 | Query filters are enumerated and bound; existing keyset paging is retained. |
| DAC-E7-S1-1 | SATISFIED | Existing `limit + 1` instrument selection at `queries.py:440-450` | `test_detail_pages_a_three_thousand_instrument_run` / TC-COMP-078 | Default page has 50 instruments; six 500-instrument pages cover all 3000 without a split. |
| DAC-E7-S1-2 | SATISFIED | Bound whole-run `_OUTCOME_COUNTS_SQL` at `queries.py:331-336`; zero defaults at `401-407`; API mapping at `routes/runs.py:239-260` | `test_run_detail_outcome_counts_cover_the_whole_run`; volume and API count tests / TC-COMP-079 | Owner-approved DEC-0007 shape is row-based, whole-run, filter/cursor independent, and additive. |
| DAC-E7-S1-3 | SATISFIED | Result query receives page instrument IDs at `queries.py:447-482` | `test_detail_keeps_all_data_types_for_an_instrument_on_one_page` / TC-COMP-080 | Tests show four contiguous rows for a mixed-outcome instrument at `limit=1`. |
| DAC-E7-S1-4 | SATISFIED | `ListFilters` membership validation at `queries.py:51-65`; established ordered keyset query at `259-293` | `test_run_history_orders_and_validates_state_filters` / TC-COMP-081 | Exact timestamp tie traversal, state filtering, and invalid-state rejection are covered. DEC-0021 validly sequences the mutually exclusive active states. |
| DAC-E7-S1-5 | SATISFIED | The read path returns the stored reason unchanged at `queries.py:471-482` | `test_detail_returns_pre_redacted_composed_failure_reasons`; `test_api_detail_outcome_filter_preserves_counts_and_redacts_reason` / TC-COMP-082 | Tests compose before storage with the production redactor and establish no synthetic credential appears in read/API output. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | incomplete | PARTIAL | `CAP-001-E7-S1-tdd-evidence.yaml:326-337`; commit `721c856` | No pre-edit baseline record exists; later regression confirmation is not a characterization baseline. See IR-001. |
| T002 | complete | VERIFIED | `test_run_queries.py:78-133`; `counts-red` evidence cycle | Mixed five-outcome run, one-instrument page, persisted-count preservation, and zero defaults are asserted. |
| T003 | complete | VERIFIED | `test_run_queries.py:136-198`; `result-row-identity-red` cycle | AAPL/ZZZZ identity, reasons, filtering, and failure/not-found distinction are meaningful assertions. |
| T004 | complete | VERIFIED | `test_run_queries.py:201-245`; `result-page-grouping-characterization` cycle | Characterization is correctly GREEN-on-arrival and checks no split at `limit=1`. |
| T005 | complete | VERIFIED | `test_run_queries.py:248-298`; `redacted-failure-reasons-characterization` cycle | Uses two production composer failure types and asserts safe stored/read values. |
| T006 | complete | VERIFIED | `test_run_queries.py:301-433`; `volume-paging-red` cycle | Database-side 3000×4 fixture validates boundaries, completeness, filters, and count invariance. |
| T007 | complete | VERIFIED | `test_run_queries.py:436-533`; `run-state-validation-red` cycle | DEC-0021 documents why active-state checks are sequential; tie-safe main list remains checked. |
| T008 | complete | VERIFIED | `test_runs_queries.py:79-145`; `query-filter-validation-red` cycle | DDL/API/query constants, valid/invalid inputs, and query count dataclass fields are checked. |
| T009 | complete | VERIFIED | `test_api_models.py:23-89`; `api-model-contract-red` cycle | Exact Pydantic fields, annotations, requiredness, and absence of secret-shaped fields are checked. |
| T010 | complete | VERIFIED | `test_api_runs.py:674-800`; `run-detail-api-red` cycle | API response shape, filtered count invariance, safe serialization, and shared 422 envelope are exercised. |
| T011 | complete | VERIFIED | `queries.py:37-148,331-499`; `query-counts-symbols-green` cycle | Uses bound SQL, all five zero-default fields, existing symbol selection, and local filter validation. |
| T012 | complete | VERIFIED | `models.py:201-241`; `api-models-green` cycle | Additive response-model fields retain all existing result and persisted count fields. |
| T013 | complete | VERIFIED | `routes/runs.py:22-31,111-188,239-270`; `run-detail-route-green` cycle | Literal types route unknown filters to the shared FastAPI 422 envelope; count/symbol mapping is complete. |
| T014 | complete | VERIFIED | `mutation-and-final-validation` evidence cycle; current test review | Each specified mutant has durable killed-mutant evidence; the final production diff is only test formatting. |
| T015 | complete | VERIFIED | all 13 cycles in `CAP-001-E7-S1-tdd-evidence.yaml` | Every T002–T014 cycle has a status, RED/GREEN evidence, APPROVED review result, no detected drift, test flag, and commit hash; no `REJECTED`/drift cycle was committed. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_detail_rows_name_instruments_and_keep_not_found_distinct` / TC-COMP-010, 011 | ADEQUATE | Uses direct DB reads and asserts symbol, id, type, reason, all ZZZZ not-found rows, and both outcome filters. | None. |
| `test_detail_keeps_all_data_types_for_an_instrument_on_one_page` / TC-COMP-066, 080 | ADEQUATE | Cursor traversal at `limit=1` proves the four mixed-outcome rows occur together. | None. |
| `test_detail_returns_pre_redacted_composed_failure_reasons` / TC-COMP-068, 082 | ADEQUATE | Runs real composers and checks safe diagnostic fields and absence of the synthetic credential in results and detail representations. | API serialization is separately checked by T010. |
| `test_detail_pages_a_three_thousand_instrument_run` / TC-COMP-075, 078 | ADEQUATE | SQL `generate_series` fixture validates default/max page behavior, no omissions/duplicates/splits, failure ordering, filtered traversal, and 12000-row count invariance. | None. |
| `test_run_detail_outcome_counts_cover_the_whole_run` / TC-COMP-079 | ADEQUATE | One-instrument page against a mixed whole-run fixture, plus a separate zero-default run, makes paging/filter leakage and omitted outcomes observable. | None. |
| `test_run_history_orders_and_validates_state_filters` / TC-COMP-081 | ADEQUATE | Validates ordering across a timestamp tie, keyset continuation, state filter, invalid input, and DEC-0021's sequential active states. | None. |
| `test_run_and_result_filter_enumerations_match_the_contract` | ADEQUATE | Cross-checks migration DDL, API `Literal`, query constant, every valid enum, invalid casing/empty input, and `None`. | None. |
| `test_run_detail_models_include_outcome_counts_and_symbols` | ADEQUATE | Checks exact model fields, annotations, requiredness, additive legacy fields, and no credential-shaped response field. | None. |
| `test_api_detail_*` and `test_api_run_filters_reject_unknown_enumerations` | ADEQUATE | Uses real PostgreSQL/TestClient to check serialized counts/symbol, filter-invariant totals, safe error envelope, and request id. | None. |

The tests are deterministic: database tests use isolated migrated containers, seed values are fixed except irrelevant UUIDs/timestamps, and the volume test prints elapsed time without asserting it. No mocks make the queried behavior inevitable.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `FactorFlow-v2` | 0 | PASS | Resolved 46 packages; checked 43. |
| `uv run pytest -m postgres tests/integration/test_run_queries.py tests/integration/test_api_runs.py` | `FactorFlow-v2` | 0 | PASS | 34 passed, 2 third-party deprecation warnings. |
| `uv run pytest tests/unit/test_runs_queries.py tests/unit/test_api_models.py tests/unit/test_api_runs_routes.py` | `FactorFlow-v2` | 0 | PASS | 24 passed, 2 third-party deprecation warnings. |
| `uv run pytest -m 'not postgres'` | `FactorFlow-v2` | 0 | PASS | 465 passed, 257 deselected, 2 third-party deprecation warnings. |
| `uv run pytest` | `FactorFlow-v2` | N/A | NOT RUN | Two full-suite invocations were started and later exited, but this execution host detached both command streams before their exit statuses/final summaries were emitted. This review does not credit the unobservable outcome. |
| `uv run ruff check .` | `FactorFlow-v2` | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | `FactorFlow-v2` | 0 | PASS | 171 files already formatted. |
| `uv run mypy src` | `FactorFlow-v2` | 0 | PASS | Success: no issues in 47 source files. |
| `uv build` | `FactorFlow-v2` | 0 | PASS | Source distribution and wheel built successfully. |
| `git diff --check 03d8d67..HEAD` | `FactorFlow-v2` | 0 | PASS | No whitespace errors. |

### Validation Side Effects

- Before: clean component tree on `usr/alvaro-de-jodra/CAP-001-E7-S1-run-20261002T233024Z` at `721c856`.
- After: clean component tree on the same branch and HEAD.
- Unexpected tracked-file changes: none. Build and pytest cache outputs were ignored; no validation command changed a tracked file.

## Findings

| Finding | Severity | Status |
|---------|----------|--------|
| IR-001 | HIGH | OPEN |

### IR-001 — T001's required pre-edit baseline has no durable evidence

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: N/A (process evidence)
- **Tasks**: T001, T014
- **Files**: `CAP-001-E7-S1-tasks.md:98`; `CAP-001-E7-S1-tdd-evidence.yaml:326-337`; commits `1eaa3cb..721c856`
- **Claim challenged**: The plan's completed later-cycle evidence is sufficient to satisfy the required pre-edit characterization baseline.
- **Observed evidence**: T001 is still unchecked. The first story-range commit is T002's new RED test (`1eaa3cb`), not a baseline record. The only T001-labelled command evidence occurs in the T014 cycle and calls itself a “regression confirmation after coding”; it is committed in `721c856`, after all implementation commits `05a8b68`, `0e7e5e9`, and `41246ca`.
- **Expected evidence/behavior**: T001 requires verification of its named producer seams and green unit/PostgreSQL characterization commands *before any file is edited*, then a recorded baseline. T014 requires that baseline to remain green.
- **Impact**: The required TEST-TDD-007 checkpoint and its temporal prerequisite cannot be established. Checking T001 now would incorrectly assert a historical fact.
- **Required remediation**: Do not mark T001 complete retroactively. The owner must either approve a revision/waiver that explicitly records the unavailable historical baseline and why the independently green current regression results are an acceptable substitute, or direct a clean restart that records T001 before the first story edit. Then rerun adversarial review against the revised, truthful evidence.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- DEC-0007 and DEC-0008 are owner-upheld and are correctly implemented as whole-run row counts and additive `symbol` fields.
- DEC-0021 is owner-recorded and correctly explains the sequential `running`/`cancelling` test setup required by the database's one-active-run constraint.
- Aside from IR-001's missing temporal baseline evidence, no scope leakage or unjustified implementation deviation was found.

## Follow-Up

- **Next agent**: Coding Agent after owner-approved task-plan revision/waiver, or Adversarial Review Agent after a clean restart.
- **Required action**: Resolve IR-001 truthfully and provide a fresh, observable full `uv run pytest` result; then commission a new independent adversarial review of this story.
- **Warnings accepted downstream**: N/A.
