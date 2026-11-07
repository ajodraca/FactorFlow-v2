---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S2-tasks
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
  timestamp: 2026-11-07T05:59:14Z
  source_artifacts:
    - id: CAP-003-E3-S2
      version: "1"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-owner-web-app
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-owner-shell-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E3-S2 — layout.ts, usePolledRead and the Health Provider with lastAnsweredAt and the Hidden-Page Pause

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S2.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/app/`; design `owner-shell`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-06

## Summary

Creates the three owner-shell modules that hold the shell's polling rules and layout dimensions, one place each. `web/src/app/layout.ts` exports `LAYOUT`, the seven approved-specification layout values of owner-shell §2.1 (DAC-E3-16; AC-26 as the owner narrowed it). `web/src/app/use-polled-read.ts` exports `usePolledRead(read, intervalMs)` with the signature owner-shell §2.4 pins: read on mount, a `setTimeout` chain whose delay comes from the last answer, cleared on `visibilitychange` to hidden and read at once on visible, never two reads of one kind at once, `checkedAt` on every answer (AC-25) and the last value kept in `error.last` on failure (DAC-E3-5, DAC-E3-S2-1, DAC-E3-S2-2). The scheduling itself is one plain function in the same file, `startPolling`, so the health poll gets "the same visibility rule" from the same code. `web/src/app/health.tsx` copies `HealthProvider`, `useHealth`, `formatTimestamp`, `UNREACHABLE_MESSAGE`, `Liveness`, `HealthState` and `HEALTH_POLL_INTERVAL_MS` from the delivered `status-region.tsx`, keeps the delivered `unknown`, `answering` and `unreachable` states and the 30 s cadence, and gains `lastAnsweredAt` and the hidden-page pause (DEC-0212, DEC-0211; DAC-E3-S2-3), plus `useHealthRefresh()` so the shell context can re-read health (Open Gap 2). `status-region.tsx` and its tests are left untouched; CAP-003-E3-S6 deletes them. `web/src/components/token-literals.test.ts` (CAP-003-E1-S1) gains the layout rule: the seven values appear in no non-test `.ts`/`.tsx` source under `web/src/` except `layout.ts`, with CAP-002's research screens outside the rule's scope (Resolved Conflict 1; Open Gap 1). Nothing is mounted or wired yet. CAP-003-E3-S3, CAP-003-E3-S4 and CAP-003-E3-S6 are the first consumers.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-25 | Every polled region shows its last-updated time: every successful `usePolledRead` answer carries `checkedAt`, and health carries `lastUpdated` and `lastAnsweredAt` | T003, T005, T006, T010, T011 |
| AC-26 | The seven approved-specification layout dimensions are held in one layout-constants module | T001, T002, T008, T009, T013 |
| DAC-E3-5 | `usePolledRead` reads on mount, schedules from the last answer's interval, clears on hidden, reads at once on visible, never overlaps; `HealthProvider` keeps its states and 30 s cadence and gains `lastAnsweredAt` and the same visibility rule | T003, T005, T006, T007, T010, T011, T012 |
| DAC-E3-16 | `web/src/app/layout.ts` holds the seven values, and no other file writes them | T001, T002, T008, T009, T013 |
| DAC-E3-S2-1 | Last answer implies 10 s: no read while hidden, one at once on visible and the schedule resumes; no second read of a kind while one is in flight | T003, T005, T010 |
| DAC-E3-S2-2 | A failed read after a success is `{ kind: "error", error, last: { data, checkedAt } }` with the previous value kept | T004, T005, T010 |
| DAC-E3-S2-3 | A successful health read sets `lastAnsweredAt` to that instant, and the delivered `formatTimestamp` still renders *America/Chicago* | T006, T007, T011 |
| DAC-E3-S2-4 | The layout rule finds `208px`, `1180px`, `260px`, `300px`, `28px`, `16px` and `70ch` in no non-test source other than `web/src/app/layout.ts` | T001, T002, T008, T009, T013 |

## Phase 1: Setup

**Purpose**: None required. No package, configuration or directory is added: React 18, Vitest 2, `@testing-library/react` 16 (`renderHook`) and jsdom are delivered, and `web/src/app/` exists.

**Checkpoint**: CAP-003-E3-S1 (`web/src/app/shell-types.ts`) and CAP-003-E1-S1 (`web/src/components/token-literals.test.ts`) are merged into the working tree before Phase 2 starts. Both are hard graph edges.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the layout rule, the polling rules and the moved health provider.

### Mandatory Component Tests

- [ ] T001 Implement TC-COMP-072 (the seven layout values live only in layout.ts) as a new `describe("layout rule (DAC-E3-16, DAC-E3-S2-4)")` block in `web/src/components/token-literals.test.ts`, with a `// Implements TC-COMP-072` comment. Add these beside E1-S1's helpers: a `LAYOUT_LITERALS` array, the independent literal list `["208px", "1180px", "260px", "300px", "28px", "16px", "70ch"]`; a `LAYOUT_RULE_ROOT = "web/src/"`; a `LAYOUT_RULE_EXEMPT = ["web/src/app/layout.ts", "web/src/screens/research/"]` (the file itself, and a directory prefix; DEC-0321); and `layoutLiteralsIn(relPath, source, exempt = LAYOUT_RULE_EXEMPT): string[]`. That function returns `"<relPath>: <value>"` for each match of `(?<![\w.-])(208|1180|260|300|28|16)px\b` and `(?<![\w.-])70ch\b`, and returns `[]` when `relPath` equals or starts with an entry of `exempt`. File selection reuses E1-S1's `isScannedSource` (`.ts`/`.tsx`, not `*.test.ts(x)`) and the recursive walker its TC-COMP-005 cases use, resolved from the repo root the way that block does. Cases:
  - (1) Walking `web/src/` finds more than 50 scanned sources, so the pass is not vacuous. The list includes `web/src/app/shell.tsx` and `web/src/screens/research/stocks/index.tsx`, and `layoutLiteralsIn` over all of them returns `toEqual([])`.
  - (2) `it.each(LAYOUT_LITERALS)`: a planted `const x = "<value>";` at `web/src/app/planted.tsx` returns exactly `["web/src/app/planted.tsx: <value>"]`. This is TC step 2: the planted `208px` fails the rule.
  - (3) `max-w-[1180px]` returns `[]` at `web/src/app/layout.ts` and at `web/src/screens/research/stocks/index.tsx`, and returns one offender at `web/src/screens/home/index.tsx` and at `web/src/screens/researcher.tsx`. The last one is a prefix look-alike outside the exempt directory.
  - (4) `w-[116px]`, `w-[128px]`, `1280px`, `p-[2.16px]` and `170ch` each return `[]`, so only whole values match.
  - (5) `16 px` with a space, `--space-4` and `h-4` return `[]`.
  - TC edge case: `import { LAYOUT } from "../app/layout"` and assert `expect(LAYOUT).toEqual({ railWidth: "208px", contentMaxWidth: "1180px", sideColumnMin: "260px", sideColumnMax: "300px", markerSize: "28px", railIconSize: "16px", explanationMeasure: "70ch" })` against that independent literal object, and assert `Object.keys(LAYOUT)` equals the same seven names in that order.

  This block is RED until T008 exists, because the import fails. Kills: off-by-one on the regex's numeric alternatives (case 2: a dropped or altered alternative stops naming its planted value); remove-attribute on the `(?<![\w.-])` lookbehind (case 4: `128px` then reports `28px`); swap-case on the exempt prefix (case 3: exempting `web/src/screens/` instead lets `home/index.tsx` pass, and exempting `web/src/screens/research` without the trailing slash lets `researcher.tsx` pass); negate-boolean on the exemption test (case 1 reports `research/stocks/index.tsx` and `layout.ts`); swap-case on a `LAYOUT` value such as `"28px"` to `"16px"`, caught by the literal-object `toEqual`.
