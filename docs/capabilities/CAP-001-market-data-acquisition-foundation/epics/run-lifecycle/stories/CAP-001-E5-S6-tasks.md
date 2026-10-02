---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S6-tasks
artifact_type: story-tasks
artifact_version: 2
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-10-02
docs_synced_review: CAP-001-E5-S6-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: devin
  tool: Devin
  tool_version: "unknown"
  timestamp: 2026-10-01T23:45:46Z
  source_artifacts:
    - id: CAP-001-E5-S6
      version: "1"
    - id: CAP-001-E5
      version: "2"
    - id: CAP-001
      version: "8"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-tests
      version: "1"
    - id: CAP-001-E6-S4-tasks
      version: "1"
    - id: STD-UI
      version: "4"
    - id: tech-stack
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S6 — Runs Screen and Run Controls

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S6.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-tasks-s6-refresh`
**Date**: 2026-10-01

## Summary

This story replaces the `/runs` placeholder in `web/src/app/routes.tsx` with the Runs screen
(`web/src/screens/runs/`). The screen lists run history newest first, and each outcome shows
its STD-UI-12 tier as a word plus an icon. It polls every 10 seconds while any loaded run is
non-terminal and stops when none is. The story also delivers two reusable run controls:

- `StartRunControl` in `web/src/screens/runs/run-controls.tsx`. It can be composed without any
  Runs-screen state, and CAP-001-E6-S4 mounts it on Coverage.
- `CancelRunControl` in `web/src/screens/runs/cancel-run.tsx`. The designs place cancellation
  on Run detail, and CAP-001-E7-S4 mounts it there.

The typed client gains three run calls over the CAP-001-E5-S5 endpoints, which are now
implemented (`src/factorflow/api/routes/runs.py`). `ApiError` is extended additively to carry
the envelope's `error.code` and `error.state`.

Revision 2 (2026-10-01) re-validates the 2026-09-11 plan against the code merged since
(CAP-001-E5-S1..S5, base `7e2c90c`) and against CAP-001-E6-S4's plan. The changes:

- it pins the controls' exports and props;
- it adds the `ApiError` extension;
- it avoids the `RunSummary = null` name;
- it adopts the owner-web-app section 7 file names;
- it maps the three capability-level TCs that the earlier plan omitted;
- it adds the TDD-evidence task.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-9 | Each run shows succeeded, partial, failed, cancelled or abandoned honestly | T003, T004, T012, T015, T018 |
| AC-23 | Starting while a run is active keeps the action available and says the new run is queued | T006, T008, T009, T011, T013 |
| AC-24 | With no instruments named, Start is `blocked` with *No instruments are named. Add instruments before acquiring.* | T006, T009, T013, T015 |
| DAC-E5-16 | Outcomes use the STD-UI-12 tier mapping | T001, T003, T012 |
| DAC-E5-17 | An abandoned run is explained, with the path to a new run | T004, T012, T015 |
| DAC-E5-S6-1 | Poll every 10 s while any run is non-terminal; stop when none is | T005, T015, T018 |
| DAC-E5-S6-2 | Eight states map to their tiers: requested neutral … abandoned serious | T001, T003, T012 |
| DAC-E5-S6-3 | No history depth → `blocked` with its own distinct reason | T006, T009, T013 |
| DAC-E5-S6-4 | Run id is an anchor to run detail | T004, T010, T015, T016, T018 |
| DAC-E5-S6-5 | Queued-run cancel confirmation copy differs from running-run copy | T007, T014 |
| DAC-E5-S6-6 | A `409` on cancel says the run completed, never a cancellation that did not happen | T007, T008, T011, T014 |
| DAC-E5-S6-7 | Never-run says so plainly, distinct from filtered-empty | T004, T015 |

## Phase 1: Setup

**Purpose**: Expose the missing tier tokens to Tailwind and add the run types to the fetch
layer. Neither task adds behaviour.

- [x] T001 [P] Add the three missing STD-UI-12 tier colour pairs to `tailwind.config.js`, under `theme.extend.colors`. Add nothing else.
  - Add `status-neutral`, `status-neutral-muted`, `status-active`, `status-active-muted`,
    `status-serious` and `status-serious-muted`.
  - Use the file's existing `hsl(var(--x) / <alpha-value>)` form.
  - The tokens already exist in `design-system/theme.css`, lines 150–159 (light) and their dark
    counterparts. Tailwind currently exposes only `good`, `warning` and `critical`.
  - Tokens are selected, never introduced (STD-UI-29).
  - Traces to: DAC-E5-16 and DAC-E5-S6-2.
- [x] T002 [P] Append the run contract to `web/src/api/types.ts`, after `HistoryDepth`, in the file's docstring style. Each type cites ingestion-api section 11 and `src/factorflow/api/models.py`.
  - `export type RunState = "requested" | "running" | "cancelling" | "succeeded" | "partial" | "failed" | "cancelled" | "abandoned";`
    These are exactly the eight values of `models.RunState`.
  - `export interface AcquisitionRun`, mapped from the wire `RunSummary` model, with these
    fields:
    - `runId: string`
    - `state: RunState`
    - `historyDepthYears: number`
    - `requestedAt: string`
    - `startedAt: string | null`
    - `endedAt: string | null`
    - `instrumentsNamed: number`
    - `instrumentsWritten: number`
    - `instrumentsFailed: number`
    - `failureReason: string | null`
  - `export interface AcquisitionRunPage { runs: AcquisitionRun[]; nextCursor: string | null }`
  - `export interface RunStartResult { runId: string; state: "requested"; queuedBehind: string | null }`
  - `export interface RunCancelResult { state: "cancelling" | "cancelled" }`
  - **Do not touch `export type RunSummary = null`.** It is the health `most_recent_run`
    placeholder that CAP-001-E7-S3 owns. Do not reuse, widen or shadow that name. The new
    names are recorded in Open Gap 4.
  - Prerequisite infrastructure for AC-9, AC-23 and AC-24.

**Checkpoint**: `npx tsc --noEmit` passes, and `RunSummary` is unchanged. No behaviour has
changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing Vitest specs for every rendering and control behaviour the ACs
require, before any production code exists.

Test conventions. These follow the precedents in `web/src/app/routes.test.tsx` and
`web/src/screens/instruments/*.test.tsx`.

- Mock `../../api/client` with `vi.mock`, spreading `vi.importActual` and replacing only the
  calls under test with `vi.fn()`.
- Render inside a `MemoryRouter`.
- Every mandatory test carries one `// Implements TC-COMP-NNN` comment per TC.
- The component test spec's steps are generic boilerplate. The concrete assertions below are
  sharpened from each TC's AC, which is the source of truth.
- Quoted copy is verbatim from ux-design 1.1, 1.4 and 1.5 unless Open Gaps marks it
  PROVISIONAL.

### Mandatory Component Tests

- [x] T003 [P] Create `web/src/screens/runs/outcome-badge.test.tsx`, the file owner-web-app section 7 names. It implements TC-COMP-251 (DAC-E5-16), TC-COMP-286 (DAC-E5-S6-2), and the presentation half of TC-COMP-009 (AC-9).
  - Use `it.each` over all eight states to render `<OutcomeBadge state={s} />` and assert
    `data-variant` exactly:
    - `requested` → `status-neutral`
    - `running` → `status-active`
    - `cancelling` → `status-warning`
    - `succeeded` → `status-good`
    - `partial` → `status-warning`
    - `failed` → `status-critical`
    - `cancelled` → `status-neutral`
    - `abandoned` → `status-serious`
  - Assert the visible word for each state (Open Gap 7).
  - Assert each badge contains an `svg` with `aria-hidden="true"` and a `data-icon` equal to
    its tier, and that the six tiers' `data-icon` values are pairwise distinct. This is the
    greyscale rule, STD-UI-8.
  - Explicit regression guards:
    - `partial` is **not** `status-good` (AC-9);
    - `cancelled` is **not** `status-critical`;
    - `abandoned` differs from both `failed` and `cancelled` (DAC-E5-16).
  - TC-COMP-009's persisted-outcome half belongs to CAP-001-E5-S1 and CAP-001-E5-S3, as
    `CAP-001-E5-S1-tasks` T003 records. This file covers only the interface half: the outcome
    is shown as recorded, never upgraded.
- [x] T004 [P] Create `web/src/screens/runs/runs-screen.test.tsx`. It implements TC-COMP-252 (DAC-E5-17), TC-COMP-288 (DAC-E5-S6-4), TC-COMP-291 (DAC-E5-S6-7), and the list half of TC-COMP-009 (AC-9).
  - Render `<RunsScreen />`. Mock these calls:
    - `listAcquisitionRuns`;
    - `getHistoryDepth`, resolving `{ years: 5, updatedAt: null }`;
    - `listInstruments`, resolving `activeCount: 3`.
  - **TC-COMP-009 (list)**: resolve one terminal run in each of `succeeded`, `partial`,
    `failed`, `cancelled` and `abandoned`.
    - Each row's Outcome cell holds the matching badge word.
    - The `partial` row's badge has `data-variant="status-warning"`.
    - No row other than `succeeded` reads *Succeeded*.
  - **TC-COMP-252**: the `abandoned` row contains, verbatim, *The process running this
    acquisition stopped before it finished, and the run was reclaimed. Coverage written before
    it stopped is kept. Start a new run to continue.*
    - Assert it with `getByTestId("abandoned-explanation")`.
    - The *Start acquisition run* button is present on the same screen. That button is the path
      to a new run.
  - **TC-COMP-288**: the run id renders as a `link` whose accessible name is the full run id,
    with `href` equal to `/runs/<runId>`.
    - It is an `<a>` element, never a `button`.
    - No `<tr>` carries an `onClick` handler or `role="link"`, because the history variant
      allows no row target (owner-web-app 2.5).
  - **TC-COMP-291**: resolve `{ runs: [], nextCursor: null }` with no filter.
    - *No acquisition run has been requested yet.* is present.
    - `queryByRole("table")` is `null`.
    - *No run matches this filter.* is absent.
  - **Additional, filtered-empty** (story Testing: "distinguishes never-run from
    filtered-empty"; ux 1.4 States):
    - Choose *Failed* in the *Outcome* select and resolve an empty page.
    - *No run matches this filter.* and a *Reset filter* button are present.
    - The never-run sentence is absent.
    - `listAcquisitionRuns` was last called with `{ state: "failed" }`.
    - *Reset filter* calls it again with no `state`.
  - **Additional, columns**: the `th[scope=col]` headers, in order, are Run, Outcome,
    Requested, Started, Ended, Instruments written, Instruments failed (ux 1.4 plus the
    first-column link; see Open Gap 7).
    - Timestamps read `YYYY-MM-DD HH:MM:SS America/Chicago` through `formatTimestamp`.
    - A `null` `startedAt` or `endedAt` renders an em dash, never blank (STD-UI-4).
  - **Additional, pinned in-progress** (ux 1.4 Page Layout): a `running` run returned after two
    terminal runs renders as the first body row, with `data-in-progress="true"`.
  - **Additional, error** (owner-web-app AC 17):
    - `listAcquisitionRuns` rejects with `new ApiError("boom", "req-7")`.
    - The `h1` *Runs* and the toolbar stay rendered.
    - A `role="alert"` reads *Loading runs failed: boom (request req-7)* and offers *Retry*.
  - **Additional, truncation disclosure** (Open Gap 5): with `nextCursor: "c1"`, the text
    *Showing the 50 most recent runs.* is present. With `nextCursor: null` it is absent.
- [x] T005 [P] Create `web/src/screens/runs/runs-screen.polling.test.tsx`. It implements TC-COMP-285 (DAC-E5-S6-1) with fake timers, following the `coverage.polling.test.tsx` structure that CAP-001-E6-S4 plans.
  - Set up timers with `vi.useFakeTimers({ shouldAdvanceTime: true })`, then call
    `vi.setSystemTime(new Date("2026-09-06T15:00:00Z"))`.
  - Response 1 contains a `running` run. After the mount fetch:
    - `listAcquisitionRuns` has been called once;
    - the toolbar reads *Last updated 2026-09-06 10:00:00 America/Chicago*.
  - Advance 9 999 ms: still one call. Advance 1 ms more: two calls. The cadence is exactly
    10 000 ms.
  - Response 2 contains only terminal runs. Advance `10 * 60_000` ms: still two calls. Polling
    has stopped, so a quiet system makes no requests.
  - Repeat with `requested` and then `cancelling` as the only non-terminal state. Each of the
    three non-terminal states starts polling.
  - Unmount while polling: no further call after advancing 10 000 ms. The timer is cleared.
  - While a poll is in flight, the previous rows stay rendered and the table has
    `aria-busy="true"`. They never collapse to a loading message (owner-web-app section 5).
  - Restore real timers in `afterEach`.
- [x] T006 [P] Create `web/src/screens/coverage/start-run.test.tsx`, the file owner-web-app section 7 names for "Start is blocked, not disabled" and "Queued run notice renders". It implements TC-COMP-024 (AC-24), TC-COMP-287 (DAC-E5-S6-3) and TC-COMP-023 (AC-23, the interface half).
  - Render `<StartRunControl … />` imported from `../runs/run-controls`, **standalone** in a
    `MemoryRouter`, with no Runs-screen provider, parent or state. This proves the control can
    be composed on Coverage.
  - This file does not mock `../runs/run-controls`. CAP-001-E6-S4's Coverage screen tests do,
    in their own files.
  - **TC-COMP-287**: `historyDepthYears={null} activeInstrumentCount={3}`.
    - The button named *Start acquisition run* has `data-variant="blocked"` and **no**
      `disabled` attribute.
    - It is reachable with `userEvent.tab()`.
    - Its `aria-describedby` resolves to the text *History depth is not set. Set it in Settings
      before acquiring.*
    - Clicking it makes **no** `startAcquisitionRun` call.
  - **TC-COMP-024**: `historyDepthYears={5} activeInstrumentCount={0}`.
    - The button is `blocked` and not `disabled`.
    - Its description reads *No instruments are named. Add instruments before acquiring.*
    - The two reasons differ.
    - Clicking it makes no call.
  - **Both hold** (ux 1.1; Open Gap 11): `historyDepthYears={null} activeInstrumentCount={0}`.
    - Both sentences are present, and the depth sentence comes first in DOM order.
    - `aria-describedby` lists both ids, depth first.
  - **TC-COMP-023**: with `{5, 3}`, `startAcquisitionRun` resolves
    `{ runId: "r-2", state: "requested", queuedBehind: "r-1" }`. Click the button.
    - A `role="status"` region reads *A run is in progress. This will start when it finishes.*
    - The button is still `data-variant="default"`, still has no `disabled` attribute, and is
      still in the document. The action stays available (owner-web-app AC 7).
    - The route did not change: assert with a `useLocation` probe that the path is still the
      initial one.
    - A second click calls `startAcquisitionRun` again.
  - TC-COMP-023's queue-persistence half belongs to CAP-001-E5-S2 and CAP-001-E5-S5 (both
    implemented).
- [x] T007 [P] Create `web/src/screens/runs/cancel.test.tsx`, the file owner-web-app section 7 names. It implements TC-COMP-289 (DAC-E5-S6-5) and TC-COMP-290 (DAC-E5-S6-6).
  - Render `<CancelRunControl runId="r-1" state=… />`. Mock `cancelAcquisitionRun`.
  - **TC-COMP-289**:
    - With `state="running"`, click *Cancel run*. The `dialog` has `data-variant="confirm"`,
      never `destructive`. Its title reads *Stop this run?* and its body reads *Instruments
      already acquired keep their coverage. Instruments not yet started will be skipped. The
      run stops after the instrument it is working on now.*
    - With `state="requested"`, the title reads *Cancel this queued run?* and the body reads
      *It has not started, so nothing has been acquired. The run in progress is not affected.*
    - The two dialogs' text content differs.
    - In both dialogs, initial focus is on *Cancel*. `Escape` closes the dialog without a call,
      and focus returns to the trigger (ux 1.5 Accessibility).
  - **Cancelling is not immediate** (owner-web-app section 7 row; AC-19):
    - With `running`, confirm *Stop run*. The call resolves `{ state: "cancelling" }`.
    - A `cancelling` OutcomeBadge (`status-warning`) renders.
    - No *Cancel run* button remains in the document. The action is unavailable rather than
      clickable.
  - **Queued cancel is immediate**: with `requested`, confirm *Cancel queued run*. The call
    resolves `{ state: "cancelled" }` and a `cancelled` badge (`status-neutral`) renders.
  - **TC-COMP-290**:
    - The call rejects with
      `new ApiError("…", "req-3", { code: "run_already_terminal", state: "succeeded" })`.
    - *This run had already completed.* renders, together with a `succeeded` OutcomeBadge.
    - No *Cancelled* or *Cancelling* text appears anywhere.
    - `onSettled` is called with `"succeeded"`.
  - **Not offered on terminal input**: with `state` set to `cancelling` or to any of the five
    terminal states, no *Cancel run* button renders.

### Additional Unit Tests

- [x] T008 [P] Create `web/src/api/client.runs.test.ts`. It is a new file, separate from CAP-001-E6-S4's `client.coverage.test.ts`, so the two stories never edit one test file. Stub `fetch` with `vi.stubGlobal`.
  - **`ApiError` extension**:
    - `new ApiError("m", "r")` still works, and gives `code === null` and `state === null`.
    - A `409` body `{"error":{"code":"run_already_terminal","message":"m","resource":"acquisition-run","request_id":"r","state":"failed"}}`
      rejects with an `ApiError` where `code === "run_already_terminal"` and
      `state === "failed"`.
    - A `409` with `code: "no_active_instruments"` and no `state` gives `state === null`.
    - A non-JSON `500` keeps the generic message and gives `requestId === "unknown"` and
      `code === null`.
  - **`listAcquisitionRuns`**:
    - With no filters it requests `/api/acquisition-runs` with no query string.
    - `{ state: "failed", cursor: "c" }` adds `?state=failed&cursor=c`.
    - It maps every snake_case field of `RunSummary`, and `next_cursor`.
  - **`startAcquisitionRun`**:
    - It sends `POST /api/acquisition-runs` with no body.
    - It maps `202 {run_id, state, queued_behind}` to `RunStartResult`, keeping
      `queuedBehind` `null` when the wire value is `null`.
  - **`cancelAcquisitionRun("a/b")`**:
    - It sends `POST /api/acquisition-runs/a%2Fb/cancel`.
    - It maps `{state:"cancelling"}`.
  - A thrown `fetch` rejects with `ApiUnreachableError`.
  - Supports AC-23, AC-24 and DAC-E5-S6-6.
- [x] T009 [P] Create `web/src/screens/runs/run-controls.test.tsx` for `StartRunControl` behaviour beyond T006.
  - **Post-202 routing** (ux 1.1 and section 2; Resolved Conflict 1): when
    `startAcquisitionRun` resolves with `queuedBehind: null`:
    - `onStarted` is called exactly once with the result, before navigation;
    - the location becomes `/runs/r-9`;
    - no queued notice renders.
  - **Queued case**: `onStarted` is called once, and the location is unchanged (complements
    T006).
  - **Server refusal race**: with `{5, 3}`, the call rejects with
    `ApiError(..., { code: "history_depth_not_set" })`.
    - The control turns `blocked` with the UX sentence *History depth is not set. Set it in
      Settings before acquiring.*
    - It does **not** show the API's own message text (Resolved Conflict 2).
    - The same applies to `no_active_instruments` → the AC-24 sentence.
    - Re-rendering with different precondition props clears the override.
  - **Unknown preconditions** (Open Gap 9): `<StartRunControl />` with no props renders
    `default`. Clicking it calls `startAcquisitionRun`.
  - **Other failures**:
    - An `ApiError("x", "req-5")` with any other code renders `role="alert"`
      *Starting an acquisition run failed: x (request req-5)*.
    - An `ApiUnreachableError` renders *Starting an acquisition run failed:* followed by its
      message.
    - In both cases the button stays `default`.
  - **No double submit**: two rapid clicks while the first call is pending produce one call.
    The button has `aria-busy="true"` while pending and never gets `disabled`.
  - Supports AC-23, AC-24 and DAC-E5-S6-3.
- [x] T010 Update `web/src/app/routes.test.tsx`.
  - Add `listAcquisitionRuns: vi.fn().mockResolvedValue({ runs: [], nextCursor: null })` to
    the existing `vi.mock("../api/client")` factory.
  - Add a case: inside `<Shell />` at `/runs`, the real Runs screen renders an `h1` *Runs*,
    the placeholder text is gone, and *Runs* is the `aria-current` rail item.
  - Leave the "declares exactly five routes" case unchanged, including the sibling
    `/runs/:runId` route.
  - Supports DAC-E5-S6-4.

**Checkpoint**: T003–T010 fail for the right reason (missing module or export, or wrong
rendering). Mandatory tests carry their `Implements` comments. Timing tests use fake timers
and never real waits.

---

## Phase 3: Core Implementation

**Purpose**: Implement the client calls, the tier mapping, both controls and the screen until
Phase 2 is green.

- [x] T011 Implement the client half in `web/src/api/client.ts` (makes T008 pass; depends on T002).
  - Extend `ApiError` **additively**:
    - add `readonly code: string | null` and `readonly state: string | null`;
    - give the constructor an optional third parameter,
      `details: { code?: string | null; state?: string | null } = {}`;
    - keep the existing `(message, requestId)` call shape and `instanceof` checks working
      unchanged, including CAP-001-E6-S4's planned `new ApiError(msg, "unknown")`.
  - `toApiError()` also reads `error.code` and `error.state` when they are strings. It keeps
    its current degrade-to-generic behaviour.
  - Add `export interface RunListFilters { state?: RunState; limit?: number; cursor?: string }`.
  - Add the three calls after `setHistoryDepth`. All of them use the private `requestJson`,
    and each maps snake_case to camelCase once, following `listInstruments`:
    - `export async function listAcquisitionRuns(filters: RunListFilters = {}): Promise<AcquisitionRunPage>`.
      Set only the query parameters that are present.
    - `export async function startAcquisitionRun(): Promise<RunStartResult>`.
      Send `POST` with no body and no `Content-Type`, because the endpoint takes an empty body.
    - `export async function cancelAcquisitionRun(runId: string): Promise<RunCancelResult>`.
      Use `encodeURIComponent(runId)`.
- [x] T012 [P] Create `web/src/screens/runs/outcome-badge.tsx` (makes T003 pass; depends on T001, T002).
  - `export const RUN_STATE_TIER: Record<RunState, "neutral" | "active" | "good" | "warning" | "serious" | "critical">`
    holds the ux-design section 5 and run-journal section 10 table, verbatim.
  - `export const RUN_STATE_LABEL: Record<RunState, string>` holds the visible words
    (Open Gap 7).
  - `export function isRunState(value: unknown): value is RunState`
  - `export function isNonTerminalRunState(state: RunState): boolean`. It is true only for
    `requested`, `running` and `cancelling`.
  - `export const ABANDONED_EXPLANATION`, the verbatim ux 1.5 sentence.
  - `export function OutcomeBadge({ state }: { state: RunState }): JSX.Element` renders
    `data-testid="outcome-badge"` with `data-variant={`status-${tier}`}`.
    - It shows an `aria-hidden` `svg` with a per-tier `data-icon` shape, then the label.
    - Classes are `bg-status-<tier>-muted text-status-<tier>`, following the `LifecycleBadge`
      structure in `screens/instruments/badges.tsx`.
- [x] T013 Create `web/src/screens/runs/run-controls.tsx`, which exports `StartRunControl` (makes T006 and T009 pass; depends on T011). The interface is pinned in Open Gap 2:
  ```ts
  export interface StartRunControlProps {
    /** `null`: no depth stated, renders blocked. `undefined`: not known, not blocked client-side. */
    historyDepthYears?: number | null;
    /** `0`: no active instrument, renders blocked. `undefined`: not known. */
    activeInstrumentCount?: number;
    /** Called once with the 202 result, before any navigation. */
    onStarted?: (result: RunStartResult) => void;
  }
  export function StartRunControl(props: StartRunControlProps): JSX.Element;
  ```
  - Export the copy constants `DEPTH_NOT_SET_REASON`, `NO_INSTRUMENTS_REASON` and
    `QUEUED_NOTICE`, verbatim from ux-design 1.1.
  - Render one `<button type="button">Start acquisition run</button>`, which is the accessible
    name CAP-001-E6-S4's stub already uses.
    - `data-variant` is `default` or `blocked`, with `tabIndex={0}`. It **never** has a
      `disabled` attribute.
    - In the blocked state, the reasons render beside the button as `<p id>` elements, depth
      first. `aria-describedby` lists their ids. `onClick` calls `preventDefault()` and makes
      no request.
    - This follows the `screens/instruments/start-action.tsx` pattern. Do not modify that file.
  - When unblocked, a click calls `startAcquisitionRun()`, ignoring clicks while one is pending
    (`aria-busy`).
    - On a 202, call `onStarted?.(result)`.
    - If `result.queuedBehind === null`, call
      `navigate(`/runs/${encodeURIComponent(result.runId)}`)` (ux 1.1 and section 2).
    - Otherwise stay where the control is and render `QUEUED_NOTICE` in a `role="status"`
      region. The button stays `default` (AC-23).
  - A `409` whose `ApiError.code` is `history_depth_not_set` or `no_active_instruments` sets a
    local refusal override. That renders the matching UX sentence as `blocked` until the
    precondition props change. Any other failure renders the STD-UI-19 alert (Open Gap 10).
  - The control reads no Runs-screen state, context or route parameter. It needs only a Router
    ancestor, for `useNavigate`.
- [x] T014 [P] Create `web/src/screens/runs/cancel-run.tsx`, which exports `CancelRunControl` (makes T007 pass; depends on T011, T012). The interface is pinned in Open Gap 3:
  ```ts
  export interface CancelRunControlProps {
    runId: string;
    state: RunState;
    /** Called with the resulting state: cancelling, cancelled, or the actual terminal state from a 409. */
    onSettled?: (state: RunState) => void;
  }
  export function CancelRunControl(props: CancelRunControlProps): JSX.Element | null;
  ```
  - For `requested` or `running`, render the trigger *Cancel run*, a `button` `secondary`
    (ux 1.5).
  - In any other state, render no trigger.
  - The trigger opens a module-private `CancelRunDialog`, a native `<dialog open>` with
    `aria-modal="true"` and `data-variant="confirm"`.
    - Reuse `screens/instruments/retire-dialog.tsx`'s manual focus trap, Escape-to-close,
      initial focus on *Cancel* and focus restore. Copy the pattern; do not import from
      `instruments/`.
    - The title and body follow the state (ux 1.5 verbatim).
    - The actions are *Cancel* first and then the confirm action, *Stop run* (running) or
      *Cancel queued run* (requested). See dialog spec section "Actions" and Open Gap 3.
    - While submitting, the dialog stays open with `aria-busy` (dialog spec: "never close the
      dialog before the result is known").
  - On a 202, close the dialog, render an `OutcomeBadge` for the returned state in a
    `role="status"` region, hide the trigger, and call `onSettled`.
  - On an `ApiError` with `code === "run_already_terminal"`, render *This run had already
    completed.* together with `OutcomeBadge` for `error.state` (guarded with `isRunState`).
    Hide the trigger and call `onSettled(error.state)`.
  - On any other failure, render the STD-UI-19 alert inside the dialog: *Cancelling run
    {runId} failed: {message} (request {requestId})*.
- [x] T015 Create `web/src/screens/runs/run-table.tsx` and `web/src/screens/runs/index.tsx` (makes T004 and T005 pass; depends on T012, T013).
  - **`run-table.tsx`** exports `RunTable({ runs, busy }: { runs: AcquisitionRun[]; busy: boolean })`,
    a `data-table` `history`-style table.
    - It has `aria-busy={busy}` and `th[scope=col]` headers, in this order: Run, Outcome,
      Requested, Started, Ended, Instruments written, Instruments failed.
    - The Run cell is a `th[scope=row]` holding `<Link to={`/runs/${encodeURIComponent(runId)}`}>`
      with the full run id in `font-numeric`.
    - Outcome holds `OutcomeBadge`, plus `ABANDONED_EXPLANATION` in
      `<p data-testid="abandoned-explanation">` when the run is `abandoned`.
    - Timestamps use `formatTimestamp(new Date(iso))` from `../../app/status-region`
      (CAP-001-E1-S5), in `text-xs font-numeric`. A `null` renders an `aria-hidden` em dash plus an `sr-only`
      *Not recorded*.
    - Counts are right-aligned in `font-numeric`, in full.
    - Rows have no click handler and no row actions.
    - Non-terminal rows are stably sorted first and carry `data-in-progress="true"` plus a
      `border-l-status-active` marker (ux 1.4).
  - **`index.tsx`** has the default export `RunsScreen`, structured like
    `screens/instruments/index.tsx`.
    - **Preconditions on mount**:
      - `getHistoryDepth()` gives `historyDepthYears` (`years`);
      - `listInstruments({ lifecycle: "active", limit: 1 })` gives `activeInstrumentCount`
        (`activeCount`);
      - a failed read leaves either value `undefined`, never `null` or `0` (Open Gap 9).
    - **List state**: `ScreenState<AcquisitionRunPage>`.
      - `empty-never-populated` when no outcome filter is set and `runs` is empty.
      - `empty-no-match` when a filter is set and `runs` is empty.
      - `populated` otherwise, with `fetchedAt = new Date().toISOString()`.
      - `error` from `ApiError.requestId`, or `"unknown"`.
      - `partial`, `unavailable` and `unreachable` are never produced. ux 1.4 says Unavailable
        does not apply and the shell owns unreachable; put this in the docstring.
    - **Layout**, in order:
      1. `<h1 className="text-xl">Runs</h1>`.
      2. A toolbar that stays rendered in every state. It holds:
         - an *Outcome* native `select` (`select` `inline`) with *All* plus the eight
           `RUN_STATE_LABEL`s;
         - `<StartRunControl historyDepthYears={…} activeInstrumentCount={…} onStarted={reload} />`;
         - *Last updated {formatTimestamp(...)}*, or *Not yet loaded*;
         - a polite live region.
      3. The body:
         - loading: *Loading runs…* with `aria-live="polite"`;
         - never-populated: *No acquisition run has been requested yet.*;
         - no-match: *No run matches this filter.* and *Reset filter*;
         - error: a `role="alert"` reading *Loading runs failed: {message} (request {requestId})*,
           with *Retry*;
         - populated: `RunTable`, followed by *Showing the 50 most recent runs.* when
           `nextCursor !== null` (Open Gap 5).
    - **Polling**: export `RUNS_POLL_INTERVAL_MS = 10_000`.
      - After each successful response, schedule exactly one `setTimeout` refetch with the
        same filter, and only if `runs.some((r) => isNonTerminalRunState(r.state))`.
      - Clear the timer on unmount, on a filter change and on terminal data.
      - Keep the previous rows during a refetch, with `busy`.
      - Use no `setInterval` (Open Gap 6).
    - Filter changes and *Retry* bump a reload token. They never move focus.
  - The `/runs` route does not render `CancelRunControl` (Resolved Conflict 4).

**Checkpoint**: T003–T009 pass under `npm run test`. `npx tsc --noEmit` and `npm run lint` are
clean.

---

## Phase 4: Integration

**Purpose**: Route the screen inside the shell, keep the existing suite green, and prove
start-then-cancel against the real API.

- [x] T016 Wire the route in `web/src/app/routes.tsx`, inside the CAP-001-E1-S4 shell (makes T010 pass; depends on T015).
  - Import `RunsScreen from "../screens/runs"` and replace `<ScreenPlaceholder label="Runs" />`
    on `/runs` with `<RunsScreen />`.
  - **Keep `ScreenPlaceholder`**, because `/coverage` still uses it until CAP-001-E6-S4 lands.
    Whichever of the two stories merges last deletes it if it is unused (`noUnusedLocals`).
  - Leave `/runs/:runId` → `RunDetailPlaceholder` untouched. CAP-001-E7-S4 owns it.
- [x] T017 Run the full `npm run test` and fix regressions caused only by `/runs` now fetching (depends on T016).
  - `web/src/app/shell.status-region.test.tsx` and `shell.unreachable.test.tsx` navigate to
    `/runs`. The global `fetch` stub in `web/src/test-setup.ts` answers every URL with the
    health body, so the Runs screen will settle into its `error` state there.
  - Change an existing test only if it fails or emits an `act(...)` warning. When it does, add
    `listAcquisitionRuns`, `getHistoryDepth` and `listInstruments` mocks to that file's own
    `vi.mock` factory, as `routes.test.tsx` already does.
  - Do not edit `test-setup.ts` or change any assertion's meaning.
- [x] T018 Create `tests/e2e/runs-start-cancel.spec.ts` against the existing Playwright setup: `playwright.config.ts` and `scripts/run-e2e-server.sh`, which provide the real API and PostgreSQL (depends on T016). The name and shape are in Open Gap 8.
  - Arrange through Playwright's `request` fixture:
    - `PUT /api/settings/history-depth` with `{ "years": 1 }`;
    - `POST /api/instruments` with `{ "symbols": ["MSFT"] }`, accepting `201` or `409`
      (already active from an earlier run).
  - `page.goto("/runs")`. Click *Start acquisition run*.
  - Expect the URL to match `/runs/<uuid>`. The e2e server starts no runner process
    (`factorflow.ingestion_main` is not launched), so no run is active and `queued_behind` is
    `null`.
  - Capture the id and `page.goto("/runs")`.
    - The row's link named by that id has `href` `/runs/<id>`.
    - Its badge reads *Requested*.
  - `POST /api/acquisition-runs/<id>/cancel` through `request` and expect `202 {state: "cancelled"}`.
    UI cancellation lives on Run detail (CAP-001-E7-S4), so it is not exercised here.
  - Without reloading, `expect(row.getByTestId("outcome-badge")).toHaveText(/Cancelled/, { timeout: 15_000 })`.
    The 10 s poll must pick up the change.
  - The queued notice and the `409` race cannot be reached without a runner. They are covered
    by T006, T007 and T009.
  - Implements the story's "`@playwright/test` for start-then-cancel" and supports AC-9,
    DAC-E5-S6-1 and DAC-E5-S6-4.

**Checkpoint**: `npm run test`, `npm run build`, `npm run lint` and `npx tsc --noEmit` are
green. `npm run test:e2e` is green, or, when Docker or Playwright browsers are unavailable, it
is reported as excluded rather than green.

---

## Phase 5: Polish

**Purpose**: Prove that the tests kill the regressions that matter, and record TDD evidence.

- [x] T019 Mutation-check the suite (depends on T017–T018).
  - By hand, mutate each of the following in turn and confirm that a test fails:
    - the poll condition (include a terminal state, or drop `cancelling`);
    - the poll cadence (9 000 or 11 000 ms);
    - `RUN_STATE_TIER`: `partial` → `good`, `cancelled` → `critical`, `abandoned` → `critical`;
    - the `blocked` button gaining `disabled`;
    - the reason order;
    - the run-id `Link` becoming a row `onClick`;
    - the queued-versus-running dialog branch;
    - the `409` branch rendering *Cancelled*;
    - the queued 202 navigating away.
  - Strengthen any test a mutation survives. Record each mutation as RED→GREEN→MUTATE→STRENGTHEN
    in the evidence file.
- [x] T020 After each TDD cycle in T003–T019, not once at the end:
  - stage only that cycle's diff;
  - dispatch an independent code-review subagent and an independent spec-drift subagent
    against it;
  - append the cycle to `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S6-tdd-evidence.yaml`
    with `code_review_verdict`, `spec_drift.drift_detected` and its RED/GREEN evidence;
  - do not commit a `REJECTED` or `drift_detected: true` cycle;
  - after the commit, record its `commit_hash` and `tests_executed: true` before the next cycle
    begins.

  INV-TDD-002, TEST-TDD-008. Traces to no AC.

**Checkpoint**: Every AC above is satisfied, all validation passes, and every behaviour-changing
commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

`dependencies.yaml` now records
`CAP-001-E5-S6: [CAP-001-E1-S4, CAP-001-E1-S5, CAP-001-E2-S4, CAP-001-E5-S5]`. Two hard edges
were added in this revision, and both producers are implemented (`docs-sync`).

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S4 | hard | Existing edge. The shell, `routes.tsx` and the `/runs` destination this story fills. |
| CAP-001-E1-S5 | hard | **New edge.** T015 imports `formatTimestamp` from `web/src/app/status-region.tsx`, added in commit `163fb18` (`feat(CAP-001-E1-S5)`). |
| CAP-001-E2-S4 | hard | **New edge.** T011 extends `ApiError`/`toApiError` and reuses `requestJson`. T015 calls `getHistoryDepth` and `listInstruments`. All of them were added to `web/src/api/client.ts` in commit `bfcc2cd` (`feat(CAP-001-E2-S4)`). |
| CAP-001-E5-S5 | hard | Existing edge. `GET`/`POST /api/acquisition-runs` and `POST /api/acquisition-runs/{id}/cancel` in `src/factorflow/api/routes/runs.py`, and the `state` field on the error envelope in `src/factorflow/api/errors.py`. |
| CAP-001-E6-S4 | reverse | Its T018 composes `StartRunControl` from `web/src/screens/runs/run-controls.tsx`, and its graph entry already lists this story. |
| CAP-001-E7-S4 | reverse | Run detail (AC-19, AC-26, DAC-E7-S4-3) is expected to mount `CancelRunControl` and `OutcomeBadge` from this story. Its graph entry, `[E1-S4, E5-S5, E7-S1]`, does not yet list this story (see Other Notes). |
| CAP-001-E7-S3 | context | Owns the widening of `RunSummary = null` in `types.ts`. This story leaves that name untouched. |
| CAP-001-E5-S1 | context | Owns the persisted half of TC-COMP-009 (`CAP-001-E5-S1-tasks` T003). This story covers only the rendering half. |
| CAP-001-E5-S2 | context | Owns the queue-persistence half of TC-COMP-023. It is consumed only through E5-S5's `queued_behind`. |
| CAP-001-E5-S3 | context | Owns result-derived finalisation, the other persisted half of TC-COMP-009. It is consumed only through E5-S5's `state`. |

### Task Dependencies

- T001 and T002: no dependencies.
- T003–T009: may be authored right after T001–T002. Each is its own file.
- T010: no dependencies (it edits only `routes.test.tsx`).
- T011: depends on T002.
- T012: depends on T001 and T002.
- T013: depends on T011.
- T014: depends on T011 and T012.
- T015: depends on T012 and T013.
- T016: depends on T015.
- T017: depends on T016.
- T018: depends on T016.
- T019: depends on T017 and T018.
- T020: interleaved. It runs after every TDD cycle, before that cycle's commit.

### Parallel Opportunities

- Phase 1: T001 and T002 can run in parallel.
- Phase 2: T003–T010 can run in parallel (different files).
- Phase 3: T012 can run in parallel with T011. T014 can run in parallel with T013 once T011
  and T012 are done.
- Phase 4: T017 and T018 can run in parallel after T016.

### Phase Dependencies

- Phase 2 precedes Phase 3 under TDD, and each Phase 3 task makes its named tests pass.
- Phase 4 needs Phase 3.
- Phase 5's T019 needs Phase 4. T020 runs throughout.

---

## Validation Plan

### Constitution-Defined Commands

From `docs/constitution/tech-stack.md`, Validation Commands. Run each from the repository root.

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test`. Focused: `npm run test -- web/src/screens/runs web/src/screens/coverage/start-run.test.tsx web/src/api/client.runs.test.ts web/src/app`
- End-to-end: `npm run test:e2e` (needs Docker for the PostgreSQL container)
- Lint: `npm run lint`
- Format: `npm run format`
- Type check: `npx tsc --noEmit`

