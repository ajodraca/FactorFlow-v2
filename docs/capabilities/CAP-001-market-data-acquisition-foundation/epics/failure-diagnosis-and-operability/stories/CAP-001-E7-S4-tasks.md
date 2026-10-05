---
artifact_schema_version: 1
artifact_id: CAP-001-E7-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-02
updated: 2026-10-02
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: devin
  tool: Devin
  tool_version: "unknown"
  timestamp: 2026-10-02T04:33:42Z
  source_artifacts:
    - id: CAP-001-E7-S4
      version: "1"
    - id: CAP-001-E7
      version: "1"
    - id: CAP-001
      version: "8"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-ux-brief
      version: "7"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
    - id: CAP-001-component-tests
      version: "1"
    - id: CAP-001-coverage-matrix
      version: "1"
    - id: CAP-001-E7-S1-tasks
      version: "1"
    - id: CAP-001-E7-S2-tasks
      version: "1"
    - id: CAP-001-E5-S6-tasks
      version: "2"
    - id: STD-UI
      version: "4"
    - id: tech-stack
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E7-S4 — Run Detail Screen

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E7-tasks-20261002T034533Z`
**Date**: 2026-10-02

## Summary

An owner-operator whose run failed needs to open it and see which instrument and which data type was affected, and why, so they can fix the cause and run again. This story delivers `web/src/screens/runs/detail`, the run-detail child route under Runs (ux-design §1.5, owner-web-app §2.3). Today `/runs/:runId` renders `RunDetailPlaceholder` in `web/src/app/routes.tsx`.

The screen has two parts:

- A **summary** (`card` `summary`). It shows the run's outcome badge, its timestamps and counts, the abandoned-run explanation, the **Cancel run** action while the run can be cancelled, and **Re-run acquisition** as the named recovery for `failed` and `partial` runs.
- An **instrument roster** (`data-table` `expandable`). It has one collapsed row per instrument, expanding to that instrument's per-data-type results. Each result carries an outcome badge, and every failure states its operation, resource and reason (STD-UI-19). The roster has an outcome filter and keyset page controls. It is served failure-first by the API.

While the run is non-terminal, the screen polls `GET /api/acquisition-runs/{id}` every 10 seconds and stops once the run is terminal.

The plan reuses the CAP-001-E5-S6 run controls rather than rebuilding them: `CancelRunControl`, `StartRunControl`, `OutcomeBadge`, `ABANDONED_EXPLANATION`, `RUN_STATE_LABEL` and the run fetch layer. It makes two small additive changes to those controls (Open Gaps P3, P4).

The plan consumes the run-detail contract **as CAP-001-E7-S1's plan declares it**: `counts.results_by_outcome` (DEC-0007) and `symbol` on each result row (DEC-0008), both provisional. E7-S1 is not implemented yet, so this story cannot be coded until it lands (hard edge, already in the graph).

No backend file changes.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-10 | A failed or partial run, when opened, shows per-instrument, per-data-type reasons. | T001, T003, T011, T017, T018, T019, T022, T023, T024, T026 |
| AC-11 | An unrecognised instrument is distinguished from other failures. | T003, T004, T017, T020, T023, T026 |
| AC-19 | A running run offers a cancel action and shows the `cancelling` state. | T008, T013, T016, T021, T022, T024, T026 |
| AC-26 | Cancelling a queued run shows its own confirmation copy, then an immediate cancelled state with no started time. | T008, T016, T022, T024, T026 |
| DAC-E7-9 | At 3000 instruments, the roster collapses to one row per instrument and expands to four data types. | T002, T017, T023, T026 |
| DAC-E7-11 | Every status carries a text label plus an icon or shape. | T005, T012, T020, T022, T023, T026 |
| DAC-E7-2 | `not_found` is distinguishable from `failed`. | T004, T012, T017, T020, T023, T026 |
| DAC-E7-S4-1 | An abandoned run shows the written explanation and the path to a new run. | T007, T022, T026 |
| DAC-E7-S4-2 | A failed or partial run offers re-run as the named recovery action. | T007, T013, T017, T021, T022, T026 |
| DAC-E7-S4-3 | A `409` on a cancel that raced completion states that the run completed. | T008, T013, T016, T021, T024, T026 |
| DAC-E7-S4-4 | `not_found` uses a warning tier distinct from `failed`. | T004, T012, T020, T026 |
| DAC-E7-S4-5 | A reason shows its data type and the provider request id, and never a credential. | T006, T011, T015, T019, T023, T026 |
| DAC-E7-S4-6 | A non-terminal run polls every 10 seconds and stops once the run is terminal. | T010, T024, T026 |
| DAC-E7-S4-7 | An outcome filter renders only matching instruments, and results page rather than loading 3000 rows at once. | T009, T011, T017, T019, T023, T024, T026 |

## Phase 1: Setup

**Purpose**: Confirm that every producer this screen imports or consumes has landed, and record a green baseline before any change (TEST-TDD-007).

- [x] T001 Before you edit any file, verify these exist as described:
  - **CAP-001-E7-S1** has landed. `GET /api/acquisition-runs/{id}` returns `counts.results_by_outcome.{written,unchanged,not_found,failed,skipped}` and `results[].symbol` (`src/factorflow/api/models.py` `OutcomeCounts`, `RunCounts.results_by_outcome`, `ResultRow.symbol`). An unknown `outcome` returns `422`. **Stop if it has not landed.** Every roster task depends on it.
  - **CAP-001-E5-S5's run detail contract**:
    - per-instrument keyset paging by `limit` instruments, default 50 (`src/factorflow/api/bounds.py` `DEFAULT_PAGE_SIZE`);
    - failure-first order `(has_failure DESC, symbol, instrument_id)`;
    - with an outcome filter, only the matching rows of each matching instrument;
    - `next_cursor` null on the last page;
    - `404` `not_found` for an unknown id;
    - `409` `run_already_terminal` with `error.state` on cancel.
  - **CAP-001-E5-S6's controls**:
    - `CancelRunControl({runId, state, onSettled?})` in `web/src/screens/runs/cancel-run.tsx`;
    - `StartRunControl(props)` in `web/src/screens/runs/run-controls.tsx`;
    - `OutcomeBadge`, `RUN_STATE_TIER`, `RUN_STATE_LABEL`, `ABANDONED_EXPLANATION`, `isRunState`, `isNonTerminalRunState` and the private `TierIcon` / `TIER_CLASSES` in `web/src/screens/runs/outcome-badge.tsx`;
    - `RunState`, `AcquisitionRun`, `RunCancelResult` and `RunStartResult` in `web/src/api/types.ts`;
    - `requestJson`, `toApiError`, `ApiError{requestId, code, state}`, `toAcquisitionRun`, `WireRun`, `startAcquisitionRun` and `cancelAcquisitionRun` in `web/src/api/client.ts`.
  - **CAP-001-E1-S5's** `formatTimestamp` in `web/src/app/status-region.tsx`.
  - **CAP-001-E1-S4's** `/runs/:runId` route and `RunDetailPlaceholder` in `web/src/app/routes.tsx`, plus `web/src/app/routes.test.tsx` (TC-COMP-330 renders `/runs/run-123` inside `Shell`).

  Then run `npm run test`, `npx tsc --noEmit` and `npm run lint`, and record them green as the baseline. Stop if any seam differs from this description (prerequisite infrastructure; traces to AC-10).

**Checkpoint**: Every producer seam exists as described, E7-S1's additive detail fields are on the wire, and the web suite is green and unmodified.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the fourteen mapped component tests and the additional unit and E2E tests. Observe RED for every new behaviour before writing production code (TEST-TDD-001, TEST-TDD-002).

Fourteen TC-IDs are mapped: TC-COMP-010, 011, 019, 026, 067, 074, 076, 092, 093, 094, 095, 096, 097 and 098. The component test spec's steps for every one of them are generic boilerplate. The concrete assertions below are sharpened from the AC each one traces to.

**Shared harness for T002–T009.**

- These tasks share the new file `web/src/screens/runs/run-detail.test.tsx`, the name owner-web-app §7 gives it, so they run serially.
- Mock `getAcquisitionRun`, `cancelAcquisitionRun` and `startAcquisitionRun` through `vi.mock("../../api/client", …importActual…)`, following `web/src/screens/runs/cancel.test.tsx`.
- Render through `<MemoryRouter initialEntries={["/runs/r-1"]}><Routes><Route path="/runs/:runId" element={<RunDetailScreen />} /><Route path="/runs/:other" … /></Routes></MemoryRouter>`, so navigation after a start is observable.
- Build fixtures with a local `detail(run, results, {nextCursor, resultsByOutcome})` helper over the `RunDetail` type from T018.

### Mandatory Component Tests

- [x] T002 In `web/src/screens/runs/run-detail.test.tsx`, add `// Implements TC-COMP-074` (DAC-E7-9). Use a `partial` run with `instrumentsNamed: 3000` and a first page of 50 instruments × 4 data types (200 result rows), with `nextCursor: "c1"`. Assert:
  - the roster renders exactly 50 instrument rows and no data-type row;
  - each instrument row's expander is a `button` with `aria-expanded="false"`, and its accessible name identifies the row: *Show data types for S0001* (owner-web-app §10, "Expander accessible names identify their row");
  - activating S0001's expander, by click and by `Enter`, sets `aria-expanded="true"` and renders exactly four data-type rows under it, in the fixed order *Reference*, *Prices*, *Fundamentals*, *Corporate actions*, whatever the order of the API rows;
  - every other instrument stays collapsed;
  - activating the expander again collapses S0001.

  Observe RED (depends on T001; traces to DAC-E7-9).
