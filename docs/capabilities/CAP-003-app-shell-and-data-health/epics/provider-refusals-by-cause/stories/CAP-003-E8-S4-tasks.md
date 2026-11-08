---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T19:40:00Z
  source_artifacts:
    - id: CAP-003-E8-S4
      version: "1"
    - id: CAP-003-E8
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-component-design-acquisition-runner
      version: "1"
    - id: CAP-003-component-design-massive-client
      version: "1"
    - id: CAP-003-component-design-rate-limit-governor
      version: "1"
    - id: CAP-003-acquisition-runner-tests
      version: "1"
    - id: CAP-003-massive-client-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "2"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E8-S4 — The Runner Starts Each Stock's Budget at Its Heartbeat, Proven End to End at the Default Timing Set

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-003-E8-tasks`
**Date**: 2026-11-08

## Summary

The runner side of follow-up F1, where production stored both a Massive `403` "not entitled" and a `429` rate limit as `[unavailable] … failed 3 consecutive attempts`. `AcquisitionRunner.execute_claimed` gains one call, `self._client.start_instrument()`. It goes after the delivered `heartbeat` and `cancellation_requested` checks and before the symbol lookup, so each stock's throttle wait budget starts where its heartbeat is refreshed. A stock that is never fetched starts no budget, and all four data types of a stock share one (acquisition-runner CAP-003 §2.2; system design §3.6 note 4). A new PostgreSQL-backed test module, `tests/integration/test_runner_provider_refusals.py`, proves both refusals end to end through the real `MassiveClient` and governor over the socket-free transport harness. That includes the one persistent-`429` test at the default timing set that system design constraint 16 (e) requires: no heartbeat interval holds more than 300 s of throttle sleeps or reaches 900 s, and the download is finalised `partial` or `failed`, never `abandoned`. `README.md` gains the operator upgrade subsection for release 0.2.0, written once for E8-S1 to S4. `journal.py`, `reclaim.py`, `writer.py`, `plan.py`, `ingestion_main.py`, `outcomes.py` and every timing value stay untouched.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-29 | A plan refusal is sent once and recorded under its own reason | T004, T007, T008, T013 |
| AC-30 | A rate limit is no attempt; past the stock's budget it is recorded `rate_limited` and the download still finishes, never abandoned | T003, T005, T006, T009, T010, T013 |
| DAC-E8-7 | `start_instrument()` once per stock, after `heartbeat` and `cancellation_requested`, before the first `fetch_*` | T003, T009, T010 |
| DAC-E8-8 | Neither refusal stops the download; a rejected credential still fails it at once; no outcome, column, timing value or migration added | T005, T008, T011, T016 |
| DAC-E8-9 | Two stocks, every financial-statements request `403`: `[not_entitled]` fundamentals, one balance-sheets request per stock, run `partial` | T004, T015 |
| DAC-E8-10 | Persistent `429` at the default timing set: sleeps per heartbeat interval ≤ 300 s, interval < 900 s, `[rate_limited]` on all four, one request per read after the budget is spent, next stock fresh, `partial`/`failed`, never `abandoned` | T005, T006, T009, T015 |
| DAC-E8-19 | Pre-upgrade results keep `[unavailable]`, never rewritten; upgrade notes name 0.2.0 and constraint 17 (a) to (d) | T007, T013, T014, T015 |
| DAC-E8-20 | Every `403`/`429` test runs through the real SDK and urllib3 path, production `MassiveSettings`, one `FakeClock` as `monotonic` and `now` | T002, T004, T005, T006, T007, T009 |
| DAC-E8-S4-1 | `MagicMock` client, two stocks, one parent `Mock`: `start_instrument` twice in order; once when cancelled before stock two | T003, T010 |
| DAC-E8-S4-2 | Real client: `AAPL` and `KO` refused on financials, recorded and counted as specified, run `partial` | T004 |
| DAC-E8-S4-3 | Default timing set, `KO` always `429` then `AAPL` as S4-2, jitter `[0.0]` and `[0.999]`, assertions (a) to (e) | T005, T009, T010 |
| DAC-E8-S4-4 | `KO` alone, always `429`, jitter `[0.0]`: four `[rate_limited]` rows, run `failed`, never `abandoned` | T006 |
| DAC-E8-S4-5 | Every delivered runner test passes unchanged, the credential case included | T008, T011 |
| DAC-E8-S4-6 | README subsection `### Upgrading from 0.2.0: provider refusals reported by cause` after *Upgrade, backup and rollback* | T013 |
| DAC-E8-S4-7 | Earlier `[unavailable]` rows are never updated; no `UPDATE` of an earlier run's results added | T007, T015 |
| DAC-E8-S4-8 | Request counts come from `RecordingMakeRequest`; no assertion reads `run_instrument_result.attempts` | T002, T015 |

## Phase 1: Setup

**Purpose**: Confirm that the hard prerequisites E8-S1 to S3 have landed and that the PostgreSQL-backed rows can run in isolation before any test is written

