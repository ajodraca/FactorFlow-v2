---
artifact_schema_version: 1
artifact_id: CAP-003-E4-S4-tasks
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
  timestamp: 2026-11-07T06:59:54Z
  source_artifacts:
    - id: CAP-003-E4-S4
      version: "1"
    - id: CAP-003-E4
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-setup-ui-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E4-S4 — Setup Step 4 and the Setup Screen: Start the First Download, Its Progress, the Blocked State and the Two Exits

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/first-run-setup/stories/CAP-003-E4-S4.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/screens/setup/`; design `setup-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Closes the setup screen on CAP-003-E4-S1's drafts, step state and copy, CAP-003-E4-S2's step list, step card and steps 1 and 2, and CAP-003-E4-S3's step 3. `step-download.tsx` is step 4, *Download data for {n} stocks*, rendered through `StepCard` with **← Back: Stocks to follow** and no **Continue**. It holds a `card` `summary` restating the key badge (step 1's rule, extracted from `step-market-data.tsx` as `KeyPresence`), *{y} years* and *{n}*, and **Start download**, which calls the delivered `startAcquisitionRun()` (`POST /api/acquisition-runs`). A `202` with `queued_behind` null calls `refresh("attention")`; the progress region then renders from the shell's attention read: the download's state through `StatusBadge`, `progress` `determinate` with *{done} of {total} stocks* (`indeterminate`, labelled by the state, while `total` is null), *Started {start time}*, *checked {time}* from the read's `checkedAt` and *You can leave; this keeps running.* A `202` with `queued_behind` set renders *A download is running. This starts when it finishes.* in place of the bar until the queued download leaves `requested`. Each `409` names its step with **Go to step 2** or **Go to step 3**. While attention fails the region reads *Progress can't be read right now* beside the state badge, never a bar. After *Add later* (`step4` `blocked`), **Start download** is `button` `blocked`, focusable and described by *No stocks are followed. Follow stocks before downloading.*, and **Go to Home** (`/home`) and **Manage followed stocks** (`/data/followed`) render as `outline` links; neither renders once the followed count is above 0 (AC-7, AC-15, AC-21, DAC-E4-8 to DAC-E4-10, DAC-E4-12). `index.tsx` is `SetupScreen` (default export, for the shell's `React.lazy`): the persistent `h1` *Get set up* and its sub-line, the two columns inside `LAYOUT.contentMaxWidth`, the step list or its skeleton, and the step card region rendered through `StateRegion` with the eight states recorded, re-deriving the steps on every mount through `useSetupState()` and reading the drafts it holds (setup-ui §2.1, §2.3, §10). The screen opens no interval of its own. Tests: `step-download.test.tsx` and `setup.test.tsx`; `copy.ts` gains two strings.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-2 | Every `202` makes setup complete; the shell's health read is refreshed so `/` opens Home at once | T009, T017 |
| AC-3 | Going back from step 4 to step 2 and forward again keeps every value | T010, T018 |
| AC-4 | The summary card restates key presence, never its value; *Not determinable* while health is not answering | T004, T007, T016, T017 |
| AC-7 | Start the first download from setup and leave; its progress shows while the owner stays | T002, T005, T009, T017 |
| AC-15 | A download already under way: the request is accepted and setup says it starts when the current one finishes | T002, T009, T017 |
| AC-21 | After *Add later*, the owner can leave with no download started | T006, T017 |
| AC-24 | Every setup region renders each of the eight states or records why one does not apply | T004, T011, T013, T018 |
| AC-25 | The polled progress shows its last-updated time; every operation is completable by keyboard | T005, T006, T010, T013, T017, T018 |
| AC-26 | Built from `ui-components`; tokens only; layout values from `layout.ts` | T013, T017, T018, T020 |
| DAC-E4-8 | Blocked step 4: **Start download** `blocked`, focusable, described, sends nothing; two exits; neither once `active_count` is above 0 | T006, T017 |
| DAC-E4-9 | **Start download** outcomes for `202` with and without `queued_behind` and each `409` | T002, T009, T017 |
| DAC-E4-10 | **Start download** is not blocked by a missing key | T003, T017 |
| DAC-E4-12 | Summary card restates three facts; progress while attention fails reads *Progress can't be read right now*, never a frozen bar | T004, T009, T014, T015, T017 |
| DAC-E4-S4-1 | *checked {time}* advances per attention answer; the `progressbar` is announced at the 10 s cadence; no interval of this screen's own | T005, T017, T018 |
| DAC-E4-S4-2 | Blocked **Start download** by keyboard sends nothing, reason through `aria-describedby`; exits are links reachable by Tab | T006, T017 |
| DAC-E4-S4-3 | `setup.test.tsx`: back from step 4 to step 2 and forward keeps the years text, the radio choice and the pasted text | T010, T018 |
| DAC-E4-S4-4 | Each step's eight states render as UX design §1.2 or are recorded not applicable with the reason, through `StateRegion` | T011, T018 |
| DAC-E4-S4-5 | No DAC-E7-3 term in step 4, the summary card or the screen in any state; labels from `labelOf` or `copy.ts` | T008, T012, T014, T015, T017, T018 |
| DAC-E4-S4-6 | Key badge and download state through `StatusBadge`, progress through `progress`, undeterminable values through `NotDeterminable`; nothing by colour alone | T007, T009, T016, T017 |

Mapped test cases (`tests/component/setup-ui-tests.md`; `tests/coverage-matrix.md` lines 208-212 and 228-233, per-story count "6 of 6" at line 415):

- **TC-COMP-101** (DAC-E4-9, AC-7, AC-15), **TC-COMP-102** (DAC-E4-10) and **TC-COMP-104** (DAC-E4-12): the epic criteria this story carries that no story-level criterion refines (coverage-matrix line 447).
- **TC-COMP-119** (DAC-E4-S4-1), **TC-COMP-120** (DAC-E4-S4-2, DAC-E4-8), **TC-COMP-121** (DAC-E4-S4-3), **TC-COMP-122** (DAC-E4-S4-4), **TC-COMP-123** (DAC-E4-S4-5), **TC-COMP-124** (DAC-E4-S4-6).

DAC-E4-8's *Add later* half (saves nothing, step 4 current with step 3 to do) is TC-COMP-115, CAP-003-E4-S3's; this story renders the blocked step 4 it leads to, and T011 drives the whole path through the composed screen. The setup-ui test specification and the coverage matrix are `status: draft`, the lowest rung of the precedence ladder; where a TC step is generic, the plan sharpens it from the story's criteria.

## Phase 1: Setup

**Purpose**: Confirm the upstream modules this story imports exist. No package, configuration or directory change.

- [ ] T001 From the repo root, confirm these exist in the working tree, then run `npm ci` and `npm run test` and record the suite green before any change (traces to no AC; prerequisite):
  - CAP-003-E4-S1: `web/src/screens/setup/draft.tsx` (`SetupDraftProvider`), `use-setup-state.ts` (`useSetupState`, `SetupState` with `current`, `done`, `step4`, `depth`, `activeCount`, `loading`, `goTo`, `reread`, `drafts`, `setDraft`; `StepId`) and `copy.ts` (`SCREEN`, `STEP_TITLES`, `STEP4`, `READ_ERRORS`).
  - CAP-003-E4-S2: `web/src/screens/setup/step-card.tsx` (`StepCard`, `STEP_HEADING_ID`, `useStepHeadingFocus`, `failureReason`), `step-list.tsx` (`StepList`), `step-market-data.tsx` (`StepMarketData`), `step-history-depth.tsx` (`StepHistoryDepth`); `copy.ts` with `READ_ERRORS.notAnswering` and `READ_ERRORS.unexpected`; `web/src/components/token-literals.test.ts` scanning `web/src/screens/setup/`.
  - CAP-003-E4-S3: `web/src/screens/setup/step-stocks.tsx` (`StepStocks`), `summarise-paste.ts`, `post-in-batches.ts`.
  - CAP-003-E1-S1: `web/src/components/ui/button.tsx` (`variant` `default`, `outline`, `ghost`, `blocked`; `asChild`) and `card.tsx` (`Card` `variant="summary"`, `CardSummaryList`).
  - CAP-003-E1-S3: `web/src/components/ui/progress.tsx` (`Progress({ value: number | null, max?: number | null, "aria-labelledby": string })`).
  - CAP-003-E1-S5: `web/src/components/patterns/tiers.ts` (`tierOf`, `labelOf`) and `status-badge.tsx` (`StatusBadge({ tier, children })`).
  - CAP-003-E1-S6: `web/src/components/patterns/presence.tsx` (`NotDeterminable({ reason, label? })`, `Absent({ label })`) and `format.ts` (`formatInstant`, `formatClock`, `formatCount`).
  - CAP-003-E1-S9: `web/src/components/patterns/state-region.tsx` (`StateRegion`, `StateRenderers`, `NotApplicable`).
  - CAP-003-E3-S1: `web/src/app/shell-types.ts` (`ReadState`, `Attention`). CAP-003-E3-S2: `web/src/app/layout.ts` (`LAYOUT`). CAP-003-E3-S3: `web/src/app/shell-context.tsx` (`useShell`, `ShellContextValue` with `refresh(kind)`).

**Checkpoint**: Every import below resolves, and the delivered suite and every upstream CAP-003 suite are green.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix step 4's outcomes, its progress region, its blocked state and the composed screen.

**Shared fixtures for `web/src/screens/setup/step-download.test.tsx`** (declared in the file as independent literals; no shared helper module, which would be a scanned non-test source):

- **Client mock.** `vi.mock("../../api/client", async (importActual) => ({ ...(await importActual()), startAcquisitionRun: vi.fn() }))`, the pattern of the delivered `web/src/screens/settings/history-depth-form.test.tsx:7`. `ApiError` and `ApiUnreachableError` stay real.
- **Shell mock.** `vi.mock("../../app/shell-context", () => ({ useShell: vi.fn() }))`. `setShell(overrides)` stores a full `ShellContextValue` literal (`health`, `attention`, `scores: { kind: "loading" }`, `refresh: vi.fn()`, `setTitleDetail: vi.fn()`) in a module-level `current` that `vi.mocked(useShell).mockImplementation(() => current)` returns; a test changes it and calls `rerender`.
- **Health fixtures**, as CAP-003-E4-S2's tests declare them: `HEALTH_FOUND` (`liveness: "answering"`, a full `HealthResponse` literal with `credential_present: true`, both times and `lastAnsweredAt` `new Date("2026-10-15T14:00:00.000Z")`), `HEALTH_MISSING` (the same with `credential_present: false`) and `HEALTH_UNREACHABLE_STALE_MISSING` (`liveness: "unreachable"`, the `HEALTH_MISSING` `health` retained, `lastAnsweredAt` kept). Every `HealthResponse` literal carries the planted `api_key: "SENTINEL-KEY-VALUE"` (cast through `unknown`).
- **Attention fixtures.** `ATTENTION_BASE` is a full `Attention` literal with `latest_download: null`. `download(over)` returns `{ run_id: "r-2", state: "running", requested_at: "2026-10-15T14:29:00Z", started_at: "2026-10-15T14:30:00Z", ended_at: null, progress: { done: 812, total: 1236 }, ...over }`. `ok(latest, checkedAt = new Date("2026-10-15T14:31:12Z"))` gives `{ kind: "ok", data: { ...ATTENTION_BASE, latest_download: latest }, checkedAt }`. `failing(last)` gives `{ kind: "error", error: new ApiUnreachableError("x"), last }`.
- **State literal.** `stateWith(overrides)` returns a full `SetupState` literal: `current: 4`, `done: { 1: true, 2: true, 3: true, 4: false }`, `step4: "ready"`, `drafts` (an independent literal), `depth` `{ kind: "ok", data: { years: 12, updatedAt: "2026-10-15T13:00:00Z" }, checkedAt }`, `activeCount` `{ kind: "ok", data: 1236, checkedAt }`, `loading: false`, and `goTo`, `reread`, `setDraft` as `vi.fn()`.
- **Render.** `renderStep(state)` renders `<MemoryRouter initialEntries={["/setup"]}><Routes><Route path="/setup" element={<StepDownload state={state} />} /><Route path="*" element={<LocationProbe />} /></Routes></MemoryRouter>`, where `LocationProbe` renders `useLocation().pathname` in `data-testid="location"`.
- **Answers.** `accepted(queuedBehind)` resolves `startAcquisitionRun` with `{ runId: "r-2", state: "requested", queuedBehind }`; `refused(code)` rejects it with `new ApiError("x", "req-1", { code })`; `deferred()` returns a promise with its `resolve` and `reject`.
- **Vocabulary helper.** `visibleAndAccessibleText(container)` joins `container.textContent` with every `aria-label` and `title` value and the text of every element an `aria-labelledby` or `aria-describedby` id refers to (CAP-003-E4-S2's helper). `FORBIDDEN = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-101 (Start download outcomes: progress, queued line, each 409) in a new `web/src/screens/setup/step-download.test.tsx`, with a `// Implements TC-COMP-101` comment. `HEALTH_FOUND`, attention `ok(null)`, `stateWith()`. Cases:
  - (a) **`202`, `queued_behind` null (TC step 1).** `accepted(null)`; click **Start download**. `refresh` was called with `"attention"` exactly once and with `"health"` exactly once (DEC-0360). Then `setShell({ attention: ok(download()) })` and `rerender`:
    - `getByRole("progressbar", { name: "812 of 1,236 stocks" })` has `aria-valuenow="812"`, `aria-valuemin="0"`, `aria-valuemax="1236"` and `data-variant="determinate"`;
    - the texts *Started 2026-10-15 09:30 CDT*, *checked 09:31:12 CDT* and *You can leave; this keeps running.* are present (exact `getByText`).
  - (b) **Total unknown.** The same with `download({ state: "requested", started_at: null, progress: { done: 0, total: null } })`: the progressbar's accessible name is exactly *Queued* (the state's label; DEC-0356), it has no `aria-valuenow` and `data-variant="indeterminate"`; `queryByText(/\d+ of [\d,]+ stocks/)` and `queryByText(/null/)` are `null`; *Started 2026-10-15 09:29 CDT* is present (the request time while `started_at` is null).
  - (c) **`202`, `queued_behind` set (TC step 2).** `accepted("r-1")`; click. `getByRole("status")` has text exactly *A download is running. This starts when it finishes.*; `queryByRole("progressbar")` is `null`; `refresh` was not called with `"attention"` (setup-ui §2.3: only the null case refreshes) and was called once with `"health"`.
    - With `ok(download({ run_id: "r-1", state: "running" }))` (the download it waits behind): the queued line stays and no progressbar renders.
    - With `ok(download({ state: "requested", started_at: null, progress: { done: 0, total: null } }))` (this download, still waiting): the queued line stays and no progressbar renders.
    - With `ok(download())` (this download now `running`): the queued line is gone and the progressbar *812 of 1,236 stocks* renders.
  - (d) **`409 history_depth_not_set` (TC step 3).** `refused("history_depth_not_set")`; click. `getByRole("alert")` contains the exact text *Couldn't start the download: history depth isn't set.* and `getByRole("link", { name: "Go to step 2" })` with `href` `"#setup-step-heading"`; clicking it calls `goTo` once with `2`. No progressbar; `refresh` not called.
  - (e) **`409 no_active_instruments` (TC step 4).** `refused("no_active_instruments")`: *Couldn't start the download: no stocks are followed.* with **Go to step 3**, which calls `goTo(3)`.

  Kills:
  - negate-boolean on `queuedBehind === null` before `refresh("attention")`: (a) and (c) count `"attention"` calls.
  - swap-case of the two `409` codes in the refusal mapping: (d) and (e) name the wrong step.
  - off-by-one on the step a refusal links to (`goTo(2)` → `goTo(3)`): (d).
  - swap-case `started_at ?? requested_at` → `requested_at ?? started_at`: (a) reads *09:29*.
  - a hand-written mutant that renders the bar while this download is still `requested` behind another: (c) second row.

- [ ] T003 [P] Implement TC-COMP-102 (A missing key does not block Start download) in `web/src/screens/setup/step-download.test.tsx`, sequential with T002 (one file), with a `// Implements TC-COMP-102` comment. `HEALTH_MISSING`, `stateWith()` (depth 12, count 1236), `accepted(null)`.
  - **TC step 1.** `getByRole("button", { name: "Start download" })` has `data-variant="default"`, no `aria-disabled` and no `aria-describedby`; the summary card shows *Missing*.
  - **TC step 2.** Clicking it calls `startAcquisitionRun` exactly once, with no argument (`toHaveBeenCalledWith()`).
  - The same with `HEALTH_UNREACHABLE_STALE_MISSING`: still `default` and one call.

  Kills: a hand-written mutant that sets `blocked` when `credential_present` is `false` (DEC-0203 reversed): both rows.

- [ ] T004 [P] Implement TC-COMP-104 (Step 4 summary card restates key, depth and count; progress unreadable state) in `web/src/screens/setup/step-download.test.tsx`, sequential with T003, with a `// Implements TC-COMP-104` comment.
  - **TC step 1, the card.** The `card` is `[data-variant="summary"]` holding one `dl`. `getAllByRole("term")` texts are, in order, *Market data key*, *History depth*, *Followed stocks*. The matching `definition`s:
    - with `HEALTH_FOUND`: a `[data-variant="status-good"]` badge with text exactly *Found*; with `HEALTH_MISSING`: `[data-variant="status-critical"]` *Missing*; with `HEALTH_UNREACHABLE_STALE_MISSING`: `[data-variant="coverage-unknown"]` *Not determinable*, no *Missing* anywhere (step 1's rule; CAP-003-E4-S2's DEC-0349);
    - *12 years*;
    - *1,236*.
    `container.innerHTML` never contains `SENTINEL-KEY-VALUE`.
  - **TC step 2, attention failing.** Attention `failing({ data: { ...ATTENTION_BASE, latest_download: download() }, checkedAt })`: the progress region shows a `[data-variant="status-active"]` badge *Downloading* and, beside it, the exact text *Progress can't be read right now*. `queryByRole("progressbar")` is `null`, and no element's text is *812 of 1,236 stocks*: no frozen bar and no stale count presented as current.

  Kills:
  - a hand-written mutant that renders the bar from `error.last` while the read fails: step 2.
  - a hand-written mutant that writes the key verdict from `credential_present` without checking `liveness`: step 1 third row.
  - swap-case of the depth and count rows: step 1 (*1,236 years*).
  - a hand-written mutant that renders `String(count)` instead of `formatCount(count)`: step 1 (*1236*).

- [ ] T005 [P] Implement TC-COMP-119 (Progress checked time advances per attention answer; no own interval) in `web/src/screens/setup/step-download.test.tsx`, sequential with T004, with a `// Implements TC-COMP-119` comment.
  - **Harness.** Before rendering, `vi.spyOn(window, "setInterval")` and `vi.spyOn(window, "requestAnimationFrame")`. Drive the click with `fireEvent.click` (user-event schedules its own timers). `accepted(null)`; click; `await` the settled promise.
  - **TC step 1, three answers.** For `i` of 1, 2, 3: `setShell({ attention: ok(download({ progress: { done: 812 + i, total: 1236 } }), new Date(Date.parse("2026-10-15T14:31:12Z") + 10_000 * i)) })` and `rerender`. After each: the text *checked 09:31:22 CDT*, *09:31:32 CDT*, *09:31:42 CDT* in turn, and the progressbar's name *813 of 1,236 stocks*, *814 …*, *815 …*.
  - **Announced per answer, never per frame.** The element whose `id` the progressbar's `aria-labelledby` names has `aria-live="polite"`; the progressbar itself has no `aria-live`. A `MutationObserver` (`childList`, `characterData`, `subtree`) attached to that element before the first answer records exactly 3 text changes after the three answers. One more `rerender` with the same attention object adds 0.
  - **TC step 2, no interval.** `setInterval` and `requestAnimationFrame` were called 0 times.

  Kills:
  - a hand-written mutant that formats `checked` from the wire's `checked_at` instead of the read's `checkedAt` (the fixture's `checked_at` is a fixed literal that never advances): step 1.
  - a hand-written mutant that adds a one-second ticker re-rendering the label: the spy and the mutation count.
  - remove-attribute of `aria-live` on the label: the attribute check.

- [ ] T006 [P] Implement TC-COMP-120 (Blocked step 4 sends nothing by keyboard; exits reachable by Tab) in `web/src/screens/setup/step-download.test.tsx`, sequential with T005, with a `// Implements TC-COMP-120` comment. `stateWith({ step4: "blocked", activeCount: { kind: "ok", data: 0, checkedAt }, done: { 1: true, 2: true, 3: false, 4: false } })`.
  - **TC step 1.** `user.tab()` from `body` focuses `getByRole("button", { name: "Start download" })` (the summary card holds no tab stop). It has `data-variant="blocked"`, `aria-disabled="true"` and is not `toBeDisabled()`. `user.keyboard("{Enter}")`, `user.keyboard(" ")` and a click leave `startAcquisitionRun` uncalled.
  - **TC step 2.** It `toHaveAccessibleDescription("No stocks are followed. Follow stocks before downloading.")`, and that sentence is visible text beside it.
  - **TC step 3.** A second `user.tab()` focuses `getByRole("link", { name: "Go to Home" })` (`href` `"/home"`, `data-variant="outline"`); a third focuses `getByRole("link", { name: "Manage followed stocks" })` (`href` `"/data/followed"`, `data-variant="outline"`). `{Enter}` on **Manage followed stocks** makes `location` read `/data/followed`; in a fresh render, `{Enter}` on **Go to Home** makes it read `/home`.
  - **TC edge case.** `stateWith()` (`step4` `"ready"`, count 1236): neither link renders, **Start download** is `default`, and the blocked sentence is absent. The exits key on `step4` alone, CAP-003-E4-S1's derivation from the count.
  - **Back stays.** In the blocked state `getByRole("button", { name: "← Back: Stocks to follow" })` calls `goTo` once with `3`.

  Kills:
  - negate-boolean on `state.step4 === "blocked"` for the exits: the edge case and step 3.
  - swap-case of the two link targets: step 3's `href` checks.
  - a hand-written mutant that renders **Start download** with native `disabled`: step 1 (not focusable, `toBeDisabled`).
  - drop-field-copy on the reason's `id` in `aria-describedby`: step 2.

- [ ] T007 [P] Implement TC-COMP-124 (Summary key badge, download state and progress carry shape) in `web/src/screens/setup/step-download.test.tsx`, sequential with T006, with a `// Implements TC-COMP-124` comment. Attention `ok(download())` with no local start (a download already exists):
  - (a) **Key badge.** For `HEALTH_FOUND` and `HEALTH_MISSING`, the summary card's `status-*` badge text is exactly the label, it contains an `svg[aria-hidden="true"]`, and neither the badge nor the `svg` carries `aria-label` or `title`.
  - (b) **Download state.** The progress region's `[data-variant="status-active"]` badge reads exactly *Downloading* (`labelOf({ of: "download", state: "running" })`) with an `svg[aria-hidden="true"]`. `it.each` over the eight `RunState` values: the badge's `data-variant` is `` `status-${tierOf({ of: "download", state })}` `` and its text `labelOf(...)`, compared with the independent literal table of CAP-003-E1-S5 (*Queued* neutral, *Downloading* active, *Stopping* warning, *Complete* good, *Partial* warning, *Failed* critical, *Cancelled by you* neutral, *Interrupted* serious).
  - (c) **Not determinable.** With `HEALTH_UNREACHABLE_STALE_MISSING`, the key's `coverage-unknown` badge `toHaveAccessibleDescription("FactorFlow isn't answering, so the key can't be checked.")` and no `[data-variant^="status-"]` badge sits in the summary card.
  - (d) **Progress.** The progressbar's name equals the visible text of the element its `aria-labelledby` names.
  - (e) **Not by colour alone.** Every `[data-variant]` badge in every row above has non-empty text.

  Kills:
  - a hand-written mutant that renders the download state as a bare `span` with the status colour class: (b), no `data-variant` badge and no `svg`.
  - swap-case of `tierOf`'s argument (`{ of: "download", state: "requested" }` for every state): (b) rows.

- [ ] T008 Implement TC-COMP-123, step 4 half (Step 4, summary card and setup screen use the display vocabulary) in `web/src/screens/setup/step-download.test.tsx`, sequential with T007, with a `// Implements TC-COMP-123` comment. CAP-003-E4-S4's screen half is T012.
  - (a) **Non-vacuity.** `FORBIDDEN` matches the planted `"one run"`, `"Runs"`, `"Retired"`, `"Instrument"`, `"acquire"`, `"Start acquisition"` and `"Provider credential"`, and does not match `"You can leave; this keeps running."` or `"Start download"`.
  - (b) **Every state of step 4** (`it.each`), each asserting `visibleAndAccessibleText(container)` does not match `FORBIDDEN`:
    1. ready, no download; 2. blocked with both exits; 3. after a `202` with each of the eight `RunState` values in attention (badge labels, bar or no bar); 4. indeterminate; 5. queued; 6. each `409`, with the `ApiError` `message` planted as *every instrument run was refused* (never rendered); 7. a start failure with `ApiUnreachableError` and with `ApiError` `internal_error` (DEC-0357); 8. attention failing with and without `last`; 9. the summary card with `HEALTH_UNREACHABLE_STALE_MISSING`, a failed depth read and a failed count read (DEC-0358).
  - (c) **Labels from the catalogue.** In row 3 every badge text equals `labelOf({ of: "download", state })`; the button and link names equal `STEP4.start`, `STEP4.goHome`, `STEP4.manageFollowed`, `STEP4.goToStep2`, `STEP4.goToStep3`.

  Kills: a hand-written mutant that renders the refusal's `ApiError.message`: row 6.

### Additional Unit Tests

- [ ] T009 Write step 4's own cases in `web/src/screens/setup/step-download.test.tsx`, sequential with T008 (AC-2, AC-7, AC-15, DAC-E4-9, DAC-E4-12, DAC-E4-S4-6; DEC-0356 to -3 and -5):
  - (a) **Before attention shows this download** (DEC-0356). After `accepted(null)` with attention still `ok(null)`: a `[data-variant="status-neutral"]` badge *Queued*, an indeterminate progressbar named *Queued*, *You can leave; this keeps running.*, and neither a *Started* nor a *checked* text. The same with attention `ok(download({ run_id: "r-1", state: "succeeded", ended_at: "2026-10-14T20:00:00Z" }))` (an older download): still *Queued*, never *Complete*.
  - (b) **A download already exists** (no local start). `it.each` over the three non-terminal states: a progressbar and *You can leave; this keeps running.* render. `it.each` over the five terminal states (`succeeded`, `partial`, `failed`, `cancelled`, `abandoned`, with `ended_at` set): the state badge, *Started …* and *checked 09:31:12 CDT* render; no progressbar and no *You can leave* line.
  - (c) **Attention failing with no last answer.** After `accepted(null)` with `failing(null)`: badge *Queued* and *Progress can't be read right now*; no progressbar. With `failing(null)` and no local start: no progress region (no download badge, no unreadable line). With attention `{ kind: "loading" }` and no local start: no progress region.
  - (d) **Other start failures** (DEC-0357). `startAcquisitionRun` rejects with `new ApiUnreachableError("x")`: `getByRole("alert")` reads exactly *Couldn't start the download: FactorFlow is not answering*. With `new ApiError("an instrument run failed", "req-5", { code: "internal_error" })` and with `{ code: "something_else" }`: *Couldn't start the download: FactorFlow hit an unexpected problem*. In each, `refresh` was not called, **Start download** stays `default`, and a second click calls `startAcquisitionRun` a second time. The message and request id are nowhere in the document.
  - (e) **One request at a time; Start stays** (DEC-0357). With the first call held by a `deferred()`, a second click adds no call. After it resolves `accepted(null)`, the button is still `default`, and a third click calls again (a later start is accepted and queued by the server, AC-15); after that call resolves with `queuedBehind: "r-2"` and `runId: "r-3"`, the queued line renders.
  - (f) **A new attempt clears the old outcome.** After `refused("no_active_instruments")`, a second click that answers `accepted(null)` leaves no `alert`.
  - (g) **Question** (DEC-0358). `getByRole("heading", { level: 2 })` reads *Download data for 1,236 stocks*. With `activeCount` `{ kind: "error", error: new ApiUnreachableError("x"), last: null }` it reads *Download data*, and **Start download** is `default` (an unknown count does not block; CAP-003-E4-S1's DEC-0344).
  - (h) **Unknown summary facts** (DEC-0358). `depth` `{ kind: "error", error: new ApiUnreachableError("x"), last: null }`: the *History depth* definition holds a `coverage-unknown` badge *Not determinable* described by *Couldn't read history depth: FactorFlow is not answering*. `activeCount` failing with `new ApiError("x", "r", { code: "internal_error" })`: the *Followed stocks* definition is *Not determinable* described by *Couldn't read the followed list: FactorFlow hit an unexpected problem*. `depth` `ok` with `years: null`: the definition holds an `aria-hidden` *—* and the visually hidden text *History depth isn't set*.
  - (i) **The card's frame.** No **Continue** button and no *Next:* text render; *Step 4 of 4* is present; the region is named by the `h2`.
  - (j) **Health refresh on every `202`** (DEC-0360). `accepted(null)` and `accepted("r-1")` each call `refresh("health")` once; each `409` and each failure calls it 0 times.

  Kills:
  - negate-boolean on the terminal-state guard for the bar: (b).
  - a hand-written mutant that shows the pending view only while `latest_download` is null (not when it names another download): (a) second row.
  - swap-case of `failureReason`'s two outcomes: (d).
  - a hand-written mutant that drops the in-flight guard: (e) call count.
  - a hand-written mutant that leaves **Start download** `blocked` after a `202`: (e).
  - drop-field-copy on the outcome reset at the start of a new attempt: (f).
  - a hand-written mutant that renders `STEP4.downloadFor("0")` for an unknown count: (g).
  - a hand-written mutant that calls `refresh("health")` only when `queuedBehind` is null: (j).

**Shared harness for `web/src/screens/setup/setup.test.tsx`** (T010–T013): the real `useSetupState`, `SetupDraftProvider` and every step component, with `vi.mock("../../api/client", …)` replacing `getHistoryDepth`, `listInstruments`, `setHistoryDepth`, `addInstruments` and `startAcquisitionRun` with `vi.fn()` (`ApiError`, `ApiUnreachableError` real), the shell mocked as above, and the real `parseBulkSymbols`. `renderScreen()` renders `<SetupDraftProvider><MemoryRouter initialEntries={["/setup"]}><Routes><Route path="/setup" element={<SetupScreen />} /><Route path="*" element={<LocationProbe />} /></Routes></MemoryRouter></SetupDraftProvider>`, `SetupScreen` being the default import of `./index`. `depthAnswers(...years)` and `countAnswers(...n)` queue `mockResolvedValueOnce` answers in order. `HEALTH_OK` is `HEALTH_FOUND`; `HEALTH_UNREACHABLE_NEVER` is `{ liveness: "unreachable", health: null, lastUpdated: <a Date>, lastAnsweredAt: null }`.

### Mandatory Component Tests

- [ ] T010 [P] Implement TC-COMP-121 (Going back from step 4 to step 2 and forward keeps every value) in a new `web/src/screens/setup/setup.test.tsx`, with a `// Implements TC-COMP-121` comment. `HEALTH_OK`, attention `ok(null)`; `depthAnswers(null, 7, 7)`, `countAnswers(0, 2, 2)`; `setHistoryDepth` resolves `{ years: 7, updatedAt: "…" }`; `addInstruments` resolves `{ added: [<AAPL>, <MSFT>], reactivated: [], rejected: [] }` first and rejects with `new ApiError("x", "r", { code: "all_duplicate" })` after.
  - **Precondition: values on steps 2 to 4.** Await *How far back should history go?*. Type `7`, **Continue**. On step 3 choose *Paste a list*, paste `"AAPL, MSFT"`, tab, **Continue**. Await *Download data for 2 stocks*.
  - **TC step 1, back to step 2.** **← Back: Stocks to follow**: the radio *Paste a list* is checked and the textarea's value is `"AAPL, MSFT"`. Append `", NVDA"` without continuing. **← Back: How far back**: the spinbutton *History depth years* has value `7`. Change it to `9` without continuing.
  - **TC step 2, forward again.** Activate the step list's link *Stocks to follow, done*: *Paste a list* is checked and the textarea reads `"AAPL, MSFT, NVDA"` (unsaved, kept). Activate *How far back, done*: the field reads `9` (unsaved, kept). **Continue** (saves 9), then on step 3 **Continue** again: `addInstruments` answers `409`, treated as success (CAP-003-E4-S3), and step 4 is current again.
  - **Expected.** At every return the years text, the radio choice and the pasted text are as last entered; `setHistoryDepth` was called with `7` then `9`; nothing was written to `localStorage` or `sessionStorage` (both `length` 0).

  Kills:
  - a hand-written mutant that binds step 3's textarea to component state instead of the `pasted` draft: TC step 2 (the unsaved *NVDA* is lost when step 3 remounts).
  - a hand-written mutant that resets `yearsText` when step 2 mounts: TC step 1.

- [ ] T011 Implement TC-COMP-122 (Each step's eight states render or are recorded not applicable) in `web/src/screens/setup/setup.test.tsx`, sequential with T010, with a `// Implements TC-COMP-122` comment (DEC-0359). One `describe.each` over steps 1 to 4 and one `it` per state, each either asserting the rendering through the composed screen or asserting the record:
  - **Loading (every step).** `getHistoryDepth` held by a `deferred()`: an element with `aria-busy="true"` holds the card skeleton; no `region` and no `navigation` named *Setup steps* render; the `h1` *Get set up* is present.
  - **Never populated.** `HEALTH_UNREACHABLE_NEVER`, `depthAnswers(null)`, `countAnswers(0)`, attention `ok(null)`: the region *Connect market data* is current and the step list shows no done link. Steps 2 to 4 assert the record: the step 1 card is what renders while nothing is done.
  - **Nothing found.** Step 3: choose *Paste a list* with an empty field; **Continue** has `data-variant="blocked"` described by *Paste at least one symbol, or choose Add later.* Step 4: `HEALTH_OK`, `depthAnswers(5)`, `countAnswers(0)`; choose *Add later*, **Continue**: **Start download** is `blocked` with both exits, and the step list shows *Stocks to follow* to do. Steps 1 and 2: `cardRenderers(state)["empty-no-match"]` is `{ notApplicable: <non-empty string> }`.
  - **Partial.** Step 3: paste `"KO, KO, ZZZZ!, AAPL"`, tab: *2 symbols recognised, 1 duplicates, 1 not recognised* with *KO, listed more than once* and *ZZZZ!, not a valid symbol format*. Steps 1, 2 and 4: `screenStateOf` of a state with steps 1 and 2 done is `kind` `"partial"` and the screen renders the current step's card.
  - **Stale (every step).** Not a `ScreenState` kind (CAP-003-E1-S9 Resolved Conflict 2): `readFileSync` of `index.tsx` (resolved from `import.meta.url`) contains the line `Stale: not applicable` in its module comment; step 4's polled progress carries *checked {time}* (T005).
  - **Unavailable.** Step 1: `HEALTH_UNREACHABLE_STALE_MISSING`, `depthAnswers(5)`, `countAnswers(3)`; activate *Market data, done*: `coverage-unknown` *Not determinable*, never *Missing*. Step 4: `depthAnswers(5)`, `countAnswers(3)`, attention `failing({ data: <running download>, checkedAt })`: *Progress can't be read right now* and no progressbar. Steps 2 and 3: `cardRenderers(state).unavailable` is `{ notApplicable: … }`.
  - **Error.** Step 2: `getHistoryDepth` rejects with `ApiError` `internal_error`: *Couldn't read history depth: FactorFlow hit an unexpected problem* with **Try again** inside the region *How far back should history go?*, and the step list holds no *Couldn't read* text. Step 3: `listInstruments` rejects with `ApiUnreachableError` and `depthAnswers(5)`: *Couldn't read the followed list: FactorFlow is not answering* in step 3 only. Step 4: `startAcquisitionRun` refuses `history_depth_not_set`: the refusal with **Go to step 2**. Step 1: `cardRenderers(state).error` is `{ notApplicable: … }`.
  - **Unreachable (every step).** `cardRenderers(state).unreachable` is `{ notApplicable: … }`.
  - **`screenStateOf` table.** With a fixed `now`: `loading: true` gives `{ kind: "loading" }`; no step done gives `{ kind: "empty-never-populated" }`; some done gives `{ kind: "partial", data: state, fetchedAt: now.toISOString() }`; all four done gives `populated`. No input yields `error`, `unavailable`, `empty-no-match` or `unreachable`.

  Kills:
  - swap-case `empty-never-populated` ↔ `partial` in `screenStateOf`: the table.
  - negate-boolean on the all-done test (`every` → `some`): the table's partial row.
  - a hand-written mutant that renders `error` through `StateRegion`'s own wrapper: step 2's error row would hold a second **Try again** (`getAllByRole("button", { name: "Try again" })` has length 1).

- [ ] T012 Implement TC-COMP-123, screen half in `web/src/screens/setup/setup.test.tsx`, sequential with T011, with a `// Implements TC-COMP-123` comment, using T008's helper declared again in this file. Rows: loading; never populated; step 2 current with two done links; step 4 current with the blocked exits after *Add later*; all four done with a running download. Each asserts `visibleAndAccessibleText(container)` does not match `FORBIDDEN`, and the `h1` and sub-line equal `SCREEN.title` and `SCREEN.subLine` (*About 10 minutes, then the data download continues on its own. You can leave and come back.*, CAP-003-E4-S1's DEC-0341).

  Kills: a hand-written mutant that types the S02 §8 sub-line into `index.tsx` instead of reading `SCREEN.subLine`: every row (*runs*).

### Additional Unit Tests

- [ ] T013 Write the screen's own cases in `web/src/screens/setup/setup.test.tsx`, sequential with T012 (AC-24, AC-25, AC-26; owner-shell §2.7; CAP-003-E3-S6's focus rule; setup-ui §2.1, §10):
  - (a) **The `h1` persists across loading.** With the reads held by `deferred()`s, capture `const heading = getByRole("heading", { level: 1, name: "Get set up" })`; it has `tabIndex` `-1`. Resolve the reads: the `h1` is the same element (`toBe(heading)`), so the shell's focus on it is not lost.
  - (b) **No focus moved on entry.** Call `heading.focus()` while loading (the shell's move). Resolve the reads to `HEALTH_OK`, `depthAnswers(null)`, `countAnswers(0)`: `document.activeElement` is still `heading`, not the step 2 `h2` (CAP-003-E4-S2 Resolved Conflict 1).
  - (c) **Focus on a step change.** Then activate *Market data, done*: the active element is the `h2` *Connect market data*.
  - (d) **Each step renders its own component.** With the facts set for current 1, 2, 3 and 4 in turn: the region is named *Connect market data*, *How far back should history go?*, *Which stocks do you want to follow?* and *Download data for 12 stocks*.
  - (e) **Layout values.** The screen's root has `style.maxWidth` `"1180px"` and the class `gap-6`; the left column has `style.minWidth` `"260px"` and `style.maxWidth` `"300px"`; in the loading state each skeleton dot has `style.width` `"28px"`. The list skeleton has `aria-hidden="true"`. These test files may hold the values; the layout rule scans non-test sources only.
  - (f) **No provider of its own.** Rendering `SetupScreen` without a `SetupDraftProvider` above it throws an error naming `SetupDraftProvider` (CAP-003-E4-S1's `useSetupDrafts` guard), so the screen never mounts one (CAP-003-E4-S6 mounts it in the shell).
  - (g) **Re-derived on every mount.** Unmount and render again: `getHistoryDepth` and `listInstruments` have 2 calls each.

  Kills:
  - a hand-written mutant that passes the `h1` through `StepList`'s `header` slot and renders the skeleton without it: (a)'s `toBe`.
  - a hand-written mutant that calls `useStepHeadingFocus` in `SetupScreen` instead of the loaded body: (b), where the derived step changes from 1 to 2 when the reads settle and the `h2` takes focus.
  - swap-case `LAYOUT.contentMaxWidth` → `LAYOUT.sideColumnMax`: (e).
  - swap-case of the current-step dispatch (step 3 rendering `StepDownload`): (d).

- [ ] T014 [P] Add rows for this story's two new strings to the completeness table of `web/src/screens/setup/copy.test.ts` (CAP-003-E4-S1's T007), each against an independent literal: `["STEP4.startFailed", ["FactorFlow is not answering"], "Couldn't start the download: FactorFlow is not answering"]` (DEC-0357) and `["STEP4.depthAbsent", [], "History depth isn't set"]` (DEC-0358). CAP-003-E4-S1's T006 then scans both with every other export and the file's text, unchanged. Kills: drop-field-copy on either: its row.

**Checkpoint**: T002–T014 exist and fail for the right reason: `step-download.tsx` and `index.tsx` are missing, `KeyPresence` is not exported, and the two copy strings are missing. Every delivered and upstream test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The copy strings, the shared key verdict, step 4 and the screen, each in its own TDD cycle. Every module's comments cite AC, DAC and TC in the style of the delivered `status-region.tsx`; none writes a length, a colour, a layout value or one of the eight DAC-E7-3 terms (no *run* or *runs* in a comment; identifiers such as `startAcquisitionRun`, `run_id` and `RunState` are single words a whole-word scan does not split).

- [ ] T015 Add two strings to `web/src/screens/setup/copy.ts` (T014 RED first), each with a doc comment saying CAP-003-E4-S4 adds it and which decision gives its wording, as `copy.ts`'s module comment provides: `STEP4.startFailed(reason: string)` → `` `Couldn't start the download: ${reason}` `` (DEC-0357) and `STEP4.depthAbsent` *History depth isn't set* (DEC-0358). `copy.ts` keeps importing nothing and exporting no number or boolean. Makes T014 pass.

- [ ] T016 Extract step 1's key verdict in `web/src/screens/setup/step-market-data.tsx` (CAP-003-E4-S2's file; T004 and T007 RED first). Export `KeyPresence(): JSX.Element`, which reads `useShell().health` and returns, exactly as `StepMarketData`'s verdict does today, `<StatusBadge tier={tierOf(status)}>{labelOf(status)}</StatusBadge>` with `status = { of: "credential", present: health.health.credential_present }` when `health.liveness === "answering"` and `health.health` is not null, otherwise `<NotDeterminable reason={STEP1.notAnswering} />` (DAC-E4-S2-2; CAP-003-E4-S2's DEC-0349). `StepMarketData` renders `<KeyPresence />` in place of its inline verdict and keeps every other line. Doc comment: step 4's summary card repeats step 1's badge (setup-ui §10 step 4; UX design §1.2 *step 1's badge repeated*), so the rule lives once. CAP-003-E4-S2's `step-market-data.test.tsx` passes unchanged: a behaviour-preserving extraction.

- [ ] T017 Create `web/src/screens/setup/step-download.tsx` (depends on T015, T016; T002–T009 RED first).
  - **Imports.** `useId`, `useRef`, `useState` from `"react"`; `Link` from `"react-router-dom"`; `startAcquisitionRun`, `ApiError`, `ApiUnreachableError` from `"../../api/client"`; `type RunState` from `"../../api/types"`; `useShell` from `"../../app/shell-context"`; `type Attention` from `"../../app/shell-types"`; `Button` from `"../../components/ui/button"`; `Card`, `CardSummaryList` from `"../../components/ui/card"`; `Progress` from `"../../components/ui/progress"`; `StatusBadge` from `"../../components/patterns/status-badge"`; `tierOf`, `labelOf` from `"../../components/patterns/tiers"`; `NotDeterminable`, `Absent` from `"../../components/patterns/presence"`; `formatClock`, `formatCount`, `formatInstant` from `"../../components/patterns/format"`; `type SetupState` from `"./use-setup-state"`; `STEP_TITLES`, `STEP4`, `READ_ERRORS` from `"./copy"`; `StepCard`, `STEP_HEADING_ID`, `failureReason` from `"./step-card"`; `KeyPresence` from `"./step-market-data"`.
  - **Module comment.** Step 4 (setup-ui §2.3 *Step 4* and *Add later*, §10; UX design §1.2; DAC-E4-8 to DAC-E4-10, DAC-E4-12). It opens no interval and no animation frame: the progress follows the shell's attention cadence (setup-ui §5; DAC-E4-S4-1).
  - **`StepDownload({ state }: { state: SetupState }): JSX.Element`.** Reads `const { attention, refresh } = useShell()`. Local state: `ours: { runId: string; queuedBehind: string | null } | null` (this visit's last `202`); `outcome: { kind: "refused"; step: 2 | 3 } | { kind: "failed"; reason: string } | null`; a `starting` `useRef(false)` guard.
  - **Start** (`onClick`; the `blocked` `Button` never calls it, DAC-E1-15):
    - return when `starting.current`; set it; `setOutcome(null)`.
    - `const result = await startAcquisitionRun()`; `setOurs({ runId: result.runId, queuedBehind: result.queuedBehind })`; `refresh("health")` (DEC-0360); `refresh("attention")` only when `result.queuedBehind === null` (DAC-E4-9; setup-ui §2.3).
    - On an `ApiError` whose `code` is `"history_depth_not_set"`: `{ kind: "refused", step: 2 }`; `"no_active_instruments"`: `{ kind: "refused", step: 3 }` (the delivered `src/factorflow/api/routes/runs.py:87,96`). Any other `ApiError` or an `ApiUnreachableError`: `{ kind: "failed", reason: failureReason(error) }` (DEC-0357). Anything else is rethrown.
    - `finally` clears `starting.current`.
  - **Render.** `<StepCard step={4} question={question} onBack={() => state.goTo(3)}>`, no `onContinue` (setup-ui §10: step 4 has no **Continue**), holding in order:
    - `question` is `STEP4.downloadFor(formatCount(state.activeCount.data))` when `state.activeCount.kind === "ok"`, else `STEP_TITLES[4]` (DEC-0358).
    - **Summary card** (DAC-E4-12): `<Card variant="summary" className="p-4"><CardSummaryList>` with `<dt>{STEP4.summaryKey}</dt><dd><KeyPresence /></dd>`, `<dt>{STEP4.summaryDepth}</dt><dd>{depthValue}</dd>`, `<dt>{STEP4.summaryFollowed}</dt><dd>{countValue}</dd>`. `depthValue`: `STEP4.yearsValue(String(years))` for `ok` with `years` not null; `<Absent label={STEP4.depthAbsent} />` for `ok` with `years` null; `<NotDeterminable reason={READ_ERRORS.readFailed(READ_ERRORS.subjects.depth, failureReason(error))} />` for `error`; `null` for `loading` (the screen shows its skeleton then). `countValue`: `formatCount(n)` for `ok`; `NotDeterminable` with `READ_ERRORS.subjects.followed` for `error`; `null` for `loading` (DEC-0358).
    - **Start row**: `<div className="flex flex-wrap items-center gap-3">` with `<Button variant={blocked ? "blocked" : "default"} aria-describedby={blocked ? reasonId : undefined} onClick={blocked ? undefined : () => void start()}>{STEP4.start}</Button>` and, when `blocked`, `<p id={reasonId} className="text-xs text-muted-foreground">{STEP4.blockedReason}</p>`. `blocked` is `state.step4 === "blocked"` (DAC-E4-8; CAP-003-E4-S1's derivation). A missing key never sets it (DAC-E4-10).
    - **Exits**, only when `blocked`: `<div className="flex flex-wrap gap-3">` with `<Button asChild variant="outline"><Link to="/home">{STEP4.goHome}</Link></Button>` and `<Button asChild variant="outline"><Link to="/data/followed">{STEP4.manageFollowed}</Link></Button>` (setup-ui §2.3 *Add later*; UX design §1.2: links styled `button` `outline`). The targets are plain route paths: `/home` is registered by CAP-003-E5-S5 and `/data/followed` by CAP-003-E3-S4, so nothing here imports either.
    - **Refusal or failure**, when `outcome` is set: `<div role="alert" className="flex flex-wrap items-center gap-3 text-destructive">`. For `refused`: `STEP4.depthNotSet` with `<a href={\`#${STEP_HEADING_ID}\`} onClick={(event) => { event.preventDefault(); state.goTo(2); }}>{STEP4.goToStep2}</a>`, or `STEP4.noStocks` with the same link to step 3 (CAP-003-E4-S2's in-page step link, DEC-0348). For `failed`: `STEP4.startFailed(outcome.reason)`.
    - **Progress region** (DEC-0356), rendered when `shown` is not null:
      - `latest` is `attention.data.latest_download` when `attention.kind === "ok"`, `attention.last?.data.latest_download ?? null` when `"error"`, `null` when `"loading"` (CAP-003-E4-S1's reading of the step 4 flag).
      - `shown` is the pending view `{ state: "requested", progress: { done: 0, total: null }, started_at: null, requested_at: null }` when `ours` is set and `latest?.run_id !== ours.runId`; otherwise `latest`.
      - `fromRead` is true when `shown` is `latest`.
      - `<div className="flex flex-col gap-2">` holding: `<span id={stateId}><StatusBadge tier={tierOf({ of: "download", state: shown.state })}>{labelOf({ of: "download", state: shown.state })}</StatusBadge></span>` (DAC-E4-S4-6); then exactly one of —
        - `attention.kind === "error"`: `<p aria-live="polite">{STEP4.progressUnreadable}</p>` and no `Progress` (DAC-E4-12);
        - `ours?.queuedBehind` set and `shown.state === "requested"`: `<p role="status">{STEP4.queued}</p>` and no `Progress` (DAC-E4-9; UX design §1.2 *in place of the progress bar until the queued download starts*);
        - `shown.state` terminal (`succeeded`, `partial`, `failed`, `cancelled`, `abandoned`): nothing more;
        - otherwise: `<p id={labelId} aria-live="polite">{total === null ? "" : STEP4.progress(formatCount(done), formatCount(total))}</p>` and `<Progress value={done} max={total} aria-labelledby={total === null ? stateId : labelId} />`.
      - Then, when `fromRead` and `shown.started_at ?? shown.requested_at` is set: `<p className="text-xs text-muted-foreground">` with `<span>{STEP4.started(formatInstant(shown.started_at ?? shown.requested_at))}</span>` and, when `attention.kind === "ok"`, `<span>{STEP4.checked(formatClock(attention.checkedAt))}</span>` (the read's `checkedAt`; Resolved Conflict 1). Then, when `shown.state` is not terminal, `<p>{STEP4.canLeave}</p>`.
    - `useId` gives `reasonId`, `stateId` and `labelId`.

  Makes T002–T009 pass.

- [ ] T018 Create `web/src/screens/setup/index.tsx` (depends on T017; T010–T013 RED first), to DEC-0359.
  - **Imports.** `type JSX` from `"react"`; `type ScreenState` from `"../../api/types"`; `LAYOUT` from `"../../app/layout"`; `Card` from `"../../components/ui/card"`; `StateRegion`, `type StateRenderers` from `"../../components/patterns/state-region"`; `useSetupState`, `type SetupState`, `type StepId` from `"./use-setup-state"`; `SCREEN` from `"./copy"`; `StepList` from `"./step-list"`; `useStepHeadingFocus` from `"./step-card"`; `StepMarketData` from `"./step-market-data"`; `StepHistoryDepth` from `"./step-history-depth"`; `StepStocks` from `"./step-stocks"`; `StepDownload` from `"./step-download"`.
  - **Module comment.** `SetupScreen` (setup-ui §2.1, §10; UX design §1.2; AC-3, AC-24, AC-26). It records STD-UI-23's eight states for the step card region: loading, never populated and partial or complete render through `StateRegion`; nothing found, unavailable and error render inside their steps (CAP-003-E4-S2, CAP-003-E4-S3 and step 4); unreachable is the shell's; and one line reading `Stale: not applicable, every step is re-derived on each visit; step 4's polled progress carries checked {time}` (setup-ui §10 States). T011 reads that line.
  - **`screenStateOf(state: SetupState, now: Date): ScreenState<SetupState>`** (exported): `{ kind: "loading" }` while `state.loading`; `{ kind: "empty-never-populated" }` when no `done` flag is true; `{ kind: "populated", data: state, fetchedAt: now.toISOString() }` when all four are; otherwise `partial` with the same fields. `fetchedAt` is never rendered (stale is not applicable).
  - **`cardRenderers(state: SetupState): StateRenderers<SetupState>`** (exported). It is a function, not a constant, because `empty-never-populated` carries no `data`, so its renderer closes over `state`. `loading` renders `CardSkeleton`; `empty-never-populated` renders `<SetupBody state={state} />`; `partial` and `populated` render `<SetupBody state={s.data} />`; `empty-no-match`, `unavailable`, `error` and `unreachable` are `{ notApplicable }` with these reasons:
    - `empty-no-match`: *Nothing found is a state inside a step: step 3 at zero accepted blocks Continue, and step 4 with no followed stock blocks Start download with two exits; steps 1 and 2 have nothing to come up empty.*
    - `unavailable`: *Unavailable is a state inside a step: step 1's and step 4's key line read Not determinable while health is not answering, and step 4's progress reads Progress can't be read right now while attention fails; steps 2 and 3 have no polled value.*
    - `error`: *A failed read or save shows in its own step with its recovery (DAC-E4-13: in that step only), and a refused start shows on step 4; step 1 makes no read of its own. The screen never fails as a whole.*
    - `unreachable`: *The shell replaces the main region (AC-23; owner-shell 2.8).*
    T011's record assertions call `cardRenderers(<any state literal>)`.
  - **`CardSkeleton`** (private): `<Card variant="default"><div className="flex flex-col gap-5 p-4">` with three `<div className="h-4 rounded bg-muted motion-safe:animate-pulse" />` bars of widths `w-1/4`, `w-3/4`, `w-1/2` (UX design §1.2 *a card skeleton at the step card's shape*).
  - **`ListSkeleton`** (private): `<div aria-hidden="true" className="flex flex-col gap-4">` with four rows `<div className="flex items-center gap-3"><div className="rounded bg-muted" style={{ width: LAYOUT.markerSize, height: LAYOUT.markerSize }} /><div className="h-4 flex-1 rounded bg-muted" /></div>`.
  - **`SetupBody({ state })`** (private): calls `useStepHeadingFocus(state.current)` (CAP-003-E4-S2) and renders `StepMarketData`, `StepHistoryDepth`, `StepStocks` or `StepDownload` for `state.current`, each given `state`. It mounts only once the reads have settled, so its first render never moves focus (CAP-003-E4-S2 Resolved Conflict 1); moving between `partial` and `populated` keeps the same element, so it is not remounted.
  - **`export default function SetupScreen(): JSX.Element`** (default, as the delivered screens and CAP-003-E3-S4's `React.lazy` bindings expect): `const state = useSetupState()`; renders
    - `<div className="flex items-start gap-6" style={{ maxWidth: LAYOUT.contentMaxWidth }}>` (setup-ui §10: two columns inside the content cap, `--space-6` apart);
    - the left column `<div className="flex flex-col gap-4" style={{ minWidth: LAYOUT.sideColumnMin, maxWidth: LAYOUT.sideColumnMax }}>` holding `<h1 tabIndex={-1} className="text-xl font-semibold text-foreground">{SCREEN.title}</h1>`, `<p className="text-xs text-muted-foreground">{SCREEN.subLine}</p>` and `state.loading ? <ListSkeleton /> : <StepList state={state} />`. The `h1` and sub-line sit outside `StepList`'s `header` slot so they persist while loading (Other Notes);
    - the right column `<div className="min-w-0 flex-1"><StateRegion state={screenStateOf(state, new Date())} renderers={cardRenderers(state)} onRetry={NO_RETRY} /></div>`, `NO_RETRY` a module constant returning `undefined`, commented: the region's `error` kind is recorded not applicable, so **Try again** never renders here.
  - It mounts no `SetupDraftProvider` (the shell does, CAP-003-E4-S6) and opens no interval.

  Makes T010–T013 pass.

**Checkpoint**: `npm run test` is green; `npx tsc --noEmit` is clean.

---

## Phase 4: Integration

**Purpose**: Confirm the change set is exactly the story's.

- [ ] T019 Confirm scope (depends on T015–T018):
  - `git status --short` lists only `web/src/screens/setup/step-download.tsx`, `step-download.test.tsx`, `index.tsx`, `setup.test.tsx`, `step-market-data.tsx`, `copy.ts` and `copy.test.ts`, plus this story's `-tasks.md`, its `-tdd-evidence.yaml` and its status line.
  - `git diff --exit-code -- web/src/app/ web/src/api/ web/src/components/ web/src/screens/instruments/ web/src/screens/settings/ web/src/main.tsx package.json src/` exits 0.
  - `git diff -- web/src/screens/setup/copy.ts` shows only T015's two additions; `git diff -- web/src/screens/setup/step-market-data.tsx` shows only the `KeyPresence` extraction and its use.
  - `grep -n "Stale: not applicable" web/src/screens/setup/index.tsx` finds the record (T011).
  - `/setup` is not registered here: `grep -n "screens/setup" web/src/app/routes.tsx` prints nothing (CAP-003-E4-S6 registers it).

**Checkpoint**: The change set is the story's four files plus the two extensions. Delivered behaviour is unchanged.

---

## Phase 5: Polish

**Purpose**: Validation, formatting and the TDD evidence.

- [ ] T020 Run `npm run format` (a check); fix any report with `npx biome format --write` on this story's files only. Then run `npm run lint`, `npx tsc --noEmit`, `npm run build` and `npm run test`, and the Story-Specific Validation greps. No behaviour change (traces to AC-26, AC-19).
- [ ] T021 After each TDD cycle in T002–T020 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E4-S4-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  - (1) T014 + T015: the two copy strings.
  - (2) T002–T009 + T016 + T017: the key verdict extraction and step 4. T016 is behaviour-preserving; its evidence is CAP-003-E4-S2's `step-market-data.test.tsx` green before and after, with the new T004 and T007 rows RED first.
  - (3) T010–T013 + T018: the screen.

  T019 and T020 add no behaviour and join cycle 3's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S1 | hard | `step-download.tsx` imports `Button` (`blocked`, `outline`, `asChild`) from `web/src/components/ui/button.tsx` and `Card`, `CardSummaryList` from `card.tsx`; `index.tsx` imports `Card`. CAP-003-E1-S1 creates both. Added to the graph by this plan; it was already reached through CAP-003-E4-S2 |
| CAP-003-E3-S1 | hard | `step-download.tsx` imports `type Attention` from `web/src/app/shell-types.ts`, and the tests type their fixtures with `Attention` and `ReadState`. CAP-003-E3-S1 creates the file. Added to the graph by this plan; it was already reached through CAP-003-E4-S1 |
| CAP-003-E3-S2 | hard | `index.tsx` imports `LAYOUT` from `web/src/app/layout.ts` (`contentMaxWidth`, `sideColumnMin`, `sideColumnMax`, `markerSize`), which CAP-003-E3-S2 creates. Added to the graph by this plan; it was already reached through CAP-003-E4-S2 |
| CAP-003-E4-S6 | reverse | Registers `/setup` with this story's default-exported `SetupScreen` in `routes.tsx` and mounts `SetupDraftProvider` in `shell.tsx` above it. Graph: E4-S6 depends on E4-S4 |
| CAP-003-E4-S5 | context | Its first-run journey (`tests/e2e/setup-first-run.spec.ts`) drives step 4 by keyboard and asserts `/` opens Home after **Start download**, which DEC-0360's health refresh makes immediate. Nothing is imported either way; the graph reaches this story through CAP-003-E4-S6 |
| CAP-003-E3-S6 | context | Its focus rule (DEC-0337) waits for the main region's `h1` and focuses it on a path change; the reason the `h1` is rendered outside the loading swap (T013 (a)). Nothing is imported |
| CAP-003-E3-S4 | context | Registers the delivered followed-stocks screen at `/data/followed` and binds screens through `React.lazy` default imports; the reason `SetupScreen` is the default export. Nothing is imported |
| CAP-003-E5-S5 | context | Registers `/home`, the target of **Go to Home**. The link is a plain route path; the tests use a memory router's probe |
| CAP-003-E6-S4 | context | Its plan's DEC-0384 labels an indeterminate download bar by the download's state label with no count text; step 4 follows the same rule so one product says one thing (Open Gap 1). No code is shared |

Every other import is an existing hard edge (CAP-003-E4-S1, CAP-003-E4-S2, CAP-003-E4-S3, CAP-003-E3-S3, CAP-003-E1-S3, CAP-003-E1-S9, CAP-003-E1-S6, CAP-003-E1-S5) or delivered code (`web/src/api/client.ts`, `web/src/api/types.ts`, `react`, `react-router-dom`).

### Task Dependencies

- T001 first.
- T002–T009 share `step-download.test.tsx` and run in that order. T010–T013 share `setup.test.tsx` and run in that order. T014 (`copy.test.ts`) is its own file. The three files can be written in parallel.
- T015 depends on T014 being RED. T016 depends on T004 and T007 being RED.
- T017 depends on T015 and T016, with T002–T009 RED first.
- T018 depends on T017, with T010–T013 RED first.
- T019 depends on T015–T018. T020 depends on T019.
- T021 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- Phase 2: the three test files.
- Phase 3: T015 and T016 in parallel; T017 and T018 in sequence.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not run: this story mounts no route (CAP-003-E4-S6 registers `/setup`; CAP-003-E4-S5 writes the journey). No Python file changes.

### Story-Specific Validation

- **DAC-E4-8 to DAC-E4-10, DAC-E4-12, DAC-E4-S4-1, DAC-E4-S4-2, DAC-E4-S4-6:** `npx vitest run web/src/screens/setup/step-download.test.tsx` is green.
- **AC-3, AC-24, DAC-E4-S4-3, DAC-E4-S4-4:** `npx vitest run web/src/screens/setup/setup.test.tsx` is green.
- **The extraction keeps step 1:** `npx vitest run web/src/screens/setup/step-market-data.test.tsx` is green, unchanged.
- **No interval (setup-ui §5):** `grep -nE "setInterval|setTimeout|requestAnimationFrame" web/src/screens/setup/step-download.tsx web/src/screens/setup/index.tsx` prints nothing.
- **AC-26:** `npx vitest run web/src/components/token-literals.test.ts` is green with the two new sources scanned (CAP-003-E4-S2 widened the scan to `web/src/screens/setup/`). `grep -rnE "(208|1180|260|300|28|16)px|70ch" web/src/screens/setup --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` prints nothing.
- **AC-19:** `grep -niwE "instrument|acquisition|acquire|run|runs|retire|retired" web/src/screens/setup/step-download.tsx web/src/screens/setup/index.tsx` prints nothing (with `-w`, `startAcquisitionRun`, `run_id` and `RunState` are single words and do not match), so a reviewer's grep agrees with T008's and T012's rendered scans.
- **No storage:** `grep -rnE "localStorage|sessionStorage|indexedDB" web/src/screens/setup --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` prints nothing.
- **Mutation:** `python3 scripts/mutation-run.py run` with `--command "npx vitest run web/src/screens/setup/ && npx tsc --noEmit"` over `step-download.tsx`, `index.tsx` and `step-market-data.tsx`, plus the hand-written mutants in Other Notes, leaves no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **Where *checked {time}* comes from.** Epic CAP-003-E4 NFR *Freshness* and this story's description read it from "the read's `checkedAt`" (owner-shell §2.3 `ReadState.checkedAt`); system design §3.2 note 4 and UX design §1.2 say attention's `checked_at`. **Governing: epic CAP-003-E4** (epic over design prose). `formatClock(attention.checkedAt)` (T005, T017); the wire's `checked_at` is not read.
2. ***Started* and *checked* on one line or two.** UX design §1.2 writes *Started {start time} · checked {time}*; setup-ui §10 and epic DAC-E4-9 list them as two items. **Governing: epic DAC-E4-9** (as CAP-003-E4-S1's plan records). They are two spans in one muted line, with no separator character.
3. ***Disabled* against `blocked`.** setup-ui §2.2's flowchart node [14] and §2.3's sequence say **Start download** "disabled"; setup-ui §2.3 *Add later*, §10 and epic DAC-E4-8 say `button` `blocked`, focusable, described by its reason. **Governing: epic DAC-E4-8** with DAC-E1-15 (never `disabled` where a precondition gates an action). T006 asserts it is not `toBeDisabled()`.
4. **The exits: links or buttons.** setup-ui §10 calls them "both `button` `outline`"; setup-ui §2.3 and DAC-E4-8 call them links to `/home` and `/data/followed`; TC-COMP-120 queries links. **Governing: epic DAC-E4-8.** They are router `Link`s styled through `Button asChild variant="outline"`, which satisfies both (UX design §1.2 Component Mapping: *link styled as `button`*).
5. **The download's name.** setup-ui §14.2 lists *Download started {start time}* as open; capability §7 OQ-1 is answered: the start time in America/Chicago with its zone, permanently. **Governing: capability §7** (epic E4's own open question carries it). *Started* uses `formatInstant(started_at ?? requested_at)`, the precedent CAP-003-E4-S2's Resolved Conflict 4 follows (ui-components §2.5 `formatDownloadName`).
6. **The attention refresh on a queued start.** setup-ui §2.3's sequence and DAC-E4-9 call `refresh("attention")` only for `queued_behind` null. Not a conflict: the plan calls it only then (T002 (c)), and the shell's attention cadence is already 10 s while the download ahead is running (owner-shell §2.4).
7. **setup-ui's body header `**Status:** draft` against its frontmatter `status: approved`.** The frontmatter, which the approval gate reads, governs.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0356.**
   - **What is undetermined.** DAC-E4-9 and setup-ui §10 give the progress texts after a `202` and DAC-E4-S4-6 requires "the download state through `StatusBadge`", but no artifact says where the state badge sits (register G8), what the region shows between the `202` and the first attention answer that names the new download, what a download that has already ended shows when setup is reopened (CAP-003-E4-S1's DEC-0343 makes step 4 current when all four steps are done), what labels an indeterminate bar, or when the queued line gives way to the bar.
   - **What the plan adopts (T002, T004, T005, T009, T017).**
     - The region leads with the download's state as `StatusBadge` (`labelOf`/`tierOf` `download`).
     - Until attention's `latest_download` names the download this visit started, the region shows that download as *Queued* (the `202`'s `state: "requested"`) with an indeterminate bar, and no *Started* or *checked* line.
     - A non-terminal download shows the bar; a terminal one shows its badge, *Started* and *checked* only, with no bar and no *You can leave* line.
     - While `total` is null the bar is labelled by the state badge (*Queued* or *Downloading*) and no count text renders.
     - The queued line replaces the bar while the started download is still `requested` behind another.
   - **Derivation.**
     - Attention's `latest_download` is the download with the greatest `requested_at` (data-health-reader §2.6), so it names the new download once read; before that it names an older one or none, and showing that older download's state as this one's would misstate it.
     - A bar for an ended download would be the frozen bar DAC-E4-12 forbids, and *this keeps running* would be false.
     - The indeterminate label follows CAP-003-E6-S4's plan (DEC-0384), so Data health and setup label the same bar the same way; *0 of 0* or *of null* would be a value the API never sent (STD-UI-4).
     - UX design §1.2: the queued line stands "in place of the progress bar until the queued download starts".
   - **Alternatives rejected.** Rendering only from attention, ignoring the `202`: an older download's *Complete* could show for the length of a request after **Start download**. Hiding the region for ended downloads: setup reopened from Settings would show nothing about the download that completed it.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §10 step 4 (with UX design §1.2) at its next revision.
2. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0357.**
   - **What is undetermined.** DAC-E4-9 gives copy for the two `409` codes only. No artifact says what a transport failure, a `500` or any other refusal of `POST /api/acquisition-runs` shows, nor whether **Start download** stays available after a `202` or while a request is in flight.
   - **What the plan adopts (T009 (d), (e), T014, T015, T017).** Any other failure renders *Couldn't start the download: {reason}*, `{reason}` from CAP-003-E4-S2's `failureReason` (DEC-0345), as an alert, with **Start download** still available to retry. **Start download** stays rendered and `default` after a `202`; a later activation is a new request, which CAP-001 accepts and queues (AC-15). While a request is in flight a second activation sends nothing.
   - **Derivation.** setup-ui §8 criterion 5: "a refused start names the operation, the reason and the step that fixes it"; the shape mirrors the two pinned refusals (*Couldn't start the download: …*) and S2's *Couldn't save history depth: {reason}*. Starting a download is routine with no confirmation (UX design §1.2, blueprint §9), and the delivered endpoint answers a second start with `queued_behind` (AC-15), so hiding the button would add a restriction CAP-001 does not make (AC-17). The in-flight guard is CAP-003-E4-S3's posting guard applied here.
   - **Alternatives rejected.** Showing `error.message`: server English with domain terms (AC-19). Hiding **Start download** after a `202`: a rule no artifact gives.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §2.3 *Step 4* and §10 States at its next revision.
3. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0358.**
   - **What is undetermined.** Step 4's question is *Download data for {n} stocks* and its summary card states *{y} years* and *{n}*, but no artifact says what they show when the depth or count read failed (reachable: a successful post on step 3 makes step 4 current even when the count re-read then fails, CAP-003-E4-S3), or when the depth is answered as not set.
   - **What the plan adopts (T009 (g), (h), T014, T015, T017).** The question falls back to the step title *Download data*. A failed read renders `NotDeterminable` with the read's own failure sentence as its reason (*Couldn't read history depth: …*, *Couldn't read the followed list: …*). A depth answered as `null` renders `Absent` with the hidden text *History depth isn't set*.
   - **Derivation.** STD-UI-14 and DAC-E4-S4-6: a value that cannot be determined goes through `NotDeterminable` with its reason; the reason sentences are DAC-E4-13's pinned wording. STD-UI-4: an absent value is the em dash with hidden words, never blank; the words follow the pinned refusal *history depth isn't set*. The step title is the pinned name of the step. The read's **Try again** stays in the step that owns the read (DAC-E4-13: in that step only).
   - **Alternatives rejected.** *Download data for 0 stocks*: a count the server did not answer. A **Try again** in the summary card: DAC-E4-13 keeps it in its step.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §10 step 4 and States at its next revision.
4. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0359.**
   - **What is undetermined.** DAC-E4-S4-4 requires each step's eight states to render or be recorded not applicable "through `StateRegion`", but setup-ui names no `StateRegion` use, and DAC-E4-13 with CAP-003-E4-S2's and CAP-003-E4-S3's plans render the read errors inside the step with the field still shown, which `StateRegion`'s `error` kind (a sentence and **Try again** replacing the body; CAP-003-E1-S9's DEC-0314) cannot do.
   - **What the plan adopts (T011, T018).** The step card region renders through one `StateRegion` whose kind `screenStateOf` derives from the step state: `loading`, `empty-never-populated` (nothing done), `partial` (some done) or `populated` (all done). `empty-no-match`, `unavailable`, `error` and `unreachable` are recorded `{ notApplicable }` at the region with reasons naming where each step renders them; stale is recorded in the module comment. T011 asserts every step's rendering of every applicable state through the composed screen.
   - **Derivation.** UX design §1.2 States describes nothing found, unavailable and error as states of individual steps (step 3, step 4, step 1's key line, step 2's and step 3's reads), and "Partial: some steps done" and "Empty, never populated: step 1 current with nothing done" as states of the whole; CAP-003-E1-S9's prop contract records an inapplicable kind as `{ notApplicable: reason }` (STD-UI-23's recorded reason). Routing the per-step errors through the region would hide step 2's field, against CAP-003-E4-S2's DAC-E4-13 rendering.
   - **Alternatives rejected.** One `StateRegion` per step with a derived kind per step: the step's own error rendering would be wrapped twice (two **Try again**). An exported table of strings beside the code: a second record nothing checks against `StateRegion`.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §10 States at its next revision.
5. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0360.**
   - **What is undetermined.** AC-2 says starting the first download from setup MUST make `/` open on Home from then on. The `/` redirect reads `health.most_recent_run` (owner-shell §2.5), polled every 30 s, and setup-ui §2.3 specifies only `refresh("attention")` after a `202` (register G4). No artifact says whether setup refreshes the health read.
   - **What the plan adopts (T002 (a), (c), T009 (j), T017).** Every `202`, queued or not, also calls `refresh("health")` through the shell context.
   - **Derivation.** The capability criterion outranks the design's silence (constraint 9.1): without the refresh, `/` can open setup again for up to one health interval after a download was requested. Any `202` completes setup (DEC-0202 as the owner amended it: a download in any state). `refresh("health")` is an existing member of `ShellContextValue` (owner-shell §2.3; CAP-003-E3-S3's T002 (d)), so no interface changes.
   - **Alternatives rejected.** Leaving the lag: AC-2 fails for up to 30 s, and CAP-003-E4-S5's journey would need to wait for a poll. Navigating to Home after the `202`: AC-7 says the progress shows in setup while the owner stays.
   - **Scope.** Propagating: CAP-003-E4-S5's journey relies on `/` opening Home right after **Start download**.
   - **Owning design to absorb it:** setup-ui §2.3 *Step 4* at its next revision.

### Other Notes

- **The `h1` lives outside `StepList`'s `header` slot.** CAP-003-E4-S2's plan offers `StepList({ header })` for the `h1` and sub-line. The loading skeleton cannot be `StepList`, so passing the `h1` through it would remount the `h1` when the reads settle and drop the focus CAP-003-E3-S6's rule put there (it focuses the first `main h1` after a path change, DEC-0337). The screen renders the `h1` and sub-line itself in a left column bounded by `LAYOUT.sideColumnMin` and `sideColumnMax`; `StepList` keeps its own bounds inside it. The `header` prop stays unused and optional.
- **The focus hook lives in the loaded body.** `useStepHeadingFocus` treats any change of `current` after its first render as a step change. Called in `SetupScreen`, it would see the derived step move from 1 to the real step when the reads settle and pull focus off the `h1`. `SetupBody` mounts only after loading, so its first render is the entry.
- **A short `blocked` flash after step 3.** CAP-003-E4-S3 calls `reread("activeCount")` and then `goTo(4)`; CAP-003-E4-S1 keeps the old count until the re-read settles. On a first run the old count is 0, so step 4 shows `blocked` with the exits for the length of the re-read. No artifact sets a rule against it, and the fix would be in CAP-003-E4-S1's re-read; recorded, not changed.
- **No re-read after a `409`.** A refusal links to the step that fixes it and nothing else; the facts are re-derived on the next visit. A re-read was considered and left out: no artifact asks for it, and the refusal is the server's current answer.
- **Announcements.** The progress text is the only live element the poll changes (`aria-live="polite"`), so a 10 s answer announces one line; the queued line is a `status` announced once; refusals and failures are alerts, answers to the owner's own action. Nothing calls `focus()` except CAP-003-E4-S2's hook.
- **`fetchedAt` is unread.** `ScreenState`'s `populated` and `partial` need a `fetchedAt`; stale is not applicable to setup, so the value is the derivation time and nothing renders it.
- **Hand-written mutants** for the mutation run:
  - `web/src/screens/setup/step-download.tsx`: `if (result.queuedBehind === null) refresh("attention")` → `refresh("attention")`, killed by T002 (c).
  - `web/src/screens/setup/step-download.tsx`: `refresh("health")` deleted, killed by T009 (j).
  - `web/src/screens/setup/step-download.tsx`: `latest?.run_id !== ours.runId` → `latest === null`, killed by T009 (a).
  - `web/src/screens/setup/step-download.tsx`: the `attention.kind === "error"` branch removed (the bar rendered from `last`), killed by T004.
  - `web/src/screens/setup/step-download.tsx`: `formatClock(attention.checkedAt)` → `formatClock(attention.data.checked_at)`, killed by T005.
  - `web/src/screens/setup/step-download.tsx`: `STEP4.startFailed(outcome.reason)` → `STEP4.startFailed(error.message)`, killed by T009 (d) and T008 row 7.
  - `web/src/screens/setup/step-download.tsx`: `if (starting.current) return;` deleted, killed by T009 (e).
  - `web/src/screens/setup/step-download.tsx`: `blocked` → `state.step4 === "blocked" || !health.health?.credential_present`, killed by T003.
  - `web/src/screens/setup/step-download.tsx`: `STEP_TITLES[4]` fallback → `STEP4.downloadFor("0")`, killed by T009 (g).
  - `web/src/screens/setup/index.tsx`: `useStepHeadingFocus(state.current)` moved from `SetupBody` into `SetupScreen`, killed by T013 (b).
  - `web/src/screens/setup/index.tsx`: the `h1` passed as `StepList`'s `header` with the skeleton rendered without it, killed by T013 (a).
  - `web/src/screens/setup/index.tsx`: `screenStateOf`'s `every` → `some` for `populated`, killed by T011.
  - `web/src/screens/setup/step-market-data.tsx`: `KeyPresence`'s `health.liveness === "answering" &&` dropped, killed by T004 step 1 and CAP-003-E4-S2's T003.