- [x] T003 In `web/src/screens/runs/run-detail.test.tsx`, add `// Implements TC-COMP-010` and `// Implements TC-COMP-011`. Use a `partial` run with:
  - `AAPL`: `prices` `failed`, with reason `[failed] symbol=AAPL data_type=prices request_id=req-1: upstream returned 503`, and the other three data types `written`;
  - `ZZZZ`: all four data types `not_found`, with reasons carrying `request_id=req-2`;
  - `MSFT`: four `written`.

  Expand all three and assert:
  - **AC-10.** AAPL's *Prices* row states the three STD-UI-19 parts in one sentence: *Acquiring prices for AAPL failed:* followed by the reason verbatim. This is the operation, the resource and the reason (owner-web-app §7 "Failure states three parts").
  - **AC-11.** ZZZZ's rows read *Acquiring … for ZZZZ: not found at the provider.* with the reason. The word *failed* appears nowhere in ZZZZ's rows. MSFT's `written` rows still render, so the run is visibly shown to have continued past the unrecognised instrument (owner-web-app §7 "Unrecognised is distinguished… Not rendered as a run failure").

  Observe RED (depends on T002; traces to AC-10, AC-11).
- [x] T004 In `web/src/screens/runs/run-detail.test.tsx`, add `// Implements TC-COMP-067` and `// Implements TC-COMP-095`. With T003's fixture, assert that a `not_found` result badge and a `failed` result badge differ in all three of:
  - text: *Not found* versus *Failed*;
  - `data-variant`: exactly `status-warning` versus exactly `status-critical`;
  - icon: `svg[data-icon]` `warning` versus `critical`.

  Assert the same on the collapsed rows' outcome badges (Open Gap P1). Observe RED (depends on T003; traces to DAC-E7-2, DAC-E7-S4-4, AC-11).
- [x] T005 In `web/src/screens/runs/run-detail.test.tsx`, add `// Implements TC-COMP-076`. Assert both of the following:
  - **Run states.** For each of the eight `RunState`s rendered as the run (`it.each`), the summary's outcome badge has non-empty text equal to `RUN_STATE_LABEL[state]` and an `svg[data-icon]` child.
  - **Result outcomes.** For each of the five result outcomes, the data-type badge has its label text and an `svg[data-icon]` child.

  Also assert that `failed` and `not_found` have different `data-icon` values, so the two remain distinguishable in greyscale (STD-UI-8). Observe RED (depends on T004; traces to DAC-E7-11).
- [x] T006 Create `web/src/screens/runs/run-detail.reason.test.tsx` with `// Implements TC-COMP-096`. This file does **not** mock the client. It stubs `fetch` with a wire-shaped `GET /api/acquisition-runs/r-1` body, so the real `getAcquisitionRun` mapping is exercised. Use a synthetic constant `SECRET = "sk-e7s4-credential-like-0000"`.
  - Give one `failed` `fundamentals` row for `MSFT` the reason that `compose_failure_reason` would store after redaction: `[provider_unavailable] symbol=MSFT data_type=fundamentals request_id=req-e7s4-001: upstream error key=[redacted]`.
  - Put `SECRET` only in fields the contract does not define: an extra `api_key` on that result row and an extra `credential` on `run`.
  - Give a second row the reason `<img src=x onerror="alert(1)">`.

  Expand `MSFT` and assert:
  - the row shows the data-type label *Fundamentals* and the text `req-e7s4-001`;
  - `document.body.innerHTML` does not contain `SECRET`;
  - the markup reason renders as literal text, and the document has no `img` element (owner-web-app §4).

  Observe RED (depends on T001; traces to DAC-E7-S4-5).
- [x] T007 In `web/src/screens/runs/run-detail.test.tsx`, add `// Implements TC-COMP-092` and `// Implements TC-COMP-093`.
  - **Abandoned (TC-COMP-092).** An `abandoned` run shows `ABANDONED_EXPLANATION` verbatim beside a `status-serious` badge, plus a *Start acquisition run* button (`StartRunControl` with its default label). Those are "the path to starting a new run".
  - **Re-run offered (TC-COMP-093).** For `failed` and `partial` runs (`it.each`):
    - a *Re-run acquisition* button with `data-variant="default"` renders;
    - the recovery sentence *Re-running is safe: data already recorded is not duplicated or overwritten.* renders;
    - clicking the button calls `startAcquisitionRun` once and navigates to `/runs/<new id>`.
  - **Re-run absent.** For `succeeded`, `cancelled`, `requested`, `running` and `cancelling`, neither the re-run button nor the sentence renders. For `abandoned`, the Start button renders but the re-run button does not.

  Observe RED (depends on T005; traces to DAC-E7-S4-1, DAC-E7-S4-2).
- [x] T008 In `web/src/screens/runs/run-detail.test.tsx`, add `// Implements TC-COMP-019`, `// Implements TC-COMP-026` and `// Implements TC-COMP-094`.
  - **AC-19 (running run).**
    - The summary offers *Cancel run*.
    - Confirming *Stop run* with `cancelAcquisitionRun` resolving `{state: "cancelling"}`, and the refetch returning the run `cancelling`, leaves the summary badge reading *Cancelling* with `status-warning`.
    - *Cancel run* is no longer in the document.
    - Exactly one *Cancelling* badge is rendered, not two (Open Gap P4).
  - **AC-26 (queued run).**
    - A `requested` run's dialog heading is *Cancel this queued run?*.
    - Confirming *Cancel queued run* with `{state: "cancelled"}`, and the refetch returning `cancelled` with `startedAt: null`, shows *Cancelled* as `status-neutral`.
    - The *Started* cell holds the em dash and the screen-reader text *Not recorded*.
    - The text *Cancelling* never appears.
  - **DAC-E7-S4-3 (the cancel raced completion).**
    - `cancelAcquisitionRun` rejects with `ApiError("…", "req-3", {code: "run_already_terminal", state: "succeeded"})`, and the refetch returns `succeeded`.
    - *This run had already completed.* renders, and the outcome reads *Succeeded*.
    - `document.body` matches neither `/Cancelled/` nor `/Cancelling/`.

  Observe RED (depends on T007; traces to AC-19, AC-26, DAC-E7-S4-3).
- [x] T009 In `web/src/screens/runs/run-detail.test.tsx`, add `// Implements TC-COMP-098`. Assert:
  - **Initial load.** The initial call is `getAcquisitionRun("r-1", {})`, with no `limit`, `outcome` or `cursor`, so the server default page applies and 3000 rows are never requested at once.
  - **Filter.** Choosing *Not found* in the *Outcome* `select` (`data-variant="inline"`) calls `getAcquisitionRun("r-1", {outcome: "not_found"})`. Only the instruments in that response render, and focus stays on the `select`. A polite live region announces *2 instruments shown*.
  - **Filtered expansion.** Expanding an instrument under the filter renders only the rows the response returned. It renders no row for the data types the filter excluded, because with a filter the API returns only matching rows (CAP-001-E7-S1-tasks Other Notes).
  - **Empty filter.** A filtered response with no results shows *No instrument in this run matches this filter.* (ux-design §1.5, verbatim) and a *Reset filter* button. The button restores `{}`.
  - **Paging.**
    - With `nextCursor: "c1"`, *Next page* calls `{outcome: "not_found", cursor: "c1"}`. The roster then shows only page 2's instruments, not pages 1 and 2 together, and *Page 2* is shown.
    - *Previous page* calls the page-1 request again (no cursor).
    - *Previous page* is absent on page 1, and *Next page* is absent when `nextCursor` is `null`.
    - Changing the filter returns to page 1.

  Observe RED (depends on T008; traces to DAC-E7-S4-7, DAC-E7-10).
