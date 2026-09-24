---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S6-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: adversarial-review-agent
owner_github: none
created: 2026-09-24
updated: 2026-09-24
story_id: "CAP-001-E4-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-09-24T03:00:23Z"
reviewed_head: "bbd3daeba06fd3bf3121ec2227d0a4cb4264e45b"
review_base: "40e865e441f608a42b7ab1fe3cb342bee2edf6a4"
reviewed_state_revision: "sha256:15ba8426c828c0e8a9a420eac5641a30a2031120da0db178378af72e8756001b"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-09-24T03:00:23Z
  source_artifacts:
    - id: CAP-001-E4-S6
      version: 1
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E4-S6 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 3 |
| Low findings | 1 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 12/12 verified |
| Required validation | 5/5 passed |

Both HIGH findings from v2 are resolved. `tests/integration/test_runner_outcomes.py`
now scopes each error-outcome assertion to the data type the test actually made
fail, and asserts the unreached data types are `unchanged` — so the two tests now
prove DAC-E4-S6-6 rather than contradicting it. No production code changed in the
rework, which is the correct outcome: v2 established that the implementation was
already right.

The full suite passes with PostgreSQL available: **527 passed**, up from
`2 failed, 525 passed` at v2 and from the 402-passed/125-errored state in which v1
was conducted. This is the first review of this story where every required
validation command ran to completion and passed.

Regression sensitivity was verified rather than assumed. Mutating
`classify_provider_error` to map `InstrumentNotFound` to `"failed"` fails
TC-COMP-185 and TC-COMP-188; the mutation was reverted and `git diff src/` is
empty. The rescoped assertions therefore fail for the right reason and are not
vacuous.