- [ ] T002 Pin the rule's scope against the delivered tree in `web/src/components/token-literals.test.ts`, in the same `describe` and sequential with T001: `it("CAP-002's research screens are the only exempt directory")` asserts `LAYOUT_RULE_EXEMPT` `toEqual(["web/src/app/layout.ts", "web/src/screens/research/"])`. A second case walks `web/src/screens/research/`, calls `layoutLiteralsIn(relPath, source, [])` with no exemption, and asserts that directory are exactly `["web/src/screens/research/stocks/index.tsx: 1180px", "web/src/screens/research/stocks/index.tsx: 1180px"]`, the two delivered CAP-002 occurrences at `index.tsx:221` and `:270`. A new layout literal added under research by a later change then fails here and needs a decision, instead of passing silently. Kills: drop-field-copy on an exemption entry, observed by the `toEqual`; widening the exemption to all of `web/src/screens/`, observed by the same `toEqual`.
- [ ] T003 [P] Implement TC-COMP-069 (usePolledRead pauses while hidden, reads at once on show, never overlaps) in a new `web/src/app/use-polled-read.test.ts` with a `// Implements TC-COMP-069` comment. Use `vi.useFakeTimers()` with no `shouldAdvanceTime`, so the counts and instants are exact, and `vi.setSystemTime(new Date("2026-09-06T18:30:00.000Z"))`. Flush with `await act(() => vi.advanceTimersByTimeAsync(n))`. Drive visibility with a local helper `setVisibility("hidden" | "visible")` that does `Object.defineProperty(document, "visibilityState", { configurable: true, get: () => value })`, does the same for `document.hidden`, and dispatches `new Event("visibilitychange")` on `document`. Restore in `afterEach`. No delivered precedent exists in `web/src`. Use `renderHook(() => usePolledRead(read, intervalMs))` where `read = vi.fn()` resolves `{ fast: true }` and `intervalMs = (last) => (last?.fast ? 10_000 : 60_000)`. Steps:
  - (a) Flush the mount read, then `setVisibility("hidden")` and advance 30 000 ms: `read` was called 1 time, so nothing fired while hidden.
  - (b) `setVisibility("visible")` and flush 0 ms: 2 calls, the read at once. Advance 9 999 ms: still 2. Advance 1 ms: 3 calls, so the 10 s schedule resumed from the visible read.
  - (c) Make the next read a deferred promise that is never resolved, advance past 10 000 ms so it starts (4 calls), then advance another 30 000 ms: still 4, with no timer while a read is in flight. Then `setVisibility("hidden")`, `setVisibility("visible")` and `result.current.refresh()` while it is still pending: still 4. Resolve it and advance 10 000 ms: 5.
  - (d) TC edge case: `unmount()`, then advance 120 000 ms and `setVisibility("visible")`: no further call.

  Kills: negate-boolean on the scheduler's hidden guard (`visibilityState !== "hidden"` to `===`: (a) fires during the hidden 30 s and (b) never schedules); negate-boolean on the in-flight guard (`if (inFlight) return` to `if (!inFlight) return`: (c) starts a second read on visible or refresh); off-by-one on the delay (`>=` boundary at 9 999 and 10 000 ms in (b)); negate-boolean on the stopped guard ((d) reads after unmount). The listener's removal on stop is a hand-written mutant (Other Notes), observed in (d).
