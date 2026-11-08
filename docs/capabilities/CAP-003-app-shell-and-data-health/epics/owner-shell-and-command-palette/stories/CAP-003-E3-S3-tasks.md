---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S3-tasks
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
  timestamp: 2026-11-07T06:08:44Z
  source_artifacts:
    - id: CAP-003-E3-S3
      version: "1"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-data-health-ui
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

# Tasks: CAP-003-E3-S3 — ShellProvider, useShell and the On-Demand useDataHealth Hook

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/app/`; design `owner-shell`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Creates the one React context every CAP-003 screen reads the shell's shared reads through, and the on-demand aggregate hook Data health uses. `web/src/app/shell-context.tsx` exports `ShellProvider` and `useShell(): ShellContextValue` with exactly the five members owner-shell §2.3 pins (`health`, `attention`, `scores`, `refresh(kind)`, `setTitleDetail(text)`; DAC-E3-18). `health` is CAP-003-E3-S2's `useHealth()` state, passed through with `credential_present` as the boolean it is (DAC-E3-S3-4, AC-4). `attention` and `scores` are two `usePolledRead` reads (CAP-003-E3-S2) of CAP-003-E3-S1's `fetchAttention` and `fetchScoreSummary`, both every 60 s and every 10 s while `latest_download.state` is `requested`, `running` or `cancelling` or the summary's `later.state` is `building`, with a summary `not_served` answer re-read every 60 s (owner-shell §2.4; epic NFR *Cadences*; DAC-E3-S3-1, DAC-E3-6). `refresh(kind)` re-reads one kind at once and keeps its cadence (DAC-E3-S3-2). `setTitleDetail` holds the screen-supplied crumb until it is set to `null` (DEC-0214; DAC-E3-S3-3), and `useTitleDetail()` is the read side CAP-003-E3-S4's titles need (Open Gap 1). `web/src/app/use-data-health.ts` exports `useDataHealth()`: one read of `GET /api/data-health` on mount, one per `retry()`, one when the context's attention answers show `latest_download` turning terminal, and never on a timer (DAC-E3-19, AC-28). Nothing is mounted: CAP-003-E3-S6 puts `ShellProvider` inside `HealthProvider` in `shell.tsx`. No delivered file is edited.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-25 | Every polled region shows its last-updated time: `attention` and `scores` carry the answer's `checkedAt`, `health` its `lastUpdated`, at the cadences this context records | T001, T005, T006, T009 |
| AC-28 | `GET /api/data-health` is read on demand only: never by the provider, never on a timer | T006, T007, T008, T010 |
| AC-8 | Home reads the summary through this context: `useShell().scores` is the one summary read | T005, T006, T009 |
| DAC-E3-6 | A summary `404` is `scores: not_served`, not an error; a failed attention or summary read keeps the last value in `error.last` | T005, T009 |
| DAC-E3-18 | The context exposes exactly `health`, `attention`, `scores`, `refresh(kind)` and `setTitleDetail` | T004, T006, T009 |
| DAC-E3-19 | `useDataHealth()` reads once on mount, on `retry()` and once when `latest_download` turns terminal, never on an interval, used by `data-health-ui` alone | T007, T008, T010, T011 |
| DAC-E3-S3-1 | 60 s idle; 10 s while the download is non-terminal (or scores build); back to 60 s after the next answer once terminal | T001, T009 |
| DAC-E3-S3-2 | `refresh("attention")` fires one read at once, reschedules from it, and never overlaps | T002, T009 |
| DAC-E3-S3-3 | `setTitleDetail(text)` is held until `setTitleDetail(null)`; the calling screen's unmount clears it | T003, T009 |
| DAC-E3-S3-4 | `credential_present` is passed as a boolean only; no value field exists on any context type | T004, T009 |

Mapped test cases (`tests/component/owner-shell-tests.md`; `tests/coverage-matrix.md` lines 151, 164, 173-176 and the per-story count "4 of 4" at line 405): **TC-COMP-073, TC-COMP-074, TC-COMP-075, TC-COMP-076** for the four story-level criteria, and **TC-COMP-059** (epic DAC-E3-6) and **TC-COMP-064** (epic DAC-E3-19, AC-28) for the two epic criteria the story carries that no story-level criterion refines (coverage-matrix note at line 447). TC-COMP-068 is CAP-003-E3-S1's (the `shell-types.ts` mirror); this story covers only the context-shape clause of DAC-E3-18 that S1's plan left to it, in T006. TC-COMP-069 and TC-COMP-070 are CAP-003-E3-S2's; TC-COMP-074 re-proves their refresh rule through the context.

## Phase 1: Setup

**Purpose**: None required. No package, configuration or directory is added: React 18, Vitest 2, `@testing-library/react` 16 and jsdom are delivered, and `web/src/app/` exists.

**Checkpoint**: CAP-003-E3-S1 (`web/src/app/shell-types.ts`, `web/src/app/shell-client.ts`) and CAP-003-E3-S2 (`web/src/app/use-polled-read.ts`, `web/src/app/health.tsx` with `useHealth`, `useHealthRefresh` and `HealthState.lastAnsweredAt`) are in the working tree before Phase 2 starts. Both are hard graph edges.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the cadences, the refresh rule, the crumb, the context's shape and the on-demand aggregate.

**Shared harness for `web/src/app/shell-context.test.tsx` (written with T001, reused by T002–T006).**

- **Fake API.** One `vi.stubGlobal("fetch", vi.fn(router))` that overrides `test-setup.ts`'s default. `router(input)` takes `new URL(String(input), "http://localhost").pathname`, increments a per-path counter, and answers from a per-path queue, falling back to that path's standing answer when the queue is empty.
- **Helpers.**
  - `answer(path, status, body)` queues one answer.
  - `standing(path, status, body)` sets the fallback.
  - `defer(path)` queues a promise the test resolves or rejects later, for in-flight and ordering cases.
  - `calls(path)` reads the counter.
- **Paths.** `/api/health`, `/api/attention`, `/api/classifications/summary` and `/api/data-health`. Requests go through the real `fetchHealth`, `requestJson` and CAP-003-E3-S1's `fetchAttention` and `fetchScoreSummary`, so the `404` mapping is exercised end to end.
- **Fixtures.** Every fixture is an independent literal typed by S1's `Attention`, `ScoreSummary` and `DataHealth`, never produced by the code under test.
  - `HEALTH`: `credential_present: true`, `most_recent_run: null`.
  - `ATTENTION_IDLE`: `latest_download` `{ state: "succeeded", … }`, `problems.stock_count: 3`.
  - `attentionWith(state: RunState)`: `ATTENTION_IDLE` with `latest_download.state` replaced.
  - `SUMMARY_SET`: `later: null`.
  - `SUMMARY_BUILDING`: `later.state: "building"`.
  - `SUMMARY_LATER_FAILED`: `later.state: "failed"`.
  - `NOT_FOUND_ENVELOPE`: `{"error":{"code":"not_found","message":"No resource exists at this path.","request_id":"req-404"}}`, the shape `app.py:338-347` serves.
  - `INTERNAL_ENVELOPE`: `{"error":{"code":"internal_error","message":"x","request_id":"req-500"}}`.
- **Render.** `<HealthProvider><ShellProvider><Probe /></ShellProvider></HealthProvider>`. `Probe` assigns `useShell()` to a module-level `latest` and renders `useTitleDetail()` into `data-testid="title-detail"` (`"null"` when null).
- **Timers and visibility.** `vi.useFakeTimers()` with no `shouldAdvanceTime`, `vi.setSystemTime(new Date("2026-09-06T18:30:00.000Z"))`, and `await act(() => vi.advanceTimersByTimeAsync(n))` to flush, as CAP-003-E3-S2's T003 does. The `setVisibility("hidden" | "visible")` helper is the one S2's T003 defines (override `document.visibilityState` and `document.hidden`, then dispatch `visibilitychange`), copied locally; it is restored in `afterEach`.
- **Read order.** Where a case depends on which read answers first, it uses `defer` and resolves attention, flushes, then resolves the summary. No assertion relies on two same-tick reads settling in a particular order.

### Mandatory Component Tests

- [ ] T001 [P] Implement TC-COMP-073 (Attention and summary cadence: 60 s idle, 10 s while a download runs) in a new `web/src/app/shell-context.test.tsx`, with a `// Implements TC-COMP-073` comment, using the shared harness. Cases:
  - (a) **Idle.** Answers are `ATTENTION_IDLE` and `SUMMARY_SET`. After the mount flush, each path has 1 call. After 59 999 ms, still 1 each. After 1 ms more, 2 each. After another 60 000 ms, 3 each.
  - (b) **Running.** `it.each(["requested", "running", "cancelling"])`. Attention answers `attentionWith(state)` first and the summary `SUMMARY_SET` second, sequenced with `defer`. The next attention read comes at exactly 10 000 ms (9 999 ms: 1 call; 10 000 ms: 2). The summary's next read also comes at 10 000 ms, because the joint condition holds (owner-shell §2.4). Further `running` answers keep both reads at 10 s spacing (20 000 and 30 000 ms).
  - (c) **Back to 60 s after the next answer.** Continuing (b) with `running`, the attention read at 30 000 ms answers `attentionWith(terminal)`, using `it.each(["succeeded", "partial", "failed", "cancelled", "abandoned"])`. The following attention read comes at 90 000 ms, not 40 000 ms. After the summary's next answer, the summary is also back on 60 s spacing.
  - (d) **TC edge case: scores building.** Attention answers `ATTENTION_IDLE` and the summary answers `SUMMARY_BUILDING` first (sequenced). Both next reads come at 10 000 ms. With `SUMMARY_LATER_FAILED` instead, both come at 60 000 ms.
  - (e) **A not-served summary stays on 60 s while a download runs.** Attention answers `attentionWith("running")` and the summary answers `404` `NOT_FOUND_ENVELOPE`. Attention reads at 10 000 ms. The summary's second call comes at exactly 60 000 ms (59 999 ms: 1), so it is re-read and on the 60 s cadence (Resolved Conflict 3).

  Kills:
  - swap-case on a member of the non-terminal set (`"cancelling"` to `"cancelled"`): the (b)/(c) `it.each` rows flip.
  - negate-boolean on the joint condition's `||` to `&&`: (b) gives 60 s for both, and (d) gives 60 s for attention.
  - swap-case on `"building"` to `"failed"`: (d) both rows flip.
  - off-by-one on `10_000` and `60_000`: the 9 999 / 59 999 ms boundaries.
  - negate-boolean on the not-served branch of the summary's interval: (e) re-reads at 10 000 ms.

  The joint condition is observed on the read that does not carry it (the summary in (b), attention in (d)). That property differs under the mutants, so the assertion is not on the carrying read alone.
