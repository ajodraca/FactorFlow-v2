---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S6-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: adversarial-review-agent
owner_github: none
created: 2026-09-24
updated: 2026-09-24
story_id: "CAP-001-E4-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-24T02:54:45Z"
reviewed_head: "66f545da67f05557ce7d1800c239c5cc5e28c992"
review_base: "40e865e441f608a42b7ab1fe3cb342bee2edf6a4"
reviewed_state_revision: "sha256:c26fb8c70e204bd3fdbbca7452bd2746931b82c6feb76666823f7b42fcc1d0fb"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E4-S6
    artifact_version: 1
    content_revision: sha256:124ce1dc6eb6375d06779c2e51e2ed25f61b175d23dad852bba428b5d26b8543
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-09-24T02:54:45Z
  source_artifacts:
    - id: CAP-001-E4-S6
      version: 1
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E4-S6 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 1 |
| Low findings | 0 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 10/12 verified |
| Required validation | 5/6 passed |

This re-review was requested by the owner after v1 returned PASS-WITH-WARNINGS. No
production or test code changed between v1's `reviewed_head` (`5a9fe43`) and this
review's `HEAD` (`66f545da`); the intervening commits carry only the v1 report and
doc-sync output. The subject is therefore the same code, reviewed in an environment
where the PostgreSQL-backed tests can actually execute.