- [ ] T004 [P] Implement TC-COMP-070 (a failed read keeps the previous value in error.last) in `web/src/app/use-polled-read.test.ts`, with a `// Implements TC-COMP-070` comment, using the same harness as T003 and an `intervalMs` that always returns 10 000. Cases:
  - (a) The first read resolves the literal `{ n: 1 }` at `2026-09-06T18:30:00.000Z`. The next rejects with `new ApiError("boom", "req-1", { code: "internal_error" })` at +10 s. `result.current.state` `toEqual({ kind: "error", error: <that instance>, last: { data: { n: 1 }, checkedAt: new Date("2026-09-06T18:30:00.000Z") } })`, and `state.error` is that same instance (`toBe`).
  - (b) A third read rejects with `new ApiUnreachableError("down")`. `last` is still `{ data: { n: 1 }, checkedAt: <18:30:00> }`, the last success, not `null`, and the polling continues: one more call at +10 s.
  - (c) TC edge case: in a fresh hook whose first read rejects, the state is `{ kind: "error", error, last: null }`.
  - (d) A success after the errors returns `{ kind: "ok", data: <new literal>, checkedAt: <that instant> }`.

  Kills: swap-case on the `last` source (`previous.last` to `null` in the error-after-error branch: (b) fails); drop-field-copy on `checkedAt` in `last` (the `toEqual` on the literal instant fails); swap-case on `"error"` to `"ok"` in the failure branch.

### Additional Unit Tests

- [ ] T005 [P] `usePolledRead` mount, `checkedAt`, interval-from-last-answer and `refresh` cases in `web/src/app/use-polled-read.test.ts` (DAC-E3-5, AC-25, owner-shell §2.4). These additional unit tests are not TC-COMP-074, which is CAP-003-E3-S3's shell-context case. Cases:
  - (a) Before the mount read settles, `state` `toEqual({ kind: "loading" })`. After it settles, `{ kind: "ok", data: <literal>, checkedAt: new Date("2026-09-06T18:30:00.000Z") }`. A second answer 60 s later has `checkedAt` `2026-09-06T18:31:00.000Z`, so `checkedAt` is the answer's instant and not the mount's.
  - (b) `intervalMs` receives the last successful data. With answers `{ fast: false }` then `{ fast: true }`, `intervalMs` is called with those two literals in order, and the gaps between reads are 60 000 then 10 000 ms. When the first read fails, `intervalMs` is called with `null` and the next read is at 60 000 ms.
  - (c) `refresh()` with a read scheduled 60 s out, at +20 s: one read fires at once. Advancing to the old +60 s mark adds no read. The next read is at +80 s, rescheduled from the refresh.
  - (d) A `read` or `intervalMs` closure that changes on re-render is used from the next read on, and does not restart the poll: `rerender` with a new `read` adds no immediate call, and the next scheduled call goes to the new function. CAP-003-E3-S3 needs this for its cross-read cadence.

  Kills: drop-field-copy on the `lastData` assignment ((b) passes `null` instead of the literal); a hand-written mutant that drops the `clearTimeout` before a refresh read, observed in (c) as an extra read at +60 s; drop-field-copy on `checkedAt` ((a) asserts the exact instant).