- [x] T010 [P] Create `web/src/screens/runs/run-detail.polling.test.tsx` with `// Implements TC-COMP-097`. Use pure fake timers and an `advance(ms)` helper, as `web/src/screens/runs/runs-screen.polling.test.tsx` does.
  - **Non-terminal runs.** For `requested`, `running` and `cancelling` (`it.each`):
    - one call on mount;
    - no second call at 9 999 ms;
    - exactly one more call at 10 000 ms, with the same `{outcome, cursor}` the view currently shows.
  - **Stop on terminal.** When the response turns `partial`, no further call happens over another 30 000 ms.
  - **Terminal on first load.** A terminal run on first load never polls.
  - **Error.** A poll that rejects shows the error and stops polling.
  - **Unmount.** Unmounting clears the pending timer.
  - **Expansion survives a poll.** An instrument expanded before a poll is still expanded after it.
  - **Last updated.** *Last updated* changes after each poll (STD-UI-25).

  Observe RED (depends on T001; traces to DAC-E7-S4-6, AC-19).

### Additional Unit Tests

- [x] T011 [P] Extend `web/src/api/client.runs.test.ts`, keeping every existing case unchanged:
  - **Path and query.** `getAcquisitionRun("a b", {})` requests `/api/acquisition-runs/a%20b`. `{outcome: "failed", cursor: "c1"}` adds exactly those two query parameters, and `{}` adds none.
  - **Mapping.** A wire body maps to camelCase:
    - `run` through the existing `toAcquisitionRun`;
    - `counts.instruments_*` to `counts.instrumentsNamed` and the other two persisted counts;
    - `counts.results_by_outcome` to `counts.resultsByOutcome` with the five keys;
    - `results[]` to `{instrumentId, symbol, dataType, outcome, reason, attempts, completedAt}`;
    - `next_cursor` to `nextCursor`.
  - **Unknown fields dropped.** Fields outside the contract are absent from the mapped object.
  - **Errors.**
    - A `404` envelope rejects with `ApiError` carrying `code: "not_found"` and the `request_id`.
    - A `500` carrying only `{"error": {"code": "internal_error", "request_id": "r"}}`, which is CAP-001-E7-S2's planned shape with no `message`, still yields `requestId: "r"`.
    - A transport failure rejects with `ApiUnreachableError`.

  Observe RED (depends on T001; traces to AC-10, DAC-E7-S4-5, DAC-E7-S4-7).
- [x] T012 [P] Create `web/src/screens/runs/detail/result-outcome-badge.test.tsx`. Assert that `RESULT_OUTCOME_TIER` covers exactly the five `ResultOutcome` values, with this mapping:

  | Outcome | Tier |
  |---------|------|
  | `written` | good |
  | `unchanged` | good |
  | `not_found` | warning |
  | `failed` | critical |
  | `skipped` | warning |

  Also assert:
  - `ResultOutcomeBadge` renders `data-testid="result-outcome-badge"`, `data-variant="status-<tier>"`, the label from `RESULT_OUTCOME_LABEL` (*Written*, *Unchanged*, *Not found*, *Failed*, *Skipped*) and an `svg[data-icon="<tier>"]`;
  - every tier is one of `good`, `warning` or `critical`, the three variants ux-design §1.5 maps for per-data-type outcomes.

  Observe RED (depends on T001; traces to DAC-E7-2, DAC-E7-S4-4, DAC-E7-11).
- [x] T013 [P] Add separately named cases, without modifying any existing case:
  - **`web/src/screens/runs/run-controls.test.tsx`** (Open Gap P3).
    - `<StartRunControl label="Re-run acquisition" />` renders a button with exactly that accessible name.
    - The control keeps its blocked, queued and navigation behaviour.
    - Omitting `label` still yields *Start acquisition run* (DEC-0004).
  - **`web/src/screens/runs/cancel.test.tsx`** (Open Gap P4).
    - After a `202` `cancelling`, re-rendering `CancelRunControl` with `state="cancelling"` and then `state="cancelled"` renders nothing, because the parent now shows the state. A stale *Cancelling* badge must not remain.
    - After a `409` `run_already_terminal`, re-rendering with the terminal `state` keeps *This run had already completed.* and the actual outcome.

  Observe RED (depends on T001; traces to AC-19, DAC-E7-S4-2, DAC-E7-S4-3).
- [x] T014 [P] Update `web/src/app/routes.test.tsx`:
  - Add `getAcquisitionRun: vi.fn().mockResolvedValue(<a terminal succeeded RunDetail with no results>)` to the existing `vi.mock("../api/client", …)` list, so TC-COMP-330's `/runs/run-123` render no longer reaches the global health `fetch` stub with a run request.
  - Add a separately named case. At `/runs/run-123` inside `Shell`, the main region shows the run-detail heading *Run run-123*, not the text *Run detail* from the placeholder, and *Runs* stays the active rail item (DAC-E1-S4-2).

  Keep the five-route source assertion unchanged, because the route path does not change. Observe RED on the new case (depends on T001; traces to AC-10).
- [x] T015 [P] Create `web/src/api/render.test.tsx`, the file owner-web-app §7 names for "No raw HTML injection". Read every `*.ts` and `*.tsx` under `web/src` with `node:fs`, following the `readFileSync` pattern in `web/src/app/routes.test.tsx`, and assert that none contains `dangerouslySetInnerHTML`. Skip this test file itself. This passes against current code, so record it as characterization (TEST-TDD-007). Its markup-as-text counterpart is in T006 (depends on T001; traces to DAC-E7-S4-5).
- [x] T016 Create `tests/e2e/support/database.ts`, exporting `sql(statement: string): string`. It runs `execFileSync("docker", ["exec", "-e", "PGPASSWORD=postgres", "factorflow-e2e-postgres", "psql", "--host=127.0.0.1", "--username=postgres", "--dbname=factorflow", "--no-password", "--tuples-only", "--no-align", "-v", "ON_ERROR_STOP=1", "--command", statement])` and returns trimmed stdout. The container name and credentials are those `scripts/run-e2e-server.sh` creates (see Other Notes, "E2E seeding").

  Then create `tests/e2e/cancel-run.spec.ts`, the owner-web-app §7 "Cancel a run" file. It runs three serial tests, and an `afterEach` moves any seeded `running` or `cancelling` run to `cancelled` (`ended_at = now()`, `claimed_by = NULL`, `heartbeat_at = NULL`). That cleanup frees the single-active-run slot, so the later `runs-start-cancel.spec.ts` still navigates on start.
  1. **Queued run (AC-26).**
     - Set depth and add `MSFT` through the API, as `runs-start-cancel.spec.ts` does.
     - Click *Start acquisition run* on `/runs`, then arrive on `/runs/<id>`.
     - Click *Cancel run*. The dialog heading is *Cancel this queued run?*.
     - Click *Cancel queued run*. The summary badge reads *Cancelled*, the *Started* cell reads *Not recorded*, and the page never shows *Cancelling*.
  2. **Running run (AC-19).**
     - `sql(...)` inserts a `running` run with `started_at`, `claimed_by = 'e2e-seed'` and `heartbeat_at = now()`.
     - Open its detail, click *Cancel run*, then *Stop run*.
     - The badge reads *Cancelling*, and *Cancel run* is gone. It stays *Cancelling* across one poll, because there is no runner.
  3. **Cancel raced completion (DAC-E7-S4-3).**
     - Seed a `running` run and open its dialog.
     - Before confirming, `sql(...)` moves the run to `succeeded` with `ended_at = now()`.
     - Click *Stop run*. *This run had already completed.* and *Succeeded* render, and *Cancelling* never appears.

  Observe RED (depends on T001; traces to AC-19, AC-26, DAC-E7-S4-3).
