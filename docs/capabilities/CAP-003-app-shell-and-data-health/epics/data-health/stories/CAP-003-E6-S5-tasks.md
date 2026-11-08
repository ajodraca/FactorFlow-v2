---
artifact_schema_version: 1
artifact_id: CAP-003-E6-S5-tasks
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
  timestamp: 2026-11-07T06:55:03Z
  source_artifacts:
    - id: CAP-003-E6-S5
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
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-data-health-ui-tests
      version: "1"
    - id: CAP-003-E6-S1-tasks
      version: "1"
    - id: CAP-003-E6-S2-tasks
      version: "1"
    - id: CAP-003-E6-S3-tasks
      version: "1"
    - id: CAP-003-E6-S4-tasks
      version: "1"
    - id: CAP-003-E3-S1-tasks
      version: "1"
    - id: CAP-003-E3-S2-tasks
      version: "1"
    - id: CAP-003-E3-S3-tasks
      version: "1"
    - id: CAP-003-E1-S1-tasks
      version: "1"
    - id: CAP-003-E1-S6-tasks
      version: "1"
    - id: CAP-003-E1-S9-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E6-S5 — The Data Health Screen: Composition, the Honest Empty States and the On-Demand Refresh Rule

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S5.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `data-health-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

This story assembles Data health at `/data` from the regions CAP-003-E6-S1 to S4 built (data-health-ui 2.1, 2.2, 10). `web/src/screens/data-health/index.tsx` default-exports `DataHealthScreen`. It calls `useShell()` once for `attention`, `scores` and `refresh`, and `useDataHealth()` once for the aggregate's `state` and `retry` (CAP-003-E3-S3). That one hook is the only place the aggregate is read: on load, on **Try again**, once when attention shows the latest download turned terminal (the hook's own trigger), and after a successful **Stop following** (S3 wires `retry` into S2's dialog). Nothing reads it on a timer (DAC-E6-15, AC-28). The screen is capped at `LAYOUT.contentMaxWidth` (CAP-003-E3-S2) and stacks its regions `--space-5` apart, in this order:

1. S1's `Verdict`, which is the header with the `h1`, **Full coverage table** and S2's `<DownloadNow />` in its slot.
2. One slot rendered through CAP-003-E1-S9's `StateRegion`, over an adapter from attention's `ReadState`. While attention loads, the slot shows three skeleton check cards. While `latest_terminal_download` is null, it shows the never-downloaded empty card. Otherwise it shows the four-column check-card grid with the fourth column empty: S1's `DailyPricesCard` and `FinancialsCard` while the aggregate answered (each in its DAC-E6-7 null state when the check is null), skeleton or *Couldn't read the data health checks: {reason}.* cards while it loads or fails, and S1's `ScoresCard`.
3. S3's `NeedsFixing`.
4. Two columns: S4's `RecentDownloads` and `WhatYouFollow`.

The empty card has the `h2` *No data has been downloaded yet.*. It offers either *Download data for your {n} followed stocks to see whether it can be trusted.* with **Start the first download** (S2's `DownloadNow` with that label), or *Follow some stocks first.* with **Open setup** to `/setup`. While it shows, What you follow is not rendered. *Needs fixing* renders only when `affected_count` is above 0, and Recent downloads only when a download exists (DAC-E6-6). The new strings are appended to `copy.ts`. `web/src/components/token-literals.test.ts` gains `web/src/screens/data-health/` in its scanned directories (DAC-E6-S5-4). `data-health.test.tsx` mounts the real `HealthProvider`, `ShellProvider` and `useDataHealth` over mocked network functions. It proves the empty states, the null check cards, the refresh rule with fake timers, the eight states per region, the vocabulary and the badges.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-11 | Data health opens with the verdict and the three check cards | T002, T005, T006, T010, T013, T015 |
| AC-21 | Before any download has ended, the screen says no data has been downloaded and offers the first download or setup; no empty check is shown as passed | T002, T003, T013, T015 |
| AC-24 | Every region renders each of the eight states or records why one does not apply | T002, T005, T013, T015 |
| AC-26 | Built from `ui-components`; theme tokens only | T006, T009, T011, T013, T015, T016 |
| AC-28 | The aggregate is read on demand only | T004, T013, T015 |
| DAC-E6-6 | The never-downloaded empty card as stated; *Needs fixing* and Recent downloads on their conditions | T003, T012, T013, T015 |
| DAC-E6-7 | `never_acquired` true after a download ended: the check cards' null state, never a passed check, never the empty card | T002, T008, T013, T015 |
| DAC-E6-15 | The aggregate is read on load, on **Try again**, once on the terminal transition, after a successful **Stop following**, never on a timer | T004, T005, T013, T015 |
| DAC-E6-S5-1 | No followed stocks: **Open setup** to `/setup`. 12 followed: **Start the first download**. A running first download: Recent downloads beneath with its progress | T003, T012, T013, T015 |
| DAC-E6-S5-2 | Ten fake minutes with no action and no transition: `fetchDataHealth` called exactly once; after a successful stop following, once more | T004, T013, T015 |
| DAC-E6-S5-3 | Each region renders each of the eight states through `StateRegion`, or records why a state does not apply. The check cards' Stale state is recorded as not rendered | T005, T013, T015 |
| DAC-E6-S5-4 | `web/src/screens/data-health/` is added to the literal scan, and the scan passes | T009, T011, T015, T016 |
| DAC-E6-S5-5 | No DAC-E7-3 term in visible text or accessible names in any state; labels from `labelOf` or `copy.ts` | T007, T012, T015 |
| DAC-E6-S5-6 | Every status through `StatusBadge` with its label as text and an `aria-hidden` shape; null check tiers through `Absent`; undeterminable values through `NotDeterminable`; never colour alone | T008, T013, T015 |

**Mapped test cases.** These come from `tests/component/data-health-ui-tests.md` and are confirmed in `tests/coverage-matrix.md` l.274–275, 283 and 305–310:

| Test case | Covers | Task |
|---|---|---|
| TC-COMP-151 | DAC-E6-7 | T002 |
| TC-COMP-175 | DAC-E6-S5-1, DAC-E6-6 | T003 |
| TC-COMP-176 | DAC-E6-S5-2, DAC-E6-15 | T004 |
| TC-COMP-177 | DAC-E6-S5-3 | T005 |
| TC-COMP-178 | DAC-E6-S5-4 | T009 |
| TC-COMP-179 | DAC-E6-S5-5 | T007 |
| TC-COMP-180 | DAC-E6-S5-6 | T008 |

- The specification is `status: draft`. Its steps are used as written and sharpened below.
- **TC-COMP-155** (DAC-E6-17) belongs to CAP-003-E6-S4, but S4's plan leaves its whole-screen run to this story. It runs as T005 (g).
- The other cases on the AC-11, AC-21, AC-24 and AC-26 rows belong to sibling stories.
- TC-INT-014 to TC-INT-024 and TC-INT-036 to TC-INT-039 drive this screen on the real stack in Phase 6b, and TC-E2E-003 and TC-E2E-004 belong to CAP-003-E6-S6. No integration or end-to-end case is owned by this story.

## Phase 1: Setup

**Purpose**: Confirm the baseline and every export this story composes.

- [ ] T001 From the repo root, run `npm ci` and `npm run test` and record the baseline as green. Without editing anything, confirm that each dependency's deliverable exists. STOP and report if any is missing:
  - **CAP-003-E1-S1.** `web/src/components/ui/card.tsx` exports `Card` (`variant` `"default"`), `CardHeader`, `CardTitle` (an `h2`) and `CardContent`. `web/src/components/ui/button.tsx` exports `Button` with `variant` `default` and `asChild`. `web/src/components/token-literals.test.ts` exports `SCANNED_DIRECTORIES`, `isScannedSource` and `literalsIn` (DEC-0296).
  - **CAP-003-E1-S6.** `web/src/components/patterns/format.ts` exports `formatCount`.
  - **CAP-003-E1-S9.** `web/src/components/patterns/state-region.tsx` exports `StateRegion` and `type StateRenderers` (DEC-0313).
  - **CAP-003-E3-S1.** `web/src/app/shell-types.ts` exports `Attention`, `DataHealth` and `ReadState`. `web/src/app/shell-client.ts` exports `fetchAttention`, `fetchScoreSummary`, `fetchDataHealth` and `fetchProblems`.
  - **CAP-003-E3-S2.** `web/src/app/layout.ts` exports `LAYOUT` with `contentMaxWidth`. `web/src/app/health.tsx` exports `HealthProvider`.
  - **CAP-003-E3-S3.** `web/src/app/shell-context.tsx` exports `ShellProvider` and `useShell`. `web/src/app/use-data-health.ts` exports `useDataHealth(): { state: ReadState<DataHealth>; retry(): void }` (DEC-0324).
  - **CAP-003-E6-S1.**
    - `web/src/screens/data-health/verdict.tsx` exports `Verdict`.
    - `check-card.tsx` exports `CheckCard`, `ReadFailure` and `SkeletonLine`.
    - `daily-prices-card.tsx` exports `DailyPricesCard`, `financials-card.tsx` exports `FinancialsCard`, and `scores-card.tsx` exports `ScoresCard`.
    - `copy.ts` exports `CHECK_TITLES`, `READ_TARGETS`, `readFailed` and `readFailureReason`.
  - **CAP-003-E6-S2.** `download-now.tsx` exports `DownloadNow({ label? })`.
  - **CAP-003-E6-S3.** `needs-fixing.tsx` exports `NeedsFixing({ dataHealth, onReread })`.
  - **CAP-003-E6-S4.** `recent-downloads.tsx` exports `RecentDownloads()` and `what-you-follow.tsx` exports `WhatYouFollow()`.
  - `web/src/screens/data-health/index.tsx` does not exist yet.

  Check with `grep -nE "export (default )?(async )?(function|const|type|interface) (Card|CardHeader|CardTitle|CardContent|Button|SCANNED_DIRECTORIES|isScannedSource|literalsIn|formatCount|StateRegion|StateRenderers|Attention|DataHealth|ReadState|fetchAttention|fetchScoreSummary|fetchDataHealth|fetchProblems|LAYOUT|HealthProvider|ShellProvider|useShell|useDataHealth|Verdict|CheckCard|ReadFailure|SkeletonLine|DailyPricesCard|FinancialsCard|ScoresCard|CHECK_TITLES|READ_TARGETS|readFailed|readFailureReason|DownloadNow|NeedsFixing|RecentDownloads|WhatYouFollow)\b" web/src/components/ui/*.tsx web/src/components/*.ts web/src/components/patterns/*.ts* web/src/app/*.ts* web/src/screens/data-health/*.ts*`. This story adds no package (traces to AC-11).

**Checkpoint**: The baseline is green, every import this story makes resolves, and nothing has changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the composition, the empty states, the refresh rule, the states per region, the vocabulary, the badges and the scan widening before `index.tsx` exists.

**Shared harness for `web/src/screens/data-health/data-health.test.tsx`** (written with T002 and reused by T003–T008 and T010; one file, so these tasks run in sequence).

- **Mocks.**
  - **Shell client.** `vi.mock("../../app/shell-client", async (importActual) => ({ ...(await importActual()), fetchAttention: vi.fn(), fetchScoreSummary: vi.fn(), fetchDataHealth: vi.fn(), fetchProblems: vi.fn() }))`. The real `ShellProvider` and `useDataHealth` call these. This is the `fetchDataHealth` spy DAC-E6-S5-2 names.
  - **API client.** `vi.mock("../../api/client", async (importActual) => ({ ...(await importActual()), fetchHealth: vi.fn(), listAcquisitionRuns: vi.fn(), listInstruments: vi.fn(), getHistoryDepth: vi.fn(), startAcquisitionRun: vi.fn(), retireInstrument: vi.fn() }))`. This follows the delivered `web/src/screens/runs/run-controls.test.tsx` precedent, so the real `ApiError` and `ApiUnreachableError` are used.
  - **Reset and guard.** `beforeEach` resets every mock and installs each standing answer below. `afterEach` asserts that the global `fetch` was never called, because every read goes through a mocked function.
- **Timers.**
  - `vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"] })` and `vi.setSystemTime(new Date("2026-10-30T19:03:12Z"))`.
  - `flush()` is `await act(() => vi.advanceTimersByTimeAsync(0))`.
  - `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` drives every interaction.
  - Times render in America/Chicago through CAP-003-E1-S6, so `2026-10-30T19:03:12Z` is *14:03:12 CDT* (DST ends 2026-11-01). Every expected string is written as a literal.
- **Render.** `renderScreen()` renders `<MemoryRouter initialEntries={["/data"]}><HealthProvider><ShellProvider><DataHealthScreen /></ShellProvider></HealthProvider></MemoryRouter>`, then `flush()`. `DataHealthScreen` is the module's default import.
- **Fixtures.** Every fixture is an independent literal typed by CAP-003-E3-S1's `Attention`, `DataHealth` and `ScoreSummary` and the delivered `AcquisitionRun`. None is built by the code under test.
  - **`HEALTH(present)`** is the delivered `HealthResponse` literal with `credential_present: present`. The standing answer for `fetchHealth` is `HEALTH(true)`.
  - **`ATT(over)`** is an `Attention`. Its defaults:
    - `checked_at` `"2026-10-30T19:03:00Z"`, `followed_count` 12, `prices_as_of` `"2026-10-29"`, `credential_present` true
    - `problems` `{ stock_count: 0, symbols: [], newest_completed_at: null }`
    - `latest_download` `{ run_id: "r-9", state: "succeeded", requested_at: "2026-10-30T13:59:00Z", started_at: "2026-10-30T14:00:00Z", ended_at: "2026-10-30T16:30:00Z", progress: { done: 12, total: 12 } }`
    - `latest_terminal_download` `{ run_id: "r-9", state: "succeeded", ended_at: "2026-10-30T16:30:00Z", failure_reason: null }`
    - `items` `[]`

    `over` overrides any of these. It is the standing answer for `fetchAttention`.
  - **`DH(over)`** is a `DataHealth`. Its defaults:
    - `checked_at` `"2026-10-30T19:03:12Z"`, `never_acquired` false, `followed_count` 12, `affected_count` 0
    - `checks.daily_prices` is S1's `ok` default: `latest_session` `"2026-10-29"`, every count 0, gap detection available, no exceptions
    - `checks.company_financials` is S1's `ok` default: `as_of` `"2026-10-30T18:00:00Z"`
    - `problems` `{ rows: [], next_cursor: null }`

    It is the standing answer for `fetchDataHealth`.
  - **`SUMMARY`** is S1's served `ScoreSummary` default: `stocks_current { current_count: 12, followed_count: 12 }`, `set.run_id` `"r-9"` and `later` null. It is the standing answer for `fetchScoreSummary`.
  - **`RUN(over)`** is S4's `AcquisitionRun` default, with `runId "r-9"` and `instrumentsNamed` 12. `listAcquisitionRuns` answers `{ runs: [RUN()], nextCursor: null }` for `{ limit: 5 }` and `{ runs: [RUN()], nextCursor: null }` for `{ state: "succeeded", limit: 1 }`.
  - **`listInstruments`** answers `{ rows: [], activeCount: 12, retiredCount: 1, nextCursor: null }`. **`getHistoryDepth`** answers `{ years: 5, updatedAt: "2026-10-01T12:00:00Z" }`.
  - **Problem rows.** `FAIL(t)` and `NF(t)` are S3's failure literals, and `ROW(symbol, failures, retryable)` is S3's row literal, with `retryable` written out.
  - **`defer()`** returns `{ promise, resolve, reject }`, for pending reads.
- **Errors.**
  - `INTERNAL` is `new ApiError("instrument table said no", "req-9f3", { code: "internal_error" })`. The message deliberately carries a forbidden term, so a leak also fails the term scan.
  - `UNREACHABLE` is `new ApiUnreachableError("fetch failed")`.
  - No message or request id may reach the DOM.
- **Helpers.**
  - `region(name)` is `screen.getByRole("region", { name })`, because each card is a `section` labelled by its `h2` (data-health-ui 10). `queryRegion(name)` is its `query` form.
  - `TERMS` is `/\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i` (DAC-E7-3).
  - `visibleAndAccessibleText()` joins:
    - `document.body.textContent`, which includes the dialog portals
    - the computed accessible name of every `button`, `link`, `heading`, `dialog` and `progressbar`
    - the text of every element that an `aria-describedby` or `aria-labelledby` references

### Mandatory Component Tests

- [ ] T002 Implement **TC-COMP-151**: after a download ended with nothing stored, the check cards show their null state and the empty card does not show. Write it in a new `web/src/screens/data-health/data-health.test.tsx` as `describe("never_acquired after a download ended (TC-COMP-151, DAC-E6-7, AC-21, AC-24)")`, with `// Implements TC-COMP-151`.

  **Fixture:**
  - Attention is `ATT({ latest_terminal_download: { run_id: "r-9", state: "failed", ended_at: "2026-10-30T16:30:00Z", failure_reason: "provider_unavailable" }, problems: { stock_count: 3, … } })`.
  - The aggregate is `DH({ never_acquired: true, affected_count: 3, checks: { daily_prices: null, company_financials: null }, problems: { rows: [ROW("AAA", [FAIL("prices")], true), ROW("BBB", [FAIL("prices")], true), ROW("CCC", [FAIL("fundamentals")], true)], next_cursor: null } })`.
  - Recent downloads lists `RUN({ state: "failed", instrumentsWritten: 0, instrumentsFailed: 12 })`.

  **Assertions:**
  - (a) **The verdict renders.** The `h1` is *Is the data good enough to trust?*. A `status-critical` badge reads *No*, and the verdict sentence (S1's `verdict-sentence` test id) contains *, and the last download failed.*
  - (b) **Needs fixing renders with its rows.** The region *Needs fixing · 3* holds three `li`.
  - (c) **Recent downloads renders.** The region *Recent downloads* holds a table with the *Failed* row.
  - (d) **The two check cards are in their null state.** For each of the regions *Daily prices* and *Company financials*:
    - no element carries a `data-variant` starting `status-` or equal to `coverage-unknown`
    - `within(region).getAllByText("no data stored yet")` has length 2, one for the tier and one for the result line, each with class `sr-only`
    - each sits beside an `aria-hidden="true"` element whose text is `—`
  - (e) **Never a passed check.** The text contains neither *No missing prices or gaps*, *All financials present*, *All 12 stocks have prices* nor *All 12 stocks have financials*.
  - (f) **Never the empty card.** `queryByRole("heading", { name: "No data has been downloaded yet." })` is null.
  - (g) **The rest of the full screen.** The *Factor scores* and *What you follow* regions are present.

  Kills:
  - **swap-case** of the empty-card predicate to `dh.never_acquired`: the empty card renders, so (f) fails.
  - **drop-field-copy**, replacing `check={dh.checks.daily_prices}` with a default `ok` check: (d) and (e) fail.
  - **negate-boolean** on the slot's empty test: the cards are replaced, so (d) fails.
- [ ] T003 Implement **TC-COMP-175**: the empty card offers **Open setup** or **Start the first download**, and a running first download shows beneath it. Write it in `web/src/screens/data-health/data-health.test.tsx` after T002 as `describe("Never-downloaded empty card (TC-COMP-175, DAC-E6-S5-1, DAC-E6-6, AC-21)")`, with `// Implements TC-COMP-175`.

  Every case sets `latest_terminal_download: null`.

  - (a) **Step 1: no stock followed.**
    - **Fixture.** Attention is `ATT({ followed_count: 0, latest_download: null, latest_terminal_download: null })`. The aggregate is `DH({ followed_count: 0, never_acquired: true, checks: { daily_prices: null, company_financials: null } })`. `listInstruments` answers `activeCount: 0`, which is TC-COMP-175's `active_count` precondition.
    - **The empty card.** A region named *No data has been downloaded yet.* holds an `h2` with that exact text and the text *Follow some stocks first.*. It also holds `getByRole("link", { name: "Open setup" })` with `href="/setup"` and `data-variant="default"`. It holds no *Start the first download* button.
    - **What gives way (TC edge).** No `status-*` badge, no `verdict-sentence` and no *checked* line render anywhere in the header. `queryRegion` returns null for *Daily prices*, *Company financials*, *Factor scores* and *What you follow*. `listInstruments` and `getHistoryDepth` are never called, because What you follow is not mounted.
    - **The other regions.** Needs fixing is absent because `affected_count` is 0. Recent downloads is absent and `listAcquisitionRuns` is never called with `{ limit: 5 }`, because no download exists.
    - **The header stays.** The `h1`, **Full coverage table** and **Download now** render (Resolved Conflict 2).
  - (b) **Step 2: 12 stocks followed.**
    - **Fixture.** Attention is `ATT({ followed_count: 12, latest_download: null, latest_terminal_download: null })`. The aggregate is `fetchDataHealth` held on a pending `defer()`, so the aggregate is still loading. `listInstruments` answers `activeCount: 12`.
    - **The card.** It reads exactly *Download data for your 12 followed stocks to see whether it can be trusted.* and holds a button *Start the first download* with `data-variant="default"`. It holds no *Open setup*.
    - **The count's source.** The count is attention's `followed_count` while the aggregate is still pending (Resolved Conflict 3).
    - **Clicking the button.** `startAcquisitionRun` resolves `{ runId: "r-10", state: "requested", queuedBehind: null }`. After the click, `startAcquisitionRun` was called once with no argument, and `fetchAttention` once more (S2's `refresh("attention")`).
  - (c) **1,236 stocks.** Attention `followed_count` 1236 gives *Download data for your 1,236 followed stocks to see whether it can be trusted.* This kills a dropped `formatCount`.
  - (d) **Step 3: a running first download.**
    - **Fixture.** Attention is `ATT({ latest_download: { run_id: "r-1", state: "running", requested_at: "2026-10-30T18:59:00Z", started_at: "2026-10-30T19:00:00Z", ended_at: null, progress: { done: 3, total: 12 } }, latest_terminal_download: null })`. `listAcquisitionRuns({ limit: 5 })` answers `[RUN({ runId: "r-1", state: "running", endedAt: null, instrumentsWritten: 3 })]`.
    - **Both regions render.** The empty card renders, and the region *Recent downloads* renders below it: `emptyCard.compareDocumentPosition(recent) & Node.DOCUMENT_POSITION_FOLLOWING` is non-zero.
    - **The progress.** Recent downloads holds a `progressbar` labelled *3 of 12 stocks* and the text *3 of 12 stocks*.
    - **What stays absent.** What you follow is still absent.
  - (e) **Problems while nothing has ended.**
    - **Fixture.** The same attention as (d), with the aggregate `DH({ affected_count: 1, problems: { rows: [ROW("FBXX", [NF("reference")], false)], next_cursor: null } })`.
    - **The region.** *Needs fixing · 1* renders after the empty card, with FBXX's `li`.
    - **When the count is 0.** With `affected_count` 0, the region is absent.
  - (f) **No check is ever shown as passed.** In every case above, no `status-good` badge and none of *No missing prices or gaps*, *All financials present* or *Yes.* appears.

  Kills:
  - **swap-case** of the empty predicate from `latest_terminal_download` to `latest_download`: (d) renders the full screen.
  - **off-by-one** `followed_count > 0` → `>= 0`: (a) offers *Start the first download*.
  - **drop-field-copy** of the count from attention to `dh.followed_count`: (b) shows no count while the aggregate is pending.
  - **negate-boolean** on the Recent downloads condition: (a) mounts it and calls `listAcquisitionRuns`, or (d) drops it.
  - **off-by-one** `affected_count > 0` → `>= 0` in the empty state: (e)'s zero case renders the region.
  - **negate-boolean** on What you follow's condition: (a) calls `listInstruments`.
- [ ] T004 Implement **TC-COMP-176**: the aggregate is read once with no action, and once more after stop following. Write it in `web/src/screens/data-health/data-health.test.tsx` after T003 as `describe("Aggregate refresh rule (TC-COMP-176, DAC-E6-S5-2, DAC-E6-15, AC-28)")`, with `// Implements TC-COMP-176`.

  **Fixture.** Attention stands at `ATT()`, which is terminal (`succeeded`) on every answer. The aggregate is `DH({ affected_count: 1, problems: { rows: [ROW("FBXX", [NF("reference")], false)], next_cursor: null } })`.

  - (a) **Step 1.**
    - After `renderScreen()`, `fetchDataHealth` has been called exactly once.
    - Advance ten minutes with `await act(() => vi.advanceTimersByTimeAsync(600_000))`. `fetchAttention` was called at least ten times, which proves the shell kept polling. `fetchDataHealth` was still called exactly once.
  - (b) **Step 2.**
    - Click *Stop following FBXX*, then the dialog's *Stop following*. `retireInstrument` resolves `{ lifecycle: "retired", retiredAt: "2026-10-30T19:10:00Z" }`.
    - After `flush()`, `fetchDataHealth` has been called exactly twice and `retireInstrument` once with `"FBXX"`.
    - Advance another ten minutes. The count is still 2.
  - (c) **The terminal transition is the hook's alone.**
    - Start from the terminal `ATT()`. Make the next attention answer `latest_download.state: "running"` and the one after it `"succeeded"`.
    - Advance through both answers: 60 s to the running answer, then the 10 s cadence. `fetchDataHealth` was called exactly twice: the mount read and one transition read.
    - Further ten minutes of `succeeded` answers leave it at 2.
  - (d) **Try again is a read.** Make `fetchDataHealth` reject `INTERNAL` on mount. Click the *Try again* inside the *Daily prices* region. The count is 2, and nothing else reads the aggregate.

  Kills:
  - A hand-written mutant adding `useEffect(() => retry(), [attention])` to the screen: (a) reads on every attention answer.
  - A hand-written mutant adding `setInterval(retry, …)`: (a) fails.
  - A hand-written mutant that calls `useDataHealth()` a second time, for example inside a child: (a) shows 2 on mount.
  - **swap-case** `onReread={retry}` → `onReread={() => {}}`: (b) stays at 1.
  - A hand-written mutant adding the screen's own terminal-transition effect: (c) shows 3.
- [ ] T005 Implement **TC-COMP-177**: Data health's regions render the eight states or record why one does not apply. It includes the whole-screen run of **TC-COMP-155**. Write it in `web/src/screens/data-health/data-health.test.tsx` after T004 as `describe("Eight states per region (TC-COMP-177, TC-COMP-155, DAC-E6-S5-3, DAC-E6-17, AC-24)")`, with `// Implements TC-COMP-177` and `// Implements TC-COMP-155 (whole screen)`.

  Use one `it` per UX state (ux-design 1.4 States). Each asserts every region in the per-region record of Other Notes. For a cell recorded as not applicable, it asserts the specific absence named there.

  - (a) **Loading.** Hold every read on `defer()`: attention, summary, aggregate, `listAcquisitionRuns`, `listInstruments` and `getHistoryDepth`.
    - The `h1` and its two actions render. The header holds an element with `aria-busy="true"`.
    - The three regions *Daily prices*, *Company financials* and *Factor scores* each sit inside an `[aria-busy="true"]` ancestor, which is `StateRegion`'s loading wrapper.
    - *Needs fixing*, *Recent downloads* and *What you follow* each hold an `aria-busy="true"` element.
    - No `status-*` badge and no empty card render.
  - (a2) **Loading on attention alone.** Hold only attention on `defer()`, with the aggregate and summary answered. The three check regions are still skeletons inside `[aria-busy="true"]`, and no `status-*` badge sits inside them. This kills a slot loading renderer that renders the real cards.
  - (b) **Empty, never populated.** Covered by T003. Assert here only that the slot renders exactly one region named *No data has been downloaded yet.*.
  - (c) **Empty, nothing found.** Use `ATT()` and `DH()`.
    - The verdict reads *Yes. None of the 12 followed stocks needs attention.*.
    - *Needs fixing · 0* holds *Nothing needs fixing.* and *Last complete download 2026-10-30 09:00 CDT*.
    - Daily prices shows `status-good` *No missing prices or gaps*.
  - (d) **Partial.** Use attention `latest_terminal_download.state` `"partial"`.
    - **Fixture.** The aggregate is `DH({ affected_count: 2, checks.daily_prices: { status: "exceptions", absent_count: 2, …, exception_count: 2, exception_symbols: ["AAA", "BBB"] }, problems: { rows: [ROW("AAA", …), ROW("BBB", …)], next_cursor: null } })`. Recent downloads answers `[RUN({ state: "partial", instrumentsWritten: 10, instrumentsFailed: 2 })]`.
    - **The rendering.**
      - The verdict shows `status-warning` *Mostly yes*.
      - Daily prices shows `status-warning` *Needs attention* and *Prices to 2026-10-29 · AAA, BBB*.
      - Recent downloads shows `status-warning` *Partial* with *10 of 12 stocks, 2 failed*.
  - (e) **Stale.**
    - **The scores card renders it.** The summary is `{ …SUMMARY, set: { …, not_current: true }, later: null }`, a synthetic fixture (S1 Resolved Conflict 5). The *Factor scores* region shows `status-warning` *Not reflecting the latest download*.
    - **The check cards record it as not rendered** (DEC-0201, system design open question 9). Set `checks.daily_prices.latest_session` to `"2026-09-01"`, two months before the system time. Then:
      - no element in *Daily prices* or *Company financials* matches `/stale|out of date|not current/i`
      - the *Daily prices* badge is still `status-good` *No missing prices or gaps*
      - the region holds the scope note's *FactorFlow has no trading calendar*
  - (f) **Unavailable.** Attention rejects `INTERNAL` on its first read, and health rejects `UNREACHABLE`. The aggregate is `DH({ checks.daily_prices: { …, status: "exceptions", gap_stock_count: null, gap_detection: { available: false, reason: "fewer_than_two_instruments_with_data" } } })`. The summary answers `{ kind: "not_served" }`.
    - **The verdict region.** It reads *Couldn't read what needs attention: FactorFlow hit an unexpected problem.*, which is the slot's `unavailable` kind. Its *Try again* calls `fetchAttention` once more and `fetchDataHealth` not at all.
    - **The check cards still render from their own reads.**
      - *Daily prices* holds a `coverage-unknown` *Gaps not determinable*.
      - *Factor scores* holds a `coverage-unknown` *Not determinable* with *FactorFlow can't read scores yet.*
      - *What you follow*'s *Market data key* is a `coverage-unknown` *Not determinable*.
    - **The empty card.** No empty card renders.
  - (g) **Error, the whole-screen run of TC-COMP-155.** `fetchDataHealth`, `listAcquisitionRuns` and `listInstruments` all reject `INTERNAL`, with attention `ATT()`.
    - **Card bodies.** Each card keeps its `h2` and its body reads:

      | Region | Body |
      |---|---|
      | *Daily prices* | *Couldn't read the data health checks: FactorFlow hit an unexpected problem.* with *Try again* |
      | *Company financials* | the same sentence, with *Try again* |
      | *Needs fixing* | the same sentence (S3) |
      | *Recent downloads* | *Couldn't read recent downloads: FactorFlow hit an unexpected problem.* (S4) |
      | *What you follow* | *Couldn't read what you follow: FactorFlow hit an unexpected problem.* (S4) |

    - **The verdict.** It renders the aggregate's sentence (S1 T007 (e)).
    - **No leak.** `document.body.textContent` contains neither *req-9f3* nor *instrument table said no*.
    - **Retry.** Clicking *Company financials*' *Try again* calls `fetchDataHealth` once more and nothing else.
  - (h) **Unreachable.** This state is recorded as not applicable: the shell replaces the main region (AC-23), and CAP-003-E3-S6's `shell.unreachable.test.tsx` asserts that. This test asserts only the type-level record: the screen's `StateRegion` call type-checks under `npx tsc --noEmit`. Under CAP-003-E1-S9's contract, that requires `unreachable: { notApplicable: … }`.

  Kills:
  - **swap-case** of the `unavailable` renderer to the empty card or to nothing: (f) loses the cards.
  - **swap-case** of the check cards' error `onRetry` to `() => refresh("attention")`: (g)'s retry spy fails.
  - **swap-case** of `onRetryAttention` to `retry`: (f) calls `fetchDataHealth`.
  - A hand-written mutant rendering `dh.checks.*` from `error.last` while the aggregate fails: (g) shows the old cards.
- [ ] T006 Write the layout and composition cases. Put them in `web/src/screens/data-health/data-health.test.tsx` after T005, as `describe("Layout and wiring (AC-11, AC-26, owner-shell 2.1, data-health-ui 10)")`. Use `ATT()` and `DH()`.
  - (a) **The width cap.** The screen's root element is the parent of the `h1`'s `header`. `root.style.maxWidth` is exactly `"1180px"`, which is `LAYOUT.contentMaxWidth`. A test file may hold the literal, since the layout rule scans non-test sources only.
  - (b) **The check grid.** The three check regions share one parent, and that parent's class list contains `grid-cols-4`. The parent has exactly three element children, in the order *Daily prices*, *Company financials*, *Factor scores*: the fourth column is empty, with no placeholder.
  - (c) **Region order.** In document order: the `header`, the check grid, *Needs fixing*, then the lower pair. The lower pair is *Recent downloads* then *What you follow*, inside one parent whose class list contains `grid-cols-2`.
  - (d) **The scores retry.** The summary rejects `INTERNAL` with no last value. Clicking *Factor scores*' *Try again* calls `fetchScoreSummary` once more and neither `fetchAttention` nor `fetchDataHealth`. This covers CAP-003-E6-S1's `onRetryScores` (DEC-0376).
  - (e) **One header action set.** Exactly one link named *Full coverage table* sits in the header. Exactly one button named *Download now* exists while no problem row is retryable.

  Kills:
  - **remove-attribute** of the `style` holding `maxWidth`: (a) fails.
  - **off-by-one**: a hand-written `grid-cols-4` → `grid-cols-3` fails (b).
  - **swap-case** `refresh("scores")` → `refresh("attention")`: (d) fails.
- [ ] T007 Implement **TC-COMP-179**: the Data health screen uses the display vocabulary in every state. Write it in `web/src/screens/data-health/data-health.test.tsx` after T006 as `describe("Display vocabulary in every state (TC-COMP-179, DAC-E6-S5-5, AC-19)")`, with `// Implements TC-COMP-179`.
  - (a) **The scan.** Render each fixture of T002, T003 (a), (b) and (d), and T005 (a) and (c)–(g), plus T004's *Stop following FBXX* dialog opened. For each, `visibleAndAccessibleText()` never matches `TERMS`.
  - (b) **The regex is not vacuous.** `TERMS` matches `"one run"`, `"Retired"` and `"Provider credential"`. It does not match `"Download"`, `"downloads"`, `"run_id"` or `"fewer_than_two_instruments_with_data"`.
  - (c) **The labels are this story's `copy.ts` literals.** The empty card's `h2`, its two sentences and its two action names equal the imported `NO_DATA_YET`, `downloadForFollowed("12")`, `FOLLOW_FIRST`, `START_FIRST_DOWNLOAD` and `OPEN_SETUP`. Every badge's text in T005 (c) and (d) is one of the `labelOf` labels or S1's verdict words.

  Kills: a hand-written mutant naming the empty card's action *Start the first run*, which (a) catches.
- [ ] T008 Implement **TC-COMP-180**: every status on the screen carries its shape, and null check tiers go through `Absent`. Write it in `web/src/screens/data-health/data-health.test.tsx` after T007 as `describe("Statuses carry words and shape (TC-COMP-180, DAC-E6-S5-6, AC-20)")`, with `// Implements TC-COMP-180`.
  - (a) **The badges render.** Render T005 (d), the partial screen, with these additions:
    - a *Not found* row `ROW("FBXX", [NF("reference")], false)`
    - Recent downloads with *Complete*, *Partial*, *Interrupted* (`abandoned`) and *Failed* rows
    - the key *Found*

    For every `[data-variant^="status-"]` element:
    - its trimmed text is non-empty and equals its accessible name
    - it contains exactly one `svg`, with `aria-hidden="true"`: CAP-003-E1-S5's tier shape
    - no descendant carries an `aria-label`
  - (b) **Undeterminable values.** Render T005 (f). Every `[data-variant="coverage-unknown"]` element `toHaveAccessibleDescription(expect.stringMatching(/\S/))`.
  - (c) **Null check tiers.** Render T002. Inside *Daily prices* and *Company financials*, no `[data-variant]` badge exists. Each region holds two `[aria-hidden="true"]` elements with text `—`, and two `.sr-only` elements reading *no data stored yet*.
  - (d) **Never colour alone.** Across (a)–(c), every element whose `className` matches `/\b(text|bg|border)-status-/` either is a `[data-variant^="status-"]` badge or has one as an ancestor.

  Kills:
  - **drop-field-copy** `check={dh.checks.daily_prices}` → `check={null}`: (a)'s Daily prices badge disappears.
  - A hand-written mutant rendering the empty card's `h2` with `text-status-critical`: (d) fails.

### Additional Unit Tests

- [ ] T009 Implement **TC-COMP-178**: the literal scan is widened to `web/src/screens/data-health/`. Append it as a new `describe("data health screen is scanned (TC-COMP-178, DAC-E6-S5-4)")` block to `web/src/components/token-literals.test.ts`, CAP-003-E1-S1's file, with `// Implements TC-COMP-178`. This follows CAP-003-E4-S2's T007 for `web/src/screens/setup/`.
  - (a) **Step 1.** `SCANNED_DIRECTORIES` contains `"web/src/screens/data-health/"`.
  - (b) **Step 2.** Walking that directory with the file's own walker and `isScannedSource` finds at least these thirteen sources, and no `*.test.ts(x)` file:
    - `index.tsx`, `verdict.tsx`, `check-card.tsx`
    - `daily-prices-card.tsx`, `financials-card.tsx`, `scores-card.tsx`
    - `needs-fixing.tsx`, `problem-row.tsx`, `stop-following-dialog.tsx`
    - `download-now.tsx`, `recent-downloads.tsx`, `what-you-follow.tsx`
    - `copy.ts`

    `literalsIn` over all of them returns `[]`.
  - (c) **Step 3.** A planted `const x = "12px";` at `web/src/screens/data-health/planted.tsx` returns exactly `["web/src/screens/data-health/planted.tsx: 12px"]`.
  - (d) **Edge.** `isScannedSource("web/src/screens/data-health/data-health.test.tsx")` is false.

  Change nothing else in the file.

  Kills: **drop-field-copy** of the appended `SCANNED_DIRECTORIES` entry: (a) fails, and the whole-tree case of CAP-003-E1-S1 stops visiting the directory.
- [ ] T010 Write the copy cases. Put them in `web/src/screens/data-health/data-health.test.tsx` after T008, as `describe("copy.ts, empty card strings (DAC-E6-6)")`.
  - The constants are exact: `NO_DATA_YET` is *No data has been downloaded yet.*, `START_FIRST_DOWNLOAD` is *Start the first download*, `FOLLOW_FIRST` is *Follow some stocks first.* and `OPEN_SETUP` is *Open setup*.
  - `downloadForFollowed("12")` is exactly *Download data for your 12 followed stocks to see whether it can be trusted.*
  - No value matches `TERMS`.

  Kills: **swap-case** of `FOLLOW_FIRST` and `NO_DATA_YET`.

**Checkpoint**: Every Phase 2 test exists and fails. `data-health.test.tsx` fails at import, because `index.tsx` and the new `copy.ts` exports do not exist. T009 fails because the directory is not yet scanned. Every delivered test and every sibling story's test still passes.

---

## Phase 3: Core Implementation

**Purpose**: Add the empty card's strings and compose the screen.

- [ ] T011 Extend `web/src/screens/data-health/copy.ts`, the catalogue CAP-003-E6-S1 created. Change nothing that S1, S2, S3 or S4 wrote. Append a section headed `// CAP-003-E6-S5: the never-downloaded empty card (data-health-ui 10; DAC-E6-6)`. The strings are verbatim from epic DAC-E6-6, data-health-ui 10 States and ux-design 1.4 States:
  - `NO_DATA_YET = "No data has been downloaded yet."`
  - `downloadForFollowed(n: string) => \`Download data for your ${n} followed stocks to see whether it can be trusted.\``, with `n` passed already formatted through `formatCount`, as S4's strings take it
  - `START_FIRST_DOWNLOAD = "Start the first download"`
  - `FOLLOW_FIRST = "Follow some stocks first."`
  - `OPEN_SETUP = "Open setup"`

  Write no unit or hex literal, comments included: this directory is now scanned (T016). This task makes T010 pass and supplies T003, T007 and T013.
- [ ] T012 Write the empty card as a module-local `EmptyCard({ followedCount }: { followedCount: number })` in `web/src/screens/data-health/index.tsx`.
  - **Frame.** It renders `<section aria-labelledby={id}>`, with `id = useId()`, around `<Card variant="default">`. `CardHeader` holds `<CardTitle id={id}>{NO_DATA_YET}</CardTitle>`. `CardContent` uses `className="flex flex-col items-start gap-4"`.
  - **With stocks followed** (`followedCount > 0`): `<p className="text-base">{downloadForFollowed(formatCount(followedCount))}</p>`, then `<DownloadNow label={START_FIRST_DOWNLOAD} />`. That is CAP-003-E6-S2's one action, "the same post as Download now" (ux-design 1.4 States; DEC-0379).
  - **With none followed:** `<p className="text-base">{FOLLOW_FIRST}</p>`, then `<Button variant="default" asChild><Link to="/setup">{OPEN_SETUP}</Link></Button>`. The `default` variant follows ux-design's traceability row for AC-21 (l.1491: "`card` `default`; `button` `default`") and ux-brief's one `default` action per region (l.313).

  This task depends on T011, and T013 renders the card.
- [ ] T013 Create the rest of `web/src/screens/data-health/index.tsx`, exporting `export default function DataHealthScreen(): JSX.Element`. The delivered screens default-export, so CAP-003-E6-S7's `React.lazy(() => import("../screens/data-health"))` resolves, following CAP-003-E3-S4's binding pattern.

  **Reads.** Each is called exactly once, here:
  - `const { attention, scores, refresh } = useShell()`
  - `const { state: dataHealth, retry } = useDataHealth()`

  There is no other aggregate read, no `useEffect` that reads, and no timer (DAC-E6-15). The terminal-transition read belongs to `useDataHealth` (owner-shell 2.3; register §4).

  **Derived values:**
  - `empty = attention.kind === "ok" && attention.data.latest_terminal_download === null` (DAC-E6-6; system design §3.4 note 7). It is never keyed on `never_acquired`.
  - `anyDownload = attention.kind !== "ok" || attention.data.latest_download !== null`. Attention's `latest_download` is null exactly when no download has been requested (data-health-reader Q4).
  - `showNeedsFixing = !empty || (dataHealth.kind === "ok" && dataHealth.data.affected_count > 0)`
  - `showRecent = !empty || anyDownload`
  - `showFollow = !empty`

  **The slot adapter** (DEC-0386). A module-local `slotState(attention: ReadState<Attention>): ScreenState<Attention>` maps:

  | Attention | Slot kind |
  |---|---|
  | `loading` | `{ kind: "loading" }` |
  | `error` | `{ kind: "unavailable", reason: readFailureReason(error) }` (data-health-ui 10 States, Unavailable: "the verdict while attention fails") |
  | `ok` with `latest_terminal_download` null | `{ kind: "empty-never-populated" }` |
  | otherwise `ok` | `{ kind: "populated", data, fetchedAt: checkedAt.toISOString() }` |

  **The check grid.** A module-local `CheckGrid({ skeleton }: { skeleton: boolean })` renders `<div className="grid grid-cols-4 gap-5">` with three children and no fourth element. Each card section labels itself by its `h2`, through S1's `CheckCard`.
  - When `skeleton` is set, or the aggregate is `loading`, the first two children are `<CheckCard title={CHECK_TITLES.daily_prices}><SkeletonLine /></CheckCard>` and the same for `company_financials`.
  - When the aggregate is `error`, the first two are `<CheckCard title={…}><ReadFailure sentence={readFailed(READ_TARGETS.checks, readFailureReason(dataHealth.error))} onRetry={retry} /></CheckCard>`, one per card. This is DAC-E6-17, and `last` is never read.
  - When the aggregate is `ok`, they are `<DailyPricesCard check={dh.checks.daily_prices} followedCount={dh.followed_count} />` and `<FinancialsCard check={dh.checks.company_financials} followedCount={dh.followed_count} />`. These cards render the DAC-E6-7 null state themselves when `check` is null.
  - The third child is `<ScoresCard scores={scores} onRetryScores={() => refresh("scores")} />`. When `skeleton` is set, it is a `CheckCard` titled `CHECK_TITLES.scores` holding `SkeletonLine`.

  **Render.** `<div className="mx-auto flex w-full flex-col gap-5" style={{ maxWidth: LAYOUT.contentMaxWidth }}>` holds, in this fixed order (each conditional sits at a fixed position, so React keeps a region mounted while its condition holds):
  1. `<Verdict attention={attention} dataHealth={dataHealth} onRetryAttention={() => refresh("attention")} onRetryDataHealth={retry} downloadNow={<DownloadNow />} />`
  2. `<StateRegion state={slotState(attention)} onRetry={() => refresh("attention")} renderers={…} />`, with these renderers:

     | Kind | Renderer |
     |---|---|
     | `loading` | `() => <CheckGrid skeleton />` |
     | `"empty-never-populated"` | `() => <EmptyCard followedCount={attention.data.followed_count} />`, guarded by `attention.kind === "ok"` |
     | `populated` | `() => <CheckGrid skeleton={false} />` |
     | `unavailable` | `() => <CheckGrid skeleton={false} />` |
     | `"empty-no-match"` | `{ notApplicable: "Data health has no filter; nothing found is the Needs fixing card's Nothing needs fixing state (DAC-E6-10)." }` |
     | `partial` | `{ notApplicable: "Partial results render inside the cards: exceptions with counts and the Partial and Interrupted download rows (AC-12)." }` |
     | `error` | `{ notApplicable: "A failed attention read is this slot's unavailable state; each card's own read renders its own error (DAC-E6-2, DAC-E6-17)." }` |
     | `unreachable` | `{ notApplicable: "The shell replaces the main region (AC-23)." }` |

  3. `{showNeedsFixing && <NeedsFixing dataHealth={dataHealth} onReread={retry} />}`. S3 passes `onReread` to S2's dialog as `onStopped` and `onRefusalClosed` (DAC-E6-15; DEC-0381).
  4. `<div className="grid grid-cols-2 items-start gap-5">{showRecent && <RecentDownloads />}{showFollow && <WhatYouFollow />}</div>`.

  **Module doc comment.** It cites data-health-ui 2.1, 2.2, 3, 5 and 10, DAC-E6-6, DAC-E6-7, DAC-E6-15, DAC-E6-S5-1 to -6, AC-21, AC-24, AC-26, AC-28 and DEC-0386. It also carries:
  - the per-region record of the eight states from Other Notes, including the check cards' Stale state recorded as not rendered under DEC-0201 until a trading calendar exists (system design open question 9)
  - that `useDataHealth` is called here only (CAP-003-E3-S3's importer rule)
  - that `/data` needs no `setTitleDetail` (DEC-0214)

  Write no unit or hex literal, comments included: the comment names the layout key `LAYOUT.contentMaxWidth`, never its value.

  **Imports:**
  - `useId` and `type JSX` from `react`, and `Link` from `react-router-dom`
  - `Card`, `CardHeader`, `CardTitle` and `CardContent` from `../../components/ui/card`, and `Button` from `../../components/ui/button`
  - `StateRegion` from `../../components/patterns/state-region`, and `formatCount` from `../../components/patterns/format`
  - `type { ScreenState }` from `../../api/types`
  - `type { Attention, ReadState }` from `../../app/shell-types`
  - `useShell` from `../../app/shell-context`, `useDataHealth` from `../../app/use-data-health`, and `LAYOUT` from `../../app/layout`
  - from this directory: `Verdict`, `CheckCard`, `ReadFailure`, `SkeletonLine`, `DailyPricesCard`, `FinancialsCard`, `ScoresCard`, `DownloadNow`, `NeedsFixing`, `RecentDownloads` and `WhatYouFollow`, and the strings from `./copy`

  This task depends on T011 and T012, and makes T002–T008 pass.

**Checkpoint**: `npx vitest run web/src/screens/data-health` is green, including every sibling story's files. The module gains exactly the default `DataHealthScreen` and the five `copy.ts` additions.

---

## Phase 4: Integration

**Purpose**: Widen the shared literal scan and prove the screen sits cleanly in the delivered suite.

- [ ] T014 Append `"web/src/screens/data-health/"` to `SCANNED_DIRECTORIES` in `web/src/components/token-literals.test.ts`, after the entries already there, without reordering or removing any. This follows DEC-0296's widening rule, with T009 RED first. Change nothing else in the file.
  - Run `npx vitest run web/src/components/token-literals.test.ts`. T009 and CAP-003-E1-S1's whole-tree case must pass with the directory scanned.
  - If an offender is reported in a sibling story's file, STOP and report it against that story rather than editing its file here.
  - CAP-003-E3-S2's layout rule already covers the directory. `grep -rnE "1180px" web/src/screens/data-health` prints nothing.

  This task traces to DAC-E6-S5-4 and AC-26.
- [ ] T015 Run the whole Vitest suite (`npm run test`) unchanged.
  - It includes `web/src/app/use-data-health.test.tsx`. That file's importer rule allows `use-data-health` only under `web/src/screens/data-health/`, and `index.tsx` satisfies it.
  - It also includes `web/src/api/render.test.tsx`, which forbids `dangerouslySetInnerHTML`.
  - Then confirm with `git status --short web/ package.json` that the only changes are:
    - the new `web/src/screens/data-health/index.tsx` and `data-health.test.tsx`
    - the `copy.ts` append
    - the `token-literals.test.ts` append

  This task traces to AC-11, AC-21, AC-24 and AC-26.

**Checkpoint**: The whole suite is green, the data-health directory is scanned, and only this story's four files changed.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [ ] T016 Run the validation commands and the mutation pass. This task traces to AC-26, AC-28 and DAC-E6-15.
  - From the repo root, run `npm run lint`, `npm run format` and `npx tsc --noEmit`.
    - Format only this story's files with `npx biome format --write web/src/screens/data-health/index.tsx web/src/screens/data-health/data-health.test.tsx web/src/screens/data-health/copy.ts web/src/components/token-literals.test.ts`.
    - `tsc` judges T005 (h): the `StateRegion` renderer map must name all eight kinds, with `unreachable` as `notApplicable` (CAP-003-E1-S9).
  - Run `npm run build`.
  - Run the mutation pass, `python3 scripts/mutation-run.py run --command "npx vitest run web/src/screens/data-health && npx tsc --noEmit"`, over `index.tsx` and the S5 section of `copy.ts`, with the hand-written mutants in Other Notes. It must leave no surviving non-equivalent mutant.
- [ ] T017 After each TDD cycle in T002–T016, and not once at the end:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Append the cycle to `CAP-003-E6-S5-tdd-evidence.yaml` beside this story, with:
    - `code_review_verdict`
    - `spec_drift.drift_detected`
    - `tests_executed: true`
    - its RED/GREEN evidence
    - the structured `mutation:` block that `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change
    - `diff_sha256`: the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`

  Do this before the next cycle begins. `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is planned.

  The cycles:
  1. T010 and T011, the strings.
  2. T002, T003 and T012, with the first cut of T013: the slot, the empty card and the conditions.
  3. T004, which proves the refresh wiring of T013.
  4. T005 and T006, the states, layout and retries of T013.
  5. T007 and T008. These add tests only, and join cycle 4's evidence if no production change follows.
  6. T009 and T014, the scan.

  T015 and T016 add no behaviour and join cycle 6's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC).

**Checkpoint**: Every acceptance criterion is satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E6-S1 | hard | `Verdict`, `CheckCard`, `ReadFailure`, `SkeletonLine`, `DailyPricesCard`, `FinancialsCard`, `ScoresCard`, and `copy.ts`, which this story extends (S1 plan T012–T017). Existing edge |
| CAP-003-E6-S2 | hard | `DownloadNow({ label? })` in the header slot and the empty card (S2 plan T010; DEC-0379). Existing edge |
| CAP-003-E6-S3 | hard | `NeedsFixing({ dataHealth, onReread })` (S3 plan T014; DEC-0380). Existing edge |
| CAP-003-E6-S4 | hard | `RecentDownloads()` and `WhatYouFollow()` (S4 plan T013, T014). Existing edge |
| CAP-003-E3-S3 | hard | `useShell`, `ShellProvider` (test harness) and `useDataHealth` (E3-S3 plan T009, T010). Existing edge |
| CAP-003-E3-S2 | hard | `LAYOUT.contentMaxWidth` from `layout.ts`, and `HealthProvider` in the test harness (E3-S2 plan T008). Existing edge |
| CAP-003-E1-S9 | hard | `StateRegion` and its renderer map (E1-S9 plan T005; DEC-0313). Existing edge |
| CAP-003-E1-S6 | hard | `formatCount`. `Absent` is rendered through S1's cards and asserted in T002 and T008 (E1-S6 plan T007). Existing edge |
| CAP-003-E1-S1 | hard | `Card`, `CardHeader`, `CardTitle`, `CardContent` and `Button` imported by `index.tsx`. `web/src/components/token-literals.test.ts`, whose `SCANNED_DIRECTORIES` this story widens (E1-S1 plan T003). **Edge added** |
| CAP-003-E3-S1 | hard | `type { Attention, ReadState }` from `web/src/app/shell-types.ts` for the slot adapter, and `shell-client.ts`, mocked in the harness (E3-S1 plan T009, T010). **Edge added**, following CAP-003-E6-S4's same addition |
| CAP-003-E6-S7 | reverse | It registers `/data` with this story's default `DataHealthScreen` (S7 Dependencies). Graph: S7 depends on S5 |
| CAP-003-E6-S6 | reverse | Its real-stack journeys (TC-INT-014, TC-INT-019; TC-E2E-003, TC-E2E-004) drive this screen. Graph: S6 → S7 → S5 |
| CAP-003-E3-S4 | context | Its `React.lazy(() => import("../screens/…"))` binding pattern is why `DataHealthScreen` is the default export. Nothing is imported |
| CAP-003-E3-S6 | context | The shell's `main` region, focus to the screen's `h1` on route change, and the unreachable state this screen records as not applicable. Nothing is imported |
| CAP-003-E4-S2 | context | Its T007 is the precedent T009 follows for widening `SCANNED_DIRECTORIES` with a screen directory. Nothing is imported |
| CAP-003-E1-S5 | context | `StatusBadge`'s words and shape, asserted at screen level in T008. It is rendered only through the sibling regions, so nothing is imported here |

Two edges are added to `CAP-003-E6-S5` in `dependencies.yaml`: `CAP-003-E1-S1` and `CAP-003-E3-S1`. Neither depends on E6-S5, so no cycle is introduced.

### Task Dependencies

- T001: no dependencies.
- T002 → T003 → T004 → T005 → T006 → T007 → T008 → T010: same file (`data-health.test.tsx`), sequential, after T001.
- T009: a different file (`token-literals.test.ts`); it can run in parallel with the `data-health.test.tsx` chain.
- T011: depends on T001. T010 is RED first.
- T012: depends on T011.
- T013: depends on T011 and T012. T002–T008 are RED first.
- T014: depends on T009 (RED first) and T013.
- T015: depends on T013 and T014.
- T016: depends on T015.
- T017: interleaved. It runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- T009, in the shared scan file, can be written alongside the `data-health.test.tsx` chain.
- Nothing else is worth splitting. Production is one new file and two appends.

---

## Validation Plan

### Constitution-Defined Commands

These are the `docs/constitution/tech-stack.md` v7 Validation Commands, run from working directory `.`:

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test` (Vitest; also drives a real Vite build)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`

The Python commands do not apply, because no file under `src/` is touched. `npm run test:e2e` does not apply either: the real-stack journeys are CAP-003-E6-S6's.

### Story-Specific Validation

- **DAC-E6-S5-1, DAC-E6-6 and AC-21.** T003 passes:
  - **Open setup** to `/setup` at 0 followed stocks.
  - **Start the first download** with the 12-stock sentence.
  - The running first download's progress beneath the card.
  - No check card, verdict badge or What you follow.
- **DAC-E6-7.** T002 passes. Both check cards show *no data stored yet* twice each, with no badge.
- **DAC-E6-S5-2, DAC-E6-15 and AC-28.** T004 passes:
  - one read over ten fake minutes
  - two after a stop following
  - two after one terminal transition

  In addition, `grep -nE "setInterval|setTimeout|fetchDataHealth" web/src/screens/data-health/index.tsx` prints nothing, and `grep -rn "useDataHealth()" web/src/screens/data-health/*.tsx | grep -v test` prints exactly the one line in `index.tsx`.
- **DAC-E6-S5-3 and AC-24.** T005 passes for each of the eight states. `npx tsc --noEmit` accepts the `StateRegion` map. The module doc comment carries the per-region record, including the check cards' Stale line.
- **DAC-E6-S5-4 and AC-26.** T009 passes with the directory appended. The planted `12px` fails it, naming the file. T006 (a) pins the `LAYOUT` cap.
- **DAC-E6-S5-5 and AC-19.** T007 passes over every state.
- **DAC-E6-S5-6 and AC-20.** T008 passes.
- **Plan self-consistency.**
  - The Validation grep for `setInterval|setTimeout|fetchDataHealth` runs over `index.tsx` only. The module doc comment must not name those identifiers, and refers to "a timer" and "the aggregate read" instead.
  - The `useDataHealth()` grep expects exactly one production call.
  - The `1180px` grep expects no hit, because the doc comment names `LAYOUT.contentMaxWidth`, never its value.

---

## Notes

### Resolved Conflicts

1. **What renders while attention loads or fails** (register G2). DAC-E6-6 makes the empty card depend on attention's `latest_terminal_download`, which is unknown before attention answers.
   - **While attention loads.** ux-design 1.4 States (Loading) settles it: "Skeleton verdict line and badge, three skeleton cards, skeleton rows in the three lower cards". The slot renders three skeleton check cards (T005 (a), (a2)).
   - **While attention fails.** data-health-ui 10 States (Unavailable: "the verdict while attention fails") and ux-design 1.4 States (Error: "the verdict's read is attention, so its failure renders there") settle it. The full layout renders: the verdict shows S1's attention error, and the cards keep rendering from their own reads (T005 (f)).
   - Neither is a genuine gap.
2. **The page header's actions while the empty card shows** (register G7). ux-design 1.4 States and data-health-ui 10 list exactly what gives way: "the verdict, the check cards and What you follow give way to one `card` `default` under the `h1`". The header row's actions are not on that list, and S1's `Verdict` renders the `h1`, **Full coverage table** and the `downloadNow` slot in every state (S1 plan T007 (g)). The header therefore keeps both actions (T003 (a)). **Download now** with no followed stock answers S2's `409` *Couldn't start the download: no stocks are followed.* with **Follow stocks**, which is honest.
3. **The source of *{n}* in the empty card** (register G13). DAC-E6-S5-1 and TC-COMP-175 state the precondition as `active_count`, which is the field of `GET /api/instruments`. Attention's `followed_count` is the same figure by definition:
   - data-health-reader Q1 counts `instrument WHERE lifecycle = 'active'`.
   - The delivered `src/factorflow/instruments/service.py` l.161–167 computes `active_count` as `count(*) FILTER (WHERE lifecycle = 'active')` over the same table.

   The card reads `attention.data.followed_count`, which is always present when the card renders, because the card's own condition is an attention answer. This needs no extra read and no loading or error state of its own (ladder step 4). The test fixtures set `listInstruments` `activeCount` equal to it, and T003 (b) pins the source while the aggregate is pending.
4. **The aggregate's state in the verdict region while the empty card shows.** S1's `Verdict` checks aggregate `loading` and `error` before it computes the null answer (S1 plan T017, body steps 3–5). So under the `h1` in the empty state, a skeleton line shows until the aggregate answers, or *Couldn't read the data health checks: {reason}.* with **Try again** if it fails.
   - **Governing:** DAC-E6-6, whose "in place of the verdict" names the verdict's answer (badge and sentence), which S1 never renders there.
   - The aggregate's failure sentence is DAC-E6-17's per-region error, not a verdict, and is what tells the owner whether *Needs fixing* would have rows.
   - So *Needs fixing* is rendered in the empty state only when the aggregate answered with `affected_count` above 0, which is DAC-E6-6 literally (T003 (e)).
5. **TC-COMP-177's precondition "Screen rendered through `StateRegion`"** is read alongside DAC-E6-S5-3's "or records why it does not apply" (story AC above test spec). The slot this story composes renders through `StateRegion` (Open Gap 1). The regions owned by CAP-003-E6-S1 to S4 render their states from the shell's `ReadState`, as each sibling plan chose (register G12). This story records their eight states in the per-region record below and asserts it at screen level in T005.

### Open Gaps

1. **How Data health meets DAC-E6-S5-3 with `StateRegion`, and the per-region record of the eight states. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0386.**
   - **What is undetermined.** There are three parts:
     - CAP-003-E1-S9's `StateRegion` takes the delivered `ScreenState<T>` (eight kinds, with `populated` and no `stale`). The shell exposes `ReadState<T>` (three kinds), and no artifact defines an adapter (register G12).
     - The UX's eight states (Loading, Empty ×2, Partial, Stale, Unavailable, Error, Unreachable) are not the `ScreenState` kinds.
     - CAP-003-E6-S1 to S4 already render their regions' states from `ReadState` with S1's `ReadFailure` and `SkeletonLine`. `ReadFailure` follows `StateRegion`'s error convention without importing it.

     No artifact says which region renders through `StateRegion`, nor where the "record why it does not apply" lives.
   - **What the plan adopts (T005, T013).**
     - **The slot.** The slot under the header renders through `StateRegion`, over the adapter `slotState(attention)` (`loading` → `loading`; `error` → `unavailable`; `ok` with no terminal download → `empty-never-populated`; else `populated`). Its four inapplicable kinds carry `notApplicable` reasons, so `tsc` refuses an unrecorded one.
     - **The other regions.** They keep their own renderings.
     - **The record.** The per-region record below lives in `index.tsx`'s module doc comment and is enumerated by T005.
   - **Derivation.** The slot is exactly the never-populated-or-not decision AC-21 is about. `StateRegion`'s separate `empty-never-populated` and `empty-no-match` renderers are the guard against collapsing them (DAC-E1-10). Mapping attention's failure to `unavailable` is data-health-ui 10's own wording ("Unavailable: … the verdict while attention fails"). Keeping the sibling regions as built avoids changing four approved-plan interfaces. The record's non-applicability reasons each cite the artifact that makes the state not arise.
   - **Alternatives rejected.**
     - **Wrapping each sibling region in `StateRegion` through a `ReadState` adapter.** `StateRegion`'s error places the sentence in a `status` element with one **Try again** outside the region, so a card's header would sit inside the announcement and the per-card **Try again** of DAC-E6-17 would move outside the card. Remounting on every kind change would also repeat S4's mount reads.
     - **Using `StateRegion` for the whole screen.** The wrapper changes between `loading` and `populated` would remount *Needs fixing*, Recent downloads and What you follow, repeating their reads.
   - **Classification.** Contained. No other story's code consumes the slot or the record.
   - **Owning design.** data-health-ui 10 (States) and ui-components 2.7 (the `ReadState` and `ScreenState` seam), at their next revisions.

**Genuine gaps recorded, with no value adopted:**

2. **What you follow keeps its loaded counts after Stop following.** S4 reads on mount and on **Try again** only. After a successful **Stop following**, *Followed stocks* and *Stopped following* keep their loaded values until the next load. No artifact asks for a re-read; DAC-E6-15 lists the aggregate only. This plan adds none. **Owning design:** data-health-ui 2.6 and 2.7.
3. **The just-ended download's row in Recent downloads stays as last read** until the next load (CAP-003-E6-S4 Open Gap 3, DAC-E6-14 as written). This screen does not re-key S4's component to force a read, because that would add a read DAC-E6-14 excludes. **Owning design:** data-health-ui 2.6.
4. **Singular copy** (register G11). *Download data for your 1 followed stocks…* follows DAC-E6-6 as written; no singular form is specified. **Owning design:** data-health-ui 10.
5. ***Start the first download* while the first download is running** (register G8; FINDING-6, open). DAC-E6-6 renders the action whenever `latest_terminal_download` is null, so a second press queues a second download (S2 shows *A download is running. This starts when it finishes.*). It is implemented as specified. **Owning design:** data-health-ui 10, DAC-E6-6.
6. **The verdict reads *Yes* after a first download ends `cancelled` with nothing stored** (register G9; FINDING-23, open). The screen renders the full layout with the check cards' null state, as DAC-E6-6 and DAC-E6-7 specify. **Owning design:** data-health-ui 2.3.

### Other Notes

- **The per-region record of the eight states** (DAC-E6-S5-3; written into `index.tsx`'s module doc comment by T013, and asserted by T005). "NA" means not applicable, with the reason given.

  | Region | Loading | Empty, never populated | Empty, nothing found | Partial | Stale | Unavailable | Error | Unreachable |
  |---|---|---|---|---|---|---|---|---|
  | **Header and verdict** (S1) | Skeleton line | The answer gives way to the empty card; the header stays | *Yes. None of the {m}…* | *Mostly yes* (warning, or serious when interrupted) | NA: the aggregate is read on demand and the line shows its *checked {time}* (AC-25) | Attention fails: *Couldn't read what needs attention: {reason}.* | Aggregate fails: *Couldn't read the data health checks: {reason}.* | NA: the shell (AC-23) |
  | **Daily prices / Company financials** (S1, composed here) | Skeleton card | Give way to the empty card. After a download ended with nothing stored, the `Absent` null state (DAC-E6-7) | `ok`: *No missing prices or gaps* / *All financials present* | `exceptions`, *Needs attention*, with counts and symbols | **Not rendered:** under DEC-0201 `latest_session` is the newest session any followed stock holds, and FactorFlow has no trading calendar. Returns with one (system design open question 9; DEC-0206) | Daily prices' gap part `coverage-unknown`. Company financials NA: it has no not-determinable status (data-health-api 2.4) | Per card, header kept, *Couldn't read the data health checks: {reason}.* with **Try again** | NA: the shell |
  | **Factor scores** (S1) | Skeleton | Gives way to the empty card | *No scores yet* (never classified) | *{k} stocks show as Incomplete…* | *Not reflecting the latest download* | `coverage-unknown` while not served | Last value kept, else *Couldn't read the factor scores: {reason}.* (DEC-0376) | NA: the shell |
  | **Empty card** (S5) | NA: it renders only on an attention answer; loading shows skeleton cards | The card itself | NA: no filter | NA | NA: attention is polled by the shell | NA: a failed attention read renders the full layout | NA: as Unavailable | NA: the shell |
  | **Needs fixing** (S3) | `h2` and skeleton lines | Rendered only when `affected_count` is above 0 | *Nothing needs fixing.* with the last complete download | Rows with **Show more** | NA: rows come from the on-demand aggregate, with *checked {time}* in the sub-line | NA: every row's reason is recorded; nothing here is undeterminable | *Couldn't read the data health checks: {reason}.*; a **Show more** failure keeps rows | NA: the shell |
  | **Recent downloads** (S4) | Skeleton | Rendered only when a download exists (S4 Open Gap 6) | NA: no filter | *Partial* and *Interrupted* rows (AC-12) | NA: re-read on each attention answer while running, with *checked {time}* (AC-25) | Indeterminate progress while `total` is null (DEC-0213 (f)) | *Couldn't read recent downloads: {reason}.* | NA: the shell |
  | **What you follow** (S4) | Skeleton | Gives way to the empty card | NA: counts are numbers, including 0 | NA: the summary has no partial answer | NA: read on load (Open Gap 2) | *Market data key* `coverage-unknown` while health is not answering | *Couldn't read what you follow: {reason}.* | NA: the shell |
- **No breakpoint.** The four-column check grid and the two lower columns hold at every width. ux-design 0.1 *Responsive*: between 1024 and 1279 px "nothing on these screens moves", and below 768 px only the rail and top bar change; "nothing becomes unreachable, and nothing needs to be pleasant on a phone".
- **The root element is a `div`.** The shell's main region is the page's `main` (the delivered `shell.tsx` l.68; owner-shell 10: "one `main` with one `h1` per screen"). The screen supplies the `h1` through S1's `Verdict`, with `tabIndex={-1}` for the shell's focus move.
- **The refusal-close read.** CAP-003-E6-S3's `onRefusalClosed={onReread}` (DEC-0381) adds an aggregate read when a `404` or `409` refusal dialog closes. T004 does not exercise a refusal, so its exact counts hold. This screen treats that read as S3's, not as a fault.
- **Three Download now buttons.** With the empty card showing, a retryable problem row loaded, and stocks followed, the header, *Needs fixing* and the card each render S2's action. That is one `default` button per region (ux-design 1.4 Component Mapping). Each instance keeps its own helper line (S2 caller contract).
- **No toast, no title detail.** `/data` raises no completion toast (owner-shell 2.9) and needs no `setTitleDetail` (DEC-0214).
- **No self-contradicting check.** The term scan reads rendered text and accessible names, never source. The `notApplicable` reasons in `index.tsx` are never rendered (`StateRegion` never renders them; E1-S9 T004 case 5), and they contain no DAC-E7-3 term anyway. The literal scan runs over `index.tsx`'s comments too, so the doc comment names layout keys, never values.
- **Hand-written mutants** (add these to the mutation run beside the generated ones):
  - `web/src/screens/data-health/index.tsx`: `attention.data.latest_terminal_download === null` → `attention.data.latest_download === null` (killed by T003 (d))
  - `web/src/screens/data-health/index.tsx`: `attention.data.latest_terminal_download === null` → `dataHealth.kind === "ok" && dataHealth.data.never_acquired` (killed by T002 (f))
  - `web/src/screens/data-health/index.tsx`: `followedCount > 0` → `followedCount >= 0` (killed by T003 (a))
  - `web/src/screens/data-health/index.tsx`: `attention.data.followed_count` → `dataHealth.data.followed_count` (killed by T003 (b))
  - `web/src/screens/data-health/index.tsx`: `onReread={retry}` → `onReread={() => {}}` (killed by T004 (b))
  - `web/src/screens/data-health/index.tsx`: (added) `useEffect(() => { retry(); }, [attention]);` (killed by T004 (a))
  - `web/src/screens/data-health/index.tsx`: `onRetryAttention={() => refresh("attention")}` → `onRetryAttention={retry}` (killed by T005 (f))
  - `web/src/screens/data-health/index.tsx`: `onRetryScores={() => refresh("scores")}` → `onRetryScores={() => refresh("attention")}` (killed by T006 (d))
  - `web/src/screens/data-health/index.tsx`: the check cards' `onRetry={retry}` → `onRetry={() => refresh("attention")}` (killed by T005 (g))
  - `web/src/screens/data-health/index.tsx`: `loading: () => <CheckGrid skeleton />` → `loading: () => <CheckGrid skeleton={false} />` (killed by T005 (a2))
  - `web/src/screens/data-health/index.tsx`: `showFollow = !empty` → `showFollow = true` (killed by T003 (a))
  - `web/src/screens/data-health/index.tsx`: `style={{ maxWidth: LAYOUT.contentMaxWidth }}` → (removed) (killed by T006 (a))