- [ ] T001 Verify the prerequisites and the run environment, editing no file. (a) `src/factorflow/ingestion/massive/errors.py` defines and exports `ProviderNotEntitled(MassiveError)` and `ProviderRateLimited(ProviderUnavailable)`, and `compose_failure_reason` composes `not_entitled` and `rate_limited` (CAP-003-E8-S1, CAP-003-E8-S2). (b) `src/factorflow/ingestion/rate_limit.py` has `RateLimitGovernor.start_throttle_budget()` and checks the budget before each wait (CAP-003-E8-S2). (c) `src/factorflow/ingestion/massive/client.py` has `MassiveClient.start_instrument()` and the module-level `classify_for_governor` with the `429` `MaxRetryError` rule (CAP-003-E8-S3). (d) `src/factorflow/ingestion/outcomes.py` `classify_provider_error` accepts both types. If any is missing, stop: the story's hard edges have not landed. (e) Imports resolve to this clone. Run every Python command from the clone root with `PYTHONPATH=src`. A `PYTHONPATH` set to the repository root still imports the other checkout's editable install (`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/src`), verified at planning. (f) `docker info` succeeds, because the `postgres` rows need a container runtime. In the Claude Code Bash sandbox the Docker socket is denied, so run those rows with the sandbox disabled. (prerequisite; traces to no AC)

**Checkpoint**: The S1 to S3 symbols exist in this clone, `PYTHONPATH=src` imports this clone's `factorflow`, and a container runtime is reachable for `testcontainers`

---

## Phase 2: Tests (TDD)

**Purpose**: Write the runner's stock-boundary tests and the end-to-end refusal proofs before the runner changes

Every test in this phase lives in `tests/integration/test_runner_provider_refusals.py`. Each carries `@pytest.mark.postgres` and an `# Implements TC-COMP-…` comment above the function, as `tests/integration/test_runner_outcomes.py` does. Each uses the `migrated_runner_connection` fixture from `tests/conftest.py`. That fixture gives every test its own database inside one session `testcontainers` `PostgresContainer("postgres:16")` on a random host port. It is never the production compose project `factorflow` on ports 5432 and 8000, so no test sets `FACTORFLOW_DATABASE_URL` or runs `docker compose`.

### Mandatory Component Tests

- [ ] T002 Create the module and its harness in `tests/integration/test_runner_provider_refusals.py`.
  - **Module docstring.** Name TC-COMP-252 to TC-COMP-256, TC-COMP-258 and TC-COMP-259, and DAC-E8-20.
  - **Store helpers.** Follow `tests/integration/test_runner_outcomes.py`, copying rather than importing, as every delivered runner test file does: `_insert_instrument`, `_insert_claimed_run` (`claimed_by='test-runner'`), `_fetch_run_state`, and `_fetch_result_rows`, which selects only `instrument_id, data_type, outcome, reason` and never `attempts` (DAC-E8-S4-8).
  - **Path symbol.** `_symbol_of(path)` takes the symbol from the `/tickers/<SYM>` or `/ticker/<SYM>` segment, otherwise from the `ticker` or `tickers` query parameter.
  - **Responders.** Each returns a `FakeAnswer` through `json_answer` from `tests/unit/massive_transport_fakes.py`. `_plan_refusal_answer` sends any `/stocks/financials/v1/` path a `403` with `{"status": "ERROR", "request_id": "req_403_<n>", "message": "You are not entitled to this data. Please upgrade your plan"}`, where `n` counts the `403`s answered. `/v3/reference/tickers/<SYM>` gets a `200` with the `tests/fixtures/massive/reference_active.json` envelope, its `ticker` set to `<SYM>`. A path containing `/events` gets `{"request_id": "req_ok_001", "results": {"events": []}}`, checked first, as `_four_reads_answer` in `tests/unit/test_massive_sdk_config.py` does. Every other path gets `{"request_id": "req_ok_001", "results": []}`. `_throttling(symbols, otherwise)` answers `429` with the bytes of `tests/fixtures/massive/error_rate_limited.json` and `Content-Type: application/json` for every request whose `_symbol_of` is in `symbols`, and delegates everything else to `otherwise`.
  - **Harness builder.** `_real_harness(monkeypatch, responder, *, jitter)`:
    - Settings: production `MassiveSettings(_env_file=None)` from env `FACTORFLOW_MASSIVE_API_KEY=generated_test_key()` and `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60`, every other value at its default; assert `max_attempts == 3`, `max_throttle_wait_seconds == 300.0` and `RunSettings(_env_file=None).stale_after_seconds == 900.0`.
    - Governor: `RateLimitGovernor(GovernorSettings.from_massive_settings(settings), monotonic=clock, now=clock, sleep=sleeper, jitter=SequenceJitter([jitter]))`, where `clock = FakeClock(1_762_560_000.0)` (a multiple of 60) and `sleeper = FakeSleeper(clock)`, both from `tests/unit/governor_fakes.py`.
    - Client: `MassiveClient(settings=settings, governor=governor)`.
    - Transport: `forbid_sockets(monkeypatch)`, then `RecordingMakeRequest(responder).install(monkeypatch)`.
  - **Checkpoint marks.** The harness keeps one ordered list of marks `(kind, clock(), len(sleeper.calls), len(transport.requests))`. It monkeypatches `factorflow.ingestion.runner.heartbeat` and `factorflow.ingestion.runner.finalise` with wrappers that append a `heartbeat` or `finalise` mark before delegating to `factorflow.runs.journal`. It monkeypatches the governor instance's `start_throttle_budget` with a wrapper that appends a `budget` mark before delegating.
  - **Scenario helpers.** `_run_plan_refusal_download(conn, monkeypatch)` and `_run_throttled_download(conn, monkeypatch, *, jitter, roster)` insert the instruments, insert the claimed run, build the harness and run `AcquisitionRunner(connection=conn, client=harness.client, today=date(2025, 9, 22)).execute_claimed(run_id=…, depth_years=5, instrument_ids=…)`. They return the run id, the instrument ids by symbol and the harness.
  - **Constraints.** Build the harness inside the test, after the database fixture: psycopg's sync connect calls `socket.getaddrinfo`, so no new `psycopg.connect` may happen once `forbid_sockets` is installed, and every read uses the fixture's connection. In docstrings and comments, say "requests", never the bare word for retries, because of T015's check.
  - (DAC-E8-20, DAC-E8-S4-8; harness, no mutant of its own)
