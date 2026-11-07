---
artifact_schema_version: 1
artifact_id: CAP-003-E6-S2-tasks
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
  timestamp: 2026-11-07T06:31:20Z
  source_artifacts:
    - id: CAP-003-E6-S2
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
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-data-health-ui-tests
      version: "1"
    - id: CAP-003-E1-S1-tasks
      version: "1"
    - id: CAP-003-E1-S3-tasks
      version: "1"
    - id: CAP-003-E3-S3-tasks
      version: "1"
    - id: CAP-003-E6-S1-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E6-S2 — Download Now and the Stop Following Dialog: the Two Recoveries Behind the Delivered Endpoints

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `data-health-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Data health offers exactly two recoveries, and both go through endpoints CAP-001 already delivered (AC-17). This story builds them as two components in `web/src/screens/data-health/` (data-health-ui 2.1, 2.7).

`download-now.tsx` exports `DownloadNow`, the one routine action that the page header, *Needs fixing* and the empty state's **Start the first download** all render. It calls `startAcquisitionRun()` with no confirmation, and always over the whole followed list (D-9):
- A `202` with `queuedBehind` null calls `useShell().refresh("attention")`.
- A `202` with `queuedBehind` set shows the helper line *A download is running. This starts when it finishes.* (AC-15).
- Each `409` code gets its own refusal and link: *history depth isn't set* goes to **Set history depth** (`/settings`), and *no stocks are followed* goes to **Follow stocks** (`/data/followed`).
- Any other failure reads *Couldn't start the download: {reason}.* with **Try again** (DAC-E6-11, DAC-E6-S2-1).

`stop-following-dialog.tsx` exports `StopFollowingDialog`, built on CAP-003-E1-S3's `ConfirmDialog` (`dialog` `confirm`, never `destructive`). It is titled *Stop following {SYMBOL}* and carries the blueprint §9 sentence verbatim. **Cancel** comes first and takes focus, and focus is trapped (AC-25).
- On confirm it calls `retireInstrument(symbol)`.
- A `200` closes the dialog. It then calls the caller's aggregate re-read and `refresh("attention")`, and announces *Stopped following {SYMBOL}* through a polite live region, with no toast.
- A `404` or `409` keeps the dialog open with *Couldn't stop following {SYMBOL}: {reason}.* When the dialog then closes, the row is refreshed (DAC-E6-12, DAC-E6-S2-2).
- Focus returns to the row's **Stop following**. If the row has left, it goes to the *Needs fixing* heading.

New owner-facing strings go into CAP-003-E6-S1's `copy.ts`. The tests are `download-now.test.tsx` and `stop-following-dialog.test.tsx`. Neither control renders a status badge, so the one-tier rule is asserted as an absence (DAC-E6-S2-4).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-15 | **Download now** starts a download over the whole followed list; while one is under way the request is accepted and the product says it starts when the current one finishes | T002, T003, T006, T009, T010 |
| AC-14 | Stopping following is offered as a fix, confirmed, with history kept | T004, T005, T009, T011 |
| AC-17 | Starting and stopping go through the delivered endpoints with CAP-001's confirmations and refusals unchanged | T002, T004, T005, T009, T010, T011 |
| AC-25 | The dialog traps focus, puts **Cancel** first and returns focus on close | T004, T005, T011 |
| DAC-E6-11 | **Download now** outcomes as stated, no confirmation, no per-stock retry | T002, T003, T006, T009, T010 |
| DAC-E6-12 | The stop-following dialog as stated, `confirm` never `destructive` | T004, T005, T006, T009, T011 |
| DAC-E6-S2-1 | The two `409` reasons never interchanged, each link to its path; a transport failure reads *Couldn't start the download: {reason}.* with **Try again** | T002, T003, T009, T010 |
| DAC-E6-S2-2 | A `409` on stop following keeps the dialog open with the reason, `Esc` closes it, the row is refreshed on close | T005, T009, T011 |
| DAC-E6-S2-3 | No DAC-E7-3 term in visible text or accessible names; labels from `copy.ts` | T007, T009 |
| DAC-E6-S2-4 | No status badge renders here (one-tier rule not applicable); no state by colour alone | T008, T010, T011 |

Mapped test cases (from `tests/component/data-health-ui-tests.md`, confirmed in `tests/coverage-matrix.md` lines 279–280 and 291–294 and in the AC-14, AC-15, AC-17, AC-19 and AC-20 rows):
- **TC-COMP-161** (DAC-E6-S2-1, DAC-E6-11, AC-15)
- **TC-COMP-162** (DAC-E6-S2-2, DAC-E6-12, AC-14, AC-17)
- **TC-COMP-163** (DAC-E6-S2-3, AC-19)
- **TC-COMP-164** (DAC-E6-S2-4, AC-20)

The specification is `status: draft`. Its steps are used as written and sharpened below.

TC-INT-019 to TC-INT-024 exercise these components on the real stack, but they belong to Phase 6b automation and CAP-003-E6-S6, not to this story. TC-COMP-012 (the `confirm` contract itself) is CAP-003-E1-S3's. Here it is re-asserted only at this dialog's level.

## Phase 1: Setup

**Purpose**: Confirm the baseline and the four hard dependencies' exports.

- [ ] T001 From the repo root, run `npm ci` and then `npm run test`, and record the baseline as green. Without editing anything, confirm that each hard dependency's deliverable exists. STOP and report if any is missing.
  - (CAP-003-E1-S1) `web/src/components/ui/button.tsx` exports `Button` with the variants `default`, `outline` and `ghost` and with `asChild`.
  - (CAP-003-E1-S3) `web/src/components/ui/dialog.tsx` exports `ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm, pending?, children? })` (DEC-0301). `web/src/components/ui/toast.tsx` exports `toast`.
  - (CAP-003-E3-S3) `web/src/app/shell-context.tsx` exports `useShell`, whose value has `refresh(kind: "health" | "attention" | "scores")`.
  - (CAP-003-E6-S1) `web/src/screens/data-health/copy.ts` exports `TRY_AGAIN` and `readFailureReason(error: ApiError | ApiUnreachableError)` (DEC-0373).
  - `web/src/screens/data-health/download-now.tsx` and `stop-following-dialog.tsx` do not exist yet.

  Check with `grep -nE "export (function|const|type|interface) (Button|ConfirmDialog|ConfirmDialogProps|toast|useShell|TRY_AGAIN|readFailureReason)\b" web/src/components/ui/button.tsx web/src/components/ui/dialog.tsx web/src/components/ui/toast.tsx web/src/app/shell-context.tsx web/src/screens/data-health/copy.ts`. No package is added by this story (traces to AC-17).

**Checkpoint**: The baseline is green, every import this story makes resolves, and nothing has changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin each outcome, sentence, link, callback and focus move before either component exists.

**Shared harness.** Each of the two test files gets its own copy, because test files share no module.
- **Mocks.**
  - `vi.mock("../../api/client", async () => ({ ...(await vi.importActual(...)), startAcquisitionRun: vi.fn(), retireInstrument: vi.fn() }))`. This follows the delivered precedent in `web/src/screens/runs/run-controls.test.tsx` l.16–19, so the real `ApiError` and `ApiUnreachableError` classes are used.
  - `vi.mock("../../app/shell-context", () => ({ useShell: () => ({ refresh }) }))`, with a module-level `refresh = vi.fn()`. This is the consumer seam that DEC-0326 names: a consumer's test mounts `ShellProvider` or mocks `shell-context`.
  - `vi.mock("../../components/ui/toast", () => ({ toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() }, Toaster: () => null }))`. It is used only to prove that no toast is raised.
  - `beforeEach` resets every mock.
- **Errors.** These are literal instances. Their messages and request ids must never reach the DOM.
  - `DEPTH = new ApiError("No history depth has been set. Configure it in Settings before running.", "req-d1", { code: "history_depth_not_set" })`
  - `NONE = new ApiError("No active instruments exist. Add at least one instrument before running.", "req-n1", { code: "no_active_instruments" })`
  - `INTERNAL = new ApiError("database said no", "req-9f3", { code: "internal_error" })`
  - `OTHER_409 = new ApiError("x", "req-o1", { code: "some_future_code" })`
  - `NOT_FOUND = new ApiError("no instrument exists for symbol 'FBXX'", "req-404", { code: "instrument_not_found" })`
  - `ALREADY = new ApiError("instrument 'FBXX' is already retired", "req-409", { code: "instrument_already_retired" })`
  - `UNREACHABLE = new ApiUnreachableError("POST /api/acquisition-runs could not be reached")`

  The first two messages are the delivered server texts (`src/factorflow/api/routes/runs.py` l.86–97). `NOT_FOUND` and `ALREADY` match `instruments.py` l.113–125.
- **Render.** Every render is wrapped in `<MemoryRouter initialEntries={["/data"]}>` with a `LocationProbe` (`useLocation().pathname` into `data-testid="location"`), following the delivered precedent. `userEvent.setup()` drives every interaction.
- **Deferred.** `deferred<T>()` returns `{ promise, resolve, reject }` for in-flight cases.
- **Text and term scan.** `visibleAndAccessibleText(root)` joins `root.textContent` with every `aria-label` and with the computed accessible name of each `button`, `link` and `dialog` under `root`. It also includes `document.body`, because the dialog portals there. `TERMS = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`.

### Mandatory Component Tests

- [ ] T002 [P] Implement **TC-COMP-161** (the two `409` reasons are never interchanged, and a transport failure offers **Try again**). Write it in a new `web/src/screens/data-health/download-now.test.tsx` as `describe("Download now refusals and failures (TC-COMP-161, DAC-E6-S2-1, DAC-E6-11)")`, with `// Implements TC-COMP-161`. Render `<DownloadNow />`.
  - **(a) Step 1, `DEPTH`.**
    - Click **Download now**. A `role="status"` element reads exactly *Couldn't start the download: history depth isn't set.*
    - A link named **Set history depth** has `href="/settings"`, and clicking it puts `/settings` in `location`.
    - `queryByText(/no stocks are followed/)` is null and `queryByRole("link", { name: "Follow stocks" })` is null.
  - **(b) Step 2, `NONE`.**
    - The status reads exactly *Couldn't start the download: no stocks are followed.*
    - A link **Follow stocks** has `href="/data/followed"`, and clicking it navigates there.
    - Neither *history depth* text nor a **Set history depth** link is present.
  - **(c) Step 3, `UNREACHABLE`.**
    - The status reads exactly *Couldn't start the download: FactorFlow is not answering.* (DEC-0378). A button **Try again** follows it, outside the status element.
    - Neither refusal link renders.
    - Clicking **Try again** with the next answer `202` and `queuedBehind` null calls `startAcquisitionRun` a second time and `refresh` once with `"attention"`. The failure sentence then leaves the DOM.
  - **(d) `INTERNAL` and `OTHER_409`.** Each reads *Couldn't start the download: FactorFlow hit an unexpected problem.* with **Try again**. An unknown `409` code is never shown as either refusal.
  - **(e) Envelope text.** In (a)–(d), `document.body.textContent` contains none of the error messages, *req-* or `history_depth_not_set`.
  - **(f) A new press clears the old line.** After (a), a second press answered `NONE` shows only the *no stocks are followed* sentence and the **Follow stocks** link.

  Kills:
  - swap-case of the two refusal entries keyed by code (a, b: wrong sentence or link)
  - negate-boolean on `instanceof ApiError` / the code lookup (c, d: a refusal or nothing shown)
  - drop-field-copy that renders `cause.message` in place of `readFailureReason` (e)
  - remove-attribute of the refusal link's `to` (a, b `href`)
  - a hand-written mutant whose **Try again** does nothing (c: call count stays 1)