- [x] T017 Create `tests/e2e/run-detail.spec.ts`. Add `DIAGA` and `DIAGZ` through `POST /api/instruments`. Then, with `sql(...)`, seed a `partial` run that has `started_at`, `ended_at` and `instruments_named = 2`, plus eight `run_instrument_result` rows:
  - `DIAGA`: `prices` `failed`, reason `[failed] symbol=DIAGA data_type=prices request_id=req-e2e-1: upstream returned 503`; the other three data types `written`;
  - `DIAGZ`: four `not_found`.

  Look up the instrument ids with `SELECT instrument_id FROM instrument WHERE symbol = …`. Open `/runs/<id>` and assert:
  - there are two collapsed instrument rows and no data-type row;
  - expanding `DIAGA` shows *Reference*, *Prices*, *Fundamentals* and *Corporate actions*;
  - the *Prices* row reads *Acquiring prices for DIAGA failed:* with `req-e2e-1`;
  - expanding `DIAGZ` shows *Not found* badges with `data-variant="status-warning"`, while `DIAGA`'s *Failed* badge is `status-critical`;
  - *Re-run acquisition* is visible;
  - choosing *Not found* in the *Outcome* filter leaves only the `DIAGZ` row.

  This covers the story's "expanding an instrument to its data types" E2E. Observe RED (depends on T016; traces to AC-10, AC-11, DAC-E7-9, DAC-E7-2, DAC-E7-S4-2, DAC-E7-S4-7).

**Checkpoint**: All fourteen mapped TC-IDs carry `// Implements` trace comments. RED is observed and recorded for T002–T014, T016 and T017. T015 is recorded as characterization. No existing test is modified except T014's mock addition.

---

## Phase 3: Core Implementation

**Purpose**: Add the run-detail types, the fetch call, the per-data-type badge, the two additive control changes and the screen's components. This is the minimum that turns Phase 2 green.

- [x] T018 Update `web/src/api/types.ts`, additively. Add:
  - `export type DataType = "reference" | "prices" | "fundamentals" | "corporate_actions";` (the `run_result_data_type_known` DDL; `ResultRow.data_type` in `src/factorflow/api/models.py`);
  - `export type ResultOutcome = "written" | "unchanged" | "not_found" | "failed" | "skipped";` (`run_result_outcome_known`; `ResultOutcome` in `models.py`);
  - `export interface OutcomeCounts { written: number; unchanged: number; notFound: number; failed: number; skipped: number; }` (DEC-0007);
  - `export interface RunResult { instrumentId: number; symbol: string; dataType: DataType; outcome: ResultOutcome; reason: string | null; attempts: number; completedAt: string; }` (DEC-0008 for `symbol`);
  - `export interface RunDetail { run: AcquisitionRun; counts: { instrumentsNamed: number; instrumentsWritten: number; instrumentsFailed: number; resultsByOutcome: OutcomeCounts }; results: RunResult[]; nextCursor: string | null; }`.

  Each comment cites `RunDetailResponse` in `src/factorflow/api/models.py`, ingestion-api §11, and the E7-S1 additions. Leave `RunSummary`, `HealthResponse` and every E5-S6 type unchanged. CAP-001-E7-S3 owns the health `RunSummary` (depends on T001; satisfies AC-10, DAC-E7-S4-7).
- [x] T019 Update `web/src/api/client.ts`:
  - Add `export interface RunDetailFilters { outcome?: ResultOutcome; cursor?: string; }`.
  - Add `export async function getAcquisitionRun(runId: string, filters: RunDetailFilters = {}): Promise<RunDetail>`. It sends `GET /api/acquisition-runs/${encodeURIComponent(runId)}`, through `requestJson`, with only the present filters as query parameters, as `listAcquisitionRuns` does. It sends no `limit`, so the server's `DEFAULT_PAGE_SIZE` applies (Open Gap P2).
  - Map the wire body explicitly, field by field, through `toAcquisitionRun` and a new `toRunResult`, so any field outside the contract is dropped (DAC-E7-S4-5).
  - Write a doc comment naming CAP-001-E5-S5, CAP-001-E7-S1, DAC-E7-10 and the `404` / `422` rejections.

  Leave `toApiError` and the existing functions unchanged (depends on RED from T011; satisfies AC-10, DAC-E7-S4-5, DAC-E7-S4-7).
- [x] T020 [P] Update `web/src/screens/runs/outcome-badge.tsx`:
  - Add `export` to `TierIcon` and `TIER_CLASSES`. Change nothing else, so every `outcome-badge.test.tsx` case stays green.

  Create `web/src/screens/runs/detail/result-outcome-badge.tsx`, exporting:
  - `RESULT_OUTCOME_TIER: Record<ResultOutcome, RunTier>` (Open Gap P1);
  - `RESULT_OUTCOME_LABEL: Record<ResultOutcome, string>`;
  - `RESULT_OUTCOME_ORDER: ResultOutcome[] = ["failed", "not_found", "skipped", "unchanged", "written"]`, for the collapsed row;
  - `ResultOutcomeBadge({outcome})`, the same `badge` markup as `OutcomeBadge`, using `TierIcon` and `TIER_CLASSES`, with `data-testid="result-outcome-badge"`.

  Cite ux-design §1.5's per-data-type variants, the acquisition-runner §2.4 outcome table and STD-UI-8/12 in comments (depends on RED from T012; satisfies DAC-E7-2, DAC-E7-S4-4, DAC-E7-11, AC-11).
- [x] T021 [P] Make two additive control changes, keeping each component's exported name and every existing prop:
  - **`web/src/screens/runs/run-controls.tsx` (Open Gap P3).**
    - Add `label?: string` to `StartRunControlProps`, defaulting to `"Start acquisition run"`, and render it as the button text.
    - Extend the docstring to say CAP-001-E7-S4 passes *Re-run acquisition*.
    - Change no other behaviour.
  - **`web/src/screens/runs/cancel-run.tsx` (Open Gap P4).**
    - In the `settled !== null` branch, return `null` when `!settled.alreadyCompleted` and the `state` prop is no longer `requested` or `running`. The owning screen has observed the run's newer state and shows it, so the control's own badge would be stale.
    - Extend the docstring.

  All existing `run-controls.test.tsx` and `cancel.test.tsx` cases must stay green unmodified (depends on RED from T013; satisfies AC-19, DAC-E7-S4-2, DAC-E7-S4-3).
- [x] T022 Create `web/src/screens/runs/detail/run-summary.tsx`, exporting `RunSummaryCard({detail, fetchedAt, onRunChanged})`. Render a `section` with `data-variant="summary"`, and use `card` tokens following the existing utility-class style (`rounded border border-border p-5`). It contains:
  - **Outcome.** `OutcomeBadge` for `detail.run.state`.
  - **Abandoned explanation.** When the run is `abandoned`, `ABANDONED_EXPLANATION` in a `p` with `data-testid="abandoned-explanation"`, then `<StartRunControl />` with the default label. Together these are the path to a new run (DAC-E7-S4-1).
  - **Timestamps.** *Requested*, *Started* and *Ended* as a description list. Each uses `formatTimestamp` from `web/src/app/status-region.tsx`, or the em dash plus `sr-only` *Not recorded* when the value is null, matching `run-table.tsx`'s `Timestamp` (AC-26: no started time).
  - **Progress.** An `aria-live="polite"` progress line, *{written} written and {failed} failed of {named} named instruments*, from the persisted counts. It has no estimated time remaining and no progress indicator (ux-design §1.5 "Progress"; owner-web-app §14 OQ 1).
  - **Result counts.** One line of per-outcome result counts from `counts.resultsByOutcome`, each with its `RESULT_OUTCOME_LABEL`, in `--font-numeric`.
  - **Last updated.** *Last updated {formatTimestamp(fetchedAt)}* (STD-UI-25).
  - **Cancel.** `<CancelRunControl key={detail.run.runId} runId={…} state={detail.run.state} onSettled={onRunChanged} />`. It is **always mounted**, because the control renders nothing when it does not apply. A conditional mount would unmount its *This run had already completed.* message on the refetch that follows a `409` (DAC-E7-S4-3).
  - **Re-run.** For `failed` and `partial` only, the sentence *Re-running is safe: data already recorded is not duplicated or overwritten.*, then `<StartRunControl label="Re-run acquisition" />` (DAC-E7-S4-2, AC-6). It passes no precondition props, so a refused re-run renders `blocked` from the API's `409` code (DEC-0004/DEC-0005 Open Gap 9 precedent).

  (depends on T018, T020, T021; satisfies AC-19, AC-26, DAC-E7-S4-1, DAC-E7-S4-2, DAC-E7-11).