Four findings remain open, all MEDIUM or LOW, all inherited and none blocking.
Three are test-strength gaps carried from v1 that the rework did not claim to
address; one is the validation-environment gap raised as v2/IR-003, whose
remediation lies outside what the Coding Agent may change. They are recorded as
accepted warnings below.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S6-tasks.md` |
| Component | FactorFlow-v2 |
| Branch | `usr/alvaro-de-jodra/CAP-001-E4-integration` |
| HEAD | `bbd3daeba06fd3bf3121ec2227d0a4cb4264e45b` |
| Review base | `origin/main` @ `40e865e441f608a42b7ab1fe3cb342bee2edf6a4` |
| Working tree | clean — no staged, unstaged, or untracked changes |
| Changed files reviewed | 11 (10 from v2's subject, plus the v2 report itself) |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `tests/integration/test_runner_outcomes.py` | modified | v2/IR-001, v2/IR-002; T003 |
| `src/factorflow/ingestion/outcomes.py` | modified | AC-10, AC-11, DAC-E4-S6-1..7; T007, T008 |
| `src/factorflow/ingestion/runner.py` | modified | DAC-E4-10, DAC-E4-S6-6; T009 |
| `src/factorflow/ingestion/writer.py` | modified | AC-10, DAC-E4-10; T010 |
| `tests/unit/test_outcomes.py` | added | T001, T002, T003, T006 |
| `docs/.../CAP-001-E4-S6.md` | modified | lifecycle status → `in-review` |
| `docs/.../CAP-001-E4-S6-tasks.md` | modified | `last_reworked_review`, `updated` |
| `docs/.../CAP-001-E4-S6-tdd-evidence.yaml` | added | T011, T012 |
| `docs/.../CAP-001-E4-S6-implementation-review-v1.md` | added | v1 gate report |
| `docs/.../CAP-001-E4-S6-implementation-review-v2.md` | added | v2 gate report |
| `README.md` | modified | doc-sync output (stale — see Follow-Up) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `outcomes.py:classify_provider_error` builds a per-data-type `InstrumentOutcomeRecord`; `writer.py:write_instrument_with_outcomes` persists it | `test_instrument_not_found_persists_not_found_outcome`, `test_provider_unavailable_persists_failed_outcome` (both now passing and correctly scoped) | "which data type was affected" is now asserted positively *and* negatively. |
| AC-11 | SATISFIED | `InstrumentNotFound` → `not_found`; `ProviderUnavailable`/`ProviderContractViolation` → `failed` | unit + integration counterparts | Mutation confirms `not_found` is distinguishable from `failed` at persistence. |
| DAC-E4-10 | SATISFIED | `classify_write_result` returns all four data types; `runner.py:222-329` merges `error_outcomes` over them | `test_distinct_outcomes_for_prices_and_fundamentals` | — |
| DAC-E4-11 | SATISFIED | cancellation check precedes any result write | `test_cancelled_before_reached_writes_no_row` | — |
| DAC-E4-15 | SATISFIED | safe reason accepted pre-composed; never re-composed | `test_safe_reason_persisted_retains_request_id_no_credential` | — |
| DAC-E4-S6-1 | SATISFIED | `classify_write_result` → `written` when appended > 0 | `tests/unit/test_outcomes.py` | — |
| DAC-E4-S6-2 | SATISFIED | `classify_write_result` → `unchanged` otherwise | `tests/unit/test_outcomes.py`; now also asserted end-to-end by the two rescoped tests | This is the branch v1's tests wrongly rejected. |
| DAC-E4-S6-3 | SATISFIED | `InstrumentNotFound` → `not_found`, run continues, finalisation `partial` | `test_instrument_not_found_persists_not_found_outcome` (ADEQUATE) | Upgraded from WEAK at v2. |
| DAC-E4-S6-4 | SATISFIED | `ProviderUnavailable` → `failed`, run continues, finalisation `partial` | `test_provider_unavailable_persists_failed_outcome` (ADEQUATE) | Upgraded from WEAK at v2. |
| DAC-E4-S6-5 | SATISFIED | no 429 branch in the runner's handlers | `test_rate_limit_does_not_produce_outcome_row` | Test remains WEAK — IR-002 below. |
| DAC-E4-S6-6 | SATISFIED | `runner.py:222-329` per-data-type `error_outcomes` | `test_distinct_outcomes_for_prices_and_fundamentals`, and now both rescoped tests | The criterion the v1 tests inverted is now directly asserted in three places. |
| DAC-E4-S6-7 | SATISFIED | reason carries provider request id, no credential | `test_safe_reason_persisted_retains_request_id_no_credential` | — |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | fixtures and helpers in both test modules | — |
| T002 | complete | VERIFIED | TC-COMP-183/184 present | Per-data-type gap remains — IR-003. |
| T003 | complete | **VERIFIED** | TC-COMP-185, TC-COMP-186, TC-COMP-188 present and passing | Upgraded from PARTIAL at v2; both integration assertions now match the criteria. |
| T004 | complete | VERIFIED | `test_rate_limit_does_not_produce_outcome_row`, `test_cancelled_before_reached_writes_no_row` | 429 not injected — IR-002. |
| T005 | complete | VERIFIED | `test_safe_reason_persisted_retains_request_id_no_credential` | Passes under PostgreSQL. |
| T006 | complete | VERIFIED | empty/mixed/unsupported-error unit cases | — |
| T007 | complete | VERIFIED | `InstrumentOutcomeRecord`, `classify_write_result` | — |
| T008 | complete | VERIFIED | `classify_provider_error` | `ValueError` for `CredentialRejected`, `TypeError` for unknown. |
| T009 | complete | VERIFIED | `runner.py:222-329` | — |
| T010 | complete | VERIFIED | `writer.py:write_instrument_with_outcomes` | — |
| T011 | complete | VERIFIED | `CAP-001-E4-S6-tdd-evidence.yaml` | — |
| T012 | complete | **VERIFIED** | `uv run pytest` = 527 passed; ruff, format, mypy, build all clean | Upgraded from PARTIAL at v2: the required full command now runs and passes. The environment prerequisite it depends on is unrecorded — IR-001. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_instrument_not_found_persists_not_found_outcome` / TC-COMP-185 | **ADEQUATE** | Asserts `reference == "not_found"` and every other data type `== "unchanged"` | None. Mutation-killed: misclassifying `InstrumentNotFound` fails it. |
| `test_provider_unavailable_persists_failed_outcome` / TC-COMP-186 | **ADEQUATE** | Asserts `reference == "failed"` and every other data type `== "unchanged"` | None. |
| `test_not_found_maps_to_not_found_outcome` / TC-COMP-185 (unit) | ADEQUATE | Direct classifier assertion | None. |
| `test_provider_unavailable_maps_to_failed_outcome` / TC-COMP-186 (unit) | ADEQUATE | Both error types → `failed` | None. |
| `test_distinct_outcomes_for_prices_and_fundamentals` / TC-COMP-188 | ADEQUATE | Mixed outcomes for one instrument | None. Also mutation-killed. |
| `test_safe_reason_persisted_retains_request_id_no_credential` / TC-COMP-189 | ADEQUATE | Credential excluded, request id retained, across all rows | None — correctly scoped. |
| `test_rate_limit_does_not_produce_outcome_row` / TC-COMP-145 | WEAK | Asserts outcome ∈ allowed set | No 429 injected at the runner boundary — IR-002. |
| TC-COMP-183 / TC-COMP-184 (integration) | WEAK | Aggregate assertions only | No per-data-type assertions for all four types — IR-003. |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | **PASS** | `527 passed, 2 warnings in 50.84s` — all 125 PostgreSQL-backed tests included. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Clean. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Clean. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success. |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | wheel + sdist produced. |