- [ ] T006 [P] Implement TC-COMP-071 (HealthProvider records lastAnsweredAt and keeps delivered rendering) in a new `web/src/app/health.test.tsx`, with a `// Implements TC-COMP-071` comment. Mock `../api/client`'s `fetchHealth` exactly as `status-region.test.tsx` does (`vi.mock` with `importActual`). Use the `answering()` fixture copied from that file, and a `Probe` that renders `useHealth()` as `data-liveness`, `data-last-updated` (`toISOString()` or `"null"`), `data-last-answered` and `data-database`. Use plain `vi.useFakeTimers()` with `vi.setSystemTime(FIXED_NOW)`, where `FIXED_NOW` is `2026-09-06T18:30:00.000Z`. Cases:
  - (a) After the first success, `data-last-answered` and `data-last-updated` are both `"2026-09-06T18:30:00.000Z"`.
  - (b) The read 30 s later rejects with `ApiUnreachableError`: `data-liveness` is `unreachable`, `data-last-updated` is `"2026-09-06T18:30:30.000Z"`, `data-last-answered` stays `"2026-09-06T18:30:00.000Z"`, and `data-database` is still `"reachable"` because `health` keeps its last value. The two timestamps differ here, so a mutant that writes the failure time into `lastAnsweredAt` is visible, and a mutant that freezes `lastUpdated` is visible too.
  - (c) Before the first answer, `data-liveness` is `unknown` and both times are `"null"`.
  - (d) `formatTimestamp(new Date("2026-09-06T18:30:00.000Z"))` is exactly `"2026-09-06 13:30:00 America/Chicago"`, the delivered case.
  - (e) `UNREACHABLE_MESSAGE` equals the delivered sentence as an independent literal, word for word: *FactorFlow is not answering. The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.*

  Kills: drop-field-copy on `lastAnsweredAt: previous.lastAnsweredAt` in the failure branch ((b)); swap-case on `"unreachable"` to `"answering"` ((b)); drop-field-copy on `health: previous.health` ((b) `data-database`).
- [ ] T007 [P] Move the delivered HealthProvider polling, unknown-state and cleanup cases into `web/src/app/health.test.tsx` (owner-shell §2.10; DAC-E3-5), rewritten against `<HealthProvider><Probe /></HealthProvider>` instead of `StatusRegion`. Keep each delivered case's assertion, and cite its delivered TC (TC-COMP-304, TC-COMP-018, TC-COMP-339) in a comment. `status-region.test.tsx` itself stays unedited. Cases:
  - Fetches on mount and reports `answering`.
  - Polls at 30 s, then 30 s again (2 then 3 calls).
  - Not before 30 s (29 000 ms: 1 call). Add the boundary 29 999 ms: 1 call, then 1 ms more: 2.
  - A rejected fetch is `unreachable`.
  - `database: "unreachable"` in a successful answer is still `answering`.
  - No fetch after unmount, however far timers advance.
  - One poll across re-renders of the provider (one extra call per 30 s).
  - Two `Probe`s under one provider make one fetch per cycle.
  - `useHealth()` with no provider above still polls for itself (the delivered fallback).

  Add these new cases (DEC-0212):
  - Hidden for 90 s: 1 call. Visible: 2 at once. 30 000 ms later: 3.
  - `useHealthRefresh()` called inside the provider at +10 s: one fetch at once, and the next is at +40 s, not +30 s. Called while a fetch is pending, it adds none.
  - `useHealthRefresh()` with no provider returns a function that makes no fetch (Open Gap 2).

  Kills: off-by-one on `HEALTH_POLL_INTERVAL_MS` (30_000 to 30_001, by the 29 999 ms / 30 000 ms boundary); negate-boolean on `enabled` in the provider's own hook (the two-`Probe` case doubles, or the fallback case never fetches).

**Checkpoint**: T001–T007 exist and fail for the right reason: `layout.ts`, `use-polled-read.ts` and `health.tsx` are missing, so the imports fail. `token-literals.test.ts`'s E1-S1 cases still pass.

---

## Phase 3: Core Implementation

**Purpose**: Write the three modules that make Phase 2 pass, each in its own TDD cycle.