- [ ] T003 [P] Implement **TC-COMP-161's edge cases** (DAC-E6-11's `202` outcomes) and the routine-action rules. Write them in `web/src/screens/data-health/download-now.test.tsx` after T002, under `describe("Download now 202 outcomes, no confirmation, whole list (TC-COMP-161 edge, DAC-E6-11, AC-15)")`.
  - **(a) `202` with `queuedBehind` null.**
    - `refresh` is called exactly once, with exactly `"attention"`.
    - No helper line renders and no `role="status"` text appears.
    - `location` stays `/data`: Data health never navigates, unlike CAP-001's `StartRunControl`.
  - **(b) `202` with `queuedBehind` `"r-1"`.**
    - An element with implicit role `status` (`<output>`) reads exactly *A download is running. This starts when it finishes.*
    - `refresh` is not called, per data-health-ui 2.2: the queued branch only displays.
    - The button stays named **Download now** and is still pressable.
  - **(c) No confirmation.**
    - One click calls `startAcquisitionRun` exactly once before any other interaction.
    - `queryByRole("dialog")` and `queryByRole("alertdialog")` are null throughout.
  - **(d) Whole list.** `startAcquisitionRun.mock.calls[0]` equals `[]`. The component passes no symbol, filter or body, so it has no per-stock retry (D-9).
  - **(e) In flight.**
    - With a `deferred` answer pending, the button has `aria-busy="true"` and is `not.toBeDisabled()`. It is never natively `disabled`, because the button contract is `blocked` and never `disabled` (DAC-E1-15).
    - A second click leaves the call count at 1.
    - Once the answer resolves, `aria-busy` is gone.
  - **(f) Label.** `<DownloadNow label="Start the first download" />` renders a button with that name. A `202` with `queuedBehind` null still calls `refresh("attention")` once. This is the empty state's use (DEC-0379).
  - **(g) No toast.** `toast.success`, `toast.warning` and `toast.error` are never called in (a)–(f).

  Kills:
  - negate-boolean on `queuedBehind === null` (a: no refresh and a queued line; b: a refresh)
  - swap-case `"attention"` → `"scores"` / `"health"` in the refresh call (a)
  - negate-boolean / removal of the in-flight guard (e: two calls)
  - remove-attribute of `aria-busy` (e)
  - a hand-written mutant that navigates on `202` (a: `location` changes)
