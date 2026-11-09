---
artifact_schema_version: 1
artifact_id: CAP-003-data-health-reader-tests
artifact_type: test-specification
artifact_version: 2
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-11-08
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T19:19:17Z
  source_artifacts:
    - id: CAP-003
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-backlog
      version: "4"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# data-health-reader Component Test Specification

Component tests for `data-health-reader` (CAP-003). Each case verifies one story-level or epic-level derived acceptance criterion within a unit test harness for the FactorFlow-v2 repository; IDs are assigned in AC-ID order across every component file, so this file holds 21 cases (TC-COMP-035 to TC-COMP-273, not necessarily contiguous).

### TC-COMP-035: Daily prices status: exceptions, not_determinable, ok; gap count null

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-11, AC-24, DAC-E2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- Coverage pages fixtures: one with counts above zero, one clean with gap detection unavailable, one clean with it available

#### Steps
1. Run the Daily prices derivation on each fixture
2. Read `status`, `gap_stock_count` and `gap_detection.reason`

#### Expected Result
- `exceptions` when `absent_count`, `behind_count` or a known `gap_stock_count` is above zero
- `not_determinable` when gap detection is unavailable and nothing else is wrong, with the reason carried
- `ok` only when every part ran and found nothing; `gap_stock_count` is `null`, never 0, when unavailable

#### Error / Edge Cases
- Gaps unavailable and absent above zero: `exceptions`, with the reason still carried

### TC-COMP-036: Progress done counts complete instruments; total null before claim

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-7, DAC-E2-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A PostgreSQL store (testcontainers) with a run whose `instruments_named` is 0, then 120 with results for 40 instruments on all four data types and 3 on three

#### Steps
1. Call `read_attention` before the runner claims the run
2. Call again after results are written

#### Expected Result
- `progress.total` is `None` while `instruments_named` is 0
- `done` is 40 (only instruments with all four results) and `total` 120; `done` never exceeds `total`

#### Error / Edge Cases
- No run: `latest_download` is `None`

### TC-COMP-038: read_data_health pages read_coverage unchanged to a null cursor

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-11, DAC-E2-15
**Priority:** P1
**Type:** functional

#### Preconditions
- `read_coverage` spied; a store with 1200 active instruments

#### Steps
1. Call `read_data_health(conn)`
2. Record each `read_coverage` call's arguments
3. Make `read_coverage` raise `ValueError`

#### Expected Result
- Called with `lifecycle="active"`, `limit=500` and the previous `next_cursor` until it is null (three pages)
- The `ValueError` propagates uncaught

#### Error / Edge Cases
- `next_cursor` null on page 1: one call

### TC-COMP-039: queries.py and reader.py contain no write or DDL token

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-17, DAC-E2-S1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_data_health_sql_is_read_only.py`

#### Steps
1. Run the test
2. Plant `UPDATE` in a query constant and re-run

#### Expected Result
- Passes on the shipped sources
- Fails naming the planted token (`INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `ALTER`, `DROP`)

#### Error / Edge Cases
- A token inside a comment: still rejected (source scan)

### TC-COMP-040: read_problems keyset pages of 2 over 5 problem stocks

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-13, DAC-E2-S1-2, DAC-E2-3
**Priority:** P1
**Type:** functional

#### Preconditions
- A store with five active problem stocks

#### Steps
1. Call `read_problems(conn, cursor=None, limit=2)`
2. Call with each returned `next_cursor`

#### Expected Result
- Pages hold 2, 2 and 1 stocks; cursors on the first two, none on the last
- A full final page (limit equal to the remainder) carries no cursor

#### Error / Edge Cases
- Cursor beyond the last symbol: empty page, no cursor

### TC-COMP-041: retryable rule and problem resolution only by write or retirement

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-9, AC-14, DAC-E2-S1-3, DAC-E2-2
**Priority:** P1
**Type:** functional

#### Preconditions
- A store with a stock whose failures are all `not_found` and one with a `failed` failure

#### Steps
1. Call `read_problems`
2. Record a later run writing `written` for the failed data type and re-read
3. Retire the other stock and re-read
4. Read again with no change

#### Expected Result
- `retryable` false for the all-`not_found` stock and true for the `failed` one
- The written stock's row leaves; the retired stock's row leaves
- Nothing else removes a row

#### Error / Edge Cases
- A `written` outcome for a different data type: the row stays
- E2-S1 v2 builds the version 1 shape (no `cause`, `retryable` true when any failure is `failed`); the `failed` fixture's reason begins `[unavailable] ` (or is null), a cause that stays retryable once CAP-003-E8-S6 excludes plan refusals (TC-COMP-268), so this case passes before and after that story