- [ ] T008 Create `web/src/app/layout.ts` (depends on T001, T002 being RED): copy `export const LAYOUT = { railWidth: "208px", contentMaxWidth: "1180px", sideColumnMin: "260px", sideColumnMax: "300px", markerSize: "28px", railIconSize: "16px", explanationMeasure: "70ch" } as const;` exactly as owner-shell §2.1 writes it, with its per-key comments. Add a module doc comment naming AC-26 (as narrowed by the owner, 2026-10-25, review v1 FINDING-6), DAC-E3-16 and STD-UI-29, and saying these are approved-specification values, not theme literals or tokens, and are read from here and never written at a call site. Nothing imports it yet: CAP-003-E3-S6 is the first consumer. This makes T001 and T002 pass.
- [ ] T009 Confirm the layout rule against the delivered tree (depends on T008). `npx vitest run src/components/token-literals.test.ts` is green with E1-S1's blocks unchanged. Then plant `export const x = "208px";` in a temporary `web/src/app/planted.tsx`, confirm the layout case fails naming `web/src/app/planted.tsx: 208px`, and delete the file. Record both runs in the cycle's evidence.
- [ ] T010 Create `web/src/app/use-polled-read.ts` (depends on T003–T005 being RED). It imports `type { ApiError, ApiUnreachableError }` and the runtime classes from `"../api/client"`, and `type { ReadState } from "./shell-types"` (CAP-003-E3-S1). It defines two exports:
  - `export function startPolling<T>(read: () => Promise<T>, nextDelayMs: () => number, onSettled: (outcome: { ok: true; data: T } | { ok: false; error: unknown }) => void): { refresh(): void; stop(): void }`. This is a plain function, no React, documented as owner-shell's internal scheduler shared by `usePolledRead` and `health.tsx`.
    - It keeps `inFlight`, `timer` and `stopped`.
    - `run()` returns when `stopped` or `inFlight`. Otherwise it clears any timer, sets `inFlight`, and calls `read()`. On settle it calls `onSettled` first, so `nextDelayMs` sees the new answer. Then, in a `finally`, it clears `inFlight` and, unless `stopped` or `document.visibilityState === "hidden"`, sets `timer = setTimeout(run, nextDelayMs())`.
    - A `visibilitychange` listener clears the timer on hidden and calls `run()` on visible.
    - `refresh` is `run`.
    - `stop` sets `stopped`, clears the timer and removes the listener.
    - The function adds the listener and calls `run()` at once (read on mount).
  - `export function usePolledRead<T>(read: () => Promise<T>, intervalMs: (last: T | null) => number): { state: ReadState<T>; refresh(): void }`. The signature is owner-shell §2.4's, unchanged.
    - `useState<ReadState<T>>({ kind: "loading" })`.
    - `read` and `intervalMs` are held in refs updated on every render, so changed closures apply from the next read without restarting (T005 (d)).
    - `lastData` is a ref holding the last successful `T`, else `null`.
    - One `useEffect(() => { const h = startPolling(...); handle.current = h; return h.stop; }, [])`.
    - On success it stores `lastData` and sets `{ kind: "ok", data, checkedAt: new Date() }`.
    - On failure it sets `{ kind: "error", error, last }`. `last` is `{ data, checkedAt }` of the previous state when that was `ok`, the previous `last` when it was `error`, and `null` otherwise.
    - `error` is the rejection when it is `instanceof ApiError` or `instanceof ApiUnreachableError`. These are the only rejections `client.ts`'s `requestJson` and `fetchHealth` produce. Any other value is rethrown after the next read is scheduled, so a programming error surfaces instead of rendering as a stale read.
    - `refresh` is a stable `useCallback` calling the handle's `refresh`.

  Comment each rule with the AC and TC it serves (DAC-E3-5, DAC-E3-S2-1, DAC-E3-S2-2, TC-COMP-069, TC-COMP-070), as `status-region.tsx` does. Write no layout value and no `px` length in comments (T013). This makes T003–T005 pass.
- [ ] T011 Create `web/src/app/health.tsx` (depends on T010; T006, T007 are RED first). Copy from `web/src/app/status-region.tsx`, keeping its doc comments and updating the section references to owner-shell §2.4 and DEC-0211/DEC-0212:
  - `HEALTH_POLL_INTERVAL_MS = 30_000`, the `DISPLAY_TIME_ZONE` constant, `UNREACHABLE_MESSAGE` (byte for byte), `Liveness`, `formatTimestamp` (byte for byte, with the `24` to `00` mapping), `HealthProvider` and `useHealth`.
  - `HealthState` gains `lastAnsweredAt: Date | null`, documented as "the instant of the last successful answer, kept while unreachable (AC-23; DEC-0212)".
  - The private `useHealthPolling(enabled)` keeps its delivered shape and semantics. Initial state is `{ liveness: "unknown", health: null, lastUpdated: null, lastAnsweredAt: null }`. On success it sets `{ liveness: "answering", health, lastUpdated: now, lastAnsweredAt: now }` from one `now = new Date()`. On any failure it sets `{ liveness: "unreachable", health: previous.health, lastUpdated: now, lastAnsweredAt: previous.lastAnsweredAt }`, and the thrown text is discarded as delivered.
  - The polling loop replaces `setInterval` with `startPolling(fetchHealth, () => HEALTH_POLL_INTERVAL_MS, settle)` inside `useEffect(..., [enabled])` that returns `stop`, so health pauses and resumes by the same code as `usePolledRead`. The hook returns `{ state, refresh }`.
  - One context holds `{ state, refresh }`. `HealthProvider` supplies a `useMemo`'d value. `useHealth(): HealthState` returns the provider's `state`, or its own fallback poll's `state` when no provider is above it (delivered).
  - New export: `useHealthRefresh(): () => void` returns the provider's `refresh`, or a stable no-op when no provider is above it (DEC-0322).

  Do not import `OutcomeBadge`, `StatusRegion`, `UnreachableState` or any icon. Rendering moves in CAP-003-E3-S6 (register C13; owner-shell §2.8). Do not edit `status-region.tsx` or any of its tests: the story copies, so both exist until CAP-003-E3-S6. This makes T006 and T007 pass.