- [ ] T003 Implement TC-COMP-252 (start_instrument is called once per stock, after its heartbeat and cancellation check) as two tests in `tests/integration/test_runner_provider_refusals.py`.
  - **Setup.** A `MagicMock` client stubbed like `_make_stub_client` in `tests/integration/test_runner_cancel.py`. `parent = Mock()`; `parent.attach_mock(client, "client")`; `parent.attach_mock(Mock(wraps=journal.heartbeat), "heartbeat")` and the same for `cancellation_requested`, each also monkeypatched onto `factorflow.ingestion.runner`. Roster of two stocks.
  - **Test 1.** `[c[0] for c in parent.mock_calls]` equals the literal list `["heartbeat", "cancellation_requested", "client.start_instrument", "client.fetch_reference", "client.fetch_daily_bars", "client.fetch_financials", "client.fetch_corporate_actions"] * 2`.
  - **Test 2.** The first stock's `fetch_corporate_actions` side effect sets the run to `cancelling` (the `_set_cancelling` precedent in `test_runner_cancel.py`). The names equal that seven-item list followed by `["heartbeat", "cancellation_requested"]`, so `client.start_instrument.call_count == 1`, and the run is `cancelled`.
  - **Kills.** — kills: manual M1 (delete the call), M2 (call before `heartbeat`), M3 (call after `fetch_reference`) and M4 (call hoisted above the loop) on `runner.py` `self._client.start_instrument()`. Each changes the literal call sequence or count. (DAC-E8-S4-1, DAC-E8-7)