- [x] T023 Create `web/src/screens/runs/detail/instrument-roster.tsx`. Export `groupByInstrument(results: RunResult[])`, which groups consecutive rows by `instrumentId`, preserves the server's failure-first order and takes `symbol` from the first row. Also export `InstrumentRoster({results, busy, expanded, onToggle})`. Render a `table` with `data-variant="expandable"` and `aria-busy={busy}`, with these columns:
  - an expander column with a visually hidden header *Expand*;
  - *Instrument*;
  - *Outcomes*.

  Each instrument renders a collapsed row:
  - the expander is a `button` with `aria-expanded`, `aria-controls` and the accessible name *Show data types for {symbol}* or *Hide data types for {symbol}*;
  - the symbol is a `th scope="row"`;
  - the *Outcomes* cell shows one `ResultOutcomeBadge` per distinct outcome among that instrument's rows, in `RESULT_OUTCOME_ORDER`.

  When an instrument is expanded, its returned rows render beneath it in the fixed order `reference`, `prices`, `fundamentals`, `corporate_actions`. Each row has:
  - a `th scope="row"` with *Reference*, *Prices*, *Fundamentals* or *Corporate actions* (ux-design §1.1 column names);
  - its `ResultOutcomeBadge`;
  - a detail cell, built as follows:

    | Outcome | Detail cell |
    |---------|-------------|
    | `failed` | *Acquiring {data type, lower-case} for {symbol} failed:* plus the reason, or *No reason was recorded.* |
    | `not_found` | *Acquiring {…} for {symbol}: not found at the provider.* plus the reason |
    | any other | the reason if present, else empty |

  Render all text as React text children, never as markup. Do not synthesise rows the API did not return. Under an outcome filter, the API returns only matching rows (Open Gap P2) (depends on T018, T020; satisfies AC-10, AC-11, DAC-E7-9, DAC-E7-2, DAC-E7-S4-5).
- [x] T024 Create `web/src/screens/runs/detail/index.tsx` as `export default function RunDetailScreen()`. It reads `runId` with `useParams`.

  **State it holds:**
  - `ScreenState<RunDetail>`;
  - `outcome: ResultOutcome | ""`;
  - a cursor stack `cursors: (string | undefined)[]`, starting as `[undefined]`, with the current page being the last entry;
  - `expanded: Set<number>`;
  - `busy`;
  - `reloadToken`.

  **Loading and polling.** Follow `web/src/screens/runs/index.tsx`. One effect keyed on `[runId, outcome, cursors, reloadToken]` calls `getAcquisitionRun(runId, {outcome?, cursor?})`.
  - On success it sets `populated` with `fetchedAt`, or `empty-no-match` when a filter is set and `results` is empty.
  - It chains exactly one `setTimeout(load, RUN_DETAIL_POLL_INTERVAL_MS)`, with `export const RUN_DETAIL_POLL_INTERVAL_MS = 10_000`, only while `isNonTerminalRunState(run.state)`.
  - On rejection it sets `error` with `message` and `requestId`, and stops.
  - Cleanup sets `cancelled` and clears the timer.

  **Rendering.**
  - The heading is `<h1 className="text-xl">Run <span className="font-numeric">{runId}</span></h1>`.
  - The summary (T022) is kept rendered from the last good response when a later request fails (ux-design §1.5 States: "Body replaced, summary retained, retry offered").
  - The toolbar has the *Outcome* `select` (`data-variant="inline"`, *All* plus the five `RESULT_OUTCOME_LABEL`s). Changing it resets `cursors` to `[undefined]` and does not move focus. An `sr-only` `aria-live="polite"` line reads *{n} instruments shown*.
  - The body shows:
    - while loading: *Loading run…*;
    - an `empty-no-match` result: *No instrument in this run matches this filter.* plus *Reset filter*;
    - a populated, unfiltered run with no results: *No instrument results have been recorded for this run yet.*;
    - otherwise: `InstrumentRoster`.
  - An error replaces the body with `role="alert"` *Loading run {runId} failed: {message} (request {requestId})* and a *Retry* button that bumps `reloadToken` (owner-web-app §8 item 17; DEC-0005 Open Gap 10 copy precedent).
  - The page controls are *Previous page* (only when `cursors.length > 1`), *Page {n}*, and *Next page* (only when `nextCursor !== null`, which pushes it). Each page replaces the rendered rows (Open Gap P2).
  - `onRunChanged` from the summary bumps `reloadToken`, so a cancel's resulting state is fetched at once.

  Keep `expanded` across polls. Write the docstring citing ux-design §1.5, owner-web-app §2.3–2.6 and the produced `ScreenState` variants. Mark `empty-never-populated`, `partial`, `unavailable` and `unreachable` as not produced, with the ux-design §1.5 reasons (depends on T019, T022, T023 and RED from T002–T010; satisfies AC-10, AC-11, AC-19, AC-26, DAC-E7-9, DAC-E7-S4-3, DAC-E7-S4-6, DAC-E7-S4-7).

**Checkpoint**: T002–T013 are green against the screen rendered directly. Every pre-existing `web/src/screens/runs/*.test.tsx` and `web/src/api/client.runs.test.ts` case passes unmodified.

---

## Phase 4: Integration

**Purpose**: Mount the screen on its child route, inside the shell.

- [x] T025 Update `web/src/app/routes.tsx`:
  - Import `RunDetailScreen` from `../screens/runs/detail`.
  - Point `<Route path="/runs/:runId" …>` at `<RunDetailScreen />`.
  - Delete the now-unused `RunDetailPlaceholder`.

  Keep every path string unchanged, so TC-COMP-330/333 and the five-route source assertion stay green. Keep `ScreenPlaceholder` while Coverage still uses it (depends on T024 and RED from T014; satisfies AC-10, DAC-E7-9).

**Checkpoint**: T014 is green inside `Shell`. `npm run build` bundles the route. T016 and T017 pass under `npm run test:e2e` against the real API and PostgreSQL, with E7-S1 landed.

---

## Phase 5: Polish

**Purpose**: Kill mutants on the changed behaviour, run full validation, and keep the per-cycle evidence chain.

- [x] T026 After T002–T025 are green and their T027 entries are complete, run the TEST-TDD-005 and TEST-TDD-006 mutation checks on the changed lines. Strengthen tests until every mutant is killed:
  - **`RESULT_OUTCOME_TIER`.** Make `not_found` `critical` or `failed` `warning`, or swap their labels.
  - **Polling.** Make `RUN_DETAIL_POLL_INTERVAL_MS` `5_000`, poll on terminal states, or omit the `clearTimeout`.
  - **Request shape.** Drop `cursor` or `outcome` from the poll's request, or send a `limit`.
  - **Paging.** Accumulate pages instead of replacing them, or reset `expanded` on poll.
  - **Rendering.** Reorder `groupByInstrument` alphabetically, or render a data-type row the response did not contain.
  - **Controls.** Default `label` to anything but *Start acquisition run*. Mount `CancelRunControl` conditionally. Drop the P4 `null` branch.
  - **Reasons.** Render a reason through `dangerouslySetInnerHTML`.

  Do behaviour-preserving refactoring under TEST-TDD-004, keep the T001 baseline green (TEST-TDD-007), verify the TEST-TDD-001 to TEST-TDD-008 chain, and run every command in the Validation Plan (depends on T002–T025; verifies all story criteria).
- [x] T027 Run this after **each** TDD cycle in T002–T026, not once at the end.
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Append the cycle to `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S4-tdd-evidence.yaml`, beside this story, with `code_review_verdict`, `spec_drift.drift_detected` and its RED/GREEN evidence. Record the characterization cycle (T015) as such, with GREEN-on-arrival evidence instead of a fabricated RED.
  - Do not commit a `REJECTED` or `drift_detected: true` cycle.
  - After the commit, record its `commit_hash` and `tests_executed: true` before the next cycle begins (INV-TDD-002, TEST-TDD-008; traces to no AC).

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

