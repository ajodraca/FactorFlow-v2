---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S1-tasks
artifact_type: story-tasks
artifact_version: 2
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-21
last_reworked_review: CAP-001-E2-S1-implementation-review-v1.md
docs_synced_review: CAP-001-E2-S1-implementation-review-v2.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-10T02:39:44Z
  source_artifacts:
    - id: CAP-001-E2-S1
      version: "2"
    - id: CAP-001-component-design-instrument-list-service
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "approved"
    - id: tech-stack
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E2-S1 — Instrument List Service: Add, Retire, Reactivate and Normalise

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-epics`
**Date**: 2026-09-06

## Summary

This story delivers `src/factorflow/instruments/symbols.py` (normalisation and shape validation) and `src/factorflow/instruments/service.py` (`add_symbols`, `retire_symbol`, `list_instruments`, `active_instrument_ids`) — the domain logic behind the instrument list, operating directly on `psycopg` 3 connections with no ORM. Adding a symbol is a per-symbol classification (added, reactivated, duplicate-active, or malformed) computed inside one transaction, so a batch of rejections never discards accepted entries. Retirement is a lifecycle transition only: no code path deletes an `instrument` row, and every observation, coverage segment, and run result for a retired instrument is left untouched. The HTTP surface over this logic (`POST`/`DELETE`/`GET /api/instruments`) is out of scope — that is CAP-001-E2-S3.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-1 | Owner adds, removes, or lists instruments without editing config or the store directly | T007, T008, T010, T015 |
| AC-21 | Retirement stops further acquisition and retains every recorded observation | T006, T009, T014 |
| DAC-E2-1 | Symbol normalised to one canonical form on entry | T004, T012 |
| DAC-E2-2 | Duplicate-active reported as duplicate; duplicate-retired reactivated | T005, T013 |
| DAC-E2-5 | Retirement is a lifecycle transition, never a delete | T006, T014, T018 |
| DAC-E2-S1-1 | Whitespace/lowercase symbol trimmed and uppercased before lookup or insert | T004, T012 |
| DAC-E2-S1-2 | Symbol failing the shape regex after normalisation is rejected, no row written | T004, T012 |
| DAC-E2-S1-3 | Adding a retired symbol again returns it to active and clears `retired_at`, no second row | T005, T013 |
| DAC-E2-S1-4 | Mixed batch classifies each symbol independently; rejections never discard accepted entries | T005, T013 |
| DAC-E2-S1-5 | Retiring an unknown symbol is reported unknown, distinguished from already-retired | T006, T014 |
| DAC-E2-S1-6 | Retirement modifies no observation, coverage segment, or run result | T009, T014 |
| DAC-E2-S1-7 | List supports symbol prefix filter, lifecycle filter, cursor paging, and active/retired counts | T007, T015 |

## Phase 1: Setup

**Purpose**: Add the migration this story owns (the `instrument.symbol` unique index) and the package scaffolding for the `instruments` module. `pyproject.toml`, `src/` layout, and the `tests/conftest.py` `testcontainers` fixture already exist from CAP-001-E1-S1/E1-S2 and are reused unchanged.

- [x] T001 Create `src/factorflow/instruments/__init__.py` as an empty package marker
- [x] T002 [P] Verify migration `0001_extensions_owner_state.sql` (delivered by CAP-001-E1-S1) already contains `CREATE UNIQUE INDEX idx_instrument_symbol ON instrument (symbol);`. If present, no new migration is needed — record this in a code comment at the top of `service.py` noting the index's origin. If absent (e.g., E1-S1 shipped without it), add a new numbered migration file `migrations/000N_instrument_symbol_unique_index.sql` containing only that statement, per the "an applied file is never edited" rule. See Notes for the conflict this resolves.
- [x] T003 [P] Extend `tests/conftest.py` (from CAP-001-E1-S1/E1-S2) with a fixture that applies migration `0001` (and, if T002 added one, the new migration) to the `testcontainers` PostgreSQL instance and yields a connection with `instrument` ready for inserts — reused by every test in Phase 2

**Checkpoint**: `uv run pytest -m 'not postgres'` still collects cleanly; the `instrument` table, its four check constraints, and the unique index on `symbol` are all present and reachable through the `tests/conftest.py` fixture against a real PostgreSQL 16 container.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests for the mandatory component TC-IDs mapped from the coverage matrix, plus additional unit tests for the story's own edge cases, before `symbols.py` and `service.py` exist.

### Mandatory Component Tests

- [x] T004 [P] Implement TC-COMP-099 and TC-COMP-111 (symbol normalisation: trim and uppercase before any lookup or insert) in `tests/unit/test_symbol_normalisation.py` — assert `" aapl "` and `"AAPL"` both normalise to `"AAPL"`; assert a symbol failing `^[A-Z][A-Z0-9.-]{0,15}$` after normalisation raises or is flagged malformed, per TC-COMP-112 (DAC-E2-S1-2), including the cases the story's Testing section names: `"1AAPL"`, a 17-character symbol, and an empty string
- [x] T005 [P] Implement TC-COMP-100 and TC-COMP-113 (duplicate-active reported as duplicate; duplicate-retired reactivated, `retired_at` cleared, same `instrument_id`) in `tests/integration/test_instrument_add.py` — seed one active and one retired instrument, add each symbol again, assert dispositions `duplicate_active` and `reactivated`, and assert reactivation returns the original `instrument_id`
- [x] T006 [P] Implement TC-COMP-103 and TC-COMP-115 (retiring an unknown symbol is reported unknown, distinguished from one already retired) in `tests/integration/test_instrument_lifecycle.py` — call `retire_symbol` on a symbol never added and assert `InstrumentNotFound`; call it again on an already-retired symbol and assert `AlreadyRetired`, a distinct exception type
- [x] T007 [P] Implement TC-COMP-108 and TC-COMP-117 (list supports symbol prefix filter, lifecycle filter, cursor paging, and reports active/retired counts) in `tests/integration/test_instrument_list.py` — seed a mix of active and retired instruments, assert prefix filtering, lifecycle filtering, cursor-based pagination across pages, and that returned counts match the seeded active/retired totals
- [x] T008 [P] Implement TC-COMP-101 and TC-COMP-114 (mixed batch: valid, duplicate, and malformed symbols each classified independently, rejections never discard accepted entries) in `tests/integration/test_instrument_add.py` — add a batch of at least one valid, one duplicate-active, and one malformed symbol in a single call, assert all three dispositions are reported and only the valid/reactivated symbols are committed
- [x] T009 [P] Implement TC-COMP-116 (retirement modifies no observation, coverage segment, or run result) in `tests/integration/test_instrument_lifecycle.py` — this story has no observation/coverage/run tables to seed yet (they arrive in later E1/E3/E5 stories), so assert the narrower, currently-verifiable claim: retiring an instrument changes only `instrument.lifecycle` and `instrument.retired_at` on that row, and no other column or row in `instrument` is touched. Add a `# TODO(CAP-001-E5, CAP-001-E4)` comment noting this test should be extended once `run_instrument_result` and coverage tables exist, so DAC-E2-S1-6 is fully exercised

