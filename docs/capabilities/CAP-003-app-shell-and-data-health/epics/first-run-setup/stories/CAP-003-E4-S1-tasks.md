---
artifact_schema_version: 1
artifact_id: CAP-003-E4-S1-tasks
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
  timestamp: 2026-11-07T06:18:58Z
  source_artifacts:
    - id: CAP-003-E4-S1
      version: "1"
    - id: CAP-003-E4
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: PRODUCT-UX-S02
      version: "4"
    - id: CAP-003-setup-ui-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E4-S1 — Setup Drafts, Step State and the Setup Copy Catalogue

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/first-run-setup/stories/CAP-003-E4-S1.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/screens/setup/`; design `setup-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Creates the three non-visual modules every later setup story builds on, in a new `web/src/screens/setup/` directory (setup-ui §2.1). `draft.tsx` exports `SetupDrafts`, `SetupDraftProvider` and `useSetupDrafts()`: the four drafts (`yearsText`, `source`, `pasted`, `unposted`) held in React state only, never in browser storage, so they survive a route change while the provider sits above the route and a freshly mounted provider starts empty (DEC-0202 as the owner amended it; DAC-E4-2, DAC-E4-S1-1). `use-setup-state.ts` exports `StepId`, `SetupState` and `useSetupState()`: on every mount it reads `GET /api/settings/history-depth` and `GET /api/instruments?lifecycle=active&limit=1` through the delivered `getHistoryDepth` and `listInstruments`, takes `health` and `attention` from `useShell()`, and derives each step's done flag from its server fact, the current step as the first step not done, and `step4` `blocked` while the followed count is 0 (DAC-E4-1, DAC-E4-S1-2, AC-2). It carries each read's state, including its error, for the step to render *Couldn't read …: {reason}* with **Try again** (DAC-E4-13). `copy.ts` holds every owner-facing string of UX design §1.2 and setup-ui §2.3 and §10, free of the DAC-E7-3 terms, with the plan-limit note as copy and not a validation (DAC-E4-S1-3, AC-19). Nothing is rendered or mounted here: CAP-003-E4-S2 to CAP-003-E4-S4 render the steps, and CAP-003-E4-S6 mounts the provider in the shell. No delivered file is edited.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-3 | Going back to an earlier step keeps every value entered in later steps: the drafts live above the route and `goTo` never touches them | T001, T002, T003, T008, T009 |
| AC-2 | Until a download has been requested, including after *Add later*, step 4 is not done: its flag is `attention.latest_download` non-null | T003, T009 |
| DAC-E4-1 | Each done flag follows its server fact; current is the first step not done, re-derived on every visit; done steps are links (state half: `goTo` on a done step) | T003, T005, T009 |
| DAC-E4-2 | `SetupDraftProvider` holds the four drafts in React state only; no `localStorage` or `sessionStorage`; a fresh provider starts empty | T001, T002, T008 |
| DAC-E4-S1-1 | Above a memory router, years text, radio choice and pasted text survive `/setup` → `/home` → `/setup`, with both storages empty | T001, T008 |
| DAC-E4-S1-2 | A failed depth read leaves step 2 not done and carries the error for *Couldn't read history depth: {reason}* with **Try again**; `active_count` 0 with step 4 current gives `step4` `blocked` | T004, T005, T009, T010 |
| DAC-E4-13 | A failed depth or count read is carried per step, so only that step shows the error | T004, T009, T010 |
| AC-21 | After *Add later* (`goTo(4)` with no followed stock) step 4 is `blocked` and step 3 stays to do | T004, T009 |
| DAC-E4-S1-3 | `copy.ts` contains none of the eight DAC-E7-3 terms as whole words; the plan-limit note states 5 years as copy, not a validation | T006, T007, T010 |
| AC-19 | Setup's owner-facing strings use the STD-UI-1 v6 display labels only | T006, T007, T010 |

Mapped test cases (`tests/component/setup-ui-tests.md`; `tests/coverage-matrix.md` lines 201, 202, 213-216 and the per-story count "3 of 3" at line 412):

- **TC-COMP-098** (DAC-E4-1): the epic criterion this story carries that no story-level criterion refines (coverage-matrix note at line 447).
- **TC-COMP-105** (DAC-E4-S1-1, DAC-E4-2).
- **TC-COMP-106** (DAC-E4-S1-2, DAC-E4-13).
- **TC-COMP-107** (DAC-E4-S1-3).

The setup-ui test specification and the coverage matrix are `status: draft`, the lowest rung of the precedence ladder; where a step is generic, the plan sharpens it from the story's criteria.

## Phase 1: Setup

**Purpose**: None required. No package, configuration or directory change: React 18, `react-router-dom` 6 (`MemoryRouter`), Vitest 2, `@testing-library/react` 16, `@testing-library/user-event` 14 and jsdom are delivered. `web/src/screens/setup/` is created by the first file written into it, and Biome's `web/src/**/*.ts(x)` include and `tsconfig.json`'s `web/src` include already cover it.

**Checkpoint**: CAP-003-E3-S1 (`web/src/app/shell-types.ts` with `ReadState<T>` and `Attention`) and CAP-003-E3-S3 (`web/src/app/shell-context.tsx` with `useShell` and `ShellContextValue`) are in the working tree before Phase 2 starts. Both are hard graph edges.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the drafts' lifetime, the step derivation and the copy catalogue.

**Shared harness for `web/src/screens/setup/use-setup-state.test.ts` (written with T003, reused by T004 and T005).** The file stays `.ts`, as the story names it: wrappers are built with `createElement`, not JSX.

- **Client mock.** `vi.mock("../../api/client", async (importActual) => ({ ...(await importActual()), getHistoryDepth: vi.fn(), listInstruments: vi.fn() }))`, the pattern of `web/src/screens/settings/history-depth-form.test.tsx:7`. `ApiError` and `ApiUnreachableError` stay real.
- **Shell mock.** `vi.mock("../../app/shell-context", () => ({ useShell: vi.fn() }))`. A helper `shell(overrides)` returns a full `ShellContextValue` literal: `health`, `attention`, `scores: { kind: "loading" }`, `refresh: vi.fn()`, `setTitleDetail: vi.fn()`. `vi.mocked(useShell).mockImplementation(() => current)` reads a module-level `current`, so a test changes the shell's answer and calls `rerender()`.
- **Health fixtures** (typed `ShellContextValue["health"]`, independent literals):
  - `HEALTH_UNKNOWN`: `{ liveness: "unknown", health: null, lastUpdated: null, lastAnsweredAt: null }`.
  - `HEALTH_OK`: `liveness: "answering"`, a `HealthResponse` literal with `credential_present: true` and `most_recent_run: null`, and both times `new Date("2026-09-06T18:30:00.000Z")`.
  - `HEALTH_UNREACHABLE_AFTER_ANSWER`: `liveness: "unreachable"`, the same `health`, `lastUpdated` 18:31:00Z, `lastAnsweredAt` 18:30:00Z.
  - `HEALTH_UNREACHABLE_NEVER`: `liveness: "unreachable"`, `health: null`, `lastUpdated` 18:31:00Z, `lastAnsweredAt: null`.
