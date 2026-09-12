---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-11
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: unknown
  timestamp: 2026-09-11T20:11:11Z
  source_artifacts:
    - id: CAP-001-E3-S3
      version: "1"
    - id: CAP-001-component-design-massive-client
      version: "7"
    - id: CAP-001-component-design-rate-limit-governor
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E3-S3 — Provider Error Taxonomy

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E2-S4`
**Date**: 2026-09-11

## Summary

Implement the Massive failure taxonomy that reconstructs provider meaning from the SDK’s response-body-only exception. The module distinguishes an unrecognised instrument, rejected credential, temporary provider failure, and a successful response that fails model validation; preserves the provider request ID; prevents credential leakage; and classifies a rate-limit response as governor flow control rather than a provider failure.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-11 | An unrecognised symbol has a typed outcome that lets the runner continue. | T002, T006, T007 |
| DAC-E3-2 | Provider failures use the four named error types. | T002, T006 |
| DAC-E3-3 | Response envelopes accept either `message` or `error`, neither required. | T002, T006 |
| DAC-E3-4 | Malformed payloads are `ProviderUnavailable`, never not-found. | T002, T006 |
| DAC-E3-5 | Model-validation failures are `ProviderContractViolation`. | T004, T006 |
| DAC-E3-13 | Typed failures preserve provider request ID and exclude the credential. | T003, T006 |
| DAC-E3-S3-1 | `status: NOT_FOUND` becomes `InstrumentNotFound`. | T002, T006 |
| DAC-E3-S3-2 | API-key errors become `CredentialRejected` without leaking the key. | T003, T006 |
| DAC-E3-S3-3 | Valid JSON of an unknown shape becomes `ProviderUnavailable`. | T002, T006 |
| DAC-E3-S3-4 | Contract violations are fatal to the governor and are not retried. | T005, T007 |
| DAC-E3-S3-5 | Request ID is copied when present and is `None` when absent. | T003, T006 |
| DAC-E3-S3-6 | A `429` becomes governor flow control, not a raised provider failure. | T005, T007 |

## Phase 1: Setup

**Purpose**: Add the isolated taxonomy module and its deterministic unit-test locations.

- [x] T001 Create `src/factorflow/ingestion/massive/errors.py`, `tests/unit/test_massive_errors.py`, and `tests/unit/test_massive_error_classification.py`; retain the existing `factorflow.ingestion.massive` package created by CAP-001-E3-S2.

**Checkpoint**: The test modules collect and can import the empty taxonomy module without provider network access.

---

## Phase 2: Tests (TDD)

**Purpose**: Specify every envelope mapping, secret boundary, and governor outcome before implementing classification.

### Mandatory Component Tests

- [x] T002 [P] Implement TC-COMP-196, TC-COMP-197, TC-COMP-198, TC-COMP-220, and TC-COMP-222 in `tests/unit/test_massive_error_classification.py`: use substituted SDK `BadResponse`-equivalent body values to assert all four taxonomy types exist, a `NOT_FOUND` envelope becomes `InstrumentNotFound`, both `message` and `error` forms parse without being mandatory, and malformed or valid-but-unknown envelopes become `ProviderUnavailable` rather than `InstrumentNotFound`.
- [x] T003 [P] Implement TC-COMP-207, TC-COMP-221, and TC-COMP-224 in `tests/unit/test_massive_errors.py`: assert an API-key envelope becomes `CredentialRejected`; every typed error preserves the response `request_id` when present and `None` when absent; and no exception message, representation, or captured log record contains a known credential fixture.
- [x] T004 [P] Implement TC-COMP-199 in `tests/unit/test_massive_error_classification.py`: pass the `ValidationError` produced by a CAP-001-E3-S2 model fixture through the taxonomy boundary and assert `ProviderContractViolation` is raised without a partial parsed value.
- [x] T005 [P] Implement TC-COMP-223 and TC-COMP-225 in `tests/unit/test_massive_error_classification.py`: assert the taxonomy identifies a model contract violation as fatal input for the caller’s governor classifier, and identifies a Massive `429` as flow control rather than constructing any `MassiveError`; exercise the client-facing classification seam without testing governor retry behavior.
- [x] T006 [P] Implement TC-COMP-011 in `tests/unit/test_massive_errors.py`: assert a classified not-found failure retains a safe, provider-request-ID-bearing reason that an acquisition-runner can record per instrument without exposing a raw SDK exception or credential.

### Additional Unit Tests

- [x] T007 [P] Add classifier boundary tests in `tests/unit/test_massive_error_classification.py`: assert a documented not-found message is recognised when `status` is absent, an absent `message` and `error` still produces `ProviderUnavailable`, and response-body parsing never accesses a provider URL or credential.

**Checkpoint**: TC-COMP-011, 196–199, 207, and 220–225 have traceability comments, all failure paths are observed RED, and no test uses a live provider request.

---

## Phase 3: Core Implementation

**Purpose**: Implement the typed error hierarchy and safe response-body reconstruction in one provider-boundary module.

- [x] T008 Implement `MassiveError`, `InstrumentNotFound`, `CredentialRejected`, `ProviderUnavailable`, and `ProviderContractViolation` in `src/factorflow/ingestion/massive/errors.py`; store only a safe message and the optional provider request ID, preserve no raw SDK exception body or credential, and make the base error’s public string representation safe for later failure records.
- [x] T009 Implement the provider-body decoding and classification functions in `src/factorflow/ingestion/massive/errors.py`: parse the SDK response body as JSON; map `status == "NOT_FOUND"` or the documented not-found message to `InstrumentNotFound`; map API-key errors to `CredentialRejected`; map malformed and valid-but-unknown error envelopes to `ProviderUnavailable`; and map S2 Pydantic validation failures from a successful response to `ProviderContractViolation`.

**Checkpoint**: Every non-200 body is safely mapped from documented evidence, a `200` model-validation failure stays distinguishable, and the resulting exception can be persisted without provider URL or credential disclosure.

---

## Phase 4: Integration

**Purpose**: Supply the classification seam used by the synchronous client and rate-limit governor without duplicating either component’s behavior.

- [x] T010 Update `src/factorflow/ingestion/massive/__init__.py` to expose the taxonomy and safe decoding/classification primitives consumed by `src/factorflow/ingestion/massive/client.py`; do not expose the raw Massive SDK `BadResponse` type to callers. The client, as the caller identified by `component-design-rate-limit-governor.md` §2.3, adapts these primitives to `Outcome.THROTTLED`, `RETRYABLE`, or `FATAL`.

**Checkpoint**: CAP-001-E3-S1 can adapt decoded provider outcomes for the governor through the typed taxonomy, while CAP-001-E3-S4 remains the sole owner of pacing and retry behavior.

---

## Phase 5: Polish

**Purpose**: Run the required validation and demonstrate that classifications cannot silently degrade to an unsafe default.

- [ ] T012 Run `tests/unit/test_massive_errors.py` and `tests/unit/test_massive_error_classification.py`; perform and document manual mutations for `NOT_FOUND` detection, API-key detection, malformed-body fallback, validation-failure mapping, request-ID extraction, and 429 handling in `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3-tdd-evidence.yaml` before marking implementation tasks complete.

**Checkpoint**: Mandatory tests are green, each manual mutation is killed or the test strengthened, and no exception or log assertion permits a credential leak.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 precedes T002–T007 and T008–T010.
- T002–T007 can run in parallel after setup.
- T008 depends on the RED taxonomy and safety tests in T002, T003, and T006.
- T009 depends on T002, T004, T007, T008, and CAP-001-E3-S2’s `models.py` validation behavior.
- T010 depends on T008/T009 and on the package initializer created by CAP-001-E3-S2.
- T012 depends on T002–T010.

### Parallel Opportunities

- T002, T003, T004, T005, and T006 affect separate assertions or test files and may proceed in parallel after T001.
- T008 and the response-body decoding portion of T009 may be developed independently once their respective RED tests exist, then combined in `errors.py`.

### External Story Dependencies

- CAP-001-E3-S2 supplies the Pydantic validation failure classified as `ProviderContractViolation`.
- CAP-001-E3-S1 supplies the SDK calls and passes caught failures to this taxonomy.
- CAP-001-E3-S4 supplies the `Outcome` enum and governor; this story supplies its classifier input but does not implement retry or pacing.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest`
- No-container test subset: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Static analysis: `uv run mypy src`