### Additional Unit Tests

- [x] T010 [P] Write a unit test asserting `active_instrument_ids` excludes any instrument whose `lifecycle` is `retired` and includes every `active` one, ordered by `symbol`, in `tests/integration/test_instrument_lifecycle.py` — this is the mechanism AC-21 and AC-1 depend on for acquisition to actually stop
- [x] T011 [P] Write a unit test asserting `write history depth` is out of scope for this story (no `settings.py` file exists yet) is NOT accidentally implemented here — assert `src/factorflow/instruments/settings.py` does not exist, in `tests/unit/test_scope_boundaries.py`. This guards against scope creep into CAP-001-E2-S2, which owns history depth

**Checkpoint**: All tests above written and failing — `src/factorflow/instruments/symbols.py` and `src/factorflow/instruments/service.py` do not yet exist. `uv run pytest -m postgres` fails with import or assertion errors; `uv run pytest -m 'not postgres'` fails on T004 and T011.

---

## Phase 3: Core Implementation

**Purpose**: Implement normalisation, validation, and the four service functions the tests require.

- [x] T012 Create `src/factorflow/instruments/symbols.py` with a `normalise(raw: str) -> str` function (trim, uppercase) and a validation function/regex matching `^[A-Z][A-Z0-9.-]{0,15}$`, per `component-design-instrument-list-service.md` section 2.2 — this is the single module that normalises; no other module in this story duplicates the rule
- [x] T013 Create `src/factorflow/instruments/service.py` with the `Disposition` `StrEnum` (`ADDED`, `REACTIVATED`, `DUPLICATE_ACTIVE`, `MALFORMED`), the frozen `SymbolOutcome` dataclass, and `add_symbols(connection, raw_symbols) -> list[SymbolOutcome]`, per section 2.4 — normalise each symbol via `symbols.py`, then classify per the flowchart in section 2.3 (malformed → rejected with input echoed; unknown → `INSERT ... lifecycle = 'active'`; duplicate-active → rejected; duplicate-retired → `UPDATE lifecycle = 'active', retired_at = NULL`), committing all adds/reactivations and applying no rejections, in one transaction
- [x] T014 Add `retire_symbol(connection, symbol) -> None` to `src/factorflow/instruments/service.py`, raising `InstrumentNotFound` when the symbol is unknown and `AlreadyRetired` when it is already retired, otherwise setting `lifecycle = 'retired'` and stamping `retired_at`, per section 2.4 — define `InstrumentNotFound` and `AlreadyRetired` as exception classes in the same module since the design has no existing errors module for this component
- [x] T015 Add `list_instruments(connection, filters: InstrumentFilters) -> InstrumentPage` to `src/factorflow/instruments/service.py`, defining `InstrumentFilters` (symbol prefix, lifecycle, cursor, page size) and `InstrumentPage` (rows, next cursor, active count, retired count) as dataclasses in the same module — keyset-paginated on `symbol` per section 5, supporting prefix filter via `symbol LIKE 'PREFIX%'` and lifecycle filter via `WHERE lifecycle = %s`
- [x] T016 Add `active_instrument_ids(connection) -> list[int]` to `src/factorflow/instruments/service.py`, returning active instrument IDs ordered by `symbol`, per section 2.4 — this is the roster `acquisition-runner` (CAP-001-E4) reads at claim time