Mutation check (not a required command, recorded as evidence): with
`classify_provider_error` mutated to return `"failed"` for `InstrumentNotFound`,
`uv run pytest tests/integration/test_runner_outcomes.py` reported
`2 failed, 6 passed`, failing TC-COMP-185 and TC-COMP-188. Mutation reverted;
`git diff src/` empty.

### Validation Side Effects

- Before: clean working tree at `bbd3dae`.
- After: clean working tree at `bbd3dae`; `git status --porcelain` empty.
- Unexpected tracked-file changes: none. `dist/` and `.venv/` are ignored.

## Findings

### IR-001 — The required full-suite validation command depends on an unrecorded environment step

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012
- **Files**: `docs/.../CAP-001-E4-S6-tasks.md:122`, `pyproject.toml:19-27`
- **Claim challenged**: T012 lists `uv run pytest` as a required command.
- **Observed evidence**: From a venv without dev extras, `uv run pytest` aborts during collection with `ModuleNotFoundError: No module named 'hypothesis'`. `hypothesis` is declared only under `[project.optional-dependencies] dev`, which `uv run` does not install. This review's run required `uv sync --extra dev --frozen` first. CI is unaffected — `.github/workflows/validate.yml:43` runs `uv sync --all-extras`.
- **Expected evidence/behavior**: A required validation command should be executable as written, or the plan should name the environment step it depends on.
- **Impact**: This is the proximate reason v1's two defective tests reached a passing gate: the full suite was never executed. The risk recurs for any future local run.
- **Required remediation**: Owner decision — either record `uv sync --extra dev` as a prerequisite step of T012, or move the test dependencies into a group `uv run` installs by default. Carried from v2/IR-003; deliberately not actioned by the Coding Agent because both options lie outside its permitted edits.

### IR-002 — TC-COMP-145 does not inject a 429 at the runner boundary

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S6-5
- **Tasks**: T004
- **Files**: `tests/integration/test_runner_outcomes.py:405-435`
- **Claim challenged**: T004 claims TC-COMP-145 exercises the 429 path.
- **Observed evidence**: The test asserts only that every recorded outcome is in `{written, unchanged, not_found, failed}`. No `RateLimitExceeded` or 429 `side_effect` is configured, so the governor seam is never exercised.
- **Expected evidence/behavior**: DAC-E4-S6-5 requires that a 429 never surfaces as an outcome. Proving that needs a 429 injected where the runner would see it.
- **Impact**: The test would pass unchanged if the seam regressed and a 429 began producing an outcome row.
- **Required remediation**: Inject a 429/`RateLimitExceeded` at the client boundary and assert no `run_instrument_result` row carries a throttling label. Carried unchanged from v1/IR-001.

