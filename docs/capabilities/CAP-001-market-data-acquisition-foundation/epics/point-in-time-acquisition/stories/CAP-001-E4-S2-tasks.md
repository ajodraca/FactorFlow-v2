---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S2-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-17
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-16T04:00:28Z
  source_artifacts:
    - id: CAP-001-E4-S2
      version: "1"
    - id: CAP-001-component-design-observation-writer
      version: "approved"
    - id: CAP-001-component-design-market-data-store
      version: "approved"
    - id: tech-stack
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E4-S2 — Deterministic Value Hashing

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E4-tasks`
**Date**: 2026-09-11

## Summary

Create the pure ingestion hashing module that turns an observation-value dictionary into compact, deterministic JSON and returns its SHA-256 digest as 32 raw bytes. The module makes identical values conflict on the observation-table natural key across runs, while a changed value remains distinguishable for append-only restatement storage.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-5 | A restated acquired value is recorded as a new value rather than replacing the earlier value. | T001, T002 |
| AC-6 | Re-acquiring an identical value does not duplicate, overwrite, or remove it. | T001, T002 |
| DAC-E4-3 | Hash canonical JSON with sorted keys, no whitespace, decimal strings, and SHA-256. | T001, T002 |
| DAC-E4-S2-1 | Equal dictionaries with different insertion order produce equal digests. | T001, T002 |
| DAC-E4-S2-2 | `Decimal` values render as strings without float representation. | T001, T002 |
| DAC-E4-S2-3 | Unsupported values raise rather than being silently coerced. | T001, T002 |
| DAC-E4-S2-4 | The returned digest is 32 raw bytes. | T001, T002 |
| DAC-E4-S2-5 | A value differing in any field produces a different digest. | T001, T002 |

## Phase 1: Setup

**Purpose**: Reuse the existing Python `src/` layout and pytest configuration; this pure-function story introduces no dependency, configuration, database, or service setup.

**Checkpoint**: `src/factorflow/` remains the package root and unmarked pytest tests remain eligible for the `not postgres` selection.

---

## Phase 2: Tests (TDD)

**Purpose**: Define the canonicalization and fingerprint contract before the hashing module exists.

### Mandatory Component Tests

- [x] T001 Create `tests/unit/test_hashing.py` for TC-COMP-005, TC-COMP-006, TC-COMP-137, and TC-COMP-157 through TC-COMP-161. Include `# Implements TC-COMP-…` traceability comments; assert dictionary insertion order does not change `value_hash`; assert canonical bytes use sorted keys and `(',', ':')` separators; assert nested `Decimal('1.10')` serializes as the JSON string `"1.10"` and differs from `Decimal('1.1')`; assert a changed field changes the digest; assert identical input produces the same `bytes` digest of length 32; and assert floats plus unsupported objects raise rather than being coerced. Keep every test marked `not postgres` by leaving it unmarked.

### Additional Unit Tests

- [x] T002 [P] Extend `tests/unit/test_hashing.py` with focused error-path tests for unsupported values nested in dictionaries and lists, confirming the exception is raised before a digest is returned and no fallback to an object representation occurs. These tests sharpen DAC-E4-S2-3 beyond the generic component-test steps.

**Checkpoint**: `uv run pytest -m 'not postgres' tests/unit/test_hashing.py` fails because `factorflow.ingestion.hashing` does not yet exist.

---

## Phase 3: Core Implementation

**Purpose**: Add the single canonicalization path and SHA-256 fingerprint used by the later observation writer.

- [x] T003 Create `src/factorflow/ingestion/__init__.py` as the ingestion package marker and `src/factorflow/ingestion/hashing.py` with `canonical_json(value: dict[str, Any]) -> bytes` and `value_hash(value: dict[str, Any]) -> bytes`. Canonicalize recursively to JSON with sorted keys and `(',', ':')`, preserve `Decimal` as its exact string form, reject floats and every unsupported value with an exception, encode UTF-8, and return `hashlib.sha256(canonical_json(value)).digest()` as raw 32-byte `bytes`; do not include `observed_on`, `run_id`, or `recorded_at` in the value passed to this module (depends on T001, T002).

**Checkpoint**: The pure functions make the mandatory tests pass and return the same raw SHA-256 digest in independent process invocations for equivalent values.

---

## Phase 4: Integration

**Purpose**: Expose the hashing functions as an importable ingestion-module seam for the later observation writer without adding database or provider wiring to this isolated story.

**Checkpoint**: `factorflow.ingestion.hashing` imports cleanly and its two public functions are available to the later writer story.

---

## Phase 5: Polish

**Purpose**: Prove the new pure module meets repository quality gates and resists meaningful hashing regressions.

- [x] T004 Run from the repository root: `uv run pytest -m 'not postgres' tests/unit/test_hashing.py`, `uv run pytest -m 'not postgres'`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv build`. Record RED before T003 and GREEN after it; manually mutate sorted-key handling, decimal string conversion, float rejection, and SHA-256 output in turn, confirming a named test fails for each mutation (depends on T003).

**Checkpoint**: The mapped component tests, additional error-path tests, and all required quality checks pass with RED→GREEN→MUTATE evidence.

---

## Dependencies & Execution Order

### Task Dependencies

- T001 and T002 have no dependencies and can run in parallel in the same test file only after coordinating edits.
- T003 depends on T001 and T002 being written and observed failing.
- T004 depends on T003.

### Parallel Opportunities

- T001 and T002 cover separate behaviors and may be authored in parallel with coordinated edits to `tests/unit/test_hashing.py`.

### Phase Dependencies

- Phase 3 begins only after Phase 2's failing tests are observed.
- Phase 4 follows Phase 3's importable implementation seam.
- Phase 5 begins only after the implementation makes Phase 2 green.

## Validation Plan

### Constitution-Defined Commands

- Build: `uv build`
- Test: `uv run pytest`
- Non-container test: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation

- Run `uv run pytest -m 'not postgres' tests/unit/test_hashing.py` to assert canonical JSON bytes, decimal preservation, float and unsupported-type rejection, cross-order equality, changed-value inequality, and a 32-byte raw digest.
- Run the focused test module in two separate `uv run pytest` processes to confirm no module-level state affects digest values.
- Verify that mutating key sorting, compact separators, decimal handling, float rejection, or the digest algorithm causes its corresponding named test to fail.

## Notes

### Resolved Conflicts

- The illustrative `json.dumps(..., default=...)` code in `component-design-observation-writer.md` §2.3 would serialize a Python `float` without calling `default`, while the story's Testing section requires float input to raise and the same design says floats must not enter the digest. The story requirement and design's normative prose govern the illustrative snippet; T001 and T003 explicitly reject floats.

### Open Gaps

- None. SHA-256, the canonical JSON rules, raw 32-byte output, and the observation-table contract are fixed by CAP-001-E4-S2, `component-design-observation-writer.md` §2.3, and `component-design-market-data-store.md` §2.3.

### Other Notes

- `value_hash` deliberately fingerprints only the supplied observation values. The later observation writer owns composing that dictionary and must exclude run-specific metadata so an identical re-run reaches the existing natural-key conflict.
- No property-test dependency is declared in `pyproject.toml`; this plan uses deterministic pytest examples rather than adding an unapproved dependency.