**Checkpoint**: `src/factorflow/instruments/symbols.py` and `src/factorflow/instruments/service.py` exist and export every function named in section 2.4. T004–T011 unit-level assertions pass in isolation (import succeeds, normalisation and validation logic behave correctly).

---

## Phase 4: Integration

**Purpose**: Prove `symbols.py` and `service.py` work together against a real PostgreSQL 16 instance with the actual `instrument` table and its constraints, closing out the mandatory component tests.

- [x] T017 Run the full `tests/integration/` suite from Phase 2 against the `testcontainers[postgres]` fixture (T003) with `symbols.py` and `service.py` now implemented, and fix any mismatch between application-level validation and the database's check constraints surfaced by TC-COMP-099–101, 103, 108, 111–117 — in particular, confirm `add_symbols`'s single-statement batch approach (`executemany`, per section 5) still produces per-symbol classification rather than an all-or-nothing transaction failure on the first constraint violation
- [x] T018 Add a static-scan unit test asserting no `DELETE FROM instrument` statement exists anywhere in `src/factorflow/`, in `tests/unit/test_no_instrument_delete.py`, per component design section 7 ("No delete statement exists") — this is the structural backstop for DAC-E2-5 and AC-21

**Checkpoint**: `uv run pytest -m postgres` passes in full. All mandatory TC-IDs mapped to this story (TC-COMP-099–101, 103, 108, 111–117) are green.

---

## Phase 5: Polish

**Purpose**: Close remaining edge cases named in the story's own Testing section and confirm the full validation suite is green.

- [x] T019 Add a test for the bulk-batch volume boundary named in component design section 5 (up to 3000 symbols per request) in `tests/integration/test_instrument_volume.py` — assert `add_symbols` completes within the suite timeout for a batch at that size and every symbol receives a disposition
- [x] T020 Run the complete validation plan (below) and confirm every command passes

**Checkpoint**: All acceptance criteria this story owns are satisfied; `uv run ruff format --check .`, `uv run ruff check .`, `uv run mypy src`, and `uv run pytest -m postgres` all pass.

---

## Dependencies & Execution Order

### Task Dependencies
- T001 has no dependencies.
- T002 depends on CAP-001-E1-S1's migration `0001` existing (external dependency, outside this story) — see Notes.
- T003 depends on T001 and the `tests/conftest.py` base fixture from CAP-001-E1-S1/E1-S2.
- T004–T011 (Phase 2) depend on T003; independent of each other, can run in parallel.
- T012 depends on Phase 1 only; write it to make T004 pass.
- T013 depends on T012 (`add_symbols` calls `normalise`); write it to make T005 and T008 pass.
- T014 depends on T012, T013 (shares the module and its exception types); write it to make T006 pass.
- T015 depends on T012, T013; write it to make T007 pass.
- T016 depends on T013; write it to make T010 pass.
- T017 depends on T012–T016 (Phase 3 complete).
- T018 depends on T013, T014 existing (scans the implementation once written).
- T019 depends on T017.
- T020 depends on every prior task.

