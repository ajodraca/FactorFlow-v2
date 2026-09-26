---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S2-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-21
docs_synced_review: CAP-001-E2-S2-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T21:46:41Z
  source_artifacts:
    - id: CAP-001-E2-S2
      version: "1"
    - id: CAP-001-component-design-instrument-list-service
      version: "6"
    - id: tech-stack
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E2-S2 — History Depth Setting

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-epics`
**Date**: 2026-09-06

## Summary

This story delivers `src/factorflow/instruments/settings.py`, the read and write of the owner's stated history depth. Depth is stored as a number of years — re-evaluated on every run rather than fixed to a calendar date — held in `owner_setting` as a `jsonb` value under the fixed key `history_depth_years`. Reading an unset depth returns `None`, a real state distinct from zero, so downstream callers (the run precondition, the interface's Start action) can tell "never stated" apart from "stated as zero." Writing enforces only that the value is a positive integer; this module enforces no upper cap tied to any provider plan, because a depth beyond what the provider holds is issued as stated rather than silently truncated here. The HTTP surface (`GET`/`PUT /api/settings/history-depth`) is out of scope — that is CAP-001-E2-S3.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-2 | Product does not acquire to a depth the owner has not stated (this module supplies the absent-vs-set distinction the precondition checks) | T004, T009 |
| DAC-E2-7 | Depth read before it is ever set returns `null`, distinct from zero | T004, T009 |
| DAC-E2-12 | A depth beyond the provider plan is issued as stated; no shortfall handling here | T007, T012 |
| DAC-E2-S2-1 | Depth must be a positive integer; any other value rejected | T005, T010 |
| DAC-E2-S2-2 | Depth held in `owner_setting` as `jsonb` under a fixed key | T004, T005, T009, T010 |
| DAC-E2-S2-3 | Overwriting a set depth replaces it and advances `updated_at` | T006, T011 |
| DAC-E2-S2-4 | A depth read carries `updated_at` alongside the value | T008, T013 |
| DAC-E2-S2-5 | A depth of 50 years is recorded unchanged; no cap enforced here | T007, T012 |

## Phase 1: Setup

**Purpose**: No new package scaffolding is required — `src/factorflow/instruments/__init__.py` already exists (delivered by CAP-001-E2-S1), and `owner_setting` already exists from migration `0001` (CAP-001-E1-S1). This phase only extends the shared test fixture this story needs.

- [x] T001 Extend `tests/conftest.py` (from CAP-001-E1-S1/E1-S2/E2-S1) if needed so the `testcontainers` fixture used by integration tests exposes a connection with `owner_setting` ready for inserts — likely a no-op since `owner_setting` is created by migration `0001` alongside `instrument`, but confirm the existing fixture already applies that migration before this story's tests run

**Checkpoint**: The `tests/conftest.py` fixture provides a connection against a real PostgreSQL 16 container with `owner_setting` present and empty.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests for the mandatory component TC-IDs mapped from the coverage matrix, plus additional unit tests for the story's own edge cases, before `settings.py` exists.

### Mandatory Component Tests

- [x] T002 [P] Implement TC-COMP-105 (history depth stated as a number of years; reading before it is ever set returns `null`, distinct from zero) in `tests/integration/test_history_depth.py` — assert `get_history_depth()` returns `None` on an empty `owner_setting`, and that `None` is asserted with `is None` rather than a falsy check, so a future regression to `0` is caught
- [x] T003 [P] Implement TC-COMP-118 (a depth value must be a positive integer; any other value rejected) in `tests/integration/test_history_depth.py` — assert `set_history_depth` rejects `0`, a negative integer, and a non-integer (e.g., a float or string), per the story's own Testing section
- [x] T004 [P] Implement TC-COMP-119 (depth held in `owner_setting` as `jsonb` keyed by `setting_key`) in `tests/integration/test_history_depth.py` — after `set_history_depth(5)`, query `owner_setting` directly and assert the row's `setting_key` is `history_depth_years` and `setting_value` is the `jsonb` value `{"years": 5}`
- [x] T005 [P] Implement TC-COMP-120 (overwriting a set depth replaces it and advances `updated_at`) in `tests/integration/test_history_depth.py` — set a depth, record `updated_at`, set a new depth, and assert the row's `setting_value` reflects the new value and `updated_at` is later than the first write
- [x] T006 [P] Implement TC-COMP-121 (a depth read carries `updated_at` alongside the value) in `tests/integration/test_history_depth.py` — assert `get_history_depth()`'s return value exposes both the year count and the `updated_at` timestamp from the underlying row
- [x] T007 [P] Implement TC-COMP-122 (a depth of 50 years is recorded unchanged; no cap enforced here) in `tests/integration/test_history_depth.py` — call `set_history_depth(50)` and assert it is stored and read back unchanged, with no exception raised and no truncation applied

### Additional Unit Tests

- [x] T008 [P] Write a unit test asserting `get_history_depth()`'s return type distinguishes "never set" (`None`) from "set to any valid value" at the type level (e.g., an `Optional[HistoryDepth]` dataclass or equivalent, not a bare `Optional[int]` that would lose the `updated_at` DAC-E2-S2-4 requires), in `tests/unit/test_history_depth_types.py`
- [x] T009 [P] Write a unit test asserting `set_history_depth` uses bound parameters (no string-interpolated SQL) for both the `INSERT` and the `UPDATE`/upsert path, in `tests/unit/test_history_depth_sql_safety.py` — mirrors the injection-prevention pattern the component design section 4 requires elsewhere in this component

**Checkpoint**: All tests above written and failing — `src/factorflow/instruments/settings.py` does not yet exist. `uv run pytest -m postgres` fails with import errors; `uv run pytest -m 'not postgres'` fails on T008 and T009.

---

## Phase 3: Core Implementation

**Purpose**: Implement the read/write functions the tests require.

- [x] T010 Create `src/factorflow/instruments/settings.py` defining the constant `HISTORY_DEPTH_KEY = "history_depth_years"`, a `HistoryDepth` (or equivalently named) dataclass carrying `years: int` and `updated_at: datetime`, and `read_history_depth(connection: psycopg.Connection) -> HistoryDepth | None`, per `component-design-instrument-list-service.md` section 2.5 — returns `None` when no row exists for the key, otherwise the years value and `updated_at` from the row
- [x] T011 Add `write_history_depth(connection: psycopg.Connection, years: int) -> None` to `src/factorflow/instruments/settings.py` — raises `ValueError` for any `years` that is not a positive integer (per the design's stated `Raises ValueError below 1`), otherwise performs an upsert into `owner_setting` (`INSERT ... ON CONFLICT (setting_key) DO UPDATE SET setting_value = ..., updated_at = now()`) storing `{"years": years}` as the `jsonb` value and keyed by `HISTORY_DEPTH_KEY`, with no upper bound enforced

**Checkpoint**: `src/factorflow/instruments/settings.py` exists and exports `read_history_depth`, `write_history_depth`, and `HISTORY_DEPTH_KEY`. T008 and T009 unit-level assertions pass in isolation.

---

## Phase 4: Integration

**Purpose**: Prove `settings.py` works against a real PostgreSQL 16 instance with the actual `owner_setting` table, closing out the mandatory component tests.

- [x] T012 Run the full `tests/integration/test_history_depth.py` suite from Phase 2 against the `testcontainers[postgres]` fixture (T001) with `settings.py` now implemented, and fix any mismatch between the upsert logic and `owner_setting`'s actual column types surfaced by TC-COMP-105, 118–122
- [x] T013 Add an integration test asserting `read_history_depth` and `write_history_depth` operate correctly when called through the same connection `add_symbols`/`retire_symbol` (CAP-001-E2-S1) use, in `tests/integration/test_history_depth.py` — confirms no transaction-scoping assumption in one module breaks the other, since both live in the same `instruments` package and share `owner_setting`'s and `instrument`'s presence in migration `0001`

**Checkpoint**: `uv run pytest -m postgres` passes in full. All five mandatory TC-IDs mapped to this story (TC-COMP-105, 118, 119, 120, 121, 122) are green.

---

## Phase 5: Polish

**Purpose**: Confirm the full validation suite is green and the module's public surface matches what CAP-001-E2-S3's HTTP layer and CAP-001-E4's run-claim precondition will need.

- [x] T014 Add a docstring to `read_history_depth` and `write_history_depth` in `src/factorflow/instruments/settings.py` stating explicitly that `None` is a real state (never a default of zero) and that no upper bound is enforced here, so a future caller does not add a redundant cap check — per component design section 3's constraint "Depth is stated, never assumed"
- [x] T015 Run the complete validation plan (below) and confirm every command passes

**Checkpoint**: All acceptance criteria this story owns are satisfied; `uv run ruff format --check .`, `uv run ruff check .`, `uv run mypy src`, and `uv run pytest -m postgres` all pass.

---

## Dependencies & Execution Order

### Task Dependencies
- T001 depends on the `tests/conftest.py` base fixture from CAP-001-E1-S1/E1-S2/E2-S1 already existing.
- T002–T009 (Phase 2) depend on T001; independent of each other, can run in parallel (T002–T007 share one test file but exercise independent scenarios).
- T010 depends on Phase 1 only; write it to make T002 and T004 pass.
- T011 depends on T010 (shares the module, calls no function from it but is added to the same file); write it to make T003, T005, T006, T007 pass.
- T012 depends on T010 and T011 (Phase 3 complete).
- T013 depends on T012 and on CAP-001-E2-S1's `service.py` existing.
- T014 depends on T011.
- T015 depends on every prior task.

### Parallel Opportunities
- Phase 2: T002–T009 can be developed in parallel even though several land in the same file, since each covers an independent assertion.
- Phase 3: T010 and T011 are sequential (same file, `write_history_depth` calls no shared state from `read_history_depth` but both are simplest to write in one pass) — treat as one unit if preferred, or split as shown.

---

## Validation Plan

### Constitution-Defined Commands
- Install: `uv sync --all-extras`
- Test (full): `uv run pytest`
- Test (no container runtime): `uv run pytest -m 'not postgres'`
- Test (this story, container required): `uv run pytest -m postgres`
- Lint: `uv run ruff check .`
- Format check: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- AC-2 / DAC-E2-7: `read_history_depth()` returns `None` before any write, and this is asserted with `is None`, not a falsy check.
- DAC-E2-S2-1: `write_history_depth` rejects `0`, negative integers, and non-integer values.
- DAC-E2-S2-2: the `owner_setting` row for `history_depth_years` has a `jsonb` `setting_value` of the shape `{"years": <int>}`.
- DAC-E2-S2-3: writing a second value updates the same row (no second row created) and `updated_at` strictly increases.
- DAC-E2-S2-4: `read_history_depth()`'s return value exposes `updated_at`.
- DAC-E2-12 / DAC-E2-S2-5: `write_history_depth(50)` succeeds and is read back unchanged, proving no cap is enforced in this module.

---

## Notes

- **Upper bound question is explicitly out of scope here, and the story text does not mention one.** `component-design-instrument-list-service.md` Open Question 3 records a resolved decision that `write_history_depth` accepts an integer in `1..50`, with the bound described as living in this component ("`write_history_depth` accepts an integer in 1..50"). The story text and its Testing section, however, only ever assert that 50 is accepted and that 0/negative/non-integer values are rejected — it never asks for a rejection above 50, and DAC-E2-S2-5 explicitly says "this module records it unchanged and enforces no cap." This plan follows the story text and DAC-E2-S2-5 (no upper cap in `settings.py`) since the story is the artifact under a passed backlog gate for this specific unit of work, and the design's "1..50" note is not restated as a testable requirement anywhere in this story. If a 50-year ceiling is in fact intended to live in this module, that is a story-text gap that should be corrected before or during implementation — a task should not be added here to enforce a bound the story's own acceptance criteria and testing section contradict.
- **`read_history_depth`'s return shape is not fully specified by the component design.** Section 2.5 types it as `int | None`, but DAC-E2-S2-4 (added at story level, not present in the component design) requires the read to also carry `updated_at`. This plan resolves the gap by introducing a small `HistoryDepth` dataclass (T010) rather than changing the signature to a tuple or widening `int | None` incompatibly — this is a minor, additive interpretation of the design's interface, not a contradiction of it, since the design predates this story's derived AC.
- No component test spec entry for this story provides scenario-level detail beyond a restated Given/When/Then (same situation as CAP-001-E2-S1); the concrete test scenarios in Phase 2 are derived from the story's own "Testing" section, which is the more specific source.
- **Deleted `tests/unit/test_scope_boundaries.py` during T015 validation, owner-approved.** That file was added by sibling story CAP-001-E2-S1 (commit `3b6ccea`, task T011) as a scope-fence test asserting `src/factorflow/instruments/settings.py` must not yet exist, to prevent this story's work from being done early. Once T010 correctly created that file as this story's own approved deliverable, the fence's assertion (`assert not settings_path.exists()`) necessarily failed — the guard's condition is now satisfied by design, not violated. The file contained only that one obsolete test and no other assertions; it was removed rather than weakened, since a fence whose premise is invalidated by the story it was reserving work for has nothing left to check. Removal was confirmed appropriate and re-validated (full `uv run pytest`: 170 passed, 0 failed) before this story's status advanced to `in-review`.
