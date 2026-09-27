---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S5-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-21
docs_synced_review: CAP-001-E3-S5-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: unknown
  timestamp: 2026-09-11T20:36:50Z
  source_artifacts:
    - id: CAP-001-E3-S5
      version: "1"
    - id: CAP-001-component-design-massive-client
      version: "7"
    - id: CAP-001-component-design-runtime-config
      version: "6"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E3-S5 — Provider Failure Reasons and Credential Safety

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S5.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E2-S4`
**Date**: 2026-09-11

## Summary

Implement the Massive failure-reason composer at the typed-error boundary. It produces a reason that identifies the error kind, symbol, data type, and provider request ID without disclosing the credential; preserves the identifier even when diagnostic text is truncated; and gives the acquisition runner one safe string to persist later.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-13 | Stored or rendered failure reasons contain no provider credential. | T003, T006 |
| AC-11 | A typed not-found reason remains separable from a failed outcome. | T005, T006 |
| DAC-E3-13 | A reason names the symbol, data type, and provider request ID. | T002, T006 |
| DAC-E3-S5-1 | An absent request ID is explicit rather than fabricated or silently omitted. | T002, T006 |
| DAC-E3-S5-2 | Credential rejection states the rejection without echoing the key. | T003, T006 |
| DAC-E3-S5-3 | Pathological provider text is visibly truncated. | T004, T006 |
| DAC-E3-S5-4 | Each typed error produces a distinguishable reason kind. | T005, T006 |

## Phase 1: Setup

**Purpose**: Add the focused unit-test location beside the typed-error module delivered by CAP-001-E3-S3.

- [x] T001 Create `tests/unit/test_massive_failure_reasons.py`; import the four typed errors and the reason composer from `src/factorflow/ingestion/massive/errors.py` without importing the SDK or making a provider request.

**Checkpoint**: The new test module collects against the S3 taxonomy boundary only.

---

## Phase 2: Tests (TDD)

**Purpose**: Specify safe, complete, bounded owner-visible reason text before adding the composer.

### Mandatory Component Tests

- [x] T002 [P] Implement TC-COMP-207 and TC-COMP-232 in `tests/unit/test_massive_failure_reasons.py`: compose reasons for a typed error with a request ID and with `provider_request_id=None`; assert each reason includes the supplied symbol, data type, and request-ID field, and the absent case is rendered explicitly without inventing an ID.
- [x] T003 [P] Implement TC-COMP-013 and TC-COMP-233 in `tests/unit/test_massive_failure_reasons.py`: set a known credential-like fixture in the environment; compose each typed failure, including `CredentialRejected`, with diagnostic text containing that value; supply the client-style redaction callable and assert neither the returned reason nor its credential-rejected kind contains any substring of the fixture.
- [x] T004 [P] Implement TC-COMP-234 in `tests/unit/test_massive_failure_reasons.py`: use over-500-character diagnostic text and assert the variable segment ends with `…[truncated]`, while the assembled reason still includes its complete symbol, data type, error kind, and provider request ID.
- [x] T005 [P] Implement TC-COMP-235 in `tests/unit/test_massive_failure_reasons.py`: compose a reason for `InstrumentNotFound`, `CredentialRejected`, `ProviderUnavailable`, and `ProviderContractViolation`, then assert their error-kind portions are stable and distinguishable so `not_found` remains separable downstream.

### Additional Unit Tests

- [x] T006 [P] Add composition-boundary tests in `tests/unit/test_massive_failure_reasons.py`: assert diagnostic text is redacted before truncation, text at or below the 500-character bound is not marked truncated, a redact callback never receives the assembled symbol/data-type/request-ID fields, and no raw SDK exception or URL is accepted by the composer.

**Checkpoint**: TC-COMP-013, 207, and 232–235 are traceability-labelled RED tests, covering every typed error, secret boundary, explicit missing ID, and truncation boundary without a live provider.

---

## Phase 3: Core Implementation

**Purpose**: Add one safe reason-composition function to the existing Massive typed-error module.

- [x] T007 Add `MAX_FAILURE_REASON_VARIABLE_TEXT = 500` in `src/factorflow/ingestion/massive/errors.py`, following the named-constant/docstring style of `src/factorflow/api/bounds.py`; document the owner decision of 2026-09-11 and its derivation: 500 `MAX_PAGE_SIZE` reasons remain under roughly 250 KB, while the bound is about 2.5 times the approximately 200-character legitimate worst case from component-design-massive-client.md §4.
- [x] T008 Implement a reason composer in `src/factorflow/ingestion/massive/errors.py` that accepts a `MassiveError`, symbol, data type, and `redact: Callable[[str], str]`. Compose the fixed error kind, symbol, data type, and explicit request-ID state first; pass only the variable diagnostic text through `redact`; then bound that segment to 500 characters and append `…[truncated]` when needed. Map `CredentialRejected` to a fixed rejection description, never a supplied credential value, and reject unsupported error classes rather than silently emitting an untyped reason.

**Checkpoint**: A reason is constructed entirely from typed-error data; its stable identifying fields cannot be displaced by truncation, and its only variable segment is redacted before it is bounded.

---

## Phase 4: Integration

**Purpose**: Expose the safe composer to the future Massive client and acquisition-runner handoff without giving it settings ownership.

- [x] T009 Update `src/factorflow/ingestion/massive/__init__.py` to export the reason composer and `MAX_FAILURE_REASON_VARIABLE_TEXT` with the existing taxonomy types. CAP-001-E3-S1's `MassiveClient` supplies the credential-aware redaction closure; CAP-001-E4-S6 consumes only the resulting string for `run_instrument_result.reason`.

**Checkpoint**: The composer has a narrow, testable API: Massive-client owns credential-aware redaction and downstream code receives a safe reason string only.

---

## Phase 5: Polish

**Purpose**: Demonstrate that secrecy and diagnostic identity survive the boundary and its size limit.

- [x] T010 Run `tests/unit/test_massive_failure_reasons.py`; perform and record manual mutations for omission of each stable field, missing-ID rendering, removal or reordering of redaction, the 500-character threshold, truncation marker, and error-kind mapping in `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S5-tdd-evidence.yaml`.

**Checkpoint**: Mandatory tests are green, every mutation is killed or the test is strengthened, and no tested reason contains the credential fixture.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 precedes T002–T006.
- T002–T006 can run in parallel after T001.
- T007 depends on the RED truncation test in T004.
- T008 depends on the RED composition and secrecy tests in T002–T006, T007, and CAP-001-E3-S3's `MassiveError` hierarchy.
- T009 depends on T007/T008 and the package initializer from CAP-001-E3-S2.
- T010 depends on T002–T009.

### Parallel Opportunities

- T002, T003, T004, and T005 isolate independent externally visible reason properties and may proceed in parallel after T001.
- T007 can be added while test tasks are being completed; T008 follows once the tests establish the safe composition order.

### External Story Dependencies

- CAP-001-E3-S3 defines the four typed errors and their `provider_request_id` property.
- CAP-001-E3-S1's `MassiveClient` owns the usable credential and supplies the redaction closure; this story never loads configuration or unwraps `SecretStr`.
- CAP-001-E4-S6 persists the safe returned string as `run_instrument_result.reason` and maps typed outcomes to `not_found` or `failed`.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest`
- No-container test subset: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Static analysis: `uv run mypy src`