- **Attention fixtures** (typed `ReadState<Attention>`): `ATTENTION_LOADING` `{ kind: "loading" }`; `attentionOk(download)` gives `{ kind: "ok", data: { …ATTENTION_BASE, latest_download: download }, checkedAt: <18:30:00Z> }`, where `ATTENTION_BASE` is a full `Attention` literal with `latest_download: null`; `downloadIn(state: RunState)` is a `latest_download` literal (`run_id: "r-1"`, `requested_at`, `started_at: null`, `ended_at: null`, `progress: { done: 0, total: null }`) with that state.
- **Server answers.** `depth(years)` resolves `getHistoryDepth` with `{ years, updatedAt: years === null ? null : "2026-09-06T18:00:00Z" }`; `count(n)` resolves `listInstruments` with `{ rows: [], activeCount: n, retiredCount: 0, nextCursor: null }`. `deferred()` returns a promise with its `resolve` and `reject` for in-flight cases.
- **Render.** `renderHook(() => useSetupState(), { wrapper: ({ children }) => createElement(SetupDraftProvider, null, children) })`, then `await act(async () => {})` to flush the two reads. A remount ("another visit") uses a wrapper whose `SetupDraftProvider` is rendered once by a parent that toggles the hook's host component, so the provider outlives the hook. The helper `visit()` unmounts the hook's host and mounts it again under the same provider.

### Mandatory Component Tests

