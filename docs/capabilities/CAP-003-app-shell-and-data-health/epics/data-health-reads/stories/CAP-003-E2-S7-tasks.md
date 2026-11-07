---
artifact_schema_version: 1
artifact_id: CAP-003-E2-S7-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T06:16:05Z
  source_artifacts:
    - id: CAP-003-E2-S7
      version: "1"
    - id: CAP-003-E2
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-integration-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E2-S7 — Volume Test: 3000 Followed Stocks and the 2-Second p95 on GET /api/data-health

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health-reads/stories/CAP-003-E2-S7.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Writes one new test module, `tests/integration/test_data_health_volume.py`,
and nothing else. It proves AC-28 and DAC-E2-14 against the code that
CAP-003-E2-S1 to CAP-003-E2-S5 deliver. Design references: data-health-reader
("RD" below) §5 and §7, the *Volume* row; data-health-api ("AD") §5; system
design constraint 7; capability assumption 4.

The test seeds one store with 3000 active instruments, a year of weekday bars
each, and failures on 300 of them. It then checks four things:

1. **Counts** (TC-INT-026, DAC-E2-S7-1). `GET /api/attention` and
   `GET /api/data-health` agree on the counts, and the data-health read pages
   `read_coverage` exactly six times.
2. **Keyset pages.** The *Needs fixing* rows page by keyset to the full set of
   300.
3. **Bounded memory.** One `read_data_health` call stays within a fixed
   multiple of one coverage page's memory.
4. **Latency** (TC-INT-047, DAC-E2-S7-2). After one warm-up request, 20 timed
   `GET /api/data-health` requests through the in-process `create_app` have a
   95th percentile of at most 2 seconds. The p95 is computed over the 20 timed
   requests only, and a failure names the measured p95.

No production file changes.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-28 | With 3,000 followed stocks, `GET /api/data-health` answers within 2 s at the 95th percentile, measured by the volume test | T002, T003, T007, T008 |
| DAC-E2-14 | Seed 3000 active instruments with failures on 300; assert the counts, the keyset pages and bounded memory; time `GET /api/data-health` through the in-process application to p95 ≤ 2 s after one warm-up | T002, T003, T004, T005, T006, T007, T008 |
| DAC-E2-S7-1 | Attention `problems.stock_count` 300 and `followed_count` 3000; data-health `affected_count` 300 with six `read_coverage` pages consumed | T003, T004, T005 |
| DAC-E2-S7-2 | p95 over the 20 timed requests only, warm-up excluded; a failure names the measured p95 | T002, T007, T008 |
| AC-16 (traced by DAC-E2-S7-1) | The attention count and the data-health count are the same set at volume | T004, T005 |
| AC-11 (traced by TC-INT-026) | The data-health verdict counts and both checks are correct at volume | T004 |

## Phase 1: Setup

**Purpose**: Confirm that the upstream code this test exercises has landed, without changing anything.

- [ ] T001 Confirm each item below without editing anything. If one does not hold, STOP and report it.
  - **(a) Routes.** `src/factorflow/api/app.py` includes `data_health.router` after `classifications.router` and before `_add_static_mount(app)` (CAP-003-E2-S5). `src/factorflow/api/routes/data_health.py` serves `GET /api/attention`, `GET /api/data-health` and `GET /api/data-health/problems` (CAP-003-E2-S4).
  - **(b) Response models.** `src/factorflow/api/data_health_models.py` defines `DataHealthResponse`. It nests `daily_prices` and `company_financials` under an always-present `checks` object, and carries `problems` as `{rows, next_cursor}` (CAP-003-E2-S4 plan T009).
  - **(c) Reader package.** `factorflow.data_health` exports `read_data_health` (CAP-003-E2-S3 plan T013).
  - **(d) The spy seam.** `factorflow.data_health.reader` holds the module attribute `read_coverage`, because it imports the name with `from factorflow.coverage.service import ... read_coverage`. `read_data_health` calls it as `read_coverage(conn, lifecycle="active", cursor=..., limit=MAX_LIMIT)` (CAP-003-E2-S3 plan T012).
  - **(e) The other readers.** `read_attention` (CAP-003-E2-S2) and `read_problems` with keyset paging (CAP-003-E2-S1) exist.
  - **(f) Test infrastructure.** `tests/conftest.py` provides `postgres_connection_string`. `src/factorflow/db/migrations/` holds `0001` to `0006`. `pyproject.toml` registers the `postgres` and `slow` markers.
  - **(g) The new file.** `tests/integration/test_data_health_volume.py` does not exist yet.
  - Touch no file but the new test module and this story's TDD evidence file. (traces to DAC-E2-14)