### Story-Specific Validation

- Run `uv run pytest -m 'not postgres' tests/unit/test_massive_failure_reasons.py`.
- Verify all four typed errors yield distinct error-kind text and every result contains symbol, data type, and either the provider request ID or explicit absence.
- Verify a diagnostic string holding a credential fixture is redacted before it is bounded, then assert the fixture is absent from the reason.
- Verify 500-character variable text is retained unmarked, 501-plus character text is visibly marked `…[truncated]`, and provider request ID survives either case.
- Follow RED → GREEN → MUTATE → STRENGTHEN → REFACTOR; record test execution, commit hash, and manual mutation results in `CAP-001-E3-S5-tdd-evidence.yaml`.

## Notes

- Owner decision, 2026-09-11: the reason composer's variable segment is bounded at 500 characters and marked `…[truncated]`; the stable error kind, symbol, data type, and provider request ID are composed first and never subject to the bound. The bound keeps a full `MAX_PAGE_SIZE = 500` run-detail response below roughly 250 KB of reason text while remaining about 2.5 times above the approximately 200-character legitimate worst case in component-design-massive-client.md §4.
- This is a genuine missing bound in component-design-massive-client.md, the store DDL, and `src/factorflow/api/bounds.py`, not a precedence conflict. Record it for the next massive-client design revision; do not edit source design artifacts in this story.
- Per owner decision, the composer accepts a credential-aware `redact` callback from `MassiveClient`, rather than receiving a raw credential or importing runtime configuration. The runner's persistence-time redaction remains a second defensive layer.