### Story-Specific Validation

- **AC-9, DAC-E5-16, DAC-E5-S6-2**: all eight states render their exact `status-*` variant
  plus a word and an icon. `partial` is warning, `cancelled` is neutral and `abandoned` is
  serious.
- **DAC-E5-17**: an abandoned row carries the verbatim explanation, with Start on the same
  screen.
- **DAC-E5-S6-1**: with fake timers, one refetch occurs at exactly 10 000 ms while a
  non-terminal run is loaded, and none occurs for ten minutes after an all-terminal response.
- **AC-24, DAC-E5-S6-3**: each precondition renders `blocked`, which is focusable, has no
  `disabled` attribute and carries its own `aria-describedby` reason. Both hold → both reasons,
  depth first.
- **AC-23**: a 202 with `queuedBehind` shows the queued notice, does not navigate, and leaves
  Start `default`. A 202 without it navigates to `/runs/<id>`.
- **DAC-E5-S6-4**: the run id is an `<a href="/runs/<id>">` and rows have no click target.
- **DAC-E5-S6-5, DAC-E5-S6-6**: the queued and running dialogs differ verbatim. A `409`
  `run_already_terminal` shows *This run had already completed.* and the actual outcome, and
  never *Cancelled*.
- **DAC-E5-S6-7**: never-run and filtered-empty render different copy.
- **E2E**: start from Runs, see *Requested*, cancel through the API, and see *Cancelled*
  within one poll. Report any exclusion explicitly.

