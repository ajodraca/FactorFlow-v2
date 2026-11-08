---
artifact_schema_version: 1
artifact_id: CAP-003-E6-S4-tasks
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
  timestamp: 2026-11-07T06:32:31Z
  source_artifacts:
    - id: CAP-003-E6-S4
      version: "1"
    - id: CAP-003-E6
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-data-health-ui
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-data-health-ui-tests
      version: "1"
    - id: CAP-003-E6-S1-tasks
      version: "1"
    - id: CAP-003-E1-S1-tasks
      version: "1"
    - id: CAP-003-E1-S3-tasks
      version: "1"
    - id: CAP-003-E1-S4-tasks
      version: "1"
    - id: CAP-003-E1-S5-tasks
      version: "1"
    - id: CAP-003-E1-S6-tasks
      version: "1"
    - id: CAP-003-E3-S1-tasks
      version: "1"
    - id: CAP-003-E3-S2-tasks
      version: "1"
    - id: CAP-003-E3-S3-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E6-S4 — Recent Downloads and What You Follow

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S4.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `data-health-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

The lower half of Data health shows the state of the whole download side in one place (data-health-ui 2.6; epic DAC-E6-14, DAC-E6-16, DAC-E6-17). `web/src/screens/data-health/recent-downloads.tsx` exports `RecentDownloads()`: a `section` labelled by its `h2` *Recent downloads*, a `card` `default` whose sub-line reads *Starts when you press Download now · checked {time}* (the time the list last answered, AC-25), and CAP-003-E1-S4's `DataTable` `compact` with a row header over the delivered `listAcquisitionRuns({ limit: 5 })`. The columns are *Started* (the start time, the row header, a link to `/data/downloads/{id}`), *Outcome* (`StatusBadge` over `tierOf`/`labelOf` of the download state), *Ended* (the end time, or an `Absent` em dash while not ended) and *Result* (*{written} of {named} stocks*; *Partial* with *, {failed} failed*; *Interrupted* with *FactorFlow restarted mid-download; {written} kept, the rest picked up next time*). A running download heads the list, and the row that is attention's `latest_download` carries `progress` `determinate` *{done} of {total} stocks* while it is non-terminal. The list is read on mount and re-read on each new attention answer whose `latest_download` is non-terminal, never otherwise (DAC-E6-S4-2). `web/src/screens/data-health/what-you-follow.tsx` exports `WhatYouFollow()`: a `card` `summary` description list of *Followed stocks*, *Stopped following … (history kept)*, *History depth* (*{y} years* or *not set*, a link to `/settings`) and *Market data key* (*Found* / *Missing* from `useShell().health`, or `NotDeterminable` while health is not answering, never the key's value), with **Manage followed stocks** to `/data/followed`, over the delivered `listInstruments({ limit: 1 })` and `getHistoryDepth()`. Each card's failed read keeps its header and renders *Couldn't read {recent downloads / what you follow}: {reason}.* with **Try again**, the reason coming from CAP-003-E6-S1's `readFailureReason`, never an envelope message or `request_id`. Both components call `useShell()` themselves (story *API Contract*) and take no props; CAP-003-E6-S5 mounts them. The owner-facing strings are added to CAP-003-E6-S1's `copy.ts`. The tests are `recent-downloads.test.tsx` and `what-you-follow.test.tsx`.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-4 | *What you follow* states whether the market data key was found and never displays its value | T007, T009, T010, T014 |
| AC-12 | No region presents a partial or interrupted download as complete | T002, T003, T012, T013 |
| AC-25 | The polled Recent downloads region shows its last-updated time | T003, T004, T013 |
| AC-17 | The run list and instrument reads are the delivered endpoints unchanged | T004, T007, T013, T014, T015 |
| DAC-E6-14 | Recent downloads as stated; re-read on each attention answer while non-terminal, otherwise only on load | T002, T003, T004, T012, T013 |
| DAC-E6-16 | *What you follow* renders as stated | T007, T009, T012, T014 |
| DAC-E6-17 | A failed read keeps each card's header, replaces its body with its error and **Try again**, and shows no `request_id` | T005, T008, T012, T013, T014 |
| DAC-E6-S4-1 | *Partial* warning with *{written} of {named} stocks, {failed} failed*; *Interrupted* serious with its sentence; neither reads as complete | T002, T012, T013 |
| DAC-E6-S4-2 | Three running answers give one `listAcquisitionRuns` call each and an advancing *checked {time}*; a terminal answer gives no re-read | T003, T013 |
| DAC-E6-S4-3 | Health unreachable: the key badge is `coverage-unknown`, never *Missing*, and no element carries a key value | T009, T014 |
| DAC-E6-S4-4 | No DAC-E7-3 term in visible text or accessible names in any state; every label from `labelOf` or `copy.ts` | T006, T010, T012 |
| DAC-E6-S4-5 | *Outcome* and key badges through `StatusBadge` with label text and `aria-hidden` shape; not determinable through `NotDeterminable`; em dashes through `Absent`; progressbar labelled; never colour alone | T006, T010, T013, T014 |

Mapped test cases (from `tests/component/data-health-ui-tests.md`, confirmed in `tests/coverage-matrix.md` lines 39, 47, 52, 54, 55, 59, 60, 282, 284, 285 and 300–304): **TC-COMP-154** (DAC-E6-16, AC-4, AC-17), **TC-COMP-155** (DAC-E6-17, AC-24; this story's two cards, see Other Notes), **TC-COMP-170** (DAC-E6-S4-1, DAC-E6-14, AC-12, AC-25), **TC-COMP-171** (DAC-E6-S4-2, DAC-E6-14), **TC-COMP-172** (DAC-E6-S4-3, AC-4), **TC-COMP-173** (DAC-E6-S4-4, AC-19), **TC-COMP-174** (DAC-E6-S4-5, AC-20). The specification is `status: draft`; its steps are used as written and sharpened below. The other cases on the AC-4, AC-12, AC-17 and AC-25 rows belong to other stories (Home, setup, shell, the download detail). TC-INT-021 and TC-INT-036 (AC-12 integration) belong to integration automation. No integration or end-to-end case is owned by this story.

## Phase 1: Setup

**Purpose**: Confirm the baseline and every hard dependency's export.

- [ ] T001 From the repo root run `npm ci` and `npm run test`, and record the baseline as green. Confirm, without editing anything, that each dependency's deliverable exists, and STOP and report if any is missing:
  - (CAP-003-E1-S1) `web/src/components/ui/card.tsx` exports `Card` (`variant` `"default" | "metric" | "summary"`), `CardHeader`, `CardTitle` (an `h2`), `CardDescription`, `CardContent`, `CardFooter` and `CardSummaryList` (a `dl`); `web/src/components/ui/button.tsx` exports `Button` with `variant` `outline` and `asChild`.
  - (CAP-003-E1-S3) `web/src/components/ui/progress.tsx` exports `Progress({ value: number | null; max?: number | null; "aria-labelledby": string })` (DEC-0303).
  - (CAP-003-E1-S4) `web/src/components/ui/data-table.tsx` exports `DataTable` taking `variant: "compact"`, `rowHeader`, `columns`, `data` and `getRowId`, with no `label` prop (DEC-0307).
  - (CAP-003-E1-S5) `web/src/components/patterns/tiers.ts` exports `tierOf`, `labelOf` and `type Status` with the `download` and `credential` members; `web/src/components/patterns/status-badge.tsx` exports the six-tier `StatusBadge({ tier, children })`.
  - (CAP-003-E1-S6) `web/src/components/patterns/presence.tsx` exports `Absent({ label })` and `NotDeterminable({ reason, label? })`; `web/src/components/patterns/format.ts` exports `formatInstant`, `formatClock` and `formatCount` (DEC-0309, -2).
  - (CAP-003-E3-S1) `web/src/app/shell-types.ts` exports `type Attention` with `latest_download { run_id, state, requested_at, started_at, ended_at, progress { done, total } } | null`.
  - (CAP-003-E3-S3) `web/src/app/shell-context.tsx` exports `useShell` and `type ShellContextValue` (`health: HealthState` with `liveness` and `health`, `attention: ReadState<Attention>`).
  - (CAP-003-E6-S1) `web/src/screens/data-health/copy.ts` exports `TRY_AGAIN`, `checked`, `readFailed`, `READ_TARGETS` and `readFailureReason`; `web/src/screens/data-health/check-card.tsx` exports `ReadFailure({ sentence, onRetry })` and `SkeletonLine()`.
  - The delivered `web/src/api/client.ts` exports `listAcquisitionRuns`, `listInstruments`, `getHistoryDepth`, `ApiError` and `ApiUnreachableError`, and `web/src/api/types.ts` exports `AcquisitionRun` and `RunState`.
  
  Check with `grep -nE "export (async )?(function|const|type|interface|class) (Card|CardHeader|CardTitle|CardContent|CardFooter|CardSummaryList|Button|Progress|DataTable|tierOf|labelOf|Status|StatusBadge|Absent|NotDeterminable|formatInstant|formatClock|formatCount|Attention|useShell|ShellContextValue|TRY_AGAIN|checked|readFailed|READ_TARGETS|readFailureReason|ReadFailure|SkeletonLine|listAcquisitionRuns|listInstruments|getHistoryDepth|ApiError|ApiUnreachableError|AcquisitionRun|RunState)\b" web/src/components/ui/*.tsx web/src/components/patterns/*.ts* web/src/app/shell-types.ts web/src/app/shell-context.tsx web/src/screens/data-health/*.ts* web/src/api/client.ts web/src/api/types.ts`. `recent-downloads.tsx` and `what-you-follow.tsx` do not exist yet. No package is added by this story (traces to DAC-E6-14, DAC-E6-16).

**Checkpoint**: Baseline green; every import this story makes resolves; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin each column, sentence, badge, read trigger and state before either component exists.

**Shared harness (copied into each of the two test files, since test files share no module).**

- **Client mock.** `vi.mock("../../api/client", async (importActual) => ({ ...(await importActual()), listAcquisitionRuns: vi.fn(), listInstruments: vi.fn(), getHistoryDepth: vi.fn() }))`, the pattern of the delivered `web/src/screens/settings/history-depth-form.test.tsx:7`. `ApiError` and `ApiUnreachableError` stay real.
- **Shell mock.** `const shell = vi.hoisted(() => ({ value: null as unknown as ShellContextValue }))` and `vi.mock("../../app/shell-context", () => ({ useShell: () => shell.value }))`, the consumer seam CAP-003-E3-S3's plan names (`useShell()` throws without a provider) and CAP-003-E5-S1's plan uses. A helper `setShell({ health?, attention? })` writes a full `ShellContextValue` literal: `health` defaults to `{ liveness: "answering", health: HEALTH(true), lastUpdated, lastAnsweredAt }`, `attention` to `{ kind: "loading" }`, `scores: { kind: "loading" }`, `refresh: vi.fn()`, `setTitleDetail: vi.fn()`. A test changes the shell's answer with `setShell(…)` and then `rerender(ui)`.
- **Fixtures.** Independent literals, never built by the code under test:
  - `RUN(over)` is an `AcquisitionRun` with defaults `runId "r-1"`, `state "succeeded"`, `historyDepthYears 5`, `requestedAt "2026-10-30T13:59:00Z"`, `startedAt "2026-10-30T14:00:00Z"`, `endedAt "2026-10-30T16:30:00Z"`, `instrumentsNamed 1236`, `instrumentsWritten 1236`, `instrumentsFailed 0`, `failureReason null`.
  - `PAGE(runs)` is `{ runs, nextCursor: null }`.
  - `ATT(latest)` is an `Attention` whose `latest_download` is `latest` (or `null`); `LATEST(state, over)` is `{ run_id "r-9", state, requested_at "2026-10-30T18:59:00Z", started_at "2026-10-30T19:00:00Z", ended_at null, progress { done 812, total 1236 } }` with overrides.
  - `ok(data, iso)` is `{ kind: "ok", data, checkedAt: new Date(iso) }`; each new answer gets a new `checkedAt`.
  - `HEALTH(present)` is a delivered `HealthResponse` literal with `credential_present: present`.
- **Errors.** `INTERNAL` is `new ApiError("instrument table said no", "req-9f3", { code: "internal_error" })`; `UNREACHABLE` is `new ApiUnreachableError("fetch failed")`. Neither the message nor the request id may ever reach the DOM, and the message deliberately carries a forbidden term so a leak also fails the term scan.
- **Time.** `vi.useFakeTimers({ toFake: ["Date"] })` with `vi.setSystemTime(new Date("2026-10-30T19:03:12Z"))` before each list answer is awaited, so promises resolve normally and *checked {time}* is observable. Times render in America/Chicago through CAP-003-E1-S6's formatters: `19:03:12Z` is *14:03:12 CDT* (DST ends 2026-11-01); `2026-10-30T14:00:00Z` is *2026-10-30 09:00 CDT*. Expected strings are written as literals.
- **Render.** `<MemoryRouter>` (react-router-dom 6, delivered) around `<RecentDownloads />` or `<WhatYouFollow />`. Rows are found with `getAllByRole("row")` inside `within(getByRole("region", { name: "Recent downloads" })).getByRole("table")` (the table is named by its section, DEC-0307) and cells with `within(row)`. Badges are found by `data-variant` and compared to literal values.

### Mandatory Component Tests

- [ ] T002 [P] Implement **TC-COMP-170** (Partial and Interrupted never read as complete in Recent downloads) with the DAC-E6-14 column rows. Write it as `describe("Recent downloads rows (TC-COMP-170, DAC-E6-14, DAC-E6-S4-1, AC-12)")` in a new `web/src/screens/data-health/recent-downloads.test.tsx`, with `// Implements TC-COMP-170`. Attention is `ok(ATT(null))` throughout, and `listAcquisitionRuns` resolves `PAGE([...])` with these five runs in served order:
  - `RUN({ runId "r-5", state "partial", instrumentsNamed 1236, instrumentsWritten 1230, instrumentsFailed 6 })`
  - `RUN({ runId "r-4", state "abandoned", instrumentsWritten 611 })`
  - `RUN({ runId "r-3", state "failed", instrumentsWritten 0, instrumentsFailed 0 })`
  - `RUN({ runId "r-2", state "cancelled", instrumentsWritten 400 })`
  - `RUN({ runId "r-1" })`
  
  Assertions:
  - (a) **Columns**: the column headers are exactly *Started*, *Outcome*, *Ended*, *Result*, in that order. Each body row has one `rowheader` holding a link whose name is *2026-10-30 09:00 CDT* and whose `href` is `/data/downloads/r-5` … `/data/downloads/r-1` in served order.
  - (b) **Partial** (step 1, expected 1): row `r-5`'s *Outcome* is `status-warning` *Partial*, and its *Result* cell's text is exactly *1,230 of 1,236 stocks, 6 failed*.
  - (c) **Interrupted** (expected 2): row `r-4`'s *Outcome* is `status-serious` *Interrupted*, and its *Result* is exactly *FactorFlow restarted mid-download; 611 kept, the rest picked up next time*.
  - (d) **Never complete**: neither row `r-5` nor `r-4` contains a `status-good` badge or the word *Complete*.
  - (e) **The plain form**: row `r-1` is `status-good` *Complete* with *1,236 of 1,236 stocks*; row `r-3` is `status-critical` *Failed* with *0 of 1,236 stocks*; row `r-2` is `status-neutral` *Cancelled by you* with *400 of 1,236 stocks*.
  - (f) **Ended**: each row's *Ended* cell reads *2026-10-30 11:30 CDT*.
  
  Kills:
  - swap-case `partial` → `succeeded` in the result switch (b: *, 6 failed* missing)
  - swap-case `abandoned` → the plain form (c)
  - drop-field-copy `instrumentsFailed` → `instrumentsWritten` (b: *1,230 failed*)
  - drop-field-copy `instrumentsNamed` → `instrumentsWritten` (b: *1,230 of 1,230*)
  - drop-field-copy `startedAt` in the link text (a)
  - swap-case of the link target to the delivered `/runs/` path (a)
- [ ] T003 Implement **TC-COMP-171** (Recent downloads re-read per attention answer only while running). Write it as `describe("Recent downloads re-read rule (TC-COMP-171, DAC-E6-S4-2, DAC-E6-14, AC-25)")` in `web/src/screens/data-health/recent-downloads.test.tsx`, after T002, with `// Implements TC-COMP-171`. `listAcquisitionRuns` is the spied `vi.fn()`, resolving `PAGE([RUN({ runId "r-9", state "running", endedAt null, instrumentsWritten 700 })])`.
  - (a) **Load**: mount at `19:03:12Z` with `ok(ATT(LATEST("running")), "2026-10-30T19:03:10Z")`. After the answer lands, `listAcquisitionRuns` has been called exactly once, with exactly `{ limit: 5 }` (`toHaveBeenNthCalledWith(1, { limit: 5 })`), and the sub-line reads exactly *Starts when you press Download now · checked 14:03:12 CDT*.
  - (b) **Step 1, three running answers**: for `i` in 1..3, set the system time to `19:03:12Z + 10·i s`, `setShell({ attention: ok(ATT(LATEST("running", { progress { done 812 + i, total 1236 } })), <a new checkedAt 10·i s later>) })`, `rerender`, and await. After each, the call count is `1 + i`, and the sub-line reads *… checked 14:03:22 CDT*, *14:03:32 CDT*, *14:03:42 CDT* in turn (expected 1: once per answer, and the time advances).
  - (c) **No new answer, no read**: `rerender` with the same `shell.value` object, and then with a new object carrying the same `checkedAt` instant; the count stays 4.
  - (d) **A failed attention read is not an answer**: `setShell({ attention: { kind: "error", error: INTERNAL, last: { data: ATT(LATEST("running")), checkedAt } } })`; the count stays 4.
  - (e) **Step 2, terminal answers**: deliver two new answers with `LATEST("succeeded", { ended_at "2026-10-30T19:05:00Z" })` and then `LATEST("partial", …)`. The count stays 4 after each (expected 2), and the sub-line keeps *checked 14:03:42 CDT*.
  - (f) **Terminal from the start**: a fresh render with `ok(ATT(LATEST("succeeded")))`, then two new terminal answers, and then one with `latest_download` `null`: exactly one call (the load).
  - (g) **`requested` and `cancelling` count as non-terminal**: a fresh render with a terminal answer, then one new answer with `LATEST("requested", { progress { done 0, total null } })` and one with `LATEST("cancelling")`: the count is 3.
  
  Kills:
  - negate-boolean on the non-terminal check (b or e)
  - swap-case of `cancelling` out of the non-terminal set (g)
  - a hand-written mutant keying the effect on the attention object's identity rather than `checkedAt` (c)
  - a hand-written mutant reading on an `error` attention whose `last` is non-terminal (d)
  - drop-field-copy of the list's answer time, writing attention's `checkedAt` instead (b: attention's instant is 2 s earlier than the list's in (a), so *14:03:10 CDT* would show)
  - drop-defaulted-argument `{ limit: 5 }` (a)
- [ ] T004 Implement the **progress row and ordering** half of DAC-E6-14 and the AC-17 call shape. Write it as `describe("Recent downloads progress and order (DAC-E6-14, AC-12, AC-17, DEC-0384)")` in `web/src/screens/data-health/recent-downloads.test.tsx`, after T003.
  - (a) **Determinate**: list `[RUN({ runId "r-9", state "running", endedAt null, instrumentsWritten 700 }), RUN({ runId "r-8" })]` with attention `ok(ATT(LATEST("running", { run_id "r-9", progress { done 812, total 1236 } })))`. Row `r-9` is the first body row; its *Outcome* is `status-active` *Downloading*; its *Ended* cell is an `Absent` em dash (`aria-hidden` *—* and the hidden text *not ended yet*); its *Result* cell holds `getByRole("progressbar", { name: "812 of 1,236 stocks" })` with `aria-valuenow="812"`, `aria-valuemin="0"` and `aria-valuemax="1236"`, and it does not contain *700 of 1,236 stocks*. The visible label carries `aria-live="polite"`. Row `r-8` has no progressbar.
  - (b) **Indeterminate while the total is null** (DEC-0384): list `[RUN({ runId "r-9", state "requested", startedAt null, endedAt null, instrumentsNamed 0, instrumentsWritten 0 })]` with `LATEST("requested", { run_id "r-9", started_at null, progress { done 0, total null } })`. The row's progressbar has no `aria-valuenow` attribute and its accessible name is exactly *Queued*, the row's outcome label. The row's text contains no *0 of 0* and no *of null*.
  - (c) **Started for a queued row** (Resolved Conflict 4): in (b), the row header link reads *2026-10-30 13:59 CDT* (`requestedAt`), never a dash, and still links to `/data/downloads/r-9`.
  - (d) **Progress only from a matching, non-terminal latest download**: the (a) list with `LATEST("running", { run_id "r-7" })` gives no progressbar, and row `r-9`'s *Result* is *700 of 1,236 stocks*. The (a) list with `LATEST("succeeded", { run_id "r-9" })` gives no progressbar either.
  - (e) **A running download heads the list** (Resolved Conflict 3): served order `[RUN({ runId "r-6", state "cancelled" }), RUN({ runId "r-5", state "requested", startedAt null, endedAt null }), RUN({ runId "r-4", state "running", endedAt null }), RUN({ runId "r-3", state "partial" }), RUN({ runId "r-2" })]` renders the row headers in the order `r-4`, `r-5`, `r-6`, `r-3`, `r-2`. Served order `[r-4 running, r-3 partial, r-2 succeeded]` renders unchanged.
  - (f) **AC-17**: every call to `listAcquisitionRuns` in this file is exactly `{ limit: 5 }` (no `state`, no `cursor`), checked over `mock.calls` in an `afterEach`.
  
  Kills:
  - negate-boolean on the `run_id ===` match (d)
  - negate-boolean on the non-terminal guard of the progress row (d, second case)
  - swap-case `total` → `done` as `max` (a: `aria-valuemax="812"`)
  - drop-field-copy of `aria-labelledby` to the outcome label (b: the progressbar has no name)
  - swap-case of the order rank between `running` and `requested` (e: `r-5` first)
  - negate-boolean on `startedAt ?? requestedAt` (c: a crash or *null*)
- [ ] T005 Implement **TC-COMP-155 (Recent downloads half)**. Write it as `describe("Recent downloads read failure (TC-COMP-155, DAC-E6-17, AC-24)")` in `web/src/screens/data-health/recent-downloads.test.tsx`, after T004, with `// Implements TC-COMP-155`.
  - (a) **Loading**: while `listAcquisitionRuns` is a pending promise, the `h2` *Recent downloads* is present, a descendant of the section carries `aria-busy="true"`, and no `table` renders.
  - (b) **Step 1, a `500` envelope**: `listAcquisitionRuns` rejects with `INTERNAL`. The `h2` is kept, a `role="status"` element reads exactly *Couldn't read recent downloads: FactorFlow hit an unexpected problem.*, a button *Try again* is present, and no `table` renders.
  - (c) **Step 2**: `container.textContent` contains neither *req-9f3* nor *instrument table said no*, and no attribute value in the section contains *req-9f3*.
  - (d) **Unreachable**: rejecting with `UNREACHABLE` gives *Couldn't read recent downloads: FactorFlow is not answering.*
  - (e) **Try again**: with the next call resolving a page of one run, clicking *Try again* makes exactly one more `listAcquisitionRuns({ limit: 5 })` call, and the table renders with that row.
  - (f) **A failed re-read after a success**: after a page has rendered, a running attention answer triggers a re-read that rejects with `INTERNAL`. The error body replaces the table (DAC-E6-17), the `h2` stays, and the sub-line keeps the last answered time *checked 14:03:12 CDT*.
  
  Kills:
  - remove-attribute of the `h2` from the error branch (b)
  - a hand-written mutant rendering `error.message` as the reason (c)
  - negate-boolean on the error branch's `kind === "error"` (b: an empty table renders)
  - drop-field-copy of the retry callback (e)
- [ ] T006 Implement **TC-COMP-173 and TC-COMP-174 (Recent downloads half)**. Write them as `describe("Recent downloads vocabulary and badges (TC-COMP-173, TC-COMP-174, DAC-E6-S4-4, DAC-E6-S4-5)")` in `web/src/screens/data-health/recent-downloads.test.tsx`, after T005, with both `// Implements` comments. A module-local `visibleAndAccessibleText(container)` joins `container.textContent` with every `aria-label`, `title` and `aria-describedby`/`aria-labelledby`-referenced text.
  - (a) Render every state of T002 to T005 (the five outcome rows, all eight run states including `cancelling`, the determinate and indeterminate progress rows, loading, both errors). The joined text never matches `/\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`. A planted case proves the regex is not vacuous: `"one run"` and `"Retired"` match, and `"downloads"` does not.
  - (b) For each of the eight states, the *Outcome* cell's `[data-variant^="status-"]` badge has exactly the literal label of the CAP-003-E1-S5 table (*Queued*, *Downloading*, *Stopping*, *Complete*, *Partial*, *Failed*, *Cancelled by you*, *Interrupted*) as its text and contains an `svg[aria-hidden="true"]`; no badge or icon carries an `aria-label` that replaces the words.
  - (c) Every em dash in the table is inside an `Absent` (`[aria-hidden="true"]` *—* with a sibling `.sr-only` *not ended yet*); no cell is empty and no cell reads `null` or `0` for a missing time.
  - (d) The progressbar is named by visible text (T004 (a), (b)); no state is conveyed by colour alone: every `status-*` badge carries both text and an icon.
  
  Kills:
  - swap-case `labelOf` → the raw `state` as badge text (a: *abandoned* passes, but (b) fails; *requested* etc.)
  - a hand-written mutant rendering the outcome in a bare `span` without `StatusBadge` (b)
  - swap-case `Absent` → an empty string for a null `endedAt` (c)
- [ ] T007 [P] Implement **TC-COMP-154** (What you follow lines, key badge and Manage link). Write it as `describe("What you follow (TC-COMP-154, DAC-E6-16, AC-4, AC-17)")` in a new `web/src/screens/data-health/what-you-follow.test.tsx`, with `// Implements TC-COMP-154`. `listInstruments` resolves `{ rows: [], activeCount, retiredCount, nextCursor: null }` and `getHistoryDepth` resolves `{ years, updatedAt: "2026-10-01T12:00:00Z" }`.
  - (a) **Step 1** (`activeCount` 30, `retiredCount` 2, `years` 5, health answering with `credential_present: true`): the region named *What you follow* is a `section` whose `h2` is *What you follow* and whose card has `data-variant="summary"`. Its `dl` pairs are, in order, `term` *Followed stocks* with `definition` *30*; *Stopped following* with *2 (history kept)*; *History depth* with *5 years*, which is a link with `href="/settings"`; *Market data key* with a `status-good` badge *Found*. A link named *Manage followed stocks* has `href="/data/followed"`.
  - (b) **Step 2** (`years` null, health `{ liveness: "unreachable", health: HEALTH(true), … }`): *History depth* reads *not set*, a link with `href="/settings"`; the key definition holds a `coverage-unknown` badge *Not determinable* (T009 asserts the rest).
  - (c) **TC edge, key missing**: health answering with `credential_present: false` gives a `status-critical` badge *Missing*.
  - (d) **Counts through `formatCount`**: `activeCount` 1236 gives *1,236*.
  - (e) **AC-17**: `listInstruments` was called exactly once with exactly `{ limit: 1 }`, and `getHistoryDepth` exactly once with no argument.
  
  Kills:
  - drop-field-copy `retiredCount` → `activeCount` (a: *30 (history kept)*)
  - negate-boolean on `years === null` (b)
  - negate-boolean on `credential_present` (a, c)
  - drop-defaulted-argument `{ limit: 1 }` (e)
  - remove-attribute of the depth link's `to` (a, b)
- [ ] T008 Implement **TC-COMP-155 (What you follow half)**. Write it as `describe("What you follow read failure (TC-COMP-155, DAC-E6-17, AC-24)")` in `web/src/screens/data-health/what-you-follow.test.tsx`, after T007, with `// Implements TC-COMP-155`.
  - (a) **Loading**: while either read is pending, the `h2` is present, a descendant carries `aria-busy="true"`, and no `dl` renders.
  - (b) **Step 1**: `listInstruments` rejects with `INTERNAL` (and `getHistoryDepth` resolves). The `h2` is kept, a `role="status"` element reads exactly *Couldn't read what you follow: FactorFlow hit an unexpected problem.*, a *Try again* button is present, and no `dl` and no *Manage followed stocks* link render.
  - (c) The same with only `getHistoryDepth` rejecting with `UNREACHABLE`: *Couldn't read what you follow: FactorFlow is not answering.*
  - (d) **Step 2**: neither *req-9f3* nor *instrument table said no* appears in `container.textContent` or in any attribute.
  - (e) **Try again**: with both next calls resolving, one click makes exactly one more call to each of `listInstruments` and `getHistoryDepth`, and the `dl` renders.
  
  Kills:
  - a hand-written mutant awaiting only `listInstruments` (c: no error renders)
  - a hand-written mutant rendering `error.message` (d)
  - drop-field-copy of the retry callback (e)
- [ ] T009 Implement **TC-COMP-172** (What you follow key badge while unreachable is Not determinable, never the value). Write it as `describe("Market data key while health is not answering (TC-COMP-172, DAC-E6-S4-3, AC-4, DEC-0385)")` in `web/src/screens/data-health/what-you-follow.test.tsx`, after T008, with `// Implements TC-COMP-172`.
  - (a) **Step 1**: health `{ liveness: "unreachable", health: HEALTH(false), … }`, so the stale last value says the key is absent. The key definition holds a `coverage-unknown` badge *Not determinable* whose accessible description is *FactorFlow is not answering*, and the section contains no `status-critical` badge and no *Missing*.
  - (b) The same with `liveness: "unknown"` and `health: null` (before the first answer): the same `NotDeterminable` rendering.
  - (c) **Step 2, no key value**: the `HEALTH` fixture is extended with a planted `credential: "sk-live-PLANTED"` field via a cast (simulating a server that leaked one); in (a), (b) and T007 (a), neither `container.innerHTML` nor any attribute contains *PLANTED*. A source check reads `what-you-follow.tsx` as text and asserts the only `health.health` field it names is `credential_present` (`/health\.health\??\.(\w+)/g` matches only `credential_present`).
  
  Kills:
  - negate-boolean on `liveness === "answering"` (a: *Missing* from the stale value)
  - a hand-written mutant keying on `health.health !== null` alone (a: the stale `false` gives *Missing*)
  - a hand-written mutant spreading `health.health` into the badge's props (c)
- [ ] T010 Implement **TC-COMP-173 and TC-COMP-174 (What you follow half)**. Write them as `describe("What you follow vocabulary and badges (TC-COMP-173, TC-COMP-174, DAC-E6-S4-4, DAC-E6-S4-5)")` in `web/src/screens/data-health/what-you-follow.test.tsx`, after T009, with both `// Implements` comments and the same local helper and planted case as T006.
  - (a) Render every state of T007 to T009 (loaded with the key found, missing and not determinable; depth set and not set; loading; both errors). The joined text never matches the DAC-E7-3 regex. In particular *Stopped following* appears and *Retired* does not, and *Market data key* appears and *Provider credential* does not.
  - (b) *Found* and *Missing* are `status-good` and `status-critical` badges whose text is exactly the label and which contain an `svg[aria-hidden="true"]`.
  - (c) *Not determinable* is a `coverage-unknown` badge with an accessible description, never a `status-*` badge, an em dash or plain text.
  
  Kills:
  - swap-case `NotDeterminable` → `StatusBadge tier="neutral"` (c)
  - swap-case of the `credential` labels to the delivered *Good* / *Critical* words of `credential-status.tsx` (b)

### Additional Unit Tests

- [ ] T011 Write the copy cases as `describe("copy.ts recent downloads and what you follow strings")` in `web/src/screens/data-health/recent-downloads.test.tsx`, after T006.
  - (a) `writtenOf("1,230", "1,236")` is *1,230 of 1,236 stocks*; `partialResult("1,230", "1,236", "6")` is *1,230 of 1,236 stocks, 6 failed*; `interruptedResult("611")` is *FactorFlow restarted mid-download; 611 kept, the rest picked up next time*; `progressOf("812", "1,236")` is *812 of 1,236 stocks*.
  - (b) `readFailed(READ_TARGETS.recentDownloads, "x")` is exactly *Couldn't read recent downloads: x.* and `readFailed(READ_TARGETS.whatYouFollow, "x")` is exactly *Couldn't read what you follow: x.*, the DAC-E6-17 wording.
  - (c) `recentDownloadsSubline(null)` is *Starts when you press Download now* and `recentDownloadsSubline("14:03:12 CDT")` is *Starts when you press Download now · checked 14:03:12 CDT*.
  - (d) `historyKept("2")` is *2 (history kept)* and `depthYears("5")` is *5 years*.
  
  Kills:
  - swap-case of the partial and plain result forms (a)
  - negate-boolean on the sub-line's `time === null` (c)

**Checkpoint**: All Phase 2 tests exist and fail, because `recent-downloads.tsx`, `what-you-follow.tsx` and the new `copy.ts` exports do not exist, so the imports fail. Every delivered test and CAP-003-E6-S1's tests still pass.

---

## Phase 3: Core Implementation

**Purpose**: The strings, the downloads table with its re-read rule, and the follow summary.

- [ ] T012 Extend CAP-003-E6-S1's `web/src/screens/data-health/copy.ts` (append only; S1's exports are unchanged). Strings are verbatim from data-health-ui 2.6, ux-design 1.4 and epic DAC-E6-14, DAC-E6-16 and DAC-E6-17 unless marked:
  - `READ_TARGETS` gains `recentDownloads: "recent downloads"` and `whatYouFollow: "what you follow"`.
  - Recent downloads:
    - `RECENT_DOWNLOADS`: *Recent downloads* (the `h2`, which names the section and so the table, DEC-0307)
    - `recentDownloadsSubline(time: string | null)`: *Starts when you press Download now*, plus *· checked {time}* through S1's `checked(time)` when `time` is non-null (ux-design 1.4 item 4; Resolved Conflict 5)
    - `DOWNLOAD_COLUMNS`: `{ started: "Started", outcome: "Outcome", ended: "Ended", result: "Result" }`
    - `writtenOf(w, n)`: *{w} of {n} stocks*
    - `partialResult(w, n, f)`: *{w} of {n} stocks, {f} failed*
    - `interruptedResult(w)`: *FactorFlow restarted mid-download; {w} kept, the rest picked up next time*
    - `progressOf(done, total)`: *{done} of {total} stocks*
    - `ABSENT` gains `notEnded: "not ended yet"` (hidden words, Other Notes)
  - What you follow:
    - `WHAT_YOU_FOLLOW`: *What you follow*
    - `FOLLOWED_STOCKS`: *Followed stocks*; `STOPPED_FOLLOWING`: *Stopped following*; `historyKept(k)`: *{k} (history kept)*
    - `HISTORY_DEPTH`: *History depth*; `depthYears(y)`: *{y} years*; `DEPTH_NOT_SET`: *not set*
    - `MARKET_DATA_KEY`: *Market data key*
    - `KEY_NOT_DETERMINABLE_REASON`: *FactorFlow is not answering* (DEC-0385), with a comment that it is the same clause as `readFailureReason`'s unreachable case (DEC-0373)
    - `MANAGE_FOLLOWED_STOCKS`: *Manage followed stocks*
  
  Counts are passed in already formatted (`formatCount`), so the functions take strings. No string carries a DAC-E7-3 term, and no unit or hex literal appears, comments included (CAP-003-E6-S5 adds this directory to `token-literals.test.ts`). Makes T011 pass and supplies T002–T010.
- [ ] T013 Create `web/src/screens/data-health/recent-downloads.tsx` exporting `RecentDownloads(): JSX.Element`. Module doc comment cites data-health-ui 2.6 and 10, DAC-E6-14, DAC-E6-17, DAC-E6-S4-1, DAC-E6-S4-2, AC-12, AC-25, DEC-0213 (f), and Resolved Conflicts 2–4.
  - **Inputs.** `const { attention } = useShell()`. A module-local `NON_TERMINAL: ReadonlySet<RunState> = new Set(["requested", "running", "cancelling"])` (owner-shell 2.4; the same set CAP-003-E3-S3 keeps private). `latest = attention.kind === "ok" ? attention.data.latest_download : null`; `active = latest !== null && NON_TERMINAL.has(latest.state)`.
  - **List state.** `useState<{ kind: "loading" } | { kind: "ok"; runs: AcquisitionRun[] } | { kind: "error"; error: ApiError | ApiUnreachableError }>` plus `answeredAt: Date | null`. `read()` calls `listAcquisitionRuns({ limit: 5 })`; a `useRef` request counter makes only the latest call's settlement apply. On success it sets `{ kind: "ok", runs }` and `answeredAt = new Date()` (the time the list answered, AC-25); on failure it sets `{ kind: "error", error }` and leaves `answeredAt` as it was. Any other thrown value is rethrown.
  - **When it reads** (DAC-E6-14, DAC-E6-S4-2). One `useEffect` with `[]` reads once on mount. A second `useEffect` keyed on `answerKey = attention.kind === "ok" ? attention.checkedAt.getTime() : null` reads when `answerKey` is non-null, differs from a `useRef` holding the last key it has seen (initialised to the mount-time key, so the mount answer is not read twice), and `active` is true; it records the key either way. No timer and no other trigger exists.
  - **Order.** A module-local `rank(state)` gives `running` and `cancelling` 0, `requested` 1 and every terminal state 2. The rows are the served rows stably sorted by `rank` (Resolved Conflict 3).
  - **Columns** (`useMemo` on `latest` and the progress values, so `columns` stays referentially stable between answers that change nothing, per the E1-S4 doc comment), `ColumnDef<AcquisitionRun>[]`:
    - *Started*: `<Link to={`/data/downloads/${encodeURIComponent(r.runId)}`}>{formatInstant(r.startedAt ?? r.requestedAt)}</Link>` (Resolved Conflict 4); the cell is the row header.
    - *Outcome*: `<span id={outcomeId(r)}><StatusBadge tier={tierOf(s)}>{labelOf(s)}</StatusBadge></span>`, with `s = { of: "download", state: r.state }` and `outcomeId` a `useId()` prefix plus the run id.
    - *Ended*: `formatInstant(r.endedAt)`, or `<Absent label={ABSENT.notEnded} />` when `endedAt` is null.
    - *Result*: when `active && latest.run_id === r.runId`, the progress cell: with `latest.progress.total !== null`, `<span id={labelId} aria-live="polite">{progressOf(formatCount(done), formatCount(total))}</span>` and `<Progress value={done} max={total} aria-labelledby={labelId} />`; with `total === null`, `<Progress value={null} max={null} aria-labelledby={outcomeId(r)} />` and no count text (DEC-0384). Otherwise by `r.state`: `partial` gives `partialResult(…)`, `abandoned` gives `interruptedResult(formatCount(instrumentsWritten))`, and every other state gives `writtenOf(…)`. Counts go through `formatCount`.
  - **Render.** `<section aria-labelledby={headingId}>` around `<Card variant="default">`. `CardHeader` holds `<CardTitle id={headingId}>{RECENT_DOWNLOADS}</CardTitle>` and `<CardDescription className="text-xs">{recentDownloadsSubline(answeredAt && formatClock(answeredAt))}</CardDescription>`. `CardContent` holds, by list state: `loading`, three `SkeletonLine`s; `error`, `<ReadFailure sentence={readFailed(READ_TARGETS.recentDownloads, readFailureReason(error))} onRetry={read} />`; `ok`, `<DataTable variant="compact" rowHeader columns={columns} data={ordered} getRowId={(r) => r.runId} />`. `DataTable` takes no `label` (DEC-0307); the enclosing `section`, labelled by the `h2`, names the table. Nothing here moves focus.
  - **Imports.** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` from `../../components/ui/card`; `DataTable` from `../../components/ui/data-table`; `Progress` from `../../components/ui/progress`; `StatusBadge` from `../../components/patterns/status-badge`; `tierOf`, `labelOf` from `../../components/patterns/tiers`; `Absent` from `../../components/patterns/presence`; `formatInstant`, `formatClock`, `formatCount` from `../../components/patterns/format`; `useShell` from `../../app/shell-context`; `type { RunState, AcquisitionRun }` from `../../api/types`; `listAcquisitionRuns`, `ApiError`, `ApiUnreachableError` from `../../api/client`; `ReadFailure`, `SkeletonLine` from `./check-card`; the strings from `./copy`.
  
  Depends on T012. Makes T002–T006 pass.
- [ ] T014 [P] Create `web/src/screens/data-health/what-you-follow.tsx` exporting `WhatYouFollow(): JSX.Element`. Module doc comment cites data-health-ui 2.6 and 4 ("the key's value never appears"), DAC-E6-16, DAC-E6-17, DAC-E6-S4-3, AC-4 and AC-17, and DEC-0385.
  - **Reads.** `useState<{ kind: "loading" } | { kind: "ok"; counts: InstrumentListResult; depth: HistoryDepth } | { kind: "error"; error: ApiError | ApiUnreachableError }>`. `read()` sets `loading` and awaits `Promise.all([listInstruments({ limit: 1 }), getHistoryDepth()])`, with the same latest-call guard as T013; a rejection of either sets `error`. It runs once on mount and on **Try again**, never otherwise.
  - **Key.** `const { health } = useShell()`. When `health.liveness === "answering" && health.health !== null`, `present = health.health.credential_present` and the badge is `<StatusBadge tier={tierOf({ of: "credential", present })}>{labelOf({ of: "credential", present })}</StatusBadge>`. Otherwise it is `<NotDeterminable reason={KEY_NOT_DETERMINABLE_REASON} />`, never derived from the last value that `health` keeps while unreachable (Resolved Conflict 6). No other field of `health.health` is read.
  - **Render.** `<section aria-labelledby={headingId}>` around `<Card variant="summary">`, with `CardHeader` and `<CardTitle id={headingId}>{WHAT_YOU_FOLLOW}</CardTitle>`. `CardContent` holds, by state: `loading`, three `SkeletonLine`s; `error`, `ReadFailure` with `readFailed(READ_TARGETS.whatYouFollow, readFailureReason(error))` and `onRetry={read}`; `ok`, a `CardSummaryList` (`grid grid-cols-[auto_1fr] gap-x-4 gap-y-2`, token classes) of four `dt`/`dd` pairs in this order: `FOLLOWED_STOCKS` / `formatCount(activeCount)`; `STOPPED_FOLLOWING` / `historyKept(formatCount(retiredCount))`; `HISTORY_DEPTH` / `<Link to="/settings">{years === null ? DEPTH_NOT_SET : depthYears(formatCount(years))}</Link>` (Resolved Conflict 1); `MARKET_DATA_KEY` / the key badge. When `ok`, `CardFooter` holds `<Button variant="outline" asChild><Link to="/data/followed">{MANAGE_FOLLOWED_STOCKS}</Link></Button>`.
  - **Imports.** The card parts and `CardSummaryList` from `../../components/ui/card`; `Button` from `../../components/ui/button`; `StatusBadge`, `tierOf`, `labelOf`, `NotDeterminable`, `formatCount` from the patterns; `useShell` from `../../app/shell-context`; `listInstruments`, `getHistoryDepth`, `ApiError`, `ApiUnreachableError` from `../../api/client`; `type { InstrumentListResult, HistoryDepth }` from `../../api/types`; `ReadFailure`, `SkeletonLine` from `./check-card`; the strings from `./copy`.
  
  Depends on T012. Makes T007–T010 pass.

**Checkpoint**: `npx vitest run web/src/screens/data-health` is green; the module adds exactly `RecentDownloads`, `WhatYouFollow` and the new `copy.ts` exports, and CAP-003-E6-S1's tests are unchanged and green.

---

## Phase 4: Integration

**Purpose**: Prove the new files sit cleanly in the delivered suite and the shared scans.

- [ ] T015 Run the whole Vitest suite (`npm run test`) unchanged. It includes `web/src/api/render.test.tsx`, which forbids `dangerouslySetInnerHTML` under `web/src` (data-health-ui 4), and, when present, `web/src/components/token-literals.test.ts` (CAP-003-E1-S1). This story does not widen that scan's directory list; CAP-003-E6-S5 does (DAC-E6-S5-4). Run that future scan by hand now: `grep -nE "[0-9](px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(" web/src/screens/data-health/recent-downloads.tsx web/src/screens/data-health/what-you-follow.tsx web/src/screens/data-health/copy.ts` prints nothing. Then confirm with `git status --short web/ package.json` that the only changes are `copy.ts` (modified) and the four new files under `web/src/screens/data-health/`, and that `web/src/api/client.ts`, `web/src/api/types.ts` and `package.json` are untouched (AC-17; traces to DAC-E6-14, DAC-E6-16).

**Checkpoint**: The whole suite is green, the future literal scan is clean, and only this story's five files changed.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [ ] T016 Run `npm run lint`, `npm run format` and `npx tsc --noEmit` from the repo root. Format only this story's files with `npx biome format --write web/src/screens/data-health/recent-downloads.tsx web/src/screens/data-health/recent-downloads.test.tsx web/src/screens/data-health/what-you-follow.tsx web/src/screens/data-health/what-you-follow.test.tsx web/src/screens/data-health/copy.ts`. Then run `npm run build`. Finally run the mutation pass, `python3 scripts/mutation-run.py run --command "npx vitest run web/src/screens/data-health && npx tsc --noEmit"`, over `recent-downloads.tsx`, `what-you-follow.tsx` and the lines this story adds to `copy.ts`, with the hand-written mutants in Other Notes. It must leave no surviving non-equivalent mutant (traces to DAC-E6-14, DAC-E6-16, DAC-E6-17).
- [ ] T017 After each TDD cycle, and not once at the end:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Append the cycle to `CAP-003-E6-S4-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block that `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.
  
  Do this before the next cycle begins. `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is planned.
  
  The cycles:
  1. T002, T011 and the Recent downloads strings of T012, with T013's columns, order and load read.
  2. T003 and T004, with T013's re-read rule and progress row.
  3. T005 and T006, with T013's loading and error bodies.
  4. T007 and the What you follow strings of T012, with T014's loaded body.
  5. T008, T009 and T010, with T014's loading, error and key rules.
  
  T015 and T016 add no behaviour and join cycle 5's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC).

**Checkpoint**: Every acceptance criterion is satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S1 | hard | `Card` (`default`, `summary`), its parts and `CardSummaryList`, `Button` (`outline`, `asChild`) from `web/src/components/ui/` (E1-S1 plan T014). Existing edge |
| CAP-003-E1-S3 | hard | `Progress` with `value`, `max` and the required `aria-labelledby` (E1-S3 plan T015, DEC-0303). Existing edge |
| CAP-003-E1-S4 | hard | `DataTable` `compact` with `rowHeader` (E1-S4 plan T009, Resolved Conflict 3, DEC-0307). Existing edge |
| CAP-003-E1-S5 | hard | `tierOf`, `labelOf` (`download`, `credential` members) and the six-tier `StatusBadge` (E1-S5 plan T006, T007). Existing edge |
| CAP-003-E1-S6 | hard | `Absent`, `NotDeterminable`, `formatInstant`, `formatClock`, `formatCount` (E1-S6 plan T006, T007). Existing edge |
| CAP-003-E3-S1 | hard | `type Attention` (the `latest_download` shape) from `web/src/app/shell-types.ts` (E3-S1 plan T009). **Added by this plan**; it was reached only transitively through E3-S3 |
| CAP-003-E3-S3 | hard | `useShell` and `type ShellContextValue` from `web/src/app/shell-context.tsx` (E3-S3 plan T009). Existing edge |
| CAP-003-E6-S1 | hard | `copy.ts` (`TRY_AGAIN`, `checked`, `readFailed`, `READ_TARGETS`, `readFailureReason`, `ABSENT`), which this story extends, and `ReadFailure` and `SkeletonLine` from `check-card.tsx` (E6-S1 plan T012, T013). Existing edge |
| CAP-003-E3-S2 | context | Its `HealthState` keeps `health` at its last value while unreachable (E3-S2 plan T011), which is why the key keys on `liveness` (Resolved Conflict 6). Nothing is imported from `health.tsx`; the type arrives through `ShellContextValue` |
| CAP-003-E6-S5 | reverse | `DataHealthScreen` mounts `<RecentDownloads />` and `<WhatYouFollow />` in the lower columns and decides when Recent downloads renders under the empty card (S5 Dependencies; DAC-E6-6). Graph: E6-S5 depends on E6-S4 |
| CAP-003-E6-S3 | context | Its **Stop following** changes the stopped-following count this card shows; nothing is imported either way (Other Notes, stale counts) |
| CAP-003-E5-S1 | context | Its plan's `vi.mock("../../app/shell-context")` harness is the consumer test seam this plan copies; nothing is imported from it |

New hard edge added to `dependencies.yaml`: `CAP-003-E3-S1` on the `CAP-003-E6-S4` line.

### Task Dependencies

- T001: no dependencies.
- T002 → T003 → T004 → T005 → T006 → T011: same file (`recent-downloads.test.tsx`), sequential, after T001.
- T007 → T008 → T009 → T010: same file (`what-you-follow.test.tsx`), sequential, after T001. This chain can run in parallel with the `recent-downloads.test.tsx` chain.
- T012: depends on T001; its tests exist first per the T017 cycles.
- T013: depends on T012.
- T014: depends on T012; can run in parallel with T013 (different file).
- T015: depends on T013 and T014.
- T016: depends on T015.
- T017: interleaved; it runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- The two test files can be written in parallel.
- T013 and T014 can be written in parallel once T012 exists.

---

## Validation Plan

### Constitution-Defined Commands

(`docs/constitution/tech-stack.md` v7 Validation Commands, working directory `.`)

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test` (Vitest; also drives a real Vite build)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`

The Python commands do not apply, because no file under `src/` is touched. `npm run test:e2e` does not apply: no end-to-end case belongs to this story.

### Story-Specific Validation

- **DAC-E6-S4-1 and AC-12**: T002 passes; the *Partial* and *Interrupted* rows carry no `status-good` badge and no *Complete*.
- **DAC-E6-S4-2, DAC-E6-14 and AC-25**: T003 passes: exactly one load read, one read per running answer, none per terminal or failed answer, and the sub-line's time advances with each list answer. `grep -nE "setInterval|setTimeout" web/src/screens/data-health/recent-downloads.tsx web/src/screens/data-health/what-you-follow.tsx` prints nothing.
- **DAC-E6-14 progress and order**: T004 passes.
- **DAC-E6-16 and AC-4**: T007 and T009 pass. `grep -n "health\.health" web/src/screens/data-health/what-you-follow.tsx` shows only `credential_present` reads.
- **DAC-E6-17**: T005 and T008 pass; `grep -nE "\.message|requestId" web/src/screens/data-health/recent-downloads.tsx web/src/screens/data-health/what-you-follow.tsx` prints nothing.
- **AC-17**: T004 (f) and T007 (e) pass, and T015's `git status` shows `web/src/api/` untouched.
- **DAC-E6-S4-4 (AC-19)**: T006 and T010 pass over every state. The term regex is applied to rendered text and accessible names only; no source scan is planned, so no doc comment can trip it.
- **DAC-E6-S4-5 (AC-20)**: T006 (b)–(d) and T010 (b)–(c) pass.
- **AC-26, ahead of CAP-003-E6-S5**: T015's literal grep is clean.

---

## Notes

### Resolved Conflicts

1. ***History depth* as a link in both forms.** DAC-E6-16 and data-health-ui 2.6 read "*{y} years* or *not set* as a link to `/settings`", which could attach the link to *not set* alone. TC-COMP-154's expected result makes *History depth 5 years* a link to `/settings` as well as *not set*. The design prose is ambiguous rather than contrary, and the test case states the reading; both values are links (T007 (a), (b); T014).
2. **Re-read only while non-terminal, including the answer that reports the end.** owner-shell 2.3 gives `useDataHealth()` a one-off re-read when `latest_download` turns terminal; a reader could carry that over to the list. **Governing:** epic DAC-E6-14 ("re-read on each attention answer while `latest_download` is non-terminal and otherwise only on load"), story DAC-E6-S4-2 ("given a terminal `latest_download`, Then no re-read follows an answer") and TC-COMP-171 step 2. No transition read is added (T003 (e)). The consequence is Open Gap 3.
3. **What "a running download heads the list" means against the served order.** `GET /api/acquisition-runs` is newest first by `requested_at` (`src/factorflow/runs/queries.py:258`), so a queued download, or one cancelled while queued, can be newer than the running one. **Governing:** epic DAC-E6-14 ("a running download MUST head the list"), with the delivered precedent `web/src/screens/runs/run-table.tsx`, which pins non-terminal runs first, stably (ladder step 5). Rows are stably sorted with `running` and `cancelling` first, then `requested`, then the terminal states (T004 (e)).
4. **The *Started* cell when `started_at` is null, and which row carries the progress** (register G14). A queued row has no start time, yet the cell is the row header and the link. The permanent naming of a download is "the start time, else the request time" (system design OQ1 as answered on 2026-10-25; epic DAC-E1-9; `formatDownloadName` in CAP-003-E1-S6), so the cell renders `formatInstant(startedAt ?? requestedAt)` (ladder step 5). The progress belongs to the row whose `runId` equals attention's `latest_download.run_id`: `LATEST_DOWNLOAD_SQL` selects the run with the greatest `requested_at` (data-health-reader 2.6), the same key the list orders by, so the two name the same download (ladder step 4). Neither is a genuine gap.
5. **The Recent downloads sub-line** (register G17). data-health-ui 2.6 puts *Starts when you press Download now* on the card and *checked {time}* in the header; ux-design 1.4 item 4 writes one sub-line *Starts when you press Download now · checked {time}* under the `h2`. They are compatible; ux-design's single line is the more specific statement and is rendered (T003 (a); T012).
6. **The key badge while health is not answering.** `useShell().health.health` keeps its last value while `liveness` is `unreachable` (CAP-003-E3-S2 plan T011; the delivered `status-region.tsx`), so `credential_present` alone could show a stale *Missing*. **Governing:** DAC-E6-S4-3 and ux-design 1.4 States (Unavailable: "the key presence `coverage-unknown` while health is unreachable"). The badge keys on `liveness === "answering"`, and `unknown` is treated like `unreachable`, as the delivered `web/src/screens/settings/credential-status.tsx` `badgeFor` does (T009 (a), (b)).
7. **A failed read's last value.** owner-shell 2.4 keeps a failed shell read's last value. These two reads are this component's own, and DAC-E6-17 says a failed read "replace[s] its body with its error". **Governing:** DAC-E6-17, so a failed re-read replaces the table, while the header keeps the last answered time (T005 (f)).

### Open Gaps

1. **The progressbar's label while the total is unknown. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0384.**
   - **What is undetermined.** DAC-E6-14 and data-health-ui 2.6 give the running row *{done} of {total} stocks* with `progress` `determinate`. DEC-0213 (f) makes `total` null before a runner claims the download "so the interface renders the indeterminate progress", and CAP-003-E1-S3's `Progress` requires `aria-labelledby` to visible text. No artifact gives the visible text while `total` is null.
   - **What the plan adopts (T004 (b), T013).** The *Result* cell holds an indeterminate `Progress` labelled by the row's own *Outcome* label (*Queued* or *Downloading*), with no count text.
   - **Derivation.** home-ui 2.x drops the `first_download` count clause while the total is null "rather than showing a count it does not have"; the row's outcome label is visible text already describing the state, so no new copy is needed.
   - **Alternatives rejected.** *0 of 0 stocks* (DEC-0213 (f) exists to avoid it); a new sentence such as *waiting to start* (invents copy no artifact gives); *{done} stocks so far* (Home drops the clause rather than keep a partial count).
   - **Classification.** Contained.
   - **Owning design.** data-health-ui 2.6, at its next revision.
2. **The reason beside the key's *Not determinable*. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0385.**
   - **What is undetermined.** DAC-E6-16 and DAC-E6-S4-3 require `coverage-unknown` *Not determinable* while health is unreachable; CAP-003-E1-S6's `NotDeterminable` requires a `reason` (DEC-0310). No artifact gives that reason.
   - **What the plan adopts (T009, T012, T014).** *FactorFlow is not answering*, for both `unknown` and `unreachable` liveness.
   - **Derivation.** The delivered `credential-status.tsx` says presence "is unknown while the product is not answering"; in display vocabulary (AC-19 forbids *Provider credential*) that is ux-design 0.5's unreachable heading as a clause, the same words CAP-003-E6-S1's `readFailureReason` gives an unreachable read (DEC-0373).
   - **Alternatives rejected.** A skeleton for `unknown` (the delivered precedent treats both alike, and the key's reads are the shell's, not this card's loading); the stale `credential_present` (Resolved Conflict 6).
   - **Classification.** Contained.
   - **Owning design.** data-health-ui 2.6 and 10 (States, Unavailable), at its next revision.
3. **The list stays as last read after the latest download ends.** Under DAC-E6-14 and DAC-E6-S4-2 (Resolved Conflict 2), the answer that reports `latest_download` terminal triggers no re-read, so the download that just ended keeps its last re-read's row (*Downloading*, an em dash, *{written} of {named} stocks*) until the screen is next loaded; the progress bar does leave, because it is keyed on attention. No value is adopted; the plan implements the criteria as written. **Owning design:** data-health-ui 2.6 and epic DAC-E6-14 (a one-off re-read on the terminal transition, as owner-shell 2.3 gives the aggregate, would close it).
4. **No progress for a running download while another is queued behind it.** Attention's `latest_download` is the most recently requested download (data-health-reader 2.6), so while a second download is queued, the running row heads the list (Resolved Conflict 3) with *{written} of {named} stocks* from the list, and the queued row carries the indeterminate bar. No value is adopted. **Owning design:** data-health-ui 2.6 with data-health-reader 2.6.
5. **Singular copy** (register G11). *History depth 1 years* and *1 of 1 stocks* follow the artifacts as written; no singular form is specified. **Owning design:** data-health-ui 2.6.
6. **Recent downloads with no download at all.** No artifact gives the region's empty rendering. CAP-003-E6-S5 renders Recent downloads only "when any download exists" (DAC-E6-6), so an empty list is unreachable on the screen; the component renders the table with its header row and no body rows, and S5 records the region's Empty state under DAC-E6-S5-3. **Owning design:** data-health-ui 10 (States).

### Other Notes

- **`useShell()` in the components, props nowhere.** The story's *API Contract* says `health.credential_present` and `attention.latest_download` arrive "through `useShell()`", so both components call it and take no props (unlike CAP-003-E6-S1, whose story says its inputs arrive as props). The tests mock `../../app/shell-context` as CAP-003-E5-S1's plan does.
- **TC-COMP-155 spans three cards.** Its precondition fails the aggregate, Recent downloads and What you follow reads together. This story owns DAC-E6-17's two cards here (T005, T008). The aggregate card's error is composed by CAP-003-E6-S5 from CAP-003-E6-S1's `ReadFailure` (S1 plan, Other Notes), and the whole-screen run of the case is S5's.
- **`copy.ts` is extended, not listed in the story's file list.** data-health-ui 2.1 makes `copy.ts` "every owner-facing string", and CAP-003-E6-S1's plan says siblings add theirs there. The edit is append-only.
- **Hidden words.** *not ended yet* is the visually hidden label `Absent` requires for the *Ended* em dash (CAP-003-E1-S6: "visually hidden words naming what is absent"; ux-design 1.4 Token Usage: "an em dash in `--value-missing` for a download not yet ended"). No artifact quotes the words; they follow the same convention as CAP-003-E6-S1's *no prices stored yet*, and are recorded here rather than adopted silently.
- **Announcements.** "Polling updates … announce politely and never move focus" (data-health-ui 10): the progress text carries `aria-live="polite"`; the table and the sub-line are not live regions, so a 10 s re-read does not read the whole table aloud. Nothing calls `focus()`.
- **Stale counts after Stop following.** What you follow reads on mount and on **Try again** only. After CAP-003-E6-S3's **Stop following** succeeds, *Stopped following {k}* keeps its loaded value until the next load; no artifact asks for a re-read there. Recorded for CAP-003-E6-S5, which owns the screen's refresh wiring.
- **Request ordering.** The latest-call guard in T013 and T014 keeps an older answer from overwriting a newer one if two reads overlap; it adds no trigger.
- **Hand-written mutants** (add these to the mutation run beside the generated ones):
  - `web/src/screens/data-health/recent-downloads.tsx`: `attention.checkedAt.getTime()` → `attention` (the effect key; killed by T003 (c))
  - `web/src/screens/data-health/recent-downloads.tsx`: `attention.kind === "ok" ? … : null` → read `attention.last` on `error` (killed by T003 (d))
  - `web/src/screens/data-health/recent-downloads.tsx`: `answeredAt = new Date()` → `answeredAt = attention.checkedAt` (killed by T003 (a))
  - `web/src/screens/data-health/recent-downloads.tsx`: `latest.run_id === r.runId` → `true` (killed by T004 (d))
  - `web/src/screens/data-health/recent-downloads.tsx`: `rank`: `requested` 1 → 0 (killed by T004 (e))
  - `web/src/screens/data-health/recent-downloads.tsx`: `readFailureReason(error)` → `error.message` (killed by T005 (c))
  - `web/src/screens/data-health/what-you-follow.tsx`: `health.liveness === "answering" && health.health !== null` → `health.health !== null` (killed by T009 (a))
  - `web/src/screens/data-health/what-you-follow.tsx`: `Promise.all([listInstruments(…), getHistoryDepth()])` → `listInstruments(…)` with the depth read unawaited (killed by T008 (c))
  - `web/src/screens/data-health/what-you-follow.tsx`: `retiredCount` → `activeCount` (killed by T007 (a))