After this plan, `dependencies.yaml` records
`CAP-001-E7-S4: [CAP-001-E1-S4, CAP-001-E1-S5, CAP-001-E5-S5, CAP-001-E5-S6, CAP-001-E7-S1]`. This revision adds two hard edges, E1-S5 and E5-S6. Both are implemented and merged. **CAP-001-E7-S1 is planned but not implemented, so it blocks coding.**

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S4 | hard | Existing edge. T025 modifies `web/src/app/routes.tsx` (the `/runs/:runId` child route), and T014 extends `web/src/app/routes.test.tsx`. The screen renders inside its `Shell`. |
| CAP-001-E1-S5 | hard | **New edge.** T022 imports `formatTimestamp` from `web/src/app/status-region.tsx`, which E1-S5 created. Its `ScreenState` union in `web/src/api/types.ts` is the screen's state type. The edge was already transitive through E5-S6, and is now explicit. |
| CAP-001-E5-S5 | hard | Existing edge. It provides `GET /api/acquisition-runs/{id}` (paging, failure-first order, outcome filter, `404`), `POST …/cancel` (`202`/`409`) and `POST /api/acquisition-runs` (re-run). Their implementations are in `src/factorflow/api/routes/runs.py` and `src/factorflow/runs/queries.py` (commit `89d9e47`). |
| CAP-001-E5-S6 | hard | **New edge.** T020–T024 import and modify `web/src/screens/runs/outcome-badge.tsx`, `cancel-run.tsx` and `run-controls.tsx`. T018 and T019 extend `web/src/api/types.ts` and `web/src/api/client.ts` (`RunState`, `AcquisitionRun`, `toAcquisitionRun`, `ApiError.code/state`). T013 extends its tests. All of these came from commit `1a0eb78`. The E5-S6 plan's Other Notes asked the E7-S4 planner to add this edge. |
| CAP-001-E7-S1 | hard | Existing edge. T018–T024 consume `counts.results_by_outcome` (DEC-0007) and `results[].symbol` (DEC-0008), which its plan's T011–T013 add, plus the `422` for an unknown `outcome`. It is planned and not yet implemented, so T001 stops until it lands. If the owner changes DEC-0007 or DEC-0008, T018, T019, T022 and T023 change with it. |
| CAP-001-E7-S2 | context | Its plan nests the `500` under `error` with no `message`. The existing `toApiError` already reads `body.error.request_id` and falls back to a generic message, so this screen needs nothing from it. T011 pins that tolerance with a fixture of the planned shape. |
| CAP-001-E7-S3 | context | It populates health's `most_recent_run`. It neither supplies nor consumes anything here. The status-region link that would point at this route belongs to E1 (see Open Gaps, backlog gap). |
| CAP-001-E6-S4 | context | It composes `StartRunControl` (DEC-0004). T021's `label` prop is optional and defaults to the existing name, so its composition is unaffected. |
| CAP-001-E5-S1 | context | Named only in Other Notes, as an owner of the run journal where the defect that never writes `instruments_*` sits. Its `migrations/0004_runs.sql` DDL is reached through E5-S5's endpoint and T016's test seeding, and nothing is imported. |
| CAP-001-E5-S3 | context | Named only in Other Notes, as a possible owner of the `finalise` defect, and as another implementer of TC-COMP-019 and TC-COMP-026 at the journal layer. It supplies nothing to this plan. |
| CAP-001-E4-S6 | context | Named only in Other Notes, as a possible owner of the `instruments_*` writes, and as an earlier implementer of TC-COMP-010 and TC-COMP-011 at the runner layer. It supplies nothing to this plan. |

### Task Dependencies

- T001 gates everything.
- T002 → T003 → T004 → T005 → T007 → T008 → T009 run serially because they share `web/src/screens/runs/run-detail.test.tsx`.
- T006, T010, T011, T012, T013, T014 and T015 depend only on T001 and touch separate files (`[P]`).
- T016 → T017, because they share `tests/e2e/support/database.ts`.
- T018 depends on T001.
- T019 depends on T018 and RED from T011.
- T020 depends on T018 and RED from T012.
- T021 depends on RED from T013.
- T022 depends on T018, T020 and T021.
- T023 depends on T018 and T020.
- T024 depends on T019, T022, T023 and RED from T002–T010.
- T025 depends on T024 and RED from T014.
- T026 depends on T002–T025 and their T027 entries.
- T027 is interleaved: it runs after every TDD cycle, before that cycle's commit.

### Parallel Opportunities

- T006 and T010–T015 can be written in parallel with each other and with the T002–T009 chain.
- T020 and T021 touch different files and can run in parallel. T022 and T023 can run in parallel once T018 and T020 exist.
- TEST-TDD-008 still serializes commit and evidence cycles.

### Phase Dependencies

