---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S1-tasks
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
  timestamp: 2026-11-07T05:45:02Z
  source_artifacts:
    - id: CAP-003-E2-S1
      version: "1"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-data-health-reader-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E2-S1 — data-health-reader Models, Queries and read_problems: the One Problem Set, Keyset-Paged

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S1.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-06

## Summary

Creates the read-only `data-health-reader` package `src/factorflow/data_health/`
(component-design-data-health-reader.md, "RD" below, sections 2.1, 2.2, 2.4):
`models.py` with every frozen dataclass of RD 2.2 (the models the later reader
stories and the API build on), `queries.py` with `PROBLEM_ROWS_SQL` (RD 2.4,
verbatim) and `PROBLEM_COUNT_SQL` (the same predicate, counted), `reader.py`
with `read_problems(conn, *, cursor, limit)` and `__init__.py` exporting it. A
followed stock has a problem exactly when it is `active` and any of its
`acquisition_state` rows has `last_outcome` `failed` or `not_found`; each
failure's reason, attempts, completion time and run come from the
`run_instrument_result` row matched on `(last_run_id, instrument_id, data_type)`
(DEC-0201). Rows are keyset-paged by symbol with a `limit + 1` lookahead, so a
full final page carries no cursor; `retryable` is true exactly when any failure
is `failed`. Nothing is written, no schema changes and no delivered file is
edited (DEC-0211). The tests prove the sources hold no write or DDL token, that
paging, the retryable rule and resolution behave as the ACs state, and that
`cursor` and `limit` are bound parameters with the transaction left to the
caller.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-13 | Every problem row carries, per failure, data type, outcome, reason, attempts and completion time | T004, T007, T011, T012, T013 |
| AC-14 | A row whose failures are all `not_found` is `retryable: false` | T005, T013 |
| AC-9 | The problem set exists exactly while its cause holds | T005, T013 |
| AC-16 | The rail-count set and the *Needs fixing* rows are one set | T009, T012 |
| DAC-E2-1 | Problem = active and a `failed`/`not_found` latest outcome, facts from the matched result; retired stock in no count and no row | T007, T008, T009, T012, T013 |
| DAC-E2-2 | A problem leaves only on a later `written` for that data type or on retirement | T005, T012 |
| DAC-E2-3 | Keyset paging by symbol, `limit + 1` lookahead, cursor only when a further stock exists | T004, T008, T012, T013 |
| DAC-E2-S1-1 | `queries.py` and `reader.py` contain no `INSERT`/`UPDATE`/`DELETE`/`TRUNCATE`/`ALTER`/`DROP` token | T002, T012, T013, T015 |
| DAC-E2-S1-2 | Five stocks, `limit` 2: pages 2, 2, 1, cursors on the first two; a full final page has no cursor | T004, T013 |
| DAC-E2-S1-3 | `retryable` false for all-`not_found`, true with a `failed`; leaves only on `written` or retirement | T005, T013 |
| DAC-E2-S1-4 | `cursor` and `limit` are bound parameters; commit and rollback left to the caller | T003, T006, T012, T013 |

The models test T010 and the dataclasses T011 trace to AC-13 (the `Failure`
fields) and to the models E2-S2, E2-S3 and E2-S4 consume (prerequisite
infrastructure named by the story Description).

## Phase 1: Setup

**Purpose**: Confirm the delivered prerequisites before any file is written.

- [ ] T001 Confirm, without editing anything, that these delivered files exist and say what this plan assumes, and STOP and report if one does not: `src/factorflow/db/migrations/0001_extensions_owner_state.sql` (`instrument`, `lifecycle` in {`active`,`retired`}, `retired_at` set exactly when retired), `0003_coverage.sql` (`acquisition_state`, PK `(instrument_id, data_type)`, `last_outcome` in {`written`,`not_found`,`failed`}, `last_run_id uuid NOT NULL`), `0004_runs.sql` (`acquisition_run` with `history_depth_years NOT NULL` and `acquisition_run_terminal_has_end`; `run_instrument_result` PK `(run_id, instrument_id, data_type)`, `reason`, `attempts`, `completed_at`); the `migrated_writer_connection` and `postgres_connection_string` fixtures in `tests/conftest.py` (migrations 0001 to 0004, one database per test); `factorflow.instruments.service.retire_symbol(connection, symbol)`; and that `src/factorflow/data_health/` does not exist yet. Add no fixture to `tests/conftest.py`.