- [ ] T004 Implement TC-COMP-253 (a real 403 plan refusal is sent once per stock and the download finishes partial) in `tests/integration/test_runner_provider_refusals.py` through `_run_plan_refusal_download`, roster `AAPL` then `KO`. Assert:
  - For each symbol, its `fundamentals` row is `failed`, with a reason starting `[not_entitled] symbol=<symbol> data_type=fundamentals request_id=req_403_` and ending `the provider plan is not entitled to this data`.
  - From `transport.requests` grouped by `_symbol_of`, exactly one request per symbol has a path starting `/stocks/financials/v1/balance-sheets`, and none starts `/stocks/financials/v1/income-statements` or `/stocks/financials/v1/cash-flow-statements`.
  - `reference`, `prices` and `corporate_actions` are in `{"written", "unchanged"}` for both symbols.
  - `KO`'s rows exist, so the second stock was fetched after the first stock's refusal.
  - `harness.sleeper.calls == []`.
  - The run state is `partial`.
  - **Kills.** — kills: negate-boolean on `errors.py` `_mentions_not_entitled` (E8-S1's line, outside this diff, not added to the run). That mutant is observed as three balance-sheets requests per stock and an `[unavailable]` reason. No mutant of this story's runner line changes this row, which is a characterization of E8-S1 through the runner and expected GREEN on arrival. (DAC-E8-S4-2, DAC-E8-9, DAC-E8-20)
- [ ] T005 Implement TC-COMP-254 (persistent 429 at the default timing set stays inside the staleness window and finishes partial) in `tests/integration/test_runner_provider_refusals.py`. It is parametrised over `jitter` in `(0.0, 0.999)` through `_run_throttled_download(roster=["KO", "AAPL"])`, with responder `_throttling({"KO"}, _plan_refusal_answer)`. Asserts:
  - **(a)** The marks of kind `heartbeat` and `finalise` are exactly `["heartbeat", "heartbeat", "finalise"]`. For each consecutive pair `m, n`, `sum(sleeper.calls[m.sleeps:n.sleeps]) <= settings.max_throttle_wait_seconds` and `n.clock - m.clock < run_settings.stale_after_seconds`. With jitter `0.0`, `KO`'s slice equals the literal `[60.0] * 5`. In both cases `AAPL`'s slice equals `[]`.
  - **(b)** Each of `KO`'s four rows is `failed`, with a reason starting `[rate_limited] symbol=KO data_type=<type> request_id=unavailable: `.
  - **(c)** In `KO`'s request slice, `transport.requests[hb0.requests:hb1.requests]`, exactly one request has a path starting `/v2/aggs/`, exactly one starts `/stocks/financials/v1/` and that one is `balance-sheets`, and exactly one is a corporate-actions request (`/stocks/v1/splits`, `/stocks/v1/dividends`, `/vX/reference/ipos`, `/vX/reference/tickers/KO/events`). With jitter `0.0`, the `/v3/reference/tickers/KO` count is 6.
  - **(d)** All marks in order are exactly `["heartbeat", "budget", "heartbeat", "budget", "finalise"]`. Each `budget` mark's `requests` index equals the preceding `heartbeat` mark's, so no request of that stock preceded its budget start. `AAPL`'s `reference`, `prices` and `corporate_actions` are in `{"written", "unchanged"}`, and its `fundamentals` reason starts `[not_entitled] symbol=AAPL data_type=fundamentals `.
  - **(e)** The run state is `partial`.
  - **Kills.** — kills: manual M1, M2, M3 and M4 on `runner.py` `self._client.start_instrument()` through (d)'s literal mark sequence. Note that (d) cannot rely on `AAPL`'s outcomes: `AAPL` is never throttled, so they read the same under M1 (wrong-property check). The governor's before-wait check, E8-S2's code outside this diff, is killed by (a) with jitter `0.999`. (DAC-E8-S4-3, DAC-E8-10, DAC-E8-8, DAC-E8-20)
- [ ] T006 Implement TC-COMP-255 (everything throttled finishes failed by the outcome rule, never abandoned) in `tests/integration/test_runner_provider_refusals.py` through `_run_throttled_download(jitter=0.0, roster=["KO"])`. Asserts:
  - Four rows, each `failed`, with a reason starting `[rate_limited] symbol=KO data_type=<type> request_id=unavailable: `.
  - The marks are `["heartbeat", "budget", "finalise"]`, and the interval's sleeps equal `[60.0] * 5`.
  - The run state is `failed`.
  - **Kills.** — kills: off-by-one on `journal.py` `if wrote == 0` (delivered, outside this diff, not added to the run). That mutant is observed as `partial` instead of `failed`. This is a characterization row, expected GREEN on arrival. (DAC-E8-S4-4, DAC-E8-10)
- [ ] T007 Implement TC-COMP-258 (results recorded before the upgrade are never updated) in `tests/integration/test_runner_provider_refusals.py`, parametrised over the scenarios `plan_refusal` (T004's) and `throttled` (T005's with jitter `0.0`).
  - **Seed.** Before the download, seed one earlier terminal run: `state='failed'`, `started_at` and `ended_at` set, `claimed_by` and `heartbeat_at` NULL, as `acquisition_run_claim_agrees` and `acquisition_run_terminal_has_end` require. Give it `run_instrument_result` rows for `KO` and `AAPL` with `outcome='failed'` and the module constant reason `[unavailable] symbol=<symbol> data_type=fundamentals request_id=unavailable: The provider failed 3 consecutive attempts.`, the 0.2.0 production text.
  - **Snapshot.** Before and after the download, read `SELECT xmin::text, run_id, instrument_id, data_type, outcome, reason, completed_at FROM run_instrument_result WHERE run_id = %s ORDER BY instrument_id, data_type`.
  - **Assert.** The two snapshots are equal. Every reason still equals the seeded constant, compared against the literal and not the earlier snapshot. The earlier run's state is still `failed`.
  - **Kills.** — kills: manual M6, a no-op `UPDATE run_instrument_result SET reason = reason WHERE run_id <> %s` before the final `finalise`. Only the changed `xmin` shows it, which is why `xmin` is read. (DAC-E8-S4-7, DAC-E8-19)
- [ ] T008 Implement TC-COMP-256's edge case (a rejected credential after a plan refusal or a rate limit still fails the download at once; acquisition-runner §8 criterion 6) in `tests/integration/test_runner_provider_refusals.py`. It is parametrised over `ProviderNotEntitled("x")` and `ProviderRateLimited("x")`, with a `MagicMock` client over a two-stock roster. The refusal is raised from `fetch_reference`, and `fetch_daily_bars` raises `CredentialRejected("api key TEST-ONLY-secret-value was rejected", provider_request_id="req-cr-001")`, as `_rejecting_client` in `tests/integration/test_runner_outcomes.py` does. Assert:
  - The run state is `failed`, and `acquisition_run.failure_reason` starts `[credential_rejected] symbol=<first> data_type=prices `.
  - No `run_instrument_result` row exists for the run.
  - `client.fetch_reference.call_count == 1` and `client.start_instrument.call_count == 1`, so the second stock was never started.
  - **Kills.** — kills: manual M7, the prices block's `except CredentialRejected` moved below the `except (InstrumentNotFound, ProviderUnavailable, MassiveError)` clause (delivered code, outside this diff, not added to the run). That mutant is observed as a `partial` run with recorded rows. (DAC-E8-S4-5, DAC-E8-8)

### Additional Unit Tests

- [ ] T009 Add `test_each_throttled_stock_waits_its_own_full_budget` to `tests/integration/test_runner_provider_refusals.py`, the behavioural proof of DAC-E8-10's "the next stock's budget MUST start fresh". It runs `_run_throttled_download(jitter=0.0, roster=["KO", "PEP"])` with responder `_throttling({"KO", "PEP"}, _plan_refusal_answer)`. Assert:
  - The heartbeat and finalise marks are `["heartbeat", "heartbeat", "finalise"]`, and each interval's sleeps equal the literal `[60.0] * 5`.
  - Each symbol's `/v3/reference/tickers/<SYM>` request count is 6.
  - All eight rows carry the `[rate_limited] ` kind.
  - The run state is `failed`.
  - **Kills.** — kills: manual M1, M3 and M4 on `runner.py` `self._client.start_instrument()` behaviourally, without the spy. Under each of them `PEP`'s interval sleeps are `[]` and its reference count is 1. (DAC-E8-7, DAC-E8-10, DAC-E8-S4-3)

**Checkpoint**: The module collects. Four tests fail for the right reason, because the runner never calls `start_instrument()`: T003's two, T005 on (d), and T009. T004, T006, T007 and T008 pass on arrival, because they prove E8-S1 to S3 and the delivered outcome rule through the runner. Record both facts in the cycle's RED evidence. Write no production code yet.

---

## Phase 3: Core Implementation

**Purpose**: Start each stock's throttle wait budget at the top-of-stock checkpoint

- [ ] T010 In `src/factorflow/ingestion/runner.py`, `AcquisitionRunner.execute_claimed`, insert between the `if cancellation_requested(...)` block (ending `return`, line 214) and the `# --- Fetch symbol ---` comment, at the loop body's indentation, exactly:
  ```python
  # Start this stock's throttle wait budget at the same checkpoint the
  # heartbeat was refreshed (CAP-003 system design §3.6 note 4).
  self._client.start_instrument()
  ```
  This follows acquisition-runner CAP-003 §2.2. Change no other line, docstring, import, timing value or `except` clause. (DAC-E8-7, AC-30)

**Checkpoint**: The focused suite of T002 to T009 passes in full, both jitter parameters included

---

## Phase 4: Integration

**Purpose**: Prove the delivered runner, entrypoint and README tests still pass unchanged against the new call

- [ ] T011 Implement TC-COMP-256 (the delivered runner tests pass with clients that accept start_instrument).
  - **Run unchanged.** Run every `tests/integration/test_runner_*.py` (`acquires`, `cancel`, `credential`, `depth`, `isolation`, `outcomes`, `reclaim`, `resume`, `transactions`, `volume`), `tests/unit/test_runner_reason.py`, `tests/unit/test_runner_volume_support.py`, `tests/unit/test_outcomes.py`, `tests/unit/test_ingestion_main.py` and `tests/unit/test_ingestion_e2e_main.py`. All must pass, the credential case `test_runner_outcomes.py::test_rejected_credential_fails_the_run_with_its_reason` included.
  - **Untouched.** `git diff --stat -- tests/integration/test_runner_acquires.py tests/integration/test_runner_cancel.py tests/integration/test_runner_credential.py tests/integration/test_runner_depth.py tests/integration/test_runner_isolation.py tests/integration/test_runner_outcomes.py tests/integration/test_runner_reclaim.py tests/integration/test_runner_resume.py tests/integration/test_runner_transactions.py tests/integration/test_runner_volume.py tests/unit/` prints nothing.
  - **Kills.** — kills: none; a regression run of delivered tests. (DAC-E8-S4-5, DAC-E8-8)
- [ ] T012 Run `ruff check`, `ruff format --check` and `mypy src` over the touched files `src/factorflow/ingestion/runner.py` and `tests/integration/test_runner_provider_refusals.py`. In a `strict` mypy setting `self._client` is `Any`, so the call type-checks with no stub change. Then re-run T002 to T009 once more, and inspect `git diff --stat`: it must list only `src/factorflow/ingestion/runner.py` and the new test module before Phase 5. (DAC-E8-8: no outcome, column, timing value or migration)

**Checkpoint**: Delivered runner suites pass unchanged, the new module passes, and the code diff is the one runner hunk plus the new test file

---

## Phase 5: Polish

**Purpose**: Operator upgrade notes, the review-time static checks, final validation and TDD evidence

- [ ] T013 Implement TC-COMP-257 (README discloses the upgrade from 0.2.0) in `README.md`.
  - **Placement.** Add `### Upgrading from 0.2.0: provider refusals reported by cause` immediately after the *Upgrade, backup and rollback* subsection, after its rollback step 6, and before `### Pre-release backup and restore drill`, inside `## Deploying and operating FactorFlow`.
  - **Release.** Name release 0.2.0 (`factorflow:0.2.0-829c9e1`, deployed 2026-11-07).
  - **(a) Throttling.** A throttled stock now waits to the minute boundary, for up to the 300 s budget per stock (`FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS`), instead of failing within seconds. A download on a plan whose request limit is below `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` therefore takes longer, by up to one budget per followed stock under persistent throttling. Cancelling still takes effect after the current stock.
  - **(b) Plan refusals.** A plan refusal costs one request instead of three.
  - **(c) Reason kinds.** Stored reasons gain the kinds `not_entitled` and `rate_limited`, six kinds where 0.2.0 had four (see *Massive provider failure reasons*). Results recorded before the upgrade keep `[unavailable]` and are not rewritten, so they read as ordinary failures until the next download re-records that data type.
  - **(d) Rollback.** Rollback is a redeploy of the previous image with no data step, because the new kinds are text in an existing column. State that no migration, new variable or manual action is needed.
  - **Procedure.** Say the upgrade follows *Upgrade, backup and rollback*, without restating its steps. The subsection holds no `docker compose … exec` command, so `tests/unit/test_readme_deployment.py`'s slices and its `PGPASSWORD` scan stay valid unchanged.
  - **Kills.** — kills: none; a documentary row verified by reading in review and by the Validation Plan's position check. (DAC-E8-S4-6, DAC-E8-19)
- [ ] T014 Owner confirmed 2026-11-08 (see Notes P1). In `README.md` *Massive provider failure reasons*, change the two taxonomy statements that say four to six: "one of the four typed `MassiveError` subclasses" and "any error not in the four-type taxonomy". Add one sentence saying that `ProviderNotEntitled`'s variable segment is the fixed "the provider plan is not entitled to this data", as `CredentialRejected`'s is, and that `rate_limited` carries the governor's fixed text with `request_id=unavailable` (massive-client CAP-003 §2.5). Edit no other README section. (DAC-E8-19; keeps T013's "six kinds" consistent with the section it cites)
- [ ] T015 Run the review-time static checks for TC-COMP-258 step 3 and TC-COMP-259, editing no file.
  - **No new UPDATE.** `git diff <story base> -- src/factorflow/ingestion/runner.py | grep -nE '^\+.*\bUPDATE\b'` prints nothing (TC-COMP-258).
  - **No read of the retry column.** `grep -nw attempts tests/integration/test_runner_provider_refusals.py | grep -v 'consecutive attempts'` prints nothing. `-w` already excludes `max_attempts`, and the seeded reason of T007 is the one permitted occurrence. Every request-count assertion reads `transport.requests` (TC-COMP-259).
  - **Kills.** — kills: none; static review checks. (DAC-E8-S4-7, DAC-E8-S4-8, DAC-E8-9, DAC-E8-10)
