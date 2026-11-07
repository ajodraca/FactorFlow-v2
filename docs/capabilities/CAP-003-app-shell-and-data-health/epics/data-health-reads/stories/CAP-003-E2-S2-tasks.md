---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S2-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T05:52:35Z
  source_artifacts:
    - id: CAP-003-E2-S2
      version: "1"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-data-health-reader-tests
      version: "1"
    - id: CAP-003-E2-S1-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E2-S2 — read_attention: Followed Count, Prices As-Of, Latest Downloads with Progress and the Server Items

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-06

## Summary

Adds `read_attention(conn) -> Attention` to the read-only `data-health-reader`
package that CAP-003-E2-S1 creates (component-design-data-health-reader.md,
"RD" below, sections 2.3, 2.6, 2.7, 5). It is the cheap aggregate the shell
polls every 10 seconds at worst: five fixed `SELECT` statements on the caller's
connection and no call to `coverage-service`. Q1 `FOLLOWED_COUNT_SQL` gives
`followed_count` (active instruments) and `checked_at` (its `now()`); Q2
`PRICES_AS_OF_SQL` gives `prices_as_of` (the latest prices `covered_to` over
active instruments); Q3 is E2-S1's `PROBLEM_COUNT_SQL` (count, first three
symbols, newest completion time); Q4 `LATEST_DOWNLOAD_SQL` is the run with the
greatest `requested_at` and, in the same statement, its progress aggregate
(`done` = instruments with a result row for all four data types in that run;
`total` = `instruments_named`, `None` while 0); Q5 `LATEST_TERMINAL_SQL` is the
run with the greatest `ended_at` among the five terminal states with its
recorded `state` and `failure_reason`. `credential_present()` is called as
delivered, and the three server item kinds of DEC-0203 (`data_problems`,
`download_not_complete` for `failed` or `abandoned` only, `credential_missing`)
are derived by a pure function, with no tier and no copy (DEC-0200). Nothing is
written, no schema changes and no delivered file is edited (DEC-0211).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | The attention read carries the latest download's progress | T005, T013, T014 |
| AC-8 | The attention read carries `followed_count` and `prices_as_of` | T004, T009, T013, T014 |
| AC-9 | The server items exist exactly while their cause holds in the store | T002, T006, T011, T014 |
| AC-12 | Run states and outcomes are returned as recorded | T006, T010, T013, T014 |
| AC-21 | `latest_terminal_download` is null until a download has ended | T004, T006, T013, T014 |
| DAC-E2-6 | `done` counts instruments with all four results; `total` is `instruments_named`, null while 0; `done` never above `total` | T005, T013, T014 |
| DAC-E2-7 | Latest by `requested_at`; latest terminal by `ended_at` among the five terminal states with recorded `state` and `failure_reason`; a running download never displaces the latest terminal one | T006, T010, T013, T014 |
| DAC-E2-8 | `data_problems` when `stock_count > 0`; `download_not_complete` for `failed` or `abandoned` only; `credential_missing` when `credential_present()` is false; no tier, no copy | T002, T006, T007, T011, T014 |
| DAC-E2-S2-1 | Empty store: 0, `None`s, `stock_count` 0, no items | T004, T014 |
| DAC-E2-S2-2 | Running after partial; abandoned latest terminal gives the item with its `run_id` and `ended_at` | T006, T014 |
| DAC-E2-S2-3 | `credential_missing.recorded_at == checked_at`, `credential_present` false; the key's value never read (AC-4, AGT-PROHIB-001) | T002, T003, T007, T014 |
| DAC-E2-S2-4 | A fixed set of aggregate statements, no per-instrument statement, at 3000 active instruments (AC-28) | T008, T013, T014 |