### TC-COMP-042: cursor and limit are bound parameters; no transaction left open

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-17, DAC-E2-S1-4
**Priority:** P2
**Type:** security

#### Preconditions
- `queries.py` and `reader.py` sources; a pooled connection

#### Steps
1. Inspect how `cursor` and `limit` reach SQL
2. Call each function and read the connection's transaction state after return

#### Expected Result
- Both are psycopg query parameters, never interpolated
- No commit or rollback is issued; the caller's `with pool.connection()` block owns the transaction

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-043: read_attention on an empty store

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-21, DAC-E2-S2-1
**Priority:** P1
**Type:** functional

#### Preconditions
- An empty store

#### Steps
1. Call `read_attention(conn)`

#### Expected Result
- `followed_count` 0; `prices_as_of`, `latest_download` and `latest_terminal_download` `None`; `problems.stock_count` 0; `items` empty

#### Error / Edge Cases
- `checked_at` is set

### TC-COMP-044: Latest versus latest terminal download and the abandoned item

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-9, AC-12, AC-21, DAC-E2-S2-2, DAC-E2-7, DAC-E2-8
**Priority:** P1
**Type:** functional

#### Preconditions
- A store with a `partial` run then a `running` one; a second fixture whose latest terminal run is `abandoned`

#### Steps
1. Call `read_attention` on each

#### Expected Result
- `latest_download` is the running run and `latest_terminal_download` the partial one
- With an `abandoned` latest terminal run, the `download_not_complete` item carries its `run_id` and `ended_at` as `recorded_at`

#### Error / Edge Cases
- Latest terminal `partial` or `cancelled`: no `download_not_complete` item (DAC-E2-8)

### TC-COMP-045: credential_missing item when the key is absent; value never read

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-4, DAC-E2-S2-3
**Priority:** P1
**Type:** security

#### Preconditions
- `credential_present()` patched to return False

#### Steps
1. Call `read_attention`
2. Inspect the module for any read of the key's value

#### Expected Result
- `credential_present` is `False`; the `credential_missing` item has `recorded_at` equal to `checked_at`
- The module never reads `FACTORFLOW_MASSIVE_API_KEY`'s value

#### Error / Edge Cases
- Key present: no item and `credential_present` `True`

### TC-COMP-046: read_attention issues a bounded number of statements at 3000 instruments

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-28, DAC-E2-S2-4
**Priority:** P2
**Type:** performance

#### Preconditions
- A store with 3000 active instruments; statement counting enabled

#### Steps
1. Call `read_attention`
2. Count the statements issued

#### Expected Result
- Five aggregate statements plus the progress aggregate; no per-instrument statement

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-047: Check counting rules: unknown presence, overlaps and union counts

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-11, DAC-E2-S3-1, DAC-E2-5
**Priority:** P1
**Type:** functional

#### Preconditions
- Coverage fixtures: a stock with presence `unknown`; a stock absent and failed for fundamentals; a stock with gaps that is also behind

#### Steps
1. Run the two check derivations

#### Expected Result
- Unknown presence counts in `absent_count`, not `behind_count`
- Absent-and-failed counts in both financials counts and once in `exception_symbols` and `exception_count`
- Gaps-and-behind counts once in Daily prices' `exception_count`

#### Error / Edge Cases
- More than five exception symbols: first five by symbol, count is the union size

### TC-COMP-048: never_acquired with and without an ended download

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-21, DAC-E2-S3-2
**Priority:** P1
**Type:** functional

#### Preconditions
- An empty store; a store where one download ended with every request failed

#### Steps
1. Call `read_data_health` on each

#### Expected Result
- Empty store: `never_acquired` `True`, both checks `None`, `affected_count` 0
- Failed-everything store: `never_acquired` `True` with `affected_count` and the problem rows populated

#### Error / Edge Cases
- No check ever reports `ok` on either store

### TC-COMP-049: Retired stocks excluded; six coverage pages and bounded memory at 3000

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-13, AC-16, AC-28, DAC-E2-S3-3, DAC-E2-1
**Priority:** P2
**Type:** performance

#### Preconditions
- A store with 3000 active stocks and one retired stock with a failure

#### Steps
1. Call `read_data_health`
2. Count `read_coverage` calls and inspect kept symbols