**Checkpoint**: `npm run test` is green, including every delivered `status-region*`, `shell*` and `routes` test, unchanged. The three new modules exist and nothing imports `use-polled-read.ts` or `health.tsx` yet, except `health.tsx` importing `startPolling`.

---

## Phase 4: Integration

**Purpose**: Confirm the change set is exactly the story's, with nothing wired early.

- [ ] T012 Confirm scope (depends on T008–T011). `git status --short` lists only these:
  - `web/src/app/layout.ts`, `web/src/app/use-polled-read.ts`, `web/src/app/use-polled-read.test.ts`, `web/src/app/health.tsx` and `web/src/app/health.test.tsx`;
  - `web/src/components/token-literals.test.ts`;
  - this story's `-tasks.md`, its `-tdd-evidence.yaml` and its status line.

  Run `git diff --exit-code -- web/src/app/status-region.tsx web/src/app/status-region.test.tsx web/src/app/status-region.a11y.test.tsx web/src/app/status-region.integration.test.tsx web/src/app/shell.tsx web/src/app/routes.tsx web/src/screens/` and confirm it exits 0. `grep -rn "from \"./health\"\|from \"../app/health\"\|use-polled-read" web/src --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` prints only `health.tsx`'s own `startPolling` import. No provider is mounted. CAP-003-E3-S3 and CAP-003-E3-S6 wire these modules.

**Checkpoint**: The story's six files and its plan artifacts are the whole diff. Delivered behaviour is unchanged.

---

## Phase 5: Polish

**Purpose**: Validation, formatting and the TDD evidence.

- [ ] T013 Run `npm run format` (a check) and fix any report with `npx biome format --write` on this story's files only. Then run `npm run lint`, `npx tsc --noEmit`, `npm run build` and `npm run test`. Re-run the Story-Specific grep below. No comment in `use-polled-read.ts`, `health.tsx` or any other non-test source may write a layout value without a space (`1180 px` is fine, `1180px` is not), because the layout rule reads comments too. No behaviour change.
- [ ] T014 After each TDD cycle in T001–T013 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E3-S2-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, and the structured `mutation:` block `scripts/mutation-run.py summary` prints. A cycle with no production change records `mutation: {not_applicable: <reason>}` instead.
  - Record `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged`, and save it as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC). The cycles are:
  - (1) T001 + T002 + T008 + T009: the layout module and the rule.
  - (2) T003 + T004 + T005 + T010: `startPolling` and `usePolledRead`.
  - (3) T006 + T007 + T011: `health.tsx`.

  T012 and T013 add no behaviour and join cycle 3's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S3 | reverse | Builds `ShellProvider` on `usePolledRead` and reads `useHealth()` and `useHealthRefresh()` for `health` and `refresh("health")`. Graph: E3-S3 depends on E3-S2 |
| CAP-003-E3-S4 | reverse | `RootRedirect` waits on `useHealth()`. Graph: E3-S4 depends on E3-S2 |
| CAP-003-E3-S6 | context | Deletes `status-region.tsx` and its tests, mounts `HealthProvider` from `health.tsx`, reads `LAYOUT.railWidth` and `contentMaxWidth`, and renders the *Last answered* line from `lastAnsweredAt`. It reaches E3-S2 through E3-S3 and E3-S4 in the graph. This plan cites it only for the order in which `status-region.tsx` goes away |

### Task Dependencies

- T001, T002: depend on CAP-003-E1-S1's `token-literals.test.ts`. They share one file, so they run in sequence.
- T003, T004, T005: depend on CAP-003-E3-S1's `shell-types.ts`. They share one file, so they run in sequence. They can run in parallel with T001 and T002.
- T006, T007: share one file, so they run in sequence. They can run in parallel with T001–T005.
- T008: depends on T001 and T002.
- T009: depends on T008.
- T010: depends on T003–T005.
- T011: depends on T010 (`startPolling`), T006 and T007.
- T012: depends on T008–T011.
- T013: depends on T012.
- T014: interleaved. It runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- Phase 2: the three test files (`token-literals.test.ts`, `use-polled-read.test.ts`, `health.test.tsx`) can be written in parallel.
- Phase 3: T008 and T010 can run in parallel. T011 waits for T010.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not run: this story changes no rendered surface and no e2e spec.

