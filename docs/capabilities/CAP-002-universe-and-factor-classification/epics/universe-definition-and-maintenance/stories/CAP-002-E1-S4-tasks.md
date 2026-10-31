---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-18
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T22:10:00Z
  source_artifacts:
    - id: CAP-002-E1-S4
      version: "1"
    - id: CAP-002-component-design-universe-service
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E1-S4 — Universe Maintenance: Rename, Remove a Member and Retire

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S4.md`
**Component**: `FactorFlow-v2` (module `universe-service`, maintenance half)
**Branch**: `usr/alvaro-de-jodra/CAP-002-E1-tasks`
**Date**: 2026-10-17

## Summary

Add the three maintenance writes to `src/factorflow/universes/service.py`, the file CAP-002-E1-S3 creates: `rename(conn, universe_id, name) -> Universe`, `remove_member(conn, universe_id, symbol) -> datetime` and `retire(conn, universe_id) -> Universe`. Each runs in `with conn.transaction():`, takes `pg_advisory_xact_lock(UNIVERSE_WRITE_LOCK_KEY)` first, refuses an unknown or retired universe, appends exactly one event (`renamed`, `member_removed`, `retired`) and returns the replayed result. A rename ignores the universe's own name when checking uniqueness among active universes; removing a symbol that is not a current member raises `NotAMember`; removing the sole current member raises `LastMember` offering retirement; after `retire`, every write (retire, add, remove, rename) raises `UniverseRetired` while `get_universe` and `list_events` still return members and history. The module still issues `INSERT` only. All exceptions, `_take_lock`, `_normalise_name`, `_normalise_symbols`, `_require_active` and `_name_in_use(..., excluding=)` already exist from S3, so this story adds no exception, no SQL file and no packaging change. `create_from_filter` is CAP-002-E1-S5; the API routes that map these exceptions to HTTP are CAP-002-E1-S6, and the interface that shows the refusals is CAP-002-E1-S8.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-4 | Rename, remove, retire without touching the store; rename does not change history | T002, T003, T004, T006, T007, T010, T011 |
| AC-5 | The last member cannot be removed | T005, T011 |
| AC-6 | Removal and retirement retain the dated record; membership on past dates remains readable | T006, T007, T008, T010, T011 |
| DAC-E1-4 | Names unique among active universes after trimming; a retired universe's name reusable (rename side) | T003, T011 |
| DAC-E1-7 | Sole member removal refused with `last_member`; retire appends one `retired` event; later writes refused with `universe_retired` | T005, T007, T008, T011 |
| DAC-E1-10 | No `UPDATE`/`DELETE` in any statement or Python source of the epic | T009, T012 |
| DAC-E1-S4-1 | Rename keeps `universe_id`, earlier events and memberships; exactly one `renamed` event (TC-COMP-025) | T002, T011 |
| DAC-E1-S4-2 | Sole member: `LastMember`, nothing written (TC-COMP-036) | T005, T011 |
| DAC-E1-S4-3 | Removed member: both events remain, absent from current members (TC-COMP-053) | T006, T011 |
| DAC-E1-S4-4 | Retire appends one `retired` event; `get_universe` shows `lifecycle: retired` with members and events readable (TC-COMP-037) | T007, T011 |
| DAC-E1-S4-5 | Retired universe: retire, add, remove, rename raise `UniverseRetired` (TC-COMP-038) | T008, T011 |
| DAC-E1-S4-6 | Non-member: typed `NotAMember`, nothing written (TC-COMP-026) | T004, T011 |
| DAC-E1-S4-7 | New SQL has no `UPDATE`/`DELETE` and is parameterised (TC-COMP-054) | T009, T012 |

Mapped component test cases (coverage-matrix rows DAC-E1-S4-1 to -7): TC-COMP-025, TC-COMP-026, TC-COMP-036, TC-COMP-037, TC-COMP-038, TC-COMP-053, TC-COMP-054. Seven TCs, all `Covered`. The rename branch of TC-COMP-023 (matrix maps it to S3 only; S3's plan hands the rename half to this story) is implemented in T003 as an additional test with the `TC-COMP-023` trace comment. TC-COMP-051 (events page) belongs to S2 (`test_universe_as_of.py`), not here, although the design's table lists it under `test_universe_maintenance.py`.

## Phase 1: Setup

**Purpose**: Confirm the producer this story extends exists before any test is written.

- [x] T001 Verify, without editing, that CAP-002-E1-S3 is present in the working tree: `src/factorflow/universes/service.py` exporting `UNIVERSE_WRITE_LOCK_KEY`, the eight exceptions, `create_by_hand`, `add_members`, `get_universe`, `list_events`, `list_universes` and the private helpers `_take_lock`, `_normalise_name`, `_normalise_symbols`, `_require_active`, `_name_in_use`, plus the module-level `_INSERT_EVENT_SQL`; and `tests/integration/test_universe_create.py` exporting the helpers `postgres` fixture usage, `seed_instrument`, `event_rows` and `count_events`; and S1's `tests/unit/test_research_sql_is_append_only.py` exporting `prohibited_research_mutations`; and S2's `tests/unit/test_universe_sql_safety.py`. If any is missing, STOP: hard edges `E1-S4: [E1-S1, E1-S2, E1-S3]` (see Dependencies) are unmet and this plan must not be coded yet. `rename`, `remove_member`, `retire` and `tests/integration/test_universe_maintenance.py` must not exist yet.

**Checkpoint**: S3's producers are importable; none of this story's functions or test files exist.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the maintenance rules from the ACs. `tests/integration/test_universe_maintenance.py` is a new file; T009 appends to CAP-002-E1-S2's `tests/unit/test_universe_sql_safety.py`, a CAP-002 test module (DEC-0064 governs only delivered CAP-001 files, so it does not apply); no delivered test file and no `conftest.py` is edited. The integration module imports `seed_instrument`, `event_rows`, `count_events` and the migrated-database fixture from `tests/integration/test_universe_create.py` (S3 defined them there precisely so later modules reuse them; do not copy them and do not add a `conftest.py`). Seed with 3 to 5 covered instruments per test, `conn.commit()` before each service call (an idle connection makes `conn.transaction()` commit its own transaction; the caller commits otherwise, design 2.3). Create universes with `service.create_by_hand`, not raw inserts, except where a test needs a state the service cannot produce.

### Mandatory Component Tests

- [x] T002 [P] Implement TC-COMP-025 (Rename keeps identity, history and memberships) in `tests/integration/test_universe_maintenance.py` (`pytest.mark.postgres`, `# Implements TC-COMP-025`). Create `"Tech"` with `AAPL`, `MSFT`, `NVDA`; snapshot `before_events = event_rows(conn, uid)` and `before = service.get_universe(conn, uid)`; call `service.rename(conn, uid, "  Technology ")`, commit. Assert: returned `Universe.name == "Technology"` (trimmed), `universe_id == uid`, `lifecycle == "active"`, `members == before.members` (same symbols and `member_since`), `origin == before.origin`, `created_at == before.created_at`; `event_rows` now equals `before_events` plus exactly one row at the end (`event_type == "renamed"`, `name == "Technology"`, `instrument_id IS NULL`, `filter_provenance IS NULL`) with every earlier row identical (compare full tuples including `event_id` and `recorded_at`); `SELECT count(*) FROM universe` is unchanged and the `universe` row for `uid` is unchanged; `list_events(conn, uid, 50, None)` returns the `renamed` event first (newest first) and the `created` event still carries the original name `"Tech"`; a second rename `"Tech2"` appends a second `renamed` event and `get_universe` shows the latest name. `rename` on a by-filter universe cannot be built here (S5), so origin preservation is asserted on the by-hand origin only. Fails now: `service.rename` does not exist (`AttributeError`).
- [x] T003 [P] Implement the rename branch of TC-COMP-023 (Active universe name must be unique; retired name reusable) in `tests/integration/test_universe_maintenance.py` (same file as T002, so it follows it; `# Implements TC-COMP-023 (rename half; create half is CAP-002-E1-S3)`). Create `"Growth"` (U1) and `"Value"` (U2). (a) `rename(conn, U2, " Growth  ")` raises `UniverseNameInUse` and appends nothing (event count unchanged, U2 still named `"Value"`). (b) The comparison is exact after trimming: renaming U2 to `"growth"` succeeds. (c) Retire U1 with `service.retire`, commit; renaming U2 to `"Growth"` is now accepted (a retired universe's name is reusable) and the two universes have different ids. (d) A universe may be renamed to a name it held earlier: U2 `"Growth"` -> `"Value"` -> `"Growth"`. (e) Renaming a universe to its own current name (trimmed, e.g. `" Value"` when named `"Value"`) is not refused and appends one `renamed` event (PROVISIONAL, DEC-0096, see Open Gaps; the test pins the adopted behaviour and cites the decision). (f) Empty and whitespace-only names raise `ValueError` and write nothing; a 10 000-character name is accepted (no length bound exists, owner's open question). Fails now: `service.rename` does not exist.
- [x] T004 [P] Implement TC-COMP-026 (Removing a non-member raises a typed error) in `tests/integration/test_universe_maintenance.py` (`# Implements TC-COMP-026`). Create a universe with `AAA`, `BBB`; seed `CCC` covered but never added. (a) `remove_member(conn, uid, "CCC")` raises `service.NotAMember` (a `LookupError`), `symbols`-free message naming `CCC`, and `count_events` is unchanged. (b) A symbol with no `instrument` row at all (`"ZZZ"`) raises `NotAMember` too (removal does not consult coverage). (c) Lower-case input `"ccc"` is normalised and reported as `CCC`. (d) A symbol removed earlier (call `remove_member` for `BBB` first) is no longer a current member, so removing it again raises `NotAMember`. (e) A malformed symbol (`"1ABC"`, `""`) raises `ValueError` (not `NotAMember`), writing nothing. (f) A universe with one member asked to remove a non-member raises `NotAMember`, not `LastMember` (membership is checked before the last-member rule; see Resolved Conflicts). (g) An unknown `universe_id` raises `UniverseNotFound`. Fails now: `service.remove_member` does not exist.
- [x] T005 [P] Implement TC-COMP-036 (Removing the sole member raises LastMember) in `tests/integration/test_universe_maintenance.py` (`# Implements TC-COMP-036`). (a) A universe created with one symbol `AAA`: `remove_member(conn, uid, "AAA")` raises `service.LastMember` (a `ValueError`), `str(exc)` contains the word `retire` (it offers retirement, DAC-E1-S4-2), `count_events` is unchanged and `get_universe` still lists `AAA`. (b) A universe of `AAA`, `BBB`: removing `BBB` succeeds, then removing `AAA` raises `LastMember` (the rule applies to the replayed current membership, not to the created count). (c) A universe whose second member was removed and then re-added is judged on current membership: with `AAA`, `BBB`, remove `BBB`, add `BBB` again, remove `AAA` succeeds and then `BBB` is the last member. (d) The sole remaining member of a retired-lifecycle instrument (`lifecycle='retired'`, covered) is also protected: the rule counts members, not lifecycle (AC-15). (e) After `LastMember`, `service.retire(conn, uid)` succeeds (the offered alternative works). Fails now: `service.remove_member` does not exist.
- [x] T006 [P] Implement TC-COMP-053 (Removed member keeps both events in history) in `tests/integration/test_universe_maintenance.py` (`# Implements TC-COMP-053`). Create a universe with `AAA`, `BBB`, `CCC`; `removed_at = service.remove_member(conn, uid, "bbb")`, commit. Assert: `removed_at` is a timezone-aware `datetime` equal to the `recorded_at` of the appended `member_removed` row (design 2.3 returns `datetime`); `event_rows` holds both the original `member_added` for `BBB` and the new `member_removed` for `BBB` (same `instrument_id`, `member_removed.event_id > member_added.event_id`), with no row updated or deleted (all earlier rows identical to a snapshot taken before the call); exactly one new event; `get_universe(conn, uid).members` has symbols `["AAA", "CCC"]` (absent from current members); `list_events` returns the `member_removed` event first carrying `symbol == "BBB"` and the `member_added` event still present later in the page. Removal in one universe leaves the same instrument a member of a second universe built from the same symbol (AC-3). Re-adding `BBB` with `add_members` afterwards appends a new `member_added`, returns it in `added`, and the three events for `BBB` are all retained. Fails now: `service.remove_member` does not exist.
- [x] T007 [P] Implement TC-COMP-037 (Retire appends one retired event, data stays readable) in `tests/integration/test_universe_maintenance.py` (`# Implements TC-COMP-037`). Create a universe with `AAA`, `BBB`, remove `BBB`, snapshot `before_events` and `before_members = get_universe(...).members`; `result = service.retire(conn, uid)`, commit. Assert: `result.lifecycle == "retired"` with `retired_at` not `None` equal to the new event's `recorded_at`; exactly one new `universe_event` row, `event_type == "retired"`, `instrument_id IS NULL`, `name IS NULL`, all earlier rows identical; `get_universe(conn, uid)` returns `lifecycle == "retired"` with `members == before_members` (a retire removes no member) and the same `name`; `list_events(conn, uid, 50, None)` returns every event including the `retired` first; `get_universe(conn, uid, as_of=<creation day>)` still replays the creation-day membership (history stays readable); the `universe` row is unchanged. `list_universes(conn, "retired", None, 10, None)` returns it and `list_universes(conn, "active", ...)` does not. Fails now: `service.retire` does not exist.
- [x] T008 [P] Implement TC-COMP-038 (Every write to a retired universe raises UniverseRetired) in `tests/integration/test_universe_maintenance.py` (`# Implements TC-COMP-038`). Create a universe with `AAA`, `BBB`, seed `CCC` covered, `service.retire` it, commit, snapshot `count_events`. Each call raises `service.UniverseRetired` (a `ValueError`) and `count_events` is unchanged afterwards: (a) `retire(conn, uid)` a second time; (b) `add_members(conn, uid, ["CCC"])`; (c) `remove_member(conn, uid, "AAA")`; (d) `rename(conn, uid, "Other")`. Check order (design 2.4 step 5 precedes steps 6 and 7): `remove_member(conn, uid, "ZZZ")` (a non-member) on the retired universe raises `UniverseRetired`, not `NotAMember`; `rename(conn, uid, <name held by another active universe>)` raises `UniverseRetired`, not `UniverseNameInUse`; removing `AAA` after removing `BBB` is not reachable (retired first), so `LastMember` is never raised on a retired universe. Reads still work after each refusal: `get_universe` returns `lifecycle == "retired"` with both members; `list_events` returns the full log. `add_members` with an uncovered symbol on a retired universe raises `InstrumentNotAcquired` (coverage precedes the target check, S3 T011(a)), so this story does not alter that order. Fails now: `retire`, `remove_member` and `rename` do not exist.
- [x] T009 [P] Implement TC-COMP-054 (New membership SQL has no UPDATE or DELETE and is parameterised) by appending to CAP-002-E1-S2's `tests/unit/test_universe_sql_safety.py`, after S2's T005 cases (no database, no marker, `# Implements TC-COMP-054`; also names DAC-E1-10). The story (Implementation: "the existing `tests/unit/test_universe_sql_safety.py` scan") and design section 7 ("No mutation statement") place this test in that file. It is S2's CAP-002 module, not a delivered file: DEC-0064 governs only delivered CAP-001 files. Do not change or remove any S2 case or helper in the module. S2's checks (a), (a') and (b) already cover the new `service.py` constant without an edit; these appended cases add the assertions specific to this story's statements. (a) Import `factorflow.universes.service` and collect every module-level `str` constant whose name ends in `_SQL`. Assert that the set contains the statements S3 defined plus the new `remove_member` insert (T011). Assert that each passes `prohibited_research_mutations(text) == []` (imported from `tests.unit.test_research_sql_is_append_only`, S1). Assert that every `%` is the start of a named placeholder `%(name)s`, except the positional `%s` of the exact statement `SELECT pg_advisory_xact_lock(%s)` (S3's `_LOCK_SQL`), which is the one exception S2's check (a') allows. (b) Parse `service.py` with `ast` and assert `rename`, `remove_member` and `retire` exist as top-level functions whose bodies contain no `UPDATE` or `DELETE` token in any string constant and no `execute`/`executemany` call whose first argument is an `ast.JoinedStr`, `.format` call or `%` `BinOp` (names or constants only). (c) Every statement `rename`, `remove_member` and `retire` execute begins with `SELECT pg_advisory_xact_lock` or `INSERT INTO universe_event`: assert by resolving the constants those functions pass to `execute`. (d) Detection check: run the same predicate on a synthetic source string containing `DELETE FROM universe_event` and on one with an f-string argument to prove it fires. Fails now: the new insert constant and the three functions do not exist.

### Additional Unit Tests

- [x] T010 [P] Additional integration tests in `tests/integration/test_universe_maintenance.py` (same file as T002 to T008, so it follows them) for behaviour no mapped TC covers. (a) Write lock: for each of `rename`, `remove_member`, `retire`, connection A opens a transaction and takes `SELECT pg_advisory_xact_lock(%s)` with `UNIVERSE_WRITE_LOCK_KEY`; a thread runs the operation on connection B; poll `pg_locks` (`locktype = 'advisory'`, `granted = false`, bounded loop of about 5 seconds) until B is seen waiting, proving the lock is its first statement; A commits; B then completes and its event exists (same deterministic form as S3's TC-COMP-019; thread bodies capture their exception; close every connection in `finally`). (b) Serialisation with create: with A holding the lock, B's `rename` of U2 to `"Race"` waits while A (same session, re-entrant) creates a universe named `"Race"` and commits; B then raises `UniverseNameInUse`, never succeeds in creating a duplicate active name. (c) Rollback: monkeypatch `psycopg.Cursor.execute` to raise `psycopg.errors.OperationalError` on the `INSERT INTO universe_event` statement (delegate otherwise); each of `rename`, `remove_member`, `retire` propagates the error unchanged (no swallowing, SEC-ERR-001) and, after `conn.rollback()`, `count_events` is unchanged. (d) Each operation appends exactly one event and issues no event other than its own type (assert the set of `event_type` values added by a sequence rename, remove, retire is `{renamed, member_removed, retired}` in `event_id` order). (e) `remove_member` returns the `recorded_at` of its own event, which is later than or equal to the universe's earlier events and equals `list_events(...)[0][0].recorded_at`. (f) `remove_member` normalises with the same helper as S3: `" aapl "` is accepted as `AAPL`. (g) Removing a retired-lifecycle instrument's membership works (`seed_instrument(..., lifecycle="retired")`, member of a two-member universe): no instrument-lifecycle check exists on removal (AC-15). Fails now: the functions do not exist.

**Checkpoint**: All tests written and failing (no production code yet), for the right reason: `AttributeError: module 'factorflow.universes.service' has no attribute 'rename'` (and `remove_member`, `retire`).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with three functions and one statement constant in the module S3 created.

- [x] T011 Extend `src/factorflow/universes/service.py` (add S4 to the module docstring's citations: design 2.3, 2.4, DAC-E1-7). Depends on S3's helpers. Add, after S3's write functions and before the reads (or beside them; keep S3's code untouched):
  - One new module-level statement constant, beside `_INSERT_EVENT_SQL`: `_INSERT_MEMBER_REMOVED_SQL = "INSERT INTO universe_event (universe_id, event_type, instrument_id) VALUES (%(universe_id)s, 'member_removed', %(instrument_id)s) RETURNING recorded_at"` (named placeholders only, `INSERT` only; `RETURNING recorded_at` is how `remove_member` returns its `removed_at`, since `recorded_at` is set by the database default). `rename` and `retire` reuse `_INSERT_EVENT_SQL` with `event_type` `'renamed'` / `'retired'` and `None` for the unused columns (including `filter_provenance=None`). No new `.sql` file, no f-string, no `.format`, no `%` operator, no `UPDATE`, no `DELETE`.
  - `rename(conn, universe_id, name) -> Universe`: `with conn.transaction():`; `_take_lock(conn)` first; `new_name = _normalise_name(name)` (step 2); `_require_active(conn, universe_id)` (step 5: `UniverseNotFound`, `UniverseRetired`); `_name_in_use(conn, new_name, excluding=universe_id)` -> `UniverseNameInUse` (step 6); one `INSERT` of a `renamed` event carrying `name`; return `get_universe(conn, universe_id)` (S3's read in the same `service.py`: with `as_of=None` it replays `current_state` inside this same transaction, so it sees the `renamed` event just inserted, and it already maps `None` to `UniverseNotFound`, so no `None` narrowing is written here; do not call `replay.current_state` directly). Renaming to the universe's own name appends an event (PROVISIONAL, DEC-0096).
  - `remove_member(conn, universe_id, symbol) -> datetime`: same transaction and lock; `[sym] = _normalise_symbols([symbol])` (a malformed or empty symbol is `ValueError`; no coverage check, design 2.3's raise list for this operation has no `InstrumentNotAcquired`); `universe = _require_active(conn, universe_id)`; find the member in `universe.members` by `symbol == sym`, none -> `NotAMember` (message names the symbol); `len(universe.members) == 1` -> `LastMember` (message offers retirement, e.g. "cannot remove the last member; retire the universe instead"); `INSERT` `_INSERT_MEMBER_REMOVED_SQL` with the member's `instrument_id` and return the `recorded_at` it returns (a `datetime`; narrow the fetched row at the boundary with `Any` as S3 does, not `# type: ignore`). Membership check precedes the last-member check, so the replayed state after the proposed removal is "current members minus the symbol" and `LastMember` is raised only when that set would be empty.
  - `retire(conn, universe_id) -> Universe`: same transaction and lock; `_require_active` (so a second retire raises `UniverseRetired`); one `INSERT` of a `retired` event; return `get_universe(conn, universe_id)`, as `rename` does (`lifecycle == "retired"`, `retired_at` set, members unchanged because `membership_as_of.sql` ignores `retired` events).
  Fully annotated for `mypy --strict`; export nothing new beyond the three functions (add them to `__all__` if S3 defined one). Do not change any signature, helper or exception S3 defined. The three new functions call no `replay.*` name (S3's existing `replay` import in `service.py` stays; these three functions do not use it); their collaborators are S3's helpers `_take_lock`, `_normalise_name`, `_normalise_symbols`, `_require_active`, `_name_in_use`, the constant `_INSERT_EVENT_SQL` and the read `get_universe`. The module still contains no `UPDATE`/`DELETE` and no dynamically built `execute` argument.

**Checkpoint**: `uv run pytest -m 'not postgres' tests/unit/test_universe_sql_safety.py tests/unit/test_universe_service_validation.py` and `uv run pytest -m postgres tests/integration/test_universe_maintenance.py tests/integration/test_universe_create.py` pass.

---

## Phase 4: Integration

Skipped: S4 adds no wiring. The only importer of the new functions is the `classification-api` universes router (CAP-002-E1-S6; `classification-ui` CAP-002-E1-S8 reaches it only through the API), which also owns the HTTP mapping of `UniverseRetired` 409, `LastMember` 409, `UniverseNameInUse` 409 and `NotAMember` (a `LookupError`; register line 41 lists it without a status, which S6 settles). `universes/sql/*.sql` already ships through the glob S1 added and this story adds no `.sql` file.

---

## Phase 5: Polish

**Purpose**: Final checks and cross-cutting concerns.

- [x] T012 Confirm the cross-story guards: run `uv run pytest tests/unit/test_universe_sql_safety.py`. S2's unedited checks now see the new `service.py` code (named placeholders, no interpolated `execute`), and T009's appended TC-COMP-054 cases pass. Then run, without editing them, `uv run pytest tests/unit/test_research_sql_is_append_only.py` (S1's whole-tree scan: `service.py` issues no `UPDATE`/`DELETE`, DAC-E1-10) and `uv run pytest tests/unit/test_package_data_ships_sql.py`. Check that `git status` shows only `src/factorflow/universes/service.py`, `tests/integration/test_universe_maintenance.py`, `tests/unit/test_universe_sql_safety.py` (T009's appended cases only: `git diff` of it shows lines added after S2's T005 cases and no S2 line changed or removed), this task file, `CAP-002-E1-S4-tdd-evidence.yaml` and the story's frontmatter status line.
- [x] T013 Run every command in the Validation Plan from the repository root and fix any failure T002 to T011 introduced, including `uv run ruff format --check .` on the new and extended modules and `uv run mypy src` (strict).
- [x] T014 After each TDD cycle in T002–T013 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E1-S4-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC). Suggested cycles: (1) T002, T003 with `rename` and its test helpers (T009's `rename` assertions ride along); (2) T004, T005, T006 with `remove_member` and `_INSERT_MEMBER_REMOVED_SQL`; (3) T007, T008 with `retire`; (4) T009 completion and T010 (lock, rollback, ordering), whose RED evidence is a deliberately broken statement or a skipped `_take_lock` call injected and reverted.

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E1-S2 | hard | T009 appends its TC-COMP-054 cases to S2's `tests/unit/test_universe_sql_safety.py` after S2's T005 cases (story Implementation; design section 7), so that file must exist (T001 checks it); T012 runs S2's checks in it unedited. S2 also owns `replay.py` (`current_state`, `list_events`), which this plan reaches only through S3's `service.py` (`_require_active`, `get_universe`, `list_events`). Graph: `E1-S4: [E1-S1, E1-S2, E1-S3]` (also carried transitively by `E1-S3: [E1-S1, E1-S2]`) |
| CAP-002-E1-S5 | context | Sibling in `service.py`: adds `create_from_filter` using S3's helpers and owns TC-COMP-039 and the filter-origin `Origin`. No import in either direction and neither story is a prerequisite of the other; neither `E1-S5` nor `E1-S4` lists the other. Graph: `E1-S5: [E1-S1, E1-S2, E1-S3, E3-S1, E3-S2]` |
| CAP-002-E1-S6 | reverse | `classification-api` routes call `rename`, `remove_member`, `retire` and map their exceptions. Graph: `E1-S6: [E1-S2, E1-S3, E1-S4, E1-S5, E3-S1, E3-S2]` |
| CAP-002-E1-S8 | context | `classification-ui` shows the last-member and retired refusals through the API; it never imports this module |

CAP-002-E1-S3 is the existing hard edge (`service.py`, its exceptions, `UNIVERSE_WRITE_LOCK_KEY`, the private helpers and the test helpers in `tests/integration/test_universe_create.py`). Two new hard edges. CAP-002-E1-S1: T009 imports `prohibited_research_mutations` from `tests/unit/test_research_sql_is_append_only.py`, which S1 creates. CAP-002-E1-S2: T009 appends to `tests/unit/test_universe_sql_safety.py`, which S2 creates. `dependencies.yaml` is updated to `CAP-002-E1-S4: [CAP-002-E1-S1, CAP-002-E1-S2, CAP-002-E1-S3]`, following the same convention as S3, which lists S1 beside S2: a direct use is listed even when the edge is also transitive.

### Task Dependencies
- T001: no dependencies (verification).
- T002 to T008, T010: one file (`test_universe_maintenance.py`), written in order T002 to T008 then T010; T009 appends to `tests/unit/test_universe_sql_safety.py`, a different file, and is independent of that chain.
- T011: depends on Phase 2 and on S3's `service.py`.
- T012: depends on T011. T013: depends on T012.
- T014: interleaved — runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities
- Phase 2: `test_universe_maintenance.py` and T009's appended cases in `test_universe_sql_safety.py` can be written in parallel; within the first, `[P]` marks tasks that do not depend on an earlier task's code, though they share a file and are applied in order.
- Phase 3: a single task; the three functions share one file.

### Phase dependencies
Phase 1 before Phase 2; Phase 2 before Phase 3; Phase 5 after Phase 3. Phase 4 is skipped.

---

## Validation Plan

### Constitution-Defined Commands
- Build: `uv build` (not affected; S1's wheel test shows the SQL ships)
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- DAC-E1-S4-1 / AC-4: T002 shows one `renamed` event, identical earlier rows, same id, members and origin.
- DAC-E1-4: T003 shows `UniverseNameInUse` after trimming on rename, acceptance after the holder is retired, and the own-name case.
- DAC-E1-S4-2 / DAC-E1-7: T005 shows `LastMember` offering retirement, nothing written, and that retirement then succeeds.
- DAC-E1-S4-3 / AC-6: T006 shows both membership events retained and the stock absent from current members.
- DAC-E1-S4-4: T007 shows one `retired` event and members, events and as-of history readable.
- DAC-E1-S4-5: T008 shows all four writes raising `UniverseRetired` with nothing written, and the check order.
- DAC-E1-S4-6: T004 shows `NotAMember` and nothing written.
- DAC-E1-S4-7 / DAC-E1-10: T009 and T012 show no `UPDATE`/`DELETE`, every statement parameterised.
- Write lock and atomicity: T010 shows each operation waiting on `UNIVERSE_WRITE_LOCK_KEY` and rolling back whole.

---

## Notes

### Resolved Conflicts

- **Where the new functions' collaborators live.** The design places `list_events`, the dataclasses and `service.py` together; S2/S3 pinned the split (DEC-0093: types and paged reads in `replay.py`, re-exported by `service.py`). This story only adds functions to `service.py` and imports nothing from `replay.py`, so the pin needs no further action. Governing rule: story ACs and the graph outrank design placement prose.
- **Test file for the events page.** The design's tests table puts "Events page newest first" in `test_universe_maintenance.py`; S2 implements TC-COMP-051 in `test_universe_as_of.py` (DEC-0093 handoff). This story's file uses `list_events` only to assert history (TC-COMP-053, TC-COMP-037), not paging. Governing rule: story ACs outrank the design's test table. The same table also lists "Add reports already-member" under `test_universe_maintenance.py`; that row is TC-COMP-024, which the coverage matrix maps to CAP-002-E1-S3 only (DAC-E1-S3-6), and S3 implements it in `tests/integration/test_universe_create.py` (S3 T006; S3's Resolved Conflicts, "Test file for TC-COMP-024 (already-member)"), because story CAP-002-E1-S3's Technical Details name only its create and volume files. `test_universe_maintenance.py` carries no TC-COMP-024 test, and this plan adds no already-member test.
- **Order of `NotAMember` and `LastMember`.** The design's flowchart (2.4 step 7) says "remove the sole member" is the empty-result check, and its operation table raises `NotAMember` when the symbol is not a current member. A non-member removal produces no removal, so the result is not empty and `LastMember` cannot apply; `NotAMember` is checked first (T004(f)). Settled by design prose and DAC-E1-S4-6/-2 together; no conflict between artifacts.
- **Check order for retired universes.** Step 5 (target exists and active) precedes steps 6 and 7, so a retired universe raises `UniverseRetired` before `UniverseNameInUse`, `NotAMember` or `LastMember` (T008). Step 4 (coverage) still precedes step 5 for `add_members`, so an uncovered batch against a retired universe reports `InstrumentNotAcquired`, as S3's T011(a) pins.
- **Rename half of TC-COMP-023.** The coverage matrix maps TC-COMP-023 to S3 only; S3's plan implements the create half and hands the rename half here (its Resolved Conflicts). T003 implements it with the trace comment; no matrix change is needed because the TC is already `Covered`.
- **Stale labels.** The design body says `**Status:** draft` while front matter is `approved`; front matter governs. Design section 12 cites research-store v1; the approved version is v2. No behavioural effect.

### Open Gaps

- **Rename to the universe's own current name (PROVISIONAL — awaiting owner confirmation (2026-10-17), DEC-0096).** No artifact fixes whether this is refused, a no-op or an appended event. The plan excludes the universe's own id from the uniqueness check (the `excluding=` parameter S3 pinned) and appends exactly one `renamed` event. Derivation: design 2.4 step 6 requires uniqueness among active universes, which an own-name rename does not violate; DAC-E1-S4-1 says a rename appends exactly one `renamed` event and names no exception; a no-op would add a branch and a refusal would invent an error contract; the append-only log makes the redundant event harmless. Follow-up: design 2.4's operation table states the same-name outcome at its next revision.
- **Exception family of the not-a-member error.** The story says "the component design's typed exception", which is `NotAMember(LookupError)` in design 2.3; S3 already defines it. Not a gap in this plan. The HTTP status for `NotAMember` is S6's: the register (line 41) lists a status for every exception except `NotAMember` ("LookupError"); S6's planner must pin it from the API design (this plan neither assumes nor edits it).
- **Universe name maximum length** is undecided (system design section 8 question 2, abstained). `rename` reuses `_normalise_name` (trimmed, non-empty only); T003(f) pins that no bound exists. The owner's answer adds the check later, in `_normalise_name`, once for both creating and renaming.
- **Return value of `remove_member`.** Design 2.3 declares `-> datetime` and the operation table calls it `removed_at`, but names no source. The plan returns the `recorded_at` of the appended `member_removed` event via `RETURNING`. Not an owner decision (the only datetime the operation produces); follow-up: design 2.3 names it at its next revision.
- Owner-directed fix (cross-plan review 2026-10-18, E1-F14): `rename` and `retire` (T011) return S3's `get_universe(conn, universe_id)` instead of calling S2's `replay.current_state(conn, universe_id)` directly — design 2.4 step 9 ("replay current_state; return Universe") names the replay, not the caller, and DEC-0093 only places `current_state` in `replay.py`. S3's `get_universe` with `as_of=None` replays `current_state` in the same transaction (it opens no lock and no transaction block) and maps `None` to `UniverseNotFound`, so the returned `Universe` is identical. Routing through it keeps the three new functions free of any S2 name (no `replay.*` call), which is what the Resolved Conflicts note on collaborators states; the `CAP-002-E1-S2` row is `hard` only because T009 appends to S2's `tests/unit/test_universe_sql_safety.py` (cross-plan review E1-F04), not because of `replay.py`. This fix makes no graph change: `CAP-002-E1-S4: [CAP-002-E1-S1, CAP-002-E1-S2, CAP-002-E1-S3]` (set by E1-F04) stands.

### Other Notes

- The resolution register `logs/runs/run-20261017T210926Z/resolution-register-CAP-002-E1.md` was right on the module map, write lock, exception names, event rows per operation and its S2/S3 corrections. Two register notes for a later revision: (1) line 41 gives no HTTP status for `NotAMember`, so S6 must resolve it from the API design; (2) the register implies design 2.3's top-level `Thresholds` import in `service.py`, which S3's plan already removed (S5 adds it with `create_from_filter`); S4 neither adds nor needs it. Neither changes the register's conclusions on conflicts.
- Write functions here must remain safe to compose with S5's `create_from_filter` in the same module: do not reorder or rename S3's helpers, and keep the lock as the first statement of every write.
- Test setup that inserts `retired` events directly is no longer needed for the retired-universe cases because `retire` now exists; use the service. Direct `INSERT`s remain only for states the service cannot reach (none planned). The one `UPDATE instrument` for a retiring instrument (S3 T007(c)) is test setup against a throwaway database and the append-only guards scan `src/factorflow/`, not `tests/`.
- Transaction semantics: each write opens `with conn.transaction():` and the caller commits; tests commit or roll back between calls, and the concurrency tests use one connection per thread.
- Unattended run: one PROVISIONAL decision (DEC-0096) is recorded above; no contradiction, third-party component or approval problem stopped planning. The plan also rests on CAP-002-E1-S2's DEC-0093 (cited in Resolved Conflicts: the dataclasses and `current_state`, which replays the `Universe` that `rename` and `retire` return, live in `replay.py`), so the commit carrying this plan carries `Decision-Id: DEC-0093` beside `Decision-Id: DEC-0096`.