- [ ] T004 [P] Write the stop-following dialog's own contract (DAC-E6-12, AC-14, AC-25), the parts TC-COMP-162 takes as given. Use a new `web/src/screens/data-health/stop-following-dialog.test.tsx`, under `describe("Stop following dialog (DAC-E6-12, AC-14, AC-25)")`.

  **Harness `NeedsFixingHarness({ rows })`.**
  - It renders `<h2 ref={headingRef} tabIndex={-1}>Needs fixing</h2>`.
  - It renders `<ul>` with one `li` per symbol holding `<button type="button" onClick={() => setOpenFor(s)}>Stop following {s}</button>`. That button stands in for CAP-003-E6-S3's row button.
  - It renders `<StopFollowingDialog symbol={openFor} onClose={() => setOpenFor(null)} onStopped={stopped} onRefusalClosed={refusalClosed} fallbackFocusRef={headingRef} />`.
  - `stopped` and `refusalClosed` are `vi.fn()`.

  The default `rows` is `["FBXX", "GOOD"]`.
  - **(a) Title and wording.**
    - Clicking the row's **Stop following FBXX** opens `getByRole("dialog", { name: "Stop following FBXX" })`.
    - The dialog `toHaveAccessibleDescription` exactly *Stop following FBXX? Its history is kept, and strategies holding it keep holding it. You can follow it again later.*
  - **(b) `confirm`, never `destructive`.**
    - The dialog has `data-variant="confirm"` and `aria-modal="true"`, and `queryByRole("alertdialog")` is null.
    - The confirm button has `data-variant="default"`.
    - No element in `document.body` has a class containing `destructive`.
  - **(c) Cancel first and focused.**
    - `within(dialog).getAllByRole("button").map((b) => b.textContent)` equals `["Cancel", "Stop following"]`, and **Cancel** `toHaveFocus()`.
    - `user.tab()` focuses **Stop following**. A second `user.tab()` wraps back to **Cancel**, which shows focus is trapped.
  - **(d) Cancel returns focus.**
    - Clicking **Cancel** closes the dialog and puts focus on the row's **Stop following FBXX**.
    - `retireInstrument`, `stopped`, `refusalClosed` and `refresh` are all uncalled.
  - **(e) In flight.**
    - With `retireInstrument` returning a pending `deferred`, a click on **Stop following** sets `aria-busy="true"` on the dialog.
    - `{Escape}` and **Cancel** leave the dialog open while it is in flight. That is CAP-003-E1-S3's `pending` behaviour, passed through.
    - `retireInstrument` is called exactly once, with exactly `"FBXX"`.

  Kills:
  - swap-case of the title and description strings (a)
  - drop-field-copy of `symbol` in `retireInstrument(symbol)` (e)
  - negate-boolean on the `pending` prop (e: Esc closes mid-request)
  - a hand-written mutant that calls `onRefusalClosed` on every close (d)
- [ ] T005 Implement **TC-COMP-162** (a `409` keeps the dialog open; `Esc` closes it and refreshes the row) with its `200` edge case and the focus rules. Write it in `web/src/screens/data-health/stop-following-dialog.test.tsx` after T004 (same file), under `describe("Stop following outcomes (TC-COMP-162, DAC-E6-S2-2, DAC-E6-12, AC-17)")`, with `// Implements TC-COMP-162`.
  - **(a) Step 1, `ALREADY` (`409`).**
    - Confirm. The dialog is still open.
    - Inside it, a `role="status"` element reads exactly *Couldn't stop following FBXX: you already stopped following it.* (DEC-0377).
    - `stopped` and `refresh` are uncalled, and `refusalClosed` is still uncalled while the dialog is open.
  - **(b) Step 2, `{Escape}`.**
    - The dialog closes, and `refusalClosed` is called exactly once.
    - Focus returns to the row's **Stop following FBXX**, because the row is still present.
  - **(c) `NOT_FOUND` (`404`).** It follows the same path, reading exactly *Couldn't stop following FBXX: FactorFlow doesn't follow it.* Closing it with **Cancel** instead of `Esc` also calls `refusalClosed` once (TC-INT-020 edge: "both codes follow the same path").
  - **(d) Reopening clears the refusal.** Reopen FBXX after (b). No *Couldn't stop following* text is present.
  - **(e) Other failures.**
    - `INTERNAL` reads *Couldn't stop following FBXX: FactorFlow hit an unexpected problem.* `UNREACHABLE` reads *… FactorFlow is not answering.*
    - Each keeps the dialog open.
    - Closing either calls `refusalClosed` **zero** times, because only a `404` or `409` makes the row stale (Other Notes).
  - **(f) TC edge, `200`.**
    - Confirm with `retireInstrument` resolving `{ lifecycle: "retired", retiredAt: "2026-10-30T19:00:00Z" }`. The dialog leaves.
    - `stopped` is called exactly once, and `refresh` exactly once with `"attention"`.
    - An element with `aria-live="polite"`, outside the dialog and still in the DOM after it closes, has text exactly *Stopped following FBXX*.
    - No `toast` method is called and `queryByRole("alert")` is null.
    - Focus is on the row's **Stop following FBXX**, because the row is still present.
  - **(g) The row leaves after a stop.**
    - Continue from (f) and `rerender(<NeedsFixingHarness rows={["GOOD"]} />)`, which simulates the aggregate re-read removing FBXX.
    - The heading **Needs fixing** `toHaveFocus()`.
    - The *Stopped following FBXX* text is still in the live region.
  - **(h) The row leaves at once.**
    - A variant harness whose `stopped` removes FBXX synchronously, in the same update as the close.
    - The heading has focus once `waitFor` settles, never `document.body`.
  - **(i) No focus theft.** After (f), the test focuses the **Stop following GOOD** button and then removes FBXX. Focus stays on **Stop following GOOD**.
  - **(j) A second stop announces again.** Stopping GOOD after FBXX makes the live region read *Stopped following GOOD*. The keyed child re-renders, following the delivered `results-table.tsx` l.684–685 precedent.
  - **(k) Envelope text.** Neither any error message nor any *req-* text appears in `document.body`.

  Kills:
  - negate-boolean on the refusal-code check (a: dialog closes; e: `refusalClosed` called)
  - swap-case of the two refusal reasons (a, c)
  - a hand-written mutant that drops `refresh("attention")` on `200` (f)
  - drop-field-copy of the announcement's symbol (f, j)
  - a hand-written mutant that deletes the fallback-focus effect (g, h: focus on `body`)
  - negate-boolean on the "focus is on `body`" guard (i: focus is stolen)
  - remove-attribute of `aria-live` (f)

### Additional Unit Tests