**Checkpoint**: Prerequisites confirmed; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the volume test and the measurement helpers it depends on, each helper behind its own failing test first.

**Shared module content.** All of it goes in `tests/integration/test_data_health_volume.py`, Ruff line length 100, mypy-clean like the rest of `tests/`.

**Module docstring.** Cite:

- CAP-003-E2-S7, AC-28, DAC-E2-14, DAC-E2-S7-1 and DAC-E2-S7-2;
- RD §5 and §7 (the *Volume* row) and AD §5;
- `DEC-0316` and `DEC-0317`.

It says that the elapsed times are printed as a diagnostic, following the precedent of `tests/integration/test_classification_latency.py`.

**Constants:**

- `STOCKS = 3_000`.
- `FAILED = [f"S{n:04d}" for n in range(10, STOCKS + 1, 10)]`: 300 symbols, every tenth, spread across all six coverage pages.
- `WARM_UP_REQUESTS = 1`, `TIMED_REQUESTS = 20` and `P95_LIMIT_SECONDS = 2.0` (DAC-E2-14, AC-28).
- `MEMORY_RATIO_LIMIT = 3` (`DEC-0316`).
- Times `T0 = datetime(2026, 10, 20, 20, 0, tzinfo=UTC)`, `T1 = T0 + timedelta(hours=1)`, `T2 = T0 + timedelta(hours=2)` and `T3 = T0 + timedelta(hours=3)`.
- `LAST_SESSION = date(2024, 12, 31)`.

**Markers.** Mark each test separately; the module has no `pytestmark`:

- the store-backed test gets `@pytest.mark.postgres` and `@pytest.mark.slow`, following `tests/integration/test_coverage_volume.py`;
- the helper tests get no marker, so `uv run pytest -m 'not postgres'` still runs them.

### Additional Unit Tests (measurement helpers, first TDD cycle)

- [ ] T002 Add the four measurement helpers to `tests/integration/test_data_health_volume.py`, with unmarked tests written first. Each test fails with `NameError` until its helper exists, which is the RED step.
  - **(a) `_p95`.** `_p95(samples: Sequence[float]) -> float` takes the nearest rank: `ranked = sorted(samples)`; `return ranked[math.ceil(0.95 * len(ranked)) - 1]`. For 20 samples that is the 19th smallest (`DEC-0317`). Test `test_p95_is_the_nearest_rank_over_the_samples`:
    - `_p95([float(n) for n in range(20, 0, -1)]) == 19.0`: the input is unsorted on purpose;
    - `_p95([0.1] * 19 + [5.0]) == 0.1`: one slow request of 20 is tolerated.

    Kills: off-by-one on `- 1` removed (returns `20.0`); a hand-written removal of `sorted` (returns `2.0`).
  - **(b) `_timed_samples`.** `_timed_samples(send: Callable[[], object], *, clock: Callable[[], float] = time.perf_counter, warm_ups: int = WARM_UP_REQUESTS, timed: int = TIMED_REQUESTS) -> list[float]` calls `send()` `warm_ups` times untimed. Then, `timed` times, it records `clock()` before and after `send()` and appends the difference. Test `test_timed_samples_exclude_the_warm_up`:
    - a fake clock reads a `now` list cell;
    - a fake `send` adds `100.0` to `now` on its first call and `0.5` on every later call, and counts its calls;
    - assert `_timed_samples(send, clock=clock) == [0.5] * 20` and that `send` was called exactly 21 times.

    Kills: off-by-one on the warm-up count (22 calls); a hand-written timing of the warm-up (a `100.0` sample and 21 entries); off-by-one on `timed` (21 samples) — the DAC-E2-S7-2 "warm-up excluded" clause.
  - **(c) `_assert_p95_within`.** `_assert_p95_within(samples: Sequence[float], limit: float = P95_LIMIT_SECONDS) -> None` computes `p95 = _p95(samples)` and asserts `p95 <= limit`. The failure message is `f"p95 of GET /api/data-health over {len(samples)} timed requests is {p95:.3f} s, above the {limit} s limit (AC-28); samples: {sorted(round(s, 3) for s in samples)}"`. Test `test_p95_failure_names_the_measured_p95`:
    - `with pytest.raises(AssertionError, match=r"is 2\.500 s"): _assert_p95_within([2.5] * 20)`;
    - `_assert_p95_within([2.0] * 20)` does not raise: AC-28 says "within", so the boundary passes;
    - `_assert_p95_within([1.0] * 19 + [9.0])` does not raise.

    Kills: off-by-one `<=` → `<` (the `2.0` boundary fails); a hand-written message without the p95 (the `match` fails), DAC-E2-S7-2.
  - **(d) `_peak_bytes`.** `_peak_bytes(fn: Callable[[], object]) -> int` follows these steps:
    1. starts `tracemalloc` if it is not tracing;
    2. calls `tracemalloc.reset_peak()` and reads `base = tracemalloc.get_traced_memory()[0]`;
    3. calls `fn()`, keeping its result alive until the peak is read;
    4. returns `tracemalloc.get_traced_memory()[1] - base`;
    5. stops `tracemalloc` in a `finally` if it started it.

    Test `test_peak_bytes_sees_a_freed_allocation`: `_peak_bytes(lambda: len(bytearray(8_000_000))) >= 8_000_000`. The bytearray is freed before `fn` returns, so only the peak sees it. Kills: a hand-written return of the current size instead of the peak (reads near `0`).

  (traces to DAC-E2-S7-2, DAC-E2-14, AC-28)