### Story-Specific Validation

- Run `uv run pytest -m 'not postgres' tests/unit/test_massive_errors.py tests/unit/test_massive_error_classification.py`.
- Verify response bodies using `message`, `error`, neither field, malformed JSON, and valid but unknown JSON all take their documented safe paths.
- Verify a S2 `ValidationError` becomes `ProviderContractViolation`, while a Massive `429` becomes `Outcome.THROTTLED` and is never raised as a provider failure.
- Verify every typed error carries only the supplied provider request ID and contains no credential fixture in `str()`, `repr()`, or captured logs.
- Follow RED → GREEN → MUTATE → STRENGTHEN → REFACTOR; record test execution, commit hash, and manual mutation results in `CAP-001-E3-S3-tdd-evidence.yaml` before starting the next cycle.

## Notes

- Per the owner’s resolution, malformed and valid-but-unknown error envelopes classify as `ProviderUnavailable`; `ProviderContractViolation` is reserved exclusively for a `200` response that fails model validation. This follows, in precedence order, EPIC `CAP-001-E3` DAC-E3-4; story DAC-E3-4 and DAC-E3-S3-3; the mandatory test list; the coverage matrix; and component-design-massive-client.md §2.4 classification prose and §12 traceability.
- The conflicting illustrative comments in `component-design-massive-client.md` line 310 and `CAP-001-E3-S3.md` line 93 are non-normative and are intentionally not edited in this planning task.
- This story must never let raw provider error text, a request URL, or a credential reach a log record or a persisted failure reason.