### Story-Specific Validation

- **DAC-E3-16 / DAC-E3-S2-4 (AC-26):** `npx vitest run src/components/token-literals.test.ts` is green. Then run `grep -rnE '(^|[^[:alnum:]._-])(208|1180|260|300|28|16)px([^[:alnum:]_]|$)|(^|[^[:alnum:]._-])70ch([^[:alnum:]_]|$)' web/src --include='*.ts' --include='*.tsx' | grep -v '\.test\.'`. It prints exactly the seven `LAYOUT` lines of `web/src/app/layout.ts` and the two delivered `max-w-[1180px]` lines of `web/src/screens/research/stocks/index.tsx` (`:221`, `:270`), which are outside the rule's scope (Resolved Conflict 1). Plant and remove `web/src/app/planted.tsx` as in T009.
- **DAC-E3-S2-1, DAC-E3-5 (AC-25):** `npx vitest run src/app/use-polled-read.test.ts` is green with the exact call counts of T003 and T005. Confirm by inspection that `use-polled-read.ts` contains no `setInterval` and that `startPolling` is the only place a timer is set.
- **DAC-E3-S2-2 (AC-24):** T004 is green, and the `last` assertions compare against literal instants.
- **DAC-E3-S2-3, DAC-E3-5 (AC-23):** `npx vitest run src/app/health.test.tsx` is green. The delivered `status-region.test.tsx`, `status-region.integration.test.tsx`, `status-region.a11y.test.tsx`, `shell.status-region.test.tsx` and `shell.unreachable.test.tsx` are green and unedited (T012's `git diff --exit-code`). `grep -n "setInterval" web/src/app/health.tsx` prints nothing.
- **Mutation:** `scripts/mutation-run.py` over `web/src/app/use-polled-read.ts` and `web/src/app/health.tsx`, together with the hand-written mutants in Other Notes, leaves no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **The scope of the layout rule against a delivered CAP-002 screen.**
   - **The conflict.** The epic's DAC-E3-16 says "no other file MUST write these values". The story's DAC-E3-S2-4 and TC-COMP-072 scan "over `web/src/`". But CAP-002's delivered `web/src/screens/research/stocks/index.tsx:221` and `:270` write `max-w-[1180px]`, and its delivered test `stock-evidence.test.tsx:379` asserts that class. CAP-002's approved designs fix that cap themselves: `component-design-classification-ui.md` l.1074 and CAP-002 `ux-design.md` l.153 and l.1271. The rule as literally worded fails on delivery.
   - **The governing artifact.** Capability AC-26 scopes the rule to "every surface this capability delivers or takes over". Capability §5 says CAP-002's Research screens are CAP-002's: "This capability gives them their place in the rail and otherwise leaves them alone (AC-27)".
   - **Corroborating artifacts.** The design layer agrees. CAP-003 `component-design-owner-web-app.md` §2.1 (l.114) limits CAP-003's only edit under `web/src/screens/research/` to "`SHELL_ROUTES` only" in `copy.ts`, and owner-shell §10 names "Home, Setup and Data health" as the 1180 px consumers.
   - **Why the literal wording is broader.** DAC-E3-16 traces to AC-26, and a derived criterion does not widen its parent's scope. The epic and story were also written against a tree with no research screens: backlog review v4 records "`web/src/screens/research/` is absent" and "None of the seven layout literals appears in `web/src`".
   - **The outcome.** CAP-002's research screens are outside the rule. They keep their own literal, unedited, and the rule holds everywhere else under `web/src/`. The concrete form of the exemption is Open Gap 1.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0321.**
   - **What is undetermined.** Resolved Conflict 1 settles that CAP-002's research screens are outside the layout rule, but no artifact says how the exemption is expressed. Possible forms are a directory, a file list, or an occurrence list.
   - **What the plan adopts (T001, T002).** `LAYOUT_RULE_EXEMPT = ["web/src/app/layout.ts", "web/src/screens/research/"]`: the module itself, plus the CAP-002 research directory as a prefix with a trailing slash. A guard case (T002) pins the delivered research occurrences to exactly the two `1180px` lines in `stocks/index.tsx`, so a new literal there still surfaces for a decision.
   - **Derivation.**
     - Capability §5 names the whole set of CAP-002 Research screens, not one file, as left alone.
     - `web/src/screens/research/` holds only CAP-002's delivered files.
     - CAP-003's one planned edit there, `SHELL_ROUTES` in `copy.ts` (owner-web-app §2.1), writes no layout value.
     - A directory prefix matches how E1-S1 words its scanned directories (DEC-0296).
     - The guard case keeps the exemption from going silent.
   - **Alternatives rejected.**
     - Editing CAP-002's screen to read `LAYOUT.contentMaxWidth`: this would change CAP-002's delivered test and contradict capability §5 and owner-web-app §2.1.
     - Exempting only `stocks/index.tsx`: this is narrower but needs a plan change for any future CAP-002 file.
     - Deferring the rule to an E7 story: no artifact assigns it there, and DAC-E3-S2-4 is this story's.
   - **Scope.** Contained in this plan's test file.
   - **Owning design to absorb it:** owner-shell §2.1 and §7 (and epic CAP-003-E3's DAC-E3-16 wording) at their next revision.
2. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0322.**
   - **What is undetermined.** Owner-shell §2.3 gives `ShellContextValue.refresh(kind: "health" | "attention" | "scores")`, but no artifact says how the shell context re-reads health. The delivered `HealthProvider` has no refresh, and owner-shell §2.4 and this story list none (register G10).
   - **What the plan adopts (T007, T011).**
     - `health.tsx` exports `useHealthRefresh(): () => void`.
     - Inside `HealthProvider` it returns the provider's refresh: one read at once that keeps the 30 s cadence from that read, and is ignored while a read is in flight, the same rules as `usePolledRead`'s `refresh`.
     - Outside a provider it returns a stable no-op. The fallback poll of `useHealth()` has no shell context above it to call refresh.
     - `useHealth()` keeps its delivered return type, `HealthState` plus `lastAnsweredAt`, with no function mixed in. `ShellContextValue.health` is a plain `HealthState`.
   - **Derivation.**
     - DAC-E3-18 (CAP-003-E3-S3) needs `refresh("health")`.
     - Owner-shell §2.3 defines refresh as "re-reads at once and keeps the cadence".
     - The provider owns the only health poller ("exactly one polling interval", delivered `status-region.tsx` comment).
     - A separate hook avoids changing `useHealth`'s delivered signature.
   - **Alternatives rejected.**
     - Putting `refresh` on `HealthState`: this would put a function into `ShellContextValue.health`.
     - Having CAP-003-E3-S3 edit `health.tsx`: that file is not in E3-S3's file list.
     - Making health a second `usePolledRead`: this drops the delivered `lastUpdated`-on-failure time and the fallback poll.
   - **Scope.** Propagating: CAP-003-E3-S3 consumes it.
   - **Owning design to absorb it:** owner-shell §2.3 and §2.4 at their next revision.

### Other Notes

- **The two health providers coexist.** This story copies, so `status-region.tsx` keeps its own `HealthProvider` and context, still mounted by `shell.tsx`. CAP-002's `web/src/screens/research/use-score-set-poll.ts` also imports `HealthState` and `useHealth` from `status-region`. The new `health.tsx` is unmounted until CAP-003-E3-S6 rewrites the shell. That story, or whoever deletes `status-region.tsx`, must repoint every importer, including the research hook, to `health.tsx`. The new `HealthState` is a superset (it adds `lastAnsweredAt`), so the repoint is type-compatible.
- **A read while hidden at mount.** Owner-shell §2.4 says the hook "reads on mount". `startPolling` reads once on mount even when the document is hidden, and schedules nothing until it is visible. DEC-0212's pause governs the interval, not the mount read.
- **Interval after a failure.** `intervalMs` receives the last successful `T`, or `null` before any success. The signature `(last: T | null)` admits no error value, so this follows from the signature and needs no decision.
- **Hand-written mutants** for the mutation run:
  - `web/src/app/use-polled-read.ts`: `document.removeEventListener("visibilitychange", onVisibility);` → *(deleted)*, killed by T003 (d).
  - `web/src/app/use-polled-read.ts`: `clearTimeout(timer);` (in `run`) → *(deleted)*, killed by T005 (c).
  - `web/src/app/health.tsx`: `lastAnsweredAt: previous.lastAnsweredAt` → `lastAnsweredAt: now`, killed by T006 (b).
  - `web/src/app/health.tsx`: `HEALTH_POLL_INTERVAL_MS = 30_000` → `30_001`, killed by T007's 29 999 / 30 000 ms boundary.
- **Equivalent mutant.** The `24` → `00` midnight mapping in `formatTimestamp` is moved byte for byte. Whether Node's ICU emits `"24"` under `hour12: false` and `en-CA` depends on the engine, so a mutant that drops the mapping may survive. If it does, record it as equivalent with the observed `formatToParts` output. Do not change the function.
- **Visibility in jsdom.** `document.visibilityState` is a read-only getter, so tests override it per T003's helper. The implementation reads `document.visibilityState` only (not `document.hidden`), and the helper sets both for robustness.
- **Validation for E1-S1's provisional interface.** T001 reuses E1-S1's `isScannedSource` and walker, as DEC-0296 fixes them. If the coordinator's decision renames them, rename the uses here. The rule's behaviour does not change.