- [ ] T001 [P] Implement TC-COMP-105 (Drafts survive navigating away and back; nothing in browser storage) in a new `web/src/screens/setup/draft.test.tsx`, with a `// Implements TC-COMP-105` comment.
  - **Harness.** `beforeEach` clears `localStorage` and `sessionStorage` and spies on `Storage.prototype.setItem`. Render `<SetupDraftProvider><MemoryRouter initialEntries={["/setup"]}><Routes>…</Routes></MemoryRouter></SetupDraftProvider>`. The `/setup` route renders a test-local `DraftForm`: an `input` labelled `years` bound to `drafts.yearsText`, two radios labelled `paste` and `later` bound to `drafts.source`, a `textarea` labelled `pasted` bound to `drafts.pasted`, a button `keep unposted` that calls `setDraft("unposted", ["MSFT", "NVDA"])`, an element `data-testid="unposted"` rendering `JSON.stringify(drafts.unposted)`, and a `Link` to `/home`. The `/home` route renders a stub with a `Link` back to `/setup`. Test-local labels are not owner-facing.
  - **Steps (the TC's).**
    1. With `userEvent`, type `7` into `years`, choose `paste`, type `AAPL, MSFT` into `pasted` and press `keep unposted`.
    2. Follow the link to `/home`: `DraftForm` is gone (`queryByLabelText("years")` is `null`), so its local state cannot be what keeps the values. Follow the link back to `/setup`.
    3. Read the storages.
  - **Expected.** `years` has value `"7"`, `paste` is checked and `later` is not, `pasted` has value `"AAPL, MSFT"`, and `unposted` reads `["MSFT","NVDA"]` (the fourth draft, DAC-E4-2). `localStorage.length` and `sessionStorage.length` are both `0`, and the `setItem` spy was never called.
  - **TC edge case: a freshly mounted provider starts empty.** `unmount()`, then render a new provider with a probe that assigns `useSetupDrafts().drafts` to `latest`. `latest` `toEqual({ yearsText: "", source: null, pasted: "", unposted: [] })`, an independent literal.

  Kills:
  - a hand-written mutant that writes the drafts to `sessionStorage` in `setDraft`: the `setItem` spy and `sessionStorage.length`.
  - a hand-written mutant that initialises the state from `sessionStorage` when present, paired with the write: the fresh-provider case reads the earlier values.
  - swap-case on the initial `source` (`null` to `"paste"`) and drop-field-copy on any initial field: the fresh-provider literal.
  - a hand-written mutant whose `setDraft` writes every key to `yearsText`: step 1's four values.

### Additional Unit Tests

- [ ] T002 [P] Write the drafts' update and identity cases in `web/src/screens/setup/draft.test.tsx` (DAC-E4-2, AC-3). This runs sequentially with T001 (one file). A probe assigns `useSetupDrafts()` to `latest` and counts its renders. Cases:
  - (a) **Stable setter.** `latest.setDraft` is the same function (`toBe`) before and after three `setDraft` calls, so a consumer may list it in effect dependencies.
  - (b) **Two writes in one tick both land.** Inside one `act`, call `latest.setDraft("source", "paste")` then `latest.setDraft("pasted", "KO")`. `latest.drafts` `toEqual({ yearsText: "", source: "paste", pasted: "KO", unposted: [] })`.
  - (c) **One key at a time.** After `setDraft("yearsText", "12")`, the other three drafts equal their earlier values.
  - (d) **No provider.** `renderHook(() => useSetupDrafts())` with no provider throws an `Error` whose message names `SetupDraftProvider` (`toThrow(/SetupDraftProvider/)`).

  Kills:
  - a hand-written mutant that writes `setDrafts({ ...drafts, [key]: value })` from the render's closure instead of the functional update: (b) loses `source`.
  - a hand-written mutant that drops the `useCallback` around `setDraft`: (a).
  - negate-boolean on the missing-provider guard: (d).

### Mandatory Component Tests

- [ ] T003 Implement TC-COMP-098 (Step done flags follow server facts; current is the first not done) in a new `web/src/screens/setup/use-setup-state.test.ts`, with a `// Implements TC-COMP-098` comment, using the shared harness. Cases:
  - (a) **The TC's four steps, cumulative.** Each row sets the shell and the reads, mounts, flushes and asserts `done` `toEqual` the literal and `current` `toBe` the number:
    1. Nothing answered (`HEALTH_UNKNOWN`, `ATTENTION_LOADING`, `depth(null)`, `count(0)`): `{ 1: false, 2: false, 3: false, 4: false }`, current `1`.
    2. Health resolved only (`HEALTH_OK`, `attentionOk(null)`, `depth(null)`, `count(0)`): `{ 1: true, 2: false, 3: false, 4: false }`, current `2`.
    3. Add years: `depth(5)`: `{ 1: true, 2: true, 3: false, 4: false }`, current `3`.
    4. Add `count(12)`: `{ 1: true, 2: true, 3: true, 4: false }`, current `4`.
    5. Add `attentionOk(downloadIn(state))`, `it.each` over all eight states (`requested`, `running`, `cancelling`, `succeeded`, `partial`, `failed`, `cancelled`, `abandoned`): `{ 1: true, 2: true, 3: true, 4: true }`, current `4` (DEC-0343).
  - (b) **TC edge case: depth `null`.** `depth(null)` with every other fact true: `done[2]` is `false`, current `2`.
  - (c) **First not done, not "after the last done".** `HEALTH_OK`, `depth(null)`, `count(12)`, `attentionOk(null)`: `done[3]` is `true` and current is `2`.
  - (d) **Step 1 is done once health has answered.** `HEALTH_UNREACHABLE_AFTER_ANSWER`: `done[1]` is `true`. `HEALTH_UNREACHABLE_NEVER`: `done[1]` is `false` (UX design §1.2, *always, once health has answered*).
  - (e) **AC-2: step 4 after *Add later*.** `count(0)`, `attentionOk(null)`, and `act(() => result.current.goTo(4))`: current is `4` and `done[4]` is `false`; `done[3]` is `false`.
  - (f) **Re-derived on every visit.** First visit with `depth(null)`: current `2`; call `goTo(1)`: current `1`. Then `visit()` with `depth(10)` queued: `getHistoryDepth` has 2 calls and `listInstruments` 2 calls, `done[2]` is `true`, and current is `3`, not `1`, so the in-session `goTo` does not outlive the visit. The drafts set before the visit (`setDraft("pasted", "AAPL")`) are unchanged after it.
  - (g) **Done steps are links: the state half.** With steps 1 to 3 done and current `4`, `goTo(2)` makes current `2`, leaves `done` unchanged and leaves `drafts` `toBe` the same object. The link rendering is CAP-003-E4-S2's step list (Resolved Conflict 2).

  Kills:
  - negate-boolean on `years !== null`: (a) rows 2 and 3.
  - off-by-one on `activeCount > 0` (to `>= 0`): (a) row 2, where `done[3]` would be `true`.
  - negate-boolean on `latest_download !== null`: (a) rows 4 and 5.
  - swap-case on a step's fact (step 3 read from the depth, step 2 from the count): (c).
  - hand-written mutants in Other Notes: `lastAnsweredAt !== null` → `liveness === "answering"` ((d)); the current rule written as the step after the last done step ((c)); the all-done current `4` → `1` ((a) row 5); the `goTo` override kept in `SetupDraftProvider` instead of the hook ((f)).

- [ ] T004 Implement TC-COMP-106 (Failed depth read carries its error; step 4 blocked at zero stocks) in `web/src/screens/setup/use-setup-state.test.ts`, with a `// Implements TC-COMP-106` comment, sequential with T003 (one file). Cases:
  - (a) **Depth read fails.** `getHistoryDepth` rejects with `const failure = new ApiError("History depth could not be read.", "req-1", { code: "internal_error" })`, with `HEALTH_OK`, `count(3)`, `attentionOk(null)`. `done[2]` is `false`, current is `2`, and `result.current.depth` `toEqual({ kind: "error", error: failure, last: null })` with `error` `toBe(failure)`, so the step can render *Couldn't read history depth: {reason}* from it. `result.current.activeCount` is `{ kind: "ok", data: 3, checkedAt: expect.any(Date) }`: the failure stays in step 2 (DAC-E4-13).
  - (b) **Transport failure.** The same with `new ApiUnreachableError("x")`: `depth.kind` is `"error"` and `error` is that instance.
  - (c) **`step4` blocked at zero.** `count(0)`, `depth(5)`, `HEALTH_OK`, `attentionOk(null)`, then `goTo(4)` (the *Add later* path): current `4`, `step4` `"blocked"`. With `count(1)` instead: `step4` `"ready"`.

  Kills:
  - negate-boolean on the `blocked` condition (`activeCount === 0` to `!==`): (c) both rows.
  - off-by-one on `=== 0` (to `<= 1`): (c) the `count(1)` row.
  - drop-field-copy on `error` in the error branch: (a)'s `toBe`.
  - swap-case on `"blocked"` / `"ready"`: (c).

### Additional Unit Tests

- [ ] T005 Write the read, re-read and failure-flag cases in `web/src/screens/setup/use-setup-state.test.ts` (DAC-E4-1, DAC-E4-13, DAC-E4-S1-2; DEC-0342, DEC-0344; setup-ui §5 and §11), sequential with T003 and T004. Cases:
  - (a) **Exactly the two reads, with the exact query.** One mount calls `getHistoryDepth` once with no argument and `listInstruments` once with exactly `{ lifecycle: "active", limit: 1 }` (`toHaveBeenCalledWith`, which compares the whole object).
  - (b) **No interval.** With `vi.useFakeTimers()`, advance 600 000 ms after mount: still one call each (setup-ui §5, *this screen opens no interval*).
  - (c) **`loading`.** `true` while either read is pending (`deferred()`), while `attention.kind` is `"loading"`, or while `health.liveness` is `"unknown"`; `false` once all four have settled, including when a read settled as an error.
  - (d) **Try again.** After (T004 a), `getHistoryDepth` next resolves `depth(8)`; `act(() => result.current.reread("depth"))`: `getHistoryDepth` has 2 calls, `listInstruments` still 1, `depth` `toEqual({ kind: "ok", data: { years: 8, updatedAt: "2026-09-06T18:00:00Z" }, checkedAt: expect.any(Date) })`, `done[2]` is `true`.
  - (e) **A re-read keeps the value until it settles.** From `depth(5)`, `reread("depth")` with a `deferred()` answer pending: `depth.kind` stays `"ok"` with `years` 5 and `done[2]` stays `true`, so the current step does not jump while the read is in flight. When it rejects with an `ApiError`, `depth` is `{ kind: "error", error, last: { data: { years: 5, … }, checkedAt: <the first answer's instant> } }` and `done[2]` is `false`.
  - (f) **Count read fails.** `listInstruments` rejects with an `ApiError`, `depth(5)`, `HEALTH_OK`, `attentionOk(null)`: `done[3]` is `false`, current `3`, `activeCount.kind` `"error"`, and `step4` is `"ready"`, because only a known count of 0 blocks the start (DEC-0344). `reread("activeCount")` calls `listInstruments` a second time with the same argument.
  - (g) **Attention fails after an answer.** `{ kind: "error", error: <ApiError>, last: { data: { …ATTENTION_BASE, latest_download: downloadIn("running") }, checkedAt } }`: `done[4]` is `true`. With `last: null`: `false`. `ATTENTION_LOADING`: `false` (DEC-0344).
  - (h) **Shape and passthrough.** `Object.keys(result.current).sort()` `toEqual(["activeCount", "current", "depth", "done", "drafts", "goTo", "loading", "reread", "setDraft", "step4"])`. `result.current.setDraft("yearsText", "9")` makes `result.current.drafts.yearsText` `"9"`. `goTo`, `reread` and `setDraft` keep their identity across two re-renders (`toBe`).

  Kills:
  - drop-defaulted-argument on `limit: 1` and on `lifecycle: "active"`: (a).
  - a hand-written mutant that adds a `setInterval` re-read: (b).
  - negate-boolean on any clause of `loading`: (c).
  - a hand-written mutant that sets `{ kind: "loading" }` before a re-read: (e).
  - drop-field-copy on `last` in the re-read's error branch: (e).
  - swap-case on the `reread` dispatch (`"depth"` reading the count): (d) and (f) count per function.
  - negate-boolean on the `last` fallback for attention: (g).

- [ ] T006 [P] Implement TC-COMP-107 (Setup copy is free of domain terms; plan limit is copy) in a new `web/src/screens/setup/copy.test.ts`, with a `// Implements TC-COMP-107` comment. The file follows the delivered `web/src/screens/research/copy.test.ts` scanner pattern.
  - **The catalogue.** `import * as copy from "./copy"` and flatten every export: a string is taken as is, an object recursively, and a function is called with representative arguments (`"AAPL"`, `"12"`, `"2026-10-15 09:30 CDT"`, `"history depth"`; a function of a step number with `1`, `2`, `3` and `4`). Every function result must be a string. `expect(CATALOGUE.length).toBeGreaterThan(60)` keeps the scan non-vacuous.
  - **The source text.** `readFileSync` of `copy.ts`, resolved from `import.meta.url` as `web/src/app/shell.tokens.test.tsx` does. TC step 1 scans the file, so its comments are scanned too.
  - **The terms.** `TERMS` is the DAC-E7-3 list as eight case-insensitive whole-word patterns: `/\binstrument\b/i`, `/\bacquisition\b/i`, `/\bacquire\b/i`, `/\brun\b/i`, `/\bruns\b/i`, `/\bretire\b/i`, `/\bretired\b/i`, `/\bprovider\s+credential\b/i`. `violations(text)` returns the patterns that match.
  - **Cases.**
    - (a) Non-vacuity of the scanner: `violations` flags each planted string `"Start acquisition"`, `"Runs"`, `"run"`, `"Retired stocks"`, `"Instrument"`, `"Provider credential missing"`, `"acquire data"` and `"the download runs on its own"`, and passes `"this keeps running"`, `"Restart FactorFlow after setting it."`, `"provider plan"` and `"Download data"`.
    - (b) `it.each(CATALOGUE)` has no violation.
    - (c) The source text of `copy.ts` has no violation.
    - (d) **Plan limit is copy, not a validation.** `copy.STEP2.planLimitNote` `toBe` *Your provider plan holds 5 years. A deeper depth is requested as stated; the provider returns what it holds.* (an independent literal), and it matches `/\b5 years\b/`. No export of `copy.ts`, at any depth, is a number or a boolean: the module holds no bound, so nothing can validate against it.

  Kills:
  - the sub-line verbatim from S02 §8 (*…the data download runs on its own…*): (b) and (c) (Resolved Conflict 1).
  - drop-field-copy on `planLimitNote`: (d).
  - a hand-written mutant that adds `export const PLAN_LIMIT_YEARS = 5`: (d).

- [ ] T007 [P] Write the copy completeness case in `web/src/screens/setup/copy.test.ts` (setup-ui §10; UX design §1.2; S02 §8; DAC-E4-S1-3), sequential with T006 (one file). One `it.each` table of `[path, arguments, expected]` rows, each `expected` an independent literal copied from the design, asserts the export at `path` (called with `arguments` when it is a function) `toBe` that literal. It holds one row for every string listed under T010, including each template once (for example `["STEP3.counter", ["12", "1", "2"], "12 symbols recognised, 1 duplicates, 2 not recognised"]` and `["STEP4.downloadFor", ["42"], "Download data for 42 stocks"]`). A last case asserts `Object.keys(copy.STEP_TITLES)` `toEqual(["1", "2", "3", "4"])`, so the paper trading step is absent (DAC-E4-11).

  Kills:
  - drop-field-copy on any entry, or any change to its text: the row for that path.
  - off-by-one on the *Step {n} of 4* total: the `stepPosition` row.

**Checkpoint**: T001–T007 exist and fail for the right reason: `draft.tsx`, `use-setup-state.ts` and `copy.ts` are missing, so the imports fail. Every delivered test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The three modules, each in its own TDD cycle.

- [ ] T008 Create `web/src/screens/setup/draft.tsx` (T001 and T002 RED first).
  - **Exports.** `interface SetupDrafts` verbatim from setup-ui §2.2 with its comments (`yearsText: string`, `source: "paste" | "later" | null`, `pasted: string`, `unposted: string[]`); `SetupDraftProvider(props: { children: ReactNode }): JSX.Element`; `useSetupDrafts(): { drafts: SetupDrafts; setDraft<K extends keyof SetupDrafts>(key: K, value: SetupDrafts[K]): void }`.
  - **State.** `useState<SetupDrafts>(() => ({ yearsText: "", source: null, pasted: "", unposted: [] }))`, a fresh object per provider, so a remounted provider (a reload) starts empty.
  - **Setter.** `setDraft` is a `useCallback` with an empty dependency list over the functional update `setDrafts((previous) => ({ ...previous, [key]: value }))`.
  - **Context.** A private context created with `null`. The provider supplies a `useMemo`'d `{ drafts, setDraft }`. `useSetupDrafts()` throws `new Error("useSetupDrafts() must be called inside <SetupDraftProvider>")` when no provider is above it.
  - **Comments.** The module doc comment cites DEC-0202 as the owner amended it, setup-ui §2.2 and §3, system design §4.4 and DAC-E4-2, and says the shell mounts the provider inside `ShellProvider` and outside the main region's route map (CAP-003-E4-S6). No browser storage call, and no comment that names a storage API (the Validation Plan greps for them).

  This makes T001 and T002 pass.

- [ ] T009 Create `web/src/screens/setup/use-setup-state.ts` (depends on T008; T003–T005 RED first).
  - **Imports.** `useCallback`, `useEffect`, `useMemo`, `useRef`, `useState` from `"react"`; `getHistoryDepth`, `listInstruments`, `ApiError`, `ApiUnreachableError` from `"../../api/client"`; `type { HistoryDepth }` from `"../../api/types"`; `useShell` from `"../../app/shell-context"`; `type { ReadState }` from `"../../app/shell-types"`; `useSetupDrafts` and `type SetupDrafts` from `"./draft"`.
  - **Exports.** `type StepId = 1 | 2 | 3 | 4` and `interface SetupState` with setup-ui §2.2's six members verbatim (`current`, `done`, `step4`, `drafts`, `goTo`, `setDraft`) plus four additive members, each commented with DEC-0342:
    - `depth: ReadState<HistoryDepth>`, the history-depth read;
    - `activeCount: ReadState<number>`, the followed count, `listInstruments(...).activeCount`;
    - `loading: boolean`;
    - `reread(fact: "depth" | "activeCount"): void`, for **Try again** and for a step that has just saved.
    And `useSetupState(): SetupState`.
  - **Reads.** One `useEffect` with an empty dependency list starts both reads on mount: `getHistoryDepth()` and `listInstruments({ lifecycle: "active", limit: 1 })`. Each settles into its `ReadState`: success gives `{ kind: "ok", data, checkedAt: new Date() }`; an `ApiError` or `ApiUnreachableError` gives `{ kind: "error", error, last }`, where `last` is `{ data, checkedAt }` from a previous `ok`, the previous `last` from a previous `error`, and `null` otherwise (owner-shell §2.3 `ReadState`). Any other rejection is rethrown. A `mounted` ref drops answers that arrive after unmount. No timer and no `visibilitychange` listener (setup-ui §5).
  - **Re-read.** `reread(fact)` is a stable `useCallback` that starts the same read again without first resetting the state to `loading`, so the step's done flag holds until the new answer settles.
  - **Derivation** (comment each line with DAC-E4-1 and its design row):
    - `done[1] = health.lastAnsweredAt !== null` (UX design §1.2, *once health has answered*);
    - `done[2] = depth.kind === "ok" && depth.data.years !== null`;
    - `done[3] = activeCount.kind === "ok" && activeCount.data > 0`;
    - `done[4] = latest !== null`, where `latest` is `attention.data.latest_download` when `attention.kind === "ok"`, `attention.last?.data.latest_download ?? null` when `"error"`, and `null` when `"loading"` (DEC-0344);
    - `derived` is the first of `1, 2, 3, 4` whose `done` is `false`, or `4` when all four are done (DEC-0343);
    - `current = override ?? derived`, where `override` is hook-local `useState<StepId | null>(null)` and `goTo(step)` is a stable `useCallback` that sets it. It lives in the hook, not the provider, so it ends with the visit and the next mount re-derives (setup-ui §2.2 [12]);
    - `step4 = activeCount.kind === "ok" && activeCount.data === 0 ? "blocked" : "ready"` (setup-ui §2.2 [13]–[14]; DEC-0344 for an unknown count);
    - `loading = health.liveness === "unknown" || depth.kind === "loading" || activeCount.kind === "loading" || attention.kind === "loading"`.
  - **Drafts.** `drafts` and `setDraft` are `useSetupDrafts()`'s, passed through unchanged.
  - **Comments.** Cite AC, DAC and TC per rule, in the style of the delivered `status-region.tsx`. No browser storage, no layout value in any comment.

  This makes T003–T005 pass.

- [ ] T010 [P] Create `web/src/screens/setup/copy.ts` (T006 and T007 RED first; independent of T008 and T009).
  - **Module doc comment.** Every owner-facing string of the setup screen, so the steps and their tests share one source (setup-ui §2.1, §10; UX design §1.2; S02 §8). Wording is verbatim from those sections except the sub-line (DEC-0341). Status labels (*Found*, *Missing*, the download states) come from `labelOf` and *Not determinable* from `NotDeterminable` (ui-components §2.3, §2.5), so they are not repeated here. A string a later setup story needs and no design contains is added by that story with a doc comment saying so, as `web/src/screens/research/copy.ts` does. Template parameters are text already formatted by the caller (`formatCount`, `formatInstant`, `formatClock`, ui-components §2.5), so this module imports nothing. The comments name none of the eight DAC-E7-3 terms, because T006 scans the file.
  - **Exports**, each with its source cited:
    - `SCREEN`: `title` *Get set up*; `subLine` *About 10 minutes, then the data download continues on its own. You can leave and come back.* (DEC-0341); `stepsLabel` *Setup steps*.
    - `STEP_TITLES`: `1` *Market data*, `2` *How far back*, `3` *Stocks to follow*, `4` *Download data*.
    - `QUESTIONS`: `1` *Connect market data*, `2` *How far back should history go?*, `3` *Which stocks do you want to follow?*; step 4's question is `STEP4.downloadFor`.
    - `stepPosition(n: StepNumber)` → `Step ${n} of 4`; `backLabel(title)` → `← Back: ${title}`; `nextHint(title)` → `Next: ${title}`; `CONTINUE` *Continue*; `doneLabel(title)` → `${title}, done` (UX design §1.2 accessibility, *How far back, done*). `StepNumber` is a local `1 | 2 | 3 | 4`, so `copy.ts` imports nothing.
    - `SUMMARIES`: `years(y)` → `${y} years of history`; `followed(n)` → `${n} followed stocks`; `downloadStarted(time)` → `Download started ${time}`.
    - `STEP1`: `keyLabel` *Market data key:*; `KEY_VARIABLE` `FACTORFLOW_MASSIVE_API_KEY`; `setVariable` *Set the environment variable FACTORFLOW_MASSIVE_API_KEY to your Massive API key.*, built from `KEY_VARIABLE` so the step can set the name in code type; `restart` *Restart FactorFlow after setting it.*; `notAnswering` *FactorFlow isn't answering, so the key can't be checked.*
    - `STEP2`: `fieldLabel` *History depth*; `suffix` *years*; `description` *Whole years, 1 to 50.*; `planLimitNote` *Your provider plan holds 5 years. A deeper depth is requested as stated; the provider returns what it holds.*; `rangeError` *History depth must be a whole number of years from 1 to 50.*
    - `STEP3`: `explanation` (S02 §8, verbatim); `sourceLegend` *How do you want to name them?*; `paste` `{ label: "Paste a list", description: "Paste symbols separated by commas or one per line." }`; `later` `{ label: "Add later", description: "Continue without stocks for now; you can follow them later from Data health." }`; `fieldLabel` *Stock symbols*; `placeholder` *AAPL, MSFT, NVDA or one symbol per line*; `fieldDescription` *Whether the provider knows each one is checked during the download.*; `counter(a, d, r)` → `${a} symbols recognised, ${d} duplicates, ${r} not recognised`; `unreadable(entry)` → `${entry}, not a valid symbol format`; `didYouMean(fix)` → `Did you mean ${fix}?`; `belowFloor(a)` → `Factor scores need at least 30 stocks with complete data. With ${a}, no factor can be ranked yet.`; `zeroBlocked` *Paste at least one symbol, or choose Add later.*; `alreadyFollowed` *already followed* (setup-ui §2.3; DAC-E4-5); `infoNote` (S02 §8, verbatim).
    - `STEP4`: `downloadFor(n)` → `Download data for ${n} stocks`; `summaryKey` *Market data key*; `summaryDepth` *History depth*; `yearsValue(y)` → `${y} years`; `summaryFollowed` *Followed stocks*; `start` *Start download*; `progress(done, total)` → `${done} of ${total} stocks`; `started(time)` → `Started ${time}`; `checked(time)` → `checked ${time}`; `canLeave` *You can leave; this keeps running.*; `queued` *A download is running. This starts when it finishes.*; `depthNotSet` *Couldn't start the download: history depth isn't set.*; `goToStep2` *Go to step 2*; `noStocks` *Couldn't start the download: no stocks are followed.*; `goToStep3` *Go to step 3*; `blockedReason` *No stocks are followed. Follow stocks before downloading.*; `goHome` *Go to Home*; `manageFollowed` *Manage followed stocks*; `progressUnreadable` *Progress can't be read right now*.
    - `READ_ERRORS`: `subjects` `{ depth: "history depth", followed: "the followed list" }`; `readFailed(subject, reason)` → `Couldn't read ${subject}: ${reason}`; `tryAgain` *Try again*.

  This makes T006 and T007 pass.

**Checkpoint**: `npm run test` is green, including every delivered test and the CAP-003-E3 suites, unchanged. `npx tsc --noEmit` is clean.

---

## Phase 4: Integration

**Purpose**: Confirm the change set is exactly the story's, with nothing rendered or mounted early.

- [ ] T011 Confirm scope (depends on T008–T010).
  - `git status --short` lists only `web/src/screens/setup/draft.tsx`, `draft.test.tsx`, `use-setup-state.ts`, `use-setup-state.test.ts`, `copy.ts` and `copy.test.ts`, plus this story's `-tasks.md`, its `-tdd-evidence.yaml` and its status line.
  - `git diff --exit-code -- web/src/app/ web/src/api/ web/src/components/ web/src/screens/instruments/ web/src/main.tsx` exits 0.
  - `grep -rlE "screens/setup/(draft|use-setup-state|copy)\"" web/src --include='*.ts' --include='*.tsx' | grep -v '/screens/setup/'` prints nothing. CAP-003-E4-S2 to CAP-003-E4-S4 are the first consumers, and CAP-003-E4-S6 mounts `SetupDraftProvider` in `shell.tsx`.

**Checkpoint**: The six files plus the plan artifacts are the whole diff. Delivered behaviour is unchanged.

---

## Phase 5: Polish

**Purpose**: Validation, formatting and the TDD evidence.

- [ ] T012 Run `npm run format` (a check). Fix any report with `npx biome format --write` on this story's six files only. Then run `npm run lint`, `npx tsc --noEmit`, `npm run build` and `npm run test`, and re-run T011's checks. Biome's recommended `useExhaustiveDependencies` may flag the mount-only effect in T009; satisfy it by reading the read functions through refs inside the effect, not by suppressing the rule. No behaviour change.
- [ ] T013 After each TDD cycle in T001–T012 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E4-S1-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence;
    - the structured `mutation:` block `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  - (1) T001 + T002 + T008: the drafts.
  - (2) T003–T005 + T009: the step state.
  - (3) T006 + T007 + T010: the copy catalogue.

  T011 and T012 add no behaviour and join cycle 3's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S1 | hard | `use-setup-state.ts` imports `type { ReadState }` from `web/src/app/shell-types.ts`, and its test types the attention fixtures with `Attention` from the same file, which CAP-003-E3-S1 creates. Added to the graph by this plan; it was already reached through CAP-003-E3-S3 |
| CAP-003-E4-S2 | reverse | Renders the step list (done steps as links calling `goTo`), the step card and steps 1 and 2 from `useSetupState()` and `copy.ts`, and calls `reread("depth")` after a save. Graph: E4-S2 depends on E4-S1 |
| CAP-003-E4-S3 | reverse | Reads and writes `source`, `pasted` and `unposted` through the drafts, calls `goTo(4)` on *Add later* and `reread("activeCount")` after posting. Graph: E4-S3 depends on E4-S1 |
| CAP-003-E4-S4 | reverse | `SetupScreen` reads `loading`, `current`, `done` and `step4`, and step 4 renders the summary from `depth` and `activeCount`. Graph: E4-S4 depends on E4-S1 |
| CAP-003-E4-S6 | reverse | Mounts `SetupDraftProvider` in `shell.tsx` inside `ShellProvider` and outside the main region's route map (DEC-0223 answer A as DEC-0227 carries it). Graph: E4-S6 depends on E4-S1 |
| CAP-003-E1-S1 | context | Its `token-literals.test.ts` literal scan, which CAP-003-E4-S2 widens to `web/src/screens/setup/`, will read this story's sources (Other Notes). This plan writes no length or colour literal and imports nothing from it |
| CAP-003-E3-S2 | context | Its layout rule scans every non-test source under `web/src/` for the seven layout values (Other Notes), and its `HealthState.lastAnsweredAt` reaches this story only as a field of `ShellContextValue["health"]` through CAP-003-E3-S3's `useShell()`. No file of it is imported here |

The existing edge `CAP-003-E4-S1: [CAP-003-E3-S3]` covers `useShell` and `ShellContextValue` from `web/src/app/shell-context.tsx`. `CAP-003-E3-S1` is added. Every other import is delivered code: `web/src/api/client.ts`, `web/src/api/types.ts` and `react-router-dom`.

### Task Dependencies

- T001 and T002 share `draft.test.tsx` and run in sequence.
- T003, T004 and T005 share `use-setup-state.test.ts` and run in sequence.
- T006 and T007 share `copy.test.ts` and run in sequence.
- The three test files can be written in parallel.
- T008 depends on T001 and T002 being RED.
- T009 depends on T008 (it calls `useSetupDrafts`), with T003–T005 RED first.
- T010 depends on T006 and T007 being RED, and on nothing else.
- T011 depends on T008–T010. T012 depends on T011.
- T013 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- Phase 2: the three test files.
- Phase 3: T010 alongside T008 and T009; T009 follows T008.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not run: this story renders and mounts nothing.

### Story-Specific Validation

- **DAC-E4-2 and DAC-E4-S1-1:** `npx vitest run web/src/screens/setup/draft.test.tsx` is green. `grep -rnE "localStorage|sessionStorage|indexedDB" web/src/screens/setup --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` prints nothing; the test files name the storages, the sources do not (T008's comment rule).
- **DAC-E4-1, AC-2, DAC-E4-S1-2 and DAC-E4-13:** `npx vitest run web/src/screens/setup/use-setup-state.test.ts` is green. `grep -nE "setInterval|setTimeout|visibilitychange" web/src/screens/setup/use-setup-state.ts` prints nothing (setup-ui §5).
- **DAC-E4-S1-3 and AC-19:** `npx vitest run web/src/screens/setup/copy.test.ts` is green, with T006 (a)'s planted strings flagged, so the scan is not vacuous.
- **Mutation:** `python3 scripts/mutation-run.py run` with `--command "npx vitest run web/src/screens/setup/ && npx tsc --noEmit"` over `web/src/screens/setup/draft.tsx`, `use-setup-state.ts` and `copy.ts`, plus the hand-written mutants in Other Notes, leaves no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **The setup sub-line against DAC-E4-S1-3.**
   - **The conflict.** S02 §8, setup-ui §10 and UX design §1.2 give the sub-line as *About 10 minutes, then the data download runs on its own. You can leave and come back.* DAC-E4-S1-3 and TC-COMP-107 require that `copy.ts`, scanned for the DAC-E7-3 terms as whole words in any case, contains none of them, and *runs* is one of the eight.
   - **Governing: the story's DAC-E4-S1-3** (story criteria outrank design prose; constraint 9 step 1). Capability AC-19 forbids the domain term and does not require the verb, so it does not settle the wording either way; the story criterion is the more specific statement.
   - **Outcome.** `copy.ts` cannot carry the word. The replacement wording is fixed by no artifact, so it is Open Gap 1 (DEC-0341).
2. **TC-COMP-098's "done steps are links" against this story's file list.**
   - **The conflict.** TC-COMP-098 expects done steps to be links. This story writes no rendering file; the step list is CAP-003-E4-S2's `step-list.tsx`, whose description says "done steps as links".
   - **Governing: the story's Implementation list and setup-ui §2.1 placement** (the step list is `step-list.tsx`), over the draft test specification.
   - **Outcome.** T003 (g) proves the state half: `goTo` on a done step makes it current and touches no draft. CAP-003-E4-S2 renders the link.
3. **One line or two for the progress time.** UX design §1.2 writes *Started {start time} · checked {time}* as one line; setup-ui §10 and epic DAC-E4-9 list *Started {start time}* and *checked {time}* separately. **Governing: epic DAC-E4-9.** `copy.ts` holds two templates (`STEP4.started`, `STEP4.checked`); CAP-003-E4-S4 lays them out.
4. **`activeCount` against `active_count`.** The designs name the wire field; the delivered `listInstruments` maps it to `activeCount` (`web/src/api/client.ts:288`). Not a conflict of fact: the plan reads the client's field.
5. **setup-ui's body header `**Status:** draft` against its frontmatter `status: approved`.** The frontmatter, which the approval gate reads, governs.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0341.**
   - **What is undetermined.** After Resolved Conflict 1, the sub-line's wording without *runs*.
   - **What the plan adopts (T010, T006).** *About 10 minutes, then the data download continues on its own. You can leave and come back.*
   - **Derivation.** The smallest change that passes the scan: one word replaced, the sentence's meaning (setup takes about 10 minutes; the download then proceeds without the owner) and length kept. *Continues* is accurate because the download has been started at step 4 when the sentence's second clause applies, and the step 4 line *You can leave; this keeps running.* already says the same thing.
   - **Alternatives rejected.**
     - Keeping the verbatim sub-line: fails DAC-E4-S1-3 and TC-COMP-107, and the rendered-text scans of CAP-003-E4-S2 and CAP-003-E4-S4.
     - Exempting the sub-line from the scan: the story criterion has no exemption, and an allow-list would be a new rule no artifact gives.
     - *proceeds on its own*: equally valid; *continues* is the plainer word.
   - **Scope.** Propagating: CAP-003-E4-S4 renders `SCREEN.subLine` under the `h1` and scans the rendered text.
   - **Owning design to absorb it:** setup-ui §10 and UX design §1.2 at their next revision, with S02 §8.
2. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0342.**
   - **What is undetermined.** setup-ui §2.2 pins `SetupState` with six members, none of which carries a read's error, the depth's years or the followed count. DAC-E4-S1-2 requires "the state carries the read's error for the step to render *Couldn't read history depth: {reason}* with **Try again**"; the done summaries need *{y} years of history* and *{n} followed stocks*; step 4's summary card needs *{y} years* and *{n}*; DAC-E4-S2-1 needs step 2 to read done after a save; and the screen's loading state (skeleton) needs to know the reads are pending.
   - **What the plan adopts (T005, T009).** Four additive members on `SetupState`: `depth: ReadState<HistoryDepth>`, `activeCount: ReadState<number>`, `loading: boolean` and `reread(fact: "depth" | "activeCount"): void`. A re-read keeps the current value until it settles. The six pinned members keep their names and types.
   - **Derivation.**
     - Constraint 9a prefers an additive change to a pinned interface over altering it.
     - `ReadState<T>` is owner-shell §2.3's fetch-state type, so the steps render a read here exactly as the shell's reads are rendered, and its `error.last` gives **Try again** the previous value.
     - One `reread` serves both **Try again** (DAC-E4-13) and a step's refresh after **Continue** saves, so no second write path to the facts exists.
   - **Alternatives rejected.**
     - Each step reading its own fact: the done flags would then come from a different read than the step shows, and DAC-E4-S1-2 puts the error on "the state".
     - A `facts` object of plain values with a separate `errors` map: two shapes for one read.
   - **Scope.** Propagating: CAP-003-E4-S2, CAP-003-E4-S3 and CAP-003-E4-S4 consume the members.
   - **Owning design to absorb it:** setup-ui §2.2 at its next revision.
3. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0343.**
   - **What is undetermined.** DAC-E4-1 makes the current step "the first not done". When all four steps are done (after **Start download**, or when Settings' **Open setup** reopens setup "with every step shown as done", UX design §1.2), no step is "not done", yet `current` is typed `1 | 2 | 3 | 4`.
   - **What the plan adopts (T003 (a) row 5, T009).** `current` is `4`.
   - **Derivation.** Step 4 is where the download's progress shows "while the owner stays" (AC-7, DAC-E4-9), and the moment step 4 becomes done is the `202` the owner just received on that step; any other step would move the card away from the progress at the instant it appears. Step 4 is also the last step, so "the step after the last done" and "the last step" agree.
   - **Alternatives rejected.** Step 1 (the beginning of a review): it would hide the progress AC-7 requires to show. A fifth "complete" value: not in `StepId`, which setup-ui §2.2 pins.
   - **Scope.** Propagating: CAP-003-E4-S4 renders step 4 with its progress on that basis, and CAP-003-E7's **Open setup** lands on it.
   - **Owning design to absorb it:** setup-ui §2.2 at its next revision.
4. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0344.**
   - **What is undetermined.** How the flags read a fact that is unknown: DAC-E4-S1-2 fixes only the failed depth read (step 2 not done). No artifact says what a failed or pending count read or attention read does to `done[3]`, `done[4]` and `step4`.
   - **What the plan adopts (T005 (f), (g); T009).**
     - A failed count read: `done[3]` is `false`, by the same rule as the depth, and `step4` is `ready`.
     - A failed attention read: `done[4]` follows `error.last`'s `latest_download` when there is a last answer, and is `false` when there is none.
     - A pending read: its step is not done, and `loading` is `true`.
   - **Derivation.**
     - `step4` is `blocked` "while `active_count` is 0" (setup-ui §2.2), "derived from `active_count` 0 without a request" (system design §3.2 note 6). An unknown count is not a known 0, and CAP-001 refuses a start with no followed stock (`409 no_active_instruments`), which step 4 still renders as the refusal with **Go to step 3** (setup-ui §2.3). Blocking on an unknown count would add a refusal CAP-001 does not make (AC-17; DEC-0203's reasoning).
     - `ReadState`'s `error.last` is the shell's own rule for a failed poll: keep the last value (owner-shell §2.3; DAC-E3-5). A download that existed does not stop existing because one attention poll failed.
   - **Alternatives rejected.** `blocked` on an unknown count: a refusal the server would not make. `done[4]` false on any attention error: step 4 would flip to not done on a single failed poll while its progress line already reads *Progress can't be read right now*.
   - **Scope.** Propagating: CAP-003-E4-S4 renders `step4` and the step 4 flag.
   - **Owning design to absorb it:** setup-ui §2.2 at its next revision.
5. **Not this story's, recorded for the consumers.** No artifact fixes these; they belong to the stories that render them, and this plan sets nothing for them:
   - the `{reason}` in *Couldn't read …: {reason}* (the error's `message`, or a fixed line): `READ_ERRORS.readFailed` takes it as a parameter (CAP-003-E4-S2, CAP-003-E4-S3);
   - pluralisation of *{a} symbols recognised, {d} duplicates, {r} not recognised* at 1: the template is verbatim (CAP-003-E4-S3);
   - whether a done-step link is an `href` or an in-page `goTo`: the state offers `goTo` (setup-ui §2.2); the element is CAP-003-E4-S2's.

### Other Notes

- **The `goTo` override lives in the hook.** setup-ui §2.2 [12] says Back, a done-step link or leaving and returning either changes the current step or re-derives it, with drafts untouched. Keeping the override in `useSetupState`'s own state, not in `SetupDraftProvider`, gives exactly that: it holds for the visit and the next mount re-derives (T003 (f)). A step's **Continue** sets the next step with `goTo`; after a save that also calls `reread`, the derived step moves with the fact.
- **Step 1's flag reads `lastAnsweredAt`.** UX design §1.2 says step 1 is done "always, once health has answered". `HealthState.lastAnsweredAt` (owner-shell §2.3, through `useShell()`) is the instant of the last successful answer and is kept while unreachable, so a health outage after an answer leaves step 1 done (T003 (d)); step 1 itself then shows *Not determinable* (CAP-003-E4-S2).
- **Attention is not refreshed on mount.** The flowchart (setup-ui §2.2 [2]) reads `attention.latest_download` from the shell as it stands; the shell polls it every 60 s or 10 s. This plan adds no `refresh("attention")` on mount.
- **The copy test file.** The story's file list names no `copy.test.ts`, but TC-COMP-107 is mandatory and setup-ui §2.1 places `web/src/screens/setup/*.test.ts(x)` in the directory. `copy.test.ts` follows the delivered `research/copy.test.ts`.
- **Layout and literal scans.** CAP-003-E4-S2 widens CAP-003-E1-S1's literal scan to `web/src/screens/setup/`, and CAP-003-E3-S2's layout rule scans every non-test source under `web/src/`. None of this story's sources may hold a `px`, `rem`, `em`, `vh` or `vw` length, a colour, or one of the seven layout values, comments included.
- **No overlap guard on re-reads.** A re-read is user-triggered (**Try again**) or follows a save, after the mount read has settled. The plan adds no in-flight guard; a later story that needs one adds it with its test.
- **Hand-written mutants** for the mutation run:
  - `web/src/screens/setup/draft.tsx`: `setDrafts((previous) => ({ ...previous, [key]: value }))` → `setDrafts({ ...drafts, [key]: value })`, killed by T002 (b).
  - `web/src/screens/setup/draft.tsx`: add `sessionStorage.setItem("setup-drafts", JSON.stringify({ ...drafts, [key]: value }))` inside `setDraft`, killed by T001.
  - `web/src/screens/setup/draft.tsx`: `useCallback(…, [])` around `setDraft` → a plain function, killed by T002 (a).
  - `web/src/screens/setup/use-setup-state.ts`: `health.lastAnsweredAt !== null` → `health.liveness === "answering"`, killed by T003 (d).
  - `web/src/screens/setup/use-setup-state.ts`: the first-not-done search → `Math.min(4, lastDone + 1)`, killed by T003 (c).
  - `web/src/screens/setup/use-setup-state.ts`: the all-done fallback `4` → `1`, killed by T003 (a) row 5.
  - `web/src/screens/setup/use-setup-state.ts`: `listInstruments({ lifecycle: "active", limit: 1 })` → `listInstruments({ limit: 1 })`, killed by T005 (a).
  - `web/src/screens/setup/use-setup-state.ts`: set `{ kind: "loading" }` at the start of `reread`, killed by T005 (e).
  - `web/src/screens/setup/use-setup-state.ts`: `step4` blocked → `activeCount.kind !== "ok" || activeCount.data === 0`, killed by T005 (f).
  - `web/src/screens/setup/copy.ts`: `subLine` → the S02 §8 verbatim sentence, killed by T006 (b) and (c).