### Parallel Opportunities
- Phase 1: T002, T003 in parallel after T001.
- Phase 2: T004, T005, T006, T007, T008, T009, T010, T011 all in parallel (distinct test files, or distinct test functions within the shared integration files).
- Phase 3: T015 and T016 can proceed in parallel once T012 and T013 exist; T014 can proceed alongside them.

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
- AC-1 / DAC-E2-S1-7: `list_instruments` returns correct results under a symbol prefix filter, a lifecycle filter, and cursor paging, with accurate active/retired counts.
- AC-21 / DAC-E2-S1-6: retiring an instrument leaves every other column and row in `instrument` unchanged, and (once later stories add observation/coverage/run tables) leaves those untouched too — tracked by the T009 `TODO`.
- DAC-E2-1 / DAC-E2-S1-1: `" aapl "` and `"AAPL"` both resolve to the same row via `add_symbols` called twice.
- DAC-E2-S1-2: `"1AAPL"`, a 17-character symbol, and an empty string are all rejected as malformed with no row written.
- DAC-E2-2 / DAC-E2-S1-3: adding a retired symbol again returns the original `instrument_id` and clears `retired_at`.
- DAC-E2-S1-4: a batch with valid, duplicate, and malformed symbols in the same call classifies each independently and commits only the accepted ones.
- DAC-E2-S1-5: retiring an unknown symbol raises `InstrumentNotFound`; retiring an already-retired symbol raises `AlreadyRetired` — the two are distinguishable exception types.

---

## Notes

- **Spec conflict — unique index ownership.** The story text (`CAP-001-E2-S1.md`, Data Changes section) states the unique index on `instrument.symbol` is deliberately *not* created by migration `0001` and instructs this story to add `CREATE UNIQUE INDEX instrument_symbol_key ON instrument (symbol);` in a new or the existing unapplied migration file. However, both `component-design-market-data-store.md` (section 2.3) and the already-planned `CAP-001-E1-S1-tasks.md` (T012) place `CREATE UNIQUE INDEX idx_instrument_symbol ON instrument (symbol);` inside migration `0001` itself, and `CAP-001-E1-S1-tasks.md` explicitly notes the index exists there specifically so E2-S1 can build reactivation semantics on top of it. As of this planning pass, neither migration file nor any `src/` code exists yet (both CAP-001-E1-S1 and CAP-001-E1-S2 are `status: planning`, not `in-progress` or `done`), so this cannot be resolved by inspecting delivered code. T002 handles both outcomes: verify the index if E1-S1 ships per its task plan and the component design (the more detailed, more recently authoritative sources), or add a new migration only if E1-S1 ships literally per its own story text instead. **This should be resolved in the story text before or during CAP-001-E1-S1's implementation**, since two approved artifacts currently disagree on which story owns this index.
- **DAC-E2-S1-6 is only partially testable in this story.** The observation, coverage-segment, and run-result tables it references belong to CAP-001-E1-S1/E1-S4 (schema), CAP-001-E4 (point-in-time acquisition), and CAP-001-E5 (run lifecycle), none of which exist yet. T009 tests the narrower, currently-available claim (retirement touches only the `instrument` row) and flags the gap with a `TODO` for later extension once those tables land — implementers of later stories should search for `TODO(CAP-001-E5, CAP-001-E4)` to find it.
- **No component test spec file per-TC-ID detail.** `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/component/all-component-tests.md` provides only generic Given/When/Then restatements of each DAC/AC for TC-COMP-099–117 (no story-specific preconditions or steps beyond the requirement text). The concrete test scenarios in Phase 2 above are therefore derived from the story's own "Testing" section, which is more specific, per the skill's guidance to treat the TC-IDs as mandatory coverage rather than as literal step-by-step scripts to transcribe.
- **`InstrumentNotFound` / `AlreadyRetired` have no prior home.** No shared exceptions module exists yet in `src/factorflow/`. This plan defines them in `service.py` alongside the functions that raise them; if a later story (e.g., CAP-001-E2-S3's HTTP layer, which must map them to 404/409) needs to import them from elsewhere, that story's task plan should either import from `service.py` directly or introduce a dedicated errors module — not duplicate the exception types.