**Checkpoint**: Prerequisites confirmed; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the problem set, its paging, its resolution and the read-only, bound-parameter contract.

All database tests go in `tests/integration/test_data_health_problems.py`
with `pytestmark = pytest.mark.postgres`, use `migrated_writer_connection`,
and seed through module-private helpers in that file, written with bound
parameters only (the precedent of `tests/integration/test_coverage_retired.py`):

- `_instrument(conn, symbol) -> int`: `INSERT INTO instrument (symbol, lifecycle) VALUES (%s, 'active') RETURNING instrument_id`.
- `_run(conn, *, state="partial", requested_at, ended_at) -> UUID`: inserts an `acquisition_run` with `history_depth_years = 1` and the given terminal `state` and `ended_at` (honouring `acquisition_run_terminal_has_end`), `RETURNING run_id`.
- `_record(conn, run_id, instrument_id, data_type, outcome, *, reason=None, attempts=1, completed_at)`: inserts the `run_instrument_result` row and upserts `acquisition_state` with the same `run_id` (`ON CONFLICT (instrument_id, data_type)` replacing `last_run_id`, `last_outcome`, `last_acquired_at = completed_at`), the pairing the delivered writer keeps (`src/factorflow/ingestion/outcomes.py` `write_error_results`). `last_outcome` is the result outcome for `written`, `failed` and `not_found`.
- Every seed ends with `conn.commit()` before the reader is called. Times are fixed aware literals (`datetime(2026, 10, 20, 21, 0, tzinfo=UTC)` and later), never `now()`, so assertions compare against literals.
- Symbols are plain upper-case letters (`AAA` to `EEE`, `ABR`, `ABW`, `FLD`, `MIX`, `NFX`) so ordering does not depend on collation rules for `.` or `-`.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-039 (queries.py and reader.py contain no write or DDL token) in `tests/unit/test_data_health_sql_is_read_only.py` (no `postgres` marker). Define `WRITE_TOKENS = ("INSERT", "UPDATE", "DELETE", "TRUNCATE", "ALTER", "DROP")` and a helper `write_tokens(text) -> list[str]` returning, in source order, every match of `\b(INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP)\b` with `re.IGNORECASE`, normalised to upper case. Locate the two sources through `Path(factorflow.data_health.queries.__file__)` and `Path(factorflow.data_health.reader.__file__)` (what ships). (a) Parametrised over the two files: `write_tokens(path.read_text(encoding="utf-8")) == []`, with the file name and the found tokens in the assertion message. The **whole text** is scanned, comments, docstrings and Python identifiers included; no comment stripping (TC-COMP-039 edge; the pattern of `tests/unit/test_sql_is_append_only.py`). (b) The planted-token half of the TC as a guard self-test, parametrised over the six tokens: `write_tokens(f"SELECT 1 FROM instrument; {token} x")` equals `[token]`; `write_tokens("SELECT 1 -- update in a comment")` equals `["UPDATE"]`; `write_tokens('"""Never drops a row."""')` equals `[]` and `write_tokens("updated_at, alternatively")` equals `[]` (word boundaries, so the guard rejects tokens, not substrings) (Implements TC-COMP-039; DAC-E2-S1-1; AC-17) — kills: hand-written planted-comment mutant on `queries.py` (Other Notes), which a comment-stripping scan would miss; the observation is the non-empty token list naming `UPDATE`.
- [ ] T003 Add the static half of TC-COMP-042 (cursor and limit are bound parameters) to `tests/unit/test_data_health_sql_is_read_only.py`: for every module-level `str` attribute of `factorflow.data_health.queries` whose name ends in `_SQL` (collected with `vars(queries)`, so constants added by E2-S2 and E2-S3 are covered too), assert the text contains no `{` and no `%` other than a bound `%(name)s` (regex `%(?!\([a-z_]+\)s)`, the precedent of `tests/unit/test_reader_sql_read_only.py`), and that its first keyword after leading whitespace is `SELECT` or `WITH`; and for `PROBLEM_ROWS_SQL` assert it contains `%(cursor)s` and matches `LIMIT\s+%\(limit_plus_one\)s` (Implements TC-COMP-042 step 1; DAC-E2-S1-4; SEC-INP-002) (depends on T002, same file) — kills: hand-written `LIMIT %(limit_plus_one)s` → `LIMIT 3` and `i2.symbol > %(cursor)s` → `i2.symbol > '{cursor}'` mutants on `queries.py`; the observation is the regex miss.
- [ ] T004 Implement TC-COMP-040 (read_problems keyset pages of 2 over 5 problem stocks) in `tests/integration/test_data_health_problems.py`. Seed five active stocks `AAA`, `BBB`, `CCC`, `DDD`, `EEE`, each with one `failed` prices result in one terminal run. Call `read_problems(conn, cursor=None, limit=2)`, then with each returned `next_cursor`. Assert against literals, never against values derived from the reader's own output: page symbols `("AAA", "BBB")`, `("CCC", "DDD")`, `("EEE",)`; `next_cursor` `"BBB"`, `"DDD"`, `None`. Full final page: `read_problems(conn, cursor="BBB", limit=3)` holds `("CCC", "DDD", "EEE")` with `next_cursor is None`. Edge: `read_problems(conn, cursor="ZZZ", limit=2)` returns `rows == ()` and `next_cursor is None` (Implements TC-COMP-040; DAC-E2-S1-2, DAC-E2-3; AC-13) — kills: off-by-one on `len(...) > limit` (`>=` sets a cursor on the full final page), off-by-one on the lookahead `limit + 1` → `limit` (no cursor on page 1), hand-written `i2.symbol > %(cursor)s` → `>=` (page 2 repeats `BBB`); observations are the literal page tuples and cursors.
- [ ] T005 Implement TC-COMP-041 (retryable rule and problem resolution only by write or retirement) in `tests/integration/test_data_health_problems.py`. Seed in run R1: `NFX` with `prices` and `fundamentals` `not_found` and the other two types `written`; `FLD` with `prices` `failed` and the other three `written`; `MIX` with `prices` `failed` and `fundamentals` `not_found`. Read with `limit=500`. Assert `retryable` per symbol against literals: `NFX` `False`, `FLD` `True`, `MIX` `True` (the mixed row kills `any` → `all`). Then, each step followed by a re-read: (1) a later run R2 records `written` for `NFX` `reference` only: `NFX` stays (TC edge: written for a different data type); (2) R2 records `written` for `FLD` `prices`: `FLD` leaves; (3) `retire_symbol(conn, "NFX")` then commit: `NFX` leaves; (4) nothing else removes a row: a further read with no change returns the identical page; a run R3 recording `failed` again for `MIX` `prices` with reason `"second attempt"` keeps `MIX` with that failure's `run_id == R3` and `reason == "second attempt"`; a run R4 (`cancelled`, no result rows) changes nothing. Finally, nothing records that a row was viewed: the full contents of `instrument`, `acquisition_run`, `acquisition_state` and `run_instrument_result` (`SELECT * ... ORDER BY` the primary key) are equal before and after two reads (Implements TC-COMP-041; DAC-E2-S1-3, DAC-E2-2; AC-9, AC-14) — kills: negate-boolean on `outcome == "failed"` (`NFX` reads `True`), hand-written `any(` → `all(` on `reader.py` (`MIX` reads `False`), hand-written `last_outcome IN ('failed', 'not_found')` → `IN ('failed')` in the subquery (`NFX` vanishes before step 3).
- [ ] T006 Implement the behavioural half of TC-COMP-042 (cursor bound; no transaction left open by the function) in `tests/integration/test_data_health_problems.py`. (a) Bound cursor: seed `AAA` and `BBB` as problems; `read_problems(conn, cursor="Z' OR '1'='1", limit=2)` returns `rows == ()` and `next_cursor is None` (a bound value compares as text and is greater than every seeded symbol; an interpolated one would page from the start or raise a syntax error). (b) Transaction left to the caller: after `conn.commit()` the status is `psycopg.pq.TransactionStatus.IDLE`; after `read_problems(conn, cursor=None, limit=2)` it is `INTRANS`, so the function issued no commit or rollback; `conn.rollback()` returns it to `IDLE`. (c) Pooled: open `psycopg_pool.ConnectionPool(postgres_connection_string, min_size=1, max_size=1)` as a context manager (the test requests `postgres_connection_string` beside `migrated_writer_connection`, which share one database per test); inside `with pool.connection() as conn:` the status after `read_problems` is `INTRANS`; a second `with pool.connection() as conn:` sees `IDLE` before any statement, so the caller's block ended the transaction (Implements TC-COMP-042 step 2; DAC-E2-S1-4; AC-17; SEC-INP-002) — kills: hand-written `conn.commit()` added after the fetch in `read_problems` (status reads `IDLE`, not `INTRANS`), and an interpolated cursor (non-empty page or `psycopg.errors.SyntaxError`).