T012 (the problem block's mapping into `Problems`) traces to AC-9 and
DAC-E2-8 (the `data_problems` cause). T001, T015 to T018 are prerequisite,
wiring and validation tasks.

## Phase 1: Setup

**Purpose**: Confirm the hard dependency's deliverables and the delivered prerequisites before any file is written.

- [ ] T001 Confirm, without editing anything, and STOP and report if one is missing: CAP-003-E2-S1 has landed `src/factorflow/data_health/__init__.py` (`__all__ = ["read_problems"]`), `models.py` (the frozen `Progress`, `LatestDownload`, `LatestTerminalDownload`, `Problems`, `AttentionItem` and `Attention` of RD 2.2 with exactly RD 2.2's fields and order), `queries.py` (`PROBLEM_COUNT_SQL` returning one row with columns `stock_count`, `symbols` (a list, `'{}'` when empty), `newest_completed_at`, in that order) and `reader.py` (`read_problems`); `tests/unit/test_data_health_sql_is_read_only.py` (the whole-text write/DDL token guard and the `_SQL`-constant shape check) exists. Also confirm the delivered `factorflow.config.settings.credential_present()` (reads only whether `FACTORFLOW_MASSIVE_API_KEY` is non-empty), the `migrated_writer_connection` fixture in `tests/conftest.py` (migrations 0001 to 0004, one database per test), `acquisition_run`'s constraints `acquisition_run_claim_agrees`, `acquisition_run_terminal_has_end` and `idx_acquisition_run_single_active` in `src/factorflow/db/migrations/0004_runs.sql`, and `factorflow.runs.queries.get_most_recent_run`. Add no fixture to `tests/conftest.py`.

**Checkpoint**: Prerequisites confirmed; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the attention aggregate, its progress, its two download selections, its three item rules and its fixed statement set.

Unit tests (no `postgres` marker) go in `tests/unit/test_data_health_items.py`.
Database tests go in `tests/integration/test_data_health_attention.py` with
`pytestmark = pytest.mark.postgres`, use `migrated_writer_connection`, and seed
through module-private helpers in that file, written with bound parameters
only (the shape of E2-S1's helpers in `tests/integration/test_data_health_problems.py`,
kept private there, so they are repeated here rather than imported from a test
module):

- `_instrument(conn, symbol, *, lifecycle="active") -> int`: inserts an `instrument` (`retired_at = now()` exactly when `lifecycle = 'retired'`, honouring `instrument_retired_at_agrees`), `RETURNING instrument_id`.
- `_run(conn, *, state, requested_at, started_at=None, ended_at=None, instruments_named=0, failure_reason=None) -> UUID`: inserts an `acquisition_run` with `history_depth_years = 1`; for `running` and `cancelling` it also sets `claimed_by = 'test-runner'` and `heartbeat_at = requested_at` (constraint `acquisition_run_claim_agrees`); terminal states require `ended_at` (`acquisition_run_terminal_has_end`). At most one `running`/`cancelling` run per store (`idx_acquisition_run_single_active`). `RETURNING run_id`.
- `_record(conn, run_id, instrument_id, data_type, outcome, *, completed_at, reason=None)`: inserts the `run_instrument_result` row and, for `written`, `failed` and `not_found`, upserts `acquisition_state` with the same `run_id` (`ON CONFLICT (instrument_id, data_type)` replacing `last_run_id`, `last_outcome`, `last_acquired_at = completed_at`), the pairing the delivered writer keeps; `unchanged` is stored in `acquisition_state` as `written`, `skipped` leaves it untouched.
- `_segment(conn, instrument_id, data_type, covered_from, covered_to)`: inserts a `coverage_segment`.
- Every seed ends with `conn.commit()` before the reader is called, so `read_attention` opens its own transaction. Times are fixed aware literals (`datetime(2026, 10, 20, 21, 0, tzinfo=UTC)` and later), never `now()`.
- The credential is set explicitly in every database test with `monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", SENTINEL)` (`SENTINEL = "sk-attention-sentinel-0123456789"`) or removed with `monkeypatch.delenv(..., raising=False)`, so no result depends on the developer's environment (an unset key would add a `credential_missing` item to every case).
- Items are compared as a dict keyed by `kind` (`{i.kind: i for i in attention.items}`) together with `len(attention.items)`, never by position: RD 2.7 fixes no order (Other Notes).

### Mandatory Component Tests

- [ ] T002 [P] Implement the item rules of TC-COMP-044 (edge) and TC-COMP-045 (both outcomes) as pure-function tests in `tests/unit/test_data_health_items.py`, calling `factorflow.data_health.reader._attention_items(*, problems, latest_terminal, credential_present, checked_at)` with literal model values (no database). Cases: (a) `Problems(0, (), None)` → no `data_problems`; `Problems(1, ("AAA",), t1)` → one `AttentionItem("data_problems", t1, None)`; the inconsistent `Problems(0, (), t1)` → no item (the rule is the count, DAC-E2-8). (b) Parametrised over the five terminal states with `LatestTerminalDownload(R, state, t2, "reason")`: an `AttentionItem("download_not_complete", t2, R)` exactly for `failed` and `abandoned`, none for `succeeded`, `partial`, `cancelled`; `latest_terminal=None` → none. (c) `credential_present=False` → `AttentionItem("credential_missing", checked_at, None)`; `True` → none. (d) All three causes at once → exactly three items whose kinds are the three kinds; no cause → `()`. Every expected item is a literal `AttentionItem(...)` compared with `==`, so `recorded_at` and `run_id` are both checked (Implements TC-COMP-044, TC-COMP-045; DAC-E2-8, DAC-E2-S2-2, DAC-E2-S2-3; AC-9) — kills: off-by-one `stock_count > 0` → `>= 0` (case a, count 0 yields an item), swap-case `"failed"` → `"partial"` in the state set (case b), hand-written state set `("failed", "abandoned")` → `("failed", "abandoned", "cancelled")` (case b), negate-boolean on `not credential_present` (case c), drop-field-copy of `run_id=latest_terminal.run_id` (case b reads `None`) and of `recorded_at=checked_at` (case c).
- [ ] T003 [P] Implement step 2 of TC-COMP-045 (the module never reads the key's value) in `tests/unit/test_data_health_items.py`: (a) `factorflow.data_health.reader.credential_present is factorflow.config.settings.credential_present` (the delivered function, called as delivered, not a local reimplementation); (b) for both `Path(factorflow.data_health.reader.__file__)` and `Path(factorflow.data_health.queries.__file__)`, the whole text contains none of `FACTORFLOW_MASSIVE_API_KEY`, `os.environ`, `getenv`, `get_secret_value`, `massive_api_key`, `Settings(` (case-sensitive substrings; name the file and the hit in the assertion message) (Implements TC-COMP-045 step 2; DAC-E2-S2-3; AC-4; AGT-PROHIB-001) — kills: hand-written `credential_present()` → `bool(os.environ.get("FACTORFLOW_MASSIVE_API_KEY"))` in `reader.py` (both halves fail); the observation is the identity check and the named substring.
- [ ] T004 Implement TC-COMP-043 (read_attention on an empty store) in `tests/integration/test_data_health_attention.py`. With the key set to `SENTINEL` and nothing seeded, `read_attention(conn)` returns `followed_count == 0`, `prices_as_of is None`, `latest_download is None`, `latest_terminal_download is None`, `problems == Problems(0, (), None)`, `items == ()`, `credential_present is True`. Edge (`checked_at` is set): `checked_at.tzinfo is not None`, and, since the function leaves the transaction open, `conn.execute("SELECT now()").fetchone()[0] == attention.checked_at` (PostgreSQL's `now()` is the transaction start, so this holds only if `checked_at` came from the statement, DAC-E2-S2 Description); then `conn.rollback()` (Implements TC-COMP-043; DAC-E2-S2-1; AC-21, AC-8) — kills: hand-written `checked_at = datetime.now(UTC)` in `reader.py` (differs from the transaction's `now()`), hand-written `symbols=tuple(symbols)` → `symbols=symbols` (`[]` is not `()`), and a mapping of an absent run row into a value instead of `None`.
- [ ] T005 Implement TC-COMP-036 (progress done counts complete instruments; total null before claim) in `tests/integration/test_data_health_attention.py`. Seed 50 active instruments `P001`..`P050` (symbols `P` plus three digits). An earlier `succeeded` run R0 (requested `t0`, ended `t0 + 1h`) holds results for all four data types for all 50 (so a progress count not restricted to the latest run reads 50). Then a `requested` run R1 at `t1 > t0 + 1h` with `instruments_named = 0`: `latest_download.run_id == R1`, `latest_download.progress == Progress(0, None)` (step 1). Then, in a later committed seed, set R1 to `running` (`started_at`, `claimed_by`, `heartbeat_at`) with `instruments_named = 120` through a test-local bound statement on `acquisition_run` (the test's own seeding, not the reader's), and record for R1: `P001`..`P040` on all four data types, with mixed outcomes (`P001`..`P010` `prices` `failed`, `P011`..`P015` `fundamentals` `skipped`, the rest `written`), and `P041`..`P043` on three data types only (no `corporate_actions`). Step 2: `latest_download.progress == Progress(40, 120)` and `progress.done <= progress.total`. Edge (no run): covered by T004 (`latest_download is None`) (Implements TC-COMP-036; DAC-E2-6; AC-7) — kills: off-by-one `named if named > 0 else None` → `named if named >= 0 else None` (step 1 reads `Progress(0, 0)`), hand-written `HAVING count(*) = 4` → `HAVING count(*) >= 3` (reads 43), hand-written `WHERE x.run_id = r.run_id` → `WHERE true` (reads 50), hand-written filter `AND x.outcome = 'written'` added (reads 25).
- [ ] T006 Implement TC-COMP-044 (latest versus latest terminal download and the abandoned item) in `tests/integration/test_data_health_attention.py`, three stores, key set to `SENTINEL`, no problem seeded so `items` holds only download items. (a) A `partial` run A (requested `t1`, ended `t2`, `failure_reason="provider rate limit"`), then a `running` run B (requested `t3 > t2`, started `t3`, `instruments_named = 5`): `latest_download == LatestDownload(B, "running", t3, t3, None, Progress(0, 5))`, `latest_terminal_download == LatestTerminalDownload(A, "partial", t2, "provider rate limit")`, `items == ()` (a `partial` latest terminal gives no item). (b) An `abandoned` run C (requested `t1`, ended `t2`, `failure_reason=None`): `latest_terminal_download == LatestTerminalDownload(C, "abandoned", t2, None)` and `items == (AttentionItem("download_not_complete", t2, C),)`. (c) Terminal order is by `ended_at`, not `requested_at`: a run X requested `t1`, `failed` at `t5` with `failure_reason="no credential"`, and a run Y requested `t2 > t1` and `cancelled` at `t3 < t5` before it ever ran (a run can be cancelled while still `requested`, so the two can overlap without breaking the single-active index): `latest_download.run_id == Y` (greatest `requested_at`), `latest_terminal_download == LatestTerminalDownload(X, "failed", t5, "no credential")`, and `items == (AttentionItem("download_not_complete", t5, X),)`. Edge: a store whose only run is `cancelled` has `latest_terminal_download.state == "cancelled"` and no item (Implements TC-COMP-044; DAC-E2-7, DAC-E2-8, DAC-E2-S2-2; AC-9, AC-12, AC-21) — kills: hand-written `ORDER BY ended_at DESC` → `ORDER BY requested_at DESC` in `LATEST_TERMINAL_SQL` (case c picks Y and loses the item), hand-written removal of `'abandoned'` from the terminal state list (case b reads `None`), hand-written `WHERE state IN (...)` → `WHERE true` (case a: the running B, whose `ended_at` is NULL, sorts first under `DESC` and displaces A), hand-written `ORDER BY r.requested_at DESC` → `ASC` in `LATEST_DOWNLOAD_SQL` (case a picks A), drop-field-copy of `failure_reason`.
- [ ] T007 Implement TC-COMP-045 (credential_missing item when the key is absent) in `tests/integration/test_data_health_attention.py`. Empty store; `monkeypatch.delenv("FACTORFLOW_MASSIVE_API_KEY", raising=False)` (the delivered `credential_present()` then genuinely returns `False`, stronger than patching the function): `attention.credential_present is False` and `attention.items == (AttentionItem("credential_missing", attention.checked_at, None),)`. Edge (key present): `monkeypatch.setenv(..., SENTINEL)` then a fresh read (after `conn.rollback()`): `credential_present is True`, `items == ()`, and `SENTINEL not in repr(attention)` (the value travels nowhere in the result) (Implements TC-COMP-045 steps 1 and expected results; DAC-E2-S2-3, DAC-E2-8; AC-4) — kills: negate-boolean on the item condition, hand-written `credential_present=credential_present()` → `credential_present=True` in the `Attention` construction, drop-field-copy of `recorded_at=checked_at`.
- [ ] T008 Implement TC-COMP-046 (bounded statements at 3000 instruments) in `tests/integration/test_data_health_attention.py`. Define a test-local `_CountingConnection` / `_CountingCursor` pair that delegates to the real connection and appends each `execute`d query text to a list (the precedent `CountingConnection` in `tests/integration/test_reader_evidence.py`, which wraps `cursor()` only; pass it with `# type: ignore[arg-type]` as that test does). (1) On a small store (3 active instruments, one problem, one running run with results for one instrument), `counting.statements == [queries.FOLLOWED_COUNT_SQL, queries.PRICES_AS_OF_SQL, queries.PROBLEM_COUNT_SQL, queries.LATEST_DOWNLOAD_SQL, queries.LATEST_TERMINAL_SQL]`, compared by identity of the module constants (`[s is c for ...]`) and by equality. (2) Seed with set-based statements (`generate_series`, the precedent `tests/integration/test_coverage_volume.py`) 3000 active instruments `S0001`..`S3000`, a prices `coverage_segment` for each ending `2026-10-23`, one `running` run with `instruments_named = 3000` and results for all four data types for `S0001`..`S1500` (`failed` prices for `S0001`..`S0300` with the paired `acquisition_state`, `written` otherwise), commit, and read again through a fresh counting wrapper: the statement list is the same five constants, and the values are right at scale: `followed_count == 3000`, `prices_as_of == date(2026, 10, 23)`, `problems.stock_count == 300`, `problems.symbols == ("S0001", "S0002", "S0003")`, `latest_download.progress == Progress(1500, 3000)`. Because `read_coverage` would issue its own statements through the same wrapper, the exact list also proves no call to `coverage-service` (story Description) (Implements TC-COMP-046; DAC-E2-S2-4; AC-28; Resolved Conflict 1) — kills: a hand-written per-instrument loop (the list grows with the roster), a hand-written `read_coverage(conn, lifecycle="active")` call added to `read_attention` (extra statements), and splitting progress into its own statement (six entries).

### Additional Unit Tests

- [ ] T009 `followed_count` and `prices_as_of` count only active instruments' prices (AC-8) in `tests/integration/test_data_health_attention.py`. Seed active `AAA` (prices segment `2026-01-02`..`2026-10-20`, and a second, earlier prices segment `2025-01-02`..`2025-06-30`), active `BBB` (prices `2026-03-02`..`2026-10-23`), active `CCC` (no prices; a `fundamentals` segment ending `2026-11-02`), and retired `RRR` (prices ending `2026-10-30`). Assert `followed_count == 3` and `prices_as_of == date(2026, 10, 23)` — kills: hand-written removal of `WHERE lifecycle = 'active'` from `FOLLOWED_COUNT_SQL` (reads 4), of `i.lifecycle = 'active'` from `PRICES_AS_OF_SQL` (reads `2026-10-30`), of `c.data_type = 'prices'` (reads `2026-11-02`), and `max(` → `min(` (reads `2025-06-30`).
- [ ] T010 Run states are returned as recorded and the latest-run order matches health's (AC-12, DAC-E2-7) in `tests/integration/test_data_health_attention.py`. (a) Parametrised over the eight states `requested`, `running`, `cancelling`, `succeeded`, `partial`, `failed`, `cancelled`, `abandoned`, one run per store seeded through `_run` with the columns each state requires: `latest_download.state` equals the literal state, and `latest_terminal_download` is `None` exactly for the three non-terminal states, otherwise its `state` equals the literal. (b) Tie on `requested_at`: two terminal runs with the same `requested_at` (distinct `ended_at`) and explicit run ids `LOW = UUID(int=1)` and `HIGH = UUID(int=2)` (`_run` takes an optional `run_id`), parametrised over both insertion orders (`HIGH` first, then `LOW` first): `latest_download.run_id == HIGH` and equals `factorflow.runs.queries.get_most_recent_run(conn).run_id`, so Home's progress and the shell's health name the same run. (c) Tie on `ended_at`: the same two ids and both insertion orders, equal `ended_at`, distinct `requested_at`: `latest_terminal_download.run_id == HIGH` (PostgreSQL's `uuid` order and Python's `UUID` order are both bytewise) — kills: swap-case on any recorded state (a state rewritten in Python reads differently), hand-written removal of `, r.run_id DESC` or `, run_id DESC` from either `ORDER BY` (without the tie-break the row returned follows physical order, so one of the two insertion orders returns `LOW`).
- [ ] T011 Items exist exactly while their cause holds in the store (AC-9) in `tests/integration/test_data_health_attention.py`. Key set to `SENTINEL`. (1) Seed `AAA` with a `failed` prices result at `t4` in a `failed` run F (requested `t3`, ended `t5`, `failure_reason="provider unavailable"`): the items are `data_problems` (`recorded_at == t4`) and `download_not_complete` (`recorded_at == t5`, `run_id == F`). (2) A later run H is requested at `t6` and set `running` (no result yet): both items stay, because a running download is not a later ended one (DEC-0203 via RD 2.7). (3) H ends `succeeded` at `t8` after recording `written` for `AAA` prices at `t7`: `items == ()` and `problems.stock_count == 0`. (4) Delete the key: `items == (AttentionItem("credential_missing", attention.checked_at, None),)`. Nothing records that an item was seen: the full contents of `instrument`, `acquisition_run`, `acquisition_state` and `run_instrument_result` (`SELECT * ... ORDER BY` the primary key) are equal before and after two reads at step 1 — kills: hand-written `_attention_items(latest_terminal=latest_terminal_download, ...)` → a value built from `latest_download` (step 2 loses the item, since H is `running`), negate-boolean on `stock_count > 0` (step 3 keeps or step 1 loses `data_problems`), and any statement that writes (the snapshots differ).
- [ ] T012 The problem block is mapped field for field (DAC-E2-8 cause) in `tests/integration/test_data_health_attention.py`. Seed four active problem stocks `AAA`, `BBB`, `CCC`, `DDD` (one `failed` or `not_found` latest outcome each, completed at `t1` < `t2` < `t3` < `t4` in that order of symbol) plus a retired `ABR` with a `failed` result at `t5 > t4`: `attention.problems == Problems(4, ("AAA", "BBB", "CCC"), t4)` and `type(attention.problems.symbols) is tuple` — kills: drop-field-copy of `newest_completed_at` (reads `None`), hand-written `tuple(symbols)` → `symbols` (a list never equals the tuple), and a Q3 that is not `PROBLEM_COUNT_SQL` but counts retired stocks (reads 5 and `t5`).

**Checkpoint**: All tests written; they fail on `ImportError` for `read_attention`, `_attention_items` and the four new query constants (no production code yet). E2-S1's tests still pass.

---

## Phase 3: Core Implementation

**Purpose**: Add the four statements, the item rules and `read_attention`.

- [ ] T013 Extend `src/factorflow/data_health/queries.py` with four module-level `Final[str]` constants, no parameters, each one aggregate `SELECT` (first keyword `SELECT`, no `{`, no `%`, so E2-S1's `_SQL` shape check passes on them):
  - `FOLLOWED_COUNT_SQL`: `SELECT count(*) AS followed_count, now() AS checked_at FROM instrument WHERE lifecycle = 'active'` (Q1; `checked_at` is Q1's `now()`, RD 2.3, story Description).
  - `PRICES_AS_OF_SQL`: `SELECT max(c.covered_to) AS prices_as_of FROM coverage_segment c JOIN instrument i ON i.instrument_id = c.instrument_id WHERE i.lifecycle = 'active' AND c.data_type = 'prices'` (Q2; system design 4.2).
  - `LATEST_DOWNLOAD_SQL`: `SELECT r.run_id, r.state, r.requested_at, r.started_at, r.ended_at, r.instruments_named, (SELECT count(*) FROM (SELECT x.instrument_id FROM run_instrument_result x WHERE x.run_id = r.run_id GROUP BY x.instrument_id HAVING count(*) = 4) AS complete) AS done FROM acquisition_run r ORDER BY r.requested_at DESC, r.run_id DESC LIMIT 1` (Q4 with its progress aggregate in the same statement, RD 2.6; the order repeats `factorflow.runs.queries._LIST_ORDER` so this run and health's `most_recent_run` are the same run). `count(*) = 4` counts data types because `(run_id, instrument_id, data_type)` is the table's primary key; any outcome counts.
  - `LATEST_TERMINAL_SQL`: `SELECT run_id, state, ended_at, failure_reason FROM acquisition_run WHERE state IN ('succeeded', 'partial', 'failed', 'cancelled', 'abandoned') ORDER BY ended_at DESC, run_id DESC LIMIT 1` (Q5, RD 2.6; same tie-break pattern).
  Extend the module docstring to cite RD 2.3 and 2.6 and DEC-0213 f; the docstring and comments contain none of the six tokens of E2-S1's guard in any case (write "a running download never displaces", never words such as "update"). (depends on T001)
- [ ] T014 Extend `src/factorflow/data_health/reader.py`:
  - `from factorflow.config.settings import credential_present` (imported by name, so T003's identity check holds), the four new constants, and the models `Attention`, `AttentionItem`, `LatestDownload`, `LatestTerminalDownload`, `Problems`, `Progress` from `factorflow.data_health.models`.
  - `_attention_items(*, problems: Problems, latest_terminal: LatestTerminalDownload | None, credential_present: bool, checked_at: datetime) -> tuple[AttentionItem, ...]`, a pure function implementing RD 2.7's table in its row order: `data_problems` when `problems.stock_count > 0 and problems.newest_completed_at is not None` (`recorded_at = newest_completed_at`; the second conjunct only narrows the type, see Other Notes); `download_not_complete` when `latest_terminal is not None and latest_terminal.state in ("failed", "abandoned")` (`recorded_at = latest_terminal.ended_at`, `run_id = latest_terminal.run_id`); `credential_missing` when `not credential_present` (`recorded_at = checked_at`). `run_id` is `None` for the other two kinds. The keyword parameter `credential_present` shadows the imported function inside this function only (ruff's selected rules E, F, I, UP, B do not flag it), which keeps the parameter named after the `Attention` field it feeds.
  - `read_attention(conn: psycopg.Connection) -> Attention`: one `with conn.cursor() as cur:` (only `conn.cursor()` is used, so a counting wrapper sees every statement) executing, in this order, `FOLLOWED_COUNT_SQL`, `PRICES_AS_OF_SQL`, `PROBLEM_COUNT_SQL`, `LATEST_DOWNLOAD_SQL`, `LATEST_TERMINAL_SQL`, each followed by `fetchone()`; the three aggregate rows always exist (narrow `None` for mypy strict the way the delivered code does, e.g. `factorflow.runs.queries`), the two run rows are `None` when no run (or no terminal run) exists. Build `Problems(stock_count, tuple(symbols), newest_completed_at)`; `LatestDownload(run_id, state, requested_at, started_at, ended_at, Progress(done, instruments_named if instruments_named > 0 else None))`; `LatestTerminalDownload(run_id, state, ended_at, failure_reason)`; then call `credential_present()` once and `_attention_items(...)` with `checked_at` from Q1, and return `Attention(checked_at, followed_count, prices_as_of, present, problems, latest_download, latest_terminal_download, items)`. States are passed through as stored strings (AC-12). No `commit`, no `rollback`, no `conn.transaction()`, no call to `factorflow.coverage`, no read of the environment. No clamp of `done` to `total` (Other Notes).
  - Docstrings cite RD 2.3, 2.6, 2.7 and 5, DEC-0203, DEC-0213 f, DEC-0200, AC-7, AC-8, AC-9, AC-12, AC-21 and DAC-E2-6 to DAC-E2-8, DAC-E2-S2-1 to DAC-E2-S2-4; they state that the caller owns the transaction and that items carry no tier and no copy; none of the six guard tokens appears anywhere in the file (no `.update(` call; use `|=` or assignment), and no docstring or comment names the credential's environment variable or any of T003's substrings (say "the delivered `credential_present()`" instead). (depends on T013)
- [ ] T015 Extend `src/factorflow/data_health/__init__.py`: add `read_attention` to the import from `factorflow.data_health.reader` and to `__all__` (RD 2.1 says the package exports all three functions; E2-S1 exported only `read_problems`; Resolved Conflict 3). Do not export `_attention_items`. Keep `__all__` sorted as ruff leaves it; if CAP-003-E2-S3 has already added `read_data_health`, keep its entry. (depends on T014)

**Checkpoint**: T002 to T012 pass; `uv run mypy src` is clean for `src/factorflow/data_health/`.

---

## Phase 4: Integration

**Purpose**: Prove the extended package leaves E2-S1's guards and the delivered guards green; nothing is wired in this story.

- [ ] T016 Run E2-S1's and the delivered guards over the extended files: `uv run pytest tests/unit/test_data_health_sql_is_read_only.py tests/unit/test_data_health_models.py tests/integration/test_data_health_problems.py tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py tests/unit/test_credential_presence.py`. All pass unchanged: the four new constants are aggregate `SELECT`s with no token, `{` or `%` (E2-S1 T002 and T003 scan every `_SQL` constant, so they now cover these too); the statements are Python constants, so `pyproject.toml` package data is not edited. Do not register any router and do not import the package from `factorflow.api`: `data-health-api` (CAP-003-E2-S4) consumes `read_attention`. (depends on T015)

**Checkpoint**: Guards green; no delivered file modified.

---

## Phase 5: Polish

**Purpose**: Final validation and the TDD evidence.

- [ ] T017 Run the full validation set (Validation Plan below) and fix any lint, format or type finding in this story's files only. Confirm the test comments name `TC-COMP-036`, `TC-COMP-043`, `TC-COMP-044`, `TC-COMP-045` and `TC-COMP-046` (`# Implements TC-COMP-0NN`) and that `git diff --stat` lists exactly `src/factorflow/data_health/{__init__,queries,reader}.py` (modified), `tests/unit/test_data_health_items.py` and `tests/integration/test_data_health_attention.py` (new), plus this story's TDD evidence file. (depends on T016)
- [ ] T018 After each TDD cycle in T002–T017 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E2-S2-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E2-S1 | hard | Existing graph edge. This plan imports `models.py` (`Attention`, `AttentionItem`, `LatestDownload`, `LatestTerminalDownload`, `Problems`, `Progress`) and `queries.PROBLEM_COUNT_SQL`, and extends `queries.py`, `reader.py` and `__init__.py`, all created by E2-S1 |
| CAP-003-E2-S3 | context | Extends the same three files (`queries.py`, `reader.py`, `__init__.py`) for `read_data_health`; this plan imports nothing from it and T015 keeps its `__all__` entry if present. Whether E2-S3 reuses `FOLLOWED_COUNT_SQL` or `PRICES_AS_OF_SQL` is decided by E2-S3's own plan on its own graph line (Other Notes) |
| CAP-003-E2-S4 | reverse | `data-health-api`'s `GET /api/attention` calls `read_attention` and maps `Attention` through `AttentionResponse.from_reader`; its graph line already holds `CAP-003-E2-S2` |

No new hard edge: the only implementation prerequisite is E2-S1, already on
this story's line (`CAP-003-E2-S2: [CAP-003-E2-S1]`). Cross-capability inputs
(migrations 0001, 0003, 0004; `credential_present`; `get_most_recent_run`'s
order as precedent) are delivered.

### Task Dependencies
- T001: none
- T002, T003: depend on T001; same file, so T003 after T002; together parallel with T004
- T004: depends on T001 (creates the integration file and its seed helpers)
- T005 to T012: depend on T004 (same file, shared helpers)
- T013: depends on T001
- T014: depends on T013
- T015: depends on T014
- T016: depends on T015
- T017: depends on T016
- T018: interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: the unit file (T002, T003) and the integration file (T004 to T012) are independent
- Phase 3 is sequential (T013 → T014 → T015)

---

## Validation Plan

### Constitution-Defined Commands
(tech stack v7, Validation Commands table; working directory the repository root)
- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest` (needs a container runtime for `postgres`-marked tests; without one run `uv run pytest -m 'not postgres'` and report the exclusion, never as a green full suite)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- Focused: `uv run pytest tests/unit/test_data_health_items.py tests/integration/test_data_health_attention.py`
- DAC-E2-6, AC-7: T005 reads `Progress(0, None)` before the claim and `Progress(40, 120)` after
- DAC-E2-7, DAC-E2-S2-2, AC-12, AC-21: T006 and T010 pass, including the cancelled-while-running case (c) and the eight recorded states
- DAC-E2-8, AC-9: T002 (pure rules) and T011 (items leave when the cause leaves) pass
- DAC-E2-S2-1: T004 passes, including `checked_at` equal to the transaction's `now()`
- DAC-E2-S2-3, AC-4: T003 and T007 pass; `grep -nE "FACTORFLOW_MASSIVE_API_KEY|os\.environ|getenv|get_secret_value" src/factorflow/data_health/` prints nothing
- DAC-E2-S2-4, AC-28: T008's statement list is the same five constants at 3 and 3000 instruments, which also shows `read_attention` makes no `coverage-service` call (no source grep: E2-S3 legitimately imports `read_coverage` into the same `reader.py`)
- Read-only (E2-S1 DAC-E2-S1-1): `uv run pytest tests/unit/test_data_health_sql_is_read_only.py` passes on the extended files; `grep -nE "conn\.(commit|rollback|transaction)\(" src/factorflow/data_health/reader.py` prints nothing
- No delivered file changed: `git diff --stat` names only this story's files (DEC-0211)

---

## Notes

### Resolved Conflicts

1. **Five statements or six.** RD 2.3's sequence and RD 2.6 ("its progress in the same statement") and the story Description (Q4 `LATEST_DOWNLOAD_SQL` "with `done` as instruments holding ...") put the progress aggregate inside Q4, five statements in all; RD 5, the epic NFR *Latency* and DAC-E2-S2-4 / TC-COMP-046 say "five aggregate statements plus the progress aggregate", which can be read as six. The story AC governs, and its operative requirement is a fixed set of aggregate statements, independent of the roster, with no per-instrument statement (it traces to AC-28 and the 10 s cadence); the progress aggregate is still issued, as a scalar subquery of Q4. That reading satisfies the AC, RD 2.6 and the story Description together, so the plan issues five statements and T008 pins the exact list (identical at 3 and at 3000 instruments). The test specification ranks below both and needs no change.
2. **TC-COMP-045 "patched to return False".** The test spec patches `credential_present()`; DAC-E2-S2-3 requires only the given state. T007 removes the environment variable so the delivered function genuinely returns `False`, which observes the same state and also exercises the real call; T003 proves the reader calls the delivered function. The story AC governs over the test spec's mechanism.
3. **`__init__.py` export.** RD 2.1 says `__init__.py` exports all three functions; the story's file list names only `reader.py`, `queries.py` and the two test files. Design placement prose is not contradicted by a file list that omits a one-line export; T015 adds `read_attention` (E2-S1 plan, Open Gap 1, handed this to E2-S2).
4. **Tier and copy on items.** DAC-E2-8 ("items carry no tier and no copy") is met by `AttentionItem`'s three fields (`kind`, `recorded_at`, `run_id`), pinned by E2-S1's models test; this plan adds no field.

### Open Gaps

None that block. No PROVISIONAL decision: every value used is fixed by an artifact or a local precedent (the predicates by RD 2.6 and 2.7, DEC-0203 and DEC-0213 f; `total = None` while 0 by DAC-E2-6; the tie-break by `factorflow.runs.queries._LIST_ORDER`; `checked_at` by RD 2.3).

### Other Notes

- **Tie-break.** No artifact orders two runs with the same `requested_at` or `ended_at`. Both statements add `, run_id DESC`, the order `factorflow.runs.queries` already uses for the Runs list and health's `most_recent_run` (ladder step 5), so the shell's progress and its health strip name the same run. Not a contract value; T010 b and c pin it.
- **No clamp of `done`.** DAC-E2-6's "`done` MUST never exceed `total`" holds by construction: the runner records `instruments_named` from the claimed roster before any result is written (`src/factorflow/ingestion/runner.py` calling `record_instruments_named`), results exist only for roster instruments, and the primary key allows at most four rows per instrument per run. Adding `min(done, total)` would be handling a state the store cannot hold; T005 asserts the property on writer-shaped data.
- **Type narrowing in `_attention_items`.** `Problems.newest_completed_at` is `datetime | None`. `PROBLEM_COUNT_SQL` returns NULL exactly when the count is 0 (an aggregate over the same inner-joined set whose `completed_at` is NOT NULL), so the `is not None` conjunct narrows the type without changing behaviour on any store; the rule tested is the count (T002 a's inconsistent case kills dropping `stock_count > 0`).
- **Item order.** RD 2.7 and DEC-0203 fix no order and the interface sorts (`sortAttention`, home-ui). The implementation emits RD 2.7's row order; no test asserts order.
- **Snapshot.** The five statements run under the caller's READ COMMITTED transaction, one snapshot each; `checked_at` is the transaction start. A download writing between statements can make `problems` and `latest_download` differ by one result; no AC requires one snapshot for the attention read and the next poll is at most 10 s away. E2-S3 carries the same question for the aggregate (register G5).
- **Read-only guard reach.** E2-S1's guard scans the whole text of `queries.py` and `reader.py`, case-insensitively, for insert, update, delete, truncate, alter and drop as words. The test files' seed helpers write to the store and live under `tests/`, which the guard does not scan. `tests/unit/test_sql_is_append_only.py` scans `src/` only.
- **E2-S1's `_SQL` shape check and `'{}'`.** E2-S1's plan has its T003 reject any `{` in every `_SQL` constant, while its T012 writes `PROBLEM_COUNT_SQL` with `COALESCE(..., '{}')`, an empty-array literal, not interpolation. That is E2-S1's to reconcile when it is coded (for example by forbidding only `{` followed by an identifier and `}`, or by `ARRAY[]::text[]`); this plan's four constants contain no `{` either way, and T016 runs whatever guard E2-S1 ships. Recorded in the epic resolution register.
- **Query reuse by E2-S3.** `FOLLOWED_COUNT_SQL` (followed count and `now()`) and `PRICES_AS_OF_SQL` (equal to `latest_session`, system design 4.2) may serve `read_data_health` too. This plan does not plan for E2-S3; if E2-S3's plan imports them, that is a hard edge on E2-S3's own graph line, which only its planner may add.
- **Mapped test cases.** TC-COMP-036, TC-COMP-043, TC-COMP-044, TC-COMP-045 and TC-COMP-046 (data-health-reader-tests.md; coverage matrix rows DAC-E2-6, DAC-E2-7, DAC-E2-8, DAC-E2-S2-1 to DAC-E2-S2-4). The capability-AC rows AC-7, AC-8, AC-9, AC-12, AC-21 also list integration and other components' cases (TC-INT-*, home-ui, setup-ui), which belong to E2-S6 and the E3 to E6 stories.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `src/factorflow/data_health/queries.py: HAVING count(*) = 4 → HAVING count(*) >= 3` (T005)
  - `src/factorflow/data_health/queries.py: WHERE x.run_id = r.run_id → WHERE true` (T005)
  - `src/factorflow/data_health/queries.py: ORDER BY r.requested_at DESC, r.run_id DESC → ORDER BY r.requested_at ASC, r.run_id DESC` (T006 a)
  - `src/factorflow/data_health/queries.py: ORDER BY ended_at DESC, run_id DESC → ORDER BY requested_at DESC, run_id DESC` (T006 c)
  - `src/factorflow/data_health/queries.py: 'cancelled', 'abandoned') → 'cancelled')` (LATEST_TERMINAL_SQL; T006 b)
  - `src/factorflow/data_health/queries.py: FROM instrument WHERE lifecycle = 'active' → FROM instrument WHERE true` (FOLLOWED_COUNT_SQL; T009)
  - `src/factorflow/data_health/queries.py: AND c.data_type = 'prices' → AND true` (T009)
  - `src/factorflow/data_health/queries.py: SELECT max(c.covered_to) → SELECT min(c.covered_to)` (T009)
  - `src/factorflow/data_health/reader.py: state in ("failed", "abandoned") → state in ("failed", "abandoned", "cancelled")` (T002 b)
  - `src/factorflow/data_health/reader.py: credential_present() → True` (in `read_attention`; T007)
  - `src/factorflow/data_health/reader.py: tuple(symbols) → symbols` (T004, T012)
- **Equivalent mutants** (record as such, with the reason): `HAVING count(*) = 4` → `HAVING count(DISTINCT x.data_type) = 4` is equivalent because `(run_id, instrument_id, data_type)` is the primary key; dropping `and problems.newest_completed_at is not None` is not a runtime mutant (it fails `mypy` strict) and on any store it is implied by `stock_count > 0`.