- [ ] T002 [P] Implement TC-COMP-074 (refresh("attention") reads at once and reschedules without overlap) in `web/src/app/shell-context.test.tsx`, with a `// Implements TC-COMP-074` comment, idle fixtures, sequential with T001 (one file). Cases:
  - (a) At +20 000 ms, `act(() => latest.refresh("attention"))` makes the attention calls 2 at once, while the summary stays at 1 and health at 1. At the old +60 000 ms mark, attention is still 2. At +80 000 ms it is 3, rescheduled from the refresh.
  - (b) **TC edge case.** Make the next attention read a `defer`red answer that stays pending and start it with `refresh("attention")`. A second `refresh("attention")` keeps attention at the same count. Resolve it, and the next read comes 60 000 ms after the resolution.
  - (c) `refresh("scores")` at +20 000 ms makes the summary calls 2 and leaves attention at 1.
  - (d) `refresh("health")` at +10 000 ms makes the `/api/health` calls 2. The next health read is at +40 000 ms (CAP-003-E3-S2's `useHealthRefresh`, DEC-0322).
  - (e) `latest.refresh` keeps the same identity across three answers (`toBe`).

  Kills:
  - swap-case on the `refresh` kind dispatch (`"attention"` routed to the summary's refresh, or `"health"` routed to attention's): (a), (c) and (d) count per path.
  - a hand-written mutant that drops the `useCallback` on `refresh`: (e).
- [ ] T003 [P] Implement TC-COMP-075 (setTitleDetail holds the detail until cleared or unmount) in `web/src/app/shell-context.test.tsx`, with a `// Implements TC-COMP-075` comment. Add a test `DetailScreen` that does what DEC-0214 and DAC-E7-S5-1 (CAP-003-E7-S5's download detail) have screens do: `useEffect(() => { setTitleDetail("Download 2026-10-15 09:30 CDT"); return () => setTitleDetail(null); }, [setTitleDetail])`, and counts its effect runs. Cases:
  - (a) Before `DetailScreen` mounts, `title-detail` is `"null"`. Once mounted, it reads exactly *Download 2026-10-15 09:30 CDT*.
  - (b) Advance 180 000 ms (three attention and summary answers). The text is unchanged and the effect ran once, so `setTitleDetail` is stable and a poll never clears the crumb.
  - (c) `rerender` without `DetailScreen` (the screen unmounts) makes `title-detail` `"null"`.
  - (d) Called directly via `act(() => latest.setTitleDetail("X"))` then `latest.setTitleDetail(null)`, the value goes `"X"` then `"null"`.

  Kills:
  - a hand-written mutant `setDetail(text ?? previous)`, which ignores `null`: (c) and (d).
  - drop-field-copy on the provided detail value: (a).
  - a hand-written mutant that builds `setTitleDetail` inline without `useCallback`: (b), where the effect count rises above 1.
- [ ] T004 [P] Implement TC-COMP-076 (Shell context exposes credential_present as a boolean only) in `web/src/app/shell-context.test.tsx`, with a `// Implements TC-COMP-076` comment.
  - **Type level, enforced by `npx tsc --noEmit`, which type-checks test files.**
    - Declare a local `DeepKeys<T>`. It is `never` for functions and `Date`, recurses into array elements, and otherwise gives `K | DeepKeys<T[K]>` over string keys.
    - Assert `expectTypeOf<Extract<DeepKeys<ShellContextValue>, `${string}${"credential" | "secret" | "token" | "password" | "key" | "Key"}${string}`>>().toEqualTypeOf<"credential_present">()`.
    - Assert `expectTypeOf<NonNullable<ShellContextValue["health"]["health"]>["credential_present"]>().toEqualTypeOf<boolean>()`.
  - **Runtime.** Run once with `HEALTH` (`credential_present: true`) and once with `false`. After the first answer, `typeof latest.health.health?.credential_present` is `"boolean"` and equals the fixture's value (`toBe`). `JSON.stringify(latest)` contains no `"credential"` key other than `"credential_present"` (regex `/"credential(?!_present")/`).

  Kills:
  - a hand-written mutant that adds `credential?: string | null` to `ShellContextValue`, observed by `tsc` failing on the `toEqualTypeOf` line.
  - a mutant that coerces the field (`credential_present: String(x)`), observed by the runtime `typeof`.
- [ ] T005 [P] Implement TC-COMP-059 (Summary 404 is not_served; other errors keep last value) in `web/src/app/shell-context.test.tsx`, with a `// Implements TC-COMP-059` comment. This is the context half: `useShell().scores` and `attention` states. The render half is the consumers' (Resolved Conflict 1). Cases:
  - (a) The summary answers `404` `NOT_FOUND_ENVELOPE`: `latest.scores` `toEqual({ kind: "not_served" })` exactly, with no `error` and no `checkedAt` key. A summary `500` `INTERNAL_ENVELOPE` gives `kind` `"error"`.
  - (b) **Served, then failure.** `SUMMARY_SET` at 18:30:00Z, then `500` at +60 s. `scores` `toEqual({ kind: "error", error: expect.any(ApiError), last: SUMMARY_SET })`, with `error.code` `"internal_error"` and `last` the literal, not `{ data, checkedAt }`. This is `ScoreState`'s own `last: ScoreSummary | null` (owner-shell §2.3).
  - (c) **Not-served, then failure.** `404` then `500`: `last` is `null`, because a not-served answer is not a `ScoreSummary` (Other Notes, the `ScoreState` mapping). A first-read `500` also gives `last: null`.
  - (d) **Recovery.** After (b), `SUMMARY_BUILDING` gives `{ kind: "served", data: SUMMARY_BUILDING, checkedAt: <that instant> }`, so the value is replaced.
  - (e) **Attention fails after a success.** `ATTENTION_IDLE` at 18:30:00Z, then `500` at +60 s. `latest.attention` `toEqual({ kind: "error", error: expect.any(ApiError), last: { data: ATTENTION_IDLE, checkedAt: new Date("2026-09-06T18:30:00.000Z") } })`. A thrown `fetch` (`new TypeError`) on the next read gives an `ApiUnreachableError` with the same `last`.

  Kills:
  - swap-case on the mapped `"not_served"` to `"error"`: (a).
  - drop-field-copy on `last` in the error branch (`last.data` to `null`): (b).
  - negate-boolean on the not-served discriminator (`"kind" in data` to `!("kind" in data)`): (a) maps to `served` and (c) keeps `{ kind: "not_served" }` as `last`.
  - swap-case on `"served"` to `"ok"`: (d).

### Additional Unit Tests

- [ ] T006 [P] Write the context-shape, freshness, pause and on-demand cases in `web/src/app/shell-context.test.tsx` (DAC-E3-18, AC-25, AC-28, AC-8; owner-shell §7 *Cadences* row and DEC-0212). Cases:
  - (a) `Object.keys(latest).sort()` `toEqual(["attention", "health", "refresh", "scores", "setTitleDetail"])`, and `expectTypeOf<keyof ShellContextValue>().toEqualTypeOf<"health" | "attention" | "scores" | "refresh" | "setTitleDetail">()`.
  - (b) After the mount answers at 18:30:00Z:
    - `latest.attention` `toEqual({ kind: "ok", data: ATTENTION_IDLE, checkedAt: new Date("2026-09-06T18:30:00.000Z") })`.
    - `latest.scores` `toEqual({ kind: "served", data: SUMMARY_SET, checkedAt: <same> })`.
    - `latest.health.liveness` is `"answering"` and `latest.health.lastAnsweredAt` equals the same instant.
    - After the 60 s answers, both `checkedAt` values are 18:31:00Z (AC-25).
  - (c) **Paused while hidden.** `setVisibility("hidden")` and advance 600 000 ms: attention, summary and health counts are unchanged. `setVisibility("visible")` and flush 0 ms: each path gains exactly one call.
  - (d) **AC-28.** Over 600 000 ms of idle polling, and through a running-to-terminal transition, `calls("/api/data-health")` stays 0. The provider never reads the aggregate.
  - (e) **Unmount.** After `unmount()`, advancing 600 000 ms adds no call on any path.
  - (f) **No provider.** `renderHook(() => useShell())` with no provider throws an `Error` whose message is exactly `useShell() must be called inside <ShellProvider>` (DEC-0326). `renderHook(() => useTitleDetail())` with no provider returns `null`.

  Kills:
  - drop-field-copy on `checkedAt` in the served mapping: (b) asserts the instant.
  - a hand-written mutant that calls `fetchDataHealth` in the provider: (d).
  - negate-boolean on the provider-missing guard: (f).
- [ ] T007 [P] Implement TC-COMP-064 (useDataHealth reads on mount, retry and terminal transition only) in a new `web/src/app/use-data-health.test.tsx`, with a `// Implements TC-COMP-064` comment.
  - **Harness.** Reuse the shared harness by copying its helpers into this file; test files share no module. Render `<HealthProvider><ShellProvider><DataHealthProbe /></ShellProvider></HealthProvider>`, where `DataHealthProbe` assigns `useDataHealth()` to `latestDH`. Add a `DATA_HEALTH` literal typed `DataHealth`, with `checks.daily_prices` and `checks.company_financials` `null`, `never_acquired: true`, and `problems: { rows: [], next_cursor: null }`.
  - **Steps (the TC's).**
    1. Mount: `calls("/api/data-health")` is 1, and `latestDH.state` `toEqual({ kind: "ok", data: DATA_HEALTH, checkedAt: new Date("2026-09-06T18:30:00.000Z") })`.
    2. `act(() => latestDH.retry())`: 2.
    3. Advance 600 000 ms with attention standing at `ATTENTION_IDLE`: 10 attention answers, all terminal-to-terminal, and still 2.
    4. Attention answers `attentionWith("running")`, then `attentionWith("succeeded")` 10 s later: exactly 3. Three further `succeeded` answers: still 3.
  - **Grep step ("used by `data-health-ui` alone").** A static case uses `node:fs` and `node:path`, resolved from `import.meta.url` as `shell.tokens.test.tsx` does.
    - It walks `web/src` recursively over `.ts` and `.tsx` files that are not `*.test.ts(x)`.
    - It collects every file whose source matches `/from\s+["'][^"']*use-data-health["']/`.
    - It asserts that every match starts with `web/src/screens/data-health/`. Today there are none, which is allowed.
    - Non-vacuity: the walk visits more than 50 files and includes `web/src/app/use-data-health.ts` itself.
    - The match rule is a pure helper defined in the test file, `illegalImporters(files: { path: string; source: string }[])`, which the walk feeds. It is fed one planted literal record, `web/src/screens/home/index.tsx` importing `"../../app/use-data-health"`, and returns exactly that path. It returns `[]` for `web/src/screens/data-health/index.tsx`.

  Kills:
  - negate-boolean on either side of the transition test (`wasActive && isTerminal`: dropping `wasActive` reads on every terminal answer in step 3; dropping `isTerminal` reads on `running`).
  - a hand-written mutant that adds a `setTimeout` or `setInterval` re-read: step 3.
  - swap-case on the allowed directory in the grep helper (`screens/data-health/` to `screens/`): the planted `home` record passes.
- [ ] T008 [P] Write the `useDataHealth` state, ordering and edge cases in `web/src/app/use-data-health.test.tsx` (DAC-E3-19, AC-28; Open Gaps 2 and 3). This runs sequentially with T007 (one file). Cases:
  - (a) **Transition set.** `it.each` over the three non-terminal states as "before" and the five terminal states as "after": exactly one aggregate read per pair. `cancelling` to `cancelled` reads, and `cancelling` to `running` does not. `null` to `succeeded` (no download before) does not read, nor does `succeeded` to `succeeded`.
  - (b) **Across a failed attention read.** `running`, then attention `500`, then `succeeded`: one read. The comparison is between consecutive successful answers.
  - (c) **First answer already terminal.** The mount read is the only read (TC-COMP-064 step 3 already covers terminal-to-terminal).
  - (d) **Hook mounted after the provider has answered.** The provider renders first and attention answers `running`, then `DataHealthProbe` mounts (1 read). `succeeded` then gives exactly 2.
  - (e) **Error.** A first aggregate `500` gives `{ kind: "error", error: <ApiError code "internal_error">, last: null }`. After a successful `retry()` and then another `500` `retry()`, `last` is `{ data: DATA_HEALTH, checkedAt: <instant of the success> }` (`ReadState` semantics, owner-shell §2.3).
  - (f) **No overlap.** The mount read is `defer`red and pending. Two `retry()` calls leave the count at 1. Resolving the mount read makes exactly one trailing read start (count 2), and its answer is the state shown. A third `retry()` while nothing is in flight reads at once (3).
  - (g) **Unmount.** Unmounting with a read in flight, then resolving it and turning attention terminal, adds no read and logs no React state-update warning (`console.error` spy stays uncalled).
  - (h) **Shape.** `Object.keys(latestDH).sort()` `toEqual(["retry", "state"])`; `latestDH.retry` is stable across answers (`toBe`); and `expectTypeOf(useDataHealth).returns.toEqualTypeOf<{ state: ReadState<DataHealth>; retry(): void }>()`.

  Kills:
  - swap-case on a terminal-set member (`"abandoned"` dropped, or `"cancelling"` treated as terminal): the (a) rows.
  - drop-field-copy on the "previous" ref update (the ref never advances): (a) `succeeded` to `succeeded` reads.
  - negate-boolean on the in-flight guard: (f) shows 3 calls before the resolution.
  - a hand-written mutant that drops the trailing-read flag: (f) count stays 1.
  - negate-boolean on the unmounted guard: (g).

**Checkpoint**: T001–T008 exist and fail for the right reason: `shell-context.tsx` and `use-data-health.ts` are missing, so the imports fail. Every delivered test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The provider and the on-demand hook, each in its own TDD cycle.

- [ ] T009 Create `web/src/app/shell-context.tsx` (depends on T001–T006 being RED).
  - **Imports:**
    - `createContext`, `useCallback`, `useContext`, `useMemo`, `useRef`, `useState` and `type ReactNode` from `"react"`;
    - `fetchAttention` and `fetchScoreSummary` from `"./shell-client"`;
    - `type { Attention, ScoreState, ScoreSummary }` from `"./shell-types"`;
    - `usePolledRead` from `"./use-polled-read"`;
    - `useHealth`, `useHealthRefresh` and `type HealthState` from `"./health"`;
    - `type { RunState }` from `"../api/types"`.
  - **Exports:**
    - `interface ShellContextValue`, verbatim from owner-shell §2.3, with its comments: `health: HealthState`, `attention: ReadState<Attention>`, `scores: ScoreState`, `refresh(kind: "health" | "attention" | "scores"): void` and `setTitleDetail(text: string | null): void`;
    - `ShellProvider({ children })`;
    - `useShell()`;
    - `useTitleDetail(): string | null`.
  - **Cadence constants.** Module-private `IDLE_INTERVAL_MS = 60_000` and `ACTIVE_INTERVAL_MS = 10_000`, commented with owner-shell §2.4, epic NFR *Cadences* and system design constraint 8. Also a private `NON_TERMINAL: ReadonlySet<RunState> = new Set(["requested", "running", "cancelling"])`.
  - **Cross-read wiring.**
    - Two refs, `attentionLast` and `scoresLast`, hold each read's last successful answer, or `null`.
    - The `read` functions passed to `usePolledRead` are `async () => { const a = await fetchAttention(); attentionLast.current = a; return a; }` and the same for `fetchScoreSummary` into `scoresLast`. A rejection never reaches the assignment, so the refs hold the last success.
    - Each ref is set before `usePolledRead`'s settle computes the next delay, so neither interval depends on React render timing (Other Notes, *Cross-read cadence*).
  - **The joint condition.** `active(a: Attention | null, s: ScoreSummary | { kind: "not_served" } | null)` is true when `NON_TERMINAL.has(a?.latest_download?.state)` or when `s` is a summary (not `"kind" in s`) with `s.later?.state === "building"`.
  - **The two intervals.**
    - Attention: `(last) => (active(last, scoresLast.current) ? ACTIVE_INTERVAL_MS : IDLE_INTERVAL_MS)`.
    - Summary: `(last) => (last !== null && "kind" in last ? IDLE_INTERVAL_MS : active(attentionLast.current, last) ? ACTIVE_INTERVAL_MS : IDLE_INTERVAL_MS)`. A not-served summary is re-read on the 60 s cadence (Resolved Conflict 3).
  - **The `scores` mapping (`useMemo`).** From `ReadState<ScoreSummary | { kind: "not_served" }>` to `ScoreState`:
    - `loading` stays `{ kind: "loading" }`;
    - `ok` with a not-served value becomes `{ kind: "not_served" }`;
    - `ok` with a summary becomes `{ kind: "served", data, checkedAt }`;
    - `error` becomes `{ kind: "error", error, last }`, where `last` is `state.last.data` when that is a summary, else `null`.
  - **`health` and `refresh`.**
    - `health` is `useHealth()`, passed through unmapped, so `credential_present` stays the delivered boolean (AC-4; owner-shell §4).
    - `refresh` is a `useCallback` switch: `"attention"` calls the attention read's `refresh`, `"scores"` the summary's, and `"health"` calls `useHealthRefresh()`'s function.
  - **The title detail.** It is `useState<string | null>(null)`. `setTitleDetail` is a `useCallback((text) => setDetail(text), [])`. The value is provided through a second, private context, `TitleDetailContext` (default `null`), which `useTitleDetail()` reads (DEC-0323). It is not added to `ShellContextValue`, so DAC-E3-18's five members stay exact.
  - **The context value.** It is `useMemo`'d over `health`, `attention`, `scores`, `refresh` and `setTitleDetail`.
  - **`useShell()`.** It reads a private `ShellContext` created with a `null` default, and throws `new Error("useShell() must be called inside <ShellProvider>")` when no provider is above it (DEC-0326).
  - **Comments.** Comment each rule with its AC, DAC and TC, in the style of `status-region.tsx`. Write no layout value in any comment (CAP-003-E3-S2's layout rule scans non-test sources), no browser storage, and no `dangerouslySetInnerHTML`.

  This makes T001–T006 pass.
- [ ] T010 Create `web/src/app/use-data-health.ts` (depends on T009; T007 and T008 are RED first). Export `useDataHealth(): { state: ReadState<DataHealth>; retry(): void }` (DEC-0324). Its module doc comment cites DAC-E3-19, AC-28, system design §3.4 note 1 and DEC-0219 as withdrawn ("used by `data-health-ui` alone"). It imports `fetchDataHealth` from `"./shell-client"`, `useShell` from `"./shell-context"`, `type { DataHealth, ReadState }` from `"./shell-types"`, `type { RunState }` from `"../api/types"`, and `ApiError` and `ApiUnreachableError` from `"../api/client"`.
  - **State.** It is `useState<ReadState<DataHealth>>({ kind: "loading" })`. On success it is `{ kind: "ok", data, checkedAt: new Date() }`. On failure it is `{ kind: "error", error, last }`, where `last` is `{ data, checkedAt }` from a previous `ok`, the previous `last` from a previous `error`, and `null` otherwise. These are the same rules as CAP-003-E3-S2's `usePolledRead`, written out here because that hook is interval-driven.
  - **Rejections.** A rejection that is not `ApiError` or `ApiUnreachableError` is rethrown, as S2 does.
  - **One read at a time (DEC-0325).**
    - `inFlight`, `pending` and `mounted` are refs.
    - `run()` sets `pending = true` and returns when `inFlight`. Otherwise it sets `inFlight` and calls `fetchDataHealth()`.
    - On settle, if `mounted`, it sets the state. It then clears `inFlight`. If `pending` was set during the read, it clears `pending` and calls `run()` once more.
    - `retry` is a stable `useCallback(run)` through a ref.
  - **Mount.** One `useEffect(() => { mounted.current = true; run(); return () => { mounted.current = false; }; }, [])`.
  - **Terminal transition.**
    - It reads `const { attention } = useShell()`.
    - A ref `previousDownloadState: RunState | null | undefined` starts `undefined`, meaning nothing has been seen yet.
    - A `useEffect` on `[attention]` acts only when `attention.kind === "ok"`. It takes `current = attention.data.latest_download?.state ?? null`, reads `previous` from the ref, and stores `current` in the ref. It calls `run()` when `previous` is a non-terminal state (`requested`, `running` or `cancelling`) and `current` is one of `succeeded`, `partial`, `failed`, `cancelled` or `abandoned`.
    - Error states never touch the ref, so the comparison is between consecutive successful answers.
  - **No timer.** It sets no timer and adds no `visibilitychange` listener.
  - **Comments.** Comment each rule with its DAC and TC.

  This makes T007 and T008 pass.

**Checkpoint**: `npm run test` is green, including every delivered test and CAP-003-E3-S1's and CAP-003-E3-S2's suites, all unchanged. `npx tsc --noEmit` is clean, including T004's and T008's type assertions.

---

## Phase 4: Integration

**Purpose**: Confirm the change set is exactly the story's, with nothing mounted early.

- [ ] T011 Confirm scope (depends on T009 and T010).
  - `git status --short` lists only these:
    - `web/src/app/shell-context.tsx`, `web/src/app/shell-context.test.tsx`, `web/src/app/use-data-health.ts` and `web/src/app/use-data-health.test.tsx`;
    - this story's `-tasks.md`, its `-tdd-evidence.yaml` and its status line.
  - `git diff --exit-code -- web/src/app/shell.tsx web/src/app/routes.tsx web/src/app/status-region.tsx web/src/app/shell-client.ts web/src/app/shell-types.ts web/src/app/use-polled-read.ts web/src/app/health.tsx web/src/api/ web/src/screens/ web/src/main.tsx` exits 0.
  - `grep -rlE "from \"\./(shell-context|use-data-health)\"|app/(shell-context|use-data-health)\"" web/src --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` prints only `web/src/app/use-data-health.ts`, which imports `useShell`.
  - Nothing mounts `ShellProvider` yet. CAP-003-E3-S6 mounts it, and CAP-003-E3-S4, CAP-003-E3-S7 and the E4 to E6 screens consume it.

**Checkpoint**: The four files plus the plan artifacts are the whole diff. Delivered behaviour is unchanged.

---

## Phase 5: Polish

**Purpose**: Validation, formatting and the TDD evidence.

- [ ] T012 Run `npm run format` (a check). Fix any report with `npx biome format --write` on this story's four files only. Then run `npm run lint`, `npx tsc --noEmit`, `npm run build` and `npm run test`, and re-run T011's checks. Biome's recommended `useExhaustiveDependencies` may flag the ref-held `run` in T010. Satisfy it by holding `run` in a ref read inside the effect, not by suppressing the rule. No behaviour change.
- [ ] T013 After each TDD cycle in T001–T012 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E3-S3-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence;
    - the structured `mutation:` block `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  - (1) T001–T006 + T009: the provider.
  - (2) T007 + T008 + T010: the aggregate hook.

  T011 and T012 add no behaviour and join cycle 2's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S4 | reverse | `titles.ts` reads the detail crumb through `useTitleDetail()` (DEC-0323). Graph: E3-S4 depends on E3-S3 |
| CAP-003-E3-S6 | reverse | `shell.tsx` mounts `ShellProvider` inside `HealthProvider`, and the count chips read `useShell().attention` and `scores`. Graph: E3-S6 depends on E3-S3 |
| CAP-003-E3-S7 | reverse | `download-toast.ts` watches `useShell().attention`. Graph: E3-S7 depends on E3-S3 |
| CAP-003-E6-S5 | context | `DataHealthScreen` calls `useDataHealth()` and `retry()` after **Stop following** (its story l.51, l.92). It reaches E3-S3 through E6-S1 and E6-S2 in the graph. Cited for the hook's shape (DEC-0324) |
| CAP-003-E1-S1 | context | Its `token-literals.test.ts` literal scan reads this story's two non-test sources, as CAP-003-E3-S2's layout rule does. This plan writes no `px` length in them and imports nothing from E1-S1 |
| CAP-003-E7-S5 | context | The download detail calls `useShell().setTitleDetail(...)` and `null` on unmount (DAC-E7-S5-1). That is the screen-side contract T003's `DetailScreen` imitates. It reaches E3-S3 through E3-S4 |

No new hard edge was found. The story imports only CAP-003-E3-S1's `shell-client.ts`/`shell-types.ts`, CAP-003-E3-S2's `use-polled-read.ts`/`health.tsx`, and delivered `web/src/api/client.ts`/`types.ts`. Both are graph edges already: `CAP-003-E3-S3: [CAP-003-E3-S1, CAP-003-E3-S2]`.

### Task Dependencies

- T001–T006 share `shell-context.test.tsx` and run in sequence. T001 writes the harness first.
- T007 and T008 share `use-data-health.test.tsx` and run in sequence. They can run in parallel with T001–T006.
- T009 depends on T001–T006 being RED.
- T010 depends on T009 (it calls `useShell`), with T007 and T008 RED first.
- T011 depends on T009 and T010.
- T012 depends on T011.
- T013 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- Phase 2: the two test files can be written in parallel.
- Phase 3: sequential, because `use-data-health.ts` imports `useShell`.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not run: this story mounts nothing and changes no rendered surface or e2e spec.

### Story-Specific Validation

- **DAC-E3-S3-1, DAC-E3-S3-2 and AC-25:** `npx vitest run src/app/shell-context.test.tsx` is green with T001's and T002's exact boundaries. Confirm by inspection that `shell-context.tsx` contains no `setTimeout`, `setInterval` or `visibilitychange`: all scheduling is CAP-003-E3-S2's.
- **DAC-E3-6:** T005 is green, and its assertions compare against literal fixtures, not values derived from the code.
- **DAC-E3-S3-3:** T003 is green.
- **DAC-E3-S3-4 and DAC-E3-18:** `npx tsc --noEmit` is clean with T004's and T006's `toEqualTypeOf` lines present. `grep -c "toMatchTypeOf" web/src/app/shell-context.test.tsx web/src/app/use-data-health.test.tsx` prints `0` for both.
- **DAC-E3-19 and AC-28:**
  - `npx vitest run src/app/use-data-health.test.tsx` is green.
  - `grep -nE "setTimeout|setInterval|visibilitychange" web/src/app/use-data-health.ts` prints nothing.
  - `grep -rn "fetchDataHealth" web/src --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` prints only `shell-client.ts`'s definition and `use-data-health.ts`'s import and call.
- **Mutation:** run `python3 scripts/mutation-run.py run` with `--command "npx vitest run web/src/app/shell-context.test.tsx web/src/app/use-data-health.test.tsx && npx tsc --noEmit"` over `web/src/app/shell-context.tsx` and `web/src/app/use-data-health.ts`, plus the hand-written mutants in Other Notes. It leaves no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **TC-COMP-059's render expectations against this story's DAC-E3-6.**
   - **The conflict.** TC-COMP-059 (component owner-shell) expects "score figures render not determinable" and "the score regions' error state with **Try again**". The story restates DAC-E3-6 as the context's states only. The epic's fuller DAC-E3-6 gives the rendering to "the score regions".
   - **Governing: the story's DAC-E3-6 (story criteria outrank test specifications) and owner-shell §2.3.** The context provides `{ kind: "not_served" }` and `{ kind: "error", … }`. The consumers draw the figures: data-health-ui §2.4's *Factor scores* row (`coverage-unknown` *Not determinable* while not served), and home-ui's tile through `useShell().scores`.
   - **Outcome.** T005 asserts the context half. The render half belongs to those screens' stories, which already hard-depend on E3-S3.
2. **TC-COMP-073's "(DEC-0212)" citation on the scores-building edge case.** DEC-0212 is the health poll's hidden-page pause, not the building cadence. **Governing: epic NFR *Cadences* and owner-shell §2.4.** These set 10 s for both reads while `later.state` is `building` (register C4). T001 (d) tests it under that citation.
3. **"The same as attention" against "re-read on the 60 s cadence" for a not-served summary.**
   - **The conflict.** Owner-shell §2.4's summary row says both. Epic NFR *Cadences* and this story's Description say "a summary `404` … re-read on the 60 s cadence".
   - **Governing: the specific clause over the general one in the same normative row, as the epic NFR confirms.** While the last summary answer is not served, its interval is 60 000 ms whatever the download is doing.
   - **Why this reading.** A not-served route has no `later` to build, and a download does not deploy it.
   - **What the alternative changes.** None of the joint condition's other uses. T001 (e) pins it.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0323.**
   - **What is undetermined.** Owner-shell §2.3 pins the setter, `setTitleDetail(text)`, and DEC-0214 says the top-bar crumb reads its text. But `ShellContextValue` has no member that exposes the held text, and no artifact says how `titles.ts` (CAP-003-E3-S4, "`setTitleDetail` the titles table reads") or the top bar (CAP-003-E3-S6) reads it.
   - **What the plan adopts (T003, T009).** `shell-context.tsx` also exports `useTitleDetail(): string | null`. It reads a second, private context that `ShellProvider` provides, and returns `null` outside a provider. `ShellContextValue` keeps exactly the five members DAC-E3-18 and TC-COMP-076 inspect.
   - **Derivation.**
     - Constraint 9a prefers an additive change to a pinned interface. A separate hook adds without altering §2.3's interface.
     - A separate context keeps a crumb change from re-rendering every `useShell()` consumer.
     - The `null` default matches the generic-noun fallback, "until set" (DEC-0214).
   - **Alternatives rejected.**
     - A sixth `titleDetail` member on `ShellContextValue`: this alters the pinned interface and DAC-E3-18's member list.
     - Titles reading the route's own data: DEC-0214 rejects shell reads for titles.
   - **Scope.** Propagating: CAP-003-E3-S4 and CAP-003-E3-S6 consume it.
   - **Owning design to absorb it:** owner-shell §2.3 at its next revision.
2. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0324.**
   - **What is undetermined.** DAC-E3-19 and owner-shell §2.3 name `useDataHealth()` and its `retry()`. No artifact gives the hook's return type.
   - **What the plan adopts (T008 (h), T010).** `useDataHealth(): { state: ReadState<DataHealth>; retry(): void }`.
   - **Derivation.**
     - Ladder step 5, local precedent: CAP-003-E3-S2's pinned `usePolledRead` returns `{ state: ReadState<T>; refresh(): void }`.
     - `ReadState` is owner-shell §2.3's fetch-state type for a shell read. Its `error.last` gives data-health-ui's per-card error the stale value, as for the polled reads.
     - The method is named `retry` because DAC-E3-19 names it.
   - **Alternatives rejected.**
     - Returning `DataHealth | null` plus separate flags: this re-models the shell's fetch state.
     - Naming the method `refresh`: this contradicts DAC-E3-19's wording.
   - **Scope.** Propagating: CAP-003-E6-S5 (and the E6 regions it passes the aggregate to) consumes it.
   - **Owning design to absorb it:** owner-shell §2.3 and data-health-ui §2.2 at their next revision.
3. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0325.**
   - **What is undetermined.** DAC-E3-19 gives one read per trigger, and the epic NFR says "two reads of one kind never overlap". No artifact says what a trigger does while an aggregate read is in flight. The triggers are `retry()` and the terminal transition. data-health-ui calls `retry` after **Stop following** (E6-S5), which can coincide with the transition read.
   - **What the plan adopts (T008 (f), T010).** A trigger during an in-flight read sets one pending flag. When the read settles, exactly one trailing read starts. Reads never overlap, and any number of triggers during one read add one read, not several.
   - **Derivation.**
     - The NFR's no-overlap rule applies to every read of one kind.
     - Dropping the trigger, as `usePolledRead.refresh` does under TC-COMP-074's edge case, would leave an aggregate read before the retire on screen after **Stop following**. That contradicts DAC-E6-15's re-read "after a successful **Stop following**".
     - Where no trigger overlaps, the trailing read is the same one read per trigger that TC-COMP-064 counts.
   - **Alternatives rejected.**
     - Ignoring the trigger: this risks showing a stale aggregate.
     - Overlapping reads with a sequence guard: this breaks the NFR.
   - **Scope.** Contained in `use-data-health.ts`. No interface changes.
   - **Owning design to absorb it:** owner-shell §2.3 at its next revision.
4. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0326.**
   - **What is undetermined.** Owner-shell §2.3 declares `useShell(): ShellContextValue` and says nothing about a call with no `ShellProvider` above it.
   - **What the plan adopts (T006 (f), T009).** `useShell()` throws `Error("useShell() must be called inside <ShellProvider>")`. `useDataHealth()` therefore also needs a provider.
   - **Derivation.**
     - The delivered `useHealth()` falls back to its own poll. The same fallback here would open attention and summary intervals per consumer, contrary to the epic NFR "three intervals for the whole interface, none per screen" and owner-shell §5.
     - A static `loading` default would leave a screen loading forever without any sign of why.
     - Throwing surfaces the missing provider at once.
   - **Alternatives rejected.**
     - A per-consumer fallback poll: this breaks the NFR.
     - A frozen default value: this fails silently.
   - **Scope.** Propagating: the tests of every consumer story (E3-S4, E3-S6, E3-S7, E4, E5 and E6 screens) must mount `ShellProvider` (inside `HealthProvider`) or `vi.mock("…/app/shell-context")`, as CAP-002's tests mock `status-region`.
   - **Owning design to absorb it:** owner-shell §2.3 at its next revision.

### Other Notes

- **Cross-read cadence.** CAP-003-E3-S2's `usePolledRead(read, intervalMs)` gives `intervalMs` only its own read's last success, so the joint condition needs the other read's last answer.
  - The two `read` wrappers store their successes in refs. Each ref is set before the next delay is computed (S2's `startPolling` calls `onSettled`, then `nextDelayMs`), so the condition never depends on React's render timing.
  - A change in one read takes effect for the other when that other read next settles. For example, the summary's pending 60 s timer is not cut short when attention starts reporting a running download. This follows from the pinned signature, which computes the interval from the last answer at scheduling time, so it needs no decision.
  - The tests sequence first answers with `defer` so they never depend on same-tick settle order.
- **The `ScoreState` mapping** follows from owner-shell §2.3's two types, so it is not a decision. `ScoreState`'s `error.last` is `ScoreSummary | null`, so a last success that was not served maps to `null`, and a served one maps to its data without `checkedAt`. The register's G13 is therefore derived, not a gap (correction appended to the E3 register).
- **What counts as "turning terminal".** The rule is consecutive successful attention answers whose `latest_download.state` goes from `requested`, `running` or `cancelling` to one of the five outcomes (`types.ts:207` lists the eight). This is the literal reading of DAC-E3-19, and `run_id` is not compared.
  - **Residual.** Suppose download A ends and download B is already `requested` when the next attention answer arrives. `latest_download` never shows a terminal state, so no aggregate re-read fires, and the aggregate catches up on B's end. DAC-E3-19 requires nothing more, and this plan adds nothing more. CAP-003-E3-S7's toast watcher faces the same question (register G14) and decides it in its own plan.
- **`useDataHealth` is not paused while hidden.** It sets no timer. Its only automatic trigger comes from attention answers, which CAP-003-E3-S2's pause already stops while the page is hidden.
- **`health` is passed through.** The context does not copy or project `HealthResponse`. `credential_present: boolean` reaches consumers as `fetchHealth` typed it. The server-side guarantee that no value is ever sent is CAP-001's (delivered no-secrets tests). T004 holds the client side, both type-level and at runtime.
- **Hand-written mutants** for the mutation run:
  - `web/src/app/shell-context.tsx`: `setDetail(text)` → `setDetail((previous) => text ?? previous)`, killed by T003 (c) and (d).
  - `web/src/app/shell-context.tsx`: `useCallback((text) => setDetail(text), [])` → `(text) => setDetail(text)`, killed by T003 (b), where the effect count rises above 1.
  - `web/src/app/shell-context.tsx`: `const refresh = useCallback(…, [attentionRefresh, scoresRefresh, healthRefresh])` → an inline arrow, killed by T002 (e).
  - `web/src/app/shell-context.tsx`: a planted `useEffect(() => { void fetchDataHealth(); }, [attention])` in the provider, killed by T006 (d).
  - `web/src/app/use-data-health.ts`: `pending.current = true;` → *(deleted)*, killed by T008 (f).
  - `web/src/app/use-data-health.ts`: a planted `setInterval(run, 60_000)` in the mount effect, killed by T007 step 3.
  - `ShellContextValue`: an added `credential?: string | null` member, killed by `tsc` on T004.
- **Equivalent-mutant risk.** Swapping the order of the two `usePolledRead` calls changes nothing observable, because the refs decouple them. Record it as equivalent if the generator produces it.
- **No layout literal.** `shell-context.tsx` and `use-data-health.ts` are scanned by CAP-003-E3-S2's layout rule and CAP-003-E1-S1's literal scan. Write no `px` length in them, comments included.
