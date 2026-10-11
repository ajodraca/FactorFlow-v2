---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S2-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-10-11
last_reworked_review: CAP-001-E3-S2-implementation-review-v3.md
docs_synced_review: CAP-001-E3-S2-implementation-review-v5.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: unknown
  timestamp: 2026-09-11T19:57:33Z
  source_artifacts:
    - id: CAP-001-E3-S2
      version: "1"
    - id: CAP-001-component-design-massive-client
      version: "7"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-observation-writer
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E3-S2 — Provider Response Models in the Product's Vocabulary

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E2-S4`
**Date**: 2026-09-11

## Summary

Create the Pydantic response models that keep Massive wire names inside the ingestion boundary and give downstream code product-named, validated observations. The models expose the typed fields required by the four observation-table natural keys and columns, retain the value payload used for append-only hashing, serialize every monetary value as `Decimal`, and never own `observed_on`, `run_id`, or `recorded_at`—those belong to the writer and run lifecycle.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-5 | Provider filing date remains descriptive and is never an as-of date. | T004, T006, T007 |
| DAC-E3-12 | Wire field names remain within `massive-client`; callers receive product vocabulary. | T003, T004, T005, T006 |
| DAC-E3-S2-1 | Daily-bar wire fields map to named values. | T003, T007 |
| DAC-E3-S2-2 | Unix-millisecond bar time converts to an unambiguous session date. | T003, T007 |
| DAC-E3-S2-3 | Monetary and ratio values use `Decimal`, not `float`. | T004, T007, T008 |
| DAC-E3-S2-4 | Missing required data fails Pydantic validation. | T004, T007 |
| DAC-E3-S2-5 | An absent optional field remains absent, not zero. | T004, T007 |

## Phase 1: Setup

**Purpose**: Establish the model module and the four fixture-backed test destinations in the existing Python package layout.

- [x] T001 Create `src/factorflow/ingestion/__init__.py`, `src/factorflow/ingestion/massive/__init__.py`, and `src/factorflow/ingestion/massive/models.py`; create `tests/unit/test_massive_reference.py`, `tests/unit/test_massive_bars.py`, `tests/unit/test_massive_financials.py`, and `tests/unit/test_massive_actions.py` as the component design’s specified test locations.

**Checkpoint**: The package and test modules collect successfully; no additional dependency is required because Pydantic is already a transitive project dependency through FastAPI.

---

## Phase 2: Tests (TDD)

**Purpose**: Define the product vocabulary and persistence-compatible payload behavior with recorded provider fixtures before implementing parsing.

### Mandatory Component Tests

- [x] T002 [P] Implement TC-COMP-206 in `tests/unit/test_massive_reference.py`, `tests/unit/test_massive_bars.py`, `tests/unit/test_massive_financials.py`, and `tests/unit/test_massive_actions.py`: parse recorded provider-shaped inputs and assert public model attributes use the observation-table vocabulary rather than provider shorthand or wire keys.
- [x] T003 [P] Implement TC-COMP-215 and TC-COMP-216 in `tests/unit/test_massive_bars.py`: assert aliases map `t`, `o`, `h`, `l`, `c`, `v`, `vw`, and `n` to named bar attributes; assert `t` converts from Unix milliseconds using a timezone-aware UTC conversion to the `daily_bar.session_date` value.
- [x] T004 [P] Implement TC-COMP-005, TC-COMP-217, TC-COMP-218, and TC-COMP-219 in `tests/unit/test_massive_financials.py`: assert financial records preserve `filing_date` as `provider_filing_date`, use `Decimal` for monetary and ratio values, reject missing DDL-required fields, and distinguish an absent optional value from `Decimal("0")`.
- [x] T005 [P] Implement the corporate-action portion of TC-COMP-206 in `tests/unit/test_massive_actions.py`: assert each recorded split, dividend, ticker-change, and IPO input maps to an action with a product-named `action_type`, `effective_on`, and payload compatible with the `corporate_action` table’s `action_type`/`effective_on` natural key.

### Additional Unit Tests

- [x] T006 [P] Add payload-contract tests in `tests/unit/test_massive_reference.py`, `tests/unit/test_massive_bars.py`, `tests/unit/test_massive_financials.py`, and `tests/unit/test_massive_actions.py`: assert model serialization keeps `Decimal` values as strings for `canonical_json`, carries provider filing date only as descriptive value data, and contains no writer-owned `observed_on`, `run_id`, or `recorded_at` field.

**Checkpoint**: TC-COMP-005, TC-COMP-206, and TC-COMP-215 through TC-COMP-219 are represented with traceability comments and have been observed failing before model implementation begins.

---

## Phase 3: Core Implementation

**Purpose**: Implement four validated product models and their explicit alias and serialization behavior.

- [x] T007 Implement `TickerReference`, `DailyBar`, `FinancialStatement`, and `CorporateAction` in `src/factorflow/ingestion/massive/models.py`. Map provider keys through Pydantic aliases to the product fields required by `instrument_reference`, `daily_bar`, `fundamental_observation`, and `corporate_action` in `component-design-market-data-store.md` §2.3; retain a serializable value payload for fields held in JSONB. Use `Decimal` for price, ratio, and monetary data; make only the fields described as optional in the source provider contract optional; and document that `provider_filing_date` is descriptive and not an observation date.
- [x] T008 Add parsing and serialization helpers in `src/factorflow/ingestion/massive/models.py` that convert daily-bar Unix milliseconds to a timezone-aware UTC session date, produce deterministic JSON-compatible value payloads with decimals as strings, and reject unsupported or missing required input rather than silently coercing it. Do not add writer metadata or hashing logic; those belong to CAP-001-E4’s observation writer.

**Checkpoint**: All four provider response types validate into the storage-compatible product vocabulary, value payloads can be hashed deterministically, and validation errors remain available for CAP-001-E3-S3 to map to `ProviderContractViolation`.

---

## Phase 4: Integration

**Purpose**: Make the models consumable by the historical client without implementing that client’s provider calls.

- [x] T009 Update `src/factorflow/ingestion/massive/__init__.py` to expose only the product model types consumed by `src/factorflow/ingestion/massive/client.py`; do not expose Massive SDK response types or raw wire dictionaries beyond the package boundary.

**Checkpoint**: CAP-001-E3-S1 can import the four model types from the Massive package, while CAP-001-E3-S3 can catch their validation failure without duplicating model logic.

---

## Phase 5: Polish

**Purpose**: Prove the model contract survives the project’s static checks and required TDD mutation discipline.

- [x] T010 Run the S2 test files in `tests/unit/test_massive_reference.py`, `tests/unit/test_massive_bars.py`, `tests/unit/test_massive_financials.py`, and `tests/unit/test_massive_actions.py`; perform and document manual mutations for a bar alias, timestamp conversion, a `Decimal` annotation, a required field, and an optional field in `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S2-tdd-evidence.yaml` before marking implementation tasks complete.

**Checkpoint**: All mapped tests are green, each changed behavior has recorded RED→GREEN→MUTATE evidence, and lint, format, type, and build validation pass.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 precedes T002–T006 and T007–T009.
- T002–T006 may run in parallel after T001; T006 uses the model fixtures prepared by T002–T005.
- T007 depends on the RED tests in T002–T005.
- T008 depends on T003, T004, T006, and the core models in T007.
- T009 depends on T007/T008.
- T010 depends on T002–T009.

### Parallel Opportunities

- T002, T003, T004, and T005 affect separate test files and can run in parallel.
- T007’s four model definitions may be implemented independently within `src/factorflow/ingestion/massive/models.py`, provided they share the single approved payload serialization policy from T008.

### Downstream Consumers

- CAP-001-E3-S1 consumes these types in its historical read methods.
- CAP-001-E3-S3 maps validation failures from these models to `ProviderContractViolation`.
- CAP-001-E4 observation-writer consumes the product fields and value payloads, owns SHA-256 hashing, and supplies `observed_on` and `run_id`.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest`
- No-container test subset: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Static analysis: `uv run mypy src`