- [ ] T006 Write the copy unit cases. In `web/src/screens/data-health/download-now.test.tsx`, after T003, add `describe("copy.ts, Download now strings (DEC-0378)")`. In `web/src/screens/data-health/stop-following-dialog.test.tsx`, after T005, add `describe("copy.ts, stop following strings (DEC-0377)")`.
  - **(a)** `DOWNLOAD_NOW` is *Download now*. `QUEUED_NOTICE` is *A download is running. This starts when it finishes.*
  - **(b)** `START_REFUSALS.history_depth_not_set` is `{ sentence: "Couldn't start the download: history depth isn't set.", fix: "Set history depth", to: "/settings" }`. `START_REFUSALS.no_active_instruments` is `{ sentence: "Couldn't start the download: no stocks are followed.", fix: "Follow stocks", to: "/data/followed" }`.
  - **(c)** `startFailed("x")` is exactly *Couldn't start the download: x.*
  - **(d)** `stopFollowingTitle("FBXX")` is *Stop following FBXX*. `stopFollowingDescription("FBXX")` is the blueprint sentence. `STOP_FOLLOWING` is *Stop following*. `stopFollowingFailed("FBXX", "x")` is *Couldn't stop following FBXX: x.* `stoppedFollowing("FBXX")` is *Stopped following FBXX*.
  - **(e)** `stopFailureReason(error)`:
    - `ALREADY` gives *you already stopped following it*.
    - `NOT_FOUND` gives *FactorFlow doesn't follow it*.
    - `INTERNAL` gives *FactorFlow hit an unexpected problem*, and `UNREACHABLE` gives *FactorFlow is not answering*. Both come from S1's `readFailureReason`.
    - No result contains any error's `message` or `requestId`.
  - **(f)** `isStaleRowRefusal(error)` is true for `NOT_FOUND` and `ALREADY`, false for `INTERNAL`, `OTHER_409` and `UNREACHABLE`.

  Kills:
  - swap-case of the two stop reasons (e)
  - negate-boolean in `isStaleRowRefusal` (f)
  - drop-field-copy of `to` in either refusal entry (b)
