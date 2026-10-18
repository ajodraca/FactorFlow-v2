---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S1-tasks
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
  timestamp: 2026-10-17T22:51:00Z
  source_artifacts:
    - id: CAP-002-E3-S1
      version: "1"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E3-S1 — Reader Foundation: Current Set, Later Attempt and Summary

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E3-tasks`
**Date**: 2026-10-17

## Summary

Delivers the read side's foundation in `src/factorflow/classification/reader.py`
with `sql/current_set.sql` and `sql/summary.sql`: the one definition of the
current set (latest `complete`), of the `later` attempt (a newer `building` or
`failed` set, or the set being produced while none is complete), of
`not_current` (true exactly when `later` is non-null), and of a current stock
(no `missing` or `outdated` `factor_input` row; `not_computable` does not
count). The summary carries per-factor counts and the current-stock count with
no stock rows. Everything returned is a stored row; nothing is recomputed
(STD-UI-15). The story ships the module skeleton, the `set` and `later` block
types and the shared block reader that `list_classifications` (CAP-002-E3-S2)
and the API reuse, so every consumer reads one rule. No list, compare, evidence,
history or sets read is built here.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-13 | Outdated input rule; the summary's current-stock count derived from it | T006, T007, T010, T014, T016 |
| AC-20 | Previous set kept and marked not current; failure and reason shown (serve side) | T003, T004, T009, T011, T013, T015 |
| AC-21 | Date of the current classifications and the acquisition run they reflect | T003, T008, T009, T013, T015 |
| AC-22 | Before any classification, say none has been produced | T004, T005, T010, T013, T015, T016 |
| DAC-E3-1 | `current_set` is the latest `complete`; `later` per rule; `not_current` iff `later` | T003, T004, T009, T011, T013, T015 |
| DAC-E3-10 | A stock is current exactly when none of its `factor_input` rows is `missing` or `outdated` | T006, T010, T014, T016 |
| DAC-E3-11 | Summary and list carry one `set` and `later` shape, before any set exists too | T004, T005, T010, T015, T016 (the list half: E3-S2, API half: E3-S5) |
| DAC-E3-S1-1 | Complete set plus newer building set: `set`, `later`, `not_current` true | T003, T009 |
| DAC-E3-S1-2 | Only a `building` or `failed` first set: `never_classified`, `set` null, `later` with `failure_reason` | T004, T011 |
| DAC-E3-S1-3 | No set at all: `never_classified`, `later` null, same shape | T005, T010 |
| DAC-E3-S1-4 | `missing`/`outdated` input is not current; `not_computable` is | T006, T010 |
| DAC-E3-S1-5 | Summary returns counts only, no stock rows, from indexed set rows | T007 |
| DAC-E3-S1-6 | Every returned value is a stored row; nothing recomputed | T008, T012 |

Mapped component test cases (all mandatory): TC-COMP-170 (DAC-E3-S1-1), TC-COMP-171
(DAC-E3-S1-2), TC-COMP-181 (DAC-E3-S1-3), TC-COMP-103 (DAC-E3-S1-4), TC-COMP-104
(DAC-E3-S1-5), TC-COMP-178 (DAC-E3-S1-6). TC-COMP-173 traces to DAC-E3-11 and
is an API-level component test owned by CAP-002-E3-S5 (its DAC-E3-S5-3).
TC-INT-035 traces to DAC-E3-10 and is owned by no story: the coverage matrix
maps it only to the epic-level DAC-E3-10, so it belongs to the Phase 6b
automation stage for the capability's `integration-tests.md`. CAP-002-E3-S5
cites it by comment only, without claiming it. Neither is planned here (see
Notes and Open Gap 6).

## Phase 1: Setup

**Purpose**: Confirm what this story imports exists, and give the reader tests a way to seed sets directly (design section 7: fixtures insert into `research-store` so the reader is tested independently of the engine).

- [ ] T001 Confirm the producers exist before any code is written, and STOP and report if one is missing rather than creating it here: `src/factorflow/classification/__init__.py` and `src/factorflow/classification/constants.py` exporting `MIN_PEER_SET_SIZE` (30) and `FACTORS` (both created by CAP-002-E2-S2); `src/factorflow/db/migrations/0006_classifications.sql` (CAP-002-E2-S1); `tests/unit/test_package_data_ships_sql.py` with `classification/sql/*.sql` in `[tool.setuptools.package-data]` (CAP-002-E1-S1 creates the guard, CAP-002-E2-S1 adds the glob; DEC-0088). Nothing is edited by this task.
- [ ] T002 Create the seeding helpers `tests/integration/reader_seed.py` (a plain helper module, the pattern of `tests/unit/design_sql.py`; later E3 reader stories import it). Functions take a `psycopg.Connection` and use bound parameters only: `insert_instrument(conn, symbol, lifecycle="active") -> int`; `insert_run(conn, state="succeeded", started_at=...) -> UUID` (a terminal state needs `ended_at`, per `acquisition_run_terminal_has_end`; `started_at` is explicit so `run_started_at` assertions are deterministic); `insert_set(conn, run_id, state, *, started_at, ended_at=None, classification_date=..., latest_trading_day=None, active_instruments=None, failure_reason=None, factors=None) -> UUID` (writes the `classification_set` row and its three `classification_set_factor` rows with the given `qualified_count`/`ranked`; honours `classification_set_terminal_has_end`, `classification_set_failed_has_reason`, `classification_set_complete_is_sized` and the single-`building` unique index); `insert_input(conn, set_id, instrument_id, factor, input_name, status, ...)` (a `present` row needs `value`, `as_of` and `known_on`; `detail` is `'{}'::jsonb`). Tests use the existing `migrated_run_schema_connection` fixture in `tests/conftest.py`, which applies every migration `discover` finds and so includes `0005` and `0006` once they exist. Add no fixture to `tests/conftest.py`.

**Checkpoint**: Producers confirmed present; a test can seed instruments, runs, sets, factor rows and inputs in a migrated database.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the current-set, `later`, currency and summary behaviour from the acceptance criteria. Both test files import `from factorflow.classification import reader`, so they fail at import until Phase 3.

### Mandatory Component Tests

Marker: every test below is `@pytest.mark.postgres`. Each carries a `# Implements TC-COMP-nnn` comment and a docstring naming its DAC.

- [ ] T003 Implement TC-COMP-170 (current_set returns complete set with newer building set as later) in `tests/integration/test_reader_current_set.py`. Seed run A and a `complete` set (older), run B and a `building` set with `started_at` later than the complete set's. Assert through `reader.read_set_blocks(conn)` and through `reader.summary(conn)` (both must agree): `set.set_id` is the complete one, `later.set_id` the building one with `later.state == "building"`, `later.run_id`, `later.run_started_at` equal to run B's `started_at`, `later.ended_at is None`, `later.failure_reason is None`, `set.not_current is True`, `never_classified is False`; and `reader.current_set(conn)` returns the complete set with `not_current is True` (Implements TC-COMP-170; DAC-E3-S1-1, DAC-E3-1; AC-20, AC-21).
- [ ] T004 Implement TC-COMP-171 (first set building or failed gives never_classified with later) in `tests/integration/test_reader_current_set.py`. Two cases, each in its own fresh database: only a `building` first set; only a `failed` first set with `failure_reason="boom"`. In both: `reader.current_set(conn) is None`, `read_set_blocks` gives `set is None`, `never_classified is True`, `later` carries that set's `set_id`, `state`, `run_id`, `run_started_at`, and for the failed one `later.failure_reason == "boom"` and a non-null `ended_at` (Implements TC-COMP-171; DAC-E3-S1-2, DAC-E3-11; AC-20, AC-22).
- [ ] T005 Implement TC-COMP-181 (no set at all gives never_classified in the same shape) in `tests/integration/test_reader_current_set.py`. Empty database: `reader.current_set(conn) is None`; `read_set_blocks(conn)` gives `set is None`, `later is None`, `never_classified is True`; the returned object is the same type and field names as in T003 and T004 (compare `dataclasses.fields`), so the shape does not change by state (Implements TC-COMP-181; DAC-E3-S1-3; AC-22).
- [ ] T006 Implement TC-COMP-103 (summary currency counts missing/outdated, not not_computable) in `tests/integration/test_reader_summary.py`. Seed a `complete` set with `active_instruments=4` and four active stocks, each with its eight `factor_input` rows: stock 1 all `present`; stock 2 one `missing` input; stock 3 one `outdated` input; stock 4 one `not_computable` input and the rest `present`. Assert `summary(conn).stocks_current.current_count == 2` (stocks 1 and 4) and `followed_count == 4`. Add the converse: a stock with both `not_computable` and `missing` is not current (Implements TC-COMP-103; DAC-E3-S1-4, DAC-E3-10; AC-13).
- [ ] T007 Implement TC-COMP-104 (summary returns counts only from indexed rows) in `tests/integration/test_reader_summary.py`. Seed a complete set with 60 stocks of inputs. (a) Counts only: execute `reader.SUMMARY_SQL` with the set id and assert exactly one row of two integer columns (`current_count`, `scored_roster`), and assert `dataclasses.fields(reader.Summary)` names are exactly `set`, `never_classified`, `later`, `stocks_current` and `StocksCurrent` holds only integers, so no stock rows can travel. (b) Indexed: inside a transaction run `SET LOCAL enable_seqscan = off`, then `EXPLAIN` the `SUMMARY_SQL` (bound `set_id`) and `CURRENT_SET_SQL`; assert the plan text names no `Seq Scan on factor_input`, no `Seq Scan on classification_set` and no `Seq Scan on classification_set_factor`, so each statement can be served from the `factor_input` primary key's `set_id` prefix, `idx_classification_set_complete_recent`, `idx_classification_set_started` and the `classification_set_factor` primary key (Implements TC-COMP-104; DAC-E3-S1-5; AC-13). The technique is recorded in Notes, Open Gaps.
- [ ] T008 Implement TC-COMP-178 (reader returns stored values and recomputes nothing) in `tests/integration/test_reader_summary.py`. Seed a `complete` set whose stored values are deliberately not derivable from the rows beneath it: `active_instruments=7` with inputs for only 3 stocks; `classification_set_factor.qualified_count=41, ranked=True` for one factor and `qualified_count=3, ranked=False` for another, with no `factor_classification` rows at all; an `ended_at` and `latest_trading_day` set to distinct known values; run `state="partial"`. Assert `summary(conn)` returns exactly those stored values: `set.active_instruments == 7`, `stocks_current.followed_count == 7`, `set.factors["value"].qualified_count == 41` and `.ranked is True`, the unranked factor `3`/`False`, `set.ended_at`, `set.latest_trading_day`, `set.classification_date`, `set.run_outcome == "partial"`, `set.run_started_at` equal to the seeded run's `started_at`, and `min_peer_set_size == 30` on every factor. A reader that recounted from `factor_classification` or `factor_input` would return 0 or 3 (Implements TC-COMP-178; DAC-E3-S1-6; AC-21; STD-UI-15).

### Additional Unit Tests

- [ ] T009 Current-set edge cases in `tests/integration/test_reader_current_set.py` (design section 7 rows "Current is latest complete", "Not current after failure", "Run outcome, ended_at, run_started_at and counts"; AC-20, AC-21, DAC-E3-1): with two `complete` sets the one with the later `ended_at` is current and `later` is None, `not_current` False; a `complete` set with a newer `failed` set gives `later.state == "failed"` with `failure_reason` and the complete set still served; a `complete` set alone gives `later is None` and `not_current is False`; a `building` set older than the current complete set (not newer) is not `later`; `CurrentSet` carries `classification_date`, `run_id`, `run_started_at`, `run_outcome` ("succeeded" and "partial"), `started_at`, `ended_at`, `latest_trading_day`, `active_instruments`, and `factors` has the three keys in `FACTORS` order with `min_peer_set_size == 30`.
- [ ] T010 Summary shape in `tests/integration/test_reader_summary.py` (design section 7 rows "Summary current count" and "Summary carries no rows and the set state"; AC-13, AC-22, DAC-E3-11): no set at all gives `Summary(set=None, never_classified=True, later=None, stocks_current=None)`; only a `building` first set gives `set=None`, `never_classified=True`, `stocks_current=None` and `later` carrying the set; a complete set with a newer building set gives `set` and `later` together with `stocks_current` computed from the complete set's rows; `followed_count == active_instruments` and, in a consistent set, equals the `scored_roster` column of `SUMMARY_SQL`; a factor below 30 qualified (`ranked=False`) changes no stock's currency; a complete set with zero `factor_input` rows gives `current_count == 0` and no error.
- [ ] T011 PROVISIONAL behaviour pin in `tests/integration/test_reader_current_set.py` (Open Gap 1; DAC-E3-1, AC-20): with no `complete` set and two earlier-then-later non-complete sets (first `failed`, second `building`), `later` is the more recently started one (`building`). A comment cites "PROVISIONAL, awaiting owner confirmation (2026-10-17), Open Gap 1 of CAP-002-E3-S1-tasks" so a later change is deliberate. With exactly one set (every mapped TC) the choice is unobservable.
- [ ] T012 [P] Read-only guard in `tests/unit/test_reader_sql_read_only.py` (DAC-E3-S1-6, constraint "Read-only"): `current_set.sql` and `summary.sql` each contain one statement beginning `WITH` or `SELECT` and no `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `CREATE`, `ALTER` or `DROP` keyword (word-boundary, comments stripped); both are located through `Path(factorflow.classification.reader.__file__).parent / "sql"`, the same directory the module reads at import. No database is needed, so this test is not `postgres`-marked.

**Checkpoint**: All tests written and failing (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with the two statements, the block types and the two public reads.

- [ ] T013 Create `src/factorflow/classification/sql/current_set.sql` from the design section 2.4 statement (`current` and `later` CTEs, `FULL JOIN ... ON true`), closing the elided `SELECT ...` list (Open Gap 2): `current` columns `set_id`, `classification_date`, `run_id`, `run_started_at` (`acquisition_run.started_at`), `run_outcome` (`acquisition_run.state`), `state`, `started_at`, `ended_at`, `latest_trading_day`, `active_instruments`, plus `factors` as `(SELECT jsonb_object_agg(f.factor, jsonb_build_object('qualified_count', f.qualified_count, 'ranked', f.ranked)) FROM classification_set_factor f WHERE f.set_id = c.set_id)`; `later` columns prefixed `later_` (`set_id`, `state`, `run_id`, `run_started_at`, `started_at`, `ended_at`, `failure_reason`). Keep the `ORDER BY s.ended_at DESC LIMIT 1` over `state = 'complete'` and `s.started_at > COALESCE((SELECT started_at FROM current), '-infinity')` with `ORDER BY s.started_at DESC LIMIT 1` exactly as designed; do not add a state filter to `later` (a newer `complete` set cannot exist by construction, design 2.4). No parameters, no `%` characters. If PostgreSQL rejects `current` as a CTE name, rename it consistently inside the file; the name is not part of any interface. (depends on T001)
- [ ] T014 [P] Create `src/factorflow/classification/sql/summary.sql` verbatim from the design section 2.4 (`current_count`, `scored_roster`; parameter `%(set_id)s`). (depends on T001)
- [ ] T015 Create `src/factorflow/classification/reader.py` with the module docstring (cites `component-design-classification-reader.md` sections 2.1, 2.3, 2.4, 7 and AC-13, AC-20 to AC-22), `_SQL_DIR = Path(__file__).parent / "sql"` and `CURRENT_SET_SQL`/`SUMMARY_SQL` loaded with `read_text()` at import (the pattern of `src/factorflow/coverage/gaps.py`); `from factorflow.classification.constants import FACTORS, MIN_PEER_SET_SIZE` (re-exported, so `reader.FACTORS` exists as the design shows; do not redefine either); the frozen dataclasses `LaterSet`, `FactorSummary`, `CurrentSet`, `StocksCurrent`, `Summary` with the exact fields and types of design section 2.3; `read_set_blocks(conn) -> tuple[CurrentSet | None, LaterSet | None]` (Open Gap 3) that runs `CURRENT_SET_SQL` once with a plain cursor, maps tuple columns by name through the cursor description (the module-local `_row_to_*` pattern of `runs/queries.py`), returns `(None, None)` for zero rows, builds `CurrentSet` only when the current columns are non-null with `not_current = later is not None`, `factors` as `{f: FactorSummary(qualified_count, ranked, MIN_PEER_SET_SIZE) for f in FACTORS}`, and `LaterSet` only when its columns are non-null; and `current_set(conn) -> CurrentSet | None` returning the first element. Do not define `Thresholds`, `ListFilters`, `ClassificationPage`, `SORT_ALLOWLIST`, the cursor or exception types, and do not import `factorflow.api.bounds` or `factorflow.api.classification_bounds`: those belong to CAP-002-E3-S2 and later and importing them here would add an unrecorded dependency. No `commit`, no write. (depends on T013, T001)
- [ ] T016 Add `summary(conn) -> Summary` to `src/factorflow/classification/reader.py`: call `read_set_blocks`; with no current set return `Summary(set=None, never_classified=True, later=later, stocks_current=None)`; otherwise execute `SUMMARY_SQL` with `{"set_id": set.set_id}`, read `current_count` from the single row and set `StocksCurrent(current_count, followed_count=set.active_instruments)` (the stored column, not `scored_roster`, per design 2.4), returning `Summary(set=set, never_classified=False, later=later, stocks_current=...)`. (depends on T014, T015)

**Checkpoint**: T003 to T012 pass; `uv run mypy src` is clean for the new module.

---

## Phase 4: Integration

**Purpose**: Confirm the new statements ship in the release image's package data.

- [ ] T017 Run `uv run pytest tests/unit/test_package_data_ships_sql.py` (the guard CAP-002-E1-S1 created and CAP-002-E2-S1 extended). It must pass with `classification/sql/current_set.sql` and `summary.sql` present, proving a non-editable install carries them (DEC-0088). If it fails, do not edit `pyproject.toml` here: the glob is CAP-002-E2-S1's deliverable; record the failure in the review hand-off. Nothing is mounted or wired in this story: `list_classifications` (CAP-002-E3-S2) and the routes (CAP-002-E3-S5) consume `read_set_blocks` and `summary` later. (depends on T013, T014)

**Checkpoint**: The two SQL files are covered by the package-data guard.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [ ] T018 Run the full validation set (Validation Plan below), fix any lint, format or type finding in the files this story added, and confirm the module docstring and test comments cite DAC-E3-S1-1 to DAC-E3-S1-6 and the six TC-IDs. Add no file beyond the five source/test files and two SQL files named above. (depends on T016, T017)
- [ ] T019 After each TDD cycle in T003–T018 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E3-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E2-S1 | hard | Existing graph edge. `classification_set`, `classification_set_factor`, `factor_input` in `0006_classifications.sql`, read by both statements; also the `classification/sql/*.sql` package-data glob and guard extension (T017) |
| CAP-002-E2-S2 | hard | New edge, added to `dependencies.yaml`. Creates `src/factorflow/classification/__init__.py` and `constants.py` (`MIN_PEER_SET_SIZE`, `FACTORS`), which `reader.py` imports (T015) so the 30-stock minimum and the factor list have one definition (SA-DUP-001) |
| CAP-002-E3-S2 | reverse | `list_classifications` imports `read_set_blocks` and the block types from `reader.py` for the `set` and `later` it carries (design 2.3, 2.7) |
| CAP-002-E1-S1 | context | Creates `tests/unit/test_package_data_ships_sql.py` (T001, T017) and migration `0005`; reached through CAP-002-E2-S1's own hard edge, supplies no import to `reader.py` |
| CAP-002-E3-S4 | context | Owns the 3000-stock volume test (TC-COMP-153); cited only to bound what the "indexed rows" proof here does not cover (Open Gap 4) |
| CAP-002-E3-S5 | reverse | The summary and list routes call `summary` and the shared blocks; TC-COMP-173 is tested there |

### Task Dependencies
- T001: No dependencies
- T002: Depends on T001
- T003, T004, T005, T009, T011: Depend on T002; same file, written in order
- T006, T007, T008, T010: Depend on T002; same file, written in order; can run in parallel with the `test_reader_current_set.py` group
- T012: Depends on T001, can run in parallel with all other test tasks (reads the SQL files by path, so it fails until T013 and T014)
- T013: Depends on T001; after Phase 2
- T014: Depends on T001; can run in parallel with T013
- T015: Depends on T013
- T016: Depends on T014, T015
- T017: Depends on T013, T014
- T018: Depends on T016, T017
- T019: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: the `test_reader_current_set.py` group (T003, T004, T005, T009, T011), the `test_reader_summary.py` group (T006, T007, T008, T010) and T012 are three independent files
- Phase 3: T013 and T014 can run in parallel

---

## Validation Plan

### Constitution-Defined Commands
- Build: none defined for Python in the tech-stack Validation Commands table (no separate build step)
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (the story's Validation section; `uv run pytest` runs both)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

If no container runtime is available, run `uv run pytest -m 'not postgres'` and report that the `postgres`-marked reader tests were excluded (tech stack, Validation Commands note).

### Story-Specific Validation
- DAC-E3-S1-1: `uv run pytest tests/integration/test_reader_current_set.py -m postgres -k "later or building"` shows TC-COMP-170 green
- DAC-E3-S1-2, DAC-E3-S1-3: the `never_classified` cases (TC-COMP-171, TC-COMP-181) pass with `set` None and `later` per state
- DAC-E3-S1-4: TC-COMP-103 shows `missing`/`outdated` not current and `not_computable` current
- DAC-E3-S1-5: TC-COMP-104 shows one row of two integers and no `Seq Scan` on the set or input tables with sequential scans disabled
- DAC-E3-S1-6: TC-COMP-178 returns the seeded, non-derivable stored values; `tests/unit/test_reader_sql_read_only.py` passes
- `grep -rn "api.bounds\|classification_bounds" src/factorflow/classification/reader.py` returns nothing

---

## Notes

### Resolved Conflicts

- **Story ACs say `current_set` "is read" and yields `set`, `later`, `not_current` and `never_classified`; the design declares `current_set(conn) -> CurrentSet | None`.** DAC-E3-S1-1 to -3 name `later` and `never_classified`, which exist only on `Summary` and `ClassificationPage` in design 2.3 (a `CurrentSet` cannot carry `later` or a null `set`). Story acceptance criteria outrank an illustrative signature (precedence step 1), but the ACs are met without altering the declared signature: `current_set` keeps its signature and `not_current`, and the shared block reader `read_set_blocks` (Open Gap 3) plus `summary` expose `set`, `later` and `never_classified`. The design's own prose ("`summary` is `current_set`, with its `later`, plus one aggregate", 2.4) describes the same split. No source edit required.
- **DEC-0071 decision (1) and system design v2's "any factor `not_classified`" wording versus DEC-0079 (a)/(b).** Not exercised by this story (it governs `hide_incomplete` and the unscoped list, E3-S2); the summary's current-stock rule is unaffected: DEC-0071's `missing`/`outdated` rule stands and reader design v3 2.4 states it. Recorded so a later reader of this plan does not reopen it.
- **The design's `FACTORS` is declared in `reader.py`; E2-S2's `constants.py` also declares it.** Both are design statements of one fact. The plan imports `FACTORS` from `constants.py` and re-exports it, so `reader.FACTORS` exists as the design shows and has one definition (SA-DUP-001). Not a contradiction of behaviour.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-10-17): which set is `later` when no set is complete and more than one non-complete set exists.** DAC-E3-1, system design 3.3 step 13/14 and DEC-0082 say "the first set while none is complete"; design 2.4's statement orders `later` by `started_at DESC LIMIT 1`, which returns the most recent set. The two agree whenever exactly one set exists, which is every mapped TC and the whole first-classification window except after a failed first attempt is followed by a retry. No artifact determines the multi-set case. The plan adopts the design's SQL (most recent set). Derivation: "first set" is used throughout the UX design as a phase (a `later.state` of `building` or `failed`, "the first set included", ux-design 1578 and 1580), the banner reads *Score update failed* only for the latest attempt, and showing a long-failed attempt while a retry is building would contradict AC-20's "show the failure" for the attempt currently in progress; the literal earliest-set reading would need `ORDER BY started_at ASC` when no complete set exists. Pinned by T011. Flag for the next revision of `component-design-classification-reader.md` 2.4 and `CAP-002-E3.md` DAC-E3-1 to say "the most recent set while none is complete".
2. **The `SELECT ...` list of `current_set.sql` is elided in design 2.4** (the statement ends `SELECT ... FROM current FULL JOIN later ON true; -- current carries r.started_at AS run_started_at too`). The plan closes it with exactly the fields of `CurrentSet` and `LaterSet` (T013), and gathers the three `classification_set_factor` rows in the same statement as a `jsonb` object through the table's primary key, because design 5 counts `current_set.sql` as two index probes and lists no further SQL file for them. Flag for the next revision of the reader design 2.4. Not a value; not marked PROVISIONAL.
3. **Name and shape of the shared block read.** Design 2.3 gives no function for "the `set` and `later` blocks" that `list_classifications` and `summary` both carry (2.4: "one definition of current"). The plan adds `read_set_blocks(conn) -> tuple[CurrentSet | None, LaterSet | None]` as a public module function, the minimal additive shape (precedence 9a) that avoids each caller re-running or re-parsing `current_set.sql` (SA-DUP-001). CAP-002-E3-S2 and CAP-002-E3-S5 must reuse it. Flag for the next revision of the reader design 2.3.
4. **How "runs from indexed set rows" (DAC-E3-S1-5, TC-COMP-104) is proved.** The TC's steps are generic ("It is executed"); no artifact states a latency, a plan assertion or a row count, and design 5 states no latency target (open question 1). The plan asserts structurally with `enable_seqscan = off` and `EXPLAIN` (no `Seq Scan` on `factor_input`, `classification_set` or `classification_set_factor`), which proves an index path exists for the two statements without a timing number and is stable at small row counts. It does not prove the planner chooses the index at 3000 stocks; that is the volume test of CAP-002-E3-S4 (TC-COMP-153). Flag for the owner only if a stricter bound is wanted.
5. **Seed helper location.** The design names `tests/integration/test_reader_*.py` and "fixtures insert sets and rows directly" but no helper module. The plan creates `tests/integration/reader_seed.py` (precedent: `tests/unit/design_sql.py`, `governor_fakes.py`). Later E3 stories extend it.
6. **Owner-directed fix (cross-plan review 2026-10-18, E3-F09): TC-INT-035 is owned by the Phase 6b automation stage for the capability's `integration-tests.md`, not by CAP-002-E3-S5; TC-COMP-173 stays owned by CAP-002-E3-S5 (DAC-E3-S5-3).** — No approved artifact assigns TC-INT-035 to a story. The coverage matrix maps it only to the epic-level DAC-E3-10 (row DAC-E3-10) and to AC-13 (row AC-13), with no DAC-E3-Sn row. Its specification in `integration-tests.md` traces to AC-13 and DAC-E3-10 only. Integration test specifications are automated in Phase 6b (`automation-planning`), and CAP-002-E3-S5's plan leaves TC-INT-035 there, citing it by comment only in `tests/integration/test_api_classification_summary.py`. This plan's earlier statement that TC-INT-035 is tested in CAP-002-E3-S5 is withdrawn. The HTTP half of DAC-E3-10 is covered once the Phase 6b automation plan for `integration-tests.md` exists.

### Other Notes

- **Dependency graph.** `dependencies.yaml` gains one edge: `CAP-002-E3-S1: [CAP-002-E2-S1, CAP-002-E2-S2]`. The story's own Dependencies section names only E2-S1; E2-S2 is discovered from the producer map (T015's imports of `constants.py` and the package `__init__.py` it creates). No cycle: E2-S2 depends only on E2-S1 and nothing in E2 depends on E3-S1. The approved story is not edited; the omission is for the next revision of the story's Dependencies section.
- **Story status.** The skill's step of setting the story's frontmatter `status: planning` was not performed: the supervising instruction forbids editing the approved story. The story stays `todo`.
- **Mapped TCs owned elsewhere.** TC-COMP-173 (list and summary share the shape, DAC-E3-S5-3) is owned by CAP-002-E3-S5. TC-INT-035 (summary over HTTP, DAC-E3-10) is owned by the Phase 6b automation stage for the capability's `integration-tests.md`: the coverage matrix maps it to no story criterion, and CAP-002-E3-S5's `tests/integration/test_api_classification_summary.py` cites it by comment only (Open Gap 6). Both need the routes; this story proves the reader half of DAC-E3-11 and DAC-E3-10, and the list half is proved when E3-S2 exists. The coverage matrix lists AC-20/AC-22 against many TCs; only the six above trace to a DAC-E3-S1 criterion.
- **No edit to CAP-001 modules or to `tests/conftest.py`.** The reader takes a connection, performs no commit and runs no write, so it is exercised with the existing `migrated_run_schema_connection` fixture.
- **No SQL drift guard against the design.** The design's `current_set.sql` snippet elides its select list, so a verbatim comparison with `tests/unit/design_sql.py` (as for the coverage SQL) would be misleading; `summary.sql` is verbatim and a guard on it is possible but is not required by any AC.
- **Risk.** Run T001 first. CAP-002-E2-S1, CAP-002-E2-S2 and their predecessors are `todo` at planning time; the reader tests cannot run against `0006` until they land.