### Additional Unit Tests

- [ ] T007 Failure facts come from the matched result (AC-13, DAC-E2-1) in `tests/integration/test_data_health_problems.py`. Seed `AAA` with: run R1 recording `prices` `failed`, `reason="old reason"`, `attempts=1`, `completed_at=t1`; a later run R2 recording `prices` `failed`, `reason="provider timeout"`, `attempts=3`, `completed_at=t2`; R2 recording `fundamentals` `not_found`, `reason=None`, `attempts=2`, `completed_at=t3`; R2 recording `reference` and `corporate_actions` `written`. Assert the single row's `failures` equals the literal tuple `(Failure("fundamentals", "not_found", None, 2, t3, R2), Failure("prices", "failed", "provider timeout", 3, t2, R2))`, in `data_type` order, where `R2`, `t2`, `t3` are the seed values — kills: drop-field-copy on each `Failure` field (`reason`, `attempts`, `completed_at`, `run_id`), hand-written removal of `r.run_id = s.last_run_id` from the join (R1's row joins too and the tuple grows), hand-written removal of the outer `s.last_outcome IN (...)` (the two `written` types join as failures).
- [ ] T008 Retired and clean stocks never take a page slot (DAC-E2-1, DAC-E2-3) in `tests/integration/test_data_health_problems.py`. Seed the five problem stocks of T004 plus `ABR` (a `failed` prices result, then `retire_symbol(conn, "ABR")`) and `ABW` (active, all four types `written`), both sorting between `AAA` and `BBB`. Paging with `limit=2` returns exactly the literal pages and cursors of T004, and no page holds `ABR` or `ABW` — kills: hand-written `WHERE i2.lifecycle = 'active'` → `WHERE true` in the subquery (`ABR` takes the lookahead slot and page 1 loses its cursor), and dropping the subquery's outcome predicate (`ABW` takes a slot).
- [ ] T009 One problem set: `PROBLEM_COUNT_SQL` agrees with the rows (AC-16, DAC-E2-1) in `tests/integration/test_data_health_problems.py`. On the T008 store, add a second failure to `BBB` (`fundamentals` `not_found` at a time `t_new` later than every other seeded `completed_at`). Execute `factorflow.data_health.queries.PROBLEM_COUNT_SQL` with no parameters and fetch its one row by column name: `stock_count == 5`, `symbols == ["AAA", "BBB", "CCC"]` (first three by symbol; `ABR` excluded), `newest_completed_at == t_new`; and `5` equals the number of distinct symbols across every `read_problems` page at `limit=2`. On an empty migrated database the row is `stock_count == 0`, `symbols == []`, `newest_completed_at is None` — kills: hand-written `count(DISTINCT i.instrument_id)` → `count(i.instrument_id)` (reads 6), hand-written `WHERE i.lifecycle = 'active'` → `WHERE true` in the count (reads 6 with `ABR`), dropping the `COALESCE` (`symbols` reads `None` on the empty store).
- [ ] T010 [P] Model shapes in `tests/unit/test_data_health_models.py` (no `postgres` marker). For each dataclass of RD 2.2 (`Progress`, `LatestDownload`, `LatestTerminalDownload`, `Problems`, `AttentionItem`, `Attention`, `Failure`, `ProblemRow`, `ProblemPage`, `GapDetectionState`, `DailyPricesCheck`, `CompanyFinancialsCheck`, `DataHealth`), assert `[f.name for f in dataclasses.fields(cls)]` equals a literal list written in this test from RD 2.2 in that order (the fields `data-health-api` mirrors in E2-S4), and that assigning to a field of an instance raises `dataclasses.FrozenInstanceError` (construct `Failure`, `ProblemRow` and `ProblemPage` with literal values; for the others use `cls.__dataclass_params__.frozen is True`) — kills: remove-attribute on `frozen=True`, drop-field-copy of any declared field (the literal list differs).