- [ ] T007 Implement **TC-COMP-163** (the display vocabulary) in both test files: `describe("Download now vocabulary (TC-COMP-163, DAC-E6-S2-3, AC-19)")` after T006 in `download-now.test.tsx`, and `describe("Stop following vocabulary (TC-COMP-163, DAC-E6-S2-3, AC-19)")` after T006 in `stop-following-dialog.test.tsx`. Each has `// Implements TC-COMP-163`.
  - **(a) Download now.** Render it in each state this story defines: idle, in flight, queued, `DEPTH`, `NONE`, `UNREACHABLE`, `INTERNAL`, and with `label="Start the first download"`. `visibleAndAccessibleText` never matches `TERMS`.
  - **(b) The dialog.** Render it open, in flight, refused with `ALREADY`, refused with `NOT_FOUND`, failed with `INTERNAL`, and after `200` (the live region). The same assertion holds over `document.body`.
  - **(c) The regex is not vacuous.** A planted case in each file: `TERMS` matches `"one run"`, `"Retired"` and `"Provider credential"`, and does not match `"A download is running"`, `"downloads"` or `"instrument_not_found"`. `\b` treats `_` as a word character, so the code is never matched. The point is that wire codes in `copy.ts` map keys can never satisfy the scan by accident.
  - **(d) Labels.** Every button and link name rendered in (a) and (b) is one of the `copy.ts` literals: `DOWNLOAD_NOW`, `TRY_AGAIN`, `START_REFUSALS.*.fix`, *Cancel* (CAP-003-E1-S3's fixed label) and `STOP_FOLLOWING`. The caller's `label` and the harness's own row buttons are excluded by name.

  Kills:
  - a hand-written mutant that renders the delivered `ApiError.message`. `NOT_FOUND`'s message (*no instrument exists for symbol 'FBXX'*) contains the whole word *instrument*, so (b) catches it; T002 (e) catches the Download now equivalent.
  - a hand-written `QUEUED_NOTICE` → CAP-001's *A run is in progress. This will start when it finishes.* (a: *run*)
- [ ] T008 Implement **TC-COMP-164** (no status badge in these controls; the one-tier rule is not applicable) in both test files: `describe("No status badge here (TC-COMP-164, DAC-E6-S2-4, AC-20)")`, with `// Implements TC-COMP-164`, after T007 in each.
  - **(a)** Across every state rendered in T007, `document.body.querySelector('[data-variant^="status-"]')` and `querySelector('[data-variant="coverage-unknown"]')` are null. Only `confirm` and `default` (the dialog and its confirm button) and the `Button` variants appear as `data-variant` values.
  - **(b) Not by colour alone.**
    - No element carries a class matching `/(^|\s)(text|bg|border)-(status|destructive)-?/`.
    - Every refusal, failure, queued and announcement element has non-empty `textContent`, so each state is stated in words.
  - **(c) The record.** The "not applicable" record is DAC-E6-S2-4's first clause in the story. The doc comment that each component carries (T010, T011) restates it. This test asserts the absence the record describes (coverage-matrix note 7).

  Kills:
  - a hand-written mutant that wraps the refusal sentence in `StatusBadge tier="critical"` (a)
  - a hand-written mutant that styles the refusal `text-status-critical` with no other change (b)

**Checkpoint**: Every Phase 2 test exists and fails, because `download-now.tsx`, `stop-following-dialog.tsx` and the new `copy.ts` exports do not exist yet, so the imports fail. Every delivered test, and every test from CAP-003-E6-S1, still passes.

---

## Phase 3: Core Implementation

**Purpose**: Add the strings, the routine action and the confirmed action.

- [ ] T009 Extend `web/src/screens/data-health/copy.ts`, the catalogue CAP-003-E6-S1 created (its T012). Change nothing that S1 wrote; append a section headed `// CAP-003-E6-S2: Download now and Stop following (data-health-ui 2.7)`. Strings are verbatim from data-health-ui 2.7, ux-design 1.4 Interaction Flows and epic DAC-E6-11 and DAC-E6-12 unless marked.
  - **Download now.**
    - `DOWNLOAD_NOW = "Download now"`
    - `QUEUED_NOTICE = "A download is running. This starts when it finishes."`
    - `START_REFUSALS: Readonly<Record<"history_depth_not_set" | "no_active_instruments", { sentence: string; fix: string; to: string }>>`, with the two entries of T006 (b)
    - `startFailed(reason) => \`Couldn't start the download: ${reason}.\``
  - **Stop following.**
    - `STOP_FOLLOWING = "Stop following"`
    - `stopFollowingTitle(symbol)`
    - `stopFollowingDescription(symbol)`, blueprint §9 verbatim
    - `stopFollowingFailed(symbol, reason)`
    - `stoppedFollowing(symbol)`
  - **Stop failures.**
    - `STOP_REFUSAL_REASONS: Readonly<Record<"instrument_not_found" | "instrument_already_retired", string>>`, with the two clauses of DEC-0377.
    - `isStaleRowRefusal(error: unknown): boolean`, true exactly for an `ApiError` whose `code` is one of those two keys.
    - `stopFailureReason(error: ApiError | ApiUnreachableError): string`, which returns the mapped clause or else `readFailureReason(error)` (S1).

  A doc comment above `STOP_REFUSAL_REASONS` and `START_REFUSALS` states:
  - The keys are wire codes from the delivered routes (`instruments.py` l.113–125, `runs.py` l.86–97), selected by `ApiError.code`. The envelope `message`, which carries domain terms, is never rendered (ux-design 0.7; register C13; AC-19).
  - `history_depth_not_set` wins when both preconditions fail (`runs.py` l.77–78).

  No unit or hex literal appears, comments included. Makes T006 pass, and supplies T002–T008.
- [ ] T010 Create `web/src/screens/data-health/download-now.tsx` exporting `DownloadNow({ label = DOWNLOAD_NOW }: { label?: string })` (DEC-0379).
  - **Reads.** `const { refresh } = useShell()` from `../../app/shell-context`. `startAcquisitionRun`, `ApiError` and `ApiUnreachableError` come from `../../api/client`, `Button` from `../../components/ui/button`, and `Link` from `react-router-dom`.
  - **State.**
    - `outcome: null | { kind: "queued" } | { kind: "refused"; code: keyof typeof START_REFUSALS } | { kind: "failed"; reason: string }`
    - `busy: boolean`
    - a `pending` ref, which ignores re-entrant clicks, following the delivered `run-controls.tsx` l.52–56 and l.115–117
  - **`start()`.**
    - Clear `outcome` and set `busy`.
    - `const result = await startAcquisitionRun()`, called with no argument: it always covers the whole followed list, with no per-stock retry (D-9).
    - When `result.queuedBehind === null`, call `refresh("attention")`. Otherwise set `queued`.
    - **Catch.** An `ApiError` whose `code` is a key of `START_REFUSALS` sets `refused`. Any other `ApiError` or `ApiUnreachableError` sets `failed`, with `readFailureReason(cause)`. Anything else sets `failed` with the same function's `ApiError` sentence, by passing a plain `ApiError`, so no thrown value's text is ever shown.
    - `finally` clears `busy`.
    - It never navigates and never confirms (blueprint §9; data-health-ui 2.7).
  - **Markup.** `<div className="flex flex-col gap-1">` holding, in order:
    1. `<Button variant="default" aria-busy={busy || undefined} onClick={() => { if (!pending.current) void start(); }}>{label}</Button>`. There is never a `disabled` attribute.
    2. When `queued`: `<output className="text-xs text-muted-foreground">{QUEUED_NOTICE}</output>`. This is the button's helper line (ux-design 1.4), and `output` makes it a polite status.
    3. When `refused`: `<p role="status" className="text-sm">{entry.sentence}</p>`, then `<Button variant="outline" asChild><Link to={entry.to}>{entry.fix}</Link></Button>`.
    4. When `failed`: `<p role="status" className="text-sm">{startFailed(reason)}</p>`, then `<Button variant="outline" onClick={() => void start()}>{TRY_AGAIN}</Button>`. This is the CAP-003-E1-S9 error convention that S1's `ReadFailure` follows: the sentence goes in `status` and the control sits outside it.
  - **Doc comment.** Cite data-health-ui 2.7 and 2.2, DAC-E6-11, DAC-E6-S2-1, AC-15, AC-17 and D-9. State that the AC-20 one-tier rule does not apply, because no status renders here (DAC-E6-S2-4). State that the queued branch does not refresh attention, per data-health-ui 2.2's alt branch. State that Data health renders no `blocked` pre-check, per Resolved Conflict 1.

  Depends on T009. Makes T002, T003, and the Download now halves of T007 and T008, pass.
- [ ] T011 Create `web/src/screens/data-health/stop-following-dialog.tsx` exporting `StopFollowingDialog(props: { symbol: string | null; onClose: () => void; onStopped: () => void; onRefusalClosed: () => void; fallbackFocusRef: RefObject<HTMLElement | null> })` (DEC-0379).
  - **Open state.** The dialog is open while `symbol !== null`. A `lastSymbol` ref keeps the most recent non-null symbol, so the title never renders `null` while Radix unmounts.
  - **State.**
    - `pending: boolean`
    - `failure: null | { sentence: string; staleRow: boolean }`, reset to `null` whenever `symbol` changes
    - `announcement: { text: string; serial: number }`
    - `opener` ref
    - `watchRowExit` ref (boolean)
  - **Opener capture.** In a `useLayoutEffect` keyed on `symbol`, when it turns non-null, record `document.activeElement` as `opener` and set `watchRowExit` false. This runs before CAP-003-E1-S3's `ConfirmDialog` moves focus to **Cancel**.
  - **`confirm()`.**
    - Set `pending` and clear `failure`.
    - `await retireInstrument(symbol)`.
    - **On success, in this order:**
      1. Set `watchRowExit` true.
      2. Call `props.onClose()`, which closes the dialog. `ConfirmDialog` returns focus to the opener while it is still connected.
      3. Call `props.onStopped()`, the caller's aggregate re-read.
      4. Call `refresh("attention")`, from `useShell()`.
      5. Set `announcement` to `{ text: stoppedFollowing(symbol), serial: prev + 1 }`.
    - **On a caught error.** Set `failure` to `{ sentence: stopFollowingFailed(symbol, stopFailureReason(e)), staleRow: isStaleRowRefusal(e) }`. The dialog stays open.
    - `finally` clears `pending`.
  - **`onOpenChange(next)`.** When `next` is false (from `Esc`, **Cancel** or the overlay; `ConfirmDialog` already ignores these while `pending`):
    - If `failure?.staleRow`, set `watchRowExit` true and call `props.onRefusalClosed()` once.
    - Clear `failure`.
    - Call `props.onClose()`.
  - **Markup.**
    - `<ConfirmDialog open={symbol !== null} onOpenChange={…} title={stopFollowingTitle(s)} description={stopFollowingDescription(s)} confirmLabel={STOP_FOLLOWING} onConfirm={() => void confirm()} pending={pending}>`. Its child, when `failure` is set, is `<p role="status" className="text-sm">{failure.sentence}</p>`.
    - A sibling, always mounted outside the dialog: `<output aria-live="polite" className="sr-only"><span key={announcement.serial}>{announcement.text}</span></output>`, following the delivered `results-table.tsx` l.684–685 pattern.
  - **Fallback focus.** A `useEffect` with no dependency list runs after every render. The caller re-renders this component whenever its rows change, so it sees each change. When all three of the following hold, it focuses `props.fallbackFocusRef.current` and clears `watchRowExit`:
    - `watchRowExit` is true.
    - `opener.current` is no longer connected.
    - `document.activeElement` is `null` or `document.body`.

    It also clears `watchRowExit` once focus is on any element other than `body` and the opener. This implements data-health-ui 10 ("focus returned to the row's **Stop following** or, when the row has left, to the *Needs fixing* heading"). It never moves focus the owner has placed elsewhere (STD-UI-24: never move focus).
  - **Doc comment.** Cite data-health-ui 2.7 and 10, DAC-E6-12, DAC-E6-S2-2, AC-14, AC-17 and AC-25, and blueprint §9. It covers:
    - The `confirm` variant and never `destructive`, because history is kept (STD-UI-2).
    - That no toast is raised.
    - That the AC-20 rule does not apply here (DAC-E6-S2-4).
    - The caller contract in Other Notes: render it beside the rows so it re-renders with them, give the heading `tabIndex={-1}`, and decide what `onRefusalClosed` re-reads.

  Depends on T009. Makes T004, T005, and the dialog halves of T006–T008, pass.

**Checkpoint**: `npx vitest run web/src/screens/data-health` is green, which includes S1's two files. The module gains exactly `DownloadNow`, `StopFollowingDialog` and the `copy.ts` additions.

---

## Phase 4: Integration

**Purpose**: Prove that the new files sit cleanly in the delivered suite and the shared scans.

- [ ] T012 Run the whole Vitest suite (`npm run test`) unchanged. It includes `web/src/api/render.test.tsx`, which forbids `dangerouslySetInnerHTML` anywhere under `web/src`, so reasons render as text (data-health-ui 4). It also includes `web/src/components/token-literals.test.ts` (CAP-003-E1-S1), whose directory list CAP-003-E6-S5 widens to this directory (DAC-E6-S5-4).
  - Run that future scan by hand now: `grep -nE "[0-9](px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(" web/src/screens/data-health/download-now.tsx web/src/screens/data-health/stop-following-dialog.tsx web/src/screens/data-health/copy.ts` must print nothing.
  - `grep -nE "components/ui/toast|StatusBadge|NotDeterminable|navigate\(" web/src/screens/data-health/download-now.tsx web/src/screens/data-health/stop-following-dialog.tsx` must print nothing. These two files raise no toast, render no badge and never navigate programmatically (DAC-E6-12, DAC-E6-S2-4). The words appear in neither file's doc comment, so T010 and T011 must write *toast*, *status badge* and *not determinable* in prose without those identifiers.
  - Confirm with `git status --short web/ package.json` that the only changes are the four new files and the `copy.ts` edit, and that no delivered or sibling-story file and no `package.json` change appears (traces to AC-17, AC-26).

**Checkpoint**: The whole suite is green, both scans are clean, and only this story's five files changed.

---

## Phase 5: Polish

**Purpose**: Run the validation commands and record the TDD evidence.

- [ ] T013 Run `npm run lint`, `npm run format` and `npx tsc --noEmit` from the repo root.
  - Format only the changed files: `npx biome format --write web/src/screens/data-health/download-now.tsx web/src/screens/data-health/download-now.test.tsx web/src/screens/data-health/stop-following-dialog.tsx web/src/screens/data-health/stop-following-dialog.test.tsx web/src/screens/data-health/copy.ts`.
  - `tsc` checks that `START_REFUSALS` and `STOP_REFUSAL_REASONS` are indexed only by their literal key unions.
  - Then run `npm run build`.
  - Finally, run the mutation pass over the three production files, with the hand-written mutants in Other Notes: `python3 scripts/mutation-run.py run --command "npx vitest run web/src/screens/data-health && npx tsc --noEmit"`. It must leave no surviving non-equivalent mutant (traces to AC-15, AC-14).
- [ ] T014 After each TDD cycle, and not once at the end, do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Append the cycle to `CAP-003-E6-S2-tdd-evidence.yaml` beside this story, with:
    - `code_review_verdict`
    - `spec_drift.drift_detected`
    - `tests_executed: true`
    - its RED/GREEN evidence
    - the structured `mutation:` block that `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change
    - `diff_sha256`: the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`, and no per-cycle commit is planned.

  The cycles:
  1. T006 (Download now half), T009 (Download now strings) and T002, T003 and T010.
  2. T006 (stop half), T009 (stop strings), T004, T005 and T011.
  3. T007 and T008. These are tests only, so the cycle joins cycle 2's evidence if no production change follows, or is recorded with `mutation: {not_applicable: …}`.

  T012 and T013 add no behaviour and join cycle 3's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC).

**Checkpoint**: Every acceptance criterion is satisfied, all validation passes, and a TDD-evidence cycle entry names every behaviour-changing change.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S1 | hard | `Button` (`default`, `outline`, `asChild`) from `web/src/components/ui/button.tsx` (E1-S1 plan T013). Existing edge |
| CAP-003-E1-S3 | hard | `ConfirmDialog` from `web/src/components/ui/dialog.tsx` (E1-S3 plan T012, DEC-0301); `toast` is only mocked to prove that none is raised. Existing edge |
| CAP-003-E3-S3 | hard | `useShell().refresh("attention")` from `web/src/app/shell-context.tsx` (E3-S3 plan T009). Existing edge |
| CAP-003-E6-S1 | hard | `web/src/screens/data-health/copy.ts`, which this story extends, and its `TRY_AGAIN` and `readFailureReason` (S1 plan T012, DEC-0373). Existing edge |
| CAP-003-E6-S3 | reverse | `problem-row.tsx` renders the *Not found* row's **Stop following** (`ghost`) that opens `StopFollowingDialog`. `needs-fixing.tsx` renders `DownloadNow` when a row is retryable and owns the heading `fallbackFocusRef` points at. Graph: S3 depends on S2 |
| CAP-003-E6-S5 | reverse | `DataHealthScreen` passes `<DownloadNow />` into S1's `Verdict` `downloadNow` slot and `<DownloadNow label=… />` into the empty card, and supplies `useDataHealth().retry` as the aggregate re-read. Graph: S5 depends on S2 |
| CAP-003-E6-S6 | context | Its end-to-end journeys (TC-INT-019, TC-E2E-003) drive these components on the real stack. It reaches S2 through S5 and S7 |
| CAP-003-E1-S9 | context | Its `StateRegion` error convention (a `role="status"` sentence, then **Try again** `outline` outside it; DEC-0314) is followed by the failure lines here. Nothing is imported |

No new hard dependency was found, so no edge is added to `CAP-003-E6-S2: [CAP-003-E3-S3, CAP-003-E1-S3, CAP-003-E1-S1, CAP-003-E6-S1]`.

### Task Dependencies

- T001 has no dependencies.
- T002, T003, T006 (Download now half), T007 and T008 (Download now halves) share `download-now.test.tsx`, so they run in that order, after T001.
- T004, T005, T006 (stop half), T007 and T008 (dialog halves) share `stop-following-dialog.test.tsx`, so they run in that order, after T001. This chain can run in parallel with the `download-now.test.tsx` chain.
- T009 depends on T001, with its tests written first, per the T014 cycles.
- T010 and T011 each depend on T009. They are different files, so they can run in parallel.
- T012 depends on T010 and T011.
- T013 depends on T012.
- T014 is interleaved: it runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- The two test files can be written in parallel.
- T010 and T011 can be written in parallel once T009 exists.

---

## Validation Plan

### Constitution-Defined Commands

These are the `docs/constitution/tech-stack.md` v7 Validation Commands, run from working directory `.`.

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test` (Vitest; it also drives a real Vite build)
- Lint: `npm run lint`
- Format: `npm run format` (a check only)
- Type check: `npx tsc --noEmit`

The Python commands do not apply, because no file under `src/` is touched. `npm run test:e2e` does not apply either, because no end-to-end case belongs to this story.

### Story-Specific Validation

- **AC-15, DAC-E6-11 and DAC-E6-S2-1.** T002 and T003 pass:
  - each `409` names its own fix and link
  - a transport failure offers **Try again**
  - a `202` refreshes attention or shows the queued line
  - `startAcquisitionRun` is called with no argument and never twice in flight
  - `grep -nE "ConfirmDialog|components/ui/dialog" web/src/screens/data-health/download-now.tsx` prints nothing, so no confirmation is wired in. The doc comment's prose "no confirmation" is deliberately not what this grep matches
- **AC-14, AC-17 and DAC-E6-12.** T004 and T005 pass:
  - `retireInstrument` is called with the row's symbol only after confirmation
  - the wording is verbatim
  - `confirm` is used and never `destructive`
  - `200` closes the dialog, re-reads, refreshes attention and announces without a toast
- **DAC-E6-S2-2.** T005 (a)–(c) pass: a refusal stays inside the dialog, `Esc` closes it, and `onRefusalClosed` fires exactly once.
- **AC-25.** T004 (c)–(e) and T005 (b), (f)–(i) pass: Cancel comes first and is focused, focus is trapped, and focus returns to the row's button or the heading and is never stolen.
- **DAC-E6-S2-3 and AC-19.** T007 passes over every state. As a source cross-check, run `grep -niE "\b(instrument|acquisition|acquire|run|runs|retire|retired)\b" web/src/screens/data-health/download-now.tsx web/src/screens/data-health/stop-following-dialog.tsx web/src/screens/data-health/copy.ts`. Every line it prints must be a comment line (`//` or ` * `) that cites a delivered file such as `runs.py`; no printed line may hold a string literal. Identifiers such as `retireInstrument`, `startAcquisitionRun` and wire codes such as `instrument_not_found` never match, because `\b` does not split them.
- **DAC-E6-S2-4 and AC-20.** T008 passes, and T012's second grep is clean.

---

## Notes

### Resolved Conflicts

1. **A `blocked` **Download now** on Data health while the depth is unset.**
   - ux-design 1.9 (Settings, Interaction Flows) carries CAP-001 v5 §1.3 forward: "until it is set every **Download now** across the interface renders `blocked` with the depth reason".
   - Epic DAC-E6-11, data-health-ui 2.7 and DAC-E6-S2-1 specify Data health's **Download now** with no `blocked` state. With history depth unset, the action posts and renders the `409` refusal *Couldn't start the download: history depth isn't set.* with **Set history depth**. TC-INT-023 has the same precondition and expected result: "History depth unset; a retryable row".
   - **Governing:** epic DAC-E6-11, which ranks above design prose, together with the component design data-health-ui 2.7, the more specific statement. `DownloadNow` takes no depth input and renders no `blocked` pre-check (T010). The ux-design 1.9 sentence describes the taken-over CAP-001 screens' start control, which CAP-003-E7 rebuilds.
2. **TC-COMP-164's "A value no artifact can determine goes through `NotDeterminable`".** The story's DAC-E6-S2-4 template clause reads "When rendered, Then each goes through `StatusBadge`…" for controls that render no status. **Governing:** the story's first clause ("no status badge renders in these controls, so the one-tier rule is recorded as not applicable here"), as coverage-matrix note 7 records for exactly this DAC. T008 asserts the absence and that no state is conveyed by colour.
3. **What a refusal "refreshes on close".** DAC-E6-12 and DAC-E6-S2-2 say the row is refreshed on close after a `404` or `409`. DAC-E6-15 lists the aggregate reads (load, **Try again**, the terminal transition, a successful **Stop following**) and does not list a refusal.
   - **Governing for this story:** both, satisfied by keeping them apart. `StopFollowingDialog` calls a distinct `onRefusalClosed` callback on that close (T005), never `onStopped`, so the re-read a refusal triggers is the caller's choice and cannot silently add an aggregate read.
   - Which read CAP-003-E6-S3 wires there is recorded under Open Gaps 4. It is not adopted here.

### Open Gaps

1. **The `{reason}` of a stop-following refusal. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0377.**
   - **What is undetermined.** DAC-E6-12 and data-health-ui 2.7 require *Couldn't stop following {SYMBOL}: {reason}.* for `404` and `409`, and ux-design 0.7 says "the envelope's `code` selects the wording". No artifact gives the wording. The delivered envelope messages, *no instrument exists for symbol 'FBXX'* and *instrument 'FBXX' is already retired* (`src/factorflow/api/routes/instruments.py` l.113–125), use two terms AC-19 forbids.
   - **What the plan adopts (T006, T009).**
     - `instrument_already_retired` gives *you already stopped following it*.
     - `instrument_not_found` gives *FactorFlow doesn't follow it*.
     - Any other failure uses CAP-003-E6-S1's `readFailureReason` (*FactorFlow hit an unexpected problem* / *FactorFlow is not answering*).
     - Only the two codes make the row stale and trigger `onRefusalClosed`.
   - **Derivation.**
     - The `409` is "already stopped" in ux-design 1.4, the UX brief l.288 and system design §3.4 ("409 already stopped or 404"). It is rendered in the STD-UI-1 v6 label *Stopped following* (ux-design 1.6 Labels: *Retire* → *Stop following*).
     - The `404` follows the delivered CAP-002 sentence for the same code, *FactorFlow doesn't follow that stock.* (`web/src/screens/research/copy.ts` l.189–192). It is shortened to a clause because the symbol already opens the sentence.
   - **Alternatives rejected.** Rendering `ApiError.message` (AC-19; register C13). One shared sentence for both codes, which would hide that a `409` means the stop already happened.
   - **Classification.** Contained to this story's `copy.ts`.
   - **Owning design.** data-health-ui 2.7, at its next revision.
2. **The `{reason}` when **Download now** fails other than by a known `409`. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0378.**
   - **What is undetermined.** DAC-E6-S2-1 requires *Couldn't start the download: {reason}.* with **Try again** on a transport failure. No artifact gives `{reason}`, or the rendering of a `500` or an unknown `409` code.
   - **What the plan adopts (T002, T010).**
     - An `ApiUnreachableError` gives *FactorFlow is not answering*.
     - Any `ApiError` other than the two refusal codes gives *FactorFlow hit an unexpected problem*.
     - Both come through S1's `readFailureReason` (DEC-0373), with **Try again** re-posting.
     - An unknown `409` code is never shown as either refusal.
   - **Derivation.**
     - It is the same two-case reason S1 derived for the reads: ux-design 0.5's *FactorFlow is not answering.* and CAP-002's `FALLBACK_ERROR`.
     - DEC-0373 scoped itself to reads and left write-path codes to the write stories. This plan applies it to the write's non-refusal failures rather than coining a third wording.
     - **Try again** re-posts, because the server queues a duplicate behind a running download rather than double-running it (AC-15).
   - **Classification.** Contained. It consumes S1's function and adds no export for others.
   - **Owning design.** data-health-ui 2.7, at its next revision.
3. **The two components' interfaces. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0379.**
   - **What is undetermined.** data-health-ui 2.1 names the files only. The story says the dialog "calls the caller's aggregate re-read" and returns focus "to the *Needs fixing* heading" when the row has left. **Start the first download** is "the same post as Download now" (ux-design 1.4 States). No artifact fixes the props, the refusal-close seam, or how the dialog learns the row has left. The dialog closes before the aggregate re-read answers, so the row leaves later.
   - **What the plan adopts (T003 (f), T004, T005, T010, T011).**
     - `DownloadNow({ label? })`, which defaults to *Download now*.
     - `StopFollowingDialog({ symbol: string | null, onClose, onStopped, onRefusalClosed, fallbackFocusRef })`. It is open while `symbol` is non-null, and it is rendered once beside the rows, not inside each row, so its polite announcement survives the row leaving.
     - After a stop, or after a refusal close, it moves focus to `fallbackFocusRef` only once the opener has left the document and focus has fallen to `body`.
   - **Derivation.**
     - The delivered `StartRunControl` takes a `label` for the same reason (`web/src/screens/runs/run-controls.tsx` l.21–22, DEC-0004).
     - CAP-003-E1-S3's `ConfirmDialog` is controlled and restores focus only to a still-connected opener (its Other Notes, focus restore). That leaves the "row has left" case to the consumer, which this component is.
     - STD-UI-24 (polling and a row leaving "announce politely and never move focus") is why focus is moved only from `body`.
     - The delivered `results-table.tsx` keyed live region is the announcement precedent.
   - **Classification.** Propagating. CAP-003-E6-S3 must render `StopFollowingDialog` beside its rows, give its `h2` `tabIndex={-1}` and a ref, pass the aggregate re-read through as `onStopped`, choose `onRefusalClosed` (Open Gaps 4) and render `DownloadNow`. CAP-003-E6-S5 passes `DownloadNow`, and `label` for the empty card.
   - **Owning design.** data-health-ui 2.1 and 2.7, at its next revision.
4. **Which read "refreshes the row" after a refusal is not decided here. This is a genuine gap that CAP-003-E6-S3 owns.**
   - **The options.** Either an aggregate `retry()` or re-fetching the loaded problem pages (`fetchProblems`). Register G4 lists both.
   - **Why it is not decided here.** This story fixes only that `onRefusalClosed` fires exactly once, on the close that follows a `404` or `409` (Resolved Conflict 3). It does not pick the read. An aggregate `retry()` is simplest, but it is an aggregate read that DAC-E6-15's list does not name. Re-fetching the pages keeps DAC-E6-15 literal, but then the header count and the rows come from different responses (data-health-ui 3, "one problem set").
   - **Owning design.** data-health-ui 2.5 and 2.7, with the decision to be recorded by CAP-003-E6-S3's plan.

### Other Notes

- **Caller contract (for CAP-003-E6-S3 and CAP-003-E6-S5).**
  - `<DownloadNow />` is self-contained. It needs a Router and `ShellProvider` above it, and it renders its own helper, refusal and failure lines beneath the button. The header and *Needs fixing* each render their own instance, so each keeps its own line.
  - `StopFollowingDialog` needs to be rendered by the component that renders the rows. Its fallback-focus effect runs on that component's re-renders, so do not wrap it in `memo`.
  - `fallbackFocusRef` points at the *Needs fixing* `h2` with `tabIndex={-1}`. When the card falls to *Nothing needs fixing.* and the heading is gone, the ref is `null` and nothing is focused.
  - `onStopped` is the aggregate re-read (`useDataHealth().retry`), which DAC-E6-15 lists ("after a successful **Stop following**").
  - The row's trigger button is S3's. It is named *Stop following {SYMBOL}* (data-health-ui 10) and calls `setOpenFor(symbol)`.
- **Status, not alert.** Refusal and failure sentences use `role="status"` (polite), following CAP-003-E1-S9's adopted convention (DEC-0314) and S1's `ReadFailure`. The delivered CAP-001 `retire-dialog.tsx` used `role="alert"`, and CAP-003-E7 rebuilds it. The queued helper line is an `<output>`.
- **No `StartRunControl` reuse.** The delivered `web/src/screens/runs/run-controls.tsx` renders CAP-001 wording (*Start acquisition run*, *A run is in progress…*), navigates to the run's detail on `202` and shows `requestId`. All three are wrong on Data health (AC-19; ux-design 0.7; DAC-E6-11). It is CAP-003-E7's to rebuild, so it is left untouched here.
- **Refusal-only refresh.** `onRefusalClosed` fires only for the two stale-row codes. A `500` or a transport failure leaves the row as it was, so closing the dialog re-reads nothing (T005 (e)).
- **No per-row download.** `DownloadNow` takes no symbol (T003 (d)). Whether it appears in *Needs fixing* (only with a retryable row) is S3's condition (DAC-E6-9).
- **Integration cases.** TC-INT-019 to TC-INT-024 drive these components on the real stack in Phase 6b. TC-INT-020's "both codes follow the same path" is consistent with T005 (c).
- **Hand-written mutants** (add these to the mutation run beside the generated ones):
  - `web/src/screens/data-health/download-now.tsx`: `result.queuedBehind === null` → `result.queuedBehind !== null`
  - `web/src/screens/data-health/download-now.tsx`: `refresh("attention")` → (deleted)
  - `web/src/screens/data-health/download-now.tsx`: `if (!pending.current) void start();` → `void start();`
  - `web/src/screens/data-health/download-now.tsx`: `startFailed(reason)` → `startFailed(cause.message)` (in the catch)
  - `web/src/screens/data-health/stop-following-dialog.tsx`: `if (failure?.staleRow)` → `if (true)`
  - `web/src/screens/data-health/stop-following-dialog.tsx`: `refresh("attention")` → (deleted)
  - `web/src/screens/data-health/stop-following-dialog.tsx`: the `document.activeElement === document.body` guard → `true`
  - `web/src/screens/data-health/stop-following-dialog.tsx`: `key={announcement.serial}` → (removed). This is equivalent under RTL text assertions but not for screen readers, so record it as equivalent with that reason if T005 (j) cannot observe it.
  - `web/src/screens/data-health/copy.ts`: swap the two `STOP_REFUSAL_REASONS` values
- **No self-contradicting check.** The term scan runs over rendered text and accessible names, never over source. The T012 grep for `components/ui/toast|StatusBadge|NotDeterminable|navigate\(` applies to production files only. T010 and T011 are told to keep those identifiers out of their doc comments, and the test files, which do mock `toast`, are excluded.