**The production implementation is correct. Two of its own integration tests are
not, and they fail.** `uv run pytest` reports `2 failed, 525 passed`. Both failures
are in `tests/integration/test_runner_outcomes.py`, and both assert that *every*
data-type row for an instrument carries the error outcome. The implementation
records the error outcome only for the data type that actually failed and leaves
the unreached data types `unchanged` — which is what AC-10 requires ("which
instrument and **which data type** was affected"), what DAC-E4-S6-6 requires
(prices `written` while fundamentals `not_found` for one instrument), and what both
tests' own docstrings say they verify ("maps **only the reached** failing data
type").

The gate consequence is narrow and specific: every acceptance criterion is
satisfied by production code, but two mandatory component tests are WEAK, two
planned tasks are PARTIAL, and a required validation command fails. Under the
verdict rules any one of those forces CHANGES-REQUIRED.

Why v1 did not catch this is recorded here as evidence rather than as a finding
against the implementation. v1 could not execute the 125 PostgreSQL-backed tests —
it reported that exclusion honestly, as T012 required. But v1's own test-strength
table describes this defect verbatim while grading it ADEQUATE: *"asserts all rows
for instrument = failed"*. The defect was visible by inspection and was written
down. v1 also raised IR-002 against the *neighbouring* tests for omitting
per-data-type assertions, so it was reasoning about exactly this property in this
file at the time.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6-tasks.md` |
| Component | FactorFlow-v2 |
| Branch | `usr/alvaro-de-jodra/CAP-001-E4-integration` |
| HEAD | `66f545da67f05557ce7d1800c239c5cc5e28c992` |
| Review base | `origin/main` @ `40e865e441f608a42b7ab1fe3cb342bee2edf6a4` (resolved by `pipeline-state.py review-base`; matches v1's recorded `review_base`) |
| Working tree | clean — no staged, unstaged, or untracked changes |
| Changed files reviewed | 10 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/outcomes.py` | modified | AC-10, AC-11, DAC-E4-S6-1..7; T007, T008 |
| `src/factorflow/ingestion/runner.py` | modified | DAC-E4-10, DAC-E4-S6-6; T009 |
| `src/factorflow/ingestion/writer.py` | modified | AC-10, DAC-E4-10; T010 |
| `tests/unit/test_outcomes.py` | added | T001, T002, T003, T006 |
| `tests/integration/test_runner_outcomes.py` | added | T001, T002, T003, T004, T005 |
| `docs/.../CAP-001-E4-S6.md` | modified | lifecycle status (`planning` → `docs-sync`) |
| `docs/.../CAP-001-E4-S6-tasks.md` | modified | task checkboxes, `docs_synced_review` marker |
| `docs/.../CAP-001-E4-S6-tdd-evidence.yaml` | added | T011, T012 TDD evidence |
| `docs/.../CAP-001-E4-S6-implementation-review-v1.md` | added | v1 gate report |
| `README.md` | modified | doc-sync output |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `outcomes.py:classify_provider_error` builds `InstrumentOutcomeRecord(data_type=…, outcome=…, reason=…)`; `writer.py:write_instrument_with_outcomes` persists per data type | `test_safe_reason_persisted_retains_request_id_no_credential` (passes) | Verified directly against persisted rows: `{'data_type': 'reference', 'outcome': 'not_found', 'reason': '[not_found] symbol=UNKN …'}`. The mandatory tests for this AC are defective — see IR-001, IR-002. |
| AC-11 | SATISFIED | `outcomes.py:classify_provider_error` maps `InstrumentNotFound` → `"not_found"`, `ProviderUnavailable`/`ProviderContractViolation` → `"failed"` | `test_not_found_maps_to_not_found_outcome`, `test_provider_unavailable_maps_to_failed_outcome` (unit, both pass) | `not_found` is distinguishable from `failed` at classification and persistence. Integration counterparts are defective — IR-001, IR-002. |
| DAC-E4-10 | SATISFIED | `classify_write_result` returns all four schema data types; `runner.py:222-329` merges `error_outcomes` over them | `test_distinct_outcomes_for_prices_and_fundamentals` | Outcome recorded per data type as well as per instrument. |
| DAC-E4-11 | SATISFIED | `runner.py` cancellation check precedes any result write | `test_cancelled_before_reached_writes_no_row` | No row for an instrument never reached. |
| DAC-E4-15 | SATISFIED | `classify_provider_error` accepts an already-composed safe reason and neither re-composes nor re-redacts | `test_safe_reason_persisted_retains_request_id_no_credential` (passes with Docker) | Credential absence asserted across all rows — correctly scoped, unlike IR-001/IR-002. |
| DAC-E4-S6-1 | SATISFIED | `classify_write_result` → `"written"` when `*_appended > 0` | `tests/unit/test_outcomes.py` written-path cases | — |
| DAC-E4-S6-2 | SATISFIED | `classify_write_result` → `"unchanged"` when nothing appended | `tests/unit/test_outcomes.py` unchanged-path cases | This is the branch the two failing tests wrongly reject. |
| DAC-E4-S6-3 | SATISFIED | `InstrumentNotFound` → `"not_found"`; run continues; finalisation `partial` | `test_not_found_maps_to_not_found_outcome` (unit) | Integration test TC-COMP-185 is WEAK and failing — IR-001. |
| DAC-E4-S6-4 | SATISFIED | `ProviderUnavailable` → `"failed"`; run continues; finalisation `partial` | `test_provider_unavailable_maps_to_failed_outcome` (unit) | Integration test TC-COMP-186 is WEAK and failing — IR-002. |
| DAC-E4-S6-5 | SATISFIED | No 429/`RateLimitExceeded` branch exists in the runner's per-data-type handlers; governor absorbs 429 upstream | `test_rate_limit_does_not_produce_outcome_row` | Test asserts outcome ∈ allowed set rather than injecting a 429 — v1/IR-001, still open. |
| DAC-E4-S6-6 | SATISFIED | `runner.py:222-329` keeps `error_outcomes` per data type and merges over `classify_write_result` | `test_distinct_outcomes_for_prices_and_fundamentals` | This criterion is the direct contradiction of IR-001/IR-002's assertions. |
| DAC-E4-S6-7 | SATISFIED | Reason string carries provider request id; no credential composition in this module | `test_safe_reason_persisted_retains_request_id_no_credential` | — |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/unit/test_outcomes.py` fixtures; `tests/integration/test_runner_outcomes.py` helpers `_insert_instrument`, `_insert_claimed_run`, `_fetch_result_rows` | Real contracts imported; no local lookalikes. |
| T002 | complete | VERIFIED | TC-COMP-183/184 present in both unit and integration files | Per-data-type assertion gap remains — v1/IR-002, still open. |
| T003 | complete | **PARTIAL** | TC-COMP-185, TC-COMP-186, TC-COMP-188 present | The TC-COMP-185 and TC-COMP-186 *integration* tests assert behaviour the story forbids and fail. See IR-001, IR-002. |
| T004 | complete | VERIFIED | `test_rate_limit_does_not_produce_outcome_row`, `test_cancelled_before_reached_writes_no_row` | 429 not injected at the boundary — v1/IR-001, still open. |
| T005 | complete | VERIFIED | `test_safe_reason_persisted_retains_request_id_no_credential` | Passes under PostgreSQL; credential absence and request-id presence both asserted. |
| T006 | complete | VERIFIED | Empty `WriteResult`, mixed per-data-type, unsupported-error cases in `tests/unit/test_outcomes.py` | `TypeError`/`ValueError` paths covered. |
| T007 | complete | VERIFIED | `outcomes.py:InstrumentOutcomeRecord`, `classify_write_result` | Pure function, no I/O. |
| T008 | complete | VERIFIED | `outcomes.py:classify_provider_error` | Raises `ValueError` for `CredentialRejected`, `TypeError` for unknown types. |
| T009 | complete | VERIFIED | `runner.py:222-329` per-data-type try/except for reference, prices, fundamentals, corporate_actions | Comment correctly cites DAC-E4-S6-6. |
| T010 | complete | VERIFIED | `writer.py:write_instrument_with_outcomes` consumes typed records | Verified against persisted rows. |
| T011 | complete | VERIFIED | `CAP-001-E4-S6-tdd-evidence.yaml` records per-cycle evidence | — |
| T012 | complete | **PARTIAL** | TDD evidence records `uv run pytest -m 'not postgres'` = 382 passed | The required command is `uv run pytest`. It was not run as specified, and now fails. It also cannot be run from the declared environment without `uv sync --extra dev`. See IR-003. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_instrument_not_found_persists_not_found_outcome` / TC-COMP-185 (integration) | **WEAK** | Raises `InstrumentNotFound` from `fetch_reference`, then loops every row for the instrument asserting `outcome == "not_found"` | Contradicts AC-10, DAC-E4-S6-6 and its own docstring; **fails**. IR-001. |
| `test_provider_unavailable_persists_failed_outcome` / TC-COMP-186 (integration) | **WEAK** | Raises `ProviderUnavailable` from `fetch_reference`, then loops every row asserting `outcome == "failed"` | Same defect; **fails**. IR-002. |
| `test_not_found_maps_to_not_found_outcome` / TC-COMP-185 (unit) | ADEQUATE | Asserts `classify_provider_error` returns `not_found` with the given `data_type` and reason | None. |
| `test_provider_unavailable_maps_to_failed_outcome` / TC-COMP-186 (unit) | ADEQUATE | Asserts `ProviderUnavailable` and `ProviderContractViolation` both map to `failed` | None. |
| `test_distinct_outcomes_for_prices_and_fundamentals` / TC-COMP-188 | ADEQUATE | Mixed outcomes for one instrument; proves the per-data-type seam | None. |
| `test_safe_reason_persisted_retains_request_id_no_credential` / TC-COMP-189 | ADEQUATE | Injects a credential-bearing message; asserts stored reason excludes the credential and retains the request id, across all rows | Correctly scoped — the assertion is valid for every row. |
| `test_rate_limit_does_not_produce_outcome_row` / TC-COMP-145 | WEAK | Asserts every outcome ∈ `{written, unchanged, not_found, failed}` | Does not inject a 429 at the runner boundary, so it would pass even if the seam regressed. v1/IR-001, still open. |
| TC-COMP-183 / TC-COMP-184 (integration) | WEAK | Assert aggregate behaviour without per-data-type assertions for all four data types | v1/IR-002, still open. |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -q` | `repos/factorflow-v2/FactorFlow-v2` | 1 | **FAIL** | `2 failed, 525 passed, 2 warnings in 50.95s`. Failures: `test_instrument_not_found_persists_not_found_outcome`, `test_provider_unavailable_persists_failed_outcome`. |
| `uv run pytest -q -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `399 passed, 128 deselected`. Recorded for comparison only; not a substitute for the required full command. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Clean. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Clean. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success. |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `factorflow-0.1.0-py3-none-any.whl`, `factorflow-0.1.0.tar.gz`. |

Precondition applied before the suite could be collected at all:
`uv sync --extra dev --frozen` (exit 0) installed `hypothesis` and
`sortedcontainers`. Without it `uv run pytest` aborts during collection with
`ModuleNotFoundError: No module named 'hypothesis'`. See IR-003.

### Validation Side Effects

- Before: clean working tree at `66f545da`, no staged/unstaged/untracked changes.
- After: clean working tree at `66f545da`; `git status --porcelain` empty.
- Unexpected tracked-file changes: none. `dist/` and `.venv/` are ignored.

## Findings

### IR-001 — TC-COMP-185 integration test asserts every data type is `not_found`, and fails

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-10, AC-11, DAC-E4-S6-3, DAC-E4-S6-6
- **Tasks**: T003
- **Files**: `tests/integration/test_runner_outcomes.py:286-287`
- **Claim challenged**: T003 claims TC-COMP-185 is implemented, and v1 graded the integration counterpart ADEQUATE.
- **Observed evidence**: The test loops `for row in outcomes_for_instrument` and asserts `row["outcome"] == "not_found"` for every row. `uv run pytest` fails it: `AssertionError: Expected not_found, got unchanged`, on `{'data_type': 'corporate_actions', 'outcome': 'unchanged', 'reason': None}`. The `reference` row — the data type that actually failed — is correct: `{'data_type': 'reference', 'outcome': 'not_found', 'reason': '[not_found] symbol=UNKN data_type=reference request_id=req-nf-001: …'}`.
- **Expected evidence/behavior**: AC-10 requires "which data type was affected" to be recorded; DAC-E4-S6-6 requires distinct outcomes per data type for the same instrument; the test's own docstring states it "maps only the reached failing data type to `not_found`". Unreached data types must remain `unchanged`.
- **Impact**: A required validation command fails, so the story cannot pass its gate. The test as written would also reject the correct behaviour permanently, and would only pass if the implementation regressed to stamping every data type with the error outcome.
- **Required remediation**: Scope the assertion to the data type the test made fail (`reference`), and assert the remaining data types are `unchanged` so the test proves DAC-E4-S6-6 rather than contradicting it. Do not change production code.

### IR-002 — TC-COMP-186 integration test asserts every data type is `failed`, and fails

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-10, AC-11, DAC-E4-S6-4, DAC-E4-S6-6
- **Tasks**: T003
- **Files**: `tests/integration/test_runner_outcomes.py:326-327`
- **Claim challenged**: T003 claims TC-COMP-186 is implemented; v1's test-strength table records "asserts all rows for instrument = failed" and grades it ADEQUATE.
- **Observed evidence**: The test loops `for row in outcomes_for_instrument` and asserts `row["outcome"] == "failed"`. `uv run pytest` fails it: `AssertionError: assert 'unchanged' == 'failed'` on the `corporate_actions` row. The runner logged the reached failure correctly: `instrument=1 data_type=reference error: [unavailable] symbol=FAIL … request_id=req-pu-001`.
- **Expected evidence/behavior**: Identical to IR-001 — only the reached data type carries `failed`; unreached data types are `unchanged`.
- **Impact**: Same as IR-001; a second required-suite failure.
- **Required remediation**: Scope the assertion to `reference` and assert the other data types are `unchanged`. Do not change production code.

### IR-003 — The required full-suite validation command cannot run in the declared environment

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012
- **Files**: `docs/.../CAP-001-E4-S6-tasks.md:122`, `pyproject.toml:19-27`
- **Claim challenged**: T012 is checked complete with `uv run pytest` listed as a required command.
- **Observed evidence**: `uv run pytest` aborts during collection with `ModuleNotFoundError: No module named 'hypothesis'`. `hypothesis` is declared only under `[project.optional-dependencies] dev`, which `uv run` does not install. v1 worked around this with `uv run pytest -m 'not postgres' --ignore=tests/unit/test_fetch_plan.py`, describing it as a "pre-existing hypothesis gap".
- **Expected evidence/behavior**: Reviewer constraint 3 forbids substituting a narrower command for a required full command. The task plan's validation command must be executable as written, or the plan must name the environment step it depends on.
- **Impact**: The required full suite was never executed during v1, which is the proximate reason IR-001 and IR-002 reached a passing gate. The `--ignore` also silently dropped a whole unit-test module from the evidence.
- **Required remediation**: Either record `uv sync --extra dev` as a prerequisite step of T012's validation, or move the test dependencies so `uv run pytest` works from a clean checkout. Then rerun `uv run pytest` in full and record the real result.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 — TC-COMP-145 does not inject a 429 at the runner boundary | STILL OPEN | `git diff 5a9fe43..HEAD -- src tests` is empty; `test_rate_limit_does_not_produce_outcome_row` still asserts only outcome-set membership, with no `RateLimitExceeded` or 429 `side_effect`. |
| v1/IR-002 — TC-COMP-183/184 omit per-data-type assertions for all four data types | STILL OPEN | No test changes since v1. Note the irony recorded in the Gate Summary: this finding concerns the same property that IR-001/IR-002 here invert. |
| v1/IR-003 — Stale docstring names a non-existent `write_instrument_outcome` | STILL OPEN | `src/factorflow/ingestion/outcomes.py:182` still reads "``classify_provider_error`` + ``write_instrument_outcome`` replace this path". No function of that name exists. (v1's finding title misattributes the file to `runner.py`; its Files field correctly names `outcomes.py`.) |

## Scope and Plan Deviations

- No scope leakage. Every changed production and test file traces to a planned task.
- Bookkeeping inconsistency: T003 and T012 are checked complete but are PARTIAL on current evidence.
- `README.md` and the story/tasks lifecycle fields were changed by doc-sync after v1, which is expected for a story at `docs-sync`.
- This review was run at owner request against a stage the state engine reports as `COMPLETE` (`adversarial-review: COMPLETE — latest verdict is PASS-WITH-WARNINGS`). Per `docs/pipeline-state.md`, regeneration of a COMPLETE stage requires an owner request for refinement; that request is the basis for this version.

## Follow-Up

- **Next agent**: Coding Agent, with this report and `CAP-001-E4-S6-tasks.md`.
- **Required action**: Fix IR-001 and IR-002 by scoping the two integration assertions to the reached data type and asserting `unchanged` for the rest; address IR-003 by making T012's required command executable and rerunning it in full. Set `last_reworked_review: CAP-001-E4-S6-implementation-review-v2.md` in the tasks file, then return for a v3 review.
- **Warnings accepted downstream**: N/A — verdict is CHANGES-REQUIRED.