- Phase 1 precedes everything.
- Phase 2's RED for each behaviour precedes the matching Phase 3 or Phase 4 change.
- Phase 3 builds the screen, which Phase 4 mounts on the route.
- The E2E tests (T016, T017) go green only after Phase 4 and E7-S1's backend.
- T027 runs at every commit boundary. T026 is the final mutation and validation pass.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test`; `npm run test:e2e`
- Lint: `npm run lint`
- Format: `npm run format`
- Type check: `npx tsc --noEmit`

These match the story's validation line (`npm run test`, `npm run test:e2e`, `npm run lint`, `npx tsc --noEmit`) plus build and format. No Python file changes. Still run `uv run pytest -m postgres tests/integration/test_api_runs.py` once, to confirm the E7-S1 contract this screen consumes is green on the branch.

### Story-Specific Validation

- `npx vitest run web/src/screens/runs web/src/api web/src/app/routes.test.tsx`. All fourteen mapped TC-IDs carry trace comments and pass.
- AC-10 / AC-11 / DAC-E7-2 / DAC-E7-S4-4:
  - a failed data type reads *Acquiring {type} for {symbol} failed:* plus its reason;
  - `not_found` reads *not found at the provider*;
  - `not_found` and `failed` differ in label, `status-warning`/`status-critical` and icon.
- DAC-E7-9: a 50-instrument page (of a 3000-named run) renders 50 collapsed rows and no data-type row. Expanding one shows its four data types in fixed order.
- DAC-E7-11: every run-state badge and result-outcome badge carries a word and an icon.
- AC-19 / AC-26 / DAC-E7-S4-3:
  - a running run reaches *Cancelling* with the action withdrawn and no duplicate badge;
  - a queued run reaches *Cancelled* with no started time;
  - a `409` says *This run had already completed.* with no cancellation text.
- DAC-E7-S4-1 / DAC-E7-S4-2: abandoned shows the verbatim explanation and *Start acquisition run*. Failed and partial show *Re-run acquisition* with the safety sentence, and the click routes to the new run.
- DAC-E7-S4-5: the request id and data type render. A synthetic secret in non-contract fields is absent from the DOM. A markup reason renders as text. No `dangerouslySetInnerHTML` exists under `web/src`.
- DAC-E7-S4-6: a poll fires at exactly 10 000 ms only while the run is non-terminal, and stops on terminal, error or unmount.
- DAC-E7-S4-7: the filter is server-side, the pages replace each other, and Previous/Next/Reset work. No request carries a `limit`.
- E2E: `npm run test:e2e` runs `cancel-run.spec.ts` and `run-detail.spec.ts` green, and the existing `runs-start-cancel.spec.ts` stays green after them. If no container runtime or Playwright browser is available, report the E2E as not run. Do not present it as green.

---

## Notes

### Resolved Conflicts

- **The story's credential test bullet versus where redaction happens (DAC-E7-S4-5).**
  - *Conflict:* The story's Testing bullet reads "A reason containing a credential-like value is asserted never rendered". Read literally, it asks the interface to detect and strip credentials from reason text.
  - *Resolution:* The interface performs no pattern-based scrubbing. T006 renders the reason in the exact form the write path stores, with the credential already replaced by `[redacted]`. It also proves that a credential-like value outside the contract never reaches the DOM, because the client maps fields explicitly.
  - *Basis:* The AC says the rendered reason "never [shows] any credential". Design normative prose places redaction before storage (run-journal §4) and keeps the credential out of the application and the interface entirely (system design 5.12; owner-web-app §4, "No credential is ever rendered… There is no credential field anywhere"). The interface cannot recognise a value it never holds. AC and design prose outrank a Technical Details bullet, and CAP-001-E7-S1's plan settled the read side the same way.
- **The story's shadcn/ui components versus the code that exists.**
  - *Conflict:* The story names `data-table`, `badge`, `card`, `button` and `dialog`, but no shadcn/ui component is vendored. `web/src/components/` does not exist.
  - *Resolution:* Follow the established local pattern: native elements carrying `data-variant` plus `theme.css` utility classes, as in `outcome-badge.tsx`, `cancel-run.tsx` and `instrument-table.tsx`.
  - *Basis:* Ladder step 5, local precedent. Every implemented screen does this, and no design requires vendoring.
- **owner-web-app §7's file names versus this story's scope.**
  - *Conflict:* §7 lists several test files.
  - *Resolution:* `run-detail.test.tsx`, `render.test.tsx` and `cancel-run.spec.ts` are used as named, with a location note for `run-detail.test.tsx` below. `tests/e2e/diagnose-failure.spec.ts` ("A partial run is opened from the status region… and the re-run completes") is not created. Its entry point is the status region, which this story does not own, and a re-run that completes needs a runner, which the E2E server does not start. The story's own "expanding an instrument" E2E goes to `tests/e2e/run-detail.spec.ts` instead.
  - *Basis:* The story's ACs and Testing bullets define what is delivered, and §7 names files where its rows apply. `run-detail.test.tsx` sits in `web/src/screens/runs/`, where §7 places it. `diagnose-failure.spec.ts`, `first-run.spec.ts`, `accessibility.spec.ts` and `volume.spec.ts` stay with the E2E automation plan (`tests/e2e/e2e-tests-automation-tasks.md` T004–T008, TC-E2E-001–012).
- **Design status labels.**
  - *Conflict:* `component-design-owner-web-app.md` has the body label `**Status:** draft`, but its frontmatter says `status: approved`. `ux-design.md` says `approved_by: Pending review`, but its `approval` block is populated.
  - *Resolution:* Both are treated as approved.
  - *Basis:* The governed frontmatter `status` and `approval` block win, and the body labels are stale.

### Open Gaps

- **PROVISIONAL (P1, DEC-0015) — awaiting owner confirmation (2026-10-02) — per-data-type outcome tiers and labels.**
  - *Undefined:* The UX brief's STD-UI-12 tier table (§12.2) covers only the eight run states. ux-design §1.5 lists the per-data-type badge variants as `status-good`, `status-warning` and `status-critical`, but does not map the five result outcomes to them. DAC-E7-S4-4 fixes only `not_found` = warning, distinct from `failed`. No artifact gives the visible words.
  - *Adopted:*

    | Outcome | Tier | Label |
    |---------|------|-------|
    | `written` | good | *Written* |
    | `unchanged` | good | *Unchanged* |
    | `not_found` | warning | *Not found* |
    | `failed` | critical | *Failed* |
    | `skipped` | warning | *Skipped* |

    The collapsed row shows one badge per distinct outcome, in the order failed, not found, skipped, unchanged, written.
  - *Derivation:*
    - acquisition-runner §2.4 and run-journal §2.5 count `written` and `unchanged` toward `succeeded`, so both are good.
    - `failed` is critical, the STD-UI-12 "Failed" tier.
    - `not_found` is warning, per DAC-E7-S4-4.
    - `skipped` must be one of ux-design §1.5's three variants. Warning matches STD-UI-12's "requested but not effective". It is not good, because nothing was acquired, and it is not critical, because AC-19 forbids styling an owner-intended stop as a fault.
    - The labels capitalise the wire values, following DEC-0005's *Requested*/*Running* precedent. *Not found* keeps the wire meaning: acquisition-runner §2.4 records it per data type, where it can mean "no fundamentals held" as well as "unrecognised".
    - The collapsed-row order is failure-first, matching the roster's default sort (ux-design §1.5).
  - *Rejected:*
    - `skipped` as neutral: this departs from ux-design §1.5's per-data-type variant list.
    - *Unrecognised* for `not_found`: it is wrong for a recognised instrument that holds no fundamentals.
    - A single "worst outcome" badge per collapsed row: it needs an invented precedence, which E7-S1's DEC-0007 rejected for the same reason.
  - *Confidence:* medium. `skipped` is never written in practice, because acquisition-runner §2.4 says a run cancelled before an instrument writes "no row". It ships because the DDL allows it (constraint 9a).
  - *Class:* contained.
  - *Absorb in:* `ux-brief.md` §12.2 tier table and ux-design §1.5 at their next revision.
- **PROVISIONAL (P2, DEC-0016) — awaiting owner confirmation (2026-10-02) — roster paging, page size and polling shape.**
  - *Undefined:* DAC-E7-S4-7 says "results page", and ux-design §1.5 and owner-web-app §2.3 say "polls the same run endpoint while its run is active". Neither says how the owner moves between pages, what page size is used, or what a poll re-fetches when the owner is on a later page or has a filter applied.
  - *Adopted:*
    - **Page size.** Send no `limit`, so the server's `DEFAULT_PAGE_SIZE` = 50 instruments applies (up to 200 result rows).
    - **Page controls.** *Previous page* / *Page n* / *Next page* controls over a client-side cursor stack. Each page **replaces** the rendered rows.
    - **Filter change.** A filter change returns to page 1.
    - **Polling.** Every 10 000 ms, by one chained `setTimeout`, only while `run.state` is non-terminal. Each poll re-requests the current view, with the same `outcome` and `cursor`, and replaces the summary and that page. Expansion state is kept. A failed poll shows the error and stops until *Retry*.
    - **Filtered rows.** Under a filter, an expanded instrument shows only the rows the API returned.
  - *Derivation:*
    - The data-table spec's anatomy item 6 gives "Pagination… page controls".
    - Replacing pages keeps the DOM bounded at one page, which meets owner-web-app §2.6 / §8 item 18 ("without… the DOM growing with the result set") without a virtualisation component the design system does not have (owner-web-app §14 OQ 2).
    - DEC-0005 already pins "first page of 50", the 10 000 ms chained timer and stop-on-terminal for Runs.
    - Re-requesting the current cursor keeps the owner's place, which the data-table spec says a refresh must not lose.
    - The filtered-rows behaviour is the E5-S5 contract (CAP-001-E7-S1-tasks Other Notes). DAC-E7-S4-7 says "only matching instruments render", and the plan does not assume more.
  - *Rejected:*
    - Instruments' "Load more" accumulation: the DOM grows toward 3000 instruments.
    - Polling only page 1: this discards the owner's place.
    - Client-side windowing: no design-system component exists, and it adds a dependency.
  - *Confidence:* medium.
  - *Class:* contained.
  - *Absorb in:* ux-design §1.5 and owner-web-app §2.3 / §2.6.
- **PROVISIONAL (P3, DEC-0017) — awaiting owner confirmation (2026-10-02) — the re-run action's name and control.**
  - *Undefined:* DAC-E7-S4-2 and ux-design §1.5 ("The recovery action is a re-run, which AC-6 makes safe, and the screen says so") name the action, and the story maps it to `button` `default` on `POST /api/acquisition-runs`. No artifact gives its label, its sentence, or which control delivers it. DEC-0004 fixes the label of `StartRunControl`, the existing start control, to *Start acquisition run*.
  - *Adopted:*
    - Add an optional `label?: string` prop to `StartRunControl`, defaulting to *Start acquisition run*.
    - Render it on `failed` and `partial` runs as *Re-run acquisition*, after the sentence *Re-running is safe: data already recorded is not duplicated or overwritten.*
    - Pass no precondition props: unknown renders `default`, and the API's `409` code renders `blocked`.
    - The abandoned run's "path to starting a new run" is `StartRunControl` with its default label, because `ABANDONED_EXPLANATION` already says "Start a new run to continue."
  - *Derivation:*
    - A button named *Re-run* is what makes it "the named recovery action".
    - Reusing the control keeps DEC-0004's blocked, queued and navigation behaviour, and the server-side precondition order, with no copy.
    - The sentence restates AC-6 ("MUST NOT duplicate, overwrite or remove previously recorded data") in STD-UI-2-honest words.
    - DEC-0005 Open Gap 9 set the precedent of passing no precondition props.
  - *Rejected:*
    - A second, re-implemented start button: it duplicates the `409` and queued handling.
    - Keeping *Start acquisition run* with only a sentence: the action itself would not be named re-run.
    - Reading depth and instrument counts on this screen: two more requests for a state the API already reports.
  - *Confidence:* medium.
  - *Class:* contained. The prop is additive and defaulted, so DEC-0004's consumers, including CAP-001-E6-S4, are unaffected.
  - *Absorb in:* ux-design §1.5 and owner-web-app §2.5 (the component row for re-run).
- **PROVISIONAL (P4, DEC-0018) — awaiting owner confirmation (2026-10-02) — `CancelRunControl` once its owner has observed a newer state.**
  - *Undefined:* DEC-0005 fixes that after a `202` the control "shows the returned state as an `OutcomeBadge` and withdraws the action". On the Runs screen that badge is the only cancellation feedback. On Run detail, the summary also shows the run's state and keeps polling. The control's frozen *Cancelling* badge would then sit beside the summary's badge, and would stay *Cancelling* after the run became *Cancelled*, which shows a state that is no longer true. No artifact says how the two coexist.
  - *Adopted:* After a `202`, once the `state` prop has moved past `requested`/`running`, the control renders nothing, because its owner has observed and displays the newer state. After a `409`, it keeps *This run had already completed.* and the actual outcome. The summary always mounts the control, keyed on `runId`.
  - *Derivation:*
    - STD-UI-2 and ux-design §1.5 ("never shows a cancellation that did not happen") forbid a stale status.
    - On Runs the prop never advances, so every DEC-0005 behaviour and test is unchanged.
    - Always mounting is what preserves the `409` message across the refetch.
  - *Rejected:*
    - Remounting the control on every state change: this drops the `409` message (DAC-E7-S4-3).
    - Hiding the summary badge while the control shows one: the summary must carry the outcome (ux-design §1.5 Page Layout).
    - Inferring `409` from the settled state in the parent: this is ambiguous for `cancelled`.
  - *Confidence:* medium-high.
  - *Class:* contained.
  - *Absorb in:* ux-design §1.5 "Cancelling a running run".
- **PROVISIONAL (P5, DEC-0019) — awaiting owner confirmation (2026-10-02) — plan-local names, copy and E2E files.**
  - *Undefined:* No artifact gives these values.
  - *Adopted:*
    - **Names.**
      - Types `DataType`, `ResultOutcome`, `OutcomeCounts`, `RunResult` and `RunDetail`, and `RunDetailFilters` and `getAcquisitionRun` in the client.
      - Files under `web/src/screens/runs/detail/`: `index.tsx`, `run-summary.tsx`, `instrument-roster.tsx` and `result-outcome-badge.tsx`.
      - `RUN_DETAIL_POLL_INTERVAL_MS`.
    - **Screen copy.**
      - Heading *Run {runId}*.
      - Progress line *{written} written and {failed} failed of {named} named instruments*.
      - Failure sentences *Acquiring {data type} for {symbol} failed: {reason}* and *Acquiring {data type} for {symbol}: not found at the provider. {reason}*, with *No reason was recorded.* when the reason is null.
      - Unfiltered empty roster *No instrument results have been recorded for this run yet.*
      - Error *Loading run {runId} failed: {message} (request {requestId})*.
      - Live region *{n} instruments shown*.
      - Expander names *Show/Hide data types for {symbol}*.
    - **E2E.** Files `tests/e2e/cancel-run.spec.ts`, `tests/e2e/run-detail.spec.ts` and `tests/e2e/support/database.ts`.
  - *Derivation:*
    - The names follow `client.ts`'s `listAcquisitionRuns` / `startAcquisitionRun` / `cancelAcquisitionRun` and the E5-S6 type names.
    - The failure sentences are ux-design §1.5's three STD-UI-19 parts, "acquiring daily prices… the named instrument… the reason", using ux-design §1.1's data-type column names, lower-cased.
    - The error copy follows DEC-0005 Open Gap 10's *<Operation> failed: {message} (request {requestId})*.
    - The live region is owner-web-app §10's "announces the new row count politely".
    - The empty-roster sentence covers a queued or cancelled-before-start run. ux-design §1.5 marks "never populated" not applicable to the run, but not to its roster.
    - The E2E names follow owner-web-app §7's `cancel-run.spec.ts` and the story's two Testing bullets.
  - *Confidence:* medium.
  - *Class:* contained.
  - *Absorb in:* ux-design §1.5 and owner-web-app §7.
- **Backlog gap (not provisional; owner action) — the populated status-region outcome line and its run-detail link.**
  - *Undefined:* ux-design §0 / §2 "Diagnosing a failure" and owner-web-app §2.2 / §9 say the status region reports how the most recent run ended and links to that run's detail. TC-E2E-011 expects it. Once CAP-001-E7-S3 ships, `web/src/app/status-region.tsx` will only render *Most recent run recorded*.
  - *Not this story's scope:* None of CAP-001-E7-S4's ACs covers the status region. More decisively, the E7 epic's own **Out of Scope** line says "The application shell, navigation, status region and unreachable state, which E1 delivers". Its Non-Functional Requirements say "The status region that renders this EPIC's run-outcome content is delivered and paced by E1". Ownership therefore sits with E1, either CAP-001-E1-S5 (which delivered only the `null` branch, DAC-E1-S5-4) or a new E1 story. It is not a CAP-001-E7 story. This plan supplies the link's target, the `/runs/:runId` route rendering this screen, and nothing in the status region.
  - *Next step:* The owner should amend CAP-001-E1-S5 or add an E1 story at the next backlog revision. Until then, AC-18's "whether its most recent acquisition run failed" is met at the API only (CAP-001-E7-S3).

### Other Notes

- **Backend defect found during planning (outside this story; the driver should raise it).**
  - *Finding:* `acquisition_run.instruments_named`, `instruments_written` and `instruments_failed` are never written by production code. `migrations/0004_runs.sql` defaults them to `0`. The only writer is `tests/integration/test_run_outcome.py::_set_instruments_named`. No `UPDATE acquisition_run SET instruments_*` exists under `src/`: `src/factorflow/runs/journal.py` only reads `instruments_named` (line 215) and checks `instruments_named > 0` (line 293).
  - *Consequences:*
    - In production every run's persisted counts read 0, so this screen's progress line and the Runs columns read *0 written and 0 failed of 0*.
    - `finalise` can never return `succeeded`, because `instruments_named` stays 0. A fully written run is recorded as `partial`.
  - *Scope:* This plan renders the persisted counts as served and does not compensate. The fix belongs to the run journal and runner (CAP-001-E5-S1, CAP-001-E5-S3 or CAP-001-E4-S6). The SQL-computed `counts.results_by_outcome` (E7-S1) is unaffected. T017 seeds `instruments_named` explicitly.
- **Filtered view.** With an outcome filter, the API returns only the matching rows of each matching instrument (E5-S5, asserted by its test). This plan therefore never claims a filtered expansion shows four data types. DAC-E7-9's "expands to four data types" is asserted on the unfiltered view (T002).
- **No toast on this screen.** ux-design §2 says a run that completes while the owner is on its detail screen raises no `toast`, because the toast specification forbids announcing a result already visible. The `toast` row in owner-web-app §2.5 belongs to other screens.
- **Progress indicator.** ux-design §3 and owner-web-app §14 OQ 1 leave this component-spec gap open (the story's Open Question). The summary renders progress as text only, with no indicator and no estimate (owner-web-app §3).
- **E2E seeding.** The E2E server starts no runner and no stub provider (`scripts/run-e2e-server.sh`), so result rows and `running` runs cannot be produced through the API.
  - *Approach:* T016 seeds them by `docker exec` into the container that script creates, using the same container name and credentials. This is a test-fixture choice, not a product contract, and changes no server file.
  - *Interaction with other specs:* The specs share one database and run serially in file order. The `afterEach` cleanup in `cancel-run.spec.ts` is required: a leftover `cancelling` run would occupy the single-active slot (`idx_acquisition_run_single_active`), and `runs-start-cancel.spec.ts`'s start would then queue instead of navigating.
  - *Reclaim:* The reclaim sweep in the API process (`src/factorflow/api/app.py`, staleness 900 s) does not touch a seeded run within a test's lifetime.
- **A `500` message.** `toApiError` falls back to *request failed with status 500* when the body has no `message`, which is CAP-001-E7-S2's planned `500` shape. On this screen that reads *Loading run … failed: request failed with status 500 (request …)*, and surfacing *500* is implementation vocabulary under STD-UI-1. The fallback is shared by every screen and owned by `client.ts`'s existing behaviour, so this plan does not change it. The owner may want it reworded in E7-S2 or a follow-up.
- **Coverage-matrix scope.** TC-E2E-002, 005, 006, 007 and 008 (AC-10, AC-11, AC-19, AC-26) belong to the E2E automation plan (`tests/e2e/e2e-tests-automation-tasks.md` T004 and T006), whose paths (`web/e2e/…`) predate the repository's `tests/e2e/` layout. They are not mapped here. T016 and T017 are the story's own Playwright tests.
- **TC sharing.** TC-COMP-010 and TC-COMP-011 are also implemented by CAP-001-E7-S1 at the query layer and by earlier E4 stories at the runner layer. TC-COMP-019 and TC-COMP-026 are also implemented by CAP-001-E5-S3 in the run journal. Each story implements the TC at its own layer. This plan's cases assert the rendered interface only.
- **TDD evidence.** The story makes behaviour-changing commits, so the T027 evidence task applies. Under a supervised driver that commits once per stage, the DEC-0006 precedent (scoped to E5-S6) applies by analogy only. It is not extended here, and the driver decides commit granularity.
- **Accessibility enforcement.** Biome has no `jsx-a11y` equivalent (tech stack; owner-web-app §4). Expander names, `aria-expanded`, polite live regions, the dialog focus trap (inherited from `CancelRunControl`) and row headers are asserted by test where they carry an AC. The rest is human review.