#### Expected Result
- The retired stock is in no count and no row
- Six pages requested; at most five symbols kept per check

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-267: cause_of reads the six kinds anchored at the start of the reason

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-29, AC-30, DAC-E8-S6-1, DAC-E8-11
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_data_health_cause.py` (new)

#### Steps
1. Call `cause_of` with a reason beginning `[<kind>] symbol=…` for each of the six kinds
2. Call it with `None`, a reason without a prefix, `[foo] …`, `[not_entitled]` without its following space, and `x [not_entitled] …`

#### Expected Result
- Step 1 returns each kind
- Step 2 returns `None` each time

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-268: retryable excludes plan refusals and not-found, and counts every other failed cause

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-14, AC-29, AC-30, DAC-E8-S6-2, DAC-E8-11
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/unit/test_data_health_cause.py`; failure lists built in memory

#### Steps
1. Evaluate `_retryable` for failures all `failed` with cause `not_entitled`, all `not_found`, and a mix of the two
2. Evaluate it for one `failed` `unavailable`, one `failed` `rate_limited`, and one `failed` with cause `None` beside a `not_entitled`

#### Expected Result
- Step 1: false each time
- Step 2: true each time

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-269: A plan refusal stays in every count and row; only its fix changes

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-16, AC-29, DAC-E8-S6-3, DAC-E8-12, DAC-E8-11
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/integration/test_data_health_problems.py` (CAP-003-E2-S1's file), PostgreSQL; an active stock whose only latest outcome is `fundamentals` `failed` with reason `[not_entitled] symbol=KO data_type=fundamentals request_id=r1: the provider plan is not entitled to this data`

#### Steps
1. Call `read_data_health`, `read_attention` and `read_problems`

#### Expected Result
- The stock counts in `read_data_health`'s `affected_count` and the Company financials check's `problem_count`, and appears in the problem rows
- It counts in `read_attention`'s `problems.stock_count`
- Its failure carries `cause` `not_entitled`; its row `retryable` is false

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-270: A rate limit, an older unavailable and a null reason keep their rows retryable

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-30, DAC-E8-S6-4, DAC-E8-11, DAC-E8-19
**Priority:** P1
**Type:** functional

#### Preconditions
- PostgreSQL; three active stocks, each with one `failed` failure: reason beginning `[rate_limited] `, reason beginning `[unavailable] ` (as recorded before the upgrade), and a null reason

#### Steps
1. Call `read_problems`

#### Expected Result
- The rate-limited failure has `cause` `rate_limited`, its row `retryable` true
- The `[unavailable]` failure has `cause` `unavailable` and the null-reason failure `cause` `None`; both rows `retryable` true

#### Error / Edge Cases
- A result recorded before the upgrade reads as an ordinary failure (DAC-E8-19)

### TC-COMP-271: The cause change leaves the SQL read-only and the paging tests passing

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-16, AC-17, DAC-E8-S6-5, DAC-E8-12
**Priority:** P1
**Type:** functional

#### Preconditions
- CAP-003-E2-S1's `test_data_health_sql_is_read_only.py`, keyset-paging and `retryable` tests after this story

#### Steps
1. Run them
2. Compare `queries.py` with its state before the story

#### Expected Result
- Each passes; `queries.py` is unchanged and contains only `SELECT`; the reader writes nothing

#### Error / Edge Cases
- E2-S1's `retryable` test keeps passing because its `failed` fixture carries a cause that stays retryable (TC-COMP-041)

### TC-COMP-272: No provider text can choose a cause; reason and attempts pass through unchanged

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-29, DAC-E8-S6-6, DAC-E8-11
**Priority:** P2
**Type:** security

#### Preconditions
- `reader.py` and `models.py` after the story

#### Steps
1. Read how `cause` is chosen
2. Compare each served `reason` with the stored one
3. Search for any read or reinterpretation of the stored `attempts`

#### Expected Result
- `cause` is chosen only by the closed six-kind table at position 0
- The reason is returned unchanged
- Nothing reads or reinterprets `attempts`

#### Error / Edge Cases
- A reason whose provider text contains `[not_entitled] ` after position 0 gives `cause` `None`

### TC-COMP-273: Every construction of the failure dataclass carries cause; earlier assertions unchanged

**Scope:** component
**Component(s):** data-health-reader
**Traces to:** AC-29, DAC-E8-S6-7, DAC-E8-11
**Priority:** P2
**Type:** functional

#### Preconditions
- Every test constructing the reader's failure dataclass when the story lands, including CAP-003-E2-S4's `tests/unit/test_api_data_health_models.py` and `tests/unit/test_api_data_health_routes.py` and CAP-003-E2-S5's `stub_reader_functions` in `tests/unit/test_api_no_secrets.py` where those stories have landed

#### Steps
1. Run `uv run pytest`

#### Expected Result
- Each construction carries `cause`; every pre-existing assertion passes unchanged

#### Error / Edge Cases
- None beyond the scenario
