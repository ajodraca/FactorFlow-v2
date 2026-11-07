---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S7-tasks
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
  timestamp: 2026-11-07T07:01:36Z
  source_artifacts:
    - id: CAP-003-E3-S7
      version: "1"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-owner-shell-tests
      version: "1"
    - id: CAP-003-E3-S6-tasks
      version: "1"
    - id: CAP-003-E3-S3-tasks
      version: "1"
    - id: CAP-003-E1-S3-tasks
      version: "1"
    - id: CAP-003-E1-S5-tasks
      version: "1"
    - id: CAP-003-E1-S6-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E3-S7 — Completion Toast: One Toast per Terminal Transition, None Where the Outcome Is Already Visible

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S7.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/app/`; design `owner-shell`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Creates `web/src/app/download-toast.ts`, the completion-toast watcher of owner-shell §2.9 (epic DAC-E3-13). It reads `useShell().attention` (CAP-003-E3-S3) and the router location. When the previous successful attention answer's `latest_download.state` was non-terminal (`requested`, `running`, `cancelling`) and this answer's is terminal, it raises exactly one toast through CAP-003-E1-S3's `toast`:

- the variant follows the one tier function (CAP-003-E1-S5's `tierOf`): `good` (*Complete*) → `success`; `warning` (*Partial*) and `serious` (*Interrupted*) → `warning`; `critical` (*Failed*) → `error`; `neutral` (*Cancelled by you*) → no toast;
- the title is `formatDownloadName(started_at, requested_at)` (CAP-003-E1-S6), e.g. *Download 2026-10-15 17:31 CDT*;
- the body renders the outcome label from `labelOf` through `StatusBadge` with its tier shape, and a link to `/data/downloads/{run_id}` (DEC-0338);
- no toast is raised while the location is `/data/downloads/{that run_id}`, `/data/downloads` or `/data`, which already show the outcome.

`error` and `warning` toasts persist until dismissed and no toast takes focus or is announced assertively; both properties come from CAP-003-E1-S3's `toast` wrapper and are asserted here for this story's toasts (AC-25). The first answer after mount never toasts, because no transition was observed (DAC-E3-S7-2). `shell.tsx` (CAP-003-E3-S6) gains one import and one `<DownloadToast />` mount line beside its `<Toaster />`. The toast's two strings go into the shell's `copy.ts` (CAP-003-E3-S6), as DAC-E3-S7-3 requires (Resolved Conflict 1). No package, route, endpoint, schema or browser storage is added.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-12 | No surface presents a partial or interrupted download as complete: the variant follows `tierOf` (*Partial* and *Interrupted* are `warning`, never `success`) | T002, T006, T010, T011 |
| AC-25 | Toasts never take focus and are announced politely; `error` and `warning` persist until dismissed | T007, T010, T011 |
| DAC-E3-13 | One toast per non-terminal-to-terminal transition with the stated variants, named by start time, linking to the detail; none on the three routes that show the outcome | T002, T003, T006, T008, T010, T011, T009 |
| DAC-E3-S7-1 | `running` → `partial` on `/home`: exactly one `warning` toast *Download {start time}* with label *Partial*, linking to `/data/downloads/{id}`; the same on `/data`: none | T002, T006, T010, T011, T009 |
| DAC-E3-S7-2 | First answer after mount already terminal: no toast | T003, T006, T008, T011 |
| DAC-E3-S7-3 | Title, label and link carry none of the DAC-E7-3 terms; labels from `labelOf` or `copy.ts` | T004, T010, T011 |
| DAC-E3-S7-4 | Outcome label through `StatusBadge` with label text and `aria-hidden` shape; no state by colour alone; not-determinable values through `NotDeterminable` | T005, T011 |

Mapped test cases (`tests/component/owner-shell-tests.md`; `tests/coverage-matrix.md` lines 158 and 194-197, per-story count "4 of 4" at line 409):

- **TC-COMP-094** (DAC-E3-S7-1, DAC-E3-13, AC-12) — T002.
- **TC-COMP-095** (DAC-E3-S7-2, DAC-E3-13) — T003.
- **TC-COMP-096** (DAC-E3-S7-3, AC-19) — T004.
- **TC-COMP-097** (DAC-E3-S7-4, AC-20) — T005.

TC-COMP-013 (toast persistence and politeness) is CAP-003-E1-S3's and is not re-implemented; T007 asserts the same properties for this story's own toasts.

## Phase 1: Setup

**Purpose**: Confirm the inputs. No package, configuration or directory is added.

- [ ] T001 Confirm the hard prerequisites are in the working tree before Phase 2. No file is created or edited; record the `grep -n` outputs in the first TDD cycle's evidence.
  - CAP-003-E3-S6: `web/src/app/shell.tsx` with the private `Frame()` rendering `<Toaster />`, and `web/src/app/copy.ts` exporting `SHELL_COPY`.
  - CAP-003-E3-S3: `web/src/app/shell-context.tsx` exporting `ShellProvider`, `useShell` (which throws outside a provider, DEC-0326) and `type ShellContextValue`.
  - CAP-003-E3-S1: `web/src/app/shell-types.ts` exporting `type Attention` (snake_case `latest_download { run_id, state, requested_at: string, started_at: string | null, … } | null`) and `type ReadState`.
  - CAP-003-E1-S3: `web/src/components/ui/toast.tsx` exporting `Toaster` and `toast` with `success`, `warning`, `error` taking `(message: string, options?: { description?, action? })` (DEC-0302), and `sonner` in `package.json`.
  - CAP-003-E1-S5: `web/src/components/patterns/tiers.ts` (`tierOf`, `labelOf`, `type Tier`, `type Status`) and `status-badge.tsx` (`StatusBadge({ tier, children: string, className? })`).
  - CAP-003-E1-S6: `web/src/components/patterns/format.ts` exporting `formatDownloadName(startedAt: Instant | null, requestedAt: Instant)` (DEC-0309).
  - Run `npm run test` and record the baseline as green.

**Checkpoint**: Every listed module exists with the named exports and the suite is green before this story's first edit.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the transition rule, the variant, the suppression routes, the toast's content and its accessibility.

**Shared harness for `web/src/app/download-toast.test.tsx`** (one new file; every task below writes into it, so they run in sequence):

- **Shell context.** `useShell()` throws outside `ShellProvider` (DEC-0326), so the file mocks it with a pass-through, as that decision allows:

  ```ts
  const override = vi.hoisted(() => ({ value: null as ShellContextValue | null }));
  vi.mock("./shell-context", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./shell-context")>();
    return { ...actual, useShell: () => override.value ?? actual.useShell() };
  });
  ```

  `shellWith(attention: ReadState<Attention>)` sets `override.value` to `{ health, attention, scores: { kind: "loading" }, refresh: vi.fn(), setTitleDetail: vi.fn() }`, where `health` is a literal `ShellContextValue["health"]` in the answering state. `override.value` is reset to `null` in `afterEach`.
- **Fixtures** (independent literals typed `Attention`, never produced by the code under test):
  - `ATTENTION_BASE`: `checked_at: "2026-10-15T22:40:00Z"`, `followed_count: 40`, `prices_as_of: "2026-10-14"`, `credential_present: true`, `problems { stock_count: 0, symbols: [], newest_completed_at: null }`, `latest_terminal_download: null`, `items: []`, `latest_download: null`.
  - `download(state, overrides?)`: `{ run_id: "run-7", state, requested_at: "2026-10-15T22:30:00Z", started_at: "2026-10-15T22:31:00Z", ended_at: null, progress: { done: 12, total: 40 } }` with `overrides` spread last.
  - `answer(latest)`: `{ kind: "ok", data: { ...ATTENTION_BASE, latest_download: latest }, checkedAt: new Date("2026-10-15T22:40:00Z") }` — a new object per call, as each poll's answer is.
  - `failed(last)`: `{ kind: "error", error: new ApiUnreachableError("x"), last }`.
  - `TITLE = "Download 2026-10-15 17:31 CDT"` (the start time); `TITLE_REQUESTED = "Download 2026-10-15 17:30 CDT"` (the request time, for `started_at: null`).
- **Render.** `renderWatcher(path)` renders `<MemoryRouter initialEntries={[path]}><DownloadToast /><Toaster /><NavProbe /></MemoryRouter>` and returns `{ step(next: ReadState<Attention>), go(path) }`: `step` sets `shellWith(next)` and calls `rerender` with the same tree inside `act`; `go` calls the `navigate` function a local `NavProbe` component captures from `useNavigate()`, inside `act`. `<DownloadToast />` is imported from `./download-toast`, `Toaster` and `toast` from `../components/ui/toast`.
- **Observation.** `vi.spyOn(toast, "success" | "warning" | "error")` in `beforeEach` (call-through), so "none" is a synchronous, exact count. Rendered toasts are `document.querySelectorAll("[data-sonner-toast]")`, read after `await screen.findByText(…)`; each toast's variant is its `data-type` attribute (the observation CAP-003-E1-S3's T010 relies on).
- **Timers.** `vi.useFakeTimers({ shouldAdvanceTime: true })` (sonner queues its state update on a timer; CAP-003-E1-S3 T003 precedent); `afterEach` calls `toast.dismiss()` from `sonner` (module-global store), unmounts and restores real timers.
- **Vocabulary.** A local `forbiddenTerms(text) = text.match(/\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/gi) ?? []`, the DAC-E7-3 list, as CAP-003-E3-S6's tests define it locally.

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-094 (one warning toast on running to partial, none on /data) in a new `web/src/app/download-toast.test.tsx`, with a `// Implements TC-COMP-094` comment (traces to DAC-E3-S7-1, DAC-E3-13, AC-12).
  - **(a) Step 1 on `/home`.** `step(answer(download("running")))`, then `step(answer(download("partial")))`. `toast.warning` was called exactly once and `toast.success` / `toast.error` never. After `await screen.findByText(TITLE)` there is exactly one `[data-sonner-toast]`; its `data-type` is `"warning"`; within it the badge text is exactly `Partial`; `within(toastEl).getByRole("link")` has `href` `"/data/downloads/run-7"`.
  - **(b) Step 2 on `/data`.** The same two answers in a fresh render at `/data`: no spy was called, and after advancing 500 ms no `[data-sonner-toast]` exists.
  - **(c) TC edge cases (`it.each`, on `/home`).** `running` → `succeeded`: one `success` toast, badge `Complete`. `running` → `failed`: one `error` toast, badge `Failed`. `running` → `abandoned`: one `warning` toast, badge `Interrupted` (the toast variant is `warning`; the badge tier is `serious`, T005). `running` → `cancelled`: no spy called, no toast.
  - **(d) The suppression is exact (owner-shell §2.9).** `it.each` over the location after a `running` → `partial` transition:
    - `/data`, `/data/`, `/data/downloads`, `/data/downloads/run-7`: none;
    - `/data/downloads/run-8` (another download's detail), `/data/coverage`, `/data/followed`, `/settings`, `/research`: exactly one `toast.warning` call.
  - Kills: swap-case on the variant map (`serious → "warning"` to `"error"`): (c) *Interrupted*; negate-boolean on the suppression test: (a) and (b); negate-boolean on `params.runId === run_id`: (d) `run-7` and `run-8`; drop-defaulted-argument `end: true` on the `/data` pattern (prefix match): (d) `/data/coverage`; swap-case on the `neutral → null` row (`neutral → "success"`): (c) *cancelled*.
- [ ] T003 Implement TC-COMP-095 (no toast when the first answer after mount is already terminal) in `web/src/app/download-toast.test.tsx`, with a `// Implements TC-COMP-095` comment, sequential with T002 (traces to DAC-E3-S7-2, DAC-E3-13).
  - **(a) Step 1.** `it.each` over the five terminal states: the first answer is `answer(download(state))`; no spy is called and no toast renders after 500 ms.
  - **(b) A loading state first.** `step({ kind: "loading" })`, then `answer(download("succeeded"))`: still no toast — loading is not an answer.
  - **(c) TC edge: a later transition.** Continuing (a) with `succeeded` first: `answer(download("running", { run_id: "run-8" }))`, then `answer(download("succeeded", { run_id: "run-8" }))` raises exactly one `toast.success`, whose link `href` is `/data/downloads/run-8`.
  - **(d) StrictMode.** The same as (a) and (c), rendered inside `<StrictMode>`: the double-invoked mount effect raises nothing, and the transition still raises exactly one toast.
  - Kills: a hand-written mutant that initialises the previous state to `"running"` instead of "not seen" (`undefined`): (a); a hand-written mutant that also raises on the first `ok` answer when its state is terminal (`previous === undefined` treated as non-terminal): (a) and (b).
- [ ] T004 Implement TC-COMP-096 (toast title, label and link use the display vocabulary) in `web/src/app/download-toast.test.tsx`, with a `// Implements TC-COMP-096` comment (traces to DAC-E3-S7-3, AC-19).
  - **Step 1.** `it.each` over the four toasting outcomes (`succeeded`, `partial`, `abandoned`, `failed`) on `/home`, each after `running`. For the rendered toast, gather its `textContent`, every `aria-label` in it, and the accessible name of every link and button in it (for each element of `within(toastEl).getAllByRole("link")` and `getAllByRole("button")`, its `aria-label` or else its text). `forbiddenTerms` over the union is `[]`. This includes sonner's close button.
  - **Display labels, never the domain term.** The badge text is exactly the literal `Complete`, `Partial`, `Interrupted` or `Failed`; the toast's text contains none of `succeeded`, `abandoned`, `cancelled`, `partial` in lower case as a whole word (the wire states); the link's visible text is exactly `Open` and its accessible name exactly `Open Download 2026-10-15 17:31 CDT` (DEC-0338), both compared as independent literals; `SHELL_COPY.toast.open` is `"Open"` (the label lives in `copy.ts`).
  - **Non-vacuity.** `forbiddenTerms("Open run run-7")` is `["run"]`; and the scan's union for the *Partial* toast is non-empty and contains `TITLE`.
  - Kills: a hand-written mutant that renders the wire state (`download.state`) instead of `labelOf(…)` as the badge text: the lower-case check on `abandoned` / `succeeded`; a hand-written mutant whose link text is the run id (`run-7`): `forbiddenTerms` on the accessible name and the literal-text check.
- [ ] T005 Implement TC-COMP-097 (toast outcome label renders through StatusBadge with its shape) in `web/src/app/download-toast.test.tsx`, with a `// Implements TC-COMP-097` comment (traces to DAC-E3-S7-4, AC-20).
  - **Step 1.** For each toast of T004's four, the toast contains exactly one `[data-variant^="status-"]` element, whose `data-variant` is the independent literal `status-good` (*Complete*), `status-warning` (*Partial*), `status-serious` (*Interrupted*) or `status-critical` (*Failed*) — the UX brief §12.2 tiers, written out, not computed with `tierOf`; it contains exactly one `svg`, with `aria-hidden="true"`; its text is exactly the label, so the state is carried in words, not by colour alone.
  - **Not determinable.** No `[data-variant="coverage-unknown"]` element exists in any toast: every value in it is determined (Resolved Conflict 3).
  - Kills: swap-case on the badge tier (`tierOf` replaced by the toast variant mapped back, e.g. `abandoned` drawn `status-warning`): *Interrupted*'s `status-serious`; remove-attribute on the shape's `aria-hidden` (CAP-003-E1-S5's attribute; the test proves the toast goes through `StatusBadge`); a hand-written mutant that renders `<span>{label}</span>` without `StatusBadge`: the `svg` count.

### Additional Unit Tests

- [ ] T006 Write the pure transition rule's cases in `web/src/app/download-toast.test.tsx` (sequential), a `describe("completionToast")` over the exported `completionToast(previous, current, pathname)` (T010) (traces to DAC-E3-13, DAC-E3-S7-1, DAC-E3-S7-2, AC-12).
  - **(a) The full state matrix.** For every `previous` in the eight `RunState`s plus `null` (no download) and `undefined` (no answer seen yet), and every `current` in the eight plus `null`, at `/home`: the result is non-null exactly when `previous ∈ {requested, running, cancelling}` and `current.state ∈ {succeeded, partial, abandoned, failed}`. The expected set is written as a literal table of the 16 toasting pairs, not derived from the module's constants.
  - **(b) Variant per state** (literal): `succeeded` → `"success"`, `partial` → `"warning"`, `abandoned` → `"warning"`, `failed` → `"error"`; and the exported `variantOf(tier)`: `good` → `"success"`, `warning` → `"warning"`, `serious` → `"warning"`, `critical` → `"error"`, `neutral` → `null`, `active` → `null`.
  - **(c) Name.** With `started_at: null`, the result's `title` is `TITLE_REQUESTED`; with it set, `TITLE`.
  - **(d) The download identity follows the current answer** (Other Notes, register G14): `previous` `running` (of `run-7`) and `current` `download("partial", { run_id: "run-8", started_at: "2026-10-15T22:41:00Z" })` returns a toast whose `href` is `/data/downloads/run-8` and title `Download 2026-10-15 17:41 CDT`.
  - **(e) Suppression by path only.** `completionToast("running", download("partial"), "/data/downloads/run-7")` is `null`; with `"/data/downloads/run-8"` it is non-null.
  - Kills: swap-case on a member of the non-terminal set (`"cancelling"` → `"cancelled"`): (a) rows `cancelling → *` and `cancelled → *`; off-by-one/negate on `previous === undefined` handling: (a) `undefined` rows; drop-field-copy of `started_at` into the name (always `requested_at`): (c); swap-case `"good" → "success"` to `"warning"`: (b).
- [ ] T007 Write the AC-25 cases in `web/src/app/download-toast.test.tsx` (sequential) (traces to AC-25, DAC-E3-13).
  - **(a) Focus is never taken.** Render a `<button>Before</button>` beside the watcher, focus it, then step `running` → `failed`: after `findByText(TITLE)`, **Before** still `toHaveFocus()`; repeat for `partial` and `succeeded`.
  - **(b) Polite only.** For each of the three variants, `toastEl.closest("[aria-live]")` has `aria-live="polite"`; `document.querySelector('[aria-live="assertive"]')` is `null` and `screen.queryByRole("alert")` is `null` (Resolved Conflict 2).
  - **(c) Persistence.** Raise `failed`, `partial`, `abandoned` (three renders, one each) and, separately, `succeeded`; advance 10 000 ms inside `act`: the `error` and both `warning` toasts are still in the document; the `success` toast is gone.
  - Kills: a hand-written mutant that calls `toast.success` for every outcome (persistence lost): (c); a hand-written mutant that calls sonner's `toast.error(…, { important: true })` directly (assertive): (b).
- [ ] T008 Write the stability cases in `web/src/app/download-toast.test.tsx` (sequential) (traces to DAC-E3-13 "one toast", DAC-E3-S7-2).
  - **(a) Failed reads are not answers.** `running` → `failed(last)` (attention read failed, `last` holding the running answer) → `partial`: exactly one `toast.warning`. `running` → `failed(last)` → `running`: none. `failed(null)` as the very first state, then `partial`: none.
  - **(b) One toast per transition.** After `running` → `partial` on `/home`: three further `answer(download("partial"))` steps, and `go("/settings")`, `go("/research")`: the spy count stays exactly 1.
  - **(c) A suppressed transition is not raised later.** `running` → `partial` on `/data`, then `go("/home")`, then another `answer(download("partial"))`: no spy call.
  - Kills: a hand-written mutant that stores `previous = null` on an error state: (a)'s first case then raises nothing; a hand-written mutant that keeps `previous` from updating when the transition is suppressed (so the next `/home` render re-raises): (c); a hand-written mutant that drops the `previous` update after raising: (b).
- [ ] T009 Write the mount case in `web/src/app/download-toast.test.tsx` (sequential with T002–T008) — `describe("mounted by the shell")`, with `override.value = null` so the real `ShellProvider` runs (traces to DAC-E3-13, DAC-E3-S7-1).
  - Stub `fetch` by URL pathname (the CAP-003-E3-S6 `routedFetch` convention, defined locally): `/api/health` answers `{ status: "ok", database: "reachable", credential_present: true, schema_version: 4, most_recent_run: null }`; `/api/attention` answers a queue `[answer-body(download("running")), answer-body(download("partial"))]`, then the `partial` body standing; `/api/classifications/summary` and everything else answer `404` with `{"error":{"code":"not_found","message":"No resource exists at this path.","request_id":"req-404"}}`.
  - Render `<MemoryRouter initialEntries={["/no/such/page"]}><Shell /></MemoryRouter>` (`Shell` from `./shell`). After the first attention answer, `await act(() => vi.advanceTimersByTimeAsync(10_000))` (the running cadence, owner-shell §2.4): `await screen.findByText(TITLE)`; exactly one `[data-sonner-toast]` with `data-type="warning"`. Advance a further 60 000 ms: still exactly one.
  - Kills: a hand-written mutant that removes the `<DownloadToast />` line from `shell.tsx`: no toast.

**Checkpoint**: T002 to T008 and T009 exist and fail for the right reason: `./download-toast` does not exist (import error), and T009 fails because `shell.tsx` mounts no watcher. Every delivered and earlier-story test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The copy entry, then the watcher.

- [ ] T010 Add the toast's copy to `web/src/app/copy.ts` (CAP-003-E3-S6's module; DAC-E3-S7-3; DEC-0338; Resolved Conflict 1). Append one entry to `SHELL_COPY`, changing nothing else:
  - `toast: { open: "Open", openName: (name: string) => \`Open ${name}\` }`, with a doc comment citing owner-shell §2.9, DAC-E3-S7-3 and DEC-0338.
  - CAP-003-E3-S6's T003 (e) scans every leaf string of `SHELL_COPY` for the DAC-E7-3 terms; the two new strings pass it.
  - Write no length and no hex, comments included (the `web/src/app/` literal scan, CAP-003-E3-S6 T010).
- [ ] T011 Create `web/src/app/download-toast.ts` (owner-shell §2.1, §2.9; DAC-E3-13; depends on T010; makes T002 to T008 pass). The file is `.ts` as owner-shell §2.1 and the story name it, so the toast body is built with `createElement`, not JSX (Other Notes).
  - **Imports:** `createElement`, `useEffect`, `useRef` and `type ReactElement` from `"react"`; `Link`, `matchPath` and `useLocation` from `"react-router-dom"`; `type RunState` from `"../api/types"`; `formatDownloadName` from `"../components/patterns/format"`; `StatusBadge` from `"../components/patterns/status-badge"`; `labelOf`, `tierOf` and `type Tier` from `"../components/patterns/tiers"`; `toast` from `"../components/ui/toast"`; `SHELL_COPY` from `"./copy"`; `useShell` from `"./shell-context"`; `type { Attention }` from `"./shell-types"`.
  - **`const NON_TERMINAL: ReadonlySet<RunState> = new Set(["requested", "running", "cancelling"])`** (`types.ts:207`; owner-shell §2.4's non-terminal set).
  - **`export type ToastVariant = "success" | "warning" | "error"`.**
  - **`export function variantOf(tier: Tier): ToastVariant | null`** — an exhaustive `switch` with a `never` default: `good` → `"success"`; `warning`, `serious` → `"warning"`; `critical` → `"error"`; `neutral`, `active` → `null`. The doc comment states the derivation: DAC-E3-13's table (*Complete* `success`; *Partial*, *Interrupted* `warning`; *Failed* `error`; *Cancelled by you* none) over UX brief §12.2's tiers (good; warning; serious; critical; neutral), so "the toast variant follows the one tier function" (story AC-12).
  - **`export interface CompletionToast { variant: ToastVariant; title: string; label: string; tier: Tier; href: string; linkName: string }`.**
  - **`const SHOWS_OUTCOME = ["/data", "/data/downloads"] as const`** and **`function showsOutcome(pathname: string, runId: string): boolean`**: true when `matchPath({ path: p, end: true }, pathname)` matches either entry, or `matchPath({ path: "/data/downloads/:runId", end: true }, pathname)?.params.runId === runId`. `matchPath` gives the router's own matching (trailing slash, case), so a URL the route table renders as that screen is suppressed exactly when the screen renders (owner-shell §2.6, §2.9).
  - **`export function completionToast(previous: RunState | null | undefined, current: Attention["latest_download"], pathname: string): CompletionToast | null`.** Returns `null` unless `previous` is in `NON_TERMINAL`, `current` is non-null and `current.state` is not in `NON_TERMINAL`. Then `status = { of: "download", state: current.state }`, `tier = tierOf(status)`, `variant = variantOf(tier)`; `null` when `variant` is `null` or `showsOutcome(pathname, current.run_id)`. Otherwise `title = formatDownloadName(current.started_at, current.requested_at)`, `label = labelOf(status)`, `href = \`/data/downloads/${current.run_id}\``, `linkName = SHELL_COPY.toast.openName(title)`.
  - **`function CompletionBody({ label, tier, href, linkName }): ReactElement`** (private) returns `createElement("span", { className: "flex flex-wrap items-center gap-2" }, createElement(StatusBadge, { tier }, label), createElement(Link, { to: href, "aria-label": linkName, className: "underline" }, SHELL_COPY.toast.open))` — the link styling follows the delivered `as-of-line.tsx` download link.
  - **`export function useDownloadToast(): void`.**
    - `const { attention } = useShell()`; `const { pathname } = useLocation()`.
    - `previous = useRef<RunState | null | undefined>(undefined)` — `undefined` means no answer seen yet.
    - `useEffect(() => { … }, [attention, pathname])`: return unless `attention.kind === "ok"` (loading and error states never touch `previous`, so the comparison is between consecutive successful answers, as CAP-003-E3-S3's `useDataHealth` does); `const current = attention.data.latest_download`; `const spec = completionToast(previous.current, current, pathname)`; `previous.current = current?.state ?? null`; when `spec`, call `toast[spec.variant](spec.title, { description: createElement(CompletionBody, spec) })`.
    - A re-run for the same answer (a route change, or StrictMode's double mount) compares a state with itself and raises nothing; the update of `previous` happens whether or not the toast is suppressed, so a suppressed transition is never raised later.
  - **`export function DownloadToast(): null`** calls `useDownloadToast()` and returns `null`; it is what `shell.tsx` mounts.
  - **Doc comments** cite owner-shell §2.9, UX design §0.6 and §2, the toast spec §1 (*never for a result already visible*), AC-12, AC-25, DAC-E3-13, DAC-E3-S7-1 to DAC-E3-S7-4 and DEC-0338. Write no `px`, `rem` or hex anywhere, comments included.

**Checkpoint**: `npx vitest run src/app/download-toast.test.tsx` is green except T009's mount case; `npx tsc --noEmit` is clean.

---

## Phase 4: Integration

**Purpose**: Mount the watcher in the shell and confirm the change set.

- [ ] T012 Edit `web/src/app/shell.tsx` (CAP-003-E3-S6's frame; depends on T011; makes T009 pass): add `import { DownloadToast } from "./download-toast";` in the sorted import block, and `<DownloadToast />` immediately after `<Toaster />` inside the private `Frame()`. Nothing else in the file changes (CAP-003-E4-S6 later edits the same `Frame` to mount `SetupDraftProvider`; the two edits touch different lines); the comment line CAP-003-E3-S6 left ("CAP-003-E3-S7 adds the toast watcher's mount line here"), if present in the code, is removed. The delivered `shell.tokens.test.tsx` still passes (no length added).
- [ ] T013 Confirm scope and the frame's tests (depends on T012).
  - `git status --short` lists only `web/src/app/download-toast.ts`, `web/src/app/download-toast.test.tsx`, `web/src/app/copy.ts`, `web/src/app/shell.tsx`, this story's `-tasks.md`, its `-tdd-evidence.yaml` and its status line.
  - `git diff -- web/src/app/shell.tsx` shows exactly two added lines; `git diff -- web/src/app/copy.ts` shows only the `toast` entry and its comment.
  - `npx vitest run src/app/` is green, including CAP-003-E3-S6's `shell.test.tsx` (its T005 (f) vocabulary scan of the toast container), `shell.a11y.test.tsx` (its T008 (e) focus case), `count-chip.test.tsx` (its T003 (e) `SHELL_COPY` scan) and `src/components/token-literals.test.ts`.
  - `grep -rn "download-toast" web/src --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` prints only the `shell.tsx` import.

**Checkpoint**: The watcher is mounted once, beside the `Toaster`, and every suite under `web/src/` is green.

---

## Phase 5: Polish

**Purpose**: Validation, mutation and TDD evidence.

- [ ] T014 Run the constitution validation commands from the repo root: `npm run test`, `npm run lint`, `npm run format` (fix with `npx biome format --write` on this story's four files only), `npx tsc --noEmit`, `npm run build`. Then run the mutation check: `python3 scripts/mutation-run.py run` with `--command "npx vitest run src/app/download-toast.test.tsx"` over `web/src/app/download-toast.ts`, plus the hand-written mutants in Other Notes; no non-equivalent mutant may survive (traces to AC-12, AC-25, DAC-E3-13).
- [ ] T015 After each TDD cycle in T002–T014 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E3-S7-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC). The cycles are: (1) T002–T008 + T010 + T011: the watcher and its copy; (2) T009 + T012 + T013: the mount. T014 joins cycle 2's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S1 | hard | **New edge.** `download-toast.ts` imports `type { Attention }` from `web/src/app/shell-types.ts`, and the test imports `Attention` and `ReadState`. Already implied through CAP-003-E3-S3 |
| CAP-003-E4-S6 | context | Also edits `shell.tsx` (mounts `SetupDraftProvider` inside `ShellProvider`). The two edits touch different lines of `Frame`/`Shell`; whichever lands second rebases onto the other. Neither imports the other |
| CAP-003-E3-S8 | context | Owns the shell's e2e journeys; named in the Validation Plan only to say no e2e spec is this story's. Nothing is imported from it |
| CAP-003-E5-S5 | context | Registers `/home`, where DAC-E3-S7-1 sets its scenario. The tests use a `MemoryRouter` path, which needs no registration |
| CAP-003-E6-S7 | context | Registers `/data`, one of the three suppressing routes. The suppression is by path and holds before registration |

The graph's other hard edges cover the remaining imports: CAP-003-E3-S6 (`shell.tsx`, `copy.ts`), CAP-003-E3-S3 (`useShell`, `ShellContextValue`, `ShellProvider` via `Shell`), CAP-003-E1-S3 (`toast`, `Toaster`), CAP-003-E1-S5 (`tierOf`, `labelOf`, `Tier`, `StatusBadge`) and CAP-003-E1-S6 (`formatDownloadName`).

### Task Dependencies

- T001 comes first.
- T002 to T008 and T009 share `download-toast.test.tsx` and are written in sequence.
- T010 depends on T002–T008 being RED. T011 depends on T010.
- T012 depends on T011 and on T009 being RED. T013 depends on T012. T014 depends on T013.
- T015 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- None of substance: the story has one test file and one production module. T010 (`copy.ts`) can be written while T011 is drafted, but T011 imports it.

---

## Validation Plan

### Constitution-Defined Commands

From tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not this story's validation: no e2e spec covers the toast (owner-shell §7 lists none), and CAP-003-E3-S8 owns the shell's e2e journeys.

### Story-Specific Validation

- DAC-E3-S7-1 / TC-COMP-094: `npx vitest run src/app/download-toast.test.tsx -t "TC-COMP-094"` is green.
- DAC-E3-S7-2 / TC-COMP-095, DAC-E3-S7-3 / TC-COMP-096, DAC-E3-S7-4 / TC-COMP-097: the same file, all `describe` blocks green.
- AC-25: T007 green, and CAP-003-E3-S6's `shell.a11y.test.tsx` focus case still green.
- AC-26: `src/components/token-literals.test.ts` green over `web/src/app/` with the new module; `grep -nE "[0-9]+(px|rem|em)\b|#[0-9a-fA-F]{3,8}\b" web/src/app/download-toast.ts` prints nothing.
- Manual, optional (real browser, `npm run build` then the app at 127.0.0.1:8123): start a download from Data health, move to Settings; when it ends, one toast appears bottom-right with the outcome badge and *Open*; Tab reaches *Open* and the close control; `Esc` dismisses it; focus never moved on its arrival.

---

## Notes

### Resolved Conflicts

1. **The story's file list against DAC-E3-S7-3's "this component's `copy.ts`".** The Implementation section lists `download-toast.ts`, its test and one `shell.tsx` mount line; DAC-E3-S7-3 requires every label to come from `labelOf` or "this component's `copy.ts`". **Governing: the story's acceptance criterion over its Implementation list (constraint 9.1).** The two toast strings are appended to CAP-003-E3-S6's `web/src/app/copy.ts` as one `toast` entry (T010); nothing else in that file changes.
2. **Toast politeness.** The toast design-system spec §5 gives `error` and `warning` an `alert` role in an assertive region; the story's AC-25 line says toasts "MUST be announced politely", as do CAP-003-E1-S3's DAC-E1-S3-2 and component design `ui-components` §10 ("every polled change announces politely"). **Governing: the story's acceptance criterion over design-system prose.** CAP-003-E1-S3's wrapper exposes no assertive option (its Resolved Conflict 1); T007 (b) asserts the result for this story's toasts. Persistence and never taking focus are common to both sources.
3. **DAC-E3-S7-4's and TC-COMP-097's `NotDeterminable` clause has nothing to apply to.** Every value the toast shows is determined: `requested_at` is non-null on the wire (`Attention.latest_download.requested_at: string`, CAP-003-E3-S1; data-health-api §2.4), so the name always resolves; the label and tier come from a recorded terminal state; no toast is raised without one. This is the shared template clause the coverage matrix's note 7 treats as vacuous where nothing is undeterminable, as CAP-003-E3-S6 settled for the chips. T005 asserts the absence of `coverage-unknown`.
4. **Toast variant and badge tier for *Interrupted*.** DAC-E3-13 gives *Interrupted* the `warning` toast; UX brief §12.2 (CAP-003-E1-S5's `tierOf`) gives `abandoned` the `serious` tier. There is no conflict once separated: the toast has no `serious` variant, so the variant maps `serious` to `warning` (T011 `variantOf`), while the badge inside it renders the `serious` tier with its diamond (T005). Both sources are satisfied as written.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0338.**
   - **What is undetermined.** DAC-E3-13 and DAC-E3-S7-1 say the toast "reads *Download {start time}* with its label" and "links to `/data/downloads/{id}`". No artifact fixes how the three parts are composed in the toast, or the link's text. CAP-003-E1-S3's toast API (DEC-0302) takes a plain-string message plus an optional `description` or `action`.
   - **What the plan adopts (T004, T010, T011).** The message is the name, `formatDownloadName(started_at, requested_at)`. The `description` holds the `StatusBadge` (label from `labelOf`, tier from `tierOf`) and a `Link` to `/data/downloads/{run_id}` whose visible text is *Open* and whose accessible name is *Open {name}* (e.g. *Open Download 2026-10-15 17:31 CDT*). Both strings live in `SHELL_COPY.toast` (`open`, `openName`).
   - **Derivation.** The toast spec §3 anatomy (message, optional description) and §7 (the message names the object); the delivered CAP-002 precedent for a link to a download — `as-of-line.tsx` and `set-history-dialog.tsx` give the link an `aria-label` *Open the download started {time}* (`research/copy.ts:504`) — adapted to the permanent download name of capability OQ-1 so the label stays true when only `requested_at` exists; WCAG 2.5.3 (the visible *Open* begins the accessible name); a link, not sonner's `action` button, because DAC-E3-13 says "linking" and an `<a href>` is what a link is.
   - **Alternatives rejected.** Sonner's `action` (a button calling `navigate`): not a link, and no `href` to open in a new tab. The whole title as the link: the wrapper's `message` is a `string`, and widening it changes CAP-003-E1-S3's provisional API. Link text equal to the name: repeats the title in the same toast.
   - **Scope.** Contained: only this story's toast reads `SHELL_COPY.toast`.
   - **Owning design to absorb it:** owner-shell §2.9 (and UX design §0.6's component mapping) at its next revision.

### Other Notes

- **The download identity (register G14) is derived, not decided.** DAC-E3-13 compares `latest_download.state` "between two attention answers"; the rule implemented is the literal one over consecutive *successful* answers, and it names and links the download in the current answer. `run_id` is not compared. This follows the same reading CAP-003-E3-S3's `useDataHealth` uses for the same transition, and it gives the right outcome in each case: run A `running` then run B terminal means B ended while the owner was elsewhere, so B is toasted; run A `running` then run B `requested` or `running` shows no terminal state, so nothing is toasted, and A's outcome is shown on Data health and Downloads. A failed attention read is not an answer and leaves the previous state untouched (T008 (a)). T006 (d) pins the identity rule.
- **`.ts`, not `.tsx`.** Owner-shell §2.1 and the story name the file `download-toast.ts`; the toast body is two elements, built with `createElement`. `shell.tsx` mounts `<DownloadToast />`, a component returning `null`, beside `<Toaster />` as the story asks ("mounted from `shell.tsx` beside the `Toaster`").
- **Router context.** The toast body renders a `Link`; sonner renders toasts inside the `Toaster`'s React tree, which CAP-003-E3-S6 mounts inside the router (`main.tsx`'s `BrowserRouter`), so the link resolves. The tests mount `Toaster` inside `MemoryRouter` for the same reason.
- **Routes not yet registered.** `/home` (CAP-003-E5-S5) and `/data` (CAP-003-E6-S7) render `NotFound` at this story. The watcher and the tests use paths, not registrations, so neither is a prerequisite.
- **`/setup` and Home still toast.** DAC-E3-13 names exactly three suppressing routes; setup and Home show a download's progress, not its recorded outcome badge, so the plan adds no route to the list.
- **Spying on `toast`.** T002–T008 `vi.spyOn` the methods of CAP-003-E1-S3's `toast` object. If that object is frozen, replace the spies with the DOM count of `[data-sonner-toast]` after advancing 500 ms; every "none" assertion already includes that count.
- **Hand-written mutants** for the mutation run (T014):
  - `web/src/app/download-toast.ts`: `useRef<RunState | null | undefined>(undefined)` → `useRef<RunState | null | undefined>("running")`, killed by T003 (a).
  - `web/src/app/download-toast.ts`: `if (attention.kind !== "ok") return;` → `if (attention.kind === "error") { previous.current = null; return; }` placed before the `ok` check, killed by T008 (a).
  - `web/src/app/download-toast.ts`: move `previous.current = …` after an early `return` when `spec` is `null`, killed by T008 (c).
  - `web/src/app/download-toast.ts`: `createElement(StatusBadge, { tier }, label)` → `createElement("span", null, label)`, killed by T005.
  - `web/src/app/download-toast.ts`: `label = labelOf(status)` → `label = current.state`, killed by T004.
  - `web/src/app/download-toast.ts`: `case "serious": return "warning";` → `return "error";`, killed by T002 (c) and T006 (b).
  - `web/src/app/shell.tsx`: delete `<DownloadToast />`, killed by T009.
- **Equivalent-mutant risk.** Swapping the order of `"/data"` and `"/data/downloads"` in `SHOWS_OUTCOME`, or of `<Toaster />` and `<DownloadToast />` in `Frame`, is unobservable; record either as equivalent if the generator produces it.