### IR-003 — TC-COMP-183 and TC-COMP-184 omit per-data-type assertions

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-10, DAC-E4-S6-6
- **Tasks**: T002
- **Files**: `tests/integration/test_runner_outcomes.py` (TC-COMP-183, TC-COMP-184 cases)
- **Claim challenged**: T002 claims these cover per-data-type recording.
- **Observed evidence**: Both assert aggregate behaviour without checking each of the four data types.
- **Expected evidence/behavior**: DAC-E4-10 requires the outcome to be recorded per data type as well as per instrument.
- **Impact**: Weaker regression cover for the seam. Materially reduced now that TC-COMP-185/186 assert all four data types, but the specific cases remain thin.
- **Required remediation**: Assert the outcome of each of the four data types. Carried unchanged from v1/IR-002.

### IR-004 — Stale docstring names a non-existent `write_instrument_outcome`

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009
- **Files**: `src/factorflow/ingestion/outcomes.py:182`
- **Claim challenged**: `write_error_results`'s docstring describes its replacement path.
- **Observed evidence**: Line 182 reads "``classify_provider_error`` + ``write_instrument_outcome`` replace this path". No such function exists; the real name is `write_instrument_with_outcomes`.
- **Expected evidence/behavior**: Documentation should name functions accurately.
- **Impact**: Misleads a maintainer reading that docstring.
- **Required remediation**: Rename the reference. Carried unchanged from v1/IR-003.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 — TC-COMP-185 asserts every data type is `not_found`, and fails | **RESOLVED** | `tests/integration/test_runner_outcomes.py` now builds `outcomes_by_data_type` and asserts `reference == "not_found"` with every other data type `== "unchanged"`. `uv run pytest` = 527 passed. Mutation of `classify_provider_error` fails the test, proving it is not vacuous. |
| v2/IR-002 — TC-COMP-186 asserts every data type is `failed`, and fails | **RESOLVED** | Same rescoping applied; `reference == "failed"`, others `unchanged`. Test passes and is mutation-sensitive. |
| v2/IR-003 — required full-suite command cannot run in the declared environment | **STILL OPEN** | `pyproject.toml:19-27` unchanged; `hypothesis` remains a `dev`-only extra. Re-raised here as IR-001. Deliberately not actioned — remediation requires a task-plan or dependency-layout edit outside the Coding Agent's permitted scope. |

v1's findings are carried forward through v2 and re-stated above as IR-002, IR-003
and IR-004; none was claimed resolved by this rework and none has current evidence
of resolution.

## Scope and Plan Deviations

- The rework changed test code only. `git diff 66f545da..HEAD -- src` is empty, confirming no production change — the correct outcome given v2 established the implementation was already right.
- No scope leakage; both edits trace to v2/IR-001 and v2/IR-002.
- All 12 tasks are marked `[x]` and all are now VERIFIED.
- `last_reworked_review` is set to `CAP-001-E4-S6-implementation-review-v2.md`, matching the report that requested the rework.

## Follow-Up

- **Next agent**: Doc Sync Agent, with this report.
- **Required action**: `docs_synced_review` in the tasks file still names `CAP-001-E4-S6-implementation-review-v1.md`. Doc sync must re-run against this report and update that marker to `CAP-001-E4-S6-implementation-review-v3.md`; until it does, the story cannot move past `docs-sync`. The README content written during the earlier doc-sync should be re-checked against the rescoped tests, though no documented behaviour changed.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (MEDIUM), IR-003 (MEDIUM), IR-004 (LOW).