### Mandatory Component Tests

- [ ] T003 Add the seed and the application fixture to `tests/integration/test_data_health_volume.py` (DAC-E2-14, DAC-E2-S7-1, AC-28). Every statement uses bound parameters only.
  - **`_migrate(connection_string) -> psycopg.Connection`**: opens a connection and executes every `sorted(MIGRATIONS_DIR.glob("*.sql"))` file, `0001` to `0006`, then commits.
    - Precedent: the `coverage_env` fixture of `tests/integration/test_api_coverage.py`.
    - The application's lifespan starts the classification scheduler, which reads the `0005`/`0006` tables (`reclaim_interrupted_sets`), so every migration must be applied.
  - **`_seed(conn) -> UUID`** issues one set-based statement per table and returns the run id:
    1. **Instruments.** `STOCKS` active rows, symbols `'S' || lpad(n::text, 4, '0')` from `generate_series(1, %s)`, `retired_at` null.
    2. **Bars.** One `daily_bar` per instrument for every weekday from `2024-01-01` to `2024-12-31`. Copy the statement of `test_coverage_volume.py`'s `_seed`: the same `value_hash` expression and prices of `1`.
    3. **Coverage segments.**
       - One `prices` segment `2024-01-01..2024-12-31` per instrument.
       - One `fundamentals` segment `2023-10-01..2024-09-30` for each instrument whose symbol `<> ALL(%(failed)s)`, the 2700 that are not failing.
    4. **The run.** One `acquisition_run` row:
       - `state` `'failed'`, `history_depth_years` `1`;
       - `requested_at` and `started_at` `T0`, `ended_at` `T3`;
       - `instruments_named` `3000`, `failure_reason` `'provider unavailable'`;
       - `RETURNING run_id`.

       The run is `failed`, not `partial` or `succeeded`, so the classification scheduler never claims it during the timed loop (Other Notes, "Why the run is `failed`").
    5. **Run results.** `run_instrument_result` rows for the run:
       - `prices` `written` at `T1` for all 3000;
       - `fundamentals` `written` at `T1` for the 2700;
       - `fundamentals` `failed`, reason `'provider timeout'`, `attempts` `3`, at `T2`, for the 300 in `FAILED`.
    6. **Acquisition state.** The paired `acquisition_state` rows, with the same `run_id`, `last_outcome` and `last_acquired_at = completed_at`. This is the pairing the delivered writer keeps.
    7. **Finish.** `ANALYZE instrument, daily_bar, coverage_segment, acquisition_state, acquisition_run, run_instrument_result`, then `conn.commit()`.
       - The planner statistics are those of a settled store, as autovacuum would leave them. Precedent: `populate_volume` in `tests/integration/engine_proof_support.py` runs `ANALYZE`.
       - The times are the fixed literals above, never `now()`.
  - **`_coverage_spy(monkeypatch) -> list[dict[str, object]]`**:
    - Replaces `factorflow.data_health.reader.read_coverage` with a wrapper that appends the call's `kwargs`.
    - The wrapper raises `AssertionError("read_coverage called more than 10 times")` on an eleventh call, so a cursor that never advances fails instead of hanging.
    - Otherwise it returns the delivered `factorflow.coverage.service.read_coverage(*args, **kwargs)`.
    - Precedent: the CAP-003-E2-S3 plan's `_coverage_spy`.
  - **The single store-backed test** `test_data_health_at_3000_followed_stocks(postgres_connection_string, monkeypatch, capsys)` carries the comments `# Implements TC-INT-026` and `# Implements TC-INT-047`. It runs these steps:
    1. `conn = _migrate(...)`; `run_id = _seed(conn)`.
    2. `monkeypatch.setenv("FACTORFLOW_DATABASE_URL", postgres_connection_string)`.
    3. `with TestClient(create_app(), base_url="http://127.0.0.1:8000") as client:`, which enters the lifespan and so uses the delivered pool, middleware and envelope: the in-process application. Precedents: `tests/integration/test_api_coverage.py` and `classification_cycle_support.running_product`. Inside it run T004, T005 and T008, in that order.
    4. After the `with` block exits, so the lifespan's background loops have stopped and allocate nothing, run T006 on `conn`.
    5. `conn.close()` in a `finally`.

  (traces to DAC-E2-14; the seed's counts are what T004 to T006 assert) — kills: no mutant on its own. This task is the fixture that T004 to T008 observe through.
- [ ] T004 Implement TC-INT-026, the counts half (at 3000 instruments the counts agree across both reads), in `test_data_health_at_3000_followed_stocks` (`# Implements TC-INT-026`). All `_at` values are compared after `datetime.fromisoformat(...)` against the literals, so the test does not depend on how the timestamp is formatted.
  - **(a) `GET /api/attention`** answers `200`, and:
    - `body["followed_count"] == 3000`;
    - `body["problems"]["stock_count"] == 300`;
    - `body["problems"]["symbols"] == ["S0010", "S0020", "S0030"]`;
    - `body["problems"]["newest_completed_at"]` parses to `T2`;
    - `body["prices_as_of"] == "2024-12-31"`.
  - **(b) `GET /api/data-health`** answers `200`, with the spy installed inside `with monkeypatch.context() as m:` so the spy is gone before the timed loop. Assert:
    - `never_acquired is False`, `followed_count == 3000` and `affected_count == 300`;
    - `checks["daily_prices"]` equals the literal `{"status": "ok", "absent_count": 0, "gap_stock_count": 0, "behind_count": 0, "latest_session": "2024-12-31", "gap_detection": {"available": True, "reason": None}, "exception_count": 0, "exception_symbols": []}`;
    - `checks["company_financials"]`, with `as_of` popped first and parsed separately to `T1`, equals `{"status": "exceptions", "absent_count": 300, "problem_count": 300, "exception_count": 300, "exception_symbols": ["S0010", "S0020", "S0030", "S0040", "S0050"]}`;
    - `len(exception_symbols) <= 5` for both checks, while the counts are in the hundreds (the bound the epic NFR *Volume* sets on what is kept);
    - six pages (DAC-E2-S7-1): `[c["cursor"] for c in calls] == [None, "S0500", "S1000", "S1500", "S2000", "S2500"]`, with every `c["lifecycle"] == "active"` and `c["limit"] == 500`.
  - **(c) Same set.** The attention `problems.stock_count` equals the data-health `affected_count` (AC-16).

  (Implements TC-INT-026; DAC-E2-S7-1, DAC-E2-14; AC-11, AC-16) — kills:
  - hand-written `limit=MAX_LIMIT` → `limit=50` in `reader.py` (60 calls, so the spy cap fails it);
  - hand-written `affected_count` from `len(problems.rows)` (reads 50);
  - hand-written financials `exception_count` as `absent_count + problem_count` instead of the union (reads 600);
  - hand-written union kept per page instead of across pages (`exception_symbols` reads the last page's five, from `S2510`);
  - off-by-one on the union guard `< 5` → `<= 5` (six symbols).
- [ ] T005 Implement TC-INT-026, the keyset-pages half (DAC-E2-14, "the keyset pages"), in the same test (`# Implements TC-INT-026`).
  - **Page walk.** Start from the data-health body's `problems`: 50 rows, `rows[0]["symbol"] == "S0010"`, `rows[-1]["symbol"] == "S0500"`, `next_cursor == "S0500"`. Follow `GET /api/data-health/problems?cursor=<next_cursor>`, with the default limit of 50, until `next_cursor` is `None`.
  - **Assert:**
    - the walk takes exactly 6 pages, including the first;
    - the concatenated symbols equal `FAILED`, in order, with no repeat;
    - every row's `failures` holds exactly one entry with `data_type == "fundamentals"`, `outcome == "failed"`, `reason == "provider timeout"`, `attempts == 3`, `run_id == str(run_id)`, and `completed_at` parsing to `T2`;
    - every row has `retryable is True`;
    - `GET /api/data-health/problems` with no cursor returns the same 50 rows and cursor as the data-health body's `problems` (one problem set, AC-16).

  (Implements TC-INT-026; DAC-E2-14; AC-16) — kills:
  - off-by-one on `_FIRST_PAGE_LIMIT = 50` → `51` in `reader.py` (51 rows, cursor `S0510`);
  - off-by-one on the keyset predicate `i.symbol > %(cursor)s` → `>=` in `PROBLEM_ROWS_SQL` (the walk repeats `S0500`);
  - hand-written `next_cursor` emitted on a full final page (a seventh, empty page).
- [ ] T006 Implement bounded memory (DAC-E2-14; TC-INT-047 edge, "memory stays bounded"; `DEC-0316`) in the same test. It runs after the `TestClient` block, on `conn`.
  - **Warm-up.** Call `read_data_health(conn)` and `read_coverage(conn, lifecycle="active", limit=MAX_LIMIT)` once each, untraced, so first-call caches are not measured.
  - **Measure.** `one_page = _peak_bytes(lambda: read_coverage(conn, lifecycle="active", limit=MAX_LIMIT))` and `whole = _peak_bytes(lambda: read_data_health(conn))` (T002).
  - **Assert.** `whole <= MEMORY_RATIO_LIMIT * one_page`, with the message `f"read_data_health peaked at {whole} bytes, more than {MEMORY_RATIO_LIMIT} x one coverage page ({one_page} bytes)"`.
  - **End.** `conn.rollback()`, because the reads leave the transaction open (RD §3).
  - **Why the ratio separates the cases.** A fold over six pages holds at most the previous page and the one being read, about twice one page. A read that keeps every page holds six.

  (Implements DAC-E2-14 "bounded memory"; AC-28 via the epic NFR *Volume*) — kills: a hand-written change in `reader.py` that collects every `CoverageView` in a list inside the loop and folds after it. The peak is then about six pages and exceeds three.
- [ ] T007 Implement TC-INT-047 (p95 of `GET /api/data-health` at 3000 stocks is at most 2 s) in the same test (`# Implements TC-INT-047`), after T005 and inside the `TestClient` block. The spy is already removed (T004), so nothing but the application is timed.
  - **Request.** `def _get_health() -> None:` sends `response = client.get("/api/data-health")`, then `assert response.status_code == 200, response.text`.
  - **Time.** `samples = _timed_samples(_get_health)`: one warm-up, then 20 timed requests, with `time.perf_counter` as the clock (T002).
  - **Report.** `print(f"\n[TC-INT-047 diagnostic] p95 {_p95(samples):.3f}s; samples {sorted(round(s, 3) for s in samples)}")`, shown with `pytest -s`, as in `test_classification_latency.py`.
  - **Assert.** `_assert_p95_within(samples)` (T002).
  - **On failure.** If this assertion fails on the landed code, STOP and report the measured p95. Do not raise the limit, retry, drop samples, or change `coverage-service` (DAC-E2-15) or another story's code from this story (Open Gaps 3).

  (Implements TC-INT-047; AC-28, DAC-E2-14, DAC-E2-S7-2) — kills: hand-written `time.sleep(2.1)` at the top of `get_data_health` in `src/factorflow/api/routes/data_health.py`. Every sample exceeds 2 s, so the assertion fails and its message names the measured p95.

**Checkpoint**: The four helper tests pass. They were RED (`NameError`) before their helpers were added. The store-backed test is written.

---

## Phase 3: Core Implementation

**Purpose**: None. This story is a test-only chore. The behaviour under test is CAP-003-E2-S1 to CAP-003-E2-S5's, and no production file is created or changed (story *Data Changes*: "None; test seeding only").

**Checkpoint**: `git diff --stat` names no file under `src/`.

---

## Phase 4: Integration

**Purpose**: Run the volume test against the landed application, and prove that it observes what it claims.

- [ ] T008 Run `uv run pytest tests/integration/test_data_health_volume.py -s` with a container runtime available. All five tests must pass, and the `[TC-INT-047 diagnostic]` line must be recorded in the TDD evidence (`red_green_evidence`).
  - **RED evidence for the store-backed test.** The code under test has already landed, so the store-backed test is green the first time it runs. Its RED step is shown instead by applying, one at a time, the hand-written mutants listed under Other Notes to the landed `src/factorflow/data_health/reader.py`, `src/factorflow/data_health/queries.py` and `src/factorflow/api/routes/data_health.py`.
  - For each mutant, record the failing assertion, and then restore the file with `git diff --quiet HEAD -- src/` (it must exit `0` before staging).
  - These mutants are a test-strength demonstration. They are never staged, and this story's change set stays the one test module.
  - Without a container runtime, run `uv run pytest -m 'not postgres' tests/integration/test_data_health_volume.py`. Report the store-backed test as excluded, never as passing, and STOP before hand-off: AC-28 is unproven until it runs.

  (traces to AC-28, DAC-E2-14, DAC-E2-S7-1, DAC-E2-S7-2; depends on T002 to T007)

**Checkpoint**: All five tests are green on the landed code. Every listed mutant was observed red and reverted. `git diff --quiet HEAD -- src/` exits `0`.

---

## Phase 5: Polish

**Purpose**: Final validation and the TDD evidence.

- [ ] T009 Run the full validation set (Validation Plan below) and fix any lint, format or type finding in the new module only. Then check:
  - the module carries `# Implements TC-INT-026` and `# Implements TC-INT-047`;
  - `git diff --stat HEAD` plus `git status --short` list exactly `tests/integration/test_data_health_volume.py` and this story's TDD evidence file.

  (traces to DAC-E2-14; depends on T008)
- [ ] T010 Record each TDD cycle in T002 to T009 in `CAP-003-E2-S7-tdd-evidence.yaml` beside this story, after the cycle and before the next one begins, never once at the end.
  - **Reviews.** Stage only that cycle's diff, then dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - **Fields.** Each cycle entry records:
    - `code_review_verdict` and `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence. RED is the `NameError` failures of T002 for the helper cycles, and T008's observed mutant failures for the store-backed cycle;
    - the structured `mutation:` block that `scripts/mutation-run.py summary` prints. Every cycle of this story changes no production file, so each records `mutation: {not_applicable: "test-only cycle; no production file changed"}` and lists the hand-written mutants T008 applied in its RED evidence;
    - `diff_sha256`: the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.
  - **Gate.** `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit.
  - **Commits.** This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made.

  (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every TDD cycle is named by an evidence entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E2-S5 | hard | Existing graph edge. The three routes are served through `create_app` only once S5's `include_router(data_health.router)` line exists (T001 a, T003) |
| CAP-003-E2-S3 | hard | Existing graph edge. T006 imports `read_data_health` from `factorflow.data_health`. T004's spy patches `factorflow.data_health.reader.read_coverage`, the name S3 imports there |
| CAP-003-E2-S1 | hard | New graph edge. The test imports from the `factorflow.data_health` package, which S1 creates. T005 walks `read_problems`' keyset pages (`PROBLEM_ROWS_SQL`) through `/api/data-health/problems`, and T004 reads `PROBLEM_COUNT_SQL`'s count through both routes. It is already reachable transitively through S5 → S4 → S1. It is added because this test consumes S1's contract directly, as the CAP-003-E2-S5 plan added its own transitive S1 edge |
| CAP-003-E2-S2 | hard | New graph edge. DAC-E2-S7-1 asserts `read_attention`'s `followed_count` and `problems.stock_count` through `GET /api/attention` (T004 a). It is already reachable transitively through S5 → S4 → S2, and is added for the same reason |
| CAP-003-E2-S4 | hard | New graph edge. T004 and T005 assert the JSON shape of S4's `data_health_models.py`: `checks` nesting, `problems.rows`, `next_cursor` and the problems route's default limit of 50. It is already reachable transitively through S5 → S4, and is added for the same reason |
| CAP-003-E2-S6 | context | Cited only in Other Notes ("Why the run is `failed`"). S6 also seeds acquisition runs behind `create_app`'s lifespan, so it faces the same classification-scheduler hazard. Neither story imports, extends or consumes the other's test module |

Three hard edges are added to `CAP-003-E2-S7`'s line in `dependencies.yaml`: CAP-003-E2-S1, CAP-003-E2-S2 and CAP-003-E2-S4. The graph's order is unchanged, because each was already an ancestor through CAP-003-E2-S5. Delivered cross-capability inputs need no story edge: `coverage-service`'s `read_coverage` and `MAX_LIMIT` (CAP-001), migrations `0001` to `0006`, the `create_app` lifespan, and `tests/conftest.py`'s `postgres_connection_string`.

### Task Dependencies
- T001: none
- T002: depends on T001 (helpers and their unit tests; first TDD cycle)
- T003: depends on T001
- T004: depends on T003
- T005: depends on T004 (same test function; reads the data-health body T004 fetched)
- T006: depends on T003 (runs after the `TestClient` block of the same test)
- T007: depends on T002 and T005 (uses `_timed_samples` and `_assert_p95_within`)
- T008: depends on T002 to T007
- T009: depends on T008
- T010: interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- T002 (unmarked helper tests and helpers) can be written alongside T003 (seed and fixture); both are in one file, so they are staged as separate cycles.
- Nothing else: one test module, one store-backed test function.

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
- Focused: `uv run pytest tests/integration/test_data_health_volume.py -s`. Five tests pass, and the diagnostic prints the measured p95.
- AC-28, DAC-E2-14, timing: T007 passes. The diagnostic's p95 is at most `2.000` s.
- DAC-E2-S7-2: T002 (b) and (c) pass. The p95 is taken over exactly 20 samples, and a failure message names it.
- DAC-E2-S7-1, AC-16: T004 passes, with six spied pages and `affected_count == problems.stock_count == 300`.
- DAC-E2-14, keyset pages: T005 passes. Six pages concatenate to `FAILED`.
- DAC-E2-14, bounded memory: T006 passes within `MEMORY_RATIO_LIMIT` (`DEC-0316`).
- No production change: `git diff --quiet HEAD -- src/` exits `0` after T008's mutants are reverted.
- Markers: `uv run pytest -m 'not postgres' tests/integration/test_data_health_volume.py` runs the four helper tests and deselects the store-backed one.

---

## Notes

### Resolved Conflicts

1. **"Memory stays bounded during the loop" against an undistorted timing.**
   - TC-INT-047's edge case puts the memory check *during* the timed loop.
   - AC-28 requires the p95 of `GET /api/data-health` itself. Tracing allocations with `tracemalloc` slows every allocation in the process, so a memory check inside the loop would change the latency being measured.
   - DAC-E2-14 requires both "bounded memory" and the timing, but not that they share a loop.
   - Governing: AC-28 and DAC-E2-14 (capability and epic criteria) over TC-INT-047 (test specification). The plan measures memory on separate, untimed calls on the same store (T006), and times the 20 requests with nothing else instrumented (T007).
   - Flag for the next revision of the integration test specification.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06): `DEC-0316`, the bounded-memory criterion.**
   - **What is open.** DAC-E2-14 requires the volume test to "assert … bounded memory". The epic NFR *Volume* and RD §5 say that `read_data_health` folds each page into running counts, so "memory does not grow with the roster". No artifact fixes how bounded memory is measured or what number bounds it.
   - **What the plan adopts.** The peak traced Python memory (`tracemalloc`) of one `read_data_health` call on the 3000-stock store must be at most 3 times the peak of one `read_coverage(conn, lifecycle="active", limit=500)` call on the same store (T006, `MEMORY_RATIO_LIMIT = 3`).
   - **Derivation.** The fold reads six pages of 500, and while page *k* is read, page *k−1*'s view is still bound, so a correct fold peaks near two pages. A read that keeps every page peaks near six. A ratio of 3 separates the two with margin, and it is relative to the same store, machine and interpreter, so it needs no absolute byte figure.
   - **Rejected alternatives:**
     - an absolute byte threshold: it depends on the machine and the Python version, and no artifact supplies a figure;
     - structural checks only (`exception_symbols` at most five): these cannot tell a fold from a read that keeps the pages, and CAP-003-E2-S3's plan already covers them (its T009);
     - `resource.getrusage(...).ru_maxrss`: it is a process-wide high-water mark that the seed's own allocations already set, and it cannot be reset;
     - a 2× ratio: a correct fold can reach it.
   - **Owning design.** component-design-data-health-reader §5 and §7 (*Volume* row) should absorb the criterion at their next revision. Scope: contained, used only by this test.
2. **PROVISIONAL — awaiting owner confirmation (2026-11-06): `DEC-0317`, the p95 estimator over 20 samples.**
   - **What is open.** AC-28, DAC-E2-14 and TC-INT-047 fix the 95th percentile, the 20 timed requests and the warm-up. No artifact, and no code in the repository, fixes how a 95th percentile is computed from 20 samples.
   - **What the plan adopts.** The nearest rank, `sorted(samples)[ceil(0.95 × 20) − 1]`, which is the 19th smallest (T002 a).
   - **Derivation.**
     - The nearest rank is a value that was actually observed.
     - It tolerates exactly one slow request in 20, which is what a 95th percentile of 20 samples means (5% of 20 = 1).
     - It is stricter than interpolating between the 19th and 20th values with Python's `statistics.quantiles(method="inclusive")`, so the 2 s bound is never met by interpolation alone.
   - **Rejected alternatives:**
     - `statistics.quantiles(n=20, method="exclusive")`: it interpolates 95% of the way from the 19th to the 20th value, which makes it nearly the maximum, so a single scheduler hiccup decides AC-28;
     - the maximum: that is a p100, not a p95.
   - **Owning design.** component-design-data-health-reader §7 (*Volume* row) and the epic NFR *Latency* should absorb the estimator at their next revision. Scope: contained, used only by this test.
3. **Six gap detections per request against AC-28** (register G6).
   - `GET /api/data-health` pages `read_coverage` six times at 3000 stocks, and every page runs `gaps.detect_gaps` over the whole store (`coverage/service.py`). `coverage-service` must stay unchanged (DAC-E2-15).
   - This story measures the cost and changes nothing. If T007 fails on the landed code, the coder STOPS and reports the measured p95. The fix is an owner decision about RD §5 or §2.5, or about `coverage-service`, never a looser test.
   - Owning design: component-design-data-health-reader §5.
4. **History depth of the volume store.**
   - AC-28 fixes the roster size, 3,000 followed stocks, but no artifact fixes how much price history each stock holds. The cost of gap detection grows with the number of bars.
   - The plan follows the local precedent of `tests/integration/test_coverage_volume.py`: one year (2024) of weekday bars and one `prices` segment per instrument, about 780,000 bars in all (constraint 9, step 5). This is not a provisional value.
   - The result holds for that depth. A deeper history is a different measurement.
   - Flag for component-design-data-health-reader §7 (*Volume* row), to name the depth the latency target assumes.

### Other Notes

- **Why the run is `failed`.**
  - `create_app`'s lifespan starts the classification scheduler (`run_classification_loop`). Its `qualifying_run.sql` claims the oldest `succeeded` or `partial` run that has no classification set, and builds a set over every active stock.
  - A seeded `partial` run would therefore start a 3000-stock classification build that runs and writes while the requests are being timed, and the latency would measure two workloads.
  - A `failed` run is terminal, has an `ended_at` (`acquisition_run_terminal_has_end`), is never claimed, and leaves the reclaim sweep nothing to do, because only `running` and `cancelling` runs go stale.
  - The CAP-003-E2-S6 plan seeds runs through `create_app` too, and faces the same choice.
- **Mapped test cases.** TC-INT-026 (`tests/integration/integration-tests.md`, traces to AC-11, AC-16, DAC-E2-S7-1) and TC-INT-047 (traces to AC-28, DAC-E2-S7-2, DAC-E2-14). The coverage matrix lists the story "2 of 2" derived ACs covered and DAC-E2-14 by TC-INT-047. No component test case maps to this story: TC-COMP-046 and TC-COMP-049, which also trace to AC-28, are CAP-003-E2-S2's and CAP-003-E2-S3's.
- **Expected values.** Every expected value is a literal written from the seed, never from the code under test.
  - Daily prices are clean. Every stock has every weekday bar of 2024 and a segment ending `2024-12-31`, so detection is available with zero gaps and `latest_session` is `2024-12-31`.
  - In Company financials, the 300 failing stocks are `absent` (an `acquisition_state` row and no segment) and are problems, and the union is the same 300 (DEC-0213 a and e; DEC-0220).
  - `as_of` is `T1`, the latest `written` fundamentals acquisition.
- **Timestamp format.** Timestamps are compared after `datetime.fromisoformat`, so `...Z` and `+00:00` both pass. CAP-003-E2-S4's own tests pin the wire format.
- **No order assumption beyond the contract.** Symbols are zero-padded, upper-case letters and digits, so keyset and union order follow the byte order of `S0001` to `S3000` under any collation.
- **Hand-written mutants.** Apply each in T008, one at a time, then revert. They target the landed upstream files, so this story's mutation run has no production file of its own (see T010).
  - `src/factorflow/data_health/reader.py: limit=MAX_LIMIT → limit=50` (T004, spy cap)
  - `src/factorflow/data_health/reader.py: affected_count=<PROBLEM_COUNT_SQL stock_count> → affected_count=len(problems.rows)` (T004)
  - `src/factorflow/data_health/reader.py: _FIRST_PAGE_LIMIT: Final = 50 → _FIRST_PAGE_LIMIT: Final = 51` (T005)
  - `src/factorflow/data_health/reader.py: fold.add_page(view, ...) inside the page loop → views.append(view) inside the loop, then fold.add_page for each kept view after it` (T006)
  - `src/factorflow/data_health/reader.py: append while len(symbols) < _EXCEPTION_SYMBOLS_KEPT → append while len(symbols) <= _EXCEPTION_SYMBOLS_KEPT` (T004)
  - `src/factorflow/data_health/queries.py: i.symbol > %(cursor)s → i.symbol >= %(cursor)s` in `PROBLEM_ROWS_SQL` (T005)
  - `src/factorflow/api/routes/data_health.py: def get_data_health(...): <body> → def get_data_health(...): time.sleep(2.1); <body>` (T007)
  - `tests/integration/test_data_health_volume.py: ranked[math.ceil(0.95 * len(ranked)) - 1] → ranked[math.ceil(0.95 * len(ranked))]` (T002 a; returns the 20th value, `20.0`, not `19.0`)
  - `tests/integration/test_data_health_volume.py: p95 <= limit → p95 < limit` (T002 c)
- **Duration.** The test seeds about 780,000 bars and sends 29 requests: 1 attention, 1 counted data-health, 5 problem pages, 1 problems first page, 1 warm-up and 20 timed. It is marked `slow`. The suite has no `addopts` that deselects `slow`, so `uv run pytest` runs it.