**Checkpoint**: All tests written; they fail on `ImportError` for `factorflow.data_health` (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: Create the package, its models, its two statements and `read_problems`.

- [ ] T011 [P] Create `src/factorflow/data_health/models.py`: the thirteen frozen dataclasses of RD 2.2 with exactly the fields, order and types shown there (`from __future__` not needed; `datetime`, `date`, `UUID`, `Literal`). Module docstring cites RD 2.2 and system design §4.2 and states that the models carry facts in the domain vocabulary and no sentence or tier (DEC-0200). No behaviour, no validation. (depends on T001)
- [ ] T012 [P] Create `src/factorflow/data_health/queries.py` with module-level `Final[str]` constants: `PROBLEM_ROWS_SQL`, verbatim from RD 2.4 from `SELECT` to the closing `ORDER BY` (the snippet's leading `-- queries.py: ...` comment line is a file label and is not copied, so the constant's first keyword is `SELECT` as T003 checks; the trailing `;` may be dropped) (columns `symbol`, `data_type`, `outcome`, `reason`, `attempts`, `completed_at`, `run_id`; parameters `%(cursor)s` and `%(limit_plus_one)s`; `ORDER BY i.symbol, s.data_type`); and `PROBLEM_COUNT_SQL`, the same joins and predicate with no parameter, returning one row:
  `SELECT count(DISTINCT i.instrument_id) AS stock_count, COALESCE((array_agg(DISTINCT i.symbol ORDER BY i.symbol))[1:3], '{}') AS symbols, max(r.completed_at) AS newest_completed_at FROM instrument i JOIN acquisition_state s ON s.instrument_id = i.instrument_id JOIN run_instrument_result r ON r.run_id = s.last_run_id AND r.instrument_id = s.instrument_id AND r.data_type = s.data_type WHERE i.lifecycle = 'active' AND s.last_outcome IN ('failed', 'not_found')`.
  The column aliases are the `Problems` field names, so E2-S2's Q3 maps the row field for field. Module docstring cites RD 2.4 and DEC-0201, says every constant is one read and is executed with bound parameters only, and contains none of the six tokens of T002 in any case (write "read-only", never a word such as "update"). (depends on T001)
- [ ] T013 Create `src/factorflow/data_health/reader.py` with `read_problems(conn: psycopg.Connection, *, cursor: str | None, limit: int) -> ProblemPage`: one `with conn.cursor() as cur:` executing `PROBLEM_ROWS_SQL` with `{"cursor": cursor, "limit_plus_one": limit + 1}` and `fetchall()`; group the rows by symbol into an insertion-ordered `dict[str, list[Failure]]` (the SQL order is the page order), building each `Failure(data_type, cast(Literal["failed", "not_found"], outcome), reason, attempts, completed_at, run_id)`; build `ProblemRow(symbol, tuple(failures), retryable=any(f.outcome == "failed" for f in failures))`; when more than `limit` rows were grouped, keep the first `limit` and set `next_cursor` to the last kept symbol, else `None` (the lookahead of `factorflow.coverage.service.read_coverage`); return `ProblemPage(rows=tuple(...), next_cursor=...)`. No `commit`, no `rollback`, no `conn.transaction()`, no normalisation or validation of `cursor` or `limit` (the caller's precondition: RD 4 and RD 11 say `data-health-api` validates both before the call; see Other Notes). Docstring cites RD 2.4, DEC-0201, AC-13, AC-14, AC-16, DAC-E2-1 to DAC-E2-3 and DAC-E2-S1-1 to DAC-E2-S1-4, states the precondition (`cursor` a normalised valid symbol or `None`; `limit` in 1 to 500) and that the transaction belongs to the caller; it contains none of the six tokens (no `.update(` call either). (depends on T011, T012)
- [ ] T014 Create `src/factorflow/data_health/__init__.py`: a docstring citing RD 2.1 and `from factorflow.data_health.reader import read_problems` with `__all__ = ["read_problems"]`. `read_attention` and `read_data_health` are not exported here because they do not exist yet (Other Notes, Open Gap 1). (depends on T013)

**Checkpoint**: T002 to T010 pass; `uv run mypy src` is clean for `src/factorflow/data_health/`.

---

## Phase 4: Integration

**Purpose**: Prove the new package leaves the delivered guards green; nothing is wired in this story.

- [ ] T015 Run the delivered static guards that scan all of `src/factorflow`: `uv run pytest tests/unit/test_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py`. Both must pass unchanged: `queries.py` holds its statements as Python constants, so `[tool.setuptools.package-data]` needs no new glob and `pyproject.toml` is not edited. Do not register any router or import the package from `factorflow.api`: `data-health-api` (CAP-003-E2-S4) and the router registration (CAP-003-E2-S5) consume `read_problems` later. (depends on T014)

**Checkpoint**: Delivered guards green; no delivered file modified (`git diff --stat` lists only the six new files).

---

## Phase 5: Polish

**Purpose**: Final validation and the TDD evidence.

- [ ] T016 Run the full validation set (Validation Plan below) and fix any lint, format or type finding in the six new files only. Confirm the test comments name `TC-COMP-039`, `TC-COMP-040`, `TC-COMP-041` and `TC-COMP-042` (`# Implements TC-COMP-0NN`) and that `git diff --stat` lists exactly `src/factorflow/data_health/{__init__,models,queries,reader}.py`, `tests/unit/test_data_health_sql_is_read_only.py`, `tests/unit/test_data_health_models.py` and `tests/integration/test_data_health_problems.py`, plus this story's TDD evidence file. (depends on T015)
- [ ] T017 After each TDD cycle in T002–T016 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E2-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E2-S2 | reverse | Consumes this story's `models.py` (`Attention`, `Problems`, `LatestDownload`, `Progress`, `AttentionItem`) and `PROBLEM_COUNT_SQL` as its Q3; its graph line already holds the hard edge `CAP-003-E2-S2: [CAP-003-E2-S1]` |
| CAP-003-E2-S3 | reverse | Consumes `models.py` (`DataHealth`, both check dataclasses) and calls `read_problems` for the first page of 50; asserts the three-way `affected_count` equality TC-COMP-049 covers |
| CAP-003-E2-S4 | reverse | `data-health-api` calls `read_problems(conn, cursor=..., limit=...)` and maps `ProblemPage` through `ProblemPageResponse.from_reader` (component-design-data-health-api 2.3) |
| CAP-003-E2-S5 | context | Registers the `data_health` router on `create_app`; cited only so T015 registers nothing here |
| CAP-003-E2-S6 | context | Asserts `affected_count` = `problems.stock_count` = distinct row symbols through the application (TC-INT-016); cited only to place that check outside this story |
| CAP-003-E2-S7 | context | The 3000-stock volume test pages `read_problems`; cited only to place volume outside this story |

This story has no hard dependency inside CAP-003 (`CAP-003-E2-S1: []`); no edge is added. Cross-capability inputs (migrations 0001, 0003, 0004; `retire_symbol`; `read_coverage`'s lookahead as precedent) are delivered.

### Task Dependencies
- T001: none
- T002, T004, T010: depend on T001; can run in parallel (three files)
- T003: depends on T002 (same file)
- T005, T006, T007, T008, T009: depend on T004 (same file, shared seed helpers)
- T011, T012: depend on T001; can run in parallel
- T013: depends on T011, T012
- T014: depends on T013
- T015: depends on T014
- T016: depends on T015
- T017: interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: the unit read-only file (T002, T003), the unit models file (T010) and the integration file (T004 to T009) are independent
- Phase 3: T011 and T012

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
- Focused: `uv run pytest tests/unit/test_data_health_sql_is_read_only.py tests/unit/test_data_health_models.py tests/integration/test_data_health_problems.py`
- DAC-E2-S1-1: `uv run pytest tests/unit/test_data_health_sql_is_read_only.py` passes on the shipped sources; temporarily appending `-- UPDATE` to `PROBLEM_ROWS_SQL` makes it fail naming `UPDATE` (revert after)
- DAC-E2-S1-2, DAC-E2-3: T004 and T008 literal pages `AAA BBB | CCC DDD | EEE` with cursors `BBB`, `DDD`, none; the full final page has no cursor
- DAC-E2-S1-3, DAC-E2-2, AC-9, AC-14: T005 passes, including the unchanged table snapshot
- DAC-E2-S1-4: T003 and T006 pass; `grep -nE "conn\.(commit|rollback|transaction)\(" src/factorflow/data_health/reader.py` prints nothing (the T013 docstring describes the caller's transaction in prose, never as one of these call forms)
- AC-16: T009 passes (`PROBLEM_COUNT_SQL` count equals the distinct paged symbols)
- No delivered file changed: `git diff --stat` names only the new files (DEC-0211)

---

## Notes

### Resolved Conflicts

1. **Scan scope of the read-only guard.** The closest precedent, `tests/unit/test_reader_sql_read_only.py`, strips comments and scans `.sql` files; DAC-E2-S1-1 says neither *source* contains a token and names `tests/unit/test_sql_is_append_only.py` (a whole-text, case-insensitive scan) as the pattern, and TC-COMP-039's edge says a token in a comment is still rejected. The story AC governs: T002 scans the whole text of `queries.py` and `reader.py`, comments, docstrings and identifiers included, case-insensitively. Consequence for this story and for E2-S2 and E2-S3, which extend the same two files: none of the words insert, update, delete, truncate, alter or drop may appear anywhere in them, in any case, including a Python `dict.update(...)` or `set.update(...)` call (use `|=`) and prose such as "a later download updates the state".
2. **Token list.** System design constraint 1 and RD 3 name `INSERT`, `UPDATE` and `DELETE`; the story AC and RD 7 name six tokens; the CAP-002 precedent adds `CREATE` (seven). The story AC governs: six tokens, no more and no fewer.
3. **Where the three-way "one problem set" check lives.** RD 7's "One problem set" row puts `affected_count` = `problems.stock_count` = distinct row symbols in `tests/integration/test_data_health_problems.py`, this story's file, but `affected_count` arrives with `read_data_health` (CAP-003-E2-S3) and `stock_count` with `read_attention` (CAP-003-E2-S2). The story's ACs (AC-16 and DAC-E2-1 as scoped by its Description) govern over design prose: T009 asserts the half this story can, `PROBLEM_COUNT_SQL`'s count equals the distinct paged symbols; the full equality is asserted by CAP-003-E2-S3 (TC-COMP-049), CAP-003-E2-S6 (TC-INT-016) and CAP-003-E2-S7.

### Open Gaps

1. **Who exports `read_attention` and `read_data_health` from `src/factorflow/data_health/__init__.py`.** RD 2.1 says `__init__.py` exports all three functions; this story creates the file and can export only `read_problems`; the E2-S2 and E2-S3 stories list only `reader.py` and `queries.py` (and their tests) as their files, not `__init__.py`. No artifact assigns the two remaining export lines. This plan exports `read_problems` with `__all__ = ["read_problems"]` and nothing else (it cannot import names that do not exist). Hand-off: the E2-S2 and E2-S3 plans should each add their name to `__init__.py`, or E2-S4 imports from `factorflow.data_health.reader`. Flag for the next revision of component-design-data-health-reader (2.1) and the E2-S2 and E2-S3 file lists. Blocks nothing here.

### Other Notes

- **No PROVISIONAL decision.** Every value this plan uses is fixed by an artifact: the problem predicate, join and paging by RD 2.4 and the story; the bound 1 to 500 by RD 11 and `api/bounds.py`; the `PROBLEM_COUNT_SQL` columns by the `Problems` dataclass of RD 2.2 (`symbols` is `tuple[str, ...]`, so the empty case is `'{}'`, never `NULL`).
- **No reader-level guard on `cursor` or `limit`.** RD 4 says the cursor is validated as a symbol by `data-health-api` before the call, and RD 11 states the reader's request as "validated symbol cursor, `limit` 1 to 500": the validation is the caller's precondition, so `read_problems` adds none (unlike `read_coverage`, whose own contract raises `ValueError`). E2-S3 calls it with the fixed 50 and E2-S4 after the `Query` bound and `is_valid`.
- **Transaction wording.** RD 3 says the caller's `with pool.connection()` block "rolls back a read-only transaction on exit"; psycopg's pooled connection ends a clean block itself, by commit or rollback. The AC only requires that the function issue neither, so T006 asserts `INTRANS` after the call and `IDLE` at the next checkout, not which of the two the pool used.
- **Pairing invariant.** The subquery of `PROBLEM_ROWS_SQL` selects symbols without the `run_instrument_result` join while the outer query and `PROBLEM_COUNT_SQL` inner-join it. Every writer path inserts the result row and upserts `acquisition_state` with the same `run_id` in one transaction (`src/factorflow/ingestion/writer.py` and `outcomes.py`), so the two sets coincide; the seed helper `_record` keeps the same pairing. A result `unchanged` is stored in `acquisition_state` as `written`, so it also resolves a problem.
- **Snapshot consistency** between `PROBLEM_COUNT_SQL` and the pages during a running download is E2-S2's and E2-S3's concern; this story's tests read a quiescent store.
- **Extra test file.** `tests/unit/test_data_health_models.py` is not in the story's file list. It is added because the models are this story's deliverable, E2-S4's response models and the browser types mirror them field for field, and no other test of this story observes the dataclasses that `read_problems` does not return.
- **Mapped test cases.** TC-COMP-039, TC-COMP-040, TC-COMP-041 and TC-COMP-042 (data-health-reader-tests.md) map to this story's derived ACs. The coverage matrix also lists TC-COMP-049 under DAC-E2-1; it exercises `read_data_health` and belongs to E2-S3 (DAC-E2-S3-3). Its retired-stock half is covered here by T008 and T009 as additional tests.
- **Ordering and collation.** Page order is the SQL `ORDER BY i.symbol` and the keyset comparison `i2.symbol > %(cursor)s`, both under the database collation, so they agree with each other; tests use plain letters so the expected literals do not depend on collation.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `src/factorflow/data_health/queries.py: SELECT i.symbol, → SELECT i.symbol, -- UPDATE` (killed by T002)
  - `src/factorflow/data_health/queries.py: AND (%(cursor)s::text IS NULL OR i2.symbol > %(cursor)s) → AND (%(cursor)s::text IS NULL OR i2.symbol >= %(cursor)s)` (T004)
  - `src/factorflow/data_health/queries.py: LIMIT %(limit_plus_one)s → LIMIT 3` (T003)
  - `src/factorflow/data_health/queries.py: JOIN run_instrument_result r  ON r.run_id = s.last_run_id → JOIN run_instrument_result r  ON true` (PROBLEM_ROWS_SQL; T007)
  - `src/factorflow/data_health/queries.py: AND s2.last_outcome IN ('failed', 'not_found') → AND s2.last_outcome IN ('failed')` (T005, T008)
  - `src/factorflow/data_health/queries.py: WHERE i2.lifecycle = 'active' → WHERE true` (T008)
  - `src/factorflow/data_health/queries.py: count(DISTINCT i.instrument_id) → count(i.instrument_id)` (T009)
  - `src/factorflow/data_health/reader.py: retryable=any( → retryable=all(` (T005)
  - `src/factorflow/data_health/reader.py: rows = cur.fetchall() → rows = cur.fetchall(); conn.commit()` (T006)
- **Equivalent mutants** (record as such, with the reason): off-by-one on the lookahead `limit + 1` → `limit + 2` fetches one more stock but keeps the same `limit` rows and the same last-kept cursor, so no page or cursor changes; removing the outer `i.lifecycle = 'active'` from `PROBLEM_ROWS_SQL` changes nothing because the subquery already restricts the symbols to active instruments and `symbol` is unique.