### Story-Specific Validation

- Run `uv run pytest -m 'not postgres' tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py`.
- Confirm `DailyBar` maps each required wire field, produces the DDL’s `session_date`, and uses no `float` field for values that will enter `daily_bar`.
- Confirm all monetary and ratio values serialized into payloads remain decimal strings; confirm payloads omit `observed_on`, `run_id`, and `recorded_at` so the writer’s value hash remains value-only.
- Confirm a missing required provider field raises Pydantic `ValidationError`, and an absent optional field differs from zero.
- Follow the RED → GREEN → MUTATE → STRENGTHEN → REFACTOR cycle and record each cycle’s test execution, commit hash, and manual mutation result in `CAP-001-E3-S2-tdd-evidence.yaml` before starting the next cycle.

## Notes

- `component-design-market-data-store.md` §2.3 is the persistence contract: `CorporateAction` is one product model keyed by `action_type` and `effective_on`, with variant-specific provider content retained in its JSONB payload. This avoids inventing a separate storage schema for the four provider endpoint variants.
- `component-design-observation-writer.md` §2.3 makes model payload serialization a compatibility surface: decimal values serialize as strings, while hashing and all runtime metadata remain writer-owned.
- No Massive SDK call, pagination, retry, error classification, database write, or hash implementation belongs to this story.
- **Attended owner decision, 2026-09-20:** CAP-001-E4's observation writer owns deriving `fundamental_observation.fiscal_period`; E3-S2 must not add that field to `FinancialStatement`. CAP-001-E4-S3 implementation planning must incorporate and test that derivation before its writer inserts fundamentals.