- [ ] T016 Run the tech-stack v7 validation commands once on the final bytes, as listed in the Validation Plan below. Report a `postgres` exclusion only if the container runtime is genuinely unavailable, and do not report a partial run as green. The `postgres` rows of T003 to T009 must have run before review. (all ACs)
- [ ] T017 Record the story's TDD cycle in `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4-tdd-evidence.yaml`, beside this story. This plan has one behaviour-changing cycle, `cycle-1`, covering T002 to T010: the tests, then the runner call.
  - **Reviews.** Stage only that cycle's diff, then dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - **Entry.** Append the cycle with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true` and its RED/GREEN evidence. The RED log is the Phase 2 checkpoint run, naming the four failing tests and the four characterization tests that pass on arrival.
  - **Mutation.** Include the structured `mutation:` block that `scripts/mutation-run.py summary` prints for the generated mutants plus the hand-written M1 to M4 and M6 listed in Other Notes (`"operator": "manual"`).
  - **Fingerprint.** Record `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.
  - **Documentation is no cycle.** T013 and T014 change documentation only and form no TDD cycle. T001, T011, T012, T015 and T016 change no code.
  - **Commit hash.** Story coding is attended with one commit per story, so that single story commit carries both the code and this evidence file and cannot hold its own hash. The cycle therefore records `commit_hash: stage`, which `scripts/check-tdd-evidence.py` resolves to the commit that introduced this `diff_sha256` into the evidence file: the story commit.
  - **Hand-off.** `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in the commit. (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E8-S1 | hard | `ProviderNotEntitled`, its `[not_entitled]` reason and its `classify_provider_error` mapping (`errors.py`, `outcomes.py`), which T004, T005 (d), T007 and T008 record; existing graph edge |
| CAP-003-E8-S2 | hard | `RateLimitGovernor.start_throttle_budget()`, the per-stock budget checked before each wait and `ProviderRateLimited` (`rate_limit.py`, `errors.py`), which T005, T006 and T009 bound and record; existing graph edge |
| CAP-003-E8-S3 | hard | `MassiveClient.start_instrument()`, which T010 calls, and `classify_for_governor`'s `429` rule (`client.py`), without which no `429` reaches the budget; existing graph edge. It lands and releases with this story (owner decision 2026-11-08) |

No new hard edge was discovered. `dependencies.yaml` already lists all three for this story.

### Task Dependencies
- T001: none; gates everything else.
- T002: depends on T001.
- T003 to T009: depend on T002. They share one file, so write them sequentially, in any order.
- T010: depends on T003 to T009 having been written and their RED observed.
- T011, T012: depend on T010.
- T013: depends on T001 only, because it is documentation. Land it after T012 to keep the cycle's staged diff code-only.
- T014: depends on T013 (same file).
- T015: depends on T007 and T010.
- T016: depends on T010 to T015.
- T017: interleaved. Run it after cycle-1 (T002 to T010) and before T011. The evidence file is finalised after T016.

### Parallel Opportunities
- T011 and T012 can run in parallel once T010 is done.
- T013 and T014, which are README-only, can be drafted in parallel with Phase 4, then applied in order.
- Within Phase 2 the tests share one module, so they are not marked `[P]`.

---

## Validation Plan

### Constitution-Defined Commands
- Install: `uv sync --all-extras`. This clone has no `.venv`; the equivalent below uses the shared interpreter `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin/python` (referred to below as `$PY`), always run from the clone root with `PYTHONPATH=src`.
- Build: `uv build`. This story adds no package data or dependency.
- Test: `uv run pytest`, or `PYTHONPATH=src $PY -m pytest -p no:cacheprovider`. The `postgres` rows need Docker; run them with the Bash sandbox disabled. Without a container runtime, use `uv run pytest -m 'not postgres'` and report the exclusion. This story's rows are all `postgres` rows and must run before review.
- Focused tests, per phase. Each runs at the phase checkpoint and as the mutation runner's command; the full test command runs once, on the final bytes.
  - Phase 2 and 3 (cycle-1; `mutation-run.py run --command`): `PYTHONPATH=src $PY -m pytest -p no:cacheprovider -q tests/integration/test_runner_provider_refusals.py`. Keep `PYTHONPATH=src` relative in the mutation command, so each clone imports its own mutated source. An absolute path to this clone would make every mutant survive. Use `--jobs 2`: each clone starts its own `testcontainers` PostgreSQL.
  - Phase 4: `PYTHONPATH=src $PY -m pytest -p no:cacheprovider -q tests/integration/test_runner_provider_refusals.py tests/integration/test_runner_acquires.py tests/integration/test_runner_cancel.py tests/integration/test_runner_credential.py tests/integration/test_runner_depth.py tests/integration/test_runner_isolation.py tests/integration/test_runner_outcomes.py tests/integration/test_runner_reclaim.py tests/integration/test_runner_resume.py tests/integration/test_runner_transactions.py tests/integration/test_runner_volume.py tests/unit/test_runner_reason.py tests/unit/test_runner_volume_support.py tests/unit/test_outcomes.py tests/unit/test_ingestion_main.py tests/unit/test_ingestion_e2e_main.py`
  - Phase 5: `PYTHONPATH=src $PY -m pytest -p no:cacheprovider -q tests/unit/test_readme_deployment.py`
- Lint: `uv run ruff check .`, or `$PY -m ruff check .`
- Format: `uv run ruff format --check .`, or `$PY -m ruff format --check .`
- Type check: `uv run mypy src`, or `PYTHONPATH=src $PY -m mypy src`

### Story-Specific Validation
- DAC-E8-7 and DAC-E8-S4-1: T003's literal call sequences, and T009's per-stock literal sleeps.
- DAC-E8-9 and DAC-E8-S4-2: T004's reason prefix and suffix, the balance-sheets count of 1 per stock with no income or cash-flow request, and the `partial` state.
- DAC-E8-10, DAC-E8-S4-3 and DAC-E8-S4-4: T005 (a) to (e) at both jitters, and T006's `failed` state.
- DAC-E8-8 and DAC-E8-S4-5: T008 and T011. `git diff --stat` touches no file under `src/factorflow/db/migrations/`, and no file in `src/factorflow/config/`, `journal.py`, `reclaim.py`, `writer.py`, `plan.py`, `ingestion_main.py` or `outcomes.py`.
- DAC-E8-S4-6: run `python3 -c "t=open('README.md').read(); a=t.index('### Upgrade, backup and rollback'); b=t.index('### Upgrading from 0.2.0: provider refusals reported by cause'); c=t.index('### Pre-release backup and restore drill'); assert a<b<c and '\n### ' not in t[a+1:b] and '\n## ' not in t[a:c]; s=t[b:c]; [s.index(x) for x in ('factorflow:0.2.0-829c9e1','2026-11-07','FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS','FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE','not_entitled','rate_limited','[unavailable]','Upgrade, backup and rollback')]; assert 'docker compose' not in s"` from the clone root. Then `tests/unit/test_readme_deployment.py` must pass unchanged, and the review reads the subsection against constraint 17 (a) to (d).
- DAC-E8-S4-7 and DAC-E8-S4-8: T007, plus T015's two greps.

---

## Notes

### Resolved Conflicts

1. **TC-COMP-258 "byte for byte" against DAC-E8-S4-8 "no assertion reads `attempts`".** A literal full-row comparison would read `attempts`. The story AC outranks the test specification's wording (constraint 9.1). T007 therefore compares every column except `attempts` and adds the system column `xmin`, which changes on any `UPDATE`, a no-op one included. That is strictly stronger evidence of "none is updated" than the column bytes. The test specification needs no edit; flag the wording for its next revision.
2. **Acquisition-runner §2.1 lists `outcomes.py` and `tests/unit/test_outcomes.py` as this component's edits, but the story says they landed with E8-S1 and E8-S2.** The story's Description, together with the CAP-003-E8-S1 and CAP-003-E8-S2 stories that carry those edits, governs over the design's file list. This plan touches neither file.
3. **Acquisition-runner §7's last row names four delivered integration files; DAC-E8-S4-5 names more.** The story names every `tests/integration/test_runner_*.py`, `test_runner_credential.py` and `tests/unit/test_runner_*.py`. The story AC governs, and T011 runs the wider set plus the two entrypoint test files that build the runner.
4. **The template's Phase 2 checkpoint, "All tests … failing", against characterization rows.** T004, T006, T007 and T008 prove E8-S1 to S3 and the delivered outcome rule through the runner. They are GREEN once those stories land, independent of this story's one line. The RED of cycle-1 is carried by T003, T005 (d) and T009. The evidence states both, rather than inventing a failure.

### Open Gaps

1. **DAC-E8-S4-3 (d), "AAPL's budget started fresh", is unobservable through AAPL's outcomes** under the AC's own fixture: `AAPL` is never throttled, so its results are identical with or without the call. The plan observes it two ways. (i) T005 wraps the real governor's `start_throttle_budget` and asserts the mark sequence and that no request preceded each start. (ii) T009 adds a second throttled stock, whose full second budget is the behavioural proof. Acquisition-runner §7 row 4 should name an observation for (d) at its next revision.
2. **TC-COMP-252 does not say how cancellation is "requested before the second stock".** The plan follows the delivered precedent in `tests/integration/test_runner_cancel.py`: a client side effect sets the run to `cancelling` during the first stock. This follows local precedent, not an owner decision.

### Other Notes

- **P1, owner confirmed 2026-11-08 (keep T014): the README scope of T014.** The planning brief lists the README work as "upgrade notes (*Massive provider failure reasons*, four → six kinds)". The story, DAC-E8-S4-6 and its Files line ("`README.md` (one subsection)") specify only the upgrade subsection, and no E8-S1 to S3 story plans a README edit. Two readings exist. In the first, the upgrade subsection states the four-to-six change (T013 does this either way). In the second, this story also corrects the *Massive provider failure reasons* section, which still reads "four typed `MassiveError` subclasses" and "four-type taxonomy" at `README.md` lines 587 to 612. **Recommendation: keep T014.** It is two words and one sentence. Without it, the README would contradict itself once T013 says six. Doc-sync for CAP-003-E8-S1 and CAP-003-E8-S2 then finds the section already current. If the owner declines, drop T014 and leave the section to those stories' doc-sync. The *Rate limit governor* and *Acquisition runner* README sections, which describe the delivered per-request budget and loop, remain doc-sync's in either case, so this plan does not touch them.
- **Hand-written mutants for cycle-1.** `mutation-run.py generate --against <story base> --cycle cycle-1` is expected to yield nothing for the added comment and call line, so the run relies on these. Add each with `"operator": "manual"`:
  - M1. `src/factorflow/ingestion/runner.py: self._client.start_instrument() → pass`
  - M2. `src/factorflow/ingestion/runner.py: hb_ok = heartbeat(self._connection, run_id, self._runner_id) → self._client.start_instrument(); hb_ok = heartbeat(self._connection, run_id, self._runner_id)`, with the T010 call line deleted.
  - M3. `src/factorflow/ingestion/runner.py: reference = self._fetch_reference(symbol) → reference = self._fetch_reference(symbol); self._client.start_instrument()`, with the T010 call line deleted.
  - M4. `src/factorflow/ingestion/runner.py: for instrument_id in instrument_ids: → self._client.start_instrument()` placed on the line before the `for`, with the T010 call line deleted.
  - M6. `src/factorflow/ingestion/runner.py: finalise(self._connection, run_id)` (the final call, after the loop) `→ self._connection.execute("UPDATE run_instrument_result SET reason = reason WHERE run_id <> %s", (run_id,)); finalise(self._connection, run_id)`
  - M5, recorded as **equivalent**. `src/factorflow/ingestion/runner.py`: the T010 call moved to just after the `_symbol_for_id` `try`/`except … continue`. The symbol lookup sends no provider request. A stock skipped for a missing symbol sends none either, so whether its budget starts changes nothing a test can observe. The design's placement before the lookup is kept as written.
  - M7, together with the E8-S1, E8-S2 and journal mutants named in T004 to T008, lies in code this story does not change. Those mutants explain what each characterization row protects and are not added to the run.
- **Test-strength review.** Every expected value is an independent literal: call-name lists, `[60.0] * 5`, reason prefixes and the 6-request count, never a value read back from the code under test (failure 1). Failure 2, the wrong property, was found and fixed for (d) as Open Gap 1 describes. A `MagicMock` accepts `start_instrument()` whether or not the runner declares it, so T003 asserts the recorded call, not acceptance (failure 3). T015's greps were checked against the code this plan describes, so neither contradicts a task (failure 4): the `UPDATE` grep scans only `runner.py`'s added lines, which carry no SQL, and the retry-column grep excludes the T007 seed text and, through `-w`, `max_attempts`.
- **Floating point.** With `FakeClock(1_762_560_000.0)` the jitter-`0.0` sleeps are exact multiples of 60. Under jitter `0.999` the per-stock total comes to about 240.12 s, far from the 300 s bound, as a planning-time simulation of S2's design algorithm showed. So the `<= 300` assertions carry no rounding risk.
- **Socket guard.** `forbid_sockets` patches `socket.getaddrinfo`, which psycopg 3.3's sync connect calls, so the harness is built inside each test after the database fixture. `RecordingMakeRequest` replaces urllib3's `_make_request` process-wide; that is safe because the session container is started by fixture setup before the test body and stopped after `monkeypatch` is undone.
- **Credential case.** DAC-E8-S4-5 names `test_runner_credential.py`, but that file exercises the client factory and polling loop. The runner's `CredentialRejected` path is proved by `test_runner_outcomes.py::test_rejected_credential_fails_the_run_with_its_reason`. T011 runs both, and T008 adds the refusal-then-credential sequence that no delivered test covers.
- **Release coupling.** E8-S3 and E8-S4 land and release together (owner decision 2026-11-08). This plan creates no release artifact. The coder must not open a pull request or release build from a commit that holds E8-S3 without T010.
- **Logging.** `ingestion_main.py` configures no logging, so the runner's `log.info` reasons are not emitted in production. That is a separate follow-up and out of scope here; this plan adds no logging.