---

## Notes

### Resolved Conflicts

1. **What Start does after a `202`.**
   - The conflict: ux-design 1.1 ("the interface routes to that run's detail") and section 2
     ("Starting a run from Coverage or Runs routes to that run's detail") say to navigate.
     AC-23 says the action stays available and the interface says the new run is queued.
   - Navigating away in the queued case would unmount both the action and the notice.
   - Capability AC beats design prose. So when `queued_behind` is non-null the control stays
     and renders the ux 1.1 notice, as owner-web-app section 7 also says ("`queued_behind`
     produces the in-progress sentence").
   - When it is `null`, no AC speaks, and the ux routing applies.
   - Governing: CAP-001 AC-23 (story AC-23), then ux-design 1.1 and section 2.
2. **Blocked-reason copy.**
   - ux-design 1.1 gives the two sentences verbatim, and AC-24 repeats the second.
   - Two other texts differ: the copy in `screens/instruments/start-action.tsx` ("Start is
     blocked: history depth is not set…") and the implemented API 409 messages ("No history
     depth has been set. Configure it in Settings before running." and "No active instruments
     exist…").
   - Approved UX prose and the AC outrank code. The control renders the UX sentences, keyed
     off `error.code` and never off the message.
   - ingestion-api section 10 says the API message matches the interface copy. The E5-S5
     implementation drifted from that, which is a finding for E5-S5's doc-sync or the next
     ingestion-api revision, not for this story.
3. **Six variants against eight states.** Owner-web-app 2.5 and the story say "the six
   `status-*` variants". ux-design 5, run-journal 10 and DAC-E5-S6-2 map eight states onto
   those six tiers. This is no contradiction, and the eight-row table governs.
4. **Where cancellation renders.**
   - What the story says: it delivers "the cancel controls" (Description) and DAC-E5-S6-5/6.
   - What the designs say:
     - ux-design 1.4's Runs component mapping has no cancel, and the `history` variant allows
       "no row selection, no row actions" (data-table spec);
     - ux-design 1.5, owner-web-app 2.5 (row "1.5 Cancel run") and owner-web-app section 9
       ("Stop a run. Run detail's cancel action…") place Cancel on Run detail;
     - owner-web-app 2.1 maps `web/src/screens/runs/` to UX 1.4 **and** 1.5.
   - No story AC says on which screen the control renders, so the readings do not conflict.
   - This story delivers the reusable `CancelRunControl` in `web/src/screens/runs/`, with
     every behaviour tested (T007). CAP-001-E7-S4, whose AC-19 and AC-26 require the action on
     Run detail, mounts it.
   - The Runs table carries no row action.
5. **Start preconditions.** Owner-web-app 2.5's row says "`blocked` when depth is unset" (depth
   only). AC-24, DAC-E5-S6-3 and ux-design 1.1 require two distinct reasons. The ACs govern,
   so both reasons are implemented.
6. **owner-web-app section 7 file names.**
   - Used as named:
     - `web/src/screens/runs/outcome-badge.test.tsx`;
     - `web/src/screens/runs/cancel.test.tsx`;
     - `web/src/screens/coverage/start-run.test.tsx` for the two Start rows. That file tests
       the runs-owned control standalone, which also proves it can be composed on Coverage.
       CAP-001-E6-S4 creates no file of that name and defers these tests to this story.
   - Not used, because they belong to Run detail:
     - `run-detail.test.tsx` (CAP-001-E7-S4);
     - `tests/e2e/cancel-run.spec.ts` (capability flow 4, cancelling from Run detail with
       retained coverage);
     - `tests/e2e/first-run.spec.ts` (flow 1, which spans Run detail and Coverage).
   - Section 7 names no Runs-list, polling or client file. Those names are plan choices
     (Open Gap 8).

### Open Gaps

1. **The indeterminate progress indicator** (ux-design section 3; owner-web-app section 14,
   OQ 1; the story's Open Question).
   - This is a non-blocking component-spec gap. The Runs list renders written and failed counts
     as text, with no indicator and no estimate.
   - Absorb in: the design-system intake, `progress`.
2. **`PROVISIONAL — awaiting owner confirmation (2026-10-01)` — the Start control's interface.**
   - Undefined: no artifact fixes the export, props or post-202 behaviour that CAP-001-E6-S4
     composes (its Open Gap 7).
   - Adopted:
     - `export function StartRunControl(props: StartRunControlProps)` in
       `web/src/screens/runs/run-controls.tsx`;
     - props: optional `historyDepthYears?: number | null`, optional
       `activeInstrumentCount?: number`, and optional `onStarted?: (result: RunStartResult) => void`;
     - accessible name *Start acquisition run*;
     - post-202 behaviour: call `onStarted`, then navigate to `/runs/<runId>` when
       `queuedBehind === null`, or else stay and show the queued notice.
   - Derivation:
     - The module path and the button name are what E6-S4's mock already assumes.
     - The two precondition props are exactly the values E6-S4 says it can supply, from
       `getHistoryDepth()` and `listInstruments({ lifecycle: "active", limit: 1 }).activeCount`.
     - `null` meaning "not set" follows the existing `StartAction` prop.
     - Optional props let Coverage render the control before its reads settle, or without them,
       with the server's 409 as the backstop. So the control needs no Runs-screen state.
     - The post-202 behaviour follows Resolved Conflict 1.
     - The control owns navigation, so Coverage gets the ux section 2 routing with no wiring.
   - E6-S4 consequence: its `vi.mock("../runs/run-controls")` factory should export
     `StartRunControl`.
   - Absorb in: owner-web-app section 2.5 or 7.
3. **`PROVISIONAL — awaiting owner confirmation (2026-10-01)` — the cancel control's interface and dialog labels.**
   - Undefined: the export and props of the reusable cancel control, and the dialog's action
     labels.
   - Adopted:
     - `export function CancelRunControl({ runId, state, onSettled? })` in
       `web/src/screens/runs/cancel-run.tsx`;
     - trigger *Cancel run*, from ux 1.5 "Cancel run";
     - dismiss *Cancel*, from the dialog spec: "Cancel is always labelled 'Cancel'";
     - confirm *Stop run* (running) or *Cancel queued run* (requested), from the dialog spec's
       "the confirm label restates the verb", applied to each title's verb;
     - the result renders as an `OutcomeBadge` with no added sentence.
   - Absorb in: ux-design 1.5.
4. **`PROVISIONAL — awaiting owner confirmation (2026-10-01)` — fetch-layer names.**
   - Undefined: TypeScript names for the run contract.
   - Adopted:
     - types `RunState`, `AcquisitionRun`, `AcquisitionRunPage`, `RunStartResult` and
       `RunCancelResult`;
     - calls `listAcquisitionRuns`, `startAcquisitionRun` and `cancelAcquisitionRun`;
     - `ApiError`'s third parameter `{ code?, state? }`.
   - Derivation:
     - `RunSummary` is taken (`= null`, owned by CAP-001-E7-S3).
     - `AcquisitionRun` mirrors the resource name `acquisition-run` that the error envelope
       uses.
     - The calls follow the existing verb-noun names (`listInstruments`, `getHistoryDepth`).
   - Absorb in: owner-web-app section 2.1.
5. **`PROVISIONAL — awaiting owner confirmation (2026-10-01)` — Runs list paging.**
   - Undefined: no artifact sets how many runs the Runs screen shows, or whether it pages.
     Owner-web-app 2.6's sizing case names three tables, not Runs.
   - Adopted: render the API's default first page (50, `api/bounds.py`). When
     `next_cursor` is non-null, add the sentence *Showing the 50 most recent runs.* Add no
     pager.
   - Derivation: no S6 AC requires paging. Polling an accumulated multi-page list would be
     speculative complexity. The sentence stops the truncation being silent, which STD-UI-4's
     honesty intent requires.
   - Absorb in: ux-design 1.4.
6. **`PROVISIONAL — awaiting owner confirmation (2026-10-01)` — scope of the polling condition.**
   - Undefined: DAC-E5-S6-1 says "any run in a non-terminal state". The screen can observe only
     the runs it has loaded under the current outcome filter.
   - Adopted: poll when a run *in the latest response* is non-terminal, using chained
     `setTimeout`s at 10 000 ms.
   - Derivation: without a filter, every non-terminal run is among the newest. FIFO claim
     means queued and active runs carry the latest `requested_at` values except for runs that
     have already finished. A second unfiltered request made only to decide whether to poll
     would be speculative.
   - Absorb in: ux-design 1.4.
7. **`PROVISIONAL — awaiting owner confirmation (2026-10-01)` — Runs columns, labels and icons.**
   - Undefined: ux 1.4 lists six columns but also puts "a link in the first column". The
     visible words for each state and the icon per tier are also unset.
   - Adopted:
     - a first column, *Run*, holding the full run id as the link, with no truncation, so no
       abbreviation rule is invented;
     - labels Requested, Running, Cancelling, Succeeded, Partial, Failed, Cancelled and
       Abandoned (the state names, capitalised; *Partial* and *Cancelling* both sit in the
       warning tier and differ by word);
     - six distinct `svg` shapes, one per tier;
     - `sr-only` *Not recorded* beside the em dash for a `null` timestamp.
   - Absorb in: ux-design 1.4 and section 5.
8. **`PROVISIONAL — awaiting owner confirmation (2026-10-01)` — E2E file and shape.**
   - Undefined: owner-web-app section 7 names no Runs-only E2E. Its `cancel-run.spec.ts`
     cancels from Run detail, which does not exist yet.
   - Adopted: keep the 2026-09-11 name `tests/e2e/runs-start-cancel.spec.ts`. Start through
     the UI, cancel through the API, and assert that the poll shows *Cancelled*.
   - The UI-cancel E2E stays with CAP-001-E7-S4 or with the automation plan (TC-E2E-007/008,
     `e2e-tests-automation-tasks.md` T006).
   - Absorb in: owner-web-app section 7.
9. **`PROVISIONAL — awaiting owner confirmation (2026-10-01)` — a failed precondition read.**
   - Undefined: what Start shows when the Runs screen cannot read depth or the instrument count.
   - Adopted: leave the prop `undefined`, which renders `default`, and let the API's 409
     produce the UX reason if the owner clicks.
   - Derivation: `screens/instruments/index.tsx` degrades a failed depth read to `null`. That
     would make Start claim *History depth is not set*, which may be false. STD-UI-2 forbids a
     word the product does not mean, so the honest reading wins over the local precedent.
   - Absorb in: ux-design 1.1.
10. **`PROVISIONAL — awaiting owner confirmation (2026-10-01)` — failure copy for start, cancel
    and load.**
    - Undefined: the error sentences for these three failures.
    - Adopted:
      - *Starting an acquisition run failed: {message} (request {requestId})*;
      - *Cancelling run {runId} failed: {message} (request {requestId})*;
      - *Loading runs failed: {message} (request {requestId})*.
    - Derivation: the existing *Loading instruments failed: {message} (request {requestId})*
      in `screens/instruments/index.tsx`, which states STD-UI-19's operation, resource and
      reason.
    - Absorb in: ux-design 1.4 and 1.5.
11. **`PROVISIONAL — awaiting owner confirmation (2026-10-01)` — when both preconditions fail.**
    - Undefined: ux 1.1 says only "the depth reason is shown first".
    - Adopted: show both sentences, depth first, with both ids in `aria-describedby` in that
      order.
    - Derivation: "shown first" presupposes a second reason. Each sentence names the screen
      that fixes it, and the owner needs both.
    - Absorb in: ux-design 1.1.

### Other Notes

- **Cross-story effects on CAP-001-E6-S4 (draft plan, not edited here).** Once Open Gap 2 is
  confirmed, these should go into E6-S4's next revision:
  - Its Open Gap 7 resolves to `StartRunControl` with the props above.
  - Its screen-test mock should export `StartRunControl`.
  - Its T018 should pass `historyDepthYears` and `activeInstrumentCount`.
  - A queued-free start from Coverage navigates to `/runs/<id>` by itself.
  - Its T003 note mentions "the `web/src/api/client.test.ts` that CAP-001-E5-S6-tasks T005
    plans". This revision names that file `web/src/api/client.runs.test.ts`. The two files
    still never coincide.
  - Both stories append disjoint additions to `tailwind.config.js` (T001 here; E6-S4 T001
    adds the `value-missing` and `value-indeterminate` tokens), `types.ts`, `client.ts` and
    `routes.tsx`. Whichever lands second rebases without changing the other's lines, and
    deletes `ScreenPlaceholder` if it is unused.
- **Cross-story effect on CAP-001-E7-S4 (`todo`).**
  - Its run detail should import `CancelRunControl` from `web/src/screens/runs/cancel-run.tsx`
    and `OutcomeBadge` from `web/src/screens/runs/outcome-badge.tsx`, not rebuild them.
  - That would be a hard edge, E7-S4 → E5-S6, which its `dependencies.yaml` entry does not yet
    carry. The E7-S4 planner or the coordinator should add it. This plan updates only its own
    entry.
- **Instruments' `StartAction` is unchanged.**
  - `web/src/screens/instruments/start-action.tsx` (CAP-001-E2-S4) keeps its depth-only,
    inert control and its non-UX copy.
  - Replacing it with `StartRunControl` is outside this story. ux 1.2 maps no Start action, and
    its docstring defers starting to "whichever story owns Coverage".
  - Flagged for the owner as a follow-up.
- **No runner in the E2E environment.** `scripts/run-e2e-server.sh` launches only
  `factorflow.app_main`, so a started run stays `requested`. That is what makes T018
  deterministic, and it is also why the queued notice cannot be reached end to end.
- **Revision 2 corrected these stale items from 2026-09-11:**
  - the branch;
  - "update" of the non-existent `client.test.ts` and `types.test.ts` (dropped, since types
    carry no runtime);
  - unnamed run types;
  - the unpinned Start export;
  - the missing `ApiError` code and state;
  - the missing tier tokens;
  - the missing TC-COMP-009, 023 and 024;
  - the section 7 file names;
  - the missing TDD-evidence task;
  - the graph edges for E1-S5 and E2-S4;
  - a cancel flow that assumed row actions forbidden by the `history` variant.
- **Decision records.** This unattended run recorded every decision in this Notes section, as
  the run's instructions direct. Resolved Conflicts are decisions taken by precedence. Open
  Gaps 2–11 are provisional decisions.
